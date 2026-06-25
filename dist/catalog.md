# foundation · catalog — GENERATED, do not edit

> Rebuilt from the sources by `pnpm build` (machine mirror: `catalog.json`).
> This is the **closed set** a same-brand artifact may use. Anything not listed
> here is a contract gap → propose it via `governance/token-change.md` (tokens)
> or a primitive/composite contract PR. **Do not** hardcode hex/px or hand-roll a
> component that isn't here.
>
> Check an artifact against this set: `node scripts/check-artifact.mjs <file.html>`

## L1 · Tokens (175)

Inline `dist/tokens.inline.css`, then reference as `var(--name)`. Values live in
that file / `tokens.json`; these are the legal **names**, grouped by prefix:

- **breakpoint** (6) — `--breakpoint-2xl` `--breakpoint-lg` `--breakpoint-md` `--breakpoint-sm` `--breakpoint-xl` `--breakpoint-xs`
- **color** (113) — `--color-accent-100` `--color-accent-200` `--color-accent-50` `--color-accent-500` `--color-accent-600` `--color-accent-700` `--color-avatar-bg` `--color-avatar-fg` `--color-brand-mono` `--color-brand-mono-soft` `--color-brand-mono-strong` `--color-cat-1` `--color-cat-1-fg` `--color-cat-2` `--color-cat-2-fg` `--color-cat-3` `--color-cat-3-fg` `--color-cat-4` `--color-cat-4-fg` `--color-cat-5` `--color-cat-5-fg` `--color-cat-6` `--color-cat-6-fg` `--color-cat-line` `--color-chart-1` `--color-chart-2` `--color-chart-3` `--color-chart-4` `--color-chart-5` `--color-chart-6` `--color-chart-7` `--color-chart-8` `--color-chart-axis` `--color-chart-dim` `--color-chart-div-mid` `--color-chart-div-neg` `--color-chart-div-pos` `--color-chart-grid` `--color-chart-label` `--color-chart-seq-100` `--color-chart-seq-200` `--color-chart-seq-300` `--color-chart-seq-400` `--color-chart-seq-500` `--color-chart-seq-600` `--color-chart-seq-700` `--color-chart-tooltip-bg` `--color-chart-tooltip-fg` `--color-chart-zoom-fill` `--color-chart-zoom-stroke` `--color-content-disabled` `--color-content-inverse` `--color-content-on-primary` `--color-content-primary` `--color-content-secondary` `--color-content-tertiary` `--color-error` `--color-error-50` `--color-error-500` `--color-error-700` `--color-error-active` `--color-error-bg` `--color-error-strong` `--color-info` `--color-info-50` `--color-info-500` `--color-info-700` `--color-info-bg` `--color-info-strong` `--color-line-default` `--color-line-focus` `--color-line-strong` `--color-line-subtle` `--color-primary-100` `--color-primary-200` `--color-primary-300` `--color-primary-400` `--color-primary-50` `--color-primary-500` `--color-primary-600` `--color-primary-700` `--color-primary-800` `--color-primary-900` `--color-secondary-100` `--color-secondary-50` `--color-secondary-500` `--color-secondary-700` `--color-secondary-900` `--color-state-selected` `--color-success` `--color-success-50` `--color-success-500` `--color-success-700` `--color-success-bg` `--color-success-strong` `--color-surface-1` `--color-surface-2` `--color-surface-3` `--color-surface-active` `--color-surface-hover` `--color-surface-overlay` `--color-teal-50` `--color-teal-500` `--color-teal-700` `--color-violet-50` `--color-violet-500` `--color-violet-700` `--color-warning` `--color-warning-50` `--color-warning-500` `--color-warning-700` `--color-warning-bg` `--color-warning-strong`
- **container** (1) — `--container-content`
- **duration** (4) — `--duration-fast` `--duration-instant` `--duration-normal` `--duration-slow`
- **ease** (2) — `--ease-emphasized` `--ease-standard`
- **font** (4) — `--font-family-mono` `--font-family-sans` `--font-mono` `--font-sans`
- **radius** (6) — `--radius-2xl` `--radius-full` `--radius-lg` `--radius-md` `--radius-sm` `--radius-xl`
- **shadow** (9) — `--shadow-1` `--shadow-2` `--shadow-3` `--shadow-4` `--shadow-5` `--shadow-cta` `--shadow-focus` `--shadow-row-selected` `--shadow-sticky-col`
- **space** (12) — `--space-0` `--space-1` `--space-10` `--space-12` `--space-16` `--space-2` `--space-20` `--space-3` `--space-4` `--space-5` `--space-6` `--space-8`
- **spacing** (8) — `--spacing-control-lg` `--spacing-control-md` `--spacing-control-sm` `--spacing-control-xs` `--spacing-cx-lg` `--spacing-cx-md` `--spacing-cx-sm` `--spacing-stat-card`
- **text** (10) — `--text-2xl` `--text-2xs` `--text-3xl` `--text-4xl` `--text-5xl` `--text-lg` `--text-md` `--text-sm` `--text-xl` `--text-xs`

