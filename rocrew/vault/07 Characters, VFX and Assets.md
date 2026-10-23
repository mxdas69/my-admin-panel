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

## Step by step

### Adding a new effect in 9 steps

1. Write the effect's job in one line ("tells the player they got coins", "warns of the boss slam") and pick its tier or recipe below.
2. Build the template: an anchored, invisible holder Part (`Transparency = 1`, `CanCollide`, `CanTouch` and `CanQuery` off, size 1 x 1 x 1) with Attachments, emitters, beams, lights and a Sound as needed.
3. Set every emitter's `Enabled = false` (for bursts) and an `EmitCount` attribute.
4. Set colors from `Config.Colors` (rule 17) and the size and transparency curves from the recipe (rule 16).
5. Put the template in `ReplicatedStorage.Assets.VFX` with a clear name.
6. Wire it: the server fires `PlayVFX(name, cframe)`, or the client plays it directly for its own actions (rule 14).
7. Test in Play at 10, 40 and 120 studs, on the Device Emulator phone preset and at graphics quality 1.
8. Check the budget (rule 15): count particles at peak with the effect playing 5 times at once.
9. Register it (`cli.mjs asset add --kind vfx --name "LevelUp" --tags reward,vfx`) and note it in the handoff.

### Adding an NPC in 10 steps

1. Write the NPC's role (shop, quest, enemy, ambient), name and zone in `plan.md`.
2. Pick the silhouette prop, signature color and icon (rule 4).
3. Build it from a HumanoidDescription (Luau section) or the Rig Builder, on the game's rig type (rule 1).
4. Stationary? Anchor the HumanoidRootPart and turn off unused Humanoid states (rule 3).
5. Add the BillboardGui name tag and, for quests, the "!" icon.
6. Add an idle animation (2-4 s loop) published to the experience owner (rule 8), with 2-3 variants for crowds (rule 13).
7. Add a ProximityPrompt (`ActionText` "Talk" or "Shop", `MaxActivationDistance` 8-10, `HoldDuration` 0) or a touch pad.
8. Add a short voice-like blip or greeting sound (UI group, 0.2-0.5 s).
9. Put the NPC model in `ServerStorage.Assets.NPCs` (server-spawned) or the zone's model with `ModelStreamingMode = Atomic` so it arrives whole [25].
10. Test: find the NPC from the zone entrance without UI help, talk to it on a phone, and check its name reads at 30 studs.

### Importing a Blender mesh in 12 steps

1. Confirm the scale convention in `decisions.md` (rule 35). If there isn't one, run the test cube first.
2. Model to the budget (rules 36-37). Delete hidden faces.
3. Apply all transforms. Set the origin at the pivot (rule 40).
4. Name objects with the kit convention.
5. UV-unwrap and bake maps (color, normal, roughness, metalness) at the budget size, normals OpenGL-style.
6. Export FBX with selected objects only (plus the Armature for rigs).
7. In Studio, open Import 3D (File menu, or the Home or Avatar tab), choose the file and read the preview's warnings.
8. Check the preview size against the test cube convention and the orientation.
9. Import. Set anchoring, collision fidelity and collision flags (rule 41).
10. Add a SurfaceAppearance with the uploaded maps if the asset is PBR (rule 38), or set `Color` and `Material` for stylized assets.
11. Check it in place at quality 1 and quality 10, and next to the 5-stud dummy for scale.
12. Save as a template in the asset folders, register it, and note triangles and textures in the handoff.

### Bringing in an AI-generated texture or image in 10 steps

1. Write the brief: what it's for (icon, tiling texture, decal, sky panel), target size, palette and style words from `plan.md`.
2. Generate with `node studio/cli.mjs image --prompt "…" --out games/<slug>/art/<name>.png --aspect 1:1`.
3. Save the prompt alongside it (`<name>.prompt.txt`).
4. Post-process (rule 44): crop, resize to a power of two, remove the background or fix seams.
5. Check it against the palette and the style references. Regenerate if it drifts.
6. Send it to Review with one clear question (`--review` on the image command, or `cli.mjs review`).
7. On approval, ask the owner to upload it to the owning account or group (rule 45).
8. Register the returned id with `cli.mjs asset add` and put it in `Config.Assets`.
9. Apply it in Studio (ImageLabel, Decal, SurfaceAppearance or MaterialVariant) and test in Play at quality 1 and 10.
10. Check that moderation has approved it (the image shows for a second test account, not just in your own Studio session).

### Vetting a Creator Store model in 8 steps

1. Prefer assets made by Roblox or verified creators, with no scripts, in the game's art style.
2. Insert in edit mode (never during Play).
3. Move it into `ServerStorage.Assets.Quarantine` immediately.
4. Disable every script inside and run the scanner (Luau section).
5. Read every script. Delete it unless you can explain every line. Default: delete all scripts in decorative models (rule 32).
6. Check budgets: parts, unions, textures and collision (rule 33).
7. Recolor to the palette, anchor, set collision flags, and save it as a template.
8. Register it, noting the source asset id, and tell Reviewer in the handoff that it passed the scan.

### Scoring a zone in 7 steps

1. Pick the zone's music track (Roblox-provided or owner-uploaded, rule 30) and loop length (60-180 s).
2. Pick 2-3 ambient loops (wind, birds, lava bubbling) as positional sounds at their sources, with `InverseTapered` rolloff and `RollOffMaxDistance` 50-120.
3. Add sound beacons at the zone's key objectives ([[06 World and Look]] rule 54).
4. Set the music in `Config.Zones[id].Music` so the zone controller crossfades to it (rule 29).
5. Check levels: walk the zone with music, ambience and SFX together. Gameplay SFX must stay clearly louder than music.
6. Check the music toggle mutes music only.
7. Note track sources in the asset registry.

## Character and rig specs

| Item | Spec (targets) | Notes |
|---|---|---|
| Player rig | R15 (default) or R6 (deliberate) | Locked in avatar settings (rule 1) |
| Default avatar height | about 5 studs | Community measurements [12], [13]; scales up to about 105% height [8], [9] |
| Test dummies | 5-stud and 6-stud | Rig Builder; kept in `ServerStorage.Assets.Dev` |
| Combat hitbox | 4 x 5.5 x 3 box welded to root | Equal for all avatars (rule 2) |
| Active Humanoid NPCs near players | at most about 20 | Anchored stationary NPCs don't count much |
| NPC name tag | BillboardGui 6 x 1.5 studs, offset 3.5 up, `MaxDistance` 60 | `LightInfluence` 0 |
| Quest icon | 2 x 2 studs, accent color, bobbing 0.5 studs over 1.2 s | Only while a quest is available |
| Pet size | 1.5-3 studs tall (small), 3-5 (large) | Never taller than the player in hubs |
| Pet follow | Lerp toward an offset 3-5 studs behind and to the side | Client-side (rule 6) |
| Pets per player shown | 3-6 | Others hidden past 60 studs |
| Non-humanoid creature | AnimationController + Animator | No Humanoid |

## Animation specs

