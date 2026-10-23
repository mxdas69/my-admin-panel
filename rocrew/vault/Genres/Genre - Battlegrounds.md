---
tags: [vault, genre, battlegrounds, fighting, anime, pvp, movesets, combos, ragdoll, netcode, hitboxes]
for: [lead, pulse, architect, builder, balance, playtest]
also: [frame, librarian, scenic, reviewer, merchant, liveops, kid-tester, producer]
---

# Genre - Battlegrounds

A battlegrounds game drops a full server of players into one arena, hands each of them a character with a fixed moveset, and lets them fight everyone at once. You pick a fighter, spam M1s, land a combo, dash out of someone else's, charge your ultimate, and do it again. The genre took its shape from anime-inspired fighting games on Roblox: free-for-all brawls with four signature moves per character, an ultimate or "awakening", ragdoll knockdowns, and kill streaks. This page covers movesets and combos, block, dash and counter, ragdoll, character balancing, and the netcode and hit detection that make or break all of it. Long-form RPG combat with levels and bosses is on [[Genre - Action and Combat]]; guns are on [[Genre - Shooter]].

Battlegrounds success depends on feel and fairness. There's no long progression to hide behind. A player judges the game within the first 30 seconds of combat: do my hits connect when they look like they connect, can I escape a combat chain, and did that death feel earned? If hits whiff on the attacker's screen but land on the server (or the reverse), players call it "laggy" and leave. If one character or one combo wins everything, the server fills with clones and the game dies of boredom. Most of the rules here are about frame data, hit validation and balance.

Read this page before pitching any PvP-first fighting game, before Architect writes the combat contracts, and before Balance builds the frame data sheet. Builder reads section 11 before writing a hitbox. Playtest uses the checklist with two clients and network simulation turned on. Numbers marked as targets are this studio's rules, not measurements of other games.

**Source note.** The search budget ran out partway through research for this page. The entries for The Strongest Battlegrounds, Jujutsu Shenanigans, Heroes Battlegrounds and Untitled Boxing Game are described from general knowledge, not from a source found in this pass. They are marked *(unverified)* and have no citation. Don't quote details from them until a later pass adds sources. All other cited claims come from search results listed in References.

## 1. What it is and why it works on Roblox

### The shape

| Part | What it is | Studio target |
|---|---|---|
| Server | one shared arena, free-for-all, drop in any time | 12-16 players per server |
| Character | a fixed kit: M1 chain, 4 moves, an ultimate, a passive | 2-4 characters free at launch, 6-8 by month 2 |
| Fight | 10-40 s exchanges, constant third-party interruptions | average time between kills per player 45-90 s |
| Death | ragdoll, killfeed, respawn | respawn in 3-5 s with a 2 s spawn ForceField |
| Progress | kills unlock characters, emotes and titles | first new character unlockable in 1-2 sessions |

### Variants

- **Free-for-all battleground.** The classic: one map, everyone fights everyone, characters with anime-inspired kits. *(The Strongest Battlegrounds, Jujutsu Shenanigans, Heroes Battlegrounds — unverified.)*
- **Weapon melee arena.** Weapons instead of characters, parry as the core skill. Combat Warriors is the reference [24][25].
- **Ring and duel fighter.** 1v1 queues in rings with styles. *(Untitled Boxing Game — unverified.)*
- **Battle royale mode inside an RPG.** Grand Piece Online runs a battle royale where fruit and stat choices matter; guides call out Hie Hie's stuns as strong in PvP and battle royale [39] and suggest new PvP players build Strength before entering [40].
- **Parry-and-posture PvP.** Hardcore exchanges with posture breaks. Deepwoken is the reference [28].

### The audience

- **The core player is 10-16, knows anime, and wants to feel strong immediately.** There's no grind wall before the fun: the fun is the first fight.
- **Players watch and make videos.** Battlegrounds games spread through clips: a clean combo, a counter, an ultimate. Design moves that look good in a 10-second clip.
- **Anime demand is strong across genres.** Beebom reported that Anime Vanguards, an anime tower defense game, became a top-earning Roblox game within 10 days of its September 2024 launch [35]. Steal the framing (power fantasies, transformations, named techniques), never another studio's characters, names or art.

### Why players come back

1. **Mastery.** Combos, dash timing and counters reward practice. Every session the player is a little better.
2. **New characters.** A new kit is a new game. Each release brings lapsed players back.
3. **Status.** Kill counts, streaks, titles and rare emotes are visible to everyone on the server.
4. **Friends.** Fighting your friends, and teaming up against the server's best player, is the social core.
5. **Clips.** A finisher or an ultimate that looks amazing is a reason to come back and record it.

## 2. The core loop

**Loop statement:** "Pick a character → find a fight → land M1s and moves into a combo → defend with block, dash or counter → build ultimate meter → finish the opponent → earn kills and currency → unlock a character, emote or title → pick a new character and repeat."

**Variants:**
- **Duel queue:** "Queue → 1v1 in a ring, first to 3 rounds → rank points → cosmetics and titles."
- **King of the hill:** "Hold the center zone → points per second → the top player is marked for everyone."
- **Boss mode:** "The server's top killer becomes a buffed boss; everyone else teams up to take them down."

### The layers

| Layer | Length | What happens | Studio target |
|---|---|---|---|
| Frames | 0.05-0.4 s | startup, active, recovery of one move | M1 startup 0.10-0.15 s; nothing in the kit starts slower than 0.6 s except the ultimate |
| Combo | 1.5-4 s | M1 chain into moves | max combo 35% of HP before a forced knockdown |
| Exchange | 10-40 s | neutral, combo, escape, reset | 3-6 exchanges per kill |
| Life | 45-180 s | spawn to death | average life 90-150 s for new players |
| Session | 20-60 min | several characters, streaks, unlocks | ≥1 unlock or title per session in the first week |

### Loop rules

1. **The first fight starts within 20 s of spawning.** No lobby or tutorial before the first hit. Spawn new players 40-60 studs from the action with a free starter character and a 2 s ForceField. Offer the tutorial as an optional training area next to spawn, never as a gate. *Done right:* spawn, run 3 seconds, trade M1s. *Done wrong:* a 90-second forced tutorial.

2. **Every character has the same verbs: M1 chain, 4 moves, ultimate, block, front dash, side dash.** Shared verbs mean a player who learned one character can play all of them. Map moves to 1-4 on PC (or Z/X/C/V), the same 4 slots on mobile, ultimate to G or a meter button, block to F, dash to Q. *Done right:* switching characters changes what the moves do, not where they are. *Done wrong:* one character uses 7 keys.

3. **The M1 chain is 4 hits at 0.3-0.4 s each, and the 4th hit knocks back or ragdolls.** The chain is the neutral tool everyone shares, so it must be fast and must end. Damage per M1 is 3-5% of max HP, the finisher 5-7%. After the 4th hit, the attacker has 0.4-0.6 s of end lag. *Done right:* four quick hits, the enemy flies 10 studs. *Done wrong:* infinite M1 stunlock.

4. **Every hit gives instant feedback on the attacker's screen.** Players blame the netcode for what is really missing feedback. Play the hit sound and spark on the attacker's client the moment the client's hitbox finds a target (prediction), then confirm or quietly cancel the damage number when the server answers. Hitstop on heavy hits lasts 50-100 ms, client side only, per Wayline's game feel lesson [30]; a hit-feedback primer describes the full stack of hitstop, flash, particles, sound and shake [32]. Destructoid's report on Monster Hunter Wilds shows how strongly players react when hitstop is missing [31]. *Done right:* the punch sparks instantly. *Done wrong:* the spark arrives 150 ms later, when the server replies.

