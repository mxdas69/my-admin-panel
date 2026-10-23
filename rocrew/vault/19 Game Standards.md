---
tags: [vault, standards, quality]
for: [lead, architect, builder, frame, scenic, librarian, playtest, kid-tester, reviewer, merchant, liveops, producer]
also: [pulse, balance, splash]
---

# 19 Game Standards

The house rules every RoCrew game meets. They used to sit in `CLAUDE.md`, which every agent loads on every run; moving the detail here keeps each run cheaper while the rules stay the same. Read this card on your first task for a game, then the rules your task touches.

## Rules

1. **Build things as real objects, not with scripts.**
   Maps, buildings and props are Instances placed in `Workspace` in Studio. Menus and HUDs are real ScreenGuis in `StarterGui`, built in Studio so the owner can open and edit them by hand. Scripts add behavior; they don't build the world or the UI at runtime. The one exception is repeated items in a list (shop cards, inventory slots): design one template in Studio, keep it in `StarterGui` or `ReplicatedStorage`, and clone it.

2. **Assume every player could be a cheater.**
   The client can fire any remote with any values, so the server decides money, items, damage, stats, purchases and progress. Every RemoteEvent checks types, ranges, distance and a per-player rate limit, and never takes a price, amount or reward from the client. Read the card for [[17 Security and Anti-Cheat]] before writing any remote or save code.

3. **Every game works on phone, PC and console.**
   Every action has a touch button, a key and a gamepad button; every menu can be used with a controller (selection, B to close); text is readable on a TV. See [[16 Console and Controllers]] and [[08 Mobile]].

4. **Players never lose progress.**
   Player data uses session-locked saves (ProfileStore, or UpdateAsync with a session lock), loaded with retries and never overwritten with defaults after a failed load. Save on every purchase and big reward straight away, autosave every 60 s, save on PlayerRemoving, and in `game:BindToClose` save everyone in parallel before the server shuts down. Version the schema and keep a backup key. If the server or the game crashes, a player loses at most the last minute, and never anything they paid for.

5. **Keep it fast on a cheap phone.**
   Aim for 60 FPS on mobile: StreamingEnabled for big maps, anchored static parts, few unions and meshes with sensible CollisionFidelity, no per-frame loops on the server, events instead of polling, pooled effects, and UI updates only when values change. Check with the MicroProfiler and Developer Console before handing off.

6. **UI feels rewarding.**
   Every button has a quick press tween and sound, windows pop in (scale 0.9 → 1, 0.15 s, Back easing), currency counts up, rewards fly to the counter, and big wins get a burst and a shake. Keep motion under 0.3 s and never block input.

7. **Every game has the growth prompts, done politely.**
   - **Favorite prompt** (`AvatarEditorService:PromptSetFavorite`) once the player has clearly enjoyed it (around 5-10 minutes in, or right after a big win), never in the first minute, and at most once per session; skip it if they already favorited.
     - **Join the group** (`GroupService:PromptJoinAsync`) with a **group reward**, only in games where it fits naturally: games with currency, boosts or collectibles (simulator, tycoon, idle, RNG/collection, obby with coins, survival meta-currency). The reward is part of the game, e.g. +10% coins, a group-only pet or trail, a chat tag, or a "Group Chest" in the world players can open when in the group. Skip it in story, horror and competitive games, where a perk would feel out of place or unfair. **Never ask the owner for a group id:** read it at runtime: `if game.CreatorType == Enum.CreatorType.Group then GROUP_ID = game.CreatorId end`. If the game is owned by a user, there's no group, so the group features hide themselves (Config can still override the id). Check membership on the server with `player:IsInGroup(GROUP_ID)` on join and when they press "Claim". Put it where it fits the game: a tab inside the existing **Rewards** window (next to daily rewards and codes), or something **physical in the world** like a glowing Group Chest by spawn that shows "Join the group to open" when touched. Never its own new HUD button; one reminder after the first upgrade, never a pop-up on join.
     - **Like/notify reminders** as a small, dismissible HUD hint ("Like the game for a free reward!") with the reward given through a "Claim" button the player presses, never pretending to detect a like.
     - **Invite friends** (`SocialService:PromptGameInvite`) with a friend-join bonus, and **Notify me** about updates (experience notifications) once they've played a few sessions.
     - Every prompt is skippable, never blocks play, never repeats within a session, and works on phone, PC and console. The group id, rewards and timings live in `Config`.

8. **Gifting, where the game sells passes or items.**
   a "Gift" button next to each pass or bundle in the shop. The gifter picks a player in the server (or a friend), buys a matching "Gift: <item>" developer product, and the server grants the item to the recipient in `ProcessReceipt`, idempotently. Gifts to offline players wait in a saved "pending gifts" list and are delivered with a toast on their next join. Never gift to yourself, never refund gifts on failure without a record, and log every gift.

9. **The game must never look AI-made, icons included.**
   Every UI icon (currencies, buttons, pets, items, passes, products, badges) comes from one consistent set: rich, detailed, 3D-looking icons in the style of top Roblox games (a shop button is a glossy, detailed shopping basket or cart with depth, highlights and a soft shadow, not a flat outline), made with `store-art pass` from real Studio captures or a modelled prop, all sharing one style (same outline weight, palette, light direction and level of detail). No flat clip-art or plain line icons. No emoji, no default Roblox placeholder images, no mixed styles, no blurry upscales. Text in UI uses the game's chosen fonts, never text baked into images. Frame reviews the whole icon set side by side before shipping.

