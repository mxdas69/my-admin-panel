---
tags: [vault, economy, progression, balance, currencies, rebirth]
for: [architect, builder, balance, merchant, reviewer, liveops]
also: [lead, pulse, frame, playtest, producer, kid-tester]
---

# 04 Progression and Economy

Progression is how fast the game hands out new goals; the economy is the plumbing that controls that speed: currencies, where they come from (sources), where they go (sinks), what things cost (curves), how multipliers stack, how prestige resets work, and how all of it is simulated before playtests and measured after launch. Too fast and players run out of things to want; too slow and they hit a wall. Either way they leave. Roblox's game-design guides [5] and its onboarding guidance [6] both measure the first minutes by whether players come back, and pacing is what those minutes are made of.

The economy decides the shape of every session. It sets when the first upgrade lands ([[01 The First Five Minutes]]), how often the short loop pays out ([[02 The Core Loop]]), how long rare rolls take ([[03 Rarity and RNG]]), and what the shop can fairly sell ([[09 Shops and Monetization]]). Roblox's analytics overview points to D1 retention and session time first and D7/D30 for long-term return [3]; walls show up as sessions that end at the same point for everyone, and inflation shows up as prices that stop mattering.

Balance owns the numbers and writes them up in `games/<slug>/economy.md`; Architect owns the structure (currencies, gates, rebirth); Builder implements it server-side; Merchant owns what Robux can buy; Reviewer checks that every number lives in Config and every price is recomputed on the server; Liveops watches the live economy. Read this chapter when planning a game, before every economy change, and before every playtest that follows one.

All curves, targets and ratios here are this studio's starting points to tune with the simulation and playtests, not measurements of other games. Facts about real games come only from the cited sources.

## Rules

### Currencies and authority

1. **Every tunable number lives in one Config module; no price, reward, cooldown or multiplier is a literal anywhere else.**
   Why: an economy is tuned by changing numbers. Numbers scattered across scripts get missed, and two copies of a price drift apart. Roblox's onboarding guidance notes values can be tuned with Configs and Experiments [7], which only works if the values live in one place.
   How: `ReplicatedStorage.Shared.Config` (shared so the UI shows real prices), frozen with `table.freeze`. A balance change is a Config diff that Balance writes and Reviewer checks. Reviewer greps for numeric literals in purchase and reward code.
   Done right: changing `Upgrades.Shovel.Growth` from 1.12 to 1.11 retunes the shop, the UI and the sim at once.
   Done wrong: `if coins >= 250 then` in a shop script.

2. **Balances live on the server in the player's data; leaderstats and attributes are display mirrors only.**
   Why: anything the client holds can be changed by an exploiter. The client never reports income, prices or balances.
   How: `data.Coins` in the server data module; after each change, mirror to `leaderstats.Coins.Value` and/or `player:SetAttribute("Coins", n)` for the UI. All purchases are server-side functions that read `data`, never the mirror.
   Done right: the shop server function reads `data.Coins` and recomputes the price.
   Done wrong: `Remotes.Buy:FireServer("Sword", currentCoins)`.

3. **Each currency has exactly one job a player can explain, and the HUD shows at most three.**
   Why: every extra currency is another number to understand; currencies with overlapping jobs confuse players and make balancing harder.
   How: Soft (Coins: earned by the core action, spent on upgrades/zones/rolls); Premium (Gems: earned slowly, sold for Robux, spent on boosts, premium rolls, skips, cosmetics); Prestige (Rebirth tokens: from rebirthing, spent on permanent upgrades); Event (Candy: limited time). The HUD shows Soft always, Premium when relevant, Event during events.
   Done right: "Coins buy upgrades. Gems buy boosts."
   Done wrong: Coins, Cash, Gold, Gems, Tokens, Shards and Stars all on the HUD.

4. **Premium currency is earnable slowly in play and never required for first-session progress.**
   Why: a free path keeps the game fair and lets players try premium items; a premium wall in the first session reads as pay-to-win and loses players who haven't decided to stay.
   How: daily rewards, quests, milestones and index completions pay small Gem amounts (rule of thumb: enough for one small boost per day of normal play). Premium currency sold for Robux is a Developer Product granted in `MarketplaceService.ProcessReceipt` ([[09 Shops and Monetization]]). Zone gates and core upgrades cost Soft only.
   Done right: a free player earns ~50 Gems a day; a 2x boost costs 40.
   Done wrong: zone 2 costs 100 Gems.

5. **Event currencies expire or convert at a stated rate when the event ends.**
   Why: leftover event currency inflates the next event or becomes clutter; silent deletion feels like theft.
   How: Config holds the event's `EndsAt` (server timestamp) and `ConvertRate` (e.g. 100 Candy → 1 Gem). On the first join after `EndsAt`, the server converts and shows "Your 2,300 Candy became 23 Gems". See [[12 Live Ops and Launch]].
   Done right: conversion announced in the event UI from day one.
   Done wrong: event currency silently wiped.

### Sources and sinks

6. **List every source and sink in `economy.md` with its expected share of income; every new source names the sink that absorbs it.**
   Why: when sources outgrow sinks, currency piles up, prices stop mattering and the economy inflates. Writing shares makes imbalances visible before launch.
   How: the ledger template in "Sources and sinks ledger". Sources: core action, selling, quests, achievements, daily rewards, offline earnings, codes, Developer Products. Sinks: upgrades, zone gates, rolls, consumables, crafting, cosmetics, rebirth. Reviewer rejects a new source without a named sink.
   Done right: "Daily reward +20% of a day's coins → absorbed by the new egg tier."
   Done wrong: adding a code that gives 1,000,000 coins "for fun".

7. **Log every source and sink with `AnalyticsService:LogEconomyEvent` from the server.**
   Why: you can't see inflation or a wall without the real flow. The economy events feed Roblox's analytics so Liveops can see sources and sinks by type [1].
   How: one wrapper (`Economy.add` / `Economy.spend`, code in "Luau") that changes the balance and logs `(player, flowType, currency, amount, endingBalance, transactionType, itemSku)` in the same step. Use `Enum.AnalyticsEconomyFlowType.Source` / `.Sink` and a transaction type such as Gameplay or Shop. Never log from the client.
   Done right: every coin that enters or leaves goes through the wrapper.
   Done wrong: half the sources logged, so the dashboard shows a fake deficit.

8. **Sinks scale with progression: later zones, rolls, upgrades and crafts cost proportionally more.**
   Why: if late-game income meets early-game prices, currency piles up and nothing feels worth saving for.
   How: price each zone's content as a multiple of the expected income in that zone (Rule 13). Rolls in zone N cost about 2-5 minutes of zone-N income (rule of thumb). Add repeatable sinks (consumable boosts, rerolls, cosmetics) so rich players always have something to spend on.
   Done right: zone 5's egg costs 4 minutes of zone-5 income, like zone 1's egg did in zone 1.
   Done wrong: one 500-coin egg for the whole game.

9. **Limited stock is a sink and a rhythm: scarce items with a restock timer.**
   Why: limited stock makes purchases feel like opportunities and creates return visits within a session. Grow a Garden guides describe seeds bought with in-game money or Robux, each with limited stock that refreshes every five minutes [8][9][10].
   How: shop items with `StockMin/StockMax` per window and a restock timer ([[03 Rarity and RNG]] for the rolled-stock code). Always keep a starter item in stock so new players can progress.
   Done right: "Golden seed: 2 left · restock 3:12".
   Done wrong: the only seed a new player can afford is sold out.

### Cost curves

10. **Use `cost(level) = base × growth^level` with growth bands: about 1.07-1.15 for many-level upgrades, 1.15-1.5 for 10-30-level upgrades, 2-10x jumps between tiers and zones.**
   Why: exponential costs against slower income create the natural slowdown that makes progress feel earned; the growth factor controls how fast it bites.
   How: Config per upgrade: `BaseCost`, `Growth`, `MaxLevel`, effect per level. Total cost from level 0 to n is `base × (growth^n - 1) / (growth - 1)`. Worked tables in "Cost curves: worked tables".
   Done right: a shovel with base 15 and growth 1.12 costs 46 at level 10 and 144 at level 20.
   Done wrong: linear costs (+10 per level), so later levels are trivial.

11. **Income grows slower than costs, and the growing gap between purchases is designed, not discovered.**
   Why: the slowdown is intended; its rate decides whether the player feels steady progress or hits a wall.
   How: time to afford = `cost / incomePerSecond`. Balance plots time-between-purchases from the sim (Rule 36) and checks it against the time-to-X targets (Rule 16). Add mid-tier upgrades or a new income source where the gap grows too fast.
   Done right: gaps grow from ~10 s to ~2 min over the first hour, smoothly.
   Done wrong: gaps of 5 s for 20 minutes, then 25 minutes.

