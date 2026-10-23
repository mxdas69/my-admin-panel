// A Cloudflare quick tunnel: gives this computer's RoCrew a temporary https address so a
// friend's browser can reach it from anywhere, with no account and no router setup.
// Every request through it still needs a RoCrew key, so the address alone opens nothing.

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";

const DOWNLOADS = {
  "win32-x64": "cloudflared-windows-amd64.exe",
  "win32-ia32": "cloudflared-windows-386.exe",
  "win32-arm64": "cloudflared-windows-amd64.exe",
  "linux-x64": "cloudflared-linux-amd64",
  "linux-arm64": "cloudflared-linux-arm64",
};
const RELEASES = "https://github.com/cloudflare/cloudflared/releases/latest/download/";

export class Tunnel {
  constructor({ binDir }) {
    this.binDir = binDir;
    this.child = null;
    this.url = null;
  }

  localBinary() {
    return path.join(this.binDir, process.platform === "win32" ? "cloudflared.exe" : "cloudflared");
  }

  /** The cloudflared to run: one we downloaded, or one on the PATH. */
  find() {
    if (fs.existsSync(this.localBinary())) return this.localBinary();
    try {
      const out = execFileSync(process.platform === "win32" ? "where" : "which", ["cloudflared"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
      return out.split(/\r?\n/).find(Boolean) ?? null;
    } catch {
      return null;
    }
  }

  canInstall() {
    return Boolean(DOWNLOADS[`${process.platform}-${process.arch}`]);
  }

  /** Download cloudflared from Cloudflare's GitHub releases into .rocrew/bin. */
  async install() {
    const name = DOWNLOADS[`${process.platform}-${process.arch}`];
    if (!name) throw new Error(process.platform === "darwin" ? "On a Mac, install it with: brew install cloudflared" : "No cloudflared download for this computer. Install it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/");
    const res = await fetch(RELEASES + name, { redirect: "follow" });
    if (!res.ok) throw new Error(`Couldn't download cloudflared (HTTP ${res.status}).`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 5_000_000) throw new Error("The cloudflared download looks incomplete. Try again.");
    fs.mkdirSync(this.binDir, { recursive: true });
    const tmp = `${this.localBinary()}.download`;
    fs.writeFileSync(tmp, bytes, { mode: 0o755 });
    fs.renameSync(tmp, this.localBinary());
    return this.localBinary();
  }

  /** Start the tunnel and resolve with its https address. */
  start(port, timeoutMs = 60000) {
    if (this.child && this.url) return Promise.resolve(this.url);
    const bin = this.find();
    if (!bin) return Promise.reject(Object.assign(new Error("The tunnel helper (cloudflared) isn't installed yet."), { code: "NO_CLOUDFLARED" }));
    return new Promise((resolve, reject) => {
      const child = spawn(bin, ["tunnel", "--no-autoupdate", "--url", `http://localhost:${port}`], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      this.child = child;
      let log = "";
      const timer = setTimeout(() => {
        this.stop();
        reject(new Error("The tunnel didn't start within a minute. Check your internet connection and try again."));
      }, timeoutMs);
      const onData = (chunk) => {
        log = (log + chunk.toString()).slice(-4000);
        const m = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(log);
        if (m && !this.url) {
          this.url = m[0];
          clearTimeout(timer);
          resolve(this.url);
        }
      };
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);
      child.on("error", (err) => {
        clearTimeout(timer);
        this.child = null;
        reject(err);
      });
      child.on("exit", (code) => {
        clearTimeout(timer);
        const wasUp = Boolean(this.url);
        this.child = null;
        this.url = null;
        if (!wasUp) reject(new Error(`The tunnel stopped before it started (exit ${code}). ${log.split("\n").filter((l) => /ERR|error/i.test(l)).slice(-1)[0] ?? ""}`.trim()));
        else if (!child.intentional) this.onExit?.(code);
      });
    });
  }

  stop() {
    const child = this.child;
    this.child = null;
    this.url = null;
    if (!child) return;
    child.intentional = true;
    if (process.platform === "win32" && child.pid) {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      } catch {}
    } else {
      child.kill("SIGTERM");
    }
  }
}
