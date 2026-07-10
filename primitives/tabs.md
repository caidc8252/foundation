# Tabs

A tabbed control: a horizontal bar of triggers that switch which content panel is shown. Use for in-page section switching (detail tabs, settings groups) — not for page navigation.

## Variants

Variant lives on the **list** (`TabsList`); the **trigger** adapts its active/hover skin automatically from the parent list's `data-variant`.

| variant | use | token recipe |
|---|---|---|
| `line` *(default)* | section tabs on a page — minimal, sits over content | list: no fill · bottom hairline `inset 0 -1px 0 line-default` · `gap-1`. trigger: text `content-secondary` · transparent · active text `content-primary` + `font-semibold` + animated `primary-700` underline |
| `default` | pill tabs inside a contained tray | list: `bg-surface-3` · `radius-md` · `p-1` · `gap-1` · height `control-sm`. trigger: text `content-secondary` · `radius-md` · hover text `content-primary` · active `bg-surface-2` + text `content-primary` + `shadow-1` (raised pill) |

### Orientation

Horizontal by default. For a side rail (settings-style vertical tabs), add `.tabs--vertical` to the root **and** `.tabs__list--vertical` to the list; the variant (line / default) is orthogonal and unchanged. The root switches to `flex-direction: row` (rail beside the panel), triggers stretch to the rail width and left-align, and:

- `line` — the hairline + the active bar move to the rail's **inline-end** edge (a vertical `primary-700` bar, `scaleY` in) instead of the bottom underline.
- `default` — the pill tray stacks into a column; the raised-pill active state is direction-agnostic, so it needs no change.

Mark the list `role="tablist"` `aria-orientation="vertical"`; arrow-key roving follows the **vertical** axis (↑/↓). Reach for this over a horizontal tab bar only when the layout is a left-rail settings/detail page; a top tab bar stays the default.

## Sizes

No size prop. The trigger is fixed at `text-md` / `font-medium`. Geometry is variant-driven, not size-driven:

- `line` trigger — padding `px-cx-sm` (`12px`) both axes, pulled `-1px` down so its underline overlaps the list hairline.
- `default` list — fixed height `control-sm` (28px); trigger fills it (`calc(100% - 2px)`) with `px-cx-sm`-ish (`12px`) inline padding.

## States

- **hover** — `line`: no surface change, text only lifts on active; `default` (non-active): text `content-secondary → content-primary`.
- **active / selected** (`data-active`, from base-ui) — `line`: text `content-primary` + `font-semibold` + the underline indicator scales in (`scale-x-0 → 1`, `duration-normal` `ease-emphasized`); `default`: raised pill (`bg-surface-2` + `shadow-1`) + text `content-primary`. Selected always wins over hover.
- **focus-visible** — `shadow-focus` ring, `radius-md`. Never removed.
- **disabled** (`:disabled` / `aria-disabled`) — `cursor-not-allowed` + text `content-disabled`.

## Anatomy

```
Tabs (root, flex column, gap-2)
├── TabsList            ← the bar; owns the variant (line tray-less / default pill tray)
│   ├── TabsTrigger     ← [ icon? ] label  · one per panel; the active one carries data-active
│   ├── TabsTrigger
│   └── …
└── TabsContent         ← the panel for the active trigger (flex-1, no outline)
    └── …
```

Trigger is `[ icon? ] label`: inline flex, `gap-2`, icons default `size-4` (16px), `whitespace-nowrap`. In the `line` variant the underline is an `::after` element inset to the label box (`inset-x: px-cx-sm`), `2px` tall, `primary-700`, animating its `scale-x`.

**A trigger carries a label only (optionally a leading icon) — never a count / quantity / status `badge`.** A tab is navigation, not a metric surface: putting a number on it (e.g. `Orders 12`, a drift/attention count) duplicates a quantity that belongs *inside* the panel — where the collection's `summary-bar` count already carries it (see [`detail-page`](../patterns/detail-page.md) · *the count in the summary-bar carries the quantity*). Attention that a panel needs work is surfaced by the panel's own content (an `Alert`, an empty/warning state), not by a badge on the trigger. Keeping triggers label-only also holds every tab at one weight, so the active tab doesn't widen and nudge its neighbours.

## Accessibility