12. **Milestones (new tool tier, new zone, rebirth) are 2-10x jumps and each brings a visible new multiplier.**
   Why: milestones punctuate the curve: a big cost that unlocks a big change. Without them the curve is a smooth grind.
   How: zone multipliers x2-x4 each; tool tiers x1.5-x3 power; the price of a milestone about 3-8 minutes of current income (Rule 13). Pet Simulator 99 guides describe spending coins at a gate to unlock the next area [15][16][30], and a Pet Simulator 99 event had players earn 10,000 coins to clear the first area [14].
   Done right: Desert gate at ~5 minutes of meadow income, x2 rewards inside.
   Done wrong: a gate that costs 10 seconds of income, so it's not a milestone at all.

13. **Price zone gates and milestones by time-to-afford at the expected income at that point, not by round numbers.**
   Why: a "nice" number like 2,500 can be a 20-minute goal or a 10-second one depending on income. Only time tells you what the player feels.
   How: `gateCost = expectedIncomePerSecond(targetTime) × secondsOfIncome`, where secondsOfIncome is 180-480 for zone gates (rule of thumb). Get expected income from the sim at the target time. Worked example in "Worked example: the sim catches a mispriced gate".
   Done right: "Desert target minute 8; sim income at minute 5 ≈ 155/s; gate ≈ 155 × 190 s ≈ 30,000; the sim reaches it at 8:03."
   Done wrong: Desert at 2,500 when the player earns 200/s by then.

14. **Show the next three prices of an upgrade track, rounded to 3 significant digits.**
   Why: the player plans with the next price and the one after; exact digits beyond three are noise.
   How: the upgrade panel shows "Lv 12 → 13: 61 · then 68 · 76". Prices are stored and charged exactly; only display rounds (formatting in "Luau"). The server always recomputes the exact price before charging.
   Done right: "1.25M" displayed, 1,253,412 charged.
   Done wrong: charging the rounded display value, or showing 1,253,412.37.

15. **Buy Max charges the exact sum of the single prices, and matches repeated single buys.**
   Why: a Buy Max that uses the continuous formula while singles use floored prices gives slightly different results, which players notice and exploit.
   How: compute the count with the geometric formula as an estimate, then verify by summing the exact per-level costs (cheap for ≤ a few hundred levels). Code in "Luau". Test: Buy Max from level L with C coins equals buying singles until you can't.
   Done right: Shovel (base 15, growth 1.12) from level 0 with 2,000 coins: the formula estimates 24 levels, but the floored single prices make 25 levels cost 1,989, so Buy Max gives 25, the same as buying singles.
   Done wrong: Buy Max stops at 24 because it trusted the formula, or charges the formula's total instead of the real sum.

### Pacing targets

16. **Write time-to-X targets in `economy.md` before tuning, and check every sim run against them.**
   Why: without targets, tuning is taste. Targets give Balance a pass/fail line.
   How: the table in "Time-to-X targets". Each row has a target window and the sim's result. A greedy sim bot is faster than a real player, so its times are a lower bound; real players take longer (rule of thumb: 1.5-3x).
   Done right: "Zone 2: target 6-10 min; sim 4.8 min (real est. 7-14) ✓".
   Done wrong: no targets, so a 40-minute zone 2 ships unnoticed.

17. **The first upgrade lands at 45-90 s, early upgrades every 30-90 s, and there is always a goal reachable within about 10 minutes.**
   Why: early fast rewards teach the loop; a reachable goal at every moment keeps the player in the session ([[02 The Core Loop]]). Instant rewards and progress tracking are standard early-engagement tools [29].
   How: price the first upgrade from the first goal's reward ([[01 The First Five Minutes]]); fill gaps over ~4 minutes in the first hour with small upgrades, quests or cosmetics.
   Done right: the sim's longest gap in the first hour is 3.5 minutes.
   Done wrong: a 12-minute gap at minute 20 with nothing affordable.

18. **Zones have level or power bands, shown before the player enters.**
   Why: bands tell the player where they belong and give "next" a meaning. Blox Fruits' map is organized by level ranges: starter islands at 0-10, the Jungle at 15-30 [19].
   How: each zone's gate shows the recommended power ("Power 500+") or level, and the zone's targets scale so a player in the band clears them in 1-3 hits (simulators) or a few seconds (combat).
   Done right: "Desert — recommended 200 power" on the gate, with the player at 180 and rising.
   Done wrong: a zone where every target takes 30 seconds for a player who just unlocked it.

19. **Quests and dailies pay toward the next goal, about 10-25% of its cost, never past it.**
   Why: quests should speed progress and point at the next goal, not replace the loop or skip a tier.
   How: quest reward = 0.1-0.25 × the price of the next milestone at the quest's stage (rule of thumb). Pet Simulator 99 guides note tutorial quests give starter currency and free pets [15]; Adopt Me's Task Board gives small Bucks rewards for daily tasks [25][26].
   Done right: "Break 50 desert crystals → 8,000 coins" when the next gate is 60,000.
   Done wrong: a daily reward worth three zones.

20. **Reward value varies a little around its mean, and the variation has a visible reason.**
   Why: identical rewards are dull; variation with a reason (weight, size, quality) makes each result a small event. Grow a Garden guides say heavier produce sells for more and that sprinklers improve size and weight [8][9].
   How: value = base × quality, quality from a small distribution (e.g. 0.8-1.3x) shown as a stat (weight, size, stars); boosts shift the distribution. Keep the mean in Config so the sim can use it.
   Done right: "Tomato 1.4 kg → 84 coins" vs "0.9 kg → 54 coins".
   Done wrong: random sale prices with no visible cause.

21. **Investments pay back in a stated time: 1-5 minutes early, longer later.**
   Why: droppers, crops and generators are bought for future income; their payback period decides whether buying them feels smart.
   How: payback = `price / incomePerSecondAdded`. Early investments 60-300 s; later 5-15 min. Grow a Garden guides contrast single-harvest crops that die after one harvest with multi-harvest crops that regrow and give income without replanting [9][11], two payback shapes for the same verb.
   Done right: a 500-coin dropper adding 2/s pays back in about 4 minutes.
   Done wrong: an investment that never pays back before the next tier makes it obsolete.

### Prestige (rebirth)

22. **Unlock rebirth only after the player has seen most early content: late in the first session or early in the second.**
   Why: rebirth before the player has felt the full early curve is confusing ("why would I lose everything?"); too late and players stall before it.
   How: rebirth requirement = reaching the last early zone or a coin amount the sim reaches at about 30-60 minutes for an active player (target). Show the rebirth button greyed out with its requirement from the moment zone 2 opens, so it's a known goal.
   Done right: "Rebirth unlocks at 250K coins (you: 92K)".
   Done wrong: a rebirth prompt at minute 4.

23. **Rebirth resets soft currency, upgrades and zones, and keeps pets, cosmetics, premium currency, game pass perks and the rebirth count.**
   Why: the reset is the biggest sink in the game, but taking away what players care about (collections, things they paid for) makes them fear it.
   How: Config lists `Rebirth.Resets` and `Rebirth.Keeps`; the confirm panel shows both lists with icons. Things bought with Robux are never reset.
   Done right: "You keep: 14 pets, Gems, VIP. You reset: Coins, upgrades, zones."
   Done wrong: rebirth wipes pets.

24. **The rebirth multiplier is additive per rebirth and previewed before confirming; the next run to the same point is at least 30-50% faster.**
   Why: additive bonuses (`1 + k × rebirths`) are easier to control than compounding ones; the preview is what makes players choose to reset.
   How: `mult = 1 + Config.Rebirth.MultiplierPerRebirth × rebirths`. Preview: "Rebirth: x2 → x3 coins forever". Check in the sim that the time to reach the previous run's rebirth point drops by 30-50% or more.
   Done right: run 2 reaches the Desert in 3 minutes instead of 8.
   Done wrong: +5% per rebirth, so the second run feels the same as the first.

25. **Balance rebirth cost growth against multiplier growth so each rebirth takes about 1.0-1.5x as long as the previous one early on.**
   Why: if cost grows much faster than the multiplier, each rebirth takes far longer than the last and players stop at rebirth 2 or 3; if it grows slower, rebirths become trivial.
   How: approximate time to the next rebirth as `cost(r) / mult(r)` (relative units, ignoring upgrades) and check the ratio between consecutive rebirths. Table in "Rebirth math". Tune `Growth` and `MultiplierPerRebirth` together; then confirm with the full sim.
   Done right: cost x2 per rebirth with +1 multiplier per rebirth: relative times 1.0, 1.0, 1.33, 2.0.
   Done wrong: cost x3 with +0.5 per rebirth: relative times 1.0, 2.0, 4.5, 10.8, 27.

