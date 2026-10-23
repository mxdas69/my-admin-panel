---
tags: [vault, genre, simulator, pets, rebirth, clicker, collection]
for: [lead, pulse, architect, balance, builder, merchant]
also: [frame, scenic, librarian, playtest, kid-tester, reviewer, liveops, splash, producer]
---

# Genre - Simulator

On Roblox, "simulator" does not mean a realistic simulation. It names a specific, very successful format: the player repeats one simple action (swing, click, lift, blow a bubble, collect pollen, dig), fills a limited bag or stat, turns it into currency, spends that currency on a better tool, a bigger bag, pets and new zones, and then **rebirths**, resetting the run for a permanent multiplier that makes the next run faster. Pet Simulator 99, Bee Swarm Simulator, Bubble Gum Simulator Infinity and Muscle Legends are the reference shapes [6][7][12][20]. This page is the playbook for building one that holds players for weeks, not minutes.

The genre succeeds or fails on three things: how fast the numbers grow in the first five minutes, whether the rebirth feels like a win and not a loss, and whether there is always one clear next goal on screen. A simulator with a pretty map and a slow first upgrade dies on day one. A simulator with a fast start but no medium-term goals (zones, pets, quests) dies on day three. A simulator with no live events dies in week three.

Read this page before pitching, planning or building any game whose main verb is "collect a thing to make a number go up." Balance should read sections 2 and 5 together with [[04 Progression and Economy]]. Merchant should read section 6 with [[09 Shops and Monetization]]. Builder should read section 11 with [[13 Building It Right]]. Anything with eggs or random pets must also follow [[Genre - RNG and Collection]] and [[03 Rarity and RNG]].

Numbers on this page are of two kinds. Facts about real games carry a citation. Everything else (timings, prices, multipliers) are **this studio's design targets**, written so Balance and Producer can check them; they are not industry statistics.

## 1. What it is and why it works on Roblox

**The definition the crew uses.** A simulator is a game in which (a) one repeatable verb produces a resource, (b) a capacity or stat limits how much you can hold or how fast you earn, (c) currency buys upgrades that raise the rate, (d) zones are gated by price or stat, (e) pets or helpers multiply the rate, and (f) a rebirth or prestige reset trades your run for a permanent bonus. The rebirth is what gives a simulator its longevity [1][2]. Remove (f) and you have a clicker; remove (b) and the sell trip disappears; remove (e) and you lose the collection layer that keeps players hatching.

**The sub-types.** Know which one you are making before you write the plan:

| Sub-type | Verb | What limits you | Reference | Notes |
|---|---|---|---|---|
| Collector sim | Gather a resource and convert it | Bag / container size | Bee Swarm Simulator: pollen into honey at the hive [7][10] | The sell trip is part of the rhythm |
| Pet sim | Pets break objects for coins, eggs give more pets | Pet power, egg price | Pet Simulator 99, hatching eggs for pets [6] | The collection is the game |
| Bubble / hatch sim | Blow or tap to earn, hatch eggs | Egg price, luck | Bubble Gum Simulator Infinity, rift summons and potions [12] | Heavy on luck items and events |
| Stat-training sim | Train a stat by repeating an exercise | Stat gates on gyms or zones | Muscle Legends: train stats, rebirth for multipliers, unlock gyms [18][20] | No sell trip; stat is the currency |
| Luck sim | Roll, keep the best | Luck stat and time | Sol's RNG, described by trackers as a luck-based incremental simulator [23] | See [[Genre - RNG and Collection]] |

**Why it works on Roblox specifically.**
- **It is readable in one second.** A 10-year-old on a phone understands "hit thing, number goes up, buy bigger thing" without reading. Kid Tester should be able to explain the loop after 60 s of play.
- **Progress is visible to others.** Pets follow you, your tool is huge, your stat is in the leaderboard and over your head. Roblox is a social platform, and flex is a reason to play.
- **It tolerates short and AFK sessions.** You can play for 8 minutes on a bus or leave an auto-farm running. Both feed playtime, which matters for engagement-based payouts.
- **It is content-cheap per hour of play.** A new zone is a palette swap, 6 to 10 new breakables, a new egg and a gate price. Updates can ship every week or two, which the genre's leaders do (section 10).
- **It is easy to monetize without blocking play.** Multipliers, auto-collect, pet slots and luck sell well because they speed up something the player already does for free.

**The audience and session shape (studio targets).**
- Core audience: roughly ages 8 to 14, most of them on phones and tablets. Design every screen for a 5.5-inch phone first ([[08 Mobile]]).
- Session: 10 to 25 minutes of active play, often followed by AFK time. The first session decides everything; aim for a first-session median of 12+ minutes.
- Days: the player returns for the daily reward, an egg or event they were saving for, a quest chain they left mid-way, or an update.

