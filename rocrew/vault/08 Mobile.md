---
tags: [vault, mobile, touch, performance, input, testing]
for: [frame, builder, scenic, playtest, kid-tester, architect]
also: [lead, librarian, reviewer, merchant, producer]
---

# 08 Mobile

This chapter is how we make every game work on phones and tablets first: screen space and thumb zones, Roblox's touch controls, tap targets, input detection, text that reads on a 6-inch screen, windows on small screens, typing, performance and memory budgets for older phones, streaming, loading, short interrupted sessions, orientation, and how to test, both in Studio and on a real device.

Phones decide whether a Roblox game succeeds. Roblox's own adaptive design guidance asks creators to make every experience work with touch, gamepad, keyboard and VR, and to adapt layout and hints to the input in use [1]. In practice the hardest of these is a small, older phone held sideways by a young player, with a thumbstick under the left thumb, a jump button under the right, Roblox's top bar across the top, and a processor and memory far weaker than the machine Studio runs on. A game that's cramped, unreadable or laggy there fails for a large part of its audience however good it looks in Studio, and the Studio emulator won't warn you about the performance part.

Read this page with [[05 UI and HUD]], which holds the design system, scale formula and component recipes this page refers to. Frame reads all of it before building UI. Builder reads the input, performance, streaming and session sections. Scenic reads the performance budgets before building a map. Playtest and Kid Tester run the test protocols at the end of every build.

**Units.** As in [[05 UI and HUD]], **dp** are design pixels scaled by the UI scale `s` (about 0.68 on a small phone). **px** are real logical pixels on the device. Roblox's own touch controls are sized in px and don't follow our scale. Numbers labelled *target* are studio standards to tune by testing on a real phone, not Roblox limits.

## Rules

**1. Design for a phone in landscape at the 640×360 worst case first, then let tablet, PC and console inherit.**
Why: a layout that fits the smallest screen with all of Roblox's touch controls can grow. A desktop layout shrunk to a phone breaks. Roblox's adaptive design principles start from input fluidity across touch, gamepad, keyboard and VR [1].
Studio: build with the Device Emulator set to the smallest phone preset. Every screen gets a phone screenshot before any other size. [[05 UI and HUD]] gives the per-device layouts.
Done right: the HUD is approved at phone size before the PC check.
Done wrong: everything built at 1920×1080, then "fixed for mobile" a day before ship.

**2. Every feature is playable by touch alone: no keyboard-only shortcuts, no right-click, no scroll wheel, no hover, and no gestures without a button alternative.**
Why: touch players can't press E. If even one step of the first session needs a key, a large share of players are stuck.
Studio: every action has an on-screen control or a `ProximityPrompt`. Keyboard keys are shortcuts on top, never the only way. Kid Tester runs the first session touch-only (protocol below).
Done right: opening the shop by tapping its tile, with G as an extra PC shortcut.
Done wrong: "Press Q to sell" with no Sell button on phones.

**3. Route all input through one input layer so a key, a gamepad button and a touch button trigger the same request.**
Why: three separate code paths drift apart. One gets a cooldown fix and the others don't. A single layer also lets the UI swap prompts per device.
Studio: an `Input` module (code under "Luau") wraps `ContextActionService` and our own touch buttons. Every action has a name (`"Sell"`, `"Ability1"`), one handler and a list of bindings. The handler fires one remote, and the server decides.
Done right: E, ButtonX and the on-screen DASH button all call `Input.fire("Dash")`.
Done wrong: a touch button that calls a different remote than the key.

**4. Detect the current input from the last input type, not from `TouchEnabled` alone, and update prompts when it changes.**
Why: touch laptops and tablets with keyboards report `TouchEnabled = true`. Players switch from touch to a gamepad mid-session. Prompts must match what the player is holding right now.
Studio: `UserInputService:GetLastInputType()` plus `UserInputService.LastInputTypeChanged` decide the mode: Touch, Gamepad, or KeyboardMouse. Hotkey chips appear only in KeyboardMouse mode, glyphs only in Gamepad mode, and touch buttons only in Touch mode (code under "Luau"). In Gamepad mode, windows also set a selection when they open, through `GuiService.SelectedObject` or `GuiService:Select` [7][8].
Done right: a player plugs in a controller, and "[E] Open" becomes the controller glyph within a frame.
Done wrong: hotkey hints shown on a phone because it reported a keyboard once.

**5. The bottom-left belongs to the thumbstick: keep the bottom 45% of the screen height in the left 35% of its width free of UI on phones (bottom 40%, left 25% on tablets).**
Why: Roblox's default touch movement puts a thumbstick under the left thumb in the lower-left area. Buttons there either eat movement touches or get pressed by accident.
Studio: enable the `DevOverlay` keep-out frames from [[05 UI and HUD]] during tests. Menu tiles sit at the left-middle, above the 55% line. Never read or move Roblox's `TouchGui` by name. Its internals can change without notice, so leave generous clear zones instead.
Done right: a 2×2 menu grid whose bottom edge is above the 55% line.
Done wrong: a Shop tile in the bottom-left corner that opens every time a kid tries to walk.

**6. The bottom-right belongs to jump: keep a 160×140 px box clear on phones (240×280 px on tablets), and put actions in an arc above and to the left of it.**
Why: the jump button is where the right thumb rests. The arc around it is the most reachable place on the screen, but a button overlapping jump makes the player jump when they meant to act, or the reverse.
Studio: the primary action is a 96 dp circle anchored (1, 1) at (−170, −24) px, and secondary actions are 72 dp at (−60, −170) and (−280, −40) (layout table in [[05 UI and HUD]]). Check that no button overlaps the jump button in any phone preset.
Done right: the Sell button sits just left of jump, one thumb-roll away.
Done wrong: a custom button placed on top of the jump button.

**7. The right half of the screen is the camera drag area, so no persistent panel there is wider than 25% of the screen.**
Why: touch players turn the camera by dragging on open screen space, mostly with the right thumb. A big panel on the right blocks camera control, and players feel stuck.
Studio: windows open centered and close in one tap. HUD elements on the right are compact (currency pills, the action arc), following the general rule that a HUD shows only what players need at that moment [11]. Timers and boosts stack vertically at the top-right in 48 dp chips.
Done right: a quest list that lives in a window, with only a one-line pill on the HUD.
Done wrong: a permanent 400 px quest log on the right side of a phone screen.

**8. Interactive UI uses `ScreenInsets = CoreUISafeInsets`, full-screen backgrounds use `None`, and nothing hard-codes the top bar height or notch size.**
Why: `CoreUISafeInsets` (the default) keeps content clear of device cutouts and Roblox's top bar, and Roblox recommends it for any ScreenGui with buttons or status text. `DeviceSafeInsets` avoids only notches [2][4]. `None` is for non-interactive backgrounds [3]. `IgnoreGuiInset = true` switches a ScreenGui to DeviceSafeInsets [4], and `ClipToDeviceSafeArea` controls clipping to the safe area [5].
Studio: read the inset with `GuiService:GetGuiInset()` when code needs it [6]. Never use a constant like 36 or 58.
Done right: the HUD stays clear of the notch whichever way the phone is turned.
Done wrong: a currency counter under the notch on one landscape side.

**9. Test both landscape orientations, because the notch side changes.**
Why: with `LandscapeSensor`, the phone can be held notch-left or notch-right, and safe insets move with it. A layout checked only one way can break the other way.
Studio: in the Device Emulator, rotate the preset (or pick the mirrored orientation), then re-check every corner cluster and window close button.
Done right: screenshots at both orientations in the Review.
Done wrong: the close button under the notch for half of all players.

**10. Every tappable element is at least 44 px on its shortest side at small-phone size, primary actions 60–80 px, with at least 8 px between neighbours.**
Why: small targets mean missed taps and accidental purchases. A widely used guideline for Roblox mobile UI is 44×44 px minimum [10]. Young players and moving cars make near-misses more likely.
Studio: under our scale, 66 dp renders at 44 px on the smallest phone. HUD tiles are 80 dp, the primary action 96 dp, the close button 68 dp. Icons smaller than the minimum sit inside a larger transparent button, and a `UISizeConstraint.MinSize` backs this up on scale-sized elements. Check rounded corners at phone scale too: a community report says UIScale didn't shrink Offset-based corner radii [45], which makes small buttons look like blobs. Use Scale radii (`UDim.new(0.5, 0)`) on small round buttons.
Done right: a 56 dp gear icon inside a 72 dp hit area.
Done wrong: 30 px "x" buttons on every popup.

**11. Make the hit area bigger than the art, and forgive near-misses.**
Why: fingers cover what they tap, and players aim at the middle of what they see. A visible 64 dp button with a 72 dp hit area catches the taps that just miss.
Studio: put a transparent `ImageButton` (or `TextButton` with `Text = ""`) 8 dp larger on each side than the visual, and parent the visual inside it. In grids, the whole cell is the button, not just the icon.
Done right: tapping just outside the visible edge of a tile still opens it.
Done wrong: a 40 dp icon whose button is exactly 40 dp.

**12. Touch has no hover. Nothing important appears only on `MouseEnter`, and tooltips appear on tap or are always visible.**
Why: `MouseEnter`/`MouseLeave` and `ClickDetector.MouseHoverEnter` don't fire for a finger the way they do for a mouse, so hover-only information is invisible to touch players. Roblox UI guides warn against hover-only info for this reason [10].
Studio: the first tap selects and shows details, and a second tap or a separate button confirms. Item stats live in the detail panel, not in a hover tooltip.
Done right: tapping a pet shows its stats panel with an Equip button.
Done wrong: pet stats that appear only when a mouse hovers the cell.

**13. Drag-and-drop always has a tap fallback (tap the item, then tap the slot).**
Why: dragging small items on a small screen is error-prone, and it fights with camera drag and scrolling.
Studio: tap-to-select highlights the item (3 dp white border), and the valid slots pulse until one is tapped. Drag is an optional extra on PC. Roblox does offer UI drag detectors for 2D sliders and similar controls [12], but every slider still gets +/− step buttons.
Done right: equipping by tapping a pet, then tapping an empty team slot.
Done wrong: an inventory that only works by dragging.

**14. Never require typing in the first session. Offer chips, presets or quick replies wherever typing would otherwise be needed.**
Why: the on-screen keyboard covers about half the screen, typing is slow for young players, and many are on chat-restricted accounts. Adopt Me's trade window added Quick Chat replies, so players can negotiate without typing [34].
Studio: names get a "Random name" button and a list of presets. Trades use quick-reply chips. Search fields are hidden on phones (filters and sort chips instead). Codes are optional and live in Settings.
Done right: naming a pet by tapping one of 6 suggestions, with an "Edit" option.
Done wrong: a mandatory "Type your pet's name" box on the first hatch.