26. **Prestige has its own currency or track with permanent upgrades, so rebirth is a choice with a reward to spend.**
   Why: a single multiplier is a number; a rebirth shop with choices (more luck, faster walk, bigger backpack) makes each rebirth a decision and a goal.
   How: each rebirth grants tokens (`tokens = 1 + floor(rebirths / 5)` or similar) spent in a rebirth shop of 5-10 permanent upgrades with their own cost curves. Pet Simulator 99 has a ranks track documented on its wiki [18], an example of a separate long-term track beside the main currency.
   Done right: "Rebirth tokens: 3 — Permanent +10% luck (2 tokens)".
   Done wrong: rebirth gives only "+1 rebirth" with nothing to choose.

### Multipliers and inflation

27. **Every multiplier source has a cap or diminishing returns.**
   Why: uncapped multipliers (rebirth × pets × boosts × passes × events) explode numbers and make prices meaningless.
   How: cap each category in Config (`MaxPetBonus`, `MaxLuck`, `MaxMultiplier`) or use diminishing returns such as `bonus = k × math.log(1 + x)` for things that grow without limit (e.g. index completion). The sim includes all multipliers at their caps to find the worst case.
   Done right: pet bonus capped at +400%; total multiplier capped at x50 in the first update.
   Done wrong: total multipliers reaching x10,000 a week after launch.

28. **Sources inside a category add; categories multiply; keep categories to three or four.**
   Why: adding within a category (pets, boosts) keeps each source's contribution readable; multiplying a few categories keeps the total understandable and controllable.
   How: `total = rebirthMult × (1 + petBonuses) × (1 + boostBonuses)`, each clamped. Show the breakdown in a stats panel ("x3 rebirth × x2.4 pets × x1.5 boost = x10.8"). Code in "Luau".
   Done right: a player can see where their x10.8 comes from.
   Done wrong: eight separate multiplicative sources, none shown.

29. **Temporary boosts expire by server timestamps, never client timers.**
   Why: client timers can be paused or edited; a boost tied to them can last forever.
   How: `data.BoostEndsAt = os.time() + duration`; the server checks `os.time() < data.BoostEndsAt` when computing rewards; the client shows a countdown from the server value. Stacking a boost extends `BoostEndsAt` (capped, e.g. 24 h) rather than multiplying.
   Done right: a 30-minute 2x boost ends exactly 30 minutes later.
   Done wrong: the client tells the server whether a boost is active.

30. **Keep balances below about 1e15, or plan big numbers before launch.**
   Why: Luau numbers are 64-bit floats. Integers are exact only up to 2^53 (9,007,199,254,740,992, about 9e15). Past that, small additions are silently lost (adding 1 to 1e17 changes nothing), and DataStore values and UI math start to misbehave.
   How: the sim prints the largest expected balance at the cap of every multiplier; if it heads past ~1e15, either scale rewards in multiplicative steps per zone so late zones still sit below the limit, store a mantissa and exponent (`{m = 1.25, e = 18}`), or use a reviewed big-number module. Format with suffixes (Rule 31).
   Done right: the economy is designed so the highest zone pays about 1e12 per minute.
   Done wrong: discovering at update 6 that rebirth math stopped adding.

31. **Format every number with the same suffix rules: K, M, B, T, then Qa, Qi, Sx..., 3 significant digits.**
   Why: consistent abbreviations let players compare prices at a glance; mixed formats ("1,500,000", "1.5M", "1500K") cause mistakes.
   How: one shared `NumberFormat.short` used by all UI (code in "Luau"): below 1,000 show the integer; above, 3 significant digits plus suffix (1.25K, 12.5M, 125B). Beyond the suffix table, use scientific notation. Kid Tester checks that suffixes are explained once (a tooltip on the currency).
   Done right: "Cost 1.25M" and "You have 980K" on the same panel.
   Done wrong: "Cost 1250000" next to "You have 0.98M".

### Offline, time and returning players

32. **Offline earnings are server-computed, capped (8-12 hours), less efficient than play (25-50%), and never shown on the first join.**
   Why: offline earnings make returning feel good, but if they rival play they teach players to log off; if uncapped they break the economy.
   How: on data load, `away = clamp(now - data.LastSeen, 0, MaxSeconds)`; pay `away × incomeRate × Efficiency` only if `away ≥ MinSeconds`; `LastSeen` written on leave and every autosave. Popup "While you were away: +X" only when meaningful (e.g. ≥ 2 minutes of active income). Code in "Luau".
   Done right: back after 6 hours: "+48K coins (30% rate)".
   Done wrong: offline earnings at 100% with no cap.

33. **Returning players get a catch-up, never a reset: offline earnings plus a short welcome-back boost.**
   Why: a player returning after a week to a much harder game (because content scaled) quits again; a little catch-up brings them back into the loop.
   How: if `away > 3 days`, grant a 30-minute 2x boost and point at the next affordable upgrade. Never reset progress for inactivity. See [[10 Retention and Social]].
   Done right: "Welcome back! 2x coins for 30 minutes."
   Done wrong: "Your plot was cleared while you were away."

### Money, matches and meta

34. **Robux sells time and convenience, not first-session power, and paid multipliers sit inside the capped categories.**
   Why: pay-to-win drives away free players, who make up most of every server and are the audience paying players want to show off to. Adopt Me guides describe a Robux option that hatches eggs immediately instead of waiting through objectives [25][31]: speed, not a different outcome.
   How: starter offers are studied as part of the first experience [28], so keep them out of the first minutes ([[01 The First Five Minutes]]). Game passes like 2x coins add to the boost category (capped, Rule 27); Developer Products sell boosts, skips and premium currency; no Robux-only zone gates; check pass ownership on the server with `MarketplaceService:UserOwnsGamePassAsync` and cache it. Pricing ladders live in [[09 Shops and Monetization]].
   Done right: a 2x coins pass that adds +1 to the boost category, with the total still capped.
   Done wrong: a pass that multiplies everything by 10 and skips zones.

35. **Match economies separate in-match currency (resets each match) from persistent currency (paid at the end).**
   Why: an in-match currency lets you balance each match's pacing independently; a persistent currency lets matches feed long-term progression. Guides describe Tower Defense Simulator's cash as earned when units clear waves and at the end of a mission [23][24].
   How: in-match cash starts at a fixed amount, grows per wave, buys and upgrades towers, and is discarded at match end; the end screen pays persistent coins (base + per wave survived + win bonus) and shows what they buy. Balance tunes the two separately.
   Done right: "Wave 12 reached: +180 coins (next tower: 600)".
   Done wrong: one currency that carries over, so veterans start matches rich.

36. **Run-based games pay a meta currency per run that buys run advantages in the lobby.**
   Why: runs end, often in failure; a meta currency turns every run into progress. The DOORS lobby has a shop selling knobs and revives [27].
   How: knobs/tokens per run (base + per room/floor + achievements); lobby shop sells consumables (revives, boosts) and cosmetics. Keep consumables helpful but not required to finish a run.
   Done right: a failed run still pays enough for one revive after a couple of attempts.
   Done wrong: failed runs pay nothing.

37. **Trading economies need sinks and floors: trade taxes, item sinks, and paid-item trading only where policy allows.**
   Why: trading creates a player-driven economy that can inflate or be exploited (duping, scams), and paid items have policy rules.
   How: a small trade tax or fee in soft currency as a sink; item sinks (fusing, crafting consume items); server-side trade validation with both inventories locked during the trade; check `PolicyService` policy info (`IsPaidItemTradingAllowed`) before allowing trades of items bought with Robux ([[03 Rarity and RNG]]). Log trades as economy events.
   Done right: trades lock both inventories, verify on the server, charge a 5% coin fee.
   Done wrong: client-side trade windows that send "I gave you X" messages.

### Measuring and tuning

38. **Simulate before every playtest that follows an economy change, and save the output.**
   Why: walls and inflation are obvious in a sim and slow to find in playtests.
   How: run the sim in "Luau" (greedy bot with zones, max gap and time-to-X report); save output in `games/<slug>/sim/<date>.txt`. Compare with the targets table; the greedy bot is a lower bound on real time (Rule 16).
   Done right: "sim/2026-10-23.txt: first buy 15 s, longest gap 3m10s, Desert 7m40s ✓".
   Done wrong: "tuned by feel".

