#!/usr/bin/env node
// RoCrew agent studio: serves the app and runs the crew on Claude Code.
//   node studio/server.mjs            -> http://localhost:4600

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Store } from "./lib/db.mjs";
import { Config } from "./lib/config.mjs";
import { Crew, slugify } from "./lib/crew.mjs";
import { AGENTS, isAgent } from "./lib/agents.mjs";
import { probeClaude } from "./lib/claude.mjs";
import { fetchCharts, fetchDetails, velocity, breakouts, liveNumbers, uploadDecal } from "./lib/roblox.mjs";
import { generateImage, askGemini } from "./lib/gemini.mjs";

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
// A stable secret, so a phone bookmark of the private link keeps working across restarts.
const TOKEN_FILE = path.join(DATA, "token");
const TOKEN = fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, "utf8").trim() : randomBytes(24).toString("hex");
fs.writeFileSync(TOKEN_FILE, TOKEN, { mode: 0o600 });
let connections = { checkedAt: null, claude: null };

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

function tokenOk(req, url) {
  const given = req.headers["x-rocrew-token"] ?? url.searchParams.get("token") ?? "";
  const a = Buffer.from(String(given));
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Whether the running server listens beyond this computer (settings changes apply after a restart).
const lanMode = () => !["127.0.0.1", "localhost"].includes(host);

function hostOk(req) {
  if (lanMode()) return true; // On the home network the private link (token) guards everything, page included.
  const host = String(req.headers.host ?? "").replace(/:\d+$/, "");
  return ["localhost", "127.0.0.1", "[::1]"].includes(host);
}

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) if (a.family === "IPv4" && !a.internal) return a.address;
  }
  return null;
}

function phoneUrl() {
  const ip = lanAddress();
  return lanMode() && ip ? `http://${ip}:${port}/?key=${TOKEN}` : null;
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
        const forLine = /^(?:read_by|for):\s*\[?([^\]\n]*)\]?/m.exec(text)?.[1] ?? "";
        pages.push({
          path: path.relative(VAULT, full).split(path.sep).join("/"),
          title: entry.name.replace(/\.md$/, ""),
          folder: path.relative(VAULT, dir).split(path.sep).join("/"),
          readers: forLine.split(",").map((s) => s.trim()).filter(Boolean),
          lines: text.split("\n").length,
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
    studio: servers.find((s) => /roblox|studio/i.test(s.name)) ?? null,
    blender: { enabled: blenderEnabled(), server: servers.find((s) => /blender/i.test(s.name)) ?? null },
    gemini: { keySet: cfg.gemini.apiKeySet, imageModel: cfg.gemini.imageModel, textModel: cfg.gemini.textModel },
    roblox: { keySet: cfg.roblox.openCloudKeySet, creatorId: cfg.roblox.creatorId, creatorType: cfg.roblox.creatorType },
  };
}

function stateView() {
  const db = store.data;
  return {
    owner: config.get().ownerName,
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
    connections: connectionsView(),
  };
}

// ---------- live updates ----------

