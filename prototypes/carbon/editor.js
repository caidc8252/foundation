/* TOMS prototype — in-page style editor.
   Runtime-injected; NOT part of any page's static markup (so pages stay closed-set clean).
   Click a primitive/composite element in Edit mode → tweak its declared, themeable styles
   with foundation tokens. Changes are inline overrides on that one element, persisted to
   localStorage, and exportable as edited HTML or a changes JSON. */
(function () {
  'use strict';
  if (window.__tomsEditor) return;
  window.__tomsEditor = true;

  // Foundation primitive/composite class names (baked from primitives.css + composites.css).
  var FOUNDATION = new Set(["accordion","accordion__arrow","accordion__content","accordion__item","accordion__item--open","accordion__label","accordion__trigger","alert","alert--default","alert--error","alert--info","alert--success","alert--warning","alert--with-icon","alert-dialog","alert-dialog-overlay","alert-dialog__description","alert-dialog__footer","alert-dialog__header","alert-dialog__title","alert__action","alert__description","alert__icon","alert__title","amount-row","amount-row--total","amount-row__label","amount-row__value","amount-summary","app-frame","app-frame--collapsed","app-frame__avatar","app-frame__brand","app-frame__col","app-frame__header","app-frame__main","app-frame__nav","app-frame__nav-item","app-frame__nav-item--active","app-frame__nav-label","app-frame__sidebar","app-frame__spacer","applied-filters","applied-filters__label","aspect-ratio","avatar","avatar--lg","avatar--md","avatar--sm","avatar--xl","avatar-group","avatar__fallback","avatar__image","badge","badge--default","badge--destructive","badge--error","badge--ghost","badge--info","badge--link","badge--neutral","badge--outline","badge--secondary","badge--success","badge--tag","badge--warning","badge__dot","breadcrumb__ellipsis","breadcrumb__item","breadcrumb__link","breadcrumb__list","breadcrumb__page","breadcrumb__separator","btn","btn--danger","btn--ghost","btn--ghost-danger","btn--icon","btn--icon-lg","btn--icon-sm","btn--icon-xs","btn--lg","btn--link","btn--md","btn--outline","btn--primary","btn--secondary","btn--sm","btn--soft","btn--tertiary","btn--xs","calendar","calendar__caption","calendar__day","calendar__day--disabled","calendar__day--focused","calendar__day--hidden","calendar__day--outside","calendar__day--range-end","calendar__day--range-middle","calendar__day--range-start","calendar__day--selected","calendar__day--today","calendar__footer","calendar__grid","calendar__header","calendar__link","calendar__nav-btn","calendar__weekday","card","card--elevation-0","card--elevation-1","card--elevation-2","card--interactive","card--lg","card--md","card--sm","card__action","card__content","card__content--flush","card__description","card__footer","card__footer--flush","card__header","card__header--flush","card__title","carousel","carousel--vertical","carousel__dot","carousel__dot--active","carousel__dots","carousel__item","carousel__nav","carousel__next","carousel__prev","carousel__track","carousel__viewport","cell-2line","cell-2line__main","cell-2line__sub","cell-center","cell-chevron","cell-empty","cell-num","cell-right","cell-tags","chart","chart-empty","chart-empty__description","chart-empty__icon","chart-empty__title","chart-legend","chart-legend__item","chart-legend__item--off","chart-legend__item--toggle","chart-legend__swatch","chart-legend__swatch--line","chart-skeleton","chart-sparkline","chart-tooltip","chart-tooltip__header","chart-tooltip__indicator","chart-tooltip__indicator--dashed","chart-tooltip__indicator--line","chart-tooltip__name","chart-tooltip__row","chart-tooltip__total","chart-tooltip__value","chart__axis","chart__bar","chart__curve","chart__grid","chart__label","chart__series--dimmed","chart__series--filtered","chart__series--selected","chart__tick","checkbox","col-select","collapsible","collapsible__chevron","collapsible__content","collapsible__content--open","collapsible__trigger","color-tile","color-tile--cat-1","color-tile--cat-2","color-tile--cat-3","color-tile--cat-4","color-tile--cat-5","color-tile--cat-6","color-tile--lg","color-tile--md","color-tile--sm","color-tile__label","combobox__chevron","combobox__content","combobox__empty","combobox__input","combobox__item","combobox__item--highlighted","combobox__item--selected","combobox__item-indicator","combobox__list","combobox__search","combobox__trigger","combobox__trigger--sm","combobox__value","combobox__value--placeholder","command","command-dialog","command-dialog__backdrop","command__empty","command__group","command__group-heading","command__input","command__input-wrapper","command__item","command__item--active","command__list","command__separator","command__shortcut","condition-band","condition-band__spacer","condition-band__toolbar","context-menu__content","context-menu__indicator","context-menu__item","context-menu__item--checkbox","context-menu__item--destructive","context-menu__item--inset","context-menu__item--radio","context-menu__label","context-menu__label--inset","context-menu__separator","context-menu__shortcut","context-menu__sub-trigger","context-menu__sub-trigger--inset","css","data-table","data-table--compact","data-table--spacious","data-table--sticky-col","data-table--sticky-head","data-table--striped","date-picker","date-presets","date-presets__item","date-time-row","date-time-row--stacked","date-time-row__label","date-time-row__line","date-time-row__line--actions","date-trigger","date-trigger--clearable","date-trigger--invalid","date-trigger--lg","date-trigger--md","date-trigger--sm","date-trigger__clear","date-trigger__icon","date-trigger__value","date-trigger__value--placeholder","detail-header","detail-header--sticky","detail-header__actions","detail-header__back","detail-header__bar","detail-header__chips","detail-header__logo","detail-header__main","detail-header__meta","detail-header__name","detail-header__tabs","detail-header__title","diff","diff--inline","diff__arrow","diff__col--new","diff__col--old","diff__label","diff__value","drawer","drawer--bottom","drawer--left","drawer--right","drawer--top","drawer-overlay","drawer__description","drawer__footer","drawer__handle","drawer__header","drawer__title","dropdown-menu","dropdown-menu__checkbox-item","dropdown-menu__checkbox-item--active","dropdown-menu__item","dropdown-menu__item--active","dropdown-menu__item--destructive","dropdown-menu__item--inset","dropdown-menu__item-indicator","dropdown-menu__label","dropdown-menu__label--inset","dropdown-menu__radio-item","dropdown-menu__radio-item--active","dropdown-menu__separator","dropdown-menu__shortcut","dropdown-menu__sub-content","dropdown-menu__sub-trigger","dropdown-menu__sub-trigger--inset","dropdown-menu__sub-trigger--open","dropdown-menu__sub-trigger__chevron","dropzone","dropzone--disabled","dropzone--drag","empty-state","empty-state__action","empty-state__description","empty-state__icon","empty-state__title","feed-item","feed-item--read","feed-item__actions","feed-item__body","feed-item__head","feed-item__icon","feed-item__icon--info","feed-item__icon--neutral","feed-item__icon--success","feed-item__icon--warning","feed-item__main","feed-item__time","feed-item__title","feed-list","field","field__error","field__hint","field__required","file-list","file-row","file-row__body","file-row__error","file-row__icon","file-row__name","file-row__name-row","file-row__size","file-row__status","file-row__status--done","file-row__status--error","filter-chip","filter-chip__remove","g","grid-auto-fit-kv","hover-card","initials-tile","initials-tile--lg","initials-tile--md","initials-tile--sm","initials-tile--xs","inline","input","input--filled","input--lg","input--md","input--ok","input--sm","input--warn","input-group","input-group--block","input-group--disabled","input-group--invalid","input-group__addon","input-group__addon--block-end","input-group__addon--block-start","input-group__addon--inline-end","input-group__addon--inline-start","input-group__control","input-group__text","input-otp","input-otp__caret","input-otp__group","input-otp__separator","input-otp__slot","input-otp__slot--active","is-clickable","kv-grid","kv-grid__row","kv-grid__row--full","label","label--disabled","load-more","load-more__end","load-more__progress","load-more__summary","md","menu-item","menu-item--destructive","menubar","menubar__trigger","menubar__trigger--open","modal","modal--fullscreen","modal--lg","modal--md","modal--sm","modal--xl","modal-overlay","modal__body","modal__close","modal__description","modal__footer","modal__header","modal__heading","modal__title","nav-menu","nav-menu__content","nav-menu__indicator","nav-menu__item","nav-menu__link","nav-menu__link--active","nav-menu__list","nav-menu__trigger","nav-menu__trigger--open","nav-menu__trigger__chevron","object-tile","object-tile--cat-1","object-tile--cat-2","object-tile--cat-3","object-tile--cat-4","object-tile--cat-5","object-tile--cat-6","object-tile--lg","object-tile--md","object-tile--neutral","object-tile--sm","object-tile__icon","option-card","option-card--radio","option-card--selected","option-card__body","option-card__check","option-card__desc","option-card__icon","option-card__input","option-card__title","page-body","page-header","page-header--sticky","page-header__actions","page-header__bar","page-header__count","page-header__description","page-header__heading","page-header__title","page-header__titles","pagination","pagination__current","pagination__ellipsis","pagination__info","pagination__page","pagination__pages","pagination__rows","pagination__summary","popover","popover__","popover__description","popover__header","popover__title","product-card","product-card--out-of-stock","product-card__add","product-card__body","product-card__cta","product-card__description","product-card__glyph","product-card__image","product-card__name","product-card__options","product-card__placeholder","product-card__price","product-card__price-row","product-card__ribbon","product-card__ribbon--info","product-card__ribbon--success","product-card__ribbon--warning","product-card__sku","product-grid","progress","progress__indicator","progress__indicator--error","progress__indicator--info","progress__indicator--success","progress__indicator--warning","progress__label","progress__track","progress__value","radio","recharts-cartesian-grid","resizable-group","resizable-group--vertical","resizable-handle","resizable-handle--horizontal","resizable-handle__grip","resizable-panel","rich-pagination","rich-pagination__left","rich-pagination__rows","rich-pagination__summary","row-actions","scroll-area","scroll-area__scrollbar","scroll-area__thumb","scroll-area__viewport","search-input","search-input__icon","section-card","section-card--collapsible","section-card__chevron","section-card__toggle","select","select--sm","separator","separator--vertical","separator-labeled","separator-labeled__label","sheet","sheet--bottom","sheet--left","sheet--right","sheet--top","sheet-overlay","sheet__close","sheet__description","sheet__footer","sheet__header","sheet__title","skeleton","skeleton--block","skeleton--circle","skeleton--line","skeleton--text","skeleton--title","skeleton-row","slider","slider--vertical","slider__indicator","slider__thumb","slider__track","spinner","spinner--lg","spinner--md","spinner--sm","spinner--xl","stack","stack--3","stack--4","stack--5","stack--6","stat-card","stat-card--interactive","stat-card--selected","stat-card__delta","stat-card__delta--down","stat-card__delta--flat","stat-card__delta--up","stat-card__description","stat-card__head","stat-card__icon","stat-card__label","stat-card__value","stat-card__value--error","stat-card__value--info","stat-card__value--success","stat-card__value--warning","stat-grid","stat-grid--cols-2","stat-grid--cols-3","stat-grid--cols-4","step","step--","step--active","step--completed","step--upcoming","step-indicator","step__body","step__body--clickable","step__caption","step__connector","step__dot","step__text","step__title","stepper","stepper__button","stepper__input","summary-bar","summary-bar--sticky","summary-bar__actions","summary-bar__count","switch","switch--sm","switch__thumb","table-frame","table-frame--flush","table-scroll","tabs","tabs--line","tabs__content","tabs__list","tabs__list--default","tabs__list--line","tabs__trigger","tabs__trigger--active","textarea","th-sort","th-sort__icon--active","th-sort__icon--idle","theme-toggle","timeline","timeline--compact","timeline--stacked","timeline__actor","timeline__content","timeline__description","timeline__header","timeline__item","timeline__item--last","timeline__marker","timeline__marker--","timeline__marker--dot","timeline__marker--error","timeline__marker--icon","timeline__marker--info","timeline__marker--neutral","timeline__marker--primary","timeline__marker--success","timeline__marker--warning","timeline__marker-dot","timeline__marker-node","timeline__rail","timeline__time","timeline__time-row","timeline__title","toast","toast--countdown","toast--with-icon","toast__close","toast__content","toast__description","toast__icon","toast__icon--error","toast__icon--info","toast__icon--loading","toast__icon--success","toast__icon--warning","toast__title","toggle","toggle--auto","toggle--default","toggle--in-","toggle--in-cloud","toggle--in-outline","toggle--in-segmented","toggle--md","toggle--outline","toggle--sm","toggle-checkbox","toggle-group","toggle-group--","toggle-group--cloud","toggle-group--outline","toggle-group--plain","toggle-group--segmented","toggle-group__item","toggle-group__item--auto","toggle-group__item--md","toggle-group__item--sm","toggle-radio","toggle-switch","tooltip","tooltip__arrow","tsx"]);

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

  // ───────────────── element path (stable id for persistence) ─────────────────
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
  function loadStore() { try { return JSON.parse(localStorage.getItem(PAGE_KEY)) || {}; } catch (e) { return {}; } }
  function saveStore() { try { localStorage.setItem(PAGE_KEY, JSON.stringify(store)); } catch (e) {} }
  function applyStored() {
    store = loadStore();
    for (var path in store) {
      var el = elByPath(path); if (!el) continue;
      for (var p in store[path]) el.style.setProperty(p, store[path][p]);
    }
  }

  // ───────────────── global tokens (edit :root → every var(--…) updates) ─────────────────
  // Shared across all pages (design tokens are global), persisted separately, baked into
  // exported HTML as inline custom properties on <html>.
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
  function loadTokenStore() { try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) || {}; } catch (e) { return {}; } }
  function saveTokenStore() { try { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenStore)); } catch (e) {} }
  function applyTokens() {
    tokenStore = loadTokenStore();
    for (var n in tokenStore) document.documentElement.style.setProperty(n, tokenStore[n]);
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
  function mkbtn(label, fn) { var b = document.createElement('button'); b.className = 'se-btn'; b.textContent = label; b.setAttribute('data-editor', ''); b.onclick = fn; return b; }

  function injectStyle() {
    var css = [
      '.se-hover{outline:2px dashed var(--color-info,#2563eb)!important;outline-offset:1px;cursor:pointer!important;}',
      '.se-selected{outline:2px solid var(--color-primary-500,#2563eb)!important;outline-offset:1px;}',
      '.se-bar{position:fixed;right:16px;bottom:16px;z-index:2147483646;display:flex;flex-direction:column;gap:8px;align-items:flex-end;font-family:var(--font-sans,system-ui,sans-serif);}',
      '.se-bar__row{display:flex;gap:6px;}',
      '.se-btn{font:inherit;font-size:13px;padding:6px 10px;border-radius:8px;border:1px solid var(--color-line-default,#d4d4d8);background:var(--color-surface-1,#fff);color:var(--color-content-primary,#18181b);cursor:pointer;box-shadow:var(--shadow-2,0 1px 3px rgba(0,0,0,.15));}',
      '.se-btn:hover{background:var(--color-surface-hover,#f4f4f5);}',
      '.se-btn--on{background:var(--color-primary-500,#2563eb);color:var(--color-content-on-primary,#fff);border-color:transparent;}',
      '.se-panel{position:fixed;z-index:2147483647;width:300px;max-height:72vh;overflow:auto;background:var(--color-surface-1,#fff);border:1px solid var(--color-line-default,#d4d4d8);border-radius:12px;box-shadow:var(--shadow-4,0 8px 30px rgba(0,0,0,.2));font-family:var(--font-sans,system-ui,sans-serif);font-size:13px;color:var(--color-content-primary,#18181b);}',
      '.se-hd{position:sticky;top:0;background:var(--color-surface-2,#fafafa);border-bottom:1px solid var(--color-line-subtle,#e4e4e7);padding:10px 12px;display:flex;align-items:center;gap:8px;justify-content:space-between;}',
      '.se-title{font-weight:600;font-size:12px;word-break:break-all;font-family:var(--font-mono,monospace);}',
      '.se-x{border:0;background:transparent;font-size:18px;line-height:1;cursor:pointer;color:var(--color-content-secondary,#71717a);padding:0 2px;}',
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
    var actions = div('se-bar__row'); actions.style.display = 'none';
    actions.appendChild(mkbtn('导出 HTML', exportHTML));
    actions.appendChild(mkbtn('导出 JSON', exportJSON));
    actions.appendChild(mkbtn('导入', importJSON));
    actions.appendChild(mkbtn('重置本页', resetPage));
    var toggle = mkbtn('✎ 编辑样式', function () {
      editing = !editing;
      toggle.classList.toggle('se-btn--on', editing);
      toggle.textContent = editing ? '✓ 编辑中 · 点元素改样式' : '✎ 编辑样式';
      actions.style.display = editing ? 'flex' : 'none';
      if (!editing) { clearHover(); deselect(); }
    });
    var row = div('se-bar__row');
    row.appendChild(mkbtn('🎨 Token', openTokenPanel));
    row.appendChild(toggle);
    bar.appendChild(actions);
    bar.appendChild(row);
    document.body.appendChild(bar);
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

    var ancs = ancestorsFoundation(el);
    if (ancs.length) {
      var ab = div('se-anc');
      var l = document.createElement('span'); l.className = 'se-anc__lbl'; l.setAttribute('data-editor', ''); l.textContent = '上层:';
      ab.appendChild(l);
      ancs.slice(0, 6).forEach(function (a) {
        var chip = document.createElement('button'); chip.className = 'se-chip'; chip.setAttribute('data-editor', '');
        chip.textContent = '.' + foundationClasses(a)[0];
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
  function resetPage() {
    if (!window.confirm('清空本页所有改动?')) return;
    localStorage.removeItem(PAGE_KEY); location.reload();
  }

  // ───────────────── export / import ─────────────────
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.setAttribute('data-editor', ''); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function baseName() { return (location.pathname.split('/').pop() || 'page').replace(/\.html?$/, ''); }
  function exportJSON() { download(baseName() + '.changes.json', JSON.stringify({ tokens: tokenStore, elements: store }, null, 2), 'application/json'); }
  function exportHTML() {
    clearHover();
    var clone = document.documentElement.cloneNode(true);
    var i, n, kill = clone.querySelectorAll('[data-editor]');
    for (i = 0; i < kill.length; i++) kill[i].remove();
    var scripts = clone.querySelectorAll('script[src]');
    for (i = 0; i < scripts.length; i++) { if (/editor\.js(\?|$)/.test(scripts[i].getAttribute('src') || '')) scripts[i].remove(); }
    var marked = clone.querySelectorAll('.se-hover,.se-selected');
    for (i = 0; i < marked.length; i++) {
      n = marked[i]; n.classList.remove('se-hover', 'se-selected');
      if (n.getAttribute('class') === '') n.removeAttribute('class');
    }
    download(baseName() + '.edited.html', '<!doctype html>\n' + clone.outerHTML, 'text/html');
  }
  function importJSON() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.setAttribute('data-editor', '');
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var data = JSON.parse(rd.result);
          if (data && (data.elements || data.tokens)) {
            localStorage.setItem(PAGE_KEY, JSON.stringify(data.elements || {}));
            localStorage.setItem(TOKEN_KEY, JSON.stringify(data.tokens || {}));
          } else {
            localStorage.setItem(PAGE_KEY, JSON.stringify(data || {})); // legacy flat = element overrides
          }
          location.reload();
        } catch (e) { window.alert('JSON 解析失败:' + e.message); }
      };
      rd.readAsText(f);
    };
    inp.click();
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
    readCSS();
    applyStored();
    applyTokens();
    injectStyle();
    buildBar();
    document.addEventListener('click', onClick, true);
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (cpick && cpick.style.display !== 'none') closePicker();
      else if (tpanel && tpanel.style.display !== 'none') closeTokenPanel();
      else if (editing) deselect();
    });
    window.addEventListener('resize', function () { if (selected) positionPanel(selected); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