39. **Read the live economy weekly: source/sink ratio, balance distribution, and where sessions end.**
   Why: real players find strategies and walls the sim doesn't. The analytics dashboard benchmarks KPIs against similar experiences [4], and economy events show the flow by type [1].
   How: Liveops checks the economy dashboards (sources vs sinks per currency, top sinks), the distribution of balances (are players hoarding?), and progression funnels (how many reach zone 2, 3, first rebirth) [2]. A rising source/sink ratio means inflation; a cluster of sessions ending at one point means a wall.
   Done right: "Sinks fell to 60% of sources after the code; add a coin sink in the next update."
   Done wrong: noticing inflation from Discord complaints two months later.

40. **Change one economy number at a time, log every change, and test risky changes as experiments.**
   Why: several simultaneous changes hide which one mattered; unlogged changes can't be rolled back.
   How: each change is a Config diff with a line in `games/<slug>/changelog.md` and a reason; where Roblox's Configs and Experiments are available, test risky price changes on a share of players and compare progression and retention [7].
   Done right: "Desert gate 60K → 45K (wall at minute 14). Result: zone 2 reach +X%."
   Done wrong: retuning ten prices in one update and guessing.

## Step by step

### Building the economy for a new game in 12 steps

1. **Architect lists currencies** (Rule 3) with one job each and which show on the HUD.
2. **Architect sketches the structure**: zones/tiers, upgrade tracks, prestige, rolls, offline, match/meta split if round-based.
3. **Balance writes the time-to-X targets** (Rule 16) in `economy.md`.
4. **Balance writes Config v1**: base costs, growth factors (Rule 10), effects per level, zone multipliers, rebirth numbers.
5. **Balance prices gates by time-to-afford** at expected income (Rule 13), using a first sim run to read expected income at each target time.
6. **Balance fills the sources and sinks ledger** with expected shares (Rule 6).
7. **Builder implements** server-side balances (Rule 2), the economy wrapper with logging (Rule 7), purchases with recomputed prices, Buy Max (Rule 15), multipliers with caps (Rules 27-28), boosts on server time (Rule 29), offline earnings (Rule 32).
8. **Frame implements** the next-three-prices display (Rule 14), number formatting (Rule 31), the multiplier breakdown, the rebirth preview (Rule 24).
9. **Balance runs the full sim** with zones and rebirth; iterate Config until all targets pass; save outputs (Rule 38).
10. **Merchant checks** that every Robux item fits Rule 34 and the ladder in [[09 Shops and Monetization]].
11. **Playtest runs a 30-minute fresh-player session**, logging purchase times; compare with the sim (real ≈ 1.5-3x the bot).
12. **Reviewer checks** no literals, server-side prices, logging coverage, caps, the 1e15 plan.

### Fixing a wall in 6 steps

1. Find where sessions end (progression funnel [2], session-end analysis) and the time it happens.
2. Read the sim at that point: what's the next goal and how many minutes of income does it cost?
3. If over ~10 minutes with nothing in between, add an intermediate goal (an upgrade, a quest, a cosmetic) or lower the gate.
4. Check the sources: did a source dry up there (a zone with weak targets)?
5. Change one number (Rule 40), re-run the sim, save.
6. Ship and re-read the funnel after enough players pass the point.

## Currency spec

| Currency | Job | Earned by | Spent on | HUD | Saved | Notes |
|---|---|---|---|---|---|---|
| Coins (soft) | Everyday progress | Core action, selling, quests, offline | Upgrades, gates, rolls, consumables | Always, top-left | Yes | Reset by rebirth |
| Gems (premium) | Shortcuts and extras | Dailies, milestones, index, Developer Products | Boosts, premium rolls, skips, cosmetics | When owned | Yes | Never reset; never required early |
| Rebirth tokens (prestige) | Permanent upgrades | Rebirthing | Rebirth shop | In rebirth panel | Yes | Never reset |
| Event currency | Event participation | Event activities | Event shop | During event | Yes | Converts at `ConvertRate` after `EndsAt` |
| In-match cash (round games) | Pacing inside a match | Waves, kills, objectives | Towers, upgrades in match | In match | No | Discarded at match end |

## Sources and sinks ledger

Template for `economy.md` (example shares for a simulator at the 30-minute mark; Balance replaces them with sim and live numbers):

| Source | Share of coin income | Sink that absorbs it | Share of coin spend |
|---|---|---|---|
| Core action + selling | 70% | Tool and backpack upgrades | 45% |
| Quests | 10% | Zone gates | 25% |
| Offline earnings | 8% | Eggs/rolls | 20% |
| Daily rewards | 7% | Consumable boosts | 5% |
| Codes and events | 5% | Rebirth (resets the rest) | 5% + reset |

Healthy sign: over a week, total sinks (including rebirth resets) track total sources; balances don't pile up at any stage. Red flag: a source with no named sink, or median balances rising week over week without new content.

## Cost curves: worked tables

**Shovel: base 15, growth 1.12** (many levels):

| Level | Price of next level | Total spent to reach this level |
|---|---|---|
| 0 | 15 | 0 |
| 1 | 16 | 15 |
| 2 | 18 | 32 |
| 5 | 26 | 95 |
| 10 | 46 | 263 |
| 20 | 144 | 1,081 |
| 30 | 449 | 3,620 |
| 50 | 4,335 | 36,000 |
| 75 | 73,695 | ~614K |
| 100 | ~1.25M | ~10.4M |

**Backpack: base 100, growth 1.15** (fewer, chunkier levels):

| Level | Price of next level | Total spent to reach this level |
|---|---|---|
| 0 | 100 | 0 |
| 1 | 114 | 100 |
| 5 | 201 | 674 |
| 10 | 404 | 2,030 |
| 20 | 1,636 | 10,244 |
| 30 | 6,621 | 43,475 |
| 40 | 26,786 | ~178K |
| 50 | 108,365 | ~722K |

(Prices are floored per level, so totals are the sum of floored prices or the geometric formula rounded; the two differ slightly, which is why Buy Max sums exact prices, Rule 15.)

**Reading the growth factor:** price doubles every `ln 2 / ln g` levels: about 10 levels at 1.07, 6 at 1.12, 5 at 1.15, 2.4 at 1.33, 1.7 at 1.5.

## Worked example: the sim catches a mispriced gate

Running the greedy sim on the starting Config (base income 1/s; Shovel +1/s per level, base 15, growth 1.12, max 100; Backpack +6/s per level, base 100, growth 1.15, max 50) gives, in this studio's test run:

| Time | Income | Upgrades bought | Note |
|---|---|---|---|
| 15 s | 2/s | 1 | First buy (Shovel 1) |
| 60 s | 11/s | 10 | Shovel 10 |
| 5 min | 155/s | 59 | Shovel 40, Backpack 19 |
| 10 min | 221/s | 80 | Gaps now ~30-60 s |
| 20 min | 278/s | 97 | Gaps ~1-2 min |
| 60 min | 351/s | 120 | ~46K coins unspent: maxed-out cheap levels, nothing left worth buying |

Two problems show up at once. First, the Desert gate at 2,500 costs about 11 seconds of income at minute 10, so it isn't a milestone (Rule 13): at ~150-200/s, 3-5 minutes of income is roughly 30,000-60,000, which is where a zone gate belongs. Second, coins pile up after minute 30 because the upgrade tracks flatten and there's no sink (Rules 8, 11): add the next zone's upgrades and an egg priced at a few minutes of that zone's income. The first upgrade at 15 s is earlier than the 45-90 s target (Rule 17) because this model has passive base income; in an active-action game the first buy comes from the first goal's reward instead.

**After retuning (Config v2 in "Luau"):** Desert 30,000 (x2), Snow 200,000 (x4), rebirth at 400,000 with cost x2 and +1 multiplier per rebirth, and a sim bot that starts saving when a gate is within 5 minutes of income. This studio's run gave: first buy 15 s, Desert at 8:03, Snow at 24:52, rebirth ready at 31:30. The longest gap (5:34) is the saving run before Snow, over the 4-minute target, so the next change is a Desert-tier upgrade track to fill it. The second run, at x2, reached the Desert at 5:34, Snow at 11:18 (55% faster) and its 800,000 rebirth at 20:17, so rebirth passes Rule 24.

## Time-to-X targets

| Milestone | Starting target (active player) | How to check |
|---|---|---|
| First upgrade | 45-90 s ([[01 The First Five Minutes]]) | Sim + playtest timestamp |
| Early upgrades | One every 30-90 s in the first 10 min | Sim gap report |
| First new zone | 5-10 min | Sim, playtest, funnel step |
| Mid-game upgrades | One every 2-5 min | Sim gap report, purchase-gap custom event |
| Longest gap in the first hour | ≤ 4 min | Sim gap report |
| First rebirth | 30-60 min (late session 1 or early session 2) | Sim, funnel step |
| Second run to the first-run rebirth point | 30-50%+ faster than the first | Sim |
| At any moment | A goal reachable within ~10 min | Playtest three-question test |
| Daily premium income (free player) | Enough for ~1 small boost | Ledger |