| Animation | Length | Priority | Loop | Notes |
|---|---|---|---|---|
| Idle | 2-4 s | Idle | Yes | 2-3 variants for crowds |
| Walk or run replacement | 0.6-1 s cycle | Movement | Yes | Via the `Animate` script (rule 12) |
| Light attack | 0.3-0.6 s | Action | No | Hit marker, 0.05 s fade in |
| Heavy attack or ability | 0.6-1.2 s | Action2 | No | Longer anticipation, shows a telegraph |
| Hit reaction | 0.2-0.35 s | Action3 | No | Interrupts attacks |
| Stun or knockdown | 0.6-1.5 s | Action3 | No | Pairs with a Camera blur for the victim |
| Emote | 2-6 s | Action | Often | Cancels on movement |
| Tool use (swing, cast, fish) | 0.4-1 s | Action | No | Marker for the effect |
| Celebrate (reward, win) | 1-2 s | Action2 | No | Optional, never blocks input more than 1 s |
| NPC talk | 1.5-3 s | Action | Yes | Plays while a dialog is open |

## VFX recipes

All values are this studio's starting targets. "Emit" means `Enabled = false` plus `Emit(n)` from the player script (the `EmitCount` attribute). Size and Transparency are NumberSequences written as `time: value` pairs. Speed, Lifetime and RotSpeed are NumberRanges written as `min-max`. Textures: use the engine's default sparkle texture (`rbxasset://textures/particles/sparkles_main.dds`) or smoke texture (`rbxasset://textures/particles/smoke_main.dds`) for prototypes, then switch to uploaded, on-style textures.

### Coin burst (pickup)

| Property | Value |
|---|---|
| EmitCount | 12 |
| Lifetime | 0.4-0.7 |
| Speed | 12-20 |
| SpreadAngle | 180, 180 |
| Acceleration | 0, -30, 0 |
| Drag | 3 |
| Size | 0: 0.6 · 0.2: 0.8 · 1: 0 |
| Transparency | 0: 0 · 0.7: 0 · 1: 1 |
| Color | `#FFD54A` → `#FFB300` |
| LightEmission / LightInfluence | 0.8 / 0 |
| RotSpeed | -180 to 180 |
| Sound | Collect chime, SFX group, PlaybackSpeed 1.0 ± 8% (rule 27) |

### Ambient sparkle (on collectibles and rare items)

| Property | Value |
|---|---|
| Rate | 4-8 |
| Lifetime | 1-1.5 |
| Speed | 0.5-1 |
| Shape / ShapeStyle | Box / Surface (covers the item) |
| Size | 0: 0 · 0.3: 0.35 · 1: 0 |
| Transparency | 0: 0.2 · 1: 1 |
| Color | Accent or rarity color |
| LightEmission / LightInfluence | 1 / 0 |
| RotSpeed | -90 to 90 |

### Level-up pillar

| Part | Values |
|---|---|
| Column emitter | Shape Cylinder, ShapeStyle Surface, EmissionDirection Top, EmitCount 40, Lifetime 0.6-0.9, Speed 18-24, Size 0: 0.4 · 1: 0, Color `#FFF3A0` → `#FFC400`, LightEmission 1 |
| Ring emitter | Shape Disc, ShapeInOut Outward, EmitCount 24, Lifetime 0.4-0.6, Speed 14-18, SpreadAngle 0, 0, Size 0: 0.5 · 1: 0 |
| Flash light | PointLight Range 16, Brightness 3, Shadows off, tween Brightness to 0 over 0.4 s |
| Screen | Optional Camera ColorCorrection Brightness +0.1 for 0.15 s |
| Sound | Level-up stinger, music ducked to 50% for 1.5 s (rule 29) |

### Hit spark

| Property | Value |
|---|---|
| EmitCount | 6-10 |
| Lifetime | 0.12-0.25 |
| Speed | 25-40 |
| SpreadAngle | 60, 60 |
| Orientation | VelocityParallel |
| Size | 0: 0.3 · 1: 0 |
| Color | `#FFFFFF` → `#FFE08A` |
| LightEmission / LightInfluence | 1 / 0 |
| Extra | Highlight flash on the target (rule 21), hitstop 0.04-0.06 s on the attacker's track (Luau section), hit sound |

### Dust puff (landing, footstep, drop, dash start)

| Property | Value |
|---|---|
| EmitCount | 6-10 |
| Lifetime | 0.5-0.9 |
| Speed | 3-6 |
| SpreadAngle | 80, 10 (flat) |
| Acceleration | 0, 2, 0 |
| Drag | 4 |
| Size | 0: 0.8 · 1: 2.5 |
| Transparency | 0: 0.4 · 1: 1 |
| Color | Ground color from the zone palette (for example `#CDBA96`) |
| Texture | Smoke |
| LightEmission / LightInfluence | 0 / 1 |

### Smoke column (chimney, crashed ship, campfire)

| Property | Value |
|---|---|
| Rate | 3-6 |
| Lifetime | 4-6 |
| Speed | 2-3 |
| SpreadAngle | 10, 10 |
| Acceleration | 0.5, 1, 0 (drift) |
| Size | 0: 2 · 1: 8 |
| Transparency | 0: 0.6 · 0.2: 0.4 · 1: 1 |
| RotSpeed | -20 to 20 |
| Color | `#9A9A9A` (light smoke) or `#3A3A3A` (dark) |
| LightEmission / LightInfluence | 0 / 1 |

### Stylized fire

| Part | Values |
|---|---|
| Flame emitter | Rate 20-30, Lifetime 0.6-1, Speed 3-5, SpreadAngle 10, 10, Acceleration 0, 4, 0, Size 0: 1.6 · 1: 0.2, Transparency 0: 0.2 · 0.7: 0.4 · 1: 1, Color `#FFF1A0` → `#FF8A00` → `#C2300A`, LightEmission 1, LightInfluence 0 |
| Embers emitter | Rate 3, Lifetime 1.5-2.5, Speed 4-7, SpreadAngle 25, 25, Size 0.15 constant, Color `#FFB347`, LightEmission 1 |
| Light | PointLight Range 14, Brightness 1.5, Color `#FF9A3C`; the client flickers Brightness between 1.2 and 1.8 every 0.1 s. Shadows only if it's the scene's hero light [21] |
| Sound | Crackle loop, Ambient group, InverseTapered, max distance 40 |

### Magic aura (equipped rare item or buff)

| Property | Value |
|---|---|
| Rate | 10 |
| Lifetime | 1-1.4 |
| Speed | 1-2 |
| Shape / ShapeStyle | Cylinder / Surface, around the character |
| EmissionDirection | Top |
| Size | 0: 0.2 · 0.5: 0.4 · 1: 0 |
| Color | Rarity color |
| LightEmission / LightInfluence | 1 / 0 |
| VelocityInheritance | 0.5 |
| Budget | Hidden past 60 studs; off in Reduced effects |

### Portal swirl

| Part | Values |
|---|---|
| Swirl emitter | Shape Disc, ShapeInOut Inward, Rate 40, Lifetime 0.8-1.2, Speed 4-6, Size 0: 0.5 · 1: 0, RotSpeed 90-180, Color `#7FE0FF` → `#B57BFF`, LightEmission 1 |
| Ring | Neon torus mesh in the portal color, slowly rotating (client tween, 6 s per turn) |
| Sound | Hum loop (Ambient, max 40) and a whoosh on use |

### Guide arrow Beam

