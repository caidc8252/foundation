### context-menu — right-click contextual action menu
Panel `.context-menu__content` (positioned at cursor) holds `.context-menu__item` (icon + label + trailing `.context-menu__shortcut`; `data-close`/`data-disabled`), `.context-menu__separator`, `.context-menu__label` section caption, `.context-menu__item--checkbox`/`--radio` (`aria-checked` + trailing `.context-menu__indicator`), `--destructive`, `--inset`, and a `.context-menu__sub-trigger` opening a nested `.context-menu__content`.
```html
<div class="context-menu__content" style="display:none;position:fixed;z-index:1000;">
  <div class="context-menu__item" data-close>
    <svg data-lucide="arrow-left">…</svg> Back
    <span class="context-menu__shortcut">⌘[</span>
  </div>
  <div class="context-menu__separator"></div>
  <div class="context-menu__label">PEOPLE</div>
  <div class="context-menu__item--radio" data-radio="people" aria-checked="true">
    <svg data-lucide="user">…</svg> Pedro Duarte
    <span class="context-menu__indicator"><span class="demo-radio-dot"></span></span>
  </div>
</div>
```
