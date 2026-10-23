---
tags: [vault, world, level-design, lighting, materials, art-direction, performance]
for: [scenic, builder, librarian]
also: [lead, architect, frame, splash, kid-tester, playtest, reviewer, producer]
---

# 06 World and Look

This chapter is the playbook for everything the player sees that isn't UI: where they spawn, what they see in the first second, how zones and landmarks are laid out, how each mood is lit (with exact property values), which materials and colors go where, how dense the props are, how the world itself tells players where to go, how big things are relative to the avatar, how the camera behaves, and the minimum visual bar a map must clear before it goes to Review. Scenic owns `Workspace.Map`, `Terrain` and `Lighting`. Builder wires zone triggers and gates, and Librarian supplies the meshes, materials and effects.

The world decides whether a game succeeds before any system gets a chance. A player's first frame is the spawn view, and it either shows a goal, a reward and a reason to move or it shows a grey box. The thumbnail and store art are usually pictures of the world ([[11 Thumbnails, Icons and the Store Page]]). Most players are on phones ([[08 Mobile]]), so every visual choice is also a performance choice: part counts, light counts, transparency and streaming. A good-looking map that drops to 20 FPS on a mid-range phone loses more players than a plain one that runs.

Read this chapter in full before greyboxing a new game. Re-read the Lighting, Materials and Minimum visual bar sections before every visual pass, and the Rules before any handoff to Review. The numbers here are the spec. Where a number is marked as a target or rule of thumb, it's this studio's starting point: tune it in Play mode, then write the final value in `games/<slug>/decisions.md`.

Lighting changed in 2025: `Lighting.Technology` is deprecated and replaced by `LightingStyle` (Realistic or Soft) and `PrioritizeLightingQuality` ([1], [2], [3]). Older tutorials and older vault notes that say "set Technology to Future" are out of date. Use the new properties.

## Rules

### Spawn and lobby

1. **The spawn faces the game: from the spawn point, the first objective, the shop or sell area and the next gate sit inside a 90° cone in front of the player, within 60 studs.**
   Why: the first frame is the pitch. A player who has to turn the camera to find anything has already started to leave ([[01 The First Five Minutes]]). Landmark and wayfinding research says players orient by visible anchors, not by text [31], [34].
   How: place the SpawnLocation, then rotate it so its front (`CFrame.LookVector`) points at the first objective. Characters spawn facing the spawn's orientation. Press Play, don't touch the mouse, and take a screenshot. Every target must be in that screenshot and readable. Pet Simulator 99's Spawn is a hub that puts a shop, a mailbox and leaderboards around the start [52].
   Done right: Spawn on a raised plaza with the first coin field 25 studs ahead, the sell pad glowing on the left and the gate to zone 2 framed between two pillars behind them.
   Done wrong: Spawn facing a wall of the shop building, with the objective behind the player.

2. **Spawn into an open hub 60-120 studs across with at least 3 visible exits, never into a closed box.**
   Why: an enclosed lobby hides the game and reads as "loading screen". A hub shows choices and lets 20+ players spread out without stacking.
   How: greybox the hub as a circle or rounded square of that size, ring the edge with 3-5 exits (paths, portals, gates), and keep the middle open for players and pets. Hub walls stay under 8 studs so sightlines over them reach the landmarks.
   Done right: A round plaza with a fountain landmark, four paths with signs, and the zone-2 landmark visible over the low hedge.
   Done wrong: A 30 x 30 room with one door and a "Play" sign.

3. **Use 4-12 SpawnLocations spread at least 8 studs apart for servers of 12 or more players, or one SpawnLocation of at least 12 x 12 studs.**
   Why: everyone spawning on one 6 x 6 pad stacks avatars, blocks the view and makes the first second chaotic.
   How: in edit mode, set each spawn's `Anchored = true`, `CanCollide = true`, `Neutral = true` (non-team games), `Enabled = true`, a `Material` and `Color` that match the hub floor, and delete the default spawn decal if there is one. Roblox picks among valid spawns, so all of them must face the game (rule 1). Team games set `Neutral = false` and a `TeamColor` per spawn [25].
   Done right: Eight spawns in a ring around the fountain, all rotated toward the first field, flush with the plaza floor.
   Done wrong: One default grey spawn with the Roblox logo decal in the middle of a themed plaza.

4. **Spawn protection fits the genre: `Duration = 0` for simulators, tycoons, obbies and social games; 3-5 s for combat.**
   Why: the ForceField bubble is visual noise where nobody can hurt you, and too short where spawn camping exists. `Duration` is the ForceField time in seconds, and it defaults to 10 [26].
   How: set `SpawnLocation.Duration` on every spawn. In combat games, also put spawns out of line of sight of fight areas.
   Done right: A battlegrounds lobby with 4 s of protection and spawns behind a wall from the arena.
   Done wrong: A pet simulator where every new player sits in a shimmering bubble for 10 s.

5. **Obby checkpoints use either one Team per stage with `AllowTeamChangeOnTouch`, for up to about 50 stages, or data-driven checkpoints: tagged Parts, a saved stage number, and the server moving the character to the saved checkpoint on every spawn.**
   Why: `AllowTeamChangeOnTouch` changes the player's `TeamColor` to the spawn's when they touch it, which is the classic checkpoint trick. It doesn't work when the spawn is disabled [25]. Past about 50 stages, teams clutter the player list. A saved stage number also survives rejoining.
   How: in the team version, each stage's SpawnLocation has `Neutral = false`, its own `TeamColor` and `AllowTeamChangeOnTouch = true`. In the data-driven version, each checkpoint is an anchored Part tagged `Checkpoint` with a `Stage` attribute. Don't make 80 checkpoints into neutral SpawnLocations: Roblox picks among all valid spawns, so new players would land on random stages. Keep one real SpawnLocation at stage 0. The server's Touched handler checks `Stage == saved + 1` and saves it, and on `CharacterAdded` the server pivots the character to the saved checkpoint (Luau section). Checkpoints are 8 x 8 or larger, a distinct accent color, and show the stage number in big text.
   Done right: Stage 37's checkpoint glows green, shows "37" on a SurfaceGui, and rejoining puts the player back on 37.
   Done wrong: Checkpoints that are the same color as normal platforms, so players don't know they saved.

6. **Round-based lobbies give the player something to do within 5 s of spawning: a ready or queue pad, a map-vote or next-map display, a shop, a cosmetic preview and a movement toy, all within 30 studs.**
   Why: waiting is when players leave. A lobby is a playground, a shop window and the place friends meet. Natural Disaster Survival's lobby has a room with miniature models of its maps, which the Hunt: Mega Edition quest used [56]. Rounds take place on a separate island [57].
   How: greybox a 60-80 stud lobby with five zones: queue pads (8 x 8, accent color, player-count SurfaceGui), next-map board, shop counter with an NPC, a mirror pad for cosmetics, and a toy (trampoline, slide, mini-obby). Put a round timer BillboardGui above the queue.
   Done right: Players bounce on a trampoline next to a big "Next: Volcano - 0:18" sign while their friends stand on the queue pad.
   Done wrong: A flat grey square where players wait 45 s staring at a countdown.

7. **The lobby or spawn hub is the best-lit, most on-brand place in the game, because it's the screenshot most people see first.**
   Why: Splash takes thumbnails here, players screenshot it, and it's the frame where people decide whether the game looks worth their time ([[11 Thumbnails, Icons and the Store Page]]).
   How: give the hub the game's signature palette at full strength, its best landmark, warm key light (ClockTime 13-15 or a golden-hour preset), and the densest props (rule 46). Save the hub camera angle as a named `CFrame` in `Workspace.Map.Cameras` for thumbnail shots.
   Done right: The spawn hub has the castle landmark, flags, a bright sky and coin fountains, and every thumbnail starts from it.
   Done wrong: The hub is the plainest area because it was built first and never revisited.

8. **Getting back to spawn or the hub takes one tap, and walking there from any zone takes 20 s or less.**
   Why: hubs hold the shop, quests and friends. If players can't get back, the hub dies and the shop earns nothing.
   How: a HUD "Home" or "Spawn" button that asks the server to teleport the character with `PivotTo` (server-side, with a 3-5 s cooldown), plus teleport pads in each zone hub. At WalkSpeed 16, 20 s is about 320 studs of path.
   Done right: Every zone entrance has a glowing "Back to Spawn" pad.
   Done wrong: Zone 6 is a 90 s walk from the shop, and there's no button.

### Zones and landmarks

9. **Every zone has one landmark at least 3x as tall as anything near it (target 60-200 studs), visible from that zone's entrance and from the hub.**
   Why: landmarks are how players build a mental map. Disney's "weenies" pull guests across a park [31]. Level design writing uses tall, eye-catching focal points to draw players [35], and open-world games use a central tower so players always know where they are relative to the middle of the map [33].
   How: build the landmark as one Model with a recognizable silhouette (tower, giant tree, volcano, statue, crystal) and a lit top (a Neon element or PointLight). With streaming on, set the landmark's `LevelOfDetail` to `StreamingMesh`, or its `ModelStreamingMode` to `Persistent` if it's small, so it stays visible beyond the streaming radius [23], [24].
   Done right: The hub's 120-stud crystal spire is visible from every zone, and each zone's own landmark (volcano, ice palace) shows over the hub walls.
   Done wrong: Every zone's tallest object is a 20-stud tree, and streaming hides anything more than a few hundred studs away.

10. **Pick the map shape before building and draw it: hub-and-spoke for simulators and tycoons, linear for obbies and story games, loops for racing and survival rounds, arenas for combat.**
    Why: layout drives flow. Greyboxing with simple shapes before any scripting or final art lets you test gameplay and fix layout problems while changes are cheap [27].
    How: draw the layout in `plan.md` as a top-down sketch with stud distances, then greybox it in Studio with anchored blocks in one neutral color per function (floor grey, interactables yellow, hazards red, gates blue). Playtest the greybox before any art.
    Done right: A greybox where you can walk spawn → field → sell → gate in under 60 s before a single mesh exists.
    Done wrong: Art first, then discovering the shop is 400 studs from the sell pad.

11. **Each zone changes at least 3 of these 5 from its neighbors: palette, landmark, ground material, lighting preset, music.**
    Why: crossing a gate should feel like leveling up. If zone 4 looks like zone 3, the reward for paying the gate cost is invisible. Bee Swarm Simulator color-codes its fields, and the Mushroom Field is described as the first red field [44].
    How: write a zone table in `plan.md` (zone, palette, landmark, ground, preset, track) and check it before building. Apply lighting per zone on the client (rule 32).
    Done right: Meadow (green and gold, windmill, grass, bright day, folk) → Desert (sand and terracotta, pyramid, sand, desert noon, drums).
    Done wrong: Five zones that differ only in the color of the coins.

12. **Gates show their cost or requirement in letters at least 2 studs tall, readable at 40 studs, and look locked while locked.**
    Why: a gate is a goal. Bee Swarm Simulator names its gates by requirement: the Basic Bee Gate needs 5 bees and the Ant Gate needs 20 [40], [41]. Pet Simulator 99's early areas list rising unlock costs [53].
    How: a SurfaceGui (`SizingMode = PixelsPerStud`, `PixelsPerStud` 50, `LightInfluence = 0`) on both sides of the gate shows the icon, the cost from `Config` and a lock icon. A translucent barrier (`Transparency` 0.4-0.6, `ForceField` material or accent color) blocks the way and plays an open effect when unlocked. The cost text comes from `Config`, never typed into the sign ([[04 Progression and Economy]]).
    Done right: A blue barrier with a big padlock icon and "5,000 coins" sign, and the zone-2 landmark visible through it.
    Done wrong: An invisible wall with no sign, so the player thinks the map ends there.

13. **The next zone is visible before it's affordable.**
    Why: "denial and reward", from architecture, uses landmarks to show progress and create want [32]. Seeing the lava zone through the gate turns the gate cost into a goal.
    How: build every gate as a frame: an archway, a gap in a wall or a bridge, with the next zone's landmark centered in it when seen from the approach path. Check from 30 studs and 80 studs away.
    Done right: The ice palace is framed perfectly by the gate arch as you come over the hill.
    Done wrong: A solid wall with a door, so players never see what's behind it.

14. **The first zone is generous: 3-5 activities with no requirement, all within 60 s of walking from spawn.**
    Why: the first minutes should offer choice, not a queue. Bee Swarm Simulator's Starter Zone holds the most fields of any zone (five), with no bee requirement [42].
    How: list the activities in `plan.md` (for example two farm fields, a sell pad, an egg, a quest NPC) and place them around the hub with clear paths.
    Done right: Three coin fields, an egg stand and an NPC with a quest, all visible from spawn.
    Done wrong: One field, then a gate that takes 10 minutes of grinding.

15. **Zones get bigger and richer with tier: each new zone has 1.2-1.5x the playable area of the previous one (target), a taller landmark and more effects.**
    Why: later zones must look higher level, or the progression feels flat. Players read size and effects as value.
    How: keep a running area budget in `plan.md`. Spend effects (particles, glows, animated props) on later zones, while still meeting the performance budgets (rule 65).
    Done right: Zone 1 is 200 x 200 studs with a windmill; zone 5 is 350 x 350 with an erupting volcano and floating rocks.
    Done wrong: The late zones are smaller and plainer because time ran out.

16. **Big transitions (portal, world change, interior) use a 0.4-0.8 s screen fade, a clear frame and a sound, never an unexplained teleport.**
    Why: a teleport without a transition feels like a bug. Bee Swarm Simulator's Hive Hub sits inside a portal past the Ant Gate [45], so the entrance itself marks the change.
    How: a portal Model with a swirling ParticleEmitter, a ring of Neon and a positional whoosh sound. On touch, the client fades a full-screen Frame to black over 0.3 s, the server calls `player:RequestStreamAroundAsync(destination)` and then `PivotTo`, and the client fades back in over 0.4 s.
    Done right: Step into the swirling portal, a quick fade and whoosh, and you arrive facing the new zone's landmark.
    Done wrong: Touching a grey part snaps you to a new place facing a wall.

17. **Early zones stay useful, and every zone's name is in the world: a sign at its entrance and the same id in Config.**
    Why: a map where only the newest zone matters feels empty. Named zones let players talk ("meet at Desert") and let analytics log zone ids ([[12 Live Ops and Launch]]).
    How: give old zones permanent reasons to visit (daily quests, eggs, social spots, trading). Every zone has a `ZoneId` attribute matching `Config.Zones[ZoneId]` and a 3-stud-letter name sign at each entrance.
    Done right: The meadow hosts the trading plaza and the daily chest, so even maxed players pass through.
    Done wrong: Zone 1 is a ghost town after the first hour.

18. **Zone volumes are data: each zone has one invisible, anchored box tagged `Zone` with attributes `ZoneId`, `Preset` and `Music`, kept in a persistent streaming model.**
    Why: lighting, music, analytics and quests all need to know which zone the player is in, and a hand-placed Touched part per zone is fragile.
    How: in `Workspace.Map.ZoneVolumes` (a Model with `ModelStreamingMode = Persistent`), add Parts with `Transparency = 1`, `CanCollide = false`, `CanTouch = false`, `CanQuery = false`, `Anchored = true` that cover each zone from ground to 200 studs up. Tag them `Zone`. The client checks the player's position against them every 0.25-0.5 s (Luau section).
    Done right: Walking from meadow to desert crossfades the music and lighting within a second, with no Touched events.
    Done wrong: Touched parts on the floor that miss players who jump over them.

### Lighting

