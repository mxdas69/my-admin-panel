// End-to-end tests: the real server and CLI, with test/fake-claude.mjs standing in for Claude Code.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMcpList } from "../studio/lib/claude.mjs";
import { renderMarkdown } from "../studio/public/md.js";
import { pickModel } from "../studio/lib/models.mjs";
import { Crew } from "../studio/lib/crew.mjs";
import { Store } from "../studio/lib/db.mjs";
import { Config } from "../studio/lib/config.mjs";
import { makeStoreArt, ENDINGS } from "../studio/lib/storeArt.mjs";
import { openings } from "../studio/lib/roblox.mjs";
import { parseWhoAmI } from "../studio/lib/robloxBrowser.mjs";
import { listPages, findPage, card, readSections, search } from "../studio/lib/vault.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-test-"));
const PORT = 4700 + Math.floor(Math.random() * 200);
const GAME = `zz-test-${process.pid}`;
let server;
let token;

// A stand-in for the ntfy relay that Remote Control uses between two apps.
const RELAY_PORT = PORT + 300;
const relayTopics = new Map();
const relay = http
  .createServer((req, res) => {
    const [, topic, json] = new URL(req.url, "http://x").pathname.split("/");
    const t = relayTopics.get(topic) ?? { msgs: [], subs: new Set() };
    relayTopics.set(topic, t);
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const m = { id: Math.random().toString(36).slice(2), time: Date.now() / 1000, event: "message", topic, message: body };
        t.msgs.push(m);
        for (const sub of t.subs) sub.write(JSON.stringify(m) + "\n");
        res.end("{}");
      });
    } else if (json === "json") {
      res.writeHead(200, { "content-type": "application/x-ndjson" });
      res.write(JSON.stringify({ event: "open", topic }) + "\n");
      for (const m of t.msgs) res.write(JSON.stringify(m) + "\n");
      t.subs.add(res);
      req.on("close", () => t.subs.delete(res));
    } else res.end();
  })
  .listen(RELAY_PORT);
relay.unref();

