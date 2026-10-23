---
tags: [vault, genre, sports, soccer, football, basketball, volleyball, ball-physics, ranked, styles, team-game]
for: [lead, pulse, architect, builder, balance, scenic, frame, playtest, kid-tester]
also: [merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Sports

A Roblox sports game is a match around a ball (or a puck, disc or pin) between players or teams, with a score, a clock and a winner. The crew builds four shapes: **team ball games** (soccer, basketball, volleyball, American football, hockey; 2v2 to 7v7 pickup or ranked matches), **anime-ability sports** (the same matches, but players roll "styles" or abilities with special moves; the Blue Lock Rivals shape), **solo skill sports** (bowling, golf, skating, skiing, darts: one player, one shot, a score), and **sports party games** (dodgeball, tag, short mini-matches).

The genre's whole problem is **the ball**. Every player sees the same ball, but each sees it through their own ping, and whoever's machine simulates the ball decides where it really is. DevForum threads on soccer and football balls are a long list of stutter, latency and ownership bugs [1][2][3][4]. A sports game that doesn't solve this feels broken in the first touch. Its second problem is **people**: teams need enough players, fair sides, and a way to deal with leavers and AFKs.

Read this page before pitching or planning any sports game or sports mode, and before building any shared physics object players fight over (a ball, a flag, a crate). Pair it with [[02 The Core Loop]], [[03 Rarity and RNG]], [[10 Retention and Social]], [[16 Console and Controllers]] and [[17 Security and Anti-Cheat]].

## 1. What it is and why it works on Roblox

**The audience** (design assumptions):
- **Sports fans** (about 9-15) who play or watch the real sport and want to score the goal they saw on TV: realistic-ish movement, team play, positions.
- **Anime fans** who want flashy special moves on top of a ball game. Blue Lock Rivals' styles and flows are rolled with spins, and players chase the top-tier ones from tier lists [5][6][7].
- **Competitive players** who want ranked, MMR and a visible rank.
- **Casual friend groups** who want a quick 2v2 with no rules to learn.

**Session shape.** Matches are 3-8 minutes; a session is 4-10 matches with time in a lobby or practice field between. Studio targets: in a match (or practice) within 30 s of joining, first touch of the ball within 10 s of the match starting, matches of 5 minutes ± 2.

**Why players come back.**
1. **Skill.** Dribbles, shots and passes get better with practice; that's the core reason.
2. **Rank.** A visible tier (Bronze → Legend) and a number that moves after every match.
3. **Abilities or styles** (anime sports): rolling for a better style is a login reason; guides describe spins coming from codes, daily challenges and matches, and Lucky Spins sold for Robux [6].
4. **Friends.** Team games are better with friends; parties queue together.
5. **Cosmetics that show in play:** goal explosions, ball trails, kits, celebrations.

**Why it works on Roblox.** Characters already run and jump, multiplayer is built in, matches fit short sessions, and the rules of soccer or basketball need no teaching. The hard parts (ball netcode, matchmaking, fairness) are exactly where most clones fail, which is the opening.

## 2. The core loop

**Loop statement (team sport):**
> Players **pass, shoot and defend in short matches** to **score and win**, which pays **coins and rank points**, which they spend on **cosmetics and new moves** so they can **climb ranks and show off in the next match**.

**Loop statement (anime-ability sport):**
> Players **win matches with their style's special moves** to earn **spins and currency**, which they spend on **rolling better styles and flows** so they can **dominate the next match** [5][6].

**Loop statement (solo skill sport):**
> Players **take a shot or a run** to **beat their score**, which unlocks **new courses and gear** so they can **chase a higher score and a board rank**.

| Layer | Time scale | What happens | Reward beat |
|---|---|---|---|
| Micro | 0.2-2 s | A touch, a pass lands, a block | Sound, hit-pause, crowd swell |
| Short | 10-60 s | A goal, a save, a steal | Replay, goal explosion, score pop |
| Match | 3-8 min | Win or loss | Coins, XP, rank points, MVP |
| Session | 30-60 min | 5-10 matches | A level, a spin, a rank tier |
| Long | days-weeks | Rank climb, style collection, cosmetics | Season rewards, titles |

### Sports rules

1. **The ball has exactly one authority at any moment, and the server knows who it is.**
   Why: ownership flipping between nearby players causes the jumps and stutters DevForum threads describe [1][2]; Roblox switches physics ownership automatically by proximity unless you set it [8].
   How: `ball:SetNetworkOwner(nil)` at spawn (server owns it) and never leave it on auto. Possession (dribbling) is a server state, not physics (rule 2).

2. **Dribbling is possession, not physics: the ball follows the possessor's feet.**
   Why: a free physics ball pushed by a running character bounces off feet and lags; possession gives control a 10-year-old can feel.
   How: when a player takes possession, the server attaches the ball with an `AlignPosition` (+ `AlignOrientation` off) to an attachment 2.5 studs in front of the possessor's root and sets the ball's owner to that player; on kick, steal or loss it detaches and returns to server ownership.

3. **Kicks are decided by the server from a server-timed charge.**
   Why: a client that sends "power = 1, direction = goal" scores from anywhere.
   How: `ShootStart` and `ShootRelease` remotes; the server measures hold time itself (`os.clock()`), clamps charge to 0-1 over 1.2 s, checks the shooter is the possessor or within 5 studs of the ball, clamps the aim direction to within 60° of the character's facing, and applies the velocity.

4. **The shooter sees the kick at once; everyone sees the true ball within one round trip.**
   Why: server-applied force stutters for high-ping players and has a 100-200 ms delay, as threads note [1][3]; hiding that delay is a design job.
   How: the client plays the kick animation, sound and a short "ghost ball" flight locally the instant the button is released, then fades the ghost into the real ball when it arrives (under 0.25 s).

5. **Goals are scored only by the server, from the ball's server-side position crossing the goal plane.**
   Why: the client could report a goal, or a client-owned ball could be dragged in.
   How: server checks at 30 Hz whether the ball's center crossed the goal's front plane inside its width and height and that the ball is not attached to a player.

6. **Steals and tackles have range, cooldown and a tell.**
   Why: instant unavoidable steals feel unfair, and spammable ones break the game.
   How: tackle range 6 studs, 1.0 s cooldown, 0.25 s wind-up animation visible to the victim; success if the target is the possessor within range at the end of the wind-up and not in a 0.3 s post-steal immunity window.

7. **Matches are 5 minutes ± 2, with golden goal for ties in ranked.**
   Why: short matches keep queues moving and fit sessions.
   How: 2 halves × 2.5 min (soccer) or 4 × 1.5 min (basketball); 60 s golden-goal overtime; casual ties allowed.

8. **Teams are balanced by rating before kickoff, and parties stay together.**
   Why: lopsided teams are the main reason players leave a match.
   How: sort players by rating, snake-draft into two teams (A, B, B, A, …), keep parties on the same side, then swap one pair if team averages differ by more than 100 rating.

9. **Leavers are replaced within 20 s, and leaving ranked has a cost.**
   Why: a 3v4 match is no fun for the short side.
   How: casual: open the slot to join-in-progress from the lobby queue, or fill with a simple bot after 20 s. Ranked: the leaver loses full rank points; the short team loses half points if they lose.

10. **AFK players are moved to spectate after 45 s idle.**
    Why: an AFK teammate is as bad as a leaver.
    How: server tracks last input-driven action (moves over 2 studs, remote calls); at 30 s idle a warning, at 45 s move to bench and open the slot.

11. **Rank changes use Elo with K = 32 (K = 48 for the first 10 matches).**
    Why: players want to see the number move fairly after every match.
    How: expected score `E = 1 / (1 + 10^((Rb − Ra)/400))` using team averages; `ΔR = K · (S − E)` per player; tiers every 200 rating (Bronze 0-999, Silver 1000-1199, …).

12. **Abilities are on cooldowns of 8-30 s and are readable from 30 studs away.**
    Why: anime moves are the fun, but unreadable moves feel like cheating.
    How: each ability has a 0.2-0.5 s wind-up with a color flash and a distinct sound; cooldowns in Config; the server validates cooldown and range.

13. **Every style or ability is viable; rarity adds options, not a win button.**
    Why: tier lists already rank styles hard [7][9]; if Mythics simply win, free players quit.
    How: Balance caps the stat gap between the lowest and highest rarity at 20% on any single stat; Mythics get more unique moves, not much bigger numbers. Ranked can be run in "standard styles only" seasons.

14. **Spin odds are shown and pity is visible.**
    Why: Roblox's paid random items policy requires every outcome with numeric odds [10]; guides describe Blue Lock Rivals' pity guaranteeing a Mythic style every 50 Lucky Spins [11].
    How: the spin screen lists every style rarity with its percent and a "Mythic in N" counter from server data.

15. **Every input has keyboard, touch and gamepad, and shooting works with one thumb.**
    Why: studio rule; most players are on phones.
    How: right-side touch buttons (Shoot hold-to-charge, Pass, Tackle, Sprint, Ability 1-3) bound with ContextActionService [12][13]; gamepad RT shoot (charge by hold), RB pass, X tackle, LT sprint, LB/Y/d-pad abilities [14].

16. **Practice mode is always one button away.**
    Why: skill is the retention engine; players need a place to try moves without letting a team down.
    How: a practice field in the lobby with a ball per player (client-owned, local only), targets on the goal, and a shot-power readout.

17. **The field is a fixed, standard size per mode.**
    Why: consistent fields make skills transferable and passes predictable.
    How: 5v5 soccer field 180×110 studs, goal 24×10; 3v3 basketball half-court 60×50, hoop at 10 studs height; set in Config and built once.

18. **The match never waits for a full lobby.**
    Why: empty queues kill new games.
    How: matches start at 2v2 minimum after a 20 s countdown and accept joiners up to the cap during the first half.

## 3. Top games in the genre

### Blue Lock Rivals
**What it does:** An anime-ability soccer game where players roll **styles** and **flows** with spins. Guides publish style and flow tier lists (S-tier entries such as Kaiser, Kunigami, NEL Isagi, Sae and NEL Bachira in one October 2025 list) and note rarer styles are usually, but not always, stronger [9][7]. One guide gives Mythic odds of 0.5% on regular spins and 5% on Lucky Spins; another describes a guaranteed Mythic every 50 Lucky Spins and a preference system that steers rolls toward a target tier [6][11]. Spins come from codes, daily challenges and matches, and Lucky Spins can be bought with Robux [6]. Guides exist for getting individual styles [15].
**Steal:** Style rolls as the collection layer on top of a skill game; a premium spin with better odds plus pity; tier-list culture as free marketing; daily challenges paying spins.
**Avoid:** Licensed anime characters and names (it is based on an existing manga; we make original styles). Avoid power gaps so large that rolls decide matches (rule 13).

### Basketball games (Basketball Legends and similar)
**What it does:** Court basketball with dribble, shoot, block and steal, usually 1v1 to 3v3 on many courts in one server (details unverified in our sources).
**Steal:** Many small courts in one server, so pickup games form instantly; a shot meter with a visible "perfect" window.
**Avoid:** Random shot outcomes the player can't read; make the meter the skill.

### Football and touch-football games
**What it does:** American football with throw, catch and tackle, often with leagues run by the community (unverified in our sources).
**Steal:** Positions with different verbs (thrower, catcher, blocker); community leagues as long-term retention.
**Avoid:** Complex rulebooks; simplify downs and penalties.

### Volleyball and dodgeball party sports
**What it does:** Short, high-energy matches with simple rules (unverified details).
**Steal:** One-button gameplay that's instantly fun on a phone; rounds under 2 minutes.
**Avoid:** Physics balls with no aim assist; at phone precision, rallies die instantly.

### Community soccer projects on DevForum
**What it does:** The DevForum is full of soccer and football ball threads: server force stutters for high-ping players and client force with kicker ownership feels better [1]; the ball owner stays owner until tackled, and keeping the ball awake fixed a sync bug [2]; server-only velocity has visible lag, and firing an event so clients apply velocity locally was one proposal [3]; choppy ball paths even with server ownership pointed at physics load [4]; and how to make a ball feel less heavy [16].
**Steal:** The lessons, not the code: pick one authority, hide the delay with local feedback, test at 200 ms ping.
**Avoid:** Shipping without testing on a laggy connection (Studio's network simulation settings).

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns on the lobby pitch next to a ball with a pulsing "Kick" button. | Practice ball is local and instant. |
| 3-10 s | Kicks the ball into a big open goal; net ripples, "GOAL!" toast, crowd sound. | First success under 10 s. |
| 10-30 s | Prompt: "Hold to power up". Second shot uses charge; power bar shows. | Teach charge. |
| 30-45 s | A glowing "Play 3v3" pad 20 studs away; stepping on it shows "Match in 12 s (4/6)". | Queue fills with joiners or bots. |
| 45-60 s | Teleport or walk-in to the match pitch; teams shown with colors; kickoff countdown 3-2-1. | Team balance runs here. |
| 60-90 s | First touch: the ball snaps to feet when you run into it (possession). Pass arrow points to the nearest teammate. | Possession feel is the hook. |
| 90-180 s | First tackle on you: wind-up visible; tip "Pass before they reach you!" | Teach the counter. |
| 180-300 s | Half time at 2:30 with a 5 s score card; second half. A goal or assist gives a personal pop. | Feedback for contribution, not only goals. |

After the first match (~5-6 min): result screen with coins, XP, a "First match" bonus and a free spin or cosmetic. In anime sports, the first spin is free and guaranteed Rare+.

Opening rules:
1. **First ball touch in under 10 s, before any match.**
2. **No shop, spin or daily modal before the first match ends.**
3. **The first match is casual, never ranked,** with bots filling if needed.
4. **Tips appear at the moment they're useful** (on first possession, first tackle), ≤ 8 words.

## 5. Progression and economy

### Match rewards (targets)
- Coins: win 100, loss 50, draw 70; +20 per goal, +10 per assist, +10 per save/steal, capped at +80 per match from actions.
- XP: 50 per match + 2 per action; level L needs `150 · L^1.4` XP.
- MVP (highest match score) +30 coins. Match score = goals·10 + assists·6 + saves/steals·4 + passes completed·1.

### Ranked
- Elo per rule 11. Placement: first 10 matches K = 48. Seasons of 6-8 weeks with a soft reset `R_new = 1000 + 0.5 · (R − 1000)`.
- Season rewards by peak tier: title, ball trail, kit.

### Styles and abilities (anime sports)
- Spins from: daily challenges (3 per day), level-ups (1 per level), match wins (1 per 5 wins), codes.
- Studio default spin rates (all shown): Common 60%, Rare 28%, Epic 9%, Legendary 2.5%, Mythic 0.5%. Lucky spin: Mythic 5% with pity at 50 (the shape guides describe [6][11], not their exact numbers).
- A **lock/keep** system: players choose to keep or discard a rolled style; 2 free style storage slots, more by pass.
- Each style: one passive (e.g. +8% sprint), 2-3 moves; flows (temporary super mode) charge from match actions.
- Stat gap cap: rule 13.

### Cosmetics
Kits, ball skins, goal explosions, celebrations and emotes priced 200-5,000 coins, plus premium versions for Robux. Cosmetics never change stats.

### Solo skill sports
Score-based: courses (golf holes, bowling lanes, ski runs) unlock with stars earned (3 stars per course by score thresholds); gear (clubs, balls, boards) unlocks with coins and changes feel slightly (±10%) but never the scoring rules.

## 6. Monetization that fits

Players pay for **looking good while playing** (most of it), **rolls** (anime sports), **convenience** (storage, private servers) and **status**.

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Spins / Lucky spins | Developer product | 25-49 R$ each, packs 99-999 R$ | Spin screen only |
| Style storage +2 slots | Game pass | 99-199 R$ | Style screen when full |
| Goal explosion packs | Game pass or product | 79-249 R$ | Cosmetics shop, previewed |
| Kits and ball skins | Product | 49-199 R$ | Cosmetics shop |
| VIP (tag, 1.5× coins, VIP lobby) | Game pass | 199-399 R$ | Shop |
| Private server | Subscription | 100-200 R$/month | Popular for friend matches and community leagues [17] |
| Season pass | Game pass per season | 399-699 R$ | Season board; free track always |

Rules:
1. **One `ProcessReceipt`, idempotent by `PurchaseId`** [18][19].
2. **Spin products follow the paid random items policy:** all outcomes with numeric odds [10]; check `PolicyService` for restricted players and offer direct style or cosmetic purchases instead [20].
3. **No purchase prompts during a match.** Shops live in the lobby and the result screen.
4. **No paid stats in ranked beyond the rule 13 cap.** Ranked can lock to standard styles.
5. **Passes checked on the server** in `pcall` [21].
6. **Off-limits:** paid-only abilities that win matches, pity that resets on purchase, hidden odds, "rank boost" products.

## 7. UI and HUD for this genre

A sports HUD must be readable mid-sprint on a phone. See [[05 UI and HUD]], [[08 Mobile]], [[16 Console and Controllers]].

| Element | Position (UDim2 / AnchorPoint) | Size (1080p offsets, UIScale) | Notes |
|---|---|---|---|
| Scoreboard | (0.5, 0, 0, 12) / (0.5, 0) | 360×64 | Team colors, score, clock mm:ss, half |
| Stamina bar | above the character (BillboardGui) or (0.5, 0, 1, −140) | 160×12 | Drains while sprinting |
| Power meter | above the character while charging | 140×16 | Perfect window highlighted |
| Ability bar | (1, −16, 1, −16) / (1, 1) on PC/console | 3 × 72×72 | Cooldown sweep, key glyphs |
| Touch buttons | right side | Shoot 120×120, others 88×88 | Shoot is biggest, bottom-right |
| Possession marker | ring under the possessor | — | Team color, visible 60 studs away |
| Goal banner | (0.5, 0, 0.3, 0) | 600×120 | Scorer name, assist, 2.5 s |
| Result screen | centered | 900×600 | Score, MVP, personal stats, rank change "+18", rewards |

Rules:
1. **Touch layout:** left half is the thumbstick; right side holds Shoot (bottom-right, 120×120), Pass, Tackle, Sprint and abilities in an arc. Nothing in the top 60 px.
2. **Pass target highlight:** the teammate the pass will go to has an arrow; pass direction uses the camera or stick direction with a 30° assist cone.
3. **Team colors** are high contrast and colorblind-safe (blue `#2E6BFF` vs orange `#FF8C1A`), on kits, rings and the scoreboard.
4. **Gamepad:** RT hold-to-charge shoot, RB pass, X tackle, LT sprint, LB / Y / d-pad up abilities, B emote wheel off-match only; menus selectable with `GuiService.SelectedObject` and B to close [14][22].
5. **Menus** (Spin, Styles, Cosmetics, Ranked) are ScreenGuis built in StarterGui; cosmetic cards are a cloned template.
6. **Replays** of goals (optional): record the ball and players' positions for the last 5 s on the server at 10 Hz and play them back client-side from a free camera; skippable.

## 8. World and look

1. **The field is standard and lit like a stadium:** white lines as thin parts or Decals on a `Grass` field, goals with nets (Trusses or meshes with `CanCollide` on the frame only), floodlights and an arena bowl as cheap low-poly stands.
2. **Invisible walls at the field edge** (or a fenced arena) keep the ball in play: walls 30 studs tall, `Transparency = 1`, `CanCollide = true` only for the ball's collision group, so players don't hit them awkwardly (collision groups [23][24]).
3. **The ball is big and bright:** diameter 2.5-3 studs (bigger than real for readability), a contrasting color, a trail when fast, and a ground shadow decal so height reads.
4. **Lobby:** a plaza with practice pitches, queue pads, a spin altar, a cosmetics shop, and leaderboards; built as Instances in `Workspace.Map.Lobby`.
5. **Multiple pitches in one server** for pickup play (Workspace.Map.Pitches/Pitch_1..4), each a Model with goals, spawn slots and a `Bounds` part.
6. **Effects:** goal explosions are the show (≤ 3 s, ≤ 200 particles), ability VFX with team color tint, shot trails. Keep `CastShadow = false` on VFX parts.
7. **Camera:** default follow camera with Shift Lock option; a "ball cam" toggle that keeps the ball in frame.
8. **Lighting:** bright daylight for casual pitches; night stadium with floodlights for ranked.

## 9. Retention and social

1. **Parties:** friends queue together and stay on one team (rule 8).
2. **Daily challenges** pay coins or spins (score 2 goals, 5 assists, win a ranked match).
3. **Ranked seasons** with tier badges and season rewards.
4. **Leaderboards:** top rated players and most goals this week (ordered stores) [25][26].
5. **MVP and highlight moments** on the result screen; "Player of the match" title shown on the next lobby join.
6. **Clubs / teams:** groups of players with a tag and a shared weekly score (later feature; needs moderation).
7. **Private servers** for community leagues and scrims [17].
8. **Spectating:** benched or waiting players can watch the match with a free camera.
9. **Return hooks:** daily free spin, season countdown on the lobby board, codes in Settings.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Team sport | Every 2-3 weeks | A pitch or mode, cosmetics, balance pass |
| Anime-ability sport | Every 2 weeks | 1-3 styles or abilities, balance pass, event |
| Ranked | Seasons of 6-8 weeks | Soft reset, new rewards |
| Solo skill sport | Monthly | New courses or lanes, a board season |

Rules:
1. **Balance changes ship with numbers** in patch notes on the lobby board.
2. **New styles get a week of "event odds"** shown on the spin screen with exact rates.
3. **Real-world sports calendar events** (summer tournament, a final) are good event hooks; use generic names, not real competitions or clubs.
4. **Watch match-length and leaver funnels** ([27]); rising leaver rates usually mean a balance problem.
5. **Bots get better** as the player base grows, then retire from ranked entirely.

## 11. Building it in Studio

### Build order
1. **Architect:** sport, team size, match length, possession model, abilities (or not), ranked or casual, lobby layout and server topology in `plan.md`.
2. **Balance:** rewards, Elo, style rates, ability cooldowns, stat-gap cap in `economy.md`.
3. **Scenic:** one pitch and the lobby as Instances (field, goals with `GoalZone` parts, spawn slots, bounds).
4. **Builder:** `BallService` (spawn, ownership, possession, kick, goals) and the client `BallController` (local kick feedback, ghost ball). **Playtest** tests at 0 ms and 200 ms simulated latency with two clients in Studio before anything else.
5. **Builder:** `MatchService` (queue, teams, kickoff, clock, halves, score, results), `TackleService`, `AfkService`.
6. **Frame:** scoreboard, power meter, touch buttons, ability bar, result and lobby menus.
7. **Builder:** `AbilityService` (if any) with server cooldowns; **Librarian:** VFX and animations.
8. **Builder:** `RankService` (Elo, seasons, ordered stores); **Merchant:** spins and cosmetics with `SpinService`.
9. **Kid Tester:** first match on a phone; **Reviewer:** forges kick, tackle, ability and spin remotes; checks goals can't be faked.
10. **Producer:** section 15 with evidence.

### Architecture
```
ReplicatedStorage/
  Shared/Config          FIELD, MATCH, KICK, TACKLE, abilities, styles, rates, rewards, ids
  Remotes/               ShootStart, ShootRelease, Pass, Tackle, Ability, Sprint (C→S)
                         Possession, Goal, MatchState, KickFx (S→C)
ServerScriptService/Services/
  PlayerData, BallService, MatchService, TackleService, AbilityService, AfkService,
  RankService, SpinService, ProductService
StarterPlayer/StarterPlayerScripts/Controllers/
  BallController, InputController, HudController, CameraController
Workspace/Map/
  Lobby/..., Pitches/Pitch_1/ (Field, GoalA/GoalZone, GoalB/GoalZone, Spawns, Bounds, BallSpawn)
```

### Remotes contract

| Remote | Dir | Args | Server checks | Limit |
|---|---|---|---|---|
| ShootStart | C→S | — | in match; possessor or ≤ 5 studs from ball | 3 per s |
| ShootRelease | C→S | aim: Vector3 (unit) | matching ShootStart; aim unit and within 60° of facing; charge from server clock | 3 per s |
| Pass | C→S | aim: Vector3 | possessor; aim checks | 3 per s |
| Tackle | C→S | — | in match; cooldown 1 s; not possessor | 2 per s |
| Ability | C→S | slot: 1-3 | style owns ability; cooldown; range; match phase | 4 per s |
| Sprint | C→S | on: boolean | stamina > 0 | 10 per s |
| Possession / Goal / MatchState | S→C | userId / team, scorer, assist / phase, clock, score | — | on change |
| KickFx | S→C | userId, origin, velocity | — | per kick |

The client never sends "I scored", "my shot power", "I stole it" or "my rank".

### Data schema
```lua
-- PlayerData v1 ("u_<UserId>")
{
	v = 1, coins = 0, xp = 0, level = 1,
	rating = 1000, placements = 0, season = 1, peakTier = 0,
	wins = 0, losses = 0, goals = 0, assists = 0,
	styles = { equipped = "Basic", owned = { Basic = true } }, slots = 2,
	spins = 3, lucky = 0, pity = { lucky = 0 },
	cosmetics = { owned = {}, kit = "Default", ball = "Default", goalFx = "Default" },
	daily = { day = 0, done = {} },
	receipts = {},       -- [PurchaseId] = os.time(), last 50
	settings = { ballCam = false, music = true },
}
```
`pcall` every data-store call [28][29].

### Luau: ball ownership and possession (server)
```lua
--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes

local BallService = {}
local ball: BasePart
local align: AlignPosition
local possessor: Player? = nil
local immuneUntil: { [Player]: number } = {}
local lastTouch: { player: Player?, at: number } = { player = nil, at = 0 }

local function rootOf(p: Player): BasePart?
	local c = p.Character
	return c and c:FindFirstChild("HumanoidRootPart") :: BasePart?
end

function BallService.release()
	if not possessor then return end
	align.Enabled = false
	align.Attachment1 = nil
	possessor = nil
	ball:SetNetworkOwner(nil) -- back to the server
	Remotes.Possession:FireAllClients(0)
end

function BallService.give(p: Player)
	local root = rootOf(p)
	if not root then return end
	local foot = root:FindFirstChild("BallAttach") :: Attachment? -- added to every character on spawn, 2.5 studs forward, 2 down
	if not foot then return end
	possessor = p
	lastTouch = { player = p, at = os.clock() }
	align.Attachment1 = foot
	align.Enabled = true
	ball:SetNetworkOwner(p) -- the dribbler simulates the ball glued to their own feet: no lag for them
	Remotes.Possession:FireAllClients(p.UserId)
end

function BallService.possessor(): Player? return possessor end
function BallService.ball(): BasePart return ball end
function BallService.lastToucher(): Player? return lastTouch.player end

function BallService.init(ballPart: BasePart)
	ball = ballPart
	local a0 = Instance.new("Attachment")
	a0.Parent = ball
	align = Instance.new("AlignPosition")
	align.Attachment0 = a0
	align.Responsiveness = 60
	align.MaxForce = 1e6
	align.Enabled = false
	align.Parent = ball
	ball:SetNetworkOwner(nil)

	ball.Touched:Connect(function(hit: BasePart)
		if possessor then return end
		local model = hit:FindFirstAncestorOfClass("Model")
		local p = model and Players:GetPlayerFromCharacter(model)
		if not p or (immuneUntil[p] or 0) > os.clock() then return end
		local root = rootOf(p)
		-- only claim slow-ish balls: a 90 studs/s shot passes through defenders unless they tackle
		if root and ball.AssemblyLinearVelocity.Magnitude < Config.KICK.claimSpeed
			and (root.Position - ball.Position).Magnitude < 6 then
			BallService.give(p)
		end
	end)
end

function BallService.setImmune(p: Player, seconds: number)
	immuneUntil[p] = os.clock() + seconds
end

return BallService
```
The ball is a `Part` (Shape Ball, diameter 2.75, `CustomPhysicalProperties` density 0.3, elasticity 0.5, friction 0.6) in the ball's own collision group. `Touched` on the server works for both server-owned and client-owned parts, but always confirm distance on the server as above. Give each character a `BallAttach` attachment on `CharacterAdded`.

### Luau: server-timed shot (server)
```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local BallService = require(script.Parent.BallService)
local Remotes = ReplicatedStorage.Remotes

local started: { [Player]: number } = {}
local lastShot: { [Player]: number } = {}

local function canKick(p: Player): BasePart?
	local c = p.Character
	local root = c and c:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root then return nil end
	local ball = BallService.ball()
	if BallService.possessor() == p or (root.Position - ball.Position).Magnitude <= 5 then
		return root
	end
	return nil
end

Remotes.ShootStart.OnServerEvent:Connect(function(p: Player)
	if canKick(p) then started[p] = os.clock() end
end)

Remotes.ShootRelease.OnServerEvent:Connect(function(p: Player, aim: unknown)
	local t0 = started[p]
	started[p] = nil
	local now = os.clock()
	if not t0 or (lastShot[p] or 0) + 0.4 > now then return end
	if typeof(aim) ~= "Vector3" or aim ~= aim or math.abs(aim.Magnitude - 1) > 0.01 then return end
	local root = canKick(p)
	if not root then return end
	local facing = root.CFrame.LookVector
	if aim:Dot(facing) < math.cos(math.rad(60)) then return end -- aim must be roughly where you face
	lastShot[p] = now
	local charge = math.clamp((now - t0) / Config.KICK.fullChargeTime, 0, 1) -- server clock, not the client's
	local speed = Config.KICK.minSpeed + (Config.KICK.maxSpeed - Config.KICK.minSpeed) * charge
	local lift = Config.KICK.minLift + (Config.KICK.maxLift - Config.KICK.minLift) * charge
	local ball = BallService.ball()
	BallService.release()
	BallService.setImmune(p, 0.3) -- don't re-claim your own shot
	ball.AssemblyLinearVelocity = Vector3.new(aim.X, 0, aim.Z).Unit * speed + Vector3.new(0, lift, 0)
	Remotes.KickFx:FireAllClients(p.UserId, ball.Position, ball.AssemblyLinearVelocity)
end)

game:GetService("Players").PlayerRemoving:Connect(function(p)
	started[p] = nil
	lastShot[p] = nil
	if BallService.possessor() == p then BallService.release() end
end)
```
Config defaults: `fullChargeTime = 1.2`, `minSpeed = 40`, `maxSpeed = 110`, `minLift = 5`, `maxLift = 35`, `claimSpeed = 55`. On `KickFx` the shooter's client already showed a ghost ball (rule 4); other clients show the kick effect and let the replicated ball fly. Setting velocity directly lets friction and drag slow it naturally, as one thread suggests [1].

### Luau: goals (server)
```lua
--!strict
local RunService = game:GetService("RunService")
local BallService = require(script.Parent.BallService)

type Goal = { zone: BasePart, team: string } -- zone: a thin part across the goal mouth, front face pointing into the goal
local function insideGoal(zone: BasePart, pos: Vector3): boolean
	local rel = zone.CFrame:PointToObjectSpace(pos)
	local half = zone.Size / 2
	return rel.Z < 0 and rel.Z > -6 and math.abs(rel.X) <= half.X and math.abs(rel.Y) <= half.Y
end

local function watchGoals(goals: { Goal }, onGoal: (concededBy: string) -> ())
	local cooldown = 0
	local acc = 0
	RunService.Heartbeat:Connect(function(dt: number)
		acc += dt
		if acc < 1 / 30 then return end
		acc = 0
		if os.clock() < cooldown or BallService.possessor() then return end
		local pos = BallService.ball().Position
		for _, g in goals do
			if insideGoal(g.zone, pos) then
				cooldown = os.clock() + 3
				onGoal(g.team)
				return
			end
		end
	end)
end

return watchGoals
```
`MatchService` handles `onGoal`: score, scorer = `BallService.lastToucher()`, assist = previous toucher from the other two touches if same team within 6 s, goal banner, reset to kickoff. While the ball is attached to a dribbler, goals don't count (a dribbler must shoot).

### Luau: tackle with wind-up (server)
```lua
--!strict
local TACKLE_RANGE, WINDUP, COOLDOWN = 6, 0.25, 1.0
local lastTackle: { [Player]: number } = {}

local function tryTackle(p: Player)
	local now = os.clock()
	if (lastTackle[p] or 0) + COOLDOWN > now then return end
	lastTackle[p] = now
	Remotes.TackleFx:FireAllClients(p.UserId) -- everyone sees the tell
	task.delay(WINDUP, function()
		local target = BallService.possessor()
		if not target or target == p or not sameMatchOpponents(p, target) then return end
		local a, b = rootOf(p), rootOf(target)
		if a and b and (a.Position - b.Position).Magnitude <= TACKLE_RANGE then
			BallService.release()
			BallService.setImmune(target, 0.6)
			BallService.give(p)
		end
	end)
end
```
`sameMatchOpponents` checks both players are in the same match on opposite teams; `rootOf` as in BallService.

### Matchmaking and server topology
- **Casual:** one server holds the lobby and 2-4 pitches; queue pads assign players to pitches. Simple and good for launch.
- **Ranked:** a lobby place queues players; when 6 (3v3) or 10 (5v5) are found within ±150 rating (widening by 50 every 15 s), the lobby reserves a server and teleports them together with `TeleportOptions` [30]. Cross-server queues need MemoryStore; start with per-server queues and move to cross-server when the player count supports it.
- Team balance, leavers and AFK per rules 8-10. Ranked results are written by the match server with `UpdateAsync` on the player's data, never by the lobby from client claims.

## 12. Twists that work

1. **Anime-ability sports** with original styles (rules 12-14).
2. **Sport + simulator:** train kick power or jump on machines, then use it in matches (keep ranked stat-capped; see [[Genre - Simulator]]).
3. **Mini sports park:** several quick sports in one hub (bowling, golf, dodgeball) with one shared currency.
4. **Party sport chaos:** random modifiers per match (giant ball, low gravity, two balls).
5. **Career mode:** a solo season against bots with a story and cutscenes.
6. **Trick sports:** skateboarding, BMX, skiing with combo scoring and a board.
7. **Pets or mascots** that cheer and give cosmetic effects ([[Genre - RNG and Collection]]).
8. **Club tycoon layer:** build your stadium between matches with coins ([[Genre - Tycoon]]).
9. **Community leagues** run on private servers, with a league table board.

## 13. Failure modes

1. **Ball stutter and jumps:** ownership on auto or flipping between players [1][2][8].
2. **Laggy kicks:** server force with no local feedback [1][3].
3. **Fake goals or super shots:** client-reported goals or client-sent power.
4. **Unfair steals:** no wind-up, no cooldown, no range check.
5. **Lopsided teams** and parties split.
6. **Leavers and AFKs** ruining matches with no replacement.
7. **Empty queues:** waiting for 10 players that never come.
8. **Pay-to-win styles:** Mythics decide matches [7][9].
9. **Unreadable abilities:** no tell, no sound, instant effects.
10. **Phone-hostile controls:** small buttons, shoot requires mouse aim.
11. **Physics overload:** many loose balls and props in one server causing choppy ball paths [4].
12. **Licensed names:** real clubs, players or anime characters.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] The sport and the hook fit in five words; it isn't a sixth copy of a charting game (Pulse, `cli.mjs market`).
- [ ] Possession model, server kicks and server goals are in the plan (Reviewer reads it).
- [ ] We can start matches at 2v2 with bots and join-in-progress (no empty queue).
- [ ] Ranked has Elo, seasons and leaver penalties, or we ship casual-only first.
- [ ] Abilities (if any) are original, readable and stat-capped.
- [ ] Spin odds, pity and a policy-restricted alternative are in scope (if spins).
- [ ] Touch and gamepad layouts are drawn before the build.
- [ ] 8-week plan: cosmetics and a balance pass every 2 weeks, a season at week 6-8.

## 15. Checklist

- [ ] First ball touch within 10 s of joining (phone).
- [ ] Ball network owner is the server when loose and the possessor while dribbling (Studio "Show network owner" screenshot).
- [ ] Two Studio clients at 200 ms simulated latency: dribble, pass and shoot feel playable (Playtest notes).
- [ ] Forged ShootRelease (no start, huge aim vector, NaN, from 40 studs away) does nothing (Reviewer log).
- [ ] Shot power comes from the server's hold-time measurement.
- [ ] Goals are counted only by the server; a dribbled-in ball doesn't count.
- [ ] Tackles have a visible wind-up, a range of 6 studs and a 1 s cooldown.
- [ ] Teams are balanced by rating; parties stay together.
- [ ] Leaver slots refill within 20 s; AFK players are benched at 45 s.
- [ ] Elo updates after every ranked match; first 10 matches use K = 48.
- [ ] Spin screen shows every rarity's percent; pity counter matches server data.
- [ ] One `ProcessReceipt`; repeat receipts don't double-grant.
- [ ] Every action works on touch, keyboard and gamepad; menus selectable, B closes.
- [ ] Match length 5 ± 2 minutes (analytics over 50 matches).

## Common mistakes

1. Leaving ball ownership on auto [8].
2. Physics dribbling (pushing a loose ball) instead of possession.
3. Trusting client shot power or a client goal event.
4. Server-only kicks with no local feedback, so shots feel late [1].
5. Giving the kicker ownership after the shot and never taking it back (they can steer the ball).
6. Goal detection by `Touched` on the net (balls clip; touches fire twice).
7. No immunity window, so the shooter re-claims their own shot.
8. Tackles resolved on the client.
9. Queues that need a full lobby.
10. Same-color teams for colorblind players.
11. Abilities with no server cooldown.
12. Ranked rating written from the lobby based on client data.

## References

[1] What would be the best way to apply a force to a ball without "stutters"? (DevForum) — https://devforum.roblox.com/t/2403339 — server force stutters at high ping; client force and kicker ownership; set velocity directly.
[2] Ball Network Ownership Bug (DevForum) — https://devforum.roblox.com/t/ball-network-ownership-bug/2489664 — owner stays owner until tackled; keep physics awake.
[3] Soccer Ball Latency (DevForum) — https://devforum.roblox.com/t/soccer-ball-latency/2088353 — server-only velocity lag; clients apply velocity locally.
[4] Physics of soccer ball lagging (DevForum) — https://devforum.roblox.com/t/physics-of-soccer-ball-lagging/1776969 — choppy paths even with server ownership; check the MicroProfiler.
[5] Blue Lock Rivals styles (Pocket Tactics) — https://www.pockettactics.com/blue-lock-rivals-styles
[6] Blue Lock Rivals style tier list (Destructoid) — https://www.destructoid.com/blue-lock-rivals-style-tier-list/ — spin odds; spins from codes, dailies, matches; Lucky Spins for Robux.
[7] Blue Lock Rivals tier list: all styles and flows ranked (Dot Esports) — https://dotesports.com/roblox/news/blue-lock-rivals-tier-list-all-styles-and-flows-ranked
[8] Network ownership (Creator Docs) — https://create.roblox.com/docs/en-us/physics/network-ownership
[9] Blue Lock Rivals best Styles and Flows tier list, October 2025 (FRVR) — https://frvr.com/blog/roblox-blue-lock-rivals-styles-and-flows-tier-list
[10] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items
[11] Blue Lock Rivals Roblox Guide: How To Get Igaguri Flow and Style (Deltia's Gaming) — https://deltiasgaming.com/?p=201747 — Lucky Spin pity; preference system.
[12] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[13] Mobile input (Creator Docs) — https://create.roblox.com/docs/input/mobile
[14] Gamepad input (Creator Docs) — https://create.roblox.com/docs/input/gamepad
[15] Blue Lock Rivals Roblox Guide: How To Get Kunigami Style (Deltia's Gaming) — https://deltiasgaming.com/?p=139495
[16] How to make a ball "less heavy" (DevForum) — https://devforum.roblox.com/t/how-to-make-a-ball-less-heavy/1684528
[17] Private servers — https://create.roblox.com/docs/production/monetization/private-servers
[18] Developer products — https://create.roblox.com/docs/production/monetization/developer-products
[19] MarketplaceService.ProcessReceipt — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService/ProcessReceipt
[20] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md
[21] Passes — https://create.roblox.com/docs/production/monetization/passes
[22] GuiService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/GuiService
[23] Collisions (Creator Docs) — https://create.roblox.com/docs/en-us/workspace/collisions.md
[24] PhysicsService (engine reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md
[25] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore
[26] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md
[27] Funnel events — https://create.roblox.com/docs/production/analytics/funnel-events
[28] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[29] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md
[30] TeleportOptions (engine reference) — https://create.roblox.com/docs/reference/engine/classes/TeleportOptions.md

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[05 UI and HUD]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[13 Building It Right]] · [[16 Console and Controllers]] · [[17 Security and Anti-Cheat]] · [[Genre - Battlegrounds]] · [[Genre - Simulator]] · [[Genre - Party and Social Hangout]]
