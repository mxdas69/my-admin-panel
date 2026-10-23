---
tags: [vault, assets]
read_by: [librarian, builder, scenic, frame, architect, reviewer, playtest, splash]
---

# 07 Characters, VFX and Assets

Animation, effects and sound are where a game's feel lives: the same mechanic reads as dull or exciting depending on them ([[02 The Core Loop]]). Assets are also the most common way unsafe code gets into a place, through free models carrying hidden scripts. Librarian owns `ReplicatedStorage.Assets` and `ServerStorage.Assets`; everyone who inserts, animates or plays effects follows this page.

## Animations

- Play through the `Animator` inside the Humanoid (or AnimationController): `animator:LoadAnimation(animation)` returns an `AnimationTrack`. Load each Animation once per character and reuse the track; don't call `LoadAnimation` on every attack.
- An animation only plays in an experience if it is owned by the experience's owner (the same user or group) or by Roblox. For a group-owned game, publish animations to the group.
- Animations played on the local player's character from a LocalScript replicate to everyone. NPC animations play from the server, or from each client for purely cosmetic NPCs.
- Use animation events (markers set in the Animation Editor) with `track:GetMarkerReachedSignal("Hit")` to sync sounds and VFX to a frame. Damage is still decided on the server.
- To replace default walk/run/idle, copy the `Animate` LocalScript from a running character into `StarterPlayer.StarterCharacterScripts` and change the `AnimationId` values of its children (for example `walk > WalkAnim`).
- NPCs: build rigs with the Rig Builder (Avatar tab), or from an avatar with `Players:CreateHumanoidModelFromDescription(description, Enum.HumanoidRigType.R15)` on the server.

| Priority (low to high; higher overrides lower on the joints it animates) | Use for |
|---|---|
| `Core` | Base layers that anything should override |
| `Idle` | Idle replacements |
| `Movement` | Walk, run, swim, climb replacements |
| `Action`, `Action2`-`Action4` | Attacks, emotes, tool use; higher ones override lower ones |

```lua
-- LocalScript (StarterPlayerScripts): cache tracks per character
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ANIMS = ReplicatedStorage.Assets.Animations -- Animation instances with AnimationId set
local tracks: {[string]: AnimationTrack} = {}

local function loadTracks(character: Model)
	table.clear(tracks)
	local animator = character:WaitForChild("Humanoid"):WaitForChild("Animator") :: Animator
	for _, anim in ANIMS:GetChildren() do
		if anim:IsA("Animation") then
			local track = animator:LoadAnimation(anim)
			track.Priority = Enum.AnimationPriority.Action
			tracks[anim.Name] = track
		end
	end
end

local player = Players.LocalPlayer
player.CharacterAdded:Connect(loadTracks)
if player.Character then loadTracks(player.Character) end

local function play(name: string)
	local track = tracks[name]
	if track then track:Play(0.05) end -- fadeTime; optional weight and speed follow
end
```

## VFX

- **ParticleEmitter:** `Emit(n)` for bursts (hits, pickups, level-ups), `Rate` for ambience (fire, sparkles). Shape the look with `Size`, `Transparency` and `Color` sequences that fade out instead of popping; `LightEmission` 1 for glowing magic, 0 for smoke and dust; `LightInfluence` 0 for effects that should glow in the dark. Keep rates and lifetimes modest on mobile.
- **Beam:** between `Attachment0` and `Attachment1`; `CurveSize0/1` for arcs, `TextureSpeed` for flow, `FaceCamera` for flat textures. Lasers, tethers, guidance lines.
- **Trail:** two Attachments on a moving part; a short `Lifetime` (often 0.2-0.5 s) for sword swings; enable only during the swing.
- **Attachments:** the anchor points for all of the above, plus lights and sounds. Name them (`HitPoint`, `Muzzle`) so code can find them.
- **Highlight:** hover, selection and hit flashes. Clients render at most 31 at once. `DepthMode = AlwaysOnTop` shows through walls, good for objectives and bad for hidden enemies.
- **PointLight:** small `Range` glows on pickups and rare items; avoid shadows on many of them.

