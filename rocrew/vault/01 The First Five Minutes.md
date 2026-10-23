---
tags: [vault, onboarding, ftue, tutorial, guidance, analytics]
for: [lead, architect, builder, frame, scenic, kid-tester, playtest, producer]
also: [pulse, librarian, balance, liveops, merchant, splash, reviewer]
---

# 01 The First Five Minutes

This chapter is the playbook for the first five minutes of a Roblox game: everything from the moment a player taps Play to the moment they are playing freely with a goal they care about. It covers the loading screen, the spawn, a second-by-second opening script, the hook beat that sells the fantasy, the guaranteed first wins, teaching the core loop in 5-8 single-action steps, the pointer and guidance kit (spotlight dim with a pulsing ring and tapping hand, world arrows, chevron paths, off-screen edge arrows), the onboarding funnel in Roblox analytics, and how all of this changes for each genre.

Roblox describes the first-time user experience as the first few minutes of play and measures it mainly through Day 1 retention and the experience's onboarding goals [1]. Its own guidance asks creators to teach the essentials, get players to the fun quickly and leave them wanting more [1]. Mobile studios that benchmark first-time experiences report the same pattern: the openings that work get the player playing as quickly as possible [23]. A player who leaves in minute one never sees the economy, the pets, the update or the shop, so no later chapter can rescue a weak opening. The analytics overview names D1 retention and session time as the first metrics to look at [6], and both are decided here.

Roblox's own game-design guides [19] treat onboarding as its own discipline, and so does this studio. Read this chapter when you plan a new game (Architect writes the opening script into `plan.md` before anything is built), when you build or change the spawn area (Scenic), the HUD and tutorial UI (Frame), or the tutorial controller and funnel (Builder), and before every playtest (Playtest and Kid Tester time each step against the targets below). Rebuild the opening whenever [[02 The Core Loop]] changes, because the opening is the core loop taught slowly.

All timings in this chapter are this studio's design targets, tuned with playtests and the onboarding funnel. They are not measurements of other games. Where a rule comes from a source, the source is cited; where it is a rule of thumb from experience, it says so.

## Rules

### Arrival: from Play to control

1. **The player has control within 1 s of the character appearing, and nothing modal covers the screen for the first 60 s.**
   Why: the first thing a new player does is try to move. If a menu, update log, daily reward, "Play" button or offer sits on top, the first input fails and the game reads as slow or broken. Roblox's onboarding guidance stresses getting to the fun quickly [1], and a DevForum developer investigating 30-second quits had a commenter report feeling overwhelmed by the GUI on joining [20].
   How: in Studio, keep every ScreenGui except the HUD `Enabled = false` on first join. Daily rewards, update logs, codes and the shop open only from a button press or after the first upgrade (Rule 35). Never set `CameraType = Scriptable` at spawn for more than 3 s (Rule 27). Check with a fresh test account in a published build, because Studio data can hide first-join behavior.
   Done right: the character lands, the camera is behind it, a gold beam runs to a glowing crystal 15 studs ahead, and the thumb is already moving.
   Done wrong: a full-screen "Welcome! Read the rules" panel with a close button in the corner.

2. **A custom loading screen is optional; if used it shows for at least 1.5 s, offers Skip at 3 s and auto-dismisses by 8 s.**
   Why: Roblox already shows its own loading screen while the place downloads. A custom one exists to brand the moment and hide geometry popping in, not to add waiting. ContentProvider guidance suggests letting players skip a loading screen or auto-skipping it after a set time [9].
   How: build it in a LocalScript in ReplicatedFirst and call `ReplicatedFirst:RemoveDefaultLoadingScreen()` [8]. If anything is in ReplicatedFirst, the default screen is removed after about 5 s even if you never call the function [8], so a half-built custom screen shows the world loading. Keep the full spec in "Loading screen spec" below and the code in "Luau".
   Done right: logo, a bar that moves per asset, one tip line, Skip appears at 3 s, gone by 4-6 s on a normal connection.
   Done wrong: a 20-second animated intro with no Skip, or a bar that sits at 99%.

3. **Preload only what the first 30 seconds need: loading-screen art, HUD icons, the first area's hero assets and the first 5-10 sounds.**
   Why: Roblox's ContentProvider docs recommend preloading only essential assets, naming the loading screen, the UI and the starting area, and accept some pop-in elsewhere [9]. Preloading the whole Workspace makes everyone wait for content they will not see for minutes.
   How: put a `Preload` Folder in ReplicatedStorage holding the first Sounds; preload the HUD ScreenGui itself and the `StartArea` model. Pass Instances, not string ids: an Instance in the list also preloads its descendants [10][12]. Keep preloaded images visible in the tree; a Roblox staff reply notes that images preloaded on invisible ImageLabels can be treated as unused and collected [11]. Drive the progress bar one asset at a time, not from `RequestQueueSize`, which grows and shrinks as assets are added [9].
   Done right: 1 HUD ScreenGui + 1 StartArea model + 8 sounds, bar advances in 10 steps.
   Done wrong: `ContentProvider:PreloadAsync(workspace:GetDescendants())` on a 40,000-part map.

4. **Spawn the player facing the first objective, 12-25 studs away, with the objective near the center of the camera view.**
   Why: the camera starts behind the character, so whatever the character faces is what the player sees first. A spawn facing a wall, a crowd or a shop wastes the first second and hides the first action.
   How: one SpawnLocation for new players, rotated so its front points at the first target. Confirm in a playtest; for exact control, pivot the character on the server in `CharacterAdded` with `character:PivotTo(CFrame.lookAt(rootPos, flatTargetPos))` (code in "Luau"). Keep the first target 12-25 studs away: close enough to reach in 2-4 s of walking at the default WalkSpeed of 16, far enough that walking toward it teaches movement. Set the SpawnLocation `Duration = 0` if the game has no combat, so no ForceField bubble covers the character.
   Done right: the first crystal sits 18 studs straight ahead, framed by a gold arch.
   Done wrong: 40 players spawning on one pad in a dark lobby with the shop wall in front.

5. **The first frame looks like the thumbnail's promise.**
   Why: the player clicked because the icon and thumbnails promised a fantasy ([[11 Thumbnails, Icons and the Store Page]]). If the first view is a gray lobby, the promise feels broken before anything happens.
   How: Scenic builds the spawn view as the game's best shot: the hero object (giant egg, dropper line, monster silhouette, race start) in frame, warm key light, saturated colors, no clutter. Splash should be able to take a thumbnail from the spawn camera with no edits.
   Done right: a pet simulator spawn with the colorful first zone, breakables glittering and the next zone's gate glowing in the distance.
   Done wrong: a spawn room with white walls, an update board and a long corridor.

6. **The starting area is small: spawn, first target, cash-in point and first upgrade all sit within a 40-stud radius.**
   Why: walking is not playing. Every second of empty travel in minute one is a second the player can leave. Grow a Garden guides describe the Seed Shop as sitting beside the Sell Stuff booth, with players planting on their own plot [30][31][32], so the buy-plant-sell loop is short from the first minute.
   How: Scenic lays out the first loop as a triangle: spawn to target 12-25 studs, target to cash-in 10-20 studs, cash-in to upgrade 5-15 studs. Measure with the Studio ruler or by subtracting positions in the command bar. Put the next zone's gate at the edge of this circle (Rule 28).
   Done right: target, sell pad and upgrade stand visible from the spawn without turning the camera.
   Done wrong: the shop is a 60-second walk from where the first coins drop.

7. **On first join the HUD shows at most 3 things: the main currency, the current objective and one button.**
   Why: a commenter on a DevForum thread about early quits said the GUI was overwhelming on joining [20]. Each extra button is something the player taps instead of the first action.
   How: Frame gives every HUD element a `TutorialUnlock` attribute (step number). The client shows an element only when `TutorialStep >= TutorialUnlock`. Returning players see the full HUD. The unlock is a moment: the button scales in from 0 with a 0.25 s Back-Out tween and a soft chime, plus a one-time red dot.
   Done right: coins top-left, "Break crystals 0/5" top-center, nothing else until the first sale.
   Done wrong: 11 buttons down both sides, three currencies, a codes box and a VIP banner.

8. **Sound is on from second one: music at low volume, and every interaction has its own sound.**
   Why: young players judge "did that work?" by instant feedback, and silence reads as broken. Sound carries reward even when eyes are elsewhere.
   How: music Sound in SoundService at Volume 0.25-0.35 starting with the spawn; interaction sounds 0.5-0.8; reward sounds 0.6-0.9 with `PlaybackSpeed` randomized 0.95-1.05. Preload the first sounds (Rule 3). Play UI sounds with `SoundService:PlayLocalSound`.
   Done right: soft music on spawn, a crisp "tink" on the first hit, a coin jingle on the first reward.
   Done wrong: a silent world until the first menu opens, then a loud click.

### The first action and the first reward

9. **The first action is on screen with a pointer within 5 s of control.**
   Why: the player should never need to search for what to do. Roblox's onboarding techniques recommend visual elements placed in the world, where players meet them while playing, because text pop-ups are easily missed depending on location, contrast and focus [2].
   How: on step 1 the client draws a beam from the character to the target, a bobbing arrow over it and a Highlight on it (kit below). The target is in view at spawn (Rule 4), so all three are visible on the first frame.
   Done right: a gold beam, arrow and outline on the first crystal the moment the character lands.
   Done wrong: an objective line saying "Find the mine" and nothing in the world.

10. **The first action uses the game's main verb with one input that works on touch, mouse, keyboard and gamepad.**
   Why: the opening is the core loop taught slowly. Unity's FTUE advice is that the first thing players touch should be the most engaging mechanic [25]. Teaching a side system first (settings, avatar, trading) delays the fun.
   How: one tap or click on the target, or walking into it, or a ProximityPrompt with `HoldDuration = 0`. Every ProximityPrompt shows on touch as a tappable button automatically; every custom key binding needs a touch button too ([[08 Mobile]]). Test the step in the Device Simulator, where touch is mapped to the mouse [17].
   Done right: tap the crystal to break it, on every device.
   Done wrong: "Press F to swing" with no button on phones.

11. **The first 30 s cannot be failed: no enemies, no timers, no death, no missable jumps.**
   Why: failure before the player understands the rules feels unfair and is a common reason to leave. Onboarding articles stress letting players succeed early [27].
   How: no hostile NPC within 60 studs of spawn; damage scripts ignore players whose `TutorialStep` is below the combat step; obby first jumps are 4-6 stud gaps with 8x8 stud platforms; kill bricks are absent from the first section. A fall off the start area teleports the player back onto the path with no death screen.
   Done right: the first enemy is a training dummy with 1 HP that cannot fight back.
   Done wrong: a zombie spawns on the player at second 10.

12. **The first reward lands within 15 s and uses at least four feedback channels.**
   Why: the reward is the first proof the game is fun. One channel (a number changing quietly) is easy to miss; layered channels read as "I did something good".
   How: on the first reward, play a reward sound, `ParticleEmitter:Emit(20-30)` at the hit point, a floating `+5` that rises 3 studs and fades over 0.7 s, a HUD counter pop (UIScale to 1.15 over 0.08 s, then back), and a small coin icon flying from the hit point to the counter over 0.4 s. Specs in [[02 The Core Loop]].
   Done right: tink, sparkle burst, "+5" floating up, coins flying to a counter that bounces.
   Done wrong: the counter silently changes from 0 to 5.

13. **Show one objective at a time: a verb-first line of 6 words or fewer, an icon and a counter.**
   Why: several goals at once split attention; a quest list is a reading task. Introducing one mechanic at a time is a standard mobile onboarding practice [24], and teaching in small segments avoids overload [28].
   How: one ObjectiveTracker frame at top-center below the Roblox top bar: icon 40x40 px, text 22-26 px bold, counter `3/5`, a thin progress bar under it. Text examples: "Break crystals 3/5", "Sell your gems", "Buy Pickaxe 2". Numbers as digits, never words.
   Done right: "Sell your gems" with a gem icon, nothing else.
   Done wrong: "Welcome adventurer! Gather resources, sell them at the market and upgrade your gear to explore new lands!"

14. **The first counted goal is 3-5 repetitions; each next counted goal roughly doubles.**
   Why: a short count finishes before boredom and teaches that counters mean progress. Doubling keeps steps short while making the player use the loop.
   How: step 2 "Break 5 crystals" at about 1.5-2 s per crystal is 8-10 s. The goal after the first upgrade is 10, which is quicker per crystal because the upgrade doubled power. Blox Fruits' first quest asks new players to defeat five bandits or five trainees [41][42], a small concrete count.
   Done right: 5, then 10, then a currency goal sized to about 60-90 s of play.
   Done wrong: "Collect 100 coins" as the very first goal.

15. **Every completed objective gets a 0.4-0.8 s "done" beat before the next one appears.**
   Why: without a beat, completion is invisible and the next instruction reads as more work. A short beat is a micro-celebration that costs almost no time.
   How: the tracker flashes green, the text swaps to a checkmark with "Done!" and a chime plays; after 0.5 s the next objective slides in from the top (0.25 s Quad-Out). Never block input during the beat.
   Done right: "5/5" turns green, checkmark, chime, then "Sell your gems" slides in.
   Done wrong: "5/5" silently replaced by the next goal.

### Guidance: point, don't explain

16. **Every tutorial step has a world pointer; text is the backup, never the instruction.**
   Why: many players, especially young ones, do not read. Roblox's onboarding guidance places visual elements in the world for exactly this reason [2], and contextual teaching (introducing mechanics when the player needs them, with visual cues and guided first actions) is the approach glossaries and guides recommend [22].
   How: each step in the shared `TutorialSteps` table names a `Target` (a part or model in `Workspace.Tutorial`) or a `UiTarget` (a GuiObject path). The client turns that into the right pointer: beam + arrow + Highlight for world targets, spotlight for UI targets, edge arrow when off-screen, chevrons when far.
   Done right: you could mute the text entirely and still finish the tutorial.
   Done wrong: the only instruction is a dialogue box.

17. **Escalate help with time: pointer at once, tracker wiggle at 5 s, tapping hand at 10 s, helper text at 20 s, a "Show me" button at 40 s.**
   Why: most players need only the pointer; a few need more. Escalating help keeps the screen clean for the many while catching the stuck. Roblox lists timed hints as one of the main onboarding techniques and suggests A/B testing the delay, for example 5 s against 10 s, to see which completes the funnel better [2].
   How: the client tracks seconds since the step started without progress (reset on progress). 5 s: the tracker shakes (Rotation ±4° for 0.3 s). 10 s: tapping hand and pulsing ring on the target (UI) or a stronger beam (world). 20 s: a bubble with 3-5 words near the target. 40 s: a "Show me" button that walks the camera to the target for 1.5 s or, for long paths, offers a teleport. Store the delays in Config so they can be tested (Rule 44).
   Done right: a player who walks the wrong way sees the edge arrow at once and the hand after 10 s.
   Done wrong: a hand, a dialogue box, a beam and a flashing button all at once from second one.

