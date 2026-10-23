// A small JSON store. The server is the only writer; saves are atomic
// (write to a temp file, then rename) and batched.

import fs from "node:fs";
import path from "node:path";

const EMPTY = () => ({
  version: 1,
  seq: 0,
  paused: false,
  autoRounds: 0,
  games: [],
  tasks: [],
  messages: [],
  reviews: [],
  asks: [],
  pitches: [],
  feed: [],
  library: { assets: [], systems: [] },
  market: { snapshots: [], corpus: [], details: {}, error: null, fetchedAt: null },
  agents: {},
  mcpServers: [],
});

const LIMITS = { messages: 4000, feed: 400 };

export class Store {
  constructor(file) {
    this.file = file;
    this.timer = null;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.data = EMPTY();
    if (fs.existsSync(file)) {
      try {
        this.data = { ...EMPTY(), ...JSON.parse(fs.readFileSync(file, "utf8")) };
      } catch (err) {
        const backup = `${file}.broken-${Date.now()}`;
        fs.copyFileSync(file, backup);
        console.error(`[rocrew] could not read ${file} (${err.message}); saved a copy to ${backup} and started fresh`);
      }
    }
  }

  id(prefix) {
    this.data.seq += 1;
    return `${prefix}${this.data.seq.toString(36)}`;
  }

  agent(id) {
    if (!this.data.agents[id]) this.data.agents[id] = { sessionId: null, verdicts: [], lastActiveAt: null };
    return this.data.agents[id];
  }

  push(listName, item) {
    const list = this.data[listName];
    list.push(item);
    const limit = LIMITS[listName];
    if (limit && list.length > limit) list.splice(0, list.length - limit);
    this.save();
    return item;
  }

  save() {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), 250);
  }

  flush() {
    clearTimeout(this.timer);
    this.timer = null;
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 1));
    fs.renameSync(tmp, this.file);
  }
}
