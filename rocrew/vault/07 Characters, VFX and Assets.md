---
tags: [vault, assets, characters, animation, vfx, audio, creator-store, blender, ai-art]
for: [librarian, builder, scenic]
also: [frame, architect, reviewer, playtest, kid-tester, splash, merchant, producer]
---

# 07 Characters, VFX and Assets

This chapter covers everything that moves, sparkles or makes noise: avatars, rigs and NPCs; animation; visual effects with exact ParticleEmitter, Beam and Trail values; sound effects and music; getting models from the Creator Store without letting a backdoor into the place; the Blender to Studio pipeline; and bringing Gemini or other AI-generated art into Roblox. Librarian owns `ReplicatedStorage.Assets` and `ServerStorage.Assets`. Builder triggers effects and animations from code, and Scenic places world props and ambient effects. Everyone who inserts, animates or plays an effect follows this page.

Feel decides whether a game succeeds. The same mechanic (click, collect, hit, open an egg) reads as dull or as exciting depending on the half second of animation, particles and sound around it ([[02 The Core Loop]]). Players can't name it, but they leave games where nothing reacts. Assets are also the most common way unsafe code gets into a Roblox place, through free models carrying hidden scripts, and the most common way a game blows its memory budget on phones, through oversized meshes and textures.

Read the Rules before any task that adds an asset, effect, sound or animation. Use the recipe sections as specs: copy the values, then tune by eye in Play mode on a phone-sized view. Every number marked as a target is this studio's starting point, not a Roblox limit. Write final values into `Config` or the asset's attributes, and note anything unusual in `games/<slug>/decisions.md`.

Web research for this page was limited (see the note at the top of References). Many API specifics below are written from the engine's documented behavior as the crew knows it, without a citation. Treat any uncited number as a rule of thumb and check the current Creator Documentation in Studio when in doubt.

## Rules

### Characters and rigs

1. **Choose the avatar rig once, in `plan.md`: R15 by default, R6 only for a deliberate classic feel (old-school obbies, some combat games), and lock it in the experience's avatar settings.**
   Why: R15 has 15 body parts and supports scaling, layered clothing and modern animation. R6 has 6 parts and a blockier, classic motion. Mixing them breaks animations, hitboxes and clothing. R15 is the current standard rig [10].
   How: set the avatar type in Studio's avatar settings for the experience (Game Settings → Avatar in older Studio builds; a dedicated Avatar Settings window in newer ones). Note the rig in `plan.md` so every animation is authored for it.
   Done right: A battlegrounds game that ships R6 on purpose, with every move animated for R6.
   Done wrong: An R15 game whose store-bought emote pack is R6, so emotes fail silently.

2. **Design hitboxes, doors, seats and clothing for the largest allowed avatar, or clamp avatar scales in the avatar settings.**
   Why: players scale their avatars within limits, and the documented ranges have shifted over time [8], [9]. Developers recommend designing for the largest R15 so smaller avatars still fit [11]. Community measurements put the default avatar near 5 studs [12], [13].
   How: build a 6-stud test dummy with the Rig Builder (Avatar tab → Rig Builder) and use it for every seat, door and vehicle. If gameplay needs equal hitboxes (competitive combat), use custom server hitboxes (a box or capsule welded to the HumanoidRootPart) instead of body parts, or set scale limits in the avatar settings.
   Done right: Combat hitboxes are 4 x 5.5 x 3 invisible boxes on every character, so a tiny avatar has no advantage.
   Done wrong: A car seat that a tall avatar clips through the roof of.

3. **NPCs are built from a HumanoidDescription or the Rig Builder, stationary NPCs are anchored, and a server keeps no more than about 20 active Humanoid NPCs near players (target).**
   Why: Humanoids are the most expensive objects in the engine, because each runs a state machine and physics. Anchored, stateless NPCs (shopkeepers, quest givers) cost little.
   How: server-side `Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)`, then anchor the HumanoidRootPart for stationary NPCs. Turn off states the NPC never uses (`Humanoid:SetStateEnabled(Enum.HumanoidStateType.Climbing, false)`, also Swimming and FallingDown), and hide the default name with `DisplayDistanceType = None` when you show a custom BillboardGui. Creatures that aren't humanoid use an `AnimationController` with an `Animator`, not a Humanoid.
   Done right: Twelve anchored shop and quest NPCs plus 8 roaming enemies near players, at stable server frame time.
   Done wrong: 60 Humanoid zombies chasing in one area, and the server heartbeat drops.

