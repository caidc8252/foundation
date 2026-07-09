### diff — compact before → after comparison (old struck · arrow · new highlighted)
`.diff` (add `.diff--inline` to collapse the 3-column grid into one mono line for rows/table cells). Columns: `.diff__col.diff__col--old` and `.diff__col.diff__col--new`, each with `.diff__label` (BEFORE/AFTER) + `.diff__value`; an `.diff__arrow` between them. Absence uses `.diff__value.diff__value--empty` (em-dash).
```html
<div class="diff">
  <div class="diff__col diff__col--old">
    <div class="diff__label">BEFORE</div>
    <div class="diff__value">Member</div>
  </div>
  <div class="diff__arrow" aria-hidden="true"><svg data-lucide="arrow-right">…</svg></div>
  <div class="diff__col diff__col--new">
    <div class="diff__label">AFTER</div>
    <div class="diff__value">Admin</div>
  </div>
</div>
```
Add (no prior value): old `.diff__value--empty` = "—". Remove: new `.diff__value--empty` = "—". Inline variant: wrap the same markup with `class="diff diff--inline"` (labels hidden, reads horizontally).
