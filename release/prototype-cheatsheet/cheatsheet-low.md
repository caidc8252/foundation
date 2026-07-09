# Foundation cheatsheet · 档 30%

> 生成物,勿手改;改覆盖范围请编辑 component-registry.md 后跑 refresh。class vocab + 最小 markup;CSS 在壳里。

## Tokens (semantic, use `var(--…)`)

- content/surface/line/primary/status colors · space · text · radius · font-mono/sans · shadow(card/overlay). (Full list in tokens.inline.css, inlined in the shell.)

---

### button — clickable action
Variant: `.btn--primary/--secondary/--ghost/--danger/--ghost-danger/--link`. Size: `.btn--xs/--sm/--md/--lg/--auto`. Icon-only: `.btn--icon/--icon-xs/--icon-sm/--icon-lg` (needs `aria-label`).
```html
<button class="btn btn--primary" type="button"><svg data-lucide="plus">…</svg>…</button>
<button class="btn btn--ghost btn--icon-sm" type="button" aria-label="…"><svg data-lucide="…">…</svg></button>
```

### input — single-line form control
`.input` (`--sm/--md/--lg`, `--filled`). States: native `disabled`/`readonly`/`aria-invalid="true"`.
```html
<input class="input input--sm" type="text" placeholder="…">
```

### textarea — multiline form control
`.textarea`. States: native `disabled`/`readonly`/`aria-invalid="true"`.
```html
<textarea class="textarea" rows="3" placeholder="…"></textarea>
```

### select — choice form control
`.select` (`--sm`). States: native `disabled`/`aria-invalid="true"`.
```html
<select class="select"><option value="">Choose…</option><option value="a">…</option></select>
```

### checkbox — binary toggle / tri-state select-all
`.checkbox` (native `type="checkbox"`; `checked`, `disabled`; `.indeterminate` set in JS).
```html
<label><input type="checkbox" class="checkbox" aria-label="…"> …</label>
```

### field — form-row wrapper (label → control → hint/error)
`.field __required __hint __error`. Invalid: control gets `aria-invalid="true"`, error replaces hint.
```html
<div class="field">
  <label class="label" for="f1">Email<span class="field__required" aria-hidden="true"> *</span></label>
  <input class="input" id="f1" type="email" required placeholder="…">
  <p class="field__hint">…</p>
  <p class="field__error" role="alert">…</p>
</div>
```

### badge — small status/category label
Tone: `.badge--neutral/--success/--warning/--error/--info`. Shape: `.badge--tag` (mono token). Leading: `.badge__dot` (live status). Never put an icon on a status — that's the dot's job.
```html
<span class="badge badge--success"><span class="badge__dot" aria-hidden="true"></span>Active</span>
<span class="badge badge--tag">SN-8F2A19</span>
<span class="badge badge--neutral">Enterprise</span>
```

### card — bordered content panel
Modifiers: `.card--sm/--md/--lg`. Slots: `__header __title __description __action __content(--flush) __footer`.
```html
<div class="card">
  <div class="card__header">
    <h2 class="card__title">…</h2>
    <p class="card__description">…</p>
    <div class="card__action"><button class="btn btn--primary btn--md" type="button">…</button></div>
  </div>
  <div class="card__content">…</div>
</div>
```

### alert — inline in-flow status message
Tone: `.alert--info/--success/--warning/--error`. Add `.alert--with-icon`. Slots: `__icon __title __description __action`.
```html
<div class="alert alert--warning alert--with-icon" role="alert">
  <svg data-lucide="triangle-alert" class="alert__icon">…</svg>
  <div>
    <div class="alert__title">…</div>
    <p class="alert__description">…</p>
  </div>
  <div class="alert__action"><button class="btn btn--ghost btn--xs" type="button">…</button></div>
</div>
```

### modal — centered dialog over a dimmed scrim
`.modal-overlay` + `.modal` size `--sm/--md/--lg/--xl/--fullscreen`. Slots: `__header __heading __title __description __close __body __footer`.
```html
<div class="modal-overlay">
  <div class="modal modal--md" role="dialog" aria-modal="true">
    <div class="modal__header">
      <div class="modal__heading">
        <h2 class="modal__title">…</h2>
        <p class="modal__description">…</p>
      </div>
      <button class="modal__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
    </div>
    <div class="modal__body">…</div>
    <div class="modal__footer">
      <button class="btn btn--ghost" type="button">Cancel</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
</div>
```

### toast — transient auto-dismiss notification
Modifiers: `.toast--with-icon/--countdown/--loading`. Slots: `__icon`(+`--success/--info/--warning/--error/--loading`) `__content __title __description __close`.
```html
<div class="toast toast--with-icon">
  <span class="toast__icon toast__icon--success"><svg data-lucide="circle-check">…</svg></span>
  <div class="toast__content">
    <p class="toast__title">…</p>
    <p class="toast__description">…</p>
  </div>
  <button class="toast__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
</div>
```

