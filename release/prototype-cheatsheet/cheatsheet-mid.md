# Foundation cheatsheet · 档 70%

> 生成物,勿手改;改覆盖范围请编辑 component-registry.md 后跑 refresh。class vocab + 最小 markup;CSS 在壳里。

## Tokens (semantic, use `var(--…)`)

- content/surface/line/primary/status colors · space · text · radius · font-sans · shadow(card/overlay). (Full list in tokens.inline.css, inlined in the shell.)

---

### button — clickable action
Variant: `.btn--primary/--secondary/--ghost/--danger/--ghost-danger/--link`. Size: `.btn--xs/--sm/--md/--lg/--auto`. Icon-only: `.btn--icon/--icon-xs/--icon-sm/--icon-lg` (needs `aria-label`).
```html
<button class="btn btn--primary" type="button"><svg data-lucide="plus">…</svg>…</button>
<button class="btn btn--ghost btn--icon-sm" type="button" aria-label="…"><svg data-lucide="…">…</svg></button>
```

### input — single-line form control
`.input` (`--sm/--md/--lg`, `--filled`). States: native `disabled`/`readonly`/`aria-invalid="true"`.
```html
<input class="input input--sm" type="text" placeholder="…">
```

### textarea — multiline form control
`.textarea`. States: native `disabled`/`readonly`/`aria-invalid="true"`.
```html
<textarea class="textarea" rows="3" placeholder="…"></textarea>
```

### select — choice form control
`.select` (`--sm`). States: native `disabled`/`aria-invalid="true"`.
```html
<select class="select"><option value="">Choose…</option><option value="a">…</option></select>
```

### checkbox — binary toggle / tri-state select-all
`.checkbox` (native `type="checkbox"`; `checked`, `disabled`; `.indeterminate` set in JS).
```html
<label><input type="checkbox" class="checkbox" aria-label="…"> …</label>
```

### field — form-row wrapper (label → control → hint/error)
`.field __required __hint __error`. Invalid: control gets `aria-invalid="true"`, error replaces hint.
```html
<div class="field">
  <label class="label" for="f1">Email<span class="field__required" aria-hidden="true"> *</span></label>
  <input class="input" id="f1" type="email" required placeholder="…">
  <p class="field__hint">…</p>
  <p class="field__error" role="alert">…</p>
</div>
```

### badge — small status/category label
Tone: `.badge--neutral/--success/--warning/--error/--info`. Shape: `.badge--tag` (boxy token). Leading: `.badge__dot` (live status). Never put an icon on a status — that's the dot's job.
```html
<span class="badge badge--success"><span class="badge__dot" aria-hidden="true"></span>Active</span>
<span class="badge badge--tag">SN-8F2A19</span>
<span class="badge badge--neutral">Enterprise</span>
```

### card — bordered content panel
Modifiers: `.card--sm/--md/--lg`. Slots: `__header __title __description __action __content(--flush) __footer`.
```html
<div class="card">
  <div class="card__header">
    <h2 class="card__title">…</h2>
    <p class="card__description">…</p>
    <div class="card__action"><button class="btn btn--primary btn--md" type="button">…</button></div>
  </div>
  <div class="card__content">…</div>
</div>
```

### alert — inline in-flow status message
Tone: `.alert--info/--success/--warning/--error`. Add `.alert--with-icon`. Slots: `__icon __title __description __action`.
```html
<div class="alert alert--warning alert--with-icon" role="alert">
  <svg data-lucide="triangle-alert" class="alert__icon">…</svg>
  <div>
    <div class="alert__title">…</div>
    <p class="alert__description">…</p>
  </div>
  <div class="alert__action"><button class="btn btn--ghost btn--xs" type="button">…</button></div>
</div>
```

### modal — centered dialog over a dimmed scrim
`.modal-overlay` + `.modal` size `--sm/--md/--lg/--xl/--fullscreen`. Slots: `__header __heading __title __description __close __body __footer`.
```html
<div class="modal-overlay">
  <div class="modal modal--md" role="dialog" aria-modal="true">
    <div class="modal__header">
      <div class="modal__heading">
        <h2 class="modal__title">…</h2>
        <p class="modal__description">…</p>
      </div>
      <button class="modal__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
    </div>
    <div class="modal__body">…</div>
    <div class="modal__footer">
      <button class="btn btn--ghost" type="button">Cancel</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
</div>
```

### toast — transient auto-dismiss notification
Modifiers: `.toast--with-icon/--countdown/--loading`. Slots: `__icon`(+`--success/--info/--warning/--error/--loading`) `__content __title __description __close`.
```html
<div class="toast toast--with-icon">
  <span class="toast__icon toast__icon--success"><svg data-lucide="circle-check">…</svg></span>
  <div class="toast__content">
    <p class="toast__title">…</p>
    <p class="toast__description">…</p>
  </div>
  <button class="toast__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
</div>
```

### avatar — user/entity identity chip
Size: `.avatar--sm/--md/--lg/--xl`. Slots: `__image __fallback`. Group: `.avatar-group`.
```html
<div class="avatar avatar--md"><span class="avatar__fallback">AB</span></div>
<div class="avatar avatar--md"><img class="avatar__image" src="…" alt="…"></div>
```

