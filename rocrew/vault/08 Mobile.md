---
tags: [vault, mobile]
read_by: [lead, architect, frame, builder, scenic, librarian, playtest, kid-tester, reviewer]
---

# 08 Mobile

Most Roblox players are on phones and tablets, and many of those devices are older, smaller and slower than the machine Studio runs on. A game that is cramped, unreadable or laggy on a phone fails for most of its audience, however good it looks in Studio. Design every screen for a small touch screen first, then let PC and console inherit it. Pair this page with [[05 UI and HUD]] and [[01 The First Five Minutes]].

## Mobile-first rules
- Lay out the HUD at small-phone size in landscape first, then check that it scales up. Never design at desktop size and shrink.
- One obvious primary action at a time. If the core loop needs more than about 3 always-visible action buttons, simplify the loop ([[02 The Core Loop]]).
- Everything must be possible with taps and the thumbstick: no keyboard-only shortcuts, no right-click, no scroll wheel, no hover.
- Assume a small screen, a moving car and a young player's thumb. Make everything big, well spaced and forgiving of near-misses.
- Route every input through one place (ContextActionService or a single input controller) so a key, a gamepad button and a touch button all trigger the same server request.
- Detect the input method with `UserInputService:GetLastInputType()` and `LastInputTypeChanged` to swap prompts ("Tap" vs "Press E"). `TouchEnabled` alone is not enough, because touch laptops exist.

## Thumb zones (landscape phone)
```
+------------------------------------------------------------------+
| [Roblox top bar]   status / info only (hard to reach, read-only) |
|                                                                  |
| menus open from        CENTER: keep clear, this is the game      |
| left edge, mid-height                     secondary buttons      |
|                        right half = camera swipe area            |
| THUMBSTICK ZONE                          ACTION ARC     [JUMP]   |
| bottom-left: no UI                       around the jump button  |
+------------------------------------------------------------------+
```
- **Bottom-left belongs to the thumbstick.** The default dynamic thumbstick appears wherever the left thumb lands in roughly the lower-left area. Buttons there either eat movement input or get pressed by accident.
- **Bottom-right belongs to jump.** Put primary actions in an arc above and to the left of the jump button, where the right thumb already rests. Leave a clear margin around jump.
- **The right half is also where players swipe to turn the camera.** Large panels there block camera control. Keep them small, or close them automatically.
- **The top strip holds the Roblox top bar.** Leave `ScreenGui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets` (the default) on interactive UI so it avoids the top bar and the notch. Use `None` (or `IgnoreGuiInset = true`) only for full-screen backgrounds and fades.
- Read-only info (currency, timers) can sit at top-center or top-right. Anything the player taps often must be reachable without moving their grip.
- Never depend on the internals of Roblox's `TouchGui` (names, sizes, positions). They can change without notice. Leave generous clear zones instead.

## Tap targets
- Rule of thumb: every tappable element is at least about **44 px** on its shortest side at phone resolution. Primary buttons should be bigger, around 60-80 px.
- Keep at least about 8 px of gap between neighbouring buttons.
- Make the hit area larger than the art: wrap a small icon in a bigger transparent button.
- Size with Scale so layouts adapt, then clamp with `UISizeConstraint.MinSize` so nothing drops below the tap minimum on tiny screens. Add `UIAspectRatioConstraint` to keep icons square.
- Connect to `GuiButton.Activated`, which works for mouse, touch and gamepad.
- Destructive or paid actions (sell all, spend premium currency) need a confirm step, because accidental taps happen far more on touch.

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

## ContextActionService mobile buttons
`ContextActionService:BindAction(name, handler, createTouchButton, ...inputs)` binds keys, gamepad buttons and (when the third argument is `true`) an on-screen touch button in a single call. Roblox places that button near the jump button.

```lua
--!strict
local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UseAbility = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("UseAbility") :: RemoteEvent

local function onAbility(_name: string, state: Enum.UserInputState, _input: InputObject)
	if state == Enum.UserInputState.Begin then
		UseAbility:FireServer() -- the server decides whether it is off cooldown
	end
	return Enum.ContextActionResult.Sink
end

ContextActionService:BindAction("UseAbility", onAbility, true, Enum.KeyCode.E, Enum.KeyCode.ButtonX)
ContextActionService:SetTitle("UseAbility", "DASH")
-- Position is relative to Roblox's context-button frame next to jump; nudge and check in the emulator.
ContextActionService:SetPosition("UseAbility", UDim2.new(1, -70, 0, 10))
-- ContextActionService:SetImage("UseAbility", "rbxassetid://0") -- placeholder: replace with a real icon
```
- Call `UnbindAction(name)` when the action is unavailable (menus open, dead, in a cutscene) so the button disappears instead of doing nothing.
- `GetButton(name)` returns the created ImageButton if you need to restyle or resize it.
- Keep it to 1-3 bound touch actions. If you need more, build your own action arc in a ScreenGui.

## Text legibility
- Rules of thumb at phone size: about 14 px absolute minimum for anything a player must read, 18 px or more for labels, and bigger for numbers that change (coins, timers).
- Use a heavy, simple sans font (for example Builder Sans in a Bold weight via `FontFace`). Thin and script fonts disappear on small screens.
- Text over the 3D world needs a `UIStroke` outline or a solid backing panel. Check contrast against both bright and dark scenes.
- Use `TextScaled` with a `UITextSizeConstraint` for short labels. Don't use `TextScaled` on paragraphs: neighbouring labels end up at different sizes. Give paragraphs a fixed size and a scrolling frame.
- Use one or two words per button, paired with an icon. Young readers and translated text both need room; leave about 30% spare width.

