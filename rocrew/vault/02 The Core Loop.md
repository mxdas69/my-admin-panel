---
tags: [vault, core-loop, game-feel, juice, pacing]
for: [lead, pulse, architect, builder, balance, playtest, producer]
also: [frame, librarian, scenic, kid-tester, merchant, liveops, reviewer]
---

# 02 The Core Loop

The core loop is the cycle a player repeats for most of their time in the game: do the main action, get a reward, spend it on something that makes the action stronger, and do the action again, bigger. This chapter covers how to state the loop in one sentence, how to build its four layers (seconds, minutes, a session, days), how to make every step of it feel good with feedback ("juice"), how to lay out its stations in the world, how to pace rewards and upgrades, how to measure whether it works and how to diagnose and fix it when it doesn't. It ends with how the loop looks in each genre and the Luau to build it.

A satisfying loop survives rough edges; a broken one cannot be rescued by more content, better UI or monetization. Roblox's onboarding guidance centers on getting players to the fun quickly [2], and the fun is the loop: [[01 The First Five Minutes]] is the loop taught slowly, [[04 Progression and Economy]] is the loop's numbers, [[10 Retention and Social]] is the loop's long layer. Roblox's analytics overview names D1 retention and average session time as the first metrics to look at [4]; a weak micro loop shows up as short sessions, and a weak long loop as poor D7 and D30 [4].

Read this chapter first when pitching (Pulse and Lead must be able to write the loop sentence), when planning (Architect puts the sentence at the top of `plan.md` and names a mechanic for each layer), when building the main action (Builder) and its feedback (Builder, Frame, Librarian), when tuning (Balance) and in every playtest (Playtest runs the three-question test). Re-read it before adding any feature: if a feature does not strengthen one step of the loop, it waits.

Timings and counts in this chapter are this studio's design targets unless a source is cited. Facts about real games come only from the cited sources.

## Rules

### Defining the loop

1. **Every game has one loop sentence with one main verb, written before anything is built.**
   Why: a team that cannot state the loop builds features that pull in different directions. One main verb means one thing the player gets better at.
   How: template: "Players **[verb] [thing]** to earn **[reward]**, which they spend on **[upgrade]** so they can **[bigger verb / new place]**." Put it on line 1 of `plan.md`. Reviewer rejects plans with two sentences or no sentence. Example from guide descriptions of Grow a Garden: players buy seeds, plant them, and sell the harvest for money to buy more and better seeds [12][13][14].
   Done right: "Players break crystals to earn gems, which they spend on pickaxes and backpacks so they can break rarer crystals in new caves."
   Done wrong: "An open-world adventure with pets, building, trading, racing and minigames."

2. **Each of the four layers has a named mechanic in the plan: micro (1-5 s), short (1-5 min), session (15-60 min), long (days).**
   Why: each layer answers a different question: "is this fun now?", "what am I working toward?", "why keep playing tonight?", "why come back tomorrow?". A missing layer is a missing reason to stay.
   How: in `plan.md`, a four-row table: layer, mechanic, time scale, reward. At any moment, a player should have a micro action available, a short goal on screen and a session goal they know about. Check with the three-question test (Rule 34).
   Done right: micro = swing; short = fill backpack and sell, buy next pickaxe; session = unlock next cave, hatch a rare pet; long = index, rebirth tiers, events.
   Done wrong: a great micro action and nothing to buy after minute 20.

3. **Each layer feeds the one above it, and every arrow between them is visible on screen.**
   Why: the player must see the connection: swing → coins → next pickaxe price → stronger swing. If the connection is hidden in a menu, the player cannot plan.
   How: the HUD shows the currency the micro action earns, the next affordable upgrade with its price and a progress bar ("Pickaxe 3: 340 / 500"), and the session goal in the objective tracker. Upgrades show their effect in the same units as the micro reward ("+5 → +8 per hit").
   Done right: a progress bar on the next pickaxe icon fills with every hit.
   Done wrong: the player must open a shop, scroll and compare numbers to know what to work toward.

4. **The first thing a player touches is the main verb, and it is the most fun thing in the game.**
   Why: Unity's FTUE advice is that the first thing players touch should be the most engaging mechanic [8]. If the main verb is dull, every later layer is built on a dull base.
   How: prototype the micro loop alone in an empty baseplate before any zones, pets or shops. It must be fun for 3 minutes with nothing else in the game. Use the juice spec below.
   Done right: the team keeps hitting crystals in the empty prototype for fun.
   Done wrong: "it'll be fun once we add the pets."

5. **Every feature attaches to a named step of the loop sentence; anything that doesn't waits.**
   Why: features outside the loop dilute attention and add maintenance. They feel like a second game.
   How: in the plan, every feature row has a "loop step" column (verb, reward, upgrade, bigger verb, or a layer). Features with no step go to a "later" list. Trading, for example, attaches to the long layer of a collection game; a racing minigame in a mining sim attaches to nothing.
   Done right: "Pets: multiply reward per hit (upgrade step)."
   Done wrong: "Fishing minigame because players like fishing."

### The micro loop (seconds)

6. **The micro action responds on the client within one frame, and the server confirms within a round trip.**
   Why: delay between input and feedback reads as lag or a broken button. Feedback is cosmetic and can start immediately; the reward is decided by the server.
   How: the client plays the swing animation, hit sound and particles on input; it fires the remote; the server validates (cooldown, distance, target valid), grants the reward and replies; the client then shows the floating number and counter pop with the confirmed amount. Code in "Luau".
   Done right: tap → instant swing and "tink" → "+5" appears ~100 ms later.
   Done wrong: tap → nothing until the server answers, then everything at once.

7. **Every action has at least three feedback channels, and every reward at least four.**
   Why: one channel is easy to miss; layered feedback is what makes a simple click feel good.
   How: action = animation + sound + particle. Reward = sound + particles + floating number + counter pop, plus an icon flying to the counter for currency. Specs in "Juice spec".
   Done right: swing, tink, sparks; then coin jingle, "+5", coin icon flies to a bouncing counter.
   Done wrong: the counter changes and nothing else happens.

8. **Repeated sounds vary in pitch (PlaybackSpeed 0.9-1.1) and escalate during streaks.**
   Why: the same sample at the same pitch 300 times becomes grating; pitch variation keeps it natural, and rising pitch in a streak signals momentum.
   How: `sound.PlaybackSpeed = 0.9 + rng:NextNumber() * 0.2` per play; in combos, add +0.04 per consecutive hit up to +0.3, reset after 1.5 s idle. Keep the hit sound short (under 0.3 s) so overlaps don't blur.
   Done right: a fast run of hits climbs in pitch and ends with a satisfying "ding" on the 10th.
   Done wrong: an identical click sound looping for an hour.

9. **Feedback escalates with value: bigger rewards get bigger, louder, longer effects.**
   Why: escalation teaches value without words and makes rare moments memorable.
   How: map value tiers to effects: normal (+N, 12 particles, small sound), crit/bonus (gold "+N!", 25 particles, brighter sound, 0.1 s camera shake of 0.2 studs), rare drop (rarity color, 40 particles, unique sound, 0.8 s), legendary (screen flash, 60+ particles, server message). Use the tier colors from [[03 Rarity and RNG]].
   Done right: a normal hit is a tink; a crit is a gold burst; a rare drop stops the eye.
   Done wrong: a legendary drop with the same effect as a common.

10. **Celebrations stay short: under 1.5 s for routine rewards and never block input.**
   Why: the 100th celebration of the same thing is a chore. Long, unskippable animations break the loop's rhythm.
   How: routine rewards ≤0.7 s; milestones ≤1.5 s; rare events ≤3 s and skippable by tapping; reveals speed up after the first few (see [[03 Rarity and RNG]]). Input is never disabled during a celebration.
   Done right: confetti plays while the player is already swinging again.
   Done wrong: a 4-second "Level up!" panel with an OK button every level.

11. **Give the main verb variety: 3-5 target types per zone with different value, speed or effect.**
   Why: identical targets make the micro loop monotonous; small differences create micro-decisions ("hit the gold one first").
   How: per zone, a common target (fast, low value), a sturdy target (slower, higher value), a rare target (spawns 1 in 20-50, big value, sparkle), and optionally a chest or event target. Respawn times 3-10 s. A Pet Simulator 99 event guide describes an area filled with various breakables [18], and beginner guides advise moving on once the current area's breakables die in under 2 seconds [19][20][21]: the speed of the verb itself signals when to progress.
   Done right: small crystals, big crystals, and a rare glowing crystal that everyone runs for.
   Done wrong: one crystal type copied 200 times.

12. **Put a small chance of a bonus on the micro action (crit, double drop, lucky find), about 1 in 10 to 1 in 30.**
   Why: a little variance on a repeated action keeps attention: the player never knows if the next hit is the special one.
   How: server rolls with one `Random` per server; crit chance in Config (`CritChance = 0.06`, `CritMultiplier = 3`); the client shows the bonus effect only when the server reports it. Keep the bonus cosmetic-plus-reward, never a penalty.
   Done right: about one hit in 15 is a gold "CRIT x3!".
   Done wrong: crits decided by the client, or so common they stop meaning anything.

