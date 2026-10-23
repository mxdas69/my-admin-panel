---
tags: [vault, monetization, shop, game-passes, developer-products, pricing, offers, subscriptions, ads, odds]
for: [merchant, balance, frame, builder, reviewer]
also: [lead, architect, liveops, kid-tester, producer, pulse]
---

# 09 Shops and Monetization

This chapter is the studio's playbook for earning Robux without losing players. It covers which Roblox product type to use for each offer, how to price it, how to present it (worth anchors, struck-through prices, quantity ladders, bundles, gifting), where offers may appear and how often, time-boxed and server-wide boosts, starter packs, VIP, limited items, subscriptions, rewarded video ads and immersive ads, Creator Rewards (which replaced Premium Payouts in July 2025), private servers, avatar items, and the rules for paid random items and odds. It also holds the server code that takes real money: receipts, ownership checks, gifts and boosts.

Monetization decides whether a game can keep being updated, but it can also kill the game. A shop that sells convenience, speed, status and fun extras to players who already love the loop earns for years. A shop that sells power, pushes popups in the first minute or lies about prices drives players away, earns downvotes and invites moderation. Roblox's own monetization guidance warns that players may downvote an experience whose strategies they dislike [7], and a 2026 University of Sydney study found misleading or deceptive monetization in 14 of the 15 top-earning games it examined [37][38]. Our games compete on trust: the honest shop is the long-term winner, especially with a young audience.

The money code has zero tolerance for bugs. A developer product receipt that is granted twice, lost on a server crash, or granted from a client signal is a real-money defect. The `ProcessReceipt` and pass code in this chapter is the studio standard; don't rewrite it from memory.

Read this chapter when you plan a game's economy (Balance and Architect), before building any shop or purchase code (Merchant, Builder, Frame), before reviewing money paths (Reviewer), and before a sale or event (Liveops). Build the fun first ([[02 The Core Loop]]), balance around the offers ([[04 Progression and Economy]]), then build the shop UI ([[05 UI and HUD]]) and test it on a phone ([[08 Mobile]]).

## Rules

### A. Product types and the money code

1. **Use a game pass for anything permanent and a developer product for anything consumed or bought again.**
   Passes are a one-time Robux fee for a permanent privilege; developer products can be bought any number of times, which suits currency, potions, revives and boosts [5][7]. Mixing them up creates bugs (a "30-minute boost" pass that lasts forever) or angry players (a "permanent" perk sold as a product that vanishes on a data reset). In Studio: permanent perks (VIP, 2x Coins, auto-collect, extra slots, a cosmetic set, a starter pack) are passes in `Config.Monetization.GamePasses`; consumables are products in `Config.Monetization.Products`. Evidence: the docs define passes as one-time and point repeatable purchases to developer products [5][1]. Done right: "2x Coins (forever)" is a pass; "2x Coins for 30 min" is a product. Done wrong: a "Lucky Hour" game pass that never expires because the pass check is permanent.

2. **Every pass and product ID lives in `Config.Monetization`, and a placeholder `0` refuses to prompt.**
   Agents can't create products or set Robux prices; the owner does that on Creator Hub (Creations > experience > Monetization > Passes / Developer Products) and pastes the IDs in. Until then, IDs stay `0`, the buy function warns in Output and returns, and the grant table skips them so two placeholders can't collide. Merchant files one `node studio/cli.mjs ask` listing every item with its suggested price, type, config key and one-line description. Done right: `GamePasses = { VIP = 0 }` and a warning "GamePasses.VIP is a placeholder". Done wrong: a hardcoded ID copied from a tutorial that prompts a stranger's pass.

3. **`ProcessReceipt` is assigned exactly once, in one server module, and only the server grants.**
   The callback can be set only once, by one server script [1]; if several scripts assign it, only the last assignment takes effect [4]. In Studio it lives in `ServerScriptService/Services/ReceiptService`, required once by the server entry script. Every product's grant is a function in that module's table. Done right: a search for `ProcessReceipt` in the place finds one assignment. Done wrong: a pet-shop script and a currency script each assign it, so currency purchases silently stop granting.

4. **Grant receipts idempotently: record the `PurchaseId` in the same save as the grant, and return `PurchaseGranted` only after that save succeeds.**
   Roblox redelivers a receipt until you return `PurchaseGranted`, and `NotProcessedYet` tells it to try again later [1]. If you grant, return granted, and the server dies before the save, the player paid and lost the item. If you don't record the `PurchaseId`, a retry grants twice. Use the code in the Luau section unchanged. Done right: a test purchase grants once, survives a rejoin, and a forced save failure leads to a retry that does not double-grant. Done wrong: `data.Coins += 100; return PurchaseGranted` with the save left to the next autosave.

5. **Use one receipt system per game: our standard is `ProcessReceipt`; know that `BindReceiptHandler` exists.**
   The engine reference describes `MarketplaceService:BindReceiptHandler` as a newer alternative that processes developer product receipts (and Robux transfer receipts) through bound handlers; a bound handler takes precedence, and a receipt with no matching bound handler falls through to `ProcessReceipt` [2]. Its callbacks return a `ReceiptDecision` (`NotProcessedYet` leaves the receipt to be redelivered, `Processed` completes it) [3]. Two systems in one game make it unclear which one granted. Merchant adopts `BindReceiptHandler` only when a task requires it (for example Robux transfers [30]) and then migrates every product in one reviewed change, keeping the same idempotency rules. Done right: `decisions.md` records "ProcessReceipt only". Done wrong: half the products on a bound handler and half on `ProcessReceipt`, with grants duplicated across both.

6. **Apply pass perks on join and mid-session, and never cache a failed ownership check as "not owned".**
   Roblox doesn't apply pass perks for you; the docs say you must assign privileges yourself, checking `UserOwnsGamePassAsync` (in a pcall) when the player joins [5]. Mid-session purchases arrive through `PromptGamePassPurchaseFinished`. The legacy `GamePassService:PlayerHasPass` takes asset IDs, while new passes only have pass IDs, so use `MarketplaceService:UserOwnsGamePassAsync` [6][55]. If the call errors, return false for now and retry in 10-30 s; caching the failure locks a paying player out for the session. Done right: buy VIP mid-session and the tag appears within a second; rejoin and it's still there. Done wrong: "rejoin to get your perks".

7. **Never grant anything from `PromptProductPurchaseFinished`, `PromptGamePassPurchaseFinished` on the client, or any remote.**
   Those are UI signals. For products, only the receipt is proof of payment [1]. For passes, the server's `PromptGamePassPurchaseFinished` (with `wasPurchased`) and `UserOwnsGamePassAsync` are the proof. A remote that says "I bought X" is an exploit. Done right: the client plays a "thanks" animation only after the server sends a `PurchaseGranted` toast. Done wrong: `RemoteEvent:FireServer("BoughtCoins")`.