| Property | Value |
|---|---|
| Width0 / Width1 | 1.5 / 1.5 |
| Texture | Uploaded arrow strip |
| TextureMode / TextureLength / TextureSpeed | Wrap / 3 / 1.5 |
| FaceCamera | true |
| Segments | 20 |
| LightEmission / LightInfluence | 1 / 0 |
| Color | Accent |
| Transparency | 0: 0.7 · 0.15: 0.1 · 0.85: 0.1 · 1: 0.8 |

### Laser or tether Beam

| Property | Value |
|---|---|
| Width0 / Width1 | 0.4 / 0.4 (tether 0.25 / 0.15) |
| TextureMode / TextureSpeed | Stretch / 2 |
| FaceCamera | true |
| Segments | 1 (straight) or 10 (tether with CurveSize 2-4) |
| LightEmission / LightInfluence | 1 / 0 |
| Color | Weapon or team color; hazard hue for enemy lasers |
| Lightning variant | Segments 12, the client randomizes CurveSize0 and CurveSize1 between -3 and 3 every 0.05 s for 0.3 s |

### Sword swing Trail

| Property | Value |
|---|---|
| Attachments | Blade base and tip, 2-4 studs apart |
| Lifetime | 0.18 |
| MinLength | 0.1 |
| WidthScale | 0: 1 · 1: 0 |
| Transparency | 0: 0.2 · 1: 1 |
| Color | `#FFFFFF` → weapon color |
| LightEmission | 0.7 |
| FaceCamera | false |
| Enabled | Only between the swing and recovery markers (rule 20) |

### Dash or speed Trail

| Property | Value |
|---|---|
| Attachments | On the HumanoidRootPart, offsets (0, 1.2, 0) and (0, -1.2, 0) |
| Lifetime | 0.3 |
| Transparency | 0: 0.5 · 1: 1 |
| WidthScale | 0: 1 · 1: 0.2 |
| Color | Accent or ability color |
| LightEmission | 0.5 |
| Extra | FieldOfView +8 for 0.2 s ([[06 World and Look]] rule 59), whoosh sound |

### Heal

| Property | Value |
|---|---|
| EmitCount | 16-24 |
| Shape | Disc around the feet |
| Lifetime | 0.8-1.1 |
| Speed | 3-5 |
| Acceleration | 0, 2, 0 |
| Texture | Uploaded plus sign |
| Color | `#6CFF8A` |
| LightEmission / LightInfluence | 0.6 / 0 |
| Sound | Soft rising chime |

### Confetti (win, big purchase thank-you)

| Property | Value |
|---|---|
| Emitters | 3-4, one color each (a ColorSequence changes over lifetime, not per particle) |
| EmitCount | 15 per emitter, in two bursts 0.3 s apart |
| Lifetime | 2-3 |
| Speed | 30-45 |
| SpreadAngle | 25, 25 (upward) |
| Acceleration | 0, -25, 0 |
| Drag | 1.5 |
| RotSpeed | -360 to 360 |
| Size | 0.3 constant |
| LightEmission / LightInfluence | 0 / 1 |

### Water splash

| Property | Value |
|---|---|
| EmitCount | 20 |
| Lifetime | 0.5-0.8 |
| Speed | 12-18 |
| SpreadAngle | 25, 25 |
| Acceleration | 0, -60, 0 |
| Size | 0: 0.4 · 1: 0.1 |
| Transparency | 0: 0.2 · 1: 1 |
| Color | `#E6FBFF` |
| LightEmission | 0.3 |
| Sound | Splash, SFX group, max distance 50 |

### Stylized explosion (no physics)

Build explosions from emitters (a 0.15 s white flash core, an orange fireball with 0.3-0.5 s lifetime, a dust ring and smoke) rather than an `Explosion` instance. An `Explosion` applies blast pressure and can break joints. If you do use one for its look, set `BlastPressure = 0` and `DestroyJointRadiusPercent = 0` and let the server apply damage separately.

## Reward tiers

Tier colors here are placeholders. Use the rarity colors in [[03 Rarity and RNG]] when they differ.

| Tier | Color | Duration | Visuals | Sound | Extra |
|---|---|---|---|---|---|
| Common | `#B0B7C3` | 0.3 s | Small burst, 8 particles | Soft pop | none |
| Uncommon | `#4CD964` | 0.4 s | Burst 14 + ring | Pop + chime | none |
| Rare | `#2D9CFF` | 0.8 s | Burst 24, ring, short pillar | Bright chime | PointLight flash |
| Epic | `#A65BFF` | 1.2 s | Pillar, ring, sparkles orbiting 1 s | Chime + whoosh | Camera shake 0.1 studs, music duck |
| Legendary | `#FFB020` | 2 s | Screen dims to 60% for 0.4 s, gold pillar, confetti | Choir hit | Shake 0.2, toast to the server |
| Mythic | `#FF3B6B` | 2.5 s | Dim, double pillar, rotating rays (Beams), confetti | Unique stinger | Shake 0.3, server-wide announcement |
| Secret | Rainbow cycle | 3 s | Everything above, color cycling | Unique stinger + reverse cymbal | Global announcement ([[10 Retention and Social]]) |

Rules: the server decides the tier, and the client only plays it. Players can skip anything over 1 s with a tap after the first reveal. Reduced effects mode keeps the sound and the color but drops the dimming, shake and confetti.

## Audio specs

### SoundGroups

| Group | Starting volume | Contents | Player setting |
|---|---|---|---|
| Music | 0.35 | Zone tracks, menu theme | Toggle + slider |
| SFX | 0.6 | Gameplay sounds, rewards, combat | Slider |
| UI | 0.5 | Clicks, opens, errors | Follows SFX or own slider |
| Ambient | 0.4 | Wind, water, crowds, beacons | Follows SFX |

### Sound list every game needs

| Sound | Length | Group | Positional? | Notes |
|---|---|---|---|---|
| Button click | 0.05-0.15 s | UI | No | Soft, varied pitch |
| Open / close panel | 0.1-0.25 s | UI | No | Paired up/down sounds |
| Error / can't afford | 0.2-0.4 s | UI | No | Low and soft |
| Collect | 0.1-0.3 s | SFX | Local: no; others: yes | Rising pitch on streaks |
| Purchase success | 0.4-0.8 s | UI | No | Satisfying "cha-ching" |
| Level up | 0.8-1.5 s | SFX | No | Ducks music |
| Hatch / open reveal | per tier | SFX | No | Escalates by tier |
| Hit / take damage | 0.1-0.3 s | SFX | Yes, max 60 | 3 variants |
| Footsteps | 0.1-0.2 s | SFX | Yes, max 40 | Per ground material if possible |
| Gate unlock | 0.6-1.2 s | SFX | Yes, max 80 | Big and celebratory |
| Warning / telegraph | 0.4-1 s | SFX | Yes, max 80, Linear | Rising pitch |
| Ambient loop | 20-60 s loops | Ambient | Yes, 50-120, InverseTapered | Per zone |
| Zone music | 60-180 s loops | Music | No | Crossfade 2 s |

## Creator Store and model safety

