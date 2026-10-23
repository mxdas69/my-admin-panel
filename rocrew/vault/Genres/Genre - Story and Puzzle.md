---
tags: [vault, genre, story, puzzle, escape-room, adventure, chapters, find-the, narrative]
for: [lead, pulse, architect, builder, scenic, frame, playtest, kid-tester]
also: [librarian, balance, reviewer, merchant, liveops, splash, producer]
---

# Genre - Story and Puzzle

Story and puzzle games give players a journey with a beginning, a middle and an end: a short story game with cutscenes and an ending, a chapter-based escape where a group finds keys and codes while something chases them, a co-op run of rooms with puzzles between scares, an escape room on a timer, a puzzle adventure built on one clever mechanic, or a "find the" game where the puzzle is where things are hidden. Roblox's publishing taxonomy lists Puzzle as its own genre with its own subgenres [1], and story beats show up across genres: obbies like Barry's Prison Run use a prison-escape premise and a named guard to turn a course into a story [2].

These games are **authored content**: every minute of play is something the team designed, so they cost more per hour of play than loop-driven genres. They win because a good story or puzzle creates moments players talk about, replay with friends and wait for (the next chapter). They lose when players get stuck with no help, when the first minutes are a long unskippable cutscene, when one co-op player can ruin the run, or when the content runs out after 20 minutes with nothing to bring players back.

This page gives the chapter structure, puzzle design rules, hint ladders, the co-op rules that stop griefing, the systems (objectives, interactables, puzzles, dialogue, cutscenes, chasers, party teleports) with Luau, and a release cadence built around chapters. Read it before pitching or planning any story, escape, puzzle or "find the" game, and before adding cutscenes, dialogue or puzzles to a game in any other genre. Horror games share most of this page; read [[Genre - Horror]] alongside it for scares.

## 1. What it is and why it works on Roblox

**The audience.** Two overlapping groups. **Story fans** (our design assumption: 9-14, often in groups of 2-4 friends) want suspense, characters, lore and endings to talk about. **Puzzle fans** want the click of solving something and the pride of doing it faster or with fewer hints. Both groups watch and make videos of these games, so moments that look good on video matter.

**Session shape.** Chapter-sized: a chapter of 15-30 minutes is one session; a full game is 2-6 chapters. Escape rooms are 15-25 minutes each. "Find the" games are open-ended: 10-60 minute hunts for collectibles. Design targets for this studio: a first puzzle solved in under 2 minutes, a checkpoint every 3-5 minutes, a chapter of 20 ± 5 minutes, and at least two reasons to replay a chapter (another ending, a collectible, a faster time, a harder mode).

**Why players come back.**
1. **The next chapter.** A cliffhanger and a release date.
2. **Friends who haven't played.** Story games are re-played as the guide for a friend.
3. **Endings and secrets.** Multiple endings, hidden rooms, collectibles, lore notes.
4. **Mastery.** Speedrun times, no-hint runs, hard modes.
5. **Collections.** Find-the games are pure collection; the next find is always one more. Find the Chomiks even labels its finds on a difficulty chart modeled on JToH's [4].

**Why it works on Roblox.** Free co-op, friends, and a young audience that loves suspense and mysteries. ProximityPrompts give every object a consistent "press to interact" language out of the box [5][6]. The platform's horror and escape audience is large, and story beats fit naturally on top of obby, horror and party formats.

## 2. The core loop

**Story chapter loop:**
> Players **explore a scene to find what the story needs** (a key, a code, a person), **solve the obstacle in their way**, and **unlock the next scene and a piece of the story**, so they can **reach the chapter's ending and the cliffhanger**.

**Escape/chase loop (Piggy shape):**
> Players **search a map for items while a chaser hunts them**, **use the items to open the exit route**, and **escape together** to **unlock the next chapter, skins and currency**.

**Co-op room run (Doors shape):**
> Players **move through numbered rooms**, **survive each room's threat and solve its puzzle**, and **go further each run**, spending **run currency on items that help the next attempt**.

**Escape room loop:**
> A team **searches a room for clues**, **combines them into answers**, and **opens locks** against a timer to **escape with a star rating** and **try the next room**.

**Find-the loop:**
> Players **explore to find hidden collectibles**, **earn a badge and an index entry for each**, and **use hints to chase the hard ones**, so they can **complete the collection**.

| Layer | Time scale | Story chapter | Escape room | Find-the |
|---|---|---|---|---|
| Micro | 1-5 s | Interact, read, pick up | Inspect, try a code | Look, climb, grab |
| Short | 1-5 min | One puzzle or scene beat | One lock opened | One find |
| Session | 15-30 min | A chapter and its ending | One room escaped, stars | 10-30 finds, a zone |
| Long | weeks | New chapters, endings, lore | New rooms, best times | New finds each update |

Loop rules:
1. **Clue → deduction → action.** Every puzzle has all three, and the clue is in the same room as the action or one room away.
2. **Every beat pays out story or progress.** A solved puzzle opens something visible, plays a sound and moves the objective tracker.
3. **Failure is cheap.** A wrong code buzzes and locks for 2 s; a death returns you to the last checkpoint (≤ 90 s back).
4. **The objective is always on screen.** One short line, updated within 1 s of a change.

## 3. Top games in the genre

> **Source status.** The research pass for this page hit the session's web-search limit before the game-specific searches. Entries marked **†** describe the game from the crew's general knowledge, with no citation yet. Before you quote any detail from a † entry as fact, verify it in-game or find a source. None of these entries gives player counts, revenue or other numbers, and none should until it is sourced.

### Doors †
**What it does:** A co-op run (solo or small groups) through numbered hotel rooms. Each room can hold a hazard, an entity to react to (hide in a closet, look away, crouch), or a puzzle; a mid-run library puzzle asks players to find books with clues and work out a padlock code. Keys open locked doors, a run currency buys pre-run items, and revives can be bought. Later updates added a second floor.
**Steal:** Numbered rooms as visible progress ("I got to room 70"), entities with readable tells (a sound or light cue before the threat), procedural room order with authored rooms, a puzzle that changes its answer each run while the logic stays fixed.
**Avoid:** Copying its entities, names, hotel or UI. Revives that make the threat pointless.