8. **Keep your own purchase records: Roblox doesn't record purchase information for your game.**
   The monetization docs tell developers to store purchase data themselves with `DataStoreService` or an external store [7]. Our save keeps the newest 100 receipt IDs (for idempotency), a `Purchases` log of the last 50 grants (key, time, price shown), and `StarterPackGranted`, `GiftTokens`, `Boosts` and `Gifted` fields. Liveops also logs each grant with `AnalyticsService:LogEconomyEvent` [52]. Done right: support questions ("I bought coins and got nothing") can be answered from the save. Done wrong: no record, so a refund-worthy bug can't be proven or fixed.

9. **Displayed prices come from `GetProductInfo` at runtime, never from code.**
   Regional pricing adjusts pass prices by the buyer's economic location, and for developer products the docs warn that hardcoded UI prices don't update, so players are charged one price while the UI shows another [11][12]. Price optimization tests also show different prices to users when they rejoin [9]. Read `PriceInRobux` from `MarketplaceService:GetProductInfo(id, Enum.InfoType.GamePass)` or `Enum.InfoType.Product`, pcall it, cache it per session, and show a spinner (never a guess) until it loads. Done right: the button reads "R$ 79" from Creator Hub. Done wrong: `PriceLabel.Text = "99"` while a Brazilian player is charged 70.

10. **Test every product in Studio, including leaving mid-purchase and a failed save.**
    Studio purchases are test purchases that charge no Robux but still run `ProcessReceipt`, and the docs recommend testing receipt handling before enabling sales [1]. Test: buy each product; buy, then leave before the grant; force `SaveNow` to return false once; buy two products quickly; buy while the save is still loading. Record Output in `games/<slug>/reports/`. Done right: Reviewer's report shows each case passing. Done wrong: "purchases work" with one happy-path test.

### B. What to sell

11. **Sell time, convenience, cosmetics and status; anything that adds power must be earnable by free players in reasonable time.**
    Free players fill the servers that make the game fun for payers. Balance proves in `economy.md` that every power item is reachable without Robux within a target time (rule of thumb: no more than 3x the paid path's time for the same item). In PvP modes, paid items are cosmetic or sidegrades only. Done right: 2x Coins halves grind time; every zone is still reachable free. Done wrong: the best sword is Robux-only in a PvP arena.

12. **Don't build the shop around paid timer skips: Roblox players dislike appointment mechanics.**
    The Creator Docs say timers that can be removed or brought forward, common on other platforms, are unpopular with Roblox users, who dislike their fun ending early [7]. If a game has timers (crop growth, crafting, restock), keep them short (seconds to a few minutes in the first hour), make waiting optional by giving something else to do, and sell speed as a permanent convenience (a pass) rather than as a nag per timer. Done right: "Fast Hatch" pass, hatch timers 3 s instead of 5 s. Done wrong: a 4-hour build timer with "Skip for 49 R$" popping up every time.

13. **Make one offer for tourists and one for locals.**
    The docs describe tourists, who hop between games and favor items with immediate effects that make play more fun or help them stand out, and locals, who settle into a few games [7]. Tourists buy in their first sessions: instant boosts, a flashy trail, the starter pack. Locals buy long-term value: VIP, 2x passes, storage, a subscription. A shop with only one kind leaves half the money behind. Done right: the shop's first tab has a 15-minute boost and a trail; the "Passes" tab has the long-term perks. Done wrong: only a 999 R$ "ultimate pass" that a first-session player has no reason to buy.

14. **Ship at least one repeatable product that an engaged player wants every session.**
    The docs note developer products generally monetize better because they can be bought again [7]. Passes cap out: once a player owns them all, they're done. Good repeatables: currency packs, timed boosts, revives, rerolls, server boosts, gift versions of passes. Each must stay useful at every stage of progression (scale currency packs with the player's level, or sell boosts that multiply whatever they earn). Done right: a "2x Coins 30 min" product that's worth as much at hour 20 as at hour 1. Done wrong: a "1,000 Coins" pack that is worthless after day two.

15. **Launch with a small shop: 3-6 passes and 4-6 products.**
    A small shop is easier to understand, balance and test, and each item gets its own clear job. Add items later when analytics show what players want ([[12 Live Ops and Launch]]). Suggested launch set: VIP, 2x currency, one convenience pass, starter pack (pass), 3-4 currency packs, one timed boost, one revive or reroll if the genre has deaths or rolls. Done right: one screen per tab with no scrolling on a phone. Done wrong: 22 passes at launch, half of them untested.

### C. Pricing

16. **Use a price ladder where each step is 1.5-2.5x the previous one, with prices ending in 9.**
    A ladder gives every budget an option and makes bigger items look like better value. Typical rungs: 15-25, 49, 99, 149-199, 249-299, 399-499, 799-999, 1,499-2,499 R$. The owner sets real prices; Merchant suggests them in the `ask`. Done right: products at 25 / 99 / 249 / 499 / 999. Done wrong: 95, 100 and 105 R$ items that look the same.

17. **Quantity ladders give a visibly better rate at each step, and the bonus shown is computed from the smallest pack.**
    Players compare packs by "how much more do I get". Fix a base rate on the smallest pack (for example 4 Coins per R$) and give each bigger pack a growing bonus over that rate (+13%, +25%, +37%, +50%, +60%; see the worked table in "Offer design"). The label must be true arithmetic. Done right: "2,750 Coins, +37% bonus" where 499 x 4 = 1,996 and 2,750 / 1,996 = 1.377, rounded down. Done wrong: "+500% VALUE!!" on every pack.

18. **Worth anchors and struck-through prices must be true.**
    The Sydney study flags "timed false reference pricing", such as "daily discounts" that are available every day so the lower price is really the default [37][39]. Our rules: "Worth X" is the sum of the bundle's parts at their real current prices in this game, computed at runtime from live prices; a struck-through "was" price is shown only if the item really sold at that price for at least 14 days before the sale and returns to it after; a sale lasts at most 72 hours and the same item is on sale at most once a month. Adopt Me's VIP pass has been reported at 600 Robux against a 750 original [45]; a real discount from a real price is fine. Done right: "Starter Pack R$ 79, worth R$ 260" where the parts really cost 260. Done wrong: a permanent "~~999~~ 299 today only!".

19. **Show the real Robux cost and exactly what the player gets, in plain words.**
    The Sydney research lists obscured pricing through separate virtual currencies and misleading omissions among the practices it found [37][39]. If a premium currency exists, every item priced in it also shows its approximate Robux cost on the card ("80 Gems, about R$ 40"), packs show what the gems buy, and nothing costs an odd amount that forces leftover currency. Every card has one sentence of plain description: "2x Coins from everything, forever." Done right: a 10-year-old can say what they're buying and roughly what it costs. Done wrong: gems sold in packs of 100 and items priced at 120.

20. **Run price optimization only on stable items, and leave each test running its full length.**
    Roblox's price optimization test picks passes and products, shows test prices to users when they rejoin, and emails results after about 3 weeks with optimized prices and an estimated long-term revenue impact; item-level recommendations were added later [9][10]. A test during a big update or a sale mixes signals. Liveops schedules tests in `liveops.md`, and only the owner starts them. The Dynamic Price Check tool helps find hardcoded prices (up to five test accounts) [9]. Done right: a 3-week test on the four currency packs during a quiet month. Done wrong: starting a test the day a new world launches, then ending it after 4 days.

