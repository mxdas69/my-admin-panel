// A small, safe Markdown renderer: everything is escaped first, then a known
// subset (headings, lists, tables, code, links, [[wikilinks]], images) is formatted.

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function splitFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { props: null, body: text };
  const props = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv) props[kv[1]] = kv[2].replace(/^\[|\]$/g, "");
  }
  return { props, body: text.slice(m[0].length) };
}

function safeUrl(url) {
  return /^(https?:|#|\/)/i.test(url) ? url : "#";
}

function inline(text, opts) {
  const codes = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${esc(opts.imgSrc ? opts.imgSrc(src) : safeUrl(src))}" loading="lazy">`);
  s = s.replace(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, (_, src) => (opts.imgSrc ? `<img alt="" src="${esc(opts.imgSrc(src))}" loading="lazy">` : ""));
  s = s.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, page, label) =>
    opts.wikiHref ? `<a class="wiki" href="${esc(opts.wikiHref(page.trim()))}">${label ?? page}</a>` : `<span class="wiki">${label ?? page}</span>`,
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener">${label}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

export function renderMarkdown(text, opts = {}) {
  const lines = String(text ?? "").replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const listStack = [];
  const closeLists = (depth = 0) => {
    while (listStack.length > depth) out.push(`</${listStack.pop()}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeLists();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? "")) {
      closeLists();
      const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<table><thead><tr>${head.map((h) => `<th>${inline(h, opts)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, opts)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      closeLists();
      out.push(`<h${h[1].length}>${inline(h[2], opts)}</h${h[1].length}>`);
      i++;
      continue;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      closeLists();
      out.push("<hr>");
      i++;
      continue;
    }
    const li = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) {
      const depth = Math.floor(li[1].replace(/\t/g, "  ").length / 2) + 1;
      const tag = /\d/.test(li[2]) ? "ol" : "ul";
      while (listStack.length < depth) {
        listStack.push(tag);
        out.push(`<${tag}>`);
      }
      closeLists(depth);
      const box = /^\[( |x)\]\s+(.*)$/i.exec(li[3]);
      out.push(`<li>${box ? `${box[1].trim() ? "☑" : "☐"} ${inline(box[2], opts)}` : inline(li[3], opts)}</li>`);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeLists();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${renderMarkdown(buf.join("\n"), opts)}</blockquote>`);
      continue;
    }
    if (!line.trim()) {
      closeLists();
      i++;
      continue;
    }
    closeLists();
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\s*([-*+]|\d+[.)])\s|\s*\|)/.test(lines[i])) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    out.push(`<p>${buf.map((l) => inline(l, opts)).join("<br>")}</p>`);
  }
  closeLists();
  return out.join("\n");
}