10. **Tutorials teach by doing, not reading.**
   Each step is one action with at most about 6 words on screen ("Collect the gems!"), shown on the current goal bar, and the game waits for the player to do it. Point at the target with a glowing 3D arrow or beam path on the ground leading to it, a bouncing arrow above it, and a pulsing ring or highlight on the right button (with a tapping-hand animation on touch, a button glyph on console). The step completes the moment they do the thing, with a small reward pop and sound. Keep it to 3-6 steps over the first couple of minutes, never a wall of text or a stack of pop-ups, a Skip for returning players, and saved progress so it never repeats. See the guidance kit in [[01 The First Five Minutes]].

11. **The HUD stays clean.**
   At most about 4 buttons at the screen edge plus the currencies and the current goal; everything else (group rewards, codes, daily rewards, invites, settings) lives inside one Rewards or Menu window, or as something physical in the world. A new feature gets a tab, not a new button. Red notification dots only when there's really something to claim.

12. **Notifications (toasts) follow one house style.**
   short white text (with an optional icon) on a soft, semi-transparent black pill behind it (a "scrim": BackgroundColor3 black, BackgroundTransparency about 0.45, UICorner, a faint UIStroke, padding so it hugs the text). They stack near the top-center (or above the bottom HUD), **at most 3 visible**: a new one slides in at the bottom of the stack and pushes the others up; the oldest fades out when a 4th arrives. **The same message again doesn't stack**: the existing toast shows a counter, "Coins collected (x2)", "(x3)", with a little pop, and its timer restarts. Each toast fades in over 0.15 s, stays about 3 s, then fades out (text and scrim together) over 0.3 s. One `Notify` module on the client does all of this, and the server sends notifications through one remote. Frame builds the toast template in StarterGui.

13. **Animations, cutscenes and VFX are real assets too.**
   Animations are saved Animation assets (or KeyframeSequences kept in `ServerStorage.Assets.Animations`) made with Studio's Animation Editor, Blender or the Toolbox. Cutscene camera paths are marked with named parts or attachments in `Workspace.Cutscenes` and played by one small script. Particles, beams, trails and highlights are templates in `ReplicatedStorage.Assets.VFX` that scripts clone. The owner must be able to open, tweak and preview every one in Studio. Every cutscene can be skipped, and effects stay light on phones. How to make them feel great (anticipation and follow-through, hit-stop, reward fly-ups, cutscene timing): [[18 Animation, Cutscenes and VFX]].

14. **Visual quality pass before every hand-off of world or UI work.**
   no z-fighting (two coplanar faces flickering: offset one by 0.01-0.05 studs or merge them), no parts floating or sunk into the ground, no gaps or seams you can see through, no stretched or misaligned textures, no clipping through walls, no player-reachable holes under the map (add invisible kill/catch floors and boundaries), consistent scale (doors ≥ 7 studs tall, characters fit through every path), lighting with no pitch-black or blown-out spots, and UI with no overlapping or cut-off elements on the smallest phone and on console. Screenshots can't reliably show z-fighting (it flickers), so **run the map audit**: paste `studio/luau/MapAudit.lua` into the Studio run-code tool (or the command bar). It finds z-fighting pairs, floating parts and holes by geometry and prints exact part paths. Fix every z-fighting pair and hole, check each floating part (mark intended ones with the attribute `Floating = true`), and run it again until the counts are zero. Then fly the camera through every area at a low, grazing angle and screenshot anything you fixed.

15. **Test multiplayer even when you're alone.**
   For trading, combat, co-op or anything with 2+ players, use Studio's multi-player test server (Start with 2-3 players) when the tools allow it. Otherwise spawn temporary **test bots**: an R15 dummy model with a Humanoid, named `TestBot_1`…, driven by a server script that walks, attacks, trades or calls the same server functions a real player's remotes would. Keep bots and their scripts in a `Workspace.__TestBots` folder (or create them from the command bar), and **delete them before you hand off**; they must never ship in the game.

16. **Use everything Studio offers to check your work.**
   playtests (Play, Play Here, Run, and multi-player Start Server with 2+ players for trading or combat), the Device Emulator (small phone, tablet, PC and console/TV with the controller emulator), the Output window and Developer Console, the MicroProfiler and the Script Performance window. Use whichever of these the Studio MCP tools expose; when one isn't available, say so in your handoff instead of claiming it was tested.

17. **Free models and Blender are helpers, not the plan.**
   You may use the Creator Store (Toolbox) for models, effects and sounds, and Blender (when it's connected) for custom models, VFX meshes and renders, but every system must work without them: build it in Studio first, and if the Toolbox or Blender fails, carry on. **Treat every free model as possibly infected:** before using one, read every Script, LocalScript and ModuleScript inside it, and delete it if anything uses `require(<number>)`, `getfenv`/`setfenv`, `loadstring`, `HttpService`, `TeleportService`, `MarketplaceService` prompts, obfuscated or very long one-line code, or hides scripts in odd places (inside parts, under Lighting or as disabled scripts). Prefer models with no scripts at all, from verified creators, and strip scripts you don't need. Librarian records every asset's source in the Library.

## Checklist

- [ ] Every rule above that applies to this game is met, or `games/<slug>/decisions.md` says why not
