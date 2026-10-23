---
tags: [vault, ui]
read_by: [lead, frame, builder, merchant, kid-tester, playtest, reviewer, splash]
---

# 05 UI and HUD

Most Roblox players are on phones, many are young, and few read UI text. A cluttered, tiny or text-heavy HUD hides the core loop and makes the game feel broken. Good UI shows only what the player needs every minute, stays clear of Roblox's own controls on every device, reacts to every tap, and looks consistent because every element pulls from the same style tokens. Frame owns `StarterGui` and the UI modules; read this with [[08 Mobile]].

## Minimal HUD

- Always on screen: the primary currency (plus at most one or two more) as icon + abbreviated number, the current objective ([[01 The First Five Minutes]]), and a short column of menu buttons (usually Shop, Inventory/Pets and one game-specific button such as Rebirth).
- Contextual buttons appear only while relevant: Sell when the backpack is full, an ability when it is ready.
- Everything else (settings, codes, index, trading, stats) lives inside a menu. Rule of thumb: if the player doesn't use it every minute, it isn't on the HUD.

## Layout zones (landscape phone)

| Zone | Put here | Keep out |
|---|---|---|
| Top edge | Nothing custom: Roblox's top bar buttons sit in both top corners | Anything tappable |
| Top center, below the bar | Objective, event timer, toast stack | Large panels |
| Top-left / top-right, below the bar | Currency displays | Buttons tapped often |
| Left side, middle | Menu button column | Anything low enough to meet the thumbstick |
| Center | Play space; reveals and menus only while open | Persistent HUD |
| Bottom-left | Mobile thumbstick (touch movement uses the left side) | All buttons |
| Bottom-right | Mobile jump button; action buttons in an arc above and left of it | Anything covering the jump button |
| Bottom center | Roblox hotbar, if the game uses Tools | Custom bars overlapping it |

Check every layout in the Studio Device Emulator on a small phone, a large phone and a tablet.

## ScreenGui setup

- `ResetOnSpawn = false` for HUD and menus. When true, the ScreenGui is recreated on every respawn and its LocalScripts run again, losing state and duplicating connections.
- `ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets` (the default) keeps content clear of the Roblox top bar and device notches. `DeviceSafeInsets` avoids only notches and rounded corners, `TopbarSafeInsets` places content in the top bar row between Roblox's buttons, and `None` is for full-screen backgrounds and fades only.
- `ZIndexBehavior = Enum.ZIndexBehavior.Sibling`; stack ScreenGuis with `DisplayOrder` (HUD < menus < popups < transitions).
- If code needs the top inset, read `GuiService:GetGuiInset()`; never hard-code it.

## Sizing that works on every screen

Pick one approach per game and stick to it:
1. **Scale-based:** size and position with `UDim2.fromScale`, set `AnchorPoint` to the corner you pin to (`Vector2.new(1, 0)` for top-right), and add a `UIAspectRatioConstraint` (AspectRatio = 1) to anything that must stay square. Use Offset only for strokes and small padding.
2. **Reference size + UIScale:** build with offsets at one reference height under a full-screen root Frame holding a UIScale, and update it from the viewport:

```lua
-- LocalScript inside the ScreenGui
local camera = workspace.CurrentCamera
local uiScale = script.Parent:WaitForChild("Root"):WaitForChild("UIScale") :: UIScale
local DESIGN_HEIGHT = 720 -- the screen height the offsets were designed at
local function rescale()
	uiScale.Scale = math.clamp(camera.ViewportSize.Y / DESIGN_HEIGHT, 0.6, 1.5)
end
camera:GetPropertyChangedSignal("ViewportSize"):Connect(rescale)
rescale()
```

Layouts:
- `UIListLayout` for button columns, rows and toast stacks; `SortOrder = Enum.SortOrder.LayoutOrder` and set `LayoutOrder` explicitly.
- `UIGridLayout` for inventories and shops (`CellSize`, `CellPadding`, `FillDirectionMaxCells` for a fixed column count), inside a `ScrollingFrame` with `AutomaticCanvasSize = Enum.AutomaticSize.Y` and `CanvasSize = UDim2.new()`.

## Style tokens

```lua
-- ReplicatedStorage/Shared/Theme.lua: the only place UI colors, fonts and radii are defined
return table.freeze({
	Colors = table.freeze({
		Panel = Color3.fromRGB(32, 36, 52), PanelAlt = Color3.fromRGB(52, 58, 82),
		Text = Color3.fromRGB(255, 255, 255), TextStroke = Color3.fromRGB(15, 16, 24),
		Accent = Color3.fromRGB(255, 196, 0), -- the main call to action: Buy, Claim, Play
		Good = Color3.fromRGB(80, 205, 110), Bad = Color3.fromRGB(235, 80, 80),
	}),
	Font = Enum.Font.GothamBold, Corner = UDim.new(0, 12), StrokeThickness = 2, Padding = UDim.new(0, 8),
	Tween = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
})
```

- Every panel and button gets `UICorner` (Theme.Corner), a dark `UIStroke` (Theme.StrokeThickness) and `UIPadding` so content never touches the edges.
- A `UIStroke` inside a TextLabel outlines the text (`ApplyStrokeMode = Contextual`); `Border` outlines the frame instead. Use `UIGradient` lightly for depth; rarity colors come from [[03 Rarity and RNG]].

