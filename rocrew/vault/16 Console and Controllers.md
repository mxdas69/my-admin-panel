---
tags: [vault, console, gamepad, controller, xbox, playstation, input, ui-navigation, ten-foot-ui, haptics]
for: [frame, builder, playtest]
also: [architect, kid-tester, reviewer]
---

# 16 Console and Controllers

Every RoCrew game must be fully playable with a gamepad and nothing else. Roblox runs on Xbox and, since 10 October 2023, PS4 and PS5 [38][39]; PC players plug in controllers, phones pair Bluetooth pads, and TV apps use a remote that Roblox treats as a tiny gamepad [13]. A console player has no mouse, no touchscreen and usually no keyboard, and sits 8 to 10 feet from a TV [26]. If one menu can't be reached with the stick, or one popup can't be closed with B, that player is stuck and leaves.

This chapter is the spec for input, button prompts, UI navigation, TV-sized UI, camera, haptics and console compliance. It sits alongside [[08 Mobile]] (touch) and [[05 UI and HUD]] (layout). One action, three inputs: build each feature once and bind it to gamepad, keyboard/mouse and touch.

**Reading cost:** agents read `## Rules` and `## Checklist` by default and pull other sections by heading.

## Rules

1. **Every action has three bindings: gamepad, keyboard/mouse, touch.** Define each gameplay action once (Input Action System `InputAction` with three `InputBinding`s, or one `ContextActionService` bind) and route all three inputs to the same function [5][17]. No feature ships with fewer than three working inputs.
2. **Detect the input with `UserInputService.PreferredInput`.** It returns `KeyboardAndMouse`, `Gamepad` or `Touch` and changes when the player picks up a different device [1][2]. Listen to its changed signal and swap prompts and layout within one frame. Never decide from `TouchEnabled` or `GamepadEnabled` alone [44].
3. **Show the controller's own glyphs.** On gamepad, button hints use `UserInputService:GetImageForKeyCode()`, which returns Xbox or PlayStation art for the connected pad [15]. No UI text says "Click", "Tap" or "Press E" while the preferred input is Gamepad.
4. **Every screen works with stick/D-pad, A and B.** Each menu selects a default button the moment it opens (`GuiService:Select`), and **B closes the top menu** and returns focus to where it was [21]. Controller navigation is the default; the virtual cursor is never required to finish a task [26][28].
5. **Key actions are at most 2 presses from gameplay.** Console navigation is one press at a time, so give essential actions their own buttons and shortcuts [26]. Studio map: Y opens the main menu or inventory, LB/RB switch tabs, X interacts, A confirms, B backs out.
6. **Size UI for a TV 10 feet away.** When `GuiService.ViewportDisplaySize` is `Large` [20], minimums at 1920×1080 are: body text 28 px, small labels 22 px, buttons 72 px tall, 16 px between selectables (studio standard). Use scale sizes and `UITextSizeConstraint` so phones keep their own limits from [[08 Mobile]].
7. **Keep everything readable inside the TV-safe area.** Some TVs crop the screen edge [26]. On a ten-foot interface, put all text and selectables inside the inner 90% of the screen (5% padding per side) [47].
8. **The selected button is always obvious.** Use one shared `SelectionImageObject` (4 px ring in the accent color) plus a 1.06 scale on the selected button [18]. Anything shown on mouse hover is also shown on `SelectionGained`; no hover-only information.
9. **Don't fight the default controls.** Left stick moves, right stick turns the camera, A jumps [12]. Leave `Thumbstick1`, `Thumbstick2` and `ButtonA` (in gameplay) alone, and leave `ButtonStart` to the Roblox menu.
10. **Triggers do the main action.** R2 is the primary action (attack, shoot, collect, throttle), L2 the secondary (aim, block, brake) [12]. Read trigger pressure from `InputObject.Position.Z` (0 to 1) when it should be analog [12]. ProximityPrompts default to X; keep that [29].
11. **Haptics are short, light and optional.** A pulse lasts at most 0.3 s at intensity 0.6 or less, always gets switched off, and players can turn haptics off in Settings. Check support before use; `HapticService` is marked deprecated in favor of `HapticEffect`, so wrap it in one module [23][24].
12. **No flow needs a keyboard.** Codes, names and search are optional or have a no-typing path (pick lists, random-name button, category tabs). Console guidelines say to disable the chat window on console [26]; give quick chat or emotes instead.
13. **Console-ready means compliant.** The maturity questionnaire is done (unrated experiences became unplayable after 30 September 2025) [36], Console is ticked under Playable Devices (owner action) [37], and off-platform links and paid random items are shown only when `PolicyService` allows them for that player [33].
14. **Test with a controller on every build.** Playtest runs the first five minutes and every menu with only the Studio Controller Emulator (device set to a console) before each gate [14], and the owner confirms once on real hardware before ship.

## Who uses a controller