Spawn cosmetic effects on clients, not the server: the server sends `Remotes.PlayVFX:FireAllClients("CoinBurst", cframe)`, and each client clones a template.

```lua
-- Client: each VFX template is an anchored, invisible Part (CanCollide/CanTouch/CanQuery off) holding emitters
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local VFX = ReplicatedStorage.Assets.VFX

ReplicatedStorage.Remotes.PlayVFX.OnClientEvent:Connect(function(name: string, cf: CFrame)
	local template = VFX:FindFirstChild(name)
	if not template then return end
	local holder = template:Clone() :: BasePart
	holder.CFrame = cf
	holder.Parent = workspace
	local longest = 0
	for _, e in holder:GetDescendants() do
		if e:IsA("ParticleEmitter") then
			e:Emit(e:GetAttribute("EmitCount") or 20)
			longest = math.max(longest, e.Lifetime.Max)
		end
	end
	task.delay(longest + 0.1, holder.Destroy, holder)
end)
```

## Sounds

- Create SoundGroups in `SoundService` (Music, SFX, UI, Ambient) and set every Sound's `SoundGroup`. A settings toggle sets `SoundGroup.Volume` on the client, which affects only that player.
- **Positional** sounds are parented to a Part or Attachment. `RollOffMode` `Inverse` (the default) sounds natural; `Linear` with a set `RollOffMaxDistance` gives a predictable cutoff for gameplay cues. Tune `RollOffMinDistance` so nearby sounds are full volume.
- **Non-positional** sounds (music, UI) live in `SoundService` or the GUI. UI clicks play with `SoundService:PlayLocalSound(sound)` on the client.
- Vary `PlaybackSpeed` slightly on repeated sounds. Keep music quieter than gameplay sounds, and preload key sounds with `ContentProvider:PreloadAsync`.
- Use audio you uploaded, audio shared with the experience, or audio Roblox provides free in the Creator Store. Audio the experience can't access won't play.

## Creator Store and free model safety

Free models are a common source of backdoors: hidden scripts that give a stranger admin, prompt purchases of their items, teleport players away, or load more code later.

- Prefer assets from Roblox or from creators with a verified badge, and prefer assets with no scripts. Studio may flag models that contain scripts; treat that as a hint, never a guarantee.
- Inserting in edit mode doesn't run scripts; Play and publishing do. Scan right after inserting, before any playtest.
- Insert into `ServerStorage.Assets.Quarantine`, set `Enabled = false` on every script inside, scan, then move what you keep into place. Default: delete every script in a decorative model and rewrite any behavior you need. Never enable HTTP requests or `LoadStringEnabled` because an asset asks for it.

| Red flag | Why it matters |
|---|---|
| `require(1234567)` (a number) | Loads a module by asset id: code you can't see, which its author can change |
| `getfenv` / `setfenv` / `loadstring` | Environment tampering and running code from strings |
| `string.char`, `string.reverse`, `\104\101` escapes, huge single lines | Obfuscation |
| `HttpService`, `TeleportService`, `InsertService`, `MarketplaceService` prompts | Network calls, teleporting players away, loading assets, selling someone else's items |
| Scripts in odd places or with odd names (in a tree, named like a Weld, blank names) | Hiding |
| `PlayerAdded` handlers in a decorative model | Admin grants and backdoors |

```lua
-- Command bar / Studio code execution: list scripts in an inserted model and flag patterns
local target = game:GetService("ServerStorage").Assets.Quarantine
local FLAGS = { "require%s*%(%s*%d", "getfenv", "setfenv", "loadstring", "string%.char", "string%.reverse",
	"\\%d%d%d", "HttpService", "TeleportService", "InsertService", "MarketplaceService", "PlayerAdded" }
for _, d in target:GetDescendants() do
	if d:IsA("LuaSourceContainer") then
		local src: string = (d :: any).Source -- readable from Studio, not from game scripts
		local hits, longest = {}, 0
		for _, pattern in FLAGS do
			if string.find(src, pattern) then table.insert(hits, pattern) end
		end
		for line in string.gmatch(src, "[^\n]+") do longest = math.max(longest, #line) end
		warn(d:GetFullName(), d.ClassName, #src .. " chars", "longest line " .. longest, table.concat(hits, ", "))
	end
end
```

