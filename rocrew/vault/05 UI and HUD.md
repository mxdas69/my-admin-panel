---
tags: [vault, ui, hud, design-system, components, accessibility]
for: [frame, kid-tester, merchant, builder]
also: [lead, architect, playtest, reviewer, splash, liveops, producer]
---

# 05 UI and HUD

This is the studio's UI system: the design tokens, the scaling rules, the HUD layout for phone, tablet, PC and console, how windows open, how buttons feel, how fast things move, and a recipe for every component a Roblox game needs, from the buy button to the trade window. Frame owns `StarterGui` and the UI modules and builds from this page. Merchant reads the shop, pass, product and gacha recipes. Builder reads the architecture section, because every UI request ends at a server remote. Kid Tester and Playtest use the checklist to judge a build.

UI decides whether a game succeeds because it sits between the player and every system the crew built. A loop players can't see, a reward they don't notice, a shop button they can't hit with a thumb or an egg whose odds they can't read all fail even when the code under them is perfect. Roblox players are young and mostly on touch screens, they don't read paragraphs, and they leave the moment the screen feels confusing or dead. So our UI is big, bright, consistent, reacts to every touch, shows only what matters this minute, and stays out of the way of Roblox's own controls.

Read this page before building any screen. Read [[08 Mobile]] alongside it, since phone constraints drive almost every number here. Use [[01 The First Five Minutes]] for what the HUD must show during onboarding, [[03 Rarity and RNG]] for rarity colors and reveal pacing, [[09 Shops and Monetization]] for what to sell and at what price, and [[13 Building It Right]] for the remotes and data layer the UI talks to.

**How to read the numbers.** Sizes are in **dp (design pixels)**, measured on a 1280×720 reference canvas and scaled per device by one `UIScale` value `s` (see "Scaling system"). On the smallest phone `s` is about 0.68, so 66 dp renders at about 44 real pixels. **Positions** are pixel margins from the safe-area edges. Times are in seconds unless they say ms. Colors are given as RGB and hex. Any number this page calls a target or a rule of thumb is a studio standard to tune by testing. It isn't a Roblox limit.

## Rules

**1. Every color, font, text size, radius, stroke, spacing and timing comes from the `Theme` module; screen code contains no literal `Color3`, `Font`, `UDim` radius or `TweenInfo`.**
Why: consistency makes a game read as finished. When the shop, the pets window and the reward popup share one palette, one corner radius and one font set, players learn the visual language once. Public Roblox UI guidance and designer feedback both name consistency of fonts, colors, corner radii and spacing as the first marker of quality [49][48].
Studio: `StarterPlayer.StarterPlayerScripts.UI.Theme` (ModuleScript, frozen tables; full source under "Design system"). Every factory and screen script calls `require(script.Parent.Theme)`. If an older game already has `ReplicatedStorage.Shared.Theme`, keep that path and don't make a second copy. Reviewer greps UI scripts for `Color3.fromRGB(`. The only allowed hits are inside Theme.
Done right: the shop's buy button and the codes window's redeem button are the same green because both read `Theme.Color.Go`.
Done wrong: five slightly different greens and three fonts across five windows.

**2. Design phone landscape first, at the 640×360 worst case; then tablet, PC and console.**
Why: Roblox's adaptive design guidance asks creators to support gamepad, touch, keyboard and VR, and to adapt layout and hints to the input type [6]. The tightest of these is a small phone in landscape with a thumbstick, a jump button and Roblox's top bar all taking space. A layout that works there grows easily. A desktop layout shrunk down breaks.
Studio: open the Device Emulator, pick the smallest phone preset, build there, then check a large phone, a tablet and a 1920×1080 window. Frame screenshots phone size for every Review.
Done right: the HUD is built and checked at 640×360 before anyone sees it at 1080p.
Done wrong: a beautiful 1080p shop where the close button sits under the phone's notch.

**3. Every interactive ScreenGui uses `ScreenInsets = CoreUISafeInsets`; only non-interactive full-screen layers (dim, blur tint, fades, world-tracked markers) use `None`.**
Why: `CoreUISafeInsets` is the default, and Roblox recommends it for any ScreenGui with buttons or status text. It keeps content clear of device cutouts *and* Roblox's top bar. `DeviceSafeInsets` clears only notches and rounded corners [1][3]. `TopbarSafeInsets` places content in the strip beside Roblox's top bar buttons and resizes with them. `None` applies no insets and is meant for background images and other non-interactive content [2]. Setting `IgnoreGuiInset = true` switches a ScreenGui from CoreUISafeInsets to DeviceSafeInsets [3]. `ClipToDeviceSafeArea` controls clipping to the safe area and is ignored under `None` [4].
Studio: HUD, Windows, Popups and Toasts use `CoreUISafeInsets`. The Dim and FX layers use `None`. Never hard-code the top bar height. If code needs it, read `GuiService:GetGuiInset()` [18].
Done right: a full-screen dim with `None` behind a window that uses `CoreUISafeInsets`.
Done wrong: a HUD with `IgnoreGuiInset = true` whose currency counter hides under Roblox's menu button.

**4. Every ScreenGui has `ResetOnSpawn = false`.**
Why: when it's true, Roblox rebuilds the ScreenGui from StarterGui every time the character respawns. Open windows close, animations restart, and any LocalScript inside runs again and connects every signal a second time. Doubled connections cause double purchases, double sounds and memory leaks.
Studio: set it on each ScreenGui in StarterGui. UI controllers live in `StarterPlayerScripts`, not inside the ScreenGui, so they run once per session.
Done right: you die with the shop open, respawn, and the shop is still open with one click handler.
Done wrong: after three deaths, each click plays the sound four times.

**5. ScreenGuis stack in fixed `DisplayOrder` bands with `ZIndexBehavior = Sibling`: HUD 10, Dim 19, Windows 20, Popups 30, FX 35, Toasts 40, Tutorial 45, Transition 50, Loading 100.**
Why: one fixed order ends arguments about what covers what. A reward popup must cover a window, and a toast must cover both. The tutorial pointer has to point *at* buttons inside windows, and a fade must cover everything. `Sibling` z-ordering is also what `CanvasGroup` flattening needs [37].
Studio: one ScreenGui per band, named exactly `HUD`, `Dim`, `Windows`, `Popups`, `FX` (reward fly-to icons, above popups so coins fly over an open window), `Toasts`, `Tutorial`, `Transition`, with `LoadingGui` created from ReplicatedFirst. Inside a band, order with `ZIndex` on siblings only.
Done right: a toast appears over an open shop window.
Done wrong: the "Not enough coins" toast renders behind the shop that caused it.

**6. Positions are pixel margins from the safe-area edges; sizes are design units scaled by one `ScaleController`.**
Why: the two things that change across devices are *where the edges are* and *how big a thumb is relative to the screen*. Anchoring each cluster to its corner (`AnchorPoint` 0,0 / 1,0 / 0,1 / 1,1) with a small offset margin handles edges. A `UIScale` named `AutoScale` on each cluster handles size from one formula. Mixing per-element Scale sizes with offsets produces layouts that only work on the screen they were built on.
Studio: tag every top-level cluster and window root with the CollectionService tag `AutoScale`. The ScaleController (source under "Luau") sets each cluster's `AutoScale.Scale` to `s`. Margins are 12 px on phones, 16 px on tablets, 20 px on PC, and 5% on console. Never put two UIScale objects on the same instance. Nest them on different instances instead (the cluster gets `AutoScale`, the button gets `Press`, the window card gets `Pop`).
Done right: the menu grid is anchored (0, 0.42) with a 12 px left margin and is the same physical size on every phone.
Done wrong: `Size = UDim2.fromScale(0.1, 0.1)` buttons that turn into flat rectangles on ultrawide monitors and specks on phones.

**7. No tappable element renders smaller than 44 px on the smallest phone. Under our scale that means at least 66 dp on its shortest side, with at least 8 px between neighbours.**
Why: small targets cause missed taps, accidental purchases and the feeling that the game is broken. Roblox UI guides use 44×44 px as the mobile minimum [50]. Kids' thumbs and moving cars make it worse.
Studio: primary buttons are 72–96 dp tall, HUD tiles 80 dp, close buttons 68 dp. Icons smaller than 66 dp sit inside a larger transparent `ImageButton` hit area. Kid Tester checks every target on the 640×360 preset.
Done right: a 56 dp settings gear inside a 72 dp invisible button.
Done wrong: a 36 dp "x" that phone players can't close.

**8. On a phone the HUD holds at most 3 currencies, 1 objective line, 4 menu tiles and up to 3 contextual action buttons; tablets and PC may show 6 menu tiles.**
Why: the HUD has to leave the play space visible. Designer feedback on Roblox simulators says the genre trends toward simple UIs that help newer players follow what's happening [48], and public guidance says a HUD should show only what players need at a given moment [49]. Whatever isn't used every minute (codes, settings, index, stats, trading) lives inside a window.
Studio: phone layout is a 2×2 menu grid of Shop, Pets/Inventory, the game's signature button (Rebirth, Upgrades, Index) and Quests/Daily. Contextual buttons (Sell when the bag is full, an ability when it's ready) appear only while they're relevant.
Done right: four tiles, one objective pill, two currencies.
Done wrong: eleven buttons along both edges, and a new player can't find "Play".

**9. Respect the keep-out zones: the thumbstick zone (bottom-left 35% of width × bottom 45% of height on phones), the jump zone (bottom-right 160×140 px on phones, 240×280 px on tablets), the top bar (handled by insets), and the center 50%×50% of the screen, which stays free of persistent UI.**
Why: touch movement uses the lower-left of the screen, the jump button sits in the lower-right, and the center is where the game happens. Buttons inside these zones eat movement input, cause accidental taps and hide the action. The jump-zone numbers match Roblox's default touch controls at the time of writing (a smaller jump button when the screen's short side is 500 px or less, a larger one above that), but never read `TouchGui` internals in code. They can change. Check in the emulator instead.
Studio: draw the zones as translucent red frames in a `DevOverlay` ScreenGui and switch it on in testing builds. Every HUD cluster must sit outside the red.
Done right: the Sell button sits up and to the left of jump, where the right thumb already rests.
Done wrong: a Shop tile in the bottom-left corner that opens every time the player tries to walk.

**10. Every window has one dominant hue from the window palette, a shaped title banner, and a blurred, dimmed world behind it.**
Why: players should know which window they're in from color alone. Gold means Shop, blue means Pets, purple means Rebirth. The banner makes the window a *place* rather than a box. The blur and dim push the world back so the window reads as the focus, and they show that the game is waiting. Roblox's post-processing docs suggest `BlurEffect` for blurring the background behind menus, and effects parented to the Camera apply only to that player [21].
Studio: hues come from `Theme.Hue`. The banner is a 9-slice ribbon image or a `UICorner` frame with tails (recipe below). The blur is `BlurEffect.Size` 0→14 in 0.2 s, and the dim is a black frame at `BackgroundTransparency` 0.5.
Done right: the shop opens with a gold ribbon reading SHOP and the island softly blurred behind.
Done wrong: grey boxes with a small title, and the world still sharp and busy behind them.

**11. Only one window is open at a time. Opening a second closes the first, and one tap always returns to the HUD.**
Why: stacked windows confuse kids and trap them. The single exception is a popup (confirm, reward, error) that opens *over* a window and returns to it.
Studio: all opening goes through `Windows.open(name)` (source under "Luau"). Popups use `Popups.show()` in their own band. Nothing calls `.Visible = true` on a window directly.
Done right: tapping Pets while the Shop is open swaps windows in one motion.
Done wrong: Shop, Pets and Settings all open and overlapping, with no way out except resetting.

**12. Every window's close button is a 68 dp red circle with a white X, overhanging the card's top-right corner by 16 dp. Tapping the dim, gamepad B, or the window's own hotkey also closes it.**
Why: kids look for the red X in the corner, and an overhanging circle can't be confused with content. Several close paths cover every input method. On PC, Escape opens Roblox's own menu, so it isn't a close key for game windows. The key that opened a window closes it instead.
Studio: `CloseButton` is an `ImageButton` (Danger face, Ink 3 dp stroke, X icon at 60% of its size), `AnchorPoint = (0.5, 0.5)`, `Position = UDim2.new(1, -18, 0, 18)` on the card, so its center sits 18 dp inside the corner and 16 dp of the circle hangs outside. B is bound with `ContextActionService:BindActionAtPriority` while a window is open.
Done right: a red X that's thumb-sized and always in the same place.
Done wrong: a grey "Close" text link at the bottom of a scrolling list.

**13. Every button squashes to 0.92 in 60 ms on press, springs back with Back easing in 180 ms, plays a click, and acts on `Activated`.**
Why: feedback is what makes UI feel alive. The "juice" talk by Jonasson and Purho (Nordic Game Jam 2012) showed how tweening, squash and stretch and sound bring a working prototype to life [51][52]. Game feel lives in the loop between input and perception [54]. `Activated` fires for mouse, touch and gamepad, so one handler covers every device. `EasingStyle.Back` overshoots slightly and settles, which reads as springy [27][26].
Studio: `Button.bind(button, onClick)` adds a `UIScale` named `Press`, tweens it with `Theme.Motion.Press` and `Theme.Motion.Release`, and plays `Assets.Sounds.UI.Click` through `SoundService:PlayLocalSound`. If the finger slides off (`MouseLeave`/`InputEnded`), the button returns to 1.0 without acting.
Done right: every tap squashes, clicks and puffs.
Done wrong: buttons that do the job silently, so players tap three times and buy three things.

**14. Primary buttons get a 3D lip, a top-light gradient and a click puff; secondary buttons are flat; disabled buttons are grey and still answer a tap with a toast that says why.**
Why: hierarchy tells players what to press. The primary action (Buy, Claim, Hatch) has to look like the most pressable thing on screen. A disabled button that ignores taps feels broken. One that explains ("Reach Zone 3 to unlock") teaches.
Studio: Lip = a darker `Edge` frame 6 dp below the face. On press the face moves down 4 dp (in addition to the squash). Gradient = a `UIGradient` from the face color lightened 18% at the top to the base color, `Rotation = 90`. Disabled = `Theme.Color.Disabled` face, `DisabledText` label, no lip, no puff, and `Toasts.show(reason, "info")` on tap.
Done right: a fat green HATCH button with a lip, and a flat grey "Info" button beside it.
Done wrong: five identical rectangles in five colors with no clear first choice.

**15. Use three fonts at most: Luckiest Guy for display and banners, Fredoka One for numbers and button labels, Builder Sans Bold/ExtraBold for body and captions.**
Why: heavy rounded fonts read at small sizes and match Roblox's cartoon look. `Enum.Font` lists `FredokaOne` and `LuckiestGuy` [8]. Builder Sans is loaded through the `Font` datatype from `rbxasset://fonts/families/BuilderSans.json` with a weight, and `Enum.Font` is the older path that some methods still need [7][9]. Thin, script and condensed fonts disappear on phones.
Studio: set `FontFace` from `Theme.Font.*`, not `Font`. Display = `Font.fromEnum(Enum.Font.LuckiestGuy)`, Title = `Font.fromEnum(Enum.Font.FredokaOne)`, Body = `Font.new("rbxasset://fonts/families/BuilderSans.json", Enum.FontWeight.Bold)`. Luckiest Guy is all caps by design, so use it only for short words.
Done right: "LEGENDARY!" in Luckiest Guy, "1.25M" in Fredoka One, "Doubles coins forever" in Builder Sans Bold.
Done wrong: Arial body text, a script font on prices, and Luckiest Guy on a paragraph.

**16. Text renders at 14 px minimum on the smallest phone, body at 16–18 px, and numbers that change at 20 px or more. In dp: Micro 21, Caption 22, Body 24, Button 30, Number 36, Heading 32, Title 44, Display 64.**
Why: unreadable text is invisible text. At `s` = 0.68, 21 dp renders at 14.3 px. The scale is fixed so every screen shares the same sizes, which `TextScaled` can't promise.
Studio: set `TextSize` from `Theme.Text.*` and leave `TextScaled = false` on labels and paragraphs. Use `TextScaled = true` with a `UITextSizeConstraint` only for single big numbers in fixed boxes (reward amounts). Roblox lets players raise their preferred text size, and a `UITextSizeConstraint` caps text at its `MaxTextSize` whatever the player chose [15], so give caps at least 1.5× headroom.
Done right: the quest line in Body 24 that reads cleanly on a 640×360 emulator.
Done wrong: `TextScaled` on everything, so each button label is a different size.

**17. Text over the 3D world or colorful art gets a dark Ink `UIStroke`: 2.5 dp on Display/Title, 2 dp on Button/Number. Body text on flat panels needs no stroke.**
Why: the world changes color behind HUD text. A stroke keeps white text readable on sky, grass and lava. A `UIStroke` inside a text object outlines the text by default (`Contextual`). Setting `ApplyStrokeMode = Border` moves it to the box edge, and two strokes (one of each mode) can style text and border separately [10][11].
Studio: `Theme.Stroke.Text` = 2.5, `Theme.Stroke.TextSmall` = 2, color `Theme.Color.Ink`, `LineJoinMode = Round`. Some newer UIStroke border-position options are behind the Improved UIStrokes beta, so don't depend on them [12].
Done right: white "1.2K" with a 2 dp near-black outline, readable over a bright beach.
Done wrong: pale yellow numbers with no stroke that vanish against sand.

**18. Button labels are one or two words, paired with an icon. Never write sentences on buttons, and leave 30% spare width for translation.**
Why: young players don't read, and icons cross languages. Roblox's automatic text capture collects UI strings for translation, and you can turn off `AutoLocalize` on text that shouldn't be translated (names, codes) [44][45]. Translated words are often longer than English, so a label fitted exactly will overflow.
Studio: icon at the left (60% of button height), label at the right. Label boxes are at least 1.3× the English text width. Turn off `AutoLocalize` on player names, pet names the player typed, numbers and codes.
Done right: [cart icon] SHOP.
Done wrong: "Click here to open the shop and buy items".

**19. Numbers come from one formatter: full digits with commas up to 9,999, then 3 significant digits and a suffix (12.5K, 1.25M, 999B). It never rounds up across a suffix.**
Why: big numbers are the fun of simulators, but "1250000" is unreadable, and "1000K" next to "1M" looks like a bug. Rounding down keeps the display honest: a player never sees "1M" while short of a 1M price.
Studio: `Format.abbrev(n)` (source under "Luau") with suffixes K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, De. Prices and balances use the same function, so comparisons match.
Done right: balance "998K", price "1M", button reads "Need 2K".
Done wrong: balance "1M" and price "1M", but the button says you can't afford it.

**20. Currency changes animate: the count tweens over 0.4 s, a "+N" label floats up 24 dp and fades over 0.6 s, and the icon pulses to 1.15.**
Why: a number that jumps silently doesn't register. Animation tells the player they earned something and where it went.
Studio: `Counter.bind(label, "Coins")` listens to `player:GetAttributeChangedSignal("Coins")`, interpolates with `TweenService:GetValue` on Heartbeat, and spawns the float label. Spends animate down with no float, or a red "−N" for big spends.
Done right: picking up coins ticks the counter up with a little bounce.
Done wrong: the counter flips from 120 to 245 and nobody notices.

**21. Rewards fly to where they're stored (coins to the counter, pets to the Pets tile, items to Inventory) within 0.8 s, and the destination pulses when they land.**
Why: flying icons teach the HUD. After a few pickups the player knows which tile holds which thing without being told.
Studio: `RewardFX.flyTo(fromScreen, targetTile, icon, count)` with 6–12 icons on curved paths staggered by 30 ms. The start point comes from `camera:WorldToScreenPoint`, which accounts for the GUI inset, minus the FX root's `AbsolutePosition`.
Done right: coins burst from a broken chest and stream into the coin counter.
Done wrong: a "+50 Coins" toast with nothing moving.

**22. Reward presentation scales with rarity: Common and Uncommon get a toast and a fly-to, Rare and Epic a compact popup, Legendary and above a full-screen reveal with banner, sound and burst.**
Why: if every reward shouts, none are special, and 40 identical popups an hour exhaust players. Rarity pacing is covered in [[03 Rarity and RNG]].
Studio: `RewardFX.present(item)` picks a tier from `Theme.Rarity[item.rarity].tier` (1–4). Tier 4 adds a 0.15 s white flash at 0.6 transparency, which is skipped under reduced motion.
Done right: a Mythic pull stops the screen for 2 seconds, and a Common pull is a quick fly-to.
Done wrong: a full-screen "YOU GOT: Wooden Stick!" every 10 seconds.

