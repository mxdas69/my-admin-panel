---
tags: [vault, genre, racing, vehicles, driving, cars, open-world, time-trial, karts, boats, planes]
for: [lead, pulse, architect, builder, scenic, balance, playtest, kid-tester]
also: [frame, merchant, liveops, splash, reviewer, producer, librarian]
---

# Genre - Racing and Vehicles

Vehicle games on Roblox are games where the main verb is driving something: a car, kart, bike, boat, plane or train. The genre splits into five shapes the crew builds: **open-world driving** (a big map, a garage of cars to collect, money from driving and jobs; the Driving Empire and Car Dealership Tycoon shape), **circuit racing** (lobby, grid, countdown, laps, podium), **time trials and drag** (one car, one clock, a board), **party and kart racing** (short chaotic races with items), and **vehicle journeys** (a vehicle you repair and defend on a long road; the A Dusty Trip and Dead Rails shape, covered more in [[Genre - Survival]]).

Vehicles are one of the hardest things to get right on Roblox. The feel lives in physics constraints and network ownership; the wrong setup gives rubber-banding, flipping, flinging and lag. And because the driver's client simulates the car, cheaters can move it however they like unless the server checks. This page is mostly about those two problems: **feel** and **trust**.

Read this page before pitching or planning any driving, racing or vehicle game, and before adding any vehicle to another genre (tycoon delivery trucks, roleplay cars, survival vans). Pair it with [[02 The Core Loop]], [[04 Progression and Economy]], [[13 Building It Right]], [[16 Console and Controllers]] and [[17 Security and Anti-Cheat]].

## 1. What it is and why it works on Roblox

**The audience** (design assumptions):
- **Car kids** (about 8-14) who love real-looking cars, colors, rims and showing off a garage. Driving Empire is described as a coastal open world with a catalog of 350+ licensed vehicles you collect, customize and race (one source, unverified) [1].
- **Racers** who want tight laps, a clock and a board.
- **Friend groups** who cruise together, race on a whim, or play cops and robbers.
- **Journey players** who want a long road and a vehicle to keep alive (A Dusty Trip: repair a vehicle, manage stamina and hunger [2]; vans built from engine, radiator and wheel parts [3]).

**Session shape.** Open world: 20-60 minutes of cruising, small jobs or races, a car purchase every session or two. Circuit racing: 3-5 minute races, 4-8 per session. Time trial: many 30-90 s retries. Studio targets: driving within 20 s of joining, a first race finished inside 4 minutes, the first car purchase in session 1.

**Why players come back.**
1. **The garage.** Every car is a goal with a price tag, and a new car is a new feel.
2. **Customization.** Paint, rims, spoilers, underglow: a car is an avatar.
3. **Passive income layers.** Car Dealership Tycoon adds a dealership with display cars that earn while you play, which a comparison credits as its edge over pure driving games [4][5].
4. **Racing mastery.** Lines, drifts, shortcuts and personal bests.
5. **Social showing.** Cruising past other players in a rare car is the reward.

**Why it works on Roblox.** The engine gives you `VehicleSeat`, physics constraints and multiplayer for free, and the platform's controls already map steering and throttle to keyboard, thumbstick and gamepad triggers. Driving with friends needs no rules. What Roblox does not give you is good feel, so that is where our time goes.

## 2. The core loop

**Loop statement (open world):**
> Players **drive, race and do jobs** to earn **cash**, which they spend on **new cars and upgrades** so they can **drive faster, look better and win harder races** [4][5].

**Loop statement (circuit racing):**
> Players **race a lap circuit against others** to **place on the podium**, which pays **cash and XP**, which they spend on **car upgrades and new classes** so they can **win the next tier of races**.

**Loop statement (time trial):**
> Players **run one track against the clock** to **beat their best time and climb the board**, so they can **find a better line and run again**.

**Loop statement (vehicle journey):**
> Players **drive as far as they can and keep the vehicle alive** to **reach the next distance milestone**, which pays **parts and currency** so they can **build a tougher vehicle and go further** [2][3].

| Layer | Time scale | Open world | Circuit | Time trial |
|---|---|---|---|---|
| Micro | 0.5-3 s | A drift, a jump, near miss | A clean corner, an overtake | A clean corner |
| Short | 10-90 s | A job or street race done | A lap, a position gained | A sector split |
| Session | 20-60 min | A car bought | A race series, a class up | A personal best |
| Long | days-weeks | The garage, rare cars | Ranked tier | Board rank |

### Racing and vehicle rules

1. **The player is driving within 20 seconds of joining.**
   Why: a car game that opens on menus loses players who came to drive.
   How: spawn next to a free starter car with a glowing "Drive" ProximityPrompt; the prompt seats the player and the camera swings behind the car. No shop or dealer screen first.

2. **Every vehicle's physics is owned by its driver, set by the server when the seat's Occupant changes.**
   Why: Roblox docs give the driver-and-passenger case: if a passenger owns the car the driver feels sluggish; the fix is assigning ownership to the driver on occupant change and back to automatic when they leave [6][7].
   How: server `VehicleSeat:GetPropertyChangedSignal("Occupant")` → `root:SetNetworkOwner(player)`; on exit → `SetNetworkOwnershipAuto()` (section 11).

3. **Because the driver owns the car, the server checks its speed 5 times a second.**
   Why: the owner's client can move the car anywhere; Roblox's security guidance is server-side detection of impossible movement [8][9].
   How: sample the car's root every 0.2 s; if horizontal speed exceeds `maxSpeed × 1.25 + 15` studs/s for 3 samples in a row, return the car to its last good position and log a strike.

4. **Race checkpoints are crossed in order and checked by the server from sampled positions, never by the client.**
   Why: client Touched events and client-reported laps are trivial to fake; ordered checkpoints are the standard anti-shortcut tool [10][11].
   How: the server keeps `nextCheckpoint` per racer and tests the line segment between the last two samples against the next gate's plane and width.

