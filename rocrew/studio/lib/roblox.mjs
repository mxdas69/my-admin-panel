// Public Roblox web APIs (no key needed) for Market intel and live numbers,
// plus Open Cloud asset upload (needs your API key) for the Library.

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UA = { "user-agent": "RoCrew/0.1 (+local agent studio)", accept: "application/json" };
// Charts that answer when asked directly, including genre charts get-sorts doesn't always list.
export const MAIN_SORTS = ["top-trending", "up-and-coming", "top-playing-now", "top-earning", "top-revisited", "fun-with-friends", "top-rated", "most-popular"];
export const GENRE_SORTS = [
  "trending-in-simulation", "trending-in-survival", "trending-in-action", "trending-in-rpg", "trending-in-shooter", "trending-in-strategy",
  "trending-in-sports-and-racing", "trending-in-roleplay-and-avatar-sim", "trending-in-party-and-casual", "trending-in-obby-and-platformer",
  "trending-in-puzzle", "trending-in-shopping", "trending-in-entertainment",
];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

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

/** One snapshot of the Roblox charts: { at, sorts: { [sortId]: { name, genre, games: [...] } } }. */
export async function fetchCharts({ perSort = 30, gapMs = 1300 } = {}) {
  const sessionId = randomUUID();
  const base = "https://apis.roblox.com/explore-api/v1";
  const names = {};
  try {
    const list = await getJson(`${base}/get-sorts?sessionId=${sessionId}&device=all&country=all`);
    for (const s of list.sorts ?? []) if (s.sortId) names[s.sortId] = s.sortDisplayName ?? s.sortId;
  } catch {}
  const snapshot = { at: Date.now(), sorts: {} };
  const errors = [];
  for (const sortId of [...MAIN_SORTS, ...GENRE_SORTS]) {
    try {
      const content = await getJson(`${base}/get-sort-content?sessionId=${sessionId}&sortId=${sortId}&device=all&country=all`);
      const games = (content.games ?? []).slice(0, perSort).map((g, i) => ({
        rank: i + 1,
        universeId: g.universeId,
        placeId: g.rootPlaceId ?? null,
        name: g.name,
        players: g.playerCount ?? 0,
        up: g.totalUpVotes ?? 0,
        down: g.totalDownVotes ?? 0,
        ...(g.isSponsored ? { sponsored: true } : {}),
      }));
      if (games.length) snapshot.sorts[sortId] = { name: names[sortId] ?? prettySort(sortId), genre: sortId.startsWith("trending-in-") ? prettySort(sortId.slice(12)) : null, games };
    } catch (err) {
      errors.push(err.message);
      if (/429/.test(err.message)) await pause(15000);
    }
    await pause(gapMs);
  }
  if (!Object.keys(snapshot.sorts).length) throw new Error(`Roblox's charts didn't answer${errors[0] ? `: ${errors[0]}` : ""}. Roblox may have changed them; Pulse can still research with web search.`);
  return snapshot;
}