5. **Every combo has a guaranteed exit.** Being combo'd with no way out is the number one reason new players quit fighting games. Use a combo counter: after 6 hits or 35% HP in one combo, the next hit forces a knockdown with 0.5-0.8 s of invulnerability on getting up. Also give one escape tool (a break-out or "evasive") on a 20-30 s cooldown that cancels hitstun. *Done right:* a combo ends and the victim has a fair moment to act. *Done wrong:* a veteran juggles a new player from full HP to zero.

6. **Defense is a resource, not a wall.** Block reduces front-facing damage, drains a guard meter, and breaks when the meter empties. Deepwoken's posture works this way: blocks break when posture fills, stunning the defender [28]. Combat Warriors' parry costs stamina [24]. Target: block takes 80% off front hits, guard 100 points, each blocked hit drains 15-25, guard break stuns 1.0-1.5 s. *Done right:* holding block buys time, not safety. *Done wrong:* a perma-blocker who can't be opened.

7. **Each move has one job.** Starter, extender, gap closer, escape, counter, area denial, or finisher. A move that does three jobs is a balance problem. Write each move's job in the frame data sheet (section 5).

8. **Ultimates charge from fighting, not from time.** An ultimate that fills while you hide rewards hiding. Charge +1 meter per 1% HP of damage dealt, +0.5 per 1% taken, max 100. When full, the ultimate (or an awakened moveset) lasts 45-60 s. *Done right:* the server's most active fighter gets the ultimate first. *Done wrong:* everyone has their ultimate at the same time after 2 minutes.

9. **Every big move tells the target it's coming.** Readable startup is fairness. Game Developer's series on attack telegraphing describes combining animation and audio before an attack lands [33], and Wayline stresses keeping those signals consistent [34]. Moves over 15% damage get at least 0.3 s of visible startup and a distinct sound; ultimates get a 0.5-0.8 s cinematic startup with invulnerability for the user. A Steam discussion makes a useful distinction between a charge-up that's visible early but unclear in timing and a telegraph that tells you the attack is landing now [44]; give big moves both. *Done right:* the screen tints as the ultimate starts and nearby players can dash away. *Done wrong:* a 40% instant grab.

10. **Third-party interruptions are part of the design.** In a free-for-all, someone will hit you mid-combo. Hitting a player who is attacking cancels their move (trade rules), and players in a combo take 20% less damage from other attackers, which stops "free kills" from piling on.

11. **Kill credit goes to the player who did the most damage in the last 10 s, with assists for anyone over 20%.** Otherwise kill stealing makes the killfeed feel unfair. Store a damage log per victim and resolve credit on death.

12. **New players get 3-5 lives' worth of help.** A 2 s spawn ForceField for everyone (blocked by `TakeDamage` respecting ForceFields [7]) plus, for accounts under 25 kills, a "Rookie" tag visible to others and 10% damage reduction. Veterans know to leave them alone or get nothing for the kill (half kill reward against rookies).

## 3. Top games in the genre

### The Strongest Battlegrounds: the genre template *(unverified)*
**Game:** The Strongest Battlegrounds *(no source this pass)*
**Shows:** A free-for-all arena where every player picks from a roster of characters inspired by a famous hero anime, under original names. Each character has an M1 chain, four moves and an ultimate mode, plus shared dash and block.
**Why it works:** Identical controls across characters, fast M1s and big readable ultimates make it easy to learn and clip-friendly.
**Steal:** The shared control scheme (M1, 1-4, ultimate, dash, block) and an ultimate that changes the moveset.
**Avoid:** Taking its character concepts. Design original fighters with their own silhouettes and names.

### Combat Warriors: parry as the skill ceiling
**Game:** Combat Warriors ([24], [25], [26], [27])
**Shows:** Guides describe holding F while facing the opponent to parry, with camera lock (left Ctrl) making parries easier; a successful parry stuns the attacker for a few seconds, and parrying uses stamina [24]. One guide describes a purple shield lasting about a second during which hits do no damage [25]. Another says a whiffed parry slows you sharply for roughly 1.5 s and stops you swinging [26], and that the kick only works on stunned targets [27]. These details come from fan guides; treat the numbers as approximate.
**Why it works:** One defensive button with a tight window, a big reward and a real punishment for whiffing creates mind games.
**Steal:** A parry or counter with a short active window, a cost, a stun reward and a whiff penalty. Follow-ups that only work on stunned targets.
**Avoid:** Making the parry window so wide that spamming it is the best play.

### Deepwoken: posture makes every block a choice
**Game:** Deepwoken ([28], [29])
**Shows:** Blocking and parrying run on posture; a full posture meter breaks the block and stuns. Light weapons are hard to parry but easy to block because they deal little posture damage, and parried attacks don't deal chip damage [28]. The wiki tags enemy moves as Parryable, Blockable, Dodgeable or Unparryable [29].
**Why it works:** Different attacks demand different answers, so knowing the kit matters as much as reaction speed.
**Steal:** A guard meter, plus "unblockable" and "unparryable" moves with a visual tag that never lies.
**Avoid:** Copying its hardcore penalties for a young free-for-all audience.

### Jujutsu Shenanigans: a timing skill on top of the kit *(unverified)*
**Game:** Jujutsu Shenanigans *(no source this pass)*
**Shows:** A battlegrounds game themed on a sorcery anime, known for a timed critical strike that rewards precise input.
**Why it works:** A timing check inside a normal attack gives skilled players a visible edge without adding buttons.
**Steal:** One "perfect timing" bonus (press again in a 0.1-0.15 s window for a critical hit with a special flash).
**Avoid:** Making the timing bonus required to compete. It should add 20-30% damage, not decide the fight.

### Heroes Battlegrounds: a hero-academy theme on the same verbs *(unverified)*
**Game:** Heroes Battlegrounds *(no source this pass)*
**Shows:** A battlegrounds game built on a superhero-school anime theme, with each character's kit based on a signature power.
**Why it works:** One clear power per character makes kits easy to remember and easy to pitch.
**Steal:** "One power, four expressions": each move is a different use of the same power.
**Avoid:** Licensed names and look-alike characters.

### Untitled Boxing Game: one theme, many styles *(unverified)*
**Game:** Untitled Boxing Game *(no source this pass)*
**Shows:** A boxing fighter where players use different fighting styles in ring matches.
**Why it works:** A narrow theme (boxing) with many style variants is cheap to expand and easy to understand.
**Steal:** Ring duels with a clear win condition beside the free-for-all.
**Avoid:** Random style rolls as the only way to get a style; pair any roll with an earnable path.

### Grand Piece Online: PvP and battle royale inside an RPG
**Game:** Grand Piece Online ([39], [40])
**Shows:** Fruit tier lists rank powers partly on PvP value; Dot Esports says Hie Hie's stuns are strong for PvP and battle royale [39]. A battle royale guide advises new PvP players to put four to five hundred points into Strength [40].
**Why it works:** A dedicated PvP mode gives an RPG's long progression a place to show off.
**Steal:** A scheduled PvP mode with its own rewards, where stun-heavy kits are watched closely in balance.
**Avoid:** Letting progression stats decide PvP. In a battlegrounds game, everyone fights with equal stats.

