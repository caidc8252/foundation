### pagination — numbered pager: Prev · pages (ellipsis collapse) · Next
Declarative: `nav.pagination[data-pager="numbered"][data-total][data-page]`, optional `data-firstlast` for « first / last » quick-jump. Children: `.pagination__page` (idle ghost buttons; current gets `aria-current="page"`), `.pagination__ellipsis`. Right-align in a footer. (`data-pager="simple"` renders Prev · `.pagination__current` · Next.)
```html
<nav class="pagination" aria-label="Pagination" data-pager="numbered" data-total="12" data-page="3">
  <!-- rendered children (JS builds from data-*): -->
  <button class="pagination__page" aria-label="Previous page"><svg data-lucide="chevron-left">…</svg></button>
  <button class="pagination__page" data-page="1">1</button>
  <span class="pagination__ellipsis">&hellip;</span>
  <button class="pagination__page" aria-current="page" data-page="3">3</button>
  <span class="pagination__ellipsis">&hellip;</span>
  <button class="pagination__page" data-page="12">12</button>
  <button class="pagination__page" aria-label="Next page"><svg data-lucide="chevron-right">…</svg></button>
</nav>
```
With `data-firstlast`: prepend `.pagination__page[aria-label="First page"]` (`chevrons-left`) and append `[aria-label="Last page"]` (`chevrons-right`). Boundary buttons get `disabled` at the ends.
