# Foundation 组件索引 · 档 70%

> **纯索引**:组件清单 + class vocab + 用途 + 范例路径。**不含 markup 骨架**——非平凡使用直接读 `example` 指的真范例、取其规范实例(忽略 demo 脚手架)。组件 CSS 已在壳里。生成物,勿手改;改覆盖范围请编辑 component-registry.md 后跑 refresh。

## Tokens (semantic, use `var(--…)`)

- content/surface/line/primary/status colors · space · text · radius · font-sans · shadow(card/overlay). (Full list in tokens.inline.css, inlined in the shell.)

---

### button · primitive · tier 30
A clickable action.
class: `.btn` `.btn--auto` `.btn--danger` `.btn--ghost` `.btn--ghost-danger` `.btn--icon` `.btn--icon-lg` `.btn--icon-sm` `.btn--icon-xs` `.btn--lg` `.btn--link` `.btn--md` `.btn--primary` `.btn--secondary` `.btn--sm` `.btn--xs`
example → `primitives/button.html` (非平凡使用去读、取规范实例)

### input · primitive · tier 30
A single-line text field.
class: `.input` `.input--filled` `.input--lg` `.input--loading` `.input--md` `.input--ok` `.input--sm` `.input--warn`
example → `primitives/input.html` (非平凡使用去读、取规范实例)

### textarea · primitive · tier 30
A multi-line text field.
class: `.textarea` `.textarea__count` `.textarea__count--error` `.textarea__count--warning`
example → `primitives/textarea.html` (非平凡使用去读、取规范实例)

### select · primitive · tier 30
A dropdown for choosing one option from a list.
class: `.field` `.select` `.select--sm`
example → `primitives/select.html` (非平凡使用去读、取规范实例)

### checkbox · primitive · tier 30
A binary on/off toggle for a single boolean, or a tri-state "select all" header.
class: `.checkbox`
example → `primitives/checkbox.html` (非平凡使用去读、取规范实例)

### field · primitive · tier 30
The form-row wrapper.
class: `.field` `.field__error` `.field__hint` `.field__required`
example → `primitives/field.html` (非平凡使用去读、取规范实例)

### badge · primitive · tier 30
A small inline label for status or category.
class: `.badge` `.badge--error` `.badge--info` `.badge--neutral` `.badge--success` `.badge--tag` `.badge--warning` `.badge__dot` `.badge__icon`
example → `primitives/badge.html` (非平凡使用去读、取规范实例)

### card · primitive · tier 30
A bordered content container.
class: `.card` `.card--collapsible` `.card--elevation-0` `.card--elevation-1` `.card--elevation-2` `.card--interactive` `.card--lg` `.card--md` `.card--sm` `.card__action` `.card__chevron` `.card__content` `.card__content--flush` `.card__description` `.card__footer` `.card__footer--flush` `.card__header` `.card__header--flush` `.card__title` `.card__toggle`
example → `primitives/card.html` (非平凡使用去读、取规范实例)

### alert · primitive · tier 30
An inline, in-flow status message box.
class: `.alert` `.alert--error` `.alert--info` `.alert--success` `.alert--warning` `.alert--with-icon` `.alert__action` `.alert__description` `.alert__icon` `.alert__title`
example → `primitives/alert.html` (非平凡使用去读、取规范实例)

### modal · primitive · tier 30
A centered dialog over a dimmed scrim.
class: `.modal` `.modal--fullscreen` `.modal--lg` `.modal--md` `.modal--sm` `.modal--xl` `.modal-overlay` `.modal__body` `.modal__close` `.modal__description` `.modal__footer` `.modal__header` `.modal__heading` `.modal__title`
example → `primitives/modal.html` (非平凡使用去读、取规范实例)

### toast · primitive · tier 30
A transient, auto-dismissing notification (sonner).
class: `.toast` `.toast--countdown` `.toast--with-icon` `.toast__close` `.toast__content` `.toast__description` `.toast__icon` `.toast__icon--error` `.toast__icon--info` `.toast__icon--loading` `.toast__icon--success` `.toast__icon--warning` `.toast__title`
example → `primitives/toast.html` (非平凡使用去读、取规范实例)