**Why players come back.** Each of these needs at least one system in the build:
1. **The next zone is visible and priced.** The gate shows "15K" and the player has 9K.
2. **The rebirth bonus is shown before it is taken.** Players need to see the benefit before resetting [1].
3. **An unfinished collection.** The index shows 14 of 40 pets, with silhouettes for the rest.
4. **Quests with names and faces.** Bee Swarm gives quests through bear characters, and some quest givers stay locked until you reach a hive size (Onett's quests need 30 bees) [7][9].
5. **Timed reasons.** A daily reward streak, a 4-hour egg, a weekend event.
6. **Other players.** Trading, leaderboards, friends' pets, a server-wide boost when someone buys one.

## 2. The core loop

**The loop statement (write it into `plan.md` word for word, then adapt):**

> Do the verb → fill the bag → sell at the pad → buy a better tool, a bigger bag or an egg → unlock the next zone → when the zones run out, rebirth for a permanent multiplier → do it all again faster.

The loop has four time layers. Architect writes all four into the plan, with target times, before Builder starts.

| Layer | What happens | Target timing |
|---|---|---|
| Seconds | One verb: swing, click, lift. A number pops, the bag bar moves, a sound plays | One action every 0.3 to 0.6 s. Feedback in under 100 ms |
| Minutes | Bag fills, walk to sell, buy an upgrade | Bag full every 15 to 45 s early on; a purchase every 60 to 120 s in the first 10 min |
| Session | Unlock a zone, hatch a batch of eggs, finish a quest, maybe rebirth | A new zone every 5 to 10 min early; first rebirth at 25 to 40 min |
| Days and weeks | Rebirth tiers, rare pets, events, updates, leaderboard climbs | A new goal every login; an update every 1 to 2 weeks |

**Loop variants and when to use them.**
- **Sell-trip loop (classic).** The bag fills and you walk to a sell pad. The walk is a rest beat and a reason to pass shops and eggs. Keep the walk under 10 s in zone 1 and give later zones a local sell pad. Selling anywhere is a premium convenience, not the default.
- **Auto-convert loop.** No bag; currency goes up directly. Simpler for younger players and better for idle play, but loses the rhythm. Use it for pet-sim structures where pets do the work.
- **Stat loop (Muscle Legends shape).** The verb raises a stat directly, the stat gates areas, and rebirth resets the stat for a permanent training bonus. Guides describe rebirth there as needing a stat threshold and giving a permanent percentage boost to future training plus gems and gym access [18].
- **Pet-swarm loop (Pet Simulator shape).** You point, pets break objects, coins drop, coins buy eggs, eggs give stronger pets. The player's skill is choosing targets and managing pets. Rebirth unlocks conveniences rather than wiping you; one guide describes Pet Simulator 99's rebirth as unlocking things like auto-hatch and teleport without wiping progress [4].
- **Converter loop (Bee Swarm shape).** Helpers gather a raw resource (pollen) that must be converted at your base (honey) to spend [7]. Adds a second capacity (container) and a reason to return to base.
- **Luck loop.** The verb is a roll; the stat is luck. Sol's RNG rolls auras and boosts luck with crafted gear and potions [23]. Covered in [[Genre - RNG and Collection]].

**The loop rules.**
1. **The verb produces visible feedback in under 100 ms.** Play the sound and a client-side "+N" popup immediately when the input happens, then let the server confirm. Done right: the click feels instant even at 250 ms ping. Done wrong: the number waits for a round trip and the game feels laggy.
2. **The first full bag happens within 20 s of control.** Make the starting bag small (for example 20 units) so the first sell happens fast; the bag grows later. Done right: the player sells at 15 s and sees coins fly into the counter. Done wrong: a 500-unit starting bag that takes 4 minutes to fill.
3. **There is always exactly one highlighted next goal.** A pinned goal tile on the HUD ("Buy the Iron Sword: 250") or a world arrow. When the goal is reached, the next one appears within 1 s.
4. **Each layer pays into the one above it.** Clicks fill bags, bags buy tools, tools open zones, zones fund rebirths. If a layer does not feed the next, cut it.
5. **The loop never asks the player to wait with nothing to do.** If an egg takes time, the player can farm while it runs. Cooldowns longer than 3 s must show a timer and an alternative action.

## 3. Top games in the genre

### Pet Simulator 99: the collection is the game
**Game:** Pet Simulator 99, by BIG Games Pets, the fourth game in the Pet Simulator series ([6])
**Shows:** The game centres on hatching eggs for pets [6]. Its rebirths act as a friendly prestige ladder: a guide reports that Rebirth 1 unlocks auto-hatch and teleport, and later rebirths open more hatching options, without wiping your collection [4]. Charged Eggs require Rebirth 6, boost the luck of hatching Huge pets, and raise the hatch cost when switched on [5]. The Magic Eggs game pass gives a 10% chance of a gold and a 10% chance of a rainbow version from any egg [3].
**Why it works:** Rebirth gives convenience and new options instead of punishment, so players are never afraid to press it. Pet variants (gold, rainbow, Huge) turn one pet design into several collectibles.
**Steal:** Rebirths that unlock features (auto-hatch, teleport, new egg modes). Variant tiers on the same pet model. A pass that changes the odds of a variant, shown with exact percentages.
**Avoid:** Copying BIG Games' pets, names or art. Build your own creature set. Also avoid locking basic quality-of-life (auto-hatch) behind Robux only; Pet Simulator 99's rebirth path shows players accept earning it.

### Bee Swarm Simulator: helpers, conversion, and quest givers
**Game:** Bee Swarm Simulator, by Onett, released March 23, 2018 ([7])
**Shows:** You hatch bees into a swarm, collect pollen in fields, and bring it back to your hive to convert into honey, the main currency. Honey buys bees, hive space and equipment. Bear characters give quests, and mobs and bosses give rewards [7][8][10]. Onett's own quests sit behind the Bear Gate and need at least 30 bees, and reward a Star Treat [9].
**Why it works:** The bees are both the collection and the engine, so every new bee is felt. The conversion trip creates a rhythm. Quest givers with personalities turn grinding into errands for characters.
**Steal:** Helpers that physically do the work around you. A second resource step (raw to refined). Quest givers gated by your collection size, so growing the collection opens new content.
**Avoid:** Using bees or bears; find your own theme. Avoid copying a seven-year-old content volume at launch: ship 3 quest givers, not 12.

### Bubble Gum Simulator Infinity: a fast live-ops machine
**Game:** Bubble Gum Simulator Infinity ([12])
**Shows:** A third-party database lists its release as April 14, 2025 [16]. Coverage shows a fast summer cadence: a Summer Festival update set for May 24, 2025 [14], a Day and Night event on June 7, 2025 [15], and Update 12 on July 12, 2025, which added Rift Summons, a 500M Visits Event, a Super Chest and Infinity Potions [12][13]. Code lists are a regular part of its coverage [17].
**Why it works:** A new reason to log in every one to two weeks, with each update adding a new luck source or chest. A visits milestone becomes an event, so success itself is content.
**Steal:** Plan updates on a two-week rhythm from launch. Turn milestones (visits, favorites) into a celebration event. Add a new luck item type each update.
**Avoid:** A cadence you cannot sustain. Two-week updates need the content pipeline in section 10 built before launch.

### Muscle Legends: the stat is the currency
**Game:** Muscle Legends ([21])
**Shows:** Guides describe a loop of training stats, rebirthing for permanent multipliers and unlocking stronger gyms [20]. One guide reports that the first rebirth needs 10,000 Strength, gives a permanent +5% boost to later training, grants gems immediately, and opens gyms such as the Frost Gym, Mythical Gym and Muscle King Gym [18]. Codes grant free strength and gems [22], and players look up guides on how to get strong fast [19], a sign that the training path is the content.
**Why it works:** The stat is shown on the body and the leaderboard, so it is a flex. Gyms as zones give a physical sense of moving up.
**Steal:** A stat that changes how your avatar looks. Areas named for the tier ("Frost", "Mythical", "King") so a player knows where they rank. A rebirth that pays out a second currency immediately, so it never feels like pure loss.
**Avoid:** A +5% bonus alone feels small; pair a small permanent bonus with an immediate tangible reward (gems, a pet, a new area), as the guide describes [18].

### Sol's RNG: the simulator built on luck
**Game:** Sol's RNG, by Sol's Studio ([23])
**Shows:** A tracker describes it as a luck-based incremental simulator where players roll for over 200 auras, some as rare as 1 in 1 billion, while crafting gear and drinking potions to boost luck. A Boss Raid chapter added a co-op boss for up to eight players [23].
**Why it works:** It strips the simulator down to its emotional core (the chance of a huge result) and keeps the incremental layer (luck gear) to give progress between lucky moments.
**Steal:** A luck stat as the progression axis. Crafted gear that permanently raises it. Co-op content added later to give the solo loop a social layer.
**Avoid:** Treat it as an RNG game first; read [[Genre - RNG and Collection]] before borrowing from it.

### Miner's Haven: automation and anti-macro rules
**Game:** Miner's Haven, a sandbox tycoon with rebirths ([24][32][33])
**Shows:** Its wiki describes conveyors that move ore between machines, faster conveyors such as a walled Military-Grade Conveyor that moves ore 50% faster, and furnaces such as the Reinforced Furnace, which processes ore at 5x but sits high, so ore needs a fast conveyor and ramp or an ore cannon to reach it [33]. The game page warns that using a macro to continuously rebirth results in a ban [32].
**Why it works:** It is the bridge between simulator and tycoon: rebirth-driven, but the player builds the engine.
**Steal:** If you sell automation, decide where the line is. Miner's Haven publishes its rule (no macro rebirthing) on the game page; publish yours.
**Avoid:** Allowing macros silently and then banning players. State the rule in the game description and in the settings menu.

### Pet Simulator lineage: sequels as resets
**Game:** The Pet Simulator series, of which Pet Simulator 99 is the fourth entry ([6])
**Shows:** The studio has relaunched the same core idea as numbered new games [6].
**Why it works:** A new entry gives every player a fresh start on equal terms, resets an economy inflated by years of updates, and earns new discovery as a new experience.
**Steal:** Plan your simulator's economy so a "2" is possible: keep the systems in modules so a sequel reuses 70% of the code ([[13 Building It Right]]).
**Avoid:** Abandoning a live game without notice. Announce a sequel in the old game and give a cross-game reward (a badge-checked pet) if you do it.

### Untitled Drill Game: rebirth as a guide-worthy system
**Game:** Untitled Drill Game ([31])
**Shows:** Rebirth is a big enough decision in this game that guide sites publish dedicated rebirth guides for it [31].
**Why it works:** When players search for "when should I rebirth", the rebirth is a real decision with a cost, which is the point.
**Steal:** Make rebirth a decision with a clear trade-off and answer it in-game: a "Rebirth now: your next run will be 2.0x faster" panel.
**Avoid:** Making players leave the game to find out what rebirth keeps and loses.

### What all of them share (the pattern list)
- One verb, visible in the icon and the first 5 seconds.
- A collection with variants (gold, rainbow, Huge, shiny).
- A friendly rebirth that pays immediately and permanently.
- Named zones or gyms that show rank.
- A steady update rhythm with events and codes.

## 4. The first five minutes for this genre, second by second

This is the opening Architect writes into the plan and Kid Tester verifies. See [[01 The First Five Minutes]] for the general rules; this is the simulator version.

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0 to 3 s | Spawns on the main pad, camera facing the first cluster of collectibles 12 to 20 studs away. The starter tool is already equipped | `SpawnLocation` faces the cluster; starter tool sits in `StarterPack` and the client equips it with `Humanoid:EquipTool` on spawn; no menu, no shop, no daily popup |
| 3 to 6 s | A pulsing arrow and a one-line hint: "Tap to swing!" (mobile) or "Click to swing!" (PC) | Hint text 28 to 32 px, bottom center, above the bag bar; arrow `Beam` or `BillboardGui` on the nearest collectible |
| 6 to 15 s | First swings. Each one pops "+1" and plays a short sound; the bag bar fills | Popup is client-side, server confirms. Bag capacity 20 so it fills by about 12 s at 2 swings/s |
| 15 to 20 s | Bag full. The bar flashes, the hint changes to "Bag full! Sell it" and an arrow points to the sell pad | Sell pad no more than 25 studs (about 3 s of walking at the default `WalkSpeed` 16) from the cluster |
| 20 to 25 s | Steps on the sell pad. Coins fly from the bag to the counter, a cash sound, the counter rolls up | Server converts on touch with a debounce; client plays the fly-in tween over 0.6 s |
| 25 to 60 s | Two or three more bag cycles. The goal tile shows "Iron Sword: 50" with a progress bar | Goal tile in the top-left under the currency, 280 x 64 px |
| 45 to 75 s | First upgrade affordable. The Shop button pulses, an arrow points to it, one tap buys it, the new tool appears in hand and "+3" pops | First upgrade cost tuned so it lands between 40 and 70 s. This is the most important number in the game |
| 75 to 120 s | The bag is now the limit. Goal tile: "Bigger Bag: 100". Buying it shows the bar get longer | Alternating tool and bag upgrades gives the first five purchases rhythm |
| 2:00 to 2:30 | First egg is free: an arrow to the egg stand, one tap, a hatch animation, a pet follows and adds +10% | Free first egg; no Robux prompt. Pet appears within 2 s of the hatch ending |
| 2:30 to 3:30 | First quest from an NPC: "Collect 200 coins' worth of crystals" with a reward of a second egg or 100 coins | Quest tracker appears only now, top-right, max 2 lines |
| 3:30 to 4:30 | The gate to zone 2 becomes the goal: "Zone 2: 1,000". The gate glows and shows the price in big text | Gate `SurfaceGui` text 120 px tall at 50 studs; the zone behind it is visible through the gate |
| 4:30 to 5:00 | The player buys zone 2 or is within one minute of it. Now, and only now, the daily reward and the group bonus are introduced with one small toast each | No full-screen popups before 4:30. One toast at a time, 3 s each |

**First-five-minute rules.**
1. **Control in under 3 s, first reward in under 15 s, first purchase in under 75 s (targets).** These three numbers go in the plan and Playtest measures them on a phone.
2. **No Robux prompt, no pass advertisement and no daily popup before 4:30.** The shop exists, but nothing pops up. Done wrong: a "Starter Pack 99 R$" modal at spawn.
3. **Every new system is introduced by need, not by tutorial text.** The bag bar is explained when it is full; the shop when the first item is affordable; pets when the free egg is reached.
4. **The free first egg gives a guaranteed good pet.** Use a fixed result for the tutorial egg (for example an Uncommon), not a roll. If the first egg is paid, its odds must be shown ([[Genre - RNG and Collection]]).
5. **The first zone gate is visible from spawn.** The player should see "there is more" from second 1.

## 5. Progression and economy

Balance owns these numbers and proves them with a simulation in `games/<slug>/sim/` before the build ([[04 Progression and Economy]]). The shapes below are the studio's starting templates.

**5.1 The income formula.** Every simulator should have one income line that everything multiplies into:

```
income_per_action = tool_power
                  × zone_multiplier
                  × (1 + sum of equipped pet bonuses)
                  × rebirth_multiplier
                  × pass_multiplier (2x Coins = 2)
                  × active_boosts (each potion, server boost, event)
                  × friend_bonus (1 + 0.1 per friend in server, capped at 1.5)
```

Keep multipliers in separate buckets and multiply buckets together; add bonuses within a bucket. This prevents one category from exploding when combined. Put the bucket list in `ReplicatedStorage.Shared.Config` so the UI can show a breakdown ("Your multiplier: x12.4. Pets x3.1, Rebirth x2.0, 2x Coins x2.0").

**5.2 Upgrade costs grow exponentially, power grows slower.** The classic idle-game structure, explained in Pecorella's series on idle-game math, is exponential cost growth with slower production growth, so each upgrade takes a little longer than the last until a new tier or prestige resets the pace [26]. Studio template:

- Tool tier n: `cost = 50 × 5^(n-2)` for n ≥ 2 (tier 1 is free), `power = 2.5^(n-1)`.
- Bag tier n: `cost = 100 × 4^(n-2)` for n ≥ 2, `capacity = 20 × 3^(n-1)`.
- Zone gate z: `price ≈ 1,000 × 12^(z-2)` from zone 2; each zone's `zone_multiplier = 2^(z-1)`.

Worked table (targets, before pets and rebirth; Balance replaces these with simulated values):

| Tier | Tool cost | Tool power | Bag cost | Bag capacity | Target time to afford (fresh account) |
|---|---|---|---|---|---|
| 1 | free | 1 | free | 20 | 0 s |
| 2 | 50 | 2.5 | 100 | 60 | 45 s / 1:30 |
| 3 | 250 | 6.3 | 400 | 180 | 2:30 / 3:15 |
| 4 | 1,250 | 15.6 | 1,600 | 540 | 5 min / 6 min |
| 5 | 6,250 | 39 | 6,400 | 1,620 | 9 min / 10 min |
| 6 | 31,250 | 98 | 25,600 | 4,860 | 14 min / 15 min |
| 7 | 156,250 | 244 | 102,400 | 14,580 | 20 min / 21 min |
| 8 | 781,250 | 610 | 409,600 | 43,740 | 27 min / 28 min |

| Zone | Gate price | Zone multiplier | Target arrival (fresh account, no passes) |
|---|---|---|---|
| 1 Meadow | free | x1 | 0:00 |
| 2 Desert | 1,000 | x2 | 4:30 |
| 3 Ice | 12,000 | x4 | 10:00 |
| 4 Jungle | 144,000 | x8 | 17:00 |
| 5 Volcano | 1.7M | x16 | 25:00 |
| 6 Sky (rebirth zone) | 20.7M | x32 | first rebirth before or at this gate |

**5.3 The rebirth formula.** The rebirth is the genre's spine [1]. It must (a) cost a clear, visible amount, (b) reset the run, (c) keep everything that represents the player's identity, and (d) pay something immediately and something permanently.

- **What resets:** coins, bag contents, tool tier, bag tier, zone unlocks.
- **What stays:** pets, gems (premium-ish currency), the index, game passes, cosmetics, quest history, badges.
- **Cost:** grows with rebirth count. A linear example from a shared script sets the threshold at `10,000,000 × (rebirths + 1)` [25]. Studio default is geometric: `cost = 2,000,000 × 3^r`.
- **Reward:** permanent `rebirth_multiplier = 1 + 0.5 × r` (additive, simple to explain), plus an immediate payout of gems and, at milestones, an unlock (an extra pet slot at rebirths 1, 3, 5, 10; a new egg at 2; auto-sell at 4). Muscle Legends shows the pairing of a permanent percentage with immediate gems and new areas [18]; Pet Simulator 99 shows feature unlocks [4].

| Rebirth r | Cost to reach r+1 | Multiplier after | Immediate reward | Unlock | Target cycle time |
|---|---|---|---|---|---|
| 0 → 1 | 2M | x1.5 | 50 gems | +1 pet slot, auto-swing for 10 min | 25 to 40 min |
| 1 → 2 | 6M | x2.0 | 75 gems | Rebirth egg | 35 to 50 min |
| 2 → 3 | 18M | x2.5 | 100 gems | +1 pet slot | 45 to 60 min |
| 3 → 4 | 54M | x3.0 | 125 gems | Auto-sell | 55 to 70 min |
| 4 → 5 | 162M | x3.5 | 150 gems | +1 pet slot, zone 7 | 65 to 85 min |
| 9 → 10 | 39.4B | x6.0 | 300 gems | Rebirth tier 2 ("Ascend") preview | 2 to 3 h |

The multiplier grows linearly and the cost geometrically, so later cycles take longer even though the early part of every new run is faster. That is intended: the player feels faster at the start of each run, which is the feeling the rebirth should give [1], while the economy still stretches. When cycles pass about 3 hours, add a second prestige layer ("Ascend") that resets rebirths for a bigger multiplier; layered prestige loops are covered in Part III of the idle-math series [27] and in [[Genre - Idle and Incremental]].

**5.4 Pets.** Pets add a bonus to income (and in pet sims they are the income). Template:

| Tier | Base bonus | Basic-egg weight (example) | Notes |
|---|---|---|---|
| Common | +10% | 60 | Gray |
| Uncommon | +25% | 25 | Green |
| Rare | +60% | 10 | Blue |
| Epic | +150% | 4 | Purple |
| Legendary | +400% | 0.9 | Gold |
| Mythic | +1,000% | 0.1 | Red / pink |

- Equipped slots: 3 at start, +1 at rebirths 1, 3, 5, 10, +2 from a pass. Never more than 12 equipped pets on screen per player: performance on phones.
- Egg price per zone: about 0.5x to 1x of that zone's average income per minute, so a player can hatch every minute or two while farming.
- Variants: gold and rainbow versions multiply the bonus (for example x1.5 and x2.5). Pet Simulator 99 sells a pass that sets a 10% gold and 10% rainbow chance [3]; if you sell one, show the exact numbers.
- Fusing: 5 of the same pet into a gold version. It turns duplicates into progress and mirrors Adopt Me's neon combining ([[Genre - RNG and Collection]]).

**5.5 Big numbers.** Simulators run into the billions within days. Luau numbers are 64-bit floats: whole numbers are exact up to 2^53 (about 9.0e15) and the maximum is about 1.8e308. Rules:
- Store currency as a plain number while you stay below 1e15. Above that, small additions are lost to rounding; move to a mantissa/exponent pair (see [[Genre - Idle and Incremental]]).
- Display with suffixes: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc. Three significant digits ("12.4M").
- Never save `inf` or `NaN`. Clamp every value before saving.

**5.6 Sinks.** Without sinks, currency piles up and prices stop meaning anything. Every simulator needs at least three: eggs, zone gates and upgrades, plus one optional one (enchanting pets, rerolling pet traits, cosmetic trails). Rebirth is the biggest sink of all because it zeroes coins.

## 6. Monetization that fits

The genre monetizes well because it sells speed and convenience on top of a loop that is already fun for free. Merchant proposes items and prices; **the owner sets the Robux prices and creates the passes and products on the Creator Hub** (crew rules). See [[09 Shops and Monetization]].

**What to sell (in order of fit):**

| Item | Type | Effect | Price range to propose (R$, targets) |
|---|---|---|---|
| 2x Coins | Game pass | Doubles the pass bucket of the income formula | 199 to 299 |
| Auto Swing / Auto Collect | Game pass | Performs the verb automatically while equipped | 149 to 249 |
| +2 Pet Slots | Game pass | Two more equipped pets | 199 to 349 |
| Lucky Eggs | Game pass | Raises the chance of rare tiers or variants, with the exact numbers on the pass and in the egg odds | 249 to 449 |
| Triple Hatch / Fast Hatch | Game pass | Hatch 3 at once / skip animation | 199 to 399 |
| VIP | Game pass | Chat tag, VIP area with a local sell pad, +10% income | 399 to 799 |
| Bigger Bag (+50%) | Game pass | Capacity bucket x1.5; does not remove the sell trip | 99 to 199 |
| 2x Coins Boost 30 min | Developer product | Temporary boost, stacks in time not in strength | 29 to 49 |
| Server Luck Boost 15 min | Developer product | Whole server gets luck; buyer is announced | 99 to 199 |
| Coin pack | Developer product | Coins scaled to the player's current zone (for example 10 minutes of current income) | 25 to 499 |
| Egg bundle | Developer product | N hatches of an egg. Paid random item: odds shown in percentages | 49 to 299 |
| Starter Pack | Developer product, one per account | A pet, a boost and gems | 49 to 99, offered after the first rebirth or at 15 min |

**Rules.**
1. **Every paid item speeds up something the player can already do for free.** Never sell the only way to reach a zone or the only way to rebirth.
2. **Paid random items show every outcome's chance as a percentage that sums to 100%.** This includes eggs bought with a currency that can be bought with Robux, and luck boosts count as probability modifiers [30]. The odds button must be labelled with a word ("Odds" or "Info"), not just an (i) icon [30].
3. **Coin packs scale with progress.** A fixed 10,000-coin pack is worthless at zone 6. Grant `minutes × current income per minute`, computed on the server at purchase time.
4. **Use `ProcessReceipt` correctly.** Validate the receipt, grant, save, then return `PurchaseGranted`; return `NotProcessedYet` on failure so Roblox retries [28]. Assign `ProcessReceipt` in exactly one server script: if several scripts set it, only the last assignment takes effect, which is a common cause of charged-but-not-granted purchases [29].
5. **Server-wide boosts are the genre's best social product.** One player pays; everyone in the server benefits and sees the buyer's name. This turns spending into a gift.
6. **No offer pops up in the first 4:30; at most one offer popup per 10 minutes after that.** Offers appear at natural moments: after a rebirth, when the bag fills for the 20th time ("Bigger Bag?"), after a failed rare roll.

**Off-limits.**
- Pay-only zones that hold the main progression path. A paid zone is fine only as a side area (VIP lounge).
- Fake scarcity: countdown timers that reset, "only 3 left" on unlimited items.
- Hidden odds, odds shown only in a Discord, or luck passes whose effect is not stated in numbers [30].
- Any client-side grant. The client asks; the server decides ([[13 Building It Right]]).
- "Free Robux" wording, or rewards for leaving the platform.
- Selling a guaranteed rare pet that is also tradeable if the player's policy disallows paid item trading (see [[Genre - RNG and Collection]]).

## 7. UI and HUD for this genre

Frame owns this section with [[05 UI and HUD]] and [[08 Mobile]]. Simulators need more persistent HUD than most genres, so discipline matters.

**Layout (phone landscape, reference 1334 x 750, scale with `UIScale`):**

| Area | Contents | Size and style |
|---|---|---|
| Top center | Currency pills: Coins, Gems (and event currency during events) | Each pill 180 x 48 px, icon 36 px left, number right-aligned, `UICorner` 24 px, `UIStroke` 3 px dark |
| Top left | Goal tile: next purchase with progress bar | 280 x 64 px, progress bar 6 px tall at the bottom |
| Left rail | Shop, Pets, Rebirth, Quests, Daily | 5 buttons max, 72 x 72 px each, 12 px gap, vertically centered, label under icon 14 px |
| Bottom center | Bag bar: "18 / 20" | 360 x 28 px; turns orange at 80%, red and pulsing at 100% |
| Right | Quest tracker (2 lines max) | 260 px wide, only when a quest is active |
| Bottom right | Leave clear for the jump button | Nothing within 220 x 220 px of the corner on touch devices |
| Floating | "+N" popups, coin fly-in | Client-side, pooled, max 12 alive at once |

**Must-have screens.**
1. **Shop.** Tabs: Tools, Bags, Passes. Each card 220 x 280 px: icon, name, stat ("Power 15.6"), comparison to current ("+150%"), price button. Locked tiers show their price greyed, never hidden.
2. **Pets.** Grid of 96 x 96 px cells, rarity-colored border, equipped tick. Buttons: Equip Best, Unequip All, Fuse, Delete (with multi-select). Sort by bonus by default. Header: "Equipped 4 / 5".
3. **Egg hatch.** Egg center screen, shakes 3 times over 1.2 s, cracks, the pet reveals with a rarity-colored burst and name. Skip on tap after the first 0.5 s. "Hatch again" and "Auto" buttons under it. Odds button on the egg stand's prompt UI.
4. **Rebirth.** Shows "Now: x1.5 → After: x2.0", the cost with a progress bar, a list "You keep: pets, gems, passes, index" and "You reset: coins, tools, bags, zones", and the immediate reward. The benefits must be visible before the reset [1].
5. **Quests.** Giver portrait, objective, progress, reward.
6. **Daily rewards.** 7-day strip; today highlighted; tomorrow's reward visible.
7. **Index.** Silhouettes for missing pets, with the egg they come from.
8. **Settings.** Music, SFX, hide other players' pets, low-effects mode, hide damage numbers. Hiding other pets is a performance setting on phones as much as a preference. Read an accessibility review of a reference simulator before designing this screen [11].

**Mobile rules.** Tap targets at least 44 x 44 pt. Use a single "Swing" button bottom-right above jump only if the verb cannot be done by tapping the world. Auto-swing toggle in reach of the right thumb. Every full screen closes with an X at least 56 x 56 px in its top-right and with a tap outside.

## 8. World and look

Scenic owns this with [[06 World and Look]].

**Layout.** A hub-and-line or hub-and-ring map: spawn, sell pad, shop and first egg within a 40-stud circle; zone gates arranged in a line or ring so the next gate is always in view. Each zone is a distinct biome (meadow, desert, ice, jungle, volcano, sky) with its own palette, breakables and egg.

**Rules.**
1. **The first collectible cluster is within 20 studs of spawn and the sell pad within 25 studs.** Walking is dead time.
2. **Every gate shows its price in letters readable from 50 studs.** `SurfaceGui` with `SizingMode = PixelsPerStud`, `PixelsPerStud = 50`, white text with a 4 px dark stroke.
3. **One dominant color per zone, saturated and bright.** Meadow green, desert sand, ice blue. The thumbnail should be able to show a zone by color alone ([[11 Thumbnails, Icons and the Store Page]]).
4. **Breakables read as breakable.** Crystals, chests, coin piles, rocks, with a health bar on hover or first hit. Each zone has 3 to 4 breakable sizes with HP in the ratio 1 : 5 : 25 : 125.
5. **Pets are small and readable.** About 2 to 3 studs tall, with a simple silhouette and a strong outline color per tier. Hundreds of pets on one server is the main performance risk; use simple meshes, no per-pet scripts on the client, and update pet positions in one loop ([[07 Characters, VFX and Assets]]).
6. **The sell pad glows and pulses.** A `Neon` ring plus `ParticleEmitter` (Rate 8, Lifetime 1 s). It is the most visited object in the game.
7. **Streaming on.** `Workspace.StreamingEnabled = true` with zones far enough apart that a phone loads one at a time.

## 9. Retention and social

See [[10 Retention and Social]] for general rules. Simulator specifics:

1. **Daily rewards on a 7-day streak, with day 7 being a pet or egg.** Day 1 coins (10 minutes of income), day 2 gems, day 3 a boost, day 4 coins, day 5 an egg, day 6 gems, day 7 an exclusive pet. Missing a day resets to day 1 only after 48 hours.
2. **Playtime gifts at 5, 10, 15, 25, 40 and 60 minutes.** Shown as a row of gift boxes; the player claims manually. These are the main reason first sessions last past 15 minutes.
3. **Quest chains with characters.** 3 givers at launch, 8 to 12 quests each, gated by progress in the way Bee Swarm gates Onett behind 30 bees [9].
4. **Leaderboards in the world.** A physical board near spawn showing top 50 by total coins earned, rebirths and rarest pet. Update every 60 s from an `OrderedDataStore`.
5. **Friend bonus.** +10% per friend in the server, up to +50%, shown in the multiplier breakdown. Use `Player:IsFriendsWith` on the server when players join.
6. **Group bonus.** +10% coins for group members, introduced at 4:30 at the earliest.
7. **Rare-hatch announcements.** Server-wide chat message for Legendary and above; cross-server for Mythic and above.
8. **Trading** once the economy is stable. Do not launch with trading; add it in update 2 or 3 after the duplication and scam protections are built ([[Genre - RNG and Collection]]).
9. **Return hooks you name in the plan.** For each of day 1, day 2, day 3 and day 7, write the exact reason a player returns.

## 10. Live ops and update cadence

See [[12 Live Ops and Launch]]. The genre leaders update fast: Bubble Gum Simulator Infinity shipped updates or events on May 24, June 7 and July 12, 2025, each adding a new luck or reward system (Rift Summons, Super Chest, Infinity Potions) and turning a 500M visits milestone into an event [12][14][15].

**Cadence (studio targets).**
- **Week 1 after launch:** fixes only, plus a code for a boost. Codes are part of every top simulator's coverage [17][22].
- **Every 2 weeks:** one new zone with an egg and 6 to 10 breakables, or one new system (enchants, fusing, a quest giver).
- **Every 4 to 6 weeks:** a timed event with an event currency, an event egg and a shop that closes. Event pets become collectibles.
- **Milestones:** each visits or favorites milestone (1M, 10M, 100M) is a 48-hour boost and a code.
- **Weekends:** a free 2x boost from Friday 18:00 to Sunday 23:59 UTC is cheap and reliable.

**The update content kit.** Before launch, Librarian and Scenic build a kit so each update is mostly configuration: a zone template (floor, edge props, gate), a breakable template with HP and drop config, an egg stand template, and a pet template rig. A new zone should take one day of work, not one week.

**What to watch (Liveops).** Funnel steps for the first five minutes, time to first rebirth, rebirth rate per day, egg hatches per session, and economy sources and sinks per currency. Log these with `AnalyticsService` and review them weekly.

## 11. Building it in Studio

Builder owns the code, Merchant the purchase modules, Frame the UI. See [[13 Building It Right]] and [[14 Roblox Studio Workflow]].

**11.1 Systems list (build in this order).**
1. PlayerData (load, save, session lock, autosave every 60 to 120 s, save on leave and `BindToClose`).
2. Config (tools, bags, zones, eggs, pets, rebirth, passes) in `ReplicatedStorage.Shared.Config`.
3. Currency (add, spend, with change events to the client).
4. Verb (swing or collect) with server rate limiting.
5. Bag and Sell.
6. Shop (tools, bags) and Zones (gates).
7. Pets and Eggs (hatch, equip, follow, fuse, delete).
8. Rebirth.
9. Quests, Daily, Playtime gifts.
10. Monetization (passes, products, receipts, boosts).
11. Leaderboards and announcements.
12. Analytics.

**11.2 Architecture.**

```
ReplicatedStorage
  Shared/
    Config/ Sim.lua, Pets.lua, Eggs.lua, Rebirth.lua, Monetization.lua
    Format.lua            -- number abbreviations, shared with UI
    Formula.lua           -- cost, power, multiplier math (pure functions)
  Remotes/                -- RemoteEvents and RemoteFunctions, created by the server at boot
ServerScriptService
  Main.server.lua         -- requires services in order
  Services/ DataService, CurrencyService, VerbService, SellService, ShopService,
            ZoneService, PetService, EggService, RebirthService, QuestService,
            DailyService, PurchaseService, BoostService, LeaderboardService
ServerStorage
  Assets/ Pets, Breakables, Tools
StarterPlayerScripts
  Client.client.lua       -- requires controllers
  Controllers/ VerbController, PopupController, PetFollowController, HUDController
StarterGui
  HUD, Shop, Pets, Rebirth, Quests, Daily, Index, Settings (ScreenGuis, ResetOnSpawn = false)
Workspace.Map
  Zones/ Zone1..ZoneN (each with Breakables, SellPad, EggStand, Gate)
```

**11.3 Remotes and validation.**

| Remote | Type | Client sends | Server checks |
|---|---|---|---|
| `Swing` | RemoteEvent | nothing (or target id) | Cooldown since last swing ≥ 80% of config, bag not full, target in range (≤ 12 studs) |
| `Sell` | none: touch-driven on the server | — | Debounce 1 s per player, player standing on pad |
| `BuyTool`, `BuyBag` | RemoteFunction | tier number | Tier = current + 1, enough coins |
| `BuyZone` | RemoteFunction | zone number | Zone = highest + 1, enough coins |
| `HatchEgg` | RemoteFunction | egg id, count (1 or 3) | Near the egg stand (≤ 15 studs), count allowed by passes, enough currency, inventory space |
| `EquipPet`, `UnequipPet`, `EquipBest` | RemoteFunction | pet uid(s) | Owns pet, slot limit |
| `FusePets`, `DeletePets` | RemoteFunction | list of uids | Owns all, none equipped, list length limits |
| `Rebirth` | RemoteFunction | nothing | Enough coins for current cost |
| `ClaimDaily`, `ClaimGift`, `ClaimQuest` | RemoteFunction | id | Server-side time and progress checks |
| `DataChanged` | RemoteEvent (server to client) | — | Sends changed keys only |

**11.4 Data schema.**

```lua
--!strict
-- ReplicatedStorage/Shared/Types.lua
export type Pet = {
	Id: string,          -- config id, e.g. "Pup"
	Tier: string,        -- "Common".."Mythic"
	Variant: string?,    -- nil, "Gold", "Rainbow"
	Level: number,
	Equipped: boolean,
}

export type SimData = {
	Version: number,
	Coins: number,
	Gems: number,
	Bag: number,
	BagTier: number,
	ToolTier: number,
	Zone: number,                       -- highest unlocked zone
	Rebirths: number,
	Pets: { [string]: Pet },            -- key = GUID from HttpService:GenerateGUID(false)
	PetSlots: number,
	Index: { [string]: boolean },       -- "Pup:Gold" = true
	Boosts: { [string]: number },       -- boost id -> expiry (os.time)
	Quests: { [string]: { Step: number, Progress: number } },
	Daily: { Streak: number, LastClaim: number },
	Gifts: { Claimed: { [string]: boolean }, SessionStart: number },
	Stats: { TotalCoins: number, Swings: number, Hatches: number, PlaySeconds: number },
	Receipts: { [string]: boolean },    -- PurchaseId -> true, for idempotent ProcessReceipt
}

return nil
```

Keep dictionaries keyed by strings (data stores save JSON). Keep the `Receipts` log trimmed to the last 200 ids.

**11.5 Shared formulas.**

```lua
--!strict
-- ReplicatedStorage/Shared/Formula.lua (pure math, used by server for truth and by UI for display)
local Formula = {}

function Formula.toolCost(tier: number): number
	if tier <= 1 then return 0 end
	return 50 * 5 ^ (tier - 2)
end

function Formula.toolPower(tier: number): number
	return 2.5 ^ (tier - 1)
end

function Formula.bagCapacity(tier: number): number
	return 20 * 3 ^ (tier - 1)
end

function Formula.rebirthCost(rebirths: number): number
	return 2_000_000 * 3 ^ rebirths
end

function Formula.rebirthMultiplier(rebirths: number): number
	return 1 + 0.5 * rebirths
end

function Formula.zoneMultiplier(zone: number): number
	return 2 ^ (zone - 1)
end

return Formula
```

**11.6 The verb, rate-limited on the server.**

```lua
-- ServerScriptService/Services/VerbService.lua
-- (no --!strict: this file indexes the DataModel by name; keep strict mode for the pure modules)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Formula = require(ReplicatedStorage.Shared.Formula)
local DataService = require(script.Parent.DataService)
local MultiplierService = require(script.Parent.MultiplierService)

local SWING_COOLDOWN = 0.5
local TOLERANCE = 0.8 -- accept swings at 80% of the cooldown to absorb network jitter

local lastSwing: { [Player]: number } = {}

local VerbService = {}

function VerbService.start()
	ReplicatedStorage.Remotes.Swing.OnServerEvent:Connect(function(player: Player)
		local now = os.clock()
		local last = lastSwing[player]
		if last and now - last < SWING_COOLDOWN * TOLERANCE then
			return
		end
		lastSwing[player] = now

		local data = DataService.get(player)
		if not data then return end

		local capacity = Formula.bagCapacity(data.BagTier) * MultiplierService.bagBonus(player)
		if data.Bag >= capacity then
			ReplicatedStorage.Remotes.BagFull:FireClient(player)
			return
		end

		local gain = Formula.toolPower(data.ToolTier) * MultiplierService.income(player)
		data.Bag = math.min(capacity, data.Bag + gain)
		data.Stats.Swings += 1
		DataService.changed(player, "Bag")
	end)

	Players.PlayerRemoving:Connect(function(player)
		lastSwing[player] = nil
	end)
end

return VerbService
```

**11.7 The sell pad, server-side touch with debounce.**

```lua
-- ServerScriptService/Services/SellService.lua
-- (no --!strict: this file indexes the DataModel by name; keep strict mode for the pure modules)
local Players = game:GetService("Players")
local DataService = require(script.Parent.DataService)
local MultiplierService = require(script.Parent.MultiplierService)

local DEBOUNCE = 1
local lastSell: { [Player]: number } = {}

local SellService = {}

local function onTouched(hit: BasePart)
	local character = hit:FindFirstAncestorOfClass("Model")
	if not character then return end
	local player = Players:GetPlayerFromCharacter(character)
	if not player then return end

	local now = os.clock()
	if lastSell[player] and now - lastSell[player] < DEBOUNCE then return end
	lastSell[player] = now

	local data = DataService.get(player)
	if not data or data.Bag <= 0 then return end

	local coins = data.Bag * MultiplierService.zoneSellValue(player)
	data.Bag = 0
	data.Coins += coins
	data.Stats.TotalCoins += coins
	DataService.changed(player, "Bag", "Coins")
	DataService.fire(player, "Sold", coins) -- client plays the coin fly-in
end

function SellService.start()
	for _, pad in workspace.Map.Zones:GetDescendants() do
		if pad:IsA("BasePart") and pad.Name == "SellPad" then
			pad.Touched:Connect(onTouched)
		end
	end
	Players.PlayerRemoving:Connect(function(p) lastSell[p] = nil end)
end

return SellService
```

**11.8 Rebirth.**

```lua
-- ServerScriptService/Services/RebirthService.lua
-- (no --!strict: this file indexes the DataModel by name; keep strict mode for the pure modules)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Formula = require(ReplicatedStorage.Shared.Formula)
local Config = require(ReplicatedStorage.Shared.Config.Rebirth)
local DataService = require(script.Parent.DataService)

local RebirthService = {}

function RebirthService.start()
	ReplicatedStorage.Remotes.Rebirth.OnServerInvoke = function(player: Player)
		local data = DataService.get(player)
		if not data then return false, "NoData" end

		local cost = Formula.rebirthCost(data.Rebirths)
		if data.Coins < cost then return false, "NotEnough" end

		-- reset the run
		data.Coins = 0
		data.Bag = 0
		data.ToolTier = 1
		data.BagTier = 1
		data.Zone = 1
		data.Rebirths += 1

		-- immediate and milestone rewards
		local reward = Config.Rewards[data.Rebirths] or Config.DefaultReward
		data.Gems += reward.Gems
		if reward.PetSlot then data.PetSlots += 1 end

		DataService.changed(player, "Coins", "Bag", "ToolTier", "BagTier", "Zone", "Rebirths", "Gems", "PetSlots")
		return true, data.Rebirths
	end
end

return RebirthService
```

After a rebirth, the client teleports the character to the zone 1 spawn with `Character:PivotTo(spawnCFrame)` from the server, plays a 2-second celebration and shows the new multiplier.

**11.9 Number formatting.**

```lua
--!strict
-- ReplicatedStorage/Shared/Format.lua
local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc" }

local Format = {}

function Format.abbreviate(n: number): string
	if n ~= n or n == math.huge or n == -math.huge then
		return "0"
	end
	local sign = if n < 0 then "-" else ""
	n = math.abs(n)
	if n < 1000 then
		return sign .. tostring(math.floor(n))
	end
	local tier = math.min(math.floor(math.log10(n) / 3), #SUFFIXES - 1)
	local scaled = n / 10 ^ (tier * 3)
	local text: string
	if scaled < 10 then
		text = string.format("%.2f", scaled)
	elseif scaled < 100 then
		text = string.format("%.1f", scaled)
	else
		text = tostring(math.floor(scaled))
	end
	if string.find(text, ".", 1, true) then
		text = string.gsub(text, "0+$", "")
		text = string.gsub(text, "%.$", "")
	end
	return sign .. text .. SUFFIXES[tier + 1]
end

return Format
```

**11.10 Purchases.** Use one `PurchaseService` module that sets `MarketplaceService.ProcessReceipt` once, checks `Receipts[receiptInfo.PurchaseId]` before granting, grants, marks the receipt, forces a save, and returns `Enum.ProductPurchaseDecision.PurchaseGranted` only after the save succeeds [28][29]. Check passes with `MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)` on join (wrapped in `pcall`, cached per session) and listen to `PromptGamePassPurchaseFinished` to grant in-session. Full module in [[09 Shops and Monetization]].

**11.11 Performance budget (targets).** 20 to 30 players per server for pet sims (fewer pets on screen), up to 40 for stat sims. Max 12 visible pets per player, pet follow computed on each client for all pets in one `RunService.RenderStepped` or `PreSimulation` loop. Breakables respawn on the server with no physics (`Anchored = true`). Popups pooled. Test on a low-end phone in the Device Emulator and on a real device ([[08 Mobile]]).

## 12. Twists that work

A plain "click, sell, rebirth" simulator competes with hundreds of clones. Pick one twist, put it in the icon, and keep the rest of the loop standard.

1. **A physical verb.** Throwing, slingshotting, digging down through layers, swinging on ropes. The collection loop stays; the verb becomes fun on its own.
2. **Helpers that look like work.** Bee Swarm's bees physically gathering pollen around you [7] beat a number in a corner. Make your helpers do visible work: miners digging, robots carrying, birds fetching.
3. **A stat that changes your body or vehicle.** Muscle Legends makes the stat the flex [20]. Height, speed, size, glow.
4. **Luck as the axis.** Sol's RNG shows a simulator can be built on a luck stat with crafted gear [23]. Combine a normal income loop with a luck stat for rare drops.
5. **Co-op bosses.** A boss every 15 minutes that the whole server fights, with drops by contribution. Sol's RNG added a co-op boss for up to eight players [23].
6. **A converter base.** A personal hive, factory or kitchen where raw resources become currency, upgraded slot by slot (Bee Swarm's hive space [7]). Halfway to a tycoon ([[Genre - Tycoon]]).
7. **A meme or trend theme.** The verb and loop stay standard; the theme rides what is trending. Pulse checks the charts first.
8. **Seasonal biomes.** A zone that changes with real-world time or events (Bubble Gum Simulator Infinity's Day and Night event [15]).
9. **A crafting layer.** Combine drops into gear that adds a multiplier. Gives a use to duplicates and a reason to farm old zones.
10. **A small PvP or race layer.** A 2-minute race or arena every 10 minutes with stats mattering but not deciding.

## 13. Failure modes

| Failure | Symptom in data | Cause | Fix |
|---|---|---|---|
| Slow first purchase | Many players leave at 1 to 2 min | First upgrade costs too much or bag too big | First upgrade at 40 to 70 s; starter bag 20 |
| Fog of goals | Session median under 6 min | No visible next goal | Goal tile, priced gate visible from spawn |
| Rebirth fear | Players stop at the last zone and quit | Rebirth looks like loss | Show benefits first; pay gems immediately; keep pets [1] |
| Wall at zone 4 to 5 | Drop-off at the same gate | Gate price jump too steep | Simulate; keep time-to-gate growth under about 1.5x per zone |
| Inflation | Coin packs and old prices meaningless | No sinks, flat rewards | Scale rewards to progress; add sinks |
| Pay-to-progress complaints | Bad votes, comments | Zones or rebirths paywalled | Paid items speed up, never gate |
| Exploited verb | Leaderboards full of impossible numbers | Client trusted | Server rate limit and range checks |
| Phone lag | High leave rate on mobile | Too many pets, particles, parts | Pet cap, hide-pets setting, streaming |
| Content runs out | Day-7 return collapses | No updates | Two-week cadence and content kit |
| Lost purchases | Support complaints, refunds | Broken `ProcessReceipt` | One handler, idempotent, save before granting [28][29] |
| Data loss | Players report resets | No session lock, saves on every change | Session-locked saves, autosave interval, `BindToClose` |
| Macro abuse | Rebirth counts too high | Unlimited auto rebirth | Publish a rule like Miner's Haven's [32]; rate limit rebirths |

## 14. Pitch checklist: is this genre right for us right now?

Pulse answers each with evidence from `node studio/cli.mjs market --refresh` and the sources above.
- [ ] Is a simulator in the top charts right now growing, and is our verb different from the top three?
- [ ] Can the verb be shown in a single icon image and understood without words?
- [ ] Do we have a twist from section 12 that fits in one sentence?
- [ ] Can we ship 5 zones, 6 eggs, 30 pets, 3 quest givers and rebirth in the first build?
- [ ] Do we have content for 4 updates (8 weeks) planned before launch?
- [ ] Will the economy simulation reach first rebirth in 25 to 40 minutes without passes?
- [ ] Is the theme our own (no copied pets, characters or names)?
- [ ] Is the target audience the 8 to 14 phone-first player, and is everything designed for them?
- [ ] If eggs are paid, is the odds display and policy handling planned ([[Genre - RNG and Collection]])?
- [ ] Is the build within 15 agent-days for systems 1 to 12 in section 11?

If fewer than 8 boxes are ticked, pitch a different genre or a different twist.

## 15. Checklist, common mistakes, references

### Checklist (Producer verifies in Studio)
- [ ] Spawn faces a collectible cluster within 20 studs; the starter tool is equipped at spawn.
- [ ] First swing shows a popup and sound with no visible delay on a 250 ms emulated connection.
- [ ] Starter bag fills in 10 to 20 s; the sell pad is within 25 studs.
- [ ] First upgrade is affordable between 40 and 75 s on a fresh account (Playtest timing log).
- [ ] Goal tile always shows the next purchase.
- [ ] Zone 2 gate is visible from spawn with its price readable at 50 studs.
- [ ] No popup, offer or daily window appears before 4:30.
- [ ] First egg is free and gives a fixed pet.
- [ ] Rebirth screen shows current vs next multiplier, what resets and what stays.
- [ ] First rebirth reached in 25 to 40 min in Balance's simulation (file in `sim/`).
- [ ] Income formula has separate buckets and a breakdown screen.
- [ ] Every remote in 11.3 has the listed server checks (Reviewer reads each handler).
- [ ] Swing handler rejects calls faster than 80% of the cooldown.
- [ ] `ProcessReceipt` is set in exactly one script and records `PurchaseId` before returning `PurchaseGranted`.
- [ ] Paid eggs show every outcome as a percentage summing to 100%, behind a button labelled with a word.
- [ ] Luck passes and boosts state their effect in numbers, and the odds view updates when they are active.
- [ ] Numbers display with suffixes and never show `inf` or `nan`.
- [ ] Data saves on leave, on `BindToClose` and every 60 to 120 s; a forced shutdown loses at most 2 minutes.
- [ ] Max 12 pets per player are rendered; "hide other pets" setting works.
- [ ] Nothing covers the jump button area on touch devices.
- [ ] Leaderboard updates within 60 s.
- [ ] Daily reward and playtime gifts claim correctly across a server hop.
- [ ] Analytics: onboarding funnel steps and economy sources and sinks are logged.
- [ ] Content kit (zone, breakable, egg, pet templates) exists for updates.

### Common mistakes
1. Copying a famous simulator's pets, names or UI art instead of its patterns.
2. A starting bag so big that the first sell takes minutes.
3. Hiding locked items: players need to see what they are working toward.
4. Rebirth with no immediate reward, so it feels like losing.
5. Resetting pets or passes on rebirth.
6. Multiplying every bonus together with no buckets, so combinations explode.
7. Fixed-size coin packs that become worthless.
8. Paid eggs without a percentage odds list, or with an unlabeled (i) icon [30].
9. Trusting the client for swings, sells, hatches or rebirths.
10. Setting `ProcessReceipt` in several scripts [29].
11. Saving to the data store on every coin change instead of on an interval.
12. Too many pets and particles for phones.
13. Popups at spawn: daily, starter pack and group join all at once.
14. Zone gates priced by gut feeling, causing a wall at zone 4 or 5.
15. Launching with trading before duplication and scam protection exist.
16. One giant update after a month of silence instead of steady small ones.
17. Auto-swing sold, then macro users banned without a published rule [32].
18. No "hide other players' pets" or low-effects setting.
19. Numbers that overflow display width ("1234567890" instead of "1.23B").
20. No plan for the day-7 player: nothing new after the first rebirth.

### References
[1] Roblox Simulator Game Guide (creation.dev) — https://www.creation.dev/blog/roblox-simulator-game-guide — Rebirth gives simulators their longevity; show the benefit before the reset; typical rebirth rewards (permanent multiplier, new area, exclusive pets, new upgrade tier).
[2] Simulator, glossary entry (creation.dev) — https://www.creation.dev/pt/glossary/simulator — Glossary definition of the Roblox simulator genre.
[3] Gamepasses (Pet Simulator 99), Pet Simulator Wiki — https://pet-simulator.fandom.com/wiki/Gamepasses_(Pet_Simulator_99) — Magic Eggs pass: 10% gold and 10% rainbow chance from any egg.
[4] Pet Simulator 99 Rebirths (Bloxodes) — https://bloxodes.com/wiki/pet-simulator-99/rebirths — Rebirths as a friendly prestige that unlocks features (auto-hatch, teleport) without wiping progress.
[5] How To Get Charged Eggs In Pet Simulator 99 (GINX) — https://www.ginx.tv/en/pet-sim-99-charged-eggs — Charged Eggs need Rebirth 6, boost Huge-pet luck, and raise hatch costs.
[6] Pet Simulator 99, Roblox Wiki (Fandom) — https://roblox.fandom.com/wiki/BIG_Games_Pets/Pet_Simulator_99 — Developer BIG Games Pets; fourth game in the series; centred on hatching eggs.
[7] Bee Swarm Simulator, Bee Swarm Simulator Wiki — https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator — Made by Onett, released March 23, 2018; pollen converted to honey at the hive; honey buys bees, hive space and equipment.
[8] Bee Swarm Simulator (TV Tropes) — https://www.tvtropes.org/pmwiki/pmwiki.php/VideoGame/BeeSwarmSimulator — Overview of the game's structure: bear quest givers, mobs and bosses.
[9] Bee Swarm Simulator Onett Quests Guide (TechWiser) — https://techwiser.com/bee-swarm-simulator-onett-quests-guide/ — Onett's quests behind the Bear Gate need 30 bees and reward a Star Treat.
[10] Bee Swarm Simulator wiki (Bloxodes) — https://bloxodes.com/wiki/bee-swarm-simulator — Community overview of the collect-convert-upgrade loop.
[11] Bee Swarm Simulator accessibility (Family Gaming Database) — https://www.familygamingdatabase.com/accessibility/Bee+Swarm+Simulator — Accessibility review of a reference simulator, useful for settings planning.
[12] Bubble Gum Simulator Infinity Update 12 patch notes (Sportskeeda) — https://www.sportskeeda.com/roblox-news/bubble-gum-simulator-infinity-update-12-patch-notes — Update 12 on July 12, 2025: Rift Summons, 500M Visits Event, Super Chest, Infinity Potions.
[13] Bubble Gum Simulator Infinity Update 12 guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/bubble-gum-simulator-infinity-update-12-guide — Guide to the Update 12 additions.
[14] When is the next Bubble Gum Simulator Infinity update? Summer Festival (Sportskeeda) — https://www.sportskeeda.com/roblox-news/when-next-bubble-gum-simulator-infinity-update-summer-festival-explored — Summer Festival update set for May 24, 2025.
[15] Bubble Gum Simulator Infinity Day and Night Event (Sportskeeda) — https://www.sportskeeda.com/roblox-news/bubble-gum-simulator-infinity-day-night-event-release-date-expect — Day and Night event on June 7, 2025 at 8 p.m. UTC.
[16] Bubble Gum Simulator Infinity release info (IMDb) — https://m.imdb.com/title/tt36357537/releaseinfo — Third-party listing of an April 14, 2025 release.
[17] Bubble Gum Simulator Infinity codes (The Escapist) — https://www.escapistmagazine.com/bubble-gum-simulator-infinity-codes/ — Codes as a recurring live-ops reward in a top simulator.
[18] Muscle Legends Rebirth Guide (Driffle) — https://driffle.com/blog/muscle-legends-rebirth-guide-costs-gains-losses/ — Rebirth at 10,000 Strength; permanent +5% training boost; immediate gems; Frost, Mythical and Muscle King gyms.
[19] How to Get Strong Fast in Muscle Legends (Driffle) — https://driffle.com/blog/how-to-get-strong-fast-in-muscle-legends/ — Training progression in a stat-based simulator.
[20] Muscle Legends guide (Earnaldo) — https://earnaldo.com/blog/muscle-legends-free-robux-guide — Core loop: train stats, rebirth for permanent multipliers, unlock stronger gyms.
[21] Muscle Legends (Roblox) — https://www.roblox.com/games/3623096087 — The game's official listing.
[22] Roblox Muscle Legends codes (Dexerto) — https://www.dexerto.com/roblox/roblox-muscle-legends-codes-free-strength-gems-1720593 — Codes granting free strength and gems.
[23] Sol's RNG (RoWatcher) — https://rowatcher.com/games/5361032378 — Described as a luck-based incremental simulator by Sol's Studio: 200+ auras, crafted gear and potions boost luck; co-op boss for up to eight players.
[24] Conveyor category (The Miner's Haven Wikia) — https://minershaven.fandom.com/wiki/Category:Conveyor — Conveyors move ore between machines; the Military-Grade Conveyor moves ore 50% faster.
[25] Rebirth script excerpt (Scribd) — https://www.scribd.com/document/793859845/ms-lua — Example rebirth threshold of 10,000,000 × (rebirths + 1) checked before firing a server event.
[26] The Math of Idle Games, Part I (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i — Growth, cost, prestige and generator balancing in incremental games.
[27] The Math of Idle Games, Part III (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii — Prestige loops and patterns; prestige resets progress for persistent multipliers.
[28] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt: validate, grant, acknowledge; test mode.
[29] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — Only the most recent ProcessReceipt assignment takes effect.
[30] Paid random items policy (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/paid-random-items — Odds disclosure: all outcomes, percentages summing to 100%, labelled Info/Details button, probability modifiers covered.
[31] Rebirth Guide for Untitled Drill Game (Deltia's Gaming) — https://deltiasgaming.com/?p=219669 — A simulator rebirth system important enough to get dedicated guides.
[32] Miner's Haven: Sandbox Tycoon (Roblox) — https://www.roblox.com/ar/games/258258996/Miners-Haven-Sandbox-Tycoon — Game page warning that macro-driven continuous rebirthing results in a ban.
[33] Reinforced Furnace (The Miner's Haven Wikia) — https://minershaven.fandom.com/wiki/Reinforced_Furnace — Rare furnace processing ore at 5x, placed high so ore needs a ramp or cannon.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Idle and Incremental]] · [[Genre - RNG and Collection]] · [[Genre - Tycoon]]
