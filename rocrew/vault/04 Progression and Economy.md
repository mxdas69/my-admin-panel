---
tags: [vault, economy]
read_by: [lead, pulse, architect, builder, balance, merchant, reviewer, playtest, producer, liveops]
---

# 04 Progression and Economy

Progression is how fast the game hands out new goals; the economy is the plumbing that controls that speed. Too fast and players run out of things to want; too slow and they hit a wall. Either way they leave. Every number lives in one Config module, gets tuned with a simulation before anyone playtests, and is watched with analytics after launch. Balance owns the numbers and writes them up in `games/<slug>/economy.md`.

## Currencies

| Type | Example | Earned by | Spent on |
|---|---|---|---|
| Soft | Coins, Cash | The core action, constantly | Upgrades, zones, eggs |
| Premium | Gems | Slowly in play (quests, milestones) and via Developer Products | Boosts, premium eggs, skips, cosmetics |
| Prestige | Rebirth tokens | Rebirthing | Permanent upgrades that survive resets |
| Event | Candy, Snowflakes | Limited-time content | Event shop; expires or converts when the event ends ([[12 Live Ops and Launch]]) |

- Each currency has exactly one job a player can explain; show at most two or three on the HUD. Premium currency sold for Robux is a Developer Product granted in `MarketplaceService.ProcessReceipt` ([[09 Shops and Monetization]]). Core progress must never require it early on.
- Balances live on the server in the player's data; `leaderstats` values and attributes are display mirrors only.

## Sources and sinks

A source adds currency, a sink removes it. When sources outgrow sinks, currency piles up, prices stop mattering and the economy inflates.

- **Sources:** core action, selling, quests and achievements, daily rewards, offline earnings, codes, Developer Products.
- **Sinks:** upgrades, zone gates, eggs/rolls, consumable boosts, crafting/fusing, cosmetics, and rebirth (the reset is the biggest sink).
- List every source and sink in `economy.md` with its expected share of income. When you add a source, name the sink that absorbs it.
- Log both, so Liveops sees the real flow in the Creator Hub economy analytics:

```lua
-- (player, flowType, currency, amount, balanceAfter, transactionType, itemSku); use FlowType.Source for income
AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, "Coins", price, data.Coins,
	Enum.AnalyticsEconomyTransactionType.Shop.Name, "Upgrade_Shovel")
```

## Cost curves

The standard incremental curve is `cost(level) = base * growth ^ level`. Rules of thumb for `growth`, as starting points to tune:

- about **1.07-1.15** for upgrades bought many times (dozens to hundreds of levels);
- about **1.15-1.5** for upgrades with roughly 10-30 levels;
- bigger jumps (about **2-10x**) between zones, tool tiers and rebirths, where each step is a milestone.

Working formulas:
- Time to afford = `cost / incomePerSecond`. When costs grow faster than income, the gap between purchases stretches. That is the intended slowdown; control its rate.
- Total cost from level 0 to n = `base * (growth^n - 1) / (growth - 1)`. Use it for "Buy Max" and check it matches repeated single buys.
- Income usually grows linearly or with a smaller factor than cost. Round displayed prices to 2-3 significant digits.

## Time-to-X targets

Write targets before tuning. Common starting points, to be confirmed by the simulation and playtests; later goals can sit further apart, but the next goal is always visible and reachable within the current session.

| Milestone | Starting target |
|---|---|
| First upgrade | 1-2 minutes ([[01 The First Five Minutes]]) |
| Early upgrades | one every ~30-90 seconds |
| First new zone | ~5-10 minutes |
| First rebirth | late in the first session or early in the second |
| At any moment | a goal reachable within ~10 minutes of play |

## Rebirth / prestige

- Resets soft currency, upgrades and zones. Keeps pets, cosmetics, premium currency, game pass perks and the rebirth count.
- Rewards a permanent multiplier. Additive per rebirth (`1 + 0.5 * rebirths`) is easier to control than compounding.
- Rebirth cost grows each time (a common starting point is x2-x3 per rebirth); unlock rebirth only after the player has seen most early content.
- The next run to the same point must feel clearly faster. Show the preview: "Rebirth: earn x2.5 coins forever".

## Inflation control

- Pair every multiplier source with a cap or diminishing returns, e.g. `mult = 1 + k * math.log(1 + x)`.
- Temporary boosts expire by server timestamps, never client timers; event currencies expire or convert at a fixed rate.
- Scale sinks with progression (later zones, eggs and upgrades cost proportionally more). The client never reports income, prices or balances.
- Watch number size. Luau numbers are 64-bit floats: integers are exact only up to 2^53 (about 9e15). Past that, small additions are silently lost (adding 1 to 1e17 changes nothing). If a simulator heads beyond ~1e15, scale rewards in multiplicative steps, store exponents, or use a big-number module.