21. **Leave regional pricing on for passes, opt products in, and script every price.**
    Regional pricing is on by default for passes that use managed pricing and adjusts by the buyer's economic location (Roblox uses signals such as VPN usage, billing history and account history) [11]. Developer products can be opted in with a default price that Roblox updates per region; Roblox's example was a product at 1,000 Robux in the US selling for 700 in Brazil and 500 in India [12]. Roblox launched regional pricing for in-experience items in April 2025 [13]. Because prices vary per player, the UI must read them live (Rule 9), and gifting or trading must account for different price levels (Rule 33). Done right: a Brazilian tester sees their own price on every card. Done wrong: a UI that says R$ 99 to everyone.

22. **Price boosts and consumables by time saved, and passes by lifetime value.**
    A consumable's price should feel small against the play it improves: rule of thumb, a 30-minute 2x boost costs 15-25% of the matching 2x pass. A pass should be worth roughly 4-10 boosts. Balance writes the "Robux per hour saved" for every offer in `economy.md` and flags anything far off the curve. Done right: 2x Coins pass 199, 30-min 2x boost 39. Done wrong: 30-min boost 149 next to a 199 permanent pass (nobody buys the boost) or 9 (the pass is pointless).

### D. Offers and where they appear

23. **The starter pack is one per account, appears after the player has felt the loop, costs 49-99 R$, and is clearly the best value in the shop.**
    A first purchase turns a player into a payer, and the starter pack should make that first purchase a no-brainer. Contents: currency worth about 2x the price at the base rate, one exclusive cosmetic, one small permanent perk; total worth at least 3x the price (computed by Rule 18). First shown as a card after the player's first upgrade or first rare item, never before minute 3 of the first session ([[01 The First Five Minutes]]). Sold as a pass so it can't be bought twice; its consumable parts are granted once and flagged `StarterPackGranted = true`. No countdown timer. Done right: a card at minute 6 after the first upgrade, closable in one tap, then a "Starter" tab in the shop. Done wrong: a full-screen popup on spawn with a 10-minute countdown that restarts each session.

24. **VIP is status first and comfort second, and the VIP area never holds progression.**
    VIP sells being seen: an overhead tag, a chat tag, a name color, a VIP-only hangout, a cosmetic, plus a small comfort bonus (+10-20% currency, an extra slot, a daily VIP gift). Adopt Me's VIP pass, as reported, gives VIP Room access and an exclusive limo [45]; that's status and fun, not power. Price VIP at 199-499 R$ by genre. Done right: a gold "[VIP]" chat tag and a rooftop lounge with a free daily chest. Done wrong: the best farming zone behind the VIP door.

25. **2x passes and boosts stack additively, and Balance simulates the fully-paid player.**
    Multiplying multipliers (2x pass x 2x boost x 2x event = 8x) lets payers finish the content in an hour and then leave. Add the bonuses instead (1 + 1 + 1 = 3x) and cap total multipliers per stat (rule of thumb: 5x). Balance runs the simulation in `games/<slug>/sim/` with every paid perk on and confirms the content lasts at least 60% as long as for a free player with daily rewards. Done right: "Coins x3 (2x Pass +1, Boost +1)" in the HUD tooltip. Done wrong: a 16x stack that skips three worlds.

26. **Personal timed boosts are developer products that tick only while the player is in the game, stack by adding time, and show remaining time on the HUD.**
    A child who buys 30 minutes and gets disconnected after 5 should not lose 25 minutes of a paid item. Store `RemainingSeconds` in the save, decrement on the server once per second while the player is present, add time on each purchase, and enforce any cap at the buy button, never at the grant (the grant always gives what was paid for). Show a boost tile with icon, multiplier and `mm:ss` left. Done right: buy 30 min twice, see 60:00, leave at 41:12, rejoin and see 41:12. Done wrong: an `os.time()` end stamp that keeps counting while the player sleeps.

27. **Server boosts: one buyer, everyone in the server benefits, the buyer is credited, and unused time isn't silently lost.**
    A server boost is a generous social purchase: one player pays and the whole server gets "2x Luck for 15 minutes". It works because it's visible and celebrates the buyer. In Studio: the product grants the buyer a token; the server spends the token to start or queue a 15-minute window; a banner reads "Ava boosted this server: 2x Luck 14:59"; queued windows keep their token until they start; on shutdown, a window more than half unused returns its token to the buyer. Late joiners get the boost. Done right: the banner shows the buyer and the stacked time. Done wrong: the boost lives in a server variable and vanishes on shutdown with 14 minutes left.

28. **Gifting uses a separate "gift" product per giftable item, the server locks the recipient before the prompt, and the purchase grants a gift token that the server then delivers.**
    `ProcessReceipt` only knows who paid, so the recipient must be chosen and validated on the server first. Granting a token (not the item) keeps the receipt path standard and idempotent; a second, Robux-free step moves the token to the recipient. If the recipient left, the token waits in the buyer's "Gifts to send" list. Blox Fruits lets players gift items such as permanent fruits and gamepasses [41], and Grow a Garden's gift shop charges Robux and needs both players in the same server [46]; DevForum discussions recommend a central gift service that registers each feature's products [50], and community tools show each stage of a transfer to the players (sending, processing, sent, completed) [51]. Done right: pick a player, buy "Gift VIP", both players get a toast. Done wrong: a "gift" that grants the buyer instead, or a client remote naming the recipient after payment.