### Type Soul and Arcane Odyssey: tier lists as a balance warning
**Game:** Type Soul ([41]) and Arcane Odyssey ([42])
**Shows:** Pocket Tactics' Type Soul tier list ranks races and notes that rankings shift with the meta, techniques and weapons [41]. An Arcane Odyssey class tier list is split into PvE and PvP rankings [42].
**Why it works:** Players rank everything. A visible tier list shapes who plays what.
**Steal:** Publish your own patch notes before fan tier lists harden. Balance PvP separately from any PvE mode.
**Avoid:** Leaving an S-tier pick untouched for months.

### Blox Fruits: movesets as collectibles
**Game:** Blox Fruits ([37], [38])
**Shows:** Fighting styles are the core of combat, taught by NPC teachers, and players start with a basic Combat style [37]. Fan guides split styles by role, such as best for grinding versus strongest overall [38].
**Why it works:** Each style is a moveset players want to collect and master.
**Steal:** Unlockable characters or styles, each with a place or a teacher in the world.
**Avoid:** Making the starter kit useless. In battlegrounds, the free starter must be able to win.

## 4. The first five minutes

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0-8 s | Loading screen with the logo and one tip ("Q to dash") | Preload the starter character's 8 animations and the map's near area. Hard cap 8 s. |
| 8-12 s | Spawn on a raised platform at the map's edge, starter character equipped, 2 s ForceField | A big "FIGHT" banner for 1 s; arrows point to the training dummies (left) and the arena (ahead). |
| 12-30 s | Run in, meet the first player or a dummy, land M1s | Control hints on the HUD: "Click: Punch · 1-4: Moves · F: Block · Q: Dash". On mobile, the buttons pulse once. |
| 30-60 s | First move used (move 1 glows when it's useful, e.g. when an enemy is 15-30 studs away for a gap closer) | Show a one-line hint once: "Press 1: Dash Strike." |
| 60-120 s | First death or first kill | Death screen: who killed you, their character, and "Tip: Block with F, then dash out." Respawn 3-5 s. First kill: big killfeed entry, coins, sound. |
| 120-180 s | Ultimate meter half full; first combo (M1 ×4 → move 2) | Combo counter appears at 3+ hits: "3 HIT", "5 HIT!". |
| 180-240 s | Ultimate ready: the button glows and the character's aura shows | A one-time banner "ULTIMATE READY: press G". Everyone nearby sees the aura. |
| 240-300 s | Unlock progress shown: "Kills 2/15 to unlock: Storm Fist" | A progress bar in the corner and a short preview of the next character on hover. |

Opening rules:

13. **The starter character is fun and competitive, not a trial version.** A weak starter tells new players the game is pay-to-win. Balance the starter at the median of the roster.

14. **A death in the first five minutes ends with a tip, not a shop.** The death screen shows the killer's character, one specific tip (based on how you died: "You were hit during your M1 chain. Dash to escape"), and a 3-5 s respawn. Never show a Robux offer on death.

15. **Show the unlock path within 2 minutes.** Players need a reason to keep fighting after the first kill. Display the next unlock and its kill cost the first time they get a kill.

16. **Training dummies sit next to spawn.** Some players want to try moves without being punished. Six dummies: two stand still, two block, one counters, one walks. A dummy shows damage dealt per combo.

## 5. Progression and economy

Battlegrounds progression is horizontal: more options, not more power. Every number here is a target for Balance to simulate.

### Unlocks

| Unlock | Cost (target) | Notes |
|---|---|---|
| Character 2 | 15 kills | reachable in session 1 |
| Character 3 | 50 kills | session 2-3 |
| Characters 4+ | 150, 300, 600, 1,000 kills | or a Robux early unlock (section 6) |
| Emotes | 100-2,000 coins | coins: 10 per kill, 3 per assist, +5 per streak step |
| Titles | kill milestones (100, 500, 1,000, 5,000) | displayed above the head |
| Mastery per character | 25 / 100 / 250 / 500 kills with that character | cosmetic aura tiers |

### Frame data sheet (example character)

Balance keeps one row per move for every character in `economy.md`. HP is 100 for every character.

| Move | Job | Startup (s) | Active (s) | Recovery (s) | Damage | Hitstun (s) | Cooldown (s) | Notes |
|---|---|---|---|---|---|---|---|---|
| M1 1-3 | neutral | 0.12 | 0.08 | 0.15 | 3 each | 0.45 | — | chain resets after 0.8 s |
| M1 4 | finisher | 0.15 | 0.10 | 0.45 | 5 | knockback 12 studs | — | 0.5 s end lag |
| Dash Strike | gap closer | 0.20 | 0.15 | 0.35 | 8 | 0.6 | 8 | travels 25 studs |
| Uppercut | extender | 0.18 | 0.10 | 0.40 | 7 | launch 0.9 | 10 | target airborne; follow with M1 |
| Counter Stance | counter | 0.05 | 0.50 window | 0.50 | 10 on trigger | ragdoll 1.2 | 18 | whiff = 0.5 s vulnerable |
| Barrage | area denial | 0.30 | 1.20 | 0.40 | 1.5 × 8 | 0.25 per hit | 14 | front cone 60°, 10 studs |
| Ultimate | finisher | 0.60 (invulnerable) | — | — | 25 | ragdoll 2.0 | meter 100 | cinematic, can be dashed during startup |

### The power budget

Give every character 100 budget points and spend them across six axes. A character that goes over budget on one axis must pay elsewhere.

| Axis | 0 points | 20 points | 30 points |
|---|---|---|---|
| Burst (max combo damage) | 20% | 30% | 35% (cap) |
| Mobility (dashes, gap closers) | 1 gap closer | 2 | 3 |
| Range | all moves ≤ 10 studs | one move to 30 studs | one projectile to 60 studs |
| Defense tools | none | a counter | counter + armor move |
| Control (stuns, grabs) | ≤ 0.6 s stuns | one 1.2 s ragdoll | a grab + ragdoll |
| Ultimate | damage only | damage + mobility | moveset change |

### Combo scaling and caps

```
hitDamage(n)   = baseDamage × max(0.5, 1 - 0.08 × max(0, n - 4))   -- hit 5 does 92%, hit 10 does 52%
comboCap       = 35% of max HP or 8 hits; reaching either forces a knockdown
knockdownIFrames = 0.6 s on getting up
evasiveCooldown  = 25 s (breaks hitstun, costs nothing else)
```

### Balancing loop (weekly)

1. Liveops logs every kill: killer character, victim character, the move that dealt the final hit, combo length and the damage share per move.
2. Balance computes per-character pick rate and kill-death ratio, and per-move damage share.
3. **Rule of the band:** a character with pick rate above 25% (in a roster of 8) or kill-death ratio above 1.25 gets a nerf ticket; below 0.8 gets a buff ticket. Change one or two numbers by 5-15%, never more.
4. Publish patch notes in plain words: "Storm Fist Barrage damage 1.5 → 1.3 per hit (it dealt 41% of all Storm Fist damage)."
5. Wait a full week before touching the same character again.

## 6. Monetization that fits

Merchant proposes, the owner approves prices. Prices are targets.

### Game passes

| Pass | Target price (R$) | Fits because | Rule |
|---|---|---|---|
| VIP (title, chat tag, 1 extra emote slot, +10% coins) | 199-299 | status and convenience | no combat stats |
| Emote Pack | 149-249 | cosmetic, clip-friendly | — |
| Custom Kill Effect | 199-399 | cosmetic, shown on kill | must not hide the ragdoll or the killfeed |
| Private Server (Roblox native) | 100-200 per month | friends practice | — |
| Character early unlock | 99-299 per character | time skip | the character must also unlock with kills |

### Developer products

| Product | Target price (R$) | Rule |
|---|---|---|
| Coin packs | 49 / 99 / 249 / 499 / 999 | coins buy cosmetics only |
| Emote crate (random) | 49-99 | check `PolicyService:GetPolicyInfoForPlayerAsync(player).ArePaidRandomItemsRestricted`; show odds; offer direct purchase |
| Name color / title change | 25-49 | cosmetic |

### Off-limits

- **No paid combat stats, ever.** No damage, HP, cooldown or meter passes. Battlegrounds players notice pay-to-win in one fight.
- **No characters you can only get with Robux.** Every character has a kill path. Robux skips time.
- **No pay-to-respawn faster or pay to skip the spawn ForceField.**
- **No purchases on the death screen.** Death is the most frustrated moment in the game.
- **Kill effects can't block vision.** A big kill effect that blinds the next opponent is a paid combat edge.

## 7. UI and HUD for this genre

Frame builds these. See [[05 UI and HUD]] and [[08 Mobile]].

### HUD layout

| Element | Position | Size | Notes |
|---|---|---|---|
| Health bar | bottom-center above the move slots | 360 × 18 px | numbers "72 / 100"; white ghost bar drains 0.3 s after damage |
| Guard (block) meter | thin bar under health | 360 × 6 px | only visible while blocking or recovering |
| Ultimate meter | right of health | 64 px ring | glows and pulses at 100 |
| Move slots | bottom-center | 4 × 64 px, 8 px gaps | move icon, key label, radial cooldown sweep, seconds left in 16 px |
| Evasive indicator | left of move slots | 40 px | grey while cooling down |
| Combo counter | right-center | 48 px bold number | appears at 3+ hits, fades 1 s after the combo ends |
| Killfeed | top-right | up to 5 rows, 28 px each | killer, final move icon, victim; your own kills highlighted |
| Leaderboard | Roblox player list | — | kills and streak as leaderstats |
| Character select | full screen on demand (key C or a button) | grid of 4 columns | locked cards show "Kills 23/50" |

### Mobile layout

- **M1 button:** 120-130 px, bottom-right, 40 px from the edges.
- **4 move buttons:** 72-80 px each, in an arc above and left of M1.
- **Block:** 72 px, left of the arc (hold). **Dash:** 72 px, above the arc; dash direction follows the movement joystick.
- **Ultimate:** 80 px, top of the arc, only shown when ready.
- **Shift-lock style camera toggle:** 56 px near the top-right, because aiming moves with a free camera is hard on touch.
- The ContextActionService reference suggests building custom ImageButtons rather than relying on its auto-created touch buttons [10][11]. Route all buttons into the same input module as keys.

### Must-have screens

1. Character select with move previews (each move as a 3-second looping clip).
2. Training dummies with a combo damage readout.
3. Emotes wheel (8 slots).
4. Settings: camera shake 0-100%, reduced flashes, damage numbers on/off, hit sounds volume, auto shift-lock on mobile.
5. Patch notes panel on join after an update (one screen, skippable).

## 8. World and look

Scenic and Librarian own this. See [[06 World and Look]] and [[07 Characters, VFX and Assets]].

17. **One map, 400-600 studs across, with 3-4 distinct areas and open sightlines.** Players need room to dash and escape, and landmarks to describe where fights are ("the crater"). Use a central open area, a ruined town with cover, a high ground, and an edge area for spawns.

18. **Flat ground for 80% of the playable space.** Slopes and clutter break dashes, knockback and ragdolls. Keep props under 3 studs tall in fighting areas, and make big structures solid and simple.

19. **Every character is readable at 60 studs by silhouette and color.** Each character has one main color for its VFX and one shape (a cape, spikes, a weapon) visible from a distance. Avoid characters whose VFX share a color.

20. **VFX scale with move power.** M1 sparks are small (under 2 studs); moves are mid-size (4-8 studs); ultimates fill 20-40 studs with a screen tint. Big VFX on small moves make fights unreadable.

21. **Destruction is cosmetic and temporary.** Craters, debris and broken walls look great in clips, but they must restore within 10-20 s and never change collision for long. Spawn debris as client-side effects where possible.

22. **Performance for a 16-player brawl on a phone: under 20,000 parts in view, every effect cleaned up within 3 s, and no more than 150 active particles per player.** Use `Emit(n)` bursts, pool effects, and cap simultaneous ultimates' screen effects to the nearest two.

## 9. Retention and social

23. **Kill streaks are visible to the whole server.** At 3, 5 and 10 kills, announce the streak and give the player an aura. A 10-streak player is worth double coins to whoever ends the streak. This gives everyone a target.

24. **Party with friends without leaving the free-for-all.** Friends can form a team of up to 3: no damage to each other, a shared marker, and assists credited. Cap teams at 3 so one group can't dominate the server.

25. **Duels on request.** A "challenge" button on another player's name opens a 1v1 ring at the map's edge (or a reserved arena), first to 2 rounds. Duels stop arguments about who's better and generate clips.

26. **Daily and weekly goals use the roster.** "Get 5 kills with any character you haven't played today", "Land 3 ultimates", "Win 2 duels". They push variety without forcing it. See [[10 Retention and Social]].

27. **Mastery cosmetics per character.** Players who main one character want to show it. Aura tiers at 25/100/250/500 kills with that character.

28. **Moderation features are part of the build.** Report button on the player menu, block to stop duels and team invites, and a server-side rule that a player who ragdolls the same victim 5 times in 60 s while they're under the Rookie tag gets their kill rewards paused.

## 10. Live ops and update cadence

29. **A new character every 2-4 weeks is the heartbeat.** New kits are the genre's main content. Each release includes one character, one emote set, a balance pass and patch notes. The update thumbnail shows the new character mid-move. See [[12 Live Ops and Launch]] and [[11 Thumbnails, Icons and the Store Page]].

30. **Balance patches weekly, small and explained.** Section 5's loop. RoWatcher's 2026 comparison of two anime RPGs links weekly updates to growth and lists sluggish combat feel and slow updates among player complaints [36]. In battlegrounds, a stale meta is the equivalent of no updates.

| Cadence | Content | Effort (agent-days, target) |
|---|---|---|
| Weekly | balance patch, 1 emote or cosmetic, 1 code | 1-2 |
| Every 2-4 weeks | 1 character (8 animations, 6 VFX, frame data, icon, preview) | 6-10 |
| Every 6-8 weeks | map area or new mode (duels, king of the hill, boss mode) | 10-15 |
| Seasonal | themed event: limited emote, event mode for 7-14 days | 4-6 |

31. **Event modes rotate.** One weekend a month, swap the free-for-all for a mode (team deathmatch, boss mode, low gravity). It's cheap and brings players back.

32. **Never ship a character without a test week against the roster.** Playtest runs two clients through every matchup for 10 minutes each and logs the frame data issues before release.

## 11. Building it in Studio

Read [[13 Building It Right]] and [[14 Roblox Studio Workflow]] first.

### Systems list

| # | System | Side | Owner | What it does |
|---|---|---|---|---|
| 1 | CharacterRoster (Config) | shared | Builder, Balance | every character's moves and frame data |
| 2 | CombatService | server | Builder | validates move starts, hits, damage, stun, knockback |
| 3 | HistoryService | server | Builder | position history buffer for rewind |
| 4 | GuardService | server | Builder | block, guard meter, guard break, counter windows |
| 5 | ComboService | server | Builder | combo counters, scaling, forced knockdowns |
| 6 | MeterService | server | Builder | ultimate meter |
| 7 | KillService | server | Builder | damage logs, kill credit, assists, streaks, killfeed |
| 8 | UnlockService | server | Builder, Merchant | kills, coins, character and emote unlocks |
| 9 | PlayerData | server | Builder | save and load |
| 10 | InputController | client | Builder | keys and buttons to move requests, input buffer |
| 11 | ClientHitbox | client | Builder | predicted hit detection for instant feedback |
| 12 | RagdollController | client | Builder | ragdolls the local character when told |
| 13 | FxController | client | Builder, Librarian | animations, VFX, hitstop, camera shake |
| 14 | HudController | client | Frame | bars, slots, killfeed, combo counter |

### Hit detection: which model to use

| Model | How it works | Feel | Exploit risk | Use when |
|---|---|---|---|---|
| Server-only | client sends "move started", server queries the hitbox at hit time | hits land late for high-ping attackers | low | PvE, slow heavy moves, ultimates |
| Client-detect, server-validate | client queries its own hitbox, sends target list; server checks against rewound positions | best | medium; needs strict validation | M1s and fast moves in PvP |
| Server rewind (lag compensation) | server rewinds targets to where the attacker saw them, then queries | good | low | default for PvP moves when budget allows |

The trade-off is well worn on the DevForum, with long threads on where hitboxes belong and how to keep fast combat responsive [15][20]. Replies advise newer developers to keep hitboxes server-side, while noting that high-ping players suffer under a fully server-side approach [21]. Others detect hits on the client and send a remote for the server to apply damage [16], with server sanity checks such as attacker-target distance [17]. A rollback design records the attacker's position at attack start, ignores client timestamps, estimates latency from ping, and rewinds the target from a position buffer before checking the overlap [18]. A summary of an open-source rollback hitbox library describes the same server rewind [23]. A secure-combat guide lists trusting client-reported hit positions and client damage values as the classic holes [22].

**Studio standard for battlegrounds:** client-detect with server validation against rewound positions for M1s and moves; server-only for ultimates and grabs. Damage values always come from server config.

33. **The client never sends damage, only "I used move X" and "I think I hit these targets".** The server looks up damage in Config. Roblox's own laser tag sample uses the same split: the client sends what it did and the server decides the outcome [43]. *Done right:* `{moveId = "DashStrike", targets = {userId1}}`. *Done wrong:* `{damage = 40}`.

34. **The server only accepts a hit inside the move's active window, measured from when the server accepted the move start.** Don't trust the client's clock; the rollback design explicitly ignores client timestamps [18]. Allow `activeStart - 0.05` to `activeEnd + rewind + 0.1` seconds.

35. **The server rewinds the target by about half the attacker's round-trip ping plus the interpolation delay, capped at 0.3 s.** `Player:GetNetworkPing()` gives round-trip latency in seconds. The rollback thread uses ping/2 as its latency estimate [18]. Start with an interpolation delay of 0.1 s and tune it with two clients and network simulation. Cap the rewind at 0.3 s so a 600 ms player can't hit people who have long since dashed away.

36. **The server checks range with tolerance, line of sight and facing.** Range: target within `move.range + 3` studs of the attacker at the rewound time. Line of sight: a raycast from the attacker's root to the target's root that hits nothing but characters [1]. Facing: the target is within the move's cone (dot product of the attacker's look vector and the direction to the target ≥ cos(halfAngle)).