5. **Lap and race times come from the server clock, and any lap faster than the track's minimum is rejected.**
   Why: client timers give wrong or identical times [12]; a minimum lap time catches teleports and cut-throughs.
   How: `workspace:GetServerTimeNow()` at start and finish; `MIN_LAP_MS` per track = 85% of the fastest legit test lap.

6. **Cars don't collide with each other for the first 5 s of a race and in open-world passive mode.**
   Why: first-corner pileups and ramming griefers are the top frustration in shared driving.
   How: collision groups `Cars` and `GhostCars`; ghost cars don't collide with each other [13][14]; ghost cars render at 0.5 transparency locally.

7. **The car never flips over and stays stuck: auto-righting within 2 s, plus a Reset button.**
   Why: a flipped car with no fix ends the session.
   How: if the chassis's UpVector.Y < 0.3 for 2 s at low speed, the client applies an `AlignOrientation` pulse to upright it; Reset (R / ButtonY / touch button) respawns at the last checkpoint or road node.

8. **Speed shows in km/h on a big gauge, using 1 stud ≈ 0.28 m (so 1 stud/s ≈ 1 km/h).**
   Why: kids compare cars by top speed; a believable number sells the car.
   How: `speed = root.AssemblyLinearVelocity.Magnitude` displayed as km/h with a 0.1 s smoothing; store car stats in Config in studs/s.

9. **Every car class has a performance index, and ranked races are by class.**
   Why: paid or late cars would make races unwinnable for everyone else.
   How: `PI = 0.5·topSpeed + 0.3·accel + 0.2·grip` (normalized 0-1000); classes C < 400 ≤ B < 600 ≤ A < 800 ≤ S. Upgrades raise PI and can move a car up a class.

10. **The starter car is fun, not a punishment.**
    Why: if the free car is a slow box, the first 10 minutes feel bad.
    How: starter top speed 70% of the class B average, good grip, drift-able; Kid Tester must say "fun" not "slow".

11. **Steering is speed-sensitive: full lock below 20 studs/s, down to 35% at top speed.**
    Why: constant steering angle makes cars twitchy at speed, especially on thumbsticks.
    How: `maxSteer = lerp(35°, 12°, speed / topSpeed)` in the drive controller.

12. **A race lasts 2-4 minutes and has 3 laps or one point-to-point run.**
    Why: short races fit sessions and keep queues moving.
    How: circuit length 1,200-2,500 studs at class B speeds; a 30 s DNF timer starts when the winner finishes.

13. **The grid starts on a shared server countdown, with cars held by the server until GO.**
    Why: a client-started race lets someone jump the gun.
    How: server sets `VehicleSeat.Disabled`-free hold by anchoring each chassis root during 3-2-1, then unanchors and re-sets ownership at GO time `t0` broadcast as server time.

14. **Position on the leaderboard = laps, then checkpoints, then distance to the next checkpoint.**
    Why: players watch the position number more than the map.
    How: sort key `lap * 1000 + checkpointIndex` and tie-break with distance; update 4 times a second.

15. **Every action has keyboard, touch and gamepad controls, and the default vehicle controls stay on.**
    Why: studio rule; VehicleSeat already reads throttle and steer from the default controls, including gamepad.
    How: extra actions (nitro, handbrake, horn, camera, exit) are bound with ContextActionService with touch buttons [15][16][17]; gamepad: RT throttle, LT brake, left stick steer (Roblox default), A nitro, X handbrake, Y reset, B exit.

16. **Map roads are wide: 24+ studs for two-way roads, 36+ studs on race tracks.**
    Why: phone thumbsticks steer coarsely; narrow roads punish touch players.
    How: Scenic's road kit uses fixed widths; kerbs are low (0.5 stud) so cars ride over them.

17. **Cars stream as whole models.**
    Why: half-streamed cars (wheels missing) break physics and look broken.
    How: car Models use `ModelStreamingMode = Atomic`; the player's own car is `Persistent` while they drive it [18].

18. **No vehicle reward is Robux-only on a race podium.**
    Why: paid cars that win ranked races kill racing; class-locked ranked racing protects fairness (rule 9).
    How: Robux cars are allowed, but they race in their class and earn at the same rate as cash cars of that class.

## 3. Top games in the genre

### Driving Empire
**What it does:** An open-world driving game described as a coastal world with 350+ licensed vehicles from real manufacturers to collect, customize and race (one source; unverified) [1]; it runs codes for free rewards [19]. A comparison notes it has no dedicated passive income system, unlike Car Dealership Tycoon [5].
**Steal:** A big, readable world built for cruising; a huge garage as the long-term goal; codes as a light retention touch.
**Avoid:** Real car brands and logos. We don't have licensing deals; we design our own cars with original names.

### Car Dealership Tycoon
**What it does:** Driving plus a dealership tycoon. Money comes from driving, racing and displaying cars at your dealership; one source says expensive cars earn more and Robux cars are faster and earn more than cash cars (low-quality source; unverified) [4]. Codes give one-time cash boosts tied to community milestones and seasons [20][21].
**Steal:** A passive layer (a showroom that earns) so time away still matters; showing your cars on platforms is a natural social flex.
**Avoid:** Paid cars that out-earn free ones by a lot; it makes free players feel the grind is rigged.

### A Dusty Trip
**What it does:** A survival road trip: repair and upgrade a vehicle, manage stamina and hunger, drive as far as possible, with no tutorial [2]; vans are built from engine, radiator and wheel parts [3].
**Steal:** The vehicle as a project you build from parts; distance as the score; the road as a story.
**Avoid:** Shipping with no tutorial; our first 5 minutes must teach the vehicle.

### Dead Rails
**What it does:** A train journey survival game with several train variants at different prices and uses [22] (see [[Genre - Survival]]).
**Steal:** A vehicle on a fixed track makes the driving easy and the defending hard, which suits young players.
**Avoid:** Copying its theme and train designs.

