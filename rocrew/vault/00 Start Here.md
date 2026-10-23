---
tags: [vault, index]
for: [lead, pulse, architect, librarian, builder, frame, scenic, playtest, kid-tester, balance, splash, reviewer, liveops, merchant, producer]
also: []
---

# The Roblox Game Playbook

This vault is what the crew knows about making Roblox games that people find, understand, keep playing and pay for. It was written from studying the top games on the platform, Roblox's own documentation, the Developer Forum, and talks and breakdowns by the developers who made them. Every chapter ends with its sources, so any rule can be checked.

Every agent reads the pages marked `for` its role before it plans or builds, and skims the pages marked `also`. The owner can open the `vault/` folder in Obsidian to read or edit it. Edits change how the crew works on its next task.

## Rules

1. **Read in small pieces.** Pages are long and every word read costs the owner's Claude plan. Read a page's card first (`node studio/cli.mjs vault card "<page>"`: its rules as one-liners, its checklist and common mistakes), then only the sections a task needs (`vault read <page> --section "…"`, or `vault search "…"`). You keep your memory between tasks, so don't re-read a card you already read in this conversation.
2. **The numbers are the spec.** "Tap targets at least 44 px", "first reward within 30 seconds": build to the number. If you go against one, write down why in `games/<slug>/decisions.md`.
3. **Genre page beats chapter.** When a genre page and a chapter disagree for that genre, the genre page wins. Chapters are the general case.
4. **Proof over opinion.** A rule here is a starting point; the game's own playtests and live numbers decide in the end. When the data says otherwise, change the game, then tell the Lead so the vault gets fixed.
5. **Phones first.** Most Roblox players are on phones. Every chapter assumes a thumb on a small screen unless it says otherwise.
6. **Fix the vault.** If a page is wrong, missing something, or a link is dead, say so in your handoff.

## How a game gets made

1. **Pitch.** Pulse reads the charts and proposes formats that are growing. The owner approves one. See [[15 Discovery and Growth]] and [[12 Live Ops and Launch]].
2. **Plan.** Architect writes the loop, the first five minutes and the contracts. Balance proves the pacing with a simulation. See [[02 The Core Loop]], [[01 The First Five Minutes]], [[04 Progression and Economy]], [[03 Rarity and RNG]] and the genre page.
3. **Build.** Builder, Frame, Scenic, Librarian and Merchant build in Studio, one at a time in their own areas. See [[14 Roblox Studio Workflow]], [[13 Building It Right]], [[05 UI and HUD]], [[06 World and Look]], [[07 Characters, VFX and Assets]] and [[09 Shops and Monetization]].
4. **Test and fix.** Playtest, Kid Tester and Reviewer find problems. Owners fix them, then testers recheck. See [[08 Mobile]], [[01 The First Five Minutes]] and [[13 Building It Right]].
5. **Ship prep.** Splash makes the icon and thumbnails, Liveops sets up analytics and the update plan, and Producer runs the last gate. See [[11 Thumbnails, Icons and the Store Page]], [[10 Retention and Social]], [[12 Live Ops and Launch]] and [[15 Discovery and Growth]].

## Where most Roblox games fail

| Where | What happens | Read |
|---|---|---|
| The first five minutes | Players leave before the game gets good | [[01 The First Five Minutes]] |
| The icon and thumbnail | No clicks, so no players, however good the game is | [[11 Thumbnails, Icons and the Store Page]] |
| The loop | Nothing to do after the first session | [[02 The Core Loop]], [[10 Retention and Social]] |
| The economy | Players hit a wall, or finish everything in a day | [[04 Progression and Economy]] |
| The UI | Players can't find the button that matters, or it's under their thumb | [[05 UI and HUD]], [[08 Mobile]] |
| Monetization | Too pushy and players quit; too soft and it earns nothing | [[09 Shops and Monetization]] |
| Updates | The game peaks at launch and fades | [[12 Live Ops and Launch]] |

## The chapters

| # | Chapter | What it covers |
|---|---|---|
| 01 | [[01 The First Five Minutes]] | The opening, the first goal, the first reward, tutorials that don't feel like tutorials |
| 02 | [[02 The Core Loop]] | The action players repeat, why it's fun, and how loops stack |
| 03 | [[03 Rarity and RNG]] | Rarity tiers, odds, pity, reveals and fair random rewards |
| 04 | [[04 Progression and Economy]] | Currencies, costs, pacing curves, rebirths and simulating it |
| 05 | [[05 UI and HUD]] | Every screen and component: HUD, menus, shops, popups, styles, motion |
| 06 | [[06 World and Look]] | Maps, landmarks, lighting, art direction and performance |
| 07 | [[07 Characters, VFX and Assets]] | Models, animation, effects, sound and safe asset sourcing |
| 08 | [[08 Mobile]] | Touch controls, screen sizes, thumb zones and phone performance |
| 09 | [[09 Shops and Monetization]] | Passes, products, premium payouts, pricing and fair offers |
| 10 | [[10 Retention and Social]] | Daily rewards, streaks, friends, groups, trading and community |
| 11 | [[11 Thumbnails, Icons and the Store Page]] | Icons, thumbnails, titles, descriptions and testing them |
| 12 | [[12 Live Ops and Launch]] | Launch plan, analytics, events, update cadence and reading the numbers |
| 13 | [[13 Building It Right]] | Luau code, server authority, saving data, security and testing |
| 14 | [[14 Roblox Studio Workflow]] | Working in Studio: structure, tools, MCP, Team Create and publishing |
| 15 | [[15 Discovery and Growth]] | How Roblox recommends games, charts, sorts and growing the player count |
| 16 | [[16 Console and Controllers]] | Gamepads, Xbox and PlayStation: input, menus you can drive with a controller, TV-sized UI |
| 17 | [[17 Security and Anti-Cheat]] | Stopping exploiters: remotes, server authority, saves, purchases, backdoors |
| | [[00 For Any AI]] | The ground rules for any AI working here |
| | [[Claude Design Prompts]] | Prompt templates for icons, thumbnails, UI art and effects |

