---
tags: [vault, animation, cutscenes, vfx, feel]
for: [builder, scenic, frame, librarian]
also: [architect, playtest, kid-tester, splash]
---

# 18 Animation, Cutscenes and VFX

Motion is what makes a Roblox game feel expensive. A punch with anticipation, a reward that bursts and flies to the counter, and a 6-second intro that shows the goal are what players remember. Bad motion is just as visible: floaty walk cycles, unskippable 40-second cutscenes, and particle storms that drop phones to 20 FPS. This chapter is the crew's house standard. The numbers are starting points to tune in playtests. Everything here is built as real, editable assets (see the Studio rules in `CLAUDE.md`).

## Rules

1. **Every action has three beats: anticipation (0.05-0.15 s), action (fast), follow-through (0.15-0.4 s).** A swing without wind-up reads weak; a swing without follow-through reads robotic.
2. **Game feel lives in the first 100 ms.** Input → visible response within one frame on the client (animation start, sound, small camera kick). The server confirms afterwards; the client never waits for it to *look* responsive.
3. **Animations are saved assets, not code.** Make them in Studio's Animation Editor (or Blender, or a checked Toolbox asset), publish them, and keep the ids in `ReplicatedStorage.Shared.Config.Animations`. Load them once per Animator and reuse the AnimationTracks.
4. **Set priorities on purpose:** Core/Idle for idles, Movement for locomotion, Action (Action2-4 for layers) for attacks, emotes and interactions. A wrong priority is the #1 cause of "my animation doesn't play".
5. **Play animations on the client that owns the character; replication does the rest.** Never play a player's animations from the server. NPC animations play on the server (or on clients, for crowds, from a shared clock).
6. **Exaggerate for Roblox scale.** Blocky rigs need bigger poses: 20-40% more rotation than looks right in the editor, held poses on the key frames (3-5 frames), and squash on landings.
7. **Use the Animator, not the Humanoid, and fade between tracks** (0.1-0.2 s fade on Play/Stop). Hard cuts pop.
8. **Every cutscene is skippable, short and earned.** Intro under 8 s, boss reveal under 6 s, story beats under 20 s. Skip appears within 1 s (tap, B on gamepad, or Space). Never replay a seen cutscene unless asked.
9. **Cutscenes are data in the world, not hard-coded numbers.** Camera shots are named parts or Attachments in `Workspace.Cutscenes.<Name>` (Shot1, Shot2, … with Duration and EasingStyle attributes); one `CutsceneController` module plays any of them by name. The owner can move a part to reframe a shot.
10. **One camera rule: tween between shots with Sine or Quad InOut, 1-3 s per shot; cut only for impact.** Add a slight drift (2-4 studs over a shot) so held shots feel alive.
11. **During a cutscene, freeze player control, hide the HUD, add letterbox bars, and restore all three afterwards, even if it errors** (wrap in pcall and always run the cleanup).
12. **VFX are templates.** ParticleEmitters, Beams, Trails, Highlights and sounds live in `ReplicatedStorage.Assets.VFX.<Name>`; scripts clone, `:Emit(n)`, and Debris-clean them. No effect is built from code.
13. **Effects have a budget: under 300 live particles near the camera on phones, emit in bursts rather than high Rate, Lifetime 0.2-1.5 s,** and turn down by about half when the player's graphics quality is low.
14. **Rewards always fly.** A won coin, gem or item pops (scale 0 → 1.15 → 1, 0.2 s), flies to its HUD counter on a curve (0.4-0.6 s), and the counter ticks up with a bump. Rarer rewards get a bigger burst, a sound one step higher, and a short screen flash.
15. **Hits are felt, not just seen:** 0.05-0.1 s hit-stop on heavy hits, a 3-6° camera shake that decays in 0.2 s, a flash on the target (Highlight at 0.3 transparency for 0.08 s), a damage number, and a hit sound with pitch variation (±8%).
16. **UI motion is quick and never blocks input.** Button press 0.08 s down to 0.92 scale and back; windows pop 0.9 → 1 in 0.15 s (Back Out); toasts slide in 0.2 s. Respect a "reduce motion" setting by halving shakes and flashes.
17. **Consistency beats variety:** one easing family, one shake module, one reward-fly module, used by everyone.
18. **Test on a phone emulator and with a controller.** Effects must read at phone size, and cutscene skip must work on touch, keyboard and gamepad.

## Recipes

### Loading and playing animations (client)