### The short loop (minutes)

13. **The next upgrade is always visible with its price and a progress bar.**
   Why: the short loop is "work toward the next thing"; it works only if the next thing is known.
   How: the HUD's upgrade tile shows the cheapest useful upgrade (or the one the player pinned) with a bar; when affordable it turns green and pulses (UIScale 1 → 1.06, 0.6 s). For tycoons, the next affordable button in the world pulses instead.
   Done right: "Backpack 4 — 820 / 1,000" with a filling bar.
   Done wrong: the player has 5,000 coins and doesn't know anything is affordable.

14. **Early upgrades come every 30-90 s; mid-game every 2-5 min; never more than about 10 min without a reachable goal.**
   Why: rewards that come too slowly feel like a wall; too fast and they stop feeling earned. These are this studio's targets; Balance checks them in the economy sim.
   How: Balance sets prices so time-to-afford follows the targets ([[04 Progression and Economy]]). Between big upgrades, add small ones (cosmetic, +1 capacity, a quest reward) so there's always something within reach.
   Done right: the sim shows the 10th upgrade at 9 minutes and no gap over 4 minutes in the first hour.
   Done wrong: a 25-minute gap between the second and third zone with nothing to buy.

15. **Upgrades change the verb visibly: a new model, faster animation, bigger numbers or a new effect.**
   Why: an upgrade the player can't see or feel doesn't reinforce the loop.
   How: every upgrade row in Config has a `Visual` field (model id, animation speed, VFX name). At minimum the floating number gets bigger. Tool tiers swap the model; speed upgrades shorten the swing animation by 10-20% per tier (with a floor); capacity upgrades swap the backpack model.
   Done right: Pickaxe 3 is visibly bigger, glows blue and hits show "+12".
   Done wrong: "+2% efficiency" with no visual change.

16. **Capacity limits create the rhythm: early backpacks fill in 30-60 s of play.**
   Why: a fill-and-empty cycle (gather until full, cash in, upgrade) gives the short loop a beat and a reason to visit the shop area.
   How: starting capacity ≈ 30-60 s of gathering at starting power; each capacity tier roughly 1.5-2x the last. When full: the bar turns red, a "Full!" pop plays once, and the Sell pointer appears. Offer an auto-sell only as an earned upgrade later in progression, not from the start, or the rhythm disappears.
   Done right: the backpack fills every ~45 s early; the walk to sell takes ~5 s.
   Done wrong: an infinite backpack from minute one, so the sell step never happens.

17. **The cash-in step is a reward beat of its own, not a chore.**
   Why: selling or depositing is where the micro rewards turn into spending power; it should feel like payday.
   How: a sell pad you step on (no menu), coins burst from the pad, the counter rolls up over 0.4-0.8 s (count-up tween), a register "cha-ching", a toast "+1,240". Grow a Garden guides describe being able to sell the whole inventory at once or pick which crops to sell [12][13][14]; offer "sell all" as the default and selection as an option.
   Done right: step on the pad, coins fountain out, the number rolls up with a sound.
   Done wrong: a dialogue with three questions before each sale.

18. **Loop stations sit within 10 s of travel of each other early in the game.**
   Why: walking between action, cash-in and upgrade is dead time. Early, dead time is where players leave.
   How: Scenic lays out each zone's action area, sell point and upgrade shop in a triangle with sides of 10-30 studs ([[06 World and Look]]). Later zones can spread out if travel itself is fun (vehicles, speed upgrades) or if there are teleport pads.
   Done right: in each zone the sell pad and shop are a few seconds' walk from the targets.
   Done wrong: the only sell point is back at spawn, a minute away from zone 3.

19. **Active play always beats AFK: active income at least 2-3x passive or idle income.**
   Why: if standing still earns as much as playing, players go AFK and the loop dies; sessions turn into idling.
   How: Balance keeps passive sources (offline earnings, auto-collectors, idle pets) at a fraction of active income ([[04 Progression and Economy]]). Passive income is welcome as a bonus that makes the return feel good, not as the main source.
   Done right: playing earns 3x what idling earns; offline earnings are a nice surprise on return.
   Done wrong: an AFK area that out-earns the main loop.

20. **Use investment loops where the player sets something up and collects later.**
   Why: planting, building droppers or placing towers shifts the player from "do" to "plan", adding depth without new controls.
   How: crops, droppers, generators and towers produce over time after placement. Grow a Garden guides note that multi-harvest crops regrow automatically after harvest and give passive income without replanting, while single-harvest crops die after one harvest [13][15]: two investment shapes with different returns. Keep collection active (walk over it, tap it) so the investment still pulls the player back into the micro loop.
   Done right: plant a strawberry bush now, harvest it repeatedly over the session.
   Done wrong: investments that pay into the balance with no player action and no visit.

21. **Use short refresh timers to give in-session reasons to come back to a station.**
   Why: a shop that restocks or a chest that refills every few minutes creates a rhythm above the micro loop.
   How: Grow a Garden guides describe each seed having limited stock that refreshes every five minutes [12][13][14]. Use 3-10 minute in-session timers for shops, chests and events, shown as a countdown on the station; never use real-time timers that make a new player wait to play at all.
   Done right: "Shop restocks in 2:14" over the seed stand.
   Done wrong: a new player's only station is sold out with a 4-hour timer.

### The session and long loops

22. **Know the session goal within 5 minutes: the next zone, a rebirth, a rare hatch or a boss.**
   Why: the session layer is the reason to keep playing tonight; it must be known early to pull the player through the short loops.
   How: show it in the objective tracker after the tutorial ([[01 The First Five Minutes]]) and in the world (a gate with a price, a boss door). Blox Fruits guides describe islands with level bands (starter islands 0-10, the Jungle 15-30) [25], so the next place and its requirement give the session a destination.
   Done right: "Unlock the Cave 0/1,000" right after the tutorial.
   Done wrong: no visible goal beyond the next pickaxe.

23. **Quests guide the loop with small concrete counts near the quest giver.**
   Why: quests turn the loop into named goals with an extra reward, and point the player at the next target type.
   How: quest = verb + count + target + reward, e.g. "Defeat 5 bandits". Blox Fruits guides describe the first quests asking new players to defeat five bandits or five trainees near the quest giver [23][24]. Counts start at 3-5, rise slowly; quest rewards pay toward the next upgrade, not past it.
   Done right: "Break 20 gold crystals → 500 coins" in a zone with gold crystals.
   Done wrong: "Collect 10,000 of something that doesn't exist in this zone".

24. **Prestige (rebirth) restarts the short loop faster, and the player can see the speed-up.**
   Why: rebirth is the session/long layer for many simulators and tycoons: it trades progress for a permanent boost, turning the early game into a fast replay.
   How: preview the gain ("Rebirth: x2.5 coins forever"), keep pets and cosmetics, and make the next run reach the same point clearly faster (the sim should show at least 30-50% less time). Math in [[04 Progression and Economy]].
   Done right: after rebirth the first zone takes 1 minute instead of 6.
   Done wrong: a rebirth that resets everything for +5%.

25. **The long loop has at least two of: a collection index, a prestige track, events, leaderboards, a daily layer.**
   Why: long loops are what bring players back on day 2, 7 and 30 [4]. One long loop is fragile; two cover different players.
   How: an index (collect every pet/crop/fish, with rewards for completion), rebirth tiers, timed events ([[12 Live Ops and Launch]]), leaderboards, a daily task board. Adopt Me's Task Board is described as refreshing a new set of objectives every 24 hours, with rewards for completing them [30][31][32].
   Done right: index + rebirth + weekly events.
   Done wrong: only a leaderboard that new players can never climb.

26. **Round-based games have a match loop and a meta loop, and both are visible.**
   Why: in tower defense, horror, party and shooters the match is the micro/short layer and the lobby is the session/long layer; if the meta loop is missing, wins mean nothing.
   How: match loop = the round's actions and in-round currency; meta loop = persistent currency at the end, spent in the lobby on units, cosmetics, perks. Guides describe Tower Defense Simulator's in-match cash coming from clearing waves and at the end of missions [29], and DOORS' lobby holding a shop for knobs and revives [33]. Show the match-end reward screen for 3-5 s with what it can buy.
   Done right: "Match reward: +240 coins (next tower: 600)".
   Done wrong: matches that end with a scoreboard and nothing to spend.

27. **Social visibility is a loop amplifier: other players' progress is on display.**
   Why: seeing someone's huge pet, giant base or rare aura creates goals by itself and shows the loop's future.
   How: pets follow players, auras and titles render above heads, bases are visible, rare results trigger server messages (capped), leaderboards show nearby ranks. See [[10 Retention and Social]].
   Done right: a new player sees a high-level player's glowing pet swarm and immediately wants one.
   Done wrong: everyone's progress hidden in menus.

