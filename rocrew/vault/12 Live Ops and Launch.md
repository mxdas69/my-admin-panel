---
tags: [vault, liveops, launch, analytics, updates, events, metrics]
for: [liveops, lead, producer, pulse]
also: [architect, builder, reviewer, merchant, balance, splash, playtest]
---

# 12 Live Ops and Launch

Launch is the start of the work. A Roblox game grows by shipping, measuring and shipping again, and every update is a chance to lose player data, break purchases or crash servers. This chapter covers getting to launch safely (the gate, the soft launch, launch day), reading the numbers honestly (definitions, cohorts, the diagnosis table), and running the game afterwards (update cadence, events, feature flags, live config, data migrations, server restarts, incidents and the live-ops calendar).

Roblox's Recommended for You sort ranks games on how the players it sends behave across many days: qualified play-through rate, playtime, play days, spend days, Robux spent and co-play days, averaged per player [1]. Since mid-2026 it uses a 28-day view built to value long-term retention [2][3]. A game that peaks at launch and has nothing for week 2 fades. A game that ships a good update on a predictable day, keeps every save safe and fixes its funnel one leak at a time keeps earning distribution. Live ops is the part of the work that decides which of those two games you made.

The **owner publishes**, sets prices, creates products, spends money and restarts servers. Agents prepare, verify and hand over. Liveops owns `games/<slug>/liveops.md` (events, metrics, the next-update plan and the live-ops log) and works with Lead on `growth.md` from [[15 Discovery and Growth]]. Read this chapter during Ship prep, again on launch day, and at the start of every update cycle.

## Rules

### The launch gate

1. **The owner publishes; agents hand over a gate report with evidence for every item.** Agents never publish, never restart servers and never change prices. Producer runs the pre-launch checklist below and writes `games/<slug>/reports/<date>-launch-gate.md` with a file path, Output excerpt or screenshot for every line. Lead sends the owner one `cli.mjs ask` with the report link and the exact steps to publish.
   Done right: "Gate passed 24/24. Evidence in reports/2026-11-05-launch-gate.md. Steps: File > Publish to Roblox, then set the genre to Simulator."
   Done wrong: "Everything should be fine, go ahead and publish."

2. **No promotion of any kind until the soft-launch gate passes: funnel fixed, zero data loss, purchases verified, zero red errors.** Roblox's guidance is to fix core gameplay first when retention is low [4], and ads aren't meant to fix a declining organic trend [5]. The soft-launch gate is: the first-session funnel has no step losing more than the plan allows, no save loss in the soft-launch period, every product granted exactly once, and Output clean on server and clients in a 2-player test.
   Done right: soft-launch fixes closed, then ads and creator outreach start.
   Done wrong: a creator video goes live while new players still get stuck at step 2.

3. **Soft launch for 7-14 days with real strangers before any promotion.** Friends are polite; strangers leave. Make the game public but unpromoted, or give play access to a test group through the place permissions, and let a few hundred real players through (studio target: at least 300 new players before the first read). Read the funnel and D1 every 2-3 days, fix the biggest leak, and change one major thing per update so you know what moved.
   Done right: days 1-3 show step 3 losing 40% of players; the fix lands day 4; days 5-7 show 22%.
   Done wrong: one evening with the owner's cousins, then a full launch.

4. **Every save path is proven before launch: first join, autosave, leave, server shutdown, rejoin and server hop.** A save bug at launch is the most expensive bug a game can have: it destroys the retention the algorithm ranks on [1][3]. Playtest runs the save matrix in "Shipping an update" step 7 in a 2-player local server, plus a test in the published place, and pastes the before and after values into the gate report ([[13 Building It Right]]).
   Done right: "Left mid-autosave, rejoined: Coins 1,250 → 1,250. Stopped server with 2 players: both saved in 1.8 s."
   Done wrong: "Saves work in Play mode."

5. **Every purchase is tested end to end with real IDs in the published place, granted exactly once, and survives a rejoin.** `ProcessReceipt` must record the `PurchaseId` in the save with the grant and acknowledge only after the save succeeds ([[09 Shops and Monetization]], [[13 Building It Right]]). Test each product: buy, check the grant, rejoin, check nothing doubled; leave during the purchase, rejoin, check it arrives once. The owner makes the test purchases.
   Done right: a table of every product ID with "granted once, survived rejoin, survived leave-during-purchase".
   Done wrong: testing only in Studio, where purchases are simulated.

6. **No placeholder IDs at ship time: a Config validator runs at server start and lists every 0 or missing ID.** Store pass, product and badge IDs in `ReplicatedStorage.Shared.Config`. The validator (see "Luau") warns in Studio and disables the matching shop entry in live servers instead of erroring. Producer checks its Output line in the gate report.
   Done right: `[Config] OK: 6 passes, 9 products, 4 badges, 0 placeholders`.
   Done wrong: a shop button that prompts product 0 and does nothing on launch day.

7. **The store page is complete before the doors open: icon, 3-5 thumbnails, title, description, genre, devices, maturity questionnaire and social links.** Thumbnail personalization only runs with 2 or more thumbnails [11], and keeps the winner while testing new ones [12]. Splash and Liveops draft everything; the owner sets it ([[11 Thumbnails, Icons and the Store Page]], [[15 Discovery and Growth]]).
   Done right: 4 thumbnails, each a different honest promise; genre matches the first 10 minutes.
   Done wrong: the default baseplate thumbnail on launch day.

8. **Check search visibility on launch day and the day after, from a non-owner account on a phone.** DevForum reports describe public games missing from search, even for exact titles [28][29]. If the game is missing after 24 hours, the owner posts on the DevForum with the place ID.
   Done right: "Exact-title search: found at position 1 on day 0 and day 1."
   Done wrong: telling the first creator to "just search the name" without checking.

9. **Launch on a Thursday or Friday at an hour the owner and Liveops can watch for 6 hours.** Weekly patterns move impressions [1], and weekend traffic should land on a build that already got one hotfix. Studio default: publish Thursday 16:00 UTC; first hotfix Friday; weekend at full strength.
   Done right: Liveops checks errors, funnels and purchases every hour from 16:00 to 22:00.
   Done wrong: publishing late Sunday and finding a crash bug on Wednesday.

### Analytics and reading the numbers

10. **Analytics fire from the server only, and are live before the first stranger joins.** `AnalyticsService` events are logged from server scripts with the real `Player` ([[13 Building It Right]]). Clients can be spoofed, and missing analytics during soft launch means the most important data is lost. Producer's gate includes a Studio session showing every event firing with no errors, then a check that data appears in Creator Hub after real sessions (dashboards lag).
   Done right: a gate line "Funnel steps 1-8 logged in order once; economy events for all 3 currencies".
   Done wrong: adding analytics after launch week "when we have time".

11. **The onboarding funnel has 6-10 steps, each logged exactly once per player, in order.** `LogOnboardingFunnelStepEvent` builds the onboarding funnel in Creator Hub. Steps must be the moments that matter (spawned, first action, first reward, first sell, first upgrade, first rare, first area unlock, end of first session). Guard each step with a flag in the save so it logs once even across rejoins.
   Done right: 8 steps from "Spawned" to "FirstWorldUnlocked", guarded by `data.Onboarding.Logged[step]`.
   Done wrong: step 3 logged every time a player sells, so the funnel shows 400% conversion.

12. **Every currency source and sink is logged, with the balance after.** `LogEconomyEvent` powers the sources vs sinks view per currency. Compare it every week with Balance's simulation in `economy.md` ([[04 Progression and Economy]]). A source the sim doesn't expect, or a sink nobody uses, is the first sign of an exploit or a dead feature.
   Done right: the economy dashboard matches the sim within 20% in week 1 (studio target).
   Done wrong: logging purchases but not quest rewards, so the dashboard shows a deflating economy that is actually inflating.

13. **Event names, funnel names and SKUs are frozen once live; changing a name splits its history.** Keep names short, stable and low-cardinality (no player names, no timestamps in names). Write them in `liveops.md` under "Analytics contract" and treat them like the remotes contract: a change needs a new name and a note.
   Done right: `Upgrade_Backpack_2` stays `Upgrade_Backpack_2` forever.
   Done wrong: renaming `Shop` to `Store` in v1.3 and losing the trend.

14. **Read cohorts, not totals: split by join date, acquisition source, device, and new vs returning.** Roblox's analytics show retention by acquisition source [5], and Recommended for You ranks only on players it brought [1]. A launch spike of ad players can hide a falling organic D1. Every report Liveops writes names the cohort.
   Done right: "RFY cohort joined Nov 6-12: D1 up from 24% to 27% after v1.2. Ad cohort tracked separately."
   Done wrong: "DAU is up, so retention is fine."

15. **Compare with the benchmark set and with the same weekday last week before reacting.** Roblox lets you choose the benchmark set your numbers are compared with [5], and lists seasonality (weekly patterns, summer, back-to-school, holidays) and competitors as influences on impressions [1]. A drop shared by the benchmark set is the platform, not you.
   Done right: "Sessions −8% this Tuesday vs last Tuesday; benchmark −7%; school started. No action."
   Done wrong: rebalancing the economy because of a holiday dip.

16. **Don't react to tiny samples: wait for at least 1,000 new players or 3 days of data, whichever is later (studio rule).** Small numbers are noisy. A change on 80 players can show ±10 points of D1 by chance. Note the sample size next to every number in reports.
   Done right: "D1 26% (n = 2,140)".
   Done wrong: "D1 jumped to 40%!" on 25 players.

17. **Fix the biggest funnel drop first, one change per update.** The step-to-step funnel tells you where players quit. Retention problems usually live in the first session ([[01 The First Five Minutes]]). Change one thing, measure for 3-7 days, then the next.
   Done right: v1.1 fixes only the step 2→3 drop (the sell button was off-screen on phones).
   Done wrong: v1.1 changes the tutorial, the prices and the map, and D1 moves for unknown reasons.

