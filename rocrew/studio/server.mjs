#!/usr/bin/env node
// RoCrew agent studio: serves the app and runs the crew on Claude Code.
//   node studio/server.mjs            -> http://localhost:4600

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Store } from "./lib/db.mjs";
import { Config } from "./lib/config.mjs";
import { Crew, slugify } from "./lib/crew.mjs";
import { AGENTS, isAgent } from "./lib/agents.mjs";
import { probeClaude, runClaude } from "./lib/claude.mjs";
import { presetTable } from "./lib/models.mjs";
import { fetchCharts, fetchDetails, velocity, breakouts, openings, gameDeepDive, topStoreArt, searchGames, saveGameArt, liveNumbers, uploadDecal } from "./lib/roblox.mjs";
import { generateImage, askGemini } from "./lib/gemini.mjs";
import { RemoteControl } from "./lib/remote.mjs";
import { RobloxBrowser } from "./lib/robloxBrowser.mjs";
import { makeStoreArt } from "./lib/storeArt.mjs";
import { HiddenBlender } from "./lib/blender.mjs";
import { Updater } from "./lib/updater.mjs";

const blender = new HiddenBlender();

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.env.ROCREW_ROOT ?? path.join(HERE, ".."));
const DATA = path.resolve(process.env.ROCREW_DATA ?? path.join(ROOT, ".rocrew"));
const MEDIA = path.join(DATA, "media");
const PUBLIC = path.join(HERE, "public");
const VAULT = path.join(ROOT, "vault");
fs.mkdirSync(MEDIA, { recursive: true });

const config = new Config(path.join(DATA, "config.json"));
const store = new Store(path.join(DATA, "db.json"));
const crew = new Crew({ store, config, root: ROOT });
if (!fs.existsSync(store.marketFile)) store.saveMarket(); // move market data out of db.json once
// A stable secret, so a phone bookmark of the private link keeps working across restarts.
const TOKEN_FILE = path.join(DATA, "token");
const TOKEN = fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, "utf8").trim() : randomBytes(24).toString("hex");
fs.writeFileSync(TOKEN_FILE, TOKEN, { mode: 0o600 });
let connections = { checkedAt: null, claude: null };

// Remote Control guests only exist while it's on; a restart turns it off.
store.data.people = (store.data.people ?? []).filter((p) => !p.remote);
const remote = new RemoteControl({
  file: path.join(DATA, "remote.json"),
  binDir: path.join(DATA, "bin"),
  port: () => port,
  ownerName: () => config.get().ownerName,
  relayUrl: process.env.ROCREW_RELAY_URL ?? null,
  guests: {
    add(name) {
      const p = { id: store.id("u"), name, token: randomBytes(24).toString("hex"), createdAt: Date.now(), remote: true };
      store.data.people.push(p);
      store.save();
      return p;
    },
    remove(id) {
      store.data.people = (store.data.people ?? []).filter((p) => p.id !== id);
      store.save();
      closeClientsFor(id);
    },
  },
  ...(process.env.ROCREW_FAKE_TUNNEL ? { tunnel: fakeTunnel() } : {}),
});
remote.on("change", () => crew.changed("remote"));
const updater = new Updater({ root: ROOT, dataDir: DATA });

const robloxBrowser = new RobloxBrowser({ dir: path.join(DATA, "browser"), getShow: () => config.get().robloxBrowser?.visible });
robloxBrowser.onChange = () => crew.changed("roblox");
crew.browserTool = {
  available: () => robloxBrowser.status.signedIn && Boolean(robloxBrowser.browser()),
  accountName: () => robloxBrowser.status.name,
  mcpConfig: () => robloxBrowser.mcpConfig(),
};

/** For tests: a "tunnel" that is just this computer's own address. */
function fakeTunnel() {
  return { onExit: null, find: () => "fake", canInstall: () => false, install: async () => {}, start: async (p) => `http://127.0.0.1:${p}`, stop() {} };
}

// ---------- helpers ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, body, headers = {}) {
  const isBuffer = Buffer.isBuffer(body);
  const payload = isBuffer || typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": isBuffer || typeof body === "string" ? headers["content-type"] ?? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers,
  });
  res.end(payload);
}

async function readJson(req, limit = 1_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "Request too large.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Body must be JSON.");
  }
}

