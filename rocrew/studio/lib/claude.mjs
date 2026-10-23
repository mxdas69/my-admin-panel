// Runs one Claude Code turn headless (`claude -p`) and streams what happens.
// The prompt goes in on stdin, so nothing long or quoted ever touches the shell.

import { spawn, execFile } from "node:child_process";

const isWindows = process.platform === "win32";

/** "node test/fake-claude.mjs" -> ["node", "test/fake-claude.mjs"], keeping quoted parts together. */
export function splitCommand(command) {
  const parts = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return parts.map((p) => p.replace(/^["']|["']$/g, ""));
}

function quoteForCmd(arg) {
  return /[\s"&|<>^()%!,;]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
}

function spawnCommand(command, args, options) {
  const [bin, ...pre] = splitCommand(command);
  if (!isWindows) return spawn(bin, [...pre, ...args], options);
  // On Windows `claude` is usually a .cmd shim, which needs a shell; quote every argument ourselves.
  const line = [bin, ...pre, ...args].map(quoteForCmd).join(" ");
  return spawn(line, { ...options, shell: true });
}

/**
 * @param {object} opts
 * @param {string} opts.command      e.g. "claude"
 * @param {string} opts.cwd          project root (so CLAUDE.md and .mcp.json apply)
 * @param {string} opts.prompt
 * @param {string|null} opts.sessionId  resume this conversation when set
 * @param {string} opts.permissionMode  "safe" | "autopilot"
 * @param {string[]} opts.allowedTools
 * @param {string} [opts.model]
 * @param {Record<string,string>} [opts.env]
 * @param {number} [opts.timeoutMs]
 * @param {(e: {type: string, [k: string]: any}) => void} [opts.onEvent]
 */
export function runClaude(opts) {
  const args = ["-p", "--output-format", "stream-json", "--verbose"];
  if (opts.sessionId) args.push("--resume", opts.sessionId);
  if (opts.permissionMode === "autopilot") {
    args.push("--permission-mode", "bypassPermissions");
  } else {
    args.push("--permission-mode", "acceptEdits");
    if (opts.allowedTools?.length) args.push("--allowedTools", opts.allowedTools.join(","));
  }
  if (opts.model) args.push("--model", opts.model);

  const child = spawnCommand(opts.command, args, {
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  const emit = (e) => {
    try {
      opts.onEvent?.(e);
    } catch (err) {
      console.error("[rocrew] event handler failed:", err);
    }
  };

  let sessionId = opts.sessionId ?? null;
  let result = null;
  let stderr = "";
  let buffer = "";
  let killedFor = null;

  const handleLine = (line) => {
    if (!line.trim()) return;
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      emit({ type: "log", text: line });
      return;
    }
    if (ev.session_id) sessionId = ev.session_id;
    if (ev.type === "system" && ev.subtype === "init") {
      emit({ type: "init", sessionId, mcpServers: ev.mcp_servers ?? [], tools: ev.tools ?? [] });
    } else if (ev.type === "assistant") {
      for (const block of ev.message?.content ?? []) {
        if (block.type === "text" && block.text?.trim()) emit({ type: "text", text: block.text });
        else if (block.type === "tool_use") emit({ type: "tool", name: block.name, input: block.input });
      }
    } else if (ev.type === "user") {
      for (const block of ev.message?.content ?? []) {
        if (block.type === "tool_result" && block.is_error) {
          const text = Array.isArray(block.content) ? block.content.map((c) => c.text ?? "").join("") : String(block.content ?? "");
          emit({ type: "tool_error", text: text.slice(0, 500) });
        }
      }
    } else if (ev.type === "result") {
      result = {
        ok: !ev.is_error && ev.subtype === "success",
        text: typeof ev.result === "string" ? ev.result : "",
        subtype: ev.subtype,
        costUsd: ev.total_cost_usd ?? null,
        turns: ev.num_turns ?? null,
      };
    }
  };

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      handleLine(buffer.slice(0, nl));
      buffer = buffer.slice(nl + 1);
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-4000);
  });

  child.stdin.on("error", () => {});
  child.stdin.end(opts.prompt);

  const timer = opts.timeoutMs
    ? setTimeout(() => kill(`timed out after ${Math.round(opts.timeoutMs / 60000)} min`), opts.timeoutMs)
    : null;

  function kill(reason) {
    if (child.exitCode !== null) return;
    killedFor = reason;
    if (isWindows && child.pid) execFile("taskkill", ["/pid", String(child.pid), "/T", "/F"], () => {});
    else child.kill("SIGTERM");
  }

  const done = new Promise((resolve) => {
    let settled = false;
    const finish = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (buffer) handleLine(buffer);
      if (killedFor) resolve({ ok: false, sessionId, text: "", error: killedFor });
      else if (result) resolve({ ...result, sessionId, error: result.ok ? null : `Claude Code ended with "${result.subtype}"` });
      else resolve({ ok: false, sessionId, text: "", error: describeFailure(code, stderr) });
    };
    child.on("error", (err) => {
      stderr += `\n${err.message}`;
      finish(-1);
    });
    child.on("close", finish);
  });

  return { done, kill };
}

function describeFailure(code, stderr) {
  if (/ENOENT|not recognized|not found/i.test(stderr)) {
    return "Could not start Claude Code. Install it (https://code.claude.com) or set the command in Settings.";
  }
  const tail = stderr.trim().split("\n").slice(-6).join("\n");
  return `Claude Code exited with code ${code}${tail ? `:\n${tail}` : ""}`;
}

/** `claude --version` and `claude mcp list`, for the Connections panel. */
export async function probeClaude(command, cwd) {
  const run = (args) =>
    new Promise((resolve) => {
      const child = spawnCommand(command, args, { cwd, windowsHide: true });
      let out = "";
      child.stdout?.on("data", (d) => (out += d));
      child.stderr?.on("data", (d) => (out += d));
      const timer = setTimeout(() => child.kill(), 20000);
      child.on("error", () => resolve({ ok: false, out }));
      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({ ok: code === 0, out });
      });
    });

  const version = await run(["--version"]);
  if (!version.ok) return { installed: false, version: null, servers: [] };
  const list = await run(["mcp", "list"]);
  return { installed: true, version: version.out.trim().split("\n")[0], servers: parseMcpList(list.out) };
}

export function parseMcpList(text) {
  const servers = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^([^\s:][^:]*?):\s+(.*)$/);
    if (!m || /^(Checking|No MCP)/i.test(line)) continue;
    const status = /✓|connected/i.test(m[2]) && !/fail|✗/i.test(m[2]) ? "connected" : /needs auth/i.test(m[2]) ? "needs-auth" : "failed";
    servers.push({ name: m[1].trim(), status, detail: m[2].trim() });
  }
  return servers;
}