18. **Watch leading indicators daily, because impressions follow signals by a few days.** Roblox's Discovery docs show a qPTR dip on February 28 followed by an impression drop on March 3 [1]. After every update, Liveops checks qPTR (Home Recommendations tab), onboarding step 3 and D1 daily for 7 days. A dip of more than 10% for 2 days in a row (studio threshold) triggers a review and, if the update caused it, a rollback of that change.
   Done right: rollback on day 2, impressions never drop.
   Done wrong: noticing the drop a week later in the impressions chart.

19. **Retention is a 28-day game now, so read D7 and D30 as closely as D1.** RFY moved from a 7-day to a 28-day view that directly measures long-term retention [2][3]. Every update plan states which retention day it targets: D1 (first session), D7 (depth, weekly goals) or D30 (long-term goals, collections, social).
   Done right: "v1.5 targets D7: weekly quests and a 7-day login ladder."
   Done wrong: every update adds first-session polish while D30 keeps falling.

20. **Read monetization as payer conversion, ARPPU, ARPDAU and spend days, never as price alone.** Roblox lists both spend days and Robux spent as recommendation signals [1]. Monetization problems usually live in offer timing and value, not price. Merchant changes one offer at a time and Liveops compares payer conversion and spend days before and after ([[09 Shops and Monetization]]).
   Done right: moving the starter pack from minute 2 to the end of the first session raised payer conversion and D1.
   Done wrong: halving every price on a hunch.

### Updates

21. **Ship updates on a fixed weekday and UTC hour; the cadence is a promise.** Grow a Garden kept a weekly Saturday update schedule [19], and RoMonitor data reported by WN Hub showed a record 11.7 million concurrent players on Saturday, May 31, 2025, against 8.9 million the week before [21]. A fixed slot trains players to return together. Studio default: Saturday 15:00 UTC, every 1-2 weeks, written in `liveops.md` and shown on the in-game countdown.
   Done right: "Updates every other Saturday at 15:00 UTC" in the description and the countdown board.
   Done wrong: updates whenever a feature is done, at random hours.

22. **Early on, hotfix as needed and ship content every 7-14 days; then settle into a rhythm you can keep for 3 months.** A rhythm you break teaches players to stop checking. In August 2025 Grow a Garden's developer said weekly events had become too hard to keep fresh, and planned more depth with events in between [20]. Pick the slowest cadence that still keeps D7 healthy, and keep 2 updates built ahead.
   Done right: a two-week cadence with the next two updates already in `liveops.md`.
   Done wrong: weekly updates for 3 weeks, then silence for 5.

23. **Every update has one headline, a countdown, plain patch notes, codes and a new thumbnail.** Players look up update times: fan sites publish Grow a Garden update and event schedules [22][23]. The headline is one sentence a 10-year-old would repeat ("Volcano world with 6 lava pets"). Show a countdown board 3-7 days ahead, write patch notes in plain words, add a code that expires in 14 days, and add one update thumbnail while keeping the current winner [12].
   Done right: "VOLCANO UPDATE in 2d 4h" on the lobby board, code `VOLCANO`, a new thumbnail.
   Done wrong: "v1.4.2 misc changes".

24. **Release only when someone can watch the first 6 hours.** Updates break things. The owner publishes at the agreed slot; Liveops watches errors, purchases, saves, funnels and server memory every hour for 6 hours, and the first-day hotfix window is kept free.
   Done right: release at 15:00 UTC, checks at 15:15, 16:00, 17:00 ... 21:00, notes in the live-ops log.
   Done wrong: releasing and going to sleep.

25. **Every update passes the release check before the owner publishes.** The check: zero red errors in a 2-player local server on server and both clients; old-save compatibility (load a save from the live version, confirm migration); purchase test of any changed product path; Device Emulator test on a small phone; flags for new systems default to the planned state; patch notes written. Producer signs it in `reports/`.
   Done right: `reports/2026-11-14-release-v1.4.md` with all six lines and evidence.
   Done wrong: "Small update, no need to test."

26. **After a content update, the owner restarts servers so everyone gets it, timed and announced.** New servers run the latest published version; old servers keep old code until they empty or restart. The owner uses Creator Hub's server restart (migrate to the latest update) option at the update slot. Announce it in-game 5-10 minutes before ("Update in 5 minutes! You'll rejoin automatically"), never in the middle of a timed event's final hour.
   Done right: a banner at 14:55, restart at 15:00, players back in new servers within a minute.
   Done wrong: half the players on old servers for a day, reporting bugs that are already fixed.

27. **Old and new servers run side by side, so an old server must never save over a newer save.** Every save has `Version`. A server that loads a save newer than it understands refuses to save it and asks the player to rejoin (code in "Safe data migrations"). New fields are added with defaults through reconcile, so most updates need no migration.
   Done right: v1.4 adds `Pets.Lava`; v1.3 servers never touch a v1.4 save.
   Done wrong: a v1.3 server loads a v1.4 save, drops the unknown fields and saves, deleting the player's lava pets.

28. **Every new system ships behind an `Enabled` flag that can be turned off without a code change.** Flags live in `Config.Flags` (defaults) and can be overridden by live config (Rule 29). A broken feature is turned off in minutes instead of waiting for a fixed build. The flag check is on the server; the client hides the UI when the server says the feature is off.
   Done right: the trading system breaks, the flag goes off, trading UI disappears, nothing else changes.
   Done wrong: a hotfix republish at 02:00 to remove a broken button.

29. **Live config goes through one validated DataStore key and a cross-server refresh, with the previous value kept for rollback.** Servers read `LiveConfig/current` at start and every 5 minutes, and refresh immediately when a `MessagingService` message arrives. The message only says "refresh"; values always come from the DataStore and are validated against known keys and ranges. The previous value is kept as `LiveConfig/previous`. Only the owner changes it.
   Done right: the owner turns on a 2x coins weekend from an in-game admin command; all servers apply it within a minute.
   Done wrong: servers trusting a message body, so one bad publish sets coins to 1,000,000x.

30. **Hotfix within 24 hours for anything touching data, money or crashes; batch the rest into the next update.** A hotfix changes the smallest amount of code possible, goes through the release check (shortened to the paths it touches), and is announced in one line ("Fixed: coins not saving when leaving quickly").
   Done right: the save bug is fixed and published within 6 hours, with a banner explaining it.
   Done wrong: shipping a hotfix that also adds a new feature.

31. **When weekly content gets thin, slow the cadence and go deeper.** Thin updates stop moving retention [20]. If two updates in a row show no D7 lift for returning players, Liveops proposes a slower cadence with one deeper system (crafting, a new progression track, a social feature) and tells players in-game why.
   Done right: "Next update in 2 weeks: cooking! We're taking extra time to make it big."
   Done wrong: the 8th "new seed" update in a row.

32. **Measure every update 7 days later: the new cohort's D1 and returning players' D7.** Write the result in `liveops.md` under the update's entry: what changed, what was expected, what happened, and the decision (keep, adjust, roll back).
   Done right: "v1.4: new-cohort D1 +2 pts (n = 5,300); returning D7 +4 pts. Keep."
   Done wrong: no record, so nobody knows which updates worked.

### Events

33. **Events are data, not code: `Config.Events` with UTC start and end times, tested with a Studio-only time offset.** An event that needs a code change to start will start late or at 03:00 with nobody watching. The event scheduler (see "Luau") reads the list, and a Studio-only `DebugTimeOffset` attribute lets Playtest jump to before, during and after the event.
   Done right: `{ Id = "Halloween26", StartsUtc = 1793404800, EndsUtc = 1794614400 }` tested at −1 h, +1 h and +15 days.
   Done wrong: `if os.date("%m") == "10" then` hardcoded in the shop script.

34. **Announce events 3-7 days ahead, run them 7-14 days, include a free track, and show the end date in-game.** A free track (rewards for playing, not paying) keeps the event good for everyone ([[10 Retention and Social]]). The end time shows as a countdown in the event UI and on the event board.
   Done right: "Halloween event: 12 days left. Free pumpkin track: 7/10."
   Done wrong: an event that ends without warning and takes unspent progress with it.

35. **Event currencies convert or expire with a clear warning at least 48 hours before the end.** At the end, convert leftover event currency to a normal reward at a stated rate, or let it expire after 48 hours of warnings in the UI. Log both with `LogEconomyEvent`.
   Done right: "Candy converts to coins at 10:1 when the event ends in 2 days."
   Done wrong: 4,000 candy silently set to 0.

36. **Limited items are honest: say whether an item can return, and never fake scarcity.** If an item might return in a future event, say "Event item" rather than "Never coming back". Fake timers and fake stock counts break the studio's honesty rules ([[00 For Any AI]], [[09 Shops and Monetization]]).
   Done right: "Halloween 2026 item. May return in future Halloween events."
   Done wrong: a "Last chance! 2 left!" counter that never changes.

37. **Live events run by the owner are short, scheduled, announced and server-scripted.** A live event (a boss everyone fights at once, a rain of rare drops, a dance party) is 15-30 minutes, announced at least 24 hours ahead, and triggered by the owner through a server-checked admin command that starts a pre-built script. Nothing is improvised on live servers.
   Done right: "Saturday 18:00 UTC: Meteor Shower live event for 20 minutes", started by `/event meteor` from the owner's account.
   Done wrong: an admin flying around spawning untested items.

38. **Seasonal events follow the real calendar and are built a week early.** Seasonality affects traffic [1], and fan sites track seasonal events such as Grow a Garden's Christmas schedule [32]. Keep a 12-month calendar in `liveops.md` with Halloween, winter holidays, the new year, spring and summer events, each built and tested at least 7 days before its start.
   Done right: the winter event is built in November and tested with the time offset.
   Done wrong: starting the winter event on December 23.

### Notifications and communication