A hit is a reason to read the script, not proof of malice; an unexplained hit means delete. Reviewer re-runs the scan before ship.

## Blender to Roblox pipeline

1. **Scale:** pick a convention once. Export a 1 x 1 x 1 test cube, import it, read its `Size` in Studio, and adjust Blender's unit scale or the FBX export scale until it arrives at the size you expect. Write the setting in the game's notes.
2. **Prepare:** apply all transforms, put the origin where the object should pivot (usually bottom center), name objects clearly (each becomes a MeshPart named after it), UV unwrap.
3. **Budget:** keep triangle counts low. Roblox enforces a per-mesh triangle limit (documented as 20,000 at time of writing; the importer reports it), so split big objects. Textures are capped at 1024 x 1024 and larger uploads are downscaled.
4. **Export:** FBX with selected objects only (add the Armature for rigged models and follow Roblox's rig requirements).
5. **Import:** Studio's Import 3D (Home or Avatar tab). Check the preview for warnings, scale and orientation, then import as a Model of MeshParts.
6. **Materials:** simple looks use the MeshPart's `Color` + `Material` or a `TextureID`. For PBR, add a `SurfaceAppearance` (MeshParts only) with `ColorMap`, `NormalMap`, `MetalnessMap` and `RoughnessMap`. Blender bakes OpenGL-style (Y+) normal maps; if bumps look inverted in Studio, flip the green channel.
7. **Finish:** anchor, set `CollisionFidelity` and collision flags ([[06 World and Look]]). Scripts can't change `MeshId` or SurfaceAppearance maps at runtime, so keep a template per variant and clone it.

## Keeping assets organized

```
ReplicatedStorage.Assets      (Librarian; clients can see these)
  VFX / Sounds / Animations / Models / UI
ServerStorage.Assets          (Librarian; server only)
  Maps / Enemies / Drops / Quarantine
SoundService                  Music, SFX, UI, Ambient (SoundGroups)
```

- Templates are cloned at runtime, never fetched by asset id in game code. Use PascalCase names that say what a thing is (`CoinBurst`, `SwordSwing`); tunable numbers go in Config or attributes.
- Register reusable assets with `node studio/cli.mjs asset add` so the team can find them.

## Checklist

- [ ] Every Animation is owned by the experience owner (or Roblox) and plays in a Play test
- [ ] Tracks are loaded once per character; attacks/emotes use Action priority
- [ ] VFX templates live in `ReplicatedStorage.Assets.VFX` and are spawned on clients
- [ ] No more than a handful of Highlights active at once (hard client limit: 31)
- [ ] Every Sound has a SoundGroup; music and SFX can be muted separately
- [ ] Gameplay-critical 3D sounds have a tuned RollOffMode and max distance
- [ ] Every inserted model was scanned; no unexplained scripts remain
- [ ] No `require(<number>)`, `getfenv`, `setfenv` or `loadstring` anywhere in the place
- [ ] Imported meshes arrive at the expected scale and have suitable CollisionFidelity
- [ ] Assets sit in the agreed folders with clear names and are registered in the library

## Common mistakes

- Calling `LoadAnimation` every time an attack plays.
- Animations owned by a personal account in a group game, so they silently don't play.
- Server-created particles for every coin, flooding replication.
- Free models trusted because they "look fine", with scripts never opened.
- Music louder than gameplay sounds, with no way to mute it.
- Huge, unoptimized meshes with precise collision used as background decoration.

## Related

[[00 Start Here]] · [[02 The Core Loop]] · [[05 UI and HUD]] · [[06 World and Look]] · [[08 Mobile]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]]
