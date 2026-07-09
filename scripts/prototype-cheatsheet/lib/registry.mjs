// Parse component-registry.md's Primitives (§三) and Composites (§四) tables.
// A row: | <name> | <tier> | <note> |  where tier ∈ 30|70|100|特殊.
const SECTIONS = [
  { kind: 'primitive', re: /##\s*三、Primitives[\s\S]*?(?=\n##\s|\n*$)/ },
  { kind: 'composite', re: /##\s*四、Composites[\s\S]*?(?=\n##\s|\n*$)/ },
];
const ROW = /^\|\s*([a-z0-9-]+)\s*\|\s*(30|70|100|特殊)\s*\|/;

export function parseRegistry(md) {
  const out = [];
  for (const { kind, re } of SECTIONS) {
    const block = md.match(re)?.[0] ?? '';
    for (const line of block.split('\n')) {
      const m = line.match(ROW);
      if (!m) continue;
      const tier = m[2] === '特殊' ? null : Number(m[2]);
      if (tier === null) continue; // 特殊/icon excluded from cheatsheets
      out.push({ name: m[1], kind, tier });
    }
  }
  return out;
}

export function componentsForTier(list, tier) {
  return list.filter(c => c.tier !== null && c.tier <= tier).map(c => c.name);
}
