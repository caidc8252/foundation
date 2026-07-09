### step-indicator — vertical wizard rail / status pipeline (completed · active · upcoming)
Wrapper: `.rail-group` (optional `.rail-heading__title` / `.rail-heading__meta`) > `.step-indicator-card` > `ol.step-indicator` (add `data-interactive` for a navigable wizard; omit for a read-only pipeline). Each `li.step .step--{completed|active|upcoming}[data-state]` holds `.step__body (.step__dot + .step__text(.step__caption, .step__title))` + `.step__connector` (omit on last step). Completed dot = check svg (or persistent custom icon); active/upcoming dot = step number; active carries `aria-current="step"`.
```html
<div class="rail-group">
  <div class="rail-heading__title">Company onboarding</div>
  <div class="step-indicator-card">
    <ol class="step-indicator" data-interactive>
      <li class="step step--completed" data-state="completed" aria-label="Step 1 completed">
        <div class="step__body">
          <div class="step__dot"><svg data-lucide="check">…</svg></div>
          <div class="step__text">
            <span class="step__caption">Step 1</span>
            <span class="step__title">Company details</span>
          </div>
        </div>
        <div class="step__connector" aria-hidden="true"></div>
      </li>
      <li class="step step--active" data-state="active" aria-current="step">
        <div class="step__body">
          <div class="step__dot">3</div>
          <div class="step__text">
            <span class="step__caption">Step 3</span>
            <span class="step__title">Team members</span>
          </div>
        </div>
        <div class="step__connector" aria-hidden="true"></div>
      </li>
      <li class="step step--upcoming" data-state="upcoming">
        <div class="step__body">
          <div class="step__dot">4</div>
          <div class="step__text"><span class="step__caption">Step 4</span><span class="step__title">Billing plan</span></div>
        </div>
      </li>
    </ol>
  </div>
</div>
```
Status pipeline: same markup without `data-interactive`; captions carry dates instead of "Step N".