29. **Offer at the moment of need, at most one unsolicited offer card per 10-15 minutes, and a "No thanks" silences that offer for the session.**
    Contextual offers convert because they solve a problem the player has right now: backpack full leads to "Bigger backpack?", a lost run to "Revive?", walking past the VIP door to a small perks card. Unsolicited cards (ones the player didn't open) share one cooldown of 10-15 minutes. Never in the first 3 minutes of a first session, never during combat, a boss, a cutscene or a tutorial step. Done right: one revive card after a death, with a free "Respawn" button the same size. Done wrong: a starter pack popup, a VIP popup and an update log stacked on join.

30. **The native purchase prompt opens only after the player taps a buy button in your UI.**
    The Roblox prompt is the last step, never the first. Every prompt traces back to a tap on a button that showed the item, its price and what it does. No prompts on join, on touching a part without a confirm card, on a timer, or chained after another prompt closes. Done right: tap "Buy R$ 99" on a card, then the Roblox prompt opens. Done wrong: walking onto a "VIP" pad prompts the pass immediately.

31. **Where a paid option has a free alternative, show the free one beside it at the same size.**
    Revive: "Revive R$ 15" and "Respawn at checkpoint". Restock: "Buy now R$ 25" and "Next restock in 2:41". Reroll: "Reroll R$ 9" and "Reroll with 1 Ticket (earned)". The free option keeps the moment from feeling like a shakedown and keeps free players in the game. Done right: two buttons of equal size, free on the left. Done wrong: a large green paid button and a tiny grey "x" in the corner.

32. **Revives and second chances are cheap, capped per run, and never the only way to continue.**
    DOORS sells Revives for Robux only, while Knobs can be bought or earned by ending a run in any way [49][48]. A revive is a high-intent moment, so price it low (15-49 R$), cap it (rule of thumb: 1-3 per run, rising price per use: 15, 25, 49), and always keep a free path (restart from checkpoint, spectate teammates). Done right: one revive card that disappears after 8 s if ignored. Done wrong: an unskippable revive card with a countdown over the death screen.

33. **Gifting and trading of paid items respect each player's policy and price level.**
    Check `PolicyService:GetPolicyInfoForPlayerAsync` for both players and block paid-item trades or gifts when `IsPaidItemTradingAllowed` is false for either ([28]; cache per Rule 43). Because regional pricing gives players different prices, the regional pricing docs point to `GetUsersPriceLevelsAsync` for managing in-game transfers of items with different managed prices [11]; Merchant reads that reference before enabling cross-player gifts and blocks gifts from a lower price level to a higher one if the docs require it. Done right: the gift button is greyed with "Gifting isn't available for this player". Done wrong: a gift system that lets one region buy everyone's passes at its lower price.

34. **Limited items are limited for real: by time (an event window) or by quantity (a server-enforced stock), and the limit is shown with true numbers.**
    Fake scarcity ("only 3 left!" that never changes) is a dark pattern [37][39]. Time-limited: start and end are UTC timestamps in config; the end shows as a date, not a ticking pressure timer, for kids; the item never returns as a "rerun" unless the original listing said it might. Quantity-limited items are sold for earned currency (stock is claimed atomically on the server with `UpdateAsync`), or as UGC Limiteds where Roblox manages the stock [31]. Done right: "Halloween Bat Wings, available until 3 Nov" and a counter "4,812 / 10,000 claimed" that really moves. Done wrong: Robux-priced items with a client-side "LIMITED" sticker.

35. **Sell avatar items in context: the experience owner earns 40% of each in-experience sale.**
    Roblox's commission split for in-experience sales of avatar items is 30% to the item creator, 40% to the experience owner and 30% to the platform, and the same split applies to the original sale of Limited items [31]. Items can be bought through the Avatar Inspect Menu or a UGC homestore template [32]. Placements that work: a changing room in a roleplay game, a "wear what you see" mirror, a homestore lobby. Linking items to the experience requires steps by the owner (sale location, enabling the asset), so Merchant asks. Done right: a clothing rack where each item opens the Roblox item prompt. Done wrong: bulk-listing unrelated catalog items in a combat game.

36. **Private servers are free in social games and paid (monthly) only where private play has real value.**
    Creators can make private servers free for everyone or charge a monthly Robux fee, the game must be public first, and paid access and private servers can't be on together [35]; players are charged once on purchase and then monthly [36]. Social and roleplay games want friend groups to have a home, so free servers grow retention ([[10 Retention and Social]]). Grind games sometimes charge (rule of thumb: 50-200 R$ per month), because private farming or private hunting is a real convenience. PCGamesN reports a change where Roblox Plus subscribers get one free private server per game while creators can still offer free servers [56]. The owner sets this. Done right: free private servers in a roleplay town. Done wrong: 500 R$/month for a game where servers are rarely full anyway.

### E. Subscriptions, ads and platform payouts

37. **Launch with at most one subscription, deliver its benefit daily, and name its price and duration wherever it's sold.**
    Subscriptions are monthly, auto-renewing benefits; they can be priced in local currency or Robux, and revenue arrives in Robux either way [14]. Users can own all of an experience's subscriptions at once (mutually exclusive tiers aren't supported), and the docs ask for short, self-explanatory names and the price and duration on every in-game merchandising surface [14]; subscriptions became purchasable by users in late 2023 [15]. Adopt Me's Pets Plus, as reported, costs $2.99 per month (varying by region), includes VIP and lets players equip two pets at once [44]. The benefit must be felt every day (a daily chest, an extra slot used constantly), or players cancel. Check status on join and on change, server-side. Done right: "Plus: R$ / month, a daily Plus chest + 1 extra pet slot, cancel any time". Done wrong: a subscription that duplicates a pass the player already owns.

38. **Show rewarded video ads only if the experience is eligible, only to eligible viewers, with a fixed reward, from an opt-in button, capped per day, and with a non-ad path for everyone else.**
    Current docs list creator requirements of age 13+, an ID-verified account and a public experience with at least 2,000 unique visitors per month [21]; an August 2025 announcement had required 100K+ average DAU, minimal or mild content maturity and good standing for self-service access, so the bar has changed over time [23]. Rewarded video ads may only be shown to users 13 and older, and video ad rewards can't be randomized items [22]. Developers have reported the API returning `ExperienceIneligible` while Creator Hub showed the experience as eligible [24], so the button must only appear after the availability check succeeds. Our rules: rewards are small and fixed (a 10-minute 2x boost, one revive, a reroll ticket), a daily cap of 3-5 views, never during the first session's first 10 minutes, never the only way to progress. Done right: "Watch a video for 10 min of 2x Coins (3 left today)" visible only when available. Done wrong: an ad button that does nothing for under-13 players, or a "watch for a mystery egg".

39. **Immersive ads go only on surfaces that never block play, and only after eligibility is confirmed.**
    Immersive ads require a public experience, an owner aged 13+ with an ID-verified account and 2-factor authentication, and a completed Maturity and Compliance Questionnaire; turning off verification or 2FA removes eligibility [25]. All advertising must follow Roblox's Advertising Standards, Community Standards and Terms of Use [54]. Placement: billboards along walkways or in lobbies, never in the path of an obby jump, never covering UI, never in a spot players must stare at to play. The owner decides whether to enable ads. Done right: two billboards on the lobby walls. Done wrong: an ad panel behind the boss so players stare at it all fight.

40. **Creator Rewards replaced Premium Payouts: retention is revenue.**
    Engagement-based payouts (Premium Payouts) were deprecated effective July 24, 2025 and replaced by Creator Rewards [16][18]. Creator Rewards' daily engagement reward pays per qualifying user: an Active Spender for whom the experience is one of the first three they launch that day and who stays at least 10 minutes [17]; Tubefilter describes Active Spenders as users who spent at least $9.99 on Roblox in the past 60 days [19]. Roblox has said payouts are uncapped but amounts may change [20]. Design consequence: a game players open first every day and stay in for 10+ minutes earns even from players who never buy anything in it, so never trade daily return or session length for a pushy sale ([[10 Retention and Social]]). Done right: daily rewards and a 10-minute session goal. Done wrong: an aggressive popup that cuts first-session length to 4 minutes.

