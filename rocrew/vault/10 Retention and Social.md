---
tags: [vault, retention, social, daily-rewards, quests, friends, invites, events, codes, analytics]
for: [liveops, architect, builder, frame, balance]
also: [lead, pulse, merchant, kid-tester, playtest, reviewer, producer, scenic]
---

# 10 Retention and Social

This chapter covers the systems that bring a player back tomorrow and keep them playing with friends today: daily rewards and streaks, playtime gifts, daily and weekly quests, welcome-back gifts, offline progress, badges, collections, leaderboards, friend invites and share links, co-op goals, visible status, gifting and trading, private servers, group perks, notifications, events, codes, update logs, and the analytics that prove any of it works.

Retention decides whether a game grows. Players who return and stay are what Roblox's recommendations reward, and since July 2025 they are also what pays: Creator Rewards pays for Active Spenders who open the game among their first three experiences of the day and stay at least 10 minutes, and for new or returning users brought in through the game's own links [1][2][3]. A game that keeps players earns even from those who never buy anything. The old Premium Payouts program is gone [5].

The rule behind everything here: **reward coming back, never punish being away**, and stay honest with a young audience. These systems amplify a fun loop; they can't rescue a bad one ([[02 The Core Loop]]). Read this chapter when planning a game (Architect, Balance), when building any reward, quest, social or event system (Builder, Frame), before each update (Liveops), and when testing the first sessions (Kid Tester, Playtest). Money-related social features (gifts, server boosts, VIP status) are specified in [[09 Shops and Monetization]].

## Rules

### A. Why retention comes first

1. **Design every game for a daily return and a session of 10 minutes or more.**
   Creator Rewards' daily engagement reward pays per Active Spender for whom the game is one of the first three experiences they launch that day and who stays at least 10 minutes [1]; Tubefilter describes Active Spenders as users who spent at least $9.99 on Roblox in the past 60 days [3], and coverage framed the program as a push for engagement and retention [3][4]. Roblox says payouts aren't capped but amounts may change [4]. In Studio this means: a reason to open the game first each day (a daily reward, a restock, a quest reset at 00:00 UTC) and a first session goal that takes 10+ minutes to reach. Done right: daily chest, three dailies and a 12-minute "first rebirth" goal. Done wrong: a game that peaks at minute 4 and has nothing new tomorrow.

2. **Don't design around Premium playtime: Premium Payouts were retired in July 2025.**
   Engagement-based payouts were deprecated effective July 24, 2025 and replaced by Creator Rewards [5][6][2]. Old advice to "keep Premium members in the game" is outdated; what pays now is daily return, 10-minute sessions, and new or returning users joining via your links [1]. Done right: Liveops reads the Creator Rewards dashboard. Done wrong: a "Premium-only" area built to farm playtime.

3. **Liveops tracks D1, D7 and D30 retention and average session length from the first public day, against studio targets.**
   Studio targets (our own, not platform statistics): D1 at least 20%, D7 at least 7%, D30 at least 2.5%, average session at least 12 minutes. A game below target gets loop and onboarding fixes before any marketing ([[12 Live Ops and Launch]], [[15 Discovery and Growth]]). Done right: a weekly table in `liveops.md` with the four numbers and one change per week. Done wrong: "players seem to like it" with no numbers.

4. **Fix the loop before adding retention systems.**
   A daily reward for a boring game brings players back once to quit again. Playtest and Kid Tester must report that the first 5 minutes are fun ([[01 The First Five Minutes]]) before Liveops adds streaks and events. Done right: dailies added after playtests show players choosing "one more round". Done wrong: a 30-day login calendar on a game with one map and nothing to do.

### B. Come back tomorrow

5. **End every session with a visible unfinished goal and a reason to return within 24 hours.**
   Players who leave mid-goal come back to finish it. Show on the HUD: the next unlock and its progress bar, tomorrow's daily reward ("Day 4: Rare Egg"), a quest that's 2/3 done, a crop that finishes later. When the player opens the menu to leave, a small "Tomorrow" card lists the next daily and the quests resetting at 00:00 UTC. Done right: "Day 3 tomorrow: 300 Coins + Epic Egg" under the daily button. Done wrong: the session ends on a completed goal with nothing next.

6. **Reward coming back; never punish being away.**
   Punishments (decaying pets, lost streak rewards, crops that rot) make lapsed players quit for good, because returning means facing a loss. Absence costs only the rewards not collected; nothing already earned decays. Done right: a player away 9 days returns to a welcome-back gift and their base exactly as they left it. Done wrong: "Your pet ran away because you didn't feed it."

7. **Run daily rewards on a 7-day cycle, by server UTC day, growing each day, with a day-7 highlight and a one-day grace.**
   Server time can't be faked by changing the device clock. Rewards grow (for example 50, 75, 100, 150, 200, 300, then a cosmetic or rare egg on day 7), all 7 days are visible so the player sees what's coming, and a missed day doesn't reset if the player returns the next day (grace of one day); two missed days restart at day 1 without taking anything back. Code in the Luau section. Done right: a calendar of 7 tiles with day 7 glowing. Done wrong: the client's `os.date()` deciding the day.

8. **The daily reward is the only card on join, and it claims in one tap.**
   One welcome card, then play. If a daily, an update log and an offer all want the join moment, the daily wins, the update log waits for the first quiet moment (after the first loop completes), and offers wait their cooldown ([[09 Shops and Monetization]]). One menu at a time [35]. Done right: join, tap "Claim Day 3", play within 5 s. Done wrong: four stacked popups.

9. **Give a welcome-back gift after 3 or more days away, once per absence.**
   A lapsed player needs a reason to try again and a soft re-entry. On join, if `today - LastSeenDay >= 3`, show "Welcome back!" with a gift scaled to their progress (rule of thumb: 20-30 minutes of their current income, plus a 15-minute boost) and a one-line "What's new" if there was an update. Done right: a player away for two weeks sees a gift and the new world's teleport. Done wrong: no acknowledgment, and a full-price event shop.

10. **Don't build return reasons out of long timers that are sold as skips.**
    Roblox's docs say timers that can be removed or brought forward are unpopular with Roblox players [7]. Short rotations and restocks that are free are different: Grow a Garden's seed shop reportedly restocks every five minutes [17], which creates "check back" moments without a paywall. Return reasons should be rewards waiting (dailies, quest resets, a weekly event), not penalties for not paying. Done right: a free shop rotation every 5-10 minutes. Done wrong: a 6-hour build timer with a skip button.

11. **Run 3 daily quests and 1-2 weekly quests, rotated deterministically from the day index, each a verb from the core loop.**
    Quests turn a session into a short list of goals and point players at content they skip. Daily: easy (2-3 minutes), medium (5-8 minutes), longer (10-15 minutes); weekly: 1-2 that take a few sessions. Every quest is a play verb ("Catch 15 fish", "Win 3 rounds"), never "spend Robux" or "invite a friend". Seed the rotation with the UTC day index so every server agrees without storage. Done right: three quests that together fill a 15-minute session. Done wrong: "Play for 60 minutes".

12. **Quest progress comes only from server events.**
    The server already knows when a fish is caught or a round is won; it increments quest progress there. No remote may report progress. Done right: `QuestService.Progress(player, "CatchFish", 1)` inside the server's catch handler. Done wrong: `Remotes.QuestProgress:FireServer("CatchFish", 15)`.

