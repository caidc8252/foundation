import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const VERSIONS_ROOT = join(ROOT, "versions");

function assertVersionsDir(dir) {
  const resolved = resolve(dir);
  if (basename(resolved) !== "versions") {
    throw new Error(`refusing to clear non-versions directory: ${resolved}`);
  }
  if (!(resolved === ROOT || resolved.startsWith(ROOT + sep))) {
    throw new Error(`versions directory escapes repo root: ${resolved}`);
  }
  return resolved;
}

const versionsDir = assertVersionsDir(VERSIONS_ROOT);
let removed = 0;

mkdirSync(versionsDir, { recursive: true });
for (const entry of readdirSync(versionsDir, { withFileTypes: true })) {
  rmSync(join(versionsDir, entry.name), { recursive: true, force: true });
  removed++;
}

console.log(`Cleared ${removed} item${removed === 1 ? "" : "s"} from ${versionsDir}`);