const env = { ...process.env, ROCREW_DATA: DATA, PORT: String(PORT), FAKE_DELAY: "300", ROCREW_RELAY_URL: `http://127.0.0.1:${RELAY_PORT}`, ROCREW_FAKE_TUNNEL: "1", ROCREW_NO_MARKET: "1" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, route, body, headers = {}) {
  const res = await fetch(`http://127.0.0.1:${PORT}${route}`, {
    method,
    headers: { "content-type": "application/json", "x-rocrew-token": token, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const state = async () => (await api("GET", "/api/state")).json;
const cli = (...args) => execFileSync("node", ["studio/cli.mjs", ...args], { cwd: ROOT, env, encoding: "utf8" });

async function until(check, ms = 15000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const s = await state();
    if (check(s)) return s;
    await sleep(150);
  }
  throw new Error("timed out waiting for the crew");
}

before(async () => {
  fs.writeFileSync(path.join(DATA, "config.json"), JSON.stringify({ claudeCommand: "node test/fake-claude.mjs", maxParallel: 3, maxAutoRounds: 3 }));
  server = spawn("node", ["studio/server.mjs"], { cwd: ROOT, env, stdio: "ignore" });
  for (let i = 0; i < 50 && !fs.existsSync(path.join(DATA, "runtime.json")); i++) await sleep(100);
  token = JSON.parse(fs.readFileSync(path.join(DATA, "runtime.json"), "utf8")).token;
  cli("game", "add", "--name", "Test Game", "--slug", GAME);
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill();
    await exited;
  }
  fs.rmSync(path.join(ROOT, "games", GAME), { recursive: true, force: true });
  fs.rmSync(DATA, { recursive: true, force: true });
});

const getStatus = (pathName, headers = {}) =>
  new Promise((resolve) => http.get({ host: "127.0.0.1", port: PORT, path: pathName, headers }, (res) => {
    let body = "";
    res.on("data", (d) => (body += d));
    res.on("end", () => resolve({ status: res.statusCode, body }));
  }));

test("the API needs a token, and the page needs a private link off this computer", async () => {
  assert.equal((await api("GET", "/api/state", null, { "x-rocrew-token": "nope" })).status, 401);
  assert.equal((await api("GET", "/api/state")).status, 200);
  const local = await getStatus("/");
  assert.equal(local.status, 200);
  assert.ok(local.body.includes(token), "this computer's browser gets the owner token");
  const viaTunnel = await getStatus("/", { host: "studio.example.com" });
  assert.equal(viaTunnel.status, 401, "another host without a link is locked out");
  assert.ok(!viaTunnel.body.includes(token));
  const withKey = await getStatus(`/?key=${token}`, { host: "studio.example.com" });
  assert.equal(withKey.status, 200);
});

test("friends get their own link, are credited by name, and can't change settings", async () => {
  const added = await api("POST", "/api/people", { name: "Sam" });
  assert.equal(added.status, 200);
  const sam = added.json.people.find((p) => p.name === "Sam");
  const page = await getStatus(`/?key=${sam.key}`, { host: "studio.example.com" });
  assert.equal(page.status, 200);
  assert.ok(page.body.includes(sam.key) && !page.body.includes(token), "the friend's page carries their key, not the owner's");
  const asSam = { "x-rocrew-token": sam.key };
  assert.equal((await api("GET", "/api/state", null, asSam)).json.me.name, "Sam");
  assert.equal((await api("POST", "/api/settings", { ownerName: "x" }, asSam)).status, 403);
  assert.equal((await api("GET", "/api/people", null, asSam)).status, 403);
  const t = (await api("POST", "/api/lead/message", { text: "Sam here: add a dog pet" }, asSam)).json;
  assert.ok(t.brief.startsWith("(From Sam"));
  await api("DELETE", `/api/people/${sam.id}`);
  assert.equal((await api("GET", "/api/state", null, asSam)).status, 401, "removing a friend revokes their link");
});

test("test requests carry steps and media, and broken reports need details", async () => {
  const img = path.join(DATA, "step.png");
  fs.writeFileSync(img, Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex"));
  const out = execFileSync("node", ["studio/cli.mjs", "test", "--title", "Try the shop", "--steps", "Open the shop|Buy the small pack", "--media", img], { cwd: ROOT, env: { ...env, ROCREW_AGENT: "merchant" }, encoding: "utf8" });
  const id = out.split(" ")[0];
  const ask = (await state()).asks.find((a) => a.id === id);
  assert.equal(ask.kind, "test");
  assert.deepEqual(ask.steps, ["Open the shop", "Buy the small pack"]);
  assert.equal(ask.media.length, 1);
  assert.equal((await api("POST", `/api/asks/${id}/answer`, { result: "broken" })).status, 400);
  const up = await fetch(`http://127.0.0.1:${PORT}/api/media?name=proof.png`, { method: "POST", headers: { "x-rocrew-token": token }, body: fs.readFileSync(img) });
  const { media } = await up.json();
  assert.equal((await api("POST", `/api/asks/${id}/answer`, { result: "broken", reply: "Buy button does nothing", media: [media] })).status, 200);
  const s = await until((x) => x.tasks.some((t) => t.agent === "lead" && t.brief.includes("Buy button does nothing") && t.brief.includes(media)));
  assert.equal(s.asks.find((a) => a.id === id).result, "broken");
});

test("owner -> Lead -> Builder -> Lead wake-up runs end to end", async () => {
  await api("POST", "/api/lead/message", { text: "Make a delivery game" });
  const s = await until((x) => x.tasks.some((t) => t.title.startsWith("Crew update") && t.status === "done"));
  const builder = s.tasks.find((t) => t.agent === "builder" && t.title === "Wire the delivery loop");
  assert.equal(builder.status, "done");
  assert.equal(builder.from, "lead");
  assert.ok(builder.studio, "Builder tasks take the Studio lock by default");
  assert.ok(s.feed.some((f) => f.from === "lead" && f.to === "builder"));
  assert.ok(s.feed.some((f) => f.from === "builder" && f.to === "lead"));
  const msgs = (await api("GET", "/api/agents/builder/messages")).json;
  assert.ok(msgs.some((m) => m.role === "tool" && m.text.includes("run_code")));
  assert.equal(builder.ran.model, "opus", "Builder runs on Opus in the balanced preset");
  assert.equal(s.usage.fiveHour.pct, 5, "plan usage from Claude Code reaches the app");
  assert.equal(s.usageHold, null);
});

test("only one agent holds Studio at a time, others run in parallel", async () => {
  const seen = { maxStudio: 0, maxWorking: 0 };
  for (const agent of ["builder", "frame", "scenic"]) cli("task", "add", "--agent", agent, "--title", `Studio work ${agent}`, "--game", GAME);
  for (const agent of ["architect", "balance"]) cli("task", "add", "--agent", agent, "--title", `Desk work ${agent}`, "--game", GAME);
  await until((s) => {
    const working = s.tasks.filter((t) => t.status === "working");
    seen.maxStudio = Math.max(seen.maxStudio, working.filter((t) => t.studio).length);
    seen.maxWorking = Math.max(seen.maxWorking, working.length);
    return s.tasks.filter((t) => t.title.startsWith("Studio work") || t.title.startsWith("Desk work")).every((t) => t.status === "done");
  }, 30000);
  assert.equal(seen.maxStudio, 1);
  assert.ok(seen.maxWorking >= 2, "non-Studio agents should run alongside the Studio holder");
});

test("a failed task blocks the tasks that depend on it", async () => {
  const failing = cli("task", "add", "--agent", "builder", "--title", "Crash", "--brief", "PLEASE FAIL").split(" ")[0];
  const dependent = cli("task", "add", "--agent", "playtest", "--title", "Test after crash", "--after", failing).split(" ")[0];
  const s = await until((x) => x.tasks.find((t) => t.id === dependent)?.status === "blocked");
  assert.equal(s.tasks.find((t) => t.id === failing).status, "failed");
});

test("asking for changes in Review sends the work back to the agent", async () => {
  const img = path.join(DATA, "shot.png");
  fs.writeFileSync(img, Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex"));
  const out = execFileSync("node", ["studio/cli.mjs", "review", "--file", img, "--question", "Ready?", "--title", "Shop"], { cwd: ROOT, env: { ...env, ROCREW_AGENT: "frame" }, encoding: "utf8" });
  const id = out.split(" ")[0];
  assert.equal((await api("POST", `/api/reviews/${id}/decision`, { verdict: "changes" })).status, 400, "a note is required");
  assert.equal((await api("POST", `/api/reviews/${id}/decision`, { verdict: "changes", note: "Bigger buy buttons" })).status, 200);
  const s = await until((x) => x.tasks.some((t) => t.agent === "frame" && t.title === "Changes: Shop" && t.status === "done"));
  assert.equal(s.reviews.find((r) => r.id === id).status, "changes");
});

test("approving a pitch creates the game and starts the Lead", async () => {
  const file = path.join(DATA, "pitch.json");
  fs.writeFileSync(file, JSON.stringify({ title: `Pitch ${process.pid}`, summary: "s" }));
  const id = cli("pitch", "--file", file).split(" ")[0];
  await api("POST", `/api/pitches/${id}/decision`, { verdict: "approved" });
  const s = await until((x) => x.tasks.some((t) => t.agent === "lead" && t.title.startsWith("Build approved pitch")));
  const game = s.games.find((g) => g.name === `Pitch ${process.pid}`);
  assert.ok(game);
  fs.rmSync(path.join(ROOT, "games", game.slug), { recursive: true, force: true });
});

test("checkpoint replies go to the Lead", async () => {
  const id = cli("ask", "--title", "Create the passes").split(" ")[0];
  await api("POST", `/api/asks/${id}/answer`, { reply: "Done, ids are 1 and 2", done: true });
  const s = await until((x) => x.tasks.some((t) => t.agent === "lead" && t.brief.includes("Done, ids are 1 and 2")));
  assert.equal(s.asks.find((a) => a.id === id).status, "done");
});

test("vault and game files can't be read outside their folders", async () => {
  assert.equal((await api("GET", `/api/vault/page?path=${encodeURIComponent("../CLAUDE.md")}`)).status, 400);
  assert.equal((await api("GET", `/api/games/${GAME}/file?path=${encodeURIComponent("../../CLAUDE.md")}`)).status, 400);
  assert.equal((await api("GET", "/api/vault")).status, 200);
});

test("parseMcpList reads `claude mcp list` output", () => {
  const servers = parseMcpList("Checking MCP server health...\n\nRoblox_Studio: C:\\rbx\\mcp.exe --stdio - ✓ Connected\nblender: uvx blender-mcp - ✗ Failed to connect\n");
  assert.deepEqual(servers.map((s) => [s.name, s.status]), [["Roblox_Studio", "connected"], ["blender", "failed"]]);
});

test("the Markdown renderer escapes HTML and unsafe links", () => {
  const html = renderMarkdown('<script>alert(1)</script> [x](javascript:alert(1)) [[01 The First Five Minutes]]', { wikiHref: (p) => `#/vault/${p}` });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes('class="wiki"'));
});

test("model routing keeps Opus for core work and saves usage elsewhere", () => {
  const cfg = { modelPreset: "balanced", agentModels: {}, model: "" };
  assert.equal(pickModel({ agent: "builder" }, cfg).model, "opus");
  assert.equal(pickModel({ agent: "playtest" }, cfg).model, "sonnet");
  assert.deepEqual(pickModel({ agent: "playtest", size: "small" }, cfg).model, "haiku");
  assert.equal(pickModel({ agent: "builder", size: "small" }, cfg).model, "sonnet");
  assert.deepEqual([pickModel({ agent: "producer", size: "big" }, cfg).model, pickModel({ agent: "producer", size: "big" }, cfg).effort], ["opus", "xhigh"]);
  assert.equal(pickModel({ agent: "pulse" }, { ...cfg, modelPreset: "quality" }).model, "opus");
  assert.equal(pickModel({ agent: "kid-tester" }, { ...cfg, modelPreset: "saver" }).model, "haiku");
  assert.equal(pickModel({ agent: "pulse" }, { ...cfg, modelPreset: "custom", agentModels: { pulse: "haiku" } }).model, "haiku");
  assert.equal(pickModel({ agent: "pulse" }, { ...cfg, model: "sonnet" }).model, "sonnet");
  assert.equal(pickModel({ agent: "pulse", model: "opus" }, { ...cfg, model: "sonnet" }).model, "opus");
});

test("per-agent model picks are saved and survive a restart", () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-cfg-")), "config.json");
  new Config(file).update({ modelPreset: "custom", agentModels: { pulse: "haiku", builder: "opus" } });
  const cfg = new Config(file).get();
  assert.equal(cfg.modelPreset, "custom");
  assert.deepEqual(cfg.agentModels, { pulse: "haiku", builder: "opus" });
  assert.equal(pickModel({ agent: "pulse" }, cfg).model, "haiku");
});

test("near the plan's limit only messages to the Lead start", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-hold-"));
  const store = new Store(path.join(dir, "state.json"));
  const config = { get: () => ({ maxParallel: 3, taskTimeoutMin: 5, maxAutoRounds: 5, usageCeilingPct: 90, modelPreset: "balanced", agentModels: {}, model: "", permissionMode: "safe", extraAllowedTools: [] }) };
  const started = [];
  const runner = (opts) => {
    started.push(opts.agent);
    return { done: new Promise(() => {}), kill() {} };
  };
  const crew = new Crew({ store, config, root: ROOT, runner });
  crew.recordUsage({ status: "allowed_warning", unifiedWindows: { five_hour: { utilization: 0.93, resetsAt: Math.floor(Date.now() / 1000) + 1800 } } });
  assert.equal(crew.usageHold()?.window, "5-hour");
  crew.addTask({ agent: "builder", title: "Build", from: "lead" });
  crew.ownerToLead("Are we close?");
  await crew.tick();
  assert.deepEqual(started, ["lead"]);
  crew.recordUsage({ status: "allowed", unifiedWindows: { five_hour: { utilization: 0.2, resetsAt: Math.floor(Date.now() / 1000) + 1800 } } });
  assert.equal(crew.usageHold(), null);
});

test("a damaged save file is recovered from the backup copy", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-store-"));
  const file = path.join(dir, "state.json");
  const a = new Store(file);
  a.data.games.push({ slug: "first" });
  a.flush();
  a.data.games.push({ slug: "second" });
  a.flush();
  fs.writeFileSync(file, '{"games": [ half-written'); // as if the PC lost power mid-save
  const b = new Store(file);
  assert.deepEqual(b.data.games.map((g) => g.slug), ["first"]);
});