## L2 · Primitives (53) — atoms

Classes in `primitives/primitives.css` (on top of the inlined tokens).

| component | use | classes (main; full set in `catalog.json`) | links |
|---|---|---|---|
| `accordion` | A vertical stack of collapsible disclosure sections. | `.accordion` `.accordion__item` `.accordion__trigger` `.accordion__arrow` `.accordion__content` `.accordion__item--open` | [contract](../primitives/accordion.md) |
| `alert-dialog` | A forced-action confirm. | `.alert-dialog-overlay` `.alert-dialog` `.alert-dialog__header` `.alert-dialog__title` `.alert-dialog__description` `.alert-dialog__footer` `.btn` | [contract](../primitives/alert-dialog.md) |
| `alert` | An inline, in-flow status message box. | `.alert` `.alert__icon` `.alert__title` `.alert__description` `.alert__action` `.alert--with-icon` `.btn` | [contract](../primitives/alert.md) |
| `aspect-ratio` | A layout box that locks its content to a fixed width:height ratio (16/9 video thumbnails, 1/1 avatars-in-cards, 4/3 media tiles). | `--ratio` | [contract](../primitives/aspect-ratio.md) |
| `avatar` | A user/entity identity chip: a circular image that falls back to initials when the image is missing or fails to load. | `.avatar` `.avatar-group` | [contract](../primitives/avatar.md) |
| `badge` | A small inline label for status or category. | `.badge` | [contract](../primitives/badge.md) |
| `breadcrumb` | A horizontal navigation trail showing the current page's location in the hierarchy. | `.breadcrumb__list` `.breadcrumb__item` `.breadcrumb__link` `.breadcrumb__page` `.breadcrumb__separator` `.breadcrumb__ellipsis` | [contract](../primitives/breadcrumb.md) |
| `button` | A clickable action. | `.btn` | [contract](../primitives/button.md) |
| `calendar` | The base month grid — a weekday header over a 6×7 day matrix with month navigation. | `.calendar` `.calendar__header` `.calendar__nav-btn` `.calendar__caption` `.calendar__grid` `.calendar__weekday` `.calendar__day` `.calendar__footer` `.calendar__link` `.calendar__day--today` `--selected` `--range-start` `--range-end` `--range-middle` `--outside` `--disabled` `--focused` `--cell-size` `--cell-radius` `.popover` | [contract](../primitives/calendar.md) |
| `card` | A bordered content container. | `.card` `.card__header` `.card__content` `.card__footer` | [contract](../primitives/card.md) |
| `carousel` | A horizontally (or vertically) scrollable track of equal-width slides, with optional prev/next buttons and dot indicators. | `.carousel` `.carousel__viewport` `.carousel__track` `.carousel__item` `.carousel__prev` `.carousel__next` `.carousel__nav` `.carousel__dots` `.carousel__dot` `.carousel__dot--active` `.carousel--vertical` `--active` | [contract](../primitives/carousel.md) |
| `checkbox` | A binary on/off toggle for a single boolean, or a tri-state "select all" header. | — | [contract](../primitives/checkbox.md) |
| `collapsible` | A single show/hide disclosure: one trigger reveals or hides one panel of content. | `.collapsible` `.collapsible__trigger` `.btn` `.collapsible__chevron` `.collapsible__content` `.collapsible__content--open` | [contract](../primitives/collapsible.md) |
| `color-tile` | A square identity tile that shows a full label on a background tinted deterministically from its content — e.g. | `--cat-N` | [contract](../primitives/color-tile.md) |
| `combobox` | A searchable single- or multi-select dropdown. | `.combobox` `.combobox__item--highlighted` `.combobox__item--selected` | [contract](../primitives/combobox.md) |
| `command` | A keyboard-driven command palette: a search input over a filtered, grouped list of runnable items. | `.command` `.command__input` `.command__list` `.command__empty` `.command__group` `.command__group-heading` `.command__separator` `.command__item` `.command__item--active` `.command__shortcut` `.command-dialog__backdrop` `.command-dialog` `.input-group` `--active` | [contract](../primitives/command.md) |
| `context-menu` | A right-click contextual action menu. | `.context-menu__content` `.context-menu__item` `--destructive` `--inset` `.context-menu__item--checkbox` `--radio` `.context-menu__sub-trigger` `.context-menu__label` `.context-menu__separator` `.context-menu__shortcut` | [contract](../primitives/context-menu.md) |
| `date-picker` | A single-date field. | `.date-trigger` `.date-trigger--sm` `--lg` `.date-trigger--invalid` `.date-trigger__icon` `.date-trigger__clear` `.popover` | [contract](../primitives/date-picker.md) |
| `date-range-picker` | A from→to date range field. | `.date-trigger` `--invalid` `.popover` `.date-presets` `.date-presets__item` | [contract](../primitives/date-range-picker.md) |
| `date-time-picker` | A single date + time field. | `.date-trigger` `--invalid` `.popover` `.date-time-row` `.btn--sm` | [contract](../primitives/date-time-picker.md) |
| `date-time-range-picker` | A from→to range where each end carries its own time-of-day. | `.date-trigger` `--invalid` `.popover` `.date-presets` `.date-time-row` `.date-time-row__label` `.btn--sm` | [contract](../primitives/date-time-range-picker.md) |
| `drawer` | An edge-docked panel that slides in from a viewport edge over a dimmed scrim. | `.drawer-overlay` `.drawer` `.drawer--bottom` `--top` `--left` `--right` `.drawer__handle` `.drawer__header` `.drawer__title` `.drawer__description` `.drawer__footer` `.btn` `--color-scrim-light` `--space` | [contract](../primitives/drawer.md) |
| `dropdown-menu` | A triggered overlay of grouped actions. | `.dropdown-menu` `.dropdown-menu__item--active` | [contract](../primitives/dropdown-menu.md) |
| `dropzone` | Presentation-only file-select zone with drag-and-drop affordance. | `.dropzone` `.dropzone--drag` `.dropzone--disabled` `.file-list` `.file-row` | [contract](../primitives/dropzone.md) |
| `field` | The form-row wrapper. | `.field__required` | [contract](../primitives/field.md) |
| `hover-card` | A rich popover that opens on hover (and keyboard focus) over a trigger — for preview cards and detail popovers. | `.hover-card` | [contract](../primitives/hover-card.md) |
| `initials-tile` | A square, neutral identity tile that derives its initials from a name — a logo / icon placeholder for companies, apps, and people when no image exists. | — | [contract](../primitives/initials-tile.md) |
| `input-group` | A single-border container that fuses an Input/Textarea with leading/trailing addons (icons, text affixes, action buttons, keyboard hints). | `.input-group` `.input-group__addon` `--inline-start` `--inline-end` `--block-start` `--block-end` `.input-group__text` `.input-group__control` `.btn` `.btn--ghost` `.btn--xs` `.btn--icon` | [contract](../primitives/input-group.md) |
| `input-otp` | A segmented one-time-code / verification-code input: a row of single-character slots the user types a PIN/OTP into, optionally split into groups by a separator. | `.input-otp` `.input-otp__group` `.input-otp__slot` `.input-otp__slot--active` `.input-otp__caret` `.input-otp__separator` | [contract](../primitives/input-otp.md) |
| `input` | A single-line text field. | `.input` | [contract](../primitives/input.md) |
| `label` | The caption for a form control. | `.label--disabled` `.field` `.field__required` `.field__hint` `.field__error` | [contract](../primitives/label.md) |
| `menubar` | A horizontal application-style menu bar — a row of top-level triggers ("File", "Edit", "View") that each drop a menu of grouped actions. | `.menubar` `.menubar__trigger` `.menubar__trigger--open` `.dropdown-menu` | [contract](../primitives/menubar.md) |
| `modal` | A centered dialog over a dimmed scrim. | `.modal-overlay` `.modal` `.modal__header` `.modal__title` `.modal__description` `.modal__close` `.modal__body` `.modal__footer` `.btn` | [contract](../primitives/modal.md) |
| `navigation-menu` | Top-level site navigation with flyout panels — a horizontal bar of triggers/links where a trigger opens a portalled content panel beneath the bar. | `.nav-menu` `.nav-menu__trigger--open` `.nav-menu__link--active` `.nav-menu__content` | [contract](../primitives/navigation-menu.md) |
| `object-tile` | Square, filled entity/object identity mark for companies, apps, device models, etc. | `.object-tile` `.object-tile--neutral` `.object-tile__icon` | [contract](../primitives/object-tile.md) |
| `popover` | A small floating panel anchored to a trigger, portalled above the page. | `.popover` `.popover__header` `.popover__title` `.popover__description` `.menu-item` `.menu-item--destructive` | [contract](../primitives/popover.md) |
| `progress` | A horizontal bar showing numeric completion (0–100%). | `.progress` `.progress__track` `.progress__indicator` `.progress__label` `.progress__value` | [contract](../primitives/progress.md) |
| `radio-group` | A set of mutually exclusive options where exactly one is selected. | — | [contract](../primitives/radio-group.md) |
| `resizable` | A draggable split-pane layout: sibling panels separated by a hairline handle the user drags to redistribute space. | `.resizable-group` `.resizable-group--vertical` `.resizable-panel` `.resizable-handle` `.resizable-handle--horizontal` `.resizable-handle__grip` | [contract](../primitives/resizable.md) |
| `scroll-area` | A styled overflow container that swaps the OS scrollbar for a thin, token-skinned one that matches the design system. | `.scroll-area__scrollbar` `.scroll-area__thumb` | [contract](../primitives/scroll-area.md) |
| `select` | A dropdown for choosing one option from a list. | — | [contract](../primitives/select.md) |
| `separator` | A hairline divider that splits content along one axis. | `.separator--vertical` | [contract](../primitives/separator.md) |
| `sheet` | An edge-docked side panel that slides in over a dimmed scrim. | `.sheet-overlay` `.sheet` `.sheet--right` `--left` `--top` `--bottom` `.sheet__header` `.sheet__title` `.sheet__description` `.sheet__footer` `.btn` | [contract](../primitives/sheet.md) |
| `slider` | A draggable track-and-thumb input for selecting a numeric value, or a range (two thumbs) along a continuous scale. | `.slider` `.slider__track` `.slider__indicator` `.slider__thumb` | [contract](../primitives/slider.md) |
| `spinner` | A circular, indeterminate loading indicator — a spinning ring shown while content or an action is in flight (in-button loading, inline "fetching", small section busy state). | — | [contract](../primitives/spinner.md) |
| `switch` | A binary on/off toggle for an immediate state change (enable/disable, light/dark). | `.switch` `.switch--sm` `.switch__thumb` | [contract](../primitives/switch.md) |
| `tabs` | A tabbed control: a horizontal bar of triggers that switch which content panel is shown. | `.tabs` `.tabs__list` `.tabs__list--line` `.tabs__list--default` `.tabs__trigger` `.tabs__trigger--active` `.tabs__content` | [contract](../primitives/tabs.md) |
| `textarea` | A multi-line text field. | `.textarea` | [contract](../primitives/textarea.md) |
| `time-picker` | A time-only field built on the native <input type="time">. | `.date-trigger__clear` `.input-group` `.input-group__addon` | [contract](../primitives/time-picker.md) |
| `toast` | A transient, auto-dismissing notification (sonner). | `.toast` `.toast--with-icon` `.toast__icon` `.toast__content` `.toast__title` `.toast__description` `.toast__close` `--toast-duration` | [contract](../primitives/toast.md) |
| `toggle-group` | A set of press-toggle buttons that act as one control: a segmented switch (radio-like, max one pressed) or a multi-select chip/segment cluster. | `.toggle-group` `.toggle-group__item` `.toggle-group__item--sm` `--md` `--auto` | [contract](../primitives/toggle-group.md) |
| `toggle` | A press-toggle button with on/off (pressed) state. | `.toggle` `.toggle-group` | [contract](../primitives/toggle.md) |
| `tooltip` | A short text hint shown on hover/focus of a trigger. | `.tooltip` `.tooltip__arrow` | [contract](../primitives/tooltip.md) |

