### log-console — tabular logcat viewer: level toggles, filter, expandable rows
Structure: `.log-console > .log-console__toolbar` (level `.toggle-group` + `.search-input` + download btn) `+ .log-console__viewport` (rows). Row: `.log-console__row .log-console__row--{v|d|i|w|e|f}[data-level]` with cells `__time __pid __level __tag __msg`. Expandable rows add `--expandable` (toggles `--expanded`) + `.log-console__detail`. Empty state: `.log-console__empty[hidden]`.
```html
<div class="log-console">
  <div class="log-console__toolbar">
    <div class="toggle-group toggle-group--outline" role="group" data-type="multiple" aria-label="Log levels">
      <button type="button" class="toggle-group__item toggle-group__item--sm" data-level="I" aria-pressed="true">I</button>
      …
    </div>
    <div class="search-input">
      <span class="search-input__icon"><svg data-lucide="search">…</svg></span>
      <input class="input" type="text" placeholder="Filter tag or text…" aria-label="Filter logs">
    </div>
    <button type="button" class="btn btn--primary btn--md log-console__download"><svg data-lucide="download">…</svg>Download</button>
  </div>
  <div class="log-console__viewport">
    <div class="log-console__row log-console__row--i" data-level="I">
      <span class="log-console__time">12:34:56.712</span><span class="log-console__pid">1180-1180</span><span class="log-console__level">I</span><span class="log-console__tag">PosApp</span><span class="log-console__msg">…</span>
    </div>
    <div class="log-console__row log-console__row--e log-console__row--expandable" data-level="E">
      <span class="log-console__time">…</span><span class="log-console__pid">…</span><span class="log-console__level">E</span><span class="log-console__tag">PaymentSvc</span><span class="log-console__msg">…</span>
      <div class="log-console__detail">stack trace…</div>
    </div>
    <div class="log-console__empty" hidden>No log lines match the current filter.</div>
  </div>
</div>
```
