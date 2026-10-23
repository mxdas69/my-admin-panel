// The crew scheduler: per-agent task queues, a global parallel limit, the
// Studio lock (one agent drives Studio at a time), and Lead wake-ups so the
// team keeps going while you're away.

import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { AGENTS, AGENT_BY_ID, agentName, isAgent } from "./agents.mjs";
import { runClaude } from "./claude.mjs";

const TERMINAL = new Set(["done", "failed", "cancelled", "blocked"]);
const BASE_TOOLS = [
  "Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "LS", "TodoWrite", "NotebookEdit",
  "WebSearch", "WebFetch",
  "Bash(node studio/cli.mjs *)", "Bash(node studio/cli.mjs:*)", "Bash(node games/*)",
];

export class Crew extends EventEmitter {
  constructor({ store, config, root, runner = runClaude }) {
    super();
    this.store = store;
    this.config = config;
    this.root = root;
    this.runner = runner;
    this.running = new Map(); // taskId -> { kill }
    this.studioHolder = null; // taskId
    this.ticking = false;

    // Anything marked working when the app last stopped did not finish.
    for (const t of this.db.tasks) {
      if (t.status === "working") {
        t.status = "queued";
        t.note = "Restarted after the app closed mid-task.";
      }
    }
    this.store.save();
  }

  get db() {
    return this.store.data;
  }

  changed(kind = "state", extra = {}) {
    this.store.save();
    this.emit("change", { kind, ...extra });
  }

  // ---------- creating work ----------

  addTask({ agent, title, brief = "", game = null, from = "lead", studio, after = [], silent = false, reported = false }) {
    if (!isAgent(agent)) throw bad(`Unknown agent "${agent}". Agents: ${AGENTS.map((a) => a.id).join(", ")}`);
    if (!title?.trim()) throw bad("A task needs a title.");
    if (game && !this.db.games.some((g) => g.slug === game)) throw bad(`Unknown game "${game}". Create it first.`);
    for (const dep of after) {
      if (!this.db.tasks.some((t) => t.id === dep)) throw bad(`Unknown task "${dep}" in --after.`);
    }
    const task = {
      id: this.store.id("t"),
      agent,
      title: title.trim().slice(0, 140),
      brief: String(brief ?? ""),
      game,
      from,
      studio: studio ?? AGENT_BY_ID.get(agent).studio,
      after,
      status: "queued",
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      result: null,
      error: null,
      reported,
    };
    this.db.tasks.push(task);
    if (!silent && from !== "owner" && from !== "system") {
      this.feed(from, agent, task.title, task.id);
    }
    this.changed();
    setImmediate(() => this.tick());
    return task;
  }

  ownerToLead(text) {
    this.db.autoRounds = 0;
    return this.addTask({ agent: "lead", title: firstLine(text), brief: text, from: "owner" });
  }

  ownerToAgent(agent, text) {
    // A direct chat goes back to you in the agent's chat, not into the Lead's digest.
    return this.addTask({ agent, title: firstLine(text), brief: text, from: "owner", reported: true });
  }

  cancel(taskId) {
    const task = this.db.tasks.find((t) => t.id === taskId);
    if (!task) throw bad("No such task.");
    if (task.status === "queued") {
      task.status = "cancelled";
      task.endedAt = Date.now();
      this.changed();
    } else if (task.status === "working") {
      this.running.get(taskId)?.kill("stopped by you");
    }
    return task;
  }

  resetAgent(agent) {
    const state = this.store.agent(agent);
    state.sessionId = null;
    this.message(agent, "system", "Started a fresh conversation. The next task begins with a clean context.");
    this.changed();
  }

  setPaused(paused) {
    this.db.paused = Boolean(paused);
    this.changed();
    if (!paused) this.tick();
  }

  feed(from, to, text, taskId = null) {
    this.store.push("feed", { at: Date.now(), from, to, text: String(text).slice(0, 400), taskId });
  }

  message(agent, role, text, extra = {}) {
    const msg = { id: this.store.id("m"), agent, role, text, at: Date.now(), ...extra };
    this.store.push("messages", msg);
    this.emit("change", { kind: "message", agent, message: msg });
    return msg;
  }