### Building it right

28. **The client asks; the server decides every reward, price and result, and rate-limits every remote.**
   Why: exploiters can run any LocalScript and fire any remote with any arguments; a client-decided reward is a free-money button.
   How: remotes carry only intent ("I swung at target X"). The server checks type, cooldown (e.g. 0.2-0.3 s for a swing), distance to target (≤ 12-16 studs), target validity, and computes the reward from server data. Code in "Luau". See [[13 Building It Right]].
   Done right: a remote spammed 1,000 times a second grants rewards at the cooldown rate only.
   Done wrong: `Remotes.AddCoins:FireServer(1000)`.

29. **Every tunable number of the loop lives in Config: cooldowns, rewards, capacities, crit chance, juice timings.**
   Why: the loop is tuned by changing numbers; numbers scattered in scripts get missed. Roblox's onboarding techniques page notes techniques can be tuned with Configs and Experiments [3], and the same applies to loop numbers.
   How: `ReplicatedStorage.Shared.Config` with `Loop` and `Juice` sections. Juice timings are read by the client; reward numbers are read by the server.
   Done right: Balance changes `CritChance` from 0.06 to 0.08 in one line.
   Done wrong: three different swing cooldowns hard-coded in three scripts.

30. **Juice fits a phone's budget: at most ~60 particles per burst, one sound per category at a time, and effects pooled.**
   Why: most players are on phones ([[08 Mobile]]); a loop that stutters stops being fun.
   How: reuse one ParticleEmitter per effect and call `Emit(n)` instead of creating new emitters; cap floating numbers at ~8 on screen (merge extras into one "+N"); throttle hit sounds to one every 50 ms; disable camera shake in a settings toggle. Profile with the MicroProfiler on a low-end device profile.
   Done right: 30 hits per second still run smoothly on a small phone.
   Done wrong: each hit creates a new emitter, a new sound and a new BillboardGui that are never destroyed.

31. **Measure the loop: actions per minute, rewards per minute, minutes between purchases, session length, D1/D7.**
   Why: you can't fix what you can't see. Roblox's dashboard compares engagement and retention KPIs to similar experiences [5].
   How: log a custom event per purchase with seconds since the previous purchase; aggregate actions per minute on the server and log once per minute per player (never per action); use funnel events for loop milestones (first zone, first rebirth) [6][7]. Liveops reviews weekly.
   Done right: "median gap between purchases, minutes 10-30: 3.1 min" matches the target.
   Done wrong: guessing from Discord feedback.

32. **Fix the micro loop before adding content.**
   Why: new zones and pets extend the session and long layers; they rarely fix a dull verb. Content on a weak loop is wasted.
   How: if playtesters avoid the main verb, stop content work and iterate on feel (animation, hit feedback, reward timing) until the empty-baseplate test passes (Rule 4).
   Done right: two days spent on hit feel before building zone 2.
   Done wrong: shipping 10 zones on a swing that feels like nothing.

33. **Every friction point inside the loop gets a funnel step or a metric, so drop-offs are visible.**
   Why: a loop can break at a specific transition (a craft, a purchase, a first match). A DevForum developer saw a steep drop-off between equipping a tool and crafting a workbench [37]; without funnel steps that would have been invisible.
   How: log `LogFunnelStepEvent` steps for any multi-step loop flow (open shop → select → buy → equip; enter match → wave 5 → win) [6][7].
   Done right: "Shop flow: open 100%, select 61%, buy 18%" shows where to fix.
   Done wrong: a single "purchases" number with no steps.

34. **Pass the three-question test at three random moments: What am I doing? Why? What's next?**
   Why: if a playtester can't answer within a few seconds, a layer is missing or invisible.
   How: Playtest stops a fresh player at random times (e.g. 3, 12, 25 min) and asks. "Don't know" on "why" = reward is unclear; on "what's next" = next goal not visible. File it as a loop bug with the time.
   Done right: "Breaking gold crystals, for the Cave, then a better backpack."
   Done wrong: "Uh... just walking around?"

35. **Leave a promise at every stopping point.**
   Why: players stop playing at some point; how they stop decides whether they return. A stop with an open promise ("my crops will be ready", "the shop restocks", "I'm 80% to the next zone") pulls them back.
   How: at session end points show progress to the next goal, timers that will be done on return (bounded offline growth, restocks), and the daily layer. See [[10 Retention and Social]] for return mechanics.
   Done right: "Your strawberries will be ready when you're back" and a progress bar at 80%.
   Done wrong: the player quits right after spending everything, with nothing pending.

## Step by step

### Designing the loop for a new game in 12 steps

1. **Write the loop sentence** (Rule 1). Lead, Pulse and Architect agree on one sentence; if two compete, pick the one with the more fun verb.
2. **Fill the four-layer table** (Rule 2): micro, short, session, long, each with a mechanic, time scale and reward.
3. **Prototype the micro loop on an empty baseplate** (Rule 4): one target type, the main verb, full juice. No UI except a counter.
4. **Run the empty-baseplate test**: three people play for 3 minutes. If anyone stops before 3 minutes because it's dull, iterate on feel (Rules 6-12) before anything else.
5. **Add the short loop**: capacity, cash-in station, 3 upgrades with visible effects (Rules 13-18).
6. **Write the Config** with all loop and juice numbers (Rule 29) and hand it to Balance.
7. **Balance runs the economy sim** to check upgrade cadence (Rule 14) and the session goal timing ([[04 Progression and Economy]]).
8. **Add the session layer**: the next zone with its gate, or the match-end reward for round-based games (Rules 22, 26).
9. **Sketch the long layer**: at least two of index, prestige, events, leaderboards, daily (Rule 25). It can ship later, but the data schema must allow it now.
10. **Lay out the stations** in the world (Rule 18, "Station layout recipe").
11. **Add metrics**: actions per minute, purchase gaps, loop funnels (Rules 31, 33).
12. **Playtest with the three-question test** at three random moments (Rule 34) and fix what fails.

### Diagnosing a loop in a playtest in 6 steps

1. Record one fresh player for 20 minutes (screen + voice).
2. Mark every purchase, every cash-in and every moment of hesitation over 5 s on a timeline.
3. Compute gaps between purchases and compare with Rule 14's targets.
4. Ask the three questions at 3, 12 and 20 minutes.
5. Match symptoms to the "Spotting a broken loop" table below.
6. Fix the top cause, change one Config value or one feature, and repeat with a new player.

## The loop statement

**Template:** Players **[verb] [thing]** to earn **[reward]**, which they spend on **[upgrade]** so they can **[bigger verb / new place]**.

**Checks for a good sentence:**
- The verb is something the player does with their hands every few seconds (break, swing, jump, place, roll, plant, cast, drive, shoot).
- The reward is countable and visible (coins, gems, cash, XP, crops, fish).
- The upgrade changes the verb, not just a number in a menu.
- The last clause names a place, tier or scale the player can see from the start.

**Example sentences:**
- Simulator: Players **break crystals** to earn **gems**, which they spend on **pickaxes, backpacks and pets** so they can **break rarer crystals in new caves**.
- Tycoon: Players **collect cash from droppers** to buy **more droppers, upgraders and floors** so they can **build a bigger base and rebirth**.
- Farming: Players **plant and harvest crops** to earn **money**, which they spend on **better seeds and sprinklers** so they can **grow rarer, heavier crops**.
- Tower defense: Players **place and upgrade towers** to **survive waves and earn coins**, which they spend on **new towers** so they can **beat harder maps**.
- RNG: Players **roll** for **auras**, using **luck boosts** so they can **chase rarer auras and complete the index**.
- Obby: Players **jump through stages** to earn **stage progress and coins**, which they spend on **trails and skips** so they can **reach harder worlds**.

## Loop layers spec

| Layer | Time scale | Must contain | Typical reward | How you know it works |
|---|---|---|---|---|
| Micro | 1-5 s | The main verb, instant feedback, small reward, small chance of a bonus | +N currency, XP tick, a hit | Players keep doing it without being told; actions per minute stable |
| Short | 1-5 min | A capacity or a target count, a cash-in, a visible next upgrade | An upgrade, a quest reward | Median gap between purchases within target |
| Session | 15-60 min | A known destination: zone, rebirth, boss, rare hatch, match win streak | New area, multiplier, rare item | Session length; share of players reaching the goal in session 1 |
| Long | days-weeks | Index, prestige tiers, events, leaderboards, daily tasks | Completion rewards, titles, limited items | D7 and D30 retention [4] |

Rules of thumb for nesting: about 10-40 micro actions per short-loop reward early on; 3-6 short loops per session goal; a session goal every 15-30 minutes in the first hour.

## Juice spec

