import { icon } from "./icons.js";
import { esc, renderMarkdown, splitFrontmatter } from "./md.js";

const TOKEN = window.ROCREW_TOKEN;
const S = {
  state: null,
  msgs: {},
  market: null,
  vault: null,
  vaultPage: null,
  settings: null,
  files: {},
  fileView: null,
  ui: {
    reviewFilter: "pending",
    reviewAgent: "all",
    marketTab: "charts",
    sortId: null,
    libTab: "assets",
    libKind: "all",
    libQuery: "",
    gameTab: "overview",
    game: "all",
    pitchTab: "pending",
    drafts: {},
    attachments: {},
    checks: {},
    askMedia: {},
    busy: {},
  },
};

// ---------- utilities ----------

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", "x-rocrew-token": TOKEN },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

function toast(msg, isError = false) {
  const el = document.createElement("div");
  el.className = `toast${isError ? " err" : ""}`;
  el.textContent = msg;
  document.getElementById("toasts").append(el);
  setTimeout(() => el.remove(), isError ? 7000 : 3500);
}

async function attempt(fn, ok) {
  try {
    const r = await fn();
    if (ok) toast(ok);
    return r;
  } catch (err) {
    toast(err.message, true);
    return null;
  }
}

function ago(ts) {
  if (!ts) return "never";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

const fmt = (n) => (n === null || n === undefined ? "–" : Number(n).toLocaleString());
const media = (name) => `/media/${encodeURIComponent(name)}?token=${TOKEN}`;
const agents = () => S.state?.agents ?? [];
const agent = (id) => agents().find((a) => a.id === id) ?? { id, name: id === "owner" ? "You" : id, icon: "users", color: "#888" };
const status = (id) => S.state?.statuses.find((s) => s.id === id) ?? { status: "idle", queued: 0 };
const gameName = (slug) => S.state?.games.find((g) => g.slug === slug)?.name ?? slug;

/** An agent's colored icon tile. Pass link=true only where it isn't already inside a link. */
function tile(id, size = "", link = false) {
  const a = agent(id);
  const st = status(id);
  const attrs = `class="tile ${size} ${st.status}" style="--c:${a.color}" title="${esc(a.name)} — ${st.status}"`;
  return link ? `<a ${attrs} href="#/team/${a.id}">${icon(a.icon)}</a>` : `<span ${attrs}>${icon(a.icon)}</span>`;
}

function statusPill(s) {
  const map = { working: "green", queued: "blue", done: "purple", failed: "red", blocked: "amber", cancelled: "", pending: "amber", approved: "green", changes: "amber", rejected: "red", open: "amber", idle: "" };
  const label = { working: "Working now", changes: "Changes asked" }[s] ?? s[0].toUpperCase() + s.slice(1);
  return `<span class="pill ${map[s] ?? ""}">${s === "working" ? '<span class="dot live"></span>' : ""}${esc(label)}</span>`;
}

/** "You" for whoever is looking, otherwise the person's name. */
function personLabel(by) {
  const me = S.state?.me;
  const who = !by || by === "owner" ? "owner" : by;
  if (me && (me.owner ? who === "owner" : who === me.name)) return "You";
  return who === "owner" ? S.state?.owner || "Owner" : who;
}

const isOwner = () => S.state?.me?.owner !== false;

function untilText(ts) {
  if (!ts) return "";
  const m = Math.max(0, Math.round((ts - Date.now()) / 60000));
  if (m < 60) return `${m}m`;
  if (m < 48 * 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${Math.round(m / 1440)}d`;
}

function usageBars(u) {
  if (!u || (!u.fiveHour && !u.week)) return "";
  const ceiling = S.state.usageCeilingPct ?? 90;
  const bar = (label, w) =>
    w ? `<div class="usage-row"><span>${label}</span><span class="meter"><span style="width:${Math.min(100, w.pct)}%;background:${w.pct >= ceiling ? "var(--red)" : w.pct >= 70 ? "var(--amber)" : "var(--green)"}"></span></span><b>${w.pct}%</b>${w.resetsAt ? `<small class="faint">resets in ${untilText(w.resetsAt)}</small>` : ""}</div>` : "";
  return bar("5-hour", u.fiveHour) + bar("Week", u.week);
}

const counts = () => {
  const s = S.state;
  const asks = s.asks.filter((a) => a.status === "open").length;
  const reviews = s.reviews.filter((r) => r.status === "pending").length;
  const pitches = s.pitches.filter((p) => p.status === "pending").length;
  const working = s.statuses.filter((x) => x.status === "working").length;
  const queued = s.tasks.filter((t) => t.status === "queued").length;
  return { asks, reviews, pitches, needYou: asks + reviews + pitches, working, queued, open: working + queued };
};

// ---------- routing ----------

const PAGES = {};
let mountedKey = null;

function route() {
  const [page = "home", arg = ""] = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  return { page: PAGES[page] ? page : "home", arg };
}

function render(forceMount = false) {
  if (!S.state) return;
  const r = route();
  renderSidebar(r);
  renderTopbar(r);
  const el = document.getElementById("page");
  const key = `${r.page}/${r.arg}`;
  const page = PAGES[r.page];
  if (forceMount || key !== mountedKey) {
    mountedKey = key;
    el.className = `page${page.flush ? " flush" : ""}`;
    el.removeAttribute("style");
    page.mount(el, r.arg);
  } else {
    page.update?.(el, r.arg);
  }
}

window.addEventListener("hashchange", () => {
  document.getElementById("sidebar").classList.remove("open");
  render();
});

// ---------- shell ----------

function renderSidebar(r) {
  const c = counts();
  const s = S.state;
  const holder = s.studioHolder ? agent(s.studioHolder).name : null;
  const nav = (page, ic, label, count = "") =>
    `<a class="nav-item ${r.page === page ? "active" : ""}" href="#/${page}">${icon(ic)}<span>${label}</span>${count ? `<span class="count">${count}</span>` : ""}</a>`;
  const conn = s.connections;
  const studioOk = conn.studio?.status === "connected";
  document.getElementById("sidebar").innerHTML = `
    <a class="brand" href="#/home"><span class="brand-mark">${icon("sparkle")}</span><span><b>RoCrew</b><small>Your agent studio</small></span></a>
    <button class="search-btn" data-act="palette">${icon("search")}<span>Search or jump to…</span><kbd>Ctrl K</kbd></button>
    <div class="nav-label">Workspace</div>
    ${nav("home", "home", "Home", c.needYou ? `<span class="pill amber">${c.needYou}</span>` : "")}
    ${nav("lead", "sparkle", "Lead")}
    ${nav("team", "users", "Team", c.working ? `<span class="pill green"><span class="dot"></span>${c.working}</span>` : "")}
    ${nav("tasks", "tasks", "Tasks", c.open ? `<span class="pill green"><span class="dot"></span>${c.open}</span>` : "")}
    ${nav("review", "review", "Review", c.reviews ? `<span class="pill purple">${c.reviews}</span>` : "")}
    <div class="nav-label">Studio</div>
    ${nav("games", "gamepad", "Games")}
    ${nav("pitches", "bulb", "Pitches", c.pitches ? `<span class="pill amber">${c.pitches}</span>` : "")}
    ${nav("market", "radar", "Market")}
    ${nav("library", "box", "Library")}
    ${nav("vault", "book", "Vault")}
    <div class="nav-label">Team</div>
    <div class="team-grid">${agents().map((a) => tile(a.id, "", true)).join("")}</div>
    <div class="side-box">
      <b>${s.paused ? "Crew paused" : c.working ? `${c.working} agent${c.working > 1 ? "s" : ""} working` : "Crew is idle"}</b>
      <small>${holder ? `${icon("lock")} ${esc(holder)} has Studio` : c.queued ? `${c.queued} task(s) queued` : "Nothing running"}</small>
    </div>
    ${s.usage?.fiveHour || s.usage?.week ? `<div class="side-box usage" title="Your Claude plan's usage, as Claude Code last reported it">${s.usageHold ? `<b style="color:var(--amber)">Waiting for your plan to reset</b>` : `<b>Claude plan usage</b>`}${usageBars(s.usage)}</div>` : ""}
    <div class="side-foot">
      ${isOwner() ? nav("settings", "settings", "Settings") : `<div class="side-box"><small>${icon("users")} You're in ${esc(s.owner || "your friend")}'s studio as <b>${esc(s.me?.name ?? "a guest")}</b></small></div>`}
      <a class="side-box" href="#/settings" style="display:block;text-decoration:none">
        <small><span class="dot" style="color:${conn.claude?.installed ? "var(--green)" : "var(--red)"}"></span>Claude Code ${conn.claude?.installed ? esc(conn.claude.version ?? "") : conn.claude ? "not found" : "checking…"}</small>
        <small><span class="dot" style="color:${studioOk ? "var(--green)" : "var(--amber)"}"></span>Roblox Studio ${studioOk ? "connected" : conn.studio ? conn.studio.status : "not set up"}</small>
      </a>
    </div>`;
}

function renderTopbar(r) {
  const s = S.state;
  const c = counts();
  const page = PAGES[r.page];
  const live = s.paused
    ? `<span class="status-pill"><span class="dot" style="color:var(--amber)"></span>Paused</span>`
    : `<span class="status-pill"><span class="dot ${c.working ? "live" : ""}" style="color:${c.working ? "var(--green)" : "var(--faint)"}"></span>${c.working ? `${c.working} working · ${c.queued} queued` : "Crew idle"}</span>`;
  document.getElementById("topbar").innerHTML = `
    <button class="btn ghost menu-btn" data-act="menu" aria-label="Menu">${icon("menu")}</button>
    <h1>${esc(page.title(r.arg))}</h1>
    ${s.games.length ? `<div class="seg game-switch">${[["all", "All games"], ...s.games.map((g) => [g.slug, g.name])].map(([slug, name]) => `<button class="${S.ui.game === slug ? "active" : ""}" data-act="pick-game" data-id="${esc(slug)}">${esc(name)}</button>`).join("")}</div>` : ""}
    <span class="spacer"></span>
    ${live}
    <button class="btn" data-act="refresh" title="Refresh">${icon("refresh")}<span class="lbl">Refresh</span></button>
    <button class="btn primary" data-act="new-task" title="New task">${icon("plus")}<span class="lbl">New task</span></button>`;
}

// ---------- chat (Lead and Team) ----------

function messageHtml(m) {
  const a = agent(m.agent);
  if (m.role === "tool" || m.role === "tool-error") return `<div class="msg ${m.role}"><div class="line" title="${esc(m.text)}">${esc(m.text)}</div></div>`;
  if (m.role === "owner") {
    const text = m.by && m.by !== "owner" ? m.text.replace(/^\(From .+?, who co-owns this studio\)\s*/, "") : m.text;
    return `<div class="msg owner"><div class="who">${esc(personLabel(m.by))} · ${ago(m.at)}</div><div class="bubble md">${renderMarkdown(text)}</div></div>`;
  }
  if (m.role === "brief") {
    const label = m.from === "system" ? "Crew update" : `New task from ${esc(agent(m.from).name)}`;
    return `<div class="msg brief"><div class="who">${icon("arrow")} ${label} · ${ago(m.at)}</div><div class="bubble md">${renderMarkdown(m.text)}</div></div>`;
  }
  if (m.role === "system") return `<div class="msg system"><div class="bubble">${esc(m.text)}</div></div>`;
  return `<div class="msg"><div class="who">${esc(a.name)} · ${ago(m.at)}</div><div class="bubble md">${renderMarkdown(m.text)}</div></div>`;
}

async function loadMessages(id) {
  S.msgs[id] = await api("GET", `/api/agents/${id}/messages`);
}

function chatInner(id) {
  const list = S.msgs[id];
  if (!list) return `<div class="empty">Loading…</div>`;
  if (!list.length) {
    return id === "lead"
      ? `<div class="empty">Tell the Lead what you want built. They plan it, hand out the work, and come back with results.<br><br><span class="faint">Try: "Make me a rooftop delivery game with quick rounds and upgrades that keep players coming back."</span></div>`
      : `<div class="empty">${esc(agent(id).name)} hasn't worked yet. Their tasks and replies show up here.</div>`;
  }
  return list.map(messageHtml).join("");
}

function composerHtml(key, placeholder, hint = "Enter to send · Shift+Enter for a new line · Ctrl+V pastes screenshots") {
  const att = S.ui.attachments[key] ?? [];
  return `<div class="composer-box">
    <textarea id="composer-${key}" rows="2" placeholder="${esc(placeholder)}">${esc(S.ui.drafts[key] ?? "")}</textarea>
    <div class="thumbs" id="thumbs-${key}">${att.map((src, i) => `<img src="${src}" alt="attachment ${i + 1}" title="Click to remove" data-act="drop-attachment" data-key="${key}" data-i="${i}">`).join("")}</div>
    <div class="row"><label class="btn ghost small" title="Attach screenshots">${icon("clip")}<input type="file" accept="image/*" multiple hidden data-attach="${key}"></label><span class="faint" style="font-size:12px">${hint}</span><button class="btn primary small" data-act="send" data-key="${key}">${icon("send")}</button></div>
  </div>`;
}

async function sendComposer(key) {
  const box = document.getElementById(`composer-${key}`);
  const text = box?.value.trim();
  if (!text) return;
  const images = S.ui.attachments[key] ?? [];
  const url = key === "home" || key === "lead" ? "/api/lead/message" : `/api/agents/${key}/message`;
  const ok = await attempt(() => api("POST", url, { text, images }));
  if (!ok) return;
  S.ui.drafts[key] = "";
  S.ui.attachments[key] = [];
  if (box) box.value = "";
  const thumbs = document.getElementById(`thumbs-${key}`);
  if (thumbs) thumbs.innerHTML = "";
  const target = key === "home" ? "lead" : key;
  toast(target === "lead" ? "Sent to the Lead." : `Sent to ${agent(target).name}. ${status(target).status === "working" ? "It waits its turn." : ""}`);
  if (key === "home") location.hash = "#/lead";
}

function addAttachment(key, file) {
  if (!file?.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    (S.ui.attachments[key] ??= []).push(reader.result);
    const thumbs = document.getElementById(`thumbs-${key}`);
    if (thumbs) thumbs.innerHTML = S.ui.attachments[key].map((src, i) => `<img src="${src}" alt="" data-act="drop-attachment" data-key="${key}" data-i="${i}">`).join("");
  };
  reader.readAsDataURL(file);
}

function agentDetail(el, id, { list = false } = {}) {
  const a = agent(id);
  el.innerHTML = `
    ${list ? `<div class="list" id="agent-list"></div>` : ""}
    <section class="detail">
      <div class="detail-head" id="agent-head"></div>
      <div class="chat" id="chat">${chatInner(id)}</div>
      <div class="composer">${composerHtml(id, id === "lead" ? "Ask anything, or tell the Lead what you want done…" : `Message ${a.name}…`)}</div>
    </section>`;
  if (!list) el.firstElementChild.style.width = "100%";
  el.style.display = list ? "grid" : "flex";
  el.classList.toggle("split", list);
  updateAgentDetail(el, id, list);
  if (!S.msgs[id]) loadMessages(id).then(() => refreshChat(id, true));
  else refreshChat(id, true);
}

function updateAgentDetail(el, id, list) {
  const a = agent(id);
  const st = status(id);
  const head = el.querySelector("#agent-head");
  if (head) {
    head.innerHTML = `${tile(id, "xl")}
      <div class="grow"><h2>${esc(a.name)}</h2>
        <div class="row" style="gap:8px;margin-top:4px">
          <span class="${"st-" + st.status}"><span class="dot ${st.status === "working" ? "live" : ""}"></span> ${st.status[0].toUpperCase() + st.status.slice(1)}</span>
          ${st.current ? `<span class="pill purple">${icon("tasks")} ${esc(st.current.title)}</span>` : ""}
          ${st.queued ? `<span class="pill amber">${st.queued} queued</span>` : ""}
          ${st.hasStudio ? `<span class="pill green">${icon("lock")} has Studio</span>` : ""}
          <span class="faint">${esc(a.blurb)}</span>
        </div>${a.detail ? `<div class="muted" style="font-size:13px;margin-top:6px;max-width:760px"><span class="eyebrow" style="color:${a.color}">A closer look</span> ${esc(a.detail)}</div>` : ""}</div>
      <button class="btn small" data-act="reset-agent" data-id="${id}" title="Start a new conversation with a clean context">${icon("refresh")}Start fresh</button>`;
  }
  if (list) {
    const order = { working: 0, queued: 1, idle: 2 };
    const rows = [...agents()].sort((x, y) => order[status(x.id).status] - order[status(y.id).status]);
    el.querySelector("#agent-list").innerHTML = `
      <div class="page-head" style="padding:0 6px"><h2 style="font-size:24px">Team</h2><p>${counts().working} working · ${counts().needYou} need you</p></div>
      ${rows
        .map((x) => {
          const s = status(x.id);
          return `<a class="agent-row ${x.id === id ? "active" : ""}" href="#/team/${x.id}">${tile(x.id, "lg")}
            <span class="grow"><b>${esc(x.name)}</b><small class="muted" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.current ? `On: ${esc(s.current.title)}` : s.queued ? `${s.queued} task${s.queued > 1 ? "s" : ""} waiting` : esc(x.blurb)}</small></span>
            <span class="meta"><b class="st-${s.status}">${s.status.toUpperCase()}</b><br>${ago(s.lastActiveAt)}${s.queued ? `<br><span class="st-queued">${s.queued} queued</span>` : ""}</span></a>`;
        })
        .join("")}`;
  }
}