  // ---------- scheduling ----------

  depsState(task) {
    let waiting = false;
    for (const id of task.after) {
      const dep = this.db.tasks.find((t) => t.id === id);
      if (!dep) continue;
      if (dep.status === "failed" || dep.status === "cancelled" || dep.status === "blocked") return "broken";
      if (dep.status !== "done") waiting = true;
    }
    return waiting ? "waiting" : "ready";
  }

  agentBusy(agent) {
    return this.db.tasks.some((t) => t.agent === agent && t.status === "working");
  }

  tick() {
    if (this.ticking) return;
    this.ticking = true;
    try {
      const cfg = this.config.get();
      const queued = this.db.tasks.filter((t) => t.status === "queued").sort((a, b) => a.createdAt - b.createdAt);

      for (const task of queued) {
        if (this.depsState(task) === "broken") {
          task.status = "blocked";
          task.endedAt = Date.now();
          task.error = "A task it depends on did not finish.";
          this.changed();
        }
      }
      if (this.db.paused) return;

      let workers = [...this.running.keys()].filter((id) => this.task(id)?.agent !== "lead").length;
      for (const task of queued) {
        if (task.status !== "queued" || this.agentBusy(task.agent)) continue;
        if (this.depsState(task) !== "ready") continue;
        const isLead = task.agent === "lead";
        if (!isLead && workers >= cfg.maxParallel) continue;
        if (task.studio && this.studioHolder) continue;
        this.launch(task);
        if (!isLead) workers += 1;
      }
      this.maybeWakeLead();
    } finally {
      this.ticking = false;
    }
  }

  task(id) {
    return this.db.tasks.find((t) => t.id === id);
  }

  allowedTools() {
    const cfg = this.config.get();
    const mcp = this.db.mcpServers.flatMap((s) => {
      const clean = s.replace(/[^a-zA-Z0-9_-]/g, "_");
      return clean === s ? [`mcp__${s}`] : [`mcp__${s}`, `mcp__${clean}`];
    });
    return [...new Set([...BASE_TOOLS, ...mcp, ...(cfg.extraAllowedTools ?? [])])];
  }

  launch(task) {
    const cfg = this.config.get();
    const state = this.store.agent(task.agent);
    const fresh = !state.sessionId;
    const prompt = this.buildPrompt(task, fresh);

    task.status = "working";
    task.startedAt = Date.now();
    task.error = null;
    if (task.studio) this.studioHolder = task.id;
    state.lastActiveAt = Date.now();
    this.message(task.agent, task.from === "owner" ? "owner" : "brief", task.from === "owner" ? task.brief : `${task.title}${task.brief ? `\n\n${task.brief}` : ""}`, {
      taskId: task.id,
      from: task.from,
    });
    this.changed();

    const run = this.runner({
      agent: task.agent,
      command: cfg.claudeCommand,
      cwd: this.root,
      prompt,
      sessionId: state.sessionId,
      permissionMode: cfg.permissionMode,
      allowedTools: this.allowedTools(),
      model: cfg.model || undefined,
      timeoutMs: cfg.taskTimeoutMin * 60000,
      env: { ROCREW_AGENT: task.agent, ROCREW_TASK: task.id, ROCREW_GAME: task.game ?? "" },
      onEvent: (e) => this.onRunEvent(task, e),
    });
    this.running.set(task.id, run);

    run.done.then((res) => this.finish(task, res));
  }

  onRunEvent(task, e) {
    const state = this.store.agent(task.agent);
    state.lastActiveAt = Date.now();
    if (e.type === "init") {
      if (e.sessionId) state.sessionId = e.sessionId;
      const names = (e.mcpServers ?? []).map((s) => s.name).filter(Boolean);
      if (names.length) this.db.mcpServers = [...new Set([...this.db.mcpServers, ...names])];
      const studio = (e.mcpServers ?? []).find((s) => /roblox|studio/i.test(s.name));
      if (task.studio && studio && studio.status !== "connected") {
        this.message(task.agent, "system", `Roblox Studio MCP is ${studio.status}. Open Studio and check the MCP connection.`);
      }
    } else if (e.type === "text") {
      this.message(task.agent, "agent", e.text, { taskId: task.id });
    } else if (e.type === "tool") {
      this.message(task.agent, "tool", describeTool(e.name, e.input), { taskId: task.id });
    } else if (e.type === "tool_error") {
      this.message(task.agent, "tool-error", e.text, { taskId: task.id });
    }
  }

