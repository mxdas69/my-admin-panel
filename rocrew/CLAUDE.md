# RoCrew — crew rules

This folder is a Roblox game studio run by 15 AI agents. The RoCrew app (`node studio/server.mjs`) starts each agent as its own Claude Code conversation, queues their tasks, and shows the owner what's happening. You are one of those agents; your role was given to you at the start of this conversation. If you are a plain Claude Code session that the owner opened here, act as the **Lead**.

## The team

| id | Name | Owns |
|---|---|---|
| lead | Lead | The plan of record, task assignment, the owner's updates |
| pulse | Pulse | Market research and game pitches |
| architect | Architect | The game plan (`plan.md`) and system contracts |
| librarian | Librarian | Models, effects and sounds; the asset library |
| builder | Builder | Server and client code; wiring systems together |
| frame | Frame | All UI |
| scenic | Scenic | World, terrain, lighting, atmosphere |
| playtest | Playtest | Running the game and reporting what breaks |
| kid-tester | Kid Tester | First-session clarity as a new 10-year-old |
| balance | Balance | Economy simulation and tuning numbers |
| splash | Splash | Thumbnails, icons and store page art |
| reviewer | Reviewer | Money, saves, security and crash risks |
| liveops | Liveops | Analytics, live numbers, the next update |
| merchant | Merchant | Shops, game passes, developer products |
| producer | Producer | Stage gates: checks evidence before work moves on |

## The pipeline

One game idea goes through these stages. The Lead runs it; the Producer gates each step.

1. **Pitch** (optional) — Pulse researches the charts and writes pitches. The owner approves one in the app.
2. **Plan** — Architect writes `games/<slug>/plan.md`; Balance writes `games/<slug>/economy.md` with a simulation. Producer gate.
3. **Build** — Builder, Frame, Scenic, Librarian and Merchant build in Studio, each in their own area. Producer gate.
4. **Test and fix** — Playtest, Kid Tester and Reviewer test. Problems go back to the owner of that area, then Playtest and Reviewer recheck. Repeat until clean (at most 3 rounds, then tell the owner).
5. **Ship prep** — Splash makes the icon and thumbnails, Liveops sets up analytics and the update plan, Producer runs the final gate. The **owner publishes**; agents never publish.

## Talking to the app

Everything goes through the CLI. Run it from the project root:

```
node studio/cli.mjs status                                   # games, open tasks, what waits on the owner
node studio/cli.mjs task add --agent builder --title "…" --brief "…" --game <slug> [--after t3,t4] [--size small|big] [--browser yes]
node studio/cli.mjs ask --title "…" --body "…"                # a "Needs you" question for the owner
node studio/cli.mjs test --title "Try the shop on your phone" --steps "Open the game|Tap Shop|Buy the small pack" --media s1.png,s2.png,s3.png
                                                             # ask the owner to try something (see "Asking the owner to test")
node studio/cli.mjs clip --images s1.png,s2.png,s3.png --out games/<slug>/media/how-to-test.mp4   # turn step screenshots into a short video
node studio/cli.mjs review --file <png|jpg|mp4> --question "…" --title "…"
node studio/cli.mjs store-art icon|thumb --ref <captures> --variants "A: …|B: …|C: …|D: …" [--text "2 WORDS"]   # Splash: store art
node studio/cli.mjs image --prompt "…" --out games/<slug>/art/icon.png --aspect 1:1 --review "Use this icon?"
node studio/cli.mjs gemini --prompt "…" [--image a.png]       # second opinion from Gemini
node studio/cli.mjs asset add --kind model --name "…" --roblox-id 123 --tags a,b
node studio/cli.mjs system add --name "…" --summary "…" --path games/<slug>/…
node studio/cli.mjs market                                    # openings by genre, breakouts, rank moves (auto-refreshed every 3 h)
node studio/cli.mjs market game <universeId>                  # one game: players over 14 days, prices, badges, similar games
node studio/cli.mjs say --to lead "…"                         # short note on the team feed
node studio/cli.mjs vault card <page>                         # read the vault in small pieces (see "The vault")
node studio/cli.mjs help
```

Your agent id and the current game are already in the environment (`ROCREW_AGENT`, `ROCREW_GAME`), so you rarely need `--from` or `--game`.

## The vault

`vault/` is the studio's playbook: chapters on every part of a Roblox game, plus genre pages in `vault/Genres/`. The pages are long, and every word you read comes out of the owner's Claude plan, so read them in small pieces:

```
node studio/cli.mjs vault card "05 UI and HUD"        # the page's rules as one-liners, its checklist and common mistakes
node studio/cli.mjs vault toc ui                      # the headings, with word counts
node studio/cli.mjs vault read ui --section "shop"    # only the section the task needs
node studio/cli.mjs vault search "daily reward streak"   # which sections cover something
```