4. **Every NPC with a job has a readable silhouette, a signature color and a name tag that reads at 30 studs.**
   Why: players look for "the shop person" or "the quest person" by shape and color, not by reading. Named shopkeepers give shops identity: Grow a Garden's guides name the NPCs who run the Seed Shop and the Gear Shop [32], [33].
   How: one oversized prop per NPC (a giant hat, a backpack of seeds, a glowing staff), a body color from the zone's secondary palette ([[06 World and Look]]), and a BillboardGui (`Size` 6 x 1.5 studs, `StudsOffset` 0, 3.5, 0, `MaxDistance` 60, `LightInfluence` 0) with the name and an icon. Quest NPCs add a bobbing "!" icon in the accent color when a quest is available.
   Done right: The fishing NPC has a huge yellow rain hat and a fish icon over his head.
   Done wrong: Five default-looking NPCs, and players click each one to find the shop.

5. **Change a player's look only through the server, with `Humanoid:ApplyDescription`, and never trust a client's claim about what they own.**
   Why: `ApplyDescription` must run on the server, and cosmetics are part of the economy ([[09 Shops and Monetization]]).
   How: the client sends "equip item X". The server checks ownership in player data, gets the current description (`humanoid:GetAppliedDescription()`), changes the relevant field or accessory, and calls `humanoid:ApplyDescription(desc)`. Throttle to one change per second per player.
   Done right: A cosmetic shop that previews on a client-side mannequin and applies to the real avatar through the server.
   Done wrong: A LocalScript that adds accessories to the character, which nobody else can see.

6. **Pets, companions and floating items are rendered by each client, and the server only stores what's equipped.**
   Why: hundreds of server-moved pet models replicate every frame and flood the network. Each client can animate everyone's pets locally and smoothly.
   How: the server sets an attribute or a replicated value such as `EquippedPets = "uid1,uid2"` on the player. Every client watches it and builds the pet models from `ReplicatedStorage.Assets.Pets` near each player's character, moving them on `RunService.RenderStepped` or `Heartbeat` with a lerp toward an offset behind the owner. Pets are visual only, with collision off. Gameplay effects of pets are computed on the server from data.
   Done right: 30 players with 3 pets each, smooth on phones, with nearly zero pet network traffic.
   Done wrong: Server-side pets with `AlignPosition` constraints on 90 models, jittering for everyone.

### Animation

7. **Load each Animation once per character through the Animator, cache the AnimationTrack, and reuse it. Never call `LoadAnimation` per attack.**
   Why: loading creates a new track each time, which leaks and stutters.
   How: `local animator = humanoid:WaitForChild("Animator") :: Animator`, then `animator:LoadAnimation(animation)` once when the character spawns, and keep the tracks in a table (Luau section). Clear the table on `CharacterAdded`.
   Done right: 6 attack tracks loaded on spawn, played with `track:Play(0.05)`.
   Done wrong: `humanoid:LoadAnimation(anim):Play()` inside the click handler.

8. **Animations must be owned by the experience's owner (the same user or group) or by Roblox. For a group game, upload them to the group.**
   Why: an animation the experience can't access simply doesn't play. There's no error a player sees, just a frozen character.
   How: upload animations from the Animation Editor while publishing to the group. Keep animation ids in `Config.Animations`. Ask the owner (`cli.mjs ask`) to upload when the agent's Studio session can't publish to the group. Test every animation in a Play session of the published place, not only in the editor preview.
   Done right: All 40 animations published to the group that owns the game.
   Done wrong: Animations on a crew member's personal account, so every move fails in the live group game.

9. **Set priorities on purpose: `Idle` for idles, `Movement` for locomotion, `Action` to `Action4` for attacks, emotes and tool use, with higher Action levels for moves that must override lower ones.**
   Why: higher priority overrides lower priority on the joints it animates. Wrong priorities make attacks get overridden by the walk cycle.
   How: set `track.Priority` in code or in the Animation Editor before publishing. Use `Action` for basic attacks, `Action2` for heavy attacks and abilities, `Action3` for stuns and knockbacks, and `Action4` for cutscene poses.
   Done right: A stun animation (Action3) that interrupts an attack (Action) cleanly.
   Done wrong: Every animation at Core, so the run cycle wins.

10. **Sync effects to animation frames with markers: name markers in the Animation Editor (`Hit`, `Step`, `Release`) and listen with `track:GetMarkerReachedSignal(name)`. The server still decides damage.**
    Why: effects that fire on button press instead of on contact feel disconnected. Markers move with the animation if it's retimed.
    How: add markers at the contact frame. The client plays the swing, and on `Hit` it plays the trail end, spark and sound. The server runs its own timing (a fixed delay matching the marker, read from Config) to check hits ([[13 Building It Right]]).
    Done right: The sword spark and clang land exactly on the frame the blade connects.
    Done wrong: Particles spawn 0.2 s before the swing reaches the target.