- Real tab semantics from base-ui (`Tabs.Root` / `.List` / `.Tab` / `.Panel`): roving arrow-key focus along the list, `aria-selected` on the active tab, panel `role="tabpanel"` wired to its tab. Handled by the primitive.
- `orientation` (default `horizontal`) sets `data-orientation` and the arrow-key axis.
- Focus ring (`shadow-focus`) is never removed.
- Each trigger needs a discernible name (label text, or `aria-label` if icon-only).

## Artifact behavior (vanilla JS — paste, don't improvise)

The CSS above is a static skin; in a self-contained HTML artifact, wire it with this
progressive-enhancement snippet (CSP-safe, no deps). The skin renders without JS.

```js
(function () {
  document.querySelectorAll('.tabs').forEach(function (root) {
    var triggers = Array.from(root.querySelectorAll('.tabs__trigger'));
    var panels   = Array.from(root.querySelectorAll('.tabs__content'));

    function activate(trigger) {
      // Deactivate all
      triggers.forEach(function (t) {
        t.classList.remove('tabs__trigger--active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      // Hide all panels.
      // Guard: setting element.hidden=true adds [hidden] which CSS styles as
      // display:none, but only if the browser respects [hidden]. We also remove
      // a 'is-active' class to be safe. Use hidden attribute (not display toggle)
      // so CSS overrides stay in control.
      panels.forEach(function (p) { p.hidden = true; });

      // Activate the clicked trigger
      trigger.classList.add('tabs__trigger--active');
      trigger.setAttribute('aria-selected', 'true');
      trigger.setAttribute('tabindex', '0');

      // Show the matching panel via aria-controls or matching index
      var panelId = trigger.getAttribute('aria-controls');
      var panel = panelId
        ? root.querySelector('#' + panelId)
        : panels[triggers.indexOf(trigger)];
      if (panel) panel.hidden = false;
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        activate(trigger);
      });

      // Roving arrow-key focus along the trigger list
      trigger.addEventListener('keydown', function (e) {
        var idx = triggers.indexOf(trigger);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = triggers[(idx + 1) % triggers.length];
          next.focus(); activate(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = triggers[(idx - 1 + triggers.length) % triggers.length];
          prev.focus(); activate(prev);
        } else if (e.key === 'Home') {
          e.preventDefault(); triggers[0].focus(); activate(triggers[0]);
        } else if (e.key === 'End') {
          e.preventDefault();
          var last = triggers[triggers.length - 1];
          last.focus(); activate(last);
        }
      });
    });

    // Initialise: activate the first --active trigger, or the first trigger
    var initial = root.querySelector('.tabs__trigger--active') || triggers[0];
    if (initial) activate(initial);
  });
})();
```

**Markup expected:**
```html
<div class="tabs">
  <div class="tabs__list tabs__list--line" role="tablist">
    <button class="tabs__trigger tabs__trigger--active"
            role="tab" aria-selected="true" aria-controls="panel-1" tabindex="0">Tab 1</button>
    <button class="tabs__trigger"
            role="tab" aria-selected="false" aria-controls="panel-2" tabindex="-1">Tab 2</button>
  </div>
  <div class="tabs__content" id="panel-1" role="tabpanel">Panel 1 content</div>
  <div class="tabs__content" id="panel-2" role="tabpanel" hidden>Panel 2 content</div>
</div>
```
The `hidden` attribute on inactive panels sets `display:none`; the CSS `.tabs__content` rule does not set `display:none` itself, so the `hidden` attribute is the correct toggle (not a class swap).

## Implementations

- **Next / @cloud/ui** — `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@cloud/ui"`. base-ui `Tabs` under the hood; `TabsList` takes `variant` (`line` | `default`). **Behavior — selection, roving focus, keyboard, panel wiring — is owned by the React/base-ui implementation; the reference CSS expresses the static skin only.** Do not re-skin via `className`; pick a list variant.
- **Artifact (self-contained HTML)** — use `.tabs` > `.tabs__list` (+ `.tabs__list--line` / `.tabs__list--default`) > `.tabs__trigger` (mark the open one `.tabs__trigger--active`, the skin can't observe live selection) and `.tabs__content`, on top of the inlined `release/tokens.inline.css`. Same variant names, same token recipe.