19. **Set `Lighting.LightingStyle` on day one: `Realistic` for nearly every 3D game, `Soft` only for a deliberate flat or classic look. Don't use the deprecated `Technology` property.**
    Why: Unified Lighting replaced `Technology` with two properties. It went to a Studio beta in January 2025 and fully live in July 2025, and existing experiences kept their look [3], [5]. `Realistic` gives the most advanced lights and shadows. `Soft` gives a flatter, classic-Roblox look with softer lights and shadows [1]. Studio starts new places on Soft, and under Soft, local lights such as candles don't cast shadows the way the sun does [11]. The API reference marks `Technology` as deprecated [2], and community references note that it was superseded [8]. The old values (Voxel, ShadowMap, Future) came from the "Future Is Bright" rollout [9], [10], which is why so many tutorials still mention them.
    How: Properties window → Lighting → `LightingStyle`. Set it in edit mode (Properties or command bar); don't plan to change it from game scripts at runtime. Write the choice in `decisions.md`.
    Done right: A sim set to Realistic with crisp sun shadows that show shape.
    Done wrong: A horror game left on Soft, so the flashlight casts no shadows and the rooms look flat.

20. **Set `PrioritizeLightingQuality = false` for large outdoor maps that need view distance, and `true` for interiors, horror, small arenas and showcase hubs.**
    Why: when a device lowers rendering quality, `true` keeps advanced shadows and high-quality shaders up close at the cost of view distance, and `false` keeps view distance [1]. It defaults to true [6]. A 1,000-stud open simulator needs its landmarks visible far more than it needs perfect shadows.
    How: set it with `LightingStyle` and test both values on a phone or with the graphics quality slider at 1-3.
    Done right: An open-world farming game on false, where the far windmill stays visible on low-end phones.
    Done wrong: A big racing map on true, where low-end players can't see the next turn.

21. **Every place has the full lighting stack under Lighting: one Sky, one Atmosphere, one ColorCorrectionEffect and one BloomEffect, plus a SunRaysEffect outdoors. DepthOfFieldEffect is for menus and cutscenes only.**
    Why: the default look is flat and generic. These five objects take minutes to add and change the screenshot more than any prop. Post-processing effects go in Lighting for everyone, or in the Camera for one player only [16]. Atmosphere controls depth and haze [14].
    How: run the edit-mode preset applier (Luau section) with a mood from the mood table, then adjust by eye at quality level 10 and at 3. Don't stack duplicates: two ColorCorrections multiply and are hard to debug.
    Done right: Sky + Atmosphere (Density 0.3) + ColorCorrection (Saturation 0.15) + Bloom (Threshold 1.8) + SunRays (0.08).
    Done wrong: Default sky, no Atmosphere, so the far edge of the map hangs in empty blue.

22. **`ClockTime` sets the mood more than any color: day 13-15, golden hour 16.8-17.6, blue hour 18.2-18.8, night 0-3 or 21-24.**
    Why: sun angle decides shadow length, sky color and contrast. Midday reads cheerful and clear, low sun reads warm and dramatic, and night reads tense.
    How: set `Lighting.ClockTime` (or `TimeOfDay` as "14:00:00"). `GeographicLatitude` shifts the sun's path. Raise it toward 60 for longer shadows at midday, and keep the default for most games. Check that the sun isn't behind the camera at the spawn view (rule 1): you want side light on the hub, not flat front light.
    Done right: The spawn hub at 14:30 with the sun to the left of the view, so buildings show a lit side and a shaded side.
    Done wrong: ClockTime 12 with the sun straight overhead, so nothing has form.

23. **`Brightness` 2-3 for day, 0.5-1.5 for dusk and night, and no more than 4 outside special effects.**
    Why: too bright washes out color and makes light surfaces bloom. Too dark hides the game on phones, which already run at lower screen brightness.
    How: set `Lighting.Brightness`, then use `ExposureCompensation` (small steps, -0.5 to +0.5) for overall exposure instead of pushing Brightness. Check a white part and a black part: the white should not clip and the black should still show shape.
    Done right: Brightness 2.5 with ExposureCompensation -0.1 in a snow zone, so the snow is bright but not blown out.
    Done wrong: Brightness 6 "to make it pop", so the whole zone glows white.

24. **`Ambient` and `OutdoorAmbient` are never pure black: day OutdoorAmbient around RGB 110-150, night OutdoorAmbient at least RGB 40, 45, 70, and horror interiors light the way with local lights rather than ambient.**
    Why: ambient is the fill light in shadow. Black ambient makes every shadow a hole, and phone players can't see into it. `Ambient` tints areas the sky can't reach (indoors); `OutdoorAmbient` tints outdoor shadow.
    How: set both as Color3 values from the mood table. Tint night ambient toward blue (more B than R), and day ambient slightly toward the sky color.
    Done right: A night zone with OutdoorAmbient (45, 50, 80), where shadows are deep blue but players can still see the path.
    Done wrong: A night zone with Ambient (0, 0, 0), so the half of the map that's in shadow vanishes on phones.

25. **`EnvironmentDiffuseScale` = 1, and `EnvironmentSpecularScale` = 1 for PBR or metal-heavy scenes, 0.3-0.6 for flat stylized plastic.**
    Why: these scale how much the Sky lights and reflects on surfaces [1]. Full specular on a stylized pastel world makes plastic look wet and shiny. Full diffuse keeps shadows from looking flat.
    How: set both in Lighting. Check a SmoothPlastic sphere and a Metal sphere next to each other at spawn.
    Done right: A sci-fi zone at 1/1 where metal panels reflect the sky.
    Done wrong: A toy-like candy world at specular 1 where every surface has a white glare.

26. **Atmosphere: Density 0.25-0.35 for clear days, 0.4-0.6 for mood (fog, horror, underwater), Offset 0-0.25, Haze 0-2 for normal looks, and Glare above 0 only with Haze above 0.**
    Why: Density controls how much distant objects and terrain are hidden, Offset controls how distant objects blend into the sky, Haze adds haziness above the horizon and into the distance, Glare adds glow around the sun only when Haze is above zero, and Decay sets the hue farther from the sun when Haze and Glare are both above zero [14], [15]. A low Offset can let the skybox show through objects and terrain, so balance it against Density [14].
    How: set Color to match the sky's horizon color and Decay to a darker or warmer variant. Use higher Density to hide the streaming edge on big maps and to make landmarks fade with distance (aerial perspective), which shows depth.
    Done right: Density 0.32, Offset 0.2, Color #C7D7F0, Haze 1. Far zones fade gently, and the landmark silhouette still reads.
    Done wrong: Density 0.8 on a sim, so players can't see the gate 80 studs away.

27. **Use Atmosphere for fog, not `FogEnd`.**
    Why: with an Atmosphere in Lighting, the old `FogStart`, `FogEnd` and `FogColor` properties are ignored, and changing them does nothing. Agents lose time "fixing fog" that has no effect.
    How: tune fog with Atmosphere `Density` and `Haze`. If a game really needs hard distance fog (a retro look), remove the Atmosphere and write that in `decisions.md`.
    Done right: A horror forest uses Density 0.55 and Haze 2.5.
    Done wrong: A script tweening `FogEnd` every frame while an Atmosphere sits in Lighting.

28. **Bloom stays subtle: Intensity 0.3-1, Size 18-32, Threshold 1.2-2.5. Raise Threshold until white floors and snow stop glowing.**
    Why: Bloom makes bright pixels glow like a camera looking into strong light, so light-colored parts glow at high values [16]. It's the main reason Neon looks magical, and the main reason a white UI sign turns into a smear.
    How: start from the mood table, then look at the brightest non-Neon surface in the zone. If it glows, raise Threshold by 0.2 until it stops.
    Done right: Bloom 0.5/24/1.8. Neon gates glow and the white marble plaza doesn't.
    Done wrong: Bloom 2/56/0.8, so every surface hazes and text signs are unreadable.

29. **ColorCorrection makes small moves: Saturation +0.05 to +0.2 for bright kid-friendly games, -0.15 to -0.35 for horror, Contrast 0-0.2, Brightness -0.1 to +0.05, TintColor within about 10% of white.**
    Why: ColorCorrection tunes the whole frame's colors and is also used for player feedback, such as a red tint at low health [16]. Big values push every palette off-model at once.
    How: use the Lighting copy for the zone mood. Put feedback effects (damage flash, low health, underwater) in a separate ColorCorrectionEffect under `workspace.CurrentCamera`, created by the client, so they affect only that player [16].
    Done right: Lighting CC Saturation 0.15, TintColor #FFF8F0, plus a Camera CC the client tweens to TintColor #FF8080 for 0.2 s on damage.
    Done wrong: TintColor #FFB060 on the whole game, so every zone looks orange.

30. **SunRays only when the sun is in view: Intensity 0.03-0.15, Spread 0.4-1.**
    Why: SunRays draws rays around the sun that follow `ClockTime`, and objects between the camera and the sun shape them [16]. Strong rays wash out the top of the screen where phones show HUD.
    How: aim the main views (spawn, gates) so the sun sits off to the side or slightly behind landmarks. Golden hour and jungle presets use the higher end.
    Done right: Rays streaming through the jungle canopy at Intensity 0.12.
    Done wrong: Intensity 0.5 at noon, so the sky is a white flare.

31. **Per-zone lighting runs on the client with 1.5-2.5 s tweens; the server sets one neutral baseline and never sets per-player moods.**
    Why: Lighting properties changed by a LocalScript affect only that player. That's what you want when players stand in different zones at the same time. A server change would flip everyone's sky when one player walks into the cave.
    How: presets live in `ReplicatedStorage.Shared.Config.Moods`. A client controller detects the zone (rule 18) and tweens Lighting and Atmosphere numbers and colors with `TweenService` (`TweenInfo.new(2, Enum.EasingStyle.Sine)`). Swap Sky textures at the midpoint of the fade, since they can't be tweened.
    Done right: Walking into the volcano zone shifts the sky red and the haze up over 2 s, for that player only.
    Done wrong: A server script that changes Lighting whenever anyone enters a zone, so the whole server's lighting flickers.

32. **Local lights: no more than 8 shadow-casting local lights in any one view, `Range` no more than needed (pickups 6-12, lamps 16-24, rooms 30-60), and rows of lamps faked with Neon plus shadowless lights.**
    Why: shadowed local lights are expensive, especially on phones. Light range has a cap (developers have asked for years to raise it [17]), and Unified Lighting was described as laying groundwork for increased ranges and attenuation [5]. Under Realistic, local lights cast crisp shadows on nearby objects, which is gorgeous on a campfire and wasteful on 40 streetlamps [12].
    How: give each light a purpose. `Shadows = true` only on the hero lights (campfire, chandelier, flashlight). Streetlamps get a Neon bulb and a PointLight with `Shadows = false` and `Range` 16. Count lights with the audit script.
    Done right: A night village with one shadowed campfire, 12 shadowless lamps and Neon windows.
    Done wrong: 60 shadowed SpotLights in a mall, and 15 FPS on phones.

33. **Under Realistic, interiors have walls, floors and roofs at least 1 stud thick so outdoor light doesn't leak in.**
    Why: Realistic detects indoor spaces to compute shadows. Surrounding interiors with Parts at least 1 stud thick stops outdoor light leaking through [11]. Paper-thin walls give glowing seams and lit interiors at night.
    How: build walls 1-2 studs thick, overlap corners, and close the gaps between wall and roof. For mesh buildings, add a thin hidden Part shell if light leaks. Check at ClockTime 0 and 14.
    Done right: A cabin interior that's dark at night except for its lamp.
    Done wrong: 0.2-stud wall Parts, and sunlight streaks across the floor of a closed room.

34. **In horror and dark games, darkness is a mechanic, so the player's light, the exit and the threat must stay readable, and a stuck player gets a guide after about 20 s.**
    Why: dark that hides the goal isn't scary, it's frustrating. In Doors, Guiding Light points players toward their next move with glowing blue particles, and if a player is stuck in a Dark Room for more than 20 seconds it lights up the next door. It also lights the path during Seek's chase and can highlight hidden keys [46].
    How: horror preset (mood table), a player light (SpotLight or PointLight on the character, `Range` 16-24, `Brightness` 1-2, `Shadows = true`), exits marked by a dim but distinct light color, and a client timer that adds a Highlight or particle guide after 20 s without progress.
    Done right: A pitch-black room where the door frame has a faint green emergency light, and a blue trail appears if you wander for 20 s.
    Done wrong: A black room with no cue, where players quit after 40 s of walking into walls.

35. **Day/night cycles run 10-20 real minutes per full day (target) and night must never make the core loop unreadable. Simulators and tycoons usually stay at day.**
    Why: a cycle adds life, but a 3-minute night in a coin simulator just hides the coins. Players who join at night should still be able to play.
    How: each client computes `ClockTime` from `workspace:GetServerTimeNow()`, so everyone agrees without replication traffic (Luau section). Night uses the night preset's ambient floor (rule 24) and turns on Neon windows and lamps.
    Done right: A survival game with a 14-minute day, where night raises danger while the campfire still lights the base.
    Done wrong: A server loop setting ClockTime every frame, with nights so dark the HUD is the only thing visible.

36. **Judge the look at graphics quality 1, 5 and 10 and on a real phone, because Realistic lighting, SurfaceAppearance and post effects vary by device and quality level.**
    Why: SurfaceAppearance rendering depends on the device and quality setting [22], and some effects don't show in Studio unless Editor Quality Level is at its highest [16]. A look that only works at quality 10 doesn't exist for most players.
    How: Studio → File → Studio Settings → Rendering → Editor Quality Level: test at Automatic and at the max. In Play, use the in-game graphics slider at 1, 5 and 10. Take three screenshots of the spawn view and keep them in `games/<slug>/reports/`.
    Done right: A spawn view that still reads (goal, gate, landmark) at quality 1.
    Done wrong: Signs that only show their glow at quality 10, unreadable on phones.

### Materials and palettes

37. **One art style per game, never mixed in one view: stylized (SmoothPlastic and Plastic, flat or gradient colors, chunky shapes) or realistic (PBR SurfaceAppearance, MaterialVariants, believable proportions).**
    Why: a photoreal rock next to a cartoon tree makes both look wrong and reads as "asset flip". Players judge quality by consistency more than detail.
    How: write the style in `plan.md` with two reference images and the base material list. Librarian rejects store assets that don't match. A stylized game uses built-in materials with `SetMaterialColor` for terrain and few textures.
    Done right: A candy world of SmoothPlastic, pastel colors and rounded meshes, from props to terrain.
    Done wrong: Realistic PBR bricks, a cartoon NPC and a low-poly tree in the same shot.

38. **Each zone's palette is 2-3 base colors, 1 secondary and the game-wide accent, roughly 60% / 30% / 10% of the screen, and the accent is used only on things the player can use.**
    Why: the accent color is the world's "press here". If gold is on the trim of every building, gold coins and buy pads stop standing out.
    How: put the palette in the zone table and in `Config.Zones[id].Palette` (hex strings), and build with `Color3.fromHex`. Builders pick only from the palette. The accent (for example `#FFC400`) goes on buy pads, collectibles, gates and quest NPC markers.
    Done right: A meadow in greens and cream, with every interactable gold.
    Done wrong: Gold fences, gold roofs and gold coins.

39. **Walkable surfaces differ from walls, void and hazards by at least 25 points of value (HSV V on a 0-100 scale), so floor vs not-floor reads at a glance.**
    Why: players navigate by value contrast first, before hue. Obby players especially must see the edge of a platform instantly.
    How: check with the color picker's HSV readout. Floors usually sit mid-value (V 45-70), walls darker or lighter, hazards high saturation (lava S > 80) and the void dark. Give platform edges a 0.2-stud trim that is 20-30 V lighter.
    Done right: Light sandstone floor (V 80) against dark cliff walls (V 40), with glowing orange lava (S 90).
    Done wrong: A grey floor on grey water under grey fog.

40. **Neon is a signal: under 5% of the visible surfaces in any view, used only for interactables, gates, objectives, rare drops and deliberate light sources.**
    Why: Neon plus Bloom is the strongest attractor in the engine. If everything glows, nothing does, and Bloom smears the frame.
    How: count Neon parts with the audit script and look at the spawn view. Use Neon thin (trim, bulbs, runes) rather than as big slabs. Dim Neon by darkening its Color rather than adding transparency.
    Done right: A dark sci-fi corridor with one Neon strip leading to the objective door.
    Done wrong: A lobby where every wall is Neon pink.

