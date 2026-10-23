#!/usr/bin/env node
// Installs everything RoCrew uses, so you don't have to: Claude Code, ffmpeg, and, only if
// Blender is already on this PC, uv and the Blender MCP add-on. Nothing optional is forced.
// Run it with `node studio/setup.mjs` (Install RoCrew.bat does), or from the app's setup.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { HiddenBlender, ADDON_MODULE } from "./lib/blender.mjs";

const isWin = process.platform === "win32";
const ADDON_URL = "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py";

function has(cmd) {
  try {
    execFileSync(isWin ? "where" : "which", [cmd], { stdio: "ignore", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: isWin, windowsHide: true });
  return r.status === 0;
}

function winget(id) {
  if (!isWin || !has("winget")) return false;
  return run("winget", ["install", "--id", id, "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements"]);
}

/** The folder Blender loads user add-ons from, for the newest Blender version found. */
function blenderAddonDir(exe) {
  const base = isWin ? path.join(process.env.APPDATA ?? "", "Blender Foundation", "Blender") : process.platform === "darwin" ? path.join(os.homedir(), "Library", "Application Support", "Blender") : path.join(os.homedir(), ".config", "blender");
  const fromExe = /Blender[\s_-]*(\d+\.\d+)/i.exec(exe ?? "")?.[1];
  let version = fromExe;
  if (!version && fs.existsSync(base)) version = fs.readdirSync(base).filter((d) => /^\d+\.\d+$/.test(d)).sort().pop();
  if (!version) return null;
  return path.join(base, version, "scripts", "addons");
}

export async function setup({ log = console.log } = {}) {
  const report = [];
  const step = (name, ok, note = "") => {
    report.push({ name, ok, note });
    log(`${ok ? "✓" : "•"} ${name}${note ? ` — ${note}` : ""}`);
  };

  // Claude Code: needed for every agent.
  if (has("claude")) step("Claude Code", true, "already installed");
  else step("Claude Code", run("npm", ["install", "-g", "@anthropic-ai/claude-code"]), "installed; open a terminal and run `claude` once to sign in");

  // ffmpeg: title text on thumbnails, test videos, resizing. Optional but recommended.
  if (has("ffmpeg")) step("ffmpeg", true, "already installed");
  else step("ffmpeg", winget("Gyan.FFmpeg"), isWin ? "restart RoCrew afterwards so it's picked up" : "install it with your package manager (brew install ffmpeg)");

  // Blender: never forced. Only if it's already installed do we add what it needs.
  const exe = new HiddenBlender().find();
  if (!exe) {
    step("Blender", true, "not installed, so skipped (it's optional; install it any time and run setup again)");
  } else {
    if (has("uvx")) step("uv (runs the Blender MCP server)", true, "already installed");
    else step("uv (runs the Blender MCP server)", winget("astral-sh.uv") || run("pip", ["install", "uv"]), "restart RoCrew afterwards");
    const dir = blenderAddonDir(exe);
    if (!dir) step("Blender MCP add-on", false, "couldn't find Blender's add-on folder; open Blender once, then run setup again");
    else {
      try {
        const res = await fetch(ADDON_URL, { signal: AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const code = await res.text();
        if (!/bl_info|bpy/.test(code)) throw new Error("the download doesn't look like a Blender add-on");
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${ADDON_MODULE}.py`), code);
        step("Blender MCP add-on", true, `installed to ${dir}; RoCrew turns it on when it opens Blender`);
      } catch (err) {
        step("Blender MCP add-on", false, `download failed (${err.message})`);
      }
    }
  }

  // Cloudflare's tunnel helper for Remote Control is downloaded by the app the first time you share.
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log("Setting up RoCrew…\n");
  const report = await setup();
  const failed = report.filter((r) => !r.ok);
  console.log(failed.length ? `\nDone, with ${failed.length} thing(s) to check above.` : "\nAll set.");
}
