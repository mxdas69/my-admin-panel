// The 15-agent crew. Role instructions live in .claude/agents/<id>.md;
// this file holds what the app needs to schedule and draw them.

export const AGENTS = [
  { id: "lead", name: "Lead", icon: "sparkle", color: "#c26bff", studio: false,
    blurb: "Turns your goal into tasks and keeps everyone on track." },
  { id: "pulse", name: "Pulse", icon: "pulse", color: "#a77bff", studio: false,
    blurb: "Watches the Roblox charts and pitches games that are growing." },
  { id: "architect", name: "Architect", icon: "compass", color: "#7b8cff", studio: false,
    blurb: "Writes the game plan before anything gets built." },
  { id: "librarian", name: "Librarian", icon: "library", color: "#4aa8ff", studio: true,
    blurb: "Finds and sets up models, effects and sounds." },
  { id: "builder", name: "Builder", icon: "hammer", color: "#22d3a6", studio: true,
    blurb: "Writes the code and wires up the game." },
  { id: "frame", name: "Frame", icon: "layout", color: "#ff5fa2", studio: true,
    blurb: "Designs the UI and makes it fit every screen." },
  { id: "scenic", name: "Scenic", icon: "mountain", color: "#ff8a3d", studio: true,
    blurb: "Builds the world, terrain, lighting and atmosphere." },
  { id: "playtest", name: "Playtest", icon: "gamepad", color: "#2fd27a", studio: true,
    blurb: "Runs the game in Studio and reports what breaks." },
  { id: "kid-tester", name: "Kid Tester", icon: "smile", color: "#f5c542", studio: true,
    blurb: "Plays like a new 10-year-old." },
  { id: "balance", name: "Balance", icon: "scale", color: "#9be15d", studio: false,
    blurb: "Simulates the economy so upgrades feel right." },
  { id: "splash", name: "Splash", icon: "image", color: "#ff9f43", studio: false,
    blurb: "Makes thumbnails and icons." },
  { id: "reviewer", name: "Reviewer", icon: "shield", color: "#8fa2ff", studio: true,
    blurb: "Checks money, saves and anything that could break before you ship." },
  { id: "liveops", name: "Liveops", icon: "chart", color: "#2dd4bf", studio: false,
    blurb: "Tracks player signals and plans the next update." },
  { id: "merchant", name: "Merchant", icon: "store", color: "#ff7a59", studio: true,
    blurb: "Sets up shops, passes and developer products." },
  { id: "producer", name: "Producer", icon: "target", color: "#f08cff", studio: false,
    blurb: "Checks the evidence before the next stage moves ahead." },
];

export const AGENT_BY_ID = new Map(AGENTS.map((a) => [a.id, a]));

export function isAgent(id) {
  return AGENT_BY_ID.has(id);
}

export function agentName(id) {
  return AGENT_BY_ID.get(id)?.name ?? id;
}