**23. Reward popups become skippable after 0.5 s, never block for more than 4 s, and rewards from the same action are batched into one popup.**
Why: forced waits during a loop make players quit. Players notice slow reveals: Sol's RNG sells a Quick Roll pass that strips the roll animation so rolls resolve almost instantly, and offers Cutscene Skip as a rarity-based setting [63].
Studio: input is ignored for the first 0.5 s (so a stray tap doesn't dismiss before the player sees the result). Then any tap or A closes. Auto-close happens after 4 s on tier 2–3. Tier 4 waits for a tap but shows the "Tap to continue" hint at 1.5 s. Open ×3 / ×8 shows one grid of results, not three popups.
Done right: a triple hatch shows three cards side by side, and one tap returns to play.
Done wrong: three back-to-back 3-second animations with no skip.

**24. Toasts: at most 3 visible, 2.8 s life, newest at the bottom, identical messages merged as "×N", and each one 1 line under 32 characters.**
Why: toasts are the cheapest feedback channel, but unbounded they cover the screen. Merging stops "Not enough coins" from stacking eight times when a kid mashes a button.
Studio: `Toasts.show(text, kind)` where kind is one of `info`, `good`, `bad`, `reward`. Each toast is a pill 56 dp tall with the kind color as a 6 dp left bar, a 32 dp icon and Body text. It sits top-center under the objective (y = 80 dp), slides in from −16 dp with a fade over 0.18 s, and fades out over 0.25 s.
Done right: "Not enough coins ×4" in one pill.
Done wrong: a wall of identical red toasts down the middle of the screen.

**25. Motion follows the timing table: micro feedback 60–120 ms, panels 150–250 ms, reveals 300–600 ms, celebrations up to 2 s, and no ambient loop faster than one cycle per second.**
Why: fast feedback feels responsive, and slower reveals feel meaningful. Anything slower than 250 ms between a tap and a usable window feels laggy. Constant fast pulsing is noise and tires players.
Studio: use only `Theme.Motion.*` presets (table under "Motion timing"). `TweenInfo` takes time, easing style, direction, repeat count, reverses and delay, in that order, and Roblox's Tween reference walks through each one, Back easing included [24][25]. A new tween on the same property cancels the older one [28], so never run two tweens on one property and expect both.
Done right: a window opens in 0.24 s with Back Out, and the claim glow pulses once every 1.4 s.
Done wrong: a 0.8 s window slide, plus badges that blink four times a second.

**26. When `GuiService.ReducedMotionEnabled` is true, movement and scale tweens jump to their end state, and flashes, screen shakes and sunburst rotation turn off. Sound, color and the text of every message stay.**
Why: Roblox exposes the player's Reduced Motion setting as `GuiService.ReducedMotionEnabled` and suggests setting tween time to 0 when it's on [15]. Motion sickness and photosensitivity are real, and the setting costs us nothing.
Studio: every tween goes through `Motion.tween()`, which swaps in `TweenInfo.new(0)` when the setting is on. `RewardFX` checks `Motion.reduced()` before flash, shake and burst.
Done right: with reduced motion on, a Legendary reveal shows the card at once, with its sound and gold banner.
Done wrong: a reveal that flashes white three times regardless of settings.

**27. Panels honor `GuiService.PreferredTransparency`: our default panel transparency is multiplied by it, so players who ask for solid backgrounds get them.**
Why: Roblox maps the player's Background Transparency setting to `GuiService.PreferredTransparency`. The docs suggest multiplying each element's default transparency by that value, so tagged elements move between their default and fully opaque [15]. Translucent panels over a busy world are hard to read for many players.
Studio: tag translucent panels `PrefTransparency`, store their base transparency in an attribute `BaseTransparency`, and set `BackgroundTransparency = base * GuiService.PreferredTransparency` on load and when the property changes.
Done right: a toast backing at 0.15 transparency that turns fully opaque for players who set it.
Done wrong: a 0.5-transparency chat-style panel nobody can read over the lobby.

**28. Meaning is never carried by color alone: rarity has a name, a color and a frame shape; state has an icon and a color.**
Why: color-blind players can't tell red from green, or many rarity hues apart. Roblox's accessibility guidance covers colorblind-safe practice [15]. A label or icon costs a few pixels.
Studio: rarity chips always show the name ("EPIC"), and Legendary and above add a star or crown corner piece and a gradient border. Owned shows a check icon, Locked a padlock, Need a coin-with-minus icon. Kid Tester runs one pass with a grayscale screenshot (any image tool) to check that everything is still readable.
Done right: an egg's odds list where every row says "Rare 4.50%" next to its color.
Done wrong: colored dots with no labels.

**29. Text contrast against its background is at least 4.5:1, and button labels at least 3:1 with a stroke. Never put white text on the Gold or Go face without an Ink stroke.**
Why: low contrast is the most common reason a label fails on phones outdoors. The 4.5:1 figure is the widely used web accessibility threshold for body text, and we adopt it as a studio rule.
Studio: Theme pairs are pre-checked. White on Panel, Info, Danger and Special passes. Ink text or white with a stroke goes on Gold and Go. Never use Gold text on Go.
Done right: "BUY" in white Fredoka One with a 2 dp Ink stroke on green.
Done wrong: light grey text on a light blue panel.

**30. A buy button always shows the price with its currency icon on the button. Robux prices are read with `MarketplaceService:GetProductInfo` and never hard-coded.**
Why: a price the player has to hunt for feels like a trap. The owner sets and changes Robux prices on the Creator Hub, so a hard-coded label will drift out of date. `MarketplaceService` handles in-experience transactions, including product prompts and the `ProcessReceipt` callback, and lets the server check pass ownership with `UserOwnsGamePassAsync` [29].
Studio: `Prices.get(id, Enum.InfoType.GamePass)` calls `GetProductInfo` in a `pcall`, caches `PriceInRobux` per session, and shows "…" until it returns. If it fails, the label reads "BUY" with no number and tapping still opens Roblox's prompt, which shows the real price.
Done right: the pass card says 199 because that's what the Creator Hub says.
Done wrong: the label says 99, the prompt says 149, and kids report it as a scam.

**31. Buy buttons have exactly six states (Buy, Need, Locked, Owned/Equipped, Sold out, Processing), each with its own color, icon and label.**
Why: the button is how the shop talks to the player. Each state answers a different question: can I buy it, what's missing, when can I, do I have it, why can't I, is it working. Grow a Garden's seed shop greys the purchase button and labels it "NO STOCK" when an item sells out, so the reason is on the button itself [61].
Studio: `BuyButton.setState(btn, state, data)` (recipe below) is the only code that changes a buy button. Merchant's shop module computes the state on the client from replicated data, and the server re-checks it on purchase.
Done right: a grey "NO STOCK" button with "Restock 2:41" under it.
Done wrong: a green BUY button that silently does nothing because the item is gone.

**32. Tapping a "Need" button shows how to get more: the earning path first, the product second. It's never a dead end.**
Why: a player who can't afford something is motivated. If the game only shows them a Robux pack, it feels pushy. If it shows nothing, they give up. Our studio stance (see [[09 Shops and Monetization]]) is that the free path comes first.
Studio: a Need tap opens a small popup: "Need 2.4K more" + [Go farm: points to the best zone] + [Get coins: opens Shop > Coins]. In the first session, only the farm button shows.
Done right: "Need 300 more! Sell your bag" with a pointer to the Sell pad.
Done wrong: a Robux coin pack prompt opening straight away.

**33. Paid random items list every possible outcome with its percentage, and the percentages add up to exactly 100%, shown before the player spends. Boosts that change odds are explained before purchase too.**
Why: it's Roblox policy. If users can buy random items with Robux, or with in-game currency that can be bought with Robux, you must show all outcomes and the actual numerical odds as percentages totaling 100%. That duty extends to keys, re-roll tokens and spin tickets, and to paid items that boost the odds of other random outcomes [19]. TechTimes reported in June 2026 that Roblox revised these disclosure rules to comply with South Korea's game law and applied them worldwide [20].
Studio: the egg card's odds grid is generated from the same weights table the server rolls with, rounded with the largest-remainder method so the shown values sum to 100.00% (code under "Luau"). If a luck boost is active, show boosted odds with the boost named ("Lucky ×2 active").
Done right: "Golden Egg — Dog 60.00% · Cat 30.00% · Dragon 9.50% · Phoenix 0.50%".
Done wrong: "Chance for a LEGENDARY!" with no numbers, or numbers that add up to 99.98%.

**34. Check `PolicyService:GetPolicyInfoForPlayerAsync` and hide or replace Robux-purchasable random offers for players whose `ArePaidRandomItemsRestricted` is true.**
Why: some regions restrict paid random items. Roblox's policy lists alternatives: show outcomes in a fixed order disclosed before purchase, sell the outcomes directly at a guaranteed price, or remove or block the item [19].
Studio: the server calls the policy once on join (in a `pcall`) and sets `player:SetAttribute("PaidRandomRestricted", bool)`. The shop hides Robux egg bundles and paid spin tickets for those players and shows a direct-purchase alternative if Merchant built one.
Done right: restricted players see "Buy Dragon Pet (guaranteed)" instead of "Buy 3 Golden Eggs".
Done wrong: one global shop for everyone.

**35. Never imitate Roblox's purchase prompt, Roblox system UI or Roblox branding, and never open the shop by itself in the first session.**
Why: a fake prompt or a fake system message breaks trust and Roblox rules. A shop that pops open during onboarding reads as a cash grab and costs retention ([[09 Shops and Monetization]], [[01 The First Five Minutes]]).
Studio: Robux purchases always call `MarketplaceService:PromptGamePassPurchase` or `PromptProductPurchase` [29], and Roblox's own prompt is the confirmation. Our UI only gets the player to that point. The first unprompted shop exposure is a HUD tile badge after the first upgrade, not an open window.
Done right: a pass card whose Buy opens the real Roblox prompt.
Done wrong: a custom "Confirm purchase: 99 R$" box styled like Roblox.

**36. Red badges mean "something to claim or something new". At most 2 tiles carry a badge at once, and a badge clears the moment the player views the thing it flags.**
Why: if every tile is badged, badges mean nothing. One badge pulls attention to the one thing worth doing.
Studio: `Badges.set(tile, count | true)` (recipe below). The priority is claimable reward > new item > new feature. If three or more want a badge, only the top two show. Badges pop in once (scale 0→1.15→1 in 0.25 s) and never blink.
Done right: one red "1" on Daily when the day's reward is ready.
Done wrong: red "!" on every tile from the first second.

**37. Every list and grid has an empty state: a friendly line and a button that goes to the next step.**
Why: an empty Pets window on first open looks broken. An empty state is a free tutorial.
Studio: an `EmptyState` frame (icon 120 dp, Body text of 8 words or fewer, primary button) is shown when the data count is 0. Examples: "No pets yet!" + [Find an egg] (closes the window and starts the pointer at the nearest egg). "No codes redeemed" needs no button.
Done right: the inventory says "Your bag is empty — go mine!" with a button.
Done wrong: a blank dark rectangle.

**38. Every UI request to the server shows a pending state within 100 ms and ends in a success or error state. Nothing is ever silent.**
Why: network latency on phones can be half a second or more. A button that does nothing for 600 ms gets tapped again, which means double requests or a "broken game" report.
Studio: the button enters Processing (label replaced by a spinner, input locked) on tap, the remote call runs in `task.spawn`, and the button leaves Processing on the reply or after an 8 s timeout ("Try again"). The server stays authoritative and idempotent: a second claim of the same reward returns "Already claimed", never a second reward.
Done right: tapping Claim shows a spinner, then a check and the reward flying out.
Done wrong: nothing happens, the kid taps four times, and the server grants it twice.

**39. Error messages are 8 words or fewer, readable by a 10-year-old, say what to do next, and use the right surface: inline for form fields, a toast for transient failures, a modal only when progress is at risk.**
Why: "Error 0x1F: request failed" teaches nothing. "Not enough coins — sell your bag!" does.
Studio: `Theme.Copy` holds every player-facing message string keyed by name (`NotEnoughCoins`, `CodeInvalid`...), so wording stays consistent and translators see it. The server sends keys, not sentences. Inline errors: field stroke turns Danger, and the message appears below the field in Caption Danger. Toast errors: `Toasts.show(msg, "bad")`. Modal: data failed to load, or a trade was cancelled after both accepted.
Done right: "That code doesn't exist" under the code box.
Done wrong: a modal "ERROR" for a typo.

**40. Destructive actions (delete, sell all, rebirth, accepting a trade) need a confirm step, and the biggest ones need a 1.0–1.5 s hold-to-confirm.**
Why: accidental taps are common on touch. Losing a rare pet or resetting progress by mistake is the fastest way to lose a player for good.
Studio: `Confirm.ask{title, body, confirm = "Delete", danger = true}` for normal cases. Rebirth and Delete-all-unlocked use `HoldButton` (1.2 s fill bar). Locked items can't be deleted at all, and the delete button explains that.
Done right: "Delete 12 pets? Hold to confirm" with a filling red bar.
Done wrong: a "Sell all" button right next to "Equip best", with no confirm.

**41. Every window supports gamepad navigation: it selects its first control on open, has a logical selection order, and B closes it.**
Why: console players have no pointer. `GuiService.SelectedObject` is the current selection. If `AutoSelectGuiEnabled` is off, navigation still works but you have to set the selection yourself [16]. `GuiService:Select(parent)` selects the descendant with the lowest `SelectionOrder` [17].
Studio: set `SelectionOrder` on each window's controls (primary action 1, tabs 10+, close 99). `Windows.open` calls `GuiService:Select(card)` when `UserInputService.GamepadEnabled` is true. Use a `SelectionImageObject` styled with a 4 dp white stroke and the window hue glow, so selection is obvious from the couch. Community virtual-cursor modules exist for pointer-heavy screens [74], but design for selection first. A cursor is a fallback, not the plan.
Done right: opening the shop on console highlights the featured pass, and B closes the window.
Done wrong: the selection lands on a hidden button behind the window.

**42. Console layouts keep all content inside a 5% TV-safe margin, use the 10-foot scale (`s` ≥ 1.25), and show button glyphs instead of key names.**
Why: TVs crop edges and are seen from across a room. "Press E" means nothing on a controller.
Studio: `GuiService:IsTenFootInterface()` switches the ScaleController to its console branch. Prompts use `UserInputService:GetImageForKeyCode(Enum.KeyCode.ButtonX)` for the glyph image and fall back to text from `GetStringForKeyCode` if it's empty.
Done right: "[X] Hatch" with the controller glyph.
Done wrong: "[E] Hatch" on an Xbox.

**43. PC shows hotkeys on HUD tiles, scales buttons to 1.04 on hover, and never binds Escape for game windows.**
Why: PC players expect keys and hover feedback. Escape opens Roblox's own menu, so binding it creates conflicts.
Studio: hotkey chips (26 dp, Ink at 0.3 transparency, Caption text, e.g. "F") sit at a tile's top-left and appear only when the last input type is keyboard or mouse. Hover goes through `Button.bind`. Window toggles are the same key that opened them (G for Pets, P for Shop, for example) via `ContextActionService`.
Done right: pressing G opens Pets and pressing G again closes it.
Done wrong: hotkey hints showing on a phone.

**44. Inventory and shop grids use `UIGridLayout` inside a `ScrollingFrame` with `AutomaticCanvasSize = Y` and `CanvasSize = UDim2.new()`, and lists of more than 200 cells are paged or virtualized.**
Why: hundreds of cells, each with an image, stroke and gradient, cost frames and memory on phones. Paging keeps the window fast.
Studio: cells are 104×124 dp with 10 dp padding. `FillDirectionMaxCells` is computed from the frame's absolute width so columns fill the space. Above 200 items, render 60 per page with page arrows, or reuse a pool of cell frames as the player scrolls.
Done right: an 800-pet inventory that opens in one frame.
Done wrong: an inventory that builds 800 ViewportFrames on open and hitches for two seconds.

**45. Custom panels, banners and buttons drawn from images use 9-slice (`ScaleType = Slice` with a correct `SliceCenter`), so they scale without stretching corners.**
Why: a stretched rounded-rectangle image gets warped corners. With Slice, corners keep their source size, edges stretch along their length, and the center fills, while `SliceScale` scales the border thickness [40].
Studio: export art at 2× with the safe center marked. Set `SliceCenter = Rect.new(left, top, right, bottom)` in source pixels and `SliceScale` to match the dp scale. If the image has a 64 px corner at 2×, `SliceScale = 0.5` makes it 32 dp.
Done right: one ribbon image used for every window banner at every width.
Done wrong: a banner whose left curl is fat on one window and thin on another.

**46. Use `CanvasGroup` only to fade or tint small, fixed-size groups (toasts, popups, cards). Never use it on full-screen windows or scrolling lists.**
Why: a CanvasGroup renders its descendants as one flattened texture. That costs texture memory, needs a new texture when resized, and only works under `Sibling` z-ordering. When memory runs over the quality-level cap, the group renders as a blank texture [37]. Community reports describe one texture per CanvasGroup at its absolute size with down-res fallbacks under memory pressure [38], and a DevForum thread reports CanvasGroups failing to render on mobile devices [39]. Community optimization advice also warns about their memory cost [73].
Studio: a toast inside a CanvasGroup can fade by tweening `GroupTransparency`. A shop window doesn't: fade its dim layer and pop its card instead.
Done right: a reward card that fades in as one image.
Done wrong: a 1,000-cell inventory wrapped in a CanvasGroup that turns blank on an older phone.

**47. UI never decides anything that matters. It sends requests, the server validates every purchase, claim, code, trade and equip, and the UI shows what the server says.**
Why: on-screen containers and their code run on the client [5], and exploiters control the client. A client that grants its own reward is an infinite-money bug.
Studio: remotes live in `ReplicatedStorage.Remotes` (Builder's area). UI calls `Remotes.ClaimDaily:InvokeServer()` and renders the reply. Prices, ownership, stock and cooldowns shown on screen are copies of server state, re-checked when the request arrives.
Done right: the client shows "Claimed!" only after the server's reply says so.
Done wrong: the client adds 500 coins locally and tells the server afterwards.

**48. Screens read state from one client store fed by the server, subscribe to changes, and never poll in loops.**
Why: twenty screens each polling data every frame is slow and inconsistent. One store with change signals means the counter, the shop button and the rebirth panel all update the same frame the server says so.
Studio: simple values (currencies, rebirths, level) are player attributes set by the server, read with `GetAttribute` and watched with `GetAttributeChangedSignal`. Tables (inventory, quests, daily state) come through one `Remotes.DataSync` RemoteEvent into the `Store` module (source under "Luau"), which fires per-key signals.
Done right: buying an upgrade turns the next upgrade's button from Need to Buy instantly.
Done wrong: the shop shows stale prices until it's reopened.

**49. Build each window either as a Studio template under `StarterGui.Windows` or through the `UIKit` factories, consistently within a game, and give every element a clear name.**
Why: half-template, half-code UIs are impossible for the next agent to edit. Clear names (`BuyButton`, `PriceLabel`) let Builder and Merchant wire logic without guessing.
Studio: the default is templates for layout (Frame can see them in Studio and screenshot them) plus `UIKit` for repeated cells (grid items, toasts, rows). Names are PascalCase nouns. No two siblings share a name.
Done right: `Windows.Shop.Card.Body.Passes.Grid`.
Done wrong: `Frame.Frame.Frame.TextButton`.

**50. The window blur is a `BlurEffect` on `workspace.CurrentCamera` tweened from 0 to 14 in 0.2 s, and it's skipped when the player turns on Reduced Effects.**
Why: effects on the Camera show only to that player [21]. BlurEffect is the simplest and cheapest background blur. DepthOfField tricks are expensive and community posts report they don't render at lower graphics levels [22][23].
Studio: one `MenuBlur` BlurEffect, created by `Windows` on the client at Size 0. The dim frame does most of the work, so a player with Reduced Effects still sees the world pushed back.
Done right: a soft blur and dim that fade in with the window.
Done wrong: a DepthOfField glass-part trick that hitches on phones.

**51. The loading screen is a ReplicatedFirst LocalScript that removes the default screen, preloads only what the first 30 s need, shows a Skip button after 5 s, and normally finishes within 8 s.**
Why: the default loading screen is fine, but a branded one sets tone, and a stuck one costs players. Roblox's pattern moves a ScreenGui into PlayerGui from ReplicatedFirst and calls `RemoveDefaultLoadingScreen()`. Its examples wait a minimum time and then wait for `game.Loaded` [31]. ReplicatedFirst replicates to the client before anything else [31][32]. `ContentProvider:PreloadAsync` yields until the listed assets load [33].
Studio: recipe and code below. Preload the HUD icons, click sounds and the first zone's key decals, not the whole game.
Done right: a logo, a filling bar and a tip, gone in 4 s on Wi-Fi.
Done wrong: preloading 600 assets on a phone while a spinner turns for 40 s.

**52. During onboarding, a tutorial pointer shows the next action whenever the player has been idle for 6 s, and it always points at a real button or place.**
Why: kids who don't know what to do don't ask. They leave. A pointer is a silent teacher ([[01 The First Five Minutes]]).
Studio: `Pointer.show(targetGuiOrPart)` draws a bobbing hand (UI targets) or a ground beam plus edge arrow (world targets). It hides as soon as the player starts the action and comes back after 6 s idle. It never points at Shop in the first session.
Done right: a hand bobbing over the HATCH button on the first egg.
Done wrong: a text box saying "Use WASD to move to the egg and press E".

**53. Leave `AutoLocalize` on for UI text and turn it off for player names, typed pet names, codes and numbers.**
Why: Roblox's automatic translation collects strings from UI during testing and play into the localization table, fills only blank entries, and leaves manual translations alone. Turning off `AutoLocalize` on a text object stops it being captured [44]. Some text, like NPC names or street signs, should never be translated [45].
Studio: the `UIKit` label factory takes `localize = false` for those cases. Never build sentences by concatenating pieces ("You have " .. n .. " pets"). Use whole strings with one number at the end, or translation tables with parameters.
Done right: a translated "HATCH" button and an untranslated pet name "Sir Fluff".
Done wrong: a code box that auto-translates the code "SPRING" into another language.

**54. UI sound uses 6 sounds at most (click, open, close, reward, error, purchase), each 0.4 s or shorter at volume 0.3–0.6, routed through a `UI` SoundGroup with its own settings slider.**
Why: sound makes taps feel real, but loud or long UI sounds annoy players fast. A separate group lets players turn UI sound down without muting the game.
Studio: `SoundService.UI` SoundGroup. Every sound in `ReplicatedStorage.Assets.Sounds.UI` has `SoundGroup = SoundService.UI`. Play with `SoundService:PlayLocalSound`. Never play a UI sound from the server.
Done right: a soft click, a rising "pop" for rewards, and a low "bonk" for errors.
Done wrong: an airhorn on every purchase.

**55. Before any UI goes to Review, check it in the Device Emulator at the smallest phone, a large phone and a tablet, at 1080p PC, and with gamepad navigation.**
Why: UI that works on one screen often breaks on another, and the check takes ten minutes.
Studio: run Play in each preset, open every window, hit every button, rotate to the other landscape side (notch left, then right), and switch on the `DevOverlay` keep-out zones.
Done right: a Review entry with five screenshots, one per device.
Done wrong: "Looks good" from one 1080p screenshot.

**56. Every visual decision goes to the owner as a Review with a phone-size screenshot and one clear question.**
Why: the owner judges look and feel ([[00 For Any AI]]), and phone size is where most players see it.
Studio: `node studio/cli.mjs review --file games/<slug>/reports/ui-shop-phone.png --question "Is the shop readable at phone size?" --title "Shop UI"`.
Done right: one screenshot, one question, one decision written in `decisions.md`.
Done wrong: a 12-image dump asking "thoughts?".

**57. Steal patterns, not art: never use another game's logos, icons, mascots, fonts drawn as images, or pixel-matched layouts.**
Why: copying is disrespectful, can break rules, and makes us look like a knock-off. Designer feedback on the DevForum warns against using another game's logo (a Pet Simulator X image, in that case) as your own [48]. DevForum UI guides recommend borrowing ideas from references without copying them directly [46].
Studio: the "Examples from top games" section lists patterns. Librarian makes or licenses our own icons.
Done right: "a restock timer under the sold-out button", built in our own style.
Done wrong: a pixel trace of another game's shop.

**58. The "+" on a currency counter opens the Shop at that currency's section. It's the only HUD path to a currency pack.**
Why: players who want more currency look at the counter. Sending them straight to the right section is convenient and not pushy.
Studio: `Windows.open("Shop", { section = "Gems" })`. The shop scrolls to the anchor with a 0.3 s tween and pulses the section header once.
Done right: tapping + by Gems lands on the gem packs.
Done wrong: + opens the shop's front page of passes.

**59. In the first session the current objective is always on screen: one line of 40 characters or fewer, a progress bar and an icon, top-center.**
Why: "what do I do now?" is the question that ends sessions. The objective pill answers it all the time ([[01 The First Five Minutes]]).
Studio: the `Objective` pill is 440×60 dp at top-center with a Body 24 line, a 6 dp progress bar along its bottom and a 40 dp icon. When an objective completes, the pill flashes Go green, shows a check for 0.6 s, and slides the next one in.
Done right: "Hatch your first egg 0/1" with an egg icon.
Done wrong: no objective, so new players wander and leave.

**60. Every countdown shown on screen counts down to a real server time. No fake timers, no fake scarcity, no "only 2 left" that isn't true.**
Why: fake urgency is a trick, our rules forbid tricks ([[00 For Any AI]]), and kids notice when the "last chance" offer is back tomorrow.
Studio: timers render from a server timestamp attribute (`workspace:GetAttribute("ShopRestockAt")`) minus `workspace:GetServerTimeNow()`. Stock counts come from server state. If the clock is unknown, show "Soon", not a made-up number.
Done right: "Restock 3:12", matching the moment the shop refreshes for everyone.
Done wrong: an "ENDS IN 00:59" banner that resets every time the window opens.

## Step by step

### Building the UI for a new game in 18 steps

1. **Read the plan.** Open `games/<slug>/plan.md` and list every system the player touches: currencies, menus, rewards, the first-session objectives. Write the HUD inventory (what is *always* on screen) and the window list in `games/<slug>/ui.md`. If the HUD inventory exceeds Rule 8's limits, take it back to Architect before building.
2. **Inspect the place.** Read `StarterGui`, `StarterPlayerScripts` and `ReplicatedStorage.Assets.UI`. Don't rebuild anything that already works ([[00 For Any AI]]).
3. **Install the UI kit.** Create `StarterPlayerScripts.UI` with the modules `Theme`, `Motion`, `Format`, `Scale`, `Button`, `Windows`, `Popups`, `Toasts`, `Badges`, `Counter`, `RewardFX`, `Prices`, `Store`, `Pointer`, `Confirm` and `UIKit`, plus one `UIController` LocalScript that requires them in that order. Source for each is in this page.
4. **Pick the window palette.** Set `Theme.Hue` for each window from the table under "Design system". Choose the game's display color (the logo color) from [[11 Thumbnails, Icons and the Store Page]] so UI and thumbnail match.
5. **Create the ScreenGuis.** In StarterGui create `HUD`, `Dim`, `Windows`, `Popups`, `FX`, `Toasts`, `Tutorial`, `Transition` with the DisplayOrder bands from Rule 5. Set `ResetOnSpawn = false` and `ZIndexBehavior = Sibling` on all of them, `ScreenInsets = CoreUISafeInsets` on the interactive ones and `None` on Dim and Transition.
6. **Add the dev overlay.** Create `DevOverlay` (DisplayOrder 200, `ScreenInsets = None`, `Enabled = false`) with translucent red frames for the keep-out zones from Rule 9. Toggle it with a hotkey in Studio only (`RunService:IsStudio()`).
7. **Build the HUD clusters.** Create the four clusters (Currency, Objective, Menu, Actions) as transparent frames anchored to their corners, each tagged `AutoScale`. Use the positions in "HUD layout zones" below.
8. **Wire the currencies.** Ask Builder for the attribute names (for example `Coins`, `Gems`). `Counter.bind` each pill. Test by changing the attribute from the server command bar: `game.Players.<you>:SetAttribute("Coins", 12345)`.
9. **Wire the objective pill.** Bind it to `Store.observe("objective", ...)`. Builder's onboarding system writes the current objective to the store via DataSync.
10. **Build the menu tiles.** Use the HUD tile recipe. Bind each to `Windows.open(name)`. Add hotkeys on PC and `SelectionOrder` for gamepad.
11. **Build windows from the shell.** Duplicate `Windows.Template` (card, banner, close button, body, `Pop` UIScale) for each window, recolor it from `Theme.Hue`, and fill the body using the component recipes.
12. **Wire buy flows with Merchant.** Pass cards, product ladders and egg cards call `Prices`, `MarketplaceService` and the server remotes exactly as in the recipes. Merchant owns the purchase modules on the server.
13. **Add reward feedback.** Connect `Remotes.Reward.OnClientEvent` to `RewardFX.present` and `Remotes.Toast.OnClientEvent` to `Toasts.show`.
14. **Add badges.** Decide the badge priority list (claimable > new item > new feature) and bind `Badges.set` to the store keys that drive them.
15. **Build the loading screen and tutorial pointer.** Use the recipes. Builder's onboarding calls `Pointer.show` and `Pointer.hide`.
16. **Run the device matrix.** Smallest phone, large phone, tablet, 1080p PC, gamepad: open every window, press every button, check both landscape sides, overlay on. Fix everything before step 17.
17. **Run the accessibility pass.** Turn on Reduced Motion, max text size and solid backgrounds in the Roblox settings (or set the GuiService values in a test script), then take a grayscale screenshot. Fix anything that breaks.
18. **Send to Review and hand off.** Send phone screenshots of the HUD and each main window with one question. Hand off with evidence (screenshot paths, Output with no errors) to Kid Tester and Playtest.

### Adding a new window in 10 steps

1. Name it as a noun (`Rebirth`, `Index`) and add its hue to `Theme.Hue`.
2. Duplicate `Windows.Template` into `StarterGui.Windows` and rename it.
3. Set the banner text through the localized label factory and choose the banner icon.
4. Lay out the body with `UIListLayout` or `UIGridLayout` and Theme spacing. Nothing is positioned by hand inside the body.
5. Add the empty state (Rule 37).
6. Set `SelectionOrder` on interactive children. Primary action = 1.
7. Add an entry point: a HUD tile, a button in another window, or a world `ProximityPrompt`.
8. Bind data with `Store.observe` and remotes with pending and error states (Rules 38–39).
9. Run the device matrix for this window only.
10. Screenshot it at phone size and add it to the next Review.

### Pre-ship UI pass in 8 steps

1. `Ctrl+Shift+F` for `Color3.fromRGB(`, `Enum.Font.` and `TweenInfo.new(` in UI scripts. Every hit outside Theme is a bug.
2. Search for `ResetOnSpawn` and confirm it's false on every ScreenGui.
3. Search for `MouseButton1Click` and replace it with `Activated` (Button.bind).
4. Open every window on the smallest phone preset and measure the smallest tappable element. It must render at 44 px or more.
5. Play the first session touch-only with the dev overlay on. Note anything inside a keep-out zone.
6. Check that every egg, crate or spin sold for Robux or Robux-bought currency shows complete odds summing to 100% [19].
7. Turn on reduced motion and check that nothing flashes.
8. Check Output for UI errors during a 15-minute session (Playtest's log).

## Design system

### Color tokens

The panel family is a dark, slightly blue navy. Bright button faces pop against it, and it reads well over both bright and dark worlds. Every color has a role. Don't use a color outside its role.

| Token | RGB | Hex | Role |
|---|---|---|---|
| `Ink` | 20, 22, 31 | #14161F | Text strokes, borders, shadows, dim base |
| `PanelSunken` | 25, 28, 41 | #191C29 | Wells: inventory cell backs, input fields, progress bar tracks |
| `Panel` | 35, 40, 58 | #23283A | Window card body, toast backing |
| `PanelRaised` | 46, 53, 80 | #2E3550 | Cards inside windows, rows, tabs (unselected) |
| `Line` | 61, 69, 102 | #3D4566 | Dividers, 2 dp inner borders |
| `Text` | 255, 255, 255 | #FFFFFF | Primary text, icons on colored faces |
| `TextSoft` | 201, 207, 230 | #C9CFE6 | Secondary text, descriptions |
| `TextMuted` | 142, 150, 184 | #8E96B8 | Hints, placeholders, disabled captions |
| `Go` / `GoEdge` | 54, 209, 92 / 30, 143, 58 | #36D15C / #1E8F3A | Buy, Claim, Confirm, Equip, progress fills |
| `Gold` / `GoldEdge` | 255, 197, 49 / 201, 138, 0 | #FFC531 / #C98A00 | Premium (Robux) buy buttons, Best Value ribbons, Legendary UI |
| `Info` / `InfoEdge` | 58, 160, 255 / 30, 102, 194 | #3AA0FF / #1E66C2 | Secondary actions: Info, Next, Open, tabs (selected) |
| `Danger` / `DangerEdge` | 255, 77, 94 / 179, 38, 58 | #FF4D5E / #B3263A | Close X, Delete, Sell, errors, badges |
| `Warn` / `WarnEdge` | 255, 154, 46 / 194, 98, 10 | #FF9A2E / #C2620A | Timers, Locked info, "Need" price text |
| `Special` / `SpecialEdge` | 182, 92, 255 / 122, 43, 194 | #B65CFF / #7A2BC2 | Rebirth, event, limited items |
| `Disabled` / `DisabledText` | 91, 99, 128 / 163, 169, 194 | #5B6380 / #A3A9C2 | Disabled faces and labels |

**Currency colors** (icon art and counter accents only): Coins #FFD23F (255, 210, 63), Gems #4FD8FF (79, 216, 255), Event tokens #FF7AD9 (255, 122, 217), Rebirth tokens #B65CFF (182, 92, 255). Every currency has a distinct icon *shape* as well (coin = circle, gem = diamond, token = star), per Rule 28.

**Window hues** (the one color of each window, used on the banner, the card's outer stroke and the selected tab):

| Window | Hue token | Value |
|---|---|---|
| Shop | `Gold` | #FFC531 |
| Pets / Inventory | `Info` | #3AA0FF |
| Quests | `Go` | #36D15C |
| Rebirth | `Special` | #B65CFF |
| Daily rewards | `Warn` | #FF9A2E |
| Index | pink | #FF7AD9 (255, 122, 217) |
| Trade | cyan | #40D6E6 (64, 214, 230) |
| Codes | teal | #2EC4B6 (46, 196, 182) |
| Settings | slate | #6E7AA0 (110, 122, 160) |
| Leaderboard | gold-light | #FFE07A (255, 224, 122) |

**Rarity colors** (shared with [[03 Rarity and RNG]]; each tier also has a label and a frame shape):

| Rarity | Color | Hex | Frame treatment | Reveal tier |
|---|---|---|---|---|
| Common | 184, 192, 204 | #B8C0CC | Plain 3 dp border | 1 (toast) |
| Uncommon | 91, 227, 125 | #5BE37D | 3 dp border | 1 |
| Rare | 63, 169, 255 | #3FA9FF | 3 dp border + top-light gradient | 2 (popup) |
| Epic | 182, 92, 255 | #B65CFF | 4 dp border + gradient + corner gem | 3 (popup + burst) |
| Legendary | 255, 182, 39 | #FFB627 | 4 dp gradient border + star corner + slow shine | 4 (full screen) |
| Mythic | 255, 77, 109 | #FF4D6D | 4 dp animated gradient border + crown corner | 4 |
| Secret | rainbow | gradient | Rainbow `UIGradient` rotating 1 rev / 4 s + crown | 4 + server announcement |

### Type scale

| Token | dp | Font | Use | Stroke |
|---|---|---|---|---|
| `Display` | 64 | Luckiest Guy (`Enum.Font.LuckiestGuy`) | Rarity reveals, "LEVEL UP!", loading logo text | 2.5 dp Ink |
| `Title` | 44 | Luckiest Guy | Window banners | 2.5 dp Ink |
| `Heading` | 32 | Fredoka One (`Enum.Font.FredokaOne`) | Section headers, card names | 2 dp Ink |
| `Number` | 36 | Fredoka One | Currency counters, big prices, timers | 2 dp Ink |
| `Button` | 30 | Fredoka One | Button labels | 2 dp Ink (on Go/Gold faces) |
| `Body` | 24 | Builder Sans Bold | Descriptions, objective, toasts, rows | None on panels; 2 dp over world |
| `Caption` | 22 | Builder Sans Bold | Odds, stat lines, timers under buttons | None on panels |
| `Micro` | 21 | Builder Sans ExtraBold | Badge counts, hotkey chips, tags | 1.5 dp Ink |

Rendered sizes (dp × s): on the smallest phone (s ≈ 0.68) Body is 16 px, Caption 15 px and Micro 14 px. On a large phone (s ≈ 0.73) Body is 17.5 px. On a tablet (s ≈ 1.07) Body is 26 px. On a 1080p PC (s = 1.15) Body is 28 px. Line height for multi-line Body is 1.15 (`LineHeight = 1.15`). Long text wraps (`TextWrapped = true`) with `TextXAlignment = Left`. Centered text is for 1–3 words only.

Font notes: Luckiest Guy has no lowercase glyph design worth using and only one weight, so use it in caps, for 1–3 words. Fredoka One is a single heavy weight and very readable for numbers. Builder Sans comes in several weights through the `Font` datatype (`Enum.FontWeight.Bold`, `ExtraBold`), and the enum list includes Builder Sans variants on current builds [7][9]. If a game's theme needs a different display font (horror, sci-fi), swap only `Theme.Font.Display` and `Theme.Font.Title`. Good built-in options include `Enum.Font.Creepster` (horror), `Enum.Font.Michroma` or `Enum.Font.Sarpanch` (sci-fi) and `Enum.Font.Bangers` (comic). Keep Body as Builder Sans in every genre.

### Corner radius

| Token | Value | Use |
|---|---|---|
| `Radius.S` | `UDim.new(0, 8)` | Chips, tags, badges, small inputs |
| `Radius.M` | `UDim.new(0, 14)` | Buttons, cards, cells, rows, toasts |
| `Radius.L` | `UDim.new(0, 20)` | Window cards, popups |
| `Radius.Pill` | `UDim.new(0.5, 0)` | Pills (counter, objective), circles (close, badge) |

The radius is set through `UICorner.CornerRadius`, which takes Scale or Offset [11]. A UICorner gives the same radius to all four corners. A community report says `UIScale` didn't scale Offset-based corner radii while it did scale `UIPadding` [14]. Check this in your Studio build. If it still happens, the visible difference at s between 0.68 and 1.15 is a few pixels on 14 dp corners. Use `Radius.Pill` (Scale) where exact roundness matters.

### Strokes

| Token | Thickness | Mode | Use |
|---|---|---|---|
| `Stroke.Border` | 3 dp | Border | Window card outline (window hue darkened 35%), primary button outline (Edge color) |
| `Stroke.BorderThin` | 2 dp | Border | Cells, rows, inputs (Line color); selected cell (Text color) |
| `Stroke.Text` | 2.5 dp | Contextual | Display, Title |
| `Stroke.TextSmall` | 2 dp | Contextual | Number, Button, Heading, Body over world |
| `Stroke.Micro` | 1.5 dp | Contextual | Micro text on badges |

Always set `LineJoinMode = Enum.LineJoinMode.Round` on text strokes (sharp joins spike on Luckiest Guy). If a text object needs both a text outline and a box outline, use two UIStrokes, one `Contextual` and one `Border` [11].

### Shadows and depth

Roblox has no built-in drop shadow, so we fake depth three ways:

- **Lip (primary buttons):** an `Edge` frame of the button's edge color, the same size as the face, offset 6 dp down, behind the face (`ZIndex` one lower). On press the face moves down 4 dp. This is the classic chunky simulator button.
- **Drop shadow (windows and popups):** a 9-slice soft shadow image (Ink, 0.55 transparency) 24 dp larger than the card, offset 8 dp down. If the image isn't available, an Ink frame at 0.6 transparency offset 8 dp down with the same radius works.
- **Inner light:** a `UIGradient` on faces, from the face color lightened 18% (`color:Lerp(Color3.new(1, 1, 1), 0.18)`) at the top to the base color at the bottom, `Rotation = 90`. Use one gradient per element, and don't animate gradients on many elements every frame ([[08 Mobile]]).

### Spacing

| Token | dp | Use |
|---|---|---|
| `Space.XS` | 4 | Icon–label gap inside chips |
| `Space.S` | 8 | Gap between neighbouring buttons (minimum), padding in chips |
| `Space.M` | 12 | Grid cell padding, padding inside buttons |
| `Space.L` | 16 | Card padding, gaps between sections |
| `Space.XL` | 24 | Window body padding |
| `Space.XXL` | 32 | Space above section headers |

Every panel and button gets a `UIPadding` from these tokens. Padding is inner spacing at the edges, in pixels (Offset) or as a fraction of the parent's size (Scale) [13], so content never touches a border.

### Icon sizes

| Context | Icon dp | Container dp |
|---|---|---|
| HUD tile | 52 | 80 tile |
| Currency pill | 44 (overlaps pill's left edge by 8 dp) | 200×52 pill |
| Primary button | 0.6 × button height | 72–96 tall |
| Grid cell | 72 | 104×124 cell |
| Reward popup hero | 220 | 560×420 card |
| Toast | 32 | 56 tall pill |
| Close X | 0.6 × 68 = 40 | 68 circle |

Icons are one style per game: thick 4–6 px dark outline, flat bright fill, one highlight. Librarian keeps them in `ReplicatedStorage.Assets.UI.Icons` as decal IDs on StringValues or attributes.

### Layering inside a window

Back to front: shadow → card (Panel, `Radius.L`, 3 dp hue-dark border) → banner (overhangs the top) → body → popups. Inside the body: section header → cards → buttons. Badges and puffs sit on top of their parent by being later siblings or higher `ZIndex`.

### Full Theme module

```lua
--!strict
-- StarterPlayer.StarterPlayerScripts.UI.Theme (ModuleScript)
-- The only place UI colors, fonts, sizes, radii, strokes and timings are defined.

local function rgb(r: number, g: number, b: number): Color3
	return Color3.fromRGB(r, g, b)
end

local Color = table.freeze({
	Ink = rgb(20, 22, 31), PanelSunken = rgb(25, 28, 41), Panel = rgb(35, 40, 58),
	PanelRaised = rgb(46, 53, 80), Line = rgb(61, 69, 102),
	Text = rgb(255, 255, 255), TextSoft = rgb(201, 207, 230), TextMuted = rgb(142, 150, 184),
	Go = rgb(54, 209, 92), GoEdge = rgb(30, 143, 58),
	Gold = rgb(255, 197, 49), GoldEdge = rgb(201, 138, 0),
	Info = rgb(58, 160, 255), InfoEdge = rgb(30, 102, 194),
	Danger = rgb(255, 77, 94), DangerEdge = rgb(179, 38, 58),
	Warn = rgb(255, 154, 46), WarnEdge = rgb(194, 98, 10),
	Special = rgb(182, 92, 255), SpecialEdge = rgb(122, 43, 194),
	Disabled = rgb(91, 99, 128), DisabledText = rgb(163, 169, 194),
	Coins = rgb(255, 210, 63), Gems = rgb(79, 216, 255), Tokens = rgb(255, 122, 217),
})

local Hue = table.freeze({
	Shop = Color.Gold, Pets = Color.Info, Inventory = Color.Info, Quests = Color.Go,
	Rebirth = Color.Special, Daily = Color.Warn, Index = rgb(255, 122, 217),
	Trade = rgb(64, 214, 230), Codes = rgb(46, 196, 182), Settings = rgb(110, 122, 160),
	Leaderboard = rgb(255, 224, 122),
})

local Rarity = table.freeze({
	Common = table.freeze({ color = rgb(184, 192, 204), label = "COMMON", tier = 1, order = 1 }),
	Uncommon = table.freeze({ color = rgb(91, 227, 125), label = "UNCOMMON", tier = 1, order = 2 }),
	Rare = table.freeze({ color = rgb(63, 169, 255), label = "RARE", tier = 2, order = 3 }),
	Epic = table.freeze({ color = rgb(182, 92, 255), label = "EPIC", tier = 3, order = 4 }),
	Legendary = table.freeze({ color = rgb(255, 182, 39), label = "LEGENDARY", tier = 4, order = 5 }),
	Mythic = table.freeze({ color = rgb(255, 77, 109), label = "MYTHIC", tier = 4, order = 6 }),
	Secret = table.freeze({ color = rgb(255, 255, 255), label = "SECRET", tier = 4, order = 7 }),
})

local BUILDER = "rbxasset://fonts/families/BuilderSans.json"
local FontSet = table.freeze({
	Display = Font.fromEnum(Enum.Font.LuckiestGuy),
	Title = Font.fromEnum(Enum.Font.LuckiestGuy),
	Number = Font.fromEnum(Enum.Font.FredokaOne),
	Button = Font.fromEnum(Enum.Font.FredokaOne),
	Heading = Font.fromEnum(Enum.Font.FredokaOne),
	Body = Font.new(BUILDER, Enum.FontWeight.Bold),
	Heavy = Font.new(BUILDER, Enum.FontWeight.ExtraBold),
})

local Text = table.freeze({
	Display = 64, Title = 44, Heading = 32, Number = 36, Button = 30, Body = 24, Caption = 22, Micro = 21,
})

local Radius = table.freeze({
	S = UDim.new(0, 8), M = UDim.new(0, 14), L = UDim.new(0, 20), Pill = UDim.new(0.5, 0),
})

local Stroke = table.freeze({ Border = 3, BorderThin = 2, Text = 2.5, TextSmall = 2, Micro = 1.5 })
local Space = table.freeze({ XS = 4, S = 8, M = 12, L = 16, XL = 24, XXL = 32 })

local Q, B, L = Enum.EasingStyle.Quad, Enum.EasingStyle.Back, Enum.EasingStyle.Linear
local Out, In, InOut = Enum.EasingDirection.Out, Enum.EasingDirection.In, Enum.EasingDirection.InOut
local Motion = table.freeze({
	Press = TweenInfo.new(0.06, Q, Out),
	Release = TweenInfo.new(0.18, B, Out),
	Hover = TweenInfo.new(0.12, Q, Out),
	Open = TweenInfo.new(0.24, B, Out),
	Close = TweenInfo.new(0.15, Q, In),
	Fade = TweenInfo.new(0.2, Q, Out),
	Slide = TweenInfo.new(0.22, Q, Out),
	Pop = TweenInfo.new(0.3, B, Out),
	Reveal = TweenInfo.new(0.5, B, Out),
	Pulse = TweenInfo.new(0.7, Enum.EasingStyle.Sine, InOut, -1, true),
	Spin = TweenInfo.new(6, L, Out, -1),
})

-- Every player-facing message, keyed. The server sends keys (Rule 39); keep each under 32 characters.
local Copy = table.freeze({
	NotEnoughCoins = "Not enough coins", BagFull = "Bag full! Sell or delete", Locked = "Unlocks later",
	DailyAlreadyClaimed = "Come back tomorrow!", TryAgain = "Didn't work, try again", PurchaseFailed = "Purchase failed",
	CodeOk = "Code redeemed!", CodeInvalid = "That code doesn't exist", CodeUsed = "You already used this code",
	CodeExpired = "This code expired", CodeTooFast = "Slow down!", SaveFailed = "Your save didn't load. Rejoin.",
})

return table.freeze({
	Color = Color, Hue = Hue, Rarity = Rarity, Font = FontSet, Text = Text,
	Radius = Radius, Stroke = Stroke, Space = Space, Motion = Motion, Copy = Copy,
	DisplayOrder = table.freeze({ HUD = 10, Dim = 19, Windows = 20, Popups = 30, FX = 35, Toasts = 40, Tutorial = 45, Transition = 50 }),
})
```

## Scaling system

One number, `s`, sizes everything. It is computed from the viewport and the device type and applied to the `AutoScale` UIScale of every tagged cluster.

```
base = viewportHeight / 720
if touch-capable AND min(viewportWidth, viewportHeight) < 500 then base = base × 1.35   -- phone thumb boost
if ten-foot (console) then base = max(base, 1.25)
s = clamp(base, 0.6, cap)      where cap = 1.35 on console, 1.15 everywhere else
```

| Device (logical viewport) | base | boost | s | 66 dp renders | Body 24 dp renders |
|---|---|---|---|---|---|
| Small phone 640×360 | 0.50 | ×1.35 | 0.68 | 45 px | 16 px |
| Large phone 844×390 | 0.54 | ×1.35 | 0.73 | 48 px | 17.5 px |
| Tablet 1024×768 | 1.07 | none | 1.07 | 70 px | 26 px |
| Large tablet 1366×1024 | 1.42 | none | 1.15 (cap) | 76 px | 28 px |
| PC 1280×720 | 1.00 | none | 1.00 | 66 px | 24 px |
| PC 1920×1080 | 1.50 | none | 1.15 (cap) | 76 px | 28 px |
| Console TV 1920×1080 | 1.50 | 10-foot | 1.35 (cap) | 89 px | 32 px |

The 500 px threshold separates phones from tablets. Roblox's default touch controls use a similar short-side test for their small layout. Because the boost makes UI larger *relative to the screen* on phones, clusters are anchored to corners rather than laid out on a fixed canvas, and windows are capped to the safe area (next section). Positions are not scaled (Rule 6). Margins are chosen per device class.

**Windows fit the safe area, and they have two design sizes.** *Wide* is 880×560 dp, for tablet, PC and console. *Compact* is 600×400 dp, for phones (any device where `s` < 0.8 before fitting). A window's own `AutoScale` is `s_window = min(s, 0.92 × safeH / designH, 0.94 × safeW / designW)`. Worked examples, with the safe height taken after Roblox's top inset (read it at runtime, Rule 3):
- Small phone 640×360, about 300 px safe height, Compact: min(0.68, 0.92 × 300 / 400 = 0.69, 0.94 × 640 / 600 = 1.0) = **0.68**. Body still renders at 16 px.
- Large phone 844×390, about 330 px safe height, Compact: min(0.73, 0.76, 1.1+) = **0.73**.
- Tablet 1024×768, Wide: min(1.07, 0.92 × 710 / 560 = 1.17, 0.94 × 1024 / 880 = 1.09) = **1.07**.

Never fit a Wide layout onto a phone by shrinking it. At about 0.49 it would push Body text under 12 px and break Rule 16. The Compact layout instead drops to one column, a left tab rail and 3-column grids (see the recipes). `Scale.fitWindow(root, designSize)` does the math. Each window root carries `DesignWide` and `DesignCompact` frames, and the controller shows one of them.

## HUD layout zones

All positions are measured from the **safe area** (inside CoreUISafeInsets). Clusters are anchored to the corner named. Keep-out zones are in screen percent or pixels because Roblox's controls don't follow our scale.

### Phone, landscape (design target)

```
+---------------------------------------------------------------------------+
| [Roblox top bar: menu, chat... handled by CoreUISafeInsets]               |
|                     [ OBJECTIVE  pill 440x60 ]            [coins  200x52] |
|                     [ toast stack (max 3)    ]            [gems   200x52] |
| [Shop ][Pets ]                                            [boost/timer  ] |
| [Rebrt][Quest]                                                            |
|  menu 2x2, 80dp tiles     center 50% x 50%: keep clear                    |
|                                                                           |
|  THUMBSTICK ZONE                                     [act2]               |
|  0-35% W, bottom 45% H                       [ACTION 96dp]  [act3]        |
|  no UI                                                       (JUMP zone)  |
+---------------------------------------------------------------------------+
```

| Cluster | Anchor | Position (px from safe edge) | Size (dp) | Notes |
|---|---|---|---|---|
| Objective pill | (0.5, 0) | (0, 8) | 440×60 | Toasts start 80 dp below the pill's top |
| Currency stack | (1, 0) | (−12, 8) | 200×52 each, 8 dp gap, max 3 | Read-only, plus a + button 40 dp on the pill's right end |
| Boost / timer row | (1, 0) | (−12, 8 + stack height + 8) | 48 dp chips | Shows active boosts with remaining time |
| Menu grid | (0, 0.42) | (12, 0) | 2×2 of 80 dp tiles, 12 dp gap = 172×172 | Bottom edge must stay above the 55% line |
| Primary action | (1, 1) | (−170, −24) | 96 dp circle | Left of the jump zone, where the thumb rests |
| Secondary actions | (1, 1) | (−60, −170) and (−280, −40) | 72 dp circles | Arc: above jump and further left; at most 2 |
| Contextual (Sell, Equip best) | (1, 1) | Occupies a secondary slot | 72 dp | Appears only when relevant |

Keep-outs: thumbstick 0–35% width × 55–100% height. Jump: 160×140 px from the bottom-right safe corner. Camera drag is the whole right half outside buttons, so no panel there is wider than 25% of the screen.

### Phone, portrait (only if the game is designed for it)

Portrait is a separate layout, not a squeezed landscape ([[08 Mobile]]). Currency moves to a top row (left-aligned, two pills), the objective sits below it full width minus 24 px, menu tiles form a bottom row of 4 above the movement controls, actions stack at the bottom-right above jump, and windows become bottom sheets that take 70% of the height.

### Tablet, landscape

```
+------------------------------------------------------------------------------+
| [Roblox top bar]                                                             |
|                         [ OBJECTIVE 480x60 ]                   [coins]       |
| [Shop ][Pets ]          [ toasts ]                             [gems ]       |
| [Rebrt][Quest]                                                 [event]       |
| [Daily][Index]                                                               |
|                                                                              |
|  thumbstick zone                                       [act2]                |
|  0-25% W, bottom 40% H                        [ACTION]       (JUMP zone)     |
+------------------------------------------------------------------------------+
```

The menu grid becomes 2×3 (6 tiles). The thumbstick keep-out shrinks to 0–25% width × 60–100% height. The jump keep-out grows to 240×280 px (larger default jump button). Margins are 16 px. Players hold tablets with two hands at the edges, so everything tappable sits within 30% of the left or right edge. The center top is for read-only info only.

### PC (keyboard and mouse)

```
+------------------------------------------------------------------------------+
| [Roblox top bar]          [ OBJECTIVE 480x60 ]                 [coins]       |
| [F Shop ]                 [ toasts ]                           [gems ]       |
| [G Pets ]                                                                    |
| [R Rebirth]                                                                  |
| [Q Quests]                                                                   |
| [J Daily]                                                                    |
| [I Index]                                                                    |
|                        [ 1 ][ 2 ][ 3 ]  ability bar, bottom-center           |
+------------------------------------------------------------------------------+
```

A single column of up to 6 tiles sits at the left-middle (anchor (0, 0.5), 20 px margin) with hotkey chips. There's no thumbstick or jump zone, but leave the bottom-center free if the game uses Roblox's default backpack hotbar (Tools). Abilities become a bottom-center bar of 72 dp slots with key numbers. Hover feedback is on. Windows can be larger (up to 880×560 dp at s = 1.15 = 1012×644 px).

### Console (gamepad, TV)

```
+------------------------------------------------------------------------------+
|  5% TV-safe margin on every side                                             |
|    [coins] [gems]               [ OBJECTIVE ]                    [event]     |
|                                                                              |
|    menu opens with a button (e.g. ButtonY), not via always-on tiles          |
|                                                                              |
|                      [X] Hatch   [Y] Menu   [B] Back   glyph prompts         |
+------------------------------------------------------------------------------+
```

Content stays inside 90% of the width and height. HUD menu tiles collapse into one "Menu" prompt that opens a radial or grid of the same windows. All interaction is through selection (`GuiService.SelectedObject`), and every window starts with a selection [16][17]. Prompts show controller glyphs from `UserInputService:GetImageForKeyCode`. Scale cap is 1.35 for couch distance.

### Safe-area and inset rules for every device

- Interactive ScreenGuis: `CoreUISafeInsets` [1][3].
- Full-screen dim and fades: `None` [2].
- Small status (a match timer) can sit *inside* the top bar row via a ScreenGui with `TopbarSafeInsets`, which fits content beside Roblox's top bar controls and resizes with them [2].
- World-tracked markers (pointer arrows over parts, damage numbers) use a ScreenGui with `None` and positions from `camera:WorldToViewportPoint`, or the inset-aware `WorldToScreenPoint` with a CoreUISafeInsets layer. Don't mix the two methods on one layer.
- Test both landscape orientations. Notch-side insets differ, and `DeviceSafeInsets` padding is applied on the notch side.

## Window conventions

A window is a place the player visits, not a dialog box. Every window follows the same shell so players learn it once.

**Shell anatomy (880×560 dp design):**

```
            ____________________________
           /   [icon]  S H O P          \      banner 380x84 dp, window hue,
  ________/______________________________\_____   overhangs card top by 32 dp
 |  [tab][tab][tab]                          (X)|  close: 68 dp red circle, 16 dp overhang
 |                                              |
 |   body (UIPadding 24 dp)                     |  card: Panel, Radius.L,
 |                                              |  3 dp border = hue darkened 35%
 |                                              |
 |  [ footer: currency pills or primary action ]|
 |______________________________________________|
   world behind: BlurEffect 14 + Ink dim 0.5
```

1. **One color.** The window's hue appears in exactly three places: the banner fill, the card's outer border (hue darkened 35%: `hue:Lerp(Theme.Color.Ink, 0.35)`), and the selected tab. Everything else uses the shared panel family. A gold Shop and a blue Pets window are never confused, yet they look like one family.
2. **Shaped banner.** The title lives in a ribbon or plaque shape that overhangs the card's top edge by 32 dp, centered, 380×84 dp, with the window icon (56 dp) at the left and the Title text (44 dp, Luckiest Guy, 2.5 dp stroke). Build it as a 9-slice ribbon image [40], or as a frame with `Radius.M` plus two small rotated "tail" frames 24×40 dp at its ends, in the hue darkened 20%. The banner is what makes a window feel like a game screen rather than a settings dialog. DevForum UI guides build exactly this kind of shop shell in Figma first, then in Studio [46][47].
3. **Blurred world.** Opening any window tweens the camera BlurEffect to 14 and the Dim layer to 0.5 transparency over 0.2 s [21]. Closing reverses it over 0.15 s. Tapping the dim closes the window, except while a purchase or trade is in progress.
4. **Pop in, drop out.** The card's `Pop` UIScale goes 0.85→1.0 with Back Out over 0.24 s. Closing goes 1.0→0.9 with Quad In over 0.15 s, then `Visible = false`. Under reduced motion both are instant.
5. **Tabs.** Up to 4 tabs, as 56 dp tall pills under the banner (PC/tablet) or a left rail of 72 dp icon tabs (phone). Lay tab rows out with a horizontal `UIListLayout` and a `UIFlexItem` (FlexMode `Fill`) on each tab so they share the width evenly at any window size [34][35]. Chip rows (filters, sort) use `UIListLayout.Wraps = true` so they flow onto a second line instead of clipping [36]. The selected tab gets the hue fill and white text, unselected tabs get PanelRaised and TextSoft. Switching tabs fades the body (0.12 s) without re-popping the card.
6. **Footer.** Windows that spend currency show the relevant currency pills in the footer, so players see their balance while they shop. Windows with one main action (Rebirth, Daily) put that button in the footer, centered, 280×80 dp.
7. **Phone layout.** On phones the Compact 600×400 dp design is used (see "Scaling system"), tabs become a left rail, grids drop to 3 columns, and detail panels replace the grid as a full-card view with a back arrow (not side by side).
8. **One open at a time** (Rule 11), managed by `Windows`.
9. **Opening never moves the camera or the character**, and it never pauses the server. The game keeps running, so windows should be quick to use.

## Button feel

The button is the most-touched object in the game. Every button in every window feels the same.

| Moment | What happens | Spec |
|---|---|---|
| Hover (mouse only) | Grow | `Press` UIScale 1.0→1.04, `Theme.Motion.Hover` (0.12 s Quad Out) |
| Press down (touch or mouse) | Squash, and the face drops onto its lip | Scale→0.92 in 0.06 s Quad Out; face Position +4 dp Y |
| Release inside | Spring back, sound, puff, act | Scale→1.0 in 0.18 s Back Out; click sound; puff ring; callback |
| Release outside / finger slides off | Spring back, nothing else | Same spring, no sound, no action |
| Gamepad select | Grow and highlight | Scale 1.06, SelectionImageObject (4 dp white stroke) |
| Gamepad press | Quick pulse | 0.92 then 1.0 over 0.12 s, sound, act |
| Disabled tap | Small shake + "why" toast | Rotation −3°→3°→0 over 0.18 s; `Toasts.show(reason)` |
| Processing | Locked with a spinner | Label hidden; 28 dp spinner rotating 1 rev / 0.8 s; input ignored |
| Success | Flash + check | Face flashes Go for 0.2 s; check icon for 0.6 s; back to the new state |
| Error | Shake + red flash | Two shakes (±6 dp X over 0.24 s); face flashes Danger for 0.2 s; error toast |

**Squash.** A UIScale named `Press` inside the button. The button's `AnchorPoint` must be (0.5, 0.5) so it squashes around its center. Position the button by its center, or wrap it in a holder frame.

**Sound.** Click: 0.05–0.12 s, soft "tok", volume 0.4. Open: a short rising "whoop" at volume 0.35. Close: a falling one at 0.3. Reward: a sparkly "ding" up to 0.4 s at 0.5. Error: a dull low "bonk" at 0.45. Purchase complete: a coin "cha-ching" at 0.5. All of them route through the UI SoundGroup. The click sound gets a random pitch from 0.95 to 1.05 (`PlaybackSpeed`) so repeated taps don't feel mechanical. Since `PlayLocalSound` plays the Sound object as configured, keep 3 clones with different speeds and pick one at random.

**Click puff.** On a successful press, a ring the size of the button expands to 1.35× and fades out over 0.25 s (white `UIStroke`, 3 dp, starting at 0.2 transparency). Primary buttons also throw 6 small dots (8 dp circles in the face color lightened 30%) outward 28 dp along evenly spaced angles over 0.3 s while fading. The puff is skipped under reduced motion. Juice talks list tweening, squash and stretch and sound as the cheap tricks that make interaction feel alive, and they warn against "juice for the sake of juice" that distracts from the goal [51][53]. So the puff is small and fast, and only primary buttons get dots.

**Debounce.** Each button ignores activations closer than 0.15 s apart. Purchase and claim buttons lock until the server replies (Rule 38).

## Motion timing

| Preset | Duration | Easing | Use |
|---|---|---|---|
| `Press` | 0.06 s | Quad Out | Button down |
| `Release` | 0.18 s | Back Out | Button up, selection grow |
| `Hover` | 0.12 s | Quad Out | Mouse hover |
| `Fade` | 0.20 s | Quad Out | Dim, blur, toast fade-in, tab body fade |
| `Slide` | 0.22 s | Quad Out | Toast slide, tab indicator, list item insert |
| `Open` | 0.24 s | Back Out | Window and popup open (Pop 0.85→1) |
| `Close` | 0.15 s | Quad In | Window close (Pop 1→0.9) |
| `Pop` | 0.30 s | Back Out | Badge appear, reward card appear, counter pulse |
| `Reveal` | 0.50 s | Back Out | Hatch result card, rarity banner drop |
| `Pulse` | 0.70 s each way, looping | Sine InOut | Claimable glow (one cycle 1.4 s) |
| `Spin` | 6 s per revolution, looping | Linear | Sunburst behind rewards |
| Counter roll | 0.40 s | Quad Out (via `GetValue`) | Currency number roll |
| Float "+N" | 0.60 s | Quad Out | Rise 24 dp and fade |
| Fly-to | 0.50–0.80 s, 30 ms stagger | Quad In on the path | Reward icons to counter |
| Toast life | 2.8 s visible + 0.25 s fade | | |
| Popup minimum before skip | 0.5 s | | |
| Tier-4 reveal total | 1.5–2.0 s | | Banner, card, burst, sound |

Rules of motion:
- **Fast in, slower out for feedback; slower in, fast out for windows.** The player's tap gets an instant response, and a window gets out of the way quickly.
- **Back for things that arrive, Quad for things that leave.** Back's slight overshoot reads as springy [27]. Leaving shouldn't bounce.
- **Never stack tweens on one property.** A newer tween on the same property cancels the older one [28]. Chain them with `Completed` or use separate properties (Position vs. the `Press` scale).
- **Nothing ambient is faster than 1 Hz.** Claimable glows pulse at 1.4 s per cycle. Shines sweep once every 3–4 s.
- **Under reduced motion,** all of the above become instant except fades, which drop to 0.1 s [15].

## Component recipes

Each recipe gives the purpose, the exact layout in dp, every state, the animation, how it's wired, and phone notes. Sizes are Wide/PC unless marked Compact (phone). Build each component once in `UIKit` or as a template, and reuse it everywhere.

### 1. Buy button

**Purpose:** the single most important control in the game. It turns a desire into a purchase, or explains why not.
**Layout:** 240×80 dp (Compact 200×72). Face `Radius.M`, 3 dp `Stroke.Border` in the edge color, a 6 dp lip, and a top-light gradient. Contents in a horizontal `UIListLayout` (center, 8 dp padding): currency icon 40 dp + price in `Number` 30–36 dp (Fredoka One, 2 dp Ink stroke). An optional caption line *under* the button (outside it, Caption 22 dp) holds a timer or requirement.
**States (exact):**

| State | Face / Edge | Content | Caption under | Tap does |
|---|---|---|---|---|
| `Buy` | Go / GoEdge (in-game currency) or Gold / GoldEdge (Robux) | [icon] 1.2K | none | Purchase request (server) or Roblox prompt |
| `Need` | Disabled face, Warn price text | [icon] 1.2K, price in Warn | "Need 300 more" (Warn) | Opens "Get more" popup (Rule 32) |
| `Locked` | Disabled / Ink 0.6 | [padlock 36 dp] LOCKED | "Reach Zone 3" (TextSoft) | Toast with the requirement; pointer to the unlock if onboarding |
| `Owned` | PanelRaised, 2 dp Go border | [check 32 dp] OWNED | none | Nothing (light shake) |
| `Equipped` | Info / InfoEdge | [check] EQUIPPED | none | Unequip (if allowed) |
| `SoldOut` | Disabled | NO STOCK | "Restock 2:41" (Warn, live) | Toast "Back in 2:41" |
| `Processing` | Current face at 0.2 darker | 28 dp spinner | none | Ignored |

**Animation:** standard button feel. On becoming `Buy` from `Need` (the player just earned enough), the face pulses once (Pop 1→1.08→1) and plays a soft "ready" ding. That's an underrated cue that pulls players back to the shop. On a successful purchase: success flash, then the new state (usually `Owned`, or `Buy` at the next price for repeatables).
**Wiring:** `BuyButton.setState(button, state, { price = n, currency = "Coins", caption = "..."})` is the only writer. The shop module recomputes states when any of these change: the balance attribute, ownership, stock, unlocks. For in-game currency the button calls `Remotes.Purchase:InvokeServer(itemId)`. For Robux it calls `MarketplaceService:PromptGamePassPurchase` / `PromptProductPurchase` [29] and waits in `Processing` until the matching `PromptGamePassPurchaseFinished` / `PromptProductPurchaseFinished` fires. The server is what grants ([[09 Shops and Monetization]], [30] on `ProcessReceipt`, which only one script may set).
**Grow a Garden reference:** a sold-out item shows a grey "NO STOCK" button, and the shop restocks on a short timer [61]. The timer under our SoldOut button is that pattern.
**Phone:** never put two buy buttons closer than 12 dp. Captions sit below, never inside, so the price stays big.

### 2. Currency counter

**Purpose:** always shows what the player has, celebrates gains, and is the shortcut to more.
**Layout:** a pill 200×52 dp (`Radius.Pill`, Ink at 0.25 transparency, 2 dp Ink border). The icon (44 dp) overlaps the pill's left edge by 8 dp and is vertically centered. The number is `Number` 36 dp, left-aligned 44 dp from the pill's left, white with a 2 dp stroke. The + button is a 40 dp Go circle with a white plus, 6 dp inside the right end.
**Number display:** `Format.abbrev`. Full digits with commas below 10,000, then 3 significant digits (Rule 19). Max width: "999.9Qa" must fit, so test with that string.
**Animation:** count roll 0.4 s. On a gain, a "+N" (Caption 22, Go with stroke) rises 24 dp from the number's right edge and fades over 0.6 s, and the icon pulses 1→1.15→1 (Pop). Big gains (≥ 10% of the balance) also shine the pill: a white `UIGradient` stripe sweeps across in 0.4 s. Spends roll down with no float. Big spends show "−N" in Danger.
**States:** normal. *Capped* (if the game has a storage cap, e.g. backpack): the number turns Warn and a small "MAX" chip appears, with a toast "Bag full! Sell" the first time. *Event currency:* the pill uses the event hue border.
**Wiring:** `Counter.bind(label, "Coins")` reads player attributes set by the server. + calls `Windows.open("Shop", { section = "Coins" })` (Rule 58).
**Phone:** at most 2 counters on small phones (the 3rd moves into the shop footer). The pill sits top-right, outside every thumb zone.

### 3. HUD tile

**Purpose:** opens a window. It's the HUD's whole vocabulary.
**Layout:** 80×80 dp, `Radius.M` 18 dp (use `UDim.new(0, 18)` for tiles), face in the target window's hue with a top-light gradient, 3 dp border in the hue darkened 35%, and a 5 dp lip. Icon 52 dp centered 6 dp above center. Label (Micro 21 dp, Fredoka One here for chunkiness, 1.5 dp stroke) along the bottom inside the tile, *or* no label if the icon is unmistakable and the game's audience is very young. Badge slot at the top-right (recipe 21). Hotkey chip (PC) at the top-left, 26 dp.
**States:** normal; pressed (button feel); *highlighted* (tutorial: a white 4 dp stroke pulsing 0→0.6 transparency at 1.4 s per cycle, plus the pointer); *disabled* (feature not unlocked yet: the face uses Disabled, a padlock replaces the icon, and a tap toasts "Unlocks at Level 5"); *active* (its window is open: a white 3 dp border).
**Animation:** standard feel. When a tile first unlocks: it pops from 0 to 1 with Back over 0.35 s, gets a sparkle burst and a toast "New: Index!", and gets a badge.
**Wiring:** `Button.bind(tile, function() Windows.toggle("Pets") end)`.
**Phone:** 2×2 grid at the left-middle (Rule 8, layout above). 12 dp gaps. Labels are strongly recommended on phones for the first session, because icons are learned, not known.

### 4. Shop window

**Purpose:** sells passes, currency, boosts and bundles with no pressure and no confusion.
**Layout (Wide 880×560):** gold banner "SHOP". Left rail of section tabs (Featured, Passes, Currency, Boosts), 160 dp wide on Wide, or a 72 dp icon rail on Compact. Body is a vertical `ScrollingFrame` (`ScrollingDirection = Y`, `AutomaticCanvasSize = Y`, `ScrollBarThickness` 8 dp in TextMuted) with section headers (Heading 32 dp) and anchor frames named after each section. Footer: the player's currency pills.
**Sections:**
- **Featured:** one hero card spanning the full width (820×200 dp): bundle art left, name in Heading, 2–3 Caption benefit lines, and a Gold buy button on the right. At most one ribbon ("BEST VALUE", Gold, 40 dp tall, rotated −8°) in the whole shop, and only when it's true by the numbers ([[09 Shops and Monetization]]).
- **Passes:** grid of pass cards (recipe 5), 3 columns Wide, 2 columns Compact.
- **Currency:** product ladder (recipe 6).
- **Boosts:** rows of 120 dp tall cards with icon, duration ("30 min") and price, plus active-boost timers shown in a row at the top of the section.
**States:** loading prices (cards show "…" prices, Rule 30); restricted region (Robux random offers hidden, Rule 34); empty section (hidden, not empty).
**Animation:** window pop. A section jump scrolls with a 0.3 s Quad tween of `CanvasPosition`, then the header pulses.
**Wiring:** `Windows.open("Shop", { section = "Passes" })`. Card buy buttons follow recipe 1. Owned passes stay in the grid as `Owned`, so players see what they have.
**First session:** the Shop tile exists, but the window never opens by itself (Rule 35).
**DevForum references:** community shop tutorials build exactly this structure (background, tab buttons, purchase button, currency icons) [47] and recommend sketching it before building [46].

### 5. Pass card

**Purpose:** sells one permanent benefit, readable in one second.
**Layout:** 260×320 dp (Compact 240×300), PanelRaised, `Radius.M`, 2 dp Line border (3 dp Gold if it's the featured pass). From the top: art well 260×150 (PanelSunken, art 140 dp centered, a soft radial glow behind in the pass's accent), name in Heading 28 dp (one line, e.g. "2x Coins"), benefit in Caption 22 dp TextSoft (max 2 lines, e.g. "Doubles all coins forever"), and a buy button 220×68 at the bottom with 12 dp padding.
**States:** Buy (Gold face with the Robux price from `Prices.get`), Owned (check, PanelRaised face, 2 dp Go card border), Processing.
**Animation:** a subtle shine across the art every 4 s, only on the featured card. Hover on PC lifts the card 4 dp.
**Wording:** the name says the effect ("2x Coins", "+1 Pet Slot", "Auto Hatch"), not a brand ("Golden Paw Pass"). Benefit lines name the number.
**Stacking:** if passes multiply each other, say so on the card ("Stacks with Lucky"). Pet Simulator 99's wiki lists its luck gamepasses as stacking boosts to egg luck [55], which players need to know when choosing.
**Phone:** 2 columns, and the name never wraps (shorten it instead).

### 6. Product ladder

**Purpose:** sells repeatable currency packs in clear steps.
**Layout:** 5–6 cards in a row (Wide), or a 2-column grid (Compact). Each card is 150×210 dp: a currency pile illustration that grows with the tier (60→120 dp), the amount in Number 36 dp ("12,500"), a bonus chip (Micro on Go: "+25%") from tier 3 up, and a Gold buy button with the Robux price at the bottom. The biggest pack sits at the right end.
**The math shown is real:** the bonus percent is computed from the base tier's currency-per-Robux. `bonus = (amount / price) / (baseAmount / basePrice) − 1`, rounded down to a whole percent. Balance and Merchant set amounts, and the owner sets prices ([[04 Progression and Economy]], [[09 Shops and Monetization]]).
**States:** Buy, Processing. Products never show Owned.
**Animation:** after a purchase, the purchased card's currency pile bursts into a fly-to the counter (recipe 9).
**Wiring:** `MarketplaceService:PromptProductPurchase(player, productId)` [29]. The server's receipt handler grants. The client shows the reward when the server fires `Remotes.Reward`.
**Never:** "LIMITED!" on a permanent pack, or a fake strike-through price.

### 7. Egg / gacha card with odds

**Purpose:** sells a random outcome honestly and makes the chase exciting.
**Layout:** a world `BillboardGui` or `SurfaceGui` above the egg stand (ProximityPrompt to open), *and* an in-window card 520×440 dp:
- Header: egg name in Heading 32 and cost ([coin] 1.5K) in Number.
- **Pool grid:** a cell for every possible outcome, 96×120 dp each (pet icon 72 dp in a rarity-colored frame, rarity label in Micro, **percentage in Caption** below, e.g. "4.50%"). Sorted from most to least likely. The chase item (rarest) sits last with its own glow. The Bloxodes Pet Simulator 99 database lists each egg's world, unlock area, cost, pet pool and chase pet [56], which is the same information our card shows.
- Odds line: total "100%" shown in Micro under the grid. If a luck boost is active: "Lucky ×2 active — odds shown include it" in Warn, with the boosted numbers [19].
- Footer buttons: Open ×1 (Go, cost), Open ×3 (Go or Locked if a pass is required: "3x Hatch pass"), Auto (toggle chip, if owned). Each is 160×72 dp.
**Odds formatting:** percentages with enough decimals that the smallest non-zero outcome shows a non-zero number (at least 2 decimals). Below 0.1% also show "1 in N" under it. The values are generated from the server's weights table and rounded so they sum to exactly 100% (largest-remainder code under "Luau"). Policy requires every outcome and numeric odds as percentages totaling 100%, disclosed before spending, for Robux or Robux-purchasable currency, including keys and tickets [19].
**States:** Affordable, Need (cost in Warn), Locked (zone not reached), Restricted (Robux-random hidden by policy, Rule 34), Opening (buttons Processing).
**Animation:** the open sequence is egg shakes (3 wobbles over 0.6 s, which can be skipped with the Quick-open setting) → crack flash → reveal card (recipe 8) at the rarity's tier. Multi-open shows a grid of results revealed in order, 0.12 s apart.
**Wiring:** the client sends `Remotes.Hatch:InvokeServer(eggId, count)` and the server rolls and returns results. The UI never rolls.

### 8. Reward popup

**Purpose:** makes a good outcome feel great, at a strength that matches its rarity.
**Layout (tier 2–3, compact):** card 480×360 dp, Panel with a 4 dp rarity border, a rarity banner (ribbon in the rarity color, 300×64 dp, Title 40 "EPIC!") overhanging the top, item icon 180 dp on a sunburst (ImageLabel 320 dp, rarity color at 0.6 transparency, spinning 1 rev / 6 s), name in Heading, stat line in Caption ("+35% coins"), and buttons [Awesome!] (Go, 220×72) and optional [Equip] (Info).
**Layout (tier 4, full screen):** the dim layer goes to 0.3 transparency, a 0.15 s white flash plays at 0.6 transparency (skipped under reduced motion), the banner (Display 64 "LEGENDARY!") drops from −80 dp with Back over 0.5 s, the card pops 0.3 s later, a burst of 16 sparkle images flies outward, and a sound sting plays. "Tap to continue" (Caption, pulsing) appears at 1.5 s.
**Timing:** minimum 0.5 s before input closes it (Rule 23). Tier 2–3 auto-close at 4 s. Tier 4 waits for a tap.
**Batching:** rewards that arrive within 0.3 s of each other merge into one popup with a grid.
**Wiring:** `RewardFX.present({ id, rarity, amount, icon, name })` from `Remotes.Reward`. Tier 1 rewards never open a popup. They go to `RewardFX.flyTo` plus a toast.
**Phone:** card 420×320 dp Compact, and buttons stack vertically if both are present.

### 9. Reward burst (fly-to)

**Purpose:** shows where a reward went and makes collection tactile.
**Spec:** 6–12 icons (coins: 36 dp) spawn at the source point, either a world position projected with `camera:WorldToScreenPoint` or the center of a UI element. Each gets a random outward offset of 30–70 dp and a quadratic curve to the target counter's icon center. Duration is 0.5–0.8 s with a 30 ms stagger and Quad In along the path, and each icon scales 1→0.6 on arrival. The first arrival pulses the target (Pop) and starts the counter roll. Each arrival plays a soft tick, at most 4 ticks per burst.
**Implementation:** icons live in the FX layer (a ScreenGui with the same insets as the HUD). Positions are computed relative to the FX root: `target.AbsolutePosition + target.AbsoluteSize / 2 - fxRoot.AbsolutePosition`. Pool the ImageLabels (keep 24 and reuse them). Code under "Luau".
**Budget:** at most 2 bursts at once. Extra bursts within 0.2 s merge. Under reduced motion there are no flying icons, only the counter pulse and float.

### 10. Toast

**Purpose:** a short, non-blocking message.
**Layout:** pill 56 dp tall, width hugging the text (`AutomaticSize = X`, minimum 220 dp, maximum 560 dp), Panel at 0.1 transparency (honoring PreferredTransparency, Rule 27), a 6 dp left bar in the kind color, a 32 dp icon, and Body 24 text. Stack: top-center, starting 80 dp from the top of the safe area, vertical `UIListLayout` with 8 dp padding, newest at the bottom.
**Kinds:** `info` (Info bar, "i" icon), `good` (Go, check), `bad` (Danger, "!"), `reward` (Gold, item icon).
**Behaviour:** at most 3 visible. A 4th pushes out the oldest. An identical text within 3 s merges and bumps the counter ("×2"). Life is 2.8 s, then a 0.25 s fade. Slide in from −16 dp with a fade over 0.18 s. Toasts never take input.
**Copy:** at most 32 characters. Toasts come from the server through `Remotes.Toast` with a *message key* (`"NotEnoughCoins"`), and the client looks up localized text in `Theme.Copy`.

### 11. Daily calendar

**Purpose:** brings players back each day and shows them what's next.
**Layout (Wide):** orange banner "DAILY REWARDS". A 7-cell row (or a 4×7 grid for a 28-day cycle), cells 104×136 dp, 10 dp gap. Each cell: "Day N" (Caption) at the top, reward icon 64 dp, amount (Number 26), and a state overlay. Under the row: a timer "Next reward in 13:22:10" (Caption, Warn) and a big Claim button (280×80, Go) when available. Day 7 is double width with a bigger reward and a Gold border.
**Cell states:** `Claimed` (dimmed to 0.5 with a large Go check overlay), `Today` (pulsing Warn glow at 1.4 s per cycle, lifted 6 dp, "CLAIM" chip), `Future` (normal, padlock chip), `Missed` (only if the streak resets: shown with a grey X; better to avoid by design and let the streak simply restart at Day 1).
**Logic (server):** day index = `math.floor(os.time() / 86400)` (UTC days). The streak continues if the last claim was yesterday, otherwise it resets to Day 1. The next reset is in `86400 - os.time() % 86400` seconds. Code under "Luau". The client only renders state from the store and calls `Remotes.ClaimDaily`.
**Entry:** a HUD tile or an icon inside Quests, badged "1" when claimable (Rule 36). On join, if a claim is available, the HUD tile pops, and the window opens by itself only from the second session onward, once per day, after the player has been in the world for 3 s.
**Animation:** claim → the cell flips (Size X 1→0→1 over 0.3 s, swapping to the claimed face at the midpoint) → reward fly-to → the next cell gets a subtle "tomorrow" bounce.

### 12. Quest tracker

**Purpose:** tells the player what to do and how close they are.
**HUD pill (objective):** 440×60 dp at top-center: a 40 dp icon, a Body 24 line ("Collect 50 coins"), a right-aligned progress number (Caption "23/50"), and a 6 dp progress bar along the pill's bottom inside its rounded edge (Go fill on a PanelSunken track). Tapping it opens the Quests window.
**Multiple quests:** the HUD shows only the pinned quest (1 line). On tablet/PC an expandable tracker under the pill shows up to 3 (each 48 dp). Everything else lives in the window.
**Quests window:** green banner, tabs (Daily, Main, Event), rows 96 dp: icon, title (Body), description (Caption), progress bar 8 dp, and the reward chip on the right (icon + amount). Claimable rows show a Claim button (Go) and get a badge on the tab.
**States:** active, complete-unclaimed (the HUD pill flashes Go, shows a check, and a "CLAIM" chip appears for 3 s), claimed (moves to the bottom, dimmed), locked (padlock, requirement in Caption).
**Animation:** progress bar fills tween 0.25 s on each increment, and a "+1" floats from the pill. On completion: flash, check, sound, then the next objective slides in from the right (Slide).
**References:** Bee Swarm Simulator delivers quests through NPC bears. Brown Bear gives repeatable quests with a new one available an hour after starting one, always rewarding a ticket, royal jelly and a scaling amount of honey [65]. Science Bear has 31 quests across two series [66]. The Sticker-Seeker machine gives endless quests with milestone rewards up to the 1000th [67]. Each of those quests shows up the same way in a tracker: title, progress, reward.

### 13. Index / collection book

**Purpose:** turns collecting into a visible goal with milestones.
**Layout:** pink banner "INDEX". Tabs per world or zone. A completion bar at the top (Heading "47 / 120 — 39%", bar 600×20 dp) with milestone markers at 25/50/75/100% (each a reward icon chip above the bar, claimable ones glowing). Grid of cells 104×124 dp: discovered = icon in a rarity frame plus name (Micro). Undiscovered = a silhouette (the icon at Ink color with 0.2 transparency, `ImageColor3 = Ink`) and "???". Variant rows (Gold, Rainbow, Shiny) as separate tabs or toggle chips.
**Detail on tap:** a mini panel showing where it's found ("Found in: Candy Egg"), its rarity and odds, and owned count. Undiscovered entries show only the source, which turns the book into a hint system.
**References:** Pet Simulator 99 puts a Reward option at the bottom of its Index menu, where index coins earned per indexed pet buy items [57], and guides describe Index Tokens unlocked as the collection grows, gated behind Rebirth 3 [58]. Steal the pattern of "the book itself pays you".
**States:** milestone claimable (glow + badge on the Index tile), all done (gold border on the tab, "COMPLETE" stamp).

### 14. Inventory grid

**Purpose:** shows what the player owns and lets them equip, compare and clean up fast.
**Layout (Wide):** blue banner "PETS" (or "ITEMS"). Top bar: capacity "47/50" (Number 26, Warn when 90% or more full) + a "+" (opens the slots pass/product), sort chip (Rarity / Power / New), filter chips (All, Equipped, Locked), and a search box (PC/tablet only). Body: a ScrollingFrame with a `UIGridLayout` of 104×124 dp cells, 10 dp `CellPadding`, `FillDirectionMaxCells` computed from width (6 on Wide, 4 on Compact). Right side (Wide): item detail panel 300 dp wide (recipe 15). Bottom bar: [Equip Best] (Go), [Multi-delete] (Danger outline).
**Cell:** a PanelSunken well, rarity frame 3–4 dp (Rule 28 shapes), icon 72 dp, an equipped check chip (Go, top-left), a lock chip (top-right), a stack count "×3" (Micro, bottom-right), and a level/power line (Micro, bottom). Selected = 3 dp white border with a 1.04 scale.
**States:** normal, selected, equipped, locked, new (a small "NEW" chip until viewed), multi-select mode (checkbox overlay, Danger tint on selected cells, a "Delete 5" button in the footer).
**Performance:** build cells from a pool and use static images rather than ViewportFrames in the grid. Over 200 items, page or virtualize (Rule 44).
**Phone (Compact):** 4 columns. Tapping a cell opens the detail panel as a full-card view with a back arrow. Search is hidden (typing is painful on phones, see [[08 Mobile]]), and filters are chips instead.

### 15. Item detail panel

**Purpose:** answers "what is this, is it better, what can I do with it".
**Layout:** 300×480 dp panel (Wide, right side) or full card (Compact). From the top: big icon 160 dp on a rarity sunburst (static, not spinning, inside a window), name in Heading 28, rarity chip, stats list (rows 40 dp: stat name in Caption, value in Number 24, and a delta vs. the equipped item in Go "▲ +12%" or Danger "▼ −5%"), source line in Caption ("From: Candy Egg"), and buttons: [Equip/Unequip] (Go/Info), [Lock] (toggle, padlock icon), [Delete] (Danger, confirm), [Trade] (if trading exists).
**3D preview:** optional `ViewportFrame` with the model rotating slowly (1 rev / 8 s), only in the detail panel and only one at a time. Each ViewportFrame renders its own scene, which costs frames on phones.
**States:** equipped, locked (Delete disabled with "Unlock first"), tradeable or not (Trade hidden).
**Sol's RNG reference:** auras land in storage and have to be opened and equipped before they show on the avatar. The game also offers rarity-based safety settings such as auto-equip rarity and delete or swap warnings [63]. The detail panel is where those warnings belong.

### 16. Settings

**Purpose:** gives players control and keeps them in the game.
**Layout:** slate banner "SETTINGS". A vertical list of rows 72 dp tall (PanelRaised, `Radius.M`, 8 dp gap): icon 36 dp, label in Body, and a control on the right. Sections: Audio, Visual, Gameplay, Account.
**Controls:**
- **Toggle:** pill switch 88×44 dp (track: Go on, Disabled off; knob 36 dp white circle sliding 0.15 s). The whole row is the hit area.
- **Slider:** for volume, track 220×12 dp with a 36 dp knob, 10 steps. Build with a `UIDragDetector` (Roblox lists UI drag detectors among its interactive frameworks for 2D sliders [5]) or tap-to-step +/− buttons on each side (always include these for gamepad and accessibility).
- **Choice chips:** for quality (Low / Auto / High).
**Recommended rows:** Music volume, SFX volume, UI sound volume, Reduced effects (fewer particles, no blur), Hide other players' pets, Show damage numbers, Confirm before selling, Skip hatch animation (if not a pass), Quick reset of camera, and a "Codes" row that opens recipe 17.
**Persistence:** the client sends `Remotes.SetSetting:FireServer(key, value)` and the server validates against an allow-list and saves with player data, so settings follow the player across devices. Apply locally right away (optimistic), since settings are harmless.
**Don't** duplicate Roblox's own settings (graphics quality, camera sensitivity, Reduced Motion). Read them where useful (Rule 26).

### 17. Codes

**Purpose:** lets community codes from socials and update logs deliver rewards.
**Layout:** a teal window or a popup 520×300 dp: banner "CODES", `TextBox` 440×72 dp (PanelSunken, 2 dp Line border turning Info on focus, `PlaceholderText = "Enter code"` in TextMuted, Body 26 text, `ClearTextOnFocus = false`), a Redeem button 200×72 (Go), and a result line under it (Caption: Go for success, Danger for errors).
**Placement:** codes need typing, so put them in a predictable spot (a row in Settings plus an optional small HUD tile during code events). Guides for Blox Fruits describe its code entry as a small bird icon on the left side of the screen, and other guides describe a route through a gear menu instead [70][71]. When guides disagree about where your code box is, it's hard to find. Make it obvious.
**Server rules:** trim spaces, compare case-insensitively (uppercase both), allow one redemption per player per code (store the redeemed set in player data), expire with `os.time()` timestamps, rate-limit one attempt per 2 s per player, and return a message key. Code under "Luau".
**Result states:** success ("+500 Coins!" + reward fly-to), `Invalid` ("That code doesn't exist"), `Used` ("You already used this code"), `Expired` ("This code expired"), `TooFast` ("Slow down!"), `Error` ("Try again in a moment").
**Phone:** the text box sits in the top half of the window, because the on-screen keyboard covers the bottom half of the screen ([[08 Mobile]]). `AutoLocalize = false` on the box.

### 18. Rebirth panel

**Purpose:** sells a reset as a power-up, honestly.
**Layout:** purple banner "REBIRTH". At the top, the requirement progress: "Coins 820K / 1M" with a bar 600×24 dp (Special fill). Middle: two columns, **You keep** (Go header: pets, passes, rebirth tokens, index) and **You lose** (Danger header: coins, upgrades, zone progress), each a list of icon + Caption rows. A big multiplier line: "Coin boost ×2.0 → ×2.5" (Number 40, with an arrow in Special). Footer: a hold button "HOLD TO REBIRTH" 320×88 dp that fills left to right over 1.2 s (Special fill over Disabled), and a rebirth count chip ("Rebirth 4").
**States:** not ready (hold button Disabled, caption "Need 180K more", tapping shows the earning path), ready (the button pulses Special, and the HUD tile gets a badge), rebirthing (Processing), done.
**Animation on success:** full-screen tier-4 treatment: a Special flash, Display "REBIRTH!", the new multiplier counting up, and a burst. Then a short "Back to Zone 1" fade (Transition band, 0.4 s each way) while the server resets.
**Rules:** the hold and the keep/lose list are mandatory (Rule 40). The server checks the requirement again. Rebirth math lives in [[04 Progression and Economy]].

### 19. Leaderboard

**Purpose:** gives competitive players a goal and shows off top players.
**Layout (window):** gold-light banner "TOP PLAYERS". Tabs: All-time, Weekly, Friends (if built). Rows 64 dp: rank (Number 28, ranks 1–3 get gold, silver and bronze medal icons and row tints), avatar headshot 48 dp (`Players:GetUserThumbnailAsync(userId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size48x48)` in a pcall), display name (Body), and value (Number 26, abbreviated). The player's own row is pinned at the bottom of the panel in Info even when they're not in the top 50 ("#1,204 — You").
**World boards:** a `SurfaceGui` on a lobby board showing the top 10, which sells the leaderboard without a menu.
**Data:** the server reads an OrderedDataStore with `GetSortedAsync` (descending, page size 50). Roblox's tutorial builds exactly this: a leaderboard module that saves the score with `SetAsync` under the player's UserId and reads the top scores with `GetSortedAsync` [41]. Cache on the server and refresh every 60–120 s (a studio rule, to stay well within data store limits). Clients get the cached list through a RemoteFunction.
**States:** loading (skeleton rows, PanelRaised at 0.5), empty ("Be the first!"), error ("Leaderboard is resting — try later").
**Player list:** for one or two simple stats, Roblox's default player list with a `leaderstats` folder is enough. Build a custom board only when you need more, and then disable the default with `StarterGui:SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)` on the client.

### 20. Trade window

**Purpose:** lets two players swap items safely and clearly.
**Layout (Wide 880×560):** cyan banner "TRADE". Two columns, **You** (left) and **Them** (right, with headshot and name). Each column has a 3×3 grid of 96 dp slots (PanelSunken; filled slots show item cells). Between the columns, a status strip shows each side's state chip (Editing / Ready / Accepted). Below: your inventory drawer (a horizontal scrolling row of cells, 104 dp) to add items by tap. Footer: [Cancel] (Danger outline, left), [Ready] → [Accept] (Go, right), and quick-chat chips ("Add more?", "Deal!", "No thanks") above the footer.
**Flow:** both sides add items, tap Ready, then Accept, and a 5-second countdown runs ("Trading in 5…") during which either side can cancel. *Any* change to either side resets both to Editing and flashes the changed slot Warn. The server holds the authoritative trade state, locks offered items so they can't be deleted or equipped mid-trade, and swaps atomically in one save.
**Safety copy:** the first trade shows a one-time tip ("Only the items in the boxes are traded"). Never let players type item names that look like real items.
**Adopt Me references:** guides describe its trade window as showing both players' inventories with offered items in designated slots, where either side can accept, reject or adjust [59]. The window gained Quick Chat replies, typing indicators, the ability to spectate other trades, and verification icons [59], and a separate Trading Hub lets players post listings with an open Offer slot [60].
**Policy:** if the game allows trading items bought with Robux, check Roblox's policy for each player. The paid random items guidance mentions an `IsPaidItemTradingAllowed` policy value [19] (returned by `PolicyService:GetPolicyInfoForPlayerAsync`).
**Phone:** Compact stacks the columns as tabs (You / Them) with a persistent status strip, and the inventory drawer becomes a 4-column grid sheet.

### 21. Notification badges

**Purpose:** points at the one thing worth doing.
**Layout:** a circle 26 dp (count badge) or 18 dp (dot), Danger fill, 2 dp white border, Micro 21 dp white count with 1.5 dp stroke. Anchored (0.5, 0.5) at the tile's top-right corner, offset (−6, 6) so it overlaps the corner. Counts above 9 show "9+". "!" means claimable now.
**Priority and cap:** at most 2 badged tiles at once (Rule 36). The order is claimable reward > new item > new feature unlocked > info.
**Animation:** appear with Pop (0→1.15→1, 0.25 s). On a count increase, one small bump (1→1.1→1). No looping animation. Clear with a fade (0.15 s) when the target is viewed.
**Wiring:** `Badges.set(tile, value)`, where value is a number, `true` (dot) or `"!"`, and `Badges.clear(tile)`. Windows clear their own badges on open. Tab-level badges inside windows follow the same component.

### 22. Loading screen

**Purpose:** covers the join, sets the tone, and gets out fast.
**Layout:** a full-screen ScreenGui (`ScreenInsets = None`, DisplayOrder 100, `IgnoreGuiInset = true`) with the game's background color or a blurred key-art image. Logo at center (up to 420 dp wide), a progress bar 480×20 dp (rounded, Go fill on PanelSunken) below it, a rotating tip line (Body, TextSoft, a new tip every 4 s), and a Skip button (Info outline, 200×64) bottom-center that appears at 5 s.
**Behaviour:** the LocalScript in ReplicatedFirst parents the GUI to PlayerGui, calls `ReplicatedFirst:RemoveDefaultLoadingScreen()`, waits for `game:IsLoaded()` (or `game.Loaded`), preloads a short list with `ContentProvider:PreloadAsync`, then fades out over 0.4 s [31][33]. If anything is placed in ReplicatedFirst, the default screen is removed after about 5 s even if the function isn't called [32], so always call it yourself.
**Targets:** typical duration of 8 s or less. Skip available at 5 s. Never more than 40 preload entries (icons and sounds for the first 30 s). The first frame of the loading GUI shows within 1 s of join (keep its images tiny).
**Tips:** short gameplay tips ("Bigger eggs = rarer pets!"), never ads.

### 23. Tutorial pointer

**Purpose:** silently shows the next action.
**UI target:** a hand or arrow ImageLabel 72 dp in the Tutorial band, positioned at the target's edge (from `target.AbsolutePosition` relative to the Tutorial root), bobbing 10 dp toward the target with Sine InOut at 0.45 s each way. A ring pulse on the target (a ring frame scaling 1→1.3 and fading, every 1.2 s) and the target tile's highlighted state (recipe 3). Optional: dim everything except the target by putting four Ink frames around its rect at 0.4 transparency (spotlight).
**World target:** a ground `Beam` from the character's `HumanoidRootPart` attachment to an attachment on the target (arrow texture, `TextureMode = Wrap`, scrolling via `TextureSpeed`), plus a floating `BillboardGui` arrow above the target (`AlwaysOnTop = true`, 64×64 dp). When the target is off-screen, an edge arrow on the Tutorial layer points toward it: the position is clamped to the safe area inset by 48 dp, with rotation from the screen center to the projected point. When the target is behind the camera (`Z < 0`), flip the direction.
**Rules:** one pointer at a time. It shows after 6 s idle in onboarding, hides on the first input toward the goal, and is never shown pointing at a Robux purchase. Builder's onboarding drives `Pointer.show(target)` and `Pointer.hide()` ([[01 The First Five Minutes]]).

### 24. Confirm dialog

**Purpose:** stops expensive mistakes without nagging.
**Layout:** popup card 520×300 dp (Compact 440×280), Panel, `Radius.L`, no banner (a 48 dp icon at the top instead), title in Heading 30 ("Delete 12 pets?"), body in Body TextSoft (2 lines max, saying what's lost: "This can't be undone."), and two buttons 200×72: [Cancel] (PanelRaised, left) and [Confirm] (Go, or Danger for destructive, right). Hold-to-confirm variant: the confirm button fills over 1.2 s and its label reads "HOLD".
**Gamepad:** the default selection is Cancel for destructive actions and Confirm for harmless ones. B = Cancel.
**When not to use it:** never double-confirm Robux purchases (Roblox's prompt is the confirmation), and never confirm harmless reversible actions (equip, close).
**API:** `Confirm.ask({ title = ..., body = ..., confirm = "Delete", danger = true, hold = true }, function(ok) ... end)`. Only one confirm at a time. A second request queues.

### 25. Error states

**Purpose:** when something fails, the player knows what happened and what to do.

| Situation | Surface | Look | Copy example | Action offered |
|---|---|---|---|---|
| Field invalid (code, name) | Inline | Field border Danger, Caption Danger below, 2 shakes | "That code doesn't exist" | Edit field |
| Not enough currency | Button `Need` state + toast | Warn price | "Need 300 more coins" | Get more popup |
| Action on cooldown | Button | Timer replaces label | "Ready in 0:12" | None |
| Server didn't reply in 8 s | Toast `bad` + button back to normal | | "Didn't work — try again" | Retry by tapping |
| Purchase cancelled or failed | Button back to `Buy`, no toast if cancelled | | (cancel: silent) / "Purchase failed" | None |
| Inventory full | Toast + capacity in Warn | | "Bag full! Sell or delete" | Pointer to Sell |
| Data failed to load | Modal, blocks play | Danger icon | "Your save didn't load. Rejoin to keep it safe." | [Rejoin] button |
| Trade cancelled | Modal over trade | | "Trade cancelled — nothing changed" | [OK] |
| Feature not unlocked | Toast on tap | Padlock | "Unlocks at Level 5" | None |
| Empty list | Empty state (Rule 37) | Big icon | "No pets yet!" | [Find an egg] |
| Leaderboard or remote data unavailable | Inline in panel | Muted icon | "Taking a break — try later" | Retry in 60 s |

Write every string in `Theme.Copy` (8 words max, Rule 39), and never show raw error text from `pcall` to players. Log it for Playtest instead.

### Extra: hold button (used by rebirth, multi-delete, trade accept on phones)

A button whose face is a Disabled track with a fill frame inside (`Size = UDim2.fromScale(progress, 1)`, the action color). On press start (`InputBegan` with Touch or MouseButton1), fill over 1.2 s via Heartbeat. On release before full, the fill drains back in 0.2 s. When it's full, fire the action and play the success flash. The label changes "HOLD" → "KEEP HOLDING" at 30%. Gamepad: hold ButtonA through `ContextActionService` while the button is selected, or fall back to a two-step confirm dialog.

### Extra: progress bar

Track: PanelSunken with `Radius.Pill`. Fill: an inner frame with the same radius, `Size = UDim2.fromScale(p, 1)`, the action color with a top-light gradient, and `ClipsDescendants` on the track. At very small `p`, the rounded fill looks odd, so set a minimum visual width of the bar's height when `p` > 0. Tween fill changes over 0.25 s. Overflow (level up): the fill completes, flashes white, resets to 0 and continues with the remainder.

## Luau UI architecture

### Where things live

```
StarterGui/                         (Frame) ScreenGui templates, ResetOnSpawn = false
  HUD            DisplayOrder 10   CoreUISafeInsets
    Currency     (AutoScale tag)   anchor (1,0)
    Objective    (AutoScale tag)   anchor (0.5,0)
    Menu         (AutoScale tag)   anchor (0,0.42)
    Actions      (AutoScale tag)   anchor (1,1)
  Dim            DisplayOrder 19   ScreenInsets None   Frame "Shade"
  Windows        DisplayOrder 20   one Frame per window (AutoScale tag) > Card (UIScale "Pop")
    Template                        the shell to duplicate
  Popups         DisplayOrder 30   Reward, Confirm, GetMore, Error
  FX             DisplayOrder 35   Root (full-size Frame, not AutoScaled) for fly-to icons
  Toasts         DisplayOrder 40   Stack (UIListLayout)
  Tutorial       DisplayOrder 45   Pointer, EdgeArrow, Spotlight
  Transition     DisplayOrder 50   ScreenInsets None   Fade
StarterPlayer/StarterPlayerScripts/
  UIController   (LocalScript)     boots the kit, binds HUD, wires remotes
  UI/            (Frame) ModuleScripts
    Theme Motion Format Scale Button Windows Popups Toasts Badges
    Counter RewardFX Prices Store Pointer Confirm UIKit
    Screens/     Shop Inventory Index Daily Quests Settings Codes Rebirth Leaderboard Trade
ReplicatedFirst/
  Loading        (LocalScript) + LoadingGui (ScreenGui child)
ReplicatedStorage/
  Remotes/       (Builder) DataSync, Toast, Reward, Purchase, Hatch, ClaimDaily, RedeemCode, ...
  Assets/UI/     (Librarian) Icons, Images (9-slice), Sounds/UI
ServerScriptService/  (Builder, Merchant) validation, data, receipts
```

### Data flow

```
 server data (ProfileStore/DataStore)        <- [[13 Building It Right]]
      |  player:SetAttribute("Coins", n)                (simple values)
      |  Remotes.DataSync:FireClient(p, key, value)     (tables)
      v
 client Store  --signals-->  Screens / Counter / Badges / BuyButtons
      ^                                   |
      |  reply                            |  Button.bind -> request
      +---------- Remotes.X:InvokeServer(...) <----+
                     (server validates, changes data, replies, fires Reward/Toast)
```

Principles:
1. **Server-authoritative.** UI requests, the server decides (Rule 47). Every remote handler on the server type-checks its arguments (`typeof(x) == "string"`), clamps them, and rate-limits.
2. **One store, many subscribers.** Screens never cache their own copies of data. They read `Store.get(key)` and `Store.observe(key, fn)`.
3. **Screens are modules with `init(root)`, `open(args)`, `close()`, `refresh()`.** `Windows` calls `open` and `close`. A screen builds its dynamic cells on `open` (from a pool) and releases them on `close` if the list is big.
4. **No global state in LocalScripts.** Everything goes through modules, so a hot reload or a respawn never doubles anything.
5. **Connections are owned.** Each screen keeps a list of its connections (`table.insert(self.conns, signal:Connect(...))`) and disconnects them in `close` or `destroy`. Long-lived HUD connections are created once in `UIController`.
6. **Declarative frameworks are optional.** Roact is deprecated [42]. React-lua is a close port of React and is maintained [43], and Fusion is another option. They help avoid stuck-state bugs in complex UIs. For our games, plain modules with the patterns on this page are the default, because every agent can read them. A game may adopt React-lua only if Architect writes it into `plan.md`, and then the whole UI uses it.

### UIKit factories (the shape of every element)

Every factory sets properties first and `Parent` last, reads all style from Theme, and returns the instance. The signatures every agent can rely on:

```lua
UIKit.label(props: { text: string, size: number?, font: Font?, color: Color3?, stroke: number?, localize: boolean? }): TextLabel
UIKit.button(props: { text: string?, icon: string?, kind: "Go" | "Gold" | "Info" | "Danger" | "Special" | "Flat", size: Vector2 }): ImageButton
UIKit.pill(props: { size: Vector2, color: Color3?, transparency: number? }): Frame
UIKit.cell(props: { icon: string, rarity: string, count: number?, equipped: boolean?, locked: boolean? }): ImageButton
UIKit.corner(parent: GuiObject, radius: UDim?): UICorner
UIKit.stroke(parent: GuiObject, thickness: number, color: Color3?, mode: Enum.ApplyStrokeMode?): UIStroke
UIKit.padding(parent: GuiObject, all: number): UIPadding
```

Example: the label factory.

```lua
--!strict
-- UI/UIKit (excerpt)
local Theme = require(script.Parent.Theme)
local UIKit = {}

function UIKit.stroke(parent: GuiObject, thickness: number, color: Color3?, mode: Enum.ApplyStrokeMode?): UIStroke
	local s = Instance.new("UIStroke")
	s.Thickness = thickness
	s.Color = color or Theme.Color.Ink
	s.ApplyStrokeMode = mode or Enum.ApplyStrokeMode.Contextual
	s.LineJoinMode = Enum.LineJoinMode.Round
	s.Parent = parent
	return s
end

function UIKit.label(props: { text: string, size: number?, font: Font?, color: Color3?, stroke: number?, localize: boolean? }): TextLabel
	local l = Instance.new("TextLabel")
	l.BackgroundTransparency = 1
	l.Text = props.text
	l.TextSize = props.size or Theme.Text.Body
	l.FontFace = props.font or Theme.Font.Body
	l.TextColor3 = props.color or Theme.Color.Text
	l.TextWrapped = true
	l.AutomaticSize = Enum.AutomaticSize.XY
	l.AutoLocalize = if props.localize == false then false else true
	if props.stroke and props.stroke > 0 then
		UIKit.stroke(l, props.stroke)
	end
	return l -- caller sets Position/LayoutOrder, then Parent
end

return UIKit
```

## Accessibility

Accessibility is part of the spec, not an extra. These rules make the game better for everyone, including young players, players outdoors on phones, and players with disabilities. Roblox publishes accessibility guidelines and exposes several of the player's preferences to experiences [15].

| Need | What we do | API / setting |
|---|---|---|
| Reduced motion | All tweens through `Motion.tween`, which makes them instant; flashes, shakes, sunbursts and fly-tos off | `GuiService.ReducedMotionEnabled` [15] |
| Solid backgrounds | Tagged panels multiply their base transparency by the preference | `GuiService.PreferredTransparency` [15] |
| Larger text | No hard text caps below 1.5× base; layouts use `AutomaticSize` so bigger text grows boxes | `GuiService.PreferredTextSize` (Medium default, up to Largest) [15] |
| Color vision | Every color-coded meaning also has a label, icon or shape (Rule 28) | Grayscale screenshot check |
| Contrast | Text ≥ 4.5:1 against its background; strokes on all text over the world (Rules 17, 29) | Theme pairs |
| Motor | Targets ≥ 44 px, 8 px gaps (Rule 7); holds have tap alternatives where safe; no fast multi-tap requirements in UI | |
| Hearing | Every sound cue has a visual (toast, flash, badge); no information only in audio | |
| Reading | 1–2 word buttons with icons; ≤ 8-word errors; numbers instead of words where possible | |
| Cognitive | One window at a time, one objective, one primary button per screen; consistent close position | |
| Photosensitivity | No full-screen flash brighter than 0.6 transparency white; never more than 3 flashes per second | |
| Input choice | Everything reachable by touch, mouse, keyboard and gamepad (Rules 41–43) | `Activated`, `GuiService:Select` |
| Language | AutoLocalize on UI text, room for 30% longer strings, no concatenated sentences (Rules 18, 53) | [44][45] |

Reading the preferences:

```lua
--!strict
-- UI/Motion
local GuiService = game:GetService("GuiService")
local TweenService = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")

local Motion = {}
local INSTANT = TweenInfo.new(0)

function Motion.reduced(): boolean
	return GuiService.ReducedMotionEnabled
end

function Motion.tween(obj: Instance, info: TweenInfo, goal: { [string]: any }): Tween
	local t = TweenService:Create(obj, if Motion.reduced() then INSTANT else info, goal)
	t:Play()
	return t
end

-- Preferred transparency: tagged panels store their design transparency in an attribute.
local function applyTransparency(obj: Instance)
	if obj:IsA("GuiObject") then
		local base = obj:GetAttribute("BaseTransparency")
		if typeof(base) ~= "number" then
			base = obj.BackgroundTransparency
			obj:SetAttribute("BaseTransparency", base)
		end
		obj.BackgroundTransparency = (base :: number) * GuiService.PreferredTransparency
	end
end

for _, obj in CollectionService:GetTagged("PrefTransparency") do applyTransparency(obj) end
CollectionService:GetInstanceAddedSignal("PrefTransparency"):Connect(applyTransparency)
GuiService:GetPropertyChangedSignal("PreferredTransparency"):Connect(function()
	for _, obj in CollectionService:GetTagged("PrefTransparency") do applyTransparency(obj) end
end)

return Motion
```

## Examples from top games

### A sold-out button that explains itself
**Game:** Grow a Garden ([61], [62])
**Shows:** guides describe a seed shop whose stock refreshes on a short timer (five minutes in the original game). A sold-out item's purchase button turns grey and reads "NO STOCK" [61]. Community trackers for the sequel describe separate restock cadences for seeds, gear, eggs and cosmetics [62].
**Why it works:** the button says the reason, and the timer gives a reason to stay or come back.
**Steal:** our `SoldOut` state with a live server-time restock caption, and separate visible timers per shop.
**Avoid:** fake "only 1 left" counts or timers that don't match the real restock (Rule 60).

### Pass cards that say they stack
**Game:** Pet Simulator 99 ([55])
**Shows:** the wiki's gamepass list includes egg-luck passes and notes that the luck boosts stack [55].
**Why it works:** players buying a second luck pass want to know whether it adds to the first. Stating the stacking removes doubt at the moment of purchase.
**Steal:** a "Stacks with Lucky" line on pass cards, and boosted odds shown on the egg card when boosts are active (Rule 33).
**Avoid:** vague names that hide the effect. The name should be the effect ("+200% Egg Luck").

### The collection book that pays
**Game:** Pet Simulator 99 ([57], [58])
**Shows:** the Index menu has a Reward option at its bottom, where index coins (one per newly indexed pet) buy items [57]. Guides also describe Index Tokens unlocked as the collection grows, gated behind Rebirth 3 [58].
**Why it works:** the index becomes a second progression loop. Every new species is visibly worth something, even a common one.
**Steal:** milestone rewards on the completion bar and a reward shop inside the Index window (recipe 13).
**Avoid:** an index that's only a list. If it doesn't pay, nobody opens it after day one.

### Egg info that shows the pool and the chase
**Game:** Pet Simulator 99 ([56])
**Shows:** a community database lists, for each egg, its world, unlock area, cost, possible pets and the "chase" pet [56].
**Why it works:** the chase pet is the reason to open egg number 200, and the pool lets players plan.
**Steal:** the egg card layout. Every outcome with its percentage, the chase cell last with a glow, and the cost and unlock area in the header (recipe 7).
**Avoid:** hiding the pool until after purchase. For paid random items that's against policy [19].

### An auto toggle right under the main button
**Game:** Sol's RNG ([63], [64])
**Shows:** Auto Roll sits under the Roll button and keeps rolling until switched off. Guides say it's unlocked by joining the developer's Roblox group, and that the game auto-rejoins every 20 minutes while it's on [63]. Sportskeeda also describes it as free and AFK-friendly [64].
**Why it works:** the most repeated action gets a one-tap automation in exactly the place the thumb already is.
**Steal:** put the Auto chip directly under or beside the primary action it automates, as a toggle with a clear on/off state.
**Avoid:** burying auto modes in Settings, where players never find them.

### Speed and skip are features players value
**Game:** Sol's RNG ([63])
**Shows:** Quick Roll is a paid pass that strips the opening animation so rolls resolve almost instantly. Settings like auto-equip rarity, cutscene skip, and delete and swap warnings are all keyed to rarity [63].
**Why it works:** a reveal that's thrilling the first time is a cost on the 500th. Rarity-based thresholds keep the long reveals for the rolls that matter.
**Steal:** Rule 22's tiered reveals and a "skip reveals below [rarity]" setting.
**Avoid:** forcing a long animation on every common result to make a skip pass look more valuable.

### A trade window that keeps both sides informed
**Game:** Adopt Me! ([59], [60])
**Shows:** guides describe a trade window showing both inventories with offered items in slots, where either side can accept, reject or adjust. Later additions include Quick Chat replies, typing indicators, spectating other trades and verification icons [59]. A Trading Hub lets players post listings with an open Offer slot [60].
**Why it works:** trading is social and risky. Visible state (what's offered, who's typing, who's ready) builds trust, and quick replies avoid typing on phones.
**Steal:** two-column slots, a status strip, quick-chat chips, and a ready/accept/countdown flow that resets on any change (recipe 20).
**Avoid:** free-text-only negotiation and instant accept with no countdown.

### NPC quests with a clear cadence and reward
**Game:** Bee Swarm Simulator ([65], [66], [67])
**Shows:** Brown Bear gives repeatable pollen quests, and a new one becomes available an hour after the last was started. Each always rewards a ticket, royal jelly and honey that scales with difficulty [65]. Science Bear runs 31 quests across two series [66]. The Sticker-Seeker Quest Machine gives endless quests with milestone rewards up to the 1000th [67].
**Why it works:** short-term tasks, long chains and endless repeatables give every kind of player a next step.
**Steal:** the quest tracker pill (one line, progress, reward chip), plus a window with Daily, Main and Endless tabs (recipe 12).
**Avoid:** quests whose reward isn't shown until they're complete.

### Rating as a one-tap UI
**Game:** Dress to Impress ([68], [69])
**Shows:** after a timed dressing round, players walk the runway one by one and the lobby rates each outfit from one to five stars. The top three appear on a podium [69]. Stars accumulate into named ranks, from New Model up to Supernova [68].
**Why it works:** the main social interaction is a single tap per round, readable by anyone, and the rank names turn a number into an identity.
**Steal:** a 5-star row (each star 64 dp, filled Gold on tap, one choice only) for any player-judged mode, and named rank tiers on the profile.
**Avoid:** tiny star targets, or allowing a vote change after the reveal.

### A code box that's hard to find
**Game:** Blox Fruits ([70], [71])
**Shows:** code guides describe the code entry as a small bird icon on the left of the screen, while other guides describe reaching it through a gear-icon menu [70][71].
**Why it works (and doesn't):** codes drive community engagement, but when guides disagree about where the box is, many players can't find it.
**Steal:** codes as a clearly labelled row in Settings plus a temporary HUD tile during code campaigns (recipe 17).
**Avoid:** tiny entry icons, especially on phones (Rule 7).

### Ranks as a progress ladder
**Game:** Pet Simulator 99 ([72])
**Shows:** the game has a Ranks system documented on its wiki [72], a ladder players climb alongside zones and pets.
**Why it works:** a visible ladder with named steps gives a long-term goal that a currency number can't.
**Steal:** a rank chip on the HUD (Micro text under the player's coin pill or on the profile) that opens a ladder view with the next reward.
**Avoid:** rank ladders whose next reward is hidden.

### Simple beats busy in simulators
**Game:** simulator UIs reviewed on the DevForum ([48])
**Shows:** a designer feedback thread notes that simulator UIs trend toward simplicity to help newer players follow what's happening, and warns against using another game's logo (a Pet Simulator X image) for your own pet button [48].
**Why it works:** new players decide in seconds whether they understand a game.
**Steal:** Rule 8's HUD limits and our own icon set.
**Avoid:** copying a top game's icons and art. Steal the pattern, never the asset (Rule 57).

### Juice on a working prototype
**Game:** the "Juice it or lose it" Breakout demo ([51], [52])
**Shows:** Jonasson and Purho's 2012 talk took a plain Breakout clone and added tweening, squash and stretch, screenshake and sound live, turning a flat prototype into something that felt alive [51]. Write-ups also list "juice for the sake of juice" as a pitfall [51].
**Why it works:** feedback is cheap to add and changes how every interaction feels.
**Steal:** the button feel table and reward bursts on this page.
**Avoid:** shaking and flashing on actions that don't matter. Save it for rewards.

## By genre

**Simulator.** The full HUD as specified: 2–3 currencies, 4-tile menu, bag capacity bar (if there's a backpack), Sell contextual button, egg cards, index. Rewards are frequent, so most are tier 1 (fly-to and toast) and tier 4 is kept for big hatches. Auto features (auto-hatch, auto-sell) sit next to the action they automate. Big-number formatting is critical, so test "999.9Qa" in every counter.

**Tycoon.** The HUD is light: cash counter, income per second chip ("+120/s"), Rebirth tile. Most buying happens in the world (buttons on pads with `BillboardGui` prices), so world price labels follow the buy-button states and colors (Go when affordable, Warn price when not, grey "LOCKED" before the prerequisite). A "next purchase" pointer (beam to the next affordable pad) replaces a quest tracker early.

**Obby.** Almost no HUD: stage number ("Stage 14/80") top-center, a skip-stage product button (only after 2+ deaths on the same stage, never pushy), and a checkpoint toast. Keep the screen clear for jumps. Mobile jump-zone respect matters most here. Death counter optional. Settings: hide other players, shift-lock hint on PC.

**Roleplay / life sim.** The UI is a toolset: a role or job picker, a house or build menu, a vehicle spawner, an emote wheel. Use a bottom-center (PC) or left (phone) dock of 5–6 tools that open windows. Text input matters for naming (pets, houses), so keep name fields in the top half for phones. Social UI (friend invites, trade) is primary. Avoid quest-pill clutter. Roleplayers make their own goals.

**Action / combat.** Health bar top-left (or bottom-center on PC) 320×28 dp with damage chunk animation (lost health shows white for 0.3 s, then drains). Ability buttons in the action arc with cooldown sweeps (a radial fill via `UIGradient` rotation or a vertical fill frame, plus the remaining seconds in Number). Hit markers and damage numbers in the world layer. Windows pause nothing, so keep them quick, and close them automatically on taking damage if the game is PvP.

**Battlegrounds.** Like action, but abilities are the HUD: 4 skill slots plus an ultimate meter. Phone layout: skills arc around jump (Rule 9), each 80 dp with key or glyph labels on PC and console. Character select is a large grid with portraits and a big "PLAY" button. Kill feed top-right, at most 4 lines, 3 s each.

**Survival.** Vital meters (health, hunger, thirst, temperature) as compact icon bars bottom-left on PC, or top-left on phones (to avoid the thumbstick). Inventory and crafting are the main windows: a crafting recipe list with "have/need" counts in Go and Warn and a craft button with the standard states. A day counter or clock top-center. Low vitals pulse their icon (1.4 s cycle) and tint the screen edge, never with fast flashing.

**Horror.** Minimal, diegetic UI. No currency HUD during runs, and objectives as subtle text ("Find the key") that fades after 4 s. A stamina bar appears only while sprinting. Menus use the horror display font (`Creepster` or similar) but keep Body as Builder Sans for readability. Jump-scares never come from UI elements (no flashing popups), and the reduced-motion setting turns off camera shake.

**Tower defense.** The HUD is the game: a wave counter and timer top-center, cash top-right, a tower hotbar bottom-center (phone: a horizontal strip above the bottom edge, *not* overlapping the jump zone, or the game disables jump) of 6 slots at 80 dp with the cost under each, and a placement preview with a range circle (a world `Part` disc or `SelectionSphere`). The selected tower panel (upgrade, sell, targeting mode) appears as a side card on the right, 300 dp wide. Speed (×1/×2) and skip-wave buttons go top-right.

**RNG / collection.** The roll button is the hero: 200×96 dp, bottom-center-right where the thumb is, with the Auto chip under it and the current luck multiplier chip above it. Reveals follow strict rarity tiers (Rule 22) with a "skip below X" setting. Inventory and storage plus equip are frequent, so make them two taps away at most. Odds tables are always visible from the roll UI, and for paid rolls Rule 33 applies.

**Shooter.** Crosshair at center (the only center element), ammo count bottom-right (PC) or near the fire button (phone), and health bottom-left (PC) or top-left (phone). Phone shooters need a fire button (in the action arc, 96 dp) and an aim/scope button. Keep the HUD clear of the right half for camera aiming. Kill feed top-right, scoreboard on a hold button (Tab on PC, a HUD button on phone).

**Racing.** A speedometer bottom-right (PC) or top-right (phone), position "2nd / 8" top-left in Display font, a lap counter, and a mini-map optional (static image plus moving dots). Phone controls are throttle and brake buttons on the right, steering on the left (the thumbstick or two arrow buttons), so menu tiles move to the top. Countdown "3-2-1-GO" at center in Display 120 dp.

**Sports.** Score bug top-center (team colors, score in Number 44, timer), a stamina or power meter near the action button, and pass/shoot buttons in the action arc. Team selection and positions as large cards. Replays and goal celebrations use the Transition band. Keep the controls to the 3-button limit on phones.

**Party / social.** Round-based: the lobby HUD shows the next minigame and a countdown, and each minigame swaps in its own tiny HUD (instructions for 3 s, a timer, scores). Voting UIs use large cards (4 at most) with one tap each. Emotes and reactions are a wheel. Results screens rank players with avatars (headshots) and confetti.

**Story / puzzle.** Dialogue boxes at the bottom (PC) or top-center (phone, so they don't cover the thumbstick): speaker portrait 96 dp, name in Heading, text in Body with a typewriter effect (40 characters/s, tap to complete), and choices as 2–3 large buttons. Chapter and checkpoint toasts. Inventory as a horizontal strip of key items. The puzzle hint button appears after 60 s stuck (tutorial pointer rules).

**Farming / fishing.** Tools on a quick bar (seed, water, harvest; or cast and reel), crop timers in the world (`BillboardGui` progress rings), and a seed or bait shop with restock timers (Grow a Garden's sold-out and restock pattern [61][62]). Fishing minigames need a big single-button interaction (hold to reel, a bar with a moving target) sized at least 96 dp, centered-right on phones. A journal or index of species uses recipe 13.

## Luau

All client modules live in `StarterPlayer.StarterPlayerScripts.UI`. They set properties before `Parent`, use the `task` library, and read every style value from Theme. Server snippets are for Builder and Merchant, who own those areas. Test each one in Studio before relying on it, and keep evidence (Output lines, screenshots) in the handoff.

### Format: numbers and time

```lua
--!strict
-- UI/Format
local Format = {}
local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De" }
local EPS = 1e-9

function Format.commas(n: number): string
	local digits = string.format("%d", math.floor(math.abs(n)))
	local out = digits:reverse():gsub("(%d%d%d)", "%1,"):reverse()
	if out:sub(1, 1) == "," then
		out = out:sub(2)
	end
	return (if n < 0 then "-" else "") .. out
end

-- Full digits below 10,000; then 3 significant digits, always rounded DOWN (Rule 19).
function Format.abbrev(n: number): string
	if n ~= n then return "0" end -- NaN guard
	local sign = if n < 0 then "-" else ""
	n = math.abs(n)
	if n < 10000 then
		return sign .. Format.commas(n)
	end
	local tier = 1
	while n >= 1000 and tier < #SUFFIXES do
		n /= 1000
		tier += 1
	end
	local text: string
	if n >= 100 then
		text = string.format("%d", math.floor(n + EPS))
	elseif n >= 10 then
		text = string.format("%.1f", math.floor(n * 10 + EPS) / 10)
	else
		text = string.format("%.2f", math.floor(n * 100 + EPS) / 100)
	end
	if string.find(text, ".", 1, true) then
		text = (string.gsub(text, "0+$", ""))
		text = (string.gsub(text, "%.$", ""))
	end
	return sign .. text .. SUFFIXES[tier]
end

function Format.clock(seconds: number): string
	seconds = math.max(0, math.floor(seconds))
	local h, m, s = seconds // 3600, (seconds % 3600) // 60, seconds % 60
	if h > 0 then
		return string.format("%d:%02d:%02d", h, m, s)
	end
	return string.format("%d:%02d", m, s)
end

return Format
-- Format.abbrev(9999) -> "9,999"; (12500) -> "12.5K"; (999999) -> "999K"; (2300000) -> "2.3M"
```

### Scale: the one size number

```lua
--!strict
-- UI/Scale: sets UIScale "AutoScale" on every instance tagged AutoScale (Rule 6).
local CollectionService = game:GetService("CollectionService")
local GuiService = game:GetService("GuiService")
local UserInputService = game:GetService("UserInputService")

local Scale = { value = 1 }
local changed = Instance.new("BindableEvent")
Scale.Changed = changed.Event

local function compute(): number
	local vp = workspace.CurrentCamera.ViewportSize
	local s = vp.Y / 720
	if UserInputService.TouchEnabled and math.min(vp.X, vp.Y) < 500 then
		s *= 1.35 -- phone thumb boost
	end
	local tenFoot = GuiService:IsTenFootInterface()
	if tenFoot then
		s = math.max(s, 1.25)
	end
	return math.clamp(s, 0.6, if tenFoot then 1.35 else 1.15)
end

local function getScale(obj: Instance): UIScale
	local existing = obj:FindFirstChild("AutoScale")
	if existing and existing:IsA("UIScale") then
		return existing
	end
	local ui = Instance.new("UIScale")
	ui.Name = "AutoScale"
	ui.Parent = obj
	return ui
end

-- Windows fit the safe area (see "Scaling system"). designSize is the active layout's design size.
function Scale.fitWindow(root: GuiObject, designSize: Vector2)
	local parent = root.Parent
	local safe = if parent and parent:IsA("GuiBase2d") then parent.AbsoluteSize else workspace.CurrentCamera.ViewportSize
	local fit = math.min(Scale.value, 0.92 * safe.Y / designSize.Y, 0.94 * safe.X / designSize.X)
	getScale(root).Scale = fit
end

function Scale.isCompact(): boolean
	return Scale.value < 0.8 and UserInputService.TouchEnabled
end

local function apply(obj: Instance)
	if obj:GetAttribute("DesignW") then
		Scale.fitWindow(obj :: GuiObject, Vector2.new(obj:GetAttribute("DesignW") :: number, obj:GetAttribute("DesignH") :: number))
	else
		getScale(obj).Scale = Scale.value
	end
end

local function refresh()
	Scale.value = compute()
	for _, obj in CollectionService:GetTagged("AutoScale") do
		apply(obj)
	end
	changed:Fire(Scale.value)
end

CollectionService:GetInstanceAddedSignal("AutoScale"):Connect(apply)
workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(refresh)
refresh()
return Scale
```

A window root carries the attributes `DesignW` and `DesignH` (880×560, or 600×400 when the Compact layout is active), and its parent is a ScreenGui, whose `AbsoluteSize` is the safe area for CoreUISafeInsets layers. Never tag a button `AutoScale`, since its `Press` UIScale would collide (Rule 6).

### Button: feel for every button

```lua
--!strict
-- UI/Button
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local Theme = require(script.Parent.Theme)
local Motion = require(script.Parent.Motion)

local uiSounds = ReplicatedStorage:WaitForChild("Assets"):WaitForChild("Sounds"):WaitForChild("UI")
local Button = {}

local function pressScale(button: GuiButton): UIScale
	local existing = button:FindFirstChild("Press")
	if existing and existing:IsA("UIScale") then
		return existing
	end
	local s = Instance.new("UIScale")
	s.Name = "Press"
	s.Parent = button
	return s
end

local function isPointer(input: InputObject): boolean
	return input.UserInputType == Enum.UserInputType.MouseButton1
		or input.UserInputType == Enum.UserInputType.Touch
end

local function lastIsGamepad(): boolean
	return UserInputService:GetLastInputType().Name:sub(1, 7) == "Gamepad"
end

function Button.play(name: string)
	local sound = uiSounds:FindFirstChild(name)
	if sound and sound:IsA("Sound") then
		SoundService:PlayLocalSound(sound)
	end
end

function Button.puff(button: GuiButton)
	if Motion.reduced() then return end
	local ring = Instance.new("Frame")
	ring.Name = "Puff"
	ring.AnchorPoint = Vector2.new(0.5, 0.5)
	ring.Position = UDim2.fromScale(0.5, 0.5)
	ring.Size = UDim2.fromScale(1, 1)
	ring.BackgroundTransparency = 1
	ring.ZIndex = button.ZIndex + 5
	local corner = Instance.new("UICorner")
	corner.CornerRadius = Theme.Radius.M
	corner.Parent = ring
	local stroke = Instance.new("UIStroke")
	stroke.Color = Theme.Color.Text
	stroke.Thickness = 3
	stroke.Transparency = 0.2
	stroke.Parent = ring
	ring.Parent = button
	local info = TweenInfo.new(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(ring, info, { Size = UDim2.fromScale(1.35, 1.35) }):Play()
	local fade = TweenService:Create(stroke, info, { Transparency = 1 })
	fade.Completed:Once(function()
		ring:Destroy()
	end)
	fade:Play()
end

export type Options = { sound: string?, puff: boolean?, cooldown: number? }

function Button.bind(button: GuiButton, onClick: () -> (), opts: Options?): RBXScriptConnection
	local o: Options = opts or {}
	local scale = pressScale(button)
	local cooldown = o.cooldown or 0.15
	local last = 0
	local function to(value: number, info: TweenInfo)
		Motion.tween(scale, info, { Scale = value })
	end
	button.InputBegan:Connect(function(input)
		if isPointer(input) then to(0.92, Theme.Motion.Press) end
	end)
	button.InputEnded:Connect(function(input)
		if isPointer(input) then to(1, Theme.Motion.Release) end
	end)
	button.MouseEnter:Connect(function()
		if UserInputService:GetLastInputType() == Enum.UserInputType.MouseMovement then
			to(1.04, Theme.Motion.Hover)
		end
	end)
	button.MouseLeave:Connect(function() to(1, Theme.Motion.Release) end)
	button.SelectionGained:Connect(function() to(1.06, Theme.Motion.Release) end)
	button.SelectionLost:Connect(function() to(1, Theme.Motion.Release) end)
	return button.Activated:Connect(function()
		local now = os.clock()
		if now - last < cooldown then return end
		last = now
		if lastIsGamepad() then
			to(0.92, Theme.Motion.Press)
			task.delay(0.06, to, 1.06, Theme.Motion.Release)
		end
		Button.play(o.sound or "Click")
		if o.puff ~= false then Button.puff(button) end
		onClick()
	end)
end

return Button
```

The button's `ClipsDescendants` must be false for the puff to show, and its `AnchorPoint` should be (0.5, 0.5) so the squash is centered.

### Windows: one at a time, blur, gamepad

```lua
--!strict
-- UI/Windows
local ContextActionService = game:GetService("ContextActionService")
local GuiService = game:GetService("GuiService")
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local Theme = require(script.Parent.Theme)
local Motion = require(script.Parent.Motion)
local Button = require(script.Parent.Button)

local playerGui = Players.LocalPlayer:WaitForChild("PlayerGui")
local windowsGui = playerGui:WaitForChild("Windows") :: ScreenGui
local shade = (playerGui:WaitForChild("Dim") :: ScreenGui):WaitForChild("Shade") :: GuiButton -- full-screen TextButton, Text = ""

local blur = Instance.new("BlurEffect")
blur.Name = "MenuBlur"
blur.Size = 0
blur.Parent = workspace.CurrentCamera -- Camera effects show only to this player [21]

type Screen = { open: ((args: any?) -> ())?, close: (() -> ())? }
local screens: { [string]: Screen } = {}
local current: string? = nil
local reducedEffects = false

local Windows = {}
local changed = Instance.new("BindableEvent")
Windows.Changed = changed.Event

function Windows.register(name: string, screen: Screen)
	screens[name] = screen
end

function Windows.setReducedEffects(on: boolean)
	reducedEffects = on
end

local function rootOf(name: string): GuiObject?
	return windowsGui:FindFirstChild(name) :: GuiObject?
end

local function onBack(_: string, state: Enum.UserInputState): Enum.ContextActionResult
	if state == Enum.UserInputState.Begin and current then
		Windows.close()
		return Enum.ContextActionResult.Sink
	end
	return Enum.ContextActionResult.Pass
end

function Windows.close(switching: boolean?)
	local name = current
	if not name then return end
	current = nil
	local root = rootOf(name)
	local screen = screens[name]
	if screen and screen.close then screen.close() end
	if root then
		local card = root:FindFirstChild("Card")
		local pop = if card then card:FindFirstChild("Pop") else nil
		if pop and pop:IsA("UIScale") and not switching then
			local t = Motion.tween(pop, Theme.Motion.Close, { Scale = 0.9 })
			t.Completed:Once(function()
				if current ~= name then root.Visible = false end
			end)
		else
			root.Visible = false
		end
	end
	if not switching then
		local fade = Motion.tween(shade, Theme.Motion.Fade, { BackgroundTransparency = 1 })
		fade.Completed:Once(function()
			if not current then shade.Visible = false end
		end)
		Motion.tween(blur, Theme.Motion.Fade, { Size = 0 })
		ContextActionService:UnbindAction("CloseWindow")
		GuiService.SelectedObject = nil
		Button.play("Close")
	end
	changed:Fire(nil)
end

function Windows.open(name: string, args: any?)
	local root = rootOf(name)
	if not root or current == name then return end
	if current then Windows.close(true) end
	current = name
	local card = root:WaitForChild("Card") :: GuiObject -- Card.Active = true so taps on it don't fall through to the shade
	local pop = card:WaitForChild("Pop") :: UIScale
	pop.Scale = 0.85
	root.Visible = true
	shade.Visible = true
	Motion.tween(pop, Theme.Motion.Open, { Scale = 1 })
	Motion.tween(shade, Theme.Motion.Fade, { BackgroundTransparency = 0.5 })
	if not reducedEffects then
		Motion.tween(blur, Theme.Motion.Fade, { Size = 14 })
	end
	ContextActionService:BindActionAtPriority("CloseWindow", onBack, false,
		Enum.ContextActionPriority.High.Value, Enum.KeyCode.ButtonB)
	if UserInputService.GamepadEnabled then
		GuiService:Select(card) -- selects the descendant with the lowest SelectionOrder [17]
	end
	local screen = screens[name]
	if screen and screen.open then screen.open(args) end
	Button.play("Open")
	changed:Fire(name)
end

function Windows.toggle(name: string, args: any?)
	if current == name then Windows.close() else Windows.open(name, args) end
end

function Windows.current(): string?
	return current
end

shade.Activated:Connect(function()
	if current and not windowsGui:GetAttribute("Busy") then Windows.close() end
end)

return Windows
```

Set `windowsGui:SetAttribute("Busy", true)` during purchases and trades, so a tap on the dim doesn't close a window mid-transaction. Set `Active = true` on every window `Card`. Otherwise taps on empty parts of the card pass through to the Shade button below and close the window.

### Toasts: capped, merged, self-dismissing

```lua
--!strict
-- UI/Toasts. ToastTemplate (child of this module): a small CanvasGroup (Rule 46) with Bar (Frame), Icon (ImageLabel), Label (TextLabel).
local Players = game:GetService("Players")
local Theme = require(script.Parent.Theme)
local Motion = require(script.Parent.Motion)

local stack = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("Toasts"):WaitForChild("Stack") :: Frame
local template = script:WaitForChild("ToastTemplate") :: CanvasGroup
local KIND: { [string]: Color3 } = {
	info = Theme.Color.Info, good = Theme.Color.Go, bad = Theme.Color.Danger, reward = Theme.Color.Gold,
}
local MAX, LIFE = 3, 2.8

type Entry = { frame: CanvasGroup, label: TextLabel, text: string, count: number, expires: number }
local live: { Entry } = {}
local order = 0
local Toasts = {}

local function remove(e: Entry)
	local i = table.find(live, e)
	if not i then return end
	table.remove(live, i)
	local fade = Motion.tween(e.frame, Theme.Motion.Fade, { GroupTransparency = 1 }) -- fades text, strokes and icon together
	fade.Completed:Once(function()
		e.frame:Destroy()
	end)
end

local function watch(e: Entry)
	task.delay(math.max(0, e.expires - os.clock()), function()
		if not table.find(live, e) then return end
		if os.clock() + 0.01 < e.expires then
			watch(e) -- merged since: wait out the new expiry
		else
			remove(e)
		end
	end)
end

function Toasts.show(text: string, kind: string?)
	for _, e in live do
		if e.text == text then -- merge duplicates (Rule 24)
			e.count += 1
			e.label.Text = text .. "  ×" .. e.count
			e.expires = os.clock() + LIFE
			return
		end
	end
	order += 1
	local frame = template:Clone()
	local bar = frame:WaitForChild("Bar") :: Frame
	local label = frame:WaitForChild("Label") :: TextLabel
	bar.BackgroundColor3 = KIND[kind or "info"] or Theme.Color.Info
	label.Text = text
	frame.LayoutOrder = order
	frame.Parent = stack
	local e: Entry = { frame = frame, label = label, text = text, count = 1, expires = os.clock() + LIFE }
	table.insert(live, e)
	if #live > MAX then
		remove(live[1])
	end
	watch(e)
end

return Toasts
```

### Counter: rolling currency number

```lua
--!strict
-- UI/Counter
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Format = require(script.Parent.Format)
local Motion = require(script.Parent.Motion)
local Theme = require(script.Parent.Theme)

local player = Players.LocalPlayer
local Counter = {}

local function floatDelta(label: TextLabel, delta: number)
	if Motion.reduced() then return end
	local f = Instance.new("TextLabel")
	f.BackgroundTransparency = 1
	f.AnchorPoint = Vector2.new(0, 0.5)
	f.Position = UDim2.new(1, 8, 0.5, 0)
	f.AutomaticSize = Enum.AutomaticSize.XY
	f.FontFace = Theme.Font.Number
	f.TextSize = Theme.Text.Caption
	f.TextColor3 = Theme.Color.Go
	f.Text = "+" .. Format.abbrev(delta)
	local stroke = Instance.new("UIStroke")
	stroke.Thickness = Theme.Stroke.TextSmall
	stroke.Color = Theme.Color.Ink
	stroke.Parent = f
	f.Parent = label
	local info = TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(f, info, { Position = UDim2.new(1, 8, 0.5, -24), TextTransparency = 1 }):Play()
	local t = TweenService:Create(stroke, info, { Transparency = 1 })
	t.Completed:Once(function() f:Destroy() end)
	t:Play()
end

function Counter.bind(label: TextLabel, attribute: string, icon: GuiObject?)
	local shown = (player:GetAttribute(attribute) :: number?) or 0
	label.Text = Format.abbrev(shown)
	local conn: RBXScriptConnection? = nil
	player:GetAttributeChangedSignal(attribute):Connect(function()
		local target = (player:GetAttribute(attribute) :: number?) or 0
		local from, start = shown, os.clock()
		if conn then conn:Disconnect() end
		if target > from then
			floatDelta(label, target - from)
			if icon then
				local pulse = icon:FindFirstChild("Pulse") :: UIScale?
				if pulse then
					Motion.tween(pulse, Theme.Motion.Press, { Scale = 1.15 }).Completed:Once(function()
						Motion.tween(pulse, Theme.Motion.Release, { Scale = 1 })
					end)
				end
			end
		end
		if Motion.reduced() then
			shown = target
			label.Text = Format.abbrev(target)
			return
		end
		conn = RunService.Heartbeat:Connect(function()
			local a = math.min((os.clock() - start) / 0.4, 1)
			shown = from + (target - from) * TweenService:GetValue(a, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
			label.Text = Format.abbrev(if a >= 1 then target else shown)
			if a >= 1 and conn then
				conn:Disconnect()
				conn = nil
				shown = target
			end
		end)
	end)
end

return Counter
```

### RewardFX: fly-to-counter burst

```lua
--!strict
-- UI/RewardFX (excerpt: flyTo). FX ScreenGui > Root (full-size Frame), same ScreenInsets as the HUD.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Motion = require(script.Parent.Motion)
local Scale = require(script.Parent.Scale)

local fxRoot = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("FX"):WaitForChild("Root") :: Frame
local pool: { ImageLabel } = {}
local RewardFX = {}

local function take(image: string): ImageLabel
	local icon = table.remove(pool)
	if not icon then
		icon = Instance.new("ImageLabel")
		icon.BackgroundTransparency = 1
		icon.AnchorPoint = Vector2.new(0.5, 0.5)
	end
	local i = icon :: ImageLabel
	i.Image = image
	i.Visible = true
	i.Parent = fxRoot
	return i
end

local function give(i: ImageLabel)
	i.Visible = false
	table.insert(pool, i)
end

function RewardFX.centerOf(gui: GuiObject): Vector2
	return gui.AbsolutePosition + gui.AbsoluteSize / 2 - fxRoot.AbsolutePosition
end

-- WorldToScreenPoint accounts for the GUI inset, matching AbsolutePosition space.
function RewardFX.fromWorld(position: Vector3): Vector2
	local p = workspace.CurrentCamera:WorldToScreenPoint(position)
	return Vector2.new(p.X, p.Y) - fxRoot.AbsolutePosition
end

function RewardFX.flyTo(from: Vector2, target: GuiObject, image: string, count: number, onArrive: (() -> ())?)
	if Motion.reduced() then
		if onArrive then onArrive() end
		return
	end
	local to = RewardFX.centerOf(target)
	local size = 36 * Scale.value
	local arrived = false
	for n = 1, math.clamp(count, 1, 12) do
		task.delay((n - 1) * 0.03, function()
			local icon = take(image)
			local angle = math.random() * math.pi * 2
			local p1 = from + Vector2.new(math.cos(angle), math.sin(angle)) * math.random(30, 70) + Vector2.new(0, -60)
			local duration = 0.5 + math.random() * 0.3
			local start = os.clock()
			local conn: RBXScriptConnection
			conn = RunService.RenderStepped:Connect(function()
				local a = math.min((os.clock() - start) / duration, 1)
				local t = TweenService:GetValue(a, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
				local u = 1 - t
				local pos = from * (u * u) + p1 * (2 * u * t) + to * (t * t) -- quadratic Bezier
				local s = size * (1 - 0.4 * t)
				icon.Position = UDim2.fromOffset(pos.X, pos.Y)
				icon.Size = UDim2.fromOffset(s, s)
				if a >= 1 then
					conn:Disconnect()
					give(icon)
					if not arrived then
						arrived = true
						if onArrive then onArrive() end
					end
				end
			end)
		end)
	end
end

return RewardFX
```

### BuyButton: the only state writer

```lua
--!strict
-- UI/BuyButton. Template: ImageButton "BuyButton" > Face (Frame, UIGradient) > Content (Icon, Price) ; Caption (TextLabel under the button) ; Spinner (ImageLabel)
local Theme = require(script.Parent.Theme)
local Format = require(script.Parent.Format)

export type State = "Buy" | "Need" | "Locked" | "Owned" | "Equipped" | "SoldOut" | "Processing"
export type Data = { price: number?, robux: boolean?, caption: string?, icon: string? }

local FACE: { [string]: { Color3 } } = {
	Buy = { Theme.Color.Go, Theme.Color.GoEdge },
	BuyRobux = { Theme.Color.Gold, Theme.Color.GoldEdge },
	Need = { Theme.Color.Disabled, Theme.Color.Ink },
	Locked = { Theme.Color.Disabled, Theme.Color.Ink },
	Owned = { Theme.Color.PanelRaised, Theme.Color.Go },
	Equipped = { Theme.Color.Info, Theme.Color.InfoEdge },
	SoldOut = { Theme.Color.Disabled, Theme.Color.Ink },
}

local BuyButton = {}

function BuyButton.setState(button: GuiButton, state: State, data: Data)
	local face = button:WaitForChild("Face") :: Frame
	local content = face:WaitForChild("Content") :: Frame
	local price = content:WaitForChild("Price") :: TextLabel
	local icon = content:WaitForChild("Icon") :: ImageLabel
	local spinner = button:WaitForChild("Spinner") :: ImageLabel
	local caption = button:WaitForChild("Caption") :: TextLabel
	local stroke = face:FindFirstChildOfClass("UIStroke")

	button:SetAttribute("State", state)
	spinner.Visible = state == "Processing"
	content.Visible = state ~= "Processing"
	if state == "Processing" then return end -- keep the current face

	local key = if state == "Buy" and data.robux then "BuyRobux" else state
	local colors = FACE[key]
	face.BackgroundColor3 = colors[1]
	if stroke then stroke.Color = colors[2] end

	icon.Visible = true
	price.TextColor3 = Theme.Color.Text
	if state == "Buy" or state == "Need" then
		price.Text = if data.price then Format.abbrev(data.price) else "BUY"
		if data.icon then icon.Image = data.icon end
		if state == "Need" then price.TextColor3 = Theme.Color.Warn end
	elseif state == "Locked" then
		price.Text = "LOCKED"
	elseif state == "Owned" then
		price.Text = "OWNED"
	elseif state == "Equipped" then
		price.Text = "EQUIPPED"
	elseif state == "SoldOut" then
		price.Text = "NO STOCK"
		icon.Visible = false
	end
	caption.Visible = data.caption ~= nil
	caption.Text = data.caption or ""
end

return BuyButton
```

The icon image for Locked/Owned/Equipped comes from `ReplicatedStorage.Assets.UI.Icons` (padlock, check). Set it in the template states or extend `Data.icon`.

### Pass purchase wiring (client and server)

```lua
--!strict
-- Client (UI/Screens/Shop excerpt)
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local Button = require(script.Parent.Parent.Button)
local BuyButton = require(script.Parent.Parent.BuyButton)
local Prices = require(script.Parent.Parent.Prices)
local player = Players.LocalPlayer

local function bindPass(button: GuiButton, passId: number)
	local attr = "Pass_" .. passId
	local function refresh()
		if player:GetAttribute(attr) then
			BuyButton.setState(button, "Owned", {})
		else
			BuyButton.setState(button, "Buy", { robux = true, price = Prices.get(passId, Enum.InfoType.GamePass) })
		end
	end
	task.spawn(refresh) -- Prices.get yields on first call
	player:GetAttributeChangedSignal(attr):Connect(refresh)
	Button.bind(button, function()
		if player:GetAttribute(attr) then return end
		BuyButton.setState(button, "Processing", {})
		MarketplaceService:PromptGamePassPurchase(player, passId)
	end)
	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(who, id, purchased)
		if who == player and id == passId and not purchased then
			task.spawn(refresh) -- cancelled: back to Buy; on success the server sets the attribute
		end
	end)
end
```

```lua
--!strict
-- Server (Merchant: ServerScriptService.Purchases excerpt)
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local PASS_IDS = { 0 } -- placeholder: the owner creates passes and supplies real IDs

local function grant(player: Player, passId: number)
	player:SetAttribute("Pass_" .. passId, true)
end

Players.PlayerAdded:Connect(function(player)
	for _, id in PASS_IDS do
		local ok, owns = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, id)
		if ok and owns then grant(player, id) end
	end
end)

MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	if purchased then grant(player, passId) end
end)
```

Developer products are granted only in the single receipt handler (`ProcessReceipt`), which must exist so product purchases don't fail and may only be set once in the whole game [29][30]. See [[09 Shops and Monetization]].

### Prices: real Robux prices, cached

```lua
--!strict
-- UI/Prices
local MarketplaceService = game:GetService("MarketplaceService")
local cache: { [string]: number } = {}
local Prices = {}

function Prices.get(id: number, infoType: Enum.InfoType): number?
	local key = infoType.Name .. ":" .. id
	if cache[key] then return cache[key] end
	local ok, info = pcall(function()
		return MarketplaceService:GetProductInfo(id, infoType)
	end)
	if ok and type(info) == "table" and typeof(info.PriceInRobux) == "number" then
		cache[key] = info.PriceInRobux
		return info.PriceInRobux
	end
	return nil -- caller shows "BUY" without a number (Rule 30)
end

return Prices
```

### Store: one client data source

```lua
--!strict
-- UI/Store
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local DataSync = Remotes:WaitForChild("DataSync") :: RemoteEvent
local ClientReady = Remotes:WaitForChild("ClientReady") :: RemoteEvent
local Store = {}
local data: { [string]: any } = {}
local listeners: { [string]: { (any) -> () } } = {}

function Store.get(key: string): any
	return data[key]
end

function Store.observe(key: string, fn: (any) -> ()): () -> ()
	local list = listeners[key] or {}
	listeners[key] = list
	table.insert(list, fn)
	if data[key] ~= nil then task.spawn(fn, data[key]) end
	return function()
		local i = table.find(list, fn)
		if i then table.remove(list, i) end
	end
end

DataSync.OnClientEvent:Connect(function(key: string, value: any)
	data[key] = value
	for _, fn in table.clone(listeners[key] or {}) do
		task.spawn(fn, value)
	end
end)

-- Handshake: the server sends every key once it hears the client is listening.
ClientReady:FireServer()
return Store
```

### Odds that sum to exactly 100%

```lua
--!strict
-- Shared math (Builder places it in ReplicatedStorage.Shared.Odds so the server and the egg card use the same weights).
local Odds = {}
type Row = { id: string, units: number, rem: number }

-- weights: { [id]: weight }. Returns { [id]: "4.50%" } summing to exactly 100 at the chosen precision.
function Odds.display(weights: { [string]: number }): { [string]: string }
	local total, minShare = 0, math.huge
	for _, w in weights do total += w end
	for _, w in weights do
		if w > 0 then minShare = math.min(minShare, w / total * 100) end
	end
	-- enough decimals that the rarest outcome is non-zero, at least 2
	local decimals = math.max(2, math.ceil(-math.log10(minShare)) + 1)
	local unit = 10 ^ decimals
	local target = math.floor(100 * unit + 0.5)
	local rows: { Row } = {}
	local used = 0
	for id, w in weights do
		local exact = w / total * target
		local whole = math.floor(exact)
		used += whole
		table.insert(rows, { id = id, units = whole, rem = exact - whole })
	end
	table.sort(rows, function(a, b) return a.rem > b.rem end)
	for i = 1, target - used do
		rows[i].units += 1 -- largest remainder gets the leftover units
	end
	local out = {}
	local fmt = "%." .. decimals .. "f%%"
	for _, r in rows do
		out[r.id] = string.format(fmt, r.units / unit)
	end
	return out
end

function Odds.oneIn(weight: number, total: number): string
	return "1 in " .. string.format("%d", math.floor(total / weight + 0.5))
end

return Odds
-- Odds.display({ Dog = 600, Cat = 300, Dragon = 95, Phoenix = 5 })
--   -> Dog "60.00%", Cat "30.00%", Dragon "9.50%", Phoenix "0.50%"
```

### Daily reward (server)

```lua
--!strict
-- Builder: ServerScriptService.Daily excerpt. `data` is the player's loaded save table.
local DAY = 86400
local REWARDS = {
	{ Coins = 100 }, { Coins = 200 }, { Gems = 5 }, { Coins = 500 },
	{ Gems = 10 }, { Coins = 1000 }, { Gems = 25, Egg = "Lucky" },
}

local Daily = {}

function Daily.today(): number
	return math.floor(os.time() / DAY) -- UTC day index
end

function Daily.secondsToReset(): number
	return DAY - os.time() % DAY
end

-- Returns ok, slot (1-7) or ok=false with a message key.
function Daily.claim(data: { lastClaimDay: number?, streak: number? }): (boolean, number | string)
	local today = Daily.today()
	if data.lastClaimDay == today then
		return false, "DailyAlreadyClaimed"
	end
	local streak = if data.lastClaimDay == today - 1 then (data.streak or 0) + 1 else 1
	data.streak = streak
	data.lastClaimDay = today
	local slot = ((streak - 1) % #REWARDS) + 1
	-- grant(REWARDS[slot]) through the economy module, then save
	return true, slot
end

return Daily
```

### Codes (server and client)

```lua
--!strict
-- Server: ServerScriptService.Codes (Builder). Remotes.RedeemCode is a RemoteFunction.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local RedeemCode = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("RedeemCode") :: RemoteFunction
local Data = require(ServerScriptService:WaitForChild("Data")) :: any -- Builder's save module: adapt get/grant to its real API

type CodeDef = { reward: { [string]: number }, expires: number? }
local CODES: { [string]: CodeDef } = {
	RELEASE = { reward = { Coins = 500 } },
	SPRING = { reward = { Gems = 10 }, expires = 1798761600 }, -- 2027-01-01 00:00 UTC
}
local lastTry: { [Player]: number } = {}

RedeemCode.OnServerInvoke = function(player: Player, raw: any): (boolean, string)
	if typeof(raw) ~= "string" or #raw == 0 or #raw > 32 then
		return false, "CodeInvalid"
	end
	local now = os.clock()
	if lastTry[player] and now - lastTry[player] < 2 then
		return false, "CodeTooFast"
	end
	lastTry[player] = now
	local code = string.upper((string.gsub(raw, "%s", "")))
	local def = CODES[code]
	if not def then return false, "CodeInvalid" end
	if def.expires and os.time() > def.expires then return false, "CodeExpired" end
	local data = Data.get(player)
	if not data then return false, "TryAgain" end -- save not loaded yet
	data.codes = data.codes or {}
	if data.codes[code] then return false, "CodeUsed" end
	data.codes[code] = true
	Data.grant(player, def.reward)
	return true, "CodeOk"
end

game:GetService("Players").PlayerRemoving:Connect(function(p) lastTry[p] = nil end)
```

```lua
--!strict
-- Client: UI/Screens/Codes excerpt
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Theme = require(script.Parent.Parent.Theme)
local Button = require(script.Parent.Parent.Button)
local RedeemCode = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("RedeemCode") :: RemoteFunction
local COPY: { [string]: string } = {
	CodeOk = "Code redeemed!", CodeInvalid = "That code doesn't exist", CodeUsed = "You already used this code",
	CodeExpired = "This code expired", CodeTooFast = "Slow down!", TryAgain = "Try again in a moment",
}

local function bindCodes(box: TextBox, redeem: GuiButton, result: TextLabel)
	box.ClearTextOnFocus = false
	box.AutoLocalize = false
	local busy = false
	Button.bind(redeem, function()
		if busy then return end
		busy = true
		result.Text = "…"
		task.spawn(function()
			local ok, okFlag, key = pcall(RedeemCode.InvokeServer, RedeemCode, box.Text)
			local success = ok and okFlag == true
			result.Text = COPY[if ok then key else "TryAgain"] or COPY.TryAgain
			result.TextColor3 = if success then Theme.Color.Go else Theme.Color.Danger
			if success then box.Text = "" end
			busy = false
		end)
	end)
end
```

### Tutorial pointer (world target with edge arrow)

```lua
--!strict
-- UI/Pointer excerpt. Tutorial ScreenGui > Root (full-size Frame) > EdgeArrow (ImageLabel, AnchorPoint 0.5,0.5)
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local root = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("Tutorial"):WaitForChild("Root") :: Frame
local arrow = root:WaitForChild("EdgeArrow") :: ImageLabel
local MARGIN = 48
local conn: RBXScriptConnection? = nil
local Pointer = {}

function Pointer.showWorld(target: BasePart)
	if conn then conn:Disconnect() end
	conn = RunService.RenderStepped:Connect(function()
		local camera = workspace.CurrentCamera
		local p, onScreen = camera:WorldToScreenPoint(target.Position)
		local size = root.AbsoluteSize
		local pos = Vector2.new(p.X, p.Y) - root.AbsolutePosition
		if onScreen then
			arrow.Visible = false -- the BillboardGui arrow over the target takes over
			return
		end
		local center = size / 2
		local dir = pos - center
		if p.Z < 0 then dir = -dir end -- behind the camera: flip
		if dir.Magnitude < 1 then dir = Vector2.new(0, -1) end
		dir = dir.Unit
		local half = center - Vector2.new(MARGIN, MARGIN)
		local k = math.min(half.X / math.max(math.abs(dir.X), 1e-3), half.Y / math.max(math.abs(dir.Y), 1e-3))
		local edge = center + dir * k
		arrow.Visible = true
		arrow.Position = UDim2.fromOffset(edge.X, edge.Y)
		arrow.Rotation = math.deg(math.atan2(dir.Y, dir.X)) + 90 -- art points up
	end)
end

function Pointer.hide()
	if conn then conn:Disconnect(); conn = nil end
	arrow.Visible = false
end

return Pointer
```

### Loading screen (ReplicatedFirst)

```lua
--!strict
-- ReplicatedFirst.Loading (LocalScript). Child: LoadingGui (ScreenGui, ScreenInsets None, IgnoreGuiInset true, DisplayOrder 100)
local ReplicatedFirst = game:GetService("ReplicatedFirst")
local Players = game:GetService("Players")
local ContentProvider = game:GetService("ContentProvider")
local TweenService = game:GetService("TweenService")

local gui = script:WaitForChild("LoadingGui") :: ScreenGui
gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
ReplicatedFirst:RemoveDefaultLoadingScreen() -- [31]

local card = gui:WaitForChild("Card") :: Frame
local fill = card:WaitForChild("Bar"):WaitForChild("Fill") :: Frame
local skip = card:WaitForChild("Skip") :: TextButton
local skipped = false
skip.Visible = false
skip.Activated:Connect(function() skipped = true end)
task.delay(5, function() skip.Visible = true end)

if not game:IsLoaded() then
	game.Loaded:Wait()
end

-- Preload only what the first 30 seconds need (max ~40 entries).
local list: { Instance } = {}
local uiAssets = game:GetService("ReplicatedStorage"):WaitForChild("Assets"):WaitForChild("UI")
for _, d in uiAssets:WaitForChild("Preload"):GetChildren() do
	table.insert(list, d)
end
local done = 0
local finished = false
task.spawn(function()
	ContentProvider:PreloadAsync(list, function()
		done += 1
		fill.Size = UDim2.fromScale(done / math.max(#list, 1), 1)
	end)
	finished = true
end)
local started = os.clock()
while not finished and not skipped and os.clock() - started < 15 do
	task.wait(0.1)
end

local fade = TweenInfo.new(0.4)
for _, d in gui:GetDescendants() do
	if d:IsA("GuiObject") then
		TweenService:Create(d, fade, { BackgroundTransparency = 1 }):Play()
	end
	if d:IsA("TextLabel") or d:IsA("TextButton") then
		TweenService:Create(d, fade, { TextTransparency = 1 }):Play()
	elseif d:IsA("ImageLabel") or d:IsA("ImageButton") then
		TweenService:Create(d, fade, { ImageTransparency = 1 }):Play()
	end
end
task.wait(0.45)
gui:Destroy()
```

The 15 s hard cap means a slow preload never traps a player. The game simply continues loading textures in the background.

### Old rescale snippet (corrected)

Earlier versions of this page scaled a full-screen root frame with a UIScale. That shrinks the root itself on phones, so content no longer fills the screen. Use the `AutoScale` tag on corner-anchored clusters instead (Scale module above). If you meet the old pattern in an existing game, replace it with `Scale` rather than patching it.

## Checklist

- [ ] Every ScreenGui: `ResetOnSpawn = false`, `ZIndexBehavior = Sibling`, DisplayOrder in its band (HUD 10 … Transition 50, Loading 100).
- [ ] Interactive ScreenGuis use `CoreUISafeInsets`. Only Dim, Transition, Loading and world-marker layers use `None`.
- [ ] No `Color3.fromRGB`, `Enum.Font` or `TweenInfo.new` outside the Theme module (search the UI scripts).
- [ ] Every top-level cluster and window root is tagged `AutoScale`, and no button is.
- [ ] Smallest phone preset: every tappable element renders at 44 px or more, with 8 px or more between neighbours.
- [ ] Smallest phone preset: no HUD element inside the thumbstick, jump or center keep-out zones (DevOverlay on).
- [ ] Both landscape orientations checked (notch left and right).
- [ ] HUD on phone: ≤ 3 currencies, 1 objective, ≤ 4 menu tiles, ≤ 3 action buttons.
- [ ] Every button uses `Button.bind` (`Activated`, squash, sound, puff), and there's no `MouseButton1Click` left.
- [ ] Every window: one hue, shaped banner, 68 dp red close at the top-right, blur and dim, closes on dim tap and gamepad B.
- [ ] Only one window opens at a time (open Shop, then Pets: Shop closes).
- [ ] Every buy button shows its price with the currency icon, and its states (Buy/Need/Locked/Owned/SoldOut/Processing) are visually distinct.
- [ ] Robux prices come from `GetProductInfo` (change a price on the Creator Hub test product and confirm the label updates next session).
- [ ] Every paid random item shows all outcomes with percentages summing to exactly 100%, before purchase.
- [ ] Players with `ArePaidRandomItemsRestricted` don't see Robux random offers.
- [ ] Currency gains animate (roll, float, pulse), and rewards fly to their destination.
- [ ] Toasts: at most 3 visible, merged duplicates, 2.8 s life.
- [ ] Every list has an empty state with a next-step button.
- [ ] Every server request shows Processing within 100 ms and ends in a success or error state, including the 8 s timeout path.
- [ ] Destructive actions confirm, and rebirth and delete-all use hold-to-confirm.
- [ ] Gamepad: every window selects a control on open, and selection order is logical.
- [ ] Reduced Motion on: no flashes, shakes, flying icons or sunbursts, and everything still works.
- [ ] Max text size and solid backgrounds: nothing clips or overlaps, and panels go opaque.
- [ ] Grayscale screenshot: every rarity and state is still readable.
- [ ] Loading screen: skip appears at 5 s and the hard cap works, and it's gone in under 8 s on a normal connection.
- [ ] No other game's logos, icons or traced layouts.
- [ ] Phone-size screenshots of the HUD and every main window sent to Review with one question.

## Common mistakes

- **Designing at 1920×1080 and shrinking.** Everything ends up tiny and overlapping on phones. Start at 640×360 (Rule 2).
- **Scaling a full-screen root frame with UIScale.** The root shrinks too. Scale corner-anchored clusters instead.
- **Two UIScales on one instance** (the AutoScale and press squash fighting). Nest them on different objects.
- **`TextScaled` on every label.** Each button ends up a different size, and paragraphs become unreadable. Use the type scale.
- **Text over the world with no stroke**, which vanishes on bright skies and sand.
- **Buttons in the thumbstick or jump zones.** Players open the shop while trying to walk.
- **HUD clutter:** six currencies, twelve tiles and three timers on screen in the first minute.
- **Silent buttons:** no squash, no sound, no pending state, so players tap repeatedly and double-buy.
- **Disabled buttons that ignore taps** instead of explaining why.
- **Hard-coded Robux prices** that drift from the real price set on the Creator Hub.
- **Odds that don't add up to 100%, or no odds at all** on paid random items. That's a policy breach [19].
- **Reward popups for every common drop,** which numb players to real rewards.
- **Unskippable reveals** on the 100th hatch.
- **Toasts that stack forever** and cover the play space.
- **Several windows open at once,** with no clear way back to the game.
- **A tiny grey "x"** instead of a big red close button.
- **Binding Escape to close windows** on PC, which conflicts with Roblox's menu.
- **Blinking badges on every tile** from the first second.
- **Client-side granting** of rewards or currency, which becomes an exploit.
- **CanvasGroup on big scrolling windows,** which blanks out under memory pressure on phones [37][39].
- **ViewportFrames in every inventory cell,** which costs frames on phones.
- **Fake countdowns and fake "only 2 left!" labels** (Rule 60).
- **Auto-opening the shop in the first session** ([[09 Shops and Monetization]]).
- **Copying a top game's icons, logos or layouts pixel for pixel** (Rule 57).
- **`ResetOnSpawn = true`,** which closes menus and doubles handlers after every death.

## References

[1] ScreenInsets enum — https://create.roblox.com/docs/reference/engine/enums/ScreenInsets.md — CoreUISafeInsets (recommended for buttons and status text) vs DeviceSafeInsets (notches only)
[2] On-screen containers — https://create.roblox.com/docs/en-us/ui/on-screen-containers.md — TopbarSafeInsets beside the top bar; None for non-interactive backgrounds
[3] ScreenGui class — https://create.roblox.com/docs/en-us/reference/engine/classes/ScreenGui.md — ScreenInsets defaults to CoreUISafeInsets; IgnoreGuiInset switches to DeviceSafeInsets
[4] ScreenGui (API reference) — https://developer.roblox.com/api-reference/class/ScreenGui — ClipToDeviceSafeArea, ignored when ScreenInsets is None
[5] User interface overview — https://create.roblox.com/docs/en-us/ui — on-screen containers and their code run on the client; UI drag detectors for sliders
[6] Adaptive design — https://create.roblox.com/docs/en-us/production/publishing/adaptive-design.md — input fluidity across gamepad, touch, keyboard and VR; layout and hints adapt to input
[7] Font datatype — https://create.roblox.com/docs/reference/engine/datatypes/Font.md — Builder Sans at rbxasset://fonts/families/BuilderSans.json; Enum.Font is the older alternative
[8] Font enum — https://developer.roblox.com/api-reference/enum/Font — FredokaOne and LuckiestGuy in Enum.Font
[9] Font enum (robloxapi) — https://robloxapi.github.io/ref/enum/Font.html — Builder Sans enum variants added in later builds
[10] ApplyStrokeMode enum — https://create.roblox.com/docs/en-us/reference/engine/enums/ApplyStrokeMode.md — Contextual (text) vs Border
[11] UI appearance modifiers — https://create.roblox.com/docs/en-us/ui/appearance-modifiers — UIStroke on text vs border, two strokes on one object, UICorner radius in Scale or Offset
[12] UIStroke class — https://create.roblox.com/docs/reference/engine/classes/UIStroke.md — some border-position options require the Improved UIStrokes beta
[13] UIPadding class — https://create.roblox.com/docs/en-us/reference/engine/classes/UIPadding.md — padding in Offset pixels or Scale fractions
[14] UICorner [Live] thread — https://devforum.roblox.com/t/uicorner-live/632666/427 — community report that UIScale didn't scale Offset corner radii while UIPadding did
[15] Accessibility guidelines — https://create.roblox.com/docs/en-us/production/publishing/accessibility — ReducedMotionEnabled, PreferredTransparency, PreferredTextSize and UITextSizeConstraint behaviour
[16] GuiService class — https://create.roblox.com/docs/reference/engine/classes/GuiService — SelectedObject, AutoSelectGuiEnabled, GuiNavigationEnabled
[17] New Gamepad UI Selection APIs — https://devforum.roblox.com/t/new-gamepad-ui-selection-apis/1791278 — GuiService:Select and SelectionOrder
[18] GuiService:GetGuiInset — https://create.roblox.com/docs/reference/engine/classes/GuiService/GetGuiInset — reading the inset at runtime instead of hard-coding it
[19] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items — all outcomes, numeric odds totaling 100%, keys and tickets, odds boosters, restricted-region alternatives, paid item trading
[20] TechTimes: Korea's loot box rules push Roblox to disclose odds worldwide (June 2026) — https://www.techtimes.com/articles/319148/20260626/koreas-loot-box-rules-push-roblox-disclose-item-odds-worldwide.htm — the 2026 worldwide disclosure change
[21] Post-processing effects — https://create.roblox.com/docs/en-us/environment/post-processing-effects — BlurEffect blurs the 3D view behind menus; Camera effects are per player
[22] Blurred UIs using Depth of Field Effect — https://devforum.roblox.com/t/blurred-uis-using-depth-of-field-effect/4734313 — DoF blur tricks are expensive and graphics-level dependent
[23] Objectual UI Blur — https://devforum.roblox.com/t/objectual-ui-blur/3626057 — limits of frame blur with rounded corners; community blur module
[24] Tween class — https://create.roblox.com/docs/en-us/reference/engine/classes/Tween — TweenInfo examples including Back easing
[25] TweenInfo datatype — https://create.roblox.com/docs/en-us/reference/engine/datatypes/TweenInfo.md — parameter order: time, style, direction, repeats, reverses, delay
[26] EasingStyle enum — https://developer.roblox.com/en-us/api-reference/enum/EasingStyle — easing styles passed to TweenInfo
[27] Understanding easing styles — https://devforum.roblox.com/t/understanding-easing-styles/937281 — Back overshoots and settles
[28] TweenService class — https://create.roblox.com/docs/reference/engine/classes/TweenService.md — tweenable types; a newer tween on the same property cancels the older one
[29] MarketplaceService class — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — PromptProductPurchase, ProcessReceipt, UserOwnsGamePassAsync
[30] How to use ProcessReceipt? — https://devforum.roblox.com/t/how-to-use-processreceipt/141321 — ProcessReceipt can be set only once across all scripts
[31] Loading screens — https://create.roblox.com/docs/en-us/players/loading-screens — ReplicatedFirst, RemoveDefaultLoadingScreen, minimum time, game.Loaded
[32] ReplicatedFirst reference (vi-vn) — https://create.roblox.com/docs/vi-vn/reference/engine/classes/ReplicatedFirst — default screen removed after about 5 s when ReplicatedFirst has content
[33] How do I make a loading screen? — https://devforum.roblox.com/t/how-do-i-make-a-loading-screen/2068326 — ContentProvider preloading yields until assets load
[34] List and flex layouts — https://create.roblox.com/docs/en-us/ui/list-flex-layouts — UIFlexItem FlexMode Fill/Grow/Shrink/Custom
[35] UIFlexItem class — https://create.roblox.com/docs/en-us/reference/engine/classes/UIFlexItem.md — per-item flex overrides
[36] UIListLayout class — https://create.roblox.com/docs/en-us/reference/engine/classes/UIListLayout.md — list layout and flex/wrap options
[37] CanvasGroup class — https://create.roblox.com/docs/reference/engine/classes/CanvasGroup — flattened texture, memory cap, static sizes, Sibling requirement
[38] What is CanvasGroup? — https://devforum.roblox.com/t/1797885 — one texture per group at its absolute size; down-res under memory pressure
[39] CanvasGroup not being rendered in mobile devices — https://devforum.roblox.com/t/canvasgroup-not-being-rendered-in-mobile-devices/4040119 — reported CanvasGroup rendering failures on phones
[40] ImageLabel class — https://create.roblox.com/docs/reference/engine/classes/ImageLabel.md — ScaleType Slice, SliceCenter and SliceScale
[41] Create a custom leaderboard with ordered data stores — https://create.roblox.com/docs/tutorials/use-case-tutorials/data-storage/create-leaderboard — OrderedDataStore SetAsync and GetSortedAsync leaderboard module
[42] Roact UI Framework Crash Course (Deprecated) — https://devforum.roblox.com/t/roact-ui-framework-crash-course-deprecated/796618 — Roact is deprecated
[43] How To: React + Roblox — https://devforum.roblox.com/t/how-to-react-roblox/2964543?page=2 — React-lua as a close port of React
[44] Automatic translation — https://create.roblox.com/docs/production/localization/automatic-translations — automatic text capture; disabling AutoLocalize per object
[45] Localization — https://create.roblox.com/docs/en-us/production/localization — text such as NPC names shouldn't be translated
[46] UI Design Guide (DevForum) — https://devforum.roblox.com/t/ui-design-guide/2975811 — sketch the shop first; borrow ideas without copying
[47] Shop UI free graphics + tutorial — https://devforum.roblox.com/t/shop-ui-free-graphics-tutorial/2297542 — shop structure: background, tabs, purchase button, currency icons
[48] UI Designer Feedback — https://devforum.roblox.com/t/ui-designer-feedback/2540159 — simulator UIs trend simple; don't use another game's logo
[49] Roblox UI design best practices (creation.dev) — https://www.creation.dev/blog/roblox-ui-design-best-practices — consistency of fonts, colors, radii and spacing; HUD shows only what's needed
[50] Roblox UI design best practices, German edition (creation.dev) — https://www.creation.dev/de/blog/roblox-ui-design-best-practices — 44×44 px mobile buttons, no hover-only information, ScreenInsets
[51] Research: Making a 'juicy' game — https://rpgplayground.com/research-making-a-juicy-game/ — the 2012 Juice It or Lose It talk, its techniques and the "juice for its own sake" pitfall
[52] Has your game got 'juice'? — https://www.gamedeveloper.com/business/has-your-game-got-juice-more- — industry discussion of juice
[53] Juice (Brad Woods Digital Garden) — https://garden.bradwoods.io/notes/design/juice — juice techniques: easing, squash and stretch, sound
[54] Game feel — https://eolt.org/articles/game-feel/ — game feel as the input–perception loop (Swink)
[55] Gamepasses (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Gamepasses_(Pet_Simulator_99) — egg-luck passes and their stacking
[56] Pet Simulator 99 eggs (Bloxodes) — https://bloxodes.com/wiki/pet-simulator-99/eggs — per-egg world, unlock area, cost, pet pool, chase pet
[57] Pet Simulator 99: how to collect Index Coins (Prodigy Gamers) — https://prodigygamers.com/2024/01/22/pet-simulator-99-how-to-collect-index-coins/ — Reward option at the bottom of the Index; coins per indexed pet
[58] How to get Index Tokens in Pet Simulator 99 (Pro Game Guides) — https://progameguides.com/roblox/how-to-get-index-tokens-in-pet-simulator-99-roblox/ — tokens unlock with collection, gated at Rebirth 3
[59] Adopt Me trading guide (Allthings) — https://allthings.how/?p=89328 — trade window additions: Quick Chat, typing indicators, spectate, verification icons
[60] Adopt Me Trading Hub (Allthings) — https://allthings.how/adopt-me-trading-hub-how-to-get-offers-on-your-listings/ — listings with an open Offer slot
[61] Grow a Garden seed and gear shop stock explained (Deltia's Gaming) — https://deltiasgaming.com/?p=207402 — five-minute stock refresh; grey "NO STOCK" button
[62] Grow a Garden 2 stock predictor (Allthings) — https://allthings.how/grow-a-garden-2-stock-predictor-how-restock-timing-works/ — per-shop restock cadences and live timers
[63] Sol's RNG: how to get Auto Roll and Quick Roll (Allthings) — https://allthings.how/sol-s-rng-how-to-get-auto-roll-and-quick-roll-in-roblox/ — Auto Roll toggle under Roll; Quick Roll pass; rarity-based settings; aura storage
[64] Sol's RNG guide, features and FAQs (Sportskeeda) — https://sportskeeda.com/roblox-news/sol-s-rng-guide-features-faqs — Auto Roll as a free AFK feature
[65] Brown Bear (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Brown_Bear — repeatable quests, a new one an hour later, fixed reward types
[66] Science Bear (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Science_Bear — 31 quests across two series
[67] Sticker-Seeker Quest Machine (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Sticker-Seeker_Quest_Machine — endless quests with milestones up to the 1000th
[68] How to rank up in Dress to Impress (esports.gg) — https://esports.gg/news/gaming/how-to-rank-up-in-dress-to-impress-dti/ — named rank tiers from New Model to Supernova
[69] How to play Dress to Impress (SteelSeries) — https://steelseries.com/blog/how-to-play-dress-to-impress — 1–5 star runway voting and top-3 podium
[70] Blox Fruits codes (VideoGamer) — https://videogamer.com/guides/blox-fruits-codes — code entry via a small icon on the left of the screen
[71] Blox Fruits codes (ExitLag) — https://www.exitlag.com/blog/blox-fruits-codes/ — redeem steps; guides differ on the menu route
[72] Ranks (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Ranks_(Pet_Simulator_99) — the game's Ranks progression system
[73] GUI Optimization tips? — https://devforum.roblox.com/t/gui-optimization-tips/3986563 — community view that CanvasGroups cost a lot of memory
[74] Controller Cursor (open source) — https://devforum.roblox.com/t/open-source-controller-cursor/535129/2 — community virtual cursor as a gamepad fallback for pointer-heavy UI

Related: [[00 Start Here]] · [[00 For Any AI]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[Claude Design Prompts]]
