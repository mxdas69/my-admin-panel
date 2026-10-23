---
tags: [vault, genre, action, combat, rpg, melee, anime-adventure, bosses, raids, hitboxes]
for: [lead, pulse, architect, builder, balance, playtest]
also: [frame, scenic, librarian, reviewer, merchant, liveops, kid-tester, producer]
---

# Genre - Action and Combat

This is the playbook for games whose main verb is **fight**: swing a sword, throw a punch, cast an ability, dodge, and watch a health bar that isn't yours drop. It covers open-world anime adventure RPGs (the Blox Fruits shape), dungeon crawlers with parties and loot (the Dungeon Quest and World // Zero shape), hardcore parry-and-posture fighters (the Deepwoken shape), arena melee PvP (the Combat Warriors shape), and boss and raid design for all of them. Move-set brawlers where you pick a character and fight everyone in one map are covered on [[Genre - Battlegrounds]]. Guns are covered on [[Genre - Shooter]].

Combat games are decided by two things that have nothing to do with how much content you ship. The first is how one hit *feels* in the first ten seconds. The second is whether the server, not the client, decides who got hit. A game with ten islands and mushy hits loses players to a game with one island and crisp hits. A game with crisp hits and client-trusted damage gets exploited the week it trends. Most rules on this page serve one of those two facts. The rest serve a third: players come back for the next power spike, so progression has to deliver one every few minutes early on and every session after that.

Read this page before pitching or planning any game where combat is the main loop or a big side loop, such as a simulator with bosses, a survival game with mobs, or a tycoon with raids. Architect and Builder read section 11 before writing any combat code. Balance reads sections 2 and 5 before building the economy simulation. Playtest uses the checklist at the end as the test script. Numbers marked as targets are this studio's rules, not measurements of other games.

## 1. What it is and why it works on Roblox

### Sub-genres

| Sub-genre | Main verbs | Reference games | Session shape | Social shape |
|---|---|---|---|---|
| Open-world anime adventure RPG | quest, grind mobs, beat bosses, collect powers | Blox Fruits, Grand Piece Online, Arcane Odyssey, Type Soul | 30-90 min grinding sessions, long-term level climb | Shared server, loose groups for bosses and raids |
| Dungeon crawler | queue, clear rooms, beat boss, loot | Dungeon Quest, World // Zero | 5-15 min runs, chained 3-6 per session | Parties of 2-6 with roles |
| Hardcore parry fighter | read, parry, punish, manage posture | Deepwoken | 45-120 min, high stakes | Small groups, PvP tension |
| Arena melee PvP | duel, parry, combo, kill streak | Combat Warriors | Drop-in, 5-30 min | Free-for-all server, clans |
| Action-lite hybrid | combat as a side loop | simulators with bosses, survival with mobs | inherits the host genre | inherits the host genre |

### The audience

- **The core player is 9-15, plays on a phone or tablet, knows anime, and plays with one or two friends.** Treat that as the default until Pulse's research says otherwise. Hardcore parry games skew older (13-17) and toward PC.
- **Anime framing is proven demand across genres.** Beebom reported that Anime Vanguards, an anime tower defense game launched in September 2024, overtook Blox Fruits as a top-earning Roblox game within 10 days of release [30]. Blox Fruits had reached 14 billion visits in its first four years, per Pocket Tactics [28]. Steal the framing (powers, transformations, bosses with titles), never another studio's characters or names.
- **Players read combat through power, not story.** They want a number that goes up, a move that looks bigger than the last one, and a boss that used to beat them and now doesn't.

### Session shape

- **Early sessions are 15-30 minutes.** The game has to deliver level-ups, a new move and a first boss inside that window (targets in section 4).
- **Mid-game sessions are 30-90 minutes** of zone grinding, boss camping and gear upgrades.
- **Late-game sessions are scheduled.** Raids, events and PvP nights pull players back at set times.

### Why players come back

1. **Power they can see.** Bigger numbers, bigger VFX, and a weapon that changes your silhouette.
2. **A named thing to beat.** Bosses with titles, health bars and drops are the reason to log in tonight.
3. **Friends.** Bosses and raids are easier and more fun in groups, so players invite friends.
4. **Mastery.** Parry timing, combos and boss patterns reward practice. Deepwoken's posture system and Combat Warriors' parry are both skill ceilings players chase [31][34].
5. **New places.** Each update adds an island, a dungeon or a boss. Long-running games live on their update cadence (section 10).

## 2. The core loop

**Loop statement (open-world RPG):** "Accept a quest → defeat enemies with a growing kit of moves → collect XP, currency and drops → level up, spend stat points or upgrade gear → unlock the next move, weapon or zone → challenge the zone boss → repeat in a harder zone."

**Variants:**
- **Dungeon run:** "Queue in the lobby → pick difficulty → clear 4-8 rooms of enemies → beat the end boss → roll loot by difficulty → upgrade or reforge → queue again at a higher difficulty." Dungeon Quest ties its best (Legendary) ability drops to high-difficulty dungeons, which drives the climb [37].
- **Boss rush:** "Summon or wait for a boss → fight it with a group → roll the drop table → craft or upgrade with boss materials → summon the next tier." Blox Fruits raid bosses use summon items, long respawns or kill-count triggers [27].
- **Arena PvP:** "Spawn with a loadout → fight → get a kill or die → earn currency and streak rewards → unlock weapons and cosmetics → respawn."
- **Roguelite run:** "Start weak → pick one upgrade from three after each room → beat the floor boss → keep meta-currency → unlock new starting options."

### The layers

| Layer | Length | What happens | Studio target |
|---|---|---|---|
| Seconds | 0.3-1 s | input → windup → hit → feedback | first hit within 10 s of control; every hit gives 5 feedback layers |
| Encounter | 5-20 s | one camp of 3-5 enemies | trash TTK 2-4 s each at level |
| Quest | 2-4 min | "defeat 5-10 X" or "collect 3 Y" | one quest ≈ one level for the first 10 levels |
| Zone | 20-45 min | clear quests, beat the zone boss, get the zone weapon | one zone per early session |
| Session | 30-90 min | 1-2 zone bosses, a gear upgrade, a new move | ≥1 new move or weapon per session in week 1 |
| Multi-session | days to weeks | new island, raid tier, prestige | a new region every 8-12 weeks (section 10) |

### Loop rules

1. **The first hit lands within 10 s of control, on an enemy that dies in 3 hits.** Nothing teaches combat faster than a kill. Spawn the player facing a camp of 3 training enemies 15-20 studs away, weapon already equipped, with a beam or arrow pointing at the nearest one. Set those enemies' HP to 3× the player's level-1 hit. *Done right:* the player kills something before they've read a word. *Done wrong:* a 40-second cutscene, then a menu to pick a weapon.

2. **A basic attack chain is 3-4 hits at 0.35-0.5 s per hit, and the last hit does 1.5-2× damage with knockback.** A chain gives rhythm and a payoff hit. Store each hit's `windup`, `hitTime`, `recovery` and `damageMult` in Config. Reset the chain if no input arrives within 0.8 s of the last hit. Add a 0.3-0.5 s end lag after the finisher so spamming has a cost. *Done right:* hit, hit, hit, BOOM, enemy flies 8 studs. *Done wrong:* one identical swing on a 0.2 s loop.

3. **Every hit gives five feedback layers within 100 ms: animation, sound, hit flash, damage number, and a short hitstop on heavy hits.** Feedback is what makes damage feel real. Wayline's game feel lesson describes freezing for 50-100 ms on a heavy hit and keeping camera shake small [50]. When Monster Hunter Wilds' beta shipped with little hitstop, players said combat felt off, and Destructoid reported hitstop returning after that feedback [51]. A Unity-focused primer lists the same stack of hitstop, flash, particles, sound and shake, and warns about a slowdown that never recovers [52]. In Roblox, do hitstop on the client only: pause the attacker's and victim's AnimationTracks with `AdjustSpeed(0)` for 40-80 ms, then restore. Never slow the server. *Done right:* heavy hit freezes for 60 ms, flashes white, pops "248" in orange. *Done wrong:* hits register only because the health bar moves.

4. **Every enemy attack is telegraphed for at least 0.4 s (0.6 s for big hits), using animation plus at least one more channel.** Players accept losing to an attack they could read. Game Developer's series on enemy attacks uses Psychonauts' Lungfishopolis boss, whose spoken callouts pair animation with audio before each attack [48]. Wayline warns that relying only on a subtle animation is a common mistake and that signals must stay consistent through a fight [49]. Use a windup pose plus a sound, and for area attacks a red ground decal that fills over the windup. *Done right:* the boss raises its axe, a whoosh plays, a red circle fills in 0.8 s. *Done wrong:* an instant 40% HP slam with no pose.

5. **Trash enemies die in 2-4 s at level, elites in 8-15 s, zone bosses in 45-90 s solo, and raid bosses in 3-6 min with a full party.** Time-to-kill sets pacing. Balance sets enemy HP from target TTK, not the other way round (formula in section 5). *Done right:* camps melt, the boss is a real fight. *Done wrong:* every enemy is a 20-second sponge.

6. **A new move, weapon or stat breakpoint arrives every 5-8 minutes in the first hour, then at least once per session.** Novelty is the reward that keeps a grind fresh. Put move unlocks at levels 3, 6, 10 and 15, and weapons on zone bosses. *Done right:* level 3 unlocks a dash-strike and the game shows it once. *Done wrong:* level 1-20 with the same two moves.

