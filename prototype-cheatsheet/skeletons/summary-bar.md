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
