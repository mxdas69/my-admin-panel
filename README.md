# my-admin-panel

## Nitro Pitch

`nitro-pitch/index.html` is a browser car-soccer game built on three.js. It's one self-contained file with the 3D engine built in, so it runs with no internet connection. Open it straight from disk, or serve the folder.

When the file is opened from disk and GitHub is reachable, it runs the newest build from this repo (checking `main`, then the working branch). If GitHub is blocked or offline, it runs the copy inside the file.

- Main menu with Play (1v1, 2v2 or 3v3 against Rookie, Pro or All-Star bots), Free Play, Garage and Settings
- Bot teammates rotate between attacking, support and defence, and chip in with the odd quick chat
- Five cars with different hitboxes: Vanta (balanced), Stiletto (long and low), Bulwark (tall), Javelin (long and flat), Rook (hybrid)
- Garage: decals, paint finish and accent colour, rim style and colour, boost colour, toppers and six goal explosions (Shockwave, Supernova, Vortex, Thunder, Confetti, Pixel Burst). Team colour always stays the main paint, and bots get random looks
- Free Play: just you and the ball with endless boost. R puts the ball back in the centre and F drops it onto your roof for dribble and flick practice
- Quick chat on 1 to 4
- Five arenas: Night, Sunset, Snow, Neon and Day
- Handling built on soccar physics: speed-based turning, boost, jumps, double jumps, directional flips, flip cancels, wavedashes, flip resets, air roll, wall and ceiling driving, bumps and demolitions
- Car-ball touches use the genre's rules: a dead, grippy contact plus an extra kick that repeats while contact lasts. Dribbles stay on the roof, and front, 45° and musty flicks out of a dribble send the ball at roughly 60 to 75 km/h
- Getting stuck on the roof or a side: tap jump to pop up and roll back onto the wheels, or hold throttle to roll over. A car left still off its wheels rights itself after half a second
- Controls follow the usual PC layout for the genre: left mouse boost, right mouse jump, Space ball cam, Left Shift powerslide and air roll, Q and E directional air roll. A "Space jump" layout is in the menu for keyboard-only play, and gamepads and touch work too
- The pointer is locked and hidden during a match; Esc pauses and frees it
- Camera: 110° FOV, distance 270, height 100, 3° down, stiffness 0.45 by default, smoothed with critically damped springs. All five can be changed in Settings
- Glow setting (Off, Low, High) in Settings and the pause screen, plus a volume slider
- Graphics setting (Auto, High, Medium, Low, Lowest). Auto drops anti-aliasing, bloom, shadows and then resolution while frames stay slow, and remembers where it settled. The game clock follows real time down to 10 frames a second, so a slow computer looks choppier but never plays in slow motion
