// The 15-agent crew. Role instructions live in .claude/agents/<id>.md;
// this file holds what the app needs to schedule and draw them.

export const AGENTS = [
  { id: "lead", name: "Lead", icon: "sparkle", color: "#c26bff", studio: false,
    blurb: "Turns your goal into tasks and keeps everyone on track.",
    detail: "Breaks your brief into tasks, assigns the right specialists, follows up on anything unfinished, and brings decisions back to you only when your input is needed." },
  { id: "pulse", name: "Pulse", icon: "pulse", color: "#a77bff", studio: false,
    blurb: "Watches the Roblox charts and pitches games that are growing.",
    detail: "Compares chart movement and competing games, then turns the strongest openings into pitches with a clear reason to build them." },
  { id: "architect", name: "Architect", icon: "compass", color: "#7b8cff", studio: false,
    blurb: "Writes the game plan before anything gets built.",
    detail: "Defines the core loop, progression and technical structure up front so every other agent builds toward the same plan." },
  { id: "librarian", name: "Librarian", icon: "library", color: "#4aa8ff", studio: true,
    blurb: "Finds and sets up models, effects and sounds.",
    detail: "Gathers the models, effects and audio the other specialists need, checks them for hidden scripts, and keeps them reusable." },
  { id: "builder", name: "Builder", icon: "hammer", color: "#22d3a6", studio: true,
    blurb: "Writes the code and wires up the game.",
    detail: "Connects the gameplay systems, implements the plan, and works through the bugs Playtest and Reviewer send back." },
  { id: "frame", name: "Frame", icon: "layout", color: "#ff5fa2", studio: true,
    blurb: "Designs the UI and makes it fit every screen.",
    detail: "Plans menus, HUDs and touch controls, and checks hierarchy, spacing and screen sizes so players always know what to do next." },
  { id: "scenic", name: "Scenic", icon: "mountain", color: "#ff8a3d", studio: true,
    blurb: "Builds the world, terrain, lighting and atmosphere.",
    detail: "Shapes the world around the game's needs: readable paths and landmarks first, then lighting, mood and a consistent look." },
  { id: "playtest", name: "Playtest", icon: "gamepad", color: "#2fd27a", studio: true,
    blurb: "Runs the game in Studio and reports what breaks.",
    detail: "Plays the game in Roblox Studio, records what fails, and hands reproducible problems back to the agents who built it." },
  { id: "kid-tester", name: "Kid Tester", icon: "smile", color: "#f5c542", studio: true,
    blurb: "Plays like a new 10-year-old.",
    detail: "Hunts for confusing goals, missed buttons and frustrating first steps, then sends concrete feedback to the right specialist." },
  { id: "balance", name: "Balance", icon: "scale", color: "#9be15d", studio: false,
    blurb: "Simulates the economy so upgrades feel right.",
    detail: "Checks reward rates, upgrade costs and pacing, and flags where players would get stuck or finish too quickly." },
  { id: "splash", name: "Splash", icon: "image", color: "#ff9f43", studio: true,
    blurb: "Makes thumbnails and icons.",
    detail: "Turns the game's hook into icon and thumbnail concepts with clear subjects and compositions that read at small sizes." },
  { id: "reviewer", name: "Reviewer", icon: "shield", color: "#8fa2ff", studio: true,
    blurb: "Checks money, saves and anything that could break before you ship.",
    detail: "Looks for risky purchase flows, data loss and fragile code, and sends issues back for fixes before the work reaches you." },
  { id: "liveops", name: "Liveops", icon: "chart", color: "#2dd4bf", studio: false,
    blurb: "Tracks player signals and plans the next update.",
    detail: "Uses player signals to find where the game needs attention, and plans updates that give players reasons to return." },
  { id: "merchant", name: "Merchant", icon: "store", color: "#ff7a59", studio: true,
    blurb: "Sets up shops, passes and developer products.",
    detail: "Plans offers, prices and shop flows around the game's economy, working with Balance and Reviewer on the details." },
  { id: "producer", name: "Producer", icon: "target", color: "#f08cff", studio: false,
    blurb: "Checks the evidence before the next stage moves ahead.",
    detail: "Checks that each stage has the required work and evidence, and sends incomplete results back before the team moves on." },
];

export const AGENT_BY_ID = new Map(AGENTS.map((a) => [a.id, a]));

export function isAgent(id) {
  return AGENT_BY_ID.has(id);
}

export function agentName(id) {
  return AGENT_BY_ID.get(id)?.name ?? id;
}
