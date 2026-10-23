---
tags: [vault, genre, rng, collection, gacha, pets, eggs, auras, units, trading, odds]
for: [lead, pulse, architect, balance, builder, merchant, reviewer]
also: [frame, scenic, librarian, playtest, kid-tester, liveops, splash, producer]
---

# Genre - RNG and Collection

This page covers every Roblox format whose main reward is a random result you get to keep: **aura rolling** (Sol's RNG), **eggs and pets** (Pet Simulator 99, Bubble Gum Simulator Infinity, Adopt Me), **banner summons for units** in anime games (Anime Last Stand, Anime Defenders), **rerolls** for traits and enchantments, **timed stock and world drops** (Blox Fruits), and the **trading** economies that grow on top of them [4][25][26][27][11][18][36]. It also covers the rules that bind them all: Roblox's paid random items policy, which requires every outcome and its numerical odds to be shown as percentages that sum to 100% [1].

The genre runs on anticipation. A roll is a small lottery ticket with no real-money prize: the moment before the reveal, the rarity colors, the sound, the server announcement and the collection slot that fills. Done well, it gives players a reason to press the button one more time and to come back tomorrow. Done badly, it feels like a slot machine, breaks policy, gets exploited (client-side rolls), or collapses into an economy where every pet is worthless.

Read this page before pitching or building anything with eggs, rolls, crates, banners, gacha, rerolls, random drops or trading. Balance reads sections 2 and 5 with [[03 Rarity and RNG]] and [[04 Progression and Economy]]. Merchant and Reviewer read section 6 in full; it is the part most likely to get a game in trouble. Builder reads section 11 with [[13 Building It Right]].

Numbers about real games carry citations and come from guides and trackers that change with updates; treat them as examples of a shape, not current values. Every other number is **this studio's design target** for Balance to tune.

## 1. What it is and why it works on Roblox

**Definition the crew uses.** An RNG and collection game is one where (a) the core reward is drawn at random from a weighted table, (b) results differ in rarity, shown by a consistent color and effect language, (c) the player keeps results in an inventory or index they want to complete, and (d) some stat, item or system changes the odds (luck, pity, biomes, banners). Trading is optional but common.

**Sub-types.**

| Sub-type | The roll | What you collect | Odds modifiers | Reference |
|---|---|---|---|---|
| Aura RNG | Press roll (or auto-roll) every second or two | Auras worn on the avatar | Luck from gear and potions; biomes that change odds | Sol's RNG [4][10] |
| Eggs and pets | Buy an egg with currency and hatch | Pets with stats that boost income | Lucky passes, variant chances, special egg modes | Pet Simulator 99 [23][24][25] |
| Banner gacha | Summon on a rotating banner with gems | Units for tower defense or battles | Pity counters, banner rotation, VIP | Anime Last Stand [11][12] |
| Rerolls | Spend a crystal or token to reroll a property | Traits or enchants on units or items | Rarity of the reroll item | Anime Defenders traits [18] |
| Timed stock and drops | A shop restocks on a timer; items spawn in the world | Rare items (fruits, seeds, gear) | Time, server, luck | Blox Fruits fruit spawns and dealer stock [35][36] |
| Trading collections | Hatch or earn, then trade | Pets and their upgraded forms | Combining duplicates into rarer forms | Adopt Me neon pets [27][30] |

**Why it works.**
- **Variable rewards.** Each roll might be the one. Anticipation is the fun; the reveal is the payoff.
- **Rarity is social.** A 1-in-a-million aura on your avatar, a Huge pet following you, a Mythic unit on the field: other players see it. Roblox is social, so rarity is status.
- **Collection is a goal that writes itself.** An index with 14 of 60 filled is a to-do list.
- **Luck is progression.** Sol's RNG turns luck into the incremental stat, raised by crafted gear and potions [10]. Players feel progress even between lucky hits.
- **Trading creates a second game.** In Adopt Me, players judge rarity and demand and chase dream pets [28]. A trading culture keeps players logging in to deal.

**Audience and session shape (targets).** Ages 9 to 16. Aura RNG: long AFK-friendly sessions with bursts of attention at rare rolls. Eggs: 15 to 30 minute sessions tied to farming income. Banner gacha: daily sessions to spend free currency and check the banner. Trading: evening sessions in busy servers.

**The non-negotiables.**
1. Every roll is decided on the server.
2. Every paid random item shows every outcome and its percentage chance, summing to 100% [1].
3. Policy-restricted players never see paid random items, and players who may not trade paid items cannot trade them [1][3].
4. The odds the UI shows come from the same config the server uses.

## 2. The core loop

**Loop statements (pick one primary, write it into `plan.md`):**

- **Aura RNG:** Roll → reveal → keep the best and equip it → earn rolls, luck items and crafting materials → craft gear that raises luck → roll again with better odds.
- **Eggs and pets:** Farm currency → buy an egg → hatch → equip the best pets → farm faster → afford the next zone's egg → combine duplicates into stronger forms.
- **Banner gacha:** Play stages for gems → summon on the current banner → build a team → beat harder stages for more gems → wait for the banner you want → pity guarantees a result.
- **Trading collection:** Earn or hatch → keep, upgrade or trade → trade up toward dream items → show them off.

**Time layers.**

| Layer | Aura RNG | Eggs | Banner gacha |
|---|---|---|---|
| Seconds | A roll every 1 to 2 s with a mini-reveal | Hatch animation 1 to 3 s | 10-summon reveal 5 to 10 s |
| Minutes | A rare-for-you roll every few minutes; potion timers | An egg every 30 to 120 s of farming | A stage clear every 3 to 6 min |
| Session | A new personal best; a crafted item | Next zone's egg, a new index entry | Spending today's gems |
| Days | A biome or event; a big luck upgrade | A Legendary; trading | The wanted banner returns; pity fills |
| Weeks | Chase auras; new updates | Event eggs and limited pets | New units and events |

**Loop rules.**
1. **The reveal escalates with rarity.** Common 0.4 s, Rare 1.2 s, Epic 2 s, Legendary 3.5 s with server announcement, Mythic and above 5 s with a cross-server announcement (targets). The player learns to feel the tier before reading it.
2. **Every roll gives something.** Even a common gives a small amount of crafting material, index progress, or pity progress. No empty results.
3. **The player always knows their odds.** Current luck, the modified odds, and pity progress are visible in the roll UI.
4. **There is always a medium-term goal that is not luck.** A craftable item, a guaranteed pity reward, a token shop. Pure luck with nothing earnable burns players out.
5. **Duplicates are useful.** Fuse, combine, convert to currency or level up. Adopt Me's neon pets come from combining four fully grown pets of the same kind, and mega neons from four neons [30].

## 3. Top games in the genre

### Sol's RNG: luck as progression
**Game:** Sol's RNG, by Sol's Studio ([10])
**Shows:** A tracker describes it as a luck-based incremental simulator where players roll for over 200 auras, some as rare as 1 in 1 billion, while crafting gear and drinking potions to boost luck [10]. Its wiki pages describe the core loop as pressing a button and hoping [4], and guides list auras with rarity, effects and biomes [8][9].
**Why it works:** The roll is instant and endless; the progression is luck. Rarity numbers ("1 in 1,000,000") are the content and the flex.
**Steal:** Show rarity as "1 in N". Make luck a stat raised by crafting and consumables. Give rare results visible avatar effects.
**Avoid:** Copying its aura names or effects. Also avoid tables so deep that most players never see most content; give each player a personal "rare" every session.

### Sol's RNG biomes: time-limited odds
**Game:** Sol's RNG ([4][5])
**Shows:** Biomes reroll over time and change which auras are likely; while a biome is active its native auras appear at much better odds [4]. One guide lists the Windy biome at a 1 in 500 chance each time the biome changes [5]. During the Heaven biome, the Ascendant aura's odds reportedly improve to 1 in 187 million [6]. A Corruption biome introduced five auras that can only be rolled while it is active [7]. Bloxodes listed 14 biomes when checked [4].
**Why it works:** Biomes create moments: everyone on a server notices when a rare biome starts and rolls harder. They also turn the world itself into a luck modifier.
**Steal:** A server-wide state that changes odds for a few minutes, announced with lighting and sky changes.
**Avoid:** Biome-exclusive results without a clear signal when the biome is active. If it changes odds, it must show.

### Pet Simulator 99: variants and special egg modes
**Game:** Pet Simulator 99, by BIG Games Pets ([25])
**Shows:** The game centres on hatching eggs for pets [25]. A Magic Eggs pass gives a 10% chance of a gold and a 10% chance of a rainbow version from any egg [23]. Charged Eggs, available from Rebirth 6, raise luck for Huge pets while raising hatch costs [24].
**Why it works:** Variants multiply the collection without new models. Special egg modes let advanced players trade currency for rarer odds.
**Steal:** Variant layers (gold, rainbow, huge, shiny), each with stated chances. A "charged" mode that costs more for better odds, unlocked by progress.
**Avoid:** Variant chances that are not shown in the odds list. Every modifier must appear in numbers [1].

### Bubble Gum Simulator Infinity: new luck sources each update
**Game:** Bubble Gum Simulator Infinity ([26])
**Shows:** Update 12 (July 12, 2025) added Rift Summons, a Super Chest and Infinity Potions [26].
**Why it works:** Each update adds a new way to roll or a new luck boost, so the hatch loop stays fresh.
**Steal:** One new luck or roll mechanic per major update.
**Avoid:** Stacking so many luck sources that the odds become impossible to explain. Show the final odds after all modifiers.

### Adopt Me!: trading as the endgame
**Game:** Adopt Me! ([27][28])
**Shows:** Trade-value guides cover pets including Neon and Mega Neon forms and explain how to get a Trading License and start a trade [27][29]. Neons come from combining four fully grown pets of the same kind, and Mega Neons from four Neons [30]. Its trading culture is about judging rarity, demand and dream pets [28].
**Why it works:** Combining duplicates gives every common pet a future. A licence step before trading slows new players down long enough to learn the rules.
**Steal:** Combine-four-into-one upgrades. A trading licence quiz. Pets that grow over time.
**Avoid:** Launching trading before the duplication, scam and policy protections in section 11 exist. Values set by an outside community will drift; do not build progression on external value lists.

### Anime Last Stand: banners, rates and pity
**Game:** Anime Last Stand ([11])
**Shows:** Its wiki lists summon banners: Banner 1 rotates hourly for all players, Banner 2 unlocks later in Story Mode with Mythic and Celestial units that change hourly, and a single summon costs 50 of the currency while ten cost 500 [11]. Guides agree on base rates of Rare 70%, Epic 27.5%, Legendary 2% and Mythic 0.5%, and both the wiki and a guide report a pity of 60 summons for a guaranteed Legendary and 250 for a Mythic [11][12]. A timer in the summon window shows when the banner changes [13]. A guide reports VIP players get a summon discount [14].
**Why it works:** Hourly rotation makes "check the banner" a habit. Published rates and pity let players plan, and community tier lists [16] turn each banner into a decision about whether to spend. Ten summons for the price of ten keeps the maths honest.
**Steal:** A visible banner timer. Stated base rates. A pity counter on screen. Per-banner featured units.
**Avoid:** Rates that differ from what is shown, or different sources disagreeing about them (as guides on this game do [11][17]). Your in-game odds panel is the source of truth; keep it current.

### Anime Defenders: rerolls as a second chase
**Game:** Anime Defenders ([19])
**Shows:** Units come in Rare, Epic, Legendary, Mythic and Secret rarities and are summoned with gems [19]. Traits come from a Trait Reroll portal beside the unit-summon portal and cost a Trait Crystal per reroll; guides name Brawler 2 and Almighty 1 as strong results [18]. Beginner guides advise saving scarce crystals for Legendary or better units [19]. Support units give buffs or resource generation [20]; tier lists rank over 30 units [21][22].
**Why it works:** A second random layer (traits) on top of units gives a reason to keep rolling after you own the unit you wanted.
**Steal:** A reroll currency that is scarce and visible, placed right next to the main summon. Advice in-game about where to spend it.
**Avoid:** Making rerolls so punishing that players lose a good trait with no way back. Offer a lock or a "keep previous" option.

### Blox Fruits: timed spawns and synchronized stock
**Game:** Blox Fruits ([35])
**Shows:** Guides describe fruits spawning in the world on a timer, with reports of a shorter interval on weekends [35][37], and a fruit dealer whose stock refreshes every four hours and is synchronized across servers, with per-fruit stock chances being community estimates rather than official rates [36].
**Why it works:** A shared, timed stock makes "check the dealer" a global event and avoids server-hopping for better stock.
**Steal:** Synchronized timed stock (use `workspace:GetServerTimeNow()` and a seed per window so every server shows the same items).
**Avoid:** Leaving players to guess the odds from community estimates [36]. If a stock is random and purchasable with Robux-bought currency, publish its chances.

### Bee Swarm Simulator: the collection is the engine
**Game:** Bee Swarm Simulator ([40])
**Shows:** Players hatch bees to build a swarm that collects pollen for honey [40].
**Why it works:** Every collected item does work you can see. Collection and economy are one system.
**Steal:** Collectibles that act in the world (they gather, fight or build), not just sit in an index.
**Avoid:** Collections whose items are interchangeable numbers; each collectible should have a visible role.

### The pattern list
- Rarity is a language: color, sound, effect, and "1 in N".
- Odds are visible, and modifiers (luck, pity, biomes, variants) show their effect.
- Duplicates feed progress.
- Time-based events (biomes, banners, stock) create shared moments.
- Trading is a later layer, built on top of a protected inventory.

## 4. The first five minutes for this genre, second by second

### Aura or item RNG

| Time | What happens | Build notes |
|---|---|---|
| 0 to 3 s | Spawn facing a big "ROLL" button in the HUD and a glowing pedestal | No menus; roll button 200 x 80 px bottom center |
| 3 to 6 s | First roll: a short reveal and a Common aura appears on the avatar | Roll 1 always returns a Common with a nice effect (tutorial roll, not a paid roll) |
| 6 to 20 s | Rolls 2 to 6: Commons and Uncommons. "New best!" banners on improvements | Track personal best; show it |
| 20 to 30 s | Roll 7 is guaranteed Rare (tutorial pity): long reveal, burst, sound | Fixed tutorial sequence; tell nobody it is fixed |
| 30 to 60 s | Auto-roll unlocks: "Auto Roll is free for everyone!" toggle | Free auto-roll; sell faster rolls, not auto |
| 1:00 to 2:00 | Luck explained with a first free potion: "Luck x2 for 2 min" and the odds panel updates live | Odds panel shows "Rare 1 in 16 → 1 in 8" |
| 2:00 to 3:00 | Index opens: 6 of 60 found; silhouettes with "1 in N" labels | The index is the long-term goal |
| 3:00 to 4:00 | First crafting recipe: "Lucky Gloves: +10% luck" using materials from rolls | The earnable goal |
| 4:00 to 5:00 | Biome or event tease: "A Windy biome is coming in 3:20!" Daily reward toast | One timed reason to stay |

### Eggs and pets

| Time | What happens | Build notes |
|---|---|---|
| 0 to 15 s | Farm the first currency (see [[Genre - Simulator]] section 4) | — |
| 15 to 45 s | First egg free at the egg stand next to spawn: fixed Uncommon pet | Fixed result |
| 45 to 90 s | Pet follows and boosts income; "Equip Best" button shown | — |
| 1:30 to 3:00 | Second egg affordable with farmed currency; real roll, odds visible on the stand | Odds button labelled "Odds" |
| 3:00 to 5:00 | First duplicate: "Fuse 3 Commons into an Uncommon?" | Duplicates have value from the start |

### Banner gacha

| Time | What happens | Build notes |
|---|---|---|
| 0 to 30 s | Lobby; a free "Starter Summon" guarantees a strong Epic unit | Fixed result |
| 30 to 120 s | First stage with the free unit and two starter units | Win the first stage |
| 2:00 to 3:00 | Stage reward: enough gems for a 10-summon | 10-summon reveal with rarity escalation |
| 3:00 to 5:00 | Banner board: featured units, timer, rates button, pity counter | Teach the banner on the first visit |

**Opening rules.**
1. **The first rolls are free and the first rare result is scripted.** Tutorial rolls are not paid and need no disclosure, but must never be presented as typical odds. The odds panel shows real odds from roll 1.
2. **No Robux offer before 4:00.**
3. **The odds button is introduced with the first paid or currency roll.**
4. **Something earnable (crafting, pity, token shop) is shown before 5:00.**

## 5. Progression and economy

**5.1 Weights, chances and "1 in N".** Store weights, not percentages. For entry i with weight `w_i` and total `W = Σ w`:

```
chance_i   = w_i / W
one_in_N_i = W / w_i
```

Show both: the policy needs percentages [1]; players read "1 in N".

**5.2 Luck.** Luck multiplies the weights of entries at or above a threshold tier (so it never makes Commons more common):

```
w'_i = w_i × L     if tier_i ≥ luck_threshold, else w_i
chance'_i = w'_i / Σ w'
```

For rare entries in a big table, `chance'_i ≈ L × chance_i`. Luck sources multiply as buckets: base luck × gear × potion × biome × pass × server boost. Show the final luck number and the resulting odds.

**5.3 How long a chase takes.** With chance `p` per roll:

```
expected_rolls        = 1 / p
P(at least one in k)  = 1 − (1 − p) ^ k
```

| Rolls made (for a 1 in 1,000 result) | Chance of at least one |
|---|---|
| 500 | 39.4% |
| 1,000 | 63.2% |
| 2,000 | 86.5% |
| 3,000 | 95.0% |

Plan chase tiers in hours of play. At one roll every 1.5 s, an active player makes 2,400 rolls an hour. A 1 in 1,000,000 result at luck x4 needs 250,000 rolls on average: about 104 hours of rolling. Design targets:
- A personal rare (top 2 tiers the player has seen) every session.
- A tier every active player reaches within the first week.
- Chase tiers that only a few per server ever see, used as announcements and flex.

**5.4 Pity.** Pity guarantees a tier after a number of rolls without it. Roblox treats pity systems as probability modifiers that fall under the policy [1]. With chance `p` and hard pity at `N` rolls:

```
expected_rolls_with_pity = (1 − (1 − p) ^ N) / p
```

Worked example using rates and pity reported for Anime Last Stand [11][12] (maths on the stated numbers, not a claim about its code):

| Tier | Base rate | Pity | Expected rolls without pity | Expected with pity | Effective rate |
|---|---|---|---|---|---|
| Legendary | 2% | 60 | 50 | 35.1 | 2.85% |
| Mythic | 0.5% | 250 | 200 | 142.9 | 0.70% |

(0.98^60 ≈ 0.298, so (1 − 0.298) / 0.02 ≈ 35.1; 0.995^250 ≈ 0.286, so (1 − 0.286) / 0.005 ≈ 142.9.)

Rules: pity counts per banner or egg type; it resets when the tier is obtained (by luck or pity); the counter is visible ("Mythic guaranteed in 87"); the disclosed odds explain pity in words and numbers.

**5.5 Collection completion.** To collect all `n` equally likely items takes on average `n × H_n` rolls, where `H_n = 1 + 1/2 + ... + 1/n`. For 20 items, about 72 rolls; for 50 items, about 225. With uneven weights, completion is dominated by the rarest entry. So:
- Give each egg 5 to 8 entries, not 20.
- Make the rarest entry of each egg also obtainable another way (crafting, pity, event shop) or exclude it from "egg complete" rewards.
- Reward index milestones (25%, 50%, 75%, 100% per area) with permanent bonuses.

**5.6 Rarity tiers (studio template, matching [[03 Rarity and RNG]]).**

| Tier | Color | Basic table weight | Reveal | Announcement |
|---|---|---|---|---|
| Common | Gray #B0B0B0 | 6,000 | 0.4 s pop | None |
| Uncommon | Green #4CD964 | 2,500 | 0.6 s | None |
| Rare | Blue #2D9CFF | 1,000 | 1.2 s glow | None |
| Epic | Purple #A05CFF | 400 | 2 s shake and particles | Own screen |
| Legendary | Gold #FFC233 | 90 | 3.5 s burst | Server chat |
| Mythic | Red-pink #FF3D7F | 9 | 5 s full-screen | Cross-server |
| Secret | Black with rainbow | 1 | 5 s unique | Cross-server and global board |

(Weights sum to 10,000: 60%, 25%, 10%, 4%, 0.9%, 0.09%, 0.01%.)

**5.7 Variants.** Variant layers roll after the base result: for example gold 4%, rainbow 1%, shiny 0.2% (targets). Pet Simulator 99's Magic Eggs pass raises gold and rainbow chances to 10% each [23]; a variant pass must show its numbers. Variants multiply stats (gold x1.5, rainbow x2.5, shiny x4) and count as separate index entries.

**5.8 Pricing rolls in currency.** Eggs cost about 60 to 120 s of the player's income in that zone (see [[Genre - Simulator]]). Banner summons: a free player earns 3 to 5 single summons a day from play, plus daily and event rewards (targets), and reaches the Mythic pity in about 3 to 5 weeks of steady play.

**5.9 Duplicates and sinks.** Every duplicate must convert: fuse N into a better form (Adopt Me's four-into-one [30]), feed to level a unit, or recycle into a crafting or token currency. Without sinks, inventories overflow and trading values crash.

**5.10 Trading economy.** Value comes from rarity times demand [28]. Inflation comes from duplication bugs and from too-generous rolls. Protect it with: no duplication (section 11.8), fuse sinks, limited-time items that stop being obtainable, and a trade tax on high-value trades (optional, 0% at launch).

## 6. Monetization that fits

Merchant proposes, the owner sets prices and creates the passes and products. **Reviewer signs off every paid random item before the build gate.** See [[09 Shops and Monetization]].

### 6.1 The paid random items policy (what the docs require)
Roblox's paid random items policy applies to random items bought directly or indirectly with Robux, including items bought with paid in-game currency [1]. It covers capsules (eggs, crates, summons), enhancement items, combination items, and probability modifiers such as luck boosts and pity systems [1]. Requirements:
1. **Show all possible outcomes and the actual numerical odds** of receiving each [1].
2. **Show odds as a probability percentage**, and the percentages of all final outcomes must **sum to exactly 100%** [1].
3. **If the list is long, put it behind a button labelled with a word** such as "Info" or "Details"; a standalone symbol such as an (i) icon without a descriptive word is not enough [1].
4. **Indirect purchases count:** random items opened with keys or tickets bought with Robux carry the same duty [3].
5. **Regional rules:** Roblox has added the ability to block random-item purchases, or replace them with guaranteed purchases, depending on a country's regulations, a change reported in connection with South Korea's game law [3]. In code, read `PolicyService:GetPolicyInfoForPlayerAsync(player)`. The policy page names `IsPaidItemTradingAllowed` as the eligibility check for trading paid items and the results of paid random items [1]; the same result table carries `ArePaidRandomItemsRestricted` for players in regions where paid random items are restricted (hide them and offer a direct purchase instead). Reviewer re-reads the `PolicyService` reference before launch to confirm both field names.
6. Read Roblox's virtual items policy as well [2] and re-read the live policy page before every launch; it changes.

**Studio rules on top of the policy.**
- The odds panel is generated from the same config module the server rolls with. No hand-typed percentages.
- Percentages are rounded so they sum to exactly 100.00% (largest-remainder method, section 11.6) with enough decimals that no entry shows as 0%.
- Modifiers (luck, pity, variants, biomes, passes) show their effect in the odds panel: the panel shows the odds that apply to this player right now, and a "base odds" tab.
- If a currency can be bought with Robux, every random item bought with that currency is treated as paid.

### 6.2 What to sell

| Item | Type | Effect | Price range to propose (R$, targets) |
|---|---|---|---|
| Lucky | Game pass | Luck x2 bucket, shown in odds | 249 to 449 |
| Fast Roll / Fast Hatch | Game pass | Shorter roll interval or skip animations | 149 to 299 |
| Multi-Hatch (x3 / x8) | Game pass | Hatch several at once | 199 to 499 |
| Extra Storage | Game pass | Inventory +200 | 99 to 199 |
| Variant Chance | Game pass | Raises gold and rainbow chances to stated values | 299 to 499 |
| VIP | Game pass | Summon discount, chat tag, lounge | 399 to 799 |
| Luck Potion 15 min | Developer product | Luck x2 for 15 min; a probability modifier, so disclosed [1] | 25 to 49 |
| Server Luck 15 min | Developer product | Whole server luck x2, buyer announced | 99 to 199 |
| Gem pack (premium currency) | Developer product | Gems for summons; every summon is then disclosed as paid | 49 to 999 |
| Egg bundle | Developer product | N hatches; disclosed | 49 to 299 |
| Direct buy | Developer product | A specific non-random item, for restricted regions and for anyone who prefers certainty | Price at roughly the expected cost of rolling for it |

Auto-roll and auto-hatch should be free or earned; sell speed and multi-roll, not the automation itself.

Gem packs, potions and egg bundles are developer products: one `ProcessReceipt` handler, set once, records the `PurchaseId`, grants, saves, and only then returns `PurchaseGranted` [38][39].

### 6.3 Off-limits
- Hidden or missing odds, odds that do not sum to 100%, or an unlabelled (i) icon [1].
- Odds that differ between the UI and the server.
- Fake near-misses: reveal animations that show a rarer result and then swap it, or "almost!" messages.
- Paid random items shown to players whose policy restricts them; trading of paid items for players not allowed to trade them [1][3].
- Any player-to-player wagering of items (coin flips, jackpots, "double or nothing"). Studio rule, no exceptions.
- Anything that suggests items can be sold for real money, or links to off-platform trading.
- Time pressure on paid rolls ("2x odds for the next 60 s, buy now!") shown to new players.
- Paid rerolls that destroy a result without an undo or lock option.

## 7. UI and HUD for this genre

Frame owns this with [[05 UI and HUD]] and [[08 Mobile]].

**HUD (phone landscape, 1334 x 750 reference).**

| Area | Contents | Spec |
|---|---|---|
| Bottom center | Roll button (aura RNG) | 200 x 80 px, label "ROLL", auto-roll toggle 72 x 72 px to its right |
| Above the roll button | Luck display "Luck x3.4" and active potions with timers | 44 px icons with radial timers |
| Top center | Currencies | Pills 180 x 48 px |
| Top right | Biome or banner timer: "Windy: 2:41" | 220 x 48 px; color matches the biome |
| Left rail | Inventory, Index, Craft, Shop, Trade | 72 x 72 px |
| Right | Pity counters on the summon screen | — |

**The reveal (component spec).**
- Common to Rare: a card rises from the bottom, rarity-colored border, name and "1 in N", 0.4 to 1.2 s, no blocking.
- Epic: screen dims 30%, card scales from 0.6 to 1.0 with `Enum.EasingStyle.Back`, particles in the tier color, 2 s.
- Legendary and above: full-screen sequence. Build-up 1.5 s (light rays, rising pitch), burst, the item, name, rarity, "1 in N", and "First time!" if new. 3.5 to 5 s. Tap to skip after the first 1 s once the player has seen that tier once.
- Multi-summon: show all results as a grid of cards that flip one by one (0.15 s apart), with rare cards pausing for 0.5 s.

**The odds panel (component spec).**
- Opened from a button labelled "Odds" on every egg stand, banner and crate [1].
- A table: item icon, name, tier, percentage (enough decimals: "0.0001%"), and "1 in N".
- Tabs: "Your odds" (with current luck, pity and variant passes) and "Base odds".
- A line explaining modifiers in words: "Luck multiplies the chance of Rare and better. Pity: a Legendary is guaranteed within 60 summons."
- The percentages column always sums to 100% (show the total in the footer).

**Inventory and index.**
- Inventory grid of 96 x 96 px cells, tier border, lock icon, equipped tick, variant badge. Sort by rarity, power or newest; filter by tier. Multi-select for fuse, recycle and trade.
- Index by area or egg, silhouettes for missing entries with their source and "1 in N", completion percentages and rewards.

**Banner screen.** Featured units large in the center, the timer to rotation (Anime Last Stand shows one [13]), rates button, pity counter, single and ten-summon buttons with prices.

**Trade window.** Two columns (you, them), 9 slots each, value hints per item if the game has an internal value, a "Ready" button per side, a 5-second countdown after both are ready that resets on any change, and a final summary. Big warnings on mismatches ("You are giving 3 Legendaries for 1 Common").

**Mobile.** The roll and auto buttons sit in the right-thumb zone above the jump button's safe area; the reveal is skippable with a tap anywhere; inventory cells are at least 88 px.

## 8. World and look

Scenic owns this with [[06 World and Look]].

1. **Egg stands and banners near spawn**, in a row with rising prices, each with the egg model on a pedestal, the price on a `BillboardGui` (`MaxDistance = 60`), and the Odds button in the prompt UI.
2. **Biomes and events change the whole world.** Lighting, sky, fog and music shift with the biome (Sol's RNG ties odds to biomes [4]). Use `Lighting` presets tweened over 3 s and an `Atmosphere` color change. The change itself is the announcement.
3. **Rare results are worn.** Auras, trails, pet followers and unit skins render on avatars. Budget: one aura effect per player with at most 2 `ParticleEmitter`s at `Rate` 20 or less, plus a "reduce other players' effects" setting.
4. **A hall of fame.** A board or statue area near spawn showing the rarest results found on this server and globally.
5. **A trading plaza.** A dedicated area where the trade UI is easy to start, with benches and booths, so trading feels social.
6. **The rarity palette is consistent everywhere:** world signs, UI borders, chat messages, particle colors.

## 9. Retention and social

See [[10 Retention and Social]].

1. **Server announcements for rare results.** Legendary and above post a system message to the server; Mythic and above post to every server through `MessagingService`. Include the player's name, the item, and "1 in N".
2. **Shared timed events.** Biomes, banner rotations (hourly in Anime Last Stand [11]), dealer restocks (every four hours in Blox Fruits, per a guide [36]). Every server should know when the next one is.
3. **Daily free rolls and potions**, with a 7-day streak that ends in a guaranteed Epic or a pity boost.
4. **Index rewards.** Each completion milestone gives a permanent bonus (luck +5%, storage +50).
5. **Limited items.** Event eggs and banners whose results stop being obtainable; they become collectibles whose value can rise afterwards [28].
6. **Trading,** after the protections exist: a licence quiz, trade history, and value hints.
7. **Leaderboards:** rarest result, total rolls, index completion.
8. **Groups and friends:** +5% luck for group members, +5% per friend in server (cap +20%).
9. **Return hooks per day** in the plan: day 1 pity progress, day 2 a new banner, day 3 a biome event, day 7 the streak reward.

## 10. Live ops and update cadence

See [[12 Live Ops and Launch]].

- **Hourly:** banner or stock rotation, if the game uses them.
- **Daily:** free rolls, daily quests that pay roll currency.
- **Every 2 weeks:** new eggs or auras or units (5 to 10 entries), one new luck source or mechanic. Bubble Gum Simulator Infinity's Update 12 shows the pattern: new summon type, chest and potion in one update [26].
- **Every 4 to 6 weeks:** a limited event with an event currency and a limited egg or banner. Anime Last Stand's seasonal events are covered by guides [15].
- **Biome or world events:** rare server-wide states with exclusive results, as Sol's RNG's Corruption biome did with five exclusive auras [7].
- **Codes:** free potions and rolls on milestones.
- **Policy review:** before every update that adds a random item, Reviewer re-checks the odds panel and policy handling. Disclosure rules are spreading worldwide [3].

**What to watch.** Rolls per session, distribution of results against the configured odds (a weekly audit: if Legendary drops 0.9% configured but 1.4% observed, something is wrong), pity triggers per day, index completion distribution, potion use, trade volume and value, duplication anomalies (an item uid seen in two inventories).

## 11. Building it in Studio

Builder owns code; Merchant owns purchase and policy modules; Frame owns reveal, odds and trade UI; Reviewer audits rolls and trades. See [[13 Building It Right]] and [[14 Roblox Studio Workflow]].

**11.1 Systems list.**
1. PlayerData with inventory (unique ids), index, pity counters, luck items, receipts, trade history.
2. Config: tables (eggs, banners, auras), tiers, variants, luck rules, pity rules.
3. RollService: the only code that produces random results, on the server.
4. LuckService: computes the luck buckets per player.
5. PolicyService wrapper: caches policy info per player.
6. InventoryService: add, remove, lock, fuse, recycle, equip; caps.
7. Odds module: builds the odds panel data from config, with luck and pity applied.
8. Reveal UI and announcement system.
9. Crafting and token shop.
10. Timed systems: biomes, banner rotation, synchronized stock.
11. TradeService (later update).
12. Monetization: passes, products, receipts.
13. Analytics and roll audit.

**11.2 Architecture.**

```
ReplicatedStorage
  Shared/
    Config/ Tiers.lua, Eggs.lua, Banners.lua, Auras.lua, Variants.lua, Luck.lua, Crafting.lua
    Roll.lua        -- weighting math (pure), shared with the odds UI; only the server calls pick
    Odds.lua        -- percentage rounding that sums to 100
    Format.lua
  Remotes/
ServerScriptService
  Services/ DataService, RollService, LuckService, PolicyWrapper, InventoryService,
            CraftService, BiomeService, BannerService, TradeService, PurchaseService,
            AnnounceService, AuditService
StarterPlayerScripts
  Controllers/ RevealController, AuraController, AnnouncementController, TradeController
StarterGui
  HUD, Inventory, Index, Odds, Banner, Craft, Trade, Shop
```

**11.3 Remotes and validation.**

| Remote | Type | Client sends | Server checks |
|---|---|---|---|
| `Roll` | RemoteFunction | nothing | Cooldown per player (roll interval from passes), at most 1 in flight |
| `Hatch` | RemoteFunction | egg id, count | Near the stand (≤ 15 studs), count allowed, currency, storage space, policy if paid |
| `Summon` | RemoteFunction | banner id, count (1 or 10) | Banner active now (server time), currency, policy if paid |
| `Reroll` | RemoteFunction | unit uid, locked flag | Owns unit; has reroll item |
| `Fuse`, `Recycle`, `Lock`, `Equip` | RemoteFunction | uids | Owns all; not locked; not in an open trade |
| `Craft` | RemoteFunction | recipe id | Has materials |
| `TradeRequest`, `TradeRespond`, `TradeSetOffer`, `TradeReady`, `TradeCancel` | RemoteFunction | ids | See 11.8 |
| `GetOdds` | RemoteFunction | table id | Returns the odds the server would use for this player now |

**11.4 Data schema.**

```lua
--!strict
-- ReplicatedStorage/Shared/RngTypes.lua
export type Item = {
	Id: string,          -- config id
	Tier: string,
	Variant: string?,    -- "Gold", "Rainbow", "Shiny"
	Traits: { string }?, -- reroll results
	Level: number,
	Locked: boolean,
	Source: string,      -- "Free", "Paid", "Event", "Trade", "Craft"
	Obtained: number,    -- os.time()
}

export type RngData = {
	Version: number,
	Inventory: { [string]: Item },        -- key = GUID from HttpService:GenerateGUID(false)
	Equipped: { string },                 -- item uids
	Index: { [string]: boolean },         -- "Id" or "Id:Variant"
	Pity: { [string]: { [string]: number } }, -- table id -> tier -> rolls since last
	Rolls: number,
	Best: { Id: string, OneIn: number }?,
	Potions: { [string]: number },        -- potion id -> count
	ActiveBoosts: { [string]: number },   -- boost id -> expiry os.time()
	Materials: { [string]: number },
	Storage: number,
	TradeLog: { string },                 -- last 50 trade ids
	Receipts: { [string]: boolean },
}

return nil
```

Tag every item with its `Source` at creation. "Paid" covers anything from a Robux purchase or from a currency bought with Robux, so trade restrictions can be enforced later.

**11.5 Rolling with luck and pity (server only).**

```lua
--!strict
-- ReplicatedStorage/Shared/Roll.lua (math only; the server is the only caller of pick for real rewards)
export type Entry = { Id: string, Tier: string, Weight: number }

local TIER_INDEX: { [string]: number } = {
	Common = 1, Uncommon = 2, Rare = 3, Epic = 4, Legendary = 5, Mythic = 6, Secret = 7,
}
local LUCK_FROM_TIER = 3 -- luck scales Rare and above

local Roll = {}
local rng = Random.new() -- one generator per server

function Roll.tierIndex(tier: string): number
	return TIER_INDEX[tier] or 1
end

function Roll.weights(entries: { Entry }, luck: number): ({ number }, number)
	local out = table.create(#entries, 0)
	local total = 0
	for i, e in entries do
		local w = e.Weight
		if Roll.tierIndex(e.Tier) >= LUCK_FROM_TIER then
			w *= luck
		end
		out[i] = w
		total += w
	end
	return out, total
end

function Roll.pick(entries: { Entry }, luck: number, minTier: string?): Entry
	local floor = if minTier then Roll.tierIndex(minTier) else 0
	local pool: { Entry } = {}
	for _, e in entries do
		if Roll.tierIndex(e.Tier) >= floor then
			table.insert(pool, e)
		end
	end
	assert(#pool > 0, "table has no entry at or above the pity tier")
	local weights, total = Roll.weights(pool, luck)
	local r = rng:NextNumber() * total
	local acc = 0
	for i, w in weights do
		acc += w
		if r < acc then
			return pool[i]
		end
	end
	return pool[#pool]
end

return Roll
```

```lua
-- ServerScriptService/Services/RollService.lua (summon with pity)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Roll = require(ReplicatedStorage.Shared.Roll)
local Banners = require(ReplicatedStorage.Shared.Config.Banners)
local DataService = require(script.Parent.DataService)
local LuckService = require(script.Parent.LuckService)

local RollService = {}

-- banner.Pity = { Legendary = 60, Mythic = 250 } (example values)
function RollService.summonOnce(player: Player, bannerId: string)
	local data = DataService.get(player)
	local banner = Banners[bannerId]
	if not data or not banner then return nil end

	local pity = data.Pity[bannerId] or {}
	for tier in banner.Pity do
		pity[tier] = (pity[tier] or 0) + 1
	end

	-- the highest tier whose pity is reached sets the floor
	local floorTier: string? = nil
	for tier, limit in banner.Pity do
		if pity[tier] >= limit and (floorTier == nil or Roll.tierIndex(tier) > Roll.tierIndex(floorTier)) then
			floorTier = tier
		end
	end

	local result = Roll.pick(banner.Entries, LuckService.get(player), floorTier)

	-- reset every pity counter at or below the tier obtained
	for tier in banner.Pity do
		if Roll.tierIndex(result.Tier) >= Roll.tierIndex(tier) then
			pity[tier] = 0
		end
	end
	data.Pity[bannerId] = pity
	data.Rolls += 1
	return result
end

return RollService
```

The `Summon` handler checks the banner is active, charges currency, calls `summonOnce` count times, creates items with `InventoryService.add` (which assigns a GUID and `Source`), updates the index, saves receipts if paid, and returns the results for the reveal. The client never chooses or predicts results.

**11.6 Odds that sum to exactly 100%.**

```lua
--!strict
-- ReplicatedStorage/Shared/Odds.lua
local Odds = {}

-- Returns percentages (as numbers) that sum to exactly 100 at the chosen precision,
-- with enough decimals that the rarest entry is never shown as 0.
function Odds.percentages(weights: { number }): ({ number }, number)
	local total, smallest = 0, math.huge
	for _, w in weights do
		total += w
		if w > 0 and w < smallest then smallest = w end
	end
	local smallestPct = smallest / total * 100
	local decimals = math.max(2, math.ceil(-math.log10(smallestPct)) + 1)
	local scale = 10 ^ decimals
	local units = 100 * scale

	local floors: { number }, remainders: { number } = {}, {}
	local used = 0
	for i, w in weights do
		local exact = w / total * units
		local f = math.floor(exact)
		floors[i] = f
		remainders[i] = exact - f
		used += f
	end

	local order: { number } = {}
	for i in weights do
		table.insert(order, i)
	end
	table.sort(order, function(a, b) return remainders[a] > remainders[b] end)
	for k = 1, units - used do
		floors[order[k]] += 1
	end

	local out: { number } = {}
	for i, f in floors do
		out[i] = f / scale
	end
	return out, decimals
end

return Odds
```

The odds panel calls `Roll.weights(entries, luck)` and then `Odds.percentages`, and prints each with `string.format("%." .. decimals .. "f%%", pct)`, trimming trailing zeros. The panel footer shows the sum (always 100%). Reviewer adds a unit test: for every table in config, the percentages sum to 100 and none is 0.

**11.7 Policy checks.**

```lua
-- ServerScriptService/Services/PolicyWrapper.lua
local Players = game:GetService("Players")
local PolicyService = game:GetService("PolicyService")

local cache: { [Player]: any } = {}
local PolicyWrapper = {}

function PolicyWrapper.load(player: Player)
	local ok, info = pcall(function()
		return PolicyService:GetPolicyInfoForPlayerAsync(player)
	end)
	-- fail closed: if the call fails, treat paid random items as restricted and trading as not allowed
	cache[player] = if ok then info else { ArePaidRandomItemsRestricted = true, IsPaidItemTradingAllowed = false }
end

function PolicyWrapper.paidRandomAllowed(player: Player): boolean
	local info = cache[player]
	return info ~= nil and not info.ArePaidRandomItemsRestricted
end

function PolicyWrapper.paidTradingAllowed(player: Player): boolean
	local info = cache[player]
	return info ~= nil and info.IsPaidItemTradingAllowed == true
end

Players.PlayerRemoving:Connect(function(p) cache[p] = nil end)

return PolicyWrapper
```

Use `paidRandomAllowed` to hide paid eggs, gem-bought summons and luck products in the UI and to refuse them on the server, offering direct-buy items instead. Use `paidTradingAllowed` in `TradeService` to block items with `Source = "Paid"` (and results of paid rolls) from trades involving that player.

**11.8 Trading without duplication.** Both players are on the same server with session-locked profiles ([[13 Building It Right]]).
1. `TradeRequest` → the other player accepts → a trade object exists on the server with both user ids, empty offers and a trade id from `HttpService:GenerateGUID(false)`.
2. Each side sets an offer (max 9 items). Each item must be owned, not locked, not equipped and not in another open trade. Changing an offer clears both "Ready" flags.
3. Both press Ready → a 5-second countdown starts on the server; any change cancels it.
4. At zero, the server re-validates every item against both inventories and both players' policy, then removes items from each inventory and adds them to the other's in the same server frame, marks `Source = "Trade"` on received items (keeping a flag if they were originally paid), and appends the trade id to both `TradeLog`s.
5. Save both profiles immediately. Write a ledger entry (one data store key per trade id) with both sides' item uids for support and audits.
6. On profile load, drop any item uid that the ledger shows as traded away from this player (guards against a crash between the two saves).

Never let clients move items. Never allow trades across servers. Add a trade cooldown (30 s) and a daily limit for new accounts. Scams flourish outside simultaneous windows (the "trust trade" pattern where one side hands over first) [31], and Roblox has limited ability to enforce off-platform deals [33]; a clear in-game window and warnings are the defence. Other reported scam patterns are worth showing in the licence quiz [32][34].

**11.9 Announcements.**

```lua
-- ServerScriptService/Services/AnnounceService.lua
local MessagingService = game:GetService("MessagingService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TOPIC = "RarePull"
local AnnounceService = {}

function AnnounceService.toServer(playerName: string, itemName: string, tier: string, oneIn: number)
	ReplicatedStorage.Remotes.Announce:FireAllClients(playerName, itemName, tier, oneIn)
end

function AnnounceService.global(playerName: string, itemName: string, tier: string, oneIn: number)
	AnnounceService.toServer(playerName, itemName, tier, oneIn)
	task.spawn(function()
		pcall(function()
			MessagingService:PublishAsync(TOPIC, { P = playerName, I = itemName, T = tier, N = oneIn, J = game.JobId })
		end)
	end)
end

function AnnounceService.start()
	pcall(function()
		MessagingService:SubscribeAsync(TOPIC, function(message)
			local d = message.Data
			if d.J ~= game.JobId then
				AnnounceService.toServer(d.P, d.I, d.T, d.N)
			end
		end)
	end)
end

return AnnounceService
```

On the client, the announcement controller shows a banner and posts a system line with `TextChatService.TextChannels.RBXGeneral:DisplaySystemMessage(text)`, colored by tier with rich text. Display names only; never include anything a player typed.

**11.10 Synchronized timed systems.** For biomes, banner rotations and stock that must match across servers, derive the state from server time: `local window = math.floor(workspace:GetServerTimeNow() / 3600)` for hourly, then seed a `Random.new(window * 7919 + bannerSalt)` to choose the featured set. Every server computes the same result without messaging. Show the countdown as `3600 - workspace:GetServerTimeNow() % 3600` seconds.

**11.11 Roll audit.** Log every roll's table id, tier and luck to an in-memory counter and flush per-tier totals every 10 minutes to analytics. Liveops compares observed against configured rates weekly; Reviewer also runs a Studio test that rolls each table 1,000,000 times with `Roll.pick` and checks each tier is within 3 standard deviations of its configured chance.

## 12. Twists that work

1. **World states that change odds** (biomes, weather, day and night), as Sol's RNG does [4][5].
2. **Crafting luck gear from roll materials**, giving an earnable path beside luck [10].
3. **Co-op bosses in an RNG game**, like Sol's RNG's raid for up to eight players [10].
4. **RNG units in a strategy game**, as anime tower-defense games do with banners and traits [11][18].
5. **Combine-to-upgrade collections**, Adopt Me's neon path [30].
6. **Mutations and variants that stack**, so one base item has many forms [23].
7. **Synchronized global stock**, Blox Fruits' shared dealer stock [36].
8. **Collectibles that work in the world** (Bee Swarm's bees gather [40]).
9. **A deterministic token shop** beside the gacha: every roll gives tokens; tokens buy any item eventually. It caps bad luck and is easy to explain.
10. **Personal rarity**: "1 in N for you" based on your luck, so players compare luck builds, not just results.

## 13. Failure modes

| Failure | Symptom | Cause | Fix |
|---|---|---|---|
| Policy breach | Moderation action, removal | Missing or wrong odds; restricted players see paid rolls | Section 6.1 rules; Reviewer gate |
| Exploited rolls | Impossible items everywhere | Client rolls or client-chosen results | Server-only `Roll.pick`; remotes return results |
| Duplication | Same uid in two inventories; values crash | Trade or save race | Section 11.8; ledger reconciliation |
| Luck inflation | Rares worthless in weeks | Too many stacking luck sources | Buckets with caps; simulate luck stacks |
| Burnout | Players quit after a dry streak | No pity, no earnable path | Pity, token shop, crafting |
| Odds drift | Players accuse the game of lying | Hand-typed odds; stale panel | Generated from config; audit |
| Inventory overflow | Storage full, frustration | No sinks | Fuse, recycle, storage upgrades |
| Reveal fatigue | Players skip everything and disengage | Long reveals for commons | Escalate by tier; skip after first sight |
| Phone lag | Effects stack up | Every player's aura at full effects | Effect budget; reduce-others setting |
| Scams | Reports and quits | Trading without protections | Window, countdown, warnings, licence quiz [31] |
| Banner confusion | Players spend on the wrong banner | No timer, unclear featured units | Timer, featured units, rates button [13] |
| Community value lists rule the game | Players ignore in-game goals | No in-game value guidance | Internal value hints, sinks, fresh limiteds |

## 14. Pitch checklist: is this genre right for us right now?

- [ ] Which sub-type (aura, eggs, banner, rerolls, stock, trading-first)? One primary.
- [ ] Is an RNG game with this theme rising on the charts, and what is our twist (section 12)?
- [ ] Can the icon show a dramatic rare reveal in one image?
- [ ] Does Balance's simulation give every player a personal rare per session and a pity guarantee within the target time?
- [ ] Are odds disclosure, policy restrictions and direct-buy alternatives designed (Reviewer sign-off)?
- [ ] Is there an earnable path (crafting, token shop) next to luck?
- [ ] Are there 4 updates' worth of new tables, items and events planned?
- [ ] Is trading planned for after launch, with the protections in 11.8?
- [ ] Are all items, auras and units our own designs (no copied characters from anime or other games)?
- [ ] Is the effect budget for phones decided?

Fewer than 8 ticks: change the sub-type or the twist, or fold the RNG layer into a simulator ([[Genre - Simulator]]).

## 15. Checklist, common mistakes, references

### Checklist (Producer verifies in Studio)
- [ ] All rolls, hatches, summons, rerolls and drops are decided in server code; no remote accepts a result from the client.
- [ ] The odds panel opens from a button labelled "Odds" (or "Info"/"Details") on every random item.
- [ ] Percentages come from the config the server uses and sum to exactly 100% for every table (unit test output saved in `reports/`).
- [ ] No entry displays as 0%.
- [ ] Luck, pity, variant and biome modifiers are reflected in "Your odds" and explained in words.
- [ ] Pity counters are visible and reset correctly (tested by forcing rolls in Studio).
- [ ] `PolicyService` info is loaded per player; restricted players see no paid random items and get direct-buy alternatives.
- [ ] Items carry `Source`; paid items cannot be traded by players whose policy disallows it.
- [ ] Reveal escalates by tier with the target timings; skip works after first sight.
- [ ] Rare announcements work on the server and across servers.
- [ ] Every duplicate has a use (fuse, recycle, level).
- [ ] Inventory cap and storage upgrades exist.
- [ ] Trading (if shipped): window, Ready, 5-second countdown, revalidation, same-frame swap, immediate saves, ledger.
- [ ] Synchronized timers (biome, banner, stock) show the same state on two servers.
- [ ] `ProcessReceipt` is set once and idempotent; paid rolls record receipts.
- [ ] Million-roll audit test passes for every table.
- [ ] Effect budget holds on a low-end phone with 20 players wearing rare auras.
- [ ] Analytics: rolls, tier distribution, pity triggers, index completion, trade volume.
- [ ] Reviewer has signed the paid random items review in `reports/`.

### Common mistakes
1. Rolling on the client "for responsiveness".
2. Hand-typed odds that drift from the config.
3. Percentages that sum to 99.99% or 100.01% after rounding.
4. Showing the rarest entries as 0%.
5. An odds button that is only an (i) icon [1].
6. Forgetting that items bought with a Robux-purchasable currency are paid random items [1].
7. Luck boosts and pity not disclosed as modifiers [1].
8. Offering paid random items to policy-restricted players [3].
9. Trading launched before duplication protection.
10. Letting the same item be offered in two trades.
11. Swapping items across two saves without a ledger.
12. Long reveals for every common result.
13. No pity and no earnable path, so dry streaks end sessions.
14. Rarity colors that differ between UI, world and chat.
15. Copying anime characters or another game's pets, auras or names.
16. Too many luck sources multiplying with no cap.
17. Fake near-miss animations.
18. Player-to-player wagering of items.
19. Biomes or banners that change odds without a visible signal.
20. Tables with 30 entries, making completion impossible.

### References
[1] Paid random items policy (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/paid-random-items — Scope (direct, indirect and paid-currency purchases), item types (capsules, enhancement, combination, probability modifiers such as luck and pity), percentages summing to exactly 100%, labelled Info/Details button, trading eligibility.
[2] Virtual items policy (Roblox Developer Hub) — https://developer.roblox.com/zh-cn/articles/virtual-items-policy — Roblox's policy on virtual items sold in experiences.
[3] Korea's loot box rules push Roblox to disclose item odds worldwide (Tech Times, June 2026) — https://www.techtimes.com/articles/319148/20260626/koreas-loot-box-rules-push-roblox-disclose-item-odds-worldwide.htm — Indirect purchases via keys or tickets; Roblox's ability to block random-item purchases or replace them with guaranteed purchases by region.
[4] Sol's RNG wiki (Bloxodes) — https://bloxodes.com/wiki/sols-rng — Core loop of pressing a button and hoping; 14 biomes; biomes reroll and give native auras better odds.
[5] Sol's RNG biomes (Gamezebo) — https://www.gamezebo.com/walkthroughs/sols-rng-biomes/ — Windy biome at 1 in 500 per biome change.
[6] Best Sol's RNG Auras: Drop Rates and Rarity (Beebom) — https://beebom.com/best-sols-rng-auras/amp/ — Ascendant aura at 1 in 187 million during the Heaven biome.
[7] How rare is the Corruption biome in Sol's RNG (Twinfinite) — https://twinfinite.net/guides/how-rare-is-corruption-biome-in-sols-rng/ — Five auras exclusive to the Corruption biome.
[8] Roblox Sol's RNG wiki (TechWiser) — https://techwiser.com/roblox-sols-rng-wiki/ — A luck-based rolling game; auras listed with rarity, effects and biomes.
[9] Sol's RNG guide (GameWith) — https://gamewith.net/roblox/57441 — Guide coverage of Sol's RNG auras and systems.
[10] Sol's RNG (RoWatcher) — https://rowatcher.com/games/5361032378 — Luck-based incremental simulator by Sol's Studio; 200+ auras up to 1 in 1 billion; crafting and potions boost luck; co-op boss raid for up to eight players.
[11] Summoning Banners (Anime Last Stand Wiki) — https://alsroblox.fandom.com/wiki/Summoning_Banners — Hourly banner rotation, 50 / 500 summon costs, pity at 60 (Legendary) and 250 (Mythic), VIP discounts.
[12] Anime Last Stand Summon Chances and Pity System Explained (GINX) — https://www.ginx.tv/en/anime-last-stand-summon-chances-pity-system — Base rates Rare 70%, Epic 27.5%, Legendary 2%, Mythic 0.5%; pity.
[13] Anime Last Stand Units (Gamezebo) — https://www.gamezebo.com/walkthroughs/anime-last-stand-units/ — Banners change through the day; a timer in the summon window.
[14] Anime Last Stand Time King guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-time-king-guide-unit-overview-get — A featured unit's banner drop chance; VIP summon discount.
[15] Anime Last Stand Summer Event 2024 guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-last-stand-summer-event-2024-guide — Seasonal limited events in a gacha game.
[16] Roblox Anime Last Stand unit tier list (Destructoid) — https://destructoid.com/roblox-anime-last-stand-unit-tier-list — Community tier lists ranking gacha units.
[17] Anime Last Stand tier list (Twinfinite) — https://twinfinite.net/guides/anime-last-stand-tier-list/ — Guides citing different banner odds over time, showing rates drift across sources.
[18] Anime Defenders Trait Tier List (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-trait-tier-list — Trait Reroll portal beside the summon portal; Trait Crystal per reroll; strong traits.
[19] Anime Defenders: A Beginner's Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-a-beginner-s-guide — Rarities Rare to Secret; gem summons; save scarce crystals for Legendary or better.
[20] Anime Defenders: Support Units Guide (Sportskeeda) — https://www.sportskeeda.com/roblox-news/anime-defenders-support-units-guide — Support units that buff or generate resources.
[21] Anime Defenders Tier List (GINX) — https://www.ginx.tv/en/?p=64063 — Ranking of over 30 units.
[22] Anime Defenders units guide (DroidGamers) — https://www.droidgamers.com/guides/anime-defenders-units-guide/ — Overview of collectible units.
[23] Gamepasses (Pet Simulator 99), Pet Simulator Wiki — <https://pet-simulator.fandom.com/wiki/Gamepasses_(Pet_Simulator_99)> — Magic Eggs: 10% gold and 10% rainbow chance from any egg.
[24] How To Get Charged Eggs In Pet Simulator 99 (GINX) — https://www.ginx.tv/en/pet-sim-99-charged-eggs — Charged Eggs from Rebirth 6 raise Huge luck and hatch costs.
[25] Pet Simulator 99, Roblox Wiki (Fandom) — https://roblox.fandom.com/wiki/BIG_Games_Pets/Pet_Simulator_99 — BIG Games Pets; hatching eggs for pets.
[26] Bubble Gum Simulator Infinity Update 12 patch notes (Sportskeeda) — https://www.sportskeeda.com/roblox-news/bubble-gum-simulator-infinity-update-12-patch-notes — Rift Summons, Super Chest and Infinity Potions on July 12, 2025.
[27] Adopt Me trading values (Gfinity Esports) — https://www.gfinityesports.com/roblox/adopt-me-trading-values/ — Neon and Mega Neon values; Trading License; starting a trade.
[28] Adopt Me Pet Trading Culture: How Players Judge Rarity, Demand, and Dream Pets (Gfinity Esports) — https://www.gfinityesports.com/article/adopt-me-pet-trading-culture-how-players-judge-rarity-demand-and-dream-pets — Value as rarity and demand; limited pets as collectibles.
[29] Adopt Me trade values (Gfinity Esports) — https://www.gfinityesports.com/article/adopt-me-trade-values — Trade value guide for pets and their forms.
[30] Adopt Me Neon Pets guide (Toky) — https://monitoring.toky.co/?p=4462 — Neon from four fully grown pets of one kind; Mega Neon from four Neons.
[31] 12 Questions and Answers About the Roblox Trust Trade Scam (Security Scientist) — https://www.securityscientist.net/blog/12-questions-and-answers-about-roblox-trust-trade-scam/ — Scams that ask one side to hand over first; official windows swap simultaneously.
[32] 12 Questions and Answers About the Roblox Double Trade Scam (Security Scientist) — https://www.securityscientist.net/blog/12-questions-and-answers-about-roblox-double-trade-scam/ — A reported scam pattern around trade confirmation (community reports).
[33] Can Roblox support off-platform deals? (Security Scientist) — https://answers.securityscientist.net/q/581/can-roblox-support-off-platform-deals — Limited enforcement of deals made outside official features.
[34] How to trade in Roblox as of 2023 (Sportskeeda) — https://sportskeeda.com/roblox-news/how-trade-roblox-2023 — How platform trading works for players.
[35] Blox Fruits: how often fruits spawn (Pocket Gamer) — https://www.pocketgamer.com/roblox/blox-fruits-how-often-fruits-spawn — Timed world fruit spawns.
[36] Blox Fruits stock and spawn chance rates (Itemlevel) — https://itemlevel.net/blox-fruits-all-stock-chance-rate-spawn-chance-rate-updated/ — Dealer stock synchronized worldwide, refreshed every four hours; per-fruit chances are community estimates.
[37] Blox Fruits: how long fruit takes to spawn (Gamer Journalist) — https://gamerjournalist.com/roblox-blox-fruits-how-long-does-it-take-for-fruit-to-spawn/ — Spawn interval reports, including weekends.
[38] Developer products (Roblox Creator Docs) — https://create.roblox.com/docs/production/monetization/developer-products — ProcessReceipt for gem packs, potions and egg bundles.
[39] Problem with Developer Products (DevForum) — https://devforum.roblox.com/t/problem-with-developer-products/529124 — Only the most recent ProcessReceipt assignment takes effect.
[40] Bee Swarm Simulator Wiki — https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator — Hatching bees into a swarm that gathers pollen for honey.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Genre - Simulator]] · [[Genre - Tower Defense]] · [[Genre - Idle and Incremental]]
