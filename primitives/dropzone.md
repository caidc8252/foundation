# Dropzone

Presentation-only file-select zone with drag-and-drop affordance. Emits picked files; never performs the upload — the host wires `@cloud/storage` and feeds per-file status/progress back via `FileRow`. CSP-safe; no network code.

## States

| state | visual recipe |
|---|---|
| rest | border dashed `line-default` · bg `surface-2` · text `content-tertiary` |
| hover | bg `surface-hover` |
| drag-active (`.dropzone--drag`) | border `primary-500` · bg `primary-50` |
| disabled (`.dropzone--disabled`) | cursor not-allowed · opacity 60% (hover suppressed) |

## Sizes

No size prop — grows with content; minimum height 128px (layout floor, no sizing token). Inner padding `px-6 py-8`.

## Anatomy

```
┌ dropzone ──────────────────────────────────┐  ← dashed border, rounded-xl, min-h 128px
│           (hidden <input type="file">)      │
│    ⬆  Drop files here or click to browse   │  ← children (icon + prompt text)
└────────────────────────────────────────────┘

┌ file-list ─────────────────────────────────┐  ← <ul> placed below the zone
│ 📄 report.pdf    2.0 KB             ✓   × │  ← .file-row (status done)
│ 📄 data.csv  ░░░░░░░░░░░░░░░░  45%      × │  ← .file-row (status uploading)
│ 📄 bad.bin   Type not allowed        ✕   × │  ← .file-row (status error)
└────────────────────────────────────────────┘
```

**`FileRow` sub-components:**

- **`__icon`** — generic file glyph; `content-tertiary`, `size-4` (16px).
- **`__body`** — flexible body column:
  - **`__name-row`** → `__name` (truncated, `content-primary`) + `__size` (mono `text-2xs`, `content-tertiary`).
  - `<progress>` bar shown while `status === "uploading"` (uses the `.progress` primitive).
  - **`__error`** — `text-xs`, `error-strong`; shown while `status === "error"`.
- **`__status--done`** — trailing success glyph (`success-strong`).
- **`__status--error`** — trailing error glyph (`error-strong`).
- Remove button — a `ghost` `icon-sm` `.btn` slot; needs an `aria-label`.

## Accessibility

- The outer `<label>` makes the whole zone a click target for the hidden `<input type="file">`. Set `aria-disabled` when disabled.
- Each `FileRow` remove button needs an `aria-label` (translate at the call site).
- Status glyphs (`__status--done`, `__status--error`) are decorative (`aria-hidden`); the `__error` text provides the accessible description.

## Implementations

- **Next / @cloud/ui** — `import { Dropzone, FileList, FileRow } from "@cloud/ui"`. `Dropzone` wraps a hidden `<input type="file">`; `FileRow` is presentation-only and requires the host to drive `status`/`progress` via props. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.dropzone` (+ `.dropzone--drag`, `.dropzone--disabled`) containing a `class="sr-only"` hidden input; `.file-list` + `.file-row` (+ `__icon`, `__body`, `__name-row`, `__name`, `__size`, `__error`, `__status--done|error`) in `primitives/primitives.css` on top of `dist/tokens.inline.css`.
