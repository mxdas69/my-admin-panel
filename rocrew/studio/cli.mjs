#!/usr/bin/env node
// The crew's line to the studio app. Agents run this through Bash; you can too.
// Run `node studio/cli.mjs help` for the commands.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(process.env.ROCREW_ROOT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const ME = process.env.ROCREW_AGENT || "lead";
const GAME = process.env.ROCREW_GAME || "";

const HELP = `RoCrew CLI — node studio/cli.mjs <command> [options]

Work
  status                                   Games, open tasks and what waits on the owner
  task add --agent <id> --title "…" [--brief "…" | --brief-file f] [--game slug]
           [--after t1,t2] [--studio yes|no]   Queue work for an agent (prints the task id)
  task list [--game slug] [--all]          Open tasks (or every task with --all)
  say --to <id> "…"                         Post a handoff note on the team feed

The owner
  ask --title "…" [--body "…"] [--game slug]            Add a "Needs you" checkpoint
  review --file <path> --question "…" [--title "…"] [--group "…"] [--game slug]
                                                         Put an image or video in the owner's Review queue
  pitch --file <pitch.json>                              Submit a game pitch (Pulse)

Games and library
  game add --name "…" [--slug s]
  game update --slug s [--version v1] [--whatsnew "…"] [--universe 123]
  asset add --kind model|icon|image|sound|effect|animation --name "…" [--file f] [--roblox-id 123] [--tags a,b] [--game s]
  system add --name "…" --summary "…" [--path f] [--game s]
  upload --file <image> --name "…"         Upload an image to Roblox as a Decal (Open Cloud); prints the asset id

Generators and intel
  image --prompt "…" --out <path> [--aspect 16:9] [--ref img.png,…] [--review "question"] [--title "…"]
                                            Generate an image with Gemini
  gemini --prompt "…" [--image a.png,…]    Ask Gemini for a second opinion
  market [--refresh] [--json]              Roblox charts, rank moves and breakouts

Agent ids: lead pulse architect librarian builder frame scenic playtest kid-tester balance splash reviewer liveops merchant producer`;

function parse(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) opts[key] = true;
      else opts[key] = argv[++i];
    } else opts._.push(a);
  }
  return opts;
}

