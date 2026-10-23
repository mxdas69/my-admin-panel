---
tags: [vault, genre, tower-defense, td, anime-td, waves, units, gacha, co-op, strategy]
for: [lead, pulse, architect, builder, balance, scenic, frame, playtest, kid-tester]
also: [merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Tower Defense

A tower defense (TD) game sends enemies down a fixed path and asks players to stop them by placing and upgrading towers ("units") beside it, wave after wave. On Roblox it has two big shapes: **classic TD** (a map, a co-op squad of up to four, towers bought with match cash, a long unlock tree; the Tower Defense Simulator shape) and **anime/gacha TD** (the same match loop, but towers are collectible characters pulled from rotating summon banners, with traits, levels and evolutions; the Anime Defenders, Anime Last Stand and Anime Vanguards shape). Anime TD is among the platform's biggest earners: Beebom reported Anime Vanguards passing Blox Fruits as the top-earning Roblox game [1].

This page also covers hybrids: **themed TD** (gardens, toys, retro), **hero TD** (a walking hero plus towers), **reverse TD** (you send the waves) and **TD modes inside other genres**.

TD looks like a spreadsheet game, and that is the trap. It lives on **readable placement** (a new player knows where a tower can go and what it will hit before paying), **a wave curve that bends at the right moment** (the first match is won; by wave 10 upgrades matter), and **a meta loop that keeps paying** (new towers, maps, modes). The engineering trap is just as real: hundreds of Humanoid enemies will melt a phone server. Section 11 shows the data-driven alternative.

Read this page before pitching or planning any TD or TD mode, and before building enemy paths, wave spawners or placement systems in any genre. Pair it with [[02 The Core Loop]], [[03 Rarity and RNG]], [[04 Progression and Economy]], [[09 Shops and Monetization]] and [[17 Security and Anti-Cheat]].

## 1. What it is and why it works on Roblox

**The audience** (design assumptions):
- **Young strategy players** (about 9-14) who like "put the thing down, watch it work": clear ranges, big hits, visible upgrades. Sportskeeda's Tower Defense Simulator guide recommends Easy (25 waves) for beginners [2].
- **Collectors** (anime fans especially) who play for units: rarity, traits, evolutions, a team to show off. Anime Defenders' units run from Rare to Secret, pulled with gems [3].
- **Co-op squads** who clear hard modes together. Guides tell new TDS players to start in co-op to learn the mechanics [4].

**Session shape.** A match is 10-30 minutes: lobby, queue, 15-50 waves, a reward screen, back to the lobby to spend. Studio targets: first match under 12 minutes and winnable, 3+ matches per session, under 90 s in the lobby between matches.

**Why players come back.**
1. **Unlocks.** A new tower changes every map. TDS gates higher tower tiers behind coins, levels or other currency [2].
2. **Harder modes.** Easy → Normal → Hard → endless, each a named wall.
3. **Collection.** Banners rotate every few hours in Anime Defenders [5] and through the day in Anime Last Stand [6]; "the banner might have my unit" is a login reason.
4. **Events.** Limited units and maps (ALS has run seasonal events [7]).
5. **Mastery.** Placement and targeting are skills; clearing Hard with cheap towers is a brag.

**Why it works on Roblox.** Four-friend co-op is free, matches fit short sessions, placement is a tap (phones), and spending happens between matches, so shop moments never interrupt play. It reuses the platform's taste for collection from [[Genre - RNG and Collection]].

## 2. The core loop

**Loop statement (classic TD):**
> Players **place and upgrade towers** to **survive waves and win the match**, which pays **coins and XP**, which they spend on **new towers and skins** so they can **beat harder modes and maps** [2][8].

**Loop statement (anime/gacha TD):**
> Players **clear stages with their unit team** to earn **gems and materials**, which they spend on **summons, trait rerolls and evolutions** so they can **clear the next act, raid or challenge** [3][5][9].

**Loop statement (endless):**
> Players **hold out on an endless wave curve** to **beat their best wave and climb a board**, so they can **try a better build next run**.

| Layer | Time scale | What happens | Reward beat |
|---|---|---|---|
| Micro | 0.2-2 s | A tower fires, an enemy pops | Hit VFX, cash tick |
| Short | 20-60 s | A wave is cleared | Wave bonus, an upgrade becomes affordable |
| Match | 10-30 min | Map won or lost at wave N | Coins, XP, gems, first-clear bonus |
| Session | 30-60 min | 3+ matches | A new tower or unit, a level |
| Long | days-weeks | A new mode cleared, collection grows | Badges, event units, board rank |

### Tower defense rules

1. **The first match is winnable by every new player within 12 minutes.**
   Why: a loss before the loop makes sense reads as "too hard". TDS opens with a short tutorial run teaching placement, upgrades and targeting [10].
   How: starter map of 15 waves; the starter tower solos waves 1-5; 3 towers + 2 upgrades clear wave 15. Kid Tester wins it first try on a phone.

2. **Range shows before the player pays: a ring on the ground, green if valid, red if not.**
   Why: placement is the core decision; TDS guides list reading range and enemy paths as first steps [11].
   How: client ghost model plus a flat Cylinder part (`CanCollide`/`CanQuery` off, Transparency 0.7, Size = range × 2) tinted `#3DDC6B` / `#E8333A`.

3. **The server decides placement every time: surface, path clearance, spacing, cash, cap.**
   Why: a forged call can put a tower on the path or for free.
   How: client sends only a hotbar slot and a position; server raycasts to a `Placeable` part, needs ≥ 3 studs from the path centerline and ≥ 2.5 studs from other towers, takes cost from server data (section 11).

4. **Enemies are data on the server and models on the client.**
   Why: a DevForum enemy-system thread notes Humanoid state checks noticeably slow servers at high NPC counts [12]; a thread on hundreds of enemies skips Humanoids entirely [13].
   How: the server keeps `{id, hp, dist, speed}` per enemy and advances `dist` along a precomputed path; clients get spawn/death events and 10 Hz position snapshots on an `UnreliableRemoteEvent` [14].

5. **150 live enemies + 20 towers holds 60 server FPS before any content is built.**
   Why: late and endless waves spike counts; a framework author reports 300 enemies and 50 towers at about 6 ms frame time with Parallel Luau [15], so data-driven enemies make this reachable.
   How: Playtest runs a stress wave and screenshots server heartbeat in the Developer Console; under 50 FPS blocks content work.

6. **Every 5th wave adds one new enemy trait, announced with an icon and an 8-word tip.**
   Why: twenty waves of one enemy never pressure a build.
   How: wave 4 fast, 7 armored, 12 flying, 17 hidden, 22 splitting, 27 healer; banner "Wave 12 — Flying! Use anti-air."

7. **Every enemy trait has a tower counter, and the counter shows as an icon on the tower card.**
   Why: "this tower hits flying" is the reason to unlock it.
   How: tower flags `HitsFlying`, `HitsHidden`, `ArmorPierce`, `Slows`; hidden waves are warned one wave early.

8. **Early wave income buys about one upgrade per wave.**
   Why: the rhythm "wave clear → spend" is the loop; piles of cash or none stall it.
   How: in waves 1-10, wave bonus + kill cash ≈ the next upgrade tier of the starter tower (section 5).

9. **Every upgrade tier changes the tower's model, projectile or VFX.**
   Why: a number going up is not a reward a 10-year-old sees.
   How: tier models `Assets.Towers.<Name>.T0..T4` swapped on upgrade; tier pips above the tower.

10. **The base has 100-200 HP, not one life, and every hit is loud.**
    Why: one leak ending a match feels unfair; a health bar teaches.
    How: leak damage = remaining enemy HP / 10 (bosses a fixed chunk); red flash and sting per hit; bar pulses under 25%.

11. **Four targeting modes, default First.**
    Why: First (closest to base) is expected; four modes add skill without clutter.
    How: First, Last, Strongest, Closest, cycled by one button (gamepad ButtonY).

12. **Selling refunds 60% of everything spent on that tower.**
    Why: refunds let players fix mistakes; full refunds make placement free.
    How: `SELL_REFUND = 0.6`; selling is blocked for 1 s after placement to stop double taps.

13. **Speed-up is free, voted, and capped at 2× (3× in endless after wave 30).**
    Why: veterans replaying early waves get bored; speed is quality of life, not a product.
    How: majority vote sets a server `timeScale`; every timer and enemy step multiplies by it.

14. **A lost match still pays coins and XP per wave survived.**
    Why: zero payout on a loss is a quit moment.
    How: section 5 formulas plus a one-time first-clear bonus per map and mode, shown on the result screen.

15. **Summon odds are on the banner, pity is a visible counter, and both live on the server.**
    Why: Roblox's paid random items policy requires every outcome with numeric odds [16]; pity is the trust mechanic, e.g. a guide describes Anime Defenders guaranteeing a Legendary every 50 summons and Mythic every 400 [5], and ALS guides describe rates and pity [17].
    How: rates in `Config.Banners`; the banner lists every rarity with its percent; "Mythic in 37" comes from server data.

16. **Every story map is clearable without Robux within 14 days of free play.**
    Why: paywalled progress kills reviews and is against studio policy.
    How: Balance simulates a free player at 45 min/day and proves it in `economy.md`.

17. **Co-op cash is per player, and each player sees whose tower is whose.**
    Why: shared cash invites one player to spend everything.
    How: per-player cash, nameplates in the owner's color, a 20-tower cap per player.

18. **Placement works with touch, mouse and gamepad.**
    Why: placement is the core verb; console is a studio rule.
    How: touch drag-and-tap Place; mouse click or keys 1-6; gamepad L1/R1 pick a slot, a center reticle drives the ghost, A places, B cancels (section 7).

19. **The lobby is a place to walk, not a menu.**
    Why: Roblox players expect to move around and see others' units; physical queues are social.
    How: queue pads ("Hard 2/4", 15 s countdown), a summon portal and unit stands, built as Instances in `Workspace.Map.Lobby`.

20. **Matches run in reserved servers; the lobby never runs a match.**
    Why: maps full of enemies in the lobby lag everyone, and matches need a clean end.
    How: queue pads call `TeleportService:ReserveServer` and teleport the party with `TeleportOptions` [18]; the match place pays rewards and sends players back.

## 3. Top games in the genre

### Tower Defense Simulator (TDS)
**What it does:** The classic Roblox TD: a squad holds off zombie waves on rotating maps. Cash comes from clearing waves and at mission end; towers unlock in tiers (Starter, Intermediate, Advanced, Hardcore) for coins, levels or other currency; Easy has 25 waves [2]. A short tutorial teaches placement, upgrades and targeting [10]. Guides say it's forgiving only in the first waves [4].
**Steal:** Level-gated tower tiers; a tutorial that is a real run; a mode ladder with known wave counts; co-op as the way to learn.
**Avoid:** Its towers, zombie roster, names or look.

### Anime Defenders
**What it does:** Anime-style units from gem banners, Rare to Secret [3]. Banners rotate every few hours; one guide lists pity at 50 (Legendary) and 400 (Mythic), reset by a rare-or-better pull (unverified against the current game); gems come from story stages, challenges, daily and weekly missions, raids and an AFK mode [5]. A Trait Reroll portal beside the summon portal spends Trait Crystals [9]; support units buff others or make resources [19].
**Steal:** Banner rotation as a login reason; trait rerolls as a second sink; support units that make team-building a puzzle; AFK gems as a retention floor.
**Avoid:** Real anime names or likenesses; we make original characters.

### Anime Last Stand (ALS)
**What it does:** Anime TD with a banner that changes through the day and a timer in the summon window [6]; one guide lists base rates of Rare 70%, Epic 27.5%, Legendary 2%, Mythic 0.5% and a pity system [17]; another mentions a VIP summon discount and featured-unit chances [20]. Seasonal events bring limited units [7].
**Steal:** A visible banner timer; featured rate-ups; seasonal events.
**Avoid:** Changing rates quietly; guides quoting different odds over time show how trust erodes [21].

### Anime Vanguards
**What it does:** Anime TD reported as passing Blox Fruits as the top-earning Roblox game [1]. Its systems are unverified in our sources.
**Steal:** Proof the polished anime TD market is large.
**Avoid:** Entering it without a fresh hook; incumbents have deep rosters.

### Tower Defense X
**What it does:** Classic-style TD whose beginner guide advises placing towers near the entrance and checking range first [22].
**Steal:** Teach "kill early" placement on the first map.
**Avoid:** Maps where one spot is always right.

### Themed TDs (Garden Tower Defense, Retro Tower Defense)
**What it does:** TD on a trending theme, with beginner guides of their own [23][24]; their systems are unverified.
**Steal:** A theme kids love, applied to towers, enemies and map.
**Avoid:** A theme that's only paint; towers should play differently because of it.

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns in the lobby facing a glowing PLAY pad 12 studs ahead with a beam. No popups. | Daily reward waits until after match 1. |
| 3-10 s | Steps on "Starter Map"; 3 s countdown, solo allowed. | Pad starts alone after 3 s; others can join. |
| 10-20 s | Teleport; loading screen ≤ 5 s with one tip; arrives with the camera framing path and base. | Match place preloads the map. |
| 20-35 s | Hotbar slot 1 pulses: "Tap to place a tower." Ghost and ring follow the finger; a green marker suggests the first bend. | Any valid spot works. |
| 35-60 s | Wave 1: 5 slow enemies, 2 hits each; "+$4" per kill, "+$125" wave bonus. | First kill ≤ 45 s after arrival. |
| 60-90 s | Arrow: "Tap your tower to upgrade." Cost equals cash on hand; the model visibly changes. | Rule 9. |
| 90-180 s | Waves 2-5; the first fast enemy at wave 4 with a banner tip; player places tower 2. | One idea per wave. |
| 180-270 s | Waves 6-8: first armored enemy; a second tower type (slow or splash) unlocks free. Speed button pulses once. | Real choice by wave 6. |
| 270-300 s | Wave 10 mini-boss with a top HP bar. Match continues to wave 15. | Tuned for 3 towers + 2 upgrades. |

After the first win (~10-12 min): coins, XP, first-clear bonus and a free tower ("You unlocked Frost Turret!"). Back in the lobby the summon portal or tower shop pulses once.

Opening rules:
1. **No summon, shop or daily modal before match 1 ends.**
2. **The tutorial is the first match**, taught with world arrows and tips of ≤ 8 words.
3. **Waves 1-5 can't be lost** even with one badly placed tower.
4. **A second tower type by wave 6** so the player makes a real choice.
5. **One-thumb placement on phones**, hotbar clear of the thumbstick.

## 5. Progression and economy

### In-match cash (targets; Balance tunes in `economy.md`)
- Starting cash `C0 = 600` (two starter towers at 250, or one plus an upgrade).
- Kill cash `k = max(2, round(enemyHp / 5))`. Wave bonus `b(w) = 100 + 25·w`.
- Upgrade tier cost `u(t) = base · 1.6^t`, t = 1..4 (base 250: 400, 640, 1,024, 1,638).
- Tier DPS `dps(t) = dps0 · 1.9^t`: upgrades beat new towers on value, so "upgrade or spread" stays a decision.

### Enemy curve
Mode multiplier `m`: Easy 0.8, Normal 1, Hard 1.5, Insane 2.2. Base HP `h(w) = round(m · 20 · 1.12^w)`; count `n(w) = 4 + floor(1.3·w)`; every 10th wave adds a boss at `25 · h(w)`. Speeds: normal 6 studs/s, fast 10, armored 4 (flat −3 per hit), flying 7.

| Wave (Normal) | Enemy HP | Count | Wave HP (+boss) | Wave bonus | Cumulative cash |
|---|---|---|---|---|---|
| 1 | 22 | 5 | 110 | 125 | ≈750 |
| 5 | 35 | 10 | 350 | 225 | ≈1,500 |
| 10 | 62 | 17 | 1,054 + 1,550 | 350 | ≈3,600 |
| 20 | 193 | 30 | 5,790 + 4,825 | 600 | ≈15,000 |
| 30 | 599 | 43 | 25,757 + 14,975 | 850 | ≈60,000 |

Balance check: the DPS that cumulative cash buys must kill the wave within its path travel time (path length ÷ speed; 400 studs at 6 studs/s ≈ 67 s) with a 1.3-2.0× margin on Easy and 1.0-1.2× on Hard.

### Out-of-match progress
- Coins per match `= 5 · wavesSurvived · m`; first clear 500 / 1,000 / 2,000 (Easy / Normal / Hard).
- XP `= 10 · wavesSurvived`; level L needs `100 · L^1.5` XP.
- Classic unlocks: 3-4 free starters; next 6 at 500-5,000 coins and levels 3-20; top towers 10,000-50,000 coins or event currency. Pace: one unlock every 1-2 sessions in week 1, every 3-4 by week 3.

### Unit collection (gacha TD)
- Gems: 10-30 per story clear, 50-100 first clear, 100-150 from dailies, 5 per 10 min AFK (daily cap). One summon 50 gems, ten for 450.
- Studio default rates (shown on screen): Rare 70%, Epic 25%, Legendary 4.5%, Mythic 0.5%; pity Legendary 50, Mythic 400. This copies the *shape* guides describe [5][17], not any game's exact values.
- Duplicates feed unit levels or trait currency (the Trait Crystal pattern [9]). Levels 1-50 at +2% stats per level; evolution at 50 needs materials from a specific stage, which sends players back to replay.
- Traits: 5-8, weighted (common +10% range up to rare +50% damage); rerolls always have a free route.
- Free-player check: ~10 summons a day in week 1, first Legendary pity inside a week.

## 6. Monetization that fits

TD spending is **collection** (summons, skins), **convenience** (speed, slots, auto-skip) and **status** (exclusive skins, titles). Never sell story-winning power that only Robux can buy.

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Gem packs | Developer product | 49-1,999 R$ | "+" beside the gem counter |
| 10× summon discount | Game pass | 199-399 R$ | Summon screen |
| Extra hotbar slot (6th/7th) | Game pass | 249-499 R$ | Team edit (free players keep 5-6) |
| VIP (2× coins, tag, VIP lobby corner) | Game pass | 199-499 R$ | Shop (ALS guides mention a VIP summon discount [20]) |
| 3× speed / auto-skip | Game pass | 99-199 R$ | Match settings; 2× stays free |
| Tower skins | Pass or product | 99-499 R$ | Skin shop, cosmetic only |
| Private server | Subscription | 100-200 R$/month | Server list [25] |
| Event pass | Pass per season | 399-799 R$ | Event board; a free track always exists |

Rules:
1. **One `ProcessReceipt` per place** (lobby and match each have exactly one), granting idempotently by `PurchaseId` as in the obby page's ProductService [26][27].
2. **Paid random items follow policy:** all outcomes with odds summing to 100% [16]; check `PolicyService:GetPolicyInfoForPlayerAsync().ArePaidRandomItemsRestricted` [28] and show a direct-purchase unit shop where restricted.
3. **Bought and earned gems are the same gems.**
4. **No purchase prompts mid-wave.** The only in-match offer is "Revive base +50 HP", once per match at 0 HP, non-ranked modes only, with a visible "No thanks".
5. **Pass ownership is checked on the server** with `UserOwnsGamePassAsync` in a `pcall` [29].
6. **Off-limits:** paid-only story units, pity reset by purchase, fake banner timers, hidden odds, Robux-only loot boxes with no gem route.

## 7. UI and HUD for this genre

Keep the screen center clear: it is the battlefield. See [[05 UI and HUD]], [[08 Mobile]], [[16 Console and Controllers]].

| Element | Position (UDim2 / AnchorPoint) | Size (1080p offsets, UIScale) | Notes |
|---|---|---|---|
| Wave pill | (0.5, 0, 0, 12) / (0.5, 0) | 260×56 | "Wave 7 / 25", next-wave timer below |
| Base HP bar | under the pill | 320×18 | Green → yellow → red, "84/100" |
| Cash | (0, 16, 0, 72) / (0, 0) | 200×48 | Green, pulses on income |
| Hotbar | (0.5, 0, 1, −16) / (0.5, 1) | 6 × 88×88, 8 px gap | Icon, cost, rarity border, grey if unaffordable |
| Tower panel | (1, −16, 0.5, 0) / (1, 0.5) | 300×360 | Tier pips, stats, Upgrade (cost, "DMG 12 → 22"), Sell (refund), Target |
| Speed / Skip | (1, −16, 0, 72) / (1, 0) | 64×64 each | 1×/2×, skip vote count |
| Boss bar | (0.5, 0, 0, 80) / (0.5, 0) | 600×28 | Boss waves only |
| Wave banner | (0.5, 0, 0.3, 0) / (0.5, 0.5) | 480×80 | Trait icon + tip, 2.5 s |
| Result | centered | 900×600 | Waves, damage per player, rewards, Play Again / Lobby |

Rules:
1. **Hotbar bottom-center, clear of the 300×300 thumbstick and 260×260 jump zones.**
2. **The tower panel never covers its tower**: open it on the opposite side of the screen.
3. **Damage numbers are a setting**, batched to one per tower per 0.3 s.
4. **Gamepad:** L1/R1 cycle slots, a center reticle raycasts the ghost position, A places, B cancels; on a selected tower X upgrades, Y cycles targeting. Selecting placed towers snaps to the tower nearest the reticle. Bind with ContextActionService [30] and show glyphs.
5. **Lobby menus** (Summon, Units, Shop, Settings) are ScreenGuis built in StarterGui; on open set `GuiService.SelectedObject` [31]; B closes.
6. **Summon screen:** banner art, every unit with rarity and percent, pity counters, 1×/10× with gem cost, the banner timer; results reveal card by card with a Skip.

## 8. World and look

1. **The path reads in one glance:** 8-12 studs wide, a contrasting material (`Cobblestone` or `Pavement` on `Grass`), curbs or neon edge strips, arrows at the spawn gate.
2. **Placeable ground looks placeable:** tagged `Placeable`, flat, light, a subtle grid texture; blocked ground is rocks, water or trees.
3. **Bends are strategy:** 3-6 bends where one ring covers two segments, one obvious spot near the entrance [22], several "pro" spots.
4. **Size:** path 300-600 studs, play area under 300×300 studs; default camera pitch 60°, 80-120 studs out.
5. **Silhouettes by role:** fast = small and lean, armored = bulky metal, flying = raised with a shadow decal, boss = 2-3× scale with nameplate, hidden = shimmer only for players with a detector.
6. **Effects budget:** one pooled projectile or Beam per shot, ≤ 20 particles per hit, `CastShadow = false` on enemies and projectiles.
7. **The base is a landmark** with a BillboardGui HP bar; it cracks at 50% and 25%.
8. **Lighting:** bright day (`ClockTime` 14) on starter maps; dusk with neon enemy accents on hard maps.
9. **Maps are Instances** (Scenic): each a Model with `Path` (Parts `1..N`, anchored, invisible, no collision), `Placeable` parts, `Spawn` and `Base`. Unused maps sit in `ServerStorage.Maps` and are parented in at match start.

## 9. Retention and social

1. **Daily missions** (win 1 match, place 20 towers, reach wave 15 on Normal) pay gems or coins; weeklies pay a summon ticket.
2. **Login streak** with a unit or skin on day 7 ([[10 Retention and Social]]).
3. **Badges:** each map × mode, first boss, first Mythic, endless wave 50.
4. **Friends join between waves** (up to 4) with the current wave's starting cash.
5. **Damage per player and an MVP title** on the result screen.
6. **Endless boards** (best wave per map) on ordered data stores [32][33], refreshed every 60 s, seasonal keys.
7. **Unit stands** in the lobby show each player's best unit. Trading only with a Reviewer-approved design (scam and dupe risk).
8. **Group bonus** +10% coins, checked on the server.
9. **Lobby board** shows the current and next banner and new maps.
10. **Codes** in Settings, never as a popup.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Classic TD | Every 2-3 weeks | 1 map or mode, 1-2 towers, a skin set |
| Anime TD | Banners weekly; update every 2-4 weeks | 2-4 units, an act or raid, trait or evolution changes |
| Events | Every 4-6 weeks | Event map and currency, 1-3 limited units or skins |

Rules:
1. **Banners come from shared time:** `floor(os.time() / BANNER_SECONDS)` seeds the banner, so every server agrees and the timer is honest.
2. **New units ship with a map that suits them** (anti-air unit, flying-heavy map).
3. **Balance changes are posted on the lobby board** with before/after numbers; a nerfed paid unit comes with a gift.
4. **Event units return** via a rerun shop or a harder route.
5. **Watch the wave funnel per map** ([34]); the wave with the most losses is next update's tuning target.
6. **Endless boards reset per season**; the old top 10 go on a Hall of Fame.

## 11. Building it in Studio

### Build order
1. **Architect:** shape, squad size, maps, modes, enemy traits, tower roles, lobby + match place layout in `plan.md`.
2. **Balance:** cash, HP, DPS, unlock and summon tables plus free-player and per-mode sims in `economy.md`.
3. **Scenic:** the starter map as Instances (path waypoints, `Placeable`, `Spawn`, `Base`).
4. **Builder:** `Config`, `Path`, `EnemyService`, `WaveService`, `TowerService`, `MatchService`, then the 150-enemy stress test (rule 5).
5. **Builder:** client `EnemyRenderer` (pooled models, interpolation) and `PlacementController` (ghost, ring, touch/mouse/gamepad).
6. **Frame:** HUD, tower panel, result and lobby menus as ScreenGuis; one hotbar slot template cloned per slot.
7. **Librarian:** tower tier models, Humanoid-free enemy models, projectiles, hit VFX.
8. **Playtest / Kid Tester:** starter map at 1× and 2× on a phone; first-match report.
9. **Builder:** `LobbyService` (queue pads, reserved-server teleports), `PlayerData` in both places, `SummonService`.
10. **Merchant:** products and passes; **Liveops:** match, wave and summon analytics.
11. **Reviewer:** forges every remote and teleport payload; checks receipts and saves in both places.
12. **Producer:** section 15 with evidence.

### Architecture
```
Lobby place
  Workspace/Map/Lobby          queue pads, summon portal, unit stands
  ServerScriptService/Services PlayerData, LobbyService, SummonService, ProductService
Match place
  ReplicatedStorage/Shared     Config, Path
  ReplicatedStorage/Remotes    PlaceTower (RF), UpgradeTower, SellTower, SetTarget, VoteSpeed, VoteSkip (C→S)
                               EnemySpawned, EnemyDied, TowerFired, MatchState (S→C), EnemySnapshot (unreliable)
  ReplicatedStorage/Assets     Towers/<Name>/T0..T4, Enemies, Projectiles
  ServerStorage/Maps/<Map>     Path/1..N, Placeable parts, Spawn, Base
  ServerScriptService/Services PlayerData, EnemyService, WaveService, TowerService, MatchService, ProductService
  StarterPlayerScripts         EnemyRenderer, PlacementController, HudController
  StarterGui                   Hud, TowerPanel, Result (built in Studio)
```
Placed towers are Models in `Workspace.Towers` with attributes `Owner` (UserId), `Unit`, `Tier`, `Target`. Enemies have no server Instances.

### Remotes contract

| Remote | Dir | Args | Server checks | Limit |
|---|---|---|---|---|
| PlaceTower (RemoteFunction) | C→S | slot, pos: Vector3 | slot 1..6 equipped; ray hits `Placeable`; path clearance; spacing; cash; cap; match running | 4/s |
| UpgradeTower | C→S | towerId | owner; tier < max; cash | 5/s |
| SellTower | C→S | towerId | owner; placed ≥ 1 s ago | 5/s |
| SetTarget | C→S | towerId, mode | owner; mode in allow-list | 5/s |
| VoteSpeed / VoteSkip | C→S | — | in match; skip only between waves | 1/s |
| EnemySnapshot (Unreliable) | S→C | ids, dists | — | 10 Hz |
| Summon (lobby, RemoteFunction) | C→S | bannerId, count 1 or 10 | banner live by server time; gems; policy | 1 per 2 s |

Validate type, range and ownership; never take cost, damage, reward or rarity from the client [35][36].

### Data schema
```lua
-- PlayerData v1 ("u_<UserId>"), shared by lobby and match places
{
	v = 1, coins = 0, gems = 0, xp = 0, level = 1,
	towers = {},      -- [towerName] = true
	units = {},       -- [uid] = { kind = "Frost", lvl = 1, trait = "None", evo = 0 }
	team = {},        -- slot 1..6 -> towerName or uid
	pity = {},        -- [bannerId] = { leg = 0, myth = 0 }
	clears = {},      -- ["Starter:Easy"] = true
	bestWave = {},    -- ["Starter:Endless"] = 0
	receipts = {},    -- [PurchaseId] = os.time(), last 50
	settings = { dmgNumbers = true, music = true },
}
```
Session-lock, autosave every 60 s, save on leave, on `BindToClose` and before teleport; `pcall` every call and respect limits [37][38].

### Luau: the path (shared)
```lua
--!strict
-- ReplicatedStorage.Shared.Path
local Path = {}
Path.__index = Path
export type PathObj = typeof(setmetatable({} :: { points: { Vector3 }, cum: { number }, length: number }, Path))

function Path.new(folder: Instance): PathObj
	local points: { Vector3 } = {}
	while true do
		local p = folder:FindFirstChild(tostring(#points + 1))
		if not p then break end
		table.insert(points, (p :: BasePart).Position)
	end
	assert(#points >= 2, "Path needs waypoints 1..N")
	local cum = { 0 }
	for k = 2, #points do cum[k] = cum[k - 1] + (points[k] - points[k - 1]).Magnitude end
	return setmetatable({ points = points, cum = cum, length = cum[#cum] }, Path)
end

function Path.positionAt(self: PathObj, dist: number): (Vector3, Vector3)
	local d = math.clamp(dist, 0, self.length)
	local lo, hi = 1, #self.cum
	while hi - lo > 1 do
		local mid = (lo + hi) // 2
		if self.cum[mid] <= d then lo = mid else hi = mid end
	end
	local a, b = self.points[lo], self.points[hi]
	local seg = self.cum[hi] - self.cum[lo]
	return a:Lerp(b, if seg > 0 then (d - self.cum[lo]) / seg else 0), (b - a).Unit
end

function Path.distanceTo(self: PathObj, p: Vector3): number -- XZ distance, for placement clearance
	local best, q = math.huge, Vector3.new(p.X, 0, p.Z)
	for k = 1, #self.points - 1 do
		local a = Vector3.new(self.points[k].X, 0, self.points[k].Z)
		local ab = Vector3.new(self.points[k + 1].X, 0, self.points[k + 1].Z) - a
		local t = if ab.Magnitude > 0 then math.clamp((q - a):Dot(ab) / ab:Dot(ab), 0, 1) else 0
		best = math.min(best, (q - (a + ab * t)).Magnitude)
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

export type Enemy = { id: number, kind: string, hp: number, speed: number, dist: number,
	armor: number, slowMul: number, slowUntil: number }

local EnemyService = { alive = {} :: { [number]: Enemy }, timeScale = 1, path = nil :: any,
	onLeak = nil :: ((Enemy) -> ())?, onKill = nil :: ((Enemy, Player?) -> ())? }
local nextId = 0

function EnemyService.spawn(kind: string, baseHp: number)
	local def = Config.Enemies[kind]
	nextId += 1
	local e: Enemy = { id = nextId, kind = kind, hp = math.max(1, math.round(baseHp * def.hpMul)),
		speed = def.speed, dist = 0, armor = def.armor, slowMul = 1, slowUntil = 0 }
	EnemyService.alive[e.id] = e
	Remotes.EnemySpawned:FireAllClients(e.id, kind, e.hp)
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

local acc = 0
RunService.Heartbeat:Connect(function(dt: number)
	local step, now = dt * EnemyService.timeScale, os.clock()
	for id, e in EnemyService.alive do
		e.dist += e.speed * (if now < e.slowUntil then e.slowMul else 1) * step
		if e.dist >= EnemyService.path.length then
			EnemyService.alive[id] = nil
			Remotes.EnemyDied:FireAllClients(id)
			if EnemyService.onLeak then EnemyService.onLeak(e) end
		end
	end
	acc += dt
	if acc < 1 / Config.SNAPSHOT_HZ then return end
	acc = 0
	local ids, dists = {}, {}
	for id, e in EnemyService.alive do
		table.insert(ids, id)
		table.insert(dists, math.floor(e.dist * 10) / 10)
	end
	Remotes.EnemySnapshot:FireAllClients(ids, dists) -- UnreliableRemoteEvent
end)

return EnemyService
```
The client keeps a pooled model per id, interpolates between the last two snapshots (plus speed × elapsed), and sets `model:PivotTo(CFrame.lookAt(pos, pos + dir))` from `Path.positionAt`. Unreliable payloads are size-limited and may drop [14]: split above ~200 enemies or pack into a `buffer`. DevForum replies favor one movement driver per enemy over tweening many parts [39].

### Luau: placement validation (server)
```lua
--!strict
local Players = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Match = require(script.Parent.MatchService)
local PlayerData = require(script.Parent.PlayerData)

local towers = workspace:WaitForChild("Towers")
local lastCall: { [Player]: number } = {}
local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Include

local function ground(pos: Vector3): Vector3?
	params.FilterDescendantsInstances = CollectionService:GetTagged("Placeable")
	local hit = workspace:Raycast(pos + Vector3.new(0, 10, 0), Vector3.new(0, -30, 0), params)
	return if hit and hit.Normal.Y > 0.9 then hit.Position else nil
end

local function spaced(pos: Vector3): boolean
	for _, t in towers:GetChildren() do
		if t:IsA("Model") and (t:GetPivot().Position - pos).Magnitude < Config.TOWER_SPACING then return false end
	end
	return true
end

ReplicatedStorage.Remotes.PlaceTower.OnServerInvoke = function(player: Player, slot: unknown, pos: unknown)
	local now = os.clock()
	if (lastCall[player] or 0) + 0.25 > now then return false end
	lastCall[player] = now
	if typeof(slot) ~= "number" or slot % 1 ~= 0 or slot < 1 or slot > 6 then return false end
	if typeof(pos) ~= "Vector3" or pos ~= pos or not Match.isRunning() then return false end
	local data = PlayerData.get(player)
	local name = data and data.team[slot]
	local def = name and Config.Towers[name]
	if not def then return false end
	local g = ground(pos)
	if not g or Match.path:distanceTo(g) < Config.PATH_CLEARANCE or not spaced(g) then return false end
	if Match.towerCount(player) >= Config.MAX_TOWERS_PER_PLAYER then return false end
	if not Match.trySpend(player, def.cost) then return false end
	Match.spawnTower(player, name :: string, g) -- clones Assets.Towers.<Name>.T0, sets attributes, parents to Workspace.Towers
	return true
end

Players.PlayerRemoving:Connect(function(p) lastCall[p] = nil end)
```
`pos ~= pos` is a NaN check (a Vector3 containing NaN is never equal to itself).

### Luau: targeting (server)
```lua
--!strict
local function pickTarget(origin: Vector3, range: number, mode: string, flags: { [string]: boolean },
	alive: { [number]: any }, path: any): any?
	local best, bestScore = nil, -math.huge
	for _, e in alive do
		local def = Config.Enemies[e.kind]
		if (def.flying and not flags.HitsFlying) or (def.hidden and not flags.HitsHidden) then continue end
		local d = (path:positionAt(e.dist) - origin).Magnitude
		if d > range then continue end
		local score = if mode == "First" then e.dist elseif mode == "Last" then -e.dist
			elseif mode == "Strongest" then e.hp else -d
		if score > bestScore then best, bestScore = e, score end
	end
	return best
end
```
One Heartbeat loop walks all towers, skips those before `nextFire`, picks a target, calls `EnemyService.damage`, and batches `TowerFired(towerId, enemyId)` into one event per frame for client VFX. Splash towers hit every enemy within `splashRadius` of the target. With many towers, bucket enemies by path distance.

**Waves:** `WaveService` builds each wave from the section 5 formulas (`n(w)` entries, traits mixed in from their intro wave, spawn gap `max(0.35, 1.2 − 0.02·w)` s, a boss every 10th wave), spawns with `task.wait(gap / timeScale)`, ends the wave when all are dead or a 20 s timer runs out (skippable by vote), then pays the bonus to every player. Endless mode caps live enemies at 250 and queues the rest.

### Luau: summon with odds and pity (lobby server)
```lua
--!strict
local RATES = { { "Rare", 700 }, { "Epic", 250 }, { "Legendary", 45 }, { "Mythic", 5 } } -- per 1000, shown as %
local LEG_PITY, MYTH_PITY = 50, 400
local rng = Random.new()

local function rollOne(p: { leg: number, myth: number }): string
	p.leg += 1
	p.myth += 1
	local rarity = "Rare"
	if p.myth >= MYTH_PITY then rarity = "Mythic"
	elseif p.leg >= LEG_PITY then rarity = "Legendary"
	else
		local r, acc = rng:NextInteger(1, 1000), 0
		for _, rate in RATES do
			acc += rate[2] :: number
			if r <= acc then rarity = rate[1] :: string break end
		end
	end
	if rarity == "Mythic" then p.myth, p.leg = 0, 0 elseif rarity == "Legendary" then p.leg = 0 end
	return rarity
end
```
`SummonService` checks the banner is live by server time, deducts gems first, rolls, picks a unit of that rarity from the banner pool, writes units and pity, marks data dirty and returns results for the reveal. If paid random items are restricted for the player, summons spend only earned gems and the direct shop shows [28].

**Teleports:** `TeleportService:ReserveServer(matchPlaceId)`, then `TeleportAsync` with `TeleportOptions.ReservedServerAccessCode` and `SetTeleportData({ map, mode })` [18]. The match server validates map and mode against `Config` (teleport data passes through the client), and loads data only after the lobby's save releases the session lock.

## 12. Twists that work

1. **Hero TD:** one controllable hero per player with abilities, plus towers.
2. **Reverse TD (PvP):** one team defends, the other buys and sends waves from an income economy; strict anti-stall timers.
3. **Themed TD on a trend** where towers act out the theme (sprinklers slow, seeds split) [23].
4. **Maze TD:** players place walls to shape the path; server grid pathfinding; never allow a full block.
5. **Roguelike TD:** pick 1 of 3 perks after each boss; perks unlock permanently.
6. **Raid boss:** a weekly 4-player boss with a cross-server HP pool (MemoryStore) and contribution tiers.
7. **AFK room:** capped gem trickle for time spent, as Anime Defenders offers [5].
8. **Simulator crossover:** units level from use; an index of every unit ([[Genre - Simulator]]).
9. **Endless with mutators:** every 10 waves a server-picked mutator (fast enemies, no selling, double cash).
10. **Convoy defense:** the base moves along a track; towers ride on it.

## 13. Failure modes

1. **Late-wave server lag** from Humanoid or server-moved Instance enemies [12][13].
2. **Unreadable placement:** no ring, unclear ground, thin path.
3. **First match lost** because the designer tuned it.
4. **Flat waves:** more HP, no new question.
5. **Cash floods:** everything maxed by wave 12.
6. **Client-trusted placement or damage.**
7. **Opaque gacha:** hidden odds or pity, silent rate changes [16][21].
8. **Pay-to-progress walls** on story maps.
9. **Co-op griefing:** best spots blocked, shared cash spent by one player.
10. **Teleport failures:** party split, data unsaved before teleport.
11. **Gamepad-impossible placement.**
12. **A frozen meta:** one unit tops every tier list for months.
13. **Effects spam** on phones in late waves.
14. **Copied IP:** real anime characters or another game's towers.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Shape chosen (classic, anime/gacha, hybrid) and the hook fits in five words.
- [ ] Market check (Pulse, `cli.mjs market`): which TDs chart now and how our theme differs from the top three.
- [ ] Launch scope: 3 maps, 3 modes, 8+ towers or 20+ units, an endless mode.
- [ ] Original characters and theme.
- [ ] Data-driven enemies and the 150-enemy stress test are in the plan.
- [ ] Lobby + match place with reserved-server teleports and safe saves are in scope.
- [ ] Monetization fits without walls; Balance proves the free path.
- [ ] Odds screen, pity counter and the policy-restricted alternative are in scope.
- [ ] 8-week update plan: weekly banners, a map or units every 2-3 weeks, one event.
- [ ] Gamepad placement is designed before the build.

## 15. Checklist

- [ ] A new player wins the starter map first try on a phone (Kid Tester report).
- [ ] First kill within 45 s of arriving in the match.
- [ ] Range ring and valid/invalid tint work on touch, mouse and gamepad.
- [ ] Forged PlaceTower calls (on path, off map, no cash, NaN, slot 99) all fail (Reviewer log).
- [ ] Upgrade, Sell and SetTarget reject other players' towers.
- [ ] 150 enemies + 20 towers keep server heartbeat ≥ 50 FPS (Developer Console screenshot).
- [ ] Enemies have no Humanoids and no server Instances.
- [ ] Every 5th wave adds an announced trait; every trait has a counter tower.
- [ ] Every upgrade tier changes the tower's look.
- [ ] 2× speed works and every timer respects `timeScale`.
- [ ] A loss pays coins and XP; first-clear pays once per map and mode.
- [ ] Summon screen shows every rarity's percent (sum 100%); pity matches server data.
- [ ] `PolicyService` gates paid summons; restricted players see the direct shop.
- [ ] One `ProcessReceipt` per place; a repeated receipt doesn't double-grant.
- [ ] Party teleports together; data saved before and loaded after.
- [ ] Thumb zones clear; every menu is gamepad-selectable and B closes.
- [ ] Endless board uses an ordered store with seasonal keys and `pcall`.
- [ ] Wave-reached funnel events fire per map and mode.

## Common mistakes

1. Humanoid enemies walking waypoints with `MoveTo` [12].
2. A reliable remote per enemy per frame instead of batched unreliable snapshots [13][14].
3. Trusting the client's tower position or cost, or validating only the client ghost.
4. Range rings sized by radius (Cylinder size is a diameter).
5. Waves tuned on PC at 2× by a designer, never on a phone at 1×.
6. Upgrades that only change numbers.
7. Shared team cash.
8. A summon button with no odds screen [16]; pity stored on the client.
9. Two scripts setting `ProcessReceipt` in one place [26].
10. Teleporting before saving, or trusting teleport data.
11. Banner timers from each server's own clock.
12. Tower selection impossible on gamepad.
13. An endless spawn queue with no live-enemy cap.
14. Event units that never return.

## References

[1] Anime Vanguards surpasses Blox Fruits to become top-earning Roblox game (Beebom) — https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/
[2] Tower Defense Simulator: A Beginner's Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/tower-defense-simulator-a-beginner-s-guide — cash from waves and mission end; Starter to Hardcore tiers; Easy 25 waves.
[3] Anime Defenders: A Beginner's Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-a-beginner-s-guide — rarities Rare to Secret; gem summons.
[4] TDS beginner's guide (BlueStacks, Russian) — https://www.bluestacks.com/ru/blog/game-guides/roblox/rl-tds-beginners-guide-ru.html — forgiving only early; start in co-op; do the tutorial.
[5] Anime Defenders banners guide (DroidGamers) — https://www.droidgamers.com/guides/anime-defenders-banners-guide/ — banners rotate every few hours; pity 50/400; gem sources incl. AFK.
[6] Anime Last Stand Units (Gamezebo) — https://www.gamezebo.com/walkthroughs/anime-last-stand-units/ — banners change through the day; summon timer.
[7] Anime Last Stand Summer Event 2024 guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-summer-event-2024-guide
[8] Tower Defense Simulator complete beginners guide (ItemLevel) — https://itemlevel.net/tower-defense-simulator-complete-beginners-guide/
[9] Anime Defenders Trait Tier List (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-trait-tier-list — Trait Reroll portal; Trait Crystals.
[10] Tower Defense Simulator modes (Bloxodes) — https://bloxodes.com/wiki/tower-defense-simulator/modes — three-wave tutorial run.
[11] Tower Defense Simulator (Bloxodes wiki) — https://bloxodes.com/wiki/tower-defense-simulator — reading range and enemy paths.
[12] Tower Defense: Enemy System (DevForum) — https://devforum.roblox.com/t/tower-defense-enemy-system/2667346/9 — Humanoid overhead at high NPC counts.
[13] Reducing bandwidth of an enemy system (DevForum) — https://devforum.roblox.com/t/how-can-i-heavily-reduce-the-bandwidth-of-this-enemy-system-foundation-code/4052181 — hundreds of enemies, no Humanoids, throttled path updates.
[14] UnreliableRemoteEvent reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/UnreliableRemoteEvent
[15] jTDF - High-Performance Tower Defense Framework (DevForum) — https://devforum.roblox.com/t/jtdf-high-performance-tower-defense-framework-parallel-luau/4061864 — 300 enemies, 50 towers, ~6 ms.
[16] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items — all outcomes, numeric odds totaling 100%.
[17] Anime Last Stand Summon Chances and Pity System (GINX) — https://www.ginx.tv/en/anime-last-stand-summon-chances-pity-system — base rates and pity.
[18] TeleportOptions (engine reference) — https://create.roblox.com/docs/reference/engine/classes/TeleportOptions.md
[19] Anime Defenders: Support Units Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-support-units-guide
[20] Anime Last Stand Time King guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-time-king-guide-unit-overview-get — featured-unit chance; VIP summon discount.
[21] Anime Last Stand tier list (Twinfinite) — https://twinfinite.net/guides/anime-last-stand-tier-list/ — odds cited differently over time.
[22] Beginner's guide to Roblox Tower Defense X (Sportskeeda) — https://sportskeeda.com/roblox-news/beginner-s-guide-roblox-tower-defense-x — place near the entrance; check range.
[23] Garden Tower Defense: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=360791
[24] Retro Tower Defense: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=367420
[25] Private servers — https://create.roblox.com/docs/production/monetization/private-servers
[26] Developer products — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt; test purchases.
[27] MarketplaceService.ProcessReceipt — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService/ProcessReceipt
[28] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md — ArePaidRandomItemsRestricted.
[29] Passes — https://create.roblox.com/docs/production/monetization/passes — UserOwnsGamePassAsync in a pcall.
[30] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[31] GuiService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/GuiService
[32] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore
[33] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md
[34] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events
[35] Securing the client-server boundary (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/security/client-server-boundary
[36] Remote events and callbacks (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/events/remote
[37] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[38] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md
[39] Welds or tweens? (DevForum) — https://devforum.roblox.com/t/welds-or-tweens/2652613 — one movement driver per enemy.

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[16 Console and Controllers]] · [[17 Security and Anti-Cheat]] · [[Genre - RNG and Collection]] · [[Genre - Simulator]] · [[Genre - Obby]]