### avatar · primitive · tier 30
A user/entity identity chip: a circular image that falls back to initials when the image is missing or fails to load.
class: `.avatar` `.avatar--lg` `.avatar--md` `.avatar--sm` `.avatar--xl` `.avatar-group` `.avatar__fallback` `.avatar__image`
example → `primitives/avatar.html` (非平凡使用去读、取规范实例)

### progress · primitive · tier 30
A horizontal bar showing numeric completion (0–100%).
class: `.progress` `.progress--lg` `.progress--striped` `.progress--xs` `.progress__indicator` `.progress__indicator--error` `.progress__indicator--info` `.progress__indicator--success` `.progress__indicator--warning` `.progress__label` `.progress__track` `.progress__value`
example → `primitives/progress.html` (非平凡使用去读、取规范实例)

### separator · primitive · tier 30
A hairline divider that splits content along one axis.
class: `.separator` `.separator--vertical` `.separator-labeled` `.separator-labeled__label`
example → `primitives/separator.html` (非平凡使用去读、取规范实例)

### label · primitive · tier 70
The caption for a form control.
class: `.label` `.label--disabled`
example → `primitives/label.html` (非平凡使用去读、取规范实例)

### radio-group · primitive · tier 70
A set of mutually exclusive options where exactly one is selected.
class: `.radio` `.radio-group`
example → `primitives/radio-group.html` (非平凡使用去读、取规范实例)

### switch · primitive · tier 70
A binary on/off toggle for an immediate state change (enable/disable, light/dark).
class: `.switch` `.switch--sm` `.switch__thumb`
example → `primitives/switch.html` (非平凡使用去读、取规范实例)

### toggle · primitive · tier 70
A press-toggle button with on/off (pressed) state.
class: `.toggle` `.toggle--auto` `.toggle--default` `.toggle--md` `.toggle--outline` `.toggle--sm`
example → `primitives/toggle.html` (非平凡使用去读、取规范实例)

### toggle-group · primitive · tier 70
A set of press-toggle buttons that act as one control.
class: `.toggle-group` `.toggle-group--cloud` `.toggle-group--outline` `.toggle-group--plain` `.toggle-group--segmented` `.toggle-group__item` `.toggle-group__item--auto` `.toggle-group__item--md` `.toggle-group__item--sm`
example → `primitives/toggle-group.html` (非平凡使用去读、取规范实例)

### slider · primitive · tier 70
A draggable track-and-thumb input for selecting a numeric value, or a range (two thumbs) along a continuous scale.
class: `.slider` `.slider--vertical` `.slider__indicator` `.slider__thumb` `.slider__track`
example → `primitives/slider.html` (非平凡使用去读、取规范实例)

### input-otp · primitive · tier 70
A segmented one-time-code / verification-code input: a row of single-character slots the user types a PIN/OTP into, optionally split into groups by a separator.
class: `.input-otp` `.input-otp__caret` `.input-otp__group` `.input-otp__separator` `.input-otp__slot` `.input-otp__slot--active` `.label` `.label--disabled`
example → `primitives/input-otp.html` (非平凡使用去读、取规范实例)

### combobox · primitive · tier 70
A searchable single- or multi-select dropdown.
class: `.combobox__chevron` `.combobox__content` `.combobox__empty` `.combobox__input` `.combobox__item` `.combobox__item--highlighted` `.combobox__item--selected` `.combobox__item-indicator` `.combobox__list` `.combobox__search` `.combobox__trigger` `.combobox__trigger--sm` `.combobox__value` `.combobox__value--placeholder`
example → `primitives/combobox.html` (非平凡使用去读、取规范实例)

