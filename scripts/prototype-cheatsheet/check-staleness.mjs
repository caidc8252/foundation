// scripts/prototype-cheatsheet/check-staleness.mjs
//
// 骨架陈旧检查:比对每个骨架对应源范例(primitives|composites/<name>.html)的哈希 vs 基线,
// 报出「范例变了、骨架需重蒸馏」的组件,以及缺骨架/孤儿。发布前跑一次(在 refresh.mjs 之前)。
//   node scripts/prototype-cheatsheet/check-staleness.mjs           # 干跑,只报告
//   node scripts/prototype-cheatsheet/check-staleness.mjs --update  # 重蒸馏后落新基线
// 检查是确定性哈希 diff(无 LLM);重蒸馏骨架是检查报出后另做的事。
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseRegistry, componentsForTier } from './lib/registry.mjs';

// 仓库根 = 本脚本上两级(scripts/prototype-cheatsheet/ → root)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function exampleFor(root, name) {
  for (const kind of ['primitives', 'composites']) {
    const p = join(root, kind, `${name}.html`);
    if (existsSync(p)) return p;
  }
  return null;
}
const hashFile = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);

// 纯函数:给定当前哈希表 + 基线,分出 stale/fresh
export function diffSkeletons(current, baseline) {
  const stale = [], fresh = [];
  for (const name of Object.keys(current)) {
    if (baseline[name] === undefined) fresh.push(name);         // 无基线记录
    else if (baseline[name] !== current[name]) stale.push(name); // 范例变了
  }
  return { stale, fresh };
}

function main() {
  const a = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => (cur.startsWith('--') && acc.push([cur.slice(2), arr[i + 1]]), acc), []));
  const root = a.foundation || ROOT;
  const skDir = join(root, 'prototype-cheatsheet', 'skeletons');
  const baselinePath = join(root, 'prototype-cheatsheet', '.skeleton-baseline.json');
  const registry = parseRegistry(readFileSync(join(root, 'prototype-cheatsheet', 'component-registry.md'), 'utf8'));
  const tiered = componentsForTier(registry, 100); // 所有已纳入档位的组件(应各有骨架)

  const skeletonNames = readdirSync(skDir).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
  const current = {};
  const orphan = [];
  for (const name of skeletonNames) {
    const ex = exampleFor(root, name);
    if (!ex) { orphan.push(name); continue; }   // 有骨架、源范例没了
    current[name] = hashFile(ex);
  }
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
  const { stale, fresh } = diffSkeletons(current, baseline);
  const missing = tiered.filter(n => !skeletonNames.includes(n)); // 纳入档位却没骨架

  console.log(`✏️  骨架陈旧·范例已变需重蒸馏 (${stale.length}): ${stale.join(', ') || '—'}`);
  console.log(`🆕  已纳入档位但缺骨架 (${missing.length}): ${missing.join(', ') || '—'}`);
  console.log(`🗑️  孤儿·骨架无对应源范例 (${orphan.length}): ${orphan.join(', ') || '—'}`);
  const unchanged = skeletonNames.length - stale.length - fresh.length - orphan.length;
  console.log(`✅  未变 ${unchanged}${fresh.length ? ` · 无基线记录 ${fresh.length}（跑 --update 落基线）` : ''}`);

  if ('update' in a) {
    writeFileSync(baselinePath, JSON.stringify(current, null, 2) + '\n');
    console.log('基线已更新（.skeleton-baseline.json）。');
  } else {
    console.log('(干跑;重蒸馏过期骨架后跑 --update 落基线)');
  }
  // 有陈旧或缺骨架 → 非零退出,提示"先修再 refresh"
  if (stale.length || missing.length) process.exitCode = 1;
}
if (import.meta.url === `file://${process.argv[1]}`) main();