37. **Hitboxes are spatial queries, never `Touched`.** Use `GetPartBoundsInBox` or `GetPartsInPart` for the client and server checks, and `Blockcast`/`Spherecast` for dashes and projectiles [2][3]. A client can fire `Touched` on parts it owns that the server never saw happen [6]. Community modules such as Raycast Hitbox V4 cast rays from weapon attachments each frame, which suits weapon arcs [14].

38. **Hit timing comes from animation markers.** The animator places a `Hit` marker; the client listens with `GetMarkerReachedSignal` to run its predicted hitbox [4][5]. A DevForum reply recommends exactly this, using animation events to decide the moment to create the hitbox [19]. The marker time is copied into the frame data so the server knows the active window.

39. **Cosmetic effects go over an UnreliableRemoteEvent, gameplay over RemoteEvents.** The UnreliableRemoteEvent is meant for data that changes constantly or isn't critical [12][13]. Hit sparks, dash trails and camera shakes for other players can be dropped without harm; damage, stun and kill events can't.

40. **Every character's hitbox is the same size.** Fair PvP needs every character to be equally easy to hit. Use a fixed invisible hurtbox (4 × 5 × 2 studs) welded to the root, in a `Hurtbox` collision group that collides with nothing (collision groups are set up through PhysicsService [9]), and query against it instead of avatar parts. Scale and accessories then can't change hittability. This is a studio rule from experience.

