### tabs — a bar of triggers that switch which content panel shows
Root `.tabs` (`.tabs--vertical`) > `.tabs__list` (`--line`/`--default`, `--vertical`) of `.tabs__trigger` (active = `--active` + `aria-selected="true"` + `tabindex="0"`; others `tabindex="-1"`; `disabled` supported) then `.tabs__content` panels (`hidden` when inactive, linked via `aria-controls`/`id`).
```html
<div class="tabs">
  <div class="tabs__list tabs__list--line" role="tablist">
    <button class="tabs__trigger tabs__trigger--active" role="tab" aria-selected="true" aria-controls="panel-1" tabindex="0">Overview</button>
    <button class="tabs__trigger" role="tab" aria-selected="false" aria-controls="panel-2" tabindex="-1">Details</button>
  </div>
  <div class="tabs__content" id="panel-1" role="tabpanel">…</div>
  <div class="tabs__content" id="panel-2" role="tabpanel" hidden>…</div>
</div>
```
