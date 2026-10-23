---
tags: [vault, monetization, shop, game-passes, developer-products, pricing, offers, subscriptions, ads, odds]
for: [merchant, balance, frame, builder, reviewer]
also: [lead, architect, liveops, kid-tester, producer, pulse]
---

# 09 Shops and Monetization

This chapter is the studio's playbook for earning Robux without losing players. It covers which of Roblox's monetization options [8] to use for each offer, how to price it, how to present it (worth anchors, struck-through prices, quantity ladders, bundles, gifting), where offers may appear and how often, time-boxed and server-wide boosts, starter packs, VIP, limited items, subscriptions, rewarded video ads and immersive ads, Creator Rewards (which replaced Premium Payouts in July 2025), private servers, avatar items, and the rules for paid random items and odds. It also holds the server code that takes real money: receipts, ownership checks, gifts and boosts.

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
    A server boost is a generous social purchase: one player pays and the whole server gets "2x Luck for 15 minutes". It works because it's visible and celebrates the buyer. In Studio: the product grants the buyer a token; the server spends the token to start or queue a 15-minute window; a banner reads "Ava boosted this server: 2x Luck 14:59"; on shutdown, windows that haven't started, or are more than half unused, return their tokens to their buyers. Late joiners get the boost. Done right: the banner shows the buyer and the stacked time. Done wrong: the boost lives in a server variable and vanishes on shutdown with 14 minutes left.

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
- **Stacking:** extra purchases queue more windows (time adds), each credited to its buyer.
- **Shutdown:** on `game:BindToClose`, every window that hasn't started, and a running window with more than half its time left, returns one token to its buyer's save if the buyer is still in the server, so they can use it in another server. A buyer who already left forfeits nothing they could have used: their window ran for the server they paid for.
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

## Examples from top games

### A real discount from a real price
**Game:** Adopt Me! ([45])
**Shows:** Sportskeeda's pass guide lists the VIP pass at 600 Robux against a 750 Robux original cost.
**Why it works:** a price reduction anchored to a price players have actually seen makes the pass feel like a deal without inventing a number.
**Steal:** strike-through prices only for real, time-boxed reductions from a price that really existed (Rule 18), computed from live prices.
**Avoid:** a "was" price that was never charged, or a "sale" that never ends; the Sydney study calls this timed false reference pricing [37].

### VIP that sells status and fun, not power
**Game:** Adopt Me! ([45])
**Shows:** the reported VIP perks include access to a VIP Room and an exclusive limo.
**Why it works:** both perks are visible to other players and fun to show off; neither makes a free player's pets worse.
**Steal:** a VIP lounge and one showy VIP-only item other players can see (Rule 24).
**Avoid:** putting progression, rare spawns or exclusive resources inside the VIP area.

### A subscription that bundles VIP and a daily-use perk
**Game:** Adopt Me! ([44])
**Shows:** Pets Plus is a monthly subscription reported at $2.99 per month (varying by region) that includes VIP membership and lets players equip two pets at the same time.
**Why it works:** "two pets at once" is felt every minute of every session, so the monthly price keeps feeling worth it.
**Steal:** a subscription benefit used constantly, named clearly, with price and duration stated [14].
**Avoid:** a subscription whose only benefit is a one-time item; players cancel after the first month.

### A shop that lives in the menu, with currency and boosts side by side
**Game:** Blox Fruits ([40])
**Shows:** the wiki's Shop page lists Robux purchases such as money packs, fragment bundles and 2x EXP boosts in an in-game store reached through the GUI menu.
**Why it works:** one predictable place to buy, reachable from the main menu, holding the repeatable products engaged players want.
**Steal:** one shop entry point in the HUD, with currency packs and timed boosts as the repeatable core (Rules 14, 49).
**Avoid:** scattering buy prompts across the world with no central shop to compare value.

### A pass that sells information
**Game:** Blox Fruits ([42])
**Shows:** the Fruit Notifier pass tells holders the distance to newly spawned fruits, alongside passes like 2x Money.
**Why it works:** it sells time saved and a head start on a hunt the whole server joins; the fruit still has to be reached and claimed in play.
**Steal:** convenience passes that point the player toward play (finders, compasses, notifiers) rather than skipping it.
**Avoid:** an information perk so strong that free players never find anything; cap or delay it if spawns are contested.

### Gifting passes and permanent items
**Game:** Blox Fruits ([41])
**Shows:** the wiki describes gifting as a mechanic that lets players gift other players items like permanent fruits and gamepasses.
**Why it works:** gifting turns a purchase into a social act; friends who receive gifts feel invested in the game.
**Steal:** "Gift" versions of passes and cosmetics, delivered by the server to a validated recipient (Rule 28).
**Avoid:** gifting random or tradeable currency items, which invites scams and policy problems.

### A long ladder of passes
**Game:** Blox Fruits ([43])
**Shows:** a 2026 third-party guide counts 14 gamepasses in the Robux shop ranging from 200 to 3,000 Robux (counts and prices change; check the game).
**Why it works:** a mature game can carry many passes because players arrive at different stages and budgets; each pass has one clear job.
**Steal:** grow the pass ladder over updates, one well-understood perk per pass.
**Avoid:** launching with a dozen passes; start with 3-6 (Rule 15).

### A gift shop with Robux pricing and a same-server rule
**Game:** Grow a Garden ([46])
**Shows:** guides describe a Gift Shop where seeds can be gifted for Robux (not the in-game currency) by pressing a Gift icon and picking a friend's name, with both players in the same server.
**Why it works:** gifting in the same server is visible and immediate; the giver sees the thanks.
**Steal:** same-server gifting at launch, with a picker of present players and a celebration on delivery.
**Avoid:** gifts that disappear into an offline inbox with no confirmation.

### A rotating stock with a paid shortcut
**Game:** Grow a Garden ([47])
**Shows:** guides report the seed shop restocks on a five-minute cycle, and that Robux can buy any seed at any time.
**Why it works:** the free restock gives a reason to check back often; the paid path sells certainty to players who don't want to wait.
**Steal:** a short, frequent free rotation with an honest "Next restock 2:41" and a buy-now option beside it (Rule 31).
**Avoid:** long restock timers designed to sell skips; Roblox's docs warn players dislike appointment mechanics [7].

### A meta currency earned every run and sold too
**Game:** DOORS ([48])
**Shows:** the wiki says Knobs can be bought with Robux or obtained by ending a run in any way.
**Why it works:** every run pays something, even a failed one, so losing still moves the player forward; buying Knobs speeds up the same path.
**Steal:** a currency earned from every session outcome, also sold in packs (quantity ladder).
**Avoid:** a currency that only payers can get in useful amounts.

### A paid second chance
**Game:** DOORS ([49])
**Shows:** Revives are paid and bought with Robux (codes have also handed some out for free).
**Why it works:** a revive is sold at the moment of highest intent: deep in a run with friends.
**Steal:** a cheap, capped revive with a free respawn option beside it, and occasional free revives via codes or daily rewards (Rules 31-32).
**Avoid:** an unskippable revive card with a countdown over the death screen.