### Platforms
| Device | Input | Notes |
|---|---|---|
| Xbox One / Series X\|S | Xbox pad | Ten-foot interface; `GamepadType` fixed to the native pad [16] |
| PS4 / PS5 | DualShock / DualSense | Launched 10 Oct 2023 with the full catalog [38] |
| PC / Mac with a pad | Xbox, PlayStation, generic | Players switch between pad and mouse mid-session |
| Phone or tablet with a pad | Bluetooth pad | `PreferredInput` reports Gamepad while the pad is in use [1] |
| TV apps (remote) | "Micro gamepad" | Remote buttons arrive as legacy gamepad keycodes; Center maps to ButtonA [13] |

### Detecting a console
`GuiService:IsTenFootInterface()` is the only guaranteed console check [20][46]. It can't tell Xbox from PlayStation, and Roblox has repeatedly declined to add a device-type API [43]. Design for the **input** (PreferredInput) and the **screen** (ViewportDisplaySize), not the brand. The one brand-specific need, glyph art, is handled by `GetImageForKeyCode` [15].

## Detecting input

### Which API to use
| API | Use it for | Don't use it for |
|---|---|---|
| `UserInputService.PreferredInput` | Which prompts, layout and hints to show [1][2][3] | Nothing; this is the default |
| `GetLastInputType()` / `LastInputTypeChanged` | Older code; low-level reactions | Choosing UI: it flickers on stray mouse moves [44] |
| `GamepadEnabled` | Whether any pad is connected | Choosing UI: players leave pads plugged in [44] |
| `TouchEnabled` | Whether a touchscreen exists (client-only) [4] | Choosing UI: touch laptops report true [43] |
| `GuiService:IsTenFootInterface()` | TV layout, safe area, chat policy | Input decisions |
| `GuiService.ViewportDisplaySize` | Small / Medium / Large screen layout [20] | Input decisions |

### The InputMode module (client)
One module owns the current mode; every UI controller subscribes to it.

```lua
--!strict
-- StarterPlayerScripts/Controllers/InputMode (ModuleScript)
local UserInputService = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")

export type Mode = "Gamepad" | "Touch" | "KeyboardMouse"

local InputMode = {}
local listeners: { (Mode) -> () } = {}

local function read(): Mode
	local p = UserInputService.PreferredInput
	if p == Enum.PreferredInput.Gamepad then
		return "Gamepad"
	elseif p == Enum.PreferredInput.Touch then
		return "Touch"
	end
	return "KeyboardMouse"
end

InputMode.current = read()
InputMode.isTV = GuiService:IsTenFootInterface()

function InputMode.onChanged(fn: (Mode) -> ()): () -> ()
	table.insert(listeners, fn)
	task.spawn(fn, InputMode.current)
	return function()
		local i = table.find(listeners, fn)
		if i then
			table.remove(listeners, i)
		end
	end
end

UserInputService:GetPropertyChangedSignal("PreferredInput"):Connect(function()
	local mode = read()
	if mode == InputMode.current then
		return
	end
	InputMode.current = mode
	for _, fn in listeners do
		task.spawn(fn, mode)
	end
end)

return InputMode
```

### TV remotes (micro gamepad)
Remote buttons arrive as legacy gamepad keycodes; a `PreferredInput` value for them is planned but not set yet [13]. If every menu works with D-pad, A and B only, remotes work for free.

## Binding actions once for all inputs

### Input Action System (default for new games)
The Input Action System (IAS) is fully released [8][9]. You build the bindings as real instances in Studio, so Frame and Builder can see and edit them by hand:

```
StarterPlayer/StarterPlayerScripts/
  InputContexts (Folder)
    Gameplay (InputContext)            Enabled = true
      Interact (InputAction, Type Bool)
        Pad (InputBinding)             KeyCode = ButtonX
        Keys (InputBinding)            KeyCode = E
        Touch (InputBinding)           UIButton = set at runtime to HUD.InteractButton
      Inventory (InputAction, Bool)    ButtonY / Tab / touch button
      Primary (InputAction, Bool)      ButtonR2 / MouseButton1 is handled by tool; touch button
    Menu (InputContext)                Enabled = false, Sink = true, Priority above Gameplay
      Back (InputAction, Bool)         ButtonB / Backspace
      TabLeft / TabRight               ButtonL1, ButtonR1 / Q, E
```

- An `InputAction` registers with its nearest `InputContext` ancestor [7]. Turn contexts on and off (`Enabled`) instead of binding and unbinding in code.
- `Type` is `Bool` by default; `Direction1D`/`Direction2D` exist for analog inputs [5].
- `Pressed` fires only for Bool actions on false→true; `Released` is the reverse; `StateChanged` fires for every type [7].
- `InputBinding.UIButton` takes a `GuiButton`, which is how a touch button you built in StarterGui triggers the same action [6].
- Some inputs are reserved and can't be overridden [5]. Before the PlayerScripts were converted, IAS bindings on Thumbstick1, ButtonA, ButtonR2 and Shift could be eaten by the default controls; the full release ships converted PlayerScripts [8]. Still test each binding in Play.

Wire the touch binding at runtime: `(interact.Touch :: InputBinding).UIButton = hud.InteractButton`, then `interact.Pressed:Connect(onInteract)`.


