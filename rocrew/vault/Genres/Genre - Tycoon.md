---
tags: [vault, genre, tycoon, building, management, economy, plots]
for: [lead, pulse, architect, balance, builder, merchant, scenic]
also: [frame, librarian, playtest, kid-tester, reviewer, liveops, splash, producer]
---

# Genre - Tycoon

A Roblox tycoon gives each player a plot of land and lets them watch it grow into a business, a base or a park, bought piece by piece. It comes in several shapes: the classic **button tycoon**, where you step on priced buttons and droppers, walls and machines appear; the **management tycoon**, where customers arrive and you run a restaurant or shop (Restaurant Tycoon 2, Retail Tycoon 2) [11][15]; the **creative park tycoon**, where you place rides, paths and shops freely (Theme Park Tycoon 2) [1]; the **factory sandbox**, where you lay out conveyors and furnaces (Miner's Haven) [18]; and the **resource and logistics tycoon**, where you chop, haul and process (Lumber Tycoon 2) [6][8].

The genre lives on one feeling: *I built this.* Every purchase has to change the world visibly, and the base must look better at minute 20 than at minute 2. A tycoon fails when buttons stop appearing fast enough (the dead middle), when the base looks the same after 30 purchases, or when progress is wiped without the player feeling rich for it.

Read this page before pitching, planning or building any game where the player owns a plot and grows it. Balance reads sections 2 and 5 with [[04 Progression and Economy]]; Builder reads section 11 with [[13 Building It Right]]; Scenic reads section 8 with [[06 World and Look]]; Merchant reads section 6 with [[09 Shops and Monetization]].

Numbers about real games carry citations. All other numbers (prices, timings, plot sizes) are **this studio's design targets**, written to be checked by Balance and Producer, not facts about the market.

## 1. What it is and why it works on Roblox

**The definition the crew uses.** A tycoon is a game where (a) each player owns a persistent plot or base, (b) income is produced by things the player bought and placed (droppers, machines, rides, staff, customers), (c) income buys more of those things, so growth compounds, and (d) the plot itself is the record of progress that other players can see. If the progress is a number in a menu, it is a simulator ([[Genre - Simulator]]); if it is a building you can walk around, it is a tycoon. Read a general roundup of tycoon games before choosing a sub-type [2], then pick one from the table below.

**The sub-types.**

| Sub-type | Core verb | Reference | Strengths | Risks |
|---|---|---|---|---|
| Button tycoon | Step on the next priced button | The classic Roblox format (studio template below) | Instantly readable, fast to build, works for any theme | Same-looking clones; linear; dead middle |
| Management tycoon | Serve customers, stock shelves, upgrade | Restaurant Tycoon 2: cook, serve, collect payment, upgrade [11]; Retail Tycoon 2: stock shelves, fetch stock from distribution, meet customer needs [15] | Deep, long-lived, very replayable | NPC simulation cost; harder first five minutes |
| Creative park tycoon | Place rides, paths and shops freely | Theme Park Tycoon 2, called a Roblox-ified RollerCoaster Tycoon, with real-time building with friends [1] | Self-expression, social showing-off | Needs a good placement tool and saves |
| Factory sandbox | Lay out machines so ore flows to furnaces | Miner's Haven: conveyors move ore, furnaces process it [18][19] | Optimization puzzle, rebirth-driven depth | Complexity scares new players |
| Resource tycoon | Gather, transport, process, sell | Lumber Tycoon 2: from the first axe to the first sawmill [8] | Physical, memorable, emergent stories | Physics cost, griefing, slow start |

**Why it works on Roblox specifically.**
- **Ownership is visible.** Your plot sits next to everyone else's. Players walk over to look, compare and copy. Social comparison is free content.
- **Every purchase is a small reveal.** A wall rises, a dropper slides into place, a ride starts spinning. That is a reward that does not need a popup.
- **It suits any theme.** Pizza, superheroes, military bases, mansions, factories. Pulse can pick the theme from what is trending without changing the systems.
- **Sessions can be long or short.** A button tycoon finishes a floor in 20 minutes; a management tycoon can be played for months. Income that accrues while you walk around supports AFK and multitasking.
- **It reuses well.** One plot system, one button system and one save format serve every tycoon the studio makes ([[13 Building It Right]]).

**The audience and session shape (targets).**
- Button tycoons: ages 7 to 13, phone-heavy. Sessions 15 to 30 minutes, one floor or one rebirth per session.
- Management and creative tycoons: ages 10 to 16 and older, more PC and tablet. Sessions 30 to 90 minutes; players return for weeks to expand, redesign and show off.
- Return reasons: an unfinished base, a rebirth tier, a new item or theme in an update, friends to build with.

## 2. The core loop

**Button tycoon loop statement (write it into `plan.md` and adapt):**

> Claim a plot → the first dropper is free → cash builds in the collector → collect it → step on the next button → a new piece of the base appears and income rises → finish the floor → unlock the next floor or rebirth for a multiplier → repeat.

**Management tycoon loop statement:**

> Open with a small starter shop → customers arrive and pay → spend on equipment, decor, staff and space → better ratings bring more and richer customers → unlock new item types and areas → redesign and expand.

**Factory loop statement:**

> Place a mine or source → route conveyors through upgraders → into a furnace that sells → spend on better machines → optimize the layout → rebirth for permanent bonuses and new machine tiers.

**Time layers (all sub-types).**

| Layer | Button tycoon | Management tycoon | Target |
|---|---|---|---|
| Seconds | Drops fall, the collector counter ticks, cash sound | Customers walk in, order, pay | Visible income event at least every 2 s |
| Minutes | Next button affordable | Next upgrade affordable; a customer complaint to fix | A purchase every 20 to 60 s in the first 10 min |
| Session | Finish a floor, rebirth | Unlock a new area or item tier; reach a rating milestone | One "the base looks different" moment per 5 min |
| Days | New floors, rebirth tiers, decor | New themes, redesigns, events | A new goal each login |

**Loop rules.**
1. **Every purchase changes the world visibly within 1 s.** The bought object builds in with a 0.4 to 0.8 s tween (rise from the floor, or scale from 0.1 to 1) and a sound. Done right: a wall rises with a thud and dust. Done wrong: the button disappears and nothing seems to happen.
2. **Income is always visible as a rate.** Show "+245/s" next to the cash counter. Players plan around rates.
3. **There is always a next button in sight.** New buttons appear next to the last purchase, glowing, with the price readable from 30 studs. Never more than 3 unpurchased buttons visible at once in a button tycoon: choice overload stalls kids.
4. **Non-income purchases are paced between income purchases.** Walls, stairs and decor give the reveal without changing income; alternate them so the base grows in looks while income steps up every second or third button.
5. **Waiting is never idle.** If the next button needs 90 s of income, give the player something in the meantime: a collectible on the plot, an obby to the roof, a daily chest, a mini-quest.

## 3. Top games in the genre

### Theme Park Tycoon 2: creativity as the endgame
**Game:** Theme Park Tycoon 2, by Den_S ([1][4][5])
**Shows:** Reviewers describe it as a Roblox-ified RollerCoaster Tycoon: players place rides, paths and shops and can build with friends in real time [1]. It was promoted for Roblox on Xbox One with the line "Let your creativity run wild" [3]. One codes site notes it does not have a code system [17].
**Why it works:** The economy exists to fuel creativity. After the first hour the goal is not money but making a park you are proud of and showing it to friends.
**Steal:** Free placement on a grid, co-building with friends on one plot, and an economy that gets out of the way once the player is invested. Ship it on every platform, controller included.
**Avoid:** Launching a free-placement tycoon without a solid, mobile-friendly placement tool and reliable saves. Those are the product.

### Lumber Tycoon 2: physical logistics
**Game:** Lumber Tycoon 2, by Defaultio ([6][9])
**Shows:** Its wiki covers items, trees and gifts [6]. Guides walk new players from their first axe to their first sawmill [8] and list what every new player needs to know [7]. Bloxodes listed about 1.3 billion total visits when searched in October 2026 [9].
**Why it works:** Every step is physical: you chop a tree, carry or drive the logs, and process them. The world is the economy, and that creates stories ("we lost the truck off the cliff").
**Steal:** A tangible resource the player must move. Different trees or materials in different places, so travel is part of progression.
**Avoid:** A slow, confusing start. The existence of first-axe-to-sawmill guides [8] shows new players need help; put that guidance in the game, as a quest line.

### Restaurant Tycoon 2: management with characters
**Game:** Restaurant Tycoon 2, by Ultraw Games, based in the Isle of Man ([10])
**Shows:** A beginner guide describes its core loop as cooking, serving, collecting payment and upgrading [11]. The developer's DevForum thread logs a long line of updates, including a "Modern Home" release in March 2026 [10]. Codes give cash and diamonds [12][13].
**Why it works:** The loop has a person on each end: you serve customers, and the customers react. Years of updates keep adding themes and items.
**Steal:** Customers with visible needs (order bubble, patience bar), a two-currency economy (cash plus a premium currency like diamonds), and a public update log.
**Avoid:** Overwhelming new players with every station at once. Start with one table, one stove and one dish.

### Retail Tycoon 2: stock, shelves and demand
**Game:** Retail Tycoon 2 ([15])
**Shows:** A beginner guide describes keeping shelves stocked with popular products, making trips to distribution centres and making sure customers' needs are met [15]. Code coverage asks whether it has any codes at all [16].
**Why it works:** Supply and demand are physical: an empty shelf is a visible problem with an obvious fix. The trip to fetch stock adds a logistics layer like Lumber Tycoon 2's hauling.
**Steal:** Visible stock levels on every shelf (full, half, empty). A supply run as a recurring task that automation (staff) later removes.
**Avoid:** Making restocking a chore forever. Sell or unlock staff so the player graduates from chores to decisions.

### Miner's Haven: the factory puzzle
**Game:** Miner's Haven, a sandbox tycoon ([18][20])
**Shows:** Its wiki describes conveyors that move ore from one point to another at a normal speed of 100%, a walled Military-Grade Conveyor that moves ore 50% faster, and an item (The Hourglass) that permanently speeds up all conveyors on your base [18]. The Reinforced Furnace processes ore at 5x but sits high, so ore needs a fast conveyor and a ramp, or an ore cannon, to reach it [19]. Some items, like the Conveyor Corner, are retired [18]. The game page warns that using a macro to rebirth continuously results in a ban [20].
**Why it works:** Items have trade-offs (a 5x furnace that is hard to feed), so layout is a puzzle and players share designs.
**Steal:** Machines with a strength and a placement cost. Retiring items to keep the shop fresh and old items collectible. A clear published rule on automation.
**Avoid:** Shipping 200 machine types at launch. Start with 15, each with an obvious role.

### Bee Swarm Simulator: the base that grows slot by slot (adjacent)
**Game:** Bee Swarm Simulator, by Onett ([23])
**Shows:** Players bring pollen to their hive to convert into honey, and spend honey on bees, hive space and equipment [23].
**Why it works:** The hive is a small tycoon inside a simulator: each new slot and bee is visible on your base.
**Steal:** A visible personal structure that grows by slots, even in a game whose main loop happens elsewhere. Every tycoon needs this visual record.
**Avoid:** Treating the base as a menu. It must be a place.

### Pet Simulator 99: a rebirth that does not punish (adjacent)
**Game:** Pet Simulator 99 ([24])
**Shows:** A guide describes its rebirth as unlocking features such as auto-hatch and teleport without wiping progress [24].
**Why it works:** Players rebirth eagerly because rebirth gives, not takes.
**Steal:** For tycoons, a rebirth that keeps decorations, cosmetics and a "museum" of the previous base, and unlocks a new theme or machine tier. The wipe is the base's income pieces, not the player's identity.
**Avoid:** Wiping everything, including purchases made with Robux.

### Muscle Legends: named tiers of places (adjacent)
**Game:** Muscle Legends ([25])
**Shows:** Rebirths open new gyms such as the Frost Gym, Mythical Gym and Muscle King Gym [25].
**Why it works:** Named places tell players their rank.
**Steal:** Name your tycoon's floors or rebirth themes ("Garage", "Workshop", "Factory", "Megaplant") so progress is a place name players can say to friends.
**Avoid:** Floors that differ only in color.

### The pattern list
- The plot is the scoreboard: visible, walkable, comparable.
- Each purchase is a reveal.
- Depth comes from management (customers), creativity (placement) or optimization (layouts), never from more of the same button.
- Long-lived tycoons update for years with new items and themes [10].

## 4. The first five minutes for this genre, second by second

### Button tycoon

| Time | What happens | Build notes |
|---|---|---|
| 0 to 3 s | Spawn in the hub facing the plots. An arrow and text: "Claim a tycoon!" pointing to the nearest free plot | Hub spawn faces plots; arrow is a `Beam` from the character to the free plot's claim pad |
| 3 to 10 s | Walk onto the claim pad (within 30 studs). The plot's sign shows your name; the gate turns your team color; a fanfare | Auto-claim on join is also fine: teleport the player onto their plot at 2 s with a toast "This is your tycoon!" |
| 10 to 15 s | The first button reads "Dropper (FREE)". Step on it: the dropper rises and starts dropping | Free first button; build-in tween 0.6 s |
| 15 to 30 s | Drops ride the conveyor into the collector. The collector shows "$12". Arrow: "Collect your cash!" | Collector `SurfaceGui` with the stored cash, 80 px text |
| 30 to 45 s | Step on Collect: coins fly to the HUD counter. The next button glows: "Dropper 2: $60" | First paid button costs about 15 s of income |
| 45 to 90 s | Buy Dropper 2, then a conveyor upgrade. Rate shows "+15/s" | Rate text next to cash |
| 1:30 to 3:00 | Walls, a door, a dropper, an upgrader. The base visibly takes shape | Alternate looks and income buttons |
| 3:00 to 4:00 | Stairs to floor 2 appear as a button. A teaser on floor 2 (a big machine under a tarp) is visible | Show what's coming |
| 4:00 to 5:00 | The first gamepass button appears on the plot as a gold button ("2x Cash"), alongside, not in place of, normal buttons. Daily reward toast | No modal popups; the pass button is optional and clearly marked with the Robux icon |

### Management tycoon

| Time | What happens | Build notes |
|---|---|---|
| 0 to 5 s | Spawn inside your own small shop or restaurant, already set up with one station | A pre-built starter layout; no empty plot |
| 5 to 20 s | The first customer walks in with an order bubble. Arrow on the station: "Make the order!" | NPC spawns at 5 s, not before the player can move |
| 20 to 40 s | Complete the order with one or two taps; the customer pays and leaves happy; cash pops | Order completion in 2 interactions max |
| 40 to 90 s | Three more customers arrive in a gentle stream. A "Buy a second table: $50" goal appears | Customers arrive every 10 to 15 s early |
| 1:30 to 3:00 | Enter build mode for the first time: place the table. Build mode is taught with one placement | Build mode tutorial is a single forced placement with a ghost preview at the right spot |
| 3:00 to 5:00 | First automation: hire a waiter or unlock auto-serve for one station. The player now watches income they did not tap for | The shift from doing to managing is the hook |

**Rules for the opening.**
1. **The player owns something in under 10 s.** Auto-claim if needed.
2. **The first purchase is free and the second costs about 15 s of income.**
3. **No modal popups before 4:00.** Pass buttons on the plot are fine because they are part of the world and optional.
4. **Management tycoons start furnished.** An empty plot plus a build menu is a creative-tycoon opening and loses most kids; give them a running starter shop.
5. **The first automation lands before 5:00.** It is the moment the game says "you are the boss now."

## 5. Progression and economy

**5.1 Think in payback time.** For every income purchase, define `payback = cost / income gained` and `time_to_afford = cost / current income`. Payback is how good the purchase is; time to afford is how long the player waits. Keep both rising slowly and smoothly. Pecorella's idle-game math describes the same balance between exponentially growing costs and income [30].

**Targets.**

| Stage | Time to afford a button | Payback of an income button |
|---|---|---|
| First 5 min | 10 to 40 s | 10 to 80 s |
| 5 to 15 min | 30 to 75 s | 60 to 150 s |
| 15 to 30 min | 60 to 120 s | 120 to 300 s |
| Late floors | 2 to 4 min | 3 to 8 min |

**5.2 Worked table: the first 12 buttons (targets).** Starting income from the free dropper is 4 per second.

| # | Button | Cost | Income after (/s) | Time to afford | Payback |
|---|---|---|---|---|---|
| 0 | Dropper 1 (free) | 0 | 4 | 0 s | — |
| 1 | Dropper 2 | 60 | 10 | 15 s | 10 s |
| 2 | Conveyor speed (+50%) | 200 | 15 | 20 s | 40 s |
| 3 | Dropper 3 | 400 | 27 | 27 s | 33 s |
| 4 | Walls (looks) | 300 | 27 | 11 s | — |
| 5 | Upgrader 1 (x1.5) | 1,000 | 40 | 37 s | 77 s |
| 6 | Dropper 4 | 1,800 | 65 | 45 s | 72 s |
| 7 | Stairs to floor 2 (looks) | 2,500 | 65 | 38 s | — |
| 8 | Dropper 5 | 4,000 | 110 | 62 s | 89 s |
| 9 | Upgrader 2 (x1.5) | 7,500 | 165 | 68 s | 136 s |
| 10 | Dropper 6 | 12,000 | 245 | 73 s | 150 s |
| 11 | Decor set (looks) | 8,000 | 245 | 33 s | — |
| 12 | Collector x2 | 25,000 | 490 | 102 s | 102 s |

The sum of the waits is about 9 minutes; with walking and collecting, about 12. A floor of 30 buttons should take 20 to 25 minutes. Balance simulates the full list in `games/<slug>/sim/` with walking overhead (add 3 s per button) and collection trips.

**5.3 The income model (button and factory tycoons).**

```
income_per_second = Σ over droppers (drop_value × drops_per_second)
                    × Π over upgraders the drop passes through (upgrader_multiplier)
                    × collector_multiplier
                    × rebirth_multiplier × pass_multiplier × boosts
```

For a factory sandbox, the chain depends on layout, so compute it from the actual path: each drop carries a value that upgraders multiply as it passes, and the furnace pays `value × furnace_multiplier` when it arrives. Cap the number of times a single upgrader can affect one drop at 1, or loops will create infinite money.

**5.4 Rebirth.** Most button tycoons end with a finished base. Options in order of preference:
1. **Rebirth to a new theme.** The base resets, the next theme ("Workshop → Factory → Megaplant") has new looks and machines, and a permanent multiplier rises (studio default +25% per rebirth, additive). Keep decorations and a small "trophy room".
2. **New floors.** The base keeps growing upward; floor n costs about 6x floor n−1 in total.
3. **Prestige currency.** Rebirth pays tokens that buy permanent upgrades (faster conveyors, a starting cash bonus), the prestige-loop pattern described in [32] and in [[Genre - Idle and Incremental]].

Whichever option you pick, show the benefit on the rebirth screen before the player confirms [31].

| Rebirth | Requirement | Multiplier after | Unlock | Target time |
|---|---|---|---|---|
| 1 | Finish floor 3 (all buttons) | x1.25 | Theme 2, auto-collect for 15 min per session | 45 to 60 min |
| 2 | Finish theme 2 floor 3 | x1.5 | Rebirth-only decor | 60 to 75 min |
| 3 | Same | x1.75 | Theme 3, a new machine type | 70 to 90 min |
| 5 | Same | x2.25 | Gold plot border, title | 2 to 3 h |

Rebirths must be rate-limited on the server and macros addressed in a published rule, as Miner's Haven does [20].

**5.5 Management tycoon formulas (starting templates).**

```
arrivals_per_minute = base_arrivals × (0.5 + rating / 5) × capacity_factor
conversion          = clamp(1 - k × (price / fair_price - 1), 0.1, 1)       -- k ≈ 1.5
revenue_per_minute  = arrivals_per_minute × conversion × average_ticket
rating (0..5)       = 5 × clamp(0.4 × service + 0.3 × cleanliness + 0.3 × decor, 0, 1)
service             = clamp(1 - average_wait / patience, 0, 1)
```

- **Patience** starts at 45 s and shrinks for picky customer types.
- **Fair price** is set per item in config; the player can set prices within 50% to 200% of it.
- **Staff** remove taps (a waiter serves automatically) and cost a wage per minute: a sink that scales.
- **Customer types** (families, critics, VIPs) unlock with rating and pay more but have less patience.

**5.6 Theme park template.** Ride capacity per hour = `riders_per_cycle × 3600 / cycle_seconds`. Guests choose rides by `excitement / queue_minutes`. Park entry fee and ride fees are the two income knobs. Show queue lengths on every ride; a 10-minute queue is the player's signal to build another ride.

**5.7 Sinks.** Buttons themselves are the main sink. Add: wages (management), maintenance or breakdowns (repair cost, a small reason to tend the base), decorations with no income, rebirth.

**5.8 Offline income.** Optional. If offered, pay `income_per_second × min(offline_seconds, 4 h) × 0.25`, computed on join from a saved `os.time()`, with a "Welcome back! You earned $X" popup. Sell a pass that raises the efficiency to 0.5, not one that removes the cap.

## 6. Monetization that fits

Merchant proposes, the owner sets prices and creates the items (crew rules). See [[09 Shops and Monetization]].

| Item | Type | Effect | Price range to propose (R$, targets) |
|---|---|---|---|
| 2x Cash | Game pass | Doubles the pass bucket | 199 to 349 |
| Auto Collect | Game pass | Collector cash goes straight to your balance | 99 to 199 |
| VIP | Game pass | Exclusive decor, VIP door, chat tag, +10% | 299 to 699 |
| Premium dropper or machine | Game pass, shown as a gold button on the plot | A strong machine available early | 149 to 399 |
| Bigger plot / extra floor | Game pass | More space (creative and management) | 249 to 499 |
| Decoration pack | Game pass | Themed decor set, no income | 99 to 299 |
| Fast staff / extra staff slot | Game pass | Management convenience | 149 to 299 |
| Cash pack | Developer product | Scaled to the price of the player's next button (for example 2x the next button) | 25 to 399 |
| 2x Cash 30 min | Developer product | Temporary boost | 29 to 49 |
| Skip a construction timer | Developer product | Only if timers exist; never on the first floor | 15 to 49 |

**Rules.**
1. **Pass buttons live on the plot, next to the normal path, in gold with a Robux icon.** This is the genre's native shop: the player sees the item in the world where it will go. Never place a pass button where it blocks the next free button.
2. **Nothing on the main build path requires Robux.** Every paid machine has a free path to an equal or better machine later.
3. **Cash packs scale with progress.** Compute on the server at purchase: `grant = 2 × cost_of_next_button`.
4. **Decor is a first-class product in creative and management tycoons.** Players spend on how their base looks when the base is the flex.
5. **`ProcessReceipt` is set once, records `PurchaseId`, and returns `PurchaseGranted` only after the grant is saved; on failure it returns `NotProcessedYet` so Roblox retries** [26][27]. Troubleshooting threads about dev products that charge but do not grant usually trace back to handler mistakes [28].
6. **Crates or random decor bought with Robux show the odds of every outcome as percentages** ([[Genre - RNG and Collection]], [33]).

**Off-limits.**
- Buttons on the main path that cost Robux.
- Paid protection from raids or griefing that is needed to play normally. Safety is free.
- Selling a pass that makes another player's plot worse (sabotage).
- Fake timers and fake "limited" stock.
- Any purchase whose effect is decided or applied on the client.

## 7. UI and HUD for this genre

Frame owns this with [[05 UI and HUD]] and [[08 Mobile]]. Tycoons put most information in the world (buttons, signs, collectors), so the HUD can be light.

**HUD layout (phone landscape, 1334 x 750 reference).**

| Area | Contents | Spec |
|---|---|---|
| Top center | Cash and rate: "$12,450  +245/s" | Pill 260 x 52 px, rate in a smaller 18 px line |
| Top left | Next goal: "Next: Dropper 5 ($4,000)" with a bar | 280 x 64 px |
| Left rail | Shop (passes and products), Rebirth, Daily, Settings | 4 to 5 buttons, 72 x 72 px |
| Bottom center (management/creative) | Build bar: categories, then item cards | 120 px tall bar; cards 96 x 96 px |
| Bottom right | Keep clear for jump and build-mode buttons | 220 x 220 px safe area |

**In-world UI specs.**
- **Button pad:** 6 x 1 x 6 studs, neon green when affordable, gray when not, gold for passes. `BillboardGui` above it: name 28 px, price 36 px, `MaxDistance = 60`, `AlwaysOnTop = false`.
- **Collector:** `SurfaceGui` with stored cash at 80 px text; pulses when over 30 s of income is waiting.
- **Plot sign:** owner name and rebirth count, readable from the hub.

**Must-have screens.**
1. **Shop:** passes and products, each with a one-line effect and the in-world location for plot items.
2. **Rebirth:** current and next multiplier, requirements checklist, what you keep (decor, passes, trophies) and what resets.
3. **Build mode (management and creative):** category tabs, item cards with price, a ghost preview (green when valid, red when blocked), rotate (R / button), move, delete with refund percentage shown, and undo for the last 10 actions.
4. **Stats panel (management):** rating stars with the three components (service, cleanliness, decor) and one tip ("Customers wait too long: hire a waiter").
5. **Visit / plots list:** jump to a friend's plot.
6. **Settings:** music, SFX, hide drop parts (performance), low graphics.

**Mobile build mode.** Tap a card, tap the ground to place a ghost, drag to move, two big buttons (Rotate 72 x 72 px, Confirm 96 x 72 px) above the right thumb, Cancel on the left. Never rely on a keyboard key. Snap to a 2-stud grid by default and offer 1-stud for detailers.

## 8. World and look

Scenic owns this with [[06 World and Look]].

**Plot layout (button tycoon).** 6 to 8 plots per server arranged in a ring or two rows around a central hub. Plot size 100 x 100 studs, with 20 studs of road between plots. Each plot has a claim gate on the hub side, the first dropper 15 studs from the gate, and buttons laid out in a path that walks the player in a loop around the base and then upstairs.

**Plot layout (management and creative).** One plot per player, 160 x 160 to 256 x 256 studs, placed far enough apart that streaming loads only your own and neighbors. A shared street or plaza where customers or guests enter.

**Rules.**
1. **The empty plot looks intentional.** Foundation outline, pale "ghost" silhouettes of the future buildings, and the first button lit. An empty baseplate reads as broken.
2. **Each theme has a palette of 3 main colors and 1 accent.** Factory: steel gray, safety yellow, brick red, neon cyan accent. The finished base must look different from the start at a glance and in the thumbnail.
3. **Drops are small and bright.** 1 x 1 x 1 stud, neon or metallic, colored by value tier. The flow of drops is the base's heartbeat.
4. **Height means progress.** Floors stack upward; the tallest base on the server is visible from everywhere.
5. **Your plot is unmistakable.** Name sign, a colored border, and a beacon `Beam` visible from the hub.
6. **Performance budget per plot.** Under 2,500 parts when complete for button tycoons; under 8,000 for creative plots with streaming. Use meshes and `Model.LevelOfDetail` for big bases ([[07 Characters, VFX and Assets]]).

## 9. Retention and social

See [[10 Retention and Social]].

1. **Visit and like.** A "Visit" list and a like button on each plot; the most-liked plot of the server gets a crown. Social comparison is the genre's best retention tool.
2. **Co-building.** Let friends build on one plot with permissions (Theme Park Tycoon 2's real-time building with friends is a known draw [1]). Permissions: Visitor, Builder, Co-owner.
3. **Two-player tycoons.** A plot for two with shared income is a strong twist for friends.
4. **Daily rewards and playtime gifts** as in other genres, with day 7 an exclusive decoration.
5. **Collections.** Rare decor from events and rebirths that players display. Retired items (Miner's Haven retires items [18]) become status.
6. **Leaderboards:** highest rebirth, total earned, most-liked plot this week.
7. **Saved bases.** The plot reloads exactly as left, every time. A tycoon that loses a base loses the player forever.
8. **Return hooks per day.** Day 1: the next floor. Day 2: the daily reward plus a rebirth goal. Day 3: an event decor item. Day 7: the streak decor.

## 10. Live ops and update cadence

See [[12 Live Ops and Launch]]. Long-lived tycoons ship steady updates: Restaurant Tycoon 2's developer thread records updates years into its life, including a "Modern Home" release in March 2026 [10].

**Cadence (targets).**
- **Every 2 weeks:** a set of new items or decor (management/creative), or a new floor (button).
- **Every 4 to 6 weeks:** a new theme or area, plus an event with limited decor.
- **Seasonal:** holiday decor sets; these sell well as passes and as event rewards.
- **Codes:** optional. Some top tycoons have used codes for cash and premium currency for years [12][13][14], factory tycoons included [21][22]; others do not have a code system [17]. If you do, keep codes small and tied to milestones.
- **Retirements:** retire 2 to 3 old items per quarter into "legacy" status with notice, so owned ones become collectibles [18].

**The update kit.** A machine template (model, config entry, button), a decor template, and a theme template (palette, floor kit, wall kit). New items should be configuration plus a model, never new code.

**What to watch.** Time to claim, time to first paid button, buttons bought per session, drop-off by button index (find the dead middle), rebirths per day, build-mode entries per session, and save failures.

## 11. Building it in Studio

Builder owns code; Merchant owns purchase modules; Scenic owns plot art; Frame owns build-mode UI. See [[13 Building It Right]] and [[14 Roblox Studio Workflow]].

**11.1 Systems list.**
1. PlotService: plots, claim, release, ownership, permissions.
2. PlayerData: cash, rebirths, purchased buttons or placed items, settings, receipts.
3. ButtonService (button tycoon) or PlacementService (management/creative).
4. IncomeService: computes income per second from owned items on the server; credits the collector.
5. Collector and Collect pad.
6. Rebirth.
7. Customers / guests (management): spawning, pathing, orders, satisfaction.
8. Staff (management).
9. Monetization: passes, products, receipts.
10. Daily, gifts, likes, visits, leaderboards.
11. Analytics.

**11.2 Architecture.**

```
ReplicatedStorage
  Shared/
    Config/ Buttons.lua (or Items.lua), Themes.lua, Rebirth.lua, Monetization.lua
    Format.lua, Formula.lua
  Remotes/
ServerScriptService
  Main.server.lua
  Services/ DataService, PlotService, ButtonService, PlacementService, IncomeService,
            CollectorService, RebirthService, CustomerService, PurchaseService, SocialService
ServerStorage
  Assets/ Machines, Decor, Themes
Workspace
  Plots/ Plot1..Plot8 (each: Base part, ClaimPad, Collector, Buttons folder, Built folder)
StarterPlayerScripts
  Controllers/ DropVisualController, BuildModeController, PlotBeaconController
StarterGui
  HUD, Shop, Rebirth, BuildBar, Stats, Visit, Settings
```

**11.3 Remotes and validation.**

| Remote | Type | Client sends | Server checks |
|---|---|---|---|
| (claim) | Touched on ClaimPad, server side | — | Player has no plot; plot is free |
| (button) | Touched on button pad, server side | — | Toucher owns the plot; prerequisites bought; enough cash; debounce 0.5 s |
| `Collect` | Touched on collect pad, server side | — | Owner only |
| `PlaceItem` | RemoteFunction | item id, position, rotation step | Item unlocked and affordable; position inside own plot bounds; snapped to grid; no overlap; item count under limit |
| `MoveItem`, `DeleteItem` | RemoteFunction | item uid (+ new position) | Owns the item; same checks as place; refund percentage from config |
| `SetPrice` (management) | RemoteFunction | item id, price | Within 50% to 200% of fair price |
| `Rebirth` | RemoteFunction | — | Requirements met; at most one rebirth per 30 s |
| `LikePlot` | RemoteFunction | plot id | Not own plot; once per plot per day |

**11.4 Data schema.**

```lua
--!strict
-- ReplicatedStorage/Shared/TycoonTypes.lua
export type PlacedItem = {
	Id: string,      -- config id, e.g. "Table_Round"
	X: number,       -- position in plot space, studs, snapped
	Y: number,
	Z: number,
	R: number,       -- rotation steps of 90 degrees (0..3) or 15 degrees (0..23)
	C: string?,      -- optional color id
}

export type TycoonData = {
	Version: number,
	Cash: number,
	Rebirths: number,
	Theme: number,
	Bought: { [string]: boolean },        -- button tycoon: button id -> true
	Placed: { [string]: PlacedItem },     -- creative/management: uid -> item
	Unlocked: { [string]: boolean },      -- item ids available in the build bar
	Prices: { [string]: number },         -- management: item id -> chosen price
	Decor: { [string]: number },          -- owned decor counts (kept on rebirth)
	Trophies: { [string]: boolean },      -- kept on rebirth
	Likes: number,
	LastOnline: number,                   -- os.time() at last save, for offline income
	Daily: { Streak: number, LastClaim: number },
	Receipts: { [string]: boolean },
}

return nil
```

Positions are stored relative to the plot, so a base loads onto whichever plot the player gets next time. A data store key holds up to 4 MB; 5,000 placed items at roughly 60 bytes each is about 300 KB, well inside it. Cap items per plot in config anyway (for performance), for example 1,500 for creative plots.

**11.5 Plot claim and release.**

```lua
-- ServerScriptService/Services/PlotService.lua
local Players = game:GetService("Players")

local PlotService = {}
local owners: { [Model]: Player } = {}
local plotOf: { [Player]: Model } = {}

function PlotService.getPlot(player: Player): Model?
	return plotOf[player]
end

function PlotService.claimFirstFree(player: Player): Model?
	if plotOf[player] then return plotOf[player] end
	for _, plot in workspace:WaitForChild("Plots"):GetChildren() do
		if plot:IsA("Model") and owners[plot] == nil then
			owners[plot] = player
			plotOf[player] = plot
			plot:SetAttribute("OwnerUserId", player.UserId)
			return plot
		end
	end
	return nil -- server full of plots: MaxPlayers must equal the plot count
end

function PlotService.release(player: Player)
	local plot = plotOf[player]
	if not plot then return end
	plot:SetAttribute("OwnerUserId", nil)
	local built = plot:FindFirstChild("Built")
	if built then built:ClearAllChildren() end
	owners[plot] = nil
	plotOf[player] = nil
end

function PlotService.start()
	Players.PlayerRemoving:Connect(PlotService.release)
end

return PlotService
```

Set the place's maximum players equal to the number of plots so every player always gets one. Release only after the player's data has been saved.

**11.6 Buttons with prerequisites.**

```lua
--!strict
-- ReplicatedStorage/Shared/Config/Buttons.lua
export type ButtonDef = {
	Cost: number,
	Requires: { string },   -- button ids that must be bought first
	Builds: string,         -- model name under ServerStorage.Assets.Machines or the theme kit
	Income: number?,        -- added income per second, for droppers
	Multiplier: number?,    -- for upgraders and collectors
	Pass: number?,          -- game pass id if this is a gold pass button
}

local Buttons: { [string]: ButtonDef } = {
	Dropper1 = { Cost = 0, Requires = {}, Builds = "Dropper_T1", Income = 4 },
	Dropper2 = { Cost = 60, Requires = { "Dropper1" }, Builds = "Dropper_T1", Income = 6 },
	ConveyorSpeed1 = { Cost = 200, Requires = { "Dropper2" }, Builds = "Conveyor_Fast", Multiplier = 1.5 },
	Dropper3 = { Cost = 400, Requires = { "ConveyorSpeed1" }, Builds = "Dropper_T2", Income = 8 },
	Walls1 = { Cost = 300, Requires = { "Dropper3" }, Builds = "Walls_F1" },
}

return table.freeze(Buttons)
```

```lua
-- ServerScriptService/Services/ButtonService.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local Buttons = require(ReplicatedStorage.Shared.Config.Buttons)
local DataService = require(script.Parent.DataService)
local PlotService = require(script.Parent.PlotService)
local IncomeService = require(script.Parent.IncomeService)

local ButtonService = {}
local lastPress: { [Player]: number } = {}

local function prerequisitesMet(bought: { [string]: boolean }, def): boolean
	for _, id in def.Requires do
		if not bought[id] then return false end
	end
	return true
end

local function buildModel(plot: Model, buttonId: string, def)
	local template = ServerStorage.Assets.Machines:FindFirstChild(def.Builds)
	local anchor = plot.Anchors:FindFirstChild(buttonId) -- a Part marking where it goes
	if not template or not anchor then return end
	local model = template:Clone()
	model.Name = buttonId
	local target = anchor.CFrame
	model:PivotTo(target * CFrame.new(0, -6, 0))
	model.Parent = plot.Built
	-- rise from the floor in 0.6 s: tween a CFrameValue and pivot on change
	local cf = Instance.new("CFrameValue")
	cf.Value = target * CFrame.new(0, -6, 0)
	cf.Changed:Connect(function(v) model:PivotTo(v) end)
	local tween = TweenService:Create(cf, TweenInfo.new(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Value = target })
	tween.Completed:Connect(function() cf:Destroy() end)
	tween:Play()
end

function ButtonService.refresh(player: Player)
	-- show buttons whose prerequisites are met and that are not bought; hide the rest
	local plot = PlotService.getPlot(player)
	local data = DataService.get(player)
	if not plot or not data then return end
	for _, pad in plot.Buttons:GetChildren() do
		if not pad:IsA("BasePart") then continue end
		local def = Buttons[pad.Name]
		local visible = def ~= nil and not data.Bought[pad.Name] and prerequisitesMet(data.Bought, def)
		pad.Transparency = if visible then 0 else 1
		pad.CanTouch = visible
		local gui = pad:FindFirstChildOfClass("BillboardGui")
		if gui then gui.Enabled = visible end
	end
end

function ButtonService.bind(plot: Model)
	for _, pad in plot.Buttons:GetChildren() do
		if not pad:IsA("BasePart") then continue end
		pad.Touched:Connect(function(hit)
			local player = Players:GetPlayerFromCharacter(hit.Parent)
			if not player or PlotService.getPlot(player) ~= plot then return end
			local now = os.clock()
			if lastPress[player] and now - lastPress[player] < 0.5 then return end
			lastPress[player] = now

			local def = Buttons[pad.Name]
			local data = DataService.get(player)
			if not def or not data or data.Bought[pad.Name] then return end
			if def.Pass then return end -- pass buttons prompt a purchase instead (PurchaseService)
			if not prerequisitesMet(data.Bought, def) or data.Cash < def.Cost then return end

			data.Cash -= def.Cost
			data.Bought[pad.Name] = true
			DataService.changed(player, "Cash", "Bought")
			buildModel(plot, pad.Name, def)
			IncomeService.recalculate(player)
			ButtonService.refresh(player)
		end)
	end
end

return ButtonService
```

On join, after data loads and a plot is claimed, rebuild: for every id in `Bought`, call `buildModel` without the tween, then `refresh`. Mark anchors in Studio as invisible, non-colliding parts named after button ids, so Scenic can move them without touching code.

**11.7 Income on the server, drops on the client.** Physical drop parts for 8 players with 10 droppers each mean hundreds of physics parts per second. Instead:
- The server computes `income_per_second` from `Bought` (or from placed machines and a precomputed path value) whenever it changes, and adds it to the collector every second in one loop for all plots.
- Each client spawns cosmetic drop parts only for plots within 150 studs, anchored and tweened along the conveyor path, with no network ownership or physics.
- Factory sandboxes that need real drop paths compute the path value when the layout changes (walk the conveyor graph from each source to a furnace), not per drop.

```lua
-- ServerScriptService/Services/IncomeService.lua
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Buttons = require(ReplicatedStorage.Shared.Config.Buttons)
local DataService = require(script.Parent.DataService)
local MultiplierService = require(script.Parent.MultiplierService) -- rebirth, passes, boosts

local IncomeService = {}
local rate: { [Player]: number } = {}

function IncomeService.recalculate(player: Player)
	local data = DataService.get(player)
	if not data then return end
	local base, mult = 0, 1
	for id in data.Bought do
		local def = Buttons[id]
		if def then
			base += def.Income or 0
			mult *= def.Multiplier or 1
		end
	end
	rate[player] = base * mult * MultiplierService.global(player)
	player:SetAttribute("IncomePerSecond", rate[player]) -- the HUD reads this for "+N/s"
end

function IncomeService.get(player: Player): number
	return rate[player] or 0
end

function IncomeService.start(CollectorService)
	task.spawn(function()
		while true do
			task.wait(1)
			for _, player in Players:GetPlayers() do
				local r = rate[player]
				if r and r > 0 then
					CollectorService.add(player, r)
				end
			end
		end
	end)
	Players.PlayerRemoving:Connect(function(p) rate[p] = nil end)
end

return IncomeService
```

**11.8 Free placement validation (management and creative).**

```lua
-- ServerScriptService/Services/PlacementService.lua (validation core)
local GRID = 2
local ROTATION_STEP = 90

local function snap(v: number): number
	return math.floor(v / GRID + 0.5) * GRID
end

local function validPlacement(plot: Model, itemSize: Vector3, localPos: Vector3, rotSteps: number): (boolean, CFrame?)
	local base = plot:FindFirstChild("Base") :: BasePart
	if not base then return false, nil end
	local pos = Vector3.new(snap(localPos.X), localPos.Y, snap(localPos.Z))
	local cf = base.CFrame * CFrame.new(pos) * CFrame.Angles(0, math.rad(rotSteps * ROTATION_STEP), 0)

	-- inside the plot's footprint
	local half = base.Size / 2
	if math.abs(pos.X) > half.X or math.abs(pos.Z) > half.Z then
		return false, nil
	end

	-- no overlap with other placed items (shrink slightly so touching faces are allowed)
	local params = OverlapParams.new()
	params.FilterType = Enum.RaycastFilterType.Include
	params.FilterDescendantsInstances = { plot.Built }
	local hits = workspace:GetPartBoundsInBox(cf, itemSize - Vector3.new(0.1, 0.1, 0.1), params)
	if #hits > 0 then
		return false, nil
	end
	return true, cf
end
```

The client shows a ghost (transparency 0.5, green or red `Highlight`) using the same snapping math from a shared module, but the server repeats every check. Save placements as plot-relative X, Y, Z and rotation steps, never as world CFrames.

**11.9 Customers (management).** Spawn NPC customers on the server from a pool (reuse models, don't create new ones each time), path them with `PathfindingService:CreatePath()` computed once per layout change and cached per station, and keep their count per plot capped (for example 12). Order bubbles and patience bars are `BillboardGui`s driven by attributes (`SetAttribute("Patience", 0.6)`), which replicate to clients. Simulate offscreen customers as numbers only.

**11.10 Purchases.** One `PurchaseService` with `ProcessReceipt` set once [26][27]. The prompt and ownership calls below are documented in the `MarketplaceService` reference [29]. Gold pass buttons call `MarketplaceService:PromptGamePassPurchase(player, passId)` from the server when touched; on `PromptGamePassPurchaseFinished` with `wasPurchased = true`, verify with `UserOwnsGamePassAsync`, mark the button bought and build it.

## 12. Twists that work

1. **Two-player tycoon.** One plot, two owners, shared income and separate button sides. Built for friends.
2. **Tycoon plus combat.** Bases with walls and turrets that other players can raid for a share of cash. Keep raids opt-in or limited to a shield timer; safety must stay free.
3. **Tycoon plus obby.** Parkour to reach the roof bonus or a secret button. Fills waiting time.
4. **Tycoon plus roleplay.** Players can work in each other's restaurants or shops as staff for tips.
5. **Creative-first tycoon.** Theme Park Tycoon 2's direction: the economy fuels building and showing off [1][3].
6. **Logistics tycoon.** Lumber Tycoon 2 and Retail Tycoon 2 show that moving goods physically (logs, stock) is content [8][15].
7. **Factory puzzle.** Miner's Haven's machines with trade-offs make layout the game [18][19].
8. **Theme tied to a trend.** Same systems, trending theme. Pulse checks the charts.
9. **Shared world tycoon.** Every plot faces a shared street; customers walk past all shops and choose the best one. Competition without combat.
10. **Seasonal transformations.** The base gets holiday decor automatically during events; event-exclusive items stay as trophies.

## 13. Failure modes

| Failure | Symptom | Cause | Fix |
|---|---|---|---|
| Dead middle | Drop-off around buttons 15 to 25 | Waits grow faster than reveals | Payback table; insert looks buttons and mini-goals |
| Same base everywhere | Low likes and visits | No customization | Decor, colors, layout freedom |
| Empty-plot confusion | Players leave in 30 s | No claim guidance; empty start | Auto-claim, free first button, ghost silhouettes |
| Lag | Mobile players drop | Physical drops, too many parts | Client-side cosmetic drops, part budget, streaming |
| Lost bases | Angry reviews, no returns | Save failures, world CFrames saved | Plot-relative saves, session locking, autosave |
| Infinite money | Leaderboard explodes | Upgrader loops, client trust | One application per upgrader per drop; server validation |
| Griefing | Reports, quits | Others can press your buttons or enter your base | Owner-only touches; build permissions |
| Paywalled path | Bad votes | Robux buttons on the main path | Pass buttons beside, not on, the path |
| Rebirth flat | Players stop after floor 3 | Rebirth gives only a number | New theme, kept decor, trophies |
| Macro rebirth | Unbelievable rebirth counts | No rate limit | Server limit and published rule [20] |
| Content drought | Day-14 cliff | No new items | Two-week item drops from the update kit |
| Build mode unusable on phone | Mobile players never build | Keyboard-only controls | Tap-to-place, big Rotate and Confirm buttons |

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Which sub-type is it (button, management, creative, factory, resource)? One only.
- [ ] Is a tycoon with this theme rising on the charts, and is our theme different from the top three?
- [ ] Can the icon show a growing base in one picture?
- [ ] Do we have a twist from section 12?
- [ ] Can we ship 3 floors (button) or 30 items and 3 customer types (management) in the first build?
- [ ] Does Balance's simulation show the first floor in 20 to 25 minutes without passes?
- [ ] Is the save system for bases ready (plot-relative, session-locked)?
- [ ] Does build mode work on a phone (if any free placement)?
- [ ] Is there content for four updates (8 weeks)?
- [ ] Is the theme ours (no copied brands, logos or characters)?

Fewer than 8 ticks: change the sub-type, the theme or the twist.

## 15. Checklist, common mistakes, references

### Checklist (Producer verifies in Studio)
- [ ] A new player owns a plot within 10 s.
- [ ] The first button is free and builds with a tween and sound.
- [ ] The second purchase costs about 15 s of income.
- [ ] Cash counter shows the rate ("+N/s").
- [ ] No more than 3 unbought buttons visible at once (button tycoon).
- [ ] Button prices readable from 30 studs; affordable buttons visually distinct.
- [ ] Only the owner can press a plot's buttons or collect its cash (tested with two clients).
- [ ] Balance's payback table exists in `sim/` and the first floor completes in 20 to 25 min.
- [ ] Income is computed on the server; drops are client-side cosmetics.
- [ ] Bases save plot-relative and reload correctly on a different plot.
- [ ] Data saves on leave, on `BindToClose`, and every 60 to 120 s.
- [ ] Placement validation (bounds, overlap, grid, item cap) runs on the server.
- [ ] Build mode works with touch: place, rotate, confirm, cancel, undo.
- [ ] Gold pass buttons sit beside the free path and prompt the purchase correctly.
- [ ] `ProcessReceipt` is set once and is idempotent.
- [ ] Cash packs scale to the next button price.
- [ ] Rebirth screen lists what stays and what resets; rebirth is rate-limited.
- [ ] Complete plot is under the part budget (2,500 button / 8,000 creative).
- [ ] Max players equals plot count.
- [ ] Customer NPCs are pooled and capped per plot (management).
- [ ] Like and visit features work.
- [ ] Analytics log button index reached, so the dead middle is visible.

### Common mistakes
1. Starting on an empty baseplate with no guidance.
2. Buttons that cost too much too early, so the first minute is waiting.
3. Ten buttons visible at once.
4. Physical drop parts for every dropper on every plot.
5. Saving world CFrames, so the base appears in the wrong place on a new plot.
6. Letting anyone press any plot's buttons.
7. Robux-only buttons on the main path.
8. Upgraders that can multiply the same drop repeatedly in a loop.
9. A rebirth that wipes decor and Robux purchases.
10. Build mode that needs a keyboard.
11. One giant update after two months of silence.
12. Collectors with no cap and no reason to visit, or a cap so low players must camp.
13. Copying a famous tycoon's theme, logo or models instead of its systems.
14. Not capping NPC customers, causing server lag.
15. Placing pass buttons where they block the free path.
16. No plot-visit or like system, so nobody sees what others built.
17. Ignoring macros until the leaderboard is full of them [20].
18. Offline income with no cap.

### References
[1] Top 5 Roblox Tycoon Games to Get Rich In (HackerNoon) — https://hackernoon.com/top-5-roblox-tycoon-games-to-get-rich-in-2d2634yp — Theme Park Tycoon 2 described as a Roblox-ified RollerCoaster Tycoon with rides, paths, shops and real-time building with friends.
[2] Best Tycoon Games (HackerNoon) — https://hackernoon.com/best-tycoon-games?source=rss — A roundup of tycoon games for comparing sub-types.
[3] Let Your Creativity Run Wild in Theme Park Tycoon 2 for Roblox on Xbox One (Xbox Wire) — https://news.xbox.com/en-us/?p=109000 — Theme Park Tycoon 2 promoted on console around creativity.
[4] Theme Park Tycoon 2 (RoWatcher) — https://rowatcher.com/games/31970568/theme-park-tycoon-2 — Tracker page for the game, credited to Den_S.
[5] Theme Park Tycoon 2 (Rotrends) — https://rotrends.com/game/31970568/Theme-Park-Tycoon-2 — Tracker page for the game, pointing players to its wiki.
[6] Lumber Tycoon 2 Wiki (Fandom) — https://lumber-tycoon-2.fandom.com/wiki/Lumber_Tycoon_2_Wiki — Items, trees and gifts in Defaultio's game.
[7] 5 things every new player needs to know about Roblox Lumber Tycoon 2 (Sportskeeda) — https://www.sportskeeda.com/roblox-news/things-every-new-player-needs-know-roblox-lumber-tycoon-2 — New-player knowledge gaps in a resource tycoon.
[8] Roblox Lumber Tycoon 2: How to Play from First Axe to First Sawmill (All Things How) — https://allthings.how/roblox-lumber-tycoon-2-how-to-play-from-first-axe-to-first-sawmill/ — The early progression path from axe to sawmill.
[9] Lumber Tycoon 2 stats (Bloxodes) — https://bloxodes.com/stats/games/lumber-tycoon-2-2471084 — About 1.3 billion total visits listed when searched (October 2026).
[10] Restaurant Tycoon 2 Information (DevForum) — https://devforum.roblox.com/t/restaurant-tycoon-2-information/356970 — Ultraw Games, Isle of Man; long update log including a March 2026 "Modern Home" update.
[11] Restaurant Tycoon 2 on Roblox Beginners Guide (Narcosis) — https://www.narcosis-the-game.com/?p=2002 — Core loop of cooking, serving, collecting payment and upgrading.
[12] All Restaurant Tycoon 2 codes (GGRecon) — https://www.ggrecon.com/guides/restaurant-tycoon-2-codes/ — Codes for cash and diamonds.
[13] All Restaurant Tycoon 2 codes in Roblox (Twinfinite) — https://twinfinite.net/guides/all-restaurant-tycoon-2-codes-in-roblox/ — Code coverage for a management tycoon.
[14] Roblox Restaurant Tycoon 2 codes for June 2023 (AFK Gaming) — https://afkgaming.com/gaming/roblox/roblox-restaurant-tycoon-2-codes-for-june-2023 — Earlier code coverage showing codes as a long-running practice.
[15] Retail Tycoon 2: A Beginner's Guide (Deltia's Gaming) — https://deltiasgaming.com/?p=249723 — Stock shelves with popular products, trips to distribution centres, customer needs.
[16] Roblox Retail Tycoon 2 Codes (Prima Games) — https://primagames.com/codes/roblox-retail-tycoon-2-codes — Coverage asking whether the game has codes at all.
[17] Theme Park Tycoon 2 codes (Alucare) — https://www.alucare.fr/it/wiki/roblox/roblox-code-theme-park-tycoon-2/ — Notes the game does not currently have a code system.
[18] Conveyor category (The Miner's Haven Wikia) — https://minershaven.fandom.com/wiki/Category:Conveyor — Conveyors move ore; normal speed 100%; Military-Grade 50% faster; The Hourglass; retired items.
[19] Reinforced Furnace (The Miner's Haven Wikia) — https://minershaven.fandom.com/wiki/Reinforced_Furnace — 5x furnace placed high, needing a ramp or ore cannon.
[20] Miner's Haven: Sandbox Tycoon (Roblox) — https://www.roblox.com/ar/games/258258996/Miners-Haven-Sandbox-Tycoon — Game page warning that macro rebirthing results in a ban.
[21] Miner's Haven Codes (Roblox Den) — https://robloxden.com/game-codes/miners-haven — Code coverage for a factory tycoon.
[22] Miner's Haven codes (Dexerto) — https://www.dexerto.com/roblox/miners-haven-codes-3306832/ — Code coverage for a factory tycoon.
[23] Bee Swarm Simulator Wiki — https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator — Honey buys bees, hive space and equipment: a base that grows slot by slot.
[24] Pet Simulator 99 Rebirths (Bloxodes) — https://bloxodes.com/wiki/pet-simulator-99/rebirths — Rebirth that unlocks features without wiping progress.
[25] Muscle Legends Rebirth Guide (Driffle) — https://driffle.com/blog/muscle-legends-rebirth-guide-costs-gains-losses/ — Rebirths unlocking named gyms.
[26] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt validation and acknowledgement.
[27] Developer products source (Roblox creator-docs on GitHub) — https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/monetization/developer-products.md — Return PurchaseGranted on success, NotProcessedYet to retry; set the callback once.
[28] Devproducts not working (DevForum) — https://devforum.roblox.com/t/devproducts-not-working/3185811 — Troubleshooting developer products that do not grant.
[29] MarketplaceService reference (Roblox Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — Purchase prompts, ownership checks and receipt handling API.
[30] The Math of Idle Games, Part I (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i — Exponential cost growth against production growth.
[31] Roblox Simulator Game Guide (creation.dev) — https://www.creation.dev/blog/roblox-simulator-game-guide — Rebirth design: show benefits before the reset, permanent rewards.
[32] The Math of Idle Games, Part III (Game Developer) — https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii — Prestige loops for long-term tycoon progression.
[33] Paid random items policy (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/paid-random-items — Odds disclosure for paid random crates and decor.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Simulator]] · [[Genre - Idle and Incremental]] · [[Genre - Roleplay and Life Sim]]