const clients = new Set();
let lastChangeAt = Date.now();
crew.on("change", (e) => {
  lastChangeAt = Date.now();
  const data = `data: ${JSON.stringify(e)}\n\n`;
  for (const res of clients) res.write(data);
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

route("GET", /^\/api\/state$/, () => stateView());
route("GET", /^\/api\/agents\/([\w-]+)\/messages$/, (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  return store.data.messages.filter((m) => m.agent === id).slice(-300);
});
route("POST", /^\/api\/lead\/message$/, async (req) => {
  const { text, images } = await readJson(req, 25_000_000);
  need(text?.trim(), "Say something to the Lead.");
  return crew.ownerToLead(attachImages(text.trim(), images));
});
route("POST", /^\/api\/agents\/([\w-]+)\/message$/, async (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  const { text, images } = await readJson(req, 25_000_000);
  need(text?.trim(), "Write a message first.");
  return id === "lead" ? crew.ownerToLead(attachImages(text.trim(), images)) : crew.ownerToAgent(id, attachImages(text.trim(), images));
});
route("POST", /^\/api\/agents\/([\w-]+)\/reset$/, (req, url, [id]) => {
  need(isAgent(id), "Unknown agent.");
  crew.resetAgent(id);
  return { ok: true };
});
route("POST", /^\/api\/tasks$/, async (req) => {
  const b = await readJson(req);
  const after = Array.isArray(b.after) ? b.after : String(b.after ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return crew.addTask({ agent: b.agent, title: b.title, brief: b.brief, game: b.game || null, from: isAgent(b.from) || b.from === "owner" ? b.from : "lead", studio: typeof b.studio === "boolean" ? b.studio : undefined, after });
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
route("POST", /^\/api\/reviews\/([\w]+)\/decision$/, async (req, url, [id]) => crew.decideReview(id, await readJson(req)));

route("POST", /^\/api\/asks$/, async (req) => {
  const b = await readJson(req);
  need(b.title?.trim(), "A checkpoint needs a title.");
  return crew.addAsk({ from: isAgent(b.from) ? b.from : "lead", title: b.title.trim().slice(0, 140), body: b.body ?? "", game: b.game || null });
});
route("POST", /^\/api\/asks\/([\w]+)\/answer$/, async (req, url, [id]) => crew.answerAsk(id, await readJson(req)));

route("POST", /^\/api\/pitches$/, async (req) => {
  const b = await readJson(req);
  need(b.title?.trim(), "A pitch needs a title.");
  const pitch = { id: store.id("p"), title: b.title.trim(), data: b, status: "pending", createdAt: Date.now() };
  store.push("pitches", pitch);
  crew.feed("pulse", "owner", `Pitch: ${pitch.title}`);
  crew.changed();
  return pitch;
});
route("POST", /^\/api\/pitches\/([\w]+)\/decision$/, async (req, url, [id]) => crew.decidePitch(id, await readJson(req)));

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
route("POST", /^\/api\/market\/corpus$/, async (req) => {
  const { universeId, add = true } = await readJson(req);
  const id = String(universeId ?? "").replace(/\D/g, "");
  need(id, "Give a universe id.");
  const market = store.data.market;
  if (add && !market.corpus.includes(id)) market.corpus.push(id);
  if (!add) market.corpus = market.corpus.filter((x) => x !== id);
  if (add && !store.data.market.details[id]) Object.assign(store.data.market.details, await fetchDetails([id]).catch(() => ({})));
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

route("GET", /^\/api\/settings$/, () => ({ ...config.public(), phoneUrl: phoneUrl() }));
route("POST", /^\/api\/settings$/, async (req) => {
  config.update(await readJson(req));
  crew.changed();
  setImmediate(() => crew.tick());
  return { ...config.public(), phoneUrl: phoneUrl() };
});
route("GET", /^\/api\/connections$/, () => connectionsView());
route("POST", /^\/api\/connections\/check$/, () => checkConnections());
route("POST", /^\/api\/connections\/blender$/, async (req) => {
  setBlender(Boolean((await readJson(req)).enabled));
  return checkConnections();
});

const STATIC_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
const MEDIA_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (!hostOk(req)) throw new HttpError(403, "Unexpected Host header.");

    if (url.pathname === "/api/events") {
      if (!tokenOk(req, url)) throw new HttpError(401, "Missing or wrong token.");
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write(": hello\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
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
    // The page itself carries the token, so off this computer it needs the private link.
    const local = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
    if (lanMode() && !local && url.searchParams.get("key") !== TOKEN) {
      return send(res, 401, "<!doctype html><meta name=viewport content='width=device-width'><body style='background:#0b0911;color:#eee;font:16px system-ui;padding:40px'><h2>RoCrew is locked</h2><p>Open the private phone link shown in Settings on your computer.</p>", { "content-type": STATIC_TYPES[".html"] });
    }
    return send(res, 200, injectToken(), { "content-type": STATIC_TYPES[".html"] });
  } catch (err) {
    const status = err.status ?? 500;
    if (status === 500) console.error("[rocrew]", err);
    send(res, status, { error: err.message });
  }
});

function injectToken() {
  return fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8").replace("__ROCREW_TOKEN__", TOKEN);
}

const cfg = config.get();
const port = Number(process.env.PORT ?? cfg.port);
const host = process.env.HOST ?? cfg.host;
server.listen(port, host, () => {
  if (phoneUrl()) console.log(`\n  On your phone (same Wi-Fi): ${phoneUrl()}\n  Keep that link private: it opens your studio.`);
  fs.writeFileSync(path.join(DATA, "runtime.json"), JSON.stringify({ port, host, token: TOKEN, pid: process.pid }, null, 2));
  const shown = host === "0.0.0.0" ? "localhost" : host;
  console.log(`\n  RoCrew agent studio is running → http://${shown}:${port}\n  Project: ${ROOT}\n  Stop with Ctrl+C.\n`);
  crew.tick();
  checkConnections().catch(() => {});
});

const ticker = setInterval(() => crew.tick(), 5000);
ticker.unref();

function shutdown() {
  for (const run of crew.running.values()) run.kill("app closed");
  store.flush();
  try {
    fs.unlinkSync(path.join(DATA, "runtime.json"));
  } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