39. **Notifications go out once per real event, only to opted-in players, with launch data that lands them on the new content.** Experience notifications reach opted-in users 13+, require 100+ visits and a game not under moderation, and carry launch data readable through `Player:GetJoinData()` [13][14]. The opt-in prompt comes through `ExperienceNotificationService` after a good moment [15]. One notification per update or event start; never daily "come back" pings ([[15 Discovery and Growth]]).
   Done right: "The Volcano update is live! Your first lava egg is waiting." Opens at the volcano portal.
   Done wrong: three notifications in one day for small things.

40. **Patch notes, the in-game "What's new" panel, the description's update line and Discord say the same thing at the same minute.** One source text in `liveops.md`, copied to all four. Plain words a 10-year-old can read: NEW, CHANGED, FIXED, with no developer jargon.
   Done right: the same three lines everywhere at 15:00.
   Done wrong: Discord says the update is out; the game still shows the old version for an hour.

41. **Tell players about known problems within an hour, in-game.** A live banner (from live config) says what's wrong and when it'll be fixed. Silence makes players assume the worst, and honest notes build trust.
   Done right: "We know some coins aren't saving. A fix is coming tonight. Your progress is safe." (only if it is)
   Done wrong: saying nothing while players lose progress.

### Incidents

42. **Data incidents: stop the damage first, then restore from versions.** Turn off the feature with a flag, or ask the owner to shut down servers if saves are being corrupted. Then find affected players in the logs and restore their saves with `DataStore:ListVersionsAsync` and `GetVersionAsync` (code in [[13 Building It Right]]). Never rename the DataStore to "reset" data; that wipes everyone.
   Done right: flag off in 10 minutes, 34 affected saves restored from the version before the bug, each logged.
   Done wrong: rolling everyone back a day.

43. **Duplication exploits: patch first, then correct the economy with a logged, reversible change; never mass-wipe.** Find the dupe path (usually a trade, a remote without ownership checks, or a race on leave). Patch it. Then correct only accounts with clear evidence (an impossible economy log), keep the corrections in a DataStore key so they can be reversed, and tell players plainly what happened.
   Done right: "Patched the trade dupe. Duplicated pets were removed from 112 accounts that received them from the exploit."
   Done wrong: resetting every player's pets.

44. **Purchase failures: never grant by hand without a record; fix `ProcessReceipt` and let Roblox retry.** Roblox calls `ProcessReceipt` again for unacknowledged purchases, so a fixed callback grants them when the player returns ([[09 Shops and Monetization]]). If a player was charged and the grant can't be recovered automatically, the owner handles it through Roblox's support processes, with a record in `liveops.md`.
   Done right: a fixed callback publishes; affected players get their items on next join, once.
   Done wrong: an admin command that gives items to anyone who complains.

### Growth after launch

45. **Ads run only after the gate, and only to amplify something that already retains.** Ads Manager offers Plays and Engagement objectives, with Engagement costing more per play [7], and sponsored placements appear on Home, Discover and in search [8]. Ads don't fix a falling organic trend [5]. Spending is the owner's decision; agents write the plan and read the results ([[15 Discovery and Growth]]).
   Done right: a 7-day Plays campaign after soft launch, judged by the ad cohort's D1 against organic.
   Done wrong: ads during soft launch to "get numbers up".

46. **Time ads, creator videos and codes to land in the first 48 hours of an update.** New players then meet fresh content and full servers, and the team is already watching. One calendar in `growth.md` holds the update slot, the creator embargo and the ad start.
   Done right: update Saturday 15:00; ads from Saturday morning for 7 days; creator videos from 16:00.
   Done wrong: an ad campaign that ends the day before the update.

47. **Tune rewarded video like any feature: measure completion, retention and spend before and after.** Rewarded video is optional, only shown to users 13+, and pays creators by impressions; higher completion (90%+) or a Minimal maturity rating may earn more [24]. Roblox announced more placements and a Studio plug-in for Q4 2026 [25]. Place it at natural boost moments, cap it per day, and roll it back if D7 or payer conversion falls.
   Done right: one offer after a failed hatch, 3 per day, with a 7-day before and after read.
   Done wrong: an ad prompt on every shop open.

48. **Plan the next 3 updates before launch, and keep the 4-week calendar full.** The launch cohort decides whether to stay in its first week or two. Update #1 is built during soft launch, ready behind a flag, and ships 7-10 days after launch. `liveops.md` always shows the next 4 weeks: update slots, events, codes and expected targets.
   Done right: update #1 ships on day 8; #2 and #3 are in production.
   Done wrong: launching with nothing in the pipeline.

49. **Keep a live-ops log: every release, flag change, live config change, event start, incident and campaign, with the UTC time and the result.** Without a log, nobody can match a change in the numbers to its cause. The log is the "Log" section of `liveops.md`, newest first, one line each.
   Done right: `2026-11-14 15:02 · v1.4 published · servers restarted 15:05 · errors 0 at 16:00`.
   Done wrong: "we changed something last week, I think".

50. **If 3 focused updates don't move RFY-cohort D1 or D7, tell the owner plainly and propose a pivot or a new game.** Retention from the players Roblox sends is what earns distribution [1]. When three updates aimed at the weakest number fail, Lead writes a short honest note: what was tried, the numbers, and two options (a bigger change to the core loop, or moving the team to the next pitch).
   Done right: "Three onboarding fixes moved D1 from 14% to 16%. Recommend reworking the core loop or starting the next pitch."
   Done wrong: a fourth small tweak, then a fifth.

## Step by step

### Getting to launch, in 16 steps
1. **Liveops** creates `liveops.md` from the template at the end of this chapter: analytics contract, metrics to watch, events calendar, next 3 updates, log.
2. **Liveops and Builder** agree the analytics contract: 6-10 onboarding steps, economy events for every currency, 3-5 recurring funnels (shop, rounds, crafting), 5-10 custom events. Names are final (Rule 13).
3. **Builder** implements the events server-side behind an `Analytics` module with once-per-player guards (see "Luau").
4. **Builder** adds `Config.Flags` for every system and the live-config service (Rules 28-29).
5. **Builder** adds the Config validator (Rule 6) and the event scheduler with the Studio time offset (Rule 33).
6. **Merchant** lists every pass and product with its Config key. Lead asks the owner to create them on Creator Hub and send the IDs.
7. **Builder** fills the real IDs into Config. The validator shows 0 placeholders.
8. **Playtest** runs the save matrix (first join, autosave, leave, stop server, rejoin, hop) in a 2-player local server and writes the evidence.
9. **The owner** turns on Studio access to API services for the published place, so DataStores work in Studio tests ([[13 Building It Right]]).
10. **Reviewer** runs the security and money review ([[13 Building It Right]] checklist) and signs it.
11. **Splash and Liveops** deliver the icon, 4 thumbnails, title, description, genre and social links ([[11 Thumbnails, Icons and the Store Page]], [[15 Discovery and Growth]]).
12. **Producer** runs the pre-launch checklist below and writes the gate report.
13. **The owner** publishes for soft launch (public but unpromoted, or with play access for a test group), makes the test purchases, and sets the store page.
14. **Liveops** reads the funnel, D1 and errors every 2-3 days of soft launch and files the top leak as a task for its owner.
15. **Lead** decides with the owner when the soft-launch gate passes (Rule 2).
16. **Lead** schedules launch day (Rule 9), with update #1 ready behind a flag (Rule 48).

### Launch day runbook (times in UTC, assuming a 16:00 Thursday launch)
- **12:00** Producer confirms the gate report is current, with no new code since the gate.
- **14:00** Liveops opens Creator Hub: the real-time view (if available), Error Report, Performance, Funnels and Home Recommendations. Writes the starting numbers in the log.
- **15:30** The owner confirms the store page fields and thumbnails.
- **16:00** The owner promotes the game (makes it public or announces it). Discord announcement. Codes go live.
- **16:15** Liveops joins a live server from a phone and a PC: first session works, a test purchase by the owner is granted once, save loads on rejoin.
- **16:30** Search check from a non-owner account (Rule 8).
- **17:00, 18:00, 19:00, 20:00, 21:00, 22:00** Hourly check: new red errors in Error Report, server memory trend, purchase grants, funnel step 1-3 numbers. One log line each.
- **22:00** Liveops writes the day-0 summary and the hotfix list for Friday. Lead assigns the fixes.
- **Friday 10:00** Hotfix build passes the shortened release check. The owner publishes and restarts servers before the weekend peak.

### Shipping an update, in 14 steps
1. **Architect** writes the update plan in `plan.md`: headline, target metric (D1, D7 or D30), the one main change, flags, clip moments ([[15 Discovery and Growth]]).
2. **Balance** checks the update against the economy sim (new sources and sinks) and updates `economy.md`.
3. **Builder, Frame, Scenic, Librarian, Merchant** build behind a flag that defaults off (`Config.Flags.<Feature> = false`).
4. **Builder** adds any schema change: a new field with a default (reconcile), or a migration step and a `CURRENT_VERSION` bump (Rule 27).
5. **Liveops** adds any new analytics events to the contract and writes the patch notes, the countdown time and the update code.
6. **Splash** makes one update thumbnail; the current winner stays active [12].
7. **Playtest** runs the release check: the 2-player local server, the save matrix below, the Device Emulator, purchases of changed products, and the old-save test.

   | Save test | Expected |
   |---|---|
   | Load a save made on the live version | Migrates; all old values intact; new fields default |
   | Autosave, then leave within 1 s | Rejoin shows the latest value |
   | Stop the server with 2 players | Both saves written within the deadline |
   | Hop servers quickly (leave, join a new server at once) | Waits for the lock, then loads the latest data |
   | Load a save with a higher `Version` than this build | Refuses to save it and asks the player to rejoin |
