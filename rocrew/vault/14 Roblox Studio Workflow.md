---
tags: [vault, studio, workflow, collaboration, team-create, rojo, mcp, playtesting, debugging, profiling, publishing, open-cloud]
for: [lead, builder, scenic, frame, librarian, merchant, playtest, reviewer, producer]
also: [architect, kid-tester, balance, splash, liveops, pulse]
---

# 14 Roblox Studio Workflow

This chapter is how the crew works inside Roblox Studio: the panels and tools that matter, Team Create and collaboration, packages, version history and backups, choosing between Rojo and in-Studio editing, Studio's MCP server and AI Assistant, playtesting (Play, Play Here, Run, multi-client tests, the Device Emulator), the Output window and the debugger, the MicroProfiler and Script Profiler, publishing and how places and experiences fit together, the Creator Hub settings that only the owner can change, Open Cloud, and the day-to-day protocol for a game shared by two people and a crew of 15 agents.

Workflow decides whether a game succeeds because most failures in a multi-person team aren't design failures. They're overwritten work, a script edited in two places at once, a fix that was never tested with two clients, a DataStore wiped by a test, an unpublished change everyone thought was live, or a frame-rate drop nobody profiled. Roblox Studio is a shared, live, cloud-saved editor. That makes it fast and also makes it easy to break someone else's work in one click. These rules make every change small, owned, undoable, tested and evidenced.

Every agent reads the Rules and the Playtesting, Debugging and Team workflow sections before its first Studio task, and re-reads the Publishing section before ship prep. Builder and Reviewer also read the Rojo and Open Cloud sections. Producer uses the Checklist at every gate.

Studio changes often: buttons move between ribbon tabs, panels get renamed and beta features become defaults. When this page names a menu path that doesn't match your Studio, find the tool by name (Studio's search or the View or Window menu) and note the difference in your handoff so the Lead can update the vault. Web research for this page was cut short (see the note in References), so most Studio specifics here are uncited and come from the crew's working knowledge.

## Rules

### Studio and its panels

1. **Inspect before you change: read the Explorer tree, the Properties of what you'll touch, and every script you'll edit, and write down what's there before you start.**
   Why: most damage in shared places comes from editing something you didn't understand, like a duplicate Config, a disabled script someone left for a reason, or a model another agent is mid-way through building.
   How: open Explorer and Properties (View or Window menu). Run the read-only tree inspector (Luau section) on the folders you'll change and paste the summary into your notes. Open each script you'll edit and read it in full.
   Done right: "Before: ServerScriptService.Services has 9 modules; ShopService 212 lines; Config.Shop has 14 items" in the handoff.
   Done wrong: Creating a second `Config` module because the first one was in a folder you didn't open.

2. **Keep the top-level tree clean: services hold only what [[13 Building It Right]] lists, `Workspace` holds only `Map`, `Terrain`, the Camera and runtime folders, and nothing ships in `Workspace` that came from a test.**
   Why: a predictable tree is how 15 agents find things without asking. Test leftovers (a dummy, a debug part, a duplicated model) are the most common clutter, and some carry scripts.
   How: runtime folders (`Drops`, `NPCs`, `Effects`) are created by code at startup. Test dummies live in `ServerStorage.Assets.Dev`. The pre-publish audit (Luau section) lists anything unexpected at the top level.
   Done right: Workspace children are `Camera`, `Terrain`, `Map`, `Drops` and `NPCs`.
   Done wrong: `Workspace.Model`, `Workspace.Part (2)` and `Workspace.TestScript` in a shipped game.

