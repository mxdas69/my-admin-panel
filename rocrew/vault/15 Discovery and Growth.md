---
tags: [vault, discovery, growth, marketing, ads, algorithm, launch, community]
for: [pulse, liveops, splash, lead, producer]
also: [architect, merchant, frame, balance, kid-tester, builder]
---

# 15 Discovery and Growth

This chapter is about how players find a Roblox game and what makes Roblox show it to more of them. It covers the surfaces (Home and its Recommended for You sort, Charts, search, sponsored slots, curated programs, notifications, friends and invites), the signals Roblox says it ranks on, thumbnail testing, Ads Manager, short-video creators, Discord, update-driven spikes, and a day-by-day launch-week plan. The other chapters make a game worth playing. This one gets it in front of players, and then makes sure the first players it reaches tell Roblox to show it to more.

On Roblox the algorithm is the publisher, and it doesn't read pitches. It watches what real players do after they see your tile: do they click, do they stay, do they come back on other days, do they bring friends, do they spend. Roblox's own Discovery page says Recommended for You ranks games on per-player averages of those behaviors, and only counts players who arrived through Recommended for You [1]. Since mid-2026 it looks at a 28-day window built to value long-term retention [2][3]. Ads, YouTubers and Discord can bring players and data, but they can't buy distribution. Distribution is earned by the first session ([[01 The First Five Minutes]]), the loop ([[02 The Core Loop]]) and retention ([[10 Retention and Social]]).

Read this chapter at three moments. During **Pitch**, Pulse uses the surfaces and signals sections to judge whether a format can win a chart. During **Ship prep**, Splash, Liveops and Lead follow the launch-week plan and the thumbnail-testing recipe. After **launch**, Liveops reads the weekly dashboard procedure every Monday and logs every growth action in `games/<slug>/growth.md`. The owner spends money, sets the store page and talks to creators. Agents draft, measure and recommend.

Platform features change faster than any page. Before acting on a rule that names a Roblox surface or setting, check the linked Creator Hub page for the current wording, and report any difference in your handoff so the Lead can fix this chapter.

## Rules

### How Recommended for You decides

1. **Recommended for You (RFY) on Home is the main door, and its ranking only counts players who came in through it.** Roblox says it uses a retrieval stage and then a ranking stage, and that the ranking stage ignores the engagement, monetization and retention of users first acquired from ads, curation, friends, search, social media or any other source [1]. This one fact decides most growth strategy. Ads and influencers can fill servers, but the number that grows impressions is how RFY-acquired players behave. In Creator Hub, open Analytics > Acquisition > Home Recommendations [1] and read retention split by acquisition source [5]. Liveops tags every report with the source the cohort came from.
   Done right: Liveops reports "RFY cohort D1 rose after v1.2; the ad cohort is separate and lower, as expected."
   Done wrong: "We bought 50k plays, so the algorithm will pick us up now."

2. **Optimize per-player averages, not totals: 1,000 engaged players beat 100,000 bounced ones.** Roblox calculates the recommendation signals as averages per user, not totals, so smaller games with highly engaged players aren't disadvantaged [1]. That also means low-intent traffic, such as misleading thumbnails, bots or bad ad targeting, drags every average down. Design every acquisition push to bring players likely to stay: honest art, the right genre, a first minute that delivers the thumbnail's promise.
   Done right: the team turns down a "free Robux" style thumbnail that would triple clicks and halve stay time.
   Done wrong: the team counts visits as success while average playtime per user falls each week.

3. **qPTR (qualified play-through rate) is the click-and-stay number: engaging plays ÷ RFY impressions.** That is Roblox's definition [1]. The tile (icon, thumbnails, title) earns the click and the first minute turns the click into an "engaging play". Roblox doesn't publish the exact engagement threshold in our sources, so this studio uses its own proxy: the share of new players who reach onboarding step 3 and stay at least 5 minutes, logged as funnel steps ([[12 Live Ops and Launch]]). Kid Tester's first-session report and Splash's thumbnail work share one goal: raise qPTR.
   Done right: a thumbnail that shows the actual first-minute action, plus a first reward in under 30 s (studio target).
   Done wrong: a cinematic thumbnail of a boss that new players won't see for two hours.

4. **The ranking signals are qPTR, 7-day playtime, play days, spend days, Robux spent and intentional co-play days, and they need to rise together.** Roblox lists these per-user signals and says the algorithm favors a game when they rise together [1]. Since June 2026 RFY uses a 28-day view that directly measures long-term retention [2][3], and Roblox said it would publish the full signal list with relative importance [3]. Map every signal to a design lever (table in "The signals and the levers" below) and make sure each update moves at least one lever without hurting another.
   Done right: an update adds a daily garden harvest (play days) and a party bonus (co-play days).
   Done wrong: an update that triples session length by adding a long AFK grind, while play days fall.

5. **Build for day 7 and day 28, not just day 1: the algorithm now looks four weeks out.** Roblox says it moved RFY from a 7-day view to a 28-day view that measures long-term retention, and that in testing the change surfaced games that retain players better [3]. Creators may see distribution swings after such changes [2]. Plan content so a player has a reason to return on day 2, day 7 and week 4: a daily reward ladder, weekly goals, a collection with long-tail rarities, and updates on a fixed rhythm ([[10 Retention and Social]]).
   Done right: `plan.md` names the day-2, day-7 and day-28 hooks before any code exists.
   Done wrong: all content can be finished in one weekend.

6. **Impressions follow signals by a few days, so read leading indicators and wait 3-7 days before judging.** Roblox's Discovery page shows a qPTR dip on February 28 followed by an impression drop on March 3 [1]. If qPTR or playtime drops after an update, expect fewer impressions a few days later. Fix the cause within 48 hours of seeing the dip, and judge any change on a 7-day window against the previous 7 days, never on one day.
   Done right: Liveops sees qPTR fall on Tuesday after a new tutorial, rolls it back Wednesday, and impressions never drop.
   Done wrong: the team waits for impressions to fall, then changes three things at once.

7. **Expect a temporary qPTR dip while impressions ramp up, and don't panic-swap the thumbnail.** Roblox notes that qPTR can drop temporarily when impressions rise in early discovery, and should level off as traffic settles [1]. A wider audience is less closely matched to the game. Keep the thumbnail set for at least 7 days during a ramp unless qPTR falls and keeps falling for 5 or more days.
   Done right: impressions double, qPTR dips 10% and recovers in four days, and nothing is changed.
   Done wrong: three thumbnail swaps in one week, so personalization never settles.

8. **Seasonality and competitors move your numbers even when you change nothing.** Roblox lists weekly patterns, summer, back-to-school and holidays as influences on impressions, and notes that distribution can fall if other games engage players better, even when your own signals hold steady [1]. Always compare with the benchmark set Creator Hub offers (Roblox lets you choose it) [5] and with the same weekday last week.
   Done right: "Impressions fell 12% this week; the benchmark set fell 10%; school started."
   Done wrong: rewriting the economy because traffic dipped during the first week of school.

9. **Co-play is a ranking signal, so design for friends playing on purpose.** "Intentional co-play days" is one of the listed signals [1]. Make playing with friends better than playing alone: a party bonus (for example +10% coins per friend in the server, capped at +30%, studio target), shared goals, trading, co-op bosses, friend-join notices and a "join friend" button on the HUD.
   Done right: a friend-joined toast that offers both players a 2-minute bonus when they stand together.
   Done wrong: a single-player tycoon where a friend in the same server adds nothing.

10. **Spend days count separately from Robux spent, so offer small, fair, everyday value.** Both "spend days" and "Robux spent" are listed per-user signals [1]. A cheap, honest item many players buy on different days helps more than one expensive item a few whales buy once. Merchant keeps one low-price product (for example a 25-49 Robux boost; the owner sets prices) always visible after the first session, never during the first 5 minutes ([[09 Shops and Monetization]]).
   Done right: a small daily-value pass ladder with no pressure tactics.
   Done wrong: a single 4,999 Robux bundle and nothing below it.

11. **Clones are deprioritized: ship original metadata and an original place file.** Roblox's promotion docs warn that games whose metadata and place files closely resemble existing games aren't prioritized for recommendations and might rank lower in search [14]. Never publish an uncopylocked kit or template as-is, never copy another game's title or description pattern word for word, and build the map from scratch ([[06 World and Look]]). Steal patterns, not files.
   Done right: a fresh map, original title and original description written from `plan.md`.
   Done wrong: a reskinned "simulator kit" with the template's map and an "X Simulator 2" title.

12. **Fix the core before you buy traffic: ads don't fix a declining organic trend.** A Roblox analytics post says ads aren't meant to fix a declining organic trend, though they can still bring new, relevant users [5]. Roblox's own guidance is that if retention is low, you first make the core gameplay more fun, clear and rewarding [4]. Lead blocks any ad spend request while RFY-cohort D1 is below the plan's target or falling.
   Done right: the soft-launch fix list is closed before the owner is asked about an ad budget.
   Done wrong: running a sponsored campaign to "save" a game whose new players leave in 90 seconds.

### The surfaces

13. **Treat each surface as a separate funnel with its own number, and record which surface each cohort came from.** The surfaces are Home (RFY and other sorts), Charts, search, sponsored placements (Home, Discover and search) [13], notifications [19], friends and invites [22], and off-platform links (YouTube, TikTok, Discord). Each needs its own fix: the tile for RFY, keywords for search, momentum for Charts, opt-in timing for notifications, rewards for invites. Liveops keeps the "Surfaces" table below in `growth.md` with the current number for each.
   Done right: "Search brings 8% of new players and their D1 is high, so we add the second keyword to the description."
   Done wrong: one blended "new players" number with no idea where they came from.

14. **Charts reward momentum within a category, so pick a genre whose chart you can climb, and set the genre correctly.** Roblox's Charts include trending lists, Top Playing Now [8] and per-genre trending charts such as "Trending in Party and Casual" [9]. Third-party guides describe Popular, Top Earning and Up-and-Coming style lists, but Roblox doesn't publish chart formulas in our sources [10]. A DevForum critique notes that Up-and-Coming has featured games from 10K to over 200K concurrent players [8], so it isn't a small-game lane. Set the experience's genre in its settings to the chart you can realistically rise in ([[11 Thumbnails, Icons and the Store Page]]).
   Done right: Pulse checks which genre trending chart has the weakest top 10 before the pitch.
   Done wrong: tagging a cozy farm game as "Action" because Action looks bigger.

