### aspect-ratio — layout box locking content to a fixed width:height ratio
Single class `.aspect-ratio`; the ratio is set via the `--ratio` custom property (e.g. `16/9`, `4/3`, `1/1`, `3/2`). Sets no width of its own — inherits from container (cap with `max-width`); height derives from the ratio.
```html
<div class="aspect-ratio" style="--ratio: 16/9;">
  <img src="…" alt="…" style="width:100%;height:100%;object-fit:cover;">
</div>
```