18. **Dim the screen only for a UI tap, never while the player must move, and at most 2-3 times in the whole tutorial.**
   Why: a spotlight dim is the strongest pointer there is, so it is reserved for taps that would otherwise be missed (the first purchase button, the first egg open). Overused, it turns the game into a slideshow.
   How: four black Frames at `BackgroundTransparency = 0.45` arranged around the target rectangle plus 10 px padding, so the target itself is never covered and always receives the tap. Add the pulsing ring and the tapping hand. Remove the dim the instant the target is tapped. Code in "Luau".
   Done right: dim + ring on "Buy" the first time the player can afford Pickaxe 2, then never again.
   Done wrong: dimming the screen for every step, including walking steps.

19. **Off-screen targets get an edge arrow with distance, clamped inside the safe area.**
   Why: when the player turns away, the world arrow and beam leave the view and the player is lost. An edge arrow keeps the direction visible from any camera angle.
   How: every render step, project the target with `Camera:WorldToViewportPoint`. If it is on screen, hide the edge arrow. If not, place a 56x56 px arrow on the line from screen center toward the target, clamped to a box inset 56 px from the edges, below the top-bar inset and above the bottom thumb controls, rotated to point outward, with a small distance label. Behind the camera, flip the direction. Code in "Luau".
   Done right: player spins around and an arrow at the screen edge points back to the sell pad with "24".
   Done wrong: the only pointer is a beam that disappears when the camera turns.

20. **Routes longer than 30 studs, or with turns, get a chevron path along the walkable route.**
   Why: a straight beam through a wall points the way a bird would go. A path on the ground shows the walkable route and doubles as a "road" the eye follows. Roblox's onboarding page shows a directional path in Hello Kitty Cafe that strongly suggests an action without requiring it, keeping players free to explore [2].
   How: compute a route with `PathfindingService:CreatePath()` and `ComputeAsync`, keep a point every 4+ studs, and chain Beams with a chevron texture between Attachments, scrolling with `TextureSpeed` [16]. Beams only render under Workspace with both Attachments under Workspace [16], so parent the client-made anchor Part to Workspace. Fall back to a straight beam if pathing fails.
   Done right: glowing chevrons run along the bridge and around the fountain to the next zone gate.
   Done wrong: a beam that runs through a cliff.

21. **Point at one thing at a time: one beam, one arrow, one Highlight.**
   Why: several pointers cancel each other out. Highlights also have a client limit: the Highlight reference says only 31 can display at once and extra ones are silently ignored [13], and the docs note that a disabled Highlight still takes a slot [13]. A later DevForum announcement says the maximum was raised to 255 [15]. Either way, the tutorial should use one.
   How: the guide controller owns a cleanup list and clears every pointer before drawing the next. Never leave Highlights on shop stands "for decoration". Use `DepthMode = AlwaysOnTop` for the tutorial Highlight so it shows through walls [13][14].
   Done right: exactly one glowing object on screen during the tutorial.
   Done wrong: every breakable, egg and NPC outlined at once.

22. **Guidance is client-only; the step is owned by the server.**
   Why: the tutorial step decides rewards and the funnel, so it must not be spoofable, but pointers are cosmetic and must react instantly. Funnel events can only be sent from the server [3].
   How: the server stores `data.Tutorial.Step` in the player's save, mirrors it to `player:SetAttribute("TutorialStep", n)` and advances it only when server systems confirm the action (the server granted the coins, the server processed the purchase). The client listens to `GetAttributeChangedSignal("TutorialStep")` and redraws.
   Done right: an exploiter who fires the tutorial remote gets nothing; the step only advances when the server's sell function runs.
   Done wrong: a LocalScript increments the step and tells the server "I finished step 4, give me the reward".

