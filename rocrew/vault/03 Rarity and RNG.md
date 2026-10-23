---
tags: [vault, rng]
read_by: [lead, architect, builder, frame, balance, merchant, reviewer, playtest, liveops, kid-tester]
---

# 03 Rarity and RNG

Random rewards (eggs, crates, rolls, drops, spins) power many popular Roblox genres because chasing a rare result is exciting. They are also where games go wrong most often: odds that don't match what the UI says, rolls decided on the client and exploited, and paid random items that break Roblox's disclosure rules. Build every roll so it is server-authoritative, data-driven, audited by simulation and honestly displayed.

## Rarity tiers

Tiers are a visual language as much as a math table. Use the same tier colors on item cards, reveal effects, chat announcements and the index. Common Roblox conventions: **Common** gray/white, **Uncommon** green, **Rare** blue, **Epic** purple, **Legendary** gold/orange, **Mythic** red/pink, **Secret** black/rainbow.

- Escalate the reveal with the tier: quick pop for Common, glow and sound for Rare, shake and particles for Epic, a big burst plus a server message for Legendary and above.
- A typical basic-egg starting point (for Balance to tune, not a standard): 60 / 25 / 10 / 4 / 0.9 / 0.1 across Common to Mythic.
- Secret tiers can have a unique animation, but they are still listed in the odds when the roll is paid.

## Weighted roll tables

Store weights, not percentages. Weights need not sum to 100: an entry's chance is `weight / totalWeight`. Tables live in `ReplicatedStorage.Shared.Config` so the UI displays the same numbers the server uses.

```lua
-- ReplicatedStorage/Shared/Config/Eggs.lua
return table.freeze({
	BasicEgg = {
		Cost = { Currency = "Coins", Amount = 250 }, Pity = { Rolls = 150, MinTier = "Legendary" },
		Entries = {
			{ Id = "Dog",    Tier = "Common",    Weight = 60 },
			{ Id = "Cat",    Tier = "Uncommon",  Weight = 25 },
			{ Id = "Fox",    Tier = "Rare",      Weight = 10 },
			{ Id = "Owl",    Tier = "Epic",      Weight = 4 },
			{ Id = "Dragon", Tier = "Legendary", Weight = 1, Lucky = true },
		},
	},
})
```

```lua
-- ReplicatedStorage/Shared/Roll.lua: pure math, shared with the odds UI. Only the server calls pick() for real rewards.
local Roll = {}
local rng = Random.new() -- one generator per server, created once; never reseed per roll
export type Entry = { Id: string, Tier: string, Weight: number, Lucky: boolean? }

function Roll.weights(entries: {Entry}, luck: number): ({number}, number)
	local out, total = table.create(#entries), 0
	for i, e in entries do
		out[i] = if e.Lucky then e.Weight * luck else e.Weight
		total += out[i]
	end
	return out, total
end

function Roll.pick(entries: {Entry}, luck: number?): Entry
	local weights, total = Roll.weights(entries, luck or 1)
	local r, acc = rng:NextNumber() * total, 0
	for i, w in weights do
		acc += w
		if r < acc then return entries[i] end
	end
	return entries[#entries] -- floating-point safety
end

return Roll
```

## Luck multipliers

- **Weight luck (recommended):** multiply the weight of `Lucky` entries (rare tiers) by the luck value and renormalize. Commons are never boosted, so their share shrinks on its own.
- **"1 in N" luck (aura games):** items checked rarest first with `rng:NextNumber() < luck / N`. Earlier checks consume probability, so true chances differ from the nominal "1 in N". Simulate the real distribution before displaying it.
- Stack luck sources additively (`1 + 0.25 + 0.5`) unless Balance deliberately designs multiplication, and cap total luck in Config.
- Luck comes from server-side data only: game passes checked with `MarketplaceService:UserOwnsGamePassAsync`, boosts with server timestamps.

## Pity systems

- **Hard pity:** after `Pity.Rolls` rolls without `MinTier` or better, the next roll draws only from that tier or better. **Soft pity:** past a threshold, lucky weights grow each roll until the tier hits.
- Save one pity counter per egg with the player's data so rejoining doesn't reset it, and show it ("Legendary guaranteed in 37 rolls"): it turns bad streaks into anticipation.
- Pity changes the real odds. For paid rolls, disclose the base odds and the guarantee rule.

```lua
-- Server: hard pity. `data` is the player's server-side save table.
local TIER_RANK = { Common = 1, Uncommon = 2, Rare = 3, Epic = 4, Legendary = 5, Mythic = 6, Secret = 7 }
local function rollWithPity(data, eggId: string, egg): Roll.Entry
	data.Pity[eggId] = (data.Pity[eggId] or 0) + 1
	local minRank, pool = TIER_RANK[egg.Pity.MinTier], egg.Entries
	if data.Pity[eggId] >= egg.Pity.Rolls then -- guaranteed: only MinTier or better
		pool = {}
		for _, e in egg.Entries do
			if TIER_RANK[e.Tier] >= minRank then table.insert(pool, e) end
		end
	end
	local entry = Roll.pick(pool, data.Luck)
	if TIER_RANK[entry.Tier] >= minRank then data.Pity[eggId] = 0 end
	return entry
end
```

