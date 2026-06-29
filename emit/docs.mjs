/* ─────────────────────────────────────────────────────────────
   Foundation · Docs emitter
   Reads the committed release outputs (tokens.json + tokens.inline.css)
   and writes a self-contained, data-driven style-guide page to
   docs/index.html. The page never drifts from the tokens: re-run
   `pnpm build` then `node emit/docs.mjs` (or `pnpm docs`).
   ───────────────────────────────────────────────────────────── */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const tokens = JSON.parse(readFileSync(resolve(root, "release/tokens.json"), "utf8"));
const inlineCss = readFileSync(resolve(root, "release/tokens.inline.css"), "utf8");
// Composites reuse primitive classes (.btn / .input / .input-group / .progress),
// so both reference layers are inlined — token values → atoms → building blocks,
// the order README mandates. Interpolated as data, so backticks in their comments
// are harmless.
const primitivesCss = readFileSync(resolve(root, "primitives/primitives.css"), "utf8");
const compositesCss = readFileSync(resolve(root, "release/composites.css"), "utf8");

// ── Contracts (the AUTHORITATIVE source) ──────────────────────────────────
// The *.md files are the design contracts the CSS implementations answer to.
// Rendered here and shown beside each live demo, so the page carries the spec
// (md) AND the rendered implementation (css) side by side — drift is visible.
function mdToHtml(md){
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const L = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < L.length){
    const line = L[i];
    if (!line.trim()) { i++; continue; }
    // fenced code block (``` … ```) — preserves the ASCII anatomy diagrams verbatim
    if (line.trim().startsWith("```")) {
      const buf = [];
      i++;
      while (i < L.length && !L[i].trim().startsWith("```")) { buf.push(L[i]); i++; }
      i++;
      out.push("<pre class=\"md-pre\"><code>" + esc(buf.join("\n")) + "</code></pre>");
      continue;
    }
    // GFM pipe table (header row, then a |---|---| separator)
    if (line.trim().startsWith("|") && i + 1 < L.length && /-/.test(L[i + 1]) && /^[\s|:-]+$/.test(L[i + 1].trim())){
      const rows = [];
      while (i < L.length && L[i].trim().startsWith("|")) { rows.push(L[i]); i++; }
      const cells = r => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push("<table class=\"md-table\"><thead><tr>" + head.map(c => "<th>" + inline(c) + "</th>").join("") +
        "</tr></thead><tbody>" + body.map(r => "<tr>" + r.map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") +
        "</tbody></table>");
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h){ const lvl = Math.min(6, h[1].length + 3); out.push("<h" + lvl + " class=\"md-h\">" + inline(h[2]) + "</h" + lvl + ">"); i++; continue; }
    if (line.trim().startsWith(">")){
      const buf = [];
      while (i < L.length && L[i].trim().startsWith(">")) { buf.push(L[i].replace(/^\s*>\s?/, "")); i++; }
      out.push("<blockquote class=\"md-quote\">" + inline(buf.join(" ").trim()) + "</blockquote>");
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)){
      const items = [];
      while (i < L.length && /^\s*[-*]\s+/.test(L[i])) { items.push(L[i].replace(/^\s*[-*]\s+/, "")); i++; }
      out.push("<ul class=\"md-ul\">" + items.map(it => "<li>" + inline(it) + "</li>").join("") + "</ul>");
      continue;
    }
    const buf = [];
    while (i < L.length && L[i].trim() && !L[i].trim().startsWith("|") && !L[i].trim().startsWith(">") &&
           !L[i].trim().startsWith("```") &&
           !/^\s*[-*]\s+/.test(L[i]) && !/^#{1,6}\s/.test(L[i])) { buf.push(L[i]); i++; }
    out.push("<p class=\"md-p\">" + inline(buf.join(" ")) + "</p>");
  }
  return out.join("\n");
}
function loadContracts(dir){
  const map = {};
  for (const f of readdirSync(resolve(root, dir))){
    if (!f.endsWith(".md")) continue;
    map[f.replace(/\.md$/, "")] = mdToHtml(readFileSync(resolve(root, dir, f), "utf8"));
  }
  return map;
}
const contracts = { ...loadContracts("primitives"), ...loadContracts("composites") };

// Build stamp — lets you confirm the browser isn't showing a cached page.
const buildTime = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

// Example — a Customers management screen REBUILT on foundation (tokens +
// primitives + composites), modeled on carbon-admin's customer list. Written
// self-contained to docs/example-customer.html and embedded via iframe.
const CUST_ROWS = [
  ["NT", "Northwind Trading", "Seattle, WA", "success", "Active", "2024-03-12", ["ISV", "Merchant"]],
  ["GC", "Globex Corporation", "Austin, TX", "success", "Active", "2024-05-02", ["ISO"]],
  ["IL", "Initech LLC", "San Jose, CA", "warning", "Onboarding", "2026-06-01", []],
  ["UR", "Umbrella Retail", "Raccoon City, IN", "info", "In pilot", "2025-11-20", ["Merchant"]],
  ["AF", "Acme Foods", "Chicago, IL", "error", "Suspended", "2023-09-18", ["ISV"]],
  ["SG", "Soylent Group", "Portland, OR", "neutral", "Expired", "2022-01-30", ["ISO"]],
  ["SI", "Stark Industries", "New York, NY", "success", "Active", "2024-08-08", ["ISV", "ISO", "Merchant"]],
];
const ICON_X = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 6 6 18M6 6l12 12\"/></svg>";
const ICON_CHEVR = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m9 18 6-6-6-6\"/></svg>";
const custRowsHtml = CUST_ROWS.map(([ini, name, city, tone, status, date, tags]) =>
  "<tr class=\"is-clickable\" onclick=\"location.href='example-customer-detail.html'\">" +
    "<td><div class=\"cust\"><span class=\"initials-tile initials-tile--sm\">" + ini + "</span>" +
      "<div><div class=\"cust__name\">" + name + "</div><div class=\"cust__sub\">" + city + "</div></div></div></td>" +
    "<td><span class=\"badge badge--" + tone + "\"><span class=\"badge__dot\"></span> " + status + "</span></td>" +
    "<td class=\"cell-num\">" + date + "</td>" +
    "<td>" + (tags.length
      ? "<div class=\"tag-row\">" + tags.map(t => "<span class=\"badge badge--neutral\">" + t + "</span>").join("") + "</div>"
      : "<span style=\"color:var(--color-content-tertiary)\">—</span>") + "</td>" +
    "<td class=\"cell-right\"><span class=\"chev\">" + ICON_CHEVR + "</span></td>" +
  "</tr>"
).join("");

const exampleHtml = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Example · Customers — built on foundation</title>
<style>
${inlineCss}
${primitivesCss}
${compositesCss}
/* page-local composition — not new design vocabulary */
html, body { margin: 0; }
.cust { display: flex; align-items: center; gap: var(--space-3); }
.cust__name { font-size: var(--text-sm); font-weight: 500; color: var(--color-content-primary); }
.cust__sub { font-size: var(--text-2xs); color: var(--color-content-tertiary); }
.tag-row { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.chev { display: inline-flex; color: var(--color-content-tertiary); }
.chev svg { width: 16px; height: 16px; }
</style>
</head>
<body>
<div class="app-frame">
  <aside class="app-frame__sidebar">
    <div class="app-frame__brand">◆ TOMS</div>
    <nav class="app-frame__nav">
      <div class="app-frame__nav-label">Management</div>
      <a class="app-frame__nav-item app-frame__nav-item--active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.9"/></svg> Customers</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg> Orders</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M10 18h4"/></svg> Devices</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> Apps</a>
    </nav>
  </aside>
  <div class="app-frame__col">
    <div class="app-frame__header"><strong style="font-size:var(--text-sm)">Customer Admin</strong><span class="app-frame__spacer"></span><div class="app-frame__avatar">LC</div></div>
    <div class="app-frame__main">
      <div class="page-header">
        <div class="page-header__bar">
          <div class="page-header__titles">
            <div class="page-header__heading"><span class="page-header__title">Customers</span><span class="page-header__count">1,248</span></div>
            <div class="page-header__description">Maintain customer companies, their contracts and operators.</div>
          </div>
          <div class="page-header__actions">
            <button class="btn btn--secondary">Import</button>
            <button class="btn btn--primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> New customer</button>
          </div>
        </div>
      </div>
      <div class="page-body">
        <div class="condition-band">
          <div class="condition-band__toolbar">
            <div class="search-input"><span class="search-input__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span><input class="input" placeholder="Search by name, address, license"></div>
            <select class="select"><option>All contracts</option><option>ISV</option><option>ISO</option><option>Merchant</option></select>
            <select class="select"><option>All statuses</option><option>With active contract</option><option>In pilot</option><option>With expired contract</option><option>With suspended contract</option><option>Onboarding</option><option>All terminated</option></select>
            <button class="btn btn--secondary">Search</button>
          </div>
          <div class="applied-filters">
            <span class="applied-filters__label">Filters:</span>
            <span class="filter-chip">Status: With active contract <button class="filter-chip__remove">${ICON_X}</button></span>
            <span class="filter-chip">Contract: ISV <button class="filter-chip__remove">${ICON_X}</button></span>
            <button class="btn btn--link btn--sm">Clear all</button>
          </div>
        </div>
        <div class="table-frame table-frame--flush">
          <div class="summary-bar">
            <div class="summary-bar__count"><strong>1,248</strong> customers</div>
            <div class="summary-bar__actions"><button class="btn btn--ghost btn--sm">Export</button></div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr>
                <th style="width:34%">Customer</th>
                <th style="width:14%">Status</th>
                <th style="width:16%"><button class="th-sort">Registered <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button></th>
                <th>Contracts</th>
                <th style="width:48px"></th>
              </tr></thead>
              <tbody>${custRowsHtml}</tbody>
            </table>
          </div>
          <div class="pagination">
            <div class="pagination__info">
              <div class="pagination__rows">Rows <select class="select select--sm"><option>25</option><option>50</option><option>100</option></select></div>
              <span class="pagination__summary">Showing <strong>1–25</strong> of <strong>1,248</strong></span>
            </div>
            <div class="pagination__pages">
              <button class="pagination__page" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Prev</button>
              <span class="pagination__current">1 / 50</span>
              <button class="pagination__page">Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// Customer DETAIL page — the screen a list row navigates to (detail-page pattern:
// detail-header band + line tabs, body = kv-grid overview + section-cards + feed).
const exampleDetailHtml = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Example · Customer detail — built on foundation</title>
<style>
${inlineCss}
${primitivesCss}
${compositesCss}
html, body { margin: 0; }
.mono { font-family: var(--font-mono); }
.ov-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: var(--space-4); align-items: start; }
@media (max-width: 860px) { .ov-grid { grid-template-columns: 1fr; } }
.rail { display: flex; flex-direction: column; gap: var(--space-3); }
.tab-panel { display: flex; flex-direction: column; gap: var(--space-6); }
.tab-panel[hidden] { display: none; }
</style>
</head>
<body>
<div class="app-frame">
  <aside class="app-frame__sidebar">
    <div class="app-frame__brand">◆ TOMS</div>
    <nav class="app-frame__nav">
      <div class="app-frame__nav-label">Management</div>
      <a class="app-frame__nav-item app-frame__nav-item--active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.9"/></svg> Customers</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg> Orders</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M10 18h4"/></svg> Devices</a>
      <a class="app-frame__nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> Apps</a>
    </nav>
  </aside>
  <div class="app-frame__col">
    <div class="app-frame__header"><strong style="font-size:var(--text-sm)">Customer Admin</strong><span class="app-frame__spacer"></span><div class="app-frame__avatar">LC</div></div>
    <div class="app-frame__main">
      <div class="detail-header">
        <div class="detail-header__bar">
          <button class="btn btn--ghost btn--icon detail-header__back" aria-label="Back" onclick="location.href='example-customer.html'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <div class="detail-header__logo">N</div>
          <div class="detail-header__main">
            <div class="detail-header__title"><span class="detail-header__name">Northwind Trading</span><span class="badge badge--success"><span class="badge__dot"></span> Active</span></div>
            <div class="detail-header__meta"><span class="mono">cust_8f2a91</span><span>Seattle, WA</span><span>Registered 2024-03-12</span><span>12 operators</span></div>
          </div>
          <div class="detail-header__actions">
            <button class="btn btn--secondary btn--sm">Edit</button>
            <button class="btn btn--ghost btn--icon btn--sm" aria-label="More"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
          </div>
        </div>
        <div class="detail-header__tabs">
          <div class="tabs__list tabs__list--line">
            <button class="tabs__trigger tabs__trigger--active" data-tab="overview">Overview</button>
            <button class="tabs__trigger" data-tab="contracts">Contracts</button>
            <button class="tabs__trigger" data-tab="operators">Operators</button>
            <button class="tabs__trigger" data-tab="activity">Activity</button>
          </div>
        </div>
      </div>
      <div class="page-body">
        <div class="tab-panel" data-panel="overview">
        <div class="ov-grid">
          <div class="card section-card" data-open="true">
            <button class="card__header section-card__toggle"><strong>Customer details</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
            <div class="card__content">
              <dl class="kv-grid">
                <div class="kv-grid__row"><dt>Legal name</dt><dd>Northwind Trading Co.</dd></div>
                <div class="kv-grid__row"><dt>Customer ID</dt><dd class="mono">cust_8f2a91</dd></div>
                <div class="kv-grid__row"><dt>Status</dt><dd><span class="badge badge--success"><span class="badge__dot"></span> Active</span></dd></div>
                <div class="kv-grid__row"><dt>Region</dt><dd>Seattle, WA · US-West</dd></div>
                <div class="kv-grid__row"><dt>Registered</dt><dd class="mono">2024-03-12</dd></div>
                <div class="kv-grid__row"><dt>License</dt><dd class="mono">LIC-4821-NW</dd></div>
                <div class="kv-grid__row"><dt>Primary contact</dt><dd>a.lee@northwind.co</dd></div>
                <div class="kv-grid__row kv-grid__row--full"><dt>Address</dt><dd>1200 Pike St, Suite 400, Seattle, WA 98101, United States</dd></div>
              </dl>
            </div>
          </div>
          <div class="rail">
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">Live contracts</span></div><div class="stat-card__value">2</div></div>
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">Operators</span></div><div class="stat-card__value">12</div></div>
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">Open tickets</span></div><div class="stat-card__value stat-card__value--warning">1</div></div>
          </div>
        </div>
        </div>
        <div class="tab-panel" data-panel="contracts" hidden>
        <div class="card section-card" data-open="true">
          <button class="card__header section-card__toggle"><strong>Live contracts</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
          <div class="card__content card__content--flush">
            <div class="table-scroll"><table class="data-table data-table--compact">
              <thead><tr><th>Type</th><th>Status</th><th>Effective from</th><th>Effective to</th></tr></thead>
              <tbody>
                <tr><td><span class="badge badge--neutral">ISV</span></td><td><span class="badge badge--success"><span class="badge__dot"></span> Active</span></td><td class="cell-num">2024-03-12</td><td class="cell-num">2026-03-11</td></tr>
                <tr><td><span class="badge badge--neutral">Merchant</span></td><td><span class="badge badge--success"><span class="badge__dot"></span> Active</span></td><td class="cell-num">2024-06-01</td><td class="cell-num">2025-12-31</td></tr>
              </tbody>
            </table></div>
          </div>
        </div>
        </div>
        <div class="tab-panel" data-panel="operators" hidden>
          <div class="card section-card" data-open="true">
            <button class="card__header section-card__toggle"><strong>Operators</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
            <div class="card__content card__content--flush">
              <div class="table-scroll"><table class="data-table data-table--compact">
                <thead><tr><th>Operator</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Alice Lee</td><td class="cell-num">a.lee@northwind.co</td><td><span class="badge badge--neutral">Admin</span></td><td><span class="badge badge--success"><span class="badge__dot"></span> Active</span></td></tr>
                  <tr><td>Marco Ortiz</td><td class="cell-num">m.ortiz@northwind.co</td><td><span class="badge badge--neutral">Operator</span></td><td><span class="badge badge--success"><span class="badge__dot"></span> Active</span></td></tr>
                  <tr><td>Kira Shaw</td><td class="cell-num">k.shaw@northwind.co</td><td><span class="badge badge--neutral">Operator</span></td><td><span class="badge badge--warning"><span class="badge__dot"></span> Invited</span></td></tr>
                </tbody>
              </table></div>
            </div>
          </div>
        </div>
        <div class="tab-panel" data-panel="activity" hidden>
        <div class="card section-card" data-open="true">
          <button class="card__header section-card__toggle"><strong>Recent activity</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
          <div class="card__content card__content--flush">
            <div class="feed-list">
              <div class="feed-item">
                <div class="feed-item__icon feed-item__icon--success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg></div>
                <div class="feed-item__main">
                  <div class="feed-item__head">Contract · ISV</div>
                  <div class="feed-item__title">ISV contract renewed</div>
                  <div class="feed-item__body">Extended to 2026-03-11 by m.ortiz.</div>
                </div>
                <div class="feed-item__time">2h ago</div>
              </div>
              <div class="feed-item feed-item--read">
                <div class="feed-item__icon feed-item__icon--info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg></div>
                <div class="feed-item__main">
                  <div class="feed-item__head">Operator · invited</div>
                  <div class="feed-item__title">Invitation sent to k.shaw@northwind.co</div>
                  <div class="feed-item__body">Role: Operator · expires in 7 days.</div>
                </div>
                <div class="feed-item__time">1d ago</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <script>(function(){var tabs=document.querySelectorAll(".tabs__trigger[data-tab]");var panels=document.querySelectorAll(".tab-panel[data-panel]");tabs.forEach(function(t){t.addEventListener("click",function(){tabs.forEach(function(x){x.classList.remove("tabs__trigger--active");});t.classList.add("tabs__trigger--active");var name=t.getAttribute("data-tab");panels.forEach(function(p){p.hidden=p.getAttribute("data-panel")!==name;});});});})();</script>
    </div>
  </div>
