---
tags: [vault, onboarding]
read_by: [lead, pulse, architect, builder, frame, scenic, librarian, balance, kid-tester, playtest, producer, liveops]
---

# 01 The First Five Minutes

New players decide whether to stay almost immediately, usually before they read anything. Leaving costs one tap and another experience is one tap away, so the opening must hand over control, an action, a reward and a clear next goal before boredom or confusion sets in. Design this stretch first, test it more than anything else, and rebuild it whenever [[02 The Core Loop]] changes. Nothing later in the game matters to a player who left in minute one.

## Target timeline

Starting targets for a first-time player on a phone. They are rules of thumb to tune with playtests and the onboarding funnel, not measurements.

| Time after spawn | What should already have happened |
|---|---|
| 0-5 s | Player has control, the world is visible, nothing modal is on screen |
| 5-15 s | First meaningful action (collect, hit, jump, place, roll) with one input |
| 15-30 s | First reward: a number goes up with a sound and a visual pop |
| 30-90 s | First small goal ("Collect 10 coins") completed and celebrated |
| 1-3 min | First upgrade bought, and the player can see what it changed |
| 3-5 min | Next goal visible, plus a locked zone/item/tier teasing what comes later |

## Rules

1. **Spawn facing the action.** Rotate the SpawnLocation so its front face points at the first objective; the camera starts behind the character, so the player looks where the spawn faces. Keep the first interactable on screen and close (a common starting point is within 20-30 studs).
2. **Nothing blocks the start.** No "Play" button, settings screen, update log, daily reward or shop/offer popup on first join. Defer daily rewards and offers until after the first upgrade ([[09 Shops and Monetization]], [[10 Retention and Social]]). Keep any custom loading screen short and skippable.
3. **One objective at a time.** One line of roughly six words or fewer, an icon and a progress counter: `Collect coins 3/10`. Replace it the moment it is done.
4. **Show, don't tell.** Point with a Beam, a bobbing arrow, a Highlight or a glowing floor path. Text is a backup, never the main instruction.
5. **The first action cannot fail.** No enemies, timers or missable jumps in the first 30 seconds. Obbies open with wide platforms and short gaps.
6. **Reward fast and loud.** The first reward gets a sound, a particle burst, a counter pop and a floating `+5` (juice patterns in [[02 The Core Loop]]).
7. **Give an early win.** Tune the first goal to finish in under a minute and celebrate it (sound, confetti burst, toast).
8. **First upgrade within a couple of minutes.** Price it in Config so the first goal's reward roughly pays for it ([[04 Progression and Economy]]). The upgrade must visibly change the action: bigger tool, faster swing, bigger numbers.
9. **Mobile first.** Every step works with one thumb: big buttons, ProximityPrompts or touch-to-collect, no "Press E" without a touch equivalent ([[08 Mobile]]).
10. **Returning players skip it.** Save the tutorial step with the player's data; when it is complete, hide tutorial guidance and text.
11. **Survive respawns.** Tutorial progress lives on the server, never in a ScreenGui that resets; client guidance rebuilds on `CharacterAdded`.

## Guidance instead of text

- **Beam to the target:** client-side, from an Attachment in the HumanoidRootPart to an Attachment on the goal, animated with `TextureSpeed`.
- **Highlight the target:** low `FillTransparency`, bright `OutlineColor`. Clients render at most 31 Highlights at once, so highlight the current goal only.
- **Floating arrow:** a BillboardGui with an arrow ImageLabel above the goal, bobbing with TweenService.
- **Paths:** a bright floor strip or a line of coins leading to the goal is direction and reward at once.
- **Keep the camera with the player.** At most a short pan (a few seconds) on first join, never a long cutscene.

```lua
-- StarterPlayerScripts/Guide.client.lua: point at whatever part the server says is the current goal
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local current: {Instance} = {}

local function clear()
	for _, inst in current do inst:Destroy() end
	table.clear(current)
end

local function pointTo(target: BasePart)
	clear()
	local character = player.Character or player.CharacterAdded:Wait()
	local root = character:WaitForChild("HumanoidRootPart") :: BasePart

	local fromAtt = Instance.new("Attachment")
	fromAtt.Parent = root
	local toAtt = Instance.new("Attachment")
	toAtt.Parent = target

	local beam = Instance.new("Beam")
	beam.Attachment0 = fromAtt
	beam.Attachment1 = toAtt
	beam.FaceCamera = true
	beam.Width0, beam.Width1 = 0.8, 0.8
	beam.LightEmission = 1
	beam.Color = ColorSequence.new(Color3.fromRGB(255, 215, 60))
	-- beam.Texture = "rbxassetid://<your arrow texture>"; beam.TextureSpeed = 1
	beam.Parent = root

	local highlight = Instance.new("Highlight")
	highlight.FillTransparency = 0.7
	highlight.OutlineColor = Color3.fromRGB(255, 215, 60)
	highlight.Parent = target -- with no Adornee, a Highlight adorns its parent

	table.insert(current, beam)
	table.insert(current, highlight)
	table.insert(current, fromAtt)
	table.insert(current, toAtt)
end
```

