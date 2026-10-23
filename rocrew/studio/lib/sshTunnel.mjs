// A public https address for friend links, made with the SSH client that ships with Windows 10/11
// (and macOS/Linux): no download, no account. localhost.run first, Pinggy if that doesn't answer.
// Every request through it still needs a friend's RoCrew key, so the address alone opens nothing.

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { waitUntilReachable } from "./tunnel.mjs";

const SERVICES = [
  { name: "localhost.run", args: (port) => ["-R", `80:localhost:${port}`, "nokey@localhost.run"], url: /https:\/\/[a-z0-9-]+\.lhr\.life/ },
  { name: "Pinggy", args: (port) => ["-p", "443", `-R0:localhost:${port}`, "free.pinggy.io"], url: /https:\/\/[a-z0-9-]+\.[a-z]\.free\.pinggy\.link/ },
];

export class SshTunnel {
  constructor() {
    this.child = null;
    this.url = null;
    this.onExit = null;
  }

  find() {
    if (process.platform === "win32") {
      const builtIn = path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "OpenSSH", "ssh.exe");
      if (fs.existsSync(builtIn)) return builtIn;
    }
    try {
      const out = execFileSync(process.platform === "win32" ? "where" : "which", ["ssh"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
      return out.split(/\r?\n/).find(Boolean) ?? null;
    } catch {
      return null;
    }
  }

  /** Start (or reuse) the tunnel and resolve with an address that already answers. */
  async start(port) {
    if (this.child && this.url) return this.url;
    const ssh = this.find();
    if (!ssh) throw new Error("This PC has no SSH client. On Windows: Settings → System → Optional features → add \"OpenSSH Client\", then try again.");
    const errors = [];
    for (const service of SERVICES) {
      try {
        return await this.tryService(ssh, service, port);
      } catch (err) {
        errors.push(`${service.name}: ${err.message}`);
      }
    }
    throw new Error(`Couldn't make a link (${errors.join("; ")}). Check your internet and try again.`);
  }

  tryService(ssh, service, port) {
    const args = ["-T", "-o", "StrictHostKeyChecking=accept-new", "-o", "ServerAliveInterval=30", "-o", "ExitOnForwardFailure=yes", ...service.args(port)];
    return new Promise((resolve, reject) => {
      // stdin stays open: these services print the address on the session and close it on EOF.
      const child = spawn(ssh, args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
      let log = "";
      let settled = false;
      const fail = (msg) => {
        if (settled) return;
        settled = true;
        this.url = null;
        child.intentional = true;
        child.kill();
        reject(new Error(msg));
      };
      const timer = setTimeout(() => fail("no answer within 40 seconds"), 40000);
      const onData = (chunk) => {
        log = (log + chunk.toString()).slice(-4000);
        const m = service.url.exec(log);
        if (m && !settled && !this.url) {
          this.url = m[0];
          waitUntilReachable(this.url, 10).then((ok) => {
            clearTimeout(timer);
            if (!ok) return fail("the address never answered");
            settled = true;
            this.child = child;
            resolve(this.url);
          });
        }
      };
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);
      child.on("error", (err) => fail(err.message));
      child.on("exit", (code) => {
        clearTimeout(timer);
        if (!settled) {
          this.url = null;
          return fail(`stopped (exit ${code}) ${log.split("\n").filter(Boolean).slice(-1)[0] ?? ""}`.trim());
        }
        if (this.child !== child) return;
        this.child = null;
        this.url = null;
        if (!child.intentional) this.onExit?.(code);
      });
    });
  }

  stop() {
    const child = this.child;
    this.child = null;
    this.url = null;
    if (!child) return;
    child.intentional = true;
    child.kill();
  }
}