## Rebirth math

Relative time to each rebirth ≈ `cost(r) / mult(r)`, normalized to the first rebirth (ignores upgrades and pets, so use it to compare settings, then confirm with the full sim):

| Settings | r=0 | r=1 | r=2 | r=3 | r=4 | r=5 | Verdict |
|---|---|---|---|---|---|---|---|
| Cost x3, +0.5 per rebirth | 1.0 | 2.0 | 4.5 | 10.8 | 27 | 69 | Wall by rebirth 3 |
| Cost x2.5, +1 per rebirth | 1.0 | 1.25 | 2.1 | 3.9 | 7.8 | 16 | Steep after 3 |
| Cost x2, +1 per rebirth | 1.0 | 1.0 | 1.33 | 2.0 | 3.2 | 5.3 | Good early, then needs rebirth-shop help |
| Cost x1.5, +0.5 per rebirth | 1.0 | 1.0 | 1.12 | 1.35 | 1.69 | 2.2 | Gentle; good for frequent rebirths |

Rule of thumb: aim for 1.0-1.5x per step for the first 3-5 rebirths, then let rebirth-shop upgrades and new zones carry the curve.

## Economy health metrics

| Metric | Source | Healthy | Red flag |
|---|---|---|---|
| Sources vs sinks per currency | Economy events [1] | Sinks ≈ sources over a week | Sources ≫ sinks (inflation) |
| Median balance by stage | Custom event or sampled data | Low relative to next goal's price | Hoarding: balance ≫ every price |
| Reach rate of zone 2, 3, first rebirth | Funnel steps [2] | Smooth decline | A cliff at one step |
| Purchase gaps | Custom event ([[02 The Core Loop]]) | Within targets | Gaps > 10 min |
| D1 / D7 / session time | Analytics dashboard [3][4] | Near or above benchmark bands | Session time drops after an economy change |
| Largest balance | Server sampling | < 1e15 | Approaching 2^53 |

## Examples from top games

### Two ways to pay for the same thing
**Game:** Grow a Garden ([8][9][10])
**Shows:** guides describe buying seeds at the Seed Shop with either in-game currency or Robux, from limited stock that refreshes every five minutes.
**Why it works:** the soft-currency path is the main one; Robux is a shortcut on the same item, and limited stock gives purchases a rhythm.
**Steal:** every progression item has a soft price; Robux paths sell speed (Rule 34).
**Avoid:** Robux-only items that are required to keep up.

### Value with a visible reason
**Game:** Grow a Garden ([8][9])
**Shows:** guides say heavier produce sells for more, that sprinklers and watering improve size and weight, and that Gold and Rainbow variants are worth more than base crops.
**Why it works:** sale value varies, but the player can see why and can influence it.
**Steal:** a visible quality stat (weight, size, stars) driving value around a Config mean (Rule 20).
**Avoid:** invisible random multipliers on sale price.

### Investment shapes with different paybacks
**Game:** Grow a Garden ([9][11])
**Shows:** single-harvest crops (like Carrot) die after one harvest; multi-harvest crops (Strawberry, Blueberry, Tomato) regrow and provide income without replanting.
**Why it works:** cheap one-shot investments early, repeating ones as the player can afford them: a natural progression in investment type.
**Steal:** an early cheap, fast-payback option and a pricier, long-payback repeating option (Rule 21).
**Avoid:** a repeating option so good that the cheap one is never worth buying.

### Reinvest everything early
**Game:** Grow a Garden ([10][11][12][13])
**Shows:** beginner guides recommend starting with a couple of cheap seeds and reinvesting sales into more seeds, moving to multi-harvest crops when possible.
**Why it works:** the early economy rewards reinvestment, so the first minutes feel like compounding growth.
**Steal:** make the obvious early strategy (reinvest) also the right one.
**Avoid:** early traps where an attractive purchase sets the player back.

### A coin target that clears an area
**Game:** Pet Simulator 99, Good vs Evil event ([14])
**Shows:** the event guide describes breaking breakables to earn 10,000 coins, which cleared the first area, with eggs on either side of the arena.
**Why it works:** a single clear coin target turns the area into a goal with a visible finish line.
**Steal:** gates with one clear price and a progress bar on the gate.
**Avoid:** gates whose price doesn't match the time the area is meant to last (Rule 13).

### Gates you buy with coins
**Game:** Pet Simulator 99 ([15][16][30])
**Shows:** beginner guides describe spending coins at the gate to unlock the next area and moving on once the current area's breakables die in under 2 seconds.
**Why it works:** the player feels ready (fast breaks) at about the time they can afford the gate.
**Steal:** tune gate prices so affordability and "this zone is easy now" arrive together.
**Avoid:** gates affordable long before the next zone is beatable, or the reverse.

### Starter currency from tutorial quests
**Game:** Pet Simulator 99 ([15])
**Shows:** a beginner guide notes tutorial quests hand out free pets and starter currency.
**Why it works:** the first purchases are funded by learning, so new players hit the loop fast.
**Steal:** tutorial rewards that exactly fund the first one or two upgrades ([[01 The First Five Minutes]]).
**Avoid:** tutorial payouts big enough to skip a tier.

### A rank track beside the currency
**Game:** Pet Simulator 99 ([18][17])
**Shows:** the game has a ranks system documented on its wiki, and beginner progression guides cover the route through areas and rebirths.
**Why it works:** a non-currency progression track gives goals that don't inflate the economy.
**Steal:** a rank/level track with rewards, fed by normal play (Rule 26).
**Avoid:** rank rewards that dump large amounts of soft currency.

### Level bands as the map
**Game:** Blox Fruits ([19][20])
**Shows:** the starter islands are for levels 0-10 and the Jungle for 15-30; quest givers on each island offer quests suited to that band.
**Why it works:** the player always knows which area matches their level, and the map itself is the progression curve.
**Steal:** show a level/power band on every zone gate (Rule 18).
**Avoid:** bands with gaps where no area fits the player's level.

### Small faction economics
**Game:** Blox Fruits ([20][21][22])
**Shows:** guides describe Marines getting cheaper ships and bounty rewards, with Pirate crews opening only at a high level according to one guide.
**Why it works:** factions tweak costs and rewards slightly, adding flavor without splitting the economy.
**Steal:** small faction modifiers to prices or rewards (±10-20%).
**Avoid:** faction differences large enough that one side is clearly the economic choice.

### In-match cash and end-of-mission pay
**Game:** Tower Defense Simulator ([23][24])
**Shows:** guides describe cash earned when units clear waves and at the end of a mission.
**Why it works:** match pacing and long-term progression are tuned separately (Rule 35).
**Steal:** an in-match currency that resets plus a persistent payout on the end screen.
**Avoid:** a single carried-over currency that lets veterans start every match rich.

### Daily tasks that pay a little
**Game:** Adopt Me! ([25][26])
**Shows:** guides describe a Task Board refreshing every 24 hours, giving small Bucks rewards and a chance at a special egg for completing all its tasks.
**Why it works:** daily income for returning players without overwhelming the economy.
**Steal:** dailies paying 10-25% of the next goal (Rule 19), with a collectible as the top reward.
**Avoid:** daily rewards worth more than a session of play.

### Selling time, not outcomes
**Game:** Adopt Me! ([25][31])
**Shows:** a guide notes eggs hatch after completing objectives and that paying Robux hatches them immediately.
**Why it works:** the Robux option saves time; the result is the same as for free players.
**Steal:** Robux skips for waits, not stronger results (Rule 34).
**Avoid:** skips that bypass the game's main loop entirely.

### A lobby shop between runs
**Game:** DOORS ([27])
**Shows:** the lobby, where every run starts from its elevators, has a shop where players can buy knobs and revives.
**Why it works:** run-based games need something that carries between runs, and the place you start the next run is the natural place to spend it.
**Steal:** pay a meta currency per run and put its shop beside the start of the next run (Rule 36).
**Avoid:** consumables so strong they become mandatory.

## By genre

### Simulator
- **Shape:** exponential upgrade tracks (growth 1.07-1.15), zone gates at 3-8 minutes of income, eggs at 2-5 minutes of income, rebirth at 30-60 min.
- **Watch:** passive income overtaking active; uncapped pet multipliers; numbers past 1e15. See [[Genre - Simulator]].

