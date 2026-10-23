# RoCrew — your Roblox agent studio

A team of **15 AI agents** that plan, build, test and fix Roblox games in Roblox Studio while you're away. You give the Lead one game idea; the crew works out the steps, hands work to each other, checks each other's work, and brings you only the decisions that need you.

It runs on **Claude Code** (your normal Claude Code plan, no API key), talks to **Roblox Studio** through Studio's MCP server, makes icons and thumbnails with **Gemini**, can model custom assets in **Blender**, and can upload images to Roblox with **Open Cloud**.

> Inspired by RoAutomation's agent studio, rebuilt from scratch from its public screenshots.

## The crew

| | Agent | Job |
|---|---|---|
| ✦ | **Lead** | Turns your goal into tasks and keeps everyone on track |
| 〰 | **Pulse** | Watches the Roblox charts and pitches games that are growing |
| ◎ | **Architect** | Writes the game plan before anything gets built |
| ▥ | **Librarian** | Finds and sets up models, effects and sounds |
| ⚒ | **Builder** | Writes the code and wires up the game |
| ▦ | **Frame** | Designs the UI and makes it fit every screen |
| ⛰ | **Scenic** | Builds the world, terrain, lighting and atmosphere |
| ▶ | **Playtest** | Runs the game in Studio and reports what breaks |
| ☺ | **Kid Tester** | Plays like a new 10-year-old |
| ⚖ | **Balance** | Simulates the economy so upgrades feel right |
| ▣ | **Splash** | Makes thumbnails and icons |
| ⛨ | **Reviewer** | Checks money, saves and anything that could break before you ship |
| 📈 | **Liveops** | Tracks player signals and plans the next update |
| 🏪 | **Merchant** | Sets up shops, passes and developer products |
| ◉ | **Producer** | Checks the evidence before the next stage moves ahead |

Their full instructions are in [`.claude/agents/`](.claude/agents), and the rules they share are in [`CLAUDE.md`](CLAUDE.md).

## What the app does

Start it with `node studio/server.mjs` and open **http://localhost:4600**.

- **Home** — what needs you, who's working, and a box to ask the Lead anything.
- **Lead** — chat with the Lead. Say what you want; it plans and assigns the work.
- **Team** — every agent's own chat. Message any of them directly.
- **Tasks** — everything queued, running and finished, with what came back.
- **Review** — screenshots, renders and icons the agents want your opinion on. Approve, ask for changes (with a note), or reject; the agent picks up your verdict.
- **Games** — each game's open work, pipeline, files (plan, economy, reports, art) and live Roblox numbers.
- **Pitches** — game ideas Pulse found in the charts. Nothing gets built until you approve one.
- **Market** — Roblox charts with rank moves between snapshots, a reference corpus, benchmarks and breakout games.
- **Library** — models, icons and sounds with their Roblox ids, plus reusable game systems.
- **Vault** — the knowledge the agents study before they build (also an Obsidian vault).
- **Settings** — Claude Code, Studio, Blender, Gemini and Open Cloud connections, and how much the crew may do alone.

How the automation works:

1. Each agent runs as its **own Claude Code conversation** (`claude -p --agent <role>`, resumed between tasks), so it keeps its role and remembers its earlier work. **Start fresh** on an agent's page clears that memory.
2. Agents queue work for each other with a small CLI (`node studio/cli.mjs task add …`). Each agent takes one task at a time, and several agents work in parallel.
3. **Only one agent changes Studio at a time.** The app holds a Studio lock, shown as "Builder has Studio".
4. When the crew goes quiet, the app wakes the Lead with everyone's handoffs. It plans the next round, so work keeps moving while you sleep, up to a limit you set.
5. Anything only you can do (publish, set prices, create game passes on the Creator Hub) lands in **Needs you**.

## Setup

You need:

- **Node.js 20 or newer** — https://nodejs.org
- **Claude Code**, installed and signed in (run `claude` once in a terminal). Every agent run uses your Claude Code plan's usage.
- **Roblox Studio**, connected to Claude Code through Studio's built-in MCP server.
- Optional: a **Gemini API key** (Google AI Studio) for icons, thumbnails and UI art.
- Optional: **Blender** with the Blender MCP add-on and [`uv`](https://docs.astral.sh/uv/) for custom models.
- Optional: a **Roblox Open Cloud API key** (Assets read + write) to upload images automatically.

Steps:

1. **Get the folder.**
   ```
   git clone -b claude/15-agent-project-giryqj https://github.com/mxdas69/my-admin-panel.git
   cd my-admin-panel/rocrew
   ```
2. **Connect Roblox Studio to Claude Code.** Open your place in Studio, open the Assistant, then its settings, then **MCP Servers**, and use quick connect for **Claude Code**. Check it worked with `claude mcp list`.
3. **Start the studio.** On Windows, double-click **`Start RoCrew.bat`**. Anywhere else:
   ```
   node studio/server.mjs
   ```
   Then open http://localhost:4600.
4. **Open Settings.** Add your name, your Gemini key, and optionally your Open Cloud key. Turn on Blender if you use it. Press **Check again** under Connections.
5. **Go to Home and tell the Lead your idea**, for example: *"Make me a rooftop delivery game with quick rounds and upgrades that keep players coming back."* Or press **Ask Pulse for pitches** and pick one.

Leave Studio and the app running. Check in from your phone: in Settings, turn on **Open on my phone too**, restart the app, and open the private link it shows. Or use Claude Code's Remote Control.

## Permissions

In **Settings → Permissions**:

- **Safe auto** (default) — agents may edit files in this folder, use the RoCrew CLI, web search, and your MCP servers (Studio, Blender) without asking. Anything else is refused.
- **Auto** — Claude Code's auto mode. Its safety check approves routine actions and blocks risky ones, on top of the safe list. It needs a Claude Code version and plan that offer auto mode.
- **Autopilot** — every tool is allowed, including any shell command. It's the fastest way to run unattended, so only use it on a machine and project you're happy for the agents to change.

If an agent says a tool was refused, either switch modes or add that tool under **Extra allowed tools** (for example `Bash(python *)`).

Agents never publish your game. Publishing, prices and Creator Hub products always come to you.

## Using it without the app

This folder is also a normal Claude Code project. Run `claude` here and you're talking to the Lead. The specialists are available as Claude Code subagents (`.claude/agents/`), and the vault is in `vault/`. The app adds the queue, the Studio lock, the Review and Needs you screens, and the wake-ups that keep the crew going.

## The CLI the agents use

```
node studio/cli.mjs status
node studio/cli.mjs task add --agent builder --title "Wire the delivery loop" --brief "…" --game rooftop-deliveries
node studio/cli.mjs ask --title "Create 3 game passes on the Creator Hub" --body "…"
node studio/cli.mjs review --file shot.png --question "Is this shop ready?"
node studio/cli.mjs image --prompt "…" --out games/x/art/icon.png --aspect 1:1 --review "Which icon?"
node studio/cli.mjs market --refresh
node studio/cli.mjs help
```

## Files

```
CLAUDE.md               crew rules every agent follows
.claude/agents/         the 15 roles
vault/                  the knowledge vault (Obsidian-compatible)
games/<slug>/           each game's plan, economy, reports and art
studio/server.mjs       the app (no dependencies)
studio/cli.mjs          the crew's CLI
.rocrew/                your settings, keys and state (git-ignored)
```

## Good to know

- **Roblox Studio tools.** Roblox decides which tools its MCP server offers, so what the agents can do in Studio (run code, playtest, read output, screenshots) depends on your Studio version.
- **Market data** comes from Roblox's public web endpoints, which aren't an official API and can change. If a refresh fails, the error shows on the Market page, and Pulse can still research with web search.
- **Costs.** The crew uses your Claude Code plan's usage. Gemini and Open Cloud use your own keys. "Agents at once" and "Rounds on their own" in Settings control how fast usage goes.
- **Tests.** `npm test` runs the scheduler, the CLI and the server against a stand-in for Claude Code. It needs no accounts.
