const $ = (s, r = document) => r.querySelector(s);
const LAYER_LABEL = { primitive: "Primitives", composite: "Composites", pattern: "Patterns" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Token dict (/api/tokens with no args). Each entry: {type, chain, literal, isColor, defFile, blastRadius}.
// Needed because the outer chrome document has no foundation token vars (those live only inside the
// component iframes), so swatches resolve their color from each token's `literal` value, not var().
let TOKDICT = {};

// Component catalog (flat list from /api/components), loaded once.
let CATALOG = [];

// Foundation class set: all class names (without dot) that appear in the component catalog.
// Populated lazily on first call to getFoundationClassSet().
let _foundationClassSet = null;
async function getFoundationClassSet() {
  if (_foundationClassSet) return _foundationClassSet;
  try {
    const items = CATALOG.length ? CATALOG : await fetch("/api/components").then(r => r.json());
    const set = new Set();
    for (const it of items) {
      if (Array.isArray(it.classes)) {
        for (const cls of it.classes) {
          // Strip leading dot if present
          set.add(cls.startsWith(".") ? cls.slice(1) : cls);
        }
      }
    }
    _foundationClassSet = set;
  } catch (e) {
    console.error("getFoundationClassSet failed:", e);
    _foundationClassSet = new Set();
  }
  return _foundationClassSet;
}

// Currently selected component context (for hot-refresh + 改引用).
let selectedLayer = null;
let selectedName = null;

// ── OKLCH helpers (ported from docs/tools/detail-page-tokens/ui.js) ──────────

function parseOklch(literal) {
  const s = (literal || "").trim().replace(/\s+/g, " ");
  const m = s.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/);
  if (!m) return null;
  return {
    l: parseFloat(m[1]),
    c: parseFloat(m[2]),
    h: parseFloat(m[3]),
    a: m[4] != null ? parseFloat(m[4]) : null,
  };
}

function buildOklch(l, c, h, a) {
  if (a != null) return `oklch(${(+l).toFixed(1)}% ${(+c).toFixed(3)} ${(+h).toFixed(0)} / ${(+a).toFixed(2)})`;
  return `oklch(${(+l).toFixed(1)}% ${(+c).toFixed(3)} ${(+h).toFixed(0)})`;
}

// ── Draft banner ──────────────────────────────────────────────────────────────

async function refreshDraftBanner() {
  let banner = $("#draft-banner");
  try {
    const status = await fetch("/api/draft/status").then(r => r.json());
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "draft-banner";
      banner.className = "draft-banner";
      const top = $(".admin__top");
      if (top) top.appendChild(banner);
    }
    if (status.exists && status.changes && status.changes.length > 0) {
      banner.innerHTML = `草稿：${status.changes.length} 处改动 <button class="draft-discard-btn" type="button" id="discard-btn">丢弃</button>`;
      banner.style.display = "";
      const btn = $("#discard-btn");
      if (btn) btn.addEventListener("click", discardDraft);
    } else {
      banner.style.display = "none";
    }
  } catch (e) {
    if (banner) banner.style.display = "none";
  }
}

async function discardDraft() {
  try {
    await fetch("/api/draft/discard", { method: "POST" });
    // Refresh token dict
    const d = await fetch("/api/tokens").then(r => r.json());
    TOKDICT = d || {};

    // Check if we're in detail view
    const detailFrame = $("#detail-frame");
    if (detailFrame) {
      // Clear selection state
      _selectedIframeEl = null;
      _selectedIframeClasses = null;
      // Clear the element inspect panel back to the hint
      const elPane = $("#el-inspect");
      if (elPane) elPane.innerHTML = `<div class="detail__panel-hint">点左侧任意元素查看它的 token</div>`;
      // Reload detail iframe to root (no cache-buster needed — discard resets everything)
      const url = new URL(detailFrame.src);
      url.searchParams.set("t", Date.now());
      // After reload: just re-attach listeners (no re-selection since we cleared state)
      // The new document is a fresh object — __adminListenersAttached won't be set,
      // so attachIframeListeners will wire up normally.
      detailFrame.src = url.toString();
    } else {
      // Gallery view: reload all gallery iframes
      document.querySelectorAll(".cmp__frame").forEach(iframe => {
        const url = new URL(iframe.src);
        url.searchParams.set("t", Date.now());
        iframe.src = url.toString();
      });
      selectedLayer = null;
      selectedName = null;
      // Clear inspect pane if in gallery view
      const pane = $("#inspect");
      if (pane) pane.innerHTML = `<div class="inspect__empty">选择一个组件</div>`;
    }
    // Refresh banner
    await refreshDraftBanner();
  } catch (e) {
    console.error("discard failed:", e);
  }
}