8. **Reviewer** reviews new remotes, purchases and saves.
9. **Producer** signs the release report.
10. **Liveops** turns on the countdown 3-7 days ahead through live config, and Discord sneak peeks start.
11. **The owner** publishes at the slot, then turns the feature flags on (or they default on in this build), then restarts servers.
12. **Liveops** watches for 6 hours (Rule 24), logging each check.
13. **Liveops** sends the update notification to opted-in players [13][14].
14. **Liveops** writes the 7-day result (Rule 32).

### Hotfix, in 9 steps
1. Liveops writes the bug in the log with the time it started, the evidence and the number of players affected.
2. If it touches data or money, turn off the feature with its flag immediately (Rule 28) and show a banner (Rule 41).
3. Builder makes the smallest possible fix, in the affected module only.
4. Playtest reproduces the bug before the fix and confirms it's gone after, in a 2-player local server.
5. Playtest runs the save matrix if the fix touches saving, and the purchase test if it touches money.
6. Reviewer reviews the diff.
7. Producer signs a short release report.
8. The owner publishes and restarts servers.
9. Liveops removes the banner, writes the patch-note line ("FIXED: ...") and logs the result after 24 hours.

### Running an event, in 12 steps
1. Pick the event type from the "Event types" table and write it in the `liveops.md` calendar with UTC start and end times.
2. Architect writes the event plan: free track rewards, any paid items (Merchant), event currency and its conversion rule, the end-of-event behavior.
3. Balance checks event rewards against the sim, so the event doesn't flood the main economy.
4. Builder adds the event to `Config.Events`. Content is gated by the scheduler, not by code edits.
5. Frame builds the event UI: the track, the countdown, the currency display, the end warning (48 h before).
6. Scenic builds the event decorations as a model the scheduler parents into the map at start and removes at end.
7. Playtest tests with `DebugTimeOffset` at 1 hour before, 1 minute after start, the middle, 47 hours before the end (warning shown), and 1 minute after the end (conversion runs once).
8. Liveops writes the announcement, the code and the notification text.
9. The event build ships in a normal update at least 3 days before the start, with the event dormant.
10. The scheduler starts it at the UTC time with nobody touching anything. Liveops watches the first hour.
11. Liveops reads participation (share of DAU who earned at least one free-track reward), the event's economy flow, and D7 of event-period joiners.
12. After the end, Liveops writes the event's results and lessons in `liveops.md`.

### Weekly metrics review, in 10 steps (every Monday)
1. Open Creator Hub Analytics. Write last week's numbers in the `liveops.md` metrics table: DAU, new players, D1, D7, D30, median session length, payer conversion, ARPDAU, errors per session.
2. Write each number's sample size (Rule 16).
3. Split retention by acquisition source [5] and by device.
4. Compare with the benchmark set [5] and the same week last month.
5. Read the onboarding funnel and mark the biggest drop.
6. Read the economy: sources vs sinks per currency, against `economy.md`.
7. Read the Home Recommendations tab: impressions, qPTR and signal trends [1].
8. Read Error Report and Performance: new errors, crash rate, memory, frame rate.
9. Check the action log (`liveops.md` and `growth.md`) for what changed last week.
10. Write a 5-line summary with one recommended action and send it with `cli.mjs say --to lead`.

### Incident response
| Incident | First 15 minutes | Next | Done when |
|---|---|---|---|
| Saves lost or corrupted | Flag off the feature; if spreading, the owner shuts down servers; banner | Find affected UserIds in logs; restore from versions; fix and test the save matrix | Restored saves verified; fix released; patch note |
| Duplication exploit | Flag off trading or the affected system; banner | Patch the remote; list accounts with impossible economy logs; logged, reversible correction | Patch released; correction log saved |
| Purchases not granted | Check `ProcessReceipt` errors in the Error Report; don't grant by hand | Fix the callback; Roblox retries unacknowledged purchases on rejoin | Test purchase granted once; affected players confirmed |
| Server crashes or memory climb | Note the time and server count; check Performance | Find the leak or the heavy loop ([[13 Building It Right]]); hotfix | Memory flat for 2 hours after the fix |
| Exploit (speed, fly, teleport, auto-farm) | Note how; check economy logs | Server-side check ([[13 Building It Right]]); no mass bans by agents | Patch released |
| Bad live config | Restore `LiveConfig/previous`; refresh all servers | Find why validation allowed it; tighten the validator | Values verified on 2 live servers |

## Pre-launch checklist (Producer's final gate)

**Game**
- [ ] The first five minutes work for a new player on a phone, with touch only ([[01 The First Five Minutes]], [[08 Mobile]]).
- [ ] A 2+ player local server test shows no red errors in Output on the server or any client ([[13 Building It Right]]).
- [ ] Every remote is in the contract table, validated and rate-limited; Reviewer signed off on money, saves and security.
- [ ] Every new system has a `Config.Flags` entry, and turning it off disables it cleanly.

**Data and money**
- [ ] Saves load, autosave, save on leave and on `BindToClose`; rejoining shows the same data; save data has a `Version` field.
- [ ] A save with a newer `Version` is never overwritten (tested).
- [ ] Every pass, product and badge ID in `ReplicatedStorage.Shared.Config` is real, created by the owner on Creator Hub; the validator shows 0 placeholders.
- [ ] `ProcessReceipt` grants each test purchase exactly once and survives a rejoin and a leave during purchase ([[09 Shops and Monetization]]).
- [ ] The owner enabled Studio access to API services and confirmed DataStores work in the published place.

**Store page and settings** (the owner sets these, from drafts by Splash and Liveops)
- [ ] Icon, 3-5 thumbnails, title and description are approved ([[11 Thumbnails, Icons and the Store Page]]).
- [ ] Genre, playable devices, server size, maturity questionnaire, private server price (if any) and social links are set.

**Analytics and live ops**
- [ ] Onboarding funnel, economy, progression and custom events fire in a test session, in order, once.
- [ ] Live config reads at start, refreshes on message and every 5 minutes, and rejects invalid values (tested).
- [ ] Event scheduler tested with the Studio time offset.
- [ ] `liveops.md` lists every analytics event, the metrics to watch, the next 3 updates and the 4-week calendar.
- [ ] Patch notes and the "What's new" text for launch are written and readable by a 10-year-old.

## Soft launch

- Release quietly first: public but unpromoted, or private with play access for a test group through the place permissions. Use the owner's friends, a group and small invited sessions, then a trickle of strangers.
- Run it for 7-14 days, not hours. Watch Output and the Error Report, D1, median session length and the onboarding funnel. Fix the biggest leak first (Rule 17).
- Change one major thing per update so you know what moved the numbers.
- Write a soft-launch report every 3 days: sample size, funnel, D1, errors, top 3 player complaints (from Discord or the group), the fix list.
- Promote (ads, creators, announcements) only after soft-launch fixes land and retention looks healthy for the genre. Pulse supplies chart comparisons from `cli.mjs market`; the team doesn't invent targets for other games.
- Soft-launch exit criteria (studio targets; tune per genre): no funnel step before "first upgrade" losing more than 25% of the players who reached it; zero save-loss reports; zero ungranted purchases; error rate stable or falling; and D1 trending up across two reads.

## Metrics: definitions

| Metric | Definition | Notes |
|---|---|---|
| D1 retention | Of new players whose first session was on day 0, the share who play again on day 1 | Reflects the first session |
| D7 / D30 retention | Same, for day 7 / day 30 | Reflect depth and long-term goals; RFY now uses a 28-day view [3] |
| Session length | Time from join to leave for one session | Use the median as well as the mean; AFK players skew means |
| Sessions per DAU, playtime per DAU | How often and how long an active player plays per day | |
| DAU / MAU / CCU | Daily and monthly unique players; concurrent players at a moment | CCU peaks on update slots [21] |
| Payer conversion | Unique paying players ÷ active players in the same period | |
| ARPPU | Robux revenue ÷ paying players in the period | |
| ARPDAU | Robux revenue ÷ DAU | |
| Funnel step conversion | Players reaching step N+1 ÷ players reaching step N | Fix the biggest drop first |
| qPTR | Engaging plays ÷ RFY impressions, as Roblox defines it [1] | Leading indicator; read daily after changes |
| Play days, spend days, co-play days | Roblox's per-user recommendation signals [1] | Averages per user, not totals |
| Errors per session | Error Report count ÷ sessions | Watch after every release |

- Compare **cohorts** (players who joined before and after an update), not raw totals. Segment by device (phone vs PC), by acquisition source [5], and new vs returning.
- Small numbers are noisy. Don't react to a single day or a handful of players (Rule 16).
- Retention problems usually live in the first session. Monetization problems usually live in offer timing and value, not price.

## Diagnosis table: symptom → cause → fix

| Symptom | Likely cause | Where to look | First fix |
|---|---|---|---|
| Low qPTR, normal D1 | The tile doesn't match the audience, or loading is slow | Home Recommendations tab [1], thumbnail results [11] | A new honest thumbnail test; faster first frame ([[01 The First Five Minutes]]) |
| Normal qPTR, low D1 | The first session doesn't deliver what the tile promised | Onboarding funnel | Fix the biggest step drop; first reward under 30 s (target) |
| Big drop at funnel step 1-2 | Spawn confusion, UI covering the screen, mobile controls | Kid Tester replay, Device Emulator | One pointer, one action ([[05 UI and HUD]], [[08 Mobile]]) |
| Good D1, poor D7 | Nothing to come back for | Retention curves, quest completion | Daily and weekly hooks ([[10 Retention and Social]]) |
| Good D7, poor D30 | Content runs out; no social or long goals | Progression events (where players stop) | Long-tail collection, updates, social goals |
| Sessions long, play days low | Grindy single sessions, no reason to return | Session histogram, play days | Timers that finish tomorrow, daily rewards |
| Low payer conversion, normal retention | Offers shown at the wrong time or with poor value | Shop funnel | Move the first offer after the first big win ([[09 Shops and Monetization]]) |
| Payer conversion drops after an update | A price, offer or UI change | Shop funnel before and after | Roll back that change |
| Economy inflating fast | A source the sim missed, or an exploit | Economy sources by transaction type | Patch the source; add a sink ([[04 Progression and Economy]]) |
| Error spike after release | New code path | Error Report, Output in a 2-player test | Hotfix or flag off |
| Memory climbs over hours | A leak: connections or tables not cleaned | Developer Console Memory on a long-running server | Find and clean ([[13 Building It Right]]) |
| Impressions fall, signals flat | Seasonality or stronger competitors [1] | Benchmark set [5] | Ship the next planned update; don't panic-change |
| Impressions fall, qPTR fell 3-5 days earlier | Something in the last change | Action log | Roll back that change [1] |

