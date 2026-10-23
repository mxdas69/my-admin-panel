---
tags: [vault, engineering]
read_by: [lead, architect, builder, frame, merchant, scenic, librarian, reviewer, playtest, liveops, producer]
---

# 13 Building It Right

This is the engineering bible. Every Roblox client can be modified by an exploiter, every DataStore call can fail, and every connection you forget leaks memory on a phone. Code that "works in Play mode" can still lose saves, double-grant purchases or hand out infinite coins. These rules keep the game safe, stable and easy for 15 agents to change without breaking each other's work. Architect defines the contracts; Builder (and Merchant, for purchases) implements them; Reviewer enforces them.

## Server authority
- **The server owns every decision that matters:** currency, inventory, damage, rewards, prices, cooldowns, odds, quest progress, purchases. The client only sends *intent* ("I want to buy item X") and draws what the server says.
- Never trust anything from a client: arguments, timings, claimed positions, "I hit this enemy", "I finished the quest".
- Clients can read everything that replicates, including ModuleScripts and LocalScripts in ReplicatedStorage and StarterPlayer. Keep server logic and secrets in ServerScriptService and ServerStorage, which never replicate.
- Character movement is client-owned physics. Validate distance and speed on the server before acting on where a player says they are. Give important physics parts to the server with `BasePart:SetNetworkOwner(nil)`.

## Folder layout
```
ReplicatedFirst/            loading screen LocalScript only
ReplicatedStorage/
  Shared/                   ModuleScripts for both sides: Config (all tunables + IDs), Types, Util
  Remotes/                  one RemoteEvent / RemoteFunction / UnreliableRemoteEvent per contract row
  Assets/                   models and effects the client clones (Librarian)
ServerScriptService/
  Main (Script)             the single server entry point
  Services/                 ModuleScripts: PlayerData, RateLimit, ShopService, ReceiptService, ...
ServerStorage/
  Assets/  Templates/       server-only models: enemies, drops, tools cloned at runtime
StarterPlayer/
  StarterPlayerScripts/
    Main (LocalScript)      the single client entry point
    Controllers/            ModuleScripts: InputController, HudController, ShopController, ...
  StarterCharacterScripts/  per-character LocalScripts (rarely needed)
StarterGui/                 ScreenGuis (ResetOnSpawn = false for HUDs); logic lives in controllers (Frame)
Workspace/
  Map/                      world geometry only, no loose Scripts (Scenic)
```

## ModuleScript architecture
- One entry Script per side requires the modules in a known order and calls `Init()` on each (set up state, nothing that depends on other modules), then `Start()` (connect events, start loops). There are no other Scripts.
- A module returns one table, has no side effects at require time, and doesn't require modules that require it back (Roblox errors on recursive requires).
- Tunables (prices, rates, cooldowns, IDs) live in `ReplicatedStorage.Shared.Config`, never as magic numbers in logic ([[04 Progression and Economy]]).
- Use CollectionService tags (`Instance:AddTag`, `CollectionService:GetTagged`, `GetInstanceAddedSignal`) to give behavior to many instances, and attributes (`SetAttribute`/`GetAttribute`) for per-instance data like `OwnerUserId`.
- Create instances with properties first and **`Parent` last**, so replication and events see a finished object.
```lua
local drop = ServerStorage.Templates.Coin:Clone()
drop:PivotTo(CFrame.new(position))
drop:SetAttribute("Value", value)
drop:AddTag("Collectible")
drop.Parent = workspace.Drops -- last
```

## Remotes contract table
Architect writes each game's table in `plan.md` **before** code exists. Reviewer rejects any remote that isn't in it.

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| BuyItem | RemoteEvent | C→S | itemId: string, qty: number | item exists, qty integer 1-99, can afford | 5, 1 |
| EquipPet | RemoteEvent | C→S | petUid: string | uid owned by player | 10, 2 |
| Interact | RemoteEvent | C→S | target: Instance | tagged, owner matches, ≤ 12 studs | 4, 2 |
| ClaimDaily | RemoteEvent | C→S | (none) | server day index | 2, 0.2 |
| GetShopState | RemoteFunction | C→S | (none) | returns a snapshot, never yields long | 2, 0.5 |
| StateChanged | RemoteEvent | S→C | snapshot table | n/a | server batches |
| HitFx | UnreliableRemoteEvent | S→C | position: Vector3 | cosmetic only | n/a |
- Prefer RemoteEvents. Never use `RemoteFunction:InvokeClient`: a client can hang or error it forever.
- Use `UnreliableRemoteEvent` only for frequent cosmetic updates where a lost packet doesn't matter.
- Remote arguments lose metatables and functions, and tables with mixed key types arrive mangled. Send plain data.

