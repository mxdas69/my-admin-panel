---
tags: [vault, engineering, architecture, data, security, performance, testing, luau]
for: [builder, architect, reviewer, merchant, playtest, producer]
also: [lead, frame, scenic, librarian, liveops, balance, kid-tester]
---

# 13 Building It Right

This is the engineering playbook: architecture, networking, saving data, purchases, security, performance and testing, with the Luau to back each rule. Every Roblox client can be modified by an exploiter, every DataStore call can fail, every connection you forget leaks memory on a phone, and every server can be shut down with 30 seconds' notice. Code that "works in Play mode" can still lose saves, double-grant purchases, hand out infinite coins or crash when 30 players arrive at once. These rules keep the game safe, stable and easy for 15 agents to change without breaking each other's work.

Engineering decides success more directly than it looks. Roblox's Recommended for You ranks games on per-player averages of playtime, play days, spend days and co-play [1], over a 28-day view built to value long-term retention [2][3]. A crash ends a session early. A lost save ends a player's month. A broken purchase ends their trust. A game that went from a three-day build to millions of concurrent players [13][17] had to survive that growth on whatever architecture it launched with. Build it right the first time, because the first big day doesn't wait.

Architect defines the contracts (the remotes table, the save schema, the module list) in `plan.md` before code exists. Builder implements them, Merchant owns purchase modules, Frame owns UI controllers, and Reviewer enforces this chapter before every gate. Playtest proves it in Studio with evidence. Read the Rules before any build task, the "Step by step" procedure for the task at hand, and the checklist before handing over. Statements in this chapter without a citation are studio rules from experience with the Roblox APIs; where a platform limit is given, check the current Creator Hub page before relying on the exact number.

## Rules

### Architecture

1. **The server owns every decision that matters; the client sends intent and draws what the server says.** Currency, inventory, damage, rewards, prices, cooldowns, odds, quest progress and purchases are decided on the server. The client sends "I want to buy item X" and shows the result. Clients can read everything that replicates, including ModuleScripts and LocalScripts in ReplicatedStorage and StarterPlayer, so server logic and secrets live in ServerScriptService and ServerStorage, which never replicate.
   Done right: `BuyItem:FireServer("Sword")`; the server checks the price in its own Config and the player's coins.
   Done wrong: `BuyItem:FireServer("Sword", 0)` where the second argument is the price.

2. **One entry Script per side requires every module in a fixed order, calls `Init()` on all, then `Start()` on all.** `Init` sets up state and touches nothing that depends on other modules. `Start` connects events and starts loops. There are no other Scripts or LocalScripts, apart from the loading screen in ReplicatedFirst. With one entry point, startup order is visible in one file, and nothing runs before its dependencies exist (code in "Module architecture").
   Done right: `ServerScriptService.Main` lists 14 services in order; Output prints `[Boot] 14 services started in 0.21 s`.
   Done wrong: 30 Scripts scattered through the map, each with its own `while true do` loop.

3. **A module returns one table, has no side effects at require time, and never requires a module that requires it back.** Roblox errors on recursive requires ("Requested module was required recursively"). If two services need each other, move the shared part into a third module, or pass a reference in `Init`. Requiring a module must not connect events, create instances or start loops; that belongs in `Start`.
   Done right: `ShopService` requires `PlayerData` and `Economy`; neither requires `ShopService`.
   Done wrong: `PlayerData` requires `ShopService` to call a hook, and `ShopService` requires `PlayerData`.

4. **Use the studio folder layout exactly, and change only your own area.** The layout is in "Folder layout" below, and the area owners are in `CLAUDE.md`: Builder owns ServerScriptService, ServerStorage, `ReplicatedStorage.Shared` and `ReplicatedStorage.Remotes` (Merchant owns shop and purchase modules), Frame owns StarterGui and UI controllers, Scenic owns `Workspace.Map`, Terrain and Lighting, Librarian owns the Assets folders. If your task needs a change in another area, ask that owner through the Lead.
   Done right: Builder needs a new UI state, so adds it to the `StateChanged` contract and asks Frame to draw it.
   Done wrong: Builder edits a ScreenGui "just to wire one button".

5. **Every tunable and every ID lives in `ReplicatedStorage.Shared.Config`, frozen, never as a magic number in logic.** Prices, rates, cooldowns, odds, pass and product IDs, event times and flags all live in Config ([[04 Progression and Economy]]). Freeze it with `table.freeze` (recursively, since `table.freeze` is shallow) so no module can change a price at runtime by accident. Server-only values (secret odds tables, admin lists) go in `ServerStorage.Config`, which never replicates.
   Done right: `Config.Shop.Items.Sword.Price = 250`, read by the server and by the UI to show the price.
   Done wrong: `if coins >= 250 then` in the shop script and `"250"` typed into a TextLabel.

6. **Contracts come first: the remotes table, the save schema and the module list are in `plan.md` before any code.** Reviewer rejects any remote that isn't in the table, any save field that isn't in the schema, and any service not in the module list. The contract is how 15 agents build one game without breaking each other (format in "Remotes contract table").
   Done right: Architect adds `RedeemCode | RemoteEvent | C→S | code: string | 1-24 chars, exists, unused, in date | 3, 0.2` before Builder writes the handler.
   Done wrong: Builder invents `GiveCoinsRemote` during a late-night fix.

7. **One Economy module grants and spends every currency; nothing else touches balances.** A single choke point means every source and sink is validated, logged to analytics ([[12 Live Ops and Launch]]) and synced to the client the same way. A duplicate grant path is the most common cause of inflation and dupes.
   Done right: quests, codes, receipts and drops all call `Economy.grant(player, {Coins = 50}, "Quest_Daily1")`.
   Done wrong: `data.Currencies.Coins += 50` in six different files.

8. **Server state reaches the client through one state contract, batched, never every frame.** The server keeps the truth in the player's session table. It replicates what the client needs through a `StateChanged` remote with a snapshot or a delta, or through attributes on the Player for a few simple values. Batch changes and send them at most 10 times per second (studio target), not on every increment.
   Done right: coins change 40 times in a second while auto-collecting; the client gets 10 updates and the HUD tweens between them.
   Done wrong: 40 remote calls per second per player for one number.

9. **Give behavior to many instances with CollectionService tags and per-instance data with attributes.** Use `Instance:AddTag`, `CollectionService:GetTagged`, `GetInstanceAddedSignal` and `GetInstanceRemovedSignal`, and `SetAttribute`/`GetAttribute` for values like `OwnerUserId` or `Value`. One service handles every "Collectible", wherever it is and whenever it streams in. Scenic places tagged parts; Builder's code finds them.
   Done right: `CollectibleService` handles 400 tagged coins with one loop.
   Done wrong: 400 copies of a Script inside 400 coins.

10. **Create instances with properties first and `Parent` last.** Replication and events then see a finished object, and the engine doesn't do work twice. The same applies to clones: position, attributes and tags first, then parent.
    Done right: the code sample in "Module architecture" sets `PivotTo`, attributes and tags, then `drop.Parent = workspace.Drops`.
    Done wrong: `Instance.new("Part", workspace)` and then setting ten properties.

11. **Every connection, thread and created instance belongs to a lifetime, and is cleaned up when that lifetime ends.** A lifetime is a player session, a character, a round or a UI screen. Use a `Cleaner` (code in "Luau") per lifetime: add connections, threads and instances to it, and call `clean()` on `PlayerRemoving`, `CharacterRemoving`, round end or screen close.
    Done right: a round's 12 connections and 3 loops are gone 1 frame after the round ends.
    Done wrong: a `Heartbeat` connection per spawned coin that's never disconnected.

12. **Content is data: items, pets, worlds, quests and events are Config entries, not code branches.** Adding a pet means adding a row, not writing `if petId == "LavaDog" then`. This is what makes a 1-2 week update cadence possible ([[12 Live Ops and Launch]]). Grow a Garden kept weekly Saturday updates [20], and even then its developer found weekly events hard to keep fresh [21]; code that needs edits for every new item makes that cadence impossible.
    Done right: `Config.Pets.LavaDog = { Rarity = "Epic", Power = 45, Egg = "Lava" }`, and every system reads it.
    Done wrong: a 600-line `if/elseif` pet table inside the hatch script.

13. **Every system has an `Enabled` flag, read on the server, that turns it off cleanly.** `Config.Flags.<System>` gives the default, and live config can override it ([[12 Live Ops and Launch]]). When the flag is off, the server rejects that system's remotes and the client hides its UI. A broken feature can then be switched off in minutes without a republish.
    Done right: `if not LiveConfig.flag("Trading") then return end` at the top of every trading handler.
    Done wrong: a broken trading system that can only be removed by publishing a new build.

14. **Build an original place; never publish a kit, template or uncopylocked game as your base.** Roblox says games whose metadata and place files closely resemble existing games aren't prioritized for recommendations and may rank lower in search [5]. Kits also hide scripts nobody on the team has read (Rule 49). Use the studio's own skeleton (Step by step: "Skeleton of a new game"), and take only patterns from other games.
    Done right: a fresh place with the studio skeleton, map built by Scenic.
    Done wrong: a downloaded "simulator kit" with its map, scripts and GUI renamed.

### Networking and remotes

