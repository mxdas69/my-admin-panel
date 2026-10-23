---
tags: [vault, genre, shooter, fps, tps, arena, round-based, guns, netcode, lag-compensation, hit-validation]
for: [lead, pulse, architect, builder, balance, playtest]
also: [frame, scenic, librarian, reviewer, merchant, liveops, kid-tester, producer]
---

# Genre - Shooter

This is the playbook for games where the main verb is **aim and shoot**: first-person (FPS) and third-person (TPS) shooters, arena free-for-alls, round-based team modes, duels, gun-game ladders, paintball and laser tag, and co-op wave shooters. It covers the gun system (stats, spread, recoil, reload), hit feedback, maps and spawns, matchmaking and rounds, and above all the netcode: how a client gets an instant shot while the server still decides who got hit. Melee combat lives on [[Genre - Action and Combat]] and [[Genre - Battlegrounds]].

Shooters are the least forgiving genre on Roblox because players compare them with the best shooters on every other platform. A shot that visibly hits but does no damage, a death behind a wall, or a gun that feels like a pea-shooter is enough to make a player leave in the first match. At the same time, a shooter that trusts the client gets aimbots and kill-everyone scripts within days of trending. The whole genre is a balance between client-side feel and server-side truth, and section 11 is the most important part of this page.

Read this page before pitching any game with guns as a main or side system (including zombie waves and blaster-based party games). Architect writes the remote contracts from section 11. Balance writes the weapon table from section 5. Playtest runs every check with two clients and simulated latency. Numbers marked as targets are this studio's rules, not measurements of other games.

**Source note.** The search budget ran out before shooter-specific game research. Roblox's own laser tag sample game is sourced. The entries for Arsenal, Rivals, Phantom Forces, BIG Paintball, Counter Blox, Bad Business and Murder Mystery 2 are described from general knowledge, not from a source found in this pass. They're marked *(unverified)* and have no citation. Don't quote details from them until a later pass adds sources. All cited claims come from the search results in References.

## 1. What it is and why it works on Roblox

### Sub-genres

| Sub-genre | Shape | Reference | Match length | Studio target audience |
|---|---|---|---|---|
| Arena free-for-all / team deathmatch | spawn, fight, respawn | many | 5-10 min | 10-16 |
| Gun-game ladder | every kill swaps your weapon; finish the ladder to win | Arsenal *(unverified)* | 5-8 min | 9-14 |
| Round-based duels | 1v1 to 5v5, first to N rounds | Rivals *(unverified)* | 3-8 min | 11-16 |
| Tactical round-based | buy phase, objective, one life per round | Counter Blox *(unverified)* | 15-30 min | 13-17 |
| Large-scale military | big maps, classes, unlock trees | Phantom Forces *(unverified)* | 10-20 min | 13-17 |
| Kid-friendly paint / laser / blaster | non-violent theme, bright colors | BIG Paintball *(unverified)*, Roblox's laser tag sample [4] | 5 min | 8-13 |
| Co-op wave shooter | survive waves of NPCs, upgrade between waves | many | 15-40 min | 9-15 |
| Social-deduction with a gun | one sheriff, one murderer | Murder Mystery 2 *(unverified)* | 2-4 min | 9-14 |

### The audience

- **Most players are on phones.** Touch aiming is hard, so time-to-kill, aim assist and button layout have to be designed for thumbs first (sections 5 and 7).
- **Younger players prefer non-realistic themes.** Blasters, paint, lasers, toys and cartoon worlds. Roblox's own gameplay-scripting curriculum teaches shooting through a laser tag game with blasters [4]. Realistic military shooters skew older.
- **Players arrive with expectations from other platforms.** Crosshair, hitmarker, ADS, reload cancel, killfeed and scoreboard are expected. Missing any of them reads as low quality.

### Why players come back

1. **Mastery of aim.** Players get visibly better at hitting shots, and the game should show it (accuracy, headshot rate, best streak).
2. **Unlocks.** New guns, attachments and skins on a steady drip.
3. **Short matches.** One more 5-minute match is an easy decision.
4. **Friends.** Squads, parties and private matches.
5. **Status.** Rare skins, kill effects, ranks and streak announcements.

## 2. The core loop

**Loop statement (arena):** "Spawn with a loadout → find an enemy → aim and shoot → get the kill (or die and respawn in seconds) → earn XP and currency → unlock guns, attachments and skins → tune the loadout → queue the next match."

**Variants:**
- **Round-based:** "Buy phase (10-20 s) → round with one life → win or lose the round → round money → buy again → first to N rounds wins the match."
- **Gun-game:** "Spawn with weapon 1 → each kill advances you to the next weapon → the final weapon's kill wins the match."
- **Wave co-op:** "Wave of enemies → survive and earn points → spend on guns, ammo and doors between waves → harder wave."
- **Duel:** "1v1, first to 5 rounds, short arenas, loadout chosen before the match."

### The layers

| Layer | Length | What happens | Studio target |
|---|---|---|---|
| Shot | 0.05-0.2 s | click → muzzle flash → tracer → hitmarker | local feedback in the same frame; server confirm within one round trip |
| Engagement | 0.5-3 s | two players see each other and fight | casual rifle TTK 0.5-0.8 s at mid range |
| Life | 20-90 s | spawn to death | 30-60 s average for an average player |
| Match | 3-10 min | one map, one mode | 5-8 min for casual modes |
| Session | 20-60 min | 4-8 matches | ≥1 unlock per session in week 1 |
| Season | 4-8 weeks | battle pass, ranks | new weapon every 2-4 weeks |

### Loop rules

1. **The first kill happens within 60 s of joining, for an average new player.** A first kill is the hook. Fill servers below 6 players with bots (section 11), give new players a forgiving starter rifle, and spawn them near action. *Done right:* the new player gets a kill in their first life. *Done wrong:* a full server of veterans and a 4-minute first life with no kill.

2. **Respawn in 3-5 s, with 2-3 s of spawn protection that ends when you fire.** Waiting is death in an arena shooter, and spawn kills are the second biggest frustration. Give a ForceField on spawn; Roblox's ForceField blocks damage applied through `Humanoid:TakeDamage` [17]. Remove it early when the player fires or aims at an enemy. *Done right:* die, respawn in 4 s, safe for 2 s. *Done wrong:* a 10-second death cam and a spawn in someone's sightline.

3. **Every shot gives feedback on the shooter's screen in the same frame.** Muzzle flash, sound, tracer and recoil kick happen locally the moment you click, before the server answers. When the client's own raycast hits a player, show a hitmarker immediately and play a hit sound; when the server confirms, show the damage number and the kill. A game-feel lesson and a hit-feedback primer describe the same stack of flash, sound, shake and short freezes that sells impact [22][23], and the Monster Hunter Wilds beta showed how fast players notice when impact feedback is missing [24]. *Done right:* click, crack, red X, ding. *Done wrong:* click, then 150 ms later the gun sound plays.

4. **Casual time-to-kill is 0.5-0.8 s for a rifle at mid range, and no gun kills in one body shot at range except snipers.** Too fast and new players die before they react; too slow and fights feel spongy. HP 100 for everyone. A rifle doing 25 body damage at 600 RPM kills in 4 hits = 0.3 s of firing after the first shot at perfect accuracy, which becomes 0.5-0.8 s with realistic misses. Headshots ×1.5-2.0.