41. **Give players a reason to share the game's link: Creator Rewards pays for new and returning users.**
    The Audience Expansion part of Creator Rewards gives creators a 35% share of a new or returning user's first $100 in qualifying purchases when the user joins through the creator's share link or direct link and plays 10+ minutes, for experiences averaging 100+ DAU over 60 days [17]; it requires an ID-verified account in good standing and a valid DevEx account [18]. Bots and encouraging alt accounts are prohibited [17]. Liveops puts the share link in social posts, and the game gives friend-invite moments ([[10 Retention and Social]], [[15 Discovery and Growth]]). Done right: a weekly update video with the game link. Done wrong: "make alt accounts and join with my link for free pets".

### F. Random items, policy and honesty

42. **Paid random items show every outcome's odds as percentages that add up to exactly 100%, before purchase, behind a button labeled with a word.**
    The policy covers items bought with Robux or with currency bought with Robux, and indirect purchases too: keys, re-roll tokens and spin tickets bought with Robux trigger the same duty to show odds before the player spends [26]. Items that improve odds, like luck potions, must show the adjusted odds as numbers before purchase [26]. Odds are percentages summing to exactly 100%; with many outcomes, a clickable pop-up labeled "Info" or "Details" can hold the full list, but a bare (i) icon without a word doesn't count [26]. A 2026 report says Roblox aligned its disclosure rules worldwide with South Korea's law and added tools to block random purchases or replace them with guaranteed ones where required [27]. Done right: an "Odds" button on the egg stand and the buy card, listing all pets with percentages, updating when a luck boost is active. Done wrong: "Legendary: rare!" with no numbers.

43. **Check `PolicyService` for every player, cache it on join, and hide paid random items when restricted or when the check fails.**
    `GetPolicyInfoForPlayerAsync` returns `ArePaidRandomItemsRestricted`; when it's true, the player can't use paid random generators, whether paid with Robux or with Robux-bought currency [28]. The call yields and has a rate cap (about 100 calls before a response returns errors) [28], so call it once on join in a pcall and cache it, as DevForum examples recommend [29]. If it fails, treat the player as restricted and retry once after 10 s. A restricted player gets an earnable path or a fixed-order (non-random) alternative, as the policy guide requires [28][26]. Done right: a restricted player sees "Buy Cat (R$ 49)" instead of "Buy Egg". Done wrong: calling the API on every shop open and hitting the cap.

44. **Never sell power in PvP, and never sell a guaranteed win.**
    Paid power in competitive modes splits the community and drives free players out. Paid items in PvP are cosmetic, sidegrades with a matching free option, or convenience outside the match (loadout slots, faster queues). Done right: a paid sword skin with identical stats. Done wrong: a 499 R$ sword that one-shots free players.

45. **No dark patterns: no fake timers, fake scarcity, near-miss animations on paid rolls, guilt text, or stacked prompts.**
    The Sydney research documents fake time-limited discounts, countdown timers that manufacture false urgency, near-miss visuals that make wins feel close, misleading claims and omissions, and obscured costs [37][38][39]. Our games use none of them. Paid rolls reveal the result without a slowed "almost got it" near-miss; decline buttons say "No thanks", never "No, I hate free stuff"; "free" means free. Kid Tester checks every offer for these. Done right: an egg opens in under 2 s with a clean reveal. Done wrong: the spinner slows past the Mythic every time before landing on Common.

46. **Write every offer so a 10-year-old and their parent would agree on what was bought.**
    Many players are children. Plain words, the price visible before the tap, no pressure, no "you'll lose your pet". Purchase toasts confirm exactly what was granted ("+2,750 Coins added"). Kid Tester reads every card aloud and flags anything unclear ([[01 The First Five Minutes]]). Done right: "VIP: gold name tag, VIP lounge, +10% Coins. Forever." Done wrong: "ULTRA MEGA BUNDLE!!! x10 VALUE" with no list of contents.

47. **Log the shop funnel and every Robux grant, with few, stable event names.**
    Without data you can't tell a bad price from a hidden button. Log a funnel per shop visit (opened, item viewed, buy tapped, prompt shown, granted) with `AnalyticsService:LogFunnelStepEvent`, and log each currency grant from a purchase with `LogEconomyEvent` using the `IAP` transaction type. Creator Hub's monetization analytics show the results [52]. Keep names fixed (`ShopFunnel`, step names like `Opened`) and values low-cardinality (product keys, not user IDs). Done right: Liveops can see that 30% open the shop but 2% view the Passes tab. Done wrong: a new event name per product per day.

48. **Physical commerce, Robux transfers and other platform programs are owner decisions; agents never enable them.**
    Roblox lets eligible creators sell physical products inside experiences [33][34] and lets games prompt Robux transfers between users, with the game earning 10% of the Robux sent and the recipient 90% [30]. These involve real-world fulfilment, age and policy rules, and legal risk. Merchant may note an opportunity in `decisions.md` and `ask` the owner; it never builds these unasked. Done right: "Owner: our merch-heavy roleplay game could use Commerce; your call." Done wrong: a "Send Robux to friends" button added on a whim.

49. **One menu at a time, and the shop is one tap from the HUD and one tap to leave.**
    Opening the shop closes other menus, the close button sits in the same place on every menu, and safe-area insets keep buttons clear of notches [53]. The shop button lives in the same HUD slot in every game (left rail, top slot; see [[05 UI and HUD]]). Done right: shop opens in under 0.3 s with the close button at the top-right of the panel, 44x44 px or larger. Done wrong: the shop opens over the inventory and the close button hides under a phone notch.

50. **Merchant owns money code, Reviewer signs it off, and nobody else edits it.**
    Money bugs are the most expensive bugs. Changes to `ReceiptService`, `PassService`, `GiftService`, `BoostService` or `Config.Monetization` go through Merchant, with Reviewer's report naming the tests run. Builder wires gameplay hooks (multipliers, perks) through the services' public functions only. Done right: Builder calls `BoostService.CoinMultiplier(player)`. Done wrong: Builder adds `data.Coins += 500` to a touch handler "for testing" and ships it.

## Step by step