test("after a crash, leftover agent runs are stopped and their tasks resume", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-crash-"));
  const store = new Store(path.join(dir, "state.json"));
  const orphan = spawn("node", ["-e", "setTimeout(() => {}, 60000)"], { stdio: "ignore" });
  store.data.tasks.push({ id: "t1", agent: "builder", title: "Build", status: "working", startedAt: Date.now(), pid: orphan.pid, after: [] });
  const exited = new Promise((r) => orphan.once("exit", r));
  const config = { get: () => ({ maxParallel: 3, usageCeilingPct: 90 }) };
  new Crew({ store, config, root: ROOT, runner: () => ({ done: new Promise(() => {}), kill() {} }) });
  await exited;
  const t = store.data.tasks[0];
  assert.equal(t.status, "queued");
  assert.equal(t.interrupted, 1);
});

test("the vault is read in small pieces: cards, sections and search", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-vault-"));
  const long = Array.from({ length: 400 }, () => "Explaining why in many words.").join(" ");
  fs.writeFileSync(
    path.join(dir, "05 UI and HUD.md"),
    `---\nfor: [frame]\n---\n# 05 UI and HUD\n\nUI that fits phones.\n\n## Rules\n\n### Layout\n\n1. **Tap targets are at least 44 px.**\n   Why: ${long}\n\n**2. Buttons react within 0.1 s.**\nWhy: ${long}\n\n## Shop screens\n\nShop cards show the price on a big button. ${long}\n\n## Checklist\n\n- [ ] Targets are 44 px\n\n## Sources\n\n1. https://example.com\n`,
  );
  const pages = listPages(dir);
  const page = findPage(pages, "ui");
  assert.equal(page.title, "05 UI and HUD");
  assert.deepEqual(page.readers, ["frame"]);
  const c = card(page);
  assert.match(c, /1\. Tap targets are at least 44 px\./);
  assert.match(c, /2\. Buttons react within 0\.1 s\./, "bold-number rule style is read too");
  assert.match(c, /- \[ \] Targets are 44 px/);
  assert.ok(!c.includes("Explaining why"), "the card leaves out the long explanations");
  assert.match(readSections(page, "shop")[0].text, /price on a big button/);
  assert.equal(search(pages, "price button")[0].heading, "Shop screens");
  assert.equal(search(pages, "example.com").length, 0, "sources aren't searched");
});

