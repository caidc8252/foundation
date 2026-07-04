# Badge

A small inline label for status or category. Non-interactive by default; can render as a link/element via `render`.

## Tones

Color is driven entirely by **`tone`** — there is no `variant` prop. Each tone maps to a semantic color pair.

| tone | token recipe |
|---|---|
| `neutral` *(default)* | bg `surface-3` · text `content-secondary` · border `line-default` |
| `success` | bg `success-bg` · text `success-strong` · border `success`/25 |
| `warning` | bg `warning-bg` · text `warning-strong` · border `warning`/25 |
| `error` | bg `error-bg` · text `error-strong` · border `error`/25 |
| `info` | bg `info-bg` · text `info-strong` · border `info`/25 |

## The three signals

Beyond **colour**, a badge has two more independent choices — its **shape** and its
**leading adornment**. Each answers one question about the *value*, so the badge's form
follows from the data, not taste:

| signal | the question it answers | choices |
|---|---|---|
| **tone** (colour) | *what does it mean?* (semantic) | 5 tones · §Tones |
| **shape** | *is it a verbatim machine token?* | `pill` vs `tag` · §Shape |
| **leading adornment** | *a live state, a recognizable type, or neither?* | `dot` / `icon` / none · §Leading adornment |

## Shape — is it a literal token?

| shape | use for | result |
|---|---|---|
| `pill` *(default)* | a **word** read as language — a status or a category | radius `radius-full`, sans |
| `tag` | a **verbatim machine token** you'd copy / compare char-by-char — an id, SN, version (`v5.2.14`), hash | radius `radius-sm`, monospace (`font-mono`) |

The box corners **and** the monospace are two cues for the **same** signal ("this is a
literal token"); they always travel together — there is no boxy-sans or round-mono badge.

## Leading adornment — dot · icon · none

The slot before the label holds **at most one** of: a status **dot**, an **icon**, or
nothing. The dot and the icon answer *different* questions, so pick by the badge's job:

| the badge's job | leading slot | why |
|---|---|---|
| a **live state** — Active, Pending, Failed, Offline, Locked, Draft | **`.badge__dot`** | the dot is an abstract *liveness* marker: it means "this is a state" and nothing more — colour + word carry the meaning. A **neutral** live state (Offline, Draft) takes the dot too; the dot marks **liveness, not colour**. |
| a **recognizable type / identity** where a glyph names the kind faster than the word — a visibility lock, an integration mark, a channel type | a leading **icon** (12px) | the icon *carries meaning* — it identifies the kind. Opt-in and rare: use only when the glyph adds recognition the word is slower at. |
| a plain **category / tier / token** — Enterprise, Merchant, `v5.2.14` | **nothing** | the word (or the mono tag) is enough |

- **The one ban — never put an icon on a status.** A ⚠ before "Failed" or a ✓ before
  "Active" is redundant with the tone + word, and it forces a per-status glyph choice
  (⚠ triangle vs ⚠ circle …) that drifts. A status's marker is the **dot**, always.
  The dot's whole advantage is that it needs **no glyph decision** — that is exactly
  what keeps statuses deterministic.
- **dot ≠ icon.** A **dot** is meaningless by design (pure liveness); an **icon** is
  meaningful by design (identity). If the adornment would carry meaning, it's an icon
  (and then it is naming a *type*, not a status). If it only says "this is live", it's a
  dot. **Never both** in one badge.

## Sizes

No size prop — fixed height `h-5` (20px), `text-xs`, `font-medium`, `px-2`. The leading `.badge__dot` is 6px; a leading **identity icon** (§Leading adornment) is clamped to `size-3` (12px), and padding tightens on the icon side via `has-data-[icon=inline-start]:pl-1.5` / `has-data-[icon=inline-end]:pr-1.5`.

## States

- **focus-visible** (only when interactive via `render`) — `shadow-focus` ring.
- **hover** — only when rendered as an `<a>` (interactive); the base `<span>` is static.
- No disabled / invalid states — the badge is a presentational label.

## Anatomy

`[ dot | icon ]? children` — the leading slot carries **either** a status `dot` (a 6px `bg-current` dot — pure liveness) **or** an identity `icon` (12px inline SVG — carries meaning), **never both**, or nothing at all (§Leading adornment). The dot follows the text colour, so it matches the tone and reads a shade darker than the bg.

```
● Active        ← dot   : a live state (liveness marker; no meaning of its own)
[icon] Private  ← icon  : a recognizable type (the glyph identifies the kind)
Enterprise      ← none  : a plain category / label
v5.2.14         ← tag   : a verbatim token (mono, boxy; no dot, no icon)
```

## Accessibility

- Default element is a `<span>` (non-interactive). If made actionable via `render` (e.g. an `<a>`), it gains the focus ring and hover; ensure it has an accessible name.
- Status conveyed by color alone is not accessible — keep the text label; `dot` is decorative (`aria-hidden`).

## Notes

- **Use `tone` for color — there is no `variant`.** The previous `variant` axis (`default`/`secondary`/`destructive`/`outline`/`ghost`/`link`) was removed in DS 2.0, and the compat stubs have now been dropped from the stylesheet too — the skin is tone-only. Migrating old usage: `secondary`→`neutral`, `destructive`→`error`; `default`/`outline`/`ghost`/`link` have no tonal equivalent, so pick the tone that matches the status/category the badge conveys (or `neutral` for a plain label).
- **Semantic `tone` is for status / severity only.** Informational / category / plain-display fields (plan tier, type, category, a bare label) use `tone="neutral"` — never borrow a semantic tone (or a categorical color) to tint or distinguish a non-status field. (See `principles.md` §10.)
- **Form follows the value, not taste** (§The three signals): colour = *what it means*, shape = *is it a literal token?* (`tag`), leading adornment = *live state* (`dot`) / *recognizable type* (`icon`) / *plain* (none). Answer the three from the data and the badge is fully specified.
- `shape="tag"` switches to monospace + `radius-sm` — code-like tokens/IDs only, never prose labels, and it never carries a dot or an icon.

## Implementations

- **Next / @cloud/ui** — `import { Badge } from "@cloud/ui"`. Renders a `<span>` (or any element via `render`); props `tone` `shape` `dot`. API details: the `ui` skill. Color is set entirely by `tone`; there is no `variant` prop.
- **Artifact (self-contained HTML)** — use `.badge` + `.badge--<tone>` (5 tones), optionally `.badge--tag` for the tag shape and `.badge__dot` for a leading status dot, in `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same tonal recipe and names.