function same(a, b) {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Who a token belongs to: the owner, an invited person, or nobody. */
function personFor(token) {
  if (!token) return null;
  if (same(token, TOKEN)) return { id: "owner", name: config.get().ownerName || "You", owner: true };
  const p = (store.data.people ?? []).find((x) => same(token, x.token));
  return p ? { id: p.id, name: p.name, owner: false, remote: Boolean(p.remote) } : null;
}

function requestToken(req, url) {
  return req.headers["x-rocrew-token"] ?? url.searchParams.get("token") ?? "";
}

function tokenOk(req, url) {
  const person = personFor(requestToken(req, url));
  if (person && !person.owner) {
    const p = store.data.people.find((x) => x.id === person.id);
    if (p && Date.now() - (p.lastSeenAt ?? 0) > 60000) p.lastSeenAt = Date.now();
    if (p?.remote) remote.guestSeen(p.id);
  }
  return Boolean(person);
}

/** The name to credit for an action ("owner" for you, a friend's name for them). */
function personName(req) {
  const person = personFor(requestToken(req, new URL(req.url, "http://x")));
  return !person || person.owner ? "owner" : person.name;
}

// Whether the running server listens beyond this computer (settings changes apply after a restart).
const lanMode = () => !["127.0.0.1", "localhost"].includes(host);

// Every API call needs a token, so any Host is fine (this is what makes tunnels work);
// only a browser on this computer, at localhost, is handed the owner's token without a link.
function hostOk() {
  return true;
}

function isLocalBrowser(req) {
  const loopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
  const hostName = String(req.headers.host ?? "").replace(/:\d+$/, "");
  return loopback && ["localhost", "127.0.0.1", "[::1]"].includes(hostName) && !req.headers["x-forwarded-for"] && !req.headers["cf-connecting-ip"];
}

/** Addresses this computer can be reached on: home network, and Tailscale if it's installed. */
function networkAddresses() {
  const out = [];
  for (const [iface, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list ?? []) {
      if (a.family !== "IPv4" || a.internal) continue;
      const [x, y] = a.address.split(".").map(Number);
      const kind = x === 100 && y >= 64 && y <= 127 ? "tailscale" : "home network";
      out.push({ address: a.address, kind, iface });
    }
  }
  return out.sort((a, b) => (a.kind === "tailscale" ? -1 : 1) - (b.kind === "tailscale" ? -1 : 1));
}

function linkFor(token) {
  if (!lanMode()) return null;
  return networkAddresses().map((n) => ({ ...n, url: `http://${n.address}:${port}/?key=${token}` }));
}

function phoneUrl() {
  return linkFor(TOKEN)?.find((l) => l.kind === "home network")?.url ?? linkFor(TOKEN)?.[0]?.url ?? null;
}

/** Resolve `rel` inside `base`, refusing anything that escapes it. */
function inside(base, rel) {
  const target = path.resolve(base, rel);
  const relative = path.relative(base, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new HttpError(400, "Path is outside the project.");
  return target;
}

/** Copy a project file (or a data: URL) into .rocrew/media and return its media name. */
function ingest(fileOrDataUrl, hint = "file") {
  const stamp = `${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  const m = /^data:(image\/(png|jpeg|webp|gif));base64,(.+)$/.exec(fileOrDataUrl ?? "");
  if (m) {
    const name = `${stamp}-${slugify(hint) || "paste"}.${m[2] === "jpeg" ? "jpg" : m[2]}`;
    fs.writeFileSync(path.join(MEDIA, name), Buffer.from(m[3], "base64"));
    return name;
  }
  const src = path.isAbsolute(fileOrDataUrl) ? fileOrDataUrl : path.join(ROOT, fileOrDataUrl);
  if (!fs.existsSync(src)) throw new HttpError(400, `File not found: ${fileOrDataUrl}`);
  const name = `${stamp}-${path.basename(src).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  fs.copyFileSync(src, path.join(MEDIA, name));
  return name;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
let ffmpegOk = null;
function hasFfmpeg() {
  if (ffmpegOk !== null) return Promise.resolve(ffmpegOk);
  return new Promise((resolve) => execFile("ffmpeg", ["-version"], { windowsHide: true }, (err) => resolve((ffmpegOk = !err))));
}

/** For a video, write a 3x2 sheet of frames next to it so agents (who can read images, not video) can see it. */
async function frameSheet(mediaName) {
  if (!VIDEO_EXT.test(mediaName) || !(await hasFfmpeg())) return null;
  const src = path.join(MEDIA, mediaName);
  const out = path.join(MEDIA, `${mediaName}.frames.jpg`);
  return new Promise((resolve) => {
    execFile("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], { windowsHide: true }, (err, stdout) => {
      const dur = Math.max(1, Number.parseFloat(stdout) || 6);
      const args = ["-y", "-loglevel", "error", "-i", src, "-vf", `fps=6/${dur.toFixed(2)},scale=480:-1,tile=3x2`, "-frames:v", "1", out];
      execFile("ffmpeg", args, { windowsHide: true, timeout: 60000 }, (e) => resolve(e ? null : out));
    });
  });
}

async function describeMedia(names) {
  const out = [];
  for (const name of names) out.push({ media: name, path: path.join(MEDIA, name), frames: await frameSheet(name) });
  return out;
}

function attachImages(text, images = []) {
  if (!images.length) return text;
  const files = images.slice(0, 6).map((img, i) => path.join(MEDIA, ingest(img, `shot-${i + 1}`)));
  return `${text}\n\nAttached screenshot(s) — open them with the Read tool:\n${files.map((f) => `- ${f}`).join("\n")}`;
}

function vaultPages() {
  if (!fs.existsSync(VAULT)) return [];
  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const text = fs.readFileSync(full, "utf8");
        const list = (re) => (re.exec(text)?.[1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
        pages.push({
          path: path.relative(VAULT, full).split(path.sep).join("/"),
          title: entry.name.replace(/\.md$/, ""),
          folder: path.relative(VAULT, dir).split(path.sep).join("/"),
          readers: list(/^(?:read_by|for):\s*\[?([^\]\n]*)\]?/m),
          skimmers: list(/^also:\s*\[?([^\]\n]*)\]?/m),
          lines: text.split("\n").length,
          words: text.split(/\s+/).filter(Boolean).length,
        });
      }
    }
  };
  walk(VAULT);
  return pages;
}

function marketView() {
  const m = store.data.market;
  const latest = m.snapshots.at(-1) ?? null;
  return {
    fetchedAt: m.fetchedAt,
    error: m.error,
    snapshots: m.snapshots.length,
    latest,
    previousAt: m.snapshots.at(-2)?.at ?? null,
    moves: velocity(m.snapshots),
    breakouts: breakouts(m.snapshots, m.details),
    openings: openings(m.snapshots, m.details),
    corpus: m.corpus.map((id) => m.details[id] ?? { universeId: id, name: `Universe ${id}` }),
    details: m.details,
  };
}

async function refreshMarket() {
  const m = store.data.market;
  try {
    const snap = await fetchCharts();
    m.snapshots.push(snap);
    if (m.snapshots.length > 60) m.snapshots.splice(0, m.snapshots.length - 60);
    const ids = new Set([...m.corpus]);
    for (const sort of Object.values(snap.sorts)) for (const g of sort.games) ids.add(g.universeId);
    Object.assign(m.details, await fetchDetails([...ids]));
    m.fetchedAt = Date.now();
    m.error = null;
  } catch (err) {
    m.error = `${err.message}${err.cause ? ` (${err.cause.code ?? err.cause.message})` : ""}`;
  }
  m.triedAt = Date.now();
  store.saveMarket();
  crew.changed();
  return marketView();
}

function blenderEnabled() {
  try {
    return Boolean(JSON.parse(fs.readFileSync(path.join(ROOT, ".mcp.json"), "utf8")).mcpServers?.blender);
  } catch {
    return false;
  }
}

function setBlender(enabled) {
  const file = path.join(ROOT, ".mcp.json");
  let json = { mcpServers: {} };
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}
  json.mcpServers ??= {};
  if (enabled) json.mcpServers.blender = { command: "uvx", args: ["blender-mcp"] };
  else delete json.mcpServers.blender;
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  if (enabled) blender.start();
  else blender.stop();
}

async function checkConnections() {
  const claude = await probeClaude(config.get().claudeCommand, ROOT);
  if (claude.servers.length) store.data.mcpServers = [...new Set([...store.data.mcpServers, ...claude.servers.map((s) => s.name)])];
  connections = { checkedAt: Date.now(), claude };
  crew.changed();
  return connectionsView();
}