function prettySort(id) {
  if (id === "rpg") return "RPG";
  return id.replace(/-/g, " ").replace(/\b(and)\b/g, "&").replace(/^\w/, (c) => c.toUpperCase());
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
      if (g.sponsored) continue;
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
        if (g.sponsored) continue;
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

/**
 * Where a new game can break in: for each genre chart, how many of its games are young,
 * how big they are, how well liked, and whether the chart is moving. A genre where young
 * games hold chart spots with good ratings is an opening; one held by years-old giants isn't.
 */
export function openings(snapshots, details) {
  const now = snapshots.at(-1);
  if (!now) return [];
  const prev = snapshots.at(-2);
  const out = [];
  for (const [sortId, sort] of Object.entries(now.sorts)) {
    if (!sort.genre) continue;
    const games = sort.games.filter((g) => !g.sponsored).map((g) => ({ ...g, ...(details[g.universeId] ?? {}) }));
    if (!games.length) continue;
    const ages = games.map((g) => (g.created ? (Date.now() - Date.parse(g.created)) / 86400000 : null));
    const young = games.filter((g, i) => ages[i] !== null && ages[i] < 120);
    const players = games.map((g) => g.players).sort((a, b) => a - b);
    const median = players[Math.floor(players.length / 2)] ?? 0;
    const likes = games.filter((g) => g.up + g.down > 50).map((g) => g.up / (g.up + g.down));
    const before = new Set((prev?.sorts[sortId]?.games ?? []).map((g) => g.universeId));
    const newcomers = prev ? games.filter((g) => !before.has(g.universeId)).length : null;
    const youngShare = young.length / games.length;
    const score = Math.round((youngShare * 60 + Math.min(1, Math.log10(Math.max(median, 1)) / 4) * 25 + (newcomers ? Math.min(newcomers / games.length, 0.5) * 30 : 0)) * 10) / 10;
    out.push({
      sortId,
      genre: sort.genre,
      games: games.length,
      medianPlayers: median,
      youngShare: Math.round(youngShare * 100),
      newcomers,
      avgLikePct: likes.length ? Math.round((likes.reduce((a, b) => a + b, 0) / likes.length) * 1000) / 10 : null,
      score,
      examples: young.sort((a, b) => b.players - a.players).slice(0, 3).map((g) => ({ universeId: g.universeId, name: g.name, players: g.players, ageDays: g.created ? Math.round((Date.now() - Date.parse(g.created)) / 86400000) : null })),
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Everything public about one game, for sizing up a format: numbers, like ratio, how it
 * monetizes (pass and product price ladders), badge activity (a rough new-players-per-day
 * signal), similar games, and two weeks of player counts from RoMonitor when it answers.
 */
export async function gameDeepDive(id) {
  let universeId = String(id).replace(/\D/g, "");
  let g = (await fetchDetails([universeId]))[universeId];
  if (!g) {
    const u = await getJson(`https://apis.roblox.com/universes/v1/places/${universeId}/universe`).catch(() => null);
    if (u?.universeId) {
      universeId = String(u.universeId);
      g = (await fetchDetails([universeId]))[universeId];
    }
  }
  if (!g) throw new Error(`No Roblox game found for ${id} (tried it as a universe id and a place id).`);
  const tryJson = (url) => getJson(url).catch((err) => ({ error: err.message }));
  const [passes, products, badges, similar] = await Promise.all([
    tryJson(`https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?passView=Full&pageSize=100`),
    tryJson(`https://apis.roblox.com/developer-products/v2/universes/${universeId}/developerproducts?limit=100`),
    tryJson(`https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`),
    tryJson(`https://games.roblox.com/v1/games/recommendations/game/${universeId}?maxRows=12`),
  ]);
  const end = new Date();
  const start = new Date(end - 13 * 86400000);
  const ccu = await tryJson(`https://romonitorstats.com/api/v1/charts/get?name=ccus&timeslice=day&placeId=${g.placeId}&start=${start.toISOString()}&ends=${end.toISOString()}`);
  const series = Array.isArray(ccu) ? Object.entries(ccu[0]?.data ?? {}).map(([day, n]) => ({ day: day.slice(0, 10), players: Math.round(n) })) : [];
  return {
    ...g,
    likePct: g.up + g.down ? Math.round((g.up / (g.up + g.down)) * 1000) / 10 : null,
    ageDays: g.created ? Math.round((Date.now() - Date.parse(g.created)) / 86400000) : null,
    favoritesPer1kVisits: g.visits ? Math.round((g.favorites / g.visits) * 10000) / 10 : null,
    passes: (passes.gamePasses ?? []).map((p) => ({ name: p.displayName ?? p.name, price: p.price ?? null })).sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9)),
    products: (products.developerProducts ?? []).map((p) => ({ name: p.Name, price: p.PriceInRobux ?? null })).sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9)),
    badges: (badges.data ?? []).slice(0, 12).map((b) => ({ name: b.name, pastDay: b.statistics?.pastDayAwardedCount ?? null, total: b.statistics?.awardedCount ?? null })),
    similar: (similar.games ?? []).map((s) => ({ universeId: s.universeId, name: s.name, players: s.playerCount })),
    playersLast14Days: series,
    notes: [passes.error && `passes: ${passes.error}`, products.error && `products: ${products.error}`, badges.error && `badges: ${badges.error}`, ccu.error && "player history: RoMonitor didn't answer"].filter(Boolean),
  };
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