## Offline earnings

```lua
-- Server, right after data loads. data.LastSeen is written on leave and at every autosave.
local function grantOffline(data): number
	local now = os.time()
	local away = math.clamp(now - (data.LastSeen or now), 0, Config.Offline.MaxSeconds)
	data.LastSeen = now
	if away < Config.Offline.MinSeconds then return 0 end
	local earned = math.floor(away * data.IncomePerSecond * Config.Offline.Efficiency) -- server-computed rate
	data.Coins += earned
	return earned -- show "While you were away: +X", but never during the first-join tutorial
end
```

Rules of thumb: cap the time (8-12 hours is a common starting point), pay less than active play (often 25-50% efficiency), and show the popup only when the amount is meaningful.

## Config ModuleScript

```lua
-- ReplicatedStorage/Shared/Config.lua: every tunable number lives here
local Config = {
	StartingCoins = 0, BaseIncomePerSecond = 1, SwingCooldown = 0.25, BaseGain = 1,
	Upgrades = {
		Shovel   = { BaseCost = 15,  Growth = 1.12, IncomePerLevel = 1, MaxLevel = 100 },
		Backpack = { BaseCost = 100, Growth = 1.15, IncomePerLevel = 6, MaxLevel = 50 },
	},
	Zones = {
		{ Name = "Meadow", Cost = 0,      Multiplier = 1 },
		{ Name = "Desert", Cost = 2_500,  Multiplier = 2 },
		{ Name = "Snow",   Cost = 60_000, Multiplier = 4 },
	},
	Rebirth = { BaseCost = 250_000, Growth = 3, MultiplierPerRebirth = 0.5 },
	Offline = { MinSeconds = 300, MaxSeconds = 8 * 3600, Efficiency = 0.3 },
}

function Config.UpgradeCost(id: string, level: number): number
	local u = Config.Upgrades[id]
	return math.floor(u.BaseCost * u.Growth ^ level)
end

return table.freeze(Config)
```

It is shared so the UI shows the same prices the server charges, but the server always recomputes a price before charging. No tunable number is hard-coded anywhere else; a balance change is a Config diff that Balance writes and Reviewer checks.

## Balancing with a quick simulation

Run before every playtest that follows an economy change and save the output in `games/<slug>/sim/`. A perfect greedy bot is faster than a real player, so treat its times as a lower bound. Extend it with zone gates and rebirth for the full curve, and compare the printed times with the time-to-X table.

```lua
-- Command bar or a test Script: one simulated hour of a greedy player
local Config = require(game:GetService("ReplicatedStorage").Shared.Config)
local coins, levels, buys = Config.StartingCoins, {}, 0
for id in Config.Upgrades do levels[id] = 0 end

local function rate(): number
	local r = Config.BaseIncomePerSecond
	for id, u in Config.Upgrades do r += u.IncomePerLevel * levels[id] end
	return r
end

for t = 1, 3600 do
	coins += rate()
	local bestId, bestPrice, bestValue = nil, 0, 0
	for id, u in Config.Upgrades do -- buy the affordable upgrade with the best income per coin
		local price = Config.UpgradeCost(id, levels[id])
		if levels[id] < u.MaxLevel and price <= coins and u.IncomePerLevel / price > bestValue then
			bestId, bestPrice, bestValue = id, price, u.IncomePerLevel / price
		end
	end
	if bestId then
		coins -= bestPrice
		levels[bestId] += 1
		buys += 1
		if buys <= 5 or buys % 10 == 0 then
			print(string.format("%5ds  %s -> L%d  income %.0f/s", t, bestId, levels[bestId], rate()))
		end
	end
end
```

## Checklist

- [ ] Every tunable number is in `ReplicatedStorage.Shared.Config`; no magic numbers in other scripts
- [ ] The server recomputes every price; client-side values are display only
- [ ] Each currency has one stated job, and the HUD shows at most three
- [ ] Every source in `economy.md` has a named sink
- [ ] The simulation output meets the time-to-X targets and is saved in `sim/`
- [ ] Buy Max uses the geometric sum and matches repeated single buys
- [ ] The rebirth preview shows the new multiplier, and the sim shows a faster second run
- [ ] Offline earnings use server `os.time()`, are capped, and skip the first join
- [ ] `LogEconomyEvent` fires for every source and sink
- [ ] The largest expected balance stays below ~1e15, or a big-number plan exists

## Common mistakes

- Prices and rewards scattered as literals across scripts, so tuning misses some.
- Costs growing much faster than income, so the game hits a wall in the first hour.
- Compounding multipliers (rebirth x pets x boosts x passes) with no cap, so numbers explode.
- Rebirth that wipes things players paid for or care about.
- Tuning by feel only, with no simulation, then discovering the wall in playtest.

## Related

[[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[05 UI and HUD]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