7. **Defense costs a resource. Blocking and parrying draw from stamina or posture, never free.** Free blocking makes fights stall. Deepwoken's block breaks when posture fills, which stuns the defender, and light weapons are hard to parry but easy to block because they deal little posture damage [31]. Combat Warriors' parry uses stamina, so you must wait for it to come back before parrying again [34]. Give a block meter of 100, drain 10-25 per blocked hit, regen 20/s after 1 s without blocking. *Done right:* turtling breaks after 5 hits. *Done wrong:* hold block forever.

8. **Every enemy move carries a readable tag for how to answer it.** The Deepwoken wiki labels monster attacks as Parryable, Blockable, Dodgeable or Unparryable [32]. Choose 3 answers (block, dodge, parry) and tie each to a visual: normal hits have no tint, unblockable hits glow red, and unparryable grabs flash white. Keep the colors the same on every enemy in the game. *Done right:* players learn "red means roll." *Done wrong:* some red attacks are blockable and some aren't.

9. **Bosses have 2-3 phases at 66% and 33% HP, and each phase adds one new attack, not more HP.** Phases create a story inside the fight. At each threshold, play a 1-2 s roar (boss invulnerable, players can reposition), change one visual (aura color, arena hazard), and add one attack. *Done right:* phase 2 adds a ground slam with a 0.8 s telegraph. *Done wrong:* phase 2 is the same boss with double HP.

10. **Death costs time, never progress, in a PvE game for kids.** Losing a level or items makes 10-year-olds quit. On death, respawn at the zone's checkpoint within 3-5 s and keep all XP and items. If you want stakes, take a small slice of unbanked currency (5-10%) or cancel the current boss attempt. Hardcore games like Deepwoken can go harder because their audience chose it. *Done right:* die, respawn in 4 s next to the boss arena. *Done wrong:* die, lose 20 minutes of drops.

11. **The next quest giver is visible from where the last quest was turned in.** Players should never ask "what now?" Place giver NPCs with a "!" BillboardGui above them (rendered 60-80 px tall, `AlwaysOnTop = true`, `MaxDistance` 150) and draw a dashed trail to the active objective. *Done right:* turn in, look up, see the next "!". *Done wrong:* the next quest is on another island with no marker.

12. **Fights happen near other players by design.** Watching someone else beat a boss is the best advert for the next level. Put boss arenas next to the zone's main path and show other players' damage numbers at 60% opacity. *Done right:* new players gather to watch the boss fight. *Done wrong:* bosses hidden in instanced rooms nobody sees.

## 3. Top games in the genre

### Blox Fruits: fighting styles as collectible progression
**Game:** Blox Fruits ([25], [26], [27], [28], [53])
**Shows:** The wiki calls fighting styles the core mechanism of the combat system. Each style is learned from a teacher NPC, and new characters start with basic Combat, which they lose once they learn another style [25]. Some bosses can't be damaged without Aura (the game's armament power). Against the Cake Queen, the wiki advises keeping your distance and dashing constantly, and it calls her the strongest boss for her damage and health [26]. Raid bosses are tougher than normal bosses. Some need a special summoning item, some just respawn slowly in the early seas, and the Tyrant of the Skies only spawns after a group kills 300 enemies in the Tiki Outpost [27]. Fan guides rank styles by role: Pocket Gamer calls Sharkman Karate the best for grinding and Godhuman arguably the strongest [53]. Pocket Tactics reported 14 billion visits in its first four years [28].
**Why it works:** Every power is a collectible with a teacher, a location and a requirement, so the world doubles as the progression menu. Bosses with special conditions (need Aura, keep distance) teach players to come back stronger.
**Steal:** Moves learned from NPC teachers placed in the world. Bosses gated by a power the player earns elsewhere. Group-triggered raid bosses (kill N enemies together to spawn it).
**Avoid:** A 2026 analysis argued that its 2-3 month major-update cycle and growing complaints about grind, pay-to-win perception and "sluggish combat feel" were costing it ground to a rival that ships weekly [29]. That's one outlet's opinion, but the lesson stands: combat feel and cadence age badly if ignored.

### Sailor Piece: weekly updates as a weapon
**Game:** Sailor Piece ([29])
**Shows:** RoWatcher's 2026 comparison describes Sailor Piece as an anime RPG competing directly with Blox Fruits, shipping updates weekly against Blox Fruits' 2-3 month major cycle [29].
**Why it works:** In a genre where content is consumed fast, a weekly drop gives players a reason to check in every week and gives creators something to make videos about.
**Steal:** A fixed weekly cadence of small drops (a boss, a weapon, a quest chain) between bigger regional updates (section 10).
**Avoid:** Weekly drops that are only numbers. Each drop needs one thing a player can see or fight.

### Deepwoken: posture turns defense into a resource
**Game:** Deepwoken ([31], [32], [33])
**Shows:** Blocking and parrying both run on a posture meter. When posture fills, the block breaks and the player is stunned. Light weapons are hard to parry but easy to block because they deal little posture damage, and chip damage doesn't happen on a parried attack [31]. Monster attacks on the wiki carry tags such as Parryable, Blockable, Dodgeable and Unparryable [32]. Some enemies, like the Hollow Angel, have so much posture resistance that you have to keep trading parries to land attacks [33].
**Why it works:** Every exchange is a decision with a cost. Weapon weight changes which defense is right, so builds matter even at equal stats.
**Steal:** A posture or guard meter that fills from blocked hits. Per-attack answer tags. Enemies that reward a specific defense.
**Avoid:** Copying the difficulty for a young audience. The hardcore tuning works for players who chose it, not for a 10-year-old's first session.

### Combat Warriors: the parry as the skill ceiling
**Game:** Combat Warriors ([34], [35], [36])
**Shows:** Guides describe the parry as holding F while facing the opponent, with camera lock (left Ctrl) making parries easier [34]. A successful parry stuns the attacker, leaving them unable to move for a few seconds, and the parry draws on stamina [34]. One guide describes a purple shield lasting about a second during which hits do no damage [35]. Another says a whiffed parry slows you sharply for about a second and a half and stops you swinging, and that the kick only works on stunned targets [36]. These numbers come from fan guides, so treat them as approximate.
**Why it works:** One button with a tight window, a big reward (stun) and a real punishment (slow, no swing) creates readable mind games between two players.
**Steal:** Parry with a short active window (0.15-0.3 s), a stamina cost, a stun reward and a whiff punishment. Follow-up moves that only work on stunned targets.
**Avoid:** Parry windows so wide that spamming works, which turns every fight into who presses first.

### Dungeon Quest: the party run with loot by difficulty
**Game:** Dungeon Quest ([37], [38], [39])
**Shows:** Sportskeeda's guide says abilities come from leveling and clearing dungeons, and that the best (Legendary) abilities only drop from high-difficulty dungeons [37]. It describes parties built around a warrior, a mage, a healer and a tank [37]. Each dungeon has level requirements and time limits per difficulty; its guide gives Samurai Palace's Insane difficulty a level 90 requirement [38]. Guides for Dungeon Quest Reborn, a separate later game, say players must complete the dungeon to receive its armor, weapons, skills and currency [39].
**Why it works:** Difficulty tiers reuse the same map 3-5 times with better loot, which multiplies content cheaply. Roles give friends different jobs.
**Steal:** One dungeon map × 4 difficulties (Easy, Normal, Hard, Insane) with level gates and rarer drops per tier. Loot granted only on completion.
**Avoid:** Time limits so tight that one weak party member fails everyone. Use time for bonus rewards, not as a fail state, on Easy and Normal.

### World // Zero: classes as roles, with a free and a paid path
**Game:** World // Zero ([46], [47])
**Shows:** Classes set a character's stats and skills and define its combat role, with about a dozen classes split into damage, support and hybrid [46]. Most classes unlock by leveling, some take long quests, and some can be bought with Robux [46]. Guides list the Spirit Archer as a high-damage class unlocked with 100 Tier III Class Tickets or 800 Robux, and the Mage of Light as the main support, healing and shielding allies [46][47].
**Why it works:** Class swapping is new gameplay without new content. Every paid class also has a grind path, so buying is a shortcut, not a wall.
**Steal:** Roles (damage, support, tank) with class unlocks spread across levels. A Robux shortcut only where a free path exists.
**Avoid:** Shipping a paid class that's clearly stronger than every free one. That's how "pay-to-win" reviews start.

### Arcane Odyssey: magic plus fighting styles, taught by mentors
**Game:** Arcane Odyssey ([40], [41])
**Shows:** Combat runs on two systems. Magic comes in types such as explosion, plasma, metal and ice, and is optional; you can build a character that never uses it [41]. Fighting styles scale with Strength, are taught by NPC mentors for a currency cost and a minimum Strength, and grant techniques [41]. Fan tier lists rank styles by base damage and abilities, while noting that skill and magic choice change the answer [40].
**Why it works:** Two independent axes (magic type × fighting style) make builds feel personal from a short list of parts.
**Steal:** Two progression axes that combine (element × weapon family). Mentors with a stat gate, so the world shows what's coming next.
**Avoid:** Tier lists that settle on one answer. Patch the top pick down or add counters before the whole server runs it.

### Grand Piece Online: rare powers from risky activities
**Game:** Grand Piece Online ([42], [43])
**Shows:** The wiki lists ways to get devil fruits, such as ship farming, where the drop chance from Caravels is about 2%, and dungeons, which need at least wave 25 for a fruit [42]. Sportskeeda counts 13 fighting styles, each with its own unlock requirement, usable as a main style or as a placeholder until a rare fruit drops [43].
**Why it works:** Rare powers come from activities that take effort and risk, so a fruit has a story. Fighting styles keep players strong while they hunt.
**Steal:** A chase item with a small, published drop chance from a hard activity, plus a reliable fallback power path.
**Avoid:** Making the chase item the only way to be viable. Players without it quit before they get lucky.

