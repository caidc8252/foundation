### dropzone — presentation-only file-select zone with drag-and-drop affordance
Zone: `.dropzone` (`.dropzone--drag` while dragging, `.dropzone--disabled`). Selected files render as `.file-row` items in a `.file-list` (`<ul>`). File-row parts: `.file-row__icon` `.file-row__body` `.file-row__name-row` `.file-row__name` `.file-row__size` `.file-row__error` `.file-row__status` (`--done` / `--error`); optional inline `.progress`.
```html
<label class="dropzone">
  <svg data-lucide="upload">…</svg>
  <span>Drop files here or click to browse</span>
  <input type="file" hidden multiple>
</label>
<ul class="file-list">
  <li class="file-row">
    <svg class="file-row__icon" data-lucide="file">…</svg>
    <div class="file-row__body">
      <div class="file-row__name-row">
        <span class="file-row__name">report.pdf</span>
        <span class="file-row__size">2.0 KB</span>
      </div>
    </div>
    <svg class="file-row__status file-row__status--done" data-lucide="circle-check">…</svg>
    <button class="btn btn--ghost btn--icon-sm" type="button" aria-label="Remove report.pdf"><svg data-lucide="x">…</svg></button>
  </li>
</ul>
```
