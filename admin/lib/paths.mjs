import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DRAFT = join(ROOT, "admin", ".draft");
export const activeRoot = () => (existsSync(join(DRAFT, "tokens")) ? DRAFT : ROOT);