41. **Use MaterialVariants for repeating surfaces (StudsPerTile usually 4-16) and SurfaceAppearance for unique UV-mapped meshes, with no more than 12 custom MaterialVariants per game (target).**
    Why: MaterialVariant customizes a reusable, tileable material. SurfaceAppearance customizes one mesh with UV mapping [19]. MaterialVariants only work as descendants of `MaterialService`, and they can override a built-in material everywhere or apply only to Parts that name them in `BasePart.MaterialVariant` [20]. SurfaceAppearance supports color, normal, roughness and metalness maps [21]. Every extra variant is more texture memory.
    How: use Studio's Material Manager to create a variant (`BaseMaterial`, maps, `StudsPerTile`) [19]. Name variants `Zone_Purpose` (for example `Desert_Sandstone`). Set the global override in MaterialService only if every use of that base material should change.
    Done right: One `Castle_Stone` variant at StudsPerTile 8 on every wall in the castle zone.
    Done wrong: 40 imported variants, half unused, and a 600 MB client.

42. **No near-white (V above 92) on large surfaces under bright light, and no full saturation (S above 85) on surfaces bigger than 20 x 20 studs, unless it's the hazard color.**
    Why: near-white blooms out and loses shading, and huge saturated planes tire the eye and swallow the accent color.
    How: snow is V 85-90 with a slight blue tint. Grass is S 45-70. Lava may be S 90 because it's a hazard.
    Done right: Snow at #DDE8F2 with blue shadows.
    Done wrong: Pure #FFFFFF snow plaza under Brightness 3 that renders as a white flash.

43. **Terrain gets at least 3 painted materials per zone, colored with `Terrain:SetMaterialColor` to match the palette.**
    Why: one-material terrain reads as a default baseplate. Paths, edges and slopes in different materials show players where to walk.
    How: Terrain Editor → Paint: base (Grass), path (Ground or Mud), edges and slopes (Rock or Slate), plus water or sand where needed. `SetMaterialColor` is global per material, so each zone uses different materials rather than recoloring the same one (meadow Grass, jungle LeafyGrass, desert Sand and Sandstone).
    Done right: Meadow grass, a dirt path that leads to the gate, rock cliffs at the edges.
    Done wrong: One flat grass plane to the horizon.

44. **Red and orange mean danger in gameplay spaces, and nothing decorative there uses that hue.**
    Why: color meanings carry across the game. Kids learn "red hurts" in one obby stage and then avoid a red decorative carpet in the shop.
    How: reserve the hazard hue (`#FF3B30`-`#FF6A2B`) for kill parts, enemy attacks and damage zones. Decorative reds shift to maroon (`#7A2E3A`) or pink. Lava zones use orange as the hazard and keep walkable rock dark.
    Done right: A lava zone where the lava is bright orange and walkable basalt is near-black.
    Done wrong: Red decorative tiles on a path that players jump over because they think it's a kill brick.

### Prop density

45. **Every 50 x 50 stud area of a playable zone has 1 focal prop, 3-6 medium props and 10-30 small details, clustered at the edges, with walking lanes kept clear (target).**
    Why: empty areas feel unfinished, and cluttered paths block movement and the camera. Dense edges with clear centers make spaces feel full while staying easy to move through.
    How: greybox the lanes first (paths 12-20 studs wide), then dress from the outside in: focal prop (fountain, tree, statue) at an intersection, medium props (benches, carts, rocks) along the edges, small details (flowers, crates, lamps) in clusters. Step back to the play camera height after every 10 props.
    Done right: A market square with a central fountain, stalls along the sides and crates and barrels clustered at stall corners.
    Done wrong: 200 flowers scattered evenly over the path, catching feet and hiding coins.

46. **Prop density follows attention: densest at spawn, gates, shops and quest givers, lighter on transit paths, and background built from a few big silhouettes instead of many small parts.**
    Why: players look at the places where they make decisions. Detail spent on background parts costs performance and nobody sees it.
    How: mark three density levels on the greybox (high, medium, low). The background beyond the play boundary is big low-detail shapes: mountains as terrain, distant cities as a few large meshes, and forest as tree clusters at about 1/4 the density of the playable area.
    Done right: A dense, lovingly dressed shop plaza with hills of simple terrain behind it.
    Done wrong: 3,000 individual trees in an area nobody can reach.

47. **Cluster props in odd-numbered groups (3, 5, 7) of mixed heights, and never lay decoration out in a uniform grid unless the grid is the gameplay.**
    Why: odd, varied groups read as natural and help the eye find a focal point. Grids read as placeholder.
    How: rotate copies by random 0-360° on Y (decor only), scale 0.8-1.2x, and mix 2-3 models per cluster. Keep farm plots, tycoon pads and seats on a grid because the grid is functional there.
    Done right: Three pine trees of different heights with two rocks at their base.
    Done wrong: Twenty identical trees in rows, all facing the same way.

48. **Reuse meshes: no more than about 150 unique meshes per place (target). Copies of the same MeshId with the same material and texture are much cheaper than unique ones.**
    Why: memory and draw cost scale with unique assets, and the engine can batch identical meshes. A kit of 40 well-made modular pieces reads better than 400 random store models. Roblox's environmental art curriculum is built around developing polished assets and assembling them into a reusable asset library [28], with a sample place of modular assets, props and custom materials [29].
    How: Librarian keeps the zone kit in `ServerStorage.Assets` or `ReplicatedStorage.Assets` (walls, floors, corners, arches, props) with consistent pivots on a 4-stud grid. Scenic builds from the kit and only commissions new meshes for landmarks.
    Done right: A 32-piece castle kit snapped on a 4-stud grid builds the whole castle zone.
    Done wrong: Every wall a different store model with its own texture.

49. **Collision is designed, not default: decor gets `CanCollide = false`, `CanTouch = false` and `CanQuery = false`, and complex silhouettes walk on invisible clean collision boxes.**
    Why: thousands of colliding decorative parts cost physics time, catch players on invisible bumps and break pathfinding. `CanQuery` can only be turned off when `CanCollide` is off.
    How: small decor `CanCollide = false`. Props players should bump into use `CollisionFidelity = Box` or `Hull`. Large walkable meshes (bridges, rocks) get `CanCollide = false` plus an invisible anchored Part (`Transparency = 1`) shaped as the walking surface. Set `CollisionFidelity` in edit mode; scripts can't change it at runtime.
    Done right: A rocky path where the rocks are visual and an invisible smooth ramp carries the player.
    Done wrong: Players snagging on every flower and the edge of every rock.

### Guidance built into the world

50. **Light leads: the next goal is the brightest, warmest or most saturated thing in its view.**
    Why: players walk toward light and contrast, a wayfinding cue that works without UI [34], [31].
    How: a warm PointLight (`Range` 16-24, `Shadows = false`) or Neon accents at the goal, slightly darker surroundings, and a lit path. In night zones, the goal is the light source.
    Done right: A dark cave with a warm glow at the far exit.
    Done wrong: The exit and the dead ends are lit the same way.

51. **Leading lines and breadcrumbs point at the goal: path edges, fences, rivers and rooflines converge on it, and collectible breadcrumbs sit every 6-10 studs along the first route.**
    Why: lines the eye follows move players without words. Breadcrumbs that pay out (coins) teach the route and reward following it.
    How: lay paths with a contrasting material (rule 43) whose edges point at the goal. Place 8-15 coins or orbs along the first route, every 6-10 studs, ending at the first objective ([[01 The First Five Minutes]]).
    Done right: A curving dirt path lined with lanterns and coins, ending at the egg stand.
    Done wrong: Coins scattered randomly, so new players wander.

52. **Interactables share one look: raised 0.5-1 stud, at least 4 x 4 studs, accent-colored, with a floating icon and a ProximityPrompt or touch pad.**
    Why: consistent affordances teach once and work everywhere. Players learn "gold raised pad = do something".
    How: buy pads and sell pads are 6 x 6 x 0.6 Parts in the accent color with a Neon rim and a BillboardGui icon (`Size` 4 x 4 studs, `StudsOffset` 0, 4, 0, `MaxDistance` 80, `LightInfluence` 0). ProximityPrompts use `MaxActivationDistance` 8-12 and `RequiresLineOfSight = false` on small props that block their own line of sight.
    Done right: Every shop, sell pad and quest board uses the same gold pad and icon style.
    Done wrong: The sell spot is a grey rectangle with tiny text.

53. **Dynamic guidance (a Beam path, a Highlight, an arrow) shows only the current objective, and only appears after the world cue has failed for 10-20 s, except during the first-session tutorial.**
    Why: permanent arrows cover the world and train players to ignore it. Doors adds its guide only when players are stuck, after 20 s in a dark room [46]. Highlights are limited to 31 on screen at once.
    How: a client controller tracks the current objective (from server state) and how long since progress. After the threshold, it shows a Beam from the character to the target (Luau section) or a Highlight on the target (`DepthMode = AlwaysOnTop`, `FillTransparency` 0.7). It hides on progress.
    Done right: The arrow appears after 15 s of wandering and disappears the moment you reach the field.
    Done wrong: Five permanent glowing arrows pointing at different things.

54. **Sound beacons: the current goal or a key landmark plays a positional sound that carries 60-80 studs.**
    Why: sound guides players who aren't looking at it, which is especially useful on phones with small screens.
    How: a looping Sound in the target's Attachment with `RollOffMode = Linear` (or `InverseTapered`), `RollOffMinDistance` 10, `RollOffMaxDistance` 60-80, `Volume` 0.3-0.5, in the Ambient SoundGroup ([[07 Characters, VFX and Assets]]).
    Done right: The shop's wind chimes get louder as you approach.
    Done wrong: A global music track that drowns every positional cue.

### Scale and camera

55. **Build for a 5-stud avatar that can be scaled up to 105% height: doorways at least 6 wide and 9 tall, interior ceilings at least 14 studs, corridors at least 10 wide, main paths 12-20 wide.**
    Why: community measurements of the default R15 avatar come out at about 5 studs [39]. Avatar scaling lets players change height and width within limits, and the documented ranges have changed over the years (95-105% height at launch; the wiki lists 90-105% height and 70-100% width) [36], [37]. Developers advise designing for the largest R15 so smaller ones also fit [38]. The third-person camera also needs headroom.
    How: use the scale table below. Put a 5-stud and a 6-stud reference dummy (Rig Builder) in the greybox and walk every door in Play with the camera zoomed in and out.
    Done right: Shop interiors 16 studs tall with 8 x 10 doors, so the camera never clips.
    Done wrong: Real-world 7-foot (about 2.2-stud) doors that avatars can't fit through.

56. **Jumps are tuned to the real physics: with default `JumpHeight` 7.2 and `Gravity` 196.2, a flat running jump covers about 8.7 studs, so beginner gaps are at most 5 studs, mid gaps 5-7, and anything over 7.5 only after the player has a speed or jump boost.**
    Why: airtime for a 7.2-stud apex is 2 × √(2 × 7.2 / 196.2) ≈ 0.54 s, which at `WalkSpeed` 16 is about 8.7 studs. Gaps at the limit fail on lag and on phone controls. The core curriculum's greybox lesson raises platform height gradually so players stay motivated to climb [27].
    How: keep defaults in `StarterPlayer` (`CharacterWalkSpeed` 16, `CharacterJumpHeight` 7.2) unless the plan changes them. If it does, recompute. Beginner platforms at least 4 x 4 (6 x 6 on stage 1-10), height steps up to 4 studs, and jump-ups no higher than 5.5 studs.
    Done right: Stage 1-5 gaps of 3-4 studs on 6 x 6 platforms, stage 20 gaps of 6.5.
    Done wrong: An 8.5-stud gap on stage 3 that works on PC at 60 FPS and fails on phones.

57. **Buildings and landmarks use heroic scale, 1.5-3x real proportions, and stairs rise 1 stud per step at most.**
    Why: the default camera floats about 10-20 studs behind the avatar, so real proportions look cramped and props look tiny. Big, chunky shapes read on small screens.
    How: shop counters 3-4 studs high, benches 2 studs, steps 1 stud rise and 1.5-2 studs deep (or a smooth ramp with an invisible collision wedge), and railings 3 studs.
    Done right: A cozy-looking but camera-friendly cottage that's 20 studs tall inside.
    Done wrong: A "realistic" house where the camera is stuck inside the walls.

58. **Keep the default third-person camera unless the genre demands otherwise. Cap `CameraMaxZoomDistance` at 25-40 for tight interiors and horror, leave about 128 (the default) for open worlds, and don't use first-person lock outside shooters and horror.**
    Why: players expect the standard camera. A zoom cap stops players seeing behind walls in horror and seeing the edge of a small map. First-person lock hurts mobile players and motion-sensitive kids.
    How: `StarterPlayer.CameraMaxZoomDistance`, `CameraMinZoomDistance` (default 0.5), `CameraMode` (Classic or LockFirstPerson). Use `DevCameraOcclusionMode = Invisicam` for cramped interiors where walls block the view. Leave `EnableMouseLockOption` on for combat and obbies.
    Done right: A horror game capped at 20 studs with Invisicam in narrow corridors.
    Done wrong: A sim locked to first person, so players can't see their own pets.

59. **Field of view stays at 70 in gameplay. Kick it +5 to +10 for sprint or boost, don't go below 50, and cutscenes last 5 s or less, are skippable and hand the camera back.**
    Why: `Camera.FieldOfView` defaults to 70. Narrow FOV causes motion discomfort, and long, unskippable cutscenes lose players.
    How: tween FieldOfView on the client with `TweenService` (0.2 s up, 0.4 s down). Cutscenes set `Camera.CameraType = Enum.CameraType.Scriptable`, tween between named camera CFrames, then restore `CameraType = Custom` and `CameraSubject` to the Humanoid, including on skip.
    Done right: A 3 s gate-opening shot that any tap skips.
    Done wrong: A 20 s intro flythrough that runs every time you join.

### Performance and the minimum visual bar

60. **Anchor everything static, and the world audit reports zero loose unanchored parts and zero decorative `CanTouch` parts before every handoff.**
    Why: unanchored parts simulate physics, drift, fall into the void and cost server and network time. `CanTouch` on decor makes Touched events fire for nothing.
    How: run the audit script (Luau section) and paste its output into the handoff. Moving props (doors, platforms) are driven by constraints or `TweenService` on anchored parts, not loose physics.
    Done right: "BaseParts 11,240, loose 0, decor CanTouch 0".
    Done wrong: A store tree with 300 unanchored leaves that slowly fall through the map.

61. **Part budgets (targets for mobile-first games): spawn hub or lobby at most 3,000 BaseParts, each zone at most 6,000, the whole map at most 25,000, and no more than 2 overlapping transparent layers in any view.**
    Why: phones are the floor ([[08 Mobile]]). Part count, unique meshes and transparency are the usual causes of low frame rates in Roblox maps. Overlapping transparent surfaces (glass, water planes, particle stacks) are expensive.
    How: count per folder with the audit script. Merge small static detail into meshes in Blender. Replace unions with meshes when unions have high triangle counts. Glass windows get one pane, not three stacked layers.
    Done right: A 5-zone sim at 18,000 parts that holds 60 FPS on a mid-range phone.
    Done wrong: 80,000 parts because each fence picket is a Part.

62. **StreamingEnabled stays on with the documented defaults (`StreamingTargetRadius` 1024, `StreamingMinRadius` 64), `ModelStreamingBehavior = Improved`, `StreamOutBehavior = Opportunistic`, and client code never assumes a part exists.**
    Why: streaming is on by default in new places and can't be set from a script [23]. The docs recommend the default target radius as a balance of visibility and memory, recommend Improved model streaming, and recommend Opportunistic stream-out to save client memory. Regions inside `StreamingMinRadius` never stream out [23]. Per-model `ModelStreamingMode` (Atomic, Persistent, PersistentPerPlayer, Nonatomic) controls how each model streams [23], [24].
    How: set these on Workspace in edit mode. Atomic for models that must arrive whole (a shop with its counter and prompt), Persistent only for the few things clients always need (zone volumes, the hub landmark). Client code uses `WaitForChild` with a timeout or CollectionService `GetInstanceAddedSignal`. Before teleporting a player far, the server calls `player:RequestStreamAroundAsync(position)`.
    Done right: A client gate controller that sets up each gate when its tag's instance-added signal fires.
    Done wrong: A LocalScript that indexes `workspace.Map.Zone5.Gate` at startup and errors for every player who spawned far away.