test("Remote Control: pair, send a request, join live, and get cut off when it's turned off", async () => {
  // A second studio: the friend's PC.
  const dataB = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-b-"));
  const portB = PORT + 200;
  fs.writeFileSync(path.join(dataB, "config.json"), JSON.stringify({ claudeCommand: "node test/fake-claude.mjs", ownerName: "Othman" }));
  const b = spawn("node", ["studio/server.mjs"], { cwd: ROOT, env: { ...env, ROCREW_DATA: dataB, PORT: String(portB) }, stdio: "ignore" });
  try {
    for (let i = 0; i < 50 && !fs.existsSync(path.join(dataB, "runtime.json")); i++) await sleep(100);
    const tokenB = JSON.parse(fs.readFileSync(path.join(dataB, "runtime.json"), "utf8")).token;
    const apiB = async (method, route, body, key = tokenB) => {
      const res = await fetch(`http://127.0.0.1:${portB}${route}`, { method, headers: { "content-type": "application/json", "x-rocrew-token": key }, body: body ? JSON.stringify(body) : undefined });
      return { status: res.status, json: await res.json().catch(() => null) };
    };
    const wait = async (fn, what) => {
      for (let i = 0; i < 60; i++) {
        const v = await fn();
        if (v) return v;
        await sleep(150);
      }
      throw new Error(`timed out waiting for ${what}`);
    };
    await api("POST", "/api/settings", { ownerName: "mxdas" });

    // Pair: mxdas makes a code, Othman types it in; each app learns the other's name.
    const code = (await api("POST", "/api/remote/pair", {})).json.code;
    assert.match(code, /^RC-/);
    assert.equal((await apiB("POST", "/api/remote/pair", { code: "nope" })).status, 400);
    await apiB("POST", "/api/remote/pair", { code });
    await wait(async () => (await state()).remote.partnerName === "Othman", "mxdas to learn Othman's name");
    await wait(async () => (await apiB("GET", "/api/state")).json.remote.partnerName === "mxdas", "Othman to learn mxdas's name");

    // Othman turns on Remote Control; mxdas gets a request.
    await apiB("POST", "/api/remote/share", { on: true });
    const invite = await wait(async () => (await state()).remote.invite, "the request");
    assert.equal(invite.name, "Othman");
    assert.equal(invite.key, undefined, "the key never reaches the page before joining");

    // mxdas joins: lands in Othman's studio as a guest, live, credited by name.
    const { url } = (await api("POST", "/api/remote/answer", { session: invite.session, join: true })).json;
    const key = new URL(url).searchParams.get("key");
    const page = await fetch(url);
    assert.equal(page.status, 200);
    const asGuest = (await apiB("GET", "/api/state", null, key)).json;
    assert.equal(asGuest.me.remote, true);
    assert.equal(asGuest.owner, "Othman");
    assert.equal((await apiB("GET", "/api/settings", null, key)).status, 403, "guests can't change settings");
    await apiB("POST", "/api/lead/message", { text: "Add a lava zone" }, key);
    const bState = await wait(async () => {
      const s = (await apiB("GET", "/api/state")).json;
      return s.remote.sharing.status === "joined" && s;
    }, "Othman to see mxdas joined");
    assert.ok(bState.tasks.some((t) => t.agent === "lead" && t.by === "mxdas"));
    assert.equal((await state()).remote.invite, null);

    // Through the tunnel, live updates come by long-polling; turning it off ends that too.
    const seq = (await apiB("GET", "/api/changes?since=-1", null, key)).json.seq;
    const waiting = apiB("GET", `/api/changes?since=${seq}`, null, key);

    // Othman turns it off: the key stops working at once.
    await apiB("POST", "/api/remote/share", { on: false });
    // A poll that was waiting ends (with 401, or with an update that landed just before), and new ones are refused.
    assert.ok([200, 401].includes((await waiting).status));
    assert.equal((await apiB("GET", `/api/changes?since=${seq}`, null, key)).status, 401);
    assert.equal((await apiB("GET", "/api/state", null, key)).status, 401);
  } finally {
    const exited = new Promise((r) => b.once("exit", r));
    b.kill();
    await exited;
    await api("DELETE", "/api/remote/pair");
    fs.rmSync(dataB, { recursive: true, force: true });
  }
});