```lua
--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local Anim = {}
local cache: { [Animator]: { [string]: AnimationTrack } } = {}

function Anim.track(character: Model, name: string): AnimationTrack?
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local animator = humanoid and humanoid:FindFirstChildOfClass("Animator")
	if not animator then return nil end
	cache[animator] = cache[animator] or {}
	local tracks = cache[animator]
	if not tracks[name] then
		local animation = Instance.new("Animation")
		animation.AnimationId = Config.Animations[name]
		tracks[name] = animator:LoadAnimation(animation)
		animator.Destroying:Once(function() cache[animator] = nil end)
	end
	return tracks[name]
end

function Anim.play(name: string, fade: number?, speed: number?)
	local character = Players.LocalPlayer.Character
	local track = character and Anim.track(character, name)
	if track then track:Play(fade or 0.12, 1, speed or 1) end
	return track
end

return Anim
```

Use `track:GetMarkerReachedSignal("Hit")` for the exact frame a hit lands, instead of guessing with `task.wait`.

### Cutscene controller (client)

```lua
--!strict
local TweenService = game:GetService("TweenService")
local camera = workspace.CurrentCamera

local Cutscene = {}

function Cutscene.play(name: string, onSkip: (() -> ())?)
	local folder = workspace:WaitForChild("Cutscenes"):FindFirstChild(name)
	if not folder then return end
	local shots = folder:GetChildren()
	table.sort(shots, function(a, b) return a.Name < b.Name end)

	local skipped = false
	local oldType = camera.CameraType
	camera.CameraType = Enum.CameraType.Scriptable
	-- Hide the HUD, freeze controls and show the letterbox + Skip button here (UI module).
	local ok, err = pcall(function()
		for _, shot in shots do
			if skipped then break end
			local part = shot :: BasePart
			local duration = (part:GetAttribute("Duration") :: number?) or 2
			local tween = TweenService:Create(camera, TweenInfo.new(duration, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), { CFrame = part.CFrame })
			tween:Play()
			tween.Completed:Wait()
		end
	end)
	camera.CameraType = oldType
	-- Always restore HUD, controls and letterbox, even after an error.
	if not ok then warn("Cutscene", name, err) end
	if onSkip and skipped then onSkip() end
end

return Cutscene
```

Bind Skip with ContextActionService (tap button, `ButtonB`, `Space`) and set `skipped = true`; save "seen" in the player's data so it never replays.

### Reward fly-to-counter (client)

Clone the icon from `StarterGui.Templates.RewardIcon`, place it at the reward's screen position (`camera:WorldToViewportPoint`), tween Size up (0.12 s, Back Out), then tween Position to the counter's AbsolutePosition (0.5 s, Quad In) while shrinking, then bump the counter (scale 1 → 1.15 → 1) and tick the number up over 0.3 s.

### A VFX burst

```lua
local function burst(templateName: string, at: CFrame, count: number?)
	local fx = ReplicatedStorage.Assets.VFX[templateName]:Clone()
	fx:PivotTo(at)
	fx.Parent = workspace.Effects
	for _, emitter in fx:GetDescendants() do
		if emitter:IsA("ParticleEmitter") then emitter:Emit(count or emitter:GetAttribute("Burst") or 20) end
	end
	game:GetService("Debris"):AddItem(fx, 3)
end
```

## Where to get animations and effects

- **Studio's Animation Editor** for game-specific moves (attacks, emotes, interactions). Moon Animator is a popular alternative if the owner has it.
- **Blender** (optional, when connected) for complex rigs, props and VFX meshes; export FBX and import with the 3D Importer.
- **Toolbox / Creator Store** for base animations and effect packs, after the virus check in `CLAUDE.md`. Roblox's own animation packs and the default character animations are safe starting points.
- Never depend on any one of these: the game must work with simple Studio-made animations first.

## Checklist

- [ ] Every animation is a published asset with its id in `Config.Animations`; tracks are loaded once and reused
- [ ] Priorities set (Idle/Movement/Action); no track fights another
- [ ] Attacks and key actions have anticipation, action and follow-through, and respond within one frame on input
- [ ] Every cutscene is under its time limit, skippable within 1 s on touch, keyboard and gamepad, and never replays once seen
- [ ] Cutscene shots are parts/attachments in `Workspace.Cutscenes`; HUD, controls and camera always restore, even on error
- [ ] All VFX are templates in `ReplicatedStorage.Assets.VFX`, cleaned up with Debris, under the particle budget on the phone emulator
- [ ] Rewards pop, fly to their counter and tick it up; rarer rewards feel bigger
- [ ] Heavy hits have hit-stop, a short shake, a flash, a number and a varied sound; "reduce motion" halves shakes and flashes
- [ ] Checked in the Device Emulator (small phone and console) with a playtest