15. **Every remote in `ReplicatedStorage.Remotes` matches a row of the contract table, by name and type.** The server creates the remotes at boot from a list in `Shared/RemoteNames` (or they exist in the place, created by Builder), and both sides get them by name. A remote not in the table is a review failure.
    Done right: a `Remotes` module exposes `Remotes.BuyItem`, `Remotes.StateChanged`, created on the server from the list.
    Done wrong: LocalScripts creating their own RemoteEvents (they won't exist on the server).

16. **Prefer RemoteEvents; never call `RemoteFunction:InvokeClient`; `OnServerInvoke` returns quickly and never yields long.** A client can hang `InvokeClient` forever or error it. A slow `OnServerInvoke` holds a request open and makes the UI feel frozen. Use a RemoteFunction only for small snapshot reads like `GetShopState`, answered from memory.
    Done right: the shop opens with one `GetShopState:InvokeServer()` answered from the session cache in under 1 ms of server time.
    Done wrong: `OnServerInvoke` calls `GetAsync` on a DataStore.

17. **Validate every `OnServerEvent` argument in this order: rate limit, types, ranges (NaN, infinity, integers), existence, ownership, distance, cooldown, cost.** The first parameter is always the real `Player`, filled in by Roblox. Everything after it is untrusted input, typed `unknown`. Cheap checks come first, so a spammer costs the server almost nothing (code in "Validate every OnServerEvent argument").
    Done right: `BuyItem` drops a call with `qty = 0/0` at the type and range check.
    Done wrong: `if qty > 0 then` (NaN fails every comparison, so some checks pass by accident) or no check at all.

18. **Rate-limit every client-to-server remote per player, per action, with a token bucket.** Each row of the contract table has a burst and a per-second refill. Drop over-limit calls silently. Log repeated abuse at most once per player per minute, and don't kick on the first spike, because lag bursts happen (code in "Per-player rate limits").
    Done right: `Interact` allows a burst of 4 and 2 per second; an auto-clicker at 30 per second gets 2.
    Done wrong: no limit, so an exploit script fires `ClaimDaily` 10,000 times.

19. **Use `UnreliableRemoteEvent` only for frequent, small, cosmetic updates where a lost packet doesn't matter.** Hit effects, cosmetic positions and particle triggers fit. Anything that changes state (coins, inventory, health) uses a normal RemoteEvent. Unreliable events have a small payload cap, and oversized ones are dropped, so keep each payload to a few numbers or one short string.
    Done right: `HitFx:FireAllClients(position)` as an UnreliableRemoteEvent.
    Done wrong: sending the inventory snapshot unreliably and wondering why items vanish.

20. **Send plain data: IDs, numbers, strings, booleans and plain tables; under streaming, send IDs or positions, not workspace Instances.** Remote arguments lose metatables and functions, and tables with mixed key types arrive mangled. A workspace Instance sent server→client arrives as `nil` if that client hasn't streamed it in. Send `"Coin_1842"` or a Vector3, and let the client look it up through tags.
    Done right: `StateChanged:FireClient(player, { Coins = 1250, Gems = 4 })`.
    Done wrong: `{ [1] = "a", Coins = 5 }` (mixed keys) or a part from a distant area.

21. **Make the client feel instant, then let the server confirm: predict cosmetics, never state.** The client may play the swing animation, the click sound and a "pending" button state immediately. The number on the HUD changes only when the server's `StateChanged` arrives (typically within one round trip). If the server rejects the action, the client rolls back the cosmetic and shows why.
    Done right: tapping Buy dims the button and shows a spinner; the item appears when the server confirms.
    Done wrong: the client subtracts the coins itself and shows a different balance from the server's.

### Data

22. **Load with retries, and if loading still fails, kick the player; never hand out a fresh save that could overwrite the real one.** Wrap the load in `pcall` with exponential backoff (studio default: 6 attempts, 2 s, 4 s, 8 s, then 15 s). If every attempt fails, kick with "We couldn't load your data. Your progress is safe. Please rejoin in a minute." A default save written over a real one is the worst bug a game can ship.
    Done right: a DataStore outage kicks 40 players with a friendly message; nobody loses progress.
    Done wrong: `local data = store:GetAsync(key) or Defaults`, with no `pcall`, saved on leave.

23. **Lock each save to one server through `UpdateAsync`, and treat locks older than 10 minutes as stale.** On load, stamp `{JobId = game.JobId, Time = os.time()}` inside the `UpdateAsync` transform. If another live server holds a recent lock (the player just hopped servers and the old server is still saving), cancel and retry. Every save refreshes the lock, so a lock older than several autosave intervals (studio default: 600 s with 120 s autosaves) was left by a crashed server and can be taken.
    Done right: a fast server hop waits 4 seconds for the old server's final save, then loads the latest data.
    Done wrong: two servers both writing the same save, so the older one wins and the player loses 5 minutes.

24. **Gameplay reads and writes the session cache; DataStores are touched only on load, autosave, purchase, leave and shutdown.** `PlayerData.Get(player)` returns the in-memory table. Never call a DataStore in a click handler or a loop.
    Done right: 30 players clicking 5 times per second cause 0 DataStore requests.
    Done wrong: `SetAsync` on every coin pickup, followed by "request was added to queue" warnings.

25. **Save with `UpdateAsync`, abort when the lock belongs to another server, and return `true` only when the write really happened.** `ProcessReceipt` depends on that `true` ([[09 Shops and Monetization]]). `SetAsync` can't check the lock, so it isn't used for player saves.
    Done right: the `save` function in "DataStore patterns" sets `wrote = true` only inside a transform that returned data, and returns `ok and wrote`.
    Done wrong: `pcall(store.SetAsync, ...)` returning `true` even when another server owned the save.

26. **Autosave every 1-3 minutes, staggered per player; save on `PlayerRemoving` and in `BindToClose`; make every save idempotent.** Stagger by giving each player a random first save time, so 30 players don't save in the same second. On leave, save and release the lock. In `game:BindToClose`, save every player in parallel with a deadline of about 25 seconds, since the server has about 30 seconds ([[12 Live Ops and Launch]]). Leave and shutdown may both fire for the same player; the second save must be a no-op.
    Done right: stopping a 2-player server prints `[PlayerData] 2 saved in 1.4 s`.
    Done wrong: saves only on leave, so every update loses everyone's last minutes.

27. **Version the save schema: a `Version` field, ordered migrations, defaults reconciled on load, and never save over a newer version.** Most changes are new fields, which reconcile fills from defaults with no migration. A rename or reshape adds a migration step and bumps `CURRENT_VERSION`. During a rollout, old and new servers run side by side, so a server that loads a save with a higher `Version` refuses to touch it and asks the player to rejoin (code in [[12 Live Ops and Launch]] and below).
    Done right: v1.4 renames `Diamonds` to `Gems` with migration 2→3; v1.3 servers kick players with v3 saves instead of saving them.
    Done wrong: renaming the field without a migration, so every player's diamonds read as 0.

28. **Save only plain data: numbers, strings, booleans, and tables that are either dictionaries with string keys or dense arrays.** No Instances, Vector3s, CFrames, Color3s, functions or metatables. Store positions as `{x, y, z}` numbers, colors as hex strings, and sparse collections as string-keyed dictionaries (`["7"] = true`), because sparse arrays and mixed tables don't survive JSON encoding intact.
    Done right: `Pets = { ["a8f2"] = { Id = "LavaDog", Level = 3 } }`.
    Done wrong: `Pets = { [1] = ..., [5] = ... }` (sparse) or `LastPosition = Vector3.new(...)`.

29. **Know the DataStore limits and stay far below them.** As documented at the time of writing (verify on the Creator Hub limits page): each key holds up to 4 MB of encoded data; writes to the same key are limited to about one every 6 seconds; each server's request budget per minute grows with its player count (on the order of 60 + 10 × players for each of the get and set categories); key and store names are limited to 50 characters. Check `DataStoreService:GetRequestBudgetForRequestType(Enum.DataStoreRequestType.UpdateAsync)` before optional writes. "Request was added to queue" warnings mean you're writing too often.
    Done right: autosave every 120 s, staggered, with budget checks for leaderboard writes.
    Done wrong: saving every player every 5 seconds.

30. **Keep each player's save small: under 100 KB encoded (studio target).** Measure it in Studio with `#HttpService:JSONEncode(data)` after a long test session and write the number in the report. Store counts instead of lists for stackable items, store records only for unique items, and cap logs (receipts, history) to the newest entries.
    Done right: `[PlayerData] save size 6.2 KB after 2 h test`.
    Done wrong: a history list that appends every sale forever until saves fail.

31. **Use a separate DataStore name in Studio, and never point tests at live saves.** `if RunService:IsStudio() then "PlayerData_Studio_v1" else "PlayerData_v1"`. Studio needs the owner to turn on API access for the published place. Tools that read or repair live data (restore scripts) name the live store explicitly and are run only by the owner.
    Done right: Playtest's 50 test sessions leave the live store untouched.
    Done wrong: a Studio test that resets the owner's live save.

32. **Associate the player's UserId with their save so data-deletion requests can be honored.** Pass `{player.UserId}` as the user IDs returned from the `UpdateAsync` transform (or in `SetAsync`'s user IDs argument). When Roblox sends a right-to-erasure request for a UserId, the owner removes that player's keys in every store (save, leaderboards, referral queues) and logs the date. Keep every per-player key named `<Prefix>_<UserId>` so they can be found.
    Done right: `ReferralPending_v1` uses `Inviter_<UserId>` keys, listed in `plan.md` under "Per-player keys".
    Done wrong: per-player data under random GUID keys nobody can find again.

33. **`ProcessReceipt` is idempotent by `PurchaseId` and acknowledges only after a successful save.** Use exactly one callback for the whole game. Record the `PurchaseId` in the player's save together with the grant, return `PurchaseGranted` only after `PlayerData.Save` returns true, and `NotProcessedYet` otherwise. Roblox retries unacknowledged purchases later, and the receipt record stops a second grant (full code in "Purchases" below; product design in [[09 Shops and Monetization]]).
    Done right: a purchase during a DataStore outage is granted once, after the player's next successful save.
    Done wrong: granting and returning `PurchaseGranted` before saving, so a crash loses the item the player paid for.

34. **Game passes are checked on join with `UserOwnsGamePassAsync`, re-checked after `PromptGamePassPurchaseFinished`, and cached in the save as a fallback.** Ownership checks can fail during outages. On failure, use the saved cache (`PassesOwned`), so a paying player never loses their pass for a session. Grant immediately when the purchase-finished event says it was bought.
    Done right: a Roblox outage at join still gives the VIP player their VIP perks from the cache.
    Done wrong: `if MarketplaceService:UserOwnsGamePassAsync(...)` with no `pcall`, so an error removes the pass for that session.

35. **Global leaderboards use an `OrderedDataStore`, written every few minutes and read from a cache.** Write integers only (`math.floor`), at most every 5 minutes per player (studio default), with budget checks. Read the top 50 every 2-5 minutes on each server and cache the names (`Players:GetNameFromUserIdAsync` in `pcall`). Sorted reads have a much smaller budget than normal reads.
    Done right: one `GetSortedAsync(false, 50)` per server every 3 minutes.
    Done wrong: reading the leaderboard every time a player opens the board.

36. **Cross-server state uses MemoryStoreService for fast, expiring data and MessagingService for broadcasts; neither is the source of truth for a player's save.** MemoryStore (sorted maps, queues, hash maps) suits matchmaking queues, live global counters, trade escrow and short-lived leaderboards; every item has an expiration. MessagingService delivery is best-effort, so messages are hints ("refresh live config"), never values that must arrive. Both have per-experience quotas that grow with player count; check the Creator Hub limits pages before designing.
    Done right: a community goal counter in a MemoryStore sorted map, each server adding its local total every 30 s.
    Done wrong: each server publishing every coin pickup over MessagingService.

37. **Have the restore tools ready before launch: list a key's versions and read an old version.** DataStores keep previous versions of each key for a limited time (30 days at the time of writing; verify). `ListVersionsAsync` and `GetVersionAsync` let the owner restore one player's save after a bug (code in "Restoring a save"). Never rename the store to "reset" data; that wipes everyone ([[12 Live Ops and Launch]]).
    Done right: a corrupted save restored from the version before the bug in 10 minutes.
    Done wrong: "We can't get your pets back."

38. **Trades and other two-player changes happen atomically in memory, on one server, and are saved for both players right away.** Both players confirm on the server; the server re-checks both inventories in the same step, swaps, writes a trade log entry with a trade ID into both saves, and saves both. Cross-server trading needs an escrow design reviewed by Reviewer (MemoryStore with expirations plus receipts in both saves).
    Done right: a trade swaps both inventories in one function with no yields in between, then saves both.
    Done wrong: removing the item from player A, yielding for a save, then adding it to player B, so a leave in between duplicates or deletes it.

39. **Release the save lock before teleporting a player to another place.** Save and release, then call `TeleportService:TeleportAsync`. Otherwise the destination server waits for a lock this server still holds. Teleport data travels through the client, so it never carries rewards, currencies or secrets.
    Done right: `PlayerData.SaveAndRelease(player)` then `TeleportAsync(placeId, {player}, options)`.
    Done wrong: teleport data `{ Coins = 5000 }` read by the destination as truth.

### Security

40. **Assume every client is fully controlled by an attacker.** Exploiters can fire any remote with any arguments at any rate, read every replicated script, run their own code on their client, move their character anywhere (speed, fly, teleport, noclip), and change anything they see locally. They can't run code on the server or read ServerStorage and ServerScriptService. Every review asks: "What happens if a client sends the worst possible value here, 100 times a second?"
    Done right: Reviewer's report lists each remote with its worst-case input and why it's safe.
    Done wrong: "Players can't open that menu yet, so the remote is safe."

41. **Never trust a client-sent price, reward, damage value, progress claim, timestamp or "I won".** The server computes all of them from its own state and Config. The client may send which item, which target or which direction, never how much.
    Done right: `ClaimQuest:FireServer("Daily1")`; the server checks its own progress counter.
    Done wrong: `ClaimQuest:FireServer("Daily1", true)` where `true` means "completed".

42. **Check movement on the server with tolerance, and pull players back instead of kicking them.** Character movement is client-owned physics. Sample each character's position every 0.5 s, compare the horizontal distance with `WalkSpeed × 0.5 × 1.6 + 4` studs (studio tolerance for lag and knockback), skip players who are seated or were just teleported by the server, and move offenders back to their last good position (code in "Luau"). Log at most once per minute per player.
    Done right: a speed exploiter keeps snapping back; a laggy phone player never notices.
    Done wrong: auto-kicking on one bad sample, so players on bad Wi-Fi get kicked.

43. **Validate combat hits on the server: weapon equipped, fire rate, origin near the character, direction sane, and the server's own raycast or range check.** The client may raycast for instant feedback, but damage only happens when the server agrees. Damage values come from Config, never from the client (code in "Luau").
    Done right: a client claiming a hit 300 studs away through a wall does nothing.
    Done wrong: `DamageRemote:FireServer(target, 9999)`.