function connectionsView() {
  const cfg = config.public();
  const servers = connections.claude?.servers ?? [];
  return {
    checkedAt: connections.checkedAt,
    claude: connections.claude ? { installed: connections.claude.installed, version: connections.claude.version } : null,
    servers,
    studio: servers.find((s) => /roblox|studio/i.test(s.name) && s.name !== "roblox-browser") ?? null,
    blender: { enabled: blenderEnabled(), server: servers.find((s) => /blender/i.test(s.name)) ?? null },
    gemini: { keySet: cfg.gemini.apiKeySet, imageModel: cfg.gemini.imageModel, textModel: cfg.gemini.textModel },
    roblox: { keySet: cfg.roblox.openCloudKeySet, creatorId: cfg.roblox.creatorId, creatorType: cfg.roblox.creatorType },
  };
}

function stateView(req) {
  const db = store.data;
  const me = personFor(requestToken(req, new URL(req.url, "http://x")));
  return {
    owner: config.get().ownerName,
    me: me ? { name: me.name, owner: me.owner, remote: Boolean(me.remote) } : null,
    people: (db.people ?? []).filter((p) => !p.remote).map((p) => ({ name: p.name, lastSeenAt: p.lastSeenAt ?? null })),
    remote: remote.view(Boolean(me?.owner)),
    paused: db.paused,
    agents: AGENTS,
    statuses: crew.agentStatuses(),
    studioHolder: crew.studioHolder ? db.tasks.find((t) => t.id === crew.studioHolder)?.agent ?? null : null,
    games: db.games,
    tasks: db.tasks.slice(-400),
    reviews: db.reviews,
    asks: db.asks,
    pitches: db.pitches,
    feed: db.feed.slice(-120),
    library: db.library,
    lastChangeAt: lastChangeAt,
    permissionMode: config.get().permissionMode,
    usage: db.usage ?? null,
    usageHold: crew.usageHold(),
    usageCeilingPct: config.get().usageCeilingPct,
    update: me?.owner ? updater.view() : null,
    roblox: me?.owner ? robloxBrowser.view() : { signedIn: robloxBrowser.status.signedIn },
    connections: connectionsView(),
  };
}

// ---------- live updates ----------

const clients = new Set();

/** Cut off a person's live updates the moment their access ends. */
function closeClientsFor(personId) {
  for (const res of clients) {
    if (res.personId === personId) {
      clients.delete(res);
      res.end();
    }
  }
}
let lastChangeAt = Date.now();
// Recent events for long-polling clients. Cloudflare's quick tunnels (Remote Control) don't
// pass event streams through, so browsers coming in that way ask for changes instead.
const recent = [];
let eventSeq = 0;
const waiters = new Set();
crew.on("change", (e) => {
  lastChangeAt = Date.now();
  const data = `data: ${JSON.stringify(e)}\n\n`;
  for (const res of clients) res.write(data);
  recent.push({ seq: ++eventSeq, e });
  if (recent.length > 200) recent.shift();
  for (const w of waiters) w();
});
setInterval(() => {
  for (const res of clients) res.write(": ping\n\n");
}, 25000).unref();

// ---------- routes ----------

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });
const need = (cond, msg) => {
  if (!cond) throw new HttpError(400, msg);
};

route("GET", /^\/api\/state$/, (req) => stateView(req));
route("GET", /^\/api\/agents\/([\w-]+)\/messages$/, (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  return store.data.messages.filter((m) => m.agent === id).slice(-300);
});
route("POST", /^\/api\/lead\/message$/, async (req) => {
  const { text, images } = await readJson(req, 25_000_000);
  need(text?.trim(), "Say something to the Lead.");
  return crew.ownerToLead(attachImages(text.trim(), images), personName(req));
});
route("POST", /^\/api\/agents\/([\w-]+)\/message$/, async (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  const { text, images } = await readJson(req, 25_000_000);
  need(text?.trim(), "Write a message first.");
  const by = personName(req);
  return id === "lead" ? crew.ownerToLead(attachImages(text.trim(), images), by) : crew.ownerToAgent(id, attachImages(text.trim(), images), by);
});
route("POST", /^\/api\/agents\/([\w-]+)\/reset$/, (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  crew.resetAgent(id);
  return { ok: true };
});
route("POST", /^\/api\/tasks$/, async (req) => {
  const b = await readJson(req);
  const after = Array.isArray(b.after) ? b.after : String(b.after ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return crew.addTask({
    agent: b.agent,
    title: b.title,
    brief: b.brief,
    plain: b.plain || "",
    game: b.game || null,
    from: isAgent(b.from) || b.from === "owner" ? b.from : "lead",
    studio: typeof b.studio === "boolean" ? b.studio : undefined,
    browser: typeof b.browser === "boolean" ? b.browser : undefined,
    after,
    size: b.size || "normal",
    model: b.model || null,
  });
});
// Rewrite a task as plain-English steps for the owner (Gemini's free text model, else Haiku).
// Waiting tasks without a plain summary are explained automatically, one at a time.
async function explainTask(t) {
  const game = t.game ? store.data.games.find((g) => g.slug === t.game) : null;
  const prompt = `Explain this game-dev task to a 12-year-old Roblox player who owns the game${game ? ` "${game.name}"` : ""}. Write 3-6 very short steps describing what will change in the game, as a player would see it, then a last step starting "Why:". No code words, no file names, no jargon (say what things are, e.g. "a pop-up message" not "toast", "a button bar at the bottom" not "hotbar"). Reply with only the steps, separated by " | ", nothing else.\n\nTask: ${t.title}\n\nDetails:\n${String(t.brief).slice(0, 4000)}`;
  const cfg = config.get();
  let text = "";
  if (cfg.gemini.apiKey) text = await Promise.race([askGemini({ apiKey: cfg.gemini.apiKey, model: cfg.gemini.textModel, prompt }), new Promise((r) => setTimeout(() => r(""), 30000))]).catch(() => "");
  if (!text) {
    const res = await runClaude({ command: cfg.claudeCommand, cwd: os.tmpdir(), prompt, model: "haiku", effort: "low", permissionMode: "safe", allowedTools: [], timeoutMs: 90000 }).done;
    text = res.ok ? res.text : "";
  }
  if (!text.trim()) throw new Error("Couldn't write the explanation right now.");
  t.plain = text.replace(/\n+/g, " | ").replace(/\bStep \d+:\s*/gi, "").replace(/(^|\|)\s*\d+[.)]\s*/g, "$1 ").trim().slice(0, 800);
  crew.changed();
  return t.plain;
}

