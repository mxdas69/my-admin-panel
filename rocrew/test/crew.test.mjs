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

test("the API refuses requests without the token or from another host", async () => {
  assert.equal((await api("GET", "/api/state", null, { "x-rocrew-token": "nope" })).status, 401);
  const foreignHost = await new Promise((resolve) => {
    http.get({ host: "127.0.0.1", port: PORT, path: "/api/state", headers: { host: "evil.example", "x-rocrew-token": token } }, (res) => resolve(res.statusCode));
  });
  assert.equal(foreignHost, 403);
  assert.equal((await api("GET", "/api/state")).status, 200);
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