### command · primitive · tier 70
A keyboard-driven command palette: a search input over a filtered, grouped list of runnable items.
class: `.command` `.command-dialog` `.command-dialog__backdrop` `.command__empty` `.command__group` `.command__group-heading` `.command__input` `.command__input-wrapper` `.command__item` `.command__item--active` `.command__list` `.command__separator` `.command__shortcut` `.input-group`
example → `primitives/command.html` (非平凡使用去读、取规范实例)

### tabs · primitive · tier 70
A tabbed control: a horizontal bar of triggers that switch which content panel is shown.
class: `.tabs` `.tabs--vertical` `.tabs__content` `.tabs__list` `.tabs__list--default` `.tabs__list--line` `.tabs__list--vertical` `.tabs__trigger` `.tabs__trigger--active`
example → `primitives/tabs.html` (非平凡使用去读、取规范实例)

### tooltip · primitive · tier 70
A short text hint shown on hover/focus of a trigger.
class: `.tooltip` `.tooltip__arrow`
example → `primitives/tooltip.html` (非平凡使用去读、取规范实例)

### popover · primitive · tier 70
A small floating panel anchored to a trigger, portalled above the page.
class: `.menu-item` `.menu-item--destructive` `.popover` `.popover__description` `.popover__header` `.popover__title`
example → `primitives/popover.html` (非平凡使用去读、取规范实例)

### dropdown-menu · primitive · tier 70
A triggered overlay of grouped actions.
class: `.dropdown-menu` `.dropdown-menu__checkbox-item` `.dropdown-menu__checkbox-item--active` `.dropdown-menu__item` `.dropdown-menu__item--active` `.dropdown-menu__item--destructive` `.dropdown-menu__item--inset` `.dropdown-menu__item-indicator` `.dropdown-menu__label` `.dropdown-menu__label--inset` `.dropdown-menu__radio-item` `.dropdown-menu__radio-item--active` `.dropdown-menu__separator` `.dropdown-menu__shortcut` `.dropdown-menu__sub-content` `.dropdown-menu__sub-trigger` `.dropdown-menu__sub-trigger--inset` `.dropdown-menu__sub-trigger--open` `.dropdown-menu__sub-trigger__chevron`
example → `primitives/dropdown-menu.html` (非平凡使用去读、取规范实例)

### context-menu · primitive · tier 70
A right-click contextual action menu.
class: `.context-menu__content` `.context-menu__indicator` `.context-menu__item` `.context-menu__item--checkbox` `.context-menu__item--destructive` `.context-menu__item--inset` `.context-menu__item--radio` `.context-menu__label` `.context-menu__label--inset` `.context-menu__separator` `.context-menu__shortcut` `.context-menu__sub-trigger` `.context-menu__sub-trigger--inset`
example → `primitives/context-menu.html` (非平凡使用去读、取规范实例)

### accordion · primitive · tier 70
A vertical stack of collapsible disclosure sections.
class: `.accordion` `.accordion__arrow` `.accordion__content` `.accordion__item` `.accordion__item--open` `.accordion__label` `.accordion__trigger`
example → `primitives/accordion.html` (非平凡使用去读、取规范实例)

### collapsible · primitive · tier 70
A single show/hide disclosure: one trigger reveals or hides one panel of content.
class: `.collapsible` `.collapsible__chevron` `.collapsible__content` `.collapsible__content--open` `.collapsible__trigger`
example → `primitives/collapsible.html` (非平凡使用去读、取规范实例)

### alert-dialog · primitive · tier 70
A forced-action confirm.
class: `.alert-dialog` `.alert-dialog-overlay` `.alert-dialog__description` `.alert-dialog__footer` `.alert-dialog__header` `.alert-dialog__title`
example → `primitives/alert-dialog.html` (非平凡使用去读、取规范实例)

### sheet · primitive · tier 70
An edge-docked side panel that slides in over a dimmed scrim (base-ui Dialog), docked to right (default), left, top, or bottom — for filters, detail/inspector views, and form panels.
class: `.sheet` `.sheet--bottom` `.sheet--left` `.sheet--right` `.sheet--top` `.sheet-overlay` `.sheet__close` `.sheet__description` `.sheet__footer` `.sheet__header` `.sheet__title`
example → `primitives/sheet.html` (非平凡使用去读、取规范实例)

