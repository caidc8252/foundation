// scripts/prototype-design/lib/skeletons.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function loadSkeleton(dir, name) {
  const p = join(dir, `${name}.md`);
  return existsSync(p) ? readFileSync(p, 'utf8').trimEnd() : null;
}
export function missingSkeletons(dir, names) {
  return names.filter(n => loadSkeleton(dir, n) === null);
}