// ── Hash routing ──────────────────────────────────────────────────────────────

function route() {
  const h = location.hash;
  if (h.startsWith("#/c/")) {
    // Parse #/c/<layer>/<name>
    const rest = h.slice(4); // strip "#/c/"
    const slash = rest.indexOf("/");
    if (slash !== -1) {
      const layer = rest.slice(0, slash);
      const name = decodeURIComponent(rest.slice(slash + 1));
      renderDetail(layer, name);
      return;
    }
  }
  renderGallery();
}

window.addEventListener("hashchange", route);

// ── Gallery view ──────────────────────────────────────────────────────────────

function renderGallery() {
  // Show gallery + inspect sidebar; hide detail view
  const galEl = $("#gallery");
  const inspectEl = $("#inspect");
  const detailEl = $("#detail");

  if (detailEl) detailEl.remove();

  if (galEl) galEl.style.display = "";
  if (inspectEl) inspectEl.style.display = "";

  // Update header hint
  const hint = $(".admin__hint");
  if (hint) hint.textContent = "点组件卡片进入详情页";

  refreshDraftBanner();
}

// ── Gallery init ──────────────────────────────────────────────────────────────

async function init() {
  const [items] = await Promise.all([
    fetch("/api/components").then(r => r.json()),
    fetch("/api/tokens").then(r => r.json()).then(d => { TOKDICT = d || {}; }),
  ]);
  CATALOG = items;
  const byLayer = { primitive: [], composite: [], pattern: [] };
  for (const it of items) (byLayer[it.layer] ||= []).push(it);
  const gal = $("#gallery");
  gal.innerHTML = ["primitive", "composite", "pattern"].map(layer => `
    <section class="grp">
      <h2 class="grp__h">${LAYER_LABEL[layer]} <span class="grp__count">${byLayer[layer].length}</span></h2>
      <div class="grid">${byLayer[layer].map(it => `
        <button class="cmp" data-layer="${it.layer}" data-name="${encodeURIComponent(it.name)}" type="button" title="${esc(it.summary || "")}">
          <div class="cmp__name">${esc(it.title || it.name)}</div>
          <iframe class="cmp__frame" loading="lazy" src="/api/render?layer=${it.layer}&name=${encodeURIComponent(it.name)}" tabindex="-1" aria-hidden="true"></iframe>
        </button>`).join("")}</div>
    </section>`).join("");

  // Navigate to detail page on card click (no longer inspect sidebar)
  gal.addEventListener("click", e => {
    const c = e.target.closest(".cmp");
    if (c) {
      const layer = c.dataset.layer;
      const name = decodeURIComponent(c.dataset.name);
      location.hash = "#/c/" + layer + "/" + encodeURIComponent(name);
    }
  });

  // Render draft banner on load
  await refreshDraftBanner();

  // Route: handles deep-link on first load
  route();
}

// ── Detail view ───────────────────────────────────────────────────────────────

function renderDetail(layer, name) {
  selectedLayer = layer;
  selectedName = name;

  // Hide gallery and inspect sidebar
  const galEl = $("#gallery");
  const inspectEl = $("#inspect");
  if (galEl) galEl.style.display = "none";
  if (inspectEl) inspectEl.style.display = "none";

  // Remove existing detail if any
  let detailEl = $("#detail");
  if (detailEl) detailEl.remove();

  // Build detail view
  const body = $(".admin__body");
  detailEl = document.createElement("div");
  detailEl.id = "detail";
  detailEl.className = "admin__detail";

  const layerLabel = LAYER_LABEL[layer] || layer;
  const title = getComponentTitle(layer, name);

  detailEl.innerHTML = `
    <div class="detail__main">
      <div class="detail__topbar">
        <button class="detail__back" type="button" id="detail-back">← 返回</button>
        <div class="detail__title">
          <span class="detail__name">${esc(title)}</span>
          <span class="detail__layer">${esc(layerLabel)}</span>
        </div>
      </div>
      <div class="detail__frame-wrap">
        <iframe
          id="detail-frame"
          class="detail__frame"
          src="/api/render?layer=${encodeURIComponent(layer)}&name=${encodeURIComponent(name)}"
          title="${esc(title)} 预览"
        ></iframe>
      </div>
    </div>
    <aside class="detail__panel" id="el-inspect">
      <div class="detail__panel-hint">点左侧任意元素查看它的 token</div>
    </aside>`;

  // Wire iframe element selection.
  // We attach the load listener BEFORE appending so it fires on fresh loads.
  // For the initial navigation (where the app JS finishes loading and the
  // iframe may already be complete by the time renderDetail runs), we also
  // poll/defer until the iframe doc is ready and attach then.
  const iframe = detailEl.querySelector("#detail-frame");
  if (iframe) {
    iframe.addEventListener("load", () => attachIframeListeners(iframe));
  }

  body.appendChild(detailEl);

  // Deferred attach: if by the time we get here the iframe is already loaded
  // (common on fast same-origin loads), attach after the current task finishes.
  if (iframe) {
    const tryAttach = () => {
      const doc = iframe.contentDocument;
      if (doc && doc.readyState === "complete" && doc.body) {
        attachIframeListeners(iframe);
      } else {
        setTimeout(tryAttach, 50);
      }
    };
    setTimeout(tryAttach, 0);
  }

  // Update header hint
  const hint = $(".admin__hint");
  if (hint) hint.textContent = `${layerLabel} / ${title}`;

  // Wire back button
  const backBtn = $("#detail-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      location.hash = "#";
    });
  }

  refreshDraftBanner();
}