### Type Soul: race and stat paths as build identity
**Game:** Type Soul ([44], [45])
**Shows:** A stats guide lists the stat paths as Hakuda, Kendo, Kido, Healing and Speed [44]. Pocket Tactics' tier list ranks races and sub-races and notes that rankings depend on the current meta, techniques and weapons [45].
**Why it works:** Race is a big identity choice made early. Stat paths let players specialize inside it, so two players of the same race can still play differently.
**Steal:** One early identity choice (race, clan, school) plus a stat path that shapes the moveset.
**Avoid:** Making the identity choice permanent and random with no way to change it. Offer a reroll you earn in game, with a Robux option at most.

## 4. The first five minutes

Targets for the opening of an open-world combat RPG. Adjust the setting, keep the beats.

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0-8 s | Loading screen in ReplicatedFirst with the game logo and a tip | Preload only the starter island and the first 3 animations (`ContentProvider:PreloadAsync`). Hard cap 8 s; drop the loading screen even if assets are still streaming. |
| 8-10 s | Spawn on the starter island, sword equipped, camera behind the shoulder, facing a camp of 3 weak enemies 15-20 studs away | Starter weapon is in the Backpack and equipped by script on CharacterAdded. A Beam from the player's root to the nearest enemy, 0.3 studs wide, bright yellow. |
| 10-15 s | "Click / tap to attack" prompt, 1 line, above the attack button | Show the mobile attack button pulsing (scale 1.0 to 1.1, 0.6 s loop) |
| 15-25 s | First kill: 3 hits, damage numbers, coin pop, XP bar fills a third | Enemy HP = 3 × player hit. Gold and XP fly to the HUD with a 0.4 s tween. |
| 25-45 s | Kill the other two, level 2 at about 40 s | Level-up: 1.2 s burst VFX, sound, "+3 stat points" toast. Auto-allocate to the weapon's stat by default; let players change it later. |
| 45-75 s | Quest giver "!" is 10 studs away; walk up, prompt "Talk" (ProximityPrompt, HoldDuration 0, which fires immediately [14]) | Accepting is one tap. The tracker shows "Defeat 5 Bandits 0/5" with a distance arrow. |
| 75-150 s | Fight the bandit camp 40 studs away; enemies now hit back with a 0.6 s telegraph | First incoming damage. The health bar flashes red, and a tip shows "Block: F / shield button" once. |
| 150-180 s | Quest turned in; level 3; first ability unlocked | A full-width banner "New move: Rising Slash" with a 3 s looping preview on a dummy. The ability button lights up. |
| 180-240 s | Use the ability on the next camp; elite enemy appears with a name plate and a gold outline | Elite TTK 10 s. It has one telegraphed AoE (red circle) to teach dodging. |
| 240-300 s | Elite dies, guaranteed first weapon drop (Uncommon), equip prompt; the zone boss arena is visible ahead with players fighting | The equip prompt is one tap. The next quest is "Defeat the Bandit Chief", with the boss timer shown. |

Rules for the opening:

13. **No menus, shops or popups in the first 60 seconds.** Every early click that isn't combat is a chance to leave. Defer daily rewards, codes, shop and settings until after the first quest turn-in (about 2.5 minutes). *Done right:* the first UI panel is the level-up toast. *Done wrong:* a daily reward calendar covers the sword tutorial.

14. **Teach one verb at a time, and only when it's needed.** Attack at 10 s, block when the first enemy hits back, ability at level 3, dodge at the elite's first AoE. Each tip shows once, for at most 4 s, and never returns after the player has done the action twice. *Done right:* the dodge tip appears as the first red circle fills. *Done wrong:* a 6-page controls screen at spawn.

15. **The first weapon drop is guaranteed and lands before minute 5.** Loot is the hook. Script the elite's first kill per player to drop a fixed Uncommon weapon, then switch to the normal drop table. *Done right:* a glowing sword pops out with a rarity beam. *Done wrong:* a 2% drop chance on the first elite.

16. **Show the first boss before the player can fight it.** Seeing a big enemy and other players fighting it sets the next goal. Put the zone boss arena in sight of the quest hub, 60-100 studs away, with its health bar visible to anyone within 120 studs. *Done right:* "That's the Bandit Chief. Level 8 recommended." *Done wrong:* the boss is behind a loading door.

## 5. Progression and economy

All numbers here are targets for Balance to simulate and tune in `economy.md`, not measurements of other games.

### Shapes

- **Level climb:** a power curve. Levels come fast early (every 30-90 s for levels 1-5) and slow to 10-13 minutes per level near the launch cap of 100.
- **Gear:** discrete jumps. Each zone boss drops a weapon about 25-40% stronger than the previous zone's best.
- **Moves:** milestone unlocks at fixed levels, so every player gets the same story beats.
- **Rare powers:** a long-tail chase with pity (section 5d).

### 5a. XP formulas and table

- XP to next level: `XPtoNext(L) = floor(100 × L^1.8)`
- XP per at-level kill: `mobXP(L) = floor(20 × L^1.1)`
- Kills per level then grows as about `5 × L^0.7`.
- Quest rewards add 30-50% on top of kill XP, so quests are always the fastest path.

| Level | XP to next | XP per kill | Kills per level | Minutes per level (6 s per kill incl. travel, no quests) |
|---|---|---|---|---|
| 1 | 100 | 20 | 5 | 0.5 |
| 2 | 348 | 43 | 8 | 0.8 |
| 5 | 1,812 | 117 | 15 | 1.6 |
| 10 | 6,310 | 252 | 25 | 2.5 |
| 20 | 21,970 | 540 | 41 | 4.1 |
| 50 | 114,360 | 1,478 | 77 | 7.7 |
| 100 | 398,107 | 3,170 | 126 | 12.6 |

Targets this produces: level 10 in about 12-16 minutes and the level-100 cap in about 10 hours of play with quests. Check this with the simulation, then tune the 1.8 exponent before launch, never after.

### 5b. Damage and HP

Design from time-to-kill. Don't pick HP numbers by feel.

```
hitDamage(L, weapon) = weapon.base × (1 + statPoints × 0.02) × move.mult
expectedDPS(L)       = hitDamage × hitsPerSecond (≈ 2.2 for a 4-hit chain) × 0.8 accuracy
enemyHP(L, tier)     = targetTTK[tier] × expectedDPS(L)
targetTTK            = { trash = 3, elite = 12, zoneBoss = 70, raidBoss = 270 (per-player share × partySize) }
mitigation(defense)  = 100 / (100 + defense)        -- 100 defense halves damage
finalDamage          = hitDamage × critMult (1.5, 10% base chance) × mitigation × levelGap
levelGap             = clamp(1 - 0.05 × (enemyLevel - playerLevel), 0.5, 1.2)
```

- **Enemy damage is a share of player HP, not a free number.** A trash hit takes 4-6% of an at-level player's max HP, an elite hit 10-15%, a boss heavy 25-35%, and an unblockable boss move up to 45%. No single PvE hit kills a full-HP at-level player.
- **The level gap clamp stops one-shots both ways.** Over-leveled players still take 50% damage at worst, and under-leveled players do at least 50% damage, so helping a friend still works.

### 5c. Stats

- 3 stat points per level (300 at cap). Four stats: Melee, Weapon, Power (abilities) and Vitality (HP +2% per point).
- One free full reset at any time in the first 20 levels. After that, a reset costs soft currency (1 hour of income) or a Robux product (section 6).
- A soft cap at 150 points in one stat: points past 150 give half value. This stops one-stat builds from breaking PvP.

### 5d. Drops, rarity and pity

| Source | Common | Uncommon | Rare | Epic | Legendary | Pity |
|---|---|---|---|---|---|---|
| Trash enemy | 2% (material) | - | - | - | - | none |
| Elite | 60% | 30% | 9% | 1% | - | none |
| Zone boss | 40% | 35% | 18% | 6% | 1% | Epic guaranteed by the 25th kill without one |
| Raid boss | - | 40% | 35% | 18% | 7% | Legendary guaranteed by the 40th clear without one |

- **Publish the odds in game.** Show the drop table on the boss's info panel. Grand Piece Online's wiki-published 2% caravel drop rate for fruits is the kind of number players plan around [42].
- **Pity counts per player per boss** and is stored in the save. A pity drop resets the counter.
- Rarity sets color and VFX everywhere: Common grey `#B4B4B4`, Uncommon green `#4CD964`, Rare blue `#3FA9F5`, Epic purple `#B05CFF`, Legendary gold `#FFC83D`. See [[03 Rarity and RNG]].

### 5e. Currency and sinks

| Flow | Formula (target) | Notes |
|---|---|---|
| Gold per at-level kill | `floor(5 × L^1.1)` | about 50 gold per minute at level 1, about 7,900 per minute at level 100 |
| Weapon upgrade +n | `cost = 100 × 1.6^n × zoneTier` | +1 to +10, each +n adds 6% damage; +10 needs a boss material |
| Move unlock | `500 × unlockLevel` gold | some moves are learned from NPC teachers in the world, as Blox Fruits does with fighting styles [25] |
| Stat reset | 60 minutes of income | free in the first 20 levels |
| Fast travel | 2% of a minute's income per jump | removed by a pass |