  finish(task, res) {
    this.running.delete(task.id);
    if (this.studioHolder === task.id) this.studioHolder = null;
    const state = this.store.agent(task.agent);
    if (res.sessionId) state.sessionId = res.sessionId;
    if (res.ok) state.verdicts = [];

    task.endedAt = Date.now();
    task.costUsd = res.costUsd ?? null;
    if (res.error === "stopped by you") {
      task.status = "cancelled";
      task.error = res.error;
    } else if (res.ok) {
      task.status = "done";
      task.result = res.text?.trim() || "(finished without a summary)";
    } else {
      task.status = "failed";
      task.error = res.error;
      task.result = res.text || null;
      this.message(task.agent, "system", `Task failed: ${res.error}`, { taskId: task.id });
      // A broken session id (deleted transcript, new machine) should not wedge the agent forever.
      if (/session|resume/i.test(res.error ?? "")) state.sessionId = null;
    }
    if (task.agent !== "lead" && task.status !== "cancelled") {
      this.feed(task.agent, task.from, task.status === "done" ? summarize(task.result) : `Couldn't finish "${task.title}": ${task.error}`, task.id);
    }
    if (task.agent === "lead") task.reported = true;
    this.changed();
    this.tick();
  }

  /** When the workers go quiet, hand the Lead a digest so it can plan the next step. */
  maybeWakeLead() {
    const cfg = this.config.get();
    const tasks = this.db.tasks;
    const workerActive = tasks.some((t) => t.agent !== "lead" && (t.status === "working" || (t.status === "queued" && this.depsState(t) === "ready")));
    const leadActive = tasks.some((t) => t.agent === "lead" && (t.status === "working" || t.status === "queued"));
    if (workerActive || leadActive) return;
    const unreported = tasks.filter((t) => t.agent !== "lead" && !t.reported && TERMINAL.has(t.status));
    if (!unreported.length) return;

    for (const t of unreported) t.reported = true;
    if (this.db.autoRounds >= cfg.maxAutoRounds) {
      this.addAsk({
        from: "lead",
        title: `The crew paused after ${cfg.maxAutoRounds} rounds on their own`,
        body: `They finished ${unreported.length} more task(s). Reply to keep them going, or open Lead to steer.`,
      });
      this.changed();
      return;
    }
    this.db.autoRounds += 1;
    const lines = unreported.map((t) => {
      const who = agentName(t.agent);
      const game = t.game ? ` [${t.game}]` : "";
      if (t.status === "done") return `- ${t.id} ${who}${game} DONE "${t.title}"\n${indent(t.result ?? "")}`;
      return `- ${t.id} ${who}${game} ${t.status.toUpperCase()} "${t.title}": ${t.error ?? ""}`;
    });
    this.addTask({
      agent: "lead",
      from: "system",
      title: `Crew update (${unreported.length} finished)`,
      brief: `The crew has gone quiet. Here is what came back since your last update:\n\n${lines.join("\n")}\n\nDecide the next step: queue the next tasks (with --after where order matters), send work back for fixes, ask the owner with \`node studio/cli.mjs ask\` if you truly need them, or write the round-up for the owner if this stage is done.`,
    });
  }

  addAsk({ from, title, body = "", game = null }) {
    const ask = { id: this.store.id("a"), from, title, body, game, status: "open", reply: null, createdAt: Date.now() };
    this.db.asks.push(ask);
    this.feed(from, "owner", title);
    this.changed();
    return ask;
  }