**15. Every `TextBox` sits in the top half of the screen when focused, and its window doesn't jump around when the keyboard opens.**
Why: the keyboard rises from the bottom. A text box in the lower half disappears behind it, and the player can't see what they're typing.
Studio: on phones the codes window places its box at 30–40% of the screen height. `ClearTextOnFocus = false`. `FocusLost` with `enterPressed` true submits. A visible Redeem button is required too, because some keyboards hide Enter.
Done right: the code box at the top of the codes window, readable while typing.
Done wrong: a chat-style input bar at the bottom of the screen, under the keyboard.

**16. One thumb can play the core loop. Repeated actions get an Auto mode (free unlock, gamepass, or upgrade), placed right next to the action it automates.**
Why: phones are held in one hand on the couch or in a car, and players repeat the core action hundreds of times. In Sol's RNG, Auto Roll sits right under the Roll button and keeps rolling until it's switched off. Guides say joining the developer's group unlocks it for free [28], and Sportskeeda describes it as made for AFK play [29].
Studio: the loop's primary action is the 96 dp button in the action arc. If the loop is "tap repeatedly", design an Auto toggle chip directly under it from the start ([[02 The Core Loop]], [[09 Shops and Monetization]]).
Done right: "Auto Click" chip under the Click button, with a clear ON/OFF state.
Done wrong: an auto feature only reachable through Settings → Gameplay → Automation.

**17. Show at most 3 always-visible action buttons on phones. If the loop needs more, simplify the loop.**
Why: every extra button competes for the same thumb and the same screen corner. Three is about what fits in the arc around jump without crowding (see the layout in [[05 UI and HUD]]).
Studio: contextual buttons appear only when relevant (Sell when the bag is full). Abilities on cooldown dim but stay in place. A fourth action becomes a radial or a context swap, or goes away ([[02 The Core Loop]]).
Done right: Attack, Dash and one contextual Interact.
Done wrong: six ability buttons around jump on a 6-inch phone.

**18. Use `ContextActionService` touch buttons for 1–3 simple actions, and unbind each one the moment it's unavailable.**
Why: `ContextActionService:BindAction(name, handler, true, ...)` binds keys, gamepad buttons and an on-screen touch button in one call, and Roblox places the touch button near jump. An unbound action's button disappears, which is clearer than a button that does nothing.
Studio: code under "Luau". Use `SetTitle`, `SetImage` and `SetPosition` to style and place it, and `GetButton` for further styling. `UnbindAction` while menus are open, in cutscenes, when dead. For more control or more than 3 actions, build your own arc in a ScreenGui.
Done right: the DASH button vanishes when the player opens the shop and returns on close.
Done wrong: a touch button that stays on screen during cutscenes and does nothing.

**19. World interactions use `ProximityPrompt` (tappable on touch, key hint on PC, button hint on gamepad), with `HoldDuration` for anything costly or destructive.**
Why: ProximityPrompts adapt to each input automatically and work at any screen size. Holding stops accidental triggers when a kid walks past.
Studio: `ActionText` is one verb ("Open", "Hatch"), `ObjectText` the object, `MaxActivationDistance` 10–12 studs, `ClickablePrompt = true`, `RequiresLineOfSight = false` for stands with decorations in front. Use `HoldDuration = 0.5` for selling and `0` for free actions. Never let more than 2 prompts overlap at one spot.
Done right: walking up to an egg shows "Hatch — Candy Egg" that a tap triggers.
Done wrong: invisible touch parts you have to bump into, or three prompts stacked over one stand.

**20. Text a player must read is at least 14 px on the smallest phone, labels 16–18 px, and changing numbers 20 px or more.**
Why: unreadable text doesn't exist for the player. Phone screens are small and often viewed outdoors.
Studio: use the type scale in [[05 UI and HUD]] (Micro 21 dp = 14 px at `s` 0.68, Body 24 dp = 16 px). Fonts are heavy and rounded: Fredoka One, Luckiest Guy, and Builder Sans in Bold or ExtraBold through `Font.new("rbxasset://fonts/families/BuilderSans.json", Enum.FontWeight.Bold)` [22]. Thin and script fonts are banned on phones.
Done right: all body text at 16 px or more in the smallest preset.
Done wrong: 10 px grey stat lines nobody can read.

**21. Text over the 3D world has a dark `UIStroke` or a solid backing panel.**
Why: the world behind HUD text changes from bright sky to dark caves. Without an outline, white text disappears on bright scenes and dark text on dark ones. A UIStroke parented to a text object outlines the text by default [23].
Studio: 2–2.5 dp Ink stroke with `LineJoinMode = Round`. Check legibility over the brightest and darkest scenes in the game.
Done right: white numbers with a dark outline, readable on snow and in a cave.
Done wrong: yellow text on a sunny beach.

**22. `TextScaled` is only for single short labels in fixed boxes. Paragraphs and lists use fixed text sizes with wrapping.**
Why: `TextScaled` makes every label a different size depending on its text length, and long text shrinks to dust on phones.
Studio: short labels get `TextScaled` plus a `UITextSizeConstraint` (MinTextSize 14, MaxTextSize at least 1.5× the base). Paragraphs get a fixed `TextSize`, `TextWrapped = true`, `AutomaticSize = Y` inside a vertical ScrollingFrame.
Done right: item descriptions at one consistent size that wrap and scroll.
Done wrong: a description auto-scaled to 9 px so it fits a box.

**23. Leave headroom for the player's text size setting and for translations: at least 1.5× text caps and 30% spare label width.**
Why: Roblox exposes the player's preferred text size (`GuiService.PreferredTextSize`), and text with a `UITextSizeConstraint` won't grow past its `MaxTextSize` whatever the player chose [9]. Translations are often longer than English, and automatic translation fills translated strings into the same boxes [43].
Studio: use `AutomaticSize` on buttons and rows so they grow with text, and test at the largest text size.
Done right: a German "KAUFEN" fits the Buy button.
Done wrong: translated labels cut off mid-word.

**24. On phones, windows use the Compact layout: 600×400 dp design, one column, a left tab rail, 3–4 column grids, and detail views that replace the grid instead of sitting beside it.**
Why: a desktop window shrunk to a phone makes text unreadable (see "Scaling system" in [[05 UI and HUD]]). A purpose-built compact layout keeps text and targets at full size.
Studio: each window root carries `DesignWide` and `DesignCompact` children, and the window controller shows one based on `Scale.isCompact()`.
Done right: the inventory on a phone shows 4 columns, and tapping a pet slides in a full-card detail view with a back arrow.
Done wrong: a 6-column grid with a side panel crushed onto a phone screen.

**25. Windows scroll in one direction only (vertical), with a scrollbar at least 8 dp thick, and nothing important hides at the end of a long scroll.**
Why: two-axis scrolling fights with camera drag and confuses players. Primary actions buried under a scroll never get seen.
Studio: `ScrollingDirection = Enum.ScrollingDirection.Y`, `AutomaticCanvasSize = Y`, `CanvasSize = UDim2.new()`, `ScrollBarThickness` = 8 dp × s, and `ElasticBehavior` left at its default. Primary actions sit in a fixed footer outside the scroll.
Done right: the Buy button for the selected item fixed in the footer.
Done wrong: a horizontal carousel inside a vertical list.

**26. Every destructive or paid action asks for confirmation on touch, and the biggest use hold-to-confirm.**
Why: accidental taps happen far more on touch, from palms, pocket taps and a thumb landing on the wrong button.
Studio: `Confirm.ask` from [[05 UI and HUD]] for sell all, delete and spend premium currency. A 1.2 s hold for rebirth and multi-delete. Robux purchases are confirmed by Roblox's own prompt via `MarketplaceService` [27], so don't add a second confirm.
Done right: "Sell all 48 pets? Hold to confirm."
Done wrong: "Sell all" one tap away from "Equip best".

**27. Hold a steady 30 fps or better on the owner's low-end test phone in the busiest scene, and 55+ on a mid-range phone (targets).**
Why: lag on phones reads as "broken game", and phones are far weaker than a dev PC. Performance problems hidden in Studio surface on devices.
Studio: build to the budgets in "Performance budgets" below. Playtest records FPS with the debug HUD (code under "Luau") on the real device test. Any scene under target is a bug assigned to the area's owner.
Done right: a 20-player lobby that stays at 35 fps on the owner's old phone.
Done wrong: "Runs at 240 fps in Studio" as the only evidence.

**28. Watch client memory across a 15-minute session and treat steady growth as a leak to fix before ship.**
Why: phones have little memory and the app crashes when it runs out, often silently. Players just see the game close. Leaks come from un-destroyed UI, endless effects, connections that are never disconnected, and streamed-in models that never stream out.
Studio: Developer Console (F9 in a client, or type `/console` in chat on a device) → Memory. Log `Stats:GetTotalMemoryUsageMb()` every 60 s in testing builds. Target: total growth under 100 MB over 15 minutes of normal play, then flat.
Done right: memory rises at join, then stays flat within 50 MB.
Done wrong: +20 MB a minute because every toast creates a new sound that's never destroyed.

**29. Enable `Workspace.StreamingEnabled` for any map bigger than one spawn area, and design for parts not being there yet.**
Why: streaming sends the client only the area around the player, which cuts join time and memory on phones. Client code must expect streamed parts to arrive late or leave.
Studio: StreamingEnabled on, `StreamingMinRadius` and `StreamingTargetRadius` tuned (start from the defaults in the Properties window, then lower the target radius for big maps). Important models get `ModelStreamingMode = Atomic` (load whole) or `Persistent` (always present, sparingly). Client code uses `WaitForChild` with a timeout, or `CollectionService` added signals, never direct indexing into the map. Before teleporting a character, the server calls `player:RequestStreamAroundAsync(position)` ([[13 Building It Right]]).
Done right: the hatch stand's prompt appears when it streams in, with no errors in Output.
Done wrong: `workspace.Map.Zone5.Portal.Touched` erroring on join because Zone 5 hasn't streamed in.

**30. Keep the spawn area light: at most about 5,000 parts and 60 unique textures in view at spawn (targets).**
Why: the first seconds after join are when phones struggle most (loading, streaming, building UI) and when players decide to stay. A heavy spawn means a slow, stuttering first impression.
Studio: Scenic counts parts in the spawn view with a command-bar script. Big decorative structures use few large meshes rather than hundreds of parts. Details live further from spawn ([[06 World and Look]]).
Done right: a spawn plaza of simple shapes and a few hero meshes, at full frame rate.
Done wrong: a 20,000-part castle at spawn.

**31. Make static things cheap: anchored, and with `CanCollide`, `CanTouch` and `CanQuery` off on decoration, `Box` or `Hull` collision on decor meshes, and `CastShadow` off on small props.**
Why: physics and touch events cost CPU even when nothing moves. Precise collision geometry on decor costs memory. Shadows on hundreds of small props cost render time.
Studio: a decor pass script sets these on everything under `Workspace.Map.Decor`. Gameplay parts keep collision.
Done right: 3,000 decorative flowers with collisions and shadows off.
Done wrong: every pebble with `CollisionFidelity = PreciseConvexDecomposition`.

