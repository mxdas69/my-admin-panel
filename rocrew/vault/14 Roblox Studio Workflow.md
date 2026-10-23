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
    How: a server DebugService (Luau section) that returns immediately unless `RunService:IsStudio()` is true, creates its RemoteEvent only in Studio, validates every argument like any other remote, and logs every command it runs. The remotes contract table lists it as a Studio-only exception. The pre-publish audit fails if a `DebugCommand` remote exists in the saved place.
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

## Step by step

### The Studio task loop in 12 steps

1. Read the task, the plan, the vault pages for your role and the game's `decisions.md`. Check the task says whether you hold the Studio lock.
2. List the Studio MCP tools you have (rule 23). If there are none, stop and report.
3. Inspect: run the read-only tree inspector on your area and read every script you'll touch (rule 1). Note the place version (rule 16).
4. Plan the change as a list of small steps, each one leaving the place working.
5. For risky bulk work, save a local backup (rule 17).
6. Make each step as one recorded change (rule 5), parent last, printing a summary (rule 24).
7. Run Script Analysis on what you changed (rule 9).
8. Test: Play for the join path, Local Server with 2+ clients for anything shared, the Device Emulator for anything visible, and the Client/Server toggle for anything the server owns (rules 28-31).
9. Check Output is clean and save it as evidence (rule 37).
10. Clean up: remove test parts and debug prints, commit any script drafts (rule 13), publish or revert package changes (rule 15).
11. Note the place version after the change.
12. Hand off in under 150 words: what changed (paths), evidence, what's open, who's next (rule 51).

### Setting up a new game's Studio workflow in 14 steps

1. The owner creates the experience under their group (or account) and publishes an empty place.
2. The owner turns on Team Create and adds the crew's Studio session and any human collaborator.
3. Record the new place's defaults (rule 7): LightingStyle, streaming, avatar type and scaling, StarterPlayer movement.
4. Decide Studio-first or Rojo-first (rule 19) and write it in `plan.md`.
5. If Rojo-first: set up the project file and toolchain (Rojo section), back up, then do the first sync with the owner watching.
6. Create the tree from [[13 Building It Right]]: services, Shared, Remotes, Assets, Map.
7. Create SoundGroups and the Lighting stack ([[07 Characters, VFX and Assets]], [[06 World and Look]]).
8. Add DebugService (Studio-only, Luau section) and the test-prefix DataStore name in Config.
9. The owner creates a private test experience for data and beta trials (rule 18), and its id goes in `decisions.md`.
10. Record the script collaboration mode (live or drafts) (rule 13).
11. Confirm security settings are off (rule 47) and note them.
12. Convert any shared kits to packages (rule 15).
13. Run the pre-publish audit once on the empty structure to make sure it passes.
14. Write all of the above into `decisions.md` as the game's workflow baseline.

### Running a multiplayer test in 9 steps

1. Clear Output in Studio.
2. Test tab → Clients and Servers → Local Server with 2 players (3-8 for crowds or rounds). Start.
3. Arrange the windows so you can see both clients and the server.
4. On client 1, do the action. On client 2, watch for the result.
5. Repeat with client 2 acting and client 1 watching.
6. Try the conflicts: both act at once, one leaves mid-action, one rejoins.
7. In the server window, check the values the server holds (attributes, data in a debug print).
8. Copy Output from the server and both clients.
9. Write the report in `games/<slug>/reports/<date>-<feature>.md` with the steps, results and Output.

### Profiling a slow scene in 8 steps

1. Reproduce the slow scene reliably (the busiest zone, a full round, a boss fight).
2. Record the frame time with the MicroProfiler or the in-game performance view, on the slowest target (Device Emulator is not a performance test; use a real phone where possible).
3. Pause the MicroProfiler on a spike and read the widest labels (rule 42).
4. If scripts are wide, record 20 s with the Script Profiler and sort by time (rule 43).
5. If rendering is wide, run the world audit ([[06 World and Look]]) and check parts, transparency, lights and effects.
6. Fix the single biggest cost.
7. Measure again in the same scene.
8. Report before and after numbers, and stop when you're within budget (rule 41).

## Studio panel map

| Panel or tool | Where to find it | What the crew uses it for | Main users |
|---|---|---|---|
| Explorer | View or Window menu | The tree; filter by name or class; reparenting | Everyone |
| Properties | View or Window menu | Reading and setting properties; attributes and tags at the bottom | Everyone |
| Command bar | View or Window menu | Edit-mode audits and bulk edits (rule 4) | Everyone with the lock (read-only without) |
| Output | View or Window menu | Errors, warnings, prints, by context | Everyone |
| Script editor | Double-click a script | Editing code, breakpoints, go to definition | Builder, Frame, Merchant |
| Script Analysis | View or Window menu | Type and lint errors across scripts (rule 9) | Builder, Frame, Reviewer |
| Find All / Replace All | Ctrl+Shift+F | Finding every reference before renames (rule 8) | Builder, Reviewer |
| Toolbox | View or Window menu | Creator Store inserts (quarantine first, [[07 Characters, VFX and Assets]]) | Librarian |
| Asset Manager | View or Window menu | The experience's places, images, meshes, audio and packages | Librarian, Lead |
| Material Manager | Model tab or View menu | Creating and editing MaterialVariants [20], [21] | Scenic, Librarian |
| Terrain Editor | Home or Model tab | Generate, sculpt, paint, sea level | Scenic |
| Model tools (move, scale, rotate, snap, align, pivot) | Home or Model tab | Placing and aligning parts; union and negate for greyboxing [14] | Scenic, Builder |
| Lighting properties | Explorer → Lighting | The look; the core curriculum walks these properties [15] | Scenic |
| Import 3D | File menu, Home or Avatar tab | Bringing in Blender meshes | Librarian |
| Rig Builder, Animation Editor | Avatar tab | Test dummies, NPCs, animations | Librarian |
| Test tab (Play, Play Here, Run, Clients and Servers, Device, Player, Team Test) | Test tab | All playtesting (rules 28-36) | Playtest, everyone |
| Debugger (Watch, Call Stack, Breakpoints) | Appears when paused; View menu | Stepping through bugs (rule 39) | Builder |
| MicroProfiler, Script Profiler | View or Window menu; Developer Console | Performance (rules 41-44) | Builder, Reviewer, Playtest |
| Beta Features | File menu | Trying new features in a copy (rule 10) | Lead, Builder |
| Team Create / Collaborators / Drafts | Home or View, collaboration controls | Collaboration (rules 11-13) | Lead, owner |
| Game Settings / Experience Settings | Home tab or File menu | Avatar, world, security, places, permissions | Owner (agents read) |
| Assistant | Studio's AI panel | Drafts and lookups (rule 26) | Anyone, with review |
| Properties asset fields | Properties | Asset ids for textures and SurfaceAppearance maps [22] | Librarian |

