---
tags: [vault, store-page]
read_by: [lead, splash, scenic, librarian, pulse, frame, liveops, producer]
---

# 11 Thumbnails, Icons and the Store Page

Before anyone plays, they see a tiny icon among dozens of others, and they decide in a moment. The icon earns the click, the thumbnails and title confirm the promise, and the description answers "what do I do here?". A great game with a muddy icon gets no players to retain. Store art must also be honest: it shows what is really in the game, because misleading art disappoints players and can be moderated. Splash owns the art; Scenic, Librarian and Frame supply the scene, models and look.

## Specs
- **Icon:** square, upload at 512x512 (design at 1024x1024 and downscale for crisp edges). Roblox can show it with rounded corners and at very small sizes, so keep the subject inside the central ~80% and nothing important in the corners.
- **Thumbnails:** 16:9, 1920x1080 (design at 3840x2160 and downscale if rendering). Roblox accepts several thumbnails. The first matters most; the rest show variety (core loop, a world, a rare item, social play).
- Use PNG or high-quality JPG, with no borders, letterboxing or Roblox UI chrome.
- Store art lives in `games/<slug>/art/`, named by role and variant: `icon_A.png`, `thumb1_B.png`.

## What makes an icon or thumbnail read
- **One focal subject.** One character or one hero object, big, taking up most of the frame. If you can't say what the subject is in two words, the image is too busy.
- **A character with a readable expression.** Exaggerated emotion (shock, joy, determination) with big eyes and an open mouth, facing or leaning toward the viewer. Faces pull attention.
- **Bright, saturated contrast.** Separate the subject from the background by value and hue (warm subject on a cool background or the reverse), and add a strong rim light or outline. Avoid mid-grey and brown mush.
- **Show the fantasy and the verb:** the rare pet hatching, the giant upgrade, the obstacle mid-jump. Use the game's own signature item or color so the icon matches the game ([[06 World and Look]], [[07 Characters, VFX and Assets]]).
- **Very few words, huge type.** Use 0 words on the icon (or one short word), and 0-3 words on thumbnails in a thick, outlined font. Text larger than you think, because it must survive downscaling.
- **Readable at tiny size.** View the icon at 64 px and 100 px wide, and the thumbnail at about 300 px wide. If the subject or emotion disappears, simplify.
- **A simple background:** a soft gradient, blurred scenery, or a few large shapes. No clutter at the edges.
- **Consistency:** the same mascot or hero item and the same palette across icon and thumbnails builds recognition across updates.
- **Honest:** no fake UI buttons, no "FREE ROBUX" or Robux icons as bait, no characters or items that aren't in the game, no other games' or brands' characters.

## Title and description
**Title:**
- Short and memorable, saying what the game is: a hook word plus a genre word ("Volcano Pet Tycoon"). Prefer 1-4 words.
- No keyword stuffing, no emoji walls, no fake update tags. An update tag like "[NEW WORLD]" is fine only when true, and removed once it's old.
- Make sure the name isn't someone else's brand or game.

**Description** (most players read only the first lines):
1. One line hook: what you do and why it's fun ("Hatch lava pets, build your base, and survive the eruption!").
2. 3-6 short feature bullets.
3. Controls for touch, keyboard and gamepad (one line each).
4. Latest update in one or two lines ([[12 Live Ops and Launch]]).
5. Group perks, if any ([[10 Retention and Social]]).
- Write at a 10-year-old's reading level. No off-platform links, no begging for likes, no promises the game doesn't keep.
- Set genre, playable devices and the maturity questionnaire accurately on Creator Hub. That is the owner's job at publish time; Splash and Liveops draft the text in `games/<slug>/liveops.md`.

## Staging a thumbnail scene in Studio
Staging changes the place, so it needs the Studio lock. Lighting and the map belong to Scenic: build the stage in a separate `Workspace.PhotoStage` folder, name every temporary object `Stage_...`, note the original Lighting values, and restore them when done.
1. **Set:** a small set piece (base, rocks, the signature item) in `PhotoStage`, close to the camera. Background scenery can be a few big simple parts that get blurred.
2. **Characters:** build rigs from a `HumanoidDescription` with `Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)`, or use Studio's rig builder. Anchor each `HumanoidRootPart`. Don't use real players' avatars.
3. **Pose:** rotate joints by editing `Motor6D.C0`, which persists in edit mode. Exaggerate: arms up, lean in, head tilted toward the camera.
4. **Expression:** on dynamic heads, set `FaceControls` properties (for example `JawDrop`, `LeftLipCornerPuller`, `RightLipCornerPuller`) for a big readable emotion. Otherwise use a clearly expressive face.
5. **Camera:** use a lower FOV (about 30-50) for a flattering, compressed look; put the subject on a third line or centered, filling 50-70% of the frame.
6. **Light:** a bright key light, a softer fill, and a strong rim light behind the subject (SpotLights on hidden `Stage_` parts). Add post effects for punch and depth.
7. **Clean up:** hide all ScreenGuis and Studio overlays (selection, grid, outlines) before capture.
```lua
-- Command bar (edit mode). Pose, camera, and temporary post effects.
local rig = workspace.PhotoStage.Hero
local shoulder = rig.RightUpperArm.RightShoulder :: Motor6D
shoulder.C0 *= CFrame.Angles(0, 0, math.rad(110)) -- raise right arm
local neck = rig.Head.Neck :: Motor6D
neck.C0 *= CFrame.Angles(math.rad(-10), math.rad(15), 0) -- tilt toward camera

local cam = workspace.CurrentCamera
cam.FieldOfView = 40
cam.CFrame = CFrame.lookAt(Vector3.new(0, 5, 16), rig.Head.Position)

local Lighting = game:GetService("Lighting")
local cc = Instance.new("ColorCorrectionEffect")
cc.Name = "Stage_ColorCorrection"
cc.Saturation = 0.25
cc.Contrast = 0.15
cc.Parent = Lighting
local dof = Instance.new("DepthOfFieldEffect")
dof.Name = "Stage_DepthOfField"
dof.FocusDistance = 16
dof.InFocusRadius = 6
dof.FarIntensity = 0.5
dof.NearIntensity = 0
dof.Parent = Lighting
-- When done: destroy every "Stage_" object and restore the Lighting values you noted.
```
- Capture at 16:9 (and square for the icon) with the screenshot tool your Studio MCP server exposes, if it has one. If it doesn't, ask the owner to capture, giving the exact camera CFrame and FOV. Never claim a capture exists without the file.
- Captures are raw material. Crop, brighten, add rim glow and text afterwards, then check at tiny size.