### What the top earners got wrong
**Game:** 15 top-earning Roblox games studied by the University of Sydney, October 2025 to February 2026 ([37][38][39])
**Shows:** the researchers found misleading, deceptive or unfair monetization in 14 of 15 games, including "daily discounts" that are always available, separate currencies that obscure real prices, near-miss visuals, countdown timers creating false urgency and opaque random rewards.
**Why it works (for them, short-term):** urgency and confusion push impulse spending.
**Steal:** nothing except the warning list; Kid Tester uses it as a checklist (Rule 45).
**Avoid:** every practice on that list. They cost trust, ratings and, increasingly, regulatory attention [27][38].

## By genre

### Price ladders by genre (rule of thumb; the owner sets prices)
| Genre | Impulse | Starter | Core passes | VIP | Top pack | Signature offers | Off-limits |
|---|---|---|---|---|---|---|---|
| Simulator | 25-49 boost or pack | 49-79 | 2x Coins 149-199, Auto-hatch 199-299, +pet slots 99-149 | 249-399 | 999-2,499 | timed boosts, server luck, egg packs with odds | Robux-only pets stronger than any earnable pet |
| Tycoon | 25-49 cash | 49-99 | 2x Cash 149-199, Auto-collect 99-149, extra floor 99 | 199-299 | 999 | "30 min of cash" packs scaled to income | buying the finished tycoon outright |
| Idle/incremental | 25-49 | 49-79 | 2x income 149-199, offline cap +4h 99, auto-buy 149 | 199-299 | 999 | time warps (hours of income) | offline caps tuned to sell extensions |
| Obby | 9-25 stage skip | 49 | speed/gravity coil 49-99, trails 49-149 | 99-199 | 249-499 | capped skips, trails, radio | skip-to-end pass; paid-only final stage |
| Roleplay/life sim | 25-49 | 79-99 | houses 149-399, vehicles 99-399, radio 99 | 299-499 | 499-999 | avatar items (40%) [31], premium homes | gating basic jobs or roles behind passes |
| Action/combat (PvE) | 25-49 | 79-99 | 2x XP 149-199, extra loadout 99 | 199-399 | 999 | revives, weapon skins | stat weapons usable in PvP |
| Battlegrounds | 25-49 emote | 79 | emote packs 49-149, skins 149-399 | 199-299 | 499-999 | kill effects, emotes, private servers | paid characters stronger than free ones |
| Survival | 15-49 revive | 79 | storage 99-149, 2x XP 149-199 | 199-299 | 499-999 | revives, base skins | paid weapons in PvP |
| Horror | 15-49 revive | 49-79 | lobby cosmetics 49-149, meta packs | 149-249 | 399-799 | capped revives [49], meta currency [48] | paying to skip the scary part, paid lore |
| Tower defense | 25-49 | 79-99 | 2x speed 99-149, +unit slot 199, auto-skip 99 | 249-399 | 999-1,999 | summons with odds, banners | Robux-only meta units |
| RNG/collection | 9-25 reroll or luck | 49-99 | quick roll 149, storage 99, auto-roll 199 | 249-499 | 999-2,499 | luck potions (adjusted odds shown) [26], server luck | hidden odds, near-miss reveals |
| Shooter | 25-49 | 79-99 | skins 99-399, season pass 299-499 | 199-299 | 999 | cosmetic skins, season track | guns with better stats |
| Racing | 25-49 | 79 | car packs 149-499 (sidegrades), garage slots 99, 2x cash 199 | 199-299 | 999 | paint, rims, neon | faster cars in ranked |
| Sports | 25-49 | 79 | kits 99-199, celebrations 49-99 | 199-299 | 499-999 | emotes, ball skins | stat boosts in matches |
| Party/social | 15-49 | 49 | emote packs 49-99, radio 99, lounge 199-299 | 199-399 | 499 | emotes, cosmetics, free private servers | locking minigames behind passes |
| Story/puzzle | 15-49 hint/skip | 49-79 | cosmetics 49-149, chapter cosmetics | 99-199 | 249-499 | hints (free hint after a few minutes stuck) | a paywall mid-chapter |
| Farming/fishing | 25-49 | 49-99 | extra plots 99-199, auto-sell 149, 2x sell 149-199 | 199-399 | 999-1,999 | buy-now restock [47], gifting [46], bait boosts | grow timers built to sell skips [7] |

### Genre notes
- **Simulator:** the shop is part of the loop. Sell multipliers and slots, and server luck boosts that make the whole server cheer. Every egg stand has an "Odds" button. Balance runs the fully-paid simulation (Rule 25). See [[Genre - Simulator]].
- **Tycoon:** pass pads in the world are the classic placement; each pad shows a card first, never a direct prompt (Rule 30). Cash packs scale with income, or they're worthless by hour two. See [[Genre - Tycoon]].
- **Idle and incremental:** sell offline-cap extensions and income multipliers as passes; sell "time warps" (2 h of income) as products. Never shrink the free offline cap to sell the paid one. See [[Genre - Idle and Incremental]].
- **Obby:** skips are the impulse product; cap them (rule of thumb: 3 per session) and price them per stage. The real money is cosmetics (trails, coils) that show off while jumping. See [[Genre - Obby]].
- **Roleplay and life sim:** status and self-expression sell: houses, cars, outfits, pets. Avatar item sales earn the experience 40% [31]. Free private servers keep friend groups ([[10 Retention and Social]]). See [[Genre - Roleplay and Life Sim]].
- **Action and combat:** PvE can sell XP and revives; PvP sells only cosmetics and loadout comfort (Rule 44). See [[Genre - Action and Combat]].
- **Battlegrounds:** cosmetics, emotes and kill effects; characters must be balanced whether bought or earned. See [[Genre - Battlegrounds]].
- **Survival:** storage, revives and cosmetics; keep raids and PvP fair. See [[Genre - Survival]].
- **Horror:** revives and lobby cosmetics; sell nothing that removes the tension the game is about. See [[Genre - Horror]].
- **Tower defense:** summons are paid random items: odds panel, policy gate, pity ([[03 Rarity and RNG]]). Speed passes are popular convenience. See [[Genre - Tower Defense]].
- **RNG and collection:** the riskiest genre for policy. Every roll bought with anything Robux-related shows odds; luck potions show adjusted odds [26]; restricted players get a direct-purchase path [28]. See [[Genre - RNG and Collection]].
- **Shooter:** skins and a season pass; never stats. See [[Genre - Shooter]].
- **Racing and vehicles:** cars as sidegrades in casual modes; ranked uses matched stats. See [[Genre - Racing and Vehicles]].
- **Sports:** celebrations, kits and ball skins; private servers for friend matches. See [[Genre - Sports]].
- **Party and social hangout:** emotes and cosmetics; never lock a minigame. See [[Genre - Party and Social Hangout]].
- **Story and puzzle:** hints and cosmetics; always a free hint after the player has been stuck a while (rule of thumb: 3 minutes). See [[Genre - Story and Puzzle]].
- **Farming and fishing:** restock shortcuts, plots and gifting; keep grow times short and the free restock frequent (Rule 12). See [[Genre - Farming and Fishing]].