### progress — numeric completion bar (0–100%)
`.progress __track __indicator` (tone `--success/--warning/--error/--info`) `__label __value`. Width via inline `style="width:N%"`.
```html
<div class="progress">
  <div style="display:flex;align-items:center;width:100%;"><span class="progress__label">…</span><span class="progress__value">64%</span></div>
  <div class="progress__track"><div class="progress__indicator" style="width:64%"></div></div>
</div>
```

### separator — hairline divider
`.separator` `.separator--vertical` · `.separator-labeled __label`.
```html
<div class="separator" role="separator" aria-orientation="horizontal"></div>
<div class="separator separator--vertical" role="separator" aria-orientation="vertical"></div>
<div class="separator-labeled"><span class="separator-labeled__label">OR</span></div>
```

### label — caption for a form control
Modifiers: `.label--disabled`. Required marker: append `<span class="field__required" aria-hidden="true"> *</span>`. Associate via `for`/`id`.
```html
<label class="label" for="field-id">Full name<span class="field__required" aria-hidden="true"> *</span></label>
<input class="input" id="field-id" type="text" placeholder="…">
```

### radio-group — mutually exclusive options (exactly one selected)
`.radio` (native `type="radio"`; shared `name` = single-select). States: `checked`, `disabled`, `aria-invalid="true"`. No group class — wrap in a `display:grid`/`flex` container.
```html
<div style="display:grid;gap:var(--space-2);">
  <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
    <input type="radio" name="plan" class="radio" value="free"> Free plan
  </label>
  <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
    <input type="radio" name="plan" class="radio" value="pro" checked> Pro plan
  </label>
</div>
```

### switch — binary on/off toggle for immediate state change
Modifiers: `.switch--sm`. Checked = `aria-checked="true"` + `data-checked`. `disabled` for locked. Always `role="switch"` on a `<button>` + one `.switch__thumb`.
```html
<button class="switch" role="switch" aria-checked="true" data-checked aria-label="Email alerts" type="button">
  <span class="switch__thumb"></span>
</button>
```

### toggle — single press-toggle button with on/off (pressed) state
Modifiers: `.toggle--md/--sm/--auto`, `.toggle--outline`. Pressed = `aria-pressed="true"`; `disabled`. Icon-only → add `aria-label`.
```html
<button class="toggle toggle--md" type="button" aria-pressed="true">
  <svg data-lucide="bold">…</svg>
  Bold
</button>
```

### toggle-group — a set of press-toggle buttons acting as one control
Variants: `.toggle-group--outline/--segmented/--cloud/--plain`. Item sizes: `.toggle-group__item--sm/--md/--auto`. Select mode = container `data-type="single|multiple"` (independent of variant); multi adds `aria-multiselectable="true"`. Pressed item = `aria-pressed="true"`.
```html
<div class="toggle-group toggle-group--outline" role="group" data-type="single">
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="true">List</button>
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="false">Grid</button>
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="false">Kanban</button>
</div>
```

### slider — draggable track-and-thumb numeric input
Modifiers: `.slider--disabled`, `.slider--vertical`. Slots: `.slider__track > .slider__indicator` (fill width %), `.slider__thumb` (positioned via `left`), and a visually-hidden `.range-input` (`type="range"`) that drives it.
```html
<div class="slider">
  <div class="slider__track">
    <div class="slider__indicator" style="width:60%;"></div>
  </div>
  <div class="slider__thumb" style="left:calc(60% - 1.4px);"></div>
  <input class="range-input" type="range" min="0" max="100" value="60" aria-label="Brightness">
</div>
```

### input-otp — segmented one-time-code / verification-code input
Slots: `.input-otp` shell wraps a visually-hidden real `<input>` + one or more `.input-otp__group`s of `.input-otp__slot`; active slot = `.input-otp__slot--active` holding `.input-otp__caret`; groups split by `.input-otp__separator`. States: `aria-invalid="true"` on slots (unified error ring), `aria-disabled="true"` on shell.
```html
<div class="input-otp">
  <input type="tel" maxlength="6" autocomplete="one-time-code" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;">
  <div class="input-otp__group">
    <div class="input-otp__slot input-otp__slot--active"><span class="input-otp__caret"></span></div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
  <span class="input-otp__separator" role="separator">–</span>
  <div class="input-otp__group">
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
</div>
```

### combobox — searchable single-select dropdown
Trigger `.combobox__trigger` (`--sm`; states `aria-disabled`/`aria-invalid`) with `.combobox__value` (`--placeholder`) + `.combobox__chevron`. Popup `.combobox__content` holds `.combobox__search` (`.combobox__input`) and `.combobox__list` of `.combobox__item` (`--highlighted`/`--selected`) each with `.combobox__item-indicator` check. Empty = `.combobox__empty`. Wrap in a `position:relative` element carrying `data-combobox`.
```html
<div class="combobox-wrapper" data-combobox>
  <div class="combobox__trigger" role="combobox" aria-expanded="false" aria-haspopup="listbox" tabindex="0">
    <span class="combobox__value combobox__value--placeholder">Select framework</span>
    <svg class="combobox__chevron" data-lucide="chevron-down">…</svg>
  </div>
  <div class="combobox__content" role="listbox">
    <div class="combobox__search">
      <svg data-lucide="search">…</svg>
      <input class="combobox__input" type="text" placeholder="Filter…">
    </div>
    <div class="combobox__list">
      <div class="combobox__item" role="option" aria-selected="false" data-value="React">
        <span>React</span>
        <span class="combobox__item-indicator" aria-hidden="true"><svg data-lucide="check">…</svg></span>
      </div>
    </div>
  </div>
</div>
```

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