</div>
</body>
</html>`;

const page = `<!doctype html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<title>Foundation · 设计规范</title>
<style>
/* ── 1. inlined token values (release/tokens.inline.css) ── */
${inlineCss}

/* ── 2. primitive atoms (.btn / .input / .badge …) ── */
${primitivesCss}

/* ── 3. composite building blocks (reuse the atoms above) ── */
${compositesCss}

/* ── page chrome (uses only foundation tokens) ── */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--color-surface-1);
  color: var(--color-content-primary);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; }
code, .mono { font-family: var(--font-mono); }

/* layout */
.shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
.nav {
  position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto;
  border-right: 1px solid var(--color-line-default);
  background: var(--color-surface-2);
  padding: var(--space-6) var(--space-5);
}
.nav h1 { font-size: var(--text-lg); margin: 0 0 var(--space-1); letter-spacing: -0.01em; }
.nav .ver { font-size: var(--text-xs); color: var(--color-content-tertiary); margin-bottom: var(--space-6); }
.nav a {
  display: block; text-decoration: none; padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md); font-size: var(--text-sm);
  color: var(--color-content-secondary);
}
.nav a:hover { background: var(--color-surface-hover); color: var(--color-content-primary); }
.nav a.nav-parent { margin-top: var(--space-3); font-weight: 600; color: var(--color-content-primary); }
/* nested component sub-menu */
.subnav { display: flex; flex-direction: column; margin: 2px 0 var(--space-2) var(--space-2); padding-left: var(--space-2); border-left: 1px solid var(--color-line-default); }
.nav .subnav a { font-size: var(--text-xs); color: var(--color-content-tertiary); padding: 3px var(--space-2); }
.nav .subnav a:hover { color: var(--color-content-primary); }
.main { padding: var(--space-12) var(--space-12); max-width: 1320px; margin-inline: auto; }

/* header bar */
.topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-10); gap: var(--space-4); }
.topbar p { margin: var(--space-2) 0 0; color: var(--color-content-secondary); max-width: 60ch; }
.theme-btn {
  font-family: var(--font-sans); font-size: var(--text-sm); cursor: pointer;
  height: var(--spacing-control-md); padding: 0 var(--spacing-cx-md);
  border: 1px solid var(--color-line-strong); border-radius: var(--radius-md);
  background: var(--color-surface-2); color: var(--color-content-primary);
  transition: background var(--duration-fast) var(--ease-standard);
  white-space: nowrap;
}
.theme-btn:hover { background: var(--color-surface-hover); }

/* sections */
section { margin-bottom: var(--space-16); scroll-margin-top: var(--space-6); }
section > h2 {
  font-size: var(--text-2xl); margin: 0 0 var(--space-1); letter-spacing: -0.02em;
}
section > .lede { margin: 0 0 var(--space-6); color: var(--color-content-secondary); max-width: 64ch; }
h3.group { font-size: var(--text-sm); letter-spacing: 0.02em;
  color: var(--color-content-tertiary); margin: var(--space-8) 0 var(--space-3); font-weight: 600;
  scroll-margin-top: var(--space-4); }

/* swatch grid */
.grid { display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
.swatch {
  border: 1px solid var(--color-line-default); border-radius: var(--radius-lg);
  overflow: hidden; background: var(--color-surface-2); box-shadow: var(--shadow-1);
}
.swatch .chip { height: 64px; }
.swatch .meta { padding: var(--space-2) var(--space-3); }
.swatch .name { font-size: var(--text-sm); font-weight: 550; }
.swatch .val { font-size: var(--text-2xs); color: var(--color-content-tertiary); font-family: var(--font-mono); word-break: break-all; }

/* ramp row */
.ramp { display: flex; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-line-default); margin-bottom: var(--space-4); box-shadow: var(--shadow-1); }
.ramp__step { flex: 1; min-width: 0; }
.ramp__step .bar { height: 56px; }
.ramp__step .lbl { font-size: var(--text-2xs); text-align: center; padding: var(--space-1) 2px; color: var(--color-content-tertiary); font-family: var(--font-mono); }

/* type scale */
.type-row { display: flex; align-items: baseline; gap: var(--space-5); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-line-subtle); }
.type-row .tk { width: 188px; flex: none; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-content-tertiary); }
.type-row .tk b { color: var(--color-content-secondary); font-weight: 600; }
.type-row .sample { line-height: 1.2; letter-spacing: -0.01em; }

/* font cards */
.font-card { border: 1px solid var(--color-line-default); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-4); background: var(--color-surface-2); }
.font-card .fc-cap { font-size: var(--text-xs); letter-spacing: 0.02em; color: var(--color-content-tertiary); margin-bottom: var(--space-2); }
.font-card .show { font-size: var(--text-2xl); letter-spacing: -0.01em; }
.font-card .glyphs { margin-top: var(--space-2); color: var(--color-content-secondary); }
.font-card .stack { margin-top: var(--space-3); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-content-tertiary); word-break: break-all; }

/* radius / shadow / spacing demos */
.demo-grid { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.demo {
  border: 1px solid var(--color-line-default); border-radius: var(--radius-lg);
  background: var(--color-surface-2); padding: var(--space-4);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center;
}
.demo .box { width: 72px; height: 56px; background: var(--color-primary-700); }
.demo.shadow .box { background: var(--color-surface-2); border: 1px solid var(--color-line-subtle); }
.demo .name { font-size: var(--text-sm); font-weight: 550; }
.demo .val { font-size: var(--text-2xs); font-family: var(--font-mono); color: var(--color-content-tertiary); word-break: break-all; }
.space-row { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line-subtle); }
.space-row .tk { width: 120px; flex: none; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-content-secondary); }
.space-row .bar { height: 14px; background: var(--color-accent-500); border-radius: var(--radius-sm); }
.space-row .v { font-size: var(--text-xs); color: var(--color-content-tertiary); font-family: var(--font-mono); }

/* principles */
.principles { display: grid; gap: var(--space-3); }
.principle { border: 1px solid var(--color-line-default); border-left: 3px solid var(--color-primary-700); border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); background: var(--color-surface-2); }
.principle h4 { margin: 0 0 var(--space-1); font-size: var(--text-md); }
.principle p { margin: 0; color: var(--color-content-secondary); font-size: var(--text-sm); }

/* composite demo wrapper */
.cx-demo {
  border: 1px solid var(--color-line-default);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  overflow: hidden;
  margin-bottom: var(--space-4);
}
.cx-demo__head {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-line-subtle);
}
.cx-demo__name { font-size: var(--text-md); font-weight: 600; }
.cx-demo__name code { font-size: var(--text-xs); color: var(--color-content-tertiary); font-weight: 400; margin-left: var(--space-2); }
.cx-demo__desc { font-size: var(--text-sm); color: var(--color-content-secondary); margin-top: 2px; }
/* the live render surface — recessed so surface-2 components pop */
.cx-demo__body { padding: var(--space-5); background: var(--color-surface-1); }
.cx-demo__body--center { display: flex; justify-content: center; }

/* stage: contains position:fixed overlays (modal/sheet/drawer) inside the demo */
.cx-stage {
  position: relative; overflow: hidden; min-height: 260px;
  border-radius: var(--radius-lg); border: 1px solid var(--color-line-subtle);
  background: var(--color-surface-1);
}
.cx-stage .modal-overlay, .cx-stage .alert-dialog-overlay,
.cx-stage .sheet-overlay, .cx-stage .drawer-overlay,
.cx-stage .modal, .cx-stage .alert-dialog,
.cx-stage .sheet, .cx-stage .drawer { position: absolute; }

/* click-to-inspect: a floating readout of an element's resolved style values */
/* hover outline marks exactly the element a click will inspect */
.cx-hl {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
#cx-inspector {
  position: fixed; z-index: 1000; max-width: 460px;
  background: var(--color-surface-2); color: var(--color-content-primary);
  border: 1px solid var(--color-line-strong); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-4); overflow: hidden;
  font-family: var(--font-mono); font-size: var(--text-sm);
}
#cx-inspector[hidden] { display: none; }
.cx-inspector__head {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-3); border-bottom: 1px solid var(--color-line-subtle);
}
.cx-inspector__sel { color: var(--color-primary-500); word-break: break-all; }
.cx-inspector__close {
  flex-shrink: 0; border: 0; background: transparent; cursor: pointer;
  color: var(--color-content-tertiary); font-family: var(--font-sans);
  font-size: var(--text-lg); line-height: 1; padding: 0 var(--space-1);
}
.cx-inspector__close:hover { color: var(--color-content-primary); }
.cx-inspector__grid { display: grid; grid-template-columns: max-content 1fr; gap: 2px var(--space-3); margin: 0; padding: var(--space-2) var(--space-3); }
.cx-inspector__grid dt { color: var(--color-content-tertiary); }
.cx-inspector__grid dd { color: var(--color-content-secondary); margin: 0; word-break: break-all; }

/* ── in-page annotations ── */
#anno-launch {
  position: fixed; right: var(--space-5); bottom: var(--space-5); z-index: 950;
  display: flex; align-items: center; gap: var(--space-2);
  height: var(--spacing-control-lg); padding: 0 var(--spacing-cx-lg);
  border: 1px solid var(--color-line-strong); border-radius: var(--radius-full);
  background: var(--color-surface-2); color: var(--color-content-primary);
  font-family: var(--font-sans); font-size: var(--text-sm); cursor: pointer;
  box-shadow: var(--shadow-3);
}
#anno-launch:hover { background: var(--color-surface-hover); }
#anno-launch .n { font-family: var(--font-mono); color: var(--color-content-tertiary); }

/* inspect-mode toggle — same fixed pill as #anno-launch, docked one row above it */
#inspectToggle {
  position: fixed; right: var(--space-5);
  bottom: calc(var(--space-5) + var(--spacing-control-lg) + var(--space-2)); z-index: 950;
  display: flex; align-items: center; gap: var(--space-2);
  height: var(--spacing-control-lg); padding: 0 var(--spacing-cx-lg);
  border: 1px solid var(--color-line-strong); border-radius: var(--radius-full);
  background: var(--color-surface-2); color: var(--color-content-primary);
  font-family: var(--font-sans); font-size: var(--text-sm); cursor: pointer;
  box-shadow: var(--shadow-3); white-space: nowrap;
}
#inspectToggle:hover { background: var(--color-surface-hover); }
#inspectToggle[aria-pressed="false"] { color: var(--color-content-tertiary); }

#anno-layer { position: fixed; inset: 0; pointer-events: none; z-index: 949; }
.anno-pin {
  position: fixed; transform: translate(-50%, -50%); pointer-events: auto;
  min-width: var(--space-5); height: var(--space-5); padding: 0 4px;
  border: 1.5px solid var(--color-surface-2); border-radius: var(--radius-full);
  background: var(--color-primary-700); color: var(--color-content-on-primary);
  font-family: var(--font-mono); font-size: var(--text-2xs); line-height: 1;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  box-shadow: var(--shadow-2);
}

body.anno-on main { cursor: crosshair; }
.anno-hl { outline: 2px dashed var(--color-primary-500); outline-offset: 2px; }
@keyframes anno-flash { 0%, 100% { outline-color: transparent; } 30% { outline-color: var(--color-primary-500); } }
.anno-flash { outline: 2px solid transparent; outline-offset: 2px; animation: anno-flash 1.2s var(--ease-standard); }

#anno-panel {
  position: fixed; right: var(--space-5); bottom: calc(var(--space-5) + 2 * var(--spacing-control-lg) + 2 * var(--space-2));
  z-index: 951; width: 340px; max-width: calc(100vw - 2 * var(--space-5)); max-height: 64vh;
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--color-surface-2); border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-5); font-family: var(--font-sans);
}
#anno-panel[hidden] { display: none; }
.anno-panel__head { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-line-subtle); }
.anno-panel__head strong { font-size: var(--text-md); }
#anno-count { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-content-tertiary); }
.anno-mode { margin-left: auto; display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); color: var(--color-content-secondary); cursor: pointer; }
.anno-x { border: 0; background: transparent; cursor: pointer; color: var(--color-content-tertiary); font-size: var(--text-lg); line-height: 1; font-family: var(--font-sans); padding: 0 var(--space-1); }
.anno-x:hover { color: var(--color-content-primary); }
.anno-list { overflow-y: auto; padding: var(--space-2); display: flex; flex-direction: column; gap: 2px; }
.anno-empty { padding: var(--space-5) var(--space-4); text-align: center; color: var(--color-content-tertiary); font-size: var(--text-sm); line-height: 1.5; }
.anno-row { display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-2); align-items: start; padding: var(--space-2); border-radius: var(--radius-md); cursor: pointer; }
.anno-row:hover { background: var(--color-surface-hover); }
.anno-row__n { flex-shrink: 0; width: var(--space-5); height: var(--space-5); border-radius: var(--radius-full); background: var(--color-primary-700); color: var(--color-content-on-primary); font-family: var(--font-mono); font-size: var(--text-2xs); display: flex; align-items: center; justify-content: center; }
.anno-list__note { font-size: var(--text-xs); color: var(--color-content-primary); line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
.anno-list__sel { margin-top: 2px; font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-content-tertiary); word-break: break-all; }
.anno-foot { display: flex; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--color-line-subtle); }

#anno-composer {
  position: fixed; z-index: 1002; width: 300px; max-width: calc(100vw - 16px);
  display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-3);
  background: var(--color-surface-2); border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-4); font-family: var(--font-sans);
}
#anno-composer[hidden] { display: none; }
.anno-composer__sel { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-primary-500); word-break: break-all; }
#anno-text { min-height: 64px; }
.anno-composer__row { display: flex; align-items: center; gap: var(--space-2); }

