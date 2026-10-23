---
tags: [vault, liveops]
read_by: [lead, liveops, producer, pulse, architect, builder, reviewer, merchant, balance]
---

# 12 Live Ops and Launch

Launch is the start of the work. A Roblox game grows by shipping, measuring, and shipping again, and each update is a chance to lose player data, break purchases or crash servers. This page covers getting to launch safely, reading the numbers honestly, and running updates and events without hurting players. The **owner publishes**; agents prepare, verify and hand over. Liveops keeps the plan in `games/<slug>/liveops.md`.

## Pre-launch checklist (Producer's final gate)
**Game**
- The first five minutes work for a new player on a phone, with touch only ([[01 The First Five Minutes]], [[08 Mobile]]).
- Multi-client test (2+ players) with no red errors in Output on server or clients ([[13 Building It Right]]).
- Every remote is validated and rate-limited, and the Reviewer signed off on money, saves and security.

**Data and money**
- Saves load, autosave, and save on leave and on `BindToClose`. Rejoin shows the same data. Save data has a `Version` field.
- Every pass, product and badge ID in `ReplicatedStorage.Shared.Config` is real (no `0` placeholders left), created by the owner on Creator Hub.
- `ProcessReceipt` grants each test purchase exactly once and survives a rejoin ([[09 Shops and Monetization]]).
- The owner has enabled Studio access to API services for testing and confirmed DataStores work in the published place.

**Store page and settings** (the owner sets these, from drafts by Splash and Liveops)
- Icon, 3+ thumbnails, title and description are approved ([[11 Thumbnails, Icons and the Store Page]]).
- Genre, playable devices, server size, maturity questionnaire, private server price (if any) and social links are set.

**Analytics**
- Onboarding funnel, economy, progression and key custom events fire in a test session (see below).

## Soft launch
- Release quietly first: public but unpromoted, or private with play access granted to a test group through the place permissions. Use friends of the owner, a group, small invited sessions.
- Run it for days, not hours. Watch Output and error reports, D1, session length and the onboarding funnel, and fix the biggest leak first.
- Change one major thing per update so you know what moved the numbers.
- Promote (ads, sponsors, announcements) only after soft-launch fixes land and retention looks healthy for the genre. Pulse supplies comparisons from the charts; the team doesn't invent targets.

## Metrics: definitions
| Metric | Definition |
|---|---|
| D1 retention | Of new players whose first session was on day 0, the share who play again on day 1. |
| D7 / D30 retention | Same, for day 7 / day 30. D1 reflects the first session, D7 and beyond reflect depth. |
| Session length | Time from join to leave for one session. Use the median as well as the average, since AFK players skew averages. |
| Sessions / playtime per DAU | How often, and how long in total, an active player plays per day. |
| DAU / MAU / CCU | Daily and monthly unique players; concurrent players at a moment. |
| Payer conversion | Unique paying players ÷ active players in the same period. |
| ARPPU | Robux revenue ÷ paying players in the period (average revenue per paying user). |
| ARPDAU | Robux revenue ÷ DAU (average revenue per daily active user). |
| Funnel step conversion | Players reaching step N+1 ÷ players reaching step N. |
- Compare **cohorts** (players who joined before and after an update), not raw totals. Segment by device (phone vs PC) and new vs returning.
- Small numbers are noisy. Don't react to a single day or a handful of players.
- Retention problems usually live in the first session. Monetization problems usually live in offer timing and value, not price.

## Creator Hub analytics and funnels
- Creator Hub has dashboards for engagement, retention, monetization, acquisition, audience and performance (crashes, memory, frame rate, server health), plus error reporting.
- **Funnels:** the onboarding funnel comes from `LogOnboardingFunnelStepEvent`; recurring funnels (shop, rounds, crafting) come from `LogFunnelStepEvent`. Read the biggest step-to-step drop first.
- **Economy:** `LogEconomyEvent` powers sources vs sinks per currency. Compare it with Balance's simulation in `economy.md` ([[04 Progression and Economy]]).
- Dashboards lag behind real time. Verify that events fire (no errors) in Studio, then confirm the data appears after real sessions.

## AnalyticsService events (server only)
```lua
local AnalyticsService = game:GetService("AnalyticsService")
local HttpService = game:GetService("HttpService")

-- Onboarding funnel: steps 1..N in order, logged once per player.
AnalyticsService:LogOnboardingFunnelStepEvent(player, 1, "Spawned")
AnalyticsService:LogOnboardingFunnelStepEvent(player, 2, "FirstCollect")
AnalyticsService:LogOnboardingFunnelStepEvent(player, 3, "FirstSell")
AnalyticsService:LogOnboardingFunnelStepEvent(player, 4, "FirstUpgrade")

-- Recurring funnel: a new funnel session id per attempt.
local shopSession = HttpService:GenerateGUID(false)
AnalyticsService:LogFunnelStepEvent(player, "Shop", shopSession, 1, "Opened")
AnalyticsService:LogFunnelStepEvent(player, "Shop", shopSession, 2, "ViewedItem")
AnalyticsService:LogFunnelStepEvent(player, "Shop", shopSession, 3, "PromptShown")

-- Progression.
AnalyticsService:LogProgressionStartEvent(player, "Worlds", 2, "Volcano")
AnalyticsService:LogProgressionCompleteEvent(player, "Worlds", 2, "Volcano")

-- Economy: every source and sink of every currency, with the balance after.
AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, "Coins", 250, data.Coins,
	Enum.AnalyticsEconomyTransactionType.Shop.Name, "Upgrade_Backpack_2")

-- Custom.
AnalyticsService:LogCustomEvent(player, "BossDefeated", fightSeconds)
```
- Use `Enum.AnalyticsEconomyTransactionType.IAP` for currency bought with Robux (logged from the receipt grant), and `Gameplay`, `TimedReward`, `Onboarding` or `Shop` for the rest.
- Keep names and SKUs stable and low-cardinality. Changing an event name splits its history.