### tooltip — short text hint shown on hover/focus of a trigger
`.tooltip` bubble with side `--top/--bottom/--left/--right` + a `.tooltip__arrow`. Sits inside a `position:relative` wrapper beside the trigger; hidden until shown (JS toggles `.is-visible`). Optional inline `<kbd>` shortcut chip.
```html
<div class="tooltip-wrapper">
  <button class="demo-icon-btn" aria-label="Save">…</button>
  <div class="tooltip tooltip--bottom" role="tooltip">
    Save<kbd>Ctrl+S</kbd>
    <div class="tooltip__arrow"></div>
  </div>
</div>
```

### popover — small floating panel anchored to a trigger
Panel `.popover` with optional `.popover__header` (`.popover__title` + `.popover__description`) then arbitrary content or a stack of `.menu-item` rows (`.menu-item--destructive`). Placement/align live on the wrapper (`--top/--bottom/--left/--right`, `--start/--end`); panel toggles visibility (JS).
```html
<div class="popover-wrapper popover-wrapper--bottom popover-wrapper--start">
  <button class="popover-trigger" type="button" data-popover="pop-1">Info</button>
  <div class="popover-panel" id="pop-1" role="dialog" aria-label="Info">
    <div class="popover">
      <div class="popover__header">
        <h3 class="popover__title">Subscription details</h3>
        <p class="popover__description">Your current plan and billing.</p>
      </div>
      <div class="separator"></div>
      <div class="popover-content">…</div>
    </div>
  </div>
</div>
```

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

### accordion — vertical stack of collapsible disclosure sections
`.accordion` (`data-mode="single"` for exclusive-open) > `.accordion__item` (open = `--open`) each with `.accordion__trigger` (`aria-expanded`; `aria-disabled="true"` to disable) holding `.accordion__label` + `.accordion__arrow` (arrow position = DOM order; omit span for none) and `.accordion__content` panel.
```html
<div class="accordion">
  <div class="accordion__item accordion__item--open">
    <button class="accordion__trigger" aria-expanded="true" aria-controls="acc-1">
      <span class="accordion__label">Account settings</span>
      <span class="accordion__arrow" aria-hidden="true"><svg data-lucide="chevron-down">…</svg></span>
    </button>
    <div class="accordion__content" id="acc-1"><p>…</p></div>
  </div>
</div>
```

### collapsible — single show/hide disclosure (one trigger, one panel)
Headless: consumers add chrome (e.g. `.collapsible--bordered`, or a `.btn` trigger). Modifiers: `.collapsible` `.collapsible--bordered` `.collapsible__trigger` `.collapsible__chevron` `.collapsible__chevron--open` `.collapsible__content` `.collapsible__content--open`. Open state = `data-panel-open` + `aria-expanded="true"` + `--open` on chevron & content.
```html
<div class="collapsible collapsible--bordered">
  <button class="collapsible__trigger" data-panel-open aria-expanded="true" aria-controls="col-1">
    <span>Open section</span>
    <span class="collapsible__chevron collapsible__chevron--open" aria-hidden="true">
      <svg data-lucide="chevron-down">…</svg>
    </span>
  </button>
  <div class="collapsible__content collapsible__content--open" id="col-1">
    <p>…</p>
  </div>
</div>
```

### alert-dialog — forced-action confirm (Cancel / Confirm; no ×, no dismiss)
Modifiers: `.alert-dialog-overlay` (`--open` to show) `.alert-dialog` `.alert-dialog__header` `.alert-dialog__title` `.alert-dialog__description` `.alert-dialog__footer`. Destructive variant swaps confirm to `.btn--danger`. `role="alertdialog"`.
```html
<div class="alert-dialog-overlay alert-dialog-overlay--open" role="presentation">
  <div class="alert-dialog" role="alertdialog" aria-labelledby="ad-title" aria-describedby="ad-desc">
    <div class="alert-dialog__header">
      <h2 class="alert-dialog__title" id="ad-title">Delete account?</h2>
      <p class="alert-dialog__description" id="ad-desc">This action is permanent and irreversible. …</p>
    </div>
    <div class="alert-dialog__footer">
      <button class="btn btn--ghost" type="button" data-dialog-close>Cancel</button>
      <button class="btn btn--danger" type="button" data-dialog-close>Delete</button>
    </div>
  </div>
</div>
```

### sheet — edge-docked side panel sliding in over a dimmed scrim
Dock: `.sheet--right` (default) `.sheet--left` `.sheet--top` `.sheet--bottom`. Overlay `.sheet-overlay` (`--open` to show). Parts: `.sheet__close` `.sheet__header` `.sheet__title` `.sheet__description` `.sheet__body` `.sheet__footer`. Close × is a `.btn--ghost.btn--icon.btn--sm`.
```html
<div class="sheet-overlay sheet-overlay--open" data-sheet-id="right">
  <div class="sheet sheet--right" role="dialog" aria-labelledby="sh-title" aria-describedby="sh-desc">
    <button class="btn btn--ghost btn--icon btn--sm sheet__close" type="button" aria-label="Close">
      <svg data-lucide="x">…</svg>
    </button>
    <div class="sheet__header">
      <h2 class="sheet__title" id="sh-title">Member details</h2>
      <p class="sheet__description" id="sh-desc">View and edit team member information.</p>
    </div>
    <div class="sheet__body">…</div>
    <div class="sheet__footer">
      <button class="btn btn--ghost" type="button">Cancel</button>
      <button class="btn btn--primary" type="button">Save changes</button>
    </div>
  </div>
</div>
```

