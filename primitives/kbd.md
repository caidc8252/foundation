# Kbd

A keyboard key cap for shortcut hints — one glyph or word per cap (`⌘`, `K`, `esc`), chained side by side for chords (`⌘ ⇧ P`).

> **Contract scope.** This file is the cross-consumer *design contract*: the token
> recipe, anatomy, a11y. It is the authority both implementations answer to. It
> deliberately does NOT document React prop *types* — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## When to use

Show a keyboard shortcut in prose, a tooltip, an empty state, or beside a control
("Press `⌘K`"). Inside a menu row, the shortcut belongs in that menu's own
`__shortcut` slot (`dropdown-menu__shortcut` / `command__shortcut`), which renders
the same idea inline — use `.kbd` for standalone hints elsewhere.

## Anatomy

```
kbd.kbd   one cap — a glyph (⌘ ⇧ ↵ ↑ ↓ esc) or a single letter/word

⌘ K       a chord = several .kbd caps in a row (author spaces them)
```

- A single `.kbd` is one cap: `min-width` and `height` are equal so single keys read square; multi-character keys (`esc`, `Tab`) grow with horizontal padding.
- A chord is just several `.kbd` elements in sequence — there is no wrapper class; the author separates them with a normal space or gap.
- Content is text — modifier **glyphs** (`⌘ ⇧ ⌥ ⌃ ↵ ⌫ ↑ ↓ ← →`) or short words (`esc`, `Tab`). No icon SVGs, no emoji.

## Sizes

One size — `text-xs`, `space-5` (20px) tall cap. It sits inline with `text-sm`/`text-md` body text.

## States

None — `.kbd` is presentational and non-interactive (a `<kbd>` element, not a button). It has no hover/focus/disabled states.

## Accessibility

- Use the semantic `<kbd>` element so assistive tech announces it as keyboard input.
- The glyph/word is the accessible content; keep it literal (`esc`, not an icon) so it is readable.
- A `.kbd` is a hint, not a control — it is not focusable and carries no `role`/`aria` beyond the native element.

## Implementations

- **Next / @cloud/ui** — a thin `Kbd` wrapper over the `<kbd>` element with the token recipe; chords are sibling `Kbd`s. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — a `<kbd class="kbd">` per cap; place several in a row for a chord. Styled by `./primitives.css` on top of the inlined `release/tokens.inline.css`.