### spinner · primitive · tier 70
A circular, indeterminate loading indicator — a spinning ring shown while content or an action is in flight (in-button loading, inline "fetching", small section busy state).
class: `.spinner` `.spinner--lg` `.spinner--md` `.spinner--sm` `.spinner--xl`
example → `primitives/spinner.html` (非平凡使用去读、取规范实例)

### dropzone · primitive · tier 70
Presentation-only file-select zone with drag-and-drop affordance.
class: `.dropzone` `.dropzone--disabled` `.dropzone--drag` `.file-list` `.file-row` `.file-row__body` `.file-row__error` `.file-row__icon` `.file-row__name` `.file-row__name-row` `.file-row__size` `.file-row__status` `.file-row__status--done` `.file-row__status--error`
example → `primitives/dropzone.html` (非平凡使用去读、取规范实例)

### date-picker · primitive · tier 70
A single-date field.
class: `.date-picker` `.date-presets` `.date-presets__item` `.date-time-row` `.date-time-row__label` `.date-trigger` `.date-trigger--clearable` `.date-trigger--invalid` `.date-trigger--lg` `.date-trigger--md` `.date-trigger--sm` `.date-trigger__clear` `.date-trigger__icon` `.date-trigger__value` `.date-trigger__value--placeholder`
example → `primitives/date-picker.html` (非平凡使用去读、取规范实例)

### date-range-picker · primitive · tier 70
A from→to date range field.
class: `.date-picker` `.date-presets` `.date-presets__item` `.date-time-row` `.date-time-row__label` `.date-trigger` `.date-trigger--clearable` `.date-trigger--invalid` `.date-trigger--lg` `.date-trigger--md` `.date-trigger--sm` `.date-trigger__clear` `.date-trigger__icon` `.date-trigger__value` `.date-trigger__value--placeholder`
example → `primitives/date-range-picker.html` (非平凡使用去读、取规范实例)

### calendar · primitive · tier 70
The base month grid — a weekday header over a 6×7 day matrix with month navigation.
class: `.calendar` `.calendar__caption` `.calendar__day` `.calendar__day--disabled` `.calendar__day--focused` `.calendar__day--hidden` `.calendar__day--outside` `.calendar__day--range-end` `.calendar__day--range-middle` `.calendar__day--range-start` `.calendar__day--selected` `.calendar__day--today` `.calendar__dropdown` `.calendar__dropdowns` `.calendar__footer` `.calendar__grid` `.calendar__header` `.calendar__link` `.calendar__nav-btn` `.calendar__weekday`
example → `primitives/calendar.html` (非平凡使用去读、取规范实例)

### input-group · primitive · tier 70
A single-border container that fuses an Input/Textarea with leading/trailing addons (icons, text affixes, action buttons, keyboard hints).
class: `.btn` `.input-group` `.input-group--block` `.input-group--disabled` `.input-group--invalid` `.input-group__addon` `.input-group__addon--block-end` `.input-group__addon--block-start` `.input-group__addon--inline-end` `.input-group__addon--inline-start` `.input-group__control` `.input-group__text` `.textarea`
example → `primitives/input-group.html` (非平凡使用去读、取规范实例)

### page-header · composite · tier 30
The band at the top of a screen: what this page is, plus its actions.
class: `.page-header` `.page-header--sticky` `.page-header__actions` `.page-header__bar` `.page-header__description` `.page-header__heading` `.page-header__title` `.page-header__titles`
example → `composites/page-header.html` (非平凡使用去读、取规范实例)