### avatar — user/entity identity chip
Size: `.avatar--sm/--md/--lg/--xl`. Slots: `__image __fallback`. Group: `.avatar-group`.
```html
<div class="avatar avatar--md"><span class="avatar__fallback">AB</span></div>
<div class="avatar avatar--md"><img class="avatar__image" src="…" alt="…"></div>
```

### progress — numeric completion bar (0–100%)
`.progress __track __indicator` (tone `--success/--warning/--error/--info`) `__label __value`. Width via inline `style="width:N%"`.
```html
<div class="progress">
  <div style="display:flex;align-items:center;width:100%;"><span class="progress__label">…</span><span class="progress__value">64%</span></div>
  <div class="progress__track"><div class="progress__indicator" style="width:64%"></div></div>
</div>
```

### separator — hairline divider
`.separator` `.separator--vertical` · `.separator-labeled __label`.
```html
<div class="separator" role="separator" aria-orientation="horizontal"></div>
<div class="separator separator--vertical" role="separator" aria-orientation="vertical"></div>
<div class="separator-labeled"><span class="separator-labeled__label">OR</span></div>
```

### page-header — top-level page band (no back); title + actions
Modifiers: `.page-header--sticky`. Slots: `__bar __titles __heading __title __description __actions`.
```html
<div class="page-header">
  <div class="page-header__bar">
    <div class="page-header__titles">
      <div class="page-header__heading">
        <h1 class="page-header__title">…</h1>
        <span class="badge badge--success"><span class="badge__dot"></span>…</span>
      </div>
      <p class="page-header__description">…</p>
    </div>
    <div class="page-header__actions">
      <button class="btn btn--secondary" type="button">…</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
</div>
```

### detail-header — page reached INTO (has back); identity + meta + actions + tabs
Modifiers: `.detail-header--sticky`. Slots: `__bar __back __logo __main __title __name __chips __meta __actions __tabs`.
```html
<div class="detail-header">
  <div class="detail-header__bar">
    <button class="btn btn--ghost btn--icon btn--sm detail-header__back" type="button" aria-label="Back"><svg data-lucide="chevron-left">…</svg></button>
    <span class="detail-header__logo">…</span>
    <div class="detail-header__main">
      <div class="detail-header__title">
        <span class="detail-header__name">…</span>
        <span class="badge badge--success"><span class="badge__dot"></span>…</span>
        <span class="detail-header__chips"><span class="badge badge--neutral">…</span></span>
      </div>
      <div class="detail-header__meta">
        <span style="font-family:var(--font-mono);">#…</span>
        <span>…</span>
      </div>
    </div>
    <div class="detail-header__actions">
      <button class="btn btn--secondary" type="button">Edit</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
  <div class="detail-header__tabs">
    <div class="tabs__list tabs__list--line" role="tablist">
      <button class="tabs__trigger tabs__trigger--active" type="button" role="tab" aria-selected="true">…</button>
      <button class="tabs__trigger" type="button" role="tab" aria-selected="false">…</button>
    </div>
  </div>
</div>
```

### list-filter — list-page filter bar: search + quick filters + Search + applied chips
Classes: `.condition-band __toolbar __spacer` · `.search-input __icon` · `.applied-filters __label` · `.filter-chip __remove`.
```html
<div class="condition-band">
  <div class="condition-band__toolbar">
    <div class="search-input">
      <span class="search-input__icon"><svg data-lucide="search">…</svg></span>
      <input class="input" type="search" placeholder="…" aria-label="Search">
    </div>
    <select class="select" aria-label="Status filter"><option value="">All statuses</option><option>…</option></select>
    <button class="btn btn--secondary"><svg data-lucide="search">…</svg>Search</button>
  </div>
  <div class="applied-filters">
    <span class="applied-filters__label">Filters:</span>
    <span class="filter-chip">Status: Active <button class="filter-chip__remove" aria-label="Remove"><svg data-lucide="x">…</svg></button></span>
    <button class="btn btn--ghost btn--xs">clear all</button>
  </div>
</div>
```
Wrap the magnifier in `.search-input__icon` (never a bare svg in `.search-input`). Search button uses `search` glyph, not funnel. Advanced trigger = `.btn--secondary` + `data-lucide="funnel"`, pushed right by `.condition-band__spacer`.

### summary-bar — strip above the table: count + list actions (inside `.table-frame--flush`, above `.table-scroll`)
Modifiers: `.summary-bar--sticky`. Slots: `__count __actions`.
```html
<div class="table-frame table-frame--flush">
  <div class="summary-bar">
    <div class="summary-bar__count"><strong>1,248</strong> results</div>
    <div class="summary-bar__actions"><button class="btn btn--secondary btn--sm">Export</button></div>
  </div>
  <div class="table-scroll"><!-- data-table --></div>
</div>
```

