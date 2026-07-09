### resizable — draggable split-pane: sibling panels separated by a hairline drag handle
Group `.resizable-group` (`--vertical` for stacked). Panels `.resizable-panel`; between them a `.resizable-handle` (`--horizontal` in a vertical group), `role="separator" tabindex="0"` + `aria-orientation`. Optional `.resizable-handle__grip` visual grip inside the handle. Multiple panels alternate panel/handle/panel.
```html
<div class="resizable-group">
  <div class="resizable-panel">…</div>
  <div class="resizable-handle" role="separator" tabindex="0" aria-orientation="vertical"></div>
  <div class="resizable-panel">…</div>
</div>
```