let explaining = false;
async function explainWaiting() {
  if (explaining || process.env.ROCREW_NO_EXPLAIN) return;
  explaining = true;
  try {
    for (;;) {
      const t = store.data.tasks.find((x) => x.status === "proposed" && !x.plain && !x.explainFailed);
      if (!t) break;
      await explainTask(t).catch(() => {
        t.explainFailed = true;
      });
    }
  } finally {
    explaining = false;
  }
}
crew.on("change", () => setTimeout(explainWaiting, 500));

route("POST", /^\/api\/tasks\/([\w]+)\/explain$/, async (req, url, [id]) => {
  const t = store.data.tasks.find((x) => x.id === id);
  need(t, "No such task.");
  try {
    return { plain: await explainTask(t) };
  } catch (err) {
    throw new HttpError(502, err.message);
  }
});
route("POST", /^\/api\/tasks\/decide$/, async (req) => {
  const { ids, approve } = await readJson(req);
  need(Array.isArray(ids) && ids.length, "Pick at least one task.");
  return { changed: crew.decideProposed(ids.map(String), Boolean(approve), personName(req)) };
});
route("POST", /^\/api\/tasks\/([\w]+)\/cancel$/, (req, url, [id]) => crew.cancel(id));
route("POST", /^\/api\/pause$/, async (req) => {
  crew.setPaused((await readJson(req)).paused);
  return { paused: store.data.paused };
});

route("POST", /^\/api\/reviews$/, async (req) => {
  const b = await readJson(req);
  need(b.file, "Give the file to review.");
  need(b.question?.trim(), "Ask the owner a question about it.");
  const media = ingest(b.file, b.title);
  const review = {
    id: store.id("r"),
    agent: isAgent(b.from) ? b.from : "lead",
    game: b.game || null,
    title: (b.title || path.basename(b.file)).slice(0, 120),
    question: b.question.trim(),
    file: b.file,
    media,
    kind: /\.(mp4|webm|mov)$/i.test(media) ? "video" : "image",
    group: b.group || null,
    status: "pending",
    note: "",
    createdAt: Date.now(),
  };
  store.push("reviews", review);
  crew.feed(review.agent, "owner", `Review: ${review.title}`);
  crew.changed();
  return review;
});
route("POST", /^\/api\/store-art$/, async (req) => {
  const b = await readJson(req);
  const kind = ["icon", "pass"].includes(b.kind) ? b.kind : "thumb";
  const cfg = config.get().gemini;
  need(cfg.apiKey || (b.refs ?? []).length, "Pass a Studio capture with --ref (free mode), or add a Gemini key in Settings.");
  const game = b.game && store.data.games.find((g) => g.slug === b.game);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const dir = inside(ROOT, game ? path.join("games", game.slug, "art", `${kind}s-${stamp}`) : path.join(".rocrew", "media", `${kind}s-${stamp}`));
  // Style references: what the top games in this genre's chart use right now.
  let styleRefs = [];
  let styleFrom = null;
  if (b.styleRefs !== 0 && b.styleRefs !== "none" && kind !== "pass") {
    try {
      const top = await topStoreArt({ snapshot: store.data.market.snapshots.at(-1), sortId: b.chart || "top-trending", kind: kind === "icon" ? "icon" : "thumb", count: Math.min(4, Number(b.styleRefs) || 2), cacheDir: path.join(DATA, "style-refs") });
      styleRefs = top.refs.map((r) => r.file);
      styleFrom = `${top.chart}: ${top.refs.map((r) => r.name).join(", ")}`;
    } catch {}
  }
  let set;
  try {
    set = await makeStoreArt({ styleRefs, apiKey: cfg.apiKey, imageModel: cfg.imageModel, textModel: cfg.textModel, kind, variants: b.variants ?? [], refs: (b.refs ?? []).map((r) => inside(ROOT, r)), dir, text: b.text ?? "", format: b.format ?? "", greenScreen: Boolean(b.greenScreen), backdrop: b.backdrop ?? "", hasFfmpeg });
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const group = `${game?.name ?? "Store art"}: ${{ icon: "icons", pass: "pass icons", thumb: "thumbnails" }[kind]} ${new Date().toLocaleDateString()}`;
  const from = isAgent(b.from) ? b.from : "splash";
  const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");
  const ready = set.candidates.filter((c) => c.file);
  for (const c of ready) {
    const s = c.score;
    const label = s ? ` · clicks ${s.ctr}/10 · hand-made look ${s.ai_clean}/10${s.textMismatch ? " · TEXT WRONG" : ""}` : "";
    const media = ingest(rel(c.file), `${kind}-${c.id}`);
    store.push("reviews", {
      id: store.id("r"), agent: from, game: game?.slug ?? null, title: `${{ icon: "Icon", pass: "Pass icon", thumb: "Thumbnail" }[kind]} ${c.id}${label}`.slice(0, 120),
      question: b.question?.trim() || (kind !== "thumb" ? "Which icon would you tap at phone size? Anything that looks fake?" : "Which thumbnails should go into Roblox's thumbnail test? Anything that looks fake?"),
      file: rel(c.file), media, kind: "image", group, status: "pending", note: s?.worst ? `Judge: ${s.worst}. Fix: ${s.fix}` : "", createdAt: Date.now(),
    });
  }
  crew.feed(from, "owner", `${ready.length} ${kind === "icon" ? "icons" : "thumbnails"} ready to review`);
  crew.changed();
  return {
    freeMode: set.freeMode, styleFrom, dir: rel(set.dir), sheet: set.sheet ? rel(set.sheet) : null, finished: set.finished, group,
    candidates: set.candidates.map((c) => ({ id: c.id, variant: c.line, file: c.file ? rel(c.file) : null, error: c.error ?? null, score: c.score ?? null })),
  };
});
route("POST", /^\/api\/reviews\/([\w]+)\/decision$/, async (req, url, [id]) => crew.decideReview(id, { ...(await readJson(req)), by: personName(req) }));

route("POST", /^\/api\/asks$/, async (req) => {
  const b = await readJson(req);
  need(b.title?.trim(), "A checkpoint needs a title.");
  const media = (b.media ?? []).slice(0, 12).map((f) => ingest(f, b.title));
  return crew.addAsk({
    from: isAgent(b.from) ? b.from : "lead",
    title: b.title.trim().slice(0, 140),
    body: b.body ?? "",
    game: b.game || null,
    kind: b.kind,
    steps: Array.isArray(b.steps) ? b.steps : String(b.steps ?? "").split("|"),
    media,
  });
});
// A Gemini-app job: the owner's image goes straight into Review; the crew never waited for it.
route("POST", /^\/api\/asks\/([\w]+)\/to-review$/, async (req, url, [id]) => {
  const ask = store.data.asks.find((a) => a.id === id && a.kind === "gemini");
  need(ask, "No such Gemini job.");
  const { media = [] } = await readJson(req);
  need(media.length, "Drop in the image Gemini made first.");
  for (const m of media.slice(0, 8)) {
    store.push("reviews", { id: store.id("r"), agent: ask.from, game: ask.game, title: `${ask.title} (made in Gemini)`.slice(0, 120), question: "Use this one?", file: `media/${m}`, media: m, kind: /\.(mp4|webm|mov)$/i.test(m) ? "video" : "image", group: ask.title, status: "pending", note: "", createdAt: Date.now() });
  }
  ask.status = "done";
  ask.reply = "Added to Review";
  crew.changed();
  return { ok: true };
});
route("POST", /^\/api\/asks\/([\w]+)\/answer$/, async (req, url, [id]) => {
  const b = await readJson(req);
  const names = (b.media ?? []).filter((n) => typeof n === "string" && fs.existsSync(path.join(MEDIA, path.basename(n)))).map((n) => path.basename(n));
  return crew.answerAsk(id, { reply: b.reply ?? "", done: Boolean(b.done), result: b.result ?? null, attachments: await describeMedia(names), by: personName(req) });
});

// Photos and videos from the browser (your phone included), sent as the raw file body.
route("POST", /^\/api\/media$/, async (req, url) => {
  const name = path.basename(url.searchParams.get("name") ?? "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
  const type = MEDIA_TYPES[path.extname(name).toLowerCase()];
  need(type, "Upload a png, jpg, webp, gif, mp4, webm or mov file.");
  const stored = `${Date.now().toString(36)}-${randomBytes(3).toString("hex")}-${name}`;
  const file = path.join(MEDIA, stored);
  let size = 0;
  const outStream = fs.createWriteStream(file);
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 300_000_000) {
      outStream.destroy();
      fs.rmSync(file, { force: true });
      throw new HttpError(413, "That file is over 300 MB.");
    }
    if (!outStream.write(chunk)) await new Promise((r) => outStream.once("drain", r));
  }
  await new Promise((r) => outStream.end(r));
  return { media: stored, kind: VIDEO_EXT.test(stored) ? "video" : "image" };
});

