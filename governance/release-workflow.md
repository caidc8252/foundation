# Release workflow — publishing a design version

The carbon prototype **editor** lives in the separate [`foundation-maintain`](https://github.com/Newland-Payment-Technology-US-Co-Ltd/foundation-maintain) repo (a static site). This repo (`foundation`) owns the design-system source and the **release machinery**. The two meet through one artifact: a `manifest.json` exported by the editor.

Package manager is **pnpm** (see `pnpm build` / `pnpm check:all` in [`AGENTS.md`](../AGENTS.md)).

## 1. Edit (in foundation-maintain)

```
pnpm serve                 # static server on :4177
# open http://localhost:4177/catalog.html, pick a base version, edit tokens/styles
# click Save → the browser downloads manifest.json
```

The manifest records `baseVersion` + the raw `tokenOverrides` / `classOverrides` / `classOverrideMeta` / `elementOverrides`. CSS is regenerated deterministically on this side — the manifest is the whole handoff.

## 2. Release (in foundation)

Drop the downloaded file into `versions/<vN>/manifest.json`, then:

```
pnpm apply-draft  <vN>  # rebuild the draft snapshot (tokens.inline.css / primitives.css / composites.css / manifest.json) from the manifest
pnpm materialize  <vN>  # rewrite the manifest's elementOverrides (variant/size slot rules) into every matching instance in patterns/*.html + composites/*.html
pnpm promote      <vN>  # generate a handoff brief (versions/<vN>/promote.md); a human or AI promotes the overrides into governed source and commits
pnpm finalize     <vN>  # after source is promoted + git is clean, rebuild a clean snapshot from source and verify it matches the draft
pnpm release      <vN>  # publish the finalized version into release/
```

`<vN>` is a version name like `v3`.

- **apply-draft** wraps `publishSnapshot` (in `scripts/release-lib.mjs`) — the same merge-onto-base logic the old prototype server used on save. Given a bare `path/to/manifest.json` it allocates the next version; given `<vN>` it re-applies `versions/<vN>/manifest.json` in place.
- **materialize** (`node scripts/materialize-version.mjs <vN>`) reads the manifest's `elementOverrides` — composite-slot rules keyed by `{composite, rootClass, path}` — and splices the recorded `classSwaps` into every instance of that composite/pattern via parse5 (from-class guarded, idempotent, `--dry-run` supported). It writes `versions/<vN>/materialize-report.json` with `stats` (matched/changed/skipped) and a `contractTodos` list — one `{composite, file, done:false}` entry per touched composite whose contract `.md` still needs a matching prose update. This only applies to variant/size overrides; token and class overrides are unaffected and still flow through promote below.
- **promote** does not touch source itself — it emits a brief so a person or an AI can apply the token/composite overrides into the governed source (`tokens/`, `composites/…`) and commit. When a `materialize-report.json` exists with pending `contractTodos`, promote appends a "Contract prose TODO" section listing the contract `.md` files that still need a hand-written update — materialize does not edit contract prose itself. This is the "tell an AI what to read" step.
- **finalize** requires a clean git tree and refuses if the draft overrides do not yet match the promoted source. It also refuses if the version has materialized changes and any `contractTodos` entry in `materialize-report.json` is not marked `done: true` — the contract-drift gate.
- **release** copies the finalized snapshot into `release/`.

## 3. Refresh the editor's substrate

The editor previews against version snapshots + a catalog shipped as static assets in `foundation-maintain`. Regenerate them from this repo whenever versions or the catalog change:

```
node scripts/export-maintain-assets.mjs ../foundation-maintain/carbon
```

This writes `versions.json`, `catalog.json`, and per-version CSS into the maintain repo's `carbon/`; commit them there.

## Related

- [`token-change.md`](token-change.md) — changing a token value/contract.
- [`AGENTS.md`](../AGENTS.md) — the operating manual (build, checks, the closed set).
