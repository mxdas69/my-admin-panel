// A small JSON store. The server is the only writer. Saves are batched, flushed to disk
// (fsync) before an atomic rename, and the previous good copy is kept as a backup, so a
// crash or power cut loses at most the last fraction of a second.

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
    for (const candidate of [file, `${file}.bak`, `${file}.tmp`]) {
      if (!fs.existsSync(candidate)) continue;
      try {
        this.data = { ...EMPTY(), ...JSON.parse(fs.readFileSync(candidate, "utf8")) };
        if (candidate !== file) console.error(`[rocrew] ${path.basename(file)} was missing or damaged; recovered from ${path.basename(candidate)}`);
        return;
      } catch (err) {
        const broken = `${candidate}.broken-${Date.now()}`;
        fs.copyFileSync(candidate, broken);
        console.error(`[rocrew] could not read ${candidate} (${err.message}); kept a copy at ${broken}`);
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
    const fd = fs.openSync(tmp, "w");
    try {
      fs.writeSync(fd, JSON.stringify(this.data, null, 1));
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    if (fs.existsSync(this.file)) fs.renameSync(this.file, `${this.file}.bak`);
    fs.renameSync(tmp, this.file);
  }
}
