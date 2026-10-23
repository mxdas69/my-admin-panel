---
tags: [vault, genre, tower-defense, td, anime-td, waves, units, gacha, co-op, strategy]
for: [lead, pulse, architect, builder, balance, scenic, frame, playtest, kid-tester]
also: [merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Tower Defense

A tower defense (TD) game puts enemies on a fixed path and asks players to stop them by placing and upgrading towers (or "units") beside it, wave after wave. On Roblox the genre has two big shapes: **classic TD** (a map, a co-op squad of up to four, towers bought with match cash, a long out-of-match unlock tree; the Tower Defense Simulator shape) and **anime/gacha TD** (the same match loop, but the towers are collectible characters pulled from rotating summon banners, with traits, levels and evolutions; the Anime Defenders, Anime Last Stand and Anime Vanguards shape). Anime TD is also one of the platform's biggest earners: Beebom reported Anime Vanguards passing Blox Fruits as the top-earning Roblox game [1].

This page also covers the hybrids the crew may pitch: **themed TD** (gardens, toilets, toys, retro), **tower defense with a walking hero**, **reverse TD** (you send the waves), and **TD bolted onto another genre** (a TD mode in a simulator, or crops that shoot, as in Garden Tower Defense [2]).

TD looks like a spreadsheet game, and that is the trap. It lives or dies on three things: **readable placement** (a new player must know where a tower can go and what it will hit before they spend), **a wave curve that bends at the right moment** (easy enough to win the first match, hard enough that upgrades matter by wave 10), and **a meta loop that keeps paying** (new towers, new maps, new modes). The engineering trap is just as real: hundreds of enemies as Humanoid models will melt a phone server. Section 11 shows the data-driven alternative.

Read this page before pitching or planning any TD, unit-collection TD, or TD mode, and before building enemy paths, wave spawners or placement systems in any genre. Pair it with [[02 The Core Loop]], [[03 Rarity and RNG]], [[04 Progression and Economy]], [[09 Shops and Monetization]] and [[17 Security and Anti-Cheat]].

## 1. What it is and why it works on Roblox

**The audience.** Three groups, in our design assumptions:
- **Young strategy players** (roughly 9-14) who like "put the thing down, watch it work". They want clear ranges, big hits and visible upgrades. Easy modes serve them: Sportskeeda's Tower Defense Simulator guide recommends Easy for beginners and describes it as 25 waves [3].
- **Collectors** (anime fans especially) who play for the units: rarity, traits, evolutions and showing off a team. Anime Defenders' units come in rarities from Rare up to Secret, pulled with gems [4][5].
- **Co-op squads** who want to clear a hard mode together, split the map, and carry a friend. Guides suggest new TDS players start in co-op to learn the mechanics [6].

**Session shape.** A match is 10-30 minutes: lobby, map vote or queue, 20-50 waves, a reward screen, back to the lobby. Between matches the player spends: new towers, summons, upgrades. Design targets for this studio: first match under 12 minutes, first win guaranteed for a new player on the starter map, 3+ matches per session, a lobby visit under 90 s between matches.

**Why players come back.**
1. **Unlocks.** A new tower or unit changes how every map plays. TDS gates higher tower tiers behind coins, levels or other currency [3].
2. **Harder modes.** Easy → Normal → Hard → endless. Each mode is a named wall to beat with friends.
3. **Collection.** Banners rotate every few hours in Anime Defenders [7] and through the day in Anime Last Stand [8]; "the banner might have my unit" is a login reason.
4. **Events.** Limited units and event maps (ALS ran seasonal events such as a summer event [9]).
5. **Mastery.** Placement and targeting are skills; good players clear hard modes with cheap towers and post it.

**Why it works on Roblox.** Co-op is free (four friends in one server), matches fit short sessions, placement is a tap (works on phones), and the "spend between matches" rhythm gives monetization natural shop moments that never interrupt play. It also reuses the platform's taste for collection and RNG from [[Genre - RNG and Collection]].

## 2. The core loop

**Loop statement (classic TD):**
> Players **place and upgrade towers** to **survive waves and win the match**, which pays **coins and XP**, which they spend on **new towers and skins** so they can **beat harder modes and maps** [3][10].

**Loop statement (anime/gacha TD):**
> Players **clear stages with their unit team** to earn **gems and materials**, which they spend on **summons, trait rerolls and evolutions** so they can **clear the next story act, raid or challenge** [4][11][7].

**Loop statement (endless/survival mode):**
> Players **hold out as long as possible on an endless wave curve** to **beat their best wave and climb a board**, so they can **try a better build next run**.

| Layer | Time scale | What happens | Reward beat |
|---|---|---|---|
| Micro | 0.2-2 s | A tower fires, an enemy pops | Hit VFX, damage number, cash tick |
| Short | 20-60 s | A wave is cleared | Wave bonus cash, "+$250", upgrade affordable |
| Match | 10-30 min | Map won (or lost at wave N) | Coins, XP, gems, drops, first-clear bonus |
| Session | 30-60 min | 3+ matches, a new unit or tower | Unlock, summon, level-up |
| Long | days-weeks | New mode cleared, collection grows | Badges, titles, event units, leaderboard rank |

### Tower defense rules

1. **The first match is winnable by every new player within 12 minutes.**
   Why: a loss before the player understands the loop reads as "this game is hard" and they leave. TDS teaches through a short tutorial run (described as three waves teaching placement, upgrades, targeting and the loop) before real matches [12].
   How: the starter map has 15 waves, a starter tower that solos waves 1-5, and enemy HP tuned so 3 starter towers plus 2 upgrades clear wave 15. Kid Tester must win it first try on a phone.

2. **Show range before the player pays: a circle on the ground while placing, green if valid, red if not.**
   Why: placement is the core decision; hidden range turns it into guessing. TDS guides tell players to read tower range and enemy paths as first steps [13].
   How: a client-side ghost model plus a flat cylinder (`Shape = Cylinder`, rotated, `Transparency = 0.7`, `CanCollide = false`, `CanQuery = false`) sized to `range * 2`. Tint `#3DDC6B` valid, `#E8333A` invalid.

3. **Placement is decided by the server, every time: surface, path clearance, spacing, cash, limit.**
   Why: a forged PlaceTower call can put a tower on the path, inside a wall, or for free.
   How: the client sends only `unitSlot` and a position; the server raycasts down to a part tagged `Placeable`, checks ≥ 3 studs from the path centerline, ≥ 2.5 studs from other towers, cash ≥ cost from server data, and per-player and per-unit caps (section 11).

4. **Enemies are data on the server, models on the client.**
   Why: Humanoid enemies cost server time per frame; a DevForum thread on enemy systems notes Humanoid state checks noticeably slow performance at high NPC counts [14], and a bandwidth thread on hundreds of enemies skips Humanoids entirely [15].
   How: the server keeps `{id, hp, dist, speed}` per enemy and moves `dist` along a precomputed path. Clients get spawn and death events reliably and position snapshots at 10 Hz on an `UnreliableRemoteEvent` [16], and render cheap models.

5. **Support 150 live enemies at 60 server FPS on the starter map before anything else is built.**
   Why: late waves and endless modes spike enemy counts; a framework author reports 300 enemies and 50 towers at about 6 ms frame time using Parallel Luau [17], so the target is reachable with data-driven enemies.
   How: Playtest runs a stress wave of 150 enemies with 20 towers and records server heartbeat in the Developer Console. Under 50 FPS means fix before content.

6. **Every wave has one readable idea; every fifth wave changes the question.**
   Why: twenty waves of the same enemy teach nothing and never pressure a build.
   How: wave N+5 introduces a new enemy trait (fast, armored, flying, hidden, splitting, healer). Show its icon and a 1-line tip in the wave banner the first time it appears.

7. **Enemy traits map to tower counters, and the counter is visible on the tower card.**
   Why: "this tower hits hidden/flying" is the reason to own it.
   How: tags on towers (`HitsHidden`, `HitsFlying`, `ArmorPierce`) shown as icons on the card and on the upgrade panel. A hidden enemy wave is announced one wave earlier: "Next wave: Hidden! You need a detector."

8. **Wave cash pays for about one upgrade per wave in the early game.**
   Why: the satisfying rhythm is "wave clear → spend". If cash piles up or never arrives, the loop stalls.
   How: in waves 1-10, wave bonus + kill cash ≈ the cost of the next upgrade tier of the starter tower (section 5). Balance simulates it.

9. **Upgrades must look different: every upgrade tier changes the model, the projectile or the VFX.**
   Why: a number going up is not a reward a 10-year-old can see.
   How: tier models or attached accessories in `ReplicatedStorage.Assets.Towers.<Name>.T1..T5`, swapped on upgrade; the tier pips show above the tower.

10. **The base has HP, not one life; losing HP is loud and recoverable.**
    Why: a single leak ending the match feels unfair; a health bar teaches.
    How: base HP 100 (starter) to 200 (hard); each enemy deals damage equal to its remaining HP / 10, bosses a fixed chunk. Red flash and sting sound per hit; at 25% the base bar pulses.

11. **Targeting modes are four, and the default is First.**
    Why: First (closest to the base) is what players expect; more modes add skill without clutter.
    How: First, Last, Strongest, Closest. Cycle with one button on the tower panel (gamepad: ButtonY while the panel is open).

12. **Selling refunds 50-70% and is instant between waves.**
    Why: refunds let players correct mistakes; full refunds make placement free.
    How: refund 60% of total spent (Config). Sell is blocked for 1 s after placement to stop accidental double taps.

13. **Speed-up is free and capped at 2× (3× on endless after wave 30).**
    Why: veterans replaying early waves get bored; speed is a quality-of-life tool, not a product.
    How: a vote among players in the match (majority) toggles a server-side `timeScale`; every timer and enemy step multiplies by it.

14. **Out-of-match rewards always pay, even on a loss.**
    Why: a loss with zero payout is a quit moment.
    How: pay coins and XP per wave survived (section 5), plus a first-clear bonus per map and mode. Show it on the result screen.

15. **Summon odds are shown in the banner, pity is shown as a counter, and both are enforced on the server.**
    Why: Roblox's paid random items policy requires showing all outcomes with numeric odds [18], and pity is the trust mechanic of anime TD: Anime Defenders guides describe a guaranteed Legendary every 50 summons and Mythic every 400 [7]; ALS guides describe base rates and pity too [19].
    How: rates live in `Config.Banners`, the summon screen lists every rarity with its percent, and a "Mythic in 37" counter comes from server data.

16. **A player can win every story map without spending Robux.**
    Why: paywalled progression is the fastest route to bad reviews and is out of studio policy.
    How: Balance runs the economy sim with a free player at 45 minutes a day and proves every story map is clearable within 14 days with free units.

17. **Co-op splits cash, never towers: each player places their own and sees whose is whose.**
    Why: shared cash invites griefing (one player spends everything).
    How: per-player cash; tower nameplates in the owner's color; a per-player placement cap (for example 20 towers) so one player can't fill the map.

18. **Every action works with touch, mouse and gamepad.**
    Why: placement is the core verb, and console players need it too (studio rule).
    How: touch: tap a hotbar slot, drag the ghost, tap Place. Mouse: click slot (or 1-6), click. Gamepad: d-pad or shoulder buttons pick the slot, the ghost follows a center reticle, ButtonA places, ButtonB cancels (section 7).

19. **The lobby is a playable space, not a menu.**
    Why: Roblox players expect to walk; the lobby shows other players' units and makes queues social.
    How: physical queue pads ("Easy 0/4", "Hard 2/4") with a 15 s countdown, a summon portal, a unit display stand, an upgrade NPC; all built as Instances in `Workspace.Map.Lobby`.

20. **Matches run in reserved servers; the lobby never runs a match.**
    Why: a lobby crowded with four maps of enemies lags everyone, and matches need a clean end.
    How: queue pads call `TeleportService:ReserveServer` and teleport the party with `TeleportOptions` carrying the map and mode; the match place loads data, runs, pays, and teleports back.

## 3. Top games in the genre

### Tower Defense Simulator (TDS)
**What it does:** The classic Roblox TD: a co-op squad defends against waves of zombies on rotating maps. Cash comes from clearing waves and at mission end [3]; coins unlock towers in tiers (Starter, then Intermediate, Advanced, Hardcore, which need coins, levels or other currency) [3]. Easy mode has 25 waves and is recommended for beginners [3]; a tutorial run teaches placement, upgrades and targeting [12]. Guides describe the game as forgiving only in the first waves, after which mistakes, bad upgrades and poor teamwork get punished [6].
**Steal:** Tiered tower unlocks gated by level; a short tutorial run; mode ladder with clear wave counts; co-op as the default way to learn.
**Avoid:** Copying its towers, zombie roster or names. The zombie-army look is its identity.

### Anime Defenders
**What it does:** Anime-style units from summon banners bought with gems; rarities run from Rare to Secret [4]. Banners rotate every few hours; one guide lists a Legendary guaranteed every 50 summons and Mythic every 400, with a rare-or-better pull resetting the counter (unverified against the current game) [7]. Gems come from story stages, challenges, daily and weekly missions, raids and AFK mode [7]. A Trait Reroll portal next to the summon portal spends Trait Crystals [11]; support units buff others or generate resources [20].
**Steal:** Banner rotation as a login reason; trait rerolls as a second sink for duplicates; support units that make team-building a puzzle; AFK gem trickle as a retention floor.
**Avoid:** Using real anime names or likenesses. We make original characters.

### Anime Last Stand (ALS)
**What it does:** Anime-style TD with a summon banner that changes through the day and a timer in the summon window [8]; guides list base rates (Rare 70%, Epic 27.5%, Legendary 2%, Mythic 0.5%) and a pity system [19], and a VIP summon discount and featured-unit drop chance [21]. Seasonal events bring limited units [9]. Community tier lists rank units heavily [18][22].
**Steal:** A visible banner timer; seasonal limited events; featured-unit rate-ups.
**Avoid:** Shifting rates without telling players; guides citing different odds over time show how quickly trust erodes [22].

### Anime Vanguards
**What it does:** An anime TD reported as passing Blox Fruits as the top-earning Roblox game [1]. Mechanics beyond that report are unverified in our sources.
**Steal:** Proof of market size for polished anime TD; the bar for polish is high.
**Avoid:** Entering the anime TD space without a fresh hook; the incumbents have deep rosters.

### Tower Defense X
**What it does:** A classic-style TD; its beginner guide advises placing towers near the enemy entrance to clear enemies faster and checking range first [23].
**Steal:** "Kill early" placement lessons taught in the first map.
**Avoid:** Assuming early placement is always right; design maps where the choice is interesting.

### Garden Tower Defense and themed TDs
**What it does:** TD reskinned onto a trending theme (plants as towers), covered by beginner guides [2]. Other themed TDs (toilets, toys, retro arcade) follow the same pattern; Retro Tower Defense has its own beginner guide [24]. Details of each game's systems are unverified.
**Steal:** A theme kids already love, applied consistently to towers, enemies and map.
**Avoid:** A theme that's only paint; the towers must play differently because of the theme.

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns in the lobby facing a glowing "PLAY" pad 12 studs ahead with a beam. No popups. | Spawn faces the pad; the daily reward waits until after match 1. |
| 3-10 s | Walks onto "Tutorial / Starter Map" pad; 3 s countdown (solo allowed). | Pad starts solo after 3 s if alone; fills from queue if others step on. |
| 10-20 s | Teleport (short loading screen with a tip). Arrives at the map, camera already framing the path and base. | Match place preloads map; loading screen ≤ 5 s. |
| 20-35 s | One hotbar slot pulses: "Tap to place your first tower." Ghost follows finger; range ring shows; one green "Place here" marker beside the first bend. | Highlight a strong first spot; any valid spot works. |
| 35-60 s | Wave 1: 4 slow enemies. The tower kills them in 2 hits each. "+$40" pops per kill. Wave bonus "+$100". | First kill ≤ 45 s after spawn in the map. |
| 60-90 s | "Tap your tower to upgrade" arrow; upgrade costs exactly what they have. Model changes visibly. | Rule 9. |
| 90-180 s | Waves 2-5: more enemies, first fast enemy at wave 4 with a banner tip. Player places tower 2. | One new idea per wave. |
| 180-270 s | Wave 6-8: first armored enemy; tip suggests upgrading. Speed-up button appears with a pulse. | Teach 2× after the player has seen the rhythm. |
| 270-300 s | Wave 10 mini-boss with an HP bar on top of screen; a win here feels big. Starter map continues to wave 15. | Boss HP tuned for 3 towers, 2 upgrades. |

After the first win (at ~10-12 min): result screen with coins, XP, a "first clear" bonus and a free unit or tower ("You unlocked Frost Turret!"). Back in the lobby the unit shop or summon portal pulses once.

Opening rules:
1. **No summon, shop or daily modal before match 1 ends.**
2. **The tutorial is the first match, not a separate lecture.** Teach with world arrows and one-line tips; never more than 8 words per tip.
3. **The player can't lose waves 1-5 on the starter map** even with one badly placed tower: enemy HP is tuned so even a tower at the far end clears them.
4. **Give a second tower type by wave 6** (a splash or slow tower) so the player makes a real choice.
5. **Mobile first:** the hotbar sits bottom-center clear of the thumbstick area; placement works with one thumb.

## 5. Progression and economy

### In-match cash
Targets (Balance tunes in `economy.md`):
- Starting cash `C0 = 600` (enough for 2 starter towers at 250 or one + upgrade).
- Kill cash `k(e) = round(enemyHp(e) / 5)`, min 2.
- Wave bonus `b(w) = 100 + 25·w`.
- Upgrade tier cost `u(t) = base · 1.6^t` for t = 1..4 (starter base 250: 400, 640, 1024, 1638).
- Tower DPS should rise faster than cost per tier: `dps(t) = dps0 · 1.9^t` (upgrades are better value than new towers, which keeps placement decisions meaningful).

### Enemy HP curve
For wave `w` on a map with difficulty multiplier `m` (Easy 0.8, Normal 1, Hard 1.5, Insane 2.2):
- Base enemy HP `h(w) = round(m · 20 · 1.12^w)`.
- Count `n(w) = 4 + floor(w · 1.3)`.
- Every 10th wave adds a boss with `HP = 25 · h(w)`.
- Speed: normal 6 studs/s, fast 10, armored 4 (armor flat −3 per hit, so low-damage fast towers are bad against it), flying 7 (ignores ground-only towers).

Worked example (Normal, m = 1):

| Wave | Enemy HP | Count | Wave total HP | Wave bonus | Kill cash (all) | Cumulative cash (incl. C0) |
|---|---|---|---|---|---|---|
| 1 | 22 | 5 | 112 | 125 | 20 | 745 |
| 5 | 35 | 10 | 352 | 225 | 70 | 1,480 |
| 10 | 62 | 17 | 1,054 + boss 1,550 | 350 | 520 | ≈3,600 |
| 20 | 193 | 30 | 5,790 + boss 4,825 | 600 | 2,120 | ≈15,000 |
| 30 | 599 | 43 | 25,757 + boss 14,975 | 850 | 8,150 | ≈60,000 |

Balance checks: the team's total DPS (from what that cash buys under the cost/DPS formulas) must exceed wave total HP divided by path travel time with a 1.3-2.0× margin on Easy and a 1.0-1.2× margin on Hard. Path travel time = path length / enemy speed; a 400-stud path at 6 studs/s is ~67 s, so the wave must die within that window.

### Out-of-match currency
- Coins per match `= 5 · wavesSurvived · m` + first clear per map/mode (500 Easy, 1,000 Normal, 2,000 Hard).
- XP per match `= 10 · wavesSurvived`; level `L` needs `100 · L^1.5` XP.
- Tower unlocks (classic): 3-4 starter towers free; next 6 cost 500-5,000 coins and need levels 3-20; top towers 10,000-50,000 coins or event currency.
- Target pace: a free player unlocks one tower every 1-2 sessions in week 1, every 3-4 sessions by week 3.

### Unit collection (gacha TD)
- Gems per match: 10-30 (story), 50-100 first clear; daily missions 100-150; AFK mode 5 gems per 10 minutes (cap per day).
- One summon = 50 gems; 10 summons = 450.
- Rates (studio default, all shown on screen): Rare 70%, Epic 25%, Legendary 4.5%, Mythic 0.5%. Pity: Legendary at 50, Mythic at 400 (both reset on hit). The numbers mirror the shape guides describe for ALS and Anime Defenders [19][7], not their exact values.
- Duplicates feed levels or a trait-reroll currency (Anime Defenders' Trait Crystal is the reference pattern [11]).
- Unit levels 1-50 with +2% stats per level; evolutions at level 50 cost materials from a specific stage, which sends players to replay content.
- Traits: 5-8 traits with weighted rolls (common +10% range up to rare +50% damage). Rerolls cost 1 trait currency each; never sell trait rerolls only for Robux.

Free-player check (Balance): with 45 min/day, a free player gets ~10 summons per day in week 1 and hits one Legendary pity in under a week.

## 6. Monetization that fits

TD spending is **collection** (summons, exclusive skins), **convenience** (speed, auto-skip, extra slots) and **status** (exclusive tower skins, titles). Never sell match-winning power that only Robux can buy on the main story path.

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Gem packs (small to huge) | Developer product | 49-1,999 R$ | Summon screen "+" next to the gem counter |
| 10× summon discount pass | Game pass | 199-399 R$ | Summon screen |
| Extra unit slot (6th or 7th hotbar slot) | Game pass | 249-499 R$ | Team edit screen (free players keep 5-6) |
| VIP (2× coins, chat tag, VIP lobby area) | Game pass | 199-499 R$ | Shop; ALS guides mention a VIP summon discount [21] |
| Auto-skip / 3× speed | Game pass | 99-199 R$ | Match settings; free 2× stays free |
| Exclusive tower skins | Game pass or product | 99-499 R$ | Skin shop, cosmetic only |
| Private server | Subscription | 100-200 R$/month | Server list [25] |
| Battle pass / event pass | Game pass per season | 399-799 R$ | Event board; free track always exists |

Rules:
1. **One `ProcessReceipt` in the whole place,** with receipt idempotency (store `PurchaseId`), following the obby page's ProductService pattern and the developer products docs [26][27]. The match place and lobby place each have their own single handler.
2. **Paid random items follow policy:** list all outcomes and numeric odds summing to 100% [18]; check `PolicyService:GetPolicyInfoForPlayerAsync` and its `ArePaidRandomItemsRestricted` field [28] and offer a direct-purchase alternative (gem pack → specific unit shop with rotating stock) where restricted.
3. **Gems bought with Robux and gems earned are the same gems,** so free players feel every summon is reachable.
4. **No mid-match purchase prompts.** The only in-match shop is cosmetic emotes and a "Revive base +50 HP" product, offered once per match at base HP 0 on non-ranked modes, with a 10 s countdown and a clear "No thanks". Never in endless boards.
5. **Passes check ownership on the server** with `UserOwnsGamePassAsync` in a `pcall` [29]; never trust a client flag.
6. **Off-limits:** paid-only story units, pity that resets on purchase, fake banner timers, odds hidden behind a button, units that only exist in loot boxes for Robux with no gem route.

## 7. UI and HUD for this genre

The TD HUD carries more than most genres: cash, wave, base HP, hotbar, selected tower panel. Keep the center of the screen clear: that's the battlefield. See [[05 UI and HUD]], [[08 Mobile]] and [[16 Console and Controllers]].

| Element | Position (UDim2 / AnchorPoint) | Size (offset at 1080p, UIScale) | Notes |
|---|---|---|---|
| Wave pill | (0.5, 0, 0, 12) / (0.5, 0) | 260×56 | "Wave 7 / 25", next-wave timer under it |
| Base HP bar | under wave pill | 320×18 | Green → yellow → red; numeric "84/100" |
| Cash | (0, 16, 0, 72) / (0, 0) | 200×48 | "$1,240" in green, pulses on income |
| Hotbar | (0.5, 0, 1, −16) / (0.5, 1) | 6 slots × 88×88, 8 px gap | Icon, cost, rarity border; greyed if unaffordable |
| Tower panel | (1, −16, 0.5, 0) / (1, 0.5) | 300×360 | Name, tier pips, stats, Upgrade (cost), Sell (refund), Target mode |
| Speed / skip | (1, −16, 0, 72) / (1, 0) | 64×64 each | 1×/2×, Skip Wave vote with count |
| Boss bar | (0.5, 0, 0, 80) / (0.5, 0) | 600×28 | Only during boss waves |
| Wave banner | (0.5, 0, 0.3, 0) | 480×80 | "Wave 8 — Armored!" + enemy icon, 2.5 s |
| Result screen | full | 900×600 | Waves, damage dealt per player, coins, XP, drops, Play Again / Lobby |

Rules:
1. **Hotbar bottom-center, clear of the thumbstick (bottom-left 300×300) and jump (bottom-right 260×260) zones.** On phones the hotbar sits 8 px above the bottom inset.
2. **The tower panel never covers the tower.** If the tower is on the right third of the screen, open the panel on the left.
3. **Every upgrade button shows the cost and the stat change ("DMG 12 → 22").**
4. **Damage numbers are optional** (Settings) and batched: one number per tower per 0.3 s.
5. **Gamepad placement:** shoulder buttons (ButtonL1/ButtonR1) or d-pad cycle hotbar slots; a placement reticle at screen center drives the ghost via a camera raycast; ButtonA places, ButtonB cancels; ButtonX on a selected tower upgrades, ButtonY cycles targeting. Bind with ContextActionService [30] and show button glyphs. Selecting placed towers uses a "nearest tower to reticle" snap, since gamepad users can't click small models.
6. **Lobby menus are ScreenGuis built in StarterGui** (Summon, Units, Shop, Settings), each with `GuiService.SelectedObject` set on open and B to close [31].
7. **Summon screen:** banner art, every unit with rarity and percent, pity counters, 1× and 10× buttons with gem cost, and the banner timer. Results reveal one card at a time with rarity color; "Skip" reveals all.

## 8. World and look

1. **The path reads in one glance.** A path 8-12 studs wide in a contrasting material (`Material.Cobblestone` or `Pavement` against `Grass`), clear edges (curbs or neon strips), and arrows at the spawn. Enemies enter from a visible portal or gate.
2. **Placeable ground looks placeable.** Placeable surfaces are tagged `Placeable` and share one look (flat, light, subtle grid texture); unplaceable areas are raised rocks, water or trees. Never make players guess.
3. **Bends are where strategy lives.** Each map has 3-6 bends where a tower's range covers two path segments; one obvious early spot near the entrance [23] and several "pro" spots.
4. **Map size:** path 300-600 studs long, playable area under 300×300 studs so the camera can frame it on a phone. Overhead camera default: 60° pitch, 80-120 studs out, with zoom.
5. **Enemy silhouettes differ by role:** fast = small and lean, armored = bulky with metal, flying = off the ground with a shadow decal, boss = 2-3× scale with a nameplate. Hidden enemies are semi-transparent shimmer only to players with a detector.
6. **Effects budget:** one projectile part or Beam per shot, pooled; particles ≤ 20 per hit; `CastShadow = false` on enemies and projectiles.
7. **Base is a landmark** at the path's end with HP visible as a BillboardGui; it cracks visually at 50% and 25%.
8. **Lighting:** bright daytime for starter maps (`ClockTime` 14), dusk or night for hard maps with neon enemy accents so enemies pop.
9. **Build maps as Instances in `Workspace.Map`** (Scenic), each map a Model with `Path` (waypoint parts named 1..N), `Placeable` surfaces, `Spawn` and `Base` parts. Match places keep only the current map; the rest live in `ServerStorage.Maps` and are parented in at match start.

## 9. Retention and social

1. **Daily missions** (win 1 match, place 20 towers, clear wave 15 on Normal) pay gems/coins; weekly missions pay a summon-ticket.
2. **Daily login streak** with a unit or skin at day 7 ([[10 Retention and Social]]).
3. **Badges** per map and mode, first boss, first Mythic, endless wave 50.
4. **Friends join in progress** between waves (up to the 4-player cap) and get the current wave's starting cash.
5. **Damage dealt per player** on the result screen and a "MVP" title for the top player per match.
6. **Endless leaderboards** (best wave per map) on ordered data stores [32][5], refreshed every 60 s, seasonal keys.
7. **Unit showcase:** a pedestal in the lobby showing each player's best unit; trading only if Reviewer approves a trade system (scam and dupe risk).
8. **Group bonus:** +10% coins for group members, checked on the server.
9. **Return hook:** the lobby board shows the current banner, the next banner's time and new maps.
10. **Codes** for gems on milestones (likes, visits) shown in the Settings menu, never a popup.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Classic TD | Every 2-3 weeks | 1 map or mode, 1-2 towers, 1 skin set |
| Anime TD | Weekly banners, big update every 2-4 weeks | 2-4 units, a story act or raid, trait or evolution changes |
| Events | Every 4-6 weeks | Event map, event currency, 1-3 limited units or skins |

Rules:
1. **Banners rotate on a schedule computed from server time** (`floor(os.time() / BANNER_SECONDS)` seeds the banner), so all servers agree and the timer is honest.
2. **New units ship with a challenge that suits them** (a flying-heavy map for an anti-air unit).
3. **Balance changes are announced in the lobby board** with before/after numbers; nerfing a paid unit gets a compensation gift.
4. **Event units stay obtainable later** through an event shop rerun or a harder route; "never again" units drive FOMO complaints.
5. **Watch the wave funnel per map:** the wave with the biggest share of losses is next update's tuning target ([33] funnel events).
6. **Endless boards reset per season** with a new key; the old top 10 go on a lobby Hall of Fame.

## 11. Building it in Studio

### Build order
1. **Architect** writes the shape (classic or gacha), match size (1-4), maps and modes, enemy traits, tower list with roles, and the place layout (lobby + match place) in `plan.md`.
2. **Balance** writes the cash, HP, DPS and unlock tables (section 5) and simulates a free player and a match per mode in `economy.md`.
3. **Scenic** builds the starter map as Instances: path waypoints (Parts named `1`..`N`, anchored, `CanCollide = false`, `Transparency = 1`), placeable surfaces tagged `Placeable`, `Spawn` and `Base` parts.
4. **Builder** writes `Config`, `PathService`, `EnemyService`, `WaveService`, `TowerService`, `MatchService`, and a stress test of 150 enemies (rule 5).
5. **Builder** writes the client `EnemyRenderer` (pooled models, interpolation) and `PlacementController` (ghost, range ring, touch/mouse/gamepad).
6. **Frame** builds the HUD, tower panel, result screen and lobby menus as ScreenGuis in StarterGui; one hotbar slot template cloned per slot.
7. **Librarian** provides tower tier models, enemy models (low part count, no Humanoid), projectiles and hit VFX.
8. **Playtest** runs the starter map at 1× and 2× on a phone and logs wave clear times; **Kid Tester** plays the first match.
9. **Builder** adds `LobbyService` (queue pads, ReserveServer teleports) and `PlayerData` in both places.
10. **Merchant** wires products, passes and the summon screen's gem flow; **Builder** writes `SummonService` with server odds and pity.
11. **Liveops** adds match-start, wave-reached, match-end and summon analytics.
12. **Reviewer** forges PlaceTower, Upgrade, Sell, Summon and teleport data; checks receipts and saves in both places.
13. **Producer** runs section 15 with evidence.

### Systems list
1. **PlayerData** (session lock, autosave 60 s, save on leave and BindToClose; both places use the same store).
2. **PathService** (waypoints → cumulative distances → `positionAt(dist)`).
3. **EnemyService** (server data, step, damage, death, leak, snapshots).
4. **WaveService** (wave tables, spawn timing, boss waves, endless generator).
5. **TowerService** (placement validation, upgrade, sell, targeting, attack).
6. **MatchService** (cash per player, base HP, speed vote, win/lose, rewards).
7. **LobbyService** (queue pads, party teleport).
8. **SummonService** (banners, odds, pity, duplicates).
9. **ProductService** (Merchant: single ProcessReceipt).
10. **EnemyRenderer**, **PlacementController**, **HudController** (client).

### Architecture
```
Lobby place
  Workspace/Map/Lobby        queue pads, summon portal, unit stands (Instances)
  ServerScriptService/Services/PlayerData, LobbyService, SummonService, ProductService
Match place
  ReplicatedStorage/
    Shared/Config            towers, enemies, modes, waves, prices (ids)
    Remotes/                 PlaceTower, UpgradeTower, SellTower, SetTarget, VoteSpeed, VoteSkip (C→S)
                             EnemySpawned, EnemyDied, EnemySnapshot (unreliable), MatchState, Toast (S→C)
    Assets/Towers, Enemies, Projectiles
  ServerStorage/Maps/<MapName>      Model: Path/1..N, Placeable parts, Spawn, Base
  ServerScriptService/Services/PlayerData, PathService, EnemyService, WaveService,
                               TowerService, MatchService, ProductService
  StarterPlayerScripts/Controllers/EnemyRenderer, PlacementController, HudController
  StarterGui/Hud, TowerPanel, Result (ScreenGuis built in Studio)
```
Placed towers are Models in `Workspace.Towers` with attributes `Owner` (UserId), `Unit`, `Tier`, `Target`. Enemies have no server Instances at all.

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit |
|---|---|---|---|---|---|
| PlaceTower | RemoteFunction | C→S | slot: number, pos: Vector3 | slot 1..6 equipped; raycast to `Placeable`; path clearance; spacing; cash; caps; match running | 4 per s |
| UpgradeTower | RemoteEvent | C→S | towerId: string | owner = player; tier < max; cash | 5 per s |
| SellTower | RemoteEvent | C→S | towerId: string | owner; placed ≥ 1 s ago | 5 per s |
| SetTarget | RemoteEvent | C→S | towerId, mode: string | owner; mode in allow-list | 5 per s |
| VoteSpeed / VoteSkip | RemoteEvent | C→S | (none) | in match; between waves for skip | 1 per s |
| EnemySpawned / EnemyDied | RemoteEvent | S→C | id, kind / id | — | — |
| EnemySnapshot | UnreliableRemoteEvent | S→C | ids, dists (arrays) | — | 10 Hz |
| MatchState | RemoteEvent | S→C | wave, baseHp, cash | — | on change |
| Summon | RemoteFunction (lobby) | C→S | banner: string, count: 1 or 10 | banner live; gems; policy | 1 per 2 s |

Server remotes follow the client-server boundary docs [34][35]: validate type, range and ownership; never take a cost, damage, reward or rarity from the client.

### Data schema
```lua
-- PlayerData v1 ("u_<UserId>")
{
	v = 1,
	coins = 0, gems = 0, xp = 0, level = 1,
	towers = {},            -- [towerName] = true (classic unlocks)
	units = {},             -- [uid] = { kind = "Frost", lvl = 1, trait = "None", evo = 0 }
	team = {},              -- slot 1..6 -> uid or towerName
	pity = {},              -- [bannerId] = { leg = 0, myth = 0 }
	clears = {},            -- ["Starter:Easy"] = true
	bestWave = {},          -- ["Starter:Endless"] = 0
	daily = { day = 0, done = {} },
	receipts = {},          -- [PurchaseId] = os.time(), last 50
	settings = { dmgNumbers = true, music = true },
}
```
Wrap every data-store call in `pcall` and respect limits [36][37].

### Luau: config (excerpt)
```lua
--!strict
-- ReplicatedStorage.Shared.Config
export type TowerDef = { cost: number, range: number, damage: number, cooldown: number,
	upgradeBase: number, flags: { [string]: boolean } }
export type EnemyDef = { hpMul: number, speed: number, armor: number, flying: boolean, hidden: boolean }

local Config = {
	START_CASH = 600,
	PATH_CLEARANCE = 3,      -- studs from path centerline
	TOWER_SPACING = 2.5,
	MAX_TOWERS_PER_PLAYER = 20,
	SELL_REFUND = 0.6,
	SNAPSHOT_HZ = 10,
	MAX_TIME_SCALE = 2,
	Modes = { Easy = 0.8, Normal = 1, Hard = 1.5, Insane = 2.2 },
	Towers = {
		Scoutling = { cost = 250, range = 14, damage = 6, cooldown = 0.8, upgradeBase = 250, flags = {} },
		FrostTurret = { cost = 400, range = 12, damage = 3, cooldown = 1.0, upgradeBase = 300, flags = { Slows = true } },
	} :: { [string]: TowerDef },
	Enemies = {
		Grunt = { hpMul = 1, speed = 6, armor = 0, flying = false, hidden = false },
		Runner = { hpMul = 0.6, speed = 10, armor = 0, flying = false, hidden = false },
		Tank = { hpMul = 2.5, speed = 4, armor = 3, flying = false, hidden = false },
	} :: { [string]: EnemyDef },
}
return Config
```

### Luau: the path (server and client share it)
```lua
--!strict
-- ReplicatedStorage.Shared.Path : built from the map's waypoint parts
local Path = {}
Path.__index = Path

export type PathObj = typeof(setmetatable({} :: { points: { Vector3 }, cum: { number }, length: number }, Path))

function Path.new(folder: Instance): PathObj
	local points: { Vector3 } = {}
	local i = 1
	while folder:FindFirstChild(tostring(i)) do
		points[i] = (folder:FindFirstChild(tostring(i)) :: BasePart).Position
		i += 1
	end
	assert(#points >= 2, "Path needs waypoints 1..N")
	local cum = { 0 }
	for k = 2, #points do
		cum[k] = cum[k - 1] + (points[k] - points[k - 1]).Magnitude
	end
	return setmetatable({ points = points, cum = cum, length = cum[#cum] }, Path)
end

function Path.positionAt(self: PathObj, dist: number): (Vector3, Vector3)
	local d = math.clamp(dist, 0, self.length)
	-- binary search the segment
	local lo, hi = 1, #self.cum
	while hi - lo > 1 do
		local mid = (lo + hi) // 2
		if self.cum[mid] <= d then lo = mid else hi = mid end
	end
	local a, b = self.points[lo], self.points[hi]
	local segLen = self.cum[hi] - self.cum[lo]
	local t = if segLen > 0 then (d - self.cum[lo]) / segLen else 0
	return a:Lerp(b, t), (b - a).Unit
end

-- Shortest distance from a point to the path in the XZ plane (placement clearance)
function Path.distanceTo(self: PathObj, p: Vector3): number
	local best = math.huge
	local flat = Vector3.new(p.X, 0, p.Z)
	for k = 1, #self.points - 1 do
		local a = Vector3.new(self.points[k].X, 0, self.points[k].Z)
		local b = Vector3.new(self.points[k + 1].X, 0, self.points[k + 1].Z)
		local ab = b - a
		local t = if ab.Magnitude > 0 then math.clamp((flat - a):Dot(ab) / ab:Dot(ab), 0, 1) else 0
		best = math.min(best, (flat - (a + ab * t)).Magnitude)
	end
	return best
end

return Path
```

### Luau: enemies as data (server)
```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes

export type Enemy = { id: number, kind: string, hp: number, maxHp: number, speed: number,
	dist: number, armor: number, slowMul: number, slowUntil: number }

local EnemyService = {}
EnemyService.alive = {} :: { [number]: Enemy }
EnemyService.timeScale = 1
EnemyService.onLeak = nil :: ((Enemy) -> ())?
EnemyService.onKill = nil :: ((Enemy, Player?) -> ())?

local nextId = 0
local path: any

function EnemyService.setPath(p: any) path = p end

function EnemyService.spawn(kind: string, baseHp: number)
	local def = Config.Enemies[kind]
	nextId += 1
	local hp = math.max(1, math.round(baseHp * def.hpMul))
	local e: Enemy = { id = nextId, kind = kind, hp = hp, maxHp = hp, speed = def.speed,
		dist = 0, armor = def.armor, slowMul = 1, slowUntil = 0 }
	EnemyService.alive[e.id] = e
	Remotes.EnemySpawned:FireAllClients(e.id, kind, hp)
end

function EnemyService.damage(e: Enemy, amount: number, by: Player?)
	if not EnemyService.alive[e.id] then return end
	e.hp -= math.max(1, amount - e.armor)
	if e.hp <= 0 then
		EnemyService.alive[e.id] = nil
		Remotes.EnemyDied:FireAllClients(e.id)
		if EnemyService.onKill then EnemyService.onKill(e, by) end
	end
end

local snapshotAcc = 0
RunService.Heartbeat:Connect(function(dt: number)
	local step = dt * EnemyService.timeScale
	local now = os.clock()
	for id, e in EnemyService.alive do
		local mul = if now < e.slowUntil then e.slowMul else 1
		e.dist += e.speed * mul * step
		if e.dist >= path.length then
			EnemyService.alive[id] = nil
			Remotes.EnemyDied:FireAllClients(id)
			if EnemyService.onLeak then EnemyService.onLeak(e) end
		end
	end
	snapshotAcc += dt
	if snapshotAcc >= 1 / Config.SNAPSHOT_HZ then
		snapshotAcc = 0
		local ids, dists = {}, {}
		for id, e in EnemyService.alive do
			table.insert(ids, id)
			table.insert(dists, math.floor(e.dist * 10) / 10)
		end
		Remotes.EnemySnapshot:FireAllClients(ids, dists) -- UnreliableRemoteEvent
	end
end)

return EnemyService
```
The client keeps a pooled model per enemy id, stores the last two snapshots, and every frame sets `model:PivotTo(CFrame.lookAt(pos, pos + dir))` from `path:positionAt(lerpedDist)` (plus its own speed × elapsed time for smoothness). `UnreliableRemoteEvent` payloads are size-limited and can drop [16]; at very high counts split snapshots into chunks of 200 or pack into a `buffer`. For tweening alternatives, DevForum replies favour one movement driver per enemy over tweening many parts [38].

### Luau: placement validation (server)
```lua
--!strict
local Players = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Match = require(script.Parent.MatchService)
local PlayerData = require(script.Parent.PlayerData)

local towersFolder = workspace:WaitForChild("Towers")
local lastCall: { [Player]: number } = {}
local placedCount: { [Player]: number } = {}

local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Include

local function validSurface(pos: Vector3): Vector3?
	rayParams.FilterDescendantsInstances = CollectionService:GetTagged("Placeable")
	local hit = workspace:Raycast(pos + Vector3.new(0, 10, 0), Vector3.new(0, -30, 0), rayParams)
	if not hit or hit.Normal.Y < 0.9 then return nil end
	return hit.Position
end

local function farFromTowers(pos: Vector3): boolean
	for _, t in towersFolder:GetChildren() do
		if t:IsA("Model") and (t:GetPivot().Position - pos).Magnitude < Config.TOWER_SPACING then
			return false
		end
	end
	return true
end

ReplicatedStorage.Remotes.PlaceTower.OnServerInvoke = function(player: Player, slot: unknown, pos: unknown)
	local now = os.clock()
	if (lastCall[player] or 0) + 0.25 > now then return false, "slow" end
	lastCall[player] = now
	if typeof(slot) ~= "number" or slot % 1 ~= 0 or slot < 1 or slot > 6 then return false, "slot" end
	if typeof(pos) ~= "Vector3" or pos.Magnitude ~= pos.Magnitude then return false, "pos" end -- NaN check
	if not Match.isRunning() then return false, "match" end
	local data = PlayerData.get(player)
	local towerName = data and data.team[slot]
	local def = towerName and Config.Towers[towerName]
	if not def then return false, "slot" end
	local ground = validSurface(pos)
	if not ground then return false, "surface" end
	if Match.path:distanceTo(ground) < Config.PATH_CLEARANCE then return false, "path" end
	if not farFromTowers(ground) then return false, "spacing" end
	if (placedCount[player] or 0) >= Config.MAX_TOWERS_PER_PLAYER then return false, "cap" end
	if not Match.trySpend(player, def.cost) then return false, "cash" end
	placedCount[player] = (placedCount[player] or 0) + 1
	Match.spawnTower(player, towerName :: string, ground)
	return true, "ok"
end

Players.PlayerRemoving:Connect(function(p) lastCall[p] = nil; placedCount[p] = nil end)
```
`Match.spawnTower` clones `ReplicatedStorage.Assets.Towers.<Name>.T0`, pivots it to `ground`, sets `Owner`, `Unit`, `Tier` attributes and parents to `Workspace.Towers`. The client never parents towers.

### Luau: targeting and attacks (server)
```lua
--!strict
local function pickTarget(origin: Vector3, range: number, mode: string, flags: { [string]: boolean },
	alive: { [number]: any }, path: any): any?
	local best, bestScore = nil, -math.huge
	for _, e in alive do
		local def = Config.Enemies[e.kind]
		if def.flying and not flags.HitsFlying then continue end
		if def.hidden and not flags.HitsHidden then continue end
		local pos = path:positionAt(e.dist)
		local d = (pos - origin).Magnitude
		if d > range then continue end
		local score = if mode == "First" then e.dist
			elseif mode == "Last" then -e.dist
			elseif mode == "Strongest" then e.hp
			else -d -- Closest
		if score > bestScore then best, bestScore = e, score end
	end
	return best
end
```
Each tower keeps `nextFire`; a single Heartbeat loop walks all towers, skips those not ready, calls `pickTarget`, applies damage via `EnemyService.damage`, and fires one reliable `TowerFired(towerId, enemyId)` event (or batches them into one event per frame) so clients play the projectile VFX. Splash towers damage every enemy within `splashRadius` of the target's position. With many towers, bucket enemies by path distance so each tower only checks nearby buckets.

### Luau: wave generator (server)
```lua
--!strict
local function buildWave(w: number, modeMul: number): { { kind: string, hp: number, gap: number } }
	local list = {}
	local baseHp = modeMul * 20 * 1.12 ^ w
	local count = 4 + math.floor(w * 1.3)
	for i = 1, count do
		local kind = "Grunt"
		if w >= 4 and i % 4 == 0 then kind = "Runner" end
		if w >= 7 and i % 6 == 0 then kind = "Tank" end
		table.insert(list, { kind = kind, hp = baseHp, gap = math.max(0.35, 1.2 - w * 0.02) })
	end
	if w % 10 == 0 then
		table.insert(list, { kind = "Tank", hp = baseHp * 25 / 2.5, gap = 2 }) -- boss: Tank x10 scale (hpMul 2.5)
	end
	return list
end
```
`WaveService` spawns entries with `task.wait(entry.gap / EnemyService.timeScale)`, waits until the wave is dead or the next-wave timer expires (default 20 s, skippable by vote), then pays the wave bonus to every player.

### Luau: summon with odds and pity (lobby server)
```lua
--!strict
type Rate = { rarity: string, weight: number }
local RATES: { Rate } = {
	{ rarity = "Rare", weight = 700 }, { rarity = "Epic", weight = 250 },
	{ rarity = "Legendary", weight = 45 }, { rarity = "Mythic", weight = 5 },
} -- per 1000; shown on the banner as 70 / 25 / 4.5 / 0.5 %
local LEG_PITY, MYTH_PITY = 50, 400
local rng = Random.new()

local function rollOne(p: { leg: number, myth: number }): string
	p.leg += 1; p.myth += 1
	local rarity: string
	if p.myth >= MYTH_PITY then rarity = "Mythic"
	elseif p.leg >= LEG_PITY then rarity = "Legendary"
	else
		local r, acc = rng:NextInteger(1, 1000), 0
		rarity = "Rare"
		for _, rate in RATES do
			acc += rate.weight
			if r <= acc then rarity = rate.rarity; break end
		end
	end
	if rarity == "Mythic" then p.myth = 0; p.leg = 0 elseif rarity == "Legendary" then p.leg = 0 end
	return rarity
end
```
`SummonService` checks the banner is live (from server time), deducts gems from server data first, rolls `count` times, picks a unit of that rarity from the banner pool, writes units and pity, marks data dirty, then returns the results for the reveal animation. If the policy check says paid random items are restricted, the 1×/10× buttons spend only earned gems and the direct-purchase shop is shown [28].

### Teleporting between lobby and match
Use `TeleportService:ReserveServer(matchPlaceId)` and `TeleportAsync` with `TeleportOptions` (`ReservedServerAccessCode`, `SetTeleportData({ map, mode })`) [39]. Teleport data from the client is not trusted: the match server reads the map and mode from the first player's join data, then validates both against `Config`. Save data in the lobby before teleporting (with session locking) and load in the match place.

## 12. Twists that work

1. **Hero TD:** one controllable hero per player walks the map with abilities, plus towers. Gives action players something to do between placements.
2. **Reverse TD:** one team defends, one sends waves using an income economy (PvP). Needs matchmaking and strict anti-stall timers.
3. **Themed TD on a trend:** plants, toys, food, monsters; towers act out the theme (sprinklers slow, seeds split) [2].
4. **Path-building TD:** players place walls to create the path (maze TD). Server pathfinding on a grid; never allow fully blocking the path.
5. **Roguelike TD:** after each boss, pick 1 of 3 random perks for the run; runs reset, perks unlock permanently.
6. **Raid bosses:** a weekly 4-player boss with a shared HP pool across servers (MemoryStore sum) and a reward tier per contribution.
7. **AFK mode:** a calm room that trickles gems for time spent (Anime Defenders has AFK gem income [7]); cap it daily.
8. **Simulator crossover:** units level from use, and a pet-style index of every unit collected ([[Genre - Simulator]]).
9. **Endless with mutators:** every 10 waves, the server picks a mutator (fast enemies, no selling, double cash) shown in the banner.
10. **Defend-the-convoy:** the base moves along a track; towers placed on the convoy itself.

## 13. Failure modes

1. **Server lag in late waves** from Humanoid enemies or per-enemy Instances moved by the server [15][14].
2. **Unreadable placement:** no range ring, unclear placeable ground, tiny path.
3. **First match lost.** The curve was tuned by the designer, not by a new player.
4. **Flat waves:** same enemy, more HP, no new question.
5. **Cash floods:** players max everything by wave 12 and the rest is idle.
6. **Client-trusted placement or damage:** towers on the path, infinite cash, one-shot bosses.
7. **Opaque gacha:** hidden odds, pity that's not shown, rates changing silently [18][22].
8. **Pay-to-progress walls:** story maps unclearable without paid units.
9. **Griefing in co-op:** one player sells or blocks the best spots; shared cash spent by one player.
10. **Teleport failures:** party split between servers, data not saved before teleport.
11. **Gamepad-impossible placement:** no reticle, no tower selection, no glyphs.
12. **A meta that never changes:** one unit dominates every tier list for months [18].
13. **Effects spam:** thousands of particles in late waves on phones.
14. **Copied IP:** real anime names, likenesses or another game's towers.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Shape chosen: classic TD, anime/gacha TD, or hybrid; the hook fits in five words.
- [ ] Market check (Pulse, `cli.mjs market`): what TDs chart now, and how our theme differs from the top three.
- [ ] We can ship 3 maps, 3 modes, 8+ towers or 20+ units, and an endless mode at launch.
- [ ] Original characters and theme; no anime IP.
- [ ] The data-driven enemy system and the 150-enemy stress test are in the plan.
- [ ] Lobby + match place with reserved-server teleports is in scope (Reviewer reads the teleport and save plan).
- [ ] Monetization fits without walls: gems, slots, VIP, skins, pass; free path proven by Balance.
- [ ] Paid random items: odds screen, pity counter, and the policy-restricted alternative are in scope.
- [ ] Update plan for 8 weeks: banners weekly, a map or units every 2-3 weeks, one event.
- [ ] Gamepad placement design exists before build.

## 15. Checklist

- [ ] A new player wins the starter map on first try on a phone (Kid Tester report).
- [ ] First kill within 45 s of arriving in the match.
- [ ] Range ring and valid/invalid tint show while placing on touch, mouse and gamepad.
- [ ] Forged PlaceTower calls (on the path, off the map, no cash, NaN, slot 99) all fail (Reviewer log).
- [ ] Upgrade, Sell and SetTarget reject towers owned by other players.
- [ ] 150 enemies + 20 towers keeps server heartbeat ≥ 50 FPS (Developer Console screenshot).
- [ ] Enemies have no Humanoids and no server Instances.
- [ ] Every 5th wave introduces a new enemy trait, announced in the banner.
- [ ] Every upgrade tier changes the tower's look.
- [ ] Speed-up 2× works and every timer respects `timeScale`.
- [ ] Losing still pays coins and XP; first-clear bonus pays once per map and mode.
- [ ] Summon screen lists every rarity with its percent; pity counter matches server data; rates sum to 100%.
- [ ] `PolicyService` check gates paid summons; restricted players see the direct shop.
- [ ] One `ProcessReceipt` per place; repeat receipts don't double-grant.
- [ ] Party teleport keeps the party together; data saved before teleport and loaded after.
- [ ] Hotbar and panels clear the thumb zones; gamepad can select every menu button and B closes.
- [ ] Endless board uses an ordered store with seasonal keys and `pcall`.
- [ ] Wave-reached funnel events fire per map and mode.

## Common mistakes

1. Humanoid enemies with `MoveTo` along waypoints, which stalls at high counts [14].
2. Firing a reliable remote per enemy per frame instead of batched unreliable snapshots [15][16].
3. Trusting the client's tower position or cost.
4. Placement checked only on the client ghost.
5. Range rings sized by radius instead of diameter (cylinder Size uses diameter).
6. Waves tuned on PC at 2× by a designer, never on a phone at 1×.
7. Upgrades that only change numbers.
8. Shared team cash.
9. A summon button with no odds screen [18].
10. Pity counters stored on the client or reset on rejoin.
11. Two scripts setting `ProcessReceipt` (lobby and match each need exactly one) [26].
12. Teleporting before saving, or trusting client teleport data.
13. Banner timers from each server's own clock instead of shared `os.time()`.
14. Tower selection impossible on gamepad.
15. Endless mode without a cap on enemy count per frame (spawn queue grows forever).
16. Events whose units never return.

## References

[1] Anime Vanguards surpasses Blox Fruits to become top-earning Roblox game (Beebom) — https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/
[2] Garden Tower Defense: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=360791 — a garden-themed TD.
[3] Tower Defense Simulator: A Beginner's Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/tower-defense-simulator-a-beginner-s-guide — cash from clearing waves and at mission end; tower tiers; Easy mode 25 waves.
[4] Anime Defenders: A Beginner's Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-a-beginner-s-guide — rarities Rare to Secret; gem summons.
[5] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md — global boards from ordered stores.
[6] TDS beginner's guide (BlueStacks, Russian) — https://www.bluestacks.com/ru/blog/game-guides/roblox/rl-tds-beginners-guide-ru.html — simple only in first waves; start in co-op; complete the tutorial.
[7] Anime Defenders banners guide (DroidGamers) — https://www.droidgamers.com/guides/anime-defenders-banners-guide/ — banners rotate every few hours; gem costs; pity at 50 (Legendary) and 400 (Mythic); gem sources.
[8] Anime Last Stand Units (Gamezebo) — https://www.gamezebo.com/walkthroughs/anime-last-stand-units/ — banners change through the day; summon window timer.
[9] Anime Last Stand Summer Event 2024 guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-summer-event-2024-guide — seasonal limited events.
[10] Tower Defense Simulator complete beginners guide (ItemLevel) — https://itemlevel.net/tower-defense-simulator-complete-beginners-guide/ — beginner economy of towers and matches.
[11] Anime Defenders Trait Tier List (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-trait-tier-list — Trait Reroll portal beside the summon portal; Trait Crystal per reroll.
[12] Tower Defense Simulator modes (Bloxodes) — https://bloxodes.com/wiki/tower-defense-simulator/modes — tutorial as a three-wave run teaching placement, upgrades, targeting.
[13] Tower Defense Simulator (Bloxodes wiki) — https://bloxodes.com/wiki/tower-defense-simulator — first steps: placing towers, reading range and enemy paths.
[14] Tower Defense: Enemy System (DevForum) — https://devforum.roblox.com/t/tower-defense-enemy-system/2667346/9 — Humanoid state checks slow performance at high NPC counts.
[15] Reducing bandwidth of an enemy system (DevForum) — https://devforum.roblox.com/t/how-can-i-heavily-reduce-the-bandwidth-of-this-enemy-system-foundation-code/4052181 — hundreds of enemies; path movement throttled; no Humanoids.
[16] UnreliableRemoteEvent reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/UnreliableRemoteEvent
[17] jTDF - High-Performance Tower Defense Framework (DevForum) — https://devforum.roblox.com/t/jtdf-high-performance-tower-defense-framework-parallel-luau/4061864 — Parallel Luau; 300 enemies and 50 towers at about 6 ms.
[18] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items — all outcomes and numeric odds totaling 100%.
[19] Anime Last Stand Summon Chances and Pity System Explained (GINX) — https://www.ginx.tv/en/anime-last-stand-summon-chances-pity-system — base rates Rare 70%, Epic 27.5%, Legendary 2%, Mythic 0.5%; pity.
[20] Anime Defenders: Support Units Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-support-units-guide — support units that buff or generate resources.
[21] Anime Last Stand Time King guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-time-king-guide-unit-overview-get — featured-unit drop chance; VIP summon discount.
[22] Anime Last Stand tier list (Twinfinite) — https://twinfinite.net/guides/anime-last-stand-tier-list/ — guides citing different banner odds over time.
[23] Beginner's guide to Roblox Tower Defense X (Sportskeeda) — https://sportskeeda.com/roblox-news/beginner-s-guide-roblox-tower-defense-x — place towers near the entrance; check range.
[24] Retro Tower Defense: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=367420 — a retro-themed TD.
[25] Private servers — https://create.roblox.com/docs/production/monetization/private-servers — free or monthly Robux fee.
[26] Developer products — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt required; test purchases.
[27] MarketplaceService.ProcessReceipt (engine reference) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService/ProcessReceipt
[28] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md — ArePaidRandomItemsRestricted.
[29] Passes — https://create.roblox.com/docs/production/monetization/passes — UserOwnsGamePassAsync in a pcall.
[30] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[31] GuiService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/GuiService
[32] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore — positive integer values; GetSortedAsync.
[33] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events — server-only funnel events with steps 1-100.
[34] Securing the client-server boundary (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/security/client-server-boundary
[35] Remote events and callbacks (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/events/remote
[36] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[37] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md
[38] Welds or tweens? (DevForum) — https://devforum.roblox.com/t/welds-or-tweens/2652613 — one tween on a primary part beats many; tweens for waypoint paths.
[39] TeleportOptions (engine reference) — https://create.roblox.com/docs/reference/engine/classes/TeleportOptions.md

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[16 Console and Controllers]] · [[17 Security and Anti-Cheat]] · [[Genre - RNG and Collection]] · [[Genre - Simulator]] · [[Genre - Obby]]
