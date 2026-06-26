import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, DRAFT } from "./paths.mjs";
import { emitInlineCss, emitTokensJson } from "../../emit/build.mjs";
export const draftExists = () => existsSync(join(DRAFT, "tokens"));
export function ensureDraft() {
  if (draftExists()) return DRAFT;
  mkdirSync(DRAFT, { recursive: true });
  cpSync(join(ROOT, "tokens"), join(DRAFT, "tokens"), { recursive: true });
  mkdirSync(join(DRAFT, "primitives"), { recursive: true });
  cpSync(join(ROOT, "primitives/primitives.css"), join(DRAFT, "primitives/primitives.css"));
  mkdirSync(join(DRAFT, "composites"), { recursive: true });
  cpSync(join(ROOT, "composites/composites.css"), join(DRAFT, "composites/composites.css"));
  buildDraftTokens();
  writeFileSync(join(DRAFT, ".changes.json"), "[]");
  return DRAFT;
}
export function buildDraftTokens() {
  mkdirSync(join(DRAFT, "dist"), { recursive: true });
  writeFileSync(join(DRAFT, "dist/tokens.inline.css"), emitInlineCss(DRAFT));
  writeFileSync(join(DRAFT, "dist/tokens.json"), JSON.stringify(emitTokensJson(DRAFT), null, 2) + "\n");
}
export function discardDraft() { rmSync(DRAFT, { recursive: true, force: true }); }
export function logChange(c) {
  const f = join(DRAFT, ".changes.json");
  const arr = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [];
  arr.push(c); writeFileSync(f, JSON.stringify(arr, null, 2));
}
export function draftStatus() {
  if (!draftExists()) return { exists: false, changes: [] };
  const f = join(DRAFT, ".changes.json");
  return { exists: true, changes: existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [] };
}