Worked weapon upgrade table (zone tier 1):

| Upgrade | Cost (gold) | Cumulative | Damage bonus |
|---|---|---|---|
| +1 | 160 | 160 | +6% |
| +2 | 256 | 416 | +12% |
| +3 | 410 | 826 | +18% |
| +5 | 1,049 | 2,537 | +30% |
| +7 | 2,684 | 6,981 | +42% |
| +10 | 10,995 + boss material | 29,129 | +60% |

The +10 weapon from zone 1 is about as strong as a +0 weapon from zone 2, so upgrading is a choice, not a must.

## 6. Monetization that fits

Merchant proposes these prices and the owner approves them. Prices are targets, not measurements of other games.

### Game passes

| Pass | Target price (R$) | Why it fits | Rule |
|---|---|---|---|
| 2× XP | 299-399 | speeds the climb, doesn't change who wins a fight at equal level | never stacks above 2× from passes |
| 2× Drops (boss and elite rolls) | 399-499 | more chances, same odds | pity still applies |
| Extra Inventory (+50 slots) | 99-149 | convenience | free cap must be enough to play (100+) |
| Fast Travel | 149-199 | convenience | free players can still walk or pay gold |
| VIP (chat tag, aura cosmetic, +1 daily reward) | 199-299 | status | cosmetic only in PvP |
| Extra Equipped Move Slot | avoid | adds combat power | only acceptable in PvE-only games, never with PvP |

### Developer products

| Product | Target price (R$) | Rule |
|---|---|---|
| 30-min 2× XP boost | 49-99 | stacks with the pass up to 3× total |
| Stat reset | 49 | the free path exists (gold) |
| Race or class reroll | 99 | only if the free path exists (an earnable reroll token), as World // Zero pairs Robux and ticket unlocks [46] |
| Gem packs | 49 / 99 / 199 / 399 / 799 / 1,599 | bigger packs give +10-30% bonus gems; see [[09 Shops and Monetization]] |
| Boss summon key | 49-149 | only for bosses that can also be summoned with a free in-game item |

### Off-limits

- **No PvP stat power for Robux.** Weapons, stats and moves that win fights must be earnable in play. Paid things in PvP are cosmetics, convenience and time.
- **No paid random items without the policy check.** If a product grants a random item, check `PolicyService:GetPolicyInfoForPlayerAsync(player).ArePaidRandomItemsRestricted` and offer a direct-purchase alternative where restricted. See [[09 Shops and Monetization]].
- **No paying to skip a boss's first kill.** The first kill is the story beat. Sell retries and boosts, not the win.
- **No "pay to revive" prompt mid-boss for players under level 10.** It reads as a trap to kids. Offer it only in raids, as a tiny button, never a full-screen modal.
- **No fake timers or "last chance" pressure on weapons.** See [[09 Shops and Monetization]].

## 7. UI and HUD for this genre

Frame builds these. Layout uses scale with an offset for minimum size. See [[05 UI and HUD]] and [[08 Mobile]].

### HUD layout (landscape, all devices)

| Element | Position | Size | Notes |
|---|---|---|---|
| Health bar | top-left, 16 px from the safe-area edge | 280 × 22 px (scale 0.22 width, min 220) | green to red gradient, white numeric "1,240 / 1,600" in 14 px bold, damage drains in 0.3 s with a white "ghost" bar behind |
| Stamina or posture bar | under the health bar | 280 × 10 px | yellow; flashes red at <20%; for posture, fills from empty and turns red when nearly broken |
| Level and XP | under the bars | level badge 36 px, XP bar 280 × 6 px | XP bar pulses on gain |
| Quest tracker | top-right, under the Roblox menu buttons | 260 px wide, up to 3 quests | "Defeat Bandits 3/5" with a distance in studs; tap to set the waypoint |
| Boss bar | top-center, 18% from top | 40% of screen width, 18 px tall | boss name and title above in 20 px, phase notches at 66% and 33%, appears within 120 studs |
| Ability hotbar (PC) | bottom-center | 4-6 slots, 64 × 64 px, 8 px gaps | key label (1-4 or Z/X/C/V) in the corner; cooldown as a radial sweep plus seconds left |
| Damage numbers | world space (BillboardGui) | 28 px normal, 40 px crit | white normal, orange crit, red incoming, green heal; rise 3 studs and fade over 0.7 s |
| Lock-on marker | on the target | 48 px ring | toggled with middle mouse / a mobile button |

### Mobile layout

- **Attack button:** 120-130 px circle, bottom-right, 40 px from the right edge and 40 px from the bottom.
- **Ability buttons:** 4 buttons of 72-80 px on an arc around the attack button, with cooldown sweeps inside each.
- **Dodge:** 72 px, left of the arc. **Block:** 72 px, above the arc, hold to block.
- **No combat button within 140 px of the left-thumb joystick area.**
- Roblox's ContextActionService can create touch buttons with `BindAction`, but the reference says it's usually better to build your own ImageButtons and TextButtons for control over position and look [12][13]. Build custom buttons and route them into the same input handler as keys.

### Must-have screens

1. **Stats:** 4 stats with +1 / +5 / +10 buttons, current values and a preview of the next point's effect.
2. **Inventory and equipment:** grid of 5 columns, rarity frames, compare tooltip (green and red arrows on each stat).
3. **Moves:** unlocked moves with a looping preview, drag to slot. Locked moves show the level and the teacher's location.
4. **Quest log:** active, available and completed, with waypoint buttons.
5. **Map and fast travel:** zones by level band, boss icons with live timers.
6. **Boss info:** level, drop table with odds, your pity count, your best time.
7. **Party:** invite nearby, invite friends, see party HP.
8. **Settings:** damage numbers on/off, camera shake 0-100%, auto lock-on, music and SFX volume, reduced flashes.

## 8. World and look

Scenic owns this. See [[06 World and Look]] and [[07 Characters, VFX and Assets]].

17. **Zones are islands or regions by level band, each 300-600 studs across with one landmark visible from 500 studs.** Players navigate by landmarks. Level bands: 1-15, 15-30, 30-50, 50-75, 75-100. Each zone has a quest hub, 4-6 enemy camps, one elite spot and one boss arena. *Done right:* "go to the volcano." *Done wrong:* five identical grassy islands.

18. **Enemy camps hold 3-5 enemies, sit 60-100 studs apart, and respawn 8-15 s after the last one dies.** Camps should never sit empty while a player waits, and never be so close that one pull aggros two camps. Put a leash of 60 studs from the camp center: past it, enemies return and fully heal.

19. **Boss arenas are flat circles 80-140 studs across with a ring wall, two exits and nothing to hide behind.** Clutter breaks dodging and camera. Use a distinct floor material, a ring of torches or crystals, and spawn the boss in the center facing the main entrance.

20. **Enemy tiers read from silhouette and outline.** Trash enemies at 1× scale with muted colors. Elites at 1.2× with a gold `Highlight` outline (`FillTransparency = 1`, `OutlineColor = (255, 200, 60)`). Bosses at 2-3× scale with a unique silhouette and their own color. A kid should know which enemy is dangerous from 50 studs away.

21. **Telegraph colors are fixed game-wide.** Red ground decals for area attacks (Transparency 0.4, filling from center over the windup), orange body glow for windups, white flash for unparryable or unblockable moves. Never use red for decoration in boss arenas.

22. **Performance budget for a mobile combat zone: under 25,000 parts streamed in at once, under 40 active enemies per server, and VFX that clean up within 2 s.** Combat stutters kill feel. Turn on `Workspace.StreamingEnabled`, pool damage-number BillboardGuis, cap ParticleEmitter `Rate` at 50 for repeating effects, and use `Emit(n)` for bursts. See [[13 Building It Right]].

## 9. Retention and social

23. **Bosses are shared, and everyone who helps gets loot.** Any player who deals at least 3% of a boss's HP or heals a player fighting it gets their own drop roll. Never "last hit takes all": it makes players fight each other instead of the boss. Show "You contributed 14%" on the loot popup.

24. **Parties of up to 4 (6 for raids) share XP within 100 studs.** Each member gets 80% of a kill's XP when grouped (total 320% for 4), so grouping always beats solo. The party HP list sits under the player's own bars.

25. **Raid bosses spawn on a schedule or from a group goal, and the next spawn is always visible.** Blox Fruits uses summon items, long respawns, and a group kill-count trigger (300 enemies for the Tyrant of the Skies) [27]. Show "Raid Boss in 12:40" on the HUD and map, and send an in-game alert to everyone on the server at 60 s.

26. **Three dailies, one weekly, and a 7-day login track.** Dailies are "defeat 30 enemies", "beat a zone boss" and "use 20 abilities". The weekly is "beat the raid boss once". See [[10 Retention and Social]].

27. **Titles and badges mark every first boss kill.** Award a badge (`BadgeService:AwardBadge`) and a title the player can display above their name ("Bandit Slayer").

28. **PvP is opt-in in a PvE game.** Use a toggle at the hub or a PvP zone with a visible border. Never let a level-90 kill a level-5 in the starter zone. A bounty for PvP kills is fine inside PvP areas.

29. **Clans or crews come after the first month.** Clan bosses, clan banners and a weekly clan leaderboard. Don't ship them at launch: you need enough players to fill them.

## 10. Live ops and update cadence

30. **Ship something fightable every week, a zone pack every 3-4 weeks, and a region every 8-12 weeks.** RoWatcher's 2026 comparison credits weekly updates as one reason a rival anime RPG gained on Blox Fruits, whose major updates come every 2-3 months [29]. The weekly drop is small: a new boss variant, a weapon, a quest chain or a balance pass. See [[12 Live Ops and Launch]].

