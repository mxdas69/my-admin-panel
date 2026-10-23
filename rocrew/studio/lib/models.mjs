// Model routing: Opus where quality is decided, Sonnet and Haiku where a lighter model
// does the job just as well, so a Claude plan's usage lasts longer.

import { AGENTS } from "./agents.mjs";

export const TIERS = ["haiku", "sonnet", "opus"];

const CORE = ["lead", "architect", "builder", "frame", "reviewer", "merchant"];

export const PRESETS = {
  quality: {
    label: "Best quality",
    blurb: "Opus for every agent. Uses your plan fastest.",
    tiers: Object.fromEntries(AGENTS.map((a) => [a.id, "opus"])),
  },
  balanced: {
    label: "Balanced",
    blurb: "Opus for planning, code, UI, money and reviews; Sonnet for research, building the world, testing and checks. Same quality where it counts, much lighter on usage.",
    tiers: Object.fromEntries(AGENTS.map((a) => [a.id, CORE.includes(a.id) ? "opus" : "sonnet"])),
  },
  saver: {
    label: "Save usage",
    blurb: "Opus only for the Lead and Builder, Haiku for routine checks. For when you're near your limit.",
    tiers: Object.fromEntries(
      AGENTS.map((a) => [a.id, ["lead", "builder"].includes(a.id) ? "opus" : ["playtest", "kid-tester", "producer", "liveops"].includes(a.id) ? "haiku" : "sonnet"]),
    ),
  },
};

const EFFORT = { opus: "high", sonnet: "medium", haiku: "low" };

/**
 * The model and effort for one task.
 * Order: a model the task names > "force one model" setting > the agent's tier (from the preset
 * or custom table), moved down a tier for small tasks and up to Opus for big ones.
 */
export function pickModel(task, cfg) {
  if (task.model) return { model: task.model, effort: EFFORT[task.model] ?? "high", why: "set on the task" };
  if (cfg.model) return { model: cfg.model, effort: undefined, why: "forced in Settings" };
  const preset = PRESETS[cfg.modelPreset] ?? PRESETS.balanced;
  let tier = (cfg.modelPreset === "custom" ? cfg.agentModels?.[task.agent] : null) ?? preset.tiers[task.agent] ?? PRESETS.balanced.tiers[task.agent] ?? "opus";
  let effort = EFFORT[tier] ?? "high";
  if (task.size === "small") {
    tier = TIERS[Math.max(0, TIERS.indexOf(tier) - 1)] ?? tier;
    effort = "low";
  } else if (task.size === "big") {
    tier = "opus";
    effort = "xhigh";
  }
  return { model: tier, effort, why: task.size && task.size !== "normal" ? `${task.size} task` : "agent default" };
}

export function presetTable() {
  return Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, { label: v.label, blurb: v.blurb, tiers: v.tiers }]));
}
