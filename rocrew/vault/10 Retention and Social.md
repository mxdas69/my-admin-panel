---
tags: [vault, retention]
read_by: [lead, pulse, architect, builder, frame, balance, liveops, merchant, kid-tester, producer]
---

# 10 Retention and Social

Players stay when there is a reason to come back tomorrow and someone to play with today. Roblox recommends experiences that players return to and play for a long time, so retention drives both growth and earnings (including Premium Payouts). Every system here should **reward coming back without punishing being away**, and it must stay honest with a young audience. The core loop has to be fun first ([[02 The Core Loop]]); these systems amplify a good loop, they can't rescue a bad one.

## Daily rewards and streaks
- Run a 7-day cycle with rewards that grow each day and a highlight on day 7 (a cosmetic, a rare egg, a big chest). Show all 7 days so the player can see what is coming.
- Use **server time only** (`os.time()`, UTC). Never trust the client clock. Show the countdown to the next reset from `workspace:GetServerTimeNow()`.
- A missed day resets the streak to day 1 but never takes back anything already earned. Optionally allow a one-day grace. Don't sell "streak savers" to kids.
- Claiming is a single tap on a clear button, rate-limited on the server, and logged.
```lua
-- Server, inside the daily reward service. `data` is the player's session save.
local AnalyticsService = game:GetService("AnalyticsService")
local DAY = 86400
local REWARDS = { 50, 75, 100, 150, 200, 300, 500 } -- Balance tunes these in economy.md

local function claimDaily(player: Player, data): number?
	local today = math.floor(os.time() / DAY) -- UTC day index
	local last = data.Daily.LastClaimDay or -1
	if last == today then return nil end -- already claimed today
	data.Daily.Streak = if last == today - 1 then data.Daily.Streak + 1 else 1
	data.Daily.LastClaimDay = today
	local reward = REWARDS[(data.Daily.Streak - 1) % #REWARDS + 1]
	data.Coins += reward
	AnalyticsService:LogCustomEvent(player, "DailyRewardClaimed", data.Daily.Streak)
	return reward
end
```

## Playtime rewards
- Session gifts at increasing intervals (for example 5, 10, 20, 30, 45, 60 minutes) shown as a small HUD timer. Time is tracked on the server from join (`os.clock()` per player).
- The player taps to claim. Unclaimed gifts wait; they don't expire mid-session.
- Keep the rewards modest. Roblox disconnects idle players after a while anyway, and the goal is "one more round", not AFK farming.

## Daily and weekly quests
- Rule of thumb: 3 daily quests (easy, medium, a bit longer) plus 1-2 weekly quests. Each quest is a verb from the core loop ("Collect 200 crystals", "Hatch 3 eggs"), never "spend Robux".
- Rotate deterministically so every server agrees without storage: seed with the day index.
```lua
local function pickDailyQuests(dayIndex: number, pool: {string}): {string}
	local rng = Random.new(dayIndex) -- same seed on every server, so the same quests for everyone today
	local remaining = table.clone(pool)
	local picked = {}
	for _ = 1, math.min(3, #remaining) do
		table.insert(picked, table.remove(remaining, rng:NextInteger(1, #remaining)))
	end
	return picked
end
-- Weeks starting Monday 00:00 UTC (epoch day 4 was a Monday):
local weekIndex = math.floor((math.floor(os.time() / 86400) - 4) / 7)
```
- Count progress from server events (the server already knows when a crystal is collected). Never accept "quest progress" from a remote.
- Reset progress when the stored day or week index differs from the current one.

## Badges
- Award on the server with `BadgeService:AwardBadge(userId, badgeId)`. It yields and can fail, so wrap it in pcall and run it off the main path.
- Good badges: Welcome (first join), first milestone, mastery, hidden or secret, event participation. Skip trivial badges that fire every few seconds.
- Badge IDs live in `ReplicatedStorage.Shared.Config` as placeholders (`0`) until the owner creates them on Creator Hub. Creating badges can cost Robux, so ask the owner.
```lua
local BadgeService = game:GetService("BadgeService")

local function awardBadge(player: Player, badgeId: number)
	if badgeId == 0 then return end -- placeholder
	task.spawn(function()
		local okHas, has = pcall(BadgeService.UserHasBadgeAsync, BadgeService, player.UserId, badgeId)
		if okHas and has then return end
		local ok, err = pcall(BadgeService.AwardBadge, BadgeService, player.UserId, badgeId)
		if not ok then warn(`[Badges] {badgeId} failed: {err}`) end
	end)
end
```

## Leaderboards
- **In-server:** a `leaderstats` Folder under the Player with IntValue children appears in the player list. Show only 1-2 stats.
- **Global:** use `DataStoreService:GetOrderedDataStore(name)`. Values must be integers. Write when the player's save happens or at round end, not on every change. Read the top N (`GetSortedAsync(false, 50)`) about once a minute per server, cache the result, and draw it on a SurfaceGui board.
- Weekly boards: put the week index in the store name (`"Wins_W" .. weekIndex`). They feel winnable, so new players have a chance.
- Resolve names in batches with `UserService:GetUserInfosByUserIdsAsync(ids)` (pcall, cache). Don't call a name lookup per row on every refresh.
```lua
local winsStore = DataStoreService:GetOrderedDataStore("Wins_AllTime_v1")
local ok, pages = pcall(winsStore.GetSortedAsync, winsStore, false, 50)
if ok then
	for rank, entry in pages:GetCurrentPage() do
		-- entry.key is the userId string, entry.value the integer score
	end
end
```

