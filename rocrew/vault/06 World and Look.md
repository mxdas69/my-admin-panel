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

5. **Obby checkpoints use either one Team per stage with `AllowTeamChangeOnTouch`, for up to about 50 stages, or a data-driven checkpoint that sets `Player.RespawnLocation` from the server.**
   Why: `AllowTeamChangeOnTouch` changes the player's `TeamColor` to the spawn's when they touch it, which is the classic checkpoint trick. It doesn't work when the spawn is disabled [25]. Past about 50 stages, teams clutter the player list. A saved stage number also survives rejoining.
   How: in the data-driven version, each checkpoint is a SpawnLocation (`Neutral = true`, `Enabled = true`) tagged `Checkpoint` with a `Stage` attribute. The server's Touched handler checks `Stage == saved + 1`, saves it, and sets `player.RespawnLocation = checkpoint`. Checkpoints are 8 x 8 or larger, a distinct accent color, and show the stage number in big text.
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
    Why: Unified Lighting replaced `Technology` with two properties. It went to a Studio beta in January 2025 and fully live in July 2025, and existing experiences kept their look [3], [5]. `Realistic` gives the most advanced lights and shadows. `Soft` gives a flatter, classic-Roblox look with softer lights and shadows [1]. Studio starts new places on Soft, and under Soft, local lights such as candles don't cast shadows the way the sun does [11]. The API reference marks `Technology` as deprecated [2], and community references note that it was superseded [8].
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
