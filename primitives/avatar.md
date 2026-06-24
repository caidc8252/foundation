# Avatar

A user/entity identity chip: a circular image that falls back to initials when the image is missing or fails to load.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> size vocabulary, the token recipe, the image→fallback structure, a11y. It is
> the authority both implementations answer to. It deliberately does NOT
> document the React prop *types* or base-ui specifics — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — a circular (`radius-full`) chip that clips its content (`overflow:hidden`). There is no variant prop; what fills the circle is decided by the two content slots (image vs. initials fallback), not a variant.

## Sizes

`size` selects a square box; the fallback initials track the box. Each step maps to an exact existing token.

| size | box | fallback type | use |
|---|---|---|---|
| `sm` | `spacing-control-xs` (22px) | `text-xs` (12) | dense rows, table cells, comment threads |
| `md` *(default)* | 28px → use `spacing-control-sm` | `text-xs` (12) | standard inline identity |
| `lg` | 36px → use `spacing-control-md` | `text-sm` (13) | cards, list leading slot |
| `xl` | 48px → use `--space-12` | `text-lg` (16) | profile headers, account menus |

> The source expresses these as Tailwind `size-control-xs` / `size-7` / `size-9` / `size-12`. The reference CSS pins each to its equivalent token: `sm`→`spacing-control-xs`, `md`→`spacing-control-sm`, `lg`→`spacing-control-md`, `xl`→`--space-12` (raw scale, direct `var()` per token law). The fallback font sizes in the source are `base/sm/xs/xs`; the contract maps them onto the `text-*` ramp.

## States

- **image present** — the `__image` slot renders `object-cover`, filling the circle; the fallback sits beneath and is covered.
- **image missing / loading / errored** — the `__fallback` slot shows: filled `brand-mono` ground with `content-inverse` initials, `font-semibold`. (Decision of when to show the fallback is base-ui's, see Implementations.)
- No hover / focus / disabled / invalid on the chip itself — Avatar is presentational. If it is wrapped in an interactive control (button/link), that wrapper owns those states.
- **selectable text** — disabled (`user-select:none`); the chip is an icon, not copyable text.

## Anatomy

```
.avatar (circle, overflow:hidden, size from --size)
├── .avatar__image     img, object-cover, fills the circle (shown when loaded)
└── .avatar__fallback  initials on brand-mono ground (shown otherwise)
```

`AvatarGroup` stacks several avatars with a negative inline gap so they overlap, each ringed in the page `background` (→ `surface-1`) to read as separated tokens. Used for participant / member lists.

```
.avatar-group (flex, overlap)
├── .avatar (ring surface-1)
├── .avatar (ring surface-1)
└── .avatar (ring surface-1)
```

## Accessibility

- Avatar is decorative-leaning: the image's `alt` carries the identity name; an initials-only fallback conveys no text to AT, so a meaningful `alt` on the image (and/or an adjacent visible name) is required for the identity to be perceivable.
- Not focusable and has no role on its own — it is not a control. Wrap it in a `<button>`/`<a>` (with an accessible name) when it must be activated.
- The fallback initials are visual; do not rely on them as the accessible name.

## Notes

- **Fallback ground token gap.** The component note calls for the `avatar-bg` / `avatar-fg` semantic tokens (which exist: `avatar-bg`→`surface-3`, `avatar-fg`→`content-secondary`), but the actual source paints the fallback `bg-[var(--color-brand-mono)]` + `text-content-inverse` (a higher-contrast brand ground). The contract documents the source as built — `brand-mono` ground + `content-inverse` initials. The `avatar-bg`/`avatar-fg` tokens remain the lower-emphasis alternative for a neutral fallback; reconciling the two (source switch, or retiring the unused pair) is a token-governance decision, not a skin change.
- **Group ring** uses `ring-background`; `background` resolves to `surface-1` in this token system — the ring is the page ground punched between overlapping chips, theme-aware via the token.

## Implementations

- **Next / @cloud/ui** — `import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "@cloud/ui"`. base-ui `Avatar` under the hood; the image-load detection and image→fallback swap are **behavior owned by the React implementation** — the reference CSS expresses the static skin only (circle, size, clip, fallback ground/initials, group overlap+ring). Prop/API details: the `ui` skill. Do not re-skin via `className`; pick a `size`.
- **Artifact (self-contained HTML)** — use `.avatar` + `.avatar--<size>` with an `<img class="avatar__image">` and/or a `<span class="avatar__fallback">` child, on top of the inlined `dist/tokens.inline.css`. For overlapped lists wrap them in `.avatar-group`. A static artifact has no load-detection: render the `__image` when you have a URL, otherwise the `__fallback` — both can coexist (image clips over fallback). Same circle + `brand-mono` fallback recipe, same names.