Juice is the feedback that makes the loop feel good. All of it runs on the client and is cosmetic; the reward itself comes from the server (Rule 28). Numbers are studio defaults to tune.

| Channel | Spec |
|---|---|
| Input response | Same frame as the tap: animation starts, sound plays |
| Swing/use animation | 0.25-0.35 s; upgrades shorten it 10-20% per tier down to a floor of ~0.15 s |
| Hit sound | ≤0.3 s, Volume 0.5, PlaybackSpeed 0.9-1.1 random; streak +0.04 per hit up to +0.3 |
| Hit particles | Pooled emitter, `Emit(8-12)`; Lifetime 0.3-0.5 s, Speed 8-14, SpreadAngle 180, Size 0.3 → 0 |
| Target reaction | Squash: scale the target's visual to 0.92 and back over 0.12 s; or a 0.08 s white flash |
| Floating number | BillboardGui 4 x 1.5 studs, starts 2 studs above the hit, rises 3 studs over 0.7 s Quad-Out, fades over the last 40%; crit: gold, 1.4x size, "!" suffix; cap ~8 on screen |
| Currency fly | 3-6 coin icons from the hit point's screen position to the HUD counter over 0.35-0.5 s, staggered 0.04 s |
| Counter pop | UIScale 1 → 1.15 over 0.08 s and back (reversing tween) |
| Count-up | Big sums roll up over 0.4-0.8 s (NumberValue tween) |
| Crit / bonus | 25 particles, brighter sound, 0.15 s camera shake of ~0.2 studs |
| Rare drop | Rarity color, 40 particles, unique sound, 0.8 s; legendary adds a 0.15 s screen flash and a server message |
| Hit stop (combat) | 0.04-0.08 s freeze of attacker and target animations (`AnimationTrack:AdjustSpeed(0)` then back) |
| Celebration | Routine ≤0.7 s, milestone ≤1.5 s, rare ≤3 s and skippable; input never disabled |
| Settings | A toggle for camera shake and screen flash; respect it everywhere |

**Sound ladder (volumes):** music 0.25-0.35; ambient 0.2-0.3; hits 0.4-0.6; rewards 0.6-0.8; milestone fanfares 0.8-0.9. Group sounds in SoundGroups (Music, SFX, UI) so settings can scale each.

**Color language:** reward numbers in gold `#FFD640`; damage in white/red; healing in green; rarity colors from [[03 Rarity and RNG]]. Stroke text with a 2 px dark UIStroke so it reads on any background.

## Station layout recipe

For each zone of a gather-and-sell game, Scenic places:

1. **Action field**: the targets, spread over a 30x30 to 60x60 stud area, with the rare target spawn points near the middle so players cross the field.
2. **Cash-in point** (sell pad, deposit, collector) at one edge, 10-20 studs from the field's center, with a ground ring and a sign icon (no text needed).
3. **Upgrade shop** within 5-15 studs of the cash-in, so cash-in → spend is one short walk. In-world stands with the item model on a pedestal beat a menu.
4. **Next-zone gate** at the far edge from spawn, price on it, next zone visible through it.
5. **Teleport pad** back to the hub or to unlocked zones near the gate once more than 2 zones exist.
6. **Showcase**: one aspirational object (a top pet statue, a high-tier tool on a pedestal) on the main route ([[01 The First Five Minutes]]).

For tycoons: the plot's buttons appear in a line from the entrance outward, cheapest nearest, the next affordable button pulsing, and the collector next to the entrance. For round-based games: the lobby's "start" (elevator, portal, queue pad) is the largest object; the shop and loadout are to the sides.

## Pacing: rhythm of rewards

A loop feels good when its rewards come in a rhythm the player can feel: small, small, small, big; then a new place.

- **Micro rhythm:** a reward every 1-3 s of active play.
- **Short rhythm:** early, an upgrade every 30-90 s (Rule 14); every 3-5 small upgrades, a big one (new tool tier, new pet).
- **Session rhythm:** every 3-4 big upgrades, a new zone; every 2-3 zones, a prestige option (simulators/tycoons) or a harder map (round-based).
- **Spikes:** a rare drop or bonus event about every 5-10 minutes keeps the curve from feeling flat (rule of thumb).