23. **Guidance rebuilds after death, reset, respawn, streaming and teleport.**
   Why: attachments on the old HumanoidRootPart die with the character. With streaming on, a target may not exist on the client yet. A tutorial that silently loses its pointer after a reset strands the player.
   How: the guide redraws on `CharacterAdded`, on the step attribute changing, and when the target streams in (`WaitForChild` with a timeout, or set the tutorial models' `ModelStreamingMode` to Persistent). Tutorial UI lives in a ScreenGui with `ResetOnSpawn = false`. After a teleport into another place, the server there reads the saved step and the client redraws.
   Done right: the player falls off the map, respawns, and the beam is back within a second.
   Done wrong: the beam is gone after a reset and the tracker still says "Sell your gems".

### Wins, hooks and teasers

24. **Script the first wins so they are guaranteed: curated free rolls, a padded first sale, a 1-HP first enemy.**
   Why: an early win builds trust in the game's reward. Liquid & Grit's review of 26 leading mobile apps found the successful FTUEs got players playing as quickly as possible [23], and early wins with positive feedback are a common thread in onboarding guidance [27]. Leaving the first outcomes to chance means some players' first roll is the worst possible one.
   How: the first free egg uses a separate `StarterEgg` table where the lowest tier is Rare; the first sale pays a fixed amount that exactly covers the first upgrade plus 10-25%; the first enemy is a dummy that cannot attack. These are free rewards, not paid rolls, so the odds rules in [[03 Rarity and RNG]] do not change, but the starter table must never be reachable by paying.
   Done right: the free starter egg always gives a Rare or better pet with a full reveal.
   Done wrong: the first free egg gives the most common pet in the game with a gray card.

25. **The first upgrade is affordable between 45 and 90 s, and it visibly changes the main verb.**
   Why: the first upgrade proves the loop: effort turns into power. If it is priced for minute ten, the player never learns the loop. If it does not show, the player cannot feel it.
   How: Balance prices it in Config so the first goal's reward plus the first sale cover it ([[04 Progression and Economy]]). The upgrade swaps the tool model, doubles the reward per action (the floating number goes from +5 to +10), adds a new hit effect or speeds the swing by 20-30%. Announce it with a toast "x2 Power!" and an effect on the character.
   Done right: Pickaxe 2 costs 25, the first sale pays 30, the new pickaxe is bigger and glows.
   Done wrong: "+3% mining efficiency" on a tool that looks the same.

26. **Give one starter gift (free pet, tool, egg or cosmetic) before minute 3, as the reward for an action.**
   Why: ownership is a strong reason to come back. Adopt Me's opening is described as a short tutorial that walks new players through getting an egg and hatching their first pet before free play [37], and a Pet Simulator 99 event area required players to open a free egg on entering, giving one of two pets [35]. Guides for Pet Simulator 99 also advise following the tutorial quests because they give free pets and starter currency [36].
   How: tie the gift to a step ("Open your free egg") with a world target and the spotlight on the Open button. The gift should matter in play: a pet that follows and adds +25% coins, a tool with a new effect. Show it in the inventory with a "New" dot.
   Done right: at 2:30 the player hatches a Rare pet that follows them and boosts coins.
   Done wrong: a popup "Here are 50 free gems!" that the player closes without reading.

27. **The hook beat shows the dream within 20 s without taking control away for more than 3 s.**
   Why: the first minute should show where the game goes: the giant pet, the full tycoon, the boss, the finish line. This is the "leave them wanting more" part of onboarding [1]. A long cutscene loses players; a short glimpse inside play creates desire.
   How: build the hook into the world on the first route: a showcase pedestal with the top pet, a fully built demo tycoon next to the player's empty plot, the next zone visible through a glowing gate, a server-wide message when someone else hatches a Legendary. If you must use a camera move, make it ≤3 s, interruptible by any input, and never on a returning player's join.
   Done right: the path to the sell pad passes a 20-stud-tall Legendary dragon statue on a plinth that reads "1 in 5,000".
   Done wrong: a 25-second fly-through of every zone before the player can move.

28. **Show the next tier inside the first 3 minutes: a locked gate, door or item with its price, visible through.**
   Why: a visible goal turns the next ten minutes into a plan. Blox Fruits places its starter islands at levels 0-10 with the Jungle as the usual next step at 15-30 [44], so the next place exists from the start. In simulators the next zone's gate is usually at the edge of the first one.
   How: a gate at the edge of the start area showing the price ("1,000 coins"), the next zone visible through it (transparent barrier, not a wall), and a progress bar on the gate that fills as coins grow. Make the next zone's objects visibly better (bigger crystals, brighter colors).
   Done right: the Cave gate glows blue with "0 / 1,000" filling as the player earns.
   Done wrong: the next zone is a hidden menu entry the player finds in minute 15.

29. **Celebrate the first goal loudly but in 1.5 s or less, and never block play to do it.**
   Why: celebration marks progress and makes it memorable; long celebrations become chores when they repeat.
   How: confetti burst (`Emit(60)`), a banner "Goal complete!" that scales in over 0.2 s and out after 1.2 s, a fanfare 1-1.5 s long, the reward flying into the counter. Input stays live. Bigger moments (first zone, first rebirth) can run 2-3 s; routine completions get the 0.5 s beat from Rule 15.
   Done right: confetti and fanfare while the player is already breaking the next crystal.
   Done wrong: a full-screen "Congratulations!" with an OK button.

### Teaching the loop

30. **Teach the whole core loop in 5-8 steps, one action per step.**
   Why: the tutorial's job is to run the player through the loop once, end to end, so they can repeat it alone. Fewer than 5 steps usually skips cash-in or spending; more than 8 becomes a chore.
   How: map steps to the loop: (1) move to the target, (2) do the verb, (3) see the reward, (4) cash in, (5) spend on an upgrade, (6) feel the upgrade, (7) get the starter gift, (8) see the next goal and go free. Each step has one target, one objective line and one funnel step. Template in "Teaching the core loop in 5-8 steps".
   Done right: 8 steps, each 10-40 s, done by minute 4.
   Done wrong: 22 steps including "open settings" and "read about trading".

31. **Teach each mechanic at the moment the player needs it, never up front.**
   Why: rules read before they matter are forgotten. Introducing mechanics only when needed is the contextual-teaching approach [22][28], and Roblox lists contextual tutorials among its main techniques [2].
   How: the sell step appears when the backpack is full, not before; the rebirth explanation appears when rebirth first becomes affordable; trading appears when the player has a duplicate. Each is a one-time contextual tutorial triggered by a server condition and saved as seen.
   Done right: the backpack fills, the bar turns red, the Sell pad lights up and the objective reads "Sell your gems".
   Done wrong: a page of "How to play" with 9 sections on join.

32. **Add at most one new control per step.**
   Why: two new inputs at once double the chance of failure and make it unclear which one mattered.
   How: list the inputs each step needs. If step 4 needs "jump" and "use tool", split it. Movement is taught by walking toward the first pointer, jumping by a 2-stud ledge on the first route, the tool by the first target.
   Done right: step 2 is "tap the crystal" only; jumping comes later with one ledge.
   Done wrong: "jump onto the platform and press E on the chest while holding the tool".

33. **Release the player into free play by minute 5 with a next goal reachable in under 10 minutes.**
   Why: a tutorial that never ends feels like a leash; a release with no goal feels empty. The release must leave a visible next goal.
   How: the last step ("FreePlay") hides the beam and hand, keeps the tracker with a session goal ("Unlock the Cave 0/1,000"), and switches pointers to on-demand: a small compass button that redraws the beam for 5 s. Balance checks in the economy sim that the goal is reachable in 5-10 minutes of normal play ([[04 Progression and Economy]]).
   Done right: at 4:10 the tutorial ends with a chime and the tracker shows the Cave goal at 18%.
   Done wrong: the tutorial ends and the tracker is empty.

34. **Defer secondary systems until free play and unlock each one with a single badge.**
   Why: trading, crafting, codes, settings, the index, daily rewards, quests and friends lists are all real features, and all of them compete with the first loop.
   How: each secondary system has an unlock condition (step, level or minute). When it unlocks, its button scales in with a red dot and a one-line toast ("New: Pet Index!"). No tutorial for it until the player opens it; then one contextual step.
   Done right: the Index button appears after the first hatch with a red dot.
   Done wrong: the daily reward calendar, codes panel and update log all open on first join.

### Restraint: monetization and social

35. **No purchase prompts, offers or shop popups before the first upgrade; a starter pack shows only as a passive HUD badge after minute 5.**
   Why: an offer before the player knows what anything is worth reads as pushy and is aimed at someone who has not yet decided to stay. Mobile FTUE benchmarking treats the starter offer as part of the early experience but separate from the first play [23]; this studio's target is that it never interrupts the first five minutes.
   How: Merchant's offer service checks `TutorialStep >= FreePlay` and minutes played ≥ 5 before showing any badge. Never call `MarketplaceService:PromptProductPurchase` or `PromptGamePassPurchase` unless the player tapped a buy button. Rules for offers live in [[09 Shops and Monetization]].
   Done right: at minute 6 a small gift-box badge with a timer-free "Starter Pack" label appears beside the Shop button.
   Done wrong: a Robux prompt opens automatically at second 20.

36. **Social features show up as the world, not as prompts: other players are visible, but there are no invite or friend prompts in the first 5 minutes.**
   Why: seeing other players with cool pets and big bases creates goals by itself, while prompts interrupt.
   How: let other players' pets, auras and bases be visible from the spawn; show a server message for rare hatches (with a cap of one every 30 s); hold any "invite friends" prompt until the player has played 10+ minutes or reached a milestone ([[10 Retention and Social]]).
   Done right: a player sees someone fly past with a glowing dragon pet and asks "how do I get that?".
   Done wrong: "Invite 3 friends for a reward!" at second 30.

### Devices, kids and returning players

37. **Design every step for a phone first: tap targets at least about 48 px, nothing under the thumbstick or the jump button.**
   Why: most Roblox players are on phones ([[08 Mobile]]). A step that needs a mouse, a keyboard key or a precise tap on a small icon will fail for them.
   How: test each step in the Device Simulator using Physical size display scaling, which shows UI at its real-world size as it would appear in a player's hand after calibrating your monitor [17]. Add a small phone and a tablet as custom devices if the defaults do not cover them [18]. Keep tutorial pointers out of the bottom-left (thumbstick) and bottom-right (jump) corners.
   Done right: the "Buy" button in step 5 is 160x64 px on a small phone and the hand never covers it.
   Done wrong: a 24 px "x" close button the player must hit to continue.

38. **Write for a 7-year-old: verbs first, 6 words or fewer, digits not words, and text at least 18 px on a phone.**
   Why: the youngest players read slowly or not at all, and everyone skims. Short verb-first lines are scannable.
   How: "Sell your gems", not "Head over to the merchant to sell what you've collected". Numbers as `5`, not "five". Font Gotham/Builder Sans bold, 22-26 px for the tracker, `TextScaled` with a `UITextSizeConstraint` (MinTextSize 18). Kid Tester reads every line aloud; if it takes over 2 s, cut it.
   Done right: "Open your free egg".
   Done wrong: "Congratulations! You have unlocked the ability to hatch eggs at the Egg Emporium."

39. **Returning players skip the tutorial completely, and players who leave mid-tutorial resume at their step.**
   Why: replaying a tutorial is the fastest way to annoy a returning player. Losing tutorial progress on a disconnect forces a restart that many will not do.
   How: the step is saved in the player's data (Rule 22). On join: if `Step >= #STEPS`, set `TutorialDone = true` and show the full HUD. If mid-way, resume at that step with its pointer. Tower Defense Simulator's tutorial is a separate short run that players reach from a Tutorial button or can replay from Settings [39], which keeps it out of the way of experienced players.
   Done right: a player who quit at step 5 comes back to "Buy Pickaxe 2" with the beam on the stand.
   Done wrong: every join starts with "Welcome! Let's learn to mine!"

40. **Offer a quiet Skip after step 2 that fast-forwards and still grants every tutorial reward.**
   Why: some players already know the genre. Skip options are a standard onboarding recommendation [24], but a skip that costs the starter rewards punishes the player for knowing the game.
   How: a small "Skip tutorial" text button (not a big button) at the top-right below the top bar from step 3 onward. The server runs every remaining step's reward and logs each funnel step in order (skipped steps count as completed in funnels anyway [3], but logging them in order keeps your own records exact). Log a custom event `TutorialSkipped` with the step it happened at.
   Done right: Skip at step 3 gives Pickaxe 2, the starter egg and the coins, then shows the Cave goal.
   Done wrong: no skip at all, or a skip that loses the free pet.

### Measuring and iterating

41. **Log every onboarding step from the server with `LogOnboardingFunnelStepEvent`, in order, starting with step 1 at spawn.**
   Why: the funnel shows where new players drop off; without it, fixes are guesses. Funnel events can only be sent from the server, and only in published experiences, not from Studio or the client [3].
   How: step 1 "Spawned" is logged the moment the character exists, so every later percentage is relative to everyone who arrived. Steps are numbered from 1, unique, and within 1-100 [3]. Skipped step numbers count as completed [3], so a bug that jumps from 2 to 5 makes steps 3 and 4 look perfect; always advance one at a time. The step name is optional and shows in Roblox's charts [3]. Code in "Luau".
   Done right: 8 steps, logged in order from the server, the first at spawn.
   Done wrong: logging from a LocalScript, or starting at step 2 "FirstHit".

42. **Target at least 90% conversion between consecutive tutorial steps (95%+ for steps 1-3), and fix the biggest drop first.**
   Why: losses multiply. Eight step-to-step transitions at 90% keep 43% of arrivals; at 97% they keep 78%. The single worst step usually hides one clear problem (a missing pointer, an unaffordable price, a confusing UI).
   How: Liveops reads the funnel in the Creator Hub analytics, ranks the step-to-step drops, and files the biggest as a bug with the step name. Fix one thing, ship, wait for enough new players, re-read. These percentages are studio targets, not Roblox benchmarks. For a whole-game comparison, the analytics dashboard benchmarks D1 retention and other KPIs against similar experiences [5].
   Done right: "Step 5 → 6: 71%. Players can't find the Buy button on phones. Fix: spotlight on Buy."
   Done wrong: changing five things at once and not knowing which one helped.

43. **Time every step in playtests and in live data, and compare against the opening timeline.**
   Why: a step can convert at 98% and still take 3 minutes. Time is the hidden cost.
   How: the server records `os.clock()` at spawn and logs `AnalyticsService:LogCustomEvent(player, "FTUEStepSeconds", seconds, {[CustomField01] = stepName})` when each step completes. Custom field values count toward a per-experience limit of 8,000 unique combinations across the three custom fields [3], so use step names, never user ids. Playtest records timestamps by hand or from logs and writes them into the playtest report next to the target.
   Done right: playtest report row "FirstUpgrade target 0:45-1:30, actual 2:10 → price too high".
   Done wrong: "the tutorial felt fine".

44. **Put hint delays, first prices and first goal sizes in Config so they can be A/B tested.**
   Why: you rarely know the best delay or price in advance. Roblox's onboarding techniques page notes each technique can be tuned with Configs and Experiments, and gives testing a 5-s against a 10-s hint delay as an example [2].
   How: `Config.Tutorial = { HintWiggle = 5, HintHand = 10, HintText = 20, HintShowMe = 40, FirstGoalCount = 5, FirstUpgradePrice = 25 }`. When testing variants, change one value per test and compare funnel completion and D1 between groups.
   Done right: "Hand at 6 s vs 10 s: 6 s raised step 5→6 completion."
   Done wrong: delays hard-coded in five LocalScripts.

45. **Run a fresh-player test after every change to the opening: five new players, timed, with the three-question test at 1, 3 and 5 minutes.**
   Why: the team has seen the game 500 times and cannot see what a new player sees. Watching real players and iterating on what you see is the core onboarding advice [29], and planning the FTUE early rather than bolting it on late avoids most problems [26].
   How: Kid Tester and Playtest play from a clean save on a phone profile in the Device Simulator and in a live test server. At 1:00, 3:00 and 5:00 ask: What are you doing? Why? What's next? Any "don't know" is a bug. Record where they looked, what they tapped first and every hesitation over 3 s.
   Done right: a playtest note "At 0:22 tapped the Shop button instead of the crystal → hide Shop until step 4."
   Done wrong: the developer plays the tutorial once on a PC and calls it done.

## Step by step

### Building the opening in 16 steps

1. **Architect writes the loop sentence and the opening script** in `plan.md`: the 5-8 tutorial steps, each with an id, target, objective text (≤6 words), count, reward and target time. Use the master script below as the template.
2. **Balance prices the first minutes** in Config: first goal count, reward per action, first sale value, first upgrade price, starter gift value, next-zone price. Run the economy sim and check the first upgrade lands at 45-90 s and the next-zone goal at 5-10 min ([[04 Progression and Economy]]).
3. **Scenic blocks out the start area** inside a 40-stud radius: spawn, first target, cash-in, upgrade stand, starter gift, next-zone gate, hook object. Rotate the SpawnLocation to face the first target. Light it like the thumbnail.
4. **Scenic puts every tutorial target in `Workspace.Tutorial`** as named parts or models (`Crystal1`, `CrystalField`, `SellPad`, `UpgradeStand`, `StarterEgg`, `CaveGate`). If streaming is on, set these models' `ModelStreamingMode` to Persistent.
5. **Builder adds `ReplicatedStorage.Shared.TutorialSteps`**, the shared step table both server and client read (see "Luau").
6. **Builder writes the server Tutorial module** (community frameworks such as OnBoard [21] use the same step-based structure): load the saved step, set `TutorialStep` and `TutorialDone` attributes, advance only from server-confirmed events, grant step rewards, log funnel steps and step times.
7. **Builder wires game systems to the tutorial**: the mining handler calls `Tutorial.progress(player, "FirstGoal", 1)`, the sell handler calls `Tutorial.progress(player, "FirstSell", 1)`, the shop calls `Tutorial.progress(player, "FirstUpgrade", 1)`, and so on.
8. **Frame builds the ObjectiveTracker** (top-center, icon, ≤6-word text, counter, bar) and the HUD unlock rule (`TutorialUnlock` attribute per element).
9. **Frame and Builder build the guidance kit** on the client: world pointer (beam + arrow + Highlight), chevron path, edge arrow, spotlight (dim + ring + hand) and the hint ladder with Config delays.
10. **Librarian supplies the art**: an arrow image, a chevron strip texture, a hand icon, a ring (or use UIStroke), confetti and sparkle particles, and the first 8-10 sounds, all original or properly licensed ([[07 Characters, VFX and Assets]]).
11. **Builder adds the loading screen** in ReplicatedFirst (only if the game needs one) with the spec below.
12. **Builder adds the facing pivot** in `CharacterAdded` and the fall-back teleport for players who fall off the start area.
13. **Merchant and Liveops gate everything else**: no offers, daily rewards, update logs, codes or invite prompts until `TutorialDone` or the stated unlocks.
14. **Playtest runs the five-fresh-players test** on phone, tablet and PC profiles in the Device Simulator [17] and in a live test server, timing each step and asking the three questions at 1, 3 and 5 minutes.
15. **Kid Tester plays it without reading**: can a non-reader finish the tutorial from pointers alone? Note every hesitation over 3 s.
16. **Producer checks the Checklist** at the end of this page. After launch, Liveops reads the onboarding funnel weekly and files the biggest drop as the next fix.

### Fixing a weak opening in 8 steps

1. Pull the onboarding funnel and rank step-to-step conversions [3].
2. Watch three fresh players reach the worst step; write down exactly what they did instead.
3. Classify the cause: can't see the target (pointer), can't reach it (layout), can't afford it (price), don't understand it (step too big), don't care (no reward or hook), interrupted (popup).
4. Pick one fix that addresses the cause; prefer world changes over text.
5. Put the changed value in Config and, if possible, test it against the old value [2].
6. Re-run the five-fresh-players test.
7. Ship, then wait for enough new players to re-read the funnel; compare step conversion and D1 [5][6].
8. Record the result in `games/<slug>/decisions.md` so the next game starts from what worked.

## The opening script, second by second

This is the master script for a simulator-style game. Every genre adapts it (see "By genre"), but the beats stay: control, action, reward, cash-in, upgrade, gift, goal, release. Times are targets from first control on a phone.

| Time | Player sees and does | System does | Funnel step |
|---|---|---|---|
| Before 0:00 | Roblox loading, then custom screen ≤8 s with Skip at 3 s | Preload HUD, StartArea, first sounds | — |
| 0:00 | Character lands facing a glowing crystal 18 studs ahead; soft music | HUD shows coins `0` and "Break the crystal"; beam, arrow and Highlight on Crystal1 | 1 Spawned |
| 0:00-0:03 | Thumb pushes forward, character walks toward the beam | If no movement for 5 s, the tracker wiggles | — |
| 0:03-0:05 | Reaches crystal, taps it (or the ProximityPrompt / auto-hit) | Server validates and grants +5; client plays tink, sparkle burst, "+5", coin fly, counter pop | 2 FirstHit |
| 0:05-0:15 | Tracker "Break crystals 1/5" → taps four more crystals in a small cluster | Each hit: escalating pitch, counter pops; at 5/5 a green flash and chime | 3 FirstGoal |
| 0:15-0:25 | "Sell your gems"; beam (or chevrons) to the Sell pad 14 studs away; path passes the hook (a giant Legendary statue with "1 in 5,000") | Hook in the world, no camera takeover | — |
| 0:25-0:30 | Steps on the Sell pad | Coins burst out, counter rolls 25 → 55 over 0.6 s, cash register sound | 4 FirstSell |
| 0:30-0:40 | "Buy Pickaxe 2"; beam to the upgrade stand 8 studs away; small in-world panel shows Pickaxe 2 for 25 | Dim + ring on the Buy button; hand appears at 3-10 s if not tapped | — |
| 0:40-0:45 | Taps Buy | Tool swap, glow, toast "x2 Power!", counter drops 55 → 30 | 5 FirstUpgrade |
| 0:45-1:15 | "Break crystals 0/10"; hits now show "+10" with a bigger burst | The upgrade is felt in every hit | 6 FeelUpgrade |
| 1:15-1:45 | First goal complete: confetti, fanfare, "+50" | Next objective appears after the beat | — |
| 1:45-2:30 | "Open your free egg"; beam to the Starter egg; dim + ring on Open | Starter table, Rare or better; 2 s reveal; pet follows and adds +25% | 7 StarterGift |
| 2:30-3:00 | "Unlock the Cave 0/1,000"; chevrons to the Cave gate, glowing, next zone visible through | Index button unlocks with a red dot after the hatch | 8 NextGoal |
| 3:00-4:00 | Free loop: breaks, sells, maybe buys Backpack 2 | Beam hides; compass button redraws it on demand | — |
| 4:00-5:00 | Cave goal at 30-50%; sees another player's glowing pet; first daily reward badge appears | Tutorial done; secondary systems unlock one by one with badges | 9 FreePlay |
| 5:00+ | Cave opens at about 6-9 min (sim target) | Starter-pack badge allowed now (no popup) | — |

Rules this script follows: control at 0:00 (Rule 1), first action pointed by 0:05 (Rule 9), first reward by 0:15 (Rule 12), first upgrade 0:45-1:30 (Rule 25), gift before 3:00 (Rule 26), hook within 0:20 (Rule 27), next tier visible by 3:00 (Rule 28), free play by 5:00 (Rule 33).

## Loading screen spec

Use a custom loading screen only when the game benefits from it: a strong brand moment, a large start area that would visibly pop in, or a multi-place game that teleports often. Otherwise rely on Roblox's default and spend the effort on the spawn view.

**Placement and lifetime**
- A LocalScript in ReplicatedFirst builds the ScreenGui in code, parents it to PlayerGui and calls `RemoveDefaultLoadingScreen()` [8]. Scripts in ReplicatedFirst run before anything else [8].
- Minimum display 1.5 s (so it never flashes), Skip button from 3 s, hard maximum 8 s (auto-dismiss). These are studio targets; ContentProvider guidance supports skipping or auto-skipping after a set time [9].
- Wait for `game:IsLoaded()` (or `game.Loaded:Wait()`) before dismissing; the docs' sample keeps its screen up for a minimum time and then waits for the game to load before destroying it [7].
- The default Roblox screen is removed after about 5 s if anything is in ReplicatedFirst [8]. Never put a half-finished loading script there.
- For teleports between places, pass the same screen with `TeleportService:SetTeleportGui` so the transition looks continuous.

**Layout (landscape phone first)**
- `ScreenGui.IgnoreGuiInset = true`, `DisplayOrder = 100`, `ResetOnSpawn = false`. Wrap everything in a CanvasGroup so one `GroupTransparency` tween fades it all.
- Background: full-screen key art or a two-color UIGradient in the game's palette (dark enough for white text, e.g. `#181C30` to `#2A3466`).
- Logo: centered, 40% of screen height, AnchorPoint (0.5, 0.5) at (0.5, 0.42).
- Progress bar: 50% width, 12 px tall, rounded (UICorner radius 1,0), at (0.5, 0.72); fill in the accent color; moves one asset at a time [9].
- Tip line: one short line under the bar, 18-22 px ("Bigger pickaxes break crystals faster!"). Tips are optional; never paragraphs.
- Skip: a 140x48 px text button at bottom-right, inset 24 px, appearing at 3 s with a 0.2 s fade.
- No Robux offers, no news, no social prompts on the loading screen.

**What to preload** (Rule 3): the HUD ScreenGui, the `StartArea` model and a `Preload` folder of the first sounds. Pass Instances so descendants are included [10]. Do not preload invisible ImageLabels [11].

**Exit choreography**
- The camera and character are already in place behind the screen, facing the first target.
- Fade the CanvasGroup out over 0.35 s; start the music fade-in at the same time.
- The tutorial pointer is already drawn when the fade ends, so the first visible frame has the pointer (Rule 9).

**Streaming**
- With StreamingEnabled, the start area must be present on the client when the screen fades. Set the start area's models to `ModelStreamingMode = Persistent` (or Atomic for small models that must arrive whole) and keep `StreamingMinRadius` large enough to include the first loop's triangle. On the server, `player:RequestStreamAroundAsync(position)` can ask for the area around a position before the player is moved there.

## The hook beat

The hook beat is a 3-8 second moment inside the first 20 seconds that shows the player the best version of the game they are about to play, without stopping them from playing. It answers "why would I keep going?" before the player asks it. It is the in-game version of the thumbnail ([[11 Thumbnails, Icons and the Store Page]]) and the "leave players wanting more" part of onboarding [1].

**Forms that work (pick one, build it into the first route):**
- **Showcase pedestal.** The rarest pet, car, weapon or aura on a lit plinth beside the path, with its rarity ("1 in 5,000") and a short sparkle loop.
- **Demo base.** A fully built tycoon, garden or house beside the player's empty plot, labeled "This could be yours".
- **The next zone through glass.** A glowing gate with the next area visible behind it, bigger and brighter.
- **Live proof.** A server message or world effect when another player hatches, catches or wins something rare, capped at one every 30 s.
- **Danger glimpse (horror, survival).** A light flicker and a silhouette at the end of the first corridor, gone before the player can react.
- **Speed glimpse (racing, obby).** A ghost runner or NPC car that blasts past at full speed on the first straight.

**Rules for the beat:**
- It happens while the player is moving toward the first or second objective; it does not replace an objective.
- No camera takeover, or at most 3 s, interruptible by any input, first join only (Rule 27).
- It shows something the player can actually get, not a paid-only item ([[09 Shops and Monetization]]).
- Scenic places it on the route, at eye level, lit to stand out; Librarian gives it the best VFX in the start area.
- Playtest checks it: ask at 1:00 "What's the coolest thing you've seen?" If the answer isn't the hook, it is not visible enough.

## Guaranteed first wins

A first win is an outcome the player experiences as success. In the first five minutes every one of them is scripted so that no new player gets the bad version.

| Win | How to guarantee it | Typical value |
|---|---|---|
| First action succeeds | Target has low HP or one-hit break; no miss chance; generous hitbox (+30% size) | 1 tap |
| First reward feels big | First 3 rewards use a "starter" multiplier (e.g. x2) that is dropped silently after step 3 | +5 instead of +2 |
| First goal completes fast | Count 3-5, targets clustered within 8 studs | 8-15 s |
| First sale covers the first upgrade | First sale value fixed in Config at upgrade price + 10-25% | 30 vs a 25 price |
| First upgrade is felt | Doubles reward per action and changes the model | +5 → +10 |
| First roll is good | Free starter table with Rare as the floor; never purchasable | Rare+ |
| First fight is won | Dummy with 1 HP that does not attack; or an enemy at 25% damage until step done | 1-3 hits |
| First jump lands | 4-6 stud gaps, 8x8 platforms, invisible safety floor below that returns you to the last pad | 100% |
| First round is survived | Wave 1-3 enemies scaled to 50% HP for players on their first match | Win |
| First race is placed | Bots rubber-band to finish just behind the new player | Top 3 |

Rules: guarantees apply only to free rewards and only in the first session; they never change the odds of anything bought with Robux or a Robux-bought currency ([[03 Rarity and RNG]]). Remove each guarantee silently after its step, and never tell the player "you were lucky" when the outcome was scripted.

## Teaching the core loop in 5-8 steps

Use this template. Fill in the verbs from the loop sentence in [[02 The Core Loop]]. Each step is one funnel step, one objective, one target, one new control at most.

| # | Step | Objective text (≤6 words) | Target | New control | Target time |
|---|---|---|---|---|---|
| 1 | Spawned | (none, pointer only) | First target | Move | 0:00 |
| 2 | First action | "Break the crystal" | Crystal1 | Tap/click the target | by 0:05 |
| 3 | First goal | "Break crystals 0/5" | Crystal cluster | — | by 0:15 |
| 4 | Cash in | "Sell your gems" | Sell pad | Step on pad | by 0:30 |
| 5 | Spend | "Buy Pickaxe 2" | Upgrade stand → Buy button | Tap UI button | by 0:45 |
| 6 | Feel it | "Break crystals 0/10" | Crystal cluster | — | by 1:15 |
| 7 | Gift | "Open your free egg" | Starter egg → Open button | Open/hatch | by 2:30 |
| 8 | Next goal | "Unlock the Cave 0/1,000" | Cave gate | — | by 3:00, done ≈ 6-9 min |

Shorter loops (obby, horror, party) use 5 steps: spawn, first action, first success, first checkpoint/round, next goal. Longer meta games (tycoon, tower defense) use all 8 and put the shop or loadout in step 5.

## The pointer and guidance kit

All pointers are client-side, cosmetic, and driven by the server's `TutorialStep` attribute (Rule 22). One active pointer set at a time (Rule 21). Colors come from the studio's UI tokens ([[05 UI and HUD]]); the default tutorial accent is gold `#FFD640` with a white core, which reads on most palettes.

### 1. Spotlight: dim + pulsing ring + tapping hand (for UI targets)

- **Dim:** four black Frames around the target's AbsolutePosition/AbsoluteSize rectangle plus 10 px padding, `BackgroundTransparency = 0.45`, `BorderSizePixel = 0`, updated every frame so it follows animated targets. The target is never covered.
- **Ring:** a Frame centered on the target, size = largest side + 20 px, `BackgroundTransparency = 1`, `UICorner.CornerRadius = UDim.new(1, 0)`, `UIStroke.Thickness = 4`, stroke color gold. Inside it a UIScale tweened 1 → 1.3 while the stroke's Transparency goes 0 → 1, 0.9 s Quad-Out, repeating forever. A second ring offset by 0.45 s makes a double pulse.
- **Hand:** a 64x64 ImageLabel (original hand art from Librarian), its holder pinned to the target's bottom-right corner; the hand itself tweens from offset (12, 12) to (0, 0) over 0.45 s Quad-InOut, reversing, forever: a tap motion. Appears after the hint delay (Config `HintHand`, default 10 s for world steps, 3 s for spotlight steps).
- **Life:** created when the step needs a UI tap; destroyed the instant the target's `Activated` fires or the step changes.
- **Coordinates:** match the spotlight ScreenGui's `IgnoreGuiInset` and `ScreenInsets` to the target's ScreenGui so AbsolutePosition values line up.

### 2. World pointer: beam + bobbing arrow + Highlight

- **Beam** from an Attachment on the HumanoidRootPart to an Attachment on the target: `Width0 = Width1 = 1`, `FaceCamera = true`, `LightEmission = 1`, `TextureMode = Wrap`, `TextureLength = 2`, `TextureSpeed = 1.5` (chevron/arrow texture), Color gold, Transparency 0.2. Beams render only under Workspace with both attachments in Workspace [16].
- **Arrow:** a BillboardGui on the target, `Size = UDim2.fromOffset(72, 72)` (constant on-screen size), `StudsOffset = (0, 4, 0)` above the target's top, `AlwaysOnTop = true`, `LightInfluence = 0`; ImageLabel arrow pointing down. Bob: tween StudsOffset Y 4 → 5 over 0.6 s Sine-InOut, reversing, forever.
- **Highlight** on the target: `DepthMode = AlwaysOnTop`, `FillColor` gold, `FillTransparency` pulsing 0.75 ↔ 0.5 at 0.6 s, `OutlineColor` white, `OutlineTransparency = 0` [13][14]. One only (Rule 21).
- **Ground ring (optional):** a flat neon cylinder (0.2 x 8 x 8 studs) under the target, transparency 0.5, rotating slowly, for targets players walk onto (sell pads, gates).

### 3. Chevron path (for long or turning routes)

- Compute the route with PathfindingService (`AgentRadius = 2`, `AgentHeight = 5`, `AgentCanJump = true`), keep a point every 4+ studs, raise points 0.2 studs above the floor.
- Chain Beams between consecutive Attachments on one invisible, anchored, non-colliding client Part in Workspace. Chevron texture, `TextureMode = Wrap`, `TextureLength = 3`, `TextureSpeed = 1.5`, width 1.5, LightEmission 1.
- Recompute when the player strays more than 12 studs from the path, at most once every 2 s.
- Fall back to the straight beam if the path fails.
- Hide the path within 10 studs of the target (the arrow and Highlight take over).

### 4. Off-screen edge arrow

- A 56x56 ImageLabel arrow (pointing right in the art) plus a small distance label, in a ScreenGui with `IgnoreGuiInset = true` so its coordinates match `WorldToViewportPoint`'s viewport coordinates.
- Each render step: if the target is on screen, hide; else take the vector from screen center to the projected point (negated when the point is behind the camera, `Z < 0`), intersect it with an inset box (56 px from the sides, 56 px + top inset from the top, and about 22% of the height above the bottom so it avoids the thumb controls), and set `Rotation = math.deg(math.atan2(dy, dx))`.
- Pulse its UIScale 1 → 1.1 at 0.5 s so it is noticed.

### 5. Objective tracker (the text backup)

- Top-center, below the Roblox top bar: 40x40 icon, 22-26 px bold text, counter, 6 px progress bar, rounded panel at 0.25 transparency.
- States: active, progress tick (bar tween 0.2 s + small pop), done (green flash + checkmark 0.5 s), hint wiggle (Rule 17), hidden (free play with the compass button).

### 6. Hint ladder (timed escalation)

| Seconds without progress on a step | Add |
|---|---|
| 0 | World pointer or spotlight ring; edge arrow if off-screen |
| 5 | Tracker wiggle |
| 10 | Tapping hand (UI) or brighter, wider beam (world) |
| 20 | 3-5 word helper bubble near the target |
| 40 | "Show me" button: 1.5 s camera glide to the target, or teleport for long routes |

Store the thresholds in Config and test them [2].

## Onboarding funnel analytics

**What Roblox gives you.** `AnalyticsService:LogOnboardingFunnelStepEvent(player, step, stepName?, customFields?)` for the one-time onboarding funnel, `LogFunnelStepEvent` for other funnels such as a shop flow, and `LogCustomEvent` for anything else [3][4]. Funnel rules from the docs [3]:
- Server only, and only in published experiences; events from Studio or the client are not recorded.
- Steps start at 1 and are limited to 1-100; each step number is unique within a funnel.
- Skipping step numbers marks the skipped steps as completed, which inflates them. Advance one step at a time.
- The step name is optional and shows in Roblox's charts.
- Custom fields only accept keys from `Enum.AnalyticsCustomFieldKeys`, with at most 8,000 unique value combinations across the three custom fields per experience.
- Up to ten funnel tabs can be added to the dashboard; a user's saved step expires after 180 days with no events for that funnel, after which a returning user counts as new.
- The docs' own example is a plant tycoon logging "In Farm" as step 1 and "Plant Seed" as step 2.

**The standard step list (8-10 steps):**

| Step | Name | Logged when (server) |
|---|---|---|
| 1 | Spawned | Character exists after first join |
| 2 | FirstAction | Server grants the first reward |
| 3 | FirstGoal | First counted goal complete |
| 4 | FirstCashIn | Server processes the first sale/deposit |
| 5 | FirstUpgrade | Server processes the first purchase |
| 6 | FeelUpgrade | Post-upgrade goal complete |
| 7 | StarterGift | Starter gift granted |
| 8 | NextGoal | Next-zone goal shown |
| 9 | FreePlay | Tutorial marked done |
| 10 | NextZone | Next zone unlocked (often in session 1, sometimes session 2); the zone handler logs it directly, once |

**Reading it.** Every percentage is relative to step 1, so step 1 must fire for everyone. Look for the largest step-to-step drop, not the lowest number. Targets (studio rules of thumb): steps 1→2 and 2→3 at 95%+, every later step 90%+, FreePlay reached by 75%+ of arrivals. Then look at D1 retention and session time for the same period in the dashboard [6], with the similar-experience benchmark bands [5]. Check D1 and D7 after each update [6].

**Timing.** Log `FTUEStepSeconds` as a custom event with the step name in `CustomField01` (code in "Luau"), and compare medians with the master script. A step that converts well but takes three times its target is the next fix.

**Segment by device.** Put the input type (Touch, Keyboard, Gamepad) in `CustomField02` on the funnel events. If phones convert much worse at one step, the problem is mobile layout ([[08 Mobile]]).

**Debugging in Studio.** Because funnel events do not record from Studio [3], wrap logging in a function that also prints `"[FTUE] step 4 FirstCashIn 27.3s"` when `RunService:IsStudio()` is true, so Playtest can verify order and timing locally.

## Examples from top games

### A short loop from the first minute
**Game:** Grow a Garden ([30][31][32])
**Shows:** Beginner guides describe buying seeds from the Seed Shop NPC, planting them in your plot, letting them grow automatically and selling the harvest at the merchant; guides place the Seed Shop beside the Sell Stuff booth. Seed stock is limited and refreshes every five minutes [30].
**Why it works:** buy, plant, sell is the whole loop and it is reachable in seconds; the restock gives a reason to stay a few more minutes.
**Steal:** keep the first loop's stations within a few seconds' walk, and add a short in-session refresh timer as a reason to keep playing.
**Avoid:** a refresh timer that leaves a new player with nothing to buy in minute one; guarantee the starter seed is always in stock.

### A free first hatch on entry
**Game:** Pet Simulator 99, Good vs Evil event ([35])
**Shows:** entering the event area through its doors required opening a special free Fate egg that gave one of two pets; breakables and eggs filled the arena, and earning enough coins cleared the first area.
**Why it works:** the first thing the player gets is a pet, the genre's core reward, before any grind.
**Steal:** make the first reward the genre's signature reward (pet, tool, car), free, as step 1 or 2.
**Avoid:** making the free gift a duplicate of something the player already owns; check inventory and give the other option.

### Tutorial quests that hand out the starter kit
**Game:** Pet Simulator 99 ([36])
**Shows:** a beginner guide tells new players to hold click on the nearest breakable to earn coins and to follow the tutorial quests, which give free pets and starter currency.
**Why it works:** the quests double as a guided path and a reward schedule; the player is paid for learning.
**Steal:** every tutorial step pays something visible.
**Avoid:** tutorial rewards so big they flatten the next hour's economy; Balance sizes them in the sim.

### Egg to pet before free play
**Game:** Adopt Me! ([37][38])
**Shows:** a guide describes a short tutorial for first-time players that walks them through getting an egg and hatching their first pet, after which they make their own way. The Task Board, refreshed every 24 hours, gives daily objectives and small rewards.
**Why it works:** the tutorial ends on ownership (a pet), the game's emotional center, and then gets out of the way.
**Steal:** end the tutorial on the gift and the release, not on a menu tour.
**Avoid:** opening the daily task board during the tutorial; it belongs to free play.

### The lobby as a funnel to the action
**Game:** DOORS ([33][34])
**Shows:** players spawn in a lobby with twelve elevators that start runs for 1-4 players; the lobby also holds a shop (knobs, revives), achievements and settings.
**Why it works:** the only big, obvious thing in the lobby is the way into a run, and joining with friends is the same action as starting.
**Steal:** for round-based games, make "start playing" the largest object in the spawn and let groups form by walking in together.
**Avoid:** a lobby so full of shops and boards that new players browse instead of starting.

### A short, replayable tutorial run
**Game:** Tower Defense Simulator ([39][40])
**Shows:** a fan wiki describes the tutorial as a three-wave run teaching placement, upgrades, targeting and the basic defense loop, reached from a Tutorial button or replayed from Settings, on a fixed map.
**Why it works:** strategy games have too many rules for an in-lobby tutorial; a tiny scripted match teaches all of them in context.
**Steal:** for match-based games, a 2-4 minute scripted first match with guaranteed victory; replayable from settings.
**Avoid:** forcing the tutorial on experienced players; detect and offer skip.

### A small concrete first quest
**Game:** Blox Fruits ([41][42])
**Shows:** players choose Pirates or Marines on joining, spawn on a team-specific starter island for levels 0-10, and the quest giver there offers a level 0 quest to defeat five bandits or five trainees.
**Why it works:** "defeat 5" is a clear count with nearby targets; the quest giver is the first pointer.
**Steal:** a first quest with a count of 3-5 and targets within sight of the quest giver.
**Avoid:** asking for a choice the player cannot understand yet; if you need one, make it reversible.

### Reversible early choices
**Game:** Blox Fruits ([41][43])
**Shows:** guides note the team choice is offered again on later joins and that the Marine Recruiter on the Pirate starter island lets players switch sides, with the character reset on switching.
**Why it works:** a new player can choose fast without fear of a permanent mistake.
**Steal:** any choice in minute one (team, class, starter pet) can be changed later at low cost.
**Avoid:** irreversible first-minute choices that lock content.

### The next place exists from the start
**Game:** Blox Fruits ([44])
**Shows:** the map guide lists the starter islands at levels 0-10 and the Jungle as the next area at 15-30, with a quest giver and a fruit dealer there.
**Why it works:** level bands tell the player what "next" means and when they are ready.
**Steal:** show the next zone and its requirement during the first five minutes (Rule 28).
**Avoid:** a requirement gap so large that the first session never reaches the next zone.

### A path that suggests, not forces
**Game:** Hello Kitty Cafe, as shown in Roblox's documentation ([2])
**Shows:** Roblox's onboarding techniques page uses Hello Kitty Cafe's directional path as an example of guidance that gives players freedom to explore while still giving direction; it strongly suggests an action but does not require it.
**Why it works:** players who want to explore can, and lost players always have a path to follow.
**Steal:** chevron paths along the floor instead of invisible walls or forced camera.
**Avoid:** paths that are so faint they disappear in bright scenes; test on a phone at low graphics.

### Where a tutorial lost players
**Game:** a survival-crafting game discussed on the DevForum ([20])
**Shows:** a developer asked why players left after about 30 seconds; a commenter said the GUI felt overwhelming on joining, and the developer described a steep drop between equipping a tool and crafting a workbench.
**Why it works (as a lesson):** the funnel pointed to one transition, and a fresh player named the cause.
**Steal:** use funnel steps to find the exact transition, then watch a fresh player at that spot.
**Avoid:** a crafting step in the first minute that needs reading a recipe panel; make the first craft one tap on a glowing button.

### The benchmark behind "play first"
**Game:** 26 leading mobile apps, reviewed by Liquid & Grit ([23])
**Shows:** the FTUE toolkit is based on playtesting the first six 15-minute sessions of 26 casual, core and casino apps and buying each app's first two starter offers; it found that successful FTUEs get players playing as quickly as possible.
**Why it works:** the same audience behavior (impatience, skimming) applies on Roblox, where the next game is one tap away.
**Steal:** count seconds to first input and first reward in every playtest.
**Avoid:** importing mobile-style long forced tutorials; take the speed lesson, not the hand-holding.

### Teaching tools tuned like features
**Game:** Roblox's own onboarding guidance ([1][2])
**Shows:** Roblox lists visual elements, contextual tutorials and timed hints as the main onboarding techniques, recommends in-world visuals over text pop-ups, and suggests tuning each with Configs and Experiments, for example testing a 5-s against a 10-s timed-hint delay.
**Why it works:** onboarding is a system with numbers, not a script written once.
**Steal:** every delay, count and price in the opening lives in Config and gets tested.
**Avoid:** testing several variables at once.

## By genre

Each entry gives the opening beats (targets from first control), the hook, the guaranteed win, the funnel steps and the main trap. Full genre playbooks are on the genre pages.

### Simulator
- **0-5 s:** spawn facing a cluster of breakables; beam on the nearest. **5-15 s:** break 5, counter rising. **15-30 s:** backpack fills, "Sell" pad lights. **30-90 s:** first tool upgrade, x2. **90-180 s:** free starter egg (Rare floor), pet follows. **180-300 s:** next-zone gate with price, free play.
- **Hook:** the top pet on a pedestal by the sell pad; other players' pets.
- **Guaranteed win:** starter egg table; first sale covers the upgrade.
- **Funnel:** Spawned, FirstHit, FirstGoal, FirstSell, FirstUpgrade, FeelUpgrade, StarterEgg, NextGoal, FreePlay. See [[Genre - Simulator]].
- **Trap:** opening the full pet inventory or the egg shop UI before the first sale.

### Tycoon
- **0-5 s:** spawn at a plot-claim gate; beam to the nearest free plot. **5-15 s:** step on "Claim", plot glows, first dropper button appears. **15-30 s:** buy the first dropper (free or priced at starting cash); parts drop. **30-60 s:** collect cash from the collector pad. **60-120 s:** buy 2-3 more buttons; each builds a visible piece with a build animation. **120-300 s:** first upgrader, then a wall/floor; the next big button (second floor) shows its price.
- **Hook:** a fully built demo tycoon next to the plots.
- **Guaranteed win:** first button costs exactly the starting cash.
- **Funnel:** Spawned, ClaimPlot, FirstDropper, FirstCollect, ThirdButton, FirstUpgrader, SecondFloorGoal, FreePlay. See [[Genre - Tycoon]].
- **Trap:** the next button hidden behind the player; make the next affordable button pulse and point at it.

### Obby
- **0-5 s:** spawn on stage 1 facing the first platform; the stage counter "1/50" visible. **5-15 s:** three easy jumps (4-6 stud gaps), checkpoint 2 with a chime. **15-60 s:** stages 2-5 introduce one new element each (moving platform, ladder, a slow kill brick with clear red color). **60-180 s:** first themed section; skip-stage and speed options shown only after the first death. **180-300 s:** the first "world" end with a reward (trail, title).
- **Hook:** a long view of the course rising into the sky; a finish banner visible from spawn.
- **Guaranteed win:** the first 3 stages cannot be failed (safety floor returns you to the pad).
- **Funnel:** Spawned, Stage2, Stage3, Stage5, Stage10, FirstWorldEnd. See [[Genre - Obby]].
- **Trap:** a difficulty spike in the first 10 stages; first deaths are the top quit point.

### Roleplay and life sim
- **0-5 s:** spawn in the town center facing the most important building (home, school, hospital); a beam to a house or job board. **5-30 s:** claim a house or pick a role with one tap; the house builds in. **30-90 s:** first vehicle or item spawned free from a nearby pad. **90-180 s:** first customization (one color, one item). **180-300 s:** free roam with a "Things to do" pointer list (3 items).
- **Hook:** a lively town with other players driving and acting; one fully decorated house open to look into.
- **Guaranteed win:** free house, free car, free outfit item in minute one.
- **Funnel:** Spawned, ClaimHouse, FirstVehicle, FirstCustomize, VisitPlace, FreePlay. See [[Genre - Roleplay and Life Sim]].
- **Trap:** a giant avatar editor before the player has done anything.

### Action and combat
- **0-5 s:** spawn with a weapon already equipped, facing a training dummy 15 studs away. **5-15 s:** first hits with big hit feedback (hit flash, sound, number). **15-45 s:** one ability with a button and a cooldown ring. **45-120 s:** first weak enemy pack (25% damage) and first loot drop. **120-300 s:** first quest from an NPC with a count of 3-5, next area in view.
- **Hook:** a boss silhouette or a high-level player using a flashy ability.
- **Guaranteed win:** dummy cannot fight back; first enemies scaled down.
- **Funnel:** Spawned, FirstHit, FirstAbility, FirstKill, FirstLoot, FirstQuestDone, FreePlay. See [[Genre - Action and Combat]].
- **Trap:** spawning new players among high-level PvP players.

### Battlegrounds
- **0-5 s:** spawn in a safe zone with the default moveset; a dummy or practice bot. **5-30 s:** M1 combo on the dummy with the combo counter. **30-60 s:** each special move (3-4) introduced by its button glowing in turn. **60-180 s:** leave the safe zone; first fight against a bot or a matched low-level player. **180-300 s:** first kill, kill streak counter, the character/moveset select teased.
- **Hook:** high-impact VFX on the first special move; seeing strong players fight in the arena.
- **Guaranteed win:** practice bots that lose; a short spawn protection on first entering the arena.
- **Funnel:** Spawned, FirstCombo, AllMovesUsed, EnterArena, FirstKill, FreePlay. See [[Genre - Battlegrounds]].
- **Trap:** getting combo-locked to death by veterans in the first minute.

### Survival
- **0-5 s:** spawn by a campfire or base with the day just starting; beam to the first resource. **5-20 s:** gather 3 wood with a basic tool. **20-60 s:** craft the first item by one tap on a glowing recipe (no recipe panel reading). **60-150 s:** place a structure; first night warning appears with a timer. **150-300 s:** survive the first (weak) night or wave.
- **Hook:** a glimpse of a big built base or a dangerous creature at the treeline.
- **Guaranteed win:** first night is gentle; resources clustered around spawn.
- **Funnel:** Spawned, FirstGather, FirstCraft, FirstBuild, FirstNight, FreePlay. See [[Genre - Survival]]. The DevForum case above lost players exactly at the craft step [20].
- **Trap:** a complex crafting UI before the player has gathered anything.

### Horror
- **0-5 s:** spawn in a lobby or safe room with an obvious "start" (elevator, door, bus); friends can join the same start. **5-30 s:** enter; the first area is safe, lit and atmospheric. **30-90 s:** the first interaction (flashlight, key, drawer) taught with a ProximityPrompt. **90-180 s:** the first scare, telegraphed and survivable. **180-300 s:** the first door/room progression and a death that teaches the monster's rule.
- **Hook:** sound and a silhouette before any danger; DOORS' lobby elevators make the start obvious [34].
- **Guaranteed win:** the first scare cannot kill; the first death (if any) comes with a clear hint of the rule.
- **Funnel:** Spawned, EnterRun, FirstInteract, FirstScare, Room5, FirstRunEnd. See [[Genre - Horror]].
- **Trap:** a dark, silent opening where nothing happens for a minute; tension needs early signals.

### Tower defense
- **0-5 s:** lobby spawn facing the "Play" elevator/portal and a "Tutorial" sign. **5-30 s:** the tutorial match loads; the map's path is shown with chevrons. **30-90 s:** place the first tower on a highlighted spot; wave 1 is easy. **90-180 s:** upgrade a tower; change targeting. **180-300 s:** win the scripted match; earn currency; return to lobby with the summon/shop unlocked.
- **Hook:** a high-tier tower on display in the lobby; the boss of the first map previewed.
- **Guaranteed win:** waves scaled down in the first match; Tower Defense Simulator's tutorial is a three-wave run [39].
- **Funnel:** Spawned, EnterMatch, FirstPlace, FirstUpgrade, Wave3, FirstWin, FirstSummon. See [[Genre - Tower Defense]].
- **Trap:** a first match with 30 waves; new players leave mid-match.

### RNG and collection
- **0-5 s:** spawn facing the Roll button (big, center-bottom) and a pedestal with the rarest item. **5-10 s:** first roll with a full reveal. **10-60 s:** 3-5 more rolls with fast reveals; a guaranteed "Rare" on roll 3 from a free starter table. **60-120 s:** equip the best result; it shows on the avatar. **120-300 s:** index opens with silhouettes; first luck upgrade bought with roll currency; auto-roll unlocked.
- **Hook:** a server message when someone rolls a 1-in-1,000,000; the rarest aura on the pedestal.
- **Guaranteed win:** free starter rolls with a Rare floor on roll 3 ([[03 Rarity and RNG]]).
- **Funnel:** Spawned, FirstRoll, ThirdRoll, FirstEquip, FirstIndex, FirstLuckUpgrade, AutoRoll. See [[Genre - RNG and Collection]].
- **Trap:** a 6-second reveal on every common; speed up repeats.

### Shooter
- **0-5 s:** spawn in a shooting range or safe warm-up area with a default weapon. **5-20 s:** shoot 3 targets; hit markers and sounds. **20-60 s:** reload, aim (mobile auto-fire option), one ability or grenade. **60-180 s:** first match against bots or a beginner queue. **180-300 s:** first kill and match end; the loadout and first unlock shown.
- **Hook:** a kill-cam or a showcase of a rare weapon skin in the lobby.
- **Guaranteed win:** bots in the first match; generous aim assist on touch.
- **Funnel:** Spawned, RangeDone, EnterMatch, FirstKill, MatchEnd, FirstUnlock. See [[Genre - Shooter]].
- **Trap:** putting new players straight into a full-skill lobby.

### Racing and vehicles
- **0-5 s:** spawn next to a car with a glowing "Drive" prompt. **5-15 s:** one tap enters, throttle is automatic or one button on mobile. **15-60 s:** a short, wide first track or route with boost pads and a checkpoint arch every 10 s. **60-180 s:** first race against bots that finish just behind the player. **180-300 s:** first cash reward; the next car shown with its price.
- **Hook:** a fast car blasting past on the first straight; a showroom car at spawn.
- **Guaranteed win:** rubber-banded bots in race 1.
- **Funnel:** Spawned, EnterCar, FirstCheckpoint, FirstRaceDone, FirstPurchase. See [[Genre - Racing and Vehicles]].
- **Trap:** realistic handling on the first drive; make the first car forgiving.

### Sports
- **0-5 s:** spawn on the pitch/court in a practice area with the ball nearby. **5-20 s:** the core shot or pass, with an aim indicator. **20-60 s:** score into an open goal or hoop. **60-180 s:** a short match vs bots or a 2-minute quick game. **180-300 s:** first win/score celebration; ranks and kits teased.
- **Hook:** a highlight replay of a great goal by another player; a stadium full of players.
- **Guaranteed win:** the first shot has a wide window; the first match is vs easy bots.
- **Funnel:** Spawned, FirstShot, FirstScore, MatchStart, MatchEnd, FreePlay. See [[Genre - Sports]].
- **Trap:** waiting for a full team before the first touch of the ball.

### Party and social hangout
- **0-5 s:** spawn in a bright hub with other players visible and the next round's countdown. **5-30 s:** a tiny solo activity while waiting (bounce pad, emote button glowing). **30-60 s:** the round starts; its single rule shown as one icon + 3 words. **60-180 s:** the first round ends with points for everyone (participation reward). **180-300 s:** the second round; the cosmetic shop and emotes unlocked.
- **Hook:** other players being funny; a winner's crown on the podium.
- **Guaranteed win:** everyone earns something in round one.
- **Funnel:** Spawned, FirstEmote, FirstRound, FirstRoundEnd, SecondRound. See [[Genre - Party and Social Hangout]].
- **Trap:** a long wait for players; keep a mini-activity in the hub.

### Story and puzzle
- **0-5 s:** spawn in the first room with one obvious interactable lit. **5-30 s:** the first interaction triggers the story hook (a short line of dialogue, ≤8 words per bubble). **30-90 s:** first puzzle with one rule and an obvious answer. **90-180 s:** second puzzle combining that rule with one new one. **180-300 s:** the first chapter beat and a cliffhanger to the next room.
- **Hook:** a mystery shown in the first 20 s (a locked door, a strange sound, a character who vanishes).
- **Guaranteed win:** the first puzzle cannot be failed; hints escalate at 20/40/60 s.
- **Funnel:** Spawned, FirstInteract, Puzzle1, Puzzle2, Chapter1End. See [[Genre - Story and Puzzle]].
- **Trap:** long dialogue at the start; let the player act first.

### Farming and fishing
- **0-5 s:** spawn by your plot or dock with a starter seed or rod already equipped; beam to the first spot. **5-20 s:** plant or cast with one tap. **20-45 s:** first harvest or catch, sped up for the tutorial (first crop grows in 10 s; first bite within 5 s). **45-90 s:** sell at the stand nearby. **90-180 s:** buy the second seed type or a better rod. **180-300 s:** a passive or multi-harvest crop starts producing; the next tier of seeds/locations shown. Grow a Garden guides note multi-harvest crops regrow automatically, while single-harvest ones die after one harvest [30][31].
- **Hook:** a rare glowing crop or giant fish on display; a mutation shown on someone else's crop.
- **Guaranteed win:** the first crop or catch is fast and sells for enough to buy the next seed.
- **Funnel:** Spawned, FirstPlant, FirstHarvest, FirstSell, FirstBuy, FirstMultiHarvest, FreePlay. See [[Genre - Farming and Fishing]].
- **Trap:** a real-time first growth timer of minutes; the first crop must be fast.

## Luau

All snippets use modern Luau: the `task` library, `--!strict` where practical, `Instance.new` with `Parent` set last, and the server deciding anything that matters. Replace every `rbxassetid://0` with the studio's own uploaded asset.

### Shared step table

```lua
--!strict
-- ReplicatedStorage/Shared/TutorialSteps.lua (ModuleScript). Read by the server and the client.
export type Step = {
	Id: string,          -- also the funnel step name
	Text: string,        -- objective text, 6 words or fewer
	Target: string?,     -- name of a part/model in Workspace.Tutorial
	UiTarget: string?,   -- path under PlayerGui, e.g. "UpgradePanel/Buy"
	Count: number?,      -- how many progress ticks complete the step (default 1)
	Reward: number?,     -- soft currency granted on completion
}

local Steps: {Step} = {
	{ Id = "Spawned",      Text = "" },
	{ Id = "FirstHit",     Text = "Break the crystal",   Target = "Crystal1" },
	{ Id = "FirstGoal",    Text = "Break crystals",      Target = "CrystalField", Count = 5 },
	{ Id = "FirstSell",    Text = "Sell your gems",      Target = "SellPad" },
	{ Id = "FirstUpgrade", Text = "Buy Pickaxe 2",       Target = "UpgradeStand", UiTarget = "UpgradePanel/Buy" },
	{ Id = "FeelUpgrade",  Text = "Break crystals",      Target = "CrystalField", Count = 10, Reward = 50 },
	{ Id = "StarterGift",  Text = "Open your free egg",  Target = "StarterEgg", UiTarget = "EggPanel/Open" },
	{ Id = "NextGoal",     Text = "Unlock the Cave",     Target = "CaveGate" },
	{ Id = "FreePlay",     Text = "" },
}

return table.freeze(Steps)
```

### Server: tutorial controller with funnel and timing

```lua
--!strict
-- ServerScriptService/Tutorial.lua (ModuleScript). Your data module calls Tutorial.start(player, data) after loading.
local AnalyticsService = game:GetService("AnalyticsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Steps = require(ReplicatedStorage.Shared.TutorialSteps)

type TutorialData = { Step: number, Progress: number }
type PlayerData = { Tutorial: TutorialData, Coins: number }

local Tutorial = {}
local dataOf: {[Player]: PlayerData} = {}
local startedAt: {[Player]: number} = {}

local function logStep(player: Player, index: number)
	local step = Steps[index]
	local seconds = os.clock() - (startedAt[player] or os.clock())
	if RunService:IsStudio() then
		print(string.format("[FTUE] step %d %s %.1fs", index, step.Id, seconds)) -- funnels don't record in Studio
		return
	end
	AnalyticsService:LogOnboardingFunnelStepEvent(player, index, step.Id)
	AnalyticsService:LogCustomEvent(player, "FTUEStepSeconds", seconds, {
		[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = step.Id,
	})
end

local function publish(player: Player, data: PlayerData)
	local done = data.Tutorial.Step >= #Steps
	player:SetAttribute("TutorialDone", done)
	player:SetAttribute("TutorialStep", if done then #Steps else data.Tutorial.Step + 1) -- the step being worked on
	player:SetAttribute("TutorialProgress", data.Tutorial.Progress)
end

local function complete(player: Player, data: PlayerData, index: number)
	data.Tutorial.Step = index
	data.Tutorial.Progress = 0
	local reward = Steps[index].Reward
	if reward then
		data.Coins += reward -- also log it with LogEconomyEvent (see 04 Progression and Economy)
	end
	logStep(player, index)
	publish(player, data)
end

function Tutorial.start(player: Player, data: PlayerData)
	dataOf[player] = data
	startedAt[player] = os.clock()
	publish(player, data) -- returning, resuming or brand-new player
	if data.Tutorial.Step == 0 then
		task.spawn(function()
			if not player.Character then player.CharacterAdded:Wait() end
			if dataOf[player] == data and data.Tutorial.Step == 0 then
				complete(player, data, 1) -- step 1 "Spawned" fires for everyone who arrives
			end
		end)
	end
end

-- Called by server systems only, after the server has validated and granted the action.
function Tutorial.progress(player: Player, stepId: string, amount: number?)
	local data = dataOf[player]
	if not data or data.Tutorial.Step >= #Steps then return end
	local index = data.Tutorial.Step + 1
	local step = Steps[index]
	if step.Id ~= stepId then return end -- only the current step can advance; never skip numbers
	data.Tutorial.Progress += amount or 1
	if data.Tutorial.Progress >= (step.Count or 1) then
		complete(player, data, index)
		if Steps[index + 1] and Steps[index + 1].Id == "FreePlay" then
			complete(player, data, index + 1) -- the release step has no action of its own
		end
	else
		publish(player, data)
	end
end

-- Skip: runs the remaining steps in order so rewards and funnel order stay exact.
function Tutorial.skip(player: Player)
	local data = dataOf[player]
	if not data or data.Tutorial.Step < 2 then return end -- offered from step 3 on
	if not RunService:IsStudio() then
		AnalyticsService:LogCustomEvent(player, "TutorialSkipped", data.Tutorial.Step)
	end
	for index = data.Tutorial.Step + 1, #Steps do
		complete(player, data, index)
	end
end

function Tutorial.stop(player: Player)
	dataOf[player] = nil
	startedAt[player] = nil
end

return Tutorial
```

Wire it from game systems, never from a client remote that says "I did it":

```lua
-- inside the server's mining handler, after validation and granting the reward
Tutorial.progress(player, "FirstHit")
Tutorial.progress(player, "FirstGoal")
Tutorial.progress(player, "FeelUpgrade")
-- inside the sell handler: Tutorial.progress(player, "FirstSell")
-- inside the purchase handler for Pickaxe 2: Tutorial.progress(player, "FirstUpgrade")
-- inside the starter egg handler: Tutorial.progress(player, "StarterGift")
-- when the Cave goal is shown: Tutorial.progress(player, "NextGoal")
-- the skip button's remote: Remotes.SkipTutorial.OnServerEvent:Connect(Tutorial.skip)
```

Only the current step accepts progress, so calling all three mining ids from one handler is safe: whichever is current advances.

### Server: face the first objective on spawn

```lua
-- ServerScriptService/FaceObjective.server.lua
local Players = game:GetService("Players")
local tutorialFolder = workspace:WaitForChild("Tutorial")

local function facePoint(character: Model, point: Vector3)
	local root = character:WaitForChild("HumanoidRootPart") :: BasePart
	local flat = Vector3.new(point.X, root.Position.Y, point.Z)
	if (flat - root.Position).Magnitude > 0.1 then
		character:PivotTo(CFrame.lookAt(root.Position, flat))
	end
end

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		if player:GetAttribute("TutorialDone") then return end
		if not character:IsDescendantOf(workspace) then character.AncestryChanged:Wait() end
		task.wait() -- let spawn positioning finish
		local target = tutorialFolder:FindFirstChild("Crystal1")
		if target and target:IsA("BasePart") then
			facePoint(character, target.Position)
		end
	end)
end)
```

### Client: loading screen (ReplicatedFirst)

```lua
--!strict
-- ReplicatedFirst/Loading.client.lua (LocalScript)
local ReplicatedFirst = game:GetService("ReplicatedFirst")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local ContentProvider = game:GetService("ContentProvider")
local TweenService = game:GetService("TweenService")

local MIN_SECONDS, SKIP_AFTER, MAX_SECONDS = 1.5, 3, 8

local function make(className: string, props: {[string]: any}, parent: Instance?): any
	local inst = Instance.new(className)
	for key, value in props do
		(inst :: any)[key] = value
	end
	inst.Parent = parent -- parent last
	return inst
end

local playerGui = Players.LocalPlayer:WaitForChild("PlayerGui")
local gui = make("ScreenGui", { Name = "Loading", IgnoreGuiInset = true, ResetOnSpawn = false, DisplayOrder = 100 })
local root = make("CanvasGroup", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.fromRGB(24, 28, 48) }, gui)
make("ImageLabel", {
	AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.42), Size = UDim2.fromScale(0.4, 0.4),
	BackgroundTransparency = 1, ScaleType = Enum.ScaleType.Fit, Image = "rbxassetid://0", -- the game logo
}, root)
local barBack = make("Frame", {
	AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.72), Size = UDim2.new(0.5, 0, 0, 12),
	BackgroundColor3 = Color3.fromRGB(60, 66, 96), BorderSizePixel = 0,
}, root)
make("UICorner", { CornerRadius = UDim.new(1, 0) }, barBack)
local fill = make("Frame", { Size = UDim2.fromScale(0, 1), BackgroundColor3 = Color3.fromRGB(255, 214, 64), BorderSizePixel = 0 }, barBack)
make("UICorner", { CornerRadius = UDim.new(1, 0) }, fill)
local skip = make("TextButton", {
	AnchorPoint = Vector2.new(1, 1), Position = UDim2.new(1, -24, 1, -24), Size = UDim2.fromOffset(140, 48),
	Text = "Skip", Font = Enum.Font.GothamBold, TextSize = 22, TextColor3 = Color3.new(1, 1, 1),
	BackgroundColor3 = Color3.fromRGB(60, 66, 96), Visible = false,
}, root)
make("UICorner", { CornerRadius = UDim.new(0, 12) }, skip)

local finished = false
local function setProgress(alpha: number)
	TweenService:Create(fill, TweenInfo.new(0.15), { Size = UDim2.fromScale(math.clamp(alpha, 0, 1), 1) }):Play()
end
local function finish()
	if finished then return end
	finished = true
	local fade = TweenService:Create(root, TweenInfo.new(0.35), { GroupTransparency = 1 })
	fade:Play()
	fade.Completed:Wait()
	gui:Destroy()
end

gui.Parent = playerGui
ReplicatedFirst:RemoveDefaultLoadingScreen()
local started = os.clock()
task.delay(SKIP_AFTER, function() if not finished then skip.Visible = true end end)
task.delay(MAX_SECONDS, finish)
skip.Activated:Connect(finish)

if not game:IsLoaded() then game.Loaded:Wait() end
setProgress(0.4)

-- Preload a short list, one instance at a time, so the bar is honest.
local list: {Instance} = {}
local hud = playerGui:WaitForChild("HUD", 5)
if hud then table.insert(list, hud) end
local startArea = workspace:WaitForChild("StartArea", 5)
if startArea then table.insert(list, startArea) end
local preload = ReplicatedStorage:WaitForChild("Preload", 5)
if preload then
	for _, child in preload:GetChildren() do table.insert(list, child) end
end
for i, inst in list do
	if finished then break end
	pcall(ContentProvider.PreloadAsync, ContentProvider, { inst })
	setProgress(0.4 + 0.6 * i / #list)
end

local elapsed = os.clock() - started
if elapsed < MIN_SECONDS then task.wait(MIN_SECONDS - elapsed) end
finish()
```

### Client: world pointer (beam + arrow + Highlight), rebuilt on respawn

```lua
--!strict
-- StarterPlayerScripts/TutorialGuide.client.lua (LocalScript)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Steps = require(ReplicatedStorage.Shared.TutorialSteps)
local player = Players.LocalPlayer
local folder = workspace:WaitForChild("Tutorial")

local GOLD = Color3.fromRGB(255, 214, 64)
local ARROW_IMAGE = "rbxassetid://0"   -- downward arrow
local BEAM_TEXTURE = "rbxassetid://0"  -- chevron strip
local BOB = TweenInfo.new(0.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)

local live: {Instance} = {}
local tweens: {Tween} = {}
local drawToken = 0

local function clear()
	for _, t in tweens do t:Cancel() end
	table.clear(tweens)
	for _, inst in live do inst:Destroy() end
	table.clear(live)
end

local function basePartOf(inst: Instance): BasePart?
	if inst:IsA("BasePart") then return inst end
	if inst:IsA("Model") then return inst.PrimaryPart or inst:FindFirstChildWhichIsA("BasePart", true) end
	return nil
end

local function play(inst: Instance, info: TweenInfo, goal: {[string]: any})
	local t = TweenService:Create(inst, info, goal)
	t:Play()
	table.insert(tweens, t)
end

local function draw()
	drawToken += 1
	local token = drawToken
	clear()
	if player:GetAttribute("TutorialDone") then return end
	local index = player:GetAttribute("TutorialStep") :: number?
	local step = if index then Steps[index] else nil
	local targetName = step and step.Target
	if not targetName then return end

	local target = folder:WaitForChild(targetName, 10) -- may still be streaming in
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if token ~= drawToken or not target or not root then return end -- a newer draw started, or nothing to point at
	local part = basePartOf(target)
	if not part then return end

	local a0 = Instance.new("Attachment")
	a0.Parent = root
	local a1 = Instance.new("Attachment")
	a1.Parent = part

	local beam = Instance.new("Beam")
	beam.Attachment0, beam.Attachment1 = a0, a1
	beam.Texture = BEAM_TEXTURE
	beam.TextureMode = Enum.TextureMode.Wrap
	beam.TextureLength, beam.TextureSpeed = 2, 1.5
	beam.Width0, beam.Width1 = 1, 1
	beam.FaceCamera, beam.LightEmission = true, 1
	beam.Color = ColorSequence.new(GOLD)
	beam.Transparency = NumberSequence.new(0.2)
	beam.Parent = root

	local highlight = Instance.new("Highlight")
	highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
	highlight.FillColor, highlight.FillTransparency = GOLD, 0.75
	highlight.OutlineColor, highlight.OutlineTransparency = Color3.new(1, 1, 1), 0
	highlight.Parent = target -- with no Adornee, a Highlight adorns its parent
	play(highlight, BOB, { FillTransparency = 0.5 })

	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.fromOffset(72, 72)
	billboard.StudsOffset = Vector3.new(0, part.Size.Y / 2 + 3, 0)
	billboard.AlwaysOnTop, billboard.LightInfluence = true, 0
	local arrow = Instance.new("ImageLabel")
	arrow.Size = UDim2.fromScale(1, 1)
	arrow.BackgroundTransparency = 1
	arrow.Image = ARROW_IMAGE
	arrow.ImageColor3 = GOLD
	arrow.Parent = billboard
	billboard.Parent = part
	play(billboard, BOB, { StudsOffset = billboard.StudsOffset + Vector3.new(0, 1, 0) })

	for _, inst in { beam, highlight, billboard, a0, a1 } :: {Instance} do
		table.insert(live, inst)
	end
end

player:GetAttributeChangedSignal("TutorialStep"):Connect(function() task.spawn(draw) end)
player:GetAttributeChangedSignal("TutorialDone"):Connect(function() task.spawn(draw) end)
player.CharacterAdded:Connect(function(character)
	character:WaitForChild("HumanoidRootPart")
	task.spawn(draw)
end)
if player.Character then task.spawn(draw) end
```

### Client: spotlight (dim + pulsing ring + tapping hand) for UI targets

```lua
--!strict
-- ReplicatedStorage/Shared/Spotlight.lua (ModuleScript, used by client scripts)
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Spotlight = {}
local HAND_IMAGE = "rbxassetid://0"
local GOLD = Color3.fromRGB(255, 214, 64)

local current: {gui: ScreenGui, conns: {RBXScriptConnection}, tweens: {Tween}}? = nil

function Spotlight.hide()
	if not current then return end
	for _, c in current.conns do c:Disconnect() end
	for _, t in current.tweens do t:Cancel() end
	current.gui:Destroy()
	current = nil
end

function Spotlight.show(target: GuiObject, handDelay: number?, padding: number?)
	Spotlight.hide()
	local pad = padding or 10
	local targetScreen = target:FindFirstAncestorWhichIsA("ScreenGui")

	local gui = Instance.new("ScreenGui")
	gui.Name = "Spotlight"
	gui.ResetOnSpawn = false
	gui.DisplayOrder = 50
	if targetScreen then -- same origin as the target so AbsolutePosition lines up
		gui.IgnoreGuiInset = targetScreen.IgnoreGuiInset
		gui.ScreenInsets = targetScreen.ScreenInsets
		gui.DisplayOrder = targetScreen.DisplayOrder + 1
	end

	local panels: {Frame} = {}
	for i = 1, 4 do
		local f = Instance.new("Frame")
		f.BackgroundColor3 = Color3.new(0, 0, 0)
		f.BackgroundTransparency = 0.45
		f.BorderSizePixel = 0
		f.Parent = gui
		panels[i] = f
	end

	local ring = Instance.new("Frame")
	ring.AnchorPoint = Vector2.new(0.5, 0.5)
	ring.BackgroundTransparency = 1
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(1, 0)
	corner.Parent = ring
	local stroke = Instance.new("UIStroke")
	stroke.Thickness, stroke.Color = 4, GOLD
	stroke.Parent = ring
	local ringScale = Instance.new("UIScale")
	ringScale.Parent = ring
	ring.Parent = gui

	local handHolder = Instance.new("Frame")
	handHolder.BackgroundTransparency = 1
	handHolder.Size = UDim2.fromOffset(64, 64)
	handHolder.Visible = false
	local hand = Instance.new("ImageLabel")
	hand.BackgroundTransparency = 1
	hand.Size = UDim2.fromScale(1, 1)
	hand.Position = UDim2.fromOffset(12, 12)
	hand.Image = HAND_IMAGE
	hand.Parent = handHolder
	handHolder.Parent = gui

	local function layout()
		local view = gui.AbsoluteSize
		local p, s = target.AbsolutePosition, target.AbsoluteSize
		local x0, y0 = math.max(p.X - pad, 0), math.max(p.Y - pad, 0)
		local x1, y1 = math.min(p.X + s.X + pad, view.X), math.min(p.Y + s.Y + pad, view.Y)
		panels[1].Position, panels[1].Size = UDim2.fromOffset(0, 0), UDim2.fromOffset(view.X, y0)               -- top
		panels[2].Position, panels[2].Size = UDim2.fromOffset(0, y1), UDim2.fromOffset(view.X, view.Y - y1)     -- bottom
		panels[3].Position, panels[3].Size = UDim2.fromOffset(0, y0), UDim2.fromOffset(x0, y1 - y0)             -- left
		panels[4].Position, panels[4].Size = UDim2.fromOffset(x1, y0), UDim2.fromOffset(view.X - x1, y1 - y0)   -- right
		local side = math.max(s.X, s.Y) + pad * 2
		ring.Position = UDim2.fromOffset(p.X + s.X / 2, p.Y + s.Y / 2)
		ring.Size = UDim2.fromOffset(side, side)
		handHolder.Position = UDim2.fromOffset(p.X + s.X - 24, p.Y + s.Y - 24)
	end

	local tweens: {Tween} = {
		TweenService:Create(ringScale, TweenInfo.new(0.9, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, -1), { Scale = 1.3 }),
		TweenService:Create(stroke, TweenInfo.new(0.9, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, -1), { Transparency = 1 }),
		TweenService:Create(hand, TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut, -1, true), { Position = UDim2.fromOffset(0, 0) }),
	}
	for _, t in tweens do t:Play() end

	local conns: {RBXScriptConnection} = { RunService.RenderStepped:Connect(layout) }
	if target:IsA("GuiButton") then
		table.insert(conns, target.Activated:Connect(Spotlight.hide))
	end
	table.insert(conns, target.AncestryChanged:Connect(function()
		if not target:IsDescendantOf(game) then Spotlight.hide() end
	end))

	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
	layout()
	current = { gui = gui, conns = conns, tweens = tweens }
	task.delay(handDelay or 3, function()
		if current and current.gui == gui then handHolder.Visible = true end
	end)
end

return Spotlight
```

Test that taps outside the cut-out behave the way the step intends on a phone profile in the Device Simulator [17]; the target itself is never covered, so it always receives the tap.

### Client: off-screen edge arrow

```lua
--!strict
-- StarterPlayerScripts/EdgeArrow.client.lua (LocalScript). Call setTarget(part) from the guide; nil hides it.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local GuiService = game:GetService("GuiService")

local MARGIN = 56
local BOTTOM_KEEP_OUT = 0.22 -- fraction of screen height kept clear for thumbstick and jump
local player = Players.LocalPlayer

local gui = Instance.new("ScreenGui")
gui.Name = "EdgeArrow"
gui.IgnoreGuiInset = true -- matches WorldToViewportPoint's viewport coordinates
gui.ResetOnSpawn = false
local holder = Instance.new("Frame") -- unrotated; positions both the arrow and the label
holder.AnchorPoint = Vector2.new(0.5, 0.5)
holder.Size = UDim2.fromOffset(56, 56)
holder.BackgroundTransparency = 1
holder.Visible = false
local arrow = Instance.new("ImageLabel")
arrow.Size = UDim2.fromScale(1, 1)
arrow.BackgroundTransparency = 1
arrow.Image = "rbxassetid://0" -- arrow pointing RIGHT in the art
arrow.Parent = holder
local label = Instance.new("TextLabel")
label.AnchorPoint = Vector2.new(0.5, 0)
label.Position = UDim2.new(0.5, 0, 1, 2)
label.Size = UDim2.fromOffset(80, 20)
label.BackgroundTransparency = 1
label.Font = Enum.Font.GothamBold
label.TextSize = 16
label.TextColor3 = Color3.new(1, 1, 1)
label.TextStrokeTransparency = 0.4
label.Parent = holder
holder.Parent = gui
gui.Parent = player:WaitForChild("PlayerGui")

local target: BasePart? = nil
local function setTarget(part: BasePart?) target = part end

RunService:BindToRenderStep("TutorialEdgeArrow", Enum.RenderPriority.Camera.Value + 1, function()
	local camera = workspace.CurrentCamera
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
	local part = target
	if not camera or not root or not part or not part:IsDescendantOf(workspace) then
		holder.Visible = false
		return
	end
	local point, onScreen = camera:WorldToViewportPoint(part.Position)
	if onScreen then
		holder.Visible = false
		return
	end
	local view = camera.ViewportSize
	local center = view / 2
	local dir = Vector2.new(point.X, point.Y) - center
	if point.Z < 0 then dir = -dir end -- behind the camera the projection is mirrored
	if dir.Magnitude < 1e-3 then dir = Vector2.new(0, 1) end

	local inset = GuiService:GetGuiInset()
	local minX, maxX = MARGIN, view.X - MARGIN
	local minY, maxY = MARGIN + inset.Y, view.Y * (1 - BOTTOM_KEEP_OUT)
	local tx = if dir.X > 0 then (maxX - center.X) / dir.X elseif dir.X < 0 then (minX - center.X) / dir.X else math.huge
	local ty = if dir.Y > 0 then (maxY - center.Y) / dir.Y elseif dir.Y < 0 then (minY - center.Y) / dir.Y else math.huge
	local pos = center + dir * math.min(tx, ty)

	holder.Position = UDim2.fromOffset(pos.X, pos.Y)
	arrow.Rotation = math.deg(math.atan2(dir.Y, dir.X)) -- only the image rotates; the number stays upright
	label.Text = tostring(math.floor((part.Position - root.Position).Magnitude))
	holder.Visible = true
end)

-- Expose setTarget to the guide, e.g. through a BindableFunction or by making this a ModuleScript.
```

### Client: chevron path along the walkable route

```lua
--!strict
-- ReplicatedStorage/Shared/ChevronPath.lua (ModuleScript, client use)
local PathfindingService = game:GetService("PathfindingService")

local ChevronPath = {}
local CHEVRON = "rbxassetid://0" -- white ">" chevrons on transparent, tiling horizontally
local GOLD = Color3.fromRGB(255, 214, 64)
local current: Part? = nil

function ChevronPath.clear()
	if current then current:Destroy() end
	current = nil
end

function ChevronPath.show(from: Vector3, to: Vector3)
	ChevronPath.clear()
	local path = PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = true })
	local points: {Vector3} = {}
	local ok = pcall(function() path:ComputeAsync(from, to) end)
	if ok and path.Status == Enum.PathStatus.Success then
		for _, waypoint in path:GetWaypoints() do
			local last = points[#points]
			if not last or (waypoint.Position - last).Magnitude >= 4 then
				table.insert(points, waypoint.Position)
			end
		end
	end
	if #points < 2 then points = { from, to } end -- fallback: straight line

	local anchor = Instance.new("Part") -- client-only holder at the world origin
	anchor.Anchored, anchor.CanCollide, anchor.CanQuery, anchor.CanTouch = true, false, false, false
	anchor.Transparency = 1
	anchor.Size = Vector3.new(0.2, 0.2, 0.2)
	anchor.CFrame = CFrame.identity -- so Attachment.Position equals world position

	local prev: Attachment? = nil
	for _, p in points do
		local att = Instance.new("Attachment")
		att.Position = p + Vector3.new(0, 0.2, 0)
		att.Parent = anchor
		if prev then
			local beam = Instance.new("Beam")
			beam.Attachment0, beam.Attachment1 = prev, att
			beam.Texture = CHEVRON
			beam.TextureMode = Enum.TextureMode.Wrap
			beam.TextureLength, beam.TextureSpeed = 3, 1.5
			beam.Width0, beam.Width1 = 1.5, 1.5
			beam.FaceCamera, beam.LightEmission = true, 1
			beam.Color = ColorSequence.new(GOLD)
			beam.Parent = anchor
		end
		prev = att
	end
	anchor.Parent = workspace -- Beams render only under Workspace
	current = anchor
end

return ChevronPath
```

If you want the chevrons flat on the floor instead of facing the camera, set `FaceCamera = false` and rotate the attachments until the strip lies flat; check it in a playtest. Recompute the path when the player strays more than 12 studs, at most every 2 s.

### Client: hint ladder timer

```lua
--!strict
-- Inside the guide: escalate help while a step makes no progress. Delays come from Config.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local player = Players.LocalPlayer

local level, idle = 0, 0
local function onLevel(newLevel: number)
	-- 1 = wiggle tracker, 2 = hand / brighter beam, 3 = helper bubble, 4 = "Show me" button
end

local function reset() idle, level = 0, 0 end
player:GetAttributeChangedSignal("TutorialStep"):Connect(reset)
player:GetAttributeChangedSignal("TutorialProgress"):Connect(reset)

task.spawn(function()
	local t = Config.Tutorial
	local thresholds = { t.HintWiggle, t.HintHand, t.HintText, t.HintShowMe } -- e.g. 5, 10, 20, 40
	while true do
		local dt = task.wait(0.25)
		if not player:GetAttribute("TutorialDone") then
			idle += dt
			local nextThreshold = thresholds[level + 1]
			if nextThreshold and idle >= nextThreshold then
				level += 1
				onLevel(level)
			end
		end
	end
end)
```

## Checklist

- [ ] `plan.md` has the 5-8 tutorial steps with ids, targets, objective text (≤6 words), counts, rewards and target times
- [ ] With a fresh account on a phone profile, control arrives within 1 s of the character appearing and no modal UI shows for 60 s
- [ ] Loading screen (if any) lives in ReplicatedFirst, calls `RemoveDefaultLoadingScreen`, shows Skip at 3 s and is gone by 8 s
- [ ] Preload list is only the HUD, the start area and the first sounds; no invisible ImageLabels
- [ ] The spawn faces the first target, which is 12-25 studs away and visible on the first frame
- [ ] Spawn, first target, cash-in and first upgrade are inside a 40-stud radius
- [ ] HUD shows at most 3 elements on first join; other elements unlock by step with a badge
- [ ] A beam, arrow and Highlight point at the first target on the first frame after the loading screen
- [ ] First reward lands by 0:15 with sound, particles, floating number and counter pop
- [ ] Exactly one objective line is shown, verb first, ≤6 words, with a counter
- [ ] Every completed objective gets a done beat; the first goal gets a ≤1.5 s celebration that does not block input
- [ ] Off-screen targets show an edge arrow that stays clear of the top bar and the thumb controls
- [ ] Long routes show chevrons along the walkable path; no pointer runs through walls
- [ ] Only one Highlight is active during the tutorial
- [ ] Spotlight dim is used for at most 3 UI taps and disappears on tap
- [ ] The hint ladder delays live in Config
- [ ] Resetting the character mid-tutorial restores the pointer within 1 s
- [ ] First upgrade affordable between 0:45 and 1:30 and visibly changes the main verb
- [ ] Starter gift granted before 3:00; it is useful in play and never purchasable
- [ ] Hook object is on the first route and visible by 0:20; no camera takeover longer than 3 s
- [ ] Next zone gate with price is visible by 3:00; the economy sim reaches it in 5-10 min
- [ ] No purchase prompt, offer, daily reward or invite prompt before the first upgrade; starter-pack badge only after free play and minute 5
- [ ] `LogOnboardingFunnelStepEvent` is called from the server, in order, from step 1 at spawn; Studio prints the step and seconds instead
- [ ] A returning player with a completed tutorial sees no tutorial at all; a mid-tutorial player resumes at their step
- [ ] Skip (from step 3) grants every tutorial reward
- [ ] Five fresh players passed the three-question test at 1, 3 and 5 minutes; times recorded against the master script

## Common mistakes

- Opening with a menu, a "Play" button, an update log, a daily reward or an offer.
- A loading screen with no Skip that runs longer than the game's own load, or a bar driven by `RequestQueueSize`.
- Preloading the entire Workspace, so everyone waits for assets they won't see for minutes.
- Spawning facing a wall, a shop or a crowd, or in a dark lobby far from anything to do.
- Showing every HUD button, currency and menu on the first frame.
- Instructions only as text, or text that starts with "Welcome" and runs past 6 words.
- Several objectives, quest lists or long NPC dialogue at once.
- Pointing at many things at once: beams to every station, Highlights on every egg.
- A beam that goes through walls on a route with turns.
- Losing the pointer after a reset, death or streaming out.
- Tutorial state kept in a `ResetOnSpawn` ScreenGui or advanced by a client remote.
- A first upgrade priced for minute ten, or one that changes an invisible stat.
- Leaving the first roll, first fight or first jump to chance, so some players get the worst first experience.
- A long cutscene "hook" before control, or a hook that shows only paid items.
- Teaching secondary systems (trading, crafting recipes, codes, settings) in the first five minutes.
- A tutorial that never ends, or ends with no next goal on screen.
- A Robux prompt that opens without the player tapping a buy button.
- Invite-friends prompts in the first minutes.
- Logging funnel steps from the client, out of order, with gaps, or starting after spawn.
- Putting user ids or free text in custom fields, blowing through the 8,000-combination limit.
- Changing several things in the opening at once, so nobody knows which change moved the funnel.
- Testing only on a PC with a mouse and keyboard, by someone who already knows the game.

## References

[1] Onboarding — https://create.roblox.com/docs/production/game-design/onboarding — Roblox defines the FTUE as the first few minutes, measured mainly by D1 retention and onboarding goals; teach the essentials, get to the fun quickly, leave players wanting more.
[2] Onboarding techniques — https://create.roblox.com/docs/production/game-design/onboarding-techniques — visual elements, contextual tutorials and timed hints; in-world visuals over easily missed text pop-ups; Hello Kitty Cafe's directional path; tuning with Configs and Experiments; testing a 5-s vs 10-s hint delay.
[3] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events — server-only, published-only funnel events; steps 1-100; skipped steps count as completed; optional step names; custom field keys and the 8,000-combination limit; ten funnel tabs; 180-day expiry; plant tycoon example.
[4] AnalyticsService — https://create.roblox.com/docs/reference/engine/classes/AnalyticsService — API reference for the onboarding funnel, funnel, custom and economy logging methods used here.
[5] Analytics dashboard — https://create.roblox.com/docs/production/analytics/analytics-dashboard — eligibility for the dashboard and KPI benchmarks (including D1 retention) against similar experiences in 50th-90th percentile bands.
[6] Analytics — https://create.roblox.com/docs/en-us/production/analytics — D1 retention and average session time as the first metrics to focus on; D7 and D30 for long-term return; check after each update.
[7] Loading screens — https://create.roblox.com/docs/players/loading-screens — custom loading screen pattern: show a ScreenGui, remove the default, keep it a minimum time, wait for the game to load, then destroy it.
[8] ReplicatedFirst — https://create.roblox.com/docs/reference/engine/classes/ReplicatedFirst — `RemoveDefaultLoadingScreen`, ReplicatedFirst scripts running first, and the default screen being removed after 5 s when ReplicatedFirst has content.
[9] ContentProvider — https://create.roblox.com/docs/reference/engine/classes/ContentProvider — preload only essentials (loading screen, UI, starting area), allow skipping, and don't build progress bars from RequestQueueSize.
[10] How to use PreloadAsync properly? — https://devforum.roblox.com/t/how-to-use-preloadasync-properly/517753 — passing Instances to PreloadAsync also preloads their descendants.
[11] ContentProvider doesn't preload ImageLabels — https://devforum.roblox.com/t/contentprovider-doesnt-preload-imagelabels/4039525 — staff reply that textures preloaded on invisible ImageLabels can be collected as unused.
[12] Properly using PreloadAsync — https://devforum.roblox.com/t/properly-using-preloadasync/1148953 — community discussion of preloading patterns with Instance lists.
[13] Highlight — https://create.roblox.com/docs/reference/engine/classes/Highlight — Highlight properties, the 31-simultaneous display limit stated in the reference, and disabled Highlights taking a slot.
[14] Highlighting objects — https://create.roblox.com/docs/effects/highlighting — guide to Highlight fill, outline and depth modes.
[15] Lights, camera, more highlights — https://devforum.roblox.com/t/lights-camera-more-highlights/4061534 — announcement raising the maximum number of Highlight instances to 255.
[16] Beam — https://create.roblox.com/docs/reference/engine/classes/Beam — Beam between two Attachments, rendering only under Workspace, and TextureSpeed.
[17] Device Simulator — https://create.roblox.com/docs/studio/device-simulator — Physical size scaling and calibration, the device manager, and touch input mapped to the mouse.
[18] StudioDeviceSimulatorService — https://create.roblox.com/docs/reference/engine/classes/StudioDeviceSimulatorService.md — defining custom simulated devices with resolution, DPI and form factor.
[19] Design games on Roblox — https://create.roblox.com/docs/en-us/production/game-design — Roblox's game-design hub containing the onboarding and onboarding-techniques guides.
[20] The age old question: what makes people leave this after 30 seconds? — https://devforum.roblox.com/t/the-age-old-question-what-makes-people-leave-this-after-30-seconds/3969002 — overwhelming GUI on join and a drop between equipping a tool and crafting a workbench.
[21] OnBoard — Modern, Lightweight Onboarding & Tutorial Framework — https://devforum.roblox.com/t/release-onboard-%E2%80%94-modern-lightweight-onboarding-tutorial-framework/4751478 — community tutorial framework, evidence that step-based tutorial controllers are a common Roblox pattern.
[22] Onboarding (glossary) — https://www.creation.dev/glossary/onboarding — contextual teaching with visual cues and guided first actions; the importance of the first 30-60 seconds.
[23] First-Time User Experience (FTUE) Toolkit — https://liquidandgrit.com/first-time-user-experience-ftue-toolkit — review of 26 leading mobile apps' first six 15-minute sessions and first two starter offers; successful FTUEs get players playing quickly.
[24] Best Practices For Mobile Game Onboarding — https://adriancrook.com/?p=8055 — one mechanic at a time, clear visual cues, instant rewards, progress tracking and skip options.
[25] 10 first-time user experience tips for games — https://unity.com/how-to/10-first-time-user-experience-tips-games — the FTUE must teach the rules and convince players the game is worth their time; the first thing touched should be the most engaging mechanic.
[26] All aboard — https://www.bkomstudios.com/blog/all-aboard/ — plan the FTUE early; tutorials added late tend to be poor.
[27] Tutorials, onboarding funnels and UX — https://www.wayline.io/blog/tutorials-onboarding-funnels-ux — early wins and positive feedback keep new players engaged.
[28] Tutorial as onboarding: UX lessons for new players — https://www.wayline.io/blog/tutorial-as-onboarding-ux-lessons-new-players — teach in small segments, introduce mechanics when needed.
[29] Tutorials: an onboarding funnel, not an FAQ — https://www.wayline.io/blog/tutorials-onboarding-funnel-not-faq — use playtests and analytics to find where players get stuck, then iterate.
[30] Complete Grow a Garden Beginner's Guide — https://progameguides.com/roblox/complete-grow-a-garden-beginners-guide-seeds-weather-events-gears/ — Seed Shop, planting on your plot, limited stock refreshing every five minutes, watering and sprinklers.
[31] Grow a Garden: A beginner's guide — https://sportskeeda.com/roblox-news/grow-garden-a-beginner-s-guide — buying, planting and selling; multi-harvest vs single-harvest crops.
[32] Complete Beginners Guide To Grow a Garden Roblox — https://deltiasgaming.com/?p=201040 — beginner flow and shop/selling locations in Grow a Garden.
[33] Doors (game) — https://en.wikipedia.org/wiki/Doors_(game) — background on DOORS as a Roblox horror experience.
[34] Lobby (DOORS wiki) — https://breezewiki.discard.no/doors-game/wiki/Lobby — players spawn in the lobby; twelve elevators start 1-4 player runs; lobby shop for knobs and revives.
[35] Pet Simulator 99: Good vs Evil 2024 Event guide — https://sportskeeda.com/roblox-news/pet-simulator-99-good-vs-evil-2024-event-guide — mandatory free Fate egg on entering the event area; breakables, eggs and coins clearing the first area.
[36] Pet Simulator 99 beginner guide — https://earnaldo.com/blog/pet-simulator-99-beginner-guide — hold click on the nearest breakable; tutorial quests give free pets and starter currency.
[37] Adopt Me beginners hints and tips — https://www.supercheats.com/roblox-adopt-me-walkthrough-guide/beginners-hints-and-tips — first-time players get a short tutorial that walks them through getting an egg and hatching their first pet.
[38] Adopt Me: how to get free pets without Robux — https://allthings.how/adopt-me-how-to-get-free-pets-without-robux/ — the Task Board's daily objectives refreshing every 24 hours.
[39] Tower Defense Simulator modes — https://bloxodes.com/wiki/tower-defense-simulator/modes — the tutorial as a three-wave onboarding run on a fixed map, reached from a Tutorial button or Settings.
[40] Tower Defense Simulator: A Beginner's Guide — https://www.sportskeeda.com/roblox-news/tower-defense-simulator-a-beginner-s-guide — newcomers can struggle with modes; cash comes from clearing waves and mission ends.
[41] A Roblox beginner's guide to playing Blox Fruits — https://www.keengamer.com/articles/guides/a-roblox-beginners-guide-to-playing-blox-fruits/ — team choice on joining, starter islands and the first quest to defeat five enemies.
[42] Blox Fruits guide — https://www.pcgamesn.com/blox-fruits/guide — beginner flow: team choice, starter island quest giver, first quests.
[43] Marine Recruiter (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Marine_Recruiter — switching teams from the Pirate starter island, with a character reset.
[44] Blox Fruits map — https://www.pocketgamer.com/roblox/blox-fruits-map/ — starter islands at levels 0-10 and the Jungle at 15-30 with its quest giver and fruit dealer.

Related: [[00 Start Here]] · [[00 For Any AI]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]]