route("POST", /^\/api\/pitches$/, async (req) => {
  const b = await readJson(req);
  need(b.title?.trim(), "A pitch needs a title.");
  const pitch = { id: store.id("p"), title: b.title.trim(), data: b, status: "pending", createdAt: Date.now() };
  store.push("pitches", pitch);
  crew.feed("pulse", "owner", `Pitch: ${pitch.title}`);
  crew.changed();
  return pitch;
});
route("POST", /^\/api\/pitches\/([\w]+)\/decision$/, async (req, url, [id]) => crew.decidePitch(id, { ...(await readJson(req)), by: personName(req) }));

route("POST", /^\/api\/games$/, async (req) => crew.addGame(await readJson(req)));
route("PATCH", /^\/api\/games\/([\w-]+)$/, async (req, url, [slug]) => {
  const game = store.data.games.find((g) => g.slug === slug);
  if (!game) throw new HttpError(404, "No such game.");
  const b = await readJson(req);
  if (b.name) game.name = String(b.name);
  if (b.version) game.version = String(b.version);
  if (b.universeId !== undefined) game.universeId = b.universeId ? String(b.universeId).replace(/\D/g, "") : null;
  if (b.whatsNew) game.whatsNew = [...(Array.isArray(b.whatsNew) ? b.whatsNew : [b.whatsNew]), ...game.whatsNew].slice(0, 30);
  crew.changed();
  return game;
});
route("GET", /^\/api\/games\/([\w-]+)\/live$/, async (req, url, [slug]) => {
  const game = store.data.games.find((g) => g.slug === slug);
  if (!game?.universeId) throw new HttpError(400, "Set this game's universe id first (Games → Live numbers).");
  const live = await liveNumbers(game.universeId);
  game.live = [...(game.live ?? []), live].slice(-200);
  crew.changed();
  return game.live;
});

const TEXT_EXT = new Set([".md", ".txt", ".json", ".lua", ".luau", ".mjs", ".js", ".csv", ".yaml", ".yml"]);
route("GET", /^\/api\/games\/([\w-]+)\/files$/, (req, url, [slug]) => {
  const dir = inside(path.join(ROOT, "games"), slug);
  const files = [];
  const walk = (d, depth) => {
    if (depth > 4 || !fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else {
        const st = fs.statSync(full);
        files.push({ path: path.relative(dir, full).split(path.sep).join("/"), size: st.size, modifiedAt: st.mtimeMs });
      }
    }
  };
  walk(dir, 0);
  return files.sort((a, b) => b.modifiedAt - a.modifiedAt);
});
route("GET", /^\/api\/games\/([\w-]+)\/file$/, (req, url, [slug]) => {
  const file = inside(inside(path.join(ROOT, "games"), slug), url.searchParams.get("path") ?? "");
  need(TEXT_EXT.has(path.extname(file).toLowerCase()) && fs.existsSync(file), "Not a text file in this game.");
  return { path: url.searchParams.get("path"), text: fs.readFileSync(file, "utf8").slice(0, 400000) };
});