  answerAsk(id, { reply = "", done = false }) {
    const ask = this.db.asks.find((a) => a.id === id);
    if (!ask) throw bad("No such checkpoint.");
    ask.reply = reply || ask.reply;
    if (done) ask.status = "done";
    const text = reply
      ? `The owner replied to "${ask.title}" (asked by ${agentName(ask.from)}):\n\n${reply}${done ? "\n\nThey marked it done." : ""}`
      : `The owner marked "${ask.title}" (asked by ${agentName(ask.from)}) as done.`;
    this.db.autoRounds = 0;
    this.addTask({ agent: "lead", title: `Owner: ${ask.title}`, brief: text, from: "owner", game: ask.game });
    return ask;
  }

  decideReview(id, { verdict, note = "" }) {
    const review = this.db.reviews.find((r) => r.id === id);
    if (!review) throw bad("No such review item.");
    if (!["approved", "changes", "rejected"].includes(verdict)) throw bad("Verdict must be approved, changes or rejected.");
    if (verdict === "changes" && !note.trim()) throw bad("Add a note so the agent knows what to change.");
    review.status = verdict;
    review.note = note;
    review.decidedAt = Date.now();
    const label = { approved: "Approved", changes: "Changes asked", rejected: "Rejected" }[verdict];
    const line = `${label}: "${review.title}"${note ? ` — ${note}` : ""}`;
    const agent = isAgent(review.agent) ? review.agent : "lead";
    if (verdict === "changes") {
      this.addTask({
        agent,
        title: `Changes: ${review.title}`,
        brief: `The owner asked for changes to "${review.title}" (${review.file}).\n\nTheir note: ${note}\n\nMake the changes, then submit the new version for review.`,
        game: review.game,
        from: "owner",
      });
    } else {
      this.store.agent(agent).verdicts.push(line);
    }
    this.feed("owner", agent, line);
    this.changed();
    return review;
  }

  decidePitch(id, { verdict, note = "" }) {
    const pitch = this.db.pitches.find((p) => p.id === id);
    if (!pitch) throw bad("No such pitch.");
    pitch.status = verdict === "approved" ? "approved" : "rejected";
    pitch.note = note;
    pitch.decidedAt = Date.now();
    if (pitch.status === "approved") {
      const game = this.addGame({ name: pitch.title });
      this.db.autoRounds = 0;
      this.addTask({
        agent: "lead",
        from: "owner",
        game: game.slug,
        title: `Build approved pitch: ${pitch.title}`,
        brief: `The owner approved Pulse's pitch "${pitch.title}"${note ? ` with this note: ${note}` : ""}. The game folder is games/${game.slug}/.\n\nPitch:\n${JSON.stringify(pitch.data, null, 2)}\n\nRun the pipeline from CLAUDE.md for it, starting with the Architect's plan.`,
      });
    } else {
      this.store.agent("pulse").verdicts.push(`Rejected pitch "${pitch.title}"${note ? ` — ${note}` : ""}`);
    }
    this.changed();
    return pitch;
  }

  addGame({ name, slug }) {
    const s = slugify(slug || name);
    if (!s) throw bad("A game needs a name.");
    let game = this.db.games.find((g) => g.slug === s);
    if (!game) {
      game = { slug: s, name: name.trim(), version: "v0", whatsNew: [], universeId: null, createdAt: Date.now() };
      this.db.games.push(game);
      fs.mkdirSync(path.join(this.root, "games", s), { recursive: true });
      this.changed();
    }
    return game;
  }

  // ---------- prompts ----------