5. **Every gun has one job and a clear weakness.** SMG: close range, weak past 60 studs. Shotgun: one-shot under 10 studs, useless past 30. Rifle: all-rounder. Sniper: one-shot headshots, slow ADS and fire rate. Pistol: secondary, fast swap. Balance the weakness, not just the strength (section 5).

6. **Rounds and matches end on time.** A match with no clock drags. Arena modes: 5-8 minutes or a kill target (40-60 team kills), whichever comes first. Rounds: 90-120 s. Show the timer at the top-center at all times.

7. **The scoreboard shows more than kills.** Score per minute, assists, objective points and accuracy let players who aren't top-fraggers see progress. Award XP for assists (50% of a kill) and objectives.

8. **Lose with dignity.** The losing team still earns 60-70% of the winner's XP, and the end-of-match screen shows each player's personal best of the match ("Longest shot: 142 studs").

## 3. Top games in the genre

### Roblox Laser Tag sample: the official reference for blaster netcode
**Game:** Laser Tag sample game from Roblox's gameplay scripting curriculum ([4], [6])
**Shows:** The tutorial walks through blaster input detection, cooldown checks, generating blast data that identifies the shooter, the origin and each beam's endpoint, and sending it to the server so it can act on hits [4]. On the client, a BindableEvent tells other local scripts (like the visuals that show the blast and cooldown bar) while a RemoteEvent tells the server [4]. A later section covers hit detection and subtracting health by blaster type [4]. A separate tutorial shows a beam-based collision box that damages players, useful for laser hazards [6].
**Why it works:** It separates local feel (visuals fire instantly) from server truth (the server processes hits), which is the model this page uses.
**Steal:** The data-packet design (shooter, origin, endpoints), which agents can read in the tutorial's plain-text version [5], the local BindableEvent for visuals, and a non-violent blaster theme for young players.
**Avoid:** Treating a tutorial as finished anti-cheat. Add section 11's rate, origin, spread and rewind checks.

### Arsenal: the gun-game ladder *(unverified)*
**Game:** Arsenal *(no source this pass)*
**Shows:** A fast arena shooter in which each kill swaps your weapon for the next one in a rotation, and the final kill with the last weapon wins the match. Known for silly skins and announcer voices.
**Why it works:** Players try every weapon in one match, and every kill changes your toolset, so nothing gets stale. Comedy cosmetics sell without touching balance.
**Steal:** A ladder mode that forces variety. Cosmetic personality (voice packs, kill effects) as the main monetization.
**Avoid:** Copying its weapon rotation, names or skins.

### Rivals: short duels in rounds *(unverified)*
**Game:** Rivals *(no source this pass)*
**Shows:** A round-based duel shooter with small teams in compact arenas and loadouts chosen before the match.
**Why it works:** A loss is only one round, and a whole match fits in a few minutes. Small arenas make every round a fight.
**Steal:** First-to-N-rounds duels, a pre-match loadout screen, and arenas sized for fights within seconds of the round start.
**Avoid:** Queues that put new players against the best players in the server.

### Phantom Forces: the long unlock tree *(unverified)*
**Game:** Phantom Forces *(no source this pass)*
**Shows:** A military FPS with large maps, many weapons unlocked by rank, and attachments unlocked by kills with each weapon.
**Why it works:** Per-weapon mastery means every gun has its own progression, so long-time players always have a goal.
**Steal:** Per-weapon kill milestones that unlock attachments and camos.
**Avoid:** Burying new players under realistic recoil and huge maps. That audience is older and more patient than ours.

### BIG Paintball: shooting made friendly *(unverified)*
**Game:** BIG Paintball *(no source this pass)*
**Shows:** A paintball arena shooter with bright colors and cartoon guns.
**Why it works:** Paint instead of bullets keeps the theme light for young players and parents, while the mechanics stay a normal shooter's.
**Steal:** Non-violent framing (paint, foam, lasers, water) with full shooter mechanics.
**Avoid:** Assuming "kid-friendly" means low skill. Kids still want hitmarkers and streaks.

### Counter Blox: one life per round *(unverified)*
**Game:** Counter Blox *(no source this pass)*
**Shows:** A tactical team shooter with a buy phase, an objective and one life per round.
**Why it works:** Stakes per round are high, and the economy between rounds adds planning.
**Steal:** Round money with loss bonuses so the losing team can recover.
**Avoid:** Long dead time. Add a spectator mode and short rounds, or players leave after an early death.

### Bad Business: movement-heavy FPS *(unverified)*
**Game:** Bad Business *(no source this pass)*
**Shows:** A fast competitive FPS with an emphasis on movement and weapon customization.
**Why it works:** Movement tech (slides, mantles) raises the skill ceiling for competitive players.
**Steal:** One or two movement tools (slide, vault) that are easy to use but reward skill.
**Avoid:** Movement that phone players can't perform. Put every movement action on one button.

### Murder Mystery 2: one gun changes everything *(unverified)*
**Game:** Murder Mystery 2 *(no source this pass)*
**Shows:** A social-deduction round game where one player holds the only gun and must find the murderer.
**Why it works:** Scarcity makes each shot dramatic. Proves that a gun can be the center of a social game, not just a shooter.
**Steal:** A single high-stakes weapon in a party game. See [[Genre - Party and Social Hangout]].
**Avoid:** Using it as a template for a real shooter; it's a different genre.

## 4. The first five minutes

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0-8 s | Loading screen with logo, a tip, and a "Loading map" bar | Preload the default weapon models, sounds and the first map's near area. Cap 8 s. |
| 8-15 s | Lobby: a big PLAY button (60% of screen width on mobile) and the current mode | One tap to play. No loadout screen on the first join: the default loadout is pre-picked. |
| 15-25 s | Teleported or spawned into a match in progress, with spawn protection | Join-in-progress is fine for arena modes. Fill with bots if the server has fewer than 6 players. |
| 25-35 s | Controls hint for 4 s: "Click: Shoot · Right click: Aim · R: Reload" (mobile: buttons pulse once) | Hint shows once per account. |
| 35-60 s | First engagement and first kill | New players' starter rifle has 15% less recoil and a 10% wider hitbox tolerance in their first 3 matches (a hidden "rookie assist", server-side). |
| 60-90 s | Kill feedback: killfeed entry, "+100 XP", kill sound | XP bar under the HUD fills visibly. |
| 90-180 s | First death: kill cam (2 s) showing where the killer was, respawn in 4 s | The death screen shows the killer's weapon and one tip ("Aim down sights for better accuracy"). Never a shop. |
| 180-300 s | Match ends: XP summary, level 2, "New unlock: SMG" | The end screen offers "Play again" as the biggest button. The unlock is equippable right there. |

Opening rules:

9. **One tap from lobby to match.** Every screen before the first shot loses players. The lobby has a single main button.

10. **The first match is against bots or a mixed server if possible.** Use a skill rating (section 11) to place new players with other new players. When a server is under-filled, bots take the empty slots with deliberately human-like aim (section 11).