### ContextActionService (older games and quick tools)
`BindAction` with `createTouchButton = true` makes an on-screen button on touch devices only; `GetButton` returns nothing elsewhere [17]. The auto buttons are hard to style, so for anything visible use your own StarterGui button [17].


### Studio button map
Based on Roblox's recommended scheme [12]. Genres may override (see the per-genre section), but write any change in `decisions.md`.

| Button | Gameplay | In menus |
|---|---|---|
| Left stick | Move | Navigate |
| Right stick | Camera | Scroll long lists |
| A | Jump | Confirm |
| B | Dodge / roll / sprint (genre) | Back / close |
| X | Interact (ProximityPrompt default [29]) | Secondary (Equip, Sell) |
| Y | Open inventory / main menu | Tertiary (Details) |
| LB / RB | Hotbar or ability cycle | Previous / next tab |
| LT (L2) | Aim / block / brake | Rarely used |
| RT (R2) | Primary action / throttle | Rarely used |
| D-pad | Quick slots / emotes | Navigate |
| L3 / R3 | Sprint / camera lock-on | Not used |
| Start | Roblox menu (reserved) | Reserved |

## Button prompts that match the controller

### The tools
- `UserInputService:GetImageForKeyCode(keyCode)` returns Roblox's glyph for the connected pad (Xbox, PlayStation or Windows art) [15].
- `GetStringForKeyCode(keyCode)` returns a name for custom art; on PlayStation pads it gives names like `ButtonCross`, so it's not a reliable brand check [15].
- `Enum.GamepadType` has `PS4`, `PS5`, `XboxOne` and `Unknown`; on console it's fixed to the native pad, elsewhere it follows the most recently connected one [16].
- **ProximityPrompt** already swaps its own hint per input; `PromptShown` passes the `ProximityPromptInputType` (Keyboard, Gamepad, Touch) for custom prompt UI [29][30].
- **InputActionLabel** draws the right key or glyph for an InputAction with no code, but during its Studio beta it can't be published; `InputBinding.DisplayName`/`DisplayImage` are already live [10][11].

### PromptIcon module
```lua
--!strict
-- StarterPlayerScripts/Controllers/PromptIcon (ModuleScript)
local UserInputService = game:GetService("UserInputService")
local InputMode = require(script.Parent.InputMode)

export type Keys = { pad: Enum.KeyCode, keys: Enum.KeyCode }

local PromptIcon = {}

-- icon: ImageLabel for glyphs; label: TextLabel for keyboard letters or a fallback
function PromptIcon.bind(icon: ImageLabel, label: TextLabel, keys: Keys): () -> ()
	return InputMode.onChanged(function(mode)
		if mode == "Gamepad" then
			local image = UserInputService:GetImageForKeyCode(keys.pad)
			icon.Image = image
			icon.Visible = image ~= ""
			label.Visible = image == ""
			label.Text = UserInputService:GetStringForKeyCode(keys.pad)
		elseif mode == "KeyboardMouse" then
			icon.Visible = false
			label.Visible = true
			label.Text = UserInputService:GetStringForKeyCode(keys.keys)
		else
			icon.Visible = false -- touch: the on-screen button is the prompt
			label.Visible = false
		end
	end)
end

return PromptIcon
```

### Wording
- Keep one strings table per mode: `{ Gamepad = "Equip", KeyboardMouse = "Equip", Touch = "Tap to equip" }`, with the glyph shown next to the word.
- Tutorial text never names a key in words ("Press X"). It shows the glyph image.

## UI selection and navigation

### How Roblox gamepad navigation works
- `GuiService.SelectedObject` is the GuiObject the gamepad is focused on; it resets to nil if that object goes off-screen [20].
- Only objects with `Selectable = true` get focus (buttons are selectable by default) [18].
- Without explicit links, the stick or D-pad moves to the nearest selectable in that direction.
- `GuiService.AutoSelectGuiEnabled` lets the pad's Select button enter UI selection on its own; if you turn it off, you must set `SelectedObject` yourself [20].
- Roblox offers directional selection and a virtual cursor by default, but recommends bespoke navigation for any non-standard layout [26].

### Default focus when a menu opens
`GuiService:Select(instance)` looks through the descendants of a PlayerGui object and selects the one with the lowest `SelectionOrder`, breaking ties top-most, then left-most [21]. Give the button players want most (Buy, Play, Equip) `SelectionOrder = -1`. Never make a destructive button (Sell, Delete, Spend Robux) the default.

### Explicit links and groups
- `NextSelectionUp/Down/Left/Right` on a GuiObject forces where each direction goes [18]. Use it for wrap-around tabs, a close button in a corner, and grid rows of uneven length.
- Set `SelectionGroup = true` on a container to get `SelectionBehaviorUp/Down/Left/Right`. `Escape` (default) looks inside first then leaves; `Stop` never leaves in that direction [19]. Put a `Stop` on all four sides of a modal popup so focus can't wander to the HUD behind it.

### Selection look
Frame builds one highlight as a real instance (`StarterGui.Templates.SelectionRing`, an ImageLabel 9-slice ring, `Size = UDim2.new(1, 12, 1, 12)`, `Position = UDim2.fromOffset(-6, -6)`) and points buttons at it:

```lua
--!strict
local Players = game:GetService("Players")
local playerGui = Players.LocalPlayer:WaitForChild("PlayerGui")
local ring = playerGui:WaitForChild("Templates"):WaitForChild("SelectionRing") :: ImageLabel

local function styleSelectables(root: Instance)
	for _, d in root:GetDescendants() do
		if d:IsA("GuiButton") then
			d.SelectionImageObject = ring
		end
	end
end

-- Show the same hint on hover and on gamepad selection
local function bindHint(button: GuiButton, show: () -> (), hide: () -> ())
	button.MouseEnter:Connect(show)
	button.MouseLeave:Connect(hide)
	button.SelectionGained:Connect(show)
	button.SelectionLost:Connect(hide)
end
```

### Menu stack: open, focus, B to close
```lua
--!strict
-- StarterPlayerScripts/Controllers/Menus (ModuleScript)
local GuiService = game:GetService("GuiService")
local InputMode = require(script.Parent.InputMode)

local contexts = script.Parent.Parent:WaitForChild("InputContexts")
local menuContext = contexts:WaitForChild("Menu") :: InputContext
local back = menuContext:WaitForChild("Back") :: InputAction

type Entry = { frame: GuiObject, returnTo: GuiObject? }
local stack: { Entry } = {}
local Menus = {}

local function focus(frame: GuiObject)
	if InputMode.current == "Gamepad" then
		task.defer(GuiService.Select, GuiService, frame) -- after layout settles
	end
end

function Menus.open(frame: GuiObject)
	table.insert(stack, { frame = frame, returnTo = GuiService.SelectedObject })
	frame.Visible = true
	menuContext.Enabled = true
	focus(frame)
end

function Menus.closeTop()
	local top = table.remove(stack)
	if not top then
		return
	end
	top.frame.Visible = false
	if #stack == 0 then
		menuContext.Enabled = false
		GuiService.SelectedObject = nil -- A goes back to Jump
	elseif top.returnTo and top.returnTo.Visible and top.returnTo:IsDescendantOf(game) then
		GuiService.SelectedObject = top.returnTo
	else
		focus(stack[#stack].frame)
	end
end

back.Pressed:Connect(Menus.closeTop)

-- Picking up the pad while a menu is open: give focus immediately
InputMode.onChanged(function(mode)
	if mode == "Gamepad" and #stack > 0 and GuiService.SelectedObject == nil then
		focus(stack[#stack].frame)
	elseif mode ~= "Gamepad" then
		GuiService.SelectedObject = nil -- no gamepad ring for mouse or touch users
	end
end)

return Menus
```
Also pause gameplay input while `GuiService.MenuIsOpen` is true (the Roblox menu is open) [20].

### Lists, grids and tabs
- Shops and inventories use `UIGridLayout` inside a `ScrollingFrame`. After each `SelectedObject` change, check the selected item is inside the visible canvas; if not, set `CanvasPosition` so it is.
- At most 6 items per row on TV so each stays 140 px or wider.
- LB/RB switch tabs from anywhere in the menu; the tab bar itself is also selectable.
- A popup gets a `Stop` selection group on all sides, A confirms, B cancels, and the confirm button is focused first only when the action is safe.

### Virtual cursor
Set `StarterGui.VirtualCursorMode = Enabled` to allow it; `GamepadService:EnableGamepadCursor(guiObject or nil)` turns it on at an object (pass `nil` for the default spot; no argument errors), `DisableGamepadCursor()` turns it off, and `GamepadCursorEnabled` reports the state [22]. Use it only for freeform screens (map pins, drag-placement in a tycoon builder). Every task must also be doable without it [28].

## The 10-foot UI

### Size and distance
Console players typically sit 8 to 10 feet from the screen. Roblox recommends relative (percentage) sizes, designing for low resolutions first, `UISizeConstraint`, and checking `GuiService.ViewportDisplaySize`, where `Large` means most TVs [26][20].

| Element (at 1920×1080, Large) | Minimum (studio standard) |
|---|---|
| Body text | 28 px |
| Small labels, prices | 22 px |
| Headings | 40 px |
| Button height | 72 px |
| Grid item | 140 × 140 px |
| Space between selectables | 16 px |
| Selection ring stroke | 4 px |
| Items visible per row | 6 |

Respect the player's text-size setting: `GuiService.PreferredTextSize` changes when they ask for larger text; recalculate label heights on its changed signal [45]. Text over the 3D world gets a 2 px `UIStroke`. Avoid thin fonts and pure-white text on bright skies.

### TV-safe area
Some TVs crop the picture edge [26]. TV industry practice is a safe zone of roughly the inner 85-95% of the screen [47][48]. Studio standard: on a ten-foot interface, the HUD ScreenGui's `Safe` frame gets 5% padding on every side. Keep `ScreenInsets = CoreUISafeInsets` so Roblox's top bar never covers your buttons [31]. Don't rely on `TopbarSafeInsets` on console; it has been reported to size content wrongly there [32].