### Tycoon
- **Shape:** buttons priced so the next one is always 10-60 s away early; payback per dropper 1-5 min; floors as milestones (5-10x); rebirth with a multiplier and a fresh plot.
- **Watch:** the last buttons of a floor taking 10+ minutes with nothing else to buy. See [[Genre - Tycoon]].

### Obby
- **Shape:** stage progress is the progression; coins per stage/world buy cosmetics, trails and skips. Skips priced in Robux are fine only as convenience, never to make the core path pay-only.
- **Watch:** skip products that remove the reason to play. See [[Genre - Obby]].

### Roleplay and life sim
- **Shape:** a salary/job income, house and vehicle purchases as long goals, cosmetics as sinks; daily tasks for returning players.
- **Watch:** money with nothing worth buying after the first house; add aspirational items at several price levels. See [[Genre - Roleplay and Life Sim]].

### Action and combat
- **Shape:** XP curve per level (e.g. `xp(level) = base × level^1.5-2` polynomial rather than exponential, so levels stay reachable), gear tiers by zone band, gold sinks in upgrades/repairs/rerolls.
- **Watch:** level gaps between zone bands (Rule 18). See [[Genre - Action and Combat]].

### Battlegrounds
- **Shape:** currency per knockout/match; unlock characters and movesets at fixed prices; cosmetics as sinks.
- **Watch:** paid movesets that are stronger than free ones. See [[Genre - Battlegrounds]].

### Survival
- **Shape:** resources as currencies; crafting recipes as sinks; durability/repairs as recurring sinks; bases as long-term investments.
- **Watch:** resource hoarding with nothing to build; add tiers that consume lower tiers. See [[Genre - Survival]].

### Horror
- **Shape:** meta currency per run (base + per room + achievements), lobby shop of revives/boosts/cosmetics (Rule 36).
- **Watch:** consumables that trivialize runs; price them so they're occasional. See [[Genre - Horror]].

### Tower defense
- **Shape:** in-match cash per wave, persistent coins/gems at match end, unit summons as the main sink, unit upgrades/traits as secondary sinks (Rule 35).
- **Watch:** summon currency so scarce that free players can't build a team. See [[Genre - Tower Defense]].

### RNG and collection
- **Shape:** roll currency or roll cooldown as the main constraint; luck as the main upgrade; crafting from duplicates as a sink ([[03 Rarity and RNG]]).
- **Watch:** luck stacking without caps (Rule 27). See [[Genre - RNG and Collection]].

### Shooter
- **Shape:** XP per match for a level track, currency for weapons/skins; weapons unlocked at fixed prices with clear stats.
- **Watch:** paid stat advantages. See [[Genre - Shooter]].

### Racing and vehicles
- **Shape:** race payouts by placement; cars at 3-8 races' worth of income each early; upgrades per car with their own curves.
- **Watch:** a top car that makes every other car obsolete. See [[Genre - Racing and Vehicles]].

### Sports
- **Shape:** match rewards, rank track, cosmetics as sinks; abilities or stats unlocked at fixed prices.
- **Watch:** pay-to-win stats in competitive modes. See [[Genre - Sports]].

### Party and social hangout
- **Shape:** points per round for everyone (participation) plus winner bonuses; cosmetics and emotes as sinks.
- **Watch:** points that pile up with nothing to buy; rotate cosmetics. See [[Genre - Party and Social Hangout]].

### Story and puzzle
- **Shape:** progression is chapters; collectibles and cosmetics as optional economy; hints as a small sink.
- **Watch:** paywalled chapters in the first session. See [[Genre - Story and Puzzle]].

### Farming and fishing
- **Shape:** seeds/bait as sinks with limited stock (Rule 9), produce value by weight/quality (Rule 20), multi-harvest investments (Rule 21), tools that improve quality.
- **Watch:** restocks that leave new players unable to buy anything; always stock a starter seed. See [[Genre - Farming and Fishing]].

## Luau

Modern Luau: the `task` library, `--!strict` in shared modules, `Instance.new` with `Parent` set last, and every balance change on the server. `PlayerData` stands for the game's server-side data module ([[13 Building It Right]]).

### Config with exact cost helpers

```lua
--!strict
-- ReplicatedStorage/Shared/Config.lua: every tunable economy number lives here (v2 after the sim)
local Config = {
	StartingCoins = 0,
	BaseIncomePerSecond = 1,
	Upgrades = {
		Shovel   = { BaseCost = 15,  Growth = 1.12, IncomePerLevel = 1, MaxLevel = 100 },
		Backpack = { BaseCost = 100, Growth = 1.15, IncomePerLevel = 6, MaxLevel = 50 },
	},
	Zones = { -- priced by time-to-afford at expected income (Rule 13)
		{ Name = "Meadow", Cost = 0,       Multiplier = 1 },
		{ Name = "Desert", Cost = 30_000,  Multiplier = 2 },
		{ Name = "Snow",   Cost = 200_000, Multiplier = 4 },
	},
	Rebirth = {
		BaseCost = 400_000, Growth = 2, MultiplierPerRebirth = 1,
		Keeps = { "Pets", "Gems", "Cosmetics", "Passes", "Rebirths", "RebirthTokens" },
	},
	Caps = { PetBonus = 4, BoostBonus = 3, TotalMultiplier = 50 },
	Boosts = { MaxStackSeconds = 24 * 3600 },
	Offline = { MinSeconds = 300, MaxSeconds = 8 * 3600, Efficiency = 0.3 },
	Sim = { Seconds = 3600, SaveWhenWithinSeconds = 300 },
}

function Config.UpgradeCost(id: string, level: number): number
	local u = Config.Upgrades[id]
	return math.floor(u.BaseCost * u.Growth ^ level)
end

-- Exact cost of buying `count` levels starting at `level` (sum of floored single prices).
function Config.CostForLevels(id: string, level: number, count: number): number
	local total = 0
	for l = level, level + count - 1 do
		total += Config.UpgradeCost(id, l)
	end
	return total
end

-- How many levels `coins` can buy from `level`: geometric estimate, then corrected with exact sums.
function Config.MaxAffordable(id: string, level: number, coins: number): (number, number)
	local u = Config.Upgrades[id]
	local room = u.MaxLevel - level
	if room <= 0 then return 0, 0 end
	local first = u.BaseCost * u.Growth ^ level
	local estimate = math.floor(math.log(coins * (u.Growth - 1) / first + 1) / math.log(u.Growth))
	local count = math.clamp(estimate, 0, room)
	while count > 0 and Config.CostForLevels(id, level, count) > coins do count -= 1 end
	while count < room and Config.CostForLevels(id, level, count + 1) <= coins do count += 1 end
	return count, Config.CostForLevels(id, level, count)
end

function Config.RebirthCost(rebirths: number): number
	return math.floor(Config.Rebirth.BaseCost * Config.Rebirth.Growth ^ rebirths)
end

return table.freeze(Config)
```

### Server: the economy wrapper (change + log in one step)

```lua
--!strict
-- ServerScriptService/Economy.lua (ModuleScript)
local AnalyticsService = game:GetService("AnalyticsService")
local RunService = game:GetService("RunService")

local Economy = {}

local function mirror(player: Player, currency: string, balance: number)
	player:SetAttribute(currency, balance) -- display only; the HUD reads this
end

function Economy.add(player: Player, data: {[string]: any}, currency: string, amount: number,
	transactionType: Enum.AnalyticsEconomyTransactionType, sku: string?)
	if amount <= 0 or amount ~= amount then return end -- rejects zero, negatives and NaN
	data[currency] = (data[currency] or 0) + amount
	mirror(player, currency, data[currency])
	if not RunService:IsStudio() then
		AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, currency, amount,
			data[currency], transactionType.Name, sku)
	end
end

function Economy.spend(player: Player, data: {[string]: any}, currency: string, amount: number,
	transactionType: Enum.AnalyticsEconomyTransactionType, sku: string?): boolean
	if amount <= 0 or amount ~= amount then return false end
	local balance = data[currency] or 0
	if balance < amount then return false end
	data[currency] = balance - amount
	mirror(player, currency, data[currency])
	if not RunService:IsStudio() then
		AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, currency, amount,
			data[currency], transactionType.Name, sku)
	end
	return true
end

return Economy
```

### Server: buy one level or Buy Max (price always recomputed)