### Piggy †
**What it does:** A chapter-based escape game: players search a map for items (keys, codes, tools) and use them to open the exit while a chaser (a bot or a player) hunts them. Chapters were released over time and grouped into "books"; skins are the cosmetic layer.
**Steal:** Chapters as release beats; a map you learn by playing; items that must be carried to a specific lock; a player-controlled chaser mode as a party twist.
**Avoid:** Characters that look like someone else's IP; chapters released without testing for softlocks (an item stuck where no one can reach it).

### The Mimic †
**What it does:** A story horror game told in chapters ("books") inspired by Japanese folklore, mixing exploration, puzzles and chases with a strong art direction and lore.
**Steal:** A cultural theme done with care as the identity; lore delivered through the environment and notes; chapter cliffhangers.
**Avoid:** Lore so dense that new players are lost; always keep a one-line objective.

### Break In (Story) †
**What it does:** A short story game: players pick a role with its own item (a kid with a specific tool or food), survive a few days and nights of a home invasion story with fixed scenes, and reach one of several endings.
**Steal:** Role picks with a unique item per role (everyone matters), a fixed story with a few branching choices, multiple endings with badges.
**Avoid:** Scenes that lock 4 players out of play while one player acts.

### Escape Room †
**What it does:** A co-op escape room game with themed rooms (a heist, a lab, a theater), each a set of puzzles and locks under a timer.
**Steal:** Rooms as discrete products (each one an update), team play with split information, star ratings by time.
**Avoid:** Puzzles that need outside knowledge (spelling, maths beyond the target age) without hints.

### Find the Markers and the "find the" family †
**What it does:** Collect-and-find games: hidden items (markers, chomiks and so on) placed across a map, each with a badge and an index entry, from easy-to-spot to deviously hidden. Find the Chomiks rates its finds on a difficulty chart modeled on JToH's [4].
**Steal:** An index with silhouettes for unfound items, a difficulty label per find, hints per find, new finds every update.
**Avoid:** Finds that need exploits or pixel-perfect jumps without a label saying so.

### Barry's Prison Run and the story-escape obby family — sourced
**What it does:** An obby framed as a prison break during a lax guard's shift, with 25 obstacles between the cell and freedom; many versions keep the structure and swap the guard [2].
**Steal:** A one-line premise and a named antagonist; a short fixed length; a story you can retell in one sentence.
**Avoid:** Using someone else's characters; clone families flood the charts and are forgotten. See [[Genre - Obby]].

### Troll obbies (failure as puzzle) — sourced
**What it does:** Courses built on fake platforms, disguised kill parts, fake checkpoints and misleading arrows; players return because each failure works like a puzzle and beating a devious section feels great [3].
**Steal:** "Read the room" puzzles: what looks safe isn't, and the clue is visible to a careful player.
**Avoid:** Tricks with no clue at all. A puzzle without a clue is just a coin flip.

### Flood Escape 2 (co-op button puzzles) — sourced
**What it does:** Round-based maps where players press buttons to open the escape route while water rises; community maps list a difficulty, a button count (for example 7 normal buttons and 1 group button that needs several players) and a star rating [27].
**Steal:** Group buttons as the simplest co-op puzzle; a rising threat as the timer; difficulty and star ratings for every map.
**Avoid:** Group puzzles in a game that's often played solo, unless solo has an alternative.

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-15 s | Cold open: a 10-15 s camera shot that sets the premise in one line of text or dialogue ("The bus broke down. The school is locked. Someone is inside."). | Scriptable camera; skippable after the first view; group-vote skip in co-op. |
| 15-25 s | Control. The objective tracker shows "Find a way into the school". A light draws the eye to the door. | Light, sound and sight line guide [28]. |
| 25-60 s | First interaction: a locked door (prompt "Locked"), then a key on a desk 10 studs away with a soft highlight. Picking it up plays a sound and shows the key in the hotbar. | First puzzle is find-and-use in the same room. |
| 60-120 s | The door opens onto the first real space. A note on the wall (lore + a clue). A second lock that needs the clue. | Clue in view of the lock. |
| 120-180 s | First twist or scare (a sound, lights flicker, a character appears). Objective changes. | One surprise beat in the first 3 minutes. |
| 180-270 s | A puzzle with two steps (combine two clues). Hint button lights up after 60 s stuck. | Hint ladder starts. |
| 270-300 s | Checkpoint: "Progress saved". A short story payoff (a character line, a door to a new area). | First checkpoint ≤ 5 min. |

Opening rules:
1. **Control within 20 s.** A cold open longer than 20 s loses players before they play.
2. **The first puzzle can't fail.** It teaches the interaction, not the logic.
3. **The opening shows the game's best idea.** Players who leave in the first 3-4 minutes in obbies were told the opening wasn't distinctive [19]; the same is true here.
4. **No shop, codes or daily popups in the first 5 minutes.**
5. **Co-op: everyone is doing something.** Two keys in two places, or a lookout and a searcher, not three players watching one.

## 5. Progression and economy

### Chapter structure (targets)
A chapter is 15-25 minutes, built from 5-8 beats of 2-4 minutes each:

| Beat | Minutes | Content |
|---|---|---|
| 1 Hook | 0-2 | Cold open, first interaction |
| 2 Learn | 2-5 | First real puzzle; checkpoint |
| 3 Explore | 5-9 | A hub space with 2-3 parallel puzzles (groups can split) |
| 4 Threat | 9-12 | A chase or a timed section; checkpoint after |
| 5 Twist | 12-15 | A story reveal that changes the objective |
| 6 Climax | 15-19 | The hardest puzzle using the chapter's mechanic in a new way |
| 7 Ending | 19-21 | A payoff, a choice (if branching), a cliffhanger, results |