63. **The minimum visual bar is non-negotiable before Review: no default baseplate or untouched grey plastic in view, the full lighting stack (rule 21), at least 3 terrain or ground materials per zone, a landmark per zone, legible signs, and no z-fighting, floating props, gaps or visible seams at the spawn view or the gates.**
    Why: players and thumbnails judge in a second, and these are the tells of an unfinished game. Roblox's environmental art curriculum treats a high-quality environment as level design plus polished assets plus memory and performance optimization, not decoration added at the end [28].
    How: walk the Minimum visual bar checklist below and take screenshots at spawn, at each gate and at each landmark from three distances (10, 40 and 120 studs). Fix every fail before asking for Review.
    Done right: A Review request with 9 screenshots, all passing, plus the audit output.
    Done wrong: "Map done" with a grey baseplate peeking out under zone 3.

64. **Every visual pass ends with a phone-class test: frame rate, memory and readability in the Device Emulator and, where possible, on a real low-end phone.**
    Why: Studio on a desktop GPU hides most problems. Lighting quality scales down on weaker devices [1], so the game players actually see may differ from the one in Studio.
    How: Studio Device Emulator (phone presets, portrait and landscape) for layout and readability. The Developer Console (F9) Memory tab and the MicroProfiler (Ctrl+F6 in the client) for cost ([[14 Roblox Studio Workflow]]). Record FPS at spawn and in the heaviest zone.
    Done right: "Spawn 58 FPS, volcano 41 FPS on a 4 GB phone, client memory 1.1 GB" in the report.
    Done wrong: "Looks good in Studio" as the only evidence.

## Step by step

### Building a new world in 20 steps

1. Read `plan.md` (loop, zones, gates, first five minutes) and the genre page in `vault/Genres/`. Note the target devices and the server size.
2. Write the zone table in `plan.md`: zone id, name, tier, palette (hex), landmark, ground materials, mood preset, music track, gate requirement (a Config key, not a number).
3. Sketch the layout top-down (hub-and-spoke, linear, loop or arena, rule 10) with stud distances: spawn to first objective at most 30, to sell or shop at most 40, to the next gate at most 120, and each zone's walk from its entrance to its main activity at most 60.
4. In Studio, create `Workspace.Map` with child Models `Hub`, `Zone1`...`ZoneN`, `Gates`, `ZoneVolumes`, `Cameras` and `Decor`. Set `ModelStreamingMode` on `ZoneVolumes` to Persistent.
5. Greybox with anchored blocks: floors grey (`#8A8A8A`), interactables yellow (`#FFC400`), hazards red (`#FF3B30`), gates blue (`#2D7FF9`), and landmarks as tall white blocks. No art yet [27].
6. Place SpawnLocations (rules 1-4), facing the first objective. Set `Duration`, `Neutral` and `Enabled`.
7. Add the zone volumes (rule 18) and gate frames (rules 12-13).
8. Playtest the greybox with 2-3 clients (Test tab → Local Server): walk the first five minutes, time each leg, and check sightlines from spawn and each gate. Fix the layout now. Moving a block is cheap; moving a dressed zone isn't.
9. Ask Kid Tester for a greybox read: "From spawn, what would you do first?" If the answer isn't the first objective, fix the sightlines.
10. Pick `LightingStyle` and `PrioritizeLightingQuality` (rules 19-20) and apply the base mood preset with the edit-mode applier.
11. Block in Terrain: ground, hills, water and cliffs on the 4-stud voxel grid (Terrain section). Paint at least 3 materials per zone.
12. Ask Librarian for each zone's modular kit and landmark mesh (rule 48). Every kit piece has a bottom-center pivot and a 4-stud footprint multiple.
13. Replace greybox blocks with kit pieces zone by zone, starting with the hub, then zone 1. Keep the greybox layout exactly unless the playtest said otherwise.
14. Build the landmarks and set their streaming level of detail (rule 9).
15. Dress props by density level (rules 45-47), from outside in, keeping lanes clear.
16. Add guidance: light leads, leading lines, breadcrumbs, affordance pads and sound beacons (rules 50-54).
17. Set collision: decor flags, CollisionFidelity and invisible walk surfaces (rule 49).
18. Per-zone lighting presets in `Config.Moods`, applied by the client zone controller (rule 31).
19. Run the audit script, fix every warning, and check the part and transparency budgets (rules 60-62).
20. Do the Minimum visual bar pass and the phone test (rules 63-64), take the screenshot set, and send it to Review with one question ("Does the spawn view make you want to go to the field?").

### Lighting a zone in 10 steps

Roblox's core curriculum lesson on customizing global lighting walks the same properties in order [13]; this is the studio version with our presets.

1. Pick the mood row from the mood table that matches the zone's tier and genre.
2. Set `ClockTime` first and look at the zone from its entrance. Turn the view so the sun lights the landmark from the side.
3. Set `Brightness`, then `ExposureCompensation` (small steps).
4. Set `OutdoorAmbient` and `Ambient`. Check the darkest corner on a dimmed screen.
5. Set Atmosphere `Density` and `Offset` until the far edge of the zone fades but the landmark still reads, then `Color`, `Decay`, `Haze` and `Glare`.
6. Set ColorCorrection `Saturation` and `Contrast`. Compare against the hub, since neighboring zones should differ (rule 11).
7. Set Bloom. Raise `Threshold` until no non-Neon surface glows.
8. Set SunRays if the sun is visible in the main views.
9. Place hero local lights (at most 8 shadowed per view, rule 32) and Neon accents on the goal (rule 50).
10. Save the values into `Config.Moods.<Preset>`, check at quality 1, 5 and 10, and take the screenshot.

### Dressing a 50 x 50 area in 8 steps

1. Mark the walking lanes (12-20 studs) with a temporary bright floor color.
2. Place the focal prop at the area's main intersection or end of a sightline.
3. Line the lane edges with 3-6 medium props in odd groups of mixed heights.
4. Add 10-30 small details in clusters at prop bases, corners and walls.
5. Add one light story (a lamp cluster, a glowing window) that also points toward the next goal.
6. Set collision flags on everything you placed.
7. Walk through at play camera height, zoomed in and out, on PC and in the Device Emulator. Remove anything the character snags on or the camera clips through.
8. Restore the lane floor material and count the parts you added.

### Pre-Review visual pass in 10 steps

1. Run the world audit and paste the output.
2. Fly the free camera along every lane at 3 studs high looking for gaps, z-fighting (two coplanar surfaces flickering), floating props and holes into the void.
3. Check every sign is readable at 40 studs and that SurfaceGuis use `LightInfluence` 0.
4. Check Neon share and accent discipline at spawn and each gate (rules 38, 40).
5. Check floor and wall value contrast in each zone (rule 39).
6. Check the full lighting stack and that Atmosphere is the only fog (rules 21, 27).
7. Switch ClockTime to the darkest time the game uses and check readability.
8. Test the 3 quality levels and the Device Emulator phone preset (rule 36).
9. Take the screenshot set: spawn, each gate, each landmark, at 10/40/120 studs, in `games/<slug>/reports/visual-<date>/`.
10. Send to Review with the screenshots, the audit and one question.

## Spawn and lobby specs

| Element | Size and placement | Properties and notes |
|---|---|---|
| SpawnLocation (single) | 12 x 1 x 12 or larger, flush with floor | `Anchored`, `CanCollide`, `Neutral = true` (non-team), `Duration = 0` (non-combat) or 3-5 (combat), decal removed |
| SpawnLocation ring | 4-12 pads, 6 x 1 x 6, 8+ studs apart | All rotated toward the first objective; same material as floor |
| Spawn hub | 60-120 studs across, 3-5 exits | Walls at most 8 studs high; landmark visible; densest props (rule 46) |
| First objective | At most 30 studs from spawn, in the 90° cone | Accent color, raised 0.5-1 stud, icon at 4 studs up |
| Shop or sell pad | At most 40 studs from spawn | 6 x 6 pad, Neon rim, BillboardGui icon, `MaxDistance` 80 |
| Next gate | At most 120 studs, framed by an arch | Cost sign letters at least 2 studs tall, both sides |
| Queue pad (round games) | 8 x 8 | Accent color, player count on a SurfaceGui, timer above |
| Next-map board | 12 x 8 SurfaceGui at eye height + 4 | `LightInfluence` 0, readable from the queue pad |
| Cosmetic mirror | 6 x 10 frame, facing the plaza | Preview area lit by a soft PointLight (`Shadows = false`) |
| Lobby toy | Trampoline, slide or 6-jump mini obby | Within 30 studs of spawn, never blocking the main lane |
| Home pad (each zone) | 6 x 6, at the zone entrance | Teleports to spawn through the server, 3-5 s cooldown |
| Thumbnail camera marks | Parts in `Map.Cameras` | Named `Thumb_Hub`, `Thumb_Zone3` and so on; Splash uses them |

## Zones and landmarks specs

**Zone table template (copy into `plan.md`):**

| ZoneId | Name | Tier | Palette (base / secondary / accent) | Landmark | Ground | Preset | Music | Gate key |
|---|---|---|---|---|---|---|---|---|
| Z1 | Meadow | 1 | `#7BC950` `#E8D9A8` / `#5A9BD8` / `#FFC400` | Windmill, 70 studs | Grass, Ground, Rock | BrightDay | Folk | none |
| Z2 | Desert | 2 | `#E3B873` `#C98B4A` / `#7FB3C9` / `#FFC400` | Pyramid, 110 studs | Sand, Sandstone | DesertNoon | Drums | `Gates.Z2` |
| Z3 | Snow | 3 | `#DDE8F2` `#9FC3E0` / `#5B6F8A` / `#FFC400` | Ice palace, 140 studs | Snow, Glacier, Slate | Snow | Bells | `Gates.Z3` |
| Z4 | Volcano | 4 | `#3A2A2A` `#6B3B2B` / `#FF6A2B` / `#FFC400` | Erupting cone, 200 studs | Basalt, CrackedLava | Lava | Brass | `Gates.Z4` |

**Landmark spec:**
- Height at least 3x the tallest nearby object; 60-200 studs depending on tier.
- A silhouette you can draw in five lines (tower, cone, tree, ring, statue).
- A lit top: Neon element, PointLight (`Range` 30-60, `Shadows = false`) or a ParticleEmitter plume.
- Streaming: `LevelOfDetail = StreamingMesh` for large landmarks, `ModelStreamingMode = Persistent` for small ones [23].
- Placed at the far end of the main sightline from the zone entrance and visible from the hub.

**Gate spec:**
- Arch or gap at least 12 studs wide and 14 tall, framing the next landmark from the approach.
- Barrier Part: `Transparency` 0.5, `Material = ForceField` or accent color, `CanCollide = true` while locked.
- Cost SurfaceGui on both sides, cost and icon from `Config`, padlock icon, letters at least 2 studs tall.
- Unlock: barrier tweens to `Transparency = 1` and `CanCollide = false` for that player (client-side for per-player gates, with the server checking position on entry), plus a burst effect and a sound.
- Players who haven't unlocked are stopped by the server, not just by the client barrier ([[13 Building It Right]]).

## Lighting values per mood

These presets are this studio's starting targets, not Roblox defaults. Put them in `Config.Moods` and tune by eye. Ambient colors are RGB. "PLQ" is `PrioritizeLightingQuality`.

### Core lighting

| Preset | LightingStyle | PLQ | ClockTime | Brightness | Exposure | Ambient | OutdoorAmbient | Diffuse / Specular |
|---|---|---|---|---|---|---|---|---|
| BrightDay (sim, obby) | Realistic | false | 14 | 2.5 | 0 | 70, 70, 80 | 125, 125, 140 | 1 / 0.5 |
| Pastel (young kids) | Realistic | false | 13 | 2.2 | 0.2 | 90, 85, 100 | 150, 140, 160 | 1 / 0.3 |
| GoldenHour | Realistic | false | 17.2 | 2 | 0.1 | 80, 65, 60 | 140, 110, 95 | 1 / 0.8 |
| Overcast | Realistic | true | 11 | 1.2 | -0.2 | 90, 95, 105 | 110, 115, 125 | 1 / 0.4 |
| SpookyNight | Realistic | true | 0.5 | 0.8 | -0.3 | 25, 25, 40 | 45, 50, 75 | 0.6 / 0.6 |
| HorrorInterior | Realistic | true | 0 | 0.2 | -0.5 | 8, 8, 12 | 15, 15, 22 | 0.3 / 0.5 |
| NeonCity | Realistic | true | 21 | 1 | 0 | 35, 30, 55 | 60, 55, 95 | 1 / 1 |
| Underwater | Realistic | false | 12 | 1.5 | -0.1 | 40, 90, 110 | 60, 120, 140 | 1 / 0.3 |
| Lava | Realistic | true | 19 | 1.4 | 0 | 90, 40, 30 | 120, 60, 45 | 1 / 0.6 |
| Snow | Realistic | false | 12 | 2.2 | -0.2 | 110, 120, 140 | 150, 165, 185 | 1 / 1 |
| DesertNoon | Realistic | false | 12.5 | 3 | -0.1 | 110, 95, 80 | 165, 140, 115 | 1 / 0.5 |
| Jungle | Realistic | true | 15 | 2 | 0 | 60, 80, 55 | 95, 120, 90 | 1 / 0.6 |
| Space | Realistic | true | 0 | 1 | 0 | 40, 40, 60 | 60, 60, 90 | 1 / 1 |
| ShopInterior | Realistic | true | 14 | 2 | 0.3 | 120, 115, 110 | 130, 130, 130 | 1 / 0.6 |
| Classic (retro look) | Soft | false | 14 | 2 | 0 | 128, 128, 128 | 128, 128, 128 | 0.5 / 0.2 |

### Atmosphere and post-processing