44. **Rewards from Touched, ProximityPrompt and ClickDetector still check ownership, distance, cooldown and debounce on the server.** `Touched` fires for any part, including parts an exploiter moves; check that the toucher belongs to a real character and that the reward hasn't been claimed. For prompts and click detectors, re-check the distance on the server and apply a per-player cooldown.
    Done right: a coin's Touched handler finds the player from the character, checks a per-coin claimed flag and a 0.1 s per-player debounce.
    Done wrong: `coin.Touched:Connect(function(hit) giveCoins(hit.Parent, 100) end)`.

45. **Give important physics objects to the server with `BasePart:SetNetworkOwner(nil)`.** Unanchored parts near a player are often simulated by that player's client, which can move them anywhere. Projectiles that deal damage, carts that score points, balls in a sports game and boss parts belong to the server. Anchored parts have no owner and are always safe.
    Done right: the ball in a soccer game has `SetNetworkOwner(nil)`; goals are detected on the server.
    Done wrong: a client-owned ball that an exploiter teleports into the goal.

46. **Filter every piece of player-written text shown to anyone else with `TextService`.** Pet names, sign text, plot names, trade messages and custom titles go through `TextService:FilterStringAsync` on the server, then `GetNonChatStringForBroadcastAsync` (for everyone) or `GetNonChatStringForUserAsync` (for one viewer). If filtering fails, show nothing. Store the raw text only if you'll re-filter it each time it's shown.
    Done right: a pet named by the player appears filtered on every other player's screen.
    Done wrong: a custom sign that shows raw text, which breaks Roblox's rules.

47. **Admin and owner commands are checked on the server by UserId or group rank, never by a client-side check.** A client can unhide any button. The server handler checks `player.UserId == game.CreatorId` (user-owned games) or `player:GetRankInGroup(game.CreatorId) >= Config.AdminMinRank` (group-owned games), with the result cached per session.
    Done right: the admin panel's remote ignores everyone not on the server-side list.
    Done wrong: `if player.Name == "Owner" then` in a LocalScript.

48. **Secrets live on the server only: API keys come from the experience's secrets store through `HttpService:GetSecret`, never from a replicated script or a plain string.** Anything in ReplicatedStorage, StarterPlayer, StarterGui or Workspace can be read by every client. Server-to-Open-Cloud calls, such as sending experience notifications [6][7], run in ServerScriptService and use secrets the owner set up.
    Done right: `HttpService:GetSecret("NotifyKey")` inside a server module.
    Done wrong: an API key pasted into a ModuleScript in ReplicatedStorage.

49. **Audit every free model and plugin script before it enters the place; reject anything you can't read.** Search inserted assets for `require(` with a number, `getfenv`, `setfenv`, `loadstring`, long encoded strings (`\x`, `string.char` chains), `InsertService`, `TeleportService`, `MarketplaceService` prompts and `HttpService` calls, and for Scripts hidden inside parts, meshes or welds. Keep `ServerScriptService.LoadStringEnabled` off. Librarian strips all scripts from art models ([[07 Characters, VFX and Assets]]).
    Done right: a tree model with a hidden `require(4829...)` script is rejected and logged.
    Done wrong: a "cool sword" free model that quietly gives its author admin.

50. **Treat join data, launch data and teleport data as untrusted input.** `Player:GetJoinData()` carries teleport data that passed through the client, launch data from deep links and notifications [6], and referral information [9]. Check types, lengths and an allowlist of keys before acting. A referral or launch value never grants more than a capped, logged reward.
    Done right: launch data `"event"` is checked against `ALLOWED_GO` before the player is moved.
    Done wrong: launch data parsed as JSON and its `coins` field added to the balance.

51. **Build only on APIs your scripts can actually call, and let the platform enforce what it enforces.** Some engine events are reserved for Roblox's own CoreScripts, such as the event for an invite being sent from the default invite UI [10], so a design that needs them can't work. The platform also handles some rules for you, such as showing rewarded video only to users 13+ [11]. Read the API reference's security note before designing around an event, and always keep a normal in-game path for anything the platform limits by age.
    Done right: referral rewards paid on arrival through `ReferredByPlayerId` [9].
    Done wrong: a "count invites sent" quest that never completes.

52. **Log suspicious actions sparsely, and never ban automatically on a single signal.** Count rejections per player per remote. Log a summary at most once per minute (`[Security] 1842 BuyItem rejects from 12345 in 60 s`). Bans, if the owner wants them, are a human decision based on several signals.
    Done right: a weekly report of the top rejected remotes, used to tighten validation.
    Done wrong: auto-banning anyone who sends two bad packets, including laggy players.

### Performance

53. **Hold the performance budget: 60 FPS on PC, a 30 FPS floor on a low-end phone, a server heartbeat near 60, and flat memory over a 30-minute session (studio targets).** Measure in a 2-player local server with the Developer Console (F9) and on one real phone. A falling frame rate on phones costs sessions, and phones are most of the audience ([[08 Mobile]]).
    Done right: the performance report lists FPS, memory and heartbeat at 1, 10 and 30 minutes.
    Done wrong: "Runs fine on my PC."

54. **One loop per system, never one per object, and spread heavy work across frames.** A single `Heartbeat` connection that updates 400 coins is far cheaper than 400 connections. For heavy batches (spawning 200 drops, rebuilding a plot), process a slice per frame (studio default: at most 2 ms of work per frame), yielding with `task.wait()` between slices.
    Done right: the drop spawner creates 20 drops per frame over 10 frames.
    Done wrong: a `for i = 1, 2000 do Instance.new(...)` that freezes the server for a second.

55. **Don't poll when an event exists; when you must sample, sample slowly.** Connect to `GetPropertyChangedSignal`, `AttributeChanged`, `ChildAdded` and tag signals instead of checking every frame. When no event exists (movement checks, area detection), sample at 2-10 Hz, not 60.
    Done right: area detection every 0.2 s with one spatial query per player.
    Done wrong: `while true do task.wait() if player.leaderstats.Coins.Value > ... end end` in 20 places.

56. **Detect pickups and areas with spatial queries, not hundreds of `Touched` connections.** `workspace:GetPartBoundsInRadius(position, radius, overlapParams)` with `OverlapParams.FilterType = Enum.RaycastFilterType.Include` and the drops folder in `FilterDescendantsInstances` finds nearby pickups for one player in one call. Touched events on many moving parts are expensive and unreliable for fast movement.
    Done right: a 0.1 s pickup scan per player, radius 8 studs.
    Done wrong: a Touched handler on each of 1,000 coins.

57. **Pool objects that spawn often (coins, projectiles, damage numbers, effects) instead of creating and destroying them.** Reuse instances by parenting them to `nil` and back. Creating and destroying hundreds of instances per second causes memory churn and replication traffic (code in "Luau").
    Done right: 60 damage numbers per second from a pool of 40.
    Done wrong: `Instance.new` and `Destroy` for each damage number.

58. **Anchor everything static, and turn off what decoration doesn't need: `CanCollide`, `CanTouch`, `CanQuery` and `CastShadow`.** Static parts that are anchored cost no physics. Decorative parts that nothing touches or raycasts should have `CanCollide = false`, `CanTouch = false` and `CanQuery = false`. Small parts don't need shadows (`CastShadow = false`). Scenic applies this to the map ([[06 World and Look]]); Builder applies it to spawned objects.
    Done right: grass tufts, small rocks and particles have all four off.
    Done wrong: 5,000 unanchored decorative parts sleeping in the physics engine.

59. **Use simple collision for meshes: `CollisionFidelity` Box or Hull for anything that isn't walked on in detail.** Precise collision on many meshes costs memory and physics time. Use `Default` or `PreciseConvexDecomposition` only where players stand on or squeeze past the exact shape.
    Done right: trees use Hull; the main walkway mesh uses Default.
    Done wrong: 300 decorative crystals with `PreciseConvexDecomposition`.

60. **Humanoids are expensive: budget NPCs, and use simpler rigs for things that don't walk.** Each Humanoid runs state logic. Studio targets: at most 30 active Humanoid NPCs per server on mobile-heavy games, AnimationController for animated props and pets that don't need Humanoid physics, and `Humanoid:SetStateEnabled` to turn off states an NPC never uses (for example climbing and swimming).
    Done right: pets follow with AnimationController and a server-side CFrame update at 10 Hz, interpolated on clients.
    Done wrong: every pet a full Humanoid with physics, 6 per player, 20 players.