## Luau

### Config with placeholder IDs
Agents can't create products or set Robux prices. The owner creates each pass and product in **Creator Hub > Creations > (experience) > Monetization > Passes / Developer Products** and pastes the IDs in. Merchant asks for this with `node studio/cli.mjs ask`, listing every item with its suggested price and config key. Until then the IDs stay `0` and code refuses to prompt.
```lua
-- In ReplicatedStorage/Shared/Config (the shared Config ModuleScript), the Monetization section. Data only.
-- TODO(owner): create each item on Creator Hub, set the price there, replace 0 with the real ID.
Config.Monetization = {
	GamePasses = { VIP = 0, DoubleCoins = 0, StarterPack = 0 },               -- suggested 299 / 149 / 79 R$
	Products = { CoinsSmall = 0, CoinsMedium = 0, CoinsLarge = 0, Revive = 0 }, -- suggested 25 / 99 / 399 / 15 R$
}
```
A fuller launch config adds boosts, server boosts, gifts, a subscription and offer rules. Still data only:
```lua
Config.Monetization = {
	GamePasses = { VIP = 0, DoubleCoins = 0, StarterPack = 0 },
	Products = {
		CoinsSmall = 0, CoinsMedium = 0, CoinsLarge = 0, Revive = 0,
		Boost2x30 = 0, ServerLuck15 = 0, GiftVIP = 0,
	},
	Subscriptions = { Plus = "" }, -- subscription IDs are strings; "" is the placeholder
	Boosts = { Coins2x = { Seconds = 1800, MaxQueuedSeconds = 4 * 3600 } },
	ServerBoosts = { Luck2x = { Seconds = 900, MaxQueuedSeconds = 2 * 3600 } },
	Gifts = { GiftVIP = { Grants = "VIP" } }, -- gift product key -> the pass key it gives
	Offers = { UnsolicitedCooldown = 12 * 60, FirstSessionQuiet = 3 * 60 },
	Sales = {}, -- [key] = { WasPrice = 149, StartsAt = <UTC>, EndsAt = <UTC> }
}
```
The `PlayerData` default template ([[13 Building It Right]]) must include `Receipts = {}`, `Purchases = {}`, `Boosts = {}`, `ServerBoostTokens = {}`, `GiftTokens = {}`, `Gifted = {}`, `StarterPackGranted = false`.

### Client prompt, called only from a buy button's `Activated`
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

### Live prices (client)
```lua
--!strict
-- StarterPlayerScripts/Client/PriceService (ModuleScript). Never shows a guessed number.
local MarketplaceService = game:GetService("MarketplaceService")
local cache: {[string]: number} = {}
local PriceService = {}

function PriceService.Get(id: number, infoType: Enum.InfoType): number?
	if id == 0 then return nil end
	local key = `{infoType.Name}:{id}`
	if cache[key] then return cache[key] end
	local ok, info = pcall(MarketplaceService.GetProductInfo, MarketplaceService, id, infoType)
	if ok and info and typeof(info.PriceInRobux) == "number" then
		cache[key] = info.PriceInRobux
		return info.PriceInRobux
	end
	return nil
end

function PriceService.Fill(label: TextLabel, id: number, infoType: Enum.InfoType)
	label.Text = "..."
	task.spawn(function()
		for _ = 1, 3 do
			local price = PriceService.Get(id, infoType)
			if price then label.Text = `R$ {price}`; return end
			task.wait(5)
		end
		label.Text = "Unavailable"
	end)
end

-- "Worth" of a bundle at this player's live prices; nil means hide the line.
-- parts: { { Id = number, InfoType = Enum.InfoType, Count = number } }
function PriceService.Worth(parts: {{Id: number, InfoType: Enum.InfoType, Count: number}}): number?
	local total = 0
	for _, part in parts do
		local price = PriceService.Get(part.Id, part.InfoType)
		if not price then return nil end
		total += price * part.Count
	end
	return total
end

return PriceService
```

### Game pass ownership (server)
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
On join, once the save has loaded, call `applyPassPerks` for every pass that `ownsPass` confirms or that the save lists in `Gifted`. Perks set a `Pass_<Key>` attribute so gameplay code can read ownership without yielding:
```lua
local passKeyById: {[number]: string} = {}
for key, id in Config.Monetization.GamePasses do
	if id ~= 0 then passKeyById[id] = key end
end

local function applyPerksForKey(player: Player, key: string)
	player:SetAttribute(`Pass_{key}`, true) -- gameplay reads this; it never yields
	if key == "StarterPack" then
		local data = PlayerData.Get(player)
		if data and not data.StarterPackGranted then -- consumable parts exactly once
			data.StarterPackGranted = true
			data.Coins += 400
			data.Boosts.Coins2x = (data.Boosts.Coins2x or 0) + 3600
			data.Cosmetics.LavaTrail = true
			task.defer(PlayerData.SaveNow, player)
		end
	end
end

local function applyPassPerks(player: Player, passId: number)
	local key = passKeyById[passId]
	if key then applyPerksForKey(player, key) end
end

local function applyAllPasses(player: Player) -- call after the save has loaded
	local data = PlayerData.Get(player)
	for key, id in Config.Monetization.GamePasses do
		if (data and data.Gifted[key]) or ownsPass(player, id) then applyPerksForKey(player, key) end
	end
end
```
Order inside `ServerScriptService/Services/PassService`: `passKeyById`, `applyPerksForKey` and `applyPassPerks` first, then the ownership code above (so the connection can call `applyPassPerks`), then `applyAllPasses`. Export `PassService.applyPerksForKey = applyPerksForKey` and `PassService.applyAllPasses = applyAllPasses`; GiftService uses the first, the join flow the second. If `ownsPass` failed on join (it returned false without caching), schedule one retry: `task.delay(20, applyAllPasses, player)`.