13. **Never sell streak savers, and keep streak rewards as bonuses, not necessities.**
    Selling a way to avoid losing a streak turns a fun habit into a pressure purchase for children. Grace days are free. Streak milestones (7, 14, 30 days) give cosmetics or titles, never power that missing a day would cost. Done right: a "7-day streak" title. Done wrong: "Your 29-day streak will reset! Save it for 49 R$."

14. **Idle and tycoon games pay offline progress, capped at 8-12 hours, shown with a collect moment on return.**
    Offline progress turns "I was away" into "I came back to a pile of coins". Compute on join from `os.time() - LastSeen`, capped (rule of thumb: 8 h free, longer only as a convenience pass in [[09 Shops and Monetization]]), at a reduced rate (25-50% of online income), and show a "While you were away: +12,400 Coins" card with a collect button. Done right: the cap is generous enough that a night's sleep fills it. Done wrong: a 1-hour cap tuned to sell the extension.

15. **A subscription is a daily habit, so its benefit must arrive daily.**
    Subscriptions are recurring monthly benefits [11]; Adopt Me's Pets Plus, as reported, includes VIP and lets players equip two pets at once [12], a perk felt every session. If the game has a subscription, its daily chest is claimed from the same daily screen. Done right: "Plus chest: claim" next to the daily reward. Done wrong: a monthly perk that's invisible during play.

16. **Rotate something every week.**
    A weekly reset gives a reason to return each week even when no update ships: a featured world with 2x drops, a weekly quest set, a weekly leaderboard, a rotating shop. Use the UTC week index (weeks start Monday 00:00 UTC). Done right: "This week: Volcano Cave 2x Gems" on the lobby board. Done wrong: the same content every day for months between updates.

### C. Stay longer today

17. **In the first 30 minutes, an unlock or reward arrives every 3-5 minutes (target).**
    Short gaps keep the session going past the 10-minute mark that matters (Rule 1). Balance plans the unlock schedule in `economy.md`: first reward within 30 s, first upgrade within 2 minutes, then a new upgrade, area, pet or tool every 3-5 minutes until minute 30 ([[04 Progression and Economy]]). Done right: a pacing chart in `economy.md` with no gap over 5 minutes before minute 30. Done wrong: a 12-minute grind before the second upgrade.

18. **Playtime gifts are modest, timed on the server, claimed by tap, and stop at 60 minutes.**
    Gifts at 5, 10, 20, 30, 45 and 60 minutes reward staying without encouraging AFK. Time is tracked on the server from join. Unclaimed gifts wait (they never expire mid-session), and claiming is a tap on a HUD timer. Roblox disconnects idle players anyway; the goal is "one more round", not overnight farming. Done right: a small gift icon with "4:12" counting down. Done wrong: gifts every minute for 8 hours, which rewards leaving the game open.

19. **Give long-term goals through a collection index with completion rewards.**
    An index (pets, fish, cars, recipes) shows what exists and what's missing, and missing slots are the strongest pull back. Reward 25%, 50%, 75% and 100% completion per category with titles, cosmetics or small permanent bonuses. Silhouettes for undiscovered items, with a hint of where they live ([[03 Rarity and RNG]]). Done right: "Ocean fish 18/24: +5% sell price at 24". Done wrong: no index, so players don't know what they're missing.

20. **Launch with 8-20 badges that mark real moments.**
    Badges show up on profiles and are a small, visible record of progress. Good set: Welcome (first join), first milestone, each world reached, mastery, a hidden secret, event participation, playing with a friend. Award on the server in a pcall, off the main path. Creating badges may cost Robux beyond a free allowance, so the owner creates them. Done right: 12 badges, each a moment a player would talk about. Done wrong: a badge every 30 seconds for clicking.

21. **Run a weekly leaderboard beside the all-time one, write throttled and read cached.**
    All-time boards fill with veterans; weekly boards feel winnable for new players. Use `OrderedDataStore` with the week index in the store name, write at save time or round end (never per change), read the top 50 about once a minute per server, and resolve names in batches. Show the player's own rank under the board even if they're not top 50 ("You: #1,204"), using their stored value. Done right: "This week's top fishers" board in the lobby. Done wrong: writing to the ordered store on every coin pickup.

22. **Save often and resume exactly where the player left.**
    Phone sessions end abruptly (calls, low battery, app switch). Autosave every 60-120 s and at every milestone; on rejoin, restore position or teleport to the last area, active quests and timers. Done right: a player whose phone died mid-run rejoins at their last checkpoint with their loot. Done wrong: progress lost since the last manual "save" button ([[13 Building It Right]], [[08 Mobile]]).

### D. Play together

23. **Put new players where other players are doing the exciting thing.**
    Seeing someone hatch a rare pet or drive a supercar is a goal and an advertisement. Spawn near the hatch area, the shop or the arena, show server-wide announcements for rare events ("Mia hatched a Mythic Dragon!"), and make status items visible from a distance. Done right: the spawn plaza faces the egg stands and the leaderboard. Done wrong: spawning alone in a corner of a huge map.

24. **Give a small bonus for playing with friends, to both players, and show it.**
    A friend bonus (rule of thumb: +10% currency per friend in the server, capped at +30%) gives a reason to invite and to stay together. Check `player:IsFriendsWith(otherUserId)` once per pair (it yields, so pcall and cache), and show "Friends bonus +20%" on the HUD. Never require friends for progress, never punish solo play. Done right: a small icon with two heads and "+20%". Done wrong: a door that only opens with 4 friends present.

25. **Offer invites at natural moments, only when the platform allows them, and let the invite carry a destination.**
    Use `SocialService:CanSendGameInviteAsync` (pcall) and hide the button when false; prompt with `SocialService:PromptGameInvite` and an `ExperienceInviteOptions` with friendly copy. Natural moments: in the lobby, when a co-op mode needs more players, right after a big win. With `LaunchData`, an invited friend can land at the inviter's base or party (read it with `player:GetJoinData()`). Never on join, never repeated, never required. Done right: "Invite a friend to help defend the base" on the co-op screen. Done wrong: an invite prompt every 5 minutes.

26. **Give players a reason to share the game's link.**
    Creator Rewards' audience expansion pays a share of new or returning users' first purchases when they join through the creator's share link or direct link and play 10+ minutes [1]; it requires an ID-verified account and DevEx [2], and alt-account schemes are prohibited [1]. Players share what makes them look good: a rare hatch, a finished base, a funny moment. Liveops puts the game link in every update post; the game gives "show off" moments (a photo pose, a base tour mode). Done right: a weekly update post with the link and a code. Done wrong: "Make an alt and join with my link for a free pet."

27. **Make shared goals that groups finish faster, while solo play stays viable.**
    A server-wide boss every 20 minutes, a community chest that fills from everyone's collecting, a team defense round. Rewards go to everyone who contributed above a small threshold (rule of thumb: 5% of the top contributor's damage or 1 minute of participation). Done right: "World Boss in 4:30" banner and a shared health bar. Done wrong: content that's impossible solo.

28. **Status must be visible to other players, or it isn't status.**
    Pets that follow, titles over heads, trails, rare cars, VIP lounges. Adopt Me's VIP perks, as reported, include a VIP Room and an exclusive limo [13], both seen by others. Make the best items readable from 30+ studs (size, glow, particles; [[07 Characters, VFX and Assets]]). Done right: a legendary pet with a glow and a name tag. Done wrong: rewards that only show inside the player's own inventory.

