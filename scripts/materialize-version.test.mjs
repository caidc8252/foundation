import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeVersion } from "./materialize-version.mjs";

function fixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), "mat-"));
  mkdirSync(join(root, "patterns"), { recursive: true });
  mkdirSync(join(root, "composites"), { recursive: true });
  mkdirSync(join(root, "versions", "v9"), { recursive: true });
  writeFileSync(join(root, "patterns", "list-page.html"),
    `<section class="page-header"><div class="page-header__actions"><button class="btn btn--secondary">Go</button></div></section>`);
  writeFileSync(join(root, "composites", "page-header.html"),
    `<section class="page-header"><div class="page-header__actions"><button class="btn btn--secondary">Go</button></div></section>`);
  writeFileSync(join(root, "versions", "v9", "manifest.json"), JSON.stringify({
    version: "v9",
    elementOverrides: { "page-header#0.0": { composite: "page-header", rootClass: ".page-header", path: "0.0", classSwaps: { variant: { from: "btn--secondary", to: "btn--primary" } } } },
  }));
  return root;
}

test("materializeVersion rewrites every instance across patterns and composites, writes report", () => {
  const root = fixtureRepo();
  const res = materializeVersion("v9", { repoRoot: root });
  assert.equal(res.stats.changed, 2);
  assert.ok(readFileSync(join(root, "patterns", "list-page.html"), "utf8").includes("btn--primary"));
  assert.ok(readFileSync(join(root, "composites", "page-header.html"), "utf8").includes("btn--primary"));
  const report = JSON.parse(readFileSync(join(root, "versions", "v9", "materialize-report.json"), "utf8"));
  assert.equal(report.contractTodos[0].composite, "page-header");
  assert.equal(report.contractTodos[0].done, false);
});

test("materializeVersion --dry-run reports but does not write html", () => {
  const root = fixtureRepo();
  materializeVersion("v9", { repoRoot: root, dryRun: true });
  assert.ok(readFileSync(join(root, "patterns", "list-page.html"), "utf8").includes("btn--secondary"));
});