| Red flag | Why it matters |
|---|---|
| `require(1234567)` (a number) | Loads a module by asset id: code you can't see, which its author can change |
| `getfenv`, `setfenv`, `loadstring` | Environment tampering and running code from strings |
| `string.char`, `string.reverse`, `\104\101` escapes, huge single lines | Obfuscation |
| `HttpService`, `TeleportService`, `InsertService`, `MarketplaceService` prompts | Network calls, teleporting players away, loading assets, selling someone else's items |
| Scripts in odd places or with odd names (in a tree, named like a Weld, blank names) | Hiding |
| `PlayerAdded` handlers in a decorative model | Admin grants and backdoors |
| A model that asks you to enable HTTP requests or LoadStringEnabled | Never do it for an asset |

A scanner hit is a reason to read the script, not proof of malice. An unexplained hit means delete. Reviewer re-runs the scan on the whole place before ship.

**Choosing store assets:** prefer models by Roblox or verified creators, with no scripts, matching the art style, under the budgets. Read the description and the asset's comments if any. A model with an unusually high part count for its size is usually unoptimized. Once a model is kept, the library entry records its source id so it can be checked again later.

## Blender pipeline specs

| Item | Spec (targets) |
|---|---|
| Scale | Locked by the test cube (rule 35), written in decisions |
| Triangles | Hero 10,000, medium 2,000, small 500 per mesh; engine limit about 20,000 |
| Textures | Hero 1024, props 512, details 256; shared atlases for kits |
| Maps | Color, normal (OpenGL Y+), roughness, metalness [1] |
| Origin | Bottom center (props), grip (tools), hinge (doors), root (characters) |
| Transforms | Applied (all) |
| Names | `Kit_Wall_4x8`, `Prop_Barrel_A`, `Tool_Sword_Gold` |
| Export | FBX, selected objects only (+ Armature for rigs) |
| Import | Import 3D, read the warnings, check scale and orientation |
| After import | Anchor, collision fidelity, collision flags, `CastShadow` off on small details, template saved |
| Variants | One template per look; no runtime map swaps (rule 38) |
| Kit grid | Footprints in multiples of 4 studs so pieces snap with 1-stud or 4-stud grid snapping |

## AI art pipeline

**Prompt template:**

```
<style> of <subject>, <framing>, <background>, <palette>, <lighting>, <constraints>

Example (tiling texture):
Stylized hand-painted cobblestone path texture, top-down orthographic, seamless tileable,
fills the frame edge to edge, warm grey stones #9A9A9A with moss green #6B8F3A gaps,
soft even lighting with no cast shadows, no text, no logos, square.

Example (UI icon):
Cute chunky 3D game icon of a golden egg with a glowing crack, centered, 10% padding,
plain solid #00FF00 background for removal, bold rim light, saturated warm colors,
no text, no logos, square.
```

| Output | Size | Format | Must check |
|---|---|---|---|
| UI icon | 512 x 512 (shown at 64-128 px) | PNG with real alpha | Reads at 48 px on a phone; no fake checkerboard |
| Tiling texture | 512 or 1024 square | PNG | Tiles 3 x 3 without seams |
| Decal / sign art | 512 or 1024 | PNG | Legible at 40 studs |
| Sky panel | 1024 per face | PNG | Six faces match at the edges (hard to get from AI; prefer store or Roblox skies) |
| SurfaceAppearance color map | Budget size | PNG | Matches the mesh UVs (usually needs Blender baking, not raw AI output) |
| Thumbnail and icon | See [[11 Thumbnails, Icons and the Store Page]] | | |

**What AI art is good for:** icons, decals, signs, posters, UI ornaments, concept images to brief Blender work, and stylized tiling textures. **What it's bad at:** UV-matched textures for specific meshes, consistent multi-face skyboxes, normal maps, and anything with text (render text in the UI instead).

## Asset organization

```
ReplicatedStorage.Assets      (Librarian; clients can see and clone these)
  VFX/            CoinBurst, LevelUp, HitSpark, Reveal_<Tier> ...
  Sounds/         UI/, SFX/, Music/, Ambient/
  Animations/     Animation instances with AnimationId set (ids also in Config.Animations)
  Pets/           client-rendered pet models (rule 6)
  Models/         client-cloned props and previews
  UI/             image templates used by Frame
ServerStorage.Assets          (Librarian; server only)
  NPCs/  Enemies/  Drops/  Tools/  Maps/
  Dev/            test dummies, debug props (never in the live map)
  Quarantine/     newly inserted store models awaiting the scan
SoundService                  Music, SFX, UI, Ambient (SoundGroups)
MaterialService               MaterialVariants ([[06 World and Look]] rule 41)
```

Naming: PascalCase, type first for kits (`Kit_`, `Prop_`, `Tool_`, `Pet_`, `Reveal_`), then the variant. Every reusable asset is registered with `node studio/cli.mjs asset add --kind <model|vfx|audio|image|animation> --name "…" --roblox-id <id> --tags a,b`.

## Examples from top games

### A guide that's an effect, not a character
**Game:** Doors ([26])
**Shows:** Guiding Light, the Hotel's guide entity, narrates and uses glowing blue particles to point players toward their next move.
**Why it works:** A particle guide can go anywhere, never blocks the path and fits a dark horror world where a human NPC would break the mood.
**Steal:** A signature guide effect with its own color, used only for help, so players learn "blue sparkles = the way".
**Avoid:** Using the guide's color for decoration or enemies, which breaks the meaning.

### Hints that highlight the hidden thing
**Game:** Doors ([26])
**Shows:** Guiding Light can highlight hidden keys when players are having trouble finding them.
**Why it works:** The effect solves a frustration (a pixel hunt) without removing the search for players who find the key on their own.
**Steal:** A delayed Highlight or sparkle on the hidden objective after a stuck timer (rule 21, [[06 World and Look]] rule 53).
**Avoid:** Highlights that are on from the start, which turn every search into following an outline.

### Effects that carry the player through a chase
**Game:** Doors ([26])
**Shows:** During Seek's chase, Guiding Light lights up the path.
**Why it works:** In a high-stress moment the effect makes the right choice readable at a glance.
**Steal:** In chases and timed sections, light the correct route with the guide effect and keep wrong routes dark.
**Avoid:** Chase sequences where the correct door is visually identical to dead ends.

### One guide effect reused across floors
**Game:** Doors ([26], [29])
**Shows:** The DOORS Wiki lists Guiding Light on Floor 1 (the Hotel) and in The Mines.
**Why it works:** New content keeps the same help language, so returning players don't have to relearn what the guide looks like.
**Steal:** Keep guidance effects, UI feedback and reward effects as shared templates (rule 42) that every new zone or update reuses.
**Avoid:** Re-inventing the guide effect for each update.

### The player's light is the key tool
**Game:** Doors ([27], [28])
**Shows:** Doors is a horror game built around dark rooms, and its wiki has pages for light-source items such as the Shakelight.
**Why it works:** When darkness is the threat, the light the player carries is both a tool and a VFX moment.
**Steal:** Make the player's light an item with a strong visual identity (a SpotLight with shadows, a beam cone, a recharge animation), budgeted as the scene's hero light (rule 23).
**Avoid:** A flat, shadowless light that doesn't change how the room looks.

### Named shopkeepers give shops a face
**Game:** Grow a Garden ([32], [33])
**Shows:** Guides name the NPC who runs the Seed Shop and the NPC who manages gear sales, with the two shops on opposite sides of the map.
**Why it works:** Players say "go to the seed guy". A named character turns a menu into a place and makes updates feel like news ("new stock from the gear NPC").
**Steal:** Every shop gets a named NPC with a silhouette prop and a name tag (rule 4).
**Avoid:** Shops that are just a floating button on a box.