### Puzzle difficulty curve
Rate every puzzle 1-5 on steps (how many deductions), search (how hidden the clue is) and execution (timing or precision). Total difficulty = steps + search + execution (3-15).

| Chapter position | Target total | Expected solve time (no hints) | Hint ladder starts |
|---|---|---|---|
| First puzzle | 3 | < 30 s | 30 s |
| Early | 4-6 | 30-90 s | 60 s |
| Middle | 6-9 | 1-3 min | 60 s |
| Climax | 9-12 | 2-5 min | 90 s |
| Optional secrets | 10-15 | any | none (secrets are optional) |

A chapter alternates hard and easy puzzles (sawtooth). Playtest records real solve times; any puzzle whose median solve time is 2× its target gets an easier clue or an earlier hint.

### Hint ladder (studio standard)
1. **Nudge** (after the start time): the objective line changes ("The painting looks crooked...").
2. **Direction** (+60 s): a soft highlight on the clue's location.
3. **Answer** (+60 s): the solution step, or an option to skip the puzzle.
Hints are free and timer-based. A hint token product can only make a hint arrive sooner; it never unlocks anything a free player can't get by waiting.

### Escape rooms
4-8 puzzles, 15-25 minutes, a soft timer: finishing late still escapes, with fewer stars. Stars: 3 stars ≤ 70% of the time limit, 2 stars ≤ 100%, 1 star after. Mix linear chains (A opens B) with parallel branches (A, B and C all needed for D) so groups can split up.

### "Find the" games
Launch with 60-150 finds across 3-6 zones, each labeled Easy / Medium / Hard / Insane (JToH-style difficulty labels are familiar to this audience [4]). Index with silhouettes, a hint per find (a picture of the area for Hard and Insane), a badge per find, and zone badges. Add 15-30 finds per update.

### Currency (optional)
Story games don't need a currency. If one exists, it pays per chapter completion (for example 100 for the first clear, 25 for repeats, +50 per new ending, +10 per collectible) and buys cosmetics, chaser skins (for chase games) or pre-run items (for run games), never story progress.

## 6. Monetization that fits

Story and puzzle players pay to **look good** (skins, emotes), **get unstuck** (hints sooner, a puzzle skip), **try again** (a revive in a hard chapter) and **play with friends on their terms** (private servers). Obby creators report that cheap skip products sell well and that expensive boosts at every checkpoint frustrate players [18]; a skip in a puzzle game works like a skip stage, granted through the product pipeline and moving the player past one puzzle [17]. Grant developer products in `ProcessReceipt`, never from `PromptProductPurchaseFinished` [13]; set it in one server script only [14], since a second script setting it can charge without granting [15]; it must be defined for developer-product purchases to complete [16].

Price ladder (targets; the owner sets real prices and creates passes and products):

| Item | Type | Target price | Notes |
|---|---|---|---|
| Skip this puzzle | Developer product | 15-25 R$ | Only after the hint ladder has reached step 2; never on optional secrets |
| Hint now | Developer product | 5-10 R$ | Jumps to the next hint step immediately |
| Revive (hard chapters) | Developer product | 15-29 R$ | Max 1 per chapter; disabled in hard mode and on boards |
| Skin / outfit pack | Game pass | 99-299 R$ | Cosmetic only |
| Chaser skins (chase games) | Game pass | 149-299 R$ | The chaser is just as fast in every skin |
| Supporter pack (badge, name color, extra lobby room) | Game pass | 199-399 R$ | Lets fans fund chapters |
| Private server | Subscription | 100-250 R$/month | For friend groups and creators recording videos |

Off-limits:
1. **No paywalled story chapters or endings** in the main game. Paid *bonus* side stories are allowed only after the main chapters are free.
2. **No answers for sale that free players can't reach** by waiting for hints.
3. **No revives on timed boards or in hard mode.**
4. **No fake countdowns to chapter releases.** A countdown must match the real date.
5. **No random paid boxes without shown odds** ([[03 Rarity and RNG]]).

## 7. UI and HUD for this genre

| Element | Position (UDim2 / AnchorPoint) | Size (offset at 1080p) | Notes |
|---|---|---|---|
| Objective tracker | (0, 16, 0, 72) / (0, 0) | 360×48 | One line, ≤ 40 characters; flashes on change |
| Dialogue box | (0.5, 0, 1, −24) / (0.5, 1) | 900×140 (phone: 92% width) | Speaker name, ≤ 90 characters per line, typewriter at 40 chars/s, tap to finish/advance |
| Key-item hotbar | (0.5, 0, 1, −180) / (0.5, 1) | 5 × 72×72 slots | Shared team items show a team icon |
| Hint button | (1, −16, 0, 72) / (1, 0) | 64×64 | Dims while no hint is ready; a ring fills toward the next hint |
| Interaction prompt | world (ProximityPrompt) | default or custom style | `MaxActivationDistance` 8; `HoldDuration` 0 for pick-up, 0.6 for "Use" on locks |
| Keypad / lock UI | center | 360×480; keys 96×96 | Big keys, clear "wrong" shake and "right" click |
| Note / document viewer | center | 600×800 (phone: 90% height) | Readable font 20+ px, a "close" button 64×64 |
| Chapter select | menu | cards 300×200 | Locked chapters show a lock and the release date if announced |
| Results | center | 600×400 | Time, hints used, collectibles, ending, stars |

Settings: text speed, subtitles on/off, music, SFX, camera shake off, flashing lights off, high-contrast highlights, colorblind-safe mode (shapes on colored clues).

Mobile rules: dialogue advances with a tap anywhere on the dialogue box; keypads use 96×96 buttons; nothing in the thumbstick (bottom-left 300×300 px) or jump (bottom-right 260×260 px) zones, so the hotbar sits above them; documents scroll with a finger, never a mouse wheel ([[08 Mobile]]). Gamepad: every menu button is selectable (`Selectable = true`, sensible `NextSelection*` links, `GuiService.SelectedObject` set when a menu opens) and ProximityPrompts keep their default gamepad key (`GamepadKeyCode`, ButtonX); keypads, dialogue advance and hotbar slots all work with the D-pad and ButtonA.

