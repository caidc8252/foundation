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