/* per-component CONTRACT panel (the authoritative .md, rendered) */
.contract { border-top: 1px solid var(--color-line-subtle); }
.contract > summary {
  cursor: pointer; user-select: none; list-style: none;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs); font-weight: 600; color: var(--color-primary-500);
}
.contract > summary::-webkit-details-marker { display: none; }
.contract > summary::before { content: "▸  "; color: var(--color-content-tertiary); font-weight: 400; }
.contract[open] > summary::before { content: "▾  "; }
.contract__body { padding: var(--space-1) var(--space-5) var(--space-5); background: var(--color-surface-2); }
.contract__sep { border: 0; border-top: 1px dashed var(--color-line-default); margin: var(--space-6) 0; }
/* rendered-markdown elements (scoped to contract panels) */
.md-h { color: var(--color-content-primary); margin: var(--space-4) 0 var(--space-2); letter-spacing: -0.01em; }
h4.md-h { font-size: var(--text-lg); }
h5.md-h { font-size: var(--text-md); margin-top: var(--space-5); }
h6.md-h { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-content-tertiary); }
.md-p { margin: var(--space-2) 0; font-size: var(--text-sm); line-height: 1.6; color: var(--color-content-secondary); }
.md-ul { margin: var(--space-2) 0; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-1); }
.md-ul li { list-style: disc; font-size: var(--text-sm); line-height: 1.55; color: var(--color-content-secondary); }
.md-quote { margin: var(--space-3) 0; padding: var(--space-2) var(--space-4); border-left: 3px solid var(--color-line-strong); background: var(--color-surface-3); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--color-content-tertiary); line-height: 1.55; }
.contract code { font-family: var(--font-mono); font-size: 0.88em; background: var(--color-surface-3); padding: 1px var(--space-1); border-radius: var(--radius-sm); color: var(--color-content-primary); }
.md-table { border-collapse: collapse; width: 100%; margin: var(--space-3) 0; font-size: var(--text-xs); display: block; overflow-x: auto; }
.md-table th, .md-table td { border: 1px solid var(--color-line-default); padding: var(--space-2) var(--space-3); text-align: left; vertical-align: top; }
.md-table th { background: var(--color-surface-3); color: var(--color-content-secondary); font-weight: 600; white-space: nowrap; }
.md-table td { color: var(--color-content-secondary); }
.contract a { color: var(--color-primary-500); }

/* fenced code blocks (ASCII anatomy diagrams) */
.md-pre { margin: var(--space-3) 0; padding: var(--space-3) var(--space-4); background: var(--color-surface-3); border: 1px solid var(--color-line-subtle); border-radius: var(--radius-md); overflow-x: auto; }
.md-pre code { font-family: var(--font-mono); font-size: var(--text-2xs); line-height: 1.5; color: var(--color-content-secondary); white-space: pre; background: none; padding: 0; }
/* pattern (L3) card — renders the full archetype contract */
.pattern { border: 1px solid var(--color-line-default); border-radius: var(--radius-lg); background: var(--color-surface-2); padding: var(--space-4) var(--space-6) var(--space-6); margin-bottom: var(--space-5); }
.pattern .md-h:first-child { margin-top: var(--space-2); }
.pattern a { color: var(--color-primary-500); }
/* live example frame (the assembled page prototype, isolated in an iframe) */
.pattern__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-content-tertiary); }
.pattern__bar a { color: var(--color-primary-500); text-decoration: none; }
.pattern__bar a:hover { text-decoration: underline; }
.pattern-frame { display: block; width: 100%; height: 580px; margin-top: var(--space-2); margin-bottom: var(--space-3); border: 1px solid var(--color-line-default); border-radius: var(--radius-lg); background: var(--color-surface-1); }

