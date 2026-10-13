/** Worker-only transparent selector pause; coordinator and original issuer modules stay shared. */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

let installed = false;
export function installAutomaticHeadObserver(): void {
  assert.equal(installed, false, "Install the fixed selector observer once before profile and stage imports");
  installed = true;
  const coordinator = new URL("../../src/closed-symbol-coordinator.ts", import.meta.url).href;
  const selector = new URL("../../src/closed-symbol-head-selector.ts", import.meta.url).href;
  const observer = new URL("closed-symbol-coordinator-automatic-observer.ts", import.meta.url).href;
  registerHooks({ resolve(specifier, context, nextResolve) {
    const selected = nextResolve(specifier, context);
    return selected.url === selector && context.parentURL === coordinator ? { url: observer, shortCircuit: true } : selected;
  } });
}
