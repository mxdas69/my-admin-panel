---
tags: [vault, genre, obby, platformer, tower-obby, difficulty-chart, speedrun, troll-obby]
for: [lead, pulse, architect, builder, scenic, balance, playtest, kid-tester]
also: [frame, merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Obby

An obby (obstacle course) is a run of jumps, hazards and moving parts between checkpoints. It is the oldest native Roblox format and still one of the platform's own top-level genres: Roblox's publishing taxonomy lists "Obby & platformer" as a genre with the subgenres Classic Obby, Runner and Tower Obby [1]. Roblox teaches Studio itself with an obby: the official building curriculum starts from the Classic Obby template, a course that "starts easy and becomes more difficult" with moving platforms, launch pads and parts that set a character's health to zero [2][3]. Every RoCrew agent should know this genre, because almost every other genre borrows its parts (checkpoints, kill parts, moving platforms, stage counters).

This page covers the five shapes the crew builds: **classic stage obbies** (numbered stages with checkpoints), **tower obbies** (a stacked, often random tower with a round timer and no checkpoints, the Tower of Hell shape), **difficulty charts** (stages or towers grouped into named difficulty tiers), **speedrun obbies** (a fixed course, a clock and a global board), and **troll obbies** (courses built on fair-but-sneaky surprises). It also covers the hybrids that keep the genre fresh: story escapes, rising-water rounds, creator tools and stat-growth obbies.

The obby looks easy to make, which is exactly why most obbies fail. The genre is crowded with near-identical courses, the skill ceiling is set by the Roblox character controller (not by the designer), and players leave the moment a jump feels unfair or the first stages look like every other obby. A DevForum creator asking why players left after only 3-4 minutes was told the obstacles repeated and the opening wasn't distinctive [13]. The difference between a dead obby and a living one is readable hazards, a tuned difficulty curve, a unique first minute, a reason to come back, and fair monetization.

Read this page before pitching or planning any obby, tower, difficulty chart, speedrun or obby hybrid, and before building checkpoints, kill parts or moving platforms in any other genre. Pair it with [[02 The Core Loop]], [[01 The First Five Minutes]], [[04 Progression and Economy]] and [[13 Building It Right]].

## 1. What it is and why it works on Roblox

**The audience.** Obbies are the first game type many young players try, and they reward the one skill every Roblox player already has: moving and jumping the default character. There is nothing to learn but the course. Roblox uses an obby as the beginner's template for exactly this reason [2]. The audience splits in three:
- **Casual and young players** (roughly 7-12 in our design assumptions) who want steady visible progress, bright colors and forgiving jumps. Very long, easy courses serve them: Mega Fun Obby dates from 2009 and its speedrun page lists 550 stages with full runs around an hour [48]; newer listings advertise 575+ "colorful stages" with automatic progress saving [49].
- **Skill players** who want a fair, hard, timed challenge and bragging rights: Tower of Hell, difficulty charts, Speed Run 4 [40][43][45].
- **Friend groups** who want a shared thing to laugh at: races, troll obbies, co-op escapes, round-based towers where everyone shares one clock [36][53].

**Session shape.** A classic obby session is a straight line: join, climb stages, leave when stuck or bored, come back to the saved stage. A tower obby session is a series of short rounds on a fresh random tower, each under a shared timer (about six minutes in the descriptions we found; guides disagree by tower type) [41][42]. A speedrun session is many short retries on one course. Design targets for this studio: a first checkpoint in under 10 s, 15-40 s per stage in the first zone, a first session of 15-25 minutes for a classic obby, and 3+ rounds per session for a tower obby.

**Why players come back.**
1. **Saved progress.** "I'm on stage 87" is a reason to return tomorrow. Stage counts are visible goals.
2. **Mastery.** The same jump that killed you 20 times becomes easy. Difficulty-chart players climb named tiers, and the tier names are the goal [43][44].
3. **Novelty per run.** Tower of Hell assembles its tower from a pool of sections (one wiki references 364) so every round is a new puzzle [36].
4. **Social proof.** Leaderboards, completion badges, wins counters, trails and titles show other players what you beat.
5. **New content.** Updates that add stages or towers bring returning players straight to the new part.

**Why it works on Roblox specifically.** The engine hands you a tuned platformer character, physics, multiplayer and saving for free. The obby is the format that uses those defaults most directly, so it runs on every device and needs almost no tutorial. That same fact means you can't win on "having an obby"; you win on theme, curve, feel and the hook on top.

## 2. The core loop

**Loop statement (classic):**
> Players **jump through stages** to reach **the next checkpoint**, which **saves their progress and pays coins**, which they spend on **trails, coils and cosmetics** so they can **tackle harder zones in style and show it off**.

**Loop statement (tower):**
> Players **climb a random tower against a shared clock** to earn **coins and a win**, which they spend on **gears and server-wide mutators** so they can **climb the next tower faster or mess with everyone else** [36][37][38].

**Loop statement (difficulty chart):**
> Players **beat stages of a named difficulty** to **unlock the next tier and its badge**, so they can **prove they beat a harder tier than their friends** [43][44].

**Loop statement (speedrun):**
> Players **run a fixed course against the clock** to **beat their best time and climb the global board**, so they can **find a faster line and run again** [45][47].

**Loop statement (troll):**
> Players **fall for a trap** to **learn the trick**, so they can **beat the section and laugh when a friend falls for it** [53].

| Layer | Time scale | Classic obby | Tower obby | Difficulty chart | Speedrun |
|---|---|---|---|---|---|
| Micro | 0.5-3 s | One jump lands, a sound plays | One jump lands | One jump lands | One clean input |
| Short | 10-60 s | Checkpoint reached, stage +1, coins | A section cleared | One stage cleared | A split beaten |
| Session | 10-30 min | A zone of 10 stages done, a badge | 3-6 rounds, a win, a gear bought | A tier finished, a badge | A personal best |
| Long | days-weeks | Finish all stages, new stages per update | Wins total, level, cosmetics | The next tier, the hardest tower | A board rank |

Rules for the loop:
1. **Every checkpoint is a reward.** A sound, a pop of particles, "+5 coins" and the stage number ticking up. A checkpoint with no feedback is a missed reward beat.
2. **A loss costs seconds, not minutes, in the first zone.** Target: in stages 1-20 a fall sends you back at most 15 s of play. In hard tiers losing more is part of the appeal, but say so up front (tier color, name, warning sign).
3. **Every 10 stages is a session beat.** A zone change (new theme, new music, new mechanic), a badge and a free cosmetic or coin pile.
4. **The upgrade must not remove the challenge.** Coils and speed help, but the course must still need skill, and timed boards must turn them off.

## 3. Top games in the genre

### Tower of Hell
**What it does:** A round-based tower obby by YXCeptional Studios: a tower assembled from random sections, a shared round timer, and no checkpoints, so a slip can drop you down the tower [40][42][36]. Normal towers are described as 6 sections and Pro towers as 12 [41]. Coins from climbing buy single-player gears at an in-tower shop (Gravity Coil, Speed Coil, Fusion Coil, Trowel, Hook, Hourglass; one guide lists the Gravity Coil at 80 coins on the Noob tower and 152 on the Pro tower) [38][39], and mutators, which affect everyone in the server and expire when the round ends; coin mutators scale in price with tower length [35][37]. Private servers cost 250 Robux per month and unlock extra settings such as locking the shop, skipping the current tower and changing tower size [34].
**Steal:** Random assembly from a large section pool (a fresh run every round with fixed content cost); a shared clock that makes everyone's round end together, which creates a social "lobby" moment; server-wide mutators bought with soft currency, which turn spending into a social act; gear prices that scale with tower length; private-server settings as a paid perk.
**Avoid:** Copying the no-checkpoint rule into a casual obby. It works because the tower is short (6-12 sections) and rounds are short. Don't copy its art, section designs, names or UI.

### Juke's Towers of Hell and difficulty-chart towers
**What it does:** A tower game organized into rings/realms where every tower has a named difficulty; its wiki notes that Ring 1 contains towers across every difficulty from Easy to Insane [43]. Its difficulty scale is copied widely: fan wikis build charts in the same style, splitting each difficulty class into sub-tiers such as Baseline, Low, Middle, High and Peak [44], and other games (Find the Chomiks, for one) describe their difficulty chart as based on JToH's [60].
**Steal:** Named, color-coded difficulty tiers that players can say out loud ("I beat a Remorseless"); a hub world where tower entrances are the menu; per-tower badges.
**Avoid:** Inventing tiers so fine-grained that a new player can't tell them apart. Our charts use at most 8-10 tiers.

### Speed Run 4
**What it does:** A level-based speedrun obby with portal-to-portal levels and a living speedrun community: speedrun.com hosts leaderboards with level-count categories (5, 16 and all levels) and skip/no-skip variants, plus a separate Classic version [45]. A community guide documents skips and notes that the developers raised the death plane, which changed how one skip works [46]. Guinness World Records listed the fastest 5-level no-skips completion as 1:57.6 by kriptopolis on 19 March 2020 (already beaten on later boards) [47].
**Steal:** Short levels with portals (instant restarts, clear segments), categories that give different players different goals, designer awareness of skips.
**Avoid:** Shipping a speedrun game without server-validated times; the community will find exploits faster than you.

### Mega Fun Obby and the "huge easy obby" family
**What it does:** A very long, forgiving course. The speedrun.com page lists the 2009 game with 550 stages and full runs around an hour [48]; roundups describe it as massive and more forgiving than Tower of Hell [57]. Many newer games copy the shape and name ("575+ colorful stages", automatic progress saving) [49].
**Steal:** Length as a value proposition for young players, bright zone colors, autosave, skip-stage products.
**Avoid:** Length with no variety. A DevForum review of a struggling obby found most obstacles repeated and recommended water, trusses and other mechanics [13].

### Obby Creator
**What it does:** A Roblox game where players build their own obbies with in-game objects instead of Studio, and play each other's [55][54].
**Steal:** User-generated stages are infinite content; a "play the community's best" rotation; creators bring their friends.
**Avoid:** Shipping creator tools without moderation, reporting and limits; user content is your responsibility.

### Flood Escape 2 (round-based escape maps)
**What it does:** Round-based maps where a team presses buttons and escapes rising water. Its wiki tracks community-made maps with a difficulty tier, a button count and a star rating (for example, an Easy map with 8 buttons rated 1.1 stars), and notes that one community map was the first Easy and first community map added to the game [51][52]. A separate Community Maps experience hosts player-made levels [51].
**Steal:** A rising hazard (water, lava, darkness) that gives an obby a clock and a shared panic; buttons that need teamwork; difficulty and star ratings on every map; a community map pipeline.
**Avoid:** Making one player's mistake fail the whole team with no comeback.

### Barry's Prison Run and the story-escape obby family
**What it does:** A prison-escape obby whose listing frames the run as a jailbreak during a lax guard's shift with 25 obstacles to freedom; many themed versions keep the same structure with a different guard [50].
**Steal:** A one-line premise and a named antagonist turn a plain course into a story kids retell; a short fixed length (around 25 obstacles) fits a 10-20 minute session.
**Avoid:** Using someone else's characters, memes or brands. Make your own antagonist. Clone families flood the charts and are easily forgotten.

### Troll obbies
**What it does:** Courses that deliberately trick the player: fake platforms that drop you, kill parts dressed as safe zones, fake checkpoints, teleporter traps and misleading arrows; their appeal is that each failure works like a puzzle and beating a devious section feels great [53].
**Steal:** One surprise per section, learnable on the first death, funny rather than cruel; friends watching friends fall.
**Avoid:** Fake *saves*. Never fake a checkpoint so that progress is lost on rejoin; that converts laughter into a one-star rating.

### Classic Obby template (Roblox)
**What it does:** Roblox's own beginner course: platforms that get harder, platforms that move, launch players up, or set health to zero [2], used across the official "Intro to building" curriculum [3].
**Steal:** The baseline vocabulary (kill part, mover, launcher, checkpoint) every new player already understands.
**Avoid:** Shipping anything that still looks like the template. Players recognize it instantly.

### Really Easy Obby and brand-music obbies
**What it does:** 2025 obby roundups describe Really Easy Obby as a beginner course that, as of 2025, includes KIDZ BOP songs with musical notes to collect along the way [56][57].
**Steal:** A collectible layered over the course (notes, stars, letters) gives a second goal on the same path; music changes per zone.
**Avoid:** Licensed music or brands without a real deal; we don't do partnerships ourselves.

### The +stages "obby but" family
**What it does:** A large share of obby listings sell themselves on a stage count or a twist in the name. Pro Game Guides' April 2025 roundup of "toughest and trendiest" obbies and other lists show the range, from beginner courses to brutal towers [56][54].
**Steal:** Put the hook in the title and the first stage ("but you're on ice", "but the floor rises").
**Avoid:** A twist that only exists in the title.

## 4. The first five minutes, second by second

Targets are this studio's rules; Kid Tester verifies them on a phone.

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-2 s | Spawns on a wide Stage 0 pad facing the course. Title sign, the first platform 3 studs ahead with a glowing arrow. No popups. | Spawn pad 16×1×16 studs; camera faces +Z down the course; disable any shop auto-open. |
| 2-8 s | Three trivial jumps (3-stud gaps, 8×8 pads). Checkpoint 1 at ~8 s: chime, particles, "Stage 1!" toast, "+5". | First reward under 10 s. |
| 8-25 s | Stage 2 introduces the kill part safely: a wide path with a red neon strip to walk around, then a strip to jump over. A death here costs 3 s. | Kill color is introduced before it's needed. |
| 25-45 s | Stage 3-4: first truss or wall-hop, first moving platform (slow, 4 studs/s, wide). | One new idea per stage. |
| 45-90 s | Stage 5-7: combine two ideas. Stage 7 ends in a vista: the player sees the next zone across the map. | Sight line to a landmark [59]. |
| 90-150 s | Stage 8-10. Stage 10 is a reward stage: coin pile, free trail, zone badge, music change. | Session beat at ~2 min. |
| 150-240 s | Zone 2 opens with its new mechanic (bounce pads, conveyors, ice). First real challenge (3-5 deaths expected) followed by a breather. | Sawtooth curve. |
| 240-300 s | Stage ~15-20. After 3+ deaths on one stage the Skip button pulses once. The left menu shows "Trails" with a "new" dot. | Soft offer, never a popup. |

Opening rules:
1. **Nothing blocks the first jump.** No loading screen longer than 3 s, no shop, no daily reward modal, no codes popup in the first 60 s.
2. **The first stage must look like no other obby.** The DevForum advice to an obby losing players at 3-4 minutes was to make the first few levels as unique as possible [13]. Put your theme's best set piece in stages 1-5.
3. **Teach one thing per stage, then combine.** Never introduce a hazard type in a hard jump.
4. **The first death is free and instant.** Respawn at the checkpoint in under 1.5 s (set `Players.RespawnTime` to 1-1.5).
5. **Mobile first.** In stages 1-20 no pad is smaller than 4×4 studs and no gap is longer than 6 studs; thumbsticks are less precise than keyboards (see [[08 Mobile]]).

## 5. Progression and economy

### The physics budget (default character)
Default Roblox settings: `Humanoid.WalkSpeed = 16`, `Humanoid.JumpHeight = 7.2` (with `UseJumpPower = false`, or `JumpPower = 50`), `Workspace.Gravity = 196.2`. From these, take-off speed is √(2·196.2·7.2) ≈ 53.2 studs/s, time to the top is ≈ 0.27 s and a flat jump stays in the air ≈ 0.54 s, so the character's center travels ≈ 8.7 studs horizontally. The table below is computed from those formulas; verify each band on a jump test strip in Play Solo before using it.

| Jump | Air time | Center travel at 16 studs/s | Design band |
|---|---|---|---|
| Up 6 studs | ≈ 0.38 s | ≈ 6.1 studs | Hard only, gap ≤ 4 |
| Up 4 studs | ≈ 0.45 s | ≈ 7.2 studs | Medium, gap ≤ 5 |
| Flat | ≈ 0.54 s | ≈ 8.7 studs | Easy ≤ 4, Medium 5-6, Hard 7-8 |
| Down 5 studs | ≈ 0.62 s | ≈ 10.0 studs | Up to 8 |
| Down 10 studs | ≈ 0.69 s | ≈ 11.0 studs | Up to 9 |

Rules:
1. **Never require more than 8 studs of edge-to-edge gap on a flat jump at default settings.** Experts may clear slightly more, but the margin is your fairness budget.
2. **Never require a rise above 6 studs.** A 7.2-stud jump height leaves almost no time to land a 7-stud ledge.
3. **If you change WalkSpeed, JumpHeight or Gravity, recompute the table** and store the values in `Config`, never in scripts.
4. **Pad size bands:** Easy 6×6 or larger, Medium 3×3 to 4×4, Hard 1.5×1.5 to 2×2, Expert 1×1 or truss tips.

### Difficulty curve
Use a sawtooth: difficulty rises through a zone, drops at the zone start, and each zone's peak is higher than the last.

For stage `s` of `S` total, zone size `Z = 10`:
- Base difficulty `d(s) = (s / S) ^ 0.8` (0 to 1).
- Zone wobble `w(s) = 0.15 · ((s mod Z) / Z)` (rises through the zone, resets).
- Final `D(s) = clamp(d(s) + w(s), 0, 1)`.
- Gap `g(s) = 3 + 5 · D(s)` studs (3 to 8). Pad width `p(s) = 8 − 6 · D(s)` studs (8 down to 2). Moving speed `m(s) = 4 + 8 · D(s)` studs/s.
- Every stage where `s mod Z == 0` is a reward stage at `D = 0.1`.

Worked example (S = 100):

| Stage | d | w | D | Gap | Pad | Mover |
|---|---|---|---|---|---|---|
| 1 | 0.03 | 0.015 | 0.04 | 3.2 | 7.8 | 4.3 |
| 9 | 0.15 | 0.135 | 0.28 | 4.4 | 6.3 | 6.3 |
| 10 | reward | | 0.10 | 3.5 | 7.4 | 4.8 |
| 25 | 0.33 | 0.075 | 0.41 | 5.0 | 5.6 | 7.3 |
| 50 | 0.57 | 0.0 | 0.57 | 5.9 | 4.6 | 8.6 |
| 75 | 0.79 | 0.075 | 0.87 | 7.3 | 2.8 | 11.0 |
| 99 | 0.99 | 0.135 | 1.0 | 8.0 | 2.0 | 12.0 |

Targets for a 100-stage classic obby: average stage time 20 s in Zone 1 rising to 60-90 s in Zone 10 (including deaths); expected deaths per stage 0-1 in Zones 1-2, 1-3 in Zones 3-6, 3-8 in Zones 7-10; total completion 2-4 hours for an average player. Balance writes this table in `economy.md` and Playtest measures real times per stage from analytics.

### Difficulty-chart tiers (studio standard)
Community charts use named tiers and sub-tiers [44]. Ours:

| Tier | Color (hex) | Gap | Pad | Hazards | Expected deaths/stage |
|---|---|---|---|---|---|
| 1 Effortless | #FFFFFF white | ≤ 3 | ≥ 8 | none | 0 |
| 2 Easy | #3DDC6B green | ≤ 4 | ≥ 6 | static kill strips | 0-1 |
| 3 Medium | #FFD23F yellow | ≤ 5 | ≥ 4 | slow movers | 1-2 |
| 4 Hard | #FF8C1A orange | ≤ 6 | ≥ 3 | movers, spinners | 2-4 |
| 5 Difficult | #E8333A red | ≤ 7 | ≥ 2 | timed parts | 4-8 |
| 6 Challenging | #8E1B2E maroon | ≤ 7.5 | ≥ 1.5 | combined | 8-15 |
| 7 Intense | #4B4B5C slate | ≤ 8 | ≥ 1 | precision timing | 15-30 |
| 8 Insane | #2E6BFF blue | ≤ 8 | truss tips | everything | 30+ |

Each tier is 5-10 stages, ends with a badge, and shows its color on the stage counter, on the checkpoint and on the zone sign. A difficulty label must be truthful: Playtest flags any stage whose measured deaths sit outside its tier band for two weeks.

### Coins
Classic obby targets: 5 coins per checkpoint, +25 at each zone end, +100 at completion; trails cost 100-2,500 coins so the first trail is affordable at stage 20 and the best free trail near the end. Tower obby targets: 1-3 coins per section climbed, a completion bonus scaled by tower length, gears priced so one gear costs about one good round of coins (the 80/152 coin scaling for one coil across tower lengths is a useful reference [38]). Mutators cost 2-5× a gear because they affect the whole server [37].

### Wins and replay
Completion adds +1 Win (a leaderstat) and offers "Restart for a Win Trail" so finishers replay. A Hard Mode (same stages, 50% smaller pads or a timer) doubles content cheaply. Never reset a player's stage without asking.

## 6. Monetization that fits

Obby spending is about **saving time on a stuck stage**, **looking good**, and **playing with toys**. DevForum creators report that the skip-stage developer product is often their main earner, and replies advise putting prompts where players will see them rather than only behind a shop button, and advertising purchasable things as players progress [15][16]. The community guidance is to keep skips cheap (one guide says not over 20 Robux) and not to put expensive boosts at every checkpoint [12].

Price ladder (targets; the owner sets real prices and creates the products):

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Skip Stage | Developer product | 15-25 R$ | Right-edge button; pulses after 3 deaths on one stage |
| Skip 5 Stages | Developer product | 59-79 R$ | Inside the Skip panel only, after Stage 10 |
| Gravity Coil | Game pass | 99-149 R$ | Shop and a "try for one stage" pad |
| Speed Coil | Game pass | 99-149 R$ | Shop |
| Trail bundle | Game pass | 149-249 R$ | Trails panel |
| VIP (chat tag, gold trail, 2× coins) | Game pass | 199-399 R$ | Shop |
| Private server | Subscription | 100-250 R$/month | Server list; Tower of Hell's is 250 R$/month with extra settings [34] |
| Extra time (tower) | Developer product | 15-25 R$ | Round timer, last 60 s |
| Mutator (tower, Robux route) | Developer product | 25-49 R$ | Mutator board (keep a coin route too) |

Rules:
1. **Developer products go through `ProcessReceipt` on the server, and only one script sets it.** Roblox requires the callback to confirm purchases and warns against using `PromptProductPurchaseFinished` to grant [18]; the callback can be set once by one server script [19], and a second script setting it can charge players without granting [20]. Skip products are prompted with `PromptProductPurchase`, not the game-pass prompt [17].
2. **A skip moves the player to the start of the next stage and saves.** It never skips a whole zone's badge or a completion badge.
3. **Passes that change movement are turned off on timed boards.** A coil run is not a record.
4. **No skip offer interrupts a jump.** The Skip button is always on screen; it may pulse once per stage after 3 deaths. No modal popups on death.
5. **No "Skip to End" product.** It defeats the point of an obby (rule of thumb); offer stage skips only.
6. **Off-limits:** pay-only stages on the main path, paid checkpoint saving, removing checkpoints for free players, fake countdown offers, random paid boxes without shown odds, and anything that makes a free player's run worse on purpose.

## 7. UI and HUD for this genre

The obby HUD is small. The course is the interface. See [[05 UI and HUD]] and [[08 Mobile]] for the component specs; obby-specific layout:

| Element | Position (UDim2 / AnchorPoint) | Size (offset at 1080p, scale with UIScale) | Notes |
|---|---|---|---|
| Stage pill | (0.5, 0, 0, 12) / (0.5, 0) | 220×56 | "Stage 37 / 120", tier color background, UIStroke 3 px |
| Progress bar | under the pill | 300×10 | Fills per stage in the zone |
| Skip Stage | (1, −16, 0.5, 0) / (1, 0.5) | 132×64 | Green #2ECC71, Robux icon, price; pulse 3 cycles after 3 deaths |
| Left menu column | (0, 16, 0.5, 0) / (0, 0.5) | 64×64 each, 12 px gap | Shop, Trails, Stage Select, Settings |
| Timer (speedrun/tower) | (0.5, 0, 0, 76) / (0.5, 0) | 180×40 | mm:ss.cc, monospace digits |
| Death counter (optional) | right of the pill | 96×40 | Skill players like it; hide in kid-mode |
| Toasts | (0.5, 0, 0.25, 0) | 360×64 | "Stage 12!", "+5", "Zone 2: Ice Caves" |

Must-have screens:
1. **Stage Select**: a grid of reached stages (buttons 72×72, 6 per row on phone) so players can go back to show friends. The server only allows stages ≤ max reached [7].
2. **Settings**: Hide Other Players (on by default for hard tiers), Music, Sound Effects, Show Timer, Low Detail.
3. **Trails/Shop**: cards with a preview; owned items show "Equip".
4. **Respawn at checkpoint** button (or keep Roblox's Reset enabled): stuck players need a way out.
5. **Completion screen**: time, deaths, badge, "Play Hard Mode", "Restart for a Win".

Mobile rules: keep a 260×260 px area at bottom-right (the default jump button) and a 300×300 px area at bottom-left (thumbstick) completely clear. Nothing important sits in the top 60 px (Roblox top bar). Enable Shift Lock as an option (`StarterPlayer.EnableMouseLockOption = true`) for keyboard players; never force a camera mode that fights the thumbstick. Gamepad: every menu button is selectable (`Selectable = true`, sensible `NextSelection*` links, `GuiService.SelectedObject` set when a menu opens) and ProximityPrompts keep their default gamepad key (`GamepadKeyCode`, ButtonX); map Skip and Respawn to gamepad buttons with ContextActionService, not to keys only.

## 8. World and look

1. **One color language, never broken.** Safe platforms use the zone's palette (pastel or saturated plastic). Kill parts are always `Neon`, always red (#FF2A2A), and nothing safe is red. The DevForum advice is the same: players often can't tell what kills them, and Neon kill parts fix it [12]. Movers are blue, bounce pads lime, conveyors have arrows, ice is pale cyan with `Material.Ice`.
2. **Checkpoints look like checkpoints.** An 8×1×8 stud pad in the tier color, a flag or beam 12 studs tall, and the stage number on a SurfaceGui. The next checkpoint is visible from the current one.
3. **Zones every 10 stages.** Each zone has a theme, skybox tint, music track and one new mechanic. Example progression: Meadow → Beach → Ice Caves → Volcano → Candy → Neon City → Space → Storm. Landmarks and sight lines guide players toward objectives [59].
4. **Readable from the camera.** Default camera distance means the player sees about 30-40 studs ahead. No decoration within 6 studs of the jump path that could be mistaken for a platform. Ghost (non-collide) parts must look different from solid ones unless the stage is a declared troll stage [58].
5. **Vertical or linear, never a maze.** Players should never ask "where now?". Use arrows on the floor (Decals or neon strips) in the first two zones.
6. **Performance.** Target under 15,000 parts for 100 stages, `StreamingEnabled = true`, anchored decoration, `CastShadow = false` on small decorative parts, no unions with thousands of triangles. Turn on streaming so phones load only nearby zones, and stream around the respawn point before moving a character there.
7. **Lighting.** Bright, high-contrast daylight for casual obbies (`Lighting.Brightness` 2-3, `ClockTime` 14), darker moody lighting only for hard tiers where the hazard colors pop more. Atmosphere haze helps distant zones read as "later".

## 9. Retention and social

1. **Badges every zone** (BadgeService): Zone 1-10, completion, Hard Mode, no-death runs. Badges are cheap and visible on profiles.
2. **Leaderstats:** Stage (or Wins for towers) is the first leaderstat so the player list becomes a ranking.
3. **Hide/show players** keeps hard stages readable, but **show friends** by default so groups can play together.
4. **Disable player-player collisions** (collision group) so nobody blocks or knocks others off a 2-stud pad.
5. **Race with friends:** a "Race" pad at spawn that starts a synced timer for a party.
6. **Daily reward chest** at the spawn: coins and a streak trail at day 7 ([[10 Retention and Social]]).
7. **Speedrun boards:** a global top-50 per course, refreshed every 60 s, plus a friends board. Times are stored as integer milliseconds because ordered data stores hold positive integers [21][22].
8. **Tower obby social levers:** server-wide mutators let one player change everyone's round (cheered or groaned at), and a shared clock gives everyone the same "last 30 seconds" panic [35][37].
9. **Group perks:** a free trail for joining the group, checked with `Player:IsInGroup`.
10. **Return hook:** the stage pill on rejoin says "Welcome back! Stage 37" and points at the next stage, and the update board in the lobby shows what's new.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Classic obby | Every 2 weeks | +10-20 stages (one zone) and 2-4 trails |
| Tower obby | Every 2-4 weeks | +10-20 sections in the pool, one new mutator or gear |
| Difficulty chart | Every 2-4 weeks | One new tower or tier, one badge |
| Speedrun | Monthly | One new course, board reset per season |
| Troll obby | Every 2 weeks | One new troll zone |

Rules:
1. **Put the update in the title and the thumbnail** ("+20 STAGES") for the first week, then remove it ([[11 Thumbnails, Icons and the Store Page]]).
2. **New stages go at the end, never in the middle,** so saved stage numbers stay valid. If you must insert, migrate saved data with a version field.
3. **Seasonal zones** (Halloween, winter) are a full zone with a limited trail; keep them playable after the season (the trail becomes unobtainable, the stages stay).
4. **Board seasons:** reset speedrun boards each season with a new data-store key (`Times_S2`), keep the old board on a "Hall of Fame" sign.
5. **Watch the stage funnel weekly.** The stage where the biggest share of players quit is next week's fix: make it easier, split it, or add a checkpoint.
6. **Community maps** (FE2-style) become an update pipeline once the game has an audience: rate each map's difficulty and stars [51].

## 11. Building it in Studio

### Build order (a classic obby in 14 steps)
1. **Architect** writes the loop statement, the shape (classic, tower, chart, speedrun, troll), the stage count, the zone list with one new mechanic per zone, and the physics values into `plan.md`.
2. **Balance** fills the difficulty table (gap, pad, mover speed, expected deaths per stage) in `economy.md` from the formulas in section 5.
3. **Builder** writes `Config`, `PlayerData`, `StageService` and `HazardService` (tags `Checkpoint`, `Kill`), and tests them on greybox stages 0-10.
4. **Scenic** builds a jump test strip in a `TestArea` folder (flat gaps 3-10 studs, rises 2-7 studs, pads 1-8 studs); **Playtest** confirms which bands are easy, hard and impossible on keyboard and on a phone.
5. **Scenic** greyboxes Zone 1 (stages 0-10) at the table's values, with the zone's set piece in stages 1-5.
6. **Kid Tester** plays the first five minutes on a phone and reports any stage that took more than 3 tries.
7. **Builder** adds `MoverService`, launch pads and the no-collision group; **Playtest** rides every mover for a full cycle.
8. **Frame** builds the stage pill, toasts, Skip button, Stage Select and Settings.
9. **Merchant** wires `ProcessReceipt` for Skip Stage and the passes, tested with Studio test purchases.
10. **Scenic** builds the remaining zones and dresses Zone 1 in its final theme (color language from section 8).
11. **Builder** adds rewards, badges, and the timer and boards if the shape needs them.
12. **Liveops** adds the stage funnel and economy events.
13. **Reviewer** forges every remote, checks saves on leave and shutdown, and checks for double-granting receipts.
14. **Producer** runs the section 15 checklist with evidence (screenshots, Output lines) before the game moves on.

### Systems list
1. **PlayerData** (load/save, session lock, autosave every 60 s, save on leave and on close).
2. **StageService** (checkpoints, current/max stage, respawn at stage, stage select, anti-skip).
3. **HazardService** (kill parts, damage parts, lava, timed parts; all via CollectionService tags).
4. **MoverService** (moving, spinning, disappearing, conveyors, launch pads).
5. **ProductService** (Merchant: skip stage, passes, `ProcessReceipt`).
6. **RewardService** (coins per checkpoint, zone badges, completion, wins).
7. **TimerService** (speedrun/tower timers, server-authoritative).
8. **LeaderboardService** (ordered data stores, refresh).
9. **SettingsController** (client: hide players, music, timer).
10. **HudController** (client: stage pill, progress, toasts, skip button).
11. **TowerBuilder** (tower obbies only: assemble random sections per round).

### Architecture
```
ReplicatedStorage/
  Shared/Config            STAGE_COUNT, ZONE_SIZE, tiers, prices (ids), physics values
  Remotes/                 StageChanged, Toast, RequestStage, SetSetting, RunStarted, RunFinished
ServerScriptService/
  Main                     requires services, Init() then Start()
  Services/PlayerData, StageService, HazardService, MoverService, ProductService,
           RewardService, TimerService, LeaderboardService, TowerBuilder
ServerStorage/
  Sections/                tower sections (Models with an Entry and Exit attachment)
StarterPlayer/StarterPlayerScripts/
  Main, Controllers/HudController, SettingsController, LaunchController
Workspace/Map/
  Stages/Stage_000 ... Stage_120   (each a Model: platforms, hazards, a Checkpoint part)
  Lobby/
```
Every checkpoint is a Part tagged `Checkpoint` with an attribute `Stage` (integer). Every kill part is tagged `Kill`. Movers are tagged `Mover` with attributes (`Axis`, `Travel`, `Speed`, `Pause`). Checkpoints in Studio point their front face (LookVector) toward the next stage so respawns face the right way.

### Checkpoints: teams or attributes?
Roblox documents spawn-based checkpoints: SpawnLocations with `AllowTeamChangeOnTouch` switch the touching player to that spawn's team, only the first team should be auto-assignable, and a non-neutral spawn creates its matching team [4]. That's fine for a 20-stage obby but scales badly (one team per stage) [5]. The basic community recipe is a folder of numbered checkpoint parts, a stored stage value and a Touched handler that updates it [8]. RoCrew uses **attribute checkpoints with server-side stage numbers and a PivotTo respawn**: one Stage 0 SpawnLocation, and on every `CharacterAdded` the server moves the character to its saved checkpoint. Community systems confirm the essentials: keep progress on the server (client-held progress is exploitable) [9], only accept the next stage in sequence so skipping from 1 to 3 does nothing [6], hook `CharacterAdded` rather than caching `player.Character` [10], and handle stage 0 and skip-ahead bugs explicitly [11]. Save across sessions and offer a stage selector [6][7].

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit |
|---|---|---|---|---|---|
| StageChanged | RemoteEvent | S→C | stage, maxStage, tier | — | — |
| Toast | RemoteEvent | S→C | text, kind | — | — |
| RequestStage | RemoteEvent | C→S | stage: number | integer, 0 ≤ stage ≤ maxStage | 3 per 10 s |
| RequestRespawn | RemoteEvent | C→S | (none) | alive, not mid-run on a timed board | 1 per 3 s |
| SetSetting | RemoteEvent | C→S | key: string, value: boolean | key in allow-list | 5 per s |
| RunStarted | RemoteEvent | S→C | serverStartTime | — | — |
| RunFinished | RemoteEvent | S→C | ms, isBest, rank | — | — |

The client never sends "I reached stage N" or "my time was T". The server learns both from touches and its own clock.

### Data schema
```lua
-- PlayerData v1 (one key per player: "u_<UserId>")
{
	v = 1,
	stage = 0,          -- current checkpoint (where you respawn)
	maxStage = 0,       -- highest ever reached (stage select limit)
	coins = 0,
	wins = 0,
	deaths = 0,
	owned = {},         -- [itemId] = true (trails, coils bought with coins)
	equipped = { trail = nil },
	settings = { hidePlayers = false, music = true, timer = true },
	badges = {},        -- [zone] = true, mirrors BadgeService to avoid repeat calls
	receipts = {},      -- [PurchaseId] = os.time(), trimmed to the last 50
	lastDay = 0, streak = 0,
}
```
Times live in a separate OrderedDataStore per course (`Times_<course>_S1`, key = UserId string, value = milliseconds). Wrap every data-store call in `pcall`, since calls can fail on Roblox's side [27][23].

### Luau: config
```lua
--!strict
-- ReplicatedStorage.Shared.Config
local Config = {
	STAGE_COUNT = 120,
	ZONE_SIZE = 10,
	CHECKPOINT_TAG = "Checkpoint",
	KILL_TAG = "Kill",
	MOVER_TAG = "Mover",
	LAUNCH_TAG = "LaunchPad",
	RESPAWN_TIME = 1.25,
	COINS_PER_STAGE = 5,
	COINS_PER_ZONE = 25,
	MIN_RUN_MS = 45_000, -- fastest plausible full run; tune after playtests
	Products = {
		SkipStage = 0, -- the owner creates the product and pastes the id here
	},
}
return Config
```

### Luau: checkpoints and respawn (server)
```lua
--!strict
local Players = game:GetService("Players")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)
local Remotes = ReplicatedStorage.Remotes

local StageService = {}
local checkpoints: { [number]: BasePart } = {}

local function playerFromHit(hit: BasePart): (Player?, Humanoid?)
	local model = hit:FindFirstAncestorOfClass("Model")
	if not model then return nil, nil end
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then return nil, nil end
	return Players:GetPlayerFromCharacter(model), humanoid
end

local function spawnCFrame(stage: number): CFrame
	local cp = checkpoints[stage] or checkpoints[0]
	return cp.CFrame * CFrame.new(0, cp.Size.Y / 2 + 3, 0)
end

function StageService.respawnAtStage(player: Player)
	local character = player.Character
	if not character then return end
	local data = PlayerData.get(player)
	local target = spawnCFrame(if data then data.stage else 0)
	pcall(function()
		player:RequestStreamAroundAsync(target.Position, 3)
	end)
	character:PivotTo(target)
end

local function onCheckpoint(cp: BasePart, hit: BasePart)
	local player = playerFromHit(hit)
	if not player then return end
	local data = PlayerData.get(player)
	if not data then return end
	local stage = cp:GetAttribute("Stage")
	if typeof(stage) ~= "number" then return end
	if stage ~= data.stage + 1 then return end -- sequential only: no skipping ahead
	data.stage = stage
	if stage > data.maxStage then
		data.maxStage = stage
		data.coins += Config.COINS_PER_STAGE
		if stage % Config.ZONE_SIZE == 0 then
			data.coins += Config.COINS_PER_ZONE
		end
	end
	local leaderstats = player:FindFirstChild("leaderstats")
	local stat = leaderstats and leaderstats:FindFirstChild("Stage")
	if stat and stat:IsA("IntValue") then stat.Value = stage end
	Remotes.StageChanged:FireClient(player, stage, data.maxStage)
end

local function bindCheckpoint(inst: Instance)
	if not inst:IsA("BasePart") then return end
	local stage = inst:GetAttribute("Stage")
	if typeof(stage) == "number" then
		checkpoints[stage] = inst
	end
	inst.Touched:Connect(function(hit) onCheckpoint(inst, hit) end)
end

local function onCharacterAdded(player: Player, character: Model)
	if not character.Parent then character.AncestryChanged:Wait() end
	task.wait() -- let the default spawn finish placing the character
	StageService.respawnAtStage(player)
	local humanoid = character:WaitForChild("Humanoid", 5) :: Humanoid?
	if humanoid then
		humanoid.Died:Connect(function()
			local data = PlayerData.get(player)
			if data then data.deaths += 1 end
		end)
	end
end

function StageService.Init()
	Players.RespawnTime = Config.RESPAWN_TIME
end

function StageService.Start()
	for _, inst in CollectionService:GetTagged(Config.CHECKPOINT_TAG) do bindCheckpoint(inst) end
	CollectionService:GetInstanceAddedSignal(Config.CHECKPOINT_TAG):Connect(bindCheckpoint)

	local lastRequest: { [Player]: number } = {}
	Remotes.RequestStage.OnServerEvent:Connect(function(player: Player, stage: unknown)
		local now = os.clock()
		if (lastRequest[player] or 0) + 3 > now then return end
		lastRequest[player] = now
		local data = PlayerData.get(player)
		if not data or typeof(stage) ~= "number" or stage % 1 ~= 0 then return end
		if stage < 0 or stage > data.maxStage then return end
		data.stage = stage
		StageService.respawnAtStage(player)
		Remotes.StageChanged:FireClient(player, stage, data.maxStage)
	end)

	Players.PlayerAdded:Connect(function(player)
		player.CharacterAdded:Connect(function(c) onCharacterAdded(player, c) end)
	end)
	Players.PlayerRemoving:Connect(function(player) lastRequest[player] = nil end)
end

return StageService
```
Note that `PlayerData.get` must return `nil` until the profile is loaded; respawn at Stage 0 until then, then call `respawnAtStage` once data arrives.

### Luau: kill parts (server)
Tag-based kill parts follow the pattern community tutorials teach: check the touching model for a Humanoid, and bind one function to every tagged part [28][29]. Keep it on the server; kill parts written in client-side obbies fail to register [30].
```lua
--!strict
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")

local function bindKill(inst: Instance)
	if not inst:IsA("BasePart") then return end
	inst.Touched:Connect(function(hit: BasePart)
		local model = hit:FindFirstAncestorOfClass("Model")
		if not model or not Players:GetPlayerFromCharacter(model) then return end
		local humanoid = model:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.Health > 0 then
			humanoid.Health = 0
		end
	end)
end

for _, inst in CollectionService:GetTagged("Kill") do bindKill(inst) end
CollectionService:GetInstanceAddedSignal("Kill"):Connect(bindKill)
```
Damage parts (lava that hurts, not kills) use `humanoid:TakeDamage(20)` with a 0.5 s per-character debounce.

### Luau: moving platforms that carry players
Tweening an anchored platform's CFrame moves it visually, but characters standing on it don't move with it because the physics engine sees no motion; forum fixes are physics-driven or velocity-driven platforms [31][32], and scripted "carry" workarounds jitter [33]. Use a constraint-driven, unanchored platform owned by the server:
```lua
--!strict
local function makeSlider(base: BasePart, platform: BasePart, travel: number, speed: number, pause: number)
	local a0 = Instance.new("Attachment")
	a0.Parent = base -- slide axis = a0's X axis; rotate a0 in Studio to aim it
	local a1 = Instance.new("Attachment")
	a1.Parent = platform
	a1.WorldCFrame = a0.WorldCFrame

	local prism = Instance.new("PrismaticConstraint")
	prism.Attachment0 = a0
	prism.Attachment1 = a1
	prism.ActuatorType = Enum.ActuatorType.Servo
	prism.ServoMaxForce = 1e7
	prism.Speed = speed
	prism.LimitsEnabled = true
	prism.LowerLimit = 0
	prism.UpperLimit = travel
	prism.Parent = platform

	base.Anchored = true
	platform.Anchored = false
	platform:SetNetworkOwner(nil) -- server simulates it; no client can fling it

	task.spawn(function()
		local legTime = travel / speed + pause
		while platform.Parent do
			prism.TargetPosition = travel
			task.wait(legTime)
			prism.TargetPosition = 0
			task.wait(legTime)
		end
	end)
end
```
For conveyors, keep the part anchored and set `part.AssemblyLinearVelocity = part.CFrame.LookVector * 12`: characters standing on it are pushed while the part stays put. Spinners use a `HingeConstraint` with `ActuatorType = Motor`, `AngularVelocity` 1-3 rad/s and a high `MotorMaxTorque`.

### Luau: launch pads (client, own character only)
Character physics belongs to the client, so launches feel best when the local client applies them. This only moves your own character, so it's safe.
```lua
--!strict
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local cooldown = false

local function bindLaunch(inst: Instance)
	if not inst:IsA("BasePart") then return end
	inst.Touched:Connect(function(hit)
		local character = player.Character
		if cooldown or not character or not hit:IsDescendantOf(character) then return end
		local root = character:FindFirstChild("HumanoidRootPart") :: BasePart?
		if not root then return end
		cooldown = true
		local power = (inst:GetAttribute("Power") :: number?) or 110
		root.AssemblyLinearVelocity = Vector3.new(root.AssemblyLinearVelocity.X, power, root.AssemblyLinearVelocity.Z)
		task.delay(0.4, function() cooldown = false end)
	end)
end

for _, inst in CollectionService:GetTagged("LaunchPad") do bindLaunch(inst) end
CollectionService:GetInstanceAddedSignal("LaunchPad"):Connect(bindLaunch)
```

### Luau: no player collisions and hide players
```lua
--!strict
-- Server: players pass through each other
local PhysicsService = game:GetService("PhysicsService")
local Players = game:GetService("Players")
PhysicsService:RegisterCollisionGroup("Players")
PhysicsService:CollisionGroupSetCollidable("Players", "Players", false)

local function setGroup(inst: Instance)
	if inst:IsA("BasePart") then inst.CollisionGroup = "Players" end
end
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		for _, d in character:GetDescendants() do setGroup(d) end
		character.DescendantAdded:Connect(setGroup)
	end)
end)
```
```lua
--!strict
-- Client: Hide Other Players setting (local only, nothing replicates)
local Players = game:GetService("Players")
local hidden = false

local function apply(character: Model)
	for _, d in character:GetDescendants() do
		if d:IsA("BasePart") or d:IsA("Decal") then
			d.LocalTransparencyModifier = if hidden then 1 else 0
		end
	end
end

local function setHidden(value: boolean)
	hidden = value
	for _, other in Players:GetPlayers() do
		if other ~= Players.LocalPlayer and other.Character then apply(other.Character) end
	end
end
```
Re-apply on each other player's `CharacterAdded` and on `DescendantAdded` (accessories load late).

### Luau: skip stage (server, Merchant's module)
```lua
--!strict
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)
local StageService = require(script.Parent.StageService)

local handlers: { [number]: (Player, any) -> boolean } = {
	[Config.Products.SkipStage] = function(player, data)
		if data.stage >= Config.STAGE_COUNT then
			data.coins += 50 -- already at the end: give value instead of failing forever
			return true
		end
		data.stage += 1
		data.maxStage = math.max(data.maxStage, data.stage)
		task.defer(StageService.respawnAtStage, player)
		return true
	end,
}

-- The ONLY place in the game that sets ProcessReceipt.
MarketplaceService.ProcessReceipt = function(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	local data = player and PlayerData.get(player)
	if not player or not data then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	if data.receipts[receipt.PurchaseId] then
		return Enum.ProductPurchaseDecision.PurchaseGranted -- already granted
	end
	local handler = handlers[receipt.ProductId]
	if not handler then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local ok, granted = pcall(handler, player, data)
	if not ok or not granted then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	data.receipts[receipt.PurchaseId] = os.time()
	PlayerData.markDirty(player) -- saved by the next autosave and on leave
	return Enum.ProductPurchaseDecision.PurchaseGranted
end
```
The client calls `MarketplaceService:PromptProductPurchase(Players.LocalPlayer, Config.Products.SkipStage)` from the Skip button. Test with Studio's test purchases before the owner creates live products [18].

### Luau: server-timed speedruns and a board
Community threads report that client `tick()` timing gives inaccurate or identical times [24], and that time boards are built on ordered data stores with times converted to integers [25][26]. Ordered stores hold positive integers and are read with `GetSortedAsync(ascending, pageSize)` [21][22]. Time on the server:
```lua
--!strict
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes

local store = DataStoreService:GetOrderedDataStore("Times_Main_S1")
local runStart: { [Player]: number } = {}

local Timer = {}

function Timer.start(player: Player)
	runStart[player] = workspace:GetServerTimeNow()
	Remotes.RunStarted:FireClient(player, runStart[player])
end

function Timer.finish(player: Player)
	local started = runStart[player]
	if not started then return end
	runStart[player] = nil
	local ms = math.floor((workspace:GetServerTimeNow() - started) * 1000 + 0.5)
	if ms < Config.MIN_RUN_MS then
		warn("Implausible run", player.UserId, ms) -- log it, don't post it
		return
	end
	local isBest = false
	local ok, err = pcall(function()
		store:UpdateAsync(tostring(player.UserId), function(old: number?)
			if old == nil or ms < old then
				isBest = true
				return ms
			end
			return nil -- keep the old best
		end)
	end)
	if not ok then warn("Time save failed", err) end
	Remotes.RunFinished:FireClient(player, ms, isBest)
end

function Timer.top(n: number): { { key: string, value: number } }
	local ok, pages = pcall(function()
		return store:GetSortedAsync(true, n) -- ascending: fastest first
	end)
	if not ok then return {} end
	return (pages :: DataStorePages):GetCurrentPage()
end

return Timer
```
The client shows a live clock by reading `workspace:GetServerTimeNow() - serverStartTime` every frame; it never reports a time. Add per-segment minimum times (hidden split parts) so a teleport exploit can't post a 3-second run. Clear `runStart[player]` on respawn when the board is "no deaths" or on leaving.

### Luau: tower obby assembly (server)
```lua
--!strict
local ServerStorage = game:GetService("ServerStorage")
local sections = ServerStorage.Sections:GetChildren()

-- Each section Model has PrimaryPart "Entry" (bottom) and an Attachment "Exit" at its top.
local function buildTower(count: number, seed: number): Model
	local rng = Random.new(seed)
	local tower = Instance.new("Model")
	tower.Name = "Tower"
	local cursor = workspace.Map.TowerBase.Top.WorldCFrame
	local used: { [Instance]: boolean } = {}
	for i = 1, count do
		local pick: Instance
		repeat pick = sections[rng:NextInteger(1, #sections)] until not used[pick] or #sections < count
		used[pick] = true
		local section = (pick :: Model):Clone()
		section:PivotTo(cursor)
		local exit = section:FindFirstChild("Exit", true) :: Attachment
		cursor = exit.WorldCFrame
		section.Parent = tower
	end
	tower.Parent = workspace.Map -- parent last
	return tower
end
```
Tag each section with its difficulty (attribute `Difficulty` 1-5) and draw Normal towers from 1-3 and Pro towers from 2-5. Rebuild the tower between rounds while players are in the lobby, never under their feet.

## 12. Twists that work

1. **Story escape.** A premise and an antagonist (prison guard, giant chef, evil teacher) chase you through a 20-30 obstacle course, like Barry's Prison Run's escape framing [50]. Add 3-5 short cutscene beats with the camera; see [[Genre - Story and Puzzle]].
2. **Rising hazard rounds.** Water, lava or fog rises on a timer and a team must press buttons to open the path, as in Flood Escape 2 [51].
3. **Random tower rounds.** Assemble from a section pool each round with a shared clock and server-wide modifiers [36][37].
4. **Creator mode.** Let players build stages and play the best ones, like Obby Creator [55]. Needs moderation, reporting and part limits.
5. **Collectibles on the path.** Notes, letters or stars hidden off the main line give completionists a second goal on the same course [56].
6. **Co-op obbies.** Two-player stages: one stands on a button while the other crosses; tethered players; "carry your friend" pads.
7. **One-life or hardcore mode.** A separate board for no-death runs; huge bragging value, zero new stages needed.
8. **Speedrun categories.** Any%, all-collectibles, no-coil, per-zone splits, like the level-count categories of Speed Run 4 boards [45].
9. **Vehicle or body obbies.** You're a ball, a car, a pogo stick, or tiny. The verb changes, so old ideas feel new. Recompute the physics budget.
10. **Stat-growth hybrid.** Players gain speed or jump over time or by training, and later stages need the higher stats (obby meets simulator; see [[Genre - Simulator]]). Keep early stages beatable at base stats.
11. **Fair troll zone.** One declared "troll" zone inside a normal obby, with a sign; each troll is learnable after one death [53].
12. **Difficulty-chart hub.** Tier doors in a hub world; each door's color is its difficulty [43][44].
13. **Rhythm obby.** Platforms appear and vanish on the beat of the zone music; the music is the timer.

## 13. Failure modes

1. **Invisible or ambiguous kill parts.** Players die without knowing why and quit. Fix: Neon red only, and never red decoration [12].
2. **Impossible or barely possible jumps.** Designed in Studio, never playtested; DevForum's top obby tip is to playtest every stage until you know it can be beaten [12].
3. **A boring, generic opening.** The first stages look like the template; players leave in minutes [13].
4. **Repetition.** The same jump-and-laser stage 40 times [13]. Each zone needs a new mechanic; when ideas run dry, sketch stages on paper or a tablet before building, as DevForum creators advise [14].
5. **Client-side progress.** Exploiters set their stage to 999 [9].
6. **Lost progress.** Data not saved on leave or on shutdown, or a schema change wipes stage numbers.
7. **Respawning at the wrong place.** Caching `player.Character`, stage 0 edge cases, or streaming not loaded at the respawn point [10][11].
8. **Platforms that don't carry players.** Tweened anchored platforms [31].
9. **Skip spam.** Popups on every death, "Skip to End", or skips that are expensive [12].
10. **Griefing.** Player-player collisions on narrow paths; flinging with physics tools.
11. **Mobile-hostile precision.** 1-stud pads in Zone 1, wrap-around jumps that need a mouse.
12. **Lag.** Tens of thousands of unanchored or detailed parts; no streaming.
13. **Dishonest difficulty labels.** An "Easy" tier with a 30-death stage.
14. **A tower that repeats sections every round.** The pool is too small for the round count.
15. **No return reason.** The obby ends, and nothing new arrives for months.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] We can name the twist in five words, and it shows in Stage 1 and in the thumbnail.
- [ ] Market check (Pulse, `cli.mjs market`): the twist isn't one of five near-identical games currently charting.
- [ ] The target audience is clear: young/casual (long, easy, bright), skill (tiers, boards), or friends (rounds, co-op, troll).
- [ ] We can build 60+ stages (classic), 40+ sections (tower) or 3+ tiers (chart) before launch.
- [ ] We have an update plan: +10-20 stages or sections every 2 weeks for 8 weeks.
- [ ] Monetization fits without walls: skips, coils, trails, VIP, private servers.
- [ ] The physics budget works on phones: Kid Tester can clear Zone 1 on a phone in under 5 minutes.
- [ ] We have one set piece for the first 60 seconds that no other obby has.
- [ ] If timed: the server-validated timer and board are in scope.
- [ ] If user-generated: moderation and reporting are in scope.

## 15. Checklist

- [ ] First checkpoint reached within 10 s of spawn (timed on a phone).
- [ ] `Players.RespawnTime` between 1 and 1.5 s.
- [ ] Every kill part is tagged `Kill`, is Neon and is red; no safe part is red (Reviewer scans tags vs. colors).
- [ ] Every stage Model has exactly one `Checkpoint` part with an integer `Stage` attribute, numbered 0..N with no gaps.
- [ ] Checkpoints only advance in sequence (test: touch stage 3 while on stage 1 → nothing happens).
- [ ] Stage and maxStage save on leave, on `BindToClose` and every 60 s; rejoin puts you on your stage.
- [ ] Stage Select refuses stages above maxStage (test with a forged remote call).
- [ ] No gap over 8 studs or rise over 6 studs at default physics (Playtest jump strip run).
- [ ] In stages 1-20, no pad under 4×4 studs and no gap over 6 studs.
- [ ] Moving platforms carry a standing character for a full cycle without sliding off.
- [ ] Player-player collisions are off.
- [ ] Hide Other Players works and persists.
- [ ] Skip Stage: one `ProcessReceipt` in the whole place; purchase in Studio test mode moves you one stage and saves; a repeat receipt doesn't double-grant.
- [ ] No skip popup on death; the Skip button pulses at most once per stage.
- [ ] Coils and speed passes are disabled during timed runs.
- [ ] Speedrun times come from the server clock; a run under `MIN_RUN_MS` is rejected.
- [ ] The global board shows the top 50 and refreshes every 60 s with `pcall` around the read.
- [ ] Each zone has a new mechanic, a new theme and music, and a badge.
- [ ] The bottom-left and bottom-right thumb zones are clear of UI on a phone.
- [ ] `StreamingEnabled` is on and respawns at far stages load before the character moves.
- [ ] Part count and memory checked in the Developer Console at the furthest stage on a phone.
- [ ] Stage funnel analytics fire for every stage reached.

## Common mistakes

1. Using `TweenService` on anchored platforms and wondering why players fall off [31].
2. Setting `MarketplaceService.ProcessReceipt` in two scripts [20].
3. Granting skips from `PromptProductPurchaseFinished` [18].
4. Keeping stage progress in a client value or trusting a "stage reached" remote [9].
5. Using one Team per stage for 200 stages [5].
6. Teleporting the character before the default spawn finishes, so it snaps back to Stage 0.
7. Kill bricks in LocalScripts [30].
8. Checking `hit.Parent:FindFirstChild("Humanoid")` only, so accessories (whose parent is the Accessory) don't count; use `FindFirstAncestorOfClass("Model")`.
9. Forgetting a Stage 0 checkpoint, which breaks respawns for new players [11].
10. Inserting stages in the middle and breaking every saved stage number.
11. Red decoration next to red kill parts.
12. A "troll" fake checkpoint that loses saved progress.
13. Hard stages in Zone 1 because the designer plays with a keyboard.
14. A shop or daily-reward modal that opens on spawn.
15. Timing speedruns with client `tick()` [24].
16. Writing every run to the ordered store instead of only improvements (`UpdateAsync` returning nil keeps the old value).
17. Calling data stores without `pcall` [27].
18. No way to get unstuck (Reset disabled, no respawn button).
19. Copying a famous obby's sections, names or art instead of its patterns.
20. Leaving the template's default look and skybox.

## References

[1] Experience genres — https://create.roblox.com/docs/production/publishing/experience-genres — Obby & platformer genre with Classic Obby, Runner and Tower Obby subgenres.
[2] Get started (Intro to building) — https://create.roblox.com/docs/tutorials/curriculums/building/get-started — The Classic Obby template: starts easy, gets harder; moving, launching and health-zeroing platforms.
[3] Intro to building — https://create.roblox.com/docs/tutorials/curriculums/building — Roblox's beginner curriculum built on the Classic Obby template.
[4] SpawnLocation (engine reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/SpawnLocation.md — AllowTeamChangeOnTouch checkpoints; only the first team auto-assignable.
[5] Spawn system for obby (DevForum) — https://devforum.roblox.com/t/spawn-system-for-obby/263989 — RespawnLocation alternative; team-based obby systems hard to scale.
[6] [OBBY] Game Checkpoints V2.0 (DevForum) — https://devforum.roblox.com/t/obby-game-checkpoints-v20/3957159 — Sequential mode that ignores skips; saving progress across sessions.
[7] Obby kit with stage selector (DevForum) — https://devforum.roblox.com/t/785271 — Autosave toggle, stage selector, respawn at the chosen stage.
[8] How to make a checkpoint system (DevForum) — https://devforum.roblox.com/t/how-to-make-a-checkpoint-system/1398280 — Numbered checkpoint folder, stored stage value, Touched update.
[9] [OBBY CHECKPOINT] Could this work? (DevForum) — https://devforum.roblox.com/t/obby-checkpoint-could-this-work/375921 — Client-held progress can be exploited to skip stages.
[10] Obby Checkpoints Script (DevForum) — https://devforum.roblox.com/t/obby-checkpoints-script/2215191 — Use CharacterAdded; scripts placed in the wrong container.
[11] Obby Checkpoint System Help (DevForum) — https://devforum.roblox.com/t/obby-checkpoint-system-help/3255052 — Stage 0 and skip-ahead bugs.
[12] How to refine your obby game (DevForum) — https://devforum.roblox.com/t/how-to-refine-your-obby-game/862904 — Playtest every stage; Neon kill parts; cheap skip stage (≤20 R$); no expensive boosts at every checkpoint.
[13] Tips to improve my obby since players only spend 3-4 minutes (DevForum) — https://devforum.roblox.com/t/how-to-improve-my-obby-game/3683572 — Repeated obstacles; add variety; make the first levels unique.
[14] Obby stage ideas for my game (DevForum) — https://devforum.roblox.com/t/obby-stage-ideas-for-my-game/1007319 — Sketching stages to get past a stall at 80+ stages.
[15] How can I improve the monetization on this obby? (DevForum) — https://devforum.roblox.com/t/how-can-i-improve-the-monetization-on-this-obby/1356923 — Skip-stage product as the main earner; place prompts where players see them.
[16] Obby game monetization being low (DevForum) — https://devforum.roblox.com/t/obby-game-monetization-being-low/3141998 — Ad spend recouped only a fraction; advertise purchases as players progress.
[17] Help with a skip stage (DevForum) — https://devforum.roblox.com/t/help-with-a-skip-stage/406152 — Products use PromptProductPurchase; handler increments stage and moves the character.
[18] Developer products — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt required; don't grant from PromptProductPurchaseFinished; test purchases.
[19] developer-products.md (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/monetization/developer-products.md — ProcessReceipt can be set once by one server-side script.
[20] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — A second script setting ProcessReceipt charged without granting.
[21] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore — Positive integer values; GetSortedAsync(ascending, pagesize, min, max).
[22] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md — Global top scores from ordered stores, displayed and refreshed.
[23] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md — Data store guide; ordered stores lack versioning and metadata.
[24] Best way to get accurate speed-run times? (DevForum) — https://devforum.roblox.com/t/best-way-to-get-accurate-speed-run-times/2520069 — tick()-based timing gave inaccurate, identical times.
[25] Global Leaderboard for time? (DevForum) — https://devforum.roblox.com/t/global-leaderboard-for-time/763483 — Ordered data store for time boards; times stored as integers.
[26] Help with Speedrun Leaderboard (DevForum) — https://devforum.roblox.com/t/help-with-speedrun-leaderboard/1263087 — Community speedrun board implementation issues.
[27] Best times and saves (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/best_times_and_saves — Wrap DataStore calls in pcall because they can fail.
[28] Kill bricks (Coddy course) — https://coddy.tech/learn/courses/roblox_game_endless_tower/kill_bricks — Check for a Humanoid; tag kill parts with CollectionService.
[29] Tutorial on how to make a kill brick (DevForum) — https://devforum.roblox.com/t/tutorial-on-how-to-make-a-kill-brick/3870469 — Tag-based kill/damage with a debounce.
[30] Client-sided killscript (DevForum) — https://devforum.roblox.com/t/making-a-client-sided-killscript/783618 — Kill bricks failing in a client-side obby.
[31] Cannot ride a moving platform (DevForum) — https://devforum.roblox.com/t/cannot-ride-a-moving-platform/807834 — Tweened parts don't carry characters.
[32] Need help with TweenService (DevForum) — https://devforum.roblox.com/t/need-help-with-tweenservice/471608 — Physics-driven or velocity-driven platforms instead of tweens.
[33] Keeping characters on tweening platforms (DevForum) — https://devforum.roblox.com/t/how-would-i-go-about-keeping-characters-on-tweening-platforms/1904413 — Scripted carry workarounds jitter.
[34] Private Servers (Tower of Hell Wiki) — https://tower-of-hell.fandom.com/wiki/Private_Servers — 250 Robux/month; lock shop, skip tower, change tower size.
[35] Lengthen (Tower of Hell Wiki) — https://tower-of-hell.fandom.com/wiki/Lengthen — Mutators are like gears but affect everyone in the server.
[36] Tower of Hell (Bloxodes wiki) — https://bloxodes.com/wiki/tower-of-hell — Random tower from a section pool (364 referenced); coins buy mutators.
[37] Tower of Hell mutators (Bloxodes) — https://bloxodes.com/wiki/tower-of-hell/mutators — Coin mutators scale with tower length; expire at round end.
[38] Tower of Hell gears (Bloxodes) — https://bloxodes.com/wiki/tower-of-hell/gears — Gear list; Gravity Coil 80 coins (Noob) / 152 (Pro).
[39] Tower of Hell gears guide (Destructoid) — https://www.destructoid.com/tower-of-hell-gears-guide-tier-list/ — Gears bought with currency earned by climbing.
[40] 10 things to know before playing Tower of Hell (Sportskeeda) — https://sportskeeda.com/roblox-news/10-things-know-playing-tower-hell-roblox — No checkpoints; multiple towers of rising difficulty.
[41] How to play Tower of Hell (Gaming Pro Max) — https://gamingpromax.com/tower-of-hell-how-to-play/ — Normal 6 sections, Pro 12; round timer.
[42] Tower of Hell (MCPEDL) — https://mcpedl.com/tower-of-hell/ — Round-based obby by PyxlDev and ObrenTune of YXCeptional Studios; random tower each six-minute round.
[43] Ring 1 (JToH Wiki file page) — https://jtoh.fandom.com/wiki/File:Ring1fidjo.png — Ring 1 holds towers from Easy to Insane.
[44] Main Difficulty Chart (JToH's Joke Towers Wiki) — https://jtohs-joke-towers.fandom.com/wiki/Main_Difficulty_Chart — Fan chart (non-canon): difficulty classes with Baseline/Low/Middle/High/Peak sub-tiers.
[45] ROBLOX: Speed Run 4 Classic (speedrun.com) — https://www.speedrun.com/rblx_sr4c — Level-count leaderboard categories.
[46] Speed Run 4 Classic skips guide (speedrun.com) — https://www.speedrun.com/rblx_sr4c/guides/y8ce0 — Skips; developers raised the death plane.
[47] Fastest 5-levels completion of ROBLOX: Speed Run 4 (Guinness World Records) — https://www.guinnessworldrecords.com/world-records/571674-fastest-5-levels-completion-of-roblox-speed-run-4-no-skips — 1:57.6 by kriptopolis, 19 March 2020.
[48] Mega Fun Obby (speedrun.com) — https://www.speedrun.com/pl-PL/mega_fun_obby — 2009 game, 550 stages, full runs about an hour.
[49] Easy Fun Obby 575 Stages (Roblox listing) — https://www.roblox.com/games/72165087146441/Easy-Fun-Obby-575-Stages — 575+ colorful stages with automatic saving.
[50] Barry's Prison Run (Roblox listing) — https://www.roblox.com/tr/games/13566209506/BARRY-PRISON-RUN — Prison-escape obby premise; themed variants with 25 obstacles.
[51] Castle Tides talk page (Flood Escape 2 Wiki) — https://flood-escape-2.fandom.com/wiki/Talk:Castle_Tides/@comment-46301187-20200808011251 — Community maps with difficulty, button count and star rating.
[52] Lost Woods (Flood Escape 2 Wiki) — https://flood-escape-2.fandom.com/wiki/File:Flood_Escape_2_OST_-_Lost_Woods — First Easy map and first community map added.
[53] What is the Roblox troll obby game about? (Playgama) — https://playgama.com/blog/?p=9472 — Troll obby tricks and why failure feels like a puzzle.
[54] 5 best obby games in Roblox (Sportskeeda) — https://sportskeeda.com/roblox-news/best-obby-games-roblox — Tower of Hell, Obby Creator, Speed Run 4.
[55] How to make an obby in Obby Creator (Pro Game Guides) — https://progameguides.com/roblox/how-to-make-an-obby-in-obby-creator-roblox/ — Building obbies with in-game objects.
[56] The toughest and trendiest Roblox obbies, April 2025 (Pro Game Guides) — https://progameguides.com/roblox/can-you-beat-these-the-toughest-trendiest-roblox-obbies/ — 2025 obby roundup.
[57] The best Roblox obby (Noping) — https://noping.com/blog/the-best-roblox-obby — Roundup: Tower of Hell, Mega Fun Obby, Really Easy Obby.
[58] How to make a parkour obby in Roblox (iD Tech) — https://idtech.com/blog/roblox-parkour-obby-tutorial — Ghost (non-collide) blocks and kill blocks.
[59] Map design skill (skills.sh) — https://skills.sh/taozhuo/game-dev-skills/map-design — Landmarks and sight lines guide players to objectives.
[60] Find the Chomiks (TV Tropes YMMV) — https://tvtropes.org/pmwiki/pmwiki.php/YMMV/FindTheChomiks — Notes a difficulty chart based on JToH's.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Story and Puzzle]] · [[Genre - Party and Social Hangout]] · [[Genre - Simulator]]