Roblox's own curricula are a good way to learn where things are: the core curriculum's greyboxing and lighting lessons [14], [15] and the environmental art curriculum [16] have published sample places you can open in Studio to see a finished project's structure [17], [18]. The tutorials index lists the rest [19].

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| F5 | Play |
| F8 | Run (server simulation, no player) |
| Shift+F5 | Stop the test |
| Ctrl+Z / Ctrl+Y | Undo / redo |
| Ctrl+D | Duplicate |
| Ctrl+G / Ctrl+U | Group / ungroup |
| Ctrl+Shift+G | Union |
| Ctrl+Shift+N | Negate |
| Ctrl+Shift+U | Separate |
| Ctrl+L | Toggle local and world space for the move and rotate tools |
| F (in the viewport) | Focus the camera on the selection |
| Ctrl+Shift+F | Find All / Replace All in scripts |
| Alt+P | Publish to Roblox (owner only, rule 45) |
| F9 (in a running game) | Developer Console |
| Ctrl+F6 (in the Roblox client) | MicroProfiler |

Shortcuts can be changed in Studio's shortcut settings. If one doesn't work, look the action up there.

## Collaboration recipes

### The Studio lock protocol (two humans and the crew)

| Situation | What happens |
|---|---|
| An agent task holds the lock | Only that agent writes. All other agents inspect read-only (rule 25). |
| A human wants to edit | They post "taking the lock: <area> until <time>" to the Lead (`cli.mjs say --to lead`). The Lead pauses tasks that need the lock. |
| A human finishes | They post "releasing the lock" plus a one-line summary of what they changed. The Lead writes it into `decisions.md` if it's a decision. |
| An agent finds a human mid-edit in its area | It stops, makes no changes, and reports back to the Lead. |
| Two areas, one change | The agent finishes its own part and creates a task for the other area's owner (rule 14). |
| Emergency fix needed live | Only the owner decides to publish a hotfix ([[12 Live Ops and Launch]]). |

### Packages

1. Build the kit or widget in one place and test it.
2. Right-click → Convert to Package. Name it clearly (`Kit_Castle`, `UI_ShopCard`).
3. For kits that must always match, turn on `AutoUpdate` on each copy's `PackageLink`.
4. To change a package, edit one copy, test, then publish the package change. Every auto-updating copy updates.
5. Never leave a modified, unpublished package copy at the end of a task. Publish or revert.
6. Packages owned by the group can be used across the group's places.
7. Note in the handoff when a package version changed and which places use it.

### Version and backup protocol

| When | Action |
|---|---|
| Start of any big task | Note the place's current version number |
| Before mass edits, terrain regeneration, package conversions or the first Rojo sync | Save a local `.rbxl` backup (rule 17) |
| End of task | Note the version after the change in the handoff |
| Something broke | Tell the Lead with the last good version. The owner approves any restore. |
| Before each publish | Producer records the version being published in the gate report |

## Rojo setup (Rojo-first games only)

```json
{
  "name": "game-slug",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": {
      "$ignoreUnknownInstances": true,
      "Shared": { "$path": "src/shared" }
    },
    "ServerScriptService": {
      "$ignoreUnknownInstances": true,
      "Server": { "$path": "src/server" }
    },
    "StarterPlayer": {
      "$ignoreUnknownInstances": true,
      "StarterPlayerScripts": {
        "$ignoreUnknownInstances": true,
        "Client": { "$path": "src/client" }
      }
    }
  }
}
```

```
games/<slug>/
  default.project.json
  src/
    shared/        → ReplicatedStorage.Shared   (Config.luau, Types.luau, Util/...)
    server/        → ServerScriptService.Server (Main.server.luau, Services/*.luau)
    client/        → StarterPlayerScripts.Client (Main.client.luau, Controllers/*.luau)
```

| File name | Becomes |
|---|---|
| `Name.server.luau` | Script |
| `Name.client.luau` | LocalScript |
| `Name.luau` | ModuleScript |
| `Folder/init.luau` | The folder becomes a ModuleScript with its children |
| `Folder/init.server.luau` | The folder becomes a Script |
| `Name.meta.json` | Extra properties or attributes for the matching instance |

Workflow: run `rojo serve` from the game folder, connect the Rojo plugin in Studio, and edit files. Map, UI, Lighting and Assets stay Studio-managed (rule 22). With the mapping above, the code folders sit inside the existing Shared and Main structure from [[13 Building It Right]]; adjust paths to match the game's plan, and keep entry scripts and module names as the plan lists them.

## Studio MCP recipes

**Start of every task:** list tools → run the read-only tree inspector on your area → read scripts → note the version.

**A safe write through MCP:**
1. Read: print the current state of exactly what you'll change.
2. Write: one recorded change using the safe-edit wrapper, idempotent (find before create), parent last.
3. Verify: print the new state and counts.
4. Paste steps 1 and 3 into the handoff as evidence.

**When something fails mid-run:** don't re-run blindly. Inspect first (what got created?), then run an idempotent version that only does what's missing.

**Plugin-level power:** code run through MCP or the command bar can set properties that game scripts can't, such as SurfaceAppearance maps [23]. That's useful for setup and dangerous for mistakes, so keep the read, write and verify pattern.