## Validate every OnServerEvent argument
The first parameter is always the real `Player`, filled in by Roblox. Everything after it is untrusted input. Check in this order: rate limit, types, ranges (NaN, infinity, integers), existence, ownership, distance, cooldown, cost.
```lua
--!strict
BuyItem.OnServerEvent:Connect(function(player: Player, itemId: unknown, qty: unknown)
	if not RateLimit.allow(player, "BuyItem", 5, 1) then return end
	if typeof(itemId) ~= "string" or #itemId > 40 then return end
	if typeof(qty) ~= "number" or qty ~= qty or qty % 1 ~= 0 or qty < 1 or qty > 99 then return end
	local item = Config.Shop.Items[itemId]
	local data = PlayerData.Get(player)
	if not item or not data then return end
	local cost = item.Price * qty -- price from server Config, never from the client
	if data.Coins < cost then return end
	data.Coins -= cost
	Inventory.add(data, itemId, qty)
end)

Interact.OnServerEvent:Connect(function(player: Player, target: unknown)
	if not RateLimit.allow(player, "Interact", 4, 2) then return end
	if typeof(target) ~= "Instance" or not target:IsA("BasePart") or not target:HasTag("Interactable") then return end
	if target:GetAttribute("OwnerUserId") ~= player.UserId then return end -- ownership
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not (root and root:IsA("BasePart")) then return end
	if (root.Position - target.Position).Magnitude > 12 then return end -- distance
	if not Cooldowns.ready(player, "Interact", 0.5) then return end -- gameplay cooldown
	-- ... act
end)
```

## Per-player rate limits
```lua
--!strict
-- ServerScriptService/Services/RateLimit: token bucket per player per action.
local Players = game:GetService("Players")
local RateLimit = {}
local buckets: {[Player]: {[string]: {tokens: number, last: number}}} = {}

function RateLimit.allow(player: Player, action: string, burst: number, perSecond: number): boolean
	local byAction = buckets[player]
	if not byAction then byAction = {}; buckets[player] = byAction end
	local now = os.clock()
	local b = byAction[action]
	if not b then b = { tokens = burst, last = now }; byAction[action] = b end
	b.tokens = math.min(burst, b.tokens + (now - b.last) * perSecond)
	b.last = now
	if b.tokens < 1 then return false end
	b.tokens -= 1
	return true
end

Players.PlayerRemoving:Connect(function(player) buckets[player] = nil end)
return RateLimit
```
Drop over-limit calls silently. Log repeated abuse at most once per player per minute, and don't kick on the first spike, because lag bursts happen.