### Ragdoll

41. **Ragdoll runs on the client that owns the character; the server owns the decision.** The server sets `RagdollUntil` (a server timestamp) on the character. The owning client sees the attribute change, ragdolls itself, and recovers at the time. Some Humanoid state changes on a player's character only take effect when made by that player's client [8], and the character's physics is simulated by its owner [6]. Other players see the ragdoll through normal physics replication. NPCs ragdoll on the server.

42. **Ragdoll lasts 0.8-2.0 s, then 0.6 s of get-up invulnerability.** Long ragdolls feel awful, and getting hit while standing up feels worse. During ragdoll, the player can't act; the evasive (rule 5) can cancel a ragdoll after 0.4 s.

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| MoveStart | RemoteEvent | C→S | moveId: string | move in the current character's kit, off cooldown, not stunned or ragdolled, alive | 10, 6 |
| MoveHit | RemoteEvent | C→S | moveId: string, targets: {number} | move active, ≤ 4 targets (M1 ≤ 2), each target passes rewind range, LOS and facing checks, not already hit by this move instance | 16, 10 |
| Block | RemoteEvent | C→S | holding: boolean | type check, guard > 0, not stunned | 8, 4 |
| Dash | RemoteEvent | C→S | kind: string ("front"/"side") | cooldown 1.5-3 s, not stunned | 4, 2 |
| Evasive | RemoteEvent | C→S | (none) | in hitstun or ragdoll ≥ 0.4 s, off cooldown | 2, 0.2 |
| Ultimate | RemoteEvent | C→S | (none) | meter = 100 | 2, 0.5 |
| SelectCharacter | RemoteEvent | C→S | characterId: string | unlocked, not in combat (no damage dealt or taken in 5 s) | 3, 0.5 |
| Duel | RemoteEvent | C→S | target: Player | both not in combat, target accepted | 3, 0.3 |
| CombatFx | UnreliableRemoteEvent | S→C | kind, position, ... | cosmetic | n/a |
| KillFeed | RemoteEvent | S→C | killer, victim, moveId | — | n/a |

### Data schema

```lua
--!strict
export type BattlegroundsData = {
	version: number,
	coins: number,
	kills: number,
	deaths: number,
	bestStreak: number,
	unlocked: { [string]: boolean },      -- character ids
	mastery: { [string]: number },        -- kills per character
	emotes: { [string]: boolean },
	equippedEmotes: { string },           -- 8 slots
	titles: { [string]: boolean },
	equippedTitle: string?,
	selected: string,                     -- last character
	settings: { shake: number, flashes: boolean, numbers: boolean },
	dailies: { day: number, progress: { [string]: number }, claimed: { [string]: boolean } },
}
```