@media (max-width: 820px) {
  .shell { grid-template-columns: 1fr; }
  .nav { position: static; height: auto; }
  .main { padding: var(--space-8) var(--space-5); }
}
</style>
</head>
<body>
<div class="shell">
  <aside class="nav">
    <h1>Foundation</h1>
    <div class="ver">设计规范 · v${pkgVersion()}<br>构建 ${buildTime}</div>
    <a href="#principles">设计准则</a>
    <a href="#color">颜色</a>
    <a href="#type">字号</a>
    <a href="#fonts">字体</a>
    <a href="#radius">圆角</a>
    <a href="#shadow">阴影</a>
    <a href="#spacing">间距</a>
    <a href="#layout">布局与断点</a>
    <a href="#motion">动效</a>
    <a href="#primitives" class="nav-parent">原子 Primitives</a>
    <div class="subnav" id="subnav-primitives"></div>
    <a href="#composites" class="nav-parent">组件 Composites</a>
    <div class="subnav" id="subnav-composites"></div>
    <a href="#example" class="nav-parent">示例 Example</a>
    <div class="subnav" id="subnav-example"></div>
  </aside>
  <main class="main">
    <div class="topbar">
      <div>
        <h2 style="font-size:var(--text-3xl);margin:0;letter-spacing:-0.02em;">设计规范</h2>
        <p>颜色、字体、间距的单一事实来源 —— 全部从 <code>release/tokens.json</code> 实时读取。本页没有任何手写的值；每个使用方（Next 应用与 artifact 原型）都读取同一套 token。</p>
      </div>
      <button class="theme-btn" id="themeToggle">◐ 深色</button>
    </div>
    <div id="content"></div>

    <!-- ═══════════ Primitives (static — atoms rendered live) ═══════════ -->
    <section id="primitives">
      <h2>原子 Primitives</h2>
      <p class="lede">L2 —— 系统的原子组件（按钮、输入、徽章…）。下面用 <code>primitives.css</code> 实时渲染，覆盖常用的变体 / 尺寸 / 状态，同样跟随右上角深色切换。浮层/菜单类（弹窗、下拉、抽屉等）需交互态，此处从略。<strong>👉 点击任意元素</strong>即可弹出它的实时样式值。</p>

      <h3 class="group">按钮 · button</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Button <code>.btn / .btn--&lt;variant&gt; / .btn--&lt;size&gt;</code></div><div class="cx-demo__desc">变体、尺寸、图标、禁用态。</div></div>
        <div class="cx-demo__body">
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center">
            <button class="btn btn--primary">Primary</button>
            <button class="btn btn--secondary">Secondary</button>
            <button class="btn btn--tertiary">Tertiary</button>
            <button class="btn btn--outline">Outline</button>
            <button class="btn btn--ghost">Ghost</button>
            <button class="btn btn--soft">Soft</button>
            <button class="btn btn--danger">Danger</button>
            <button class="btn btn--ghost-danger">Ghost danger</button>
            <button class="btn btn--link">Link</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center;margin-top:var(--space-4)">
            <button class="btn btn--primary btn--xs">XS</button>
            <button class="btn btn--primary btn--sm">SM</button>
            <button class="btn btn--primary btn--md">MD</button>
            <button class="btn btn--primary btn--lg">LG</button>
            <button class="btn btn--secondary btn--icon" aria-label="add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
            <button class="btn btn--primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> 带图标</button>
            <button class="btn btn--primary" disabled>禁用</button>
          </div>
        </div>
      </div>

      <h3 class="group">切换按钮组 · toggle-group</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">ToggleGroup <code>.toggle-group--segmented / --outline / --cloud</code></div><div class="cx-demo__desc">一组互斥/多选的按压切换，容器变体决定外观（aria-pressed 表示选中）。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:center">
          <div class="toggle-group toggle-group--segmented"><button class="toggle-group__item" aria-pressed="true">日</button><button class="toggle-group__item">周</button><button class="toggle-group__item">月</button></div>
          <div class="toggle-group toggle-group--outline"><button class="toggle-group__item" aria-pressed="true">左</button><button class="toggle-group__item">中</button><button class="toggle-group__item">右</button></div>
          <div class="toggle-group toggle-group--cloud"><button class="toggle-group__item" aria-pressed="true">React</button><button class="toggle-group__item">Vue</button><button class="toggle-group__item">Svelte</button></div>
        </div>
      </div>

      <h3 class="group">输入框 · input</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Input <code>.input / .input--filled / [aria-invalid] / :disabled</code></div><div class="cx-demo__desc">默认、填充、无效、只读、禁用，及 sm/md/lg 尺寸。</div></div>
        <div class="cx-demo__body" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4);max-width:680px">
          <input class="input" placeholder="默认输入" />
          <input class="input input--filled" placeholder="填充 filled" />
          <input class="input" aria-invalid="true" value="无效输入" />
          <input class="input" value="只读" readonly />
          <input class="input" placeholder="禁用" disabled />
          <input class="input input--sm" placeholder="sm" />
          <input class="input input--md" placeholder="md" />
          <input class="input input--lg" placeholder="lg" />
        </div>
      </div>

      <h3 class="group">输入组 / 文本域 / 选择 · input-group · textarea · select</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">InputGroup / Textarea / Select <code>.input-group / .textarea / .select</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:flex-start">
          <div class="input-group" style="width:240px">
            <span class="input-group__addon input-group__addon--inline-start input-group__text">¥</span>
            <input class="input input-group__control" placeholder="0.00" />
            <span class="input-group__addon input-group__addon--inline-end input-group__text">CNY</span>
          </div>
          <select class="select"><option>选项一</option><option>选项二</option><option>选项三</option></select>
          <textarea class="textarea" placeholder="写点什么…" style="width:240px"></textarea>
        </div>
      </div>

      <h3 class="group">勾选 / 单选 / 开关 · checkbox · radio · switch</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Checkbox / Radio / Switch <code>.checkbox / .radio / .switch</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-8);align-items:flex-start">
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <label class="label"><input type="checkbox" class="checkbox" /> 未选中</label>
            <label class="label"><input type="checkbox" class="checkbox" checked /> 已选中</label>
            <label class="label"><input type="checkbox" class="checkbox" data-indeterminate /> 半选</label>
            <label class="label label--disabled"><input type="checkbox" class="checkbox" disabled /> 禁用</label>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <label class="label"><input type="radio" name="r" class="radio" checked /> 选项 A</label>
            <label class="label"><input type="radio" name="r" class="radio" /> 选项 B</label>
            <label class="label label--disabled"><input type="radio" name="r" class="radio" disabled /> 选项 C（禁用）</label>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <label class="label"><span class="switch"><span class="switch__thumb"></span></span> 关</label>
            <label class="label"><span class="switch" aria-checked="true"><span class="switch__thumb"></span></span> 开</label>
            <label class="label"><span class="switch switch--sm" aria-checked="true"><span class="switch__thumb"></span></span> 小号</label>
          </div>
        </div>
      </div>

      <h3 class="group">滑块 / 表单行 · slider · field</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Slider / Field <code>.slider / .field / .label / .field__hint / __error</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-8);align-items:flex-start">
          <div class="slider" style="width:240px;margin-top:var(--space-2)">
            <span class="slider__track"><span class="slider__indicator" style="width:60%"></span></span>
            <span class="slider__thumb" style="position:absolute;left:60%;top:50%;margin-top:-7px"></span>
          </div>
          <div class="field" style="width:240px">
            <label class="label">邮箱 <span class="field__required">*</span></label>
            <input class="input" placeholder="you@example.com" />
            <span class="field__hint">我们不会公开你的邮箱。</span>
          </div>
          <div class="field" style="width:240px">
            <label class="label">用户名</label>
            <input class="input" aria-invalid="true" value="ab" />
            <span class="field__error">至少需要 3 个字符。</span>
          </div>
        </div>
      </div>

      <h3 class="group">徽章 · badge</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Badge <code>.badge / .badge--&lt;tone&gt; / .badge--tag / .badge__dot</code></div><div class="cx-demo__desc">状态色调（推荐）、低层变体、标签形与前导状态点。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-3)">
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
            <span class="badge badge--neutral">neutral</span>
            <span class="badge badge--success">success</span>
            <span class="badge badge--warning">warning</span>
            <span class="badge badge--error">error</span>
            <span class="badge badge--info">info</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
            <span class="badge badge--default">default</span>
            <span class="badge badge--secondary">secondary</span>
            <span class="badge badge--outline">outline</span>
            <span class="badge badge--ghost">ghost</span>
            <span class="badge badge--tag">v0.1.0</span>
            <span class="badge badge--success"><span class="badge__dot"></span> 在线</span>
          </div>
        </div>
      </div>

      <h3 class="group">提示框 · alert</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Alert <code>.alert / .alert--&lt;tone&gt; / .alert--with-icon</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-3);max-width:560px">
          <div class="alert alert--info alert--with-icon"><svg class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><div class="alert__title">信息</div><div class="alert__description">这是一条普通信息提示。</div></div>
          <div class="alert alert--success alert--with-icon"><svg class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg><div class="alert__title">已保存</div><div class="alert__description">你的更改已成功保存。</div></div>
          <div class="alert alert--warning alert--with-icon"><svg class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg><div class="alert__title">注意</div><div class="alert__description">此操作不可撤销。</div></div>
          <div class="alert alert--error alert--with-icon"><svg class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg><div class="alert__title">出错了</div><div class="alert__description">无法连接到服务器，请稍后重试。</div></div>
        </div>
      </div>

      <h3 class="group">进度 / 加载 · progress · spinner</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Progress / Spinner <code>.progress / .spinner</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="progress" style="max-width:360px">
            <div style="display:flex"><span class="progress__label">上传中</span><span class="progress__value">64%</span></div>
            <div class="progress__track"><div class="progress__indicator" style="width:64%"></div></div>
          </div>
          <div style="display:flex;gap:var(--space-4);max-width:360px">
            <div class="progress__track" style="flex:1"><div class="progress__indicator progress__indicator--success" style="width:90%"></div></div>
            <div class="progress__track" style="flex:1"><div class="progress__indicator progress__indicator--warning" style="width:45%"></div></div>
            <div class="progress__track" style="flex:1"><div class="progress__indicator progress__indicator--error" style="width:20%"></div></div>
          </div>
          <div style="display:flex;gap:var(--space-5);align-items:center;color:var(--color-content-secondary)">
            <span class="spinner spinner--sm"></span>
            <span class="spinner spinner--md"></span>
            <span class="spinner spinner--lg"></span>
            <span class="spinner spinner--xl"></span>
          </div>
        </div>
      </div>

      <h3 class="group">卡片 · card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Card <code>.card / .card__header / __content / __footer</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-4)">
          <div class="card" style="width:300px">
            <div class="card__header"><strong>卡片标题</strong></div>
            <div class="card__content">卡片正文：surface-2 表面、line-default 描边、elevation-1 阴影、radius-xl 圆角。</div>
            <div class="card__footer" style="gap:var(--space-2);justify-content:flex-end"><button class="btn btn--secondary btn--sm">取消</button><button class="btn btn--primary btn--sm">确定</button></div>
          </div>
          <div class="card card--interactive" style="width:300px">
            <div class="card__content">可交互卡片（hover 提升阴影 + 描边）。整块作为点击目标。</div>
          </div>
        </div>
      </div>

      <h3 class="group">标签页 · tabs</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Tabs <code>.tabs__list--line / --default</code></div><div class="cx-demo__desc">下划线（默认）与药丸两种变体。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="tabs__list tabs__list--line">
            <button class="tabs__trigger tabs__trigger--active">概览</button>
            <button class="tabs__trigger">活动</button>
            <button class="tabs__trigger">设置</button>
          </div>
          <div class="tabs__list tabs__list--default">
            <button class="tabs__trigger tabs__trigger--active">日</button>
            <button class="tabs__trigger">周</button>
            <button class="tabs__trigger">月</button>
          </div>
        </div>
      </div>

      <h3 class="group">手风琴 · accordion</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Accordion <code>.accordion / .accordion__item--open</code></div></div>
        <div class="cx-demo__body">
          <div class="accordion" style="max-width:460px">
            <div class="accordion__item accordion__item--open">
              <button class="accordion__trigger" aria-expanded="true"><span class="accordion__label">什么是 token？</span><span class="accordion__arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
              <div class="accordion__content">token 是颜色/尺寸/字体等设计决策的单一事实来源，所有使用方都读取同一套值。</div>
            </div>
            <div class="accordion__item">
              <button class="accordion__trigger"><span class="accordion__label">如何切换深色模式？</span><span class="accordion__arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
              <div class="accordion__content">在根元素设置 data-theme="dark"，所有 token 自动翻转。</div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">头像 / 面包屑 / 分隔线 / 提示气泡</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Avatar / Breadcrumb / Separator / Tooltip <code>.avatar · .breadcrumb · .separator · .tooltip</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-6)">
          <div style="display:flex;align-items:center;gap:var(--space-5)">
            <span class="avatar avatar--sm"><span class="avatar__fallback">李</span></span>
            <span class="avatar avatar--md"><span class="avatar__fallback">韩</span></span>
            <span class="avatar avatar--lg"><span class="avatar__fallback">王</span></span>
            <span class="avatar avatar--xl"><span class="avatar__fallback">张</span></span>
            <span class="avatar-group">
              <span class="avatar avatar--md"><span class="avatar__fallback">A</span></span>
              <span class="avatar avatar--md"><span class="avatar__fallback">B</span></span>
              <span class="avatar avatar--md"><span class="avatar__fallback">C</span></span>
            </span>
          </div>
          <nav class="breadcrumb"><ol class="breadcrumb__list">
            <li class="breadcrumb__item"><a class="breadcrumb__link">首页</a></li>
            <li class="breadcrumb__separator">/</li>
            <li class="breadcrumb__item"><a class="breadcrumb__link">订单</a></li>
            <li class="breadcrumb__separator">/</li>
            <li class="breadcrumb__item"><span class="breadcrumb__page">#10241</span></li>
          </ol></nav>
          <div style="max-width:360px">
            <div style="font-size:var(--text-sm);color:var(--color-content-secondary)">分隔线上方</div>
            <div class="separator" style="margin-block:var(--space-3)"></div>
            <div class="separator-labeled"><span class="separator-labeled__label">或</span></div>
          </div>
          <div><span class="tooltip">这是一条提示气泡<span class="tooltip__arrow"></span></span></div>
        </div>
      </div>

      <h3 class="group">宽高比 / 滚动区 / 可调分栏 · aspect-ratio · scroll-area · resizable</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">AspectRatio / ScrollArea / Resizable <code>.aspect-ratio · .scroll-area · .resizable-group</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:flex-start">
          <div class="aspect-ratio" style="--ratio:16/9;width:200px;display:grid;place-items:center;border:1px solid var(--color-line-default);border-radius:var(--radius-md);background:var(--color-surface-3);color:var(--color-content-tertiary);font-family:var(--font-mono);font-size:var(--text-xs)">16 / 9</div>
          <div class="scroll-area" style="width:220px;height:120px;border:1px solid var(--color-line-default);border-radius:var(--radius-md)">
            <div class="scroll-area__viewport" style="padding:var(--space-3)">
              <p style="font-size:var(--text-sm);color:var(--color-content-secondary);line-height:1.6">细滚动条容器。内容超出高度时出现 4px 细滚动条（line-strong @70%）。一二三四五六七八九十。一二三四五六七八九十。一二三四五六七八九十。一二三四五六七八九十。一二三四五六七八九十。</p>
            </div>
          </div>
          <div class="resizable-group" style="width:260px;height:120px;border:1px solid var(--color-line-default);border-radius:var(--radius-md);overflow:hidden">
            <div class="resizable-panel" style="display:grid;place-items:center;font-size:var(--text-sm);color:var(--color-content-secondary)">左</div>
            <div class="resizable-handle"></div>
            <div class="resizable-panel" style="display:grid;place-items:center;font-size:var(--text-sm);color:var(--color-content-secondary)">右</div>
          </div>
        </div>
      </div>

      <h3 class="group">可折叠 / 轮播 · collapsible · carousel</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Collapsible / Carousel <code>.collapsible · .carousel</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-8);align-items:flex-start">
          <div class="collapsible" style="width:240px">
            <button class="btn btn--secondary btn--sm collapsible__trigger" data-panel-open>切换详情 <svg class="collapsible__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
            <div class="collapsible__content collapsible__content--open" style="padding:var(--space-3) 0;font-size:var(--text-sm);color:var(--color-content-secondary)">展开的面板内容。无头组件：触发器自带样式由你用 .btn 组合。</div>
          </div>
          <div style="margin-inline:var(--space-12)">
            <div class="carousel" style="width:200px">
              <div class="carousel__viewport">
                <div class="carousel__track">
                  <div class="carousel__item"><div class="card" style="height:96px;display:grid;place-items:center">幻灯片 1</div></div>
                </div>
              </div>
              <button class="btn btn--outline btn--icon btn--sm carousel__nav carousel__prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <button class="btn btn--outline btn--icon btn--sm carousel__nav carousel__next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
              <div class="carousel__dots"><button class="carousel__dot carousel__dot--active"></button><button class="carousel__dot"></button><button class="carousel__dot"></button></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">色块瓦片 / 首字母瓦片 / 验证码 · color-tile · initials-tile · input-otp</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">ColorTile / InitialsTile / InputOTP <code>.color-tile · .initials-tile · .input-otp</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div style="display:flex;gap:var(--space-3);align-items:center">
            <div class="color-tile color-tile--md color-tile--cat-1"><span class="color-tile__label">ACME</span></div>
            <div class="color-tile color-tile--md color-tile--cat-3"><span class="color-tile__label">Beta</span></div>
            <div class="color-tile color-tile--md color-tile--cat-5"><span class="color-tile__label">Cloud</span></div>
            <span class="initials-tile initials-tile--xs">李雷</span>
            <span class="initials-tile initials-tile--sm">韩梅</span>
            <span class="initials-tile initials-tile--md">王芳</span>
            <span class="initials-tile initials-tile--lg">张伟</span>
          </div>
          <div class="input-otp">
            <div class="input-otp__group">
              <div class="input-otp__slot">3</div><div class="input-otp__slot">9</div><div class="input-otp__slot input-otp__slot--active">2<span class="input-otp__caret"></span></div>
            </div>
            <span class="input-otp__separator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></span>
            <div class="input-otp__group">
              <div class="input-otp__slot"></div><div class="input-otp__slot"></div><div class="input-otp__slot"></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">日历 · calendar</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Calendar <code>.calendar / .calendar__day--&lt;state&gt;</code></div><div class="cx-demo__desc">表头（‹ 月份 ›）+ 单一 7 列栅格（星期行 + 6×7 日期，统一 2px 间隙）+ 可选页脚；今日为描边、选中为深色填充。</div></div>
        <div class="cx-demo__body cx-demo__body--center">
          <div class="calendar">
            <div class="calendar__header"><button class="calendar__nav-btn">‹</button><div class="calendar__caption">2026 年 6 月</div><button class="calendar__nav-btn">›</button></div>
            <div class="calendar__grid"><div class="calendar__weekday">日</div><div class="calendar__weekday">一</div><div class="calendar__weekday">二</div><div class="calendar__weekday">三</div><div class="calendar__weekday">四</div><div class="calendar__weekday">五</div><div class="calendar__weekday">六</div><button class="calendar__day calendar__day--outside">31</button><button class="calendar__day">1</button><button class="calendar__day">2</button><button class="calendar__day">3</button><button class="calendar__day">4</button><button class="calendar__day">5</button><button class="calendar__day">6</button><button class="calendar__day">7</button><button class="calendar__day">8</button><button class="calendar__day">9</button><button class="calendar__day">10</button><button class="calendar__day">11</button><button class="calendar__day">12</button><button class="calendar__day">13</button><button class="calendar__day">14</button><button class="calendar__day">15</button><button class="calendar__day">16</button><button class="calendar__day">17</button><button class="calendar__day">18</button><button class="calendar__day">19</button><button class="calendar__day">20</button><button class="calendar__day">21</button><button class="calendar__day">22</button><button class="calendar__day">23</button><button class="calendar__day calendar__day--today">24</button><button class="calendar__day calendar__day--selected">25</button><button class="calendar__day">26</button><button class="calendar__day">27</button><button class="calendar__day">28</button><button class="calendar__day">29</button><button class="calendar__day">30</button><button class="calendar__day calendar__day--outside">1</button><button class="calendar__day calendar__day--outside">2</button><button class="calendar__day calendar__day--outside">3</button><button class="calendar__day calendar__day--outside">4</button><button class="calendar__day calendar__day--outside">5</button><button class="calendar__day calendar__day--outside">6</button><button class="calendar__day calendar__day--outside">7</button><button class="calendar__day calendar__day--outside">8</button><button class="calendar__day calendar__day--outside">9</button><button class="calendar__day calendar__day--outside">10</button><button class="calendar__day calendar__day--outside">11</button></div>
            <div class="calendar__footer"><button class="calendar__link">清除</button><button class="calendar__link">今天</button></div>
          </div>
        </div>
      </div>

      <h3 class="group">日期选择器 · date-picker（含范围/时间）</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">DatePicker <code>.date-trigger · .date-presets · .date-time-row</code></div><div class="cx-demo__desc">输入式触发器打开装着 .calendar 的 popover；范围款带左侧预设轨，时间款带底部时间行。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3)">
            <div class="date-picker"><button class="date-trigger"><svg class="date-trigger__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="date-trigger__value">2026-06-22</span></button></div>
            <div class="date-picker"><button class="date-trigger"><svg class="date-trigger__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="date-trigger__value date-trigger__value--placeholder">选择日期范围</span></button></div>
            <div class="date-picker"><button class="date-trigger"><svg class="date-trigger__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="date-trigger__value">14:30</span></button></div>
          </div>
          <div class="popover" style="width:auto;flex-direction:row;gap:0;padding:0;overflow:hidden">
            <div class="date-presets">
              <button class="date-presets__item">今天</button>
              <button class="date-presets__item">最近 7 天</button>
              <button class="date-presets__item">本月</button>
              <button class="date-presets__item">本季度</button>
            </div>
            <div style="display:flex;flex-direction:column">
              <div class="calendar" style="border:0;border-radius:0;box-shadow:none">
                <div class="calendar__header"><button class="calendar__nav-btn">‹</button><div class="calendar__caption">2026 年 6 月</div><button class="calendar__nav-btn">›</button></div>
                <div class="calendar__grid"><div class="calendar__weekday">日</div><div class="calendar__weekday">一</div><div class="calendar__weekday">二</div><div class="calendar__weekday">三</div><div class="calendar__weekday">四</div><div class="calendar__weekday">五</div><div class="calendar__weekday">六</div><button class="calendar__day calendar__day--outside">31</button><button class="calendar__day">1</button><button class="calendar__day">2</button><button class="calendar__day">3</button><button class="calendar__day">4</button><button class="calendar__day">5</button><button class="calendar__day">6</button><button class="calendar__day">7</button><button class="calendar__day">8</button><button class="calendar__day calendar__day--today">9</button><button class="calendar__day">10</button><button class="calendar__day">11</button><button class="calendar__day">12</button><button class="calendar__day">13</button><button class="calendar__day">14</button><button class="calendar__day calendar__day--range-start">15</button><button class="calendar__day calendar__day--range-middle">16</button><button class="calendar__day calendar__day--range-middle">17</button><button class="calendar__day calendar__day--range-end">18</button><button class="calendar__day">19</button><button class="calendar__day">20</button><button class="calendar__day">21</button><button class="calendar__day">22</button><button class="calendar__day">23</button><button class="calendar__day calendar__day--disabled">24</button><button class="calendar__day">25</button><button class="calendar__day">26</button><button class="calendar__day">27</button><button class="calendar__day">28</button><button class="calendar__day">29</button><button class="calendar__day">30</button><button class="calendar__day calendar__day--outside">1</button><button class="calendar__day calendar__day--outside">2</button><button class="calendar__day calendar__day--outside">3</button><button class="calendar__day calendar__day--outside">4</button><button class="calendar__day calendar__day--outside">5</button><button class="calendar__day calendar__day--outside">6</button><button class="calendar__day calendar__day--outside">7</button><button class="calendar__day calendar__day--outside">8</button><button class="calendar__day calendar__day--outside">9</button><button class="calendar__day calendar__day--outside">10</button><button class="calendar__day calendar__day--outside">11</button></div>
              </div>
              <div class="date-time-row"><span class="date-time-row__label">时间</span><input class="input input--sm" type="time" value="14:30" style="width:auto"><button class="btn btn--primary btn--sm">确定</button></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">弹窗 · modal</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Modal <code>.modal-overlay / .modal</code></div><div class="cx-demo__desc">居中对话框（打开态快照，约束在演示框内）。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="cx-stage">
            <div class="modal-overlay">
              <div class="modal modal--sm">
                <div class="modal__header"><div class="modal__heading"><div class="modal__title">删除项目？</div><div class="modal__description">此操作不可撤销。</div></div><button class="modal__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
                <div class="modal__body">该项目及其全部数据将被永久移除，确认要继续吗？</div>
                <div class="modal__footer"><button class="btn btn--ghost">取消</button><button class="btn btn--danger">删除</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">强确认对话框 · alert-dialog</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">AlertDialog <code>.alert-dialog-overlay / .alert-dialog</code></div><div class="cx-demo__desc">无关闭按钮、不可点遮罩关闭，必须选取消或确认。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="cx-stage">
            <div class="alert-dialog-overlay"></div>
            <div class="alert-dialog">
              <div class="alert-dialog__header"><div class="alert-dialog__title">放弃未保存的更改？</div><div class="alert-dialog__description">离开后你的编辑将不会保存。</div></div>
              <div class="alert-dialog__footer"><button class="btn btn--outline">继续编辑</button><button class="btn btn--danger">放弃</button></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">侧拉面板 / 抽屉 · sheet · drawer</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Sheet <code>.sheet-overlay / .sheet--right</code></div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="cx-stage">
            <div class="sheet-overlay"></div>
            <div class="sheet sheet--right">
              <div class="sheet__header"><div class="sheet__title">筛选</div><div class="sheet__description">设置列表筛选条件。</div></div>
              <button class="btn btn--ghost btn--icon btn--sm sheet__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
              <div class="sheet__footer"><button class="btn btn--primary">应用</button><button class="btn btn--ghost">重置</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Drawer <code>.drawer-overlay / .drawer--bottom</code></div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="cx-stage">
            <div class="drawer-overlay"></div>
            <div class="drawer drawer--bottom">
              <div class="drawer__handle"></div>
              <div class="drawer__header"><div class="drawer__title">分享到</div><div class="drawer__description">选择一个目标。</div></div>
              <div class="drawer__footer"><button class="btn btn--primary">确认</button></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">浮层面板 / 悬浮卡 · popover · hover-card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Popover / HoverCard <code>.popover · .menu-item · .hover-card</code></div><div class="cx-demo__desc">打开态面板（浮层定位由实现负责，此处静态呈现）。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:flex-start">
          <div class="popover">
            <div class="popover__header"><div class="popover__title">通知设置</div><div class="popover__description">管理你接收的提醒。</div></div>
            <button class="menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 3v18M3 12h18"/></svg> 全部开启</button>
            <button class="menu-item menu-item--destructive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> 全部关闭</button>
          </div>
          <div class="hover-card">
            <div style="display:flex;gap:var(--space-3);align-items:center"><span class="avatar avatar--lg"><span class="avatar__fallback">李</span></span><div><div style="font-weight:600">李雷</div><div style="font-size:var(--text-xs);color:var(--color-content-tertiary)">@lilei · 产品设计</div></div></div>
            <div style="margin-top:var(--space-2);color:var(--color-content-secondary)">悬浮卡：比 tooltip 更重的浮层，承载富内容预览。</div>
          </div>
        </div>
      </div>

      <h3 class="group">下拉菜单 / 右键菜单 · dropdown-menu · context-menu</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">DropdownMenu <code>.dropdown-menu / __item / __separator</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:flex-start">
          <div class="dropdown-menu" style="min-width:220px">
            <div class="dropdown-menu__label">账户</div>
            <div class="dropdown-menu__item dropdown-menu__item--active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg> 个人资料 <span class="dropdown-menu__shortcut">⌘P</span></div>
            <div class="dropdown-menu__item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> 设置</div>
            <div class="dropdown-menu__separator"></div>
            <div class="dropdown-menu__checkbox-item">显示侧边栏 <span class="dropdown-menu__item-indicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            <div class="dropdown-menu__separator"></div>
            <div class="dropdown-menu__item dropdown-menu__item--destructive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> 退出登录</div>
          </div>
          <div class="context-menu__content">
            <div class="context-menu__item">复制 <span class="context-menu__shortcut">⌘C</span></div>
            <div class="context-menu__item">粘贴 <span class="context-menu__shortcut">⌘V</span></div>
            <div class="context-menu__separator"></div>
            <div class="context-menu__item--checkbox">显示网格 <span class="context-menu__indicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            <div class="context-menu__sub-trigger">更多 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>
            <div class="context-menu__separator"></div>
            <div class="context-menu__item context-menu__item--destructive">删除</div>
          </div>
        </div>
      </div>

      <h3 class="group">菜单栏 / 导航菜单 · menubar · navigation-menu</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Menubar / NavigationMenu <code>.menubar · .nav-menu</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-6)">
          <div style="display:flex;align-items:flex-start;gap:var(--space-4)">
            <div class="menubar"><button class="menubar__trigger menubar__trigger--open">文件</button><button class="menubar__trigger">编辑</button><button class="menubar__trigger">视图</button></div>
            <div class="dropdown-menu" style="min-width:180px">
              <div class="dropdown-menu__item">新建 <span class="dropdown-menu__shortcut">⌘N</span></div>
              <div class="dropdown-menu__item">打开 <span class="dropdown-menu__shortcut">⌘O</span></div>
              <div class="dropdown-menu__separator"></div>
              <div class="dropdown-menu__item">保存 <span class="dropdown-menu__shortcut">⌘S</span></div>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:var(--space-3)">
            <div class="nav-menu"><ul class="nav-menu__list"><li class="nav-menu__item"><button class="nav-menu__trigger nav-menu__trigger--open">产品 <svg class="nav-menu__trigger__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button></li><li class="nav-menu__item"><button class="nav-menu__trigger">方案</button></li><li class="nav-menu__item"><a class="nav-menu__link nav-menu__link--active">定价</a></li></ul></div>
            <div class="nav-menu__content" style="min-width:200px">
              <a class="nav-menu__link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg> 概览</a>
              <a class="nav-menu__link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg> 集成</a>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">命令面板 / 组合选择 · command · combobox</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Command / Combobox <code>.command · .combobox</code></div></div>
        <div class="cx-demo__body" style="display:flex;flex-wrap:wrap;gap:var(--space-5);align-items:flex-start">
          <div class="command" style="width:300px;height:auto">
            <div class="command__input-wrapper"><div class="input-group"><span class="input-group__addon input-group__addon--inline-start"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span><input class="command__input" placeholder="输入命令或搜索…"></div></div>
            <div class="command__list">
              <div class="command__group"><div class="command__group-heading">建议</div>
                <div class="command__item command__item--active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/></svg> 新建文档 <span class="command__shortcut">⌘N</span></div>
                <div class="command__item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3"/></svg> 打开设置 <span class="command__shortcut">⌘,</span></div>
              </div>
              <div class="command__separator"></div>
              <div class="command__group"><div class="command__group-heading">最近</div>
                <div class="command__item">订单报表.xlsx</div>
              </div>
            </div>
          </div>
          <div style="width:240px">
            <div class="combobox__trigger"><span class="combobox__value">已选：上海</span><svg class="combobox__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="combobox__content" style="margin-top:var(--space-1)">
              <div class="combobox__search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input class="combobox__input" placeholder="搜索城市…"></div>
              <div class="combobox__list">
                <div class="combobox__item combobox__item--selected">上海 <span class="combobox__item-indicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span></div>
                <div class="combobox__item combobox__item--highlighted">北京</div>
                <div class="combobox__item">广州</div>
                <div class="combobox__item">深圳</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">通知 · toast</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Toast <code>.toast / .toast__icon--&lt;tone&gt;</code></div><div class="cx-demo__desc">中性卡面，色调只体现在前导图标上（默认 sonner 风格）。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-3)">
          <div class="toast toast--countdown" style="--toast-duration:6s"><span class="toast__icon toast__icon--success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span><div class="toast__content"><div class="toast__title">已保存</div><div class="toast__description">你的更改已同步到云端。</div></div><button class="toast__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
          <div class="toast"><span class="toast__icon toast__icon--error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg></span><div class="toast__content"><div class="toast__title">上传失败</div><div class="toast__description">网络连接中断，请重试。</div></div><button class="toast__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Composites (static — components rendered live) ═══════════ -->
    <section id="composites">
      <h2>组件 Composites</h2>
      <p class="lede">L2.5 —— 页面由这些「积木」拼装而成。下面全部是用 <code>primitives.css</code> + <code>composites.css</code> 实时渲染的真实组件（非截图），同样响应右上角的深色切换。<strong>👉 点击任意元素</strong>即可弹出它的实时样式值。</p>

      <h3 class="group">指标卡 · stat-card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">StatCard <code>.stat-card / .stat-grid</code></div><div class="cx-demo__desc">单一指标面板：overline 标签 + 大号等宽数值 + 趋势。可纯展示或作为可选中的快捷筛选。</div></div>
        <div class="cx-demo__body">
          <div class="stat-grid stat-grid--cols-4">
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">总营收</span></div><div class="stat-card__value">¥1,284,920 <span class="stat-card__delta stat-card__delta--up">+12.4%</span></div><div class="stat-card__description">较上月</div></div>
            <div class="stat-card stat-card--interactive stat-card--selected"><div class="stat-card__head"><span class="stat-card__label">活跃用户</span></div><div class="stat-card__value">48,210 <span class="stat-card__delta stat-card__delta--up">+3.1%</span></div><div class="stat-card__description">已选中 · 可点</div></div>
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">退款率</span></div><div class="stat-card__value stat-card__value--error">2.8% <span class="stat-card__delta stat-card__delta--down">-0.5%</span></div><div class="stat-card__description">较上月</div></div>
            <div class="stat-card"><div class="stat-card__head"><span class="stat-card__label">待处理</span></div><div class="stat-card__value">17 <span class="stat-card__delta stat-card__delta--flat">持平</span></div><div class="stat-card__description">工单队列</div></div>
          </div>
        </div>
      </div>

      <h3 class="group">页头 · page-header</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">PageHeader <code>.page-header</code></div><div class="cx-demo__desc">通栏标题带：左侧标题（+ 计数 / 状态），右侧操作区，仅一个主操作且置于最右。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="page-header">
            <div class="page-header__bar">
              <div class="page-header__titles">
                <div class="page-header__heading"><span class="page-header__title">订单</span><span class="page-header__count">1,248</span></div>
                <div class="page-header__description">管理与跟踪所有客户订单。</div>
              </div>
              <div class="page-header__actions">
                <button class="btn btn--secondary">导出</button>
                <button class="btn btn--primary">新建订单</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">列表筛选 · list-filter</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">ConditionBand <code>.condition-band / .search-input / .filter-chip</code></div><div class="cx-demo__desc">工具行（搜索 + 快捷筛选）叠在「已应用筛选」行之上。</div></div>
        <div class="cx-demo__body">
          <div class="condition-band">
            <div class="condition-band__toolbar">
              <div class="search-input">
                <span class="search-input__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
                <input class="input" placeholder="搜索订单…" />
              </div>
              <button class="btn btn--outline btn--sm">状态</button>
              <button class="btn btn--outline btn--sm">日期</button>
              <button class="btn btn--ghost btn--sm condition-band__spacer">高级筛选</button>
            </div>
            <div class="applied-filters">
              <span class="applied-filters__label">已应用：</span>
              <span class="filter-chip">状态：已付款 <button class="filter-chip__remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
              <span class="filter-chip">本月 <button class="filter-chip__remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
              <button class="btn btn--link btn--sm">清除全部</button>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">数据表 · data-table（含汇总条 + 分页页脚）</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">DataTable <code>.table-frame / .summary-bar / .data-table / .pagination</code></div><div class="cx-demo__desc">一个完整的列表装配：框 + 汇总条 + 表格（含选中行）+ 富分页页脚。</div></div>
        <div class="cx-demo__body">
          <div class="table-frame table-frame--flush">
            <div class="summary-bar">
              <div class="summary-bar__count"><strong>1,248</strong> 条订单</div>
              <div class="summary-bar__actions"><button class="btn btn--ghost btn--sm">导出</button><button class="btn btn--secondary btn--sm">批量操作</button></div>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead><tr><th>订单号</th><th>客户</th><th>状态</th><th class="cell-right">金额</th><th>日期</th></tr></thead>
                <tbody>
                  <tr class="is-clickable"><td class="cell-num">#10241</td><td>李雷</td><td><span class="badge badge--success">已付款</span></td><td class="cell-num cell-right">¥1,280.00</td><td>2026-06-21</td></tr>
                  <tr class="is-clickable" aria-selected="true"><td class="cell-num">#10240</td><td>韩梅梅</td><td><span class="badge badge--warning">待付款</span></td><td class="cell-num cell-right">¥640.50</td><td>2026-06-20</td></tr>
                  <tr class="is-clickable"><td class="cell-num">#10239</td><td>王芳</td><td><span class="badge badge--neutral">已发货</span></td><td class="cell-num cell-right">¥2,990.00</td><td>2026-06-20</td></tr>
                  <tr class="is-clickable"><td class="cell-num">#10238</td><td>张伟</td><td><span class="badge badge--error">已取消</span></td><td class="cell-num cell-right">¥120.00</td><td>2026-06-19</td></tr>
                </tbody>
              </table>
            </div>
            <div class="pagination">
              <div class="pagination__info"><span class="pagination__summary">显示 <strong>1–25</strong> / 共 <strong>1,248</strong></span></div>
              <div class="pagination__pages">
                <button class="pagination__page" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> 上一页</button>
                <span class="pagination__current">1 / 50</span>
                <button class="pagination__page">下一页 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">分页 · pagination（数字变体）</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Pagination <code>.pagination__page / __ellipsis</code></div><div class="cx-demo__desc">带页码按钮的变体，仅用于非表格场景。</div></div>
        <div class="cx-demo__body">
          <div class="pagination__pages">
            <button class="pagination__page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
            <button class="pagination__page" aria-current="page">1</button>
            <button class="pagination__page">2</button>
            <button class="pagination__page">3</button>
            <span class="pagination__ellipsis">…</span>
            <button class="pagination__page">12</button>
            <button class="pagination__page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
          </div>
        </div>
      </div>

      <h3 class="group">空状态 · empty-state</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">EmptyState <code>.empty-state</code></div><div class="cx-demo__desc">一等公民状态：居中图标 + 标题 + 说明 + 引导主操作。</div></div>
        <div class="cx-demo__body">
          <div class="empty-state">
            <div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 6h14l2 6v6H3v-6z"/></svg></div>
            <div class="empty-state__title">暂无订单</div>
            <div class="empty-state__description">还没有任何订单。创建第一个订单后，它会出现在这里。</div>
            <div class="empty-state__action"><button class="btn btn--primary">新建订单</button></div>
          </div>
        </div>
      </div>

      <h3 class="group">骨架屏 · skeleton</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Skeleton <code>.skeleton / .skeleton-row</code></div><div class="cx-demo__desc">加载占位：脉动的表面块，可拼成行/列。</div></div>
        <div class="cx-demo__body">
          <div class="table-frame">
            <div class="skeleton-row"><div class="skeleton skeleton--line" style="max-width:120px"></div><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line" style="max-width:80px"></div></div>
            <div class="skeleton-row"><div class="skeleton skeleton--line" style="max-width:120px"></div><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line" style="max-width:80px"></div></div>
            <div class="skeleton-row"><div class="skeleton skeleton--line" style="max-width:120px"></div><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line" style="max-width:80px"></div></div>
          </div>
        </div>
      </div>

      <h3 class="group">步骤指示器 · step-indicator</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">StepIndicator <code>.step-indicator / .step</code></div><div class="cx-demo__desc">横向向导轨：编号圆点 + 连接线，状态为 已完成 / 进行中 / 待进行。</div></div>
        <div class="cx-demo__body">
          <ol class="step-indicator">
            <li class="step step--completed"><span class="step__body"><span class="step__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span><span class="step__text"><span class="step__caption">第一步</span><span class="step__title">购物车</span></span></span><span class="step__connector"></span></li>
            <li class="step step--completed"><span class="step__body"><span class="step__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span><span class="step__text"><span class="step__caption">第二步</span><span class="step__title">收货地址</span></span></span><span class="step__connector"></span></li>
            <li class="step step--active"><span class="step__body"><span class="step__dot">3</span><span class="step__text"><span class="step__caption">第三步</span><span class="step__title">支付</span></span></span><span class="step__connector"></span></li>
            <li class="step step--upcoming"><span class="step__body"><span class="step__dot">4</span><span class="step__text"><span class="step__caption">第四步</span><span class="step__title">完成</span></span></span></li>
          </ol>
        </div>
      </div>

      <h3 class="group">数字步进器 · stepper</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Stepper <code>.stepper (.input-group)</code></div><div class="cx-demo__desc">两侧 −/+ 按钮夹一个数字输入，复用 input-group 外壳。</div></div>
        <div class="cx-demo__body">
          <div class="input-group stepper" style="width:160px">
            <button class="btn btn--ghost stepper__button" aria-disabled="true">−</button>
            <input class="input input-group__control stepper__input" value="1" />
            <button class="btn btn--ghost stepper__button">+</button>
          </div>
        </div>
      </div>

      <h3 class="group">时间线 · timeline</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Timeline <code>.timeline / .timeline__marker--&lt;tone&gt;</code></div><div class="cx-demo__desc">纵向事件流：色调标记由连续轨道串联，每条旁边是内容块。</div></div>
        <div class="cx-demo__body">
          <ol class="timeline" style="max-width:520px">
            <li class="timeline__item">
              <div class="timeline__marker timeline__marker--icon timeline__marker--success"><div class="timeline__marker-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></div><div class="timeline__rail"></div></div>
              <div class="timeline__content"><div class="timeline__header"><span class="timeline__title">订单已付款</span><span class="timeline__time">10:24</span></div><div class="timeline__description">支付通过微信支付完成。</div></div>
            </li>
            <li class="timeline__item">
              <div class="timeline__marker timeline__marker--dot timeline__marker--primary"><div class="timeline__marker-node"><span class="timeline__marker-dot"></span></div><div class="timeline__rail"></div></div>
              <div class="timeline__content"><div class="timeline__header"><span class="timeline__title">已发货</span><span class="timeline__time">14:02</span></div><div class="timeline__description">由顺丰速运承运，运单号 SF1234567890。</div></div>
            </li>
            <li class="timeline__item">
              <div class="timeline__marker timeline__marker--icon timeline__marker--warning"><div class="timeline__marker-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div></div>
              <div class="timeline__content"><div class="timeline__header"><span class="timeline__title">配送延迟</span><span class="timeline__time">次日 09:10</span></div><div class="timeline__description">因天气原因预计延迟一天送达。</div></div>
            </li>
          </ol>
        </div>
      </div>

      <h3 class="group">加载更多 · load-more</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">LoadMore <code>.load-more</code></div><div class="cx-demo__desc">点击追加的列表页脚：可选摘要 + 操作槽。</div></div>
        <div class="cx-demo__body">
          <div class="load-more">
            <div class="load-more__summary">已显示 50 / 共 1,248</div>
            <button class="btn btn--secondary btn--lg">加载更多</button>
          </div>
        </div>
      </div>

      <h3 class="group">图表 · chart</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Chart <code>.chart / .chart-legend / .chart-tooltip</code></div><div class="cx-demo__desc">静态皮肤：手写 SVG 几何 + 序数色（--chart-series）+ 图例 + 提示卡。</div></div>
        <div class="cx-demo__body">
          <div style="max-width:560px;margin:0 auto">
            <div class="chart" style="aspect-ratio:auto">
              <svg viewBox="0 0 380 200" width="100%" style="overflow:visible">
                <line class="chart__grid" x1="34" y1="20"  x2="372" y2="20"/>
                <line class="chart__grid" x1="34" y1="65"  x2="372" y2="65"/>
                <line class="chart__grid" x1="34" y1="110" x2="372" y2="110"/>
                <line class="chart__grid" x1="34" y1="155" x2="372" y2="155"/>
                <line class="chart__axis" x1="34" y1="170" x2="372" y2="170"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-1)" x="48"  y="60"  width="34" height="110" rx="4"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-2)" x="103" y="92"  width="34" height="78"  rx="4"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-3)" x="158" y="40"  width="34" height="130" rx="4"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-4)" x="213" y="112" width="34" height="58"  rx="4"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-5)" x="268" y="74"  width="34" height="96"  rx="4"/>
                <rect class="chart__bar" style="--chart-series:var(--color-chart-6)" x="323" y="50"  width="34" height="120" rx="4"/>
                <text class="chart__tick" x="65"  y="186" text-anchor="middle">一月</text>
                <text class="chart__tick" x="120" y="186" text-anchor="middle">二月</text>
                <text class="chart__tick" x="175" y="186" text-anchor="middle">三月</text>
                <text class="chart__tick" x="230" y="186" text-anchor="middle">四月</text>
                <text class="chart__tick" x="285" y="186" text-anchor="middle">五月</text>
                <text class="chart__tick" x="340" y="186" text-anchor="middle">六月</text>
              </svg>
            </div>
            <div class="chart-legend" style="margin-top:var(--space-3)">
              <span class="chart-legend__item"><span class="chart-legend__swatch" style="--chart-series:var(--color-chart-1)"></span>新增</span>
              <span class="chart-legend__item"><span class="chart-legend__swatch" style="--chart-series:var(--color-chart-2)"></span>留存</span>
              <span class="chart-legend__item"><span class="chart-legend__swatch" style="--chart-series:var(--color-chart-3)"></span>复购</span>
            </div>
            <div style="display:flex;justify-content:center;margin-top:var(--space-4)">
              <div class="chart-tooltip" style="position:static">
                <div class="chart-tooltip__header">三月</div>
                <div class="chart-tooltip__row"><span class="chart-tooltip__name"><span class="chart-tooltip__indicator" style="--chart-series:var(--color-chart-3)"></span>复购</span><span class="chart-tooltip__value">1,302</span></div>
                <div class="chart-tooltip__row"><span class="chart-tooltip__name"><span class="chart-tooltip__indicator" style="--chart-series:var(--color-chart-1)"></span>新增</span><span class="chart-tooltip__value">980</span></div>
                <div class="chart-tooltip__total"><span>合计</span><span>2,282</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── detail-archetype + admin-shell composites (carbon-admin) ── -->
      <h3 class="group">详情页头带 · detail-header</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">DetailHeader <code>.detail-header / __bar / __tabs</code></div><div class="cx-demo__desc">全宽 surface-2 头带：返回 · logo · 名称+状态 · meta · 操作簇，底边停靠 .tabs--line 标签条（标签条是 tabs 原子，不另造）。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="detail-header">
            <div class="detail-header__bar">
              <button class="btn btn--ghost btn--icon detail-header__back" aria-label="返回"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <div class="detail-header__logo">A</div>
              <div class="detail-header__main">
                <div class="detail-header__title"><span class="detail-header__name">Acme 科技</span><span class="badge badge--success"><span class="badge__dot"></span> 启用中</span></div>
                <div class="detail-header__meta"><span class="mono">cust_8f2a91</span><span>创建于 3 天前</span><span>12 名成员</span></div>
              </div>
              <div class="detail-header__actions"><button class="btn btn--secondary btn--sm">编辑</button><button class="btn btn--ghost btn--icon btn--sm" aria-label="更多"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><button class="btn btn--primary btn--sm">新建订单</button></div>
            </div>
            <div class="detail-header__tabs">
              <div class="tabs__list tabs__list--line">
                <button class="tabs__trigger tabs__trigger--active">概览</button>
                <button class="tabs__trigger">成员</button>
                <button class="tabs__trigger">活动</button>
                <button class="tabs__trigger">设置</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="group">键值栅格 · kv-grid</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">KVGrid <code>.kv-grid / __row / --full</code></div><div class="cx-demo__desc">详情页概览：标签→值的描述列表，列数随容器宽度自适应；长值用 --full 跨整行。</div></div>
        <div class="cx-demo__body">
          <dl class="kv-grid" style="max-width:720px">
            <div class="kv-grid__row"><dt>客户 ID</dt><dd class="mono">cust_8f2a91</dd></div>
            <div class="kv-grid__row"><dt>状态</dt><dd>启用中</dd></div>
            <div class="kv-grid__row"><dt>创建时间</dt><dd>2026-03-04</dd></div>
            <div class="kv-grid__row"><dt>负责人</dt><dd>a.lee@acme.co</dd></div>
            <div class="kv-grid__row kv-grid__row--full"><dt>账单地址</dt><dd>上海市黄浦区中山东一路 2200 号 4 座，200002</dd></div>
          </dl>
        </div>
      </div>

      <h3 class="group">区块卡片 · section-card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">SectionCard <code>.section-card / __toggle / __chevron</code></div><div class="cx-demo__desc">带标题、可折叠的内容面板（= .card + collapsible）。data-open 控制展开/收起：收起时隐藏正文并落下分隔线。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-4);max-width:560px">
          <div class="card section-card" data-open="true">
            <button class="card__header section-card__toggle"><strong>概览</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
            <div class="card__content">
              <dl class="kv-grid">
                <div class="kv-grid__row"><dt>计划</dt><dd>企业版</dd></div>
                <div class="kv-grid__row"><dt>席位</dt><dd>50</dd></div>
              </dl>
            </div>
          </div>
          <div class="card section-card" data-open="false">
            <button class="card__header section-card__toggle"><strong>账单（已收起）</strong><span class="section-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></span></button>
            <div class="card__content">收起态下此正文被隐藏。</div>
          </div>
        </div>
      </div>

      <h3 class="group">信息流 · feed-list</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">FeedList <code>.feed-list / .feed-item / __icon--&lt;tone&gt;</code></div><div class="cx-demo__desc">平铺、细线分隔的通知/审批流：色调图标 | 主体（overline · 标题 · 正文 · 操作）| 右侧时间。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="table-frame"><div class="feed-list">
            <div class="feed-item">
              <div class="feed-item__icon feed-item__icon--warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div>
              <div class="feed-item__main">
                <div class="feed-item__head">审批 · 角色变更 <code>req_4821</code></div>
                <div class="feed-item__title">将 a.lee 提升为「管理员」</div>
                <div class="feed-item__body">由 m.ortiz 提交 · 5 天后过期</div>
                <div class="feed-item__actions"><button class="btn btn--secondary btn--sm">批准</button><button class="btn btn--ghost-danger btn--sm">拒绝</button></div>
              </div>
              <div class="feed-item__time">2 小时前</div>
            </div>
            <div class="feed-item feed-item--read">
              <div class="feed-item__icon feed-item__icon--info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg></div>
              <div class="feed-item__main">
                <div class="feed-item__head">邮件 · 邀请已发送</div>
                <div class="feed-item__title">已向 acme.co 发送邀请</div>
                <div class="feed-item__body">投递给 3 位收件人。</div>
              </div>
              <div class="feed-item__time">1 天前</div>
            </div>
          </div></div>
        </div>
      </div>

      <h3 class="group">改动对比 · diff</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">Diff <code>.diff / __col--old / __col--new / --inline</code></div><div class="cx-demo__desc">改动前→后对比，用于审批/审计确认。块状（弹窗内）与行内（feed/单元格）两种布局，同一套配方。</div></div>
        <div class="cx-demo__body" style="display:flex;flex-direction:column;gap:var(--space-4);max-width:520px">
          <div class="diff">
            <div class="diff__col diff__col--old"><div class="diff__label">变更前</div><div class="diff__value">Member</div></div>
            <div class="diff__arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>
            <div class="diff__col diff__col--new"><div class="diff__label">变更后</div><div class="diff__value">Admin</div></div>
          </div>
          <div><span class="diff diff--inline"><span class="diff__col diff__col--old"><span class="diff__value">14:30</span></span><span class="diff__arrow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span><span class="diff__col diff__col--new"><span class="diff__value">16:00</span></span></span></div>
        </div>
      </div>

      <h3 class="group">选项卡片 · option-card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">OptionCard <code>.option-card / --selected / __check</code></div><div class="cx-demo__desc">卡片化单选/多选：整块即 &lt;label&gt; 包裹真实 radio/checkbox，选中态（primary 描边+底色+柔光环）压过 hover。</div></div>
        <div class="cx-demo__body" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-3);max-width:560px">
          <label class="option-card option-card--selected">
            <input type="radio" name="oc-demo" class="option-card__input" checked>
            <span class="option-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18 22 12 16 6M8 6 2 12 8 18"/></svg></span>
            <span class="option-card__body"><span class="option-card__title">ISV 合作伙伴</span><span class="option-card__desc">在市场上构建并上架应用。</span></span>
            <span class="option-card__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
          </label>
          <label class="option-card">
            <input type="radio" name="oc-demo" class="option-card__input">
            <span class="option-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></span>
            <span class="option-card__body"><span class="option-card__title">商户</span><span class="option-card__desc">通过门户销售与管理设备。</span></span>
            <span class="option-card__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
          </label>
        </div>
      </div>

      <h3 class="group">商品卡片 · product-card</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">ProductCard <code>.product-grid / .product-card / __image / __price-row / __cta</code></div><div class="cx-demo__desc">店铺目录的卡片网格（data-table 的卡片表亲）：图片区（含占位/角标）· 名称/SKU/描述 · 价格行 · 加购。整卡可点进详情，CTA 为内嵌动作。列数随容器宽度自适应。</div></div>
        <div class="cx-demo__body">
          <div class="product-grid" style="max-width:760px">
            <article class="product-card">
              <div class="product-card__image">
                <span class="product-card__placeholder">🖥️</span>
                <span class="product-card__ribbon product-card__ribbon--success">样机</span>
              </div>
              <div class="product-card__body">
                <div class="product-card__name">Reader Pro X 收款终端</div>
                <div class="product-card__sku">SKU-RDR-PRO-X</div>
                <div class="product-card__description">非接触式 EMV 收款读卡器，支持刷卡 / 插卡 / 闪付。</div>
                <div class="product-card__price-row"><span class="product-card__price">¥1,299</span><span class="product-card__options">3 种规格</span></div>
                <div class="product-card__cta"><button class="btn btn--primary btn--sm">加入购物车</button><button class="product-card__add" aria-label="快速添加"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></div>
              </div>
            </article>
            <article class="product-card">
              <div class="product-card__image"><span class="product-card__placeholder">🔌</span></div>
              <div class="product-card__body">
                <div class="product-card__name">USB-C 数据线 2m</div>
                <div class="product-card__sku">SKU-CBL-USBC-2M</div>
                <div class="product-card__description">编织线身，100W PD 快充。</div>
                <div class="product-card__price-row"><span class="product-card__price">¥59</span></div>
                <div class="product-card__cta"><button class="btn btn--primary btn--sm">加入购物车</button><button class="product-card__add" aria-label="快速添加"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></div>
              </div>
            </article>
            <article class="product-card product-card--out-of-stock">
              <div class="product-card__image"><span class="product-card__placeholder">🧾</span><span class="product-card__ribbon product-card__ribbon--warning">缺货</span></div>
              <div class="product-card__body">
                <div class="product-card__name">热敏打印纸（10 卷）</div>
                <div class="product-card__sku">SKU-PPR-58-10</div>
                <div class="product-card__description">58mm 通用热敏纸，整箱装。</div>
                <div class="product-card__price-row"><span class="product-card__price">¥89</span></div>
                <div class="product-card__cta"><button class="btn btn--primary btn--sm" disabled>暂时缺货</button><button class="product-card__add" aria-label="快速添加" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <h3 class="group">列表行 · list-row</h3>
      <div class="cx-demo">
        <div class="cx-demo__head"><div class="cx-demo__name">ListRow <code>.list-rows / .list-row / __icon / __title / __sub / __trailing / --interactive</code></div><div class="cx-demo__desc">非表格的设置 / 账户 / 权限 / 实体列表行：前导图标或头像 | 主体（标题含内联徽章 + 副行）| 尾部（开关 / 操作 / 值+箭头）。细线分隔，整行可 --interactive。</div></div>
        <div class="cx-demo__body" style="padding:0">
          <div class="table-frame"><div class="list-rows">
            <div class="list-row">
              <div class="list-row__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <div class="list-row__main">
                <div class="list-row__title">两步验证 <span class="badge badge--success">已开启</span></div>
                <div class="list-row__sub">登录时额外输入一次性验证码。</div>
              </div>
              <div class="list-row__trailing"><span class="switch" aria-checked="true"><span class="switch__thumb"></span></span></div>
            </div>
            <div class="list-row">
              <span class="avatar avatar--sm"><span class="avatar__fallback">MO</span></span>
              <div class="list-row__main">
                <div class="list-row__title">m.ortiz <span class="badge badge--neutral">Owner</span></div>
                <div class="list-row__sub">m.ortiz@acme.co · 2 小时前活跃</div>
              </div>
              <div class="list-row__trailing"><div class="list-row__actions"><button class="btn btn--secondary btn--sm">管理</button></div></div>
            </div>
            <div class="list-row list-row--interactive">
              <div class="list-row__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>
              <div class="list-row__main">
                <div class="list-row__title">PILOT 合同 <span class="badge badge--warning">7 天后到期</span></div>
                <div class="list-row__sub">3 / 5 字段已填写</div>
              </div>
              <div class="list-row__trailing"><span class="list-row__value">查看</span><span class="list-row__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></span></div>
            </div>
          </div></div>
        </div>
      </div>

    </section>

    <!-- ═══════════ Example (real-product reference screen, embedded live) ═══════════ -->
    <section id="example">
      <h2>示例 Example</h2>
      <p class="lede">用 foundation 的 primitives + composites <strong>重新实现</strong>的客户管理页（参照 carbon-admin 的 customer 列表，按 list-page 原型组装）——非外链，完全由本设计系统的积木拼装。点「↗ 新标签打开」可全屏查看。</p>
      <h3 class="group">客户管理 · customer</h3>
      <div class="pattern">
        <div class="pattern__bar"><span>foundation · 客户管理（list-page 原型）</span><a href="example-customer.html" target="_blank" rel="noopener">↗ 新标签打开</a></div>
        <iframe class="pattern-frame" src="example-customer.html" loading="lazy" title="foundation · 客户管理" style="height:680px"></iframe>
      </div>
    </section>
  </main>
