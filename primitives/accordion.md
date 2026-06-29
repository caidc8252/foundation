# Accordion

A vertical stack of collapsible disclosure sections. Each item is a header
trigger that expands/collapses one panel of content. Use for grouped, scannable
detail that doesn't all need to be open at once (FAQ, settings groups, nested
detail panels).

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, token recipe, states, a11y. It is the authority both implementations
> answer to. It deliberately does NOT document React prop *types* or base-ui
> specifics (single vs. multiple open, controlled value, the panel height
> animation) — those live with the Next implementation (`@cloud/ui` + the `ui`
> skill). When the contract and an implementation disagree, the contract is
> right and the implementation is a bug.

## Variants

Single visual form. No variant prop — the only authored axis is arrow placement
and whether the arrow shows at all:

| axis | options | token recipe |
|---|---|---|
| arrow position | `right` *(default)* / `left` | chevron sits after / before the trigger label; same `size-3.5` glyph either side |
| arrow | shown *(default)* / hidden | hidden drops the chevron slot entirely (`showArrow={false}`) |

## Anatomy

```
┌ accordion (border line-subtle · radius-md · overflow-hidden) ─────┐
│  accordion__item                                                  │
│  ┌ accordion__trigger (header · bg surface-2) ─────────────────┐  │
│  │  [arrow?]  trigger label …………………………………  [arrow?] ⌄         │  │  ← py-3 px-4
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌ accordion__content (panel · bg surface-1) ──────────────────┐  │
│  │  panel content …                                            │  │  ← px-4 py-3
│  └─────────────────────────────────────────────────────────────┘  │
│ ───────────────────── divide line-subtle ─────────────────────── │
│  accordion__item …                                                │
└───────────────────────────────────────────────────────────────────┘
```

- **Root** — a column flex container. Owns the outer border (`line-subtle`),
  `radius-md`, and `overflow-hidden` (so the first/last item's surface clips to
  the rounded corners). A hairline `line-subtle` divider sits *between* items
  (divide-y), not above the first or below the last.
- **Item** — a transparent grouping wrapper; carries the expanded state that the
  trigger arrow reads.
- **Trigger** — a full-width `<button>` inside the item's header. `flex` with
  `gap-2`, vertical padding `space-3`, horizontal `space-4`. `text-sm` / 500 /
  `content-primary` on a `surface-2` ground. Label is a flex-1 left-aligned
  truncating slot; the chevron is the leading or trailing fixed slot.
- **Arrow** — a 14px (`size-3.5`) chevron-down in `content-tertiary`,
  non-interactive, that rotates 180° when its item is expanded.
- **Content** — the collapsible panel. The wrapper clips (`overflow-hidden`) and
  animates height; the inner padded surface is `surface-1`, padding `space-4`
  inline / `space-3` block, `text-xs` / `content-secondary`. The lighter
  `surface-1` panel reads as recessed beneath the `surface-2` header.

## States

- **expanded / collapsed** (`aria-expanded` on the trigger / item) — drives the
  arrow rotation (0° → 180°) and shows/hides the panel. No fill change on the
  trigger itself for expansion; expansion is signalled by the arrow + the
  revealed panel.
- **hover** (trigger) — ground steps to `surface-hover`.
- **focus-visible** (trigger) — a 2px **inset** ring in `line-focus` (inset so
  the ring doesn't bleed past the clipped root border). Never removed.
- **disabled** (`aria-disabled` on the trigger) — `cursor-not-allowed` +
  `opacity-50`.

## Accessibility

- Real disclosure semantics from base-ui: each header is a `<button>` carrying
  `aria-expanded` and controlling its panel via `aria-controls`; the panel is
  labelled back by the header. Enter / Space toggle; Arrow keys / Home / End
  roam between triggers — all owned by the React primitive.
- The chevron is decorative (`pointer-events-none`) — the accessible name is the
  trigger's text content, not the icon.
- Focus ring (`line-focus`, inset) is never removed.

## Artifact behavior (vanilla JS — paste, don't improvise)

The CSS above is a static skin; in a self-contained HTML artifact, wire it with this
progressive-enhancement snippet (CSP-safe, no deps). The skin renders without JS.

```js
(function () {
  document.querySelectorAll('.accordion').forEach(function (root) {
    root.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;

        var item = trigger.closest('.accordion__item');
        if (!item) return;
        var isOpen = item.classList.contains('accordion__item--open');

        // Toggle this item (leave siblings alone — "multiple open" is the default;
        // for "single open" behaviour, close siblings first — see comment below)
        if (isOpen) {
          item.classList.remove('accordion__item--open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('accordion__item--open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard: Space / Enter already fire click on <button>; add Home/End roaming
      trigger.addEventListener('keydown', function (e) {
        var triggers = Array.from(root.querySelectorAll('.accordion__trigger:not(:disabled)'));
        var idx = triggers.indexOf(trigger);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (idx + 1 < triggers.length) triggers[idx + 1].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx > 0) triggers[idx - 1].focus();
        } else if (e.key === 'Home') {
          e.preventDefault(); triggers[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault(); triggers[triggers.length - 1].focus();
        }
      });
    });

    // For "single open" (accordion-style), replace the click handler body with:
    //   root.querySelectorAll('.accordion__item').forEach(function(i){
    //     i.classList.remove('accordion__item--open');
    //     i.querySelector('.accordion__trigger').setAttribute('aria-expanded','false');
    //   });
    //   item.classList.add('accordion__item--open');
    //   trigger.setAttribute('aria-expanded','true');
  });
})();
```

**Markup expected:**
```html
<div class="accordion">
  <!-- open item -->
  <div class="accordion__item accordion__item--open">
    <button class="accordion__trigger" aria-expanded="true">
      <span class="accordion__label">Section 1</span>
      <span class="accordion__arrow" aria-hidden="true">&#x2304;</span>
    </button>
    <div class="accordion__content">
      <p>Panel content here.</p>
    </div>
  </div>
  <!-- closed item -->
  <div class="accordion__item">
    <button class="accordion__trigger" aria-expanded="false">
      <span class="accordion__label">Section 2</span>
      <span class="accordion__arrow" aria-hidden="true">&#x2304;</span>
    </button>
    <div class="accordion__content">
      <p>Panel content here.</p>
    </div>
  </div>
</div>
```
CSS shows `.accordion__content` when the parent `.accordion__item--open` is set, and rotates `.accordion__arrow` when `aria-expanded="true"` is on the trigger — no inline style needed.

## Implementations

- **Next / @cloud/ui** — `import { Accordion, AccordionItem, AccordionTrigger,
  AccordionContent } from "@cloud/ui"`. base-ui `Accordion` under the hood;
  single-vs-multiple open, controlled `value`, and the panel
  height/open-close animation (`--accordion-panel-height`,
  `animate-accordion-down/up`) are **behavior owned by the React
  implementation** — the reference CSS below expresses the static skin only
  (surface, border, radius, divider, padding, type, arrow rotation, states),
  not the height transition. `AccordionTrigger` props `arrowPosition`
  (`"left" | "right"`), `showArrow`, and a custom `arrow` node tune the chevron
  slot. API details: the `ui` skill. Don't re-skin via `className`.
- **Artifact (self-contained HTML)** — compose `.accordion` › `.accordion__item`
  › (`.accordion__trigger` with an `.accordion__arrow` span) + `.accordion__content`,
  on top of the inlined `release/tokens.inline.css`. Mark an open item with
  `aria-expanded="true"` on the trigger (rotates the arrow); the static skin
  shows the panel of an `.accordion__item--open` item — it can't run base-ui's
  height animation. Same token recipe, same names.