### Server: position history for rewind

```lua
--!strict
-- ServerScriptService.Services.HistoryService
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local HistoryService = {}

type Sample = { t: number, cf: CFrame }
local SIZE = 30 -- 30 samples at 20 Hz = 1.5 s of history
local buffers: { [Player]: { samples: { Sample }, head: number } } = {}

local accumulator = 0
local function record(dt: number)
	accumulator += dt
	if accumulator < 0.05 then
		return
	end
	accumulator = 0
	local now = workspace:GetServerTimeNow()
	for _, player in Players:GetPlayers() do
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
		if root then
			local buffer = buffers[player]
			if not buffer then
				buffer = { samples = {}, head = 0 }
				buffers[player] = buffer
			end
			buffer.head = buffer.head % SIZE + 1
			buffer.samples[buffer.head] = { t = now, cf = root.CFrame }
		end
	end
end

-- Returns the CFrame closest to (and not after) time t, or nil if there is no history.
function HistoryService.at(player: Player, t: number): CFrame?
	local buffer = buffers[player]
	if not buffer then
		return nil
	end
	local best: Sample? = nil
	for _, sample in buffer.samples do
		if sample.t <= t and (best == nil or sample.t > best.t) then
			best = sample
		end
	end
	return if best then best.cf else nil
end

function HistoryService.Start()
	RunService.Heartbeat:Connect(record)
	Players.PlayerRemoving:Connect(function(player)
		buffers[player] = nil
	end)
end

return HistoryService
```

### Server: validate a client-reported hit

```lua
--!strict
-- excerpt from CombatService
local Players = game:GetService("Players")

local MAX_REWIND = 0.3
local INTERP = 0.1

local function validateHit(attacker: Player, target: Player, move, moveStartedAt: number): boolean
	local now = workspace:GetServerTimeNow()
	-- 1. active window, measured on the server's clock
	local elapsed = now - moveStartedAt
	local rewind = math.min(attacker:GetNetworkPing() / 2 + INTERP, MAX_REWIND)
	if elapsed < move.activeStart - 0.05 or elapsed > move.activeEnd + rewind + 0.1 then
		return false
	end
	-- 2. rewound positions
	local attackerRoot = (attacker.Character :: Model):FindFirstChild("HumanoidRootPart") :: BasePart?
	local targetCF = HistoryService.at(target, now - rewind)
	if not attackerRoot or not targetCF then
		return false
	end
	local offset = targetCF.Position - attackerRoot.Position
	-- 3. range with tolerance
	if offset.Magnitude > move.range + 3 then
		return false
	end
	-- 4. facing cone
	local look = attackerRoot.CFrame.LookVector
	if offset.Magnitude > 2 and look:Dot(offset.Unit) < math.cos(math.rad(move.halfAngle)) then
		return false
	end
	-- 5. line of sight, ignoring characters
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	local ignore = {}
	for _, player in Players:GetPlayers() do
		if player.Character then
			table.insert(ignore, player.Character)
		end
	end
	params.FilterDescendantsInstances = ignore
	if workspace:Raycast(attackerRoot.Position, offset, params) then
		return false -- a wall is in the way
	end
	return true
end
```

Also reject a target already hit by this move instance (keep a `hitSet` per move start), a target that's ragdolled with i-frames, and any hit while the attacker is stunned.

### Combo scaling and forced knockdown

```lua
--!strict
type Combo = { hits: number, damage: number, lastHit: number }
local combos: { [Humanoid]: Combo } = {}

local COMBO_RESET = 1.2   -- seconds without a hit ends the combo
local CAP_HITS = 8
local CAP_FRACTION = 0.35

local function scaledDamage(victim: Humanoid, base: number): (number, boolean)
	local now = workspace:GetServerTimeNow()
	local combo = combos[victim]
	if not combo or now - combo.lastHit > COMBO_RESET then
		combo = { hits = 0, damage = 0, lastHit = now }
		combos[victim] = combo
	end
	combo.hits += 1
	combo.lastHit = now
	local scale = math.max(0.5, 1 - 0.08 * math.max(0, combo.hits - 4))
	local amount = base * scale
	combo.damage += amount
	local forceKnockdown = combo.hits >= CAP_HITS or combo.damage >= victim.MaxHealth * CAP_FRACTION
	if forceKnockdown then
		combos[victim] = nil
	end
	return amount, forceKnockdown
end
```

When `forceKnockdown` is true, ragdoll the victim for 1.0 s and give 0.6 s of i-frames on get-up.

### Block facing check

```lua
--!strict
local BLOCK_REDUCTION = 0.8
local BLOCK_HALF_ANGLE = math.rad(60) -- blocks hits within 120° in front

local function blockedDamage(defenderRoot: BasePart, attackerPosition: Vector3, amount: number, unblockable: boolean): number
	if unblockable then
		return amount
	end
	local toAttacker = attackerPosition - defenderRoot.Position
	toAttacker = Vector3.new(toAttacker.X, 0, toAttacker.Z)
	if toAttacker.Magnitude < 0.1 then
		return amount * (1 - BLOCK_REDUCTION)
	end
	local facing = defenderRoot.CFrame.LookVector:Dot(toAttacker.Unit)
	if facing >= math.cos(BLOCK_HALF_ANGLE) then
		return amount * (1 - BLOCK_REDUCTION)
	end
	return amount -- hit from the side or behind
end
```

Drain the guard meter by the move's guard damage on every blocked hit and break the guard at 0.

### Client: ragdoll the local character

```lua
--!strict
-- StarterPlayerScripts.Controllers.RagdollController (excerpt). Runs for the local character only.
local function setRagdoll(character: Model, on: boolean)
	local hum = character:FindFirstChildOfClass("Humanoid")
	if not hum then
		return
	end
	for _, d in character:GetDescendants() do
		if d:IsA("Motor6D") and d.Name ~= "Root" and d.Name ~= "RootJoint" then
			if on then
				local a0 = Instance.new("Attachment")
				a0.Name = "RagA0"
				a0.CFrame = d.C0
				a0.Parent = d.Part0
				local a1 = Instance.new("Attachment")
				a1.Name = "RagA1"
				a1.CFrame = d.C1
				a1.Parent = d.Part1
				local socket = Instance.new("BallSocketConstraint")
				socket.Name = "RagSocket"
				socket.Attachment0 = a0
				socket.Attachment1 = a1
				socket.LimitsEnabled = true
				socket.TwistLimitsEnabled = true
				socket.UpperAngle = 45
				socket.Parent = d.Parent -- parent last
				d.Enabled = false
			else
				d.Enabled = true
			end
		end
	end
	if not on then
		for _, d in character:GetDescendants() do
			if d.Name == "RagSocket" or d.Name == "RagA0" or d.Name == "RagA1" then
				d:Destroy()
			end
		end
	end
	hum:ChangeState(if on then Enum.HumanoidStateType.Physics else Enum.HumanoidStateType.GettingUp)
end

-- Listen for the server's decision:
-- character:GetAttributeChangedSignal("RagdollUntil"):Connect(function() ... setRagdoll(character, true) ...
-- then task.delay(until - workspace:GetServerTimeNow(), setRagdoll, character, false)
```