### One item, many visible tiers
**Game:** Grow a Garden ([30], [31])
**Shows:** Gear guides list sprinklers in tiers (Basic, Godly, Master and others) at very different prices.
**Why it works:** Tiered versions of the same item are an easy content ladder, and each tier needs to look like its price.
**Steal:** One base mesh with tier variants: color and material per tier, more particles and glow at higher tiers, and a distinct sound on placement. Separate templates per tier (rule 38).
**Avoid:** Tiers that look identical, so the expensive one feels like a scam.

### A central asset that visibly levels up
**Game:** 99 Nights in the Forest ([35])
**Shows:** Guides describe upgrading the campfire with fuel to expand the map.
**Why it works:** The campfire is the game's heart. Its size, light and effects show how far the group has come.
**Steal:** For base and survival games, build the central asset with 3-5 visible upgrade states (bigger model, brighter light, more particles, new sound), each a template.
**Avoid:** Upgrades that only change a number in the UI.

### Characters to rescue
**Game:** 99 Nights in the Forest ([34])
**Shows:** Guides explain how to find and save a lost child character in the forest.
**Why it works:** A character in danger gives exploring a purpose and an emotional hook beyond loot.
**Steal:** Rescue or escort NPCs with a strong silhouette, a readable state (scared, following, saved) and a sound cue that helps players find them.
**Avoid:** Rescue targets that blend into the scenery.

### Assets color-coded to a system
**Game:** Bee Swarm Simulator ([36])
**Shows:** The Mushroom Field is described as the first red field available to players.
**Why it works:** Asset color carries a game system, so the art teaches the rules.
**Steal:** Link asset colors to a system (element, rarity, team) and keep that mapping in `Config.Colors` (rule 17).
**Avoid:** Random asset colors that suggest a system that isn't there.

### Functional set pieces in the hub
**Game:** Pet Simulator 99 ([37])
**Shows:** The Spawn hub has a shop, a mailbox and leaderboards.
**Why it works:** Props that are also features (a mailbox you use, a leaderboard you read) make the hub useful and recognizable.
**Steal:** Build feature props as hero assets with their own silhouette, sound and idle effect (a mailbox flag that bobs when mail arrives).
**Avoid:** Features that live only in menus, with no object in the world.

### Miniatures reuse assets as previews
**Game:** Natural Disaster Survival ([38])
**Shows:** A lobby room has miniature models of four of the game's maps, used in an event quest.
**Why it works:** Scaled-down copies of existing maps are cheap content that previews the game and gives events a place to hide things.
**Steal:** Reuse map and zone kits as scaled dioramas in the lobby or shop (scale the model with `Model:ScaleTo`, then audit part counts).
**Avoid:** Full-detail copies that double the part budget.

### Roblox's own asset-library workflow
**Game:** Roblox's Environmental Art curriculum and sample places ([14], [15], [16])
**Shows:** The curriculum develops polished assets, assembles them into a central asset library (sample place with modular assets, props and custom materials) and then constructs the world from it.
**Why it works:** One library of tested, budgeted pieces makes every zone consistent and fast to build.
**Steal:** Follow the same three steps for every game: kit, library, assembly (rule 42).
**Avoid:** Building zones directly from random inserts.

## By genre

**Simulator.** The collect effect is the core loop, so it gets the most polish: coin burst, chime with rising pitch, a number popup ([[05 UI and HUD]]). Pets are client-rendered (rule 6). Reward tiers for eggs and upgrades. Each zone has its own music and ambience. Budget particles hard: many players collect at once.

**Tycoon.** Every purchase builds something with a short build effect (0.4-0.8 s: parts rise or scale in, dust puff, a "build" sound). Droppers and conveyors use simple, cheap effects (one sparkle per drop, or none). The money collect sound is the signature. Upgrade tiers change the machines' look.

**Obby.** Checkpoint touch: burst, chime and a toast. Death: a short, non-gory effect (a poof and a soft sound) and a fast respawn. Hazards animate (spinning, pulsing Neon) so they read as dangerous. Trails and win effects are popular cosmetics. Footstep dust is optional.

**Roleplay and life sim.** Characters and customization are the content: many accessories and clothing, applied through the server (rule 5). NPC townspeople animated on the client (rule 13). Ambient audio per district. Emotes and sit animations. Few combat effects.

**Action and combat.** Animation timing and hit feedback are everything (rules 10, 11): markers, hit sparks, hitstop, Highlight flashes, camera shake of at most 0.3 studs, and 3 hit sound variants. Telegraphs for every enemy attack (rule 24). Custom hitboxes (rule 2).

**Battlegrounds.** Move sets are the product: each ability has a distinct silhouette, color and sound, readable from 60 studs. Ultimates get tier-like escalation. Keep effects short (under 1.5 s) so the screen doesn't flood in 10-player fights. R6 or R15 chosen deliberately (rule 1).

**Survival.** A central asset with upgrade states ([35]). Day/night ambience changes. Resource gather effects (wood chips, stone dust) by material. Creature NPCs on AnimationControllers, telegraphs for attacks, and campfire light as the hero light.

**Horror.** Sound does most of the work: positional cues with tuned rolloff (rule 28), silence, sudden stingers. The player's light is a hero item ([27], [28]). Monster telegraphs are audio first. A guide effect for stuck players ([26]). Few, deliberate particles (dust in light beams, breath fog).

**Tower defense.** Each tower has a distinct silhouette, an idle animation and an attack effect readable at the board's camera distance. Enemy types are distinguishable by shape and color. Hit effects are tiny and cheap because hundreds happen per wave. Upgrades change the tower's look per tier.

**RNG and collection.** The reveal is the product: the reward tiers table, skippable after the first reveal, with server-wide announcements for top tiers. Collectibles have idle effects by rarity, hidden past 60 studs. The index needs consistent 3D previews or icons ([[05 UI and HUD]]).

**Shooter.** Muzzle flash (a 0.05 s flash emitter and a PointLight), tracers (a Beam or short Trail), impact effects by material, and hit markers with sound. Recoil animations. Effects must never hide targets. Sound positional with Linear rolloff for gunshots so direction reads.

**Racing.** Vehicle trails at speed, drift smoke (dust puff variant on the wheels), boost flames, and engine sound with PlaybackSpeed tied to speed (0.8-1.6). Checkpoint pass effect. Effects stay cheap because cars move fast across streaming areas.

**Sports.** Ball trail at speed, goal celebration (confetti, crowd cheer, camera), kick and catch animations synced with markers, and a crowd ambience loop. Team colors on effects.

**Party and social hangout.** Emotes, sit and dance animations, cosmetic trails and auras, and celebration effects for minigame wins. Music is central (zone and stage music). Keep effects friendly and short.

**Story and puzzle.** Effects mark interactable puzzle pieces (subtle ambient sparkle in the puzzle color). Story NPCs need talk animations and clear silhouettes. Cutscene effects stay under 5 s. Music changes per chapter.

**Farming and fishing.** Growth stages as separate templates with a small pop effect on each stage change. Harvest burst and sound. Fishing: a cast trail, a bobber splash, a bite telegraph (ripple and sound) and a catch reveal by rarity. Tiered tools look their tier ([30], [31]).