function getComponentTitle(layer, name) {
  const item = CATALOG.find(it => it.layer === layer && it.name === name);
  return item ? (item.title || item.name) : name;
}

// ── iframe element selection ──────────────────────────────────────────────────

// Currently selected iframe element (for re-selecting after reload).
let _selectedIframeEl = null;
let _selectedIframeClasses = null; // the foundation class strings used in the last selectEl()

/**
 * Walk up from `node` to find the nearest element whose classList
 * contains at least one foundation class.
 */
async function closestFoundationEl(node) {
  const set = await getFoundationClassSet();
  // Use nodeType===1 (Element) instead of instanceof Element — iframe elements
  // belong to the iframe's window.Element, not the parent window's Element.
  // Walk UP from node to the nearest ancestor carrying a foundation class.
  // We must NOT early-return on a non-foundation classed element: BEM sub-parts
  // like .badge__dot (inside .badge) carry classes but none in the set — we keep
  // walking so clicking a sub-part still selects its owning component (.badge).
  // Page-local elements (.kv / .kv__value) have no foundation ancestor → null.
  let el = node && node.nodeType === 1 ? node : (node && node.parentElement);
  while (el && el.nodeType === 1) {
    if (el.classList) {
      for (const cls of el.classList) {
        if (set.has(cls)) return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

// BEM block of a class: ".badge__dot" → "badge"; ".badge--success" → "badge";
// ".kv-grid__row" → "kv-grid"; ".btn" → "btn".
function bemBlock(cls) {
  return cls.split("__")[0].split("--")[0];
}

/**
 * Decide whether `node` (the actual click/hover target) is page-local relative
 * to the resolved foundation element `foundationEl`. A click on a foundation
 * component's own BEM sub-part (e.g. .badge__dot inside .badge — same block)
 * is NOT page-local → select the component. A click on a distinct page-local
 * block that merely sits inside a foundation container (e.g. .kv__value inside
 * .kv inside the foundation .kv-grid — different block) IS page-local.
 */
function isPageLocalRelativeTo(node, foundationEl, set) {
  if (!node || node.nodeType !== 1) return false;
  if (node === foundationEl) return false; // clicked the component itself
  // The foundation element's BEM blocks (from its foundation classes).
  const fBlocks = new Set();
  for (const c of foundationEl.classList) if (set.has(c)) fBlocks.add(bemBlock(c));
  // Walk from node up to (not including) foundationEl. If any intermediate
  // element carries classes that form a block NOT belonging to the foundation
  // element and NOT itself a foundation class, it's a page-local composition.
  let el = node;
  while (el && el !== foundationEl) {
    if (el.classList && el.classList.length > 0) {
      let allBelongOrFoundation = true;
      for (const c of el.classList) {
        if (set.has(c)) continue;            // a foundation class itself → fine
        if (fBlocks.has(bemBlock(c))) continue; // BEM sub-part of the component → fine
        allBelongOrFoundation = false;       // distinct page-local block
      }
      if (!allBelongOrFoundation) return true;
    }
    el = el.parentElement;
  }
  return false;
}

function clearHover(doc) {
  if (doc) {
    doc.querySelectorAll("[data-admin-hover]").forEach(el => el.removeAttribute("data-admin-hover"));
  }
}

function clearSelected(doc) {
  if (doc) {
    doc.querySelectorAll("[data-admin-selected]").forEach(el => el.removeAttribute("data-admin-selected"));
  }
}

async function selectEl(el, iframeDoc) {
  clearSelected(iframeDoc);
  el.setAttribute("data-admin-selected", "");

  // Pass ALL classes on the element to the recipe API.
  // The set is used to decide WHICH ELEMENT to walk up to (closestFoundationEl),
  // but we include all classes in the query so modifier classes like
  // .badge--success (not in catalog's classes[]) still get their tokens.
  const allClasses = [...el.classList];
  _selectedIframeEl = el;
  _selectedIframeClasses = allClasses;

  if (allClasses.length === 0) {
    renderElementInspect(null, el, []);
    return;
  }

  const query = allClasses.map(c => "." + c).join(",");
  try {
    const recipe = await fetch("/api/element-recipe?classes=" + encodeURIComponent(query)).then(r => r.json());
    // Determine if there are any foundation tokens — if not, it's page-local
    renderElementInspect(recipe, el, allClasses);
  } catch (e) {
    console.error("element-recipe fetch failed:", e);
    const pane = $("#el-inspect");
    if (pane) pane.innerHTML = `<div class="detail__panel-hint">加载失败: ${esc(e.message)}</div>`;
  }
}

function attachIframeListeners(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  // Prevent double-attaching (happens if both the load event and the deferred
  // tryAttach both fire for the same document).
  if (doc.__adminListenersAttached) return;
  doc.__adminListenersAttached = true;

  // Hover: mouseover / mouseout.
  // Track the currently-highlighted element so we only clear+re-set when the
  // resolved foundation target actually changes — moving between sibling
  // sub-parts of the same component must not flicker the outline.
  let hoverEl = null;
  doc.addEventListener("mouseover", async e => {
    const set = await getFoundationClassSet();
    let el = await closestFoundationEl(e.target);
    // Don't highlight the foundation container when hovering a page-local block
    // nested inside it (matches the click selection semantics).
    if (el && isPageLocalRelativeTo(e.target, el, set)) el = null;
    if (el === hoverEl) return; // same target → no change, no flicker
    if (hoverEl) hoverEl.removeAttribute("data-admin-hover");
    hoverEl = el;
    if (el) el.setAttribute("data-admin-hover", "");
  });

  doc.addEventListener("mouseout", e => {
    // Only clear when the pointer actually leaves the iframe document
    // (relatedTarget null) or moves to a non-descendant — guard against the
    // mouseout fired while moving between children of the same hovered element.
    const to = e.relatedTarget;
    if (hoverEl && to && (to === hoverEl || (hoverEl.contains && hoverEl.contains(to)))) return;
    if (hoverEl) hoverEl.removeAttribute("data-admin-hover");
    hoverEl = null;
  });

  // Click: select element
  doc.addEventListener("click", async e => {
    e.preventDefault();
    e.stopPropagation();
    const set = await getFoundationClassSet();
    const el = await closestFoundationEl(e.target);
    // Page-local when: no foundation ancestor at all, OR the clicked target is a
    // distinct page-local block nested inside a foundation container (not a BEM
    // sub-part of the resolved component).
    if (!el || isPageLocalRelativeTo(e.target, el, set)) {
      const raw = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
      if (raw) {
        clearSelected(doc);
        raw.setAttribute("data-admin-selected", "");
        _selectedIframeEl = raw;
        _selectedIframeClasses = [];
        renderElementInspect(null, raw, []);
      }
      return;
    }
    selectEl(el, doc);
  });
}

/**
 * Render the element inspect panel (READ-ONLY).
 * recipe = result from /api/element-recipe (may be null for page-local elements).
 * el = the selected DOM element inside the iframe.
 * fclasses = array of foundation class names (without dot).
 */
function renderElementInspect(recipe, el, fclasses) {
  const pane = $("#el-inspect");
  if (!pane) return;

  // Determine if there are any foundation tokens
  const hasTokens = recipe && recipe.groups && (
    Object.values(recipe.groups).some(arr => arr && arr.length > 0) ||
    (recipe.pseudo && recipe.pseudo.length > 0)
  );

  const elClasses = el ? [...el.classList].join(" ") : "";

  if (!hasTokens) {
    pane.innerHTML = `
      <div class="inspect__h">
        <code class="inspect__classes">${esc(elClasses || "(element)")}</code>
      </div>
      <div class="detail__panel-hint">页面局部组合,无可改 token</div>`;
    return;
  }

  // Use renderRecipeInto with a tweaked recipe that has the element's full class string
  const displayRecipe = { ...recipe, classes: [elClasses], name: elClasses };
  renderRecipeInto(pane, displayRecipe, null, null);
}

// ── Reload helpers ────────────────────────────────────────────────────────────

/**
 * Refresh the element inspect panel (#el-inspect) for the currently selected element.
 * Re-fetches element-recipe and re-renders (editable). Used after hot-refresh in detail view.
 */
async function refreshElementPanel() {
  if (!_selectedIframeClasses || _selectedIframeClasses.length === 0) return;
  const pane = $("#el-inspect");
  if (!pane) return;
  // Refresh token dict so literal values are current
  try {
    const d = await fetch("/api/tokens").then(r => r.json());
    TOKDICT = d || {};
  } catch (e) { /* ignore */ }
  const query = _selectedIframeClasses.map(c => "." + c).join(",");
  try {
    const recipe = await fetch("/api/element-recipe?classes=" + encodeURIComponent(query)).then(r => r.json());
    // Reconstruct a display element for renderElementInspect (we only need classList)
    const mockEl = { classList: _selectedIframeClasses };
    renderElementInspect(recipe, mockEl, _selectedIframeClasses);
  } catch (e) {
    console.error("refreshElementPanel failed:", e);
  }
}

/**
 * After hot-refresh of the detail iframe, re-attach listeners and re-select the
 * previously-selected element (by matching its foundation classes).
 */
function reattachAndReselect(iframe) {
  attachIframeListeners(iframe);
  if (!_selectedIframeClasses || _selectedIframeClasses.length === 0) return;
  const doc = iframe.contentDocument;
  if (!doc || !doc.body) return;
  // Find first element matching any of the saved foundation classes
  for (const cls of _selectedIframeClasses) {
    const match = doc.body.querySelector("." + CSS.escape(cls));
    if (match) {
      // Re-select it silently (set attribute + re-render panel)
      clearSelected(doc);
      match.setAttribute("data-admin-selected", "");
      _selectedIframeEl = match;
      // Don't update _selectedIframeClasses — they're already set
      break;
    }
  }
  refreshElementPanel().then(() => refreshDraftBanner());
}

function reloadComponent() {
  if (!selectedLayer || !selectedName) return;
  // Try detail frame first
  const detailFrame = $("#detail-frame");
  if (detailFrame) {
    const url = new URL(detailFrame.src);
    url.searchParams.set("t", Date.now());
    // After reload: re-attach listeners + re-select element + refresh panel + banner.
    // { once: true } auto-removes the listener before the callback runs.
    detailFrame.addEventListener("load", () => reattachAndReselect(detailFrame), { once: true });
    detailFrame.src = url.toString();
    return;
  }
  // Fall back to gallery iframe
  const iframe = document.querySelector(
    `.cmp[data-layer="${selectedLayer}"][data-name="${encodeURIComponent(selectedName)}"] .cmp__frame`
  );
  if (iframe) {
    const url = new URL(iframe.src);
    url.searchParams.set("t", Date.now());
    iframe.src = url.toString();
  }
}

async function refreshSidebar() {
  if (!selectedLayer || !selectedName) return;
  // In detail view, refresh the element panel instead of the gallery inspect pane
  const detailFrame = $("#detail-frame");
  if (detailFrame) {
    // Element panel refresh is handled by reattachAndReselect (called from reloadComponent's onload)
    return;
  }
  // Refresh global token dict first
  const d = await fetch("/api/tokens").then(r => r.json());
  TOKDICT = d || {};
  const pane = $("#inspect");
  if (!pane) return;
  try {
    const r = await (await fetch(`/api/tokens?layer=${selectedLayer}&name=${encodeURIComponent(selectedName)}`)).json();
    renderRecipeInto(pane, r, selectedLayer, selectedName);
  } catch (err) {
    pane.innerHTML = `<div class="inspect__empty">加载失败: ${esc(err.message)}</div>`;
  }
}

// ── Chip + recipe rendering ───────────────────────────────────────────────────

const CAT = { color: "颜色", type: "字体", space: "间距·尺寸", border: "边框·圆角·阴影" };

const paintable = (lit) => /^(oklch|rgb|hsl|lab|lch|color|var|#)|^[a-z]+$/i.test(String(lit || "").trim());

const chip = (u) => {
  if (!u.token) return `<span class="val">${esc(u.value)}</span>`;
  const info = TOKDICT[u.token];
  const sw = info && info.isColor && paintable(info.literal)
    ? `<i class="sw" style="background:${esc(info.literal)}"></i>`
    : "";
  return `<span class="tok">${sw}<code class="tok__name">${esc(u.token)}</code></span>`;
};

/**
 * Render the recipe into `pane`. Wires edit affordances.
 * layer + name are needed so edit actions know where to post.
 */
function renderRecipeInto(pane, r, layer, name) {
  if (!r || !r.groups) {
    pane.innerHTML = `<div class="inspect__empty">无数据</div>`;
    return;
  }

  // Build the primary selector from r.classes[0] (used for 改引用 POST body)
  const primaryClass = (r.classes && r.classes[0]) || r.name;

  const grp = (g) => {
    if (!r.groups[g] || !r.groups[g].length) return "";
    const rows = r.groups[g].map(u => rowHtml(u, g, layer, primaryClass)).join("");
    return `<div class="ig">
      <span class="ig__cat">${CAT[g]}</span>
      ${rows}
    </div>`;
  };

  const ps = r.pseudo && r.pseudo.length
    ? `<div class="ig ig--ps">
        <span class="ig__cat">伪类</span>
        ${r.pseudo.map(p => `<div class="trow"><span class="prop">${esc(p.pseudo)} ${esc(p.prop)}</span>${chip(p)}</div>`).join("")}
       </div>`
    : "";

  pane.innerHTML = `
    <div class="inspect__h">
      <code class="inspect__classes">${esc((r.classes || []).join(" ") || r.name)}</code>
    </div>
    ${["color", "type", "space", "border"].map(grp).join("")}
    ${ps}`;

  // Wire edit affordances (each select carries its own data-selector)
  wireEditors(pane);
}

/**
 * Build one token row, including edit affordances.
 * For color tokens with literals, adds 编辑值 button + hidden OKLCH editor.
 * For token rows, adds 改引用 affordance.
 */
function rowHtml(u, group, layer, primaryClass) {
  const tokenId = u.token ? u.token.replace(/[^a-z0-9]/g, "-") : "";
  const info = u.token ? TOKDICT[u.token] : null;

  let editValueHtml = "";
  if (u.token && info && info.isColor) {
    const parsed = parseOklch(info.literal);
    if (parsed) {
      // OKLCH sliders
      editValueHtml = `
        <button class="edit-val-btn" type="button" data-tok="${esc(u.token)}" aria-expanded="false">编辑值</button>
        <div class="oklch-editor" id="oklch-${esc(tokenId)}" hidden>
          <div class="oklch-preview">
            <i class="sw oklch-sw" id="oksw-${esc(tokenId)}" style="background:${esc(info.literal)}"></i>
            <code class="oklch-lit" id="oklit-${esc(tokenId)}">${esc(info.literal)}</code>
          </div>
          <label class="sl-row">
            <span class="sl-lbl">L</span>
            <input type="range" class="sl-range" id="sl-l-${esc(tokenId)}" min="0" max="100" step="0.5" value="${parsed.l}"
              data-tok="${esc(u.token)}" data-comp="l" data-alpha="${parsed.a != null ? parsed.a : ""}">
            <span class="sl-readout" id="ro-l-${esc(tokenId)}">${parsed.l.toFixed(1)}%</span>
          </label>
          <label class="sl-row">
            <span class="sl-lbl">C</span>
            <input type="range" class="sl-range" id="sl-c-${esc(tokenId)}" min="0" max="0.4" step="0.005" value="${parsed.c}"
              data-tok="${esc(u.token)}" data-comp="c">
            <span class="sl-readout" id="ro-c-${esc(tokenId)}">${parsed.c.toFixed(3)}</span>
          </label>
          <label class="sl-row">
            <span class="sl-lbl">H</span>
            <input type="range" class="sl-range" id="sl-h-${esc(tokenId)}" min="0" max="360" step="1" value="${parsed.h}"
              data-tok="${esc(u.token)}" data-comp="h">
            <span class="sl-readout" id="ro-h-${esc(tokenId)}">${parsed.h.toFixed(0)}°</span>
          </label>
          <div class="oklch-actions">
            <button class="ok-apply-btn" type="button" data-tok="${esc(u.token)}" data-tokid="${esc(tokenId)}">应用</button>
          </div>
        </div>`;
    } else {
      // Non-OKLCH color: text input fallback
      editValueHtml = `
        <button class="edit-val-btn" type="button" data-tok="${esc(u.token)}" aria-expanded="false">编辑值</button>
        <div class="text-editor" id="oklch-${esc(tokenId)}" hidden>
          <input type="text" class="text-val-input" value="${esc(info.literal || "")}"
            data-tok="${esc(u.token)}" placeholder="CSS value">
          <button class="ok-apply-btn ok-apply-text" type="button" data-tok="${esc(u.token)}" data-tokid="${esc(tokenId)}">应用</button>
        </div>`;
    }
  }

  // Use the sourceSelector/sourceLayer from the usage if available (element-recipe provides these
  // per-declaration), otherwise fall back to the passed layer/primaryClass (gallery sidebar path).
  const effectiveSelector = u.sourceSelector || primaryClass;
  const effectiveLayer = u.sourceLayer || layer || "";

  let refHtml = "";
  if (u.token && info) {
    // Build compatible token list (same isColor flag, same --color- prefix for color tokens)
    const compatTokens = buildCompatTokens(u.token, info);
    if (compatTokens.length > 1) {
      const opts = compatTokens.map(t => `<option value="${esc(t)}"${t === u.token ? " selected" : ""}>${esc(t)}</option>`).join("");
      refHtml = `
        <div class="ref-editor" id="ref-${esc(tokenId)}">
          <label class="ref-label">改引用</label>
          <select class="ref-sel" data-tok="${esc(u.token)}" data-prop="${esc(u.prop)}" data-layer="${esc(effectiveLayer)}" data-selector="${esc(effectiveSelector)}">${opts}</select>
        </div>`;
    }
    // For alias tokens, also add 重指 (same as 改引用 but via /api/reference {alias,toToken})
    if (info.type === "alias") {
      const rampSiblings = buildRampSiblings(u.token);
      if (rampSiblings.length > 0) {
        const currentTarget = (info.chain && info.chain[1]) || u.token;
        const opts2 = rampSiblings.map(t => `<option value="${esc(t)}"${t === currentTarget ? " selected" : ""}>${esc(t)}</option>`).join("");
        refHtml += `
          <div class="alias-editor" id="alias-${esc(tokenId)}">
            <label class="ref-label">重指别名</label>
            <select class="alias-sel" data-alias="${esc(u.token)}">${opts2}</select>
          </div>`;
      }
    }
  }

  return `<div class="trow trow--edit">
    <span class="prop">${esc(u.prop)}</span>
    <div class="trow-right">
      ${chip(u)}
      ${editValueHtml}
      ${refHtml}
    </div>
  </div>`;
}

// Token name-prefix families. The 改引用 picker for a property must only offer
// tokens of a compatible family, otherwise nonsensical swaps are possible
// (e.g. font-family → --radius-md, which the API would accept). The internal
// `type` field is too coarse (typography, radius, breakpoint, shadow all share
// type:"other"), so we group by token name-prefix instead.
const TOKEN_FAMILIES = [
  // typography: fonts + text sizes (font-family / font-size / line-height / letter-spacing)
  { test: (t) => /^--font-/.test(t) || /^--text-/.test(t) },
  // spacing + sizing (gap / padding* / margin* / width / height / inset / ...)
  { test: (t) => /^--space-/.test(t) || /^--spacing-/.test(t) },
  // radius
  { test: (t) => /^--radius-/.test(t) },
  // shadow
  { test: (t) => /^--shadow-/.test(t) },
  // duration / easing (motion)
  { test: (t) => /^--duration-/.test(t) || /^--ease-/.test(t) },
  // breakpoints / containers (layout dimensions)
  { test: (t) => /^--breakpoint-/.test(t) || /^--container-/.test(t) },
];

function familyOf(tokenName) {
  return TOKEN_FAMILIES.find(f => f.test(tokenName)) || null;
}

function buildCompatTokens(tokenName, info) {
  // For color tokens: match isColor + same --color- prefix family
  const familyMatch = tokenName.match(/^(--color-[a-z]+)/);
  const colorFamily = familyMatch ? familyMatch[1] : null;
  // For non-color tokens: match by token name-prefix family (typography/spacing/radius/...).
  const nameFamily = colorFamily ? null : familyOf(tokenName);
  return Object.keys(TOKDICT).filter(t => {
    const ti = TOKDICT[t];
    if (!ti) return false;
    if (info.isColor !== ti.isColor) return false;
    if (colorFamily) {
      // same color family prefix
      return t.startsWith(colorFamily + "-") || t === tokenName;
    }
    if (nameFamily) {
      // same name-prefix family (e.g. --font-*/--text-* for typography props)
      return nameFamily.test(t) || t === tokenName;
    }
    // unrecognized family: fall back to same internal type
    return ti.type === info.type;
  }).sort();
}

function buildRampSiblings(aliasName) {
  // Find ramp tokens in the same --color-<family> group
  const m = aliasName.match(/^--color-([a-z]+)/);
  if (!m) return [];
  const family = m[1];
  return Object.keys(TOKDICT).filter(t => {
    const ti = TOKDICT[t];
    return ti && ti.type === "ramp" && t.startsWith(`--color-${family}-`);
  }).sort();
}

// ── Wire event handlers ───────────────────────────────────────────────────────

function wireEditors(pane) {
  // Toggle OKLCH/text editor open/close
  pane.querySelectorAll(".edit-val-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tok = btn.dataset.tok;
      const tokId = tok.replace(/[^a-z0-9]/g, "-");
      const editor = pane.querySelector(`#oklch-${tokId}`);
      if (!editor) return;
      const open = !editor.hidden;
      editor.hidden = open;
      btn.setAttribute("aria-expanded", String(!open));
      btn.textContent = open ? "编辑值" : "收起";
    });
  });

  // OKLCH slider live preview (update readouts + swatch, but only POST on 应用)
  pane.querySelectorAll(".sl-range").forEach(input => {
    input.addEventListener("input", () => {
      const tok = input.dataset.tok;
      const tokId = tok.replace(/[^a-z0-9]/g, "-");
      updateSliderReadout(pane, tokId);
    });
  });

  // Apply OKLCH value button
  pane.querySelectorAll(".ok-apply-btn:not(.ok-apply-text)").forEach(btn => {
    btn.addEventListener("click", async () => {
      const tok = btn.dataset.tok;
      const tokId = btn.dataset.tokid;
      const lEl = pane.querySelector(`#sl-l-${tokId}`);
      const cEl = pane.querySelector(`#sl-c-${tokId}`);
      const hEl = pane.querySelector(`#sl-h-${tokId}`);
      if (!lEl || !cEl || !hEl) return;
      const alpha = lEl.dataset.alpha !== "" ? parseFloat(lEl.dataset.alpha) : null;
      const newVal = buildOklch(parseFloat(lEl.value), parseFloat(cEl.value), parseFloat(hEl.value), alpha);
      await applyValueEdit(tok, newVal, btn);
    });
  });

  // Apply text value button
  pane.querySelectorAll(".ok-apply-text").forEach(btn => {
    btn.addEventListener("click", async () => {
      const tok = btn.dataset.tok;
      const tokId = btn.dataset.tokid;
      const input = pane.querySelector(`#oklch-${tokId} .text-val-input`);
      if (!input) return;
      await applyValueEdit(tok, input.value.trim(), btn);
    });
  });

  // 改引用 select
  pane.querySelectorAll(".ref-sel").forEach(sel => {
    sel.addEventListener("change", async () => {
      const fromToken = sel.dataset.tok;
      const toToken = sel.value;
      if (toToken === fromToken) return;
      const prop = sel.dataset.prop;
      const selLayer = sel.dataset.layer;
      const selector = sel.dataset.selector;
      await applyReferenceEdit({ layer: selLayer, selector, prop, fromToken, toToken }, sel);
    });
  });

  // 重指别名 select
  pane.querySelectorAll(".alias-sel").forEach(sel => {
    sel.addEventListener("change", async () => {
      const alias = sel.dataset.alias;
      const toToken = sel.value;
      await applyAliasEdit(alias, toToken, sel);
    });
  });
}

function updateSliderReadout(pane, tokId) {
  const lEl = pane.querySelector(`#sl-l-${tokId}`);
  const cEl = pane.querySelector(`#sl-c-${tokId}`);
  const hEl = pane.querySelector(`#sl-h-${tokId}`);
  const roL = pane.querySelector(`#ro-l-${tokId}`);
  const roC = pane.querySelector(`#ro-c-${tokId}`);
  const roH = pane.querySelector(`#ro-h-${tokId}`);
  if (lEl && roL) roL.textContent = `${parseFloat(lEl.value).toFixed(1)}%`;
  if (cEl && roC) roC.textContent = parseFloat(cEl.value).toFixed(3);
  if (hEl && roH) roH.textContent = `${parseFloat(hEl.value).toFixed(0)}°`;

  // Update preview swatch using live values
  if (lEl && cEl && hEl) {
    const alpha = lEl.dataset.alpha !== "" ? parseFloat(lEl.dataset.alpha) : null;
    const newVal = buildOklch(parseFloat(lEl.value), parseFloat(cEl.value), parseFloat(hEl.value), alpha);
    const swEl = pane.querySelector(`#oksw-${tokId}`);
    const litEl = pane.querySelector(`#oklit-${tokId}`);
    if (swEl) swEl.style.background = newVal;
    if (litEl) litEl.textContent = newVal;
  }
}

async function applyValueEdit(tok, newVal, btn) {
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "…";
  try {
    const res = await fetch("/api/value", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: tok, value: newVal }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("改值失败:", data.error);
      btn.textContent = "失败";
      setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 2000);
      return;
    }
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 1000);
    reloadComponent();
    await refreshSidebar();
    await refreshDraftBanner();
  } catch (e) {
    console.error("改值请求失败:", e);
    btn.textContent = "失败";
    setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 2000);
  }
}

async function applyReferenceEdit({ layer, selector, prop, fromToken, toToken }, sel) {
  sel.disabled = true;
  try {
    const res = await fetch("/api/reference", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ layer, selector, prop, fromToken, toToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("改引用失败:", data.error);
      sel.disabled = false;
      return;
    }
    reloadComponent();
    await refreshSidebar();
    await refreshDraftBanner();
  } catch (e) {
    console.error("改引用请求失败:", e);
    sel.disabled = false;
  }
}

async function applyAliasEdit(alias, toToken, sel) {
  sel.disabled = true;
  try {
    const res = await fetch("/api/reference", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ alias, toToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("重指别名失败:", data.error);
      sel.disabled = false;
      return;
    }
    reloadComponent();
    await refreshSidebar();
    await refreshDraftBanner();
  } catch (e) {
    console.error("重指别名请求失败:", e);
    sel.disabled = false;
  }
}

init();