11. **Teach ADS and reload by doing, not reading.** The first time a player fires more than 60 studs without ADS, show "Hold right click / tap Aim for accuracy" for 3 s. The first time the mag is empty, flash the reload button.

12. **Level 2 and the first unlock land in the first match.** Make level 1→2 cost one average match of XP (section 5).

## 5. Progression and economy

All numbers are targets for Balance to simulate in `economy.md`.

### Account XP

- XP per kill 100, per assist 50, per headshot +25, per objective 150, per match finished 200, win bonus +300.
- `XPtoNext(L) = 800 + 200 × L` (level 2 at 1,000 XP, level 50 at 10,800 per level).
- An average match for a new player earns about 1,000-1,400 XP, so level 2 lands in match 1, level 5 in about match 4, level 20 in about 25 matches (roughly 3-4 hours).

| Level | XP to next | Cumulative XP | Matches (≈1,200 XP each) | Unlock |
|---|---|---|---|---|
| 1 | 1,000 | 0 | 0 | rifle, pistol |
| 2 | 1,200 | 1,000 | 1 | SMG |
| 4 | 1,600 | 3,400 | 3 | shotgun |
| 7 | 2,200 | 8,500 | 7 | DMR |
| 10 | 2,800 | 15,700 | 13 | sniper |
| 15 | 3,800 | 31,200 | 26 | LMG |
| 25 | 5,800 | 79,200 | 66 | second rifle variant |
| 50 | 10,800 | 285,000 | 238 | prestige option |

### Weapon mastery

| Kills with the weapon | Unlock |
|---|---|
| 25 | red dot sight |
| 50 | extended mag |
| 100 | foregrip (−10% recoil) |
| 200 | scope or barrel |
| 400 | gold camo |
| 1,000 | animated camo |

Attachments are sidegrades: each one trades something (extended mag: +30% mag size, +10% reload time).

### Weapon table (targets)

HP 100. Damage falls off linearly between the two ranges.

| Gun | Damage (near → far) | Ranges (studs) | RPM | Mag | Reload (s) | Hip spread (°) | ADS spread (°) | ADS time (s) | Move speed | Head × |
|---|---|---|---|---|---|---|---|---|---|---|
| Rifle | 25 → 18 | 60 → 160 | 600 | 30 | 2.2 | 4.0 | 0.8 | 0.25 | 0.95 | 1.6 |
| SMG | 22 → 12 | 30 → 80 | 850 | 32 | 1.9 | 3.0 | 1.5 | 0.18 | 1.00 | 1.4 |
| Shotgun | 12 × 8 pellets → 4 | 10 → 30 | 75 | 6 | 0.5 per shell | 7.0 | 5.0 | 0.25 | 0.95 | 1.2 |
| DMR | 45 → 38 | 100 → 250 | 240 | 12 | 2.4 | 5.0 | 0.3 | 0.30 | 0.92 | 1.8 |
| Sniper | 90 → 80 | 200 → 400 | 50 | 5 | 3.0 | 10.0 | 0.0 | 0.45 | 0.88 | 2.5 |
| Pistol | 20 → 14 | 30 → 80 | 400 | 12 | 1.4 | 2.5 | 1.0 | 0.15 | 1.00 | 1.8 |

Checks Balance runs on the table:
- **Kill time at each gun's best range**, `ceil(100 / damage) - 1` shots × `60 / RPM`: rifle 0.30 s, SMG 0.28 s, shotgun one shot under 10 studs if 5+ pellets hit, DMR 0.50 s, sniper one headshot or two bodies (1.2 s).
- **Crossover distance:** the SMG must beat the rifle under 30 studs and lose past 50. If it wins at 60, the falloff is too gentle.
- **No gun is best at every range.** Plot kill time against range for all six; each curve must be lowest somewhere.

### Recoil and spread

- Recoil is a vertical kick per shot (rifle 0.35°, SMG 0.25°, DMR 1.2°) plus a small random horizontal (±0.15°), recovering 8° per second after the trigger is released.
- Spread grows 0.2° per shot during sustained fire up to 2× the base and recovers in 0.4 s.
- Moving multiplies hip spread by 1.5; jumping by 3. Crouching multiplies by 0.8.
- **On mobile, recoil kick is 50% visual only.** Thumbs can't pull down reliably, so most of the kick is camera wobble that returns to center.

### Round economy (tactical modes)

| Event | Money (target) |
|---|---|
| Round win | 2,500 |
| Round loss | 1,500, +400 per consecutive loss, up to 2,700 |
| Kill | 250 (SMG 400, shotgun 500, sniper 100) |
| Objective (plant, capture) | 300 |
| Start money | 800 |

Prices: pistol 300-600, SMG 1,200, shotgun 1,300, rifle 2,600, DMR 3,000, sniper 4,500, armor 650, utility 200-400. The loss bonus guarantees a team can buy rifles after two losses.

### Battle pass (season)

- 50 tiers, 4-6 weeks. 1 tier ≈ one match of play, so a player who plays 2 matches a day finishes in about 4 weeks.
- Free track: 15 rewards (sprays, a camo, a title). Paid track: 50 rewards (skins, a kill effect, an emote).
- No weapons with unique stats on either track.

## 6. Monetization that fits

Merchant proposes, the owner approves prices. Prices are targets.

### What to sell

| Item | Target price (R$) | Notes |
|---|---|---|
| Weapon skin, common | 49-99 | color variants |
| Weapon skin, rare | 149-249 | new texture and inspect animation |
| Weapon skin, legendary | 399-799 | animated, custom sound pack |
| Knife or melee skin | 199-499 | high-status item in most shooters |
| Kill effect | 199-399 | must not obscure the next fight |
| Emote | 99-199 | usable in lobby and after a kill |
| Battle pass | 399-499 | see section 5 |
| Announcer / voice pack | 149-299 | personality without power |
| Private server (Roblox native) | 100-300 per month | practice and friend matches |
| 2× XP pass | 299-399 | acceptable only because attachments are sidegrades |

### Off-limits

- **No guns or attachments with better stats for Robux.** A paid gun that wins fights kills the game. Every stat item unlocks with play.
- **No paid random crates without the policy check and odds.** Check `PolicyService:GetPolicyInfoForPlayerAsync(player).ArePaidRandomItemsRestricted` and offer direct purchases. Show odds on every crate. See [[09 Shops and Monetization]] and [[03 Rarity and RNG]].
- **No paid wallhacks in disguise.** UAV, radar or "enemy outline" items for Robux are pay-to-win.
- **No skins that change visibility.** All-black or all-foliage skins that hide players are a paid advantage. Skins must keep the team color outline.
- **No purchases on the death screen or kill cam.**
- **No gore.** Blood splatter, dismemberment and realistic wounds raise the maturity label and lose the young audience. Use sparks, paint, or a stylized hit flash.

## 7. UI and HUD for this genre

Frame builds these. See [[05 UI and HUD]] and [[08 Mobile]].

### HUD layout