## Creator Hub analytics and funnels

- Creator Hub has dashboards for engagement, retention, monetization, acquisition (including Home Recommendations [1] and retention by acquisition source [5]), audience, economy, funnels, performance (crashes, memory, frame rate, server health) and error reporting.
- **Funnels:** the onboarding funnel comes from `LogOnboardingFunnelStepEvent`; recurring funnels (shop, rounds, crafting) come from `LogFunnelStepEvent` with a new funnel session ID per attempt. Read the biggest step-to-step drop first.
- **Economy:** `LogEconomyEvent` powers sources vs sinks per currency. Compare it with Balance's simulation in `economy.md` ([[04 Progression and Economy]]).
- **Benchmarks:** choose the benchmark set that matches the game's genre and size [5], and use it in every weekly review.
- Dashboards lag behind real time. Verify that events fire with no errors in Studio, then confirm the data appears after real sessions.
- Roblox has said it would publish more about how the algorithm works in Creator Analytics [6] and the full list of RFY signals with their relative importance [3]. Check the Discovery page [1] every month and update this chapter if it changed.

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
- Keep names and SKUs stable and low-cardinality. Changing an event name splits its history (Rule 13).

### The standard analytics contract (copy into `liveops.md`, then adapt)
| Kind | Name | When | Value / fields |
|---|---|---|---|
| Onboarding 1 | Spawned | Character first spawns | |
| Onboarding 2 | FirstAction | First core action (collect, hit, plant) | |
| Onboarding 3 | FirstReward | First currency or item gained | |
| Onboarding 4 | FirstSell / FirstSpend | First conversion or spend | |
| Onboarding 5 | FirstUpgrade | First upgrade bought | |
| Onboarding 6 | FirstRare | First rare-or-better item | |
| Onboarding 7 | FirstAreaUnlock | First new area or world | |
| Onboarding 8 | FiveMinutes | 5 minutes of play in the first session | |
| Funnel | Shop | Opened → ViewedItem → PromptShown → Purchased | funnel session per open |
| Funnel | Round | Queued → Started → Finished → Rewarded | per round |
| Progression | Worlds | Start and complete per world | level = world index |
| Economy | every currency | every source and sink | transaction type + SKU |
| Custom | UpdateSeen | Player opened "What's new" | |
| Custom | JoinedFromNotification | Join with notification launch data | |
| Custom | JoinedFromReferral | `ReferredByPlayerId` present [16] | |
| Custom | CodeRedeemed | A code redeemed | custom field: code |
| Custom | EventTrackReward | Event free-track reward claimed | value = tier |

## Update cadence, events and patch notes

- Early on, ship small fixes as needed and a content update every 7-14 days. Then settle into a predictable rhythm (same weekday and UTC hour) so players learn when to check [19][21].
- Release when someone can watch the first 6 hours (Rule 24).
- **Events:** announce in-game 3-7 days ahead, run 7-14 days, include a free track, an event badge and an event currency that converts or expires clearly. Drive them from `Config.Events` with UTC start and end times ([[10 Retention and Social]]).
- **Feature flags:** each new system has an `Enabled` flag in Config, overridable by live config, so a broken feature can be switched off without a republish (Rules 28-29).
- **Patch notes**, in plain words a 10-year-old can read. Show them in the in-game "What's new" panel and in the description's update line:
```
v1.4 Volcano Update (2026-11-14)
NEW: Volcano world with 6 lava pets
CHANGED: Sell button moved next to the backpack on phones
FIXED: Coins sometimes not saving when leaving quickly
```

### The live-ops calendar (template for `liveops.md`)
| Week | Update slot (UTC) | Headline | Target metric | Event | Code | Ads / creators |
|---|---|---|---|---|---|---|
| Launch (W0) | Thu 16:00 | Launch | D1 | none | `LAUNCH` (14 d) | seed only |
| W1 | Sat 15:00 | Update #1: second world | D7 | none | `WORLD2` | small Plays test |
| W2 | — | hotfixes only | — | Double Coins weekend (live config) | — | — |
| W3 | Sat 15:00 | Update #2: trading | Co-play, D7 | none | `TRADE` | creator early access |
| W4 | — | hotfixes only | — | Live event: meteor shower (Sat 18:00) | — | — |
| W5 | Sat 15:00 | Update #3: seasonal event | D30 | Seasonal event 12 days | `SEASON` | Plays campaign |

### Event types
| Type | Length | Built as | Good for | Watch |
|---|---|---|---|---|
| Double rewards weekend | 48-72 h | Live config multiplier | Play days, reactivation | Economy inflation |
| Limited world or area | 7-14 days | `Config.Events` + a map model | D7, chart spike | Performance with new assets |
| Seasonal (Halloween, winter, summer) | 10-21 days | Event + decorations + track | D30, nostalgia | Starts on time; ends cleanly |
| Live event (owner-run) | 15-30 min | Pre-built server script, admin command | Concurrency, clips | Server load at peak |
| Collection race | 7 days | Event currency + track | Spend days, co-play | Free track fairness |
| Community goal | 3-7 days | Global counter via MemoryStore | Social, co-play | Cross-server limits ([[13 Building It Right]]) |
| Return week | 7 days | Rewards for lapsed players on return | Reactivation | Abuse by alt accounts |

## Feature flags and live config