### Building the shop for a new game in 16 steps
1. **Read the plan.** Merchant reads `plan.md` and `economy.md`, notes the core loop verb, the main currency, the genre and the session length target.
2. **Pick the catalog.** Choose 3-6 passes and 4-6 products from the launch catalog table below, one offer per job (tourist instant, local long-term, repeatable, starter). Write the list in `decisions.md` with one line of reasoning each.
3. **Price it.** Suggest prices from the genre ladder ("By genre"), check the step ratio (1.5-2.5x) and the "Robux per hour saved" with Balance.
4. **Ask the owner.** One `node studio/cli.mjs ask` titled "Create N passes and M products" listing, for each item: config key, type (pass or product), suggested price, display name, one-line description, and the icon file to upload (Splash makes 512x512 icons; see [[11 Thumbnails, Icons and the Store Page]]).
5. **Write the config.** Add `Config.Monetization` with every key at `0`, plus `Offers`, `Boosts` and `Bundles` data tables (Luau section). Data only, no functions.
6. **Install the receipt service.** Copy `ReceiptService` exactly, then add one grant function per product key. Grants only mutate the save table.
7. **Install the pass service.** Copy the ownership code, write `applyPassPerks(player, passId)` for each pass, and call it on join once the save loads and on `PromptGamePassPurchaseFinished`.
8. **Add boosts, gifts and policy.** Add `BoostService` if the game sells timed boosts, `ServerBoostService` for server boosts, `GiftService` if any item is giftable, and the `PolicyService` cache if anything random is sold.
9. **Build the price fetcher.** The client `PriceService` reads `GetProductInfo` for every ID once per session and fills every price label.
10. **Build the shop UI (Frame).** Tabs: Featured, Passes, Currency, Boosts, Gifts (if any). Cards per the recipes below. One menu at a time; the close button in the standard spot.
11. **Wire contextual offers.** Add the `OfferManager` with its cooldowns, and hook the moments of need: inventory full, death, low currency at an upgrade, VIP door proximity.
12. **Add the starter pack trigger.** First eligible moment after the first upgrade (never before minute 3), then a "Starter" tab with a badge dot until bought.
13. **Add odds panels.** For every paid random item, an "Odds" button generated from the server's weight table, with boosted odds when a luck boost is active.
14. **Add analytics.** Shop funnel steps and IAP economy events (Luau section). Liveops lists the names in `liveops.md`.
15. **Test everything in Studio.** Each product bought once, twice quickly, with a mid-purchase leave and a forced save failure; each pass on join and mid-session; gifts to a present and an absent player; boosts across a rejoin; a restricted policy player (simulate with a Studio flag).
16. **Hand off.** Report to Lead with the test log path, the open `ask`, and a screenshot of each shop tab for Review.

### Adding one new product to a live game in 9 steps
1. Write the item's job, price and grant in `decisions.md`.
2. `ask` the owner to create it and paste the ID.
3. Add the config key with `0`.
4. Add the grant function to `grantsByKey` (save mutation only).
5. Add the card to the right tab; price from `PriceService`.
6. If random: add odds and the policy gate.
7. Test in Studio: buy, rejoin, buy twice, leave mid-purchase.
8. Reviewer reads the diff of `ReceiptService` and `Config.Monetization`.
9. Liveops adds the item's SKU to the economy logging list.

### Running an honest sale in 7 steps
1. Pick one category (for example currency packs), never "everything, always".
2. Confirm each item's "was" price has been the real price for at least 14 days.
3. Set UTC `StartsAt` and `EndsAt` (at most 72 hours) in `Config.Sales`.
4. Ask the owner to change the prices on Creator Hub at the start (and back at the end), since agents can't change prices; the UI reads live prices, so the "was" value comes from `Config.Sales[key].WasPrice` checked against the live price at runtime (if live price is not below `WasPrice`, the strike-through hides itself).
5. Show the end as a date ("Sale ends Sun 3 Nov"), not a pressure timer.
6. Don't run price optimization tests during the sale [9].
7. Log `SaleViewed` and purchases; Liveops compares with the previous two weeks.

### The money audit before launch (Reviewer, 12 steps)
1. Search the place for `ProcessReceipt`: exactly one assignment.
2. Read every grant: no yields, no UI, no remotes.
3. Confirm every product key has a grant and every grant has a key.
4. Confirm `PurchaseGranted` is returned only after `SaveNow` returns true.
5. Confirm receipts are pruned to 100 and stored in the player save.
6. Confirm pass checks are pcall'd and failures aren't cached.
7. Confirm no prices are hardcoded in UI text (search for `R$` and digits in StarterGui).
8. Confirm no prompt function is called outside a button's `Activated` handler.
9. Confirm odds panels exist for every paid random item and sum to 100.
10. Confirm the policy gate hides random purchases when restricted or failed.
11. Confirm the offer cooldowns: no card before minute 3, one per 10-15 minutes.
12. Run Kid Tester's dark-pattern pass and attach the report.

## The catalog

### Game pass or developer product
| | Game pass | Developer product |
|---|---|---|
| Bought | Once, owned forever [5] | Any number of times [1] |
| Use for | VIP, 2x currency, auto-collect, extra slots, cosmetic sets, starter pack | Currency packs, timed boosts, server boosts, revives, rerolls, gift tokens |
| Check | `UserOwnsGamePassAsync(userId, passId)` on join (pcall), plus `PromptGamePassPurchaseFinished` [5] | `ProcessReceipt` callback, once per purchase [1] |
| Prompt | `PromptGamePassPurchase(player, passId)` | `PromptProductPurchase(player, productId)` |
| Gotcha | Apply both mid-session and on every join | Idempotent, saved before acknowledging |
| Shows on the store page | Yes, in the experience's store listing | No |
| Regional pricing | On by default with managed pricing [11] | Opt-in per product [12] |

### Launch catalog (pick from this)
| Key | Type | Suggested R$ | Job | Where offered |
|---|---|---|---|---|
| `StarterPack` | Pass | 49-99 | First purchase, best value | Card after first upgrade; Starter tab |
| `VIP` | Pass | 199-499 | Status for locals | VIP door card; Passes tab |
| `DoubleCoins` | Pass | 149-299 | Long-term speed | Upgrade screen; Passes tab |
| `AutoCollect` / `AutoClick` | Pass | 99-249 | Convenience | Near the collector; Passes tab |
| `ExtraSlots` | Pass | 99-199 | Storage | Inventory-full moment |
| `CoinsS/M/L/XL` | Product | 25 / 99 / 249-499 / 999+ | Repeatable | Currency tab; low-currency moment |
| `Boost2x30` | Product | 29-49 | Tourist instant | Boosts tab; HUD boost tile |
| `ServerLuck15` | Product | 99-199 | Social generosity | Boosts tab; server banner |
| `Revive` | Product | 15-49 | High-intent rescue | Death screen (with free respawn) |
| `Reroll` | Product | 9-25 | RNG convenience | Roll screen (with earned tickets) |
| `GiftVIP` etc. | Product | same as the pass | Social | Gift tab; player card |
| `Plus` | Subscription | owner sets | Daily value for locals | Passes tab; daily chest |

### Price ladder (rule of thumb; the owner sets real prices)
| Tier | Example R$ | Typical offer |
|---|---|---|
| Impulse | 9-49 | small pack, revive, reroll, 15-30 min boost |
| Starter | 49-99 | starter pack: one-time, clearly the best value |
| Core pass | 99-299 | 2x currency, auto-collect, extra storage, faster hatch |
| VIP | 199-499 | tag, VIP lounge, small daily bonus, cosmetic |
| Big pack | 499-999 | large currency pack with the best rate |
| Whale cap | 1,499-2,499 | the largest pack; never higher at launch |

## Offer design