11. **Attack and action timing targets: anticipation 0.05-0.15 s, contact on a marker, recovery 0.15-0.35 s, total 0.3-0.6 s for light attacks, 0.6-1.2 s for heavies, and 0.05-0.1 s fades between tracks.**
    Why: snappy anticipation and readable recovery make combat responsive and fair. Long fades blur hits. On phones, input to visible motion should feel instant.
    How: author at 30 or 60 fps in the Animation Editor, keep keys on whole frames, and play with `track:Play(0.05)` and stop with `track:Stop(0.1)`. Adjust per weapon with `track:AdjustSpeed(speed)` from Config, not by re-authoring.
    Done right: A 0.45 s punch: 0.1 s windup, a hit on frame 4, 0.3 s recovery.
    Done wrong: A 1.5 s light attack with a 0.4 s fade, so players feel input lag.

12. **Replace the default walk, run, jump and idle by copying the `Animate` script from a running character into `StarterPlayer.StarterCharacterScripts` and changing its `AnimationId` values. Don't fight it with your own looping tracks.**
    Why: `Animate` handles state transitions, speed scaling and emotes. Layering your own walk on top causes foot sliding and priority fights.
    How: Play, copy `Workspace.<you>.Animate`, stop, paste into StarterCharacterScripts, and change the ids of its StringValue children (for example `walk > WalkAnim`, `run > RunAnim`, `idle > Animation1`). Keep the structure.
    Done right: A custom stylized run that plays correctly in water, on ladders and while emoting.
    Done wrong: A LocalScript that plays a run loop whenever `MoveDirection` is non-zero, and players moonwalk.

13. **NPC animations play on the server for gameplay NPCs, and on each client for purely cosmetic NPCs (crowds, ambient animals).**
    Why: animations played on the server replicate to everyone. Cosmetic NPCs animated on clients cost the server nothing.
    How: gameplay NPCs (enemies, bosses) load their tracks on the server Animator. Ambient NPCs live in a client-only folder or are created by the client, and the client loads and plays their idles. Idles loop 2-4 s with subtle breathing, and 2-3 idle variants are picked at random to avoid crowds moving in sync.
    Done right: A market crowd of 15 client-side NPCs with 3 idle variants and random start times.
    Done wrong: 15 synchronized server-side NPCs nodding in perfect unison.

### VFX

14. **Cosmetic effects spawn on clients: the server fires one event with a name and a CFrame, and each client clones a template and plays it.**
    Why: server-created particles replicate as instances to every player and pile up. Clients can also skip effects that are off-screen or too far away.
    How: `Remotes.PlayVFX:FireAllClients(name, cframe)` (or an `UnreliableRemoteEvent` for very frequent cosmetic effects, [[13 Building It Right]]). The client checks distance (skip if more than 200 studs from the camera), clones from `ReplicatedStorage.Assets.VFX`, emits and cleans up (Luau section). The local player's own effects (their swing, their collect) play immediately on their client without waiting for the server.
    Done right: A coin burst appears instantly for the collector and a moment later for everyone nearby.
    Done wrong: The server parents a new ParticleEmitter into the map for every coin collected.

15. **Every effect has a budget: a burst emits at most about 60 particles, an ambient emitter's Rate stays at or below 20, particle Lifetime stays at or below 2 s for most effects, and no more than about 30 emitters are active around the player at once (targets).**
    Why: particles are cheap one by one and expensive in crowds, especially overlapping transparent ones on phones ([[08 Mobile]]).
    How: set `EmitCount` as an attribute on each emitter (read by the player script). Stop ambient emitters outside the player's area (streaming handles world emitters; tie others to zone state). Add a "Reduced effects" setting that halves EmitCount and disables ambient emitters ([[05 UI and HUD]]).
    Done right: A level-up of 40 particles and a ring, gone in 0.9 s.
    Done wrong: A rare pet that permanently emits 200 particles per second, times 30 players.

16. **Particles fade out, never pop: Size and Transparency are NumberSequences that end at 0 size or 1 transparency, and `LightEmission` is 1 for glowing magic and 0 for smoke and dust.**
    Why: particles that vanish at full size look broken. `LightEmission` 1 makes particles additive (glowy), which is wrong for smoke. `LightInfluence` 0 keeps magic bright in the dark, and 1 makes smoke and confetti take the scene's lighting.
    How: start every effect from a recipe below. Typical size curve: `0 → 0.2: peak → 1: 0`. Typical transparency: `0: 0 → 0.7: 0 → 1: 1`. Rotation via `RotSpeed` (-180 to 180) makes sparkles feel alive.
    Done right: Sparkles that grow, twinkle and shrink to nothing.
    Done wrong: Grey squares that blink out after 1 s.