test("relay messages are encrypted, signed and can't be replayed", async () => {
  const { Relay, keysFor, seal } = await import("../studio/lib/relay.mjs");
  const got = [];
  const r = new Relay({ relayUrl: "http://x", code: "RC-AAAA-BBBB-CCCC-DDDD", me: "me", onMessage: (m) => got.push(m) });
  const line = (msg, key = keysFor("RC-AAAA-BBBB-CCCC-DDDD").key) => JSON.stringify({ event: "message", id: "1", message: seal(key, msg) });
  const msg = { type: "invite", sender: "them", at: Date.now(), nonce: "n1" };
  r.handleLine(line(msg));
  r.handleLine(line(msg)); // replay
  r.handleLine(line({ ...msg, nonce: "n2" }, keysFor("RC-ZZZZ-ZZZZ-ZZZZ-ZZZZ").key)); // wrong pair code
  r.handleLine(line({ ...msg, nonce: "n3", at: Date.now() - 3600000 })); // too old
  r.handleLine(line({ ...msg, nonce: "n4", sender: "me" })); // my own
  r.handleLine(JSON.stringify({ event: "message", message: "not encrypted" }));
  assert.equal(got.length, 1);
  assert.notEqual(keysFor("RC-AAAA-BBBB-CCCC-DDDD").topic, keysFor("RC-AAAA-BBBB-CCCC-DDDE").topic);
});

