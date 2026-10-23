// The crew's own browser, signed in to your Roblox account.
//
// You sign in once, in a window RoCrew opens on this PC. The sign-in lives in a separate
// browser profile in .rocrew/browser (your normal browser is untouched; on Windows the saved
// cookies are encrypted to your Windows account, so the folder is useless on another PC).
// After that, agents that need it (stats, funnels, game passes on the Creator Hub) drive that
// profile through Microsoft's Playwright MCP server: hidden and muted by default, or visible
// so you can watch and step in. Agents can't read the profile's files, and RoCrew never
// sends your cookie anywhere: it only ever asks Roblox "who is signed in?".

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";

export const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.83";
export const SERVER_NAME = "roblox-browser";

const CANDIDATES = {
  win32: () => {
    const pf = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
    return [
      // Brave first (the owner's browser), then Edge (always on Windows), then Chrome.
      ...pf.map((d) => ({ channel: "brave", file: path.join(d, "BraveSoftware", "Brave-Browser", "Application", "brave.exe") })),
      ...pf.map((d) => ({ channel: "msedge", file: path.join(d, "Microsoft", "Edge", "Application", "msedge.exe") })),
      ...pf.map((d) => ({ channel: "chrome", file: path.join(d, "Google", "Chrome", "Application", "chrome.exe") })),
    ];
  },
  darwin: () => [
    { channel: "brave", file: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" },
    { channel: "chrome", file: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
    { channel: "msedge", file: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" },
  ],
  linux: () => ["brave-browser", "brave", "google-chrome", "google-chrome-stable", "microsoft-edge", "chromium", "chromium-browser"].map((bin) => ({ channel: bin.includes("edge") ? "msedge" : bin.startsWith("google") ? "chrome" : bin.startsWith("brave") ? "brave" : "chromium", bin })),
};

export class RobloxBrowser {
  constructor({ dir, getShow }) {
    this.dir = dir;
    this.profile = path.join(dir, "roblox-profile");
    this.statusFile = path.join(dir, "status.json");
    this.getShow = getShow;
    this.window = null;
    this.status = { signedIn: false, name: null, userId: null, checkedAt: null, error: null };
    try {
      Object.assign(this.status, JSON.parse(fs.readFileSync(this.statusFile, "utf8")));
    } catch {}
  }

  /** The installed Chromium-based browser to use (Edge comes with Windows). */
  browser() {
    for (const c of (CANDIDATES[process.platform] ?? CANDIDATES.linux)()) {
      if (c.file && fs.existsSync(c.file)) return c;
      if (c.bin) {
        try {
          const file = execFileSync("which", [c.bin], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
          if (file) return { channel: c.channel, file };
        } catch {}
      }
    }
    return null;
  }

  saveStatus(patch) {
    this.status = { ...this.status, ...patch, checkedAt: Date.now() };
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(this.statusFile, JSON.stringify(this.status, null, 2), { mode: 0o600 });
    this.onChange?.();
  }

  /** Open a normal browser window on the Roblox sign-in page, using the crew's profile. */
  /** Whether a browser already has the crew's profile open (Chromium leaves a lock file). */
  profileInUse() {
    return ["lockfile", "SingletonLock", "SingletonCookie"].some((f) => fs.existsSync(path.join(this.profile, f)));
  }

  openSignIn() {
    const b = this.browser();
    if (!b) throw new Error("No Brave, Microsoft Edge or Google Chrome found on this PC. Install one and try again.");
    if (this.window) return;
    if (this.profileInUse()) throw new Error("The RoCrew Roblox window is already open (or an agent is using it). Sign in there, close it, then press Check.");
    fs.mkdirSync(this.profile, { recursive: true });
    const child = spawn(b.file, [`--user-data-dir=${this.profile}`, "--no-first-run", "--no-default-browser-check", "--mute-audio", "https://www.roblox.com/login"], { stdio: "ignore", detached: false });
    this.window = child;
    child.on("exit", () => {
      this.window = null;
      this.onChange?.();
      // The window closed: see whether the sign-in worked.
      setTimeout(() => this.check().catch(() => {}), 1500);
    });
    child.on("error", (err) => {
      this.window = null;
      this.saveStatus({ error: err.message });
    });
    this.onChange?.();
  }

  /**
   * Ask Roblox who is signed in, with a hidden, muted browser on the crew's profile. Only the
   * user name and id are kept. Skipped while the profile is open elsewhere (it's locked).
   */
  check({ timeoutMs = 45000, busy = false } = {}) {
    const b = this.browser();
    if (!b) return Promise.resolve(this.saveStatus({ signedIn: false, error: "No Edge or Chrome found." }));
    // Never start a second copy on a profile that's open: it would just open tabs in that window.
    if (this.window || busy || this.profileInUse()) return Promise.resolve(this.status);
    if (!fs.existsSync(this.profile)) return Promise.resolve(this.saveStatus({ signedIn: false, name: null, userId: null, error: null }));
    return new Promise((resolve) => {
      const child = spawn(b.file, ["--headless=new", `--user-data-dir=${this.profile}`, "--mute-audio", "--disable-gpu", "--no-first-run", "--dump-dom", "https://users.roblox.com/v1/users/authenticated"], { stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
      let out = "";
      const timer = setTimeout(() => child.kill(), timeoutMs);
      child.stdout.on("data", (c) => (out += c));
      child.on("error", (err) => {
        clearTimeout(timer);
        resolve(this.saveStatus({ error: err.message }));
      });
      child.on("exit", () => {
        clearTimeout(timer);
        const who = parseWhoAmI(out);
        // No answer at all (offline, Roblox down): keep what we knew rather than "signing you out".
        resolve(this.saveStatus(who ?? { error: "Couldn't reach Roblox to check the sign-in. It'll try again later." }));
      });
    });
  }

  signOut() {
    if (this.window) this.window.kill();
    fs.rmSync(this.profile, { recursive: true, force: true });
    return this.saveStatus({ signedIn: false, name: null, userId: null, error: null });
  }

  /** The Playwright MCP server, as a `claude --mcp-config` JSON string for one agent run. */
  mcpConfig() {
    const b = this.browser();
    if (!b) return null;
    const configFile = path.join(this.dir, "playwright-mcp.json");
    const config = {
      browser: {
        browserName: "chromium",
        userDataDir: this.profile,
        // Playwright knows Edge and Chrome by channel; Brave and plain Chromium go by their exe path.
        launchOptions: { channel: ["msedge", "chrome"].includes(b.channel) ? b.channel : undefined, executablePath: ["msedge", "chrome"].includes(b.channel) ? undefined : b.file, headless: !this.getShow(), args: ["--mute-audio", "--no-first-run", "--no-default-browser-check"] },
        contextOptions: { viewport: { width: 1440, height: 900 } },
      },
      outputDir: path.join(this.dir, "output"),
    };
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), { mode: 0o600 });
    const args = ["-y", PLAYWRIGHT_MCP, "--config", configFile];
    const server = process.platform === "win32" ? { command: "cmd", args: ["/c", "npx", ...args] } : { command: "npx", args };
    return JSON.stringify({ mcpServers: { [SERVER_NAME]: server } });
  }

  view() {
    return { ...this.status, browser: this.browser()?.channel ?? null, windowOpen: Boolean(this.window), show: Boolean(this.getShow()) };
  }
}

/**
 * Read Roblox's "who am I" JSON out of the dumped page: the account when signed in, signed out
 * when Roblox answers "Unauthorized", or null when there was no answer. Exposed for tests.
 */
export function parseWhoAmI(html) {
  const text = String(html).replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const m = /\{[^{}]*"id"\s*:\s*(\d+)[^{}]*\}/.exec(text);
  if (!m) return /unauthori[sz]ed|"errors"/i.test(text) ? { signedIn: false, name: null, userId: null, error: null } : null;
  try {
    const j = JSON.parse(m[0]);
    return { signedIn: true, name: j.name ?? null, displayName: j.displayName ?? null, userId: j.id, error: null };
  } catch {
    return { signedIn: false, name: null, userId: null, error: null };
  }
}