function runtime() {
  const file = path.join(process.env.ROCREW_DATA ?? path.join(ROOT, ".rocrew"), "runtime.json");
  if (!fs.existsSync(file)) fail("The RoCrew app isn't running. Start it with: node studio/server.mjs");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function api(method, route, body) {
  const { port, host, token } = runtime();
  const h = host === "0.0.0.0" ? "127.0.0.1" : host;
  let res;
  try {
    res = await fetch(`http://${h}:${port}${route}`, {
      method,
      headers: { "content-type": "application/json", "x-rocrew-token": token },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    fail(`Could not reach the RoCrew app on port ${port} (${err.cause?.code ?? err.message}). Is it running?`);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) fail(json.error ?? `HTTP ${res.status}`);
  return json;
}

function fail(msg) {
  console.error(`rocrew: ${msg}`);
  process.exit(1);
}

function list(v) {
  return v === undefined || v === true ? [] : String(v).split(",").map((s) => s.trim()).filter(Boolean);
}

function yesNo(v) {
  if (v === undefined) return undefined;
  return v === true || /^(y|yes|true|1)$/i.test(String(v));
}

const o = parse(process.argv.slice(2));
const [cmd, sub] = o._;
const game = typeof o.game === "string" ? o.game : GAME || undefined;

switch (cmd) {
  case undefined:
  case "help":
  case "--help":
    console.log(HELP);
    break;

  case "status": {
    const s = await api("GET", "/api/state");
    const name = (id) => s.agents.find((a) => a.id === id)?.name ?? id;
    console.log(`Games: ${s.games.map((g) => `${g.name} (${g.slug}) ${g.version}`).join(", ") || "none"}`);
    console.log(`Paused: ${s.paused ? "yes" : "no"} · Studio held by: ${s.studioHolder ? name(s.studioHolder) : "nobody"}`);
    const open = s.tasks.filter((t) => t.status === "working" || t.status === "queued");
    console.log(`\nOpen tasks (${open.length}):`);
    for (const t of open) console.log(`  ${t.id}  ${t.status.padEnd(7)} ${name(t.agent).padEnd(12)} ${t.title}${t.game ? `  [${t.game}]` : ""}${t.after.length ? `  after ${t.after.join(",")}` : ""}`);
    const recent = s.tasks.filter((t) => ["done", "failed", "blocked"].includes(t.status)).slice(-8);
    console.log(`\nRecently finished:`);
    for (const t of recent) console.log(`  ${t.id}  ${t.status.padEnd(7)} ${name(t.agent).padEnd(12)} ${t.title}`);
    const asks = s.asks.filter((a) => a.status === "open");
    console.log(`\nWaiting on the owner: ${asks.length} checkpoint(s), ${s.reviews.filter((r) => r.status === "pending").length} review item(s)`);
    for (const a of asks) console.log(`  ${a.id}  ${a.title}${a.reply ? `  (reply: ${a.reply})` : ""}`);
    break;
  }

  case "task": {
    if (sub === "add") {
      if (!o.agent || !o.title) fail('Usage: task add --agent <id> --title "…" [--brief "…"]');
      const brief = o["brief-file"] ? fs.readFileSync(path.resolve(ROOT, o["brief-file"]), "utf8") : o.brief === true ? "" : o.brief ?? "";
      const t = await api("POST", "/api/tasks", { agent: o.agent, title: o.title, brief, game, after: list(o.after), studio: yesNo(o.studio), from: ME });
      console.log(`${t.id} queued for ${t.agent}${t.studio ? " (needs Studio)" : ""}${t.after.length ? ` after ${t.after.join(", ")}` : ""}`);
    } else if (sub === "list") {
      const s = await api("GET", "/api/state");
      const tasks = s.tasks.filter((t) => (o.all || t.status === "working" || t.status === "queued") && (!o.game || t.game === o.game));
      for (const t of tasks) console.log(`${t.id}\t${t.status}\t${t.agent}\t${t.title}${t.result && o.all ? `\n\t→ ${t.result.replace(/\s+/g, " ").slice(0, 200)}` : ""}`);
    } else fail("Usage: task add|list …");
    break;
  }

  case "say": {
    const text = o._.slice(1).join(" ") || o.text;
    if (!text || !o.to) fail('Usage: say --to <id> "…"');
    await api("POST", "/api/feed", { from: ME, to: o.to, text });
    console.log("posted");
    break;
  }

  case "ask": {
    if (!o.title) fail('Usage: ask --title "…" [--body "…"]');
    const a = await api("POST", "/api/asks", { from: ME, title: o.title, body: o.body === true ? "" : o.body ?? "", game });
    console.log(`${a.id} added to the owner's "Needs you" list. Their reply comes back to the Lead.`);
    break;
  }

  case "review": {
    if (!o.file || !o.question) fail('Usage: review --file <path> --question "…"');
    const r = await api("POST", "/api/reviews", { from: ME, file: o.file, question: o.question, title: o.title, group: o.group, game });
    console.log(`${r.id} is in the owner's Review queue. Their verdict reaches you on your next pass.`);
    break;
  }

  case "pitch": {
    if (!o.file) fail("Usage: pitch --file <pitch.json>");
    const data = JSON.parse(fs.readFileSync(path.resolve(ROOT, o.file), "utf8"));
    const p = await api("POST", "/api/pitches", data);
    console.log(`${p.id} pitch "${p.title}" is waiting for the owner's decision.`);
    break;
  }

  case "game": {
    if (sub === "add") {
      if (!o.name) fail('Usage: game add --name "…"');
      const g = await api("POST", "/api/games", { name: o.name, slug: o.slug });
      console.log(`game ${g.slug} — folder games/${g.slug}/`);
    } else if (sub === "update") {
      if (!o.slug && !game) fail("Usage: game update --slug s …");
      const g = await api("PATCH", `/api/games/${o.slug ?? game}`, { version: o.version, whatsNew: o.whatsnew, universeId: o.universe, name: o.name });
      console.log(`updated ${g.slug} (${g.version})`);
    } else fail("Usage: game add|update …");
    break;
  }

  case "asset": {
    if (sub !== "add" || !o.kind || !o.name) fail('Usage: asset add --kind <kind> --name "…" [--file f] [--roblox-id 123]');
    const a = await api("POST", "/api/library/assets", { from: ME, kind: o.kind, name: o.name, file: o.file, robloxId: o["roblox-id"], tags: list(o.tags), game });
    console.log(`${a.id} added to the Library${a.robloxId ? ` (rbxassetid://${a.robloxId})` : ""}`);
    break;
  }

  case "system": {
    if (sub !== "add" || !o.name) fail('Usage: system add --name "…" --summary "…"');
    const s = await api("POST", "/api/library/systems", { from: ME, name: o.name, summary: o.summary, path: o.path, game });
    console.log(`${s.id} added to the Library systems`);
    break;
  }

  case "upload": {
    if (!o.file) fail('Usage: upload --file <image> --name "…"');
    const r = await api("POST", "/api/upload", { file: o.file, name: o.name });
    console.log(`rbxassetid://${r.assetId}`);
    break;
  }

  case "image": {
    if (!o.prompt || !o.out) fail('Usage: image --prompt "…" --out <path> [--aspect 16:9]');
    const r = await api("POST", "/api/image", { prompt: o.prompt, out: o.out, aspect: o.aspect, refs: list(o.ref), title: o.title });
    console.log(r.file);
    if (r.text) console.log(`gemini: ${r.text}`);
    if (typeof o.review === "string") {
      const rv = await api("POST", "/api/reviews", { from: ME, file: r.file, question: o.review, title: o.title, group: o.group, game });
      console.log(`${rv.id} sent to the owner's Review queue`);
    }
    break;
  }

  case "gemini": {
    if (!o.prompt) fail('Usage: gemini --prompt "…"');
    const r = await api("POST", "/api/gemini", { prompt: o.prompt, images: list(o.image) });
    console.log(r.text);
    break;
  }

  case "market": {
    const m = o.refresh ? await api("POST", "/api/market/refresh") : await api("GET", "/api/market");
    if (o.json) {
      console.log(JSON.stringify({ moves: m.moves, breakouts: m.breakouts, latest: m.latest }, null, 2));
      break;
    }
    if (m.error) console.log(`Last refresh failed: ${m.error}`);
    if (!m.latest) {
      console.log("No chart snapshot yet. Run: node studio/cli.mjs market --refresh");
      break;
    }
    console.log(`Charts from ${new Date(m.latest.at).toISOString()} (${m.snapshots} snapshot(s) stored)`);
    for (const [id, sort] of Object.entries(m.latest.sorts)) {
      console.log(`\n${sort.name} [${id}]`);
      for (const g of sort.games.slice(0, 15)) {
        const like = g.up + g.down ? `${Math.round((g.up / (g.up + g.down)) * 100)}%` : "-";
        console.log(`  #${String(g.rank).padEnd(3)} ${g.name.slice(0, 40).padEnd(40)} ${String(g.players).padStart(8)} playing  ${like.padStart(4)} liked  u${g.universeId}`);
      }
    }
    if (m.moves.length) console.log(`\nBiggest moves: ${m.moves.map((x) => `${x.name} (${x.isNew ? "new" : `${x.rankDelta > 0 ? "+" : ""}${x.rankDelta}`})`).join(", ")}`);
    if (m.breakouts.length) console.log(`\nBreakouts: ${m.breakouts.slice(0, 10).map((b) => `${b.name} (${b.peak} peak, ${b.visits} visits)`).join(", ")}`);
    break;
  }

  default:
    fail(`Unknown command "${cmd}". Run: node studio/cli.mjs help`);
}
