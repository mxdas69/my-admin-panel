---
tags: [vault, security, anti-cheat, exploits, remotes, datastore, purchases, backdoors]
for: [builder, reviewer, merchant]
also: [architect, playtest, librarian, frame]
---

# 17 Security and Anti-Cheat

An exploiter runs their own code inside their Roblox client. From there they can fire any RemoteEvent with any arguments at any rate, read every script and value that replicates to them, and move their own character however they like [1][2]. Roblox's Hyperion protects the client process, but it is anti-tamper, not a replacement for server checks [42]. If the server believes the client, someone will give themselves a billion coins, every pet, 500 walk speed, instant kills, or a crashed server, usually within days of a game getting players.

This chapter is the spec for keeping money, items, saves and servers safe. It extends the engineering rules in [[13 Building It Right]] and the purchase rules in [[09 Shops and Monetization]]. Builder implements it, Merchant applies it to purchases, Reviewer audits it with the procedure at the end.

**Reading cost:** agents read `## Rules` and `## Checklist` by default and pull other sections by heading.

## Rules

1. **Treat every client as an exploiter.** Anything that reaches the client can be read and changed, and every remote can be fired with any values at any rate [1]. Design each feature by asking "what if this player lies?"
2. **The client sends intent, the server decides the outcome.** Remotes carry ids and choices ("buy itemId", "swing"), never prices, amounts, damage, rewards, positions or results. The server looks those up in `Config` and its own state.
3. **Every remote is in the contract table and fully validated.** Check argument count, type, finite number, integer, range, string length (≤ 64 for ids, ≤ 200 for text), table size (≤ 50) and that referenced Instances are what you expect. Invalid input is dropped silently before any work.
4. **Every remote has a per-player rate limit.** Token bucket per player per remote (default burst 10, refill 5/s); excess calls are dropped, not kicked, and logged when far over. Gameplay cooldowns are tracked separately on the server.
5. **Interactions check distance and line of sight.** The server confirms the player is alive, within the interaction range + 4 studs, and has a clear raycast to the target. A ProximityPrompt or Touched event is still re-checked [2][7].
6. **Hits are validated on the server.** Weapon equipped, cooldown elapsed, target alive, range ≤ weapon range + latency tolerance (max 8 studs), clear line of sight from a rewound position. Damage comes from server config only.
7. **Movement checks tolerate lag and never kick on one flag.** Allow max speed × 1.5 + 4 studs per check; act only after 3 flags in 10 s, by moving the player back to the last valid position [3]. Server teleports grant a short grace window. Competitive games consider Server Authority [8][9].
8. **Never trust `InvokeClient`.** A client can error, disconnect or never answer, which stalls the server thread forever [5]. Use RemoteEvents for server→client messages.
9. **Saves are session-locked and server-only.** Use ProfileStore (or UpdateAsync with a session lock), retry with backoff, save on leave and in `BindToClose`, and never accept save data from a client [11][13].
10. **Trades are atomic on the server.** Both inventories are locked during a trade, ownership is rechecked at execution, items move in one step, both profiles save straight away, and a trade is cancelled if either player leaves.
11. **Purchases are idempotent and granted on the server.** Exactly one receipt handler; record each `PurchaseId` in the player's profile; grant, save, then return granted; return not-processed if the player is gone or the save failed [17][18].
12. **Every currency source passes an earn budget.** Per player, max earnings per rolling 60 s = 3 × the fastest legitimate rate in `economy.md`. Over budget: clamp, log, flag.
13. **All player-written text shown to others is filtered on the server.** `TextService:FilterStringAsync` then the right `GetNonChatString...` call; on failure show nothing [20].
14. **Admin powers are checked on the server by UserId on every call.** Allowlist lives in ServerScriptService; every command is logged; no command runs code.
15. **Secrets never replicate.** API keys and webhooks live in the Secrets store (`HttpService:GetSecret`), never in ReplicatedStorage, scripts, attributes or DataStores [23].
16. **No unread script from a free model ships.** Librarian strips or reads every script; scan for `require(<number>)`, `getfenv`, `setfenv`, `loadstring`, escaped bytes and obfuscation; `LoadStringEnabled` stays off [26][28].
17. **Detect, log and escalate in steps.** Honeypot remotes and checks log first; responses go neutralize → kick → timed ban with `Players:BanAsync`; permanent bans only with the owner's yes [3][27].
18. **Build in Studio, not at runtime.** Worlds are real Instances in Workspace and UI is real ScreenGuis in StarterGui; scripts add behavior and clone templates. See "Where things live".

## The threat model

