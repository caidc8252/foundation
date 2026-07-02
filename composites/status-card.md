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
    └─ .status-card__footer-end        right cluster (icon button + count; future actions)
```

## Slots

| slot | token recipe |
|---|---|
| root | `.card` frame; add `.card--interactive` for the clickable hover treatment |
| `__head` | grid `auto 1fr auto`, `align-items:center`, column gap `space-3` |
| `__media` | `object-tile` (default `--md`); `flex-shrink:0` |
| `__heading` | `card__title` (text-md/600) + optional status `badge`; column, gap `space-1` |
| `__trailing` | chevron, `content-tertiary` → hover `content-secondary`; decorative (`aria-hidden`) in interactive mode |
| `__description` | `text-xs` / `content-tertiary`; **optional** |
| `__footer-start` / `__footer-end` | flex clusters (gap `space-2`); end is right-aligned |

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
- Footer left/right split is provided by `__footer-start` / `__footer-end`; future action buttons go in a cluster as a `btn` group — no new slot needed.

## Implementations

- **Artifact (self-contained HTML)** — `.card.status-card` (no `.card__header`) + `.card__content` + `.card__footer`, on top of inlined `release/tokens.inline.css` + `primitives/primitives.css` + `release/composites.css`.