## Server-side roll flow

The client sends only *what* it wants (`Remotes.OpenEgg:InvokeServer("BasicEgg", 3)`), never results, prices or luck: exploiters can read and run any LocalScript and fire any remote with any arguments. The server validates, deducts, rolls, saves, logs analytics and returns the ids; the client plays the reveal for exactly those results. Never roll in a LocalScript, not even "for preview".

```lua
local Eggs = require(ReplicatedStorage.Shared.Config.Eggs)
local ALLOWED_COUNTS = { [1] = true, [3] = true }
Remotes.OpenEgg.OnServerInvoke = function(player: Player, eggId: unknown, count: unknown)
	if typeof(eggId) ~= "string" or typeof(count) ~= "number" then return nil end
	local egg = Eggs[eggId]
	if not egg or not ALLOWED_COUNTS[count] then return nil end -- also rejects NaN and fractions
	local data = PlayerData.get(player) -- your server-side data module
	-- distance to the egg, cooldown, inventory space, currency check and deduction go here
	local results = table.create(count)
	for i = 1, count do results[i] = rollWithPity(data, eggId, egg).Id end
	return results
end
```

## Auditing odds with a simulation

Run after every change to a roll table, luck or pity rule, and simulate the pity path too (average and maximum rolls to the pity tier; the maximum must never exceed `Pity.Rolls`). Balance stores the output in the game's `sim/` folder; Reviewer checks it.

```lua
-- Command bar or a test Script: observed vs expected frequencies
local RS = game:GetService("ReplicatedStorage")
local Roll = require(RS.Shared.Roll)
local egg = require(RS.Shared.Config.Eggs).BasicEgg
local N, LUCK = 1_000_000, 1
local weights, total = Roll.weights(egg.Entries, LUCK)
local counts = {}
for i = 1, N do
	local e = Roll.pick(egg.Entries, LUCK)
	counts[e.Id] = (counts[e.Id] or 0) + 1
	if i % 100_000 == 0 then task.wait() end -- avoid script timeout
end
for i, e in egg.Entries do
	local p, observed = weights[i] / total, (counts[e.Id] or 0) / N
	local sd = math.sqrt(p * (1 - p) / N)
	local flag = if math.abs(observed - p) > 4 * sd then "  <-- CHECK" else ""
	print(string.format("%-8s expected %8.4f%%  observed %8.4f%%%s", e.Id, p * 100, observed * 100, flag))
end
```

## Disclosing and showing odds

- Roblox requires experiences that offer paid random items to disclose the odds of each possible item before purchase. Treat any random reward obtainable with Robux, directly or through a currency bought with Robux, as a paid random item. Policies change: Merchant checks the current Roblox rules before shipping ([[09 Shops and Monetization]]).
- Some players may not be offered paid random items at all. Check on the server and hide or disable the Robux option for them:

```lua
local PolicyService = game:GetService("PolicyService")
local function canOfferPaidRandom(player: Player): boolean
	local ok, info = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
	return ok and not info.ArePaidRandomItemsRestricted -- fail closed on error
end
```

- Show odds where the purchase happens: a BillboardGui over the egg and in the confirm panel. Each row: icon, name, tier color, chance.
- Show effective odds with the player's current luck, plus a "Luck x2 active" label.
- Small chances read better as "1 in N" (a common cutoff is below 1%): `string.format("1 in %d", math.round(1 / p))`; above it, `string.format("%.1f%%", p * 100)`. Check that displayed percentages still sum to about 100% after rounding.

## Checklist

- [ ] Every roll table is in `ReplicatedStorage.Shared.Config`, stored as weights
- [ ] `Roll.pick` is only called from server scripts; no LocalScript decides a result
- [ ] One `Random.new()` per server, not reseeded per roll
- [ ] The roll remote validates types, egg id, count, distance, cooldown and currency
- [ ] Simulation shows every entry within tolerance after the latest change
- [ ] Pity counters are saved per egg; max rolls to pity never exceed the limit
- [ ] Odds UI uses `Roll.weights` with the player's current luck
- [ ] Every paid random item shows all odds before purchase, secret tiers included
- [ ] `ArePaidRandomItemsRestricted` is checked on the server before any paid roll
- [ ] Tier colors match on cards, reveals, index and announcements

## Common mistakes

- `math.random` in a LocalScript deciding drops, or the client sending the tier it "rolled".
- Displayed odds computed separately from the real table, so they drift apart.
- Luck that multiplies every entry, commons included, so it changes nothing.
- Secret items in a paid roll with no disclosed odds.
- Long, unskippable reveal animations once players open many eggs.

## Related

[[00 Start Here]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[09 Shops and Monetization]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