| Cadence | Content | Effort (agent-days, target) |
|---|---|---|
| Weekly | 1 boss variant or 1 weapon or 1 quest chain, balance notes, 1 code | 2-3 |
| Every 3-4 weeks | zone pack: 4 enemy types, 1 elite, 1 boss, 2 weapons, 6 quests | 8-12 |
| Every 8-12 weeks | new region or sea: 3 zones, raid boss, new move family, level cap +25 | 25-40 |
| Seasonal | holiday boss with a cosmetic drop, 7-14 days | 4-6 |

31. **Every update has a boss in the thumbnail.** Bosses are the most clickable content in this genre. Splash renders the new boss in the update thumbnail, and the update log names it. See [[11 Thumbnails, Icons and the Store Page]].

32. **Balance patches come with notes in plain words.** "Rising Slash damage 120 → 105 because it was used in 70% of boss kills." Players accept nerfs they understand. Liveops logs move usage per boss kill to find outliers.

33. **Events double what players already do.** Double XP weekend, double boss drops for 48 hours, boss rush (all zone bosses spawn every 5 minutes for an hour). They cost almost nothing to build and bring lapsed players back.

## 11. Building it in Studio

Architect writes the contracts. Builder writes the services. Frame builds the HUD. Read [[13 Building It Right]] and [[14 Roblox Studio Workflow]] first.

### Systems list

| # | System | Side | Owner | What it does |
|---|---|---|---|---|
| 1 | CombatService | server | Builder | validates move requests, runs hitboxes, applies damage, stun, knockback |
| 2 | MoveConfig | shared | Builder, Balance | every move's numbers (windup, hitTime, range, damage, cooldown, cost) |
| 3 | StaminaService | server | Builder | block, dodge and parry costs and regen |
| 4 | EnemyService | server | Builder | spawning camps, AI states, leashing, respawn |
| 5 | BossService | server | Builder | phases, timers, contribution tracking, loot rolls |
| 6 | LootService | server | Builder | drop tables, pity, rarity rolls |
| 7 | ProgressionService | server | Builder | XP, levels, stat points, resets |
| 8 | QuestService | server | Builder | quest state, objectives, rewards |
| 9 | PartyService | server | Builder | invites, shared XP, party list replication |
| 10 | PlayerData | server | Builder | load, save, session lock, schema migrations |
| 11 | InputController | client | Builder | keys and touch buttons to move requests, combo buffer |
| 12 | CombatFxController | client | Builder, Librarian | animations, hitstop, flashes, numbers, shake |
| 13 | HudController | client | Frame | bars, hotbar, boss bar, tracker |
| 14 | ReceiptService | server | Merchant | developer product grants |
| 15 | Analytics | server | Liveops | move usage, boss attempts, deaths, quit points |

### Folder layout

```
ReplicatedStorage/
  Shared/
    Config/ Moves, Enemies, Bosses, Loot, Levels, Quests (ModuleScripts)
    Types (ModuleScript)
  Remotes/ UseMove, Block, Dodge, AllocateStat, EquipWeapon, AcceptQuest, PartyInvite (RemoteEvent)
           CombatFx (UnreliableRemoteEvent), BossState (RemoteEvent)
  Assets/Animations, Assets/VFX, Assets/Sounds        (Librarian)
ServerScriptService/
  Main (Script)
  Services/ CombatService, StaminaService, EnemyService, BossService, LootService,
            ProgressionService, QuestService, PartyService, PlayerData, ReceiptService, Analytics
ServerStorage/
  Enemies/ (enemy models with Humanoid, Animator, HumanoidRootPart)
StarterPlayer/StarterPlayerScripts/
  Main (LocalScript)
  Controllers/ InputController, CombatFxController, HudController
Workspace/
  Map/ Zones/Zone1/{Hub, Camps, BossArena}     (Scenic)
  Enemies/ (runtime only)
```

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| UseMove | RemoteEvent | C→S | moveId: string | move exists, unlocked, equipped, off cooldown, alive, not stunned, enough stamina | 12, 6 |
| Block | RemoteEvent | C→S | holding: boolean | type check, alive, not stunned, stamina > 0 | 8, 4 |
| Dodge | RemoteEvent | C→S | dir: Vector3 | unit length ±0.05, cooldown 1.0 s, stamina ≥ 20 | 3, 1 |
| AllocateStat | RemoteEvent | C→S | stat: string, n: number | valid stat name, integer 1-100, n ≤ free points | 5, 2 |
| EquipWeapon | RemoteEvent | C→S | uid: string | uid in inventory | 5, 2 |
| AcceptQuest | RemoteEvent | C→S | questId: string | exists, prerequisites, within 15 studs of the giver | 3, 1 |
| PartyInvite | RemoteEvent | C→S | target: Player | in server, not already in a full party | 3, 0.5 |
| CombatFx | UnreliableRemoteEvent | S→C | kind, position, amount | none (cosmetic) | n/a |
| BossState | RemoteEvent | S→C | bossId, phase, hpFraction, timer | none | n/a |

Use the UnreliableRemoteEvent only for cosmetic, frequently changing data; the class docs describe it as a channel for data that's continuously changing or not critical to game state [15][54]. Everything that changes the save goes on a RemoteEvent.

### Hit detection: the studio standard

34. **The server decides every hit. The client only sends "I used move X".** DevForum threads and a secure-combat guide agree: send minimal input, compute hits and damage on the server, and never accept client-reported hit positions or damage values [24][23]. Some threads recommend client-side detection for low-ping feel, with server sanity checks such as distance between players [18][19], and the community debate on where hitboxes belong is long-running [17][22]. Roblox's own laser tag sample follows the same split: the client packages what it did and the server decides who was hit [56]. Our default for PvE is a server hitbox. For PvP, add server-side rewind (lag compensation) as described in a DevForum rollback design [20], and see [[Genre - Battlegrounds]].

35. **Hitboxes are spatial queries at the move's hit time, not `Touched` events.** `Touched` depends on physics and on who owns the part. Roblox's docs note that a client can fire Touched on a part it owns that the server never saw happen [6]. Use `workspace:GetPartBoundsInBox(cframe, size, overlapParams)` for melee boxes, `GetPartBoundsInRadius` for slams, and `Blockcast`/`Spherecast` for fast lunges and projectiles [2][3]. The old `FindPartsInRegion3` family is deprecated [2]. Community modules like Raycast Hitbox V4 instead cast rays from attachments on the weapon each frame, which suits long swords with wide arcs [16].

36. **Hit timing comes from the animation's marker, copied into Config.** The animator adds a `Hit` event marker in the Animation Editor; the client reads it with `GetMarkerReachedSignal` for effects [4][5]. A forum reply recommends timing the hitbox from animation events for the same reason [21]. The server doesn't watch a player's animation; it uses `move.hitTime` from Config, which the animator sets to the marker's time. For NPCs, whose animations the server plays, the server can listen to the marker directly.

37. **NPC enemies are server-owned.** Call `SetNetworkOwner(nil)` on the enemy's root part after it's parented into Workspace, so no client simulates it. Roblox can't verify physics a client owns [6]. One DevForum thread reports ownership changing after a model was rescaled, so set ownership after any scaling [55].

38. **Damage goes through `Humanoid:TakeDamage`, not `Health = Health - x`.** `TakeDamage` respects ForceFields (spawn protection) and direct Health writes don't [7].

39. **Enemies don't collide with each other.** Put enemy parts in an `Enemies` collision group that doesn't collide with itself, so camps don't jam in doorways. Register groups in Studio at edit time where possible; the docs warn that registration at runtime has a cost and cap the engine at 32 groups [11].

### Data schema

```lua
--!strict
export type WeaponItem = { id: string, rarity: string, upgrade: number }

export type PlayerData = {
	version: number,               -- schema version for migrations
	level: number,
	xp: number,
	freePoints: number,
	stats: { melee: number, weapon: number, power: number, vitality: number },
	gold: number,
	gems: number,
	weapons: { [string]: WeaponItem }, -- keyed by a unique id (HttpService:GenerateGUID(false))
	equipped: { weapon: string?, moves: { string } }, -- up to 4 move ids
	unlockedMoves: { [string]: boolean },
	quests: { active: { [string]: number }, done: { [string]: boolean } },
	bossKills: { [string]: number },
	pity: { [string]: number },    -- per boss id
	dailies: { day: number, progress: { [string]: number }, claimed: { [string]: boolean } },
	settings: { damageNumbers: boolean, shake: number, autoLock: boolean },
	firstJoin: number,
	lastLogin: number,
	streak: number,
}
```

### Move config

```lua
--!strict
-- ReplicatedStorage.Shared.Config.Moves
export type Move = {
	id: string,
	windup: number,     -- seconds before the hit
	hitTime: number,    -- seconds from start to the hitbox query (matches the "Hit" marker)
	recovery: number,   -- seconds after the hit before another move
	cooldown: number,
	staminaCost: number,
	range: number,      -- studs forward
	width: number,
	height: number,
	damageMult: number,
	knockback: number,  -- studs per second
	stun: number,       -- seconds
	animationId: string,
}

local Moves: { [string]: Move } = {
	M1_1 = { id = "M1_1", windup = 0.15, hitTime = 0.18, recovery = 0.22, cooldown = 0.35, staminaCost = 0,
		range = 7, width = 6, height = 6, damageMult = 1.0, knockback = 0, stun = 0.25, animationId = "rbxassetid://0" },
	M1_4 = { id = "M1_4", windup = 0.25, hitTime = 0.3, recovery = 0.5, cooldown = 0.8, staminaCost = 0,
		range = 8, width = 7, height = 6, damageMult = 1.8, knockback = 45, stun = 0.6, animationId = "rbxassetid://0" },
	RisingSlash = { id = "RisingSlash", windup = 0.3, hitTime = 0.35, recovery = 0.4, cooldown = 6, staminaCost = 15,
		range = 10, width = 8, height = 10, damageMult = 3.0, knockback = 30, stun = 0.8, animationId = "rbxassetid://0" },
}

return Moves
```

