---
tags: [vault, genre, party, social, hangout, minigames, round-based, dress-up, fashion-contest, social-deduction]
for: [lead, pulse, architect, builder, frame, scenic, balance, playtest]
also: [librarian, kid-tester, reviewer, merchant, liveops, splash, producer]
---

# Genre - Party and Social Hangout

Party games are short, repeatable rounds that a server plays together: minigame collections, round-based survival, social deduction (a hidden killer and a sheriff), hide and seek, asymmetric one-versus-many chases, drawing and guessing, quizzes, and dress-up or fashion contests where players style an outfit to a theme and vote on each other (the Dress to Impress shape). Social hangouts are the quieter sibling: a place to be with friends and strangers, with small toys that give people something to do while they talk. Roblox's own publishing taxonomy has a "Party & casual" genre for games focused on casual social play with other players, with subgenres including Childhood Game, Coloring & Drawing, Minigame and Quiz [1].

The genre lives or dies on **pace and people**. A party game with a 45-second intermission, a confusing round or a server of three loses players at every round boundary, because every round end is a natural exit. A hangout with nothing to touch empties out when the conversation stops. The fix is the same in both: a short, legible cycle, something fun to do while waiting, rounds that work with 4 players and shine with 16, and rewards that make the next round feel worth staying for.

This page gives the round state machine, round timings, mode recipes for the main party formats, the voting and contest rules that keep fashion and drawing contests fair, and the anti-grief and moderation rules these games need. Read it before pitching or planning any party, minigame, contest, social-deduction or hangout game, and before building any round system in another genre (horror, shooters and battlegrounds reuse the round loop).

## 1. What it is and why it works on Roblox

**The audience.** Party games suit groups of friends who join together and solo players who want a lively server. They skew young and social: the designer's assumption here is mostly 8-14 year-olds, with fashion and dress-up contests drawing a large share of players who care about style and self-expression. Players want to laugh, show off, win sometimes, and be seen.

**Session shape.** A loop of rounds: 2-4 minutes per cycle (lobby → vote → round → results), 6-15 cycles per session (20-45 minutes). Hangout sessions are open-ended (10-60 minutes) and tied to who's online.

**Why players come back.**
1. **Friends.** Party games are the "what do we play tonight?" answer. Invites and joining friends must be one tap.
2. **Variety.** A different mode, map or theme every round. Tower of Hell shows the value of a fresh random course every round [7][3].
3. **Status.** Wins counters, levels, titles, rare cosmetics and podium moments are public.
4. **Shared moments.** One player buying a modifier that changes everyone's round, or a whole server panicking in the last seconds, gives stories to tell [4][5].
5. **Collection.** Cosmetics (outfits, knife or tool skins, emotes, trails) earned or bought over many sessions.

**Why it works on Roblox.** Roblox gives free multiplayer servers, voice and text chat for eligible users, avatars as self-expression, private servers and friend joins. A round-based game needs very little content to replay: 10 modes × 5 maps gives 50 combinations. Third-party rankings put social genres such as roleplay near the top of the platform by visits [2], and party games share that social core.

## 2. The core loop

**Minigame collection:**
> Players **play a short random minigame with the server** to **win coins and a win**, which they spend on **cosmetics and emotes** so they can **show off in the next round's lobby**.

**Round-based survival or social deduction:**
> Players **survive or solve the round's threat** (a disaster, a hidden killer, a seeker) to **earn coins, XP and a win**, which unlock **cosmetics and levels** so they can **flex in the next round**.

**Fashion contest:**
> Players **dress to a theme against a timer**, **walk the runway and vote**, and **earn stars, coins and levels** that unlock **more clothes, poses and effects** so they can **win the next theme**.

**Hangout:**
> Players **come to talk with friends and strangers**, **use toys and spots to play together** (seats, dance floors, photo spots, small games), and **unlock emotes and cosmetics** so they can **express themselves in the next conversation**.

| Layer | Time scale | Minigames | Social deduction | Fashion contest | Hangout |
|---|---|---|---|---|---|
| Micro | 1-5 s | Dodge, jump, grab | Spot, hide, shoot | Pick an item, color | Emote, sit, toss a ball |
| Short | 1-4 min | One round and its result | One round, role reveal | One theme: dress, runway, vote | One activity, one chat |
| Session | 20-45 min | A level up, a cosmetic | A rare skin, a win streak | A level up, a new item set | A new emote, a group photo |
| Long | weeks | New minigames, weekly board | New skins, seasons | New themes and item drops | Regulars, new spaces |

Loop rules:
1. **The full cycle is under 4 minutes**, and the time between "round over" and "next round starts" is under 35 s.
2. **Every round pays something to everyone who played**, and more to the winners. Nobody leaves a round with nothing.
3. **The lobby is a toy, not a waiting room.** Trampolines, slides, a mini obby, a ball, a dance floor, a mirror to try outfits.
4. **One rule per round, explained in one line and an icon,** shown for 3 s at the start ("Don't touch the lava!").

## 3. Top games in the genre

> **Source status.** The research pass for this page hit the session's web-search limit before the game-specific searches. Entries marked **†** describe the game from the crew's general knowledge, with no citation yet. Before you quote any detail from a † entry as fact, verify it in-game or find a source. None of these entries gives player counts, revenue or other numbers, and none should until it is sourced.

### Dress to Impress †
**What it does:** A fashion contest. Each round reveals a theme, players have a few minutes to build an outfit in a dressing area (clothes, hair, makeup, colors, patterns), then walk a runway one by one while the server rates each look with stars; the top looks get the podium. Levels and currency unlock more items, and a VIP pass adds items and a VIP area.
**Steal:** A theme as the round's rule (no explanation needed); a timer that makes choices exciting; a runway moment where every player gets the spotlight for a few seconds; star votes as social reward.
**Avoid:** Copying its items, UI or runway. Voting systems without protection against trolls (one-star bombing) and self-voting; themes that invite inappropriate outfits.