17. **Effects use the world's color language: accent color for rewards and collectibles, rarity colors for rarity, hazard hue only for danger, and green for healing.**
    Why: players learn colors fast. A red sparkle on a reward reads as damage. The world chapter reserves the accent and hazard hues ([[06 World and Look]]), and rarity colors come from [[03 Rarity and RNG]].
    How: set `ParticleEmitter.Color` with `ColorSequence.new(colorA, colorB)` from `Config.Colors`. Never hard-code a new color in an effect.
    Done right: Gold coin bursts, blue rare-drop pillars and red enemy telegraphs.
    Done wrong: Red-orange level-up sparks that make players think they took damage.

18. **Reward effects scale with value: a common reward gets a 0.3 s small burst and a click, and the top tier gets a 2-3 s sequence with a light pillar, a screen flash, a camera shake of at most 0.3 studs and a unique sound.**
    Why: escalation makes rare things feel rare, and it's most of the excitement in RNG and collection games ([[03 Rarity and RNG]]). If every reward explodes, nothing feels special.
    How: use the Reward tiers table below. The tier comes from the server's result; the client plays the tier's sequence. Top tiers also announce to the server chat or a global toast ([[10 Retention and Social]]).
    Done right: A Legendary hatch that dims the screen, beams gold light and plays a choir hit.
    Done wrong: Common and Legendary hatches with the same sparkle.

19. **Beams are for connections and guidance (lasers, tethers, guide arrows, lightning), with `Segments` 10-20 for curves, `TextureSpeed` for flow and `FaceCamera = true` for flat textures.**
    Why: a Beam renders between two Attachments with no particles to simulate, so it's the cheapest way to draw a line in 3D.
    How: see the Beam recipes. For lightning, the client randomizes `CurveSize0` and `CurveSize1` every 0.05 s for 0.3 s. For guide arrows, use `TextureMode = Wrap`, `TextureLength` 2-4 and `TextureSpeed` 1-2 ([[06 World and Look]] has the guide beam code).
    Done right: A blue tether between a player and their pet that flows toward the pet.
    Done wrong: A "laser" built from 40 thin Parts moved every frame.

20. **Trails are for motion (swings, dashes, thrown objects), with a `Lifetime` of 0.15-0.35 s, enabled only during the motion, and two Attachments 2-4 studs apart.**
    Why: a trail left on permanently draws streaks while walking and costs fill rate.
    How: put Attachments at the blade base and tip (or above and below the root part for dashes). Set `Enabled = true` on the swing marker and `false` at recovery, and call `trail:Clear()` when teleporting so it doesn't streak across the map.
    Done right: A white-to-gold sword arc that appears only during the swing.
    Done wrong: A trail on every player's sword that smears across the screen when they respawn.

21. **Highlights are for selection, hover, hit flashes and hidden objectives, with at most a handful at once (the client limit is 31).**
    Why: Highlight is the clearest "this one" outline in the engine, and the limit is easy to hit if every pet or enemy gets one.
    How: hover and selection use one reused Highlight whose `Adornee` changes. Hit flashes use `FillColor` white, `FillTransparency` 0.3 tweened to 1 over 0.08-0.12 s, `OutlineTransparency` 1. `DepthMode = AlwaysOnTop` only for objectives and allies, never for enemies the player shouldn't see through walls.
    Done right: One Highlight follows the mouse or the tapped target.
    Done wrong: A Highlight on every enemy, so outlines start disappearing past 31.

22. **Per-player screen effects (damage tint, underwater, low health, stun blur) go under `workspace.CurrentCamera` and are created by that player's client.**
    Why: post-processing effects in the Camera show only for that player, while those in Lighting show for everyone. ColorCorrection is commonly used for feedback such as a red screen at low health [18], [19].
    How: the client creates a ColorCorrectionEffect named `DamageTint` under the camera at startup with neutral values, and tweens `TintColor` to `#FF8080` and `Saturation` to -0.3 for 0.15 s on damage, then back over 0.35 s. Use BlurEffect `Size` 6-10 for stuns, for at most 1 s.
    Done right: A quick red pulse on hit, visible only to the player who was hit.
    Done wrong: A server script tinting Lighting red when anyone gets hit.