**What MCP can't prove:** a write succeeding isn't a test. Run the playtest (or hand it to Playtest) before claiming a feature works (rule 27).

## Playtest matrix

| What changed | Minimum test | Plus |
|---|---|---|
| A server system (economy, data, rewards) | Play + Client/Server check | Local Server 2 clients; rejoin to check saving |
| A remote | Local Server 2 clients | Bad-input test (wrong types, spam) from a client |
| UI | Play + Device Emulator (2 phones, tablet, both orientations) | Review screenshot |
| World or lighting | Play from a fresh join + quality 1, 5, 10 | Device Emulator; real phone if possible |
| Streaming-sensitive client code | Fresh joins at 3 spots, walk to the far edge, use every portal [12], [13] | Output clean of infinite yields |
| Purchases | Studio test purchase through ProcessReceipt | Owner tests a real purchase on the published game |
| Teleports or multi-place | Team Test or published test experience | Both places published together |
| Round or match systems | Run (F8) soak for 10 minutes + Local Server 4+ clients | Force-map debug command for every map |
| Data migrations | Test experience with fake profiles (rule 18) | Rejoin and verify every field |
| Performance | MicroProfiler + Script Profiler in the heaviest scene | 10-minute memory soak |
| First five minutes | Play from a fresh profile, no debug commands | Kid Tester run ([[01 The First Five Minutes]]) |

## What Studio can't fully simulate

| Feature | In Studio | How to test for real |
|---|---|---|
| Robux purchases | Test purchase prompts; no Robux charged | Owner buys on the published game |
| Teleports between places | Don't run | Team Test or published test experience |
| DataStores | Real stores of the experience, only with Studio API access on | Key prefix in Studio (Luau) or the test experience |
| HTTP requests | Only with Allow HTTP Requests | Keep off unless planned |
| Real phone performance | Device Emulator shows layout, not speed | A real low-end phone |
| Many real players | Local Server up to a handful of clients | Team Test with humans, or a soft launch |
| Live server memory and errors | Studio's own process | Developer Console on the published game |

## Output and debugging

### Common Output messages

| Message (shape) | Usually means | Fix |
|---|---|---|
| `Infinite yield possible on 'X:WaitForChild("Y")'` | Y doesn't exist (renamed, not created, streamed out) | Check the name; for map parts use tags or a timeout ([[06 World and Look]] rule 62) |
| `attempt to index nil with 'Z'` | A value you expected is nil (missing child, failed lookup, unloaded data) | Find which variable is nil at that line; guard or fix the source |
| `Y is not a valid member of X` | Indexing a child or property that doesn't exist | Check spelling and class; use `FindFirstChild` for optional children |
| `Requested module experienced an error while loading` | The required module threw at require time | Open the module's own error above it; modules must not have side effects ([[13 Building It Right]]) |
| `Script timeout: exhausted allowed execution time` | A loop that never yields | Add `task.wait()` or restructure; never `while true do end` |
| `Maximum event re-entrancy depth exceeded` | An event handler that triggers itself | Break the loop (guard flag, defer) |
| Errors mentioning API access or permissions on DataStore calls | Studio API access is off, or the place isn't published | Ask the owner; use the test experience |
| `HTTP requests are not enabled` | HttpService call with HTTP off | Don't turn it on for a free model; check the plan |
| Animation or sound fails to load | Asset not owned by or shared with the experience | Upload to the owner or group ([[07 Characters, VFX and Assets]]) |

### Debugging steps

1. Reproduce it reliably, in the smallest test that shows it.
2. Read the full error and stack (rule 38).
3. Breakpoint at the line, run, inspect Watch and Call Stack (rule 39).
4. Check both sides: is it a client or server error, and does the server's view match (rule 30)?
5. Fix the cause, not the symptom (no blanket `pcall`).
6. Re-run the same test, then the playtest matrix row for that area.

## Profiling guide

| Number | Target | Where |
|---|---|---|
| Frame time, PC | 16.7 ms or less (60 FPS) | MicroProfiler |
| Frame time, low-end phone | 33.3 ms or less (30 FPS) | Real phone, Developer Console |
| One client system | about 1 ms per frame average or less | Script Profiler |
| One server system | about 2 ms per frame average or less | Script Profiler (server) |
| Client memory growth in 10 minutes | Flat, after warm-up | Developer Console Memory tab |
| Server memory growth per hour | Flat, after warm-up | Developer Console (server) |
| Remote traffic | No remote firing every frame for every player | Network tab; code review |

**Reading the MicroProfiler:** each horizontal bar is a frame. Click a tall one and look for the widest labels. Wide script labels point at Script Profiler work. Wide rendering labels point at the world audit (parts, transparency, lights, effects). Wide physics labels point at unanchored parts, many Humanoids or complex collision. Your own labels from `debug.profilebegin` show exactly which system to fix.

## Publishing checklist

Producer fills this in before the Lead asks the owner to publish.

- [ ] All gates passed for this version (plan, build, test and fix, ship prep).
- [ ] Place version recorded; local backup taken.
- [ ] Pre-publish audit (Luau section) passes: no DebugCommand remote, no `require(<number>)`, no `loadstring`, security settings as recorded, streaming on.
- [ ] Output clean in the final Local Server test (attached).
- [ ] Every place in the experience that changed is listed and ready to publish together (rule 46).
- [ ] Package changes all published (rule 15); script drafts all committed (rule 13).
- [ ] DataStore names are the live names (no TEST_ prefix in live code paths); save format migration tested in the test experience.
- [ ] Monetization items that the update needs exist on the Creator Hub (the owner created them), and their ids are in Config.
- [ ] Icon, thumbnails and description updates ready ([[11 Thumbnails, Icons and the Store Page]]).
- [ ] Analytics events for the update in place ([[12 Live Ops and Launch]]).
- [ ] Version note written ("v1.3: …").
- [ ] Rollback plan: the version number to restore if something goes wrong.

