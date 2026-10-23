// The message line between two paired RoCrew apps (yours and your friend's), so one can
// tell the other "Remote Control is on, here's how to join" even across different houses.
//
// Messages go through a public ntfy relay (https://ntfy.sh by default, or your own), on a
// topic derived from the pair code. Every message is encrypted and signed with a key from
// the same code (AES-256-GCM), so the relay and anyone watching the topic see only noise,
// and forged or replayed messages are dropped.

import { createHash, createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const MAX_AGE_MS = 15 * 60000;

/** A new pair code, e.g. "RC-7F3K-9QXW-M2TD-H8PL-4NBA" (100 random bits). */
export function newPairCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(20);
  const chars = [...bytes].map((b) => alphabet[b % 32]).join("");
  return `RC-${chars.match(/.{4}/g).join("-")}`;
}

export function normalizeCode(code) {
  const clean = String(code ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/^RC/, "");
  if (clean.length < 16) throw new Error("That pair code is too short. Copy the whole code, like RC-7F3K-9QXW-….");
  return clean;
}

export function keysFor(code) {
  const secret = normalizeCode(code);
  return {
    topic: `rocrew-${createHash("sha256").update(`topic:${secret}`).digest("hex").slice(0, 32)}`,
    key: Buffer.from(hkdfSync("sha256", secret, "rocrew-remote-control", "message-key", 32)),
  };
}

export function seal(key, obj) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

export function unseal(key, text) {
  const raw = Buffer.from(String(text), "base64");
  if (raw.length < 29) throw new Error("too short");
  const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8"));
}

export class Relay {
  /**
   * @param {object} o
   * @param {string} o.relayUrl   e.g. https://ntfy.sh
   * @param {string} o.code       the pair code both apps share
   * @param {string} o.me         this app's instance id (its own messages are ignored)
   * @param {(msg: object) => void} o.onMessage
   * @param {(status: string) => void} [o.onStatus]
   */
  constructor({ relayUrl, code, me, onMessage, onStatus, fetchImpl = fetch }) {
    this.base = relayUrl.replace(/\/+$/, "");
    Object.assign(this, keysFor(code));
    this.me = me;
    this.onMessage = onMessage;
    this.onStatus = onStatus ?? (() => {});
    this.fetch = fetchImpl;
    this.seen = new Set();
    this.stopped = false;
    this.lastId = null;
    this.controller = null;
  }

  async send(obj) {
    const msg = { ...obj, sender: this.me, at: Date.now(), nonce: randomBytes(9).toString("base64") };
    const res = await this.fetch(`${this.base}/${this.topic}`, { method: "POST", body: seal(this.key, msg), headers: { "x-title": "RoCrew" } });
    if (!res.ok) throw new Error(`The relay refused the message (HTTP ${res.status}).`);
  }

  /** Handle one line of the relay's JSON stream. Exposed for tests. */
  handleLine(line) {
    if (!line.trim()) return;
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      return;
    }
    if (ev.event !== "message" || typeof ev.message !== "string") return;
    if (ev.id) this.lastId = ev.id;
    let msg;
    try {
      msg = unseal(this.key, ev.message);
    } catch {
      return; // not ours, or tampered with
    }
    if (!msg || msg.sender === this.me || typeof msg.at !== "number") return;
    if (Math.abs(Date.now() - msg.at) > MAX_AGE_MS) return;
    if (this.seen.has(msg.nonce)) return;
    this.seen.add(msg.nonce);
    if (this.seen.size > 500) this.seen = new Set([...this.seen].slice(-250));
    this.onMessage(msg);
  }

  /** Listen for the partner's messages, reconnecting until stop(). */
  async listen() {
    let delay = 2000;
    while (!this.stopped) {
      this.controller = new AbortController();
      try {
        const since = this.lastId ?? "15m";
        const res = await this.fetch(`${this.base}/${this.topic}/json?since=${encodeURIComponent(since)}`, { signal: this.controller.signal });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        this.onStatus("connected");
        delay = 2000;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) this.handleLine(line);
        }
      } catch (err) {
        if (this.stopped) break;
        this.onStatus(`reconnecting (${err.cause?.code ?? err.message})`);
      }
      if (this.stopped) break;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 60000);
    }
  }

  stop() {
    this.stopped = true;
    this.controller?.abort();
  }
}