route("POST", /^\/api\/library\/assets$/, async (req) => {
  const b = await readJson(req);
  need(b.name?.trim(), "An asset needs a name.");
  need(["model", "icon", "image", "sound", "effect", "animation"].includes(b.kind), "kind must be model, icon, image, sound, effect or animation.");
  const asset = {
    id: store.id("l"),
    kind: b.kind,
    name: b.name.trim(),
    media: b.file ? ingest(b.file, b.name) : null,
    file: b.file ?? null,
    robloxId: b.robloxId ? String(b.robloxId).replace(/\D/g, "") : null,
    tags: Array.isArray(b.tags) ? b.tags : String(b.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    game: b.game || null,
    by: isAgent(b.from) ? b.from : null,
    createdAt: Date.now(),
  };
  store.data.library.assets.push(asset);
  crew.changed();
  return asset;
});
route("POST", /^\/api\/library\/assets\/([\w]+)\/upload$/, async (req, url, [id]) => {
  const asset = store.data.library.assets.find((a) => a.id === id);
  if (!asset?.media) throw new HttpError(400, "This asset has no image file to upload.");
  const cfg = config.get().roblox;
  asset.robloxId = await uploadDecal({ apiKey: cfg.openCloudKey, creatorType: cfg.creatorType, creatorId: cfg.creatorId, file: path.join(MEDIA, asset.media), name: asset.name });
  crew.changed();
  return asset;
});
route("POST", /^\/api\/library\/systems$/, async (req) => {
  const b = await readJson(req);
  need(b.name?.trim(), "A system needs a name.");
  const system = { id: store.id("s"), name: b.name.trim(), summary: b.summary ?? "", path: b.path ?? "", game: b.game || null, by: isAgent(b.from) ? b.from : null, createdAt: Date.now() };
  store.data.library.systems.push(system);
  crew.changed();
  return system;
});
route("POST", /^\/api\/upload$/, async (req) => {
  const b = await readJson(req);
  const cfg = config.get().roblox;
  const file = inside(ROOT, b.file ?? "");
  return { assetId: await uploadDecal({ apiKey: cfg.openCloudKey, creatorType: cfg.creatorType, creatorId: cfg.creatorId, file, name: b.name || path.basename(file) }) };
});

route("GET", /^\/api\/market$/, () => marketView());
route("POST", /^\/api\/market\/refresh$/, () => refreshMarket());
route("GET", /^\/api\/market\/art\/([\d,]+)$/, async (req, url, [ids]) => {
  try {
    const files = await saveGameArt(ids.split(",").filter(Boolean), path.join(MEDIA, "game-art"));
    return { files };
  } catch (err) {
    throw new HttpError(502, err.message);
  }
});
route("GET", /^\/api\/market\/search$/, async (req, url) => {
  try {
    return await searchGames(url.searchParams.get("q") ?? "");
  } catch (err) {
    throw new HttpError(502, `Roblox search didn't answer (${err.message}). It allows about one search a minute; try again shortly.`);
  }
});
route("GET", /^\/api\/market\/game\/([\d,]+)$/, async (req, url, [ids]) => {
  const list = ids.split(",").filter(Boolean).slice(0, 8);
  // One at a time: Roblox rate-limits bursts. Several ids come back as a list.
  const out = [];
  for (const id of list) {
    try {
      out.push(await gameDeepDive(id));
    } catch (err) {
      if (list.length === 1) throw new HttpError(502, err.message);
      out.push({ universeId: id, error: err.message });
    }
  }
  return list.length === 1 ? out[0] : out;
});
route("POST", /^\/api\/market\/corpus$/, async (req) => {
  const { universeId, add = true } = await readJson(req);
  const id = String(universeId ?? "").replace(/\D/g, "");
  need(id, "Give a universe id.");
  const market = store.data.market;
  if (add && !market.corpus.includes(id)) market.corpus.push(id);
  if (!add) market.corpus = market.corpus.filter((x) => x !== id);
  if (add && !store.data.market.details[id]) Object.assign(store.data.market.details, await fetchDetails([id]).catch(() => ({})));
  store.saveMarket();
  crew.changed();
  return marketView();
});

route("POST", /^\/api\/image$/, async (req) => {
  const b = await readJson(req);
  need(b.prompt?.trim(), "Describe the image.");
  const cfg = config.get().gemini;
  const out = inside(ROOT, b.out || path.join(".rocrew", "media", `${Date.now().toString(36)}-${slugify(b.title || "image")}`));
  const refs = (b.refs ?? []).map((r) => inside(ROOT, r));
  const { file, text } = await generateImage({ apiKey: cfg.apiKey, model: b.model || cfg.imageModel, prompt: b.prompt, aspect: b.aspect || "1:1", refs, out });
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return { file: rel, text };
});
route("POST", /^\/api\/gemini$/, async (req) => {
  const b = await readJson(req);
  need(b.prompt?.trim(), "Ask Gemini something.");
  const cfg = config.get().gemini;
  return { text: await askGemini({ apiKey: cfg.apiKey, model: b.model || cfg.textModel, prompt: b.prompt, images: (b.images ?? []).map((i) => inside(ROOT, i)) }) };
});
route("POST", /^\/api\/feed$/, async (req) => {
  const b = await readJson(req);
  need(b.text?.trim(), "Say something.");
  crew.feed(b.from || "lead", b.to || "lead", b.text.trim());
  crew.changed();
  return { ok: true };
});

route("GET", /^\/api\/vault$/, () => vaultPages());
route("GET", /^\/api\/vault\/page$/, (req, url) => {
  const file = inside(VAULT, url.searchParams.get("path") ?? "");
  need(file.endsWith(".md") && fs.existsSync(file), "No such page.");
  return { path: url.searchParams.get("path"), text: fs.readFileSync(file, "utf8") };
});

// ---------- people (friends who share this studio) ----------

function ownerOnly(req) {
  if (personName(req) !== "owner") throw new HttpError(403, "Only the studio owner can change this.");
}

function peopleView() {
  return (store.data.people ?? []).filter((p) => !p.remote).map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt, lastSeenAt: p.lastSeenAt ?? null, links: linkFor(p.token), key: p.token }));
}

route("GET", /^\/api\/people$/, (req) => {
  ownerOnly(req);
  return { people: peopleView(), lan: lanMode(), addresses: networkAddresses(), port };
});
route("POST", /^\/api\/people$/, async (req) => {
  ownerOnly(req);
  const { name } = await readJson(req);
  need(name?.trim(), "Give your friend a name.");
  store.data.people ??= [];
  store.data.people.push({ id: store.id("u"), name: String(name).trim().slice(0, 40), token: randomBytes(24).toString("hex"), createdAt: Date.now() });
  crew.changed();
  return { people: peopleView(), lan: lanMode(), addresses: networkAddresses(), port };
});
route("DELETE", /^\/api\/people\/([\w]+)$/, (req, url, [id]) => {
  ownerOnly(req);
  store.data.people = (store.data.people ?? []).filter((p) => p.id !== id);
  crew.changed();
  return { people: peopleView() };
});