### What an exploiter can do
- Fire any RemoteEvent or RemoteFunction, with any arguments, at any frequency [1].
- Read every LocalScript and every ModuleScript in ReplicatedStorage, ReplicatedFirst, StarterPlayer, StarterGui and StarterPack, plus every replicated Instance, attribute and value.
- Change their own character: speed, jump, CFrame (teleport), fly, noclip. Character physics is owned by their client, and Roblox can't verify physics on client-owned parts [7].
- Fake `Touched` on parts their client owns [7].
- Trigger exposed instances such as ProximityPrompt from the client [2].
- Clone tools or GUIs locally (these don't replicate to the server) [36].
- Delete their own LocalScripts, including any client-side anti-cheat.
- Spam a remote to make the server do expensive work, or send oversized arguments [39].

### What an exploiter cannot do
Read or change ServerScriptService and ServerStorage, edit other players' data except through your remotes, or fire server→client remotes at others; client traffic on a server→client-only remote is a reliable detection [3].

### Roblox's own defenses
- **Hyperion** (from the Byfron acquisition) makes injecting code into the Windows client harder. It does not validate your game logic [42].
- **Character deletion rejection:** `Workspace.RejectCharacterDeletions` stops a client deleting parts of its character model to get "god mode"; keep it at Default (currently Enabled) [43][44].
- **Server Authority** (full release 2026): `Workspace.AuthorityMode = Server` makes the server the source of truth for simulation, with client prediction and rollback, and rejects invalid client movement such as flings, wall clips and speed hacks [8][9][10]. It needs `StreamingEnabled` and `UseFixedSimulation`, game logic written to run on both sides through `RunService:BindToSimulation()`, and deferred signals; backpacks and tools are supported [8][9]. Architect decides per game; for PvP combat, shooters and racing it's the default to evaluate. It does not validate remotes: Rules 2-4 still apply.

## Server authority by design

### Intent, not outcome
| Bad (client claims) | Good (client asks, server decides) |
|---|---|
| `AddCoins:FireServer(500)` | `CollectCoin:FireServer(coinId)` → server checks coin exists, distance, value from Config |
| `BuyItem:FireServer("Sword", 0)` (price) | `BuyItem:FireServer("Sword")` → price from Config |
| `DealDamage:FireServer(target, 9999)` | `Swing:FireServer(targetId, clientTime)` → server checks and uses weapon damage |
| `SaveData:FireServer(dataTable)` | No such remote; data lives in server memory |

### Where state lives
Player data is a server table; the client sees a read-only copy (attributes, `leaderstats`, server→client remotes), and client edits to it don't replicate. Cooldowns and timers use server time (`workspace:GetServerTimeNow()`), never client-sent times.

## Remote design

### Contract and placement
- Architect lists every remote in the `plan.md` contract table ([[13 Building It Right]]); Reviewer rejects any remote that isn't listed.
- Remotes are real instances in `ReplicatedStorage.Remotes`, one per intent. No generic "SetValue(path, value)" or "RunCommand" remotes.
- Know the engine limits: RemoteEvents and UnreliableRemoteEvents allow about 500 requests per second per client, shared across remotes of the same type [4]. UnreliableRemoteEvent payloads over 900-1000 bytes are dropped (docs disagree; plan for 900) [6][40].
- Argument quirks: tables with non-string keys or mixed array/dictionary parts don't survive the trip intact; Instances arrive as `nil` if the server can't see them; functions and metatables don't cross [4]. Accept only flat arrays or string-keyed tables, and validate after receipt.

### Guard module
```lua
--!strict
-- ServerScriptService/Services/Guard (ModuleScript)
local Guard = {}

function Guard.int(v: unknown, min: number, max: number): number?
	if type(v) ~= "number" or v ~= v or v % 1 ~= 0 or v < min or v > max then
		return nil -- v ~= v catches NaN; range catches ±math.huge
	end
	return v
end

function Guard.str(v: unknown, maxLen: number): string?
	if type(v) ~= "string" or #v == 0 or #v > maxLen or not utf8.len(v) then
		return nil
	end
	return v
end

function Guard.oneOf(v: unknown, allowed: { [string]: any }): string?
	if type(v) == "string" and #v <= 64 and allowed[v] ~= nil then
		return v
	end
	return nil
end

function Guard.tagged(v: unknown, tag: string): Instance?
	if typeof(v) == "Instance" and (v :: Instance):HasTag(tag) and (v :: Instance):IsDescendantOf(workspace) then
		return v :: Instance
	end
	return nil
end

return Guard
```

### Net wrapper: validation, rate limit and errors in one place
```lua
--!strict
-- ServerScriptService/Services/Net (ModuleScript)
local Players = game:GetService("Players")
local Remotes = game:GetService("ReplicatedStorage"):WaitForChild("Remotes")
local RateLimit = require(script.Parent.RateLimit)
local Flags = require(script.Parent.Flags)

local Net = {}

-- handler gets the raw args and must validate them with Guard before acting
function Net.on(name: string, burst: number, perSecond: number, handler: (Player, ...unknown) -> ())
	local remote = Remotes:WaitForChild(name) :: RemoteEvent
	local bucket = RateLimit.new(burst, perSecond)
	remote.OnServerEvent:Connect(function(player: Player, ...: unknown)
		if select("#", ...) > 8 then
			Flags.add(player, "argcount", name)
			return
		end
		if not bucket:take(player) then
			if bucket:overBy(player) > burst * 5 then
				Flags.add(player, "spam", name)
			end
			return
		end
		local ok, err = pcall(handler, player, ...)
		if not ok then
			warn(`[Net] {name} from {player.UserId}: {err}`)
		end
	end)
end

Players.PlayerRemoving:Connect(RateLimit.forget)
return Net
```

Usage: `Net.on("BuyItem", 5, 1, function(player, rawId) local id = Guard.oneOf(rawId, Config.Items); if id then ShopService.buy(player, id) end end)`.

## Rate limits and cooldowns

### Token bucket
`RateLimit.new(burst, perSecond)` keeps `{ tokens, last, dropped }` per player. `take(player)` refills `tokens = min(burst, tokens + (os.clock() - last) * perSecond)`, then spends 1 or returns false and counts a drop; `overBy(player)` returns consecutive drops; `RateLimit.forget(player)` clears every bucket on `PlayerRemoving`.

### Defaults (studio standard)
| Remote kind | Burst | Refill /s |
|---|---|---|
| Buy, sell, equip, claim | 5 | 1 |
| Attack, swing, shoot | 12 | 10 (weapon cooldown enforced separately) |
| Interact, collect | 10 | 5 |
| Text submit (names, signs) | 2 | 0.2 |
| Trade actions | 6 | 2 |
| Settings, UI state | 10 | 2 |

- A **rate limit** stops abuse; a **cooldown** is gameplay (server stores `lastUsed[player][ability]` and rejects early use). You need both.
- Never kick for spam on its own; a well-written handler just ignores excess calls [38]. Log when a player is far over (`Flags`).
- Any handler that yields (DataStore, HTTP, `FilterStringAsync`) gets the strictest limit, and one in-flight request per player (a `busy[player]` flag).

## RemoteFunctions

- `OnServerInvoke` is fine for read-only queries ("what's in my inventory?") if validated, rate-limited and quick. Return only data that player may see.
- **Never `InvokeClient`.** The docs list the risks: a client error is re-thrown on the server, a disconnect errors the call, and a client that never returns leaves the server waiting forever [5][41]. Use a RemoteEvent the client answers with another RemoteEvent, plus a server-side timeout.
- Don't yield inside `OnServerInvoke` before validation; exploiters can pile up waiting threads.

## Interactions: distance and line of sight

```lua
--!strict
-- ServerScriptService/Services/Reach (ModuleScript)
local Reach = {}
function Reach.can(player: Player, target: BasePart, maxDist: number): boolean
	local char = player.Character
	local hum = char and char:FindFirstChildOfClass("Humanoid")
	local root = char and char:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not (hum and root) or hum.Health <= 0 then return false end
	local offset = target.Position - root.Position
	if offset.Magnitude > maxDist + 4 then return false end
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = { char :: Model }
	local hit = workspace:Raycast(root.Position, offset, params)
	return hit == nil or hit.Instance:IsDescendantOf(target.Parent :: Instance)
end
return Reach
```

- **ProximityPrompt:** `Triggered` arrives on the server, but prompts are a known attack surface [2]. In the handler, still run `Reach.can`, check state (already collected? owned plot?) and a cooldown.
- **Touched for rewards:** the client owns its character's physics and can fire Touched on parts it owns [7]. In a reward Touched handler, confirm the toucher is a living character, run `Reach.can` with a small range, and debounce per player. For high-value pickups, use a server spatial query (`workspace:GetPartBoundsInBox`) on a short loop instead.
- **Owned objects:** check `target:GetAttribute("OwnerUserId") == player.UserId` before acting on plots, pets or vehicles.

## Combat hit validation

### Flow
1. The client detects the hit (responsive) and fires `Hit:FireServer(targetId, weaponId, clientTime)`.
2. The server checks: weapon is equipped (`Character:FindFirstChildOfClass("Tool")` matches), cooldown elapsed, target exists and is alive, not a teammate, not the attacker.
3. **Rewind:** look up the target's position at `now - ping` from a position history, capped at 0.4 s [33][34].
4. **Range:** distance from attacker to rewound target ≤ weapon range + tolerance (base 4 studs + 10 studs per second of ping, max 8).
5. **Line of sight:** raycast from the attacker's head to the rewound target, ignoring characters; any wall hit rejects.
6. Damage = `Config.Weapons[weaponId].damage`; apply on the server.

**HitHistory** (server module): on Heartbeat, every 1/15 s, append `{ t = workspace:GetServerTimeNow(), pos = root.Position }` per player, drop samples older than 1 s, clear on `PlayerRemoving`; `HitHistory.at(player, t)` returns the newest sample at or before `t`.
Usage: `local rewound = HitHistory.at(target, workspace:GetServerTimeNow() - math.min(attacker:GetNetworkPing(), 0.4))`.

- **Melee:** alternatively run the hitbox on the server at swing time (`GetPartBoundsInBox` slightly larger than the client's) and ignore client claims.
- **Projectiles:** the server spawns or validates the projectile; impact time must match travel time within 20%.
- Test with Studio's simulated replication lag (Network settings, "Incoming Replication Lag") so tolerances are tuned against real ping [33].

## Movement anti-cheat

### What to check (server, 2 checks per second per player)
| Cheat | Check | Default threshold |
|---|---|---|
| Speed | Horizontal distance since last check | > maxSpeed × dt × 1.5 + 4 studs |
| Teleport | Any jump in position | > 40 studs in one check [35] |
| Fly | Time airborne and rising, `FloorMaterial == Air` | > 3 s with no jump pad, falling or vehicle |
| Noclip | Raycast from last to current position hits a wall | Any solid, non-`CanCollide = false` hit |

```lua
--!strict
-- ServerScriptService/Services/MovementGuard (ModuleScript)
local Players = game:GetService("Players")
local Flags = require(script.Parent.Flags)
local CHECK = 0.5
type S = { last: Vector3, valid: CFrame, strikes: { number } }
local state: { [Player]: S } = {}
local M = {}

function M.grant(player: Player, seconds: number) -- call before server teleports, pads, knockback
	player:SetAttribute("MoveGrace", workspace:GetServerTimeNow() + seconds)
end

local function check(p: Player)
	local char = p.Character
	local hum = char and char:FindFirstChildOfClass("Humanoid")
	local root = char and char:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not (hum and root) or hum.Health <= 0 or hum.SeatPart then return end
	local s = state[p]
	if not s then state[p] = { last = root.Position, valid = root.CFrame, strikes = {} } return end
	local now = workspace:GetServerTimeNow()
	local flat = (root.Position - s.last) * Vector3.new(1, 0, 1)
	s.last = root.Position
	if now < ((p:GetAttribute("MoveGrace") :: number?) or 0) or flat.Magnitude <= hum.WalkSpeed * CHECK * 1.5 + 4 then
		s.valid = root.CFrame
		return
	end
	table.insert(s.strikes, now)
	while s.strikes[1] and now - s.strikes[1] > 10 do table.remove(s.strikes, 1) end
	if #s.strikes >= 3 then
		root.AssemblyLinearVelocity = Vector3.zero
		char:PivotTo(s.valid) -- rubber-band, don't kick
		Flags.add(p, "speed", math.floor(flat.Magnitude))
		table.clear(s.strikes)
	end
end

task.spawn(function()
	while true do
		for _, p in Players:GetPlayers() do task.spawn(check, p) end
		task.wait(CHECK)
	end
end)
Players.PlayerRemoving:Connect(function(p) state[p] = nil end)
return M
```

- Use the WalkSpeed the **server** set; client WalkSpeed edits don't replicate, only the movement does.
- Server teleports call `MovementGuard.grant(player, 1)` first; then the guard never flags them [35].
- Expect false flags from lag, falling and knockback, which is why the response is a quiet rubber-band [3][35].
- **Network ownership:** the server owns anchored parts and keeps any unanchored part by default until the engine hands it to a nearby client [7]. For important physics (bosses, balls, doors, prize carts) call `part:SetNetworkOwner(nil)` on the server. A vehicle can be owned by its driver, but validate where it goes.

## DataStore safety

### Use ProfileStore
ProfileStore wraps DataStores with auto-saving and session locking, so two servers can't load and edit the same player at once [11]. Without a lock, a player can change data, rejoin fast, and have the old save load over the new one, which duplicates items [12].

```lua
--!strict
-- ServerScriptService/Services/PlayerData (ModuleScript)
local Players = game:GetService("Players")
local ProfileStore = require(game:GetService("ServerStorage").Packages.ProfileStore)

local TEMPLATE = { Coins = 0, Items = {} :: { [string]: { id: string, uid: string } }, Purchases = {} :: { [string]: number } }
local Store = ProfileStore.New("PlayerData_v1", TEMPLATE)
local profiles: { [Player]: any } = {}

local PlayerData = {}

local function onJoin(player: Player)
	local profile = Store:StartSessionAsync(`{player.UserId}`, {
		Cancel = function() return player.Parent ~= Players end,
	})
	if not profile then
		player:Kick("Your data couldn't load. Please rejoin.")
		return
	end
	profile:AddUserId(player.UserId)
	profile:Reconcile()
	profile.OnSessionEnd:Connect(function()
		profiles[player] = nil
		player:Kick("Your data was opened in another server. Please rejoin.")
	end)
	if player.Parent == Players then
		profiles[player] = profile
	else
		profile:EndSession()
	end
end

function PlayerData.get(player: Player): any?
	return profiles[player]
end

Players.PlayerAdded:Connect(onJoin)
for _, p in Players:GetPlayers() do task.spawn(onJoin, p) end
Players.PlayerRemoving:Connect(function(p)
	local profile = profiles[p]
	if profile then profile:EndSession() end
end)
return PlayerData
```

### If you write your own
- Load once, keep data in server memory, write at session end, periodically as backup, and during purchases [13].
- Keep a player's data in one table so related values change together [13].
- Use `UpdateAsync`, not `SetAsync`, so you see the current value and can refuse stale writes (session id + version fields). Returning `nil` from the transform cancels the write.
- Retry failed calls 3 times with 1, 2, 4 s backoff; match on error **codes**, not messages [14].
- Budgets are per minute and shared with Open Cloud; `UpdateAsync` uses read and write budget [14]. Check `DataStoreService:GetRequestBudgetForRequestType` before non-urgent writes; use the current enum names (`StandardRead`, `StandardWrite`), not the legacy ones [15].
- Reads are cached for 4 s per server [16]; don't use `GetAsync` to check another server's write.
- `game:BindToClose` saves every loaded player (ProfileStore does this itself).

### Never trust client save data
No remote takes a data blob, settings excepted (validate those field by field, booleans and small enums only).

### Duplication exploits and the trade protocol
Dupes come from old data overwriting new (rejoin races), items that exist in two places during a trade, and actions that save one side but not the other [12].

1. `TradeRequest(targetUserId)` → server checks both players are in the server, not in another trade, within the rate limit.
2. Each side adds items by **uid**; the server checks ownership on each add. Cap 8 items per side.
3. Any change resets both "ready" flags. After both press Ready, a 3 s server countdown runs; any change cancels it.
4. At execution, the server rechecks every uid is still owned and both players are present, then moves all items between the two profiles **in the same frame** with no yields.
5. Both profiles save straight away (`profile:Save()`), and the trade is logged with a trade id, both UserIds and the uids.
6. `PlayerRemoving` or character death during a trade cancels it before anything moves.

Every item has a uid (`HttpService:GenerateGUID(false)`). On load, scan for duplicate uids across the inventory; if found, keep one and flag the player.

## Purchases

### One receipt handler
- Exactly one `MarketplaceService.ProcessReceipt` in the whole place (Merchant's `ReceiptService`). Roblox calls it again on later joins until it's acknowledged [18].
- Newer API: `MarketplaceService:BindReceiptHandler` registers handlers per `ReceiptType` returning `Enum.ReceiptDecision.Processed` or `NotProcessedYet` [17][19]. Pick one approach per place; ours is ProcessReceipt until Merchant has verified the new API in a live test.
- The product → reward map is in server Config. The client sends nothing about prices.

```lua
--!strict
-- ServerScriptService/Services/ReceiptService (ModuleScript, Merchant)
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local PlayerData = require(script.Parent.PlayerData)
local Products = require(script.Parent.Parent.Config.Products) -- [productId] = grant function

MarketplaceService.ProcessReceipt = function(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	local profile = player and PlayerData.get(player)
	local grant = Products[receipt.ProductId]
	if not (profile and grant) then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local key = tostring(receipt.PurchaseId)
	if profile.Data.Purchases[key] then
		return Enum.ProductPurchaseDecision.PurchaseGranted -- already granted
	end
	local ok = pcall(grant, player, profile)
	if not ok then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	profile.Data.Purchases[key] = os.time()
	profile:Save()
	return Enum.ProductPurchaseDecision.PurchaseGranted
end
```
Trim `Purchases` to the newest 100 keys on load. Never grant from `PromptProductPurchaseFinished`, which only reports that the prompt closed ([[09 Shops and Monetization]]).

### Game passes and paid random items
- Check passes with `MarketplaceService:UserOwnsGamePassAsync` on the server at join (pcall, cache), and on `PromptGamePassPurchaseFinished` re-check on the server before granting.
- Before offering a paid random item (eggs, crates bought with Robux or Robux-bought currency), check `PolicyService:GetPolicyInfoForPlayerAsync(player).ArePaidRandomItemsRestricted` on the server; restricted players need a non-random alternative [48][49].

## Tools and backpack exploits

- A tool cloned on the client never reaches the server. Before honoring any tool remote, confirm the tool is in the player's Character or Backpack on the server [36].
- Read the tool's stats from server Config by its `ToolId` attribute, never from values inside the tool the client could edit.
- Cooldowns live on the server, keyed by player and tool.
- `CanBeDropped = false` on anything valuable; drop and pick-up are server events with ownership checks.
- Rapid equip/unequip has been used to lag or crash servers; rate-limit equips and keep `Equipped` handlers cheap [37].
- Client-side backpack watchers are deleted by exploiters; only the server check counts [36].

## Server-side sanity budgets

`Economy.addCoins(player, profile, amount, source)`: reject `amount <= 0` or NaN; sum this player's grants in the last 60 s (`os.clock()` list); grant `min(amount, Config.Economy.MaxCoinsPerMinute - total)`; if clamped, `Flags.add(player, "earn_cap", source)`; return what was granted.
- Every currency source calls `Economy.addCoins`; nothing writes `Coins` directly. Robux purchases are logged but exempt from the cap.
- Same pattern for XP, items per minute and rolls per minute.
- Heuristic checks like this back up validation and rate limits; they don't replace them [3].

## Honeypots, logging and consequences

### Honeypots
A honeypot is a remote that looks useful to an exploiter (`GiveCash`, `AdminEvent`) but our code never fires it, so any traffic is a high-confidence signal [3][32]. Put 1-2 in `ReplicatedStorage.Remotes` with plausible names, list them in the contract table as honeypots, and route them to `Flags.add(player, "honeypot", name)`. Also flag any client traffic on server→client-only remotes [3].

### Flags module
- `Flags.add(player, kind, detail)` keeps a per-server count, `warn`s, and fires an `AnalyticsService` custom event or a batched log so Liveops can see rates. Batch DataStore writes; never one write per flag.
- Score: honeypot 10, earn cap 3, speed 2, spam 1. Score ≥ 10 in a session → kick with a neutral message. Two kicks in 24 h → timed ban.

### Escalation ladder
1. Silently log (always) [3].
2. Neutralize: drop the request, clamp the reward, rubber-band [3].
3. Kick with a short neutral message.
4. Timed ban with `Players:BanAsync`: `UserIds`, `Duration` in seconds, `DisplayReason` (≤ 400 chars, filtered), `PrivateReason`, `ExcludeAltAccounts` (alts are banned too by default), `ApplyToUniverse` (default true) [27].
5. Permanent ban: only after the owner says yes (`cli.mjs ask`), because false positives happen [3].

## Text filtering and chat

- Filter on the server: `TextService:FilterStringAsync(text, fromUserId)` returns a `TextFilterResult`; call `GetNonChatStringForBroadcastAsync()` for text everyone sees (signs, plot names) or `GetNonChatStringForUserAsync(viewerId)` for one viewer [20][21].
- Filter when the player submits, not per keystroke [20].
- Stored text (pet names in DataStores) is filtered again when shown, since filter rules change [20].
- Messages through in-experience text chat are filtered by Roblox; anything else you display is your job [20].
- Rate-limit public text inputs [22]; cap lengths (names 20, signs 100 characters).

Wrap both calls in `pcall`; if either fails, return `nil` and show nothing.

## Admin commands

- The allowlist (`{ [UserId] = "owner" | "mod" }`) is a ModuleScript in ServerScriptService. Never use names (they change) or anything the client sends.
- Group-rank admin: `player:GetRankInGroup(groupId)` on the server, cached at join; it can be stale, so re-check sensitive commands with fresh data [45].
- Check permission inside every command handler, not only when showing the panel; a hidden button can be made visible by an exploiter [45].
- Log every command (who, what, target, time). No command evaluates code; there is no `loadstring` remote.
- Third-party admin systems are free models: they go through the backdoor procedure below.

## HttpService and secrets

- Create secrets in Creator Dashboard → experience → Secrets; up to 500 per experience, 1,024 characters each, with a domain restriction (use a specific domain, not a wildcard) [23].
- `HttpService:GetSecret("Name")` returns a `Secret` that can't be printed; use `AddPrefix("Bearer ")` to build headers [24][25].
- Secrets work only on live servers and Team Test; local Studio tests need local test secrets in Game Settings [23].
- HTTP calls happen only from server code; never put a webhook URL or key in ReplicatedStorage, StarterGui, an attribute or a DataStore.
- Webhook alerts (e.g. Discord) carry UserIds and flag kinds only, rate-limited to 1 per minute per server.

## Free models and backdoors

### What a backdoor looks like
- `require(1234567)`: loads a remote module that can do anything later [28][31].
- `getfenv` / `setfenv`, `loadstring`, often hidden: `getfenv()["\108\111\97\100\115\116\114\105\110\103"]` spells "loadstring" [28].
- Long escaped strings, `string.char` chains, "obfuscated by" headers, giant one-line scripts, code pushed far right with whitespace.
- Scripts hidden deep in a model, named like parts ("Weld", "Handle", "Spread"), or `InsertService:LoadAsset` calls.
- Uploads from brand-new accounts are higher risk [28]. Roblox's Creator Store moderation now checks `require(assetId)`, `loadstring`, `InsertService:LoadAsset()` and linked sources, which lowers but doesn't remove the risk [30].
- Not every `require` is bad (large admin systems load their own modules), so a hit means "read it", not "proof" [29].

### Librarian procedure
1. Insert the model into `ServerStorage.Quarantine` (scripts don't run there).
2. Run the scan below; read every hit.
3. Delete every script the asset doesn't need (most props need none). Rewrite any needed behavior ourselves.
4. Re-run the scan on the cleaned model, then move it to `ReplicatedStorage.Assets` or `ServerStorage.Assets` and register it with `cli.mjs asset add`.
5. Keep `ServerScriptService.LoadStringEnabled` off; Roblox warns that misusing loadstring leads to remote code execution [26]. Only install plugins from trusted creators; plugins can insert scripts too.

```lua
-- Command bar: scan a model (or the whole game) for backdoor signs
local root = game:GetService("ServerStorage"):FindFirstChild("Quarantine") or game
local patterns = { "require%s*%(%s*%d", "getfenv", "setfenv", "loadstring", "\\%d%d%d", "string%.char", "LoadAsset", "obfusc" }
for _, s in root:GetDescendants() do
	if s:IsA("LuaSourceContainer") then
		local ok, src = pcall(function() return (s :: any).Source end)
		if ok and src then
			for _, p in patterns do
				if string.find(src, p) then print(s:GetFullName(), "->", p) end
			end
		end
	end
end
```

## Workspace and ServerStorage placement

- **ServerScriptService / ServerStorage** (never replicate): server logic, admin list, loot tables, odds, product grants, server-only templates, Quarantine.
- **ReplicatedStorage.Shared.Config**: only values the client may know (prices, display names, stats shown in UI).
- **ReplicatedStorage.Remotes / Assets**: remote instances; models the client clones.
- **Workspace**: the world. Every replicated part and attribute is readable.
- Hidden answers don't go in Workspace: the correct door, the treasure's location, the next round's map, another player's code. Keep them in ServerStorage and move them in when they're meant to be seen. StreamingEnabled is not a security boundary.
- Secret odds, weights and drop tables stay on the server. Published odds for paid items are shown from a copy in Config.

## Where things live

The studio rule: **worlds and builds are real Instances placed in Workspace in Studio, and UI is built as real ScreenGuis in StarterGui (editable by hand), not generated by scripts at runtime.** A ScreenGui in StarterGui is copied into each player's PlayerGui when they join [46][47]. Scripts only add behavior, and clone templates (stored in ReplicatedStorage or StarterGui) for dynamic lists such as shop cards and inventory slots.

Why it matters here:
- Reviewer can inspect the whole place in Explorer; less runtime-building code means less code to exploit and fewer places to hide a backdoor.
- A cloned template is just a picture; what goes into it (item, price, owned state) comes from the server.
- Remotes, honeypots and InputContexts are real instances too, so the contract table can be checked against the tree.

## Reviewer procedure: audit every remote

### Steps
1. **List remotes** (command bar): `for _, r in game:GetDescendants() do if r:IsA("RemoteEvent") or r:IsA("RemoteFunction") or r:IsA("UnreliableRemoteEvent") then print(r:GetFullName(), r.ClassName) end end`. Anything outside `ReplicatedStorage.Remotes` is a finding.
2. **Diff with the contract** in `plan.md`. Unlisted remote = blocker.
3. **Find every handler**: search scripts for `OnServerEvent`, `OnServerInvoke`, `InvokeClient`, `ProcessReceipt`, `Touched`, `Triggered`. Any `InvokeClient` = blocker.
4. **Per handler, check:** goes through `Net.on` (rate limit); every argument passes a `Guard`; no client-sent price, amount, damage, reward or position is used as truth; distance/LOS for world targets; ownership for owned objects; cooldown on server; no yield before validation; currency through `Economy.addCoins`.
5. **Forge test** in Studio Play with the fuzzer below (temporary LocalScript in `StarterPlayerScripts.ReviewOnly`, deleted after the review). Watch Output, the player's currency and server memory.
6. **Saves:** buy, leave within 2 s, rejoin: the item is there exactly once. Start a trade and leave mid-countdown: nothing moves.
7. **Purchases:** buy a product in Studio test mode; fire a second receipt with the same PurchaseId (or rejoin): granted once. Only one `ProcessReceipt` in the place.
8. **Text, admin, secrets:** a sign or name shows filtered text; a non-admin firing the admin remote gets nothing; search for `http`, `key`, `token`, `webhook` in replicated scripts finds no secrets.
9. **Free models:** run the backdoor scan on the whole game; zero unexplained hits.
10. **Report** in `games/<slug>/reports/review-YYYY-MM-DD.md`: one row per remote `remote | guards | rate limit | server-decided | forge result | verdict`, then findings by severity (blocker, must-fix, nice).

### Fuzzer (Studio only)
A temporary LocalScript (`StarterPlayerScripts.ReviewOnly.Fuzz`, deleted after the review) loops over `ReplicatedStorage.Remotes` and fires each RemoteEvent once per bad value, alone and three times over: `nil`, `0/0`, `math.huge`, `-math.huge`, `-1`, `1e12`, `1.5`, `""`, `string.rep("x", 100000)`, `{}`, `{1, nil, 3}`, `{[workspace] = true}`, `workspace`, the Players service and `Vector3.new(0/0, 0, 0)`. Then it fires each remote 200 times in a row with `"x"`, waiting 0.2 s between remotes.
Pass: no server errors beyond `[Net]` warnings, no currency or item changes, server stays responsive, and spam shows up as `spam` flags rather than work done.

## Checklist

- [ ] Every remote is in the `plan.md` contract table and lives in `ReplicatedStorage.Remotes`; honeypots are marked as such.
- [ ] No remote takes a price, amount, damage, reward, position-as-truth or save blob from the client.
- [ ] Every `OnServerEvent` goes through the rate-limited wrapper and validates every argument (type, NaN/inf, range, length, table size, Instance tag).
- [ ] Fuzzer pass recorded: no server errors, no currency or item change, spam dropped.
- [ ] No `InvokeClient` anywhere; `OnServerInvoke` handlers are read-only and rate-limited.
- [ ] Interactions and pickups check alive, distance (+4 studs) and line of sight on the server.
- [ ] Combat hits checked for equipped weapon, cooldown, range with ≤ 8 stud tolerance, rewound LOS; damage from server config.
- [ ] Movement guard rubber-bands after 3 flags in 10 s; server teleports grant grace; no kick on a single flag.
- [ ] Important unanchored physics parts are server-owned (`SetNetworkOwner(nil)`).
- [ ] Player data uses ProfileStore or a session-locked `UpdateAsync`; saves on leave and in `BindToClose`.
- [ ] Leave-and-rejoin within 2 s after a purchase or trade: no dupe, no loss.
- [ ] Trades lock both sides, recheck ownership, move in one frame, save both, and cancel on leave.
- [ ] Every item has a uid; duplicate uids are detected on load.
- [ ] Exactly one receipt handler; PurchaseId recorded before returning granted; repeat receipt grants once.
- [ ] Paid random items check `ArePaidRandomItemsRestricted`.
- [ ] Every currency source goes through the earn budget (cap = 3 × fastest legit rate).
- [ ] All player text shown to others is filtered on the server; failures show nothing.
- [ ] Admin commands check a server-side UserId allowlist in every handler and are logged.
- [ ] No secrets, keys or webhooks in any replicated script, attribute or DataStore; secrets come from `GetSecret`.
- [ ] Backdoor scan of the whole game has zero unexplained hits; `LoadStringEnabled` is off.
- [ ] Hidden answers, odds and loot tables are not in Workspace or ReplicatedStorage.
- [ ] Bans use `BanAsync` with a timed duration; no permanent ban without the owner's yes.
- [ ] World and UI are real instances built in Studio; scripts only add behavior and clone templates.
- [ ] Review report filed in `reports/` with a row per remote.

## Sources

[1] Security and cheat mitigation tactics (Creator Docs) — https://create.roblox.com/docs/scripting/security/security-tactics
[2] Securing the client-server boundary (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/security/client-server-boundary
[3] Server-side detection (Creator Docs) — https://create.roblox.com/docs/scripting/security/server-side-detection.md
[4] Remote events and callbacks (Creator Docs) — https://create.roblox.com/docs/en-us/scripting/events/remote
[5] RemoteFunction reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/RemoteFunction.md
[6] UnreliableRemoteEvent reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/UnreliableRemoteEvent
[7] Network ownership (Creator Docs) — https://create.roblox.com/docs/physics/network-ownership
[8] Server authority model (Creator Docs) — https://create.roblox.com/docs/projects/server-authority
[9] [Full Release] Ship Fair And Competitive Games with Server Authority (DevForum) — https://devforum.roblox.com/t/full-release-ship-fair-and-competitive-games-with-server-authority/4727993
[10] Creating responsive, cheat-resistant games with server authority (Roblox Newsroom) — https://about.roblox.com/newsroom/2026/07/creating-responsive-cheat-resistant-games-roblox-server-authority
[11] ProfileStore - Save your player data easy (DevForum) — https://devforum.roblox.com/t/profilestore/3190543
[12] Datastore Session Locking (DevForum) — https://devforum.roblox.com/t/datastore-session-locking/740302
[13] Implement player data and purchasing systems (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/player-data-purchasing
[14] Data stores error codes and limits (Creator Docs) — https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
[15] DataStoreRequestType enum (Creator Docs) — https://create.roblox.com/docs/reference/engine/enums/DataStoreRequestType.md
[16] GlobalDataStore reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/GlobalDataStore
[17] MarketplaceService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/MarketplaceService.md
[18] MarketplaceService.ProcessReceipt (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService/ProcessReceipt
[19] ReceiptDecision enum (Creator Docs) — https://create.roblox.com/docs/reference/engine/enums/ReceiptDecision.md
[20] Text filtering (Creator Docs) — https://create.roblox.com/docs/en-us/ui/text-filtering
[21] TextFilterResult reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/TextFilterResult.md
[22] Rate-limited text inputs (Creator Docs) — https://create.roblox.com/docs/en-us/chat/examples/rate-limit-public-text-inputs
[23] Secrets stores (Creator Docs) — https://create.roblox.com/docs/en-us/cloud-services/secrets
[24] Secret datatype (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/datatypes/Secret.md
[25] HTTP service (Creator Docs) — https://create.roblox.com/docs/en-us/cloud-services/http-service.md
[26] ServerScriptService reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/ServerScriptService.md
[27] Players:BanAsync (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/Players/BanAsync
[28] Removing Backdoors 101 (DevForum) — https://devforum.roblox.com/t/removing-backdoors-101/545574
[29] I need all of the best ways to detect viruses and backdoors (DevForum) — https://devforum.roblox.com/t/2620987
[30] The word "require" made any model not distributed on Creator Store (DevForum) — https://devforum.roblox.com/t/solved-the-word-require-made-any-model-not-distributed-on-creator-store/4051504
[31] What exactly is a "backdoor"? (DevForum) — https://devforum.roblox.com/t/what-exactly-is-a-backdoor/345398
[32] What is a honeypot? (DevForum) — https://devforum.roblox.com/t/what-is-a-honeypot/3969179
[33] Server Sided hit detection with lag compensation (DevForum) — https://devforum.roblox.com/t/server-sided-hit-detection-with-lag-compensation/3322386
[34] Lag Compensation (DevForum) — https://devforum.roblox.com/t/lag-compensation/290669
[35] A solid Anti-Teleport System (DevForum) — https://devforum.roblox.com/t/a-solid-anti-teleport-system/1802929
[36] Help Patching An Exploit (Tools) (DevForum) — https://devforum.roblox.com/t/help-patching-an-exploit-tools/1246587
[37] Anti Tool Crash (DevForum) — https://devforum.roblox.com/t/anti-tool-crash/1800187
[38] Rate limiter module for Remotes (DevForum) — https://devforum.roblox.com/t/rate-limiter-module-for-remotes/616268
[39] Chat exploit lagging the server (DevForum) — https://devforum.roblox.com/t/chat-exploit-lagging-the-server/682549
[40] UnreliableEvent payload warning (DevForum) — https://devforum.roblox.com/t/unreliableevent-payload-warning/3981857
[41] Trust issues with :InvokeClient() (DevForum) — https://devforum.roblox.com/t/trust-issues-with-invokeclient/1172808
[42] Welcoming Byfron to Roblox (DevForum) — https://devforum.roblox.com/t/welcoming-byfron-to-roblox/2018233
[43] RejectCharacterDeletions enum (Roblox API reference) — https://robloxapi.github.io/ref/enum/RejectCharacterDeletions.html
[44] Anti - FE Kill Exploit (DevForum) — https://devforum.roblox.com/t/anti-fe-kill-exploit/1856936
[45] Group rank-only button (DevForum) — https://devforum.roblox.com/t/group-button-rank-only/542817
[46] On-screen UI containers (Creator Docs) — https://create.roblox.com/docs/en-us/ui/on-screen-containers
[47] StarterGui reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/StarterGui.md
[48] PolicyService reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md
[49] Paid random items (Creator Docs) — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items.md

Related: [[00 Start Here]] · [[13 Building It Right]] · [[09 Shops and Monetization]] · [[14 Roblox Studio Workflow]] · [[07 Characters, VFX and Assets]] · [[16 Console and Controllers]] · [[Genre - Action and Combat]] · [[Genre - Simulator]]
