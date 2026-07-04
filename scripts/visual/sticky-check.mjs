#!/usr/bin/env node
// scripts/visual/sticky-check.mjs — regression for the sticky summary-bar + thead pattern.
//
// The class-based checker can't see this: a nested scroll container (an `overflow:auto`
// element like `.table-scroll` between a sticky child and its scroll root) steals the
// sticky, so the thead scrolls away and rows slide under the bar. Only a REAL scroll
// exposes it. This drives each page, scrolls the actual scroll root, and asserts the
// `--sticky-head` thead stays docked just under the `--sticky` summary-bar.
//
// Usage: node scripts/visual/sticky-check.mjs <page.html> [more.html …]
// Exit non-zero if any page's sticky thead scrolls away.
import { chromium } from 'playwright';

const pages = process.argv.slice(2);
if (!pages.length) { console.error('usage: sticky-check.mjs <page.html> […]'); process.exit(2); }

const TOL = 3; // px tolerance
const browser = await chromium.launch();
let failed = 0;

for (const path of pages) {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('file://' + process.cwd() + '/' + path.replace(/^\.\//, ''));

  const r = await p.evaluate((TOL) => {
    const sb = document.querySelector('.summary-bar--sticky');
    if (!sb) return { skip: 'no .summary-bar--sticky on this page' };
    const th = (sb.closest('*') && document.querySelector('.data-table--sticky-head thead th'))
      || document.querySelector('thead th');
    if (!th) return { skip: 'no sticky thead' };
    // scroll root = nearest ancestor of the bar that actually scrolls vertically
    let root = sb.parentElement;
    while (root && root !== document.body) {
      const s = getComputedStyle(root);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && root.scrollHeight > root.clientHeight + 8) break;
      root = root.parentElement;
    }
    const scrolls = root && root !== document.body;
    const before = { sb: sb.getBoundingClientRect().top, th: th.getBoundingClientRect().top };
    const amt = 220;
    if (scrolls) root.scrollTop = amt; else window.scrollTo(0, amt);
    // force reflow
    void document.body.offsetHeight;
    const rootTop = scrolls ? root.getBoundingClientRect().top : 0;
    const sbBottom = sb.getBoundingClientRect().bottom;
    const res = {
      scrollRoot: scrolls ? (root.className || root.tagName) : 'window',
      scrolled: scrolls ? root.scrollTop : window.scrollY,
      rootTop: Math.round(rootTop),
      sbTop: Math.round(sb.getBoundingClientRect().top),
      theadTop: Math.round(th.getBoundingClientRect().top),
      sbBottom: Math.round(sbBottom),
    };
    // pass = bar stuck at root top AND thead docked just under the bar (not scrolled away)
    res.barStuck = Math.abs(res.sbTop - res.rootTop) <= TOL;
    res.theadDocked = Math.abs(res.theadTop - res.sbBottom) <= TOL;
    res.pass = res.barStuck && res.theadDocked;
    return res;
  }, TOL);

  await p.close();

  if (r.skip) { console.log(`—  ${path}: ${r.skip}`); continue; }
  const tag = r.pass ? '✓ PASS' : '✗ FAIL';
  console.log(`${tag}  ${path}  [scroll root: ${r.scrollRoot}, scrolled ${r.scrolled}px]`);
  console.log(`      bar stuck at top: ${r.barStuck ? 'yes' : 'NO'} (bar=${r.sbTop} root=${r.rootTop})`);
  console.log(`      thead docked under bar: ${r.theadDocked ? 'yes' : 'NO'} (thead=${r.theadTop} bar-bottom=${r.sbBottom})`);
  if (!r.pass) { console.log(`      → the sticky thead scrolled away — nested scroll container between it and the root.`); failed++; }
}

await browser.close();
process.exit(failed ? 1 : 0);
