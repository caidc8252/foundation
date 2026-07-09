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