test("the Roblox sign-in check reads who is signed in, and never mistakes 'offline' for 'signed out'", () => {
  assert.deepEqual(parseWhoAmI('<html><body><pre>{"id":123,"name":"mxdas","displayName":"mx"}</pre></body></html>'), { signedIn: true, name: "mxdas", displayName: "mx", userId: 123, error: null });
  assert.equal(parseWhoAmI('<pre>{"errors":[{"code":0,"message":"Unauthorized"}]}</pre>').signedIn, false);
  assert.equal(parseWhoAmI(""), null);
});

test("browser tasks get the signed-in browser one at a time, and only once signed in", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-browser-"));
  const store = new Store(path.join(dir, "state.json"));
  const config = { get: () => ({ maxParallel: 5, usageCeilingPct: 90, modelPreset: "balanced", agentModels: {}, model: "", permissionMode: "safe", extraAllowedTools: [], taskTimeoutMin: 5, maxAutoRounds: 5 }) };
  const runs = [];
  const crew = new Crew({ store, config, root: ROOT, runner: (o) => (runs.push(o), { done: new Promise(() => {}), kill() {} }) });
  let signedIn = false;
  crew.browserTool = { available: () => signedIn, accountName: () => "mxdas", mcpConfig: () => '{"mcpServers":{"roblox-browser":{}}}' };
  crew.addTask({ agent: "liveops", title: "Read D1 retention", from: "lead" });
  crew.tick();
  assert.deepEqual(runs[0].mcpConfigs, [], "no browser before signing in");
  signedIn = true;
  crew.addTask({ agent: "merchant", title: "Create passes", from: "lead" });
  crew.addTask({ agent: "pulse", title: "Look at charts", from: "lead", browser: true });
  crew.tick();
  const merchant = runs.find((r) => r.agent === "merchant");
  assert.equal(merchant.mcpConfigs.length, 1);
  assert.ok(merchant.allowedTools.includes("mcp__roblox-browser"));
  assert.match(merchant.prompt, /signed in to the owner's Roblox account as mxdas/);
  assert.ok(!runs.some((r) => r.agent === "pulse"), "the second browser task waits for the first");
});