## DataStore patterns
- **Load with retries** (pcall plus exponential backoff). If loading still fails, **never** hand out a fresh save that could overwrite the real one: kick with "Couldn't load your data, please rejoin".
- **Session lock:** load through `UpdateAsync` and stamp `{JobId = game.JobId, Time = os.time()}`. If another live server holds a recent lock (the player just hopped servers), wait and retry. Every save refreshes the lock, so treat a lock older than a few autosave intervals (for example 5-10 minutes) as stale, left behind by a crashed server.
- **Session cache:** gameplay reads and writes a table in memory (`PlayerData.Get(player)`). DataStores are touched only on load, autosave, purchase, leave and shutdown.
- **Save with `UpdateAsync`**, not `SetAsync`, and abort the write if the lock belongs to another server. Return `true` only when the write actually happened, because `ProcessReceipt` depends on it ([[09 Shops and Monetization]]).
- **Autosave** every 1-3 minutes (rule of thumb), staggered across players. Save on `PlayerRemoving` (release the lock) and in `game:BindToClose`, in parallel with a deadline ([[12 Live Ops and Launch]]). Make saving idempotent so both paths can run.
- **Versioned schema:** `Version` field, ordered migrations, defaults reconciled on load, never save over a newer version.
- **Budget awareness:** check `DataStoreService:GetRequestBudgetForRequestType(Enum.DataStoreRequestType.UpdateAsync)` before optional writes. Roblox throttles frequent writes to the same key (roughly one every several seconds), and keys have a size limit, so keep saves small. "Request was added to queue" warnings mean you're writing too often.
- Only save plain data: numbers, strings, booleans and tables with string keys or array indices. No Instances, Vector3s or CFrames (store them as numbers).
- Use a different store name in Studio (`if RunService:IsStudio() then "PlayerData_Studio_v1" else "PlayerData_v1"`) so tests never touch live saves. DataStores in Studio need the owner to enable API access for a published place.
```lua
local function save(player: Player, release: boolean): boolean
	local data = sessions[player]
	if not data then return false end -- never loaded: never save
	local wrote = false
	local ok = pcall(store.UpdateAsync, store, `Player_{player.UserId}`, function(old)
		wrote = false
		if old and old.Lock and old.Lock.JobId ~= game.JobId then return nil end -- not our lock: abort
		data.Lock = if release then nil else { JobId = game.JobId, Time = os.time() }
		wrote = true
		return data
	end)
	return ok and wrote
end
```

## ProcessReceipt idempotency
Use exactly one callback. Record `PurchaseId` in the player's save alongside the grant, return `PurchaseGranted` only after `save()` returns true, and return `NotProcessedYet` otherwise. The full skeleton is in [[09 Shops and Monetization]].