| Preset | Atmosphere Density / Offset | Atmo Color / Decay | Glare / Haze | CC Brightness / Contrast / Saturation | CC TintColor | Bloom Intensity / Size / Threshold | SunRays Intensity / Spread |
|---|---|---|---|---|---|---|---|
| BrightDay | 0.30 / 0.25 | `#C7D7F0` / `#6A7FA8` | 0 / 1 | 0.02 / 0.08 / 0.15 | `#FFFFFF` | 0.5 / 24 / 1.8 | 0.08 / 0.8 |
| Pastel | 0.25 / 0.20 | `#F2D9F0` / `#B59AD8` | 0 / 0.5 | 0.03 / 0.05 / 0.25 | `#FFF6FB` | 0.4 / 28 / 1.6 | 0.05 / 0.6 |
| GoldenHour | 0.35 / 0.20 | `#FFD3A1` / `#B0705A` | 1.5 / 1.5 | 0 / 0.10 / 0.10 | `#FFE9D2` | 0.6 / 26 / 1.6 | 0.12 / 0.7 |
| Overcast | 0.45 / 0.10 | `#AEB7C2` / `#7C8794` | 0 / 2.5 | -0.02 / 0.05 / -0.15 | `#EEF3FA` | 0.3 / 20 / 2.2 | off |
| SpookyNight | 0.45 / 0.05 | `#3B4466` / `#1A1F33` | 0 / 2 | -0.05 / 0.15 / -0.25 | `#D9E4FF` | 0.7 / 30 / 1.4 | off |
| HorrorInterior | 0.55 / 0 | `#202024` / `#101014` | 0 / 3 | -0.08 / 0.20 / -0.35 | `#E6EEFF` | 0.6 / 32 / 1.2 | off |
| NeonCity | 0.35 / 0.10 | `#4B3C7A` / `#1E1438` | 0 / 1.5 | 0 / 0.15 / 0.20 | `#F0E8FF` | 1.0 / 36 / 1.1 | off |
| Underwater | 0.60 / 0 | `#2E8FA8` / `#0E4A63` | 0 / 3 | 0 / 0.05 / 0.05 | `#BFF2FF` | 0.4 / 24 / 1.8 | 0.10 / 1.0 |
| Lava | 0.45 / 0.10 | `#C2552F` / `#4A1A10` | 2 / 2 | 0 / 0.12 / 0.10 | `#FFE2D0` | 0.9 / 30 / 1.3 | 0.05 / 0.5 |
| Snow | 0.35 / 0.25 | `#DCE8F5` / `#8EA6C8` | 0 / 1.2 | 0 / 0.05 / -0.05 | `#F2F8FF` | 0.3 / 20 / 2.4 | 0.06 / 0.8 |
| DesertNoon | 0.35 / 0.25 | `#F0D8B0` / `#C28E5A` | 0.5 / 1.5 | 0 / 0.08 / 0.05 | `#FFF3E2` | 0.3 / 22 / 2.4 | 0.10 / 0.9 |
| Jungle | 0.45 / 0.10 | `#B8D6A8` / `#5C7F52` | 0 / 1.8 | 0 / 0.08 / 0.12 | `#F6FFF0` | 0.4 / 24 / 1.8 | 0.15 / 0.6 |
| Space | 0 / 0 (or no Atmosphere) | n/a | 0 / 0 | 0 / 0.10 / 0.10 | `#F0F4FF` | 0.8 / 30 / 1.3 | off |
| ShopInterior | 0.20 / 0.25 | `#E8E4DC` / `#A89F90` | 0 / 0.5 | 0.03 / 0.05 / 0.15 | `#FFF8F0` | 0.5 / 24 / 1.6 | off |
| Classic | 0.20 / 0.30 | `#C7D7F0` / `#6A7FA8` | 0 / 0 | 0 / 0 / 0 | `#FFFFFF` | 0.2 / 24 / 2.5 | off |

**Mood notes:**
- **BrightDay** is the default for simulators, tycoons and obbies. Sun to the side of the spawn view. Keep `ShadowSoftness` (Realistic only [4]) around 0.2-0.3 for soft but present shadows.
- **Pastel** is for games aimed at younger players: lower specular so plastic looks matte, higher saturation, slightly over-exposed.
- **GoldenHour** is for hubs, social games, roleplay towns and thumbnails. Long shadows show form, and Glare plus Haze give a warm sun halo [14].
- **Overcast** hides streaming edges and suits mystery, survival and story chapters. No sun rays.
- **SpookyNight** is outdoor horror-lite (Halloween events, survival nights). Blue-tinted shadows keep paths readable.
- **HorrorInterior** relies on the player's light and placed lights. Pair it with rule 34's guidance timer.
- **NeonCity** suits shooters, racing and party games at night. Bloom higher so signage glows. Many Neon strips, but still under 5% of surfaces where you walk.
- **Underwater**: high Density with a cyan Color, a Camera ColorCorrection tint when the camera is under the surface, and particles for bubbles. Sun rays at full spread fake light shafts.
- **Lava**: orange haze with Glare, dark walkable rock, lava as Neon or terrain CrackedLava, and an ember ParticleEmitter.
- **Snow**: lower exposure and a high Bloom threshold so snow doesn't blow out, with blue ambient.
- **Space**: remove or zero the Atmosphere, use a starfield Sky (`StarCount` high, `CelestialBodiesShown` as needed), and keep planets and stations self-lit with Neon details.
- **Classic**: Soft style for a flat, classic look. For a closer old-Roblox match, add a ColorGradingEffect with the Retro tonemapper, as the docs and community suggest for imitating legacy lighting [7], [18].

## Materials and palettes

### Zone palette library

| Mood | Base colors | Secondary | Terrain materials | Notes |
|---|---|---|---|---|
| Meadow (start) | `#7BC950`, `#E8D9A8` | `#5A9BD8` | Grass, Ground, Rock | Friendly default, high readability |
| Forest | `#3F7D3A`, `#6B4F2A` | `#A7C957` | LeafyGrass, Mud, Rock | Darker floor, light paths |
| Beach | `#F2DFA7`, `#3FB8C9` | `#FF8C69` | Sand, Water, Sandstone | Coral accents, but not hazard red |
| Desert | `#E3B873`, `#C98B4A` | `#7FB3C9` | Sand, Sandstone, Limestone | Blue secondary for oases and signs |
| Snow | `#DDE8F2`, `#9FC3E0` | `#5B6F8A` | Snow, Glacier, Slate | Keep V at or below 90 |
| Cave / crystal | `#2E2A3A`, `#4B4560` | `#7FE0FF` | Slate, Basalt, Rock | Crystals are the light source |
| Lava | `#3A2A2A`, `#6B3B2B` | `#FF6A2B` (hazard) | Basalt, CrackedLava | Walkable rock stays dark |
| Candy | `#FFB3D9`, `#B3E5FF` | `#FFF2A8` | Plastic-like: Snow tinted pink, Sand tinted cream | Use SmoothPlastic everywhere |
| Sci-fi | `#C9D3DD`, `#3A4654` | `#00D1FF` | Asphalt, Pavement, Concrete | Neon strips as guidance |
| Spooky | `#2B2D42`, `#4A4E69` | `#8BE38B` (exits) | Mud, Ground, Rock | Green or warm light for exits |
| City / roleplay | `#B8B8B8`, `#6F7B88` | `#FFD166` | Asphalt, Pavement, Concrete | Cars and signs carry color |
| Fantasy castle | `#9A9A9A`, `#5A6B3A` | `#5B8DEF` | Cobblestone, Grass, Slate | Banners add hue |
| Underwater | `#1F6F8B`, `#E0C58F` | `#FF7AA2` | Sand, Rock, Water | Pink and coral for life |
| Space | `#14182B`, `#3C4370` | `#FFC94A` | Basalt, Slate | Accent stars and beacons |

**Game-wide accent:** pick one and keep it across every zone, for example `#FFC400` (gold) for buy, collect and goal. Optional second signal colors: green `#34C759` for safe or go, and red `#FF3B30` for danger only.

### Material usage

| Use | Stylized game | Realistic game | Avoid |
|---|---|---|---|
| Floors and paths | SmoothPlastic, Plastic, Concrete | MaterialVariant (Pavement, Cobblestone, Wood) | Glass, Neon, Foil |
| Walls | SmoothPlastic, Brick, WoodPlanks | MaterialVariant per zone kit, StudsPerTile 8 | Mixed realistic and flat in one wall |
| Interactables | SmoothPlastic in the accent color + Neon rim | Same: interactables stay stylized for readability | Realistic textures on buy pads |
| Hazards | Neon or CrackedLava terrain, hazard hue | Same | Hazard hue on decor |
| Glass | Glass, `Transparency` 0.3-0.6, one layer | Glass + SurfaceAppearance for frames | Stacked panes, big glass floors |
| Magic or shields | ForceField material, `Transparency` 0.3-0.6 | Same | Large ForceField areas over the play space |
| Metal | Metal, DiamondPlate | SurfaceAppearance metalness map [21] | Foil on large areas (noisy reflections) |
| Hero meshes | Vertex-colored or flat `Color` | SurfaceAppearance (color, normal, roughness, metalness) [21] | 4 x 1024 maps on small props |

## Prop density

| Area type | Focal props per 50 x 50 | Medium | Small | Lane width | Notes |
|---|---|---|---|---|---|
| Spawn hub | 1-2 | 6-10 | 25-40 | 16-20 | Highest density; thumbnail spot |
| Shop plaza | 1 | 5-8 | 20-30 | 14-18 | Stalls frame the shop counters |
| Farm or collection field | 0-1 (at edge) | 2-4 (at edge) | 5-15 (at edge) | Whole field clear | Keep collectibles visible; no decor inside fields |
| Transit path | 0 | 2-4 | 6-12 | 12-16 | Lanterns or fences as leading lines |
| Zone interior | 1 | 3-6 | 10-30 | 12-20 | Rule 45 baseline |
| Combat arena | 1 (center or edge) | 4-8 cover pieces | 5-10 | Open | Cover at 4-6 studs tall, consistent |
| Obby stage | 0-1 (backdrop) | 0-2 | 0-6 | Platforms only | Decor below or beside the route, never on it |
| Horror room | 1 (story prop) | 3-6 | 10-20 | 6-10 | Clutter tells the story; keep the exit clear |
| Tycoon plot | 0 (the build is the focus) | 1-2 | 5-10 at the border | Plot clear | Plot borders mark ownership |
| Background (unreachable) | Big silhouettes only | n/a | none | n/a | Terrain and a few big meshes |

## Guidance toolkit

