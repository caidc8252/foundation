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
