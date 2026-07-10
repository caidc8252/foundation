# Status card

A header-less card — content + footer, no `CardHeader` — for repeating status lists: a media-led heading (icon + title + status badge) over an optional description, with a control footer.

## Anatomy

```
status-card ( = .card , no .card__header ; add .card--interactive when clickable )
├─ .card__content              reused slot — owns padding (card size)
│   └─ (.stack.stack--3)       vertical rhythm
│      ├─ .status-card__head          grid: [ media | heading | trailing ]
│      │   ├─ .status-card__media      optional · object-tile / logo
│      │   ├─ .status-card__heading    card__title + status badge (optional)
│      │   │    └─ .status-card__link  (interactive) <a href> / <button>; ::after stretches
│      │   └─ .status-card__trailing   optional · chevron (decorative when interactive)
│      └─ .status-card__description    optional · all content below the heading
└─ .card__footer               reused slot — top hairline
    ├─ .status-card__footer-start      left cluster (switch + label …)
    └─ .status-card__footer-end        right cluster (icon button + count; additional actions)
```

## Slots — required vs. optional

The frame, the content slot, the heading, the title, and the footer are always
present — a status-card **is** a `.card` with `.card__content` + `.card__footer`
and **no** `.card__header`. Everything else is included only when the object
needs it; most cards render a subset.

| slot | required? | recipe / include when |
|---|---|---|
| root `.card.status-card` | **yes** | `.card` frame; add `.card--interactive` when the whole card is a link |
| `.card__content` | **yes** | reused card slot; owns padding. Wrap blocks in `.stack.stack--3` |
| `.status-card__head` | **yes** | grid `auto 1fr auto`, `align-items:center`, column gap `space-3` |
| `.status-card__heading` | **yes** | column, gap `space-1`; holds the title (+ optional badge) |
| `card__title` | **yes** | the object's name — `text-md` / 600 / `content-primary` |
| status `badge` | no | the object has a state worth surfacing — `--warning` / `--error` / `--success` |
| `.status-card__media` | no | a leading `object-tile` / logo (default `--md`); `flex-shrink:0` |
| `.status-card__trailing` | no | a trailing chevron; `content-tertiary` → hover `content-secondary`. Decorative (`aria-hidden`) when the card is interactive |
| `.status-card__link` | no | interactive only — one `<a href>` / `<button>` wrapping the title; its `::after` stretches the hit-area (see Interactive) |
| `.status-card__description` | no | one or more lines below the heading — `text-xs` / `content-tertiary` |
| `.card__footer` | **yes** | reused card slot; top hairline. The defining control strip — drop it and it's a plain `card`. Vertical padding tightened to `space-3` |
| `.status-card__footer-start` | no | start cluster (switch + label …); flex, gap `space-2` |
| `.status-card__footer-end` | no | end cluster, inline-end aligned (`margin-inline-start:auto`); an icon button + count, or a `btn` action group |

## Sizes

Inherit `card` `sm` / `md` (default) / `lg` — slot padding comes from the card size.

## Interactive (stretched link)

Whole-card click without nesting interactive elements:

- One primary action `.status-card__link` — `<a href>` (navigate) or `<button>` (open modal) — wrapping `card__title`. Root `position:relative`; `.status-card__link::after { position:absolute; inset:0 }` stretches the hit-area over the whole card.
- Footer clusters get `position:relative; z-index:1`, so `switch` / buttons render above the stretched `::after` and take their own clicks — they are separate DOM nodes, not nested → valid + accessible.
- The trailing chevron is `aria-hidden` decoration in interactive mode. Reuse `.card--interactive` for the hover lift.
- Trade-off: the stretched `::after` blocks text selection inside `__description`.

## States

No new state class. Status is expressed by the `badge` variant (`--warning` / `--error` / `--success`) plus optional semantic text color inside `__description`.

## Accessibility

- One link/button per card, named by the title (or `aria-label` on `__link`).
- Footer `switch` is a real labelled toggle; the bell is an icon button with an accessible label and its count exposed.
- The container has no role of its own (same contract as `card`).

## Notes

- `card__content` owns padding; do not pad the root. Wrap the content blocks in `.stack.stack--3` (base `.stack` supplies `display:flex`; `--3` the gap) for vertical rhythm.
- Footer left/right split is provided by `__footer-start` / `__footer-end`; additional action buttons go in a cluster as a `btn` group — no new slot needed.

## Implementations

- **Artifact (self-contained HTML)** — `.card.status-card` (no `.card__header`) + `.card__content` + `.card__footer`, on top of inlined `release/tokens.inline.css` + `primitives/primitives.css` + `release/composites.css`.