## Creator Hub settings the owner controls

| Setting | What it decides | Who prepares the values |
|---|---|---|
| Name, description, genre | Discovery and store page | Splash, Pulse ([[11 Thumbnails, Icons and the Store Page]], [[15 Discovery and Growth]]) |
| Icon and thumbnails | Click-through | Splash |
| Maturity and compliance questionnaire | Who can see the game | Owner answers; Reviewer drafts notes |
| Access (public or private) | Whether players can join | Owner |
| Devices supported | Phone, tablet, PC, console, VR | Architect (plan) |
| Server size and server fill | Players per server | Architect, Balance |
| Private servers and price | Private server availability | Merchant proposes |
| Game passes and developer products | What players can buy | Merchant proposes names and prices ([[09 Shops and Monetization]]) |
| Places | Lobby, arenas, worlds | Architect (rule 46) |
| Localization | Automatic and manual translations | Frame lists strings |
| Notifications | Experience notifications to players | Liveops ([[10 Retention and Social]]) |
| Permissions and collaborators | Who can edit | Owner (rule 11) |
| Avatar settings | Rig type, scaling | Architect (rule 49) |
| Security settings | HTTP, Studio API access, third-party sales and teleports | Owner; Reviewer advises (rule 47) |
| Analytics | Dashboards and custom events | Liveops |
| API keys (Open Cloud) | Automation access | Owner (rule 50) |

## Open Cloud

Open Cloud is Roblox's set of web APIs for working with experiences from outside Studio, authenticated with API keys (or OAuth apps). For this crew it's owner-gated automation.

| Use | Scope (shape) | Who runs it | Notes |
|---|---|---|---|
| Publish a place file | Place publishing for one experience | Owner only | Uses the place's versions endpoint with the published version type; same effect as Publish in Studio |
| Read player data for support | Data store read for one experience | Liveops, with an owner key | Read-only; never write from tools without the owner |
| Fix one player's data | Data store write | Owner approves each use | Log every change in `decisions.md` |
| Send a message to live servers | Messaging for one experience | Liveops, owner approves | Announcements, live event triggers |
| Upload images, audio or models | Asset upload | Librarian through the app, owner key | Assets belong to the owner or group ([[07 Characters, VFX and Assets]]) |
| Run Luau checks against a place | Luau execution, where available | Reviewer, owner key | Automated tests without opening Studio |

**Key hygiene:** one key per job, the smallest scope, limited to one experience, an IP allowlist where possible, an expiry date (90 days or less), stored as an app secret or environment variable, never in a file, place, chat or handoff. Rotate on any suspicion of a leak.

## Examples from top games

These examples come from what sources say each game does. The Studio workflow lessons are this crew's inference about what such features take to build and test.

### Timed shop restocks need a time-skip in testing
**Game:** Grow a Garden ([30])
**Shows:** Guides say the Seed Shop and Gear Shop stock restocks every five minutes.
**Why it works:** A short, shared timer gives players a reason to check back and creates moments when everyone rushes the shop.
**Steal:** Server-timed restocks driven by `workspace:GetServerTimeNow()`, with a `Config.Debug.TimeScale` that speeds timers up in Studio only (Luau section) so testers see ten restocks in a minute.
**Avoid:** Testing a 5-minute timer by waiting 5 minutes per check, or shipping a debug time scale.

### Key buildings must survive streaming and fresh joins
**Game:** Grow a Garden ([29])
**Shows:** One guide says the Gear Shop sometimes doesn't appear in the playing area and suggests restarting the game as a fix.
**Why it works:** (as a lesson) Players have workarounds, but every restart is a chance to quit.
**Steal:** Add "every key building and NPC appears for a fresh join at 3 spawn points" to the playtest matrix (rule 33), and make key buildings Atomic or Persistent where needed ([[06 World and Look]] rule 62).
**Avoid:** Testing only with the same session that built the map.

### Huge content needs kits, packages and version discipline
**Game:** Pet Simulator 99 ([32], [40])
**Shows:** A guide says the game has 99 areas as of its latest update, and another describes many biomes split across several worlds.
**Why it works:** Steady streams of new areas keep players progressing, but only if each area is fast to build and safe to ship.
**Steal:** Zone kits as packages (rule 15), a zone template with its volume, gate and lighting preset, and a version note per update (rule 16).
**Avoid:** Hand-building each area from scratch, so every update risks breaking older areas.

### Cross-server features need real servers to test
**Game:** Pet Simulator 99 ([31])
**Shows:** The Spawn hub has a mailbox and leaderboards alongside the shop.
**Why it works:** Mail and leaderboards connect players across servers, which keeps the hub busy.
**Steal:** Test cross-server features (mail, global leaderboards, messaging) in the test experience with Studio API access, then in Team Test, never with live data (rules 18, 34, 36).
**Avoid:** "Mailbox tested" from a single Studio session that never sent anything across servers.

### Progression gates need test fixtures
**Game:** Bee Swarm Simulator ([33], [41])
**Shows:** The Basic Bee Gate needs 5 bees and the Ant Gate needs 20.
**Why it works:** Requirement-named gates make progress concrete.
**Steal:** Studio-only debug commands (rule 35) that set a profile to "just under" and "just over" each gate, so Playtest can check both sides of every gate in minutes.
**Avoid:** Testing gates by grinding, which means late gates never get tested.

### Portals need streaming-aware tests
**Game:** Bee Swarm Simulator ([34])
**Shows:** The Hive Hub sits inside the Hive Hub Portal past the Ant Gate.
**Why it works:** Portals make special areas feel like destinations.
**Steal:** Every portal is in the streaming test (rule 33): use it from a fresh join and check the destination streams in (the server calls `RequestStreamAroundAsync` before moving the player).
**Avoid:** Portals that drop players into an empty void for a second while content streams.

