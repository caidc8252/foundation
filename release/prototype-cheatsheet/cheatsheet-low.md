# Foundation 组件索引 · 档 30%

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

### page-header · composite · tier 30
The band at the top of a screen: what this page is, plus its actions.
class: `.page-header` `.page-header--sticky` `.page-header__actions` `.page-header__bar` `.page-header__description` `.page-header__heading` `.page-header__title` `.page-header__titles`
example → `composites/page-header.html` (非平凡使用去读、取规范实例)

### detail-header · composite · tier 30
The header band of a detail screen: an entity's identity (logo / name / status), its metadata, its actions, and the tab strip that switches its sub-views — all on one full-bleed surface that docks flush under the app header.
class: `.btn` `.detail-header` `.detail-header--sticky` `.detail-header__actions` `.detail-header__back` `.detail-header__bar` `.detail-header__chips` `.detail-header__description` `.detail-header__logo` `.detail-header__main` `.detail-header__meta` `.detail-header__name` `.detail-header__tabs` `.detail-header__title` `.tabs__list--line`
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