The server owns the step. Expose it as a player attribute (`player:SetAttribute("TutorialStep", 3)`); the client listens with `player:GetAttributeChangedSignal("TutorialStep")`, looks up the target part for that step, calls `pointTo`, and calls it again from `CharacterAdded` after a respawn.

## Measuring it: the onboarding funnel

```lua
-- ServerScriptService/Onboarding (ModuleScript). Call Onboarding.reach(player, n) from game systems.
local AnalyticsService = game:GetService("AnalyticsService")

local STEP_NAMES = { "Spawned", "FirstCollect", "FirstGoal", "FirstUpgrade", "SecondZone" }
local Onboarding = {}

function Onboarding.reach(player: Player, step: number)
	local last = player:GetAttribute("TutorialStep") or 0 -- loaded from saved data on join
	if step ~= last + 1 then return end -- advance strictly in order
	player:SetAttribute("TutorialStep", step) -- also write it into the save data
	AnalyticsService:LogOnboardingFunnelStepEvent(player, step, STEP_NAMES[step])
end

return Onboarding
```

- Log from the server only. Number steps from 1 with no gaps, and log step 1 the moment the player spawns so every later drop-off is relative to everyone who arrived.
- Roblox treats the onboarding funnel as a one-time funnel per player, so it describes new players. Design steps every new player passes in order.
- Keep it short: a handful of steps covering the first minutes. Other funnels (shop flow, a quest chain) use `LogFunnelStepEvent`.
- Read it in the Creator Hub analytics (Funnels). Fix the step with the biggest drop first, then re-measure.
- Pair it with playtests: the playtest agent records the timestamp of each step and compares against the timeline above.

## What a new 10-year-old player notices

Use this list in kid-tester reviews and when choosing what to polish first.

- Whether pressing something did anything, instantly. Silence reads as "broken".
- Big numbers going up, sparkles, sounds, rarity colors, pets, glowing things.
- Bright objects that look tappable; they tap them before reading anything.
- Other players with cooler stuff. Visible progress (bigger tools, pets following, auras) creates goals by itself.
- Failing or dying in the first minute; repeated early failure is a reason to leave.
- A shop that opens by itself, which feels pushy.
- What they skip or miss: paragraphs, lore, settings, small text, keyboard hints, anything tucked in the corners.

## Checklist

- [ ] Spawn faces the first objective, and no GUI covers the screen after spawning
- [ ] First action is possible with one tap within ~15 s in the Device Emulator (phone preset)
- [ ] First reward has a sound, particles, a counter pop and a floating number
- [ ] Exactly one objective is shown: short text, icon, progress counter
- [ ] Beam/arrow/Highlight points at the current objective and moves on when it changes
- [ ] Guidance rebuilds after the character dies or resets mid-tutorial
- [ ] First goal completes in under ~1 minute for a new player
- [ ] First upgrade is affordable within ~2 minutes and its effect is visible
- [ ] No daily reward, shop or offer popup appears before the first upgrade
- [ ] `LogOnboardingFunnelStepEvent` fires from the server for every step, in order, starting at 1
- [ ] A returning player (step loaded from saved data) skips the tutorial entirely

## Common mistakes

- Opening with a menu, a "Play" button, an update log or a wall of rules.
- Several objectives, quest lists or long NPC dialogue at once.
- Instructions only as text, or keyboard-only hints on mobile.
- First upgrade priced for minute ten instead of minute two.
- Tutorial state kept in a `ResetOnSpawn` ScreenGui, so it restarts on death.
- Spawning players in a dark lobby, facing a wall, or behind other players' bases.
- Funnel steps logged from the client, out of order, or with gaps.
- Showing the whole shop and upgrade tree on first join.
- Testing only on desktop with a mouse and keyboard.

## Related

[[00 Start Here]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[06 World and Look]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[13 Building It Right]]