### detail-header · composite · tier 30
The header band of a detail screen: an entity's identity (logo / name / status), its metadata, its actions, and the tab strip that switches its sub-views — all on one full-bleed surface that docks flush under the app header.
class: `.detail-header` `.detail-header--sticky` `.detail-header__actions` `.detail-header__back` `.detail-header__bar` `.detail-header__chips` `.detail-header__description` `.detail-header__logo` `.detail-header__main` `.detail-header__meta` `.detail-header__name` `.detail-header__tabs` `.detail-header__title` `.tabs__list--line`
example → `composites/detail-header.html` (非平凡使用去读、取规范实例)

### list-filter · composite · tier 30
The "quick bar + applied chips" filtering apparatus of a list page.
class: `.applied-filters` `.applied-filters__label` `.condition-band` `.condition-band__spacer` `.condition-band__toolbar` `.filter-chip` `.filter-chip__remove` `.input` `.search-input` `.search-input__icon`
example → `composites/list-filter.html` (非平凡使用去读、取规范实例)

### summary-bar · composite · tier 30
The strip between the list card's top edge and the table: how many results, and the list-level actions (Export, bulk ops).
class: `.summary-bar` `.summary-bar--sticky` `.summary-bar__actions` `.summary-bar__count`
example → `composites/summary-bar.html` (非平凡使用去读、取规范实例)

### data-table · composite · tier 30
The workhorse of the list pattern: rows you scan, sort, select, and act on.
class: `.btn--ghost` `.card__content--flush` `.cell-2line` `.cell-2line__main` `.cell-2line__sub` `.cell-center` `.cell-chevron` `.cell-empty` `.cell-num` `.cell-right` `.cell-tags` `.col-select` `.data-table` `.data-table--compact` `.data-table--spacious` `.data-table--sticky-col` `.data-table--sticky-head` `.data-table--striped` `.is-clickable` `.list-row` `.row-actions` `.row-actions__inner` `.table-frame` `.table-frame--flush` `.table-scroll` `.th-sort` `.th-sort__icon--active` `.th-sort__icon--idle`
example → `composites/data-table.html` (非平凡使用去读、取规范实例)

### rich-pagination · composite · tier 30
Full list/table footer bar: optional rows-per-page selector + "Showing X–Y of Z" range summary on the left, page-number navigation on the right.
class: `.rich-pagination` `.rich-pagination__left` `.rich-pagination__rows` `.rich-pagination__summary`
example → `composites/rich-pagination.html` (非平凡使用去读、取规范实例)

### kv-grid · composite · tier 30
The overview block of a detail screen: a record's attributes as label → value pairs, laid out left-right — label left, value right, aligned in two shared columns; a long value just wraps inside its value column.
class: `.kv-grid` `.kv-grid__row`
example → `composites/kv-grid.html` (非平凡使用去读、取规范实例)

### empty-state · composite · tier 30
What a collection shows when it has nothing — a first-class state, not blank space.
class: `.empty-state` `.empty-state__action` `.empty-state__description` `.empty-state__icon` `.empty-state__title`
example → `composites/empty-state.html` (非平凡使用去读、取规范实例)

### skeleton · composite · tier 30
The loading placeholder.
class: `.skeleton` `.skeleton--block` `.skeleton--circle` `.skeleton--line` `.skeleton--text` `.skeleton--title` `.skeleton-row`
example → `composites/skeleton.html` (非平凡使用去读、取规范实例)

### action-footer · composite · tier 70
A full-bleed action band pinned to the bottom of the scroll root, carrying a right-aligned commit cluster — the bottom counterpart to the header bands (page-header / detail-header).
class: `.action-footer` `.action-footer__bar` `.app-frame__main`
example → `composites/action-footer.html` (非平凡使用去读、取规范实例)

### list-row · composite · tier 70
A non-tabular interactive list row — a leading visual, a title line that can carry inline badges over an optional sub-line, and a trailing control / action cluster / value, with the whole row optionally a click target.
class: `.list-row` `.list-row--disabled` `.list-row--interactive` `.list-row--selected` `.list-row__actions` `.list-row__chevron` `.list-row__icon` `.list-row__main` `.list-row__name` `.list-row__sub` `.list-row__title` `.list-row__trailing` `.list-row__value` `.list-rows`
example → `composites/list-row.html` (非平凡使用去读、取规范实例)