```lua
-- ServerScriptService/Shop/Upgrades.server.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Config = require(ReplicatedStorage.Shared.Config)
local Economy = require(ServerScriptService.Economy)
local PlayerData = require(ServerScriptService.PlayerData)

ReplicatedStorage.Remotes.BuyUpgrade.OnServerInvoke = function(player: Player, id: unknown, max: unknown)
	if typeof(id) ~= "string" or not Config.Upgrades[id] then return false end
	local data = PlayerData.get(player)
	if not data then return false end
	local level = data.Upgrades[id] or 0
	local count, price
	if max == true then
		count, price = Config.MaxAffordable(id, level, data.Coins)
	else
		count = if level < Config.Upgrades[id].MaxLevel then 1 else 0
		price = Config.UpgradeCost(id, level)
	end
	if count <= 0 then return false end
	if not Economy.spend(player, data, "Coins", price, Enum.AnalyticsEconomyTransactionType.Shop, id) then
		return false
	end
	data.Upgrades[id] = level + count
	PlayerData.recompute(player) -- income, power, capacity from levels
	return true, data.Upgrades[id]
end
```

### Server: multipliers in capped categories

```lua
--!strict
-- ServerScriptService/Multipliers.lua (ModuleScript)
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local Multipliers = {}
local DOUBLE_COINS_PASS = 0 -- the owner creates the pass and fills in its id
local ownsDouble: {[Player]: boolean} = {}

function Multipliers.loadPasses(player: Player)
	local ok, owns = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, DOUBLE_COINS_PASS)
	ownsDouble[player] = ok and owns == true
end

function Multipliers.forget(player: Player) ownsDouble[player] = nil end

-- Sources inside a category add; categories multiply; each is capped (Rules 27-28).
function Multipliers.total(player: Player, data: any): (number, {[string]: number})
	local rebirth = 1 + Config.Rebirth.MultiplierPerRebirth * (data.Rebirths or 0)
	local petBonus = 0
	for _, pet in data.EquippedPets or {} do petBonus += pet.Bonus or 0 end
	local pets = 1 + math.min(petBonus, Config.Caps.PetBonus)
	local boostBonus = if os.time() < (data.BoostEndsAt or 0) then (data.BoostAmount or 0) else 0
	if ownsDouble[player] then boostBonus += 1 end
	local boosts = 1 + math.min(boostBonus, Config.Caps.BoostBonus)
	local zone = Config.Zones[data.Zone or 1].Multiplier
	local total = math.min(rebirth * pets * boosts * zone, Config.Caps.TotalMultiplier)
	return total, { Rebirth = rebirth, Pets = pets, Boosts = boosts, Zone = zone } -- breakdown for the stats panel
end

return Multipliers
```

Grant purchased passes mid-session too: listen to `MarketplaceService.PromptGamePassPurchaseFinished` on the server and set `ownsDouble[player] = true` when `wasPurchased` is true for that pass id.

### Server: boosts on server time

```lua
-- Extend, never multiply, and cap the stack (Rule 29).
local function addBoost(data, amount: number, seconds: number)
	local now = os.time()
	local start = math.max(now, data.BoostEndsAt or 0)
	data.BoostAmount = math.max(data.BoostAmount or 0, amount)
	data.BoostEndsAt = math.min(start + seconds, now + Config.Boosts.MaxStackSeconds)
end
```

### Server: offline earnings

```lua
-- Server, right after data loads. data.LastSeen is written on leave and at every autosave.
local function grantOffline(player: Player, data): number
	local now = os.time()
	local away = math.clamp(now - (data.LastSeen or now), 0, Config.Offline.MaxSeconds)
	data.LastSeen = now
	if data.Tutorial and data.Tutorial.Step == 0 then return 0 end -- never on the first join
	if away < Config.Offline.MinSeconds then return 0 end
	local earned = math.floor(away * data.IncomePerSecond * Config.Offline.Efficiency) -- server-computed rate
	if earned > 0 then
		Economy.add(player, data, "Coins", earned, Enum.AnalyticsEconomyTransactionType.TimedReward, "Offline")
	end
	return earned -- show "While you were away: +X" when it's worth at least ~2 minutes of play
end
```

### Server: rebirth with preview

```lua
local function rebirthPreview(data): (number, number, number)
	local cost = Config.RebirthCost(data.Rebirths)
	local now = 1 + Config.Rebirth.MultiplierPerRebirth * data.Rebirths
	return cost, now, now + Config.Rebirth.MultiplierPerRebirth
end

ReplicatedStorage.Remotes.Rebirth.OnServerInvoke = function(player: Player)
	local data = PlayerData.get(player)
	if not data or data.Zone < #Config.Zones then return false end
	local cost = rebirthPreview(data)
	if data.Coins < cost then return false end
	Economy.spend(player, data, "Coins", data.Coins, Enum.AnalyticsEconomyTransactionType.Gameplay, "Rebirth")
	data.Upgrades = {}
	data.Zone = 1
	data.Rebirths += 1
	data.RebirthTokens = (data.RebirthTokens or 0) + 1 + data.Rebirths // 5
	PlayerData.recompute(player) -- pets, gems, cosmetics and passes are untouched (Config.Rebirth.Keeps)
	return true, data.Rebirths
end
```

The client shows `rebirthPreview` values (sent by a RemoteFunction or mirrored as attributes): "Rebirth for 400K: x1 → x2 coins forever. You keep pets, Gems, passes."

### Shared: number formatting

```lua
--!strict
-- ReplicatedStorage/Shared/NumberFormat.lua
local NumberFormat = {}
local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc" }

function NumberFormat.short(n: number): string
	if n ~= n then return "0" end -- NaN guard
	local sign = if n < 0 then "-" else ""
	n = math.abs(n)
	if n < 1000 then return sign .. tostring(math.floor(n)) end
	local idx = math.floor(math.log10(n) / 3)
	local value = n / 10 ^ (idx * 3)
	local decimals = if value < 10 then 2 elseif value < 100 then 1 else 0
	local text = string.format("%." .. decimals .. "f", value)
	if (tonumber(text) or 0) >= 1000 then -- rounding pushed it to the next suffix (999.9K -> 1.00M)
		idx += 1
		text = string.format("%.2f", value / 1000)
	end
	local suffix = SUFFIXES[idx + 1]
	if not suffix then return sign .. string.format("%.2e", n) end
	if string.find(text, ".", 1, true) then
		text = string.gsub(text, "0+$", "")
		text = string.gsub(text, "%.$", "")
	end
	return sign .. text .. suffix
end

-- short(950) -> "950", short(1250) -> "1.25K", short(12_500_000) -> "12.5M", short(999_999) -> "1M"
return NumberFormat
```

### Simulation: greedy bot with zones, gaps and time-to-X

```lua
-- Command bar or a test Script: one simulated hour. Save the printout in games/<slug>/sim/.
local Config = require(game:GetService("ReplicatedStorage").Shared.Config)
local coins, levels, zone = Config.StartingCoins, {}, 1
for id in Config.Upgrades do levels[id] = 0 end
local lastBuy, maxGap, maxGapAt, firstBuy, buys = 0, 0, 0, nil, 0

local function rate(): number
	local r = Config.BaseIncomePerSecond
	for id, u in Config.Upgrades do r += u.IncomePerLevel * levels[id] end
	return r * Config.Zones[zone].Multiplier
end

local function bought(t: number, what: string)
	firstBuy = firstBuy or t
	if t - lastBuy > maxGap then maxGap, maxGapAt = t - lastBuy, t end
	lastBuy = t
	buys += 1
	if buys <= 5 or buys % 10 == 0 or what:sub(1, 4) == "Zone" then
		print(string.format("%5ds  %-14s income %.0f/s", t, what, rate()))
	end
end

for t = 1, Config.Sim.Seconds do
	coins += rate()
	local nextZone = Config.Zones[zone + 1]
	local target = if nextZone then nextZone.Cost else Config.RebirthCost(0)
	if nextZone and coins >= nextZone.Cost then
		coins -= nextZone.Cost
		zone += 1
		bought(t, "Zone " .. nextZone.Name)
	elseif not nextZone and coins >= target then
		print(string.format("%5ds  Rebirth ready", t))
		break
	elseif (target - coins) / rate() > Config.Sim.SaveWhenWithinSeconds then -- not saving yet: buy the best upgrade
		local bestId, bestPrice, bestValue = nil, 0, 0
		for id, u in Config.Upgrades do
			local price = Config.UpgradeCost(id, levels[id])
			if levels[id] < u.MaxLevel and price <= coins and u.IncomePerLevel / price > bestValue then
				bestId, bestPrice, bestValue = id, price, u.IncomePerLevel / price
			end
		end
		if bestId then
			coins -= bestPrice
			levels[bestId] += 1
			bought(t, bestId .. " " .. levels[bestId])
		end
	end
end
print(string.format("First buy %ds · longest gap %ds (ending at %ds) · zone %s · coins %.0f",
	firstBuy or -1, maxGap, maxGapAt, Config.Zones[zone].Name, coins))
```