function refreshChat(id, scroll = false) {
  const chat = document.getElementById("chat");
  if (!chat) return;
  const atBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 80;
  chat.innerHTML = chatInner(id);
  if (scroll || atBottom) chat.scrollTop = chat.scrollHeight;
}

PAGES.lead = {
  flush: true,
  title: () => "Lead",
  mount: (el) => agentDetail(el, "lead"),
  update: (el) => updateAgentDetail(el, "lead", false),
};

PAGES.team = {
  flush: true,
  title: (arg) => `Team${arg ? ` · ${agent(arg).name}` : ""}`,
  mount: (el, arg) => agentDetail(el, arg || S.state.statuses.find((s) => s.status === "working")?.id || "lead", { list: true }),
  update: (el, arg) => updateAgentDetail(el, arg || document.querySelector(".agent-row.active")?.getAttribute("href")?.split("/").pop() || "lead", true),
};

// ---------- Home ----------

PAGES.home = {
  title: () => "Home",
  mount(el) {
    const now = new Date();
    const hour = now.getHours();
    const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const name = isOwner() ? S.state.owner || "there" : S.state.me?.name ?? "there";
    el.innerHTML = `
      <div class="hero-date">${now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · ${now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</div>
      <h1 class="hello">${hello}, <span class="name">${esc(name)}</span></h1>
      <div class="chips" id="home-chips"></div>
      <div class="ask-bar">
        <span class="tile sm" style="--c:${agent("lead").color}">${icon("sparkle")}</span>
        <input id="composer-home" placeholder="Ask the Lead anything, or say what you want done…" value="${esc(S.ui.drafts.home ?? "")}">
        <button class="btn primary" data-act="send" data-key="home">Ask ${icon("arrow")}</button>
        <button class="btn" data-act="new-task">${icon("tasks")}New task</button>
        <button class="btn" data-act="pause" id="pause-btn"></button>
      </div>
      <div id="home-banner"></div>
      <div class="cols">
        <div><div id="setup"></div><h2 class="section-title">Needs you <span id="needs-count"></span></h2><div id="needs"></div>
          <h2 class="section-title" style="margin-top:26px">Team feed</h2><div id="feed"></div></div>
        <div class="card"><h2 class="section-title"><span class="dot live" style="color:var(--green)"></span>Live now</h2><div id="live"></div></div>
      </div>`;
    this.update(el);
  },
  update(el) {
    const s = S.state;
    const c = counts();
    el.querySelector("#home-chips").innerHTML = `
      ${c.needYou ? `<span class="chip amber"><span class="dot"></span>${c.needYou} need you</span>` : ""}
      <span class="chip ${c.working ? "green" : ""}"><span class="dot"></span>${c.working} working</span>
      <span class="chip">${c.queued} queued</span>
      <span class="chip">last change ${ago(s.lastChangeAt)}</span>`;
    el.querySelector("#pause-btn").innerHTML = s.paused ? `${icon("play")}Resume all` : `${icon("pause")}Pause all`;
    el.querySelector("#needs-count").innerHTML = c.needYou ? `<span class="pill amber">${c.needYou}</span>` : "";

    const cards = [];
    const conn = s.connections;
    el.querySelector("#home-banner").innerHTML = s.usageHold
      ? `<div class="banner amber"><b>${icon("pause")} New work is waiting for your Claude plan.</b> Your ${esc(s.usageHold.window)} usage is at ${s.usageHold.pct}% (the limit you set is ${s.usageHold.ceiling}%). The crew picks up again ${s.usageHold.resetsAt ? `in about ${untilText(s.usageHold.resetsAt)}` : "when it resets"}. Messages you send the Lead still go through.${isOwner() ? ` <a href="#/settings">Change the limit</a>` : ""}</div>`
      : "";
    const setup = setupHtml();
    const box = el.querySelector("#setup");
    if (box.dataset.sig !== setup) {
      box.dataset.sig = setup;
      box.innerHTML = setup;
    }
    if (c.reviews) cards.push(card("review", "Review", `${c.reviews} new item${c.reviews > 1 ? "s" : ""} from the agents`, "", `<a class="btn" href="#/review">Review them</a>`));
    if (c.pitches) cards.push(card("bulb", "Pitches", `${c.pitches} pitch${c.pitches > 1 ? "es need" : " needs"} your decision`, "Nothing gets built until you approve one.", `<a class="btn" href="#/pitches">Open pitches</a>`));
    for (const a of s.asks.filter((x) => x.status === "open")) cards.push(askCard(a));
    const html = cards.join("") || `<div class="empty">Nothing needs you right now. The crew will add checkpoints here.</div>`;
    // Re-render only when something changed, so videos and slideshows don't restart on every update.
    const sig = `${html.length}:${s.asks.map((a) => a.id + a.status + (a.reply ?? "")).join()}:${c.reviews}:${c.pitches}:${conn.studio?.status}:${JSON.stringify(S.ui.askMedia)}`;
    if (el.dataset.needsSig !== sig) {
      el.dataset.needsSig = sig;
      keepDrafts(el, () => {
        el.querySelector("#needs").innerHTML = html;
      });
    }

    el.querySelector("#feed").innerHTML =
      s.feed
        .slice(-12)
        .reverse()
        .map(
          (f) => `<div class="card" style="padding:12px 16px"><div class="row" style="gap:8px;font-weight:650"><span class="dot" style="color:${agent(f.from).color}"></span>${esc(agent(f.from).name)} ${icon("arrow", "faint")} ${esc(agent(f.to).name)}<span class="faint" style="margin-left:auto;font-weight:400;font-size:12px">${ago(f.at)}</span></div><div style="margin-top:4px">${esc(f.text)}</div></div>`,
        )
        .join("") || `<div class="empty">Handoffs between agents appear here.</div>`;

    const order = { working: 0, queued: 1, idle: 2 };
    el.querySelector("#live").innerHTML = [...agents()]
      .sort((x, y) => order[status(x.id).status] - order[status(y.id).status])
      .map((a) => {
        const st = status(a.id);
        return `<a class="live-row ${st.status}" href="#/team/${a.id}">${tile(a.id, "sm")}<span class="grow"><b>${esc(a.name)}</b><small>${st.current ? `On: ${esc(st.current.title)}` : st.queued ? `${st.queued} task${st.queued > 1 ? "s" : ""} waiting` : "Idle"}</small></span>${st.status === "working" ? '<span class="spinner"></span>' : st.queued ? `<span class="pill amber">${st.queued} queued</span>` : ""}</a>`;
      })
      .join("");
  },
};

/** The first-run checklist. It disappears once the must-haves are done and a game exists. */
function setupHtml() {
  const s = S.state;
  const conn = s.connections;
  if (!isOwner() || S.ui.hideSetup) return "";
  const steps = [
    [conn.claude?.installed, "Install Claude Code and sign in", "Run <span class=\"mono\">claude</span> once in a terminal and sign in with your plan. The crew uses it for every agent.", "#/settings"],
    [conn.studio?.status === "connected", "Connect Roblox Studio", "In Studio: Assistant → settings → MCP Servers → quick connect for Claude Code. Then press Check again in Settings.", "#/settings"],
    [Boolean(s.owner), "Add your name", "So the crew knows who it's working for.", "#/settings"],
    [conn.gemini?.keySet, "Add a Gemini key (optional)", "For icons, thumbnails and UI art. Free from Google AI Studio.", "#/settings", true],
    [s.games.length > 0 || s.tasks.length > 0, "Give the Lead your first idea", "Type it in the box above, or ask Pulse for pitches.", "#/pitches"],
  ];
  const must = steps.filter((x) => !x[4]);
  if (must.every((x) => x[0]) && s.games.length) return "";
  const done = steps.filter((x) => x[0]).length;
  return `<div class="card setup"><div class="row"><h3 class="section-title grow" style="margin:0">${icon("sparkle")} Get set up <span class="faint" style="font-weight:500">${done} of ${steps.length}</span></h3><button class="btn ghost small" data-act="hide-setup" title="Hide">${icon("x")}</button></div>
    <span class="meter" style="margin:10px 0 6px"><span style="width:${Math.round((done / steps.length) * 100)}%"></span></span>
    ${steps.map(([ok, title, how, href, optional]) => `<a class="setup-step ${ok ? "ok" : ""}" href="${href}"><span class="box">${ok ? icon("check") : ""}</span><span class="grow"><b>${title}</b>${ok ? "" : `<small>${how}</small>`}</span>${ok ? "" : optional ? `<span class="pill">optional</span>` : icon("right")}</a>`).join("")}
  </div>`;
}