Replace each `rbxassetid://0` with the real animation id Librarian registers. Never ship a zero id.

### Server: validate the request, then query the hitbox

```lua
--!strict
-- ServerScriptService.Services.CombatService
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Moves = require(ReplicatedStorage.Shared.Config.Moves)
local Remotes = ReplicatedStorage.Remotes

local CombatService = {}

local lastUse: { [Player]: { [string]: number } } = {}
local busyUntil: { [Player]: number } = {}

local function humanoidFromPart(part: BasePart): Humanoid?
	local node: Instance? = part.Parent
	while node and node ~= workspace do
		if node:IsA("Model") then
			local hum = node:FindFirstChildOfClass("Humanoid")
			if hum then
				return hum
			end
		end
		node = node.Parent
	end
	return nil
end

function CombatService.queryBox(attacker: Model, move: Moves.Move): { Humanoid }
	local root = attacker:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root then
		return {}
	end
	local params = OverlapParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = { attacker }
	local boxCFrame = root.CFrame * CFrame.new(0, 0, -move.range / 2)
	local parts = workspace:GetPartBoundsInBox(boxCFrame, Vector3.new(move.width, move.height, move.range), params)
	local seen: { [Humanoid]: boolean } = {}
	local hits: { Humanoid } = {}
	for _, part in parts do
		local hum = humanoidFromPart(part)
		if hum and not seen[hum] and hum.Health > 0 then
			seen[hum] = true
			table.insert(hits, hum)
		end
	end
	return hits
end

function CombatService.applyHit(attacker: Player?, target: Humanoid, amount: number, move: Moves.Move)
	if target.Health <= 0 then
		return
	end
	local model = target.Parent :: Model
	target:SetAttribute("LastHitBy", if attacker then attacker.UserId else 0)
	target:TakeDamage(amount) -- respects ForceField spawn protection
	if move.stun > 0 then
		model:SetAttribute("StunnedUntil", workspace:GetServerTimeNow() + move.stun)
	end
	local root = model:FindFirstChild("HumanoidRootPart") :: BasePart?
	if root then
		Remotes.CombatFx:FireAllClients("hit", root.Position, math.floor(amount))
	end
end

function CombatService.onUseMove(player: Player, moveId: unknown)
	if typeof(moveId) ~= "string" then
		return
	end
	local move = Moves[moveId]
	if not move then
		return
	end
	-- TODO: check the move is unlocked and equipped in PlayerData
	local character = player.Character
	local hum = character and character:FindFirstChildOfClass("Humanoid")
	if not character or not hum or hum.Health <= 0 then
		return
	end
	local now = workspace:GetServerTimeNow()
	if (character:GetAttribute("StunnedUntil") or 0) > now then
		return
	end
	if (busyUntil[player] or 0) > now then
		return
	end
	local uses = lastUse[player] or {}
	lastUse[player] = uses
	if now - (uses[moveId] or -math.huge) < move.cooldown then
		return
	end
	uses[moveId] = now
	busyUntil[player] = now + move.hitTime + move.recovery

	task.delay(move.hitTime, function()
		if hum.Health <= 0 or (character:GetAttribute("StunnedUntil") or 0) > workspace:GetServerTimeNow() then
			return -- interrupted during windup
		end
		for _, target in CombatService.queryBox(character, move) do
			local damage = 20 * move.damageMult -- replace with the section 5b formula
			CombatService.applyHit(player, target, damage, move)
		end
	end)
end

function CombatService.Start()
	Remotes.UseMove.OnServerEvent:Connect(CombatService.onUseMove)
	Players.PlayerRemoving:Connect(function(player)
		lastUse[player] = nil
		busyUntil[player] = nil
	end)
end

return CombatService
```

Notes for Builder:
- Put the RateLimit check from [[13 Building It Right]] in front of `onUseMove`.
- In a real build, send CombatFx only to players within 150 studs, not `FireAllClients`, to save bandwidth on full servers.
- Getting hit during windup cancels the move (the stun check inside `task.delay`). That's the core of "trading" in melee.

### Knockback that works on players and NPCs

```lua
--!strict
local function knockback(root: BasePart, direction: Vector3, speed: number, duration: number)
	local attachment = Instance.new("Attachment")
	attachment.Name = "KnockbackAttachment"
	attachment.Parent = root

	local velocity = Instance.new("LinearVelocity")
	velocity.Attachment0 = attachment
	velocity.VelocityConstraintMode = Enum.VelocityConstraintMode.Vector
	velocity.RelativeTo = Enum.ActuatorRelativeTo.World
	velocity.MaxForce = 1e5
	velocity.VectorVelocity = direction.Unit * speed + Vector3.new(0, speed * 0.3, 0)
	velocity.Parent = root -- parent last

	task.delay(duration, function()
		velocity:Destroy()
		attachment:Destroy()
	end)
end
```

Use 0.15-0.25 s durations. For stuns, use a `StunnedUntil` attribute plus a WalkSpeed drop rather than forcing Humanoid states: some Humanoid state changes on a player's character only take effect when made by that player's own client [8]. The LinearVelocity replicates, so it moves player characters (simulated by their owner) and server-owned NPCs alike. Avoid the old BodyVelocity, which is deprecated.

### Enemy AI: one loop for all enemies

```lua
--!strict
-- ServerScriptService.Services.EnemyService (excerpt)
local PathfindingService = game:GetService("PathfindingService")
local Players = game:GetService("Players")

type Enemy = { model: Model, hum: Humanoid, root: BasePart, home: Vector3, state: string, nextThink: number }

local enemies: { Enemy } = {}
local AGGRO = 40
local LEASH = 60
local ATTACK_RANGE = 6

local function nearestPlayer(position: Vector3): (Player?, number)
	local best: Player? = nil
	local bestDist = math.huge
	for _, player in Players:GetPlayers() do
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
		local hum = character and character:FindFirstChildOfClass("Humanoid")
		if root and hum and hum.Health > 0 then
			local d = (root.Position - position).Magnitude
			if d < bestDist then
				best, bestDist = player, d
			end
		end
	end
	return best, bestDist
end

local function think(enemy: Enemy, now: number)
	if enemy.hum.Health <= 0 then
		return
	end
	local fromHome = (enemy.root.Position - enemy.home).Magnitude
	if fromHome > LEASH then
		enemy.state = "Return"
	end
	if enemy.state == "Return" then
		enemy.hum:MoveTo(enemy.home)
		if fromHome < 4 then
			enemy.hum.Health = enemy.hum.MaxHealth
			enemy.state = "Idle"
		end
		return
	end
	local target, dist = nearestPlayer(enemy.root.Position)
	if not target or dist > AGGRO then
		enemy.state = "Idle"
		return
	end
	local targetRoot = (target.Character :: Model):FindFirstChild("HumanoidRootPart") :: BasePart
	if dist <= ATTACK_RANGE then
		enemy.state = "Attack"
		-- play the windup animation on the server-owned Animator, show the telegraph, then queryBox at hitTime
	else
		enemy.state = "Chase"
		enemy.hum:MoveTo(targetRoot.Position)
	end
end

local function step()
	local now = os.clock()
	for _, enemy in enemies do
		if now >= enemy.nextThink then
			enemy.nextThink = now + 0.2 -- 5 Hz is enough for melee mobs
			think(enemy, now)
		end
	end
end
```

- Run `step` from one `task.spawn` loop with `task.wait(0.1)`, not one loop per enemy.
- Direct `MoveTo` is enough in open zones. When a raycast from the enemy to the target hits a wall, switch to `PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = true })`, call `ComputeAsync` in a `pcall`, check `path.Status == Enum.PathStatus.Success`, walk the waypoints, and recompute on the path's `Blocked` event [9]. AgentRadius and AgentHeight default to 2 and 5 [9]; match them to the enemy's real size. A DevForum thread notes some newer agent parameters are poorly explained, so stick to the documented ones [10].
- Leashing (return and full heal past 60 studs) stops players from dragging mobs across the map.

### Boss phases

```lua
--!strict
local function watchPhases(boss: Humanoid, onPhase: (number) -> ())
	local phase = 1
	boss.HealthChanged:Connect(function(health)
		local fraction = health / boss.MaxHealth
		local newPhase = if fraction <= 0.33 then 3 elseif fraction <= 0.66 then 2 else 1
		if newPhase > phase then
			phase = newPhase
			onPhase(phase) -- roar for 1.5 s with a ForceField, add one attack to the rotation, change the aura color
		end
	end)
end
```

Track contribution in a table `damageBy[userId] += amount` inside `applyHit` when the target is a boss, and roll loot for everyone over 3% of max HP when it dies.

### Client: one input path for keys and touch