## Luau

### Animation track cache (client)

```lua
--!strict
-- StarterPlayerScripts/Controllers/AnimationController (ModuleScript): load once per character, reuse tracks
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ANIMS = ReplicatedStorage.Assets.Animations -- Animation instances; set Priority attribute if not Action

local AnimationController = {}
local tracks: { [string]: AnimationTrack } = {}

local function loadTracks(character: Model)
	table.clear(tracks)
	local humanoid = character:WaitForChild("Humanoid") :: Humanoid
	local animator = humanoid:WaitForChild("Animator") :: Animator
	for _, anim in ANIMS:GetChildren() do
		if anim:IsA("Animation") then
			local track = animator:LoadAnimation(anim)
			local priority = anim:GetAttribute("Priority")
			track.Priority = if typeof(priority) == "string"
				then (Enum.AnimationPriority :: any)[priority]
				else Enum.AnimationPriority.Action
			tracks[anim.Name] = track
		end
	end
end

function AnimationController.play(name: string, fade: number?, speed: number?): AnimationTrack?
	local track = tracks[name]
	if track then
		track:Play(fade or 0.05, 1, speed or 1)
	end
	return track
end

function AnimationController.Start()
	local player = Players.LocalPlayer
	player.CharacterAdded:Connect(loadTracks)
	if player.Character then loadTracks(player.Character) end
end

return AnimationController
```

### Effect player (client)

```lua
--!strict
-- StarterPlayerScripts/Controllers/VfxController (ModuleScript).
-- Templates: anchored invisible holder Parts in ReplicatedStorage.Assets.VFX with emitters, beams, lights, sounds.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local VFX = ReplicatedStorage.Assets.VFX
local MAX_DISTANCE = 200

local VfxController = {}
VfxController.reduced = false -- set from the player's settings

function VfxController.play(name: string, cf: CFrame)
	local camera = workspace.CurrentCamera
	if camera and (camera.CFrame.Position - cf.Position).Magnitude > MAX_DISTANCE then return end
	local template = VFX:FindFirstChild(name)
	if not (template and template:IsA("BasePart")) then return end

	local holder = template:Clone()
	holder.CFrame = cf
	holder.Parent = workspace -- parent before Emit so particles appear

	local longest = 0.2
	for _, d in holder:GetDescendants() do
		if d:IsA("ParticleEmitter") then
			local count = d:GetAttribute("EmitCount")
			local n = if typeof(count) == "number" then count else 10
			if VfxController.reduced then n = math.ceil(n / 2) end
			d:Emit(n)
			longest = math.max(longest, d.Lifetime.Max)
		elseif d:IsA("PointLight") then
			TweenService:Create(d, TweenInfo.new(0.4), { Brightness = 0 }):Play()
		elseif d:IsA("Sound") then
			d:Play()
			longest = math.max(longest, d.TimeLength)
		end
	end
	task.delay(longest + 0.1, function() holder:Destroy() end)
end

function VfxController.Start()
	ReplicatedStorage.Remotes.PlayVFX.OnClientEvent:Connect(function(name: unknown, cf: unknown)
		if typeof(name) == "string" and typeof(cf) == "CFrame" then
			VfxController.play(name, cf)
		end
	end)
end

return VfxController
```

### Hitstop, hit flash and camera shake (client)

```lua
--!strict
-- Call on the attacker's client at the "Hit" marker. Cosmetic only; the server decides damage.
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Feel = {}

function Feel.hitstop(track: AnimationTrack, seconds: number?)
	track:AdjustSpeed(0)
	task.delay(seconds or 0.05, function()
		if track.IsPlaying then track:AdjustSpeed(1) end
	end)
end

local flash = Instance.new("Highlight")
flash.FillColor = Color3.new(1, 1, 1)
flash.OutlineTransparency = 1
flash.FillTransparency = 1
flash.DepthMode = Enum.HighlightDepthMode.Occluded

function Feel.flash(target: Model)
	flash.Adornee = target
	flash.FillTransparency = 0.3
	flash.Parent = target
	TweenService:Create(flash, TweenInfo.new(0.1), { FillTransparency = 1 }):Play()
end

function Feel.shake(amplitude: number, duration: number)
	local character = Players.LocalPlayer.Character
	local found = if character then character:FindFirstChildOfClass("Humanoid") else nil
	if not found then return end
	local humanoid: Humanoid = found
	local amp = math.min(amplitude, 0.3) -- studio cap (reward tiers table)
	local stopAt = os.clock() + duration
	task.spawn(function()
		while os.clock() < stopAt and humanoid.Parent do
			humanoid.CameraOffset = Vector3.new((math.random() - 0.5) * 2 * amp, (math.random() - 0.5) * 2 * amp, 0)
			task.wait(0.02)
		end
		humanoid.CameraOffset = Vector3.zero
	end)
end

return Feel
```

### SoundGroups (edit mode) and the sound helper (client)

```lua
-- Edit mode (command bar): create the four SoundGroups once
local SoundService = game:GetService("SoundService")
for name, volume in { Music = 0.35, SFX = 0.6, UI = 0.5, Ambient = 0.4 } do
	local group = SoundService:FindFirstChild(name)
	if not group then
		group = Instance.new("SoundGroup")
		group.Name = name
		group.Volume = volume
		group.Parent = SoundService
	end
end
```

```lua
--!strict
-- ReplicatedStorage.Shared.Sfx (ModuleScript, client use): pitch variance + throttle (rule 27)
local SoundService = game:GetService("SoundService")
local Sfx = {}
local lastPlayed: { [Sound]: number } = {}

function Sfx.play(template: Sound, parent: Instance?, variance: number?)
	local now = os.clock()
	if (lastPlayed[template] or 0) > now - 0.05 then return end
	lastPlayed[template] = now
	local sound = template:Clone()
	local v = variance or 0.08
	sound.PlaybackSpeed = template.PlaybackSpeed * (1 + (math.random() * 2 - 1) * v)
	sound.Parent = parent or SoundService -- SoundService = non-positional; a Part or Attachment = positional
	sound.Ended:Once(function() sound:Destroy() end)
	sound:Play()
end

return Sfx
```

### Music crossfader (client)

```lua
--!strict
-- StarterPlayerScripts/Controllers/MusicController (ModuleScript). Tracks live in ReplicatedStorage.Assets.Sounds.Music,
-- each with SoundGroup = Music, Looped = true and a TargetVolume attribute.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local TRACKS = ReplicatedStorage.Assets.Sounds.Music
local FADE = TweenInfo.new(2, Enum.EasingStyle.Sine)

local MusicController = {}
local current: Sound? = nil
local playing: { [string]: Sound } = {}

function MusicController.playTrack(name: string)
	local template = TRACKS:FindFirstChild(name)
	if not (template and template:IsA("Sound")) then return end
	local nextSound = playing[name]
	if not nextSound then
		nextSound = template:Clone()
		nextSound.Parent = SoundService
		playing[name] = nextSound
	end
	if nextSound == current then return end
	local old = current
	current = nextSound
	if old then
		local fading: Sound = old
		TweenService:Create(fading, FADE, { Volume = 0 }):Play()
		task.delay(FADE.Time, function()
			if fading ~= current then fading:Pause() end
		end)
	end
	local target = nextSound:GetAttribute("TargetVolume")
	nextSound.Volume = 0
	if not nextSound.IsPlaying then nextSound:Resume() end
	TweenService:Create(nextSound, FADE, { Volume = if typeof(target) == "number" then target else 0.5 }):Play()
end

function MusicController.duck(seconds: number)
	local group = SoundService:FindFirstChild("Music")
	if not (group and group:IsA("SoundGroup")) then return end
	local normal = group.Volume
	TweenService:Create(group, TweenInfo.new(0.15), { Volume = normal * 0.5 }):Play()
	task.delay(seconds, function()
		TweenService:Create(group, TweenInfo.new(0.5), { Volume = normal }):Play()
	end)
end

return MusicController
```

