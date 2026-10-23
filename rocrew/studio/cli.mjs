#!/usr/bin/env node
// The crew's line to the studio app. Agents run this through Bash; you can too.
// Run `node studio/cli.mjs help` for the commands.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { listPages, findPage, card, toc, readSections, search } from "./lib/vault.mjs";

const ROOT = path.resolve(process.env.ROCREW_ROOT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const ME = process.env.ROCREW_AGENT || "lead";
const GAME = process.env.ROCREW_GAME || "";

const HELP = `RoCrew CLI — node studio/cli.mjs <command> [options]

Work
  status                                   Games, open tasks and what waits on the owner
  task add --agent <id> --title "…" --plain "…" [--brief "…" | --brief-file f] [--game slug]
                                           --plain: 1-2 sentences for the owner in everyday words (what changes in
                                           the game and why). No file names or code words. Shown when they approve.
           [--after t1,t2] [--studio yes|no] [--browser yes|no] [--size small|normal|big] [--model opus|sonnet|haiku]
                                           Queue work for an agent (prints the task id).
                                           --size small: quick, mechanical work on a lighter model.
                                           --size big: hard design or code on Opus with more thinking.
                                           --browser yes: give the agent the browser signed in to the owner's
                                           Roblox account (Creator Hub stats, funnels, passes). On by default
                                           for liveops and merchant.
  task list [--game slug] [--all]          Open tasks (or every task with --all)
  say --to <id> "…"                         Post a handoff note on the team feed

The vault (read it in small pieces — pages are long, and every word read costs the owner's plan)
  vault                                    Every page, its length and who it's for
  vault card <page>                        A page's Rules and Checklist: read this first (e.g. vault card ui)
  vault toc <page>                         A page's headings with word counts
  vault read <page> --section "<heading>"  Just the sections you need (e.g. --section "shop")
  vault search "<words>"                   Find the sections that cover something, across all pages
                                           <page> can be loose: "ui", "05", "obby", "first five"

The owner
  ask --title "…" [--body "…"] [--game slug]            Add a "Needs you" checkpoint (a question or a decision)
  test --title "Try the shop on your phone" --steps "Open the game|Tap Shop|Buy the small pack"
       [--media shot1.png,shot2.png | --media clip.mp4] [--body "…"]
                                                         Ask the owner to test something. Steps are split on "|".
                                                         Always show them: screenshots of each step, or a clip.
  clip --images a.png,b.png,c.png --out games/<slug>/media/how-to-test.mp4 [--seconds 2.5]
                                                         Turn screenshots into a short video (needs ffmpeg)
  review --file <path> --question "…" [--title "…"] [--group "…"] [--game slug]
                                                         Put an image or video in the owner's Review queue
  pitch --file <pitch.json>                              Submit a game pitch (Pulse)

Games and library
  game add --name "…" [--slug s]
  game update --slug s [--version v1] [--whatsnew "…"] [--universe 123]
  asset add --kind model|icon|image|sound|effect|animation --name "…" [--file f] [--roblox-id 123] [--tags a,b] [--game s]
  system add --name "…" --summary "…" [--path f] [--game s]
  upload --file <image> --name "…"         Upload an image to Roblox as a Decal (Open Cloud); prints the asset id

Gemini app (free, made by the owner, never waited for)
  gemini-prompt --title "Thumbnail: DAY 1 vs DAY 999" --prompt "…" [--kind thumb|icon|pass] [--ref capture.png]
                                            Gives the owner a ready prompt to paste into gemini.google.com, plus the
                                            capture to upload. Their image lands in Review. Carry on straight away.

Store art (Splash) — the cheap, high-quality way to make icons and thumbnails
  store-art icon|thumb|pass --variants "A: warm sunset grade|B: cool night grade|C: tighter crop|D: stronger hero glow"
           [--ref games/<slug>/art/cap_wide.png,games/<slug>/art/cap_hero.png] [--text "MEGA EGGS"] [--game slug]
                                            Finishes your Studio captures into 4 variants in parallel (Gemini), sets
                                            the title text with ffmpeg, scores each at phone size, and sends the set
                                            to the owner's Review. Each variant changes ONE thing.
           --format day1-vs-day999|before-after|1-vs-100|giant-item|reaction|rarity-reveal   (thumbnails)
                                            Proven clickable layouts; split formats get "DAY 1 / DAY 999" style labels.
           --chart trending-in-simulation   use that chart's top thumbnails/icons as style references (default top-trending)
           --green-screen [--backdrop jungle|night|fire|gold|ice|candy]
                                            Free, no AI: the --ref capture was shot on a pure green backdrop in Studio;
                                            the characters are cut out onto a stylized backdrop with a glow
           --style-refs 2|3|4|none          how many top-game references to send (default 2)

Generators and intel
  image --prompt "…" --out <path> [--aspect 16:9] [--ref img.png,…] [--review "question"] [--title "…"]
                                            Generate an image with Gemini
  gemini --prompt "…" [--image a.png,…]    Ask Gemini for a second opinion
  market [--refresh] [--json]              Openings by genre, breakouts, rank moves, top charts (compact)
  market --sort <chart>                    One full chart, e.g. --sort trending-in-survival
  market art <id>[,<id>,…]                 Save games' icons and thumbnails as images you can look at (Read them)
  market search "<words>"                 Top games for a keyword or format ("+1 speed", "climb"), biggest first
  market game <id>[,<id>,…]                Deep dive (up to 8 games in one command; don't loop): numbers, like ratio, pass and product prices,
                                           badge activity, similar games, 14 days of player counts

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

  case "store-art": {
    const kind = sub;
    if (!["icon", "thumb", "pass"].includes(kind) || typeof o.variants !== "string") {
      fail('Usage: store-art icon|thumb|pass --variants "A line|B line|C line|D line" [--ref shot.png,hero.png] [--text "2 WORDS"] [--game slug]');
    }
    console.log(`Making ${o.variants.split("|").length} ${kind === "icon" ? "icons" : "thumbnails"} with Gemini (about a minute)…`);
    const r = await api("POST", "/api/store-art", { kind, variants: o.variants.split("|"), refs: list(o.ref), text: typeof o.text === "string" ? o.text : "", format: typeof o.format === "string" ? o.format : "", greenScreen: Boolean(o["green-screen"]), backdrop: typeof o.backdrop === "string" ? o.backdrop : "", chart: typeof o.chart === "string" ? o.chart : "", styleRefs: o["style-refs"] === "none" ? "none" : Number(o["style-refs"]) || 2, game, question: typeof o.question === "string" ? o.question : "", from: ME });
    for (const c of r.candidates) {
      if (c.error) console.log(`${c.id}: failed — ${c.error}`);
      else console.log(`${c.id}: ${c.file}${c.score ? `  clicks ${c.score.ctr}/10, hand-made ${c.score.ai_clean}/10${c.score.textMismatch ? ", TEXT WRONG" : ""}${c.score.worst ? ` — worst: ${c.score.worst}; fix: ${c.score.fix}` : ""}` : ""}`);
    }
    if (r.freeMode) console.log("Free mode: Gemini's image model isn't available on this key, so these are your Studio captures graded and finished with ffmpeg (no AI).");
    if (r.styleFrom) console.log(`Style references (top games right now): ${r.styleFrom}`);
    console.log(`\nSent to the owner's Review as "${r.group}".${r.sheet ? ` Phone-size sheet: ${r.sheet}` : ""}${r.finished ? "" : " (ffmpeg isn't installed, so no resizing, title text or scores.)"}`);
    break;
  }

  case "gemini-prompt": {
    if (typeof o.title !== "string" || typeof o.prompt !== "string") fail('Usage: gemini-prompt --title "Thumbnail: DAY 1 vs DAY 999" --prompt "what to make" [--kind thumb|icon|pass] [--ref capture.png]');
    const { ENDINGS } = await import("./lib/storeArt.mjs");
    const kind = ["icon", "pass"].includes(o.kind) ? o.kind : "thumb";
    const refs = list(o.ref);
    const full = `${o.prompt.trim()} ${refs.length ? `${ENDINGS.edit} ` : ""}${ENDINGS[kind]}${kind === "thumb" ? " Make it 16:9 widescreen." : " Make it square."}`;
    const a = await api("POST", "/api/asks", { from: ME, title: o.title, body: full, game, kind: "gemini", media: refs });
    console.log(`${a.id}: the owner gets a one-tap "copy prompt" card for the Gemini app. Don't wait for it: carry on with your work. Their image will appear in Review if they make one.`);
    break;
  }

  case "vault": {
    const pages = listPages(path.join(ROOT, "vault"));
    const name = o._.slice(2).join(" ") || (typeof o.page === "string" ? o.page : "");
    const need = () => {
      const page = findPage(pages, name);
      if (!page) fail(`No vault page matches "${name}". Run: node studio/cli.mjs vault`);
      return page;
    };
    if (!sub || sub === "list") {
      for (const p of pages) {
        const who = p.readers.length === 15 ? "everyone" : p.readers.join(", ");
        console.log(`${p.title.padEnd(44)} ${String(p.words).padStart(6)} words${who ? `  for: ${who}` : ""}`);
      }
      console.log(`\nRead a page's card first: node studio/cli.mjs vault card "<page>"`);
    } else if (sub === "card") {
      const page = need();
      console.log(card(page));
      console.log(`\n(${page.words} words in the full page. Pull more with: node studio/cli.mjs vault toc "${page.title}", then vault read "${page.title}" --section "…")`);
    } else if (sub === "toc") {
      const page = need();
      console.log(`${page.title} — ${page.words} words`);
      for (const h of toc(page.text)) console.log(`${h.level === 2 ? "" : "    "}${h.heading}${h.words ? `  (${h.words} words)` : ""}`);
    } else if (sub === "read") {
      const page = need();
      if (typeof o.section !== "string") {
        console.log(card(page));
        console.log(`\nThat's the card. Name a section to read more:\n${toc(page.text).filter((h) => h.level === 2).map((h) => `  --section "${h.heading}"  (${h.words} words)`).join("\n")}`);
        break;
      }
      const hits = readSections(page, o.section);
      if (!hits.length) fail(`No section in "${page.title}" matches "${o.section}". Run: node studio/cli.mjs vault toc "${page.title}"`);
      console.log(hits.map((h) => h.text).join("\n\n"));
    } else if (sub === "search") {
      const q = o._.slice(2).join(" ");
      if (!q) fail('Usage: vault search "daily rewards"');
      const hits = search(pages, q);
      if (!hits.length) console.log(`Nothing in the vault mentions "${q}".`);
      for (const h of hits) console.log(`${h.page} › ${h.heading}  (${h.words} words)\n    …${h.snippet}…\n    node studio/cli.mjs vault read "${h.page}" --section "${h.heading}"`);
    } else fail("Usage: vault [card|toc|read|search] …");
    break;
  }

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
      const t = await api("POST", "/api/tasks", {
        agent: o.agent,
        title: o.title,
        brief,
        game,
        after: list(o.after),
        studio: yesNo(o.studio),
        browser: yesNo(o.browser),
        plain: typeof o.plain === "string" ? o.plain : "",
        size: typeof o.size === "string" ? o.size : undefined,
        model: typeof o.model === "string" ? o.model : undefined,
        from: ME,
      });
      console.log(`${t.id} queued for ${t.agent}${t.studio ? " (needs Studio)" : ""}${t.size !== "normal" ? ` [${t.size}]` : ""}${t.after.length ? ` after ${t.after.join(", ")}` : ""}`);
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

  case "ask":
  case "test": {
    if (!o.title) fail(`Usage: ${cmd} --title "…" [--body "…"]${cmd === "test" ? ' --steps "step 1|step 2"' : ""}`);
    const steps = o["steps-file"]
      ? fs.readFileSync(path.resolve(ROOT, o["steps-file"]), "utf8").split("\n")
      : typeof o.steps === "string"
        ? o.steps.split("|")
        : [];
    if (cmd === "test" && !steps.length) fail('A test needs --steps "first step|second step|…" so the owner knows exactly what to do.');
    const media = [...list(o.media), ...(typeof o.video === "string" ? [o.video] : [])];
    const a = await api("POST", "/api/asks", { from: ME, title: o.title, body: o.body === true ? "" : o.body ?? "", game, kind: cmd === "test" || o.test ? "test" : "question", steps, media });
    console.log(`${a.id} added to the owner's "Needs you" list${a.kind === "test" ? ` as a test with ${a.steps.length} step(s) and ${a.media.length} picture(s)/clip(s)` : ""}. Their answer comes back to the Lead.`);
    break;
  }

  case "clip": {
    const images = list(o.images);
    if (!images.length || typeof o.out !== "string") fail("Usage: clip --images a.png,b.png --out <file.mp4> [--seconds 2.5]");
    try {
      execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    } catch {
      console.log("ffmpeg isn't installed, so no video was made. Attach the screenshots with --media instead: the app plays them as a step-by-step slideshow.");
      break;
    }
    const seconds = Math.min(10, Math.max(0.5, Number(o.seconds) || 2.5));
    const listFile = path.join(os.tmpdir(), `rocrew-clip-${process.pid}.txt`);
    const esc = (f) => path.resolve(ROOT, f).split(path.sep).join("/").replace(/'/g, "'\\''");
    const lines = images.flatMap((f) => [`file '${esc(f)}'`, `duration ${seconds}`]);
    lines.push(`file '${esc(images.at(-1))}'`);
    fs.writeFileSync(listFile, lines.join("\n"));
    const out = path.resolve(ROOT, o.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile, "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x0b0911,format=yuv420p", "-r", "30", out]);
    fs.rmSync(listFile, { force: true });
    console.log(path.relative(ROOT, out));
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
    if (sub === "art") {
      const ids = o._.slice(2).join(",").replace(/[^\d,]/g, "").replace(/,+/g, ",").replace(/^,|,$/g, "");
      if (!ids) fail("Usage: market art <universeId>[,<universeId>…]");
      const r = await api("GET", `/api/market/art/${ids}`);
      console.log(r.files.length ? `Saved ${r.files.length} image(s). Look at them with the Read tool:\n${r.files.join("\n")}` : "Roblox returned no images.");
      break;
    }
    if (sub === "search") {
      const q = o._.slice(2).join(" ");
      if (!q) fail('Usage: market search "+1 speed"');
      const list = await api("GET", `/api/market/search?q=${encodeURIComponent(q)}`);
      for (const g of list) console.log(`${String(g.playing).padStart(7)} playing  ${String(g.likePct ?? "-").padStart(4)}% liked  ${String(g.ageDays ?? "?").padStart(4)}d old  ${g.name}  [u${g.universeId}]`);
      if (!list.length) console.log("No games found.");
      break;
    }
    if (sub === "game") {
      const ids = o._.slice(2).join(",").replace(/[^\d,]/g, "").replace(/,+/g, ",").replace(/^,|,$/g, "");
      if (!ids) fail("Usage: market game <universeId>[,<universeId>…]  (up to 8 at once)");
      const res = await api("GET", `/api/market/game/${ids}`);
      for (const g of Array.isArray(res) ? res : [res]) {
        if (g.error) {
          console.log(`u${g.universeId}: ${g.error}\n`);
          continue;
        }
        console.log(`${g.name} (universe ${g.universeId}, place ${g.placeId}) by ${g.creator}`);
        console.log(`${g.playing} playing · ${g.visits} visits · ${g.likePct ?? "-"}% liked · ${g.favoritesPer1kVisits ?? "-"} favorites per 1k visits · ${g.ageDays ?? "?"} days old · updated ${g.updated?.slice(0, 10) ?? "?"} · genre ${g.genre || "-"}`);
        if (g.playersLast14Days.length) console.log(`Players, last 14 days: ${g.playersLast14Days.map((d) => d.players).join(" → ")}`);
        if (g.passes.length) console.log(`Game passes (${g.passes.length}): ${g.passes.map((p) => `${p.name} ${p.price ?? "off sale"}`).join(", ")}`);
        if (g.products.length) console.log(`Developer products (${g.products.length}): ${g.products.map((p) => `${p.name} ${p.price ?? "-"}`).join(", ")}`);
        if (g.badges.length) console.log(`Badges awarded yesterday: ${g.badges.map((b) => `${b.name} ${b.pastDay ?? "-"}`).join(", ")}`);
        if (g.similar.length) console.log(`Similar: ${g.similar.map((x) => `${x.name} (${x.players})`).join(", ")}`);
        for (const n of g.notes) console.log(`note: ${n}`);
        console.log("");
      }
      break;
    }
    const m = o.refresh ? await api("POST", "/api/market/refresh") : await api("GET", "/api/market");
    if (o.json) {
      console.log(JSON.stringify({ openings: m.openings, moves: m.moves, breakouts: m.breakouts.slice(0, 20) }, null, 2));
      break;
    }
    if (m.error) console.log(`Last refresh failed: ${m.error}`);
    if (!m.latest) {
      console.log("No chart snapshot yet. Run: node studio/cli.mjs market --refresh (takes about 30 s)");
      break;
    }
    const like = (g) => (g.up + g.down ? `${Math.round((g.up / (g.up + g.down)) * 100)}%` : "-");
    if (typeof o.sort === "string") {
      const sort = m.latest.sorts[o.sort];
      if (!sort) fail(`No chart "${o.sort}". Charts: ${Object.keys(m.latest.sorts).join(", ")}`);
      console.log(sort.name);
      for (const g of sort.games) console.log(`  #${String(g.rank).padEnd(3)} ${g.name.slice(0, 40).padEnd(40)} ${String(g.players).padStart(8)} playing  ${like(g).padStart(4)} liked  u${g.universeId}${g.sponsored ? "  (sponsored)" : ""}`);
      break;
    }
    console.log(`Charts from ${new Date(m.latest.at).toISOString()} · ${m.snapshots} snapshot(s) stored, one every 3 hours`);
    if (m.openings?.length) {
      console.log("\nOpenings (genres where young games are winning; higher score = easier to break in):");
      for (const x of m.openings.slice(0, 8)) console.log(`  ${String(x.score).padStart(5)}  ${x.genre.padEnd(28)} ${String(x.youngShare).padStart(3)}% under 4 months old · median ${x.medianPlayers} playing · ${x.avgLikePct ?? "-"}% liked${x.newcomers !== null ? ` · ${x.newcomers} new on the chart` : ""}${x.examples.length ? ` · e.g. ${x.examples.map((e) => `${e.name} (${e.players}, ${e.ageDays}d)`).join(", ")}` : ""}`);
    }
    if (m.breakouts.length) console.log(`\nBreakouts (young, small, pulling players): ${m.breakouts.slice(0, 10).map((b) => `${b.name} [u${b.universeId}] ${b.peak} peak, ${b.ageDays ?? "?"}d old, ${b.likePct ?? "-"}% liked`).join("; ")}`);
    if (m.moves.length) console.log(`\nBiggest moves: ${m.moves.map((x) => `${x.name} (${x.isNew ? "new" : `${x.rankDelta > 0 ? "+" : ""}${x.rankDelta}`} in ${x.sortName})`).join(", ")}`);
    for (const id of ["up-and-coming", "top-trending", "top-earning"]) {
      const sort = m.latest.sorts[id];
      if (sort) console.log(`\n${sort.name}: ${sort.games.filter((g) => !g.sponsored).slice(0, 10).map((g) => `${g.name} (${g.players})`).join(", ")}`);
    }
    console.log(`\nMore: market --sort <chart> (${Object.keys(m.latest.sorts).join(", ")}) · market game <universeId>`);
    break;
  }

  default:
    fail(`Unknown command "${cmd}". Run: node studio/cli.mjs help`);
}
