---
tags: [vault, world]
read_by: [lead, scenic, builder, librarian, splash, kid-tester, playtest, reviewer]
---

# 06 World and Look

The world is the first thing a player sees, and thumbnails are usually pictures of it. A readable world tells players where to go and what they can touch without a word of text; a good-looking one makes them want to explore and return. It also has to run on low-end phones, so every visual choice is weighed against part counts, lights and physics. Scenic owns `Workspace.Map`, `Terrain` and `Lighting`.

## Readability rules

- Walkable surfaces contrast with walls, void and hazards. Floor vs not-floor must be obvious at a glance.
- One visual language for interactables across the game, e.g. accent gold = buy/collect, green = go/safe, red = danger. Never use the danger color as decoration.
- Reserve Neon and strong glow for things that matter: gates, buttons, objectives, rare drops. If everything glows, nothing does.
- Keep paths visually quiet: decorative detail goes at the edges and up high, not where players walk.
- Key buildings (shop, sell pad, gate, portal) have recognizable silhouettes and a big icon sign (BillboardGui or SurfaceGui) readable from a distance.

## Landmarks and sightlines

- From spawn the player sees the 2-3 places that matter: the first objective, the shop/sell area and the gate to the next zone ([[01 The First Five Minutes]]).
- Each zone gets one tall, unique landmark visible from afar (tower, giant tree, volcano, statue).
- Prefer hub-and-spoke: a central hub with clear paths out to zones. No mazes in hubs.
- Keep sightlines open along main paths; put tall objects to the sides.
- The next zone is visible (through a gate, over a wall, across water) before it is affordable.

## Character scale

The default Roblox avatar is about 5 studs tall. Default Humanoid values: `WalkSpeed` 16 studs/s and `JumpHeight` 7.2 studs with `Workspace.Gravity` 196.2. From those numbers a running jump covers roughly 8 studs on flat ground (back-of-envelope physics; always test the real jump).

Starting dimensions (rules of thumb, not standards):

| Element | Starting size |
|---|---|
| Doorway | at least 6 wide x 9-10 tall |
| Main path | 12-20 wide for multiplayer traffic |
| Corridor | at least 10 wide |
| Interior ceiling | 12-16+ tall so the third-person camera doesn't clip |
| Railing / low wall | about 3 tall |
| Beginner obby gap | 5-6 studs or less, platforms at least 4 x 4 |
| Interactable pad or button | at least 4 x 4 footprint, raised or glowing |

Avatar sizes vary, so leave margins. Walk every space in Play mode with the camera zoomed in and out.

## Path guidance

- Light leads: the goal is brighter or warmer than its surroundings.
- Breadcrumbs: coins, lamps, footprints or arrows along the path.
- Leading lines: fences, rivers, road edges and rooflines pointing at the goal.
- Gates show their cost or requirement on a large sign, look locked while locked (barrier, lock icon), and play an effect when they open.
- The active objective also gets a Beam/arrow from the client ([[01 The First Five Minutes]]).

## Zones that match progression

- One zone per progression tier, each with a new palette, landmark and music track, and bigger rewards. Crossing a gate should feel like leveling up.
- Gate costs and zone multipliers come from Config ([[04 Progression and Economy]]); the world never hard-codes prices.
- Later zones look more impressive (richer color, more effects, bigger landmarks) so they read as higher level.
- Early zones stay useful (quests, eggs, the social hub) so the map never feels abandoned.

## Color palettes

Per zone: 2-3 base colors, 1 secondary, plus the game-wide accent reserved for interactables. Bright, friendly palettes suit most Roblox audiences, but avoid near-white surfaces under strong light (they bloom out) and huge areas of fully saturated color (tiring, and interactables stop standing out). Set colors with `Color3.fromHex`.

| Zone mood | Base | Secondary | Accent (all zones) |
|---|---|---|---|
| Meadow (start) | `#7BC950`, `#E8D9A8` | `#5A9BD8` | `#FFC400` |
| Desert | `#E3B873`, `#C98B4A` | `#7FB3C9` | `#FFC400` |
| Snow | `#DDE8F2`, `#9FC3E0` | `#5B6F8A` | `#FFC400` |
| Lava | `#3A2A2A`, `#6B3B2B` | `#FF6A2B` | `#FFC400` |

## Lighting setup

- **Technology:** `ShadowMap` (sun shadows, cheaper local lights) is a solid default for large bright worlds that must run on phones; `Future` (shadows and better falloff from local lights) suits interiors, night maps and showcases. Roblox lowers lighting quality on weaker devices, but still test on a phone. Prefer these two over the older modes. `Technology` is set in edit mode; game scripts can't change it at runtime.
- **Brightness / ClockTime / Ambient:** `Ambient` tints areas the sky can't reach and `OutdoorAmbient` tints outdoor shadow; keep both above black but not so high that shading goes flat.
- **EnvironmentDiffuseScale / EnvironmentSpecularScale:** set to 1 so the Sky lights the scene and reflects on PBR materials.
- **Atmosphere** (depth and haze), **ColorCorrectionEffect** (saturation, contrast, tint), **BloomEffect** (glow on bright pixels), **SunRaysEffect** (light shafts) and a **Sky** complete the look.