**32. Reuse meshes, textures and materials, and keep textures at the lowest resolution that looks right (512 px for props, 1024 for hero assets, as targets).**
Why: every unique texture and mesh costs download time and memory. Reused assets are loaded once.
Studio: Librarian keeps one asset library per game ([[07 Characters, VFX and Assets]]). Duplicate the same MeshId rather than importing near-identical copies, and use `SurfaceAppearance` only on hero models.
Done right: 40 trees from 3 meshes and 2 textures.
Done wrong: 40 slightly different imported trees, each with its own 2048 texture.

**33. Effects have a phone budget: at most 8 ParticleEmitters visible at once with a combined rate under 200 particles per second, and at most 4 dynamic lights near the player (targets).**
Why: particles, lights and stacked transparency are the classic phone frame killers, and reward moments (hatches, rebirths) are exactly when many fire at once.
Studio: emitters are short-lived bursts (`Emit(n)`) rather than always-on, and `Rate` is scaled down by the quality setting (Rule 35). Lights with `Shadows = true` are rare. Overlapping transparent surfaces are kept to 3 layers or fewer.
Done right: a hatch burst of 40 particles once, then nothing.
Done wrong: 30 always-on sparkle emitters around the spawn.

**34. UI costs frames too: no per-frame updates on more than about 20 objects, at most 1 ViewportFrame on screen on phones, and paginated big lists.**
Why: hundreds of animated strokes, gradients and images rebuild every frame and hitch phones. `CanvasGroup` costs texture memory, needs a new texture when resized, and can render blank when memory exceeds the quality-level cap [13]. Community reports describe one texture per group at its absolute size [14], CanvasGroups failing to render on mobile devices [15], and their memory cost [16].
Studio: inventories over 200 items are paged or virtualized. Grid cells use static images, not ViewportFrames. CanvasGroup only on small fixed-size elements (toasts, popups). Animate with short tweens (a `TweenInfo` of 0.06–0.3 s [44]) on a handful of objects, not Heartbeat loops over every cell.
Done right: a 600-pet inventory that opens instantly on a phone.
Done wrong: 600 ViewportFrames with rotating pets in the grid.

**35. Scale effects to the device: read the player's saved graphics quality, offer an in-game Reduced Effects toggle, and use cheaper effects when either is low.**
Why: Roblox already lowers rendering quality on weak devices, but our particle counts, blur and screen effects are ours to scale. DepthOfField-based UI blur tricks are expensive, and community posts report they don't render at lower graphics levels [18][19]. BlurEffect on the camera is the simpler per-player option [17].
Studio: `UserSettings():GetService("UserGameSettings").SavedQualityLevel` gives `Enum.SavedQualitySetting`. Automatic means the engine chooses, so treat it as medium. Reduced Effects (Settings) halves particle rates, disables menu blur and screen shake, and skips idle animations. Code under "Luau".
Done right: an old phone with Reduced Effects on keeps 30 fps through a Legendary hatch.
Done wrong: identical 200-particle explosions on every device.

**36. One loop per system, not one per object, and pool anything spawned often.**
Why: 300 coins each with their own `Heartbeat` connection or `while true` loop melt phone CPUs. Creating and destroying instances many times a second churns memory.
Studio: one `RunService.Heartbeat` connection per system iterates a table of active objects. Coins, damage numbers, toast frames and fly-to icons come from pools ([[05 UI and HUD]] RewardFX). Builder enforces this in review ([[13 Building It Right]]).
Done right: one CoinSpin system rotating 300 coins in one loop.
Done wrong: a script inside every coin model.

**37. Players see the first frame of gameplay within 10 s on a typical phone connection (target), and the loading screen never blocks for more than 15 s.**
Why: phone players leave slow joins. Roblox's loading-screen pattern moves a ScreenGui into PlayerGui from ReplicatedFirst and removes the default screen [20]. Preloading with `ContentProvider:PreloadAsync` yields until the listed assets are loaded [21], so preloading too much makes the wait longer, not shorter.
Studio: preload only the first 30 s of icons and sounds (40 entries or fewer), show Skip at 5 s, hard-cap at 15 s (code in [[05 UI and HUD]]). If anything is in ReplicatedFirst, Roblox removes the default screen after about 5 s anyway [46], so call `RemoveDefaultLoadingScreen` yourself and control the timing. Lighten the spawn (Rule 30) and enable streaming (Rule 29).
Done right: a 4-second branded loading screen on Wi-Fi, 8 s on mobile data.
Done wrong: preloading every asset in the game behind a 45-second spinner.

**38. Expect sessions to be short and interrupted: autosave regularly, resume instantly, and show progress gained since the last visit.**
Why: phone sessions end abruptly (a notification, a call, a dead battery, a parent). Lost progress is the worst outcome. Short check-in loops suit phones. Grow a Garden's shops restock on short timers that bring players back to check [30][31], and Bee Swarm Simulator's Brown Bear offers a new quest an hour after the last was started [36].
Studio: Builder saves on a timer (every 60–120 s as a target) and on `PlayerRemoving` and `game:BindToClose` ([[13 Building It Right]]). On join, the welcome-back popup shows offline gains or what's ready ("Your crops are grown!"). Timed systems use server timestamps so they progress while the player is away ([[10 Retention and Social]]).
Done right: a kid closes the app mid-run, rejoins 10 minutes later, and loses nothing.
Done wrong: saving only on leave, so a crash loses an hour.

**39. The game is fully playable with sound off. Every audio cue also has a visual cue.**
Why: many phones are played muted, in public or late at night. If a timer or a danger is announced only by sound, a muted player misses it.
Studio: reward sounds pair with fly-to and toast, danger sounds with a screen-edge tint or icon, and timer warnings with a color change and pulse ([[05 UI and HUD]]).
Done right: "Boss incoming!" toast plus a red edge pulse alongside the horn.
Done wrong: a ticking-clock sound as the only hint that time is running out.

**40. Keep landscape (`LandscapeSensor`) unless the game is designed for portrait from the start. Never enable free rotation without two fully designed layouts.**
Why: Roblox experiences default to landscape, and the thumbstick, jump button and camera space are designed around it. Portrait shrinks all of them and needs a different HUD. Free rotation (`Sensor`) means every screen needs both layouts.
Studio: set `StarterGui.ScreenOrientation` deliberately and write the choice in `decisions.md`. If portrait is chosen, design it as its own layout (see "Orientation" below) and re-layout on `workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize")` and `PlayerGui:GetPropertyChangedSignal("CurrentScreenOrientation")`.
Done right: a portrait-first idle game with a bottom tab bar, tested in portrait presets.
Done wrong: `Sensor` on a landscape game, so the HUD overlaps itself when a phone rotates.

**41. The Device Emulator proves layout and touch, never performance. Every ship needs a real low-end phone test by the owner.**
Why: the emulator reproduces screen size, safe areas and touch input on a powerful PC. It says nothing about frame rate, memory, heat or load time on a real phone.
Studio: Playtest runs the emulator matrix every build. Before ship, ask the owner to play on a low-end phone (`node studio/cli.mjs ask --title "Phone test" --body "..."`) with the debug HUD enabled, and to note FPS and any scene that drops. Never write "runs well on mobile" from the emulator alone ([[00 For Any AI]]).
Done right: a gate report with the owner's phone model, FPS per scene and a screenshot.
Done wrong: "Mobile tested ✓" from a Studio emulator session.

**42. Mobile shops are readable and honest at phone size: prices come from `GetProductInfo`, Roblox's prompt is the confirmation, and paid random items show full odds that fit on the screen.**
Why: the shop is where small text and tiny buttons cost the most trust. Roblox policy requires all outcomes and numerical odds as percentages totaling 100% for paid random items, shown before purchase [26], and the odds table must be readable on a phone, not just present.
Studio: on Compact, pass cards are 2 columns with 1-line names and egg odds use a 3-column pool grid with Caption 22 dp percentages (15 px). Price labels come from `MarketplaceService:GetProductInfo` [27] ([[05 UI and HUD]] recipes).
Done right: an egg card on a phone where every percentage is readable without zooming.
Done wrong: an odds list in 9 px text, technically present and practically invisible.

## Step by step

### Making a game phone-ready in 16 steps

1. **Set orientation.** Confirm `StarterGui.ScreenOrientation = LandscapeSensor` (or Portrait, if the plan says so) and record the choice in `games/<slug>/decisions.md`.
2. **Choose movement and camera modes.** Leave `StarterPlayer.DevTouchMovementMode = UserChoice` and `DevTouchCameraMovementMode = UserChoice` unless the design needs otherwise (see "Roblox's touch controls"). Set `Scriptable` only if Builder is shipping custom touch movement.
3. **Install the UI kit** from [[05 UI and HUD]], including the Scale module, so `s` and the Compact layouts work.
4. **Turn on the DevOverlay** keep-out zones (thumbstick, jump, center) in testing builds.
5. **Lay out the HUD at 640×360** using the phone table in [[05 UI and HUD]], and check nothing sits in a keep-out zone.
6. **List every action** in the core loop and map each to a touch control, a key and a gamepad button in the `Input` module. More than 3 always-visible touch actions means going back to Architect (Rule 17).
7. **Replace hover and drag** interactions with tap-select flows (Rules 12–13).
8. **Remove typing from the first session** (Rule 14), and move any text box to the top half (Rule 15).
9. **Build Compact layouts** for every window (Rule 24).
10. **Run the static-part pass** on the map: anchor, collisions/touch/query off on decor, Box/Hull collision on decor meshes, shadows off on small props (Rule 31).
11. **Turn on streaming** if the map is bigger than one area, and convert client map lookups to streaming-safe code (Rule 29).
12. **Count the spawn view** (parts, unique textures, emitters, lights) against the budgets, and fix anything over.
13. **Add the quality hooks:** Reduced Effects setting, quality-based particle scaling and blur skip (Rule 35).
14. **Add the debug HUD** (FPS, memory, ping) behind a testing flag.
15. **Run the emulator matrix** (smallest phone, large phone, tablet, both orientations) and the touch-only first session.
16. **Request the owner's real-phone test** with the protocol below, and fix every scene under target.

### Real-device test protocol for the owner, in 9 steps

Send this as the body of a `cli.mjs ask`. Keep it short and concrete:

1. Use the oldest phone you have that still runs Roblox. Note its model.
2. Join the private test version of the game on mobile data if you can (not just Wi-Fi), and time the join from tapping Play to controlling your character.
3. Turn on the debug HUD (the toggle in Settings, testing builds only).
4. Play the first 5 minutes normally. Note any moment the FPS number goes under 30.
5. Open every menu once and tap every button. Note anything hard to hit or hard to read.
6. Do the biggest reward moment (a hatch or rebirth) 5 times in a row and watch the FPS.
7. Leave the game running for 15 minutes (play or idle), and note memory at the start and end.
8. Turn the phone to the other landscape side and check the corners.
9. Send a screenshot of the worst moment and a one-line note per problem.

