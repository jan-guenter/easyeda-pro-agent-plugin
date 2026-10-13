/** Test-only dependency observation; no imports are redirected or results mocked. */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

const paths = ["closed-symbol-terminal-admission-cache.ts", "closed-symbol-terminal-closure-journal.ts",
  "closed-symbol-terminal-closure-plan.ts", "closed-symbol-terminal-closure-observer.ts"];
const fixed = new Set(paths.map((name) => new URL(`../../src/${name}`, import.meta.url).href));
const loaded = new Set<string>();
let installed = false;
export function installAdmissionDependencyObserver(): void {
  assert.equal(installed, false); installed = true;
  registerHooks({ load(url, context, nextLoad) {
    if (fixed.has(url)) { loaded.add(url); }
    return nextLoad(url, context);
  } });
}
export function assertActualLockedCacheGraphAbsent(): void {
  assert.equal(installed, true); assert.equal(loaded.size, 0);
}