29. **Let players gift to each other, starting with same-server gifting.**
    Gifting turns a purchase into a social bond. Blox Fruits lets players gift items like permanent fruits and gamepasses [14]; Grow a Garden's gift shop charges Robux and needs both players in the same server [16]. DevForum designs centralize gifting in one service [29], and community tools show each stage (sending, processing, sent, completed) [30]. Free gifts (sending a spare common item to a friend) are also a strong social habit. Paid gifting follows [[09 Shops and Monetization]]; Robux transfers between players (where the game earns 10% of the Robux sent [28]) are an owner decision, never built unasked. Done right: "Gift" on a player's card, a toast to both. Done wrong: gifts with no confirmation to either player.

30. **Trading uses a locked two-sided offer, a server-validated confirm, a cooldown, and the platform's policy rules.**
    Trades are where scams and exploits happen. Both players add items; either change unlocks both confirms; after both confirm, a 3-second countdown; the server re-validates ownership and executes atomically in memory, then saves both; a 30-60 s cooldown per player. Check `IsPaidItemTradingAllowed` from `PolicyService` for paid items (cache on join) [25][26]; with regional pricing, the docs point to `GetUsersPriceLevelsAsync` for transfers between players with different price levels [27]. Done right: a trade window with both sides visible and a server log of every trade. Done wrong: a trade that executes on one client's say-so.

31. **Make private servers free in social and co-op games.**
    Creators can make private servers free for everyone or charge monthly [8]; players are charged once and then monthly when they're paid [9]. Friend groups need a home; free private servers keep them coming back together. PCGamesN reports Roblox Plus subscribers get one free private server per game, while creators can still offer free servers to all [10]. The owner sets this on Creator Hub. Done right: a roleplay town with free private servers and a "Join my server" invite. Done wrong: charging monthly in a hangout game that's rarely full.

32. **Group perks are small, fun and never gate core content.**
    Check `player:IsInGroup(groupId)` or `GetRankInGroup` once on join (pcall) and say "perks apply next time you join" after someone joins mid-session. Perks: a chat or overhead tag, a small daily bonus, a group-only cosmetic. Never progression. Done right: "Group member: +5% Coins, golden name". Done wrong: the second world locked for non-members.

33. **Add light ways to interact: emotes, high-fives, spectating, reviving a teammate.**
    Small gestures make strangers into friends. Emote wheel (4-8 emotes), a two-player high-five on approach, spectate after elimination, a free teammate revive in co-op. These cost little and fill servers with life. Done right: a revive prompt "Hold E to revive Sam" in a co-op run. Done wrong: no way to interact except chat.

34. **A paid revive is never the only way back into a run with friends.**
    DOORS sells Revives for Robux [21], but its Knobs come from ending a run in any way [18], so every run still pays. In co-op, a teammate revive, a checkpoint respawn or spectating keeps players with their group. Done right: "Revive R$ 15" next to "Spectate team". Done wrong: a death screen whose only button is the paid revive.

35. **Filter all player-written text and keep social features inside Roblox.**
    Pet names, signs, trade notes and party names go through `TextService:FilterStringAsync` on the server, displayed with the right method for broadcast or per-user text. No off-platform links, no prompts to share personal info, no "add me on..." boards. Respect players' own chat and voice settings ([[13 Building It Right]]). Done right: a named pet shows "####" for filtered text. Done wrong: raw custom text on a billboard.

### E. Bring them back

36. **Ask for notification opt-in only after the player has had a good session, and at most once a week.**
    Experience notifications must be opted into by the player. The prompt should follow a moment of value ("Your crops finish in 2 hours. Want a reminder?"), never appear on join, and never repeat within 7 days after a "No". Notifications themselves must be useful and honest (a crop is ready, an event started), never "We miss you!" spam. Read the current `ExperienceNotificationService` reference and Creator Hub limits before building. Done right: an opt-in asked after the first harvest. Done wrong: an opt-in prompt in the first 30 seconds.

37. **Ship small updates weekly or fortnightly and a big one monthly, and tag the title only while the update is new.**
    Updates are the strongest comeback reason. Title tags signal new content: title trackers list Pet Simulator 99 under titles such as "[ARCADE] Pet Simulator 99!" and "[TAP HEROES] Pet Simulator 99!" over time [31][32]. Tag only real updates, and remove the tag after 1-2 weeks ([[11 Thumbnails, Icons and the Store Page]], [[12 Live Ops and Launch]]). Done right: "[FISHING] Volcano Pets" for the week of the fishing update. Done wrong: "[UPDATE]" in the title for three months.

38. **Show a "What's new" panel once per update, in 3-5 bullets a 10-year-old can read, closed in one tap.**
    Compare `data.LastSeenUpdate` with `Config.UpdateVersion`; show at the first quiet moment after the daily reward; each bullet has an icon and a "Go" button that teleports or opens the new thing. Done right: "New: Ice World! [Go]". Done wrong: a scrolling wall of patch notes on join.

39. **Run limited-time events on a data-driven schedule with a free track for everyone.**
    `Config.Events` lists UTC start and end timestamps; the server checks `os.time()`. Every event has a free track that a regular player completes in 3-5 sessions (target). Event cosmetics may be exclusive; event power may not. Test schedules in Studio with a Studio-only time offset, never by editing real dates. Show the end as a date, not a pressure countdown; the Sydney study flags countdown timers that manufacture false urgency [22][24]. Done right: "Halloween Hunt: until 3 Nov. Free track: 10 rewards." Done wrong: a 48-hour event whose only good reward is paid.

40. **Launch with a code, add a new code with each update, and keep code rewards small.**
    Codes give players something to look up and share, and press outlets keep code lists for popular games: DOORS codes for free Knobs, Revives and Stardust are tracked by PCGamesN, Dexerto, Pro Game Guides and others, with expired codes marked [19][20][36][37]. Rule of thumb: a code gives 10-20 minutes of value (coins or a boost), lasts until the next update or a stated date, and is posted with the update. Redeemed codes are stored per player; codes are case-insensitive. Done right: "VOLCANO" for 500 Coins and a 15-min boost, posted in the update notes. Done wrong: codes that give rare power items, or a "code" field that's empty at launch.

41. **No dark patterns in retention systems.**
    No fake countdowns, fake scarcity or fake "X players just bought this"; no guilt or threats ("Your pet will be sad", "You'll lose everything"); no confirmshaming on decline buttons; no near-miss animations; don't make AFK or overnight play necessary; don't reward likes or favorites; don't make invites or group joins mandatory. The University of Sydney found deceptive monetization in 14 of 15 top-earning Roblox games, including countdowns and fake time-limited deals [22][23][24]. Kid Tester checks every retention screen. Done right: "Come back tomorrow for Day 4!" Done wrong: "Don't leave! Your streak will be destroyed!"

### F. Measure it

42. **Log retention events on the server with few, stable names and low-cardinality values.**
    Roblox caps how many distinct custom event names and field values it tracks, so dashboards break when names multiply. Log: daily claimed (with streak), playtime gift claimed, quest completed, badge awarded, invite prompt closed, joined from an invite, code redeemed, event participation, update log viewed, welcome-back shown. Values are IDs like `"Collect200"`, never user IDs or timestamps. Liveops records the list in `games/<slug>/liveops.md`. Done right: 12 event names, stable for the game's life. Done wrong: an event name per item ID.

43. **Log the onboarding funnel so the first-session drop-off point is visible.**
    `AnalyticsService:LogOnboardingFunnelStepEvent` records ordered steps (spawned, first action, first reward, first upgrade, first quest done, minute 10). The step where most players drop is the next thing to fix ([[01 The First Five Minutes]]). Done right: a funnel showing 85% reach "first upgrade" and 40% reach "minute 10". Done wrong: no funnel, so nobody knows where players leave.