| Cue | How in Studio | Cost | Use when |
|---|---|---|---|
| Light lead | Warm PointLight (`Range` 16-24, no shadows) or Neon at the goal | Low | Always, for the next goal |
| Leading lines | Path material with edges pointing at the goal; fences, rivers, rooflines | Free | Every main route |
| Framing | Arch, gap or trees framing the landmark from the approach | Free | Gates, zone entrances |
| Landmark | Tall unique model, lit top, streaming LOD (rule 9) | Medium | Every zone |
| Breadcrumbs | Collectibles every 6-10 studs along the first route | Low | First session; new zones |
| Affordance pads | Raised accent pads with icons (rule 52) | Low | Every interactable |
| Color language | Accent = use, green = safe, red = danger | Free | Game-wide |
| Signage | SurfaceGui or BillboardGui, letters at least 2 studs, `LightInfluence` 0 | Low | Gates, shops, zone names |
| Sound beacon | Looping positional Sound, `RollOffMaxDistance` 60-80 | Low | Shops, quest givers, objectives |
| NPC gaze or gesture | NPC faces or points at the goal (animation) | Medium | Tutorial and quest starts |
| Denial and reward | Next zone visible through the gate [32] | Free | Every gate |
| Beam path | Client Beam from the character to the target (Luau section) | Low | After 10-20 s stuck, or tutorial |
| Highlight | `Highlight` on the target, `DepthMode` AlwaysOnTop | Low (31 max) | Hidden objective, after a stuck timer |
| Stuck helper | Timer and a guide effect (Doors' Guiding Light pattern [46]) | Low | Dark, maze-like or puzzle spaces |

## Scale reference

| Element | Size (studs) | Note |
|---|---|---|
| Default avatar height | about 5 | Community measurements [39]; scale up to about 105% [36], [37] |
| Doorway | 6-8 wide x 9-10 tall | Bigger for shops and group traffic |
| Gate arch | at least 12 wide x 14 tall | Frames the next landmark |
| Interior ceiling | 14-20 | The camera needs headroom |
| Corridor | at least 10 wide | 14+ for multiplayer |
| Main path | 12-20 wide | 24+ in hubs |
| Stair step | at most 1 rise, 1.5-2 deep | Or ramp with an invisible wedge |
| Railing or low wall | about 3 | Above 4 blocks the camera |
| Counter or table | 3-4 high | Heroic scale |
| Bench or seat | about 2 high | Seat parts for sitting |
| Interactable pad | at least 4 x 4, raised 0.5-1 | 6 x 6 for buy and sell pads |
| Beginner obby platform | at least 4 x 4 (6 x 6 early) | Gaps at most 5 |
| Flat running jump | about 8.7 | At WalkSpeed 16, JumpHeight 7.2, Gravity 196.2 |
| Max jump-up | 5.5 safe | Apex 7.2 |
| Sign letters | at least 2 tall at 40 studs | 3+ for zone names |
| Landmark | 60-200 tall | 3x neighbors |
| Spawn hub | 60-120 across | 3-5 exits |

## Camera settings by genre

| Genre | CameraMaxZoomDistance | CameraMode | Occlusion | FOV | Notes |
|---|---|---|---|---|---|
| Simulator, tycoon, RNG | 128 (default) or 80 | Classic | Zoom | 70 | Players zoom out to see pets and builds |
| Obby | 60-128 | Classic | Zoom | 70 | Shift lock on; no low ceilings over jumps |
| Roleplay, social | 128 | Classic | Zoom; Invisicam in houses | 70 | Houses tall enough for the camera |
| Combat, battlegrounds | 25-40 | Classic | Zoom | 70, +8 on dash | Shift lock on |
| Shooter | 0.5 (locked) or 15 for third person | LockFirstPerson or Classic | n/a | 70-80 | Aim FOV 50-60 while aiming only |
| Horror | 15-25 | Classic or LockFirstPerson | Invisicam | 70 | Low zoom cap keeps scares in front |
| Racing | Custom chase camera | Scriptable or Custom | n/a | 70, +10 at top speed | Camera behind and above the car |
| Tower defense | 128+, or a top-down Scriptable camera | Classic | Zoom | 70 | Board must be fully visible |
| Story, puzzle | 25-60 | Classic | Invisicam indoors | 70 | Short skippable cutscenes |

## Terrain recipe

1. **Ground:** `Terrain:FillBlock` a slab 8-16 studs thick under the playable area. Terrain is a 4-stud voxel grid, so fills snap to it. Don't fill hundreds of studs deep: underground voxels still cost memory.
2. **Shape:** Terrain Editor → Sculpt (Add, Subtract, Grow, Erode), then Smooth, then Flatten for walkable areas. Keep walkable slopes under about 35° so they look walkable.
3. **Paint:** at least 3 materials per zone (rule 43). Paint paths with a contrasting material that leads to the goal.
4. **Color:** `Terrain:SetMaterialColor(Enum.Material.Grass, Color3.fromHex("#7BC950"))` for each material in the palette. This is global per material.
5. **Water:** `Terrain.WaterColor`, `WaterTransparency` (0.3-0.6 for readable shallows), `WaterWaveSize` (0.05-0.2) and `WaterWaveSpeed` (5-12). Players swim in terrain water, so mark safe shores.
6. **Decoration:** `Terrain.Decoration = true` gives animated grass on Grass material. Turn it off if the grass hides small collectibles.
7. **Clouds:** a `Clouds` object under `Workspace.Terrain` (`Cover` 0.4-0.7, `Density` 0.3-0.6, `Color` slightly warmer or cooler than the sky).
8. **Edges:** surround the map with cliffs, water or dense terrain so the edge reads as natural. Never leave a visible end of the world from the playable space.

## Performance budgets

| Item | Target | How to check |
|---|---|---|
| BaseParts, spawn hub | at most 3,000 | Audit script, by folder |
| BaseParts, each zone | at most 6,000 | Audit script |
| BaseParts, whole map | at most 25,000 | Audit script |
| Unique MeshIds | at most about 150 | Audit script |
| Custom MaterialVariants | at most 12 | MaterialService children |
| Shadowed local lights per view | at most 8 | Audit script, look at the view |
| Total local lights | at most 150, mostly shadowless | Audit script |
| Neon share in a view | under 5% | Look at it |
| Overlapping transparent layers | at most 2 | Look at it |
| Highlights at once | a few; hard limit 31 | Code review |
| Unanchored loose parts | 0 | Audit script |
| Decor with CanTouch on | 0 | Audit script |
| Frame rate | 60 on PC, 30+ on a low-end phone | MicroProfiler, Device Emulator, real phone |
| Client memory | track per release, fix growth | Developer Console, Memory tab |

## Minimum visual bar

A map passes only when every line is true. Producer checks this list in Studio.

- [ ] No default Baseplate, no default spawn decal, and no untouched medium-grey Plastic in any spawn or gate screenshot.
- [ ] LightingStyle and PrioritizeLightingQuality set on purpose and written in `decisions.md`.
- [ ] Sky, Atmosphere, ColorCorrectionEffect and BloomEffect present (SunRays outdoors), no duplicates.
- [ ] No Bloom glow on non-Neon surfaces at spawn.
- [ ] Every zone has a landmark visible from its entrance and from the hub.
- [ ] At least 3 ground materials per zone, colored to the palette.
- [ ] Accent color only on interactables; Neon under 5% of view.
- [ ] Floor vs wall contrast at least 25 V in every zone.
- [ ] Signs readable at 40 studs, `LightInfluence` 0 on all sign GUIs.
- [ ] No z-fighting, gaps, floating props or holes to the void in any screenshot.
- [ ] Map edge reads as natural from every reachable point.
- [ ] Readable at graphics quality 1 and in the Device Emulator phone preset.
- [ ] Audit: 0 loose unanchored parts, 0 decor CanTouch, budgets met.

## Examples from top games

### Gates named by what they ask for
**Game:** Bee Swarm Simulator ([40], [41])
**Shows:** The world is divided by gates named after their requirement. The Basic Bee Gate (also called the 5 Bee Gate) is the first gate a player must unlock and needs five bees. The Ant Gate (the 20 Bee Gate) needs 20 bees.
**Why it works:** The name is the goal. Players know exactly what to grow toward, and the gate's physical position turns a number into a place.
**Steal:** Put the requirement on the gate in huge text, and make the gate's name in UI and in-world the same thing ("5 Bee Gate").
**Avoid:** Gates whose requirement is only visible after touching them, or written in a font that can't be read from the approach path.

### A generous starter zone with no requirements
**Game:** Bee Swarm Simulator ([42])
**Shows:** The Starter Zone is the group of places that need no bee prerequisites, and it holds the most fields of any zone (five).
**Why it works:** New players get choice and space before the first gate. Crowding is spread across five fields instead of one.
**Steal:** Give zone 1 three to five activities that need nothing, close to spawn (rule 14).
**Avoid:** A single starter activity that every new player has to queue for.

### Tiered fields behind tiered gates, with color identity
**Game:** Bee Swarm Simulator ([43], [44])
**Shows:** The Rose Field is one of four fields past the Honey Bee Gate, with a listed requirement of 15 bees. The Mushroom Field has no prerequisite and is described as the first red field available.
**Why it works:** Each field has a color identity, so the world doubles as a legend for the game's systems. Later fields sit behind later gates, so geography equals progress.
**Steal:** Tie zone palettes to a game system (element, rarity, team color) so players read the map as a progress chart (rule 11).
**Avoid:** Palette changes that mean nothing, so the colors can't teach anything.

### A portal as the door to a special area
**Game:** Bee Swarm Simulator ([45])
**Shows:** The Hive Hub sits inside the Hive Hub Portal, which is past the Ant Gate.
**Why it works:** A portal marks a clear threshold. Players know they're entering somewhere different, and the hub can have its own look and rules.
**Steal:** Use portals with a short fade and sound for big area changes (rule 16), and put them behind a progression gate so reaching them feels earned.
**Avoid:** Unmarked teleport bricks that move players without a frame or effect.

### Guidance that only appears when a player is stuck
**Game:** Doors ([46])
**Shows:** Guiding Light uses glowing blue particles to point players toward their next move. If a player is stuck in a Dark Room, or sometimes in a normal room, for more than 20 seconds, it lights up the next door.
**Why it works:** The level's darkness stays scary for players who find their way, and the guide rescues the rest before frustration turns into quitting.
**Steal:** A stuck timer (10-20 s without progress) that triggers a soft in-world guide (rule 53).
**Avoid:** Guidance that's always on, which drains tension, or none at all in a dark maze.

### Help that scales with stress
**Game:** Doors ([46])
**Shows:** Guiding Light also lights up the path during Seek's chase and can highlight hidden keys when players are having trouble finding them.
**Why it works:** In a chase there's no time to read the room, so the game shows the route. Hidden-object hints stop a puzzle becoming a pixel hunt.
**Steal:** During timed or chase sections, light the correct route with a color the game uses only for guidance.
**Avoid:** Chases through dark rooms where the right door looks identical to the wrong ones.

### A new floor is a new world kit
**Game:** Doors ([47], [48])
**Shows:** Doors has more than one floor: the wiki lists The Hotel (Floor 1) and The Mines as separate areas, with Guiding Light appearing in both.
**Why it works:** A new floor brings a new environment set (materials, lighting, layout rules) while keeping the systems and guidance the player already knows.
**Steal:** Build each major content update as a new zone kit plus a mood preset, and reuse the guidance language (same guide color, same door affordance).
**Avoid:** New areas that change the visual meaning of things players already learned.

### A spawn hub that holds the social systems
**Game:** Pet Simulator 99 ([52])
**Shows:** Spawn is the first hub of World 1 and is unlocked by default, with a shop, a mailbox and leaderboards.
**Why it works:** The places players return to (trading by mail, showing off on leaderboards, buying) sit where everyone spawns, so the hub stays busy at every level.
**Steal:** Put permanent social and economy features at spawn (rule 17): leaderboards on big walls, the mailbox or trading booth, the shop.
**Avoid:** Moving social features to the newest zone, which empties the hub.

### A long starter route with rising costs
**Game:** Pet Simulator 99 ([52], [53])
**Shows:** The bloxodes wiki describes a long starter route from Spawn through Rainbow Road. Pro Game Guides' area table lists early unlock costs rising from Colorful Forest (Area 2, 900 coins) to Castle (Area 3, 2.5k) and Green Forest (Area 4, 8k), at the time of that guide.
**Why it works:** Each new area is a small, fast, visible step early on. The route itself is the progress bar.
**Steal:** Early gates in a steady multiplier (here roughly 2.8x then 3.2x), each with a new palette and landmark. Get the actual numbers from Balance ([[04 Progression and Economy]]).
**Avoid:** A huge jump at gate 2 that stalls new players before they've seen the second zone.

### Two shops facing each other across the map
**Game:** Grow a Garden ([49], [51])
**Shows:** Guides describe a Seed Shop run by an NPC and a Gear Shop on the other side of the map, directly in front of the Seed Shop. Guides say both shops' stock restocks every five minutes.
**Why it works:** The shared middle between the shops becomes the social space, and the two most visited buildings act as landmarks for each other.
**Steal:** Put the two most visited buildings at opposite ends of a central plaza, with player plots or activities between them.
**Avoid:** Shops hidden down side paths. One guide notes the Gear Shop sometimes doesn't appear and suggests restarting [49], a reminder to test that key buildings stream in for every player (rule 62).

### A small personal plot that rewards arranging
**Game:** Grow a Garden ([50])
**Shows:** Layout guides advise planning the farm because space is limited, sorting plants by size and moving plants with the Trowel.
**Why it works:** A bounded personal plot makes space a resource and turns the player's own area into a creative, shareable space.
**Steal:** Clear plot borders (rule 46's density table: plot clear, decor at the border) and a grid that makes arranging easy.
**Avoid:** Decoration inside the plot area that fights the player's own layout.

### Light that grows the world
**Game:** 99 Nights in the Forest ([54], [55])
**Shows:** Guides say upgrading the campfire with fuel expands the map, letting players explore areas that were previously inaccessible and revealing more structures, resources and objectives, with more danger and better loot.
**Why it works:** The central light is both the safe zone and the progress meter. Players can see the world literally getting bigger as they invest.
**Steal:** Tie world size or visibility to a central, upgradable light source (survival, horror, base-building), and make the boundary visible (fog wall, darkness edge) so players know there's more.
**Avoid:** An invisible boundary with no visual explanation.

### A lobby that previews the maps
**Game:** Natural Disaster Survival ([56], [57])
**Shows:** Rounds play out on a separate island, while the lobby has a room upstairs with four miniature models of maps (Arch Park, Height School, Launch Land, Modest Headquarters), which a 2025 event quest asked players to visit.
**Why it works:** The lobby teaches what's coming, gives waiting players something to look at, and gives events a place to hide quests.
**Steal:** Model upcoming maps or zones as small dioramas in the lobby (rule 6), and reuse them for events.
**Avoid:** A lobby that's just a waiting box.

### A tower you can see from anywhere
**Game:** The Elder Scrolls IV: Oblivion (non-Roblox reference) ([33])
**Shows:** The Press Start article uses Oblivion's central tower as an architectural landmark that tells players where they are relative to the center of the map.
**Why it works:** One giant, unique silhouette gives the whole map a compass.
**Steal:** A hub landmark tall enough to see from every zone, with streaming LOD so it never disappears (rule 9).
**Avoid:** Several similar towers, which break the compass.

### Weenies: the castle at the end of the street
**Game:** Disney parks, via Scott Rogers' GDC talk (non-Roblox reference) ([31])
**Shows:** The talk breaks down "weenies": landmarks that pull guests toward a location, each one revealing new options as the guest moves forward.
**Why it works:** Movement through the space becomes a chain of desires: see it, walk to it, find the next one.
**Steal:** Chain landmarks: from each landmark's base, the next one is visible.
**Avoid:** Landmarks you can only see once you've already arrived.

### A studio-grade environment built in four stages
**Game:** Roblox's Environmental Art curriculum sample places ([28], [29], [30])
**Shows:** Roblox's curriculum builds a laser tag environment in four chapters (greyboxing, polished assets, an asset library and constructing the world), with published sample places for the stages, including an asset library of modular assets, props and custom materials.
**Why it works:** It's Roblox's own reference for how a high-quality map gets made: layout proven first, then a reusable kit, then assembly and optimization.
**Steal:** Open the sample places in Studio and copy the process (and the folder structure), not the art.
**Avoid:** Jumping from idea to final art without a greybox or a kit.

## By genre

**Simulator.** Hub-and-spoke with spawn at the center. Zones are tiers, each with a landmark, palette and preset. Collection fields stay clear of decor so collectibles read. BrightDay or Pastel preset, PLQ false. The sell pad and the egg or shop are visible from spawn. Later zones get more effects. Watch part counts, because simulators grow to many zones (rule 61).

**Tycoon.** The plot is the stage. Plots are flat, clearly bordered (a 1-stud raised curb in the owner's color) and in a ring or grid around a central hub. Each plot's build sequence must look good at every stage, so empty plots shouldn't look broken. Purchase buttons follow the affordance language (rule 52). BrightDay preset. Background beyond the plots is low-detail. Keep enough distance between plots (8-16 studs) that one player's build doesn't hide another's buttons.

**Obby.** Linear route with checkpoints (rule 5). Platforms contrast with the void and background (rule 39). Hazards are always the hazard hue. Gaps follow the jump math (rule 56). Decor goes below or beside the route, never on it. Each 10-stage section gets a new palette and backdrop landmark. Keep camera headroom: no low ceilings over jumps. Lighting is bright with low fog, so the next platforms are visible.

**Roleplay and life sim.** A town with readable districts (homes, shops, school, hospital, park) and a central plaza as spawn. Golden hour or a day cycle with a long day. Interiors use Realistic with 1-stud-thick walls (rule 33) and tall ceilings for the camera (rule 55). Roads at least 20 studs wide with sidewalks. House plots in rows. Prop density is high but furniture can be sat on and walked around. Signs label every building.

**Action and combat.** Arenas with cover pieces of consistent height (4-6 studs for half cover, 8+ for full). Enemy telegraphs in the hazard hue only. Lighting with good contrast and no heavy fog. Spawn protection 3-5 s (rule 4). Camera zoom cap 25-40. Shadows on (Realistic) help read jump height and enemy position.

**Battlegrounds.** Mid-sized arenas (roughly 200-400 studs across), mostly flat with a few elevation features, and destructible or knock-back friendly props that reset. Strong, clean lighting so abilities read. The lobby is part of the arena or a short hop away. Spawn points around the edge. VFX are the color story, so keep the map desaturated slightly (Saturation -0.05 to 0) so effects pop.

**Survival.** A central base (campfire, shelter) as the light anchor, with the world revealed outward ([54], [55]). Day/night cycle of 10-20 minutes with readable night (rule 35). Resources visible at distance with distinct silhouettes. Fog or darkness edges explain the boundary. Overcast and SpookyNight presets.

**Horror.** HorrorInterior or SpookyNight presets, Realistic with PLQ true. The player's light casts shadows. Exits are readable with a dedicated guide color, and a stuck timer adds help ([46]). Zoom cap 15-25 with Invisicam. Rooms 14-20 studs tall, corridors at least 8-10 wide so chases don't snag. Sound beacons and audio carry tension. Every room needs a clear exit even in the dark.

**Tower defense.** A readable board: the enemy path is a contrasting material and color, tower slots are raised accent pads on a grid, and the base or goal is a landmark at the path's end. Top-down or high camera with no props taller than about 4 studs near the path. Lighting bright and even, with low fog. Decor only outside the board.

**RNG and collection.** The roll machine or altar is the landmark at spawn, with a stage for showing off rare pulls (spotlight, raised platform). The hub is dense and social. Rarity colors (from [[03 Rarity and RNG]]) never conflict with world hazard or accent colors. BrightDay or NeonCity for night-themed rolls.

**Shooter.** Lanes and sightlines are the design: three-lane layouts, consistent cover heights, and no ambiguous half-transparent cover. Lighting avoids heavy bloom and fog that hide players, with no very dark corners. Spawns protected and out of sightlines. NeonCity for night maps, with neon kept off the floor where players stand.

**Racing.** The track reads at speed: a contrasting road surface, curbs in alternating colors, signs before turns, and landmarks marking sections. Wide (30-50 studs) roads. The camera is a chase cam with a +10 FOV kick at top speed. Avoid high-frequency detail beside the track (it shimmers at speed). Atmosphere low density so the next turn is visible. Checkpoint gates are big arches.

**Sports.** A field with exact, readable markings (SurfaceGui or Neon lines), goals as landmarks, team colors on each half, and stands as a low-detail backdrop. Bright, even lighting with shadows on (to read ball height). No props on the field.

**Party and social hangout.** A plaza with seating, a stage, a few toys and photo spots. GoldenHour or Pastel. Many places to sit (Seat parts) and gather. Minigame portals around the edge with signs. The hub is the thumbnail. High prop density at the edges and an open middle.

**Story and puzzle.** Linear chapters, each with its own kit and mood preset. Lighting does the storytelling: warm safe rooms, cold danger rooms. Puzzle elements share one affordance color. Landmarks hint at the solution. Use the stuck timer for hints. Cutscenes at most 5 s and skippable (rule 59).

**Farming and fishing.** Personal plots or a shared farm with clear borders. Fishing spots marked by docks, ripples (particles) and signs. Water readable (`WaterTransparency` 0.3-0.5, distinct color per biome). Shops at either end of a plaza ([49], [51]). Biomes as zones with palettes and presets (Beach, Forest, Snow, Lava). A day cycle is fine if night stays readable.

## Luau

### Mood presets (shared config)

```lua
--!strict
-- ReplicatedStorage.Shared.Config.Moods (ModuleScript). Values come from the mood tables above.
export type Mood = {
	ClockTime: number, Brightness: number, ExposureCompensation: number,
	Ambient: Color3, OutdoorAmbient: Color3,
	EnvironmentDiffuseScale: number, EnvironmentSpecularScale: number,
	Atmosphere: { [string]: any }, ColorCorrection: { [string]: any },
	Bloom: { [string]: any }, SunRays: { [string]: any },
}
local rgb, hex = Color3.fromRGB, Color3.fromHex

local Moods: { [string]: Mood } = {
	BrightDay = {
		ClockTime = 14, Brightness = 2.5, ExposureCompensation = 0,
		Ambient = rgb(70, 70, 80), OutdoorAmbient = rgb(125, 125, 140),
		EnvironmentDiffuseScale = 1, EnvironmentSpecularScale = 0.5,
		Atmosphere = { Density = 0.3, Offset = 0.25, Color = hex("#C7D7F0"), Decay = hex("#6A7FA8"), Glare = 0, Haze = 1 },
		ColorCorrection = { Brightness = 0.02, Contrast = 0.08, Saturation = 0.15, TintColor = hex("#FFFFFF") },
		Bloom = { Intensity = 0.5, Size = 24, Threshold = 1.8 },
		SunRays = { Intensity = 0.08, Spread = 0.8 },
	},
	SpookyNight = {
		ClockTime = 0.5, Brightness = 0.8, ExposureCompensation = -0.3,
		Ambient = rgb(25, 25, 40), OutdoorAmbient = rgb(45, 50, 75),
		EnvironmentDiffuseScale = 0.6, EnvironmentSpecularScale = 0.6,
		Atmosphere = { Density = 0.45, Offset = 0.05, Color = hex("#3B4466"), Decay = hex("#1A1F33"), Glare = 0, Haze = 2 },
		ColorCorrection = { Brightness = -0.05, Contrast = 0.15, Saturation = -0.25, TintColor = hex("#D9E4FF") },
		Bloom = { Intensity = 0.7, Size = 30, Threshold = 1.4 },
		SunRays = { Intensity = 0, Spread = 0.5 },
	},
	Lava = {
		ClockTime = 19, Brightness = 1.4, ExposureCompensation = 0,
		Ambient = rgb(90, 40, 30), OutdoorAmbient = rgb(120, 60, 45),
		EnvironmentDiffuseScale = 1, EnvironmentSpecularScale = 0.6,
		Atmosphere = { Density = 0.45, Offset = 0.1, Color = hex("#C2552F"), Decay = hex("#4A1A10"), Glare = 2, Haze = 2 },
		ColorCorrection = { Brightness = 0, Contrast = 0.12, Saturation = 0.1, TintColor = hex("#FFE2D0") },
		Bloom = { Intensity = 0.9, Size = 30, Threshold = 1.3 },
		SunRays = { Intensity = 0.05, Spread = 0.5 },
	},
	-- Add the other presets from the tables the same way.
}

return Moods
```

### Apply a mood in edit mode (command bar or Studio MCP code execution)

```lua
-- Edit mode. Sets the lighting style, applies a mood and makes sure the effect stack exists once.
local Lighting = game:GetService("Lighting")
local module = game:GetService("ReplicatedStorage").Shared.Config.Moods
local Moods = require(module:Clone()) -- requiring a clone avoids a stale cached copy in the command bar
local mood = Moods.BrightDay

local ok, err = pcall(function()
	Lighting.LightingStyle = Enum.LightingStyle.Realistic
	Lighting.PrioritizeLightingQuality = false
end)
if not ok then warn("Set LightingStyle / PrioritizeLightingQuality in the Properties window:", err) end

for _, key in { "ClockTime", "Brightness", "ExposureCompensation", "Ambient", "OutdoorAmbient",
	"EnvironmentDiffuseScale", "EnvironmentSpecularScale" } do
	(Lighting :: any)[key] = (mood :: any)[key]
end

local function ensure(className: string, props: { [string]: any }?)
	local found = Lighting:FindFirstChildOfClass(className)
	local inst = found or Instance.new(className)
	for key, value in props or {} do
		(inst :: any)[key] = value
	end
	if not found then inst.Parent = Lighting end -- parent last
end

ensure("Sky")
ensure("Atmosphere", mood.Atmosphere)
ensure("ColorCorrectionEffect", mood.ColorCorrection)
ensure("BloomEffect", mood.Bloom)
ensure("SunRaysEffect", mood.SunRays)

local counts = {}
for _, child in Lighting:GetChildren() do
	counts[child.ClassName] = (counts[child.ClassName] or 0) + 1
end
for className, n in counts do
	if n > 1 then warn("Duplicate", className, "x" .. n, "- remove extras") end
end
print("Mood applied")
```

### Per-zone lighting on the client

```lua
--!strict
-- StarterPlayerScripts/Controllers/ZoneLightingController (ModuleScript). Zone volumes are Parts tagged "Zone"
-- with a string attribute "Preset", inside a Persistent model so they never stream out.
local CollectionService = game:GetService("CollectionService")
local Lighting = game:GetService("Lighting")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Moods = require(ReplicatedStorage.Shared.Config.Moods)
local FADE = TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
local DEFAULT_PRESET = "BrightDay"
local USES_DAY_CYCLE = false -- true if a day/night controller owns ClockTime

local player = Players.LocalPlayer
local zones: { BasePart } = {}
local current: string? = nil

local Controller = {}

local function volume(p: BasePart): number
	return p.Size.X * p.Size.Y * p.Size.Z
end

local function inside(part: BasePart, point: Vector3): boolean
	local rel = part.CFrame:PointToObjectSpace(point)
	local half = part.Size / 2
	return math.abs(rel.X) <= half.X and math.abs(rel.Y) <= half.Y and math.abs(rel.Z) <= half.Z
end

local function tween(target: Instance?, goal: { [string]: any })
	if target then
		TweenService:Create(target, FADE, goal):Play()
	end
end

local function apply(name: string)
	local mood = Moods[name]
	if not mood or name == current then return end
	current = name
	tween(Lighting, {
		Brightness = mood.Brightness,
		ExposureCompensation = mood.ExposureCompensation,
		Ambient = mood.Ambient,
		OutdoorAmbient = mood.OutdoorAmbient,
		EnvironmentDiffuseScale = mood.EnvironmentDiffuseScale,
		EnvironmentSpecularScale = mood.EnvironmentSpecularScale,
	})
	if not USES_DAY_CYCLE then
		if math.abs(Lighting.ClockTime - mood.ClockTime) <= 6 then
			tween(Lighting, { ClockTime = mood.ClockTime })
		else
			task.delay(FADE.Time / 2, function() Lighting.ClockTime = mood.ClockTime end)
		end
	end
	tween(Lighting:FindFirstChildOfClass("Atmosphere"), mood.Atmosphere)
	tween(Lighting:FindFirstChildOfClass("ColorCorrectionEffect"), mood.ColorCorrection)
	tween(Lighting:FindFirstChildOfClass("BloomEffect"), mood.Bloom)
	tween(Lighting:FindFirstChildOfClass("SunRaysEffect"), mood.SunRays)
end

local function addZone(inst: Instance)
	if inst:IsA("BasePart") then
		table.insert(zones, inst)
		table.sort(zones, function(a, b) return volume(a) < volume(b) end) -- smallest (nested) zone wins
	end
end

function Controller.Start()
	for _, inst in CollectionService:GetTagged("Zone") do addZone(inst) end
	CollectionService:GetInstanceAddedSignal("Zone"):Connect(addZone)
	CollectionService:GetInstanceRemovedSignal("Zone"):Connect(function(inst)
		local index = table.find(zones, inst :: any)
		if index then table.remove(zones, index) end
	end)

	task.spawn(function()
		while true do
			local character = player.Character
			local root = if character then character:FindFirstChild("HumanoidRootPart") else nil
			if root and root:IsA("BasePart") then
				local preset = DEFAULT_PRESET
				for _, zone in zones do
					if inside(zone, root.Position) then
						local value = zone:GetAttribute("Preset")
						if typeof(value) == "string" then preset = value end
						break
					end
				end
				apply(preset)
			end
			task.wait(0.33)
		end
	end)
end

return Controller
```

### Day/night cycle without network traffic

```lua
--!strict
-- Client. Every client computes the same ClockTime from server time, so nothing replicates.
local Lighting = game:GetService("Lighting")

local DAY_LENGTH = 14 * 60 -- seconds per full day (target 10-20 minutes)
local START_HOUR = 8       -- hour shown when server time is a multiple of DAY_LENGTH
local NIGHT_FLOOR = Color3.fromRGB(45, 50, 80) -- OutdoorAmbient never goes darker than this (rule 24)
local DAY_AMBIENT = Color3.fromRGB(125, 125, 140)

task.spawn(function()
	while true do
		local t = workspace:GetServerTimeNow() % DAY_LENGTH
		local hour = (START_HOUR + t / DAY_LENGTH * 24) % 24
		Lighting.ClockTime = hour
		local daylight = math.clamp(math.sin((hour - 6) / 12 * math.pi), 0, 1) -- 0 at night, 1 at noon
		Lighting.OutdoorAmbient = NIGHT_FLOOR:Lerp(DAY_AMBIENT, daylight)
		task.wait(0.1)
	end
end)
```

### Spawn ring facing the first objective

```lua
-- Edit mode. Eight spawns on a 14-stud ring (about 10.7 studs apart), all facing the first objective.
local hub = workspace.Map.Hub
local center = hub:GetPivot().Position
local target = hub.FirstObjective:GetPivot().Position

local folder = hub:FindFirstChild("Spawns")
if not folder then
	folder = Instance.new("Folder")
	folder.Name = "Spawns"
	folder.Parent = hub
end

for i = 1, 8 do
	local angle = (i / 8) * math.pi * 2
	local pos = center + Vector3.new(math.cos(angle) * 14, 0.5, math.sin(angle) * 14)
	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "Spawn" .. i
	spawn.Size = Vector3.new(6, 1, 6)
	spawn.Anchored = true
	spawn.Neutral = true
	spawn.Duration = 0 -- no ForceField in non-combat games (rule 4)
	spawn.Material = Enum.Material.SmoothPlastic
	spawn.Color = Color3.fromHex("#E8D9A8")
	spawn.CFrame = CFrame.lookAt(pos, Vector3.new(target.X, pos.Y, target.Z))
	local decal = spawn:FindFirstChildOfClass("Decal")
	if decal then decal:Destroy() end
	spawn.Parent = folder -- parent last
end
print("Spawns placed. Press Play and screenshot the first frame (rule 1).")
```

### Data-driven obby checkpoints (server)

```lua
--!strict
-- ServerScriptService/Services/CheckpointService (ModuleScript). Checkpoints are anchored Parts tagged
-- "Checkpoint" with a number attribute "Stage". PlayerData.Get(player) returns { Stage: number }? (see 13 Building It Right).
local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local PlayerData = require(script.Parent.PlayerData)

local CheckpointService = {}
local byStage: { [number]: BasePart } = {}

local function moveToSaved(player: Player, character: Model)
	local data = PlayerData.Get(player)
	local found = if data then byStage[data.Stage] else nil
	if not found then return end
	local checkpoint: BasePart = found
	task.defer(function()
		if character.Parent then
			character:PivotTo(checkpoint.CFrame + Vector3.new(0, checkpoint.Size.Y / 2 + 3, 0))
		end
	end)
end

local function onTouched(checkpoint: BasePart, hit: BasePart)
	local character = hit:FindFirstAncestorOfClass("Model")
	local player = if character then Players:GetPlayerFromCharacter(character) else nil
	if not player then return end
	local data = PlayerData.Get(player)
	local stage = checkpoint:GetAttribute("Stage")
	if data and typeof(stage) == "number" and stage == data.Stage + 1 then
		data.Stage = stage -- saved by PlayerData; the client shows the toast from StateChanged
	end
end

function CheckpointService.Start()
	for _, inst in CollectionService:GetTagged("Checkpoint") do
		if inst:IsA("BasePart") then
			local stage = inst:GetAttribute("Stage")
			if typeof(stage) == "number" then
				byStage[stage] = inst
				inst.Touched:Connect(function(hit) onTouched(inst, hit) end)
			end
		end
	end
	local function hook(player: Player)
		player.CharacterAdded:Connect(function(character) moveToSaved(player, character) end)
		if player.Character then moveToSaved(player, player.Character) end
	end
	Players.PlayerAdded:Connect(hook)
	for _, player in Players:GetPlayers() do hook(player) end
end

return CheckpointService
```

### Guidance beam to the current objective (client)

```lua
--!strict
-- StarterPlayerScripts/Controllers/GuideBeam (ModuleScript). Show only after a stuck timer (rule 53).
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local GuideBeam = {}
local parts: { Instance } = {}

function GuideBeam.hide()
	for _, inst in parts do inst:Destroy() end
	table.clear(parts)
end

function GuideBeam.show(target: BasePart)
	GuideBeam.hide()
	local character = Players.LocalPlayer.Character
	local root = if character then character:FindFirstChild("HumanoidRootPart") else nil
	if not (root and root:IsA("BasePart")) then return end

	local start = Instance.new("Attachment")
	start.Position = Vector3.new(0, -2.5, 0) -- near the feet
	start.Parent = root
	local finish = Instance.new("Attachment")
	finish.Parent = target

	local beam = Instance.new("Beam")
	beam.Attachment0 = start
	beam.Attachment1 = finish
	beam.Texture = Config.Assets.GuideArrowTexture -- an uploaded arrow image id
	beam.TextureMode = Enum.TextureMode.Wrap
	beam.TextureLength = 3
	beam.TextureSpeed = 1.5
	beam.Width0, beam.Width1 = 1.5, 1.5
	beam.FaceCamera = true
	beam.Segments = 20
	beam.LightEmission = 1
	beam.LightInfluence = 0
	beam.Color = ColorSequence.new(Color3.fromHex("#FFC400"))
	beam.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.7), NumberSequenceKeypoint.new(0.15, 0.1),
		NumberSequenceKeypoint.new(0.85, 0.1), NumberSequenceKeypoint.new(1, 0.8),
	})
	beam.Parent = root -- parent last
	table.insert(parts, start)
	table.insert(parts, finish)
	table.insert(parts, beam)

	-- If the target streams out or is destroyed, drop the guide.
	target.AncestryChanged:Once(function() GuideBeam.hide() end)
end

return GuideBeam
```

A straight beam passes through walls. For routes around corners, compute waypoints with `PathfindingService:CreatePath():ComputeAsync(from, to)` on the client and chain short beams between waypoint attachments on an anchored, invisible holder part.

### World audit (command bar)

```lua
-- Edit mode. Paste the output into every Scenic handoff. Decor lives under Workspace.Map.Decor.
local map = workspace:FindFirstChild("Map")
assert(map, "No Workspace.Map")
local decor = map:FindFirstChild("Decor")
local DEFAULT_GREY = Color3.fromRGB(163, 162, 165)

local s = { parts = 0, loose = 0, decorCollide = 0, decorTouch = 0, neon = 0, transparent = 0,
	greyPlastic = 0, lights = 0, shadowLights = 0, unions = 0 }
local perTop, meshes, uniqueMeshes = {}, {}, 0

for _, d in map:GetDescendants() do
	if d:IsA("BasePart") then
		s.parts += 1
		local top = d
		while top.Parent and top.Parent ~= map do top = top.Parent end
		perTop[top.Name] = (perTop[top.Name] or 0) + 1
		if not d.Anchored and #d:GetJoints() == 0 then
			s.loose += 1
			warn("Loose unanchored:", d:GetFullName())
		end
		if decor and d:IsDescendantOf(decor) then
			if d.CanCollide then s.decorCollide += 1 end
			if d.CanTouch then s.decorTouch += 1 end
		end
		if d.Material == Enum.Material.Neon then s.neon += 1 end
		if d.Transparency > 0 and d.Transparency < 1 then s.transparent += 1 end
		if d.Material == Enum.Material.Plastic and d.Color == DEFAULT_GREY then s.greyPlastic += 1 end
		if d:IsA("UnionOperation") then s.unions += 1 end
		if d:IsA("MeshPart") and not meshes[d.MeshId] then
			meshes[d.MeshId] = true
			uniqueMeshes += 1
		end
	elseif d:IsA("Light") then
		s.lights += 1
		if d.Shadows then s.shadowLights += 1 end
	end
end

print(("BaseParts %d | loose %d | decor CanCollide %d | decor CanTouch %d | Neon %d | semi-transparent %d")
	:format(s.parts, s.loose, s.decorCollide, s.decorTouch, s.neon, s.transparent))
print(("Default grey Plastic %d | unions %d | unique meshes %d | lights %d (shadowed %d)")
	:format(s.greyPlastic, s.unions, uniqueMeshes, s.lights, s.shadowLights))
for name, n in perTop do
	print(("  %s: %d parts%s"):format(name, n, n > 6000 and "  <-- over zone budget" or ""))
end
```

### Terrain block-out and palette (command bar)

```lua
-- Edit mode. Ground slab, a hill, a pond, palette colors, water and clouds.
local terrain = workspace.Terrain
terrain:FillBlock(CFrame.new(0, -6, 0), Vector3.new(512, 12, 512), Enum.Material.Grass)
terrain:FillBall(Vector3.new(120, -4, 80), 40, Enum.Material.Rock)
terrain:FillBlock(CFrame.new(-90, -3, 10), Vector3.new(64, 6, 64), Enum.Material.Water)

for material, hexColor in {
	[Enum.Material.Grass] = "#7BC950",
	[Enum.Material.Ground] = "#9C7A54",
	[Enum.Material.Rock] = "#8C8C96",
	[Enum.Material.Sand] = "#E8D9A8",
} do
	terrain:SetMaterialColor(material, Color3.fromHex(hexColor))
end

terrain.WaterColor = Color3.fromHex("#3FB8C9")
terrain.WaterTransparency = 0.4
terrain.WaterWaveSize = 0.1
terrain.WaterWaveSpeed = 8

local clouds = terrain:FindFirstChildOfClass("Clouds") or Instance.new("Clouds")
clouds.Cover = 0.55
clouds.Density = 0.4
clouds.Color = Color3.fromHex("#F4F7FF")
clouds.Parent = terrain
```

### Streaming setup for landmarks and zone volumes (command bar)

```lua
-- Edit mode. Landmarks stay visible far away; zone volumes always exist on the client (rules 9, 18, 62).
local CollectionService = game:GetService("CollectionService")
for _, model in CollectionService:GetTagged("Landmark") do
	if model:IsA("Model") then
		local ok, err = pcall(function()
			model.LevelOfDetail = Enum.ModelLevelOfDetail.StreamingMesh
		end)
		if not ok then warn("Set LevelOfDetail by hand on", model:GetFullName(), err) end
	end
end
local volumes = workspace.Map:FindFirstChild("ZoneVolumes")
if volumes and volumes:IsA("Model") then
	volumes.ModelStreamingMode = Enum.ModelStreamingMode.Persistent
end
workspace.ModelStreamingBehavior = Enum.ModelStreamingBehavior.Improved
workspace.StreamOutBehavior = Enum.StreamOutBehavior.Opportunistic
print("StreamingEnabled:", workspace.StreamingEnabled, "TargetRadius:", workspace.StreamingTargetRadius)
```

## Checklist

- [ ] Zone table (palette, landmark, ground, preset, music, gate key) is written in `plan.md`.
- [ ] Greybox was playtested with 2+ clients before any art, and the leg timings are in the report.
- [ ] Spawn view screenshot (no camera input) shows the first objective, the shop or sell pad and the next gate.
- [ ] Spawns: 4-12 spread spawns or one large spawn, `Duration` set for the genre, decal removed, all facing the game.
- [ ] Return to spawn is one tap; walking back takes 20 s or less from any zone hub.
- [ ] Every zone has a landmark visible from its entrance and the hub, with streaming LOD set.
- [ ] Every gate shows its requirement from Config on both sides, frames the next landmark, and is enforced by the server.
- [ ] Zone volumes are tagged `Zone`, carry `Preset`, and sit in a Persistent model.
- [ ] `LightingStyle` and `PrioritizeLightingQuality` are set on purpose and recorded in `decisions.md`; `Technology` isn't relied on.
- [ ] Sky, Atmosphere, ColorCorrection and Bloom exist once each (SunRays outdoors).
- [ ] Atmosphere handles fog; no script touches `FogEnd`.
- [ ] No non-Neon surface blooms at spawn; Neon is under 5% of the view.
- [ ] Ambient and OutdoorAmbient are above black in every preset; night stays readable on a dimmed screen.
- [ ] At most 8 shadow-casting local lights in any view.
- [ ] Interiors under Realistic have walls at least 1 stud thick and no light leaks.
- [ ] Accent color is only on interactables; hazard hue only on hazards.
- [ ] Floor vs wall value contrast at least 25 V in every zone.
- [ ] At least 3 terrain or ground materials per zone, colored to the palette.
- [ ] Doors, ceilings and corridors pass a zoomed-in walk with a 6-stud dummy.
- [ ] Every jump on the main route passes the jump math and a phone test.
- [ ] Decor under `Map.Decor` has CanCollide, CanTouch and CanQuery off.
- [ ] Audit shows 0 loose parts and budgets met (hub ≤ 3,000, zone ≤ 6,000, total ≤ 25,000).
- [ ] Look tested at quality 1, 5 and 10 and in the Device Emulator phone preset; screenshots saved.
- [ ] Minimum visual bar passes in full.

## Common mistakes

- Spawning players facing a wall, or in a closed room that hides the game.
- One small spawn for a 30-player server, so everyone stacks in a ForceField bubble.
- Using many neutral SpawnLocations as obby checkpoints, so new players spawn on random stages.
- Setting `Lighting.Technology` from an old tutorial instead of `LightingStyle` and `PrioritizeLightingQuality`.
- Leaving the place on Soft by accident, then wondering why the campfire and flashlight cast no shadows.
- Tweaking `FogEnd` while an Atmosphere sits in Lighting.
- Bloom so strong that white floors, snow and signs glow.
- Night or horror presets with black ambient, unplayable on phones.
- Changing Lighting on the server for per-zone moods, so everyone's sky flickers.
- Dozens of shadow-casting lights for streetlamps.
- Paper-thin walls under Realistic, so light leaks into interiors.
- Everything Neon, or the accent color used as decoration.
- Decorative red in gameplay spaces that reads as danger.
- Mixing photoreal PBR assets with a cartoon style.
- One terrain material to the horizon.
- Props scattered evenly over paths, catching feet and hiding collectibles.
- Real-world proportions, so the camera clips and avatars don't fit through doors.
- Beginner gaps at the edge of the jump distance, tested only on PC.
- Landmarks that disappear because streaming removed them.
- Client scripts that index deep map paths directly and error under streaming.
- Gate costs typed into signs instead of read from Config.
- Thousands of unanchored or colliding parts from free models ([[07 Characters, VFX and Assets]]).
- "Looks good in Studio" as the only test.

## References

[1] Global lighting — https://create.roblox.com/docs/environment/lighting — LightingStyle (Realistic and Soft) and how PrioritizeLightingQuality trades lighting quality against view distance.
[2] Lighting class reference — https://create.roblox.com/docs/reference/engine/classes/Lighting — Technology, Outlines and ShadowColor are marked deprecated.
[3] Let There Be (Unified) Light! Unified Lighting is Fully Live — https://devforum.roblox.com/t/let-there-be-unified-light-unified-lighting-is-fully-live/3401512 — the July 2025 release; LightingStyle and PrioritizeLightingQuality replace Technology; existing looks preserved.
[4] Unified Lighting Beta: "ShadowSoftness" does not appear when LightingStyle is Soft — https://devforum.roblox.com/t/unified-lighting-beta-shadowsoftness-lighting-property-does-not-appear-when-lightingstyle-is-set-to-soft/3509181 — ShadowSoftness applies to Realistic and is hidden under Soft.
[5] Bloxy News on Unified Lighting in Studio — https://x.com/Bloxy_News/status/1881791225822327102 — January 2025 Studio beta; groundwork for increased light ranges and attenuation.
[6] Lighting (Roblox API reference, robloxapi.github.io) — https://robloxapi.github.io/ref/class/Lighting.html — PrioritizeLightingQuality defaults to true.
[7] Technology enum — https://create.roblox.com/docs/reference/engine/enums/Technology — legacy lighting values; Compatibility deprecated, with Voxel plus a Retro color grade suggested instead.
[8] Technology enum (robloxapi.github.io) — https://robloxapi.github.io/ref/enum/Technology.html — notes that Technology was superseded by LightingStyle and PrioritizeLightingQuality.
[9] Future Is Bright: Phase 2 Released — https://devforum.roblox.com/t/future-is-bright-phase-2-released/278531 — history of shadow-map lighting.
[10] Future Is Bright: Phase 3 - Studio Beta — https://devforum.roblox.com/t/future-is-bright-phase-3-studio-beta/639903 — history of Future lighting.
[11] Enhance indoor environments (lighting tutorial) — https://create.roblox.com/docs/tutorials/use-case-tutorials/lighting/enhance-indoor-environments — Soft is the default; local lights under Soft don't shadow like the sun; Realistic detects interiors; 1-stud-thick walls stop leaks.
[12] Enhance outdoor environments with realistic lighting — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/lighting/enhance-outdoor-environments — under Realistic, a campfire's light casts crisp shadows on nearby objects.
[13] Customize global lighting (core curriculum) — https://create.roblox.com/docs/tutorials/curriculums/core/building/customize-global-lighting — Roblox's step-by-step lighting setup lesson.
[14] Atmospheric effects — https://create.roblox.com/docs/en-us/environment/atmosphere — Density, Offset, Haze, Glare, Color and Decay, and the Offset/Density balance.
[15] Atmosphere API reference — https://developer.roblox.com/api-reference/class/Atmosphere — Atmosphere property definitions.
[16] Post-processing effects — https://create.roblox.com/docs/environment/post-processing-effects — effects in Lighting vs Camera, ColorCorrection uses, Bloom, SunRays, DepthOfField, Editor Quality Level.
[17] Increase Range Limit of Lights — https://devforum.roblox.com/t/increase-range-limit-of-lights/68336?page=10 — the long-running request to raise the local light range cap.
[18] How would I replicate Legacy Lighting with Retro Tone Mapping? — https://devforum.roblox.com/t/how-would-i-replicate-legacy-lighting-w-retro-tone-mapping/3660864 — getting a classic look with the Retro tonemapper.
[19] Materials — https://create.roblox.com/docs/en-us/parts/materials.md — MaterialVariant for tileable materials vs SurfaceAppearance for UV-mapped meshes; Material Manager.
[20] MaterialVariant — https://create.roblox.com/docs/en-us/reference/engine/classes/MaterialVariant — works only under MaterialService; global override or per-part; StudsPerTile.
[21] PBR textures (SurfaceAppearance) — https://create.roblox.com/docs/en-us/art/modeling/surface-appearance.md — color, normal, roughness and metalness maps.
[22] SurfaceAppearance class — https://create.roblox.com/docs/en-us/reference/engine/classes/SurfaceAppearance — rendering depends on device and quality; preview at different settings.
[23] Instance streaming — https://create.roblox.com/docs/en-us/workspace/streaming — StreamingEnabled default, TargetRadius 1024, MinRadius 64, Opportunistic, Improved, ModelStreamingMode.
[24] Streaming techniques — https://create.roblox.com/docs/en-us/workspace/streaming/techniques.md — client code patterns for streamed worlds.
[25] SpawnLocation — https://create.roblox.com/docs/reference/engine/classes/SpawnLocation — AllowTeamChangeOnTouch, Neutral and TeamColor behavior.
[26] SpawnLocation (robloxapi.github.io) — https://robloxapi.github.io/ref/class/SpawnLocation.html — Duration (ForceField seconds) defaults to 10.
[27] Greybox a playable area — https://create.roblox.com/docs/tutorials/curriculums/core/building/greybox-a-playable-area — greyboxing before art; height steps that increase gradually.
[28] Environmental art curriculum — https://create.roblox.com/docs/tutorials/curriculums/environmental-art — greybox, polished assets, asset library and world construction, with optimization.
[29] Environmental Art: Assemble an Asset Library (sample place) — https://www.roblox.com/games/14447787049/Environmental-Art-Assemble-an-Asset-Library — sample modular assets, props and custom materials.
[30] Environmental Art: Construct Your World (sample place) — https://www.roblox.com/games/14447826396/Environmental-Art-Construct-Your-World — the finished sample environment.
[31] Game design lessons from Disney (Scott Rogers talk write-up) — https://boingboing.net/2009/03/27/gamedesign-lessons-f.html/amp — weenies as landmarks that pull people through a space.
[32] Various Uses of Landmarks in Level Design — https://tancoque.design.blog/ — Lynch's landmarks, reveal techniques, and denial and reward.
[33] Press Start article on landmarks in open worlds — https://press-start.gla.ac.uk/press-start/article/download/129/92/846 — Oblivion's central tower as an orienting landmark; consistent guidance in large levels.
[34] Nisbet, Immersive Wayfinding Cues for 3D Video Games (MA thesis, 2016) — https://era.library.ualberta.ca/files/cgh93gz674/Nisbet_Brett_A_201604_MA.pdf — in-world wayfinding cues instead of heavy UI.
[35] Dark Souls III level design analysis — https://coldsolarknight233.itch.io/dad3 — a weenie as a tall, eye-catching visual focal point.
[36] R15 scaling announcement thread — https://devforum.roblox.com/t/r15-scaling-avatar-game-join/30724 — original avatar scaling ranges.
[37] Body scaling (Roblox Wiki) — https://roblox.fandom.com/wiki/Body_scaling — height and width scaling caps.
[38] Should I Restrict Game to R15? — https://devforum.roblox.com/t/should-i-restrict-game-to-r15/450516 — design for max-scale R15 so smaller avatars fit.
[39] Fetch Player Height — https://devforum.roblox.com/t/fetch-player-height/2205072 — community measurements of avatar height in studs.
[40] Basic Bee Gate (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Basic_Bee_Gate — the first gate, needing 5 bees.
[41] Ant Gate (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Ant_Gate — the 20 Bee Gate.
[42] Starter Zone (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Starter_Zone — no prerequisites; five fields.
[43] Rose Field (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Rose_Field — past the Honey Bee Gate; 15 bees.
[44] Mushroom Field (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Mushroom_Field — no prerequisite; the first red field.
[45] Hive Hub (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Hive_Hub — inside the Hive Hub Portal past the Ant Gate.
[46] Roblox DOORS Walkthrough – All Monsters and How to Survive Them — https://progameguides.com/roblox/roblox-doors-walkthrough-all-monsters-and-how-to-survive-them/ — Guiding Light's blue particles, the 20-second stuck rule, chase lighting and key hints.
[47] The Mines (DOORS Wiki) — https://doors-game.fandom.com/wiki/The_Mines — The Mines as a separate floor.
[48] Doors (game) — https://en.wikipedia.org/wiki/Doors_(game) — overview of Doors.
[49] Where to find the Gear Shop in Grow a Garden — https://esports.gg/news/roblox/where-to-find-the-gear-shop-in-grow-a-garden — Gear Shop placement relative to the Seed Shop; it sometimes fails to appear.
[50] Grow a Garden layout ideas — https://www.sportskeeda.com/roblox-news/grow-garden-layout-ideas — planning a limited farm plot.
[51] Grow a Garden Seed Shop and Gear Shop stock explained — https://deltiasgaming.com/?p=207402 — shop NPCs and the five-minute restock.
[52] Pet Simulator 99 areas (bloxodes wiki) — https://bloxodes.com/wiki/pet-simulator-99/areas — Spawn as the World 1 hub with shop, mailbox and leaderboards; the starter route.
[53] All areas in Pet Simulator 99 — https://progameguides.com/roblox/all-areas-in-pet-simulator-99-roblox/ — early area unlock costs.
[54] 99 Nights in the Forest beginner's guide — https://www.theclick.gg/99-nights-in-the-forest-beginners-guide/ — campfire upgrades expand the map.
[55] Ultimate guide to 99 Nights in the Forest — https://itemlevel.net/ultimate-guide-to-roblox-99-nights-in-the-forest/ — upgrades reveal structures, resources and objectives.
[56] Natural Disaster Survival Mega Token guide (The Hunt: Mega Edition) — https://dotesports.com/roblox/news/natural-disaster-survival-mega-token-guide-the-hunt-mega-edition — the lobby room with miniature map models.
[57] Survive the natural disasters (Roblox guide) — https://stealthygaming.com/roblox-survive-the-natural-disasters/ — rounds of disasters played on an island map.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[02 The Core Loop]] · [[04 Progression and Economy]] · [[05 UI and HUD]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[Genre - Simulator]] · [[Genre - Obby]] · [[Genre - Horror]]