### Murder Mystery 2 †
**What it does:** Social deduction rounds: one secret murderer, one sheriff with a gun, and innocents who collect coins on the map and try to survive or identify the murderer. Weapon skins and trading form the long-term layer.
**Steal:** Secret roles that make every round a story, an action for innocents (collecting coins) so they aren't just running, cosmetic weapon skins as the collection.
**Avoid:** Paid role-chance boosts (we never sell them); rounds where innocents die in the first seconds with nothing to do (give them spectating and a coin-collect payout).

### Natural Disaster Survival †
**What it does:** Each round picks a map and a disaster (flood, fire, tornado, earthquake, meteors and more); survivors of the round earn a win. Maps are destructible and physics-driven.
**Steal:** Random map × random threat as cheap variety; survival as an easy win rule; physics chaos as the spectacle.
**Avoid:** Physics loads that lag phones; disasters that kill everyone in the first 10 s.

### Epic Minigames †
**What it does:** A large rotating collection of short minigames played back to back, each with its own simple rule, and coins and cosmetics as the long layer.
**Steal:** A minigame registry where each mode is small and self-contained; quick rounds; a big list of modes so repeats are rare.
**Avoid:** Shipping 40 thin modes instead of 10 polished ones.

### Flee the Facility †
**What it does:** Asymmetric rounds: one player is the Beast, the others are survivors who hack computers to open exits while avoiding capture; captured survivors can be rescued by teammates.
**Steal:** One-versus-many roles that feel powerful on both sides; objectives that force survivors to split up; rescue mechanics so a caught player isn't out.
**Avoid:** Uneven balance that makes one side always win.

### Hide and Seek Extreme †
**What it does:** A seeker ("It") hunts hiders across oversized household maps where players are tiny, so furniture becomes hiding spots and climbing routes.
**Steal:** Scale as the twist (tiny players in giant rooms), simple roles everyone understands.
**Avoid:** Maps where one hiding spot is unbeatable.

### Speed Draw †
**What it does:** Players get a prompt and a short time to draw it, then vote on the drawings.
**Steal:** A prompt-and-timer creative round; voting as the payoff.
**Avoid:** Any user drawing or image feature without reporting, quick removal and strong limits; drawings are user content we must moderate.

### Tower of Hell (round-based obby with shared rounds) — sourced
**What it does:** A random tower each round with a shared timer (about six minutes per round in one description) and no checkpoints [3][7][33]; mutators, bought with coins, change the round for everyone in the server and expire at round end, and their coin price scales with tower length [4][5]; private servers at 250 Robux per month add owner settings such as skipping the current tower and changing tower size [6].
**Steal:** The shared round clock (everyone ends together, which creates a lobby moment), server-wide modifiers bought by one player (a social spending lever), private-server owner controls as a paid perk.
**Avoid:** Modifiers that only one side can afford in competitive modes.

### Flood Escape 2 (co-op escape rounds) — sourced
**What it does:** Round-based maps where players press buttons to open the route while water rises; community maps carry a difficulty tier, a button count (one Easy map has 7 normal buttons and 1 group button) and a star rating [8][9].
**Steal:** Co-op objectives under a rising threat; group buttons that need several players at once; community map pipelines with difficulty and star ratings.
**Avoid:** Maps where one new player blocks the whole team.

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns in a bright lobby. Top-center bar: "Next round in 0:12 — Lava Rise". Toys in view (trampoline, slide, ball). | State bar driven by workspace attributes; joiners see the current state instantly. |
| 3-15 s | Walks onto a glowing "Vote" pad or taps one of 3 vote cards. A friend-join toast if friends are online. | Voting starts within 15 s of join or the player joins the current vote. |
| 15-20 s | Teleport into the arena with a 3-2-1 countdown and a one-line rule card with an icon. | Spawn points ≥ max players; rule card 3 s. |
| 20-120 s | Plays the round. Eliminated players see "Spectating Sam — 4 left" with prev/next buttons and a "Back to lobby toys" button. | Elimination never means "nothing to do". |
| 120-135 s | Results: podium for the top 3, "+10 coins, +25 XP" for everyone, "+25 Win bonus" for winners. Level bar fills. | Payout for all; level-up within the first 3 rounds. |
| 135-150 s | Back in the lobby. A pulsing "Shop" button: the first cosmetic costs about 2 rounds of coins. | First purchase in reach by ~5 min. |
| 150-300 s | Round 2 on a different mode. After round 2: "Daily quest: win 1 round (0/1)". | Never the same mode twice in a row. |

Fashion contest variant: 0-10 s theme reveal ("Theme: Space Pop Star") → 10-200 s dressing (clear item categories, a mirror camera) → 200-260 s runway (8-10 s per player, rate 1-5 stars) → 260-275 s podium → +coins for everyone, more for the top 3.

Late joiners: someone who joins mid-round goes to the lobby with "Round in progress — 1:12 left. Spectate or play in the lobby." They're never dropped into a round already half over unless the mode supports it (hangouts, survival with respawns).

Opening rules:
1. **Join → playing in under 20 s.** If the server is mid-round, the lobby must be fun on its own.
2. **No text tutorial.** The rule card is one line and an icon. Kids learn by watching others in round 1.
3. **No shop, codes or daily popups in the first 60 s.**
4. **A new player can win something in round 1** (participation payout, a "first round" badge).

## 5. Progression and economy

### Round timings (targets)

| Phase | Minigames | Social deduction | Survival | Fashion contest | Asymmetric |
|---|---|---|---|---|---|
| Intermission | 15 s | 15 s | 15 s | 10 s | 20 s |
| Vote | 10 s | — | 10 s (map) | — (theme is random) | 10 s |
| Load + countdown | 3 + 3 s | 3 + 3 s | 3 + 3 s | 3 s | 3 + 5 s |
| Play | 45-120 s | 150-180 s | 60-90 s | 180-240 s dress + runway | 180-300 s |
| Results | 8 s | 8 s | 8 s | 15 s | 10 s |
| **Cycle** | **~1.5-2.7 min** | **~3-3.5 min** | **~1.7-2.2 min** | **~5-6 min** | **~4-6 min** |

### Payout per round (targets)