</div>
<!-- fixed inspect-mode toggle, docked above the 批注 launcher (outside <main> so
     annotation mode never treats it as a target) -->
<button id="inspectToggle" aria-pressed="true" title="开关元素检视高亮框">◉ 检视·开</button>

<script>
const TOKENS = ${JSON.stringify(tokens)};
const CONTRACTS = ${JSON.stringify(contracts).replace(/</g, "\\u003c")};

const PRINCIPLES = [
  ["一切都源自 token", "任何地方都不允许手写颜色、尺寸、圆角、阴影、时长或字体值。一个十六进制色值、rgb()、px 字号或 rounded-[7px] 都算缺陷。"],
  ["单一事实来源，且只存在于一处", "token 值只存在于 foundation/tokens/*.css。任何使用方都不得重新定义。同一个值出现两份拷贝，正是这套 foundation 要杜绝的失败模式。"],
  ["语义命名优先于原始色阶", "优先用 text-content-secondary，而不是 text-…-600；用 bg-success-bg，而不是 bg-…-50。语义命名能在换肤后存活，色阶步则不能。"],
  ["字号刻度是封闭的", "字号只能落在 --text-{2xs…5xl} 这些刻度上，没有 text-[15px]。控件高度、间距、圆角、阴影阶梯同理 —— 这些刻度本身就是设计。"],
  ["契约具有权威性", "组件的变体/尺寸/状态在 primitives/ 与 composites/ 中定义一次。当实现与契约不一致时，是实现错了。"],
  ["单一品牌", "这套 foundation 只编码一个品牌，跨越「原型→生产」边界。它不是通用换肤主题 —— 偏离品牌的工作应当 fork 出自己的 token。"],
];