15. **Search is your safety net: own your exact title and 3-5 honest keywords.** Search ads target keywords [14], which shows keywords matter in search. A 10-year-old must be able to spell the title after hearing it once. Put the 3-5 words a player would type in the description's first two lines. DevForum users report public games not showing in search, even for an exact-title search [35][36], so on launch day someone searches the exact title from a non-owner account on a phone. Roblox has reportedly tested an AI-assisted search that understands broader requests [34], so also describe the game in one plain sentence ("a cozy game where you grow plants and sell them").
   Done right: title "Lava Pet Tycoon", description opening "Hatch lava pets, build your tycoon, trade with friends."
   Done wrong: title "Ẕ𝓮𝓷 𝓦𝓸𝓻𝓵𝓭 ✨ [BETA]", which nobody can type.

16. **Today's Picks is a Marketplace avatar-item sort, not a game slot, so don't plan a launch around being featured.** Roblox documents Today's Picks as a daily curated sort for avatar items, with nominations from 17+ ID-verified creators reviewed weekly [37]. A later DevForum post says it's shown less often and the space is being used for personalized recommendations [38]. For experiences, Roblox lists programs such as the Learn & Explore sort for educational games [39]. Our sources don't show a public application for featuring a regular game. Plan on earning RFY. If the owner's game has a real educational angle, apply to the matching program.
   Done right: `growth.md` lists curated programs as a bonus, not a dependency.
   Done wrong: "Launch plan: get featured by Roblox."

17. **Notifications bring players back only if they opted in after a good moment and the message is worth opening.** Roblox's Experience Notifications reach users 13+, require at least 100 visits since launch and a game that isn't under moderation, and can carry launch data the game reads through `Player:GetJoinData()` when the player joins from the notification [19][20]. Ask for opt-in through `ExperienceNotificationService` (members include `CanPromptOptInAsync`, `PromptOptIn` and `OptInPromptClosed`) [21] right after a win, never on the loading screen. Send at most one notification per real event (an update, an event start, a crop ready), and use the launch data to drop the player straight at the new content.
   Done right: "Your Golden Sunflower is ready to harvest!" opens the game at the player's plot.
   Done wrong: an opt-in prompt in the first 10 seconds, then daily "Come back!" pings.

18. **Every invite gives a reward to both sides, and the reward is paid on arrival, never on sending.** Roblox's friend referral system fills `ReferredByPlayerId` in join data for all invitation types, so you can reward both the inviter and the invitee [22]. The event for an invite being *sent* through the default invite UI is CoreScript-only, so games can't count sends [23]. Reward the arrival, cap rewards per inviter per day (studio target: 5) to stop alt farming, and validate everything on the server.
   Done right: "Your friend joined! You both got a 2x Luck potion."
   Done wrong: "Invite 10 friends to unlock the Sword", which pays for spam and can't be verified anyway.

19. **Make joining a friend instant and worth it.** Friends see each other's activity and join each other. Keep server size with headroom so a friend can join (rule of thumb: a server holds the target party size plus spare slots), show a "Friend joined" toast and spawn them together, and make the first shared action obvious. Track the party share in analytics (players with 1+ friend in the server) as a co-play proxy.
   Done right: a friend spawns next to you with a "Play together: +10% coins" chip.
   Done wrong: a full 6-player server that turns the friend away.

### Tile, thumbnails and the store page

20. **Launch with 3-5 thumbnails and let thumbnail personalization pick the winners per audience.** Roblox's personalization shows each thumbnail to a random set of users, measures qPTR for each user group, then sends more impressions to the winner for each group while keeping a little traffic on the others. It only turns on with 2 or more active thumbnails, and Roblox reports an average +8.5% qPTR for experiences using it during testing [16]. Since a 2025 update, your current winner keeps most traffic while new thumbnails get enough impressions to be measured, and traffic adjusts within hours [17].
   Done right: Splash delivers 4 thumbnails, each a different promise (pets, trading, boss, friends).
   Done wrong: one thumbnail, so personalization never runs.

21. **Each new thumbnail tests one idea against the current winner.** Change one thing: the hero object, the character's emotion, the background color, or text versus no text. Name the files after what they test (`thumb_v3_bigpet_vs_v1.png`) and log the start date in `growth.md`. Give each test at least 7 days, or until Creator Hub shows a clear winner, before judging ([[11 Thumbnails, Icons and the Store Page]]).
   Done right: "v4 tests a sunset background against v1's blue sky; the pet and pose are unchanged."
   Done wrong: four totally different thumbnails every week, so nothing is learned.

22. **The tile's promise must come true in the first 60 seconds, because qPTR counts engaging plays, not clicks.** A misleading thumbnail wins the click and loses the stay, which lowers qPTR [1][16]. Commentary on Roblox thumbnails calls them conversion ads [18]; a conversion ad that lies converts once. Every thumbnail element (the pet, the world, the action) must be something a new player sees or does within their first minute or first upgrade.
   Done right: the thumbnail's glowing egg is the first egg a new player opens.
   Done wrong: a rare dragon that takes 40 hours to reach.

23. **Refresh at least one thumbnail with every content update, and keep the winner.** New content gives returning players a reason to click and new players a fresh promise. Add one update thumbnail and leave the current winner active, so personalization compares them [17]. Retire thumbnails that keep losing after two update cycles.
   Done right: "v1.4 Volcano" thumbnail added; the winning v1 stays.
   Done wrong: replacing all thumbnails with update art, which resets what was learned.

24. **The title is short, searchable and honest; update tags are optional and must be true.** Rule of thumb: a name of 2-4 words, with at most one bracketed tag such as "[UPDATE]" only while that update is new (about 7-10 days), and never "[FREE ITEMS]"-style claims. Check Roblox's current rules for experience titles before adding emoji or tags, since policies change.
   Done right: "Lava Pet Tycoon [VOLCANO]" during the first week of v1.4.
   Done wrong: "🔥🔥 NEW!! FREE PETS!! Lava Pet Tycoon UPD 99 🔥🔥".

### Ads

25. **Ads buy players and data, never distribution.** RFY ranking ignores users acquired from ads [1], and ads don't fix a falling organic trend [5]. Use ads to (a) get the first few thousand players to learn whether the first session works, (b) seed full servers so co-play happens, and (c) amplify an update that already retains. Liveops writes the purpose of every campaign in `growth.md` before it starts.
   Done right: "Purpose: 3,000 new players over 7 days to measure the new onboarding."
   Done wrong: "Purpose: go viral."

26. **Pick the campaign objective by the question you're asking, and expect Engagement to cost more per play.** Ads Manager's docs say Engagement campaigns target a smaller, highly engaged audience and typically have a higher cost per play (CPP) than Plays campaigns [12]. They also suggest treating Engagement as a separate investment if your goal is progress toward the Roblox Kids and Select threshold, instead of moving budget from Plays [12]. Read the July 2026 DevForum posts on the Kids and Select global launch and eligibility before planning for that audience [15].
   Done right: Plays to measure the funnel, then a separate Engagement test once D1 is healthy.
   Done wrong: comparing a Plays campaign's CPP with an Engagement campaign's and calling Engagement a failure.

27. **Start with auto-bidding, one small budget, and a 7-day run.** Ads Manager's auto-bidding sets the bid for the most plays at the lowest cost once you set a budget and duration, and you choose either a daily or a lifetime budget, not both [12]. The owner sets the amount. Run one campaign per question and change one thing per run.
   Done right: auto-bid, a lifetime budget, 7 days, one audience, the current winning thumbnail.
   Done wrong: three overlapping campaigns with different audiences started the same day.

28. **Sponsored ads show on Home, Discover and in search, so the ad is your tile.** Sponsored experiences appear in the Sponsored category on the Home and Discover pages and as Sponsored tiles in search results, with placement decided by bidding [13]. Newer docs say campaigns show on both Home and search automatically [12]. The thumbnail and title you advertise with must follow every honesty rule above.
   Done right: the ad uses the thumbnail personalization already picked as the winner.
   Done wrong: an ad-only clickbait image that doesn't match the store page.

29. **Judge a campaign by the retention and spending of the cohort it brought, compared with organic players.** Creator Hub shows retention by acquisition source [5]. Report for each campaign: plays, CPP, D1 and D7 of the ad cohort, payer conversion of the ad cohort, and the organic cohort's same numbers in the same week. A campaign whose D1 is far below organic is a targeting or creative problem.
   Done right: "Ad cohort D1 is 70% of organic D1, acceptable; D7 pending."
   Done wrong: "50,000 plays! Success."

30. **Follow Roblox's advertising policies, and keep every ad and in-game ad honest and age-appropriate.** Roblox published new advertising policies and standards in July 2026 [15]. Before any campaign, Lead checks the current policy page. Never imply Roblox endorsement, never promise free Robux, and never run ads that differ from the game.
   Done right: Lead links the policy version checked in `growth.md`.
   Done wrong: an ad that says "OFFICIAL ROBLOX EVENT".

31. **Rewarded video is optional for players and only shown to 13+ users, so design it as a fair bonus.** Roblox's rewarded video ads let players choose to watch a video of up to 30 seconds for an in-game reward, are only shown to users 13 and older, and pay creators by impressions. Higher completion rates (90%+) or a Minimal content maturity rating may earn more [32][44]. Roblox announced more placement options and a Studio plug-in for Q4 2026 [33]. Place the offer where players already want a boost (after a loss, at a long timer), give a reward worth about 3-5 minutes of play (studio target), cap it per day, and never gate progress behind ads.
   Done right: "Watch a short video for a free 2x Luck for 10 minutes" after a failed hatch, 3 per day.
   Done wrong: an ad prompt every time a player opens the shop.

### Off-platform

32. **Short video is the strongest off-platform channel, so design 3 "clip moments" into every update.** Grow a Garden's rise was driven by players sharing videos of their sessions on TikTok, according to AP and Wikipedia [25][27]. A clip moment is a 5-10 second, readable-without-sound event: a giant rare reveal, a huge number popping, a funny steal, a dramatic transformation. Architect lists the clip moments in `plan.md` and Scenic and VFX make them readable in a vertical crop.
   Done right: a rare mutation that makes the plant glow, grow 3x and shoot sparks, visible from across the map.
   Done wrong: rare drops that only show as a line of text in the inventory.