### spinner — circular indeterminate loading indicator
Sizes: `.spinner--sm` (14px) `.spinner--md` (16px) `.spinner--lg` (20px) `.spinner--xl` (32px). `role="status"` + `aria-label`. In-button: place inside a `disabled` `.btn` beside its label.
```html
<div class="spinner spinner--md" role="status" aria-label="Loading"></div>
```

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

### date-picker — single-date field: a trigger that opens a calendar popover
Trigger: `.date-trigger` (`--sm/--md/--lg`, `--clearable`, `--invalid` or `aria-invalid`) › `.date-trigger__icon` + `.date-trigger__value` (`--placeholder` when empty). Clear button `.date-trigger__clear` is a sibling (not nested). Popover wraps a bare `.calendar` (see calendar skeleton) in a `.popover`.
```html
<div class="date-picker-wrapper">
  <div class="date-picker__clear-wrapper">
    <button class="date-trigger" type="button" aria-label="Pick a date">
      <svg class="date-trigger__icon" data-lucide="calendar">…</svg>
      <span class="date-trigger__value date-trigger__value--placeholder">Pick a date</span>
    </button>
    <button class="date-trigger__clear" type="button" tabindex="-1" aria-label="Clear"><svg data-lucide="x">…</svg></button>
  </div>
  <div class="date-picker__popover">
    <div class="popover" style="width:auto;padding:0;">
      <div class="calendar"><!-- calendar header + grid + optional footer --></div>
    </div>
  </div>
</div>
```

### date-range-picker — a from→to date range field
Same trigger as date-picker (`.date-trigger` + `.date-trigger__icon` + `.date-trigger__value`, sibling `.date-trigger__clear`); value shows `from – to`. Popover = a `.date-presets` rail (`.date-presets__item` buttons) beside a two-month range calendar (two `.calendar`, using range-* day states). Disabled via `disabled` on the trigger.
```html
<div class="date-picker__clear-wrapper">
  <button class="date-trigger" type="button" aria-label="Pick a date range" aria-haspopup="dialog">
    <span class="date-trigger__icon" aria-hidden="true"><svg data-lucide="calendar">…</svg></span>
    <span class="date-trigger__value date-trigger__value--placeholder">Pick a range</span>
  </button>
  <button class="date-trigger__clear" type="button" aria-label="Clear" tabindex="-1"><svg data-lucide="x">…</svg></button>
</div>
<div class="popover" role="dialog" aria-label="Select date range" style="padding:0;width:auto;">
  <div style="display:flex;">
    <div class="date-presets">
      <button class="date-presets__item" data-preset="today" type="button">Today</button>
      <button class="date-presets__item" data-preset="last7" type="button">Last 7 days</button>
      …
    </div>
    <div class="date-range-calendars">
      <div class="calendar"><!-- left month --></div>
      <div class="calendar"><!-- right month --></div>
    </div>
  </div>
</div>
```

### calendar — base month grid: weekday header over a 6×7 day matrix with month nav
Root `.calendar` (bare — wrap in a `.popover` for card chrome). Header: `.calendar__header` › `.calendar__nav-btn` + `.calendar__caption` (or `.calendar__dropdowns` › `.calendar__dropdown` for month/year selects). Grid: `.calendar__grid` of `.calendar__weekday` cells + `.calendar__day` buttons. Day states: `--today --selected --outside --disabled --hidden --focused --range-start --range-middle --range-end`. Optional `.calendar__footer` with `.calendar__link`. Range = two `.calendar` side by side.
```html
<div class="calendar">
  <div class="calendar__header">
    <button class="calendar__nav-btn" type="button" aria-label="Previous month"><svg data-lucide="chevron-left">…</svg></button>
    <div class="calendar__caption">June 2026</div>
    <button class="calendar__nav-btn" type="button" aria-label="Next month"><svg data-lucide="chevron-right">…</svg></button>
  </div>
  <div class="calendar__grid">
    <div class="calendar__weekday">Su</div>… <!-- 7 weekday cells -->
    <button class="calendar__day calendar__day--outside" type="button" data-outside>31</button>
    <button class="calendar__day calendar__day--today" type="button" data-day="1">1</button>
    <button class="calendar__day calendar__day--selected" type="button" data-day="15">15</button>
    … <!-- fill to a multiple of 7 -->
  </div>
</div>
```

### input-group — single-border container fusing an input with leading/trailing addons
Modifiers: `.input-group--block` (stacks a textarea + block addon), `.input-group--invalid/--disabled`. Addons: `.input-group__addon--inline-start/--inline-end/--block-start/--block-end`; the control gets `.input-group__control`; text affix = `.input-group__text`. Addons hold icons, text, or a `.btn--ghost`.
```html
<div class="input-group" role="group">
  <div class="input-group__addon input-group__addon--inline-start">
    <svg data-lucide="search">…</svg>
  </div>
  <input class="input input-group__control" type="search" placeholder="Search…">
  <div class="input-group__addon input-group__addon--inline-end">
    <span class="input-group__text">USD</span>
  </div>
</div>
```

