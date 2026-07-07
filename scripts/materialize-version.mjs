import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { materializeIntoHtml } from "./composite-slot.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function htmlFilesIn(repoRoot) {
  const out = [];
  for (const sub of ["patterns", "composites"]) {
    const dir = join(repoRoot, sub);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith(".html")) out.push(join(sub, f));
  }
  return out;
}

export function materializeVersion(version, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const dryRun = !!options.dryRun;
  const manifest = JSON.parse(readFileSync(join(repoRoot, "versions", version, "manifest.json"), "utf8"));
  const overrides = Object.values(manifest.elementOverrides || {});
  const total = { matched: 0, changed: 0, skipped: 0 };
  const files = [];
  const composites = new Set();
  if (overrides.length) {
    for (const rel of htmlFilesIn(repoRoot)) {
      const abs = join(repoRoot, rel);
      const src = readFileSync(abs, "utf8");
      const { html, stats } = materializeIntoHtml(src, overrides);
      total.matched += stats.matched; total.changed += stats.changed; total.skipped += stats.skipped;
      if (stats.changed) { if (!dryRun) writeFileSync(abs, html); files.push({ file: rel, changed: stats.changed, skipped: stats.skipped }); }
    }
    for (const ov of overrides) composites.add(ov.composite);
  }
  const contractTodos = [...composites].map((composite) => ({
    composite,
    file: `composites/${composite}.md`,
    note: `Reflect the materialized slot variant/size change into the ${composite} contract prose.`,
    done: false,
  }));
  const report = { version, stats: total, dryRun, files, contractTodos };
  if (!dryRun) writeFileSync(join(repoRoot, "versions", version, "materialize-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [version, ...flags] = process.argv.slice(2);
  if (!version) { console.error("usage: node scripts/materialize-version.mjs <vN> [--dry-run]"); process.exit(1); }
  const report = materializeVersion(version, { dryRun: flags.includes("--dry-run") });
  console.log(`materialize ${version}: ${report.stats.changed} changed / ${report.stats.skipped} skipped across ${report.files.length} file(s).`);
  if (report.contractTodos.length) console.log(`contract TODOs: ${report.contractTodos.map((t) => t.file).join(", ")}`);
}
