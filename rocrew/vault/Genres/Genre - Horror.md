---
tags: [vault, genre, horror, chapters, entities, chase, co-op, pacing, jump-scares, safety]
for: [lead, pulse, architect, builder, scenic, playtest, kid-tester]
also: [frame, librarian, balance, reviewer, merchant, liveops, splash, producer]
---

# Genre - Horror

This is the playbook for games where the main feeling is **fear you can survive**: chapter-based escape horror (find the items, unlock the exit, don't get caught), room-by-room runs where entities with distinct warnings hunt you (the Doors shape), co-op horror with friends, asymmetric one-versus-many chases, ghost investigation, and survival horror sandboxes. It covers entity design, warnings and counterplay, chases, hiding, room generation, lighting and sound, pacing, and the rules this studio follows for scaring a young audience responsibly.

Horror works on Roblox because fear is social. Kids play horror games with friends to scream together, laugh after, and dare each other to go one room further. Videos of reactions spread these games. But horror fails in two specific ways. It can be unfair: deaths from threats the player couldn't see or hear coming feel cheap, and players quit. Or it can be wrong for the audience: gore, cruelty or relentless jump scares push away the 10-year-olds who are most of the platform, along with their parents. The rules below aim for "scary, fair and fun to replay": every threat has a warning and a counter, scares are paced, and nothing crosses the lines in section 1.

Read this page before pitching any horror game or adding a horror mode or event to another genre (a Halloween update, a haunted area). Scenic reads section 8, Librarian reads the sound rules, Builder reads section 11, and Kid Tester uses the fear rules in section 1 as a test script. Numbers marked as targets are this studio's rules, not measurements of other games.

**Source note.** The search budget ran out before horror-specific game research. The entries for Doors, Piggy, The Mimic, Apeirophobia, Pressure, Flee the Facility, Forsaken, Specter, 3008 and Evade are described from general knowledge, not from a source found in this pass. They are marked *(unverified)* and have no citation; don't quote details from them until a later pass adds sources. The jump-scare and safety rules are this studio's rules of thumb. All cited claims come from the search results in References.

## 1. What it is and why it works on Roblox

### Sub-genres

| Sub-genre | Shape | Reference | Session | Social shape |
|---|---|---|---|---|
| Room-run with entities | advance door by door; each entity has a warning and a counter | Doors, Pressure *(unverified)* | 15-40 min runs | co-op 1-4, elevator lobby |
| Chapter escape | find items, solve locks, escape a map while a monster patrols | Piggy, The Mimic *(unverified)* | 10-30 min per chapter | co-op, sometimes a player monster |
| Asymmetric chase | one killer versus several survivors | Flee the Facility, Forsaken *(unverified)* | 3-8 min rounds | server-wide rounds |
| Exploration and backrooms | navigate eerie levels, solve puzzles, avoid entities | Apeirophobia *(unverified)* | 20-60 min | co-op |
| Investigation | find evidence to identify a ghost | Specter *(unverified)* | 10-25 min | co-op 1-4 |
| Survival sandbox | build by day, survive by night | 3008 *(unverified)* | open-ended | shared server |
| Chase party | flee chasers, revive friends | Evade *(unverified)* | 2-5 min rounds | server-wide |

### The audience

- **The core player is 9-14 and plays with friends.** Horror is the genre where "my friends made me play it" matters most. Party features are not optional (section 9).
- **They want to be scared a bit, then laugh.** The ideal scare is followed by relief and a friend's voice. Relentless dread with no release loses this audience.
- **Watching is part of playing.** Players learn about horror games from reaction videos. Design moments worth reacting to: a distinct entity, a warning everyone recognizes, a close escape.

### Why players come back

1. **Mastery of threats.** Each entity is a puzzle. Learning "lights flicker means hide" turns fear into skill.
2. **Going further.** "I made it to room 70" is a goal and a brag.
3. **New chapters and floors.** Horror is content-driven; each new area brings players back.
4. **Achievements for encounters.** Badges for surviving (or dying to) each entity make even deaths progress.
5. **Friends.** Co-op revives, shared panic and inside jokes.

### Fear rules for a young audience

These are this studio's rules of thumb. They aren't from a cited source, but they're not optional.

1. **Scary, never cruel.** No gore, dismemberment, torture, blood pools, self-harm or suicide themes, real-world tragedies, real people, or cruelty to animals. Monsters are stylized creatures, not realistic human victims. *Done right:* a tall shadow with glowing eyes. *Done wrong:* a mutilated body in a closet.

2. **Answer the maturity questionnaire honestly.** In the Creator Dashboard's maturity and compliance questions, describe the fear content as it is. A lower label that gets corrected later hurts discovery more than an honest label. Lead confirms the answers with the owner before publishing.

3. **No full jump scare in the first 2 minutes of a player's first session, and at most one per 5 minutes on average after that.** Early scares before a player has agency feel like a prank, not a game. Use ambient scares (a distant sound, a shadow passing a doorway, a door slamming) to build tension between jump scares; budget 3-5 ambient scares per jump scare.

4. **A jump scare is on screen for at most 1.2 s, and its sound is loud by contrast, not by volume.** Keep the game's normal mix at Sound.Volume 0.3-0.5 and the scare sting at 0.8-1.0; never push any sound above 1.0. The scare should startle, not hurt ears in headphones.

5. **No more than 3 flashes per second, ever.** Flicker effects use slower patterns (0.15-0.4 s per state). This follows the common photosensitivity guideline and protects players with photosensitive epilepsy. A "Reduce flashing" setting removes flicker entirely and replaces it with a slow dim.

6. **A "Scare intensity" setting with three levels: Full, Reduced, Off.** Reduced removes the face close-up and the sound spike from jump scares. Off replaces jump scares with a fade to black and a soft thud. It's free, on the first settings tab, and remembered in the save.

7. **Every audio warning has a visual equivalent.** Deaf and hard-of-hearing players, and players on muted phones, must get the same warning. Add captions ("[distant rumbling]") and a small icon at the screen edge pointing to the sound's direction.

8. **Death is explained, short and never mocked.** The death screen names what killed you, shows one tip about how to survive it, and returns you to play or spectate within 5 s. No laughing sounds at the player, no shop.

9. **There's always a safe place.** The lobby is bright with calm music. Checkpoints and safe rooms have warm light and a different music cue. Players need somewhere to breathe.

10. **The store page says what the game is.** The description states it's a horror game with scary moments and lists the intensity setting, so parents and players know before they join.

## 2. The core loop

**Loop statement (room-run):** "Enter with friends → open the next door → read the room for items and hiding spots → spot an entity's warning → react with the right counter (hide, run, look away, stay still) → survive to the next checkpoint → earn currency and encounter badges → spend on run items → push further next run."

**Variants:**
- **Chapter escape:** "Spawn in the map → search for key items while the monster patrols → use items on locks → open the exit → escape, or get caught and spectate or respawn."
- **Asymmetric round:** "Get assigned killer or survivor → survivors complete objectives while the killer hunts → escape or eliminate → rewards for both sides → next round with a new killer."
- **Investigation:** "Enter the haunted site → set up tools → gather 3 pieces of evidence → name the ghost → escape before the hunt."
- **Survival night:** "Gather and build by day → defend through the night → morning reward → longer nights."

### The layers

| Layer | Length | What happens | Studio target |
|---|---|---|---|
| Cue | 1-3 s | warning sound, light flicker, visual sign | every lethal threat warns at least 2 s ahead (sweep entities) or shows a clear screen cue (look-away entities) |
| Room | 30-90 s | search, loot, one possible event | 1 event in every 3-5 rooms |
| Encounter | 5-45 s | hide from a sweep, survive a chase, solve under pressure | chases 20-45 s |
| Run or chapter | 15-40 min | rooms to a checkpoint or exit | first checkpoint within 8-10 min |
| Session | 30-60 min | 1-3 runs | something new (entity, room type or badge) every session in week 1 |
| Update | 6-12 weeks | new floor or chapter | section 10 |

### Pacing: the tension curve

11. **Run the tension in waves: build for 60-120 s, peak for 5-30 s, release for 20-40 s.** Constant tension numbs players; constant calm bores them. Plan each stretch of 5-8 rooms as a curve: quiet rooms with small sounds (build), an entity encounter (peak), then a safe or loot room with warm light (release). Write the curve as a table in `plan.md` and have Playtest time it. *Done right:* a tense corridor, the entity sweeps, then a lit library room with loot. *Done wrong:* entity, entity, entity, then 10 empty rooms.

12. **Teach every threat safely the first time.** The first encounter with each entity in a player's life is survivable or heavily signposted: the hiding spots glow faintly, a caption names the counter ("Hide!"), and it can't kill on that first meeting. A student game-design presentation describes the same goal of teaching telegraphs inside the encounter instead of through repeated failure [16]. *Done right:* "The lights flicker. Hide! (closet highlighted)". *Done wrong:* the first time a player sees the entity, they're dead.

13. **Every threat has a warning, a counter and a consistent signal.** Game Developer's series on enemy attacks describes warning players with both animation and audio, using a boss whose spoken callouts precede its attacks [13]. Wayline warns against relying on one subtle cue and insists that signals stay consistent [14]. For each entity, write: the warning (2 channels: sound plus light, or sound plus visual), the lead time, the counter, and what happens if you fail. Never change an entity's warning between floors without a story reason shown to the player.

14. **Separate "charging up" from "about to hit".** A Steam discussion draws a useful line between a charge-up that's visible early but unclear in timing, and a telegraph that tells you the attack is landing now [15]. Give big threats both: a distant rumble 4-6 s out (start moving), and a sharp sound 1-2 s out (you must be hidden now).

15. **Vary threats, not just their number.** Each run mixes 3-5 entity types with different counters: one you hide from, one you outrun, one you must not look at, one you must stay still for, one you solve a puzzle to escape. Players should be asking "which one is it?", not "again?".

16. **Darkness is a tool, not a wall.** Pitch black means players can't see the warning, which breaks rule 13. Minimum ambient light lets players see room outlines without a flashlight (section 8).

## 3. Top games in the genre

### Doors: entities as a vocabulary *(unverified)*
**Game:** Doors *(no source this pass)*
**Shows:** A co-op room-by-room run through a hotel of numbered doors with procedurally arranged rooms. Each entity has its own warning and counter, such as flickering lights before one that you avoid by hiding in a closet. Players collect a currency during runs and spend it on items before the next run. After a death, the game explains what killed you and how to survive it.
**Why it works:** Every entity is a learnable rule, so deaths teach. Procedural rooms keep runs fresh, and numbered doors make progress a number to brag about.
**Steal:** A small vocabulary of entities with distinct warnings and counters, numbered rooms, a death screen that teaches, and a pre-run item shop.
**Avoid:** Copying its entities, their looks or their names. Design your own threats with your own signals.

### Piggy: the chapter escape template *(unverified)*
**Game:** Piggy *(no source this pass)*
**Shows:** Chapter-based maps where players search for items to unlock the exit while a monster, controlled by a bot or by a player, hunts them.
**Why it works:** A clear goal (find items, escape), a single visible threat, and chapters that each bring a new map and story beat.
**Steal:** Item-lock escape maps with 4-6 key items, and the option for one player to be the monster.
**Avoid:** Maps where players get stuck with no hints. Add hint notes after 5 minutes without progress.

### The Mimic: folklore-driven chapters *(unverified)*
**Game:** The Mimic *(no source this pass)*
**Shows:** A story-led chapter horror game drawing on folklore, with chases and puzzles.
**Why it works:** A strong cultural theme gives monsters meaning and makes the world memorable.
**Steal:** A coherent theme for every monster and room, and story beats between chases.
**Avoid:** Chases that require memorizing a long route on the first try. Mark the route with light.

### Apeirophobia: the eerie level *(unverified)*
**Game:** Apeirophobia *(no source this pass)*
**Shows:** Co-op exploration through liminal, backrooms-style levels with entities and puzzles.
**Why it works:** Uncanny, empty spaces are scary without gore, which suits a young audience.
**Steal:** Liminal spaces (empty offices, pools, endless corridors) as low-gore fear.
**Avoid:** Mazes so samey that players get lost and bored. Add landmarks and signs.

### Pressure: rooms, lockers and a different setting *(unverified)*
**Game:** Pressure *(no source this pass)*
**Shows:** A room-run horror game set in a deep-sea facility where players hide in lockers from entities.
**Why it works:** It reuses the room-run structure in a new setting, proving the format isn't tied to one theme.
**Steal:** Taking a proven structure into a fresh setting (space station, school, toy factory).
**Avoid:** A setting change with no new threat ideas. The entities are the content.

### Flee the Facility: one beast, four survivors *(unverified)*
**Game:** Flee the Facility *(no source this pass)*
**Shows:** Asymmetric rounds where one player is the Beast and the others hack computers and escape, freeing captured friends.
**Why it works:** Short rounds, clear objectives, and everyone gets a turn as the monster.
**Steal:** Survivors doing objectives under pressure, rescue mechanics, and rotating the killer role.
**Avoid:** Killer roles so strong or weak that rounds are one-sided. Balance with telemetry (section 5).

### Forsaken: asymmetric horror with abilities *(unverified)*
**Game:** Forsaken *(no source this pass)*
**Shows:** An asymmetric horror game with killers and survivors who each have their own abilities.
**Why it works:** Character abilities add depth and give players characters to collect and master.
**Steal:** Survivor and killer kits with one or two abilities each, using the power-budget idea from [[Genre - Battlegrounds]].
**Avoid:** Using other games' or creators' characters.

### Specter: horror as investigation *(unverified)*
**Game:** Specter *(no source this pass)*
**Shows:** Co-op ghost hunting where players use tools to gather evidence and identify the ghost.
**Why it works:** Players have a job, not just a threat. Deduction gives the fear a purpose.
**Steal:** Tools with clear readouts and an evidence table that narrows the answer.
**Avoid:** Evidence that's too subtle to see on a phone.

### 3008: horror in a sandbox *(unverified)*
**Game:** 3008 *(no source this pass)*
**Shows:** An endless furniture-store world where players gather and build bases by day and survive hostile staff by night.
**Why it works:** The day-night cycle gives built-in pacing (calm build, tense night), and an absurd setting keeps it light.
**Steal:** Day-night tension waves and base building as the release phase. See [[Genre - Survival]].
**Avoid:** Nights that are only darker, with no new threat behavior.

### Evade: the chase as a party *(unverified)*
**Game:** Evade *(no source this pass)*
**Shows:** Rounds where players flee chasing bots across maps and revive downed friends.
**Why it works:** Chases are funny and scary at once, rounds are short, and reviving creates teamwork.
**Steal:** Revive mechanics, short rounds, and map variety for a party audience. See [[Genre - Party and Social Hangout]].
**Avoid:** Chasers that can't be outplayed (no speed difference, no obstacles).

## 4. The first five minutes

| Time | What the player sees and does | Build notes |
|---|---|---|
| 0-8 s | Loading screen: logo, a calm tip, and "This game has scary moments. Change scare intensity in Settings." | One line, then gone. |
| 8-30 s | Bright lobby with calm music; a party elevator or start area with 4 slots and a 15 s countdown when anyone is ready | Friends join the same elevator. Solo players can start alone. |
| 30-60 s | Run begins in a lit entrance room. Movement and sprint hint once. First item (flashlight) on a table with a ProximityPrompt | "Pick up" prompt with `HoldDuration = 0`. The flashlight button appears on the HUD. |
| 60-120 s | Rooms 1-3: quiet, safe, small ambient sounds (a creak, a distant door). One drawer with currency | No threat can hurt the player before 2 minutes (fear rule 3). |
| 120-180 s | First ambient scare: a shadow crosses a doorway ahead, with a soft sound | Harmless, scripted per player. |
| 180-240 s | First entity warning: lights flicker (≤ 3 flashes/s), a rumble, and the caption "[rumbling] Hide!" with the nearest closet outlined | This first encounter can't kill (rule 12). The closet prompt is the biggest on screen. |
| 240-270 s | The entity passes; release: a warm-lit room with loot and a badge "Survived your first encounter" | Badge via `BadgeService:AwardBadge`. Currency +10. |
| 270-300 s | Door 6: a new mechanic hinted (a locked door and a key somewhere in the room) | First puzzle: find the key within the room, glowing faintly. |

Opening rules:

17. **Agency before fear.** The player moves, picks up an item and opens a door before anything scary happens. Fear lands harder when you feel in control first.

18. **The first entity encounter is a lesson.** It's survivable, the counter is shown, and the release room rewards surviving it.

19. **The first death, when it comes, teaches.** The death screen names the entity and shows its counter in one line. Respawn or spectate within 5 s.

20. **No shop, daily reward or popup in the first run.** The lobby can show them; the first run can't.

## 5. Progression and economy

All numbers are targets for Balance to simulate in `economy.md`.

### Shapes

- **Distance:** the main progress is how far you get (room number, chapter, floor).
- **Meta-currency:** collected in runs, spent in the lobby on run items and cosmetics.
- **Encounters:** badges for meeting and surviving each entity.
- **Unlocks:** floors, chapters and harder modes unlock after a first clear.

### Run currency

```
currencyPerRun = 1 per room reached + chest finds (0-5 each, about 1 chest per 8 rooms) + 15 checkpoint bonus + 50 first-clear bonus
```

| Run outcome (50-room floor) | Currency (target) |
|---|---|
| Died at room 15 | 15 + about 5 from chests = 20 |
| Died at room 35 | 35 + about 12 + 15 = 62 |
| Cleared (room 50) | 50 + about 18 + 30 + 50 first clear = 148 |
| Cleared again | about 98 |

### Run items (bought in the lobby, lost on death)

| Item | Cost (target) | Effect | Rule |
|---|---|---|---|
| Flashlight upgrade | 40 | +50% battery | the base flashlight is free in every run |
| Lockpick ×2 | 25 | opens a locked drawer or door without the key | |
| Energy drink | 30 | +40% sprint stamina for 60 s | |
| Lantern | 60 | lights 12 studs around you, no battery | |
| Extra hiding charm | 80 | once per run, the next entity ignores you even unhidden | only one per run; never sold for Robux |

A run item should never cost more than one average death-at-room-35 run (about 60), so buying feels possible after every attempt.

### Encounter badges and modes

- One badge per entity for surviving it, one for dying to it (players collect deaths too).
- **Hard mode** unlocks after a first clear: entities arrive faster (warnings stay the same length), +50% currency.
- **Modifiers** (later): "lights out", "double entities", each +10-30% currency.

### Asymmetric modes

- Survivors earn currency per objective (10), per rescue (15) and on escape (40). The killer earns per catch (15) and per round won (40).
- **Balance band:** across 200+ rounds, survivors should escape in 40-60% of rounds. Outside the band, adjust killer speed by 0.5 studs/s or objective time by 10%.

### Movement numbers (targets)

| Value | Target |
|---|---|
| Player walk speed | 12-14 studs/s |
| Player sprint | 20-22 studs/s for 5 s, regenerating fully in 4 s |
| Chaser speed | 17-19 studs/s: faster than walking, slower than sprinting |
| Sweep entity speed | 60-100 studs/s |
| Sweep warning lead time | 3-5 s before it enters the room, 2 s minimum |
| Hide limit | warning at 15 s hidden, forced out at 25 s |

## 6. Monetization that fits

Merchant proposes, the owner approves prices. Prices are targets.

### What to sell

| Item | Target price (R$) | Notes |
|---|---|---|
| Revive (continue the run where you died) | 49-99 | at most 1 per run, and also earnable (one free revive token per day) |
| Cosmetic skins (character, flashlight, lantern) | 49-299 | visible to friends in the lobby and in runs |
| Lobby emotes | 49-149 | used in the elevator while waiting |
| 2× Currency pass | 249-399 | speeds lobby purchases; never buys items unavailable to others |
| Private server (Roblox native) | 100-200 per month | friends-only runs |
| Supporter pack (cosmetic + badge) | 199-399 | for fans after a big update |

### Off-limits

- **No invincibility or entity immunity for Robux.** It removes the game. The hiding charm (section 5) is earned only.
- **No selling the scare setting or a "skip scary part" product.** Accessibility and comfort settings are free.
- **No purchase prompts on the death screen or during a chase.** Revive is offered in a small button on the spectate screen, never a full-screen modal, and never to players under 10 runs played.
- **No paid random items without the policy check and odds** (`PolicyService:GetPolicyInfoForPlayerAsync(player).ArePaidRandomItemsRestricted`). See [[09 Shops and Monetization]].
- **No paid chapters that split friends.** If a new chapter is early-access for a paid pass, it's for at most 7 days, and a paying friend can bring non-paying friends in.

## 7. UI and HUD for this genre

Frame builds these. Horror UI is minimal: every element on screen is a reminder that it's a game. See [[05 UI and HUD]] and [[08 Mobile]].

### HUD layout

| Element | Position | Size | Notes |
|---|---|---|---|
| Room or door number | top-center | 28 px, 60% opacity | the progress brag number |
| Item hotbar | bottom-center | 3-4 slots, 56 px | only shows held items |
| Stamina | above the hotbar | 160 × 6 px | visible only while sprinting or regenerating |
| Flashlight battery | next to its slot | 4-segment icon | flashes slowly when low |
| Captions | bottom-center, above the hotbar | 18 px, max 2 lines, black 50% backing | every sound cue (fear rule 7) |
| Sound direction icon | screen edge | 32 px | points to the source of a warning sound |
| Interaction prompt | world space | default ProximityPrompt style or a custom one | `HoldDuration` 0 for hiding and pickups, 0.5-1.5 s for puzzles and doors |
| Party list | top-left | names with a status dot | alive, hiding, down, dead |

### Mobile layout

- **Interact / Hide button:** 100-110 px, bottom-right. Hiding must be one tap and impossible to miss in a panic.
- **Sprint:** 80 px, above the interact button; tap to toggle, not hold, so the thumb is free to steer the camera.
- **Flashlight:** 64 px, left of sprint.
- **Crouch:** 64 px (only if the game uses crouching).
- Build custom buttons; the ContextActionService reference recommends custom ImageButtons for control over position and look [19][20].

### Must-have screens

1. **Lobby:** play / party elevator, shop for run items, cosmetics, badges board (entities met).
2. **Death screen:** entity name, one-line counter tip, time survived, room reached, "Spectate" and "Return to lobby" (5 s).
3. **Spectate:** cycle through living teammates.
4. **Settings (first tab):** Scare intensity (Full / Reduced / Off), Reduce flashing, Captions (on by default), brightness slider (with a "barely visible" reference image), music, SFX.
5. **Bestiary:** each entity met, with its warning and counter written out. Unknown entities show a silhouette. It teaches and it's collectible.

## 8. World and look

Scenic and Librarian own this. See [[06 World and Look]] and [[07 Characters, VFX and Assets]].

### Lighting targets

| Setting | Lobby (safe) | Normal rooms | Danger rooms |
|---|---|---|---|
| `Lighting.Ambient` | (120, 120, 120) | (25, 25, 30) | (12, 12, 16) |
| `Lighting.OutdoorAmbient` | (140, 140, 140) | (20, 20, 25) | (10, 10, 14) |
| `Lighting.Brightness` | 2 | 0.5-1 | 0.2-0.5 |
| `Atmosphere.Density` | 0.2 | 0.35-0.45 | 0.5-0.6 |
| Light color | warm (255, 220, 170) | warm, sparse | cold blue or none |
| Music | calm loop | low drone | silence, then the threat's sound |

21. **Light means safety; its loss means danger.** Warm practical lights (lamps, candles) mark safe rooms. When an entity approaches, lights flicker and die, which is the warning. Never use flicker for decoration in a room where entities can't spawn, or the signal stops meaning anything.

22. **Players can always see the room's shape.** Minimum ambient so walls, doors and hiding spots read at 15 studs without a flashlight. The flashlight extends sight; it doesn't create it. Flashlight: a SpotLight with `Range` 40-60, `Angle` 45-60, `Brightness` 2-4, `Shadows = true`.

23. **Room kits are modular.** Each room is a Model built on a 4-stud grid with a standard doorway size (6 × 9 studs), an Entrance part and an Exit part (section 11). Sizes: small 24 × 24, medium 40 × 40, large 60 × 60 studs, plus corridors 12 wide. A floor needs 20-30 room templates before procedural runs feel varied.

24. **Every room where a sweep entity can appear has a hiding spot.** At least one closet, locker or bed per room on a floor with a hide-counter entity, placed within 15 studs of the room's center.

25. **Entities have a silhouette, a color and a sound nobody else has.** One entity is tall and thin, another is a fast smear of light, another is a sound you only hear. Each has one signature color and one signature sound. Players identify threats by sound first.

26. **Sound is half the game.** Use 3D sounds parented to parts with `RollOffMaxDistance` 60-120 for entity sounds so direction and distance read. Footsteps sync to animation markers; Roblox's own animation events guide uses a footstep marker as its example [10][11]. Mix: ambience 0.2-0.3, footsteps 0.3-0.4, warnings 0.6-0.8, scare stings 0.8-1.0 (never above 1.0, fear rule 4).

27. **Variety comes from dressing, not new geometry.** The same room template with 3 prop sets and 2 lighting states reads as 6 rooms. Librarian builds prop sets; Scenic tags each template with its allowed sets.

28. **Performance: only 4-6 rooms exist at once.** Generate 2-3 rooms ahead of the leading player and destroy rooms 3+ behind the last player. Keep under 15,000 parts in a run and use `Emit(n)` particle bursts for scares.

## 9. Retention and social

29. **Co-op for 1-4 is the default.** A party elevator (or start pad) groups friends. Rooms scale lightly: +10% entity frequency per extra player, never more HP or tougher counters.

30. **Downed, not dead, when a friend is near.** In co-op, a caught player is downed for 20 s and can be revived by a teammate holding a prompt for 3 s (`HoldDuration = 3`) [3]. Revived players get a 2 s grace period (a ForceField blocks `TakeDamage` [22]). Solo players die normally.

Downed players crawl at WalkSpeed 4 with a crawl animation. Use a `Downed` attribute and WalkSpeed rather than forcing Humanoid states from the server, because some state changes on a player's character only take effect when made by that player's own client [23].

31. **Spectating is fun, not a punishment.** Dead players spectate living teammates and can ping objects (a 2 s marker the living player sees). They're still part of the run.

32. **Bestiary and badges make deaths count.** Meeting an entity fills its bestiary page. A death is still progress.

33. **Brag numbers everywhere.** Best room reached per floor, fastest clear, deaths per entity. Show them in the lobby and on the death screen.

34. **Moments made for clips.** A near-miss (the entity passes within 3 studs of a hidden player) triggers a slow-motion heartbeat for 1 s and a "Close call!" badge. These moments are what players share.

35. **Daily modifiers.** One daily run modifier ("lights out", "fast entities", "one hiding spot per room") with bonus currency and a badge. A reason to return every day. See [[10 Retention and Social]].

## 10. Live ops and update cadence

36. **A new floor or chapter every 6-12 weeks, with a new entity or room pack every 2-3 weeks in between.** Horror is consumed fast: once players know every entity, the fear fades. New threats renew it. A 2026 analysis of two large anime RPGs linked weekly updates to growth and slow updates to player complaints [28]; horror feels that pressure even more because familiarity kills fear.

| Cadence | Content | Effort (agent-days, target) |
|---|---|---|
| Every 2-3 weeks | 1 new entity (model, 3 animations, signature sound, warning, counter, bestiary page) or 5 new room templates | 4-7 |
| Every 6-12 weeks | new floor or chapter: 20-30 rooms, 3-4 entities, a finale chase, a boss puzzle | 20-35 |
| Monthly | daily modifier rotation, a cosmetic set | 1-2 |
| October | Halloween event: themed rooms, a limited entity, a cosmetic | 6-10 |

37. **The update thumbnail shows the new threat, partly hidden.** A silhouette in a doorway with eyes is more clickable than a full reveal, and it keeps the surprise. See [[11 Thumbnails, Icons and the Store Page]].

38. **Mystery and lore drive community.** Hidden notes, codes on walls and secret rooms give players something to discuss between updates. One secret per floor is enough.

39. **Events in other genres can borrow this page.** A Halloween haunted area in a simulator uses sections 1, 2 and 8 at Reduced intensity by default.

## 11. Building it in Studio

Read [[13 Building It Right]] and [[14 Roblox Studio Workflow]] first.

### Systems list

| # | System | Side | Owner | What it does |
|---|---|---|---|---|
| 1 | RunService (game-level, not the engine service) | server | Builder | run state, party, seed, checkpoints, end of run |
| 2 | RoomGenerator | server | Builder | picks templates, places rooms, removes old rooms |
| 3 | EntityDirector | server | Builder, Balance | schedules entities by room count and pacing curve |
| 4 | Entities (one module each) | server | Builder | warning, movement, kill check |
| 5 | HideService | server | Builder | closets and lockers, hide limits |
| 6 | ItemService | server | Builder | pickups, run inventory, item effects |
| 7 | PuzzleService | server | Builder | keys, locks, codes |
| 8 | ReviveService | server | Builder | downed state, revives, revive tokens |
| 9 | PlayerData | server | Builder | currency, badges, bestiary, settings |
| 10 | FearController | client | Builder, Librarian | flickers, scares, captions, heartbeat, all at the player's intensity setting |
| 11 | AudioController | client | Librarian | ambience layers, warning sounds, music states |
| 12 | HudController | client | Frame | hotbar, stamina, captions, death screen, bestiary |
| 13 | ReceiptService | server | Merchant | revives and cosmetics |

### Folder layout

```
ServerStorage/
  Rooms/<Floor>/<RoomTemplate> (Model, PrimaryPart = Entrance, child part Exit, tagged spawn points)
  Entities/<EntityName> (Model)
ServerScriptService/Services/ RunService, RoomGenerator, EntityDirector, Entities/*, HideService, ItemService,
                             PuzzleService, ReviveService, PlayerData, ReceiptService
ReplicatedStorage/
  Shared/Config/ Entities (warning times, speeds, counters), Items, Floors, Pacing
  Remotes/ EntityWarning, EntityPath, Jumpscare, RoomState, Caption (RemoteEvent); Ambient (UnreliableRemoteEvent)
  Assets/Sounds, Assets/VFX (Librarian)
Workspace/
  Lobby/ (Scenic)
  Rooms/ (runtime only)
```

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| BuyRunItem | RemoteEvent | C→S | itemId: string | in lobby, item exists, can afford, run inventory not full | 5, 2 |
| UseItem | RemoteEvent | C→S | slot: number | integer 1-4, item in slot, alive, cooldown | 5, 3 |
| ReadyUp | RemoteEvent | C→S | ready: boolean | in an elevator zone | 4, 1 |
| UseReviveToken | RemoteEvent | C→S | (none) | dead in a run, owns a token, ≤1 revive used this run | 2, 0.2 |
| EntityWarning | RemoteEvent | S→C | entityId, roomNumbers, leadTime | — | n/a |
| EntityPath | RemoteEvent | S→C | entityId, points, startTime, speed | — | n/a |
| Jumpscare | RemoteEvent | S→C | entityId | sent only to the player who died | n/a |
| Caption | RemoteEvent | S→C | text, direction | — | n/a |
| Ambient | UnreliableRemoteEvent | S→C | soundId, position | cosmetic | n/a |

Hiding, pickups, doors and revives don't need custom remotes: `ProximityPrompt.Triggered` fires on the server with the player [3][4]. Fewer remotes means less to secure. Warnings are gameplay-critical, so they go on reliable RemoteEvents; only cosmetic ambience uses the UnreliableRemoteEvent [12][27].

### Data schema

```lua
--!strict
export type HorrorData = {
	version: number,
	currency: number,
	bestRoom: { [string]: number },           -- per floor id
	clears: { [string]: number },
	bestiary: { [string]: { met: boolean, survived: number, deaths: number } },
	badges: { [string]: boolean },
	reviveTokens: number,
	lastFreeToken: number,                    -- server day index
	cosmetics: { [string]: boolean },
	equipped: { character: string?, flashlight: string? },
	settings: { intensity: string, reduceFlashing: boolean, captions: boolean, brightness: number },
	runsPlayed: number,
}
```

`intensity` is `"Full"`, `"Reduced"` or `"Off"`. This studio defaults to `"Full"` with a first-join notice pointing to the setting, and Kid Tester checks the Reduced and Off paths on every build.

### Room generation

```lua
--!strict
-- ServerScriptService.Services.RoomGenerator (excerpt)
local ServerStorage = game:GetService("ServerStorage")

local RoomGenerator = {}

local function overlapsExisting(cf: CFrame, size: Vector3): boolean
	local params = OverlapParams.new()
	params.FilterType = Enum.RaycastFilterType.Include
	params.FilterDescendantsInstances = { workspace.Rooms }
	-- shrink by 2 studs so rooms that only touch at the doorway don't count
	local parts = workspace:GetPartBoundsInBox(cf, size - Vector3.new(2, 2, 2), params)
	return #parts > 0
end

function RoomGenerator.placeNext(floor: Folder, prevExit: BasePart, rng: Random, number: number): Model?
	local templates = floor:GetChildren()
	for _ = 1, 6 do
		local template = templates[rng:NextInteger(1, #templates)] :: Model
		local room = template:Clone()
		room:PivotTo(prevExit.CFrame) -- the PrimaryPart (Entrance) lands on the previous Exit
		local cf, size = room:GetBoundingBox()
		if not overlapsExisting(cf, size) then
			room:SetAttribute("Number", number)
			room.Name = "Room" .. number
			room.Parent = workspace.Rooms -- parent last
			return room
		end
		room:Destroy()
	end
	return nil -- caller falls back to a straight corridor template that always fits
end

return RoomGenerator
```

- Each template's `PrimaryPart` is a thin, invisible, non-colliding `Entrance` part at the doorway, facing into the room. The `Exit` part sits at the far doorway facing out, with the same orientation convention, so `PivotTo(prevExit.CFrame)` chains rooms. The spatial query uses `GetPartBoundsInBox` from the WorldRoot API [2][9].
- Seed each run with `Random.new(seed)` and store the seed, so a bug report can reproduce the exact run.
- Keep a guaranteed-fit corridor template for when 6 attempts fail.
- Place hiding spots, chests and items from tagged spawn points inside the template (CollectionService tags such as `HideSpot`, `ChestSpot`), chosen with the same seeded `Random`.

### A sweep entity (hide-to-survive)

The server decides who dies. Clients animate the entity locally from the path and start time, which looks smoother than replicating a fast-moving part.

```lua
--!strict
-- ServerScriptService.Services.Entities.Sweeper (excerpt)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = ReplicatedStorage.Remotes

local SPEED = 80          -- studs per second
local LEAD = 4            -- seconds of warning before it enters the first room
local KILL_RADIUS = 70    -- studs; beyond this the entity can't see you

local function exposed(position: Vector3, player: Player): boolean
	local character = player.Character
	local head = character and character:FindFirstChild("Head") :: BasePart?
	local hum = character and character:FindFirstChildOfClass("Humanoid")
	if not head or not hum or hum.Health <= 0 or character:GetAttribute("Hiding") then
		return false
	end
	local offset = head.Position - position
	if offset.Magnitude > KILL_RADIUS then
		return false
	end
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	local ignore = {}
	for _, p in Players:GetPlayers() do
		if p.Character then
			table.insert(ignore, p.Character)
		end
	end
	params.FilterDescendantsInstances = ignore
	return workspace:Raycast(position, offset, params) == nil -- nothing between entity and head
end

local function run(points: { Vector3 }, roomNumbers: { number })
	Remotes.EntityWarning:FireAllClients("Sweeper", roomNumbers, LEAD)
	Remotes.Caption:FireAllClients("[rumbling grows louder]", nil)
	task.wait(LEAD)
	local startTime = workspace:GetServerTimeNow()
	Remotes.EntityPath:FireAllClients("Sweeper", points, startTime, SPEED)
	for i = 1, #points - 1 do
		local a, b = points[i], points[i + 1]
		local length = (b - a).Magnitude
		local travelled = 0
		while travelled < length do
			travelled = math.min(travelled + SPEED * task.wait(0.05), length)
			local position = a:Lerp(b, travelled / length)
			for _, player in Players:GetPlayers() do
				if exposed(position, player) then
					local hum = (player.Character :: Model):FindFirstChildOfClass("Humanoid") :: Humanoid
					Remotes.Jumpscare:FireClient(player, "Sweeper")
					hum:TakeDamage(hum.MaxHealth) -- a revive ForceField blocks this, as intended
				end
			end
		end
	end
end
```

- The kill check uses a raycast for line of sight [1]. For a wider "sees you around corners a little" feel, use a short `Spherecast` along the path instead [21]. Commenters on the announcement thread flagged a correction to its sample (read the hit's `Distance`, not `Direction`) [21][24].
- The first time each player meets the Sweeper (bestiary `met == false`), skip them in `exposed` and send a caption "Hide!" with the nearest `HideSpot` highlighted (rule 12).
- The client's FearController flickers only local copies of the room lights' `Enabled` property, at no more than 3 changes per second, or dims them slowly if Reduce flashing is on.

### A chaser entity (outrun-to-survive)

```lua
--!strict
-- excerpt: one chase step, called every 0.25 s by the entity's loop
local PathfindingService = game:GetService("PathfindingService")

local path = PathfindingService:CreatePath({ AgentRadius = 2.5, AgentHeight = 7, AgentCanJump = false })

local function chaseStep(hum: Humanoid, root: BasePart, target: BasePart)
	local ok = pcall(function()
		path:ComputeAsync(root.Position, target.Position)
	end)
	if ok and path.Status == Enum.PathStatus.Success then
		local waypoints = path:GetWaypoints()
		local nextPoint = waypoints[math.min(2, #waypoints)]
		hum:MoveTo(nextPoint.Position)
	else
		hum:MoveTo(target.Position) -- fall back to a direct line
	end
end
```

- `CreatePath` takes agent parameters, and `ComputeAsync` with a `Status` check and `GetWaypoints` is the documented pattern; AgentRadius and AgentHeight default to 2 and 5, so set them to the chaser's real size [17]. Connect the path's `Blocked` event to recompute when a door closes [17]. A DevForum thread notes some newer agent parameters are poorly documented [18].
- Chasers are server-owned: call `SetNetworkOwner(nil)` on the root after parenting into Workspace, so no client can move them. The server can't verify physics a client owns [5].
- Speed 17-19 studs/s (section 5). Scripted chase sequences use a fixed route of waypoints instead of pathfinding, with obstacles that slow the chaser by 30% for 1 s when it hits them.
- Put the chaser's parts in a collision group that doesn't collide with doors' open-state hitboxes so it never gets stuck on a door frame [6][7].

### Hiding with a ProximityPrompt

```lua
--!strict
-- ServerScriptService.Services.HideService (excerpt): one prompt per HideSpot
local CollectionService = game:GetService("CollectionService")

local HIDE_WARN = 15
local HIDE_MAX = 25

local function setup(spot: BasePart)
	local inside = spot:FindFirstChild("Inside") :: Attachment
	local outside = spot:FindFirstChild("Outside") :: Attachment
	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = "Hide"
	prompt.HoldDuration = 0          -- instant: hiding must never fail in a panic
	prompt.MaxActivationDistance = 8
	prompt.RequiresLineOfSight = false
	prompt.Parent = spot             -- parent last

	local occupant: Player? = nil
	local token = 0 -- increases on every hide, so old timers can tell they're stale

	local function leave(player: Player)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
		occupant = nil
		prompt.ActionText = "Hide"
		if character and root then
			character:SetAttribute("Hiding", false)
			character:PivotTo(outside.WorldCFrame)
			root.Anchored = false
		end
	end

	prompt.Triggered:Connect(function(player)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
		if not character or not root then
			return
		end
		if occupant == nil and not character:GetAttribute("Hiding") then
			occupant = player
			character:SetAttribute("Hiding", true)
			root.Anchored = true
			character:PivotTo(inside.WorldCFrame)
			prompt.ActionText = "Leave"
			token += 1
			local myToken = token
			task.delay(HIDE_WARN, function()
				if occupant == player and token == myToken then
					-- send a Caption to this player: "[something knocks on the door]"
				end
			end)
			task.delay(HIDE_MAX, function()
				if occupant == player and token == myToken then
					leave(player) -- forced out
				end
			end)
		elseif occupant == player then
			leave(player)
		end
	end)
end

for _, spot in CollectionService:GetTagged("HideSpot") do
	setup(spot :: BasePart)
end
CollectionService:GetInstanceAddedSignal("HideSpot"):Connect(function(spot)
	setup(spot :: BasePart)
end)
```

`HoldDuration = 0` makes the prompt trigger immediately; non-zero durations show a progress bar and are right for revives and puzzles, not for hiding [3]. Clear the occupant when the player leaves the game or dies.

### Jump scare on the client, at the player's setting

```lua
--!strict
-- StarterPlayerScripts.Controllers.FearController (excerpt)
local TweenService = game:GetService("TweenService")

local function jumpscare(gui: ScreenGui, image: ImageLabel, sting: Sound, intensity: string)
	if intensity == "Off" then
		-- fade to black and a soft thud only
		return
	end
	image.Visible = true
	image.Size = UDim2.fromScale(0.8, 0.8)
	if intensity == "Full" then
		sting.Volume = 0.9 -- never above 1.0
		sting:Play()
	end
	local grow = TweenService:Create(image, TweenInfo.new(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Size = UDim2.fromScale(1.2, 1.2) })
	grow:Play()
	task.delay(1.0, function() -- total on-screen time ≤ 1.2 s
		image.Visible = false
	end)
end
```

Camera shake during a scare stays small (under 0.3 studs, under 0.4 s); game-feel guides recommend keeping shake subtle and using effects in small doses [25][26].

## 12. Twists that work

40. **Pick one twist and put it in the thumbnail.** Horror thumbnails sell a threat and a place; the twist should be visible in one of them.

- **Comedy horror.** Silly monsters (a giant rubber duck, a haunted vending machine) with real tension. Great for the youngest players and very clip-friendly.
- **Daytime horror.** A bright, cheerful place that's wrong in small ways (a theme park with no people). Uncanny without darkness, and easier on phones.
- **Horror plus puzzle.** Every room is a short puzzle under time pressure. Bridges to [[Genre - Story and Puzzle]].
- **Roles in co-op.** One player holds the only light, one reads the map, one carries the key. Forces teamwork.
- **Kids as the monster.** Asymmetric mode where the monster is a playful player (tag-style). Lower fear, high fun.
- **Horror sandbox.** Build a base by day, survive by night (the 3008 pattern, unverified). Bridges to [[Genre - Survival]].
- **The house changes.** The same small map rearranges every run (rooms swap places). Cheap content with high replay value.
- **Trap rooms.** Beam or laser hazards that hurt on contact, built the way Roblox's laser-trap tutorial builds beam collision boxes [8]. A change of pace between entity encounters.
- **Sound-only entity.** You can't see it; you can only hear it, with captions and a direction icon for accessibility (fear rule 7).
- **Investigation with a twist.** Identify which of your friends is the monster (social deduction). See [[Genre - Party and Social Hangout]].

## 13. Failure modes

41. **Cheap deaths.** Threats without warnings, or warnings that change. Fix: rules 12-14.
42. **Too dark to play.** Fix: rule 16 and section 8's ambient minimums; test on a phone at 50% brightness.
43. **Scare spam.** Jump scares every minute until they mean nothing. Fix: fear rule 3 and the tension curve.
44. **Wrong for the audience.** Gore or cruelty gets the game a mature label, angry parents, or a moderation strike. Fix: fear rules 1 and 2.
45. **One-and-done.** A single linear chapter with no reason to replay. Fix: procedural rooms, badges, hard mode, daily modifiers.
46. **Lonely deaths.** Dead players sit on a black screen for minutes. Fix: spectate with pings, revives, short respawns.
47. **Repetitive rooms.** Too few templates. Fix: 20-30 per floor and prop sets (rule 27).
48. **Content drought.** Players learn every entity and the fear fades. Fix: section 10's cadence.
49. **Inaccessible warnings.** Sound-only cues on a muted phone. Fix: fear rule 7.
50. **Photosensitivity risk.** Fast strobing lights. Fix: fear rule 5 and the Reduce flashing setting.
51. **Pay to survive.** Invincibility for Robux. Fix: section 6.
52. **Stuck chasers.** Monsters snagged on doors or furniture. Fix: collision groups, agent sizes, fallback MoveTo.

## 14. Pitch checklist: is this genre right for us right now?

Fewer than 9 yes answers means rethink.

1. Do we have 3-5 original entities, each with a distinct warning, counter and silhouette?
2. Is the theme scary without gore (passes fear rule 1)?
3. Can Librarian deliver the sound design: ambience layers, a signature sound per entity, stings, footsteps?
4. Can Scenic build 20-30 room templates per floor with a lighting language (rule 21)?
5. Is co-op for 1-4 in the plan, with revive and spectate?
6. Is there a reason to replay (procedural rooms, badges, hard mode)?
7. Can we ship a new entity every 2-3 weeks and a new floor every 6-12 weeks?
8. Does the plan include the intensity setting, captions and Reduce flashing?
9. Does Kid Tester say the first five minutes are scary but fun, not upsetting?
10. Is there a twist a player can see in the thumbnail?
11. Is the monetization free of "pay to survive"?
12. Does it run at 30+ FPS on the test phone in the darkest room with 4 players?

## Checklist

- [ ] No threat can hurt the player in the first 2 minutes of their first session.
- [ ] Every lethal threat warns at least 2 s ahead through two channels.
- [ ] Each entity's first encounter per player is survivable and shows the counter.
- [ ] Death screen names the entity and gives one tip; return to play or spectate within 5 s.
- [ ] Jump scares last ≤ 1.2 s; no sound above Volume 1.0.
- [ ] No light flicker faster than 3 changes per second; Reduce flashing replaces flicker with a slow dim.
- [ ] Scare intensity setting (Full / Reduced / Off) works and saves.
- [ ] Captions show for every warning sound, with a direction icon.
- [ ] Walls, doors and hiding spots are visible at 15 studs without a flashlight.
- [ ] Every room on a hide-counter floor has a hiding spot within 15 studs of its center.
- [ ] Hiding is one tap (`HoldDuration = 0`); revives take 3 s.
- [ ] Hide limit: warning at 15 s, forced out at 25 s.
- [ ] Chaser speed is between player walk and sprint; chasers are server-owned.
- [ ] Rooms are generated from a stored seed; only 4-6 rooms exist at once.
- [ ] The server decides every death; clients only animate entities.
- [ ] No custom remotes for hiding or pickups (ProximityPrompt.Triggered on the server).
- [ ] Lobby is bright and calm; safe rooms use warm light.
- [ ] No gore, cruelty or real-world tragedy anywhere (Kid Tester and Reviewer sign off).
- [ ] No purchase prompts on the death screen or in a chase.
- [ ] The store page says it's a horror game and mentions the intensity setting.
- [ ] 4 players in the darkest room at 30+ FPS on the test phone.

## Common mistakes

1. Killing players with a threat they couldn't see or hear coming.
2. Changing an entity's warning between areas without telling the player.
3. Pitch-black rooms that hide the warnings.
4. Jump scares in the first minute.
5. Scare sounds above Volume 1.0 or strobing lights.
6. Gore and cruelty for a young audience.
7. Hiding behind a hold prompt that fails in a panic.
8. Moving a fast entity by replicating its part every frame instead of letting clients animate from a path [12].
9. Client-side kill checks that an exploiter can skip.
10. Chasers owned by a nearby client [5].
11. A single long chapter with no replay reason.
12. Dead players with nothing to do.
13. Sound-only warnings with no captions.
14. Too few room templates, so runs repeat in 10 minutes.
15. Selling invincibility or entity immunity.
16. Flicker used as decoration, so it stops meaning danger.
17. Chasers faster than sprint, so they can't be outrun.
18. No seed stored for generated runs, so bugs can't be reproduced.
19. Leaving old rooms in Workspace until the server lags.
20. Testing scares only on PC with headphones, never on a phone speaker.

## References

[1] Raycasting (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/raycasting — line-of-sight checks with `Raycast`.
[2] WorldRoot class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/WorldRoot — spatial query methods and OverlapParams.
[3] Proximity prompts (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/ui/proximity-prompts — HoldDuration (0 triggers immediately), hold events, progress bar, Triggered.
[4] Proximity Prompt Release (DevForum) — https://devforum.roblox.com/t/proximity-prompt-release/919991 — the original ProximityPrompt release thread.
[5] Network ownership (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/physics/network-ownership — the server can't verify client-owned physics.
[6] PhysicsService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md — collision groups, edit-time registration, 32-group cap.
[7] Collisions (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/workspace/collisions.md — collision groups in Studio and scripts.
[8] Laser traps with beams (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/vfx/laser-traps-with-beams — beam hazards that damage players, usable as horror traps.
[9] WorldRoot GetPartBoundsInBox (localized reference) — https://create.roblox.com/docs/de-de/reference/engine/classes/WorldRoot — box query signature used for room overlap checks.
[10] Animation events (Roblox Creator Documentation) — https://create.roblox.com/docs/en-us/animation/events — markers and `GetMarkerReachedSignal`, with a footstep example.
[11] KeyframeMarker class reference — https://create.roblox.com/docs/reference/engine/classes/KeyframeMarker — marker signals for timed sounds.
[12] UnreliableRemoteEvent class reference — https://create.roblox.com/docs/ja-jp/reference/engine/classes/UnreliableRemoteEvent — only for non-critical, frequently changing data.
[13] Enemy attacks and telegraphing (Game Developer) — https://gamedeveloper.com/design/enemy-attacks-and-telegraphing — combining animation and audio warnings.
[14] Crafting Legendary Boss Battles (Wayline) — https://www.wayline.io/blog/crafting-legendary-boss-battles — multi-channel, consistent signals.
[15] Elden Ring discussion on telegraphs (Steam Community) — https://steamcommunity.com/app/1245620/discussions/0/3729575504108842499/?l=danish — charge-up versus telegraph.
[16] Artefact development presentation (Staffordshire University) — https://gradex.staffs.ac.uk/wp-content/uploads/2025/05/5480_Artificact-Development-Presentation-Joey.pdf — teaching telegraphs inside the encounter rather than through repeated failure.
[17] PathfindingService class reference — https://create.roblox.com/docs/en-us/reference/engine/classes/PathfindingService.md — CreatePath, agent defaults, ComputeAsync, Blocked.
[18] Pathfinding agents (DevForum) — https://devforum.roblox.com/t/pathfinding-agents/851842 — poorly documented agent parameters.
[19] ContextActionService class reference — https://create.roblox.com/docs/reference/engine/classes/ContextActionService — custom touch buttons recommended.
[20] Mobile input (Roblox Creator Documentation) — https://create.roblox.com/docs/input/mobile — mobile buttons with BindAction.
[21] Introducing Shapecasts (DevForum) — https://devforum.roblox.com/t/introducing-shapecasts/2320655 — swept volume queries for touch interaction and area checks.
[22] ForceField class reference — https://create.roblox.com/docs/reference/engine/classes/ForceField.md — ForceField blocks `TakeDamage` (revive grace).
[23] HumanoidStateType enum reference — https://create.roblox.com/docs/reference/engine/enums/HumanoidStateType — Humanoid states for downed and getting-up behavior.
[24] Shapecasts thread, page 2 (DevForum) — https://devforum.roblox.com/t/introducing-shapecasts/2320655?page=2 — later replies in the shapecasts announcement thread.
[25] Game Feel and Juice, lesson 2 (Wayline) — https://www.wayline.io/learn/game-feel/1 — keep camera shake small; effects in small doses.
[26] Hit feedback primer (uhiyama-lab) — https://uhiyama-lab.com/en/notes/unity/unity-game-feel-hit-feedback/ — shake, flash and sound, and their pitfalls.
[27] UnreliableRemoteEvent:FireAllClients() docs thread (DevForum) — https://devforum.roblox.com/t/unreliableremoteeventfireallclients-still-attempts-invocations-on-non-connected-clients-contrary-to-docs/3852670 — staff clarification of URE behavior.
[28] Blox Fruits vs Sailor Piece (RoWatcher, 2026) — https://rowatcher.com/news/blox-fruits-vs-sailor-piece-which-anime-rpg-is-actually-growing-faster-in-2026 — update cadence and complaints about slow updates.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Story and Puzzle]] · [[Genre - Survival]] · [[Genre - Party and Social Hangout]]