| Element | Position | Size | Notes |
|---|---|---|---|
| Crosshair | screen center | 4 lines of 8 × 2 px with a 4 px gap that widens with spread | color setting (default white with 1 px black outline); hidden while ADS with a scope |
| Hitmarker | screen center | 4 diagonal lines, 12 px | white on hit, red on kill, 0.15 s; headshot adds a sharper sound |
| Ammo | bottom-right | "24 / 90" in 32 px bold | red when under 25% of the mag; "R to reload" hint at 0 |
| Health | bottom-left | 240 × 16 px bar plus number | red vignette at screen edges under 30 HP |
| Damage direction | around the crosshair | red arcs, 120 px radius | arc points to the attacker, fades in 1 s |
| Killfeed | top-right | 5 rows | killer, weapon icon, headshot icon, victim |
| Timer and score | top-center | 120 px wide | team scores on each side |
| Minimap (optional) | top-left | 160 px square | teammates only; enemies appear only when they fire unsuppressed |
| Scoreboard | Tab / a button | full width table | score, kills, deaths, assists, ping |
| Kill cam | full screen on death | 2 s | shows the killer's position and weapon |

### Mobile layout

- **Fire button:** 110-130 px circle on the right thumb area, about 25% from the right edge and 35% from the bottom. Also allow firing by tapping-and-holding anywhere on the right half (setting).
- **Second fire button on the left side**, 80 px, above the joystick, so players can move the camera with the right thumb while firing with the left.
- **Aim (ADS), reload, crouch/slide, jump:** 64-72 px each, clustered around the fire button.
- **Auto-fire option:** fire when the crosshair is on an enemy for 0.1 s. Many phone players can't aim and fire at once. Balance it with a 10% fire-rate penalty while auto-firing.
- **Aim assist:** slow the camera turn speed by 30-40% while the crosshair is over an enemy (touch and gamepad only). Never snap.
- ContextActionService can auto-create touch buttons, but its reference recommends custom buttons for control over position and look [18][19]. Build custom ImageButtons and route them through the same input module as mouse and keys.

### Must-have screens

1. **Loadout:** primary, secondary, melee, 2 utility slots; attachments per gun with stat bars that show the trade-off (green for gains, red for losses).
2. **Armory:** all guns with lock state ("Unlocks at level 10" or "100 kills with SMG").
3. **Match end:** XP breakdown, unlock reveal, personal bests, "Play again".
4. **Settings:** mouse and touch sensitivity (separate for ADS), FOV 70-100, crosshair color and size, aim assist toggle, auto-fire toggle, hitmarker sound, camera shake.
5. **Map vote:** 3 options, 15 s, shown between matches.

## 8. World and look

Scenic owns this. See [[06 World and Look]].

13. **Arena maps use three lanes and a middle.** It's the most readable layout. Each lane has a different range: one close-quarters, one mid-range, one long sightline. Maps for 12-16 players: 250-400 studs across.

14. **Long sightlines are capped at 150-250 studs.** Past that, rifles can't compete with snipers and new players get picked off from nowhere. Break long lines with cover.

15. **Cover every 10-20 studs in combat lanes, at two heights.** Low cover (3 studs, crouch to hide) and high cover (8+ studs). Players need a place to reload.

16. **Spawns are out of sight of every lane.** Each team has 3-6 spawn points behind a wall or around a corner. The spawn picker scores them (section 11).

17. **Team colors are bright and consistent.** Blue vs orange, never red vs green (color-blind players). Every player has a team-colored outline at close range (`Highlight` with `FillTransparency = 1`, `OutlineTransparency = 0.3`, depth mode occluded) so skins never hide a team.

18. **Collision is simple and invisible walls are rare.** Stairs as ramps under the steps, no small props that catch players, and a clean "playable boundary" made of real walls, not invisible ones.

19. **Performance: 60 FPS on PC and 30+ on the test phone with 16 players firing.** Tracers and muzzle flashes are client-side effects with short lifetimes (under 0.1 s for flashes, 0.2 s for tracers). Bullet holes are decals capped at 50 per client, oldest removed first.

20. **Bullet penetration is a design choice, not an accident.** Mark thin walls with a `Penetrable` attribute and let the server reduce damage by 50% through them. Everything else stops bullets.

## 9. Retention and social

21. **Parties stay together across matches.** A party of up to 4 queues together and lands on the same team. Use `TeleportService:TeleportAsync` with the party's players together when moving between places.

22. **Skill-based placement, softly.** Track a hidden rating per player (start 1,000; win +25, loss −20, scaled by kill share). Place new players (rating under 1,100 or fewer than 10 matches) in servers with other new players when possible. Never show the hidden rating; show ranks only in a ranked mode.

23. **Ranked mode after launch month.** Bronze to Diamond with placement matches, unlocked at level 15. It gives competitive players a reason to stay.

24. **Dailies and weeklies push variety.** "10 kills with an SMG", "Win 2 matches", "5 headshots". See [[10 Retention and Social]].

25. **Clips and replays.** A "highlight" (your best streak of the match, 8 s) shown on the end screen gives players a reason to record and share.

26. **Clans after launch.** Clan tags, a weekly clan leaderboard, and clan-only private matches.

## 10. Live ops and update cadence

27. **A new weapon every 2-4 weeks, a new map every 4-6 weeks, a season every 4-8 weeks.** Content is consumed fast; weapons and maps are what shooter players notice. A 2026 analysis of two big anime RPGs linked weekly updates to growth and slow updates to player complaints [31]; the same pressure applies here.

| Cadence | Content | Effort (agent-days, target) |
|---|---|---|
| Weekly | balance pass, 2-3 skins in the shop rotation, 1 code | 1-2 |
| Every 2-4 weeks | 1 weapon (model, 6 animations, sounds, stats) | 5-8 |
| Every 4-6 weeks | 1 map (3 lanes, spawns, lighting) | 8-12 |
| Every 4-8 weeks | season: battle pass, ranked reset, a limited mode | 10-15 |

28. **Weekly balance passes are small and logged.** Liveops logs every kill with weapon, distance, headshot, and the killer's attachments. Balance flags any weapon with more than 30% of kills (in a pool of 6+) or with a kill-time advantage at every range. Changes of 5-10% at a time. Patch notes in plain words.

29. **Limited modes rotate weekly.** Gun-game ladder, snipers only, one-shot, low gravity, infection. They cost almost nothing and bring players back.

30. **The shop rotates daily or weekly.** A rotating shop of 4-6 skins (daily) gives a reason to check in, without fake timers or "last chance" pressure. See [[09 Shops and Monetization]].

## 11. Building it in Studio

Read [[13 Building It Right]] and [[14 Roblox Studio Workflow]] first.

### Systems list

| # | System | Side | Owner | What it does |
|---|---|---|---|---|
| 1 | WeaponConfig | shared | Builder, Balance | every gun's stats (section 5) |
| 2 | WeaponService | server | Builder | equip, ammo, reload, fire validation, damage |
| 3 | HistoryService | server | Builder | position history for lag compensation |
| 4 | MatchService | server | Builder | rounds, timers, scores, map vote, end of match |
| 5 | SpawnService | server | Builder | spawn scoring and spawn protection |
| 6 | BotService | server | Builder | bots fill empty slots |
| 7 | ProgressionService | server | Builder | XP, levels, mastery, unlocks |
| 8 | AntiCheatService | server | Builder, Reviewer | statistics on shots and movement, flags and kicks |
| 9 | PlayerData | server | Builder | save and load |
| 10 | ReceiptService | server | Merchant | product grants |
| 11 | WeaponController | client | Builder | input, local raycast, recoil, spread, viewmodel, local effects |
| 12 | CameraController | client | Builder | first-person lock, ADS zoom, FOV, aim assist |
| 13 | FxController | client | Builder, Librarian | tracers, impacts, hitmarkers, sounds |
| 14 | HudController | client | Frame | crosshair, ammo, killfeed, scoreboard |