### Stuck timers need fast-forward testing
**Game:** Doors ([35])
**Shows:** If a player is stuck in a Dark Room for more than 20 seconds, Guiding Light lights up the next door.
**Why it works:** Adaptive help rescues stuck players without spoiling the room for others.
**Steal:** Put every timer like this in Config with a Studio-only time scale, and test the "stuck" path deliberately in the playtest matrix.
**Avoid:** Help systems that only trigger in conditions nobody tests.

### New floors as staged content
**Game:** Doors ([35], [36])
**Shows:** Doors has separate floors, including the Hotel and The Mines, with the same guide entity appearing in both.
**Why it works:** Each floor is big new content that reuses the game's core systems.
**Steal:** Build big updates as staged tasks (rule 53) and shared systems as packages or shared modules, so a new floor doesn't fork the code.
**Avoid:** Copying the whole place to make a new floor and maintaining two versions of every system.

### World changes driven by state need both views
**Game:** 99 Nights in the Forest ([37])
**Shows:** Guides say upgrading the campfire expands the map, revealing more areas.
**Why it works:** Shared progress visibly changes the world for the whole group.
**Steal:** Test state-driven world changes with a Local Server and 2-3 clients, checking the server view (rule 30) and a player who joins after the upgrade.
**Avoid:** World changes that only happen on the client of the player who triggered them.

### Multiple endings need save fixtures
**Game:** 99 Nights in the Forest ([38])
**Shows:** Guides cover the game's different endings.
**Why it works:** Endings give a long session a goal and give players reasons to replay.
**Steal:** Debug fixtures that jump to the state just before each ending, so every branch gets tested before each update.
**Avoid:** Endings that break silently because nobody reaches them in testing.

### Round systems need soak tests and forced maps
**Game:** Natural Disaster Survival ([39])
**Shows:** The lobby has miniature models of maps, and a guide notes that in a public server you have to wait until each map comes up as a round location.
**Why it works:** Rotation keeps rounds fresh.
**Steal:** A Studio-only "force map" debug command and a 10-minute Run soak (rule 28) that cycles every map, so each one is tested every update.
**Avoid:** Maps that only get tested when they happen to come up.

### Platform changes arrive through Studio betas
**Game:** Every Roblox game, during the Unified Lighting rollout ([2], [4], [5])
**Shows:** Unified Lighting started as a Studio beta in January 2025, with live experiences unaffected, and went fully live in July 2025 while preserving existing experiences' looks.
**Why it works:** Roblox gives creators a window to test big engine changes.
**Steal:** Watch announcements, try relevant betas in the test copy (rule 10), and update the vault when defaults change.
**Avoid:** Learning about an engine change from player complaints.

### Learning from Roblox's sample places
**Game:** Roblox's Environmental Art sample places ([16], [17], [18])
**Shows:** Roblox publishes sample places for each stage of its environmental art curriculum, including an asset library and the constructed world.
**Why it works:** Opening a finished, well-organized place shows how assets, folders and libraries are laid out.
**Steal:** Open the sample places in Studio and copy the organization patterns (asset library place, kits), not the art.
**Avoid:** Inventing a new folder structure per game.

## By genre

**Simulator.** Test fixtures for every zone gate and egg, a time-scale debug for timers, a 10-minute memory soak with many collectibles, and Local Server tests with 4+ clients collecting in the same field. Zone kits as packages.

**Tycoon.** Local Server tests with 2-4 clients claiming plots at once, rejoin tests for plot saving, a debug command to fill a plot to each stage, and a performance soak with all plots fully built.

**Obby.** A debug command to jump to any stage, a test of every checkpoint from a fresh join, phone tests of every jump in the Device Emulator plus a real phone, and Output checks for kill-brick scripts at scale.

**Roleplay and life sim.** Local Server with 6-8 clients for houses, vehicles and jobs, permission tests (who can enter which house), streaming walks across the whole town, and Player Emulator checks for chat and text features.

**Action and combat.** Two-client hit tests from both sides, bad-input tests on combat remotes, MicroProfiler during big fights, and Script Profiler on hit detection.

**Battlegrounds.** 8-client Local Server fights for effect budgets, ability cooldown tests with fixtures, and memory soaks after 20 rounds.

**Survival.** Run soaks of the day/night cycle and creature spawning, time-scale debug, fixtures for each base level, and 3-client tests of shared base upgrades.

**Horror.** Stuck-timer tests, fixtures to jump to each room or floor, darkness checks at low graphics quality, and audio checks on real devices.

**Tower defense.** Run soaks of full waves, fixtures for late waves, Script Profiler on targeting, and 4-client co-op tests.

**RNG and collection.** Fixtures for rare results (forced roll outcomes, Studio only), Studio test purchases of roll products, and data tests of large inventories in the test experience.

**Shooter.** Two-client hit registration tests, network checks for frequent remotes, and MicroProfiler with many projectiles.

**Racing.** Streaming tests at top speed, checkpoint tests, physics profiling with many cars, and a real-phone frame test.

**Sports.** 4-8 client matches, ball ownership and physics tests from both sides, and score sync checks on the server view.

**Party and social hangout.** Minigame rotation soaks with forced picks, 8-client tests, and multi-place teleports in Team Test.

**Story and puzzle.** Fixtures for every chapter start and ending, puzzle state saves tested by rejoining, and cutscene skip tests.

**Farming and fishing.** Time-scale debug for growth timers, fixtures for each biome and rod tier, and restock timer tests ([30]).

## Luau

### Safe-edit wrapper (command bar or MCP code)

```lua
-- Edit mode. Run a change as one named undo step. Falls back to a waypoint if recording isn't available.
local ChangeHistoryService = game:GetService("ChangeHistoryService")

local function safeEdit(name: string, change: () -> string)
	local ok, recording = pcall(function()
		return ChangeHistoryService:TryBeginRecording(name)
	end)
	local id = if ok then recording else nil
	local success, result = pcall(change)
	if id then
		ChangeHistoryService:FinishRecording(id,
			if success then Enum.FinishRecordingOperation.Commit else Enum.FinishRecordingOperation.Cancel)
	else
		ChangeHistoryService:SetWaypoint(name)
	end
	if success then
		print("[" .. name .. "] " .. tostring(result))
	else
		warn("[" .. name .. "] failed: " .. tostring(result))
	end
end

safeEdit("Create SoundGroups", function()
	local SoundService = game:GetService("SoundService")
	local created = 0
	for groupName, volume in { Music = 0.35, SFX = 0.6, UI = 0.5, Ambient = 0.4 } do
		if not SoundService:FindFirstChild(groupName) then
			local group = Instance.new("SoundGroup")
			group.Name = groupName
			group.Volume = volume
			group.Parent = SoundService -- parent last
			created += 1
		end
	end
	return ("created %d, already present %d"):format(created, 4 - created)
end)
```

