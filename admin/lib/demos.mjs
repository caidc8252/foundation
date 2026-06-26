// Curated demo snippets: real foundation classes lifted from patterns/*.html.
// Keys = catalog `name`. Missing/empty key → synthFallback.
export const DEMOS = {
  // ── Primitives ──────────────────────────────────────────────────────────────
  button: `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <button class="btn btn--primary" type="button">Primary</button>
    <button class="btn btn--secondary" type="button">Secondary</button>
    <button class="btn btn--ghost" type="button">Ghost</button>
    <button class="btn btn--primary btn--sm" type="button">Small</button>
    <button class="btn btn--secondary" type="button" disabled>Disabled</button>
  </div>`,

  badge: `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <span class="badge badge--success"><span class="badge__dot"></span>Active</span>
    <span class="badge badge--neutral">Enterprise</span>
    <span class="badge badge--warning"><span class="badge__dot"></span>Pending</span>
    <span class="badge badge--error">Error</span>
    <span class="badge badge--info">Info</span>
  </div>`,

  card: `<div class="card" style="max-width:320px">
    <div class="card__header"><strong>Card title</strong></div>
    <div class="card__content">Card content body text goes here.</div>
  </div>`,

  input: `<div style="display:flex;flex-direction:column;gap:12px;max-width:280px">
    <input class="input" placeholder="Default placeholder">
    <input class="input" value="Filled value">
    <input class="input" placeholder="Disabled" disabled>
  </div>`,

  field: `<div style="display:flex;flex-direction:column;gap:16px;max-width:320px">
    <div class="field">
      <label>Name <span class="field__required">*</span></label>
      <input class="input" placeholder="Enter name">
    </div>
    <div class="field">
      <label>Email</label>
      <input class="input" type="email" placeholder="you@example.com">
      <span class="field__hint">We will never share your email.</span>
    </div>
  </div>`,

  alert: `<div style="display:flex;flex-direction:column;gap:8px;max-width:400px">
    <div class="alert alert--success">
      <div class="alert__title">Success</div>
      <div class="alert__description">Your changes have been saved successfully.</div>
    </div>
    <div class="alert alert--warning">
      <div class="alert__title">Warning</div>
      <div class="alert__description">This action cannot be undone.</div>
    </div>
    <div class="alert alert--error">
      <div class="alert__title">Error</div>
      <div class="alert__description">Something went wrong. Please try again.</div>
    </div>
  </div>`,

  avatar: `<div style="display:flex;gap:12px;align-items:center">
    <div class="avatar avatar--sm"><span class="avatar__fallback">JD</span></div>
    <div class="avatar avatar--md"><span class="avatar__fallback">AB</span></div>
    <div class="avatar avatar--lg"><span class="avatar__fallback">XY</span></div>
  </div>`,

  tabs: `<div class="tabs" style="max-width:400px">
    <div class="tabs__list tabs__list--line" role="tablist">
      <button class="tabs__trigger tabs__trigger--active" type="button" role="tab" aria-selected="true">Overview</button>
      <button class="tabs__trigger" type="button" role="tab" aria-selected="false">Activity</button>
      <button class="tabs__trigger" type="button" role="tab" aria-selected="false">Settings</button>
    </div>
    <div class="tabs__content" role="tabpanel"><p style="padding-top:12px;margin:0;color:var(--color-text-2)">Tab panel content area</p></div>
  </div>`,

  breadcrumb: `<nav aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Home</a></li>
      <li class="breadcrumb__separator" aria-hidden="true">/</li>
      <li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Customers</a></li>
      <li class="breadcrumb__separator" aria-hidden="true">/</li>
      <li class="breadcrumb__item"><span class="breadcrumb__page" aria-current="page">Acme Robotics</span></li>
    </ol>
  </nav>`,

  separator: `<div style="display:flex;flex-direction:column;gap:12px;max-width:300px">
    <p style="margin:0">Above the separator</p>
    <hr class="separator">
    <p style="margin:0">Below the separator</p>
  </div>`,

  spinner: `<div style="display:flex;gap:16px;align-items:center">
    <span class="spinner spinner--sm" aria-label="Loading"></span>
    <span class="spinner" aria-label="Loading"></span>
    <span class="spinner spinner--lg" aria-label="Loading"></span>
  </div>`,

  // ── Composites ──────────────────────────────────────────────────────────────
  "kv-grid": `<dl class="kv-grid" style="max-width:480px">
    <div class="kv-grid__row"><dt>Account ID</dt><dd>C-10293</dd></div>
    <div class="kv-grid__row"><dt>Plan</dt><dd>Enterprise (annual)</dd></div>
    <div class="kv-grid__row"><dt>Region</dt><dd>APAC · Singapore</dd></div>
    <div class="kv-grid__row"><dt>Status</dt><dd>Active</dd></div>
    <div class="kv-grid__row kv-grid__row--full"><dt>Billing address</dt><dd>2200 Mission St, Suite 4, San Francisco, CA 94110</dd></div>
  </dl>`,

  timeline: `<ul class="timeline" style="max-width:400px">
    <li class="timeline__item">
      <div class="timeline__marker timeline__marker--icon timeline__marker--success">
        <div class="timeline__marker-node">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div class="timeline__rail"></div>
      </div>
      <div class="timeline__content">
        <div class="timeline__header">
          <span class="timeline__title">Order delivered</span>
          <time class="timeline__time">May 9, 2026</time>
        </div>
        <p class="timeline__description">5 terminals shipped and signed for.</p>
      </div>
    </li>
    <li class="timeline__item timeline__item--last">
      <div class="timeline__marker timeline__marker--dot timeline__marker--neutral">
        <div class="timeline__marker-node"><span class="timeline__marker-dot"></span></div>
        <div class="timeline__rail"></div>
      </div>
      <div class="timeline__content">
        <div class="timeline__header">
          <span class="timeline__title">Plan upgraded</span>
          <time class="timeline__time">Apr 12, 2026</time>
        </div>
        <p class="timeline__description">Moved from Growth to Enterprise.</p>
      </div>
    </li>
  </ul>`,

  "empty-state": `<div class="empty-state" style="max-width:400px">
    <div class="empty-state__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
    </div>
    <div class="empty-state__title">No results found</div>
    <p class="empty-state__description">Try adjusting your search or filter criteria to see results.</p>
    <div class="empty-state__action">
      <button class="btn btn--secondary" type="button">Clear filters</button>
    </div>
  </div>`,

  "page-header": `<header class="page-header" style="max-width:600px">
    <div class="page-header__bar">
      <div class="page-header__titles">
        <div class="page-header__heading">
          <h1 class="page-header__title">Customers</h1>
          <span class="page-header__count">1,248</span>
        </div>
        <p class="page-header__description">Browse, filter, and manage customer accounts.</p>
      </div>
      <div class="page-header__actions">
        <button class="btn btn--secondary" type="button">Import</button>
        <button class="btn btn--primary" type="button">New customer</button>
      </div>
    </div>
  </header>`,

  skeleton: `<div style="display:flex;flex-direction:column;gap:8px;max-width:320px">
    <span class="skeleton skeleton--title"></span>
    <span class="skeleton skeleton--line"></span>
    <span class="skeleton skeleton--line"></span>
    <span class="skeleton skeleton--line" style="width:60%"></span>
  </div>`,

  "stat-card": `<div style="display:flex;gap:12px;flex-wrap:wrap;max-width:600px">
    <div class="stat-card">
      <div class="stat-card__head">
        <span class="stat-card__label">Total revenue</span>
      </div>
      <div class="stat-card__value">$48,200</div>
    </div>
    <div class="stat-card stat-card--selected">
      <div class="stat-card__head">
        <span class="stat-card__label">Active customers</span>
      </div>
      <div class="stat-card__value">1,248</div>
    </div>
  </div>`,

  "section-card": `<div class="card section-card" style="max-width:360px">
    <div class="card__header"><h2 style="margin:0;font-size:var(--text-sm);font-weight:600">Overview</h2></div>
    <div class="card__content">Section card content goes here.</div>
  </div>`,
};

export function synthFallback(entry) {
  // classes[0] may be a custom property (e.g. "--ratio"), not a selector;
  // pick the first real `.class` selector.
  const cls = (entry.classes.find(c => c.startsWith(".")) || entry.classes[0] || "").replace(/^\./, "");
  const tag = /btn|button/.test(cls) ? "button" : "div";
  return `<${tag} class="${cls}">${entry.title}</${tag}>`;
}

export function demoFor(entry) {
  const html = DEMOS[entry.name];
  return html != null && html !== "" ? { html, curated: true } : { html: synthFallback(entry), curated: false };
}