// ---------- Remote Control ----------

route("GET", /^\/api\/remote$/, (req) => {
  ownerOnly(req);
  return remote.view(true);
});
route("POST", /^\/api\/remote\/pair$/, async (req) => {
  ownerOnly(req);
  const { code } = await readJson(req);
  try {
    if (code) await remote.pair(code);
    else remote.createCode();
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  return remote.view(true);
});
route("DELETE", /^\/api\/remote\/pair$/, (req) => {
  ownerOnly(req);
  remote.unpair();
  return remote.view(true);
});
route("POST", /^\/api\/remote\/share$/, async (req) => {
  ownerOnly(req);
  const { on } = await readJson(req);
  need(remote.view(true).paired || !on, "Pair with your friend first.");
  remote.share(Boolean(on)).catch(() => {});
  return remote.view(true);
});
route("POST", /^\/api\/remote\/install$/, async (req) => {
  ownerOnly(req);
  try {
    await remote.installTunnel();
  } catch (err) {
    throw new HttpError(502, err.message);
  }
  return remote.view(true);
});
route("POST", /^\/api\/remote\/relay$/, async (req) => {
  ownerOnly(req);
  try {
    remote.setRelayUrl((await readJson(req)).url);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  return remote.view(true);
});
route("POST", /^\/api\/remote\/answer$/, async (req) => {
  ownerOnly(req);
  const { session, join } = await readJson(req);
  try {
    return remote.answer(String(session ?? ""), Boolean(join));
  } catch (err) {
    throw new HttpError(410, err.message);
  }
});

// ---------- the crew's Roblox sign-in ----------

route("POST", /^\/api\/roblox\/signin$/, (req) => {
  ownerOnly(req);
  try {
    robloxBrowser.openSignIn();
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  return robloxBrowser.view();
});
route("POST", /^\/api\/roblox\/check$/, async (req) => {
  ownerOnly(req);
  need(!crew.browserHolder, "An agent is using the browser right now. Try again when it's done.");
  await robloxBrowser.check();
  return robloxBrowser.view();
});
route("POST", /^\/api\/roblox\/signout$/, (req) => {
  ownerOnly(req);
  need(!crew.browserHolder, "An agent is using the browser right now. Try again when it's done.");
  robloxBrowser.signOut();
  return robloxBrowser.view();
});
route("POST", /^\/api\/roblox\/visible$/, async (req) => {
  ownerOnly(req);
  config.update({ robloxBrowser: { visible: Boolean((await readJson(req)).visible) } });
  crew.changed("roblox");
  return robloxBrowser.view();
});

// Install what's missing (Claude Code, ffmpeg; uv and the Blender add-on only if Blender exists).
route("POST", /^\/api\/setup$/, async (req) => {
  ownerOnly(req);
  const { setup } = await import("./setup.mjs");
  const lines = [];
  const report = await setup({ log: (l) => lines.push(l) });
  // Blender is on this PC and its add-on is in: switch it on for the crew (hidden, closes on quit).
  if (report.some((r) => r.name === "Blender MCP add-on" && r.ok) && !blenderEnabled()) setBlender(true);
  checkConnections().catch(() => {});
  return { report, log: lines };
});

// ---------- updates ----------

route("POST", /^\/api\/update\/check$/, async (req) => {
  ownerOnly(req);
  const v = await updater.check();
  crew.changed("update");
  return v;
});
route("POST", /^\/api\/update\/install$/, async (req) => {
  ownerOnly(req);
  try {
    await updater.install();
  } catch (err) {
    throw new HttpError(502, err.message);
  }
  // Restart into the new version: the tray (or the log-window launcher) starts RoCrew again.
  setTimeout(() => {
    remote.stop();
    blender.stop();
    for (const run of crew.running.values()) run.kill("app updating");
    store.flush();
    process.exit(3);
  }, 400);
  return { ok: true };
});

// Quit everything RoCrew started: agents, Blender, the tunnel, the sign-in window, the app.
route("POST", /^\/api\/quit$/, (req) => {
  ownerOnly(req);
  setTimeout(shutdown, 300);
  return { ok: true };
});

// ---------- start with Windows ----------

function startupFile() {
  if (process.platform !== "win32" || !process.env.APPDATA) return null;
  return path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "RoCrew.cmd");
}

function autostartView() {
  const file = startupFile();
  return { supported: Boolean(file), enabled: Boolean(file && fs.existsSync(file)) };
}

route("POST", /^\/api\/autostart$/, async (req) => {
  ownerOnly(req);
  const { enabled } = await readJson(req);
  const file = startupFile();
  need(file, "Starting with your computer is only set up for Windows.");
  if (enabled) {
    const vbs = path.join(ROOT, "Start RoCrew.vbs");
    fs.writeFileSync(file, `@echo off\r\nrem Starts RoCrew (in the system tray) when you sign in to Windows. Turn it off in RoCrew Settings.\r\nstart "" wscript "${vbs}" nobrowser\r\n`);
  } else if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
  return autostartView();
});

route("GET", /^\/api\/settings$/, (req) => {
  ownerOnly(req);
  return { ...config.public(), phoneUrl: phoneUrl(), presets: presetTable(), autostart: autostartView() };
});
route("POST", /^\/api\/settings$/, async (req) => {
  ownerOnly(req);
  config.update(await readJson(req));
  crew.changed();
  setImmediate(() => crew.tick());
  return { ...config.public(), phoneUrl: phoneUrl(), presets: presetTable(), autostart: autostartView() };
});
route("GET", /^\/api\/connections$/, () => connectionsView());
route("POST", /^\/api\/connections\/check$/, () => checkConnections());
route("POST", /^\/api\/connections\/blender$/, async (req) => {
  ownerOnly(req);
  setBlender(Boolean((await readJson(req)).enabled));
  return checkConnections();
});

const STATIC_TYPES = { ".webmanifest": "application/manifest+json", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
const MEDIA_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (!hostOk(req)) throw new HttpError(403, "Unexpected Host header.");

    if (url.pathname === "/api/events") {
      if (!tokenOk(req, url)) throw new HttpError(401, "Missing or wrong token.");
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write(": hello\n\n");
      res.personId = personFor(requestToken(req, url))?.id;
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    if (url.pathname === "/api/changes") {
      if (!tokenOk(req, url)) throw new HttpError(401, "Missing or wrong token.");
      const since = Number(url.searchParams.get("since") ?? -1);
      const reply = () => send(res, 200, { seq: eventSeq, events: since < 0 ? [] : recent.filter((r) => r.seq > since).map((r) => r.e) });
      if (since < 0 || eventSeq > since) return reply();
      const personId = personFor(requestToken(req, url))?.id;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        waiters.delete(wake);
        clearTimeout(timer);
        // Access ended while waiting (Remote Control turned off): say so.
        if (personId && personId !== "owner" && !(store.data.people ?? []).some((p) => p.id === personId)) return send(res, 401, { error: "Missing or wrong token." });
        reply();
      };
      const wake = () => setTimeout(finish, 50);
      const timer = setTimeout(finish, 25000);
      waiters.add(wake);
      req.on("close", () => {
        done = true;
        waiters.delete(wake);
        clearTimeout(timer);
      });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      if (!tokenOk(req, url)) throw new HttpError(401, "Missing or wrong token.");
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = r.pattern.exec(url.pathname);
        if (m) return send(res, 200, (await r.handler(req, url, m.slice(1))) ?? { ok: true });
      }
      throw new HttpError(404, "No such endpoint.");
    }

    const fileRoot = { media: MEDIA, "vault-file": VAULT, "game-file": path.join(ROOT, "games") }[url.pathname.split("/")[1]];
    if (fileRoot) {
      if (!tokenOk(req, url)) throw new HttpError(401, "Missing or wrong token.");
      const file = inside(fileRoot, decodeURIComponent(url.pathname.split("/").slice(2).join("/")));
      const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
      if (!type || !fs.existsSync(file)) throw new HttpError(404, "Not found.");
      return send(res, 200, fs.readFileSync(file), { "content-type": type, "cache-control": "private, max-age=3600" });
    }

    const rel = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const file = inside(PUBLIC, rel);
    const type = STATIC_TYPES[path.extname(file)];
    if (type && fs.existsSync(file) && !file.endsWith("index.html")) return send(res, 200, fs.readFileSync(file), { "content-type": type });
    // The page carries a token, so anywhere but this computer's own browser it needs a private link.
    const key = url.searchParams.get("key");
    const visitor = key ? personFor(key) : null;
    if (!visitor && !isLocalBrowser(req)) {
      return send(res, 401, "<!doctype html><meta name=viewport content='width=device-width'><body style='background:#0b0911;color:#eee;font:16px system-ui;padding:40px'><h2>RoCrew is locked</h2><p>Open your private link: the owner finds it in Settings → Friends.</p>", { "content-type": STATIC_TYPES[".html"] });
    }
    return send(res, 200, injectToken(visitor ? key : TOKEN), { "content-type": STATIC_TYPES[".html"] });
  } catch (err) {
    const status = err.status ?? 500;
    if (status === 500) console.error("[rocrew]", err);
    send(res, status, { error: err.message });
  }
});

