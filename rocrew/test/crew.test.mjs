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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-test-"));
const PORT = 4700 + Math.floor(Math.random() * 200);
const GAME = `zz-test-${process.pid}`;
let server;
let token;

const env = { ...process.env, ROCREW_DATA: DATA, PORT: String(PORT), FAKE_DELAY: "300" };
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

after(() => {
  server?.kill();
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
