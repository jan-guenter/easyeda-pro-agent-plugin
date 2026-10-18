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
  assert.equal(installed, true);
  // The bounded byte observer is shared by v1/v2.
  // The locked semantic cache must stay absent for the aged-only profile.
  assert.equal(loaded.has(new URL("../../src/closed-symbol-terminal-admission-cache.ts", import.meta.url).href), false);
}
