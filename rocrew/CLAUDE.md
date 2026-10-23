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
- **Players never lose progress.** Player data uses session-locked saves (ProfileStore, or UpdateAsync with a session lock), loaded with retries and never overwritten with defaults after a failed load. Save on every purchase and big reward straight away, autosave every 60 s, save on PlayerRemoving, and in `game:BindToClose` save everyone in parallel before the server shuts down. Version the schema and keep a backup key. If the server or the game crashes, a player loses at most the last minute, and never anything they paid for.
- **Keep it fast on a cheap phone.** Aim for 60 FPS on mobile: StreamingEnabled for big maps, anchored static parts, few unions and meshes with sensible CollisionFidelity, no per-frame loops on the server, events instead of polling, pooled effects, and UI updates only when values change. Check with the MicroProfiler and Developer Console before handing off.
- **UI feels rewarding.** Every button has a quick press tween and sound, windows pop in (scale 0.9 → 1, 0.15 s, Back easing), currency counts up, rewards fly to the counter, and big wins get a burst and a shake. Keep motion under 0.3 s and never block input.
- **Every game has the growth prompts, done politely:**
  - **Favorite prompt** (`AvatarEditorService:PromptSetFavorite`) once the player has clearly enjoyed it (around 5-10 minutes in, or right after a big win), never in the first minute, and at most once per session; skip it if they already favorited.
  - **Join the group** (`GroupService:PromptJoinAsync`) with a **group reward**, only in games where it fits naturally: games with currency, boosts or collectibles (simulator, tycoon, idle, RNG/collection, obby with coins, survival meta-currency). The reward is part of the game, e.g. +10% coins, a group-only pet or trail, a chat tag, or a "Group Chest" in the world players can open when in the group. Skip it in story, horror and competitive games, where a perk would feel out of place or unfair. **Never ask the owner for a group id:** read it at runtime: `if game.CreatorType == Enum.CreatorType.Group then GROUP_ID = game.CreatorId end`. If the game is owned by a user, there's no group, so the group features hide themselves (Config can still override the id). Check membership on the server with `player:IsInGroup(GROUP_ID)` on join and when they press "Claim". Put it where it fits the game: a tab inside the existing **Rewards** window (next to daily rewards and codes), or something **physical in the world** like a glowing Group Chest by spawn that shows "Join the group to open" when touched. Never its own new HUD button; one reminder after the first upgrade, never a pop-up on join.
  - **Like/notify reminders** as a small, dismissible HUD hint ("Like the game for a free reward!") with the reward given through a "Claim" button the player presses, never pretending to detect a like.
  - **Invite friends** (`SocialService:PromptGameInvite`) with a friend-join bonus, and **Notify me** about updates (experience notifications) once they've played a few sessions.
  - Every prompt is skippable, never blocks play, never repeats within a session, and works on phone, PC and console. The group id, rewards and timings live in `Config`.