| Result | Coins | XP |
|---|---|---|
| Played the round (not AFK) | 5 | 10 |
| Survived / finished | +10 | +10 |
| Won (or top 3 in a contest) | +25 | +20 |
| First win of the day | +50 | +50 |
| Played with a friend | ×1.2 | ×1.2 |

At these numbers an average player earns ~20 coins per round and ~10 rounds per session, so ~200 coins per session. Price cosmetics from that: a common emote 150 (one session), a rare trail 800 (about 4 sessions), an epic outfit 2,500 (about 2 weeks of regular play), a legendary effect 10,000 (a long goal).

### Levels
XP to next level `X(n) = 100 + 40·n` (level 1→2 needs 140 XP, about 4 rounds; level 10→11 needs 500 XP, about 12 rounds). Every level gives a reward (coins, a color, an emote, a title), every 5 levels a bigger one. Show the level next to the name tag and on the podium.

### Contest scoring (fashion, drawing, building)
1. **Nobody rates themselves.** The server ignores self-votes.
2. **Score = trimmed mean.** With 5 or more ratings, drop the single highest and lowest before averaging; this blunts one-star bombing and friend boosting.
3. **Unrated = 3 stars.** A voter who doesn't rate someone counts as a neutral 3, not 0.
4. **Show the stars**, not the raw count; ties break by the earliest finish.
5. **Rating is fast:** 5 big star buttons, 8-10 s per contestant.

### Races and timed modes
Time races and time-attack modes on the server with `workspace:GetServerTimeNow()`; community threads report that client `tick()` timing gives inaccurate, identical results [32]. The client only displays the clock.

### Social deduction roles
For `N` players: 1 killer, 1 sheriff, `N − 2` innocents (with `N ≥ 12`, add a second killer). Pick roles with a fairness weight: each round you're not the killer adds +1 weight to your chance next round, reset when chosen. Never sell role chances.

## 6. Monetization that fits

Party players pay for **self-expression** (cosmetics, emotes, effects, outfits), **fun for the whole server** (modifiers, choosing the next mode), **status** (VIP tags, titles) and **control** (private servers). Use the developer-product pipeline correctly: grant in `ProcessReceipt`, never from `PromptProductPurchaseFinished` [22]; set it in one server script only [23], because a second script setting it can charge players without granting [24]; it must be defined for developer-product transactions to complete [25]. DevForum creators advise putting offers where players see them and advertising purchases as players progress [27][28].

Price ladder (targets; the owner sets real prices and creates passes and products):

| Item | Type | Target price | Notes |
|---|---|---|---|
| VIP (name color, VIP lobby corner, +1 vote weight in *map* votes only, 1.5× coins) | Game pass | 199-399 R$ | Never extra weight in *contest* ratings |
| 2× Coins | Game pass | 149-299 R$ | Time saver, not power |
| Emote pack (6) | Game pass | 99-199 R$ | Shown in the lobby by the player |
| Server modifier (low gravity, giant heads, speed) for the next round | Developer product | 25-49 R$ | Announced with the buyer's name; 1 per round; casual modes only. Tower of Hell sells mutators for coins [4][5]; keep a coin route too |
| Pick the next mode | Developer product | 15-29 R$ | Skips the vote once; not twice in a row |
| Cosmetic crate | Developer product | 49-149 R$ | Odds shown before purchase ([[03 Rarity and RNG]]) |
| Fashion: premium item set | Game pass | 149-399 R$ | Free items must be able to win a theme |
| Private server | Subscription | 100-250 R$/month | Owner tools (choose modes, set timers, kick); Tower of Hell's is 250 R$/month with owner settings [6] |

Off-limits:
1. **No paid advantage in competitive rounds** (extra lives, invincibility, revives in ranked modes, x-ray in hide and seek).
2. **No paid votes or ratings** in contests. A paid player's outfit is judged like anyone else's.
3. **No paid role chances** (killer, sheriff, beast, seeker).
4. **No random paid items without visible odds.**
5. **No pass that makes free players' rounds worse.**
6. **No "limited time" shop timers that reset.**

## 7. UI and HUD for this genre

| Element | Position (UDim2 / AnchorPoint) | Size (offset at 1080p) | Notes |
|---|---|---|---|
| Round bar | (0.5, 0, 0, 12) / (0.5, 0) | 420×56 | Mode icon, mode name, timer, players alive ("7 left") |
| Rule card | (0.5, 0, 0.3, 0) / (0.5, 0.5) | 520×120 | Icon + one line; 3 s, fades |
| Vote cards | center row | 3 × 240×300, 24 px gaps | Map/mode art, name, live tally; tap to vote |
| Spectate bar | (0.5, 0, 1, −24) / (0.5, 1) | 420×64 | ◀ name ▶, "Lobby" button |
| Coins + level | (0, 16, 0, 72) / (0, 0) | 200×48 and 200×16 bar | Coin pill and level bar |
| Left menu column | (0, 16, 0.5, 0) / (0, 0.5) | 64×64 each | Shop, Inventory, Emotes, Quests, Settings |
| Results podium | world podium + overlay | overlay 600×200 | Top 3 names, then "+coins" for you |
| Contest rating bar | (0.5, 0, 1, −24) / (0.5, 1) | 5 × 88×88 stars | Big, thumb-reachable; disabled for your own look |
| Dressing panel (fashion) | right side | 40% width on phone | Category tabs (Tops, Bottoms, Shoes, Hair, Face, Accessories, Colors), item grid 4 columns, a mirror-camera button |