## No hover-only interactions
- Touch has no hover. `MouseEnter`/`MouseLeave` and `ClickDetector.MouseHoverEnter` never fire for a finger, so any information shown only on hover is invisible to most players.
- Tooltips should appear on tap (a first tap selects and shows details, a second tap or a separate button confirms) or be visible all the time.
- For world interactions use `ProximityPrompt`. It shows a tappable prompt on touch, a key hint on PC and a button hint on gamepad. Use `HoldDuration` for actions that shouldn't fire by accident.
- Drag-and-drop needs a tap-based fallback (tap item, then tap slot).

## Performance budget on low-end phones
The Device Emulator emulates **screen size and touch only, not phone performance**. Treat these as team starting budgets, not Roblox limits:
- Aim for a steady frame rate on an old phone, not peak quality on PC. If the frame rate drops in a busy scene in Studio on a dev machine, it will be far worse on a phone.
- Anchor everything static. Set `CanCollide`, `CanTouch` and `CanQuery` to false on decoration, use `CollisionFidelity = Box` or `Hull` on decor meshes, and set `CastShadow = false` on small props.
- Reuse the same MeshIds, textures and materials, and avoid thousands of tiny parts. Keep texture resolution as low as looks acceptable (small props rarely need 1024).
- Keep only a few ParticleEmitters visible at once with low `Rate`, and keep dynamic lights (PointLight/SpotLight/SurfaceLight) and stacked transparent surfaces to a minimum ([[07 Characters, VFX and Assets]]).
- Run one `Heartbeat` or `RenderStepped` loop per system, not one per object. Pool objects you spawn and despawn often.
- UI costs frames too. Don't animate dozens of gradients or strokes every frame, and paginate inventories instead of building hundreds of ScrollingFrame entries.
- Enable `Workspace.StreamingEnabled` for large maps ([[13 Building It Right]]) and keep spawn areas light ([[06 World and Look]]).
- Phones have little memory and crash when they run out. Watch the Memory tab in the Developer Console (F9) during long multi-client tests, and test with a low Editor Quality Level (Studio Settings > Rendering).

## Studio Device Emulator testing
- Open the Device Emulator from the Test tab, pick a small phone, a large phone and a tablet, and run Play for each. Mouse clicks act as taps, and the thumbstick and jump button appear.
- On every device: the HUD stays clear of the thumbstick, jump and top bar; all text is readable; every button is easy to hit; no panel covers the center for long.
- Check both landscape orientations (notch on the left, then on the right).
- Play a full first session with only touch input. If any step needs a keyboard, that's a bug.
- Before shipping, ask the owner (`node studio/cli.mjs ask`) to play on a real low-end phone, and have them note any frame drops and the exact scene where they happened. Never report "runs well on mobile" from the emulator alone.

## Landscape vs portrait
- Roblox defaults to landscape (`StarterGui.ScreenOrientation = Enum.ScreenOrientation.LandscapeSensor`). Keep it unless the game is designed for portrait from day one.
- Portrait (`Portrait`) suits menu-heavy or one-handed games, but the thumbstick, jump button and camera space all shrink. Design and test it as a separate layout.
- Don't allow free rotation (`Sensor`) unless both layouts are designed and tested. Re-layout on `workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize")`.

## Checklist
- [ ] Device Emulator: small phone, large phone and tablet all show a usable HUD with no overlap with thumbstick, jump or top bar.
- [ ] Every tappable element is at least about 44 px on its shortest side at small-phone size, with gaps between neighbours.
- [ ] Interactive ScreenGuis use `CoreUISafeInsets`; only backgrounds use `None`.
- [ ] Every action is reachable by touch; no keyboard-only or hover-only feature exists.
- [ ] Bound touch actions use `ContextActionService` (or the shared input controller) and unbind when unavailable.
- [ ] All text is at least about 14 px and readable over bright and dark scenes (stroke or backing panel).
- [ ] World interactions use `ProximityPrompt` or tap-friendly targets.
- [ ] Static parts are anchored, decor has collisions and queries off, particles and lights are kept to a minimum.
- [ ] Orientation is set deliberately, and both landscape sides were tested.
- [ ] A full first session was played touch-only in the emulator without errors in Output.

## Common mistakes
- Designing at 1920x1080 on PC and discovering on a phone that everything is tiny and overlapping.
- Putting the shop or inventory button in the bottom-left, where the thumbstick lives.
- Using hover tooltips to explain items, so most players never see the explanation.
- Treating the Device Emulator as a performance test. It isn't one.
- Covering the right half of the screen with a panel that blocks camera swiping.
- Using `TextScaled` everywhere, which gives inconsistent sizes and unreadable long text.
- Hard-coding positions based on Roblox's `TouchGui` layout, which breaks when Roblox changes it.
- Adding a fourth, fifth and sixth action button instead of simplifying the loop.

## Related
[[00 Start Here]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[09 Shops and Monetization]] · [[13 Building It Right]]