## 8. World and look

1. **Guide with light, sound and sight lines.** The next objective is lit, framed or audible; landmarks and sight lines guide players toward objectives [28]. A lit door at the end of a dark hall beats an arrow.
2. **Interactables share one visual language.** A subtle outline (a `Highlight` with `FillTransparency = 1`, `OutlineTransparency = 0.4`) within 10 studs, a consistent prompt style, and key items at least 1×1 stud with contrasting colors. No pixel hunts.
3. **Environmental storytelling.** Notes, photos, posters, a broken window, footprints: every room tells part of the story without a cutscene.
4. **Secrets look like secrets.** A crack in a wall, an odd brick, a vent. Ghost (non-collide) blocks make fake walls and hidden passages [29]; give each a tiny visual tell.
5. **Puzzle readability.** Colors and shapes together (a red triangle, not just red); numbers large enough to read at 15 studs; clues that survive low graphics settings.
6. **Lighting sets mood but never hides the objective.** Dark scenes still light the critical path and interactables. Test at the lowest graphics level on a phone.
7. **Scale.** Rooms at least 20×20 studs for co-op (4 players plus the camera), doors 6×9 studs, hallways 10+ studs wide when a chase happens there.
8. **Performance.** Each chapter is its own place or a streamed area; `StreamingEnabled = true`; past areas can be unloaded; keep active NPCs to 1-3.
9. **Original characters and settings only.** Steal structure, never someone's characters, monsters or maps ([[07 Characters, VFX and Assets]]).

## 9. Retention and social

1. **Party lobby.** A lobby with an elevator, bus or door that takes 1-4 players into a private run (a reserved server). Friends join the party with one tap.
2. **Chapter progress and chapter select.** Saved per player; a stage-selector pattern like the obby kits that let players respawn at a chosen stage [10]. Never force a replay of Chapter 1 to play Chapter 3 with a friend: let anyone join a friend's chapter, but only unlock chapters you've finished.
3. **Badges per chapter, per ending and per collectible.** They're visible and cheap.
4. **Endings and secrets.** 2-3 endings per game or chapter, hidden rooms, lore notes, a secret badge.
5. **Speedrun and no-hint boards.** Per-chapter best times, server-timed, stored as integer milliseconds in ordered data stores [20][21]; client `tick()` timing is unreliable [22].
6. **Hard mode** after the first clear: fewer hints, faster chaser, no revives, a badge.
7. **Teasers.** The last scene teases the next chapter; the lobby shows a teaser screen with an honest date or "coming soon".
8. **Video-friendly moments.** One big reveal per chapter that looks good on a thumbnail.
9. **Group perks:** a lobby room or skin for group members.

## 10. Live ops and update cadence

| Cadence | Content |
|---|---|
| Every 4-8 weeks | A new chapter (15-25 minutes), a new escape room, or 15-30 new finds |
| Between chapters (every 2 weeks) | A hard mode, a new ending, a secret, a cosmetic set, a limited event |
| Seasonal | A themed side story or a seasonal version of a chapter (Halloween fits this genre especially well) |
| After each release | A fixes patch within 72 hours for softlocks and sequence breaks |

Rules:
1. **Announce chapters only when they're nearly done.** A missed date costs more than a late announcement.
2. **Release day matters.** Put the chapter number in the title and thumbnail for the release week ([[11 Thumbnails, Icons and the Store Page]]).
3. **Watch the puzzle funnel.** Liveops logs each puzzle's start, solve, hint use and quit. The puzzle where most players quit is next week's fix.
4. **Expect sequence breaks.** Players will skip triggers with physics, the way the Speed Run 4 community found skips that the developers later changed by raising the death plane [30]. Decide per break: keep it (speedrunners love it) or fix it.
5. **Keep old chapters alive.** New players start at Chapter 1; every update should also improve the opening.

## 11. Building it in Studio

### Build order (Chapter 1 in 14 steps)
1. **Architect** writes the premise, the beat sheet (section 5), every puzzle with its clue, deduction, action, difficulty score and hints, and the co-op rules into `plan.md`.
2. **Scenic** greyboxes the chapter in beat order with the critical path lit, before any art.
3. **Builder** writes `PlayerData`, `ChapterService`, `ObjectiveService`, `CheckpointService` and `InteractionService`; **Playtest** walks the greybox start to end with placeholder prompts.
4. **Builder** writes `PuzzleService` and each puzzle module; answers stay on the server.
5. **Builder** writes `HintService` and `InventoryService` (team items that respawn).
6. **Frame** builds the objective tracker, dialogue box, hotbar, keypad, note viewer and hint button.
7. **Kid Tester** plays the first five minutes on a phone; any puzzle over its target time gets a better clue.
8. **Builder** writes `DialogueService`, the cutscene controller and the skip vote; writers fill `Shared/Dialogue`.
9. **Builder** writes `ChaserService` with a tell and hiding spots; **Playtest** checks it can't reach hiding spots or trap players.
10. **Builder** writes `PartyService` (lobby → reserved server) and the chapter-unlock check.
11. **Scenic** dresses the chapter: lighting, environmental storytelling, secrets with tells.
12. **Merchant** wires skip, hint, revive and cosmetics through `ProcessReceipt`.
13. **Reviewer** searches for leaked answers, forges puzzle inputs, tests softlocks (leave with the key, drop items out of the map).
14. **Producer** runs the section 15 checklist; Playtest's log shows every puzzle solved and every ending reached.

