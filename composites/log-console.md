# Log console

A structured **logcat** viewer — a toolbar (level filter · text filter · download) over a dense, monospace, level-coloured row list with expandable rows. For collecting and reading Android device logs off a POS fleet.

## When to use

- **`log-console`** — streamed / collected **log lines** parsed into columns (time · pid/tid · level · tag · message), scanned by severity. For device diagnostics, crash triage, field debugging.
- Not for prose activity feeds (use `feed-list` / `timeline`), nor a single copyable snippet.

## Anatomy

```
┌ toolbar ─────────────────────────────────────────────────────────┐
│ [V][D][I][W][E][F]   🔍 filter tag/text            [⬇ Download]    │
├───────────────────────────────────────────────────────────────────┤
│ 12:34:57.220  1180-1233  W  BatteryMgr   Battery temp 41.2°C …     │
│ 12:34:58.004  1180-1201  E  PaymentSvc   EMV kernel timeout …      │ ← rail + wash
│ 12:34:58.115  1180-1201  E  AndroidRuntime FATAL EXCEPTION …       │ ← expandable
│    └ full stack trace (when expanded)                              │
└───────────────────────────────────────────────────────────────────┘
```

- `.log-console` — bordered surface, flex column.
- `.log-console__toolbar` — a multi-select `.toggle-group` (V/D/I/W/E/F level toggles) + a reused `.search-input` + a `.log-console__download` button (reuses `.btn`).
- `.log-console__viewport` — the scrolling row region (`max-block-size` default; override per use).
- `.log-console__row` — one line: a fixed 5-column grid (`time · pid · level · tag · msg`) so columns align down the list. Level modifier `--v/--d/--i/--w/--e/--f`. Optional `--expandable` / `--expanded` + a `.log-console__detail` (full message / stack).
- `.log-console__empty` — shown when nothing matches the filter.

## Levels

Muted for the noise (V/D/I); status-coloured for what you scan for (W/E/F), which also get a coloured left rail — E/F additionally a faint wash.

| level | glyph colour | row |
|---|---|---|
| `V` verbose | `content-tertiary` | — |
| `D` debug | `info` | — |
| `I` info | `content-secondary` | — |
| `W` warn | `warning` | warning left rail |
| `E` error | `error` | error rail + `error-bg` wash |
| `F` fatal | `error-strong` | error-strong rail + `error-bg` wash |

## States

- `--expanded` — reveals `.log-console__detail` (full message / stack) and unwraps the message line.
- Filtered-out rows are hidden by the consumer's handler; `.log-console__empty` covers the none-match case.

## Behavior (consumer)

Presentation only; the consumer wires:

- **level toggles** — show/hide rows by level; a multi-select `.toggle-group` where `aria-pressed="true"` marks an on level.
- **text filter** — substring match over tag + message.
- **expand** — toggle `--expanded` on a `--expandable` row.
- **download** — export the (filtered) lines as text.

- **Next / @cloud/ui** — `import { LogConsole } from "@cloud/ui"`; props `lines` (`{time,pid,level,tag,msg,detail?}[]`), `levels`, `query`, `onDownload`.
- **Artifact** — a small inline script (see `log-console.html`).

## Accessibility

- Level is the glyph letter + text, never colour alone.
- The viewport scrolls and is keyboard-focusable; an expandable row exposes an accessible toggle.

## Implementations

- **Artifact (self-contained HTML)** — `.log-console` › `.log-console__toolbar` (a `.toggle-group.toggle-group--outline` of `.toggle-group__item` level toggles, a `.search-input`, a `.btn…log-console__download`) › `.log-console__viewport` of `.log-console__row.--<level>` (each `.log-console__time/__pid/__level/__tag/__msg`, optional `.log-console__detail`). Classes in `composites.css`, over primitives + the inlined tokens.