## Friend invites
- Prompt from the client with `SocialService:PromptGameInvite(player, options)`, after checking `SocialService:CanSendGameInviteAsync(player)` (pcall). Hide the invite button when it returns false.
- Offer invites at natural moments: in the lobby, when a co-op mode needs more players, or right after a fun moment. Never on join and never repeatedly.
- `ExperienceInviteOptions.PromptMessage` sets friendly copy ("Bring a friend to help build the base!"). `SocialService.GameInvitePromptClosed` reports who was invited, and you can log that count.
```lua
local SocialService = game:GetService("SocialService")
local ok, canInvite = pcall(SocialService.CanSendGameInviteAsync, SocialService, player)
if ok and canInvite then
	local options = Instance.new("ExperienceInviteOptions")
	options.PromptMessage = "Come help me finish the volcano base!"
	SocialService:PromptGameInvite(player, options)
end
```
- If you reward a friend joining, keep the reward small and give it to both players. Never require invites to progress, and never punish not inviting.

## Co-op and social mechanics
- Make shared goals a group finishes faster (a server-wide boss, team chests), but keep solo play viable.
- A "playing with friends" bonus works well: a small boost when a friend is in the server (`player:IsFriendsWith(otherUserId)`, which yields, so pcall and cache per pair).
- Visible status: cosmetics, titles, pets that follow, overhead tags (BillboardGui). Other players seeing them is what makes them worth earning ([[07 Characters, VFX and Assets]]).
- Light interaction: emotes, high-fives, gifting free items, revive a teammate, spectate.
- Trading needs both players to confirm on a locked offer that the server validates, plus a cooldown. Respect `PolicyService` trading rules for paid items ([[09 Shops and Monetization]]).
- All custom player-written text (pet names, signs) must go through `TextService:FilterStringAsync`.
- Enable private servers so friend groups have a home.

## Group perks
- Check membership with `player:IsInGroup(groupId)` or `player:GetRankInGroup(groupId)` (pcall). Results can be cached for the session, so say "perks apply next time you join".
- Keep perks small and fun: a chat or overhead tag, a small daily bonus, a group-only cosmetic. Never lock core content behind group membership.

## Update logs and limited-time events
- An in-game "What's new" panel shows once per update. Compare `data.LastSeenUpdate` with `Config.UpdateVersion`, use 3-5 bullets a 10-year-old can read, and close it in one tap. See [[12 Live Ops and Launch]] for patch notes.
- Limited-time events are data-driven: `Config.Events` lists UTC start and end timestamps, and the server checks `os.time()`. Every event has a free track. Test schedules in Studio with a Studio-only time offset, never by editing real dates.
- Event-limited cosmetics are fine. Event-limited **paid** pressure ("Buy before it's gone!") is not.

## Avoiding dark patterns
- No fake countdowns, fake scarcity or fake "X players just bought this".
- No guilt or threats ("Your pet will be sad", "You'll lose everything"). No confirmshaming on decline buttons.
- No stacked popups on join. One welcome-back card at most, then let the player play ([[01 The First Five Minutes]]).
- Don't make AFK or overnight play necessary, and don't punish breaks harshly.
- Don't reward likes or favorites, and don't make invites or group joins mandatory.
- Odds are shown, "free" means free, and every reward box opens in one step, not a chain of boxes.

## Logging retention events with AnalyticsService
Log on the server. Keep event names few and stable, and keep custom field values low-cardinality (no user IDs or timestamps as values). Roblox caps how many distinct names and values it tracks.
```lua
local AnalyticsService = game:GetService("AnalyticsService")
AnalyticsService:LogCustomEvent(player, "QuestCompleted", 1, {
	[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = questId, -- e.g. "Collect200"
})
AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, "Coins", reward,
	data.Coins, Enum.AnalyticsEconomyTransactionType.TimedReward.Name, "DailyReward")
```
Log these: daily claimed (with streak), playtime gift claimed, quest completed, badge awarded, invite prompt closed (with count), joined from an invite, event participation, update log viewed. Liveops records the event list in `games/<slug>/liveops.md`.

## Checklist
- [ ] Daily reward uses the server UTC day index; claiming twice in one day is rejected; the streak resets without removing rewards.
- [ ] Playtime gifts are timed on the server and claimed by tap.
- [ ] Quests rotate deterministically from the day/week index, and progress comes only from server events.
- [ ] Badges award through a pcall'd, non-blocking helper; placeholder IDs are skipped.
- [ ] Global leaderboard writes are throttled, reads are cached, and names are resolved in batches.
- [ ] The invite button appears only when `CanSendGameInviteAsync` is true and never pops on its own.
- [ ] Custom player text is filtered with `TextService:FilterStringAsync`.
- [ ] The "What's new" panel shows once per update and closes in one tap.
- [ ] The kid-tester found no guilt text, fake timers or stacked popups.
- [ ] Every retention event in `liveops.md` fires in a Studio test with no errors in Output.

## Common mistakes
- Using the client's clock for dailies, which lets players change the device time and claim all week.
- A streak that wipes huge rewards on one missed day, so players quit instead of coming back.
- Quests that grant progress from a remote the client can fire.
- Writing to the OrderedDataStore on every coin pickup and exhausting the DataStore budget ([[13 Building It Right]]).
- Calling `AwardBadge` in a tight loop for players who already own the badge.
- Popups for daily reward, update log, starter pack and invite all at once on join.
- Logging high-cardinality custom events (one name per item ID) that make the dashboards useless.

## Related
[[00 Start Here]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[09 Shops and Monetization]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