## L2.5 · Composites (26) — page building blocks

Classes in `composites/composites.css` (load after primitives — they reuse `.btn`/`.input`/…).

| component | use | classes (main; full set in `catalog.json`) | links |
|---|---|---|---|
| `app-frame` | The portal chrome a page lives inside: a fixed sidebar, a sticky top header, and the scrolling content region. | `.app-frame` `.app-frame__sidebar` `--active` `.app-frame__col` `.app-frame__header` `.app-frame__main` | [contract](../composites/app-frame.md) |
| `chart` | The data-viz family — bar, pie-with-callouts, sparkline, and the shared chrome (legend, tooltip, empty/loading states) — all themed off one categorical palette. | `.chart` `.chart__grid` `.chart__axis` `.chart__tick` `.chart__bar` `.chart__curve` `.chart__series--selected` `--dimmed` `--filtered` `.chart-legend` `.chart-legend__item` `--toggle` `--off` `.chart-legend__swatch` `--line` `.chart-legend__label` `.chart-tooltip` `.chart-tooltip__header` `.chart-tooltip__row` `.chart-tooltip__indicator` `--dashed` `.chart-tooltip__name` `.chart-tooltip__value` `.chart-tooltip__total` `.chart-sparkline` `.chart-empty` `.chart-empty__icon` `.chart-empty__title` `.chart-empty__description` `.chart-skeleton` | [contract](../composites/chart.md) |
| `data-table` | The workhorse of the list pattern: rows you scan, sort, select, and act on. | `.table-frame` `.table-scroll` `--compact` `--spacious` `--sticky-head` `--sticky-col` `--striped` `.cell-num` `.cell-right` `.row-actions` `.col-select` | [contract](../composites/data-table.md) |
| `detail-header` | The header band of a detail screen: an entity's identity (logo / name / status), its metadata, its actions, and the tab strip that switches its sub-views — all on one full-bleed surface that docks flush under the app header. | `.detail-header` `--sticky` `.detail-header__bar` `.detail-header__logo` `.detail-header__main` `.detail-header__title` `.badge` `.detail-header__meta` `.detail-header__chips` `.detail-header__actions` `.detail-header__tabs` `.tabs__list--line` | [contract](../composites/detail-header.md) |
| `diff` | A compact before → after comparison: the old value struck through, an arrow, the new value highlighted. | `.diff` `.diff__col--old` `.diff__arrow` `.diff__col--new` `.diff__label` `.diff__value` `.diff--inline` | [contract](../composites/diff.md) |
| `empty-state` | What a collection shows when it has nothing — a first-class state, not blank space. | `.empty-state` `.empty-state__icon` `.empty-state__title` `.empty-state__description` `.empty-state__action` `.btn--primary` | [contract](../composites/empty-state.md) |
| `feed-list` | A vertical list of event rows — each a tone-coded icon, a heading line, a body, and a right-aligned time, with optional row actions. | `.feed-list` `.feed-item` `.feed-item__icon` `--info` `--success` `--warning` `--neutral` `.feed-item__main` `.feed-item__time` `.empty-state` | [contract](../composites/feed-list.md) |
| `key-value` | Read-only KV field system for detail / overview pages (DS 2.0 §detail fields). | `.kv-grid` `.key-value` `--wide` `.key-value__label` `.key-value__value` `--empty` `--mono` | [contract](../composites/key-value.md) |
| `kv-grid` | The overview block of a detail screen: a record's attributes as label → value pairs, laid out as a description list that flows into more columns as its container widens. | `.kv-grid` `.kv-grid__row` `--full` `.grid-auto-fit-kv` | [contract](../composites/kv-grid.md) |
| `list-filter` | The "quick bar + applied chips" filtering apparatus of a list page. | `.condition-band` `.condition-band__toolbar` `.search-input` `.search-input__icon` `.input` `.select` `.btn` `.condition-band__spacer` `.applied-filters` `.applied-filters__label` `.filter-chip` | [contract](../composites/list-filter.md) |
| `load-more` | The append-on-click footer beneath a list/table: an optional summary line, a load-more button (or an end marker once exhausted), and an optional progress bar. | `.load-more` `.load-more__summary` `.load-more__end` `.progress` `.load-more__progress` | [contract](../composites/load-more.md) |
| `option-card` | A large, clickable card that behaves as a radio (or checkbox) — icon, title, description, and a selection indicator, with the whole card as the hit target and a tinted ring when chosen. | `.option-card` `--selected` `.radio` `.option-card__icon` `.option-card__body` `.option-card__check` | [contract](../composites/option-card.md) |
| `page-body` | The content region of a screen — everything beneath the full-bleed page-header band. | `.page-body` `.page-header` | [contract](../composites/page-body.md) |
| `page-header` | The band at the top of a screen: what this page is, plus its actions. | `.page-header` `--sticky` `.page-header__bar` `.page-header__titles` `.page-header__heading` `.page-header__title` `.page-header__count` `.badge` `.page-header__description` `.page-header__actions` | [contract](../composites/page-header.md) |
| `pagination` | Move through pages of a collection, and set page size. | `.pagination__pages` `.pagination__page` `.pagination__current` `.pagination` `.pagination__info` `.select--sm` `.pagination__summary` `.pagination__ellipsis` | [contract](../composites/pagination.md) |
| `product-card` | A catalog tile for one sellable thing: a product image, its name / SKU / short description, a price, and an add-to-cart affordance — laid out as a card and tiled into a responsive grid. | `.product-card` `.product-card__image` `.product-card__placeholder` `.product-card__body` `.btn--primary` `.product-card__add` `.product-grid` | [contract](../composites/product-card.md) |
| `rich-pagination` | Full list/table footer bar: optional rows-per-page selector + "Showing X–Y of Z" range summary on the left, page-number navigation on the right. | `.rich-pagination` `.rich-pagination__left` `.rich-pagination__rows` `.rich-pagination__summary` `.pagination` | [contract](../composites/rich-pagination.md) |
| `section-card` | A titled — and optionally collapsible — content panel: the block a detail page is divided into ("Overview", "Billing", "Activity"). | `.card` `.card__header` `.card__content` `.section-card` `.section-card--collapsible` `.section-card__toggle` `.section-card__chevron` | [contract](../composites/section-card.md) |
| `skeleton` | The loading placeholder. | `.skeleton` `--line` `--text` `--title` `--block` `--circle` `.skeleton-row` | [contract](../composites/skeleton.md) |
| `stat-card` | A single key metric — overline label, big mono value, optional trend / icon / description — surfaced above a list (style-spec §4). | `.stat-card` `.stat-card--selected` `.stat-card--interactive` `.stat-card__head` `.stat-card__label` `.stat-card__icon` `.stat-card__value` `.stat-card__delta` `.stat-card__description` `.stat-grid` | [contract](../composites/stat-card.md) |
| `step-indicator` | Horizontal progress rail for a multi-step flow (wizard): a row of numbered dots joined by connectors, each with a caption + title, showing what's done, where you are, and what's left. | `.step-indicator` `.step` `.step--completed` `.step--active` `.step--upcoming` `.step__dot` `.step__text` `.step__caption` `.step__title` `.step__connector` | [contract](../composites/step-indicator.md) |
| `stepper` | A numeric input flanked by −/+ buttons for incrementing/decrementing a single bounded number (quantity, page size, retry count). | `.stepper` `.input-group` `.input-group__addon--inline-start` `--inline-end` `.input-group--disabled` | [contract](../composites/stepper.md) |
| `summary-bar` | The strip between the list card's top edge and the table: how many results, and the list-level actions (Export, bulk ops). | `.summary-bar` `--sticky` `.summary-bar__count` `.summary-bar__actions` `.table-frame--flush` | [contract](../composites/summary-bar.md) |
| `theme-toggle` | An icon-only button that flips the app between light and dark. | `.theme-toggle` `.btn--ghost` | [contract](../composites/theme-toggle.md) |
| `timeline` | Vertical event log — device history, audit trails, ticket activity. | `.timeline` `.timeline__item` `.timeline__marker` `.timeline__content` `.timeline__marker--dot` `--icon` `.timeline--compact` `.timeline--stacked` `.timeline__item--last` `.timeline__header` `.timeline__title` `.timeline__time` `.timeline__time-row` `.timeline__description` `.timeline__actor` | [contract](../composites/timeline.md) |
| `toggles` | Inline control-with-label wrappers — pairs a .checkbox, .radio, or .switch primitive with an optional text .label. | `.toggle-checkbox` `.toggle-radio` `.toggle-switch` `.checkbox` `.radio` `.switch` `.label` | [contract](../composites/toggles.md) |

## L3 · Patterns (5) — assembled archetypes

A pattern is a named structure built from composites; copy its `example` and edit.

| pattern | use | composites used (see contract) | links |
|---|---|---|---|
| `actions` | The recurring verbs a portal screen offers — confirm-a-delete, export, bulk-act, flip-a-status, relate, edit-in-place, copy-an-id. | — | [contract](../patterns/actions.md) · [example](../patterns/actions.html) |
| `create-form` | "Capture or change a record." The single-step form — one card of fields, one commit. | — | [contract](../patterns/create-form.md) · [example](../patterns/create-form.html) |
| `create-wizard` | "多步向导新增页（有阶段依赖/分支/复核）" — a multi-step create flow for records that have stage dependencies, branching, or a review-before-commit step. | — | [contract](../patterns/create-wizard.md) · [example](../patterns/create-wizard.html) |
| `detail-page` | "One record, read-mostly, with actions." The archetype you reach a list page's row into. | — | [contract](../patterns/detail-page.md) · [example](../patterns/detail-page.html) |
| `list-page` | The default archetype for "a collection you browse, filter, and act on" (the most common portal screen). | — | [contract](../patterns/list-page.md) · [example](../patterns/list-page.html) |
