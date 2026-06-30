#!/usr/bin/env node
// scripts/visual/render.mjs — light+dark full-page screenshots (+ optional 64px squint thumb).
// The render half of the OPT-IN visual review (governance/enforcement.md). Default-off:
// nothing runs this unless the generation instructions carry `Visual review: on`.
//
// Usage: node scripts/visual/render.mjs <artifact.html> <outDir> <base> [view ...]
//   Each [view] = "label=#hash"        — set location.hash to drive a hash-router view
//             or  "label=@cssSelector" — click an element to switch view
//   No views  → captures the loaded (default) state as <base>-{light,dark}.png.
//   With views → ALSO captures each as <base>-<label>-{light,dark}.png. The page is
//   reloaded between views so state doesn't leak. Single-file artifacts hide
//   detail/wizard views until navigated — pass the views you want shot.
//
// Setup (once): `pnpm install` then `pnpm visual:setup` (downloads chromium).
// On Linux you may also need: `npx playwright install-deps chromium`.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , htmlPath, outDir, base, ...views] = process.argv;
if (!htmlPath || !outDir || !base) {
  console.error('usage: render.mjs <html> <outDir> <base> [label=#hash | label=@selector ...]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const url = 'file://' + resolve(htmlPath);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shoot(name) {
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme')); // light baseline
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${outDir}/${name}-light.png`, fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${outDir}/${name}-dark.png`, fullPage: true });
}

const done = [];

// default loaded state
await page.goto(url, { waitUntil: 'networkidle' });
await shoot(base);
done.push(base);

// extra views — reload for fresh state, then drive to the view
for (const v of views) {
  const eq = v.indexOf('=');
  if (eq < 0) { console.error('skip view (need label=spec):', v); continue; }
  const label = v.slice(0, eq);
  const spec = v.slice(eq + 1);
  await page.goto(url, { waitUntil: 'networkidle' });
  if (spec.startsWith('#')) {
    await page.evaluate((h) => { window.location.hash = h; }, spec);
  } else if (spec.startsWith('@')) {
    try { await page.click(spec.slice(1), { timeout: 2000 }); }
    catch (e) { console.error(`view ${label}: click '${spec.slice(1)}' failed — ${String(e.message).split('\n')[0]}`); }
  } else { console.error('skip view (spec needs # or @ prefix):', v); continue; }
  await page.waitForTimeout(200);
  await shoot(`${base}-${label}`);
  done.push(`${base}-${label}`);
}

await browser.close();

// Optional squint thumbnails (sharp) — one per captured view's light shot.
try {
  const sharp = (await import('sharp')).default;
  for (const n of done) await sharp(`${outDir}/${n}-light.png`).resize({ width: 64 }).toFile(`${outDir}/${n}-thumb.png`);
  console.log('rendered + thumbs:', done.join(', '));
} catch {
  console.log('rendered (no thumb — sharp absent):', done.join(', '));
}