### Systems list
1. **PlayerData**: chapters finished, endings, collectibles, best times, currency, cosmetics.
2. **PartyService**: lobby parties, reserved-server teleports, teleport data.
3. **ChapterService**: loads the chapter, tracks beats and checkpoints, handles results.
4. **ObjectiveService**: the current objective line per team; fires updates.
5. **InteractionService**: ProximityPrompts on every interactable, bound by tag.
6. **InventoryService**: team key items (shared), drop on leave.
7. **PuzzleService**: one server-side state machine per puzzle; answers never leave the server.
8. **HintService**: timers per puzzle per team.
9. **DialogueService** (server sends lines) and **DialogueController** (client typewriter).
10. **CutsceneController** (client camera) with a server signal to start and a skip vote.
11. **ChaserService**: NPC pathfinding, tells, catch handling.
12. **CheckpointService**: chapter checkpoints, respawn at the latest.
13. **EndingService**: branching choices, ending badges.
14. **ProductService** (Merchant): skips, hints, revives.

### Architecture
```
ReplicatedStorage/
  Shared/Config             chapter list, hint timings, prices (ids), puzzle ids
  Shared/Dialogue           dialogue scripts (lines, speakers) per chapter
  Remotes/                  Objective, Dialogue, Cutscene, PuzzleInput, PuzzleResult, Hint,
                            SkipVote, Inventory, Results
ServerScriptService/Main + Services/
  PartyService, ChapterService, ObjectiveService, InteractionService, InventoryService,
  PuzzleService, HintService, DialogueService, ChaserService, CheckpointService,
  EndingService, ProductService
  Puzzles/                  one ModuleScript per puzzle (state machine)
ServerStorage/
  Chapters/Chapter1 ...     chapter Models (if one place) or per-place content
  Items/                    key item models
Workspace/Map/              the current chapter's geometry (Scenic)
StarterPlayer/StarterPlayerScripts/Controllers/
  ObjectiveController, DialogueController, CutsceneController, HotbarController,
  HintController, KeypadController
```
Interactables are tagged (`Interactable`) with attributes (`Action = "PickUp" | "Use" | "Read"`, `ItemId`, `RequiresItem`, `PuzzleId`) and bound by one function per tag, the same CollectionService pattern used for obby kill parts [31]. ProximityPrompts show based on distance, line of sight (on by default) and exclusivity, and you can listen per prompt or through ProximityPromptService [5][6].

Checkpoints follow the obby rules: progress lives on the server (client-held progress is exploitable) [11], checkpoints only advance in order [9], respawns hook `CharacterAdded` [12], and progress saves across sessions [9]. SpawnLocations with team changes work for a few checkpoints [7], but a respawn point set per player scales better [8].

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit |
|---|---|---|---|---|---|
| Objective | RemoteEvent | S→C | text, id | — | — |
| Dialogue | RemoteEvent | S→C | speaker, line, lineId | — | — |
| Cutscene | RemoteEvent | S→C | cutsceneId, skippable | — | — |
| SkipVote | RemoteEvent | C→S | cutsceneId | cutscene active; seen before by this player | 1 per s |
| PuzzleInput | RemoteEvent | C→S | puzzleId, input | puzzle active for this team; player within 12 studs; input type/length valid; not locked out | 3 per s |
| PuzzleResult | RemoteEvent | S→C | puzzleId, ok, feedback | — | — |
| Hint | RemoteEvent | S→C | puzzleId, step, text | — | — |
| Inventory | RemoteEvent | S→C | items | — | — |
| ChooseEnding | RemoteEvent | C→S | choiceId | choice active; one per player; majority decides | 1 per s |

Answers, codes and the correct order of anything never replicate to clients. The client sends inputs; the server says right or wrong.

### Data schema
```lua
-- PlayerData v1, key "u_<UserId>"
{
	v = 1,
	chapters = {
		-- [1] = { done = true, bestMs = 1084000, endings = { A = true }, hintsLowest = 2 }
	},
	resume = { chapter = 2, checkpoint = 3 },  -- solo resume point
	collectibles = {},                          -- [id] = true
	finds = {},                                 -- find-the games: [findId] = os.time()
	coins = 0,
	owned = {}, equipped = {},
	settings = { textSpeed = 40, subtitles = true, shake = true, flashes = true },
	receipts = {},
}
-- Ordered stores per chapter: "Ch1_Times_S1" (ms, ascending)
```
Wrap all data-store calls in `pcall` [23][24].

### Luau: a server-side code puzzle
```lua
--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = ReplicatedStorage.Remotes

type Puzzle = {
	id: string,
	answer: string,
	lockUntil: number,
	solved: boolean,
	panel: BasePart,
	onSolved: () -> (),
}

local puzzles: { [string]: Puzzle } = {}

local function newCodePuzzle(id: string, panel: BasePart, digits: number, onSolved: () -> ()): Puzzle
	local rng = Random.new()
	local answer = ""
	for _ = 1, digits do answer ..= tostring(rng:NextInteger(0, 9)) end -- new code every run
	local p: Puzzle = { id = id, answer = answer, lockUntil = 0, solved = false, panel = panel, onSolved = onSolved }
	puzzles[id] = p
	return p
end

Remotes.PuzzleInput.OnServerEvent:Connect(function(player: Player, puzzleId: unknown, input: unknown)
	if typeof(puzzleId) ~= "string" or typeof(input) ~= "string" then return end
	local p = puzzles[puzzleId]
	if not p or p.solved then return end
	if #input ~= #p.answer or not input:match("^%d+$") then return end
	local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root or (root.Position - p.panel.Position).Magnitude > 12 then return end
	local now = os.clock()
	if now < p.lockUntil then return end
	if input == p.answer then
		p.solved = true
		Remotes.PuzzleResult:FireAllClients(p.id, true, "")
		p.onSolved()
	else
		p.lockUntil = now + 2 -- 2 s lockout after a wrong try
		Remotes.PuzzleResult:FireClient(player, p.id, false, "Wrong code")
	end
end)
```
The clues in the world (a clock showing 4:17, a calendar circled on the 9th) are generated from `p.answer` on the server when the chapter loads, so the answer changes every run while the logic stays the same. In a co-op chapter, each reserved server has its own puzzle table.