### Read-only tree inspector

```lua
-- READ ONLY. Prints a compact tree with class names and child counts, to a depth.
local function inspect(root: Instance, maxDepth: number)
	local lines = {}
	local function walk(inst: Instance, depth: number)
		local children = inst:GetChildren()
		table.insert(lines, ("%s%s [%s]%s"):format(string.rep("  ", depth), inst.Name, inst.ClassName,
			#children > 0 and (" (" .. #children .. ")") or ""))
		if depth < maxDepth then
			table.sort(children, function(a, b) return a.Name < b.Name end)
			for _, child in children do walk(child, depth + 1) end
		end
	end
	walk(root, 0)
	print(table.concat(lines, "\n"))
end

inspect(game:GetService("ServerScriptService"), 2)
inspect(game:GetService("ReplicatedStorage"), 2)
```

### Studio-only debug commands (server)

```lua
--!strict
-- ServerScriptService/Services/DebugService (ModuleScript). Exists only in Studio sessions (rule 35).
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Config = require(ReplicatedStorage.Shared.Config)
local PlayerData = require(script.Parent.PlayerData) -- your data service

local DebugService = {}

local COMMANDS: { [string]: (player: Player, arg: string?) -> () } = {
	coins = function(player, arg)
		local data = PlayerData.Get(player)
		local amount = tonumber(arg or "")
		if data and amount and amount == amount and amount >= 0 and amount <= 1e12 then
			data.Coins = math.floor(amount)
		end
	end,
	stage = function(player, arg)
		local data = PlayerData.Get(player)
		local stage = tonumber(arg or "")
		if data and stage then data.Stage = math.clamp(math.floor(stage), 0, 10000) end
	end,
	timescale = function(_player, arg)
		local scale = tonumber(arg or "")
		if scale then Config.Debug.TimeScale = math.clamp(scale, 0.1, 100) end
	end,
}

function DebugService.Start()
	if not RunService:IsStudio() then return end -- never active on live servers
	local remote = Instance.new("RemoteEvent")
	remote.Name = "DebugCommand"
	remote.Parent = ReplicatedStorage:WaitForChild("Remotes") -- created at runtime, Studio only
	remote.OnServerEvent:Connect(function(player: Player, command: unknown, arg: unknown)
		if typeof(command) ~= "string" then return end
		if arg ~= nil and typeof(arg) ~= "string" then return end
		local handler = COMMANDS[command]
		if handler then
			handler(player, arg :: string?)
			print(("[Debug] %s ran %s %s"):format(player.Name, command, tostring(arg)))
		end
	end)
	print("[Debug] DebugService active (Studio only). Players:", #Players:GetPlayers())
end

return DebugService
```

### Studio-safe DataStore names and the time scale

```lua
--!strict
-- In ReplicatedStorage.Shared.Config (excerpt). Studio sessions use separate store names and may speed timers.
local RunService = game:GetService("RunService")
local IS_STUDIO = RunService:IsStudio()

local Config = {}
Config.Data = {
	-- Studio tests write to TEST_ stores so they never touch real player data (rule 18).
	StoreName = (if IS_STUDIO then "TEST_" else "") .. "PlayerData_v1",
}
Config.Debug = {
	TimeScale = 1, -- DebugService may raise this in Studio only
	Logging = IS_STUDIO,
}
return Config
```

```lua
--!strict
-- A server timer that respects the debug time scale (for example, a 5-minute shop restock).
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local RESTOCK_SECONDS = 300

local elapsed = 0
local function step(dt: number): boolean
	elapsed += dt * Config.Debug.TimeScale
	if elapsed >= RESTOCK_SECONDS then
		elapsed -= RESTOCK_SECONDS
		return true -- restock now
	end
	return false
end

return step
```

### Profiler labels and a gated logger

```lua
--!strict
-- ReplicatedStorage.Shared.Log (ModuleScript). Debug logs only when Config.Debug.Logging is on.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Log = {}

function Log.debug(tag: string, ...: any)
	if Config.Debug.Logging then print("[" .. tag .. "]", ...) end
end

function Log.warn(tag: string, ...: any)
	warn("[" .. tag .. "]", ...)
end

-- Wrap expensive work so it shows by name in the MicroProfiler (rule 42).
function Log.profile<T...>(label: string, fn: (T...) -> (), ...: T...)
	debug.profilebegin(label)
	fn(...)
	debug.profileend()
end

return Log
```

### Pre-publish audit (command bar)