### NPC from a HumanoidDescription (server)

```lua
--!strict
-- ServerScriptService/Services/NpcService (ModuleScript). Builds a stationary, cheap NPC.
local Players = game:GetService("Players")
local NpcService = {}

function NpcService.spawnStationary(name: string, cf: CFrame, bodyColor: Color3, parent: Instance): Model
	local desc = Instance.new("HumanoidDescription")
	desc.HeadColor = bodyColor
	desc.TorsoColor = bodyColor
	desc.LeftArmColor, desc.RightArmColor = bodyColor, bodyColor
	desc.LeftLegColor, desc.RightLegColor = bodyColor, bodyColor

	local npc = Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)
	npc.Name = name
	local humanoid = npc:FindFirstChildOfClass("Humanoid") :: Humanoid
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None -- custom BillboardGui instead
	for _, state in { Enum.HumanoidStateType.Climbing, Enum.HumanoidStateType.Swimming,
		Enum.HumanoidStateType.FallingDown, Enum.HumanoidStateType.Ragdoll } do
		humanoid:SetStateEnabled(state, false)
	end
	local root = npc:FindFirstChild("HumanoidRootPart") :: BasePart
	root.Anchored = true
	npc:PivotTo(cf)
	npc.Parent = parent -- parent last
	return npc
end

return NpcService
```

### Preload the first minute (ReplicatedFirst)

```lua
--!strict
-- Part of the ReplicatedFirst loading LocalScript. Config.Preload lists names under ReplicatedStorage.Assets.
local ContentProvider = game:GetService("ContentProvider")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local assets = ReplicatedStorage:WaitForChild("Assets")
local list: { Instance } = {}
for _, path in { "VFX/CoinBurst", "VFX/LevelUp", "Sounds/UI/Click", "Sounds/SFX/Collect" } do
	local node: Instance? = assets
	for part in string.gmatch(path, "[^/]+") do
		node = if node then node:WaitForChild(part, 5) else nil
	end
	if node then table.insert(list, node) end
end

local done = false
task.spawn(function()
	ContentProvider:PreloadAsync(list)
	done = true
end)
local started = os.clock()
while not done and os.clock() - started < 5 do task.wait(0.1) end -- never block more than 5 s
```

### Quarantine scanner (command bar)

```lua
-- Edit mode. Lists every script in Quarantine with flags. A hit means read it; unexplained means delete.
local target = game:GetService("ServerStorage").Assets.Quarantine
local FLAGS = { "require%s*%(%s*%d", "getfenv", "setfenv", "loadstring", "string%.char", "string%.reverse",
	"\\%d%d%d", "HttpService", "TeleportService", "InsertService", "MarketplaceService", "PlayerAdded" }
local count = 0
for _, d in target:GetDescendants() do
	if d:IsA("LuaSourceContainer") then
		count += 1
		if d:IsA("BaseScript") then d.Enabled = false end
		local src: string = (d :: any).Source -- readable from Studio, not from game scripts
		local hits, longest = {}, 0
		for _, pattern in FLAGS do
			if string.find(src, pattern) then table.insert(hits, pattern) end
		end
		for line in string.gmatch(src, "[^\n]+") do longest = math.max(longest, #line) end
		warn(d:GetFullName(), d.ClassName, #src .. " chars", "longest line " .. longest,
			#hits > 0 and ("FLAGS: " .. table.concat(hits, ", ")) or "no flags")
	end
end
print(count, "scripts found in Quarantine")
```

## Checklist

- [ ] The rig type is written in `plan.md` and set in the avatar settings.
- [ ] Doors, seats and hitboxes are tested with a 6-stud dummy (or scales are clamped).
- [ ] Stationary NPCs are anchored with unused states off; Humanoid NPCs near players stay at about 20 or fewer.
- [ ] Every job NPC has a silhouette prop, signature color and a name tag readable at 30 studs.
- [ ] Cosmetics are applied through the server with `ApplyDescription`.
- [ ] Pets and companions are rendered by clients.
- [ ] Every Animation is owned by the experience owner (or Roblox) and plays in a Play session of the published place.
- [ ] Tracks are loaded once per character; priorities are set per the animation specs table.
- [ ] Hit effects are synced to animation markers; the server decides damage.
- [ ] All cosmetic VFX are spawned on clients from `ReplicatedStorage.Assets.VFX` templates.
- [ ] Effects meet the budgets (bursts ≤ 60, ambient Rate ≤ 20, a Reduced effects setting exists).
- [ ] Effect colors come from `Config.Colors`; no hazard hue on rewards.
- [ ] Reward tiers escalate and anything over 1 s is skippable.
- [ ] Trails are enabled only during motion; Highlights stay well under 31.
- [ ] Every Sound has a SoundGroup; music and SFX can be muted separately and the setting saves.
- [ ] Every player action has a sound; repeated sounds vary in pitch and are throttled.
- [ ] Gameplay-critical 3D sounds use Linear rolloff with a set max distance.
- [ ] Music crossfades per zone and ducks under big stingers.
- [ ] Every audio asset is Roblox-provided, owner-uploaded or shared with the experience, and noted in the registry.
- [ ] Every inserted model was quarantined and scanned; no unexplained scripts remain.
- [ ] No `require(<number>)`, `getfenv`, `setfenv` or `loadstring` anywhere in the place.
- [ ] Imported meshes match the scale convention and the triangle and texture budgets.
- [ ] SurfaceAppearance variants are separate templates; no runtime map changes.
- [ ] AI images were reviewed and approved, post-processed, uploaded by the owner and registered.
- [ ] Every reusable asset is in the agreed folders with a clear name and registered with `cli.mjs asset add`.
- [ ] First-minute assets are preloaded with a 5 s cap.

## Common mistakes

- Calling `LoadAnimation` every time an attack plays.
- Animations owned by a personal account in a group game, so they silently don't play.
- Every animation left at Core priority, so walking overrides attacks.
- Effects timed to the button press instead of the contact frame.
- Server-created particles for every coin, flooding replication.
- Particles that pop out at full size instead of fading.
- `LightEmission = 1` on smoke, so it glows like neon.
- The same sparkle for common and legendary rewards.
- Long unskippable reveal sequences on the 50th egg.
- Trails left on permanently, smearing across the map on respawn.
- A Highlight on every enemy, hitting the 31 limit.
- Screen tints put in Lighting, so everyone flashes red when one player is hit.
- Music louder than gameplay sounds, with no way to mute it.
- The same click sound at the same pitch fifty times a second.
- Uploading music without the rights to it.
- Free models trusted because they "look fine", with scripts never opened.
- Huge, unoptimized store or AI-generated meshes with precise collision used as background decoration.
- A 1024 texture on every small prop.
- Trying to change SurfaceAppearance maps from a script at runtime.
- AI images with fake checkerboard transparency, or text baked into them.
- Assets uploaded to an agent's or crew member's account instead of the experience owner's.
- Lookalike characters or items copied from another game.