23. **Effect lights are small and shadowless: pickups and spells use a PointLight with `Range` 6-16, `Brightness` 1-3, `Shadows = false`, tweened out over the effect's life.**
    Why: shadowed local lights are expensive and range is capped [22]. Unified Lighting was described as a step toward larger ranges and better attenuation [23], so check current limits. Under Soft lighting, local lights don't cast shadows like the sun [20], while under Realistic a campfire's light casts crisp shadows on nearby objects [21], and how effect lights look depends on the place's LightingStyle [24].
    How: a level-up adds a PointLight (`Range` 16, `Brightness` 3) and tweens Brightness to 0 over 0.4 s. Permanent hero lights (campfire) may cast shadows, at most one per scene area ([[06 World and Look]]).
    Done right: A spell that briefly lights the ground around the caster.
    Done wrong: Every bullet carrying a shadow-casting light.

24. **Telegraphs for danger are big, in the hazard hue, on the ground and at least 0.6 s before the hit (0.4 s for fast enemies).**
    Why: fair danger is readable danger. Fog, haze and small screens hide small effects: Atmosphere Density hides distant objects [39].
    How: a ground decal or a flat Part (`Transparency` 0.5, Neon, hazard hue) that grows to full size over the telegraph time, plus a rising pitch sound. Enemies flash with a Highlight just before they attack.
    Done right: A red circle grows under the player for 0.8 s before the boss slam.
    Done wrong: A boss slam with no warning, which kids read as random death.

### Audio and music

25. **Every Sound belongs to a SoundGroup (Music, SFX, UI, Ambient), and the settings menu controls each group separately on the client.**
    Why: players mute music first, and a game without a music toggle loses players who listen to their own. Setting `SoundGroup.Volume` on the client affects only that player.
    How: create the four groups in `SoundService` (Luau section) with starting volumes Music 0.35, SFX 0.6, UI 0.5, Ambient 0.4 (targets). Every Sound's `SoundGroup` property points at one. The settings toggles save in player data and apply on join.
    Done right: Music off, effects on, remembered next session.
    Done wrong: Music in a Sound with no group, so muting it means muting everything.

26. **Every player action has a sound within 50 ms of input: click, collect, purchase, level up, error, open, close, equip, hit and miss.**
    Why: sound is half of feedback. A silent button feels broken, especially on phones where taps have no physical click.
    How: keep the UI sounds in `ReplicatedStorage.Assets.Sounds.UI` and play them locally with `SoundService:PlayLocalSound(sound)` or the clone-and-play helper. Short SFX run 0.05-0.6 s. The error sound is low and soft, never harsh.
    Done right: A soft pop on every button, a coin chime on every collect, and a low "bonk" on a failed purchase.
    Done wrong: Purchase prompts and egg hatches with no sound.

27. **Repeated sounds vary: random `PlaybackSpeed` within plus or minus 5-8%, 2-4 variants for footsteps and hits, and no more than one copy of the same sound starting every 50 ms.**
    Why: the same sample repeated identically is the "machine gun" effect and becomes grating within a minute of collecting.
    How: use the play helper (Luau section), which clones, randomizes PlaybackSpeed and throttles. For combos, raise pitch by 2-3% per combo step (capped at +20%) to reward streaks.
    Done right: Collecting 20 coins in a row produces a lively, rising chime.
    Done wrong: Fifty identical clicks per second when a magnet pet vacuums coins.

28. **Positional sounds are tuned for their job: footsteps `RollOffMaxDistance` about 40, hits 60, gameplay warnings 80 with `RollOffMode = Linear`, and ambient loops 50-120 with `InverseTapered`.**
    Why: the default `Inverse` rolloff is natural but never truly ends, so distant cues bleed everywhere. Gameplay cues need a predictable cutoff.
    How: parent the Sound to an Attachment or Part at the source. Set `RollOffMinDistance` (full volume radius, 5-15) and `RollOffMaxDistance`. Music and UI stay non-positional (in SoundService or a GUI).
    Done right: You hear the boss roar from 80 studs and the waterfall only when you're near it.
    Done wrong: Every footstep on the server audible across the whole map.

29. **Music is per zone, loops 60-180 s long, crossfades over 1.5-2.5 s on zone change, and ducks to about 50% for 1-2 s under big reward stingers.**
    Why: music sets the mood of a zone as strongly as lighting does. Hard cuts feel cheap, and stingers buried under music lose their punch.
    How: the client zone controller ([[06 World and Look]]) calls the music crossfader (Luau section) with the zone's track from `Config.Zones[id].Music`. Tween the Music SoundGroup volume down and back up around stingers.
    Done right: Meadow folk fades into desert drums over 2 s as you cross the gate.
    Done wrong: One 40-second loop for the whole game, playing for hours.

