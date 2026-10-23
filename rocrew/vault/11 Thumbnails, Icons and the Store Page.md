---
tags: [vault, store-page, icon, thumbnails, title, description, art, testing]
for: [splash, liveops, pulse]
also: [lead, scenic, librarian, frame, merchant, producer, reviewer, kid-tester]
---

# 11 Thumbnails, Icons and the Store Page

Before anyone plays, they see a tiny square icon among dozens of others and decide in a moment. The icon earns the click, the thumbnails and title confirm the promise, the description answers "what do I do here?", and the rest of the page (passes, subscriptions, servers, maturity label, devices) tells a parent and a player whether this game is for them. This chapter covers all of it: specs, composition, color and type, icon archetypes, the thumbnail set, titles and update tags, descriptions, the store listing, localization, staging scenes in Studio, rendering in Blender, generating art, testing variants, refreshing art with updates, and the honesty and advertising rules that keep the page safe.

A great game with a muddy icon gets no players to retain. And because Creator Rewards now pays creators for new and returning users who arrive through the game's own share links and stay 10 minutes [4][5], the store page also has to convert people who arrive from a link on social media, not only from the Home sort. Every visitor who bounces off a confusing page is lost twice.

Store art must be honest: it shows what is really in the game. Misleading art disappoints players, earns downvotes (Roblox's docs warn that players may downvote experiences whose strategies they dislike [19]) and can be moderated; a 2026 University of Sydney study counted misleading claims and omissions among the practices it found in top-earning games [16][17]. Splash owns the art; Scenic, Librarian and Frame supply the scene, models and look; Liveops owns the text and the tests; Pulse checks how the page compares with the chart. Read this chapter before making any store art, before publishing, before each update's art refresh, and before any icon or thumbnail test.

## Rules

### A. The job of the page

1. **Each element has one job, and each is judged at the size players see it.**
   The icon earns the click at about 100-150 px on a phone grid; the first thumbnail confirms the promise at about 300 px wide; the title names the game in a glance; the description's first line says what you do. Splash checks every image downscaled (icon at 64, 100 and 150 px; thumbnails at 300 px wide) before anything else. Done right: an icon whose subject and emotion are clear at 64 px. Done wrong: a detailed 1024 px painting that turns into a brown smear on the Home grid.

2. **Everything shown must exist in the game, as shown.**
   No creatures, worlds, features or effects the game doesn't have; no fake UI buttons; no Robux symbols or "FREE ROBUX" bait; no characters or brands from other games. Advertising watchdogs have criticized blurred lines between ads and content aimed at children on Roblox [13][14], and the Sydney study lists misleading claims and omissions [16][18]. Kid Tester compares every image with a screenshot of the real game. Done right: the dragon on the icon is the dragon you can hatch. Done wrong: a cinematic monster that's a 2-second cutscene, or a pet the game removed last month.

3. **Store art is brighter, closer and simpler than the game.**
   The game's moody lighting reads as mud at icon size. Store art uses daylight-bright key light, saturated color, a strong rim light, a camera closer than gameplay, and fewer objects. It still shows real things, just at their best. Done right: the real lava pet, lit from the front with a cyan rim, on a soft orange gradient. Done wrong: an in-game screenshot at dusk with the HUD showing.

### B. The icon

4. **Upload the icon as a 512x512 square, designed at 1024x1024, with the subject inside the central 80%.**
   Roblox shows icons with rounded corners and at very small sizes. Keep faces, text and key shapes inside a centered 820x820 area on the 1024 canvas, and nothing important within 100 px of a corner. Export PNG (or high-quality JPG), sRGB, no transparency in the corners (fill the background). File: `games/<slug>/art/icon_<variant>.png`. Done right: a 1024 master downscaled to 512 with a sharpening pass. Done wrong: text touching the corner, cut off by the rounding.

5. **One focal subject fills 60-75% of the icon.**
   If you can't name the subject in two words ("angry chef", "lava egg"), it's too busy. One character, or one character plus one hero object, never a group of equal-sized characters, never a map overview. Done right: one avatar's head and shoulders filling the frame, holding a glowing egg toward the camera. Done wrong: five avatars in a line, each 15% of the frame.

6. **Use a face with a big, readable emotion, looking at or leaning toward the viewer.**
   Faces pull attention, and exaggerated expressions survive downscaling. Emotions that sell: shock (open mouth, raised brows), joy (big grin, eyes squeezed), determination (narrowed eyes, gritted teeth), fear for horror (wide eyes, hands up). Head tilted 10-20 degrees toward the camera, eyes visible. Done right: an avatar with a dynamic head, jaw dropped, eyes wide, leaning in. Done wrong: a neutral default face seen from the side.

7. **Separate subject from background by value first, then by hue.**
   At small size, value contrast (light vs dark) is what the eye reads. Rule of thumb: the subject's average brightness differs from the background's by at least 40% (squint or blur test: if the subject disappears when you blur the image by 10 px, the contrast fails). Then hue: warm subject on a cool background or the reverse. Done right: a bright orange pet on a deep blue gradient. Done wrong: a grey robot on a grey city.

8. **Give the subject a clean, thick silhouette with a rim light or outline.**
   A rim of light (or a 2-4% of canvas width outline, 20-40 px on 1024) cuts the subject out of the background. In Studio, a strong SpotLight behind the subject; in post, an outer glow in a color that contrasts with the background. Silhouette test: fill the subject solid black on white; if it's still recognizable, it reads. Done right: a cyan rim around a warm-lit avatar. Done wrong: a subject that blends into a busy background at its edges.

9. **Put 0 words on the icon, or at most one short word in huge type.**
   Words on icons become unreadable at 100 px and compete with the face. If a word is essential (the game's one-word name), make it at least 18% of the icon's height, in a thick rounded font with a dark 6-10% stroke, inside the safe area. Done right: no text, just the hero and the egg. Done wrong: "Volcano Pet Tycoon Simulator 2" in thin letters.

10. **Pass the 64-pixel test.**
    Make 64, 100 and 150 px copies and look at them on both a dark background (#1E1F21) and a light one (#F2F2F2), since players use both themes. At 64 px, a stranger (or `node studio/cli.mjs gemini --prompt "At this size, what is this icon of? Name the subject and emotion in five words." --image icon_A_64.png`) should name the subject and the emotion. Done right: "shocked kid holding lava egg". Done wrong: "some kind of orange thing?"

11. **Keep the background simple: a gradient, a blur, or one or two big shapes.**
    Detail in the background competes with the subject and turns into noise at small size. Use a two-color radial gradient (lighter behind the subject's head), a heavily blurred scene from the game, or big simple shapes (a sunburst, a giant silhouette of the world's landmark). Nothing busy at the edges. Done right: a soft blue-to-purple radial gradient with faint sparkles. Done wrong: a detailed city skyline with signs and people.

12. **The game's signature element appears in the icon, the thumbnails and the game.**
    One hero item or color (the lava egg, the golden hammer, the neon-green slime) ties the store art to the game and builds recognition across updates ([[06 World and Look]], [[07 Characters, VFX and Assets]]). Pick it in the plan and keep it in every variant. Done right: the lava egg appears in the icon, thumbnail 1 and the spawn area. Done wrong: a different mascot in every image.

13. **Never use other games' or brands' characters, logos or art, and never copy an icon's layout so closely that it could be mistaken for another game.**
    Steal patterns (big face, one object, strong rim light), not art. Use our own avatars and assets. Don't use real players' avatars without permission. Done right: our own mascot in a "shocked face plus hero item" layout. Done wrong: a famous game's character, or an icon that copies a hit game's exact pose, colors and background.

### C. Thumbnails

14. **Upload thumbnails at 1920x1080 (16:9), designed at 3840x2160 when rendering, at least 3 and ideally 5-6.**
    The first thumbnail matters most: it's the one most people see when they open the page. The rest show variety. No borders, no letterboxing, no Roblox UI or HUD, no device frames. Files: `games/<slug>/art/thumb<slot>_<variant>.png`. Done right: six thumbnails, each a different reason to play. Done wrong: three near-identical screenshots of the lobby.

15. **Fill the thumbnail slots in a fixed order: core moment, big progression, rarest item, social, world, update.**
    1: the core loop's best moment (the hatch, the jump, the win). 2: a big progression beat (the huge upgrade, the rebirth, the number going up). 3: the rarest or coolest item, close up. 4: players together (co-op, trading, a party). 5: the most striking world or biome. 6: the newest update's content (replaced each big update). Done right: a set that answers "what do I do, what do I get, who with, where". Done wrong: six shots of the same pet from different angles.

16. **Show the verb mid-action, not a pose of standing around.**
    The thumbnail should look like a frame from the most exciting second of play: the egg cracking with light pouring out, the avatar mid-jump over lava, the sword hitting the boss. Motion lines, particles and a slightly tilted camera add energy. Done right: an avatar mid-leap with lava splashing below. Done wrong: an avatar standing still in front of a shop.

17. **Use 0-3 words per thumbnail, in a thick outlined font at least 8% of the image height, kept in the top or left third.**
    Words name the feature ("NEW WORLD", "HATCH LEGENDS") and must survive a 300 px preview. Font: a heavy rounded display face; white or yellow fill, a dark stroke 8-12% of the letter height, and a soft drop shadow. Keep text away from the subject's face. Done right: "ICE WORLD" in big white letters at the top-left. Done wrong: a paragraph of features in thin text.

18. **Show numbers only when they're true and readable.**
    "1 → 1,000,000" style progression images sell growth, but only if the game really goes there and the numbers match the game's formatting. Use the game's own number font and abbreviations (1M, not 1,000,000, if that's what the HUD shows). Done right: a "x1,000" damage number the game really displays. Done wrong: "999,999,999 COINS" in a game that caps at 10 million.

19. **Each thumbnail must read at 300 px wide.**
    Downscale to 300x169 and check: one clear subject, the action visible, words readable. If not, crop closer, remove objects, or enlarge text. Done right: the hatch moment still reads as a hatch at 300 px. Done wrong: a wide map shot where the avatars are 6 px tall.

### D. The title

20. **Make the title 1-4 words: a hook word plus a genre word, and keep the core name under about 30 characters.**
    The title must say what the game is at a glance ("Volcano Pets", "Fishing Legends", "Escape the Lab"). Keep the core name short; Roblox's title field allows more, but long names get cut off in tiles. Search Roblox and the web for the name before deciding, so it isn't someone else's game or brand. Done right: "Volcano Pets". Done wrong: "Pet Simulator Tycoon Obby Volcano Adventure RPG".

21. **Put an update tag in brackets at the start only during a real update, and remove it after 1-2 weeks.**
    Update tags tell returning players something is new. Title-history listings show Pet Simulator 99 under titles such as "[TAP HEROES] Pet Simulator 99!" and "[ARCADE] Pet Simulator 99!" [2][3], naming the specific update. Name the update, not "[UPDATE]"; keep it to 1-2 words; Liveops removes it when the next update ships or after two weeks, whichever comes first ([[12 Live Ops and Launch]]). Done right: "[ICE WORLD] Volcano Pets" for the week of the ice update. Done wrong: "[UPDATE 🎉] [NEW] [FREE] Volcano Pets" for three months.

22. **Use 0-2 emoji, framing the name, never replacing words.**
    Emoji add color in a text list. One title-history entry shows Pet Simulator 99 as "🍄 Pet Simulator 99! ⏰" [1]: one emoji on each side, the name intact. Choose emoji that match the update's theme; never use emoji that imply something false (a 💰 that suggests free Robux). Done right: "❄️ Volcano Pets" during the ice update. Done wrong: a title that's half emoji.

23. **No keyword stuffing, no false claims, no fake tags.**
    "[FREE ADMIN]", "[FREE PETS]", "[OP]" or a genre list in the title promise things the game doesn't do, and players punish that with downvotes [19]. The title says what the game is; the description says the rest. Done right: "Volcano Pets". Done wrong: "Volcano Pets [FREE UGC] [ADMIN] Simulator Tycoon Obby".

### E. The description

24. **The first line says what you do and why it's fun, in under 90 characters.**
    Most players read only the first lines. "Hatch lava pets, build your volcano base, and survive the eruption!" No greetings, no "Welcome to my game", no thanks to testers. Done right: a verb-first hook. Done wrong: "Hey guys! This is my first game, hope you like it!!"

25. **Structure the rest: features, controls, the latest update, codes and community perks.**
    After the hook: 3-6 short feature bullets (each a verb and a reward), controls for touch, keyboard and gamepad (one line each), the latest update in one or two lines, the current code if any, and group perks if any ([[10 Retention and Social]]). Use the template in "Specs and recipes". Done right: a description a parent can skim in 20 seconds. Done wrong: one 900-character paragraph.

26. **Post the current code with each update, in the update notes and on social channels.**
    Codes give players a reason to look the game up and give sites a reason to cover it: DOORS codes are tracked in dated lists by PCGamesN, Dexerto, Pro Game Guides and Allthings.how, which mark expired codes [30][31][32][33]. A code in the description's update line ("Code: ICEAGE for 500 Coins") is the simplest version. Done right: each update's notes include one new code. Done wrong: a list of 15 expired codes nobody removed.

27. **Write at a 10-year-old's reading level, with no off-platform links and no begging.**
    Short sentences, common words, no slang that dates badly. No "like and favorite for a reward", no links outside Roblox in the description; use the experience's social links settings instead. No promises the game doesn't keep ("updates every day!"). Done right: "Catch fish. Sell them. Buy better rods." Done wrong: "SMASH THAT LIKE BUTTON FOR FREE PETS!!! join discord in bio".

28. **Localize the title and description for the game's top languages, and keep translations short.**
    Players read store pages in their own language. Liveops checks analytics for the top player languages after launch and translates the title (only if the name is a plain word that translates well; brand-like names stay), the hook line and the feature bullets, through Creator Hub's localization settings. Done right: Spanish and Portuguese descriptions after the analytics show many players from those regions. Done wrong: an English-only page for a game whose players are mostly from Brazil.

### F. What else the page shows

29. **Answer the Maturity and Compliance Questionnaire truthfully, because the label is shown and it changes what the game can do.**
    The questionnaire is a requirement for immersive ads [9], and Roblox's August 2025 rewarded-video announcement limited self-service access to experiences with minimal or mild content maturity [12]; rewarded video ads also have their own creator and experience requirements [11] and are only shown to viewers 13+ [10]. Parents read the label. The owner answers it at publish time; Liveops drafts the answers from the game's real content in `liveops.md`. Done right: a cartoon obby labeled honestly, with no violence surprises. Done wrong: understating content to get a lower label.

30. **Set genre and supported devices accurately.**
    A game marked for phones that doesn't work on phones collects the angriest ratings. Only tick devices the game was tested on ([[08 Mobile]]); set the genre to what the game is. Done right: phone, tablet, computer ticked after Playtest's device pass. Done wrong: console ticked with no gamepad support.

31. **Name every pass for what it does, give it a readable icon, and let managed pricing set the price.**
    Passes are the one-time privileges listed on the page [20]. Names that say the benefit ("2x Money", "Fruit Notifier") sell themselves; Blox Fruits' pass names describe what they do [37]. Pass icons: 512x512 with the subject inside a central circle, because pass images are often shown cropped round (rule of thumb), with the same art style as the icon. Prices vary by player with regional pricing and price tests [25][26]; never write a price into a pass name or image. Done right: "VIP" with a gold crown icon and "Gold tag, VIP lounge, +10% Coins" as its description. Done wrong: a pass called "Ultimate" with a blurry screenshot icon and "ONLY 99!" in the image.

32. **Subscriptions on the page carry a short, distinct name and their price and duration.**
    Roblox asks for short, self-explanatory names that differ from each other, and the price and duration wherever a subscription is merchandised [21]. Adopt Me's Pets Plus is a reported example: a clear name and a stated monthly price [35]. Done right: "Plus" with "R$ X / month: daily Plus chest, +1 pet slot". Done wrong: three subscriptions named "Gold", "Gold+" and "Gold Max" with overlapping perks.

33. **Decide the private server setting deliberately; it shows on the page.**
    Private servers can be free for everyone or cost a monthly fee [22]; players are charged once and then monthly when paid [23]. Free servers suit social and co-op games ([[10 Retention and Social]]); PCGamesN reports Roblox Plus subscribers get one free private server per game regardless [24]. The owner sets it. Done right: free private servers on a roleplay game's page. Done wrong: an expensive monthly server in a game that's never full.

### G. Testing and upkeep

34. **Make 3-5 variants that differ in exactly one variable.**
    Variables worth testing: expression, background color, subject (character vs creature), camera distance, with or without one word. Changing two things at once means you can't tell which one won. Name them `icon_A`... and note the variable in `liveops.md`. Done right: icon_A (shocked) vs icon_B (grinning), same everything else. Done wrong: three completely different icons.

35. **Test with Creator Hub's built-in tools when available; otherwise swap one image for a fixed window of at least 7 days and compare impressions-to-plays.**
    Use the icon and thumbnail testing Creator Hub offers for the experience, if it's available. Without it: run the current image for 7 days, swap one image, run 7 days, and compare the impressions-to-plays rate in Creator Hub analytics for the same weekdays. One test at a time. Done right: a log entry "icon_B: +x% plays per impression vs icon_A over 7 days" with the dashboard screenshot. Done wrong: swapping the icon daily and reading the noise.

36. **Never test art during a big update, an ad campaign, a sale or a price test.**
    Those change who arrives and why, and the art test's result means nothing. Price optimization tests also change prices users see when they rejoin [26]. Liveops keeps one calendar in `liveops.md` with art tests, price tests, updates and campaigns, and never overlaps them. Done right: icon test in a quiet fortnight. Done wrong: an icon swap the day the new world launches.

37. **Refresh thumbnail slot 6 (and often slot 1) with each big update; change the icon only when a test says so, plus optional seasonal variants.**
    The update thumbnail shows what's new; the icon is the brand and changes rarely. Seasonal icon variants (a Santa hat, a pumpkin) are fine for 2-3 weeks, then revert. Done right: slot 6 shows the new ice world the day it ships, and the winter hat icon reverts on 2 January. Done wrong: an icon redesign every update, so returning players don't recognize the game.

38. **The page must convert visitors who arrive from a share link, not only from Home.**
    Creator Rewards' audience expansion pays 35% of a new or returning user's first $100 in qualifying purchases when they join through the creator's link and play 10+ minutes, for experiences averaging 100+ DAU [4]; it needs an ID-verified account and DevEx [5], and coverage presented it as a reward for attracting players [6][7]. A link visitor has no context, so the first thumbnail and the first description line must explain the game alone. Done right: thumbnail 1 shows the core moment with a two-word label. Done wrong: an in-joke icon only existing players understand.

39. **Sponsored ads and any brand content follow Roblox's advertising rules and are clearly ads.**
    All ads must follow Roblox's Advertising Standards, Community Standards and Terms of Use [8]. CARU found Roblox had not adequately disclosed to children when advertising was present and asked for clear influencer disclosures [14]; earlier, a watchdog urged the FTC to investigate [15][13]. Our ad creatives (if the owner runs campaigns) are the same honest art as the page, and any brand partnership is disclosed. Done right: a sponsored-ad image that's thumbnail 1 resized. Done wrong: an ad that looks like a Roblox system message.

40. **Record every art version, test and result in `liveops.md`.**
    Without a log, the team repeats failed ideas. Each entry: date, slot, variant file, the one variable, the window, the impressions-to-plays rate, the decision. Done right: a table that shows icon_C has been live since March because it beat A and B. Done wrong: nobody remembers why the icon is blue.

## Step by step

### Making the store page for a new game in 14 steps
1. **Read the plan.** Splash reads `plan.md` for the fantasy, the core verb, the signature element and the audience; Liveops reads it for features and controls.
2. **Pick the icon archetype** (recipes below) that best shows the fantasy, and the expression.
3. **Stage the scene in Studio** (needs the Studio lock; see "Staging a thumbnail scene") or plan a Blender render.
4. **Capture raw material:** square for the icon, 16:9 for each thumbnail slot.
5. **Make 3-5 icon variants**, each differing in one variable, with the image CLI or by editing captures (`node studio/cli.mjs image ... --aspect 1:1`).
6. **Run the size tests:** 64/100/150 px on dark and light backgrounds; the Gemini blind read at 64 px.
7. **Make the thumbnail set** in the slot order (Rule 15), adding 0-3 words per image last.
8. **Kid Tester honesty pass:** every image matches something real in the game; no Robux bait; no fake UI.
9. **Send to Review:** `node studio/cli.mjs review --file games/<slug>/art/icon_sheet.png --question "Which icon reads best at small size?"` with a contact sheet of variants at 100 px.
10. **Write the title** (Rule 20) and check the name isn't taken.
11. **Write the description** from the template and the controls from the game's real bindings.
12. **Draft the maturity answers, genre and devices** in `liveops.md` for the owner (Rules 29-30).
13. **Prepare the store listing:** pass names, descriptions and 512x512 pass icons for Merchant's `ask` ([[09 Shops and Monetization]]).
14. **Hand off** with the file paths, the Review link, and the open owner tasks (upload, questionnaire, devices, private servers).

### Refreshing the page for an update in 6 steps
1. Liveops names the update in 1-2 words for the title tag.
2. Splash makes the new slot-6 thumbnail (and slot 1 if the update changes the core moment).
3. Liveops rewrites the description's update line and adds the new code.
4. Optional seasonal icon variant, with a revert date in `liveops.md`.
5. Owner uploads; Liveops schedules the tag removal (2 weeks).
6. No art test runs during the update window (Rule 36).

### Running an icon test in 8 steps
1. Pick the one variable and make two variants.
2. Check the calendar: no update, campaign, sale or price test in the next 14 days.
3. Record the baseline: 7 days of impressions-to-plays with the current icon.
4. Ask the owner to swap (or start the built-in test).
5. Wait 7 full days (same weekdays as the baseline).
6. Compare; a difference smaller than day-to-day noise is a tie.
7. Keep the winner; log the result.
8. Next test changes a different variable.

## Specs and recipes

### Specs
| Asset | Upload size | Design size | Format | Safe area | Text |
|---|---|---|---|---|---|
| Experience icon | 512x512 | 1024x1024 | PNG or high-quality JPG | central 80%, corners empty | 0-1 word |
| Thumbnail | 1920x1080 (16:9) | 3840x2160 | PNG or high-quality JPG | keep subject off the outer 5% | 0-3 words |
| Pass icon | 512x512 | 1024x1024 | PNG | central circle | none |
| Badge icon | 512x512 | 1024x1024 | PNG | central circle | none |
| Developer product icon | 512x512 | 1024x1024 | PNG | central 80% | none |
Check current limits (number of thumbnails, video options, file size) in Creator Hub when uploading; they change over time.

### Icon archetypes
| Archetype | Layout | Best for | Expression |
|---|---|---|---|
| Hero face | Head and shoulders fill 70%, leaning in | Any genre with avatars | Shock or joy |
| Hero plus object | Avatar holds the signature item toward the camera; item 30-40% of frame | Simulators, RNG, collection | Amazed |
| Creature | One pet, monster or vehicle, big and three-quarter view | Pet, horror, racing | Cute or menacing |
| Versus | Avatar small in front of a huge threat | Horror, survival, boss games | Fear or determination |
| Transformation | Split: weak left, powerful right (both real) | Progression-heavy games | Smug on the right |
| Signature item alone | One glowing object, centered | Mystery, puzzle, tycoon | n/a |

### Composition and color recipe
- **Camera:** lower FOV (30-50) for a flattering, compressed look; subject centered (icon) or on a third (thumbnail), filling 50-75% of the frame.
- **Light:** key light bright and warm from front-left-above, fill soft and cool from the right, rim strong from behind in a color that contrasts with the background.
- **Palette:** subject in the game's signature colors; background a two-tone gradient from the opposite side of the color wheel; saturation 10-25% higher than in-game.
- **Outline:** a glow or stroke 2-4% of canvas width around the subject.
- **Type (thumbnails):** a heavy rounded display font; fill white or yellow; stroke dark, 8-12% of letter height; drop shadow 4-6% offset; tilt 0-6 degrees for energy.
- **Final checks:** squint test, silhouette test, 64/300 px test, dark and light backgrounds.

### Thumbnail slots
| Slot | Shows | Words (example) |
|---|---|---|
| 1 | The core loop's best moment | "HATCH LEGENDS" |
| 2 | Big progression beat | "GET HUGE" |
| 3 | Rarest item, close up | "MYTHIC!" |
| 4 | Players together | "PLAY WITH FRIENDS" |
| 5 | Most striking world | "6 WORLDS" (if true) |
| 6 | Newest update | "NEW: ICE WORLD" |

### Title formulas
| Formula | Example (our own invented names) | Use when |
|---|---|---|
| Hook + genre word | "Volcano Pets" | Most games |
| Verb + object | "Catch a Kraken" | Action-first games |
| Place + challenge | "Escape the Lab" | Obby, horror, puzzle |
| Fantasy + role | "Pizza Tycoon" | Tycoons, life sims |
| [Update] + name | "[ICE WORLD] Volcano Pets" | Only during a real update |
| Emoji + name | "❄️ Volcano Pets" | Seasonal or themed updates, 0-2 emoji |

### Description template
```
Hatch lava pets, build your volcano base, and survive the eruption!

🥚 Hatch 60+ pets across 6 worlds
⬆️ Upgrade your base and rebirth for huge boosts
🌋 Survive eruptions with friends
🏆 Climb the weekly leaderboard

Controls
📱 Touch: tap to collect, drag to move
💻 Keyboard: WASD to move, E to collect
🎮 Gamepad: left stick to move, A to collect

Latest update: Ice World! New pets, new eggs, new boss.
Code: ICEAGE for 500 Coins

Join our group for a gold name tag and +5% Coins.
```
Every feature line must be true on the day it's published; numbers ("60+ pets") are counted from the game's config, not guessed.

### The store listing (passes, subscriptions, servers)
The page lists what the game sells and how players can play it; Roblox's monetization overview covers every option [29].
- **Passes:** name = benefit ("2x Coins", "Auto Hatch", "VIP"); description = one sentence of what it does, permanent; icon = 512x512 in the icon's art style, subject in a central circle; no prices in names or images (they vary by region and test [25][26][27]).
- **Subscriptions:** one at launch, with a short distinct name; price and "per month" stated wherever it's sold [21].
- **Private servers:** free or a monthly price, set by the owner (Rule 33).
- **Consistency:** pass and product icons share a frame shape, background color family and lighting with the main icon, so the listing looks like one game.

### Localization
- After 2-4 weeks live, Liveops lists the top 5 player languages from analytics.
- Translate: the hook line, feature bullets, controls, the update line. Keep the title as is unless it's a plain word that translates well.
- Text inside images: avoid it on the icon; on thumbnails, keep words few so localized variants are cheap to make if Creator Hub allows per-language images.
- Have a native speaker or a second model check each translation (`node studio/cli.mjs gemini --prompt "Is this natural for a 10-year-old Brazilian player? ..."`).

## Staging a thumbnail scene in Studio
Staging changes the place, so it needs the Studio lock. Lighting and the map belong to Scenic: build the stage in a separate `Workspace.PhotoStage` folder, name every temporary object `Stage_...`, save the original Lighting values, and restore them when done.
1. **Set:** a small set piece (base, rocks, the signature item) in `PhotoStage`, close to the camera. Background scenery can be a few big simple parts that get blurred.
2. **Characters:** build rigs from a `HumanoidDescription` with `Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)`, or use Studio's rig builder. Anchor each `HumanoidRootPart`. Don't use real players' avatars.
3. **Pose:** rotate joints by editing `Motor6D.C0`, which persists in edit mode. Exaggerate: arms up, lean in, head tilted toward the camera.
4. **Expression:** on dynamic heads, set `FaceControls` properties (for example `JawDrop`, `LeftLipCornerPuller`, `RightLipCornerPuller`) for a big readable emotion. Otherwise use a clearly expressive face.
5. **Camera:** use a lower FOV (about 30-50) for a flattering, compressed look; put the subject on a third line or centered, filling 50-70% of the frame.
6. **Light:** a bright key light, a softer fill, and a strong rim light behind the subject (SpotLights on hidden `Stage_` parts). Add post effects for punch and depth.
7. **Frame guide:** add the temporary `Stage_FrameGuide` overlay (below) to compose for 1:1 and 16:9, then hide it before capture.
8. **Clean up:** hide all ScreenGuis and Studio overlays (selection, grid, outlines) before capture.
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
Save and restore Lighting so the shipped game never keeps store-art settings:
```lua
-- Command bar: save the current Lighting values onto PhotoStage, then apply bright store-art lighting.
local Lighting = game:GetService("Lighting")
local stage = workspace.PhotoStage
local KEYS = { "Brightness", "ClockTime", "ExposureCompensation", "Ambient", "OutdoorAmbient" }
for _, k in KEYS do stage:SetAttribute("Orig_" .. k, Lighting[k]) end
Lighting.ClockTime = 14
Lighting.Brightness = 3
Lighting.ExposureCompensation = 0.3
Lighting.Ambient = Color3.fromRGB(120, 120, 140)
Lighting.OutdoorAmbient = Color3.fromRGB(150, 150, 170)
```
```lua
-- Command bar: restore Lighting and remove every temporary stage object.
local Lighting = game:GetService("Lighting")
local stage = workspace.PhotoStage
for _, k in { "Brightness", "ClockTime", "ExposureCompensation", "Ambient", "OutdoorAmbient" } do
	local v = stage:GetAttribute("Orig_" .. k)
	if v ~= nil then Lighting[k] = v end
end
for _, root in { Lighting, workspace, game:GetService("StarterGui") } do
	for _, d in root:GetDescendants() do
		if d.Name:sub(1, 6) == "Stage_" then d:Destroy() end
	end
end
-- Then delete PhotoStage itself if this game doesn't keep it between shoots.
```
Three-point lighting on hidden parts:
```lua
-- Command bar: key, fill and rim SpotLights aimed at the hero's head.
local function stageLight(name: string, from: Vector3, target: Vector3, color: Color3, brightness: number, angle: number)
	local p = Instance.new("Part")
	p.Name = name
	p.Anchored = true
	p.CanCollide = false
	p.CastShadow = false
	p.Transparency = 1
	p.Size = Vector3.new(1, 1, 1)
	p.CFrame = CFrame.lookAt(from, target) -- the Front face points at the target
	local light = Instance.new("SpotLight")
	light.Face = Enum.NormalId.Front
	light.Color = color
	light.Brightness = brightness
	light.Range = 40
	light.Angle = angle
	light.Parent = p
	p.Parent = workspace.PhotoStage
end
local head = workspace.PhotoStage.Hero.Head.Position
stageLight("Stage_Key", head + Vector3.new(8, 6, 10), head, Color3.fromRGB(255, 240, 220), 6, 70)
stageLight("Stage_Fill", head + Vector3.new(-10, 2, 8), head, Color3.fromRGB(180, 200, 255), 2, 90)
stageLight("Stage_Rim", head + Vector3.new(0, 6, -10), head, Color3.fromRGB(120, 220, 255), 10, 60)
```
Frame guide for composing (edit mode shows StarterGui contents in the viewport):
```lua
-- Command bar: a temporary 1:1 and 16:9 composition guide. Hide or destroy it before capturing.
local gui = Instance.new("ScreenGui")
gui.Name = "Stage_FrameGuide"
gui.IgnoreGuiInset = true
local function box(name: string, ratio: number, scale: number, color: Color3)
	local f = Instance.new("Frame")
	f.Name = name
	f.AnchorPoint = Vector2.new(0.5, 0.5)
	f.Position = UDim2.fromScale(0.5, 0.5)
	f.Size = UDim2.fromScale(scale, scale)
	f.BackgroundTransparency = 1
	local aspect = Instance.new("UIAspectRatioConstraint")
	aspect.AspectRatio = ratio
	aspect.Parent = f
	local stroke = Instance.new("UIStroke")
	stroke.Color = color
	stroke.Thickness = 2
	stroke.Parent = f
	f.Parent = gui
end
box("Square", 1, 0.9, Color3.fromRGB(255, 80, 80))        -- icon frame
box("SquareSafe", 1, 0.72, Color3.fromRGB(255, 200, 80))  -- central 80% of the icon frame
box("Wide", 16 / 9, 1, Color3.fromRGB(80, 200, 255))      -- thumbnail frame
gui.Parent = game:GetService("StarterGui")
```
- Capture at 16:9 (and square for the icon) with the screenshot tool your Studio MCP server exposes, if it has one. If it doesn't, ask the owner to capture, giving the exact camera CFrame and FOV. Never claim a capture exists without the file.
- Capture at the largest viewport available. Never upscale a small capture to 1920x1080; if the viewport is small, render in Blender instead.
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
Generate with `node studio/cli.mjs image --prompt "…" --out games/<slug>/art/icon_A.png --aspect 1:1 --review "Use this icon?"` (use `--aspect 16:9` for thumbnails). Image models garble text, so **generate without text** and add words afterwards. The output must depict things that really exist in the game; attach or describe the real model's colors and shapes.
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
Variant prompts change one line only (the expression line, or the background color), so the variants test one variable (Rule 34). Reject any output that invents creatures, items or effects the game doesn't have.

## Testing variants
| Date | Slot | Variant | The one variable | Window | Impressions-to-plays | Decision |
|---|---|---|---|---|---|---|
| (example) | Icon | icon_A vs icon_B | shocked vs grinning | 7 + 7 days | A x% / B y% | keep winner |
- Make 3-5 variants that differ in **one** variable (expression, background color, subject, with or without text), so a winner teaches you something.
- Send the candidates to the owner with `node studio/cli.mjs review --file … --question "Which icon reads best at small size?"`, as a contact sheet at 100 px on a dark and a light background.
- After launch, use Creator Hub's built-in icon and thumbnail testing when it is available for the experience. Otherwise swap one image at a time for a fixed window and compare impressions-to-plays in Creator Hub analytics. Don't swap during a big update, an ad campaign, a sale or a price test, because the results get mixed up.
- Record each test and its result in `games/<slug>/liveops.md`.

## Examples from top games

### Name the update in the title
**Game:** Pet Simulator 99 ([2])
**Shows:** a title-history listing shows the game titled "[TAP HEROES] Pet Simulator 99!".
**Why it works:** players scanning their favorites see the specific new feature, which is more enticing than a generic "[UPDATE]".
**Steal:** a bracketed 1-2 word update name at the start of the title.
**Avoid:** leaving the tag after the update is old.

### A new tag for each update
**Game:** Pet Simulator 99 ([3])
**Shows:** another listing shows the title as "[ARCADE] Pet Simulator 99!", a different update name.
**Why it works:** the tag changes with each update, so it keeps signaling "new".
**Steal:** one tag per update, removed or replaced by the next.
**Avoid:** stacking several tags at once.

### Emoji that frame, not replace
**Game:** Pet Simulator 99 ([1])
**Shows:** a title-history entry shows "🍄 Pet Simulator 99! ⏰", one emoji on each side of the intact name.
**Why it works:** emoji add color in a text-heavy list while the name stays readable.
**Steal:** 0-2 themed emoji around the name during a themed update.
**Avoid:** titles made mostly of emoji, or emoji that suggest money.

### Codes that get the game written about
**Game:** DOORS ([30][31][32][33])
**Shows:** several outlets keep dated lists of DOORS codes for free Knobs, Revives and Stardust and mark expired ones.
**Why it works:** each code is a reason for players to search for the game and for sites to cover it, sending visitors to the page.
**Steal:** one new code per update in the description's update line and the update post.
**Avoid:** leaving expired codes in the description.

### A pass price shown against its original
**Game:** Adopt Me! ([34])
**Shows:** Sportskeeda lists the VIP pass at 600 Robux against a 750 Robux original cost, with perks such as VIP Room access and an exclusive limo.
**Why it works:** the pass is named for what it is (VIP) and its perks are concrete.
**Steal:** pass names and descriptions that list concrete perks.
**Avoid:** prices written into pass names or images, which break under regional pricing [25].

### A subscription with a clear name and price
**Game:** Adopt Me! ([35])
**Shows:** Pets Plus is reported as a $2.99 per month subscription (varying by region) that includes VIP and lets players equip two pets.
**Why it works:** the name says what it's about (pets), and the price and duration are clear, as Roblox's guidance asks [21].
**Steal:** a short, distinct subscription name with one headline perk.
**Avoid:** several similarly named tiers.

### Pass names that are the benefit
**Game:** Blox Fruits ([37])
**Shows:** passes such as 2x Money and Fruit Notifier are named for exactly what they do.
**Why it works:** a player understands the offer from the store listing without opening it.
**Steal:** "verb or multiplier + noun" pass names.
**Avoid:** vague names like "Ultimate" or "Mega Pack".

### A long, wide ladder on the store listing
**Game:** Blox Fruits ([36])
**Shows:** a 2026 third-party guide counts 14 gamepasses ranging from 200 to 3,000 Robux.
**Why it works:** a mature game's listing offers something for every budget, each pass with one job.
**Steal:** a consistent icon style so a long listing still looks like one game.
**Avoid:** launching with a dozen passes; start with 3-6 ([[09 Shops and Monetization]]).

### Prices that differ by region
**Game:** Roblox's own regional pricing example ([27][28])
**Shows:** Roblox's example product priced at 1,000 Robux in the US sold for 700 in Brazil and 500 in India; regional pricing launched for in-experience items in April 2025.
**Why it works:** prices fit local budgets, so more players can buy.
**Steal:** prices only from Creator Hub, never baked into art or names.
**Avoid:** "ONLY 99 R$!" in a pass image.

### Share links need a self-explaining page
**Game:** Any experience earning Creator Rewards audience expansion ([4][5])
**Shows:** creators earn a share of new users' first purchases when those users join through the creator's link and play 10+ minutes.
**Why it works (as a design pressure):** link visitors arrive cold, so the page must explain itself.
**Steal:** thumbnail 1 as the core moment with a two-word label; a verb-first description line.
**Avoid:** in-jokes and art that only existing players understand.

### What misleading pages and offers look like
**Game:** 15 top-earning Roblox games studied by the University of Sydney ([16][17][18])
**Shows:** the researchers documented misleading claims, misleading omissions and obscured pricing in 14 of 15 games.
**Why it works (short-term):** players click and spend before they understand.
**Steal:** the list as Kid Tester's honesty check on store art and text.
**Avoid:** every claim, image or number on the page that isn't exactly true.

### Advertising that children can recognize
**Game:** Roblox experiences with brand advertising, reviewed by CARU ([14][15])
**Shows:** CARU found Roblox hadn't adequately disclosed to children when advertising was present and asked for clear influencer disclosures; a watchdog had earlier urged the FTC to investigate.
**Why it works (as a rule):** clear disclosure protects players and the game's standing.
**Steal:** sponsored creatives that are honest copies of the page art, and disclosed partnerships.
**Avoid:** ads disguised as system messages or gameplay.

## By genre
- **Simulator:** icon = hero plus the signature pet or egg, amazed face; thumbnails show the hatch, the huge pet, the big number; update tags work well. See [[Genre - Simulator]].
- **Tycoon:** icon = owner avatar with a smug or excited face in front of a glowing build; thumbnails show the base growing (two real stages side by side). See [[Genre - Tycoon]].
- **Idle and incremental:** icon = one satisfying object with a huge number feel; thumbnails show the number climbing and the visual upgrades. See [[Genre - Idle and Incremental]].
- **Obby:** icon = avatar mid-jump over a hazard, determined or panicked; thumbnails show the hardest-looking jumps and the end reward. See [[Genre - Obby]].
- **Roleplay and life sim:** icon = a friendly avatar with a home or vehicle, happy; thumbnails show friends together, homes, outfits; social slot 4 matters most. See [[Genre - Roleplay and Life Sim]].
- **Action and combat:** icon = hero mid-attack with a strong effect, determined; thumbnails show the boss and the best ability. See [[Genre - Action and Combat]].
- **Battlegrounds:** icon = two fighters clashing, or one character's signature move; thumbnails show moves, combos, characters. See [[Genre - Battlegrounds]].
- **Survival:** icon = versus layout (small avatar, big threat or harsh world); thumbnails show the base, the night, the group surviving. See [[Genre - Survival]].
- **Horror:** icon = the monster's face or a terrified avatar, darker but still high-contrast (a bright face in darkness); never gore; maturity answers exact. See [[Genre - Horror]].
- **Tower defense:** icon = one iconic unit or the boss; thumbnails show a packed map mid-wave and the rarest units. See [[Genre - Tower Defense]].
- **RNG and collection:** icon = the rarest item glowing in a hand, shocked face; thumbnails show the roll reveal and the index; never imply odds better than real. See [[Genre - RNG and Collection]].
- **Shooter:** icon = character aiming toward the camera or a signature weapon; thumbnails show maps and squads; keep violence within the label. See [[Genre - Shooter]].
- **Racing and vehicles:** icon = the hero car three-quarter front, motion blur; thumbnails show speed, tracks, customization. See [[Genre - Racing and Vehicles]].
- **Sports:** icon = the moment of the shot, ball big; thumbnails show matches and celebrations. See [[Genre - Sports]].
- **Party and social hangout:** icon = several friends laughing (the one genre where a group can work, kept to 2-3 big faces); thumbnails show minigames and emotes. See [[Genre - Party and Social Hangout]].
- **Story and puzzle:** icon = the mystery (a door, a glowing object, a worried face); thumbnails show places and the hook of the story without spoilers. See [[Genre - Story and Puzzle]].
- **Farming and fishing:** icon = the biggest catch or crop held up, joyful; thumbnails show the rare catch, the farm, friends. See [[Genre - Farming and Fishing]].

## Checklist
- [ ] Icon is 512x512 (from a 1024 master) with one focal subject inside the central 80%, nothing in the corners, and 0-1 words.
- [ ] Icon passes the 64/100/150 px test on dark and light backgrounds and the Gemini blind read.
- [ ] Squint and silhouette tests pass for the icon and thumbnail 1.
- [ ] Thumbnails are 1920x1080 (16:9), at least 3, in the slot order; slot 1 shows the core moment.
- [ ] Every thumbnail reads at 300 px wide; words are 0-3 per image and at least 8% of image height.
- [ ] Everything shown exists in the game; there's no fake UI, Robux bait or outside brand (Kid Tester signed off).
- [ ] The signature element appears in the icon, the thumbnails and the game.
- [ ] Title is 1-4 clear words, checked for name conflicts; any update tag names a real current update and has a removal date.
- [ ] Title has 0-2 emoji and no keyword stuffing.
- [ ] Description's first line says what you do in under 90 characters; features, controls (touch, keyboard, gamepad), update line and code follow the template.
- [ ] No off-platform links or rating-bait in the description.
- [ ] Maturity answers, genre and devices drafted from the real game for the owner.
- [ ] Pass names say the benefit; pass icons are 512x512 and readable as circles; no prices in names or images.
- [ ] Subscription (if any) has a short distinct name with price and duration.
- [ ] Private server setting decided by the owner and logged.
- [ ] Stage objects (`Stage_*`, `PhotoStage`) were removed and Lighting restored after capture.
- [ ] At least 3 icon variants differing in one variable were sent to Review, with files in `games/<slug>/art/`.
- [ ] `liveops.md` has the art log and a test calendar with no overlap with updates, sales, campaigns or price tests.

## Common mistakes
- A wide scene of the whole map as the icon, which is unreadable at small size.
- Several characters of equal size competing for attention.
- A sentence of text, thin fonts, or text placed where rounded corners crop it.
- Dark, desaturated lighting copied straight from the game's mood, when store art should be brighter than the game.
- Generated art showing creatures or features the game doesn't have.
- Leaving `Stage_` post effects in Lighting, so the shipped game looks over-saturated and blurry.
- Testing several variables at once, then guessing why a variant won.
- Swapping the icon during an update or a campaign, and reading the noise as a result.
- An "[UPDATE]" tag that stays for months.
- Keyword-stuffed titles and "[FREE ...]" claims.
- A description that starts with "Welcome to my game!".
- Controls missing for touch players.
- Expired codes left in the description.
- Prices written into pass images or names.
- Upscaling a small Studio capture to 1920x1080.
- Using another game's character, or a real player's avatar, in store art.
- An icon redesign every update, so returning players don't recognize the game.
- Understating content in the maturity questionnaire.

## References
[1] 🍄 Pet Simulator 99! ⏰ (RoWatcher) — https://rowatcher.com/games/3317771874 — title-history entry with one emoji on each side of the name.
[2] [TAP HEROES] Pet Simulator 99! (RoWatcher) — https://rowatcher.com/games/3317771874/tap-heroes-pet-simulator-99 — update-named bracket tag in the title.
[3] [ARCADE] Pet Simulator 99! (RoWatcher) — https://rowatcher.com/games/3317771874/arcade-pet-simulator-99 — a different update tag over time.
[4] Creator Rewards — https://create.roblox.com/docs/creator-rewards — audience expansion: 35% of first $100 for users joining via the creator's link and playing 10+ minutes; 100+ DAU.
[5] Creator Rewards (Roblox Wiki) — https://roblox.fandom.com/wiki/Creator_Rewards — audience expansion requires an ID-verified account and DevEx; began July 24, 2025.
[6] Roblox's new Creator Rewards encourage engagement and retention (Tubefilter) — https://www.tubefilter.com/?p=186987 — coverage of the program's goals.
[7] Roblox To Reward Creators For Attracting Players (MediaPost) — https://www.mediapost.com/publications/article/406941/roblox-to-reward-creators-for-attracting-players.html — rewards for attracting players; payouts may change.
[8] Advertise on Roblox (Creator Docs) — https://create.roblox.com/docs/pt-br/production/promotion/advertise-on-roblox — ads must follow Advertising Standards, Community Standards and Terms of Use.
[9] Immersive ads — https://create.roblox.com/docs/en-us/production/monetization/immersive-ads — requires the Maturity and Compliance Questionnaire, ID verification and 2FA.
[10] Ad integrations — https://create.roblox.com/docs/production/promotion/ad-integrations — ad formats and viewer rules (13+ for rewarded video).
[11] Rewarded video ads — https://create.roblox.com/docs/production/promotion/rewarded-video-ads — eligibility requirements tied to the experience and creator.
[12] More Creators Can Now Use Rewarded Video Ads (DevForum) — https://devforum.roblox.com/t/more-creators-can-now-use-rewarded-video-ads/3838678 — self-service limited to minimal or mild content maturity (August 2025).
[13] Roblox (Truth in Advertising) — https://truthinadvertising.org/brands/roblox/ — complaint that ads and content were hard to tell apart for children.
[14] Watchdog: Roblox violates advertising guidelines for marketing to children (Marketing-Interactive) — https://www.marketing-interactive.com/watchdog-roblox-violates-advertising-guidelines-for-marketing-to-children — CARU findings on ad and influencer disclosure.
[15] Advertising watchdog urges FTC to investigate Roblox (Loeb & Loeb, May 2022) — https://www.loeb.com/en/insights/publications/2022/05/advertising-watchdog-urges-ftc-to-investigate-roblox — background on the complaint.
[16] Inside the pay-to-play world of Roblox targeting children (University of Sydney, May 2026) — https://www.sydney.edu.au/news-opinion/news/2026/05/17/inside-the-pay-to-play-world-of-roblox-targeting-children-.html — misleading practices in 14 of 15 top-earning games.
[17] Misleading and Deceptive Monetisation in Roblox (report) — https://ses.library.usyd.edu.au/handle/2123/35033 — the March 2026 report.
[18] Roblox sucking up money from young players: study (ACS Information Age) — https://ia.acs.org.au/article/2026/roblox-sucking-up-money-from-young-players--study.html — misleading claims, misleading omissions, obscured pricing.
[19] Monetization (Creator Docs) — https://create.roblox.com/docs/en-us/production/monetization — players may downvote experiences whose strategies they dislike.
[20] Passes — https://create.roblox.com/docs/production/monetization/passes — passes as one-time privileges sold for Robux.
[21] Subscriptions — https://create.roblox.com/docs/production/monetization/subscriptions — short, distinct names; price and duration wherever merchandised.
[22] Private servers — https://create.roblox.com/docs/production/monetization/private-servers — free or a monthly Robux fee.
[23] Private/VIP Servers FAQ (Roblox Help) — https://en.help.roblox.com/hc/articles/205345050 — creator-set prices; initial then monthly charge.
[24] Roblox Plus private server limit (PCGamesN) — https://www.pcgamesn.com/roblox/plus-private-server-limit — one free private server per game for Plus subscribers.
[25] Regional pricing — https://create.roblox.com/docs/en-us/production/monetization/regional-pricing — prices adjust to the buyer's economic location; hardcoded prices go stale.
[26] Price optimization — https://create.roblox.com/docs/production/monetization/price-optimization.md — test prices shown to users when they rejoin; about 3-week tests.
[27] Introducing Regional Pricing for Developer Products (DevForum) — https://devforum.roblox.com/t/introducing-regional-pricing-for-developer-products/3971235 — 1,000 US / 700 Brazil / 500 India example.
[28] Roblox launches regional pricing for in-experience items (Newsroom, April 2025) — https://about.roblox.com/es/newsroom/2025/04/roblox-launches-regional-pricing-for-in-experience-items — launch announcement.
[29] Monetize your experiences — https://create.roblox.com/docs/monetize-experiences — overview of what the store listing can sell.
[30] Doors codes (PCGamesN) — https://www.pcgamesn.com/roblox/doors-codes — a maintained code list.
[31] Roblox Doors codes: free revives, knobs and more (Dexerto) — https://www.dexerto.com/roblox/roblox-doors-codes-free-revives-knobs-and-more-2110561 — a dated code list.
[32] Roblox Doors codes (Pro Game Guides) — https://progameguides.com/roblox/roblox-doors-codes/ — a dated code list.
[33] Roblox Doors codes: latest working list (Allthings.how) — https://allthings.how/roblox-doors-codes-latest-working-list/ — dated list marking expired codes.
[34] Exploring gamepasses in Adopt Me (Sportskeeda) — https://sportskeeda.com/roblox-news/exploring-gamepasses-roblox-adopt-me — VIP at 600 vs 750 Robux; VIP Room and limo.
[35] Adopt Me Pets Plus subscription (Sportskeeda) — https://www.sportskeeda.com/roblox-news/adopt-me-pets-plus-subscription-benefits-content-price — $2.99/month varying by region; VIP; two pets.
[36] Blox Fruits game pass tier list 2026 (rblxguide) — https://rblxguide.com/games/blox-fruits/updates/blox-fruits-game-pass-tier-list-2026 — 14 passes from 200 to 3,000 Robux (third-party).
[37] Everything you should know about gamepasses in Blox Fruits (Sportskeeda) — https://www.sportskeeda.com/roblox-news/everything-know-gamepasses-roblox-blox-fruits — 2x Money and Fruit Notifier passes.

Related: [[00 Start Here]] · [[01 The First Five Minutes]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[14 Roblox Studio Workflow]] · [[15 Discovery and Growth]] · [[Claude Design Prompts]]
