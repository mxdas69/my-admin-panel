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

- **Home** — a setup checklist on first run, what needs you, who's working, and a box to ask the Lead anything.
- **Lead** — chat with the Lead. Say what you want; it plans and assigns the work.
- **Team** — every agent's own chat. Message any of them directly.
- **Tasks** — everything queued, running and finished, with what came back.
- **Review** — screenshots, renders and icons the agents want your opinion on. Approve, ask for changes (with a note), or reject; the agent picks up your verdict.
- **Games** — each game's open work, pipeline, files (plan, economy, reports, art) and live Roblox numbers.
- **Pitches** — game ideas Pulse found in the charts. Nothing gets built until you approve one.
- **Library** — models, icons and sounds with their Roblox ids, plus reusable game systems.
- **Vault** — the knowledge the agents study before they build (also an Obsidian vault).
- **Market** — ideas first: genres where young games are winning, breakouts, every Roblox chart, and a deep dive on any game (players over 14 days, pass prices, badges, similar games).
- **Settings** — Claude Code, Studio, Blender, Gemini and Open Cloud connections, Roblox sign-in, Remote Control, which model each agent uses, your usage limit, friends, and how much the crew may do alone.

How the automation works:

1. Each agent runs as its **own Claude Code conversation** (`claude -p --agent <role>`, resumed between tasks), so it keeps its role and remembers its earlier work. **Start fresh** on an agent's page clears that memory.
2. Agents queue work for each other with a small CLI (`node studio/cli.mjs task add …`). Each agent takes one task at a time, and several agents work in parallel.
3. **Only one agent changes Studio at a time.** The app holds a Studio lock, shown as "Builder has Studio".
4. When the crew goes quiet, the app wakes the Lead with everyone's handoffs. It plans the next round, so work keeps moving while you sleep, up to a limit you set.
5. Anything only you can do (publish, set prices, create game passes on the Creator Hub) lands in **Needs you**.

## It's an app

Double-click **Start RoCrew.vbs**. RoCrew runs with no extra windows and puts an icon in the **system tray** (bottom right, by the clock): double-click it to open RoCrew, right-click → **Quit RoCrew** to close everything. Close or minimize the RoCrew window and alt-tab freely; the crew keeps working in the tray. Closing the window with the X only hides it: the crew keeps going, and the tray icon brings it back. Nothing shows a black window; if you ever need a log to send me, use `Start RoCrew (with log window).bat`. RoCrew opens in its own window (Edge or Chrome app mode, no browser tabs or address bar), which you can minimize like any app; the crew keeps working. You can also pin it: in that window's menu choose **Install RoCrew** to get a Start-menu and taskbar icon. The first time, a short setup walks you through your name, Claude Code, Roblox Studio, how much of your plan to use, optional extras (Roblox sign-in, Gemini key, pairing with a friend) and your first idea.

## Test requests you can do from your phone

When an agent needs you to try something, it doesn't send a wall of text. You get a **Try it** card on Home with:

- 2 to 6 short steps, each with a screenshot from Studio (they play like a slideshow, highlighting the step you're on), or a short clip the agent made from them;
- checkboxes to tick off steps as you go;
- **It works** or **Something's wrong**, plus **Photo / video** to attach a screenshot or screen recording from your phone's camera roll.

Your answer and anything you attach go back to the Lead, who routes the fix and sends you a fresh test when it's done. Videos you upload also reach the agents as a frame sheet so they can see what happened.

## Store art that gets clicked

Splash poses your real characters in Studio, captures the shot, and runs one command (`store-art`) that has Gemini finish the capture in four variants, sets the title text with a real font (so it's never misspelled), sizes everything for Roblox, scores each one at phone size for "would a kid tap this?" and "does it look hand-made?", and sends you the set in Review. You pick; then Roblox's thumbnail test picks the winner. Because the look comes from your actual game, it doesn't have the AI look players dislike, and it costs Claude almost nothing.

## Saving your Claude plan's usage

Every agent run counts toward your Claude plan (Max included), so RoCrew spends Opus where it changes the result and lighter models elsewhere. Pick a preset in **Settings → Models and usage**:

| Preset | Opus | Sonnet | Haiku |
|---|---|---|---|
| **Balanced** (default) | Lead, Architect, Builder, Frame, Reviewer, Merchant | Pulse, Librarian, Scenic, Playtest, Kid Tester, Balance, Splash, Liveops, Producer | |
| **Best quality** | everyone | | |
| **Save usage** | Lead, Builder | Pulse, Architect, Librarian, Frame, Scenic, Balance, Splash, Reviewer, Merchant | Playtest, Kid Tester, Liveops, Producer |
| **Pick per agent** | you choose | | |

The vault is huge (over a million characters), but agents never load whole pages: they read a page's **card** (its rules as one-liners plus its checklist, about a tenth of the page) and pull only the sections a task needs. Reading whole vault pages is blocked for crew runs.

On top of that, the Lead marks quick, mechanical tasks `small` (one model lighter, low effort) and hard ones `big` (Opus, extra thinking). If Opus is busy, a run falls back to Sonnet instead of failing.

The sidebar shows your 5-hour and weekly usage as Claude Code reports it. When either passes **Stop new work at** (90% by default), agents wait until it resets and pick up on their own; messages you send the Lead still go through. If a run hits the limit anyway, its task goes back in the queue instead of failing.

## Updating

RoCrew checks for a new version every few hours. When one is ready, the sidebar shows **Update ready → Update now**: it downloads the new version, replaces only the program files and restarts. Your settings, keys, sign-ins, tasks and games are never touched. You can also press **Check for updates** in the sidebar.

## Remote Control (mxdas and Othman)

Each of you runs RoCrew on your own PC. Pair once, then either of you can share your studio live with the other.

1. **Pair (once).** One of you opens **Settings → Remote Control** and presses **Make a pair code**. The other pastes that code in the same place and presses **Pair**. Each app now shows the other's name.
2. **Share.** Whoever wants to share turns on **Share my studio live**. The first time, press **Install it** for Cloudflare's free tunnel helper (about 40 MB).
3. **Join.** The other person's RoCrew pops up "*name* wants you in their studio". **Join now** takes them straight to the host's Lead chat. They see everything live and can do everything except change Settings, while it all runs on the host's PC (and the host's Claude plan).
4. **Send it again** by turning the switch off and on. **Turning it off** disconnects them at once.
5. **To leave**, press **Leave** in the bar at the top, or close the tab and open RoCrew again.

Requests are encrypted with your pair code and pass through a free public relay (ntfy.sh), so only your two apps can read them. Each share uses a fresh one-time key that dies when sharing is turned off.

## Signing the crew in to Roblox

**Settings → Roblox account → Sign in to Roblox** opens Edge or Chrome on this PC with a separate RoCrew profile. Sign in there (with your 2-step code if asked) and close the window. It stays signed in.

After that, Liveops and Merchant can read your game's retention, funnels and money on the Creator Hub, and set up game passes and products for you. The browser runs hidden with the sound off; turn on **Show the browser while agents use it** to watch and take over. The sign-in stays in `.rocrew/browser` on your PC and is never sent anywhere; agents can't open those files, and they're told never to spend or trade Robux or change account settings.

## Never losing work

- Saves are written safely with a backup copy, so a crash or power cut loses at most a second.
- If the app stops mid-task, the task picks up where it stopped when RoCrew starts again (it resumes the same Claude conversation).
- RoCrew restarts by itself (from the tray) if it ever stops unexpectedly. Turn on **Settings → Start RoCrew when I turn on my PC** so it comes back after a restart.
- Use **Team Create** in Roblox Studio so every change in the place is saved to Roblox's cloud straight away.

## Making games with a friend

There are two ways to do it.

**1. One studio, both of you in it (simplest).** One of you hosts: RoCrew and Roblox Studio run on their computer, and the crew uses their Claude plan.

1. The host opens **Settings → Friends**, types the friend's name and presses **Invite**.
2. The friend opens their private link:
   - **Same Wi-Fi:** turn on **Open on my phone too**, save and restart. The link appears under the friend's name.
   - **Different houses:** both install [Tailscale](https://tailscale.com/download) and join the same tailnet (or the host shares their computer with the friend's Tailscale account). The Tailscale link appears under the friend's name.
   - **No installs for the friend:** the host runs `cloudflared tunnel --url http://localhost:4600`, then sends the `https://….trycloudflare.com` address it prints with `/?key=<their key>` on the end.
3. The friend can talk to the Lead and any agent, queue tasks, review work, test builds and approve pitches. Everything they do shows their name, and agents know who asked. Only the host can change Settings.
4. To build by hand together while the crew works, turn on **Team Create** for the place in Roblox Studio and add the friend as a collaborator.
5. Remove a friend in Settings and their link stops working at once.

**2. Two studios, one shared playbook.** Each of you runs your own RoCrew on your own computer and Claude plan, on different games (or different parts of one game, like the main game and a lobby place). Share this folder as a git repo: the vault, the agents and the crew rules stay the same for both, and each game's `games/<slug>/` files show what the other crew did. This doubles how much you can build, because each crew uses its own plan.

Anyone with a link can direct the crew and spend the host's plan, so only invite people you trust.

## Easiest install

1. Download the ZIP, extract it, open the `rocrew` folder.
2. Double-click **`Install RoCrew.bat`**. It installs Node.js if needed, then Claude Code and ffmpeg, and, only if you already have Blender, `uv` and the Blender MCP add-on. Nothing optional is forced, and Rojo isn't needed (agents work in Studio directly).
3. When it asks, sign in to Claude in the window that opens. Then RoCrew starts in your system tray and the setup wizard does the rest.

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
3. **Start the studio.** On Windows, double-click **`Start RoCrew.vbs`** (or `Start RoCrew.bat`; both run hidden in the tray). Anywhere else:
   ```
   node studio/server.mjs
   ```
   Then open http://localhost:4600.
4. **Open Settings.** Add your name, your Gemini key, and optionally your Open Cloud key. Turn on Blender if you use it. Press **Check again** under Connections.
5. **Go to Home and tell the Lead your idea**, for example: *"Make me a rooftop delivery game with quick rounds and upgrades that keep players coming back."* Or press **Ask Pulse for pitches** and pick one.

Leave Studio and the app running. Check in from your phone: in Settings, turn on **Open on my phone too**, restart the app, and open the private link it shows. Or use Claude Code's Remote Control.

Home shows a short checklist until the basics are done, so you always know the next step.

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
node studio/cli.mjs test --title "Try the shop" --steps "Open the game|Tap Shop|Buy the small pack" --media s1.png,s2.png,s3.png
node studio/cli.mjs clip --images s1.png,s2.png,s3.png --out games/x/media/how-to-test.mp4
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

## Planned

- An in-game **admin panel** template the crew can add to any game (server-checked by UserId: kick, ban, give items, spawn events, view live stats).

## Good to know

- **Roblox Studio tools.** Roblox decides which tools its MCP server offers, so what the agents can do in Studio (run code, playtest, read output, screenshots) depends on your Studio version.
- **Market data** comes from Roblox's public web endpoints, which aren't an official API and can change. If a refresh fails, the error shows on the Market page, and Pulse can still research with web search.
- **Costs.** The crew uses your Claude Code plan's usage. Gemini and Open Cloud use your own keys. The model preset, "Agents at once", "Rounds on their own" and "Stop new work at" in Settings control how fast usage goes.
- **Clips** need [ffmpeg](https://ffmpeg.org) on the computer. Without it, agents send the step screenshots as a slideshow instead.
- **Tests.** `npm test` runs the scheduler, the CLI and the server against a stand-in for Claude Code. It needs no accounts.