## References

Research note: this page's web research was cut short when the session's shared web search limit ran out, so it reuses sources from searches done for [[06 World and Look]]. Core API details for ParticleEmitter, Beam, Trail, Animator, Sound and the Creator Store are written from the crew's knowledge of the engine without a citation. Verify them in Studio and add citations in a later research pass.

[1] PBR textures (SurfaceAppearance guide) — https://create.roblox.com/docs/en-us/art/modeling/surface-appearance.md — the four supported maps, entered as asset ids in the Properties window.
[2] SurfaceAppearance class — https://create.roblox.com/docs/en-us/reference/engine/classes/SurfaceAppearance — AlphaMode, emissive properties; rendering varies by device and quality.
[3] SurfaceAppearance API reference (developer.roblox.com) — https://developer.roblox.com/api-reference/class/SurfaceAppearance — ColorMap is the albedo; most properties can't be changed by scripts.
[4] Surface appearances (developer article) — https://developer.roblox.com/en-us/articles/surface-appearances — the original PBR article covering the same maps.
[5] SurfaceAppearance (robloxapi.github.io) — https://robloxapi.github.io/ref-temp/class/SurfaceAppearance.html — map properties are plugin-security, with a changelog of security changes.
[6] Materials — https://create.roblox.com/docs/en-us/parts/materials.md — MaterialVariant vs SurfaceAppearance; the Material Manager.
[7] MaterialVariant — https://create.roblox.com/docs/en-us/reference/engine/classes/MaterialVariant — lives under MaterialService; global or per-part use.
[8] R15 scaling announcement thread — https://devforum.roblox.com/t/r15-scaling-avatar-game-join/30724 — avatar scaling ranges at launch.
[9] Body scaling (Roblox Wiki) — https://roblox.fandom.com/wiki/Body_scaling — height and width scaling caps.
[10] R15 (Roblox Wiki) — https://roblox.fandom.com/wiki/R15 — the R15 rig.
[11] Should I Restrict Game to R15? — https://devforum.roblox.com/t/should-i-restrict-game-to-r15/450516 — design for the largest R15; custom scaling can be turned off.
[12] Fetch Player Height — https://devforum.roblox.com/t/fetch-player-height/2205072 — community figures for avatar height in studs.
[13] R15 Character Scaling (thread, page 2) — https://devforum.roblox.com/t/r15-character-scaling/30642?page=2 — developer discussion and measurements of R15 scaling.
[14] Environmental art curriculum — https://create.roblox.com/docs/tutorials/curriculums/environmental-art — polished assets, a central asset library, world construction.
[15] Environmental Art: Assemble an Asset Library (sample place) — https://www.roblox.com/games/14447787049/Environmental-Art-Assemble-an-Asset-Library — sample modular assets, props and custom materials.
[16] Environmental Art: Construct Your World (sample place) — https://www.roblox.com/games/14447826396/Environmental-Art-Construct-Your-World — the world built from the library.
[17] Creator Hub tutorials index — https://create.roblox.com/docs/tutorials.md — lists the guide on modular assets that snap together.
[18] Post-processing effects — https://create.roblox.com/docs/environment/post-processing-effects — Camera effects show only for one player; ColorCorrection for feedback like a low-health tint.
[19] Post processing effects (developer article) — https://developer.roblox.com/articles/post-processing-effects — the older version of the same guide.
[20] Enhance indoor environments — https://create.roblox.com/docs/tutorials/use-case-tutorials/lighting/enhance-indoor-environments — local lights under Soft don't cast shadows like the sun.
[21] Enhance outdoor environments with realistic lighting — https://create.roblox.com/docs/en-us/tutorials/use-case-tutorials/lighting/enhance-outdoor-environments — a campfire's light casting crisp shadows under Realistic.
[22] Increase Range Limit of Lights — https://devforum.roblox.com/t/increase-range-limit-of-lights/68336?page=10 — the local light range cap.
[23] Bloxy News on Unified Lighting — https://x.com/Bloxy_News/status/1881791225822327102 — groundwork for increased light ranges and attenuation.
[24] Global lighting — https://create.roblox.com/docs/environment/lighting — LightingStyle Realistic vs Soft.
[25] Instance streaming — https://create.roblox.com/docs/en-us/workspace/streaming — ModelStreamingMode (Atomic and others) for models that must arrive whole.
[26] Roblox DOORS Walkthrough – All Monsters and How to Survive Them — https://progameguides.com/roblox/roblox-doors-walkthrough-all-monsters-and-how-to-survive-them/ — Guiding Light's particles, chase path lighting and key hints.
[27] Doors (game) — https://en.wikipedia.org/wiki/Doors_(game) — overview of Doors as a Roblox horror game.
[28] Shakelight (DOORS Wiki) — https://doors-game.fandom.com/wiki/Shakelight — a light-source item in Doors.
[29] The Mines (DOORS Wiki) — https://doors-game.fandom.com/wiki/The_Mines — the floor where Guiding Light also appears.
[30] Grow a Garden Gear guide: All Gears and what they do — https://www.sportskeeda.com/roblox-news/grow-garden-gear-guide-all-gears — tiered gear such as sprinklers.
[31] Grow a Garden gear guide (BlueStacks) — https://www.bluestacks.com/blog/game-guides/roblox/rl-grow-a-garden-gear-guide-en.html — gear tiers and prices.
[32] Grow a Garden Seed Shop and Gear Shop stock explained — https://deltiasgaming.com/?p=207402 — the shop NPCs and restocks.
[33] Where to find the Gear Shop in Grow a Garden — https://esports.gg/news/roblox/where-to-find-the-gear-shop-in-grow-a-garden — Gear Shop location opposite the Seed Shop.
[34] Squid Kid in 99 Nights in the Forest: how to find and save the child — https://www.sportskeeda.com/roblox-news/squid-kid-99-nights-forest-how-find-save-child — rescue characters.
[35] 99 Nights in the Forest beginner's guide — https://www.theclick.gg/99-nights-in-the-forest-beginners-guide/ — campfire upgrades expand the map.
[36] Mushroom Field (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Mushroom_Field — the first red field.
[37] Pet Simulator 99 areas (bloxodes wiki) — https://bloxodes.com/wiki/pet-simulator-99/areas — Spawn hub with shop, mailbox and leaderboards.
[38] Natural Disaster Survival Mega Token guide — https://dotesports.com/roblox/news/natural-disaster-survival-mega-token-guide-the-hunt-mega-edition — miniature map models in the lobby.
[39] Atmospheric effects — https://create.roblox.com/docs/en-us/environment/atmosphere — Atmosphere Density hides distant objects.

Related: [[00 Start Here]] · [[02 The Core Loop]] · [[03 Rarity and RNG]] · [[05 UI and HUD]] · [[06 World and Look]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[13 Building It Right]] · [[14 Roblox Studio Workflow]] · [[Claude Design Prompts]]