The bot buys at most one thing per second and is perfectly efficient, so real players are slower (Rule 16). Extend it with eggs, quests and rebirth runs (multiply income by the rebirth multiplier and re-run) to check Rule 24.

## Checklist

- [ ] Every tunable number is in `ReplicatedStorage.Shared.Config`; no magic numbers in other scripts
- [ ] Balances live in server data; leaderstats/attributes only mirror them
- [ ] The server recomputes every price; Buy Max charges the exact sum of single prices
- [ ] Each currency has one stated job, and the HUD shows at most three
- [ ] Premium currency is earnable in play and never required in the first session
- [ ] Event currency has an end time and a stated conversion rate
- [ ] `economy.md` has the sources/sinks ledger, and every source has a named sink
- [ ] Every source and sink goes through the economy wrapper and `LogEconomyEvent`
- [ ] Zone gates and milestones are priced by time-to-afford at expected income
- [ ] Time-to-X targets are written, and the latest sim output meets them and is saved in `sim/`
- [ ] The first upgrade lands at 45-90 s, and no gap in the first hour exceeds ~4 minutes (or the gap is filled)
- [ ] Zone gates show their level or power band
- [ ] Quests and dailies pay 10-25% of the next goal
- [ ] Rebirth unlocks at 30-60 min, previews the multiplier, keeps pets/premium/passes, and the second run is 30%+ faster
- [ ] Rebirth cost growth vs multiplier growth gives 1.0-1.5x per step for the first rebirths
- [ ] Every multiplier category is capped; the total is capped; a breakdown is visible
- [ ] Boosts use server timestamps and cap their stack
- [ ] Offline earnings use server `os.time()`, are capped, below active efficiency, and skip the first join
- [ ] The largest expected balance stays below ~1e15, or a big-number plan exists
- [ ] All numbers display through `NumberFormat.short`
- [ ] Robux items sell time and convenience; paid multipliers sit inside capped categories
- [ ] Round-based games separate in-match and persistent currencies
- [ ] Trades are server-validated with locked inventories, a fee sink, and the paid-item trading policy check
- [ ] Every economy change is a single Config diff with a changelog line

## Common mistakes

- Prices and rewards scattered as literals across scripts, so tuning misses some.
- Trusting a price, balance or "boost active" flag sent by the client.
- Costs growing much faster than income, so the game hits a wall in the first hour.
- Gates priced with round numbers that turn out to cost seconds (or hours) of income.
- Upgrade tracks that max out with nothing behind them, so coins pile up.
- Compounding multipliers (rebirth × pets × boosts × passes) with no cap, so numbers explode.
- Rebirth costs growing x3 per rebirth against a +0.5 multiplier, creating a wall by rebirth 3.
- Rebirth that wipes things players paid for or care about.
- Offline earnings at full rate or uncapped, teaching players to log off.
- Premium currency required for early progress.
- Daily rewards or codes worth more than a session of play, inflating everything.
- Buy Max that doesn't match single buys.
- Mixed number formats on the same screen; balances heading past 2^53 unnoticed.
- Tuning by feel only, with no simulation, then discovering the wall in playtest.
- Changing ten numbers in one update and not knowing which one fixed (or broke) things.
- Logging only some sources and sinks, so analytics show a false picture.

## References

[1] AnalyticsService — https://create.roblox.com/docs/reference/engine/classes/AnalyticsService — `LogEconomyEvent` and the other server-side analytics methods used for sources, sinks and progression.
[2] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events — funnels for progression stages such as zone unlocks and first rebirth; server-only logging.
[3] Analytics — https://create.roblox.com/docs/en-us/production/analytics — D1 retention and session time first; D7 and D30 for long-term progress.
[4] Analytics dashboard — https://create.roblox.com/docs/production/analytics/analytics-dashboard — engagement, retention and monetization KPIs compared to similar experiences.
[5] Design games on Roblox — https://create.roblox.com/docs/en-us/production/game-design — Roblox's game-design guides hub.
[6] Onboarding — https://create.roblox.com/docs/production/game-design/onboarding — the first minutes measured by D1 retention, which early pacing decides.
[7] Onboarding techniques — https://create.roblox.com/docs/production/game-design/onboarding-techniques — tuning values with Configs and Experiments.
[8] Complete Grow a Garden Beginner's Guide — https://progameguides.com/roblox/complete-grow-a-garden-beginners-guide-seeds-weather-events-gears/ — seeds bought with in-game currency or Robux; limited stock refreshing every five minutes; sprinklers improving size and weight.
[9] Grow a Garden: A beginner's guide — https://sportskeeda.com/roblox-news/grow-garden-a-beginner-s-guide — heavier produce sells for more; Gold and Rainbow variants; multi-harvest crops.
[10] Complete Beginners Guide To Grow a Garden Roblox — https://deltiasgaming.com/?p=201040 — beginner economy: buying, selling and reinvesting.
[11] Complete beginners guide for Grow a Garden — https://itemlevel.net/complete-beginners-guide-for-grow-a-garden-roblox/ — single-harvest vs multi-harvest crops and early strategy.
[12] Grow a Garden beginners guide — https://avergames.com/games/grow-a-garden/beginners-guide — beginner advice on early seeds and income.
[13] Roblox Grow a Garden beginner guide — https://thebackdash.com/gaming/roblox-grow-a-garden-beginner-guide/ — beginner overview of earning and spending.
[14] Pet Simulator 99: Good vs Evil 2024 Event guide — https://sportskeeda.com/roblox-news/pet-simulator-99-good-vs-evil-2024-event-guide — 10,000 coins from breakables to clear the event's first area.
[15] Pet Simulator 99 beginner guide — https://earnaldo.com/blog/pet-simulator-99-beginner-guide — tutorial quests give starter currency and free pets; coins from breakables.
[16] Roblox Pet Simulator 99 Beginner's Guide — https://www.rpgstash.com/blog/roblox-pet-simulator-99-beginners-guide — spending coins on gates to unlock areas.
[17] Pet Simulator 99 Complete Beginner Progression Guide — https://dungeonpath.com/tags/rebirth/ — beginner progression route through areas and rebirths.
[18] Ranks (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Ranks_(Pet_Simulator_99) — a rank progression track separate from currency.
[19] Blox Fruits map — https://www.pocketgamer.com/roblox/blox-fruits-map/ — islands by level band: starter 0-10, Jungle 15-30.
[20] A Roblox beginner's guide to playing Blox Fruits — https://www.keengamer.com/articles/guides/a-roblox-beginners-guide-to-playing-blox-fruits/ — starter quests and team differences.
[21] Marines (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Marines — the Marine faction and its differences.
[22] Blox Fruits guide (GameWith) — https://gamewith.net/roblox/57417 — beginner guide covering factions and early progression.
[23] Tower Defense Simulator: A Beginner's Guide — https://www.sportskeeda.com/roblox-news/tower-defense-simulator-a-beginner-s-guide — cash from clearing waves and at mission end.
[24] Tower Defense Simulator complete beginners guide — https://itemlevel.net/tower-defense-simulator-complete-beginners-guide/ — beginner economy of towers and matches.
[25] Adopt Me: how to get free pets without Robux — https://allthings.how/adopt-me-how-to-get-free-pets-without-robux/ — Task Board with 24-hour refresh; eggs hatching through objectives with a Robux skip.
[26] Adopt Me guide: Endangered Egg — https://www.filmink.com.au/adopt-me-guide-what-is-the-endangered-egg-how-to-get-it-hatch-chances-trading-tips/ — Task Board pays small Bucks rewards and a chance at a special egg.
[27] Lobby (DOORS wiki) — https://breezewiki.discard.no/doors-game/wiki/Lobby — the lobby's elevators start runs, and its shop lets players buy knobs and revives.
[28] First-Time User Experience (FTUE) Toolkit — https://liquidandgrit.com/first-time-user-experience-ftue-toolkit — early sessions and starter offers as part of the first experience.
[29] Best Practices For Mobile Game Onboarding — https://adriancrook.com/?p=8055 — progress tracking and instant rewards in early play.
[30] Pet Simulator 99 Beginner Guide — https://dungeonpath.com/tags/ps99-beginner/ — when to move to the next area and how gates pace progress.
[31] Adopt Me beginners hints and tips — https://www.supercheats.com/roblox-adopt-me-walkthrough-guide/beginners-hints-and-tips — eggs hatch through objectives, with a Robux option to hatch immediately.

Related: [[00 Start Here]] · [[00 For Any AI]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[05 UI and HUD]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