33. **Give creators a reason and a kit: early access, a private server, a creator code and ready b-roll.** Rule of thumb from practice. YouTube and TikTok creators need novelty first (be first to show the update), then an easy video (a private server, clear objectives, and only items real players can get). The kit holds: 30-60 s of b-roll in 16:9 and 9:16, 3 key art images, a one-paragraph pitch, the update date and time, and a creator code that unlocks a cosmetic for viewers. The owner contacts creators and decides any payment. Paid promotion must be disclosed according to the platform's rules and local law.
   Done right: a creator gets the kit 48 hours before the update and records in a private server.
   Done wrong: messaging 200 creators "pls play my game".

34. **Discord is the update channel and the bug desk, linked from the store page, and never required for rewards.** A community guide recommends linking Discord from the experience's social links and description and posting codes in announcements [24]. Many Roblox players are under 13 and can't use Discord (Discord's own minimum age is 13), so every code posted in Discord also appears in-game or in the description. Set up channels from the "Discord blueprint" below and staff it with moderation before launch.
   Done right: codes appear in Discord, the description and an in-game "Codes" panel at the same time.
   Done wrong: "Join our Discord for the free pet."

35. **Codes are the bridge between off-platform and in-game, so every code is server-validated, single-use per player and time-limited.** Codes reward people for following the game elsewhere and give creators something to share [24]. Codes live in Config with UTC start and end dates, rewards are small (studio target: 5-15 minutes of progress), each player can redeem a code once (stored in their save), and codes expire within 14-30 days.
   Done right: `UPDATE14` gives 500 coins until 14 days after v1.4.
   Done wrong: a permanent code for 1,000,000 coins that breaks the economy.

36. **Never buy fake plays, bots or fake reviews.** When investors publicly alleged that bots inflated Grow a Garden's visibility, the claims were later retracted and Roblox said its analysis confirmed genuine popularity [25], which shows that suspicious traffic gets scrutinized. Fake traffic also wrecks the per-user averages the algorithm ranks on [1]. This is a hard ban for the studio.
   Done right: growth comes from honest ads, creators and updates.
   Done wrong: buying "10k visits" from a third-party site.

### Updates and timing

37. **Updates drive spikes, so ship major updates on a fixed weekday and hour that suits the audience.** Grow a Garden kept a weekly Saturday update schedule [28], and RoMonitor data reported by WN Hub shows a record of 11.7 million concurrent players on Saturday, May 31, 2025, against 8.9 million a week earlier [30]. A fixed time trains players to show up together, which fills servers (co-play) and creates a chart spike. Pick a weekend-friendly slot for the main audience's time zones (for example Saturday 15:00 UTC, studio default), and keep it.
   Done right: "Every other Saturday, 15:00 UTC", announced in-game and in Discord.
   Done wrong: updates whenever a feature happens to be finished, at 03:00 on a Tuesday.

38. **Pre-announce every major update with an in-game countdown and the exact time in UTC and local time.** Players look up update times: fan sites publish Grow a Garden event and update schedules [42][43]. Show a countdown board in the hub 3-7 days before the update, a "What's coming" teaser image, and the time converted with `os.date("*t")` on the client for the player's own clock ([[12 Live Ops and Launch]]).
   Done right: a lobby billboard "VOLCANO UPDATE in 2d 4h" plus the same countdown in the description.
   Done wrong: a surprise update nobody was waiting for.

39. **When weekly content gets stale, slow the cadence and add depth instead of shipping thin updates.** In August 2025 Grow a Garden's developer said weekly events had become too hard to keep fresh and new, and planned to focus on adding depth to farms, with events still in between [29]. Liveops checks each update's D7 lift. If two updates in a row move nothing, move to a two-week cadence with a deeper system (crafting, a new progression track) rather than more of the same.
   Done right: "Next update in 14 days: cooking system", announced with a reason.
   Done wrong: a 7th weekly "new seed" update in a row that nobody plays.

40. **Time ads, creator videos and Discord pushes to land in the first 48 hours of an update.** New players then meet fresh content, returning players fill servers, and the team is watching. Lead keeps one calendar in `growth.md` with the update time, the creator embargo time (for example 1 hour after the update goes live), and the ad start (for example the same hour).
   Done right: update Saturday 15:00, creator videos 16:00, ad campaign starts Saturday morning and runs 7 days.
   Done wrong: an ad campaign that ends the day before the update.

41. **Log every growth action with a date, then judge it on a 7-day window.** Impressions lag signals by days [1], and seasonality moves everything [1]. `growth.md` has one row per action (thumbnail swap, ad start, creator video, update, code) with the date, the expected effect and the result after 7 days. Change at most one discovery variable per week (one thumbnail, or one ad change, or one title change), so you know what moved the numbers.
   Done right: a row like "2026-11-02 · thumb v4 sunset · expect +qPTR · result after 7 d: +6% qPTR, kept."
   Done wrong: changing the title, the icon and the thumbnails on the same day.

### Launch week

42. **The first 2-4 weeks after launch set the trajectory, so don't open the doors on a broken first session.** RFY measures how its players behave and now looks across 28 days [1][3], so early players' behavior shapes later distribution. The soft-launch gate in [[12 Live Ops and Launch]] (first-session funnel fixed, no data loss, purchases verified) must pass before any promotion.
   Done right: soft launch with friends and a group, fix the funnel, then promote.
   Done wrong: an ad campaign on the day of first publish.

43. **Launch on a day the team and owner can watch, 1-2 days before the weekend peak.** Rule of thumb: release Thursday or Friday so fixes land before Saturday's traffic. Weekly patterns are one of the influences Roblox lists [1]. The owner publishes and is reachable for the first 6 hours. Liveops watches errors, funnels and purchases each hour.
   Done right: publish Thursday 16:00 UTC, first hotfix Friday, weekend at full strength.
   Done wrong: publish Sunday night and leave a crash bug running for a week of school days.

44. **Run launch week in three waves: seed (friends, group, Discord), measure (small ads), spike (first update at day 7-10).** Seeding fills the first servers so co-play happens and early reviews are positive. A small ad test measures the funnel on strangers. The first content update arrives while the launch cohort is still deciding whether to stay. Day by day, this is the "Launch-week growth plan" below.
   Done right: update #1 is built during soft launch and ships on day 8.
   Done wrong: no content ready after launch, so the launch cohort runs out of things to do on day 3.

45. **Votes and favorites follow fun, so ask once, after a win, in plain words.** Rule of thumb. A small "Enjoying the game? Tap Like and Favorite on the game page" note after the first big reward, shown once per player, works better than repeated asks. Never trade rewards for likes or favorites. Keep the like ratio as a health signal in `growth.md`.
   Done right: a one-time end-of-first-session card.
   Done wrong: "Like the game to unlock the next world."

## Step by step

### Preparing discovery before the first publish, in 14 steps
1. **Pulse** confirms the genre and the chart it targets: open Charts, note the genre trending chart [9], and write the 10 games currently on it in `growth.md` with their tile style (colors, subject, text or no text). Don't copy them. Note what they all share and one way to stand out.
2. **Architect** writes in `plan.md` the one-sentence promise ("Grow glowing plants, sell them, and trade with friends") and the three clip moments for launch (Rule 32).
3. **Architect** lists the day-2, day-7 and day-28 hooks (Rule 5) and the co-play bonus (Rule 9).
4. **Splash** makes 1 icon and 4 thumbnails, each a different promise drawn from the first 10 minutes of play (Rules 20, 22), following [[11 Thumbnails, Icons and the Store Page]].
5. **Liveops** drafts the title (2-4 words, spellable), the description (first two lines = the promise plus 3-5 keywords), and the genre setting (Rule 15).
6. **Kid Tester** reads the title aloud once to an imaginary friend and types it from memory; if it can't be typed, Liveops renames it.
7. **Builder** wires `Player:GetJoinData()` handling for `ReferredByPlayerId` [22] and `LaunchData` [19], plus a codes system and the notification opt-in prompt (see "Luau" below).
8. **Frame** builds the invite button, the codes panel, the friend-joined toast and the countdown board (UI specs in [[05 UI and HUD]]).
9. **Liveops** sets up analytics: an onboarding funnel, and custom events `JoinedFromNotification`, `JoinedFromReferral`, `JoinedWithLaunchData` and `CodeRedeemed` ([[12 Live Ops and Launch]]).
10. **Merchant** confirms there's one small-price, honest offer visible after the first session (Rule 10).
11. **Reviewer** checks the referral and code paths for abuse: server-side caps, single use, no client-trusted values.
12. **Producer** checks the title, description and thumbnails against the honesty rules (Rules 22, 24, 30) and records the check in `games/<slug>/reports/`.
13. **Lead** asks the owner (`cli.mjs ask`) to set the store page fields, upload thumbnails, set the genre and add social links (Discord, YouTube) as drafted.
14. **Liveops** creates `growth.md` with the Surfaces table, the action log, the launch-week calendar and the campaign plan (empty rows ready).

### Running a thumbnail test, in 9 steps
1. Pick one idea to test (Rule 21) and write the hypothesis in `growth.md`: "A sunset background makes the pets pop more than blue sky. Expect higher qPTR."
2. Splash makes the variant from the current winner's source file, changing only that one thing.
3. Kid Tester looks at both at phone tile size (about 150 px wide). If they can't tell what the game is in 1 second, stop and fix the variant first.
4. The owner uploads the variant and leaves the current winner and at least one other thumbnail active, so personalization stays on [16][17].
5. Liveops logs the start date and time (UTC).
6. Wait at least 7 days, or until Creator Hub shows a clear winner. Don't touch anything else on the tile that week (Rule 41).
7. Read the thumbnail results in Creator Hub (qPTR per thumbnail and impression share) and the Home Recommendations tab [1].
8. Keep the winner. Retire any thumbnail that has lost two tests in a row.
9. Write the result row in `growth.md` and tell Splash what won and why, so the next thumbnail starts from the lesson.

### Running a first Ads Manager campaign, in 12 steps
1. Lead confirms the gate: soft-launch fixes are closed, RFY-cohort D1 meets the plan's target, and no open data or purchase bugs (Rule 12).
2. Liveops writes the campaign's question ("Does the new onboarding keep strangers?") and success numbers (for example "ad-cohort D1 ≥ 70% of organic D1", a studio target).
3. Lead reads the current Ads Manager page [12], the sponsored-experiences page [13] and the latest advertising policy posts [15].
4. Choose the objective: Plays for funnel tests, Engagement for a separate higher-intent test (expect a higher CPP) [12].
5. Choose auto-bidding and either a daily or a lifetime budget (not both) [12]. The owner sets the amount.
6. Choose a 7-day duration that starts with or right before an update (Rule 40).
7. Use the current winning thumbnail and the store title. No ad-only art (Rule 28).
8. Lead sends the full plan to the owner with `cli.mjs ask`, with the budget left blank for the owner.
9. The owner creates and starts the campaign.
10. Liveops checks daily for errors and server health (more players means more load), but doesn't judge results until day 7.
11. On day 7-8, Liveops reports plays, CPP, ad-cohort D1 and D7 so far, payer conversion, and the organic cohort's numbers for the same week, using retention by acquisition source [5].
12. Write the result in `growth.md` with one decision: repeat, change one thing, or stop.

### Setting up notifications and invites, in 9 steps
1. Check eligibility: at least 100 visits since launch, and the game isn't under moderation [19].
2. The owner creates the notification strings in Creator Hub (the docs reference a message asset ID used when sending) [19][20].
3. Builder adds the opt-in prompt on the client after the first big win (the first rare hatch, the first world unlock), using `ExperienceNotificationService` [21] (code below).
4. Builder adds a server path for sending, following the Open Cloud experience-notifications guide [20], with the API key held as a secret on the server and never in a replicated script.
5. Each notification carries launch data such as `{"go":"plot"}` or `{"go":"event"}`. On join, the server reads `GetJoinData()`, validates the keys against an allowlist and teleports the player inside the place to that spot.
6. Builder reads `ReferredByPlayerId` on join and pays the referral reward to both players if the inviter is a real, different user who hasn't hit the daily cap [22].
7. Frame adds an "Invite friends" button (in the menu and on the party bonus chip) that calls `SocialService:PromptGameInvite`.
8. Liveops logs `JoinedFromNotification` and `JoinedFromReferral` events, and checks opt-in rate and the joins each notification type brought.
9. Producer verifies that no notification is sent more than once per real event per player, and that every text is readable by a 10-year-old.

### Creator (YouTube and TikTok) outreach, in 11 steps
1. Pulse lists 20-40 creators who post the target genre regularly, with their typical video format (long-form, shorts, live).
2. Rank them by fit, not size. A smaller creator who plays your exact genre beats a big general one.
3. Liveops builds the creator kit (Rule 33): b-roll at 16:9 and 9:16, 3 key art images, a 1-paragraph pitch, update date and time, the creator code and its cosmetic reward.
4. Builder adds a creator-code system: a code typed in the Codes panel credits a creator ID in analytics and gives the player a cosmetic.
5. The owner sends the first messages personally. Agents never contact people.
6. Offer early access: a private server 24-72 hours before the update, with the update content enabled by a server-side flag for that server only.
7. Never give creators unfair items to show off. Show real content, at real drop rates.
8. Set an embargo: videos go live after the update is public.
9. Track each creator code's redemptions and the D1 of players who redeemed it.
10. Thank creators publicly in the update notes (with their permission).
11. Record in `growth.md` which creators brought players who stayed. Invite only those back for the next update.

### Setting up the Discord, in 10 steps
1. The owner creates the server. Agents draft the structure from the "Discord blueprint" below.
2. Channels: rules, announcements, update-log, codes, sneak-peeks, general, trading (if the game trades), bug-reports, suggestions, clips.
3. Roles: Owner, Mods, Testers, Creators, Players. Mods must be people the owner trusts.
4. Turn on Discord's own safety settings (verification level, explicit-content filter) and AutoMod for links and scams.
5. Bug reports use a template: device, what you did, what happened, what you expected, time (UTC).
6. Every code posted here also goes in-game and in the description the same minute (Rule 34).
7. Sneak peeks go out 3-5 days before an update: 1 image or one 10-second clip per day.
8. Link the Discord in the experience's social links and description [24].
9. Liveops reads bug-reports and suggestions daily and files the top 3 into `liveops.md`.
10. Never run giveaways that require Robux, personal info or off-platform payment.

### Reading the Home Recommendations dashboard every Monday, in 8 steps
1. Open Creator Hub > Analytics > Acquisition > Home Recommendations [1].
2. Write last week's RFY impressions, plays and qPTR, and the same numbers for the week before.
3. Read the per-signal trends (qPTR, playtime, play days, spend days, co-play) and mark each as up, flat or down [1].
4. Compare with the selected benchmark set [5] and note seasonality (school calendar, holidays) [1].
5. Look 3-7 days back for the cause of any change (Rule 6). Check the action log in `growth.md`.
6. Read retention by acquisition source to separate RFY, search, ads and friends [5].
7. Pick one lever for this week, tied to the weakest signal (table below).
8. Write a 5-line summary in `growth.md` and post it with `cli.mjs say --to lead`.

## How players find games: the surfaces

| Surface | How a player gets there | What decides placement (from sources) | Our lever | Number to watch |
|---|---|---|---|---|
| Home: Recommended for You | Opens the app; personalized sort | Retrieval, then ranking on per-user qPTR, playtime, play days, spend days, Robux spent, co-play days, over a 28-day view; only RFY-acquired players count [1][3] | First session, tile, retention, co-play | RFY impressions, qPTR, RFY-cohort D1/D7 |
| Home: other sorts and Continue | Returning players | Their own history | Retention and updates | Returning DAU |
| Charts (Trending, Top Playing Now, genre charts) | Charts tab | Momentum and size within each chart; formulas not published [8][9][10] | Fixed-time updates, the correct genre | Chart rank in `cli.mjs market` |
| Search | Typing a name or idea | Keyword match plus quality; clones rank lower [14]; search ads by keyword [14] | Title, description, keywords | Search share of new players |
| Sponsored (Home, Discover, search) | Ad tiles | Bidding against other campaigns [13] | Budget, objective, creative | CPP, ad-cohort D1/D7 [5][12] |
| Curated programs | Program sorts | Program rules (Today's Picks is Marketplace only [37]; Learn & Explore for education [39]) | Apply only if eligible | n/a |
| Notifications | A push or notification card | Opt-in, 13+, 100+ visits [19] | Opt-in timing, message value | Opt-in rate, notification joins |
| Friends and invites | Friend activity, invites, referral links | `ReferredByPlayerId` is filled for all invite types [22] | Party bonus, invite reward | Referral joins, party share |
| Off-platform (TikTok, YouTube, Discord) | Links, videos | Outside Roblox | Clip moments, creator kit, codes | Code redemptions, creator-code D1 |

## The signals and the levers

| Signal (Roblox's list [1]) | What it means for design | Levers (owner in brackets) | Hurts it |
|---|---|---|---|
| qPTR: engaging plays ÷ RFY impressions | Tile wins the click; first minute makes it an engaging play | Honest thumbnails (Splash), first reward < 30 s (Architect, Builder), clear pointer (Frame) | Clickbait, slow loading, confusing start |
| 7-day playtime (per user) | Enough to do in a session and across a week | Core loop depth, session goals, long-tail collection | AFK farms that inflate but bore, early content walls |
| Play days | Reasons to come back on different days | Daily rewards, crops or timers that finish tomorrow, weekly quests | All content on day 1, punishing missed days |
| Spend days | Small honest purchases on different days | A low-price everyday item, a starter pack after the first session | One expensive bundle only, pressure tactics |
| Robux spent | Value-for-money items for those who want them | Passes, cosmetics, convenience ([[09 Shops and Monetization]]) | Pay-to-win walls that cause churn |
| Intentional co-play days | Friends choosing to play together | Party bonus, co-op goals, trading, invites | Solo-only design, full servers |
| Long-term retention (28-day view) [2][3] | Reasons to be here in week 4 | Updates on a rhythm, seasons, collections, social status | Finite content, no updates |

## Charts: what to know

- Charts on Roblox include trending lists, **Top Playing Now** [8] and **genre trending charts** such as Trending in Party and Casual [9]. Roblox doesn't publish chart formulas in our sources. Third-party guides describe "Top Earning" and "Up-and-Coming" style charts but their factor lists are their own claims [10].
- A DevForum critique says Up-and-Coming has included games from 10K to over 200K CCU [8]. For a brand-new game, the realistic target is a **genre trending chart**, and only after RFY is already growing.
- Monthly fan roundups list which games are trending (for example, an October 2025 roundup listed Plants Vs Brainrots and Grow a Garden among trending games) [11]. Pulse uses `cli.mjs market --refresh` for our own dated snapshots instead of quoting fan numbers.
- The genre you set decides which genre chart you can appear in. Choose the one that matches what players do in the first 10 minutes.
- Charts move fastest on update days, because many players arrive within the same hours (Rule 37).

### Chart-entry recipe (targets, not promises)
1. Two weeks of stable RFY-cohort retention after soft launch.
2. A content update at a fixed time with a 3-7 day countdown.
3. Creator videos and Discord announcements in the first hours.
4. A small ad campaign in the same 7-day window.
5. Servers sized so friends can join, so co-play stays high during the spike.
6. A hotfix plan ready for the first 6 hours (see [[12 Live Ops and Launch]]).

## Search: naming and keyword recipe

- **Title:** 2-4 real words. No special Unicode letters. At most one bracketed tag, only while true (Rule 24).
- **First line of the description:** the promise plus the main keyword. "Grow glowing plants, sell them and trade with friends."
- **Second line:** 3-5 more keywords in a sentence. "A cozy farming game with pets, mutations and weekly updates."
- **Then:** controls for phone and PC, the update line ("v1.4 Volcano: new lava seeds"), codes location ("Codes are in the Menu"), and the social links.
- **Never:** keyword stuffing, other games' names, "free Robux", or claims of being official.
- **Launch check:** search the exact title from a non-owner account on a phone, and again 24 hours later. If it's missing, report it on the DevForum with the place ID; others report similar issues [35][36].
- **Natural-language line:** one sentence a person might type into an AI-assisted search ("a game where you grow a garden and sell plants") [34].

## Thumbnail testing recipes

| Test | Variant A (control) | Variant B (one change) | Read after |
|---|---|---|---|
| Hero object | Common pet in the center | The first rare pet in the center | 7 days |
| Emotion | Character smiling | Character shocked at a reward | 7 days |
| Background | Blue sky | Sunset orange | 7 days |
| Text | No text | 2-3 word text ("LAVA PETS") | 7 days |
| Social | One character | Three characters playing together | 7 days |
| Update | Current winner | The new update scene | the update week |

- Keep **2 or more** thumbnails active at all times, so personalization runs [16].
- The current winner keeps most traffic while a new one is measured [17], so a test costs little. Still change only one thing at a time.
- Every thumbnail passes the 1-second test at 150 px on a phone (Kid Tester).
- Use real gameplay rendered well: the game's actual world and items, posed and lit by Scenic ([[11 Thumbnails, Icons and the Store Page]]).
- Store each thumbnail's source file and the result in `games/<slug>/art/` with the test date in the filename.

## Ads Manager recipes

### Campaign types (from the docs)
| Objective | Audience | Cost | Use it for |
|---|---|---|---|
| Plays | Broad | Lower CPP | Funnel tests, seeding servers, update launches [12] |
| Engagement | Smaller, highly engaged | Higher CPP [12] | Higher-intent players; a separate budget if working toward the Kids and Select threshold [12] |
| Search ads | Keyword targeting in search results [14] | Bid-based | Owning the game's own name and the genre's words |
| Rewarded video (earning, not buying) | 13+ players, opt-in [32] | Creators earn per impression [32] | A fair optional bonus inside the game |

### Campaign log row (`growth.md`)
```
2026-11-06 · Plays · auto-bid · lifetime budget (owner set) · 7 d · thumb v1 (winner)
Question: do strangers finish the first 5 minutes after the onboarding fix?
Result (day 8): plays __, CPP __, ad D1 __ vs organic D1 __, ad payer % __ vs organic __
Decision: repeat / change one thing (what) / stop
```

### Reading a campaign
- **Ad-cohort D1 ÷ organic D1** ≥ 0.7 (studio target) means the creative and audience are fine. Below 0.5, fix the creative or the audience before spending more.
- **Funnel step 3 rate for the ad cohort** should be close to organic. If it isn't, the ad promises something the first minute doesn't show.
- **Server health:** watch the Performance dashboard while the campaign runs. More players means more load ([[13 Building It Right]]).
- **Never** count ad plays toward RFY expectations [1].

## Notifications and invites recipes

- **Opt-in moment:** after the first rare reward or first world unlock, never in the first 2 minutes. Show a small in-game card first ("Want to know when your plants are ready?") and only call `PromptOptIn` if the player taps Yes [21].
- **Message types (max 1 per real event per player):** your timer is ready, an event starts, an update is live, a friend beat your record (only if both opted in).
- **Copy:** 6-12 words, concrete, no ALL CAPS, no fake urgency. "Your Golden Sunflower is ready to harvest!" not "COME BACK NOW!!!"
- **Launch data:** a short key such as `plot`, `event` or `shop:egg_lava`. The server checks it against an allowlist before acting [19].
- **Invites:** an Invite button in the menu and on the party bonus chip, a reward for both players paid on arrival via `ReferredByPlayerId` [22], with a daily cap per inviter.
- **Under-13 players** don't get notifications [19] or rewarded video [32], so every reward reachable that way also has a normal in-game path.

## Influencer and short-video playbook

### Clip moments (design 3 per update)
- **The reveal:** a rare item reveal with a 1-2 second build-up, a flash, a sound sting and a big name card. Readable at 9:16 without sound.
- **The giant number:** a sell or damage number that fills a quarter of the screen.
- **The transformation:** a plant, pet or base that visibly grows or mutates in under 5 seconds.
- **The social chaos:** a steal, a trade gone right, a group boss win.
- **The fail:** a funny, harmless loss (a slip, a pet that runs away briefly).

### The creator kit
- 30-60 s of b-roll in 16:9 and 9:16, captured by Scenic with the HUD hidden.
- 3 key art images (the same art style as the thumbnails).
- A 1-paragraph pitch with the promise, the update content and the date and time in UTC.
- A creator code that gives viewers a small cosmetic, and credits the creator in analytics.
- Optional private-server access 24-72 hours before the update (server-side flag).
- A contact line for the owner.

### Outreach message (the owner sends it; agents draft it)
```
Hi <name>, I make <game>, a <genre> game where you <promise>.
Our <update name> goes live <date, time UTC>. You can play it early in a private server.
Here's a 45-second preview: <link>. Your viewers can use code <CODE> for a free <cosmetic>.
No pressure, and thanks for reading. <owner name>
```

## Discord blueprint

| Channel | Purpose | Who posts |
|---|---|---|
| #rules | Short rules plus the age note (Discord is 13+) | Owner |
| #announcements | Updates, events, codes | Owner, Mods |
| #update-log | Patch notes in plain words ([[12 Live Ops and Launch]]) | Owner, Mods |
| #codes | Active codes and expiry dates | Mods |
| #sneak-peeks | 1 image or clip per day for 3-5 days before an update | Mods |
| #general | Chat | Everyone |
| #trading | Only if the game trades. No off-platform trades | Everyone, moderated |
| #bug-reports | Template-based reports | Everyone |
| #suggestions | Ideas, with reactions for voting | Everyone |
| #clips | Player clips; best ones get credit in update notes | Everyone |

- Never offer Robux giveaways, account trades, or anything that needs personal info.
- Every reward announced in Discord is also reachable in-game for players who can't use Discord (Rule 34).
- Liveops summarizes the top 3 bugs and top 3 suggestions weekly in `liveops.md`.

## Update-driven spikes

- **Cadence:** weekly is possible early when the team can deliver real content [28]; move to every two weeks with deeper systems when weekly gets thin [29]. Never skip without saying so in-game.
- **Fixed slot:** one weekday and hour, in UTC, weekend-aligned (Rule 37).
- **The update day, hour by hour (UTC, assuming a 15:00 release):**
  - 12:00: Playtest and Reviewer run the release check on the final build in Studio, in a 2-player local server, and the owner keeps the live place unchanged until it passes ([[12 Live Ops and Launch]]).
  - 14:30: the owner publishes the update. Old servers keep running old code.
  - 14:45: Liveops checks a fresh server: no red errors, purchases work, saves load.
  - 15:00: the countdown hits zero. The owner restarts servers for the update so everyone gets it at once. Codes go live. Discord announcement.
  - 15:30: the ad campaign (if any) is running. Creators' embargo lifts.
  - 15:00-21:00: Liveops checks errors, funnels, server memory and purchases every hour.
  - Next day: the first hotfix, if needed.
- **What spikes:** concurrent players, chart position and returning DAU. What decides if the spike becomes growth: the new players' D1 and the returning players' D7 after the update.

## Launch-week growth plan

| Day | Goal | Actions | Owner of the action |
|---|---|---|---|
| −14 to −8 | Soft launch | Public but unpromoted, or with play access for a test group. Fix the funnel's biggest leak each day | Lead, Liveops, Builder |
| −7 | Gate | Producer runs the pre-launch gate ([[12 Live Ops and Launch]]) | Producer |
| −7 to −1 | Prepare | 4 thumbnails, title, description, codes, Discord, creator kit, update #1 built behind a flag | Splash, Liveops, Builder |
| −3 | Announce | Discord sneak peeks, a creator-kit send-out by the owner | Owner, Liveops |
| 0 (Thu) | Launch | Promote the soft-launch build: seed with friends, group and Discord (wave 1), search check, error watch every hour | Owner, Liveops |
| 1 (Fri) | Fix | Hotfix the top issue. Start a small Plays campaign (wave 2) if the gate passes | Builder, Owner |
| 2-3 (weekend) | Watch | Hourly checks at peak; collect bugs; don't change the tile | Liveops |
| 4 | Read | First 3-day read: funnel, D1 by source, qPTR trend | Liveops |
| 5-6 | Tune | One change only: the weakest step of the funnel | Builder, Frame |
| 7 | Report | 7-day report; decide whether to extend ads | Liveops, Lead, Owner |
| 8-10 (Sat) | Spike | Update #1 at the fixed slot with countdown, codes, creator videos, an update thumbnail (wave 3) | Everyone |
| 11-14 | Learn | Read the update cohort's D1 and returning players' D7; plan update #2 | Liveops, Architect |

## Examples from top games

### Short video can carry a simple game a long way
**Game:** Grow a Garden ([25][27])
**Shows:** Players posted their sessions online and shared videos on TikTok; AP described millions playing daily and sharing clips [27]. Wikipedia credits viral traction on TikTok and low entry barriers [25].
**Why it works:** A plant growing, mutating and selling is easy to understand in a 10-second clip, even without sound.
**Steal:** Design clip moments into every system (Rule 32) and make them visible across the map.
**Avoid:** Assuming virality. Plan for organic RFY growth and treat a viral wave as a bonus.

### Ship small, then iterate in public
**Game:** Grow a Garden ([25][26])
**Shows:** The original creator built it in about three days, according to Wikipedia and the GamesBeat interview with Janzen Madsen, whose studio Splitting Point manages it [25][26].
**Why it works:** A tiny, clear loop reached players fast, and updates added depth once players proved they liked it.
**Steal:** Launch the smallest version whose first session is complete, with update #1 ready.
**Avoid:** Treating a 3-day build as permission to skip data safety. The faster a game grows, the more a save bug costs ([[13 Building It Right]]).

### A fixed weekly slot trains players to show up together
**Game:** Grow a Garden ([28])
**Shows:** PCGamesN describes a strict weekly update schedule on Saturdays [28].
**Why it works:** Players know when to come back, servers fill at the same time, and co-play and chart momentum spike together.
**Steal:** One fixed weekday and UTC hour, shown on an in-game countdown (Rules 37, 38).
**Avoid:** A cadence the team can't keep. Missed updates teach players to stop checking.

### Update days produce the peak
**Game:** Grow a Garden ([30])
**Shows:** RoMonitor data reported by WN Hub put concurrent players at a record 11.7 million on Saturday, May 31, 2025, against 8.9 million the week before [30].
**Why it works:** New content plus a known time concentrates demand.
**Steal:** Line up the update, codes, creator videos and ads in the same 48 hours (Rule 40).
**Avoid:** Releasing without the team watching. A spike multiplies every bug.

### When weekly gets stale, add depth
**Game:** Grow a Garden ([29])
**Shows:** In August 2025 the developer said weekly events were too hard to keep fresh and new, and planned to add more depth to farms with events in between [29].
**Why it works:** Thin, repeated updates stop moving retention. Depth gives long-term goals.
**Steal:** Check each update's D7 lift and slow the cadence for a deeper system when two updates in a row do nothing (Rule 39).
**Avoid:** Quietly skipping updates. Announce the new rhythm and the reason.

### Real growth survives scrutiny
**Game:** Grow a Garden ([25][31])
**Shows:** After it passed 5 million concurrent players, investors alleged bot inflation, then retracted the claim. Roblox said its preliminary analysis confirmed genuine popularity [25]. Kotaku covered the 5 million milestone [31].
**Why it works:** Genuine engagement holds up when anyone checks.
**Steal:** Grow only through honest channels (Rule 36).
**Avoid:** Any paid "visits", bots or fake engagement.

### Genre charts are the realistic first target
**Game:** Plants Vs Brainrots ([11])
**Shows:** A fan roundup of October 2025 trending games listed Plants Vs Brainrots alongside Grow a Garden [11].
**Why it works:** A format riding a trend can climb a genre chart quickly when the first session is clear.
**Steal:** Pulse checks genre trending charts for a format that's rising but not yet crowded, and pitches a fresh twist.
**Avoid:** Copying the trend's names, characters or art. Clones are deprioritized [14].

### Signals lead impressions by days
**Game:** The example game in Roblox's Discovery docs ([1])
**Shows:** A qPTR dip on February 28 came before an impression drop on March 3 [1].
**Why it works:** The algorithm reacts to behavior after a short delay.
**Steal:** Watch qPTR and playtime daily after every change, and roll back within 48 hours if they dip (Rule 6).
**Avoid:** Waiting for impressions to fall before investigating.

### Personalized thumbnails beat a single best guess
**Game:** Experiences in Roblox's thumbnail personalization tests ([16][17])
**Shows:** Experiences using personalization saw an average +8.5% qPTR in testing [16]. A later change keeps the current winner live during new tests, and Roblox reported +0.19% qPTR and 21% fewer impressions going to non-winning thumbnails [17].
**Why it works:** Different audiences click on different promises, and the system routes each group to its best thumbnail.
**Steal:** Always keep 2+ thumbnails active, each a different honest promise (Rule 20).
**Avoid:** Uploading a single thumbnail or swapping all of them at once.

### The algorithm moved to long-term retention
**Game:** Games in Roblox's 28-day RFY test ([2][3])
**Shows:** Roblox moved RFY from a 7-day to a 28-day view and said that in testing the new version surfaced games that retain players over time better, with increases in DAU and engagement [3]. The DevForum post warned of distribution fluctuations [2].
**Why it works:** Games with week-4 reasons to play get more distribution.
**Steal:** Day-2, day-7 and day-28 hooks in `plan.md` (Rule 5).
**Avoid:** Designing for a weekend spike with nothing after.

### Opt-in video rewards can be fair and popular
**Game:** Experiences in Roblox's rewarded video program ([32][44])
**Shows:** Roblox's rewarded video lets players choose to watch up to 30 seconds of video for an in-game reward, only for users 13+, with creators paid per impression [32][44]. Higher completion (90%+) or a Minimal maturity rating may earn more [32].
**Why it works:** The player chooses, and the reward is meaningful.
**Steal:** One offer at a natural boost moment, capped per day (Rule 31).
**Avoid:** Prompting in menus or gating progress behind ads.

### Search visibility can fail, so check it
**Game:** Public games in DevForum reports ([35][36])
**Shows:** Developers report public experiences missing from search, even for exact titles. One says ranking started after the game was sponsored and got about 5k visits [35][36].
**Why it works:** Search depends on signals and systems you don't control.
**Steal:** A launch-day and next-day search check from a non-owner account, and a DevForum report with the place ID if it fails.
**Avoid:** Telling creators "just search the name" without checking first.

### Ads seed players but don't rescue a falling game
**Game:** Experiences in Roblox's analytics guidance ([5])
**Shows:** Roblox's analytics post on retention by acquisition source says ads aren't meant to fix a declining organic trend, though they can bring new, relevant users [5].
**Why it works:** RFY ranking only counts RFY-acquired players [1], so the core must hold them.
**Steal:** Gate ad spend on RFY-cohort retention (Rule 12).
**Avoid:** Buying traffic when D1 is falling.

### Friend referrals reward both sides
**Game:** Experiences using Roblox's referral system ([22])
**Shows:** `ReferredByPlayerId` is filled for all invitation types, so a game can reward the inviter and the invitee [22].
**Why it works:** Both players benefit, and it feeds the co-play signal [1].
**Steal:** A paid-on-arrival reward for both, with a daily cap (Rule 18).
**Avoid:** Rewarding invites sent, which can't be tracked [23] and only rewards spam.

## By genre

- **Simulator:** qPTR lives on a big, honest number and a shiny pet in the thumbnail. Clip moments: rare hatches and huge sells. Co-play: trading and a friend luck bonus. Play days: daily eggs and timed boosts. Cadence: weekly or biweekly worlds. Genre chart: Simulator. Thumbnail tests: pet rarity, egg glow, number size.
- **Tycoon:** the tile shows a finished, impressive base, which a new player must see a path to in the first 10 minutes (a "preview" of the next floor). Clip moments: the moment a big upgrade builds itself. Co-play: neighbor plots, visit-a-friend's-tycoon. Play days: offline earnings capped at a few hours (studio target) so returning is rewarded. Search keywords: "tycoon" plus the theme.
- **Idle and incremental:** play days are the core signal, so design returns (collect offline gains, daily multipliers). qPTR risk: idle games look static in a thumbnail, so show the number exploding. Notifications ("Your factory is full!") fit well for 13+ players who opt in [19].
- **Obby:** short sessions and high bounce risk. qPTR depends on the first 3 stages being easy and fun. Clip moments: near-miss jumps and funny falls, which suit TikTok. Co-play: race a friend, team checkpoints. Cadence: new stage packs on a fixed day. Thumbnails: a clear, colorful course with a character mid-jump.
- **Roleplay and life sim:** co-play days are everything, since players come for friends. Invites with a reward for both sides [22], large servers with headroom, and a "join friend" path matter more than ads. Clip moments: funny roleplay situations, house reveals. Updates: new houses, vehicles and jobs, at a fixed time.
- **Party and social hangout:** the server must be full to be fun, so seed waves and update-time spikes matter most. Ads can fill the first servers (Rule 25). Clip moments: the round's funniest outcome. Thumbnails: groups of characters reacting.
- **Story and puzzle:** a finite story limits play days, so plan chapters as updates with a countdown. Short-video creators love first reactions, so creator early access (Rule 33) is the strongest channel. Keep spoilers out of thumbnails, but show the setting clearly.
- **Action and combat:** clip moments are big hits, combos and boss kills. qPTR needs combat within 30 seconds (studio target). Co-play: parties against bosses. Watch server performance during spikes, since combat load scales with players ([[13 Building It Right]]).
- **Battlegrounds:** creators drive discovery with character showcases, so each update ships one new character with a reveal trailer clip. Ranked or stats boards give week-4 reasons. Thumbnail tests: the character pose and the move effect.
- **Shooter:** clip moments are multi-kills and clutch rounds. Matchmaking needs full servers, so concentrate players with fixed update times and seeded ads. Keep the tile clear at phone size, with one weapon and one character.
- **Horror:** reaction videos are the channel. Make scares clip-able (a clear build-up, a big reveal) and give creators a co-op mode to record with friends. Thumbnails: the monster partly hidden, honest about the game's tone. Respect maturity settings in the questionnaire.
- **Survival:** co-play nights and long-term bases drive 28-day retention [3]. Clip moments: the first night and big raids. Updates: new biomes and threats on a fixed cadence, with seasons.
- **Tower defense:** the new tower or unit is the update headline, and creators showcase it. Co-op modes feed co-play. Spend days fit small unit or cosmetic offers ([[09 Shops and Monetization]]). Thumbnails: the biggest tower firing at a wave.
- **RNG and collection:** the rare roll is the clip moment. Make rare reveals huge, readable and shareable, and show the odds honestly ([[03 Rarity and RNG]]). Play days: daily luck and limited-time pools. Never use fake rarity in thumbnails.
- **Racing and vehicles:** clip moments are drifts, jumps and photo finishes. Co-play: races with friends and crews. Thumbnails: a car mid-air with clear speed lines. Updates: a new car or track at a fixed time.
- **Sports:** matches need full servers. Seed with ads during update windows and invite rewards. Clip moments: goals and trick shots. Seasonal events tied to real sports seasons are natural updates (keep them unbranded).
- **Farming and fishing:** a calm loop with strong play days (crops that finish later, daily catches). Grow a Garden's TikTok spread and Saturday cadence are the reference pattern [25][27][28]. Clip moments: mutation reveals and giant catches. Watch for update fatigue and move to depth when weekly content thins [29].

## Luau

### Ask for notification opt-in after a win (client)
```lua
--!strict
-- StarterPlayerScripts/Controllers/NotifyOptInController
-- Frame's card calls NotifyOptIn.tryPrompt() only after the player taps "Yes" on our own soft-ask card.
local ExperienceNotificationService = game:GetService("ExperienceNotificationService")

local NotifyOptIn = {}
local askedThisSession = false

function NotifyOptIn.tryPrompt()
	if askedThisSession then return end
	askedThisSession = true
	local ok, canPrompt = pcall(function()
		return ExperienceNotificationService:CanPromptOptInAsync()
	end)
	if ok and canPrompt then
		ExperienceNotificationService:PromptOptIn()
	end
end

function NotifyOptIn.Start()
	ExperienceNotificationService.OptInPromptClosed:Connect(function()
		-- Only for analytics through a server remote. Never reward opting in.
	end)
end

return NotifyOptIn
```
Store "already asked" in the player's save (server) so the soft-ask card appears at most once every 7 days (studio target).

### Read join data: launch data, referrals, notification joins (server)
```lua
--!strict
-- ServerScriptService/Services/JoinService
local Players = game:GetService("Players")
local AnalyticsService = game:GetService("AnalyticsService")

local PlayerData = require(script.Parent.PlayerData)
local Referrals = require(script.Parent.Referrals)
local Spawns = require(script.Parent.Spawns)

local ALLOWED_GO: {[string]: boolean} = { plot = true, event = true, shop = true, party = true }

local JoinService = {}

local function onPlayerReady(player: Player)
	local joinData = player:GetJoinData()

	-- Launch data from notifications, deep links and invites: an untrusted short string.
	local launch = joinData.LaunchData
	if typeof(launch) == "string" and #launch <= 40 then
		local go = string.match(launch, "^(%a+)")
		if go and ALLOWED_GO[go] then
			AnalyticsService:LogCustomEvent(player, "JoinedWithLaunchData")
			Spawns.sendTo(player, go) -- the server decides where "plot" or "event" is
		end
	end

	-- Friend referral: filled for all invite types (see the referral docs).
	local referrer = joinData.ReferredByPlayerId
	if typeof(referrer) == "number" and referrer > 0 and referrer ~= player.UserId then
		Referrals.onReferredJoin(player, referrer)
	end
end

function JoinService.Start()
	PlayerData.Loaded:Connect(onPlayerReady) -- fires after the save is loaded (see 13 Building It Right)
end

return JoinService
```

### Referral reward with a daily cap (server)
```lua
--!strict
-- ServerScriptService/Services/Referrals
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local AnalyticsService = game:GetService("AnalyticsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData)
local Economy = require(script.Parent.Economy)

local pending = DataStoreService:GetDataStore("ReferralPending_v1")
local Referrals = {}

local function today(): number
	return os.time() // 86400 -- UTC day index
end

function Referrals.onReferredJoin(newPlayer: Player, referrerId: number)
	local data = PlayerData.Get(newPlayer)
	if not data or data.ReferredBy ~= nil or data.Stats.Sessions > 1 then
		return -- only a brand-new player's first session counts, and only once
	end
	data.ReferredBy = referrerId
	Economy.grant(newPlayer, Config.Referral.InviteeReward, "Referral_Invitee")
	AnalyticsService:LogCustomEvent(newPlayer, "JoinedFromReferral")

	local inviter = Players:GetPlayerByUserId(referrerId)
	if inviter and PlayerData.Get(inviter) then
		Referrals.payInviter(inviter)
		return
	end
	-- The inviter is in another server or offline: queue it, and they claim it on next load.
	pcall(function()
		pending:UpdateAsync(`Inviter_{referrerId}`, function(old: any)
			local count = if typeof(old) == "number" then old else 0
			return math.min(count + 1, Config.Referral.MaxQueued) -- for example 20
		end)
	end)
end

function Referrals.payInviter(inviter: Player)
	local data = PlayerData.Get(inviter)
	if not data then return end
	if data.Referral.Day ~= today() then
		data.Referral.Day = today()
		data.Referral.Count = 0
	end
	if data.Referral.Count >= Config.Referral.DailyCap then return end -- for example 5
	data.Referral.Count += 1
	Economy.grant(inviter, Config.Referral.InviterReward, "Referral_Inviter")
end

function Referrals.claimQueued(inviter: Player)
	local claimed = 0
	local ok = pcall(function()
		pending:UpdateAsync(`Inviter_{inviter.UserId}`, function(old: any)
			claimed = if typeof(old) == "number" then old else 0
			return if claimed > 0 then 0 else nil -- nil cancels the write when nothing is queued
		end)
	end)
	if ok then
		for _ = 1, claimed do Referrals.payInviter(inviter) end
	end
end

return Referrals
```
Call `Referrals.claimQueued(player)` once after each player's save loads. The daily cap still applies, so queued rewards above the cap are dropped, which is intended.

### Codes (server)
```lua
--!strict
-- Config.Codes = { UPDATE14 = { StartsUtc = 1793469600, EndsUtc = 1794679200, Reward = { Coins = 500 } } }
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes
local RateLimit = require(script.Parent.RateLimit)
local PlayerData = require(script.Parent.PlayerData)
local Economy = require(script.Parent.Economy)

Remotes.RedeemCode.OnServerEvent:Connect(function(player: Player, raw: unknown)
	if not RateLimit.allow(player, "RedeemCode", 3, 0.2) then return end
	if typeof(raw) ~= "string" or #raw == 0 or #raw > 24 then return end
	local code = string.upper((string.gsub(raw, "%s", "")))
	local def = Config.Codes[code]
	local data = PlayerData.Get(player)
	if not data then return end
	if not def then
		Remotes.CodeResult:FireClient(player, "invalid")
		return
	end
	local now = os.time()
	if now < def.StartsUtc or now > def.EndsUtc then
		Remotes.CodeResult:FireClient(player, "expired")
		return
	end
	if data.RedeemedCodes[code] then
		Remotes.CodeResult:FireClient(player, "used")
		return
	end
	data.RedeemedCodes[code] = now
	Economy.grant(player, def.Reward, `Code_{code}`)
	Remotes.CodeResult:FireClient(player, "ok")
end)
```

### Invite button (client)
```lua
--!strict
local Players = game:GetService("Players")
local SocialService = game:GetService("SocialService")
local player = Players.LocalPlayer

local function onInvitePressed()
	local ok, canInvite = pcall(function()
		return SocialService:CanSendGameInviteAsync(player)
	end)
	if ok and canInvite then
		SocialService:PromptGameInvite(player)
	end
end
```
Hide the button when `CanSendGameInviteAsync` returns false. Check the API reference for invite options (custom prompt text, launch data) before using them.

### Update countdown in the player's local time (client)
```lua
--!strict
local function formatRemaining(seconds: number): string
	local s = math.max(0, math.floor(seconds))
	local d, h, m = s // 86400, (s % 86400) // 3600, (s % 3600) // 60
	if d > 0 then return `{d}d {h}h` end
	if h > 0 then return `{h}h {m}m` end
	return `{m}m {s % 60}s`
end

local function updateLabel(label: TextLabel, releaseUtc: number)
	local remaining = releaseUtc - workspace:GetServerTimeNow()
	local localTime = DateTime.fromUnixTimestamp(releaseUtc):FormatLocalTime("LLL", "en-us")
	label.Text = if remaining > 0 then `UPDATE IN {formatRemaining(remaining)} ({localTime})` else "UPDATE IS LIVE!"
end
```
Refresh the label once per second with a single loop, and take `releaseUtc` from `Config.Updates.Next` so Liveops can change it without touching UI code.

### Creator codes credited in analytics (server)
```lua
AnalyticsService:LogCustomEvent(player, "CreatorCode", 1, {
	[Enum.AnalyticsCustomFieldKeys.CustomField01.Name] = creatorId, -- a short, stable id like "cr_014"
})
```
Keep creator IDs short and stable so the breakdown stays readable. Never put a player's name in a custom field.

### Party bonus for friends in the same server (server)
```lua
--!strict
local Players = game:GetService("Players")
local friendPairs: {[Player]: {[Player]: boolean}} = {}

local function checkPair(a: Player, b: Player)
	local ok, isFriend = pcall(function() return a:IsFriendsWith(b.UserId) end)
	if ok and isFriend then
		friendPairs[a] = friendPairs[a] or {}
		friendPairs[b] = friendPairs[b] or {}
		friendPairs[a][b] = true
		friendPairs[b][a] = true
	end
end

Players.PlayerAdded:Connect(function(newPlayer)
	for _, other in Players:GetPlayers() do
		if other ~= newPlayer then task.spawn(checkPair, newPlayer, other) end
	end
end)

Players.PlayerRemoving:Connect(function(leaving)
	local friends = friendPairs[leaving]
	if friends then
		for other in friends do
			if friendPairs[other] then friendPairs[other][leaving] = nil end
		end
	end
	friendPairs[leaving] = nil
end)

local function partyMultiplier(player: Player): number
	local count = 0
	for _ in friendPairs[player] or {} do count += 1 end
	return 1 + math.min(count, 3) * 0.10 -- +10% per friend, capped at +30% (studio target)
end
```

## Checklist
- [ ] `growth.md` exists with the Surfaces table, action log, campaign log and launch-week calendar.
- [ ] Title is 2-4 spellable words; Kid Tester typed it from memory.
- [ ] The first two description lines state the promise and 3-5 keywords; one plain natural-language sentence is included.
- [ ] Genre setting matches what players do in the first 10 minutes.
- [ ] 3-5 thumbnails are active, each a different honest promise visible in the first minute or first upgrade.
- [ ] Every thumbnail passes the 1-second test at 150 px on a phone.
- [ ] No uncopylocked kit, template map or copied title or description is used.
- [ ] Day-2, day-7 and day-28 hooks are listed in `plan.md` and built.
- [ ] A co-play bonus exists and is visible when a friend joins.
- [ ] One low-price, honest offer is visible after the first session (none in the first 5 minutes).
- [ ] The notification soft-ask appears only after a win and at most once per 7 days.
- [ ] Launch data is validated against an allowlist on the server.
- [ ] Referral rewards pay on arrival, for both players, with a daily cap and first-session-only rule.
- [ ] Codes are server-validated, single use per player, with UTC start and end dates.
- [ ] Every reward offered through Discord, notifications or rewarded video also has an in-game path for under-13 players.
- [ ] The exact-title search check passed on launch day and the day after, from a non-owner account on a phone.
- [ ] Every ad campaign has a written question, success numbers and a 7-day read logged.
- [ ] Ad cohorts are judged by D1/D7 and payer rate against organic, using retention by acquisition source.
- [ ] Every growth action in the log has a date and a 7-day result.
- [ ] Update time is fixed (weekday and UTC hour) and shown on an in-game countdown 3-7 days ahead.
- [ ] Each update has 3 clip moments listed in `plan.md` and at least one new thumbnail.
- [ ] The creator kit (b-roll in 16:9 and 9:16, key art, pitch, code) exists before the first update.
- [ ] Discord channels, roles and safety settings are set before launch; the bug template is pinned.
- [ ] The Home Recommendations dashboard is read every Monday and summarized in `growth.md`.

## Common mistakes
- Believing ad plays or YouTuber traffic will raise RFY ranking. RFY only counts players who came through RFY [1].
- Judging an update or thumbnail after one day, when impressions lag signals by days [1].
- Swapping all thumbnails at once, so personalization keeps restarting [17].
- A single thumbnail, so personalization never turns on [16].
- Clickbait art that wins clicks and loses stays, which lowers qPTR and per-user averages [1].
- Publishing a reskinned kit or template, which Roblox deprioritizes [14].
- Planning to be "featured" through Today's Picks, which is for avatar items [37].
- Asking for notification opt-in on the loading screen, then spamming every day.
- Paying for invites sent instead of friends who arrived, which can't be tracked and rewards spam [23].
- Rewards that require Discord, notifications or rewarded video, which shuts out under-13 players [19][32].
- Running ads before the first session is fixed, then blaming the ads [5].
- Comparing Plays and Engagement campaigns on cost per play [12].
- Launching on Sunday night with nobody watching.
- An update cadence the team can't keep, so players stop checking.
- Thin weekly updates long after they stop moving retention [29].
- Creator outreach as mass spam, or giving creators items real players can't get.
- Codes that never expire or give huge rewards, which break the economy ([[04 Progression and Economy]]).
- Buying bots, visits or fake engagement [25].
- Changing title, icon and thumbnails in the same week, so nothing is learned.
- Ignoring seasonality and the benchmark set, then "fixing" a game that was fine [1][5].

## References
[1] Discovery (Roblox Creator Docs) — https://create.roblox.com/docs/discovery — RFY retrieval and ranking stages; the per-user signals (qPTR, 7-day playtime, play days, spend days, Robux spent, intentional co-play days); per-user averages; non-RFY users excluded from ranking; Home Recommendations dashboard; impressions lag; seasonality and competition.
[2] Recommended For You Algorithm Improvements That Better Value Long-Term Retention (DevForum) — https://devforum.roblox.com/t/recommended-for-you-algorithm-improvements-that-better-value-long-term-retention/4684575 — the 2026 RFY change; expected distribution fluctuations.
[3] Optimizing discovery so great games reach millions of players (Roblox Newsroom, June 2026) — https://about.roblox.com/newsroom/2026/06/optimizing-discovery-great-games-reach-millions-players-roblox — RFY moved from a 7-day to a 28-day view measuring long-term retention; signal list to be published.
[4] Boost Your Discovery by Building Games People Want to Play (DevForum) — https://devforum.roblox.com/t/boost-your-discovery-by-building-games-people-want-to-play/4779042 — fix core gameplay first when retention is low.
[5] Analytics: View retention by acquisition source and select your benchmark set (DevForum) — https://devforum.roblox.com/t/analytics-view-retention-by-acquisition-source-and-select-your-benchmark-set/4010157 — retention split by source; selectable benchmarks; ads don't fix a declining organic trend.
[6] Roblox wants to improve discovery for its game creators (VentureBeat) — https://venturebeat.com/business/roblox-wants-to-improve-discovery-for-its-game-creators — 2025 discovery roadmap focused on organic, long-term retention and analytics transparency.
[7] Roblox cozies up to creators with promises that it'll recommend their games (Tubefilter) — https://www.tubefilter.com/?p=185348 — press coverage of Roblox's discovery commitments to creators.
[8] Introducing "Top Playing Now" on Charts (DevForum) — https://devforum.roblox.com/t/introducing-top-playing-now-on-charts/3529809 — the Top Playing Now chart; community critique that Up-and-Coming includes 10K-200K+ CCU games.
[9] Trending in Party and Casual (Roblox Charts) — https://www.roblox.com/fr/charts/trending-in-party-and-casual — genre trending charts exist on Roblox.
[10] Roblox Charts: A Complete Guide (Pink Crow) — https://pinkcrow.net/roblox-charts-a-complete-guide/ — third-party description of chart categories (not confirmed by Roblox).
[11] Roblox top charts for October 2025 (games.gg) — https://games.gg/news/roblox-top-charts-for-october-2025/ — fan roundup listing Plants Vs Brainrots and Grow a Garden among trending games.
[12] Ads Manager (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/ads-manager — Plays vs Engagement objectives, higher CPP for Engagement, Kids and Select threshold note, auto-bidding, daily vs lifetime budgets, Home and search placement.
[13] Sponsored experiences in Ads Manager (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/sponsoring-experiences — Sponsored category on Home and Discover, Sponsored tiles in search, bidding.
[14] Promotion (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion — search ads by keyword; immersive ads; games resembling existing games aren't prioritized and may rank lower in search.
[15] Ads tag (DevForum) — https://devforum.roblox.com/tag/ads — July 2026 threads on the Kids and Select global launch, Ads Manager updates and new advertising policies.
[16] Thumbnails (Roblox Creator Docs) — https://create.roblox.com/docs/production/publishing/thumbnails — thumbnail personalization mechanics; needs 2+ thumbnails; +8.5% average qPTR in testing.
[17] Thumbnail personalization now remembers your existing winning thumbnails (DevForum) — https://devforum.roblox.com/t/thumbnail-personalization-now-remembers-your-existing-winning-thumbnails/3793665 — winner keeps traffic during new tests; +0.19% qPTR; 21% fewer impressions to non-winners.
[18] The Roblox Thumbnail Is a Conversion Ad (RoWatcher) — https://rowatcher.com/news/the-roblox-thumbnail-is-a-conversion-ad-stop-designing-it-like-art — commentary on thumbnails as conversion ads.
[19] Experience notifications (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/experience-notifications — 13+ users; launch data via GetJoinData; 100-visit minimum; not under moderation.
[20] Experience notifications, cloud services (Roblox Creator Docs) — https://create.roblox.com/docs/cloud-services/experience-notifications — sending notifications from the server with a message asset ID.
[21] ExperienceNotificationService (API reference mirror) — https://robloxapi.github.io/ref-temp/class/ExperienceNotificationService.html — CanPromptOptInAsync, PromptOptIn, OptInPromptClosed (third-party mirror; verify in the official reference).
[22] Friend invite reward system (Roblox Creator Docs) — https://create.roblox.com/docs/production/promotion/referral-system — ReferredByPlayerId in join data for all invite types; rewarding inviter and invitee.
[23] Help with invite system (DevForum) — https://devforum.roblox.com/t/help-with-invite-system/1634210 — the invite-sent event is CoreScript-only.
[24] Building a Roblox community on Discord (RoLearn) — https://rolearn.dev/guidance/building-roblox-community-discord-guide — social links, codes in announcements, Bloxlink verification (vendor guide; its retention figure is unverified).
[25] Grow a Garden (Wikipedia) — https://en.wikipedia.org/wiki/Grow_a_Garden — built in about three days; TikTok traction; 5M+ concurrent on May 17, 2025; bot claims retracted.
[26] How Grow a Garden took off on Roblox: Janzen Madsen interview (GamesBeat) — https://gamesbeat.com/janzen-madsen-interview/ — Splitting Point manages the game; the original was made in about three days.
[27] Millions are flocking to grow virtual gardens in viral Roblox game created by teenager (AP via KSAT, 2025-07-30) — https://www.ksat.com/business/2025/07/30/millions-are-flocking-to-grow-virtual-gardens-in-viral-roblox-game-created-by-teenager/ — players sharing gameplay videos on TikTok.
[28] Grow a Garden update schedule (PCGamesN) — https://www.pcgamesn.com/grow-a-garden/update-schedule — weekly Saturday update schedule.
[29] Grow a Garden major changes coming (NME) — https://www.nme.com/news/gaming-news/roblox-grow-a-garden-major-changes-coming-update-cooking-3884432 — August 2025: weekly events too hard to keep fresh; focus on depth.
[30] Grow a Garden record (WN Hub) — https://wnhub.io/news/other/item-47931 — RoMonitor data: 11.7M concurrent on Saturday, May 31, 2025; 8.9M the week before.
[31] Grow a Garden hits 5 million active users (Kotaku) — https://kotaku.com/grow-a-garden-roblox-5-million-active-users-record-pc-1851781824 — coverage of the 5M milestone.
[32] More Creators Can Now Use Rewarded Video Ads (DevForum) — https://devforum.roblox.com/t/more-creators-can-now-use-rewarded-video-ads/3838678 — rewarded video for 13+ users; earnings by impressions; completion and maturity effects on EPM.
[33] Roblox eyes expanded placements for rewarded video ads (MediaPost) — https://www.mediapost.com/publications/article/417959/ — RDC 2026 announcement: more placements and a Studio plug-in planned for Q4 2026.
[34] Roblox reportedly adding AI game search (Dexerto) — https://www.dexerto.com/roblox/roblox-reportedly-adding-ai-game-search-but-concerns-raised-over-killing-small-games-3408132/ — reported test of AI-assisted search.
[35] My game is suddenly invisible (DevForum) — https://devforum.roblox.com/t/my-game-is-suddenly-invisible/4191323 — developer report of a game missing from search.
[36] Experience does not appear in Search or Recently Played despite being public (DevForum) — https://devforum.roblox.com/t/experience-does-not-appear-in-search-or-recently-played-despite-being-public/4769113 — another search visibility report.
[37] Today's Picks on Marketplace (Roblox Creator Docs) — https://create.roblox.com/docs/creator-programs/todays-picks-marketplace — a daily curated sort for avatar items; 17+ ID-verified nominations reviewed weekly.
[38] Evolving Today's Picks in Marketplace (DevForum) — https://devforum.roblox.com/t/evolving-today%E2%80%99s-picks-in-marketplace/4063692 — shown less often; space repurposed for personalized recommendations.
[39] Creator programs (Roblox Creator Docs) — https://create.roblox.com/docs/creator-programs — curated programs, including the Learn & Explore sort for educational experiences.
[40] RDC25: What we announced (DevForum) — https://devforum.roblox.com/t/rdc25-what-we-announced/3920245 — the yearly developer-conference recap where discovery and ads changes are announced.
[41] Viral hit Grow a Garden pushes Roblox past 100 million users (Reuters via AOL) — https://www.aol.com/news/roblox-raises-annual-bookings-forecast-120501339.html — the game's platform-level impact.
[42] Grow a Garden events schedule (AllThingsHow) — https://allthings.how/grow-a-garden-events-schedule/ — fan sites publish update and event times, showing players look them up.
[43] When is the next Grow a Garden update? (Sportskeeda) — https://www.sportskeeda.com/roblox-news/when-next-grow-garden-update — players search for the next update time.
[44] Roblox teams up with Google to pay players to watch ads (Kidscreen) — https://kidscreen.com/?p=221179 — rewarded video launch with Google: optional videos up to 30 seconds for in-game rewards.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[Genre - Farming and Fishing]] · [[Genre - Simulator]]