44. **Change one retention system at a time and read its effect for at least a week.**
    Two changes in one update can't be told apart. Liveops writes the hypothesis ("Day-7 egg raises D7"), ships one change, waits 7+ days, compares D1/D7 and session length, and keeps or reverts it. Done right: a dated entry in `liveops.md` per change. Done wrong: a new daily calendar, quest system and event in one patch, then guessing.

## Step by step

### Building the retention kit for a new game in 15 steps
1. **Confirm the loop is fun.** Read the latest playtest and kid-test reports; if the first 5 minutes fail, stop and send it back (Rule 4).
2. **Write the return-reason map** (table below) in `plan.md`: what pulls the player back in seconds, minutes, days and weeks.
3. **Balance the schedule.** Balance adds daily reward amounts, playtime gift values, quest rewards and the unlock pacing chart to `economy.md` (Rule 17).
4. **Add the save fields:** `Daily = {Streak, LastClaimDay}`, `Quests = {Day, Week, Progress}`, `LastSeen`, `LastSeenDay`, `LastSeenUpdate`, `Codes = {}`, `Badges` cache, `Index = {}`.
5. **Build the daily reward service** (server UTC, grace, never remove; Luau section) and Frame's 7-tile calendar.
6. **Build playtime gifts** (server timer per player; HUD gift timer).
7. **Build quests**: the pool (at least 15 daily and 6 weekly quests from core verbs), deterministic rotation, server-event progress.
8. **Build welcome-back** (3+ days away) and, for idle/tycoon, offline progress with a cap.
9. **Add badges** with placeholder IDs (`0`) and `ask` the owner to create them.
10. **Add leaderboards**: in-server `leaderstats` (1-2 stats), a weekly and an all-time global board in the lobby.
11. **Add social systems**: friend bonus, invite button with `LaunchData`, emotes, status visibility, free teammate revive if co-op.
12. **Add codes** with one launch code, and the "What's new" panel.
13. **Wire analytics**: retention events and the onboarding funnel.
14. **Test** in Studio with a time-offset flag: claim days 1-8, skip a day, skip two, redeem a code twice, cross a UTC midnight, rejoin mid-quest.
15. **Kid Tester pass** on every retention screen for clarity and dark patterns; fix and hand off.