### data-table — columnar records: sort, select, row actions
Modifiers: `.data-table--sticky-head --sticky-col --striped --compact --spacious`. Frame: `.table-frame(--flush) .table-scroll`. Cells: `.col-select .th-sort(__icon--active/--idle) .cell-2line(__main/__sub) .cell-num .cell-right .cell-tags .cell-empty .cell-chevron .row-actions(__inner)`. Rows: `.is-clickable`, `tr[aria-selected]`, `tr[data-disabled]`.
```html
<div class="table-frame">
  <div class="table-scroll">
    <table class="data-table data-table--sticky-head data-table--striped">
      <thead>
        <tr>
          <th class="col-select" scope="col"><label><input type="checkbox" class="checkbox" aria-label="Select all"></label></th>
          <th scope="col" aria-sort="ascending"><button class="th-sort" aria-label="Sort by name">Name<svg data-lucide="chevron-up" class="th-sort__icon--active">…</svg></button></th>
          <th scope="col">Status</th>
          <th scope="col" class="cell-right">Amount</th>
          <th scope="col" class="cell-right" aria-hidden="true"></th>
        </tr>
      </thead>
      <tbody>
        <tr aria-selected="true">
          <td class="col-select"><label><input type="checkbox" class="checkbox" checked aria-label="Select row"></label></td>
          <td><div class="cell-2line"><span class="cell-2line__main">…</span><span class="cell-2line__sub">…</span></div></td>
          <td><div class="cell-tags"><span class="badge badge--success"><span class="badge__dot" aria-hidden="true"></span>Active</span></div></td>
          <td class="cell-num cell-right">$…</td>
          <td class="row-actions"><div class="row-actions__inner">
            <button class="btn btn--ghost btn--icon-sm" type="button" aria-label="Edit"><svg data-lucide="square-pen">…</svg></button>
          </div></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
Navigation rows: `.is-clickable` on `<tr>`, no `.col-select`, and end `.row-actions__inner` with passive `<span class="cell-chevron"><svg data-lucide="chevron-right">…</svg></span>`. Empty cell: `<span class="cell-empty">&mdash;</span>`. Idle sortable header: `.th-sort__icon--idle` + `data-lucide="chevrons-up-down"`.

### rich-pagination — table footer: rows-per-page + range (left), numbered nav (right)
Slots: `.rich-pagination __left __rows __summary` · nav `.pagination __page __ellipsis` (`aria-current="page"` on active).
```html
<div class="rich-pagination">
  <div class="rich-pagination__left">
    <div class="rich-pagination__rows">Rows <select class="select select--sm" aria-label="Rows per page"><option selected>25</option><option>50</option></select></div>
    <span class="rich-pagination__summary">Showing 1&ndash;25 of <strong>1,248</strong></span>
  </div>
  <nav class="pagination" aria-label="Pagination">
    <button class="pagination__page" aria-label="Previous page" disabled><svg data-lucide="chevron-left">…</svg></button>
    <button class="pagination__page" aria-current="page" data-page="1">1</button>
    <button class="pagination__page" data-page="2">2</button>
    <span class="pagination__ellipsis">…</span>
    <button class="pagination__page" aria-label="Next page"><svg data-lucide="chevron-right">…</svg></button>
  </nav>
</div>
```

### kv-grid — detail attributes as label → value pairs (a `<dl>`)
`.kv-grid __row` (`<dt>` + `<dd>`; add `.kv-mono` on `<dd>` for IDs/amounts/dates). Empty value → em-dash in `content-tertiary`, never blank.
```html
<dl class="kv-grid">
  <div class="kv-grid__row"><dt>ID</dt><dd class="kv-mono">…</dd></div>
  <div class="kv-grid__row"><dt>Status</dt><dd>…</dd></div>
  <div class="kv-grid__row"><dt>Description</dt><dd style="color:var(--color-content-tertiary);">—</dd></div>
</dl>
```

### empty-state — what a collection shows when empty (in place of table rows)
Slots: `.empty-state __icon __title __description __action`. Omit `__action` when a header already owns the verb. Cases: cold start (create) · no results (clear filters) · error (Retry).
```html
<div class="empty-state">
  <div class="empty-state__icon"><svg data-lucide="search">…</svg></div>
  <div class="empty-state__title">…</div>
  <div class="empty-state__description">…</div>
  <div class="empty-state__action"><button class="btn btn--secondary">…</button></div>
</div>
```

### skeleton — loading placeholder (preserves layout)
Shapes: `.skeleton--line/--text/--title/--block/--circle`. Table scaffold: `.skeleton-row` (holds multiple `.skeleton--line`).
```html
<div class="skeleton skeleton--text" style="width:120px;"></div>
<div class="skeleton skeleton--circle" style="width:var(--space-10);"></div>
<div class="skeleton-row">
  <div class="skeleton skeleton--line" style="width:20%;"></div>
  <div class="skeleton skeleton--line" style="width:35%;"></div>
</div>
```
