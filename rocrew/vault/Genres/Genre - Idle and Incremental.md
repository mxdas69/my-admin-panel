---
tags: [vault, genre, idle, incremental, prestige, offline, big-numbers, afk]
for: [lead, pulse, architect, balance, builder, merchant]
also: [frame, scenic, playtest, kid-tester, reviewer, liveops, splash, producer]
---

# Genre - Idle and Incremental

An incremental game is one where numbers grow and every upgrade makes them grow faster. An idle game is an incremental game that keeps progressing when the player stops pressing buttons, or even leaves. The genre has a long history outside Roblox: Anthony Pecorella, who produced AdVenture Capitalist for mobile, traced it back to Progress Quest in 2002 and laid out its math in a three-part series and GDC talks [1][3][6][8]. On Roblox the pattern rarely appears in pure form. It shows up inside simulators (training stats that compound), tycoons (machines that earn while you walk around), and luck games such as Sol's RNG, which trackers describe as a luck-based incremental simulator [13].

This page covers the incremental engine itself: generators, cost curves, multipliers, prestige layers, offline earnings, AFK play under Roblox's rules, and numbers too big for a normal float. It decides whether the mid-game feels like steady acceleration or a wall, and whether players come back tomorrow to collect what they earned overnight.

Read this page when the game's main reward is a number that compounds: any simulator or tycoon with rebirths, any game with AFK income, and any game planning a prestige layer. Balance owns the formulas here and must model them in `games/<slug>/sim/` ([[04 Progression and Economy]]). Builder owns the big-number and offline code. Pair this page with [[Genre - Simulator]] or [[Genre - Tycoon]] for the world around the engine.

Numbers about real games carry citations. Every other number (growth rates, caps, prices, timings) is **this studio's design target**, a starting point that Balance tunes with a simulation.

## 1. What it is and why it works on Roblox

**Definitions the crew uses.**
- **Incremental:** progress is a number that grows, and spending that number raises its growth rate. Growth compounds.
- **Idle:** some or all progress happens without input: generators that produce on their own, automation, and offline earnings collected on return.
- **Prestige:** a reset that trades most of your progress for a permanent bonus that makes the next run faster. Pecorella defines it as resetting most progress in exchange for prestige currency and/or persistent multipliers, a mechanic popularized by Cookie Clicker [3].
- **Generator:** anything that produces currency per second and can be bought in quantity (a dropper, a worker, a bee, a training machine).

**Why it works.** Incremental games deliver a steady stream of small decisions with visible results ("buy 10 more or save for the next tier?"), punctuated by big jumps (milestones, prestige). The player always gets faster, and the game is designed so they feel it. Game Developer has covered the rise of "games you mostly don't play" as a design trend [10].

**Why it fits Roblox.**
- **Children check in.** Short bursts between school, meals and other games suit "come back and collect".
- **Roblox players already leave games running.** AFK play is part of the culture of simulators and luck games; Sol's RNG's core loop is pressing a button and hoping, with luck boosted by crafted gear and potions [13][27].
- **Compounding numbers are the simulator's engine.** Muscle Legends trains stats and rebirths for permanent multipliers [15]; Pet Simulator 99's rebirths unlock automation such as auto-hatch [17]. Every simulator is an incremental game with a world around it [28].
- **It is cheap content.** A new generator tier is a model and three numbers.

**Where Roblox differs from mobile idle games.**
1. **A Roblox session lives in a server.** When the player leaves, nothing runs. "Offline progress" is computed when they return, from the time they were away.
2. **Roblox disconnects idle clients.** As a rule of thumb from experience, a client with no input for about 20 minutes is kicked as idle; `Player.Idled` tells the client how long it has been idle. Do not try to defeat this with simulated input. Design so a kick costs nothing: offline earnings cover the gap.
3. **It is a 3D social platform.** A pure spreadsheet UI feels out of place. Show generators in the world (machines on your base, helpers around you) and let other players see them.
4. **The audience is young.** Exponents and scientific notation lose 10-year-olds. Use suffixes (K, M, B) and big visual changes, and keep the number of currencies on screen to two or three.

**Audience and session shape (targets).** Ages 9 to 15. Active bursts of 3 to 8 minutes, AFK stretches of 20+ minutes, 2 to 4 check-ins per day. A first session of 10 to 15 minutes that ends with "your factory keeps working while you are away."

## 2. The core loop

**The loop statement:**

> Earn currency → buy generators and upgrades that earn more per second → hit a milestone that multiplies a generator → unlock the next generator tier → when growth slows, prestige for a permanent multiplier → leave, come back, collect, repeat faster.

**Time layers.**

| Layer | What happens | Target |
|---|---|---|
| Seconds | Counters tick, generators cycle, tap bonus | Something visibly increases at least 4 times per second (counter animation) |
| Minutes | Buy the next generator or upgrade | A meaningful purchase every 30 to 90 s while active |
| Session | Unlock a tier, reach a milestone, maybe prestige | One new tier or milestone per 5 to 10 min active |
| Hours | Offline earnings, timed boosts, automation | Offline cap 4 to 8 h free, so a morning and evening check-in both pay |
| Days and weeks | Prestige layers, events, new tiers in updates | First prestige in session 1 or 2; a second prestige layer by day 5 to 10 |

