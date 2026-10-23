// The crew scheduler: per-agent task queues, a global parallel limit, the
// Studio lock (one agent drives Studio at a time), and Lead wake-ups so the
// team keeps going while you're away.

import os from "node:os";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { AGENTS, AGENT_BY_ID, agentName, isAgent } from "./agents.mjs";
import { runClaude } from "./claude.mjs";
import { pickModel } from "./models.mjs";

const TERMINAL = new Set(["done", "failed", "cancelled", "blocked"]);
// Refused in every permission mode. Secrets stay out of agents' reach (a page an agent reads
// on the web can't talk it into leaking them), and whole vault pages are read through
// `cli.mjs vault` in small pieces so they don't eat the owner's plan.
export const DENIED_TOOLS = [
  "Read(./vault/**/*.md)",
  "Read(./.rocrew/config.json)",
  "Read(./.rocrew/token)",
  "Read(./.rocrew/runtime.json)",
  "Read(./.rocrew/remote.json)",
  "Read(./.rocrew/browser/**)",
  "Edit(./.rocrew/**)",
];

const BROWSER_AGENTS = ["liveops", "merchant"];
const SESSION_TASKS = 5; // tasks per agent conversation before it starts fresh with a summary
const BROWSER_SERVER = "roblox-browser";

const BASE_TOOLS = [
  "Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "LS", "TodoWrite", "NotebookEdit",
  "WebSearch", "WebFetch",
  "Bash(node studio/cli.mjs *)", "Bash(node studio/cli.mjs:*)", "Bash(node games/*)",
  // On Windows, Claude Code runs commands through its PowerShell tool instead of Bash.
  "PowerShell(node studio/cli.mjs *)", "PowerShell(node studio\\cli.mjs *)", "PowerShell(node .\\studio\\cli.mjs *)",
  "PowerShell(node games/*)", "PowerShell(node games\\*)",
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

    // Anything marked working when the app last stopped did not finish. Stop any agent
    // process that outlived the app (so two copies never edit at once), then queue the task
    // again; it resumes the same Claude conversation, so the agent knows what it already did.
    for (const t of this.db.tasks) {
      if (t.status === "working") {
        if (t.pid) killLeftover(t.pid, t.startedAt);
        t.status = "queued";
        t.pid = null;
        t.interrupted = (t.interrupted ?? 0) + 1;
        t.note = "Picked up again after the app stopped mid-task.";
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

  addTask({ agent, title, brief = "", plain = "", game = null, from = "lead", studio, browser, after = [], silent = false, reported = false, size = "normal", model = null }) {
    if (!isAgent(agent)) throw bad(`Unknown agent "${agent}". Agents: ${AGENTS.map((a) => a.id).join(", ")}`);
    if (!title?.trim()) throw bad("A task needs a title.");
    if (game && !this.db.games.some((g) => g.slug === game)) throw bad(`Unknown game "${game}". Create it first.`);
    if (!["small", "normal", "big"].includes(size)) throw bad('size must be "small", "normal" or "big".');
    if (model && !/^[a-z0-9][a-z0-9.\-[\]]*$/i.test(model)) throw bad("That model name doesn't look right.");
    for (const dep of after) {
      if (!this.db.tasks.some((t) => t.id === dep)) throw bad(`Unknown task "${dep}" in --after.`);
    }
    const task = {
      id: this.store.id("t"),
      agent,
      title: title.trim().slice(0, 140),
      brief: String(brief ?? ""),
      plain: String(plain ?? "").slice(0, 400),
      game,
      from,
      studio: studio ?? AGENT_BY_ID.get(agent).studio,
      // The signed-in Roblox browser: Liveops and Merchant get it by default (stats, funnels,
      // passes), anyone else when the task asks for it.
      browser: browser ?? BROWSER_AGENTS.includes(agent),
      after,
      size,
      model: model || null,
      // With "ask me first" on, work the crew hands out waits for the owner's OK.
      status: from !== "owner" && from !== "system" && this.config.get().approveTasks !== false ? "proposed" : "queued",
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

  /** `by` is "owner" or a friend's name; friends' messages are labelled so agents know who's talking. */
  ownerToLead(text, by = "owner") {
    this.db.autoRounds = 0;
    const brief = by === "owner" ? text : `(From ${by}, who co-owns this studio)\n\n${text}`;
    return Object.assign(this.addTask({ agent: "lead", title: firstLine(text), brief, from: "owner" }), { by });
  }

  ownerToAgent(agent, text, by = "owner") {
    // A direct chat goes back to you in the agent's chat, not into the Lead's digest.
    const brief = by === "owner" ? text : `(From ${by}, who co-owns this studio)\n\n${text}`;
    return Object.assign(this.addTask({ agent, title: firstLine(text), brief, from: "owner", reported: true }), { by });
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

  // ---------- plan usage ----------

  recordUsage(info) {
    const win = (w) => (w ? { pct: Math.round((w.utilization ?? 0) * 100), resetsAt: w.resetsAt ? w.resetsAt * 1000 : null } : null);
    const u = info.unifiedWindows ?? {};
    const fallback = info.rateLimitType && info.utilization !== undefined ? { utilization: info.utilization, resetsAt: info.resetsAt } : null;
    const prev = this.db.usage ?? {};
    this.db.usage = {
      at: Date.now(),
      status: info.status ?? null,
      fiveHour: win(u.five_hour) ?? (info.rateLimitType === "five_hour" ? win(fallback) : prev.fiveHour ?? null),
      week: win(u.seven_day) ?? (info.rateLimitType === "seven_day" ? win(fallback) : prev.week ?? null),
    };
    this.changed("usage");
  }

  /** Why new work must wait for the plan to reset, or null if it can run. */
  usageHold() {
    const u = this.db.usage;
    if (!u) return null;
    const cfg = this.config.get();
    const ceiling = cfg.usageCeilingPct;
    const now = Date.now();
    for (const [label, w] of [["5-hour", u.fiveHour], ["weekly", u.week]]) {
      if (!w) continue;
      const stale = w.resetsAt && now >= w.resetsAt;
      if (!stale && (w.pct >= ceiling || (u.status === "rejected" && w.pct >= 99))) {
        return { window: label, pct: w.pct, resetsAt: w.resetsAt, ceiling };
      }
    }
    // Weekly pacing: allow an even share of the week so far, plus a 10% head start.
    const w = u.week;
    if (cfg.paceWeekly !== false && w?.resetsAt && now < w.resetsAt) {
      const elapsed = Math.min(1, Math.max(0, 1 - (w.resetsAt - now) / (7 * 86400000)));
      const allowed = Math.min(ceiling, Math.round(elapsed * 100 + 10));
      if (w.pct >= allowed) {
        const resumeAt = w.resetsAt - 7 * 86400000 + ((w.pct - 10) / 100) * 7 * 86400000;
        return { window: "weekly", pct: w.pct, resetsAt: Math.max(now, resumeAt), ceiling: allowed, pacing: true };
      }
    }
    return null;
  }

  // ---------- scheduling ----------

  depsState(task) {
    let waiting = false;
    for (const id of task.after) {
      const dep = this.db.tasks.find((t) => t.id === id);
      if (!dep) continue;
      if (dep.status === "failed" || dep.status === "cancelled" || dep.status === "blocked") return "broken";
      if (dep.status !== "done") waiting = true; // includes "proposed": waits for approval
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
      const hold = this.usageHold();

      let workers = [...this.running.keys()].filter((id) => this.task(id)?.agent !== "lead").length;
      for (const task of queued) {
        if (task.status !== "queued" || this.agentBusy(task.agent)) continue;
        if (this.depsState(task) !== "ready") continue;
        const isLead = task.agent === "lead";
        // Near the plan limit only your own messages to the Lead still run.
        if (hold && !(isLead && task.from === "owner")) continue;
        if (!isLead && workers >= cfg.maxParallel) continue;
        if (task.studio && this.studioHolder) continue;
        if (this.browserFor(task) && this.browserHolder) continue;
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

  /** Whether this task gets the signed-in Roblox browser (only once you've signed in). */
  browserFor(task) {
    return Boolean(task.browser && this.browserTool?.available());
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
    // Long conversations get expensive: every turn re-reads the whole history. After a few tasks,
    // start the agent fresh and hand it a short note of where it left off instead.
    if (state.sessionId && (state.tasksInSession ?? 0) >= SESSION_TASKS) {
      state.sessionId = null;
      state.tasksInSession = 0;
    }
    const fresh = !state.sessionId;
    const prompt = this.buildPrompt(task, fresh);
    state.tasksInSession = (state.tasksInSession ?? 0) + 1;

    const choice = pickModel(task, cfg);
    task.status = "working";
    task.startedAt = Date.now();
    task.ran = { model: choice.model, effort: choice.effort ?? null };
    task.error = null;
    if (task.studio) this.studioHolder = task.id;
    const browserConfig = this.browserFor(task) ? this.browserTool.mcpConfig() : null;
    if (browserConfig) this.browserHolder = task.id;
    state.lastActiveAt = Date.now();
    this.message(task.agent, task.from === "owner" ? "owner" : "brief", task.from === "owner" ? task.brief : `${task.title}${task.brief ? `\n\n${task.brief}` : ""}`, {
      taskId: task.id,
      from: task.from,
      by: task.by ?? null,
    });
    this.changed();

    const run = this.runner({
      agent: task.agent,
      command: cfg.claudeCommand,
      cwd: this.root,
      prompt,
      sessionId: state.sessionId,
      permissionMode: cfg.permissionMode,
      allowedTools: browserConfig ? [...this.allowedTools(), `mcp__${BROWSER_SERVER}`] : this.allowedTools(),
      mcpConfigs: browserConfig ? [browserConfig] : [],
      disallowedTools: DENIED_TOOLS,
      model: choice.model,
      effort: choice.effort,
      fallbackModel: choice.model === "opus" ? "sonnet" : undefined,
      timeoutMs: cfg.taskTimeoutMin * 60000,
      env: { ROCREW_AGENT: task.agent, ROCREW_TASK: task.id, ROCREW_GAME: task.game ?? "" },
      onEvent: (e) => this.onRunEvent(task, e),
    });
    this.running.set(task.id, run);
    task.pid = run.pid ?? null;
    this.store.flush();

    run.done.then((res) => this.finish(task, res));
  }

  onRunEvent(task, e) {
    const state = this.store.agent(task.agent);
    state.lastActiveAt = Date.now();
    if (e.type === "init") {
      if (e.sessionId) state.sessionId = e.sessionId;
      const names = (e.mcpServers ?? []).map((s) => s.name).filter(Boolean);
      if (names.length) this.db.mcpServers = [...new Set([...this.db.mcpServers, ...names.filter((n) => n !== BROWSER_SERVER)])];
      const studio = (e.mcpServers ?? []).find((s) => /roblox|studio/i.test(s.name) && s.name !== BROWSER_SERVER);
      if (task.studio && studio && studio.status !== "connected") {
        this.message(task.agent, "system", `Roblox Studio MCP is ${studio.status}. Open Studio and check the MCP connection.`);
      }
    } else if (e.type === "usage") {
      this.recordUsage(e.info);
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
    task.pid = null;
    if (this.studioHolder === task.id) this.studioHolder = null;
    if (this.browserHolder === task.id) this.browserHolder = null;
    const state = this.store.agent(task.agent);
    if (res.sessionId) state.sessionId = res.sessionId;
    if (res.ok) {
      state.verdicts = [];
      state.lastHandoff = `${task.title}: ${(res.text ?? "").trim().slice(-1200)}`;
    }

    task.endedAt = Date.now();
    task.costUsd = res.costUsd ?? null;
    if (res.error === "stopped by you") {
      task.status = "cancelled";
      task.error = res.error;
    } else if (res.ok) {
      task.status = "done";
      task.result = res.text?.trim() || "(finished without a summary)";
    } else if ((this.db.usage?.status === "rejected" && Date.now() - this.db.usage.at < 10 * 60000) || /usage limit|limit reached|rate.?limit/i.test(res.error ?? "")) {
      // The plan ran out mid-task: put it back in line; it starts again after the reset.
      task.status = "queued";
      task.startedAt = null;
      task.endedAt = null;
      task.note = "Waiting for your Claude plan's usage to reset.";
      this.message(task.agent, "system", "Paused: your Claude plan hit its usage limit. This task restarts when it resets.", { taskId: task.id });
    } else {
      task.status = "failed";
      task.error = res.error;
      task.result = res.text || null;
      this.message(task.agent, "system", `Task failed: ${res.error}`, { taskId: task.id });
      // A broken session id (deleted transcript, new machine) should not wedge the agent forever.
      if (/session|resume/i.test(res.error ?? "")) state.sessionId = null;
    }
    if (task.agent !== "lead" && (task.status === "done" || task.status === "failed")) {
      this.feed(task.agent, task.from, task.status === "done" ? summarize(task.result) : `Couldn't finish "${task.title}": ${task.error}`, task.id);
    }
    if (task.agent === "lead") task.reported = true;
    this.changed();
    this.tick();
  }

  /** The owner approves or skips proposed tasks. Skipped ones are reported to the Lead. */
  decideProposed(ids, approve, by = "owner") {
    const picked = this.db.tasks.filter((t) => ids.includes(t.id) && t.status === "proposed");
    for (const t of picked) {
      if (approve) t.status = "queued";
      else {
        t.status = "cancelled";
        t.error = "Skipped by the owner";
        t.endedAt = Date.now();
        t.reported = true;
      }
    }
    if (!approve && picked.length) {
      this.store.agent("lead").verdicts.push(`${by === "owner" ? "The owner" : by} skipped: ${picked.map((t) => `${agentName(t.agent)} "${t.title}"`).join("; ")}. Don't queue these again unless asked.`);
    }
    this.changed();
    this.tick();
    return picked.length;
  }

  /** When the workers go quiet, hand the Lead a digest so it can plan the next step. */
  maybeWakeLead() {
    const cfg = this.config.get();
    const tasks = this.db.tasks;
    const workerActive = tasks.some((t) => t.agent !== "lead" && (t.status === "working" || (t.status === "queued" && this.depsState(t) === "ready")));
    const leadActive = tasks.some((t) => t.agent === "lead" && (t.status === "working" || t.status === "queued"));
    if (workerActive || leadActive) return;
    if (tasks.some((t) => t.status === "proposed")) return; // waiting for the owner to approve
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

  addAsk({ from, title, body = "", game = null, kind = "question", steps = [], media = [] }) {
    const ask = {
      id: this.store.id("a"),
      from,
      title,
      body,
      game,
      kind: ["test", "gemini"].includes(kind) ? kind : "question",
      steps: steps.map((x) => String(x).trim()).filter(Boolean).slice(0, 20),
      media,
      status: "open",
      reply: null,
      result: null,
      replies: [],
      createdAt: Date.now(),
    };
    this.db.asks.push(ask);
    this.feed(from, "owner", title);
    this.changed();
    return ask;
  }

  answerAsk(id, { reply = "", done = false, result = null, attachments = [], by = "owner" }) {
    const ask = this.db.asks.find((a) => a.id === id);
    if (!ask) throw bad("No such checkpoint.");
    if (result && !["works", "broken"].includes(result)) throw bad('result must be "works" or "broken".');
    if (result === "broken" && !reply.trim() && !attachments.length) throw bad("Say what went wrong (or attach a photo or video) so the crew can fix it.");
    ask.reply = reply || ask.reply;
    if (result) ask.result = result;
    if (done || result) ask.status = "done";
    ask.replies = [...(ask.replies ?? []), { at: Date.now(), by, reply, result, attachments: attachments.map((a) => a.media) }];
    const who = by === "owner" ? "The owner" : by;
    const verdict = result === "works" ? " reports it WORKS" : result === "broken" ? " reports something is WRONG" : " replied";
    const files = attachments.length
      ? `\n\nThey attached (open images with the Read tool${attachments.some((a) => a.frames) ? "; videos come with a frame sheet you can read" : ""}):\n${attachments.map((a) => `- ${a.path}${a.frames ? `  (frames: ${a.frames})` : ""}`).join("\n")}`
      : "";
    const text = `${who}${verdict} on "${ask.title}" (asked by ${agentName(ask.from)}).${reply ? `\n\n${reply}` : ""}${files}${ask.status === "done" && !result ? "\n\nThey marked it done." : ""}${result === "broken" ? "\n\nRoute the fix to the right agent, then ask the owner to test again." : ""}`;
    this.db.autoRounds = 0;
    this.addTask({ agent: "lead", title: `Owner: ${ask.title}`, brief: text, from: "owner", game: ask.game });
    return ask;
  }

  decideReview(id, { verdict, note = "", by = "owner" }) {
    const review = this.db.reviews.find((r) => r.id === id);
    if (!review) throw bad("No such review item.");
    if (!["approved", "changes", "rejected"].includes(verdict)) throw bad("Verdict must be approved, changes or rejected.");
    if (verdict === "changes" && !note.trim()) throw bad("Add a note so the agent knows what to change.");
    review.status = verdict;
    review.note = note;
    review.decidedAt = Date.now();
    review.decidedBy = by;
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

  decidePitch(id, { verdict, note = "", by = "owner" }) {
    const pitch = this.db.pitches.find((p) => p.id === id);
    if (!pitch) throw bad("No such pitch.");
    pitch.status = verdict === "approved" ? "approved" : "rejected";
    pitch.note = note;
    pitch.decidedAt = Date.now();
    pitch.decidedBy = by;
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
    parts.push(
      fresh
        ? `You are ${name} (agent id "${task.agent}") on the RoCrew team. Follow your role and the crew rules in CLAUDE.md. Read the vault in small pieces with \`node studio/cli.mjs vault card <page>\` and \`vault read <page> --section "…"\`; whole vault pages can't be opened with Read.`
        : `(You are ${name}; your role and the crew rules still apply.)`,
    );

    const state = this.store.agent(task.agent);
    if (fresh && state.lastHandoff) {
      parts.push(`## Where you left off\nYour last handoff (your earlier conversation was closed to save usage; files and the game folder have everything else):\n${state.lastHandoff}`);
    }
    if (state.verdicts?.length) {
      parts.push(`## Owner verdicts since your last pass\n${state.verdicts.map((v) => `- ${v}`).join("\n")}`);
    }

    const game = task.game ? this.db.games.find((g) => g.slug === task.game) : null;
    const meta = [`Task id: ${task.id}`];
    if (this.browserFor(task)) {
      meta.push(
        `Roblox browser: you have the crew's browser (the ${BROWSER_SERVER} tools), signed in to the owner's Roblox account${this.browserTool.accountName() ? ` as ${this.browserTool.accountName()}` : ""}. Use it for the Creator Hub (create.roblox.com: analytics, retention, funnels, monetization, game passes, developer products, thumbnails) and roblox.com. Accept cookie banners, close popups and accept Roblox's creator terms yourself. Never spend or trade Robux, buy anything, change account, security or privacy settings, or message people. Game passes and products: turn on regional pricing and use icons from \`store-art pass\`. Places: set max server size from the plan and allow all devices including console. Never change the experience genre. If Roblox asks you to sign in again or for a 2-step code, stop and ask the owner with \`cli.mjs ask\`. Prefer reading pages as text (snapshots) over screenshots to save usage. Close the browser when you're done.`,
      );
    }
    if (task.interrupted) {
      meta.push("Note: this task was cut off when the RoCrew app stopped (a crash, restart or power cut). Before doing anything, check what you already did (files, Studio, your earlier messages) and carry on from there. Don't redo finished steps or duplicate anything in Studio.");
    }
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

/**
 * Stop an agent process left over from before a crash. Only if the computer hasn't restarted
 * since (process ids get reused after a reboot) and the process is still a Claude Code run.
 */
function killLeftover(pid, startedAt) {
  try {
    const bootedAt = Date.now() - os.uptime() * 1000;
    if (!startedAt || startedAt < bootedAt) return;
    if (process.platform === "win32") {
      const row = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], { encoding: "utf8", windowsHide: true });
      if (!/^"(cmd|node|claude)\.exe"/i.test(row.trim())) return;
      execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    } else {
      const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8");
      if (!/claude|node/.test(cmd)) return;
      process.kill(pid, "SIGTERM");
    }
    console.log(`[rocrew] stopped an agent run (pid ${pid}) left over from before the app stopped`);
  } catch {
    // Already gone, or not ours.
  }
}
