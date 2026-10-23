---
tags: [vault, genre, farming, gardening, fishing, crops, mutations, weather, restock, bestiary, cozy]
for: [lead, pulse, architect, builder, balance, scenic, frame, playtest, kid-tester]
also: [merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Farming and Fishing

Farming and fishing games are "wait, then reap" games: plant something or cast a line, let time and chance work, then collect a result that is sometimes ordinary and sometimes amazing. On Roblox they are a proven giant: Grow a Garden, built in about three days, became the first Roblox game past 5 million concurrent players on May 17, 2025 [1][2], and AP reported millions of people playing it daily [3]. Fishing games such as Fisch built deep collection games around a bestiary, rods, bait and mutations [4][5].

The crew builds four shapes: **garden/farm sims** (your own plot, seeds from a restocking shop, crops that grow in real time, weather mutations; the Grow a Garden shape), **fishing collectors** (cast, bite, reel minigame, a bestiary per location, rods and bait; the Fisch shape), **fishing or farm tycoons** (a pier or farm business that earns while you play; the My Fishing Pier shape [6]), and **cozy hybrids** (farm + fish + cook + decorate).

What makes them work is **the result roll** (weight, rarity and mutation make every harvest or catch a small lottery), **real-time growth** (a reason to come back later), **shared server moments** (a weather event or restock everyone sees at once), and **a visible collection** (a bestiary or a garden other players can walk through). What kills them: a client that decides the roll, per-server restocks, and one lucky mutation worth a month of play.

Read this page before pitching or planning any farming, gardening, fishing or harvesting game, and before adding a fishing or crop system to another genre. Pair it with [[03 Rarity and RNG]], [[04 Progression and Economy]], [[10 Retention and Social]], [[12 Live Ops and Launch]] and [[Genre - Simulator]].

## 1. What it is and why it works on Roblox

**The audience** (design assumptions):
- **Young and casual players** (about 7-13) who want calm, readable progress: plant, water, sell, buy a better seed. Grow a Garden's loop is exactly buy, plant, harvest, sell [7][8].
- **Collectors** who chase rare results: Gold and Rainbow crop variants worth more [8], fish mutations that change sale price [5][9], a bestiary to fill [4].
- **Social players** who show off a garden, trade, and gather when a weather event or restock hits.
- **Returners** who check in a few times a day because crops grew while they were away.

**Session shape.** Short and frequent: 10-30 minute sessions several times a day for farming (plant, leave, return); 20-60 minutes for fishing (casting is the activity). Studio targets: first harvest or first catch under 60 s, first sale under 2 minutes, first upgrade (seed or rod) in session 1, a reason to return within 4 hours.

**Why players come back.**
1. **Things grew while you were gone.** The plot is fuller than you left it.
2. **The shop restocked.** Grow a Garden's Seed Shop has limited stock refreshing every five minutes [7], and fan sites publish restock predictors and timers for the sequel [10].
3. **Weather and events.** Server-wide weather adds mutations (rain → Wet, storms → Shocked in Grow a Garden guides) [11][12].
4. **Collection.** Every bestiary slot and every mutation combo is a goal [4][5].
5. **Weekly updates.** Grow a Garden held a weekly Saturday update schedule [13], though its team later said weekly events were hard to keep fresh and shifted toward depth [14].

**Why it works on Roblox.** Plots per player fit Roblox servers (6-8 plots around shared shops), real-time growth uses `os.time()` and DataStores, shared events give a server a reason to talk, and the verbs (walk, tap, hold) work on any device.

## 2. The core loop

**Loop statement (garden):**
> Players **buy seeds from a restocking shop and plant them on their plot**, wait for them to **grow and maybe mutate**, then **harvest and sell** for **coins**, which buy **rarer seeds, gear and plot space** so they can **grow bigger, rarer crops** [7][8][7].

**Loop statement (fishing):**
> Players **cast and win a reel minigame** to **catch fish of random rarity, weight and mutation**, which they **sell or log in the bestiary** for **coins and rewards**, which buy **better rods, bait and new locations** so they can **catch rarer fish** [4][5].

**Loop statement (pier/farm tycoon):**
> Players **catch or grow goods and stock their business**, which **earns while they play**, so they can **expand the business and unlock new goods** [6].

| Layer | Time scale | Garden | Fishing |
|---|---|---|---|
| Micro | 0.5-3 s | Plant tap, water splash, harvest pop | Cast splash, bite "!", reel tension |
| Short | 30 s-5 min | A crop ripens, a restock | One catch (10-40 s), a sale |
| Session | 10-60 min | A new seed tier, a weather event | A new rod, a bestiary page |
| Long | days-weeks | Mutation collection, a full plot of rares | Every location's bestiary, mythic fish |

### Farming and fishing rules

1. **The first harvest or catch happens within 60 seconds.**
   Why: the result roll is the hook; a player who hasn't seen one doesn't know the game.
   How: a free starter crop that ripens in 20 s (garden) or a starter dock where the first bite comes in 3 s and the first minigame is easy (fishing). Kid Tester times it on a phone.

2. **The server rolls every result: what bites, what grows, its weight, its rarity, its mutation.**
   Why: a client that decides results prints mythic fish.
   How: fish are rolled on the server at cast time; crop weight is rolled at plant time; mutations are applied by server events. The client only animates results it is told about.

3. **Crops grow on wall-clock time, including while the player is offline.**
   Why: "it grew while I was away" is the return hook.
   How: store `plantedAt = os.time()` and `growSeconds` per crop; ripeness = `os.time() - plantedAt >= growSeconds`; the client derives the visual stage from the same numbers (section 11).

4. **Shops restock on a shared global clock, identical in every server.**
   Why: different stock per server causes server-hopping and breaks the economy.
   How: restock index `k = floor(os.time() / 300)`; stock for index `k` is rolled with `Random.new(k * 7919 + shopSalt)`, so every server computes the same stock without coordination. Show the countdown to the next restock.

5. **Stock is per player, not first-come-first-served for the whole server.**
   Why: shared stock rewards whoever is closest to the NPC and starts fights.
   How: each restocked item has a per-player quantity (e.g. 3 Carrot seeds, 1 Mango seed); purchases decrement the player's own counter for index `k`.

6. **Every result shows its roll: weight in kg, rarity color, mutation tags, sell value.**
   Why: the roll is the fun; guides note heavier produce sells for more [8].
   How: a catch/harvest card with name, `2.41 kg`, rarity banner, mutation chips ("Wet ×2", "Shocked"), and "Sells for 1,240".

7. **Mutation multipliers add, not multiply, and the cap is published.**
   Why: Grow a Garden guides list multipliers of ×25 to ×100 for single mutations and a theoretical combined boost in the thousands [11][12][15]; multiplicative stacking makes one lucky crop worth more than weeks of play and breaks every price.
   How: `value = base × weightFactor × (1 + Σ(mutationBonus))`, total bonus capped at +20 (×21) for regular mutations; event mutations have their own published bonus. Balance proves the top value against a month of normal income.

8. **Weather events are server-wide, announced 30 s ahead, and last 3-5 minutes.**
   Why: a shared event turns a quiet farm into a crowd moment; in Grow a Garden weather is a random server-wide change that affects crops [11].
   How: the event schedule is seeded from the global clock like restocks (every 20-40 min); a banner and sky change warn 30 s ahead; each ripe-or-growing crop has a per-tick chance of gaining the event's mutation.

9. **Fishing bite timing and minigame difficulty come from the server; the minigame can't be finished faster than its minimum time.**
   Why: auto-clickers and scripts can play any client minigame perfectly; the server can't see a perfect thumb.
   How: the server sets bite delay and minigame difficulty when it rolls the fish, and rejects a "caught" result before `minReelSeconds` (3-12 s by rarity) or after a 30 s timeout. A cheater gains at most a perfect player's rate.

10. **Casting lands where the player aims, within the rod's range, on water.**
    Why: aiming adds skill; casting onto land or 500 studs away must fail.
    How: client sends an aim point; server checks distance ≤ rod range (40-120 studs), and that the point is inside a part tagged `FishingZone` (or Terrain water by raycast), and uses that zone's fish pool.

11. **Every location has its own bestiary page of 6-12 fish, with silhouettes for uncaught ones.**
    Why: a finite list per area is a goal; Fisch's bestiaries work this way (one area lists 8 fish) [4].
    How: bestiary UI per zone; silhouettes show size and rarity color; completing a page pays a reward and a badge.

12. **Rods, bait and time of day change odds, and the change is shown.**
    Why: gear must feel worth buying; guides recommend specific bait for rarer or night-only fish [4].
    How: luck `L = rod.luck + bait.luck`; rarity weight for tier r is `w_r × (1 + L × r / 4)`; night-only fish appear 19:00-05:00 game time. The rod card shows "Luck +25%".

13. **Selling is one walk-and-tap away from where you harvest or fish.**
    Why: long walks to sell are dead time; Grow a Garden guides orient beginners by shop and sell locations [16][17].
    How: a Sell stand within 60 studs of every plot and dock; "Sell all" and "Sell this" buttons; a favorites lock so a rare fish is never sold by accident.

14. **Plots belong to one player and are built in Studio as real Instances.**
    Why: studio rule (worlds are Instances), and clear ownership stops griefing.
    How: 6-8 identical plot Models in `Workspace.Map.Plots`, each with a `Tiles` folder of planting tiles and an `Owner` attribute the server sets on join. Only the owner's requests can plant or harvest there.

15. **Watering, sprinklers and fertilizer speed growth by a stated percent.**
    Why: active play must beat waiting a little; guides say watering and sprinklers improve size and weight [7][18].
    How: watering a crop gives `−10%` remaining time (once per 30 s per crop); a sprinkler gives `+25%` growth speed in a radius of 12 studs for 10 minutes. Numbers on the tool card.

16. **Every action works with touch, mouse/keyboard and gamepad.**
    Why: studio rule.
    How: planting/harvesting via ProximityPrompts (gamepad ButtonX by default); cast by holding the action (touch button, mouse, ButtonR2 trigger), reel by tapping or holding the same button; bind with ContextActionService [19][20][21].

17. **No result value comes from the client: no price, weight, rarity or mutation in any remote.**
    Why: studio security rule; it's also the most common exploit in these games.
    How: remotes carry only IDs (tile, seed, slot) and aim points; the server looks up everything else (section 11).

18. **AFK income is capped and slower than active play.**
    Why: macros flood economies; a capped official AFK path keeps honest players happy.
    How: offline growth caps at one full grow cycle per crop; optional "auto-fish" (a slower, official AFK option) catches at 40% of active rate with common-only results.

## 3. Top games in the genre

### Grow a Garden
**What it does:** A garden sim: buy seeds at a shop whose limited stock refreshes every five minutes, plant on your plot, water, harvest and sell; sprinklers and gear improve size and weight [7]. Heavier produce sells for more and Gold/Rainbow variants are worth more than base crops; multi-harvest crops regrow [8]. Weather events add mutations (Wet from rain, Shocked from lightning; guides disagree on multipliers, e.g. ×50 vs ×100) and pets can enable mutations [11][12]. It ran weekly Saturday updates [13], later shifting toward depth such as cooking [14]. The shop shows a grey "NO STOCK" button when sold out [22].
**Steal:** The five-minute global restock as a heartbeat; weight as a continuous roll; weather events as server-wide moments; plots everyone can see; tiered gear [18][23].
**Avoid:** Uncapped multiplicative mutation stacking (rule 7). Its art, crop names and pet roster.

Its sequel, Grow a Garden 2, has fan sites publishing per-shop restock cadences and live timers [10]: steal different cadences per shop (seeds 5 min, gear 10 min, rare hourly), but avoid restocks so rare players feel forced to stay online.

### Fisch
**What it does:** A fishing collector. Each location has a bestiary (one Second Sea area lists 8 unique fish); rods from the first area take a stat penalty in the second; bait such as Weird Algae favors rarer fish and Night Shrimp catches night-only fish; rod enchantments such as Steady help with reeling [4]. Mutations change a fish's sale price, and specific rods or enchantments raise the chance of specific mutations; event mutations can need special bait [5][9][24].
**Steal:** Bestiary per location; bait as a consumable that changes odds; enchantments as a second rod-progression axis; area-specific gear so new areas feel new.
**Avoid:** Copying its fish, rod names or islands; a reel minigame that only works with a mouse.

### My Fishing Pier
**What it does:** A fishing tycoon with its own beginner guide (details unverified in our sources) [6].
**Steal:** A business layer so fishing feeds something that grows.
**Avoid:** A tycoon layer that makes fishing itself pointless.

### Fishing kits on the creator marketplace
**What it does:** Paid kits describe the common pattern: hold-to-charge cast with a "Perfect" bonus and a landing indicator, a tension-bar minigame whose zone moves by rarity and whose window rod stats change, and server validation [25][26].
**Steal:** The pattern, not the code. **Avoid:** Dropping in a kit without a security review.

## 4. The first five minutes, second by second

**Garden:**

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns at the edge of their own plot (name sign lit up), 3 starter seeds in the hotbar. | Plot assigned before the character spawns. |
| 3-10 s | Arrow on a tile: "Plant here". Taps the prompt; a sprout pops with a sound. | Plant prompt on every empty tile. |
| 10-25 s | Plants the other two; a watering can glows: "Water to grow faster". Splash, "−10%" pop. | Teaches active play. |
| 25-35 s | Starter crop ripens (20 s grow); glow + sparkle. Harvest prompt. Card: "Carrot 0.42 kg — 12 coins". | First roll under 40 s. |
| 35-60 s | Arrow to the Sell stand 30 studs away; "Sell all" → "+36". | First sale under a minute. |
| 60-120 s | Arrow to the Seed Shop: stock list with countdown "Restock in 3:12". Buys 2 Tomato seeds (multi-harvest). | Teaches restock. |
| 120-240 s | Plants tomatoes (60 s grow); first one may roll "Big" (+40% weight) by design (tuned high in the first hour). | Early luck. |
| 240-300 s | Harvests, sells; a banner: "Rain in 30 s! Crops may get Wet (×2)". | First server event within 5 min (forced on a fresh server's first player). |

**Fishing:** 0-5 s spawn on a starter dock with the rod equipped and a pulsing "Hold to cast" button; 5-10 s charge and release in the green band ("Perfect!"), the bobber lands on a shown ring; 10-15 s a fixed 3 s bite ("!", bobber dunk), tap Reel within 1.5 s; 15-30 s an easy tension bar on a Common (wide zone, ~8 s); 30-40 s catch card "Pond Perch 1.2 kg — NEW!", bestiary 1/8; 40-180 s two more catches (one Uncommon by design), a sale, and the next rod priced ~10 minutes away; 180-300 s 5 free Worms ("Luck +10%") and a night-fish silhouette as the return hook.

Opening rules:
1. **No shop or reward modals before the first sale.**
2. **The first result is guaranteed, the third is guaranteed better than Common.**
3. **The first server event or restock happens within 5 minutes of joining.**
4. **Tips are world arrows and ≤ 8 words.**

## 5. Progression and economy

### Garden numbers (targets; Balance tunes in `economy.md`)
| Tier | Example seed | Seed cost | Grow time | Harvests | Base value | Stock per restock |
|---|---|---|---|---|---|---|
| 1 | Carrot | 10 | 20 s | 1 | 12 | 10 |
| 2 | Tomato | 60 | 60 s, regrow 45 s | multi | 18 per fruit | 6 |
| 3 | Corn | 400 | 3 min | 1 | 950 | 4 |
| 4 | Melon | 2,500 | 8 min, regrow 6 min | multi | 600 per fruit | 3 |
| 5 | Starfruit | 20,000 | 20 min | 1 | 55,000 | 1-2 |
| 6 | Moonbloom | 150,000 | 45 min, regrow 30 min | multi | 25,000 per fruit | 0-1 (chance) |

Rules of thumb: each tier's income per minute of plot space is 2.5-4× the previous; a higher tier always beats filling the plot with a lower one; rare seeds appear in stock by chance (tier 5: 40% per restock, tier 6: 8%), shown honestly as "Rare stock".

### Weight and value
- Weight is rolled at plant time: `kg = baseKg × e^(N(0, 0.25))` (log-normal), with 1% "Huge" (×3-5 kg).
- `weightFactor = (kg / baseKg)^1.5`, so big crops feel big in value too.
- Value: `base × weightFactor × (1 + Σ mutationBonus)`; regular bonus cap +20 (rule 7).
- Multi-harvest crops regrow fruit every `regrow` seconds without replanting; single-harvest crops pay ~2.5× per harvest, so planting is a choice (guides teach both types [8]).

### Mutations (studio set; original names)
| Mutation | Source | Bonus | Chance |
|---|---|---|---|
| Golden | Plant-time roll | +4 | 1% |
| Rainbow | Plant-time roll | +9 | 0.1% |
| Wet | Rain event | +1 | 15% per minute of rain per crop |
| Frosted | Snow event | +3 | 8% per minute |
| Charged | Storm event (lightning strike) | +10 | 1 random crop per 30 s per plot |
| Moonlit | Night event | +5 | 5% per minute, night only |
Each mutation shows as a color tint or particle on the crop model so other players see it.

### Fishing numbers
| Rarity | Pool weight (no luck) | Base value | Reel difficulty (zone width / fish speed) | `minReelSeconds` |
|---|---|---|---|---|
| Common | 60 | 15-40 | 40% / slow | 3 |
| Uncommon | 25 | 60-150 | 32% / medium | 4 |
| Rare | 10 | 300-900 | 25% / medium-fast | 6 |
| Epic | 4 | 2,000-6,000 | 18% / fast | 8 |
| Legendary | 0.9 | 15,000-50,000 | 13% / erratic | 10 |
| Mythic | 0.1 | 150,000+ | 10% / erratic + bursts | 12 |

Luck changes weights by rule 12. Fish mutations (Albino, Shiny, Abyssal-style area mutations) roll after the fish at 0.5-5% with published bonuses on the same additive formula.

### Rods and locations
Rods: range, luck, reel control (zone width +%), and lure speed (−% bite delay). Price ladder 0 / 800 / 5,000 / 30,000 / 180,000 / 1,000,000. Locations unlock with a rod tier or a level and have their own pools and bestiary; each new location makes the previous rod slightly weaker there (a mild version of Fisch's area penalty [4]).

### Pace targets
First tier-3 seed or second rod inside session 1 (≈15 min); tier 4 / rod 4 by day 2-3; first Legendary fish within 2-3 hours of play; full first bestiary page in week 1.

## 6. Monetization that fits

Players pay for **speed** (growth, restock access), **space** (plot size, inventory), **luck** (bait, lures), **looks** (garden decor, rod skins) and **convenience** (auto-sell). Never sell a result directly: don't sell Mythic fish or Rainbow crops.

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Premium seed (in-stock item for Robux) | Developer product | 19-199 R$ | Seed shop, next to the coin price, only when that seed is in stock |
| Restock now (personal) | Developer product | 29-49 R$ | Shop countdown; refreshes only your stock; limited 3 per hour |
| Gear: sprinkler, fertilizer | Developer product | 25-149 R$ | Gear shop (coin route too) |
| Bigger plot (+50% tiles) | Game pass | 199-399 R$ | Plot sign |
| Auto-sell / Sell from anywhere | Game pass | 149-249 R$ | Sell stand |
| Bait packs (luck consumables) | Developer product | 29-199 R$ | Bait vendor (coin route too) |
| Rod skins, garden decor | Pass or product | 49-499 R$ | Cosmetics shop; no stats |
| Private server | Subscription | 100-200 R$/month | Server list [27] |

Rules:
1. **One `ProcessReceipt`, idempotent by `PurchaseId`** [28][29].
2. **Seed packs or crates with random contents follow the paid random items policy**: every outcome with odds [30]; check `PolicyService` for restricted players [31]. Prefer direct purchases.
3. **The coin route exists for every gameplay item**; Robux buys speed, not exclusivity of results.
4. **No prompts on harvest or catch.** Offers live at shops and signs.
5. **Pass ownership on the server** with `UserOwnsGamePassAsync` in `pcall` [32].
6. **Off-limits:** buying a specific mutation, buying a Mythic fish, paid-only shops that restock better, fake "only 1 left!" counters.

## 7. UI and HUD for this genre

Cozy games still need fast, legible UI. See [[05 UI and HUD]], [[08 Mobile]], [[16 Console and Controllers]].

| Element | Position (UDim2 / AnchorPoint) | Size (1080p offsets, UIScale) | Notes |
|---|---|---|---|
| Coins | (0, 16, 0, 72) / (0, 0) | 220×52 | Pops on sale |
| Hotbar | (0.5, 0, 1, −16) / (0.5, 1) | 8 × 76×76 | Seeds with counts, can, tools, rod |
| Restock timer | (1, −16, 0, 72) / (1, 0) | 200×44 | "Seeds 3:12", tap opens the shop |
| Event banner | (0.5, 0, 0, 12) / (0.5, 0) | 520×60 | "Rain! 2:41 — Wet ×2" |
| Cast power bar | above character (BillboardGui) | 160×18 | Green "Perfect" band |
| Reel minigame | (0.5, 0, 0.75, 0) / (0.5, 0.5) | 520×64 horizontal | Fish icon, catch zone, progress ring |
| Catch / harvest card | (0.5, 0, 0.35, 0) / (0.5, 0.5) | 420×180 | Name, kg, rarity, mutations, value, NEW |
| Bestiary, Inventory / Sell | centered panel | 900×600 | Pages per location; sort, lock, Sell all |

Rules:
1. **Crop progress over each crop** as a small BillboardGui ring (only within 30 studs, max 40 visible) so phones aren't flooded.
2. **The reel minigame is one button**: hold to move the zone up/right, release to fall back. Touch: a 140×140 button bottom-right; mouse: left button; gamepad: RT or ButtonA. Never require precise mouse aim [21].
3. **Everything readable on a TV:** 18 px minimum text at 1080p, rarity by color and by word.
4. **Menus** (Shop, Bestiary, Inventory, Settings) are ScreenGuis built in StarterGui; item cards are a cloned template; `GuiService.SelectedObject` on open, B closes [33].
5. **Sold-out items stay visible with a grey "NO STOCK" button** and the restock time, the pattern Grow a Garden uses [22].
6. **Lock favorites** with a lock icon on cards; "Sell all" skips locked, Rare+ and NEW items by default.

## 8. World and look

1. **Plots around a shared center.** 6-8 plots in a ring around a plaza with the Seed Shop, Gear Shop, Sell stand and event stage. Each plot 40×40 studs of tiles (10×10 tiles at 4×4 studs) plus a decor border. Gear Shop beside the Seed Shop (guides help players find it [34]).
2. **Tiles read as soil:** `Material.Ground` or a soil texture, slightly raised, a subtle grid; planted tiles darken when watered.
3. **Crops grow in 3-4 visible stages** (sprout, small, full, ripe-glow). Each crop model ≤ 6 parts or one MeshPart with 2-3 fruit parts. 6 players × 100 crops = 600 crop models: keep them cheap, anchored and `CanCollide = false`, `CastShadow = false`.
4. **Mutations are visible:** Golden = gold material and sparkle, Wet = darker with drips, Frosted = pale with snow particles, Charged = blue arcs. Visitors must see them.
5. **Water reads as water:** Terrain water for lakes and sea, with fishing zones marked by floating buoys, color-coded by tier. Docks extend into each zone.
6. **Day/night matters in fishing:** a 20-minute day cycle (`Lighting.ClockTime` from shared time) with night-only fish; lanterns on docks.
7. **Weather is visible from anywhere:** sky tint, `Atmosphere` density, rain/snow particles attached to the camera on the client.
8. **Locations are islands or districts,** each with a landmark and palette, all built in Studio as Instances in `Workspace.Map`**; `StreamingEnabled` for large fishing maps [35].

## 9. Retention and social

1. **Offline growth** (capped, rule 18) and a "Your garden while you were away" summary on rejoin.
2. **Restock and event countdowns** always on screen.
3. **Daily quests** (harvest 30 crops, catch 3 Uncommons) and a 7-day login streak with a decor item.
4. **Bestiary and crop index** with completion rewards and badges.
5. **Visit and like gardens;** weekly "Top garden" sign in the plaza.
6. **Trading** only with a Reviewer-approved design (dupe and scam risk); start without it.
7. **Leaderboards:** heaviest fish this week, best crop value, bestiary completion (ordered stores) [36][37].
8. **Community goals** ("Harvest 10,000 pumpkins") with a shared reward; +5% sell for group members.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Garden | Weekly small, big every 3-4 weeks | 2-4 seeds or a gear, an event; a system (pets, cooking) per big update |
| Fishing | Every 2-3 weeks | A location or 6-10 fish, a rod, an event mutation |
| Tycoon hybrid | Every 2-4 weeks | A business upgrade line, new goods |

Rules:
1. **A fixed update day and time** builds a habit (Grow a Garden's Saturday schedule drew fan countdown pages [13][38][39]); announce it on the lobby board.
2. **Don't promise weekly events you can't keep fresh**; Grow a Garden's team said weekly events were hard to sustain and shifted toward depth [14]. Plan 3 small + 1 big per month.
3. **Event mutations and seeds are limited, but their crops stay in the index** and can return in a later event.
4. **Admin-triggered events** (a big weather event at a set time) concentrate players; schedule them from the global clock so all servers get them.
5. **Watch the economy daily:** top 1% coin holdings, median time to tier 5, sell value of the top mutation; one bad multiplier can inflate everything (rule 7).
6. **Funnel:** first plant → first sale → first tier-3 seed → first event mutation ([40]).

## 11. Building it in Studio

### Build order
1. **Architect:** shape (garden, fishing, hybrid), plot count, crops/fish lists, mutation and event table, shops and restock cadences in `plan.md`.
2. **Balance:** seed/fish tables, value formula, mutation caps, restock odds, pace sim in `economy.md`.
3. **Scenic:** plots (with `Tiles`), plaza, shops, docks and `FishingZone` parts as Instances.
4. **Builder:** `Config`, `PlayerData`, `PlotService` (assign, plant, water, harvest), `StockService` (global restock), `SellService`; then `FishingService` (cast, bite, reel validation).
5. **Builder:** client `CropRenderer` and `FishingController`, then `WeatherService` and `OfflineService`. **Frame:** HUD, shop, inventory, bestiary, catch card and minigame as ScreenGuis. **Librarian:** crop stages, fish, mutation VFX, rods.
6. **Merchant:** products and passes; **Liveops:** funnel and economy events.
7. **Playtest / Kid Tester:** first five minutes on a phone; **Reviewer:** forges every remote, checks restock identity across two servers, checks saves.
8. **Producer:** section 15 with evidence.

### Architecture
```
ReplicatedStorage/
  Shared/Config           Seeds, Fish, Mutations, Rods, Baits, Shops, Events, prices, ids
  Shared/Clock            restockIndex(), eventAt(), gameClock() — pure functions of os.time()
  Remotes/                Plant, Water, Harvest, Buy, Sell, Cast, Reel, ReelResult, Lock (C→S)
                          PlotState, StockState, EventState, Bite, CatchCard, Toast (S→C)
  Assets/Crops/<Seed>/Stage1..Stage4, Assets/Fish/<Fish>, Assets/Mutations/<FX>
ServerScriptService/Services/
  PlayerData, PlotService, StockService, SellService, WeatherService, FishingService,
  OfflineService, ProductService
StarterPlayer/StarterPlayerScripts/Controllers/
  CropRenderer, FishingController, HudController
Workspace/Map/
  Plots/Plot_1..Plot_8 (Tiles/Tile_001.., Sign, SpawnPoint), Plaza/(SeedShop, GearShop, SellStand),
  Docks/..., Zones/ (FishingZone parts with attributes Pool, Tier)
```

### Remotes contract

| Remote | Dir | Args | Server checks | Limit |
|---|---|---|---|---|
| Plant | C→S | tileId, seedId | tile in player's plot; empty; seed count > 0; player within 20 studs | 8/s |
| Water | C→S | tileId | own tile; crop growing; 30 s per-crop cooldown; can equipped | 6/s |
| Harvest | C→S | tileId | own tile; ripe (server time); within 20 studs | 8/s |
| Buy | C→S | shopId, itemId | item in this restock index; player's remaining qty > 0; coins ≥ Config price; near shop | 4/s |
| Sell | C→S | itemUids or "all" | items owned; not locked (for "all"); near sell stand or pass | 2/s |
| Cast | C→S | aim: Vector3 | rod equipped; not already casting; distance ≤ rod range; aim inside a FishingZone | 1 per 1.5 s |
| Reel | C→S | — | a bite is active; within bite window (1.5 s + 0.3 s latency) | 2/s |
| ReelResult | C→S | success: boolean | a minigame is active; elapsed ≥ minReelSeconds and ≤ 30 s | 1 per catch |
| Bite / CatchCard | S→C | — / fish, kg, rarity, mutations, value | — | — |

No remote carries a weight, rarity, mutation, value or price.

### Data schema
```lua
-- PlayerData v1 ("u_<UserId>")
{
	v = 1, coins = 0, xp = 0, level = 1,
	seeds = {},             -- [seedId] = count
	crops = {},             -- [tileIndex] = { seed = "Tomato", plantedAt = 0, grow = 60, kg = 0.0,
	                        --                 muts = {}, lastWater = 0, nextFruitAt = 0 }
	items = {},             -- [uid] = { kind = "fish"|"crop", id = "Perch", kg = 1.2, muts = {}, locked = false }
	rods = { Starter = true }, rod = "Starter", baits = {}, -- baitEquipped: string? (optional)
	bestiary = {},          -- [fishId] = { caught = 3, bestKg = 2.4 }
	stockUsed = { k = 0, used = {} }, -- restock index and per-item purchases in it
	plotUpgrades = 0, lastSeen = 0,
	receipts = {},          -- [PurchaseId] = os.time(), last 50
	settings = { cropRings = true, music = true },
}
```
Crops are saved by tile index, not by plot, so a player can get any free plot next time. Cap `items` (e.g. 300) and prompt to sell when full. `pcall` all data-store calls [41][42].

### Luau: the shared clock (ReplicatedStorage.Shared.Clock)
```lua
--!strict
local Clock = {}
Clock.RESTOCK_SECONDS = 300
Clock.DAY_SECONDS = 1200 -- 20-minute game day

function Clock.restockIndex(now: number?): number
	return math.floor((now or os.time()) / Clock.RESTOCK_SECONDS)
end

function Clock.gameHour(now: number?): number -- 0..24
	local t = now or workspace:GetServerTimeNow()
	return ((t % Clock.DAY_SECONDS) / Clock.DAY_SECONDS) * 24
end

-- Same stock in every server: seed the RNG from the restock index
function Clock.rollStock(index: number, salt: number, pool: { { id: string, chance: number, qty: number } })
	local rng = Random.new(index * 7919 + salt)
	local stock: { [string]: number } = {}
	for _, entry in pool do
		if rng:NextNumber() < entry.chance then stock[entry.id] = entry.qty end
	end
	return stock
end

return Clock
```
`os.time()` is UTC and close across servers, so `restockIndex` agrees everywhere; clients count down with `workspace:GetServerTimeNow()`. Iterate `pool` as an array (never a dictionary) so every server rolls in the same order.

### Luau: plant and harvest (server, PlotService excerpt)
```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)
local Remotes = ReplicatedStorage.Remotes

local plotOf: { [Player]: Model } = {}
local rng = Random.new()

local function tileFor(player: Player, tileId: unknown): (BasePart?, number?)
	if typeof(tileId) ~= "number" or tileId % 1 ~= 0 then return nil, nil end
	local plot = plotOf[player]
	local tile = plot and plot.Tiles:FindFirstChild(string.format("Tile_%03d", tileId))
	if not tile or not tile:IsA("BasePart") then return nil, nil end
	local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root or (root.Position - tile.Position).Magnitude > 20 then return nil, nil end
	return tile, tileId
end

local function rollKg(baseKg: number): number
	-- log-normal around baseKg (Box-Muller z), 1% Huge (x3-5), rounded to 0.01 kg
	local z = math.sqrt(-2 * math.log(1 - rng:NextNumber())) * math.cos(2 * math.pi * rng:NextNumber())
	local kg = baseKg * math.exp(0.25 * z) * (if rng:NextNumber() < 0.01 then rng:NextNumber(3, 5) else 1)
	return math.floor(kg * 100 + 0.5) / 100
end

-- Plant (same checks via tileFor): seed in Config, seeds[seedId] > 0, tile empty; then decrement,
-- roll Golden/Rainbow and kg here, store { seed, plantedAt = os.time(), grow, kg, muts }, fire PlotState.

Remotes.Harvest.OnServerEvent:Connect(function(player: Player, tileId: unknown)
	local data = PlayerData.get(player)
	local _, idx = tileFor(player, tileId)
	local crop = data and idx and data.crops[idx]
	if not crop then return end
	local now = os.time()
	if now - crop.plantedAt < crop.grow then return end -- not ripe by server clock
	local seed = Config.Seeds[crop.seed]
	local uid = game:GetService("HttpService"):GenerateGUID(false)
	data.items[uid] = { kind = "crop", id = crop.seed, kg = crop.kg, muts = table.clone(crop.muts), locked = false }
	if seed.regrow then
		crop.plantedAt = now - crop.grow + seed.regrow -- ripe again after `regrow` seconds
		crop.kg = rollKg(seed.baseKg)
		crop.muts = {}
	else
		data.crops[idx] = nil
	end
	Remotes.PlotState:FireAllClients(player.UserId, idx, data.crops[idx])
	Remotes.CatchCard:FireClient(player, data.items[uid], Config.valueOf(data.items[uid]))
end)
```
`Config.valueOf(item)` implements the section 5 formula with the bonus cap; the same function prices the Sell remote, so the card and the sale always agree. Harvest and Plant are triggered by ProximityPrompts on each tile (`RequiresLineOfSight = false`, `MaxActivationDistance = 10`, prompt text swaps between "Plant", "Growing 0:42" and "Harvest"); prompts give gamepad and touch support for free [19].

**Crop stages (client):** every 1 s, for crops within 120 studs, `t = (GetServerTimeNow() − plantedAt) / grow` picks Stage1 (< 0.33), Stage2 (< 0.66), Stage3 (< 1) or Stage4 (ripe); swap the cloned `Assets.Crops.<Seed>.StageN` model only when the stage changes.


### Luau: fishing cast, bite and reel validation (server)
```lua
--!strict
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Clock = require(ReplicatedStorage.Shared.Clock)
local PlayerData = require(script.Parent.PlayerData)
local Remotes = ReplicatedStorage.Remotes

type Session = { fish: string, rarity: number, kg: number, biteAt: number, phase: string, reelStart: number }
local sessions: { [Player]: Session } = {}
local lastCast: { [Player]: number } = {}
local rng = Random.new()

local function zoneAt(p: Vector3): BasePart? -- the FishingZone box that contains p
	for _, z in CollectionService:GetTagged("FishingZone") do
		local part = z :: BasePart
		local rel, h = part.CFrame:PointToObjectSpace(p), part.Size / 2
		if math.abs(rel.X) <= h.X and math.abs(rel.Y) <= h.Y + 2 and math.abs(rel.Z) <= h.Z then return part end
	end
	return nil
end

local function rollFish(pool: { { id: string, rarity: number, weight: number, night: boolean? } }, luck: number): (string, number)
	local night = Clock.gameHour() >= 19 or Clock.gameHour() < 5
	local total, list = 0, {}
	for _, f in pool do
		if f.night and not night then continue end
		local w = f.weight * (1 + luck * f.rarity / 4)
		total += w
		table.insert(list, { f = f, acc = total })
	end
	local r = rng:NextNumber() * total
	for _, e in list do
		if r <= e.acc then return e.f.id, e.f.rarity end
	end
	return list[#list].f.id, list[#list].f.rarity
end

Remotes.Cast.OnServerEvent:Connect(function(player: Player, aim: unknown)
	local now = os.clock()
	if (lastCast[player] or 0) + 1.5 > now or sessions[player] then return end
	lastCast[player] = now
	local data = PlayerData.get(player)
	local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not data or not root or typeof(aim) ~= "Vector3" or aim ~= aim then return end
	local rod = Config.Rods[data.rod]
	if (aim - root.Position).Magnitude > rod.range then return end
	local zone = zoneAt(aim)
	if not zone then return end
	local pool = Config.Pools[zone:GetAttribute("Pool") :: string]
	if not pool then return end
	local luck = rod.luck + (data.baitEquipped and Config.Baits[data.baitEquipped].luck or 0)
	local fishId, rarity = rollFish(pool, luck)
	local fish = Config.Fish[fishId]
	local delay = rng:NextNumber(2, 8) * (1 - rod.lure)
	sessions[player] = { fish = fishId, rarity = rarity, kg = math.floor(fish.baseKg * rng:NextNumber(0.6, 1.8) * 100) / 100,
		biteAt = now + delay, phase = "waiting", reelStart = 0 }
	task.delay(delay, function()
		local s = sessions[player]
		if s and s.phase == "waiting" then
			s.phase = "bite"
			Remotes.Bite:FireClient(player, Config.Reel[rarity]) -- difficulty params only, not the fish
			task.delay(1.8, function() -- 1.5 s window + 0.3 s latency
				if sessions[player] == s and s.phase == "bite" then sessions[player] = nil end -- missed
			end)
		end
	end)
end)

Remotes.Reel.OnServerEvent:Connect(function(player: Player)
	local s = sessions[player]
	if not s or s.phase ~= "bite" then return end
	s.phase = "reeling"
	s.reelStart = os.clock()
end)

Remotes.ReelResult.OnServerEvent:Connect(function(player: Player, success: unknown)
	local s = sessions[player]
	if not s or s.phase ~= "reeling" or typeof(success) ~= "boolean" then return end
	sessions[player] = nil
	local elapsed = os.clock() - s.reelStart
	if not success or elapsed < Config.Reel[s.rarity].minSeconds or elapsed > 30 then return end
	-- grant: create the item with kg, roll fish mutations here, update bestiary, fire CatchCard
end)
```
Clear `sessions[player]` and `lastCast[player]` on `PlayerRemoving` and when the rod is unequipped. The client never learns the fish until the catch card (so it can't auto-release non-rares cheaply); the bite only carries the minigame's difficulty. Consume bait on cast, not on catch.

### Luau: weather mutations (server, WeatherService excerpt)
Events are picked from the global clock (`Random.new(floor(os.time() / 1800))` chooses the next event and its start offset in every server). While an event runs, a 60 s tick walks every player's growing or ripe crops and adds the event's mutation with its per-minute chance (skip crops that already have it), then fires `PlotState` for changed tiles so everyone sees the new tint. Charged picks one random crop per plot every 30 s and plays a lightning strike there.

## 12. Twists that work

1. **Pets that help** (auto-water, extra mutation chance, faster reel), hatched or bought with coins; odds shown if random ([[Genre - RNG and Collection]]).
2. **Cooking:** combine crops and fish into dishes worth more than parts; Grow a Garden added cooking-style depth later [14].
3. **Farm + fish + decorate** cozy hybrid with a home to show.
4. **Boats** to reach far fishing zones (see [[Genre - Racing and Vehicles]] for ownership and guard rules).
5. **Seasons:** a monthly season changes crops in stock, weather types and fish pools.
6. **Monster fishing:** bosses in deep zones that the whole server reels in together (a shared progress bar).
7. **Tower-defense garden:** crops that defend the plot at night ([[Genre - Tower Defense]]).
8. **Contests and showcases:** an hourly "heaviest pumpkin" contest; an aquarium or greenhouse to display rares.

## 13. Failure modes

1. **Client-decided results:** fish rarity or crop weight in a remote; exploiters print Mythics.
2. **Multiplicative mutation stacking** making one item worth millions and deflating every price [15].
3. **Per-server or shared-first-come stock:** server-hopping and fights at the NPC.
4. **Unreadable rolls:** no kg, no rarity color, invisible mutations.
5. **Mouse-only or too-hard minigames** on phones; **macro fishing** with no minimum reel time.
6. **Crop lag:** thousands of detailed, unanchored crop parts.
7. **Lost gardens:** crops not saved on leave, or saved by plot number.
8. **Event burnout:** promising weekly events and running out of ideas [14].
9. **Selling results for Robux:** a "buy Mythic fish" product.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Shape chosen (garden, fishing, tycoon, hybrid) and the hook fits in five words.
- [ ] Market check (Pulse, `cli.mjs market`): what farming and fishing games chart now; our hook isn't a reskin of the leader.
- [ ] Launch scope: 15+ seeds or 30+ fish across 3 locations, 4+ mutations, 2 weather events.
- [ ] Global-clock restocks and events are in the plan.
- [ ] Server-rolled results and the additive, capped value formula are in `economy.md`.
- [ ] Minigame (if fishing) has a one-button design that works on touch and gamepad.
- [ ] Monetization sells speed, space, luck and looks, never results.
- [ ] Update plan: small weekly, big every 3-4 weeks, sustainable for 8 weeks.

## 15. Checklist

- [ ] First harvest or catch within 60 s; first sale within 2 min (phone).
- [ ] Every result is rolled on the server; no remote carries kg, rarity, mutation, value or price (Reviewer scan).
- [ ] Two Studio servers show identical stock for the same restock index (screenshot of both).
- [ ] Crops ripen by server `os.time()` while offline, capped at one cycle (rejoin test with a 2-minute crop).
- [ ] Mutation bonuses add and are capped at +20; the top possible value is in `economy.md`.
- [ ] Weather events are announced 30 s early and start at the same time in every server.
- [ ] Cast outside range or outside a FishingZone fails; a ReelResult before `minReelSeconds` fails (forged-call log).
- [ ] Reel minigame and Plant/Harvest prompts work on touch, mouse and gamepad; menus selectable, B closes.
- [ ] Crop models ≤ 6 parts, anchored, no shadows; 600 crops hold 30 FPS on a phone.
- [ ] Locked items are never sold by "Sell all".
- [ ] One `ProcessReceipt`; repeat receipts don't double-grant.
- [ ] Crops, items and bestiary save on leave, on `BindToClose` and every 60 s.
- [ ] Funnel events: first plant, first sale, first tier-3, first event mutation.

## Common mistakes

1. Rolling fish on the client and sending the result.
2. `math.random` restocks per server instead of a seed from the global clock.
3. Iterating a dictionary to roll stock (order differs between servers; use arrays).
4. Using `os.clock()` for growth (it resets with the server; use `os.time()`).
5. Multiplying mutation bonuses.
6. Saving crops by plot number, so the player loses them on a new server.
7. Building plots or shops from scripts instead of placing them in Studio.
8. Showing the fish before the reel ends (players skip anything not rare).
9. Tiny reel buttons and mouse-only aiming.
10. A "skip restock" product that refreshes the whole server's stock.
11. No latency allowance on the bite window (mobile players miss bites).

## References

[1] Grow a Garden (Wikipedia) — https://en.wikipedia.org/wiki/Grow_a_Garden
[2] Grow a Garden hits 5 million active users (Kotaku) — https://kotaku.com/grow-a-garden-roblox-5-million-active-users-record-pc-1851781824
[3] Millions are flocking to grow virtual gardens in viral Roblox game created by teenager (AP via KSAT) — https://www.ksat.com/business/2025/07/30/millions-are-flocking-to-grow-virtual-gardens-in-viral-roblox-game-created-by-teenager/
[4] Fisch Roblox Guide: How To Complete Pine Shoal Bestiary (Deltia's Gaming) — https://deltiasgaming.com/?p=188497
[5] All mutations in Fisch and what they do (Dot Esports) — https://dotesports.com/roblox/news/all-mutations-in-fisch-and-what-they-do
[6] My Fishing Pier: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=244922
[7] Complete Grow a Garden Beginner's Guide (Pro Game Guides) — https://progameguides.com/roblox/complete-grow-a-garden-beginners-guide-seeds-weather-events-gears/
[8] Grow a Garden: A beginner's guide (Sportskeeda) — https://sportskeeda.com/roblox-news/grow-garden-a-beginner-s-guide
[9] How To Get All Mutations in Fisch (Deltia's Gaming) — https://deltiasgaming.com/how-to-get-all-mutations-in-fisch-roblox-guide
[10] Grow a Garden 2 stock predictor (AllThingsHow) — https://allthings.how/grow-a-garden-2-stock-predictor-how-restock-timing-works/
[11] Complete Guide To Weather Events in Grow a Garden (Deltia's Gaming) — https://deltiasgaming.com/?p=203882
[12] Grow a Garden mutations (Pocket Tactics) — https://www.pockettactics.com/grow-a-garden-mutations
[13] Grow a Garden update schedule (PCGamesN) — https://www.pcgamesn.com/grow-a-garden/update-schedule
[14] Grow a Garden major changes coming (NME) — https://www.nme.com/news/gaming-news/roblox-grow-a-garden-major-changes-coming-update-cooking-3884432
[15] Grow a Garden Guide: Everything About Mutation Multiplier (Deltia's Gaming) — https://deltiasgaming.com/?p=258963
[16] Complete Beginners Guide To Grow a Garden Roblox (Deltia's Gaming) — https://deltiasgaming.com/?p=201040
[17] Grow a Garden beginners guide (AverGames) — https://avergames.com/games/grow-a-garden/beginners-guide
[18] Grow a Garden Gear guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/grow-garden-gear-guide-all-gears
[19] Proximity prompts guide (Creator Docs) — https://create.roblox.com/docs/ui/proximity-prompts
[20] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[21] Gamepad input (Creator Docs) — https://create.roblox.com/docs/input/gamepad
[22] Grow a Garden seed and gear shop stock explained (Deltia's Gaming) — https://deltiasgaming.com/?p=207402
[23] Grow a Garden gear guide (BlueStacks) — https://www.bluestacks.com/blog/game-guides/roblox/rl-grow-a-garden-gear-guide-en.html
[24] Fisch Roblox Guide: How To Catch Blarney Mutation Fish (Deltia's Gaming) — https://deltiasgaming.com/?p=173657
[25] Fishing Minigame System - Power Cast (BuiltByBit) — https://builtbybit.com/resources/fishing-minigame-system-power-cast.101022/
[26] Advance Fishing System - Auto + Minigame (BuiltByBit) — https://builtbybit.com/resources/advance-fishing-system-auto-minigame.101031/updates
[27] Private servers — https://create.roblox.com/docs/production/monetization/private-servers
[28] Developer products — https://create.roblox.com/docs/production/monetization/developer-products
[29] MarketplaceService.ProcessReceipt — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService/ProcessReceipt
[30] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items
[31] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md
[32] Passes — https://create.roblox.com/docs/production/monetization/passes
[33] GuiService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/GuiService
[34] Where to find the Gear Shop in Grow a Garden (esports.gg) — https://esports.gg/news/roblox/where-to-find-the-gear-shop-in-grow-a-garden
[35] Instance streaming (Creator Docs) — https://create.roblox.com/docs/en-us/workspace/streaming
[36] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore
[37] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md
[38] Grow a Garden events schedule (AllThingsHow) — https://allthings.how/grow-a-garden-events-schedule/
[39] When is the next Grow a Garden update? (Sportskeeda) — https://www.sportskeeda.com/roblox-news/when-next-grow-garden-update
[40] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events
[41] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[42] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[16 Console and Controllers]] · [[17 Security and Anti-Cheat]] · [[Genre - Simulator]] · [[Genre - RNG and Collection]] · [[Genre - Tycoon]] · [[Genre - Tower Defense]]