### page-header — top-level page band (no back); title + actions
Modifiers: `.page-header--sticky`. Slots: `__bar __titles __heading __title __description __actions`.
```html
<div class="page-header">
  <div class="page-header__bar">
    <div class="page-header__titles">
      <div class="page-header__heading">
        <h1 class="page-header__title">…</h1>
        <span class="badge badge--success"><span class="badge__dot"></span>…</span>
      </div>
      <p class="page-header__description">…</p>
    </div>
    <div class="page-header__actions">
      <button class="btn btn--secondary" type="button">…</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
</div>
```

### detail-header — page reached INTO (has back); identity + meta + actions + tabs
Modifiers: `.detail-header--sticky`. Slots: `__bar __back __logo __main __title __name __chips __meta __actions __tabs`.
```html
<div class="detail-header">
  <div class="detail-header__bar">
    <button class="btn btn--ghost btn--icon btn--sm detail-header__back" type="button" aria-label="Back"><svg data-lucide="chevron-left">…</svg></button>
    <span class="detail-header__logo">…</span>
    <div class="detail-header__main">
      <div class="detail-header__title">
        <span class="detail-header__name">…</span>
        <span class="badge badge--success"><span class="badge__dot"></span>…</span>
        <span class="detail-header__chips"><span class="badge badge--neutral">…</span></span>
      </div>
      <div class="detail-header__meta">
        <span style="font-variant-numeric:tabular-nums;">#…</span>
        <span>…</span>
      </div>
    </div>
    <div class="detail-header__actions">
      <button class="btn btn--secondary" type="button">Edit</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
  <div class="detail-header__tabs">
    <div class="tabs__list tabs__list--line" role="tablist">
      <button class="tabs__trigger tabs__trigger--active" type="button" role="tab" aria-selected="true">…</button>
      <button class="tabs__trigger" type="button" role="tab" aria-selected="false">…</button>
    </div>
  </div>
</div>
```

### list-filter — list-page filter bar: search + quick filters + Search + applied chips
Classes: `.condition-band __toolbar __spacer` · `.search-input __icon` · `.applied-filters __label` · `.filter-chip __remove`.
```html
<div class="condition-band">
  <div class="condition-band__toolbar">
    <div class="search-input">
      <span class="search-input__icon"><svg data-lucide="search">…</svg></span>
      <input class="input" type="search" placeholder="…" aria-label="Search">
    </div>
    <select class="select" aria-label="Status filter"><option value="">All statuses</option><option>…</option></select>
    <button class="btn btn--secondary"><svg data-lucide="search">…</svg>Search</button>
  </div>
  <div class="applied-filters">
    <span class="applied-filters__label">Filters:</span>
    <span class="filter-chip">Status: Active <button class="filter-chip__remove" aria-label="Remove"><svg data-lucide="x">…</svg></button></span>
    <button class="btn btn--ghost btn--xs">clear all</button>
  </div>
</div>
```
Wrap the magnifier in `.search-input__icon` (never a bare svg in `.search-input`). Search button uses `search` glyph, not funnel. Advanced trigger = `.btn--secondary` + `data-lucide="funnel"`, pushed right by `.condition-band__spacer`.

### summary-bar — strip above the table: count + list actions (inside `.table-frame--flush`, above `.table-scroll`)
Modifiers: `.summary-bar--sticky`. Slots: `__count __actions`.
```html
<div class="table-frame table-frame--flush">
  <div class="summary-bar">
    <div class="summary-bar__count"><strong>1,248</strong> results</div>
    <div class="summary-bar__actions"><button class="btn btn--secondary btn--sm">Export</button></div>
  </div>
  <div class="table-scroll"><!-- data-table --></div>
</div>
```