61. **Tune StreamingEnabled instead of turning it off, and mark only the models that must stay loaded.** Streaming keeps phone memory down. Set `Model.ModelStreamingMode` to `Atomic` for models scripts need whole, and `Persistent` only for the few things that must always exist (lobby boards, the player's own plot). Before teleporting a character far away, call `player:RequestStreamAroundAsync(position)` on the server, then `PivotTo`.
    Done right: the world streams, the player's plot is `PersistentPerPlayer` for its owner, and portals pre-stream the destination.
    Done wrong: streaming off and a 600 MB map on every phone.

62. **UI updates on change, not per frame, and screens are built once and shown or hidden.** Frame's controllers listen for state changes, tween numbers with `TweenService`, and toggle `Visible` instead of destroying and rebuilding screens. A per-frame loop that sets 40 TextLabels is a common cause of phone frame drops ([[05 UI and HUD]]).
    Done right: the inventory grid is built once; opening it updates only changed slots.
    Done wrong: the shop rebuilt from scratch every time it opens.

63. **Profile before optimizing, and write down the before and after numbers.** Use the MicroProfiler (Ctrl+F6 in a running client) for frame spikes, the Script Profiler in the Developer Console for script time, the Developer Console Memory tab for memory by category, and the Network tab for remote traffic. Change one thing, measure again.
    Done right: "Script time in CollectibleService: 3.1 ms → 0.4 ms per frame after merging loops."
    Done wrong: rewriting a system "for speed" without measuring it.

64. **Use Parallel Luau and native code generation only for heavy, measured, independent work.** Actors with `task.desynchronize()` and `task.synchronize()` can spread independent computation (pathfinding batches, procedural generation, large simulations) across cores; `--!native` can speed up hot math-heavy modules. Both add complexity, so they need a profiler measurement showing the gain.
    Done right: terrain chunk generation in 4 Actors, measured 3x faster.
    Done wrong: `--!native` on every script "just in case".

### Testing and evidence

65. **Test in layers: pure functions in a Studio test run, services in Run mode, multiplayer in a 2+ player local server, devices in the emulator and on one real phone, and long sessions in a soak test.** Each layer finds different bugs. Formulas and validators are tested by the test runner; replication, ownership, trading, leaderboards, rate limits and leave saves need Test > Clients and Servers with 2 or more players.
    Done right: a release report with sections for each layer.
    Done wrong: one Play-mode session with one player.

66. **Every bug fix comes with a reproduction first: show it failing, fix it, show it passing.** Write the steps (or a test in the runner) that reproduce the bug before changing code. Keep the test so the bug can't silently return.
    Done right: "Repro: buy with qty 1.5 → granted. After fix: rejected. Test added: Validate.int rejects fractions."
    Done wrong: "Should be fixed now."

67. **Run the exploit tests from the client before every release.** In Play mode or a local server, switch the command bar to the client and fire every client-to-server remote with bad arguments: negative, zero, NaN (`0/0`), `math.huge`, fractions, huge strings, wrong types, tables, other players' instances, and 200 calls in a loop (script in "Testing"). The server must reject all of them with no errors and no state change.
    Done right: the exploit test log shows 14 remotes × 10 bad inputs, all rejected, Coins unchanged.
    Done wrong: testing only the happy path.

68. **Inject DataStore failures in Studio and prove the game survives them.** A `StoreAdapter` in Studio can fail a set share of calls (for example 30%). Load must retry or kick, saves must retry, purchases must stay unacknowledged until a save succeeds, and no default save may ever be written over real data.
    Done right: 30% injected failures for 20 minutes: no data loss, 2 polite kicks, purchases granted once.
    Done wrong: only testing when the DataStore works.

69. **Soak test for 30 minutes with joins, leaves and respawns, and prove memory and instance counts are flat.** Run a 2-3 player local server for 30+ minutes, respawning and rejoining, and record the Developer Console memory and the instance count every 5 minutes. Steady growth is a leak (Rule 11).
    Done right: client memory 410 → 418 → 415 MB over 30 minutes.
    Done wrong: memory rising 20 MB every 5 minutes, shipped anyway.

70. **Never report something as tested unless you ran it, and every claim has evidence.** Evidence is an Output excerpt, a screenshot, a measured number or a file path ([[00 For Any AI]]). Zero red errors in Output on every side, and zero errors in Script Analysis, are part of every handoff. Write down what couldn't be tested.
    Done right: "Tested: save matrix (evidence: reports/…/save.md). Not tested: real phone (no device available)."
    Done wrong: "All tested, works great."

## Step by step

### Skeleton of a new game, in 18 steps
1. **Architect** writes in `plan.md`: the module list (server services, client controllers), the remotes contract table, the save schema with defaults, the per-player keys list, and the flags list.
2. **Builder** creates the folders from "Folder layout" (empty), and nothing else in Workspace except `Workspace.Map` (Scenic's) and `Workspace.Drops` (runtime objects).
3. **Builder** creates `ReplicatedStorage.Shared.Config` with every section from `plan.md` (Shop, Pets, Worlds, Flags, Multipliers, GamePasses, Products, Badges, Events, Codes, Debug) and freezes it.
4. **Builder** creates `Shared/Types` with `PlayerSave` and the other shared shapes, and `Shared/RemoteNames` with the contract list.
5. **Builder** creates `ServerScriptService.Main` (the bootstrap in "Module architecture") and `StarterPlayerScripts.Main` (the client bootstrap).
6. **Builder** adds the core services in this order: `Remotes`, `RateLimit`, `PlayerData` (with `SaveDefaults` and `Migrations`), `Economy`, `StateSync`, `Analytics`, `LiveConfig`, `ConfigCheck`.
7. **Builder** adds a `Tests` folder in ServerScriptService with the runner, run from `Main` only when `RunService:IsStudio() and Config.Debug.RunTests`.
8. **Builder** sets the `StoreAdapter` so Studio can inject DataStore failures (`Config.Debug.DataStoreFailRate`, default 0).
9. **Builder** adds gameplay services one by one (for example `CollectibleService`, `ShopService`, `QuestService`), each with `Init`/`Start`, a flag and its remotes from the contract.
10. **Merchant** adds `ReceiptService` and `Products` (ProcessReceipt and grants) and `PassService` (ownership checks and perks).
11. **Frame** adds client controllers (`HudController`, `ShopController`, ...) that listen to `StateChanged` and fire intent remotes. No game logic on the client.
12. **Builder** sets `Workspace.StreamingEnabled` to true (the default in new places) and agrees with Scenic which models are Atomic or Persistent.
13. **Builder** runs Script Analysis: zero errors. Searches the place for `wait(`, `spawn(`, `delay(`: zero hits outside the `task.` forms.
14. **Playtest** runs Play (F5) and checks Output: `[Boot]` lines for every service, zero red errors.
15. **Playtest** runs Test > Clients and Servers with 2 players: joins, a purchase of an in-game item, a leave and rejoin, a server stop.
16. **Playtest** runs the exploit tests (see "Testing") against every remote.
17. **Reviewer** runs the security review (below) and writes the report.
18. **Producer** checks every report's evidence before the Build gate.

### Adding a remote, in 9 steps
1. Architect adds a row to the contract table: name, type, direction, arguments with types and ranges, server checks, rate limit.
2. Builder adds the name to `Shared/RemoteNames` (the server creates it at boot).
3. Builder writes the handler: rate limit → types → ranges → existence → ownership → distance → cooldown → cost → act (Rule 17), using the `Validate` helpers.
4. The handler calls `Economy` for any currency change and `PlayerData.Get` for state; never a DataStore.
5. The handler checks the system's flag first (Rule 13).
6. Any state change reaches the client through `StateSync` (Rule 8), not a reply on the same remote unless the contract says so.
7. Builder adds a test for any pure logic (cost formula, validation) to the runner.
8. Playtest adds the remote to the exploit test list and runs it.
9. Reviewer checks the handler against the contract row line by line.

### Adding a saved field, in 7 steps
1. Architect adds the field to the schema in `plan.md` with its type and default.
2. Builder adds it to `Shared/Types` (`PlayerSave`) and to `SaveDefaults`.
3. If it's a new field: done. Reconcile fills it on load for every existing player.
4. If it renames, reshapes or removes a field: add a migration step, bump `CURRENT_VERSION`, and keep the old field's data until the migration has copied it.
5. Playtest loads a save made by the live version (or a saved test fixture) and checks the migrated values.
6. Playtest checks the save size after a long session (Rule 30).
7. Reviewer confirms an older server would refuse to save the new version (Rule 27).

### Shipping a purchase, in 10 steps
1. Merchant designs the product in `plan.md` ([[09 Shops and Monetization]]) and asks the owner (through the Lead) to create it and set the price.
2. Builder or Merchant adds the ID to `Config.Products` (or `Config.GamePasses`). `ConfigCheck` must show it as real.
3. Merchant adds the grant function to `Products`: it changes the session table through `Economy` and returns `true` only if it granted.
4. The grant is idempotent by `PurchaseId` through `ReceiptService` (Rule 33).
5. The client prompts with `MarketplaceService:PromptProductPurchase(player, id)` from a button; the client never grants.
6. Analytics logs the currency as `IAP` from the grant ([[12 Live Ops and Launch]]).
7. In the published place, the owner buys once: Playtest checks the grant, rejoins and checks nothing doubled.
8. The owner buys again and Playtest leaves during the prompt's processing; on rejoin, the grant arrives once.
9. Playtest runs the injected-failure test (Rule 68): with saves failing, the purchase stays unacknowledged until a save succeeds.
10. Reviewer signs the purchase review with the evidence.

### Performance pass, in 11 steps
1. Playtest starts a 2-player local server and opens the Developer Console (F9) on one client and the server view.
2. Record client FPS, client memory, server memory, server heartbeat and the instance count at 1 minute.
3. Play the busiest scenario (the most drops, NPCs, players and effects at once) for 10 minutes.
4. Record the same numbers at 10 and 30 minutes (Rule 69).
5. Open the MicroProfiler (Ctrl+F6) during the busiest moment and note the longest frames.
6. Open the Script Profiler and list the top 5 scripts by time.
7. Open the Network tab and note the heaviest remotes by data per second.
8. Run the Device Emulator on a small phone profile and, if available, one real low-end phone.
9. Compare with the budget table in "Performance". List every miss.
10. Fix the biggest miss first (Rule 63), then re-measure.
11. Write `reports/<date>-performance.md` with the before and after numbers.

### Security review, in 14 steps (Reviewer)
1. List every remote from `ReplicatedStorage.Remotes` and compare with the contract table: no extras, no missing rows.
2. For each client-to-server remote, read the handler and confirm the check order (Rule 17).
3. Confirm every handler has a rate limit matching the contract.
4. Search for client-trusted values: any handler argument used as an amount, price, damage, reward, time or result (Rule 41).
5. Confirm `Economy` is the only place balances change (search for `Currencies` writes outside it).
6. Confirm `ProcessReceipt` is set once, records `PurchaseId` and acknowledges only after a successful save (Rule 33).
7. Confirm saves use `UpdateAsync` with the lock check, never `SetAsync` (Rules 23, 25).
8. Confirm text shown to other players is filtered (Rule 46).
9. Confirm admin handlers check UserId or group rank on the server (Rule 47).
10. Search the whole place for `require(` followed by a number, `getfenv`, `setfenv`, `loadstring` and `HttpService` (Rule 49).
11. Confirm no secrets or server logic are in replicated containers (Rule 48).
12. Confirm important unanchored parts have server network ownership (Rule 45).
13. Read Playtest's exploit test log: every bad input rejected, no errors.
14. Write `reports/<date>-review.md`: pass or fail per item, with file paths and line numbers for every problem.

### Release test pass, in 12 steps (Playtest)
1. Pull the current place state; note the version (`Config.Version`) in the report.
2. Play (F5): Output clean, every `[Boot]` line present.
3. Run the test runner (Studio, `Config.Debug.RunTests = true`): all pass.
4. Test > Clients and Servers, 2 players: core loop, purchase of in-game items, trading (if any), leaderboards.
5. Save matrix ([[12 Live Ops and Launch]] "Shipping an update"): autosave, leave, stop server, hop, newer-version save.
6. Old-save test: load a fixture saved by the live version; check every migrated value.
7. Exploit tests on every remote.
8. Injected DataStore failures at 30% for 10 minutes.
9. Device Emulator: a small phone and a tablet; touch-only first session ([[08 Mobile]]).
10. Soak test 30 minutes; memory and instance counts recorded.
11. Simulated lag (Studio Settings > Network > Incoming Replication Lag, for example 0.3 s) for the core loop and purchases.
12. Write `reports/<date>-release-<version>.md` with evidence for each step, and what wasn't tested.

## Folder layout
```
ReplicatedFirst/            loading screen LocalScript only
ReplicatedStorage/
  Shared/                   ModuleScripts for both sides: Config (all tunables + IDs), Types, RemoteNames,
                            Formulas (pure math), Util
  Remotes/                  one RemoteEvent / RemoteFunction / UnreliableRemoteEvent per contract row
  Assets/                   models and effects the client clones (Librarian)
ServerScriptService/
  Main (Script)             the single server entry point
  Services/                 ModuleScripts: PlayerData, SaveDefaults, Migrations, StoreAdapter, Economy,
                            StateSync, RateLimit, Analytics, LiveConfig, ShopService, ReceiptService, ...
  Tests/                    test runner and *.spec ModuleScripts (run only in Studio)
ServerStorage/
  Assets/  Templates/       server-only models: enemies, drops, tools cloned at runtime
  Config/                   server-only tables (secret odds, admin lists)
StarterPlayer/
  StarterPlayerScripts/
    Main (LocalScript)      the single client entry point
    Controllers/            ModuleScripts: InputController, HudController, ShopController, ...
  StarterCharacterScripts/  per-character LocalScripts (rarely needed)
StarterGui/                 ScreenGuis (ResetOnSpawn = false for HUDs); logic lives in controllers (Frame)
Workspace/
  Map/                      world geometry only, no loose Scripts (Scenic)
  Drops/                    runtime objects created by the server
```
- Names are PascalCase for instances and modules, camelCase for locals and functions, UPPER_SNAKE_CASE for constants.
- Every log line starts with the system name in brackets: `[Shop]`, `[PlayerData]`, `[Receipts]`.
- `Config.Version = "1.4.0"` is shown in the settings screen, so bug reports name the version.

## Module architecture
- One entry Script per side requires the modules in a known order and calls `Init()` on each, then `Start()` (Rule 2).
- A module returns one table, has no side effects at require time, and doesn't require modules that require it back (Rule 3).
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

### Server bootstrap
```lua
--!strict
-- ServerScriptService/Main: the only server Script.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local ServerScriptService = game:GetService("ServerScriptService")

local Config = require(ReplicatedStorage.Shared.Config)
local Services = ServerScriptService.Services

-- Order matters: each service may use the ones above it in Init.
local ORDER = {
	"Remotes", "RateLimit", "ConfigCheck", "LiveConfig", "PlayerData", "Economy", "StateSync",
	"Analytics", "Events", "CollectibleService", "ShopService", "ReceiptService", "PassService", "JoinService",
}

local started = os.clock()
local modules: {[string]: any} = {}
for _, name in ORDER do
	local moduleScript = Services:FindFirstChild(name)
	assert(moduleScript and moduleScript:IsA("ModuleScript"), `[Boot] missing service {name}`)
	modules[name] = require(moduleScript)
end
for _, name in ORDER do
	local m = modules[name]
	if m.Init then m.Init() end
end
for _, name in ORDER do
	local m = modules[name]
	if m.Start then task.spawn(m.Start) end -- one service erroring in Start doesn't stop the others
end
print(`[Boot] {#ORDER} services started in {string.format("%.2f", os.clock() - started)} s`)

if RunService:IsStudio() and Config.Debug.RunTests then
	require(ServerScriptService.Tests.RunAll)()
end
```

### Client bootstrap
```lua
--!strict
-- StarterPlayer/StarterPlayerScripts/Main: the only client LocalScript (besides ReplicatedFirst).
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Controllers = script.Parent:WaitForChild("Controllers")
ReplicatedStorage:WaitForChild("Remotes") -- created by the server at boot

local ORDER = { "StateClient", "InputController", "HudController", "ShopController", "NotifyOptInController" }
local modules: {[string]: any} = {}
for _, name in ORDER do
	local moduleScript = Controllers:WaitForChild(name, 10)
	assert(moduleScript and moduleScript:IsA("ModuleScript"), `[Boot] missing controller {name}`)
	modules[name] = require(moduleScript)
end
for _, name in ORDER do
	if modules[name].Init then modules[name].Init() end
end
for _, name in ORDER do
	if modules[name].Start then task.spawn(modules[name].Start) end
end
```

### A service template
```lua
--!strict
-- ServerScriptService/Services/ExampleService
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)
local Economy = require(script.Parent.Economy)
local RateLimit = require(script.Parent.RateLimit)
local LiveConfig = require(script.Parent.LiveConfig)
local Remotes = require(script.Parent.Remotes)

local ExampleService = {}

function ExampleService.Init()
	-- local state only; no events, no loops
end

function ExampleService.Start()
	Remotes.get("DoExample").OnServerEvent:Connect(function(player: Player, arg: unknown)
		if not LiveConfig.flag("Example") then return end
		if not RateLimit.allow(player, "DoExample", 5, 1) then return end
		-- validate arg, then act through Economy / PlayerData
	end)
end

return ExampleService
```

### Freezing Config
```lua
--!strict
-- At the bottom of ReplicatedStorage/Shared/Config
local function deepFreeze(t: {[any]: any}): {[any]: any}
	for _, v in t do
		if type(v) == "table" and not table.isfrozen(v) then deepFreeze(v) end
	end
	return table.freeze(t)
end
return deepFreeze(Config)
```
Writing to a frozen table errors, so an accidental `Config.Shop.Items.Sword.Price = 0` shows up as a red error in testing instead of a silent bug.

### Creating the remotes from the contract
```lua
--!strict
-- ServerScriptService/Services/Remotes
-- Shared/RemoteNames = { Events = {"BuyItem", "EquipPet", ...}, Functions = {"GetShopState"}, Unreliable = {"HitFx"} }
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RemoteNames = require(ReplicatedStorage.Shared.RemoteNames)

local Remotes = {}
local folder: Folder

local function make(className: string, name: string)
	local existing = folder:FindFirstChild(name)
	if existing then
		assert(existing.ClassName == className, `[Remotes] {name} must be a {className}`)
		return
	end
	local remote = Instance.new(className)
	remote.Name = name
	remote.Parent = folder -- Parent last
end

function Remotes.Init()
	local existing = ReplicatedStorage:FindFirstChild("Remotes")
	if existing and existing:IsA("Folder") then
		folder = existing
	else
		folder = Instance.new("Folder")
		folder.Name = "Remotes"
		folder.Parent = ReplicatedStorage
	end
	for _, name in RemoteNames.Events do make("RemoteEvent", name) end
	for _, name in RemoteNames.Functions do make("RemoteFunction", name) end
	for _, name in RemoteNames.Unreliable do make("UnreliableRemoteEvent", name) end
end

function Remotes.get(name: string): any
	local remote = folder:FindFirstChild(name)
	assert(remote, `[Remotes] {name} is not in the contract`)
	return remote
end

return Remotes
```

## Remotes contract table
Architect writes each game's table in `plan.md` **before** code exists. Reviewer rejects any remote that isn't in it.

| Remote | Type | Dir | Args | Server checks | Limit (burst, per s) |
|---|---|---|---|---|---|
| BuyItem | RemoteEvent | C→S | itemId: string, qty: number | flag on, item exists, qty integer 1-99, can afford | 5, 1 |
| EquipPet | RemoteEvent | C→S | petUid: string | uid owned by player, slot free | 10, 2 |
| Interact | RemoteEvent | C→S | target: Instance | tagged, owner matches, ≤ 12 studs | 4, 2 |
| ClaimDaily | RemoteEvent | C→S | (none) | server day index not claimed | 2, 0.2 |
| RedeemCode | RemoteEvent | C→S | code: string | 1-24 chars, exists, in date, unused | 3, 0.2 |
| TradeOffer | RemoteEvent | C→S | targetUserId: number, offer: {[string]: number} | flag on, target in server, ≤ 12 entries, owned | 2, 0.5 |
| Fire | RemoteEvent | C→S | origin: Vector3, direction: Vector3 | weapon equipped, fire rate, origin ≤ 10 studs, server raycast | 10, 10 |
| GetShopState | RemoteFunction | C→S | (none) | returns a snapshot from memory, never yields long | 2, 0.5 |
| StateChanged | RemoteEvent | S→C | delta table | n/a | server batches ≤ 10 Hz |
| CodeResult | RemoteEvent | S→C | status: string | n/a | n/a |
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
	if not Economy.spend(player, "Coins", cost, `Shop_{itemId}`) then return end -- checks balance, logs, syncs
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
Why each check matters:
- `qty ~= qty` catches NaN, which fails every comparison and can slip past `qty < 1`.
- `qty % 1 ~= 0` rejects fractions and also infinity (`math.huge % 1` is NaN).
- `#itemId > 40` stops huge strings before any table lookup.
- `target:IsA` and `HasTag` reject instances the exploiter points at that aren't meant to be used.
- Ownership and distance stop a player using someone else's plot or a button across the map.

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

function RateLimit.Start()
	-- Connected in Start, not at require time (Rule 3).
	Players.PlayerRemoving:Connect(function(player) buckets[player] = nil end)
end

return RateLimit
```
Drop over-limit calls silently. Log repeated abuse at most once per player per minute, and don't kick on the first spike, because lag bursts happen.

## DataStore patterns
- **Load with retries** (pcall plus exponential backoff). If loading still fails, **never** hand out a fresh save that could overwrite the real one: kick with "Couldn't load your data, please rejoin" (Rule 22).
- **Session lock:** load through `UpdateAsync` and stamp `{JobId = game.JobId, Time = os.time()}`. If another live server holds a recent lock (the player just hopped servers), wait and retry. Every save refreshes the lock, so treat a lock older than a few autosave intervals (for example 5-10 minutes) as stale, left behind by a crashed server (Rule 23).
- **Session cache:** gameplay reads and writes a table in memory (`PlayerData.Get(player)`). DataStores are touched only on load, autosave, purchase, leave and shutdown (Rule 24).
- **Save with `UpdateAsync`**, not `SetAsync`, and abort the write if the lock belongs to another server. Return `true` only when the write actually happened, because `ProcessReceipt` depends on it ([[09 Shops and Monetization]]).
- **Autosave** every 1-3 minutes (rule of thumb), staggered across players. Save on `PlayerRemoving` (release the lock) and in `game:BindToClose`, in parallel with a deadline ([[12 Live Ops and Launch]]). Make saving idempotent so both paths can run.
- **Versioned schema:** `Version` field, ordered migrations, defaults reconciled on load, never save over a newer version.
- **Budget awareness:** check `DataStoreService:GetRequestBudgetForRequestType(Enum.DataStoreRequestType.UpdateAsync)` before optional writes. Roblox throttles frequent writes to the same key (roughly one every several seconds), and keys have a size limit, so keep saves small. "Request was added to queue" warnings mean you're writing too often.
- Only save plain data: numbers, strings, booleans and tables with string keys or dense array indices. No Instances, Vector3s or CFrames (store them as numbers).
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
The full module below builds on this function.

### Platform limits to design around (verify the current numbers on Creator Hub before relying on them)
| Service | Limit (as documented at the time of writing) | Design rule |
|---|---|---|
| DataStore value size | About 4 MB per key, encoded | Keep player saves under 100 KB (studio target) |
| DataStore same-key writes | About one write per key every 6 seconds | Autosave every 120 s; never save on every change |
| DataStore request budget | Per server per minute, grows with players (about 60 + 10 × players for gets and for sets) | Check `GetRequestBudgetForRequestType` before optional writes |
| DataStore names | Store names and keys up to 50 characters | `PlayerData_v1`, `Player_<UserId>` |
| DataStore versions | Old versions kept for a limited time (about 30 days) | Restore tools ready (Rule 37) |
| OrderedDataStore sorted reads | Much smaller budget than normal reads | Read top lists every few minutes and cache |
| MemoryStore | Items up to about 32 KB, expiry up to about 45 days, memory and request quotas that scale with users | Always set an expiry; batch writes |
| MessagingService | Messages up to about 1 KB, best-effort delivery, send and subscribe quotas per server | Send hints ("refresh"), never must-arrive values |
| BindToClose | About 30 seconds before shutdown | Parallel saves with a 25 s deadline |

### Save schema (Types and defaults)
```lua
--!strict
-- ReplicatedStorage/Shared/Types
export type PetRecord = { Id: string, Level: number, Shiny: boolean }

export type PlayerSave = {
	Version: number,
	Currencies: {[string]: number},          -- "Coins" -> 1250
	Inventory: {[string]: number},           -- itemId -> count (stackables)
	Pets: {[string]: PetRecord},             -- uid -> record (uniques)
	Equipped: {[string]: boolean},           -- uid -> true
	Receipts: {[string]: number},            -- PurchaseId -> os.time()
	PassesOwned: {[string]: boolean},        -- tostring(passId) -> true (fallback cache)
	RedeemedCodes: {[string]: number},       -- code -> os.time()
	Onboarding: { Logged: {[string]: boolean} },
	Stats: { Sessions: number, FirstJoin: number, PlaySeconds: number, TotalCoins: number },
	Referral: { Day: number, Count: number },
	ReferredBy: number?,
	EventsConverted: {[string]: boolean},
	Experiments: {[string]: number},
	Settings: { Music: boolean, Sfx: boolean },
	Lock: { JobId: string, Time: number }?,
}

return {}
```
```lua
--!strict
-- ServerScriptService/Services/SaveDefaults: the template every save is reconciled against.
return {
	Version = 3,
	Currencies = { Coins = 0, Gems = 0 },
	Inventory = {},
	Pets = {},
	Equipped = {},
	Receipts = {},
	PassesOwned = {},
	RedeemedCodes = {},
	Onboarding = { Logged = {} },
	Stats = { Sessions = 0, FirstJoin = 0, PlaySeconds = 0, TotalCoins = 0 },
	Referral = { Day = 0, Count = 0 },
	EventsConverted = {},
	Experiments = {},
	Settings = { Music = true, Sfx = true },
}
```
A ModuleScript must return exactly one value, which is why `Types` ends with `return {}`; other modules use it with `local Types = require(ReplicatedStorage.Shared.Types)` and `Types.PlayerSave`. Empty tables in the defaults are collections: reconcile creates them when missing but never fills their contents.

### Migrations
```lua
--!strict
-- ServerScriptService/Services/Migrations
local Defaults = require(script.Parent.SaveDefaults)
local CURRENT_VERSION: number = Defaults.Version

local steps: {[number]: (any) -> ()} = {
	[1] = function(d) -- v1 -> v2: coins moved into Currencies
		d.Currencies = d.Currencies or {}
		d.Currencies.Coins = (d.Currencies.Coins or 0) + (d.Coins or 0)
		d.Coins = nil
	end,
	[2] = function(d) -- v2 -> v3: Diamonds renamed to Gems
		d.Currencies.Gems = (d.Currencies.Gems or 0) + (d.Currencies.Diamonds or 0)
		d.Currencies.Diamonds = nil
	end,
}

local Migrations = {}

-- Returns false when the save is newer than this server understands: do not use or save it.
function Migrations.run(d: any): boolean
	d.Version = d.Version or 1
	if d.Version > CURRENT_VERSION then return false end
	while d.Version < CURRENT_VERSION do
		local step = steps[d.Version]
		assert(step, `[Migrations] no step from v{d.Version}`)
		step(d)
		d.Version += 1
	end
	return true
end

return Migrations
```

### The full PlayerData module
```lua
--!strict
-- ServerScriptService/Services/PlayerData
-- Retries + session lock on load, in-memory session cache, staggered autosave,
-- release on leave, parallel saves in BindToClose. The only module that talks to the player store.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Types = require(ReplicatedStorage.Shared.Types)
local Defaults = require(script.Parent.SaveDefaults)
local Migrations = require(script.Parent.Migrations)
local StoreAdapter = require(script.Parent.StoreAdapter)

type PlayerSave = Types.PlayerSave

local STORE_NAME = if RunService:IsStudio() then "PlayerData_Studio_v1" else "PlayerData_v1"
local MAX_LOAD_ATTEMPTS = 6
local LOCK_STALE_SECONDS = 600   -- 5 missed autosaves: the old server is gone
local AUTOSAVE_SECONDS = 120
local MAX_RECEIPTS = 100
local SHUTDOWN_DEADLINE = 25

local store: any
local sessions: {[Player]: PlayerSave} = {}
local saving: {[Player]: boolean} = {}
local nextSave: {[Player]: number} = {}
local loadedEvent = Instance.new("BindableEvent")

local PlayerData = {}
PlayerData.Loaded = loadedEvent.Event -- (player, data) after a successful load

local function key(userId: number): string
	return `Player_{userId}`
end

local function deepCopy(value: any): any
	if type(value) ~= "table" then return value end
	local out = {}
	for k, v in value do out[k] = deepCopy(v) end
	return out
end

local function reconcile(target: {[any]: any}, template: {[any]: any})
	for k, v in template do
		if target[k] == nil then
			target[k] = deepCopy(v)
		elseif type(v) == "table" and type(target[k]) == "table" and next(v) ~= nil then
			reconcile(target[k], v)
		end
	end
end

type LoadResult = "ok" | "locked" | "newer" | "error"

local function tryLoad(player: Player): (LoadResult, PlayerSave?)
	local result: LoadResult = "error"
	local loaded: PlayerSave? = nil
	local ok, err = pcall(function()
		store:UpdateAsync(key(player.UserId), function(old: any)
			-- This function can run more than once; set every upvalue on every path.
			local data = if type(old) == "table" then old else deepCopy(Defaults)
			local lock = data.Lock
			if lock and lock.JobId ~= game.JobId and os.time() - lock.Time < LOCK_STALE_SECONDS then
				result, loaded = "locked", nil
				return nil -- another live server owns this save: cancel the write
			end
			if not Migrations.run(data) then
				result, loaded = "newer", nil
				return nil -- made by a newer version: never write it
			end
			reconcile(data, Defaults)
			data.Lock = { JobId = game.JobId, Time = os.time() }
			result, loaded = "ok", data
			return data, { player.UserId } -- user IDs for data-deletion requests (Rule 32)
		end)
	end)
	if not ok then
		warn(`[PlayerData] load error for {player.UserId}: {err}`)
		return "error", nil
	end
	return result, loaded
end

local function write(player: Player, release: boolean): boolean
	local data = sessions[player]
	if not data then return false end -- never loaded: never save
	local wrote = false
	local ok, err = pcall(function()
		store:UpdateAsync(key(player.UserId), function(old: any)
			wrote = false
			if type(old) == "table" and old.Lock and old.Lock.JobId ~= game.JobId then
				return nil -- not our lock any more: abort
			end
			data.Lock = if release then nil else { JobId = game.JobId, Time = os.time() }
			wrote = true
			return data, { player.UserId }
		end)
	end)
	if not ok then warn(`[PlayerData] save error for {player.UserId}: {err}`) end
	return ok and wrote
end

function PlayerData.Get(player: Player): PlayerSave?
	return sessions[player]
end

function PlayerData.all(): {[Player]: PlayerSave}
	return sessions -- read-only by convention
end

-- Saves now. Waits for a save already running for this player. Returns true only if written.
function PlayerData.Save(player: Player, release: boolean?): boolean
	while saving[player] do task.wait(0.1) end
	if not sessions[player] then return true end -- already released by another path
	saving[player] = true
	local ok = false
	for attempt = 1, 3 do
		ok = write(player, release == true)
		if ok then break end
		task.wait(attempt * 2)
	end
	saving[player] = nil
	return ok
end

function PlayerData.SaveAndRelease(player: Player): boolean
	if not sessions[player] then return true end
	nextSave[player] = nil
	local ok = PlayerData.Save(player, true)
	if not ok then warn(`[PlayerData] FINAL SAVE FAILED for {player.UserId}`) end
	sessions[player] = nil
	return ok
end

function PlayerData.recordReceipt(data: PlayerSave, purchaseId: string)
	data.Receipts[purchaseId] = os.time()
	local count, oldestId, oldestTime = 0, nil :: string?, math.huge
	for id, t in data.Receipts do
		count += 1
		if t < oldestTime then oldestId, oldestTime = id, t end
	end
	if count > MAX_RECEIPTS and oldestId then
		data.Receipts[oldestId] = nil -- only acknowledged receipts are this old
	end
end

local function load(player: Player)
	for attempt = 1, MAX_LOAD_ATTEMPTS do
		if player.Parent == nil then return end -- left while we were loading
		local result, data = tryLoad(player)
		if result == "ok" and data then
			sessions[player] = data
			if player.Parent == nil then
				PlayerData.SaveAndRelease(player) -- left during the load: release our lock
				return
			end
			data.Stats.Sessions += 1
			if data.Stats.FirstJoin == 0 then data.Stats.FirstJoin = os.time() end
			nextSave[player] = os.clock() + AUTOSAVE_SECONDS + math.random() * 30 -- stagger
			loadedEvent:Fire(player, data)
			return
		elseif result == "newer" then
			player:Kick("A new update is out! Please rejoin to play it.")
			return
		end
		task.wait(math.min(2 ^ attempt, 15) + math.random()) -- "locked" or "error": back off
	end
	player:Kick("We couldn't load your data. Your progress is safe. Please rejoin in a minute.")
end

PlayerData.reload = load -- used after a failed teleport released the session

function PlayerData.Init()
	store = StoreAdapter.get(STORE_NAME)
end

function PlayerData.Start()
	Players.PlayerAdded:Connect(load)
	for _, player in Players:GetPlayers() do task.spawn(load, player) end

	Players.PlayerRemoving:Connect(function(player)
		PlayerData.SaveAndRelease(player)
	end)

	task.spawn(function() -- one autosave loop for everyone
		while true do
			task.wait(5)
			local now = os.clock()
			for player, due in nextSave do
				if now >= due then
					nextSave[player] = now + AUTOSAVE_SECONDS
					task.spawn(PlayerData.Save, player, false)
				end
			end
		end
	end)

	game:BindToClose(function()
		local pending = 0
		for _, player in Players:GetPlayers() do
			pending += 1
			task.spawn(function()
				PlayerData.SaveAndRelease(player) -- no-op if PlayerRemoving already did it
				pending -= 1
			end)
		end
		local deadline = os.clock() + SHUTDOWN_DEADLINE
		while pending > 0 and os.clock() < deadline do
			task.wait(0.1)
		end
	end)
end

return PlayerData
```
Notes on this module:
- `UpdateAsync` may call the transform more than once, so the transform sets every upvalue on every path and has no other side effects.
- A player who leaves during loading still gets the lock released, because `load` checks `player.Parent` after the load returns.
- A failed final save leaves the lock in place. It becomes stale after `LOCK_STALE_SECONDS`, and in the meantime the player's next server retries and, if needed, kicks politely. Never lower the stale time below a few autosave intervals.
- The module never writes `Defaults` unless the key is truly empty (`old` is nil), so an outage can't overwrite a real save.

### Economy: the only place balances change
```lua
--!strict
-- ServerScriptService/Services/Economy
local PlayerData = require(script.Parent.PlayerData)
local Analytics = require(script.Parent.Analytics)
local StateSync = require(script.Parent.StateSync)

local Economy = {}
local TX = Enum.AnalyticsEconomyTransactionType

function Economy.add(player: Player, currency: string, amount: number, sku: string,
	txType: Enum.AnalyticsEconomyTransactionType?): boolean
	local data = PlayerData.Get(player)
	if not data or amount <= 0 or amount ~= amount or amount % 1 ~= 0 then return false end
	local balance = (data.Currencies[currency] or 0) + amount
	data.Currencies[currency] = balance
	if currency == "Coins" then data.Stats.TotalCoins += amount end
	Analytics.source(player, currency, amount, balance, txType or TX.Gameplay, sku)
	StateSync.mark(player, "Currencies")
	return true
end

function Economy.spend(player: Player, currency: string, amount: number, sku: string,
	txType: Enum.AnalyticsEconomyTransactionType?): boolean
	local data = PlayerData.Get(player)
	if not data or amount <= 0 or amount ~= amount or amount % 1 ~= 0 then return false end
	local balance = data.Currencies[currency] or 0
	if balance < amount then return false end
	balance -= amount
	data.Currencies[currency] = balance
	Analytics.sink(player, currency, amount, balance, txType or TX.Shop, sku)
	StateSync.mark(player, "Currencies")
	return true
end

-- Grants a reward table such as { Coins = 500, Gems = 5 }.
function Economy.grant(player: Player, reward: {[string]: number}, sku: string,
	txType: Enum.AnalyticsEconomyTransactionType?)
	for currency, amount in reward do
		Economy.add(player, currency, amount, sku, txType)
	end
end

return Economy
```

### StateSync: batched server→client state
```lua
--!strict
-- ServerScriptService/Services/StateSync: collects changed sections, sends one delta per player at 10 Hz.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local PlayerData = require(script.Parent.PlayerData)
local Remotes = require(script.Parent.Remotes)

local StateSync = {}
local dirty: {[Player]: {[string]: boolean}} = {}
local SEND_INTERVAL = 0.1

function StateSync.mark(player: Player, section: string)
	local d = dirty[player]
	if not d then d = {}; dirty[player] = d end
	d[section] = true
end

function StateSync.Start()
	local remote = Remotes.get("StateChanged")
	PlayerData.Loaded:Connect(function(player: Player, data: any)
		remote:FireClient(player, { Full = true, Currencies = data.Currencies, Inventory = data.Inventory, Pets = data.Pets })
	end)
	Players.PlayerRemoving:Connect(function(player) dirty[player] = nil end)

	local acc = 0
	RunService.Heartbeat:Connect(function(dt)
		acc += dt
		if acc < SEND_INTERVAL then return end
		acc = 0
		for player, sections in dirty do
			local data = PlayerData.Get(player)
			if data then
				local delta: {[string]: any} = {}
				for section in sections do delta[section] = (data :: any)[section] end
				remote:FireClient(player, delta)
			end
			dirty[player] = nil -- clearing a key during traversal is allowed
		end
	end)
end

return StateSync
```
For large sections (an inventory of 300 pets), send per-item changes instead of the whole section, so each update stays a few hundred bytes.

### Restoring a save (the owner runs this; agents prepare it)
```lua
-- Studio command bar, server context, in the published place with API access.
-- Names the LIVE store on purpose. The player must be offline (the lock is empty or stale).
local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("PlayerData_v1")
local key = "Player_12345678"

local pages = store:ListVersionsAsync(key, Enum.SortDirection.Descending)
for _, info in pages:GetCurrentPage() do
	print(info.Version, DateTime.fromUnixTimestampMillis(info.CreatedTime):ToIsoDate(), info.IsDeleted)
end

-- After choosing the version from just before the bug:
-- local old = store:GetVersionAsync(key, "<version from the list>")
-- print(game:GetService("HttpService"):JSONEncode(old))  -- inspect it first
-- store:UpdateAsync(key, function() old.Lock = nil; return old end)
```
Write every restore in `liveops.md`: the UserId, the version used, the time and who approved it ([[12 Live Ops and Launch]]).

## Purchases
### ProcessReceipt idempotency
Use exactly one callback. Record `PurchaseId` in the player's save alongside the grant, return `PurchaseGranted` only after `save()` returns true, and return `NotProcessedYet` otherwise. Product design and pricing are in [[09 Shops and Monetization]].
```lua
--!strict
-- ServerScriptService/Services/ReceiptService (Merchant)
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local PlayerData = require(script.Parent.PlayerData)
local Products = require(script.Parent.Products) -- [productId] = function(player): boolean

local ReceiptService = {}
local Decision = Enum.ProductPurchaseDecision

local function processReceipt(receiptInfo: {[string]: any}): Enum.ProductPurchaseDecision
	local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
	if not player then
		return Decision.NotProcessedYet -- Roblox retries later, for example when they rejoin
	end
	local data = PlayerData.Get(player)
	if not data then
		return Decision.NotProcessedYet -- save not loaded yet
	end
	local purchaseId = tostring(receiptInfo.PurchaseId)
	if data.Receipts[purchaseId] then
		-- Granted before. Acknowledge only once that grant is safely saved.
		return if PlayerData.Save(player) then Decision.PurchaseGranted else Decision.NotProcessedYet
	end
	local grant = Products[receiptInfo.ProductId]
	if not grant then
		warn(`[Receipts] unknown product {receiptInfo.ProductId}`)
		return Decision.NotProcessedYet
	end
	local ok, granted = pcall(grant, player)
	if not ok or not granted then
		warn(`[Receipts] grant failed for {receiptInfo.ProductId}: {granted}`)
		return Decision.NotProcessedYet
	end
	PlayerData.recordReceipt(data, purchaseId)
	if PlayerData.Save(player) then
		return Decision.PurchaseGranted
	end
	-- The grant and its receipt are in memory together; the next successful save stores both,
	-- and Roblox's retry then sees the receipt and acknowledges without granting twice.
	return Decision.NotProcessedYet
end

function ReceiptService.Init()
	MarketplaceService.ProcessReceipt = processReceipt -- the only assignment in the whole game
end

return ReceiptService
```
```lua
--!strict
-- ServerScriptService/Services/Products: one grant function per developer product.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Economy = require(script.Parent.Economy)
local Boosts = require(script.Parent.Boosts)

local IAP = Enum.AnalyticsEconomyTransactionType.IAP

local Products: {[number]: (Player) -> boolean} = {
	[Config.Products.Coins1000] = function(player)
		return Economy.add(player, "Coins", 1000, "Coins1000", IAP)
	end,
	[Config.Products.Luck2x10m] = function(player)
		return Boosts.add(player, "Luck2x", 600)
	end,
}

return Products
```

### Game passes
```lua
--!strict
-- ServerScriptService/Services/PassService (Merchant)
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)

local PassService = {}
local owned: {[Player]: {[number]: boolean}} = {}

local function setOwned(player: Player, passId: number)
	owned[player] = owned[player] or {}
	owned[player][passId] = true
	local data = PlayerData.Get(player)
	if data then data.PassesOwned[tostring(passId)] = true end -- fallback cache
	player:SetAttribute(`Pass_{passId}`, true) -- the client shows perks; the server enforces them
end

function PassService.has(player: Player, passId: number): boolean
	return owned[player] ~= nil and owned[player][passId] == true
end

function PassService.Start()
	PlayerData.Loaded:Connect(function(player: Player, data: any)
		for _, passId in Config.GamePasses do
			local ok, has = pcall(function()
				return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
			end)
			if (ok and has) or (not ok and data.PassesOwned[tostring(passId)]) then
				setOwned(player, passId)
			end
		end
	end)
	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, wasPurchased)
		if wasPurchased then setOwned(player, passId) end
	end)
	game:GetService("Players").PlayerRemoving:Connect(function(player) owned[player] = nil end)