### Touch-only first session test for Kid Tester, in 8 steps

1. Start Play in the Device Emulator, smallest phone preset, and don't touch the keyboard.
2. From control to first reward, write down every moment you didn't know what to tap.
3. Try to walk using the thumbstick zone while menu tiles are on screen. Note any accidental opens.
4. Jump 10 times while pressing the main action. Note any wrong button hit.
5. Open each window, read its smallest text out loud, and close it with the X.
6. Find and use one ProximityPrompt.
7. Check that nothing asked you to type.
8. Write the report in `games/<slug>/reports/kid-test-mobile-<date>.md` with screenshots.

## Device classes and viewports

Logical viewport sizes (what `workspace.CurrentCamera.ViewportSize` reports) vary by device. Design for these classes:

| Class | Typical logical viewport (landscape) | Short side | UI scale s | Roblox touch controls | Our layout |
|---|---|---|---|---|---|
| Small phone | ~640×360 | 360 | 0.68 | Small jump button, thumbstick | Phone, Compact windows |
| Large phone (notched) | ~844×390 | 390 | 0.73 | Small jump, notch insets on one side | Phone, Compact windows |
| Small tablet | ~1024×768 | 768 | 1.07 | Larger jump button | Tablet, Wide windows |
| Large tablet | ~1366×1024 | 1024 | 1.15 | Larger jump | Tablet, Wide windows |
| PC | 1280×720 to 1920×1080+ | 720+ | 1.0–1.15 | None | PC |
| Console (TV) | 1920×1080 | 1080 | 1.35 | None (gamepad) | Console, 5% TV-safe margin |

The phone/tablet boundary is a short side of 500 px, which is also roughly where Roblox's default touch controls switch between their small and large layouts. The exact numbers are Roblox's to change, so verify in the emulator rather than coding against them.

## Thumb zone maps

### Phone, landscape

```
+------------------------------------------------------------------------+
| [Roblox top bar] — read-only status only below it                      |
|                    [ objective pill ]                   [ currencies ] |
|                    [ toasts         ]                   [ boosts     ] |
|  [menu 2x2]                                                            |
|  left-middle,         CENTER 50% x 50%: the game, keep clear           |
|  above 55% line                                                        |
|                                  right half = camera drag: no big UI   |
| ......................                                     [act2]      |
| : THUMBSTICK ZONE    :                        [ACTION]   .........     |
| : left 35%, bottom   :                          [act3]   : JUMP  :     |
| : 45%  -- no UI      :                                   :160x140:     |
+------------------------------------------------------------------------+
  easy reach: bottom corners and the left/right edges at mid-height
  hard reach: top-center (fine for read-only info)
```

### Tablet, landscape (two hands at the edges)

```
+--------------------------------------------------------------------------------+
| [Roblox top bar]          [ objective ]                          [currencies]   |
|  [menu 2x3]                                                                     |
|  within 30% of the left edge          the middle 40% is out of thumb reach:     |
|                                       read-only info and the game only          |
| .................                                          [act2]               |
| : THUMBSTICK    :                                 [ACTION]       ...........    |
| : left 25%,     :                                                : JUMP     :   |
| : bottom 40%    :                                                : 240x280  :   |
+--------------------------------------------------------------------------------+
```

### Phone, portrait (only for portrait-designed games)

```
+--------------------------+
| [Roblox top bar]         |
| [coins] [gems]    [event]|
| [ objective, full width ]|
|                          |
|        the game          |
|                          |
|                          |
| [Shop][Pets][Quest][More]|  <- bottom tab row above the controls
| ...........    [ACTION]  |
| :thumbstick:     [JUMP]  |
+--------------------------+
```

In portrait, windows become bottom sheets taking 70% of the height, with a drag handle and an X. The camera drag area is tiny, so keep the top half clear.

## Roblox's touch controls

What the default PlayerModule gives touch players, and what we may change:

- **Movement:** `StarterPlayer.DevTouchMovementMode` takes `UserChoice` (the player's setting), `Thumbstick`, `DynamicThumbstick` (appears where the left thumb lands), `Thumbpad`, `ClickToMove` or `Scriptable` (no default movement controls; we provide our own). Keep `UserChoice` for almost every game. Players set their preference once for all games.
- **Camera:** `StarterPlayer.DevTouchCameraMovementMode` takes `UserChoice`, `Classic`, `Follow` or `Orbital`. Leave `UserChoice` unless a specific design (a racing chase cam, a top-down tycoon) requires otherwise. Camera drag happens on open screen space, which is why Rule 7 exists.
- **Jump:** a jump button at the bottom-right. It's hidden when the character can't jump (`Humanoid.JumpPower` or `JumpHeight` at 0 with `UseJumpPower` set accordingly), which is useful for sit-down or vehicle modes. Never cover it.
- **ContextActionService buttons:** `BindAction(..., true, ...)` adds a round touch button in a frame next to jump. Good for 1–3 actions.
- **Don't** reach into `PlayerGui.TouchGui` to move or restyle Roblox's controls by name. It works until Roblox ships an update, and then it breaks silently on every phone. If a game truly needs custom movement controls, Architect decides that, and Builder sets `Scriptable` and builds them fully.

## Custom action buttons

Our own action arc (used when there are more than 1–2 actions, or when the art needs to match the game) follows the HUD layout in [[05 UI and HUD]]:

| Slot | Size | Anchor | Position (px from safe bottom-right) | Use |
|---|---|---|---|---|
| Primary | 96 dp circle | (1, 1) | (−170, −24) | Core loop action (Click, Attack, Cast, Roll) |
| Secondary A | 72 dp | (1, 1) | (−60, −170) | Ability / dash, above jump |
| Secondary B | 72 dp | (1, 1) | (−280, −40) | Contextual (Sell, Interact) further left |
| Auto chip | 64×36 dp pill | (1, 1) | Directly under or beside Primary | Auto mode toggle (Rule 16) |

Behaviour:
- **Press feedback:** the standard button feel (squash 0.92, spring back, click), plus a gamepad glyph or key chip when not in Touch mode.
- **Cooldowns:** a vertical fill frame (Ink at 0.4 transparency) shrinking from the top over the cooldown, plus the remaining seconds in Number text. The button stays in place while cooling down.
- **Hold actions:** use `InputBegan`/`InputEnded` with `Enum.UserInputType.Touch` and track the specific `InputObject`, since multi-touch means the thumbstick finger and the action finger are different inputs.
- **Multi-touch:** never assume one touch at a time. The left thumb is moving while the right thumb presses. `UserInputService.TouchStarted` and `TouchEnded` give each touch its own InputObject.
- **Visibility:** buttons for unavailable actions hide (CAS: `UnbindAction`). Don't just dim them, except abilities on cooldown.

## Input layer

One `Input` module (client, Builder's area with Frame for visuals) owns:
- The **mode**: `"Touch" | "Gamepad" | "KeyboardMouse"`, from the last input type (Rule 4), with a `ModeChanged` signal the UI uses to swap prompts.
- **Actions:** `Input.bind(name, handler, { keys = {...}, gamepad = {...}, touch = "cas" | "custom" | nil })`.
- **Blocking:** `Input.setBlocked(name, true)` while menus or cutscenes are up. It unbinds CAS buttons and hides custom ones.
- **Prompts:** `Input.label(name)` returns "E", a gamepad glyph image or nothing, for UI chips.

Every handler fires one remote. The server validates cooldowns and state ([[13 Building It Right]]).

## Text on phones

| Text | dp | Renders on small phone (s 0.68) | Minimum rule |
|---|---|---|---|
| Micro (badge counts, hotkey chips) | 21 | 14 px | Absolute minimum for anything read |
| Caption (odds, stat lines, timers) | 22 | 15 px | |
| Body (descriptions, objective, toasts) | 24 | 16 px | Minimum for sentences |
| Button labels | 30 | 20 px | |
| Numbers (currency, timers) | 36 | 24 px | Changing numbers at 20 px or more |
| Titles | 44 | 30 px | |
| Display (reveals) | 64 | 43 px | |

Writing for phones:
- **Buttons:** 1–2 words plus an icon. **Toasts:** 32 characters or fewer. **Errors:** 8 words or fewer ([[05 UI and HUD]]).
- **No paragraphs in the first session.** Show, don't tell. Pointers and objectives carry the tutorial ([[01 The First Five Minutes]]).
- **Numbers over words:** "2x Coins" beats "Double your coin earnings".
- **Contrast:** white with an Ink stroke over the world. Body text on the dark Panel color needs no stroke.

## Windows and lists on phones

- **Compact design** (600×400 dp) for every window. One column. A left icon rail for tabs (72 dp icons). Grids of 3–4 columns. Footer actions fixed outside the scroll (Rules 24–25).
- **Detail views replace the list.** On phones, tapping an inventory item slides a detail card in from the right over the grid (Slide 0.22 s), with a back arrow at the top-left and the X still at the top-right.
- **Max height:** the card fits 92% of the safe height, so no part of a window is ever under the notch or off-screen.
- **Flexible rows:** tab rows and filter chips use list and flex layouts, so they share width or wrap onto a second line instead of clipping on narrow screens [24]. Panels drawn from images use 9-slice (`ScaleType = Slice`, `SliceScale`) so borders stay crisp at phone scale [25].
- **Close paths:** the X button and a tap on the dim. Never rely on any hardware or system button to close our windows. The X always works.
- **One window at a time** ([[05 UI and HUD]] Rule 11). On a phone, overlapping windows are unreadable.
- **Scrolling:** vertical only. Item cells are at least 96 dp, and cells have gaps of at least 8 dp, so a finger starting a scroll drag doesn't land on a tiny target and open it by mistake. Test scrolling a long grid with a finger-sized drag in the emulator.

## Typing on phones

When typing is unavoidable (codes, naming, search on tablets):
- The box goes in the top 40% of the screen (Rule 15). On a phone, the codes window places its box at the top of the card, not the bottom.
- `ClearTextOnFocus = false` so a stray tap doesn't wipe what was typed. `TextBox.FocusLost` with `enterPressed = true` submits, and a visible submit button is always present.
- Show the result above the keyboard line (under the box), not in a toast at the bottom.
- Trim and uppercase on the server ([[05 UI and HUD]] codes recipe). Phone keyboards add spaces and capitals automatically.
- `AutoLocalize = false` on code and name boxes.
- For names, offer preset suggestions and a "Random" button, and filter player-entered text with Roblox's text filtering before anyone else sees it ([[13 Building It Right]]).

## Performance budgets (targets)

Starting budgets for phones. Tune per game with the real-device test. These are studio targets, not Roblox limits.

| Budget | Phone target | Owner | How to check |
|---|---|---|---|
| Frame rate, busiest scene | ≥ 30 fps low-end, ≥ 55 fps mid-range | Everyone | Debug HUD on a real phone |
| Join to control | ≤ 10 s on mobile data | Builder, Frame | Owner's stopwatch |
| Parts in spawn view | ≤ ~5,000 | Scenic | Command-bar count |
| Unique textures in spawn view | ≤ ~60 | Scenic, Librarian | Asset audit |
| Texture size | 512 px props, 1024 px hero | Librarian | Import settings |
| Visible ParticleEmitters | ≤ 8, combined rate < 200/s | Librarian, Builder | Count during the biggest reward moment |
| Dynamic lights near the player | ≤ 4; shadows on ≤ 1 | Scenic | Map audit |
| Stacked transparent surfaces | ≤ 3 layers | Scenic, Librarian | Visual check |
| ViewportFrames on screen | ≤ 1 (phone), ≤ 2 (tablet) | Frame | UI audit |
| GuiObjects animating per frame | ≤ ~20 | Frame | Code review |
| Memory growth over 15 min | < 100 MB, then flat | Everyone | Developer Console Memory / `Stats` |
| Heartbeat connections | One per system | Builder | Code review |
| Remote traffic | Event-driven; no full-inventory sends per change | Builder | Network stats in Developer Console |

Measuring in Studio (useful, but not proof for phones):
- **MicroProfiler** (Studio's View menu, or the client shortcut) shows where a frame's time goes.
- **Developer Console** (F9): Memory (by category), Network, Scripts.
- **Studio's Rendering quality:** set a low Editor Quality Level in Studio Settings > Rendering to get closer to a phone's look (not its speed).
- **Command-bar part count:**
  `local n=0 for _,d in workspace:GetDescendants() do if d:IsA("BasePart") then n+=1 end end print(n)`

## Memory and leaks

The usual phone memory leaks, and their fixes:
- **UI created per event and never destroyed** (toasts, floats, popups). Pool them or `Destroy()` them after the fade ([[05 UI and HUD]] code does both).
- **Connections never disconnected** (screens opened 50 times, each adding a connection). Each screen keeps its connections and disconnects on close.
- **Sounds cloned per play.** Use `SoundService:PlayLocalSound` with a shared Sound, or a small pool.
- **Effects parented and forgotten.** `Debris:AddItem(effect, lifetime)` or a pool with `Emit()`.
- **Big tables of player history** on the client. Keep only what the UI shows.
- **Streamed-out models held by client references.** Don't keep references to map parts in client tables after they stream out. Re-find them on `CollectionService` added signals instead.

## Streaming

`Workspace.StreamingEnabled` makes the server send the client only the region near the player, plus whatever is marked persistent. For phones that means faster joins and lower memory on big maps. What changes for our code:
- **Client code can't assume a map part exists.** Use `WaitForChild(name, timeout)` and handle nil, or better, tag interactables (`CollectionService:AddTag(stand, "EggStand")` on the server at build time) and react to `GetInstanceAddedSignal`/`GetInstanceRemovedSignal` on the client.
- **Model streaming modes:** `Atomic` for models that must arrive whole (an egg stand with its prompt and display), `Persistent` only for a few things that must always exist on the client (the spawn's key UI anchors), `Default`/`Nonatomic` for scenery.
- **Teleports within the map:** the server calls `player:RequestStreamAroundAsync(targetPosition)` before moving the character, so the destination exists when the player lands.
- **Radii:** start from the Properties window defaults for `StreamingMinRadius` and `StreamingTargetRadius`, lower the target radius on very large maps, and check that distant landmarks the player navigates by are low-detail models that are always present, or are skybox and terrain features.
- **Server authority still applies.** Streaming changes what the client *has*, never what the server trusts.

## Quality scaling

```
quality = Reduced Effects setting on?  -> LOW
          else SavedQualityLevel 1-3    -> LOW
               SavedQualityLevel 4-7 or Automatic -> MEDIUM
               SavedQualityLevel 8-10   -> HIGH
```

| Feature | LOW | MEDIUM | HIGH |
|---|---|---|---|
| Particle rates and burst counts | ×0.4 | ×0.7 | ×1.0 |
| Menu BlurEffect | Off (dim only) | Size 10 | Size 14 |
| Reward sunburst rotation | Static | On | On |
| Ambient world emitters | Off | Half | All |
| Pet/follower count shown for other players | 0–1 each | 3 each | All |
| Screen shake | Off | Light | Normal |

Let players switch Reduced Effects on in Settings. It's also the quickest fix a player can apply on an old phone. Hide other players' pets in busy servers as a separate toggle, since pets are often the single biggest render cost in simulators.

## Short, interrupted sessions

Phone play happens in bursts. Design for them:
- **Autosave** on a timer (target 60–120 s), on leave, and on shutdown ([[13 Building It Right]]).
- **Welcome back:** on join, show what changed while away (offline earnings, grown crops, restocked shop) in one popup with one Claim button.
- **Check-in loops:** timers that finish while the player is away give a reason to return. Grow a Garden's short shop restock cycles [30][31] and Bee Swarm Simulator's hourly Brown Bear quests [36] are examples of loops that suit quick phone check-ins.
- **Resume the objective:** the objective pill shows the same goal as when they left.
- **No penalties for leaving** mid-activity (no lost bag contents, no failed quest).
- **Long goals in small steps:** milestone ladders (like the Sticker-Seeker machine's milestones up to the 1000th quest [37], or Pet Simulator 99's index rewards [38]) let a 3-minute session still move a long goal.

## Orientation

- **Landscape (default):** `StarterGui.ScreenOrientation = Enum.ScreenOrientation.LandscapeSensor` lets the player use either landscape side. `LandscapeLeft`/`LandscapeRight` lock one side (rarely needed).
- **Portrait:** `Enum.ScreenOrientation.Portrait` suits one-handed, menu-heavy games (idle, clicker, card or tycoon-management). The thumbstick, jump and camera space shrink, so design the HUD as its own layout (bottom tab bar, top currency row, bottom-sheet windows) and test it in portrait presets.
- **Free rotation:** `Sensor` only if both layouts are fully designed and tested. Re-layout on `ViewportSize` changes, and read `PlayerGui.CurrentScreenOrientation` to choose the layout.
- **Per player:** `PlayerGui.ScreenOrientation` can be changed from the client for a mode that needs it (a portrait minigame in a landscape game). Change it back afterwards.

## Testing matrix

| Check | Emulator: small phone | Emulator: large phone (both sides) | Emulator: tablet | Real low-end phone | PC | Gamepad |
|---|---|---|---|---|---|---|
| HUD clear of keep-outs | ✓ | ✓ | ✓ | ✓ | | |
| All targets ≥ 44 px | ✓ | ✓ | | ✓ | | |
| All text readable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (from couch distance) |
| Every action reachable | ✓ touch only | ✓ | ✓ | ✓ | ✓ keyboard/mouse | ✓ |
| Windows fit, close paths work | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ B closes |
| FPS ≥ target | — | — | — | ✓ | | |
| Memory flat over 15 min | — | — | — | ✓ | ✓ (Studio check) | |
| Join time ≤ 10 s | — | — | — | ✓ | | |
| Orientation correct | ✓ | ✓ both | ✓ | ✓ | | |

"—" means the emulator can't measure this (Rule 41).

## Examples from top games

### Auto mode where the thumb already is
**Game:** Sol's RNG ([28], [29])
**Shows:** Auto Roll sits right under the Roll button and keeps rolling until switched off. Guides say it's unlocked free by joining the developer's Roblox group, with an auto-rejoin every 20 minutes while it's on [28]. Sportskeeda describes switching it on and going AFK [29].
**Why it works:** on a phone the most repeated action costs the most effort, and players love to "play" with the phone resting on a table. A toggle next to the button is found without any tutorial.
**Steal:** an Auto chip directly under the primary action in the action arc (Rule 16), with an obvious ON state (Go face, "AUTO ON").
**Avoid:** auto modes hidden in menus, and auto modes that break on phones going to sleep. Resume them cleanly on rejoin.

### Fast results for repeat actions
**Game:** Sol's RNG ([28])
**Shows:** Quick Roll is a paid pass that strips the opening animation so each roll resolves almost instantly. Settings like cutscene skip and auto-equip are keyed to rarity [28].
**Why it works:** a phone session is short. Long reveals on every common result eat it, while rarity thresholds keep the drama for rare rolls.
**Steal:** tiered reveals and a "skip reveals below [rarity]" setting ([[05 UI and HUD]] Rule 22).
**Avoid:** making the free experience deliberately slow to sell the skip.

### Short timers that make check-ins worth it
**Game:** Grow a Garden ([30], [31])
**Shows:** guides describe a seed shop restocking every five minutes in the original game, with sold-out items marked by a grey "NO STOCK" button [30]. Trackers for the sequel describe separate cadences for different shops, with live countdowns [31].
**Why it works:** short, visible timers suit phone check-ins. Open the app, check the shop, plant, leave.
**Steal:** server-timed restocks with a visible countdown on the button, plus a welcome-back summary of what restocked while away.
**Avoid:** timers that only matter if the player stays online for hours, or fake timers ([[05 UI and HUD]] Rule 60).

### A clear sold-out state at thumb size
**Game:** Grow a Garden ([30])
**Shows:** a sold-out seed's purchase button is grey and labelled "NO STOCK" [30].
**Why it works:** on a small screen the button is the only place the eye goes. Putting the reason on it saves a separate message.
**Steal:** the six-state buy button from [[05 UI and HUD]], with the restock time as a caption under the button.
**Avoid:** a separate tiny "sold out" tag in the corner of the card.

### One tap per round for the social mechanic
**Game:** Dress to Impress ([32], [33])
**Shows:** after a timed dressing phase, players walk the runway and the lobby rates each outfit from one to five stars, and the top three go to a podium [33]. Stars accumulate into named ranks [32].
**Why it works:** the core social action is a single tap that any player on any device can do in a second.
**Steal:** big star buttons (64 dp each, 12 dp gaps) in a bottom-center row clear of the thumbstick and jump, with one choice per round.
**Avoid:** rating UIs with small targets, or ones that need typing.

### Quick replies instead of typing
**Game:** Adopt Me! ([34], [35])
**Shows:** guides describe the trade window gaining Quick Chat replies, typing indicators, spectating and verification icons [34]. A Trading Hub lets players post listings and receive offers through an open Offer slot [35].
**Why it works:** negotiating by typing on a phone is slow and awkward. Quick replies and async listings let phone players trade comfortably.
**Steal:** quick-reply chips in any social screen, and asynchronous systems (listings, gifts) that don't need both players typing at once.
**Avoid:** free-text-only trade chat.

### Quests that reset on an hourly rhythm
**Game:** Bee Swarm Simulator ([36])
**Shows:** Brown Bear offers repeatable quests, and a new one becomes available an hour after the last one was started. Each always rewards a ticket, royal jelly and honey that scales with difficulty [36].
**Why it works:** an hourly cadence fits phone check-ins: start a quest, do a little, come back later.
**Steal:** repeatable quest givers with a visible "next quest in 42:10" timer and the reward shown up front.
**Avoid:** quests that need one long sitting to finish.

### Milestones that make short sessions count
**Game:** Bee Swarm Simulator ([37])
**Shows:** the Sticker-Seeker Quest Machine gives endless quests, with extra rewards at milestones up to the 1000th quest [37].
**Why it works:** a long-term goal broken into milestones means a 3-minute phone session still advances something visible.
**Steal:** milestone ladders on endless systems, with progress shown on the HUD tile badge when a milestone is claimable.
**Avoid:** milestones so far apart that a session never reaches one.

### The book pays out in small steps
**Game:** Pet Simulator 99 ([38])
**Shows:** the Index menu has a Reward option at its bottom where index coins (one per newly indexed pet) buy items [38].
**Why it works:** each new pet is a tiny, immediate payout, which suits short sessions.
**Steal:** the index recipe from [[05 UI and HUD]], with its reward shop reachable in two taps on phones.
**Avoid:** an index whose rewards come only at 100%.

### Egg info that fits the screen
**Game:** Pet Simulator 99 ([39])
**Shows:** a community database lists each egg's world, unlock area, cost, possible pets and chase pet [39].
**Why it works:** that's exactly the information a player needs to decide, and it fits a compact card.
**Steal:** a phone egg card with a 3-column pool grid, percentages in Caption 22 dp (15 px), the chase pet last with a glow, and cost and Open buttons in a fixed footer.
**Avoid:** odds lists that need scrolling sideways or zooming. For paid random items they must be shown before purchase [26].

### Passes that say exactly what they stack with
**Game:** Pet Simulator 99 ([40])
**Shows:** the wiki lists egg-luck gamepasses whose boosts stack [40].
**Why it works:** on a phone, pass cards get one line of benefit text. "+200% luck, stacks" fits, while a paragraph doesn't.
**Steal:** 2-column pass cards on phones with 1-line names and 1-line benefits.
**Avoid:** pass descriptions that wrap to four lines at phone size.

### Tiny code buttons are hard to find on phones
**Game:** Blox Fruits ([41], [42])
**Shows:** code guides describe its code entry as a small bird icon on the left side of the screen, and other guides describe a route through a gear-icon menu [41][42].
**Why it works (or doesn't):** codes are a big community driver, but a small, ambiguous entry point is hard to find and hard to hit on a phone.
**Steal:** a clearly labelled Codes row in Settings, plus a temporary HUD tile at 80 dp during code campaigns, with the text box in the top half of the window.
**Avoid:** icon-only entry points below 44 px.

### Big readable timers and progress in the world
**Game:** Grow a Garden ([30])
**Shows:** stock and timing are core to play (five-minute shop refreshes in the original game) [30].
**Why it works:** timed systems need a readable countdown wherever the player looks, on the HUD and in the world.
**Steal:** world `BillboardGui` timers sized for phones (Number text at 36 dp equivalent, Ink stroke, `MaxDistance` set so they don't clutter far away), and HUD chips for the nearest timer.
**Avoid:** world labels with tiny text that only reads at 1080p.

## By genre

**Simulator.** Phones carry these games, so everything in this chapter applies at full strength. The click or collect action is the primary button in the arc with an Auto chip (Rule 16). Hide other players' pets in busy servers (Quality scaling), and keep egg-hatch effects inside the particle budget on LOW. Watch memory across long AFK sessions, since simulators are often left running.

**Tycoon.** Purchases are world buttons, so their `BillboardGui` labels must read at phone size from 15–20 studs. Walk-over pads work on touch with no button needed. Large tycoons need streaming, with each plot an `Atomic` model. Keep the cash counter and a "next purchase" beam, and avoid full-screen menus.

**Obby.** Jump precision is everything. Never place UI near the jump button, keep the camera clear, and consider a Settings option for a larger jump button only if Roblox's controls allow it (don't hack `TouchGui`). Checkpoint saves must be instant because phone sessions end abruptly. Moving parts use one loop per system (Rule 36) for steady FPS.

**Roleplay / life sim.** Lots of menus (jobs, houses, vehicles, outfits) means Compact layouts are critical, typing should be replaced by presets and quick-chat, and avatar-heavy servers are the biggest phone render cost, so offer a reduced-detail mode for distant players where the design allows. Vehicles need a phone control layout (throttle and brake on the right, steering on the left).

**Action / combat.** At most 3 abilities on phones (Rule 17). Generous auto-aim or target assist for touch, cooldown sweeps that read at a glance, and hit feedback (flash, number, sound) that survives the effects budget. Combat camera must not fight the thumbstick. Test with two thumbs moving and attacking at once (multi-touch).

**Battlegrounds.** Skill buttons are the HUD. Four skills plus an ultimate meter means an arc of 72 dp buttons around jump at 8 dp gaps. Test thumb travel between skills on the smallest phone. Effects on ultimates are the frame-rate risk, so budget them on LOW. Character select must work with taps and show big portraits.

**Survival.** Vital bars at the top-left on phones (not the bottom-left, which is the thumbstick). Inventory and crafting in Compact windows with "have/need" counts. Night scenes need UI contrast checks. Streaming is usually required for open maps, and resources respawning near the player must be streaming-safe.

**Horror.** Darkness plus phone screens outdoors is unreadable, so keep a minimum ambient light and a Brightness setting. Audio cues need visual twins (Rule 39), since many phones play muted. Keep flashing and shake within accessibility limits. Flashlight beams (SpotLights with shadows) are expensive: one light with shadows at most.

**Tower defense.** Tower placement by tap on a valid spot, with a preview and confirm button. Never drag-only (Rule 13). The tower hotbar is a bottom strip clear of the keep-outs, or the game disables the default jump and movement when in a build view. Late waves with many enemies stress phones, so pool enemies, give one loop per system, and cap particles per kill.

**RNG / collection.** The roll button with Auto chip, quick reveals on low rarities, and storage plus equip within two taps. Big reveal moments must hold FPS on LOW. Odds tables must be readable at phone size for paid rolls (Rule 42). Long AFK sessions make memory leaks the top risk.

**Shooter.** Touch shooters need a fire button in the arc, an aim button, and optional auto-fire when the crosshair is on a target. Keep the right half clear for aiming drag. Phones need a lighter map and fewer dynamic lights. Hitscan feedback must be visible without sound.

**Racing.** Throttle and brake buttons on the right (96 dp), steering on the left (thumbstick or two arrow buttons), and menu tiles moved to the top. Speed effects (motion blur, particles) scale with quality. Streaming must keep up with fast travel, so preload the track (Atomic segments along the route) rather than relying on radius alone.

**Sports.** Big pass and shoot buttons, a clear indicator for possession, and stamina near the action button. Ball physics should be server-owned or carefully tuned for latency on mobile networks. Score and timers sit at the top-center. Keep to 3 actions on phones.

**Party / social.** Minigames must each be phone-first, with one or two buttons and instructions as icons. Voting and reactions are big tap targets. Lobbies with many avatars and emotes are the render-cost hotspot. Short rounds suit phone sessions well.

**Story / puzzle.** Dialogue boxes at the top-center on phones (clear of the thumbstick), tap to advance, and choices as big buttons. Puzzles need tap interactions (no precise drag). Hint timers help players who are stuck on a small screen. Chapters should checkpoint often, because sessions end abruptly.

**Farming / fishing.** Tap-to-plant and tap-to-harvest per plot with large hit areas, or walk-over harvesting. Timers in the world (BillboardGui) sized for phones. Fishing minigames use one big hold button (96 dp+) and a clear moving target bar. Offline growth plus a welcome-back summary suits phone check-ins (Rule 38).

## Luau

### Input mode (touch, gamepad, keyboard/mouse)

```lua
--!strict
-- StarterPlayerScripts.Input (ModuleScript): current input mode + action bindings
local ContextActionService = game:GetService("ContextActionService")
local UserInputService = game:GetService("UserInputService")

export type Mode = "Touch" | "Gamepad" | "KeyboardMouse"
local Input = {}
local modeChanged = Instance.new("BindableEvent")
Input.ModeChanged = modeChanged.Event

local function classify(t: Enum.UserInputType): Mode?
	if t == Enum.UserInputType.Touch then return "Touch" end
	if t.Name:sub(1, 7) == "Gamepad" then return "Gamepad" end
	if t == Enum.UserInputType.Keyboard or t == Enum.UserInputType.MouseMovement
		or t == Enum.UserInputType.MouseButton1 or t == Enum.UserInputType.MouseButton2
		or t == Enum.UserInputType.MouseWheel then
		return "KeyboardMouse"
	end
	return nil -- gyro, accelerometer, focus etc. don't change the mode
end

local initial: Mode = if UserInputService.TouchEnabled then "Touch" else "KeyboardMouse"
Input.mode = classify(UserInputService:GetLastInputType()) or initial

UserInputService.LastInputTypeChanged:Connect(function(t)
	local m = classify(t)
	if m and m ~= Input.mode then
		Input.mode = m
		modeChanged:Fire(m)
	end
end)

-- Actions: one handler, many bindings (Rule 3)
export type Binding = { keys: { Enum.KeyCode }, touch: boolean, title: string?, image: string? }
type Action = { handler: () -> (), binding: Binding }
local actions: { [string]: Action } = {}
local blocked: { [string]: boolean } = {}

local function bindCas(name: string)
	local a = actions[name]
	ContextActionService:BindAction(name, function(_, state: Enum.UserInputState)
		if state == Enum.UserInputState.Begin then
			a.handler()
		end
		return Enum.ContextActionResult.Sink
	end, a.binding.touch, table.unpack(a.binding.keys))
	if a.binding.touch then
		if a.binding.title then ContextActionService:SetTitle(name, a.binding.title) end
		if a.binding.image then ContextActionService:SetImage(name, a.binding.image) end
	end
end

function Input.bind(name: string, handler: () -> (), binding: Binding)
	actions[name] = { handler = handler, binding = binding }
	if not blocked[name] then bindCas(name) end
end

-- Unbinding hides the CAS touch button: use while menus, cutscenes or death screens are up (Rule 18).
function Input.setBlocked(name: string, isBlocked: boolean)
	blocked[name] = isBlocked
	if isBlocked then
		ContextActionService:UnbindAction(name)
	elseif actions[name] then
		bindCas(name)
	end
end

-- Custom on-screen buttons call this, so they share the exact same handler.
function Input.fire(name: string)
	local a = actions[name]
	if a and not blocked[name] then a.handler() end
end

return Input
```

Usage (Builder):

```lua
--!strict
local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Input = require(script.Parent:WaitForChild("Input"))
local UseAbility = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("UseAbility") :: RemoteEvent

Input.bind("Dash", function()
	UseAbility:FireServer("Dash") -- the server checks the cooldown
end, { keys = { Enum.KeyCode.E, Enum.KeyCode.ButtonX }, touch = true, title = "DASH" })
-- Position is relative to Roblox's context-button frame next to jump; nudge and check in the emulator.
ContextActionService:SetPosition("Dash", UDim2.new(1, -70, 0, 10))
```

### Custom action button (our own arc)

```lua
--!strict
-- Frame: UI/ActionArc excerpt. Each button sits in a holder tagged AutoScale (never tag the button itself).
local CollectionService = game:GetService("CollectionService")
local Theme = require(script.Parent.Theme)
local Button = require(script.Parent.Button)
local Input = require(game:GetService("Players").LocalPlayer.PlayerScripts:WaitForChild("Input"))

local function actionButton(name: string, label: string, sizeDp: number, pos: UDim2, hud: ScreenGui): ImageButton
	local holder = Instance.new("Frame")
	holder.Name = name .. "Holder"
	holder.AnchorPoint = Vector2.new(1, 1)
	holder.Position = pos -- px margins from the safe bottom-right, e.g. UDim2.new(1, -170, 1, -24)
	holder.Size = UDim2.fromOffset(sizeDp, sizeDp)
	holder.BackgroundTransparency = 1

	local b = Instance.new("ImageButton")
	b.Name = name
	b.AnchorPoint = Vector2.new(0.5, 0.5)
	b.Position = UDim2.fromScale(0.5, 0.5)
	b.Size = UDim2.fromScale(1, 1)
	b.BackgroundColor3 = Theme.Color.Go
	b.AutoButtonColor = false
	local corner = Instance.new("UICorner")
	corner.CornerRadius = Theme.Radius.Pill
	corner.Parent = b
	local stroke = Instance.new("UIStroke")
	stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
	stroke.Thickness = Theme.Stroke.Border
	stroke.Color = Theme.Color.GoEdge
	stroke.Parent = b

	local text = Instance.new("TextLabel")
	text.BackgroundTransparency = 1
	text.Size = UDim2.fromScale(1, 1)
	text.FontFace = Theme.Font.Button
	text.TextSize = Theme.Text.Button
	text.TextColor3 = Theme.Color.Text
	text.Text = label
	local textStroke = Instance.new("UIStroke")
	textStroke.Thickness = Theme.Stroke.TextSmall
	textStroke.Color = Theme.Color.Ink
	textStroke.Parent = text
	text.Parent = b

	b.Parent = holder
	CollectionService:AddTag(holder, "AutoScale")
	holder.Parent = hud
	Button.bind(b, function()
		Input.fire(name)
	end)
	return b
end

return actionButton
```

### Debug HUD for device tests (testing builds only)

```lua
--!strict
-- StarterPlayerScripts.DebugHud (LocalScript). Enabled only when ReplicatedStorage has attribute TestingBuild = true.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Stats = game:GetService("Stats")

if ReplicatedStorage:GetAttribute("TestingBuild") ~= true then
	return
end
local player = Players.LocalPlayer

local gui = Instance.new("ScreenGui")
gui.Name = "DebugHud"
gui.ResetOnSpawn = false
gui.DisplayOrder = 200
local label = Instance.new("TextLabel")
label.AnchorPoint = Vector2.new(0, 1)
label.Position = UDim2.new(0, 8, 1, -8)
label.Size = UDim2.fromOffset(230, 64)
label.BackgroundColor3 = Color3.new(0, 0, 0)
label.BackgroundTransparency = 0.35
label.TextColor3 = Color3.new(1, 1, 1)
label.TextXAlignment = Enum.TextXAlignment.Left
label.TextYAlignment = Enum.TextYAlignment.Top
label.FontFace = Font.fromEnum(Enum.Font.RobotoMono)
label.TextSize = 16
label.Active = false
label.Parent = gui
gui.Parent = player:WaitForChild("PlayerGui")

local frames, elapsed, worst = 0, 0, 0
RunService.Heartbeat:Connect(function(dt)
	frames += 1
	elapsed += dt
	worst = math.max(worst, dt)
	if elapsed >= 1 then
		label.Text = string.format(
			"FPS %d (worst %d ms)\nMem %d MB\nPing %d ms",
			math.floor(frames / elapsed),
			math.floor(worst * 1000),
			math.floor(Stats:GetTotalMemoryUsageMb()),
			math.floor(player:GetNetworkPing() * 1000)
		)
		frames, elapsed, worst = 0, 0, 0
	end
end)
```

### Quality tier

```lua
--!strict
-- StarterPlayerScripts.UI.Quality (ModuleScript)
local GameSettings = UserSettings():GetService("UserGameSettings")

export type Tier = "Low" | "Medium" | "High"
local Quality = { reducedEffects = false }
local changed = Instance.new("BindableEvent")
Quality.Changed = changed.Event

function Quality.tier(): Tier
	if Quality.reducedEffects then return "Low" end
	local level = GameSettings.SavedQualityLevel
	if level == Enum.SavedQualitySetting.Automatic then
		return "Medium" -- the engine picks; assume the middle
	end
	local n = level.Value -- QualityLevel1..QualityLevel10
	if n <= 3 then
		return "Low"
	elseif n <= 7 then
		return "Medium"
	end
	return "High"
end

function Quality.particleScale(): number
	local t = Quality.tier()
	return if t == "Low" then 0.4 elseif t == "Medium" then 0.7 else 1
end

function Quality.setReducedEffects(on: boolean)
	Quality.reducedEffects = on
	changed:Fire(Quality.tier())
end

GameSettings:GetPropertyChangedSignal("SavedQualityLevel"):Connect(function()
	changed:Fire(Quality.tier())
end)

return Quality
-- burst: emitter:Emit(math.max(1, math.floor(40 * Quality.particleScale())))
```

### Streaming-safe interactables (client)

```lua
--!strict
-- React to tagged stands as they stream in and out. Stands are Models with ModelStreamingMode = Atomic.
local CollectionService = game:GetService("CollectionService")
local live: { [Instance]: RBXScriptConnection } = {}

local function onAdded(stand: Instance)
	local prompt = stand:FindFirstChildWhichIsA("ProximityPrompt", true)
	if not prompt or live[stand] then return end
	live[stand] = prompt.Triggered:Connect(function()
		-- open the egg card UI; the server's own Triggered handler does the real work
	end)
end

local function onRemoved(stand: Instance)
	local c = live[stand]
	if c then
		c:Disconnect()
		live[stand] = nil
	end
end

for _, stand in CollectionService:GetTagged("EggStand") do
	task.spawn(onAdded, stand)
end
CollectionService:GetInstanceAddedSignal("EggStand"):Connect(onAdded)
CollectionService:GetInstanceRemovedSignal("EggStand"):Connect(onRemoved)
```

### Teleport with streaming (server)

```lua
--!strict
-- Builder: ServerScriptService. Make sure the destination is streamed in before moving the character.
local function teleport(player: Player, target: CFrame)
	pcall(player.RequestStreamAroundAsync, player, target.Position, 5) -- 5 s timeout
	local character = player.Character
	if character and character:FindFirstChild("HumanoidRootPart") then
		character:PivotTo(target)
	end
end
```

### Orientation-aware HUD (portrait-designed games only)

```lua
--!strict
local Players = game:GetService("Players")
local playerGui = Players.LocalPlayer:WaitForChild("PlayerGui") :: PlayerGui
local hud = playerGui:WaitForChild("HUD") :: ScreenGui
local landscape = hud:WaitForChild("Landscape") :: Frame
local portrait = hud:WaitForChild("Portrait") :: Frame

local function applyLayout()
	local vp = workspace.CurrentCamera.ViewportSize
	local isPortrait = vp.Y > vp.X
	landscape.Visible = not isPortrait
	portrait.Visible = isPortrait
end

workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(applyLayout)
playerGui:GetPropertyChangedSignal("CurrentScreenOrientation"):Connect(applyLayout)
applyLayout()
```

### Map audits (Studio command bar, edit mode)

```lua
-- Scenic: make decoration cheap (Rule 31)
for _, d in workspace.Map.Decor:GetDescendants() do
	if d:IsA("BasePart") then
		d.Anchored = true
		d.CanCollide = false
		d.CanTouch = false
		d.CanQuery = false
		if d.Size.Magnitude < 8 then d.CastShadow = false end
		if d:IsA("MeshPart") then d.CollisionFidelity = Enum.CollisionFidelity.Box end
	end
end
```

```lua
-- Spawn-view audit against the budgets (Rule 30, Rule 33)
local spawn = workspace:FindFirstChildWhichIsA("SpawnLocation", true)
local center = if spawn then spawn.Position else Vector3.zero
local parts, emitters, lights = 0, 0, 0
local textures = {}
for _, d in workspace:GetDescendants() do
	if d:IsA("BasePart") then
		if (d.Position - center).Magnitude < 200 then
			parts += 1
			if d:IsA("MeshPart") and d.TextureID ~= "" then textures[d.TextureID] = true end
		end
	elseif d:IsA("Decal") then
		textures[d.Texture] = true
	elseif d:IsA("ParticleEmitter") and d.Enabled then
		emitters += 1
	elseif d:IsA("Light") and d.Enabled then
		lights += 1
	end
end
local unique = 0
for _ in textures do unique += 1 end
print(string.format("Spawn view: %d parts, ~%d unique textures | map: %d emitters on, %d lights on", parts, unique, emitters, lights))
```

### Original snippet kept: a scale-sized button with a tap minimum

For games built with Scale sizing rather than our UIScale clusters, the minimum-size constraint still guarantees the tap target:

```lua
-- Inside a HUD controller (LocalScript side). Set properties first, Parent last.
local button = Instance.new("TextButton")
button.Name = "SellButton"
button.AnchorPoint = Vector2.new(1, 1)
button.Position = UDim2.new(1, -190, 1, -110) -- above-left of jump; verify in the emulator
button.Size = UDim2.fromScale(0.12, 0.12)
button.Text = "SELL"
button.TextScaled = true

local minSize = Instance.new("UISizeConstraint")
minSize.MinSize = Vector2.new(64, 64)
minSize.Parent = button

local textSize = Instance.new("UITextSizeConstraint")
textSize.MinTextSize = 14
textSize.MaxTextSize = 36
textSize.Parent = button

local square = Instance.new("UIAspectRatioConstraint")
square.Parent = button

button.Activated:Connect(onSellPressed)
button.Parent = hudFrame
```

## Checklist

- [ ] `StarterGui.ScreenOrientation` set deliberately and recorded in `decisions.md`, and both landscape sides tested.
- [ ] Device Emulator: smallest phone, large phone and tablet all show a usable HUD with nothing in the thumbstick, jump or center keep-outs (DevOverlay on).
- [ ] Every tappable element ≥ 44 px on the smallest phone preset, with ≥ 8 px gaps, and hit areas larger than the art.
- [ ] Interactive ScreenGuis use `CoreUISafeInsets`, and no code hard-codes the inset.
- [ ] The full first session played touch-only in the emulator with no keyboard needed and no Output errors.
- [ ] No hover-only information and no drag-only interactions.
- [ ] No typing required in the first session, and every TextBox sits in the top half of the screen.
- [ ] ≤ 3 always-visible action buttons on phones, and an Auto option next to any heavily repeated action.
- [ ] CAS actions unbind (or custom buttons hide) during menus, cutscenes and death.
- [ ] ProximityPrompts on all world interactions, with a hold on destructive ones and no stacked prompts.
- [ ] All text ≥ 14 px on the smallest phone, readable over the brightest and darkest scenes.
- [ ] Windows use Compact layouts on phones and fit the safe area, with footer actions outside the scroll.
- [ ] The spawn view is within budget (parts, unique textures, emitters, lights) per the audit script.
- [ ] Decor is anchored with collisions, touch and queries off, and small props cast no shadow.
- [ ] StreamingEnabled is on for large maps, and client map access is streaming-safe (tags or WaitForChild with timeout).
- [ ] Reduced Effects setting exists and halves particles, removes blur and shake.
- [ ] Memory is flat (≤ 100 MB growth) over a 15-minute session in the Developer Console.
- [ ] Join to control ≤ 10 s on the owner's phone, and the loading screen has Skip at 5 s and a 15 s cap.
- [ ] Autosave on a timer plus on leave and shutdown, and the welcome-back popup shows progress made while away.
- [ ] The game is fully playable muted (every sound cue has a visual).
- [ ] Owner's real low-end phone test done: model, FPS per scene, screenshot of the worst moment in the gate report.

## Common mistakes

- **Designing at 1920×1080 on PC** and discovering on a phone that everything is tiny and overlapping.
- **Putting a shop or inventory button in the bottom-left,** where the thumbstick lives.
- **A custom button on or touching the jump button.**
- **A big panel on the right half** that blocks camera drag.
- **Hover tooltips** to explain items, so touch players never see the explanation.
- **Drag-only inventories** on a 6-inch screen.
- **Requiring typing** (names, search, codes) in the first session.
- **Text boxes at the bottom of the screen,** hidden by the keyboard.
- **Treating the Device Emulator as a performance test.** It isn't one.
- **"Runs well on mobile"** written from Studio alone.
- **`TextScaled` everywhere,** which gives inconsistent sizes and unreadable long text.
- **Moving or restyling Roblox's `TouchGui` by name,** which breaks when Roblox updates it.
- **Adding a fourth, fifth and sixth action button** instead of simplifying the loop.
- **Thousands of tiny parts and dozens of always-on emitters** at spawn.
- **No streaming on a big map,** so the join takes 30 s and memory runs out.
- **Client code indexing streamed parts directly,** which errors when they haven't arrived.
- **A per-object script or loop** for every coin, pet or enemy.
- **Leaking UI, sounds and connections** over long AFK sessions until the app crashes.
- **Audio-only warnings** in a game most phone players hear muted.
- **Free rotation** (`Sensor`) on a game designed only for landscape.

## References

[1] Adaptive design — https://create.roblox.com/docs/en-us/production/publishing/adaptive-design.md — input fluidity across touch, gamepad, keyboard and VR; adapt layout and hints to input
[2] ScreenInsets enum — https://create.roblox.com/docs/reference/engine/enums/ScreenInsets.md — CoreUISafeInsets for buttons and status; DeviceSafeInsets for notches only
[3] On-screen containers — https://create.roblox.com/docs/en-us/ui/on-screen-containers.md — TopbarSafeInsets and None (non-interactive content only)
[4] ScreenGui class — https://create.roblox.com/docs/en-us/reference/engine/classes/ScreenGui.md — ScreenInsets default; IgnoreGuiInset switches to DeviceSafeInsets
[5] ScreenGui (API reference) — https://developer.roblox.com/api-reference/class/ScreenGui — ClipToDeviceSafeArea behaviour
[6] GuiService:GetGuiInset — https://create.roblox.com/docs/reference/engine/classes/GuiService/GetGuiInset — read the inset at runtime
[7] GuiService class — https://create.roblox.com/docs/reference/engine/classes/GuiService — SelectedObject and gamepad navigation settings
[8] New Gamepad UI Selection APIs — https://devforum.roblox.com/t/new-gamepad-ui-selection-apis/1791278 — GuiService:Select and SelectionOrder for controller players
[9] Accessibility guidelines — https://create.roblox.com/docs/en-us/production/publishing/accessibility — PreferredTextSize and UITextSizeConstraint limits; reduced motion; transparency
[10] Roblox UI design best practices, German edition (creation.dev) — https://www.creation.dev/de/blog/roblox-ui-design-best-practices — 44×44 px mobile buttons, no hover-only info, ScreenInsets
[11] Roblox UI design best practices (creation.dev) — https://www.creation.dev/blog/roblox-ui-design-best-practices — HUD shows only what players need right now
[12] User interface overview — https://create.roblox.com/docs/en-us/ui — UI containers run on the client; UI drag detectors
[13] CanvasGroup class — https://create.roblox.com/docs/reference/engine/classes/CanvasGroup — texture memory, quality-level cap, blank rendering when over budget
[14] What is CanvasGroup? — https://devforum.roblox.com/t/1797885 — one texture per group at its absolute size; down-res under memory pressure
[15] CanvasGroup not being rendered in mobile devices — https://devforum.roblox.com/t/canvasgroup-not-being-rendered-in-mobile-devices/4040119 — reported mobile rendering failures
[16] GUI Optimization tips? — https://devforum.roblox.com/t/gui-optimization-tips/3986563 — community view on CanvasGroup memory cost
[17] Post-processing effects — https://create.roblox.com/docs/en-us/environment/post-processing-effects — BlurEffect; Camera-parented effects are per player
[18] Blurred UIs using Depth of Field Effect — https://devforum.roblox.com/t/blurred-uis-using-depth-of-field-effect/4734313 — DoF blur is expensive and graphics-level dependent
[19] Objectual UI Blur — https://devforum.roblox.com/t/objectual-ui-blur/3626057 — community blur module and its limits
[20] Loading screens — https://create.roblox.com/docs/en-us/players/loading-screens — ReplicatedFirst pattern, RemoveDefaultLoadingScreen, game.Loaded
[21] How do I make a loading screen? — https://devforum.roblox.com/t/how-do-i-make-a-loading-screen/2068326 — ContentProvider preloading yields until loaded
[22] Font datatype — https://create.roblox.com/docs/reference/engine/datatypes/Font.md — Builder Sans family path and weights
[23] UI appearance modifiers — https://create.roblox.com/docs/en-us/ui/appearance-modifiers — UIStroke outlines text by default
[24] List and flex layouts — https://create.roblox.com/docs/en-us/ui/list-flex-layouts — flexible rows that adapt to screen width
[25] ImageLabel class — https://create.roblox.com/docs/reference/engine/classes/ImageLabel.md — 9-slice and SliceScale for crisp panels at any size
[26] Paid random items policy — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items — all outcomes and odds totaling 100% shown before purchase
[27] MarketplaceService class — https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md — purchase prompts and receipts
[28] Sol's RNG: how to get Auto Roll and Quick Roll (Allthings) — https://allthings.how/sol-s-rng-how-to-get-auto-roll-and-quick-roll-in-roblox/ — Auto Roll under the Roll button; Quick Roll pass; rarity-based settings
[29] Sol's RNG guide, features and FAQs (Sportskeeda) — https://sportskeeda.com/roblox-news/sol-s-rng-guide-features-faqs — Auto Roll for AFK play
[30] Grow a Garden seed and gear shop stock explained (Deltia's Gaming) — https://deltiasgaming.com/?p=207402 — five-minute restocks; grey "NO STOCK" button
[31] Grow a Garden 2 stock predictor (Allthings) — https://allthings.how/grow-a-garden-2-stock-predictor-how-restock-timing-works/ — per-shop restock cadences, live timers
[32] How to rank up in Dress to Impress (esports.gg) — https://esports.gg/news/gaming/how-to-rank-up-in-dress-to-impress-dti/ — star totals and named ranks
[33] How to play Dress to Impress (SteelSeries) — https://steelseries.com/blog/how-to-play-dress-to-impress — runway star voting and podium
[34] Adopt Me trading guide (Allthings) — https://allthings.how/?p=89328 — trade window Quick Chat, typing indicators, spectate, verification
[35] Adopt Me Trading Hub (Allthings) — https://allthings.how/adopt-me-trading-hub-how-to-get-offers-on-your-listings/ — asynchronous listings with an open Offer slot
[36] Brown Bear (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Brown_Bear — repeatable quests with a one-hour cadence
[37] Sticker-Seeker Quest Machine (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Sticker-Seeker_Quest_Machine — endless quests with milestones to the 1000th
[38] Pet Simulator 99: how to collect Index Coins (Prodigy Gamers) — https://prodigygamers.com/2024/01/22/pet-simulator-99-how-to-collect-index-coins/ — index reward shop paid per indexed pet
[39] Pet Simulator 99 eggs (Bloxodes) — https://bloxodes.com/wiki/pet-simulator-99/eggs — egg pool, cost, unlock area and chase pet
[40] Gamepasses (Pet Simulator 99) — https://pet-simulator.fandom.com/wiki/Gamepasses_(Pet_Simulator_99) — egg-luck passes that stack
[41] Blox Fruits codes (VideoGamer) — https://videogamer.com/guides/blox-fruits-codes — small code icon on the left of the screen
[42] Blox Fruits codes (ExitLag) — https://www.exitlag.com/blog/blox-fruits-codes/ — redeem steps; differing menu routes
[43] Automatic translation — https://create.roblox.com/docs/production/localization/automatic-translations — automatic text capture fills translations into UI text
[44] TweenInfo datatype — https://create.roblox.com/docs/en-us/reference/engine/datatypes/TweenInfo.md — tween timing parameters (used for cheap, short UI motion)
[45] UICorner [Live] thread — https://devforum.roblox.com/t/uicorner-live/632666/427 — UIScale and Offset corner radius report (check when scaling for phones)
[46] ReplicatedFirst reference (vi-vn) — https://create.roblox.com/docs/vi-vn/reference/engine/classes/ReplicatedFirst — default loading screen removal timing

Related: [[00 Start Here]] · [[00 For Any AI]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]]