30. **Use only audio the experience is allowed to play: tracks Roblox provides in the Creator Store, audio the owner uploaded, or audio shared with the experience. Never upload music you don't have rights to.**
    Why: audio the experience can't access won't play, and copyrighted music gets removed and can get the account in trouble. Roblox made most user-uploaded audio private to its uploader, with permission sharing for experiences, in its 2022 audio privacy change (rule of thumb: check the asset's permissions page).
    How: search the Creator Store's audio section for Roblox-provided music. Record the asset id and source in the asset registry (`cli.mjs asset add --kind audio`). Test every sound in a Play session of the published place.
    Done right: Each zone track is Roblox-provided or uploaded by the owner, and noted in the registry.
    Done wrong: A popular song uploaded by a crew member that is silent for players and gets the asset removed.

### Creator Store and model safety

31. **Treat every Creator Store model as hostile until every script inside has been read: insert into `ServerStorage.Assets.Quarantine`, disable scripts, scan, then decide.**
    Why: free models are a common source of backdoors: hidden scripts that give a stranger admin, prompt purchases of someone else's items, teleport players away or load more code later. Inserting in edit mode doesn't run scripts, but Play and publishing do.
    How: insert from the Toolbox, move the model straight into Quarantine, set `Enabled = false` on every Script and LocalScript inside, run the scanner (Luau section), then read each script. Studio may warn that a model contains scripts. Treat the warning as a hint, never as a guarantee.
    Done right: A tree pack with 3 hidden scripts, all deleted before it reaches `Workspace.Map`.
    Done wrong: Dragging a "cool car" straight into Workspace and pressing Play.

32. **The default for decorative models is zero scripts: delete every script and rewrite any behavior you need, and never keep `require(<number>)`, `getfenv`, `setfenv` or `loadstring`.**
    Why: `require` with an asset id loads code you can't see, and the author can change it at any time. Environment tampering and string-loaded code are the classic backdoor tools. Never enable HTTP requests or `LoadStringEnabled` because an asset asks for it.
    How: the scanner flags these patterns. Any hit you can't explain means delete. Reviewer re-runs the scan on the whole place before ship.
    Done right: A door model whose open script was deleted and replaced with a 10-line tween in our own DoorService.
    Done wrong: A "lighting fixer" model whose script does `require(4815162342)`.

33. **Store meshes pass the same budgets as our own: triangle count, texture size, part count and collision, before they go in the map.**
    Why: store models are often made for screenshots, with 20 unions, precise collision and 1024 textures on a pebble.
    How: count parts and textures in the model (audit script in [[06 World and Look]]), merge or simplify, set `CollisionFidelity` to Box or Hull for props, `CastShadow = false` on small detail, and anchor everything. Re-color to the zone palette, and don't keep a model whose art style clashes ([[06 World and Look]] rule 37).
    Done right: A 300-part store house reduced to 40 parts and two meshes, recolored to the zone palette.
    Done wrong: A 2,000-part store castle as background decoration.

34. **Steal patterns, not art: no store asset, AI image or mesh that copies another game's characters, logos or signature items.**
    Why: copying another game's assets or characters invites takedowns and makes the game look like a knockoff. Players notice.
    How: references describe a pattern ("a big gold egg with a crack glow"), never "the egg from game X". Librarian rejects lookalikes, and Reviewer checks names and silhouettes before ship.
    Done right: An original fruit mascot with its own silhouette and colors.
    Done wrong: A pet that is obviously another game's famous character, recolored.

### Blender to Roblox pipeline

35. **Lock the scale convention once per game with a test cube: export a 1 x 1 x 1 Blender cube, import it, read its `Size` in Studio, and adjust until it arrives at the size you expect.**
    Why: Blender units, FBX export scale and the importer's unit settings combine, and getting it wrong means every mesh needs rescaling by hand.
    How: write the working settings (Blender unit scale, FBX export scale, importer units) in the game's `decisions.md`. Re-test after any Blender or Studio update.
    Done right: "Blender unit scale 1.0, FBX scale 1.0, importer in studs: a 4-unit wall imports as 4 studs" in decisions.
    Done wrong: Every artist uses a different scale and props arrive 3.57x too big.

36. **Triangle budgets (targets): hero landmark meshes at most 10,000 triangles per mesh, medium props at most 2,000, small props at most 500, and every mesh under the engine's per-mesh limit (about 20,000; the importer reports it).**
    Why: triangle count drives memory and render cost, and the importer rejects meshes over the limit. Phones are the floor.
    How: in Blender, apply a Decimate modifier or retopologize, remove hidden faces (the bottom of anything that sits on the ground), and split big objects into pieces under the limit. Check the importer's report before importing.
    Done right: A 6,000-triangle windmill landmark in three pieces, and 300-triangle crates.
    Done wrong: A 150,000-triangle photogrammetry rock as a background prop.

37. **Texture budgets (targets): 1024 x 1024 for hero assets, 512 for props, 256 or less for small details, with shared atlases for kits. Uploads larger than 1024 are downscaled.**
    Why: texture memory, not triangles, is usually what crashes phones. A kit sharing one atlas costs one texture, not thirty.
    How: bake kit pieces onto one or two shared atlases. Use vertex colors or the MeshPart `Color` with no texture for flat-shaded stylized props. Reuse MaterialVariants for tiling surfaces instead of unique textures [6], [7].
    Done right: A 24-piece castle kit on one 1024 atlas plus two MaterialVariants.
    Done wrong: Every fence post with its own 1024 texture.

38. **PBR materials use a SurfaceAppearance on the MeshPart with the four supported maps (color, normal, roughness, metalness), and each variant is a separate template because scripts can't change the maps at runtime.**
    Why: Studio supports color, normal, roughness and metalness maps, the ColorMap is also called the albedo, and the maps change appearance without changing geometry [1], [3], [4]. Most SurfaceAppearance properties can't be modified by scripts because the engine needs to preprocess them [3]. The map properties are plugin-level, so Studio tools can set them and game scripts can't [5]. The class also has `AlphaMode` and emissive properties (`EmissiveStrength`, `EmissiveTint` and an emissive mask) [2].
    How: add a SurfaceAppearance to the MeshPart and enter an asset id for each map in the Properties window [1]. Keep one template per look (`Sword_Gold`, `Sword_Ice`) in Assets and clone the right one. Blender bakes OpenGL-style (Y+) normal maps; if bumps look inverted in Studio, flip the green channel. Rendering depends on the device and quality level, so check at low quality too [2].
    Done right: Three sword skins as three templates, swapped by cloning on equip.
    Done wrong: A script that tries to set `ColorMap` at runtime and errors.

39. **Use MaterialVariant for tileable surfaces and SurfaceAppearance for unique, UV-mapped meshes.**
    Why: MaterialVariant customizes a reusable tileable material, and SurfaceAppearance customizes a specific mesh with UV mapping [6]. MaterialVariants live under MaterialService and apply globally or per part [7].
    How: walls, floors and rock surfaces get MaterialVariants (made in the Material Manager [6]). Landmarks, weapons and characters get SurfaceAppearance.
    Done right: Castle walls on a `Castle_Stone` variant, and the castle's unique gate on a SurfaceAppearance.
    Done wrong: A SurfaceAppearance texture stretched over a 200-stud wall.

40. **Prepare every mesh the same way before export: apply transforms, set the origin at the pivot (bottom center for props, the grip for tools, the hinge for doors), name every object clearly, and UV-unwrap without overlaps for baked maps.**
    Why: each object becomes a MeshPart named after it. A bad origin makes props float or rotate around the wrong point, and unapplied transforms import rotated or scaled.
    How: Ctrl+A → All Transforms in Blender, set the origin, name objects `Kit_Wall_4x8` style, export FBX with "Selected Objects" (add the Armature for rigged models). In Studio, use Import 3D, check the preview for warnings, scale and orientation, then import.
    Done right: A kit where every piece snaps on the 4-stud grid with bottom-center pivots.
    Done wrong: Meshes named `Cube.047` with the pivot 30 studs away.

41. **After import, finish every mesh in Studio: anchor it, set `CollisionFidelity`, `CastShadow`, `CanCollide`, `CanTouch` and `CanQuery`, set `RenderFidelity = Automatic`, and save it to the asset folder as a template.**
    Why: imported meshes default to settings made for gameplay geometry, not decoration. Precise collision on decor is wasted physics.
    How: decor `CollisionFidelity = Box`, props `Hull`, walkable complex meshes `Default` or an invisible collision box ([[06 World and Look]] rule 49). Small detail `CastShadow = false`. `CollisionFidelity` is set in edit mode; scripts can't change it at runtime.
    Done right: A rock pack imported, set to Hull collision, and saved under `ServerStorage.Assets.Props.Rocks`.
    Done wrong: Imported foliage with precise collision that snags every player.

42. **Organize assets as reusable kits, the way Roblox's environmental art curriculum does: one central asset library place or folder, modular pieces that snap together, props and custom materials.**
    Why: Roblox's curriculum gives a whole chapter to assembling an asset library centrally for reuse [14], publishes a sample library with modular assets, props and custom materials [15], uses it to construct the final world [16], and lists a separate guide on modular assets that snap together in many configurations [17].
    How: kits live in `ReplicatedStorage.Assets` (things clients clone) or `ServerStorage.Assets` (server-cloned templates), grouped by zone and type. For assets shared across places, make them Packages ([[14 Roblox Studio Workflow]]).
    Done right: A 30-piece forest kit used across three zones and two places.
    Done wrong: Each zone built from different random store models.

### AI-generated art

43. **AI-generated images (Gemini through `node studio/cli.mjs image`, or any other generator) are originals made from a style brief, never copies of another game, brand or real person, and every image goes to Review before upload.**
    Why: Roblox moderates every uploaded image, and copied characters or logos get rejected or removed. The owner judges anything visual.
    How: write prompts as "style + subject + framing + background + palette" (template in the AI art section). Run `node studio/cli.mjs image --prompt "…" --out games/<slug>/art/<name>.png --aspect 1:1 --review "Use this as the Mythic egg texture?"`. Get a second opinion with `cli.mjs gemini` if needed. Keep the prompt next to the file (`<name>.prompt.txt`) so it can be regenerated.
    Done right: An original candy-world egg texture, prompt saved, approved in Review.
    Done wrong: "Make it look exactly like the egg in [famous game]".

44. **AI images are post-processed before upload: cropped to the target aspect, resized to power-of-two sizes (256, 512 or 1024), background removed for UI icons, seams fixed for tiling textures, and colors checked against the palette.**
    Why: generators produce odd sizes, soft edges, fake transparency (a checkerboard drawn into the pixels) and non-tiling edges. Uploads larger than 1024 get downscaled anyway.
    How: for tiling textures, test by tiling 3 x 3 in an image editor or on a MaterialVariant at `StudsPerTile` 8 and look for seams. For icons, check real alpha on a dark and a light background. Don't trust AI-made normal maps: generate the normal from a height map in a texture tool or bake it in Blender, or skip the normal map.
    Done right: A 512 x 512 seamless grass texture with a baked normal map.
    Done wrong: A 1536 x 1024 "transparent" PNG with a gray checkerboard baked in.

45. **Uploading belongs to the owner's account or group: the owner uploads in Studio's Asset Manager or on the Creator Hub, or creates an asset-upload Open Cloud key for the crew. Agents never use personal accounts.**
    Why: assets must belong to the experience owner to be usable everywhere (rule 8 applies to images and audio too), and uploading spends the owner's moderation standing. API access is something only the owner turns on ([[14 Roblox Studio Workflow]]).
    How: ask with `cli.mjs ask` and attach the approved files. When the asset id comes back, register it (`cli.mjs asset add --kind image --name "…" --roblox-id <id> --tags …`) and put it in `Config.Assets`. If you paste a decal id into a texture property, Studio converts it to the underlying image id, so use the id that shows in the property.
    Done right: Five approved icons uploaded by the owner to the group, registered and referenced from Config.
    Done wrong: An agent's own upload, which won't load in the group's game.

46. **Roblox's own generative tools in Studio (such as material, texture and mesh generation in recent Studio versions) are starting points, held to the same style, budget and review rules as everything else.**
    Why: generated assets are quick, but they can drift off style, carry high triangle counts or produce textures that don't tile. Availability and names change between Studio releases (rule of thumb: check Studio's current AI tools before planning around them).
    How: generate, then check the result against rules 36-39 and the palette, and send it to Review like any other art. Record what tool and prompt made it in the asset registry tags.
    Done right: A generated stone material, tweaked to the zone palette, used as a MaterialVariant.
    Done wrong: A generated 40,000-triangle statue dropped straight into the hub.