### data-table — columnar records: sort, select, row actions
Modifiers: `.data-table--sticky-head --sticky-col --striped --compact --spacious`. Frame: `.table-frame(--flush) .table-scroll`. Cells: `.col-select .th-sort(__icon--active/--idle) .cell-2line(__main/__sub) .cell-num .cell-right .cell-tags .cell-empty .cell-chevron .row-actions(__inner)`. Rows: `.is-clickable`, `tr[aria-selected]`, `tr[data-disabled]`.
```html
<div class="table-frame">
  <div class="table-scroll">
    <table class="data-table data-table--sticky-head data-table--striped">
      <thead>
        <tr>
          <th class="col-select" scope="col"><label><input type="checkbox" class="checkbox" aria-label="Select all"></label></th>
          <th scope="col" aria-sort="ascending"><button class="th-sort" aria-label="Sort by name">Name<svg data-lucide="chevron-up" class="th-sort__icon--active">…</svg></button></th>
          <th scope="col">Status</th>
          <th scope="col" class="cell-right">Amount</th>
          <th scope="col" class="cell-right" aria-hidden="true"></th>
        </tr>
      </thead>
      <tbody>
        <tr aria-selected="true">
          <td class="col-select"><label><input type="checkbox" class="checkbox" checked aria-label="Select row"></label></td>
          <td><div class="cell-2line"><span class="cell-2line__main">…</span><span class="cell-2line__sub">…</span></div></td>
          <td><div class="cell-tags"><span class="badge badge--success"><span class="badge__dot" aria-hidden="true"></span>Active</span></div></td>
          <td class="cell-num cell-right">$…</td>
          <td class="row-actions"><div class="row-actions__inner">
            <button class="btn btn--ghost btn--icon-sm" type="button" aria-label="Edit"><svg data-lucide="square-pen">…</svg></button>
          </div></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
Navigation rows: `.is-clickable` on `<tr>`, no `.col-select`, and end `.row-actions__inner` with passive `<span class="cell-chevron"><svg data-lucide="chevron-right">…</svg></span>`. Empty cell: `<span class="cell-empty">&mdash;</span>`. Idle sortable header: `.th-sort__icon--idle` + `data-lucide="chevrons-up-down"`.

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

### kv-grid — detail attributes as label → value pairs (a `<dl>`)
`.kv-grid __row` (`<dt>` + `<dd>`; add `.kv-mono` on `<dd>` for IDs/amounts/dates). Empty value → em-dash in `content-tertiary`, never blank.
```html
<dl class="kv-grid">
  <div class="kv-grid__row"><dt>ID</dt><dd class="kv-mono">…</dd></div>
  <div class="kv-grid__row"><dt>Status</dt><dd>…</dd></div>
  <div class="kv-grid__row"><dt>Description</dt><dd style="color:var(--color-content-tertiary);">—</dd></div>
</dl>
```

### empty-state — what a collection shows when empty (in place of table rows)
Slots: `.empty-state __icon __title __description __action`. Omit `__action` when a header already owns the verb. Cases: cold start (create) · no results (clear filters) · error (Retry).
```html
<div class="empty-state">
  <div class="empty-state__icon"><svg data-lucide="search">…</svg></div>
  <div class="empty-state__title">…</div>
  <div class="empty-state__description">…</div>
  <div class="empty-state__action"><button class="btn btn--secondary">…</button></div>
</div>
```

### skeleton — loading placeholder (preserves layout)
Shapes: `.skeleton--line/--text/--title/--block/--circle`. Table scaffold: `.skeleton-row` (holds multiple `.skeleton--line`).
```html
<div class="skeleton skeleton--text" style="width:120px;"></div>
<div class="skeleton skeleton--circle" style="width:var(--space-10);"></div>
<div class="skeleton-row">
  <div class="skeleton skeleton--line" style="width:20%;"></div>
  <div class="skeleton skeleton--line" style="width:35%;"></div>
</div>
```

### action-footer — full-bleed bottom commit band (right-aligned action cluster)
Slots: `.action-footer > .action-footer__bar`. Lives as last child of `main.app-frame__main`, after `.page-body`. Arrangements: create-form (ghost Cancel + primary) · create-wizard (ghost Back + primary Continue).
```html
<footer class="action-footer">
  <div class="action-footer__bar">
    <button class="btn btn--ghost" type="button">
      <svg data-lucide="x">…</svg>
      Cancel
    </button>
    <button class="btn btn--primary" type="button">Create customer</button>
  </div>
</footer>
```
Wizard variant: replace with ghost Back (`<svg data-lucide="chevron-left">` + "Back") and primary Continue ("Continue" + `<svg data-lucide="chevron-right">`).

### list-row — hairline-separated row: leading media · main · trailing control
Container: `.list-rows` (usually inside `.card > .card__content.card__content--flush`). Each `.list-row` (modifier `.list-row--disabled`) = leading `.list-row__icon` (or an `.avatar`) · `.list-row__main` (`.list-row__title` with `.list-row__name` + optional inline `.badge`s, optional `.list-row__sub`) · `.list-row__trailing` (a `.switch`, or a `.btn` action cluster).
```html
<div class="card">
  <div class="card__content card__content--flush">
    <div class="list-rows">
      <div class="list-row">
        <div class="list-row__icon" aria-hidden="true"><svg data-lucide="lock">…</svg></div>
        <div class="list-row__main">
          <div class="list-row__title"><span class="list-row__name">Two-factor authentication</span></div>
          <div class="list-row__sub">Adds a one-time code at sign-in</div>
        </div>
        <div class="list-row__trailing">
          <button class="switch" role="switch" aria-checked="true" aria-label="Two-factor authentication"><span class="switch__thumb"></span></button>
        </div>
      </div>
      <div class="list-row">
        <div class="avatar avatar--md" aria-hidden="true"><span class="avatar__fallback">MO</span></div>
        <div class="list-row__main">
          <div class="list-row__title"><span class="list-row__name">m.ortiz</span><span class="badge badge--neutral">Owner</span></div>
          <div class="list-row__sub">m.ortiz@acme.co &middot; last active 2h ago</div>
        </div>
        <div class="list-row__trailing">
          <button class="btn btn--ghost btn--icon-sm" type="button" aria-label="More actions"><svg data-lucide="ellipsis">…</svg></button>
        </div>
      </div>
    </div>
  </div>