Set `Humanoid.BreakJointsOnDeath = false` on spawn if you want death ragdolls instead of the default break apart. Test the ragdoll on R15 and R6 if the game allows both; most battlegrounds lock to R15 in the experience's avatar settings so hitboxes and animations match.

### Client: input buffer

Players press the next input slightly early. Buffer one input for 0.15 s: if a move is pressed during another move's recovery, queue it and fire it the instant recovery ends. This one change makes combos feel responsive without changing any server rule.

## 12. Twists that work

43. **Pick one twist and make it visible in the thumbnail.** The genre is crowded; a new roster of anime-flavored fighters isn't a twist on its own.

- **Original theme instead of anime.** Kitchen fighters, mythology gods, school-supply heroes, elemental animals. Same verbs, a world no other battlegrounds owns.
- **Team battlegrounds.** 4v4 in a round-based arena with a payload or a zone. Adds strategy and keeps the brawl readable.
- **Boss of the server.** The top killer transforms into a 3× scale boss with new moves; everyone else teams up. Built-in comeback mechanic and great clips.
- **Build-your-kit.** Pick 4 moves from a pool of 20 instead of fixed characters. Needs strict power budgets per move (section 5).
- **Arena hazards that rotate.** Every 3 minutes the map changes: lava floor, low gravity, darkness. Cheap content.
- **Kid-friendly parry fighter.** A wide 0.3 s counter window with slow-motion on success, no whiff punishment in Rookie servers. Takes the parry hook from Combat Warriors [24] and Deepwoken [28] to a younger audience.
- **Story bosses between brawls.** A co-op PvE boss rush using the same characters (see [[Genre - Action and Combat]]). Gives players who dislike PvP a reason to stay.
- **Rhythm combos.** Hits on the beat of the music do bonus damage. A distinct identity with clip appeal.

## 13. Failure modes

44. **"It's laggy."** Usually the attacker sees a hit, the server rejects it, and there's no feedback. Fix: client-predicted feedback (rule 4), server rewind (rule 35), and generous but capped tolerances.
45. **Infinite combos.** Someone finds a loop. Fix: combo cap and scaling (section 5), the evasive (rule 5), and a test pass that tries every move pair.
46. **One-character servers.** One kit is clearly best. Fix: the weekly balance band (section 5).
47. **Veterans farm new players.** Fix: Rookie tag, reduced rewards for killing rookies, optional beginner arena (rule 12).
48. **Exploits.** Speed dashes, hitbox extenders, auto-block. Fix: server cooldowns, range and LOS checks, a dash distance check against the position history, and logging rejected hits per player (kick after a threshold, review the logs).
49. **Unreadable chaos.** 16 ultimates on screen, nobody can see. Fix: VFX scaling (rule 20), screen effects only for the nearest two ultimates.
50. **Paid power.** A paid character that's best in slot. Fix: section 6.
51. **Content drought.** No new character for two months. Fix: section 10's cadence.
52. **Bad mobile controls.** Buttons over the action, no camera lock. Fix: section 7's mobile layout and a camera lock button.
53. **Ragdolls that fling.** Characters launched across the map by physics glitches. Fix: cap ragdoll velocity on the owning client (clamp `AssemblyLinearVelocity` to 80 studs/s), and make limbs non-colliding with other players during ragdoll.

## 14. Pitch checklist: is this genre right for us right now?

Fewer than 9 yes answers means rethink.

1. Do we have an original theme and at least 4 characters with distinct silhouettes and kits?
2. Can Librarian deliver 8 animations and 6 VFX per character at the quality of the top games?
3. Is the plan's hit detection model in section 11's table chosen, with rewind?
4. Can we release a new character every 2-4 weeks for at least 3 months?
5. Is the starter character competitive?
6. Is there no paid combat power anywhere in the plan?
7. Will the game run 16 players and their effects at 30+ FPS on the test phone?
8. Is there a beginner protection system?
9. Do we have a twist a player can see in the thumbnail?
10. Can a new player land a kill in their first 5 minutes (Kid Tester)?
11. Is the map built for dashing and ragdolls (flat, open, landmarks)?
12. Is the balance loop (logging, weekly patches) in Liveops' plan?

## Checklist

- [ ] First fight possible within 20 s of spawning.
- [ ] Every character uses the same controls (M1, 1-4, ultimate, block, dash).
- [ ] M1 chain is 4 hits; the 4th knocks back; 0.4-0.6 s end lag after it.
- [ ] Attacker sees hit feedback immediately (client prediction), and rejected hits don't show a damage number.
- [ ] Heavy hits have 50-100 ms of client-only hitstop.
- [ ] Combo cap works: 8 hits or 35% HP forces a knockdown with 0.6 s of i-frames.
- [ ] Evasive breaks hitstun and ragdoll (after 0.4 s) on a 20-30 s cooldown.
- [ ] Blocking takes 80% off front hits only; guard breaks at 0 and stuns 1.0-1.5 s.
- [ ] Moves over 15% damage have ≥0.3 s visible startup and a sound.
- [ ] Ultimate meter charges from damage dealt and taken, not time.
- [ ] Kill credit goes to the top damage dealer in the last 10 s, with assists over 20%.
- [ ] Spawn ForceField lasts 2 s; damage uses `Humanoid:TakeDamage`.
- [ ] MoveHit rejects hits outside the active window, out of range, through walls and behind the attacker (test with a modified client in Studio).
- [ ] Rewind is capped at 0.3 s.
- [ ] No hit detection uses `Touched`.
- [ ] Every character has the same hurtbox size.
- [ ] Ragdoll is applied by the owning client and lasts 0.8-2.0 s.
- [ ] Cosmetic effects use the UnreliableRemoteEvent; damage and kills use RemoteEvents.
- [ ] 16 players with ultimates run at 30+ FPS on the test phone.
- [ ] Mobile: M1 120+ px, moves 72+ px, camera lock button present.
- [ ] Every character can be unlocked with kills.
- [ ] No purchase prompts on the death screen.
- [ ] Rookie tag appears for accounts under 25 kills.
- [ ] Frame data sheet exists in `economy.md` for every character.
- [ ] Kill logging (killer, victim, final move, combo length) is live for balance.

## Common mistakes

1. Trusting a damage value or hit position from the client [22].
2. Using the client's timestamp to judge the active window [18].
3. Rewinding without a cap, so laggy players hit people who left long ago.
4. Using `Touched` for hitboxes [6].
5. Hitbox size tied to avatar parts, so small avatars are harder to hit.
6. Ragdolling player characters from the server and wondering why it looks wrong [6][8].
7. No combo cap: infinite loops ship.
8. Free, unlimited blocking.
9. Ultimates that charge over time.
10. Big VFX on small moves; screens full of noise.
11. A weak starter character that pushes players to buy.
12. Selling characters with no free path.
13. Showing a shop on death.
14. Balance changes of 30%+ at once, so the next patch has to undo them.
15. Patching without notes.
16. One `FireAllClients` per hit spark on a full server instead of nearby players over an UnreliableRemoteEvent [12].
17. Using deprecated `BodyVelocity` for dashes and knockback instead of `LinearVelocity`.
18. No beginner protection.
19. A map full of clutter that breaks dashes and ragdolls.
20. Testing combat only in single-player Play mode, never with two clients and simulated lag.

## References

