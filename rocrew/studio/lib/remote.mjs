// Remote Control: let your paired friend watch and drive your studio live.
//
// You turn it on → this app opens a tunnel, makes a one-time key for your friend, and sends
// them an encrypted request over the relay. Their app pops up "<you> turned on Remote
// Control — Join?". Joining takes them straight to your Lead chat, running on your PC, where
// they see everything as it happens and can do anything except change your Settings.
// Turning it off closes the tunnel and kills the key; turning it on again sends a new request.

import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { randomBytes } from "node:crypto";
import { Relay, newPairCode, normalizeCode } from "./relay.mjs";
import { Tunnel } from "./tunnel.mjs";

export class RemoteControl extends EventEmitter {
  /**
   * @param {object} o
   * @param {string} o.file        where the pairing is saved (.rocrew/remote.json; agents can't read it)
   * @param {string} o.binDir      where the tunnel helper is downloaded
   * @param {() => number} o.port
   * @param {() => string} o.ownerName
   * @param {{ add(name: string): {id: string, token: string}, remove(id: string): void }} o.guests
   */
  constructor({ file, binDir, port, ownerName, guests, relayUrl = null, relayFactory = (opts) => new Relay(opts), tunnel = new Tunnel({ binDir }) }) {
    super();
    this.file = file;
    this.port = port;
    this.ownerName = ownerName;
    this.guests = guests;
    this.relayFactory = relayFactory;
    this.tunnel = tunnel;
    this.tunnel.onExit = () => this.setSharing({ status: "error", error: "The tunnel dropped. Turn Remote Control off and on to send a new request." });
    this.state = { code: "", partnerName: "", me: randomBytes(8).toString("hex"), relayUrl: "https://ntfy.sh", answered: [] };
    try {
      Object.assign(this.state, JSON.parse(fs.readFileSync(file, "utf8")));
    } catch {}
    if (relayUrl) this.state.relayUrl = relayUrl;
    this.sharing = { on: false, status: "off" };
    this.invite = null;
    this.relayStatus = "off";
    this.relay = null;
    if (this.state.code) this.connect();
  }

  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.state, null, 2), { mode: 0o600 });
  }

  changed() {
    this.emit("change");
  }

  connect() {
    this.relay?.stop();
    this.relay = this.relayFactory({
      relayUrl: this.state.relayUrl,
      code: this.state.code,
      me: this.state.me,
      onMessage: (m) => this.onMessage(m),
      onStatus: (s) => {
        this.relayStatus = s;
        this.changed();
      },
    });
    this.relay.listen?.();
  }

  // ---------- pairing ----------

  createCode() {
    this.state.code = newPairCode();
    this.state.partnerName = "";
    this.save();
    this.connect();
    this.changed();
    return this.state.code;
  }

  async pair(code) {
    normalizeCode(code); // throws a friendly error on a bad code
    this.state.code = String(code).trim().toUpperCase();
    this.state.partnerName = "";
    this.save();
    this.connect();
    await this.relay.send({ type: "hello", name: this.ownerName() || "Your friend" });
    this.changed();
  }

  unpair() {
    this.share(false).catch(() => {});
    this.relay?.stop();
    this.relay = null;
    this.relayStatus = "off";
    this.state.code = "";
    this.state.partnerName = "";
    this.invite = null;
    this.save();
    this.changed();
  }

  setRelayUrl(url) {
    if (!/^https?:\/\/[^\s/]+/.test(url ?? "")) throw new Error("The relay address must start with https://");
    this.state.relayUrl = url.replace(/\/+$/, "");
    this.save();
    if (this.state.code) this.connect();
  }

  // ---------- sharing my studio ----------

  setSharing(patch) {
    this.sharing = { ...this.sharing, ...patch };
    this.changed();
  }

  async share(on) {
    if (!on) {
      const was = this.sharing;
      this.tunnel.stop();
      if (was.guestId) this.guests.remove(was.guestId);
      this.sharing = { on: false, status: "off" };
      if (was.on && was.session && this.relay) await this.relay.send({ type: "end", session: was.session }).catch(() => {});
      this.changed();
      return this.view(true);
    }
    if (!this.state.code) throw new Error("Pair with your friend first.");
    if (this.sharing.on) await this.share(false);
    const session = randomBytes(6).toString("hex");
    this.sharing = { on: true, status: "starting", session, error: null };
    this.changed();
    try {
      const url = await this.tunnel.start(this.port());
      if (!this.sharing.on || this.sharing.session !== session) return this.view(true);
      const guest = this.guests.add(this.state.partnerName || "Your friend");
      this.sharing.guestId = guest.id;
      await this.relay.send({ type: "invite", session, name: this.ownerName() || "Your friend", url, key: guest.token });
      this.setSharing({ status: "sent", url, sentAt: Date.now() });
    } catch (err) {
      this.tunnel.stop();
      if (this.sharing.guestId) this.guests.remove(this.sharing.guestId);
      this.setSharing({ status: "error", error: err.message, code: err.code ?? null, guestId: null });
    }
    return this.view(true);
  }

  async installTunnel() {
    this.setSharing({ installing: true });
    try {
      await this.tunnel.install();
    } finally {
      this.setSharing({ installing: false });
    }
  }

  /** Called when the guest's key is used, so the owner sees "joined" even if the relay is slow. */
  guestSeen(guestId) {
    if (this.sharing.on && this.sharing.guestId === guestId && this.sharing.status === "sent") this.setSharing({ status: "joined", joinedAt: Date.now() });
  }

  // ---------- requests from my friend ----------

  onMessage(m) {
    if (m.type === "hello") {
      const fresh = this.state.partnerName !== m.name;
      this.state.partnerName = String(m.name ?? "").slice(0, 40);
      this.save();
      if (!m.reply) this.relay?.send({ type: "hello", name: this.ownerName() || "Your friend", reply: true }).catch(() => {});
      if (fresh) this.changed();
    } else if (m.type === "invite") {
      if (this.state.answered.includes(m.session)) return;
      if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$|^https?:\/\/[\w.-]+(:\d+)?$/.test(m.url ?? "") || !/^[0-9a-f]{20,}$/.test(m.key ?? "")) return;
      if (m.name) this.state.partnerName = String(m.name).slice(0, 40);
      this.invite = { session: m.session, name: this.state.partnerName || "Your friend", url: m.url, key: m.key, at: m.at };
      this.changed();
      this.emit("invite", this.invite);
    } else if (m.type === "end") {
      if (this.invite?.session === m.session) {
        this.invite = null;
        this.changed();
      }
    } else if (m.type === "joined") {
      if (this.sharing.on && this.sharing.session === m.session) this.setSharing({ status: "joined", joinedAt: Date.now() });
    }
  }

  /** Answer a request. Joining returns the address that opens their studio. */
  answer(session, join) {
    const inv = this.invite;
    if (!inv || inv.session !== session) throw new Error("That request has ended. Ask them to turn Remote Control off and on again.");
    this.state.answered = [...this.state.answered.slice(-50), session];
    this.save();
    this.invite = null;
    this.changed();
    if (!join) return { joined: false };
    this.relay?.send({ type: "joined", session, name: this.ownerName() || "Your friend" }).catch(() => {});
    return { joined: true, url: `${inv.url}/?key=${inv.key}` };
  }

  view(owner) {
    if (!owner) return { sharing: this.sharing.on, partnerName: this.state.partnerName };
    return {
      paired: Boolean(this.state.code),
      code: this.state.code,
      partnerName: this.state.partnerName,
      relayUrl: this.state.relayUrl,
      relayStatus: this.relayStatus,
      sharing: { on: this.sharing.on, status: this.sharing.status, error: this.sharing.error ?? null, errorCode: this.sharing.code ?? null, sentAt: this.sharing.sentAt ?? null, joinedAt: this.sharing.joinedAt ?? null, installing: Boolean(this.sharing.installing) },
      invite: this.invite ? { session: this.invite.session, name: this.invite.name, at: this.invite.at } : null,
      tunnel: { installed: Boolean(this.tunnel.find()), canInstall: this.tunnel.canInstall() },
    };
  }

  stop() {
    this.tunnel.stop();
    this.relay?.stop();
  }
}
