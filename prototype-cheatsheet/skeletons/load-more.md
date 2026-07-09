### load-more — append-on-click footer beneath a list/table
`.load-more` = optional `.load-more__summary` + (a `.btn--secondary.btn--lg` "Load more" OR, when done, `.load-more__end` marker) + optional `.load-more__progress` (wraps a `.progress` bar). All copy passed in.
```html
<div class="load-more">
  <div class="load-more__summary">Showing 50 of 1,248</div>
  <button class="btn btn--secondary btn--lg">
    <svg data-lucide="plus">…</svg>
    Load more
  </button>
  <div class="load-more__progress">
    <div class="progress" role="progressbar" aria-label="Loaded so far" aria-valuenow="50" aria-valuemin="0" aria-valuemax="1248">
      <div class="progress__track"><div class="progress__indicator" style="width: 4%;"></div></div>
    </div>
  </div>
</div>
```
Loading: button gets `disabled` and swaps icon for `<span class="spinner-inline"></span>` + "Loading…". Done: drop the button, use `<div class="load-more__end">You've reached the end</div>` and set progress to 100%.