function askCard(a) {
  const files = a.media ?? [];
  const steps = a.steps ?? [];
  const checks = S.ui.checks[a.id] ?? [];
  const attached = S.ui.askMedia[a.id] ?? [];
  const video = files.find((m) => /\.(mp4|webm|mov|m4v)$/i.test(m));
  const images = files.filter((m) => /\.(png|jpe?g|webp|gif)$/i.test(m));
  const isTest = a.kind === "test";
  const player = video
    ? `<video class="howto" src="${media(video)}" controls playsinline muted loop autoplay></video>`
    : images.length
      ? `<div class="howto slides" data-ask="${a.id}" data-i="0">${images.map((m, i) => `<img src="${media(m)}" alt="Step ${i + 1}" class="${i === 0 ? "on" : ""}">`).join("")}<span class="slide-n">1 / ${images.length}</span></div>`
      : "";
  return `<div class="card glow ask ${isTest ? "test" : ""}"><div class="card-head">${tile(a.from, "lg")}<div class="grow">
    <div class="eyebrow">${isTest ? "Try it" : "Question"} · from ${esc(agent(a.from).name)}${a.game ? ` · ${esc(gameName(a.game))}` : ""} · ${ago(a.createdAt)}</div>
    <h3>${esc(a.title)}</h3>${a.body ? `<div class="md muted">${renderMarkdown(a.body)}</div>` : ""}
    ${player}
    ${steps.length ? `<ol class="steps-list">${steps.map((st, i) => `<li class="${checks.includes(i) ? "checked" : ""}" data-act="check-step" data-id="${a.id}" data-i="${i}"><span class="box">${checks.includes(i) ? icon("check") : i + 1}</span><span>${esc(st)}</span></li>`).join("")}</ol>` : ""}
    ${a.reply ? `<p class="faint">Last reply: ${esc(a.reply)}</p>` : ""}
    <textarea class="input" rows="2" id="ask-${a.id}" placeholder="${isTest ? "What happened? (needed if something's wrong)" : "Your answer…"}" style="margin-top:10px">${esc(S.ui.drafts[`ask-${a.id}`] ?? "")}</textarea>
    ${attached.length ? `<div class="thumbs" style="margin-top:8px">${attached.map((m) => (/\.(mp4|webm|mov|m4v)$/i.test(m) ? `<span class="pill">${icon("play")} video</span>` : `<img src="${media(m)}" alt="">`)).join("")}</div>` : ""}
    <div class="row" style="margin-top:10px">
      ${isTest
        ? `<button class="btn green" data-act="ask-result" data-id="${a.id}" data-result="works">${icon("check")}It works</button>
           <button class="btn red" data-act="ask-result" data-id="${a.id}" data-result="broken">${icon("x")}Something's wrong</button>`
        : `<button class="btn primary" data-act="ask-reply" data-id="${a.id}">${icon("send")}Send answer</button>
           <button class="btn green" data-act="ask-done" data-id="${a.id}">${icon("check")}Done</button>`}
      <label class="btn" title="Attach a photo or video, from your phone's camera too">${icon("clip")}Photo / video<input type="file" accept="image/*,video/*" multiple hidden data-ask-upload="${a.id}"></label>
    </div>
  </div></div></div>`;
}

async function uploadMedia(file) {
  const res = await fetch(`/api/media?name=${encodeURIComponent(file.name || "upload.png")}`, {
    method: "POST",
    headers: { "x-rocrew-token": TOKEN, "content-type": "application/octet-stream" },
    body: file,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json.media;
}

// Step-by-step slideshows advance on their own, like a short video.
setInterval(() => {
  for (const show of document.querySelectorAll(".slides")) {
    const imgs = show.querySelectorAll("img");
    if (imgs.length < 2) continue;
    const i = (Number(show.dataset.i) + 1) % imgs.length;
    show.dataset.i = i;
    imgs.forEach((im, n) => im.classList.toggle("on", n === i));
    show.querySelector(".slide-n").textContent = `${i + 1} / ${imgs.length}`;
    const steps = show.closest(".card")?.querySelectorAll(".steps-list li");
    steps?.forEach((li, n) => li.classList.toggle("now", n === i));
  }
}, 2600);

function card(ic, eyebrow, title, body, actions) {
  return `<div class="card glow"><div class="card-head"><span class="tile lg" style="--c:#7c5cff">${icon(ic)}</span><div class="grow"><div class="eyebrow">${esc(eyebrow)}</div><h3>${esc(title)}</h3>${body ? `<p class="muted" style="margin:2px 0 8px">${esc(body)}</p>` : ""}<div class="row">${actions}</div></div></div></div>`;
}

/** Re-render a region without losing what the owner is typing into its textareas. */
function keepDrafts(el, fn) {
  for (const t of el.querySelectorAll("textarea[id], input[id]")) S.ui.drafts[t.id] = t.value;
  const focused = document.activeElement?.id;
  const caret = document.activeElement?.selectionStart;
  fn();
  for (const t of el.querySelectorAll("textarea[id], input[id]")) if (S.ui.drafts[t.id] !== undefined) t.value = S.ui.drafts[t.id];
  if (focused) {
    const f = document.getElementById(focused);
    if (f) {
      f.focus();
      if (caret !== undefined && f.setSelectionRange) f.setSelectionRange(caret, caret);
    }
  }
}

// ---------- Tasks ----------

PAGES.tasks = {
  title: () => "Tasks",
  mount(el) {
    this.update(el);
  },
  update(el) {
    const s = S.state;
    const g = S.ui.game;
    const tasks = s.tasks.filter((t) => g === "all" || t.game === g);
    const working = tasks.filter((t) => t.status === "working");
    const queued = tasks.filter((t) => t.status === "queued");
    const finished = tasks.filter((t) => !["working", "queued"].includes(t.status)).slice(-60).reverse();
    const open = new Set([...el.querySelectorAll("details[open]")].map((d) => d.dataset.id));
    el.innerHTML = `
      <div class="page-head"><div class="eyebrow" style="color:#c4b5fd">${icon("tasks")} Work for the agents</div><h2>Tasks</h2>
        <div class="row"><p class="grow">Everything you've asked for, where it is right now, and what came back. It updates live.</p>
        <button class="btn primary" data-act="new-task">${icon("plus")}New task</button></div></div>
      ${s.paused ? `<div class="banner amber"><b>The crew is paused.</b>Queued tasks wait until you resume. <button class="btn small" data-act="pause">Resume</button></div>` : ""}
      <h3 class="section-title"><span class="pill green">${working.length}</span> Working now <span class="faint" style="font-weight:500;font-size:14px">Live in the agent's chat</span></h3>
      ${working.map((t) => taskRow(t, open)).join("") || `<div class="empty">Nobody is working right now.</div>`}
      <h3 class="section-title" style="margin-top:24px"><span class="pill blue">${queued.length}</span> Queued <span class="faint" style="font-weight:500;font-size:14px">Runs as soon as the agent is free, in order</span></h3>
      ${queued.map((t) => taskRow(t, open)).join("") || `<div class="empty">The queue is empty.</div>`}
      <h3 class="section-title" style="margin-top:24px">Finished</h3>
      ${finished.map((t) => taskRow(t, open)).join("") || `<div class="empty">Finished work shows up here with what came back.</div>`}`;
  },
};

function modelBadge(t) {
  const m = t.ran?.model ?? t.model;
  const size = t.size && t.size !== "normal" ? t.size : "";
  if (!m && !size) return "";
  const color = { opus: "purple", sonnet: "blue", haiku: "green" }[m] ?? "";
  return ` <span class="pill ${color} model-pill" title="${esc(`${m ?? "model picked when it starts"}${t.ran?.effort ? `, ${t.ran.effort} effort` : ""}${size ? `, ${size} task` : ""}`)}">${esc([m, size].filter(Boolean).join(" · "))}</span>`;
}

function taskRow(t, open = new Set()) {
  const a = agent(t.agent);
  const when = t.status === "working" ? `started ${ago(t.startedAt)}` : t.endedAt ? `${t.status} ${ago(t.endedAt)}` : `queued ${ago(t.createdAt)}`;
  const deps = t.after?.length ? ` · after ${t.after.join(", ")}` : "";
  const body = [t.brief && `Brief:\n${t.brief}`, t.result && `Result:\n${t.result}`, t.error && `Problem:\n${t.error}`].filter(Boolean).join("\n\n");
  return `<div class="task ${t.status}" style="flex-wrap:wrap">${tile(t.agent, "lg")}
    <div class="grow"><b>${esc(t.title)}</b>${modelBadge(t)}<small>${esc(a.name)} · from ${esc(t.from === "owner" ? personLabel(t.by) : agent(t.from === "system" ? "lead" : t.from).name)}${t.game ? ` · ${esc(gameName(t.game))}` : ""} · ${when}${t.studio ? " · needs Studio" : ""}${esc(deps)} · <span class="mono">${t.id}</span></small></div>
    ${t.status === "working" ? '<span class="spinner"></span>' : ""}${statusPill(t.status)}
    ${["queued", "working"].includes(t.status) ? `<button class="btn small" data-act="cancel-task" data-id="${t.id}">${t.status === "working" ? "Stop" : "Cancel"}</button>` : ""}
    <a class="btn small" href="#/team/${t.agent}">Chat</a>
    ${body ? `<details data-id="${t.id}" ${open.has(t.id) ? "open" : ""}><summary class="faint" style="cursor:pointer;font-size:12px">Details</summary><div class="task-body">${esc(body)}</div></details>` : ""}
  </div>`;
}

// ---------- Review ----------

const REVIEW_TABS = [
  ["pending", "To review"],
  ["changes", "Changes asked"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "Everything"],
];

function reviewList() {
  return S.state.reviews
    .filter((r) => S.ui.reviewFilter === "all" || r.status === S.ui.reviewFilter)
    .filter((r) => S.ui.reviewAgent === "all" || r.agent === S.ui.reviewAgent)
    .filter((r) => S.ui.game === "all" || r.game === S.ui.game)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function mediaThumb(r) {
  if (!r.media) return icon("image");
  return r.kind === "video" ? `<video src="${media(r.media)}" muted preload="metadata"></video>` : `<img src="${media(r.media)}" alt="${esc(r.title)}" loading="lazy">`;
}

PAGES.review = {
  title: () => "Review",
  mount(el) {
    this.update(el);
  },
  update(el) {
    const s = S.state;
    const list = reviewList();
    const n = (f) => s.reviews.filter((r) => f === "all" || r.status === f).length;
    const groups = new Map();
    for (const r of list) {
      const key = r.group || `${agent(r.agent).name} ${r.kind === "video" ? "videos" : "images"}`;
      if (!groups.has(key)) groups.set(key, { agent: r.agent, items: [] });
      groups.get(key).items.push(r);
    }
    const pending = n("pending");
    el.innerHTML = `
      <div class="page-head"><div class="eyebrow">${pending} waiting for you</div><h2>Review</h2><p>Everything the agents made for you to look at. Approve it, ask for changes, or reject it; the agent picks up your verdict on its next pass.</p></div>
      <div class="row" style="margin-bottom:14px"><div class="seg">${REVIEW_TABS.map(([k, label]) => `<button class="${S.ui.reviewFilter === k ? "active" : ""}" data-act="review-filter" data-id="${k}">${label} ${n(k)}</button>`).join("")}</div>
      <span class="spacer grow"></span><select class="input" style="width:auto" data-change="review-agent"><option value="all">Every agent</option>${agents().map((a) => `<option value="${a.id}" ${S.ui.reviewAgent === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      ${
        [...groups.entries()]
          .map(
            ([name, g]) => `<div class="group-title">${tile(g.agent, "sm")}${esc(name)} <span class="faint">${g.items.length}</span></div>
          <div class="grid-cards">${g.items
            .map(
              (r) => `<button class="media-card" data-act="open-review" data-id="${r.id}"><div class="img">${mediaThumb(r)}</div>
              <div class="cap"><b>${esc(r.question)}</b><div class="row" style="justify-content:space-between;margin-top:4px"><small class="muted">${esc(r.title)}${r.game ? ` · ${esc(gameName(r.game))}` : ""}</small>${statusPill(r.status)}</div></div></button>`,
            )
            .join("")}</div>`,
          )
          .join("") || `<div class="empty">Nothing here. When an agent sends a screenshot, render or video for your opinion, it lands in this queue.</div>`
      }`;
  },
};

function openReview(id) {
  const list = reviewList();
  let idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;
  const overlay = document.getElementById("overlay");
  const draw = () => {
    const r = list[idx];
    const a = agent(r.agent);
    overlay.innerHTML = `<div class="viewer" role="dialog" aria-label="Review item">
      <div class="stage">
        <div class="bar"><div class="grow"><b>${esc(r.title)}</b> <span class="faint mono" style="font-size:12px">${esc(r.file)}</span></div>
          <span class="muted">${idx + 1} / ${list.length}</span>
          <a class="btn small" href="${media(r.media)}" download>${icon("upload")}Download</a>
          <button class="btn small" data-act="close-overlay">${icon("x")}</button></div>
        <div class="pic">${r.kind === "video" ? `<video src="${media(r.media)}" controls autoplay muted></video>` : `<img src="${media(r.media)}" alt="${esc(r.title)}">`}
          ${idx > 0 ? `<button class="btn nav prev" data-act="review-prev">${icon("left")}</button>` : ""}
          ${idx < list.length - 1 ? `<button class="btn nav next" data-act="review-next">${icon("right")}</button>` : ""}</div>
      </div>
      <aside>
        <div class="row">${tile(r.agent, "lg")}<div><b>Made by ${esc(a.name)}</b><br><small class="muted">${r.kind === "video" ? "Video" : "Image"}${r.game ? ` · ${esc(gameName(r.game))}` : ""} · ${ago(r.createdAt)}</small></div></div>
        <div class="card" style="margin-top:16px"><h3>${esc(r.question)}</h3><p class="muted" style="margin:0">Approve tells ${esc(a.name)} to use it; ask for changes sends it back with your note; reject is just a no.</p></div>
        ${r.status !== "pending" ? `<p style="margin-top:14px">Current verdict: ${statusPill(r.status)} ${r.note ? `<br><span class="muted">${esc(r.note)}</span>` : ""}</p>` : ""}
        <label class="field" style="margin-top:16px">Note for ${esc(a.name)} <small>(needed to ask for changes)</small><textarea class="input" id="review-note" rows="4" placeholder="What would make it right?"></textarea></label>
        <div class="stack">
          <button class="btn green block" data-act="decide" data-id="${r.id}" data-verdict="approved">${icon("check")}Approve <kbd>A</kbd></button>
          <button class="btn amber block" data-act="decide" data-id="${r.id}" data-verdict="changes">${icon("refresh")}Ask for changes <kbd>C</kbd></button>
          <button class="btn red block" data-act="decide" data-id="${r.id}" data-verdict="rejected">${icon("x")}Reject <kbd>R</kbd></button>
        </div>
      </aside></div>`;
  };
  S.reviewNav = {
    prev: () => idx > 0 && (idx--, draw()),
    next: () => idx < list.length - 1 && (idx++, draw()),
    after: () => {
      const nextPending = list.findIndex((r, i) => i > idx && r.status === "pending");
      if (nextPending >= 0) {
        idx = nextPending;
        draw();
      } else closeOverlay();
    },
  };
  draw();
}