- Defaults live in `ReplicatedStorage.Shared.Config` (`Config.Flags`, `Config.Multipliers`, `Config.Banner`). Live overrides live in one DataStore key, read by the `LiveConfig` service on the server.
- The server is the only reader of live config. The client learns the current state from the server (an attribute on `ReplicatedStorage` or a state remote), never from the DataStore.
- Validation: unknown keys are ignored; booleans must be booleans; multipliers are clamped (for example 0.5-3, studio range); banner text is at most 120 characters and written by the owner only.
- Change flow: the owner runs an in-game admin command (checked on the server against the owner's `UserId`) that writes the new value through `UpdateAsync`, saves the old value as `previous`, and publishes a "refresh" message. Every server re-reads the key and applies it. Code is in "Luau".
- Rollback: the same admin command with `rollback` restores `previous`.

## Safe data migrations (versioned save data)

- Every save has `Version`. Each schema change adds one migration step and bumps `CURRENT_VERSION`. Migrations run on load, in order, and never delete data they don't understand.
- Fill missing keys from defaults on every load (reconcile), so adding a field never needs a migration.
- **Never downgrade.** During a rollout, old and new servers run side by side. If a server loads a save with `Version` newer than it knows, it must not save over it. Kick the player politely with "Please rejoin to get the latest update."
- Never rename the DataStore to "reset" data; that wipes everyone. Know how to restore one player with `DataStore:ListVersionsAsync` / `GetVersionAsync` ([[13 Building It Right]]).
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

- New servers run the latest published version; old servers keep old code until they empty or are restarted. After an update, the owner uses Creator Hub's server restart (migrate to the latest update) option to move players to fresh servers (Rule 26).
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
- Before a planned restart, show a 5-10 minute in-game warning through live config (`Banner`) so players finish a round or a trade.

## Roblox ads and sponsorships

- Roblox's ad tools (sponsored experiences on Home, Discover and search [8], search ads by keyword [9], Plays and Engagement objectives [7]) buy impressions and amplify whatever your funnel already is. Spend only after soft launch shows healthy D1 and a working first session (Rule 45). Spending Robux is the owner's decision.
- Start small with auto-bidding [7], change one thing at a time, and judge each campaign by the D1, D7 and payer conversion of the players it brought, not by clicks [5].
- Ad creative follows the same honesty rules as store art ([[11 Thumbnails, Icons and the Store Page]]). Sponsored traffic arriving at a confusing first minute is wasted.
- Roblox's advertising policies and Ads Manager change often; the DevForum ads tag lists the latest posts (for example the July 2026 Kids and Select launch and new advertising policies) [10].
- Time big campaigns with an update or event, so new players arrive to fresh content and the team is watching (Rule 46). The full playbook is [[15 Discovery and Growth]].

## Examples from top games

### A fixed update slot is a promise players plan around
**Game:** Grow a Garden ([19])
**Shows:** PCGamesN describes a strict weekly update schedule, with new content every Saturday [19].
**Why it works:** Players know when to come back, so they arrive together, fill servers and play with friends.
**Steal:** One weekday and one UTC hour for every major update, on an in-game countdown (Rules 21, 23).
**Avoid:** Promising weekly if the team can only deliver every two weeks. A broken promise costs more than a slower one.

### The update slot is where the peak happens
**Game:** Grow a Garden ([21])
**Shows:** WN Hub, citing RoMonitor, reported a record 11.7 million concurrent players on Saturday, May 31, 2025, up from 8.9 million the week before [21].
**Why it works:** Fresh content plus a known time concentrates demand into a few hours.
**Steal:** Line up the update, codes, notifications, creator videos and ads in the same 48 hours (Rule 46), and staff the 6-hour watch (Rule 24).
**Avoid:** Shipping a big update with untested save changes. The peak multiplies every bug.

### When weekly events go stale, add depth
**Game:** Grow a Garden ([20])
**Shows:** In August 2025 the developer said weekly events were just too hard to keep fresh and new, and planned to add more depth to farms, with events still in between [20].
**Why it works:** Repeating thin content stops lifting retention; deeper systems give long-term goals that matter for a 28-day algorithm [3].
**Steal:** Measure each update's D7 lift and slow down for a deeper system when two updates in a row do nothing (Rule 31).
**Avoid:** Going quiet. Announce the new cadence and the reason in-game.

### A tiny first version, then a team to run it
**Game:** Grow a Garden ([17][18])
**Shows:** The original creator built it in about three days; Splitting Point, Janzen Madsen's studio, now manages it [17][18].
**Why it works:** A small, complete loop got real players quickly, and live operation scaled up once players proved the idea.
**Steal:** Launch the smallest version with a complete first session and update #1 ready (Rule 48). Plan who runs live ops if it takes off.
**Avoid:** Skipping save safety because the build is small. Growth turns every data bug into a crisis ([[13 Building It Right]]).

### Players look up the schedule, so publish it yourself
**Game:** Grow a Garden ([22][23])
**Shows:** Fan sites such as AllThingsHow and Sportskeeda publish Grow a Garden update and event schedules [22][23], and their dates don't always agree.
**Why it works:** Players want to know when to come back. If the game doesn't tell them clearly, third parties fill the gap, sometimes wrongly.
**Steal:** The exact time in UTC and local time on a countdown board, in the description and in Discord (Rule 23).
**Avoid:** Vague teasers ("soon!") that send players to fan pages.

### Seasonal events are calendar fixtures
**Game:** Grow a Garden ([32])
**Shows:** Fan sites track Grow a Garden's seasonal event schedule, such as a Christmas schedule [32].
**Why it works:** Seasonal events are predictable reasons to return, and seasonality moves platform traffic anyway [1].
**Steal:** A 12-month calendar with seasonal events built and tested 7 days early (Rule 38).
**Avoid:** Starting a holiday event a day before the holiday.

### Watch the leading indicators, not the lagging one
**Game:** The example game in Roblox's Discovery docs ([1])
**Shows:** A qPTR dip on February 28 came before an impression drop on March 3 [1].
**Why it works:** The algorithm reacts to behavior a few days later, so behavior is the early warning.
**Steal:** A daily qPTR, step-3 and D1 check for 7 days after every update, with a rollback threshold (Rule 18).
**Avoid:** Investigating only after impressions fall.

### Long-term retention now drives distribution
**Game:** Games in Roblox's 28-day RFY test ([2][3])
**Shows:** Roblox moved Recommended for You from a 7-day to a 28-day view that measures long-term retention, and said testing surfaced games that retain players better [3]. The DevForum post warned that distribution may fluctuate after the change [2].
**Why it works:** A game with week-4 reasons to play keeps earning impressions after its launch spike.
**Steal:** Every update names its target retention day (Rule 19), and the calendar always has a week-4 goal.
**Avoid:** Treating D1 as the only number.

### Ads don't reverse a falling organic trend
**Game:** Experiences in Roblox's analytics guidance ([5])
**Shows:** Roblox's post on retention by acquisition source says ads aren't meant to fix a declining organic trend, though they can bring new, relevant users [5].
**Why it works:** RFY ranks only on players it brought [1]; paid players don't change that math.
**Steal:** Gate ads on the soft-launch exit criteria (Rules 2, 45) and read ad cohorts separately (Rule 14).
**Avoid:** Spending to cover a broken first session.

### Refresh the tile with every update without losing the winner
**Game:** Experiences using thumbnail personalization ([11][12])
**Shows:** Personalization needs 2+ thumbnails and sends more impressions to each audience's winner [11]; a 2025 change keeps the current winner live while new thumbnails are measured, and traffic adjusts within hours [12].
**Why it works:** A new update thumbnail can be tested cheaply against the proven one.
**Steal:** Add one update thumbnail per update and keep the winner (Rule 23).
**Avoid:** Replacing every thumbnail with update art.

### Opt-in rewards can be measured like any feature
**Game:** Experiences in Roblox's rewarded video program ([24][33])
**Shows:** Rewarded video lets players choose to watch up to 30 seconds of video for an in-game reward, only for users 13+, with creator earnings based on impressions [24][33].
**Why it works:** Players choose it, so it can add value without pressure.
**Steal:** One placement at a natural boost moment, a daily cap, and a 7-day before/after read on D7 and payer conversion (Rule 47).
**Avoid:** Treating ad revenue as free if it costs retention.

### Notifications can land players exactly on the new content
**Game:** Experiences using experience notifications ([13][14])
**Shows:** Notifications reach opted-in users 13+, need 100+ visits and a game not under moderation, and carry launch data the game reads with `Player:GetJoinData()` [13][14].
**Why it works:** The returning player skips the menu and goes straight to what's new.
**Steal:** One notification per update, with launch data that places the player at the update's portal (Rule 39).
**Avoid:** Daily "come back" messages that train players to ignore you.

### Launch-day search can fail; check it
**Game:** Public games in DevForum reports ([28][29])
**Shows:** Developers report public games missing from search, including exact-title searches [28][29].
**Why it works:** Search behavior is outside your control, so verifying it is the only protection.
**Steal:** The day-0 and day-1 search check (Rule 8).
**Avoid:** Pointing creators and ads at a name search that returns nothing.

### Charts reward concentration
**Game:** Games on Roblox's Top Playing Now chart ([26])
**Shows:** Roblox added a Top Playing Now chart to Charts [26]; a DevForum discussion there notes that Up-and-Coming has included games from 10K to over 200K CCU [26].
**Why it works:** Charts reflect what many players are doing at the same time, which fixed update slots create.
**Steal:** Concentrate the update, codes and announcements into one slot (Rule 21).
**Avoid:** Expecting Up-and-Coming to be a small-game lane.

## By genre

- **Simulator:** content updates every 1-2 weeks (a new world, egg or pet set). Events: double luck weekends, limited eggs. Watch economy inflation after every new world; Balance checks multipliers against the sim. Patch notes headline the new pets.
- **Tycoon:** updates add a new floor, theme or upgrade tier; events are limited decorations and timed boosts. Watch for players finishing all content (D30): add rebirth layers before the top is reached. Migrations are common because plot layouts are saved; test old plots load.
- **Idle and incremental:** updates add a new prestige layer or a new generator type. Events: offline-earnings boosts, limited generators. Watch number overflow (use the studio's big-number format) and save size.
- **Obby:** updates are stage packs on a fixed day (10-20 stages per pack is a studio target). Events: seasonal stage packs and speedrun weeks with leaderboards. Watch completion funnels per stage; fix the stage where most players quit before adding more.
- **Roleplay and life sim:** updates add houses, vehicles, jobs and map areas. Events: seasonal map decorations and limited cosmetics. Server stability and moderation tools matter more than content speed. Watch co-play and party share.
- **Party and social hangout:** updates add minigames or rounds; events are live owner-hosted sessions. Watch average players per server; a low-population server kills the fun, so concentrate players at update slots.
- **Story and puzzle:** updates are chapters with a countdown; between chapters, add small replay goals (badges, secrets). Watch the chapter-completion funnel; announce the next chapter's date at the end of each one.
- **Action and combat:** updates add enemies, bosses and weapons; events are boss rushes and live bosses. Watch server performance under combat load and hit-validation errors after each update ([[13 Building It Right]]).
- **Battlegrounds:** each update headlines a new character or moveset. Balance patches are announced with numbers ("Dash cooldown 4 s → 5 s"). Watch character pick rates and win rates; nerf or buff in small steps.
- **Shooter:** updates add maps, modes and weapons; seasons with a free track. Watch matchmaking times and the server fill rate; anti-cheat fixes ship as hotfixes.
- **Horror:** updates add floors, monsters or chapters; events are seasonal (Halloween is the big one). Watch the chapter funnel and party sizes; creators matter at each update ([[15 Discovery and Growth]]).
- **Survival:** updates add biomes, threats and crafting tiers; seasons can reset worlds with announced dates. Watch base save sizes and long-session server memory.
- **Tower defense:** updates add towers or units and maps; events add limited units and co-op modes. Watch unit usage and win rates per map; balance in small steps with announced numbers.
- **RNG and collection:** updates add new pools and rarities; events are limited-time pools and luck weekends. Show odds for every pool ([[03 Rarity and RNG]]). Watch luck multipliers against the sim; a stacked luck event can break rarity forever.
- **Racing and vehicles:** updates add cars and tracks; events are time trials with leaderboards. Watch vehicle physics performance on phones after every new car.
- **Sports:** updates add stadiums, abilities and modes; events follow real-world sports seasons (unbranded). Watch match fill rates and team balance.
- **Farming and fishing:** updates add seeds, fish, zones and weather; events are seasonal crops and weather events. Grow a Garden is the reference for a weekly cadence and its limits [19][20]. Watch the crop economy after each new seed.

## Luau

### Config validator at server start
```lua
--!strict
-- ServerScriptService/Services/ConfigCheck
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local ConfigCheck = {}

local function scan(kind: string, ids: {[string]: number}, problems: {string}): number
	local count = 0
	for name, id in ids do
		count += 1
		if typeof(id) ~= "number" or id <= 0 or id % 1 ~= 0 then
			table.insert(problems, `{kind}.{name}`)
		end
	end
	return count
end

function ConfigCheck.Init()
	local problems: {string} = {}
	local passes = scan("GamePasses", Config.GamePasses, problems)
	local products = scan("Products", Config.Products, problems)
	local badges = scan("Badges", Config.Badges, problems)
	if #problems == 0 then
		print(`[Config] OK: {passes} passes, {products} products, {badges} badges, 0 placeholders`)
	else
		warn(`[Config] {#problems} placeholder IDs: {table.concat(problems, ", ")}`)
	end
	-- ShopService skips any entry whose ID is not a positive integer, so a placeholder never prompts.
end

return ConfigCheck
```

### Analytics wrapper with once-per-player onboarding
```lua
--!strict
-- ServerScriptService/Services/Analytics
local AnalyticsService = game:GetService("AnalyticsService")

local Analytics = {}

local STEPS = { "Spawned", "FirstAction", "FirstReward", "FirstSell", "FirstUpgrade", "FirstRare", "FirstAreaUnlock", "FiveMinutes" }

-- data.Onboarding.Logged uses string keys ("1", "2", ...) so the save never holds a sparse array.
function Analytics.onboarding(player: Player, data: any, step: number)
	local key = tostring(step)
	if data.Onboarding.Logged[key] then return end
	-- Funnel steps must arrive in order; skip ahead only after earlier steps are logged.
	for earlier = 1, step - 1 do
		if not data.Onboarding.Logged[tostring(earlier)] then return end
	end
	data.Onboarding.Logged[key] = true
	AnalyticsService:LogOnboardingFunnelStepEvent(player, step, STEPS[step])
end

function Analytics.source(player: Player, currency: string, amount: number, balanceAfter: number,
	transactionType: Enum.AnalyticsEconomyTransactionType, sku: string)
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, currency, amount,
		balanceAfter, transactionType.Name, sku)
end

function Analytics.sink(player: Player, currency: string, amount: number, balanceAfter: number,
	transactionType: Enum.AnalyticsEconomyTransactionType, sku: string)
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Sink, currency, amount,
		balanceAfter, transactionType.Name, sku)
end

return Analytics
```
Call `Analytics.source` from the one place that grants currency (the Economy module), so no source is ever missed ([[13 Building It Right]]).

### Event scheduler with a Studio-only time offset
```lua
--!strict
-- ServerScriptService/Services/Events
-- Config.Events = { { Id = "Halloween26", StartsUtc = 1793404800, EndsUtc = 1794614400 }, ... }
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Config = require(ReplicatedStorage.Shared.Config)

local Events = {}
local active: {[string]: boolean} = {}
local startedEvent = Instance.new("BindableEvent")
local endedEvent = Instance.new("BindableEvent")
Events.Started = startedEvent.Event
Events.Ended = endedEvent.Event

function Events.now(): number
	local offset = 0
	if RunService:IsStudio() then
		local attr = workspace:GetAttribute("DebugTimeOffset") -- seconds; set by Playtest in Studio only
		if typeof(attr) == "number" then offset = attr end
	end
	return os.time() + offset
end

function Events.isActive(id: string): boolean
	return active[id] == true
end

local function step()
	local t = Events.now()
	for _, ev in Config.Events do
		local shouldBeActive = t >= ev.StartsUtc and t < ev.EndsUtc
		if shouldBeActive and not active[ev.Id] then
			active[ev.Id] = true
			ReplicatedStorage:SetAttribute(`Event_{ev.Id}`, true)
			ReplicatedStorage:SetAttribute(`EventEnds_{ev.Id}`, ev.EndsUtc)
			startedEvent:Fire(ev.Id)
		elseif not shouldBeActive and active[ev.Id] then
			active[ev.Id] = nil
			ReplicatedStorage:SetAttribute(`Event_{ev.Id}`, false)
			endedEvent:Fire(ev.Id)
		end
	end
end

function Events.Start()
	step()
	task.spawn(function()
		while true do
			task.wait(5)
			step()
		end
	end)
end

return Events
```
End-of-event conversion runs per player and is idempotent: on `Events.Ended` for players in the server, and on load for players who were offline, guarded by `data.EventsConverted[id] = true`, so nobody is converted twice or missed.

### Live config with validation, cross-server refresh and rollback
```lua
--!strict
-- ServerScriptService/Services/LiveConfig
local DataStoreService = game:GetService("DataStoreService")
local MessagingService = game:GetService("MessagingService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Config = require(ReplicatedStorage.Shared.Config)

type Live = { Flags: {[string]: boolean}, Multipliers: {[string]: number}, Banner: string }

local store = DataStoreService:GetDataStore(if RunService:IsStudio() then "LiveConfig_Studio" else "LiveConfig")
local KEY = "state" -- { current = Live, previous = Live? }
local TOPIC = "LiveConfigRefresh"
local REFRESH_SECONDS = 300

local LiveConfig = {}
local current: Live = { Flags = {}, Multipliers = {}, Banner = "" }
local changedEvent = Instance.new("BindableEvent")
LiveConfig.Changed = changedEvent.Event

local getOptions = Instance.new("DataStoreGetOptions")
getOptions.UseCache = false -- always read the newest value

local function sanitize(raw: unknown): Live
	local out: Live = { Flags = {}, Multipliers = {}, Banner = "" }
	if typeof(raw) ~= "table" then return out end
	local t = raw :: {[string]: any}
	if typeof(t.Flags) == "table" then
		for name, value in t.Flags do
			if Config.Flags[name] ~= nil and typeof(value) == "boolean" then
				out.Flags[name] = value
			end
		end
	end
	if typeof(t.Multipliers) == "table" then
		for name, value in t.Multipliers do
			if Config.Multipliers[name] ~= nil and typeof(value) == "number" and value == value then
				out.Multipliers[name] = math.clamp(value, 0.5, 3) -- studio range
			end
		end
	end
	if typeof(t.Banner) == "string" then
		out.Banner = string.sub(t.Banner, 1, 120)
	end
	return out
end

function LiveConfig.flag(name: string): boolean
	local live = current.Flags[name]
	if live ~= nil then return live end
	return Config.Flags[name] == true
end

function LiveConfig.multiplier(name: string): number
	return current.Multipliers[name] or Config.Multipliers[name] or 1
end

local function publishToClients()
	ReplicatedStorage:SetAttribute("Banner", current.Banner)
	for name in Config.Flags do
		ReplicatedStorage:SetAttribute(`Flag_{name}`, LiveConfig.flag(name))
	end
end

function LiveConfig.refresh()
	local ok, raw = pcall(function()
		return store:GetAsync(KEY, getOptions)
	end)
	if not ok then
		warn("[LiveConfig] read failed; keeping current values")
		return
	end
	local state = if typeof(raw) == "table" then raw.current else nil
	current = sanitize(state)
	publishToClients()
	changedEvent:Fire(current)
end

-- Owner only. Called from the Admin remote after the server checks the caller (see below).
function LiveConfig.write(patch: {[string]: any}?, rollback: boolean): boolean
	local ok = pcall(function()
		store:UpdateAsync(KEY, function(old: any)
			local oldState = if typeof(old) == "table" then old else {}
			if rollback then
				if oldState.previous == nil then return nil end -- nothing to roll back to
				return { current = oldState.previous, previous = oldState.current }
			end
			local merged = table.clone(if typeof(oldState.current) == "table" then oldState.current else {})
			for k, v in patch or {} do merged[k] = v end
			return { current = sanitize(merged), previous = oldState.current }
		end)
	end)
	if ok then
		pcall(function() MessagingService:PublishAsync(TOPIC, "refresh") end)
		LiveConfig.refresh()
	end
	return ok
end

function LiveConfig.Start()
	LiveConfig.refresh()
	pcall(function()
		MessagingService:SubscribeAsync(TOPIC, function()
			task.spawn(LiveConfig.refresh) -- the message never carries values; always re-read the store
		end)
	end)
	task.spawn(function()
		while true do
			task.wait(REFRESH_SECONDS)
			LiveConfig.refresh()
		end
	end)
end

return LiveConfig
```
The admin remote's server handler checks the caller before calling `LiveConfig.write`:
```lua
local function isOwner(player: Player): boolean
	if game.CreatorType == Enum.CreatorType.User then
		return player.UserId == game.CreatorId
	end
	local ok, rank = pcall(function() return player:GetRankInGroup(game.CreatorId) end)
	return ok and rank >= Config.AdminMinRank -- for example 254
end
```

### "A new update is out" banner on old servers
```lua
--!strict
-- New servers announce their place version; old servers show a gentle banner.
local MessagingService = game:GetService("MessagingService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TOPIC = "ServerVersion"

pcall(function()
	MessagingService:SubscribeAsync(TOPIC, function(message)
		local v = tonumber(message.Data)
		if v and v > game.PlaceVersion then
			ReplicatedStorage:SetAttribute("NewVersionAvailable", true) -- Frame shows "New update! Rejoin to play it."
		end
	end)
end)

task.delay(15, function()
	pcall(function() MessagingService:PublishAsync(TOPIC, game.PlaceVersion) end)
end)
```
This complements, not replaces, the owner's server restart after an update (Rule 26).

### Stable A/B buckets for new players
```lua
--!strict
-- Same player, same experiment, same bucket, on every server. Assign only in the first session.
local function bucket(userId: number, experiment: string, count: number): number
	local s = `{experiment}:{userId}`
	local h = 0
	for i = 1, #s do
		h = (h * 31 + string.byte(s, i)) % 2147483647
	end
	return h % count -- 0 .. count-1
end

-- Usage (server): store the bucket in the save, then log it as a custom field with funnel events.
-- if data.Stats.Sessions == 1 and data.Experiments.Onboarding == nil then
--     data.Experiments.Onboarding = bucket(player.UserId, "Onboarding_v2", 2)
-- end
```
Run one experiment at a time per funnel, split 50/50, and read it only after both buckets pass the sample rule (Rule 16).

## Checklist
- [ ] Gate report in `games/<slug>/reports/` with evidence for every pre-launch item.
- [ ] Soft launch ran 7-14 days with at least 300 new players before any promotion.
- [ ] A 2+ player local server shows saves surviving leave, rejoin, server hop and server stop (`BindToClose`).
- [ ] Save data has `Version`; an older test save migrates; a newer-version save is never overwritten.
- [ ] Every product granted exactly once in the published place, including leave-during-purchase.
- [ ] Config validator prints 0 placeholders.
- [ ] Onboarding funnel steps fire in order exactly once per player.
- [ ] Economy events cover every source and sink for each currency.
- [ ] The analytics contract in `liveops.md` matches the code, with frozen names.
- [ ] New systems have a `Config.Flags` entry, and turning each off disables it cleanly.
- [ ] Live config reads at start, refreshes on message and every 5 minutes, rejects invalid values, and rolls back.
- [ ] Event start and end times are UTC in Config and were tested with the Studio time offset at the 5 test points.
- [ ] The update slot (weekday and UTC hour) is written in `liveops.md` and shown on an in-game countdown.
- [ ] Patch notes and the "What's new" text are written and readable by a 10-year-old, identical in all four places.
- [ ] Launch day is Thursday or Friday, with the 6-hour watch staffed.
- [ ] Day-0 and day-1 search checks passed.
- [ ] `liveops.md` lists every analytics event, the metrics to watch, the 4-week calendar and the next 3 updates.
- [ ] The weekly metrics review runs every Monday with sample sizes and cohorts.
- [ ] Every release, flag change, event and incident is in the live-ops log with a UTC time.
- [ ] Every update has a 7-day result written (new-cohort D1, returning D7).
- [ ] No placeholder `0` IDs remain in Config at ship time.

## Common mistakes
- Publishing without testing the leave and shutdown save paths, then losing data on the first update.
- A schema change without a version bump, or old servers saving over new-format data during rollout.
- Reacting to one day of numbers, or changing five things in one update and learning nothing.
- Logging analytics from the client, or renaming events every update.
- Onboarding steps that log more than once, so the funnel shows impossible numbers.
- Running ads before the first session works, then blaming the ads.
- Reading totals instead of cohorts, so an ad spike hides a falling organic D1.
- Events that need a code change to start or stop, so one goes live late at night with nobody watching.
- Event currency that silently disappears at the end.
- Fake scarcity: "never coming back" items that come back, or stock counters that never move.
- Patch notes written for developers ("refactored DataService") instead of players.
- Releasing an update and leaving nobody to watch the first hours.
- Leaving half the players on old servers for a day after an update.
- Live config that trusts the message body, or accepts any value without clamping.
- Restoring data by renaming the DataStore, which wipes everyone.
- Granting purchases by hand on request, with no record.
- Mass-wiping the economy after a dupe instead of correcting the accounts with evidence.
- A cadence the team can't keep, followed by weeks of silence.
- Treating D1 as the only number while the algorithm looks at 28 days [3].
- No live-ops log, so nobody can link a change in the numbers to its cause.

## Template: `games/<slug>/liveops.md`
```
# <Game> live ops

## Update slot
Every <weekday> <HH:MM> UTC, every <1|2> weeks.

## Analytics contract
| Kind | Name | When | Fields |

## Metrics (weekly)
| Week | New | D1 (n) | D7 (n) | D30 (n) | Median session | Payer % | ARPDAU | Errors/session | qPTR |

## Calendar (next 4 weeks)
| Week | Slot | Headline | Target metric | Event | Code | Ads/creators |

## Next 3 updates
1. <headline> — target <metric> — status <planned|building|ready>

## Events (12 months)
| Id | Starts UTC | Ends UTC | Type | Free track | Paid items | Currency rule |

## Update results
| Version | Date | Change | Expected | Result after 7 d | Decision |

## Log (newest first)
YYYY-MM-DD HH:MM · what happened · result
```

## References
[1] Discovery (Roblox Creator Docs) — https://create.roblox.com/docs/discovery — RFY signals (qPTR, playtime, play days, spend days, Robux spent, co-play days); per-user averages; only RFY-acquired players ranked; qPTR dip before impression drop; seasonality and competitors; Home Recommendations dashboard.
[2] Recommended For You Algorithm Improvements That Better Value Long-Term Retention (DevForum) — https://devforum.roblox.com/t/recommended-for-you-algorithm-improvements-that-better-value-long-term-retention/4684575 — 2026 RFY change; distribution fluctuations after launch.
[3] Optimizing discovery so great games reach millions of players (Roblox Newsroom, June 2026) — https://about.roblox.com/newsroom/2026/06/optimizing-discovery-great-games-reach-millions-players-roblox — 7-day to 28-day view measuring long-term retention; signal list to be published.
[4] Boost Your Discovery by Building Games People Want to Play (DevForum) — https://devforum.roblox.com/t/boost-your-discovery-by-building-games-people-want-to-play/4779042 — fix core gameplay first when retention is low.
[5] Analytics: View retention by acquisition source and select your benchmark set (DevForum) — https://devforum.roblox.com/t/analytics-view-retention-by-acquisition-source-and-select-your-benchmark-set/4010157 — retention by source; benchmark sets; ads don't fix a declining organic trend.
[6] Roblox wants to improve discovery for its game creators (VentureBeat) — https://venturebeat.com/business/roblox-wants-to-improve-discovery-for-its-game-creators — Roblox's plan to show more of how the algorithm works in Creator Analytics.
[7] Ads Manager (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/ads-manager — Plays and Engagement objectives; higher CPP for Engagement; auto-bidding; daily or lifetime budgets.
[8] Sponsored experiences in Ads Manager (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/sponsoring-experiences — sponsored placements on Home, Discover and search; bidding.
[9] Promotion (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion — search ads; games resembling existing games aren't prioritized.
[10] Ads tag (DevForum) — https://devforum.roblox.com/tag/ads — July 2026 Kids and Select launch, Ads Manager updates and advertising policy posts.
[11] Thumbnails (Roblox Creator Docs) — https://create.roblox.com/docs/production/publishing/thumbnails — personalization needs 2+ thumbnails; winners per audience; +8.5% average qPTR in testing.
[12] Thumbnail personalization now remembers your existing winning thumbnails (DevForum) — https://devforum.roblox.com/t/thumbnail-personalization-now-remembers-your-existing-winning-thumbnails/3793665 — winner keeps traffic while new thumbnails are tested.
[13] Experience notifications (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/experience-notifications — 13+ users; 100+ visits; not under moderation; launch data through GetJoinData.
[14] Experience notifications, cloud services (Roblox Creator Docs) — https://create.roblox.com/docs/cloud-services/experience-notifications — sending notifications from server code with a message asset ID.
[15] ExperienceNotificationService (API reference mirror) — https://robloxapi.github.io/ref-temp/class/ExperienceNotificationService.html — opt-in prompt members (third-party mirror; verify in the official reference).
[16] Friend invite reward system (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/referral-system — ReferredByPlayerId in join data for referral rewards.
[17] Grow a Garden (Wikipedia) — https://en.wikipedia.org/wiki/Grow_a_Garden — built in about three days; 5M+ concurrent on May 17, 2025; bot allegations retracted.
[18] How Grow a Garden took off on Roblox: Janzen Madsen interview (GamesBeat) — https://gamesbeat.com/janzen-madsen-interview/ — Splitting Point manages the game.
[19] Grow a Garden update schedule (PCGamesN) — https://www.pcgamesn.com/grow-a-garden/update-schedule — strict weekly Saturday updates.
[20] Grow a Garden major changes coming (NME) — https://www.nme.com/news/gaming-news/roblox-grow-a-garden-major-changes-coming-update-cooking-3884432 — August 2025: weekly events too hard to keep fresh; more depth.
[21] Grow a Garden record (WN Hub) — https://wnhub.io/news/other/item-47931 — RoMonitor: 11.7M concurrent on Saturday, May 31, 2025; 8.9M a week earlier.
[22] Grow a Garden events schedule (AllThingsHow) — https://allthings.how/grow-a-garden-events-schedule/ — fan-published update and event times.
[23] When is the next Grow a Garden update? (Sportskeeda) — https://www.sportskeeda.com/roblox-news/when-next-grow-garden-update — players look up the next update time.
[24] More Creators Can Now Use Rewarded Video Ads (DevForum) — https://devforum.roblox.com/t/more-creators-can-now-use-rewarded-video-ads/3838678 — rewarded video for 13+ users; impression-based earnings; completion and maturity effects.
[25] Roblox eyes expanded placements for rewarded video ads (MediaPost) — https://www.mediapost.com/publications/article/417959/ — more placements and a Studio plug-in planned for Q4 2026.
[26] Introducing "Top Playing Now" on Charts (DevForum) — https://devforum.roblox.com/t/introducing-top-playing-now-on-charts/3529809 — the Top Playing Now chart; discussion of Up-and-Coming's CCU range.
[27] RDC25: What we announced (DevForum) — https://devforum.roblox.com/t/rdc25-what-we-announced/3920245 — yearly recap of platform changes to review for live-ops impact.
[28] My game is suddenly invisible (DevForum) — https://devforum.roblox.com/t/my-game-is-suddenly-invisible/4191323 — report of a game missing from search.
[29] Experience does not appear in Search or Recently Played despite being public (DevForum) — https://devforum.roblox.com/t/experience-does-not-appear-in-search-or-recently-played-despite-being-public/4769113 — another search visibility report.
[30] Grow a Garden hits 5 million active users (Kotaku) — https://kotaku.com/grow-a-garden-roblox-5-million-active-users-record-pc-1851781824 — coverage of the 5M milestone.
[31] Viral hit Grow a Garden pushes Roblox past 100 million users (Reuters via AOL) — https://www.aol.com/news/roblox-raises-annual-bookings-forecast-120501339.html — platform-level impact of one game's growth.
[32] Grow a Garden Christmas schedule (AllThingsHow) — https://allthings.how/grow-a-garden-christmas-schedule/ — fan-tracked seasonal event schedule.
[33] Roblox teams up with Google to pay players to watch ads (Kidscreen) — https://kidscreen.com/?p=221179 — rewarded video launch: optional videos up to 30 seconds for in-game rewards.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[04 Progression and Economy]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]]
