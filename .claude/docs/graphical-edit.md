# Graphical modification & the 3→2 handoff (Responsibilities ③ + ②)

> Detail doc for foundation **Responsibility ③ — graphical modification** and how
> it hands back into **Responsibility ② — maintaining the four-layer source**.
> The overview is [`AGENTS.md`](../../AGENTS.md); the source-maintenance flow it
> hands into is [`foundation-maintenance-guide.md`](./foundation-maintenance-guide.md)
> and the governance law is [`governance/token-change.md`](../../governance/token-change.md)
> + [`governance/enforcement.md`](../../governance/enforcement.md).

Responsibilities ② and ③ are two ends of one loop: the GUI lets you *change the
design visually*; the four-layer source is the only thing that *counts as
changed*. This doc is the bridge — what the GUI can touch, where its edits land,
and how to promote them so the source re-passes validation.

## The tool

```bash
pnpm admin            # node admin/server.mjs → http://localhost:4100
```

A browser GUI (`admin/ui/`) over an API (`admin/server.mjs`). It lists every
catalogued primitive / composite / pattern, renders each in a live preview
iframe, and lets you inspect an element to see the exact tokens it resolves
from — then edit those values or references and watch the preview update.

## Golden rule: the GUI writes a draft, never the source

**Every graphical edit is sandboxed.** It is written to `admin/.draft/` — a
gitignored scratch copy — and the real `tokens/`, `primitives/primitives.css`,
`composites/composites.css` are left untouched. The draft is a
**preview-and-stage** mechanism, not a publish mechanism.

What an edit does, end to end (`admin/lib/edit.mjs`, `admin/lib/draft.mjs`):

1. On the first edit, `ensureDraft()` copies `tokens/`, `primitives/primitives.css`,
   and `composites/composites.css` into `admin/.draft/`, and seeds
   `admin/.draft/.changes.json` with `[]`. (`patterns/` is deliberately **not**
   copied — patterns are never drafted.)
2. The edit rewrites the matching declaration **in the draft file** via a surgical
   regex (first/canonical declaration only).
3. For value/alias edits, `buildDraftTokens()` re-emits **only**
   `admin/.draft/dist/{tokens.inline.css,tokens.json}` (via the same
   `emit/build.mjs`) so the preview reflects the change. (Reference swaps need no
   rebuild — component CSS is inlined into the preview directly.)
4. The edit is appended to `admin/.draft/.changes.json` — `{kind, target, detail}`
   per change. This is the changeset you promote from.
5. The preview reads the draft transparently once it exists (`activeRoot()` in
   `admin/lib/paths.mjs`). The component **list** is never drafted — only token
   values and references are.

The UI shows a draft banner ("草稿:N 处改动") with a single **discard** button.
There is **no save / apply / publish / commit** affordance — and that is by
design: landing a change is a Responsibility-② action, governed below.

## What the GUI can — and cannot — express

It edits *values and references of things that already exist*. Anything
*structural or additive* stays a hand edit under `governance/token-change.md`.

| Can express (draft edit) | Endpoint |
|---|---|
| Change a **token value** (OKLCH sliders or free-text CSS; rewrites the first/light declaration — any `@media (prefers-reduced-motion)` or dark override is left untouched) | `POST /api/value` → `setTokenValue` |
| **Repoint a semantic alias** to a sibling ramp token (`--alias: var(--other)`) | `POST /api/reference {alias,toToken}` → `repointAlias` |
| **Swap one property's token reference** inside a single primitive/composite rule | `POST /api/reference {layer,selector,prop,fromToken,toToken,pseudo?}` → `setReference` |

| Cannot express — still hand-edit + `token-change.md` |
|---|
| **Add a new token** (the GUI only rewrites existing `--name:` declarations) |
| **Add / remove a primitive or composite**, or any new selector / rule / declaration |
| **Add or change a `/* @component <slug> */` marker** (drives catalog class-attribution) |
| **Edit a pattern or any contract `.md`** (`patterns/`, `*.md` — never drafted) |
| **Rename or move a token**, or edit the dark / `@media` value (only the light declaration is rewritten) |