</div>
```
Disabled row: `.list-row--disabled` + `aria-disabled="true"` on the trailing switch/button.

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

### stat-card — KPI tile: label, big value, inline trend delta
Grid wrapper: `.stat-grid .stat-grid--cols-{2|3|4}` (4-up collapses to 2-up on mobile). Card modifiers: `.stat-card--interactive` (pointer+hover, add `tabindex role=button aria-pressed`) · `.stat-card--selected`. Slots: `.stat-card__head (__label __icon) .stat-card__value (--success/--warning/--error/--info) .stat-card__delta (--up/--down/--flat) .stat-card__description`.
```html
<div class="stat-grid stat-grid--cols-4">
  <div class="stat-card">
    <div class="stat-card__head">
      <span class="stat-card__label">Orders</span>
      <span class="stat-card__icon"><svg data-lucide="activity">…</svg></span>
    </div>
    <div class="stat-card__value stat-card__value--info">
      1,892
      <span class="stat-card__delta stat-card__delta--up">▲ 7%</span>
    </div>
    <div class="stat-card__description">Updated 2 min ago</div>
  </div>
  …
</div>
```
Minimal: just `__head > __label` + `__value` (no icon/delta/description). Interactive: `<div class="stat-card stat-card--interactive" tabindex="0" role="button" aria-pressed="false">`.

### status-card — a card carrying an object's health: media + badge + description + footer clusters
A status-card **is** a `.card` (inherits `.card--sm/--md/--lg`, `.card--interactive`). Structure: `.card__content > .stack.stack--3 > .status-card__head` (`.status-card__media` object-tile + `.status-card__heading` title+badge + `.status-card__trailing` chevron) `+ .status-card__description`; then `.card__footer` with `.status-card__footer-start` / `.status-card__footer-end` clusters.
```html
<div class="card status-card">
  <div class="card__content">
    <div class="stack stack--3">
      <div class="status-card__head">
        <span class="status-card__media">
          <span class="object-tile object-tile--md object-tile--neutral" aria-hidden="true">
            <span class="object-tile__icon"><svg data-lucide="database">…</svg></span>
          </span>
        </span>
        <div class="status-card__heading">
          <span class="card__title">Storage</span>
          <span class="badge badge--error"><span class="badge__dot" aria-hidden="true"></span>2 critical</span>
        </div>
        <a class="status-card__trailing" href="#" aria-label="View details"><svg data-lucide="chevron-right">…</svg></a>
      </div>
      <p class="status-card__description">…</p>
    </div>
  </div>
  <div class="card__footer">
    <div class="status-card__footer-start">
      <button class="switch" role="switch" aria-checked="true" aria-label="Monitoring enabled"><span class="switch__thumb"></span></button>
      <span>Enabled</span>
    </div>
    <div class="status-card__footer-end">
      <button class="btn btn--ghost btn--icon" aria-label="3 notifications"><svg data-lucide="bell">…</svg><span>3</span></button>
    </div>
  </div>
</div>
```
Interactive (whole card navigates): `.card--interactive` on root + wrap title in `<a class="status-card__link" href="#">`. Footer actions: `__footer-end` can hold `.btn--secondary` + `.btn--primary` instead of an icon button; drop `__footer-start` if no left cluster.

### step-indicator — vertical wizard rail / status pipeline (completed · active · upcoming)
Wrapper: `.rail-group` (optional `.rail-heading__title` / `.rail-heading__meta`) > `.step-indicator-card` > `ol.step-indicator` (add `data-interactive` for a navigable wizard; omit for a read-only pipeline). Each `li.step .step--{completed|active|upcoming}[data-state]` holds `.step__body (.step__dot + .step__text(.step__caption, .step__title))` + `.step__connector` (omit on last step). Completed dot = check svg (or persistent custom icon); active/upcoming dot = step number; active carries `aria-current="step"`.
```html
<div class="rail-group">
  <div class="rail-heading__title">Company onboarding</div>
  <div class="step-indicator-card">
    <ol class="step-indicator" data-interactive>
      <li class="step step--completed" data-state="completed" aria-label="Step 1 completed">
        <div class="step__body">
          <div class="step__dot"><svg data-lucide="check">…</svg></div>
          <div class="step__text">
            <span class="step__caption">Step 1</span>
            <span class="step__title">Company details</span>
          </div>
        </div>
        <div class="step__connector" aria-hidden="true"></div>
      </li>
      <li class="step step--active" data-state="active" aria-current="step">
        <div class="step__body">
          <div class="step__dot">3</div>
          <div class="step__text">
            <span class="step__caption">Step 3</span>
            <span class="step__title">Team members</span>
          </div>
        </div>
        <div class="step__connector" aria-hidden="true"></div>
      </li>
      <li class="step step--upcoming" data-state="upcoming">
        <div class="step__body">
          <div class="step__dot">4</div>
          <div class="step__text"><span class="step__caption">Step 4</span><span class="step__title">Billing plan</span></div>
        </div>
      </li>
    </ol>
  </div>