```lua
--!strict
local GuiService = game:GetService("GuiService")

local function applyTvLayout(safePadding: UIPadding, uiScale: UIScale)
	local tv = GuiService:IsTenFootInterface()
		or GuiService.ViewportDisplaySize == Enum.DisplaySize.Large
	local edge = UDim.new(if tv then 0.05 else 0, 0)
	safePadding.PaddingLeft, safePadding.PaddingRight = edge, edge
	safePadding.PaddingTop, safePadding.PaddingBottom = edge, edge
	uiScale.Scale = if tv then 1.15 else 1
end
```
Call it on start and on `GuiService:GetPropertyChangedSignal("ViewportDisplaySize")`.

### Layout by input mode
| Mode | Show | Hide |
|---|---|---|
| Gamepad | Glyph prompts beside actions, selection ring | Touch buttons, "click" hints |
| Touch | On-screen buttons in thumb zones ([[08 Mobile]]) | Glyphs, keyboard letters |
| Keyboard/mouse | Key letters, hover tooltips | Touch buttons, glyphs |

### No hover-only, no tiny targets
- Every `MouseEnter` behavior has a `SelectionGained` twin (see `bindHint`).
- No selectable smaller than 72 px tall on TV. Merge tiny icon buttons (×, ?, i) into a bigger labeled button, or give them a larger invisible hit frame.
- No "drag to buy" or "hold right-click" interactions without a button alternative.

## Camera and movement with thumbsticks

### Keep the defaults
The default PlayerModule handles left-stick movement, right-stick camera and A to jump [12]. Most genres need nothing more. Camera sensitivity is the player's own setting (`UserGameSettings.GamepadCameraSensitivity`); don't overwrite it. If a genre needs slower aim, scale your own camera input instead [41][49].

### Reading sticks and triggers yourself
For custom cameras, vehicles or aiming, apply a radial dead zone (studio standard 0.18) and read trigger pressure from `Position.Z` [12]:

```lua
--!strict
local UserInputService = game:GetService("UserInputService")

local DEAD_ZONE = 0.18
local look = Vector2.zero
local throttle = 0

local function radial(v: Vector2): Vector2
	local m = v.Magnitude
	if m < DEAD_ZONE then
		return Vector2.zero
	end
	return v.Unit * math.min((m - DEAD_ZONE) / (1 - DEAD_ZONE), 1)
end

UserInputService.InputChanged:Connect(function(input: InputObject, _processed: boolean)
	if input.KeyCode == Enum.KeyCode.Thumbstick2 then
		look = radial(Vector2.new(input.Position.X, input.Position.Y))
	elseif input.KeyCode == Enum.KeyCode.ButtonR2 then
		throttle = input.Position.Z -- 0 = released, 1 = fully pulled
	end
end)

UserInputService.InputEnded:Connect(function(input: InputObject)
	if input.KeyCode == Enum.KeyCode.Thumbstick2 then
		look = Vector2.zero
	elseif input.KeyCode == Enum.KeyCode.ButtonR2 then
		throttle = 0
	end
end)
```

### Aiming and lock-on
Gamepad aim is slower than a mouse. We found no Roblox aim-assist module, so shooters and combat games build their own, client-side only: slow the camera 30-40% while the reticle is over an enemy, and offer R3 lock-on in melee games. Aim assist never changes what the server accepts as a hit ([[17 Security and Anti-Cheat]]). Shift-lock is a PC feature; on pad, offer a lock-on or "camera follows aim" toggle instead.

## Haptics

### APIs
- `HapticService:IsVibrationSupported(Enum.UserInputType.Gamepad1)`, `IsMotorSupported(...)`, `SetMotor(Gamepad1, motor, value)`. Roblox supports haptics on Xbox, PlayStation, Quest controllers and most modern phones [23]. Almost every use passes `Gamepad1` [23].
- The `HapticService` page is marked deprecated. Its successor, `HapticEffect`, offers preset types and custom waveforms (`SetWaveformKeys` with `FloatCurveKey` time in ms and value 0-1), plus `Play()`, `Stop()` and `Looped` [24][25]. It began as a Studio beta, so check that it runs in a published test before switching.

### Studio haptic budget
| Event | Strength | Length |
|---|---|---|
| UI confirm / purchase success | 0.2 | 0.05 s |
| Take a hit | 0.45 | 0.12 s |
| Land a heavy hit / big landing | 0.6 | 0.2 s |
| Explosion near you | 0.6 | 0.3 s |
| Anything continuous | not allowed | — |

```lua
--!strict
-- StarterPlayerScripts/Controllers/Haptics (ModuleScript)
local HapticService = game:GetService("HapticService")
local UserInputService = game:GetService("UserInputService")

local PAD = Enum.UserInputType.Gamepad1
local MOTOR = Enum.VibrationMotor.Large

local Haptics = { enabled = true } -- Settings toggle writes this
local token = 0

function Haptics.pulse(strength: number, seconds: number)
	if not Haptics.enabled or UserInputService.PreferredInput ~= Enum.PreferredInput.Gamepad then
		return
	end
	if not (HapticService:IsVibrationSupported(PAD) and HapticService:IsMotorSupported(PAD, MOTOR)) then
		return
	end
	token += 1
	local mine = token
	HapticService:SetMotor(PAD, MOTOR, math.clamp(strength, 0, 0.6))
	task.delay(math.clamp(seconds, 0.03, 0.3), function()
		if token == mine then
			HapticService:SetMotor(PAD, MOTOR, 0)
		end
	end)
end

return Haptics
```