### Luau: an interactable that needs a key item (server)
```lua
--!strict
local CollectionService = game:GetService("CollectionService")
local InventoryService = require(script.Parent.InventoryService)
local ObjectiveService = require(script.Parent.ObjectiveService)

local function bindLock(inst: Instance)
	local prompt = inst:FindFirstChildWhichIsA("ProximityPrompt", true)
	if not prompt then return end
	prompt.HoldDuration = 0.6
	prompt.MaxActivationDistance = 8
	prompt.RequiresLineOfSight = true
	prompt.Triggered:Connect(function(player: Player)
		if inst:GetAttribute("Open") then return end
		local need = inst:GetAttribute("RequiresItem")
		if typeof(need) == "string" and not InventoryService.teamHas(player, need) then
			prompt.ObjectText = "Locked"
			return
		end
		if typeof(need) == "string" then
			InventoryService.consume(player, need)
		end
		inst:SetAttribute("Open", true)
		prompt.Enabled = false
		ObjectiveService.advance(player, inst:GetAttribute("NextObjective"))
		-- the door's opening animation listens to the "Open" attribute
	end)
end

for _, inst in CollectionService:GetTagged("Lock") do bindLock(inst) end
CollectionService:GetInstanceAddedSignal("Lock"):Connect(bindLock)
```
Key items belong to the team, not the player who picked them up: if that player leaves, the item reappears where it was picked up. That one rule prevents most co-op softlocks and griefing.

### Luau: the hint ladder (server)
```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = ReplicatedStorage.Remotes

type HintDef = { startAfter: number, steps: { string } } -- steps[1] nudge, [2] direction, [3] answer

local function runHints(puzzleId: string, def: HintDef, isSolved: () -> boolean)
	task.spawn(function()
		local waitTime = def.startAfter
		for step, text in def.steps do
			local t = 0
			while t < waitTime do
				if isSolved() then return end
				t += task.wait(1)
			end
			Remotes.Hint:FireAllClients(puzzleId, step, text)
			waitTime = 60
		end
	end)
end
```
"Hint now" (the product) fires the next step at once and resets the wait. Hints fire to the whole team; the hint button shows a ring that fills toward the next step.

### Luau: a cutscene camera (client)
```lua
--!strict
local TweenService = game:GetService("TweenService")
local camera = workspace.CurrentCamera

local function playCutscene(shots: { { cframe: CFrame, duration: number } }, onDone: () -> ())
	camera.CameraType = Enum.CameraType.Scriptable
	local cancelled = false
	task.spawn(function()
		for _, shot in shots do
			if cancelled then break end
			local tween = TweenService:Create(camera, TweenInfo.new(shot.duration, Enum.EasingStyle.Sine), { CFrame = shot.cframe })
			tween:Play()
			tween.Completed:Wait()
		end
		camera.CameraType = Enum.CameraType.Custom
		onDone()
	end)
	return function() cancelled = true end -- call to skip after the current shot
end
```
Shot CFrames come from invisible, anchored camera-marker parts in the map (`CutsceneMarkers/Intro_1`, `_2` ...) so Scenic can adjust them without code. Keep every cutscene ≤ 30 s and all cutscenes ≤ 15% of a chapter's length. Freeze player input during a cutscene by anchoring the character on the server or disabling controls on the client, and always restore the camera even if the cutscene errors.

### Luau: dialogue typewriter (client)
```lua
--!strict
local function typeLine(label: TextLabel, text: string, charsPerSecond: number, skip: () -> boolean)
	label.Text = text
	label.MaxVisibleGraphemes = 0
	local total = utf8.len(text) or #text
	local shown, acc = 0, 0
	while shown < total do
		if skip() then break end
		acc += charsPerSecond * task.wait()
		local add = math.floor(acc)
		if add > 0 then
			acc -= add
			shown = math.min(total, shown + add)
			label.MaxVisibleGraphemes = shown
		end
	end
	label.MaxVisibleGraphemes = -1 -- show everything
end
```
Dialogue scripts live in `Shared/Dialogue` as data (speaker, line, optional choice ids), so writers change words without touching code. Lines are ≤ 90 characters; phones show at most two lines.

### Luau: a chaser NPC (server)
```lua
--!strict
local PathfindingService = game:GetService("PathfindingService")
local Players = game:GetService("Players")

local function nearestPlayer(from: Vector3): (Player?, BasePart?)
	local best: Player?, bestRoot: BasePart?, bestDist = nil, nil, math.huge
	for _, p in Players:GetPlayers() do
		local root = p.Character and p.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
		local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
		if root and hum and hum.Health > 0 and not p:GetAttribute("Hidden") then
			local d = (root.Position - from).Magnitude
			if d < bestDist then best, bestRoot, bestDist = p, root, d end
		end
	end
	return best, bestRoot
end

local function runChaser(npc: Model)
	local humanoid = npc:FindFirstChildOfClass("Humanoid") :: Humanoid
	local root = npc:FindFirstChild("HumanoidRootPart") :: BasePart
	root:SetNetworkOwner(nil)
	humanoid.WalkSpeed = 14 -- slower than players (16) so escapes are possible
	local path = PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = false })
	task.spawn(function()
		while npc.Parent and humanoid.Health > 0 do
			local _, target = nearestPlayer(root.Position)
			if target then
				local ok = pcall(function() path:ComputeAsync(root.Position, target.Position) end)
				if ok and path.Status == Enum.PathStatus.Success then
					local waypoints = path:GetWaypoints()
					-- walk a few waypoints, then re-plan toward the moving target
					for i = 2, math.min(#waypoints, 5) do
						humanoid:MoveTo(waypoints[i].Position)
						humanoid.MoveToFinished:Wait()
					end
				else
					humanoid:MoveTo(target.Position)
					task.wait(0.5)
				end
			else
				task.wait(0.5) -- everyone hidden: wander or wait
			end
		end
	end)
end
```
Give the chaser a tell (a sound within 40 studs, a light flicker) 1-2 s before it can catch anyone, hiding spots that set the `Hidden` attribute on the server when a player enters them, and catch handling that sends the player to the last checkpoint rather than ending the run in the first chapter.