function injectToken(token) {
  return fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8").replace("__ROCREW_TOKEN__", token);
}

const cfg = config.get();
const port = Number(process.env.PORT ?? cfg.port);
const host = process.env.HOST ?? cfg.host;
server.listen(port, host, () => {
  if (phoneUrl()) console.log(`\n  On your phone (same Wi-Fi): ${phoneUrl()}\n  Keep that link private: it opens your studio. Friends get their own links in Settings → Friends.`);
  fs.writeFileSync(path.join(DATA, "runtime.json"), JSON.stringify({ port, host, token: TOKEN, pid: process.pid }, null, 2));
  const shown = host === "0.0.0.0" ? "localhost" : host;
  console.log(`\n  RoCrew agent studio is running → http://${shown}:${port}\n  Project: ${ROOT}\n  Stop with Ctrl+C.\n`);
  crew.tick();
  checkConnections().catch(() => {});
  if (!process.env.ROCREW_NO_MARKET) {
    setTimeout(() => updater.check().then(() => crew.changed("update")).catch(() => {}), 15000);
    setInterval(() => updater.check().then(() => crew.changed("update")).catch(() => {}), 6 * 3600000).unref();
  }
  const recheck = () => robloxBrowser.status.signedIn && !crew.browserHolder && robloxBrowser.check().catch(() => {});
  setTimeout(recheck, 5000);
  // Snapshot the charts every 3 hours, so rank moves and breakouts build up on their own.
  const marketTick = () => {
    const m = store.data.market;
    if (Date.now() - (m.triedAt ?? m.fetchedAt ?? 0) > 3 * 3600000) refreshMarket().catch(() => {});
  };
  if (!process.env.ROCREW_NO_MARKET) {
    setTimeout(marketTick, 20000);
    setInterval(marketTick, 30 * 60000).unref();
  }
  setInterval(recheck, 6 * 3600000).unref();
  if (process.argv.includes("--open")) openInBrowser(`http://localhost:${port}`);
  if (blenderEnabled() && !process.env.ROCREW_NO_BLENDER) blender.start();
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`\n  RoCrew is already running on port ${port}. Opening it…\n`);
    if (process.argv.includes("--open")) openInBrowser(`http://localhost:${port}`);
    setTimeout(() => process.exit(0), 500);
    return;
  }
  throw err;
});

/** Open RoCrew in its own app window (Edge or Chrome app mode), or a normal tab if neither is found. */
function openInBrowser(url) {
  const app = robloxBrowser.browser();
  if (app && process.platform !== "linux") {
    execFile(app.file, [`--app=${url}`, "--window-size=1360,880"], { windowsHide: true }, () => {});
    return;
  }
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  execFile(cmd, args, { windowsHide: true }, () => {});
}

// Never lose state on a crash: save, then exit with an error so "Start RoCrew.bat" restarts the app.
process.on("uncaughtException", (err) => {
  console.error("[rocrew] crashed:", err);
  try {
    store.flush();
  } catch {}
  process.exit(1);
});
process.on("unhandledRejection", (err) => console.error("[rocrew] unhandled error:", err));

const ticker = setInterval(() => crew.tick(), 5000);
ticker.unref();

function shutdown() {
  remote.stop();
  blender.stop();
  robloxBrowser.window?.kill();
  for (const run of crew.running.values()) run.kill("app closed");
  store.flush();
  try {
    fs.unlinkSync(path.join(DATA, "runtime.json"));
  } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