```lua
--!strict
-- StarterPlayerScripts.Controllers.InputController (excerpt)
local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UseMove = ReplicatedStorage.Remotes.UseMove
local comboIndex = 1
local lastPress = 0

local function attack()
	local now = os.clock()
	if now - lastPress > 0.8 then
		comboIndex = 1
	end
	lastPress = now
	local moveId = "M1_" .. comboIndex
	comboIndex = if comboIndex >= 4 then 1 else comboIndex + 1
	-- play the animation locally right away for feel; the server decides the hit
	UseMove:FireServer(moveId)
end

ContextActionService:BindAction("Attack", function(_, state)
	if state == Enum.UserInputState.Begin then
		attack()
	end
	return Enum.ContextActionResult.Pass
end, false, Enum.UserInputType.MouseButton1, Enum.KeyCode.ButtonR2)

-- Custom mobile ImageButtons (built by Frame) call attack() from their Activated event.
```

The combo index the client sends is a request. The server should track its own combo step and ignore an `M1_4` that arrives without the three before it inside the reset window.

## 12. Twists that work

40. **Pick one twist and make it the thumbnail.** A fresh take needs one idea a player can see in a single image. More than one twist muddies the pitch.

- **Weapon as a pet.** Your weapon levels up, evolves at levels 10/25/50 and changes shape. Combines the collection pull of [[Genre - RNG and Collection]] with combat.
- **Co-op bosses with role switches.** The boss marks one player as the "target" every 20 s; the others must protect them. Teaches the tank/healer/damage roles Dungeon Quest's parties are built around [37], without class locks.
- **Kaiju-scale bosses as levels.** The boss is 200 studs tall and players climb it to hit weak points. Turns a fight into an obby, which suits younger players ([[Genre - Obby]]).
- **Roguelite dungeon.** Each room offers 3 random upgrades; die and keep only meta-currency. Fresh runs every time from the same art.
- **Element combos.** Two players' abilities combine (fire + wind = firestorm). Rewards grouping and creates "try this with me" moments, building on the two-axis builds Arcane Odyssey uses (magic × style) [41].
- **Parry-first, kid-friendly.** A wide 0.3 s parry window, a slow-motion flash on success, and no punishment on whiff for the first 10 levels. Takes Combat Warriors' and Deepwoken's skill hook [31][34] to a younger audience.
- **Boss of the week.** One rotating boss with a weekly leaderboard for fastest party kill. Live ops in one system.
- **Tower climb.** 50 floors, each a short fight, checkpoints every 5. Clear progress and an easy update format (add 10 floors).
- **Companion NPC that learns.** A sidekick fights with you and unlocks moves as you do. Helps solo players and mobile players who struggle with combos.

## 13. Failure modes

41. **Mushy hits.** No hitstop, no sound, no number. Players say "combat feels bad" and leave in the first session. A 2026 analysis named "sluggish combat feel" among complaints about the genre's biggest game [29]. Fix: rule 3, then test on a phone.
42. **Client-trusted damage.** An exploiter sends "I hit everyone for 999,999". Fix: rules 34-38.
43. **Health sponges.** Enemies take 20+ seconds each. Fix: set HP from TTK (section 5b).
44. **Unreadable bosses.** Instant attacks with no telegraph. Fix: rule 4 and a 0.4 s minimum windup.
45. **Dead zones.** A new zone with no players because everyone is at the cap. Fix: dailies that send players to every zone and boss drops that stay useful.
46. **Grief PvP.** High levels farm new players. Fix: rule 28.
47. **One build to rule them all.** Everyone uses the same move, as tier lists converge [40]. Fix: usage tracking and fast balance patches (rule 32).
48. **Update drought.** Nothing new for two months while a rival ships weekly [29]. Fix: section 10.
49. **Pay-to-win perception.** Paid power in PvP. Fix: section 6 off-limits list.
50. **Lag spikes in fights.** Too many enemies or particles. Fix: rule 22 and the single AI loop.
51. **Phone controls that hide the action.** Buttons over the enemy, or a camera that spins on touch. Fix: section 7 mobile layout and a lock-on button.
52. **Loot that doesn't matter.** Drops that are always worse than what you have. Fix: drop tables that scale to the zone and a salvage system for currency.

## 14. Pitch checklist: is this genre right for us right now?

Pulse and Lead answer each with yes or no. Fewer than 9 yes answers means pick another genre or a hybrid.

1. Can we make one hit feel great in the first build week (animation, sound, VFX)? Librarian has or can make the animations?
2. Do we have a hook a player can see in a thumbnail: a boss, a power or a transformation?
3. Is there a clear "steal the pattern" reference doing well right now, and are we not copying its characters or names?
4. Can the first boss be playable by the end of the build stage?
5. Do we have at least 3 zones of content planned before launch, and a plan for weekly drops after (section 10)?
6. Can the game run 30 enemies and 12 players on a mid-range phone without stutter?
7. Is the combat server-authoritative in the plan, with every remote in the contract table?
8. Is PvP either absent or opt-in?
9. Does every paid item have a free path, and is there no paid PvP power?
10. Can a 10-year-old beat the first elite in under 2 attempts (Kid Tester)?
11. Is the theme clear in 2 words (e.g. "pirate powers", "samurai dungeons")?
12. Is the session long enough to earn (30+ minutes) without a forced stop?
13. Does Balance's simulation show level 10 in 12-16 minutes and a new move every 5-8 minutes early?

## Checklist

Producer verifies each item in Studio or a test server.