function closeOverlay() {
  document.getElementById("overlay").innerHTML = "";
  S.reviewNav = null;
}

async function decide(id, verdict) {
  const note = document.getElementById("review-note")?.value ?? "";
  const ok = await attempt(() => api("POST", `/api/reviews/${id}/decision`, { verdict, note }), verdict === "changes" ? "Sent back with your note." : verdict === "approved" ? "Approved." : "Rejected.");
  if (ok) {
    const r = S.state.reviews.find((x) => x.id === id);
    if (r) r.status = verdict;
    S.reviewNav?.after();
  }
}

// ---------- Games ----------

const LANES = [
  ["Plan", ["pulse", "architect", "balance"]],
  ["Build", ["builder", "frame", "scenic", "librarian", "merchant"]],
  ["Test", ["playtest", "kid-tester", "reviewer"]],
  ["Ship", ["splash", "liveops", "producer"]],
];

PAGES.games = {
  title: () => "Games",
  mount(el, arg) {
    this.update(el, arg);
  },
  update(el, arg) {
    const s = S.state;
    if (!s.games.length) {
      el.innerHTML = `<div class="page-head"><h2>Games</h2><p>Every game the crew is working on. Start one from an idea, or let Pulse pitch you something that's growing on Roblox.</p></div>
        <div class="empty"><p>No games yet.</p><div class="row" style="justify-content:center"><button class="btn primary" data-act="new-game">${icon("plus")}New game</button><button class="btn" data-act="ask-pulse">${icon("bulb")}Ask Pulse for pitches</button></div></div>`;
      return;
    }
    const game = s.games.find((g) => g.slug === arg) ?? s.games.find((g) => g.slug === S.ui.game) ?? s.games[0];
    const tab = S.ui.gameTab;
    const tasks = s.tasks.filter((t) => t.game === game.slug);
    const open = tasks.filter((t) => ["working", "queued"].includes(t.status));
    el.innerHTML = `
      <div class="row" style="margin-bottom:16px"><div class="seg">${s.games.map((g) => `<button class="${g.slug === game.slug ? "active" : ""}" data-act="go" data-id="#/games/${esc(g.slug)}">${esc(g.name)}</button>`).join("")}</div><button class="btn small" data-act="new-game">${icon("plus")}New game</button></div>
      <div class="game-hero"><span class="tile xl" style="--c:#c026d3">${icon("gamepad")}</span><div class="grow"><div class="eyebrow" style="color:#e9d5ff">Game</div><h2>${esc(game.name)}</h2>
        <div class="row"><span class="pill purple">${esc(game.version)}</span><span class="mono faint">games/${esc(game.slug)}/</span>${game.universeId ? `<a class="pill blue" href="https://www.roblox.com/games/${esc(game.live?.at(-1)?.placeId ?? "")}" target="_blank" rel="noopener">universe ${esc(game.universeId)}</a>` : ""}</div></div>
        <button class="btn" data-act="lead-about" data-id="${esc(game.slug)}">${icon("sparkle")}Ask the Lead</button></div>
      <div class="tabs">${[["overview", `Overview <span class="pill">${open.length}</span>`], ["live", "Live numbers"], ["pipeline", "Pipeline"], ["files", "Files"]].map(([k, l]) => `<button class="tab ${tab === k ? "active" : ""}" data-act="game-tab" data-id="${k}">${l}</button>`).join("")}</div>
      <div id="game-body"></div>`;
    const body = el.querySelector("#game-body");
    if (tab === "overview") {
      body.innerHTML = `<div class="cols"><div class="card"><h3 class="section-title">${icon("sparkle")} What's new in ${esc(game.version)}</h3>
        ${game.whatsNew.length ? `<ul>${game.whatsNew.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : `<p class="muted">The Lead posts release notes here (<span class="mono">node studio/cli.mjs game update --whatsnew "…"</span>).</p>`}</div>
        <div class="card"><h3 class="section-title">${icon("tasks")} Open work (${open.length})</h3>${open.map((t) => `<div class="mini-task">${tile(t.agent, "sm")}<span class="grow">${esc(t.title)}</span>${statusPill(t.status)}</div>`).join("") || `<p class="muted">Nothing open.</p>`}</div></div>`;
    } else if (tab === "pipeline") {
      body.innerHTML = `<div class="pipeline">${LANES.map(([name, ids]) => {
        const lane = tasks.filter((t) => ids.includes(t.agent)).slice(-8).reverse();
        const done = tasks.filter((t) => ids.includes(t.agent) && t.status === "done").length;
        return `<div class="lane"><h4>${name}<span class="faint">${done} done</span></h4>${lane.map((t) => `<div class="mini-task">${tile(t.agent, "sm")}<span class="grow">${esc(t.title)}</span>${statusPill(t.status)}</div>`).join("") || `<p class="faint">Not started.</p>`}</div>`;
      }).join("")}</div>`;
    } else if (tab === "live") {
      const live = game.live ?? [];
      const last = live.at(-1);
      body.innerHTML = `<div class="card"><div class="row"><label class="field grow" style="margin:0">Universe id <small>From the Creator Hub, once the game is published.</small><input class="input" id="universe-${game.slug}" value="${esc(game.universeId ?? "")}" placeholder="e.g. 1234567890"></label>
        <button class="btn" data-act="save-universe" data-id="${esc(game.slug)}">Save</button><button class="btn primary" data-act="fetch-live" data-id="${esc(game.slug)}">${icon("refresh")}Fetch now</button></div></div>
        ${last ? `<div class="stats" style="padding:16px 0">${[["Playing now", last.playing], ["Visits", last.visits], ["Favorites", last.favorites], ["Like %", last.likePct]].map(([l, v]) => `<div class="stat"><div class="l">${l}</div><div class="v">${fmt(v)}</div></div>`).join("")}</div>
        <div class="table-wrap"><table class="data"><thead><tr><th>When</th><th>Playing</th><th>Visits</th><th>Favorites</th><th>Like %</th></tr></thead><tbody>${live.slice().reverse().slice(0, 50).map((x) => `<tr><td>${new Date(x.at).toLocaleString()}</td><td>${fmt(x.playing)}</td><td>${fmt(x.visits)}</td><td>${fmt(x.favorites)}</td><td>${fmt(x.likePct)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted" style="margin-top:14px">No numbers yet. Retention, session length and revenue live in the Creator Hub; Liveops will ask you for them when it needs them.</p>`}`;
    } else {
      body.innerHTML = `<div class="files"><div class="card" style="padding:8px" id="file-list">Loading…</div><div class="card" id="file-view"><p class="muted">Pick a file: the plan, economy, reports and art all live here.</p></div></div>`;
      loadFiles(game.slug);
    }
  },
};

async function loadFiles(slug) {
  const files = await attempt(() => api("GET", `/api/games/${slug}/files`));
  const list = document.getElementById("file-list");
  if (!list || !files) return;
  list.innerHTML = files.length ? files.map((f) => `<button class="file-link ${S.fileView?.path === f.path ? "active" : ""}" data-act="open-file" data-slug="${esc(slug)}" data-id="${esc(f.path)}">${esc(f.path)}<br><small class="faint">${ago(f.modifiedAt)}</small></button>`).join("") : `<p class="muted" style="padding:10px">No files yet. The Architect starts with plan.md.</p>`;
  if (S.fileView?.slug === slug) showFile(slug, S.fileView.path);
}

async function showFile(slug, rel) {
  S.fileView = { slug, path: rel };
  const view = document.getElementById("file-view");
  if (!view) return;
  if (/\.(png|jpe?g|webp|gif|mp4|webm)$/i.test(rel)) {
    const src = `/game-file/${encodeURIComponent(slug)}/${rel.split("/").map(encodeURIComponent).join("/")}?token=${TOKEN}`;
    view.innerHTML = /\.(mp4|webm)$/i.test(rel) ? `<video src="${src}" controls style="max-width:100%"></video>` : `<img src="${src}" alt="${esc(rel)}" style="max-width:100%;border-radius:10px">`;
    return;
  }
  const res = await attempt(() => api("GET", `/api/games/${slug}/file?path=${encodeURIComponent(rel)}`));
  if (!res) return;
  view.innerHTML = rel.endsWith(".md") ? `<div class="md">${renderMarkdown(splitFrontmatter(res.text).body, { wikiHref: vaultHref })}</div>` : `<pre class="task-body" style="max-height:none">${esc(res.text)}</pre>`;
  document.querySelectorAll(".file-link").forEach((b) => b.classList.toggle("active", b.dataset.id === rel));
}

// ---------- Pitches ----------

PAGES.pitches = {
  title: () => "Pitches",
  mount(el) {
    this.update(el);
  },
  update(el) {
    const s = S.state;
    const pending = s.pitches.filter((p) => p.status === "pending");
    const history = s.pitches.filter((p) => p.status !== "pending").reverse();
    const list = S.ui.pitchTab === "pending" ? pending : history;
    keepDrafts(el, () => {
      el.innerHTML = `
        <div class="page-head"><div class="eyebrow" style="color:#c4b5fd">Pulse · from the Roblox charts</div><h2>Pitches</h2>
          <div class="row"><p class="grow">Pulse proposes games from what's growing on Roblox right now. Nothing gets built until you approve one.</p>
          <button class="btn" data-act="ask-pulse">${icon("pulse")}Ask Pulse for pitches</button><button class="btn primary" data-act="new-game">${icon("plus")}New game idea</button></div></div>
        <div class="tabs"><button class="tab ${S.ui.pitchTab === "pending" ? "active" : ""}" data-act="pitch-tab" data-id="pending">Needs your decision <span class="pill">${pending.length}</span></button>
          <button class="tab ${S.ui.pitchTab === "history" ? "active" : ""}" data-act="pitch-tab" data-id="history">History <span class="pill">${history.length}</span></button></div>
        ${S.ui.pitchTab === "pending" && pending.length > 1 ? `<p class="muted">These are alternatives. Approving one starts it; the others stay here until you decide.</p>` : ""}
        ${list.map(pitchCard).join("") || `<div class="empty">${S.ui.pitchTab === "pending" ? "No pitches waiting. Ask Pulse to study the charts and pitch a few ideas." : "Decided pitches show up here."}</div>`}`;
    });
  },
};

function pitchCard(p) {
  const d = p.data ?? {};
  const ev = d.evidence ?? {};
  const game = d.game ?? {};
  const stats = [
    ["Top comparable playing", ev.topComparablePlaying],
    ["Its likes", ev.likePct !== undefined ? `${ev.likePct}%` : undefined],
    ["Similar games", ev.similarGames],
    ["Upvotes per day", ev.upvotesPerDay],
    ["Top earning rank", ev.topEarningRank !== undefined ? `#${ev.topEarningRank}` : undefined],
  ].filter(([, v]) => v !== undefined && v !== null);
  const rows = [
    ["How it plays", game.howItPlays],
    ["First 60 seconds", game.first60Seconds],
    ["Goal at 10–15 minutes", game.goalAt10to15Minutes],
    ["Monetization", game.monetization],
  ].filter(([, v]) => v);
  return `<div class="pitch"><div class="pitch-top"><span class="tile xl" style="--c:#f472b6">${icon("bulb")}</span><div class="grow">
      <div class="row" style="gap:6px">${(d.tags ?? []).map((t) => `<span class="pill purple">${esc(t)}</span>`).join("")}${p.status !== "pending" ? statusPill(p.status) : ""}</div>
      <h3>${esc(p.title)}</h3><div>${esc(d.summary ?? "")}</div></div></div>
    ${d.different ? `<div class="card glow" style="margin:16px 22px 0"><div class="eyebrow">How we're different</div><b>${esc(d.different)}</b><div class="row" style="margin-top:6px">${(d.versus ?? []).map((v) => `<span class="pill">vs ${esc(v)}</span>`).join("")}</div></div>` : ""}
    ${stats.length ? `<div class="stats">${stats.map(([l, v]) => `<div class="stat"><div class="l">${esc(l)}</div><div class="v">${esc(typeof v === "number" ? fmt(v) : v)}</div></div>`).join("")}</div>` : ""}
    ${rows.length ? `<div class="kv">${rows.map(([k, v]) => `<div class="k">${esc(k)}</div><div>${esc(v)}</div>`).join("")}</div>` : ""}
    ${d.risks?.length ? `<div style="padding:0 22px 8px"><div class="eyebrow">Risks</div><ul>${d.risks.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>` : ""}
    ${ev.sources?.length ? `<div style="padding:0 22px 12px" class="row">${ev.sources.map((u) => `<a class="pill blue" href="${esc(/^https?:/.test(u) ? u : "#")}" target="_blank" rel="noopener">source</a>`).join("")}</div>` : ""}
    ${p.status === "pending" ? `<div style="padding:0 22px 20px"><textarea class="input" rows="2" id="pitch-note-${p.id}" placeholder="Optional note (e.g. make it co-op)"></textarea>
      <div class="row" style="margin-top:10px"><button class="btn green" data-act="pitch-decide" data-id="${p.id}" data-verdict="approved">${icon("check")}Approve and build</button><button class="btn red" data-act="pitch-decide" data-id="${p.id}" data-verdict="rejected">${icon("x")}Not this one</button></div></div>` : p.note ? `<p class="muted" style="padding:0 22px 16px">Your note: ${esc(p.note)}</p>` : ""}
  </div>`;
}

// ---------- Market ----------

const BENCHMARKS = [
  ["1", "First action", "under 10 s", "Seconds from spawn to the first input that matters", "Players leave before they've played"],
  ["2", "First reward", "under 30 s", "Seconds to the first visible reward", "The loop never gets a chance"],
  ["3", "Onboarding — grasp the core loop", "2–5 min", "Kid Tester timeline; onboarding funnel events", "Still confused at 5 minutes means the opening is broken"],
  ["3b", "Next goal reachable", "10–15 min", "Balance simulation: time to the first big goal", "A long grind wall early makes people leave"],
  ["4", "Average session (early)", "> 10 min", "Creator Hub engagement", "Short sessions sink everything else"],
  ["5", "Day-1 retention", "track and improve", "Creator Hub retention", "The single most-ignored number"],
  ["6", "Payer conversion", "track and improve", "Creator Hub monetization", "Offers in the wrong place, or too pushy"],
];

PAGES.market = {
  title: () => "Market",
  mount(el) {
    if (!S.market) attempt(() => api("GET", "/api/market")).then((m) => {
      S.market = m;
      if (route().page === "market") this.update(el);
    });
    this.update(el);
  },
  update(el) {
    const m = S.market;
    const tab = S.ui.marketTab;
    const tabs = [["charts", "1 · charts"], ["corpus", "2 · corpus"], ["benchmarks", "3 · benchmarks"], ["breakouts", "4 · breakouts"]];
    const busy = S.ui.busy.market;
    el.innerHTML = `
      <div class="page-head"><div class="row"><h2 class="grow" style="margin:0">Market intel</h2><button class="btn primary" data-act="market-refresh" ${busy ? "disabled" : ""}>${busy ? '<span class="spinner"></span>Fetching charts…' : `${icon("refresh")}Refresh charts`}</button></div>
        <p class="mono" style="font-size:12px;margin-top:6px">${m ? `charts ${ago(m.fetchedAt)} · ${m.snapshots} snapshot(s) · corpus ${m.corpus.length} refs · read-only` : "loading…"}</p></div>
      ${m?.error ? `<div class="banner amber"><b>The last refresh failed</b>${esc(m.error)}<br><small>The charts come from Roblox's public web APIs. If this keeps failing, Roblox may have changed them; Pulse can still research with web search.</small></div>` : ""}
      <div class="row" style="margin-bottom:16px">${tabs.map(([k, l]) => `<button class="btn ${tab === k ? "primary" : ""}" data-act="market-tab" data-id="${k}">${l}</button>`).join("")}</div>
      <div id="market-body"></div>`;
    const body = el.querySelector("#market-body");
    if (!m) return;
    if (tab === "charts") body.innerHTML = marketCharts(m);
    else if (tab === "corpus") body.innerHTML = marketCorpus(m);
    else if (tab === "benchmarks") body.innerHTML = `<h3 class="section-title">Benchmark targets</h3><div class="banner blue"><b>These are this studio's starting targets, not facts about Roblox.</b>Tune them with your own Creator Hub numbers. Producer checks gates against them.</div>
      <div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Benchmark</th><th>Target</th><th>Measured by</th><th>Failure meaning</th></tr></thead><tbody>${BENCHMARKS.map((r) => `<tr>${r.map((c, i) => `<td${i === 1 ? ' style="font-weight:700"' : i === 2 ? ' class="mono"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    else body.innerHTML = marketBreakouts(m);
  },
};

function likePct(g) {
  return g.up + g.down ? `${((g.up / (g.up + g.down)) * 100).toFixed(1)}%` : "–";
}

function marketCharts(m) {
  if (!m.latest) return `<div class="empty">No chart snapshot yet. Press <b>Refresh charts</b>. Each refresh is stored, so rank moves show up from the second one.</div>`;
  const sorts = Object.entries(m.latest.sorts);
  const sortId = sorts.some(([id]) => id === S.ui.sortId) ? S.ui.sortId : sorts[0]?.[0];
  const sort = m.latest.sorts[sortId];
  const moves = new Map(m.moves.filter((x) => x.sortId === sortId).map((x) => [x.universeId, x]));
  const det = m.details ?? {};
  return `
    ${m.previousAt ? `<div class="banner blue"><b>Velocity over 2 snapshots</b>Deltas compare ${new Date(m.latest.at).toLocaleString()} with ${new Date(m.previousAt).toLocaleString()}. A positive rank delta means the game moved up the sort.</div>` : ""}
    ${m.moves.length ? `<div class="row" style="margin-bottom:14px"><span class="eyebrow">Biggest rank moves</span>${m.moves.slice(0, 8).map((x) => `<span class="pill green">${x.isNew ? "new" : `${x.rankDelta > 0 ? "+" : ""}${x.rankDelta}`} ${esc(x.name)} <span class="faint">${esc(x.sortName)}</span></span>`).join("")}</div>` : ""}
    <div class="seg" style="margin-bottom:12px">${sorts.map(([id, s]) => `<button class="${id === sortId ? "active" : ""}" data-act="market-sort" data-id="${esc(id)}">${esc(s.name)} ${s.games.length}</button>`).join("")}</div>
    <div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Δ#</th><th></th><th>Name</th><th>Players</th><th>Δ players</th><th>Like %</th><th>Visits</th><th>Universe</th><th></th></tr></thead><tbody>
    ${sort.games
      .map((g) => {
        const mv = moves.get(g.universeId);
        const d = det[g.universeId] ?? {};
        const inCorpus = m.corpus.some((c) => String(c.universeId) === String(g.universeId));
        return `<tr><td>${g.rank}</td><td class="${mv?.rankDelta > 0 ? "up" : mv?.rankDelta < 0 ? "down" : ""}">${mv ? (mv.isNew ? "new" : `${mv.rankDelta > 0 ? "+" : ""}${mv.rankDelta}`) : ""}</td>
        <td>${d.icon ? `<img class="ico" src="${esc(d.icon)}" alt="" loading="lazy">` : ""}</td>
        <td><a href="https://www.roblox.com/games/${esc(g.placeId ?? d.placeId ?? "")}" target="_blank" rel="noopener" style="text-decoration:none;font-weight:650">${esc(g.name)}</a></td>
        <td>${fmt(g.players)}</td><td class="${mv?.playersDelta > 0 ? "up" : mv?.playersDelta < 0 ? "down" : ""}">${mv?.playersDelta ? `${mv.playersDelta > 0 ? "+" : ""}${fmt(mv.playersDelta)}` : ""}</td>
        <td>${likePct(g)}</td><td>${fmt(d.visits)}</td><td class="mono faint">${g.universeId}</td>
        <td><button class="btn small ${inCorpus ? "green" : ""}" data-act="corpus" data-id="${g.universeId}" data-add="${!inCorpus}" title="${inCorpus ? "In the reference corpus" : "Add to the reference corpus"}">${icon("star")}</button></td></tr>`;
      })
      .join("")}</tbody></table></div>
    <p class="faint" style="font-size:12px">Like % is the game's lifetime up / (up + down) votes. Session length, D1 and D7 aren't public for other people's games; players per 1K visits and growth across snapshots are the proxies shown.</p>`;
}

function marketCorpus(m) {
  return `<h3 class="section-title">Reference corpus</h3><p class="muted">Games the crew studies before designing: Splash compares icons against them, Architect borrows proven loops. Star games in the charts, or add one by universe id.</p>
    <div class="row" style="margin-bottom:14px"><input class="input" style="max-width:260px" id="corpus-add" placeholder="Universe id"><button class="btn" data-act="corpus-add">${icon("plus")}Add</button></div>
    <div class="grid-cards">${m.corpus
      .map(
        (g, i) => `<div class="media-card" style="cursor:default"><div class="img" style="aspect-ratio:1">${g.icon ? `<img src="${esc(g.icon)}" alt="">` : `<span class="faint mono">no icon</span>`}</div>
        <div class="cap"><b>${esc(g.name)}</b><small class="muted">#${i + 1} · ${fmt(g.playing)} playing · ${fmt(g.visits)} visits</small><div class="row" style="margin-top:6px"><button class="btn small" data-act="corpus" data-id="${g.universeId}" data-add="false">Remove</button></div></div></div>`,
      )
      .join("") || `<div class="empty">Empty. Star games from the charts to build it.</div>`}</div>`;
}

function marketBreakouts(m) {
  const rows = m.breakouts;
  return `<h3 class="section-title">Breakouts</h3><p class="muted">Young games the algorithm is pushing right now: under 300,000 visits and over 500 players, seen in the last 7 days. Study them, then take the format with a twist.</p>
    ${rows.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Players (peak)</th><th>Visits</th><th>Age</th><th>Per 1K visits</th><th>Like %</th><th>Genre</th><th>First seen</th></tr></thead><tbody>
    ${rows.map((g) => `<tr><td><b>${esc(g.name)}</b></td><td>${fmt(g.peak)}</td><td>${fmt(g.visits)}</td><td>${g.ageDays ?? "–"}d</td><td>${g.per1kVisits ?? "–"}</td><td>${g.likePct ?? "–"}%</td><td>${esc(g.genre ?? "")}</td><td>${ago(g.firstSeen)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No breakouts in the stored snapshots yet. Refresh the charts a few times over a few days.</div>`}`;
}

// ---------- Library ----------

PAGES.library = {
  title: () => "Library",
  mount(el) {
    el.innerHTML = `<div id="lib-head"></div><div class="row" style="margin:6px 0 16px"><input class="input" id="lib-search" style="flex:1;min-width:220px" placeholder="Search by name or tag: tent, dinosaur, coin…" value="${esc(S.ui.libQuery)}"><div class="seg" id="lib-kinds"></div></div><div id="lib-body"></div>`;
    el.querySelector("#lib-search").addEventListener("input", (e) => {
      S.ui.libQuery = e.target.value;
      this.update(el);
    });
    this.update(el);
  },
  update(el) {
    const lib = S.state.library;
    const onRoblox = lib.assets.filter((a) => a.robloxId).length;
    el.querySelector("#lib-head").innerHTML = `<div class="page-head"><div class="eyebrow">${lib.assets.length} assets · ${onRoblox} on Roblox</div><h2>Library</h2><p>Everything the studio owns and can reuse: models, icons and sounds with their Roblox ids, and every game system the crew has built. Every new game looks here before anything new is made.</p></div>
      <div class="tabs"><button class="tab ${S.ui.libTab === "assets" ? "active" : ""}" data-act="lib-tab" data-id="assets">Assets <span class="pill">${lib.assets.length}</span></button><button class="tab ${S.ui.libTab === "systems" ? "active" : ""}" data-act="lib-tab" data-id="systems">Systems <span class="pill">${lib.systems.length}</span></button></div>`;
    const q = S.ui.libQuery.toLowerCase();
    const match = (x) => (S.ui.game === "all" || !x.game || x.game === S.ui.game) && (!q || [x.name, x.summary, ...(x.tags ?? []), x.game].join(" ").toLowerCase().includes(q));
    if (S.ui.libTab === "systems") {
      el.querySelector("#lib-kinds").innerHTML = "";
      el.querySelector("#lib-body").innerHTML =
        lib.systems.filter(match).map((s) => `<div class="card"><div class="card-head">${s.by ? tile(s.by, "lg") : ""}<div class="grow"><h3>${esc(s.name)}</h3><p class="muted" style="margin:0">${esc(s.summary)}</p><div class="row" style="margin-top:6px">${s.path ? `<span class="mono faint">${esc(s.path)}</span>` : ""}${s.game ? `<span class="pill purple">game:${esc(s.game)}</span>` : ""}</div></div></div></div>`).join("") ||
        `<div class="empty">Builder and Architect register reusable systems here (save system, shop, quests…).</div>`;
      return;
    }
    const kinds = ["all", "model", "icon", "image", "sound", "effect", "animation"];
    el.querySelector("#lib-kinds").innerHTML = kinds.map((k) => `<button class="${S.ui.libKind === k ? "active" : ""}" data-act="lib-kind" data-id="${k}">${k === "all" ? "All" : `${k[0].toUpperCase()}${k.slice(1)}s`} ${k === "all" ? lib.assets.length : lib.assets.filter((a) => a.kind === k).length}</button>`).join("");
    const kindIcon = { model: "box", icon: "image", image: "image", sound: "pulse", effect: "sparkle", animation: "play" };
    el.querySelector("#lib-body").innerHTML =
      `<div class="grid-cards">${lib.assets
        .filter((a) => (S.ui.libKind === "all" || a.kind === S.ui.libKind) && match(a))
        .map(
          (a) => `<div class="media-card" style="cursor:default"><div class="img">${a.media && /\.(png|jpe?g|webp|gif)$/i.test(a.media) ? `<img src="${media(a.media)}" alt="${esc(a.name)}" loading="lazy">` : icon(kindIcon[a.kind] ?? "box")}</div>
          <div class="cap"><b>${esc(a.name)}</b><div class="row" style="gap:6px;margin-top:6px">${a.game ? `<span class="pill purple">game:${esc(a.game)}</span>` : ""}${(a.tags ?? []).slice(0, 3).map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>
          <div class="row" style="margin-top:8px">${a.robloxId ? `<span class="pill green">rbxassetid://${esc(a.robloxId)}</span>` : `<span class="pill">not uploaded</span>${a.media && ["icon", "image"].includes(a.kind) ? `<button class="btn small" data-act="upload-asset" data-id="${a.id}">${icon("upload")}Upload</button>` : ""}`}</div></div></div>`,
        )
        .join("")}</div>` || "";
    if (!lib.assets.length) el.querySelector("#lib-body").innerHTML = `<div class="empty">Librarian, Frame and Splash add models, icons and sounds here as they make or find them.</div>`;
  },
};

// ---------- Vault ----------

function vaultHref(title) {
  const t = title.toLowerCase();
  const page = S.vault?.find((p) => p.title.toLowerCase() === t || p.path.replace(/\.md$/, "").toLowerCase() === t);
  return page ? `#/vault/${encodeURIComponent(page.path)}` : "#/vault";
}

PAGES.vault = {
  title: (arg) => `Vault${arg ? ` · ${arg.split("/").pop().replace(/\.md$/, "")}` : ""}`,
  async mount(el, arg) {
    el.innerHTML = `<div class="page-head"><h2>The vault</h2><p>What the agents study before they build. Open the <span class="mono">vault/</span> folder in Obsidian to edit it; the agents read the pages listed in their role.</p></div><div class="files"><div class="card" style="padding:8px" id="vault-list">Loading…</div><div class="card" id="vault-page"></div></div>`;
    if (!S.vault) S.vault = (await attempt(() => api("GET", "/api/vault"))) ?? [];
    const groups = new Map();
    for (const p of S.vault) {
      const k = p.folder || "Vault";
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(p);
    }
    const target = arg || S.vault[0]?.path;
    el.querySelector("#vault-list").innerHTML =
      [...groups.entries()].map(([g, pages]) => `<div class="nav-label">${esc(g)}</div>${pages.map((p) => `<a class="file-link ${p.path === target ? "active" : ""}" href="#/vault/${encodeURIComponent(p.path)}" style="font-family:var(--sans)">${esc(p.title)}</a>`).join("")}`).join("") ||
      `<p class="muted" style="padding:10px">The vault folder is empty.</p>`;
    if (target) {
      const res = await attempt(() => api("GET", `/api/vault/page?path=${encodeURIComponent(target)}`));
      if (!res) return;
      const { props, body } = splitFrontmatter(res.text);
      const dir = target.split("/").slice(0, -1).join("/");
      const imgSrc = (src) => (/^https?:/.test(src) ? src : `/vault-file/${[dir, src].filter(Boolean).join("/").split("/").map(encodeURIComponent).join("/")}?token=${TOKEN}`);
      el.querySelector("#vault-page").innerHTML = `${props ? `<div class="props">${Object.entries(props).map(([k, v]) => `<span class="k">${esc(k)}</span><span class="row" style="gap:6px">${v.split(",").map((x) => `<span class="pill">${esc(x.trim())}</span>`).join("")}</span>`).join("")}</div>` : ""}<div class="md">${renderMarkdown(body, { wikiHref: vaultHref, imgSrc })}</div>`;
    }
  },
};

// ---------- Settings ----------

PAGES.settings = {
  title: () => "Settings",
  async mount(el) {
    if (!isOwner()) {
      el.innerHTML = `<div class="page-head"><h2>Settings</h2></div><div class="empty">Only ${esc(S.state.owner || "the studio owner")} can change settings. You can do everything else: talk to the Lead and the team, review work, test builds and approve pitches.</div>`;
      return;
    }
    el.innerHTML = `<div class="page-head"><h2>Settings</h2><p>How the crew runs, and what it's connected to. Keys are stored only in <span class="mono">.rocrew/config.json</span> on this computer.</p></div><div id="settings-body">Loading…</div>`;
    [S.settings, S.people] = await Promise.all([attempt(() => api("GET", "/api/settings")), attempt(() => api("GET", "/api/people"))]);
    if (S.settings) this.draw(el);
  },
  update(el) {
    const box = el.querySelector("#connections");
    if (box) box.innerHTML = connectionsHtml();
  },
  draw(el) {
    const v = S.settings;
    el.querySelector("#settings-body").innerHTML = `
      <div class="cols" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
      <div>
        <div class="card"><h3 class="section-title">You</h3>
          <label class="field">Your name <small>For the greeting on Home.</small><input class="input" id="set-ownerName" value="${esc(v.ownerName)}"></label></div>
        <div class="card"><h3 class="section-title">${icon("sparkle")} Claude Code</h3>
          <label class="field">Command <small>How to start Claude Code on this computer. Usually just <span class="mono">claude</span>.</small><input class="input mono" id="set-claudeCommand" value="${esc(v.claudeCommand)}"></label>
          <div class="field">Permissions
            <label class="check"><input type="radio" name="perm" value="safe" ${v.permissionMode === "safe" ? "checked" : ""}><span><b>Safe auto</b><br><small class="muted">Agents may edit files in this folder, use the RoCrew CLI, web search, and your MCP servers (Studio, Blender) without asking. Anything else is refused.</small></span></label>
            <label class="check" style="margin-top:8px"><input type="radio" name="perm" value="auto" ${v.permissionMode === "auto" ? "checked" : ""}><span><b>Auto</b><br><small class="muted">Claude Code's auto mode: its safety check approves routine actions and blocks risky ones, on top of the safe list. Needs a Claude Code version and plan that offer auto mode.</small></span></label>
            <label class="check" style="margin-top:8px"><input type="radio" name="perm" value="autopilot" ${v.permissionMode === "autopilot" ? "checked" : ""}><span><b>Autopilot</b><br><small class="muted">Every tool is allowed, including any shell command. Fastest for unattended runs; only use it on a machine and project you're happy for the agents to change.</small></span></label></div>
          <label class="field">Extra allowed tools <small>Comma-separated Claude Code permission rules, e.g. <span class="mono">Bash(python:*)</span>.</small><input class="input mono" id="set-extraAllowedTools" value="${esc((v.extraAllowedTools ?? []).join(", "))}"></label>
          <div class="row"><label class="field grow">Agents at once<input class="input" type="number" min="1" max="15" id="set-maxParallel" value="${v.maxParallel}"></label>
          <label class="field grow">Task time limit (min)<input class="input" type="number" min="5" id="set-taskTimeoutMin" value="${v.taskTimeoutMin}"></label>
          <label class="field grow">Rounds on their own<input class="input" type="number" min="1" id="set-maxAutoRounds" value="${v.maxAutoRounds}"></label></div>
          <p class="faint" style="margin:0;font-size:12px">Every agent run uses your Claude Code plan's usage. More agents at once finishes sooner but uses it faster.</p></div>
        ${modelsCardHtml(v)}
        <div class="card"><h3 class="section-title">${icon("image")} Gemini</h3>
          <label class="field">API key <small>${v.gemini.apiKeySet ? `Saved (${esc(v.gemini.apiKeyHint)}). Paste a new one to replace it.` : "From Google AI Studio. Used for icons, thumbnails, UI art and second opinions."}</small><input class="input mono" type="password" id="set-gemini-apiKey" placeholder="${v.gemini.apiKeySet ? "••••••••" : "AIza…"}"></label>
          <div class="row"><label class="field grow">Image model<input class="input mono" id="set-gemini-imageModel" value="${esc(v.gemini.imageModel)}"></label><label class="field grow">Text model<input class="input mono" id="set-gemini-textModel" value="${esc(v.gemini.textModel)}"></label></div></div>
        <div class="card"><h3 class="section-title">${icon("upload")} Roblox Open Cloud</h3>
          <label class="field">API key <small>${v.roblox.openCloudKeySet ? `Saved (${esc(v.roblox.openCloudKeyHint)}).` : "Creator Hub → Open Cloud → API Keys, with Assets read + write. Lets agents upload images as decals."}</small><input class="input mono" type="password" id="set-roblox-openCloudKey" placeholder="${v.roblox.openCloudKeySet ? "••••••••" : "paste key"}"></label>
          <div class="row"><label class="field">Upload as<select class="input" id="set-roblox-creatorType"><option value="user" ${v.roblox.creatorType === "user" ? "selected" : ""}>My user</option><option value="group" ${v.roblox.creatorType === "group" ? "selected" : ""}>A group</option></select></label>
          <label class="field grow">User or group id<input class="input mono" id="set-roblox-creatorId" value="${esc(v.roblox.creatorId)}"></label></div></div>
        <div class="card"><h3 class="section-title">${icon("plug")} Network</h3>
          <label class="check"><input type="checkbox" id="set-lan" ${v.host === "0.0.0.0" ? "checked" : ""}><span><b>Open on my phone too</b><br><small class="muted">Listen on your home network so you can open the app from your phone. Restart the app after saving. The page then only opens through a private link, shown here.</small></span></label>
          ${v.phoneUrl ? `<div class="banner blue" style="margin:12px 0 0"><b>Your private phone link</b><span class="mono" style="word-break:break-all">${esc(v.phoneUrl)}</span><br><small>Open it on your phone while it's on the same Wi-Fi. Anyone with this link can control your studio, so keep it to yourself.</small></div>` : ""}</div>
        <div class="row" style="margin-top:14px"><button class="btn primary" data-act="save-settings">${icon("check")}Save settings</button></div>
      </div>
      <div><div class="card"><div class="row"><h3 class="section-title grow" style="margin:0">Connections</h3><button class="btn small" data-act="check-connections">${icon("refresh")}Check again</button></div><div id="connections">${connectionsHtml()}</div></div>
        <div class="card" id="people">${peopleHtml()}</div></div>
      </div>`;
  },
};

const TIER_LABEL = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku" };

function modelsCardHtml(v) {
  const presets = v.presets ?? {};
  const pick = v.modelPreset ?? "balanced";
  const u = S.state.usage;
  return `<div class="card"><h3 class="section-title">${icon("scale")} Models and usage</h3>
    <p class="muted" style="margin-top:0">Opus does the work that decides quality. Sonnet and Haiku take the lighter jobs, so your plan lasts longer. The Lead can also mark a task <b>small</b> (one tier lighter) or <b>big</b> (Opus, extra thinking).</p>
    <div class="field">${[...Object.entries(presets), ["custom", { label: "Pick per agent", blurb: "Choose the model for each agent yourself." }]]
      .map(([key, p]) => `<label class="check" style="margin-top:8px"><input type="radio" name="preset" value="${key}" ${pick === key ? "checked" : ""} data-change="preset"><span><b>${esc(p.label)}</b>${key === "balanced" ? ' <span class="pill purple">recommended</span>' : ""}<br><small class="muted">${esc(p.blurb)}</small></span></label>`)
      .join("")}</div>
    <div class="model-grid" id="model-grid">${modelGridHtml(v, pick)}</div>
    <label class="field" style="margin-top:12px">Force one model for everyone <small>Optional. Overrides the table, for example <span class="mono">sonnet</span> or a full model id. Leave empty to use the table.</small><input class="input mono" id="set-model" value="${esc(v.model)}" placeholder="use the table"></label>
    <label class="field">Stop new work at <small>When your 5-hour or weekly plan usage passes this, agents wait until it resets. What you send the Lead still runs.</small>
      <span class="row"><input class="input" type="number" min="10" max="100" id="set-usageCeilingPct" value="${v.usageCeilingPct}" style="width:90px"><span>%</span></span></label>
    ${u ? `<div class="usage-box">${usageBars(u)}<small class="faint">Last reported by Claude Code ${ago(u.at)}.</small></div>` : `<p class="faint" style="font-size:12px;margin:0">Usage shows here after the first agent run.</p>`}
  </div>`;
}

function modelGridHtml(v, pick) {
  const presets = v.presets ?? {};
  return agents()
    .map((a) => {
      const tier = pick === "custom" ? v.agentModels?.[a.id] ?? presets.balanced?.tiers[a.id] ?? "opus" : presets[pick]?.tiers[a.id] ?? "opus";
      return `<label class="model-cell"><span class="dot" style="color:${a.color}"></span><span class="grow">${esc(a.name)}</span>${
        pick === "custom"
          ? `<select class="input small" data-model-agent="${a.id}">${["opus", "sonnet", "haiku"].map((t) => `<option value="${t}" ${tier === t ? "selected" : ""}>${TIER_LABEL[t]}</option>`).join("")}</select>`
          : `<span class="pill ${{ opus: "purple", sonnet: "blue", haiku: "green" }[tier]}">${TIER_LABEL[tier]}</span>`
      }</label>`;
    })
    .join("");
}

function peopleHtml() {
  const p = S.people;
  if (!p) return `<h3 class="section-title">${icon("users")} Friends</h3><div class="empty">Loading…</div>`;
  const local = `http://localhost:${location.port || 4600}`;
  return `<h3 class="section-title">${icon("users")} Friends</h3>
    <p class="muted" style="margin-top:0">Make games together. Each friend gets their own private link: they can talk to the Lead and the team, review work, test builds and approve pitches. Only you can change Settings. Everything they do shows their name, and the crew runs on your Claude plan.</p>
    <div class="row"><input class="input grow" id="invite-name" placeholder="Friend's name, e.g. Sam" maxlength="40"><button class="btn primary" data-act="invite">${icon("plus")}Invite</button></div>
    ${p.people.length ? p.people.map((f) => `<div class="friend"><div class="row"><span class="tile sm" style="--c:#4aa8ff">${icon("users")}</span><b class="grow">${esc(f.name)}</b><small class="faint">${f.lastSeenAt ? `here ${ago(f.lastSeenAt)}` : "hasn't opened it yet"}</small><button class="btn ghost small" data-act="remove-friend" data-id="${f.id}" data-name="${esc(f.name)}" title="Remove their access">${icon("trash")}</button></div>
      ${(f.links ?? []).map((l) => `<label class="field" style="margin:8px 0 0">${esc(l.kind === "tailscale" ? "Over Tailscale (any Wi-Fi)" : l.kind === "home network" ? "On your Wi-Fi" : l.kind)}<input class="input mono small" readonly value="${esc(l.url)}" data-act="select-all"></label>`).join("")}
      ${f.links?.length ? "" : `<p class="faint" style="font-size:12px;margin:8px 0 0">No link yet: turn on <b>Open on my phone too</b> and restart, or use a tunnel (below).</p>`}
      <label class="field" style="margin:8px 0 0">Their key <small>Add <span class="mono">?key=…</span> to any address that reaches this app, like a tunnel.</small><input class="input mono small" readonly value="${esc(f.key)}" data-act="select-all"></label></div>`).join("") : `<div class="empty" style="margin-top:10px">No friends invited yet.</div>`}
    <details class="how" ${p.people.length ? "" : "open"}><summary><b>How your friend reaches it</b></summary>
      <ol class="steps">
        <li><b>Same house or Wi-Fi:</b> turn on <b>Open on my phone too</b> (left), save, restart the app. Their link appears above.</li>
        <li><b>Different houses, easiest:</b> both install <a href="https://tailscale.com/download" target="_blank" rel="noopener">Tailscale</a> (free) and sign in to the same tailnet, or share this computer with them. Turn on <b>Open on my phone too</b>. Their Tailscale link appears above.</li>
        <li><b>Different houses, no installs for them:</b> on this computer run <span class="mono">cloudflared tunnel --url ${esc(local)}</span>. It prints a <span class="mono">https://….trycloudflare.com</span> address. Send them that address with <span class="mono">/?key=</span> and their key on the end. The address changes each time you start the tunnel.</li>
        <li><b>Building in the same place:</b> in Roblox Studio turn on <b>Team Create</b> (File → Game Settings → Permissions, or the Collaborate button) and add your friend, so you can both open the place while the crew works in it.</li>
      </ol>
      <p class="faint" style="font-size:12px">Anyone with a link can direct your crew and use your Claude plan, so only share it with people you trust. Remove someone here and their link stops working right away.</p></details>`;
}

function connectionsHtml() {
  const c = S.state.connections;
  const ok = (b, text) => `<span class="pill ${b ? "green" : "amber"} state">${text}</span>`;
  return `
    <div class="conn"><span class="tile lg" style="--c:#c26bff">${icon("sparkle")}</span><div class="grow"><b>Claude Code</b><div class="muted">${c.claude?.installed ? `Found: ${esc(c.claude.version)}` : "Runs every agent. Install it, then sign in once by running claude in a terminal."}</div></div>${ok(c.claude?.installed, c.claude ? (c.claude.installed ? "Ready" : "Not found") : "Checking")}</div>
    <div class="conn"><span class="tile lg" style="--c:#22d3a6">${icon("gamepad")}</span><div class="grow"><b>Roblox Studio (MCP)</b>
      <div class="muted">${c.studio ? `Server <span class="mono">${esc(c.studio.name)}</span>: ${esc(c.studio.detail)}` : "Not found in Claude Code's MCP servers."}</div>
      ${c.studio?.status === "connected" ? "" : `<ol class="steps"><li>Open Roblox Studio with your place.</li><li>Open the Assistant, then its settings, then <b>MCP Servers</b>.</li><li>Use quick connect for <b>Claude Code</b> (or copy the command it shows and run it in a terminal).</li><li>Come back and press <b>Check again</b>.</li></ol>`}</div>${ok(c.studio?.status === "connected", c.studio ? c.studio.status : "Not set up")}</div>
    <div class="conn"><span class="tile lg" style="--c:#ff8a3d">${icon("box")}</span><div class="grow"><b>Blender (MCP)</b>
      <div class="muted">For custom models and renders. Needs Blender, the Blender MCP add-on enabled in Blender, and <span class="mono">uv</span> installed (it provides <span class="mono">uvx</span>).</div>
      <label class="check" style="margin-top:8px"><input type="checkbox" data-change="blender" ${c.blender.enabled ? "checked" : ""}><span>Add Blender to this project's <span class="mono">.mcp.json</span></span></label></div>${ok(c.blender.server?.status === "connected", c.blender.server ? c.blender.server.status : c.blender.enabled ? "Added" : "Off")}</div>
    <div class="conn"><span class="tile lg" style="--c:#4aa8ff">${icon("image")}</span><div class="grow"><b>Gemini</b><div class="muted">Images: <span class="mono">${esc(c.gemini.imageModel)}</span> · text: <span class="mono">${esc(c.gemini.textModel)}</span></div></div>${ok(c.gemini.keySet, c.gemini.keySet ? "Key saved" : "No key")}</div>
    <div class="conn"><span class="tile lg" style="--c:#ff5fa2">${icon("upload")}</span><div class="grow"><b>Roblox Open Cloud</b><div class="muted">${c.roblox.keySet ? `Uploads as ${esc(c.roblox.creatorType)} ${esc(c.roblox.creatorId || "(set an id)")}` : "Optional. Lets agents upload images to Roblox."}</div></div>${ok(c.roblox.keySet && c.roblox.creatorId, c.roblox.keySet ? "Key saved" : "Optional")}</div>
    ${c.servers.length ? `<p class="faint" style="font-size:12px">All MCP servers Claude Code knows: ${c.servers.map((s) => `${esc(s.name)} (${esc(s.status)})`).join(", ")}</p>` : ""}
    <p class="faint" style="font-size:12px">Last checked ${ago(c.checkedAt)}.</p>`;
}

async function saveSettings() {
  const val = (id) => document.getElementById(id)?.value ?? "";
  const body = {
    ownerName: val("set-ownerName"),
    claudeCommand: val("set-claudeCommand") || "claude",
    model: val("set-model").trim(),
    modelPreset: document.querySelector('input[name="preset"]:checked')?.value ?? "balanced",
    agentModels: Object.fromEntries([...document.querySelectorAll("[data-model-agent]")].map((x) => [x.dataset.modelAgent, x.value])),
    usageCeilingPct: val("set-usageCeilingPct"),
    permissionMode: document.querySelector('input[name="perm"]:checked')?.value ?? "safe",
    extraAllowedTools: val("set-extraAllowedTools").split(",").map((s) => s.trim()).filter(Boolean),
    maxParallel: val("set-maxParallel"),
    taskTimeoutMin: val("set-taskTimeoutMin"),
    maxAutoRounds: val("set-maxAutoRounds"),
    host: document.getElementById("set-lan")?.checked ? "0.0.0.0" : "127.0.0.1",
    gemini: { apiKey: val("set-gemini-apiKey").trim(), imageModel: val("set-gemini-imageModel").trim(), textModel: val("set-gemini-textModel").trim() },
    roblox: { openCloudKey: val("set-roblox-openCloudKey").trim(), creatorType: val("set-roblox-creatorType"), creatorId: val("set-roblox-creatorId").replace(/\D/g, "") },
  };
  const res = await attempt(() => api("POST", "/api/settings", body), "Settings saved.");
  if (res) {
    S.settings = res;
    await refresh();
    render(true);
  }
}

// ---------- modals ----------

function modal(html) {
  document.getElementById("overlay").innerHTML = `<div class="modal-back" data-act="close-overlay-bg"><div class="modal" role="dialog">${html}</div></div>`;
  document.querySelector(".modal input, .modal textarea, .modal select")?.focus();
}

function newTaskModal(preset = {}) {
  const s = S.state;
  const first = preset.agent ?? "builder";
  modal(`<h3>New task</h3>
    <label class="field">Agent<select class="input" id="nt-agent">${agents().map((a) => `<option value="${a.id}" ${a.id === first ? "selected" : ""}>${esc(a.name)} — ${esc(a.blurb)}</option>`).join("")}</select></label>
    <label class="field">What should they do?<input class="input" id="nt-title" placeholder="Make the shop easier for new players" value="${esc(preset.title ?? "")}"></label>
    <label class="field">Details <small>Goal, where to look, and what "done" means.</small><textarea class="input" id="nt-brief" rows="5">${esc(preset.brief ?? "")}</textarea></label>
    <div class="row"><label class="field grow">Game<select class="input" id="nt-game"><option value="">No game</option>${s.games.map((g) => `<option value="${esc(g.slug)}" ${preset.game === g.slug ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label>
    <label class="field grow">After tasks <small>optional, e.g. t3,t7</small><input class="input mono" id="nt-after"></label></div>
    <label class="field">Size <small>Small runs on a lighter model to save usage; big gets Opus with extra thinking.</small><select class="input" id="nt-size"><option value="normal">Normal</option><option value="small">Small (quick, routine)</option><option value="big">Big (hard, important)</option></select></label>
    <label class="check"><input type="checkbox" id="nt-studio" ${agent(first).studio ? "checked" : ""}><span>Needs Studio <small class="muted">(waits for the Studio lock so only one agent edits the place at a time)</small></span></label>
    <div class="row end" style="margin-top:16px"><button class="btn" data-act="close-overlay">Cancel</button><button class="btn primary" data-act="create-task">${icon("plus")}Queue task</button></div>`);
  document.getElementById("nt-agent").addEventListener("change", (e) => {
    document.getElementById("nt-studio").checked = agent(e.target.value).studio;
  });
}

async function createTask() {
  const val = (id) => document.getElementById(id).value;
  const t = await attempt(() =>
    api("POST", "/api/tasks", {
      agent: val("nt-agent"),
      title: val("nt-title"),
      brief: val("nt-brief"),
      game: val("nt-game"),
      after: val("nt-after"),
      studio: document.getElementById("nt-studio").checked,
      size: val("nt-size"),
      from: "owner",
    }),
  );
  if (t) {
    closeOverlay();
    toast(`Queued for ${agent(t.agent).name}.`);
    await refresh();
  }
}

function newGameModal() {
  modal(`<h3>New game idea</h3>
    <label class="field">Name<input class="input" id="ng-name" placeholder="Rooftop Deliveries"></label>
    <label class="field">The idea <small>In your own words. The Lead turns it into a plan and hands out the work.</small><textarea class="input" id="ng-idea" rows="5" placeholder="Make me a rooftop delivery game with quick rounds and upgrades that keep players coming back."></textarea></label>
    <div class="row end"><button class="btn" data-act="close-overlay">Cancel</button><button class="btn primary" data-act="create-game">${icon("sparkle")}Hand it to the crew</button></div>`);
}

async function createGame() {
  const name = document.getElementById("ng-name").value.trim();
  const idea = document.getElementById("ng-idea").value.trim();
  if (!name) return toast("Give it a name.", true);
  const game = await attempt(() => api("POST", "/api/games", { name }));
  if (!game) return;
  if (idea) await attempt(() => api("POST", "/api/lead/message", { text: `New game: "${name}" (game slug: ${game.slug}).\n\nMy idea: ${idea}\n\nWrite games/${game.slug}/brief.md from this, then run the pipeline.` }));
  closeOverlay();
  toast(idea ? "The Lead has it." : "Game created.");
  await refresh();
  location.hash = `#/games/${game.slug}`;
}

// ---------- command palette ----------

function openPalette() {
  const items = [
    ...Object.entries(PAGES).map(([k, p]) => ({ label: p.title(""), hint: "Page", go: `#/${k}` })),
    ...agents().map((a) => ({ label: `Message ${a.name}`, hint: a.blurb, go: a.id === "lead" ? "#/lead" : `#/team/${a.id}` })),
    ...S.state.games.map((g) => ({ label: g.name, hint: "Game", go: `#/games/${g.slug}` })),
    ...(S.vault ?? []).map((p) => ({ label: p.title, hint: "Vault", go: `#/vault/${encodeURIComponent(p.path)}` })),
    { label: "New task", hint: "Action", act: () => newTaskModal() },
    { label: "New game idea", hint: "Action", act: () => newGameModal() },
    { label: S.state.paused ? "Resume all" : "Pause all", hint: "Action", act: () => togglePause() },
    { label: "Ask Pulse for pitches", hint: "Action", act: () => askPulse() },
    ...S.state.tasks.filter((t) => ["queued", "working"].includes(t.status)).map((t) => ({ label: t.title, hint: `${agent(t.agent).name} · ${t.status}`, go: "#/tasks" })),
  ];
  modal(`<div class="palette"><input id="pal-q" placeholder="Search or jump to…" autocomplete="off"><div class="results" id="pal-r"></div></div>`);
  document.querySelector(".modal").classList.add("palette");
  let sel = 0;
  let shown = items;
  const draw = () => {
    const q = document.getElementById("pal-q").value.toLowerCase();
    shown = items.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(q)).slice(0, 40);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    document.getElementById("pal-r").innerHTML = shown.map((i, n) => `<div class="item ${n === sel ? "sel" : ""}" data-n="${n}">${esc(i.label)}<small>${esc(i.hint)}</small></div>`).join("") || `<p class="muted" style="padding:10px">No matches.</p>`;
  };
  const pick = (i) => {
    if (!i) return;
    closeOverlay();
    if (i.go) location.hash = i.go;
    else i.act();
  };
  const q = document.getElementById("pal-q");
  q.addEventListener("input", () => {
    sel = 0;
    draw();
  });
  q.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") (sel = Math.min(sel + 1, shown.length - 1)), draw(), e.preventDefault();
    else if (e.key === "ArrowUp") (sel = Math.max(sel - 1, 0)), draw(), e.preventDefault();
    else if (e.key === "Enter") pick(shown[sel]);
  });
  document.getElementById("pal-r").addEventListener("click", (e) => pick(shown[Number(e.target.closest(".item")?.dataset.n)]));
  draw();
  q.focus();
}

// ---------- actions ----------

async function togglePause() {
  await attempt(() => api("POST", "/api/pause", { paused: !S.state.paused }), S.state.paused ? "Resumed." : "Paused. Running tasks finish; nothing new starts.");
  await refresh();
}

async function askPulse() {
  const t = await attempt(() =>
    api("POST", "/api/tasks", {
      agent: "pulse",
      from: "owner",
      title: "Pitch 2–3 games from what's growing on Roblox",
      brief: "Refresh the charts, research the rising formats, and submit 2–3 pitches with real numbers.",
    }),
  );
  if (t) toast("Pulse is on it. Pitches land here when ready.");
  await refresh();
}

const ACTIONS = {
  palette: openPalette,
  menu: () => document.getElementById("sidebar").classList.toggle("open"),
  refresh: async () => {
    await refresh();
    if (route().page === "market") S.market = await attempt(() => api("GET", "/api/market"));
    render(true);
    toast("Refreshed.");
  },
  "new-task": () => newTaskModal(),
  "create-task": createTask,
  "new-game": newGameModal,
  "create-game": createGame,
  "ask-pulse": askPulse,
  pause: togglePause,
  send: (el) => sendComposer(el.dataset.key),
  "drop-attachment": (el) => {
    S.ui.attachments[el.dataset.key]?.splice(Number(el.dataset.i), 1);
    el.remove();
  },
  "reset-agent": async (el) => {
    if (!confirm(`Start a fresh conversation for ${agent(el.dataset.id).name}? Their next task begins with a clean context.`)) return;
    await attempt(() => api("POST", `/api/agents/${el.dataset.id}/reset`), "Fresh start.");
    await loadMessages(el.dataset.id);
    refreshChat(el.dataset.id, true);
  },
  "cancel-task": async (el) => {
    await attempt(() => api("POST", `/api/tasks/${el.dataset.id}/cancel`));
    await refresh();
  },
  "select-all": (el) => el.select(),
  invite: async () => {
    const box = document.getElementById("invite-name");
    const name = box.value.trim();
    if (!name) return box.focus();
    const res = await attempt(() => api("POST", "/api/people", { name }), `Invited ${name}. Send them their link.`);
    if (res) {
      S.people = res;
      box.value = "";
      S.ui.drafts["invite-name"] = "";
      document.getElementById("people").innerHTML = peopleHtml();
    }
  },
  "remove-friend": async (el) => {
    if (!confirm(`Remove ${el.dataset.name}? Their link stops working right away.`)) return;
    const res = await attempt(() => api("DELETE", `/api/people/${el.dataset.id}`), `${el.dataset.name} removed.`);
    if (res) {
      S.people = { ...S.people, people: res.people };
      document.getElementById("people").innerHTML = peopleHtml();
    }
  },
  "hide-setup": () => {
    S.ui.hideSetup = true;
    render();
  },
  "check-step": (el) => {
    const list = (S.ui.checks[el.dataset.id] ??= []);
    const i = Number(el.dataset.i);
    S.ui.checks[el.dataset.id] = list.includes(i) ? list.filter((x) => x !== i) : [...list, i];
    el.classList.toggle("checked");
    el.querySelector(".box").innerHTML = el.classList.contains("checked") ? icon("check") : String(i + 1);
  },
  "ask-result": async (el) => {
    const id = el.dataset.id;
    const reply = document.getElementById(`ask-${id}`)?.value.trim() ?? "";
    const result = el.dataset.result;
    if (result === "broken" && !reply && !(S.ui.askMedia[id] ?? []).length) {
      document.getElementById(`ask-${id}`)?.focus();
      return toast("Say what went wrong, or attach a photo or video, so the crew can fix it.", true);
    }
    const ok = await attempt(() => api("POST", `/api/asks/${id}/answer`, { result, reply, media: S.ui.askMedia[id] ?? [] }), result === "works" ? "Nice. Told the Lead it works." : "Sent to the Lead to get it fixed.");
    if (ok) {
      S.ui.drafts[`ask-${id}`] = "";
      delete S.ui.askMedia[id];
      await refresh();
    }
  },
  "ask-reply": async (el) => {
    const box = document.getElementById(`ask-${el.dataset.id}`);
    if (!box.value.trim()) return toast("Write a reply first.", true);
    await attempt(() => api("POST", `/api/asks/${el.dataset.id}/answer`, { reply: box.value.trim(), media: S.ui.askMedia[el.dataset.id] ?? [] }), "Sent to the Lead.");
    delete S.ui.askMedia[el.dataset.id];
    S.ui.drafts[`ask-${el.dataset.id}`] = "";
    await refresh();
  },
  "ask-done": async (el) => {
    const box = document.getElementById(`ask-${el.dataset.id}`);
    await attempt(() => api("POST", `/api/asks/${el.dataset.id}/answer`, { reply: box?.value.trim() ?? "", done: true }), "Marked done.");
    await refresh();
  },
  "review-filter": (el) => {
    S.ui.reviewFilter = el.dataset.id;
    render(true);
  },
  "open-review": (el) => openReview(el.dataset.id),
  "review-prev": () => S.reviewNav?.prev(),
  "review-next": () => S.reviewNav?.next(),
  decide: (el) => decide(el.dataset.id, el.dataset.verdict),
  "close-overlay": closeOverlay,
  "close-overlay-bg": (el, e) => e.target === el && closeOverlay(),
  go: (el) => (location.hash = el.dataset.id),
  "game-tab": (el) => {
    S.ui.gameTab = el.dataset.id;
    render(true);
  },
  "lead-about": (el) => {
    S.ui.drafts.lead = `About ${gameName(el.dataset.id)} (${el.dataset.id}): `;
    location.hash = "#/lead";
  },
  "save-universe": async (el) => {
    const v = document.getElementById(`universe-${el.dataset.id}`).value;
    await attempt(() => api("PATCH", `/api/games/${el.dataset.id}`, { universeId: v }), "Saved.");
    await refresh();
  },
  "fetch-live": async (el) => {
    await attempt(() => api("GET", `/api/games/${el.dataset.id}/live`), "Fetched live numbers.");
    await refresh();
  },
  "open-file": (el) => showFile(el.dataset.slug, el.dataset.id),
  "pick-game": (el) => {
    S.ui.game = el.dataset.id;
    if (route().page === "games" && el.dataset.id !== "all") location.hash = `#/games/${el.dataset.id}`;
    else render(true);
  },
  "pitch-tab": (el) => {
    S.ui.pitchTab = el.dataset.id;
    render(true);
  },
  "pitch-decide": async (el) => {
    const note = document.getElementById(`pitch-note-${el.dataset.id}`)?.value ?? "";
    const ok = await attempt(() => api("POST", `/api/pitches/${el.dataset.id}/decision`, { verdict: el.dataset.verdict, note }), el.dataset.verdict === "approved" ? "Approved. The Lead is starting the build." : "Passed on it.");
    if (ok) await refresh();
  },
  "market-tab": (el) => {
    S.ui.marketTab = el.dataset.id;
    render(true);
  },
  "market-sort": (el) => {
    S.ui.sortId = el.dataset.id;
    render(true);
  },
  "market-refresh": async () => {
    S.ui.busy.market = true;
    render(true);
    S.market = (await attempt(() => api("POST", "/api/market/refresh"))) ?? S.market;
    S.ui.busy.market = false;
    render(true);
  },
  corpus: async (el) => {
    S.market = (await attempt(() => api("POST", "/api/market/corpus", { universeId: el.dataset.id, add: el.dataset.add === "true" }))) ?? S.market;
    render(true);
  },
  "corpus-add": async () => {
    const id = document.getElementById("corpus-add").value;
    S.market = (await attempt(() => api("POST", "/api/market/corpus", { universeId: id, add: true }), "Added.")) ?? S.market;
    render(true);
  },
  "lib-tab": (el) => {
    S.ui.libTab = el.dataset.id;
    render(true);
  },
  "lib-kind": (el) => {
    S.ui.libKind = el.dataset.id;
    render(true);
  },
  "upload-asset": async (el) => {
    el.disabled = true;
    await attempt(() => api("POST", `/api/library/assets/${el.dataset.id}/upload`), "Uploaded to Roblox.");
    await refresh();
  },
  "save-settings": saveSettings,
  "check-connections": async (el) => {
    el.disabled = true;
    await attempt(() => api("POST", "/api/connections/check"));
    await refresh();
  },
};

const CHANGES = {
  preset: (el) => {
    for (const x of document.querySelectorAll("[data-model-agent]")) (S.settings.agentModels ??= {})[x.dataset.modelAgent] = x.value;
    document.getElementById("model-grid").innerHTML = modelGridHtml(S.settings, el.value);
  },
  "review-agent": (el) => {
    S.ui.reviewAgent = el.value;
    render(true);
  },
  blender: async (el) => {
    await attempt(() => api("POST", "/api/connections/blender", { enabled: el.checked }), el.checked ? "Blender added to .mcp.json." : "Blender removed.");
    await refresh();
  },
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) {
    if (el.tagName !== "A") e.preventDefault();
    fn(el, e);
  }
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.change) CHANGES[el.dataset.change]?.(el);
  if (el.dataset.attach) for (const f of el.files) addAttachment(el.dataset.attach, f);
  if (el.dataset.askUpload) {
    const id = el.dataset.askUpload;
    (async () => {
      for (const f of el.files) {
        toast(`Uploading ${f.name}…`);
        const name = await attempt(() => uploadMedia(f));
        if (name) (S.ui.askMedia[id] ??= []).push(name);
      }
      render();
    })();
  }
});
document.addEventListener("input", (e) => {
  const id = e.target.id ?? "";
  if (id.startsWith("composer-")) S.ui.drafts[id.slice(9)] = e.target.value;
  else if (id) S.ui.drafts[id] = e.target.value;
});
document.addEventListener("paste", (e) => {
  const id = document.activeElement?.id ?? "";
  if (!id.startsWith("composer-")) return;
  for (const item of e.clipboardData?.items ?? []) if (item.type.startsWith("image/")) addAttachment(id.slice(9), item.getAsFile());
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
    return;
  }
  if (e.key === "Escape") return closeOverlay();
  const id = document.activeElement?.id ?? "";
  if (id.startsWith("composer-") && e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendComposer(id.slice(9));
    return;
  }
  if (S.reviewNav && !["TEXTAREA", "INPUT"].includes(document.activeElement?.tagName)) {
    const btn = document.querySelector(`.viewer [data-verdict="${{ a: "approved", c: "changes", r: "rejected" }[e.key.toLowerCase()]}"]`);
    if (btn) {
      if (btn.dataset.verdict === "changes" && !document.getElementById("review-note").value.trim()) {
        document.getElementById("review-note").focus();
        toast("Write a note first, then press the button.");
      } else btn.click();
    } else if (e.key === "ArrowLeft") S.reviewNav.prev();
    else if (e.key === "ArrowRight") S.reviewNav.next();
  }
});

// ---------- live data ----------

async function refresh() {
  try {
    S.state = await api("GET", "/api/state");
  } catch (err) {
    document.getElementById("page").innerHTML = `<div class="banner red"><b>Can't reach the RoCrew app.</b>${esc(err.message)}. Is <span class="mono">node studio/server.mjs</span> still running?</div>`;
    return;
  }
  render();
}

let pending = null;
function scheduleRefresh() {
  clearTimeout(pending);
  pending = setTimeout(refresh, 200);
}

function connectEvents() {
  const es = new EventSource(`/api/events?token=${TOKEN}`);
  es.onmessage = (e) => {
    const ev = JSON.parse(e.data);
    if (ev.kind === "message") {
      const list = S.msgs[ev.agent];
      if (list) {
        list.push(ev.message);
        const r = route();
        const viewing = (r.page === "lead" && ev.agent === "lead") || (r.page === "team" && document.querySelector(".agent-row.active")?.getAttribute("href") === `#/team/${ev.agent}`);
        if (viewing) refreshChat(ev.agent);
      }
    }
    scheduleRefresh();
  };
  es.onerror = () => {
    es.close();
    setTimeout(connectEvents, 3000);
  };
}

setInterval(() => {
  if (!document.hidden) render();
}, 15000);

await refresh();
connectEvents();