3. **The Properties panel isn't the whole truth: some properties only show under certain settings, and deprecated ones still show. Check the API reference, and read or set unusual properties from the command bar.**
   Why: Studio hides or shows properties based on other settings. For example, `ShadowSoftness` doesn't appear in the Properties panel when `LightingStyle` is Soft, though it's still settable by script [3]. The API reference marks deprecated members such as `Lighting.Technology` [7], [8], and unofficial references track what was superseded and when [9], [10]. Community feature requests for clearer docs are common [11].
   How: before using an unfamiliar property, look it up in the Creator Documentation (Studio's Help, or the docs site) for a deprecation tag. To confirm a value, print it from the command bar (`print(game.Lighting.ShadowSoftness)`).
   Done right: Setting `LightingStyle` after noticing `Technology` is marked deprecated.
   Done wrong: An afternoon "fixing" a property that the engine ignores.

4. **The command bar runs edit-mode Luau with Studio-level permissions: use it for audits and bulk edits, and never run code in it that you haven't read.**
   Why: the command bar can do things game scripts can't, like set plugin-security properties such as SurfaceAppearance maps [23] and read `Script.Source`. That's what makes audits possible, and it's also why pasted code from the internet can wreck a place.
   How: keep audit and bulk-edit snippets in the vault or the game folder, read them before running, and run them on a narrow target first (one folder), then the whole tree.
   Done right: Running the world audit from [[06 World and Look]] on `Workspace.Map.Zone1` before the whole map.
   Done wrong: Pasting a "free admin commands" snippet from a video into the command bar.

5. **Every scripted edit is undoable as one named step: wrap bulk changes from the command bar or MCP code in a ChangeHistoryService recording.**
   Why: a bulk change that can't be undone in one Ctrl+Z turns a mistake into an hour of manual repair. Named undo steps also show up in the Undo history so others can see what happened.
   How: use the safe-edit wrapper (Luau section): `TryBeginRecording(name)`, make the change, `FinishRecording(id, Commit)`, with a fallback to `SetWaypoint` if recording isn't available. Keep each recording to one logical change ("Recolor Zone2 floors").
   Done right: A 300-part recolor that one Ctrl+Z reverts.
   Done wrong: A script that renames 80 instances with no undo step.

6. **Set Studio's Editor Quality Level to the highest to judge visuals, then always re-check at Automatic and low quality.**
   Why: some post-processing effects may not appear in Studio unless the Editor Quality Level is at its highest [1]. Players on weaker devices see lower quality: lighting quality and view distance scale down by device [27], and SurfaceAppearance rendering varies with device and quality [24].
   How: Studio Settings → Rendering → Editor Quality Level (highest) for visual work. In Play, use the in-game graphics quality slider at 1, 5 and 10 before signing off ([[06 World and Look]] rule 36).
   Done right: A lighting pass judged at max quality, then checked at quality 1 with screenshots of both.
   Done wrong: A bloom-heavy look that only exists at quality 10.

7. **Know a new place's defaults: Studio starts new places on Soft lighting with streaming on, so check `LightingStyle`, `StreamingEnabled` and the avatar settings on day one.**
   Why: Studio begins every new game with Soft lighting [28], and instance streaming is on by default for new places [12]. Defaults change between Studio versions, and a wrong default discovered at ship time means re-testing everything.
   How: on a new place, record the values of `Lighting.LightingStyle`, `Lighting.PrioritizeLightingQuality`, `Workspace.StreamingEnabled`, the avatar type and scaling settings, and `StarterPlayer` movement values in `decisions.md`, then change them deliberately.
   Done right: "New place: Soft → set Realistic; streaming on, kept; R15, scaling on" in decisions on day one.
   Done wrong: Finding at launch that the game was built and tested on the wrong lighting style.

8. **Use Find All / Replace All (Ctrl+Shift+F) before renaming any remote, module, attribute or tag, and change every reference in one recorded step.**
   Why: Roblox references are strings (`WaitForChild("BuyItem")`, attribute names, tags). A rename that misses one reference fails silently at runtime.
   How: search all scripts for the old name, list the hits in your notes, change them together (one ChangeHistory step), then search again to confirm zero hits. Update the remotes contract table in `plan.md` ([[13 Building It Right]]).
   Done right: Renaming `BuyItem` to `PurchaseItem` with 6 references changed and the contract table updated.
   Done wrong: Renaming the RemoteEvent in Explorer and leaving 4 scripts waiting for the old name forever.

9. **Leave every script you touched with zero errors and zero warnings in Script Analysis, and `--!strict` on new modules where practical.**
   Why: type checking catches nil indexes, wrong argument types and typos before a playtest does. Warnings left behind hide new ones.
   How: open the Script Analysis window (View or Window menu) and fix everything in your files. New ModuleScripts start with `--!strict` ([[13 Building It Right]]).
   Done right: "Script Analysis: 0 errors, 0 warnings in the 4 files I changed" in the handoff.
   Done wrong: 140 warnings that everyone has learned to ignore.

10. **New Studio and engine features go through Beta Features first: test a beta in a copy of the place before relying on it, and record which betas the game depends on.**
    Why: Roblox ships big changes as Studio betas before release. Unified Lighting arrived as a Studio beta in January 2025, when live experiences were unaffected, and went fully live in July 2025 with existing looks preserved [2], [4], [5]. Future lighting had its own Studio beta phase years earlier [6]. Building on a beta that changes before release costs rework.
    How: enable a beta in Studio's Beta Features window, try it in a test copy of the place (rule 18), and write "depends on beta X" in `decisions.md` if the game uses it. Re-check when the beta ships.
    Done right: Testing the new lighting properties in a copy while the main place stays on the released settings.
    Done wrong: Shipping a game whose look depends on a beta flag the players don't have.

### Collaboration

11. **Every game uses Team Create, owned by the owner's group (or the owner), with each human collaborator given edit permission. Agents work only through the session the owner set up.**
    Why: Team Create keeps one cloud copy that everyone edits, with automatic saving. Group ownership means animations, audio and images uploaded to the group work in the game ([[07 Characters, VFX and Assets]]). Collaborator permissions are owner decisions.
    How: the owner turns on Team Create (Studio's collaboration controls; the place must be published first) and adds collaborators in the experience's permissions or the group's roles. Agents never add collaborators or change permissions. They ask with `cli.mjs ask`.
    Done right: A group-owned experience with the owner, one human co-developer and the crew's Studio session as collaborators.
    Done wrong: A game on a crew member's personal account that the owner can't manage.

12. **One writer at a time: only the holder of the Studio lock changes the place, and humans take the lock too when they edit.**
    Why: two people (or agents) editing the same objects at once overwrite each other. The crew's rule is that only the agent holding the Studio lock changes the place, and everyone else may read ([[00 For Any AI]], `CLAUDE.md`).
    How: the lock comes with the task. A human who wants to edit tells the Lead (`cli.mjs say --to lead "I'm editing the shop UI for an hour"`) so no agent task holding the lock runs in that area. Agents without the lock run only read-only inspection.
    Done right: The co-developer posts "editing Zone3 until 3pm", and Scenic's Zone3 task waits.
    Done wrong: Scenic recolors Zone3 while the human is moving it, and half the changes are lost.

13. **Know how the place handles script collaboration, either live co-editing or drafts, and never end a task with uncommitted script drafts.**
    Why: depending on the place's collaboration settings, script edits are either live (everyone sees changes as they're typed) or saved as drafts that must be committed before others, and the published game, see them. Uncommitted drafts are invisible work that gets lost.
    How: on day one, check how script editing behaves in the place (if a Drafts panel lists your edits, the place uses drafts) and write it in `decisions.md`. In drafts mode, commit every changed script before the handoff and say so.
    Done right: "Committed 3 drafts: ShopService, Config, HudController" in the handoff.
    Done wrong: A fix that worked for the agent and never reached anyone else because it sat in a draft.

14. **Edit only your area (Builder: ServerScriptService, ServerStorage, Shared, Remotes; Frame: StarterGui and UI modules; Scenic: Map, Terrain, Lighting; Librarian: Assets), and never delete work you didn't make unless your task says so.**
    Why: area ownership is how 15 agents share one tree without stepping on each other (`CLAUDE.md`). Deleting another area's "unused" object often breaks something that loads it by name.
    How: if your change needs something in another area, finish your part and hand off a task to the owner of that area (`cli.mjs task add --agent frame …`). If something in another area looks wrong, report it in the handoff.
    Done right: Builder adds a remote and asks Frame to wire the button.
    Done wrong: Builder rewrites the HUD script because it was "faster".

15. **Shared or repeated assets are Packages: kits, NPC rigs, shared UI widgets and anything used in more than one place. Package changes are published deliberately.**
    Why: a package is one asset with many linked copies. Publishing a change updates every copy, and auto-update keeps places in sync. Without packages, the same model drifts into 12 slightly different versions.
    How: right-click the model or folder → Convert to Package (or Save as Package). Each copy gets a `PackageLink`. Turn on `AutoUpdate` on the PackageLink for kits that should always match. After editing a package copy, publish the package change (or revert it) before the handoff. Never leave a modified, unpublished package copy.
    Done right: The castle kit is a package used in two places, updated once, synced everywhere.
    Done wrong: Twelve copies of a lamp, each with different fixes.

16. **Before and after any big change, write down the place's version number, and restore from version history instead of hand-repairing when a change goes wrong.**
    Why: Team Create saves automatically, so there's no "don't save" escape hatch. Version history is the escape hatch. Publishing creates a new published version, separate from autosaves.
    How: the place's version history is on the Creator Hub (the place's Version History page) and, in recent Studio builds, reachable from Studio. Before a big change, note the latest version in the handoff. If it goes wrong, tell the Lead. Restoring is an owner-approved action because it affects everyone's work.
    Done right: "Before: v214. After: v219. Restore point if needed: v214" in the handoff.
    Done wrong: Spending three hours rebuilding a deleted zone by hand.