### ProcessReceipt (server, the only correct shape)
Rules: set it **once**, in **one** server module. It must be **idempotent**: the same `PurchaseId` never grants twice. Record the `PurchaseId` **in the same save document** as the grant, and return `PurchaseGranted` **only after that save succeeded**. Return `NotProcessedYet` in every other case, and Roblox will call it again later (for example on the player's next join) [1]. `PlayerData` is described in [[13 Building It Right]].
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

**Extending the grant table.** New products add one entry each; still save mutations only:
```lua
	Boost2x30 = function(data) data.Boosts.Coins2x = (data.Boosts.Coins2x or 0) + 1800 end,
	ServerLuck15 = function(data) data.ServerBoostTokens.Luck2x = (data.ServerBoostTokens.Luck2x or 0) + 1 end,
	GiftVIP = function(data) data.GiftTokens.GiftVIP = (data.GiftTokens.GiftVIP or 0) + 1 end,
```
**After-grant effects.** Where the comment says "now fire effects or UI remotes", Merchant may add a deferred hook. Hooks only *spend* tokens or show UI, so a hook that runs twice (if Roblox redelivers an already-saved receipt) finds no token and does nothing:
```lua
local keyById: {[number]: string} = {}
for key, id in Config.Monetization.Products do if id ~= 0 then keyById[id] = key end end

local afterGrant: {[string]: (player: Player) -> ()} = {
	ServerLuck15 = function(player) ServerBoostService.UseToken(player, "Luck2x") end,
	GiftVIP = function(player) GiftService.SendPending(player, "GiftVIP") end,
}
local function onGranted(player: Player, productId: number)
	local key = keyById[productId]
	local hook = key and afterGrant[key]
	if hook then hook(player) end
	ReplicatedStorage.Remotes.PurchaseToast:FireClient(player, key)
end

-- in ProcessReceipt, replacing the final success branch:
	if PlayerData.SaveNow(player) then
		task.defer(onGranted, player, receipt.ProductId)
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
```

### Personal timed boosts (server)
```lua
--!strict
-- ServerScriptService/Services/BoostService (ModuleScript). Boosts tick only while the player is here.
local Players = game:GetService("Players")
local ServerScriptService = game:GetService("ServerScriptService")
local PlayerData = require(ServerScriptService.Services.PlayerData)
local BoostService = {}

function BoostService.Start() -- called once by the server entry script
	task.spawn(function()
		while true do
			local dt = task.wait(1)
			for _, player in Players:GetPlayers() do
				local data = PlayerData.Get(player)
				if data then
					for key, remaining in data.Boosts do
						local left = remaining - dt
						data.Boosts[key] = if left > 0 then left else nil
						player:SetAttribute(`Boost_{key}`, if left > 0 then math.ceil(left) else nil) -- HUD reads it
					end
				end
			end
		end
	end)
end

function BoostService.IsActive(player: Player, key: string): boolean
	local data = PlayerData.Get(player)
	return data ~= nil and (data.Boosts[key] or 0) > 0
end

-- Used by the server before the client may show an enabled buy button (cap at the button, never in the grant).
function BoostService.CanQueue(player: Player, key: string, seconds: number, maxQueued: number): boolean
	local data = PlayerData.Get(player)
	return data ~= nil and (data.Boosts[key] or 0) + seconds <= maxQueued
end

-- Additive stacking with a cap (Rule 25). Reads attributes, never yields.
function BoostService.CoinMultiplier(player: Player): number
	local m = 1
	if player:GetAttribute("Pass_DoubleCoins") then m += 1 end
	if BoostService.IsActive(player, "Coins2x") then m += 1 end
	if workspace:GetAttribute("ServerBoost_Coins2x") then m += 1 end
	if workspace:GetAttribute("Event_DoubleCoins") then m += 1 end
	return math.min(m, 5)
end

return BoostService
```

### Server boosts (server)
```lua
--!strict
-- ServerScriptService/Services/ServerBoostService (ModuleScript)
local Players = game:GetService("Players")
local ReplicatedStorage, ServerScriptService = game:GetService("ReplicatedStorage"), game:GetService("ServerScriptService")
local PlayerData = require(ServerScriptService.Services.PlayerData)
local Config = require(ReplicatedStorage.Shared.Config)

type Window = { buyerId: number, buyerName: string, seconds: number }
local queues: {[string]: {Window}} = {} -- key -> windows; [1] is the running one
local runningLeft: {[string]: number} = {}
local ServerBoostService = {}

local function publish(key: string)
	local q = queues[key]
	local total = 0
	if q and q[1] then
		total = runningLeft[key] or q[1].seconds
		for i = 2, #q do total += q[i].seconds end
	end
	workspace:SetAttribute(`ServerBoost_{key}`, if total > 0 then math.ceil(total) else nil)
	workspace:SetAttribute(`ServerBoost_{key}_By`, if q and q[1] then q[1].buyerName else nil)
end

function ServerBoostService.QueuedSeconds(key: string): number
	return workspace:GetAttribute(`ServerBoost_{key}`) or 0
end

-- Spends one token and queues a window. No token means no-op, so a repeated call is safe.
function ServerBoostService.UseToken(player: Player, key: string): boolean
	local data = PlayerData.Get(player)
	local def = Config.Monetization.ServerBoosts[key]
	if not data or not def or (data.ServerBoostTokens[key] or 0) < 1 then return false end
	data.ServerBoostTokens[key] -= 1
	local q = queues[key] or {}
	queues[key] = q
	table.insert(q, { buyerId = player.UserId, buyerName = player.DisplayName, seconds = def.Seconds })
	if #q == 1 then runningLeft[key] = def.Seconds end
	publish(key)
	ReplicatedStorage.Remotes.ServerBoostStarted:FireAllClients(key, player.DisplayName)
	return true
end

function ServerBoostService.Start()
	task.spawn(function()
		while true do
			local dt = task.wait(1)
			for key, q in queues do
				if q[1] then
					runningLeft[key] = (runningLeft[key] or q[1].seconds) - dt
					if runningLeft[key] <= 0 then
						table.remove(q, 1)
						runningLeft[key] = if q[1] then q[1].seconds else nil
					end
					publish(key)
				end
			end
		end
	end)
	game:BindToClose(function() -- return tokens for unused time to buyers still here
		for key, q in queues do
			for i, w in q do
				local unused = if i == 1 then (runningLeft[key] or 0) else w.seconds
				local buyer = Players:GetPlayerByUserId(w.buyerId)
				local data = buyer and PlayerData.Get(buyer)
				if buyer and data and unused > w.seconds / 2 then
					data.ServerBoostTokens[key] = (data.ServerBoostTokens[key] or 0) + 1
					PlayerData.SaveNow(buyer) -- don't rely on another BindToClose running later
				end
			end
		end
	end)
end

return ServerBoostService
```
The buy button checks `QueuedSeconds(key) + def.Seconds <= def.MaxQueuedSeconds` (through a server RemoteFunction) before enabling. Tokens left in a save (from shutdown) appear in the Boosts tab as "Use server boost (1)".

### Gifts (server)
```lua
--!strict
-- ServerScriptService/Services/GiftService (ModuleScript). Same-server gifting.
local Players = game:GetService("Players")
local ReplicatedStorage, ServerScriptService = game:GetService("ReplicatedStorage"), game:GetService("ServerScriptService")
local PlayerData = require(ServerScriptService.Services.PlayerData)
local PolicyCache = require(ServerScriptService.Services.PolicyCache)
local PassService = require(ServerScriptService.Services.PassService) -- exposes applyPerksForKey
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes

local TARGET_TTL = 300 -- seconds a chosen recipient stays locked
local pending: {[Player]: {giftKey: string, toUserId: number, at: number}} = {}
local GiftService = {}

local function canReceive(recipient: Player, passKey: string): boolean
	return recipient:GetAttribute(`Pass_{passKey}`) ~= true
end

-- RemoteFunction, invoked by the gift picker before the product prompt. Returns ok, reason.
Remotes.SetGiftTarget.OnServerInvoke = function(player: Player, giftKey: unknown, toUserId: unknown)
	if typeof(giftKey) ~= "string" or typeof(toUserId) ~= "number" then return false, "bad" end
	local def = Config.Monetization.Gifts[giftKey]
	local recipient = Players:GetPlayerByUserId(toUserId)
	if not def or not recipient or recipient == player then return false, "unavailable" end
	if not (PolicyCache.TradingAllowed(player) and PolicyCache.TradingAllowed(recipient)) then return false, "policy" end
	if not canReceive(recipient, def.Grants) then return false, "owned" end
	pending[player] = { giftKey = giftKey, toUserId = toUserId, at = os.clock() }
	return true, "ok"
end

-- Moves one token from buyer to recipient. No Robux involved, so it may yield.
function GiftService.Send(buyer: Player, giftKey: string, toUserId: number): boolean
	local def = Config.Monetization.Gifts[giftKey]
	local recipient = Players:GetPlayerByUserId(toUserId)
	local buyerData = PlayerData.Get(buyer)
	local recData = recipient and PlayerData.Get(recipient)
	if not def or not recipient or not buyerData or not recData then return false end
	if (buyerData.GiftTokens[giftKey] or 0) < 1 or not canReceive(recipient, def.Grants) then return false end
	buyerData.GiftTokens[giftKey] -= 1
	recData.Gifted[def.Grants] = { From = buyer.UserId, At = os.time() }
	if not PlayerData.SaveNow(recipient) then -- roll back so nothing is lost
		recData.Gifted[def.Grants] = nil
		buyerData.GiftTokens[giftKey] += 1
		return false
	end
	PlayerData.SaveNow(buyer)
	PassService.applyPerksForKey(recipient, def.Grants)
	Remotes.Toast:FireClient(buyer, `Gift delivered to {recipient.DisplayName}!`)
	Remotes.Toast:FireClient(recipient, `{buyer.DisplayName} gifted you {def.Grants}!`)
	return true
end

-- After-grant hook for gift products.
function GiftService.SendPending(buyer: Player, giftKey: string)
	local p = pending[buyer]
	pending[buyer] = nil
	if p and p.giftKey == giftKey and os.clock() - p.at <= TARGET_TTL and GiftService.Send(buyer, giftKey, p.toUserId) then
		return
	end
	Remotes.Toast:FireClient(buyer, "Your gift is saved in Gifts to send.")
end

Players.PlayerRemoving:Connect(function(player) pending[player] = nil end)
return GiftService
```
If the recipient's save succeeds and the buyer's doesn't, the buyer may get the token back after a crash: the error favors the player and costs no Robux. Log `GiftSent` from `Send`.

### Subscriptions (server)
```lua
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local SUB_ID: string = Config.Monetization.Subscriptions.Plus

local function refreshPlus(player: Player)
	if SUB_ID == "" then return end -- placeholder until the owner creates it
	local ok, status = pcall(MarketplaceService.GetUserSubscriptionStatusAsync, MarketplaceService, player, SUB_ID)
	if not ok then warn(`[Subs] status check failed: {status}`); return end -- keep the last known state
	player:SetAttribute("Sub_Plus", status.IsSubscribed == true)
end
Players.PlayerAdded:Connect(refreshPlus)
Players.UserSubscriptionStatusChanged:Connect(function(player: Player, subscriptionId: string)
	if subscriptionId == SUB_ID then refreshPlus(player) end
end)

local function grantPlusDaily(player: Player, data) -- call when the save loads and on a 60 s tick
	if player:GetAttribute("Sub_Plus") ~= true then return end
	local today = math.floor(os.time() / 86400) -- UTC day index
	if data.Plus.LastDailyDay == today then return end
	data.Plus.LastDailyDay = today
	data.Coins += 500 -- Balance sets the amount
end
```
The buy button prompts with `MarketplaceService:PromptSubscriptionPurchase` as shown in the subscriptions guide [14]; the card text states the price and "per month".

### Policy cache (server)
```lua
--!strict
-- ServerScriptService/Services/PolicyCache (ModuleScript). One call per player, cached [28][29].
local Players = game:GetService("Players")
local PolicyService = game:GetService("PolicyService")
type Policy = { RandomRestricted: boolean, TradingAllowed: boolean }
local SAFE: Policy = { RandomRestricted = true, TradingAllowed = false } -- used when the check fails
local cache: {[Player]: Policy} = {}
local PolicyCache = {}

local function load(player: Player)
	for attempt = 1, 2 do
		local ok, info = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
		if player.Parent == nil then return end -- left while we waited
		if ok and info then
			cache[player] = {
				RandomRestricted = info.ArePaidRandomItemsRestricted == true,
				TradingAllowed = info.IsPaidItemTradingAllowed == true,
			}
			break
		end
		if attempt == 1 then task.wait(10) end
	end
	-- The UI reads this attribute to hide buttons; the server still re-checks on every purchase path.
	player:SetAttribute("PaidRandomAllowed", not (cache[player] or SAFE).RandomRestricted)
end

Players.PlayerAdded:Connect(load)
Players.PlayerRemoving:Connect(function(player) cache[player] = nil end)
function PolicyCache.RandomAllowed(player: Player): boolean return not (cache[player] or SAFE).RandomRestricted end
function PolicyCache.TradingAllowed(player: Player): boolean return (cache[player] or SAFE).TradingAllowed end
return PolicyCache
```

### Odds that add up to exactly 100% (shared)
```lua
--!strict
-- ReplicatedStorage/Shared/OddsDisplay (ModuleScript). Pure: build the panel from the server's weight table.
local UNITS = 1_000_000 -- 100.0000% in steps of 0.0001%
local OddsDisplay = {}

function OddsDisplay.Percentages(weights: {[string]: number}): {[string]: number}
	local total = 0
	for _, w in weights do total += w end
	assert(total > 0, "empty odds table")
	local floors: {[string]: number} = {}
	local rest: {{id: string, r: number}} = {}
	local used = 0
	for id, w in weights do
		local exact = w / total * UNITS
		local f = math.floor(exact)
		floors[id] = f
		used += f
		table.insert(rest, { id = id, r = exact - f })
	end
	-- Largest remainder: hand the leftover units to the biggest fractions so the sum is exact.
	table.sort(rest, function(a, b) return if a.r == b.r then a.id < b.id else a.r > b.r end)
	for i = 1, UNITS - used do floors[rest[i].id] += 1 end
	local out: {[string]: number} = {}
	for id, f in floors do
		if f == 0 then warn(`[Odds] {id} rounds to 0%; also show it as "1 in N"`) end
		out[id] = f / 10_000 -- a percentage with 4 decimals
	end
	return out
end

function OddsDisplay.Format(pct: number): string
	local s = string.format("%.4f", pct):gsub("0+$", ""):gsub("%.$", "")
	return `{s}%`
end

return OddsDisplay
```
With a luck boost active, build a second table from the boosted weights the server would use and show it under "With my boosts" [26].

### Offer cooldowns (client)
```lua
--!strict
-- StarterPlayerScripts/Client/OfferManager (ModuleScript). Decides if an unsolicited card may show.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local OfferManager = {}
local sessionStart = os.clock()
local lastUnsolicited = -math.huge
local declined: {[string]: boolean} = {}
local firstSession = true -- set from the save's SessionCount when it arrives

function OfferManager.SetFirstSession(v: boolean) firstSession = v end

function OfferManager.CanShow(offerKey: string, inCombat: boolean, inTutorial: boolean): boolean
	local cfg = Config.Monetization.Offers
	if declined[offerKey] or inCombat or inTutorial then return false end
	if firstSession and os.clock() - sessionStart < cfg.FirstSessionQuiet then return false end
	return os.clock() - lastUnsolicited >= cfg.UnsolicitedCooldown
end

function OfferManager.MarkShown() lastUnsolicited = os.clock() end
function OfferManager.MarkDeclined(offerKey: string) declined[offerKey] = true end -- silent for this session
return OfferManager
```

### VIP chat tag (client) and overhead tag (server)
```lua
-- StarterPlayerScripts/Client/ChatTags (LocalScript)
local Players = game:GetService("Players")
local TextChatService = game:GetService("TextChatService")
TextChatService.OnIncomingMessage = function(message: TextChatMessage)
	local props = Instance.new("TextChatMessageProperties")
	local source = message.TextSource
	local player = source and Players:GetPlayerByUserId(source.UserId)
	if player and player:GetAttribute("Pass_VIP") then
		props.PrefixText = `<font color="#FFD54A">[VIP]</font> {message.PrefixText}`
	end
	return props
end
```
```lua
-- Server: call from CharacterAdded when Pass_VIP is true.
local function addVipTag(character: Model)
	local head = character:WaitForChild("Head", 5)
	if not head then return end
	local gui = Instance.new("BillboardGui")
	gui.Name = "VipTag"
	gui.Size = UDim2.fromOffset(120, 32)
	gui.StudsOffset = Vector3.new(0, 2.6, 0)
	gui.MaxDistance = 60
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = "VIP"
	label.Font = Enum.Font.GothamBlack
	label.TextScaled = true
	label.TextColor3 = Color3.fromRGB(255, 213, 74)
	label.TextStrokeTransparency = 0.2
	label.Parent = gui
	gui.Parent = head -- parent last
end
```

### Quantity-limited item bought with earned currency (server)
```lua
local DataStoreService = game:GetService("DataStoreService")
local stockStore = DataStoreService:GetDataStore("LimitedStock_v1")
local busy: {[Player]: boolean} = {}

local function claimSerial(itemKey: string, cap: number): number?
	local serial: number? = nil
	local ok, err = pcall(function()
		stockStore:UpdateAsync(itemKey, function(sold: number?)
			local n = sold or 0
			if n >= cap then serial = nil; return nil end -- returning nil cancels the write
			serial = n + 1
			return n + 1
		end)
	end)
	if not ok then warn(`[Limited] claim failed: {err}`); return nil end
	return serial
end

local function buyLimited(player: Player, itemKey: string)
	local data = PlayerData.Get(player)
	local def = Config.Limiteds[itemKey]
	if busy[player] or not data or not def or os.time() > def.EndsAt or data.Owned[itemKey] then return end
	if data.Gems < def.Price then return end
	busy[player] = true
	data.Gems -= def.Price -- reserve first so a double tap can't spend twice during the yield
	local serial = claimSerial(itemKey, def.Stock)
	if serial then
		data.Owned[itemKey] = { Serial = serial, At = os.time() }
	else
		data.Gems += def.Price -- sold out or failed: refund
	end
	busy[player] = nil
end
```
Robux-priced limited items are time-limited only (Rule 34); quantity limits on Robux items belong to UGC Limiteds, where Roblox manages stock [31].

### Shop funnel and IAP logging (server)
```lua
local AnalyticsService = game:GetService("AnalyticsService")
local HttpService = game:GetService("HttpService")
local STEPS = { Opened = 1, ViewedItem = 2, TappedBuy = 3, Granted = 4 }
local funnelId: {[Player]: string} = {}
local lastStep: {[Player]: number} = {}

ReplicatedStorage.Remotes.ShopStep.OnServerEvent:Connect(function(player: Player, stepName: unknown)
	if typeof(stepName) ~= "string" or STEPS[stepName] == nil or stepName == "Granted" then return end
	if os.clock() - (lastStep[player] or 0) < 1 then return end -- rate limit
	lastStep[player] = os.clock()
	if stepName == "Opened" then funnelId[player] = HttpService:GenerateGUID(false) end
	local id = funnelId[player]
	if id then AnalyticsService:LogFunnelStepEvent(player, "ShopFunnel", id, STEPS[stepName], stepName) end
end)

-- In onGranted (after the save succeeded):
local function logGrant(player: Player, key: string, currency: string, amount: number, balance: number)
	local id = funnelId[player]
	if id then AnalyticsService:LogFunnelStepEvent(player, "ShopFunnel", id, STEPS.Granted, "Granted") end
	AnalyticsService:LogEconomyEvent(player, Enum.AnalyticsEconomyFlowType.Source, currency, amount, balance,
		Enum.AnalyticsEconomyTransactionType.IAP.Name, key)
end
```

## Checklist
- [ ] Every pass and product ID lives in `Config.Monetization`; placeholder `0`s (and `""` for subscriptions) refuse to prompt and warn in Output.
- [ ] A search of the place finds exactly one `ProcessReceipt` assignment, in `ReceiptService`.
- [ ] `ProcessReceipt` records `PurchaseId` in the player save and returns `PurchaseGranted` only after `SaveNow` succeeds.
- [ ] Every product key has a grant handler; grants only mutate the save; an unknown `ProductId` returns `NotProcessedYet` and warns.
- [ ] A Studio test purchase of each product grants exactly once and survives a rejoin; a forced save failure retries without a double grant.
- [ ] Pass perks apply on join (pcall'd `UserOwnsGamePassAsync`, failures not cached, one retry) and mid-session.
- [ ] Displayed prices come from `GetProductInfo`; no digits after "R$" are hardcoded in StarterGui.
- [ ] Each tab of the shop fits on a phone without horizontal scrolling; the close button is 44 px or larger, inside the safe area.
- [ ] No purchase prompt opens without a tap on a buy button; no offer appears before minute 3 of a first session.
- [ ] Unsolicited offer cards share a 10-15 minute cooldown, and "No thanks" silences that offer for the session.
- [ ] Every paid option with a free alternative shows both at equal size.
- [ ] The starter pack is a pass, grants its consumables once (`StarterPackGranted`), has no timer, and its "Worth" line is computed from live prices.
- [ ] Quantity ladder bonuses are true arithmetic from the smallest pack's rate.
- [ ] No struck-through price appears outside an active `Config.Sales` window with a live price below `WasPrice`.
- [ ] Timed boosts tick only while the player is present and resume after a rejoin with the same time left.
- [ ] Server boosts credit the buyer, reach late joiners, and return tokens on shutdown for unused windows.
- [ ] Gifts validate the recipient on the server before the prompt, deliver via token, and land in "Gifts to send" when the recipient left.
- [ ] Every paid random item has an "Odds" button generated from the server table; percentages sum to 100; boosted odds are shown when boosts are active.
- [ ] Players with `ArePaidRandomItemsRestricted` (or a failed policy check) see no paid random purchase and get an alternative.
- [ ] Paid-item gifting or trading is blocked when `IsPaidItemTradingAllowed` is false for either player.
- [ ] Rewarded ad buttons appear only after a successful availability check, give a fixed reward, and respect the daily cap.
- [ ] Multipliers stack additively and are capped; Balance's fully-paid simulation is in `sim/` and passes.
- [ ] Kid Tester's dark-pattern pass found no fake timers, fake scarcity, near-miss reveals, guilt text or stacked prompts.
- [ ] The shop funnel and IAP economy events fire in a Studio test with no errors.
- [ ] `decisions.md` lists every price suggestion and the open owner `ask`.

## Common mistakes
- Granting a developer product and returning `PurchaseGranted` before saving: the player loses the purchase if the server dies.
- Not recording `PurchaseId`, so a retried receipt grants twice.
- Setting `ProcessReceipt` in two scripts. Only one callback exists, and the last assignment wins [4].
- Mixing `BindReceiptHandler` and `ProcessReceipt` for the same products without a plan [2].
- Granting in `PromptProductPurchaseFinished`, or trusting the client to say "I bought it".
- Caching a failed `UserOwnsGamePassAsync` as "not owned" for the whole session.
- Hardcoded prices in UI that drift from Creator Hub, regional prices and price tests [9][11].
- A wall of popups on join, which is the fastest way to lose a new player ([[01 The First Five Minutes]]).
- A "sale" that never ends, or a "was" price that was never charged [37].
- "+500% value" ribbons that aren't arithmetic.
- Timed boosts that count down while the player is offline.
- Clamping a paid boost at a cap inside the grant, so the player loses paid time.
- Server boosts stored only in memory, lost on shutdown with time left.
- Gifts that grant the buyer, or recipients named by the client after payment.
- Odds typed by hand that don't match the server's weights, or that don't add up to 100% [26].
- Luck potions sold without showing the boosted odds [26].
- Calling `GetPolicyInfoForPlayerAsync` on every shop open and hitting its limit [28].
- Rewarded ad buttons shown to players who can't watch ads, or ad rewards that are random [22].
- Stat weapons for Robux in PvP.
- Long timers designed to sell skips [7].
- Multiplicative stacking that lets payers finish the game in an hour.
- A starter pack that can be bought twice because it's a developer product without a one-time check.
- Building physical commerce or Robux transfers without the owner's decision [30][33].

## References
[1] Developer products — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt is set once by one server script; return PurchaseGranted after granting and NotProcessedYet to retry; test before enabling sales.
[2] MarketplaceService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — BindReceiptHandler as a newer alternative; bound handlers take precedence and unmatched receipts fall through to ProcessReceipt.
[3] ReceiptDecision enum — https://robloxapi.github.io/ref/enum/ReceiptDecision.html — BindReceiptHandler callbacks return NotProcessedYet (redelivered) or Processed.
[4] Devproducts not working (DevForum) — https://devforum.roblox.com/t/devproducts-not-working/3185811 — when several scripts set ProcessReceipt, only the most recent assignment works.
[5] Passes — https://create.roblox.com/docs/production/monetization/passes — passes are a one-time fee; check UserOwnsGamePassAsync in a pcall; developers must assign privileges themselves.
[6] GamePassService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/GamePassService.md — legacy PlayerHasPass uses asset IDs; new passes only have pass IDs; results may be cached.
[7] Monetization (Creator Docs) — https://create.roblox.com/docs/en-us/production/monetization — appointment mechanics are unpopular; tourists vs locals; transparency on chance; downvotes; developer products monetize better; store purchase data yourself.
[8] Monetize your experiences — https://create.roblox.com/docs/monetize-experiences — overview of Roblox monetization options and tools.
[9] Price optimization — https://create.roblox.com/docs/production/monetization/price-optimization.md — tests show prices on rejoin, results after about 3 weeks; Dynamic Price Check finds hardcoded prices.
[10] Price Optimization Now Includes Item-Level Price Recommendations (DevForum) — https://devforum.roblox.com/t/price-optimization-now-includes-item-level-price-recommendations/3894427 — item-level recommendations added to price optimization.
[11] Regional pricing — https://create.roblox.com/docs/en-us/production/monetization/regional-pricing — on by default for managed-price passes; location signals; products need scripted prices; GetUsersPriceLevelsAsync for transfers.
[12] Introducing Regional Pricing for Developer Products (DevForum) — https://devforum.roblox.com/t/introducing-regional-pricing-for-developer-products/3971235 — opt-in with a default price; 1,000 US / 700 Brazil / 500 India example.
[13] Roblox launches regional pricing for in-experience items (Newsroom, April 2025) — https://about.roblox.com/es/newsroom/2025/04/roblox-launches-regional-pricing-for-in-experience-items — launch announcement.
[14] Subscriptions — https://create.roblox.com/docs/production/monetization/subscriptions — monthly auto-renewing; local currency or Robux; paid out in Robux; all owned at once; clear names, price and duration; regional availability.
[15] Subscriptions within experiences: now available for users to purchase (DevForum) — https://devforum.roblox.com/t/2702306 — subscriptions opened to buyers.
[16] Engagement-based payouts — https://create.roblox.com/docs/production/monetization/engagement-based-payouts — deprecated effective July 24, 2025 and replaced by Creator Rewards.
[17] Creator Rewards — https://create.roblox.com/docs/creator-rewards — daily engagement (Active Spenders, first three experiences, 10 minutes) and audience expansion (35% of first $100 via links, 100+ DAU); prohibited behavior.
[18] Creator Rewards (Roblox Wiki) — https://roblox.fandom.com/wiki/Creator_Rewards — started July 24, 2025, replacing Engagement-Based Payouts and Creator Affiliate; audience expansion needs ID verification and DevEx.
[19] Roblox's new Creator Rewards encourage engagement and retention (Tubefilter) — https://www.tubefilter.com/?p=186987 — Active Spenders defined as $9.99+ spent in the past 60 days.
[20] Roblox To Reward Creators For Attracting Players (MediaPost) — https://www.mediapost.com/publications/article/406941/roblox-to-reward-creators-for-attracting-players.html — payouts uncapped; amounts may change.
[21] Rewarded video ads — https://create.roblox.com/docs/production/promotion/rewarded-video-ads — creator 13+, ID-verified, public experience, 2,000+ unique monthly visitors.
[22] Ad integrations — https://create.roblox.com/docs/production/promotion/ad-integrations — rewarded video ads only for users 13+; rewards can't be randomized items.
[23] More Creators Can Now Use Rewarded Video Ads (DevForum, August 2025) — https://devforum.roblox.com/t/more-creators-can-now-use-rewarded-video-ads/3838678 — earlier self-service bar: 100K+ average DAU, minimal or mild maturity, good standing.
[24] Rewarded video ads return ExperienceIneligible (DevForum) — https://devforum.roblox.com/t/rewarded-video-ads-cannot-be-shown-in-my-live-experience-the-api-returns-experienceineligible-but-the-creator-hub-says-it-is-eligible/4763102 — the API can report ineligible while Creator Hub says eligible.
[25] Immersive ads — https://create.roblox.com/docs/en-us/production/monetization/immersive-ads — public experience, 13+ owner, ID verification with 2FA, Maturity and Compliance Questionnaire; eligibility is ongoing.
[26] Paid random items — https://create.roblox.com/docs/production/monetization/paid-random-items — odds before purchase, indirect purchases included, luck items show adjusted odds, percentages sum to 100, labeled Info/Details pop-up.
[27] Korea's loot box rules push Roblox to disclose item odds worldwide (Tech Times, June 2026) — https://www.techtimes.com/articles/319148/20260626/koreas-loot-box-rules-push-roblox-disclose-item-odds-worldwide.htm — disclosure applied globally; tools to block or replace random purchases.
[28] PolicyService (engine reference) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md — GetPolicyInfoForPlayerAsync fields such as ArePaidRandomItemsRestricted; yields; rate cap.
[29] Policy Info For Player (DevForum) — https://devforum.roblox.com/t/policy-info-for-player/1926774 — pcall the call and cache it on join.
[30] Robux transfers — https://create.roblox.com/docs/en-us/production/monetization/robux-transfers — PromptRobuxTransferAsync and BindReceiptHandler; the game earns 10% of Robux sent.
[31] Avatar items — https://create.roblox.com/docs/production/monetization/avatar-items — in-experience split 30% creator / 40% experience owner / 30% platform, also for Limited original sales; linking steps.
[32] Monetize avatar — https://create.roblox.com/docs/monetize-avatar — selling avatar items in experiences via the Avatar Inspect Menu or UGC homestore templates.
[33] Commerce products — https://create.roblox.com/docs/production/monetization/commerce-products — selling physical products in experiences.
[34] Roblox now lets creators sell physical products within their experiences (TechCrunch, May 2025) — https://techcrunch.com/2025/05/15/roblox-now-lets-creators-sell-physical-products-within-their-experiences — launch coverage.
[35] Private servers — https://create.roblox.com/docs/production/monetization/private-servers — free or monthly Robux fee; experience must be public; not with paid access.
[36] Private/VIP Servers FAQ (Roblox Help) — https://en.help.roblox.com/hc/articles/205345050 — prices set by the creator; initial charge then monthly.
[37] Inside the pay-to-play world of Roblox targeting children (University of Sydney, May 2026) — https://www.sydney.edu.au/news-opinion/news/2026/05/17/inside-the-pay-to-play-world-of-roblox-targeting-children-.html — deceptive monetization in 14 of 15 games; timed false reference pricing.
[38] Misleading and Deceptive Monetisation in Roblox (report, University of Sydney) — https://ses.library.usyd.edu.au/handle/2123/35033 — the March 2026 report on 15 top-earning games and fourteen practices.
[39] Roblox sucking up money from young players: study (ACS Information Age, 2026) — https://ia.acs.org.au/article/2026/roblox-sucking-up-money-from-young-players--study.html — obscured pricing through currencies, near-miss visuals, false-urgency countdowns.
[40] Shop (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Shop — Robux money packs, fragments and 2x EXP in a shop reached from the GUI menu.
[41] Gifting (Blox Fruits Wiki) — https://blox-fruits.fandom.com/wiki/Gifting — players can gift permanent fruits and gamepasses.
[42] Everything you should know about gamepasses in Blox Fruits (Sportskeeda) — https://www.sportskeeda.com/roblox-news/everything-know-gamepasses-roblox-blox-fruits — 2x Money, Dark Blade and Fruit Notifier passes.
[43] Blox Fruits game pass tier list 2026 (rblxguide) — https://rblxguide.com/games/blox-fruits/updates/blox-fruits-game-pass-tier-list-2026 — third-party count of 14 passes from 200 to 3,000 Robux.
[44] Adopt Me Pets Plus subscription (Sportskeeda) — https://www.sportskeeda.com/roblox-news/adopt-me-pets-plus-subscription-benefits-content-price — $2.99/month varying by region; includes VIP; two pets equipped.
[45] Exploring gamepasses in Adopt Me (Sportskeeda) — https://sportskeeda.com/roblox-news/exploring-gamepasses-roblox-adopt-me — VIP at 600 Robux vs 750 original; VIP Room and exclusive limo.
[46] Can You Gift Seeds in Grow a Garden? (Deltia's Gaming) — https://deltiasgaming.com/?p=239851 — Gift Shop costs Robux; pick a friend; same server.
[47] Grow a Garden Seed Shop and Gear Shop Stock Explained (Deltia's Gaming) — https://deltiasgaming.com/?p=207402 — five-minute restock; Robux can buy any seed any time.
[48] Knobs (DOORS Wiki) — https://doors-game.fandom.com/wiki/Knobs — Knobs bought with Robux or earned by ending a run.
[49] Roblox Doors codes (Sportskeeda) — https://sportskeeda.com/roblox-news/doors-codes — Revives are paid and bought with Robux; codes give free items.
[50] Best approach for a scalable gifting system with Developer Products (DevForum) — https://devforum.roblox.com/t/best-approach-for-a-scalable-gifting-system-with-developer-products/4740647 — a central gift service that registers each feature's products.
[51] GiftTools+ (DevForum) — https://devforum.roblox.com/t/gifttools-a-powerful-customizable-tool-gifting-system/4754403 — staged transfer notifications (sending, processing, sent, completed).
[52] Monetization analytics (Creator Docs) — https://create.roblox.com/docs/en-us/production/analytics/monetization.md — Creator Hub's monetization dashboard.
[53] Roblox UI design best practices (creation.dev) — https://www.creation.dev/blog/roblox-ui-design-best-practices — one menu at a time; close buttons in the same place; safe areas on phones.
[54] Advertise on Roblox (Creator Docs) — https://create.roblox.com/docs/pt-br/production/promotion/advertise-on-roblox — ads must follow Roblox's Advertising Standards, Community Standards and Terms of Use.
[55] Check if Player has Gamepass (DevForum) — https://devforum.roblox.com/t/check-if-player-has-gamepass/287289 — community confirmation that UserOwnsGamePassAsync is the call for pass IDs.
[56] Roblox Plus private server limit (PCGamesN) — https://www.pcgamesn.com/roblox/plus-private-server-limit — Plus subscribers limited to one free private server per game; creators can still offer free servers.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[08 Mobile]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[15 Discovery and Growth]]