### Cops-and-robbers and roleplay driving (Jailbreak family)
**What it does:** Open-world games where vehicles are the way robbers escape and cops chase (details unverified in our sources).
**Steal:** Vehicles as a means to a goal (escape, deliver, chase) rather than the goal itself.
**Avoid:** Copying any game's map or vehicle set.

### Racing templates and community racing games
**What it does:** Community guides and templates teach the race skeleton: checkpoint-validated laps against shortcuts, countdown starts and post-race rewards [11]. A DevForum feedback thread on a kart racer suggested slowing karts on grass or adding time for time spent off-track, instead of hard-blocking every cut [10].
**Steal:** Checkpoints + off-track penalties as two layers of fairness.
**Avoid:** Invisible walls everywhere; they feel worse than a grass slowdown.

## 4. The first five minutes, second by second

| Time | What the player sees and does | Build note |
|---|---|---|
| 0-3 s | Spawns in a garage plaza facing a bright starter car with a "Drive" prompt. | Car pre-placed; no menus. |
| 3-10 s | Presses E / taps / ButtonX; seated; camera swings behind; engine sound; HUD gauge appears. | Ownership set on Occupant change. |
| 10-30 s | A glowing road arrow leads out of the plaza onto a wide, gently curving road. First drift smoke on the first corner. | Road ≥ 24 studs; no traffic for 30 s. |
| 30-60 s | A floating ring gate: "Street Race: 0/3 gates". Driving through starts a 45 s solo checkpoint run. | First structured goal. |
| 60-110 s | Finishes the run: "+$500", a medal, time shown. | First reward under 2 minutes. |
| 110-180 s | Waypoint to the dealer: the next car costs $1,500, shown with its speed vs the starter. Two more street races are marked on the minimap. | Clear next goal and price. |
| 180-270 s | Second and third runs; a jump ramp and a speed trap camera ("142 km/h!"). | Variety of small goals. |
| 270-300 s | Enough cash for the first car; dealer pad pulses; buying it swaps the car with a reveal. | First purchase by ~5 minutes. |

For circuit-first games: 0-20 s lobby, step on a "Quick Race" pad, the race starts within 30 s (bots fill empty grid slots in the first race so it never waits).

Opening rules:
1. **Driving before menus.**
2. **No traffic, police or rival cars in the first 30 s.**
3. **The first goal is a solo run** that can't be lost (a medal tier for everyone who finishes).
4. **Bots fill the first race** so nobody waits in an empty queue.

## 5. Progression and economy

### Car stats (studs/s; Config)
| Class | Top speed | 0-60 time | Grip (friction) | Example price |
|---|---|---|---|---|
| Starter | 70 | 4.5 s | 1.2 | free |
| C | 80-95 | 4.0-3.5 s | 1.2-1.4 | 1,500-8,000 |
| B | 95-115 | 3.5-3.0 s | 1.4-1.6 | 10,000-40,000 |
| A | 115-140 | 3.0-2.5 s | 1.6-1.8 | 50,000-200,000 |
| S | 140-170 | 2.5-2.0 s | 1.8-2.0 | 250,000-1,000,000 |

(1 stud ≈ 0.28 m, so these read as roughly km/h on the gauge.)