17. **Save a local `.rbxl` backup before risky bulk operations (mass renames, terrain regeneration, package conversions, Rojo first sync), outside git.**
    Why: version history covers the cloud copy, but a local file is a fast, independent restore point that doesn't depend on anyone's permissions.
    How: File → Save to File As → `games/<slug>/backups/<date>-<what>.rbxl` in a gitignored folder (place files are large and may contain unreleased work). Keep the last 5.
    Done right: A backup taken before regenerating terrain, used once when the generator went wrong.
    Done wrong: No backup, and a terrain fill that erased the hub.

18. **Risky experiments and data tests happen in a test copy of the experience, not the live one.**
    Why: Studio playtests use the experience's real DataStores when API access is on, so a buggy save migration in Studio can corrupt real players' data. A test copy also lets you try betas (rule 10) without affecting the main place.
    How: the owner creates a private test experience (File → Publish As a new experience, or a copy of the place). Agents use it for data migrations, store wipes and beta trials, and note its id in `decisions.md`. In the main place, Studio tests use a key prefix (Luau section).
    Done right: A save-format migration tested on the test experience with 20 fake profiles first.
    Done wrong: Testing "reset all data" in the live experience's Studio session.

### Rojo vs in-Studio editing

19. **Each game has one source of truth per script, either files synced by Rojo or Studio, written in `plan.md`. Never edit the same script both ways.**
    Why: Rojo syncs files into Studio. When it's running, a change made in Studio to a Rojo-managed script is overwritten by the file on the next sync, and a change in the file is invisible to anyone not running Rojo.
    How: pick a mode at plan time. **Studio-first** (the default for this crew, since agents edit through the Studio MCP server): all scripts live in the place. **Rojo-first** (if the owner wants git history of code): scripts live in `games/<slug>/src`, and Studio holds only the world, UI layouts and assets. Record the mode and which services Rojo manages.
    Done right: "Rojo manages ServerScriptService, ReplicatedStorage.Shared and StarterPlayerScripts; everything else is Studio-managed" in the plan.
    Done wrong: An agent fixes a bug through MCP in a Rojo-managed module, and Rojo silently reverts it.

