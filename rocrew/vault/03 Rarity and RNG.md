---
tags: [vault, rng, rarity, odds, loot, pity]
for: [architect, builder, balance, merchant, reviewer]
also: [lead, frame, librarian, playtest, kid-tester, liveops, producer]
---

# 03 Rarity and RNG

Random rewards (eggs, crates, rolls, drops, spins, mutations, restocking shops) power many of Roblox's most popular genres because chasing a rare result is exciting and every roll could be the one. This chapter covers the rarity ladder and its visual language, the math of odds (weights, expected rolls, the 63% and 95% rules), luck, pity, variants and mutations, reveal choreography, how to show odds honestly, the server-side roll pipeline, auditing with simulations, and the rules for paid random items.

RNG is also where games go wrong most often. Odds that don't match the UI, rolls decided on the client and exploited, top tiers so rare that nobody ever sees them, reveal animations that turn into chores, and paid random items that break Roblox's disclosure rules all damage trust or get a game in trouble. Every roll RoCrew builds is server-authoritative, data-driven, audited by simulation and honestly displayed.

Read this chapter when a game has any random reward (Architect plans the tiers and pools, Balance writes the tables and runs the audit, Builder builds the pipeline, Frame builds the odds UI and reveals, Librarian makes the tier effects, Merchant decides what is paid and checks the current policy, Reviewer checks the audit and disclosures). Read it with [[02 The Core Loop]] (rolls as a loop) and [[04 Progression and Economy]] (what rolls cost and how they feed power).

Odds, timings and thresholds in this chapter are this studio's design targets unless a source is cited. Facts about real games come only from the cited sources. The policy rules are summarized as the studio understands them; Merchant checks Roblox's current rules before shipping anything paid and random.

## Rules

### The math and the server

1. **Every roll is decided on the server; the client sends only what it wants to roll.**
   Why: exploiters can read and run any LocalScript and fire any remote with any arguments. A client that decides a result, or sends the tier it "rolled", is a free-legendary button.
   How: `Remotes.OpenEgg:InvokeServer("BasicEgg", 3)`. The server validates, deducts, rolls, saves, logs, and returns the ids; the client plays the reveal for exactly those results. Never roll in a LocalScript, not even "for preview". Pipeline in "Luau".
   Done right: the client's reveal animation receives `{"Fox", "Dog", "Dog"}` from the server.
   Done wrong: `Remotes.GiveRolledPet:FireServer("Dragon")`.

2. **Use one `Random` object per server, created once, and never reseed it per roll.**
   Why: reseeding with `os.time()` per roll makes results repeat within the same second and become predictable. One long-lived generator gives a proper sequence.
   How: `local rng = Random.new()` at module load in the shared Roll module; `rng:NextNumber()` for weights. Use seeded generators only for things that should be identical across servers (Rule 24's restock).
   Done right: `Random.new()` once in `Roll.lua`.
   Done wrong: `math.randomseed(os.time())` inside the roll function.

3. **Store weights, not percentages, in one frozen Config table that the server and the odds UI both read.**
   Why: weights are easy to edit (add an item without rebalancing everything to 100) and a single source keeps the displayed odds identical to the real odds.
   How: `ReplicatedStorage.Shared.Config.Eggs`: each entry has `Id`, `Tier`, `Weight`, optional `Lucky`. An entry's chance is `weight / totalWeight`. The UI calls the same `Roll.weights` function the server uses. `table.freeze` the table so nothing edits it at runtime.
   Done right: Balance edits one weight and the in-game odds board updates itself.
   Done wrong: a hand-typed odds label "Dragon 1%" next to a table where the dragon is 0.6%.

4. **Each tier is 3-10x rarer than the tier below, across 5-7 tiers.**
   Why: tiers must feel different. A step of less than about 3x makes adjacent tiers feel the same; much more than 10x leaves a dead gap where nothing is hit for a long time.
   How: a basic-egg starting point (to tune): Common 60, Uncommon 25, Rare 10, Epic 4, Legendary 0.9, Mythic 0.1 → 1 in 1.7, 4, 10, 25, 111, 1,000. Later eggs shift the same ladder up a tier.
   Done right: each step is 2.5-9x rarer and each feels like an event.
   Done wrong: Rare 1 in 10 and Epic 1 in 12, or Legendary 1 in 100 and Mythic 1 in 1,000,000 in the same starter egg.

5. **Design every rare tier with expected rolls: about 63% of players hit a 1-in-N within N rolls, 86% within 2N, 95% within 3N; the median is about 0.7N.**
   Why: "1 in 1,000" does not mean "after 1,000 rolls". Over a third of players will not see it by roll N, and about 1 in 20 will still be waiting at 3N. Designing from expected rolls tells you how long the unlucky players wait.
   How: `chance of at least one in k rolls = 1 - (1 - p)^k`. Balance converts rolls to minutes with the roll rate (rolls per minute at the target stage) and checks that the session-goal tier is reachable for most players in a session. Table in "Probability toolkit".
   Done right: "Legendary 1 in 111; at ~6 rolls/min early, median ~13 min; 95% by ~55 min."
   Done wrong: "1 in 1,000 at one roll per minute is fine, that's about 16 hours."

6. **Every tier that exists is reachable, and the rarest tier's existence is shown in the world.**
   Why: a tier nobody sees might as well not exist, and it can't create desire. The top tier is the hook ([[01 The First Five Minutes]]), the "leave players wanting more" part of onboarding [27].
   How: show the top items on pedestals with their odds ("1 in 5,000"), trigger server messages when someone hits them (Rule 21), and check in the sim that at least a few percent of active players can reach the top tier of each pool within a week of normal play (rule of thumb; Balance sets the exact target).
   Done right: a Mythic dragon statue in the hub labeled "1 in 1,000".
   Done wrong: a Secret tier at 1 in 50,000,000 in a game where players roll 200 times a day.

### Showing odds

7. **Every paid random item shows the odds of every possible outcome before purchase, including secret tiers.**
   Why: Roblox's rules require experiences that sell paid random items to disclose the odds before purchase (this studio's understanding; Merchant checks the current policy text before shipping). Hidden odds also destroy trust.
   How: treat any random reward obtainable with Robux, directly or through a currency bought with Robux, as a paid random item. Show odds on a BillboardGui at the egg/crate and in the confirm panel. Secret items show their row too ("??? — 1 in 10,000"). Pity and guarantee rules are stated next to the odds (Rule 15).
   Done right: the confirm panel lists all 7 outcomes with chances before "Buy".
   Done wrong: "Contains a chance at something legendary!" with no numbers.

8. **Check `PolicyService` on the server before offering any paid random item, and fail closed.**
   Why: some players may not be offered paid random items at all, depending on Roblox policy for their account and region. Offering one anyway is a policy violation.
   How: `PolicyService:GetPolicyInfoForPlayerAsync(player)` in a `pcall`; if it fails or `ArePaidRandomItemsRestricted` is true, hide or disable the Robux option for that player and never let a Robux-bought currency buy rolls for them. Cache the result per session. Code in "Luau".
   Done right: restricted players see the egg with only the soft-currency option, or no egg if it is Robux-only.
   Done wrong: checking on the client, or treating a failed call as "allowed".

9. **Show chances below 1% as "1 in N" and at or above 1% as a percent with one decimal; the displayed list sums to about 100%.**
   Why: "0.0123%" is unreadable for most players; "1 in 8,130" is clear. Rounding can make a list sum to 98% or 103%, which looks wrong.
   How: `string.format("1 in %s", formatNumber(math.round(1 / p)))` below 1%; `string.format("%.1f%%", p * 100)` above. Check the rounded percentages sum to 100% ± 0.5% and adjust the largest entry's display if needed. Code in "Luau".
   Done right: "Dog 60.0% · Cat 25.0% · Fox 10.0% · Owl 4.0% · Dragon 1 in 111 · Phoenix 1 in 1,000".
   Done wrong: "Phoenix 0%" because it rounded down.

10. **Show effective odds with the player's current luck, and label the active luck.**
   Why: luck changes the odds; showing base odds while luck is active hides what the boost really does, and showing "x2" while the real change is smaller misleads.
   How: the odds board calls `Roll.weights(entries, currentLuck)` and shows the result with a "Luck x2 active (12:40 left)" label. Show base odds too in the paid confirm panel. Worked example: luck x2 on Rare+ entries of the basic egg moves Mythic from 1 in 1,000 to about 1 in 575, not 1 in 500, because the total weight grows (table in "Luck models").
   Done right: "Mythic: 1 in 575 (base 1 in 1,000) · Luck x2".
   Done wrong: "x2 luck = double chance!" when it isn't.

### Tiers as a visual language

