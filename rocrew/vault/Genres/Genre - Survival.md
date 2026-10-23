---
tags: [vault, genre, survival, co-op, crafting, base-building, day-night, disasters, journey]
for: [lead, pulse, architect, builder, balance, merchant, liveops]
also: [frame, scenic, librarian, playtest, kid-tester, splash, reviewer, producer]
---

# Genre - Survival

Survival games drop a group of players into a hostile place and ask one question: how long can you last? On Roblox the genre has several shapes: camp survival (hold a fire in a dark forest, as in 99 Nights in the Forest), journey survival (drive a train or a car across a dangerous map, as in Dead Rails and A Dusty Trip), disaster rounds (outlast a random tornado or flood, as in Natural Disaster Survival), open-world sandbox survival (gather, craft and fight other players, as in Apocalypse Rising and Booga Booga), and asymmetric survive-the-round games (escape a killer, as in Survive the Killer). This page covers all of them, with the most detail on co-op camp and journey survival, because that is where the recent breakout hits are.

The genre decides success through three things: tension, the stories friends tell after a run, and a meta-progression that survives death. A survival game with no real threat is a walking simulator. One with no safe place is just frustrating. And if a run ends with nothing kept, players never come back for a second one. The top games get the safe-versus-dangerous contrast exactly right (a campfire the monster cannot enter, a train you can retreat to), put a visible clock on every decision, and pay a persistent currency for every run, even a failed one [6][8][25][16].

Read this page before pitching a survival game, when writing its `plan.md`, when Balance tunes the night curve, when Merchant prices classes, and when Liveops plans the first three updates. Read [[02 The Core Loop]] and [[04 Progression and Economy]] alongside it. If the game leans on a monster and dread, read [[Genre - Horror]] too. If the base is a vehicle, read [[Genre - Racing and Vehicles]] for vehicle physics.

## 1. What it is and why it works on Roblox

### The sub-formats

| Sub-format | Shape of a run | Reference game | Run length (our target) | Party size (our target) |
|---|---|---|---|---|
| Camp survival | Hold a base around a light source; push outward by day, defend by night | 99 Nights in the Forest [4][6] | 20-60 min, can end any night | 1-5 |
| Journey survival | Move a vehicle (train, car) along a route; scavenge at stops; fight at night | Dead Rails [23], A Dusty Trip [39][40] | 15-40 min | 1-6 |
| Disaster rounds | Short rounds on a random map; a random hazard tries to kill everyone | Natural Disaster Survival [36] | 1-3 min per round, endless rounds | 6-30 |
| Open-world sandbox survival | Persistent server; gather, craft, build; other players are a threat | Apocalypse Rising [44], Booga Booga [46][47] | open-ended | 10-50 |
| Asymmetric survive-the-round | Survivors evade one player-controlled killer | Survive the Killer [48][49] (see [[Genre - Horror]]) | 3-6 min per round | 6-12 |
| Build-then-survive | Build a craft, then send it into the hazard | Build A Boat For Treasure, named as an established Roblox survival format in [22] | 5-15 min | 1-8 |

Pick exactly one sub-format as the spine. Borrowing a mechanic from a neighbour is fine (Dead Rails has night events like camp survival does [32]), but a game that is half camp and half disaster rounds confuses the thumbnail, the tutorial and the loop.

### Audience and session shape

- **Who plays:** mostly groups of friends who join together, plus solo players who want a group. That is a rule of thumb from what the top games build: every top survival game on this page is co-op or multiplayer first. Plan the whole game around "two friends in a voice call."
- **Session shape:** lobby (pick class, form party) → teleport to a run server → run (days and nights, or kilometres, or rounds) → results screen (meta-currency earned) → back to lobby → spend → next run. A session is usually 1-3 runs.
- **Why they come back:**
  1. The run is a story told with friends ("we got to night 14 and the fire went out").
  2. Meta-currency persists, so even a failed run moves you toward the next class or vehicle [16][25].
  3. There is a long-term finish line: 99 nights plus four rescued children for 99 Nights' good ending [10], or the end of the line in Dead Rails.
  4. Every run is different. Landmarks spawn at random distances [33], night events vary [32], and maps and disasters are random in Natural Disaster Survival [36].
  5. Updates add classes, events and areas on a public schedule [17][18][19].

### Why the genre breaks out on Roblox now

- **The format is familiar but takes one new twist.** GameAnalytics' breakdown of Dead Rails uses the *Hit Makers* idea of "familiar plus new": it argues Dead Rails borrowed from established Roblox survival formats, naming Build A Boat For Treasure (which the article lists at 4.3B+ plays), and made its Wild West setting the new part. It also credits influencers, distribution and the recommendation algorithm for the breakout [22].
- **The scale is proven.** Wikipedia's list of Roblox games reports that 99 Nights in the Forest peaked at 14.2 million concurrent users and had about 26 billion visits as of April 2026 [1]. The A.V. Club, covering the film adaptation announced that month, noted that only two Roblox games had ever passed that peak [2][3]. Treat these as proof the genre can reach the top of the charts, not as a forecast for our game.
- **Co-op stories make good videos.** A night where everything goes wrong is a clip. Design for clip moments (a monster at the edge of the light, a train hitting a horde, a flood rising) and give them a 3-5 s readable setup.
- **It works on phones.** The verbs are simple: walk, swing, pick up, place, run. Survival doesn't need the precise aim that shooters need, so the mobile majority can play it well (see [[08 Mobile]]).

### The survival laws (genre rules)

1. **Safety is visible from anywhere within 150 studs: one light, vehicle or shelter the whole team can find in 3 s.**
   Why: survival tension needs a sharp contrast between safe and unsafe. In 99 Nights in the Forest, guides describe the monster deer as unable to enter camp while the campfire burns, and feeding the fire upgrades it and expands the explorable map [6][7][8]. The safe zone is also the progress meter.
   How: put the campfire model at map centre. Give it a `PointLight` with Range 60 (the maximum), Brightness 2.5 and Color 255,170,90, a tall smoke `ParticleEmitter` that rises above the tree line, and a `BillboardGui` camp icon (40×40 px, AlwaysOnTop = true) that appears only when the player is more than 80 studs away.
   Done right: a lost player turns the camera, sees the orange glow and smoke over the trees, and walks home.
   Done wrong: the fire is a small mesh behind a hill; new players die in the dark 60 studs from camp.

2. **The clock is always on screen, and every night is announced 15 s before it starts.**
   Why: anticipation is half the fear. In Dead Rails, guides describe night starting at 9:00 PM on the in-game clock, with enemies starting to spawn at 11:00 PM, which gives a built-in warning window [31].
   How: drive `Lighting.ClockTime` from shared server time (section 11). Show a top-centre banner at T-15 s with "Night 4 begins in 15", play a low drone sound, and fade fog in over 10 s.
   Done right: the team hurries back with arms full of logs while the sky turns orange.
   Done wrong: it is suddenly pitch black and monsters are already in camp.

3. **Day and night get different verbs: day is for risk and reward, night is for holding ground.**
   Why: alternating verbs stop the loop going stale and give each phase a clear job. Dead Rails raid guides tell players to start a fort raid at 6 AM and never at night [33]: day is for raiding, night is for defending the train.
   How: by day, spawn loot, resources and points of interest. By night, spawn waves, raise enemy aggression and cut visibility. Put explicit day-only content in the world (traders, quests) and night-only content (stronger enemies, night events).
   Done right: the team plans "this day we raid the cave, then sprint back before 9 PM."
   Done wrong: night is the same as day with a darker skybox.

4. **Every run has a named finish line and a counter toward it at the top of the screen.**
   Why: a finish line turns "survive" into a goal. 99 Nights' good ending needs all 99 nights survived and all four children rescued [10]. Dead Rails and A Dusty Trip measure progress in distance (forts in set kilometre bands [33]; quests at 6200 m and 8150 m [43]).
   How: show a top-centre counter, "Night 7 / 99" or "34 km". Add a progress strip with landmark pips. Save the best value per player as `bestNight` or `bestDistance`.
   Done right: "We beat night 20!" is a sentence players say.
   Done wrong: the run just goes on until everyone is bored.

5. **Runs end but meta-progress stays: every run pays a persistent currency, even one that fails.**
   Why: losing is the norm in survival. If a lost hour pays nothing, players quit. Dead Rails pays 10 Bonds for finishing a run on Normal and 20 on Nightmare [25]. 99 Nights pays diamonds for milestones such as reaching day 50 or 99, plus badges and codes [16].
   How: use the meta formula in section 5. Show the payout on the results screen with a 1.2 s count-up. Pay on night milestones *during* the run too, so a disconnect still pays.
   Done right: "Died on night 6, but +5 diamonds, two more runs and I get the Hunter."
   Done wrong: only a full clear pays, and 95% of runs pay zero.

6. **Classes or loadouts are the main meta purchase, priced on a ladder of about 60× from cheapest to top.**
   Why: a class changes how you play the next run, so it is a reason to start one. 99 Nights sells classes for diamonds: Pocket Tactics lists the Camper at 10 diamonds [12], Deltia's lists the Big Game Hunter at 600 [14], and the Hedge Maze update's Vampire class also costs 600 [18].
   How: launch with 6 classes at 0 (starter), 10, 40, 100, 250 and 600. Each one changes a verb: a hunter gets better pelt drops, a builder places faster, a medic revives faster. Don't just give +5% stats.
   Done right: every class appears on the results screen as "next unlock: 34/40."
   Done wrong: 30 classes that are all +damage.

7. **Co-op is needed, not just allowed: at least 3 jobs each night that one player can't do alone at the same time.**
   Why: interdependence is what makes friends invite friends. Rule of thumb: if a solo player can do everything at full efficiency, there is no reason to call a friend.
   How: at night, attacks come from at least 2 directions, the fire needs feeding, and a downed player needs a revive. In journey survival, one player drives, one shoots and one loots.
   Done right: "You hold the left side, I'll feed the fire."
   Done wrong: four players stand in one spot doing the same thing.

8. **Solo is still winnable at the easiest difficulty: scale threats by party size.**
   Why: many players start alone, and an impossible solo run churns them before they ever bring a friend.
   How: enemy count multiplier = 0.6 + 0.4 × players (1 player = 1.0×, 5 players = 2.6×). Resource respawn speeds up 25% when solo.
   Done right: a solo player reaches night 5 in their first run.
   Done wrong: tuning is done with 5 testers, and solo players die on night 2 every time.