[1] Raycasting (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/raycasting — `Raycast` basics and computing direction between two moving points.
[2] WorldRoot class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/WorldRoot — `GetPartBoundsInBox`, `GetPartsInPart`, OverlapParams defaults, deprecated region methods.
[3] Introducing Shapecasts (DevForum) — https://devforum.roblox.com/t/introducing-shapecasts/2320655 — Blockcast and Spherecast for fast-moving attacks and area damage.
[4] Animation events (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/animation/events — event markers and `GetMarkerReachedSignal`.
[5] KeyframeMarker class reference — https://create.roblox.com/docs/reference/engine/classes/KeyframeMarker — marker signals and duplicate-name behavior.
[6] Network ownership (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/physics/network-ownership — owners simulate physics; owners can fire Touched the server never saw.
[7] ForceField class reference — https://create.roblox.com/docs/reference/engine/classes/ForceField.md — ForceField blocks `TakeDamage`; spawn ForceFields.
[8] HumanoidStateType enum reference — https://create.roblox.com/docs/reference/engine/enums/HumanoidStateType — states, ChangeState, owner-client restriction, GettingUp after ragdoll.
[9] PhysicsService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md — collision groups for hurtboxes and ragdoll limbs.
[10] ContextActionService class reference — https://create.roblox.com/docs/reference/engine/classes/ContextActionService — touch buttons and the advice to build custom ones.
[11] Mobile input (Roblox Creator Documentation) — https://create.roblox.com/docs/input/mobile — binding actions with on-screen buttons.
[12] UnreliableRemoteEvent class reference — https://create.roblox.com/docs/ja-jp/reference/engine/classes/UnreliableRemoteEvent — for continuously changing, non-critical data.
[13] UnreliableRemoteEvent:FireAllClients() docs thread (DevForum) — https://devforum.roblox.com/t/unreliableremoteeventfireallclients-still-attempts-invocations-on-non-connected-clients-contrary-to-docs/3852670 — staff clarification of URE behavior.
[14] Raycast Hitbox V4 (DevForum) — https://devforum.roblox.com/t/374482 — weapon-attachment raycast hitboxes.
[15] Is this a good way to do hitboxes in combat games? (DevForum) — https://devforum.roblox.com/t/is-this-a-good-way-to-do-hitboxes-in-combat-games/3001235 — community hitbox approaches.
[16] How would I go about doing client-sided hitboxes? (DevForum) — https://devforum.roblox.com/t/client-sided-hitboxes/3161806 — client detection with a server damage remote.
[17] Combat system - hitboxes (DevForum) — https://devforum.roblox.com/t/combat-system-hitboxes/3312821 — server sanity checks such as distance.
[18] Combat System with Rollback (DevForum) — https://devforum.roblox.com/t/combat-system-with-rollback/3685525 — ignore client timestamps, ping/2 latency, position-buffer rewind.
[19] How should I make hitboxes? (DevForum) — https://devforum.roblox.com/t/how-should-i-make-hitboxes/3182033 — animation events to time hitboxes.
[20] Fast Paced Combat (DevForum) — https://devforum.roblox.com/t/fast-paced-combat/2944831 — responsiveness versus authority in fast combat.
[21] Should hitboxes be handled on the client or server in my PVP/PVE game? (DevForum) — https://devforum.roblox.com/t/should-hitboxes-be-handled-on-the-client-or-server-in-my-pvppve-game/3055838 — server-side default and the high-ping trade-off.
[22] How to make a secure combat framework (creation.dev) — https://www.creation.dev/learn/how-to-make-secure-combat-framework-roblox — server as source of truth; common vulnerabilities.
[23] How to implement lag compensation in Roblox shooters (creation.dev) — https://www.creation.dev/learn/how-to-implement-lag-compensation-roblox-shooters — server rewinds hitboxes to the attacker's tick.
[24] How to parry in Combat Warriors (Pro Game Guides) — https://progameguides.com/roblox/how-to-parry-in-combat-warriors-roblox/ — parry input, camera lock, stamina, stun.
[25] How to parry in Roblox Combat Warriors (Gamer Journalist) — https://gamerjournalist.com/how-to-parry-in-roblox-combat-warriors/ — one-second parry shield.
[26] Combat Warriors tips and tricks (Stealthy Gaming) — https://stealthygaming.com/combat-warriors-tips-tricks/ — whiffed parry penalty (fan guide).
[27] Kick in Combat Warriors (Stealthy Gaming) — https://stealthygaming.com/kick-in-combat-warriors-roblox/ — kick only works on stunned targets.
[28] Terminology (Deepwoken Wiki) — https://deepwoken.fandom.com/wiki/Terminology_(game) — posture, block break, parry, chip damage.
[29] Enforcer (Deepwoken Wiki) — https://deepwoken.fandom.com/wiki/Enforcer — attack answer tags.
[30] Game Feel and Juice, lesson 2 (Wayline) — https://www.wayline.io/learn/game-feel/1 — 50-100 ms hitstop; small camera shake.
[31] Hitstop returning to Monster Hunter Wilds (Destructoid) — https://www.destructoid.com/after-beta-feedback-hitstop-is-returning-to-monster-hunter-wilds/ — player reaction to missing hitstop.
[32] Hit feedback primer (uhiyama-lab) — https://uhiyama-lab.com/en/notes/unity/unity-game-feel-hit-feedback/ — hitstop, flash, shake and sound as a stack.
[33] Enemy attacks and telegraphing (Game Developer) — https://gamedeveloper.com/design/enemy-attacks-and-telegraphing — animation plus audio warnings.
[34] Crafting Legendary Boss Battles (Wayline) — https://www.wayline.io/blog/crafting-legendary-boss-battles — consistent, multi-channel signals.
[35] Anime Vanguards surpasses Blox Fruits (Beebom) — https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/ — anime-themed demand.
[36] Blox Fruits vs Sailor Piece (RoWatcher, 2026) — https://rowatcher.com/news/blox-fruits-vs-sailor-piece-which-anime-rpg-is-actually-growing-faster-in-2026 — update cadence and combat-feel complaints.
[37] Fighting Styles (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Fighting_Styles — movesets as collectible styles.
[38] Blox Fruits fighting styles (Pocket Gamer) — https://www.pocketgamer.com/roblox/blox-fruits-fighting-styles — styles by role (opinion).
[39] GPO tier list, all fruits ranked (Dot Esports) — https://dotesports.com/roblox/news/grand-piece-online-gpo-tier-list-all-fruit-ranked — PvP and battle royale value of stuns.
[40] Grand Piece Online complete battle royale guide (Item Level) — https://itemlevel.net/grand-piece-online-complete-battle-royale-guide/ — stat advice for new PvP players.
[41] Type Soul tier list (Pocket Tactics) — https://www.pockettactics.com/type-soul/tier-list — meta-dependent rankings.
[42] Arcane Odyssey class tier list for PvE and PvP (All Things How) — https://allthings.how/arcane-odyssey-class-tier-list-for-pve-pvp-and-full-release-builds-january-2026/ — separate PvE and PvP rankings.
[43] Implement blaster behavior (Roblox Creator Documentation) — https://create.roblox.com/docs/tutorials/curriculums/gameplay-scripting/implement-blasters — client sends action data, server decides hits.
[44] Elden Ring discussion on telegraphs (Steam Community) — https://steamcommunity.com/app/1245620/discussions/0/3729575504108842499/?l=danish — charge-up versus telegraph distinction.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Action and Combat]] · [[Genre - Shooter]] · [[Genre - Party and Social Hangout]]
