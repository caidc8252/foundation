/* TOMS prototype — in-page style editor.
   Runtime-injected; NOT part of any page's static markup (so pages stay closed-set clean).
   Click a primitive/composite element in Edit mode → tweak its declared, themeable styles
   with foundation tokens. Changes are in-memory draft overrides until saved as a
   version, and exportable as edited HTML or a changes JSON. */
(function () {
  'use strict';
  if (window.__tomsEditor) return;
  window.__tomsEditor = true;

  // Foundation primitive/composite class names (baked from primitives.css + composites.css).
  var FOUNDATION = new Set(["accordion","accordion__arrow","accordion__content","accordion__item","accordion__item--open","accordion__label","accordion__trigger","alert","alert--default","alert--error","alert--info","alert--success","alert--warning","alert--with-icon","alert-dialog","alert-dialog-overlay","alert-dialog__description","alert-dialog__footer","alert-dialog__header","alert-dialog__title","alert__action","alert__description","alert__icon","alert__title","amount-row","amount-row--total","amount-row__label","amount-row__value","amount-summary","app-frame","app-frame--collapsed","app-frame__avatar","app-frame__brand","app-frame__col","app-frame__header","app-frame__main","app-frame__nav","app-frame__nav-item","app-frame__nav-item--active","app-frame__nav-label","app-frame__sidebar","app-frame__spacer","applied-filters","applied-filters__label","aspect-ratio","avatar","avatar--lg","avatar--md","avatar--sm","avatar--xl","avatar-group","avatar__fallback","avatar__image","badge","badge--default","badge--destructive","badge--error","badge--ghost","badge--info","badge--link","badge--neutral","badge--outline","badge--secondary","badge--success","badge--tag","badge--warning","badge__dot","breadcrumb__ellipsis","breadcrumb__item","breadcrumb__link","breadcrumb__list","breadcrumb__page","breadcrumb__separator","btn","btn--danger","btn--ghost","btn--ghost-danger","btn--icon","btn--icon-lg","btn--icon-sm","btn--icon-xs","btn--lg","btn--link","btn--md","btn--outline","btn--primary","btn--secondary","btn--sm","btn--soft","btn--tertiary","btn--xs","calendar","calendar__caption","calendar__day","calendar__day--disabled","calendar__day--focused","calendar__day--hidden","calendar__day--outside","calendar__day--range-end","calendar__day--range-middle","calendar__day--range-start","calendar__day--selected","calendar__day--today","calendar__footer","calendar__grid","calendar__header","calendar__link","calendar__nav-btn","calendar__weekday","card","card--elevation-0","card--elevation-1","card--elevation-2","card--interactive","card--lg","card--md","card--sm","card__action","card__content","card__content--flush","card__description","card__footer","card__footer--flush","card__header","card__header--flush","card__title","carousel","carousel--vertical","carousel__dot","carousel__dot--active","carousel__dots","carousel__item","carousel__nav","carousel__next","carousel__prev","carousel__track","carousel__viewport","cell-2line","cell-2line__main","cell-2line__sub","cell-center","cell-chevron","cell-empty","cell-num","cell-right","cell-tags","chart","chart-empty","chart-empty__description","chart-empty__icon","chart-empty__title","chart-legend","chart-legend__item","chart-legend__item--off","chart-legend__item--toggle","chart-legend__swatch","chart-legend__swatch--line","chart-skeleton","chart-sparkline","chart-tooltip","chart-tooltip__header","chart-tooltip__indicator","chart-tooltip__indicator--dashed","chart-tooltip__indicator--line","chart-tooltip__name","chart-tooltip__row","chart-tooltip__total","chart-tooltip__value","chart__axis","chart__bar","chart__curve","chart__grid","chart__label","chart__series--dimmed","chart__series--filtered","chart__series--selected","chart__tick","checkbox","col-select","collapsible","collapsible__chevron","collapsible__content","collapsible__content--open","collapsible__trigger","color-tile","color-tile--cat-1","color-tile--cat-2","color-tile--cat-3","color-tile--cat-4","color-tile--cat-5","color-tile--cat-6","color-tile--lg","color-tile--md","color-tile--sm","color-tile__label","combobox__chevron","combobox__content","combobox__empty","combobox__input","combobox__item","combobox__item--highlighted","combobox__item--selected","combobox__item-indicator","combobox__list","combobox__search","combobox__trigger","combobox__trigger--sm","combobox__value","combobox__value--placeholder","command","command-dialog","command-dialog__backdrop","command__empty","command__group","command__group-heading","command__input","command__input-wrapper","command__item","command__item--active","command__list","command__separator","command__shortcut","condition-band","condition-band__spacer","condition-band__toolbar","context-menu__content","context-menu__indicator","context-menu__item","context-menu__item--checkbox","context-menu__item--destructive","context-menu__item--inset","context-menu__item--radio","context-menu__label","context-menu__label--inset","context-menu__separator","context-menu__shortcut","context-menu__sub-trigger","context-menu__sub-trigger--inset","css","data-table","data-table--compact","data-table--spacious","data-table--sticky-col","data-table--sticky-head","data-table--striped","date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder","detail-header","detail-header--sticky","detail-header__actions","detail-header__back","detail-header__bar","detail-header__chips","detail-header__logo","detail-header__main","detail-header__meta","detail-header__name","detail-header__tabs","detail-header__title","diff","diff--inline","diff__arrow","diff__col--new","diff__col--old","diff__label","diff__value","drawer","drawer--bottom","drawer--left","drawer--right","drawer--top","drawer-overlay","drawer__description","drawer__footer","drawer__handle","drawer__header","drawer__title","dropdown-menu","dropdown-menu__checkbox-item","dropdown-menu__checkbox-item--active","dropdown-menu__item","dropdown-menu__item--active","dropdown-menu__item--destructive","dropdown-menu__item--inset","dropdown-menu__item-indicator","dropdown-menu__label","dropdown-menu__label--inset","dropdown-menu__radio-item","dropdown-menu__radio-item--active","dropdown-menu__separator","dropdown-menu__shortcut","dropdown-menu__sub-content","dropdown-menu__sub-trigger","dropdown-menu__sub-trigger--inset","dropdown-menu__sub-trigger--open","dropdown-menu__sub-trigger__chevron","dropzone","dropzone--disabled","dropzone--drag","empty-state","empty-state__action","empty-state__description","empty-state__icon","empty-state__title","feed-item","feed-item--read","feed-item__actions","feed-item__body","feed-item__head","feed-item__icon","feed-item__icon--info","feed-item__icon--neutral","feed-item__icon--success","feed-item__icon--warning","feed-item__main","feed-item__time","feed-item__title","feed-list","field","field__error","field__hint","field__required","file-list","file-row","file-row__body","file-row__error","file-row__icon","file-row__name","file-row__name-row","file-row__size","file-row__status","file-row__status--done","file-row__status--error","filter-chip","filter-chip__remove","g","grid-auto-fit-kv","hover-card","initials-tile","initials-tile--lg","initials-tile--md","initials-tile--sm","initials-tile--xs","inline","input","input--filled","input--lg","input--md","input--ok","input--sm","input--warn","input-group","input-group--block","input-group--disabled","input-group--invalid","input-group__addon","input-group__addon--block-end","input-group__addon--block-start","input-group__addon--inline-end","input-group__addon--inline-start","input-group__control","input-group__text","input-otp","input-otp__caret","input-otp__group","input-otp__separator","input-otp__slot","input-otp__slot--active","is-clickable","kv-grid","kv-grid__row","kv-grid__row--full","label","label--disabled","load-more","load-more__end","load-more__progress","load-more__summary","md","menu-item","menu-item--destructive","menubar","menubar__trigger","menubar__trigger--open","modal","modal--fullscreen","modal--lg","modal--md","modal--sm","modal--xl","modal-overlay","modal__body","modal__close","modal__description","modal__footer","modal__header","modal__heading","modal__title","nav-menu","nav-menu__content","nav-menu__indicator","nav-menu__item","nav-menu__link","nav-menu__link--active","nav-menu__list","nav-menu__trigger","nav-menu__trigger--open","nav-menu__trigger__chevron","object-tile","object-tile--cat-1","object-tile--cat-2","object-tile--cat-3","object-tile--cat-4","object-tile--cat-5","object-tile--cat-6","object-tile--lg","object-tile--md","object-tile--neutral","object-tile--sm","object-tile__icon","option-card","option-card--radio","option-card--selected","option-card__body","option-card__check","option-card__desc","option-card__icon","option-card__input","option-card__title","page-body","page-header","page-header--sticky","page-header__actions","page-header__bar","page-header__count","page-header__description","page-header__heading","page-header__title","page-header__titles","pagination","pagination__current","pagination__ellipsis","pagination__info","pagination__page","pagination__pages","pagination__rows","pagination__summary","popover","popover__","popover__description","popover__header","popover__title","product-card","product-card--out-of-stock","product-card__add","product-card__body","product-card__cta","product-card__description","product-card__glyph","product-card__image","product-card__name","product-card__options","product-card__placeholder","product-card__price","product-card__price-row","product-card__ribbon","product-card__ribbon--info","product-card__ribbon--success","product-card__ribbon--warning","product-card__sku","product-grid","progress","progress__indicator","progress__indicator--error","progress__indicator--info","progress__indicator--success","progress__indicator--warning","progress__label","progress__track","progress__value","radio","recharts-cartesian-grid","resizable-group","resizable-group--vertical","resizable-handle","resizable-handle--horizontal","resizable-handle__grip","resizable-panel","rich-pagination","rich-pagination__left","rich-pagination__rows","rich-pagination__summary","row-actions","scroll-area","scroll-area__scrollbar","scroll-area__thumb","scroll-area__viewport","search-input","search-input__icon","section-card","section-card--collapsible","section-card__chevron","section-card__toggle","select","select--sm","separator","separator--vertical","separator-labeled","separator-labeled__label","sheet","sheet--bottom","sheet--left","sheet--right","sheet--top","sheet-overlay","sheet__close","sheet__description","sheet__footer","sheet__header","sheet__title","skeleton","skeleton--block","skeleton--circle","skeleton--line","skeleton--text","skeleton--title","skeleton-row","slider","slider--vertical","slider__indicator","slider__thumb","slider__track","spinner","spinner--lg","spinner--md","spinner--sm","spinner--xl","stack","stack--3","stack--4","stack--5","stack--6","stat-card","stat-card--interactive","stat-card--selected","stat-card__delta","stat-card__delta--down","stat-card__delta--flat","stat-card__delta--up","stat-card__description","stat-card__head","stat-card__icon","stat-card__label","stat-card__value","stat-card__value--error","stat-card__value--info","stat-card__value--success","stat-card__value--warning","stat-grid","stat-grid--cols-2","stat-grid--cols-3","stat-grid--cols-4","step","step--","step--active","step--completed","step--upcoming","step-indicator","step__body","step__body--clickable","step__caption","step__connector","step__dot","step__text","step__title","stepper","stepper__button","stepper__input","summary-bar","summary-bar--sticky","summary-bar__actions","summary-bar__count","switch","switch--sm","switch__thumb","table-frame","table-frame--flush","table-scroll","tabs","tabs--line","tabs__content","tabs__list","tabs__list--default","tabs__list--line","tabs__trigger","tabs__trigger--active","textarea","th-sort","th-sort__icon--active","th-sort__icon--idle","theme-toggle","timeline","timeline--compact","timeline--stacked","timeline__actor","timeline__content","timeline__description","timeline__header","timeline__item","timeline__item--last","timeline__marker","timeline__marker--","timeline__marker--dot","timeline__marker--error","timeline__marker--icon","timeline__marker--info","timeline__marker--neutral","timeline__marker--primary","timeline__marker--success","timeline__marker--warning","timeline__marker-dot","timeline__marker-node","timeline__rail","timeline__time","timeline__time-row","timeline__title","toast","toast--countdown","toast--with-icon","toast__close","toast__content","toast__description","toast__icon","toast__icon--error","toast__icon--info","toast__icon--loading","toast__icon--success","toast__icon--warning","toast__title","toggle","toggle--auto","toggle--default","toggle--in-","toggle--in-cloud","toggle--in-outline","toggle--in-segmented","toggle--md","toggle--outline","toggle--sm","toggle-checkbox","toggle-group","toggle-group--","toggle-group--cloud","toggle-group--outline","toggle-group--plain","toggle-group--segmented","toggle-group__item","toggle-group__item--auto","toggle-group__item--md","toggle-group__item--sm","toggle-radio","toggle-switch","tooltip","tooltip__arrow","tsx"]);

  // Catalog ownership (generated from release/catalog.json): class -> primitive/composite.
  // The editor is runtime-injected, so this metadata stays out of the closed-set HTML.
  var CATALOG_ITEMS = [{"l":"composite","n":"app-frame","t":"App frame · composite — prototype shell","c":["app-frame","app-frame--collapsed","app-frame__avatar","app-frame__brand","app-frame__col","app-frame__header","app-frame__main","app-frame__nav","app-frame__nav-item","app-frame__nav-item--active","app-frame__nav-label","app-frame__sidebar","app-frame__spacer"]},{"l":"composite","n":"chart","t":"Chart · composite","c":["chart","chart-empty","chart-empty__description","chart-empty__icon","chart-empty__title","chart-legend","chart-legend__item","chart-legend__item--off","chart-legend__item--toggle","chart-legend__swatch","chart-legend__swatch--line","chart-skeleton","chart-sparkline","chart-tooltip","chart-tooltip__header","chart-tooltip__indicator","chart-tooltip__indicator--dashed","chart-tooltip__indicator--line","chart-tooltip__name","chart-tooltip__row","chart-tooltip__total","chart-tooltip__value","chart__axis","chart__bar","chart__curve","chart__grid","chart__label","chart__series--dimmed","chart__series--filtered","chart__series--selected","chart__tick"]},{"l":"composite","n":"data-table","t":"Data table · composite","c":["card__content--flush","cell-2line","cell-2line__main","cell-2line__sub","cell-center","cell-chevron","cell-empty","cell-num","cell-right","cell-tags","col-select","data-table","data-table--compact","data-table--spacious","data-table--sticky-col","data-table--sticky-head","data-table--striped","is-clickable","row-actions","row-actions__inner","table-frame","table-frame--flush","table-scroll","th-sort","th-sort__icon--active","th-sort__icon--idle"]},{"l":"composite","n":"detail-header","t":"Detail header · composite","c":["detail-header","detail-header--sticky","detail-header__actions","detail-header__back","detail-header__bar","detail-header__chips","detail-header__logo","detail-header__main","detail-header__meta","detail-header__name","detail-header__tabs","detail-header__title","tabs__list--line"]},{"l":"composite","n":"diff","t":"Diff · composite","c":["diff","diff--inline","diff__arrow","diff__col","diff__col--new","diff__col--old","diff__label","diff__value"]},{"l":"composite","n":"empty-state","t":"Empty state · composite","c":["empty-state","empty-state__action","empty-state__description","empty-state__icon","empty-state__title"]},{"l":"composite","n":"feed-list","t":"Feed list · composite","c":["feed-item","feed-item--read","feed-item__actions","feed-item__body","feed-item__head","feed-item__icon","feed-item__icon--info","feed-item__icon--neutral","feed-item__icon--success","feed-item__icon--warning","feed-item__main","feed-item__time","feed-item__title","feed-item__trailing","feed-list"]},{"l":"composite","n":"kv-grid","t":"Key-value grid · composite","c":["kv-grid","kv-grid__row","kv-grid__row--full"]},{"l":"composite","n":"list-filter","t":"List filter family · composite","c":["applied-filters","applied-filters__label","condition-band","condition-band__spacer","condition-band__toolbar","filter-chip","filter-chip__remove","input","search-input","search-input__icon"]},{"l":"composite","n":"list-row","t":"List row · composite","c":["list-row","list-row--disabled","list-row--interactive","list-row--selected","list-row__actions","list-row__chevron","list-row__icon","list-row__main","list-row__sub","list-row__title","list-row__trailing","list-row__value","list-rows"]},{"l":"composite","n":"load-more","t":"Load more · composite","c":["load-more","load-more__end","load-more__progress","load-more__summary"]},{"l":"composite","n":"option-card","t":"Option card · composite","c":["option-card","option-card--radio","option-card--selected","option-card__body","option-card__check","option-card__desc","option-card__icon","option-card__input","option-card__title"]},{"l":"composite","n":"page-body","t":"Page body · composite","c":["page-body"]},{"l":"composite","n":"page-header","t":"Page header · composite","c":["page-header","page-header--sticky","page-header__actions","page-header__bar","page-header__count","page-header__description","page-header__heading","page-header__title","page-header__titles"]},{"l":"composite","n":"pagination","t":"Pagination · composite","c":["pagination","pagination__current","pagination__ellipsis","pagination__info","pagination__page","pagination__pages","pagination__rows","pagination__summary"]},{"l":"composite","n":"product-card","t":"Product card · composite","c":["btn","product-card","product-card--out-of-stock","product-card__add","product-card__body","product-card__cta","product-card__description","product-card__glyph","product-card__image","product-card__name","product-card__options","product-card__placeholder","product-card__price","product-card__price-row","product-card__ribbon","product-card__ribbon--info","product-card__ribbon--success","product-card__ribbon--warning","product-card__sku","product-grid"]},{"l":"composite","n":"rich-pagination","t":"Rich Pagination · composite","c":["rich-pagination","rich-pagination__left","rich-pagination__rows","rich-pagination__summary"]},{"l":"composite","n":"skeleton","t":"Skeleton · composite","c":["skeleton","skeleton--block","skeleton--circle","skeleton--line","skeleton--text","skeleton--title","skeleton-row"]},{"l":"composite","n":"stat-card","t":"Stat card · composite","c":["stat-card","stat-card--interactive","stat-card--selected","stat-card__delta","stat-card__delta--down","stat-card__delta--flat","stat-card__delta--up","stat-card__description","stat-card__head","stat-card__icon","stat-card__label","stat-card__value","stat-card__value--error","stat-card__value--info","stat-card__value--success","stat-card__value--warning","stat-grid","stat-grid--cols-2","stat-grid--cols-3","stat-grid--cols-4"]},{"l":"composite","n":"step-indicator","t":"Step Indicator · composite","c":["step","step--active","step--completed","step--upcoming","step-indicator","step__body","step__body--clickable","step__caption","step__connector","step__dot","step__text","step__title"]},{"l":"composite","n":"stepper","t":"Stepper · composite","c":["stepper","stepper__button","stepper__input"]},{"l":"composite","n":"summary-bar","t":"List summary bar · composite","c":["summary-bar","summary-bar--sticky","summary-bar__actions","summary-bar__count"]},{"l":"composite","n":"theme-toggle","t":"Theme Toggle · composite","c":["theme-toggle"]},{"l":"composite","n":"timeline","t":"Timeline · composite","c":["timeline","timeline--compact","timeline--stacked","timeline__actor","timeline__content","timeline__description","timeline__header","timeline__item","timeline__item--last","timeline__marker","timeline__marker--dot","timeline__marker--error","timeline__marker--icon","timeline__marker--info","timeline__marker--neutral","timeline__marker--primary","timeline__marker--success","timeline__marker--warning","timeline__marker-dot","timeline__marker-node","timeline__rail","timeline__time","timeline__time-row","timeline__title"]},{"l":"composite","n":"toggles","t":"Toggles · composite","c":["toggle-checkbox","toggle-radio","toggle-switch"]},{"l":"primitive","n":"accordion","t":"Accordion","c":["accordion","accordion__arrow","accordion__content","accordion__item","accordion__item--open","accordion__label","accordion__trigger"]},{"l":"primitive","n":"alert","t":"Alert","c":["alert","alert--default","alert--error","alert--info","alert--success","alert--warning","alert--with-icon","alert__action","alert__description","alert__icon","alert__title"]},{"l":"primitive","n":"alert-dialog","t":"Alert Dialog","c":["alert-dialog","alert-dialog-overlay","alert-dialog__description","alert-dialog__footer","alert-dialog__header","alert-dialog__title"]},{"l":"primitive","n":"aspect-ratio","t":"Aspect Ratio","c":["aspect-ratio"]},{"l":"primitive","n":"avatar","t":"Avatar","c":["avatar","avatar--lg","avatar--md","avatar--sm","avatar--xl","avatar-group","avatar__fallback","avatar__image"]},{"l":"primitive","n":"badge","t":"Badge","c":["badge","badge--default","badge--destructive","badge--error","badge--ghost","badge--info","badge--link","badge--neutral","badge--outline","badge--secondary","badge--success","badge--tag","badge--warning","badge__dot"]},{"l":"primitive","n":"breadcrumb","t":"Breadcrumb","c":["breadcrumb__ellipsis","breadcrumb__item","breadcrumb__link","breadcrumb__list","breadcrumb__page","breadcrumb__separator"]},{"l":"primitive","n":"button","t":"Button","c":["btn","btn--auto","btn--danger","btn--ghost","btn--ghost-danger","btn--icon","btn--icon-lg","btn--icon-sm","btn--icon-xs","btn--lg","btn--link","btn--md","btn--outline","btn--primary","btn--secondary","btn--sm","btn--soft","btn--tertiary","btn--xs"]},{"l":"primitive","n":"calendar","t":"Calendar","c":["calendar","calendar__caption","calendar__day","calendar__day--disabled","calendar__day--focused","calendar__day--hidden","calendar__day--outside","calendar__day--range-end","calendar__day--range-middle","calendar__day--range-start","calendar__day--selected","calendar__day--today","calendar__footer","calendar__grid","calendar__header","calendar__link","calendar__nav-btn","calendar__weekday"]},{"l":"primitive","n":"card","t":"Card","c":["card","card--collapsible","card--elevation-0","card--elevation-1","card--elevation-2","card--interactive","card--lg","card--md","card--sm","card__action","card__chevron","card__content","card__content--flush","card__description","card__footer","card__footer--flush","card__header","card__header--flush","card__title","card__toggle"]},{"l":"primitive","n":"carousel","t":"Carousel","c":["carousel","carousel--vertical","carousel__dot","carousel__dot--active","carousel__dots","carousel__item","carousel__nav","carousel__next","carousel__prev","carousel__track","carousel__viewport"]},{"l":"primitive","n":"checkbox","t":"Checkbox","c":["checkbox"]},{"l":"primitive","n":"collapsible","t":"Collapsible","c":["collapsible","collapsible__chevron","collapsible__content","collapsible__content--open","collapsible__trigger"]},{"l":"primitive","n":"combobox","t":"Combobox","c":["combobox__chevron","combobox__content","combobox__empty","combobox__input","combobox__item","combobox__item--highlighted","combobox__item--selected","combobox__item-indicator","combobox__list","combobox__search","combobox__trigger","combobox__trigger--sm","combobox__value","combobox__value--placeholder"]},{"l":"primitive","n":"command","t":"Command","c":["command","command-dialog","command-dialog__backdrop","command__empty","command__group","command__group-heading","command__input","command__input-wrapper","command__item","command__item--active","command__list","command__separator","command__shortcut","input-group"]},{"l":"primitive","n":"context-menu","t":"Context Menu","c":["context-menu__content","context-menu__indicator","context-menu__item","context-menu__item--checkbox","context-menu__item--destructive","context-menu__item--inset","context-menu__item--radio","context-menu__label","context-menu__label--inset","context-menu__separator","context-menu__shortcut","context-menu__sub-trigger","context-menu__sub-trigger--inset"]},{"l":"primitive","n":"date-picker","t":"Date Picker","c":["date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder"]},{"l":"primitive","n":"date-range-picker","t":"Date Range Picker","c":["date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder"]},{"l":"primitive","n":"date-time-picker","t":"Date Time Picker","c":["date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder"]},{"l":"primitive","n":"date-time-range-picker","t":"Date Time Range Picker","c":["date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder"]},{"l":"primitive","n":"drawer","t":"Drawer","c":["drawer","drawer--bottom","drawer--left","drawer--right","drawer--top","drawer-overlay","drawer__description","drawer__footer","drawer__handle","drawer__header","drawer__title"]},{"l":"primitive","n":"dropdown-menu","t":"Dropdown Menu","c":["dropdown-menu","dropdown-menu__checkbox-item","dropdown-menu__checkbox-item--active","dropdown-menu__item","dropdown-menu__item--active","dropdown-menu__item--destructive","dropdown-menu__item--inset","dropdown-menu__item-indicator","dropdown-menu__label","dropdown-menu__label--inset","dropdown-menu__radio-item","dropdown-menu__radio-item--active","dropdown-menu__separator","dropdown-menu__shortcut","dropdown-menu__sub-content","dropdown-menu__sub-trigger","dropdown-menu__sub-trigger--inset","dropdown-menu__sub-trigger--open","dropdown-menu__sub-trigger__chevron"]},{"l":"primitive","n":"dropzone","t":"Dropzone","c":["dropzone","dropzone--disabled","dropzone--drag","file-list","file-row","file-row__body","file-row__error","file-row__icon","file-row__name","file-row__name-row","file-row__size","file-row__status","file-row__status--done","file-row__status--error"]},{"l":"primitive","n":"field","t":"Field","c":["field","field__error","field__hint","field__required"]},{"l":"primitive","n":"hover-card","t":"Hover Card","c":["hover-card"]},{"l":"primitive","n":"input","t":"Input","c":["input","input--filled","input--lg","input--md","input--ok","input--sm","input--warn"]},{"l":"primitive","n":"input-group","t":"Input Group","c":["input-group","input-group--block","input-group--disabled","input-group--invalid","input-group__addon","input-group__addon--block-end","input-group__addon--block-start","input-group__addon--inline-end","input-group__addon--inline-start","input-group__control","input-group__text"]},{"l":"primitive","n":"input-otp","t":"InputOTP","c":["input-otp","input-otp__caret","input-otp__group","input-otp__separator","input-otp__slot","input-otp__slot--active","label","label--disabled"]},{"l":"primitive","n":"label","t":"Label","c":["label","label--disabled"]},{"l":"primitive","n":"modal","t":"Modal","c":["modal","modal--fullscreen","modal--lg","modal--md","modal--sm","modal--xl","modal-overlay","modal__body","modal__close","modal__description","modal__footer","modal__header","modal__heading","modal__title"]},{"l":"primitive","n":"object-tile","t":"Object Tile","c":["object-tile","object-tile--cat-1","object-tile--cat-2","object-tile--cat-3","object-tile--cat-4","object-tile--cat-5","object-tile--cat-6","object-tile--lg","object-tile--md","object-tile--neutral","object-tile--sm","object-tile__icon"]},{"l":"primitive","n":"popover","t":"Popover","c":["menu-item","menu-item--destructive","popover","popover__description","popover__header","popover__title"]},{"l":"primitive","n":"progress","t":"Progress","c":["progress","progress__indicator","progress__indicator--error","progress__indicator--info","progress__indicator--success","progress__indicator--warning","progress__label","progress__track","progress__value"]},{"l":"primitive","n":"radio-group","t":"Radio Group","c":["radio"]},{"l":"primitive","n":"resizable","t":"Resizable","c":["resizable-group","resizable-group--vertical","resizable-handle","resizable-handle--horizontal","resizable-handle__grip","resizable-panel"]},{"l":"primitive","n":"scroll-area","t":"Scroll Area","c":["scroll-area","scroll-area__scrollbar","scroll-area__thumb","scroll-area__viewport"]},{"l":"primitive","n":"select","t":"Select","c":["select","select--sm"]},{"l":"primitive","n":"separator","t":"Separator","c":["separator","separator--vertical","separator-labeled","separator-labeled__label"]},{"l":"primitive","n":"sheet","t":"Sheet","c":["sheet","sheet--bottom","sheet--left","sheet--right","sheet--top","sheet-overlay","sheet__close","sheet__description","sheet__footer","sheet__header","sheet__title"]},{"l":"primitive","n":"slider","t":"Slider","c":["slider","slider--vertical","slider__indicator","slider__thumb","slider__track"]},{"l":"primitive","n":"spinner","t":"Spinner","c":["spinner","spinner--lg","spinner--md","spinner--sm","spinner--xl"]},{"l":"primitive","n":"switch","t":"Switch","c":["switch","switch--sm","switch__thumb"]},{"l":"primitive","n":"tabs","t":"Tabs","c":["tabs","tabs__content","tabs__list","tabs__list--default","tabs__list--line","tabs__trigger","tabs__trigger--active"]},{"l":"primitive","n":"textarea","t":"Textarea","c":["textarea"]},{"l":"primitive","n":"toast","t":"Toast","c":["toast","toast--countdown","toast--with-icon","toast__close","toast__content","toast__description","toast__icon","toast__icon--error","toast__icon--info","toast__icon--loading","toast__icon--success","toast__icon--warning","toast__title"]},{"l":"primitive","n":"toggle","t":"Toggle","c":["toggle","toggle--auto","toggle--default","toggle--in-cloud","toggle--in-outline","toggle--in-segmented","toggle--md","toggle--outline","toggle--sm","toggle-group--cloud","toggle-group--outline","toggle-group--plain","toggle-group--segmented"]},{"l":"primitive","n":"toggle-group","t":"Toggle Group","c":["toggle-group","toggle-group--cloud","toggle-group--outline","toggle-group--plain","toggle-group--segmented","toggle-group__item","toggle-group__item--auto","toggle-group__item--md","toggle-group__item--sm","tooltip","tooltip__arrow"]},{"l":"primitive","n":"tooltip","t":"Tooltip","c":["tooltip","tooltip__arrow"]}];
  var CLASS_OWNERS = {};
  CATALOG_ITEMS.forEach(function (item) {
    item.c.forEach(function (cls) {
      FOUNDATION.add(cls);
      var owners = CLASS_OWNERS[cls] || (CLASS_OWNERS[cls] = []);
      owners.push({ layer: item.l, name: item.n, title: item.t });
    });
  });

  function ownerKey(owner) { return owner ? owner.layer + ':' + owner.name : ''; }
  function ownerLabel(owner) {
    if (!owner) return '';
    return (owner.layer === 'composite' ? 'Composite ' : 'Primitive ') + owner.name;
  }
  function classOwnerScore(cls, owner) {
    if (!owner) return 0;
    var name = owner.name;
    if (cls === name) return 100;
    if (cls.indexOf(name + '__') === 0 || cls.indexOf(name + '--') === 0 || cls.indexOf(name + '-') === 0) return 90;
    if (name === 'button' && (cls === 'btn' || cls.indexOf('btn--') === 0)) return 95;
    return 0;
  }
  function ownersForClass(cls, layer) {
    var owners = (CLASS_OWNERS[cls] || []).filter(function (owner) { return !layer || owner.layer === layer; });
    owners.sort(function (a, b) {
      var score = classOwnerScore(cls, b) - classOwnerScore(cls, a);
      if (score) return score;
      if (a.layer !== b.layer) return a.layer === 'composite' ? -1 : 1;
      return a.name < b.name ? -1 : 1;
    });
    return owners;
  }
  function primaryOwnerForClass(cls, layer) {
    return ownersForClass(cls, layer)[0] || null;
  }
  function isWeakCompositeOwner(cls, owner) {
    if (!owner || owner.layer !== 'composite' || classOwnerScore(cls, owner) > 0) return false;
    var primitive = primaryOwnerForClass(cls, 'primitive');
    return !!(primitive && classOwnerScore(cls, primitive) >= 90);
  }
  function ownersForElement(el, layer) {
    var byKey = {};
    foundationClasses(el).forEach(function (cls) {
      ownersForClass(cls, layer).forEach(function (owner) {
        if (isWeakCompositeOwner(cls, owner)) return;
        var key = ownerKey(owner);
        if (!byKey[key]) byKey[key] = { layer: owner.layer, name: owner.name, title: owner.title, classes: [] };
        byKey[key].classes.push(cls);
      });
    });
    return Object.keys(byKey).map(function (key) { return byKey[key]; }).sort(function (a, b) {
      if (a.layer !== b.layer) return a.layer === 'composite' ? -1 : 1;
      return a.name < b.name ? -1 : 1;
    });
  }
  function nearestCompositeForElement(el) {
    var cur = el;
    while (cur && cur.nodeType === 1 && selectable(cur)) {
      var owners = ownersForElement(cur, 'composite');
      if (owners.length) return owners[0];
      cur = cur.parentElement;
    }
    return null;
  }
  function ownerMetaForChange(el, cls) {
    var classOwner = primaryOwnerForClass(cls, null);
    var composite = classOwner && classOwner.layer === 'composite' ? classOwner : nearestCompositeForElement(el);
    return {
      ownerLayer: classOwner ? classOwner.layer : '',
      ownerName: classOwner ? classOwner.name : '',
      ownerTitle: classOwner ? classOwner.title : '',
      ownerClass: cls || '',
      compositeName: composite ? composite.name : '',
      compositeTitle: composite ? composite.title : '',
    };
  }
  function changeName(selector, prop, meta) {
    meta = meta || {};
    var parts = [];
    if (meta.compositeName) parts.push('Composite ' + meta.compositeName);
    if (meta.ownerName && meta.ownerName !== meta.compositeName) {
      parts.push((meta.ownerLayer === 'primitive' ? 'Primitive ' : 'Composite ') + meta.ownerName);
    }
    if (!parts.length) parts.push('Class');
    return parts.join(' · ') + ' · ' + selector + ' ' + prop;
  }

  // Properties we let users theme (intersected with what each class actually declares).
  var THEME_PROPS = [
    'background-color', 'background', 'color', 'border-color', 'border', 'border-width',
    'border-radius', 'box-shadow',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-block', 'padding-inline',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-block', 'margin-inline',
    'gap', 'row-gap', 'column-gap', 'font-size', 'font-weight', 'line-height', 'font-family', 'opacity'
  ];
  var THEME_SET = new Set(THEME_PROPS);
  var ORDER = [
    'background-color', 'background', 'color', 'border-color', 'border', 'border-width', 'border-radius', 'box-shadow',
    'padding', 'padding-block', 'padding-inline', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin', 'margin-block', 'margin-inline', 'gap', 'row-gap', 'column-gap',
    'font-size', 'font-weight', 'line-height', 'font-family', 'opacity'
  ];

  var PAGE_KEY = 'tomsedit:' + (location.pathname.split('/').pop() || 'index');

  // ───────────────── read tokens + per-class declared props from CSSOM ─────────────────
  var tokens = {};       // --name -> value
  var classDecl = {};    // class -> { prop: declaredValue }  (themeable props only)

  function readCSS() {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { rules = null; }
      if (rules) walk(rules);
    }
  }
  function walk(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.cssRules) walk(r.cssRules);
      if (!r.style) continue;
      var st = r.style, j, p;
      for (j = 0; j < st.length; j++) {
        p = st[j];
        if (p.charAt(0) === '-' && p.charAt(1) === '-' && !(p in tokens)) tokens[p] = st.getPropertyValue(p).trim();
      }
      var sel = r.selectorText;
      if (!sel) continue;
      var parts = sel.split(',');
      for (var k = 0; k < parts.length; k++) {
        var mm = /^\.([-A-Za-z0-9_]+)$/.exec(parts[k].trim());
        if (!mm) continue;
        var d = classDecl[mm[1]] || (classDecl[mm[1]] = {});
        collectDecls(st.cssText, d);
      }
    }
  }
  // Parse declarations from cssText, NOT the style[i] longhand list: browsers expand a
  // shorthand set to var(…) (e.g. `border-radius: var(--radius-md)`) into EMPTY longhands,
  // so the authored, tokenized declaration only survives in cssText. Editable = any
  // property whose value uses a token (var(--…)), plus the common themeable props.
  function collectDecls(cssText, d) {
    var decls = (cssText || '').split(';');
    for (var i = 0; i < decls.length; i++) {
      var idx = decls[i].indexOf(':');
      if (idx < 0) continue;
      var prop = decls[i].slice(0, idx).trim();
      if (!prop || (prop.charAt(0) === '-' && prop.charAt(1) === '-')) continue;
      var val = decls[i].slice(idx + 1).trim();
      if (val.indexOf('var(') !== -1 || THEME_SET.has(prop)) d[prop] = val;
    }
  }

  function tokenList(prefix) {
    var out = [];
    for (var n in tokens) if (n.indexOf(prefix) === 0) out.push(n);
    out.sort(function (a, b) {
      var na = parseFloat(a.replace(/[^0-9.]/g, '')), nb = parseFloat(b.replace(/[^0-9.]/g, ''));
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return a < b ? -1 : 1;
    });
    return out;
  }
  function isColorProp(prop) { return /color$/.test(prop) || prop === 'background' || prop === 'fill' || prop === 'stroke'; }
  // Token family ("--space-", "--color-", …) from a value that uses var(--…).
  function tokenFamilyOf(value) {
    var m = value && /var\(\s*(--[A-Za-z0-9]+-)/.exec(value);
    return m ? m[1] : null;
  }
  function optionsFor(prop, currentValue) {
    // Prefer the family of the token the design system already uses for this property;
    // fall back to a sensible family by property name.
    var fam = tokenFamilyOf(currentValue);
    if (!fam) {
      if (isColorProp(prop)) fam = '--color-';
      else if (/^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)/.test(prop)) fam = '--space-';
      else if (prop === 'border-radius') fam = '--radius-';
      else if (prop === 'font-size') fam = '--text-';
      else if (prop === 'box-shadow') fam = '--shadow-';
      else if (prop === 'font-family') fam = '--font-';
    }
    var opts = fam ? tokenList(fam).map(function (n) { return { label: n.replace(/^--/, ''), value: 'var(' + n + ')' }; }) : [];
    if (prop === 'font-weight' && !opts.length) opts = [400, 500, 600, 700].map(function (w) { return { label: String(w), value: String(w) }; });
    return opts;
  }

  // ───────────────── element path (stable id for draft + save payload) ─────────────────
  function pathOf(el) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      var par = el.parentNode; if (!par) break;
      parts.unshift(Array.prototype.indexOf.call(par.children, el));
      el = par;
    }
    return parts.join('.');
  }
  function elByPath(path) {
    var el = document.documentElement, a = path.split('.');
    for (var i = 0; i < a.length; i++) { if (!el) return null; el = el.children[+a[i]]; }
    return el || null;
  }

  // ───────────────── store ─────────────────
  var store = {};
  function loadStore() { return {}; }
  function saveStore() {}
  function applyElementStore() {
    for (var path in store) {
      var el = elByPath(path); if (!el) continue;
      for (var p in store[path]) el.style.setProperty(p, store[path][p]);
    }
  }
  function applyStored() {
    store = loadStore();
    applyElementStore();
  }

  // ───────────────── global tokens (edit :root → every var(--…) updates) ─────────────────
  // Shared across all pages (design tokens are global), kept as an in-memory draft,
  // then baked into saved versions / exported JSON.
  var TOKEN_KEY = 'tomsedit:tokens';
  var tokenStore = {};
  var TOKEN_GROUPS = [
    { key: '--color-', label: '颜色 Color' },
    { key: '--space-', label: '间距 Space' },
    { key: '--spacing-', label: '间距·控件 Spacing' },
    { key: '--radius-', label: '圆角 Radius' },
    { key: '--text-', label: '字号 Text' },
    { key: '--font-', label: '字体 Font' },
    { key: '--shadow-', label: '阴影 Shadow' },
    { key: '--duration-', label: '时长 Duration' },
    { key: '--ease-', label: '缓动 Ease' },
    { key: '--container-', label: '容器 Container' },
    { key: '--breakpoint-', label: '断点 Breakpoint' },
  ];
  function loadTokenStore() { return {}; }
  function saveTokenStore() {}
  function applyTokenStore() {
    for (var n in tokenStore) document.documentElement.style.setProperty(n, tokenStore[n]);
  }
  function applyTokens() {
    tokenStore = loadTokenStore();
    applyTokenStore();
  }
  function clearDraftOverrides() {
    for (var n in tokenStore) document.documentElement.style.removeProperty(n);
    tokenStore = {};
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    for (var path in store) {
      var el = elByPath(path);
      if (!el) continue;
      for (var p in store[path]) el.style.removeProperty(p);
    }
    store = {};
    try { localStorage.removeItem(PAGE_KEY); } catch (e) {}
    if (panel) panel.style.display = 'none';
    if (tpanel && tpanel.style.display !== 'none') renderTokenPanel();
  }
  function clearLegacyDraftStorage() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PAGE_KEY);
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('tomsedit:') === 0) keys.push(key);
      }
      keys.forEach(function (key) { localStorage.removeItem(key); });
    } catch (e) {}
  }
  function applyToken(name, value) {
    document.documentElement.style.setProperty(name, value);
    tokenStore[name] = value; saveTokenStore();
  }
  function resetTokens() {
    if (!window.confirm('清空所有全局 token 改动?')) return;
    for (var n in tokenStore) document.documentElement.style.removeProperty(n);
    tokenStore = {}; saveTokenStore(); renderTokenPanel();
  }
  function tokenSort(a, b) {
    var na = parseFloat(a.replace(/[^0-9.]/g, '')), nb = parseFloat(b.replace(/[^0-9.]/g, ''));
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    return a < b ? -1 : 1;
  }
  function toHex(v) {
    if (!v) return null;
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).replace(/(.)/g, '$1$1');
    var resolved = v;
    try { // resolve var(--…) / named colors via a probe element
      var d = document.createElement('span'); d.setAttribute('data-editor', '');
      d.style.color = v; document.body.appendChild(d);
      var cs = getComputedStyle(d).color; document.body.removeChild(d);
      if (cs) resolved = cs;
    } catch (e) {}
    try { // paint the color and read the rendered pixel — works for oklch/lab/rgb regardless
      var cv = document.createElement('canvas'); cv.width = cv.height = 1;
      var ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = resolved;
      ctx.fillRect(0, 0, 1, 1);
      var p = ctx.getImageData(0, 0, 1, 1).data;
      if (p[3] === 0) return null; // color not painted → unsupported value
      return '#' + [p[0], p[1], p[2]].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    } catch (e) {}
    return null;
  }
  // sRGB (0..255) → OKLCH {L:0..100, C:~0..0.4, H:0..360}
  function srgbToOklch(r, g, b) {
    function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    var R = lin(r), G = lin(g), B = lin(b);
    var l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    var m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    var s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    var a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    var bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    var C = Math.sqrt(a * a + bb * bb);
    var H = Math.atan2(bb, a) * 180 / Math.PI; if (H < 0) H += 360;
    return { L: L * 100, C: C, H: H };
  }
  // parse a token color value (oklch / hex / rgb / var(--…)) → {L,C,H}
  function parseOklch(value) {
    var m = /oklch\(\s*([\d.]+)(%?)\s+([\-\d.]+)\s+([\-\d.]+)/i.exec(value || '');
    if (m) { var L = parseFloat(m[1]); if (!m[2]) L *= 100; return { L: L, C: parseFloat(m[3]), H: parseFloat(m[4]) }; }
    var hex = toHex(value);
    if (!hex) return { L: 50, C: 0, H: 0 };
    return srgbToOklch(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));
  }
  function oklchStr(L, C, H) { return 'oklch(' + L.toFixed(1) + '% ' + C.toFixed(3) + ' ' + H.toFixed(1) + ')'; }

  var tpanel = null, toverlay = null;
  function closeTokenPanel() { if (tpanel) tpanel.style.display = 'none'; if (toverlay) toverlay.style.display = 'none'; }
  function openTokenPanel() {
    if (tpanel && tpanel.style.display !== 'none') { closeTokenPanel(); return; }
    if (!toverlay) { toverlay = div('se-toverlay'); toverlay.onclick = closeTokenPanel; document.body.appendChild(toverlay); }
    if (!tpanel) { tpanel = div('se-tpanel'); document.body.appendChild(tpanel); }
    toverlay.style.display = 'block';
    renderTokenPanel();
  }
  function tokenRow(name) {
    var row = div('se-row'); row.setAttribute('data-token', name.toLowerCase());
    var lbl = div('se-row__lbl'); lbl.textContent = name; row.appendChild(lbl);
    var ctl = div('se-ctl');
    var cur = (name in tokenStore) ? tokenStore[name] : (tokens[name] || '');
    if (name.indexOf('--color-') === 0) {
      // color tokens: choose via the OKLCH picker only (no free text); value is applied as oklch()
      var sw = div('se-sw'); sw.style.background = cur; sw.title = '点击用取色器选择 (OKLCH)';
      var val = div('se-tval'); val.textContent = cur;
      sw.onclick = function () { openColorPicker(name, sw, val); };
      ctl.appendChild(sw); ctl.appendChild(val);
    } else {
      var txt = document.createElement('input'); txt.type = 'text'; txt.setAttribute('data-editor', ''); txt.value = cur;
      txt.oninput = function () { applyToken(name, txt.value); };
      ctl.appendChild(txt);
    }
    row.appendChild(ctl);
    return row;
  }

  // ─── OKLCH color picker (popover with L / C / H sliders) ───
  var cpick = null, cpickSw = null, cpickVal = null, cpickName = null, cpickDoc = null;
  function closePicker() {
    if (cpick) cpick.style.display = 'none';
    if (cpickDoc) { document.removeEventListener('mousedown', cpickDoc, true); cpickDoc = null; }
  }
  function positionCpick(anchor) {
    var r = anchor.getBoundingClientRect();
    var w = 248, h = cpick.offsetHeight || 200;
    var left = r.right + 8; if (left + w > window.innerWidth - 8) left = r.left - w - 8; if (left < 8) left = 8;
    var top = r.top; if (top + h > window.innerHeight - 8) top = window.innerHeight - h - 8; if (top < 8) top = 8;
    cpick.style.left = left + 'px'; cpick.style.top = top + 'px';
  }
  function openColorPicker(name, swEl, valEl) {
    cpickName = name; cpickSw = swEl; cpickVal = valEl;
    if (!cpick) { cpick = div('se-cpick'); document.body.appendChild(cpick); }
    var cur = (name in tokenStore) ? tokenStore[name] : (tokens[name] || '');
    var o = parseOklch(cur);
    cpick.innerHTML = '';
    var hd = div('se-cpick__hd');
    var t = div('se-cpick__name'); t.textContent = name; hd.appendChild(t);
    var x = document.createElement('button'); x.className = 'se-x'; x.setAttribute('data-editor', ''); x.textContent = '×'; x.onclick = closePicker; hd.appendChild(x);
    cpick.appendChild(hd);
    var prev = div('se-cpick__preview'); prev.style.background = cur || oklchStr(o.L, o.C, o.H); cpick.appendChild(prev);
    function mkRow(label, min, max, step, v) {
      var w = div('se-cpick__row');
      var lab = document.createElement('span'); lab.className = 'se-cpick__lbl'; lab.setAttribute('data-editor', ''); lab.textContent = label;
      var input = document.createElement('input'); input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = v; input.setAttribute('data-editor', '');
      var out = document.createElement('span'); out.className = 'se-cpick__num'; out.setAttribute('data-editor', '');
      w.appendChild(lab); w.appendChild(input); w.appendChild(out);
      return { w: w, input: input, out: out };
    }
    var sL = mkRow('L', 0, 100, 0.5, o.L), sC = mkRow('C', 0, 0.4, 0.005, o.C), sH = mkRow('H', 0, 360, 1, o.H);
    function apply() {
      var L = +sL.input.value, C = +sC.input.value, H = +sH.input.value;
      sL.out.textContent = L.toFixed(1) + '%'; sC.out.textContent = C.toFixed(3); sH.out.textContent = H.toFixed(0);
      var str = oklchStr(L, C, H);
      prev.style.background = str;
      applyToken(cpickName, str);
      if (cpickSw) cpickSw.style.background = str;
      if (cpickVal) cpickVal.textContent = str;
    }
    sL.input.oninput = apply; sC.input.oninput = apply; sH.input.oninput = apply;
    sL.out.textContent = o.L.toFixed(1) + '%'; sC.out.textContent = o.C.toFixed(3); sH.out.textContent = o.H.toFixed(0);
    cpick.appendChild(sL.w); cpick.appendChild(sC.w); cpick.appendChild(sH.w);
    cpick.style.display = 'block';
    positionCpick(swEl);
    cpickDoc = function (e) { if (!cpick.contains(e.target) && e.target !== swEl && !swEl.contains(e.target)) closePicker(); };
    setTimeout(function () { document.addEventListener('mousedown', cpickDoc, true); }, 0);
  }
  function renderTokenPanel() {
    if (!tpanel) return;
    tpanel.innerHTML = '';
    tpanel.style.display = 'flex';
    var hd = div('se-hd');
    var t = div('se-title'); t.textContent = '全局 Token'; hd.appendChild(t);
    var x = document.createElement('button'); x.className = 'se-x'; x.setAttribute('data-editor', ''); x.textContent = '×';
    x.onclick = closeTokenPanel;
    hd.appendChild(x); tpanel.appendChild(hd);

    var sb = div('se-tsearch');
    var search = document.createElement('input'); search.type = 'search'; search.setAttribute('data-editor', ''); search.placeholder = '搜索 token…';
    sb.appendChild(search); tpanel.appendChild(sb);

    var body = div('se-tbody');
    TOKEN_GROUPS.forEach(function (g) {
      var names = Object.keys(tokens).filter(function (n) { return n.indexOf(g.key) === 0; }).sort(tokenSort);
      if (!names.length) return;
      var gh = div('se-tgroup'); gh.setAttribute('data-group', ''); gh.textContent = g.label + ' · ' + names.length;
      body.appendChild(gh);
      names.forEach(function (n) { body.appendChild(tokenRow(n)); });
    });
    tpanel.appendChild(body);

    var ft = div('se-tfoot'); ft.appendChild(mkbtn('重置全部 token', resetTokens)); tpanel.appendChild(ft);

    search.oninput = function () {
      var q = search.value.trim().toLowerCase();
      body.querySelectorAll('[data-token]').forEach(function (r) {
        r.style.display = (!q || r.getAttribute('data-token').indexOf(q) >= 0) ? '' : 'none';
      });
      body.querySelectorAll('[data-group]').forEach(function (gh) {
        var sib = gh.nextElementSibling, any = false;
        while (sib && !sib.hasAttribute('data-group')) { if (sib.style.display !== 'none') { any = true; break; } sib = sib.nextElementSibling; }
        gh.style.display = any ? '' : 'none';
      });
    };
  }

  // ───────────────── selection helpers ─────────────────
  function isEditorNode(el) { return !!(el && el.closest && el.closest('[data-editor]')); }
  // Only page content (inside .app-frame__main) is editable; the app chrome
  // (sidebar + top header) is off-limits. If there's no frame, everything is fair game.
  var mainEl = null;
  function selectable(el) { return mainEl ? (el !== mainEl && mainEl.contains(el)) : true; }
  function foundationClasses(el) {
    var out = [];
    // skip state/utility classes (is-clickable, is-active, has-…) — they carry no
    // themeable styles and just get in the way of selecting the real component.
    if (el && el.classList) el.classList.forEach(function (c) {
      if (FOUNDATION.has(c) && !/^(is|has)-/.test(c)) out.push(c);
    });
    return out;
  }
  function nearestFoundation(el) {
    while (el && el.nodeType === 1) {
      if (!isEditorNode(el) && selectable(el) && foundationClasses(el).length) return el;
      el = el.parentElement;
    }
    return null;
  }
  function ancestorsFoundation(el) {
    var out = [], cur = el ? el.parentElement : null;
    while (cur) { if (!isEditorNode(cur) && selectable(cur) && foundationClasses(cur).length) out.push(cur); cur = cur.parentElement; }
    return out;
  }

  // ───────────────── state + DOM helpers ─────────────────
  var editing = false, selected = null, hoverEl = null, bar = null, panel = null;
  function div(cls) { var d = document.createElement('div'); if (cls) d.className = cls; d.setAttribute('data-editor', ''); return d; }
  function mkbtn(label, fn, extraCls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'se-btn' + (extraCls ? ' ' + extraCls : '');
    b.textContent = label;
    b.setAttribute('data-editor', '');
    b.onclick = fn;
    return b;
  }

  function injectStyle() {
    var css = [
      '.se-hover{outline:2px dashed var(--color-info,#2563eb)!important;outline-offset:1px;cursor:pointer!important;}',
      '.se-selected{outline:2px solid var(--color-primary-500,#2563eb)!important;outline-offset:1px;}',
      '.se-bar{position:fixed;right:16px;bottom:16px;z-index:2147483646;display:flex;flex-direction:column;gap:8px;align-items:flex-end;font-family:var(--font-sans,system-ui,sans-serif);}',
      '.se-bar__row{display:flex;gap:6px;}',
      '.se-btn{font:inherit;font-size:13px;padding:6px 10px;border-radius:8px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-1,#fff);color:var(--color-content-primary,#18181b);cursor:pointer;box-shadow:var(--shadow-2,0 1px 3px rgba(0,0,0,.15));}',
      '.se-btn:hover{background:var(--color-surface-hover,#f4f4f5);}',
      '.se-btn:disabled{opacity:.56;cursor:not-allowed;}',
      '.se-btn--on{background:var(--color-primary-500,#2563eb);color:var(--color-content-on-primary,#fff);border-color:transparent;}',
      '.se-btn--on:hover{background:var(--color-primary-600,var(--color-primary-500,#2563eb));color:var(--color-content-on-primary,#fff);}',
      '.se-btn--primary{background:var(--color-primary-500,#2563eb);color:var(--color-content-on-primary,#fff);border-color:transparent;}',
      '.se-btn--primary:hover{background:var(--color-primary-600,var(--color-primary-500,#2563eb));}',
      '.se-btn--ghost{background:transparent;box-shadow:none;}',
      '.se-btn--ghost:hover{background:var(--color-surface-hover,#f4f4f5);}',
      '.se-version{display:flex;align-items:center;gap:6px;margin-inline-start:var(--space-2);font-family:var(--font-sans,system-ui,sans-serif);}',
      '.se-version__label{font-size:12px;color:var(--color-content-secondary,#71717a);}',
      '.se-version select{min-width:96px;font:inherit;font-size:12px;padding:5px 28px 5px 8px;border-radius:8px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-1,#fff);color:var(--color-content-primary,#18181b);}',
      '.se-version .se-btn{box-shadow:none;}',
      '.se-version__status{font-size:11px;color:var(--color-content-tertiary,#a1a1aa);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.se-version-loading{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(15,23,42,.36);backdrop-filter:blur(5px);font-family:var(--font-sans,system-ui,sans-serif);color:var(--color-content-primary,#18181b);}',
      '.se-version-loading[data-open="true"]{display:flex;}',
      '.se-version-loading__box{display:flex;flex-direction:column;align-items:center;gap:10px;min-width:220px;padding:18px 22px;border:1px solid var(--color-line-default,#d4d4d8);border-radius:14px;background:var(--color-surface-1,#fff);box-shadow:0 24px 70px rgba(15,23,42,.22);}',
      '.se-version-loading__box .se-save-spinner{width:28px;height:28px;border-width:3px;}',
      '.se-version-loading__title{font-size:14px;font-weight:700;}',
      '.se-version-loading__desc{font-size:12px;color:var(--color-content-secondary,#71717a);}',
      '.se-save-overlay{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(15,23,42,.42);backdrop-filter:blur(6px);font-family:var(--font-sans,system-ui,sans-serif);}',
      '.se-save-overlay[data-open="true"]{display:flex;}',
      '.se-save-modal{width:min(640px,calc(100vw - 32px));max-height:min(760px,calc(100vh - 48px));display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--color-line-default,#d4d4d8);border-radius:16px;background:var(--color-surface-1,#fff);box-shadow:0 24px 70px rgba(15,23,42,.24);color:var(--color-content-primary,#18181b);}',
      '.se-save-modal__hero{display:flex;gap:14px;align-items:flex-start;padding:18px 20px 16px;border-bottom:1px solid var(--color-line-subtle,#e4e4e7);background:linear-gradient(180deg,var(--color-surface-2,#fafafa),var(--color-surface-1,#fff));}',
      '.se-save-modal__icon{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border-radius:12px;background:var(--color-primary-50,#eff6ff);color:var(--color-primary-700,#1d4ed8);font-weight:700;}',
      '.se-save-modal__title{margin:0;font-size:16px;font-weight:700;letter-spacing:0;color:var(--color-content-primary,#18181b);}',
      '.se-save-modal__desc{margin:4px 0 0;font-size:13px;line-height:1.5;color:var(--color-content-secondary,#71717a);}',
      '.se-save-modal__body{padding:16px 20px;overflow:auto;display:flex;flex-direction:column;gap:14px;}',
      '.se-save-modal__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}',
      '.se-save-stat{border:1px solid var(--color-line-subtle,#e4e4e7);border-radius:10px;background:var(--color-surface-2,#fafafa);padding:10px 12px;}',
      '.se-save-stat__label{font-size:11px;color:var(--color-content-tertiary,#a1a1aa);}',
      '.se-save-stat__value{margin-top:3px;font-family:var(--font-mono,monospace);font-size:18px;font-weight:700;color:var(--color-content-primary,#18181b);}',
      '.se-save-callout{border:1px solid var(--color-warning-500,#f59e0b);border-radius:10px;background:var(--color-warning-bg,#fffbeb);color:var(--color-warning-strong,#92400e);padding:10px 12px;font-size:12px;line-height:1.45;}',
      '.se-save-section__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}',
      '.se-save-section__title{font-size:12px;font-weight:700;color:var(--color-content-primary,#18181b);}',
      '.se-save-section__hint{font-size:11px;color:var(--color-content-tertiary,#a1a1aa);}',
      '.se-save-list{border:1px solid var(--color-line-subtle,#e4e4e7);border-radius:10px;overflow:hidden;background:var(--color-surface-1,#fff);}',
      '.se-save-row{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center;padding:9px 12px;border-top:1px solid var(--color-line-subtle,#e4e4e7);font-size:12px;}',
      '.se-save-row:first-child{border-top:0;}',
      '.se-save-row--preview{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);}',
      '.se-save-row__name{font-family:var(--font-mono,monospace);color:var(--color-content-primary,#18181b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.se-save-row__value{font-family:var(--font-mono,monospace);color:var(--color-content-secondary,#71717a);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.se-save-row__arrow{color:var(--color-content-tertiary,#a1a1aa);}',
      '.se-save-empty{border:1px dashed var(--color-line-default,#d4d4d8);border-radius:10px;padding:18px;text-align:center;font-size:13px;color:var(--color-content-secondary,#71717a);background:var(--color-surface-2,#fafafa);}',
      '.se-save-modal__footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid var(--color-line-subtle,#e4e4e7);background:var(--color-surface-2,#fafafa);}',
      '.se-save-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--color-line-default,#d4d4d8);border-top-color:var(--color-primary-600,#2563eb);animation:seSpin .8s linear infinite;}',
      '@keyframes seSpin{to{transform:rotate(360deg);}}',
      '@media (max-width:560px){.se-save-modal__stats{grid-template-columns:1fr}.se-save-row{grid-template-columns:minmax(0,1fr);gap:4px}.se-save-row__arrow{display:none}.se-save-modal__footer{flex-wrap:wrap}.se-save-modal__footer .se-btn{flex:1 1 auto;}}',
      '.se-panel{position:fixed;z-index:2147483647;width:300px;max-height:72vh;overflow:auto;background:var(--color-surface-1,#fff);border:1px solid var(--color-line-default,#d4d4d8);border-radius:12px;box-shadow:var(--shadow-4,0 8px 30px rgba(0,0,0,.2));font-family:var(--font-sans,system-ui,sans-serif);font-size:13px;color:var(--color-content-primary,#18181b);}',
      '.se-hd{position:sticky;top:0;background:var(--color-surface-2,#fafafa);border-bottom:1px solid var(--color-line-subtle,#e4e4e7);padding:10px 12px;display:flex;align-items:center;gap:8px;justify-content:space-between;}',
      '.se-title{font-weight:600;font-size:12px;word-break:break-all;font-family:var(--font-mono,monospace);}',
      '.se-x{border:0;background:transparent;font-size:18px;line-height:1;cursor:pointer;color:var(--color-content-secondary,#71717a);padding:0 2px;}',
      '.se-meta{padding:8px 12px;border-bottom:1px solid var(--color-line-subtle,#e4e4e7);display:flex;flex-direction:column;gap:6px;}',
      '.se-meta__row{display:flex;align-items:flex-start;gap:6px;min-width:0;}',
      '.se-meta__lbl{flex:0 0 auto;font-size:11px;color:var(--color-content-tertiary,#a1a1aa);}',
      '.se-meta__chips{display:flex;flex-wrap:wrap;gap:4px;min-width:0;}',
      '.se-owner{font:inherit;font-size:11px;padding:2px 6px;border-radius:6px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-2,#fafafa);color:var(--color-content-primary,#18181b);max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.se-owner--composite{border-color:var(--color-primary-200,#bfdbfe);background:var(--color-primary-50,#eff6ff);color:var(--color-primary-700,#1d4ed8);}',
      '.se-owner--primitive{color:var(--color-content-secondary,#71717a);}',
      '.se-anc{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--color-line-subtle,#e4e4e7);}',
      '.se-anc__lbl{font-size:11px;color:var(--color-content-tertiary,#a1a1aa);}',
      '.se-chip{font:inherit;font-size:11px;padding:2px 6px;border-radius:6px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-2,#fafafa);color:inherit;cursor:pointer;}',
      '.se-body{padding:10px 12px;display:flex;flex-direction:column;gap:10px;}',
      '.se-row{display:flex;flex-direction:column;gap:4px;}',
      '.se-row__lbl{font-size:11px;color:var(--color-content-secondary,#71717a);font-family:var(--font-mono,monospace);}',
      '.se-ctl{display:flex;gap:6px;align-items:center;}',
      '.se-ctl select,.se-ctl input{flex:1;min-width:0;font:inherit;font-size:12px;padding:4px 6px;border-radius:6px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-1,#fff);color:inherit;}',
      '.se-sw{width:18px;height:18px;border-radius:4px;border:1px solid var(--color-line-default,#d4d4d8);flex:none;}',
      '.se-ft{position:sticky;bottom:0;background:var(--color-surface-2,#fafafa);border-top:1px solid var(--color-line-subtle,#e4e4e7);padding:8px 12px;}',
      '.se-empty{padding:6px 0;color:var(--color-content-secondary,#71717a);font-size:12px;}',
      '.se-toverlay{position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.45);}',
      '.se-tpanel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:420px;max-width:calc(100vw - 32px);max-height:82vh;z-index:2147483647;display:flex;flex-direction:column;overflow:hidden;background:var(--color-surface-1,#fff);border:1px solid var(--color-line-default,#d4d4d8);border-radius:12px;box-shadow:var(--shadow-4,0 8px 30px rgba(0,0,0,.2));font-family:var(--font-sans,system-ui,sans-serif);font-size:13px;color:var(--color-content-primary,#18181b);}',
      '.se-tpanel>.se-hd,.se-tpanel>.se-tsearch,.se-tpanel>.se-tfoot{flex:0 0 auto;}',
      '.se-tsearch{padding:8px 12px;border-bottom:1px solid var(--color-line-subtle,#e4e4e7);}',
      '.se-tsearch input{width:100%;box-sizing:border-box;font:inherit;font-size:12px;padding:6px 8px;border-radius:6px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-1,#fff);color:inherit;}',
      '.se-tbody{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 12px 8px;display:flex;flex-direction:column;gap:0;}',
      '.se-tbody .se-row{margin-bottom:10px;}',
      '.se-tgroup{position:sticky;top:0;background:var(--color-surface-1,#fff);font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--color-content-tertiary,#a1a1aa);padding:10px 0 8px;margin:0;z-index:3;border-bottom:1px solid var(--color-line-subtle,#e4e4e7);}',
      '.se-tfoot{border-top:1px solid var(--color-line-subtle,#e4e4e7);padding:8px 12px;background:var(--color-surface-2,#fafafa);}',
      '.se-ctl{position:relative;}',
      '.se-tbody .se-sw{width:28px;height:26px;cursor:pointer;}',
      '.se-tval{flex:1;min-width:0;font-family:var(--font-mono,monospace);font-size:11px;color:var(--color-content-secondary,#71717a);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.se-cpick{position:fixed;z-index:2147483647;width:248px;box-sizing:border-box;background:var(--color-surface-1,#fff);border:1px solid var(--color-line-default,#d4d4d8);border-radius:10px;box-shadow:var(--shadow-4,0 8px 30px rgba(0,0,0,.2));padding:12px;font-family:var(--font-sans,system-ui,sans-serif);font-size:12px;color:var(--color-content-primary,#18181b);}',
      '.se-cpick__hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;}',
      '.se-cpick__name{font-family:var(--font-mono,monospace);font-size:11px;word-break:break-all;}',
      '.se-cpick__preview{height:40px;border-radius:8px;border:1px solid var(--color-line-default,#d4d4d8);margin-bottom:10px;}',
      '.se-cpick__row{display:grid;grid-template-columns:16px 1fr 50px;gap:8px;align-items:center;margin-bottom:8px;}',
      '.se-cpick__row input[type=range]{width:100%;}',
      '.se-cpick__lbl{font-family:var(--font-mono,monospace);color:var(--color-content-secondary,#71717a);}',
      '.se-cpick__num{text-align:right;font-family:var(--font-mono,monospace);color:var(--color-content-secondary,#71717a);}'
    ].join('');
    var st = document.createElement('style'); st.setAttribute('data-editor', ''); st.textContent = css;
    document.head.appendChild(st);
  }

  function buildBar() {
    bar = div('se-bar');
    var toggle = mkbtn('✎ 编辑样式', function () {
      editing = !editing;
      toggle.classList.toggle('se-btn--on', editing);
      toggle.textContent = editing ? '✓ 编辑中 · 点元素改样式' : '✎ 编辑样式';
      if (!editing) { clearHover(); deselect(); }
    });
    var row = div('se-bar__row');
    row.appendChild(mkbtn('🎨 Token', openTokenPanel));
    row.appendChild(mkbtn('保存', saveChanges, 'se-btn--primary'));
    row.appendChild(toggle);
    bar.appendChild(row);
    document.body.appendChild(bar);
  }

  var selectedVersion = '';
  var versionSelect = null, versionStatus = null, versionReleaseBtn = null;
  var versionMeta = {};
  var versionTokenLink = null, versionPrimitiveLink = null, versionCompositeLink = null;
  var versionLoading = null, versionLoadingDesc = null, versionLoadId = 0;
  function apiUrl(path) { return location.protocol === 'file:' ? 'http://localhost:4177' + path : path; }
  function setVersionStatus(text) { if (versionStatus) versionStatus.textContent = text || ''; }
  function selectedVersionMeta(version) { return versionMeta[version || selectedVersion] || null; }
  function versionOptionLabel(item) {
    var label = item.version;
    if (item.version === 'v1' && item.status === 'clean') return label + ' · initial snapshot';
    if (item.status === 'draft') return label + ' · draft · promote required';
    if (item.status === 'clean') return label + ' · clean snapshot';
    return label + ' · blocked';
  }
  function versionStatusText(version) {
    var meta = selectedVersionMeta(version);
    if (!meta) return version ? ('已应用 ' + version) : '未选择版本';
    if (meta.status === 'draft') {
      return '已应用 ' + meta.version + ' · draft，需先 promote（' +
        (meta.tokenOverrideCount || 0) + ' token / ' +
        (meta.classOverrideDeclarations || 0) + ' class）';
    }
    if (meta.releaseable) return '已应用 ' + meta.version + ' · 可发布';
    return '已应用 ' + meta.version + ' · 不可发布：' + (meta.releaseBlockReason || 'blocked');
  }
  function refreshReleaseButton() {
    if (!versionReleaseBtn) return;
    var meta = selectedVersionMeta();
    var canPromote = meta && meta.status === 'draft';
    var canRelease = meta && meta.releaseable;
    var disabled = !canPromote && !canRelease;
    versionReleaseBtn.textContent = canPromote ? '申请发布' : '发布';
    versionReleaseBtn.disabled = !!disabled;
    versionReleaseBtn.title = disabled
      ? ('不能发布：' + (meta && meta.releaseBlockReason || '未选择版本'))
      : canPromote
        ? '生成 Agent promote handoff，不写 release'
        : '发布选中的 clean snapshot 到 release';
  }
  function syncVersionControl() {
    if (versionSelect) versionSelect.value = selectedVersion || '';
  }
  function assetUrl(version, file) {
    return apiUrl('/versions/' + encodeURIComponent(version) + '/' + file) + '?t=' + Date.now();
  }
  function ensureVersionLoading() {
    if (versionLoading) return versionLoading;
    versionLoading = div('se-version-loading');
    versionLoading.setAttribute('role', 'status');
    versionLoading.setAttribute('aria-live', 'polite');
    var box = div('se-version-loading__box');
    box.appendChild(div('se-save-spinner'));
    box.appendChild(saveNode('div', 'se-version-loading__title', '正在切换版本'));
    versionLoadingDesc = saveNode('div', 'se-version-loading__desc', '');
    box.appendChild(versionLoadingDesc);
    versionLoading.appendChild(box);
    document.body.appendChild(versionLoading);
    return versionLoading;
  }
  function setVersionLoading(open, text) {
    ensureVersionLoading();
    if (versionLoadingDesc) versionLoadingDesc.textContent = text || '';
    if (open) versionLoading.setAttribute('data-open', 'true');
    else versionLoading.removeAttribute('data-open');
    if (versionSelect) versionSelect.disabled = !!open;
  }
  function waitForStylesheet(link, href, done) {
    var settled = false;
    var timer = null;
    function finish() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      link.onload = null;
      link.onerror = null;
      done();
    }
    link.onload = finish;
    link.onerror = finish;
    timer = setTimeout(finish, 3000);
    link.href = href;
  }
  function applyVersion(version, showLoading) {
    var loadId = ++versionLoadId;
    selectedVersion = version || '';
    version = selectedVersion;
    syncVersionControl();
    refreshReleaseButton();
    clearDraftOverrides();
    if (!version) {
      if (versionTokenLink) versionTokenLink.remove();
      if (versionPrimitiveLink) versionPrimitiveLink.remove();
      if (versionCompositeLink) versionCompositeLink.remove();
      versionTokenLink = null; versionPrimitiveLink = null; versionCompositeLink = null;
      setVersionStatus('未选择版本');
      setVersionLoading(false);
      return;
    }
    if (showLoading) {
      setVersionStatus('正在应用 ' + version + '...');
      setVersionLoading(true, '加载 ' + version + ' 的 tokens、primitives 和 composites');
    }
    if (!versionTokenLink) {
      versionTokenLink = document.createElement('link');
      versionTokenLink.rel = 'stylesheet';
      versionTokenLink.setAttribute('data-editor', '');
      document.head.appendChild(versionTokenLink);
    }
    if (!versionPrimitiveLink) {
      versionPrimitiveLink = document.createElement('link');
      versionPrimitiveLink.rel = 'stylesheet';
      versionPrimitiveLink.setAttribute('data-editor', '');
      document.head.insertBefore(versionPrimitiveLink, versionCompositeLink || null);
    }
    if (!versionCompositeLink) {
      versionCompositeLink = document.createElement('link');
      versionCompositeLink.rel = 'stylesheet';
      versionCompositeLink.setAttribute('data-editor', '');
      document.head.appendChild(versionCompositeLink);
    }
    var meta = selectedVersionMeta(version);
    var loadPrimitive = !meta || !!meta.hasPrimitiveCss;
    if (!loadPrimitive && versionPrimitiveLink) {
      versionPrimitiveLink.remove();
      versionPrimitiveLink = null;
    }
    var pending = loadPrimitive ? 3 : 2;
    function done() {
      pending -= 1;
      if (pending > 0 || loadId !== versionLoadId) return;
      setVersionLoading(false);
      setVersionStatus(versionStatusText(version));
      refreshReleaseButton();
    }
    waitForStylesheet(versionTokenLink, assetUrl(version, 'tokens.inline.css'), done);
    if (loadPrimitive) waitForStylesheet(versionPrimitiveLink, assetUrl(version, 'primitives.css'), done);
    waitForStylesheet(versionCompositeLink, assetUrl(version, 'composites.css'), done);
  }
  function loadVersions(preferred) {
    if (!versionSelect) return;
    fetch(apiUrl('/__prototype_versions')).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    }).then(function (data) {
      var versions = data.versions || [];
      var latest = data.latest || (versions.length ? versions[versions.length - 1].version : '');
      var chosen = preferred || selectedVersion || latest;
      versionMeta = {};
      versionSelect.innerHTML = '';
      versions.forEach(function (item) {
        versionMeta[item.version] = item;
        var opt = document.createElement('option');
        opt.value = item.version;
        opt.textContent = versionOptionLabel(item);
        opt.title = item.releaseable
          ? 'Can release'
          : ('Cannot release: ' + (item.releaseBlockReason || 'blocked'));
        versionSelect.appendChild(opt);
      });
      if (!versions.length) {
        var empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '无保存版本';
        versionSelect.appendChild(empty);
        chosen = '';
      } else if (!versions.some(function (item) { return item.version === chosen; })) {
        chosen = latest;
      }
      applyVersion(chosen);
    }).catch(function () {
      setVersionStatus('版本服务未连接');
    });
  }
  function buildVersionControl() {
    var header = document.querySelector('.app-frame__header');
    if (!header) return;
    var wrap = div('se-version');
    var label = document.createElement('span'); label.className = 'se-version__label'; label.setAttribute('data-editor', ''); label.textContent = 'Version';
    versionSelect = document.createElement('select'); versionSelect.setAttribute('data-editor', ''); versionSelect.setAttribute('aria-label', 'Select style version');
    versionSelect.onchange = function () { applyVersion(versionSelect.value, true); };
    versionReleaseBtn = mkbtn('发布', releaseSelectedVersion, 'se-btn--primary');
    versionStatus = document.createElement('span'); versionStatus.className = 'se-version__status'; versionStatus.setAttribute('data-editor', '');
    wrap.appendChild(label);
    wrap.appendChild(versionSelect);
    wrap.appendChild(versionReleaseBtn);
    wrap.appendChild(versionStatus);
    var spacer = header.querySelector('.app-frame__spacer');
    if (spacer && spacer.nextSibling) header.insertBefore(wrap, spacer.nextSibling);
    else header.appendChild(wrap);
    loadVersions();
  }

  function ensurePanel() {
    if (!panel) { panel = div('se-panel'); panel.style.display = 'none'; document.body.appendChild(panel); }
    return panel;
  }
  function deselect() {
    if (selected) selected.classList.remove('se-selected');
    selected = null;
    if (panel) panel.style.display = 'none';
  }
  function select(el) {
    if (selected) selected.classList.remove('se-selected');
    selected = el;
    el.classList.add('se-selected');
    renderPanel();
    positionPanel(el);
  }

  function editableProps(el) {
    var set = {};
    foundationClasses(el).forEach(function (c) { var d = classDecl[c]; if (d) for (var p in d) set[p] = true; });
    return Object.keys(set).sort(function (a, b) {
      var ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
      if (ia < 0) ia = 999; if (ib < 0) ib = 999;
      return ia - ib || (a < b ? -1 : 1);
    });
  }
  function currentValue(el, prop) {
    // saved override first (reading an inline shorthand-with-var returns '' in some browsers),
    // then any inline value, then the class-declared value.
    var path = pathOf(el);
    if (store[path] && store[path][prop] != null) return store[path][prop];
    var inl = el.style.getPropertyValue(prop);
    if (inl) return inl.trim();
    var v = '';
    foundationClasses(el).forEach(function (c) { var d = classDecl[c]; if (d && d[prop] != null) v = d[prop]; });
    return v;
  }
  function optHas(opts, v) { for (var i = 0; i < opts.length; i++) if (opts[i].value === v) return true; return false; }

  function ownerNode(owner, cls) {
    var chip = document.createElement('span');
    chip.className = 'se-owner se-owner--' + owner.layer;
    chip.setAttribute('data-editor', '');
    chip.title = owner.title || owner.name;
    chip.textContent = ownerLabel(owner) + (cls ? ' · .' + cls : '');
    return chip;
  }
  function appendOwnerRow(parent, label, owners) {
    if (!owners.length) return;
    var row = div('se-meta__row');
    var l = document.createElement('span');
    l.className = 'se-meta__lbl';
    l.setAttribute('data-editor', '');
    l.textContent = label;
    row.appendChild(l);
    var chips = div('se-meta__chips');
    owners.forEach(function (owner) {
      chips.appendChild(ownerNode(owner, owner.classes && owner.classes[0]));
    });
    row.appendChild(chips);
    parent.appendChild(row);
  }
  function compositeTrail(el) {
    var out = [], seen = {};
    var cur = el;
    while (cur && cur.nodeType === 1 && selectable(cur)) {
      ownersForElement(cur, 'composite').forEach(function (owner) {
        var key = ownerKey(owner);
        if (seen[key]) return;
        seen[key] = true;
        out.push(owner);
      });
      cur = cur.parentElement;
    }
    return out.slice(0, 6);
  }
  function appendCatalogMeta(el) {
    var owners = ownersForElement(el, null);
    var trail = compositeTrail(el);
    if (!owners.length && !trail.length) return;
    var meta = div('se-meta');
    appendOwnerRow(meta, '归属:', owners);
    appendOwnerRow(meta, '所在:', trail);
    panel.appendChild(meta);
  }
  function ancestorChipText(el) {
    var classes = foundationClasses(el);
    var owner = ownersForElement(el, 'composite')[0] || ownersForElement(el, null)[0];
    var cls = classes[0] ? '.' + classes[0] : '';
    return owner ? cls + ' · ' + ownerLabel(owner) : cls;
  }

  function rowFor(el, prop) {
    var row = div('se-row');
    var lbl = div('se-row__lbl'); lbl.textContent = prop; row.appendChild(lbl);
    var ctl = div('se-ctl');
    var cur = currentValue(el, prop);
    var opts = optionsFor(prop, cur);
    var sw = (isColorProp(prop) || tokenFamilyOf(cur) === '--color-') ? div('se-sw') : null;
    var sel = document.createElement('select'); sel.setAttribute('data-editor', '');
    opts.forEach(function (o) { var op = document.createElement('option'); op.value = o.value; op.textContent = o.label; sel.appendChild(op); });
    var c = document.createElement('option'); c.value = '__custom__'; c.textContent = '自定义…'; sel.appendChild(c);
    var txt = document.createElement('input'); txt.type = 'text'; txt.setAttribute('data-editor', ''); txt.placeholder = 'CSS 值'; txt.style.display = 'none';

    var tm = /^var\(\s*(--[-A-Za-z0-9_]+)\s*\)$/.exec(cur);
    if (tm && optHas(opts, 'var(' + tm[1] + ')')) sel.value = 'var(' + tm[1] + ')';
    else if (cur && optHas(opts, cur)) sel.value = cur;
    else { sel.value = '__custom__'; txt.style.display = 'block'; txt.value = cur; }

    function swatch() { if (sw) sw.style.background = getComputedStyle(el).getPropertyValue(prop) || cur; }
    swatch();
    sel.onchange = function () {
      if (sel.value === '__custom__') { txt.style.display = 'block'; txt.focus(); }
      else { txt.style.display = 'none'; apply(el, prop, sel.value); swatch(); }
    };
    txt.oninput = function () { var v = txt.value.trim(); if (v) { apply(el, prop, v); swatch(); } };

    if (sw) ctl.appendChild(sw);
    ctl.appendChild(sel);
    row.appendChild(ctl);
    row.appendChild(txt);
    return row;
  }

  function renderPanel() {
    var el = selected; if (!el) return;
    ensurePanel();
    panel.innerHTML = '';
    var hd = div('se-hd');
    var title = div('se-title'); title.textContent = foundationClasses(el).map(function (c) { return '.' + c; }).join('');
    hd.appendChild(title);
    var x = document.createElement('button'); x.className = 'se-x'; x.setAttribute('data-editor', ''); x.textContent = '×'; x.onclick = deselect;
    hd.appendChild(x);
    panel.appendChild(hd);
    appendCatalogMeta(el);

    var ancs = ancestorsFoundation(el);
    if (ancs.length) {
      var ab = div('se-anc');
      var l = document.createElement('span'); l.className = 'se-anc__lbl'; l.setAttribute('data-editor', ''); l.textContent = '上层:';
      ab.appendChild(l);
      ancs.slice(0, 6).forEach(function (a) {
        var chip = document.createElement('button'); chip.className = 'se-chip'; chip.setAttribute('data-editor', '');
        chip.textContent = ancestorChipText(a);
        chip.onclick = function () { select(a); };
        ab.appendChild(chip);
      });
      panel.appendChild(ab);
    }

    var body = div('se-body');
    var props = editableProps(el);
    if (!props.length) {
      var e = div('se-empty'); e.textContent = '此元素没有可主题化的已声明样式 — 试试上层组件。';
      body.appendChild(e);
    } else {
      props.forEach(function (p) { body.appendChild(rowFor(el, p)); });
    }
    panel.appendChild(body);

    var ft = div('se-ft'); ft.appendChild(mkbtn('重置本元素', function () { resetEl(el); }));
    panel.appendChild(ft);
    panel.style.display = 'block';
  }

  function positionPanel(el) {
    if (!panel) return;
    var r = el.getBoundingClientRect();
    var pw = 300, ph = Math.min(panel.offsetHeight || 380, window.innerHeight * 0.72);
    var left = r.right + 12;
    if (left + pw > window.innerWidth - 8) left = r.left - pw - 12;
    if (left < 8) left = Math.max(8, window.innerWidth - pw - 8);
    var top = r.top;
    if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
    if (top < 8) top = 8;
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  // ───────────────── apply / reset ─────────────────
  function apply(el, prop, value) {
    el.style.setProperty(prop, value);
    var path = pathOf(el);
    if (!store[path]) store[path] = {};
    store[path][prop] = value;
    saveStore();
  }
  function resetEl(el) {
    var path = pathOf(el), props = store[path];
    if (props) { for (var p in props) el.style.removeProperty(p); delete store[path]; saveStore(); }
    renderPanel();
  }
  // ───────────────── save / release ─────────────────
  function ownerClassForProp(el, prop) {
    var owner = null, classes = foundationClasses(el);
    classes.forEach(function (c) {
      var d = classDecl[c];
      if (d && d[prop] != null) owner = c;
    });
    return owner || classes[classes.length - 1] || null;
  }
  function collectClassOverrides() {
    var overrides = {}, conflicts = [], meta = {};
    for (var path in store) {
      var el = elByPath(path);
      if (!el) continue;
      for (var prop in store[path]) {
        var cls = ownerClassForProp(el, prop);
        if (!cls) continue;
        var selector = '.' + cls;
        var value = store[path][prop];
        if (!overrides[selector]) overrides[selector] = {};
        if (!meta[selector]) meta[selector] = {};
        if (overrides[selector][prop] != null && overrides[selector][prop] !== value) {
          conflicts.push({ selector: selector, prop: prop, previous: overrides[selector][prop], next: value, path: path });
        }
        overrides[selector][prop] = value;
        meta[selector][prop] = ownerMetaForChange(el, cls);
      }
    }
    return { overrides: overrides, conflicts: conflicts, meta: meta };
  }
  function countKeys(obj) {
    var n = 0;
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) n++;
    return n;
  }
  function countDecls(map) {
    var n = 0;
    for (var selector in map) n += countKeys(map[selector]);
    return n;
  }
  function displayChangeValue(value) {
    if (value == null || String(value).trim() === '') return '(unset)';
    value = String(value).replace(/\s+/g, ' ').trim();
    return value.length > 120 ? value.slice(0, 117) + '...' : value;
  }
  function formatSaveChangeSummary(changes) {
    changes = changes || {};
    var rows = [];
    (changes.tokens || []).forEach(function (item) {
      rows.push('Token ' + item.name + ': ' + displayChangeValue(item.previous) + ' -> ' + displayChangeValue(item.next));
    });
    (changes.composites || []).forEach(function (item) {
      rows.push(changeName(item.selector, item.prop, item.owner) + ': ' + displayChangeValue(item.previous) + ' -> ' + displayChangeValue(item.next));
    });
    if (!rows.length) return '';
    var limit = 24;
    var out = rows.slice(0, limit);
    if (rows.length > limit) out.push('... +' + (rows.length - limit) + ' more');
    return out.join('\n');
  }
  var saveOverlay = null, saveModal = null, saveBusy = false;
  function saveNode(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    node.setAttribute('data-editor', '');
    if (text != null) node.textContent = text;
    return node;
  }
  function ensureSaveModal() {
    if (saveOverlay && saveModal) return saveModal;
    saveOverlay = div('se-save-overlay');
    saveOverlay.onclick = function (e) { if (e.target === saveOverlay) closeSaveModal(); };
    saveModal = div('se-save-modal');
    saveModal.setAttribute('role', 'dialog');
    saveModal.setAttribute('aria-modal', 'true');
    saveOverlay.appendChild(saveModal);
    document.body.appendChild(saveOverlay);
    return saveModal;
  }
  function closeSaveModal() {
    if (saveBusy) return;
    if (saveOverlay) saveOverlay.removeAttribute('data-open');
  }
  function openSaveModal() {
    ensureSaveModal();
    saveOverlay.setAttribute('data-open', 'true');
  }
  function clearSaveModal() {
    ensureSaveModal();
    saveModal.innerHTML = '';
  }
  function appendSaveHero(title, description, iconText) {
    var hero = div('se-save-modal__hero');
    var icon = saveNode('span', 'se-save-modal__icon', iconText || 'S');
    var copy = div('');
    copy.appendChild(saveNode('h2', 'se-save-modal__title', title));
    copy.appendChild(saveNode('p', 'se-save-modal__desc', description));
    hero.appendChild(icon);
    hero.appendChild(copy);
    saveModal.appendChild(hero);
  }
  function appendSaveStats(body, stats) {
    var wrap = div('se-save-modal__stats');
    stats.forEach(function (item) {
      var stat = div('se-save-stat');
      stat.appendChild(saveNode('div', 'se-save-stat__label', item.label));
      stat.appendChild(saveNode('div', 'se-save-stat__value', item.value));
      wrap.appendChild(stat);
    });
    body.appendChild(wrap);
  }
  function appendSaveFooter(buttons) {
    var ft = div('se-save-modal__footer');
    buttons.forEach(function (button) { ft.appendChild(button); });
    saveModal.appendChild(ft);
  }
  function previewRowsFromDraft(collected) {
    var rows = [];
    Object.keys(tokenStore).sort().forEach(function (name) {
      rows.push({ name: 'Token ' + name, next: tokenStore[name] });
    });
    var overrides = collected.overrides || {};
    var meta = collected.meta || {};
    Object.keys(overrides).sort().forEach(function (selector) {
      Object.keys(overrides[selector]).sort().forEach(function (prop) {
        rows.push({ name: changeName(selector, prop, meta[selector] && meta[selector][prop]), next: overrides[selector][prop] });
      });
    });
    return rows;
  }
  function rowsFromSavedChanges(changes) {
    changes = changes || {};
    var rows = [];
    (changes.tokens || []).forEach(function (item) {
      rows.push({ name: 'Token ' + item.name, previous: item.previous, next: item.next });
    });
    (changes.composites || []).forEach(function (item) {
      rows.push({ name: changeName(item.selector, item.prop, item.owner), previous: item.previous, next: item.next });
    });
    return rows;
  }
  function appendSaveRows(body, title, hint, rows, mode) {
    var section = div('se-save-section');
    var head = div('se-save-section__head');
    head.appendChild(saveNode('div', 'se-save-section__title', title));
    if (hint) head.appendChild(saveNode('div', 'se-save-section__hint', hint));
    section.appendChild(head);
    if (!rows.length) {
      section.appendChild(saveNode('div', 'se-save-empty', '没有可显示的改动。'));
      body.appendChild(section);
      return;
    }
    var list = div('se-save-list');
    rows.forEach(function (row) {
      var item = div('se-save-row' + (mode === 'preview' ? ' se-save-row--preview' : ''));
      item.appendChild(saveNode('div', 'se-save-row__name', row.name));
      if (mode === 'preview') {
        item.appendChild(saveNode('div', 'se-save-row__value', displayChangeValue(row.next)));
      } else {
        item.appendChild(saveNode('div', 'se-save-row__value', displayChangeValue(row.previous)));
        item.appendChild(saveNode('div', 'se-save-row__arrow', '->'));
        item.appendChild(saveNode('div', 'se-save-row__value', displayChangeValue(row.next)));
      }
      list.appendChild(item);
    });
    section.appendChild(list);
    body.appendChild(section);
  }
  function renderSaveNoChanges() {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('没有可保存的改动', '先编辑 token 或组件样式，再保存为一个版本。', 'i');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-empty', '当前草稿为空。'));
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('关闭', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderSaveConfirm(payload, collected, meta) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('保存样式改动', '保存后会生成一个新的 version，并展示每一项从旧值到新值的变化。', 'S');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Token', value: String(meta.tokenCount) },
      { label: 'Composite', value: String(meta.styleCount) },
      { label: '来源版本', value: payload.baseVersion || '-' },
    ]);
    if (collected.conflicts.length) {
      body.appendChild(saveNode('div', 'se-save-callout', '有 ' + collected.conflicts.length + ' 个同 class 同属性存在不同取值，保存时会使用最后一次编辑的值。'));
    }
    appendSaveRows(body, '即将保存', '新值预览', previewRowsFromDraft(collected), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('取消', closeSaveModal, 'se-btn--ghost'),
      mkbtn('保存为新版本', function () { submitSavePayload(payload); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function renderSaveLoading() {
    saveBusy = true;
    clearSaveModal();
    appendSaveHero('正在保存', '正在写入 versions，并生成 tokens.inline.css / primitives.css / composites.css。', 'S');
    var body = div('se-save-modal__body');
    var row = div('se-save-empty');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'center';
    row.style.gap = '10px';
    row.appendChild(div('se-save-spinner'));
    row.appendChild(saveNode('span', '', '请稍候...'));
    body.appendChild(row);
    saveModal.appendChild(body);
    openSaveModal();
  }
  function renderSaveSuccess(data) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('保存成功', '已创建 ' + data.version + '，可在 header 的 Version 下拉框中选择。', '\u2713');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Version', value: data.version || '-' },
      { label: 'Token', value: String((data.changes && data.changes.tokens || []).length) },
      { label: 'Composite', value: String((data.changes && data.changes.composites || []).length) },
      { label: 'Source', value: data.sourceDirty ? 'dirty' : (data.sourceCommit ? data.sourceCommit.slice(0, 12) : 'not recorded') },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '目录: ' + data.relativeDir));
    if (data.sourceDirty) {
      body.appendChild(saveNode('div', 'se-save-callout', '保存时受管 source 有未提交改动；这个 version 不能精确自动恢复 source。'));
    }
    appendSaveRows(body, '修改明细', '旧值 -> 新值', rowsFromSavedChanges(data.changes), 'saved');
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('完成', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderSaveError(error, retry) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('保存失败', error.message || String(error), '!');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-callout', '请确认页面通过本地服务打开: npm run prototype:carbon / http://localhost:4177/'));
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('关闭', closeSaveModal, 'se-btn--ghost'),
      mkbtn('重试', retry, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function submitSavePayload(payload) {
    renderSaveLoading();
    fetch(apiUrl('/__prototype_save'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    }).then(function (data) {
      loadVersions(data.version);
      renderSaveSuccess(data);
    }).catch(function (err) {
      renderSaveError(err, function () { submitSavePayload(payload); });
    });
  }
  function saveChanges() {
    var collected = collectClassOverrides();
    var tokenCount = countKeys(tokenStore);
    var styleCount = countDecls(collected.overrides);
    if (!tokenCount && !styleCount) {
      renderSaveNoChanges();
      return;
    }
    if (!selectedVersion) {
      renderSaveError(new Error('请先选择一个保存版本作为编辑基准。'), saveChanges);
      return;
    }

    var payload = {
      page: location.pathname.split('/').pop() || 'index.html',
      href: location.href,
      title: document.title || '',
      publishedAt: new Date().toISOString(),
      baseVersion: selectedVersion,
      tokens: tokenStore,
      classOverrides: collected.overrides,
      classOverrideMeta: collected.meta,
      elementOverrides: store,
      conflicts: collected.conflicts
    };
    renderSaveConfirm(payload, collected, { tokenCount: tokenCount, styleCount: styleCount });
  }
  function releaseFileRows(files) {
    files = files && files.length ? files : ['catalog.json', 'catalog.md', 'tokens.inline.css', 'tokens.json', 'composites.css', 'manifest.json'];
    return files.map(function (file) { return { name: file, next: 'release/' + file }; });
  }
  function versionFileRows(version, files) {
    files = files && files.length ? files : ['tokens.inline.css', 'primitives.css', 'composites.css', 'manifest.json'];
    return files.map(function (file) { return { name: file, next: 'versions/' + version + '/' + file }; });
  }
  function promoteFileRows(version, file) {
    return [{ name: file || 'promote.md', next: 'versions/' + version + '/' + (file || 'promote.md') }];
  }
  function renderReleaseNoVersion() {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('没有可发布的版本', '请先保存一个版本后再发布到 release。', 'R');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-empty', 'Version 下拉框里没有可用版本。'));
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('关闭', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderReleaseBlocked(version, meta) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('不能发布这个版本', version + ' 还不是 clean release snapshot。', '!');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Snapshot', value: version || '-' },
      { label: 'Status', value: meta && meta.status || 'unknown' },
      { label: 'Class overrides', value: String(meta && meta.classOverrideDeclarations || 0) },
    ]);
    var reason = meta && meta.releaseBlockReason || '未选择版本';
    body.appendChild(saveNode('div', 'se-save-callout',
      reason === 'promote required'
        ? '这个版本仍包含 classOverrides。请先运行 pnpm promote -- ' + version + '，把变化提升到 source 并 pnpm build 后，再发布干净版本。'
        : '阻止原因：' + reason
    ));
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('关闭', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderFinalizeConfirm(version) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('转为 clean 版本', '检查 ' + version + ' 的改动是否已经进入 source，然后把它转为 clean snapshot。', 'C');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Draft', value: version },
      { label: 'Version', value: version },
      { label: 'Source', value: 'must be committed' },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '这个动作会用当前 source 的干净样式覆盖 ' + version + ' 的 draft 样式。如果 source 还没提交，或 source 值和 draft 不一致，会直接失败。'));
    appendSaveRows(body, '版本文件', '将写入', versionFileRows(version), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('取消', closeSaveModal, 'se-btn--ghost'),
      mkbtn('转为 clean', function () { submitFinalizePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function renderFinalizeLoading(version) {
    saveBusy = true;
    clearSaveModal();
    appendSaveHero('正在转为 clean', '正在检查 ' + version + ' 是否已经 promote 到 source。', 'C');
    var body = div('se-save-modal__body');
    var row = div('se-save-empty');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'center';
    row.style.gap = '10px';
    row.appendChild(div('se-save-spinner'));
    row.appendChild(saveNode('span', '', '请稍候...'));
    body.appendChild(row);
    saveModal.appendChild(body);
    openSaveModal();
  }
  function renderFinalizeSuccess(data) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('已转为 clean', data.version + ' 现在可以发布到 release。', '\u2713');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Version', value: data.version || '-' },
      { label: 'Files', value: String((data.files || []).length) },
      { label: 'Source', value: data.sourceCommit ? data.sourceCommit.slice(0, 12) : '-' },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '目录: ' + data.relativeDir));
    appendSaveRows(body, '版本文件', '已写入', versionFileRows(data.version, data.files), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('完成', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderFinalizeError(error, version) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('生成失败', error.message || String(error), '!');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-callout', '请确认已经按 ' + version + ' 的 promote.md 修改 source、运行 pnpm build，并提交受管 source。'));
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('关闭', closeSaveModal, 'se-btn--ghost'),
      mkbtn('重试', function () { submitFinalizePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function submitFinalizePayload(version) {
    renderFinalizeLoading(version);
    fetch(apiUrl('/__prototype_finalize'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: version })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    }).then(function (data) {
      loadVersions(data.version);
      renderFinalizeSuccess(data);
    }).catch(function (err) {
      renderFinalizeError(err, version);
    });
  }
  function renderPromoteConfirm(version, meta) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('申请发布', '生成 ' + version + ' 的 Agent promote handoff，后续由 Agent 自动创建 PR 进入 source。', 'P');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Draft', value: version },
      { label: 'Token overrides', value: String(meta && meta.tokenOverrideCount || 0) },
      { label: 'Class overrides', value: String(meta && meta.classOverrideDeclarations || 0) },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '这个动作只生成 handoff 文档；不会修改 governed source、不会写 release、不会提交。把生成的 promote.md 交给 Agent 后，由 Agent 修改代码、自动创建 PR 并返回地址。'));
    appendSaveRows(body, 'Agent handoff', '将写入', promoteFileRows(version), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('取消', closeSaveModal, 'se-btn--ghost'),
      mkbtn('生成 handoff', function () { submitPromotePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function renderPromoteLoading(version) {
    saveBusy = true;
    clearSaveModal();
    appendSaveHero('正在生成 handoff', '正在运行 pnpm promote -- ' + version + '。', 'P');
    var body = div('se-save-modal__body');
    var row = div('se-save-empty');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'center';
    row.style.gap = '10px';
    row.appendChild(div('se-save-spinner'));
    row.appendChild(saveNode('span', '', '请稍候...'));
    body.appendChild(row);
    saveModal.appendChild(body);
    openSaveModal();
  }
  function renderPromoteSuccess(data) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('已生成 Agent 任务', data.version + ' 的 promote handoff 已就绪。', '\u2713');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Version', value: data.version || '-' },
      { label: 'Command', value: data.command || '-' },
      { label: 'Brief', value: data.relativeBriefPath || '-' },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '下一步：把这份 promote.md 交给 Agent。Agent 应自动创建独立 PR 来提升 source；PR 合并后再转为 clean snapshot 并发布 release。'));
    appendSaveRows(body, 'Agent handoff', '已写入', promoteFileRows(data.version, 'promote.md'), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('完成', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderPromoteError(error, version) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('生成失败', error.message || String(error), '!');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-callout', '请确认版本 ' + version + ' 存在，并且本地 prototype 服务能访问 versions 目录。'));
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('关闭', closeSaveModal, 'se-btn--ghost'),
      mkbtn('重试', function () { submitPromotePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function submitPromotePayload(version) {
    renderPromoteLoading(version);
    fetch(apiUrl('/__prototype_promote'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: version })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    }).then(function (data) {
      renderPromoteSuccess(data);
    }).catch(function (err) {
      renderPromoteError(err, version);
    });
  }
  function renderReleaseConfirm(version) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('发布版本到 release', '发布会先恢复该版本记录的受管 source，再打包成 release 产物。', 'R');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Version', value: version },
      { label: 'Target', value: 'release' },
      { label: 'Mode', value: '覆盖' },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '会从版本 manifest 记录的 Git commit 恢复 tokens / primitives / composites / patterns / governance，然后清空并写入 release 目录。'));
    appendSaveRows(body, '发布产物', '目标路径', releaseFileRows(), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('取消', closeSaveModal, 'se-btn--ghost'),
      mkbtn('发布到 release', function () { submitReleasePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function renderReleaseLoading(version) {
    saveBusy = true;
    clearSaveModal();
    appendSaveHero('正在发布', '正在恢复 ' + version + ' 的受管 source 并覆盖 release 目录。', 'R');
    var body = div('se-save-modal__body');
    var row = div('se-save-empty');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'center';
    row.style.gap = '10px';
    row.appendChild(div('se-save-spinner'));
    row.appendChild(saveNode('span', '', '请稍候...'));
    body.appendChild(row);
    saveModal.appendChild(body);
    openSaveModal();
  }
  function renderReleaseSuccess(data) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('发布成功', data.version + ' 已经写入 release，后续发布会继续覆盖这一份产物。', '\u2713');
    var body = div('se-save-modal__body');
    appendSaveStats(body, [
      { label: 'Version', value: data.version || '-' },
      { label: 'Files', value: String((data.files || []).length) },
      { label: 'Target', value: 'release' },
      { label: 'Source', value: data.sourceRestore && data.sourceRestore.applied ? (data.sourceRestore.shortCommit || 'restored') : 'not restored' },
    ]);
    body.appendChild(saveNode('div', 'se-save-callout', '目录: ' + data.relativeDir));
    appendSaveRows(body, '产物文件', '已写入', releaseFileRows(data.files), 'preview');
    saveModal.appendChild(body);
    appendSaveFooter([mkbtn('完成', closeSaveModal, 'se-btn--primary')]);
    openSaveModal();
  }
  function renderReleaseError(error, version) {
    saveBusy = false;
    clearSaveModal();
    appendSaveHero('发布失败', error.message || String(error), '!');
    var body = div('se-save-modal__body');
    body.appendChild(saveNode('div', 'se-save-callout', '请确认本地服务正在运行，并且版本 ' + version + ' 存在。'));
    saveModal.appendChild(body);
    appendSaveFooter([
      mkbtn('关闭', closeSaveModal, 'se-btn--ghost'),
      mkbtn('重试', function () { submitReleasePayload(version); }, 'se-btn--primary'),
    ]);
    openSaveModal();
  }
  function submitReleasePayload(version) {
    renderReleaseLoading(version);
    fetch(apiUrl('/__prototype_release'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: version })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    }).then(function (data) {
      renderReleaseSuccess(data);
    }).catch(function (err) {
      renderReleaseError(err, version);
    });
  }
  function releaseSelectedVersion() {
    var version = selectedVersion || '';
    if (!version) {
      renderReleaseNoVersion();
      return;
    }
    var meta = selectedVersionMeta(version);
    if (meta && meta.status === 'draft') {
      renderPromoteConfirm(version, meta);
      return;
    }
    if (!meta || !meta.releaseable) {
      renderReleaseBlocked(version, meta);
      return;
    }
    renderReleaseConfirm(version);
  }

  // ───────────────── events ─────────────────
  function clearHover() { if (hoverEl) { hoverEl.classList.remove('se-hover'); hoverEl = null; } }
  function onMove(e) {
    if (!editing) return;
    if (isEditorNode(e.target)) { clearHover(); return; }
    var el = nearestFoundation(e.target);
    if (el === hoverEl) return;
    clearHover();
    if (el && el !== selected) { hoverEl = el; el.classList.add('se-hover'); }
  }
  function onClick(e) {
    if (!editing || isEditorNode(e.target)) return;
    var el = nearestFoundation(e.target);
    if (!el) return;
    e.preventDefault(); e.stopImmediatePropagation();
    clearHover();
    select(el);
  }

  function init() {
    mainEl = document.querySelector('.app-frame__main');
    clearLegacyDraftStorage();
    readCSS();
    applyStored();
    applyTokens();
    injectStyle();
    buildBar();
    buildVersionControl();
    document.addEventListener('click', onClick, true);
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (saveOverlay && saveOverlay.getAttribute('data-open') === 'true') closeSaveModal();
      else if (cpick && cpick.style.display !== 'none') closePicker();
      else if (tpanel && tpanel.style.display !== 'none') closeTokenPanel();
      else if (editing) deselect();
    });
    window.addEventListener('resize', function () { if (selected) positionPanel(selected); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