Worked example (targets for a first hour): +5 per hit, a hit every 1.5 s → ~200 coins/min before multipliers. Pickaxe 2 at 25 (≈ 8 s of hits plus selling), Pickaxe 3 at 150 (15 hits at Pickaxe 2's +10, about 25 s plus a sell trip), Backpack 2 at 300, the Cave gate at 1,000 (a few minutes at x2-x3 power once upgrade spending is included; the sim gives the real time). Balance checks such tables in the sim, not by hand ([[04 Progression and Economy]]).

## Loop health metrics

| Metric | How to get it | Target (studio rule of thumb) | Red flag |
|---|---|---|---|
| Actions per minute (active players) | Server counter, logged once per minute per player as a custom event | Stable or rising over a session | Falls sharply after a certain upgrade or zone |
| Seconds between purchases | Custom event on each purchase with the gap | 30-90 s early, 2-5 min mid | Any gap > 10 min in the first hour |
| Share reaching the session goal in session 1 | Funnel step on "zone 2 unlocked" [6] | Most players who finish the tutorial | Big drop between tutorial end and zone 2 |
| Session length | Analytics dashboard [5] | Compare with similar experiences' benchmark | Below the 50th percentile band |
| D1 / D7 / D30 | Analytics dashboard [4][5] | Check after every update | D1 fine but D7 poor = weak long layer |
| Shop flow conversion | `LogFunnelStepEvent` open → select → buy [6][7] | Each step clearly converting | Big drop at "select" = confusing shop |
| AFK share | Server: players with no actions for 5+ min | Low | High share = passive income too strong |

## Spotting a broken loop

| Symptom (playtest or analytics) | Likely cause | Fix |
|---|---|---|
| Players quit right after the first upgrade | The upgrade isn't felt | Make it visible: bigger model, faster animation, bigger numbers (Rule 15) |
| "What do I do now?" | No visible next goal | Always show the next affordable thing and the objective (Rules 13, 22) |
| Long idle gaps between purchases | Costs outpace income | Retune growth, add mid-tier upgrades ([[04 Progression and Economy]]) |
| Players go AFK instead of playing | Passive income beats active play | Active ≥ 2-3x passive (Rule 19) |
| Everyone farms one spot or trick | One action dominates | Rebalance reward per effort, diminishing returns, rotate rare spawns |
| Rebirth ignored or feared | The reset feels like a loss | Preview the gain, keep pets/cosmetics, faster next run (Rule 24) |
| Players avoid the main verb | The verb itself is dull | Fix micro feedback before adding content (Rules 4, 32) |
| Sessions end at the same point for everyone | A wall: no reachable goal | Add a goal within ~10 minutes of that point (Rule 14) |
| Players walk a lot and act little | Stations too far apart | Move cash-in and shop closer, add teleports (Rule 18) |
| Big drop at one step of a multi-step flow | Friction at that transition | Funnel steps to find it, then simplify that step (Rule 33) |
| Celebrations skipped by closing the game | Celebrations too long | Shorten, make skippable (Rule 10) |
| Frame drops during fast play | Juice too heavy | Pool emitters, cap numbers, throttle sounds (Rule 30) |
| Match players never return to the lobby shop | Weak meta loop | Show what the match reward buys on the end screen (Rule 26) |

**The three-question test:** stop a playtester at a random moment. They should answer within a few seconds: What am I doing? Why? What's next? Any "don't know" is a loop or UI bug.

## Examples from top games

### Buy, plant, sell in one short walk
**Game:** Grow a Garden ([12][13][14])
**Shows:** guides describe buying seeds at the Seed Shop with in-game money or Robux, planting them on your plot, crops growing automatically, and selling the harvest to a merchant; the Seed Shop sits beside the selling booth.
**Why it works:** the loop sentence fits in one breath and every station is close.
**Steal:** keep cash-in and spend next to each other; let the action station be the player's own space.
**Avoid:** letting the Robux path to seeds replace the free path in the first session.

### Two investment shapes
**Game:** Grow a Garden ([13][15])
**Shows:** guides contrast single-harvest crops (like Carrot) that die after one harvest with multi-harvest crops (Strawberry, Blueberry, Tomato) that regrow automatically and give income without replanting.
**Why it works:** two investment types create a small strategic choice inside the same verb.
**Steal:** offer a cheap one-shot option and a pricier repeating option for the same action.
**Avoid:** a repeating option so strong that the one-shot option is never worth it.

### A restock timer as an in-session rhythm
**Game:** Grow a Garden ([12][13][14])
**Shows:** guides describe limited seed stock that refreshes every five minutes, so a sold-out seed may return soon.
**Why it works:** a short, visible timer gives a reason to keep playing and check back in the same session.
**Steal:** 3-10 minute restocks on a station, with a countdown on the station itself.
**Avoid:** stock so scarce that new players can't buy anything.

### Upgrades that change the reward itself
**Game:** Grow a Garden ([12][13])
**Shows:** guides say watering cans and sprinklers improve the size and weight of the harvest, and heavier produce sells for more; Gold and Rainbow variants are worth more than base crops.
**Why it works:** the upgrade shows up in the thing the player looks at (a bigger crop) and in the sale price.
**Steal:** make upgrades visible on the reward object, not only in a stat.
**Avoid:** value hidden behind numbers the player never sees until selling.

### The verb's speed signals when to move on
**Game:** Pet Simulator 99 ([19][20][21])
**Shows:** beginner guides say to hold click on the nearest breakable to earn coins, follow tutorial quests for free pets and starter currency, move on when breakables die in under 2 seconds, and spend coins at the gate to unlock the next area.
**Why it works:** the player reads progress directly from the micro loop: when it gets easy, it's time to go.
**Steal:** let the action get visibly faster with upgrades, and put the next gate where the player notices it.
**Avoid:** zones where the verb never speeds up, so the player can't feel progress.

### A self-contained event loop
**Game:** Pet Simulator 99, Good vs Evil event ([18])
**Shows:** entering the event required opening a free Fate egg for one of two pets; the area had breakables and eggs; a first egg offered three pets where the lowest-rate ones were the strongest and stayed useful into the next areas; breaking enough breakables earned 10,000 coins to clear the first area.
**Why it works:** the event repeats the main loop in miniature with fresh rewards, so returning players know how to play it at once.
**Steal:** events reuse the core verb with new targets and rewards instead of a new game.
**Avoid:** events that need a new control scheme.

### A ranks track beside the loop
**Game:** Pet Simulator 99 ([22][19])
**Shows:** the game has a ranks system documented on its wiki, alongside tutorial quests that hand out rewards.
**Why it works:** a separate track of goals gives a long-layer reason to keep doing the same micro loop.
**Steal:** a rank or level track fed by ordinary play, with rewards at each step.
**Avoid:** rank goals that require leaving the core loop.

### Quest, level, next island
**Game:** Blox Fruits ([23][24][25])
**Shows:** players take a level 0 quest from the starter island's quest giver to defeat five bandits or trainees; the map is organized into islands with level bands (starter 0-10, Jungle 15-30) with quest givers on them.
**Why it works:** quests give the combat verb a target and count, and level bands turn the map into a progression ladder.
**Steal:** quest givers near the targets; zones with visible level requirements.
**Avoid:** quests that send players far from the targets they name.

### Small team perks without a hard lock
**Game:** Blox Fruits ([23][24][26])
**Shows:** guides describe the Pirates/Marines difference as minor: Marines get cheaper ships and bounty rewards; one guide says Pirate crews open only at level 300.
**Why it works:** the choice flavors the loop without splitting it into two games.
**Steal:** factions that change small rewards, not the core loop.
**Avoid:** a faction choice that makes one side's loop clearly worse.

### A match loop that teaches itself
**Game:** Tower Defense Simulator ([27][28][29])
**Shows:** the tutorial is described as a three-wave run teaching placement, upgrades, targeting and the defense loop; in matches cash comes from clearing waves and at the end of the mission.
**Why it works:** place → earn → upgrade happens inside every match, while the end-of-mission reward feeds the lobby meta loop.
**Steal:** an in-match currency that resets each match plus a persistent currency at the end.
**Avoid:** in-match income so slow that the first waves are spent waiting.

### Daily objectives as the long layer
**Game:** Adopt Me! ([30][31][32])
**Shows:** guides describe a Task Board on the left of the screen that refreshes objectives every 24 hours with small Bucks rewards and a chance at a special egg for completing them; eggs hatch as the player completes objectives, and a Robux option hatches them immediately.
**Why it works:** daily tasks give returning players a short list of goals that reuse everyday play.
**Steal:** a daily board of 3 tasks that are things players already do.
**Avoid:** daily tasks that require paying or long detours.

### The lobby is the meta loop
**Game:** DOORS ([33][34])
**Shows:** the lobby holds twelve elevators that start runs for 1-4 players, a shop selling knobs and revives, achievements and settings; custom elevators exist for other modes.
**Why it works:** a run is the micro and short loop; the lobby turns run results into the next run's advantages.
**Steal:** make the end of each run feed something the player can buy before the next run.
**Avoid:** a lobby so dense that the start of the next run is hard to find.

### A drop-off at one loop transition
**Game:** a survival-crafting game on the DevForum ([37])
**Shows:** the developer saw a steep drop between equipping a tool and crafting a workbench, and a commenter said the GUI felt overwhelming on joining.
**Why it works (as a lesson):** loop breaks are usually at one transition; funnel steps find it.
**Steal:** a funnel step for each transition in any multi-step loop.
**Avoid:** adding a complex menu at the first craft; make it one tap.

## By genre

### Simulator
- **Loop:** hit/collect → fill capacity → sell → buy tool/backpack/pet → new zone → rebirth.
- **Micro:** a hit every 0.3-1 s with full juice. **Short:** backpack fills in 30-60 s early. **Session:** a new zone every 10-20 min. **Long:** pet index, rebirth tiers, events.
- **Watch:** upgrades that only change a hidden number; AFK out-earning play. See [[Genre - Simulator]].

### Tycoon
- **Loop:** droppers make cash → collect → buy buttons (droppers, upgraders, walls, floors) → bigger income → rebirth.
- **Micro:** stepping on buttons and the collector, each with a build animation. **Short:** the next button is always visible and pulses when affordable. **Session:** a new floor or section. **Long:** rebirths, decorations, multiple tycoon themes.
- **Watch:** stretches with nothing to buy; confusing base layout. See [[Genre - Tycoon]].

### Obby
- **Loop:** jump → land → checkpoint → stage counter → new world → rewards (trails, coins) → cosmetics or skips.
- **Micro:** each jump with landing feedback (dust puff, sound). **Short:** a checkpoint every 15-45 s. **Session:** a themed world every 10-20 min. **Long:** hard modes, speedrun times, collections of trails.
- **Watch:** difficulty spikes; lost progress on rejoin. See [[Genre - Obby]].

### Roleplay and life sim
- **Loop:** pick a role/activity → act with others → earn money/XP → buy house items, cars, outfits → express more.
- **Micro:** interactions (sit, drive, emote, use items) with feedback. **Short:** a job shift or task list of 3. **Session:** decorate, gather friends, events in town. **Long:** collections, daily tasks, house value.
- **Watch:** no goal for players who aren't natural roleplayers; give a gentle task board. See [[Genre - Roleplay and Life Sim]].

### Action and combat
- **Loop:** fight → XP and drops → level up and gear → harder area → boss.
- **Micro:** hits with hit stop, sound, numbers; abilities with cooldown rings. **Short:** a quest of 5-10 enemies. **Session:** a new area or a boss. **Long:** builds, rare gear, raids.
- **Watch:** weak hit feedback; quests far from their targets (Blox Fruits keeps quest givers on the islands they cover [23][25]). See [[Genre - Action and Combat]].

### Battlegrounds
- **Loop:** fight → knockouts and streaks → unlock movesets/characters → fight with new tools.
- **Micro:** combo, dodge, special, hit reaction. **Short:** a fight lasting 20-90 s. **Session:** streak goals, unlocks. **Long:** character roster, ranks, cosmetics.
- **Watch:** new players beaten instantly; give a practice area and fair matchmaking. See [[Genre - Battlegrounds]].

### Survival
- **Loop:** gather → craft → build/defend → survive the night/wave → better tools → farther areas.
- **Micro:** gathering hits; crafting one tap. **Short:** a craft every 1-3 min. **Session:** a night/wave cycle of 5-15 min. **Long:** base growth, rare resources, seasons.
- **Watch:** a crafting step that needs reading [37]. See [[Genre - Survival]].

### Horror
- **Loop:** enter a run → explore and solve → survive encounters → reach further → meta currency → lobby shop → next run.
- **Micro:** interactions, hiding, listening. **Short:** a room or floor every 1-3 min. **Session:** a full run of 10-30 min. **Long:** achievements, harder modes, unlocks; DOORS' lobby shop sells knobs and revives [33].
- **Watch:** runs with no persistent reward. See [[Genre - Horror]].

### Tower defense
- **Loop:** place towers → survive waves → in-match cash → upgrade → win → persistent currency → summon/buy towers → harder maps.
- **Micro:** placing, upgrading, targeting. **Short:** a wave every 20-60 s. **Session:** a match of 10-25 min. **Long:** tower collection, maps, events. Tower Defense Simulator's cash comes from waves and mission ends [29].
- **Watch:** slow early waves; placement that doesn't matter. See [[Genre - Tower Defense]].

### RNG and collection
- **Loop:** roll → reveal → equip the best → luck upgrades → rarer rolls → index.
- **Micro:** a roll every 1-3 s with fast reveals for commons. **Short:** a luck upgrade or potion every few minutes. **Session:** a rare tier hit, a new biome/event. **Long:** index completion, crafting, limited items. See [[03 Rarity and RNG]] and [[Genre - RNG and Collection]].
- **Watch:** long reveals; tiers nobody ever sees.

### Shooter
- **Loop:** match → kills, objectives → XP and currency → unlock weapons/skins → next match.
- **Micro:** shooting with hit markers and sounds. **Short:** a life or a round of 1-3 min. **Session:** several matches and an unlock. **Long:** weapon progression, ranks, battle-pass style tracks. See [[Genre - Shooter]].
- **Watch:** unlocks that make the game pay-to-win.

### Racing and vehicles
- **Loop:** drive/race → place and cash → buy/upgrade cars → faster times → new tracks.
- **Micro:** steering, boosting, drifting with speed feedback (FOV kick, wind lines). **Short:** a race of 1-3 min. **Session:** a new car. **Long:** garage collection, time trials, events. See [[Genre - Racing and Vehicles]].
- **Watch:** long empty drives with nothing happening.

### Sports
- **Loop:** play a match → score and win → earn currency/rank → cosmetics, skills → better play.
- **Micro:** pass, shoot, tackle with clear timing feedback. **Short:** a possession or a quick game. **Session:** a few matches and a rank change. **Long:** ranks, kits, seasons. See [[Genre - Sports]].
- **Watch:** waiting in lobbies for full teams; add bots or practice.

### Party and social hangout
- **Loop:** join a round → play a short minigame → points → cosmetics/emotes → next round.
- **Micro:** the minigame's one action. **Short:** a round of 1-3 min. **Session:** several rounds with friends. **Long:** cosmetics, emotes, titles. See [[Genre - Party and Social Hangout]].
- **Watch:** long waits between rounds with nothing to do.

### Story and puzzle
- **Loop:** explore → solve → story beat → new area/chapter.
- **Micro:** interacting with objects, small discoveries. **Short:** a puzzle of 1-5 min. **Session:** a chapter. **Long:** new chapters, endings, collectibles. See [[Genre - Story and Puzzle]].
- **Watch:** puzzles with no feedback on partial progress; content that runs out (plan chapters as updates).

### Farming and fishing
- **Loop:** plant/cast → wait and tend → harvest/catch → sell → better seeds/rods/locations → rarer, heavier results.
- **Micro:** planting, watering, reeling with tension feedback. **Short:** a crop cycle or a catch of 10-60 s early. **Session:** a new seed tier or fishing spot. **Long:** index of crops/fish, mutations, events. Grow a Garden guides describe multi-harvest crops regrowing automatically [13][15] and heavier produce selling for more [13]. See [[Genre - Farming and Fishing]].
- **Watch:** real-time waits with nothing to do in between; give an active task while crops grow.

## Luau

Modern Luau throughout: the `task` library, `--!strict` where practical, `Instance.new` with `Parent` set last, and the server deciding every reward. `PlayerData` stands for the game's server-side data module ([[13 Building It Right]]).

### Config: loop and juice numbers

```lua
--!strict
-- ReplicatedStorage/Shared/Config.lua (excerpt). Server reads Loop; client reads Juice.
local Config = {
	Loop = {
		HitCooldown = 0.25,      -- seconds between accepted hits per player
		MaxHitDistance = 14,     -- studs from HumanoidRootPart to target
		CritChance = 0.06,       -- about 1 in 17
		CritMultiplier = 3,
		StartCapacity = 50,
		SellCooldown = 1,
	},
	Juice = {
		PitchMin = 0.9, PitchMax = 1.1, StreakPitchStep = 0.04, StreakPitchMax = 0.3, StreakReset = 1.5,
		HitParticles = 10, CritParticles = 25, RareParticles = 40,
		FloatRise = 3, FloatTime = 0.7, MaxFloating = 8,
		PopScale = 1.15, PopTime = 0.08,
		CountUpTime = 0.6,
		ShakeCrit = 0.2, ShakeTime = 0.15,
	},
}
return table.freeze(Config)
```

### Server: validate the action, decide the reward

```lua
-- ServerScriptService/Mining.server.lua
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(ServerScriptService.PlayerData)
local Tutorial = require(ServerScriptService.Tutorial)
local LoopMetrics = require(ServerScriptService.LoopMetrics)
local Remotes = ReplicatedStorage.Remotes
local targets = workspace:WaitForChild("Targets")

local rng = Random.new() -- one generator per server, never reseeded per hit
local lastHit: {[Player]: number} = {}

Remotes.Hit.OnServerEvent:Connect(function(player: Player, target: unknown)
	-- 1. Types and validity: the client only says which target it swung at.
	if typeof(target) ~= "Instance" or not target:IsA("BasePart") or not target:IsDescendantOf(targets) then return end
	-- 2. Rate limit.
	local now = os.clock()
	if now - (lastHit[player] or 0) < Config.Loop.HitCooldown then return end
	-- 3. Distance.
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root or (root.Position - target.Position).Magnitude > Config.Loop.MaxHitDistance then return end
	-- 4. State.
	local data = PlayerData.get(player)
	if not data or data.Carried >= data.Capacity then return end
	lastHit[player] = now

	-- 5. Decide the reward from server data only.
	local base = (target:GetAttribute("Value") :: number?) or 1
	local crit = rng:NextNumber() < Config.Loop.CritChance
	local gain = base * data.Power * (if crit then Config.Loop.CritMultiplier else 1)
	gain = math.min(gain, data.Capacity - data.Carried)
	data.Carried += gain

	Remotes.HitResult:FireClient(player, target, gain, crit, data.Carried, data.Capacity)
	LoopMetrics.action(player)
	Tutorial.progress(player, "FirstHit") -- only the current tutorial step advances
	Tutorial.progress(player, "FirstGoal")
	Tutorial.progress(player, "FeelUpgrade")
end)

Players.PlayerRemoving:Connect(function(player) lastHit[player] = nil end)
```

Target health, respawn timers and rare spawns live in a separate server script that reads `Value`, `MaxHits` and `Respawn` attributes from each target.

### Server: the cash-in pad

```lua
-- ServerScriptService/SellPad.server.lua
local AnalyticsService = game:GetService("AnalyticsService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(ServerScriptService.PlayerData)
local Tutorial = require(ServerScriptService.Tutorial)
local Remotes = ReplicatedStorage.Remotes

local lastSell: {[Player]: number} = {}

local function onTouched(hit: BasePart)
	local character = hit:FindFirstAncestorOfClass("Model")
	local player = character and Players:GetPlayerFromCharacter(character)
	if not player then return end
	local now = os.clock()
	if now - (lastSell[player] or 0) < Config.Loop.SellCooldown then return end
	lastSell[player] = now

	local data = PlayerData.get(player)
	if not data or data.Carried <= 0 then return end
	local earned = math.floor(data.Carried * data.SellMultiplier)
	data.Carried = 0
	data.Coins += earned
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, "Coins", earned, data.Coins,
		Enum.AnalyticsEconomyTransactionType.Gameplay.Name, "Sell")
	Remotes.Sold:FireClient(player, earned, data.Coins)
	Tutorial.progress(player, "FirstSell")
end

for _, pad in workspace:WaitForChild("SellPads"):GetChildren() do
	if pad:IsA("BasePart") then pad.Touched:Connect(onTouched) end
end
Players.PlayerRemoving:Connect(function(player) lastSell[player] = nil end)
```

### Server: buying an upgrade (price recomputed on the server)

```lua
-- ServerScriptService/Upgrades.server.lua
local AnalyticsService = game:GetService("AnalyticsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(ServerScriptService.PlayerData)
local Tutorial = require(ServerScriptService.Tutorial)
local LoopMetrics = require(ServerScriptService.LoopMetrics)
local Remotes = ReplicatedStorage.Remotes

Remotes.BuyUpgrade.OnServerInvoke = function(player: Player, upgradeId: unknown): (boolean, string?)
	if typeof(upgradeId) ~= "string" then return false, "bad" end
	local def = Config.Upgrades[upgradeId]
	local data = PlayerData.get(player)
	if not def or not data then return false, "bad" end
	local level = data.Upgrades[upgradeId] or 0
	if level >= def.MaxLevel then return false, "max" end
	local price = Config.UpgradeCost(upgradeId, level) -- never trust a client price
	if data.Coins < price then return false, "poor" end

	data.Coins -= price
	data.Upgrades[upgradeId] = level + 1
	PlayerData.recompute(player) -- updates Power, Capacity, Multiplier from levels
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, "Coins", price, data.Coins,
		Enum.AnalyticsEconomyTransactionType.Shop.Name, upgradeId)
	LoopMetrics.purchase(player, upgradeId)
	Tutorial.progress(player, "FirstUpgrade")
	return true, nil
end
```

### Client: instant feedback, then the confirmed reward

```lua
--!strict
-- ReplicatedStorage/Shared/Juice.lua (ModuleScript, client use)
local Players = game:GetService("Players")
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local Config = require(script.Parent.Config)
local J = Config.Juice

local Juice = {}
local rng = Random.new()
local floating = 0
local streak, lastStreakAt = 0, 0
local lastSoundAt: {[Sound]: number} = {}

-- One invisible, anchored holder for pooled particle attachments.
local holder = Instance.new("Part")
holder.Anchored, holder.CanCollide, holder.CanQuery, holder.CanTouch = true, false, false, false
holder.Transparency = 1
holder.Size = Vector3.new(0.2, 0.2, 0.2)
holder.CFrame = CFrame.identity -- at the origin, so Attachment.Position is a world position
holder.Parent = workspace
local pool: {[ParticleEmitter]: {att: Attachment, emitter: ParticleEmitter}} = {}

function Juice.sound(template: Sound, useStreak: boolean?)
	local now = os.clock()
	if now - (lastSoundAt[template] or 0) < 0.05 then return end -- throttle overlaps
	lastSoundAt[template] = now
	local bonus = 0
	if useStreak then
		streak = if now - lastStreakAt < J.StreakReset then streak + 1 else 0
		lastStreakAt = now
		bonus = math.min(streak * J.StreakPitchStep, J.StreakPitchMax)
	end
	local s = template:Clone()
	s.PlaybackSpeed = J.PitchMin + rng:NextNumber() * (J.PitchMax - J.PitchMin) + bonus
	s.Parent = SoundService
	s:Play()
	s.Ended:Once(function() s:Destroy() end)
end

function Juice.burst(template: ParticleEmitter, at: Vector3, count: number)
	local entry = pool[template]
	if not entry then
		local att = Instance.new("Attachment")
		local emitter = template:Clone()
		emitter.Enabled = false
		emitter.Parent = att
		att.Parent = holder
		entry = { att = att, emitter = emitter }
		pool[template] = entry
	end
	entry.att.WorldPosition = at
	entry.emitter:Emit(count)
end

function Juice.float(at: Vector3, text: string, color: Color3, big: boolean?)
	if floating >= J.MaxFloating then return end
	floating += 1
	local anchor = Instance.new("Attachment")
	anchor.Position = at -- holder sits at the origin
	anchor.Parent = holder
	local gui = Instance.new("BillboardGui")
	gui.Size = if big then UDim2.fromScale(5.6, 2.1) else UDim2.fromScale(4, 1.5) -- studs
	gui.StudsOffset = Vector3.new(0, 2, 0)
	gui.AlwaysOnTop, gui.LightInfluence = true, 0
	gui.Adornee = anchor
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = color
	label.Text = text
	local stroke = Instance.new("UIStroke")
	stroke.Thickness = 2
	stroke.Parent = label
	label.Parent = gui
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
	local rise = TweenInfo.new(J.FloatTime, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(gui, rise, { StudsOffset = Vector3.new(0, 2 + J.FloatRise, 0) }):Play()
	local fade = TweenInfo.new(J.FloatTime * 0.4, Enum.EasingStyle.Linear, Enum.EasingDirection.In, 0, false, J.FloatTime * 0.6)
	TweenService:Create(label, fade, { TextTransparency = 1 }):Play()
	TweenService:Create(stroke, fade, { Transparency = 1 }):Play()
	task.delay(J.FloatTime, function()
		gui:Destroy()
		anchor:Destroy()
		floating -= 1
	end)
end

function Juice.pop(scale: UIScale)
	scale.Scale = 1
	TweenService:Create(scale, TweenInfo.new(J.PopTime, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, true), { Scale = J.PopScale }):Play()
end

function Juice.countUp(label: TextLabel, from: number, to: number, format: (number) -> string)
	local value = Instance.new("NumberValue")
	value.Value = from
	local conn = value.Changed:Connect(function(v: number) label.Text = format(v) end)
	local tween = TweenService:Create(value, TweenInfo.new(J.CountUpTime, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Value = to })
	tween.Completed:Once(function()
		conn:Disconnect()
		value:Destroy()
		label.Text = format(to)
	end)
	tween:Play()
end

return Juice
```

```lua
-- StarterPlayerScripts/MiningFeedback.client.lua (LocalScript)
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Juice = require(ReplicatedStorage.Shared.Juice)
local Config = require(ReplicatedStorage.Shared.Config)
local Fx = ReplicatedStorage:WaitForChild("Fx") -- Sounds and ParticleEmitters made by Librarian
local Remotes = ReplicatedStorage.Remotes

local GOLD = Color3.fromRGB(255, 214, 64)
local hud = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("HUD")
local carriedScale = hud:WaitForChild("Carried"):WaitForChild("UIScale")

-- Instant, cosmetic feedback, then ask the server. The server decides the reward.
local function swing(target: BasePart)
	Juice.sound(Fx.HitSound, true)
	Juice.burst(Fx.HitSparks, target.Position, Config.Juice.HitParticles)
	Remotes.Hit:FireServer(target)
end

local function nearestTarget(): BasePart?
	local character = Players.LocalPlayer.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root then return nil end
	local best, bestDist = nil, Config.Loop.MaxHitDistance
	for _, t in CollectionService:GetTagged("Breakable") do
		if t:IsA("BasePart") then
			local d = (t.Position - root.Position).Magnitude
			if d < bestDist then best, bestDist = t, d end
		end
	end
	return best
end

local hooked = setmetatable({}, { __mode = "k" }) -- tools already connected
local function hook(tool: Tool)
	if hooked[tool] then return end
	hooked[tool] = true
	tool.Activated:Connect(function() -- fires for tap, click and gamepad
		local target = nearestTarget()
		if target then swing(target) end
	end)
end
local function onCharacter(character: Model)
	character.ChildAdded:Connect(function(child)
		if child:IsA("Tool") then hook(child) end
	end)
end
Players.LocalPlayer.CharacterAdded:Connect(onCharacter)
if Players.LocalPlayer.Character then onCharacter(Players.LocalPlayer.Character) end

Remotes.HitResult.OnClientEvent:Connect(function(target: BasePart, gain: number, crit: boolean)
	if crit then
		Juice.sound(Fx.CritSound)
		Juice.burst(Fx.CritBurst, target.Position, Config.Juice.CritParticles)
		Juice.float(target.Position, "+" .. gain .. "!", GOLD, true)
	else
		Juice.float(target.Position, "+" .. gain, GOLD)
	end
	Juice.pop(carriedScale)
end)
```

### Server: loop metrics without flooding analytics

```lua
--!strict
-- ServerScriptService/LoopMetrics.lua (ModuleScript)
local AnalyticsService = game:GetService("AnalyticsService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local LoopMetrics = {}
local actions: {[Player]: number} = {}
local lastPurchase: {[Player]: number} = {}
local SKU_FIELD = Enum.AnalyticsCustomFieldKeys.CustomField01.Name

function LoopMetrics.action(player: Player)
	actions[player] = (actions[player] or 0) + 1
end

function LoopMetrics.purchase(player: Player, sku: string)
	local now = os.clock()
	local last = lastPurchase[player]
	lastPurchase[player] = now
	if last and not RunService:IsStudio() then
		AnalyticsService:LogCustomEvent(player, "SecondsBetweenPurchases", now - last, { [SKU_FIELD] = sku })
	end
end

task.spawn(function()
	while true do
		task.wait(60)
		for player, n in actions do
			if player.Parent and not RunService:IsStudio() then
				AnalyticsService:LogCustomEvent(player, "ActionsPerMinute", n) -- once per minute, never per action
			end
		end
		table.clear(actions)
	end
end)

Players.PlayerRemoving:Connect(function(player)
	actions[player] = nil
	lastPurchase[player] = nil
end)

return LoopMetrics
```

### Server: a shop funnel for a multi-step loop flow

```lua
-- Call at each step of the shop flow. funnelSessionId groups one visit's steps together.
local HttpService = game:GetService("HttpService")
local AnalyticsService = game:GetService("AnalyticsService")
local shopVisit: {[Player]: string} = {}

local function shopStep(player: Player, step: number, name: string)
	if step == 1 then shopVisit[player] = HttpService:GenerateGUID(false) end
	local id = shopVisit[player]
	if id then
		AnalyticsService:LogFunnelStepEvent(player, "ShopFlow", id, step, name) -- 1 Open, 2 Select, 3 Buy, 4 Equip
	end
end
```

## Checklist

- [ ] `plan.md` opens with one loop sentence with one main verb
- [ ] The four-layer table (micro, short, session, long) names a mechanic, time scale and reward for each
- [ ] The micro loop passed the empty-baseplate test (fun for 3 minutes with nothing else)
- [ ] The main action works with one tap on mobile and gives feedback on the same frame
- [ ] Every action has ≥3 feedback channels and every reward ≥4
- [ ] Hit sounds vary in pitch and are throttled; streaks raise pitch
- [ ] Bigger rewards trigger bigger effects; tier colors match [[03 Rarity and RNG]]
- [ ] No routine celebration exceeds 1.5 s or blocks input
- [ ] Each zone has 3-5 target types, including a rare one
- [ ] The next upgrade, its price and a progress bar are always visible on the HUD
- [ ] Every upgrade has a visible effect (model, speed, VFX or bigger number)
- [ ] Early capacity fills in 30-60 s; the cash-in is a pad with a reward beat
- [ ] Action, cash-in and shop are within 10 s of each other in early zones
- [ ] The sim shows early upgrades every 30-90 s and no gap over ~10 min in the first hour
- [ ] Active income is at least 2-3x passive/AFK income
- [ ] A session goal is visible within 5 minutes of joining
- [ ] Round-based games show what the match reward buys on the end screen
- [ ] At least two long-layer systems are planned and the data schema supports them
- [ ] All rewards and prices are decided on the server; every remote validates types, distance and cooldown
- [ ] All loop and juice numbers live in Config
- [ ] Particles are pooled, floating numbers capped, and the game holds frame rate on a phone profile during fast play
- [ ] Actions per minute, purchase gaps and a shop funnel are logged (custom events at most once per minute per player)
- [ ] A fresh playtester passes the three-question test at three random moments

## Common mistakes

- Building content (zones, pets, maps) before the micro loop feels good.
- Two or three competing loops with separate currencies and no clear main one.
- Upgrades that only change a stat the player never sees.
- Juice that is all visuals and no sound, or the same sound at the same pitch every time.
- Feedback that waits for the server before anything happens on screen.
- Reward amounts chosen by the client, or remotes with no rate limit or distance check.
- Passive or AFK income that out-earns playing.
- An infinite backpack or auto-sell from minute one, so the short loop loses its rhythm.
- The only sell point far from where players gather.
- Long, unskippable celebrations or reveals that repeat.
- Creating a new ParticleEmitter, Sound and BillboardGui for every hit and never cleaning them up.
- Quests that send players away from the targets they name.
- Round-based games where match rewards buy nothing meaningful.
- Copying a genre's loop without its feedback: the numbers but none of the feel.
- Logging an analytics event for every action instead of aggregating.
- Adding features that attach to no step of the loop sentence.
- Fixing a dull verb by adding more zones.

## References

[1] Design games on Roblox — https://create.roblox.com/docs/en-us/production/game-design — Roblox's game-design hub, the home of its onboarding and design guides.
[2] Onboarding — https://create.roblox.com/docs/production/game-design/onboarding — the first minutes measured by D1 retention; getting players to the fun quickly.
[3] Onboarding techniques — https://create.roblox.com/docs/production/game-design/onboarding-techniques — techniques tuned with Configs and Experiments; in-world visual elements.
[4] Analytics — https://create.roblox.com/docs/en-us/production/analytics — D1 retention and session time as first metrics; D7 and D30 for long-term return.
[5] Analytics dashboard — https://create.roblox.com/docs/production/analytics/analytics-dashboard — engagement, retention and monetization KPIs compared to similar experiences.
[6] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events — funnel steps for tracking progress through key stages; server-only logging; custom field limits.
[7] AnalyticsService — https://create.roblox.com/docs/reference/engine/classes/AnalyticsService — reference for funnel, custom and economy event methods.
[8] 10 first-time user experience tips for games — https://unity.com/how-to/10-first-time-user-experience-tips-games — the first thing players touch should be the most engaging mechanic.
[9] Onboarding (glossary) — https://www.creation.dev/glossary/onboarding — teach mechanics when the player needs them, with visual cues.
[10] First-Time User Experience (FTUE) Toolkit — https://liquidandgrit.com/first-time-user-experience-ftue-toolkit — benchmark of 26 leading mobile apps' early sessions; get players playing quickly.
[11] Best Practices For Mobile Game Onboarding — https://adriancrook.com/?p=8055 — instant rewards and progress tracking as engagement tools.
[12] Complete Grow a Garden Beginner's Guide — https://progameguides.com/roblox/complete-grow-a-garden-beginners-guide-seeds-weather-events-gears/ — Seed Shop, limited stock with a five-minute refresh, watering and sprinklers.
[13] Grow a Garden: A beginner's guide — https://sportskeeda.com/roblox-news/grow-garden-a-beginner-s-guide — buy, plant, harvest, sell; heavier produce and Gold/Rainbow variants worth more; multi-harvest crops.
[14] Complete Beginners Guide To Grow a Garden Roblox — https://deltiasgaming.com/?p=201040 — the beginner loop and shop and selling locations.
[15] Complete beginners guide for Grow a Garden — https://itemlevel.net/complete-beginners-guide-for-grow-a-garden-roblox/ — single-harvest vs multi-harvest crops and early strategy.
[16] Grow a Garden beginners guide — https://avergames.com/games/grow-a-garden/beginners-guide — beginner overview of the planting and selling loop.
[17] Roblox Grow a Garden beginner guide — https://thebackdash.com/gaming/roblox-grow-a-garden-beginner-guide/ — beginner overview; notes on early crops.
[18] Pet Simulator 99: Good vs Evil 2024 Event guide — https://sportskeeda.com/roblox-news/pet-simulator-99-good-vs-evil-2024-event-guide — event area with a free Fate egg, breakables, eggs and a 10,000-coin first-area goal.
[19] Pet Simulator 99 beginner guide — https://earnaldo.com/blog/pet-simulator-99-beginner-guide — hold click on breakables; tutorial quests give free pets and starter currency.
[20] Roblox Pet Simulator 99 Beginner's Guide — https://www.rpgstash.com/blog/roblox-pet-simulator-99-beginners-guide — beginner progression advice for areas and gates.
[21] Pet Simulator 99 Beginner Guide — https://dungeonpath.com/tags/ps99-beginner/ — beginner progression advice, including when to move to the next area.
[22] Ranks (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Ranks_(Pet_Simulator_99) — the game's ranks system as a separate progression track.
[23] A Roblox beginner's guide to playing Blox Fruits — https://www.keengamer.com/articles/guides/a-roblox-beginners-guide-to-playing-blox-fruits/ — first quests, team differences and starter islands.
[24] Blox Fruits guide — https://www.pcgamesn.com/blox-fruits/guide — beginner quest and leveling flow.
[25] Blox Fruits map — https://www.pocketgamer.com/roblox/blox-fruits-map/ — islands organized by level bands with quest givers.
[26] Roblox: How to Play Blox Fruits — https://gamesfuze.com/how-to/roblox-how-to-play-blox-fruits-beginners-guide/ — beginner's guide to teams and early progression.
[27] Tower Defense Simulator modes — https://bloxodes.com/wiki/tower-defense-simulator/modes — tutorial as a three-wave run teaching placement, upgrades, targeting and the defense loop.
[28] Tower Defense Simulator (wiki) — https://bloxodes.com/wiki/tower-defense-simulator — first steps: placing towers, reading range and enemy paths.
[29] Tower Defense Simulator: A Beginner's Guide — https://www.sportskeeda.com/roblox-news/tower-defense-simulator-a-beginner-s-guide — cash from clearing waves and at mission end.
[30] Adopt Me beginners hints and tips — https://www.supercheats.com/roblox-adopt-me-walkthrough-guide/beginners-hints-and-tips — the starter tutorial and egg hatching through objectives.
[31] Adopt Me: how to get free pets without Robux — https://allthings.how/adopt-me-how-to-get-free-pets-without-robux/ — Task Board on the left of the screen refreshing every 24 hours.
[32] Adopt Me guide: Endangered Egg — https://www.filmink.com.au/adopt-me-guide-what-is-the-endangered-egg-how-to-get-it-hatch-chances-trading-tips/ — Task Board rewards of Bucks and a chance at an egg.
[33] Lobby (DOORS wiki) — https://breezewiki.discard.no/doors-game/wiki/Lobby — lobby elevators for 1-4 players, shop for knobs and revives, custom elevators for other modes.
[34] Doors (game) — https://en.wikipedia.org/wiki/Doors_(game) — background on DOORS as a run-based Roblox horror game.
[35] Beam — https://create.roblox.com/docs/reference/engine/classes/Beam — beams between attachments for trails and pointers used in feedback.
[36] Highlight — https://create.roblox.com/docs/reference/engine/classes/Highlight — Highlight properties and display limit, relevant to hit flashes.
[37] The age old question: what makes people leave this after 30 seconds? — https://devforum.roblox.com/t/the-age-old-question-what-makes-people-leave-this-after-30-seconds/3969002 — a drop-off at one loop transition (equip tool → craft workbench).
[38] Tutorials, onboarding funnels and UX — https://www.wayline.io/blog/tutorials-onboarding-funnels-ux — early wins and positive feedback as engagement drivers.
[39] Device Simulator — https://create.roblox.com/docs/studio/device-simulator — testing feel and layout on phone profiles.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
