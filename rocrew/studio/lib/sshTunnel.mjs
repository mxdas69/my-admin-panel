// A public https address for friend links, made with the SSH client that ships with Windows 10/11
// (and macOS/Linux): no download, no account. localhost.run first, Pinggy if that doesn't answer.
// Every request through it still needs a friend's RoCrew key, so the address alone opens nothing.

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { waitUntilReachable } from "./tunnel.mjs";

// Each pattern finds the address host (with or without "https://"; localhost.run's JSON has none).
const SERVICES = [
  // "--output json" asks localhost.run for a plain line with the address instead of a QR code.
  { name: "localhost.run", args: (port) => ["-R", `80:127.0.0.1:${port}`, "nokey@localhost.run", "--", "--output", "json"], host: /\b([a-z0-9-]+\.lhr\.(?:life|pro))\b/ },
  { name: "Pinggy", args: (port) => ["-p", "443", `-R0:127.0.0.1:${port}`, "free.pinggy.io"], host: /https:\/\/([a-z0-9.-]+\.pinggy\.(?:link|online))/ },
  { name: "Serveo", args: (port) => ["-R", `80:127.0.0.1:${port}`, "serveo.net"], host: /Forwarding HTTP traffic from https?:\/\/([a-z0-9.-]+)/i },
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
    // Pressing the button twice waits for the same attempt.
    this.starting ??= this.open(port).finally(() => (this.starting = null));
    return this.starting;
  }

  async open(port) {
    const ssh = this.find();
    if (!ssh) throw new Error("This PC has no SSH client. On Windows: Settings → System → Optional features → add \"OpenSSH Client\", then try again.");
    // Both services at once; the first address that answers wins and the other is stopped.
    try {
      return await Promise.any(SERVICES.map((service) => this.tryService(ssh, service, port)));
    } catch (err) {
      const reasons = (err.errors ?? [err]).map((e, i) => `${SERVICES[i]?.name ?? "tunnel"}: ${e.message}`);
      throw new Error(`Couldn't make a link. ${reasons.join(" · ")}`);
    }
  }

  tryService(ssh, service, port) {
    const args = ["-T", "-o", "StrictHostKeyChecking=accept-new", "-o", "ServerAliveInterval=30", "-o", "ExitOnForwardFailure=yes", ...service.args(port)];
    return new Promise((resolve, reject) => {
      // stdin stays open: these services print the address on the session and close it on EOF.
      const child = spawn(ssh, args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
      let log = "";
      let settled = false;
      let found = null;
      const fail = (msg) => {
        if (settled) return;
        settled = true;
        child.intentional = true;
        child.kill();
        reject(new Error(msg));
      };
      const timer = setTimeout(() => fail(`no address within 45 seconds${lastLine() ? ` (last said: ${lastLine()})` : ""}`), 45000);
      // The last line with words in it (not QR code blocks).
      const lastLine = () => log.split(/\r?\n/).map((l) => l.trim()).filter((l) => /[a-z]{3}/i.test(l)).slice(-1)[0]?.slice(0, 160) ?? "";
      const onData = (chunk) => {
        // Strip colour codes (the QR code these services draw) before looking for the address.
        log = (log + chunk.toString().replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replace(/\[[0-9;]*m/g, "")).slice(-8000);
        const m = service.host.exec(log);
        if (m && !settled && !found) {
          found = `https://${m[1]}`;
          console.log(`[rocrew] friend link from ${service.name}: ${found} (checking it answers)`);
          waitUntilReachable(found, 8).then((ok) => {
            clearTimeout(timer);
            if (!ok) return fail("the address never answered");
            if (this.child) return fail("the other service was faster");
            settled = true;
            this.child = child;
            this.url = found;
            resolve(found);
          });
        }
      };
      // Some services wait at an empty password prompt: press Enter for them.
      child.stdin.write("\n");
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);
      child.on("error", (err) => fail(err.message));
      child.on("exit", (code) => {
        clearTimeout(timer);
        if (!settled) return fail(`stopped (exit ${code})${lastLine() ? `: ${lastLine()}` : ""}`);
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