### Income
- Open-world driving cash: `$1 per 10 studs driven` above 20 studs/s (cap $600 per 10 minutes so AFK driving bots don't farm), plus jobs and races.
- Street run: $300-800 by medal. Circuit race payout by place: `P(place) = base · (1.0, 0.7, 0.5, 0.35, 0.25, …)` with `base = 1,000 (C), 2,500 (B), 6,000 (A), 15,000 (S)`, plus +20% for a clean race (no off-track penalties).
- Passive showroom (if tycoon layer): a displayed car earns `0.2% of its price per minute` while the owner is online, capped at 6 slots.
- Target pace: first C car in session 1; first B car by day 2-3; first A car by week 2; S cars are 3-6 week goals.

### Upgrades
Engine (top speed +4% per level, 5 levels), Turbo (accel), Tires (grip), Nitro (boost duration). Level cost `= carPrice × 0.08 × 1.5^level`. Each level adds PI and may move the car up a class (rule 9). Cosmetics (paint, rims, underglow, spoilers, horns) are cheap cash items and premium unlocks.

### Time trial boards
Store times as integer milliseconds in an ordered data store per track and season (`TT_<track>_S1`) [23][24]; write only improvements.

## 6. Monetization that fits

Players pay for **cars** (desire), **looks** (status), **time** (cash boosts) and **space** (garage slots). Paid cars must not dominate class-locked races.

| Item | Type | Target price | Where it appears |
|---|---|---|---|
| Premium car (unique look, class-limited) | Game pass or product | 199-799 R$ | Dealer, marked "Premium" with class shown |
| Cash packs | Developer product | 49-999 R$ | Dealer "Need more cash?" next to price |
| 2× cash | Game pass | 199-399 R$ | Shop |
| VIP (tag, VIP garage, horn pack) | Game pass | 199-399 R$ | Shop |
| Extra garage slots (+10) | Game pass | 99-199 R$ | Garage when full |
| Paint/underglow packs | Game pass | 79-199 R$ | Customization screen |
| Private server | Subscription | 100-250 R$/month | Server list; popular for cruising with friends [25] |
| Season pass (limited car at tier 30) | Game pass per season | 399-799 R$ | Season board; free track always |

Rules:
1. **One `ProcessReceipt` in the place, granting by `PurchaseId` idempotently** [26].
2. **Pass ownership checked on the server** with `UserOwnsGamePassAsync` in `pcall` [27]; premium cars spawn only after the server confirms.
3. **Premium cars race in their class** and earn at the same rate as cash cars of that class.
4. **No purchase prompts while driving above 10 studs/s.** Prompts appear at the dealer, in the garage, or after a race.
5. **Off-limits:** loot-box cars without shown odds [28], fake "last chance" timers, ranked advantages for Robux only.

## 7. UI and HUD for this genre

The driving HUD stays at the edges: the road is the screen. See [[05 UI and HUD]], [[08 Mobile]], [[16 Console and Controllers]].

| Element | Position (UDim2 / AnchorPoint) | Size (1080p offsets, UIScale) | Notes |
|---|---|---|---|
| Speed gauge | (1, −24, 1, −24) / (1, 1) on PC/console; (0.5, 0, 1, −24) / (0.5, 1) on touch | 220×220 | Big digits, needle, gear |
| Nitro bar | under the gauge | 200×14 | Blue fill |
| Cash | (0, 16, 0, 72) / (0, 0) | 200×48 | "+$500" floaters |
| Minimap | (0, 16, 1, −16) / (0, 1) on PC/console; top-left on touch | 220×220 | Rotates with car; race gates and waypoints |
| Race position | (0.5, 0, 0, 12) / (0.5, 0) | 200×64 | "2nd / 8", lap "2/3" |
| Lap timer | under position | 220×40 | mm:ss.cc, best lap, delta (green/red) |
| Countdown | center | 300×300 | 3-2-1-GO with sound |
| Touch buttons | right side above jump area | 96×96 | Nitro, Handbrake, Reset, Exit |

Rules:
1. **On touch, the default thumbstick drives** (steer and throttle). Keep the bottom-left 300×300 area clear; put Nitro/Handbrake/Reset/Exit as ContextActionService touch buttons on the right [15][16].
2. **Gamepad:** default triggers and stick drive; A nitro, X handbrake, Y reset, B exit seat, d-pad cycles camera; show glyphs on first drive [17].
3. **Menus (Dealer, Garage, Customize) are ScreenGuis built in StarterGui;** car cards are one template cloned per car. Open with `GuiService.SelectedObject` set; B closes.
4. **Dealer card:** 3D preview (ViewportFrame), price, class badge, stat bars vs current car (green/red), Buy / Test Drive.
5. **Test drive** lets the player try any cash car for 60 s on a test loop; it sells cars better than stat bars.
6. **Results screen** after races: place, time, best lap, cash, XP, "Race again" (same lobby) and "Back to city".

## 8. World and look

1. **Roads are a kit.** Scenic builds roads from fixed-width modules (straight 64, curve 45°/90° at three radii, junction, ramp) so widths and camber are consistent; road surfaces use `Asphalt`-like materials with painted lines as Decals or thin parts.
2. **Wide sight lines.** At 100 studs/s players need to see 150+ studs ahead: gentle hills, no blind 90° turns on open-world roads, signs before sharp corners.
3. **Districts by color and landmark** (beach, downtown, desert, mountain pass); a tall landmark per district so players navigate without the minimap.
4. **Race tracks are fenced with soft barriers** (low walls with `Friction 0.1` so cars slide along them) and grass run-off that slows to 40%.
5. **Ramps and jumps** are clearly marked (yellow-black chevrons) and land on wide flat zones.
6. **Performance:** large maps need `StreamingEnabled` [18]; anchor all scenery, `CastShadow = false` on small props, mesh roads with low triangle counts. Target a phone holding 30 FPS at top speed downtown.
7. **Cars are Models with a `Chassis` PrimaryPart**, unanchored, mass set by `CustomPhysicalProperties` (density lower on the body, higher on the floor pan to keep the center of mass low), wheels as cylinders with high friction.
8. **Lighting:** bright day for cruising, a night district or night races with streetlights (`PointLight` budget: 1 per 2 lamps) and headlights as `SpotLight` on the car.
9. **World is built in Studio as Instances in `Workspace.Map`;** spawn points for cars are parts tagged `CarSpawn` with an attribute `Class`.

## 9. Retention and social

1. **Daily login reward** (cash, then a paint at day 7) and **daily challenges** (drift 500 studs, win 2 races, hit 150 km/h).
2. **Garage as a profile:** a showroom other players can walk through.
3. **Crews:** friends spawn cars next to each other; a "Join friend's car" passenger option.
4. **Badges:** first car, first S class, 10 wins, every track's gold time.
5. **Time-trial boards** per track (global top 50, friends board) on ordered stores [23][24].
6. **Speed traps and drift zones** around the map with per-server and global best values.
7. **Weekly featured race** with a cosmetic reward.
8. **Car meets:** a parking lot event every hour where players line up cars and vote (cosmetic prize).
9. **Return hook:** the dealer shows "New this week" cars, and the garage notes how close you are to the next car.

## 10. Live ops and update cadence

| Shape | Cadence | Content per update |
|---|---|---|
| Open world | Every 2 weeks | 3-6 cars, one map area or event |
| Circuit racing | Every 2-3 weeks | 1-2 tracks, 2-4 cars, ranked season every 6-8 weeks |
| Time trial | Monthly | 1 track, board season reset |
| Vehicle journey | Every 2-4 weeks | New biome or road section, parts, events |

Rules:
1. **New cars appear at the dealer with a "NEW" tag** and in the thumbnail for a week ([[11 Thumbnails, Icons and the Store Page]]).
2. **Limited cars return** in a later season or event; never "gone forever" for cars that were sold for Robux.
3. **Balance passes on car stats** go in patch notes with old and new numbers.
4. **Watch the purchase funnel** (first car, first B, first A); the stall point is the next tuning target.
5. **Seasonal boards** use a new store key per season; old leaders on a Hall of Fame wall.

## 11. Building it in Studio

### Build order
1. **Architect:** shape, map size, car classes and roster, race formats, server size, and the drive model (constraint car, below) in `plan.md`.
2. **Balance:** car stats, prices, payouts and the purchase pace sim in `economy.md`.
3. **Librarian / Scenic:** one reference car Model (chassis, 4 wheels, seat, body) and the road kit.
4. **Builder:** `VehicleService` (spawn, ownership, despawn), the client `DriveController`, and a test loop track. **Playtest** tunes feel on keyboard, phone and gamepad before any other car is made.
5. **Builder:** `RaceService` (queue, grid, countdown, checkpoints, timing, results), `MovementGuard` (speed checks).
6. **Scenic:** the first district and first track as Instances; checkpoints as invisible gate parts tagged `RaceGate` with attribute `Index`.
7. **Frame:** gauge, race HUD, dealer, garage, customize, results; touch buttons.
8. **Merchant:** passes and products; **Builder:** `GarageService` (owned cars, upgrades, cosmetics).
9. **Liveops:** race, purchase and distance analytics; **Reviewer:** forges every remote, tests speedhack and teleport detection, saves.
10. **Producer:** section 15 with evidence.

### Systems list
1. **PlayerData** (session lock, autosave 60 s, save on leave and BindToClose).
2. **VehicleService** (spawn the owned car at a CarSpawn, one car per player, ownership on Occupant change, despawn after 60 s empty).
3. **DriveController** (client: reads seat input, drives motors and steering, nitro, auto-right).
4. **MovementGuard** (server: speed sanity, last good position, strikes).
5. **RaceService** (queues, grid, server countdown, ordered gates, server timing, positions, DNF).
6. **GarageService** (buy, upgrade, customize; all prices from Config).
7. **LeaderboardService** (time-trial ordered stores).
8. **ProductService** (Merchant: one ProcessReceipt).
9. **HudController**, **CameraController** (client).

### Architecture
```
ReplicatedStorage/
  Shared/Config          Cars (stats, price, class), Tracks (gates, MIN_LAP_MS, laps), payouts, product ids
  Remotes/               SpawnCar, BuyCar, Upgrade, Customize, JoinRace, LeaveRace (C→S)
                         RaceState, RaceResult, Toast (S→C)
  Assets/Cars/<CarName>  Model: Chassis (PrimaryPart), Body, Wheels/FL FR RL RR, VehicleSeat, constraints
ServerScriptService/Services/
  PlayerData, VehicleService, MovementGuard, RaceService, GarageService, LeaderboardService, ProductService
StarterPlayer/StarterPlayerScripts/Controllers/
  DriveController, HudController, CameraController
Workspace/Map/
  Districts/..., Tracks/<Track>/Gates/Gate_01.., Grid/Slot_1.., CarSpawns (tagged CarSpawn)
Workspace/Vehicles/      spawned cars (server parents them)
```

### The reference car (built in Studio)
- `Chassis`: a flat part, about 6×1×12 studs, density 2 (`CustomPhysicalProperties`), the PrimaryPart. Body parts welded to it with `WeldConstraint`, `Massless = true` so the body doesn't raise the center of mass.
- Four wheels: cylinder parts (diameter 3, width 1.5), friction 1.2-2.0 by class, `CustomPhysicalProperties` elasticity 0.
- Suspension: per wheel, a `SpringConstraint` (Stiffness and Damping tuned per car, e.g. Stiffness 4,000-8,000, Damping 150-300, FreeLength = ride height) plus a `PrismaticConstraint` on a vertical axis to keep the wheel from moving sideways. DevForum advice for car physics is the same: use standard motor and spring constraints with damping instead of hand-coding forces [29][30].
- Drive: each driven wheel on a `HingeConstraint` (or `CylindricalConstraint`) with `ActuatorType = Motor`; the controller sets `AngularVelocity` and `MotorMaxTorque`.
- Steering: front wheels hang off small "knuckle" parts joined to the suspension by a `HingeConstraint` with `ActuatorType = Servo` on the vertical axis; the controller sets `TargetAngle`.
- A `VehicleSeat` welded to the chassis, `MaxSpeed`, `Torque` and `TurnSpeed` unused (we drive constraints ourselves), `HeadsUpDisplay = false`.
- Attributes on the Model: `CarId`, `TopSpeed`, `Torque`, `MaxSteer`, `NitroBoost`.
Community threads on car scripting are a good start for the VehicleSeat basics [31][32].

### Remotes contract

| Remote | Type | Dir | Args | Server checks | Limit |
|---|---|---|---|---|---|
| SpawnCar | RemoteEvent | C→S | carId: string | owned; near a CarSpawn (≤ 30 studs) or in garage; not in a race | 1 per 5 s |
| BuyCar | RemoteFunction | C→S | carId | exists in Config; not owned; cash ≥ Config price | 1 per 2 s |
| Upgrade | RemoteFunction | C→S | carId, part: string | owned; part in allow-list; level < max; cash | 2 per s |
| Customize | RemoteEvent | C→S | carId, slot, optionId | owned; option owned or free | 4 per s |
| JoinRace / LeaveRace | RemoteEvent | C→S | trackId | in lobby zone; class allowed; not already queued | 1 per 2 s |
| RaceState | RemoteEvent | S→C | phase, t0, lap, pos | — | 4 Hz |
| RaceResult | RemoteEvent | S→C | place, ms, bestLapMs, payout | — | — |

There is no "I crossed a gate", "my lap time" or "I finished" remote. The server learns all of it from the car's replicated position and its own clock.

### Data schema
```lua
-- PlayerData v1 ("u_<UserId>")
{
	v = 1, cash = 0, xp = 0, level = 1,
	cars = {},          -- [carId] = { up = { engine = 0, turbo = 0, tires = 0, nitro = 0 }, paint = "Red", rims = "Stock" }
	equipped = "Starter",
	bestLaps = {},      -- [trackId] = ms (mirror of the board, for HUD deltas)
	wins = 0, races = 0, distance = 0,
	cosmetics = {},     -- [optionId] = true
	receipts = {},      -- [PurchaseId] = os.time(), last 50
	settings = { camera = "Chase", units = "kmh", music = true },
}
```
Wrap every data-store call in `pcall` [33][34].

### Luau: ownership on occupant change (server)
```lua
--!strict
local Players = game:GetService("Players")

local function bindSeat(car: Model)
	local seat = car:FindFirstChildWhichIsA("VehicleSeat", true)
	local root = car.PrimaryPart
	if not seat or not root then return end
	seat:GetPropertyChangedSignal("Occupant"):Connect(function()
		local humanoid = seat.Occupant
		local player = humanoid and Players:GetPlayerFromCharacter(humanoid.Parent)
		if player and car:GetAttribute("Owner") == player.UserId then
			root:SetNetworkOwner(player)
		elseif humanoid then
			-- someone who is not the owner sat in the driver seat: eject them
			humanoid.Sit = false
		else
			if root:CanSetNetworkOwnership() then root:SetNetworkOwnershipAuto() end
		end
	end)
end

return bindSeat
```
Passenger seats are plain `Seat`s, which don't take ownership of the car's physics the way the driver seat logic does here. Roblox's network ownership page describes exactly this driver/passenger split [6][7]; one DevForum thread notes that sitting grants ownership by default, so manage it from the seat [35]. Unanchor the chassis before setting ownership (setting ownership on an anchored part errors, as one thread found with an anchor-based brake [36]).

### Luau: drive controller (client, driver only)
```lua
--!strict
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

type Wheels = { FL: HingeConstraint, FR: HingeConstraint, RL: HingeConstraint, RR: HingeConstraint }

local function drive(car: Model, seat: VehicleSeat, motors: Wheels, steerFL: HingeConstraint, steerFR: HingeConstraint)
	local root = car.PrimaryPart :: BasePart
	local topSpeed = car:GetAttribute("TopSpeed") :: number   -- studs/s
	local torque = car:GetAttribute("Torque") :: number
	local maxSteer = car:GetAttribute("MaxSteer") :: number   -- degrees at low speed
	local wheelRadius = 1.5
	local conn: RBXScriptConnection
	conn = RunService.Heartbeat:Connect(function()
		if seat.Occupant ~= (Players.LocalPlayer.Character and Players.LocalPlayer.Character:FindFirstChildOfClass("Humanoid")) then
			conn:Disconnect()
			return
		end
		local speed = root.AssemblyLinearVelocity:Dot(root.CFrame.LookVector)
		local throttle = seat.ThrottleFloat -- -1..1 from keyboard, thumbstick or triggers
		local steer = seat.SteerFloat
		local target = throttle * topSpeed / wheelRadius -- rad/s at the wheel
		for _, m in { motors.FL, motors.FR, motors.RL, motors.RR } do
			m.AngularVelocity = target
			m.MotorMaxTorque = if throttle == 0 then torque * 0.15 else torque -- engine braking when coasting
		end
		local t = math.clamp(math.abs(speed) / topSpeed, 0, 1)
		local angle = steer * (maxSteer + (maxSteer * 0.35 - maxSteer) * t) -- full lock slow, 35% at top speed
		steerFL.TargetAngle = angle
		steerFR.TargetAngle = angle
	end)
end

return drive
```
Hinge motor directions depend on how each wheel's attachments face; mirror the right-side attachments in Studio so a positive `AngularVelocity` drives every wheel forward, or negate per wheel. The server gives this script to the driver (the controller module requires the car the player is seated in); constraint changes made by the owning client drive the simulation, and the resulting motion replicates.

### Luau: movement guard (server)
```lua
--!strict
local RunService = game:GetService("RunService")
local SAMPLE = 0.2
local STRIKES_TO_RESET = 3

type Track = { car: Model, last: Vector3, lastGood: CFrame, strikes: number, acc: number }
local tracked: { [Model]: Track } = {}

local MovementGuard = {}

function MovementGuard.watch(car: Model)
	local root = car.PrimaryPart :: BasePart
	tracked[car] = { car = car, last = root.Position, lastGood = root.CFrame, strikes = 0, acc = 0 }
end

function MovementGuard.unwatch(car: Model) tracked[car] = nil end

RunService.Heartbeat:Connect(function(dt: number)
	for car, t in tracked do
		t.acc += dt
		if t.acc < SAMPLE then continue end
		local root = car.PrimaryPart
		if not root or not car.Parent then tracked[car] = nil continue end
		local pos = root.Position
		local flat = Vector3.new(pos.X - t.last.X, 0, pos.Z - t.last.Z).Magnitude / t.acc
		local limit = (car:GetAttribute("TopSpeed") :: number) * 1.25 + 15 -- nitro and downhill slack
		t.acc = 0
		t.last = pos
		if flat > limit then
			t.strikes += 1
			if t.strikes >= STRIKES_TO_RESET then
				car:PivotTo(t.lastGood)
				root.AssemblyLinearVelocity = Vector3.zero
				t.strikes = 0
				warn("Speed guard reset", car:GetAttribute("Owner"), math.floor(flat))
			end
		else
			t.strikes = math.max(0, t.strikes - 1)
			t.lastGood = root.CFrame
		end
	end
end)

return MovementGuard
```
Legit teleports (respawn, race grid) call `MovementGuard.watch(car)` again to reset the baseline. Log strikes to analytics; Reviewer decides on kicks.

### Luau: ordered gates and server timing (server)
```lua
--!strict
type Gate = { cf: CFrame, halfWidth: number, index: number }
type Racer = { car: Model, next: number, lap: number, last: Vector3, lapStart: number, bestLap: number? }

local function crossed(g: Gate, a: Vector3, b: Vector3): boolean
	-- gate plane: through g.cf.Position, normal = g.cf.LookVector (race direction)
	local da = (a - g.cf.Position):Dot(g.cf.LookVector)
	local db = (b - g.cf.Position):Dot(g.cf.LookVector)
	if not (da < 0 and db >= 0) then return false end -- must cross forward
	local t = da / (da - db)
	local hit = a:Lerp(b, t)
	local lateral = math.abs((hit - g.cf.Position):Dot(g.cf.RightVector))
	return lateral <= g.halfWidth
end

local function step(r: Racer, gates: { Gate }, laps: number, minLapMs: number, now: number): string?
	local pos = (r.car.PrimaryPart :: BasePart).Position
	local g = gates[r.next]
	if crossed(g, r.last, pos) then
		if r.next == #gates then -- the last gate is the start/finish line
			local lapMs = math.floor((now - r.lapStart) * 1000 + 0.5)
			if lapMs < minLapMs then
				r.last = pos
				return "rejected" -- impossible lap: log it, don't count it
			end
			r.lap += 1
			r.bestLap = if r.bestLap then math.min(r.bestLap, lapMs) else lapMs
			r.lapStart = now
			r.next = 1
			if r.lap >= laps then r.last = pos return "finished" end
		else
			r.next += 1
		end
	end
	r.last = pos
	return nil
end
```
`RaceService` calls `step` for every racer at 10 Hz with `now = workspace:GetServerTimeNow()`. Gate parts in Studio are invisible, non-colliding, `CanQuery = false`, with their front face pointing along the race direction and `Size.X` = track width (so `halfWidth = Size.X / 2`). Sample rate matters: at 170 studs/s a car moves 17 studs per sample, which is why the test is segment-vs-plane, not "inside the gate part". Race results use `UpdateAsync` to keep only better times in the ordered store [23].

### Countdown and grid
1. Racers are pivoted to `Grid/Slot_N`, `MovementGuard.watch` is reset, chassis roots anchored.
2. Server picks `t0 = GetServerTimeNow() + 4` and fires `RaceState("countdown", t0)`; clients render 3-2-1 from `t0`.
3. At `t0` the server unanchors roots, re-sets network ownership to each driver, starts lap clocks at `t0`, and sets cars to the `GhostCars` group for 5 s.

## 12. Twists that work

1. **Build-your-vehicle:** cars from parts (engine, wheels, armor), like A Dusty Trip's vans [3].
2. **Journey survival:** a long road with day and night, fuel and threats ([[Genre - Survival]]).
3. **Delivery jobs:** cargo that can fall off or break; pay by condition and time.
4. **Cops and robbers:** vehicle chases with roles.
5. **Dealership tycoon layer:** a showroom that earns while you play [4][5].
6. **Kart racing with items:** short tracks, item boxes, catch-up items for last place.
7. **Vehicle obby:** ramps, loops and gaps for cars (recompute the jump budget with car speeds; see [[Genre - Obby]]).
8. **Boats and planes:** the same ownership and guard patterns; planes need a separate flight controller with `AlignOrientation` and `VectorForce`.
9. **Drift scoring:** points for angle × speed × time in drift zones, with a board.
10. **Car meets and photo mode:** cosmetic voting events.

## 13. Failure modes

1. **Rubber-banding and jitter:** ownership flipping between players or to the server [6][37].
2. **Flinging:** cars colliding at speed with physics owned by different clients; fix with ghost groups in races.
3. **Flipped and stuck cars:** no auto-right, no reset.
4. **Speedhack and teleport cheats:** no server speed guard; client-reported laps [8][9].
5. **Shortcut abuse:** unordered checkpoints or gates the size of the track's AABB [10][11].
6. **Twitchy thumbstick steering:** no speed-sensitive steering, narrow roads.
7. **Lag on big maps:** no streaming, high-poly roads, hundreds of unanchored props [18].
8. **Half-loaded cars:** non-atomic models streaming wheels out.
9. **Pay-to-win racing:** Robux cars beating every class.
10. **Empty queues:** race lobbies that wait forever for 8 players; no bots or solo start.
11. **Menus before driving.**
12. **Real brands** (logos, names) we don't have rights to.

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Shape chosen: open world, circuit, time trial, kart party, or journey; the hook fits in five words.
- [ ] Market check (Pulse, `cli.mjs market`): what driving games chart now; our hook isn't a sixth copy.
- [ ] We can make 15+ original cars across 4 classes (or 8+ vehicles for a journey game) before launch.
- [ ] One reference car feels good on keyboard, phone and gamepad before the roster is built (feel gate).
- [ ] Movement guard, ordered gates and server timing are in scope (Reviewer reads the plan).
- [ ] Map scope fits streaming and phones (Scenic estimate of part count).
- [ ] Monetization fits without pay-to-win: premium cars by class, cosmetics, garage, VIP.
- [ ] 8-week update plan: cars every 2 weeks, a track or district monthly.

## 15. Checklist

- [ ] Driving within 20 s of joining (timed on a phone).
- [ ] Network owner = driver while seated; auto when empty (Studio Physics → "Show network owner" screenshot).
- [ ] Non-owners can't drive another player's car.
- [ ] Speed guard resets a car moved at 2× its top speed (Reviewer test with a forged CFrame in Studio's client).
- [ ] Gates only count in order and forward; a lap below `MIN_LAP_MS` is rejected.
- [ ] Lap and race times come from server time; client can't post a time.
- [ ] Cars ghost for the first 5 s of a race and in passive mode.
- [ ] Auto-right within 2 s; Reset works on key, touch and gamepad.
- [ ] Steering angle falls with speed; Playtest reports no twitch on thumbstick at top speed.
- [ ] Every action has keyboard, touch and gamepad bindings; menus are gamepad-selectable and B closes.
- [ ] Bottom-left thumbstick area is clear while driving on a phone.
- [ ] Car models stream atomically; the player's car never loses wheels.
- [ ] Premium cars race in their class; payouts don't depend on Robux ownership.
- [ ] One `ProcessReceipt`; repeat receipts don't double-grant.
- [ ] Time-trial board top 50 refreshes every 60 s with `pcall`.
- [ ] Phone holds 30 FPS at top speed in the busiest district (Developer Console screenshot).

## Common mistakes

1. Leaving network ownership automatic, so a passenger or nearby player owns the car [6].
2. Setting network ownership on an anchored part [36].
3. Using `Touched` on gate parts as the source of truth for laps.
4. Client-side lap timers [12].
5. Tweening a car's CFrame instead of using constraints (no physics, no collisions).
6. Body parts with mass raising the center of mass so cars roll; set `Massless`.
7. Same steering angle at every speed.
8. Wheels with default friction on slick materials (cars slide like ice).
9. One giant checkpoint part per corner that can be clipped from the side.
10. Forgetting to reset the speed guard after a legit teleport (false positives).
11. No despawn for empty cars; servers fill with abandoned vehicles.
12. Allowing anyone to sit in anyone's driver seat.

## References

[1] Car Dealership Tycoon vs Driving Empire (2026) (Earnaldo) — https://earnaldo.com/blog/car-dealership-tycoon-vs-driving-empire — Driving Empire world and catalog description; no dedicated passive system.
[2] A Dusty Trip: Guide (Sportskeeda) — https://sportskeeda.com/roblox-news/a-dusty-trip-guide — repair a vehicle; stamina and hunger; no tutorial.
[3] How to build a van in A Dusty Trip (Pocket Gamer) — https://www.pocketgamer.com/roblox/how-to-build-a-van-in-a-dusty-trip — vehicles from engine, radiator and wheel parts.
[4] Play Car Dealership Tycoon on Roblox (StealthyGaming) — https://stealthygaming.com/play-car-dealership-tycoon-on-roblox/ — money from driving, racing and display; expensive and Robux cars earn more.
[5] Car Dealership Tycoon vs Driving Empire (2026) (Earnaldo) — https://earnaldo.com/blog/car-dealership-tycoon-vs-driving-empire — CDT's passive income from display vehicles.
[6] Network ownership (Creator Docs) — https://create.roblox.com/docs/scripting/networking/network-ownership — driver/passenger example; assign ownership on occupant change.
[7] Network ownership (Creator Docs, physics) — https://create.roblox.com/docs/en-us/physics/network-ownership
[8] Security and cheat mitigation tactics (Creator Docs) — https://create.roblox.com/docs/scripting/security/security-tactics
[9] Server-side detection (Creator Docs) — https://create.roblox.com/docs/scripting/security/server-side-detection.md
[10] Feedback on upcoming racing game (DevForum) — https://devforum.roblox.com/t/feedback-on-upcoming-racing-game/311758 — slow on grass or add time for off-track instead of hard cut detection.
[11] Racing template (creation.dev) — https://www.creation.dev/templates/racing-template — checkpoint-validated laps, countdown starts, post-race rewards.
[12] Best way to get accurate speed-run times? (DevForum) — https://devforum.roblox.com/t/best-way-to-get-accurate-speed-run-times/2520069 — client timing gave inaccurate times.
[13] Collisions (Creator Docs) — https://create.roblox.com/docs/en-us/workspace/collisions.md — collision groups.
[14] PhysicsService (engine reference) — https://create.roblox.com/docs/en-us/reference/engine/classes/PhysicsService.md
[15] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[16] Mobile input (Creator Docs) — https://create.roblox.com/docs/input/mobile — mobile buttons with BindAction.
[17] Gamepad input (Creator Docs) — https://create.roblox.com/docs/input/gamepad
[18] Instance streaming (Creator Docs) — https://create.roblox.com/docs/en-us/workspace/streaming — StreamingEnabled, ModelStreamingMode.
[19] Roblox Driving Empire codes (Prima Games) — https://primagames.com/codes/roblox-driving-empire-codes
[20] Car Dealership Tycoon codes (Sportskeeda) — https://sportskeeda.com/roblox-news/car-dealership-tycoon-codes-roblox-free-cash-october-2022
[21] Car Dealership Tycoon codes (RacingGames.gg) — https://racinggames.gg/article/car-dealership-tycoon-codes — codes after milestones and seasonal events.
[22] All Train variants in Dead Rails: Price and usage (Sportskeeda) — https://www.sportskeeda.com/roblox-news/all-train-variants-dead-rails-price-usage
[23] OrderedDataStore (engine reference) — https://create.roblox.com/docs/reference/engine/classes/OrderedDataStore — positive integers; GetSortedAsync.
[24] Create a leaderboard (tutorial) — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/data-storage/create-leaderboard.md
[25] Private servers — https://create.roblox.com/docs/production/monetization/private-servers
[26] Developer products — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt; test purchases.
[27] Passes — https://create.roblox.com/docs/production/monetization/passes — UserOwnsGamePassAsync in a pcall.
[28] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items
[29] How to make car physics better? (DevForum) — https://devforum.roblox.com/t/how-to-make-car-physics-better/3066491 — springs and damping.
[30] Vehicle & Character Physics (DevForum) — https://devforum.roblox.com/t/vehicle-character-physics/408883 — motor and spring constraints for a regular car.
[31] Car scripting, where to start? (DevForum) — https://devforum.roblox.com/t/car-scripting-where-to-start/388923
[32] Help on car script (DevForum) — https://devforum.roblox.com/t/help-on-car-script/1022852
[33] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[34] Data stores (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/data-stores/index.md
[35] Question about network ownership (DevForum) — https://devforum.roblox.com/t/2657613 — sitting grants ownership by default.
[36] Chrono custom physics replication library, page 13 (DevForum) — https://devforum.roblox.com/t/chrono-drop-in-custom-physics-replication-library/3873294?page=13 — seat-weld ownership conflicts; anchored brake errors on SetNetworkOwner.
[37] NetworkOwnership lag (DevForum) — https://devforum.roblox.com/t/networkownership-lag/2888685

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[13 Building It Right]] · [[16 Console and Controllers]] · [[17 Security and Anti-Cheat]] · [[Genre - Survival]] · [[Genre - Obby]] · [[Genre - Tycoon]]