### Luau: party teleport to a private run (server)
```lua
--!strict
local TeleportService = game:GetService("TeleportService")

local CHAPTER_PLACE_ID = 0 -- the chapter place id (owner provides)

local function startRun(party: { Player }, chapter: number)
	local options = Instance.new("TeleportOptions")
	options.ShouldReserveServer = true
	options:SetTeleportData({ chapter = chapter })
	local ok, err = pcall(function()
		TeleportService:TeleportAsync(CHAPTER_PLACE_ID, party, options)
	end)
	if not ok then
		warn("Teleport failed", err) -- show "Try again" in the lobby UI
	end
end
```
In the chapter place, read `player:GetJoinData().TeleportData` for the chapter number, but treat it as untrusted: check the player's saved progress before loading a chapter they haven't unlocked. Moving platforms and puzzle mechanisms that players stand on must be physics-driven; tweened anchored parts don't carry characters [25][26].

## 12. Twists that work

1. **Story + obby.** A premise, an antagonist and 20-30 obstacles, the Barry's Prison Run shape [2]. See [[Genre - Obby]].
2. **Story + party.** One player is the chaser, the rest escape: a story map reused as a round-based mode. See [[Genre - Party and Social Hangout]].
3. **Puzzle + rising threat.** Water or darkness rises while the team solves buttons and codes, like FE2's group buttons [27].
4. **Split-information co-op.** One player sees the clue, another the lock; they communicate by chat or a simple ping system (point at things), so it works for players without chat.
5. **Troll-as-puzzle.** Every fake platform or fake wall has a tell a careful player can spot [3][29].
6. **Procedural rooms, authored puzzles.** Random room order with authored rooms keeps runs fresh (the Doors pattern).
7. **Branching endings with a group vote.** The group votes on a choice; majority decides; every ending has a badge.
8. **Find-the + story.** Each find unlocks a lore note; the full index reveals the secret ending.
9. **One mechanic, explored deeply.** A gravity switch, a time rewind, a portal gun, a shrink ray: introduce, develop, twist across a chapter.
10. **Escape room UGC.** Let players build rooms from a kit and rate them (with moderation), the way FE2 rates community maps [27].
11. **Seasonal side stories.** A 10-minute Halloween or winter story between chapters.

## 13. Failure modes

1. **Stuck players.** No hints, so players quit at the first hard puzzle. Fix: the hint ladder.
2. **Pixel hunts.** Tiny, unhighlighted key items. Fix: highlights within 10 studs, minimum sizes.
3. **Long unskippable cutscenes.** Fix: ≤ 30 s each, skippable after the first view, group skip vote.
4. **A boring or generic opening** [19].
5. **Co-op softlocks.** A player leaves with the key, an item falls out of the map, a door closes with one player outside. Fix: team items that respawn, kill-plane recovery for items, doors that wait for everyone or teleport stragglers.
6. **Griefing in co-op.** One player triggers the chase early or locks others out. Fix: triggers that need the group (or a vote), no player-controlled locks.
7. **Answers on the client.** Exploiters read the code from a LocalScript or a replicated value. Fix: answers stay on the server.
8. **Content burn.** Players finish in 20 minutes and never return. Fix: endings, secrets, hard mode, boards, chapter cadence.
9. **Sequence breaks** that skip triggers and break the story [30]. Fix: triggers that check the objective state, not just a touch.
10. **Dark scenes** where phones on low graphics see nothing.
11. **Puzzles needing reading or maths** above the audience's level, with no icon-based alternative.
12. **Scares too intense** for the audience; follow Roblox's content maturity guidance and label the experience honestly.
13. **Release dates missed.** Fix: announce late, release when ready.
14. **Untested chapters.** DevForum's first obby tip is to playtest every stage until you know it can be beaten [18]; Playtest must solve every puzzle and finish every ending before release.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] We can tell the premise in one sentence with an original antagonist, setting or mystery.
- [ ] We can ship Chapter 1 (20 minutes, 6+ puzzles, 1 chase or threat, an ending) and have Chapter 2 planned.
- [ ] We have a replay plan: endings, secrets, hard mode, boards or finds.
- [ ] Co-op is designed in (everyone busy, team items, group triggers), or the game is clearly solo.
- [ ] We can keep a 4-8 week chapter cadence (or 2-week finds) for 3 releases.
- [ ] The tone fits the audience; Reviewer has checked the content maturity level.
- [ ] Market check (Pulse): which story or puzzle formats are charting, and is ours different?
- [ ] Monetization is cosmetics, hints, skips, revives and private servers, with no paywalled story.

## 15. Checklist

- [ ] Player has control within 20 s of joining (timed on a phone).
- [ ] The first puzzle is solved by a new 10-year-old in under 2 minutes (Kid Tester).
- [ ] A checkpoint every 3-5 minutes; respawn at the latest checkpoint ≤ 90 s back.
- [ ] The objective tracker is always visible and updates within 1 s.
- [ ] Every interactable is tagged, uses the same prompt style and is highlighted within 10 studs.
- [ ] No answer, code or order is visible to clients (Reviewer searches ReplicatedStorage and LocalScripts).
- [ ] Puzzle inputs are validated: type, length, distance ≤ 12 studs, 2 s lockout on a wrong try.
- [ ] The hint ladder fires at the documented times for every puzzle.
- [ ] Skip/hint/revive products work in Studio test purchases and grant once; one `ProcessReceipt` in the place.
- [ ] Key items are team items and respawn if their holder leaves or they fall out of the map.
- [ ] Every cutscene is ≤ 30 s, skippable after the first view, and restores the camera even after an error.
- [ ] Dialogue lines are ≤ 90 characters; text speed and subtitles work.
- [ ] The chaser is slower than players, has a tell, and can't reach hiding spots.
- [ ] Party teleport to a reserved server works for 1-4 players; the chapter place checks unlocks against saved data.
- [ ] Chapter progress, endings and collectibles save and reload.
- [ ] Every ending is reachable; every puzzle is solvable with no hints (Playtest run log).
- [ ] Lowest graphics on a phone: the critical path is visible.
- [ ] Puzzle funnel analytics fire for start, hint, solve and quit.

