#!/usr/bin/env node
// Stands in for `claude -p --output-format stream-json` in tests and demos.
// The Lead queues a Builder task through the real CLI, so the whole loop runs.

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const args = process.argv.slice(2);
const resume = args.includes("--resume") ? args[args.indexOf("--resume") + 1] : null;
const agent = process.env.ROCREW_AGENT ?? "lead";
const sessionId = resume ?? randomUUID();
let prompt = "";
for await (const chunk of process.stdin) prompt += chunk;

const out = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

out({ type: "system", subtype: "init", session_id: sessionId, tools: ["Bash", "Read"], mcp_servers: [{ name: "Roblox_Studio", status: "connected" }] });
await wait(Number(process.env.FAKE_DELAY ?? 150));

if (prompt.includes("PLEASE FAIL")) {
  process.stderr.write("simulated crash\n");
  process.exit(2);
}

if (agent === "lead" && prompt.includes("## Message from the owner")) {
  out({ type: "assistant", message: { content: [{ type: "text", text: "On it. Queuing the Builder." }, { type: "tool_use", id: "x", name: "Bash", input: { command: "node studio/cli.mjs task add --agent builder --title 'Wire the delivery loop'" } }] } });
  const game = process.env.ROCREW_GAME;
  const res = execFileSync("node", ["studio/cli.mjs", "task", "add", "--agent", "builder", "--title", "Wire the delivery loop", "--brief", "Pick up, deliver, earn coins on the server.", ...(game ? ["--game", game] : [])], { encoding: "utf8" });
  out({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: "x", content: res }] } });
  out({ type: "result", subtype: "success", is_error: false, result: "Builder is wiring the delivery loop. I'll report back when it's tested.", session_id: sessionId, total_cost_usd: 0.01, num_turns: 2 });
} else {
  out({ type: "assistant", message: { content: [{ type: "tool_use", id: "y", name: "mcp__Roblox_Studio__run_code", input: { code: "print('hi')" } }] } });
  await wait(Number(process.env.FAKE_DELAY ?? 150));
  out({ type: "assistant", message: { content: [{ type: "text", text: `${agent} working on it.` }] } });
  out({ type: "result", subtype: "success", is_error: false, result: `${agent} finished. Evidence: games/demo/reports/ok.md. Next: Playtest.`, session_id: sessionId, total_cost_usd: 0.02, num_turns: 3 });
}