11. **Use fixed tier colors everywhere: cards, reveals, chat, the index, world effects and nametags.**
   Why: color teaches rarity faster than text. Consistent colors let a player read a reveal before the name appears.
   How: studio palette (in `Shared.Tiers`): Common `#B4B4B4`, Uncommon `#5BD45B`, Rare `#3FA9F5`, Epic `#A659F0`, Legendary `#FFB020`, Mythic `#FF4D6D`, Secret black with a rainbow UIGradient. Every UI and VFX reads the color from `Shared.Tiers`, never a literal.
   Done right: a gold glow means Legendary in the reveal, the inventory, the chat message and the pet's aura.
   Done wrong: Legendary gold on cards but purple in chat.

12. **Escalate the reveal with the tier: 0.4 s for Common up to 3 s for the top tier, every reveal skippable after the first second, repeats faster.**
   Why: a big reveal for a big result is the payoff; a big reveal for a common result is a chore, and players roll many commons.
   How: Common 0.4 s pop; Uncommon 0.6 s; Rare 1.0 s with glow and sound; Epic 1.5 s with shake and particles; Legendary 2.2 s with burst, screen flash and server message; Mythic/Secret 3 s with unique effects. Tap to skip after 1 s. Multi-opens show all results at once on a grid, with the best one getting its full reveal. Spec in "Reveal choreography".
   Done right: three commons resolve in under a second; a Legendary stops the screen.
   Done wrong: a 5 s egg wobble for every common.

13. **Rarity is visible on the item in the world: size, aura, particles, a nametag color.**
   Why: rarity is social. Others seeing your Legendary is half the value and creates goals for them ([[10 Retention and Social]]).
   How: rarer pets are slightly larger (+10-20% per tier at the top), have tier-colored particles from Epic up, and a tier-colored name above them; top tiers can add a tier-colored Highlight outline [22][23] or Beam light rays [24]. Keep effects performant on phones ([[08 Mobile]]).
   Done right: a Mythic pet glows red and trails sparkles; players ask how to get it.
   Done wrong: a Mythic pet that looks like a recolored Common.

### Luck and pity

14. **Luck multiplies only the rare entries' weights, and the total luck is capped in Config.**
   Why: multiplying every entry, commons included, changes nothing after renormalizing. Uncapped luck stacking makes top tiers trivial.
   How: entries flagged `Lucky = true` (Rare and up) have their weight multiplied by luck; commons keep theirs, so their share shrinks. Cap total luck (e.g. `MaxLuck = 10`). Luck comes only from server data: game passes checked with `MarketplaceService:UserOwnsGamePassAsync`, potions and boosts with server timestamps.
   Done right: luck x3 makes each Rare+ entry of the basic egg about 2.3x as likely (not 3x, because the total weight grows), and luck stops at x10.
   Done wrong: luck applied to all weights, or a stack of five boosts reaching x400.

15. **Stack luck sources additively unless Balance deliberately designs multiplication, and show the total.**
   Why: multiplying sources (pass x2 * potion x2 * event x2 * friend x1.5) grows fast and hides how much each source does.
   How: `luck = 1 + sum(bonuses)`, e.g. pass +1, potion +0.5, event +1 → x3.5; clamp to `MaxLuck`. Show a luck breakdown on hover/tap in the luck HUD tile.
   Done right: "Luck x3.5: Pass +1, Potion +0.5, Event +1".
   Done wrong: "Luck x24" with no explanation.

