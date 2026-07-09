### timeline — vertical event stream: marker + rail + content per entry
`ul.timeline > li.timeline__item` (last entry adds `.timeline__item--last`). Each item = `.timeline__marker .timeline__marker--{dot|icon} .timeline__marker--{neutral|primary|success|warning|error|info}` (holds `.timeline__marker-node` [dot: `.timeline__marker-dot`; icon: an svg] + `.timeline__rail`) then `.timeline__content` (`.timeline__header` with `.timeline__title` + `time.timeline__time`, then `.timeline__description`, then `.timeline__actor`). Usually nested inside a `.card`.
```html
<ul class="timeline">
  <li class="timeline__item">
    <div class="timeline__marker timeline__marker--dot timeline__marker--primary">
      <div class="timeline__marker-node"><div class="timeline__marker-dot"></div></div>
      <div class="timeline__rail"></div>
    </div>
    <div class="timeline__content">
      <div class="timeline__header">
        <span class="timeline__title">Production deployment completed</span>
        <time class="timeline__time" datetime="2026-06-28T14:30:00Z">2 hours ago</time>
      </div>
      <p class="timeline__description">v3.8.2 rolled out to all regions …</p>
      <span class="timeline__actor">deploy-bot</span>
    </div>
  </li>
  <li class="timeline__item timeline__item--last">
    <div class="timeline__marker timeline__marker--icon timeline__marker--success">
      <div class="timeline__marker-node"><svg data-lucide="circle-check">…</svg></div>
      <div class="timeline__rail"></div>
    </div>
    <div class="timeline__content">
      <div class="timeline__header"><span class="timeline__title">…</span><time class="timeline__time" datetime="…">Yesterday</time></div>
      <p class="timeline__description">…</p>
      <span class="timeline__actor">compliance-bot</span>
    </div>
  </li>
</ul>
```