## Connections, threads and memory leaks
- `:Connect` returns an `RBXScriptConnection`. Disconnect it when the thing it serves is gone. `Destroy()` cleans up connections **on that instance**, but not your connections to global signals (`RunService.Heartbeat`, `Players.PlayerAdded`, another player's events).
- Clear every table keyed by `Player` or `Instance` on `PlayerRemoving` or `Destroying`.
- Cancel loops you started with `task.cancel(thread)`. Use one Heartbeat loop per system, not one per object, and `:Once()` for one-shot listeners.
```lua
player.CharacterAdded:Connect(function(character)
	local conns: {RBXScriptConnection} = {}
	local humanoid = character:WaitForChild("Humanoid") :: Humanoid
	table.insert(conns, humanoid.Died:Connect(function() onDied(player) end))
	table.insert(conns, RunService.Heartbeat:Connect(function(dt) tickAura(character, dt) end))
	player.CharacterRemoving:Once(function()
		for _, c in conns do c:Disconnect() end
	end)
end)
```
- Leak test: run a 2-player local server for 20+ minutes with respawns and joins, and watch the Developer Console Memory tab and instance counts. Steady growth is a leak.

## The task library
- Use `task.wait(s)`, `task.spawn(fn, ...)` (runs now), `task.defer(fn, ...)` (runs after the current step), `task.delay(s, fn, ...)` and `task.cancel(thread)`. Never use the deprecated `wait`, `spawn` or `delay`, which throttle and hide errors.
- Don't poll (`while true do task.wait() ... end`) when an event exists. Connect to the event.

## Typing with --!strict
- `--!strict` is the first line of every Script, LocalScript and ModuleScript, and the Script Analysis window must show zero errors. Export shared shapes from `Shared/Types`:
```lua
export type PlayerSave = { Version: number, Coins: number, Receipts: {[string]: number}, Lock: {JobId: string, Time: number}? }
```
- Type remote parameters as `unknown` and narrow with `typeof`/`IsA`. Cast with `::` only after a runtime check or for `WaitForChild` results.

## Client: WaitForChild
- On the client, replication order isn't guaranteed. Get ReplicatedStorage objects, PlayerGui children and the character's parts with `WaitForChild` (with a timeout, `WaitForChild(name, 5)` returns nil, so handle it). On the server, index directly or use `FindFirstChild`, because the server created it.
- "Infinite yield possible on ..." in Output means a wrong name, an object that exists only on the server, or something streamed out.

## StreamingEnabled pitfalls
- Streaming is on by default in new places. Distant parts **don't exist on the client** and are removed when streamed out. (LocalScripts also don't run in Workspace, except inside the player's character.)
- Client code reacts to `CollectionService:GetInstanceAddedSignal(tag)` and `GetInstanceRemovedSignal(tag)` instead of looking up fixed workspace paths.
- A workspace Instance sent in a server→client remote arrives as `nil` if that client hasn't streamed it. Send IDs or positions, or handle nil.
- Set `Model.ModelStreamingMode` to `Atomic` for models scripts need whole, and `Persistent` only for the few things that must always exist (lobby boards).
- Before teleporting a character far away, call `player:RequestStreamAroundAsync(position)` on the server, then `PivotTo`.

## Testing in Studio
- **Play (F5):** server plus your client with a character. Use the client/server toggle in the Test tab to inspect each side.
- **Run (F8):** server only, no character. Use it for NPC, spawning and economy loops.
- **Test > Clients and Servers:** a local server with **2 or more players**. This is required for anything multiplayer: replication, ownership checks, trading, leaderboards, rate limits, PlayerRemoving saves.
- Use the Device Emulator for phones ([[08 Mobile]]), and a simulated incoming replication lag (Studio Settings > Network) to test laggy remotes.
- Test the leave paths: leave mid-purchase, leave mid-save, stop the server, then rejoin and compare the data. Playtest writes the evidence (Output excerpts, screenshots) to `games/<slug>/reports/`, and never reports something as tested if it wasn't.

## Reading the Output window
- Red is an error, with a stack trace (`ServerScriptService.Services.ShopService:42`); click it to jump to the line. Orange is a warning. Fix the **first** error, because later ones often cascade from it.
- Watch for these: `attempt to index nil with 'X'` (something not loaded or not existing), `Infinite yield possible` (see above), DataStore queue or throttle warnings (too many writes), and `Requested module was required recursively`.
- Separate server and client messages in multi-client tests (each window shows its own side). In live servers, the Developer Console (F9) shows client and server logs, memory and network. Prefix logs with the system name (`[Shop]`, `[Receipts]`), and never `print` inside loops.

## Checklist
Pre-ship code review (Reviewer runs this; Producer checks the evidence):
- [ ] Every remote is in the contract table, rate-limited, and validates types, ranges, NaN, ownership and distance.
- [ ] No client-provided price, reward, damage or progress value is trusted anywhere.
- [ ] PlayerData loads with retries and a session lock; failed loads kick instead of handing out fresh data; saves use `UpdateAsync`.
- [ ] Autosave, PlayerRemoving and BindToClose all save, and rejoining after each shows the same data in a 2-player test.
- [ ] Save data is versioned and migrated; a newer-version save is never overwritten.
- [ ] `ProcessReceipt` is idempotent by `PurchaseId` and acknowledges only after a successful save.
- [ ] No `wait(`, `spawn(` or `delay(` anywhere; `--!strict` on every script with zero Script Analysis errors.
- [ ] Every connection to a global signal is disconnected; Player-keyed tables are cleared on leave.
- [ ] Client code uses WaitForChild and tolerates streamed-out instances.
- [ ] Instances are created with Parent set last; no loose Scripts in Workspace.
- [ ] A 2+ player local server session shows zero red errors in Output on every side.
- [ ] Tunables and IDs live in `ReplicatedStorage.Shared.Config`.

## Common mistakes
- Letting the client send the price, the reward amount or "I won".
- `SetAsync` saves without a session lock, so a fast server hop overwrites new data with old.
- Saving a default table after a failed load, which wipes the player's progress.
- Forgetting `BindToClose`, so every update loses the last minutes of everyone's progress.
- `RemoteFunction:InvokeClient`, or yielding inside `OnServerInvoke`.
- A Heartbeat connection per spawned coin that is never disconnected.
- Testing only with one player in Play mode and shipping multiplayer bugs.
- Using `WaitForChild` on the server, or direct indexing (`workspace.Map.Shop`) on the client under streaming.
- Changing another agent's area (UI, map, assets) without being assigned it ([[00 Start Here]]).

## Related
[[00 Start Here]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]]