16. **Simulate "1 in N" sequential rolls before displaying them; their true odds differ from the nominal ones.**
   Why: aura-style games often check items rarest-first, each with `luck / N`. Earlier checks consume probability, so later items are rarer than their label, and high luck can make some items unreachable.
   How: compute the true distribution with the sim (or analytically: each item's true chance is `its p × product of (1 - p) of all items checked before it`). Example: checking 1/1000, 1/100, 1/25, 1/10, 1/4 in order, the "1 in 10" item is really about 1 in 10.5 and the "1 in 4" item about 1 in 4.7. Display the true values.
   Done right: the aura index shows simulated true odds with the player's luck.
   Done wrong: showing "1 in 4" for something that is really 1 in 4.7, or 1 in 6 with luck.

17. **Hard pity guarantees a minimum tier after a fixed number of rolls without it; save the counter per pool and show it.**
   Why: pity caps the worst-case bad luck, turning "I'll never get it" into anticipation. Saving it means rejoining doesn't reset it.
   How: `Pity = { Rolls = 150, MinTier = "Legendary" }`; on the 150th roll without Legendary+, the roll draws only from Legendary+. Counter stored in the player's data per pool, reset when the tier hits. HUD: "Legendary guaranteed in 37 rolls". Math: with a 1% Legendary+ rate and hard pity at 150, about 22% of players reach pity and the effective rate becomes about 1 in 78.
   Done right: a pity bar on the egg's odds board that fills with each roll.
   Done wrong: a pity counter in a ScreenGui that resets on rejoin.

18. **Soft pity raises lucky weights each roll past a threshold, so the guarantee arrives smoothly.**
   Why: hard pity creates a cliff at roll 150; soft pity spreads the help and feels less mechanical.
   How: past `SoftStart` rolls (e.g. 100), multiply lucky weights by `1 + SoftStep * (count - SoftStart)` (e.g. SoftStep 0.05), still capped by hard pity. Simulate the resulting distribution; disclose it for paid rolls.
   Done right: rolls 100-150 get steadily luckier; average rolls to Legendary drops without a hard wall.
   Done wrong: undisclosed soft pity on a paid egg.

19. **For paid rolls, disclose the base odds and the guarantee rule together.**
   Why: pity changes the real odds; players deserve to know both the per-roll chance and the guarantee.
   How: under the odds list: "Legendary or better guaranteed within 150 opens. Counter: 113/150." If soft pity exists, say so: "Chances rise after 100 opens."
   Done right: odds + pity rule on the same confirm panel.
   Done wrong: a guarantee mentioned only in a Discord post.

### Fair, kind and useful randomness

20. **Duplicates always have value: fuse, convert to currency, level up, or feed an index tier.**
   Why: a duplicate with no use feels like a loss, and players roll a lot of duplicates.
   How: options in order of preference: merge N duplicates into a stronger version (e.g. 5 → Golden, 5 Golden → Rainbow), auto-convert to a shard currency that buys guaranteed items, or give XP to the original. Show the conversion in the reveal ("Duplicate! +20 shards").
   Done right: "Dog x5 → Golden Dog" as a visible goal.
   Done wrong: the fifth identical dog with nothing to do but delete it.

21. **Announce rare results to the server and huge ones to every server, with rate caps.**
   Why: public rare results show the game's dream to everyone and give the roller a moment of fame.
   How: server message for results rarer than about 1 in 10,000 (tune per game), global (all servers via MessagingService) for about 1 in 1,000,000+; tier-colored text with player name, item and odds. Cap to one message every 10-30 s per server; queue or drop extras. Messages show via `TextChannel:DisplaySystemMessage` on clients (code in "Luau"). Respect display names, never user ids.
   Done right: "[Server] Alex hatched a MYTHIC Phoenix (1 in 1,000)!" in Mythic red.
   Done wrong: chat flooded with every Rare.

22. **Give the collection an index with silhouettes, per-pool completion and rewards.**
   Why: the index turns random results into a long-term goal and shows what exists without spoiling the look of rare items.
   How: one index page per pool or world; unknown entries as dark silhouettes with tier color frames and odds; completion bar per page; rewards at 25/50/75/100% (luck boosts, titles, a cosmetic). Pair the random chase with a deterministic track (ranks, levels) so progress never depends only on luck; Pet Simulator 99 documents a ranks system [11]. See [[10 Retention and Social]].
   Done right: "Meadow Egg index 6/8 — complete for +10% luck".
   Done wrong: a plain list of names with no progress.

23. **Variants and mutations are a second roll layer with a multiplier, shown on the item and in the odds.**
   Why: a small chance that any result is a special version (Golden, Shiny, Rainbow) makes every roll interesting, even commons. Grow a Garden guides note that variants like Gold and Rainbow are worth more than base crops [2].
   How: after the item roll, roll a variant table (e.g. Normal 97%, Golden 2.5%, Rainbow 0.5%) with value multipliers (x2, x5), applied as a separate visible tag. For paid rolls, disclose variant odds too. Mutations caused by world events (weather, events) state their trigger and chance in the index.
   Done right: "Dog (Golden) — 1 in 40 variant, x2 power" with gold sparkle.
   Done wrong: a hidden 0.1% variant on a paid egg that dataminers discover.

24. **Restocking shops roll their stock on the server per time window, the same for everyone in the window, with a visible timer.**
   Why: a rolled shop stock ("today's seeds") makes visiting the shop a small roll and creates in-session rhythm. Grow a Garden guides describe each seed having limited stock that refreshes every five minutes [1][2][3].
   How: seed a `Random.new(windowIndex)` where `windowIndex = os.time() // 300` (5-minute windows) so every server shows the same stock in the same window; roll each item's stock count from its own weight table; show "Restock in 2:14". Keep starter seeds always in stock so new players can play (rule of thumb).
   Done right: rare seeds appear in some windows, common seeds in all; everyone sees the same shop.
   Done wrong: per-player stock rolls that players reroll by rejoining.

25. **Rare items are stronger within their tier band but never required for first-session progress.**
   Why: the chase must matter (rare = better), but if early progress depends on luck, unlucky players hit a wall. In a Pet Simulator 99 event, the first egg's lowest-rate pets were described as the most powerful and stayed effective into the following areas [7].
   How: Pet Simulator 99 beginner guides tie moving to the next area to how fast your pets break things and to buying the gate [9][10], so pace gates with ordinary pets in mind. Power within a pool scales with rarity (e.g. Common 1x, Rare 1.5x, Legendary 3x, Mythic 5x of the pool's base), while zone gates are tuned (in the sim) for players with only common-tier pets plus upgrades ([[04 Progression and Economy]]).
   Done right: a Legendary speeds you up; a full team of commons still reaches zone 3 in session 1.
   Done wrong: zone 2's gate requires a power level only Legendary owners reach.

26. **The first free rolls are curated from a starter table that can never be bought.**
   Why: a new player's first roll sets their trust in the game's RNG. Free starter pets are a common opening: Adopt Me's tutorial walks new players through hatching their first pet [12], a Pet Simulator 99 event gave a free Fate egg on entry [7], and Pet Simulator 99's tutorial quests give free pets [8].
   How: `StarterEgg` table with Rare as the floor and a guaranteed full reveal; flag `NeverPaid = true` so the shop code refuses to sell it. After the starter rolls, normal odds apply. The first experience has to convince players the game is worth their time [28]. See [[01 The First Five Minutes]].
   Done right: the free first hatch is always Rare or better.
   Done wrong: the starter egg's odds quietly applied to a Robux egg.

27. **No near-miss fakery: the reveal shows the true result, never an animation that "almost" lands on a rare.**
   Why: animations designed to suggest you nearly won something rare are a gambling-style manipulation and unfair to young players.
   How: spinner/slot-style reveals land on the true result without slowing past rare entries; egg reveals never flash a rare silhouette before showing a common. Reviewer checks every reveal animation for this.
   Done right: the wheel slows evenly and stops on the real result.
   Done wrong: a wheel that always crawls past the Mythic slot and stops one away.

28. **Use kid-safe framing: no casino imagery or words (slots, chips, "jackpot", "bet", "gamble").**
   Why: many players are children; RNG should feel like hatching and discovery, not gambling.
   How: eggs, chests, crates, capsules, crafting, fishing, digging. Words: "hatch", "open", "roll", "discover". Kid Tester flags anything that looks like a casino.
   Done right: a "Lucky Egg" with sparkles.
   Done wrong: a slot machine with "Bet 100 coins!".

29. **Paid random items are priced in soft currency first; Robux paths are optional shortcuts and never the only way to the best tier.**
   Why: the chase should be playable for free; paid rolls that are the only route to top items read as pay-to-win and invite policy trouble.
   How: every pool has a soft-currency price; Robux sells luck boosts, auto-roll or bulk opens, with odds disclosed. Exclusive paid-only pools contain cosmetic variants, not stronger items ([[09 Shops and Monetization]]). Free routes into a collection matter enough to players that guides are written about them [15]. Adopt Me guides describe eggs hatching through completing objectives, with a Robux option to hatch immediately [12][13]: time is what's sold, not odds.
   Done right: "Open: 500 coins" and "Open x3: 1,350 coins" with a Robux luck potion on the side.
   Done wrong: the Mythic-containing egg is Robux-only.

### Pipeline, audit and logging

30. **The roll remote validates everything: types, pool id, an allowed-count list, distance, cooldown, inventory space and currency.**
   Why: every unchecked argument is an exploit: fractional counts, NaN, negative prices, rolling a far-away egg, rolling while the inventory is full.
   How: `typeof` checks; `ALLOWED_COUNTS = {[1]=true, [3]=true, [8]=true}` (also rejects NaN and fractions); distance from HumanoidRootPart to the egg ≤ 15 studs; per-player cooldown ~0.5 s; inventory space ≥ count; currency deducted before rolling, in the same server step. Code in "Luau".
   Done right: `InvokeServer("BasicEgg", 0/0)` returns nil and costs nothing.
   Done wrong: `count` used directly in a `for` loop.

31. **Grant results to saved data before the client sees them, and keep rolls idempotent on failure.**
   Why: a crash or disconnect between the reveal and the save can lose a rare result or let it be duplicated.
   How: deduct, roll and add to the inventory in server memory in one synchronous step; mark data dirty so autosave writes it; return ids only after granting. For Robux purchases of rolls, grant inside `ProcessReceipt` and record the receipt id so repeats are ignored ([[09 Shops and Monetization]]).
   Done right: rejoining right after a Legendary reveal still shows it in the inventory.
   Done wrong: the client tells the server "show complete, now save my pet".

32. **Audit every change to a roll table, luck rule or pity rule with a 1,000,000-roll simulation and keep the output.**
   Why: typos in weights, a wrong `Lucky` flag or a pity off-by-one are invisible in playtests and obvious in a sim.
   How: run the audit script (in "Luau"); every entry within 4 standard deviations of its expected frequency; the pity sim's maximum rolls to the pity tier never exceed `Pity.Rolls`. Balance saves the output in `games/<slug>/sim/`; Reviewer checks it before merge.
   Done right: `sim/eggs-2026-10-23.txt` with all rows OK and the pity max = 150.
   Done wrong: "I changed the weights, looks fine."

33. **Log rolls in aggregate: tier counts per player per minute, plus every result rarer than about 1 in 1,000.**
   Why: you need to see real distributions and rare-hit rates, but one event per roll floods analytics.
   How: count rolls per tier on the server and log one custom event per minute per player; log rare hits individually with the tier in a custom field. Custom field values count toward a limit of 8,000 unique combinations across the three fields per experience [20], so use tier names and pool ids, never item instance ids or user ids. Log currency spent on rolls with `LogEconomyEvent` [19].
   Done right: "RollsPerMinute" with tier in CustomField01; "RareHit" with pool and tier.
   Done wrong: a custom event per roll with the pet's unique id in a custom field.

34. **Never change odds silently: every change goes in the changelog and the in-game update notes.**
   Why: players notice changes in drop rates; silent nerfs destroy trust and, for paid items, the disclosed odds must match.
   How: odds changes are Config diffs reviewed by Reviewer, with a line in `games/<slug>/changelog.md` and the update log. Paid pools never get worse odds without notice ([[12 Live Ops and Launch]]). After any odds change, Liveops watches monetization and retention KPIs in the analytics dashboard [21].
   Done right: "Update 4: Mythic in Lava Egg 1 in 2,000 → 1 in 1,500."
   Done wrong: quietly halving a Legendary weight after launch.

35. **Time-limited pools show a real end time and never fake urgency.**
   Why: limited pools create excitement, and pools rotate over a game's life (guides even recount which egg Adopt Me started with [16]); fake countdowns that reset are manipulative and erode trust.
   How: end times are server timestamps in Config (`EndsAt = os.time{...}`), shown as a countdown; when it ends, the pool is gone or returns only as announced. Don't put limited paid pools in front of first-session players ([[09 Shops and Monetization]]).
   Done right: "Halloween Egg leaves in 3d 4h", and it actually leaves.
   Done wrong: a "Last chance! 10:00" timer that restarts every join.

36. **Multi-opens use the same per-roll odds; any multi-open bonus is disclosed.**
   Why: "Open x8" should be a convenience, not a hidden odds change; if it adds a guarantee, players should know.
   How: x8 runs eight independent rolls through the same function. If you add "x8 guarantees at least one Rare", state it on the button and apply it as a pity-like rule after rolling.
   Done right: "Open x8 (guaranteed 1 Rare+)" and the rule in the odds panel.
   Done wrong: x8 secretly using a different, better table than single opens.

37. **Luck boosts expire on server time, not client timers.**
   Why: client timers can be paused, sped up or reset; a boost tied to them can be extended indefinitely.
   How: store `BoostEndsAt = os.time() + duration` in the player's data; the server computes remaining time on every roll; the client only displays the countdown from the server value. Offline time counts (rule of thumb: boosts tick while away unless the game says "play time only", and if so it tracks play seconds on the server).
   Done right: a 15-minute potion ends 15 minutes later no matter what the client does.
   Done wrong: the client sends "boost still active" with each roll.

## Step by step

### Building a random reward system in 14 steps

1. **Architect lists every random source** in `plan.md`: eggs/crates, drops, rolls, variants, restocks, wheels. For each: free or paid, currency, roll rate target, what the top tier does.
2. **Merchant marks paid paths** and checks Roblox's current rules on paid random items before anything is built (Rules 7-8).
3. **Balance writes the tier ladder** (Rule 4) and each pool's weights in `Shared.Config.Eggs` (Rule 3), plus variant tables (Rule 23) and pity rules (Rules 17-18).
4. **Balance converts odds to time** with expected rolls and the target roll rate (Rule 5) and writes "median/95% time to each tier" in `economy.md`.
5. **Builder writes `Shared.Roll`** (weights, pick, sequential pick) and `Shared.Tiers` (colors, reveal times, particle counts).
6. **Builder writes the server roll service**: validation, deduction, pity, roll, variant, grant, save, log, announce (Rules 1, 30-31, 33, 21).
7. **Builder adds the PolicyService gate** for any paid path (Rule 8).
8. **Frame builds the odds board** (BillboardGui at the egg) and the confirm panel, both reading `Roll.weights` with current luck (Rules 9-10, 19).
9. **Librarian builds tier effects** (particles, sounds, glows) per the tier spec; Frame builds the reveal choreography (Rule 12).
10. **Frame builds the index** with silhouettes and completion rewards (Rule 22).
11. **Builder adds duplicates handling** (fuse/convert) (Rule 20).
12. **Balance runs the audit sim** and the pity sim; saves outputs in `sim/` (Rule 32).
13. **Reviewer checks**: no client-side rolls, odds match Config, paid disclosures complete, PolicyService fail-closed, no near-miss animations (Rule 27), kid-safe wording (Rule 28).
14. **Playtest times reveals and multi-opens** on a phone profile in the Device Simulator [25]; Kid Tester checks that tiers are readable by color alone.

### Changing odds after launch in 6 steps

1. Write the reason and the new weights in a Config diff; for risky changes, test on a share of players with Configs and Experiments where available [26].
2. Run the audit and pity sims; save the outputs.
3. Reviewer checks the diff, the sim and any paid disclosure text.
4. Update the in-game odds (automatic if UI reads Config) and the update notes (Rule 34).
5. Ship; Liveops watches rare-hit rates for the pool for a week.
6. Record the outcome in `decisions.md`.

## Probability toolkit

**Chance of at least one hit of a 1-in-N item in k rolls:** `1 - (1 - 1/N)^k`. For any N above ~50 this is very close to `1 - e^(-k/N)`:

| Rolls (as a multiple of N) | Chance of at least one |
|---|---|
| 0.25N | 22% |
| 0.5N | 39% |
| 0.69N | 50% (the median) |
| 1N | 63% |
| 2N | 86% |
| 3N | 95% |
| 4.6N | 99% |

**Expected rolls to the first hit:** N. **Median:** about 0.69N. **Unlucky 5%:** still waiting at 3N. Use this table whenever someone says "1 in N means N rolls".

**Time to a tier:** `minutes = rolls / rollsPerMinute`. Example (targets): basic egg Legendary at 1 in 111 and 6 rolls per minute → median ~13 min, 95% within ~56 min. Mythic at 1 in 1,000 → median ~1.9 h of rolling, 95% within ~8.3 h: a multi-session goal.

**Basic egg starting table** (weights 60/25/10/4/0.9/0.1, total 100):

| Tier | Weight | Chance | 1 in |
|---|---|---|---|
| Common | 60 | 60.0% | 1.7 |
| Uncommon | 25 | 25.0% | 4 |
| Rare | 10 | 10.0% | 10 |
| Epic | 4 | 4.0% | 25 |
| Legendary | 0.9 | 0.9% | 111 |
| Mythic | 0.1 | 0.1% | 1,000 |

**Expected value of a roll** (for pricing): `EV = Σ p_i × value_i`. If duplicates convert to currency, include it. Balance keeps the soft-currency EV of a roll below its price in the same currency (rule of thumb: EV 30-70% of price), so rolls are a sink, not a money printer ([[04 Progression and Economy]]).

## Luck models

**Weight luck (recommended).** Multiply the weights of `Lucky` entries by luck and renormalize. Effect on the basic egg when Rare+ entries are lucky:

| Luck | Common | Uncommon | Rare | Epic | Legendary | Mythic |
|---|---|---|---|---|---|---|
| x1 | 60.0% | 25.0% | 10.0% | 4.0% (1 in 25) | 0.90% (1 in 111) | 0.10% (1 in 1,000) |
| x1.5 | 55.8% | 23.3% | 14.0% | 5.6% (1 in 18) | 1.26% (1 in 80) | 0.14% (1 in 717) |
| x2 | 52.2% | 21.7% | 17.4% | 7.0% (1 in 14) | 1.57% (1 in 64) | 0.17% (1 in 575) |
| x3 | 46.2% | 19.2% | 23.1% | 9.2% (1 in 11) | 2.08% (1 in 48) | 0.23% (1 in 433) |
| x5 | 37.5% | 15.6% | 31.3% | 12.5% (1 in 8) | 2.81% (1 in 36) | 0.31% (1 in 320) |

Read it: "x2 luck" does not double the Mythic chance in this egg; it raises it about 1.7x. Show the real numbers (Rule 10). To make luck stronger at the top only, flag just Legendary+ as lucky, or apply luck as `weight * luck^k` with a tier-based exponent; simulate either.

**"1 in N" sequential luck (aura games).** Check items rarest first; item i hits if `rng:NextNumber() < luck / N_i`; the first hit wins; if nothing hits, the default common is given. True chance of item i = `(luck/N_i) × Π (1 - luck/N_j)` over items checked before it. Nominal vs true for 1/1000, 1/100, 1/25, 1/10, 1/4 checked in that order at luck 1:

| Item | Nominal | True |
|---|---|---|
| 1 in 1,000 | 0.100% | 0.100% (1 in 1,000) |
| 1 in 100 | 1.00% | 0.999% (1 in 100) |
| 1 in 25 | 4.00% | 3.96% (1 in 25.3) |
| 1 in 10 | 10.0% | 9.49% (1 in 10.5) |
| 1 in 4 | 25.0% | 21.4% (1 in 4.7) |
| default | — | 64.1% |

With luck ≥ N for any item, `luck/N ≥ 1`, so that item always hits and everything after it becomes unreachable. Cap luck per item (`math.min(luck / N, 0.5)`) or switch to weight luck.

## Pity designs

| Design | How | Best for | Math (1% base rate) |
|---|---|---|---|
| None | Plain odds | Cheap, fast free rolls | Effective 1 in 100 |
| Hard pity | After P rolls without the tier, the next roll is that tier or better | Paid or slow rolls | P = 100: 37% reach pity, effective 1 in 63; P = 150: 22% reach pity, effective 1 in 78; P = 200: 14%, 1 in 87 |
| Soft pity | After S rolls, lucky weights × (1 + step × (count - S)), capped by hard pity | Long chases | Simulate; disclose for paid |
| Shards | Each roll gives shards; N shards buy the item outright | Collection games | Sets a ceiling in currency terms |
| Bad-luck streak | Each miss adds +x% to the next roll's chance, reset on hit | Drops in combat games | Simulate |

Pity counters are per pool, saved, shown, and reset only when the guaranteed tier or better is hit. Paid pools disclose the rule (Rule 19).

## Tier spec

| Tier | Color | Reveal time | Particles | Sound | Extras |
|---|---|---|---|---|---|
| Common | `#B4B4B4` | 0.4 s | 0-6 | Soft pop | — |
| Uncommon | `#5BD45B` | 0.6 s | 10 | Pop + chime | Green card glow |
| Rare | `#3FA9F5` | 1.0 s | 20 | Chime | Card glow, small shake (0.1 studs) |
| Epic | `#A659F0` | 1.5 s | 30 | Rising chord | Shake 0.2 studs, rays behind card |
| Legendary | `#FFB020` | 2.2 s | 45 | Fanfare | Screen flash 0.15 s, server message |
| Mythic | `#FF4D6D` | 3.0 s | 60 | Unique sting | Flash, slow-mo 0.3 s, server/global message |
| Secret | Black + rainbow UIGradient | 3.0 s | 60 | Unique sting | Unique animation; listed in odds as "???" for paid pools |

All times are skippable after 1 s (Rule 12). Respect the camera-shake and flash settings toggles ([[02 The Core Loop]]).

## Reveal choreography

**Single open (target timings):**
1. **0.0 s** — tap Open; the button depresses; currency counter drops with a tick.
2. **0.0-0.3 s** — the egg pulses (UIScale 1 → 1.08 → 1), wobble 2-3 times.
3. **0.3 s** — the result is already known (the server returned it). Crack effect colored by tier for Rare+ (the color *is* the tease; it is the real tier, never a fake).
4. **0.4-3.0 s** — the tier's reveal (tier spec), item card with name, tier label, power, and "NEW!" if first of its kind.
5. **End** — the card shrinks into the inventory button, which pops; "Equip" is offered for upgrades.

**Multi open (x3, x8):** one shared wobble (0.3 s), then all cards appear together on a grid, commons dimmed, the best result enlarged with its full tier reveal; tap to dismiss. Auto-open mode skips straight to the grid and shows only Legendary+ reveals.

**Speed-ups:** after the player has opened a pool 20 times, default to the fast reveal for Common-Rare. Offer a "Skip animations" setting.

**Preloading:** preload the tier effect sounds and the reveal UI with the HUD so the first Legendary never stutters (ContentProvider guidance: preload essential UI [30]).

## Odds display spec

- **Where:** a BillboardGui at the egg/crate (visible within ~25 studs), the confirm panel, and the index page for that pool.
- **Row:** item icon 40 px, name, tier color bar, chance ("12.0%" or "1 in 1,111"). Sort rarest last (or first, but be consistent).
- **Luck line:** "Luck x2 active (12:40)" with effective odds; tap to see base odds.
- **Pity line:** "Legendary+ guaranteed in 37 opens" with a bar.
- **Variants:** a second small table "Golden 1 in 40 · Rainbow 1 in 200" if variants apply.
- **Paid confirm panel:** all rows, pity rule, variant odds, price, "Buy" and "Cancel" equal in size; nothing pre-checked.
- **Restricted players:** if `ArePaidRandomItemsRestricted`, the Robux option is not shown (Rule 8).
- **Format:** `< 1%` as "1 in N" with thousands separators; `≥ 1%` as one-decimal percent; rounded percentages sum to 100% ± 0.5%.

## Paid random items: the studio checklist

- [ ] Every outcome's odds are shown before purchase, including secret tiers, variants and pity rules (Rule 7).
- [ ] Rolls bought with a Robux-purchased currency are treated as paid random items.
- [ ] `PolicyService:GetPolicyInfoForPlayerAsync` checked on the server; restricted or failed → no paid option (Rule 8).
- [ ] If items from paid rolls can be traded, check the policy info's `IsPaidItemTradingAllowed` for each player before allowing trades of paid items.
- [ ] The best tier is reachable with soft currency (Rule 29).
- [ ] No near-miss animations (Rule 27); no casino framing (Rule 28).
- [ ] No fake timers on limited pools (Rule 35).
- [ ] Merchant re-read Roblox's current policy on paid random items for this release and noted the date in `decisions.md`.

## Examples from top games

### Variants make every result a small roll
**Game:** Grow a Garden ([2][1])
**Shows:** guides say heavier produce sells for more and that variants such as Gold and Rainbow are worth more than base crops.
**Why it works:** even a common crop can come out special, so every harvest has a little anticipation.
**Steal:** a variant layer with clear multipliers, shown on the item.
**Avoid:** variants so frequent that the base item feels like a failure.

### Player actions shift the outcome
**Game:** Grow a Garden ([1][2])
**Shows:** guides describe watering cans and sprinklers improving the size and weight of the harvest.
**Why it works:** the player has some agency over the random outcome, which makes good results feel earned.
**Steal:** items or actions that improve the distribution (more weight, better variant chance), shown as "+X% size".
**Avoid:** boosts with invisible effects; show the improvement.

### A rolled shop that refreshes in minutes
**Game:** Grow a Garden ([1][2][3])
**Shows:** guides describe seeds with limited stock that refreshes every five minutes; a sold-out seed may return soon.
**Why it works:** the shop itself becomes a small RNG check-in every few minutes.
**Steal:** server-wide stock rolled per time window with a visible restock timer (Rule 24).
**Avoid:** starter seeds going out of stock for new players.

### Guides disagree when the game doesn't show tiers clearly
**Game:** Grow a Garden ([1][2][4][5][6])
**Shows:** beginner guides list seed rarity tiers differently (for example, which seeds count as Legendary).
**Why it works (as a lesson):** players and guide writers rely on the game's own tier display; if it is unclear or changes, the community's information splits.
**Steal:** a clear tier label and color on every item card, in the shop and in the index, read from Config.
**Avoid:** tiers that only appear in one menu or change without notes (Rule 34).

### A free hatch as the entry ticket
**Game:** Pet Simulator 99, Good vs Evil event ([7])
**Shows:** entering the event required opening a special free Fate egg that gave one of two pets.
**Why it works:** a tiny two-outcome roll is a satisfying, low-stakes first reveal that introduces the event's theme.
**Steal:** a free, small-pool roll as the first action of a new area or event.
**Avoid:** making the outcome of a mandatory roll matter too much for progress.

### Rarer means stronger, and stays useful
**Game:** Pet Simulator 99, Good vs Evil event ([7])
**Shows:** the guide says the event's first egg could give one of three pets, and the pets with the lowest rates were the most powerful and remained effective for the current and following areas.
**Why it works:** the chase has a clear payoff that lasts.
**Steal:** power scales with rarity within a pool, and rare results carry into the next zone (Rule 25).
**Avoid:** rare results that are obsolete one zone later.

### Tutorial quests hand out pets
**Game:** Pet Simulator 99 ([8])
**Shows:** a beginner guide recommends following tutorial quests because they hand out free pets and starter currency.
**Why it works:** new players get their first collection items without spending, so the first roll they pay for is an informed choice.
**Steal:** curated free pets in the tutorial (Rule 26).
**Avoid:** tutorial pets better than anything the player can roll for hours.

### The first hatch is part of the tutorial
**Game:** Adopt Me! ([12])
**Shows:** a guide describes a short tutorial for new players that walks them through getting an egg and hatching their first pet.
**Why it works:** the game's central collectible arrives in the first minutes, with no risk.
**Steal:** a guaranteed first pet inside the tutorial.
**Avoid:** a first hatch that can roll the least interesting result.

### Time to hatch, sold as a shortcut
**Game:** Adopt Me! ([12][13])
**Shows:** guides describe eggs hatching after the player completes objectives, with an option to pay Robux to hatch immediately.
**Why it works:** the paid option sells time, not better odds, and free players get the same result by playing.
**Steal:** sell speed and convenience around RNG, not better odds that only payers get (Rule 29).
**Avoid:** shortcuts that skip the fun part of the loop.

### Daily tasks with a chance at a special egg
**Game:** Adopt Me! ([13][14])
**Shows:** guides describe the Task Board, which refreshes every 24 hours, giving small Bucks rewards and a chance at a special egg for completing all tasks; the guides name different eggs (Aztec, Endangered), likely because the reward changed over time.
**Why it works:** daily play feeds the collection chase without requiring purchases.
**Steal:** a daily board whose top reward is a free roll from a special pool.
**Avoid:** changing the reward without telling players (Rule 34).

### The random vendor sits where players arrive
**Game:** Blox Fruits ([17][18])
**Shows:** the map guide lists a Blox Fruits Dealer Cousin NPC among the key figures on the Jungle, the island new players usually reach after the starter islands.
**Why it works:** players arrive at the second island with their first savings, right where a random-reward vendor is.
**Steal:** place a free or soft-currency roll at the first new zone, so the first earned money can be spent on a chase.
**Avoid:** putting the only roll vendor deep into the map.

### Starter offers are part of the early experience
**Game:** 26 leading mobile apps reviewed by Liquid & Grit ([29])
**Shows:** the FTUE toolkit's method included buying each app's first two starter offers alongside playtesting the first six sessions.
**Why it works (as a lesson):** what you sell first, and how, is part of onboarding and gets studied as such.
**Steal:** make the first paid offer in an RNG game a clear, deterministic item (a luck potion, a pet pack with known contents), not a mystery box.
**Avoid:** a paid mystery box as the first thing a new player is offered.

## By genre

### Simulator
- **Random sources:** eggs (soft currency), rare breakables, crits, variants (Golden/Rainbow via fusing).
- **Rules:** egg per 2-5 min early; Legendary median within the first session's later half; fuse duplicates. Rule 25 matters most: gates tuned for common pets. See [[Genre - Simulator]].

### Tycoon
- **Random sources:** mystery droppers, crate drops on the conveyor, a daily spin.
- **Rules:** RNG adds spice but income must stay predictable; random bonuses ≤ 10-20% of income. See [[Genre - Tycoon]].

### Obby
- **Random sources:** reward chests at world ends, trail crates.
- **Rules:** never randomize the course difficulty for the first worlds; random cosmetics only. See [[Genre - Obby]].

### Roleplay and life sim
- **Random sources:** pet eggs, gift boxes, furniture crates, daily rewards.
- **Rules:** collections are the long layer; trading makes rarity social, so paid-item trading follows PolicyService. See [[Genre - Roleplay and Life Sim]].

### Action and combat
- **Random sources:** enemy drops, gear rolls with stats, crits.
- **Rules:** bad-luck protection on boss drops (streak pity); show drop rates in the boss info panel. See [[Genre - Action and Combat]].

### Battlegrounds
- **Random sources:** character/moveset spins, cosmetic crates.
- **Rules:** if movesets are rolled, every moveset must be viable; let players reroll with soft currency; never pay-only. See [[Genre - Battlegrounds]].

### Survival
- **Random sources:** loot containers, resource node quality, weather/events.
- **Rules:** the first night's loot is curated; rare resources are visible on nodes (sparkle) so finding them is skill plus luck. See [[Genre - Survival]].

### Horror
- **Random sources:** room generation, item spawns, monster timing.
- **Rules:** procedural rooms use seeded generation the server controls; the first run uses a gentler seed set; randomness never creates unwinnable runs. See [[Genre - Horror]].

### Tower defense
- **Random sources:** unit summons (banners), traits/rerolls, map drops.
- **Rules:** banners show odds and pity; a starter unit set is guaranteed; summon currency earnable by playing. See [[Genre - Tower Defense]].

### RNG and collection
- **Random sources:** the roll itself (aura/item), biomes/events that change odds, crafting.
- **Rules:** everything in this chapter applies at full strength: fast reveals, auto-roll early, sequential-roll audits (Rule 16), true odds in the index, global announcements for top tiers. See [[Genre - RNG and Collection]].

### Shooter
- **Random sources:** weapon skin crates, drop crates in matches.
- **Rules:** gameplay-affecting stats are never random-paid; skins only. See [[Genre - Shooter]].

### Racing and vehicles
- **Random sources:** car crates, part rolls, random events on tracks.
- **Rules:** performance parts are earnable deterministically; random gives cosmetics or duplicates convert to parts currency. See [[Genre - Racing and Vehicles]].

### Sports
- **Random sources:** player cards/packs, cosmetic crates, abilities.
- **Rules:** if abilities are rolled, matchmaking must account for them; disclose pack odds; let duplicates convert. See [[Genre - Sports]].

### Party and social hangout
- **Random sources:** minigame selection, prize wheels, emote crates.
- **Rules:** prize wheels show segment sizes equal to their real odds; no near-miss slowing (Rule 27). See [[Genre - Party and Social Hangout]].

### Story and puzzle
- **Random sources:** collectible spawns, alternate endings.
- **Rules:** puzzle solutions are never random; collectibles can be. See [[Genre - Story and Puzzle]].

### Farming and fishing
- **Random sources:** catch tables per spot/bait/weather, crop weight and variants/mutations, shop restocks.
- **Rules:** catch tables are pools with weights per location; bait and weather act as luck on specific entries; mutations show their trigger; restocks per Rule 24. Grow a Garden-style variants and weight ([1][2]) are the template. See [[Genre - Farming and Fishing]].

## Luau

Modern Luau: the `task` library, `--!strict` in shared modules, `Instance.new` with `Parent` set last, and only the server calling `Roll.pick` for real rewards. `PlayerData` stands for the game's server-side data module ([[13 Building It Right]]).

### Tiers and pools (shared)

```lua
--!strict
-- ReplicatedStorage/Shared/Tiers.lua
local Tiers = {
	Order = { "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Secret" },
	Rank = { Common = 1, Uncommon = 2, Rare = 3, Epic = 4, Legendary = 5, Mythic = 6, Secret = 7 },
	Color = {
		Common = Color3.fromHex("B4B4B4"), Uncommon = Color3.fromHex("5BD45B"), Rare = Color3.fromHex("3FA9F5"),
		Epic = Color3.fromHex("A659F0"), Legendary = Color3.fromHex("FFB020"), Mythic = Color3.fromHex("FF4D6D"),
		Secret = Color3.fromHex("111111"),
	},
	RevealSeconds = { Common = 0.4, Uncommon = 0.6, Rare = 1.0, Epic = 1.5, Legendary = 2.2, Mythic = 3.0, Secret = 3.0 },
	Particles = { Common = 4, Uncommon = 10, Rare = 20, Epic = 30, Legendary = 45, Mythic = 60, Secret = 60 },
	AnnounceServerBelow = 1 / 10_000,   -- chance below which the server is told
	AnnounceGlobalBelow = 1 / 1_000_000, -- chance below which every server is told
}
return table.freeze(Tiers)
```

```lua
--!strict
-- ReplicatedStorage/Shared/Config/Eggs.lua
return table.freeze({
	StarterEgg = { -- free, tutorial only, never sold (Rule 26)
		NeverPaid = true,
		Entries = {
			{ Id = "Fox", Tier = "Rare", Weight = 70 },
			{ Id = "Owl", Tier = "Epic", Weight = 30 },
		},
	},
	BasicEgg = {
		Cost = { Currency = "Coins", Amount = 250 },
		Pity = { Rolls = 150, MinTier = "Legendary", SoftStart = 100, SoftStep = 0.05 },
		Variants = {
			{ Id = "Normal", Weight = 97 },
			{ Id = "Golden", Weight = 2.5, Mult = 2 },
			{ Id = "Rainbow", Weight = 0.5, Mult = 5 },
		},
		Entries = {
			{ Id = "Dog",     Tier = "Common",    Weight = 60 },
			{ Id = "Cat",     Tier = "Uncommon",  Weight = 25 },
			{ Id = "Fox",     Tier = "Rare",      Weight = 10,  Lucky = true },
			{ Id = "Owl",     Tier = "Epic",      Weight = 4,   Lucky = true },
			{ Id = "Dragon",  Tier = "Legendary", Weight = 0.9, Lucky = true },
			{ Id = "Phoenix", Tier = "Mythic",    Weight = 0.1, Lucky = true },
		},
	},
})
```

### Roll math (shared, pure)

```lua
--!strict
-- ReplicatedStorage/Shared/Roll.lua. The odds UI may call weights(); only the server calls pick() for rewards.
local Roll = {}
local rng = Random.new() -- one generator per server/client, created once; never reseeded per roll

export type Entry = { Id: string, Tier: string, Weight: number, Lucky: boolean? }

function Roll.weights(entries: {Entry}, luck: number): ({number}, number)
	local out, total = table.create(#entries), 0
	for i, e in entries do
		out[i] = if e.Lucky then e.Weight * luck else e.Weight
		total += out[i]
	end
	return out, total
end

function Roll.pickWeighted<T>(items: {T}, weights: {number}, total: number): T
	local r, acc = rng:NextNumber() * total, 0
	for i, w in weights do
		acc += w
		if r < acc then return items[i] end
	end
	return items[#items] -- floating-point safety
end

function Roll.pick(entries: {Entry}, luck: number?): Entry
	local weights, total = Roll.weights(entries, luck or 1)
	return Roll.pickWeighted(entries, weights, total)
end

-- "1 in N" sequential rolls, rarest first. Returns nil when nothing hits (give the default).
export type ChanceEntry = { Id: string, OneIn: number }
function Roll.sequential(entries: {ChanceEntry}, luck: number, maxChance: number?): ChanceEntry?
	local cap = maxChance or 0.5 -- stops high luck from making later entries unreachable
	for _, e in entries do
		if rng:NextNumber() < math.min(luck / e.OneIn, cap) then return e end
	end
	return nil
end

-- True probabilities of the sequential scheme, for the odds UI and audits.
function Roll.sequentialOdds(entries: {ChanceEntry}, luck: number, maxChance: number?): ({number}, number)
	local cap, remaining, out = maxChance or 0.5, 1, table.create(#entries)
	for i, e in entries do
		local p = math.min(luck / e.OneIn, cap)
		out[i] = remaining * p
		remaining *= 1 - p
	end
	return out, remaining -- remaining = chance of the default result
end

return Roll
```

### Pity (hard and soft) and variants (server)

```lua
--!strict
-- ServerScriptService/Rolling/Pity.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Roll = require(ReplicatedStorage.Shared.Roll)
local Tiers = require(ReplicatedStorage.Shared.Tiers)

local Pity = {}

-- data.Pity[eggId] is saved with the player's data. luck is the server-computed total.
function Pity.roll(data: any, eggId: string, egg: any, luck: number): Roll.Entry
	local count = (data.Pity[eggId] or 0) + 1
	data.Pity[eggId] = count
	local rule = egg.Pity
	local entries = egg.Entries
	if rule then
		local minRank = Tiers.Rank[rule.MinTier]
		if count >= rule.Rolls then -- hard pity: only MinTier or better
			local pool = {}
			for _, e in entries do
				if Tiers.Rank[e.Tier] >= minRank then table.insert(pool, e) end
			end
			entries = pool
		elseif rule.SoftStart and count > rule.SoftStart then -- soft pity: extra luck that grows each roll
			luck *= 1 + rule.SoftStep * (count - rule.SoftStart)
		end
		local entry = Roll.pick(entries, luck)
		if Tiers.Rank[entry.Tier] >= minRank then data.Pity[eggId] = 0 end
		return entry
	end
	return Roll.pick(entries, luck)
end

local variantRng = Random.new()
function Pity.variant(egg: any): (string, number)
	local list = egg.Variants
	if not list then return "Normal", 1 end
	local total = 0
	for _, v in list do total += v.Weight end
	local r, acc = variantRng:NextNumber() * total, 0
	for _, v in list do
		acc += v.Weight
		if r < acc then return v.Id, v.Mult or 1 end
	end
	return "Normal", 1
end

return Pity
```

### Server: the roll service

```lua
-- ServerScriptService/Rolling/EggService.server.lua
local AnalyticsService = game:GetService("AnalyticsService")
local MessagingService = game:GetService("MessagingService")
local Players = game:GetService("Players")
local PolicyService = game:GetService("PolicyService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Eggs = require(ReplicatedStorage.Shared.Config.Eggs)
local Roll = require(ReplicatedStorage.Shared.Roll)
local Tiers = require(ReplicatedStorage.Shared.Tiers)
local Pity = require(ServerScriptService.Rolling.Pity)
local PlayerData = require(ServerScriptService.PlayerData)
local Remotes = ReplicatedStorage.Remotes

local ALLOWED_COUNTS = { [1] = true, [3] = true, [8] = true }
local COOLDOWN, MAX_DISTANCE = 0.5, 15
local lastRoll: {[Player]: number} = {}
local paidRandomOk: {[Player]: boolean} = {}

-- Fail closed: if the policy call fails, treat paid random items as restricted.
local function canOfferPaidRandom(player: Player): boolean
	local cached = paidRandomOk[player]
	if cached ~= nil then return cached end
	local ok, info = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
	local allowed = ok and info ~= nil and not info.ArePaidRandomItemsRestricted
	paidRandomOk[player] = allowed
	return allowed
end
Remotes.CanBuyPaidRolls.OnServerInvoke = canOfferPaidRandom -- the UI hides Robux options when false

local function chanceOf(egg, entry, luck: number): number
	local weights, total = Roll.weights(egg.Entries, luck)
	for i, e in egg.Entries do
		if e == entry then return weights[i] / total end
	end
	return 1
end

local function announce(player: Player, entry, chance: number)
	local text = string.format("%s hatched a %s %s (1 in %d)!", player.DisplayName, entry.Tier:upper(), entry.Id, math.round(1 / chance))
	if chance < Tiers.AnnounceGlobalBelow then
		pcall(MessagingService.PublishAsync, MessagingService, "RareHatch", { Text = text, Tier = entry.Tier })
	elseif chance < Tiers.AnnounceServerBelow then
		Remotes.Announce:FireAllClients(text, entry.Tier)
	end
end

Remotes.OpenEgg.OnServerInvoke = function(player: Player, eggId: unknown, count: unknown)
	if typeof(eggId) ~= "string" or typeof(count) ~= "number" then return nil end
	local egg = Eggs[eggId]
	if not egg or egg.NeverPaid or not ALLOWED_COUNTS[count] then return nil end -- rejects NaN and fractions too

	local now = os.clock()
	if now - (lastRoll[player] or 0) < COOLDOWN then return nil end
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	local eggModel = workspace.Eggs:FindFirstChild(eggId)
	if not root or not eggModel or (root.Position - eggModel:GetPivot().Position).Magnitude > MAX_DISTANCE then return nil end

	local data = PlayerData.get(player)
	if not data or #data.Pets + count > data.MaxPets then return nil end
	local price = egg.Cost.Amount * count
	if (data[egg.Cost.Currency] or 0) < price then return nil end
	lastRoll[player] = now

	-- Deduct, roll and grant in one synchronous step; autosave picks it up.
	data[egg.Cost.Currency] -= price
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, egg.Cost.Currency, price,
		data[egg.Cost.Currency], Enum.AnalyticsEconomyTransactionType.Shop.Name, eggId)

	local luck = PlayerData.luck(player) -- server-side: passes, potions (server timestamps), events; capped
	local results = table.create(count)
	for i = 1, count do
		local entry = Pity.roll(data, eggId, egg, luck)
		local variant, mult = Pity.variant(egg)
		table.insert(data.Pets, { Id = entry.Id, Variant = variant, Mult = mult })
		results[i] = { Id = entry.Id, Tier = entry.Tier, Variant = variant }
		local chance = chanceOf(egg, entry, luck)
		if chance < 1 / 1000 then
			AnalyticsService:LogCustomEvent(player, "RareHit", 1, {
				[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = eggId,
				[Enum.AnalyticsCustomFieldKeys.CustomField02.Name] = entry.Tier,
			})
		end
		announce(player, entry, chance)
	end
	PlayerData.markDirty(player)
	return results, data.Pity[eggId]
end

-- Cross-server announcements arrive here and go to this server's clients.
pcall(MessagingService.SubscribeAsync, MessagingService, "RareHatch", function(message)
	local payload = message.Data
	if type(payload) == "table" and type(payload.Text) == "string" and type(payload.Tier) == "string" then
		Remotes.Announce:FireAllClients(payload.Text, payload.Tier)
	end
end)

Players.PlayerRemoving:Connect(function(player)
	lastRoll[player] = nil
	paidRandomOk[player] = nil
end)
```

Robux purchases that grant rolls (or luck) are Developer Products handled in `MarketplaceService.ProcessReceipt`, which checks `canOfferPaidRandom` before granting random content and records the receipt id so a retried receipt is never granted twice ([[09 Shops and Monetization]]). The cooldown, the server message cap (Rule 21) and MessagingService's own rate limits should be respected; queue announcements and drop extras rather than retrying in a loop.

### Client: showing announcements in chat

```lua
-- StarterPlayerScripts/Announcements.client.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TextChatService = game:GetService("TextChatService")
local Tiers = require(ReplicatedStorage.Shared.Tiers)

local channel = TextChatService:WaitForChild("TextChannels"):WaitForChild("RBXGeneral")
local lastShown = 0

ReplicatedStorage.Remotes.Announce.OnClientEvent:Connect(function(text: string, tier: string)
	if os.clock() - lastShown < 10 then return end -- client-side cap as well
	lastShown = os.clock()
	local color = (Tiers.Color[tier] or Color3.new(1, 1, 1)):ToHex()
	channel:DisplaySystemMessage(string.format('<font color="#%s">[Server] %s</font>', color, text))
end)
```

### Client: odds formatting for the board and confirm panel

```lua
--!strict
-- ReplicatedStorage/Shared/OddsText.lua
local Roll = require(script.Parent.Roll)

local OddsText = {}

local function commas(n: number): string
	local s = tostring(math.floor(n))
	local formatted = s:reverse():gsub("(%d%d%d)", "%1,"):reverse()
	return (formatted:gsub("^,", ""))
end

function OddsText.format(p: number): string
	if p <= 0 then return "—" end
	if p < 0.01 then return "1 in " .. commas(math.round(1 / p)) end
	return string.format("%.1f%%", p * 100)
end

-- Returns rows {Id, Tier, Text} with the player's luck applied, and checks the rounded sum.
function OddsText.rows(entries: {Roll.Entry}, luck: number): {{Id: string, Tier: string, Text: string}}
	local weights, total = Roll.weights(entries, luck)
	local rows, shownSum = {}, 0
	for i, e in entries do
		local p = weights[i] / total
		if p >= 0.01 then shownSum += math.round(p * 1000) / 10 end
		table.insert(rows, { Id = e.Id, Tier = e.Tier, Text = OddsText.format(p) })
	end
	if math.abs(shownSum - 100) > 1.5 then
		warn("[Odds] rounded percentages sum to " .. shownSum .. "; check the table") -- small "1 in N" rows explain up to ~1%
	end
	return rows
end

return OddsText
```

### Server: restock rolled per time window (same in every server)

```lua
--!strict
-- ServerScriptService/Shop/Restock.lua
local Restock = {}
local WINDOW = 300 -- seconds (5 minutes)

export type StockEntry = { Id: string, Chance: number, Min: number, Max: number, AlwaysInStock: boolean? }

function Restock.current(table_: {StockEntry}): ({[string]: number}, number)
	local window = os.time() // WINDOW
	local rng = Random.new(window) -- same seed in every server for this window
	local stock = {}
	for _, e in table_ do
		local roll = rng:NextNumber() -- always consume one number per entry so results stay aligned
		local count = rng:NextInteger(e.Min, e.Max)
		if e.AlwaysInStock or roll < e.Chance then stock[e.Id] = count end
	end
	local secondsLeft = (window + 1) * WINDOW - os.time()
	return stock, secondsLeft
end

return Restock
```

Per-player purchase counts within a window are stored on the server (`data.Bought[windowIndex][id]`) so rejoining never refreshes a player's stock.

### Audit: observed vs expected, and the pity path

```lua
-- Command bar or a test Script. Run after every change; save the output in games/<slug>/sim/.
local RS = game:GetService("ReplicatedStorage")
local Roll = require(RS.Shared.Roll)
local Tiers = require(RS.Shared.Tiers)
local egg = require(RS.Shared.Config.Eggs).BasicEgg
local N, LUCK = 1_000_000, 1

local weights, total = Roll.weights(egg.Entries, LUCK)
local counts = {}
for i = 1, N do
	local e = Roll.pick(egg.Entries, LUCK)
	counts[e.Id] = (counts[e.Id] or 0) + 1
	if i % 100_000 == 0 then task.wait() end -- avoid script timeout
end
for i, e in egg.Entries do
	local p, observed = weights[i] / total, (counts[e.Id] or 0) / N
	local sd = math.sqrt(p * (1 - p) / N)
	local flag = if math.abs(observed - p) > 4 * sd then "  <-- CHECK" else ""
	print(string.format("%-8s expected %8.4f%%  observed %8.4f%%%s", e.Id, p * 100, observed * 100, flag))
end

-- Pity path: rolls until MinTier+, many times; max must never exceed Pity.Rolls.
local minRank, rule = Tiers.Rank[egg.Pity.MinTier], egg.Pity
local trials, sum, maxSeen = 20_000, 0, 0
for t = 1, trials do
	local count = 0
	repeat
		count += 1
		local entries, luck = egg.Entries, LUCK
		if count >= rule.Rolls then
			entries = {}
			for _, e in egg.Entries do if Tiers.Rank[e.Tier] >= minRank then table.insert(entries, e) end end
		elseif rule.SoftStart and count > rule.SoftStart then
			luck *= 1 + rule.SoftStep * (count - rule.SoftStart)
		end
		local hit = Tiers.Rank[Roll.pick(entries, luck).Tier] >= minRank
	until hit
	sum += count
	maxSeen = math.max(maxSeen, count)
	if t % 2_000 == 0 then task.wait() end
end
print(string.format("Pity: average %.1f rolls, max %d (limit %d)%s", sum / trials, maxSeen, rule.Rolls,
	if maxSeen > rule.Rolls then "  <-- BUG" else ""))
```

## Checklist

- [ ] Every random source is listed in `plan.md` with free/paid, currency, roll rate and top-tier role
- [ ] Every roll table is in `ReplicatedStorage.Shared.Config`, stored as weights, frozen
- [ ] `Roll.pick` is only called from server scripts; no LocalScript decides a result
- [ ] One `Random.new()` per server for rolls; seeded generators only for cross-server restocks
- [ ] Tier ladder steps are 3-10x; `economy.md` has median and 95% time to each tier
- [ ] Tier colors come from `Shared.Tiers` everywhere (cards, reveals, chat, index, world)
- [ ] Reveal durations follow the tier spec, are skippable after 1 s, and multi-open shows a grid
- [ ] The roll remote validates types, pool id, allowed counts, cooldown, distance, inventory space and currency
- [ ] Currency is deducted and results granted on the server before the client reveal
- [ ] Luck only multiplies `Lucky` entries, sources stack additively, total is capped, timers are server timestamps
- [ ] Sequential "1 in N" odds shown are the simulated true odds
- [ ] Pity counters are saved per pool, shown in the UI, and the pity sim's max ≤ the limit
- [ ] Duplicates have a use (fuse, shards, XP)
- [ ] The first free rolls use a starter table that can't be bought
- [ ] Odds UI uses `Roll.weights` with current luck; "1 in N" below 1%; rounded sum ≈ 100%
- [ ] Every paid random item shows all odds before purchase, secret tiers, variants and pity rules included
- [ ] `ArePaidRandomItemsRestricted` checked on the server before any paid roll; errors fail closed
- [ ] No near-miss animations and no casino imagery or words
- [ ] Rare-result announcements are capped per server and globally
- [ ] Audit and pity sim outputs for the current tables are saved in `sim/`
- [ ] Odds changes appear in the changelog and update notes

## Common mistakes

- `math.random` in a LocalScript deciding drops, or the client sending the tier it "rolled".
- Reseeding the generator every roll with `os.time()`.
- Displayed odds computed separately from the real table, so they drift apart.
- Luck that multiplies every entry, commons included, so it changes nothing.
- "x2 luck" advertised as double chance when renormalization makes it less.
- Showing nominal "1 in N" for sequential rolls whose true odds are lower.
- Top tiers so rare that no player ever sees them.
- A pity counter that resets on rejoin, or a pity limit the sim shows being exceeded.
- Secret items or variants in a paid roll with no disclosed odds.
- Treating a failed PolicyService call as "allowed".
- Long, unskippable reveal animations once players open many eggs.
- Reveals that fake a near miss, or wheels that slow past the rare slot.
- Duplicates with no use.
- Early zone gates that require rare pets, so unlucky players hit a wall.
- Per-player restock rolls that can be rerolled by rejoining.
- Announcing every Rare to the whole server.
- Silent odds changes after launch.
- A custom analytics event per roll with unique ids in custom fields.

## References

[1] Complete Grow a Garden Beginner's Guide — https://progameguides.com/roblox/complete-grow-a-garden-beginners-guide-seeds-weather-events-gears/ — seeds with limited stock refreshing every five minutes; watering and sprinklers improving size and weight.
[2] Grow a Garden: A beginner's guide — https://sportskeeda.com/roblox-news/grow-garden-a-beginner-s-guide — heavier produce sells for more; Gold and Rainbow variants worth more than base crops.
[3] Complete Beginners Guide To Grow a Garden Roblox — https://deltiasgaming.com/?p=201040 — the Seed Shop and stock behavior for beginners.
[4] Complete beginners guide for Grow a Garden — https://itemlevel.net/complete-beginners-guide-for-grow-a-garden-roblox/ — seed rarity tiers as listed by one guide (guides disagree).
[5] Grow a Garden beginners guide — https://avergames.com/games/grow-a-garden/beginners-guide — another beginner overview of seeds and rarity.
[6] Roblox Grow a Garden beginner guide — https://thebackdash.com/gaming/roblox-grow-a-garden-beginner-guide/ — beginner overview of seeds and selling.
[7] Pet Simulator 99: Good vs Evil 2024 Event guide — https://sportskeeda.com/roblox-news/pet-simulator-99-good-vs-evil-2024-event-guide — free Fate egg with two outcomes on entry; first egg's lowest-rate pets strongest and useful into later areas.
[8] Pet Simulator 99 beginner guide — https://earnaldo.com/blog/pet-simulator-99-beginner-guide — tutorial quests give free pets and starter currency.
[9] Roblox Pet Simulator 99 Beginner's Guide — https://www.rpgstash.com/blog/roblox-pet-simulator-99-beginners-guide — beginner advice on eggs and progression.
[10] Pet Simulator 99 Beginner Guide — https://dungeonpath.com/tags/ps99-beginner/ — beginner progression advice on areas and pets.
[11] Ranks (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Ranks_(Pet_Simulator_99) — the game's rank progression, a deterministic track beside the random one.
[12] Adopt Me beginners hints and tips — https://www.supercheats.com/roblox-adopt-me-walkthrough-guide/beginners-hints-and-tips — tutorial walks new players through hatching their first pet; eggs hatch through objectives with a Robux skip.
[13] Adopt Me: how to get free pets without Robux — https://allthings.how/adopt-me-how-to-get-free-pets-without-robux/ — Task Board refreshing every 24 hours with a daily egg reward.
[14] Adopt Me guide: Endangered Egg — https://www.filmink.com.au/adopt-me-guide-what-is-the-endangered-egg-how-to-get-it-hatch-chances-trading-tips/ — Task Board rewards of Bucks and a chance at an Endangered Egg; hatch chances and trading.
[15] Free pets in Adopt Me — https://esports.gg/guides/roblox/free-pets-adopt-me/ — ways to get pets without Robux, showing free paths to the collection.
[16] What was the First Egg in Roblox Adopt Me? — https://progameguides.com/roblox/what-was-the-first-egg-in-roblox-adopt-me/ — history of Adopt Me's eggs, showing pools changing over time.
[17] Blox Fruits map — https://www.pocketgamer.com/roblox/blox-fruits-map/ — the Jungle's key NPCs, including the Blox Fruits Dealer Cousin.
[18] Blox Fruits guide — https://www.pcgamesn.com/blox-fruits/guide — beginner flow from the starter islands onward.
[19] AnalyticsService — https://create.roblox.com/docs/reference/engine/classes/AnalyticsService — custom and economy event logging used for roll telemetry.
[20] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events — custom field keys and the 8,000 unique-combination limit; server-only logging.
[21] Analytics dashboard — https://create.roblox.com/docs/production/analytics/analytics-dashboard — monetization and retention KPIs to watch after odds changes.
[22] Highlight — https://create.roblox.com/docs/reference/engine/classes/Highlight — Highlight properties for reveal glows on world items.
[23] Highlighting objects — https://create.roblox.com/docs/effects/highlighting — fill and outline settings for tier-colored highlights.
[24] Beam — https://create.roblox.com/docs/reference/engine/classes/Beam — beams for reveal rays and light shafts.
[25] Device Simulator — https://create.roblox.com/docs/studio/device-simulator — testing reveal timing and odds boards on phone profiles.
[26] Onboarding techniques — https://create.roblox.com/docs/production/game-design/onboarding-techniques — tuning values with Configs and Experiments.
[27] Onboarding — https://create.roblox.com/docs/production/game-design/onboarding — leaving players wanting more, which the visible top tier does.
[28] 10 first-time user experience tips for games — https://unity.com/how-to/10-first-time-user-experience-tips-games — first experiences convince players the game is worth their time; curated first rolls serve that.
[29] First-Time User Experience (FTUE) Toolkit — https://liquidandgrit.com/first-time-user-experience-ftue-toolkit — methodology that includes each app's first two starter offers.
[30] ContentProvider — https://create.roblox.com/docs/reference/engine/classes/ContentProvider — preloading essential UI and assets, such as reveal effects.

Related: [[00 Start Here]] · [[00 For Any AI]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[07 Characters, VFX and Assets]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
