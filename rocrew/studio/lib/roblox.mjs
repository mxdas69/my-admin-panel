// Public Roblox web APIs (no key needed) for Market intel and live numbers,
// plus Open Cloud asset upload (needs your API key) for the Library.

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UA = { "user-agent": "RoCrew/0.1 (+local agent studio)", accept: "application/json" };
const WANTED_SORTS = /trending|up-and-coming|up_and_coming|top-playing|top-earning|top-rated|popular/i;

async function getJson(url, { timeoutMs = 15000, headers = {} } = {}) {
  const res = await fetch(url, { headers: { ...UA, ...headers }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${new URL(url).host}${new URL(url).pathname}`);
  return res.json();
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** One snapshot of the Roblox charts: { at, sorts: { [sortId]: { name, games: [...] } } }. */
export async function fetchCharts({ perSort = 40 } = {}) {
  const sessionId = randomUUID();
  const base = "https://apis.roblox.com/explore-api/v1";
  const sortList = await getJson(`${base}/get-sorts?sessionId=${sessionId}&device=computer&country=all`);
  const sorts = (sortList.sorts ?? []).filter((s) => s.sortId && WANTED_SORTS.test(s.sortId) && (s.contentType ?? "Games") === "Games");
  if (!sorts.length) throw new Error("The charts API answered but listed no game sorts. Roblox may have changed it.");

  const snapshot = { at: Date.now(), sorts: {} };
  for (const sort of sorts.slice(0, 6)) {
    const content = await getJson(
      `${base}/get-sort-content?sessionId=${sessionId}&sortId=${encodeURIComponent(sort.sortId)}&device=computer&country=all`,
    );
    const games = (content.games ?? []).slice(0, perSort).map((g, i) => ({
      rank: i + 1,
      universeId: g.universeId,
      placeId: g.rootPlaceId ?? null,
      name: g.name,
      players: g.playerCount ?? 0,
      up: g.totalUpVotes ?? 0,
      down: g.totalDownVotes ?? 0,
    }));
    snapshot.sorts[sort.sortId] = { name: sort.sortDisplayName ?? sort.sortId, games };
  }
  return snapshot;
}

/** Visits, creation date, genre etc. for up to a few hundred universes. */
export async function fetchDetails(universeIds) {
  const out = {};
  for (const ids of chunk([...new Set(universeIds)].filter(Boolean), 50)) {
    const [info, votes, icons] = await Promise.all([
      getJson(`https://games.roblox.com/v1/games?universeIds=${ids.join(",")}`),
      getJson(`https://games.roblox.com/v1/games/votes?universeIds=${ids.join(",")}`).catch(() => ({ data: [] })),
      getJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids.join(",")}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`).catch(() => ({ data: [] })),
    ]);
    for (const g of info.data ?? []) {
      out[g.id] = {
        universeId: g.id,
        placeId: g.rootPlaceId,
        name: g.name,
        playing: g.playing ?? 0,
        visits: g.visits ?? 0,
        favorites: g.favoritedCount ?? 0,
        created: g.created,
        updated: g.updated,
        genre: g.genre ?? "",
        creator: g.creator?.name ?? "",
      };
    }
    for (const v of votes.data ?? []) if (out[v.id]) Object.assign(out[v.id], { up: v.upVotes, down: v.downVotes });
    for (const i of icons.data ?? []) if (out[i.targetId]) out[i.targetId].icon = i.imageUrl;
  }
  return out;
}

/** Rank moves between the two most recent snapshots. */
export function velocity(snapshots) {
  if (snapshots.length < 2) return [];
  const [prev, now] = snapshots.slice(-2);
  const moves = [];
  for (const [sortId, sort] of Object.entries(now.sorts)) {
    const before = new Map((prev.sorts[sortId]?.games ?? []).map((g) => [g.universeId, g]));
    for (const g of sort.games) {
      const old = before.get(g.universeId);
      moves.push({
        sortId,
        sortName: sort.name,
        universeId: g.universeId,
        name: g.name,
        rankDelta: old ? old.rank - g.rank : null,
        playersDelta: old ? g.players - old.players : null,
        isNew: !old,
      });
    }
  }
  return moves.filter((m) => m.isNew || m.rankDelta).sort((a, b) => (b.rankDelta ?? 99) - (a.rankDelta ?? 99)).slice(0, 12);
}

/** Young games pulling real players: under maxVisits total visits, over minPlayers now, seen in the last 7 days. */
export function breakouts(snapshots, details, { maxVisits = 300000, minPlayers = 500 } = {}) {
  const weekAgo = Date.now() - 7 * 86400000;
  const seen = new Map();
  for (const snap of snapshots.filter((s) => s.at >= weekAgo)) {
    for (const sort of Object.values(snap.sorts)) {
      for (const g of sort.games) {
        const prev = seen.get(g.universeId);
        if (!prev || g.players > prev.peak) seen.set(g.universeId, { ...g, peak: g.players, firstSeen: prev?.firstSeen ?? snap.at });
        else prev.players = g.players;
      }
    }
  }
  return [...seen.values()]
    .map((g) => ({ ...g, ...details[g.universeId] }))
    .filter((g) => (g.visits ?? Infinity) < maxVisits && g.peak > minPlayers)
    .map((g) => ({
      ...g,
      ageDays: g.created ? Math.round((Date.now() - Date.parse(g.created)) / 86400000) : null,
      per1kVisits: g.visits ? Math.round((g.peak / g.visits) * 1000 * 10) / 10 : null,
      likePct: g.up + g.down ? Math.round((g.up / (g.up + g.down)) * 1000) / 10 : null,
    }))
    .sort((a, b) => b.peak - a.peak);
}

/** Live numbers for one of your own games. */
export async function liveNumbers(universeId) {
  const d = await fetchDetails([universeId]);
  const g = d[universeId];
  if (!g) throw new Error(`Roblox returned nothing for universe ${universeId}.`);
  return { ...g, likePct: g.up + g.down ? Math.round((g.up / (g.up + g.down)) * 1000) / 10 : null, at: Date.now() };
}

/** Upload an image to Roblox as a Decal with Open Cloud. Returns the new asset id. */
export async function uploadDecal({ apiKey, creatorType, creatorId, file, name, description = "Made with RoCrew" }) {
  if (!apiKey) throw new Error("Add your Roblox Open Cloud API key in Settings first.");
  if (!creatorId) throw new Error("Add your Roblox user or group id in Settings first.");
  const bytes = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".bmp": "image/bmp", ".tga": "image/tga" }[ext];
  if (!type) throw new Error("Roblox decals must be .png, .jpg, .bmp or .tga.");

  const creator = creatorType === "group" ? { groupId: String(creatorId) } : { userId: String(creatorId) };
  const form = new FormData();
  form.append("request", JSON.stringify({ assetType: "Decal", displayName: name.slice(0, 50), description, creationContext: { creator } }));
  form.append("fileContent", new Blob([bytes], { type }), path.basename(file));

  const res = await fetch("https://apis.roblox.com/assets/v1/assets", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Open Cloud upload failed (${res.status}): ${body.message ?? JSON.stringify(body)}`);

  let op = body;
  for (let i = 0; i < 20 && !op.done; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const opId = String(op.operationId ?? op.path ?? "").split("/").pop();
    const poll = await fetch(`https://apis.roblox.com/assets/v1/operations/${opId}`, { headers: { "x-api-key": apiKey } });
    op = await poll.json();
  }
  const assetId = op.response?.assetId;
  if (!assetId) throw new Error("Roblox accepted the upload but has not finished processing it. Check Creator Hub in a minute.");
  return String(assetId);
}
