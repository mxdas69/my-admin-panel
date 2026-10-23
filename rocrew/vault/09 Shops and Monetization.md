---
tags: [vault, monetization]
read_by: [lead, architect, merchant, balance, frame, builder, reviewer, liveops, producer, kid-tester]
---

# 09 Shops and Monetization

Monetization done well sells convenience, speed, status and fun extras to players who already enjoy the game. Done badly it drives players away, invites reports and loses Robux through bugs. The Robux side also has to be engineered exactly right: a lost or doubled developer product purchase is a real-money bug. Build the fun first ([[02 The Core Loop]]), balance around the offers ([[04 Progression and Economy]]), then add the shop.

## Game passes vs developer products
| | Game pass | Developer product |
|---|---|---|
| Bought | Once, owned forever | Any number of times |
| Use for | Permanent perks: VIP, 2x Coins, extra slots, a cosmetic set | Consumables: currency packs, boosts, revives, skips |
| Check | `UserOwnsGamePassAsync(userId, passId)` on join, plus `PromptGamePassPurchaseFinished` | `ProcessReceipt` callback, once per purchase |
| Prompt | `PromptGamePassPurchase(player, passId)` | `PromptProductPurchase(player, productId)` |
| Gotcha | Must apply both mid-session and on every join | Must be idempotent and saved before you acknowledge |
- Timed boosts ("2x for 30 minutes") are developer products. Game passes are permanent, so never describe a game pass as temporary. A starter pack works best as a game pass: grant its contents once and record `StarterPackGranted = true` in the save.
- Premium Payouts reward engagement from Roblox Premium subscribers, so a sticky game earns even from players who never buy anything. Never trade retention for a sale ([[10 Retention and Social]]).

## A sensible price ladder
This is an example ladder in Robux, a rule of thumb for Merchant and Balance to tune. The owner sets the real prices.
| Tier | Example price | Typical offer |
|---|---|---|
| Impulse | 25-49 | small currency pack, revive, 15-minute boost |
| Starter | 49-99 | starter pack: one-time, clearly the best value in the game |
| Core pass | 99-249 | 2x Coins, auto-collect, extra inventory, faster hatch |
| VIP | 249-499 | VIP pass: tag, VIP area, small daily bonus, cosmetic |
| Big pack | 499-1499+ | large currency bundles with the best value per Robux |
- Each step is roughly 1.5-2.5x the previous one. Bigger currency packs give visibly more per Robux ("+20% bonus"). Keep the launch shop small: around 3-6 passes and 3-5 currency packs.
- **Never hardcode displayed prices.** Read them with `MarketplaceService:GetProductInfo(id, Enum.InfoType.GamePass)` or `Enum.InfoType.Product` (pcall and cache), so the UI always matches Creator Hub.

## Core offers
- **Starter pack:** a bundle of currency, a cosmetic and a small permanent perk at a low price. Offer it after the player has felt the loop (for example after their first upgrade, [[01 The First Five Minutes]]), never on spawn.
- **VIP:** status first (tag, color, VIP-only cosmetic area), comfort second (small bonus, extra slot). VIP areas are nice-to-have, never where progression happens.
- **2x passes (Coins, XP, Luck):** balance with them in mind. Stack multipliers additively (2x pass + 2x event = 3x, not 4x) so payers don't skip all content in an hour.
- **Convenience** (auto-collect, bigger backpack, teleports) sells time, not victory. **Cosmetics** (trails, pets, skins, emotes) show status without breaking balance.

## Contextual offers vs pushy popups
- Offer at the moment of need: backpack full leads to "Bigger backpack?"; a lost run leads to "Revive?" with a free option beside it; walking past the VIP door shows a small perks card.
- **The native purchase prompt opens only after the player taps a buy button in your UI.** Never prompt on join, never chain prompts, never prompt during combat or a tutorial.
- Rule of thumb: at most one unsolicited offer card per 10-15 minutes. After a "No thanks", don't show that offer again this session.
- The close button is visible right away and the same size as buy. No fake timers, no fake "only 3 left", no guilt text ("No, I hate free stuff"). The shop is one HUD button away and easy to leave ([[05 UI and HUD]]).

