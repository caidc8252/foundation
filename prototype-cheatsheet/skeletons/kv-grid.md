### kv-grid — detail attributes as label → value pairs (a `<dl>`)
`.kv-grid __row` (`<dt>` + `<dd>`; add `.kv-mono` on `<dd>` for IDs/amounts/dates). Empty value → em-dash in `content-tertiary`, never blank.
```html
<dl class="kv-grid">
  <div class="kv-grid__row"><dt>ID</dt><dd class="kv-mono">…</dd></div>
  <div class="kv-grid__row"><dt>Status</dt><dd>…</dd></div>
  <div class="kv-grid__row"><dt>Description</dt><dd style="color:var(--color-content-tertiary);">—</dd></div>
</dl>
```
