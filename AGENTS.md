# `@cloud/foundation` — operating manual

`@cloud/foundation` is a **normative design specification**: it states the rules
**in force**, in the present tense, as the settled law both consumers — the React
`@cloud/ui` app and self-contained artifacts — answer to. When a contract and an
implementation disagree, the **contract wins**. It is **not** a development log,
changelog, roadmap, or scratchpad — write only what **exists and is in force**,
never `deferred` / `future` / speculative entries.

This file is the **map**. The foundation has three responsibilities; each has a
detail doc you go to for the how. Read the responsibility you're here for, then
its doc.

## The closed set — the law under all three

There is **no fifth source**. Everything an artifact renders, everything the GUI
edits, everything the four layers maintain, comes from here:

| # | Layer | Lives in | What it is |
|---|---|---|---|
| ① | **Tokens** | `tokens/*.css` → emitted `release/tokens.inline.css` | the `--*` custom properties (color, space, text, radius, shadow, …) |
| ② | **Primitives** | `primitives/primitives.css` (+ `*.md` contracts) | the atom classes (`.btn`, `.input`, `.badge`, `.field`, …) |
| ③ | **Composites** | `composites/composites.css` → `release/composites.css` (+ `*.md`) | the page-building-block classes (`.page-header`, `.data-table`, `.summary-bar`, …) |
| ④ | **Patterns** | `patterns/*.md` (+ `.html`) | the named screen archetypes (list / detail / create-form) |

**The legal names are enumerated in [`release/catalog.md`](release/catalog.md)**
(human) and **[`release/catalog.json`](release/catalog.json)** (machine). If a
token name, a class, or a pattern is not in the catalog, **it is not part of this
system.** Need something the set can't express? That's a **contract gap, not a
license to improvise** → propose it via [`governance/token-change.md`](governance/token-change.md).
The design law is [`governance/principles.md`](governance/principles.md); how
violations are caught is [`governance/enforcement.md`](governance/enforcement.md).

**Icons** are the one other raw material — inline **Lucide** SVGs, like token
*values* rather than a layer. Obtain by name (`node scripts/icon/icon.mjs search
<intent>` → `get <name>`), paste the exact `<svg>` with `data-lucide` first; never
hand-write a path. Rules: [`primitives/icon.md`](primitives/icon.md).

---

## ① Build a prototype artifact from a requirement

Turn a requirement — which arrives as an **input prompt supplied by the
requester** — into a self-contained HTML/CSS/JS prototype with real interaction
and **cross-screen consistency**, drawn only from the closed set. (That input
prompt and its generation constraints are the caller's; the foundation does not
ship them.)

The operating manual — closed-set rules, how to assemble the page, the frameless
sticky-scroll caveat, find-it-fast, the 7-step AI generation flow, and how to
check your work, with a worked end-to-end example:
[`.claude/docs/artifact-build-guide.md`](.claude/docs/artifact-build-guide.md).

Entry commands:

```bash
node scripts/build-artifact.mjs --list
node scripts/build-artifact.mjs --pattern list-page --out artifacts/customers.html --title "Customers"
node scripts/check-artifact.mjs --strict artifacts/customers.html
```

Start by mapping the request through [`patterns/router.json`](patterns/router.json)
(intent → route → `builderPattern` + the composites it uses).

Optional — a **visual quality pass** (default OFF): if the input prompt carries
`Visual review: on`, then *after* the strict check passes, render each view and
self-critique it against [`governance/composition.md`](governance/composition.md).
See [`governance/enforcement.md`](governance/enforcement.md) → "visual review pass".

---

## ② Maintain the four-layer structure

Keep tokens / primitives / composites / patterns coherent and versioned. The
source of truth is `tokens/*.css`, `primitives/primitives.css`,
`composites/composites.css`, and `patterns/`; `pnpm build` regenerates `release/`
and `build/current/`. Numbered `versions/vN/` directories are saved prototype
snapshots and are not overwritten by build. **Adding to the closed set is a
versioned event, not a local edit** — reuse first, then propose.

- **The maintenance flow** (reuse-first, the guards, versioning, and how to add a
  token / primitive / composite / pattern, with the file map):
  [`.claude/docs/foundation-maintenance-guide.md`](.claude/docs/foundation-maintenance-guide.md).
- **The governance law**: [`governance/token-change.md`](governance/token-change.md)
  + [`governance/enforcement.md`](governance/enforcement.md).

Guards (run before every PR + in CI):

```bash
pnpm build          # regenerate release/ + build/current/ from source — never hand-edit generated files
pnpm check:all      # = check:release → check:examples --strict → check:patterns
```

`release/` is **fully generated**: `check:release` re-runs the build and asserts
the committed snapshot equals a clean rebuild — so nothing landed by hand-editing
a generated file or forgetting to rebuild.

Saved prototype versions may contain editor `tokenOverrides` / `classOverrides`.
Those are candidate visual changes, not publishable foundation law. Before
publishing such a version to `release/`, generate the Agent handoff brief with
the prototype `申请发布` button or `node scripts/promote-version.mjs vN`, promote
the change into source CSS plus the matching contract/example, and translate the
same design fact into `cloud-next-scaffold/packages/ui` when the React `@cloud/ui`
implementation is affected. Run `pnpm build` and validate foundation; validate
the cloud UI companion patch in its own repo. The Agent creates two linked PRs
when needed — a foundation promotion PR and a cloud-next-scaffold UI sync PR —
and reports both URLs rather than leaving PR creation to the requester. After the
foundation PR lands, finalize that same saved snapshot with `pnpm finalize -- vN`.
This rewrites that same `vN` from the promoted source, so publish `vN` after it
becomes clean and the companion UI PR is merged or explicitly recorded as no-op.
The release endpoint refuses versions that still contain unpromoted token or
class overrides.

Saved versions record the governed source Git commit. If an Agent promote edits
the real source incorrectly, restore the governed source paths with
`node scripts/restore-version-source.mjs vN --build` (or release that version
from the prototype dropdown). Do not copy files back from `versions/`;
the snapshots are not complete source backups.

---

## ③ Provide graphical modification

A browser GUI (`pnpm admin` → http://localhost:4100) to inspect every catalogued
component, see the tokens it resolves from, and edit values / references visually
with live preview.

**② and ③ are one loop.** The GUI never writes the real source — it stages every
edit in a gitignored `admin/.draft/` and the four-layer source is the only thing
that *counts as changed*. So a graphical change only lands once it is promoted
into the source (Responsibility ②) and re-passes `pnpm check:all`. What the GUI
can vs. cannot express, where its edits land, the promote procedure, and how
`check:release` is the backstop that ties a GUI change back into the governed law
are all in:

- [`.claude/docs/graphical-edit.md`](.claude/docs/graphical-edit.md) — graphical
  modification **and** the 3→2 handoff.
