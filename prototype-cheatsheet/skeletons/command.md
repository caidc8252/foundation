### command — keyboard-driven command palette (search over a grouped, filtered item list)
Shell `.command` > `.command__input-wrapper` (wraps an `.input-group` + `.command__input`) then `.command__list`. List holds `.command__group` (`.command__group-heading` + `.command__item`, active = `--active`, disabled item = `data-disabled="true"`, trailing `.command__shortcut`), split by `.command__separator`; no matches = `.command__empty`. Modal variant: `.command-dialog` inside `.command-dialog__backdrop`.
```html
<div class="command">
  <div class="command__input-wrapper">
    <div class="input-group">
      <div class="input-group__addon"><svg data-lucide="search">…</svg></div>
      <input class="command__input" type="text" placeholder="Search…">
    </div>
  </div>
  <div class="command__list">
    <div class="command__group">
      <div class="command__group-heading">SUGGESTIONS</div>
      <div class="command__item command__item--active">
        <svg data-lucide="calendar">…</svg>
        <span>Calendar</span>
        <span class="command__shortcut">⌘K</span>
      </div>
    </div>
  </div>
</div>
```