end

return PassService
```

## Leaderboards, MemoryStore, MessagingService and teleports

### Global leaderboard with an OrderedDataStore
```lua
--!strict
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local PlayerData = require(script.Parent.PlayerData)

local Leaderboard = {}
local board = DataStoreService:GetOrderedDataStore(if RunService:IsStudio() then "TopCoins_Studio" else "TopCoins_v1")
local names: {[number]: string} = {}
local top: {{userId: number, name: string, value: number}} = {}

function Leaderboard.top()
	return top -- the board UI reads this snapshot through a remote or attributes
end

local function pushScores()
	for player, data in PlayerData.all() do
		if DataStoreService:GetRequestBudgetForRequestType(Enum.DataStoreRequestType.SetIncrementSortedAsync) > 5 then
			pcall(function()
				board:SetAsync(`Player_{player.UserId}`, math.floor(data.Stats.TotalCoins))
			end)
		end
		task.wait(1) -- spread writes
	end
end

local function readTop()
	local ok, pages = pcall(function() return board:GetSortedAsync(false, 50) end)
	if not ok then return end
	local list = {}
	for _, entry in pages:GetCurrentPage() do
		local userId = tonumber(string.match(entry.key, "%d+")) or 0
		if not names[userId] then
			local okName, name = pcall(function() return Players:GetNameFromUserIdAsync(userId) end)
			names[userId] = if okName then name else "Player"
		end
		table.insert(list, { userId = userId, name = names[userId], value = entry.value })
	end
	top = list
