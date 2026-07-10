# Adding to the foundation — tokens & components

There is one upstream (`@cloud/foundation`) and two downstream consumers (the
React `@cloud/ui` app and self-contained artifacts). **Adding to the closed set —
a token, a primitive, or a composite — is a versioned event, not a local edit.**
This is the single process that keeps the spaces from drifting. (Historically this
file covered tokens only; it now covers components too, because both answer to the
same "one upstream, propose-don't-improvise" law.)

## Before you add anything

Adding is the last resort, in this order of preference:

1. **Reuse** an existing semantic token / primitive / composite. ("Secondary text"
   → `content-secondary`, don't add `content-muted`. A status pill → `badge`, don't
   hand-roll one.)
2. **Reuse** a ramp step or a variant if no semantic name fits.
3. Only if neither exists: propose the new thing — and say which group/layer it
   joins and why nothing covers it.

A real, current gap (a primitive a pattern needs that does not exist yet) is part
of "what is" — add it. A speculative future nicety is not — see `AGENTS.md`.

---

## A · Adding or changing a token

Changing an existing token's *value* is heavier than adding one: it moves every
surface that references it, in both consumers. Treat it as a reviewed design
decision, not a tweak.

## The flow

1. Edit `foundation/tokens/*.css` (the one source). Add to the right layer file
   and, if it has a light value that changes in dark, add the override to
   `dark.css`. Keep semantic shortcuts pointing at ramp steps via `var()`.
2. Run `pnpm build` to regenerate `build/current/` and refresh `release/`
   metadata. Never hand-edit generated snapshot files.
3. Open a PR to the foundation repo. Review covers: name follows the group's
   convention, value is OKLCH, dark override present if needed, no duplicate of
   an existing token.
4. Merge and tag a release (`vX.Y.Z`). Adding tokens is a minor bump; changing a
   value that shifts existing UI is a major bump — call it out.
5. Each consumer syncs on its own schedule by bumping the dependency ref.

### Tailwind-specific notes (for editors)

- `tokens/*.css` author values in `@theme` / `@theme static`. The chart palette
  MUST stay in `@theme static` — it's referenced only at runtime, so a plain
  `@theme` tree-shakes it away. See the comment in `chart.css`.
- `@theme inline` shadcn aliases, `@utility z-*`, `@custom-variant dark`, and
  `@layer base` are Tailwind *mechanism*, not token values — they stay in
  `@cloud/ui`, not here.

---

## B · Adding a primitive or composite

A component is a **contract first** (the `.md` is the law both consumers answer to),
a **reference CSS class set** second, and an optional **HTML example** third. The
catalog's per-component class list is **derived from the CSS** — never hand-written
— so the three stay in lockstep.

1. **Write the contract** `primitives/<name>.md` or `composites/<name>.md`: anatomy,
   rules, states, accessibility, and an **Implementations → Artifact** section. The
   contract wins over either implementation.

2. **Add the reference CSS** to `primitives/primitives.css` (atoms) or
   `composites/composites.css` (building blocks — they may reuse `.btn`/`.input`
   etc., so they load after primitives). Two conventions make the catalog derive
   the component's class list automatically:

   - Open the component's block with a top-level **section header** and, on the
     line immediately under it, a **machine marker** whose slug is the `.md`
     filename:

     ```css
     /* ═══════════════════════════ Stat card ═══════════════════════════ */
     /* @component stat-card */
     .stat-card { … }
     .stat-card__value { … }
     .stat-card--selected { … }
     .stat-grid { … }            /* a non-namespaced satellite — still owned here */
     ```

   - **Every class the component owns lives inside this section** — base,
     `__elements`, `--modifiers`, *and* any non-namespaced satellites (e.g.
     `data-table` owns `.cell-num` / `.col-select` / `.table-frame`; `list-filter`
     owns `.condition-band` / `.search-input` / `.filter-chip`). The marker is how
     `pnpm build` attributes the whole section to the component, so satellites that
     no naming prefix would catch are still listed correctly.

   **Why the marker exists.** The per-component list used to be hand-typed in the
   `.md`'s Artifact prose and drifted below reality (a component would declare 7
   classes while its own sample used 20). Deriving the list from the marked CSS
   section makes the CSS the single source — it cannot drift from itself.

   Marker rules:
   - **Slug = the `.md` filename.** If the visible header text differs (header
     "List condition band" ↔ contract `list-filter`), the marker still reads
     `/* @component list-filter */`.
   - **One section, several contracts:** `/* @component date-picker date-range-picker
     date-time-picker */` tags all of them with the shared section's classes.
   - **Pure utilities get no marker** (Baseline, Stack, auto-fit grids). Their
     classes are in the closed set but belong to no component — that's intended.

3. **Optionally add an HTML example** `<name>.html` — the executable reference. It is
   linted by `check:examples`, so keep it inside the closed set (page-local
   composition in its own `<style>` is allowed; new design vocabulary is not).

4. **`pnpm build`** regenerates `release/catalog.*`: the closed-set class
   whitelist (from the two CSS files) and the per-component lists (from the
   markers). Never hand-edit `release/`.

5. **If a pattern uses the new composite**, add it to that pattern's contract
   (its *Building blocks*) and to the matching route's `composites` in
   `patterns/router.json` — `check:patterns` asserts every `route.composites` entry
   is documented in the pattern contract.

6. **PR + review + release.** Review covers: name follows convention, the
   `@component` marker is present and matches the `.md` slug, the contract is
   complete (not a stub), the example (if any) passes `check:examples --strict`.
   Adding a component is a minor bump.

### The guards (run before you open the PR)

```bash
pnpm build              # regenerate release/ + build/current/ from the sources
pnpm check:release      # generated snapshots match a clean rebuild
node scripts/check-examples.mjs   # every example stays inside the closed set
node scripts/check-pattern-router.mjs   # router ↔ catalog ↔ pattern contracts aligned
```

---

## Where edits may originate

Either space (both are git). A token/component need spotted while building an
artifact is still a PR **to the foundation repo** — never a local patch to the
inlined snapshot, never a divergent edit in the app. One upstream, always.
