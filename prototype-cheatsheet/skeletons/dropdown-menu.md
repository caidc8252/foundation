### dropdown-menu — triggered overlay of grouped actions
Panel `.dropdown-menu` holds `.dropdown-menu__label` (section caption), `.dropdown-menu__item` (`--destructive`, trailing `.dropdown-menu__shortcut`), `.dropdown-menu__separator`, `.dropdown-menu__checkbox-item`/`.dropdown-menu__radio-item` (`aria-checked`, `.dropdown-menu__item-indicator`), and a submenu (`.dropdown-menu__sub-trigger` + nested `.dropdown-menu__sub-content`). Wrap in a `position:relative` element; toggle `hidden`.
```html
<div class="demo-dropdown-wrapper">
  <button class="btn btn--ghost btn--sm" type="button">
    <svg data-lucide="menu">…</svg> Open menu
  </button>
  <div class="dropdown-menu" hidden style="width:260px;">
    <div class="dropdown-menu__label">ACCOUNT</div>
    <button class="dropdown-menu__item" type="button"><svg data-lucide="user">…</svg> Profile</button>
    <button class="dropdown-menu__item" type="button"><svg data-lucide="settings">…</svg> Settings<span class="dropdown-menu__shortcut">⌘,</span></button>
    <div class="dropdown-menu__separator" role="separator"></div>
    <button class="dropdown-menu__checkbox-item" type="button" aria-checked="true">
      <span class="dropdown-menu__item-indicator"><svg data-lucide="check">…</svg></span> Enable notifications
    </button>
    <div class="dropdown-menu__separator" role="separator"></div>
    <button class="dropdown-menu__item dropdown-menu__item--destructive" type="button"><svg data-lucide="trash-2">…</svg> Delete account</button>
  </div>
</div>
```