## Genre pages

Each genre page covers what the top games in that genre do, the loop, the first five minutes, the economy, the UI, monetization, updates, a build order, a checklist and its sources.

| Genre | Page |
|---|---|
| Simulator | [[Genre - Simulator]] |
| Tycoon | [[Genre - Tycoon]] |
| Idle and incremental | [[Genre - Idle and Incremental]] |
| RNG and collection | [[Genre - RNG and Collection]] |
| Obby | [[Genre - Obby]] |
| Roleplay and life sim | [[Genre - Roleplay and Life Sim]] |
| Party and social hangout | [[Genre - Party and Social Hangout]] |
| Story and puzzle | [[Genre - Story and Puzzle]] |
| Action and combat | [[Genre - Action and Combat]] |
| Battlegrounds | [[Genre - Battlegrounds]] |
| Shooter | [[Genre - Shooter]] |
| Horror | [[Genre - Horror]] |
| Survival | [[Genre - Survival]] |
| Tower defense | [[Genre - Tower Defense]] (coming soon; use the closest genre page and the chapters meanwhile) |
| Racing and vehicles | [[Genre - Racing and Vehicles]] (coming soon; use the closest genre page and the chapters meanwhile) |
| Sports | [[Genre - Sports]] (coming soon; use the closest genre page and the chapters meanwhile) |
| Farming and fishing | [[Genre - Farming and Fishing]] (coming soon; use the closest genre page and the chapters meanwhile) |

## What each agent reads

Read the **must read** pages before your first task on a game, and the genre page for that game. Skim the rest when a task touches them.

| Agent | Must read | Skim |
|---|---|---|
| Lead | [[02 The Core Loop]], [[01 The First Five Minutes]], [[12 Live Ops and Launch]] | [[15 Discovery and Growth]], [[10 Retention and Social]], [[14 Roblox Studio Workflow]] |
| Pulse | [[15 Discovery and Growth]], [[12 Live Ops and Launch]], [[02 The Core Loop]] | [[11 Thumbnails, Icons and the Store Page]], every genre page |
| Architect | [[02 The Core Loop]], [[01 The First Five Minutes]], [[04 Progression and Economy]], [[13 Building It Right]] | [[03 Rarity and RNG]], [[10 Retention and Social]], [[14 Roblox Studio Workflow]] |
| Librarian | [[07 Characters, VFX and Assets]], [[14 Roblox Studio Workflow]] | [[06 World and Look]], [[Claude Design Prompts]] |
| Builder | [[13 Building It Right]], [[17 Security and Anti-Cheat]], [[14 Roblox Studio Workflow]], [[16 Console and Controllers]] | [[04 Progression and Economy]], [[09 Shops and Monetization]] |
| Frame | [[05 UI and HUD]], [[08 Mobile]], [[16 Console and Controllers]], [[01 The First Five Minutes]] | [[Claude Design Prompts]], [[09 Shops and Monetization]], [[14 Roblox Studio Workflow]] |
| Scenic | [[06 World and Look]], [[14 Roblox Studio Workflow]] | [[01 The First Five Minutes]], [[08 Mobile]], [[07 Characters, VFX and Assets]] |
| Playtest | [[13 Building It Right]], [[01 The First Five Minutes]], [[08 Mobile]], [[16 Console and Controllers]] | [[14 Roblox Studio Workflow]], [[05 UI and HUD]] |
| Kid Tester | [[01 The First Five Minutes]], [[05 UI and HUD]], [[08 Mobile]] | [[02 The Core Loop]] |
| Balance | [[04 Progression and Economy]], [[03 Rarity and RNG]] | [[09 Shops and Monetization]], [[10 Retention and Social]] |
| Splash | [[11 Thumbnails, Icons and the Store Page]], [[Claude Design Prompts]] | [[06 World and Look]], [[15 Discovery and Growth]] |
| Reviewer | [[17 Security and Anti-Cheat]], [[13 Building It Right]], [[09 Shops and Monetization]] | [[03 Rarity and RNG]], [[14 Roblox Studio Workflow]] |
| Liveops | [[12 Live Ops and Launch]], [[10 Retention and Social]], [[15 Discovery and Growth]] | [[09 Shops and Monetization]] |
| Merchant | [[09 Shops and Monetization]], [[04 Progression and Economy]], [[17 Security and Anti-Cheat]] | [[03 Rarity and RNG]], [[05 UI and HUD]] |
| Producer | [[00 For Any AI]], [[13 Building It Right]], [[12 Live Ops and Launch]] | The checklist at the end of every chapter |

## Galleries

`galleries/` holds annotated reference screenshots of real games: what each one shows, why it works, what to steal, what to avoid, and how to check it. Add your own. See [[galleries/README|the gallery format]].