## Menus, chat and keyboard-less flows

### Opening and closing
- Y (or the genre's menu button) opens the main menu; B closes the top layer; repeated B returns to gameplay with `SelectedObject = nil`.
- Every popup has a visible close button and a B-to-close glyph hint.
- Destructive or Robux actions use hold-to-confirm (hold A for 0.6 s with a fill bar), not a double-tap.
- When the Roblox menu opens (`GuiService.MenuIsOpen`), pause custom input [20].

### Chat
Roblox's console guidelines recommend disabling the chat window in console games [26]. On a ten-foot interface, hide the chat window and give quick-chat phrases or emotes on the D-pad. Social features (party invites, trading) must not depend on typing.

### Text entry
A TextBox can take focus through gamepad selection and opens the platform's on-screen keyboard; `ReturnPressedFromOnScreenKeyboard` fires when the player submits it [40]. Rules:
- Codes: allowed, but every code reward is also earnable without typing.
- Naming: a **Random name** button and a preset list next to the TextBox; filter on the server ([[17 Security and Anti-Cheat]]).
- Search: replace with category tabs and sort buttons.

### Off-platform links
Never show a Discord, YouTube or X callout unless `PolicyService` lists it in `AllowedExternalLinkReferences` for that player [33]. The answer depends on the player's location, age group and **platform** [33]. Treat a failed call as "not allowed".

```lua
--!strict
local PolicyService = game:GetService("PolicyService")

local function linkAllowed(player: Player, service: string): boolean
	local ok, info = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
	if not ok or type(info) ~= "table" then
		return false -- most restrictive on failure
	end
	local list = info.AllowedExternalLinkReferences
	return type(list) == "table" and table.find(list, service) ~= nil
end
```
Use the same policy table for `ArePaidRandomItemsRestricted` before showing any paid loot box or egg; ineligible players need a non-random alternative [33][50].

## Console availability and compliance

### What Roblox requires today
- The old Xbox guidelines were replaced by **Console Guidelines** covering Xbox and PlayStation. Roblox staff said there are no console-specific requirements beyond those best practices, and old requirements not in the new guidelines no longer apply [27][26].
- The legacy Xbox page still states the intent: controller navigation is the default, and the virtual cursor is optional [28].
- **Playable Devices** in Experience Settings (Basic Info) lists each device type the game supports [37]. Console is ticked by the owner, not by agents; put it in the ship-prep `ask`.
- **Content maturity**: every experience needs its maturity questionnaire; unrated experiences became unplayable after 30 September 2025 [36][34]. Restricted experiences are limited to age-verified adults (18+) [35]. We found no extra console-only content rule; the label and PolicyService answers apply on every platform.
- **Policy per player**: off-platform links and paid random items go through `PolicyService` [33][50].

## Testing with a controller

### Controller Emulator in Studio
- Opens from the **Virtual controller** button in the Device Simulator toolbar or **Controller** in the Emulation tab; it needs an open place [14].
- It emulates gamepads, handhelds, VR controllers and TV remotes, and your game sees the matching gamepad type [14].
- Buttons, triggers and sticks are clickable or draggable, with analog values for partial trigger pulls and slow stick moves [14].
- Keyboard-to-button mappings can be edited (for example E → ButtonL2) and persist per device [14].
- Picking a console, handheld or Android TV device in the Device Simulator switches the emulator to the matching controller [14].
- If a control on the picture doesn't light up, the problem is before your input code [14].

### Playtest controller pass (step by step)
1. Device Simulator → a console device at 1920×1080; Controller Emulator open. Hands off the mouse for the rest of the pass.
2. Join and play the first five minutes ([[01 The First Five Minutes]]). Note every moment you had to touch the mouse.
3. Open every menu, popup and shop with its button; confirm a default button is selected; close each with B.
4. Buy something with soft currency and start a Robux purchase prompt; confirm the prompt is navigable.
5. Move the mouse, then press a pad button: prompts must swap to glyphs within a frame.
6. Check every interactable: the ProximityPrompt shows the X glyph and fires.
7. Screenshot the HUD; check all text and buttons sit inside the 5% safe margin.
8. Trigger each haptic event; confirm the motor stops.
9. Write `games/<slug>/reports/controller-YYYY-MM-DD.md`: one table of `screen | reachable | default focus | B closes | issues`.

### Real hardware
Before ship, send the owner a `cli.mjs test` with steps like "Plug in a controller", "Open the shop with Y", "Close it with B", "Buy the small pack". Attach emulator screenshots of each step.

## Per-genre notes

### Combat and battlegrounds
R2 light attack, L2 block, B dodge, X/Y/RB specials, R3 lock-on. Buffer inputs for 0.2 s so pad players can chain combos without frame-perfect timing. No three-button chords. Cooldown icons show glyphs. See [[Genre - Action and Combat]] and [[Genre - Battlegrounds]].

### Obby
A jumps; the default camera works. Add 0.1 s coyote time and a 0.1 s jump buffer so stick players aren't punished. Stage select uses D-pad left/right. The Skip Stage button is selectable but never the default focus. See [[Genre - Obby]].

### Simulator
Hold R2 to collect at the same rate as tapping, never faster (fair across inputs). The pet or item inventory is a grid with a `Stop` selection group; X = Equip Best, Y = open inventory, LB/RB = categories. See [[Genre - Simulator]].

### Tycoon
Walk-on buy pads work on every input. Placement or build mode snaps to a grid moved by the left stick or D-pad, LB/RB rotate, A places, B cancels; the virtual cursor is an optional extra. See [[Genre - Tycoon]].

### Shooter
R2 fire, L2 aim down sights, X reload, Y swap weapon, RB grenade, L3 sprint, R3 melee. Client-side aim slowdown near targets; the server validates every hit the same way for all inputs. Trigger pull threshold 0.5 for semi-auto.

### Racing and vehicles
Left stick steers, R2 throttle and L2 brake/reverse, both analog via `Position.Z` [12]. Reports differ on whether `VehicleSeat` maps triggers by default [42], so read the triggers yourself in a LocalScript and drive the vehicle's throttle from them. A or X handbrake, Y reset vehicle.

## Checklist

- [ ] Every gameplay action has a gamepad, keyboard/mouse and touch binding, all calling one function.
- [ ] Prompts and layout follow `UserInputService.PreferredInput` and swap within one frame of a device change.
- [ ] No UI text says Click, Tap or a key letter while the preferred input is Gamepad; glyphs come from `GetImageForKeyCode`.
- [ ] Every menu, popup and shop opens with a button and selects a default button on open.
- [ ] B closes the top menu and restores the previous focus; closing the last menu sets `SelectedObject = nil`.
- [ ] Modal popups use a `Stop` selection group on all four sides.
- [ ] No destructive or Robux button is the default focus; those use hold-to-confirm.
- [ ] Key actions take at most 2 presses from gameplay.
- [ ] Every task can be finished without the virtual cursor.
- [ ] One shared `SelectionImageObject` ring is used; the selected item is obvious on a TV screenshot.
- [ ] Every hover behavior also runs on `SelectionGained`.
- [ ] On a Large display: body text ≥ 28 px, buttons ≥ 72 px tall, ≥ 16 px between selectables.
- [ ] All text and selectables sit inside the 5% TV-safe margin on a ten-foot interface.
- [ ] HUD ScreenGuis use `CoreUISafeInsets`; nothing hides under the Roblox top bar.
- [ ] Thumbstick1, Thumbstick2, gameplay ButtonA and ButtonStart keep their default roles.
- [ ] Analog triggers use `Position.Z`; custom stick reads use a 0.18 radial dead zone.
- [ ] Every haptic pulse is ≤ 0.3 s and ≤ 0.6 strength, always stops, and has a Settings toggle.
- [ ] Chat window hidden on ten-foot interfaces; quick chat or emotes offered.
- [ ] No feature needs typing; codes and names have a no-keyboard path.
- [ ] Off-platform links and paid random items are gated by `PolicyService`, failing closed.
- [ ] Maturity questionnaire done; the owner has been asked to tick Console in Playable Devices.
- [ ] A controller pass report exists in `reports/` for this build, made with the Controller Emulator on a console device.
- [ ] The owner has confirmed the game on a real controller before ship.

## Sources

[1] Input overview and PreferredInput (Creator Docs) — https://create.roblox.com/docs/input
[2] PreferredInput enum (Creator Docs) — https://create.roblox.com/docs/reference/engine/enums/PreferredInput.md
[3] [Full Release] Introducing PreferredInput and Improved Touch Capabilities (DevForum) — https://devforum.roblox.com/t/full-release-introducing-preferredinput-and-improved-touch-capabilities/3750890
[4] UserInputService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/UserInputService
[5] Input Action System guide (Creator Docs) — https://create.roblox.com/docs/input/input-action-system
[6] InputBinding reference: UIButton, UIModifier (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/InputBinding
[7] InputAction reference: contexts, Pressed, Released, StateChanged (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/InputAction.md
[8] [Full Release] Input Action System (IAS) & Newly Converted Player Scripts (DevForum) — https://devforum.roblox.com/t/full-release-input-action-system-ias-newly-converted-player-scripts/4678416
[9] [Client Beta] Input Action System is now available to publish in experiences (DevForum) — https://devforum.roblox.com/t/client-beta-input-action-system-is-now-available-to-publish-in-experiences/3890979
[10] [Studio Beta] No-code Hotkey Hints With InputActionLabel (DevForum) — https://devforum.roblox.com/t/studio-beta-no-code-hotkey-hints-with-inputactionlabel/4779420
[11] InputActionLabel reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/InputActionLabel
[12] Gamepad input: default scheme, trigger pressure (Creator Docs) — https://create.roblox.com/docs/input/gamepad
[13] Micro gamepad and TV remotes (Creator Docs) — https://create.roblox.com/docs/input/micro-gamepad
[14] Controller Emulator (Creator Docs) — https://create.roblox.com/docs/studio/controller-emulator
[15] UserInputService:GetImageForKeyCode (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/UserInputService/GetImageForKeyCode
[16] GamepadType enum (Creator Docs) — https://create.roblox.com/docs/reference/engine/enums/GamepadType
[17] ContextActionService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/ContextActionService
[18] GuiObject reference: Selectable, NextSelection, SelectionImageObject (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/GuiObject
[19] GuiBase2d.SelectionGroup and SelectionBehavior (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/GuiBase2d/SelectionGroup
[20] GuiService reference: SelectedObject, IsTenFootInterface, ViewportDisplaySize, MenuIsOpen (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/GuiService
[21] New Gamepad UI Selection APIs: GuiService:Select, SelectionOrder (DevForum) — https://devforum.roblox.com/t/new-gamepad-ui-selection-apis/1791278
[22] GamepadService: virtual cursor (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/GamepadService
[23] HapticService reference (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/classes/HapticService
[24] HapticEffect reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/HapticEffect
[25] [Studio Beta] Introducing New Haptics Effects and APIs (DevForum) — https://devforum.roblox.com/t/3606858
[26] Console development guidelines (Creator Docs) — https://create.roblox.com/docs/production/publishing/console-guidelines
[27] Update Xbox Guidelines - 2023, staff reply on Console Guidelines (DevForum) — https://devforum.roblox.com/t/update-xbox-guidelines-2023/2398716
[28] Xbox guidelines, legacy (Creator Docs) — https://create.roblox.com/docs/production/publishing/xbox-guidelines
[29] Proximity prompts guide (Creator Docs) — https://create.roblox.com/docs/ui/proximity-prompts
[30] ProximityPromptInputType enum (Creator Docs) — https://create.roblox.com/docs/reference/engine/enums/ProximityPromptInputType.md
[31] ScreenInsets enum (Creator Docs) — https://create.roblox.com/docs/en-us/reference/engine/enums/ScreenInsets.md
[32] ScreenGui.ScreenInsets TopbarSafeInsets is incorrect on Consoles (DevForum) — https://devforum.roblox.com/t/screenguiscreeninsets-topbarsafeinsets-is-incorrect-on-consoles/4111410
[33] PolicyService reference (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/PolicyService.md
[34] Experience guidelines and content maturity (Creator Docs) — https://create.roblox.com/docs/en-us/production/promotion/experience-guidelines
[35] Updating Age Requirements for Experiences with 'Restricted' Content Maturity Label (DevForum) — https://devforum.roblox.com/t/updating-age-requirements-for-experiences-with-%E2%80%98restricted%E2%80%99-content-maturity-label/3905863
[36] Important Updates: Unrated Experiences and Changes to Experience Pages (DevForum) — https://devforum.roblox.com/t/important-updates-unrated-experiences-and-changes-to-experience-pages/3899317
[37] Experience settings: Playable Devices (Creator Docs) — https://create.roblox.com/docs/en-us/studio/experience-settings
[38] Roblox is finally coming to PlayStation in October (Engadget) — https://www.engadget.com/roblox-is-finally-coming-to-playstation-in-october-190256770.html
[39] What Parents Need To Know About Roblox: supported platforms (ESRB) — https://www.esrb.org/blog/what-parents-need-to-know-about-roblox-2/
[40] TextBox reference: gamepad focus, on-screen keyboard (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/TextBox.md
[41] Is it possible to lower / limit Gamepad Camera Sensitivity? (DevForum) — https://devforum.roblox.com/t/is-it-possible-to-lower-limit-gamepad-camera-sensitivity/3745950
[42] How to disable console triggers throttling vehicle? (DevForum) — https://devforum.roblox.com/t/2570070
[43] Device Detection - API & Enums feature request (DevForum) — https://devforum.roblox.com/t/device-detection-api-enums/3893333
[44] Best practice for :GetLastInputType() (DevForum) — https://devforum.roblox.com/t/best-practice-for-getlastinputtype/300012
[45] GuiService.PreferredTextSize (Creator Docs) — https://create.roblox.com/docs/reference/engine/classes/GuiService/PreferredTextSize
[46] How Can I Detect Player Console? (DevForum) — https://devforum.roblox.com/t/how-can-i-detect-player-console/947286
[47] Designing a 10ft UI (Pascal Potvin) — https://pascalpotvin.medium.com/designing-a-10ft-ui-ae2ca0da08b7
[48] Fire TV design and user experience guidelines (Amazon Developer) — https://www.developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html
[49] UserGameSettings reference (Roblox API reference) — https://developer.roblox.com/api-reference/class/UserGameSettings
[50] Paid random items (Creator Docs) — https://create.roblox.com/docs/en-us/production/monetization/paid-random-items.md

Related: [[00 Start Here]] · [[05 UI and HUD]] · [[08 Mobile]] · [[01 The First Five Minutes]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[17 Security and Anti-Cheat]] · [[11 Thumbnails, Icons and the Store Page]]