### Quantity ladder: worked table
Base rate: the smallest pack sets it (here 4 Coins per R$). Each pack's bonus is `coins / (price x base rate) - 1`, rounded down to a whole percent. Balance changes the numbers; the method stays.
| Pack | R$ | Coins | Base value (R$ x 4) | Bonus shown | Coins per R$ |
|---|---|---|---|---|---|
| Handful | 25 | 100 | 100 | none | 4.0 |
| Pouch | 99 | 450 | 396 | +13% | 4.5 |
| Sack | 249 | 1,250 | 996 | +25% | 5.0 |
| Chest | 499 | 2,750 | 1,996 | +37% | 5.5 |
| Vault | 999 | 6,000 | 3,996 | +50% | 6.0 |
| Mountain | 2,499 | 16,000 | 9,996 | +60% | 6.4 |
- Show the bonus as a ribbon on the card and "Coins per R$" in small text under it. Tag one pack "Most popular" only if analytics say so; tag the biggest "Best value" because it's arithmetic.
- Scale with progress: if the player's income per minute grows 100x over the game, sell packs as "minutes of income" ("30 min of Coins") and compute the amount from the player's current income at purchase time, server-side, inside the grant (the grant reads `data.IncomePerMinute`, which is in the save, so no yield). Show the exact amount on the card before the tap.
- Never let packs leave awkward remainders: if items cost 120 Gems, sell 120, 250, 520 Gem packs, not 100.

### Worth anchors and bundles
"Worth" is the sum of the parts at their real current prices, computed at runtime from live prices:
| Part | How its worth is computed | Example |
|---|---|---|
| Currency | amount / base rate x live price of the smallest pack / its R$ | 400 Coins at 4 per R$ = R$ 100 |
| A pass included | the pass's live price | 2x Coins pass R$ 149 |
| A boost included | live price of that boost product x count | 2 x 30-min boost at R$ 39 = R$ 78 |
| An exclusive cosmetic | not counted (it has no separate price) | "Lava Trail (exclusive)" |
- Starter Pack at R$ 79: 400 Coins (R$ 100) + 2 boosts (R$ 78) + exclusive trail. The card says "Worth R$ 178+", truthfully.
- If any part's live price fails to load, hide the "Worth" line rather than guess.
- Bundles beyond the starter pack: at most 2 at a time, each with a clear theme ("Fisher Bundle": rod skin, bait pack, 1 h 2x Fish). Bundle discount 20-40% versus parts; more looks fake.

### Struck-through prices
- Only during a real sale from `Config.Sales` (Rule 18) and only when the live price is below `WasPrice`.
- Layout: the old price in 70% size, 60% opacity, with a 2 px strike line; the new price full size in the buy color; a ribbon "-30%" computed from the two numbers.
- Never on bundles' "worth" (that's an anchor, not a former price). Use the word "Worth", never "Was", for bundles.

### Gifting design
- Giftable: passes (as "Gift VIP" products at the same price) and cosmetics. Not giftable: currency packs in games with trading (laundering risk), random items (policy), anything the recipient already owns.
- Flow: tap a player's card or the Gift tab, pick a recipient from players in this server (rule for launch: same server only, like Grow a Garden [46]), the server validates and locks the target for 60 s, the player taps "Buy gift R$ X", the Roblox prompt opens, the receipt grants a gift token, the server delivers it, and both players get a toast and a small celebration effect.
- Show stages like community tools do (sending, delivered) so nobody wonders where the gift went [51].
- Recipient owns it already: the recipient is greyed in the picker with "Already has VIP".
- The recipient left before delivery: the token stays in the buyer's "Gifts to send" list, sendable to anyone later.
- Policy and price level: Rule 33. Log `GiftSent` with the item key.

## Where offers appear
| Surface | What appears | Cap |
|---|---|---|
| HUD shop button | Always visible, left rail top slot, badge dot when something new | n/a |
| Shop panel | Tabs; Featured first | Opened by the player only |
| Moment of need | One contextual card (inventory full, death, short of coins at an upgrade) | 1 per moment, shared 10-15 min cooldown for unsolicited cards |
| World placements | VIP door, pass pads in tycoons, shop NPC, a boost totem | Card only on touch plus confirm; never a direct prompt |
| End of round | "Revive / Play again / Shop" row; no popup | Every round, passive |
| Starter pack card | Once after the first upgrade in session 1; again at the start of sessions 2 and 3 (as a small banner) | 3 shows total, then shop tab only |
| Event banner | Event's free track first, paid items second | Once per session |
| Gift button | On player cards and the Gift tab | Player-initiated only |
| Rewarded ad button | Next to the item it boosts, only when available | Daily cap 3-5 |
| Experience store page | Passes listed on Roblox's page | n/a |
| Never | Join screen, loading screen, tutorial, combat, cutscenes, the first 3 minutes | 0 |