20. **In Rojo-first games, partially managed services use `$ignoreUnknownInstances: true` so Rojo never deletes Studio-made instances, and the project file is reviewed like code.**
    Why: by default, Rojo makes the synced tree match the files, which can remove instances that exist only in Studio (UI built by Frame, Remotes made by hand, Scenic's map).
    How: use the project file in the Rojo section. Folders map with `$path`, `.server.luau` becomes a Script, `.client.luau` a LocalScript, `.luau` a ModuleScript, and a folder with `init.luau` becomes a ModuleScript (or `init.server.luau` a Script). Take a backup (rule 17) before the first sync into an existing place.
    Done right: The first Rojo sync adds the code folders and leaves the map and UI untouched.
    Done wrong: The first sync deletes StarterGui because the project file mapped it to an empty folder.

21. **Pin the toolchain in the repo when using Rojo: Rojo, a formatter (StyLua), a linter (Selene), a language server (luau-lsp) and, if packages are needed, Wally, all at fixed versions through one toolchain manager.**
    Why: mismatched Rojo versions between the plugin and the server, or different formatter versions between agents, cause sync errors and noisy diffs. This is a rule of thumb from common Roblox open-source practice.
    How: a toolchain file (for example Rokit's or Aftman's) at the repo root with exact versions, and the matching Rojo Studio plugin version. CI or a pre-handoff script runs the formatter and linter.
    Done right: `rojo 7.x` pinned, the plugin matches, `stylua --check` and `selene` pass before every handoff.
    Done wrong: Two agents with different Rojo versions fighting over the same files.

22. **Studio-built content (the map, terrain, lighting, UI layouts and assets) is never edited through Rojo, and its changes are evidenced with screenshots and tree summaries rather than diffs.**
    Why: Rojo is great for code and poor for large visual hierarchies. Built content changes are judged by eye ([[06 World and Look]], [[05 UI and HUD]]).
    How: Scenic, Frame and Librarian work in Studio. Their handoffs include before and after tree summaries and screenshots sent to Review.
    Done right: A UI task handoff with the tree summary, a screenshot at phone size and the Review link.
    Done wrong: A 20,000-line `.model.json` diff of a map nobody can review.

### Studio's MCP server and the AI Assistant

23. **Before planning a Studio task, list the Studio MCP tools you actually have. Don't assume tool names, and if there are none, say so in the handoff instead of pretending.**
    Why: the crew reaches Studio through a Roblox Studio MCP server whose tools appear as `mcp__<server>__<tool>` (`CLAUDE.md`). Which tools exist depends on the server version and the owner's setup: Roblox's open-source Studio MCP server started with tools to run Luau code in Studio and insert Creator Store models, and newer Studio builds can expose MCP from Studio itself. Names and capabilities differ.
    How: search your tool list for the Studio server's tools at the start of the task. Note in your notes which ones you'll use (for example "run code", "insert model", "start or stop playtest", "read output", if present). If none appear, stop and report: "No Studio MCP tools visible; could not change the place."
    Done right: "Tools available: run_code, insert_model. No playtest tool, so Playtest must run the test."
    Done wrong: Writing "applied lighting preset" when no Studio tool was ever called.

24. **Code sent through MCP runs in edit mode with Studio permissions, so every run is small, idempotent, read-first, parent-last and prints a summary of what it changed.**
    Why: an MCP code run is like the command bar (rule 4): it can change anything. Big, non-idempotent scripts double-create instances when re-run after a timeout, and silent scripts give no evidence.
    How: one logical change per run, wrapped in the safe-edit recording (rule 5). Check for existing instances before creating (`FindFirstChild` then create), set properties, then `Parent` last. End by printing counts ("Created 3, updated 12, skipped 0") and copy that output into the handoff as evidence.
    Done right: A run that creates the SoundGroups only if missing and prints "SoundGroups: 4 present, 0 created".
    Done wrong: A 400-line run that times out halfway and is re-run, creating duplicate Remotes.

25. **Without the Studio lock, MCP use is read-only: inspection scripts that never write, never `Instance.new`, never set a property and never insert.**
    Why: the lock rule exists so reads stay safe while someone else writes (rule 12).
    How: read-only scripts start with a `-- READ ONLY` comment and only call getters, `GetChildren`, `GetDescendants`, `GetAttribute` and `print`. Reviewer and Playtest work this way.
    Done right: Reviewer scans all scripts for `loadstring` without the lock and reports findings.
    Done wrong: A "quick fix" made by an agent who didn't hold the lock.

26. **Studio's built-in AI Assistant is a helper for lookups, explanations and drafts. Its output is reviewed like any code, it never publishes or changes settings, and AI-generated content is noted in the handoff.**
    Why: Assistant can write code, generate content and act in Studio when allowed, which is fast and also fallible. The crew's rules (server authority, the remotes contract, `task` library, parent last) apply to everything regardless of who wrote it.
    How: use Assistant (or any AI tool) to draft, then read and test the result yourself. Never accept a prompt from it that asks to enable HTTP requests, change permissions or publish. Write "drafted with Assistant, reviewed and tested" in the handoff when it applies.
    Done right: Using Assistant to draft a tween, then rewriting it to follow the controller pattern.
    Done wrong: Pasting an Assistant-generated shop script that trusts the client's price.

27. **Never claim a test you didn't run: if you can't start a playtest through your tools, hand the test to Playtest or ask the owner, and say exactly what wasn't tested.**
    Why: "I wrote it" isn't "it works" ([[00 For Any AI]]). Untested claims are the most expensive mistakes in an overnight crew because they're discovered last.
    How: evidence is Output text, a screenshot or a report file. If the MCP server can start a play session and read Output, use it. Otherwise end with "Not tested: needs a 2-client Local Server test of the trade flow" and create a Playtest task.
    Done right: "Tested: Play Solo, purchase flow, Output clean (pasted). Not tested: 2-client trade."
    Done wrong: "Done and working" on code that never ran.

### Playtesting

28. **Pick the right test mode: Play (F5) to test the real join from a SpawnLocation, Play Here to test a spot quickly, Run (F8) to watch the server simulate with no player, and Stop (Shift+F5) to end.**
    Why: Play goes through character spawning at a SpawnLocation ([[06 World and Look]] rules 1-5) [26], which Play Here skips by placing you at the camera. Run has no player, so it's the way to watch NPCs, physics, round loops and server timers without client interference.
    How: always finish a feature test with Play, not Play Here. Use Run to soak-test a round system for 10 minutes and watch Output.
    Done right: The first-five-minutes test done with Play from a fresh join every time.
    Done wrong: Testing only with Play Here, and missing that new players spawn inside a wall.

29. **Anything multiplayer gets a Local Server test with at least 2 clients (Test tab → Clients and Servers), and 4-8 clients for crowding, trading, rounds and shared-world features.**
    Why: Play Solo hides replication bugs: things only the server sees, UI that only updates for the first player, races between two players claiming the same item, remotes that work for one and not for another.
    How: start a Local Server with 2-3 players. Each client is its own window, and the server is a separate window. Test each feature from both clients, including one leaving mid-action. For trading and economy, test both players acting at the same time.
    Done right: A trade test where client 2 disconnects during the confirm, and neither player loses items.
    Done wrong: A trading system tested only in Play Solo.

30. **During a test, switch between the Client and Server views to check what the server actually believes, especially for currency, inventory, positions and anything a client might fake.**
    Why: the client's screen can show anything. The server's view is the truth ([[13 Building It Right]]).
    How: in a Play session, use the Client/Server toggle (in the Test or Home tab) to switch, then inspect values and attributes in Explorer and Properties from the server side. In Local Server mode, use the server window.
    Done right: Confirming that a player's `Coins` attribute on the server matches the HUD after a purchase.
    Done wrong: "The coins went up on screen, so the purchase works".

31. **Every UI or world change is checked in the Device Emulator at phone sizes in both orientations and with touch input before it goes to Review.**
    Why: most players are on phones ([[08 Mobile]]). Desktop Studio hides overlapping buttons, tiny text and controls under the thumb.
    How: Test tab → Device (Device Emulator): pick at least one small phone, one large phone and one tablet, in portrait and landscape. Test touch controls (the thumbstick and jump button), and check that nothing important sits under them or under the screen edges.
    Done right: Screenshots of the HUD on two phone presets in landscape, with nothing under the jump button.
    Done wrong: A shop button exactly where the mobile jump button is.

32. **Use the Player Emulator to test locales and regional policies when the game is localized or uses policy-dependent features.**
    Why: text expands in other languages, and some features depend on policy (for example, whether paid random items or certain links are allowed for a player).
    How: Test tab → Player (Player Emulator): pick a locale and check that text fits. For policy-dependent features, check what the game shows when a policy is off ([[09 Shops and Monetization]]).
    Done right: German text checked in the shop, with no clipped buttons.
    Done wrong: A shop that breaks for players whose policy hides random paid items.

33. **Test with streaming the way players get it: fresh joins, long walks, teleports and portals, watching Output for "Infinite yield" warnings and nil errors.**
    Why: instance streaming is on by default and can't be turned on or off from a script [12], so the Studio test is the only place to catch client code that assumes a far-away part exists. Streaming techniques assume content may not be there yet [13]. Players have reported key buildings not appearing in big games, with guides suggesting a restart as a fix [29], which is the kind of bug this test catches.
    How: in Play, walk from spawn to the far edge, use every teleport and portal, and rejoin at different spots. Every client script that references the map must survive. Watch Output for `Infinite yield possible` and `attempt to index nil`.
    Done right: A gate controller that sets up gates as they stream in, with zero warnings after a full walk.
    Done wrong: A LocalScript that errors for anyone who spawns away from Zone 1.

34. **Know Studio's limits: purchase prompts in Studio are test purchases (no Robux is charged), teleports between places don't run in Studio, DataStores need "Enable Studio Access to API Services" and then touch real data, and HTTP calls need "Allow HTTP Requests".**
    Why: features that behave differently in Studio get "tested" in a way that proves nothing, or worse, write test junk into live data.
    How: purchases: test the full ProcessReceipt flow in Studio, then have the owner test a real purchase on the published game ([[09 Shops and Monetization]]). Teleports: test with Team Test or the published game. DataStores: use the key prefix pattern (Luau section) or the test experience (rule 18). HTTP: off unless the plan needs it (rule 45).
    Done right: A Studio note "Teleport to Arena place: not testable in Studio; tested in Team Test, works".
    Done wrong: "Teleport tested in Studio" when the call just errored.

35. **Debug commands and test fixtures run only in Studio: guarded by `RunService:IsStudio()`, created at startup only in Studio, and absent from the published game.**
    Why: "give me 1 billion coins" commands are how testers reach late-game content quickly, and a debug remote left in a live game is a free exploit.
    How: a server DebugService (Luau section) that returns immediately unless `RunService:IsStudio()` is true, creates its RemoteEvent only in Studio, and accepts commands only from the owner's or test accounts. The remotes contract table lists it as a Studio-only exception. The pre-publish audit fails if a `DebugCommand` remote exists in the saved place.
    Done right: Playtest jumps to zone 5 with `/give coins 1e6` in Studio, and the command doesn't exist live.
    Done wrong: A debug remote shipped to production, found by an exploiter in a day.

36. **Use Team Test (or a private test server on the published game) for anything Studio can't simulate: teleports, real purchases, cross-server features and tests with real humans on real devices.**
    Why: Team Test runs the Team Create place on Roblox servers with collaborators joining as players, which is closer to production than a Local Server.
    How: Test tab → Team Test (start a test, collaborators join from Studio). For phone tests, the owner or a human tester joins the published test experience from a real phone.
    Done right: The owner and co-developer test the place-to-place teleport in Team Test before the update ships.
    Done wrong: Shipping a multi-place game whose teleports were never run anywhere but Studio.

### Debugging

37. **A test passes only with a clean Output: zero red errors and no unexplained warnings from your scripts, with Output cleared before each run.**
    Why: errors in Output are bugs that happened, even if the screen looked fine. Old output from previous runs hides new problems.
    How: clear Output before starting the test. Use its filters (by message type and by Client, Server or Studio context) to separate sides. Copy the final Output into the report when asked for evidence. Errors from Roblox's own core scripts or plugins are noted, not ignored, and reported if they repeat.
    Done right: "Output after 5-minute Local Server test: 0 errors, 1 expected warning (asset loading slow)" in the report.
    Done wrong: Handing off with 12 red errors "unrelated to my change".

38. **Read the whole error: the message, the script path and the line number, then click it to jump to the line, and look up unfamiliar errors in the common errors table below.**
    Why: most Roblox errors say exactly what's wrong (`attempt to index nil with 'Parent'` at a line), but agents often only read the first words.
    How: click the error line in Output to open the script at that line. Check the stack trace (the indented lines below) to find the caller. Use the table in the Output and debugging section.
    Done right: Fixing "Infinite yield possible on 'ReplicatedStorage:WaitForChild("Remotes")'" by finding the Remotes folder was renamed.
    Done wrong: Wrapping the failing line in `pcall` to make the red go away.

39. **Use breakpoints, the Watch window and the Call Stack instead of print spam, and remove or gate debug prints before the handoff.**
    Why: breakpoints show every variable at the moment of the bug without changing timing much. Leftover prints flood Output and hide real warnings.
    How: click the gutter next to a line number in the script editor to add a breakpoint, run Play, and when it pauses use Watch and Call Stack. Step with the debugger controls (step over, step into, step out). Logs that should stay go through a logger gated by `Config.Debug` (Luau section).
    Done right: A breakpoint in ProcessReceipt showing the receipt fields during a test purchase.
    Done wrong: 40 `print("here")` lines left in ShopService.

40. **In any running game (Studio Play, Team Test or live), open the Developer Console (F9) for client and server logs, memory, network and script activity.**
    Why: the Developer Console is the only view of a live server's errors and memory, and the only way to see problems that happen on a real phone.
    How: F9 (or the in-game menu) opens it. Check the Log tab (client and server), Memory (by category), Network and Scripts. Server-side views need the right permissions on the experience.
    Done right: A playtest report with the live server's error log and client memory from a real phone.
    Done wrong: "Couldn't reproduce" for a bug whose server error was sitting in the Developer Console.

### Profiling

41. **Profile before optimizing, against the frame budget: 16.7 ms per frame at 60 FPS and 33.3 ms at 30 FPS, with targets of 60 FPS on PC and 30 or more on a low-end phone.**
    Why: guessing at performance wastes time on code that isn't slow. The budget makes "slow" a number.
    How: measure in the heaviest scene (the busiest zone, a full server, peak effects) with the MicroProfiler (rule 42) and Script Profiler (rule 43), and write the numbers in the report before and after any optimization.
    Done right: "Zone 4 frame 28 ms on phone; after merging decor 19 ms" in the report.
    Done wrong: Rewriting the pet system "for performance" without measuring, and the frame time didn't change.

42. **Use the MicroProfiler to see what each frame spends time on: Ctrl+F6 in the client (or open it from Studio's View or Window menu), pause on a spike, and label your own code with `debug.profilebegin` and `debug.profileend`.**
    Why: the MicroProfiler shows each frame as a stack of labeled timings, so a spike shows whether rendering, physics, scripts or networking caused it.
    How: open it during a Play test, reproduce the spike, pause, then click the tallest frame and read the widest labels. Wrap expensive functions with `debug.profilebegin("PetFollow")` and `debug.profileend()` so they appear by name. For the server, use the Developer Console's MicroProfiler tab to record a dump.
    Done right: Finding that a 12 ms spike every second is a labeled `ZoneCheck` loop doing a full map search.
    Done wrong: Reading total FPS only and never knowing what caused the drops.

43. **Use the Script Profiler to find hot scripts and functions: no single client system above about 1 ms per frame on average and no server system above about 2 ms (targets).**
    Why: one bad loop (a per-frame `GetDescendants`, a busy `while true` without waits) can eat the budget for everything else.
    How: open the Script Profiler (Studio's View or Window menu, or the Developer Console's ScriptProfiler tab in a running game), record 10-30 s of normal play, and sort by time. Fix the top entry first, then re-record.
    Done right: Moving a per-frame `workspace:GetDescendants()` scan into a CollectionService tag set, dropping it from 3 ms to 0.1 ms.
    Done wrong: Optimizing a function that takes 0.01 ms.

44. **Check memory growth with a 10-minute soak: client and server memory in the Developer Console's Memory tab at minute 1 and minute 10. Steady growth means a leak.**
    Why: leaks (connections never disconnected, tables of destroyed players, effects never destroyed) don't show in a 2-minute test and crash phones in a 40-minute session.
    How: start a Local Server with 2 clients, play the core loop for 10 minutes (or use Run plus a bot script on the server), and record memory at 1, 5 and 10 minutes by category. Investigate any category that grows steadily.
    Done right: "Client memory 890 → 905 → 908 MB; server flat" in the report.
    Done wrong: Shipping a game whose client memory grows 50 MB a minute because every coin burst leaks.

### Publishing, places and the Creator Hub

45. **The owner publishes. Agents never call publish, never change experience access, and never change security settings. They prepare a publish checklist and a version note, then ask.**
    Why: publishing changes the live game for every player. It's the owner's decision (`CLAUDE.md`). Security toggles (Allow HTTP Requests, Enable Studio Access to API Services, third-party sales and teleports) are attack surface ([[13 Building It Right]]).
    How: Producer's final gate produces the publish checklist (section below) and a version note ("v1.3: new desert zone, shop fixes"). The Lead sends it with `cli.mjs ask --title "Ready to publish v1.3" --body "…"`.
    Done right: The owner gets a one-screen checklist, all items ticked, and publishes in two clicks.
    Done wrong: An agent pressing Publish at 3 a.m. because "it was done".

46. **Know how experiences and places fit together: one experience (universe) has a start place and any number of other places, each with its own version history, and players move between them with TeleportService.**
    Why: lobbies, arenas, worlds and private instances are often separate places. Place ids and the start place matter for teleports, analytics and data, and every place must be published to update.
    How: add places from Studio's Asset Manager (Places) or the Creator Hub. Keep every place id in `Config.Places`, never inline. Remember that all places in one experience share its DataStores. Test teleports in Team Test or the published game (rule 34).
    Done right: `Config.Places = { Lobby = 123, Arena = 456 }`, both places published together in each release.
    Done wrong: Updating the lobby but forgetting to publish the arena, so the two run different versions of the data code.

47. **Experience security settings stay off unless the plan needs them, and every one that's on is written in `decisions.md` with the reason.**
    Why: Allow HTTP Requests lets scripts call outside services (and lets a backdoor phone home). LoadStringEnabled lets code run strings ([[07 Characters, VFX and Assets]]). Third-party sales and teleports widen what scripts can do.
    How: the pre-publish audit (Luau section) prints `HttpService.HttpEnabled` and `ServerScriptService.LoadStringEnabled`. Studio API access is on only while someone is testing DataStores, and the owner decides.
    Done right: "HTTP: off. LoadString: off. Studio API access: on during the data migration week, then off" in decisions.
    Done wrong: HTTP turned on because a free model's script asked for it.

48. **Creator Hub settings belong to the owner: maturity questionnaire, devices, server size, private servers, game passes, developer products, localization, notifications, permissions and the icon and thumbnails. Agents prepare the values, the owner sets them.**
    Why: these settings affect who can find and play the game and how it earns. Some are legal and policy questions (the content maturity questionnaire) only the owner can answer.
    How: Architect and Merchant list what's needed in `plan.md` (server size, devices, pass and product names, prices as proposals, [[09 Shops and Monetization]]). Splash prepares icon and thumbnails ([[11 Thumbnails, Icons and the Store Page]]). The Lead sends one `cli.mjs ask` with all values. Agents never create passes or products.
    Done right: One ask: "Please set: max 24 players, phone/tablet/PC/console, passes x3 (names and proposed prices attached), questionnaire answers drafted."
    Done wrong: Agents guessing the maturity questionnaire, or an agent creating a game pass.

49. **Custom avatar scaling, avatar type and similar player-facing options are set in the experience settings on purpose and recorded, because they change level design.**
    Why: developers can turn off custom avatar scaling in the experience settings [25], and the choice changes door sizes, hitboxes and seats ([[06 World and Look]] rule 55, [[07 Characters, VFX and Assets]] rule 2).
    How: Architect decides in `plan.md`. The owner or an agent with the lock sets it in Studio's avatar settings. Playtest checks with a scaled-up avatar.
    Done right: "R15, scaling allowed, doors sized for 105% height" in the plan.
    Done wrong: Scaling turned off late in development to hide a door-size bug.

50. **Open Cloud keys are created only by the owner, with the smallest scope, an IP allowlist where possible and an expiry date, and they never go into the repo, a place or a chat log.**
    Why: an API key with publish or data store scope is as powerful as the owner's account for that scope. Leaked keys get abused fast.
    How: the owner creates keys on the Creator Hub's Open Cloud API keys page, choosing only the needed scopes (for example, one experience's data store read scope for Liveops dashboards, or asset upload for art). Keys live in the app's secret storage or environment variables, never in files. Uses: publishing (owner-run), reading and writing data stores for support and analytics, sending messages to live servers, uploading assets, and running Luau against a place for automated checks where available.
    Done right: A data-store read-only key for Liveops, limited to one experience, expiring in 90 days.
    Done wrong: A full-scope key pasted into `decisions.md`.

### Team workflow

51. **Every Studio task follows the same loop: get the lock and the task, inspect, make small recorded changes, test with evidence, clean up, hand off in under 150 words.**
    Why: a predictable loop is what lets the crew work overnight without the owner. The handoff is how the next agent knows what's true.
    How: see "The Studio task loop in 12 steps" below. The handoff names what changed (tree paths), the evidence (Output, screenshots, report files), what's still open, and who's next.
    Done right: A Builder handoff: "Added PurchaseService (SSS.Services), remote PurchaseItem; tested 2-client Local Server, Output clean (reports/2026-10-23-shop.md); open: Frame to wire the button; next: frame."
    Done wrong: "Did the shop stuff".

52. **The two humans and the crew share one calendar of the place: humans edit by day with the lock and announce it, the crew runs queued tasks overnight, and nobody edits during the owner's review window.**
    Why: two humans plus 15 agents means three kinds of writers. A shared rhythm avoids collisions without constant coordination.
    How: humans post when they take and release the lock (`cli.mjs say --to lead`). The Lead schedules agent tasks that hold the lock outside those times. The morning review (Needs you, Review queue, reports) is read-only for agents. Decisions humans make go in `decisions.md` like the crew's.
    Done right: The owner reviews thumbnails at 9:00 while agents only read, and Scenic's next task starts at 10:00 after the owner releases.
    Done wrong: A human tweaking lighting while Scenic's task applies a preset to the same Lighting.

53. **Big changes are staged: greybox and systems first, then art, then polish, each behind a Producer gate, and never a "rebuild everything" task.**
    Why: small staged changes keep the place playable every day and make problems easy to trace to one change.
    How: tasks are sized small or big (`--size small|big` on `cli.mjs task add`). A big task is split into steps that each leave the place working. Each step has its own test and handoff.
    Done right: "Desert zone" as 5 tasks: greybox, systems, kit art, lighting and audio, polish.
    Done wrong: "Rebuild the whole map in the new style" as one overnight task.
