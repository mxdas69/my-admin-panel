---
tags: [vault, art, prompts]
for: [frame, splash]
also: [scenic, librarian, architect]
---

# Claude Design Prompts

Reusable prompt templates for generating art, effects and UI concepts with Gemini (`node studio/cli.mjs image`), Claude, or Blender. Each prompt has two parts: **the idea**, which you write fresh each time, and **the ending**, which you paste unchanged so results look like they belong in the game.

## Rules for the idea part
- Describe it like a high-end game would show it. Don't say "Roblox-style" unless you want toy-like results.
- Give the size and scale: a hero is about 5 studs (1.5 m) tall; say how big the thing is next to them.
- Describe motion as beats: wind-up, the hit, what's left after.
- Give each element its own look. A frost set is not a recolored fire set.
- Name the camera and the light: "three-quarter view from slightly above, warm key light from the left."
- Pass real screenshots with `--ref` so colors and shapes match the game.

## Endings (paste every time)

### Icon (1:1)
```
Game icon, 1:1. One bold subject filling most of the frame, readable at 64x64 pixels.
Thick clean shapes, strong rim light, saturated colors on a simple contrasting background.
No text, no logos, no borders, no small details. Friendly, exciting, made for kids and teens.
```

### Thumbnail (16:9)
```
Game thumbnail, 16:9, 1920x1080. One clear focal point, a character with a big readable
expression mid-action. Bright saturated lighting, depth from a soft background, strong
silhouette. Leave the top-left and bottom-right corners calm. No text unless asked; if
asked, at most three huge words. Must still read at 300 pixels wide.
```

### UI kit
```
Game UI element sheet on a transparent background: buttons, panels, icons and frames in one
consistent style. Thick outlines, soft inner gradients, rounded corners, chunky shapes that
read on a phone. Each element separate with space around it. No text baked into buttons.
```

### Effects concept
```
Effect concept for a real-time game: soft, see-through glowing particles that fade over time,
never solid blobs or balls. Must look great in bright daylight, not only on a dark background.
Show the wind-up, the hit and what's left after as three panels left to right.
Build it from parts a game engine can do: textured particles (normal or additive), ribbon
trails, beams between two points, see-through glowing shells, point lights and one global bloom.
```

## Turning a concept into the game
- **Frame / Splash:** save to `games/<slug>/art/`, send to Review, then upload with `node studio/cli.mjs upload` and use the `rbxassetid://` id.
- **Librarian / Scenic:** rebuild effects in Studio from the concept with ParticleEmitters, Beams, Trails and Attachments ([[07 Characters, VFX and Assets]]). Keep each emitter's Rate and Lifetime modest.
- **Blender (if connected):** model the shape, keep each mesh under the triangle limit, export FBX and register it in the Library.

Related: [[11 Thumbnails, Icons and the Store Page]] · [[05 UI and HUD]] · [[06 World and Look]]
