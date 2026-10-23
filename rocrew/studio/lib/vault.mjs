// Reading the vault in small pieces. Pages are long (some over 100k characters), so agents
// read a page's card (its Rules and Checklist) and pull other sections by heading, instead
// of loading whole pages into their context and spending the owner's plan on them.

import fs from "node:fs";
import path from "node:path";

const SKIP = /^(sources|references|further reading)\b/i;

export function listPages(vaultDir) {
  const pages = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) pages.push(full);
    }
  };
  walk(vaultDir);
  return pages.map((full) => {
    const text = fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n");
    return {
      file: full,
      path: path.relative(vaultDir, full).split(path.sep).join("/"),
      title: path.basename(full, ".md"),
      folder: path.relative(vaultDir, path.dirname(full)).split(path.sep).join("/"),
      readers: listProp(text, "(?:read_by|for)"),
      skimmers: listProp(text, "also"),
      words: words(text),
      text,
    };
  });
}

function listProp(text, key) {
  const m = new RegExp(`^${key}:\\s*\\[?([^\\]\\n]*)\\]?`, "m").exec(text);
  return (m?.[1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

const words = (text) => text.split(/\s+/).filter(Boolean).length;

/** Find a page by a loose name: "ui" → "05 UI and HUD", "obby" → "Genre - Obby", "05" → "05 …". */
export function findPage(pages, query) {
  const q = String(query ?? "").trim().toLowerCase().replace(/\.md$/, "");
  if (!q) return null;
  const norm = (p) => p.title.toLowerCase();
  return (
    pages.find((p) => norm(p) === q || p.path.toLowerCase() === `${q}.md`) ??
    pages.find((p) => norm(p).replace(/^genre - /, "") === q) ??
    pages.find((p) => /^\d+$/.test(q) && norm(p).startsWith(q.padStart(2, "0") + " ")) ??
    pages.find((p) => norm(p).includes(q)) ??
    pages.find((p) => q.split(/\s+/).every((w) => norm(p).includes(w))) ??
    null
  );
}

/** Split a page into its "## " sections (each including its "### " subsections). */
export function sections(text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const out = [];
  let current = { heading: "(intro)", level: 1, lines: [] };
  let fence = false;
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) fence = !fence;
    const m = !fence && /^(#{1,3}) (.+)$/.exec(line);
    if (m && m[1].length <= 2) {
      if (current.lines.some((l) => l.trim())) out.push(current);
      current = { heading: m[2].trim(), level: m[1].length, lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.some((l) => l.trim())) out.push(current);
  return out.map((s) => ({ heading: s.heading, level: s.level, text: s.lines.join("\n").trim(), words: words(s.lines.join(" ")) }));
}

/** The headings of a page, with sub-headings, for picking what to read. */
export function toc(text) {
  const lines = [];
  let fence = false;
  for (const line of text.replace(/^---\n[\s\S]*?\n---\n?/, "").split("\n")) {
    if (/^```/.test(line)) fence = !fence;
    const m = !fence && /^(#{2,3}) (.+)$/.exec(line);
    if (m) lines.push({ level: m[1].length, heading: m[2].trim() });
  }
  const secs = sections(text);
  return lines.map((l) => ({ ...l, words: l.level === 2 ? secs.find((s) => s.heading === l.heading)?.words ?? 0 : null }));
}

/**
 * A page's card: what an agent reads first. The opening paragraph, every rule as a one-line
 * headline (the Why/How/examples stay in the full page), the checklist and common mistakes.
 * Pages without rules or a checklist fall back to their opening.
 */
export function card(page) {
  const secs = sections(page.text);
  const intro = secs.find((s) => s.level === 1);
  const firstPara = intro ? intro.text.split(/\n\s*\n/).filter((p) => !/^#/.test(p.trim()))[0] ?? "" : "";
  const parts = [`# ${page.title} (card)`, firstPara.trim()];

  const ruleSecs = secs.filter((s) => s.level === 2 && /\brules\b/i.test(s.heading));
  if (ruleSecs.length) {
    for (const s of ruleSecs) parts.push(digestRules(s.text));
  } else {
    // Genre pages keep their rules in "### … rules" / "… laws" subsections.
    for (const s of secs) {
      for (const sub of s.text.split(/\n(?=### )/).slice(1)) {
        if (/\b(rules|laws)\b/i.test(sub.split("\n")[0]) && !/\bmobile|update-day\b/i.test(sub.split("\n")[0])) parts.push(digestRules(sub));
      }
    }
  }
  for (const s of secs.filter((x) => x.level === 2 && /checklist|common mistakes/i.test(x.heading) && !/pitch/i.test(x.heading))) {
    parts.push(s.text.split(/\n(?=#{2,4} references|\*\*references)/i)[0].trim());
  }
  if (parts.length === 2) parts.push(secs.filter((s) => !SKIP.test(s.heading)).map((s) => s.text).join("\n\n").split(/\s+/).slice(0, 700).join(" ") + " …");
  return parts.filter(Boolean).join("\n\n");
}

/** Keep headings and each numbered rule's bold headline; drop the explanation under it. */
function digestRules(text) {
  const out = [];
  for (const line of text.split("\n")) {
    if (/^#{2,4} /.test(line)) out.push(out.length ? `\n${line}` : line);
    else {
      // "1. **Rule.**" or "**1. Rule.**"
      const m = /^\s*(\d+)\.\s+\*\*(.+?)\*\*/.exec(line) ?? /^\s*\*\*(\d+)\.\s+(.+?)\*\*/.exec(line);
      if (m) out.push(`${m[1]}. ${m[2]}`);
    }
  }
  return out.join("\n");
}

/** Sections whose heading (or a sub-heading inside them) matches. */
export function readSections(page, query) {
  const q = String(query).toLowerCase();
  const secs = sections(page.text);
  const hits = secs.filter((s) => s.heading.toLowerCase().includes(q));
  if (hits.length) return hits;
  // Match a "### " sub-heading: return just that subsection.
  const out = [];
  for (const s of secs) {
    const parts = s.text.split(/\n(?=### )/);
    for (const p of parts.slice(1)) if (p.split("\n")[0].toLowerCase().includes(q)) out.push({ heading: p.split("\n")[0].replace(/^### /, ""), level: 3, text: p.trim(), words: words(p) });
  }
  return out;
}

/** Search every page's sections for words; best matches first. */
export function search(pages, query, limit = 12) {
  const terms = String(query).toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const results = [];
  for (const page of pages) {
    for (const s of sections(page.text)) {
      if (SKIP.test(s.heading)) continue;
      const hay = s.text.toLowerCase();
      const head = s.heading.toLowerCase();
      let score = 0;
      for (const t of terms) {
        const n = hay.split(t).length - 1;
        if (!n) {
          score = 0;
          break;
        }
        score += Math.min(n, 12) + (head.includes(t) ? 15 : 0) + (page.title.toLowerCase().includes(t) ? 5 : 0);
      }
      if (score) {
        const i = hay.indexOf(terms[0]);
        const snippet = s.text.slice(Math.max(0, i - 60), i + 140).replace(/\s+/g, " ").trim();
        results.push({ page: page.title, heading: s.heading, words: s.words, score, snippet });
      }
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