### load-more · composite · tier 70
The append-on-click footer beneath a list/table: an optional summary line, a load-more button (or an end marker once exhausted), and an optional progress bar.
class: `.load-more` `.load-more__end` `.load-more__progress` `.load-more__summary`
example → `composites/load-more.html` (非平凡使用去读、取规范实例)

### stat-card · composite · tier 70
A single key metric — overline label, big tabular value, optional trend / icon / description — surfaced above a list (style-spec §4).
class: `.stat-card` `.stat-card--interactive` `.stat-card--selected` `.stat-card__delta` `.stat-card__delta--down` `.stat-card__delta--flat` `.stat-card__delta--up` `.stat-card__description` `.stat-card__head` `.stat-card__icon` `.stat-card__label` `.stat-card__value` `.stat-card__value--error` `.stat-card__value--info` `.stat-card__value--success` `.stat-card__value--warning` `.stat-grid` `.stat-grid--cols-2` `.stat-grid--cols-3` `.stat-grid--cols-4`
example → `composites/stat-card.html` (非平凡使用去读、取规范实例)

### status-card · composite · tier 70
A header-less card — content + footer, no CardHeader — for repeating status lists: a media-led heading (icon + title + status badge) over an optional description, with a control footer.
class: `.card__footer` `.status-card` `.status-card__description` `.status-card__footer-end` `.status-card__footer-start` `.status-card__head` `.status-card__heading` `.status-card__link` `.status-card__media` `.status-card__trailing`
example → `composites/status-card.html` (非平凡使用去读、取规范实例)

### step-indicator · composite · tier 70
Horizontal progress rail for a multi-step flow (wizard): a row of numbered dots joined by connectors, each with a caption + title, showing what's done, where you are, and what's left.
class: `.step` `.step--active` `.step--completed` `.step--error` `.step--upcoming` `.step-indicator` `.step-indicator-card` `.step__body` `.step__body--clickable` `.step__caption` `.step__connector` `.step__dot` `.step__text` `.step__title`
example → `composites/step-indicator.html` (非平凡使用去读、取规范实例)

### stepper · composite · tier 70
A numeric input flanked by −/+ buttons for incrementing/decrementing a single bounded number (quantity, page size, retry count).
class: `.stepper` `.stepper__button` `.stepper__input`
example → `composites/stepper.html` (非平凡使用去读、取规范实例)

### timeline · composite · tier 70
Vertical event log — device history, audit trails, ticket activity.
class: `.timeline` `.timeline--compact` `.timeline--stacked` `.timeline__actor` `.timeline__content` `.timeline__description` `.timeline__header` `.timeline__item` `.timeline__item--last` `.timeline__marker` `.timeline__marker--dot` `.timeline__marker--error` `.timeline__marker--icon` `.timeline__marker--info` `.timeline__marker--neutral` `.timeline__marker--primary` `.timeline__marker--success` `.timeline__marker--warning` `.timeline__marker-dot` `.timeline__marker-node` `.timeline__rail` `.timeline__time` `.timeline__time-row` `.timeline__title`
example → `composites/timeline.html` (非平凡使用去读、取规范实例)

### option-card · composite · tier 70
A large, clickable card that behaves as a radio (or checkbox) — icon, title, description, and a selection indicator, with the whole card as the hit target and a tinted ring when chosen.
class: `.option-card` `.option-card--radio` `.option-card--selected` `.option-card__body` `.option-card__check` `.option-card__desc` `.option-card__icon` `.option-card__input` `.option-card__title`
example → `composites/option-card.html` (非平凡使用去读、取规范实例)

### toggles · composite · tier 70
Inline control-with-label wrappers — pairs a .checkbox, .radio, or .switch primitive with an optional text .label.
class: `.toggle-checkbox` `.toggle-radio` `.toggle-switch`
example → `composites/toggles.html` (非平凡使用去读、取规范实例)