### Netcode: client prediction, server validation

The studio standard for hitscan guns:

1. **The client fires instantly.** It plays the sound and muzzle flash, applies recoil, computes the spread direction, raycasts locally against what it sees, and shows a hitmarker if it hits a player.
2. **The client sends the shot** to the server: a shot id, the origin, the direction, and the instance it thinks it hit (as a hint only).
3. **The server validates** fire rate, ammo, origin and direction, rewinds other players to where the shooter saw them, and raycasts against the rewound hitboxes and the current map.
4. **The server applies damage from config**, never from the client, and tells the shooter (confirm) and the victim (damage direction).
5. **Other clients draw the tracer** from an UnreliableRemoteEvent, because a lost tracer doesn't matter [15].

Why: Roblox's laser tag tutorial uses the same split, with the client generating blast data (shooter, origin, endpoints) and sending it to the server to act on hits [4]. A lag-compensation guide describes a rollback hitbox library in which the server rewinds every character's hitbox to the shooter's tick before checking [7]. A DevForum rollback design ignores client timestamps, estimates latency from ping, and rewinds targets from a position buffer [8]. A secure-combat guide lists trusting client hit positions and client damage as the classic holes [9]. And because the server can't verify physics a client owns [14], positions reported by a client are never proof. The wider DevForum debate on client versus server hit detection (high-ping players suffer under server-only checks; client detection needs server sanity checks such as distance) applies directly to guns [10][11][12][13][30].

31. **The server owns ammo, fire rate and damage.** The client keeps its own ammo counter for the HUD, but the server counts shots and rejects any beyond the mag or faster than the gun's RPM (allow 10% tolerance for jitter: reject if the gap since the last accepted shot is under `0.9 × 60 / RPM`).

32. **The shot's origin must be near the shooter's head.** Reject if the origin is more than 4 studs from the server's view of the head (plus `speed × ping` for moving players, capped at 8 studs). That stops "shoot from anywhere" exploits.

33. **The server rewinds by about half the round-trip ping plus the interpolation delay, capped at 0.25 s.** `Player:GetNetworkPing()` returns round-trip latency in seconds; the rollback thread uses ping/2 [8]. Start with 0.1 s of interpolation delay, tune with network simulation, and cap the total so very high pings can't shoot people who have long since taken cover.

34. **Line of sight is checked against the current map, not the rewound one.** Players don't move walls. Raycast from the origin along the direction with characters excluded; if the map blocks the ray before the rewound target, there is no hit (unless the wall has the `Penetrable` attribute).

35. **Hit zones come from the rewound head and torso, not from the client's hit instance.** Record the head and root CFrames in the history buffer and test the ray against a head sphere (radius 0.8) and a torso box (2.2 × 2.4 × 1.2 studs) at the rewound time. The client's hit instance is only a hint for logging.

36. **Projectiles (rockets, grenades, slow bullets) use shapecasts, stepped on the server, and explosions use radius queries.** Spherecast each step from the last position to the next; Roblox introduced shapecasts with fast-moving projectiles and area-of-effect damage as headline uses [3]. Clients draw their own copy of the projectile for smoothness; the server's step decides the hit. For a grenade blast, `GetPartBoundsInRadius` finds what's inside the radius [2]; then raycast from the blast to each target so walls block damage.

37. **Never use `Touched` for bullets or projectiles.** It's unreliable at speed and can be faked by a client on parts it owns [14]. Use `Raycast` [1] and `Spherecast`/`Blockcast` [3].

38. **Spread is applied on the client, validated as a cone on the server.** The server can't know the exact random offset, so it checks that the angle between the reported direction and the shooter's server-side look direction is within the gun's current max spread plus 10° (look direction lags). Combined with statistics (rule 41), that catches most silent-aim tools without false positives.

39. **Remotes for gameplay are RemoteEvents; cosmetic broadcasts use UnreliableRemoteEvents.** Shots, hit confirms, deaths and round state must arrive. Tracers and impact effects for other players can drop [15][16].

40. **Bots are server NPCs with human-like limits.** Pathfind to the nearest objective or enemy with `PathfindingService:CreatePath`, recomputing on the path's `Blocked` event [25]. Bots react after 0.35-0.6 s, hit 25-40% of shots, never pre-fire corners, and get worse (not better) against rookies. Bots are labelled with a `[BOT]` tag on the scoreboard. A DevForum thread warns that some newer agent parameters are poorly documented, so use the documented ones [26].