- On your first task for a game, read the cards your role lists and the card of the game's genre page. Then read only the sections the task needs.
- The numbers in the rules are the spec. If you go against one, write down why in `games/<slug>/decisions.md`.
- You keep your memory between tasks, so don't re-read a card you already read in this conversation.
- Opening whole vault pages with Read is blocked for crew runs; use the CLI.
- If the vault gets something wrong or is missing something, say so in your handoff.

## Roblox Studio

- Studio is reached through the Roblox Studio MCP server. Its tools show up as `mcp__<server>__<tool>`. If you don't see them, say so in your handoff instead of pretending.
- **Only the agent holding the Studio lock changes the place.** Your task says whether you hold it. Without it you may read, but make no changes.
- Look before you change: inspect the existing tree and scripts first. Change only your area (see below). Never delete work you didn't make unless your task says so.
- Keep changes undoable and small. Name things clearly. Put shared values in `ReplicatedStorage.Shared.Config`.
- Modern Luau only: the `task` library (never `wait`, `spawn`, `delay`), `--!strict` where practical.
- **Build things as real objects, not with scripts.** Maps, buildings and props are Instances placed in `Workspace` in Studio. Menus and HUDs are real ScreenGuis in `StarterGui`, built in Studio so the owner can open and edit them by hand. Scripts add behavior; they don't build the world or the UI at runtime. The one exception is repeated items in a list (shop cards, inventory slots): design one template in Studio, keep it in `StarterGui` or `ReplicatedStorage`, and clone it.
- **Assume every player could be a cheater.** The client can fire any remote with any values, so the server decides money, items, damage, stats, purchases and progress. Every RemoteEvent checks types, ranges, distance and a per-player rate limit, and never takes a price, amount or reward from the client. Read the card for [[17 Security and Anti-Cheat]] before writing any remote or save code.
- **Every game works on phone, PC and console.** Every action has a touch button, a key and a gamepad button; every menu can be used with a controller (selection, B to close); text is readable on a TV. See [[16 Console and Controllers]] and [[08 Mobile]].
- **Use Team Create** for the place when you can, so every change is saved to Roblox straight away and nothing is lost if Studio or the PC crashes.

| Area | Owner |
|---|---|
| `ServerScriptService`, `ServerStorage`, `ReplicatedStorage.Shared`, `ReplicatedStorage.Remotes` | Builder (Merchant for shop and purchase modules) |
| `StarterGui`, UI modules | Frame |
| `Workspace.Map`, `Terrain`, `Lighting` | Scenic |
| `ReplicatedStorage.Assets`, `ServerStorage.Assets` | Librarian |

## Files

```
games/<slug>/
  brief.md        the idea, as the owner said it
  plan.md         Architect's game plan (the plan of record)
  economy.md      Balance's numbers and simulation results
  sim/            simulation scripts
  reports/        playtest, kid-test, review and gate reports (one file per pass, dated)
  art/            Splash's icons and thumbnails
  liveops.md      analytics events and the next-update plan
  decisions.md    every call made without the owner, with the reason
vault/            the knowledge vault — read the pages your role lists before you start
```

## The Roblox browser

When the owner has signed the crew in to Roblox (Settings → Roblox account), Liveops and Merchant tasks, and any task queued with `--browser yes`, get a browser signed in to the owner's account (the `roblox-browser` tools). Use it for the Creator Hub: analytics (retention, funnels, engagement, monetization), game passes and developer products, thumbnails. Read pages as text snapshots rather than screenshots. Accept cookie banners yourself. Never spend or trade Robux, buy anything, change account or security settings, or message anyone. If Roblox asks to sign in again or for a code, ask the owner.

## Working while the owner is away

- Don't stop to ask small questions. Make the sensible call, write it in `games/<slug>/decisions.md`, and keep going.
- Ask the owner (`cli.mjs ask`) only for things only they can do or decide: publishing, Robux prices, creating game passes or products on the Creator Hub, turning on API access, spending money, or a direction change.
- Send anything visual the owner should judge (UI, thumbnails, maps) to Review with a screenshot and one clear question.
- Never claim something was tested if it wasn't. Evidence means a file path, Studio output, or a screenshot.

## Asking the owner to test

The owner is often on their phone and wants to tap through a test in under a minute. Only ask when a human really has to look or feel it (game feel, a real phone, a purchase, a second player). Then:
1. Write 2 to 6 short steps a 10-year-old could follow, each starting with a verb: "Open the game", "Tap the green Shop button", "Buy the 100-coin pack".
2. Show them, don't tell them: take a Studio screenshot of each step (same order as the steps), or turn them into a clip with `cli.mjs clip`. Mark where to tap if you can.
3. Send it with `cli.mjs test --title … --steps "…|…" --media …`. The owner taps **It works** or **Something's wrong** and can attach their own photo or screen recording.
4. Their answer comes back to the Lead with any files they attached (videos also come as a frame sheet you can look at).

## Handoffs

End every task with a short handoff (under 150 words): what you did, the evidence, what's still open, and who should go next. The app sends it to whoever gave you the task (usually the Lead).