## Starter packs
- **Contents:** currency worth about 2x the price, one exclusive cosmetic that others can see, one small permanent perk (+1 slot, +10% speed). Total worth at least 3x the price.
- **Type:** a pass (can't be bought twice, shows on the store page). The pass check grants the consumable parts once and sets `data.StarterPackGranted = true`. The perk part is a normal pass perk checked every join.
- **Timing:** first card after the first upgrade or first rare item, never before minute 3 of session 1 (target window: minutes 4-8). Then a small banner at the start of sessions 2 and 3. After that it lives only in the Starter tab, forever, with no timer.
- **Price:** 49-99 R$ (genre table). Lower in games with younger audiences or cheap ladders.
- **Second purchase:** after the starter pack is owned, the Featured slot shows the next best offer for that player's stage (Rule 13: a long-term pass for locals).

## VIP
- **Status:** overhead tag (BillboardGui, gold `#FFD54A` text with a 2 px dark stroke), chat prefix (Luau section), name color, a VIP-only cosmetic.
- **Place:** a VIP lounge with a view, a free daily VIP chest, maybe a VIP-only minigame. No progression, no exclusive resources that matter.
- **Comfort:** +10-20% currency or +1 slot. Stack additively (Rule 25).
- **Price:** 199-499 R$; the most visible perk must be visible to other players, or VIP doesn't sell.
- **Door card:** walking within 8 studs of the VIP door shows a perks card once per session ("VIP: gold tag, lounge, daily chest, +10% Coins. R$ X forever.") with "Buy" and "Not now".

## Time-boxed boosts
- **Durations:** 15, 30 and 60 minutes. Price per minute falls slightly with length (30 min = 1.8x the 15 min price; 60 min = 3.2x).
- **Ticking:** playtime only (Rule 26). Show "2x Coins 29:41" on a HUD tile; tap the tile to see "Adds up when you buy more; pauses when you leave".
- **Stacking:** time adds; the multiplier doesn't (two 2x boosts = 2x for twice as long). Cap total queued time at the button (rule of thumb: 4 hours), never in the grant.
- **Free sources:** daily rewards, quests and codes give the same boosts in small amounts, so free players know what they are ([[10 Retention and Social]]).
- **Events:** a server-wide event multiplier adds to boosts (Rule 25).

## Server boosts
- **Product:** "Server 2x Luck, 15 min", priced 99-199 R$ (roughly 3-5x a personal boost, because it helps up to the whole server).
- **Effect:** everyone in the server, including late joiners, gets the boost; it adds to personal boosts.
- **Credit:** a top banner "Ava boosted the server! 2x Luck 14:59", a chat system message, and a confetti burst for 2 s. Display names only.
- **Stacking:** extra purchases queue more windows (time adds). Each queued window keeps the buyer's token until it starts.
- **Shutdown:** on `game:BindToClose`, if the running window has more than half its time left and its buyer is still in the server, the token goes back to the buyer's save (they can use it in another server). Queued windows return their tokens too.
- **Abuse:** cap queued server time at 2 hours; refuse further purchases at the button with "Server boost queue is full".

## Limited items
| Kind | Price in | How the limit is enforced | How it's shown |
|---|---|---|---|
| Time-limited (event) | Robux or earned currency | UTC window in `Config.Events`; server checks `os.time()` | "Available until 3 Nov" |
| Quantity-limited (serials) | Earned currency only | Global counter claimed with `DataStore:UpdateAsync` before granting | "4,812 / 10,000 claimed", refreshed every 60 s |
| UGC Limited (avatar item) | Robux, via Roblox | Roblox manages stock; experience earns 40% of the original sale [31] | Roblox's own item prompt |
| Rotating shop stock | Earned currency, Robux shortcut | Server-seeded rotation every N minutes | "Next restock 2:41" |
- Grow a Garden's seed shop restocks on a short cycle (guides report every five minutes) and lets Robux buy any seed at any time [47]: rotation creates "check the shop" moments while the paid path stays available. If you copy the pattern, keep the free restock frequent enough that waiting is fine.
- A limited item never gives power that later players can't get. Event cosmetics may stay exclusive.

## Subscriptions
- **When:** only after launch data shows a daily habit (D7 retention that Liveops considers healthy) and only one subscription.
- **Benefit:** something used every day: a daily chest, an extra slot, a small daily currency stipend, a monthly exclusive cosmetic. Don't duplicate passes.
- **Copy:** name, price and duration on every card [14]: "Plus: R$ X per month. Daily Plus chest, +1 pet slot. Renews monthly; cancel any time in Roblox settings."
- **Status:** check `GetUserSubscriptionStatusAsync` on join and on `Players.UserSubscriptionStatusChanged` (Luau section); set a `Sub_Plus` attribute; grant the daily benefit once per UTC day while subscribed.
- **Lapse:** when the subscription ends, keep everything already granted; only future dailies stop.
- **Availability:** subscriptions haven't been purchasable in every country; check the docs' current list before relying on them [14].

## Rewarded video ads and immersive ads
- **Eligibility first:** Merchant asks the owner to confirm eligibility in Creator Hub [21][23]. Never show an ad button before a successful availability check, because the API can report the experience ineligible even when the Hub says otherwise [24].
- **Viewers:** only users 13+ can be shown rewarded video ads [22]. Under-13 players see the same item with its earned path ("or finish a quest"), never a broken button.
- **Rewards:** fixed, never random [22]: a 10-minute 2x boost, one revive, one reroll ticket. Rule of thumb for value: about the value of a 15-25 R$ product.
- **Frequency:** daily cap 3-5; at most one ad offer per 10 minutes; never in the first 10 minutes of a first session.
- **Implementation:** use `AdService` as described in the rewarded video ads docs [21]; grant the reward through the server and log `AdRewardGranted`. Read the current API reference before coding; the API has changed since launch.
- **Immersive ads:** placement rules in Rule 39 [25]; Scenic places ad units only where they never block play.

## Creator Rewards (formerly Premium Payouts)
| Program | Status | Pays for | Design lever |
|---|---|---|---|
| Engagement-based payouts (Premium Payouts) | Deprecated July 24, 2025 [16] | Share of Premium members' time (historical) | n/a |
| Creator Rewards: daily engagement | Active [17] | Active Spenders who launch the game among their first three that day and stay 10+ min [17][19] | Be a "first game of the day"; first session goal at 10+ min |
| Creator Rewards: audience expansion | Active [17] | 35% of a new or returning user's first $100 of qualifying purchases after joining via your link and playing 10+ min [17] | Share links in socials, invites, updates |
- Payouts are uncapped but may change [20]; Liveops reads the Creator Hub numbers rather than projecting them.
- The practical rule: every design choice that raises daily return and session length past 10 minutes is a monetization choice.

## Odds disclosure and Roblox policy
- **Scope:** anything random bought with Robux, with Robux-bought currency, or with keys, tickets or rerolls bought with Robux [26].
- **Format:** every outcome with a percentage; the list sums to exactly 100%; shown before purchase; if long, behind a button with a word ("Odds", "Info", "Details"), not a bare icon [26].
- **Boosts:** luck items show the adjusted odds as numbers before purchase [26]; the panel shows "With 2x Luck active" and the boosted list.
- **Source of truth:** the panel is generated from the same weight table the server rolls with ([[03 Rarity and RNG]]); never typed by hand.
- **Precision:** enough decimals that no outcome shows 0% (Luau `displayOdds` uses 4 decimal places of percent).
- **Policy gate:** `ArePaidRandomItemsRestricted` true, or a failed check: hide paid random purchases and show the earnable or direct-purchase alternative [28][26].
- **Worldwide:** treat these rules as global, not regional [27].
- **Trading:** `IsPaidItemTradingAllowed` gates trading and gifting of paid items (Rule 33) [28].

## Shop UI recipes
Frame builds these. Sizes are for a 1920x1080 design canvas using Scale with a `UIAspectRatioConstraint`; check on a phone ([[08 Mobile]]).
- **Shop panel:** 60% x 70% of the screen (phone: 92% x 86%), centered, 16 px corner radius, tabs on top (48 px tall), close button 56x56 at the top-right inside the safe area. Opens with a 0.15 s scale from 0.9 to 1.
- **Pass card:** 280x360. Icon 160x160 top-center; name (bold, 28 px); one-line benefit (20 px, 2 lines max); price button 220x64 at the bottom, green `#3BC14A` with a white "R$ 149" label; owned state: grey button "Owned" with a check.
- **Currency pack card:** 240x300. Pile art growing with size; amount (bold, 32 px); bonus ribbon at the top-right ("+25%"); "Coins per R$" in 16 px; price button.
- **Bundle card (Featured):** 600x320, horizontal. Contents listed as icons with labels; "Worth R$ 178+" in 22 px above the price; price button 260x72.
- **Boost tile (HUD):** 64x64 icon with a radial timer ring and "29:41" under it; tap opens the Boosts tab.
- **Offer card (contextual):** 520x300 bottom-center; title, one line, two equal buttons ("Buy R$ 49" and "No thanks"); auto-hides after 10 s.
- **Odds panel:** list rows 48 px tall: item icon, name, rarity color, percentage right-aligned with 2-4 decimals; header "Odds (add up to 100%)"; a toggle for "With my boosts".
- **Gift picker:** a scrolling list of players in the server with avatar headshot, display name and a state ("Already has VIP" greyed); search box at 10+ players.
- **Purchase toast:** top-center, 2.5 s, "+2,750 Coins added" with the item icon; plays a short sound; queued, never stacked.