## Config module with placeholder IDs
Agents can't create products or set Robux prices. The owner creates each pass and product in **Creator Hub > Creations > (experience) > Monetization > Passes / Developer Products** and pastes the IDs in. Merchant asks for this with `node studio/cli.mjs ask`, listing every item with its suggested price and config key. Until then the IDs stay `0` and code refuses to prompt.
```lua
-- In ReplicatedStorage/Shared/Config (the shared Config ModuleScript), the Monetization section. Data only.
-- TODO(owner): create each item on Creator Hub, set the price there, replace 0 with the real ID.
Config.Monetization = {
	GamePasses = { VIP = 0, DoubleCoins = 0, StarterPack = 0 },               -- suggested 299 / 149 / 79 R$
	Products = { CoinsSmall = 0, CoinsMedium = 0, CoinsLarge = 0, Revive = 0 }, -- suggested 25 / 99 / 399 / 15 R$
}
```
Client prompt, called only from a buy button's `Activated`:
```lua
local function buyPass(key: string)
	local id = Config.Monetization.GamePasses[key]
	if not id or id == 0 then
		warn(`[Shop] GamePasses.{key} is a placeholder; create it on Creator Hub and update Config.Monetization`)
		return
	end
	MarketplaceService:PromptGamePassPurchase(Players.LocalPlayer, id) -- products: PromptProductPurchase(player, id)
end
```

## Game pass ownership (server)
```lua
local MarketplaceService, Players = game:GetService("MarketplaceService"), game:GetService("Players")
local owned: {[Player]: {[number]: boolean}} = {}
local function ownsPass(player: Player, passId: number): boolean
	if passId == 0 then return false end
	local cache = owned[player] or {}
	owned[player] = cache
	if cache[passId] ~= nil then return cache[passId] end
	local ok, result = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, passId)
	if not ok then warn(`[Passes] check failed: {result}`); return false end -- don't cache failures
	cache[passId] = result
	return result
end
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, wasPurchased)
	if not wasPurchased then return end
	owned[player] = owned[player] or {}
	owned[player][passId] = true
	applyPassPerks(player, passId) -- grant right away, no rejoin needed
end)
Players.PlayerRemoving:Connect(function(player) owned[player] = nil end)
```
On join, once the save has loaded, call `applyPassPerks` for every pass that `ownsPass` confirms.