**Loop variants.**
- **Tap-first.** Tapping is the main income early and generators take over (classic clicker). Use when the verb is fun (a satisfying tap with juice).
- **Generator-first.** Tapping is minor or absent; the game is choosing what to buy (AdVenture Capitalist style, the series' main model [1][2]).
- **Training-first.** The generator is your own character's stat, raised by an exercise; Muscle Legends trains stats and rebirths for multipliers [15][16].
- **Luck-first.** The incremental number is luck, and the reward is a roll (Sol's RNG) [13]. See [[Genre - RNG and Collection]].
- **Conversion chain.** One generator makes a raw resource, another converts it (Bee Swarm's pollen to honey) [23]. Adds a second bottleneck to manage.
- **Factory flow.** Generators connect physically, and layout decides output (Miner's Haven's conveyors; an item there permanently raises all conveyor speed on your base) [19].

**Loop rules.**
1. **The game plays itself within 30 s.** The first generator is bought by about 15 to 20 s and visibly produces without input by 30 s. That moment is the genre's hook.
2. **There is always a purchase within 90 s of income while active.** If the cheapest useful purchase is further away, add an upgrade or milestone in between.
3. **Every purchase is a decision with two options.** "More of this" versus "save for that." If there is only one sensible choice, automate it (auto-buy) or remove it.
4. **Growth slows before a prestige and jumps after it.** The slowdown is the signal; the prestige screen tells the player exactly how much faster the next run will be. When players have to look up rebirth guides to decide when to reset [26], the game has failed to tell them.
5. **Leaving is rewarded, never punished.** Offline earnings, collected with a popup, are the reason to come back.

## 3. Top games in the genre

### AdVenture Capitalist and the math of idle games
**Game:** AdVenture Capitalist (mobile), produced by Anthony Pecorella during his seven years at Kongregate ([1])
**Shows:** Pecorella's series uses his talks to explain growth, cost, prestige and generator balancing (Part I), alternate growth models and generator relevance (Part II), and prestige loops and patterns (Part III), drawing on spreadsheet models [1][2][3]. The material comes from a GDC Free-to-Play Summit talk and a GDC Europe 2016 session [6][7][8], and was reposted by GameAnalytics [4][5].
**Why it works:** It treats the idle game as a set of curves that can be designed, not guessed.
**Steal:** The vocabulary and the spreadsheet habit: cost growth per generator, production per generator, milestone multipliers, prestige currency. Balance writes these as a simulation before building.
**Avoid:** Copying mobile idle monetization (ads every few minutes) into Roblox. Roblox's model is passes and products.

### Cookie Clicker: the prestige pattern
**Game:** Cookie Clicker, by Orteil ([3])
**Shows:** Pecorella credits Cookie Clicker with popularizing (and perhaps conceiving) prestige: resetting most progress for prestige currency or persistent multipliers [3].
**Why it works:** Prestige turns a game that would otherwise end into one that loops, each loop faster.
**Steal:** A prestige that is optional, previewed and always worth it once the slowdown sets in.
**Avoid:** Prestige that resets things the player paid Robux for.

### Progress Quest: the zero-input extreme
**Game:** Progress Quest (2002), credited by Pecorella with starting the genre ([1][9])
**Shows:** It is cited as an early game that plays itself entirely [1]; the incremental genre's history is summarized on Wikipedia [9].
**Why it works:** It proves that watching progress, with no input at all, can hold attention when the progress is legible.
**Steal:** Make passive progress readable: names, levels, a log of what happened ("Your miners found 3 gems").
**Avoid:** Zero-input design on Roblox. Players are in a social 3D world and want things to do there.

### Sol's RNG: incremental luck
**Game:** Sol's RNG, by Sol's Studio ([13])
**Shows:** Described by a tracker as a luck-based incremental simulator: players roll for over 200 auras, some as rare as 1 in 1 billion, while crafting gear and drinking potions to raise luck [13]. Its core loop is pressing a button and hoping, and its biomes reroll and change which auras are likely [27].
**Why it works:** The incremental number (luck) is invisible fun, and its payoff is a dramatic moment.
**Steal:** An incremental stat that pays off through chance events, not only through a bigger counter.
**Avoid:** Reading it as a pure idle game; most of its pull comes from rarity and reveals ([[Genre - RNG and Collection]]). Trackers even publish "is it dying?" trend pages for it [14]: no game outgrows live ops.

### Muscle Legends: the stat as the generator
**Game:** Muscle Legends ([15])
**Shows:** Guides describe training stats, rebirthing for permanent multipliers and unlocking stronger gyms [15]; one reports a first rebirth at 10,000 Strength with a permanent +5% to later training [16].
**Why it works:** The generator is your character. Growth is visible on your avatar and in leaderboards.
**Steal:** A compounding stat with a social display.
**Avoid:** A +5% permanent bonus alone is too small to feel; pair it with immediate rewards, as the guide describes gems and new gyms [16].

### Pet Simulator 99: automation as a prestige reward
**Game:** Pet Simulator 99 ([17])
**Shows:** A guide reports that Rebirth 1 unlocks auto-hatch and teleport, and that rebirths do not wipe progress [17].
**Why it works:** Automation is the incremental genre's best reward: the player graduates from doing to deciding.
**Steal:** Unlock automation at prestige milestones (auto-buy, auto-collect, auto-hatch).
**Avoid:** Selling automation as Robux-only from minute one; it removes the "earned it" moment.

### Miner's Haven: automation rules and permanent upgrades
**Game:** Miner's Haven ([18][19])
**Shows:** The Hourglass item permanently increases the speed of all conveyors on your base [19]. The game page warns that macro-driven continuous rebirthing results in a ban [18].
**Why it works:** Permanent, base-wide upgrades are the incremental equivalent of prestige bonuses. The published macro rule tells players where automation ends.
**Steal:** Base-wide permanent multipliers as rare rewards. A written automation policy.
**Avoid:** A game whose optimal play is a macro. If players macro something, automate it in-game or rate-limit it.

### Bee Swarm Simulator: a two-stage generator
**Game:** Bee Swarm Simulator ([23])
**Shows:** Bees collect pollen, and pollen becomes honey only when brought back to the hive [23].
**Why it works:** The second stage (conversion) is a bottleneck that creates a reason to return and a second thing to upgrade.
**Steal:** Two-stage production for a mid-game layer: raw output and conversion capacity.
**Avoid:** Adding a third and fourth stage before players master two.

### Bubble Gum Simulator Infinity: consumable boosts
**Game:** Bubble Gum Simulator Infinity ([24])
**Shows:** Its Update 12 added Infinity Potions alongside Rift Summons and a Super Chest [24].
**Why it works:** Consumable boosts give incremental players short, intense acceleration windows to plan around.
**Steal:** Timed boost items as rewards and products; they stack in duration, not strength.
**Avoid:** Boosts so strong that playing without them feels pointless.

### Indie devlogs: what small teams learned
**Game:** Doomscroll 2077 and a set of seven quick idle prototypes ([11][12])
**Shows:** One developer wrote up what building seven idle games in 30 days taught about incremental design [11]; another described designing an economy of aura, data and prestige [12].
**Why it works:** Short prototypes expose curve problems quickly.
**Steal:** Prototype the economy as a spreadsheet or a 200-line simulation before building any art.
**Avoid:** Taking another game's curve numbers as yours; tune your own.

## 4. The first five minutes for this genre, second by second

The idle engine usually lives inside a simulator or tycoon world; this timeline is for the engine's own beats.

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0 to 3 s | Spawn next to a big, glowing source object (a crystal, a machine, a tree) with "Tap to collect!" | Source within 10 studs; a `ProximityPrompt` with `HoldDuration = 0` or a tap on the object |
| 3 to 15 s | Tapping pops "+1" and the counter rises. The first generator ("Helper: 10") shows a progress bar filling | Each tap gives 1; the first generator costs 10 |
| 15 to 20 s | First generator affordable; one tap buys it. A helper appears and starts working | The helper model spawns next to the source and animates |
| 20 to 30 s | The counter rises with no input: "+1/s". Hint: "Your helper works for you!" | **The hook moment.** Rate text appears next to the counter |
| 30 to 60 s | Buy 2 more helpers (cost grows 15% each). First milestone at 5 helpers: "Helpers x2!" | Milestone toast, helpers glow |
| 60 to 90 s | Second generator tier visible and priced ("Drill: 150") | Tier 2 costs about 15x tier 1's base and produces about 8x |
| 90 s to 2:30 | First upgrade card: "Tap power x2" or "Helpers x2" for 500 | Upgrade grid opens with one card |
| 2:30 to 3:30 | Buy x10 toggle appears (only now, when it is useful) | Bulk buy uses the geometric-series formula |
| 3:30 to 4:30 | Third tier visible. A locked "Ascend" panel shows "Reach 1M total to Ascend" | Tease prestige early; unlock it later |
| 4:30 to 5:00 | Toast: "Your helpers keep working while you're away, up to 8 hours." Daily reward introduced | The return promise is the last thing taught |

**Rules for the opening.**
1. **Generator before 20 s, passive income before 30 s (targets).**
2. **One currency only in the first five minutes.** The second currency arrives with prestige.
3. **Bulk-buy controls appear when they are useful, not before.**
4. **Show the prestige before unlocking it.** A locked panel with the requirement turns "what is this for?" into a goal.
5. **Teach the offline promise before the player's first exit.** If they do not know, they do not come back to collect.

## 5. Progression and economy

**5.1 Generators.** Each generator tier i has a base cost `c_i`, a cost growth rate `r_i`, a base production `p_i` per second per unit, and an owned count `n_i`.

```
next_cost(i)        = c_i × r_i ^ n_i
cost_of_k_more(i,k) = c_i × r_i ^ n_i × (r_i ^ k − 1) / (r_i − 1)
max_affordable(i,M) = floor( log( M × (r_i − 1) / (c_i × r_i ^ n_i) + 1 ) / log(r_i) )
production(i)       = p_i × n_i × milestone_multiplier(n_i) × upgrades(i) × global_multiplier
```

The defining feature, as the idle-math series explains, is that costs grow exponentially while production per unit grows linearly with count, so each tier's marginal value falls until milestones or new tiers restore it [1][2].

**Studio starting template (targets for Balance to tune):**

| Tier | Name (example) | Base cost c | Growth r | Production p (/s) | Base cost / production |
|---|---|---|---|---|---|
| 1 | Helper | 10 | 1.15 | 1 | 10 s |
| 2 | Drill | 150 | 1.14 | 8 | 19 s |
| 3 | Excavator | 2,500 | 1.13 | 60 | 42 s |
| 4 | Crusher | 40,000 | 1.12 | 450 | 89 s |
| 5 | Refinery | 750,000 | 1.11 | 3,500 | 214 s |
| 6 | Reactor | 15,000,000 | 1.10 | 28,000 | 536 s |
| 7 | Orbital Rig | 400,000,000 | 1.09 | 250,000 | 1,600 s |
| 8 | Star Forge | 12,000,000,000 | 1.08 | 2,500,000 | 4,800 s |

Rules for the table:
- Each tier's base cost is about 15x to 30x the previous one, and its production 7x to 10x. That keeps every tier worth buying when it unlocks and lets lower tiers fade gently, the "generator relevancy" problem discussed in Part II [2].
- Growth rates fall slightly with tier (1.15 down to 1.08), so high tiers can be bought in bulk.
- The base cost to production ratio (payback for the first unit) roughly doubles per tier.

**5.2 Milestones.** Owning 25, 50, 100, 200, 300 and 400 of a generator multiplies its production (x2 each, with x3 at 100 and 400). Milestones create targets inside each tier and the satisfying "jump". Show the next milestone on each row ("37 / 50 → x2").

**5.3 Upgrades.** One-time purchases that multiply a generator, all generators, or tap power. Price each upgrade at about 3 to 10 minutes of current income when it appears. Sort the upgrade grid by price; gray out unaffordable ones, never hide them.

**5.4 Prestige.** The prestige layer is what keeps an incremental game alive past the first day; Part III of the idle-math series is devoted to prestige loops and patterns [3].

```
prestige_tokens_on_reset = floor( 100 × sqrt( lifetime_earnings_this_run / 1e6 ) )
prestige_bonus           = 1 + 0.02 × total_tokens        -- +2% production per token, additive
```

- The square root means doubling lifetime earnings gives about 1.41x the tokens: early prestiges come quickly, later ones need much longer runs.
- **When to suggest prestige:** when the tokens available on reset are at least 50% of the tokens already held (it would raise production by a third or more). Show "Ascend now for +X tokens: next run x1.6 faster" and highlight the button only then.
- **Show the benefit before the reset** [20]. Simulators often use a simpler linear threshold instead of a token formula, for example 10,000,000 × (rebirths + 1) [25]; the token formula above scales better past the third prestige.
- **What resets:** run currency, generators, upgrades. **What stays:** tokens, the token shop, achievements, cosmetics, passes, automation unlocked by milestones.
- **Token shop:** permanent purchases with tokens (start with 5 Helpers, auto-buy tier 1, offline cap +2 h, tap power x3). This gives tokens a second use besides the passive bonus.

Worked prestige example (targets):

| Run | Lifetime earned in run | Tokens gained | Total tokens | Production bonus | Target run length |
|---|---|---|---|---|---|
| 1 | 4M | 200 | 200 | x5.0 | 20 to 30 min |
| 2 | 30M | 547 | 747 | x15.9 | 30 to 40 min |
| 3 | 150M | 1,224 | 1,971 | x40.4 | 40 to 60 min |
| 4 | 900M | 3,000 | 4,971 | x100.4 | 60 to 90 min |
| 5 | 5B | 7,071 | 12,042 | x241.8 | 1.5 to 2 h |

(Check: tokens = floor(100 × sqrt(earned / 1e6)): sqrt(4) = 2 → 200; sqrt(30) ≈ 5.477 → 547; sqrt(150) ≈ 12.25 → 1,224; sqrt(900) = 30 → 3,000; sqrt(5,000) ≈ 70.7 → 7,071. Bonus = 1 + 0.02 × total.)

**5.5 Layered prestige.** When single prestige runs pass about 2 hours, add a second layer that resets tokens for a higher-order currency with its own shop (rebirth → ascension → transcendence). Each layer should arrive when the one below it has stopped feeling fresh, roughly every 1 to 2 weeks of regular play. Simulators often call the first layer "rebirth" ([[Genre - Simulator]]).

**5.6 Offline earnings.**

```
offline_seconds = clamp(now − last_seen, 0, offline_cap)
offline_reward  = saved_rate_per_second × offline_seconds × offline_efficiency
```

Defaults (targets): `offline_cap = 8 h`, `offline_efficiency = 0.5`. Use the rate saved at the last save, not the rate after the player rejoins and buys things. Ignore gaps under 60 s. Offer "Collect" and "Collect x2" (a developer product or a rewarded action), never auto-collect silently: the popup is the reward moment.

**5.7 Timed boosts.** Boosts multiply production for a duration (2x for 15 minutes, 3x for 5 minutes). Rules: boosts of the same kind stack in duration, not in strength, with a cap of 4 hours queued; boosts from different sources (event, potion, server boost) multiply as separate buckets. Bubble Gum Simulator Infinity's potions are an example of consumable boosts in a top game [24].

**5.8 Tap value.** If tapping exists, scale tap value with production (for example `tap = 1 + 0.05 × production_per_second`), so tapping matters at every stage without dominating idling.

**5.9 Big numbers.** Luau numbers are 64-bit floats. Whole numbers are exact up to 2^53 (about 9.0e15), and the largest value is about 1.8e308; past that the number becomes `inf`. Incremental games reach 1e15 within days and 1e308 within weeks. Rules:
- Up to about 1e15: plain numbers are fine.
- Past 1e15: additions of small numbers to large ones are lost to rounding. Not a bug for display, but never use plain numbers for counts that must be exact (item counts, tokens).
- Before 1e300: switch run currency to a mantissa-exponent representation (`{m, e}`, section 11.6).
- Never save `inf` or `NaN`; clamp and validate every number on load and save.
- Display: suffixes to Decillion (Dc), then two-letter notation (aa, ab, ac ...) or scientific (1.23e45) as a setting. Default for kids: suffixes then letters.

**5.10 Sinks.** Incremental currency is its own sink (buying generators). Add prestige (the biggest sink), upgrades, and cosmetic or decorative purchases in the world so numbers have something visible to buy.

## 6. Monetization that fits

Merchant proposes, the owner sets prices and creates items. See [[09 Shops and Monetization]].

| Item | Type | Effect | Price range to propose (R$, targets) |
|---|---|---|---|
| 2x Production | Game pass | Permanent global x2 bucket | 199 to 349 |
| Offline Plus | Game pass | Offline cap 8 h → 24 h and efficiency 50% → 100% | 149 to 299 |
| Auto-Buy | Game pass | Auto-buys the best-value generator every few seconds; also unlockable by prestige | 199 to 299 |
| Faster Taps | Game pass | Tap power x3 | 99 to 149 |
| Time Warp 1 h | Developer product | Grants 1 hour of current production instantly | 19 to 39 |
| Time Warp 8 h | Developer product | 8 hours of current production | 79 to 149 |
| Time Warp 24 h | Developer product | 24 hours of current production | 199 to 299 |
| Boost 3x 30 min | Developer product | Timed boost | 29 to 49 |
| Offline x2 collect | Developer product | Doubles one offline collection | 15 to 29 |

**Rules.**
1. **Time warps are the genre's natural product.** They scale automatically with progress, so they never become worthless. Compute the grant on the server at purchase from the server's current rate.
2. **Never sell prestige currency directly in bulk.** It removes the run structure. Selling a permanent token multiplier pass is acceptable; selling 10,000 tokens is not.
3. **Automation is earned first, sold as a shortcut.** Pet Simulator 99 shows players accept earning automation through rebirths [17]; the pass is for the impatient, not the only path.
4. **Paid boosts state their exact effect and duration.** "3x production for 30 minutes."
5. **`ProcessReceipt` is idempotent and set once** [21][29][30]: record the `PurchaseId`, grant, save, then return `PurchaseGranted`.
6. **No paid random items without full odds disclosure** in percentages [22].
7. **One offer at a time, at natural moments:** after an offline collection ("Collect x2?"), after a prestige, or at a milestone. Never interrupt a purchase streak.

**Off-limits.**
- Mechanics that punish not paying (production decay, "your workers are tired").
- Offline earnings that only work for pass owners.
- Paid shortcuts that skip the first prestige before the player has done it once.
- Defeating Roblox's idle disconnect with simulated input, or selling a pass that claims to.

## 7. UI and HUD for this genre

Frame owns this with [[05 UI and HUD]] and [[08 Mobile]]. Idle games are UI-heavy; the risk is a spreadsheet on a phone.

**HUD (phone landscape, 1334 x 750 reference).**

| Area | Contents | Spec |
|---|---|---|
| Top center | Main currency with rate: "12.4M  +356K/s" | Pill 300 x 56 px; rate line 18 px, green |
| Top right | Prestige currency (after first prestige), boost timers | Pills 160 x 44 px; boost icons 44 px with radial timer |
| Left rail | Generators, Upgrades, Ascend, Shop, Daily | 72 x 72 px buttons |
| Right panel (toggle) | Generator list | 420 px wide, slides in over 0.2 s |
| Bottom center | Tap target hint early on; later empty | — |

**The generator list (the most important screen).** Each row 88 px tall:
- Left: icon 64 px in a tier-colored square.
- Middle: name (20 px), owned count (bold, 24 px), production of this row per second (16 px), and milestone progress ("37 / 50 → x2") as a 6 px bar.
- Right: buy button 132 x 64 px showing the price for the selected amount; green when affordable, gray when not.
- Header: buy amount toggle "x1 | x10 | x100 | Max" (appears after 2:30).
- Locked tiers: one row shows the next tier with its price and a silhouette; further tiers are hidden.

**Other must-have screens.**
1. **Upgrades:** grid of 96 x 96 px cards sorted by price; tapping shows the effect ("Drills x2"); buy in one more tap.
2. **Ascend (prestige):** "You will get +X tokens", "Next run: x1.6 faster", what resets, what stays, the token shop. The confirm button needs a 1 s hold to prevent mistakes.
3. **Offline popup:** "Welcome back! You were away 5 h 12 m. Your helpers earned 4.2B." Buttons: Collect, Collect x2 (product). Shows the cap if it was hit ("Cap: 8 h. Get Offline Plus for 24 h").
4. **Stats:** lifetime earnings, time played, prestiges, best run time. Players love it.
5. **Settings:** number format (suffix / letters / scientific), reduce effects, music, SFX.

**Mobile rules.** Rows and buttons sized for thumbs (buy buttons at least 120 x 60 px). The list scrolls with `ScrollingFrame` and `AutomaticCanvasSize = Enum.AutomaticSize.Y`. Counters update at most 10 times per second (tween the displayed value between server updates) to save performance. Format every number through one shared module.

## 8. World and look

Scenic owns this with [[06 World and Look]].

1. **Generators exist in the world.** Each tier has a visible model on the player's base or around their character, added as they buy more (one model per 10 owned, up to a cap, so 400 drills do not mean 400 models).
2. **Tiers escalate in size and spectacle.** Tier 1 is a small figure; tier 8 is a building-sized machine with beams and particles. Players should see their progress from across the map.
3. **Milestones change the world.** At milestone x2, the generator models glow or change color for a moment and permanently gain a trim color.
4. **Prestige changes the place.** Each prestige layer unlocks a new environment palette or a new base location ("You ascended: welcome to the Sky Foundry").
5. **AFK players are still social objects.** An AFK player's character sits in an "AFK" pose with a sign and their production rate above them; their base keeps animating for visitors.
6. **Performance.** The world representation is capped: at most 40 generator models per base, pooled, anchored, no physics. Counters and floating numbers are client-side.

## 9. Retention and social

See [[10 Retention and Social]].

1. **Offline earnings are the main return hook.** The cap (8 h) is set so a player who checks in morning and evening loses little, and both visits feel rewarded.
2. **Daily rewards** that include time warps (scaled automatically) and prestige tokens on day 7.
3. **Timed generators.** One special generator that must be collected every 4 hours (a "harvest"), creating a reason to check in.
4. **Leaderboards** for lifetime earnings, prestige count and fastest run. Fastest-run boards give veterans something to optimize.
5. **Visible flex.** Production rate over the head, base spectacle, prestige title next to the name.
6. **Server boosts.** One player buys a boost and the whole server benefits, with the buyer named.
7. **Co-op goals.** A server-wide counter ("Server goal: 1T total → everyone gets 2x for 30 min").
8. **Return hooks you name in the plan** for day 1, 2, 3 and 7. Example: day 1 offline collection; day 2 the first token-shop item; day 3 the second prestige layer preview; day 7 the streak reward.

## 10. Live ops and update cadence

See [[12 Live Ops and Launch]].

- **Every 2 weeks:** new generator tiers at the top of the curve (veterans' content) and new token-shop items.
- **Every 4 to 6 weeks:** a timed event with a separate mini incremental track: its own currency and generators that run in parallel, reset at event end, and pay cosmetics and permanent rewards. This gives every player a fresh start for a week without touching the main economy.
- **Every 6 to 10 weeks:** a new prestige layer or a big system (research tree, crafting).
- **Weekends:** server-wide 2x production.
- **Balance passes:** when lifetime earnings of the top 10% grow past the last tier's usefulness, add tiers rather than nerfing; nerfs to income feel like theft in an incremental game.

**What to watch.** Time to first generator, time to first prestige, prestige rate per day, offline collection rate (how many returning players collect, and how often they hit the cap), the cap hit rate (if most players hit the cap, it is too low), boost usage, and the share of players above 1e15 (when to ship the big-number system if you have not).

## 11. Building it in Studio

Builder owns code, Frame the UI, Merchant the purchases. See [[13 Building It Right]] and [[14 Roblox Studio Workflow]].

**11.1 Systems list.**
1. PlayerData with `LastSeen` and `SavedRate` written at every save.
2. Generator config and math module (shared).
3. Economy tick on the server (once per second for all players).
4. Purchase handlers: buy generator (x1, x10, x100, max), buy upgrade.
5. Milestones and upgrades.
6. Prestige layers and token shop.
7. Offline earnings on join.
8. Boosts (timed, stacking by duration).
9. Big-number module (if the curve passes 1e15).
10. Number formatting module (shared with UI).
11. World representation of generators (client, capped and pooled).
12. Monetization (passes, time warps, receipts).
13. Analytics.

**11.2 Architecture.**

```
ReplicatedStorage
  Shared/
    Config/ Generators.lua, Upgrades.lua, Prestige.lua, Boosts.lua, Monetization.lua
    Generators.lua      -- cost and max-affordable math (pure)
    Big.lua             -- mantissa/exponent numbers (pure)
    Format.lua          -- display formatting (pure)
  Remotes/
ServerScriptService
  Services/ DataService, EconomyService, GeneratorService, UpgradeService,
            PrestigeService, OfflineService, BoostService, PurchaseService
StarterPlayerScripts
  Controllers/ CounterController (tweened display), GeneratorWorldController, PopupController
StarterGui
  HUD, Generators, Upgrades, Ascend, Offline, Stats, Settings
```

**11.3 Remotes and validation.**

| Remote | Type | Client sends | Server checks |
|---|---|---|---|
| `Tap` | RemoteEvent | nothing | At most 12 taps per second accepted (rule of thumb for fast human tapping); excess ignored |
| `BuyGenerator` | RemoteFunction | tier, amount ("1", "10", "100", "Max") | Tier unlocked; computes cost on the server; enough currency |
| `BuyUpgrade` | RemoteFunction | upgrade id | Not owned; prerequisites; enough currency |
| `Ascend` | RemoteFunction | layer | Requirements met; at most once per 30 s |
| `BuyTokenItem` | RemoteFunction | item id | Enough tokens; limits |
| `CollectOffline` | RemoteFunction | doubled (bool) | Pending offline reward exists; doubled only if the product receipt was granted |
| `State` | RemoteEvent (server to client) | — | Sends balance, rate and changed rows about 2 times per second |

**11.4 Data schema.**

```lua
--!strict
-- ReplicatedStorage/Shared/IdleTypes.lua
export type BigNum = { m: number, e: number }

export type IdleData = {
	Version: number,
	Currency: BigNum,                  -- run currency (resets on prestige)
	Lifetime: BigNum,                  -- earned this run, for prestige math
	LifetimeAll: BigNum,               -- earned ever, for stats
	Generators: { [string]: number },  -- tier id -> owned count (exact integers)
	Upgrades: { [string]: boolean },
	Tokens: number,                    -- prestige currency (exact integer, stays below 2^53)
	TokenShop: { [string]: number },   -- item id -> level
	Prestiges: { [string]: number },   -- layer id -> count
	Boosts: { [string]: number },      -- boost id -> expiry os.time()
	SavedRate: BigNum,                 -- production per second at last save
	LastSeen: number,                  -- os.time() at last save
	PendingOffline: BigNum?,           -- computed on join, cleared on collect
	Daily: { Streak: number, LastClaim: number },
	Settings: { Notation: string },
	Receipts: { [string]: boolean },
}

return nil
```

**11.5 Generator math (shared).**

```lua
--!strict
-- ReplicatedStorage/Shared/Generators.lua
export type GenDef = { BaseCost: number, Growth: number, Production: number }

local Generators = {}

function Generators.nextCost(def: GenDef, owned: number): number
	return def.BaseCost * def.Growth ^ owned
end

function Generators.costOf(def: GenDef, owned: number, k: number): number
	local r = def.Growth
	return def.BaseCost * r ^ owned * (r ^ k - 1) / (r - 1)
end

function Generators.maxAffordable(def: GenDef, owned: number, money: number): number
	local r = def.Growth
	local first = def.BaseCost * r ^ owned
	if money < first then
		return 0
	end
	return math.floor(math.log(money * (r - 1) / first + 1) / math.log(r))
end

local MILESTONES = { { 25, 2 }, { 50, 2 }, { 100, 3 }, { 200, 2 }, { 300, 2 }, { 400, 3 } }

function Generators.milestoneMultiplier(owned: number): number
	local m = 1
	for _, step in MILESTONES do
		if owned >= step[1] then
			m *= step[2]
		end
	end
	return m
end

function Generators.production(def: GenDef, owned: number, upgradeMult: number): number
	return def.Production * owned * Generators.milestoneMultiplier(owned) * upgradeMult
end

return Generators
```

Server use: for "Max", compute `k = maxAffordable(...)`, then charge `costOf(def, owned, k)`. Recompute the cost on the server even though the client shows it.

**11.6 Big numbers (mantissa and exponent).**

```lua
--!strict
-- ReplicatedStorage/Shared/Big.lua: non-negative big numbers as m × 10^e with 1 <= m < 10
export type Big = { m: number, e: number }

local Big = {}

local function norm(m: number, e: number): Big
	if m <= 0 or m ~= m then
		return { m = 0, e = 0 }
	end
	local shift = math.floor(math.log10(m))
	return { m = m / 10 ^ shift, e = e + shift }
end

function Big.new(n: number): Big
	return norm(n, 0)
end

function Big.mul(a: Big, b: Big): Big
	return norm(a.m * b.m, a.e + b.e)
end

function Big.mulNum(a: Big, n: number): Big
	return norm(a.m * n, a.e)
end

function Big.add(a: Big, b: Big): Big
	if a.m == 0 then return b end
	if b.m == 0 then return a end
	local hi, lo = a, b
	if b.e > a.e then
		hi, lo = b, a
	end
	local diff = hi.e - lo.e
	if diff > 15 then
		return hi -- lo is below hi's precision
	end
	return norm(hi.m + lo.m / 10 ^ diff, hi.e)
end

function Big.sub(a: Big, b: Big): Big -- caller guarantees a >= b
	if b.m == 0 then return a end
	local diff = a.e - b.e
	if diff > 15 then return a end
	return norm(a.m - b.m / 10 ^ diff, a.e)
end

function Big.lt(a: Big, b: Big): boolean
	if a.m == 0 or b.m == 0 then
		return a.m < b.m
	end
	if a.e ~= b.e then
		return a.e < b.e
	end
	return a.m < b.m
end

function Big.toNumber(a: Big): number -- safe only while e < 308
	return a.m * 10 ^ a.e
end

return Big
```

`norm` rejects zero, negatives and NaN by returning zero, so a bad value can never be saved. Data stores save `{m = ..., e = ...}` tables as JSON without trouble. For exponents above about 1e15 (rare), switch `e` to a big number too; no Roblox incremental needs that at launch.

**11.7 Formatting with letter notation.**

```lua
--!strict
-- ReplicatedStorage/Shared/Format.lua (excerpt)
local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc" }

local function letters(index: number): string -- 1 -> "aa", 2 -> "ab", ... 26 -> "az", 27 -> "ba"
	local i = index - 1
	local first = math.floor(i / 26) % 26
	local second = i % 26
	return string.char(97 + first) .. string.char(97 + second)
end

local Format = {}

function Format.big(m: number, e: number): string
	if m == 0 then return "0" end
	if e < 3 then
		return tostring(math.floor(m * 10 ^ e))
	end
	local tier = math.floor(e / 3)
	local digits = m * 10 ^ (e - tier * 3)
	local suffix = SUFFIXES[tier + 1] or letters(tier - #SUFFIXES + 1)
	local decimals = if digits < 10 then 2 elseif digits < 100 then 1 else 0
	return string.format("%." .. decimals .. "f", digits) .. suffix
end

return Format
```

**11.8 Offline earnings on join.**

```lua
-- ServerScriptService/Services/OfflineService.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Big = require(ReplicatedStorage.Shared.Big)
local DataService = require(script.Parent.DataService)
local Passes = require(script.Parent.PassService)

local MIN_GAP = 60
local OfflineService = {}

function OfflineService.onDataLoaded(player: Player)
	local data = DataService.get(player)
	if not data then return end
	local now = os.time()
	local cap = if Passes.owns(player, "OfflinePlus") then 24 * 3600 else 8 * 3600
	local efficiency = if Passes.owns(player, "OfflinePlus") then 1 else 0.5
	local last = data.LastSeen or now
	local away = math.clamp(now - last, 0, cap)
	if away < MIN_GAP then return end

	local reward = Big.mulNum(data.SavedRate, away * efficiency)
	data.PendingOffline = reward
	ReplicatedStorage.Remotes.OfflineReady:FireClient(player, away, reward, now - last > cap)
end

function OfflineService.collect(player: Player, doubled: boolean)
	local data = DataService.get(player)
	if not data or not data.PendingOffline then return false end
	local reward = data.PendingOffline
	if doubled then reward = Big.mulNum(reward, 2) end
	data.Currency = Big.add(data.Currency, reward)
	data.Lifetime = Big.add(data.Lifetime, reward)
	data.PendingOffline = nil
	DataService.changed(player, "Currency")
	return true
end

return OfflineService
```

`os.time()` on the server is UTC seconds and cannot be changed by the player. The doubled collect is only reachable from `ProcessReceipt` for the matching product, never from a client flag alone.

**11.9 The economy tick.** One server loop, once per second, for all players: compute each player's rate from generators, upgrades, prestige bonus, passes and active boosts (cache the rate and recompute only when something changes), add `rate × 1` to `Currency` and `Lifetime`, and push a compact state to the client twice per second. The client tweens its displayed counter between updates so it never looks steppy. Save every 60 to 120 s and on leave; each save writes `LastSeen = os.time()` and `SavedRate`.

**11.10 Idle and AFK handling.** On the client, listen to `Players.LocalPlayer.Idled` to show a small "AFK" badge after 2 minutes idle (and tell the server so the character shows an AFK sign). Do not prevent the idle disconnect. When the player rejoins, offline earnings cover the time they were gone.

## 12. Twists that work

1. **Incremental inside a 3D world.** Generators are machines on your base or helpers around you (a hybrid with [[Genre - Tycoon]] or [[Genre - Simulator]]). The social world is Roblox's advantage over mobile idle games.
2. **Luck as the incremental stat.** Sol's RNG grows luck and pays it off in rare rolls [13].
3. **Training your character.** Muscle Legends' stat-as-generator [15].
4. **Factory layout.** Generators whose output depends on placement (Miner's Haven's conveyors [19]).
5. **Co-op production.** A server-wide generator everyone feeds, with a shared milestone reward.
6. **Story reveals.** Each tier unlocks a piece of story or a new area; a light narrative gives reasons beyond numbers (Progress Quest's readable log is the ancestor [1]).
7. **Event tracks.** Short, separate incremental runs during events, with cosmetic rewards.
8. **Research trees.** A slow parallel currency spent on a visible tree of permanent upgrades.
9. **Speedrun leaderboards.** Fastest time to the first prestige or to a target number, with weekly resets.

## 13. Failure modes

| Failure | Symptom | Cause | Fix |
|---|---|---|---|
| No hook | Players leave before 1 min | First generator too expensive; nothing passive by 30 s | Generator at 15 to 20 s |
| The wall | Activity collapses at one number (often around 1e6 to 1e9) | Tier gap too large; growth too high | Simulate; add milestones and upgrades in the gap |
| Nothing to decide | Players AFK permanently or quit | One obvious purchase every time | Auto-buy that, add real choices (tiers vs upgrades vs saving) |
| Prestige confusion | Few players prestige | No preview; unclear benefit | "Next run x1.6 faster" panel; suggest at +50% tokens |
| Prestige too early | Players reset for tiny gains and feel nothing | No threshold | Unlock prestige only above a minimum token gain |
| Offline exploit | Huge offline rewards | Client time trusted, or current rate used | Server `os.time()`, saved rate, cap |
| `inf` on screen | "inf" or "nan" shown, data corrupted | Float overflow | Big-number module before 1e300; validate saves |
| Idle-kick losses | Players complain about progress lost when kicked | No offline earnings | Offline earnings and frequent saves |
| UI spreadsheet | Kids confused, low mobile retention | Too many rows and numbers | Progressive reveal, big world feedback, suffixes |
| Nerfs | Angry community after a patch | Income reduced | Add tiers above instead of nerfing |
| Macro meta | Optimal play is a macro | Repetitive manual action | Automate in-game or rate-limit; publish a rule [18] |

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Is the incremental engine inside a world (simulator, tycoon, luck game), not a bare menu?
- [ ] Does the hook (passive income by 30 s) work with our theme?
- [ ] Has Balance written the generator table, milestones, prestige formula and offline formula in a simulation?
- [ ] Does the simulation show first prestige in 20 to 30 minutes, and no wall longer than 3 minutes of waiting while active?
- [ ] Is there a second prestige layer planned for week 2?
- [ ] Is the big-number plan decided (plain numbers to 1e15 or `{m, e}` from day one)?
- [ ] Are time warps and offline passes in the monetization plan?
- [ ] Are there four updates' worth of tiers and token-shop items planned?
- [ ] Is a 10-year-old able to understand every screen (Kid Tester review of mockups)?

Fewer than 7 ticks: reconsider, or fold the idle engine into a simulator or tycoon plan instead of making it the whole game.

## 15. Checklist, common mistakes, references

### Checklist (Producer verifies in Studio)
- [ ] First generator affordable by 20 s, passive income visible by 30 s on a fresh account.
- [ ] Counter shows a rate ("+N/s") and tweens smoothly.
- [ ] Bulk buy (x1, x10, x100, Max) costs match the geometric-series formula (Balance spot-checks 5 cases).
- [ ] Server recomputes every cost; client prices are display only.
- [ ] Milestone progress shows on every generator row.
- [ ] Prestige screen shows tokens gained, next-run speed, and what resets and stays; confirm needs a 1 s hold.
- [ ] Prestige is rate-limited on the server.
- [ ] Offline earnings: uses server `os.time()`, saved rate, cap and efficiency; gaps under 60 s ignored.
- [ ] Offline popup appears on rejoin with Collect and Collect x2.
- [ ] The doubled collect is only granted through `ProcessReceipt`.
- [ ] Every save writes `LastSeen` and `SavedRate`.
- [ ] No `inf` or `NaN` can be saved (test by forcing a huge value in Studio).
- [ ] Numbers format with suffixes, then letters; the notation setting works.
- [ ] Boosts stack by duration with a cap; separate sources multiply as buckets.
- [ ] World shows generator models, capped at 40 per base.
- [ ] The idle disconnect is not defeated; the AFK badge shows after 2 minutes idle.
- [ ] `ProcessReceipt` is set once and idempotent.
- [ ] Time warps grant `current rate × hours`, computed on the server.
- [ ] Analytics: time to first generator, first prestige, offline collection and cap-hit rates.
- [ ] Kid Tester confirms the generator list is readable on a phone.

### Common mistakes
1. A first generator that costs a minute of tapping.
2. Costs that grow linearly, so the game is solved quickly, or too steeply, so it walls.
3. New tiers that are not worth buying when they unlock.
4. No milestones, so a tier has nothing to aim for.
5. Prestige that is not previewed or that resets paid items.
6. Prestige formulas without a square root (or similar), making later prestiges trivial.
7. Offline rewards computed from client time or the current rate.
8. No cap on offline time, or a cap so low everyone hits it.
9. Waiting until players hit 1e308 to think about big numbers.
10. Using floats for exact counts (tokens, items) past 2^53.
11. A spreadsheet UI with 12 rows visible on a phone.
12. Showing scientific notation to young players by default.
13. Selling prestige currency in bulk.
14. Nerfing income after players have grown attached to it.
15. Trying to bypass the idle kick instead of designing around it.
16. One currency per system until the HUD shows six.
17. Counters updating every frame from the server, costing bandwidth.
18. Copying another game's curves instead of simulating your own.

### References
[1] The Math of Idle Games, Part I (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i — Growth, cost, prestige and generator balancing; Pecorella's background (Kongregate, AdVenture Capitalist) and the genre's roots in Progress Quest.
[2] The Math of Idle Games, Part II (Game Developer) — https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii — Alternate growth models and generator relevancy.
[3] The Math of Idle Games, Part III (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii — Prestige loops and patterns; prestige definition; Cookie Clicker popularizing prestige; spreadsheet models.
[4] The Math of Idle Games series (GameAnalytics) — https://gameanalytics.com/?p=6634 — Repost of the series covering prestige cycles and balance.
[5] Anthony Pecorella author page (GameAnalytics) — https://gameanalytics.com/author/anthony-pecorella — Author of the idle-math series.
[6] Idle Games: The Mechanics and... (GDC Vault, 2015) — https://gdcvault.com/play/1022065/Idle-Games-The-Mechanics-and — Pecorella's 2015 Free-to-Play Summit session on idle game mechanics.
[7] Idle Games: The Mechanics and..., companion entry (GDC Vault) — https://gdcvault.com/play/1022066/Idle-Games-The-Mechanics-and — Companion Vault entry for the same session.
[8] Quest for Progress: The Math and Design of Idle Games (GDC Europe 2016, SlideShare) — https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507 — Slides on idle-game math and design.
[9] Incremental game (Wikipedia) — https://en.wikipedia.org/wiki/Incremental_game — Definition and history of the genre.
[10] The Rise of Games You Mostly Don't Play (Game Developer) — https://www.gamedeveloper.com/design/the-rise-of-games-you-mostly-don-t-play — Idle games as a design category.
[11] I built 7 idle games in 30 days: what I learned about incremental design (DEV Community) — https://dev.to/aguier/i-built-7-idle-games-in-30-days-what-i-learned-about-incremental-design-5d3f — Lessons from rapid idle prototypes.
[12] Aura, Data and Prestige: Designing the Economy of Doomscroll 2077 (DEV Community) — https://dev.to/tanishpaul1106/aura-data-and-prestige-designing-the-economy-of-doomscroll-2077-293f — An indie devlog on an incremental economy with prestige.
[13] Sol's RNG (RoWatcher) — https://rowatcher.com/games/5361032378 — Described as a luck-based incremental simulator: 200+ auras up to 1 in 1 billion; crafted gear and potions boost luck.
[14] Is Sol's RNG dying? (RoWatcher) — https://rowatcher.com/games/5361032378/sol-s-rng-eon-1-29/dying — Tracker trend page for a top incremental game.
[15] Muscle Legends guide (Earnaldo) — https://earnaldo.com/blog/muscle-legends-free-robux-guide — Train stats, rebirth for permanent multipliers, unlock stronger gyms.
[16] Muscle Legends Rebirth Guide (Driffle) — https://driffle.com/blog/muscle-legends-rebirth-guide-costs-gains-losses/ — First rebirth at 10,000 Strength; +5% permanent training; gems and new gyms.
[17] Pet Simulator 99 Rebirths (Bloxodes) — https://bloxodes.com/wiki/pet-simulator-99/rebirths — Rebirth 1 unlocks auto-hatch and teleport; rebirths do not wipe progress.
[18] Miner's Haven: Sandbox Tycoon (Roblox) — https://www.roblox.com/ar/games/258258996/Miners-Haven-Sandbox-Tycoon — Macro-driven continuous rebirthing results in a ban.
[19] Conveyor category (The Miner's Haven Wikia) — https://minershaven.fandom.com/wiki/Category:Conveyor — The Hourglass permanently increases all conveyor speed on a base.
[20] Roblox Simulator Game Guide (creation.dev) — https://www.creation.dev/blog/roblox-simulator-game-guide — Rebirth as the source of longevity; show benefits before reset.
[21] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt for time warps and boosts.
[22] Paid random items policy (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/paid-random-items — Odds disclosure rules for any paid random reward.
[23] Bee Swarm Simulator Wiki — https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator — Pollen collected and converted to honey at the hive: a two-stage generator.
[24] Bubble Gum Simulator Infinity Update 12 patch notes (Sportskeeda) — https://www.sportskeeda.com/roblox-news/bubble-gum-simulator-infinity-update-12-patch-notes — Infinity Potions, Rift Summons and Super Chest added July 12, 2025.
[25] Rebirth script excerpt (Scribd) — https://www.scribd.com/document/793859845/ms-lua — Example rebirth threshold of 10,000,000 × (rebirths + 1).
[26] Rebirth Guide for Untitled Drill Game (Deltia's Gaming) — https://deltiasgaming.com/?p=219669 — Rebirth timing as a player decision worth a guide.
[27] Sol's RNG wiki (Bloxodes) — https://bloxodes.com/wiki/sols-rng — Core loop of pressing a button and hoping; biomes reroll and change aura odds.
[28] Simulator, glossary entry (creation.dev) — https://www.creation.dev/pt/glossary/simulator — Definition of the Roblox simulator genre that hosts most incremental engines.
[29] Developer products source (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/monetization/developer-products.md — PurchaseGranted and NotProcessedYet return values; set the callback once.
[30] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — Only the most recent ProcessReceipt assignment takes effect.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Simulator]] · [[Genre - Tycoon]] · [[Genre - RNG and Collection]]