```lua
-- READ ONLY. Run before Producer's final gate. Every FAIL must be fixed or explained in decisions.md.
local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local fails, warnings = 0, 0
local function fail(msg: string) fails += 1; warn("FAIL: " .. msg) end
local function note(msg: string) warnings += 1; print("WARN: " .. msg) end

if HttpService.HttpEnabled then note("HTTP requests are enabled; must be in decisions.md") end
if ServerScriptService.LoadStringEnabled then fail("LoadStringEnabled is on") end
if not workspace.StreamingEnabled then note("StreamingEnabled is off") end
local remotes = ReplicatedStorage:FindFirstChild("Remotes")
if remotes and remotes:FindFirstChild("DebugCommand") then fail("DebugCommand remote saved in the place") end

local PATTERNS = {
	{ "require%s*%(%s*%d", "require by asset id" },
	{ "loadstring", "loadstring" },
	{ "getfenv", "getfenv" }, { "setfenv", "setfenv" },
	{ "%f[%w_]wait%s*%(", "deprecated wait()" },
	{ "%f[%w_]spawn%s*%(", "deprecated spawn()" },
	{ "%f[%w_]delay%s*%(", "deprecated delay()" },
}
for _, d in game:GetDescendants() do
	local ok, isScript = pcall(function() return d:IsA("LuaSourceContainer") end)
	if ok and isScript then
		local readable, src = pcall(function() return (d :: any).Source end)
		if readable and type(src) == "string" then
			-- strip `task.wait(`, `task.spawn(` and `task.delay(` before checking the deprecated globals
			local stripped = src:gsub("task%.wait", "TASKWAIT"):gsub("task%.spawn", "TASKSPAWN"):gsub("task%.delay", "TASKDELAY")
			for _, p in PATTERNS do
				if string.find(stripped, p[1]) then
					if p[2]:find("deprecated") then note(p[2] .. " in " .. d:GetFullName())
					else fail(p[2] .. " in " .. d:GetFullName()) end
				end
			end
		end
	end
end

for _, child in workspace:GetChildren() do
	if not (child:IsA("Camera") or child:IsA("Terrain") or child.Name == "Map") then
		note("Unexpected top-level Workspace child: " .. child:GetFullName())
	end
end

print(("Pre-publish audit: %d FAIL, %d WARN"):format(fails, warnings))
```

Runtime folders (Drops, NPCs) created by code won't exist in edit mode, so anything the audit lists at the top of Workspace is a leftover. Core and plugin scripts that Studio can't read are skipped by the `pcall`.

## Checklist

- [ ] Studio MCP tools were listed at the start of the task, or their absence was reported.
- [ ] The Studio lock was held for every write; read-only work made no changes.
- [ ] The tree and scripts were inspected before changes, with the place version noted.
- [ ] Bulk edits were recorded as named undo steps; a local backup exists for risky ones.
- [ ] Only the agent's own area was changed; cross-area needs became tasks.
- [ ] Script drafts are committed and package changes are published or reverted.
- [ ] Rojo mode is written in `plan.md`, and no Rojo-managed script was edited in Studio.
- [ ] Script Analysis shows 0 errors and 0 warnings in changed files.
- [ ] The feature was tested with Play from a fresh join (not only Play Here).
- [ ] Multiplayer features were tested in a Local Server with 2+ clients, including a leave mid-action.
- [ ] Server-owned values were checked in the Server view.
- [ ] UI and world changes were checked in the Device Emulator (2 phones, tablet, both orientations).
- [ ] Streaming test done: fresh joins at 3 spots, far walks, every portal, no infinite yields.
- [ ] Studio-limited features (purchases, teleports, DataStores) were tested the real way or listed as untested.
- [ ] Output was clean at the end of the test and attached as evidence.
- [ ] Performance numbers (frame time, top scripts, memory soak) are in the report for performance-sensitive changes.
- [ ] DebugService only activates in Studio; no DebugCommand remote is saved in the place.
- [ ] Studio tests use TEST_ DataStore names or the test experience.
- [ ] Security settings match `decisions.md`.
- [ ] The pre-publish audit passes with 0 FAIL.
- [ ] The publishing checklist is complete and sent to the owner; no agent published.
- [ ] No API key appears in any file, place or handoff.
- [ ] The handoff is under 150 words with paths, evidence, open items and next owner.

## Common mistakes

- Writing to the place without holding the Studio lock.
- Claiming a change was made or tested when no Studio tool was called.
- Editing another agent's area because it was faster.
- Editing a Rojo-managed script in Studio and losing it on the next sync.
- A first Rojo sync that deletes Studio-made UI or Remotes.
- Leaving script drafts uncommitted or package copies modified and unpublished.
- Bulk edits with no undo step and no backup.
- Renaming a remote without finding every reference.
- Testing only with Play Solo or Play Here.
- Never checking the Server view, so client-only "successes" ship.
- No Device Emulator check, so buttons sit under the jump button.
- Testing streaming-sensitive code from the spawn only.
- Running data experiments against the live experience's DataStores.
- Treating a Studio test purchase or a failed teleport as proof the real thing works.
- Shipping a debug remote or a debug time scale.
- Wrapping errors in `pcall` instead of fixing them.
- Leaving dozens of debug prints and warnings in Output.
- Optimizing without profiling, or profiling only on a desktop.
- An agent pressing Publish, creating a game pass or changing security settings.
- API keys pasted into files or chat.
- Two humans and an agent editing the same area at the same time.

## References

Research note: the session's shared web search limit ran out before this page's own searches, so it reuses sources found while researching [[06 World and Look]]. Most Studio panel, Team Create, packages, Rojo, MCP, playtesting, profiler, publishing and Open Cloud specifics are written from the crew's working knowledge without a citation. Verify menu paths in the current Studio and add citations in a later research pass.

[1] Post-processing effects — https://create.roblox.com/docs/environment/post-processing-effects — some effects need Studio's Editor Quality Level at the highest to show.
[2] Let There Be (Unified) Light! Unified Lighting is Fully Live — https://devforum.roblox.com/t/let-there-be-unified-light-unified-lighting-is-fully-live/3401512 — the July 2025 release; existing experiences' looks preserved.
[3] Unified Lighting Beta: "ShadowSoftness" does not appear when LightingStyle is Soft — https://devforum.roblox.com/t/unified-lighting-beta-shadowsoftness-lighting-property-does-not-appear-when-lightingstyle-is-set-to-soft/3509181 — a property hidden in the Properties panel but still settable by script.
[4] Bloxy News on Unified Lighting in Studio — https://x.com/Bloxy_News/status/1881791225822327102 — the January 2025 Studio beta; live experiences unaffected until release.
[5] Bloxy News on Threads: Unified Lighting replaces Technology — https://www.threads.com/@bloxy.news/post/DFGZz6FSJCW?hl=en — the two new properties that replaced Technology.
[6] Future Is Bright: Phase 3 - Studio Beta — https://devforum.roblox.com/t/future-is-bright-phase-3-studio-beta/639903 — an earlier engine feature shipped as a Studio beta first.
[7] Lighting class reference — https://create.roblox.com/docs/reference/engine/classes/Lighting — deprecation tags in the API reference.
[8] Technology enum — https://create.roblox.com/docs/reference/engine/enums/Technology — a deprecated enum documented with its replacement advice.
[9] Technology enum (robloxapi.github.io) — https://robloxapi.github.io/ref/enum/Technology.html — community reference noting what superseded it.
[10] Lighting (robloxapi.github.io, ref-temp) — https://robloxapi.github.io/ref-temp/class/Lighting.html — a changelog of added and removed API members.
[11] Better Technology Documentation — https://devforum.roblox.com/t/better-technology-documentation/1178930 — developers asking for clearer engine documentation.
[12] Instance streaming — https://create.roblox.com/docs/en-us/workspace/streaming — streaming is on by default for new places and can't be set from scripts.
[13] Streaming techniques — https://create.roblox.com/docs/en-us/workspace/streaming/techniques.md — client code patterns for streamed content.
[14] Greybox a playable area — https://create.roblox.com/docs/tutorials/curriculums/core/building/greybox-a-playable-area — Studio's part tools for greyboxing, including negate and union.
[15] Customize global lighting (core curriculum) — https://create.roblox.com/docs/tutorials/curriculums/core/building/customize-global-lighting — working with Lighting properties in Studio.
[16] Environmental art curriculum — https://create.roblox.com/docs/tutorials/curriculums/environmental-art — a staged production workflow with sample places.
[17] Environmental Art: Assemble an Asset Library (sample place) — https://www.roblox.com/games/14447787049/Environmental-Art-Assemble-an-Asset-Library — a sample asset library place.
[18] Environmental Art: Construct Your World (sample place) — https://www.roblox.com/games/14447826396/Environmental-Art-Construct-Your-World — the finished sample world.
[19] Creator Hub tutorials index — https://create.roblox.com/docs/tutorials.md — the list of official tutorials and curricula.
[20] Materials — https://create.roblox.com/docs/en-us/parts/materials.md — the Material Manager for editing custom materials.
[21] MaterialVariant — https://create.roblox.com/docs/en-us/reference/engine/classes/MaterialVariant — MaterialVariants live under MaterialService.
[22] PBR textures (SurfaceAppearance guide) — https://create.roblox.com/docs/en-us/art/modeling/surface-appearance.md — entering asset ids for maps in the Properties window.
[23] SurfaceAppearance (robloxapi.github.io) — https://robloxapi.github.io/ref-temp/class/SurfaceAppearance.html — plugin-security properties that Studio tools can set and game scripts can't.
[24] SurfaceAppearance class — https://create.roblox.com/docs/en-us/reference/engine/classes/SurfaceAppearance — appearance varies with device and graphics quality; preview at different settings.
[25] Should I Restrict Game to R15? — https://devforum.roblox.com/t/should-i-restrict-game-to-r15/450516 — custom avatar scaling can be turned off in the experience settings.
[26] SpawnLocation — https://create.roblox.com/docs/reference/engine/classes/SpawnLocation — how players spawn, which Play tests and Play Here skips.
[27] Global lighting — https://create.roblox.com/docs/environment/lighting — lighting quality and view distance scale down with rendering quality.
[28] Enhance indoor environments — https://create.roblox.com/docs/tutorials/use-case-tutorials/lighting/enhance-indoor-environments — Studio starts new games on Soft lighting.
[29] Where to find the Gear Shop in Grow a Garden — https://esports.gg/news/roblox/where-to-find-the-gear-shop-in-grow-a-garden — a key building that sometimes doesn't appear; restarting suggested.
[30] Grow a Garden Seed Shop and Gear Shop stock explained — https://deltiasgaming.com/?p=207402 — the five-minute restock.
[31] Pet Simulator 99 areas (bloxodes wiki) — https://bloxodes.com/wiki/pet-simulator-99/areas — Spawn hub with shop, mailbox and leaderboards.
[32] All areas in Pet Simulator 99 — https://progameguides.com/roblox/all-areas-in-pet-simulator-99-roblox/ — 99 areas as of that guide's update.
[33] Basic Bee Gate (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Basic_Bee_Gate — the 5-bee gate.
[34] Hive Hub (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Hive_Hub — an area reached through a portal.
[35] Roblox DOORS Walkthrough – All Monsters and How to Survive Them — https://progameguides.com/roblox/roblox-doors-walkthrough-all-monsters-and-how-to-survive-them/ — Guiding Light's 20-second stuck rule.
[36] The Mines (DOORS Wiki) — https://doors-game.fandom.com/wiki/The_Mines — a separate floor in Doors.
[37] 99 Nights in the Forest beginner's guide — https://www.theclick.gg/99-nights-in-the-forest-beginners-guide/ — campfire upgrades expand the map.
[38] All Endings in 99 Nights in the Forest — https://deltiasgaming.com/?p=290974 — the game's multiple endings.
[39] Natural Disaster Survival Mega Token guide — https://dotesports.com/roblox/news/natural-disaster-survival-mega-token-guide-the-hunt-mega-edition — lobby map models and waiting for maps to rotate in.
[40] Pet Simulator 99 biomes (GINX) — https://www.ginx.tv/en/?p=58506 — many biomes split across several worlds.
[41] Ant Gate (Bee Swarm Simulator Wiki) — https://bee-swarm-simulator.fandom.com/wiki/Ant_Gate — the 20-bee gate.

Related: [[00 Start Here]] · [[00 For Any AI]] · [[01 The First Five Minutes]] · [[05 UI and HUD]] · [[06 World and Look]] · [[07 Characters, VFX and Assets]] · [[08 Mobile]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[11 Thumbnails, Icons and the Store Page]] · [[12 Live Ops and Launch]] · [[13 Building It Right]] · [[15 Discovery and Growth]]