### Organization

47. **Assets are templates referenced by name, cloned at runtime, and registered in the library. Game code never fetches models by asset id with `InsertService`.**
    Why: runtime asset loading by id is slow, can fail, and is how backdoors load code. Templates in known folders are reviewable and stream predictably [25].
    How: use PascalCase names that say what a thing is (`CoinBurst`, `SwordSwing`, `Pet_Dragon_Gold`). Tunables go in Config or attributes (`EmitCount`, `TargetVolume`). Register every reusable asset with `cli.mjs asset add` so the team can find it.
    Done right: `ReplicatedStorage.Assets.VFX.LevelUp`, registered with tags `vfx,reward`.
    Done wrong: `InsertService:LoadAsset(123456)` in a server script at runtime.

48. **Preload what the first minute needs: the first-session sounds, the reward effect textures and the HUD images go through `ContentProvider:PreloadAsync` behind the loading screen, and nothing else does.**
    Why: the first coin burst arriving silent and invisible because its texture hasn't loaded makes the first reward feel broken ([[01 The First Five Minutes]]). Preloading everything makes the loading screen long.
    How: the ReplicatedFirst loading script preloads a list from `Config.Preload` (about 10-30 instances), with a timeout so a slow asset never blocks the game for more than 5 s.
    Done right: The first collect plays its chime and sparkle instantly.
    Done wrong: A 40 s loading screen that preloads every asset in the game.