</div>
```
Status pipeline: same markup without `data-interactive`; captions carry dates instead of "Step N".

### stepper — numeric −/+ spinbutton (input-group composition)
Composition: `.input-group.stepper[role="group"]` shell owns border/focus ring; `.stepper__button` sizes the −/+ buttons; `.stepper__input` is the value control. Modifiers on the shell: `.input-group--disabled` `.input-group--invalid`. Addons: `.input-group__addon--inline-start / --inline-end`.
```html
<div class="input-group stepper" role="group" aria-label="Quantity">
  <div class="input-group__addon--inline-start">
    <button class="stepper__button btn btn--ghost btn--icon btn--xs" type="button" aria-label="Decrement" tabindex="-1">
      <svg data-lucide="minus">…</svg>
    </button>
  </div>
  <input class="input-group__control stepper__input" type="text" inputmode="numeric" role="spinbutton" aria-valuenow="5" aria-valuemin="0" aria-valuemax="10" aria-label="Quantity" value="5">
  <div class="input-group__addon--inline-end">
    <button class="stepper__button btn btn--ghost btn--icon btn--xs" type="button" aria-label="Increment" tabindex="-1">
      <svg data-lucide="plus">…</svg>
    </button>
  </div>
</div>
```
Disabled: `.input-group--disabled` on shell + `disabled` on both buttons and input. Invalid: `.input-group--invalid` on shell + `aria-invalid="true"` on input. Boundary buttons dim via `aria-disabled`.

### timeline — vertical event stream: marker + rail + content per entry
`ul.timeline > li.timeline__item` (last entry adds `.timeline__item--last`). Each item = `.timeline__marker .timeline__marker--{dot|icon} .timeline__marker--{neutral|primary|success|warning|error|info}` (holds `.timeline__marker-node` [dot: `.timeline__marker-dot`; icon: an svg] + `.timeline__rail`) then `.timeline__content` (`.timeline__header` with `.timeline__title` + `time.timeline__time`, then `.timeline__description`, then `.timeline__actor`). Usually nested inside a `.card`.
```html
<ul class="timeline">
  <li class="timeline__item">
    <div class="timeline__marker timeline__marker--dot timeline__marker--primary">
      <div class="timeline__marker-node"><div class="timeline__marker-dot"></div></div>
      <div class="timeline__rail"></div>
    </div>
    <div class="timeline__content">
      <div class="timeline__header">
        <span class="timeline__title">Production deployment completed</span>
        <time class="timeline__time" datetime="2026-06-28T14:30:00Z">2 hours ago</time>
      </div>
      <p class="timeline__description">v3.8.2 rolled out to all regions …</p>
      <span class="timeline__actor">deploy-bot</span>
    </div>
  </li>
  <li class="timeline__item timeline__item--last">
    <div class="timeline__marker timeline__marker--icon timeline__marker--success">
      <div class="timeline__marker-node"><svg data-lucide="circle-check">…</svg></div>
      <div class="timeline__rail"></div>
    </div>
    <div class="timeline__content">
      <div class="timeline__header"><span class="timeline__title">…</span><time class="timeline__time" datetime="…">Yesterday</time></div>
      <p class="timeline__description">…</p>
      <span class="timeline__actor">compliance-bot</span>
    </div>
  </li>
</ul>
```

### option-card — selectable card (radio/checkbox) with icon + title + description
Grid: `.option-grid` (add `role="radiogroup" aria-label` for single-select). Each `label.option-card` (modifiers `.option-card--radio` for radio dot; default = checkbox; `.option-card--selected` for the chosen state) = `input.option-card__input[type=radio|checkbox]` + `span.option-card__check` (checkbox holds a check svg; radio leaves it empty) + optional `span.option-card__icon` (svg tile) + `span.option-card__body` (`.option-card__title` + `.option-card__desc`).
```html
<div class="option-grid" role="radiogroup" aria-label="Account type">
  <label class="option-card option-card--radio option-card--selected">
    <input class="option-card__input" type="radio" name="account-type" value="isv" checked>
    <span class="option-card__check"></span>
    <span class="option-card__icon"><svg data-lucide="blocks">…</svg></span>
    <span class="option-card__body">
      <span class="option-card__title">ISV Partner</span>
      <span class="option-card__desc">Builds and lists apps on the marketplace…</span>
    </span>
  </label>
  …
</div>
```
Checkbox (multi-select): drop `--radio`, use `type="checkbox"`, and put a check svg inside `.option-card__check`. Icon is optional. Disabled: native `disabled` on the input.

### toggles — inline control-with-label wrappers (checkbox / radio / switch)
Three flex wrappers, each pairing a primitive with a clickable `.label`. Disabled via `data-disabled="true"` on the wrapper.
```html
<!-- .toggle-checkbox — multi-select / boolean opt-in -->
<label class="toggle-checkbox">
  <input type="checkbox" class="checkbox" checked />
  <span class="label">Enable email notifications</span>
</label>

<!-- .toggle-radio — single-select; group inside fieldset/legend + .toggle-radio-group -->
<fieldset>
  <legend>Shipping method</legend>
  <div class="toggle-radio-group">
    <label class="toggle-radio">
      <input type="radio" class="radio" name="shipping" value="standard" checked />
      <span class="label">Standard (5–7 business days)</span>
    </label>
    …
  </div>
</fieldset>

<!-- .toggle-switch — binary on/off -->
<label class="toggle-switch">
  <span class="switch" role="switch" aria-checked="true" data-checked tabindex="0"><span class="switch__thumb"></span></span>
  <span class="label">Wi-Fi</span>
</label>
```
Disabled example: `<label class="toggle-switch" data-disabled="true">` with `aria-disabled="true" tabindex="-1"` on the switch (and `disabled` on native checkbox/radio inputs).
