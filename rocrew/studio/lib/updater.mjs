// One-click updates: download the latest RoCrew from GitHub and replace the program files.
// Your data is never touched: .rocrew (settings, keys, sign-ins, tasks), games/ and .mcp.json stay.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const REPO = "mxdas69/my-admin-panel";
const BRANCH = "claude/15-agent-project-giryqj";
const SUBDIR = "rocrew";
const KEEP = new Set([".rocrew", "games", ".mcp.json", "node_modules", ".git"]);

export class Updater {
  constructor({ root, dataDir }) {
    this.root = root;
    this.file = path.join(dataDir, "version.json");
    this.state = { sha: null, latest: null, checkedAt: null, error: null };
    try {
      Object.assign(this.state, JSON.parse(fs.readFileSync(this.file, "utf8")));
    } catch {}
  }

  save() {
    fs.writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }

  /** Ask GitHub for the newest version (one small request; done every few hours). */
  async check() {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(BRANCH)}`, { headers: { accept: "application/vnd.github+json", "user-agent": "RoCrew" }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
      const j = await res.json();
      this.state.latest = { sha: j.sha, message: String(j.commit?.message ?? "").split("\n")[0], date: j.commit?.committer?.date ?? null };
      this.state.error = null;
    } catch (err) {
      this.state.error = err.message;
    }
    this.state.checkedAt = Date.now();
    this.save();
    return this.view();
  }

  view() {
    const { sha, latest } = this.state;
    return { current: sha, latest, available: Boolean(latest?.sha && latest.sha !== sha), checkedAt: this.state.checkedAt, error: this.state.error };
  }

  /** Download, unpack and copy the new program files over this folder. */
  async install() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rocrew-update-"));
    const zip = path.join(tmp, "update.zip");
    const res = await fetch(`https://codeload.github.com/${REPO}/zip/refs/heads/${BRANCH}`, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`Download failed (HTTP ${res.status}).`);
    fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    unzip(zip, tmp);
    const top = fs.readdirSync(tmp).find((d) => fs.statSync(path.join(tmp, d)).isDirectory());
    const src = path.join(tmp, top, SUBDIR);
    if (!fs.existsSync(path.join(src, "studio", "server.mjs"))) throw new Error("The download didn't contain RoCrew. Nothing was changed.");
    copyOver(src, this.root);
    fs.rmSync(tmp, { recursive: true, force: true });
    this.state.sha = this.state.latest?.sha ?? this.state.sha;
    this.save();
  }
}

function copyOver(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (KEEP.has(entry.name)) continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(b, { recursive: true });
      copyOver(a, b);
    } else {
      fs.copyFileSync(a, b);
    }
  }
}

/** Windows 10+ and macOS ship a `tar` that reads zip files; fall back to PowerShell or unzip. */
function unzip(zip, dir) {
  const tries = [
    ["tar", ["-xf", zip, "-C", dir]],
    ...(process.platform === "win32" ? [["powershell", ["-NoProfile", "-Command", `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${dir}' -Force`]]] : []),
    ["unzip", ["-q", "-o", zip, "-d", dir]],
  ];
  for (const [cmd, args] of tries) {
    try {
      execFileSync(cmd, args, { stdio: "ignore", windowsHide: true });
      return;
    } catch {}
  }
  throw new Error("Couldn't unpack the update. Nothing was changed.");
}