## ProcessReceipt (server, the only correct shape)
Rules: set it **once**, in **one** server module. It must be **idempotent**: the same `PurchaseId` never grants twice. Record the `PurchaseId` **in the same save document** as the grant, and return `PurchaseGranted` **only after that save succeeded**. Return `NotProcessedYet` in every other case, and Roblox will call it again later (for example on the player's next join). `PlayerData` is described in [[13 Building It Right]].
```lua
--!strict
-- ServerScriptService/Services/ReceiptService (ModuleScript, required once by the server entry Script)
local MarketplaceService, Players = game:GetService("MarketplaceService"), game:GetService("Players")
local ReplicatedStorage, ServerScriptService = game:GetService("ReplicatedStorage"), game:GetService("ServerScriptService")
local PlayerData = require(ServerScriptService.Services.PlayerData) -- Get(player) -> data?, SaveNow(player) -> boolean
local Config = require(ReplicatedStorage.Shared.Config)
local MAX_RECEIPTS = 100

-- Grants ONLY mutate the save table: no UI, no effects, no yielding.
local grantsByKey: {[string]: (data: any) -> ()} = {
	CoinsSmall = function(data) data.Coins += 100 end,
	CoinsMedium = function(data) data.Coins += 450 end,
	CoinsLarge = function(data) data.Coins += 2000 end,
	Revive = function(data) data.PendingRevive = true end,
}
local grants: {[number]: (data: any) -> ()} = {}
for key, id in Config.Monetization.Products do -- skip placeholder 0s so they can't collide
	if grantsByKey[key] == nil then warn(`[Receipts] no grant for product {key}`)
	elseif id ~= 0 then grants[id] = grantsByKey[key] end
end

local function prune(receipts: {[string]: number}) -- keep only the newest MAX_RECEIPTS ids
	local ids = {}
	for id in receipts do table.insert(ids, id) end
	table.sort(ids, function(a, b) return receipts[a] > receipts[b] end)
	for i = MAX_RECEIPTS + 1, #ids do receipts[ids[i]] = nil end
end

MarketplaceService.ProcessReceipt = function(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	local data = player and PlayerData.Get(player) -- nil if the player left or the save hasn't loaded
	local grant = grants[receipt.ProductId]
	if not player or not data then return Enum.ProductPurchaseDecision.NotProcessedYet end
	if not grant then
		warn(`[Receipts] unknown ProductId {receipt.ProductId}`)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	if data.Receipts[receipt.PurchaseId] == nil then -- not yet granted in this save
		local ok, err = pcall(grant, data)
		if not ok then
			warn(`[Receipts] grant failed {receipt.PurchaseId}: {err}`)
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
		data.Receipts[receipt.PurchaseId] = os.time()
		prune(data.Receipts)
	end
	-- Acknowledge only once grant + record are durably saved. If the save fails, the cached
	-- record stops a double grant on retry, and the retry saves again.
	if PlayerData.SaveNow(player) then
		return Enum.ProductPurchaseDecision.PurchaseGranted -- now fire effects or UI remotes
	end
	return Enum.ProductPurchaseDecision.NotProcessedYet
end
```
- Never grant in `PromptProductPurchaseFinished`. It is a UI signal, not proof of payment.
- Purchases made in Studio playtests are test purchases with no Robux charged, but they do run `ProcessReceipt`. Test the whole path, including leaving mid-purchase.

## Paid random items and odds
- Paid random items (bought with Robux, or with a currency that can be bought with Robux) must show the odds of every outcome **before** purchase. Generate the displayed odds from the same table the server rolls with ([[03 Rarity and RNG]]).
- Check `PolicyService:GetPolicyInfoForPlayerAsync(player)`. If `ArePaidRandomItemsRestricted` is true, or the call fails, hide paid random purchases for that player and offer a direct-purchase or earnable path. Respect `IsPaidItemTradingAllowed` for trading paid items.

## Fairness
- Sell time, convenience, cosmetics and status. Avoid hard pay-to-win: anything that affects power must be earnable by free players in reasonable play time. In PvP, paid items are cosmetic or sidegrades only.
- Free players are the population that makes servers fun for payers. Never make them feel second-class.
- Never direct players to pay outside Roblox, and never promise Robux.
- Many players are children. Be plain about what a purchase does, and never use urgency or guilt.

## Checklist
- [ ] Every pass and product ID lives in `Config.Monetization`; placeholder `0`s refuse to prompt and warn in Output.
- [ ] Displayed prices come from `GetProductInfo`, not from code.
- [ ] Pass perks apply both on join (`UserOwnsGamePassAsync`, pcall) and mid-session (`PromptGamePassPurchaseFinished`).
- [ ] `ProcessReceipt` is assigned exactly once, records `PurchaseId` in the player save, and returns `PurchaseGranted` only after a successful save.
- [ ] Every product key has a grant handler; an unknown `ProductId` returns `NotProcessedYet` and warns.
- [ ] A Studio test purchase of each product grants exactly once, and the grant survives a rejoin.
- [ ] Paid random items show full odds before purchase and are hidden when `ArePaidRandomItemsRestricted` is true.
- [ ] No purchase prompt opens without a tap on a buy button; no offer appears on join.
- [ ] Close buttons are visible right away; there are no fake timers or fake scarcity.
- [ ] Balance confirmed free players can reach all power content in reasonable time.

## Common mistakes
- Granting a developer product and returning `PurchaseGranted` before saving: the player loses the purchase if the server dies.
- Not recording `PurchaseId`, so a retried receipt grants twice.
- Setting `ProcessReceipt` in two scripts. Only one callback exists, and the last assignment wins.
- Granting in `PromptProductPurchaseFinished`, or trusting the client to say "I bought it".
- Caching a failed `UserOwnsGamePassAsync` as "not owned" for the whole session.
- Hardcoded prices in UI that drift from Creator Hub.
- A wall of popups on join, which is the fastest way to lose a new player ([[01 The First Five Minutes]]).

## Related
[[00 Start Here]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