## Text and icons

- `TextScaled = true` plus a `UITextSizeConstraint` (a common start: MinTextSize ~14, MaxTextSize ~40) so text neither shrinks to dust on phones nor balloons on tablets.
- One bold font from Theme. White text with a dark stroke reads on most colors; never put text straight onto a busy image.
- Labels are one or two words. Numbers are abbreviated (`1.25M`) with the shared formatter from [[04 Progression and Economy]].
- Icons beat words: cart for Shop, paw for Pets, circular arrow for Rebirth, gear for Settings, icon + number for currencies. Keep one icon style.
- A small red badge means "something new here"; clear it when opened and use it sparingly. Leave room for translation (AutoLocalize is on by default): let labels scale rather than fitting text to an exact box.

## Button press feedback

Every button scales down on press, springs back on release, plays a short click and acts on `Activated`, which fires for mouse, touch and gamepad.

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local PRESS = TweenInfo.new(0.06, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local RELEASE = TweenInfo.new(0.18, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local click = ReplicatedStorage.Assets.Sounds.UI.Click :: Sound

local function isPress(input: InputObject): boolean
	return input.UserInputType == Enum.UserInputType.MouseButton1
		or input.UserInputType == Enum.UserInputType.Touch
end

local function bindButton(button: GuiButton, onClick: () -> ())
	local scale = button:FindFirstChildOfClass("UIScale")
	if not scale then
		scale = Instance.new("UIScale")
		scale.Parent = button
	end
	button.InputBegan:Connect(function(input)
		if isPress(input) then TweenService:Create(scale, PRESS, { Scale = 0.9 }):Play() end
	end)
	local function release() TweenService:Create(scale, RELEASE, { Scale = 1 }):Play() end
	button.InputEnded:Connect(function(input) if isPress(input) then release() end end)
	button.MouseLeave:Connect(release) -- finger or mouse slid off the button
	button.Activated:Connect(function()
		SoundService:PlayLocalSound(click)
		onClick()
	end)
end
```

Menus: one open at a time (opening one closes the other), a quick open tween (UIScale 0.9 to 1 in ~0.15 s), a large close button in the panel's top-right corner, and the currency display stays visible while the shop is open. For gamepad, set `GuiService.SelectedObject` to the first button when a menu opens.

## Toasts and notifications

Short messages ("+1 Pet!", "Not enough coins") come from the server through a RemoteEvent and are queued on the client. Cap how many show at once and let each fade out on its own.

```lua
-- Client. Toasts: a top-center Frame with a UIListLayout. ToastTemplate: a styled TextLabel.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Theme = require(ReplicatedStorage.Shared.Theme)
local toasts = script.Parent:WaitForChild("Toasts")
local template = ReplicatedStorage.Assets.UI.ToastTemplate :: TextLabel
local MAX_VISIBLE, counter, visible = 3, 0, {} :: {TextLabel}

ReplicatedStorage.Remotes.Toast.OnClientEvent:Connect(function(text: string, kind: string?)
	counter += 1
	local label = template:Clone()
	label.Text = text
	label.BackgroundColor3 = if kind == "bad" then Theme.Colors.Bad else Theme.Colors.Panel
	label.LayoutOrder = counter -- newest last
	label.Parent = toasts
	table.insert(visible, label)
	if #visible > MAX_VISIBLE then table.remove(visible, 1):Destroy() end
	task.delay(2.5, function()
		local i = table.find(visible, label)
		if not i then return end -- already pushed out
		table.remove(visible, i)
		local fade = TweenService:Create(label, Theme.Tween, { BackgroundTransparency = 1, TextTransparency = 1 })
		fade:Play()
		fade.Completed:Wait()
		label:Destroy()
	end)
end)
```

## Checklist

- [ ] Every HUD/menu ScreenGui has `ResetOnSpawn = false` and `ScreenInsets = CoreUISafeInsets` (`None` only for full-screen overlays)
- [ ] Nothing custom overlaps the top bar, the thumbstick area or the jump button in Device Emulator phone presets
- [ ] All sizes use Scale (or one UIScale root); square elements have `UIAspectRatioConstraint`
- [ ] Text uses `TextScaled` + `UITextSizeConstraint` and is readable on the smallest phone preset
- [ ] Touch targets are comfortably thumb-sized on the smallest phone (a common rule of thumb is at least ~44-48 px)
- [ ] Every button uses `Activated` and has press feedback and a click sound
- [ ] Colors, font, corners and strokes come from Theme; no ad-hoc Color3 in UI scripts
- [ ] HUD shows at most three currencies, the objective and about four buttons
- [ ] Only one menu is open at a time and each has a large close button
- [ ] Toasts queue, cap the visible count and dismiss themselves

## Common mistakes

- Designing at desktop resolution with Offset sizes, then shipping to phones.
- Buttons placed where the thumbstick or jump button lives, or over Roblox's top bar.
- `ResetOnSpawn = true` on the HUD, so state resets and connections double after every death.
- Long sentences on buttons; tiny text; text over busy art without a stroke or panel.
- No press feedback, so taps feel dead; reward toasts stacking until they cover the screen.
- Shops that open themselves during the first minutes ([[09 Shops and Monetization]]).

## Related

[[00 Start Here]] · [[01 The First Five Minutes]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]]