> Bounded limitation: both `setTokenValue` and `setReference` rewrite the **first**
> match only — the canonical rule for every component currently exposed. A future
> component with the same selector/token in multiple canonical rules would need a
> guard.

## The 3→2 handoff: promote a draft into the source

There is **no automated promote path today** — moving a draft into the governed
source is a manual step. The draft is a staging area; `.changes.json` is the
to-do list. Procedure:

1. **Make the changes** in the GUI; confirm them in the live preview.
2. **Review the changeset** — `admin/.draft/.changes.json` (or `GET /api/draft/status`)
   is the authoritative list (`kind` / `target` / `detail` per entry).
3. **Promote into the real source** — apply each change to the **source** file
   (not the draft, not `release/`):
   - `kind:"value"` and alias repoints → `tokens/<file>.css` (the same `defFile`
     the draft edited under `admin/.draft/tokens/`).
   - `kind:"reference"` → `primitives/primitives.css` or `composites/composites.css`.
   - Reliable transcription: diff the draft against source and apply the hunks —
     `diff -ru tokens admin/.draft/tokens`,
     `diff -u primitives/primitives.css admin/.draft/primitives/primitives.css`
     (and the composites equivalent). The draft differs from source only in the
     edited declarations, so the diff is small and surgical.
4. **Rebuild** the snapshots: `pnpm build` (regenerates `release/*` and
   `versions/v1/*` from the now-edited source). Never hand-edit generated files.
5. **Discard the draft** so it can't drift — the discard button,
   `POST /api/draft/discard`, or `rm -rf admin/.draft`.
6. **Validate** (next section).

## How it re-passes validation

After promotion + `pnpm build`, the same guards that govern any source edit tie
the graphical change back into the four-layer law:

```bash
pnpm check:all      # = check:release  →  check:examples --strict  →  check:patterns
```

- **`pnpm check:release`** (`scripts/check-release.mjs`) is **the backstop.** It
  re-runs `emit/build.mjs` and `git diff --exit-code -- release versions` — asserting
  the committed snapshots are byte-identical to a clean rebuild from source. This
  catches the two failure modes a GUI-originated change introduces: *edited source
  but forgot to rebuild* (stale snapshot → diff), and *hand-edited a snapshot
  instead of the source* (rebuild overwrites it → diff). It is exactly what makes a
  graphical change "count" only once it lives in the real `tokens/` /
  `primitives/` / `composites/` layer — the boundary between Responsibility ③
  (preview/stage) and Responsibility ② (governed source of truth).
- **`pnpm check:examples --strict`** (`scripts/check-examples.mjs`) re-validates the
  bundled example/pattern HTML against the regenerated `release/catalog.json`
  closed set.
- **`pnpm check:patterns`** (`scripts/check-pattern-router.mjs`) verifies
  `patterns/router.json` still aligns with the catalog and contracts.

## Known gap & open questions for maintainers

The single manual step is the source-transcription in promote-step 3. Because the
GUI can only express **build-stable** edits (value/reference rewrites of
declarations that already exist), a copy-back of
`admin/.draft/{tokens,primitives/primitives.css,composites/composites.css}` over
the real source followed by `pnpm build` is guaranteed to keep
`release/ == clean rebuild` — so a `scripts/promote-draft.mjs` (and a
`POST /api/draft/promote`) is the obvious way to close the loop, with `check:release`
as the automatic gate. Decisions for a human before building it:

1. Should promote also `git add`/commit, and use `.changes.json` as the message?
2. Should it refuse when the working tree already has unrelated source edits?
3. Is a GUI affordance for the dark / `@media` value ever wanted, or stay hand-only?
4. The first-match-only rewrite needs a guard if a component ever has the same
   selector/token in multiple canonical rules.