- **Gifting, where the game sells passes or items:** a "Gift" button next to each pass or bundle in the shop. The gifter picks a player in the server (or a friend), buys a matching "Gift: <item>" developer product, and the server grants the item to the recipient in `ProcessReceipt`, idempotently. Gifts to offline players wait in a saved "pending gifts" list and are delivered with a toast on their next join. Never gift to yourself, never refund gifts on failure without a record, and log every gift.
- **The game must never look AI-made, icons included.** Every UI icon (currencies, buttons, pets, items, passes, products, badges) comes from one consistent set: made with `store-art pass` from real Studio captures of the item, or drawn as simple, clean shapes in one style (same outline weight, corner radius, palette and light direction). No emoji, no default Roblox placeholder images, no mixed styles, no blurry upscales. Text in UI uses the game's chosen fonts, never text baked into images. Frame reviews the whole icon set side by side before shipping.
- **The HUD stays clean.** At most about 4 buttons at the screen edge plus the currencies and the current goal; everything else (group rewards, codes, daily rewards, invites, settings) lives inside one Rewards or Menu window, or as something physical in the world. A new feature gets a tab, not a new button. Red notification dots only when there's really something to claim.
- **Notifications (toasts) follow one house style:** short white text (with an optional icon) on a soft, semi-transparent black pill behind it (a "scrim": BackgroundColor3 black, BackgroundTransparency about 0.45, UICorner, a faint UIStroke, padding so it hugs the text). They stack near the top-center (or above the bottom HUD), **at most 3 visible**: a new one slides in at the bottom of the stack and pushes the others up; the oldest fades out when a 4th arrives. **The same message again doesn't stack**: the existing toast shows a counter, "Coins collected (x2)", "(x3)", with a little pop, and its timer restarts. Each toast fades in over 0.15 s, stays about 3 s, then fades out (text and scrim together) over 0.3 s. One `Notify` module on the client does all of this, and the server sends notifications through one remote. Frame builds the toast template in StarterGui.
- **Animations, cutscenes and VFX are real assets too.** Animations are saved Animation assets (or KeyframeSequences kept in `ServerStorage.Assets.Animations`) made with Studio's Animation Editor, Blender or the Toolbox. Cutscene camera paths are marked with named parts or attachments in `Workspace.Cutscenes` and played by one small script. Particles, beams, trails and highlights are templates in `ReplicatedStorage.Assets.VFX` that scripts clone. The owner must be able to open, tweak and preview every one in Studio. Every cutscene can be skipped, and effects stay light on phones. How to make them feel great (anticipation and follow-through, hit-stop, reward fly-ups, cutscene timing): [[18 Animation, Cutscenes and VFX]].
- **Visual quality pass before every hand-off of world or UI work:** no z-fighting (two coplanar faces flickering: offset one by 0.01-0.05 studs or merge them), no parts floating or sunk into the ground, no gaps or seams you can see through, no stretched or misaligned textures, no clipping through walls, no player-reachable holes under the map (add invisible kill/catch floors and boundaries), consistent scale (doors ≥ 7 studs tall, characters fit through every path), lighting with no pitch-black or blown-out spots, and UI with no overlapping or cut-off elements on the smallest phone and on console. Screenshots can't reliably show z-fighting (it flickers), so **run the map audit**: paste `studio/luau/MapAudit.lua` into the Studio run-code tool (or the command bar). It finds z-fighting pairs, floating parts and holes by geometry and prints exact part paths. Fix every z-fighting pair and hole, check each floating part (mark intended ones with the attribute `Floating = true`), and run it again until the counts are zero. Then fly the camera through every area at a low, grazing angle and screenshot anything you fixed.
- **Test multiplayer even when you're alone.** For trading, combat, co-op or anything with 2+ players, use Studio's multi-player test server (Start with 2-3 players) when the tools allow it. Otherwise spawn temporary **test bots**: an R15 dummy model with a Humanoid, named `TestBot_1`…, driven by a server script that walks, attacks, trades or calls the same server functions a real player's remotes would. Keep bots and their scripts in a `Workspace.__TestBots` folder (or create them from the command bar), and **delete them before you hand off**; they must never ship in the game.
- **Use everything Studio offers to check your work:** playtests (Play, Play Here, Run, and multi-player Start Server with 2+ players for trading or combat), the Device Emulator (small phone, tablet, PC and console/TV with the controller emulator), the Output window and Developer Console, the MicroProfiler and the Script Performance window. Use whichever of these the Studio MCP tools expose; when one isn't available, say so in your handoff instead of claiming it was tested.
- **Free models and Blender are helpers, not the plan.** You may use the Creator Store (Toolbox) for models, effects and sounds, and Blender (when it's connected) for custom models, VFX meshes and renders, but every system must work without them: build it in Studio first, and if the Toolbox or Blender fails, carry on. **Treat every free model as possibly infected:** before using one, read every Script, LocalScript and ModuleScript inside it, and delete it if anything uses `require(<number>)`, `getfenv`/`setfenv`, `loadstring`, `HttpService`, `TeleportService`, `MarketplaceService` prompts, obfuscated or very long one-line code, or hides scripts in odd places (inside parts, under Lighting or as disabled scripts). Prefer models with no scripts at all, from verified creators, and strip scripts you don't need. Librarian records every asset's source in the Library.
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

When the owner has signed the crew in to Roblox (Settings → Roblox account), Liveops and Merchant tasks, and any task queued with `--browser yes`, get a browser signed in to the owner's account (the `roblox-browser` tools). Use it for the Creator Hub: analytics (retention, funnels, engagement, monetization), game passes and developer products, thumbnails. Read pages as text snapshots rather than screenshots. Accept cookie banners yourself. Never spend or trade Robux, buy anything, change account or security settings, or message anyone. If Roblox asks to sign in again or for a code, ask the owner. You may accept Roblox's terms for creator features when a page requires it.
When creating game passes or developer products, turn on **regional pricing** wherever Roblox offers it, and upload an icon made with `store-art pass`. When setting up a place, set the max server size from `plan.md` and allow every device (phone, PC, console, tablet) to join. **Never change the experience's genre** setting; leave that to the owner.

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
