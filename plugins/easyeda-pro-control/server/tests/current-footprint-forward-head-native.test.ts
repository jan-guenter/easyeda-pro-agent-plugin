/** Fixed command/native codebook and real registry refusals only. This file
 * starts no helper, native owner, application or original SQL connection. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintForwardHeadNativeCases, currentFootprintForwardHeadNativeSource, currentFootprintForwardHeadNativeWire } from "../src/current-footprint-forward-head-native.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_MAIN_REQUESTS as HEAD, validateCurrentFootprintForwardHeadMainCommand } from "../src/current-footprint-forward-head-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS as LIMITS } from "../src/current-footprint-forward-native-limits.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "../src/current-footprint-copy-main-backend-budget.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";

void test("every native head case is fixed and the original import breakpoint remains representable", () => {
  const cases = currentFootprintForwardHeadNativeCases(); assert.equal(cases.length, 19);
  for (const command of cases) {
    const wire = currentFootprintForwardHeadNativeWire(command, 73);
    assert.equal(wire.request["action"], "footprint-forward-head-main"); assert.equal(wire.request["requestId"], 73);
    assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false); assert.equal(Object.hasOwn(wire.request, "sql"), false);
    assert.equal(Object.hasOwn(wire.request, "params"), false);
  }
  const early = currentFootprintForwardHeadNativeWire({ phase: "forward-head-open", command: { phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: EARLY } } }, 1);
  assert.equal(early.request["breakpointId"], EARLY);
  assert.ok(Buffer.byteLength(currentFootprintForwardHeadNativeSource()) <= 21_188);
  assert.ok(CONSTRUCTION.observeNormal + HEAD.normal <= LIMITS.normalRequestLimit);
  assert.ok(CONSTRUCTION.observeCleanup + HEAD.cleanup + CONSTRUCTION.releaseCleanup <= LIMITS.cleanupRequestLimit);
});
void test("mutation roles and arbitrary programs cannot enter the head lane", () => {
  for (const command of [
    { phase: "forward-head-sql", command: { phase: "sql-fence-startup-config-resume", method: "Debugger.resume", params: {} } },
    { phase: "forward-head-read", command: { phase: "read", method: "Runtime.evaluate", params: { expression: "1" } } },
    { phase: "forward-head-open", command: { phase: "arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber: 0, columnNumber: 0 } } } },
  ]) { assert.throws(() => validateCurrentFootprintForwardHeadMainCommand(command)); }
});
void test("a copied forward bootstrap refuses before any actual transport callback", () => {
  let callbacks = 0;
  const transport = Object.freeze({ assertCurrent: (): Promise<void> => { callbacks += 1; return Promise.resolve(); },
    send: (): Promise<void> => { callbacks += 1; return Promise.resolve(); }, poll: (): Promise<string> => { callbacks += 1; return Promise.resolve(""); } });
  assert.throws(() => new CurrentFootprintCopyMainBackendRunner(transport, undefined, undefined,
    { profile: "private.current-footprint-forward-head-bootstrap.v1", executionAuthorized: false }), /FORWARD_HEAD_BOOTSTRAP/u);
  assert.equal(callbacks, 0);
});