## Blender render workflow (outline)
1. Pose the scene in Studio first (posed `Motor6D.C0`, props placed), because the export is static.
2. Select the models and use **Export Selection** in Studio to get an OBJ with its MTL and textures.
3. Import into Blender. Reconnect textures to a Principled BSDF per material, and set roughness so plastic looks clean, not glossy.
4. Light with three area lights (key, fill, strong rim) and a colored world background that complements the subject.
5. Use a camera with a 50-85 mm focal length, 3840x2160 for thumbnails and 1024x1024 for the icon.
6. Render with Eevee for speed or Cycles for quality, with denoising on. Use a transparent film background if compositing over a painted backdrop.
7. Post: color grade with high saturation and contrast, add an outline or glow around the subject, then add text last. Downscale to final size and check at tiny size.

## Image-generation prompt template
Generate with `node studio/cli.mjs image --prompt "…" --out games/<slug>/art/icon_A.png --aspect 1:1 --review "Use this icon?"` (use `--aspect 16:9` for thumbnails). Image models garble text, so **generate without text** and add words afterwards. The output must depict things that really exist in the game.
```
Roblox game {ICON | THUMBNAIL}, {square 1:1 | widescreen 16:9}.
Subject: one {blocky Roblox-style avatar | hero object}: {outfit / colors / key features},
{pose: leaning toward camera, arms up | holding X toward camera}, large in frame, centered.
Expression: {shocked | overjoyed | determined}, big readable eyes, mouth open.
Signature element: {the game's hero item, e.g. glowing lava egg}, big and close to the camera.
Background: {setting from the game}, simplified, softly blurred, {color} gradient, no clutter.
Style: bright saturated colors, high contrast, soft 3D render, strong rim light, clean thick silhouette.
Composition: {leave empty space top-left for a title | no empty space needed}.
No text, no letters, no logos, no UI, no watermark, no borders.
```

## Testing variants
- Make 3-5 variants that differ in **one** variable (expression, background color, subject, with or without text), so a winner teaches you something.
- Send the candidates to the owner with `node studio/cli.mjs review --file … --question "Which icon reads best at small size?"`.
- After launch, use Creator Hub's built-in icon and thumbnail testing when it is available for the experience. Otherwise swap one image at a time for a fixed window and compare impressions-to-plays in Creator Hub analytics. Don't swap during a big update or an ad campaign, because the results get mixed up.
- Record each test and its result in `games/<slug>/liveops.md`.

## Checklist
- [ ] Icon is 512x512 with one focal subject, no important content in the corners, and 0-1 words.
- [ ] Thumbnails are 1920x1080 (16:9); the first one shows the core loop moment.
- [ ] Every image was checked downscaled (icon at 64 px, thumbnail at about 300 px wide) and the subject and emotion still read.
- [ ] The subject separates clearly from the background by color and value (squint test).
- [ ] Everything shown exists in the game; there are no fake UI, Robux bait or outside brands.
- [ ] Title is 1-4 clear words; the description's first line says what you do.
- [ ] Description includes controls for touch, keyboard and gamepad.
- [ ] Stage objects (`Stage_*`, `PhotoStage`) were removed and Lighting restored after capture.
- [ ] At least 3 icon variants were sent to the owner for Review, with files in `games/<slug>/art/`.

## Common mistakes
- A wide scene of the whole map as the icon, which is unreadable at small size.
- Several characters of equal size competing for attention.
- A sentence of text, thin fonts, or text placed where rounded corners crop it.
- Dark, desaturated lighting copied straight from the game's mood, when store art should be brighter than the game.
- Generated art showing creatures or features the game doesn't have.
- Leaving `Stage_` post effects in Lighting, so the shipped game looks over-saturated and blurry.
- Testing several variables at once, then guessing why a variant won.

## Related
[[00 Start Here]] · [[01 The First Five Minutes]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]]