41. **Anti-cheat runs on statistics as well as rules.** Log per player per match: shots, hits, headshots, average time from an enemy becoming visible to the first hit, and rejected shots by reason. Flag (don't auto-ban) players with headshot rate over 70% across 200+ shots, or reaction times under 0.12 s averaged over 30+ engagements. Kick after 20 rejected shots in a minute. Reviewer reads flags before any ban.

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| Fire | RemoteEvent | C→S | shotId: number, origin: Vector3, dir: Vector3, hint: Instance? | equipped gun, ammo > 0, fire-rate gap, origin near head, dir unit, cone check | RPM-based: burst 3, rate RPM/60 × 1.1 |
| Reload | RemoteEvent | C→S | (none) | not already reloading, reserve ammo > 0 | 2, 1 |
| Equip | RemoteEvent | C→S | slot: number | integer 1-4, slot filled | 6, 4 |
| SetLoadout | RemoteEvent | C→S | loadout: {primary: string, secondary: string, attachments: {[string]: string}} | every item unlocked, slot types valid, only between lives | 2, 0.5 |
| VoteMap | RemoteEvent | C→S | mapId: string | vote window open, mapId in the 3 options | 3, 1 |
| HitConfirm | RemoteEvent | S→C | damage, headshot, killed | — | n/a |
| Damaged | RemoteEvent | S→C | fromPosition, amount | — | n/a |
| RoundState | RemoteEvent | S→C | state, timer, scores | — | n/a |
| ShotFx | UnreliableRemoteEvent | S→C | shooter, origin, endPosition | cosmetic | n/a |

### Data schema

```lua
--!strict
export type ShooterData = {
	version: number,
	level: number,
	xp: number,
	credits: number,
	rating: number,                                   -- hidden skill rating
	weaponKills: { [string]: number },                -- mastery per gun id
	unlockedAttachments: { [string]: { [string]: boolean } },
	skins: { [string]: boolean },
	equippedSkins: { [string]: string },              -- gun id -> skin id
	loadouts: { { primary: string, secondary: string, melee: string, attachments: { [string]: string } } }, -- up to 5
	selectedLoadout: number,
	stats: { kills: number, deaths: number, assists: number, headshots: number, shots: number, hits: number, wins: number, matches: number },
	pass: { season: number, tier: number, xp: number, premium: boolean, claimed: { [number]: boolean } },
	settings: { sens: number, adsSens: number, fov: number, crosshair: string, aimAssist: boolean, autoFire: boolean },
}
```

### Weapon config

```lua
--!strict
-- ReplicatedStorage.Shared.Config.Weapons
export type Weapon = {
	id: string,
	slot: string,          -- "primary" | "secondary"
	damageNear: number,
	damageFar: number,
	rangeNear: number,
	rangeFar: number,
	maxRange: number,
	rpm: number,
	mag: number,
	reserve: number,
	reload: number,
	pellets: number,
	hipSpread: number,     -- degrees
	adsSpread: number,
	headMult: number,
}

local list: { [string]: Weapon } = {
	Rifle = { id = "Rifle", slot = "primary", damageNear = 25, damageFar = 18, rangeNear = 60, rangeFar = 160,
		maxRange = 600, rpm = 600, mag = 30, reserve = 120, reload = 2.2, pellets = 1, hipSpread = 4, adsSpread = 0.8, headMult = 1.6 },
	Shotgun = { id = "Shotgun", slot = "primary", damageNear = 12, damageFar = 4, rangeNear = 10, rangeFar = 30,
		maxRange = 80, rpm = 75, mag = 6, reserve = 30, reload = 0.5, pellets = 8, hipSpread = 7, adsSpread = 5, headMult = 1.2 },
}

local function damageAt(weapon: Weapon, distance: number): number
	if distance <= weapon.rangeNear then
		return weapon.damageNear
	elseif distance >= weapon.rangeFar then
		return weapon.damageFar
	end
	local t = (distance - weapon.rangeNear) / (weapon.rangeFar - weapon.rangeNear)
	return weapon.damageNear + (weapon.damageFar - weapon.damageNear) * t
end

return { list = list, damageAt = damageAt }
```

Look weapons up with `Weapons.list[id]`; keeping the function out of the typed table keeps `--!strict` happy. For shotguns, the client sends one Fire per trigger pull with the base direction; the server generates the pellet directions with a `Random` seeded from the shot id it assigned, so client and server agree and the client can't choose pellet paths. (If you prefer the client to draw pellets exactly, send the seed to the client in the HitConfirm and let it redraw.)

### Client: spread and local raycast

```lua
--!strict
-- StarterPlayerScripts.Controllers.WeaponController (excerpt)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local Fire = ReplicatedStorage.Remotes.Fire
local camera = workspace.CurrentCamera
local rng = Random.new()
local nextShotId = 0

local function spreadDirection(direction: Vector3, degrees: number): Vector3
	local base = CFrame.lookAt(Vector3.zero, direction)
	local angle = math.rad(degrees) * math.sqrt(rng:NextNumber()) -- uniform over the cone's disc
	local spin = rng:NextNumber() * 2 * math.pi
	return (base * CFrame.Angles(0, 0, spin) * CFrame.Angles(angle, 0, 0)).LookVector
end

local function fire(weapon, currentSpread: number)
	local viewport = camera.ViewportSize
	local ray = camera:ViewportPointToRay(viewport.X / 2, viewport.Y / 2)
	local direction = spreadDirection(ray.Direction, currentSpread)

	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = { Players.LocalPlayer.Character :: Model, camera }

	local result = workspace:Raycast(ray.Origin, direction * weapon.maxRange, params)
	-- local feedback now: sound, muzzle flash, recoil, tracer, hitmarker if result hit a Humanoid
	nextShotId += 1
	Fire:FireServer(nextShotId, ray.Origin, direction, if result then result.Instance else nil)
end
```

The camera origin works for first person. For third person, the server's origin check must allow the camera offset (shoulder cameras sit 3-6 studs from the head); either cast from the character's head toward the camera ray's aim point (and send that origin), or widen rule 32's limit to 8 studs for TPS.

### Server: validate a shot

```lua
--!strict
-- ServerScriptService.Services.WeaponService (excerpt)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Weapons = require(ReplicatedStorage.Shared.Config.Weapons)
local HistoryService = require(script.Parent.HistoryService) -- records Head and root CFrames at 20 Hz

local MAX_REWIND = 0.25
local INTERP = 0.1
local HEAD_RADIUS = 0.8

type GunState = { weapon: Weapons.Weapon, ammo: number, lastShot: number, reloadingUntil: number }
local guns: { [Player]: GunState } = {}

local function distanceToRay(point: Vector3, origin: Vector3, unit: Vector3): (number, number)
	local t = math.max(0, (point - origin):Dot(unit))
	return (origin + unit * t - point).Magnitude, t
end

local function onFire(player: Player, shotId: unknown, origin: unknown, direction: unknown, _hint: unknown)
	if typeof(shotId) ~= "number" or typeof(origin) ~= "Vector3" or typeof(direction) ~= "Vector3" then
		return
	end
	local state = guns[player]
	local character = player.Character
	local head = character and character:FindFirstChild("Head") :: BasePart?
	local hum = character and character:FindFirstChildOfClass("Humanoid")
	if not state or not head or not hum or hum.Health <= 0 then
		return
	end
	local now = workspace:GetServerTimeNow()
	local weapon = state.weapon
	if now < state.reloadingUntil or state.ammo <= 0 then
		return
	end
	if now - state.lastShot < 0.9 * 60 / weapon.rpm then
		return -- faster than the gun can fire
	end
	if math.abs(direction.Magnitude - 1) > 0.05 then
		return
	end
	local ping = player:GetNetworkPing()
	if (origin - head.Position).Magnitude > math.min(4 + hum.WalkSpeed * ping, 8) then
		return -- origin too far from the head
	end
	state.lastShot = now
	state.ammo -= 1

	local rewindTime = now - math.min(ping / 2 + INTERP, MAX_REWIND)

	-- 1. Where does the map stop the bullet?
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	local ignore = {}
	for _, p in Players:GetPlayers() do
		if p.Character then
			table.insert(ignore, p.Character)
		end
	end
	params.FilterDescendantsInstances = ignore
	local wall = workspace:Raycast(origin, direction * weapon.maxRange, params)
	local maxT = if wall then wall.Distance else weapon.maxRange

	-- 2. Which rewound player does the ray pass through first?
	local bestTarget: Player? = nil
	local bestT = math.huge
	local bestHead = false
	for _, other in Players:GetPlayers() do
		if other ~= player and other.Team ~= player.Team then
			local snapshot = HistoryService.at(other, rewindTime) -- { head: CFrame, root: CFrame }?
			if snapshot then
				local headDist, headT = distanceToRay(snapshot.head.Position, origin, direction)
				local bodyDist, bodyT = distanceToRay(snapshot.root.Position, origin, direction)
				if headDist <= HEAD_RADIUS and headT < maxT and headT < bestT then
					bestTarget, bestT, bestHead = other, headT, true
				elseif bodyDist <= 1.4 and bodyT < maxT and bodyT < bestT then
					bestTarget, bestT, bestHead = other, bodyT, false
				end
			end
		end
	end

	if bestTarget then
		local victimHum = (bestTarget.Character :: Model):FindFirstChildOfClass("Humanoid")
		if victimHum and victimHum.Health > 0 then
			local damage = Weapons.damageAt(weapon, bestT) * (if bestHead then weapon.headMult else 1)
			victimHum:SetAttribute("LastHitBy", player.UserId)
			victimHum:TakeDamage(damage) -- respects spawn ForceFields
			ReplicatedStorage.Remotes.HitConfirm:FireClient(player, math.floor(damage), bestHead, victimHum.Health <= 0)
			ReplicatedStorage.Remotes.Damaged:FireClient(bestTarget, origin, math.floor(damage))
		end
	end
	local finish = origin + direction * math.min(bestT, maxT)
	ReplicatedStorage.Remotes.ShotFx:FireAllClients(player, origin, finish)
end
```

Notes for Builder:
- `bodyDist <= 1.4` treats the torso as a capsule around the root. Replace it with a proper box test if Balance wants limb multipliers.
- Free-for-all modes have no teams: change the team check to `other ~= player`.
- Add the cone check (rule 38) and the shot-statistics logging (rule 41) before shipping.
- In production, send ShotFx only to players within 300 studs of the shot.

### Spawn selection

```lua
--!strict
local Players = game:GetService("Players")

local function scoreSpawn(spawnPart: BasePart, team: Team?): number
	local score = 0
	for _, player in Players:GetPlayers() do
		local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
		if root and player.Team ~= team then
			local distance = (root.Position - spawnPart.Position).Magnitude
			score -= 1000 / math.max(distance, 10) -- enemies nearby are bad
			local params = RaycastParams.new()
			params.FilterType = Enum.RaycastFilterType.Exclude
			params.FilterDescendantsInstances = { player.Character :: Model }
			local blocked = workspace:Raycast(root.Position, spawnPart.Position - root.Position, params)
			if not blocked or blocked.Instance == spawnPart then
				score -= 50 -- an enemy can see this spawn
			end
		end
	end
	return score + math.random() -- break ties
end
```

Pick the best-scoring spawn of the team's 3-6 spawn points. Give a ForceField for 2.5 s and remove it on the first shot.

### Collision groups

Register `Players`, `Bots`, `Ragdolls` and `Projectiles` collision groups in Studio at edit time (the PhysicsService reference recommends this and caps the engine at 32 groups) [20][21]. Projectiles don't collide with their shooter's group; ragdolls don't collide with players, so bodies never block doorways.

### First-person setup

- `Players.LocalPlayer.CameraMode = Enum.CameraMode.LockFirstPerson` for FPS; `UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter` while in a match on PC.
- The viewmodel (arms and gun) is a client-only Model parented under the camera and positioned each frame with `RunService:BindToRenderStep` after the camera update. Other players see the third-person gun on the character.
- Ammo crates, weapon pickups and objectives use ProximityPrompts; a non-zero `HoldDuration` makes a capture or plant feel deliberate and shows a progress bar [28].
- Knives and melee in a shooter use the melee hitbox rules from [[Genre - Action and Combat]]; community modules cast rays from weapon attachments for swing arcs [29].
- Reload and equip timings come from animation markers in the viewmodel animations (for example, "MagOut" and "MagIn"), read with `GetMarkerReachedSignal` for sounds [27]; the server uses the reload time from WeaponConfig.

## 12. Twists that work

42. **Pick one twist and make it the thumbnail.** "Another arena shooter" doesn't get clicks.

- **Non-violent theme with full mechanics.** Water guns, foam darts, paint, snowballs, lasers. Keeps the maturity label low and widens the audience. Roblox's own sample is laser tag [4].
- **Gun-game or weapon roulette.** Random weapon every kill or every 30 s. Forces variety and makes new weapons a party.
- **Shooter plus building.** Place walls and ramps mid-fight. A big skill ceiling, but test it on phones first.
- **Co-op versus waves.** No PvP pressure, good for younger players and friends. Upgrades between waves. Bots are the content.
- **Movement shooter.** Grapples, wall-runs, jump pads. A clear thumbnail and a distinct feel.
- **Tiny maps, big chaos.** 16 players in a 120-stud arena with one-shot weapons: rounds last 30 s and everyone laughs.
- **Pets or companions that fight.** A drone that marks enemies or a pet that revives you. Bridges to [[Genre - RNG and Collection]].
- **Class-based heroes.** Each class has one ability on a cooldown. Combine with section 5's power budget idea from [[Genre - Battlegrounds]].
- **Asymmetric modes.** One giant player versus 10 tiny ones. A strong event mode.

## 13. Failure modes

43. **"I hit him!"** The shooter saw a hit, the server said no, and there was no feedback. Fix: local hitmarkers that only show when the local ray hits, server rewind (rule 33), generous head radius.
44. **"I died behind a wall."** Too much rewind. Fix: cap at 0.25 s (rule 33).
45. **Aimbots and silent aim.** Fix: rules 31-38 for hard checks, rule 41 for statistics, human review before bans.
46. **One gun dominates.** Fix: section 5's kill-time-by-range plot and weekly balance (rule 28).
47. **Spawn kills.** Fix: spawn scoring and protection (rule 2, section 11).
48. **Empty servers.** Fix: bots fill slots (rule 40), fewer and bigger servers.
49. **Phone players can't compete.** Fix: aim assist, auto-fire option, 50% visual recoil, big buttons (section 7).
50. **Pay-to-win guns.** Fix: section 6.
51. **Matches with no end.** Fix: timers (rule 6).
52. **Performance collapse in big fights.** Fix: effects lifetimes and caps (rule 19), ShotFx only to nearby players.
53. **Too realistic for the audience.** Blood, realistic military violence. Fix: stylized hits, bright themes, honest maturity answers.
54. **No progression after level 20.** Fix: weapon mastery, prestige, battle pass, ranked.

## 14. Pitch checklist: is this genre right for us right now?

Fewer than 9 yes answers means rethink.

1. Do we have a twist a player can see in the thumbnail (theme, mode or movement)?
2. Can Librarian deliver 6 guns with viewmodel animations, sounds and effects at a quality players compare with top shooters?
3. Is the netcode plan (section 11) in the contracts, with rewind and validation?
4. Can we fill servers with bots at launch?
5. Is the theme kid-appropriate (no gore) and the maturity questionnaire answered honestly?
6. Does the weapon table pass the crossover checks?
7. Will 16 players firing run at 30+ FPS on the test phone?
8. Is there no paid stat item anywhere?
9. Is there a progression for 50+ hours (mastery, pass, ranked)?
10. Can we ship a new weapon every 2-4 weeks and a map every 4-6?
11. Does the mobile layout let a player move, aim and fire at once?
12. Can a new player get a kill in their first match (Kid Tester)?

## Checklist

- [ ] Lobby to first match in one tap; first kill possible within 60 s.
- [ ] Respawn 3-5 s with 2-3 s of spawn protection that ends on firing.
- [ ] Gun sound, muzzle flash, recoil and tracer play in the same frame as the click.
- [ ] Local hitmarker on local hit; server confirm shows damage and kill.
- [ ] Casual rifle TTK 0.5-0.8 s at mid range in a two-client test.
- [ ] Every gun's kill-time curve is lowest at some range.
- [ ] Server rejects shots beyond the mag, faster than RPM ×1.1, with origins more than 4-8 studs from the head (modified-client test).
- [ ] Damage comes only from server WeaponConfig.
- [ ] Rewind is capped at 0.25 s; shots through non-penetrable walls do nothing.
- [ ] No hit detection uses `Touched`.
- [ ] Projectiles use server-stepped shapecasts.
- [ ] ShotFx uses an UnreliableRemoteEvent; HitConfirm, Damaged and RoundState use RemoteEvents.
- [ ] Bots fill servers under 6 players and are labelled.
- [ ] Spawns are scored; no spawn in an enemy's sightline.
- [ ] Team outline visible on every skin.
- [ ] Mobile: fire button 110+ px, second fire button on the left, aim assist and auto-fire options.
- [ ] Settings include separate ADS sensitivity, FOV and crosshair color.
- [ ] Match timer always visible; matches end in 5-8 minutes.
- [ ] Shot statistics logged per player per match.
- [ ] No paid stat items; crates check PolicyService and show odds.
- [ ] No blood or gore.
- [ ] 16 players firing at 30+ FPS on the test phone.

## Common mistakes

1. Trusting the client's hit instance or damage [9].
2. Using the client's timestamp to decide rewind [8].
3. Unlimited rewind, so players die behind walls.
4. Server-side gunfire with no local feedback, so every shot feels late.
5. `Touched` bullets [14].
6. Firing a RemoteEvent per tracer to every client instead of an UnreliableRemoteEvent to nearby clients [15].
7. One gun that's best at every range.
8. Real recoil on mobile that thumbs can't control.
9. No aim assist for touch players.
10. Spawn points with sightlines to the action.
11. Long maps with 300+ stud sightlines and no cover.
12. Skins that hide players.
13. Paid guns with better stats.
14. No bots, so the first player in a server waits alone.
15. A match with no end condition.
16. Bullet holes and casings that never clean up.
17. Viewmodel parented somewhere that replicates, so everyone sees floating arms.
18. Testing only in solo Play mode instead of two clients with simulated latency.
19. Banning automatically from one statistic.
20. Realistic gore for a young audience.

## References

[1] Raycasting (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/raycasting — `Raycast` basics and direction from origin to destination.
[2] WorldRoot class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/WorldRoot — spatial query methods and OverlapParams.
[3] Introducing Shapecasts (DevForum) — https://devforum.roblox.com/t/introducing-shapecasts/2320655 — Blockcast and Spherecast for fast-moving projectiles and area damage.
[4] Implement blaster behavior (Roblox Creator Documentation) — https://create.roblox.com/docs/tutorials/curriculums/gameplay-scripting/implement-blasters — laser tag sample: blast data, local BindableEvent for visuals, RemoteEvent to the server, cooldowns.
[5] Implement blaster behavior, Markdown version (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/tutorials/curriculums/gameplay-scripting/implement-blasters.md — same tutorial in plain text for agents.
[6] Laser traps with beams (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/vfx/laser-traps-with-beams — beam-based damaging hazards.
[7] How to implement lag compensation in Roblox shooters (creation.dev) — https://www.creation.dev/learn/how-to-implement-lag-compensation-roblox-shooters — server rewinds character hitboxes to the shooter's tick.
[8] Combat System with Rollback (DevForum) — https://devforum.roblox.com/t/combat-system-with-rollback/3685525 — ignore client timestamps, ping/2, position buffer rewind.
[9] How to make a secure combat framework (creation.dev) — https://www.creation.dev/learn/how-to-make-secure-combat-framework-roblox — server as source of truth; never trust client hit positions or damage.
[10] Should hitboxes be handled on the client or server? (DevForum) — https://devforum.roblox.com/t/should-hitboxes-be-handled-on-the-client-or-server-in-my-pvppve-game/3055838 — high-ping trade-off of server-only detection.
[11] How would I go about doing client-sided hitboxes? (DevForum) — https://devforum.roblox.com/t/client-sided-hitboxes/3161806 — client detects, server applies.
[12] Combat system - hitboxes (DevForum) — https://devforum.roblox.com/t/combat-system-hitboxes/3312821 — server sanity checks such as distance.
[13] Fast Paced Combat (DevForum) — https://devforum.roblox.com/t/fast-paced-combat/2944831 — responsiveness versus authority.
[14] Network ownership (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/physics/network-ownership — server can't verify client-owned physics; owners can fire Touched.
[15] UnreliableRemoteEvent class reference — https://create.roblox.com/docs/ja-jp/reference/engine/classes/UnreliableRemoteEvent — for continuously changing, non-critical data.
[16] UnreliableRemoteEvent:FireAllClients() docs thread (DevForum) — https://devforum.roblox.com/t/unreliableremoteeventfireallclients-still-attempts-invocations-on-non-connected-clients-contrary-to-docs/3852670 — staff clarification of URE behavior.
[17] ForceField class reference — https://create.roblox.com/docs/reference/engine/classes/ForceField.md — spawn protection through `TakeDamage`.
[18] ContextActionService class reference — https://create.roblox.com/docs/reference/engine/classes/ContextActionService — touch buttons and custom-button advice.
[19] Mobile input (Roblox Creator Documentation) — https://create.roblox.com/docs/input/mobile — mobile buttons with BindAction.
[20] PhysicsService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md — collision groups, server-only changes, 32-group cap.
[21] Collisions (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/collisions.md — collision groups in Studio and in scripts.
[22] Game Feel and Juice, lesson 2 (Wayline) — https://www.wayline.io/learn/game-feel/1 — short freezes and small camera shake for impact.
[23] Hit feedback primer (uhiyama-lab) — https://uhiyama-lab.com/en/notes/unity/unity-game-feel-hit-feedback/ — flash, particles, sound and shake as a feedback stack.
[24] Hitstop returning to Monster Hunter Wilds (Destructoid) — https://www.destructoid.com/after-beta-feedback-hitstop-is-returning-to-monster-hunter-wilds/ — players notice missing impact feedback.
[25] PathfindingService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PathfindingService.md — CreatePath, agent parameters, Blocked, ComputeAsync for bots.
[26] Pathfinding agents (DevForum) — https://devforum.roblox.com/t/pathfinding-agents/851842 — poorly documented agent parameters.
[27] Animation events (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/animation/events — markers for reload sounds and timing.
[28] Proximity prompts (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/ui/proximity-prompts — hold-to-interact for ammo crates, doors and objectives.
[29] Raycast Hitbox V4 (DevForum) — https://devforum.roblox.com/t/374482 — raycast hitboxes for melee weapons in shooters.
[30] Is this a good way to do hitboxes in combat games? (DevForum) — https://devforum.roblox.com/t/is-this-a-good-way-to-do-hitboxes-in-combat-games/3001235 — community hitbox approaches.
[31] Blox Fruits vs Sailor Piece (RoWatcher, 2026) — https://rowatcher.com/news/blox-fruits-vs-sailor-piece-which-anime-rpg-is-actually-growing-faster-in-2026 — weekly versus slow update cadence.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Action and Combat]] · [[Genre - Battlegrounds]] · [[Genre - Party and Social Hangout]] · [[Genre - Survival]]