```lua
-- Edit mode (command bar or Studio code execution): a bright-day starting preset
local Lighting = game:GetService("Lighting")
Lighting.Technology = Enum.Technology.ShadowMap
Lighting.ClockTime, Lighting.Brightness = 14, 2
Lighting.EnvironmentDiffuseScale, Lighting.EnvironmentSpecularScale = 1, 1
Lighting.OutdoorAmbient = Color3.fromRGB(128, 128, 140)

local function apply(className: string, props: {[string]: any})
	local inst = Lighting:FindFirstChildOfClass(className)
	local isNew = inst == nil
	inst = inst or Instance.new(className)
	for key, value in props do (inst :: any)[key] = value end
	if isNew then inst.Parent = Lighting end -- parent last
end

apply("Sky", {})
apply("Atmosphere", { Density = 0.3, Offset = 0.25, Haze = 1, Glare = 0, Color = Color3.fromRGB(199, 215, 240) })
apply("ColorCorrectionEffect", { Saturation = 0.15, Contrast = 0.05 })
apply("BloomEffect", { Intensity = 0.6, Size = 24, Threshold = 1.5 })
apply("SunRaysEffect", { Intensity = 0.08, Spread = 0.8 })
```

| Mood | ClockTime | Brightness | Atmosphere | ColorCorrection |
|---|---|---|---|---|
| Bright day | 13-15 | 2-3 | Density ~0.3 | Saturation +0.1 to +0.2 |
| Golden evening | 17-17.8 | 1.5-2 | Density ~0.35, warm Color | Warm TintColor |
| Spooky night | 0-2 | 0.5-1 | Density 0.4-0.5, Haze ~2 | Saturation -0.2, cool TintColor |

## Terrain basics

- Terrain is voxels on a 4-stud grid; fills snap to it. Use the Terrain Editor (Generate, Fill, Sculpt, Smooth, Paint, Sea Level) for natural ground, hills, water and caves.
- Use parts or meshes for crisp gameplay geometry (obby platforms, buttons, buildings); terrain for ground and nature.
- Players swim in terrain water. Tune `Terrain.WaterColor`, `WaterTransparency`, `WaterWaveSize`, `WaterWaveSpeed`.

```lua
-- Edit mode: block out ground, a rock and a pond, then tint the grass
local terrain = workspace.Terrain
terrain:FillBlock(CFrame.new(0, -4, 0), Vector3.new(512, 8, 512), Enum.Material.Grass)
terrain:FillBall(Vector3.new(60, 0, 40), 24, Enum.Material.Rock)
terrain:FillBlock(CFrame.new(-80, -2, 0), Vector3.new(64, 4, 64), Enum.Material.Water)
terrain:SetMaterialColor(Enum.Material.Grass, Color3.fromHex("#7BC950"))
```

## Performance

- **Anchor everything static.** Unanchored parts simulate physics, can fall or drift, and cost server and network time.
- **Turn off what you don't use:** `CanCollide` off for decor players never touch, `CanTouch` off unless a script uses `Touched`, `CanQuery` off for decor raycasts should ignore (only possible when `CanCollide` is off), `CastShadow` off on tiny detail.
- **CollisionFidelity** on MeshParts: `Box` for small decor, `Hull` for props, `Default`/`PreciseConvexDecomposition` only for complex walkable shapes. Set it in edit mode; game scripts can't change it at runtime.
- **Fewer, bigger, reused pieces:** merge detail into meshes, reuse the same mesh and material instead of many unique ones, prefer MeshParts over complex unions.
- **Lights:** keep shadow-casting local lights few; fake rows of lamps with Neon parts.
- **Transparency:** many overlapping transparent surfaces (glass, water planes, stacked particles) are expensive.
- **StreamingEnabled** (on by default in new places): keep it on for big maps. Client code must not assume a part exists; use `WaitForChild` with a timeout or CollectionService tags with `GetInstanceAddedSignal`. Set `Model.ModelStreamingMode` to `Atomic` for models that must arrive whole and `Persistent` only for the few the client always needs. Before moving a player far, call `player:RequestStreamAroundAsync(position)` on the server.
- **Measure:** Developer Console (F9) for memory and network, MicroProfiler (Ctrl+F6 in a running client) for frame time; test on a phone where possible ([[08 Mobile]]).

```lua
-- Command bar: count parts and find loose unanchored ones
local total, loose = 0, 0
for _, d in workspace:GetDescendants() do
	if d:IsA("BasePart") and not d:IsA("Terrain") then
		total += 1
		if not d.Anchored and #d:GetJoints() == 0 then
			loose += 1
			warn("Unanchored with no joints:", d:GetFullName())
		end
	end
end
print("BaseParts:", total, "loose unanchored:", loose)
```

## Checklist

- [ ] From spawn, the first objective, shop/sell area and next gate are visible
- [ ] Each zone has a unique landmark, palette and gate sign showing its cost from Config
- [ ] Interactables use the game-wide accent color; Neon is reserved for things that matter
- [ ] Doorways, paths and ceilings pass a walk-through with the camera zoomed in
- [ ] Beginner gaps are jumpable at default WalkSpeed/JumpHeight (tested, not assumed)
- [ ] Lighting uses ShadowMap or Future, with Atmosphere, ColorCorrection, Bloom, SunRays and a Sky
- [ ] The part audit reports no loose unanchored parts in `Workspace.Map`
- [ ] Decorative meshes use Box/Hull collision and have CanTouch/CanCollide off where possible
- [ ] StreamingEnabled is on and client scripts survive parts streaming in and out
- [ ] Frame time and memory checked on a phone-class device or the Device Emulator

## Common mistakes

- A flat, evenly lit, single-color map where nothing stands out.
- Spawning players in an enclosed lobby that hides the game.
- Everything glowing, or decorative red that reads as danger.
- Rooms built at real-world proportions, so the camera clips and avatars get stuck.
- Thousands of tiny unanchored or colliding parts from free models ([[07 Characters, VFX and Assets]]).
- Future lighting with dozens of shadowed lights, never tested on a phone.
- Client scripts that index `workspace.Map.Zone3.Gate` directly and error under streaming.

## Related

[[00 Start Here]] · [[01 The First Five Minutes]] · [[04 Progression and Economy]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]]