end

function Leaderboard.Start()
	task.spawn(function()
		while true do
			readTop()
			task.wait(180)
			pushScores()
		end
	end)
end

return Leaderboard
```

### A cross-server counter in a MemoryStore sorted map
```lua
--!strict
-- Community goal: every server adds its local total every 30 s.
local MemoryStoreService = game:GetService("MemoryStoreService")
local goal = MemoryStoreService:GetSortedMap("CommunityGoal_v1")
local EXPIRY = 7 * 24 * 3600 -- always set an expiry
local pendingLocal = 0

local CommunityGoal = {}

function CommunityGoal.add(amount: number)
	pendingLocal += amount -- no network call per action
end

function CommunityGoal.Start()
	task.spawn(function()
		while true do
			task.wait(30)
			if pendingLocal > 0 then
				local toSend = pendingLocal
				local ok = pcall(function()
					goal:UpdateAsync("total", function(old: any)
						return (if typeof(old) == "number" then old else 0) + toSend
					end, EXPIRY)
				end)
				if ok then pendingLocal -= toSend end -- keep it for the next try if it failed
			end
		end
	end)
end

return CommunityGoal
```

### A matchmaking queue (MemoryStore queue)
```lua
--!strict
local MemoryStoreService = game:GetService("MemoryStoreService")
local queue = MemoryStoreService:GetQueue("Arena1v1_v1")

