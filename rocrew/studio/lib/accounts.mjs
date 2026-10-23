// More than one Claude plan on this PC. Account 1 is Claude Code's normal sign-in; every extra
// account keeps its own sign-in in .rocrew/claude-accounts/<id> (Claude Code's CLAUDE_CONFIG_DIR),
// so the two never mix. The crew sends work to whichever account has room.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

export const MAIN = "main";

export function accountDir(dataDir, id) {
  return path.join(dataDir, "claude-accounts", id);
}

/** Every account, Account 1 first. `dir` is null for the normal sign-in. */
export function listAccounts(cfg, dataDir) {
  return [{ id: MAIN, name: "Account 1", dir: null }, ...(cfg.claudeAccounts ?? []).map((a) => ({ id: a.id, name: a.name, dir: accountDir(dataDir, a.id) }))];
}

/** The environment that points Claude Code at one account's sign-in. */
export function accountEnv(account) {
  return account?.dir ? { CLAUDE_CONFIG_DIR: account.dir } : {};
}

/**
 * Give an extra account the same MCP servers (Roblox Studio, Blender…) as the normal sign-in.
 * Only the server list is copied, never the sign-in itself.
 */
export function syncMcpServers(account, root) {
  if (!account?.dir) return;
  const mainDir = process.env.CLAUDE_CONFIG_DIR;
  const mainFile = mainDir ? path.join(mainDir, ".claude.json") : path.join(os.homedir(), ".claude.json");
  let main;
  try {
    main = JSON.parse(fs.readFileSync(mainFile, "utf8"));
  } catch {
    return;
  }
  // User-wide servers plus the ones added for this project folder.
  const project = Object.entries(main.projects ?? {}).find(([p]) => path.resolve(p).toLowerCase() === path.resolve(root).toLowerCase())?.[1];
  const servers = { ...(main.mcpServers ?? {}), ...(project?.mcpServers ?? {}) };
  if (!Object.keys(servers).length) return;
  fs.mkdirSync(account.dir, { recursive: true });
  const file = path.join(account.dir, ".claude.json");
  let mine = {};
  try {
    mine = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}
  if (JSON.stringify(mine.mcpServers ?? {}) === JSON.stringify(servers)) return;
  mine.mcpServers = servers;
  fs.writeFileSync(file, JSON.stringify(mine, null, 2));
}

/** Open a terminal window running Claude Code on this account, so the owner can sign in. */
export function openSignIn(account, claudeCommand = "claude") {
  fs.mkdirSync(account.dir, { recursive: true });
  if (process.platform === "win32") {
    const line = `title Sign in to ${account.name} && set "CLAUDE_CONFIG_DIR=${account.dir}" && echo Sign in with your ${account.name} Claude login, then close this window. && ${claudeCommand}`;
    spawn("cmd.exe", ["/c", "start", '""', "cmd.exe", "/k", line], { detached: true, stdio: "ignore", windowsVerbatimArguments: true }).unref();
  } else if (process.platform === "darwin") {
    const script = `tell application "Terminal" to do script "export CLAUDE_CONFIG_DIR='${account.dir}'; ${claudeCommand}"`;
    spawn("osascript", ["-e", script, "-e", 'tell application "Terminal" to activate'], { detached: true, stdio: "ignore" }).unref();
  } else {
    throw new Error(`Open a terminal and run: CLAUDE_CONFIG_DIR="${account.dir}" ${claudeCommand}`);
  }
}