9. **Threats are readable at least 1.5 s before they hurt, and every unbeatable threat has a counter-tool.**
   Why: unfair deaths feel like bugs. Guides describe 99 Nights' deer as invulnerable, but shining a flashlight at it makes it flinch, shield its eyes and run off. Sprinting can outrun it, at a cost in energy [7][8].
   How: every enemy attack gets a tell (wind-up animation of at least 0.4 s, an audio cue and a glow). Every boss or stalker gets a soft counter (light, noise, a doorway it can't pass) and a hard counter (an escape option).
   Done right: players learn "shine the light, then run."
   Done wrong: an invisible monster one-shots players from behind.

10. **Scarcity is local: resources thin out near the base and grow richer farther out.**
    Why: it pushes exploration and creates the risk-reward trip. In 99 Nights, feeding the fire expands the area you can explore [6].
    How: split the map into rings. Ring 1 (0-80 studs) has slow respawns (180 s) and basic wood. Ring 2 (80-200) has stone and food (respawn 90 s). Ring 3 (200-400) has scrap, chests and caves (respawn 60 s). Ring 4 (400+) has bosses and rare loot.
    Done right: by night 5 the team has to plan a ring-3 trip.
    Done wrong: infinite wood next to the fire, so nobody ever leaves.

11. **Randomize the run, not the rules: at least 3 random elements per run.**
    Why: replayability without new content. Dead Rails guides describe Fort Constitution spawning at random in the 10-30 km or 50-60 km bands, often in place of the Tesla Lab [33]. Natural Disaster Survival picks a random map and disaster [36].
    How: make the run seed a number in `RunState`. Use it to pick landmark slots (each slot draws from 2-4 candidates), loot table rolls, night event order and trader stock. Log the seed so Playtest can replay a run.
    Done right: two runs on the same day feel different, but the same skills win.
    Done wrong: random enemy damage between 5 and 50.

12. **A special night event roughly every 3-5 nights breaks the routine.**
    Why: routine kills tension. Dead Rails has named night events, including Stormy Night, Cloudy Night, Full Moon and Blood Moon [32]. 99 Nights has invasions by the Deer, the Owl and Cultists [5].
    How: from night 3, each night has a 25% chance of an event, guaranteed if none happened in the last 4 nights. Each event changes exactly one rule (visibility, enemy type, enemy count or a hazard). Announce it with its own banner colour.
    Done right: "Blood Moon!" in the chat, and everyone runs back to the fire.
    Done wrong: events that just multiply enemy HP by 3.

13. **Side goals give direction during safe time: at least 1 quest per day phase.**
    Why: "survive" alone doesn't tell you what to do at 10 AM. 99 Nights has a Missing Kids Board at the campfire that starts rescue quests. Each child sits behind a gate guarded by enemies, and keys drop from the mobs guarding each cave [9].
    How: put a quest board at the base. Run 3 tracks (rescue, hunt, explore), each with 3-5 steps, each step 2-6 minutes of play. Rewards are run power (a key, a tool) plus a little meta-currency.
    Done right: a new player asks "what now?" and the board answers.
    Done wrong: quests hidden in a menu nobody opens.

14. **Needs meters are slow and forgiving: no meter empties in under 6 minutes of normal play.**
    Why: hunger and stamina add planning, but harsh decay turns the game into chores. A Dusty Trip has stamina and hunger [39]. In 99 Nights, sprinting burns energy, so guides say to eat afterward [7].
    How: hunger 100 → 0 over 8 min of daytime activity and 10 min at night. At 0 hunger, lose 1 HP/s (never instant death). Stamina: sprint drains 18/s, regen 12/s after a 1.0 s delay.
    Done right: hunger is a reason to hunt deer at noon.
    Done wrong: players spend 40% of the run eating berries.

15. **Death in co-op is a pause, not an exit: a 30 s downed state, revived with a 3 s hold.**
    Why: if a friend is out of the run for 25 minutes, they leave the server. That is a rule of thumb from co-op design.
    How: at 0 HP, the player becomes Downed (crawls at WalkSpeed 4, 30 s bleed-out). A teammate revives them with a ProximityPrompt (HoldDuration 3). If they bleed out, they spectate and respawn at dawn at the base with an empty hotbar, keeping their equipment tier.
    Done right: dramatic revives are the best clips.
    Done wrong: permadeath in a 40-minute run, so the dead player rejoins a different server.

16. **Building snaps to a 4-stud grid with one input to place and one to rotate.**
    Why: free placement on mobile is fiddly and leaves gaps. Common DevForum advice is to snap the raycast hit position to grid multiples with `math.floor`, to keep the plot size a multiple of the grid, and to use surface normals for alignment [60][61][62].
    How: grid 4 studs, rotation in 90° steps, ghost preview with a green or red `Highlight`, and max placement distance 24 studs. The server re-checks everything (section 11).
    Done right: walls line up into a clean fort in 20 s.
    Done wrong: walls overlap, float or leave 0.3-stud gaps the monsters walk through.

17. **The server decides everything that matters: damage, loot, crafting, placement, fuel, currency.**
    Why: exploiters fly, teleport and fire remotes with fake arguments. In co-op, one cheater ruins five people's run. See [[13 Building It Right]].
    How: the client only sends intent ("craft StoneAxe", "place Wall at this position"). The server validates types, distance, cooldowns, inventory and zone. The client predicts visuals only.
    Done right: a remote spammed 1,000 times does nothing beyond its rate limit.
    Done wrong: `GiveItem:FireServer("Diamond", 9999)` works.

18. **Hazards have a 10 s warning and one learnable counter-play each.**
    Why: Natural Disaster Survival's appeal is learning what each disaster needs. Its disasters include tornadoes, blizzards, flash floods, volcanoes and tsunamis [36], and guides rank how hard each one is [38].
    How: flood means go high. Tornado means get into a sturdy shelter or a low spot. Blizzard means stay near heat. Meteor shower means watch the ground markers. Earthquake means get away from tall structures. Show an icon and a one-line hint in the warning banner.
    Done right: by round 5, players move before the hazard arrives.
    Done wrong: a random instant kill with no warning.

19. **The physics budget is capped: at most 400 unanchored parts in the run server and 150 placed parts per player.**
    Why: survival games pile up drops, buildings, ragdolls and debris, and server physics lag is the top killer of late-run fun. That's a rule of thumb; profile with the MicroProfiler (see [[14 Roblox Studio Workflow]]).
    How: drops are anchored models that bob with a client-side tween. Debris uses `Debris:AddItem(part, 8)`. Buildings are anchored, and their health is an attribute, not physics. Enemies are capped at 40 alive.
    Done right: night 30 runs at 60 fps on a mid phone.
    Done wrong: 2,000 loose logs on the ground by night 10.

20. **Parties travel together into a reserved server.**
    Why: friends who start the run in different servers quit. DevForum threads advise reserving a private server for a match, because a normal group teleport tries to fit players into any server with room, and reserved servers don't appear on the game page [63][64][65]. `TeleportOptions` is the optional argument to `TeleportService:TeleportAsync()` and can reserve a server or target one by access code [66].
    How: lobby pads hold 1-6 players with a 15 s countdown, then `TeleportAsync` with `ShouldReserveServer = true` (section 11). Teleports don't work in Studio, so test them in a published place [63][64][65].
    Done right: four friends step on one pad and arrive together.
    Done wrong: the party is split across two run servers.

21. **The premise fits in one line and is unusual in one way.**
    Why: the thumbnail and title have to sell the fantasy instantly. RoWatcher's listing describes Dead Rails as a co-op adventure set in an alternate 1899, where a zombie plague has struck America and players ride trains to find a cure in Mexico [23]. The Wild West part is what GameAnalytics calls the novel element [22].
    How: write "[setting] + [threat] + [goal]" in under 12 words before anything is built. Make one of the three unusual. A story underneath the premise helps too: 99 Nights in the Forest has enough lore that outlets publish explainers of it [21]. Reveal ours through notes and landmarks, never through a cutscene before the first chop.
    Done right: "Survive 99 nights in a forest with a monster deer."
    Done wrong: "A survival game with crafting and stuff."

22. **The first night arrives by minute 4.**
    Why: the night is the hook. If it comes at minute 10, half the new players have already left without seeing it. That is a studio target; see [[01 The First Five Minutes]].
    How: make day 1 shorter than later days (3:20 rather than 4:00), give night 1 only 3-5 weak enemies, and guarantee the player has a weapon and a light before dusk.
    Done right: the first scare comes at 3:40, the first win at 5:00.
    Done wrong: a 12-minute tutorial day.

23. **Teach in context with at most 3 pointers; don't leave new players with nothing.**
    Why: Sportskeeda's A Dusty Trip guide notes the game has no tutorial explaining the world [39]. That works for a cult hit with videos explaining it, not for a new game with no audience.
    How: pointer 1 is a tree (arrow plus "Chop"), pointer 2 is the fire ("Feed the fire"), pointer 3 is the workbench ("Craft an axe"). After that, the quest board takes over. Each pointer hides once its action is done.
    Done right: a 9-year-old feeds the fire within 60 s without reading anything.
    Done wrong: a 10-page text tutorial, or no help at all.

24. **The genre label and store page say "survival" in the first 3 words.**
    Why: Roblox uses genre and subgenre labels for genre-specific chart sorts. You can change genres only once every three months, and Roblox can reassign a genre it thinks is inaccurate [54].
    How: set the genre to Survival in the experience settings, put the threat and the setting in the title and the first line of the description, and see [[11 Thumbnails, Icons and the Store Page]].
    Done right: the game appears in survival chart sorts from day one.
    Done wrong: a survival game labelled "Adventure," invisible in its genre charts.

## 2. The core loop

### Loop statements

Run loop (camp survival):

> Players **gather and craft by day** to earn **resources and fuel**, which they spend on **the fire, gear and defenses** so they can **survive a harder night and push farther out**.

Meta loop (all sub-formats):

> Players **survive runs** to earn **meta-currency**, which they spend on **classes, vehicles and upgrades** so they can **reach a later night or a farther distance next time**.

Variants:

| Sub-format | Run loop statement |
|---|---|
| Journey | Players **scavenge stops by day** to earn **fuel, ammo and cash**, which they spend on **the vehicle and weapons** so they can **cover the next stretch of track and survive its night**. (Dead Rails: train, bonds, forts [23][25][33]; A Dusty Trip: build a car from engine, radiator and wheel parts and drive as far as you can [40]) |
| Disaster rounds | Players **read the warning and move** to **survive the round**, earning **points**, which they spend on **cosmetics and gear** so they can **show off and survive rarer disasters**. (Natural Disaster Survival [36]) |
| Sandbox | Players **gather and fight** to earn **materials**, which they spend on **tools, armour and a base** so they can **raid richer areas and defend against other players**. (Booga Booga [46][47]; Apocalypse Rising [44]) |
| Asymmetric | Survivors **hide, crawl and run** to **outlast the killer**, earning **coins and XP** to unlock **cosmetics**. (Survive the Killer: only survivors can crawl through certain routes [49]) |
| Build-then-survive | Players **build a craft** from blocks, **test it against the hazard**, and spend the rewards on **better blocks** so they can **get farther next time** ([22] names Build A Boat For Treasure as the established format) |

### The layers

| Layer | Time scale | Camp survival example | Job | Our target |
|---|---|---|---|---|
| Micro | 0.5-3 s | Swing axe, log pops out, `+1 Log` | Feel and feedback | Hit feedback within 1 frame on the client; a resource every 2-3 swings |
| Trip | 1-3 min | Fill the 8-slot bag in ring 2, walk back, feed the fire | A small, clear goal | 60-150 s per trip, 2-3 trips per day |
| Day/night cycle | 5-7 min | Day: two trips plus a quest step; night: hold the fire | The rhythm | Day 4:00, night 2:00 (night 1: day 3:20) |
| Run | 20-60 min | Reach night 10, rescue one child, die or win | The story | First death around night 5-8 for new players |
| Session | 30-90 min | 1-3 runs, spend meta on a class | The reason tonight | A meta purchase every 2-3 runs early on |
| Long | days and weeks | All classes, best night, badges, the finish line, events | The reason to return | A new class or event every 1-2 weeks ([[12 Live Ops and Launch]]) |

### The day/night beat (6-minute cycle target)

| Clock (in-game) | Real time into cycle | Phase | What happens | What the player feels |
|---|---|---|---|---|
| 06:00 | 0:00 | Dawn | Enemies despawn or flee; "Night N survived" toast; meta tick | Relief, reward |
| 06:00-09:00 | 0:00-0:50 | Morning | Quest board refresh, trader appears, plan the trip | Planning |
| 09:00-17:00 | 0:50-3:10 | Day | Gathering, exploring, raids, quests | Greed vs caution |
| 17:00-20:00 | 3:10-4:00 | Dusk | 15 s warning at 19:00; fog rises; sky goes orange | Urgency |
| 20:00-23:00 | 4:00-4:40 | Early night | First wave approaches from 1-2 sides; event announced if any | Fear |
| 23:00-03:00 | 4:40-5:30 | Deep night | Peak waves, stalker or boss, fuel pressure | Climax |
| 03:00-06:00 | 5:30-6:00 | Late night | Waves thin, last push | Holding on |

Rules for the beat:
- Night length grows by 5 s per night, capped at 3:00. Day length stays at 4:00 so planning time doesn't shrink.
- The highest-threat moment comes at about 70% of the night, not at the start, so players have time to get into position.
- Dawn always pays something visible (meta tick, a chest at the fire, or a trader), so surviving is rewarded right away.

### The run-length curve

Each night is harder, but the player's power also grows. Design for a crossover point: on Normal difficulty a new 2-player team should be overwhelmed around nights 6-10, and a skilled 4-player team with good classes around nights 25-40. The long finish line (for example 50 or 99 nights) is a mastery goal for the top 5% of teams. That is a studio target, not a measured number; tune it with Playtest logs (section 11).

## 3. Top games in the genre

Each entry teaches one pattern. Steal patterns, not art: never reuse another game's models, characters, names or logos.

### The campfire is both the safe zone and the progress meter
**Game:** 99 Nights in the Forest ([4][6][7][8])
**Shows:** Players survive night after night in a forest around a campfire. Guides describe the monster deer as unable to enter camp while the fire burns, though it may watch from a distance. Feeding the fire fuel upgrades it and expands the explorable map. The deer is invulnerable, but a flashlight makes it flinch and flee [6][7][8]. The developer is the Roblox group Grandma's Favourite Games [4].
**Why it works:** One object answers three questions: where is safe (the light), how am I doing (fire level) and where can I go (the map grows with the fire). Fuel turns gathering into defense.
**Steal:** A central light source with fuel, a light radius that is literally the safe zone, and fire upgrades that unlock new map rings.
**Avoid:** Making the safe zone so strong that night has no tension. Our fire burns down, so players must leave it to keep it alive.

### Rescue quests give the day a direction and a finish line
**Game:** 99 Nights in the Forest ([9][10][11])
**Shows:** A Missing Kids Board at the campfire starts quests to find missing children. Each child is behind a gate guarded by enemies, and keys come from defeating the mobs guarding caves. Guides suggest starting with the easier Dino Kid [9]. The good ending needs all 99 nights survived and all four children rescued [10].
**Why it works:** "Survive" gives no daily task. The board does: today we find the cave key. The rescues stack into the run's grand goal.
**Steal:** A quest board at base with 3-4 multi-step rescue or retrieve tracks of rising difficulty, and an ending that needs both survival and quests.
**Avoid:** A single all-or-nothing goal. Pay partial meta for each quest step so a failed run still feels like progress.

### Classes are the meta store, and each one changes the game
**Game:** 99 Nights in the Forest ([12][13][14][18])
**Shows:** Players buy classes with diamonds. Pocket Tactics counted 33 classes at the time it wrote its guide and lists the Camper at 10 diamonds [12]. Sportskeeda lists class costs, perks and upgrades [13]. Deltia's describes the Big Game Hunter as a 600-diamond class that starts with a rifle and ammo, can consume animal pelts for permanent bonuses, gets better pelt drop rates and can later consume Mammoth Tusks for permanent health [14]. The Vampire class from the Hedge Maze update also costs 600 diamonds [18].
**Why it works:** A class gives a new way to play the next run. Its perks change verbs (pelts become stats), not just numbers, and the price ladder runs from 10 to 600, so there is always a next target.
**Steal:** A ladder of 6-10 classes at launch, each with a signature verb, plus class upgrades as a second sink. New classes ship as headline update content.
**Avoid:** Classes that are strictly better than others at the same price. Each top class should be different, not dominant.

### Diamonds come from many small sources
**Game:** 99 Nights in the Forest ([15][16])
**Shows:** Guides list diamond sources: surviving to day 50 or 99, completing badges, joining an "Update Party" shortly before a release, and redeeming codes [16]. Deltia's says raiding the Cultist Stronghold is the fastest way to farm diamonds, and that basic badge goals can earn up to about 50 diamonds on a first playthrough [15]. Guides also describe a Pelt Trader who shows up on day two; trading a bunny pelt for the Good Sack increases inventory size [15].
**Why it works:** Many small sources mean every play style earns, badges teach the game while paying out, and the update-party reward turns release time into a crowd.
**Steal:** One-time badge rewards on learning goals (first craft, first night, first rescue), milestone payouts within a run, a high-risk, high-reward raid that pays the most, and a small reward for being online when an update drops.
**Avoid:** Making codes the main source. They are marketing, not an economy.

### Big updates ship in parts with a public countdown
**Game:** 99 Nights in the Forest ([17][18][19][20])
**Shows:** Sportskeeda covered a "Halloween Week 1" update scheduled for an exact time in UTC, with a notify option on the event page [19]. Deltia's describes the Hedge Maze as the third and final part of a Halloween update, with a Carnival Games area that unlocks entry to the maze [18]. Pocket Tactics dates the Hedge Maze update to November 1, 2025 [17]. Deltia's also covered a Fishing update [20].
**Why it works:** A multi-week event gives players three return dates instead of one. A public countdown gathers players at once, which helps chart placement. Side activities such as fishing add new verbs without changing the core.
**Steal:** Split seasonal content into 2-3 weekly parts, each with a new class or area. Announce exact times and use the Roblox event page. Add one side verb (fishing, cooking, carnival games) per season.
**Avoid:** Teasing a date and missing it. Slipped launches cost trust.

### A familiar format with one new setting
**Game:** Dead Rails ([22][23])
**Shows:** RoWatcher describes Dead Rails, by RCM Games, as a co-op adventure set in an alternate 1899, where a zombie plague has struck America and players board trains to search for a cure in Mexico [23]. GameAnalytics argues it balanced the familiar (established Roblox survival formats such as Build A Boat For Treasure) with the new (its Wild West setting), and credits influencers, distribution and the algorithm for the breakout [22].
**Why it works:** Players already know how to play, so the twist does the selling. Zombies plus trains plus the Wild West is a thumbnail in itself.
**Steal:** Pick a well-known survival structure, then change exactly one big thing: setting, vehicle or threat.
**Avoid:** Changing everything at once. A new structure, setting and controls together is too much to learn.

### The vehicle is the base, and the vehicle ladder is the store
**Game:** Dead Rails ([28][29][30])
**Shows:** Dead Rails sells train variants for Bonds. Guides list the Cattle Car at 225 Bonds, the Armored Train at 275 and Dracula's Train at 300, and Deltia's lists the Ghost Train as the newest and most expensive at 325 [28][29][30]. One guide says the Gold Rush train is cosmetic only [29][30].
**Why it works:** The train is your moving safe zone, so upgrading it is upgrading safety. A tight price band of 225-325 makes every train feel like a reachable side-grade, not a 10× jump.
**Steal:** A base-vehicle with 4-6 variants that trade off speed, armour, seats and storage, plus one pure-cosmetic variant for players who just want style.
**Avoid:** Variants where one is best at everything. Sell trade-offs.

### A clock-driven night with named events
**Game:** Dead Rails ([31][32])
**Shows:** Guides describe the night as running from 9:00 PM to 5:00 AM on the in-game clock, with enemies spawning from 11:00 PM [31]. Night events include Stormy Night, Cloudy Night, Full Moon and Blood Moon, and one guide suggests climbing onto the train and using a rifle during a Cloudy Night [32].
**Why it works:** The clock gives a two-hour in-game warning before danger. Named events give the community a shared vocabulary and make each night a small surprise.
**Steal:** A visible clock, a gap between "night starts" and "enemies arrive," and 4-6 named night events that each change one rule.
**Avoid:** Events that only add enemy HP. Each one should change what the right move is.

### Random landmarks and dawn raids
**Game:** Dead Rails ([33][34][35])
**Shows:** Deltia's describes Fort Constitution as spawning at random between 10-30 km or 50-60 km, often in place of the Tesla Lab. Guides advise starting a raid at 6 AM to use all the daylight, never raiding at night, bringing a rifle and shotgun with at least 60 bullets each and 3-5 Snake Oil (which heals and boosts speed), and bringing a horse to escape [33]. Dead Rails also has classes [34].
**Why it works:** Landmark slots with random contents make each run's route different but learnable. The raid is a planned, high-stakes daytime mission with a prep list, which is good for co-op talk.
**Steal:** Distance bands where landmarks roll from a candidate list. Each big landmark has a recommended loadout and time of day.
**Avoid:** Landmarks with no tells. Show the band on the progress strip so players can prepare.

### Payouts on completion, with currency packs for Robux
**Game:** Dead Rails ([25][26][27])
**Shows:** Deltia's says finishing a run pays 10 Bonds automatically on returning to the lobby in Normal mode and 20 in Nightmare [25]. Guides say ghost towns often hold 4-6 Bonds in their buildings and that looting Sterling Town's main buildings gives about 4-6 Bonds. Bonds can also be bought with Robux: 10, 20 and 50 Bonds for 79, 129 and 199 Robux [26][27].
**Why it works:** Harder modes pay double, which pulls skilled players into the challenge. Looting stops pays a little along the way. Robux packs sell time savings on the same currency players earn.
**Steal:** Difficulty multipliers on meta-currency, small loot payouts during the run, and 3-4 currency packs with a better rate at larger sizes.
**Avoid:** Packs so cheap compared with play that earning feels pointless. Check the "hours of play per Robux" ratio (section 6).

### Random map times random disaster in short rounds
**Game:** Natural Disaster Survival ([36][37][38])
**Shows:** The Perfection Roblox Games wiki describes Natural Disaster Survival, by Stickmasterluke, as a survival game where players try to outlast mostly natural disasters on a random map. Disasters include tornadoes, blizzards, flash floods, volcanoes and tsunamis [36]. A mobile app called Survive the Disasters simulated the game; it came out on iOS in 2014 and was later removed from the App Store [37]. BlueStacks ranks the hardest disasters [38].
**Why it works:** Two random picks (map times disaster) give dozens of combinations from a small content set. Rounds are short, so a death costs little, and each disaster teaches one counter-play.
**Steal:** A disaster director with 6-10 hazards, each with a 10 s warning and one counter-move, on 4-8 small maps. Rounds of 60-120 s with a short intermission.
**Avoid:** Maps where one spot is always safe. Rotate safe spots per disaster.

### Build the vehicle from parts, and measure the run in distance
**Game:** A Dusty Trip ([39][40])
**Shows:** Sportskeeda describes A Dusty Trip as an adventurous survival simulator: you repair a broken vehicle by assembling parts while managing stamina and hunger, and there is no tutorial [39]. Pocket Gamer describes building a vehicle by placing parts such as an engine, radiator and wheels, then driving as far as you can from the start [40].
**Why it works:** The vehicle is your build, your base and your score. Distance is a perfect progress counter.
**Steal:** A vehicle assembled from 5-8 part slots, where each part's quality changes speed, durability or fuel use, plus a distance counter as the run score.
**Avoid:** No onboarding. Add the 3-pointer start from law 23.

### Free vehicles hidden behind quests
**Game:** A Dusty Trip ([41][42][43])
**Shows:** Deltia's guides describe free vehicles earned through quests. The Dustbox costs 777 scrap points at the Scrap Shop about 1,500 m from the start [41]. The Transit Ace is found in the Plains at 2,000 m, guarded by three mutants; once you rebuild it, a vault message leads to the 8,000 m mark. It's free, seats four and tops out around 140 km/h [42]. The Blackout car, added in update 5.94, needs you to take a suitcase from a burning car at 6,200 m and deliver it to the Safehouse at 8,150 m within six minutes [43].
**Why it works:** Quests that pay out vehicles turn the map into a treasure hunt, give videos to make and reward free players with big items.
**Steal:** 2-3 earnable "secret" vehicles or classes with multi-step quests spread across distance bands. Add timed delivery quests for tension.
**Avoid:** Making the free quests so obscure that only video-watchers find them. Leave one in-world hint per quest.

### Other players are part of the threat
**Game:** Apocalypse Rising ([44][45])
**Shows:** Gusmanak's Roblox profile lists the original Apocalypse Rising, which describes itself as an open-world zombie survival game where the zombies aren't the only threat [44]. A separate place, Apocalypse Rising Through the Ages, holds miniature versions of all the Apocalypse Rising maps [45].
**Why it works:** Other players are the most unpredictable threat, so trust becomes a mechanic.
**Steal:** For a sandbox variant, optional PvP zones and a meaningful choice between teaming up and betraying. A museum place of past maps is a great community gift.
**Avoid:** Full-loot PvP in a game aimed at young players and new teams. Keep PvP opt-in or zone-limited, and never on the starter ring.

### Tribes and an open-source lineage
**Game:** Booga Booga and its remakes ([46][47])
**Shows:** Roblox listings for fan remakes describe Booga Booga, by Soybeen, as having been made uncopylocked and free to remake. Remakes such as "Booga Booga Resurrection" build on the 2018 version. Listings describe forming tribes as a central feature, with a tribe menu on the T key in one version [46][47].
**Why it works:** Tribes give a sandbox survival game social structure: shared bases, shared enemies and a name to belong to.
**Steal:** A small-group system (tribe or clan) with a shared storage chest and a shared base flag, created with 1 button.
**Avoid:** Copying an uncopylocked game wholesale. Even when the code is open, the crew builds its own systems, art and names.

### Asymmetric survival with survivor-only routes
**Game:** Survive the Killer ([48][49])
**Shows:** Coverage describes Survive the Killer as a horror experience inspired by Dead by Daylight, where players are either the killer or survivors. Only survivors can crawl, and some rooms can only be reached by crawling [49]. Sportskeeda has a guide to playing as the killer [48].
**Why it works:** One verb only survivors have (crawl) creates escape routes the killer can't follow, a readable counter to an unbeatable threat (law 9).
**Steal:** In any survival game, give the hunted a movement option the hunter lacks: vents, ladders, light zones or water.
**Avoid:** A killer with no limits. Every chase needs a breaking point.

### Outside Roblox: a jam prototype grows into a survival classic
**Game:** Don't Starve, by Klei Entertainment ([50][51][52][53])
**Shows:** Klei's Kevin Forbes told Game Developer that Minecraft influenced Don't Starve's design [50]. A GDC Vault talk traces the game from a 16-hour game jam to its success, with data on community engagement [51]. Interviews discuss its focus on discovering resources [52], and Shacknews covered a GDC panel on why the team dropped its original free-to-play plan [53].
**Why it works:** A tiny prototype proved the core fun of gathering versus darkness before any content was built.
**Steal:** Prototype the day/night loop in a one-day jam with grey boxes before building art. If night isn't scary with grey boxes, art won't fix it.
**Avoid:** Copying a PC game's punishing difficulty for Roblox's younger audience. Keep its tension but soften its punishment (law 15).

## 4. The first five minutes, second by second

Target for camp survival: first chop within 15 s of arriving in the run, first fire feed by 0:45, first craft by 2:00, first night by 3:40, and first meta reward by 5:00. These are studio targets; measure them with the funnel events in section 11 and [[01 The First Five Minutes]].

### Lobby (before the run)

| Time | What the player sees | What the player does | Build note |
|---|---|---|---|
| 0-3 s | Spawn facing a glowing "START" pad (12×12 studs) 20 studs ahead, pulsing arrow above it, one-line title "Survive the night" | Looks around | Spawn location CFrame faces the pad; arrow is a `Beam` or bobbing part |
| 3-8 s | Walks on the pad; party card shows "1/5 · leaving in 15" | Steps on pad | Pad is a zone (GetPartBoundsInBox poll every 0.25 s), not Touched |
| 8-20 s | Class card at bottom: starter class preselected, 3 locked classes with prices | Optionally taps class | First-time players skip the class choice: starter auto-equipped |
| 20-23 s | Countdown 3-2-1, screen fades to camp-themed loading art with one tip: "Keep the fire alive" | Waits | Use `TeleportService:SetTeleportGui()` for a custom loading screen |
| 23-35 s | Teleport | Waits | Reserved server via TeleportOptions [66] |

### Run (first day and night, from arrival)

| Time | What happens | Pointer / UI | Target |
|---|---|---|---|
| 0-3 s | Spawn 8 studs from the campfire at 07:00. Fire at 40% fuel, crackling. Two trees 10-14 studs away glow faintly | Pointer 1: arrow over nearest tree, "Chop" | Control within 3 s |
| 3-10 s | Walks to tree; the axe is already in hand (slot 1 selected) | — | No menu to open |
| 10-15 s | First swing: wood chip particles, thunk sound, camera nudge 0.1 studs. Second swing drops a log | `+1 Log` pop at hit point | First reward under 15 s |
| 15-35 s | Chops 3 logs (tree has 3 HP worth of logs, then falls with a satisfying sound) | Bag counter `3/8` in hotbar | — |
| 35-45 s | Pointer 2 switches to the fire: "Feed the fire" | ProximityPrompt "Feed (3 logs)" | — |
| 45 s | Feeds: flame burst VFX, light radius visibly grows, fire bar 40% → 70%, toast "The fire grows. The forest opens up" | Fire bar billboard over the fire | First fire feed by 0:45 |
| 45-70 s | Pointer 3: workbench 6 studs from the fire, "Craft a Spear (3 Logs, 2 Stone)". Stones glow on the path 30 studs out | Quest tracker line 1 appears on the right | — |
| 70-120 s | Picks up 2 stones, chops 3 more logs, returns, crafts the spear: craft burst, item flies to hotbar slot 2 | `New: Spear` card for 2 s | First craft by 2:00 |
| 120 s | Hunger meter fades in (bottom-left) at 85%; berry bush 20 studs out glows | No pointer, tracker line "Eat something" | Show needs only after the first craft |
| 120-180 s | Free exploration of ring 1; a guaranteed chest 40 studs out holds a flashlight | Chest has a sparkle and a soft chime within 30 studs | First chest by 3:00 |
| 180-200 s | Sky warms to orange, 19:00. Banner: "Night 1 in 15 s — stay near the fire", low drone | Top-centre banner with countdown | Warning ≥ 15 s |
| 200-215 s | Fog density rises over 10 s; fire becomes the brightest thing | Fire icon appears if > 80 studs away | — |
| 215-240 s | Night 1 starts. 3 slow wolves approach from one side with glowing eyes and a growl 2 s before arrival | Low-health vignette tested here | First threat by 4:00 |
| 240-290 s | Fight with the spear near the fire; the flashlight makes the stalker silhouette flinch at the tree line | Damage numbers small, hit flash | Win likely if near fire |
| 290-300 s | 06:00 dawn after a short night 1 (60 s). Toast: "Night 1 survived! +2 💎", results stinger, quest board unlocks | Meta currency counter top-right animates | First meta reward by 5:00 |

Notes:
- Day 1 lasts 3:20 and night 1 lasts 60 s. From day 2 the standard timings apply (day 4:00, night 2:00, growing 5 s per night).
- If the player is still far from camp at 19:30, show a dotted trail to the fire (a `Beam` between two attachments) for 20 s.
- Night 1 enemies deal 8 damage per hit against 100 HP, so dying on night 1 takes real effort. Death on night 1 should be under 3% (a playtest target).

### Journey variant (train or car)

| Time | What happens |
|---|---|
| 0-10 s | Spawn on the vehicle with a pointer at the throttle or start lever ("Start the engine") |
| 10-30 s | Vehicle moves; distance counter starts ticking; first fuel item (coal, gas can) visible beside the track at 200 m |
| 30-60 s | First stop prompt: "Brake at the station" with a 6-second slow-down marker; first loot building with 3 guaranteed items |
| 60-150 s | Loot, return, refuel; first currency pickup at 90 s |
| 150-210 s | Dusk warning 15 s before night; first enemies are slow and come from one side of the track |
| 210-300 s | Night 1 on the move; dawn at about 5:00 with "+1 km milestone" meta tick |

### Disaster-round variant

| Time | What happens |
|---|---|
| 0-5 s | Spawn in the lobby tower with a countdown "Next map in 10" |
| 10-15 s | Teleport within the server to a random map; map name banner |
| 15-25 s | 10 s warning with disaster icon and one-line hint ("FLOOD — get high!") |
| 25-100 s | Disaster plays out; survivors counter shown top centre |
| 100-110 s | Round end: survivors get a point and a coin pop, eliminated players see "Survived 0:52 (best 1:10)" |
| 110-300 s | Two more rounds; second round guarantees a different disaster from the first |

## 5. Progression and economy

Survival has two economies that must never mix: a **run economy** that resets every run, and a **meta economy** that persists. Every number below is a studio target for Balance to simulate and tune, not a measurement from another game. See [[04 Progression and Economy]] for the simulation method.

### The two layers

| | Run economy | Meta economy |
|---|---|---|
| Items | Wood, stone, scrap, food, fuel, ammo, crafted gear, built walls | Meta-currency (call it Embers, Gems, Bonds: one name), classes, vehicles, cosmetics, class upgrades |
| Lifetime | One run, then wiped | Forever (DataStore profile) |
| Earned by | Gathering, looting, killing, trading | Night milestones, run completion, badges, quests, codes, Robux |
| Spent on | Fire fuel, crafts, buildings, vehicle repairs, trader deals | Classes, vehicles, cosmetics, class upgrades |
| Inflation risk | None (resets) | High: needs fixed prices and limited sources |
| Who tunes it | Balance with run sims | Balance plus Merchant |

Never let run items convert into meta-currency at a fixed rate. That turns every run into a grind farm and breaks the meta pacing. The one exception is a small, capped "sell to the trader for meta" outlet (for example 1 meta per 50 scrap, max 5 per run).

### Run resources and inventory

| Resource | Where | Gather time (our target) | Main use |
|---|---|---|---|
| Wood (log) | Ring 1-2 trees, 3 logs per tree | 2 swings per log, 0.6 s per swing | Fuel (30 s each), basic crafts, walls |
| Stone | Ring 1-2 rocks, 2 per rock | 3 swings per stone | Tools, campfire upgrade, walls |
| Food (berries, meat) | Ring 1-3 bushes, animals | Bush 1 s hold; animal hunt 10-20 s | Hunger |
| Scrap or metal | Ring 3 ruins, chests | Loot prompt 1.5 s | Tier 2-3 gear, traps, vehicle parts |
| Fuel (coal, fuel can) | Ring 2-4, night drops | Pickup | Fire (75 s or 150 s each) |
| Pelts, rare drops | Hunting, bosses | Kill | Trader deals, class perks |

Inventory: 8 slots base. Each slot stacks one item type up to 20 (logs stack 10 so trips stay frequent). Sack upgrades add +4 slots, up to 16, through crafting or trader deals. 99 Nights has a trader sack that increases inventory size [15], which shows that bag size makes a good mid-run reward.

### Fire fuel model (camp survival)

The fire has a level (1-5) and a fuel amount in seconds of burn. Max fuel = 300 × level. Drain = 1 fuel per second.

Safe radius in studs:

`safeRadius = (12 + 6 × level) + 28 × sqrt(fuel / maxFuel)`

| Level | Upgrade cost | Max fuel (s) | Radius at full | Radius at 25% | Map rings unlocked |
|---|---|---|---|---|---|
| 1 | — | 300 | 46 | 32 | 1-2 |
| 2 | 15 logs, 5 stone | 600 | 52 | 38 | 3 |
| 3 | 25 logs, 15 stone, 5 scrap | 900 | 58 | 44 | 4 |
| 4 | 40 logs, 25 stone, 15 scrap, 1 boss drop | 1200 | 64 | 50 | 5 |
| 5 | 60 logs, 40 stone, 30 scrap, 3 boss drops | 1500 | 70 | 56 | All, plus finale |

Fuel values: log 30 s, coal 75 s, fuel can 150 s. A 2-minute night at level 1 burns 120 fuel, which is 4 logs. That means one trip per day is enough early on, but by night 10 enemies grow faster than the fire, so the team needs coal from ring 2-3. Light `PointLight.Range` caps at 60 studs, so past that the safe radius is shown with a ground decal ring rather than light alone.

### Needs meters

| Meter | Max | Drain | Restore | At zero |
|---|---|---|---|---|
| Health | 100 (class may change) | Damage only | Food +5 HP over 5 s, bandage +40 over 4 s, regen 1 HP/s after 8 s with no damage while hunger > 50 | Downed (30 s), then spectate until dawn |
| Hunger | 100 | 100 per 8 min by day, per 10 min by night; sprint ×1.5 | Berry +10, cooked meat +35, stew +60 | −1 HP/s, no regen |
| Stamina | 100 | Sprint 18/s, dodge 25 | 12/s after 1.0 s rest; ×0.5 when hunger < 20 | Can't sprint until 30 |
| Warmth (optional, snow biomes) | 100 | 100 per 4 min outside fire radius at night | Fire radius +20/s | Walk speed −30% |

Rule: never show more than 3 meters at once. Warmth only appears in cold biomes.

### Night difficulty curve

Enemies per night (alive cap 40):

`enemies(n, p) = min(40, ceil(3 × 1.18^(n−1) × (0.6 + 0.4 × p)))`, where n = night and p = players in the run (1-6).

Enemy HP: `hp(n) = 100 × (1 + 0.08 × (n − 1))`. Enemy damage: `dmg(n) = 8 + 0.6 × (n − 1)`, capped at 30.

| Night | Enemies (1 player) | Enemies (4 players) | Enemy HP | Enemy damage | Extra |
|---|---|---|---|---|---|
| 1 | 3 | 7 | 100 | 8 | Wolves only, one side |
| 2 | 4 | 8 | 108 | 8.6 | Two sides |
| 3 | 5 | 10 | 116 | 9.2 | Event chance starts (25%) |
| 5 | 6 | 13 | 132 | 10.4 | First mini-boss |
| 10 | 14 | 30 | 172 | 13.4 | Boss night; stalker appears |
| 15 | 31 | 40 (cap) | 212 | 16.4 | Two enemy types per wave |
| 20 | 40 (cap) | 40 (cap) | 252 | 19.4 | Boss night |
| 30 | 40 (cap) | 40 (cap) | 332 | 25.4 | Elite variants replace the count growth |
| 50 | 40 (cap) | 40 (cap) | 492 | 30 (cap) | Finale arc |

After the cap, difficulty grows through enemy type mix (ranged, fast, tank), not count. That keeps server performance flat. Every 5th night is a boss night with a named boss and a guaranteed drop.

### Gear tiers

| Tier | Example | Damage | Gather speed | Recipe (our target) | When most teams reach it |
|---|---|---|---|---|---|
| 0 | Old axe (starter) | 10 | 1.0× | — | Spawn |
| 1 | Spear, stone axe | 16 | 1.3× | 3 logs, 2 stone | Day 1 |
| 2 | Iron axe, crossbow | 26 | 1.7× | 6 logs, 6 stone, 4 scrap | Day 3-4 |
| 3 | Steel tools, rifle | 42 | 2.2× | 10 logs, 10 stone, 12 scrap, 1 pelt | Day 7-9 |
| 4 | Elite weapon | 68 | 2.8× | 20 scrap, 3 boss drops | Day 15+ |

Damage grows about ×1.6 per tier and costs about ×2.2. Players feel each upgrade (enemies die in visibly fewer hits), but costs stay ahead.

### Meta-currency payout per run

`meta = 1 + floor(nightsSurvived / 2) + milestoneBonuses + questSteps + difficultyBonus`

- Milestones (one per run): night 5 +2, night 10 +4, night 20 +8, night 30 +12, finish +30.
- Quest steps: +1 each (rescue tracks), +3 for each completed track.
- Difficulty multiplier on the total: Normal ×1, Hard ×1.5, Nightmare ×2. Dead Rails doubles its completion payout on Nightmare (10 vs 20 Bonds [25]), and we follow the same idea.
- Badges: one-time payments of 2-10 each, worth 50-70 meta in total across first-run badges. 99 Nights guides describe roughly 50 diamonds from basic badges on a first playthrough [15].

| Run outcome (Normal) | Meta earned |
|---|---|
| Died night 2, no quests | 1 + 1 = 2 |
| Died night 6, 2 quest steps | 1 + 3 + 2 + 2 = 8 |
| Died night 12, one track done | 1 + 6 + 2 + 4 + 3 + 3 = 19 |
| Died night 25 | 1 + 12 + 2 + 4 + 8 + quests (≈10) = 37 |
| Finished (night 50 finale) | 1 + 25 + 26 + 30 + quests (≈20) = 102 |

### Class price ladder and time to earn

Assume a typical player earns about 14 meta per hour in their first 10 hours (roughly one and a half runs per hour, reaching nights 6-10), about 25 per hour after that as they reach later nights, plus about 50 one-time badge meta in their first 3 hours. The hours column is cumulative play time to own each class when buying them in order.

| Class | Price | Perk idea (one verb change) | Cumulative hours to own (our target) |
|---|---|---|---|
| Survivor (starter) | 0 | Balanced | 0 |
| Woodcutter | 10 | Trees drop +1 log; chops 20% faster | Under 1 hour (often from badges) |
| Medic | 40 | Revives in 1.5 s; bandages heal +50% | 2-3 hours |
| Builder | 100 | Walls cost 30% less, place instantly, +50% wall HP | 6-8 hours |
| Hunter | 250 | Animals drop pelts; pelts give permanent run buffs | 15-18 hours |
| Fire Keeper | 600 | Fire drains 30% slower; can carry embers to start a second fire | 35-45 hours |

99 Nights' ladder runs from 10 to 600 diamonds [12][14][18], which matches the shape. Then add class upgrades (3 levels each, costing 0.5×, 1× and 1.5× the class price) as a second sink once players own all classes.

### Vehicle ladder (journey survival)

| Vehicle | Price (meta) | Trade-off |
|---|---|---|
| Starter | 0 | Slow, 4 seats, 8 storage |
| Hauler | 120 | +50% storage, −10% speed |
| Armoured | 160 | +80% HP, −15% speed |
| Sprinter | 180 | +30% speed, −30% HP |
| Night Rider (cosmetic plus lights) | 200 | Same stats as starter, unique lights and skin |

Dead Rails keeps its paid trains in a tight band (225-325 Bonds [28][29][30]). Use a tight band so vehicles are side-grades.

### Sinks and faucets audit

Balance writes this table into `economy.md` for each game:

| Faucet | Meta per hour (target) | Sink | Price |
|---|---|---|---|
| Night milestones | 8-10 | Classes | 10-600 |
| Quest steps | 3-5 | Class upgrades | 5-900 |
| Badges (one-time) | 50-70 total | Vehicles | 120-200 |
| Codes | 5-20 per code | Cosmetics (fire colour, emotes) | 25-150 |
| Robux packs | — | Event classes | 400-600 |

If total faucets for a 10-hour player cover more than 70% of all launch content, add content before launch or lower the faucets.

## 6. Monetization that fits

Survival players pay for **new ways to play** (classes, vehicles), **style** (camp and character cosmetics), **convenience that doesn't break co-op** (inventory, faster meta) and **playing with friends** (private servers). See [[09 Shops and Monetization]] for shop UI and receipt rules.

### Game passes (one-time)

| Pass | Price (Robux, our target) | What it does | Why it is fair |
|---|---|---|---|
| Bigger Bag | 149 | +4 starting inventory slots every run | Convenience; doesn't change what's possible |
| Meta Boost | 249 | +25% meta-currency from runs | Speeds the meta ladder; no power in the run |
| VIP Camper | 299 | Name tag, VIP lobby corner, 1 exclusive fire colour, +10% meta | Status plus a small boost |
| Starter Class Pack | 199 | Unlocks the 40- and 100-price classes now | Saves time on low-tier classes |
| Radio and emotes | 99 | Emote wheel, campfire dance | Social, cosmetic |

### Developer products (repeatable)

| Product | Price (Robux) | Contents | Limits |
|---|---|---|---|
| Small meta pack | 49 | 10 meta | — |
| Medium meta pack | 129 | 30 meta (+20%) | — |
| Large meta pack | 299 | 80 meta (+36%) | — |
| Huge meta pack | 799 | 250 meta (+56%) | — |
| Self-revive | 25 | Stand up from Downed instantly | 1 per run, only when no teammate is within 40 studs |
| Fire fuel crate | 39 | +300 fuel to the team fire | 1 per run, team benefit, announced as "X saved the fire!" |
| Class trial | 29 | Play any locked class for one run | — |

As a reference point, guides say Dead Rails sells 10, 20 and 50 Bonds for 79, 129 and 199 Robux [26][27], against 10 Bonds for a Normal run [25]. That works out to about one run's payout per 79 Robux at the small size. Check our own ratio: if the small pack equals less than 30 minutes of play, packs are too weak; if it equals more than 3 hours, earning feels pointless.

### Price ladder

`25 → 49 → 99 → 129 → 199 → 249 → 299 → 499 → 799`. Each step gives a better bonus rate. Never more than 4 meta packs. The largest is for the 1-2% of whales and shouldn't be shown first.

### Where offers appear

| Moment | Offer | Rule |
|---|---|---|
| Results screen | "34/40 to Medic. Get 10 meta (49)" | Only if the player is within 30% of a class |
| Downed with no teammate near | Self-revive (25) | Max once per run; 1.5 s delay before the button appears; never block the spectate button |
| Lobby class wall | Locked class card shows its meta price and a small Robux shortcut | Meta price first, Robux second |
| Fire under 10% fuel at night | Fuel crate (39) | Max once per run |

### Off-limits

- **Selling a run win.** No "skip night," "kill all enemies" or "teleport to the end" products. They erase the game and spoil co-op for teammates.
- **Power that makes teammates irrelevant.** No paid weapon that out-damages tier 4 by more than 10%.
- **Paid random boxes without shown odds.** Roblox requires paid random items to show their odds before purchase. Better still, sell classes directly.
- **Pressure on the death screen.** No countdown "Revive in 5... 4..." that hides the spectate or respawn options, and no more than one revive offer per run.
- **Paid PvP advantages in sandbox variants.** Armour or weapons for Robux in PvP zones drive away free players.
- **Shaming text** ("Only noobs don't have VIP") or fake discounts.

## 7. UI and HUD for this genre

Read [[05 UI and HUD]] and [[08 Mobile]] first. Survival HUD has one job: make the clock, the safe zone and your teammates readable at a glance, in the dark, on a phone.

### HUD layout (landscape, 1920×1080 reference; all sizes in offset px at that reference with a `UIScale`)

| Element | Anchor and position | Size | Content and style | States |
|---|---|---|---|---|
| Phase pill | Top centre, 12 px below the inset | 240×48 | Sun or moon icon (28 px), "DAY 4" / "NIGHT 4" bold 22 px, time left "1:42" 18 px; day bg #F6C344 at 0.1 transparency with dark text, night bg #1B2140 with white text; `UICorner` 24 | Pulses red for the last 15 s before night |
| Run progress | Under the pill, 6 px gap | 240×10 bar | "7 / 99" or distance bar with landmark pips | — |
| Warning banner | Top centre, slides down to 80 px | 520×64 | Event icon, title 24 px bold, hint 16 px, countdown | Night (indigo #4F46E5), event (crimson #DC2626), disaster (amber #F59E0B) |
| Party panel | Top left, below Roblox buttons | 220 wide, 40 px per row, max 6 rows | Headshot 32 px (`Players:GetUserThumbnailAsync`), name 14 px, HP bar 120×6 | Downed: row flashes red, "DOWN 0:23" |
| Meta currency | Top right | 140×40 | Icon plus count; count-up animation on gain | Gains float "+2" |
| Needs | Bottom left, 24 px from the edge | 200 wide | HP 200×14 (#E5484D), hunger 200×10 (#F59E0B), stamina 200×10 (#22C55E), 20 px icons | A bar under 20% pulses and shows its number |
| Hotbar | Bottom centre | 6 slots of 64×64, 8 px gap | Item icon, count bottom-right 14 px bold with 1.5 px stroke | Selected: 3 px white `UIStroke`, scale 1.08 |
| Quest tracker | Right middle | 280 wide, max 3 lines | Step text 16 px, progress "2/3" | Completed line ticks then slides out |
| Fire billboard | World, 6 studs above the fire | `BillboardGui` 160×28, MaxDistance 120 | Fuel bar plus level "Lv 2"; orange #FF8A3D | Under 20% shakes and turns red |
| Camp marker | Screen edge or world when > 80 studs | 40×40 | Fire icon plus distance "120m" | Hidden inside the safe radius |

### Must-have screens

1. **Lobby party pad card:** players 1-6 with headshots, countdown, difficulty selector (Normal, Hard, Nightmare: Nightmare locked until night 10 on Normal), "Invite friends" button that calls `SocialService:PromptGameInvite`.
2. **Class select:** grid of class cards 160×200. Owned cards are bright with a "Select" button. Locked cards show their price in meta (big) and Robux (small), a 1-line perk and a 3-second looping preview.
3. **Crafting:** centred modal 760×480 (full screen on phones). Left: tab list (Tools, Weapons, Build, Fire). Right: grid of 96×96 recipe tiles. Selected recipe shows ingredient rows ("Log 3/5" with the number red when short) and a big Craft button 220×56: green #22C55E when ready, grey otherwise. Craft can only be pressed near a workbench; show "Go to a Workbench" when far.
4. **Build mode:** ghost model with a `Highlight` (FillColor #34D399 valid or #F43F5E invalid, FillTransparency 0.6), cost chip above it, bottom bar with Rotate (R), Place (click or tap), Cancel (Q). On mobile these are 72×72 buttons on the right side.
5. **Quest board:** opens from a ProximityPrompt at camp. 3 tracks as columns, each step a card with reward chips.
6. **Results screen:** "NIGHT 12" 72 px, cause of death in one line, meta count-up over 1.2 s, badges earned, the next class progress bar ("34/40 Medic"), and two buttons: "Play again" (primary, 300×64, keeps the party together) and "Lobby."
7. **Spectate:** when dead, cycle teammates with ←/→ (big arrows on mobile), "Respawn at dawn in 1:12."
8. **Settings:** brightness slider (adds `ColorCorrectionEffect.Brightness` 0 to 0.15 on the client only), music and SFX volume, low-graphics toggle (turns off shadows on point lights and particles), camera shake on/off.
9. **Map or compass (journey and big maps):** compass strip top centre 480×32 with icons for camp, quest and vehicle.

### Mobile rules for survival

- Interact through `ProximityPrompt`. It shows a tappable button on touch devices automatically, so don't build custom interact buttons.
- Right side: attack 96 px, sprint 72 px, build 72 px, placed above and left of the Roblox jump button with at least 12 px gaps.
- Hotbar slots shrink to 56×56 on phones and cap at 6 slots. A 7th "bag" button opens the full inventory.
- Night readability: test the HUD on a phone at 50% screen brightness in a dark room. Every bar has a 1.5 px dark stroke and no text is under 14 px.
- Never cover the bottom-centre thumb zone with a modal during night. Crafting at night opens as a half-height sheet.

## 8. World and look

Read [[06 World and Look]]. Survival worlds are built around one idea: **the light is safe and the dark is not**, and the player can read distance from home at a glance.

### Map layout: rings around the base

| Ring | Distance from base | Content | Landmark density |
|---|---|---|---|
| 1 | 0-80 studs | Starter trees, berries, workbench, quest board | 1 landmark (the base) |
| 2 | 80-200 | Stone, animals, first chest, small ruins | 1 landmark per 90° |
| 3 | 200-400 | Caves, scrap ruins, trader camp, mini-boss arena | 1 per 60° |
| 4 | 400-650 | Strongholds, boss lairs, rare resources | 1 per 45° |
| 5 | 650+ | Finale area, unlocked by the top fire level | 1-2 |

For journey survival, swap rings for distance bands along the track: a stop every 0.8-1.2 km, a major landmark every 5-10 km, a random slot per band (law 11).

### Landmarks and navigation

- Every landmark has a tall silhouette visible over the trees at 200 studs: a tower, a dead giant tree, a radio mast or a smoking ruin.
- Paths: worn-dirt trails from the base to each ring-2 landmark. Players follow paths without being told.
- The base has a vertical beacon (smoke column, light beam) visible from every point on the map.

### Lighting presets (starting values; Scenic tunes on device)

| Phase | ClockTime | Ambient | OutdoorAmbient | Atmosphere Density | Atmosphere Color | ColorCorrection |
|---|---|---|---|---|---|---|
| Dawn | 6.2 | 70,62,62 | 120,110,110 | 0.35 | 200,170,160 | Tint 255,236,220 |
| Day | 12-15 | 90,90,90 | 128,128,128 | 0.25 | 199,199,199 | None |
| Dusk | 18.6 | 82,62,72 | 112,92,110 | 0.38 | 232,150,120 | Tint 255,226,210 |
| Night | 0-3 | 28,30,48 | 46,52,84 | 0.45 | 60,70,110 | Saturation −0.2, Contrast 0.1 |
| Event (Blood Moon) | 0 | 60,18,18 | 90,30,30 | 0.5 | 120,30,30 | Tint 255,190,190 |

Rules:
- Night is dark but readable. Never go below Ambient 25,25,40 on mobile. Add a small personal light (PointLight Range 12, Brightness 0.6) on each character at night so players never lose their own avatar.
- When an `Atmosphere` object exists, use its Density and Haze for fog instead of the old Lighting fog properties.
- Tween presets on the client over 8 s at each phase change (TweenService on Lighting and Atmosphere properties). The clock itself is driven by shared time (section 11).
- `Lighting.Technology` Future gives the campfire real shadows; check performance on a low-end phone and keep the shadow-casting light count at 3 or fewer near the base.

### Audio

| Moment | Sound | Volume |
|---|---|---|
| Day ambience | Birds, wind, leaves | 0.3 |
| Dusk | Crickets start; music drops to a low pad | 0.35 |
| Night | Distant howls every 20-40 s (random), heartbeat when enemies are within 30 studs | 0.4 |
| Fire | Crackle loop, 3D `Sound` with RollOffMaxDistance 60 | 0.5 |
| Warning | Low horn or drone sting | 0.7 |
| Dawn | Bright chime plus birds | 0.6 |

### Performance

- `Workspace.StreamingEnabled` on, with the base and active vehicles set to `ModelStreamingMode` Persistent so they never stream out.
- Trees: 2-3 mesh variants, `CollisionFidelity` Box, `CastShadow` off on far-ring trees. Aim for 600-1,200 trees on a full map.
- Particles: fire about 40 particles, smoke about 20, snow and rain only near the camera.
- Enemy models: 1 `Humanoid` each, 6-10 parts, `SetNetworkOwner(nil)` on their root so the server controls them.

## 9. Retention and social

Read [[10 Retention and Social]]. Survival retains through **friends, stories and the meta ladder**.

1. **Party-first lobby.** "Invite friends" on the party pad and on the results screen (`SocialService:PromptGameInvite`). "Play again" keeps the same party in a new reserved server.
2. **Shared victory, personal reward.** The run result belongs to the team; meta pays per player. A downed player still gets their share if the team survives the night.
3. **Roles create reasons to bring friends.** Medic, Builder and Hunter classes are better in teams. The results screen shows "Your team had: Medic, Builder."
4. **Badges as the first-week roadmap.** 15-25 badges: first night, night 5/10/25/50, first rescue, all rescues, first boss, each class owned, the finish line. Each pays a little meta once. 99 Nights' badges are a known diamond source [15][16].
5. **Best night and best team leaderboards.** A lobby board shows top 10 "Best night (Normal)" and "Best night (Nightmare)" from an `OrderedDataStore`, refreshed every 5 minutes.
6. **Daily and weekly challenges.** Three dailies ("Feed the fire 20 times," "Survive 3 nights as Builder"), each paying 2-4 meta. One weekly paying 15.
7. **The "one more run" hook.** The results screen shows the next class progress bar and the closest unfinished badge.
8. **Stories made shareable.** On death or win, show a "run card" (night reached, team names, cause) for 3 s. It makes a good screenshot.
9. **Comeback players.** Players away 7+ days get a "Welcome back: +10 meta" gift and a note of what changed.
10. **Group perks.** Joining the Roblox group gives a cosmetic fire colour, not power.
11. **Anti-grief.** Players can't put out the team fire, take items from another player's slot or destroy others' walls. Shared chests have "take" limits (5 items per 10 s) and logs.

## 10. Live ops and update cadence

Read [[12 Live Ops and Launch]]. Survival updates add **new ways to play a run**, not just bigger numbers.

### Cadence (our targets)

| Rhythm | Content | Example |
|---|---|---|
| Weekly (same weekday and hour, every week) | 1 class or 1 night event or 1 landmark, balance pass, new code | "New night event: Fog Night" |
| Every 3-4 weeks | Biome or map section, boss, quest track | "The Frozen Lake update" |
| Seasonal (Halloween, winter, summer) | A 2-3 part event over 2-3 weeks, event currency, event class, limited cosmetics | 99 Nights' Halloween update ran in parts, ending with the Hedge Maze and a Carnival Games area [17][18] |
| Side-loop drop (once per season) | A new verb (fishing, cooking, farming) | 99 Nights' Fishing update [20] |
| Mode drop | Endless, Nightmare, speedrun, one-life | Dead Rails listings carry tags such as [ENDLESS], [HEATWAVE] and [👻EVENT] in their titles [24] |

### Update-day rules

- Announce the exact time in UTC and the player's local time on the game page and in the lobby countdown board 48 hours ahead. 99 Nights updates were announced with a scheduled time and a notify option on the event page [19].
- Give a small reward for being online at update time, as in 99 Nights' "Update Party" diamonds [16]. Ours is 5 meta for being in a server during the first 30 minutes after the update.
- Put the update name in the title tag for 7 days, for example "[🎃 HALLOWEEN] Game Name," then remove it.
- Ship a code with each update (5-20 meta) and show the code entry in the lobby, not hidden in settings.
- Every update has one headline (new class, new boss) for the thumbnail, plus 3-5 smaller changes.

### What to watch after each update

| Metric | Healthy target | If it misses |
|---|---|---|
| Night-1 death rate (new players) | < 3% | Night 1 too hard; lower damage |
| Median night reached (new players) | 5-8 | Under 4: too hard; over 12: too easy |
| Runs per session | ≥ 1.6 | Results screen not pulling "Play again" |
| Party size average | ≥ 2.2 | Invites hidden; solo too comfortable |
| D1 retention | Track against our previous games | See [[12 Live Ops and Launch]] |
| % of runs ending in a disconnect | < 10% | Runs too long or a frustration spike |

## 11. Building it in Studio

Read [[13 Building It Right]] and [[14 Roblox Studio Workflow]] first. This section is the survival-specific architecture. Builder owns the code, Scenic the map and lighting, Frame the HUD, Librarian the enemies and effects, and Merchant the purchase modules.

### Places

| Place | Role | Contents |
|---|---|---|
| Lobby (start place) | Social hub and store | Party pads, class wall, shop, leaderboards, code box, quest of the day |
| Run | One reserved server per party | The map, the base, the whole run, the results screen |
| (Disaster-round games) | Single place | Lobby tower plus map pool in `ServerStorage.Maps` |

Both places are in one universe so they share DataStores. Teleports don't work in Studio; test lobby-to-run in a published test universe [63][64][65].

### Systems list (camp survival)

| # | System | Owner | Server or client | Depends on |
|---|---|---|---|---|
| 1 | PartyPads + Teleport | Builder | Server (lobby) | Profiles |
| 2 | RunDirector (state machine) | Builder | Server (run) | Clock, all run systems |
| 3 | Clock (shared module) | Builder | Both | `RunStart` attribute |
| 4 | LightingClient (presets, tweens) | Scenic plus Builder | Client | Clock |
| 5 | Campfire (fuel, level, safe radius) | Builder | Server | Inventory |
| 6 | Needs (hunger, stamina) | Builder | Server, with client display | Inventory |
| 7 | Inventory | Builder | Server, mirrored to Player attributes | — |
| 8 | Gathering (resource nodes) | Builder | Server | Inventory, CollectionService tags |
| 9 | Crafting | Builder | Server | Recipes, Inventory |
| 10 | Placement (build mode) | Builder plus Frame | Client preview, server validate | Inventory |
| 11 | NightDirector (waves) | Builder plus Balance | Server | Clock, Campfire |
| 12 | EnemyAI | Builder plus Librarian | Server | Campfire |
| 13 | Combat + Downed/Revive | Builder | Server | — |
| 14 | NightEvents | Builder | Server, with client VFX | NightDirector |
| 15 | Loot (chests, tables) | Builder plus Balance | Server | Inventory |
| 16 | Quests (board, tracks) | Builder plus Frame | Server | Inventory, Loot |
| 17 | Results + Meta payout | Builder | Server | Profiles |
| 18 | Profiles (DataStore) | Builder (Reviewer audits) | Server | — |
| 19 | Receipts (products, passes) | Merchant | Server | Profiles |
| 20 | Analytics funnel | Liveops plus Builder | Server | — |
| 21 | HUD, crafting, build mode, results UI | Frame | Client | Attributes, remotes |

### Folder layout

```
ReplicatedStorage
  Shared/            Clock, Recipes, Items, Config (all tunables), LootTables (read-only copy for UI)
  Remotes/           Craft (RemoteFunction), Place, Eat, Sprint, Equip (RemoteEvent)
                     PhaseChanged, Warning, Toast, RunResult (RemoteEvent, server -> client)
                     FX (UnreliableRemoteEvent, cosmetic only)
  Assets/            BuildPreviews (ghost copies), VFX, UI icons
ServerScriptService
  Run/               RunDirector, RunClock, Campfire, Needs, Inventory, Gathering, Crafting, Placement,
                     NightDirector, EnemyAI, Combat, NightEvents, Loot, Quests, Results
  Data/              Profiles, Receipts
  Lobby/             PartyPads, ClassWall, Leaderboards, Codes   (lobby place only)
ServerStorage
  Buildables/        Wall, Spikes, Torch, Bed (Models, pivot at bottom centre, axis-aligned)
  Enemies/           Wolf, Runner, Brute, Stalker, bosses
  Assets/            Loot drops, chest models
Workspace
  Map/               Ground, Rings/Ring1..Ring5, Landmarks, Paths   (Scenic)
  Camp/              Campfire (Flame/PointLight, FeedPrompt), Workbench (tag "Workbench"), QuestBoard
  Builds/  Enemies/  Drops/
StarterPlayer/StarterPlayerScripts
  LightingClient, HudController, BuildMode, InputController, SpectateController
StarterGui
  HUD (ScreenGui), Crafting, Results, Settings   (Frame)
```

### Remotes

| Remote | Type | Direction | Payload | Server checks |
|---|---|---|---|---|
| Craft | RemoteFunction | C→S | recipeId: string | Type, recipe exists, near station (14 studs), has items, bag space, 4 per s |
| Place | RemoteEvent | C→S | itemId: string, target: Vector3, quarterTurns: number | Types, owns item, distance ≤ 24, inside build zone, ground ray, overlap box, part cap |
| Eat | RemoteEvent | C→S | itemId: string | Owns food, cooldown 1 s, not downed |
| Sprint | RemoteEvent | C→S | on: boolean | Stamina > 0 on server; server sets WalkSpeed |
| Equip | RemoteEvent | C→S | slot: number | 1-6, slot has a tool |
| PhaseChanged | RemoteEvent | S→C | phase: string, index: number | — |
| Warning | RemoteEvent | S→C | kind, seconds, title, hint | — |
| Toast | RemoteEvent | S→C | text, colour | — |
| RunResult | RemoteEvent | S→C | nights, meta, badges, cause | — |
| FX | UnreliableRemoteEvent | S→C | effect id, position | Cosmetic only; loss is fine |

Chopping, looting, feeding, reviving and opening the quest board all use `ProximityPrompt.Triggered` on the server, so they need no remotes. The prompt's own distance check runs on the server too.

### Data schema (profile v1)

```lua
-- One key per player: "u_<UserId>" in DataStore "Profiles_v1"
{
	version = 1,
	meta = 0,                                   -- persistent currency
	classes = { Survivor = true },              -- owned classes
	classLevels = {},                           -- [classId] = 0..3
	equippedClass = "Survivor",
	vehicles = { Starter = true },              -- journey games
	cosmetics = {},                             -- [cosmeticId] = true
	bestNight = { Normal = 0, Hard = 0, Nightmare = 0 },
	runs = 0,
	badges = {},                                -- [badgeKey] = true (mirrors Roblox badges, pays meta once)
	quests = { daily = {}, weekly = {}, resetAt = 0 },
	codes = {},                                 -- [code] = true
	receipts = {},                              -- [PurchaseId] = true, trimmed to the last 100
	stats = { nightsSurvived = 0, kills = 0, revives = 0, fuelFed = 0 },
	settings = { brightness = 0, shake = true },
	firstJoin = 0, lastJoin = 0,
}
```

Run state lives only in the run server's memory (Inventory, fire, builds). Don't save it. A run that crashes is lost, so pay meta on milestones as they happen (section 5).

### Luau: shared clock

Every client computes the time of day from shared server time, so lighting is smooth and in sync without replicating every frame [57][58]. `ClockTime` is hours as a decimal, so 18.25 is 6:15 PM [59]. `ClockTime`, `TimeOfDay` and `SetMinutesAfterMidnight` are documented on the Lighting reference [55]. DevForum examples run day and night at different speeds, which is what the separate day and night lengths below do [56].

```lua
--!strict
-- ReplicatedStorage/Shared/Clock (ModuleScript)
local Workspace = game:GetService("Workspace")

local Clock = {}

export type Phase = "Day" | "Night"
export type Sample = { index: number, phase: Phase, clockTime: number, secondsLeft: number }

local FIRST_DAY = 200 -- day 1 is 3:20
local DAY = 240
local NIGHT_BASE = 120
local NIGHT_GROWTH = 5
local NIGHT_MAX = 180

function Clock.dayLength(n: number): number
	return if n == 1 then FIRST_DAY else DAY
end

function Clock.nightLength(n: number): number
	if n == 1 then
		return 60
	end
	return math.min(NIGHT_MAX, NIGHT_BASE + NIGHT_GROWTH * (n - 2))
end

-- Returns nil until the RunDirector has set Workspace.RunStart.
function Clock.sample(): Sample?
	local start = Workspace:GetAttribute("RunStart")
	if typeof(start) ~= "number" then
		return nil
	end
	local elapsed = math.max(0, Workspace:GetServerTimeNow() - start)
	local n = 1
	while true do
		local day = Clock.dayLength(n)
		if elapsed < day then
			-- day maps onto 06:00..20:00
			return { index = n, phase = "Day", clockTime = 6 + 14 * (elapsed / day), secondsLeft = day - elapsed }
		end
		elapsed -= day
		local night = Clock.nightLength(n)
		if elapsed < night then
			-- night maps onto 20:00..06:00
			return { index = n, phase = "Night", clockTime = (20 + 10 * (elapsed / night)) % 24, secondsLeft = night - elapsed }
		end
		elapsed -= night
		n += 1
	end
end

return Clock
```

```lua
--!strict
-- StarterPlayerScripts/LightingClient (LocalScript)
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Clock = require(ReplicatedStorage.Shared.Clock)

RunService.RenderStepped:Connect(function()
	local s = Clock.sample()
	if s then
		Lighting.ClockTime = s.clockTime
	end
end)
-- Phase presets (Ambient, Atmosphere, ColorCorrection) are tweened over 8 s in the PhaseChanged handler.
```

```lua
--!strict
-- ServerScriptService/Run/RunClock (Script): announces phases; RunDirector sets RunStart when the party has loaded
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local Clock = require(ReplicatedStorage.Shared.Clock)
local Remotes = ReplicatedStorage.Remotes

local lastKey = ""
local warnedKey = ""
while true do
	local s = Clock.sample()
	if s then
		local key = s.phase .. s.index
		if key ~= lastKey then
			lastKey = key
			Workspace:SetAttribute("Night", s.index)
			Workspace:SetAttribute("Phase", s.phase) -- set last: listeners read Night when Phase changes
			Remotes.PhaseChanged:FireAllClients(s.phase, s.index)
		end
		if s.phase == "Day" and s.secondsLeft <= 15 and warnedKey ~= key then
			warnedKey = key
			Remotes.Warning:FireAllClients("Night", math.ceil(s.secondsLeft), "Night " .. s.index, "Stay near the fire")
		end
	end
	task.wait(0.2)
end
```

### Luau: inventory (server)

```lua
--!strict
-- ServerScriptService/Run/Inventory (ModuleScript)
local Players = game:GetService("Players")

type Bag = { slots: number, items: { [string]: number } }

local Inventory = {}
local bags: { [Player]: Bag } = {}
local STACK: { [string]: number } = { Log = 10 }
local DEFAULT_STACK = 20

local function bag(p: Player): Bag
	local b = bags[p]
	if not b then
		b = { slots = 8, items = {} }
		bags[p] = b
	end
	return b
end

local function slotsUsed(b: Bag): number
	local used = 0
	for id, n in b.items do
		used += math.ceil(n / (STACK[id] or DEFAULT_STACK))
	end
	return used
end

local function mirror(p: Player, id: string, n: number)
	p:SetAttribute("Inv_" .. id, n) -- the HUD reads these attributes
end

function Inventory.count(p: Player, id: string): number
	return bag(p).items[id] or 0
end

function Inventory.add(p: Player, id: string, n: number): boolean
	local b = bag(p)
	local before = b.items[id] or 0
	b.items[id] = before + n
	if slotsUsed(b) > b.slots then
		b.items[id] = if before > 0 then before else nil
		return false
	end
	mirror(p, id, before + n)
	return true
end

function Inventory.take(p: Player, id: string, n: number): boolean
	local b = bag(p)
	local have = b.items[id] or 0
	if have < n then
		return false
	end
	local left = have - n
	b.items[id] = if left > 0 then left else nil
	mirror(p, id, left)
	return true
end

function Inventory.takeAll(p: Player, cost: { [string]: number }): boolean
	for id, n in cost do
		if Inventory.count(p, id) < n then
			return false
		end
	end
	for id, n in cost do
		Inventory.take(p, id, n)
	end
	return true
end

function Inventory.addSlots(p: Player, n: number)
	bag(p).slots += n
	p:SetAttribute("BagSlots", bag(p).slots)
end

Players.PlayerRemoving:Connect(function(p)
	bags[p] = nil
end)

return Inventory
```

### Luau: campfire fuel and safe radius

```lua
--!strict
-- ServerScriptService/Run/Campfire (Script)
local ServerScriptService = game:GetService("ServerScriptService")
local Inventory = require(ServerScriptService.Run.Inventory)

local fire = workspace:WaitForChild("Camp"):WaitForChild("Campfire") :: Model
local light = fire:WaitForChild("Flame"):WaitForChild("PointLight") :: PointLight
local prompt = fire:WaitForChild("FeedPrompt") :: ProximityPrompt

local FUEL_VALUE: { [string]: number } = { FuelCan = 150, Coal = 75, Log = 30 }
local FEED_ORDER = { "FuelCan", "Coal", "Log" }
local TICK = 0.25 -- attribute updates 4x per second, not every frame

fire:SetAttribute("Level", 1)
fire:SetAttribute("Fuel", 120)

local function maxFuel(level: number): number
	return 300 * level
end

local function safeRadius(fuel: number, level: number): number
	local frac = math.clamp(fuel / maxFuel(level), 0, 1)
	return (12 + 6 * level) + 28 * math.sqrt(frac)
end

prompt.ActionText = "Feed"
prompt.ObjectText = "Campfire"
prompt.HoldDuration = 0
prompt.MaxActivationDistance = 12

prompt.Triggered:Connect(function(player: Player)
	local level = fire:GetAttribute("Level") :: number
	local fuel = fire:GetAttribute("Fuel") :: number
	local fed = 0
	for _, id in FEED_ORDER do
		while Inventory.count(player, id) > 0 and fuel < maxFuel(level) do
			Inventory.take(player, id, 1)
			fuel = math.min(maxFuel(level), fuel + FUEL_VALUE[id])
			fed += 1
		end
	end
	if fed > 0 then
		fire:SetAttribute("Fuel", fuel)
		fire:SetAttribute("LastFedBy", player.UserId)
	end
end)

while true do
	local level = fire:GetAttribute("Level") :: number
	local fuel = math.max(0, (fire:GetAttribute("Fuel") :: number) - TICK)
	fire:SetAttribute("Fuel", fuel)
	local radius = if fuel > 0 then safeRadius(fuel, level) else 0
	fire:SetAttribute("SafeRadius", radius)
	light.Enabled = fuel > 0
	light.Range = math.min(60, radius) -- PointLight range tops out at 60
	task.wait(TICK)
end
```

### Luau: crafting (server)

```lua
--!strict
-- ReplicatedStorage/Shared/Recipes (ModuleScript)
export type Recipe = { needs: { [string]: number }, gives: string, amount: number?, station: string?, tier: number }

local Recipes: { [string]: Recipe } = {
	Spear = { needs = { Log = 3, Stone = 2 }, gives = "Spear", station = "Workbench", tier = 1 },
	StoneAxe = { needs = { Log = 3, Stone = 2 }, gives = "StoneAxe", station = "Workbench", tier = 1 },
	Wall = { needs = { Log = 4 }, gives = "Wall", station = "Workbench", tier = 1 },
	Bandage = { needs = { Cloth = 2 }, gives = "Bandage", amount = 2, tier = 1 },
	IronAxe = { needs = { Log = 6, Stone = 6, Scrap = 4 }, gives = "IronAxe", station = "Workbench", tier = 2 },
}

return Recipes
```

```lua
--!strict
-- ServerScriptService/Run/Crafting (Script)
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Recipes = require(ReplicatedStorage.Shared.Recipes)
local Inventory = require(ServerScriptService.Run.Inventory)

local STATION_RANGE = 14
local lastCraft: { [Player]: number } = {}

local function nearStation(player: Player, tag: string): boolean
	local char = player.Character
	local root = if char then char:FindFirstChild("HumanoidRootPart") :: BasePart? else nil
	if not root then
		return false
	end
	for _, station in CollectionService:GetTagged(tag) do
		if station:IsA("Model") and (station:GetPivot().Position - root.Position).Magnitude <= STATION_RANGE then
			return true
		end
	end
	return false
end

ReplicatedStorage.Remotes.Craft.OnServerInvoke = function(player: Player, recipeId: unknown)
	if typeof(recipeId) ~= "string" then
		return false, "Bad request"
	end
	local recipe = Recipes[recipeId]
	if not recipe then
		return false, "Unknown recipe"
	end
	local now = os.clock()
	if now - (lastCraft[player] or 0) < 0.25 then
		return false, "Slow down"
	end
	lastCraft[player] = now
	if recipe.station and not nearStation(player, recipe.station) then
		return false, "Go to a " .. recipe.station
	end
	if not Inventory.takeAll(player, recipe.needs) then
		return false, "Missing items"
	end
	if not Inventory.add(player, recipe.gives, recipe.amount or 1) then
		for id, n in recipe.needs do
			Inventory.add(player, id, n) -- refund: the slots we just freed fit them again
		end
		return false, "Bag full"
	end
	return true, recipe.gives
end

Players.PlayerRemoving:Connect(function(p)
	lastCraft[p] = nil
end)
```

### Luau: build placement (server validation)

The client shows a ghost snapped to the same 4-stud grid and sends only the item, the target point and a quarter-turn count. The server snaps again, finds the ground itself, and checks distance, zone, overlap and cost. That follows the common DevForum pattern of grid snapping with `math.floor` [60][61], with the plot kept a multiple of the grid and rotation in fixed steps to avoid gaps [60][62].

```lua
--!strict
-- ServerScriptService/Run/Placement (Script)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Inventory = require(ServerScriptService.Run.Inventory)

local GRID = 4
local MAX_DIST = 24
local MAX_PARTS_PER_PLAYER = 150
local BUILD_ZONE_RADIUS = 120

local Buildables = ServerStorage:WaitForChild("Buildables")
local buildsFolder = workspace:WaitForChild("Builds")
local ground = workspace:WaitForChild("Map"):WaitForChild("Ground")
local fire = workspace:WaitForChild("Camp"):WaitForChild("Campfire") :: Model
local partsUsed: { [Player]: number } = {}

local function snap(v: number): number
	return math.floor(v / GRID + 0.5) * GRID
end

local function partCount(model: Model): number
	local n = 0
	for _, d in model:GetDescendants() do
		if d:IsA("BasePart") then
			n += 1
		end
	end
	return n
end

ReplicatedStorage.Remotes.Place.OnServerEvent:Connect(function(player: Player, itemId: unknown, target: unknown, quarterTurns: unknown)
	if typeof(itemId) ~= "string" or typeof(target) ~= "Vector3" or typeof(quarterTurns) ~= "number" then
		return
	end
	local template = Buildables:FindFirstChild(itemId)
	if not template or not template:IsA("Model") then
		return
	end
	local char = player.Character
	local root = if char then char:FindFirstChild("HumanoidRootPart") :: BasePart? else nil
	if not root or Inventory.count(player, itemId) < 1 then
		return
	end

	-- the server finds the ground itself instead of trusting the client's Y
	local x, z = snap(target.X), snap(target.Z)
	local rayParams = RaycastParams.new()
	rayParams.FilterType = Enum.RaycastFilterType.Include
	rayParams.FilterDescendantsInstances = { workspace.Terrain, ground, buildsFolder }
	local hit = workspace:Raycast(Vector3.new(x, target.Y + 20, z), Vector3.new(0, -60, 0), rayParams)
	if not hit then
		return
	end
	local pos = Vector3.new(x, hit.Position.Y, z)
	if (root.Position - pos).Magnitude > MAX_DIST then
		return
	end
	if (fire:GetPivot().Position - pos).Magnitude > BUILD_ZONE_RADIUS then
		return
	end

	local turns = math.floor(quarterTurns) % 4
	local cf = CFrame.new(pos) * CFrame.Angles(0, math.rad(90 * turns), 0)
	local _, size = template:GetBoundingBox()

	local ignore: { Instance } = { workspace.Terrain, ground }
	for _, p in Players:GetPlayers() do
		if p.Character then
			table.insert(ignore, p.Character)
		end
	end
	local overlap = OverlapParams.new()
	overlap.FilterType = Enum.RaycastFilterType.Exclude
	overlap.FilterDescendantsInstances = ignore
	-- templates have their pivot at the bottom centre, so the box centre is half a height up
	local hits = workspace:GetPartBoundsInBox(cf * CFrame.new(0, size.Y / 2, 0), size * 0.95, overlap)
	if #hits > 0 then
		return
	end

	local count = partCount(template)
	if (partsUsed[player] or 0) + count > MAX_PARTS_PER_PLAYER then
		return
	end
	if not Inventory.take(player, itemId, 1) then
		return
	end

	local piece = template:Clone()
	piece:PivotTo(cf)
	piece:SetAttribute("Owner", player.UserId)
	piece:SetAttribute("HP", 200)
	piece.Parent = buildsFolder
	partsUsed[player] = (partsUsed[player] or 0) + count
end)

Players.PlayerRemoving:Connect(function(p)
	partsUsed[p] = nil
end)
```

### Luau: night waves

```lua
--!strict
-- ServerScriptService/Run/NightDirector (Script)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local Workspace = game:GetService("Workspace")
local Clock = require(ReplicatedStorage.Shared.Clock)

local fire = workspace:WaitForChild("Camp"):WaitForChild("Campfire") :: Model
local enemiesFolder = workspace:WaitForChild("Enemies")
local MAX_ALIVE = 40
local seed = Workspace:GetAttribute("Seed")
local rng = Random.new(if typeof(seed) == "number" then seed else os.time())

local function enemiesFor(night: number, players: number): number
	local scale = 0.6 + 0.4 * math.clamp(players, 1, 6)
	return math.min(MAX_ALIVE, math.ceil(3 * 1.18 ^ (night - 1) * scale))
end

local function pickType(night: number): string
	if night >= 15 and rng:NextNumber() < 0.3 then
		return "Brute"
	elseif night >= 5 and rng:NextNumber() < 0.35 then
		return "Runner"
	end
	return "Wolf"
end

local function spawnPoint(): Vector3
	local center = fire:GetPivot().Position
	local safe = fire:GetAttribute("SafeRadius")
	local r = (if typeof(safe) == "number" then safe else 40) + 60 + rng:NextNumber() * 40
	local a = rng:NextNumber() * math.pi * 2
	local top = center + Vector3.new(math.cos(a) * r, 80, math.sin(a) * r)
	local hit = workspace:Raycast(top, Vector3.new(0, -200, 0)) -- land on whatever ground is there
	return if hit then hit.Position + Vector3.new(0, 3, 0) else top
end

local function runNight(night: number)
	local total = enemiesFor(night, #Players:GetPlayers())
	local window = Clock.nightLength(night) * 0.4 -- all spawns land in the first 40% of the night
	for _ = 1, total do
		if Workspace:GetAttribute("Phase") ~= "Night" then
			return
		end
		while #enemiesFolder:GetChildren() >= MAX_ALIVE do
			task.wait(1)
		end
		local template = ServerStorage.Enemies:FindFirstChild(pickType(night))
		if template and template:IsA("Model") then
			local enemy = template:Clone()
			enemy:PivotTo(CFrame.new(spawnPoint()))
			enemy:SetAttribute("Night", night)
			enemy.Parent = enemiesFolder -- EnemyAI starts on ChildAdded
		end
		task.wait(window / total)
	end
end

Workspace:GetAttributeChangedSignal("Phase"):Connect(function()
	if Workspace:GetAttribute("Phase") == "Night" then
		task.spawn(runNight, Workspace:GetAttribute("Night") :: number)
	else
		for _, enemy in enemiesFolder:GetChildren() do
			enemy:SetAttribute("Fleeing", true) -- AI plays a flee animation, then the enemy is destroyed
			task.delay(2, function()
				enemy:Destroy()
			end)
		end
	end
end)
```

### Luau: enemy chase that respects the light

```lua
--!strict
-- ServerScriptService/Run/EnemyAI (Script)
local PathfindingService = game:GetService("PathfindingService")
local Players = game:GetService("Players")

local fire = workspace:WaitForChild("Camp"):WaitForChild("Campfire") :: Model
local enemiesFolder = workspace:WaitForChild("Enemies")

local function nearestTarget(from: Vector3): BasePart?
	local best: BasePart? = nil
	local bestDist = math.huge
	for _, p in Players:GetPlayers() do
		local char = p.Character
		local root = if char then char:FindFirstChild("HumanoidRootPart") :: BasePart? else nil
		local hum = if char then char:FindFirstChildOfClass("Humanoid") else nil
		if root and hum and hum.Health > 0 then
			local d = (root.Position - from).Magnitude
			if d < bestDist then
				best, bestDist = root, d
			end
		end
	end
	return best
end

local function think(enemy: Model)
	local hum = enemy:FindFirstChildOfClass("Humanoid")
	local root = enemy.PrimaryPart
	if not hum or not root then
		return
	end
	root:SetNetworkOwner(nil) -- the server simulates enemies, so clients can't fling them
	local path = PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = false })
	while enemy.Parent and hum.Health > 0 and not enemy:GetAttribute("Fleeing") do
		local target = nearestTarget(root.Position)
		if not target then
			task.wait(1)
			continue
		end
		local firePos = fire:GetPivot().Position
		local safe = fire:GetAttribute("SafeRadius")
		local safeR = if typeof(safe) == "number" then safe else 0
		local goal = target.Position
		if (goal - firePos).Magnitude < safeR then
			-- the target is in the light: prowl at the edge instead of entering
			local away = root.Position - firePos
			local dir = if away.Magnitude > 0.1 then away.Unit else Vector3.xAxis
			goal = firePos + dir * (safeR + 4)
		end
		if (goal - root.Position).Magnitude < 40 then
			hum:MoveTo(goal) -- close by: walk straight, which is cheaper than pathfinding
			task.wait(0.3)
		else
			local ok = pcall(function()
				path:ComputeAsync(root.Position, goal)
			end)
			if ok and path.Status == Enum.PathStatus.Success then
				local waypoints = path:GetWaypoints()
				for i = 2, math.min(#waypoints, 5) do -- follow a few waypoints, then re-plan
					hum:MoveTo(waypoints[i].Position)
					hum.MoveToFinished:Wait()
				end
			else
				hum:MoveTo(goal)
				task.wait(0.5)
			end
		end
		-- Attack (in the full version): within 4 studs and outside the light, play a 0.6 s wind-up,
		-- check the distance again, then call Combat.damage on the target's Humanoid.
	end
end

enemiesFolder.ChildAdded:Connect(function(child)
	if child:IsA("Model") then
		task.spawn(think, child)
	end
end)
```

### Luau: damage, downed and revive

All damage goes through one function, so lethal hits on players become a downed state instead of a death.

```lua
--!strict
-- ServerScriptService/Run/Combat (ModuleScript)
local Players = game:GetService("Players")

local Combat = {}
local BLEED_OUT = 30
local REVIVE_HP = 40

local function down(player: Player, char: Model, hum: Humanoid)
	char:SetAttribute("Downed", true)
	hum.Health = 1
	hum.WalkSpeed = 4
	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = "Revive"
	prompt.ObjectText = player.DisplayName
	prompt.HoldDuration = 3
	prompt.MaxActivationDistance = 8
	prompt.RequiresLineOfSight = false
	prompt.Parent = char:FindFirstChild("HumanoidRootPart") -- a LocalScript hides it for the downed player
	prompt.Triggered:Connect(function(helper: Player)
		if helper == player or not char:GetAttribute("Downed") then
			return
		end
		char:SetAttribute("Downed", nil)
		hum.Health = REVIVE_HP
		hum.WalkSpeed = 16
		prompt:Destroy()
	end)
	task.delay(BLEED_OUT, function()
		if char.Parent and char:GetAttribute("Downed") then
			prompt:Destroy()
			hum.Health = 0 -- real death: spectate, respawn at dawn
		end
	end)
end

function Combat.damage(hum: Humanoid, amount: number)
	local char = hum.Parent
	if not char or not char:IsA("Model") or hum.Health <= 0 or char:GetAttribute("Downed") then
		return
	end
	local player = Players:GetPlayerFromCharacter(char)
	if player and hum.Health - amount <= 0 then
		down(player, char, hum)
	else
		hum:TakeDamage(amount)
	end
end

return Combat
```

### Luau: disaster director (disaster-round variant)

```lua
--!strict
-- ServerScriptService/Rounds/DisasterDirector (Script)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local TweenService = game:GetService("TweenService")

type Disaster = { name: string, weight: number, hint: string, run: (map: Model) -> () }

local function forEachLiving(fn: (root: BasePart, hum: Humanoid) -> ())
	for _, p in Players:GetPlayers() do
		local char = p.Character
		local root = if char then char:FindFirstChild("HumanoidRootPart") :: BasePart? else nil
		local hum = if char then char:FindFirstChildOfClass("Humanoid") else nil
		if root and hum and hum.Health > 0 then
			fn(root, hum)
		end
	end
end

local Disasters: { Disaster } = {
	{
		name = "Flood",
		weight = 3,
		hint = "Get high!",
		run = function(map: Model)
			local water = map:FindFirstChild("FloodWater") :: BasePart
			TweenService:Create(water, TweenInfo.new(40, Enum.EasingStyle.Linear), {
				CFrame = water.CFrame + Vector3.new(0, 30, 0),
			}):Play()
			for _ = 1, 60 do
				local surface = water.Position.Y + water.Size.Y / 2
				forEachLiving(function(root, hum)
					if root.Position.Y < surface - 1 then
						hum:TakeDamage(10)
					end
				end)
				task.wait(1)
			end
		end,
	},
	-- Meteors, Tornado, Earthquake, Blizzard, Acid Rain: same shape, one counter-play each
}

local rng = Random.new()
local lastName = ""

local function pick(): Disaster
	local total = 0
	for _, d in Disasters do
		if d.name ~= lastName or #Disasters == 1 then
			total += d.weight
		end
	end
	local roll = rng:NextNumber() * total
	for _, d in Disasters do
		if d.name ~= lastName or #Disasters == 1 then
			roll -= d.weight
			if roll <= 0 then
				lastName = d.name
				return d
			end
		end
	end
	return Disasters[1]
end

local maps = ServerStorage:WaitForChild("Maps"):GetChildren()
while true do
	task.wait(15) -- intermission
	if #Players:GetPlayers() == 0 then
		continue
	end
	local map = (maps[rng:NextInteger(1, #maps)] :: Model):Clone()
	map.Parent = workspace
	local spawnPart = map:FindFirstChild("Spawn") :: BasePart
	forEachLiving(function(root)
		local char = root.Parent :: Model -- the root's parent is the character Model
		char:PivotTo(spawnPart.CFrame + Vector3.new(rng:NextNumber(-10, 10), 4, rng:NextNumber(-10, 10)))
	end)
	local disaster = pick()
	ReplicatedStorage.Remotes.Warning:FireAllClients("Disaster", 10, disaster.name, disaster.hint)
	task.wait(10)
	disaster.run(map)
	forEachLiving(function(root)
		-- survivors: +1 point and coins through the Profiles module (not shown)
	end)
	map:Destroy()
end
```

### Luau: party pads and the teleport into a reserved server

`TeleportOptions` is the optional argument to `TeleportAsync`. Setting `ShouldReserveServer` sends the whole party to a fresh reserved server [66], which avoids the party being split across servers that have room [63][64][65].

```lua
--!strict
-- ServerScriptService/Lobby/PartyPads (Script)
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local TeleportService = game:GetService("TeleportService")

local RUN_PLACE_ID = 0 -- Builder sets this to the Run place's PlaceId (same universe)
local MAX_PARTY = 6
local COUNTDOWN = 15
local STEP = 0.25

local function playersOnPad(pad: BasePart): { Player }
	local list: { Player } = {}
	local seen: { [Player]: boolean } = {}
	local box = workspace:GetPartBoundsInBox(pad.CFrame + Vector3.new(0, 4, 0), Vector3.new(pad.Size.X, 8, pad.Size.Z))
	for _, part in box do
		local char = part:FindFirstAncestorOfClass("Model")
		local p = if char then Players:GetPlayerFromCharacter(char) else nil
		if p and not seen[p] and #list < MAX_PARTY then
			seen[p] = true
			table.insert(list, p)
		end
	end
	return list
end

local function launch(party: { Player }, difficulty: string)
	local options = Instance.new("TeleportOptions")
	options.ShouldReserveServer = true
	options:SetTeleportData({ difficulty = difficulty }) -- untrusted on arrival: re-check unlocks there
	for attempt = 1, 3 do
		local ok, err = pcall(function()
			TeleportService:TeleportAsync(RUN_PLACE_ID, party, options)
		end)
		if ok then
			return
		end
		warn("Teleport failed", attempt, err)
		task.wait(2 * attempt)
	end
end

for _, pad in CollectionService:GetTagged("PartyPad") do
	if not pad:IsA("BasePart") then
		continue
	end
	task.spawn(function()
		local timer = COUNTDOWN
		while true do
			local party = playersOnPad(pad)
			if #party == 0 then
				timer = COUNTDOWN
			else
				timer -= STEP
				if timer <= 0 then
					local difficulty = pad:GetAttribute("Difficulty")
					launch(party, if typeof(difficulty) == "string" then difficulty else "Normal")
					timer = COUNTDOWN
					task.wait(5)
				end
			end
			pad:SetAttribute("Countdown", math.ceil(timer)) -- the pad's BillboardGui shows these
			pad:SetAttribute("Count", #party)
			task.wait(STEP)
		end
	end)
end
```

### Luau: meta payout and saving the run result

```lua
--!strict
-- ServerScriptService/Data/RunRewards (ModuleScript)
local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("Profiles_v1")

local RunRewards = {}
local MILESTONES: { [number]: number } = { [5] = 2, [10] = 4, [20] = 8, [30] = 12 }
local DIFF_MULT: { [string]: number } = { Normal = 1, Hard = 1.5, Nightmare = 2 }

function RunRewards.metaFor(nights: number, questSteps: number, tracksDone: number, finished: boolean, difficulty: string): number
	local m = 1 + math.floor(nights / 2) + questSteps + 3 * tracksDone
	for night, bonus in MILESTONES do
		if nights >= night then
			m += bonus
		end
	end
	if finished then
		m += 30
	end
	return math.floor(m * (DIFF_MULT[difficulty] or 1))
end

-- Called once per player: at run end, or on PlayerRemoving (guard with a "paid" flag),
-- and for everyone still in the server from game:BindToClose.
function RunRewards.save(userId: number, difficulty: string, nights: number, meta: number): boolean
	local ok, err = pcall(function()
		store:UpdateAsync("u_" .. userId, function(old)
			local p = old or { version = 1, meta = 0, runs = 0, bestNight = {}, stats = { nightsSurvived = 0 } }
			p.meta += meta
			p.runs += 1
			p.bestNight[difficulty] = math.max(p.bestNight[difficulty] or 0, nights)
			p.stats.nightsSurvived += nights
			return p
		end)
	end)
	if not ok then
		warn("Run save failed", userId, err) -- queue a retry; never drop earned meta silently
	end
	return ok
end

return RunRewards
```

Two places write to the same profile, so both use `UpdateAsync` with deltas, and the lobby reloads the profile on every join (players arrive back from runs). If the game later caches profiles for a whole session, move to a session-locking profile library and have Reviewer audit it.

### Luau: currency packs (Merchant)

```lua
--!strict
-- ServerScriptService/Data/Receipts (Script)
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")
local store = DataStoreService:GetDataStore("Profiles_v1")

local META_PACKS: { [number]: number } = {
	-- [productId] = meta. Merchant fills in the real ids after the owner creates the products.
}

MarketplaceService.ProcessReceipt = function(info)
	local amount = META_PACKS[info.ProductId]
	if not amount then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local ok = pcall(function()
		store:UpdateAsync("u_" .. info.PlayerId, function(old)
			local p = old or { version = 1, meta = 0, receipts = {} }
			p.receipts = p.receipts or {}
			if p.receipts[info.PurchaseId] then
				return p -- already granted: idempotent
			end
			p.receipts[info.PurchaseId] = true
			p.meta += amount
			return p
		end)
	end)
	return if ok then Enum.ProductPurchaseDecision.PurchaseGranted else Enum.ProductPurchaseDecision.NotProcessedYet
end
```

In-run products (self-revive, fuel crate) are handled by the run place's own `ProcessReceipt`. Apply them only when the player is in the right state (downed with no teammate near; the fire burning) and only offer them in that state.

### Analytics funnel (Liveops)

Log the first-run funnel with `AnalyticsService:LogOnboardingFunnelStepEvent(player, step, name)`: 1 Arrived, 2 FirstChop, 3 FirstFeed, 4 FirstCraft, 5 Night1Start, 6 Night1Survived, 7 ResultsSeen, 8 SecondRunStarted. Log custom events for "NightReached" (value = night), "Downed", "Revived", "FireOut" and "EventNight" (name). These feed the targets in section 10.

### Building a camp-survival vertical slice in 16 steps

1. Architect writes the loop statements, the run finish line and the class list in `plan.md`.
2. Balance builds the night-curve and meta simulation in `sim/` from section 5 and writes the results to `economy.md`.
3. Scenic greyboxes the map: base at the centre, 5 rings, 8 landmark silhouettes, paths. No art yet.
4. Builder makes `Shared/Config` with every tunable from section 5 (day and night lengths, fuel values, curve constants).
5. Builder adds Clock, RunClock and LightingClient; Scenic adds the phase presets. Check: a 6-minute cycle plays smoothly on two clients.
6. Builder adds Inventory, Gathering (trees and rocks tagged `Tree`/`Rock` with ProximityPrompts or tool hits) and Campfire. Check: chop, feed, light radius grows.
7. Builder adds Recipes and Crafting; Frame builds the crafting modal. Check: craft a spear at the workbench, fail away from it.
8. Builder adds NightDirector, EnemyAI and Combat with one enemy type (Wolf) from Librarian. Check: night 1 with 3 wolves; they prowl at the light's edge.
9. Grey-box playtest: is night scary with grey boxes? If not, fix tells, audio and darkness before going on.
10. Builder adds Placement; Frame builds build mode with the ghost and Highlight. Check: walls snap and the server rejects overlaps.
11. Builder adds Downed/Revive and spectate. Check with 2 players.
12. Builder adds the Quest board with one rescue track; Frame builds the board UI.
13. Builder adds Results and RunRewards; Frame builds the results screen. Check: meta saves and reloads.
14. Builder adds the Lobby place, PartyPads and the class wall; test teleports in a published test universe.
15. Merchant adds passes and products (prices from the owner); Reviewer audits receipts and saves.
16. Playtest runs 10 full runs (solo, 2, 4 players) and logs night reached, deaths and FPS. Kid Tester runs the first five minutes cold.

## 12. Twists that work

A fresh survival game keeps the proven structure (safe zone, clock, escalating nights, meta-currency) and changes one big thing. GameAnalytics' read on Dead Rails is exactly this: a familiar format with one new element, its Wild West setting [22].

| Twist | What changes | Proven by | Fresh take for us | Watch out |
|---|---|---|---|---|
| Setting swap | The skin and the threat, not the loop | Dead Rails: Wild West plus zombies plus trains [22][23] | Deep-sea station (oxygen instead of fire), arctic outpost (warmth), haunted carnival, flooded city on rooftops | The setting has to make a thumbnail on its own |
| The vehicle is the base | Safe zone moves; distance is progress | Dead Rails trains [28][29]; A Dusty Trip's car built from parts [40] | River boat, airship, giant walking mech, school bus at the end of the world | Vehicle physics on Roblox needs care; see [[Genre - Racing and Vehicles]] |
| Rescue as the finish line | Survive plus a quest arc | 99 Nights' four missing children [9][10] | Rescue lost pets, gather a scattered crew, rebuild a radio part by part | Each rescue must be possible on its own, not all-or-nothing |
| Disasters as the enemy | No monsters; the world attacks | Natural Disaster Survival [36] | Disasters plus building: build a shelter in 60 s, then the disaster tests it | Keep each disaster readable with one counter-play |
| One player is the monster | Asymmetric: 1 hunter vs 5 campers | Survive the Killer's killer vs survivors, with survivor-only crawl routes [49] | A camp game where one random camper becomes the night stalker after night 3 | Balance is hard; the monster needs clear limits |
| Build, then test | Two phases: design, then survive | Build A Boat For Treasure, named as an established Roblox survival format [22] | Build a raft, then survive a 5-minute storm crossing | Building tools must be fast on mobile |
| Endless mode | No finish line; best-night leaderboard | Dead Rails listings tagged [ENDLESS] [24] | Weekly seeded endless run: everyone gets the same map and events | Needs a hard curve so runs end |
| Side verb per season | A new activity inside the run | 99 Nights' Fishing update [20], Carnival Games before the Hedge Maze [18] | Cooking contest at camp, stargazing for night buffs, a farming patch | The side verb must feed the main loop (food, fuel, buffs) |
| Traveling trader | Day-two decisions | 99 Nights' Pelt Trader on day two [15] | Trader stock rolls from the run seed; rare deals on event nights | Don't make the trader the only source of key items |
| Classes as run modifiers | Each run is shaped by the team's mix | 99 Nights' class roster [12][13] | "Team synergy" bonuses (Medic plus Builder gives sturdier walls) | Avoid one "must-pick" class |
| Tribes and shared bases | Social structure in sandbox survival | Booga Booga's tribes [46][47] | Small crews (2-6) with a shared flag and chest; weekly crew leaderboard | PvP griefing; keep raids opt-in |
| The map is the fire | Map size tied to progress | Fire upgrades that expand the explorable map in 99 Nights [6] | Light towers that each open one sector when fuelled | Fuel chores; make towers self-sustaining once built |

Rules for twists:
- Change one of these: setting, base type, threat type or finish line. Changing two is a risk. Changing three is a new genre.
- Write the twist into the title or thumbnail. If it doesn't show in a 150×150 thumbnail, it isn't the twist.
- Test the twist in the grey box (step 9 of section 11). A twist that is only art isn't a twist.

## 13. Failure modes

1. **Night is too dark on phones.** Players can't see enemies and quit. Fix: the minimum ambient values in section 8, a personal light on each character and a brightness setting.
2. **Night isn't scary.** Enemies walk straight in and die. Fix: tells, audio, fog, prowling at the light's edge and stalkers that retreat from the flashlight (law 9).
3. **The first night comes too late.** Players leave in a quiet tutorial day. Fix: first night by 3:40 (section 4).
4. **Failed runs pay nothing.** Players stop after one or two losses. Fix: the meta formula pays from night 1 (section 5).
5. **Solo is impossible.** Friendless new players churn. Fix: enemy scaling by party size (law 8).
6. **Co-op is optional.** Players don't invite friends. Fix: three-job nights and role classes (law 7).
7. **Griefing.** Someone hoards fuel, steals from chests or traps the base. Fix: per-player inventories, chest take limits, no destroying others' builds, and kick votes in reserved servers.
8. **Server lag by night 10.** Too many drops, enemies and parts. Fix: caps (law 19), anchored drops, MicroProfiler checks.
9. **Runs too long with no checkpoint.** A crash or bedtime loses 40 minutes. Fix: milestone payouts during the run and runs designed to end around nights 6-15 for most teams.
10. **Meta inflation.** Codes and badges hand out the whole store in a week. Fix: the faucet audit in section 5.
11. **Pay-to-win classes.** The newest Robux class out-damages everything and teams demand it. Fix: classes for meta first, side-grades not upgrades.
12. **Unreadable deaths.** "What killed me?" Fix: a cause of death on the results screen and a 1.5 s minimum tell.
13. **Exploits.** Remote spam gives items; teleporting to loot. Fix: server validation on every remote and distance checks on prompts.
14. **Teleport failures.** Parties split, or teleports fail silently. Fix: reserved servers, retry with backoff and a "Teleport failed, try again" toast.
15. **Content fatigue.** The same map and enemies every run. Fix: landmark slots, night events and run seeds (laws 11 and 12).
16. **Chores, not survival.** Hunger, thirst, warmth, sleep and sanity all at once. Fix: at most 3 meters, drain timings from section 5.
17. **Too hard to learn without videos.** New games don't have creators explaining them. Fix: the 3-pointer start (law 23) and the quest board.
18. **A broken genre label.** The game is filed under the wrong genre and never shows up in survival charts. Fix: set Survival and keep it accurate; you can only change it once every three months [54].

## 14. Pitch checklist: is survival right for us right now?

Pulse and Lead answer every line before pitching a survival game. Three or more "no" answers mean pick a different twist or a different genre.

- [ ] Can we state the premise as "[setting] + [threat] + [goal]" in under 12 words, with one part unusual (law 21)?
- [ ] Does the twist show in a thumbnail?
- [ ] Is the safe-versus-dangerous contrast obvious in one screenshot (light vs dark, train vs horde)?
- [ ] Are survival games currently in the charts, and is our twist different from the top three? (Pulse runs `node studio/cli.mjs market --refresh`.)
- [ ] Is there a finish line we can name, plus a way for most runs to end in 15-45 minutes?
- [ ] Can a solo player reach night 5 in their first run?
- [ ] Is there a reason for 2-5 friends to play together (roles, multi-side nights)?
- [ ] Is the meta store at least 6 classes or vehicles deep at launch, with a 4-week content plan after?
- [ ] Can we build the vertical slice (section 11, steps 1-13) in the time we have?
- [ ] Do we have, or can Librarian make, at least 3 enemy types with clear tells?
- [ ] Will it run at 30+ fps on a low-end phone with 6 players at night 15?
- [ ] Does the monetization avoid everything in the off-limits list (section 6)?
- [ ] Is it suitable for the audience: tension, not gore? (See [[Genre - Horror]] for the line.)
- [ ] Can we ship a seasonal update in parts within 6 weeks of launch?

## 15. Checklist

Producer verifies these in Studio or from evidence files before the build gate.

- [ ] `plan.md` opens with both loop statements (run and meta) and names the finish line.
- [ ] `economy.md` contains the night curve, fuel model, meta payout table and faucet audit, with simulation output.
- [ ] Day 1 is 3:20 or shorter; the first night starts by 4:00; a 15 s warning fires before every night (screenshot plus Output log).
- [ ] The base is visible (light or smoke) from every ring-2 point; checked in Studio with 3 screenshots.
- [ ] A safe radius exists and enemies don't enter it while the fire burns (Playtest video or log).
- [ ] First chop, feed and craft happen within 0:15, 0:45 and 2:00 in a Kid Tester cold run.
- [ ] The first meta reward appears by 5:00 in a normal first run.
- [ ] A failed run on night 2 still pays meta (profile value before and after).
- [ ] Enemy count scales with party size; a solo run reaches night 5 (Playtest log).
- [ ] Every enemy attack has a wind-up of at least 0.4 s and an audio cue.
- [ ] At most 3 needs meters on screen.
- [ ] Downed state with a 3 s revive works with 2 players; bleed-out is 30 s.
- [ ] Every remote validates types, distance and cooldowns (Reviewer report).
- [ ] Placement rejects overlap, out-of-zone and out-of-range placements (Reviewer test cases).
- [ ] Unanchored part count stays under 400 at night 15 with 6 players (MicroProfiler or a count script output).
- [ ] FPS ≥ 30 on the low-end phone profile at night 15 (Playtest).
- [ ] The party teleports together into one reserved server (published test universe, 3 players).
- [ ] The results screen shows nights, meta earned, the next class progress and "Play again."
- [ ] Night readability: HUD and enemies visible at 50% phone brightness (Kid Tester screenshot).
- [ ] A brightness setting exists and saves.
- [ ] ProcessReceipt is idempotent (Reviewer: a double-grant test with the same PurchaseId).
- [ ] No product skips a night, ends a run or sells paid random items without shown odds (Merchant plus Reviewer).
- [ ] The genre is set to Survival in the experience settings.
- [ ] Onboarding funnel events 1-8 fire in order (Liveops: Output log or dashboard screenshot).
- [ ] The first three updates are planned in `liveops.md` with dates.

## Common mistakes

1. Making night just "day with a dark skybox": no new verb, no new threat.
2. Starting the run with a long text tutorial instead of a tree, a fire and a workbench.
3. Paying meta only for finishing, so 95% of runs pay nothing.
4. Tuning difficulty only with 4-5 testers, so solo players hit a wall on night 2.
5. Using `Touched` for party pads and resource pickups, which fires unreliably and lets players trigger them from odd angles. Poll with spatial queries or use ProximityPrompts.
6. Letting the client report what it gathered (`AddItem:FireServer("Log", 5)`).
7. Replicating the clock every frame from the server instead of computing it from shared time on each client [57].
8. Setting fire fuel attributes every Heartbeat, which floods replication. Update 4 times per second.
9. Unanchored loot drops that pile up and lag the server.
10. Monsters that can be killed by standing on a rock where they can't path. Test pathfinding on every landmark.
11. Invisible instant-kill threats with no tell or counter-tool.
12. Five or more needs meters, so the game becomes chores.
13. Night so dark that phone players can't see anything.
14. Paid classes that beat every meta class, which turns co-op into a Robux check.
15. Death-screen popups that hide the spectate and respawn buttons.
16. Group teleports into public servers, splitting parties [63][64][65].
17. Testing teleports only in Studio, where they don't work [63][64][65].
18. Saving run inventory to DataStores, which bloats saves and allows dupes, even though runs reset anyway.
19. Copying a hit's monster, class names or map. Steal patterns, not art.
20. Shipping without night events, so every night of every run feels the same by run three.
21. Free placement without a grid, giving gaps monsters walk through and walls that don't line up [60][62].
22. One huge all-or-nothing finish line with no checkpoints or partial rewards.

## References

[1] List of Roblox games — https://en.wikipedia.org/wiki/List_of_Roblox_games — 99 Nights in the Forest peak of 14.2 million concurrent users and about 26 billion visits as of April 2026.
[2] Roblox 99 Nights in the Forest movie — https://www.avclub.com/roblox-99-nights-in-the-forest-movie — film adaptation coverage; only two Roblox games had passed its concurrent peak.
[3] Roblox Game "99 Nights" Becomes A Film — https://www.darkhorizons.com/roblox-game-99-nights-becomes-a-film/ — film adaptation announcement.
[4] 99 Nights in the Forest (RoWatcher) — https://rowatcher.com/games/7326934954 — developer is the Roblox group Grandma's Favourite Games.
[5] 99 Nights in the Forest—Tips for surviving The Deer, Owl, and Cultist invasions (PC Gamer) — https://pcgamer.com/games/roblox/99-nights-in-the-forest-tips/ — the game's named invasions.
[6] 99 Nights in the Forest Roblox guide: how to survive every night (ExitLag) — https://www.exitlag.com/blog/99-nights-in-the-forest-roblox/ — campfire keeps the deer out; fuel upgrades the fire and expands the map; flashlight counter.
[7] How to survive the monster in 99 Nights in the Forest (Sportskeeda) — https://www.sportskeeda.com/roblox-news/how-survive-monster-99-nights-forest?key4=flipboardroblox — flashlight makes the deer flee; sprinting outruns it at an energy cost; eat afterwards.
[8] The Deer (99 Nights in the Forest) (Villains Wiki) — https://villains.fandom.com/wiki/The_Deer_(99_Nights_in_the_Forest) — the deer's behaviour around the camp and campfire.
[9] How To Find All Missing Kids in 99 Nights in the Forest (Deltia's Gaming) — https://deltiasgaming.com/?p=293857 — Missing Kids Board, gated children, keys from cave mobs, Dino Kid first.
[10] 99 Nights in the Forest endings (Pocket Gamer) — https://www.pocketgamer.com/roblox/99-nights-in-the-forest-endings — good ending needs 99 nights and all four children rescued.
[11] 99 Nights in the Forest walkthrough (Destructoid) — https://www.destructoid.com/99-nights-in-the-forest-walkthrough/ — full-run walkthrough of the camp-survival structure.
[12] 99 Nights in the Forest classes (Pocket Tactics) — https://www.pockettactics.com/99-nights-in-the-forest-classes — class count at time of writing; Camper costs 10 diamonds.
[13] All Classes in 99 Nights in the Forest: Costs, perks, and upgrades (Sportskeeda) — https://www.sportskeeda.com/roblox-news/all-classes-99-nights-forest-costs-perks-upgrades — class costs, perks and upgrade levels.
[14] 99 Nights in the Forest Big Game Hunter Class Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=333390 — 600-diamond class; pelts and Mammoth Tusks give permanent bonuses.
[15] Easiest Ways To Get Diamonds in 99 Nights in the Forest (Deltia's Gaming) — https://deltiasgaming.com/?p=296205 — Cultist Stronghold raids, about 50 diamonds from basic badges, Pelt Trader on day two and the Good Sack.
[16] Diamonds in 99 Nights in the Forest (esports.gg) — https://esports.gg/news/roblox/diamonds-99-nights-in-the-forest/ — diamonds from day 50/99, badges, the Update Party and codes.
[17] 99 Nights in the Forest update (Pocket Tactics) — https://www.pockettactics.com/99-nights-in-the-forest-update — Hedge Maze update dated November 1, 2025.
[18] 99 Nights in the Forest Hedge Maze Update Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=389685 — third part of the Halloween update, Carnival Games, 600-diamond Vampire class.
[19] When is the next 99 Nights in the Forest update? (Sportskeeda) — https://www.sportskeeda.com/roblox-news/when-is-next-99-nights-in-the-forest-update — scheduled update time in UTC with a notify option on the event page.
[20] Everything New in 99 Nights in the Forest Fishing Update (Deltia's Gaming) — https://deltiasgaming.com/?p=317391 — fishing added as a side activity.
[21] 99 Nights in the Forest story explained (Pocket Tactics) — https://www.pockettactics.com/99-nights-in-the-forest-story — the game has a story layer behind the survival.
[22] Dead Rails and the Hit Makers formula (GameAnalytics) — https://www.gameanalytics.com/blog/dead-rails-and-the-hit-makers-formula — familiar plus new; borrowing from Build A Boat For Treasure (4.3B+ plays per the article); Wild West twist; influencers and algorithm.
[23] Dead Rails (RoWatcher) — https://rowatcher.com/games/7018190066/dead-rails — RCM Games; alternate 1899 zombie plague; trains to a cure in Mexico; co-op.
[24] Dead Rails [ENDLESS] (RoWatcher) — https://rowatcher.com/games/7018190066/dead-rails-endless — title tags such as [ENDLESS], [HEATWAVE] and [EVENT] across updates.
[25] Dead Rails Roblox: How Many Bonds Do You Get on Completion (Deltia's Gaming) — https://deltiasgaming.com/?p=230372 — 10 Bonds for a Normal run, 20 for Nightmare.
[26] How to get and use Bonds in Dead Rails (Sportskeeda) — https://www.sportskeeda.com/roblox-news/how-get-use-bonds-dead-rails — Bond sources in towns and Robux Bond packs.
[27] How to Get and Use Bonds in Dead Rails (Beebom) — https://beebom.com/how-to-get-and-use-bonds-in-dead-rails/amp/ — Bond sources and uses.
[28] Dead Rails Guide: Ghost Train (Deltia's Gaming) — https://deltiasgaming.com/?p=268112 — Ghost Train as the newest and most expensive train at 325 Bonds.
[29] All Train variants in Dead Rails: Price and usage (Sportskeeda) — https://www.sportskeeda.com/roblox-news/all-train-variants-dead-rails-price-usage — train prices and uses.
[30] Dead Rails Roblox: All Train Types Ranked From Worst to Best (Deltia's Gaming) — https://deltiasgaming.com/?p=222098 — train ladder and trade-offs.
[31] Dead Rails Roblox Guide: All Night Events Explained (Deltia's Gaming) — https://deltiasgaming.com/?p=180436 — night from 9 PM to 5 AM; enemies from 11 PM.
[32] All Dead Rails night events and how to survive them (Sportskeeda) — https://www.sportskeeda.com/roblox-news/all-dead-rails-night-events-survive — Stormy, Cloudy, Full Moon and Blood Moon nights.
[33] Dead Rails Roblox Guide: How To Raid Fort Constitution (Deltia's Gaming) — https://deltiasgaming.com/?p=207762 — random fort placement in distance bands, 6 AM raids, loadout.
[34] Complete Guide to Classes in Dead Rails (Deltia's Gaming) — https://deltiasgaming.com/?p=177947 — Dead Rails class system.
[35] Dead Rails beginner's guide (BlueStacks) — https://www.bluestacks.com/blog/game-guides/roblox/rl-dead-rails-beginners-guide-en.html — overview of the journey-survival run.
[36] Natural Disaster Survival (Perfection Roblox Games wiki) — https://perfectionrobloxgames.miraheze.org/wiki/Natural_Disaster_Survival — Stickmasterluke; random map; disaster list.
[37] Survive the Disasters (app) (Roblox Wiki) — https://roblox.fandom.com/wiki/Survive_the_Disasters_(app) — 2014 iOS app that simulated the game, later removed.
[38] Most challenging disasters in Natural Disaster Survival (BlueStacks) — https://www.bluestacks.com/blog/game-guides/roblox/rl-most-challenging-disasters-en.html — which disasters are hardest and why.
[39] A Dusty Trip: Guide (Sportskeeda) — https://sportskeeda.com/roblox-news/a-dusty-trip-guide — survival simulator; repair a vehicle; stamina and hunger; no tutorial.
[40] How to build a van in A Dusty Trip (Pocket Gamer) — https://www.pocketgamer.com/roblox/how-to-build-a-van-in-a-dusty-trip — vehicles built from engine, radiator and wheel parts; drive as far as possible.
[41] A Dusty Trip Guide: Free Dustbox Car (Scrap Quest) (Deltia's Gaming) — https://deltiasgaming.com/?p=264757 — 777 scrap points at the Scrap Shop about 1,500 m out.
[42] A Dusty Trip Roblox Guide: How To Get Transit Ace (Deltia's Gaming) — https://deltiasgaming.com/?p=221134 — free 4-seat car at 2,000 m guarded by mutants, vault message to 8,000 m.
[43] A Dusty Trip Roblox Guide: How To Get Blackout Car (Deltia's Gaming) — https://deltiasgaming.com/?p=199515 — timed suitcase delivery from 6,200 m to 8,150 m.
[44] Gusmanak (Roblox profile) — https://www.roblox.com/users/281519/profile — Apocalypse Rising: open-world zombie survival where zombies aren't the only threat.
[45] Apocalypse Rising Through the Ages (RoWatcher) — https://rowatcher.com/games/68692443/apocalypse-rising-through-the-ages — a place with miniature versions of all the Apocalypse Rising maps.
[46] Booga Booga remake (Roblox game listing) — https://www.roblox.com/games/11604520803 — remake listing describing Booga Booga's origin and tribes.
[47] Booga Booga remake (Roblox game listing) — https://www.roblox.com/games/14965491403 — remake of the 2018 version made from the uncopylocked original.
[48] Survive the Killer: Killer guide (Sportskeeda) — https://sportskeeda.com/roblox-news/survive-killer-killer-guide — the killer role in asymmetric survival.
[49] Roblox Survive the Killer: all mechanics, including how to crawl (Gamer Journalist) — https://gamerjournalist.com/roblox-survive-the-killer-all-mechanics-including-how-to-crawl-explained/ — survivor-only crawling routes; Dead by Daylight inspiration.
[50] Road to the IGF: Klei Entertainment's Don't Starve (Game Developer) — https://gamedeveloper.com/design/road-to-the-igf-klei-entertainment-s-i-don-t-starve-i- — Kevin Forbes on Minecraft's influence.
[51] Don't Starve development talk (GDC Vault) — https://www.gdcvault.com/play/1020547/contactUs — from a 16-hour game jam to release, with community data.
[52] Seeing the Forest For The Trees: A Don't Starve Interview (Game-Wisdom) — https://game-wisdom.com/?p=3185 — designer interview on resource discovery and progression.
[53] Why Don't Starve moved away from free-to-play (Shacknews, GDC 2014) — https://shacknews.com/topic/gdc-2014?page=2 — GDC panel on dropping the free-to-play plan.
[54] Experience genres (Roblox Creator Docs) — https://create.roblox.com/docs/production/publishing/experience-genres — genres drive chart sorts; change once every three months; Roblox may reassign.
[55] Lighting (Roblox Engine API Reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/Lighting — ClockTime, TimeOfDay and SetMinutesAfterMidnight.
[56] Custom daylight cycle (DevForum) — https://devforum.roblox.com/t/custom-daylight-cycle/677026 — separate day and night speeds.
[57] How to make a day/night cycle (DevForum) — https://devforum.roblox.com/t/how-to-make-a-daynight-cycle/2437736 — server-only cycles look choppy; sync clients with GetServerTimeNow.
[58] Day Night Cycle Help (DevForum) — https://devforum.roblox.com/t/day-night-cycle-help/3076509 — map elapsed time onto a 24-hour clock over a set duration.
[59] How would I do this? (DevForum) — https://devforum.roblox.com/t/how-would-i-do-this/967244 — ClockTime is 24-hour decimal (18.25 = 6:15 PM).
[60] How do I make grid based building system? (DevForum) — https://devforum.roblox.com/t/how-do-i-make-grid-based-building-system/2685654 — math.floor snapping; plot size as a grid multiple.
[61] How do I make a building system with a grid? (DevForum) — https://devforum.roblox.com/t/how-do-i-make-a-building-system-with-a-grid-also-want-to-be-able-to-weild-destroy-blocks/370369 — grid placement with weld and destroy, shared place file.
[62] How do you make a perfect snapping-system? (DevForum) — https://devforum.roblox.com/t/how-do-you-make-a-perfect-snapping-system/3930979 — rotation-related gaps; using surface normals.
[63] Party system in game (DevForum) — https://devforum.roblox.com/t/party-system-in-game/1357798 — reserving servers for parties.
[64] Group teleport system (DevForum) — https://devforum.roblox.com/t/group-teleport-system/329448 — group teleports versus reserved servers.
[65] Creating unique servers for multiple players (DevForum) — https://devforum.roblox.com/t/2404208 — ReserveServer and TeleportAsync for a match; teleports don't work in Studio.
[66] TeleportOptions (Roblox Engine API Reference) — https://create.roblox.com/docs/reference/engine/classes/TeleportOptions.md — optional TeleportAsync argument; reserved-server options and incompatible combinations.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Horror]] · [[Genre - Tower Defense]] · [[Genre - Action and Combat]] · [[Genre - Racing and Vehicles]] · [[Genre - Farming and Fishing]]
