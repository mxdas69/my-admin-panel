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
    this.load(file);
    // Older saves kept the market inside db.json; newer ones keep it in market.json.
    if (fs.existsSync(this.marketFile)) this.loadMarket();
  }

  load(file) {
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

  /** Market data is big and changes rarely, so it lives in its own file (market.json). */
  get marketFile() {
    return path.join(path.dirname(this.file), "market.json");
  }

  loadMarket() {
    try {
      const m = JSON.parse(fs.readFileSync(this.marketFile, "utf8"));
      this.data.market = { ...EMPTY().market, ...m };
    } catch {}
  }

  saveMarket() {
    writeDurably(this.marketFile, JSON.stringify(this.data.market));
  }

  save() {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), 250);
  }

  flush() {
    clearTimeout(this.timer);
    this.timer = null;
    const { market, ...rest } = this.data;
    writeDurably(this.file, JSON.stringify(rest, null, 1), true);
  }
}

/** Write to a temp file, flush it to disk, keep the old copy as .bak, then swap it in. */
function writeDurably(file, text, backup = false) {
  const tmp = `${file}.tmp`;
  const fd = fs.openSync(tmp, "w");
  try {
    fs.writeSync(fd, text);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  if (backup && fs.existsSync(file)) fs.renameSync(file, `${file}.bak`);
  fs.renameSync(tmp, file);
}