Must-have screens: Shop (cosmetics with previews), Inventory/Equip, Emotes wheel, Daily quests, Settings (music, SFX, hide others' effects, low detail), AFK toggle, Results/Podium, Private-server panel (owners only).

Mobile rules: round bar under the Roblox top bar (12 px gap); spectate and rating buttons at the bottom center, never in the thumbstick (bottom-left 300×300 px) or jump (bottom-right 260×260 px) zones; dressing panels must not cover the avatar preview (split the screen 60/40) ([[08 Mobile]]). Gamepad: every menu button is selectable (`Selectable = true`, sensible `NextSelection*` links, `GuiService.SelectedObject` set when a menu opens) and ProximityPrompts keep their default gamepad key (`GamepadKeyCode`, ButtonX); vote cards, star ratings and spectate prev/next work with the D-pad and ButtonA.

## 8. World and look

1. **The lobby is the brand.** One memorable, bright lobby with a central screen showing the next mode, the podium and the toys. It's where players spend 25-40% of their time.
2. **Lobby toys (pick 5+):** trampolines, slides, a mini obby with a 10-second loop, a kickable ball, a dance floor that lights up, swings, a photo spot, a mirror wall, an AFK lounge, a leaderboard wall. Seats, photo spots and toggles use ProximityPrompts with `RequiresLineOfSight` on (the default) and an 8-10 stud range [26].
3. **Arenas are small and readable.** Size to the player count: about 60×60 studs for 8 players, 100×100 for 16, 140×140 for 24. Every arena has spawn points ≥ max players, spread at least 8 studs apart.
4. **Hazards are always the same color language** across modes: kill parts Neon red, safe zones green, objectives yellow with a beam. Readable hazards are the top obby tip and apply here too [29].
5. **Theme maps strongly.** Each map has a one-word identity (Kitchen, Candy, Space, Jungle, Factory) and its own lighting preset.
6. **Load maps cleanly.** Maps live in `ServerStorage.Maps`; the round clones one into `workspace.Arena`, parents it last, and destroys it after results. With `StreamingEnabled`, stream around arena spawns before teleporting players.
7. **Hangout spaces** are built around seating clusters of 4-8 seats facing each other, sight lines to a central feature, and spots for groups to gather; landmarks and sight lines guide people through the space [31].
8. **Performance.** Party servers are full, so keep each arena under 3,000 parts, effects short, and physics chaos (NDS-style) on the server with part caps.

## 9. Retention and social

1. **Friends first.** On join, if friends are in the game but on another server, show "Join Sam's server". In-game invites use the Roblox invite prompt (`SocialService:PromptGameInvite`).
2. **Party up.** A "Play together" button keeps a group on the same team in team modes.
3. **Daily quests** (3 per day: play 5 rounds, win 1, use an emote) and a 7-day login streak ([[10 Retention and Social]]).
4. **Weekly leaderboard** of wins that resets every Monday, plus an all-time board. Ordered data stores hold positive integers and read sorted pages with `GetSortedAsync` [18][19].
5. **Levels and titles** next to the name tag.
6. **Podium moments.** Winners stand on a lit podium for 8 s while everyone watches. That's the reward people come back for.
7. **Group perks:** a free emote or color for joining the group.
8. **Private servers** for friend groups, with owner controls.
9. **Fair matchmaking feel:** rotate roles, avoid the same killer twice in a row, and give new players easier spots in hide and seek for their first 3 rounds.

## 10. Live ops and update cadence

| Cadence | Content |
|---|---|
| Weekly | 1 new mode or map (minigames), or 2-3 new themes and an item drop (fashion), plus fixes |
| Every 2 weeks | A featured event mode for the weekend (double coins, a special rule) |
| Monthly | A cosmetic set (8-15 items), a new lobby toy |
| Seasonal (4-6 per year) | Lobby decorations, event currency, limited cosmetics, an event mode |

Rules:
1. **Mode rotation data decides.** Liveops tracks per mode: rounds played, players quitting during or right after the round, and vote share. A mode with a high post-round quit rate gets fixed or pulled.
2. **New content goes in the vote first** ("NEW" badge on its card) so players find it.
3. **Board seasons:** weekly boards use a new key each week (`Wins_W<weekIndex>`); the all-time board never resets.
4. **Fashion games need theme volume:** keep 100+ themes, rotate so a theme doesn't repeat within 2 hours on a server, and add themes every week.
5. **Announce on the lobby screen** and in the title for a week ([[12 Live Ops and Launch]]).

## 11. Building it in Studio

### Build order (a minigame party game in 13 steps)
1. **Architect** writes the format, the mode list with one-line rules, timings, payouts and min/max players into `plan.md`.
2. **Balance** writes payouts, level curve and cosmetic prices in `economy.md`.
3. **Builder** writes `RoundService` with timeouts and one test mode (rising lava) before anything else; **Playtest** runs 20 rounds with 2 and 6 players, including a forced error.
4. **Scenic** builds the lobby with 5+ toys and the first 3 arenas (greybox), sized to the player count.
5. **Builder** writes `VoteService`, spawns, elimination, spectating and `AFKService`.
6. **Frame** builds the round bar, rule card, vote cards, spectate bar and results podium.
7. **Builder** adds 5 more modes, one at a time, each tested by Playtest before the next.
8. **Kid Tester** plays 5 rounds on a phone and explains each mode's rule in their own words.
9. **Builder** writes `RewardService`, quests and the weekly and all-time boards.
10. **Merchant** wires cosmetics, the modifier product, passes and `ProcessReceipt`.
11. **Scenic** dresses arenas with themes and lighting presets.
12. **Reviewer** tests forged votes and ratings, AFK abuse, product limits and moderation paths for any user content.
13. **Producer** runs the section 15 checklist with evidence.

### Systems list
1. **RoundService**: the state machine (Waiting → Intermission → Voting → Loading → Countdown → Playing → Results), with a hard timeout in every state.
2. **ModeRegistry**: one ModuleScript per mode with a common interface.
3. **MapService**: clone, place and clean up arenas; spawn points.
4. **VoteService**: options, votes, tallies, ties.
5. **RoleService**: role assignment with fairness weights (deduction, asymmetric, hide and seek).
6. **ContestService**: themes, timers, runway order, ratings and scoring (fashion, drawing).
7. **RewardService**: coins, XP, wins, quests.
8. **LeaderboardService**: weekly and all-time wins.
9. **AFKService**: AFK detection and the opt-out toggle.
10. **SpectateController** (client).
11. **ShopService** and **ProductService** (Merchant).
12. **LobbyToys**: trampolines, balls, dance floor (client-side effects where possible).

### Architecture
```
ReplicatedStorage/
  Shared/Config            timings, payouts, prices (ids), min/max players
  Shared/Modes             mode display data (name, icon, rule line) for UI
  Remotes/                 RoundState, CastVote, Rate, Spectate, ToggleAFK, Toast, Results
ServerScriptService/Main
ServerScriptService/Services/
  RoundService, VoteService, RoleService, ContestService, RewardService,
  LeaderboardService, AFKService, ShopService, ProductService
  Modes/LavaRise, Musical, KingOfHill, HiddenKiller, Survival ... (one ModuleScript each)
ServerStorage/Maps/        arena Models, each with a Spawns folder of parts tagged "ArenaSpawn"
Workspace/
  Lobby/                   spawn, toys, podium, screens (Scenic)
  Arena/                   empty folder; the current map is cloned here
```

Hazards are tagged parts handled by one bound function per tag, as in obby kill parts [13][14], and they run on the server; client-side kill parts don't register for others [15]. Moving hazards (sweepers, conveyors, platforms) are physics- or constraint-driven, because tweened anchored parts don't carry players [16][17]. Team modes can use the Teams service; SpawnLocations create teams and control auto-assignment [11], but in party games set `player.Team` from RoundService and move characters to arena spawns directly, as obby systems do with respawn points [12].

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit |
|---|---|---|---|---|---|
| RoundState | RemoteEvent | S→C | state, endsAt, info | — | — |
| CastVote | RemoteEvent | C→S | index: number | state == Voting; integer 1..#options | 4 per s |
| Rate | RemoteEvent | C→S | targetUserId, stars | state == Runway; target is current contestant; not self; stars integer 1-5; once per target | 2 per s |
| Equip (contest) | RemoteEvent | C→S | slot, itemId | state == Dressing; item owned or free; slot valid | 10 per s |
| ToggleAFK | RemoteEvent | C→S | value: boolean | not mid-round | 1 per 2 s |
| Spectate | RemoteEvent | C→S | (none) | — (client-only camera; server just confirms eliminated) | 2 per s |
| Results | RemoteEvent | S→C | podium, yourReward | — | — |

### Data schema
```lua
-- PlayerData v1, key "u_<UserId>"
{
	v = 1,
	coins = 0, xp = 0, level = 1,
	wins = 0, roundsPlayed = 0,
	owned = {},                 -- [cosmeticId] = true
	equipped = { trail = nil, emotes = {}, title = nil },
	outfits = {},               -- fashion: saved looks (item ids + colors)
	quests = { day = 0, list = {} },
	lastDay = 0, streak = 0,
	roleWeight = 0,             -- deduction fairness weight
	receipts = {},              -- [PurchaseId] = os.time()
}
-- Ordered stores: "Wins_All" (all-time), "Wins_W<weekIndex>" (weekly)
```
Wrap all data-store calls in `pcall` [20][21].

### Luau: the round loop (server)
```lua
--!strict
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local CollectionService = game:GetService("CollectionService")

local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes
local Modes = require(script.Parent.Modes) -- { [string]: ModeDef }
local VoteService = require(script.Parent.VoteService)
local RewardService = require(script.Parent.RewardService)

export type RoundContext = {
	arena: Model,
	alive: { [Player]: boolean },
	scores: { [Player]: number },
	endsAt: number,
	eliminate: (player: Player) -> (),
}

export type ModeDef = {
	id: string,
	map: string,
	minPlayers: number,
	duration: number,
	winRule: string, -- "LastAlive" | "Survivors" | "Score"
	setup: (ctx: RoundContext) -> (),
	cleanup: ((ctx: RoundContext) -> ())?,
}

local function now(): number
	return workspace:GetServerTimeNow()
end

local function setState(state: string, seconds: number, info: any?)
	local endsAt = now() + seconds
	workspace:SetAttribute("RoundState", state)
	workspace:SetAttribute("RoundEndsAt", endsAt)
	Remotes.RoundState:FireAllClients(state, endsAt, info)
end

local function eligible(): { Player }
	local list = {}
	for _, p in Players:GetPlayers() do
		if not p:GetAttribute("AFK") and p.Character then
			table.insert(list, p)
		end
	end
	return list
end

local function countAlive(alive: { [Player]: boolean }): number
	local n = 0
	for _ in alive do n += 1 end
	return n
end

local function playRound(mode: ModeDef, players: { Player })
	local arena = (ServerStorage.Maps:FindFirstChild(mode.map) :: Model):Clone()
	arena.Parent = workspace.Arena -- parent last

	local ctx: RoundContext
	ctx = {
		arena = arena,
		alive = {},
		scores = {},
		endsAt = 0,
		eliminate = function(player: Player)
			if ctx.alive[player] then
				ctx.alive[player] = nil
				Remotes.Toast:FireAllClients(player.DisplayName .. " is out!", "elim")
			end
		end,
	}

	local spawns = {}
	for _, inst in arena:GetDescendants() do
		if inst:IsA("BasePart") and CollectionService:HasTag(inst, "ArenaSpawn") then
			table.insert(spawns, inst)
		end
	end

	local connections = {}
	for i, player in players do
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if character and humanoid and #spawns > 0 then
			ctx.alive[player] = true
			ctx.scores[player] = 0
			local spawnPart = spawns[(i - 1) % #spawns + 1]
			character:PivotTo(spawnPart.CFrame * CFrame.new(0, 3, 0))
			table.insert(connections, humanoid.Died:Connect(function() ctx.eliminate(player) end))
		end
	end
	table.insert(connections, Players.PlayerRemoving:Connect(function(p) ctx.alive[p] = nil end))

	setState("Countdown", 3, { mode = mode.id })
	task.wait(3)

	ctx.endsAt = now() + mode.duration
	setState("Playing", mode.duration, { mode = mode.id })
	mode.setup(ctx)

	while now() < ctx.endsAt do
		local n = countAlive(ctx.alive)
		if n == 0 or (mode.winRule == "LastAlive" and n <= 1) then break end
		task.wait(0.25)
	end

	-- winners
	local winners: { Player } = {}
	if mode.winRule == "Score" then
		local best = -math.huge
		for p, s in ctx.scores do
			if s > best then best = s; winners = { p } elseif s == best then table.insert(winners, p) end
		end
	else
		for p in ctx.alive do table.insert(winners, p) end
	end

	for _, c in connections do c:Disconnect() end
	if mode.cleanup then mode.cleanup(ctx) end

	RewardService.payRound(players, winners, ctx.alive)
	setState("Results", Config.RESULTS_TIME, { winners = winners })
	task.wait(Config.RESULTS_TIME)

	for p in ctx.alive do
		if p.Character then p:LoadCharacter() end -- survivors back to the lobby spawn
	end
	arena:Destroy()
end

task.spawn(function()
	local lastMode: string? = nil
	while true do
		setState("Intermission", Config.INTERMISSION)
		task.wait(Config.INTERMISSION)

		local players = eligible()
		if #players < Config.MIN_PLAYERS then
			setState("Waiting", 5, { need = Config.MIN_PLAYERS - #players })
			task.wait(5)
			continue
		end

		local options = VoteService.pickOptions(3, #players, lastMode)
		setState("Voting", Config.VOTE_TIME, { options = options })
		local modeId = VoteService.collect(options, Config.VOTE_TIME)
		lastMode = modeId

		local ok, err = pcall(playRound, Modes[modeId], eligible())
		if not ok then
			warn("Round failed:", err) -- never let one broken mode stop the server
			workspace.Arena:ClearAllChildren()
		end
	end
end)
```
`VoteService.pickOptions` filters modes by `minPlayers` and never offers the previous mode; ties go to a random tied option.

### Luau: an example mode (rising lava)
```lua
--!strict
-- ServerScriptService.Services.Modes.LavaRise
local RunService = game:GetService("RunService")

return {
	id = "LavaRise",
	map = "LavaTower",
	minPlayers = 2,
	duration = 90,
	winRule = "Survivors",
	setup = function(ctx)
		local lava = ctx.arena:FindFirstChild("Lava") :: BasePart
		lava:AddTag("Kill") -- the shared kill-part binder handles touches
		local startY = lava.Position.Y
		local conn: RBXScriptConnection
		conn = RunService.Heartbeat:Connect(function(dt)
			if not lava.Parent then conn:Disconnect() return end
			lava.CFrame += Vector3.new(0, 1.2 * dt, 0) -- 1.2 studs per second
			if lava.Position.Y - startY > 100 then conn:Disconnect() end
		end)
	end,
}
```
Lava moving by CFrame is fine here because nobody stands on it; anything players ride must be physics-driven [16].

### Luau: star ratings with a trimmed mean (server)
```lua
--!strict
local ratings: { [number]: { [number]: number } } = {} -- [targetUserId][raterUserId] = stars

local function rate(rater: Player, targetUserId: number, stars: unknown)
	if rater.UserId == targetUserId then return end -- no self-votes
	if typeof(stars) ~= "number" or stars % 1 ~= 0 or stars < 1 or stars > 5 then return end
	ratings[targetUserId] = ratings[targetUserId] or {}
	if ratings[targetUserId][rater.UserId] then return end -- one rating per target
	ratings[targetUserId][rater.UserId] = stars
end

local function score(targetUserId: number, voterCount: number): number
	local list = {}
	for _, s in ratings[targetUserId] or {} do table.insert(list, s) end
	while #list < voterCount do table.insert(list, 3) end -- unrated counts as neutral
	table.sort(list)
	if #list >= 5 then
		table.remove(list, #list) -- drop highest
		table.remove(list, 1)     -- drop lowest
	end
	local sum = 0
	for _, s in list do sum += s end
	return if #list > 0 then sum / #list else 3
end
```
`voterCount` is the number of non-AFK players other than the contestant. Clear `ratings` at the start of each theme.

### Luau: fair role picks (server)
```lua
--!strict
local function pickWeighted(players: { Player }, weightOf: (Player) -> number): Player
	local total = 0
	for _, p in players do total += 1 + weightOf(p) end
	local roll = Random.new():NextNumber(0, total)
	for _, p in players do
		roll -= 1 + weightOf(p)
		if roll <= 0 then return p end
	end
	return players[#players]
end
-- After the round: chosen player's roleWeight = 0; everyone else's roleWeight += 1.
```

### Luau: weekly wins board (server)
```lua
--!strict
local DataStoreService = game:GetService("DataStoreService")

local function weekIndex(): number
	-- Weeks start Monday 00:00 UTC (1970-01-05 was a Monday, 345600 s after the epoch).
	return math.floor((os.time() - 345600) / 604800)
end

local function addWin(player: Player)
	local stores = {
		DataStoreService:GetOrderedDataStore("Wins_All"),
		DataStoreService:GetOrderedDataStore("Wins_W" .. weekIndex()),
	}
	for _, store in stores do
		local ok, err = pcall(function()
			store:IncrementAsync(tostring(player.UserId), 1)
		end)
		if not ok then warn("Win save failed", err) end
	end
end
```
Batch wins in memory and write every 60 s or on leave instead of on every win, to stay under data-store limits. Read the top 50 with `GetSortedAsync(false, 50)` every 60 s [18][19].

### Luau: AFK detection (server)
```lua
--!strict
local Players = game:GetService("Players")
local AFK_SECONDS = 90
local lastPos: { [Player]: Vector3 } = {}
local still: { [Player]: number } = {}

task.spawn(function()
	while true do
		task.wait(5)
		for _, p in Players:GetPlayers() do
			local root = p.Character and p.Character:FindFirstChild("HumanoidRootPart") :: BasePart?
			if root then
				local prev = lastPos[p]
				if prev and (root.Position - prev).Magnitude < 1 then
					still[p] = (still[p] or 0) + 5
				else
					still[p] = 0
				end
				lastPos[p] = root.Position
				if still[p] >= AFK_SECONDS and workspace:GetAttribute("RoundState") ~= "Playing" then
					p:SetAttribute("AFK", true)
				end
			end
		end
	end
end)
Players.PlayerRemoving:Connect(function(p) lastPos[p] = nil; still[p] = nil end)
```
Any input clears AFK through the ToggleAFK remote; AFK players don't count toward the minimum, don't get round payouts, and stay in the lobby.

### Luau: spectating (client)
```lua
--!strict
local Players = game:GetService("Players")
local camera = workspace.CurrentCamera
local index = 1

local function aliveOthers(): { Player }
	local list = {}
	for _, p in Players:GetPlayers() do
		if p ~= Players.LocalPlayer and p:GetAttribute("InRound") then table.insert(list, p) end
	end
	return list
end

local function spectate(step: number)
	local list = aliveOthers()
	if #list == 0 then return end
	index = (index - 1 + step) % #list + 1
	local character = list[index].Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then camera.CameraSubject = humanoid end
end

local function stopSpectating()
	local character = Players.LocalPlayer.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then camera.CameraSubject = humanoid end
end
```
RoundService sets the `InRound` attribute on each player when they enter a round and clears it on elimination.

## 12. Twists that work

1. **Party + obby.** Random course rounds with a shared clock and server modifiers, the Tower of Hell pattern [3][4][5]. See [[Genre - Obby]].
2. **Party + co-op escape.** Rising threat, group buttons, community maps with difficulty and stars [8].
3. **Fashion + roleplay.** Contests inside a town where outfits persist after the round; see [[Genre - Roleplay and Life Sim]].
4. **Party + horror.** One-night survival rounds with a monster and a hidden objective; see [[Genre - Horror]].
5. **Build battles.** Players build to a theme in 3 minutes from a limited kit, then vote (same contest rules).
6. **Game-show host.** An NPC host with voice lines and a stage gives a TV-show feel to quizzes and minigames.
7. **Elimination bracket.** A 3-round knockout across different modes with a final duel.
8. **Everyone-picks-a-modifier.** Each round, every player secretly picks one modifier; one is drawn at random.
9. **Trolling, fairly.** Fake platforms and surprises in casual modes work as a laugh when each is learnable [10].
10. **Hangout + activity schedule.** A hangout space with a scheduled event every 10 minutes (a dance-off, a fashion walk, a trivia round) to restart conversations.
11. **Tiny-scale maps.** Players shrink to toy size in a giant house; furniture becomes the arena.

## 13. Failure modes

1. **Waiting for players.** A server below the minimum shows "Waiting for players" forever. Fix: minimum 2 for most modes, lobby toys, solo-capable modes, and a server size of 12-24 so servers fill.
2. **Long dead time.** Intermission + vote + results over 45 s. Players leave at round boundaries.
3. **Instant elimination with nothing to do.** Fix: spectating, lobby toys, payout for participation.
4. **Repetition.** The same mode three times in a row. Repeated content kills retention in obbies [30] and it does here too.
5. **Round never ends.** A mode bug leaves the server stuck. Fix: hard timeouts and `pcall` around every mode.
6. **Unfair roles.** The same player is the killer 4 rounds running. Fix: weights.
7. **Contest abuse.** Self-votes, one-star bombing, friends boosting. Fix: trimmed mean, no self-votes, neutral default.
8. **Inappropriate user content.** Outfits, drawings or builds that break rules. Fix: limited item sets, report button, quick removal, no free-form images.
9. **Pay-to-win.** Revives or x-ray in competitive modes. Players notice in one round.
10. **Map-load lag.** Huge maps cloned during play. Fix: small arenas, clone during intermission, streaming around spawns.
11. **Hazards that don't kill (client-side) or platforms that don't carry** [15][16].
12. **Toxic hangouts.** No block, mute or report reach in a chat-heavy space.
13. **Untested modes.** Ship only modes Playtest has run with 2, 6 and 12 players; DevForum's top obby tip, playtest every stage, holds for every mode [29].

## 14. Pitch checklist: is this genre right for us right now?

- [ ] We can describe each round in one line, and the first round is fun with 2-4 players.
- [ ] We can ship 6+ polished modes (minigames), 4+ maps with 1 strong mode (deduction/survival), or 100+ themes and a deep item set (fashion) at launch.
- [ ] The lobby has 5+ toys.
- [ ] We have a 1-mode-per-week (or themes-per-week) update plan for 8 weeks.
- [ ] Reviewer has signed off the moderation plan for any user-generated content (outfits, drawings, builds, names).
- [ ] Monetization is cosmetics, server modifiers and private servers, with no competitive advantage.
- [ ] Market check (Pulse): which party format is trending, and which is saturated?
- [ ] The round loop is under 4 minutes.

## 15. Checklist

- [ ] Join → in a vote or round within 20 s (timed on a phone).
- [ ] Intermission + vote + results ≤ 35 s total.
- [ ] Every state has a hard timeout; killing a mode with an error returns the server to Intermission (test by forcing an error).
- [ ] The same mode is never offered twice in a row.
- [ ] Every round pays every non-AFK participant; winners get more.
- [ ] Eliminated players can spectate (prev/next) and return to the lobby.
- [ ] Late joiners land in the lobby with a clear "round in progress" timer.
- [ ] Kill parts and hazards are server-side, tagged, Neon red.
- [ ] Moving hazards that players stand on are physics-driven and carry players.
- [ ] Votes: one per player, only during Voting, index validated (forged remote test).
- [ ] Ratings: no self-rating, one per target, stars 1-5, trimmed mean.
- [ ] Role picks use fairness weights; no product affects roles.
- [ ] AFK players are excluded from the minimum and payouts; any input clears AFK.
- [ ] Weekly and all-time boards write in batches with `pcall` and read every 60 s.
- [ ] One `ProcessReceipt` in the place; modifiers are limited to 1 per round and announce the buyer.
- [ ] Spectate and rating buttons are clear of the thumb zones on a 6-inch phone.
- [ ] Arena part count < 3,000; map clone during intermission; arena destroyed after results.
- [ ] Mode analytics fire: round start, round end, players quitting mid-round and post-round.

## Common mistakes

1. A 30-second intermission with nothing to do.
2. No timeout, so one bad mode freezes the server.
3. Running the whole round inside an event handler instead of a single loop.
4. Using `wait()` and `spawn()` instead of `task.wait` and `task.spawn`.
5. Teleporting players into an arena that hasn't streamed in.
6. Letting the client report "I won" or "I survived".
7. Self-voting and unweighted averages in contests.
8. Selling revives, extra lives or x-ray for competitive modes.
9. Selling killer/sheriff chances.
10. Too many thin modes; Playtest can't keep them all working.
11. Hazard colors that change between modes.
12. Forgetting to clear `Teams` and attributes after team modes.
13. Writing to the leaderboard store on every win.
14. Rounds that need 8 players to work.
15. Respawning eliminated players inside the arena.
16. No mute, block or report in hangouts.
17. Two scripts setting `ProcessReceipt` [24].
18. Cloning big maps during play and causing a lag spike.

## References

> The vault standard asks for game-specific sources for every reference game. The session's search limit stopped research before those searches. Pulse: in the next research pass, add sources for the † entries in section 3 (game wikis or Roblox listings).

[1] Experience genres (Roblox Creator Docs) — https://create.roblox.com/docs/production/publishing/experience-genres — Party & casual genre (casual social play); subgenres Childhood Game, Coloring & Drawing, Minigame, Quiz.
[2] Roblox game genres and popularity, 2026 (ExitLag blog) — https://www.exitlag.com/blog/roblox-game-genres-and-popularity/ — Third-party ranking with roleplay at the top by visits.
[3] Tower of Hell (MCPEDL) — https://mcpedl.com/tower-of-hell/ — Round-based obby with a random tower that resets every six-minute round.
[4] Lengthen (Tower of Hell Wiki) — https://tower-of-hell.fandom.com/wiki/Lengthen — Mutators are like gears but affect everyone in the server.
[5] Tower of Hell mutators (Bloxodes) — https://bloxodes.com/wiki/tower-of-hell/mutators — Coin mutators scale with tower length and expire at round end.
[6] Private Servers (Tower of Hell Wiki) — https://tower-of-hell.fandom.com/wiki/Private_Servers — 250 Robux/month; lock shop, skip tower, tower size.
[7] Tower of Hell (Bloxodes wiki) — https://bloxodes.com/wiki/tower-of-hell — Tower assembled from a large pool of sections.
[8] Castle Tides talk page (Flood Escape 2 Wiki) — https://flood-escape-2.fandom.com/wiki/Talk:Castle_Tides/@comment-46301187-20200808011251 — Community map with difficulty, 7 normal + 1 group button, star rating.
[9] Lost Woods (Flood Escape 2 Wiki) — https://flood-escape-2.fandom.com/wiki/File:Flood_Escape_2_OST_-_Lost_Woods — First Easy map and first community map added.
[10] What is the Roblox troll obby game about? (Playgama) — https://playgama.com/blog/?p=9472 — Surprises and traps that make failure feel like a puzzle.
[11] SpawnLocation (engine reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/SpawnLocation.md — Spawns create teams; AllowTeamChangeOnTouch; auto-assignment.
[12] Spawn system for obby (DevForum) — https://devforum.roblox.com/t/spawn-system-for-obby/263989 — Setting respawn points without one team per spawn.
[13] Kill bricks (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/kill_bricks — Humanoid check; one function for every CollectionService-tagged part.
[14] Tutorial on how to make a kill brick (DevForum) — https://devforum.roblox.com/t/tutorial-on-how-to-make-a-kill-brick/3870469 — Tag-based kill/damage parts with a debounce.
[15] Client-sided killscript (DevForum) — https://devforum.roblox.com/t/making-a-client-sided-killscript/783618 — Kill parts failing when run on the client.
[16] Cannot ride a moving platform (DevForum) — https://devforum.roblox.com/t/cannot-ride-a-moving-platform/807834 — Tweened parts don't carry characters.
[17] Need help with TweenService (DevForum) — https://devforum.roblox.com/t/need-help-with-tweenservice/471608 — Physics- or velocity-driven platforms instead of tweens.
[18] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore — Positive integers; GetSortedAsync for sorted pages.
[19] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md — Global top scores across servers, refreshed periodically.
[20] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md — Data store guide.
[21] Best times and saves (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/best_times_and_saves — Wrap DataStore calls in pcall.
[22] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt required; don't grant from PromptProductPurchaseFinished.
[23] developer-products.md (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/monetization/developer-products.md — ProcessReceipt set once by one server script.
[24] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — A second ProcessReceipt script charged without granting.
[25] MarketplaceService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — ProcessReceipt must be defined for developer products.
[26] Proximity prompts (Roblox Creator Docs) — https://create.roblox.com/docs/ui/proximity-prompts — Prompt distance, line of sight, exclusivity; used for lobby toys and seats.
[27] How can I improve the monetization on this obby? (DevForum) — https://devforum.roblox.com/t/how-can-i-improve-the-monetization-on-this-obby/1356923 — Put purchase prompts where players see them.
[28] Obby game monetization being low (DevForum) — https://devforum.roblox.com/t/obby-game-monetization-being-low/3141998 — Advertise purchasable things as players progress.
[29] How to refine your obby game (DevForum) — https://devforum.roblox.com/t/how-to-refine-your-obby-game/862904 — Playtest every stage; make hazards readable with Neon.
[30] Tips to improve my obby since players only spend 3-4 minutes (DevForum) — https://devforum.roblox.com/t/how-to-improve-my-obby-game/3683572 — Repeated content drives players away; add variety.
[31] Map design skill (skills.sh) — https://skills.sh/taozhuo/game-dev-skills/map-design — Landmarks and sight lines guide players.
[32] Best way to get accurate speed-run times? (DevForum) — https://devforum.roblox.com/t/best-way-to-get-accurate-speed-run-times/2520069 — Client tick() timing is unreliable; time races on the server.
[33] 10 things to know before playing Tower of Hell (Sportskeeda) — https://sportskeeda.com/roblox-news/10-things-know-playing-tower-hell-roblox — Round-based towers of increasing difficulty with no checkpoints.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Obby]] · [[Genre - Roleplay and Life Sim]] · [[Genre - Horror]]