### Welcome-back flow in 6 steps
1. On save load, compute `daysAway = today - (data.LastSeenDay or today)`.
2. If `daysAway >= 3` and `data.LastWelcomeBackDay ~= today`, queue the welcome-back card (it replaces the daily card's slot and includes the daily claim).
3. Gift = 20-30 minutes of current income (computed server-side from the save) plus a 15-minute boost.
4. If `data.LastSeenUpdate ~= Config.UpdateVersion`, add one "New since you left" line with a Go button.
5. Set `LastWelcomeBackDay = today`, log `WelcomeBackShown` with a bucketed `daysAway` (3-6, 7-13, 14-29, 30+).
6. Never show offers in the same minute as the welcome-back card.

### Liveops: the first month of return reasons
| Week | Return reason added | Free reward | Social hook |
|---|---|---|---|
| Launch | Dailies, 3 daily quests, launch code | Day-7 egg | Invite button, friend bonus |
| Week 1 | Weekly quests, weekly leaderboard | Weekly title | "Top 10 this week" board |
| Week 2 | Small update + new code | New code reward | Server-wide boss |
| Week 3 | Mini event (3-5 days) | Free event track | Co-op event goal |
| Week 4 | Big update, title tag | New world gift on join | Share-a-moment pose |

## The return-reason map
| Layer | Time scale | Systems | Example |
|---|---|---|---|
| Moment | seconds | Feedback, reward pops, rare-drop announcements | "+50" with a coin burst |
| Session | minutes | Unlocks every 3-5 min, playtime gifts, quests, world boss | "World Boss in 4:30" |
| Day | 24 h | Daily reward, daily quests, restocks, offline progress | "Day 4 tomorrow: Rare Egg" |
| Week | 7 days | Weekly quests, weekly leaderboard, featured world | "This week: Ice Cave 2x" |
| Season | weeks | Events, updates, new worlds, codes | "Halloween Hunt until 3 Nov" |
| Life | months | Index completion, badges, rare collection, status | "Ocean fish 18/24" |

## Specs and recipes

### Daily reward calendar
- **Layout:** 7 tiles in a row (phone: 4 + 3 in two rows), each 120x150 px at 1080p, 12 px gaps; day number on top, reward icon center, amount under it; day 7 is 1.3x wider with a glow.
- **States:** claimed (check mark, 50% opacity), today (pulsing outline, "Claim" button 220x64 below the row), future (normal), missed (never shown; the streak just restarts).
- **Copy:** "Day 3 of 7" title; "Come back tomorrow for Day 4!" after claiming; next reset as a countdown from server time (`workspace:GetServerTimeNow()`), since this is informative, not a sale.
- **Rewards (example, Balance tunes):** 50, 75, 100, 150, 200, 300 Coins, then an exclusive cosmetic or rare egg on day 7. Cycle repeats with slightly larger amounts (x1.2 per cycle, capped at x2).

### Playtime gifts
- Tiers at 5, 10, 20, 30, 45, 60 minutes from join, server-timed.
- HUD: a 64x64 gift icon with a countdown "4:12"; at 0:00 it bounces once and shows a dot; tap claims; the next timer starts.
- Rewards small: the six together are worth about one day-3 daily reward.
- Optional ad reward: where the experience is eligible for rewarded video ads [33], a "Watch for 10 min of 2x" button may sit beside the gift timer for viewers 13+ only, with a fixed (never random) reward [34] and a daily cap; see [[09 Shops and Monetization]].

### Quests
- **Pool:** at least 15 daily and 6 weekly templates, each `{Id, Verb, Target, Reward, Difficulty}`; target scaled by the player's stage if the game has stages.
- **Panel:** a quest tracker (3 rows, 56 px each) at the right edge, collapsible; each row shows icon, "Catch 15 fish", a progress bar "9/15", and a claim button when done.
- **Reset:** daily at 00:00 UTC, weekly Monday 00:00 UTC; the panel shows "Resets in 5h 12m".
- **Reward:** daily easy 5%, medium 10%, long 20% of a typical day's income; weekly 1-2 days' income or a cosmetic.

### Badges (template set)
| Badge | When | Notes |
|---|---|---|
| Welcome | First join | Award after the save loads |
| First Steps | First upgrade | Within the first 2 minutes |
| Explorer | Reach world 2 | One per world reached |
| Collector | 50% of the index | Long-term |
| Master | 100% of the index | Rare |
| Secret | Find the hidden room | No hint in the UI |
| Better Together | Play 10 minutes with a friend | Social |
| Event: <name> | Join an event | One per event |

### Leaderboards
- In-server: `leaderstats` with 1-2 IntValues (the main currency or wins). Too many columns crowd the player list on phones.
- Global: weekly (`"Wins_W" .. weekIndex`) and all-time boards on SurfaceGuis in the lobby, top 50 with headshots of the top 3.
- Write on save or round end; read every 60 s per server; names via `UserService:GetUserInfosByUserIdsAsync` in one batch.
- Show "You: #rank" when known; otherwise "You: not ranked yet".

### Friends, invites and share links
| Moment | Prompt | Copy example |
|---|---|---|
| Lobby, idle | Invite button (always visible, never pops) | "Invite friends" |
| Co-op mode with empty slots | Invite card on the mode screen | "Need 2 more for the raid!" |
| After a big win | Small "Show a friend" button | "Bring a friend to see your dragon!" |
| Friend joins | Toast to both, friend bonus starts | "Sam joined! Friends bonus +10%" |
| Joined from an invite | Land at the inviter via `LaunchData` | "You're at Ava's base" |

### Social mechanics menu
- **Visible status:** following pets, overhead titles (BillboardGui, MaxDistance 60), trails, glowing rare items.
- **Light interaction:** emote wheel (4-8 emotes), high-five on approach, sit-together benches, photo pose spots.
- **Co-op:** shared boss, team chest, free teammate revive, spectate after elimination.
- **Gifting:** free item gifts between friends, paid gifts per [[09 Shops and Monetization]].
- **Trading:** locked offers, confirm, 3 s countdown, server execution, cooldown, policy checks (Rule 30).
- **Homes:** private servers free in social games; "Join my server" via invites.
- **Groups:** small perks checked on join.

### Events and update logs
- `Config.Events = { {Id = "Halloween26", StartsAt = <UTC>, EndsAt = <UTC>, FreeTrack = {...}} }`; the server exposes the active event as a `workspace` attribute so every client agrees.
- Studio-only offset: `Config.Debug.TimeOffset` applied only when `RunService:IsStudio()`.
- "What's new": 3-5 bullets with icons and Go buttons; shown once per `UpdateVersion`.

### Codes
- `Config.Codes = { VOLCANO = { Reward = {Coins = 500, Boost = "Coins2x", BoostSeconds = 900}, ExpiresAt = <UTC or 0> } }`.
- Input box in Settings or a Codes button (one HUD slot), case-insensitive, trimmed, rate-limited (1 attempt per 2 s, 10 per minute).
- Responses: "Redeemed! +500 Coins", "Already used", "Expired", "Not a valid code". No hints that brute-force helps.

### Dark patterns to reject
| Pattern | Example | What we do instead |
|---|---|---|
| Fake countdown | "Offer ends in 09:59" that restarts | End date only for real events |
| Streak threat | "Your streak will be destroyed!" | "Come back tomorrow for Day 4" |
| Guilt | "Your pet will be sad without you" | Pets wait happily |
| Confirmshaming | "No, I don't like free stuff" | "No thanks" |
| Forced social | "Invite 3 friends to unlock" | Optional invites with small shared bonus |
| Rating bait | "Like the game for a reward" | No reward for likes or favorites |
| AFK necessity | Rewards that require 8 h idle | Playtime gifts stop at 60 min |
| Popup stack | Four cards on join | One card on join |

### Retention analytics events
| Event | Value | Custom field |
|---|---|---|
| `DailyRewardClaimed` | streak day | none |
| `PlaytimeGiftClaimed` | tier (1-6) | none |
| `QuestCompleted` | 1 | quest id |
| `BadgeAwarded` | 1 | badge key |
| `InviteClosed` | invited count | none |
| `JoinedFromInvite` | 1 | none |
| `CodeRedeemed` | 1 | code |
| `EventJoined` | 1 | event id |
| `UpdateLogViewed` | 1 | update version |
| `WelcomeBackShown` | 1 | days-away bucket |

## Examples from top games

### Frequent free restocks as a reason to check back
**Game:** Grow a Garden ([17])
**Shows:** guides report the seed shop's stock refreshes every five minutes, giving chances at rare seeds, and that Robux can buy any seed at any time.
**Why it works:** a short, free rotation creates many small "check the shop" moments inside one session and across days.
**Steal:** a free rotating shop on a 5-10 minute cycle with an honest "Next restock" timer.
**Avoid:** long restock timers built to sell skips [7].

### Gifting that needs you to be together
**Game:** Grow a Garden ([16])
**Shows:** gifting seeds through the Gift Shop costs Robux and requires both players to be in the same server; the giver picks a friend's name after pressing the Gift icon.
**Why it works:** the gift happens in front of the recipient, so it becomes a shared moment and a reason to play together.
**Steal:** same-server gifting with a visible celebration for both players.
**Avoid:** gifts that vanish into an inbox with no confirmation.

### Gifting passes and permanent items
**Game:** Blox Fruits ([14])
**Shows:** players can gift other players items such as permanent fruits and gamepasses.
**Why it works:** friends invest in each other's progress, which ties both to the game.
**Steal:** a Gift tab with gift versions of passes and cosmetics.
**Avoid:** gifting currency in games with trading, which invites scams.

### A perk that sends the server hunting
**Game:** Blox Fruits ([15])
**Shows:** the Fruit Notifier pass tells holders the distance to newly spawned fruits.
**Why it works:** spawns become server-wide events that players race toward, a shared social moment even among strangers.
**Steal:** spawn announcements that pull players together (free) with a convenience finder (paid).
**Avoid:** making the finder so strong that free players never reach a spawn first.

### A subscription perk felt every session
**Game:** Adopt Me! ([12])
**Shows:** Pets Plus, reported at $2.99 per month varying by region, includes VIP membership and lets players equip two pets at the same time.
**Why it works:** the benefit is visible all the time (two pets following you), which keeps renewing worthwhile and shows status to others.
**Steal:** recurring perks that are used and seen every session.
**Avoid:** a subscription whose value is invisible during play.

### Status other players can see
**Game:** Adopt Me! ([13])
**Shows:** reported VIP perks include a VIP Room and an exclusive limo.
**Why it works:** a hangout and a vehicle are social: players invite friends in and are seen arriving.
**Steal:** status perks that are places and vehicles friends can share.
**Avoid:** status that's only a number in a menu.

### Every run pays, even a failed one
**Game:** DOORS ([18])
**Shows:** Knobs can be bought with Robux or obtained by ending a run in any way.
**Why it works:** losing still moves the player forward, so a bad run doesn't end the session.
**Steal:** a meta currency earned from every run outcome.
**Avoid:** rewards only for wins, which makes new players quit after a few losses.

### Codes as a comeback and coverage engine
**Game:** DOORS ([19][20][36][37])
**Shows:** outlets including PCGamesN, Dexerto, Pro Game Guides and Allthings.how keep dated lists of DOORS codes for free Knobs, Revives and Stardust, and mark expired codes such as THEHUNT and 4B.
**Why it works:** each new code gives lapsed players a reason to open the game and gives sites a reason to write about it.
**Steal:** a new code with each update, posted with the update notes, giving 10-20 minutes of value.
**Avoid:** codes that give rare power, or no codes at launch.

### Second chances that keep friends together
**Game:** DOORS ([21])
**Shows:** Revives are paid and bought with Robux, and codes have given some away.
**Why it works:** a revive keeps a player in the run with their group at the most tense moment.
**Steal:** a free teammate revive or checkpoint respawn alongside any paid revive (Rule 34).
**Avoid:** a death screen with only a paid option.

### Update names in the title
**Game:** Pet Simulator 99 ([31][32])
**Shows:** title-history listings show the game under update-tagged titles such as "[ARCADE] Pet Simulator 99!" and "[TAP HEROES] Pet Simulator 99!".
**Why it works:** players scanning their favorites see at a glance that something new arrived.
**Steal:** a short bracketed tag naming the real update, removed after 1-2 weeks.
**Avoid:** a permanent "[UPDATE]" tag that stops meaning anything.

### Private servers as a home for friend groups
**Game:** Any experience with free private servers ([8][10])
**Shows:** creators can make private servers free for everyone; PCGamesN reports a Roblox Plus limit of one free private server per game for subscribers while creator-free servers stay available.
**Why it works:** a friend group with its own server has a standing reason to meet there.
**Steal:** free private servers in social, roleplay and co-op games, with a "Join my server" invite.
**Avoid:** monthly fees on servers in games where public servers are rarely full.

### What not to do, from the top earners
**Game:** 15 top-earning Roblox games studied by the University of Sydney ([22][23][24])
**Shows:** 14 of 15 used misleading or deceptive practices, including countdown timers creating false urgency and "daily discounts" that never end.
**Why it works (short-term):** urgency pushes impulse decisions.
**Steal:** the list as Kid Tester's checklist.
**Avoid:** all of it: it trades long-term trust for a short spike.

## By genre
- **Simulator:** dailies give eggs and boosts; quests are collect/hatch verbs; the index and server-wide rare hatch announcements are the long-term and social hooks; weekly leaderboards for hatches. See [[Genre - Simulator]].
- **Tycoon:** offline income (capped 8-12 h) is the main return reason; co-op tycoons or neighbor visits add social; a "Tycoon of the week" board. See [[Genre - Tycoon]].
- **Idle and incremental:** offline progress and time-based milestones dominate; prestige resets give fresh starts; keep the offline cap generous. See [[Genre - Idle and Incremental]].
- **Obby:** checkpoints saved per stage, a daily "challenge course", time-trial weekly leaderboards, badges per section, trails as status. See [[Genre - Obby]].
- **Roleplay and life sim:** social is the retention: free private servers, homes friends can visit, outfits and vehicles as status, weekly themed events. Dailies matter less than friends. See [[Genre - Roleplay and Life Sim]].
- **Action and combat:** daily missions, weekly bosses, co-op raids with free revives, ranked seasons reset monthly. See [[Genre - Action and Combat]].
- **Battlegrounds:** daily challenges with specific characters, ranked weekly boards, emotes as social expression, private servers for friend fights. See [[Genre - Battlegrounds]].
- **Survival:** persistent bases (never decay while away), clan or team play, weekly world events; offline raids are a punishment to avoid. See [[Genre - Survival]].
- **Horror:** runs with friends are the hook: lobby parties, invites into runs, meta currency from every run, badges for each ending, codes with updates. See [[Genre - Horror]].
- **Tower defense:** daily missions, weekly challenge maps with modifiers, co-op invites with `LaunchData` into the same match, unit index. See [[Genre - Tower Defense]].
- **RNG and collection:** the index is everything; server-wide rare roll announcements; daily luck boosts as rewards; weekly "rarest roll" board. See [[Genre - RNG and Collection]].
- **Shooter:** daily challenges, a seasonal track with a free tier, squads with invites, weekly ranked boards. See [[Genre - Shooter]].
- **Racing and vehicles:** daily time trials, weekly cups, car collection index, crews with a crew bonus. See [[Genre - Racing and Vehicles]].
- **Sports:** daily skill drills, weekly tournaments, team invites and private matches. See [[Genre - Sports]].
- **Party and social hangout:** everything is social: rotating minigames, emotes, friend bonus, free private servers, weekly themed events. See [[Genre - Party and Social Hangout]].
- **Story and puzzle:** chapters released on a schedule, saved progress per chapter, co-op puzzles with invites, a badge per ending. See [[Genre - Story and Puzzle]].
- **Farming and fishing:** short grow and restock cycles (free), a fish or crop index, gifting between friends, weekly fishing contests; never crops that rot while away. See [[Genre - Farming and Fishing]].

## Luau

### Daily reward (server)
```lua
-- Server, inside the daily reward service. `data` is the player's session save.
local AnalyticsService = game:GetService("AnalyticsService")
local DAY = 86400
local REWARDS = { 50, 75, 100, 150, 200, 300, 500 } -- Balance tunes these in economy.md

local function claimDaily(player: Player, data): number?
	local today = math.floor(os.time() / DAY) -- UTC day index
	local last = data.Daily.LastClaimDay or -1
	if last == today then return nil end -- already claimed today
	-- One-day grace: missing a single day keeps the streak; two or more restart at day 1.
	data.Daily.Streak = if last >= today - 2 then data.Daily.Streak + 1 else 1
	data.Daily.LastClaimDay = today
	local reward = REWARDS[(data.Daily.Streak - 1) % #REWARDS + 1]
	data.Coins += reward
	AnalyticsService:LogCustomEvent(player, "DailyRewardClaimed", data.Daily.Streak)
	return reward
end
```
Without the grace day, the streak condition is `last == today - 1`. Claims arrive through a rate-limited remote; the server decides everything.

### Playtime gifts (server)
```lua
--!strict
local Players = game:GetService("Players")
local TIERS = { 5, 10, 20, 30, 45, 60 } -- minutes from join
local joinedAt: {[Player]: number} = {}
local claimed: {[Player]: number} = {} -- highest tier claimed this session

Players.PlayerAdded:Connect(function(player) joinedAt[player] = os.clock(); claimed[player] = 0 end)
Players.PlayerRemoving:Connect(function(player) joinedAt[player] = nil; claimed[player] = nil end)

local function claimPlaytimeGift(player: Player, data): number?
	local start, done = joinedAt[player], claimed[player]
	if not start or not done or done >= #TIERS then return nil end
	local nextTier = done + 1
	if (os.clock() - start) / 60 < TIERS[nextTier] then return nil end -- not yet
	claimed[player] = nextTier
	data.Coins += 20 * nextTier -- Balance sets values
	return nextTier
end
```
The client shows the countdown from `TIERS[next] * 60 - elapsed`, sent by the server once on join and after each claim.

### Daily and weekly quests (deterministic rotation)
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
```lua
local function questProgress(player: Player, data, verb: string, amount: number)
	local today = math.floor(os.time() / 86400)
	if data.Quests.Day ~= today then -- new day: new quests, fresh progress
		data.Quests.Day = today
		data.Quests.Daily = pickDailyQuests(today, QUEST_POOL)
		data.Quests.Progress = {}
	end
	for _, questId in data.Quests.Daily do
		local def = QUESTS[questId]
		if def.Verb == verb then
			data.Quests.Progress[questId] = math.min((data.Quests.Progress[questId] or 0) + amount, def.Target)
		end
	end
end
```

### Welcome back and offline progress (server, on save load)
```lua
local DAY = 86400
local OFFLINE_CAP = 8 * 3600
local OFFLINE_RATE = 0.4 -- share of online income paid while away

local function onSaveLoaded(player: Player, data)
	local now = os.time()
	local today = math.floor(now / DAY)
	local away = if data.LastSeen then now - data.LastSeen else 0
	local result = { offline = 0, welcomeBack = false }
	if data.IncomePerSecond and away > 60 then -- idle/tycoon games only
		result.offline = math.floor(math.min(away, OFFLINE_CAP) * data.IncomePerSecond * OFFLINE_RATE)
		data.PendingOffline = result.offline -- collected by a tap on the "While you were away" card
	end
	local daysAway = today - (data.LastSeenDay or today)
	if daysAway >= 3 and data.LastWelcomeBackDay ~= today then
		data.LastWelcomeBackDay = today
		data.PendingWelcomeBack = true
		result.welcomeBack = true
	end
	data.LastSeen, data.LastSeenDay = now, today
	return result
end
```
Update `LastSeen` again on every autosave and on leave, so offline time is measured from the real last moment.

### Badges (server)
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
Keep a session set of badges already awarded or confirmed, so repeated triggers don't call the service again.

### Global leaderboard (server)
```lua
local winsStore = DataStoreService:GetOrderedDataStore("Wins_AllTime_v1")
local ok, pages = pcall(winsStore.GetSortedAsync, winsStore, false, 50)
if ok then
	for rank, entry in pages:GetCurrentPage() do
		-- entry.key is the userId string, entry.value the integer score
	end
end
```
Weekly board: `DataStoreService:GetOrderedDataStore("Wins_W" .. weekIndex)`; write with `SetAsync(tostring(userId), wins)` from the save routine, pcall'd. Resolve names for the 50 IDs with one `UserService:GetUserInfosByUserIdsAsync(ids)` call (pcall, cache by ID).

### Friend invites with a destination (client and server)
```lua
-- Client: the invite button's Activated handler
local SocialService = game:GetService("SocialService")
local Players = game:GetService("Players")
local player = Players.LocalPlayer

local ok, canInvite = pcall(SocialService.CanSendGameInviteAsync, SocialService, player)
if ok and canInvite then
	local options = Instance.new("ExperienceInviteOptions")
	options.PromptMessage = "Come help me finish the volcano base!"
	options.LaunchData = `base:{player.UserId}` -- the invited friend lands at this base
	SocialService:PromptGameInvite(player, options)
end
```
```lua
-- Server: read the launch data when the invited friend joins
local Players = game:GetService("Players")
local AnalyticsService = game:GetService("AnalyticsService")
Players.PlayerAdded:Connect(function(player)
	local joinData = player:GetJoinData()
	local launch = joinData and joinData.LaunchData
	if typeof(launch) == "string" then
		local hostId = tonumber(launch:match("^base:(%d+)$"))
		if hostId and Players:GetPlayerByUserId(hostId) then
			player:SetAttribute("SpawnAtBaseOf", hostId) -- the spawn system teleports them there
		end
		AnalyticsService:LogCustomEvent(player, "JoinedFromInvite", 1)
	end
end)
```
Launch data is player-controlled input: parse it strictly and only use it to choose a spawn, never to grant anything. `SocialService.GameInvitePromptClosed` reports who was invited; log the count as `InviteClosed`.

### Friends bonus (server)
```lua
--!strict
local Players = game:GetService("Players")
local friendCache: {[string]: boolean} = {}

local function areFriends(a: Player, b: Player): boolean
	local lo, hi = math.min(a.UserId, b.UserId), math.max(a.UserId, b.UserId)
	local key = `{lo}:{hi}`
	if friendCache[key] ~= nil then return friendCache[key] end
	local ok, result = pcall(a.IsFriendsWith, a, b.UserId)
	if not ok then return false end -- don't cache failures
	friendCache[key] = result
	return result
end

local function refreshFriendBonus() -- run on PlayerAdded/PlayerRemoving, in a task
	local players = Players:GetPlayers()
	for _, p in players do
		local friends = 0
		for _, other in players do
			if other ~= p and areFriends(p, other) then friends += 1 end
		end
		p:SetAttribute("FriendBonus", math.min(friends * 0.1, 0.3)) -- +10% each, capped at +30%
	end
end
```
In big servers, check only pairs that include the player who just joined, rather than every pair, to keep `IsFriendsWith` calls low.

### Codes (server)
```lua
--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local lastTry: {[Player]: number} = {}

local function redeemCode(player: Player, data, raw: unknown): string
	if typeof(raw) ~= "string" or #raw > 32 then return "Not a valid code" end
	if os.clock() - (lastTry[player] or 0) < 2 then return "Slow down a little" end
	lastTry[player] = os.clock()
	local code = raw:upper():gsub("%s", "")
	local def = Config.Codes[code]
	if not def then return "Not a valid code" end
	if def.ExpiresAt ~= 0 and os.time() > def.ExpiresAt then return "Expired" end
	if data.Codes[code] then return "Already used" end
	data.Codes[code] = os.time()
	data.Coins += def.Reward.Coins or 0
	if def.Reward.Boost then
		data.Boosts[def.Reward.Boost] = (data.Boosts[def.Reward.Boost] or 0) + def.Reward.BoostSeconds
	end
	AnalyticsService:LogCustomEvent(player, "CodeRedeemed", 1, {
		[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = code,
	})
	return `Redeemed! +{def.Reward.Coins or 0} Coins`
end
```
`raw:upper():gsub(...)` returns two values; assigning to one local keeps the string.

### Group perks (server)
```lua
local GROUP_ID = Config.Social.GroupId -- 0 until the owner sets it
local function checkGroup(player: Player)
	if GROUP_ID == 0 then return end
	local ok, inGroup = pcall(player.IsInGroup, player, GROUP_ID)
	player:SetAttribute("GroupMember", ok and inGroup == true)
end
```

### Logging retention events with AnalyticsService
Log on the server. Keep event names few and stable, and keep custom field values low-cardinality (no user IDs or timestamps as values). Roblox caps how many distinct names and values it tracks.
```lua
local AnalyticsService = game:GetService("AnalyticsService")
AnalyticsService:LogCustomEvent(player, "QuestCompleted", 1, {
	[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = questId, -- e.g. "Collect200"
})
AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, "Coins", reward,
	data.Coins, Enum.AnalyticsEconomyTransactionType.TimedReward.Name, "DailyReward")
-- Onboarding funnel: ordered steps, logged once each per player.
AnalyticsService:LogOnboardingFunnelStepEvent(player, 3, "FirstUpgrade")
```
Log these: daily claimed (with streak), playtime gift claimed, quest completed, badge awarded, invite prompt closed (with count), joined from an invite, code redeemed, event participation, update log viewed, welcome-back shown. Liveops records the event list in `games/<slug>/liveops.md`.

## Checklist
- [ ] Daily reward uses the server UTC day index; claiming twice in one day is rejected; the grace day works; the streak restarts without removing rewards.
- [ ] The daily card is the only card on join; the update log and offers wait.
- [ ] Playtime gifts are timed on the server, claimed by tap, and stop at 60 minutes.
- [ ] Quests rotate deterministically from the day/week index, and progress comes only from server events.
- [ ] Every quest is a core-loop verb; none says "spend" or "invite".
- [ ] Welcome-back appears after 3+ days away, once per absence, with a scaled gift.
- [ ] Offline progress (idle/tycoon) is capped and collected with a tap.
- [ ] The pacing chart shows no gap over 5 minutes between unlocks before minute 30.
- [ ] Badges award through a pcall'd, non-blocking helper; placeholder IDs are skipped.
- [ ] Weekly and all-time leaderboards exist; writes are throttled, reads cached, names batched.
- [ ] The invite button appears only when `CanSendGameInviteAsync` is true and never pops on its own; `LaunchData` lands the friend at the inviter.
- [ ] The friends bonus shows on the HUD and is capped.
- [ ] Status items are readable from 30+ studs.
- [ ] Trades lock, double-confirm, execute on the server and respect `PolicyService`.
- [ ] Private server setting chosen by the owner and recorded in `decisions.md`.
- [ ] Custom player text is filtered with `TextService:FilterStringAsync`.
- [ ] Codes are case-insensitive, one use per player, rate-limited, with at least one launch code.
- [ ] The "What's new" panel shows once per update and closes in one tap.
- [ ] Events read UTC windows from config; a Studio-only offset tests them; every event has a free track.
- [ ] Kid Tester found no guilt text, fake timers, forced social or stacked popups.
- [ ] Every retention event and the onboarding funnel fire in a Studio test with no errors in Output.
- [ ] `liveops.md` lists D1/D7/D30 and session length targets and the change log.

## Common mistakes
- Using the client's clock for dailies, which lets players change the device time and claim all week.
- A streak that wipes huge rewards on one missed day, so players quit instead of coming back.
- Selling streak savers to children.
- Quests that grant progress from a remote the client can fire.
- Quests like "Play for 60 minutes" that reward idling.
- Writing to the OrderedDataStore on every coin pickup and exhausting the DataStore budget ([[13 Building It Right]]).
- Calling `AwardBadge` in a tight loop for players who already own the badge.
- Popups for daily reward, update log, starter pack and invite all at once on join.
- Logging high-cardinality custom events (one name per item ID) that make the dashboards useless.
- Punishing absence: decaying pets, rotting crops, offline raids.
- Offline caps tuned to sell an extension pass.
- Invite prompts that open on their own, or rewards that require inviting.
- Trusting `LaunchData` to grant items.
- Status rewards that only appear in the player's own menu.
- Paid-only revives in co-op runs.
- Events whose only good reward is paid, or event power that later players can't get.
- A permanent "[UPDATE]" tag in the title.
- Notification opt-in prompts on join.
- Changing three retention systems in one update and not knowing which one worked.
- Designing around Premium playtime after Premium Payouts ended [5].

## References
[1] Creator Rewards — https://create.roblox.com/docs/creator-rewards — daily engagement (Active Spenders, first three experiences of the day, 10 minutes) and audience expansion (35% of first $100 via share links, 100+ DAU); prohibited behavior.
[2] Creator Rewards (Roblox Wiki) — https://roblox.fandom.com/wiki/Creator_Rewards — began July 24, 2025, replacing Engagement-Based Payouts and Creator Affiliate; audience expansion needs ID verification and DevEx.
[3] Roblox's new Creator Rewards encourage engagement and retention (Tubefilter) — https://www.tubefilter.com/?p=186987 — Active Spenders defined as $9.99+ in the past 60 days; framed as a retention push.
[4] Roblox To Reward Creators For Attracting Players (MediaPost) — https://www.mediapost.com/publications/article/406941/roblox-to-reward-creators-for-attracting-players.html — payouts not capped; may change.
[5] Engagement-based payouts — https://create.roblox.com/docs/production/monetization/engagement-based-payouts — deprecated effective July 24, 2025, replaced by Creator Rewards.
[6] Engagement-Based Payouts (Roblox Wiki) — https://roblox.fandom.com/wiki/Engagement-Based_Payouts — Premium Payout replaced by Creator Rewards on that date.
[7] Monetization (Creator Docs) — https://create.roblox.com/docs/en-us/production/monetization — appointment mechanics that can be removed or brought forward are unpopular with Roblox players; tourists and locals.
[8] Private servers — https://create.roblox.com/docs/production/monetization/private-servers — free for everyone or a monthly Robux fee; experience must be public.
[9] Private/VIP Servers FAQ (Roblox Help) — https://en.help.roblox.com/hc/articles/205345050 — creator-set prices; initial then monthly charge.
[10] Roblox Plus private server limit (PCGamesN) — https://www.pcgamesn.com/roblox/plus-private-server-limit — one free private server per game for Plus subscribers; creators can still offer free servers.
[11] Subscriptions — https://create.roblox.com/docs/production/monetization/subscriptions — recurring monthly benefits.
[12] Adopt Me Pets Plus subscription (Sportskeeda) — https://www.sportskeeda.com/roblox-news/adopt-me-pets-plus-subscription-benefits-content-price — $2.99/month varying by region; includes VIP; two pets equipped.
[13] Exploring gamepasses in Adopt Me (Sportskeeda) — https://sportskeeda.com/roblox-news/exploring-gamepasses-roblox-adopt-me — VIP Room access and an exclusive limo.
[14] Gifting (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Gifting — players can gift permanent fruits and gamepasses.
[15] Everything you should know about gamepasses in Blox Fruits (Sportskeeda) — https://www.sportskeeda.com/roblox-news/everything-know-gamepasses-roblox-blox-fruits — Fruit Notifier gives distance to newly spawned fruits.
[16] Can You Gift Seeds in Grow a Garden? (Deltia's Gaming) — https://deltiasgaming.com/?p=239851 — Gift Shop costs Robux; pick a friend; same server.
[17] Grow a Garden Seed Shop and Gear Shop Stock Explained (Deltia's Gaming) — https://deltiasgaming.com/?p=207402 — stock refreshes every five minutes; Robux buys any seed.
[18] Knobs (DOORS Wiki) — https://doors-game.fandom.com/wiki/Knobs — Knobs bought with Robux or earned by ending a run in any way.
[19] Doors codes (PCGamesN) — https://www.pcgamesn.com/roblox/doors-codes — maintained code list for free items.
[20] Roblox Doors codes: free revives, knobs and more (Dexerto) — https://www.dexerto.com/roblox/roblox-doors-codes-free-revives-knobs-and-more-2110561 — dated code list.
[21] Roblox Doors codes (Sportskeeda) — https://sportskeeda.com/roblox-news/doors-codes — Revives are paid and bought with Robux.
[22] Inside the pay-to-play world of Roblox targeting children (University of Sydney, May 2026) — https://www.sydney.edu.au/news-opinion/news/2026/05/17/inside-the-pay-to-play-world-of-roblox-targeting-children-.html — deceptive practices in 14 of 15 games, including fake daily discounts.
[23] Misleading and Deceptive Monetisation in Roblox (report) — https://ses.library.usyd.edu.au/handle/2123/35033 — the March 2026 report on 15 top-earning games.
[24] Roblox sucking up money from young players: study (ACS Information Age) — https://ia.acs.org.au/article/2026/roblox-sucking-up-money-from-young-players--study.html — countdown timers creating false urgency; near-miss visuals.
[25] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md — per-player policy info from GetPolicyInfoForPlayerAsync; yields; rate cap.
[26] Policy Info For Player (DevForum) — https://devforum.roblox.com/t/policy-info-for-player/1926774 — pcall and cache policy info on join.
[27] Regional pricing — https://create.roblox.com/docs/en-us/production/monetization/regional-pricing — GetUsersPriceLevelsAsync for transfers of items with different managed prices.
[28] Robux transfers — https://create.roblox.com/docs/en-us/production/monetization/robux-transfers — prompting Robux transfers between users; the game earns 10%.
[29] Best approach for a scalable gifting system with Developer Products (DevForum) — https://devforum.roblox.com/t/best-approach-for-a-scalable-gifting-system-with-developer-products/4740647 — central gift service design.
[30] GiftTools+ (DevForum) — https://devforum.roblox.com/t/gifttools-a-powerful-customizable-tool-gifting-system/4754403 — staged transfer notifications.
[31] [ARCADE] Pet Simulator 99! (RoWatcher) — https://rowatcher.com/games/3317771874/arcade-pet-simulator-99 — title history with an update tag.
[32] [TAP HEROES] Pet Simulator 99! (RoWatcher) — https://rowatcher.com/games/3317771874/tap-heroes-pet-simulator-99 — another update-tagged title.
[33] Rewarded video ads — https://create.roblox.com/docs/production/promotion/rewarded-video-ads — eligibility for optional ad rewards.
[34] Ad integrations — https://create.roblox.com/docs/production/promotion/ad-integrations — rewarded ads only for users 13+; rewards can't be randomized.
[35] Roblox UI design best practices (creation.dev) — https://www.creation.dev/blog/roblox-ui-design-best-practices — one menu open at a time.
[36] Roblox Doors codes (Pro Game Guides) — https://progameguides.com/roblox/roblox-doors-codes/ — dated code list.
[37] Roblox Doors codes: latest working list (Allthings.how) — https://allthings.how/roblox-doors-codes-latest-working-list/ — dated code list with expired codes.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[15 Discovery and Growth]]