test("market openings rank genres where young games are winning", () => {
  const day = 86400000;
  const g = (id, players, ageDays) => ({ id, players, ageDays });
  const sort = (genre, games) => ({ name: genre, genre, games: games.map((x, i) => ({ rank: i + 1, universeId: x.id, name: `G${x.id}`, players: x.players, up: 90, down: 10 })) });
  const young = [g(1, 5000, 30), g(2, 4000, 60), g(3, 3000, 90), g(4, 2000, 400)];
  const old = [g(5, 90000, 2000), g(6, 80000, 1500), g(7, 70000, 1800), g(8, 1000, 20)];
  const snaps = [{ at: Date.now(), sorts: { "trending-in-survival": sort("Survival", young), "trending-in-rpg": sort("RPG", old) } }];
  const details = Object.fromEntries([...young, ...old].map((x) => [x.id, { created: new Date(Date.now() - x.ageDays * day).toISOString() }]));
  const list = openings(snaps, details);
  assert.equal(list[0].genre, "Survival");
  assert.equal(list[0].youngShare, 75);
  assert.equal(list[0].examples[0].name, "G1");
  assert.equal(list[1].youngShare, 25);
});

test("store art: variants in parallel, finished to Roblox sizes with real text, judged at phone size", async (t) => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    return t.skip("ffmpeg isn't installed");
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-art-"));
  const src = path.join(dir, "src.png");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=orange:s=1376x768", "-frames:v", "1", src]);
  const prompts = [];
  const generate = async ({ prompt, out }) => {
    prompts.push(prompt);
    fs.copyFileSync(src, `${out}.png`);
    return { file: `${out}.png` };
  };
  const ask = async () => '{"id":"A","ctr":8,"ai_clean":7,"text_seen":"MEGA EGGS","worst":"busy sky","fix":"simplify the sky"}\n{"id":"B","ctr":5,"ai_clean":6,"text_seen":"MEGA EGS","worst":"","fix":""}';
  const set = await makeStoreArt({ apiKey: "k", kind: "thumb", variants: ["A: warm grade", "B: cool grade"], refs: [src], dir, text: "Mega eggs", hasFfmpeg: async () => true, generate, ask });
  assert.equal(prompts.length, 2);
  assert.ok(prompts.every((p) => p.includes(ENDINGS.edit)), "captures are finished, not reinvented");
  const a = set.candidates[0];
  assert.match(a.file, /thumb_A\.jpg$/);
  const dims = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", a.file], { encoding: "utf8" }).trim();
  assert.equal(dims, "1920,1080");
  assert.ok(fs.statSync(a.file).size < 3_000_000, "under Roblox's 3 MB limit");
  assert.ok(fs.existsSync(set.sheet));
  assert.equal(a.score.ctr, 8);
  assert.ok(set.candidates[1].score.textMismatch, "misspelled text is flagged");
  await assert.rejects(makeStoreArt({ apiKey: "k", kind: "thumb", variants: ["A"], dir, text: "way too many words here", hasFfmpeg: async () => true, generate, ask }));
});

test("live updates by long-polling return as soon as something changes", async () => {
  const { seq } = (await api("GET", "/api/changes?since=-1")).json;
  const started = Date.now();
  const poll = api("GET", `/api/changes?since=${seq}`);
  await sleep(200);
  await api("POST", "/api/pause", { paused: true });
  await api("POST", "/api/pause", { paused: false });
  const r = await poll;
  assert.ok(r.json.seq > seq);
  assert.ok(r.json.events.length >= 1);
  assert.ok(Date.now() - started < 5000);
});