-- Lobby server: add a player for up to 120 s.
local function enqueue(player: Player)
	pcall(function() queue:AddAsync({ userId = player.UserId }, 120) end)
end

-- One matchmaking loop (on lobby servers): read two, then remove them once a server is reserved.
local function matchOnce()
	local ok, items, readId = pcall(function()
		return queue:ReadAsync(2, true, 5) -- all or nothing, wait up to 5 s
	end)
	if not ok or not items or #items < 2 then return end
	-- reserve a server, teleport both (see below), then:
	pcall(function() queue:RemoveAsync(readId) end)
end
```
Items read but not removed return to the queue after the read's invisibility timeout, so a crashed matchmaker doesn't lose players.

### Teleports
```lua
--!strict
local TeleportService = game:GetService("TeleportService")
local PlayerData = require(script.Parent.PlayerData)

local Travel = {}

function Travel.sendToPlace(players: {Player}, placeId: number)
	for _, player in players do
		PlayerData.SaveAndRelease(player) -- release the lock first (Rule 39)
	end
	local options = Instance.new("TeleportOptions")
	options.ShouldReserveServer = true
	options:SetTeleportData({ mode = "Boss" }) -- passes through the client: never rewards or secrets
	local ok, err = pcall(function()
		return TeleportService:TeleportAsync(placeId, players, options)
	end)
	if not ok then warn(`[Teleport] failed: {err}`) end
end

function Travel.Start()
	TeleportService.TeleportInitFailed:Connect(function(player, result, message)
		warn(`[Teleport] {player.UserId} {result.Name}: {message}`)
		PlayerData.reload(player) -- the player is still here, but their session was released
	end)
end

return Travel
```
Every place in the same experience uses the same DataStores, so the destination loads the save normally. If a teleport fails after the save was released, the player must not keep playing on a released session: expose the module's `load` function as `PlayerData.reload` and call it, then show a retry button.

## Security

### Threat model
| Attack | What the exploiter does | Defense (rule) |
|---|---|---|
| Remote spam | Fires a remote thousands of times | Token bucket per player per remote (18) |
| Bad arguments | NaN, infinity, negatives, huge strings, wrong types | Validation order (17); `Validate` helpers |
| Client-trusted values | Sends a price, reward, damage or "won" flag | Server computes everything (41) |
| Speed, fly, teleport | Moves their own character anywhere | Server position sampling with tolerance (42) |
| Remote hit claims | "I hit that player from 300 studs" | Server raycast or range check (43) |
| Touch farming | Moves parts or their character onto rewards | Ownership, claimed flag, debounce (44) |
| Physics hijack | Moves client-owned unanchored parts | `SetNetworkOwner(nil)` (45) |
| Inappropriate text | Names a pet with banned words | `TextService` filtering (46) |
| Fake admin | Unhides the admin panel | Server-side admin check (47) |
| Stolen secrets | Reads replicated scripts | Secrets only on the server (48) |
| Backdoors | A free model with hidden `require(id)` | Script audit, LoadStringEnabled off (49) |
| Forged join data | Crafted teleport or launch data | Allowlists, caps (50) |
| Dupes on leave | Trades or purchases racing with leave | Atomic swaps, receipts, locks (33, 38) |
| Alt farming | Referral and daily rewards from alts | Caps per day, first-session rules ([[15 Discovery and Growth]]) |

### Exploit test script (run from the client command bar)
In Play mode or a local server, switch the Test tab's view to the client so the command bar runs on the client, then paste:
```lua
local R = game:GetService("ReplicatedStorage"):WaitForChild("Remotes")
local bad = { -1, 0, 0/0, math.huge, -math.huge, 1.5, 1e308, "1", string.rep("A", 100000), {}, { 1, 2, 3 }, true }
for _, value in bad do
	pcall(function() R.BuyItem:FireServer("Sword", value) end)
	pcall(function() R.BuyItem:FireServer(value, 1) end)
	pcall(function() R.RedeemCode:FireServer(value) end)
	pcall(function() R.EquipPet:FireServer(value) end)
