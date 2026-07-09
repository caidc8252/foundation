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
