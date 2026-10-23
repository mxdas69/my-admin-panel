// Settings live in .rocrew/config.json (git-ignored, so keys never get committed).

import fs from "node:fs";
import path from "node:path";

export const DEFAULTS = {
  ownerName: "",
  claudeCommand: "claude",
  // Which Claude model each agent uses. "balanced" keeps Opus on the work that decides quality
  // and moves checking and research to Sonnet. "model" forces one model for everyone.
  modelPreset: "balanced",
  agentModels: {},
  model: "",
  // "safe": agents may use file tools, the RoCrew CLI and your MCP servers; everything else is refused.
  // "auto": Claude Code's auto mode decides what's safe, on top of that allow-list.
  // "autopilot": every tool is allowed (Claude Code's bypassPermissions mode).
  permissionMode: "safe",
  extraAllowedTools: [],
  maxParallel: 3,
  taskTimeoutMin: 60,
  maxAutoRounds: 12,
  // Stop starting new work when either plan window (5-hour or weekly) passes this, until it resets.
  usageCeilingPct: 90,
  // Spread the weekly plan over the week: new work waits whenever the crew is ahead of an even
  // pace (for example 30% used only 2 days in), so it never burns the whole week in one night.
  paceWeekly: true,
  host: "127.0.0.1",
  port: 4600,
  gemini: { apiKey: "", imageModel: "gemini-3.1-flash-image-preview", textModel: "gemini-flash-latest" },
  roblox: { openCloudKey: "", creatorType: "user", creatorId: "" },
  // The crew's signed-in Roblox browser: hidden by default; visible lets you watch and step in.
  robloxBrowser: { visible: false },
};

const SECRET_PATHS = [["gemini", "apiKey"], ["roblox", "openCloudKey"]];

export class Config {
  constructor(file) {
    this.file = file;
    this.values = structuredClone(DEFAULTS);
    if (fs.existsSync(file)) {
      try {
        merge(this.values, JSON.parse(fs.readFileSync(file, "utf8")));
      } catch (err) {
        console.error(`[rocrew] ignoring unreadable ${file}: ${err.message}`);
      }
    }
    // Environment variables win over the file, so keys can stay out of it entirely.
    if (process.env.GEMINI_API_KEY) this.values.gemini.apiKey = process.env.GEMINI_API_KEY;
    if (process.env.ROBLOX_OPEN_CLOUD_KEY) this.values.roblox.openCloudKey = process.env.ROBLOX_OPEN_CLOUD_KEY;
  }

  get() {
    return this.values;
  }

  update(patch) {
    const clean = structuredClone(patch);
    // The UI sends "" for secrets it is not changing; keep the stored value then.
    for (const [group, key] of SECRET_PATHS) {
      if (clean[group] && (clean[group][key] === undefined || clean[group][key] === "")) delete clean[group][key];
    }
    merge(this.values, clean);
    this.values.maxParallel = clampInt(this.values.maxParallel, 1, 15);
    this.values.taskTimeoutMin = clampInt(this.values.taskTimeoutMin, 5, 600);
    this.values.maxAutoRounds = clampInt(this.values.maxAutoRounds, 1, 200);
    this.values.usageCeilingPct = clampInt(this.values.usageCeilingPct, 10, 100);
    if (!["safe", "auto", "autopilot"].includes(this.values.permissionMode)) this.values.permissionMode = "safe";
    if (!["quality", "balanced", "saver", "custom"].includes(this.values.modelPreset)) this.values.modelPreset = "balanced";
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.values, null, 2));
  }

  /** Settings for the browser: secrets are replaced by whether they are set. */
  public() {
    const v = structuredClone(this.values);
    for (const [group, key] of SECRET_PATHS) {
      const secret = v[group][key];
      v[group][key] = "";
      v[group][`${key}Set`] = Boolean(secret);
      v[group][`${key}Hint`] = secret ? `…${secret.slice(-4)}` : "";
    }
    return v;
  }
}

// Maps whose keys aren't known ahead of time (agent id -> model) are replaced, not merged.
const OPEN_MAPS = new Set(["agentModels"]);

function merge(target, source) {
  for (const [k, v] of Object.entries(source ?? {})) {
    if (OPEN_MAPS.has(k)) {
      if (v && typeof v === "object" && !Array.isArray(v)) target[k] = Object.fromEntries(Object.entries(v).filter(([, m]) => typeof m === "string" && m));
    } else if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object") merge(target[k], v);
    else if (k in target) target[k] = v;
  }
}

function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}