- [ ] First hit lands within 10 s of spawn on a fresh account.
- [ ] Every hit plays animation, sound, flash, damage number; heavy hits add 40-80 ms hitstop (client only).
- [ ] The basic chain is 3-4 hits; the finisher does 1.5-2× damage and knocks back.
- [ ] Every enemy attack has a windup of at least 0.4 s and a second cue (sound or decal).
- [ ] Telegraph colors match the game-wide spec (red AoE, orange windup, white unparryable).
- [ ] Trash TTK 2-4 s, elite 8-15 s, zone boss 45-90 s solo at the recommended level (stopwatch test).
- [ ] Level 2 arrives by 60 s, level 3 by 3 minutes, and the first ability unlocks at level 3.
- [ ] The first weapon drop is guaranteed before minute 5.
- [ ] No menu or popup opens in the first 60 s.
- [ ] Blocking drains stamina or posture; holding block forever is impossible.
- [ ] Bosses have phase changes at 66% and 33% with a 1-2 s roar.
- [ ] Every contributor over 3% of boss HP gets a loot roll.
- [ ] The boss drop table with odds and pity count is visible in game.
- [ ] Death respawns in 3-5 s near the zone checkpoint and keeps XP and items.
- [ ] Every remote in the contract table exists, and no other remotes exist.
- [ ] UseMove rejects unknown ids, cooldown spam and requests while stunned (test with a spam script in Studio).
- [ ] Damage is applied only by the server through `Humanoid:TakeDamage`.
- [ ] No hit detection uses `Touched`.
- [ ] Enemy root parts are server-owned (check in Studio's network ownership visualization).
- [ ] Enemies leash at 60 studs and fully heal on return.
- [ ] Enemies don't collide with each other (collision group set).
- [ ] Mobile: attack button 120+ px, ability buttons 72+ px, nothing under the left thumb area.
- [ ] Settings include damage numbers, camera shake and reduced flashes.
- [ ] 12 players and 30 enemies run at 30+ FPS on the test phone.
- [ ] PvP is off by default or limited to a marked zone.
- [ ] No paid item adds PvP combat power; paid random items check PolicyService.
- [ ] Save schema has a version number and loads old saves.

## Common mistakes

1. Using `Touched` for sword hits. It misses fast swings, double-fires, and can be faked by the part's owner [6].
2. Trusting a `damage` argument from the client [24].
3. Writing `Humanoid.Health -= x`, which skips ForceField protection [7].
4. Running one `while true` AI loop per enemy instead of one loop for all.
5. Slowing the server for hitstop. Hitstop is a client effect only.
6. Leaving NPCs network-owned by nearby clients, so exploiters can teleport them [6].
7. Bosses that just have more HP each phase.
8. Telegraphs that are only a subtle pose, with no sound or decal [49].
9. Making blocking free, so fights stall.
10. Giving loot only to the last hitter.
11. Animations with placeholder ids shipped to production.
12. Spamming `FireAllClients` for every hit on a full server instead of nearby players only.
13. Damage numbers created and destroyed every hit instead of pooled.
14. Using deprecated `BodyVelocity` and `FindPartsInRegion3` in new code [2].
15. Using `wait()`, `spawn()` or `delay()` instead of the `task` library.
16. Shipping PvP stat passes and then wondering why reviews say pay-to-win.
17. Letting a level-90 player kill new players in the starter zone.
18. A first boss that needs a party when most new players are solo.
19. No leash, so players drag a boss to the spawn.
20. Hitbox sizes that don't match the animation, so swings visibly miss but hit, or hit but miss.

## References

[1] Raycasting (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/raycasting — `WorldRoot:Raycast` basics and computing a direction from origin and destination.
[2] WorldRoot class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/WorldRoot — `GetPartBoundsInBox`, `GetPartBoundsInRadius`, `GetPartsInPart`, OverlapParams defaults, deprecated `FindPartsInRegion3`.
[3] Introducing Shapecasts (DevForum announcement) — https://devforum.roblox.com/t/introducing-shapecasts/2320655 — Blockcast and Spherecast for fast projectiles, area damage and swept volumes.
[4] Animation events (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/animation/events — adding event markers and listening with `GetMarkerReachedSignal`.
[5] KeyframeMarker class reference — https://create.roblox.com/docs/reference/engine/classes/KeyframeMarker — markers fire per keyframe; duplicate names fire for every marker.
[6] Network ownership (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/physics/network-ownership — server can't verify client-owned physics; owners can fire Touched the server never saw.
[7] ForceField class reference — https://create.roblox.com/docs/reference/engine/classes/ForceField.md — ForceField blocks `TakeDamage` but not direct Health writes; spawn ForceFields.
[8] HumanoidStateType enum reference — https://create.roblox.com/docs/reference/engine/enums/HumanoidStateType — Humanoid states, GetState/ChangeState, owner-only state changes.
[9] PathfindingService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PathfindingService.md — CreatePath agent parameters and defaults, ComputeAsync, Blocked, deprecated methods.
[10] Pathfinding agents (DevForum) — https://devforum.roblox.com/t/pathfinding-agents/851842 — community notes that some agent parameters are poorly documented.
[11] PhysicsService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md — RegisterCollisionGroup, server-only changes, register at edit time, 32-group cap.
[12] ContextActionService class reference — https://create.roblox.com/docs/reference/engine/classes/ContextActionService — BindAction touch buttons and the advice to build custom buttons.
[13] Mobile input (Roblox Creator Documentation) — https://create.roblox.com/docs/input/mobile — adding mobile buttons with `BindAction` and `createTouchButton`.
[14] Proximity prompts (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/ui/proximity-prompts — HoldDuration and prompt events for NPC talk and interactions.
[15] UnreliableRemoteEvent class reference — https://create.roblox.com/docs/ja-jp/reference/engine/classes/UnreliableRemoteEvent — one-way channel for continuously changing or non-critical data.
[16] Raycast Hitbox V4 (DevForum resource) — https://devforum.roblox.com/t/374482 — rays cast from weapon attachments each frame as a melee hitbox method.
[17] Is this a good way to do hitboxes in combat games? (DevForum) — https://devforum.roblox.com/t/is-this-a-good-way-to-do-hitboxes-in-combat-games/3001235 — community discussion of hitbox approaches.
[18] How would I go about doing client-sided hitboxes? (DevForum) — https://devforum.roblox.com/t/client-sided-hitboxes/3161806 — client detects, then remotes the server to apply damage.
[19] Combat system - hitboxes (DevForum) — https://devforum.roblox.com/t/combat-system-hitboxes/3312821 — server sanity checks such as distance between players.
[20] Combat System with Rollback (DevForum) — https://devforum.roblox.com/t/combat-system-with-rollback/3685525 — server-side rewind using a position buffer and estimated latency.
[21] How should I make hitboxes? (DevForum) — https://devforum.roblox.com/t/how-should-i-make-hitboxes/3182033 — timing hitbox creation from animation events.
[22] Fast Paced Combat (DevForum) — https://devforum.roblox.com/t/fast-paced-combat/2944831 — community discussion of responsiveness versus server authority.
[23] Should hitboxes be handled on the client or server in my PVP/PVE game? (DevForum) — https://devforum.roblox.com/t/should-hitboxes-be-handled-on-the-client-or-server-in-my-pvppve-game/3055838 — newer developers advised to keep hitboxes server-side; high-ping trade-off.
[24] How to make a secure combat framework (creation.dev) — https://www.creation.dev/learn/how-to-make-secure-combat-framework-roblox — minimal client input, server computes hits; never trust client positions or damage.
[25] Fighting Styles (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Fighting_Styles — styles as the core combat mechanism, taught by teachers, starting Combat style.
[26] Tips for Bosses (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Tips_for_Bosses — bosses needing Aura, Cake Queen strategy.
[27] Raid Bosses (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Raid_Bosses?so=search — summon items, long respawns, the 300-kill Tyrant of the Skies trigger.
[28] Blox Fruits hits 14 billion visits in four years (Pocket Tactics) — https://www.pockettactics.com/blox-fruits/14-billion — visit milestone report.
[29] Blox Fruits vs Sailor Piece (RoWatcher, 2026) — https://rowatcher.com/news/blox-fruits-vs-sailor-piece-which-anime-rpg-is-actually-growing-faster-in-2026 — update cadence comparison and player complaints.
[30] Anime Vanguards surpasses Blox Fruits to become top-earning Roblox game (Beebom) — https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/ — anime-themed demand across genres.
[31] Terminology (Deepwoken Wiki) — https://deepwoken.fandom.com/wiki/Terminology_(game) — posture, block break, parry and chip damage rules.
[32] Enforcer (Deepwoken Wiki) — https://deepwoken.fandom.com/wiki/Enforcer — attack answer tags (Parryable, Blockable, Dodgeable, Unparryable).
[33] Hollow Angel (Deepwoken Wiki) — https://deepwoken.fandom.com/wiki/Hollow_Angel — enemy with high posture resistance that forces parry trades.
[34] How to parry in Combat Warriors (Pro Game Guides) — https://progameguides.com/roblox/how-to-parry-in-combat-warriors-roblox/ — F to parry, camera lock, stamina cost, stun.
[35] How to parry in Roblox Combat Warriors (Gamer Journalist) — https://gamerjournalist.com/how-to-parry-in-roblox-combat-warriors/ — parry shield lasting about one second.
[36] Combat Warriors tips and tricks (Stealthy Gaming) — https://stealthygaming.com/combat-warriors-tips-tricks/ — whiffed parry penalty and stun follow-ups (fan guide).
[37] Dungeon Quest: A Definitive Guide (Sportskeeda) — https://sportskeeda.com/roblox-news/dungeon-quest-a-definitive-guide — abilities from dungeons, Legendary drops on high difficulty, party roles.
[38] Dungeons in Roblox Dungeon Quest (Sportskeeda) — https://www.sportskeeda.com/roblox-news/dungeon-quest-dungeon-types-enemies-and-more — per-dungeon level requirements and time limits.
[39] Dungeon Quest Reborn beginner's guide (All Things How) — https://allthings.how/dungeon-quest-reborn-beginner-s-guide-stats-dungeons-and-loot/ — loot granted on dungeon completion.
[40] Arcane Odyssey best fighting style tier list (Pro Game Guides) — https://progameguides.com/roblox/arcane-odyssey-best-fighting-style-tier-list-roblox/ — style rankings by damage and abilities.
[41] Roblox Arcane Odyssey starter guide (KeenGamer) — https://www.keengamer.com/articles/guides/roblox-arcane-odyssey-starter-guide/ — magic and fighting styles, mentors.
[42] Devil Fruits category (Grand Piece Online Wiki) — https://grand-piece-online.fandom.com/wiki/Category:Devil_Fruits — fruit sources and drop chances.
[43] Grand Piece: Fighting Style guide (Sportskeeda) — https://sportskeeda.com/roblox-news/grand-piece-fighting-style-guide — 13 fighting styles with unlock requirements.
[44] Type Soul: Stats Guide (Sportskeeda) — https://sportskeeda.com/roblox-news/type-soul-stats-guide — stat paths.
[45] Type Soul tier list (Pocket Tactics) — https://www.pockettactics.com/type-soul/tier-list — race rankings depend on meta.
[46] World // Zero: All Classes, Class skills, and Class Tiers (Sportskeeda) — https://sportskeeda.com/roblox-news/world-zero-all-classes-class-skills-class-tiers — class roles and unlock paths.
[47] World Zero classes guide and tier list (Destructoid) — https://www.destructoid.com/world-zero-classes-guide-tier-list/ — class strengths and support roles.
[48] Enemy attacks and telegraphing (Game Developer) — https://gamedeveloper.com/design/enemy-attacks-and-telegraphing — combining animation and audio cues before attacks.
[49] Crafting Legendary Boss Battles (Wayline) — https://www.wayline.io/blog/crafting-legendary-boss-battles — multi-channel telegraphs and consistent signals.
[50] Game Feel and Juice, lesson 2 (Wayline) — https://www.wayline.io/learn/game-feel/1 — 50-100 ms hitstop on heavy hits; small camera shake.
[51] Hitstop is returning to Monster Hunter Wilds after beta feedback (Destructoid) — https://www.destructoid.com/after-beta-feedback-hitstop-is-returning-to-monster-hunter-wilds/ — player reaction to missing hitstop.
[52] Fixing "my attacks don't feel like they hit" (uhiyama-lab) — https://uhiyama-lab.com/en/notes/unity/unity-game-feel-hit-feedback/ — the feedback stack and the stuck-slowdown pitfall.
[53] Blox Fruits fighting styles (Pocket Gamer) — https://www.pocketgamer.com/roblox/blox-fruits-fighting-styles — style roles for grinding versus raw strength (opinion).
[54] UnreliableRemoteEvent:FireAllClients() still attempts invocations on non-connected clients (DevForum) — https://devforum.roblox.com/t/unreliableremoteeventfireallclients-still-attempts-invocations-on-non-connected-clients-contrary-to-docs/3852670 — staff clarified UnreliableRemoteEvent docs.
[55] NPC Network Ownership failing for no apparent reason? (DevForum) — https://devforum.roblox.com/t/npc-network-ownership-failing-for-no-apparent-reason/3862224 — ownership changing after a model was rescaled.
[56] Implement blaster behavior (Roblox Creator Documentation) — https://create.roblox.com/docs/tutorials/curriculums/gameplay-scripting/implement-blasters — Roblox's own sample: client sends action data, server decides hits.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Battlegrounds]] · [[Genre - Shooter]] · [[Genre - Survival]] · [[Genre - Simulator]] · [[Genre - RNG and Collection]]