## Common mistakes

1. Storing the keypad code in a replicated value or a LocalScript.
2. Letting the client decide "puzzle solved".
3. Key items that belong to one player and vanish when they leave.
4. Triggers that fire on any touch, including from a physics object or a skip.
5. Cutscenes that leave the camera Scriptable after an error.
6. Unskippable cutscenes on replays.
7. Text-heavy puzzles for a young audience.
8. Pixel-hunt key items with no highlight.
9. A chaser faster than players with no tell.
10. Using `wait()` and `spawn()` instead of `task.wait` and `task.spawn`.
11. Paywalled chapters or endings.
12. A first chapter longer than 30 minutes with no checkpoint.
13. No chapter select, so friends can't play together.
14. Treating teleport data as trusted.
15. Tweened elevators or moving floors that drop players [25].
16. Two scripts setting `ProcessReceipt` [15].
17. Copying a famous game's monster or characters instead of its structure.
18. Announcing a chapter date you can't hit.

## References

> The vault standard asks for game-specific sources for every reference game. The session's search limit stopped research before those searches. Pulse: in the next research pass, add sources for the † entries in section 3 (game wikis or Roblox listings).

[1] Experience genres (Roblox Creator Docs) — https://create.roblox.com/docs/production/publishing/experience-genres — Puzzle is its own genre with its own subgenres.
[2] Barry's Prison Run (Roblox listing) — https://www.roblox.com/tr/games/13566209506/BARRY-PRISON-RUN — Prison-escape obby premise with a lax guard and 25 obstacles; themed variants.
[3] What is the Roblox troll obby game about? (Playgama) — https://playgama.com/blog/?p=9472 — Fake platforms, disguised kill parts; each failure works like a puzzle.
[4] Find the Chomiks (TV Tropes YMMV) — https://tvtropes.org/pmwiki/pmwiki.php/YMMV/FindTheChomiks — A "find the" game whose difficulty chart is based on JToH's.
[5] Proximity prompts (Roblox Creator Docs) — https://create.roblox.com/docs/ui/proximity-prompts — Distance, line of sight (on by default), exclusivity; per-prompt or ProximityPromptService events.
[6] ProximityPrompt (API reference) — https://developer.roblox.com/api-reference/class/ProximityPrompt — ProximityPrompt class reference.
[7] SpawnLocation (engine reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/SpawnLocation.md — Spawn-based checkpoints with AllowTeamChangeOnTouch.
[8] Spawn system for obby (DevForum) — https://devforum.roblox.com/t/spawn-system-for-obby/263989 — Per-player respawn points scale better than team spawns.
[9] [OBBY] Game Checkpoints V2.0 (DevForum) — https://devforum.roblox.com/t/obby-game-checkpoints-v20/3957159 — Sequential checkpoints and saving across sessions.
[10] Obby kit with stage selector (DevForum) — https://devforum.roblox.com/t/785271 — Stage selector and respawn at the chosen stage.
[11] [OBBY CHECKPOINT] Could this work? (DevForum) — https://devforum.roblox.com/t/obby-checkpoint-could-this-work/375921 — Client-held progress can be exploited.
[12] Obby Checkpoints Script (DevForum) — https://devforum.roblox.com/t/obby-checkpoints-script/2215191 — Hook CharacterAdded rather than caching the character.
[13] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt required; don't grant from PromptProductPurchaseFinished.
[14] developer-products.md (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/monetization/developer-products.md — ProcessReceipt set once by one server script.
[15] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — A second ProcessReceipt script charged without granting.
[16] MarketplaceService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — ProcessReceipt must be defined for developer products.
[17] Help with a skip stage (DevForum) — https://devforum.roblox.com/t/help-with-a-skip-stage/406152 — Skip products via PromptProductPurchase; handler advances progress.
[18] How to refine your obby game (DevForum) — https://devforum.roblox.com/t/how-to-refine-your-obby-game/862904 — Playtest every stage; cheap skips; no expensive boosts at every checkpoint.
[19] Tips to improve my obby since players only spend 3-4 minutes (DevForum) — https://devforum.roblox.com/t/how-to-improve-my-obby-game/3683572 — A distinctive opening and variety keep players.
[20] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore — Positive integers; GetSortedAsync.
[21] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md — Global top scores across servers.
[22] Best way to get accurate speed-run times? (DevForum) — https://devforum.roblox.com/t/best-way-to-get-accurate-speed-run-times/2520069 — Client tick() timing is unreliable.
[23] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md — Data store guide.
[24] Best times and saves (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/best_times_and_saves — Wrap DataStore calls in pcall.
[25] Cannot ride a moving platform (DevForum) — https://devforum.roblox.com/t/cannot-ride-a-moving-platform/807834 — Tweened parts don't carry characters.
[26] Need help with TweenService (DevForum) — https://devforum.roblox.com/t/need-help-with-tweenservice/471608 — Physics- or velocity-driven platforms instead.
[27] Castle Tides talk page (Flood Escape 2 Wiki) — https://flood-escape-2.fandom.com/wiki/Talk:Castle_Tides/@comment-46301187-20200808011251 — Community map with difficulty, 7 normal + 1 group button, star rating.
[28] Map design skill (skills.sh) — https://skills.sh/taozhuo/game-dev-skills/map-design — Landmarks and sight lines guide players to objectives.
[29] How to make a parkour obby in Roblox (iD Tech) — https://idtech.com/blog/roblox-parkour-obby-tutorial — Ghost (non-collide) blocks for fake walls and passages.
[30] Speed Run 4 Classic skips guide (speedrun.com) — https://www.speedrun.com/rblx_sr4c/guides/y8ce0 — Community-found skips; developers raised the death plane.
[31] Kill bricks (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/kill_bricks — One function bound to every CollectionService-tagged part.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Horror]] · [[Genre - Obby]] · [[Genre - Party and Social Hangout]]