// token group → which keys, in order
const isColor = k => k.startsWith("color-");
function val(k){ return (TOKENS[curTheme()] && TOKENS[curTheme()][k]) ?? TOKENS.light[k]; }
function curTheme(){ return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
const keys = Object.keys(TOKENS.light);
const has = pre => keys.filter(k => k.startsWith(pre));

function chip(k){
  return \`<div class="swatch"><div class="chip" style="background:var(--\${k})"></div>
    <div class="meta"><div class="name">\${k.replace(/^color-/,'')}</div><div class="val">\${val(k)}</div></div></div>\`;
}
function ramp(name, steps){
  const cells = steps.map(s => {
    const k = \`color-\${name}-\${s}\`;
    return \`<div class="ramp__step"><div class="bar" style="background:var(--\${k})"></div><div class="lbl">\${s}</div></div>\`;
  }).join("");
  return \`<h3 class="group">\${name}</h3><div class="ramp">\${cells}</div>\`;
}
function swatchGrid(list){ return \`<div class="grid">\${list.map(chip).join("")}</div>\`; }

function renderColor(){
  let h = "";
  // brand ramps
  h += ramp("primary", [50,100,200,300,400,500,600,700,800,900]);
  h += ramp("secondary", [50,100,500,700,900]);
  h += ramp("accent", [50,100,200,500,600,700]);
  // semantic
  h += '<h3 class="group">语义色</h3>' + swatchGrid(
    ["color-success","color-success-bg","color-success-strong",
     "color-warning","color-warning-bg","color-warning-strong",
     "color-error","color-error-bg","color-error-strong","color-error-active",
     "color-info","color-info-bg","color-info-strong"]);
  // category hues
  h += '<h3 class="group">分类色相</h3>' + swatchGrid(has("color-teal-").concat(has("color-violet-")));
  // surface & content
  h += '<h3 class="group">背景层 Surface</h3>' + swatchGrid(has("color-surface-").concat(["color-state-selected"]));
  h += '<h3 class="group">文字 Content</h3>' + swatchGrid(has("color-content-"));
  h += '<h3 class="group">描边与品牌色</h3>' + swatchGrid(has("color-line-").concat(has("color-avatar-"), has("color-brand-mono")));
  // chart
  const chartCore = has("color-chart-").filter(k => /chart-[1-8]$/.test(k));
  h += '<h3 class="group">图表 · 分类</h3>' + swatchGrid(chartCore);
  h += '<h3 class="group">图表 · 顺序</h3>' + swatchGrid(has("color-chart-seq-"));
  h += '<h3 class="group">数据标签色</h3>' + swatchGrid(has("color-cat-").filter(k=>!k.endsWith("-fg")&&!k.endsWith("line")));
  return h;
}

function renderType(){
  const scale = [["text-5xl","5xl"],["text-4xl","4xl"],["text-3xl","3xl"],["text-2xl","2xl"],["text-xl","xl"],["text-lg","lg"],["text-md","md · 基准"],["text-sm","sm"],["text-xs","xs"],["text-2xs","2xs"]];
  return scale.map(([k,label]) => \`<div class="type-row">
    <div class="tk"><b>\${label}</b><br>--\${k} · \${val(k)}</div>
    <div class="sample" style="font-size:var(--\${k})">设计规范 Design Foundation</div>
  </div>\`).join("");
}

function renderFonts(){
  const sans = val("font-family-sans"), mono = val("font-family-mono");
  return \`
  <div class="font-card">
    <div class="fc-cap">无衬线 · --font-sans（Geist Variable）</div>
    <div class="show" style="font-family:var(--font-sans)">基础设计系统 Foundation 1234567890</div>
    <div class="glyphs" style="font-family:var(--font-sans)">ABCDEFGHIJKLM abcdefghijklm &amp; ? ! @ # %</div>
    <div class="stack">\${sans}</div>
  </div>
  <div class="font-card">
    <div class="fc-cap">等宽 · --font-mono（Geist Mono Variable）</div>
    <div class="show mono">const total = sum(items); // 1234567890</div>
    <div class="glyphs mono">ABCDEFGHIJKLM abcdefghijklm {} [] () =&gt; !=</div>
    <div class="stack">\${mono}</div>
  </div>\`;
}

function radiusDemo(){
  return \`<div class="demo-grid">\${has("radius-").map(k => \`
    <div class="demo"><div class="box" style="border-radius:var(--\${k})"></div>
    <div><div class="name">\${k.replace('radius-','')}</div><div class="val">\${val(k)}</div></div></div>\`).join("")}</div>\`;
}
function shadowDemo(){
  return \`<div class="demo-grid">\${has("shadow-").filter(k=>!k.includes("row")&&!k.includes("sticky")&&!k.includes("focus")).map(k => \`
    <div class="demo shadow"><div class="box" style="box-shadow:var(--\${k});border-radius:var(--radius-md)"></div>
    <div><div class="name">\${k.replace('shadow-','')}</div></div></div>\`).join("")}</div>\`;
}
function spacingDemo(){
  const sp = has("space-").filter(k=>/space-\\d+$/.test(k));
  return sp.map(k => {
    const v = val(k);
    const w = parseInt(v) || 0;
    return \`<div class="space-row"><div class="tk">--\${k}</div><div class="bar" style="width:\${Math.max(w,2)}px"></div><div class="v">\${v}</div></div>\`;
  }).join("");
}
function controlDemo(){
  const ctl = has("spacing-control-").concat(has("spacing-cx-"));
  return '<h3 class="group">控件高度与内边距</h3>' + swatchGridText(ctl);
}
function swatchGridText(list){
  return \`<div class="grid">\${list.map(k => \`<div class="swatch"><div class="meta" style="padding:var(--space-3)"><div class="name">\${k.replace('spacing-','')}</div><div class="val">\${val(k)}</div></div></div>\`).join("")}</div>\`;
}
function layoutDemo(){
  const bp = has("breakpoint-");
  let h = '<h3 class="group">断点 Breakpoints</h3>';
  h += '<div class="grid">' + bp.map(k=>\`<div class="swatch"><div class="meta" style="padding:var(--space-3)"><div class="name">\${k.replace('breakpoint-','')}</div><div class="val">\${val(k)}</div></div></div>\`).join("") + '</div>';
  h += '<h3 class="group">内容容器 Container</h3><div class="grid"><div class="swatch"><div class="meta" style="padding:var(--space-3)"><div class="name">content</div><div class="val">'+val("container-content")+'</div></div></div></div>';
  return h;
}
function motionDemo(){
  const dur = has("duration-"), ease = has("ease-");
  let h = '<h3 class="group">时长 Durations</h3><div class="grid">' +
    dur.map(k=>\`<div class="swatch"><div class="meta" style="padding:var(--space-3)"><div class="name">\${k.replace('duration-','')}</div><div class="val">\${val(k)}</div></div></div>\`).join("") + '</div>';
  h += '<h3 class="group">缓动 Easing</h3><div class="grid">' +
    ease.map(k=>\`<div class="swatch"><div class="meta" style="padding:var(--space-3)"><div class="name">\${k.replace('ease-','')}</div><div class="val" style="word-break:break-all">\${val(k)}</div></div></div>\`).join("") + '</div>';
  return h;
}

function render(){
  const c = document.getElementById("content");
  c.innerHTML = \`
  <section id="principles"><h2>设计准则</h2>
    <p class="lede">六条在两个使用方都成立的规则 —— Next.js 应用与 artifact 原型。</p>
    <div class="principles">\${PRINCIPLES.map((p,i)=>\`<div class="principle"><h4>\${i+1}. \${p[0]}</h4><p>\${p[1]}</p></div>\`).join("")}</div>
  </section>

  <section id="color"><h2>颜色</h2>
    <p class="lede">全程使用 OKLCH。优先选用语义 token，而不是它指向的色阶步。切换右上角的深色模式 —— 下方每个值都会从 dark 映射重新读取。</p>
    \${renderColor()}
  </section>

  <section id="type"><h2>字号</h2>
    <p class="lede">刻度是封闭的：每个字号都要落到某一级上，绝不用任意 px。</p>
    \${renderType()}
  </section>

  <section id="fonts"><h2>字体</h2>
    <p class="lede">Geist（无衬线）与 Geist Mono（等宽）。字体文件由各使用方自行引入；token 保持无资源依赖，因此本页在未安装 Geist 时会回退到系统字体栈。</p>
    \${renderFonts()}
  </section>

  <section id="radius"><h2>圆角</h2><p class="lede">圆角阶梯。</p>\${radiusDemo()}</section>
  <section id="shadow"><h2>阴影</h2><p class="lede">阴影阶梯 1→5，外加 CTA 专用阴影。</p>\${shadowDemo()}</section>
  <section id="spacing"><h2>间距</h2><p class="lede">原始 --space-* 刻度（4px 基准），供直接 var() 使用。</p>\${spacingDemo()}\${controlDemo()}</section>
  <section id="layout"><h2>布局与断点</h2>\${layoutDemo()}</section>
  <section id="motion"><h2>动效</h2><p class="lede">在 prefers-reduced-motion 下时长会归零。</p>\${motionDemo()}</section>
  \`;
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
  document.getElementById("themeToggle").textContent = dark ? "◐ 深色" : "◑ 浅色";
  render();
  colorMap = null; shadowMap = null;   // token→value differs per theme; rebuild lazily
  closeInspector();   // a flipped theme would leave an open readout stale
  if (window.__annoRefresh) window.__annoRefresh();   // #content re-rendered → re-anchor pins
});
render();

// The checkbox half-checked look keys off the :indeterminate pseudo, which has
// no HTML attribute — set it on any [data-indeterminate] checkbox once at load.
document.querySelectorAll(".checkbox[data-indeterminate]").forEach(c => { c.indeterminate = true; });

// Build the nav sub-menus from each showcase section's group headings, so the
// component list stays in sync automatically (add a demo → its link appears).
function buildSubnav(sectionId, containerId){
  const section = document.getElementById(sectionId);
  const container = document.getElementById(containerId);
  if (!section || !container) return;
  section.querySelectorAll("h3.group").forEach((h, i) => {
    const id = sectionId + "-" + (i + 1);
    h.id = id;
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = h.textContent;
    container.appendChild(a);
  });
}
buildSubnav("primitives", "subnav-primitives");
buildSubnav("composites", "subnav-composites");
buildSubnav("example", "subnav-example");

// ── Click-to-inspect ──────────────────────────────────────────────────────
// Click any element inside a demo to float a popover of its RESOLVED computed
// values (concrete px / oklch, theme-aware) anchored to that element. The
// values are read live on click, so they always reflect the current theme.
const TRANSPARENT = ["rgba(0, 0, 0, 0)", "transparent"];

// Inspect-mode master switch (topbar toggle). Gates BOTH the hover highlight
// box and the click-to-read popover, so they stay coherent. Default on, which
// preserves the prior always-on behavior.
let inspectOn = true;

// ── Resolved value → token name ──
// getComputedStyle only yields resolved oklch()/shadow strings, never the
// var(--token) behind them. So we probe every color/shadow token with a hidden
// element, read its resolved value through the SAME engine, and build a reverse
// map. Rebuilt per theme. Among aliases, a role/semantic token beats a raw ramp
// step (so a button bg reads --color-primary-700, text reads --color-content-primary).
const COLOR_TOKENS = Object.keys(TOKENS.light).filter(k => k.startsWith("color-"));
const SHADOW_TOKENS = Object.keys(TOKENS.light).filter(k => k.startsWith("shadow-"));
const isRampStep = k => /^color-(primary|secondary|accent|success|warning|error|info|teal|violet|chart)-\d/.test(k);
let colorMap = null, shadowMap = null;
function buildMaps(){
  colorMap = new Map(); shadowMap = new Map();
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  for (const k of COLOR_TOKENS) {
    probe.style.color = ""; probe.style.color = "var(--" + k + ")";
    const c = getComputedStyle(probe).color;
    if (!c) continue;
    const prio = isRampStep(k) ? 1 : 0;
    const cur = colorMap.get(c);
    if (!cur || prio < cur.prio) colorMap.set(c, { name: k, prio });
  }
  for (const k of SHADOW_TOKENS) {
    probe.style.boxShadow = ""; probe.style.boxShadow = "var(--" + k + ")";
    const s = getComputedStyle(probe).boxShadow;
    if (s && s !== "none" && !shadowMap.has(s)) shadowMap.set(s, k);
  }
  probe.remove();
}
function ensureMaps(){ if (!colorMap || !shadowMap) buildMaps(); }
// A semi-transparent color is almost always color-mix(<token> N%, transparent):
// mixing an opaque token with transparent keeps its L/C/H and just sets alpha=N%.
// So strip the alpha, match the opaque base token, and rebuild that exact recipe.
function alphaInfo(v){
  const i = v.indexOf(" / ");
  if (i >= 0) return { opaque: v.slice(0, i) + ")", alpha: parseFloat(v.slice(i + 3)) };
  if (v.startsWith("rgba(") || v.startsWith("hsla(")) {
    const parts = v.slice(5, v.lastIndexOf(")")).split(",");
    if (parts.length === 4) return { opaque: v.slice(0, 3) + "(" + parts.slice(0, 3).map(s => s.trim()).join(", ") + ")", alpha: parseFloat(parts[3]) };
  }
  return null;
}
function tokenColor(v){
  ensureMaps();
  const h = colorMap.get(v);
  if (h) return "var(--" + h.name + ")";
  const ai = alphaInfo(v);
  if (ai && ai.alpha < 1) {
    const hb = colorMap.get(ai.opaque);
    if (hb) return "color-mix(in oklch, var(--" + hb.name + ") " + Math.round(ai.alpha * 100) + "%, transparent)";
  }
  return v;
}
function tokenShadow(v){ ensureMaps(); const n = shadowMap.get(v); return n ? "var(--" + n + ")" : v; }

function readSpec(el){
  const cs = getComputedStyle(el);
  const rows = [["font-size / weight", cs.fontSize + " / " + cs.fontWeight]];
  // Only a whole-px height is a deliberate spec (control tokens are integers);
  // a fractional value (e.g. 38.3984px) is just text/content-driven layout — skip it.
  const h = parseFloat(cs.height);
  if (Number.isInteger(h) && h > 0) rows.push(["height", cs.height]);
  const p = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
  if (p.some(v => parseFloat(v))) {
    const pad = (p[0] === p[2] && p[1] === p[3]) ? (p[0] === p[1] ? p[0] : p[0] + " " + p[1]) : p.join(" ");
    rows.push(["padding", pad]);
  }
  if (parseFloat(cs.borderTopLeftRadius)) rows.push(["border-radius", cs.borderTopLeftRadius]);
  if (parseFloat(cs.borderTopWidth)) rows.push(["border", cs.borderTopWidth + " " + cs.borderTopStyle + " " + tokenColor(cs.borderTopColor)]);
  if (!TRANSPARENT.includes(cs.backgroundColor)) rows.push(["background", tokenColor(cs.backgroundColor)]);
  rows.push(["color", tokenColor(cs.color)]);
  if (cs.boxShadow && cs.boxShadow !== "none") rows.push(["box-shadow", tokenShadow(cs.boxShadow)]);
  return rows;
}

const inspector = document.createElement("div");
inspector.id = "cx-inspector";
inspector.hidden = true;
document.body.appendChild(inspector);

function escHtml(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function showInspector(el){
  const sel = el.tagName.toLowerCase() + (el.classList.length ? "." + [...el.classList].join(".") : "");
  const rows = readSpec(el).map(([k, v]) => "<dt>" + escHtml(k) + "</dt><dd>" + escHtml(v) + "</dd>").join("");
  inspector.innerHTML =
    "<div class='cx-inspector__head'><span class='cx-inspector__sel'>" + escHtml(sel) +
    "</span><button class='cx-inspector__close' aria-label='关闭'>×</button></div>" +
    "<dl class='cx-inspector__grid'>" + rows + "</dl>";
  inspector.hidden = false;
  inspector.__target = el;
  const r = el.getBoundingClientRect();
  const bw = inspector.offsetWidth, bh = inspector.offsetHeight;
  let top = r.bottom + 8;
  if (top + bh > window.innerHeight - 8) top = Math.max(8, r.top - bh - 8);
  let left = Math.min(r.left, window.innerWidth - bw - 8);
  inspector.style.top = top + "px";
  inspector.style.left = Math.max(8, left) + "px";
}
function closeInspector(){ inspector.hidden = true; inspector.__target = null; }

document.addEventListener("click", e => {
  if (document.body.classList.contains("anno-on")) return;  // annotation mode owns clicks
  if (!inspectOn) return;                                   // inspect mode off
  if (e.target.closest(".cx-inspector__close")) { closeInspector(); return; }
  if (e.target.closest("#cx-inspector")) return;            // clicks inside keep it open
  const body = e.target.closest(".cx-demo__body");
  if (!body) { closeInspector(); return; }                  // clicked outside any demo
  const el = e.target.closest("[class]");
  if (!el || el === body || el.classList.contains("cx-demo__body")) { closeInspector(); return; }
  if (inspector.__target === el && !inspector.hidden) { closeInspector(); return; }   // toggle off
  showInspector(el);
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeInspector(); });
window.addEventListener("scroll", closeInspector, true);

// Hover highlight: outline the exact element a click would inspect, so users
// can see what is clickable. Tracks one element at a time to avoid churn.
let hovered = null;
function setHovered(el){
  if (hovered === el) return;
  if (hovered) hovered.classList.remove("cx-hl");
  hovered = el;
  if (hovered) hovered.classList.add("cx-hl");
}
document.querySelectorAll(".cx-demo__body").forEach(body => {
  body.addEventListener("mouseover", e => {
    if (document.body.classList.contains("anno-on")) { setHovered(null); return; }
    if (!inspectOn) { setHovered(null); return; }
    const el = e.target.closest("[class]");
    setHovered(el && el !== body && !el.classList.contains("cx-demo__body") ? el : null);
  });
  body.addEventListener("mouseleave", () => setHovered(null));
});

// Topbar toggle for inspect mode: flips the flag, updates the label, and clears
// any live highlight / open readout when switching off.
const inspectToggle = document.getElementById("inspectToggle");
inspectToggle.addEventListener("click", () => {
  inspectOn = !inspectOn;
  inspectToggle.setAttribute("aria-pressed", String(inspectOn));
  inspectToggle.textContent = inspectOn ? "◉ 检视·开" : "◯ 检视·关";
  if (!inspectOn) { setHovered(null); closeInspector(); }
});

// ── Per-component CONTRACT (.md) panel ────────────────────────────────────
// Each demo is keyed to its contract file(s) by the leading word of its name.
// These are the AUTHORITATIVE specs; the demo above is the css implementation.
const MD_MAP = {
  Button: ["button"], ToggleGroup: ["toggle-group", "toggle"], Input: ["input"],
  InputGroup: ["input-group", "textarea", "select"], Checkbox: ["checkbox", "radio-group", "switch"],
  Slider: ["slider", "field", "label"], Badge: ["badge"], Alert: ["alert"],
  Progress: ["progress", "spinner"], Card: ["card"], Tabs: ["tabs"], Accordion: ["accordion"],
  Avatar: ["avatar", "breadcrumb", "separator", "tooltip"],
  AspectRatio: ["aspect-ratio"], ScrollArea: ["scroll-area"], Resizable: ["resizable"],
  Collapsible: ["collapsible"], Carousel: ["carousel"], ColorTile: ["color-tile"],
  InitialsTile: ["initials-tile"], InputOTP: ["input-otp"], Calendar: ["calendar"],
  DatePicker: ["date-picker", "date-range-picker", "time-picker", "date-time-picker", "date-time-range-picker"],
  Modal: ["modal"], AlertDialog: ["alert-dialog"], Sheet: ["sheet"], Drawer: ["drawer"],
  Popover: ["popover"], HoverCard: ["hover-card"], DropdownMenu: ["dropdown-menu"],
  ContextMenu: ["context-menu"], Menubar: ["menubar"], NavigationMenu: ["navigation-menu"],
  Command: ["command"], Combobox: ["combobox"], Toast: ["toast"],
  StatCard: ["stat-card"], PageHeader: ["page-header"], ConditionBand: ["list-filter"],
  DataTable: ["data-table", "summary-bar", "pagination"], Pagination: ["pagination"],
  EmptyState: ["empty-state"], Skeleton: ["skeleton"], StepIndicator: ["step-indicator"],
  Stepper: ["stepper"], Timeline: ["timeline"], LoadMore: ["load-more"], Chart: ["chart"],
  DetailHeader: ["detail-header"], KVGrid: ["kv-grid"], SectionCard: ["section-card"],
  OptionCard: ["option-card"], FeedList: ["feed-list"], Diff: ["diff"],
  ProductCard: ["product-card"],
};
function buildContracts(){
  document.querySelectorAll(".cx-demo").forEach(demo => {
    const nameEl = demo.querySelector(".cx-demo__name");
    if (!nameEl) return;
    const key = nameEl.textContent.trim().split(/[ /]+/)[0];
    const files = MD_MAP[key];
    if (!files) return;
    const det = document.createElement("details");
    det.className = "contract";
    const sum = document.createElement("summary");
    sum.textContent = "契约 · 权威规范（" + files.map(f => f + ".md").join(" · ") + "）";
    det.appendChild(sum);
    const body = document.createElement("div");
    body.className = "contract__body";
    body.innerHTML = files
      .map(f => CONTRACTS[f] ? CONTRACTS[f] : "<p class='md-p'>（缺少 " + f + ".md）</p>")
      .join("<hr class='contract__sep'>");
    det.appendChild(body);
    demo.appendChild(det);
  });
}
buildContracts();

// ── In-page annotation layer ──────────────────────────────────────────────
// Designers drop pinned comments on any element in <main>. Stored in
// localStorage; export/import as JSON or Markdown. Each note auto-captures the
// element's selector + resolved style values (reusing readSpec). No backend —
// sharing is via export/import (or committing the JSON).
(function(){
  const KEY = "foundation-annotations-v1";
  const NL = String.fromCharCode(10);
  const BT = String.fromCharCode(96);   // backtick — written this way so it can't close the generator template
  let list = [];
  try { const raw = localStorage.getItem(KEY); if (raw) list = JSON.parse(raw) || []; } catch (e) { list = []; }
  if (!Array.isArray(list)) list = [];

  const launch = document.createElement("button");
  launch.id = "anno-launch";
  launch.innerHTML = "✎ 批注 <span class='n' id='anno-launch-n'>0</span>";
  document.body.appendChild(launch);

  const layer = document.createElement("div");
  layer.id = "anno-layer";
  document.body.appendChild(layer);

  const panel = document.createElement("div");
  panel.id = "anno-panel"; panel.hidden = true;
  panel.innerHTML =
    "<div class='anno-panel__head'><strong>批注</strong><span id='anno-count'>0</span>" +
    "<label class='anno-mode'><input type='checkbox' id='anno-mode-cb'> 批注模式</label>" +
    "<button class='anno-x' id='anno-close'>×</button></div>" +
    "<div class='anno-list' id='anno-list'></div>" +
    "<div class='anno-foot'>" +
    "<button class='btn btn--secondary btn--sm' id='anno-ex-json'>导出 JSON</button>" +
    "<button class='btn btn--secondary btn--sm' id='anno-ex-md'>导出 MD</button>" +
    "<button class='btn btn--ghost btn--sm' id='anno-im'>导入</button>" +
    "<input type='file' id='anno-file' accept='.json' hidden></div>";
  document.body.appendChild(panel);

  const composer = document.createElement("div");
  composer.id = "anno-composer"; composer.hidden = true;
  composer.innerHTML =
    "<div class='anno-composer__sel' id='anno-sel'></div>" +
    "<textarea class='textarea' id='anno-text' placeholder='写下你的批注…'></textarea>" +
    "<div class='anno-composer__row'>" +
    "<button class='btn btn--ghost-danger btn--sm' id='anno-del'>删除</button>" +
    "<span style='flex:1'></span>" +
    "<button class='btn btn--ghost btn--sm' id='anno-cancel'>取消</button>" +
    "<button class='btn btn--primary btn--sm' id='anno-save'>保存</button></div>";
  document.body.appendChild(composer);

  const $ = id => document.getElementById(id);
  const listEl = $("anno-list"), countEl = $("anno-count"), launchN = $("anno-launch-n");
  const textEl = $("anno-text"), selEl = $("anno-sel"), delBtn = $("anno-del");
  const modeCb = $("anno-mode-cb"), fileEl = $("anno-file");

  function persist(){
    const clean = list.map(a => ({ id: a.id, path: a.path, selector: a.selector, styles: a.styles, note: a.note, t: a.t }));
    try { localStorage.setItem(KEY, JSON.stringify(clean)); } catch (e) {}
  }
  function selectorOf(el){
    return el.tagName.toLowerCase() + (el.classList.length ? "." + [...el.classList].join(".") : "");
  }
  function cssPath(el){
    const parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      if (el.id) { parts.unshift("#" + el.id); break; }
      let part = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (parent) {
        const sibs = [...parent.children].filter(c => c.tagName === el.tagName);
        if (sibs.length > 1) part += ":nth-of-type(" + (sibs.indexOf(el) + 1) + ")";
      }
      parts.unshift(part);
      el = parent;
    }
    return parts.join(">");
  }
  function resolveAll(){
    list.forEach(a => { try { a._el = a.path ? document.querySelector(a.path) : null; } catch (e) { a._el = null; } });
  }
  function renderPins(){
    layer.innerHTML = "";
    list.forEach((a, i) => {
      const pin = document.createElement("button");
      pin.className = "anno-pin";
      pin.textContent = String(i + 1);
      pin.addEventListener("click", ev => { ev.stopPropagation(); openEdit(a); });
      a._pin = pin;
      layer.appendChild(pin);
    });
    reposition();
  }
  let raf = 0;
  function reposition(){
    list.forEach(a => {
      const pin = a._pin; if (!pin) return;
      const el = a._el;
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect();
        if (r.width || r.height) {
          pin.hidden = false;
          pin.style.left = Math.min(Math.max(r.right, 4), window.innerWidth - 4) + "px";
          pin.style.top = r.top + "px";
          return;
        }
      }
      pin.hidden = true;
    });
  }
  function scheduleReposition(){ if (raf) return; raf = requestAnimationFrame(() => { raf = 0; reposition(); }); }

  function renderList(){
    listEl.innerHTML = "";
    if (!list.length) {
      const e = document.createElement("div");
      e.className = "anno-empty";
      e.textContent = "还没有批注。打开「批注模式」后，点击页面里任意元素即可添加。";
      listEl.appendChild(e);
    }
    list.forEach((a, i) => {
      const row = document.createElement("div");
      row.className = "anno-row";
      const n = document.createElement("span");
      n.className = "anno-row__n"; n.textContent = String(i + 1);
      const mid = document.createElement("div");
      const note = document.createElement("div");
      note.className = "anno-list__note"; note.textContent = a.note;
      const sel = document.createElement("div");
      sel.className = "anno-list__sel";
      sel.textContent = a._el ? a.selector : a.selector + "（未找到）";
      mid.appendChild(note); mid.appendChild(sel);
      const loc = document.createElement("button");
      loc.className = "btn btn--ghost btn--xs"; loc.textContent = "定位";
      loc.addEventListener("click", ev => { ev.stopPropagation(); locate(a); });
      row.appendChild(n); row.appendChild(mid); row.appendChild(loc);
      row.addEventListener("click", () => openEdit(a));
      listEl.appendChild(row);
    });
  }
  function updateCount(){ countEl.textContent = String(list.length); launchN.textContent = String(list.length); }
  function refresh(){ resolveAll(); renderPins(); renderList(); updateCount(); }

  function locate(a){
    if (a._el && a._el.isConnected) {
      a._el.scrollIntoView({ behavior: "smooth", block: "center" });
      a._el.classList.add("anno-flash");
      setTimeout(() => { if (a._el) a._el.classList.remove("anno-flash"); }, 1200);
    }
  }

  let ctx = null;
  function positionFloat(box, rect){
    box.hidden = false;
    const bw = box.offsetWidth, bh = box.offsetHeight;
    let top = rect.bottom + 8;
    if (top + bh > window.innerHeight - 8) top = Math.max(8, rect.top - bh - 8);
    let left = Math.min(rect.left, window.innerWidth - bw - 8);
    box.style.top = top + "px";
    box.style.left = Math.max(8, left) + "px";
  }
  function openNew(el){
    ctx = { el: el };
    selEl.textContent = selectorOf(el);
    textEl.value = ""; delBtn.hidden = true;
    positionFloat(composer, el.getBoundingClientRect());
    textEl.focus();
  }
  function openEdit(a){
    ctx = { anno: a };
    selEl.textContent = a.selector;
    textEl.value = a.note; delBtn.hidden = false;
    const rect = (a._el && a._el.isConnected) ? a._el.getBoundingClientRect()
      : { bottom: 80, top: 80, left: window.innerWidth - 320 };
    positionFloat(composer, rect);
    textEl.focus();
  }
  function closeComposer(){ composer.hidden = true; ctx = null; }

  $("anno-save").addEventListener("click", () => {
    const note = textEl.value.trim();
    if (!note) { closeComposer(); return; }
    if (ctx && ctx.anno) { ctx.anno.note = note; }
    else if (ctx && ctx.el) {
      const el = ctx.el;
      list.push({ id: "a" + Date.now() + "-" + list.length, path: cssPath(el), selector: selectorOf(el), styles: readSpec(el), note: note, t: Date.now() });
    }
    persist(); closeComposer(); refresh();
  });
  $("anno-cancel").addEventListener("click", closeComposer);
  delBtn.addEventListener("click", () => {
    if (ctx && ctx.anno) { list = list.filter(x => x !== ctx.anno); persist(); closeComposer(); refresh(); }
  });

  launch.addEventListener("click", () => { panel.hidden = !panel.hidden; });
  $("anno-close").addEventListener("click", () => { panel.hidden = true; });
  modeCb.addEventListener("change", () => {
    document.body.classList.toggle("anno-on", modeCb.checked);
    if (!modeCb.checked) { setAnnoHover(null); closeComposer(); }
  });

  function download(name, text, type){
    const blob = new Blob([text], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function toMarkdown(){
    let out = "# 设计评审批注" + NL + NL;
    list.forEach((a, i) => {
      out += "## " + (i + 1) + ". " + a.selector + NL + NL;
      out += a.note.split(NL).map(l => "> " + l).join(NL) + NL + NL;
      if (a.styles && a.styles.length) out += a.styles.map(s => "- " + s[0] + ": " + s[1]).join(NL) + NL + NL;
      out += "选择器: " + BT + a.path + BT + NL + NL;
    });
    return out;
  }
  $("anno-ex-json").addEventListener("click", () => {
    const data = list.map(a => ({ id: a.id, path: a.path, selector: a.selector, styles: a.styles, note: a.note, t: a.t }));
    download("annotations.json", JSON.stringify(data, null, 2), "application/json");
  });
  $("anno-ex-md").addEventListener("click", () => download("annotations.md", toMarkdown(), "text/markdown"));
  $("anno-im").addEventListener("click", () => fileEl.click());
  fileEl.addEventListener("change", () => {
    const f = fileEl.files && fileEl.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          const byId = new Map(list.map(a => [a.id, a]));
          data.forEach(a => { if (a && a.id) byId.set(a.id, a); });
          list = [...byId.values()];
          persist(); refresh(); panel.hidden = false;
        }
      } catch (e) { alert("导入失败：不是有效的批注 JSON。"); }
      fileEl.value = "";
    };
    reader.readAsText(f);
  });

  function isAnnoUI(t){ return t.closest && t.closest("#anno-panel,#anno-composer,#anno-layer,#anno-launch"); }
  let annoHover = null;
  function setAnnoHover(el){
    if (annoHover === el) return;
    if (annoHover) annoHover.classList.remove("anno-hl");
    annoHover = el;
    if (annoHover) annoHover.classList.add("anno-hl");
  }
  document.addEventListener("mouseover", e => {
    if (!document.body.classList.contains("anno-on")) return;
    const t = e.target;
    if (isAnnoUI(t) || !t.closest("main")) { setAnnoHover(null); return; }
    setAnnoHover(t);
  });
  document.addEventListener("click", e => {
    if (!document.body.classList.contains("anno-on")) return;
    const t = e.target;
    if (isAnnoUI(t)) return;
    if (!t.closest("main")) return;
    e.preventDefault(); e.stopPropagation();
    setAnnoHover(null);
    openNew(t);
  }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeComposer(); });
  window.addEventListener("scroll", scheduleReposition, true);
  window.addEventListener("resize", scheduleReposition);

  window.__annoRefresh = () => { resolveAll(); reposition(); renderList(); };
  refresh();
})();
</script>
</body>
</html>
`;

function pkgVersion(){
  try { return JSON.parse(readFileSync(resolve(root,"package.json"),"utf8")).version; }
  catch { return "0.0.0"; }
}

mkdirSync(resolve(root, "docs"), { recursive: true });
writeFileSync(resolve(root, "docs/index.html"), page);
writeFileSync(resolve(root, "docs/example-customer.html"), exampleHtml);
writeFileSync(resolve(root, "docs/example-customer-detail.html"), exampleDetailHtml);
console.log("✓ wrote docs/index.html + example-customer(.detail).html");