end
for _ = 1, 200 do R.ClaimDaily:FireServer() end -- rate limit test
print("[ExploitTest] sent; now check server Output and the player's balances")
```
Pass criteria: no red errors on the server, no change to balances or inventory beyond what one legitimate call allows, and the rate limiter dropping the spam. Add a line for every new remote.

### Free-model and plugin audit, in 7 steps (Librarian and Reviewer)
1. Insert the asset into an empty test place, never straight into the game.
2. In the Explorer, search the asset for `Script`, `LocalScript` and `ModuleScript` (filter by class).
3. Read every script. Reject on `require(` with a number, `getfenv`, `setfenv`, `loadstring`, obfuscated strings, `InsertService`, unexpected `HttpService`, `TeleportService` or `MarketplaceService` calls.
4. Delete every script that isn't needed. Art models keep zero scripts ([[07 Characters, VFX and Assets]]).
5. Check welds, values and attributes for hidden data; check meshes for absurd triangle counts.
6. Record the asset in the library with `cli.mjs asset add`, noting "scripts removed" or "scripts reviewed".
7. Only then copy it into the game.

### Filtering player text
```lua
--!strict
local TextService = game:GetService("TextService")

-- Returns filtered text safe to show to everyone, or nil if filtering failed (show nothing then).
local function filterForEveryone(text: string, fromUserId: number): string?
	if #text == 0 or #text > 50 then return nil end
	local ok, result = pcall(function()
		return TextService:FilterStringAsync(text, fromUserId)
	end)
	if not ok then return nil end
	local ok2, filtered = pcall(function()
		return result:GetNonChatStringForBroadcastAsync()
	end)
	return if ok2 then filtered else nil
end
```

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
- Leak test: run a 2-player local server for 20+ minutes with respawns and joins, and watch the Developer Console Memory tab and instance counts. Steady growth is a leak (Rule 69).
- The usual leaks: a table keyed by `Player` never cleared; a connection to a global signal per character or per object; a `task.spawn` loop with no exit; UI screens cloned on every open and never destroyed; effects parented to `nil` and kept in a list forever.

## The task library
- Use `task.wait(s)`, `task.spawn(fn, ...)` (runs now), `task.defer(fn, ...)` (runs after the current step), `task.delay(s, fn, ...)` and `task.cancel(thread)`. Never use the deprecated `wait`, `spawn` or `delay`, which throttle and hide errors.
- Don't poll (`while true do task.wait() ... end`) when an event exists. Connect to the event (Rule 55).
- `task.delay(t, inst.Destroy, inst)` replaces `Debris:AddItem` for timed cleanup, and returns a thread you can cancel if the object is reused.
- A loop that must stop later keeps its thread: `local thread = task.spawn(loop)`, then `task.cancel(thread)` in the Cleaner.
- Code that runs inside a signal handler shouldn't assume it runs at the exact moment the signal fired; write handlers that read the current state, so they work with deferred signal behavior too.

## Typing with --!strict
- `--!strict` is the first line of every Script, LocalScript and ModuleScript, and the Script Analysis window must show zero errors. Export shared shapes from `Shared/Types`:
```lua
export type PlayerSave = { Version: number, Coins: number, Receipts: {[string]: number}, Lock: {JobId: string, Time: number}? }
```
(The full schema is in "Save schema" above.)
- Type remote parameters as `unknown` and narrow with `typeof`/`IsA`. Cast with `::` only after a runtime check or for `WaitForChild` results.
- Give module tables a type when other modules use them heavily (`export type Pool = typeof(setmetatable(...))`, see "Luau").
- Use the modern syntax: string interpolation with backticks, `if ... then ... else` expressions, compound assignment (`+=`), generalized iteration (`for k, v in t do`), floor division (`//`), `continue`.

## Client: WaitForChild
- On the client, replication order isn't guaranteed. Get ReplicatedStorage objects, PlayerGui children and the character's parts with `WaitForChild` (with a timeout, `WaitForChild(name, 5)` returns nil, so handle it). On the server, index directly or use `FindFirstChild`, because the server created it.
- "Infinite yield possible on ..." in Output means a wrong name, an object that exists only on the server, or something streamed out.

## StreamingEnabled pitfalls
- Streaming is on by default in new places. Distant parts **don't exist on the client** and are removed when streamed out. (LocalScripts also don't run in Workspace, except inside the player's character.)
- Client code reacts to `CollectionService:GetInstanceAddedSignal(tag)` and `GetInstanceRemovedSignal(tag)` instead of looking up fixed workspace paths.
- A workspace Instance sent in a server→client remote arrives as `nil` if that client hasn't streamed it. Send IDs or positions, or handle nil.
- Set `Model.ModelStreamingMode` to `Atomic` for models scripts need whole, and `Persistent` only for the few things that must always exist (lobby boards).
- Before teleporting a character far away, call `player:RequestStreamAroundAsync(position)` on the server, then `PivotTo`.
- Test streaming on purpose: walk to the far edge of the map and back, and check that every tagged object's client behavior comes back.

## Performance

### Budgets (studio targets; measure, don't guess)
| Metric | Target | Where to read it |
|---|---|---|
| Client frame rate, PC | 60 FPS in the busiest scene | Developer Console, MicroProfiler |
| Client frame rate, low-end phone | 30 FPS floor | Real phone, MicroProfiler |
| Client memory | Flat over 30 minutes; investigate anything above about 1,000 MB on a phone | Developer Console Memory |
| Server heartbeat | 55+ per second average with a full server | Developer Console (server view) |
| Server memory | Flat over 2 hours of play | Developer Console (server view), Creator Hub Performance |
| Script time per system | Under 1 ms per frame each; all scripts under 4 ms | Script Profiler |
| Remote traffic | Under 20 KB/s average per player, server to client | Developer Console Network |
| State updates | At most 10 per second per player (Rule 8) | Network tab per remote |
| Active Humanoid NPCs | 30 or fewer per server for phone-heavy games | Explorer count |
| Ambient particle emitters | Rate 50 or less each; bursts with `Emit(n)` | Scenic's effects list |
| Shadow-casting lights | A handful per area; small lights with `Shadows = false` | Scenic's lighting notes |

### Map and spawned-object rules (Builder and Scenic)
- Anchor everything static (Rule 58). Unanchored only what must move.
- Decorations: `CanCollide`, `CanTouch`, `CanQuery` and `CastShadow` off.
- Meshes: `CollisionFidelity` Box or Hull unless walked on in detail (Rule 59); `RenderFidelity` Automatic.
- Replace unions with meshes for anything repeated.
- Repeat models through clones of one template, so textures and meshes are shared.
- Keep spawned objects in `Workspace.Drops`, pooled (Rule 57), with a cap per server (for example 300 drops; the oldest despawn first).
- Every spawner has a maximum count and a despawn time in Config.

### Profiling tools
- **Developer Console (F9):** Log, Memory (by category), Network (per remote), Script Profiler, and server views. Works in Studio Play and in live servers.
- **MicroProfiler (Ctrl+F6 in a running client):** frame-by-frame timing. Pause on a spike and read which labels are long. Wrap your own heavy functions with `debug.profilebegin("Name")` and `debug.profileend()` so they show up by name.
- **Script Analysis (Studio):** type and lint errors; must be zero.
- **Creator Hub Performance dashboard:** live crash rate, memory and frame rate across real players and devices ([[12 Live Ops and Launch]]).

### Network rules
- Batch state into one delta per player per tick (StateSync above).
- Send small numbers and short strings; never send a model's whole description when an ID will do.
- Cosmetic, frequent and lossy: UnreliableRemoteEvent. Anything that changes state: RemoteEvent.
- Large one-time data (an inventory of hundreds of items on join) goes once, then only changes.
- Pets and followers: the server sends a target every 0.1-0.2 s; clients interpolate. Never replicate a CFrame every frame from the server for cosmetic followers.

## Testing in Studio
- **Play (F5):** server plus your client with a character. Use the client/server toggle in the Test tab to inspect each side.
- **Run (F8):** server only, no character. Use it for NPC, spawning and economy loops.
- **Test > Clients and Servers:** a local server with **2 or more players**. This is required for anything multiplayer: replication, ownership checks, trading, leaderboards, rate limits, PlayerRemoving saves.
- Use the Device Emulator for phones ([[08 Mobile]]), and a simulated incoming replication lag (Studio Settings > Network) to test laggy remotes.
- Test the leave paths: leave mid-purchase, leave mid-save, stop the server, then rejoin and compare the data. Playtest writes the evidence (Output excerpts, screenshots) to `games/<slug>/reports/`, and never reports something as tested if it wasn't.

### The test runner (pure functions, in Studio only)
```lua
--!strict
-- ServerScriptService/Tests/Runner (ModuleScript)
local Runner = {}
type Test = { name: string, fn: () -> () }
local tests: {Test} = {}

function Runner.test(name: string, fn: () -> ())
	table.insert(tests, { name = name, fn = fn })
end

function Runner.eq(actual: any, expected: any, label: string?)
	if actual ~= expected then
		error(`{label or "value"}: expected {tostring(expected)}, got {tostring(actual)}`, 2)
	end
end

function Runner.near(actual: number, expected: number, tolerance: number, label: string?)
	if math.abs(actual - expected) > tolerance then
		error(`{label or "value"}: expected {expected} ± {tolerance}, got {actual}`, 2)
	end
end

function Runner.run(): (number, number)
	local passed, failed = 0, 0
	for _, t in tests do
		local ok, err = pcall(t.fn)
		if ok then
			passed += 1
		else
			failed += 1
			warn(`[Test] FAIL {t.name}: {err}`)
		end
	end
	print(`[Test] {passed} passed, {failed} failed`)
	return passed, failed
end

return Runner
```
```lua
--!strict
-- ServerScriptService/Tests/RunAll (ModuleScript): requires every *.spec module, then runs.
local Runner = require(script.Parent.Runner)
return function()
	for _, child in script.Parent:GetChildren() do
		if child:IsA("ModuleScript") and string.match(child.Name, "%.spec$") then
			(require(child) :: () -> ())()
		end
	end
	Runner.run()
end
```
```lua
--!strict
-- ServerScriptService/Tests/Core.spec (ModuleScript)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Runner = require(script.Parent.Runner)
local Formulas = require(ReplicatedStorage.Shared.Formulas)
local Validate = require(ReplicatedStorage.Shared.Validate)
local Config = require(ReplicatedStorage.Shared.Config)

return function()
	Runner.test("upgrade cost grows 15% per level", function()
		-- Formulas.upgradeCost(level) = math.round(100 * 1.15 ^ (level - 1))
		Runner.eq(Formulas.upgradeCost(1), 100)
		Runner.eq(Formulas.upgradeCost(2), 115)
		Runner.eq(Formulas.upgradeCost(3), 132)
	end)
	Runner.test("every egg's odds sum to 1", function()
		for eggId, egg in Config.Eggs do
			local sum = 0
			for _, entry in egg.Odds do sum += entry.Chance end
			Runner.near(sum, 1, 1e-9, eggId)
		end
	end)
	Runner.test("Validate.int rejects NaN, infinity, fractions and out-of-range", function()
		Runner.eq(Validate.int(0/0, 1, 99), nil)
		Runner.eq(Validate.int(math.huge, 1, 99), nil)
		Runner.eq(Validate.int(1.5, 1, 99), nil)
		Runner.eq(Validate.int(0, 1, 99), nil)
		Runner.eq(Validate.int("5", 1, 99), nil)
		Runner.eq(Validate.int(5, 1, 99), 5)
	end)
end
```
Use `math.round` in cost formulas, not `math.floor`: floating-point math can make `100 * 1.15` come out a hair under 115.

### Injecting DataStore failures (Studio only)
```lua
--!strict
-- ServerScriptService/Services/StoreAdapter
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Config = require(ReplicatedStorage.Shared.Config)

local StoreAdapter = {}

function StoreAdapter.get(name: string): any
	local real = DataStoreService:GetDataStore(name)
	local failRate = if RunService:IsStudio() then Config.Debug.DataStoreFailRate else 0
	if failRate <= 0 then return real end
	local wrapper = {}
	local function maybeFail()
		if math.random() < failRate then error("[FakeFail] injected DataStore failure") end
	end
	function wrapper:UpdateAsync(key: string, transform: any)
		maybeFail()
		return real:UpdateAsync(key, transform)
	end
	function wrapper:GetAsync(key: string, options: any?)
		maybeFail()
		return real:GetAsync(key, options)
	end
	return wrapper
end

return StoreAdapter
```
Set `Config.Debug.DataStoreFailRate = 0.3` for the failure test (Rule 68), and back to 0 before handing over. `ConfigCheck` warns if it's above 0 in a live server (it's ignored there anyway).

### Multiplayer test matrix (2-player local server)
| Area | Test | Pass |
|---|---|---|
| Replication | Player A's action shows on Player B's screen | Within one round trip |
| Ownership | B tries to use A's plot or pet (exploit script) | Rejected |
| Trading | A and B trade; one leaves mid-confirm | Both inventories correct after rejoin |
| Leaderboard | Both earn; board updates | Within the board's refresh interval |
| Rate limits | B spams a remote | A unaffected; server stable |
| Leave save | A leaves during an autosave | A's rejoin shows the latest data |
| Shutdown | Stop the server | Both saved within the deadline |
| Server hop | A leaves and joins a new local server at once | Lock waits, then loads |
| Party bonus | A and B are friends | Bonus applies to both ([[15 Discovery and Growth]]) |
| Purchases | A buys in the published place (the owner) | Granted once; B sees the result if public |

### Soak test, in 6 steps
1. Start a 2-3 player local server.
2. Every 5 minutes: respawn each character, and every 10 minutes leave and rejoin one player.
3. Keep the core loop running (an auto-play debug flag helps; never ship it on).
4. Record client memory, server memory and the Workspace instance count at 0, 5, 10, 20 and 30 minutes.
5. Any steady growth is a leak: find the table or connection that grows (Rule 11).
6. Write the numbers into `reports/<date>-soak.md`.

## Reading the Output window
- Red is an error, with a stack trace (`ServerScriptService.Services.ShopService:42`); click it to jump to the line. Orange is a warning. Fix the **first** error, because later ones often cascade from it.
- Watch for these: `attempt to index nil with 'X'` (something not loaded or not existing), `Infinite yield possible` (see above), DataStore queue or throttle warnings (too many writes), and `Requested module was required recursively`.
- Separate server and client messages in multi-client tests (each window shows its own side). In live servers, the Developer Console (F9) shows client and server logs, memory and network. Prefix logs with the system name (`[Shop]`, `[Receipts]`), and never `print` inside loops.
- Live errors also show in Creator Hub's Error Report. After each release, Liveops reads it hourly for 6 hours ([[12 Live Ops and Launch]]).