## Update cadence, events and patch notes
- Early on, ship small fixes as needed and a content update about every 1-2 weeks. Then settle into a predictable rhythm (same weekday) so players learn when to check. Treat these as rules of thumb.
- Release when someone can watch the first hours: check Output, error reports, purchases and saves right after each release.
- **Events:** announce in-game a few days ahead, run for about 1-2 weeks, include a free track, an event badge and an event currency that converts or expires clearly. Drive them from `Config.Events` with UTC start and end times ([[10 Retention and Social]]).
- **Feature flags:** each new system has an `Enabled` flag in Config so a broken feature can be switched off with a quick republish. For changes without a republish, read a small live-config DataStore key at server start and every few minutes, and push changes immediately with `MessagingService`.
- **Patch notes**, in plain words a 10-year-old can read. Show them in the in-game "What's new" panel and in the description's update line:
```
v1.4 Volcano Update (2026-10-23)
NEW: Volcano world with 6 lava pets
CHANGED: Sell button moved next to the backpack on phones
FIXED: Coins sometimes not saving when leaving quickly
```

## Safe data migrations (versioned save data)
- Every save has `Version`. Each schema change adds one migration step and bumps `CURRENT_VERSION`. Migrations run on load, in order, and never delete data they don't understand.
- Fill missing keys from defaults on every load (reconcile), so adding a field never needs a migration.
- **Never downgrade.** During a rollout, old and new servers run side by side. If a server loads a save with `Version` newer than it knows, it must not save over it. Kick the player politely with "Please rejoin to get the latest update."
- Never rename the DataStore to "reset" data; that wipes everyone. Know how to restore one player with `DataStore:ListVersionsAsync` / `GetVersionAsync`.
```lua
local CURRENT_VERSION = 3
local migrations: {[number]: (any) -> ()} = {
	[1] = function(d) d.Pets = d.Pets or {} end,                          -- v1 -> v2
	[2] = function(d) d.Gems = d.Gems or d.Diamonds or 0; d.Diamonds = nil end, -- v2 -> v3 rename
}
local function migrate(d): boolean -- false = newer than this server, do not save
	d.Version = d.Version or 1
	if d.Version > CURRENT_VERSION then return false end
	while d.Version < CURRENT_VERSION do
		migrations[d.Version](d)
		d.Version += 1
	end
	return true
end
```

## Shutdown safety
- New servers run the latest published version; old servers keep old code until they empty or are restarted. After an update, the owner uses Creator Hub's server restart or migrate option to move players to fresh servers.
- `game:BindToClose` gets a short window (about 30 seconds) before the server is gone. Save every player in parallel and wait for all saves, with a deadline. Make the save idempotent, because `PlayerRemoving` may also fire.
```lua
game:BindToClose(function()
	local pending = 0
	for _, player in Players:GetPlayers() do
		pending += 1
		task.spawn(function()
			PlayerData.SaveAndRelease(player) -- no-op if already saved by PlayerRemoving
			pending -= 1
		end)
	end
	local deadline = os.clock() + 25
	while pending > 0 and os.clock() < deadline do
		task.wait(0.1)
	end
end)
```

## Roblox ads and sponsorships
- Roblox's ad tools (sponsored experiences, search placements) buy impressions, and they amplify whatever your funnel already is. Spend only after soft launch shows healthy D1 and a working first session. Spending Robux is the owner's decision.
- Start small, change one thing at a time, and judge each campaign by the D1 and conversion of the players it brought, not by clicks.
- Ad creative follows the same honesty rules as store art ([[11 Thumbnails, Icons and the Store Page]]). Sponsored traffic arriving at a confusing first minute is wasted.
- Time big campaigns with an update or event, so new players arrive to fresh content and the team is watching.

## Checklist
- [ ] Every item in the pre-launch checklist has evidence in `games/<slug>/reports/` (Output logs, screenshots, test notes).
- [ ] A 2+ player local server test shows saves surviving leave, rejoin and server stop (`BindToClose`).
- [ ] Save data has `Version`; loading an older test save migrates it; a newer-version save is never overwritten.
- [ ] Onboarding funnel steps fire in order exactly once per new player.
- [ ] Economy events cover every source and sink for each currency.
- [ ] New systems have a Config `Enabled` flag, and turning it off disables them cleanly.
- [ ] Event start and end times are UTC in Config and were tested with a Studio-only time offset.
- [ ] Patch notes and the "What's new" text are written and readable by a 10-year-old.
- [ ] `liveops.md` lists every analytics event, the metrics to watch, and the next update plan.
- [ ] No placeholder `0` IDs remain in Config at ship time.

## Common mistakes
- Publishing without testing the leave and shutdown save paths, then losing data on the first update.
- A schema change without a version bump, or old servers saving over new-format data during rollout.
- Reacting to one day of numbers, or changing five things in one update and learning nothing.
- Logging analytics from the client, or renaming events every update.
- Running ads before the first session works, then blaming the ads.
- Events that need a code change to start or stop, so one goes live late at night with nobody watching.
- Patch notes written for developers ("refactored DataService") instead of players.

## Related
[[00 Start Here]] · [[01 The First Five Minutes]] · [[04 Progression and Economy]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]]
