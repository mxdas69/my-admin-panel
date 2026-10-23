// Blender for the crew, hidden in the background. RoCrew starts it when Blender is turned on,
// asks the Blender MCP add-on to start listening, and closes it when RoCrew quits.

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";

export const ADDON_MODULE = "blender_mcp_addon";

// Turn the add-on on (setup installs it), then start its server once Blender has opened.
const START_ADDON = [
  "import bpy",
  "try:",
  `    bpy.ops.preferences.addon_enable(module='${ADDON_MODULE}')`,
  "except Exception as e:",
  "    print('RoCrew: Blender MCP add-on not enabled:', e)",
  "def _rocrew_start():",
  "    try:",
  "        bpy.ops.blendermcp.start_server()",
  "    except Exception as e:",
  "        print('RoCrew: could not start the Blender MCP add-on server:', e)",
  "    return None",
  "bpy.app.timers.register(_rocrew_start, first_interval=4.0)",
].join("\n");

export class HiddenBlender {
  constructor() {
    this.child = null;
  }

  find() {
    if (process.platform === "win32") {
      const roots = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]].filter(Boolean).map((p) => path.join(p, "Blender Foundation"));
      for (const root of roots) {
        if (!fs.existsSync(root)) continue;
        const versions = fs.readdirSync(root).filter((d) => /^Blender/i.test(d)).sort().reverse();
        for (const v of versions) {
          const exe = path.join(root, v, "blender.exe");
          if (fs.existsSync(exe)) return exe;
        }
      }
      return null;
    }
    if (process.platform === "darwin" && fs.existsSync("/Applications/Blender.app/Contents/MacOS/Blender")) return "/Applications/Blender.app/Contents/MacOS/Blender";
    try {
      return execFileSync("which", ["blender"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
    } catch {
      return null;
    }
  }

  running() {
    return Boolean(this.child);
  }

  /** Start Blender with its window hidden, sound off, and the MCP add-on listening. */
  start() {
    if (this.child) return true;
    const exe = this.find();
    if (!exe) return false;
    const child = spawn(exe, ["--no-window-focus", "-noaudio", "--python-expr", START_ADDON], { windowsHide: true, stdio: "ignore" });
    child.on("exit", () => {
      if (this.child === child) this.child = null;
    });
    child.on("error", () => {
      if (this.child === child) this.child = null;
    });
    this.child = child;
    return true;
  }

  stop() {
    const child = this.child;
    this.child = null;
    if (!child?.pid) return;
    try {
      if (process.platform === "win32") execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else child.kill("SIGTERM");
    } catch {}
  }
}
