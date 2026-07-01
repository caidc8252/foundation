import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importReviewDraft } from "./publish-server.mjs";

const file = process.argv[2];

if (!file) {
  console.error("Usage: pnpm prototype:import-review <review.json>");
  process.exit(1);
}

try {
  const reviewFile = resolve(process.cwd(), file);
  const draft = JSON.parse(readFileSync(reviewFile, "utf8"));
  const result = importReviewDraft(draft);
  console.log(`Imported ${reviewFile}`);
  console.log(`Created ${result.version} at ${result.relativeDir}`);
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