  buildPrompt(task, fresh) {
    const name = agentName(task.agent);
    const parts = [];
    // The role itself comes from .claude/agents/<id>.md through `claude --agent`.
    parts.push(fresh ? `You are ${name} (agent id "${task.agent}") on the RoCrew team. Follow your role and the crew rules in CLAUDE.md.` : `(You are ${name}; your role and the crew rules still apply.)`);

    const state = this.store.agent(task.agent);
    if (state.verdicts?.length) {
      parts.push(`## Owner verdicts since your last pass\n${state.verdicts.map((v) => `- ${v}`).join("\n")}`);
    }

    const game = task.game ? this.db.games.find((g) => g.slug === task.game) : null;
    const meta = [`Task id: ${task.id}`];
    if (game) meta.push(`Game: ${game.name} (folder games/${game.slug}/)`);
    meta.push(
      task.studio
        ? "Studio: you hold the Studio lock for this task, so you may change the open place."
        : "Studio: you do NOT hold the Studio lock. You may read the open place, but don't change it.",
    );

    if (task.agent === "lead") {
      parts.push(this.leadContext());
      const heading = task.from === "owner" ? "## Message from the owner" : task.from === "system" ? "## Crew update" : `## Note from ${agentName(task.from)}`;
      parts.push(`${heading}\n${meta.join("\n")}\n\n${task.brief || task.title}`);
      parts.push("Reply to the owner in plain words: what you decided and what the crew is doing now. Use the RoCrew CLI to queue work.");
    } else {
      const from = task.from === "owner" ? "the owner (directly)" : agentName(task.from);
      parts.push(`## New task from ${from}: ${task.title}\n${meta.join("\n")}\n\n${task.brief || "(No extra brief.)"}`);
      parts.push(
        "When you're done, end with a short handoff (under 150 words): what you did, the evidence (files, Studio paths, test output), anything left open, and who should go next. That final message goes to the Lead.",
      );
    }
    return parts.join("\n\n");
  }

  leadContext() {
    const db = this.db;
    const open = db.tasks.filter((t) => t.status === "queued" || t.status === "working");
    const games = db.games.map((g) => `- ${g.name} (${g.slug}) ${g.version}`).join("\n") || "- none yet";
    const work = open.map((t) => `- ${t.id} ${agentName(t.agent)} ${t.status} "${t.title}"${t.game ? ` [${t.game}]` : ""}`).join("\n") || "- nothing queued";
    const asks = db.asks.filter((a) => a.status === "open").map((a) => `- ${a.id} ${a.title}`).join("\n") || "- none";
    const reviews = db.reviews.filter((r) => r.status === "pending").length;
    return `## Studio right now\nGames:\n${games}\nOpen work:\n${work}\nWaiting on the owner:\n${asks}\nReview items waiting: ${reviews}`;
  }

  // ---------- read models for the UI ----------

  agentStatuses() {
    return AGENTS.map((a) => {
      const mine = this.db.tasks.filter((t) => t.agent === a.id);
      const working = mine.find((t) => t.status === "working");
      const queued = mine.filter((t) => t.status === "queued").length;
      const state = this.db.agents[a.id] ?? {};
      return {
        id: a.id,
        status: working ? "working" : queued ? "queued" : "idle",
        current: working ? { id: working.id, title: working.title, startedAt: working.startedAt } : null,
        queued,
        hasStudio: Boolean(working && this.studioHolder === working.id),
        lastActiveAt: state.lastActiveAt ?? null,
        hasSession: Boolean(state.sessionId),
      };
    });
  }
}

/** A mistake in the request (shown to the caller as a 400), not a crash. */
function bad(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function firstLine(text) {
  const line = String(text).trim().split("\n")[0];
  return line.length > 90 ? `${line.slice(0, 87)}…` : line || "Message";
}

function summarize(text) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > 280 ? `${clean.slice(0, 277)}…` : clean;
}

function indent(text) {
  return String(text).trim().split("\n").slice(0, 25).map((l) => `    ${l}`).join("\n");
}

function describeTool(name, input = {}) {
  const short = (v) => {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return s.length > 160 ? `${s.slice(0, 157)}…` : s;
  };
  if (name === "Bash") return `$ ${short(input.command ?? "")}`;
  if (["Read", "Write", "Edit", "MultiEdit"].includes(name)) return `${name} ${input.file_path ?? ""}`;
  if (name === "WebSearch") return `Search: ${short(input.query ?? "")}`;
  if (name === "WebFetch") return `Fetch: ${input.url ?? ""}`;
  if (name.startsWith("mcp__")) {
    const [, server, tool] = name.split("__");
    const first = Object.values(input)[0];
    return `${server} › ${tool}${first !== undefined ? `: ${short(first)}` : ""}`;
  }
  return `${name}${Object.keys(input).length ? `: ${short(input)}` : ""}`;
}
