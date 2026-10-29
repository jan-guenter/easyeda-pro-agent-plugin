/** Source/selector coverage only. No connected ownership, native SQL or saved
 * state is provided by these synthetic cases. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { mainCompletionSelectorFixture } from "./helpers/footprint-main-completion-selectors.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL as SQL } from "../src/current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "../src/current-footprint-copy-main-completion-programs.ts";
import { currentFootprintCopyMainCompletionNativeCommand, currentFootprintCopyMainCompletionSourceArm,
  validateCurrentFootprintCopyMainCompletionCommand } from "../src/current-footprint-copy-main-completion-protocol.ts";
import { requireCurrentFootprintCopyMainCompletionOrigin } from "../src/current-footprint-copy-main-completion-origin.ts";

void test("actual fixed selectors join missing, locked and aged branch, callback, commit and singleton post-await values", () => {
  for (const scenario of ["positive", "aged", "missing-head"] as const) {
    const result = mainCompletionSelectorFixture(scenario); assert.equal(result.error, false); assert.deepEqual(result.completed, ORDER);
    assert.equal(result.mutationCalls, 0); assert.equal(result.getterCalls, 0);
    assert.ok(result.value !== null && typeof result.value === "object");
    assert.equal(Reflect.get(result.value, "originalCommitAwaitCompleted"), true);
    for (const key of ["nativeSqlCompletionVerified", "parserUploadPublicationCompleted", "independentClosedSqlVerified", "savedResultVerified", "executionAuthorized"]) {
      assert.equal(Reflect.get(result.value, key), false);
    }
  }
});
void test("fresh mutable head and nested transaction refuse before their next native continuation", () => {
  for (const [scenario,stoppedBefore] of [["fresh-head", "append"], ["nested-transaction", "callback-enter"]] as const) {
    const result = mainCompletionSelectorFixture(scenario); assert.equal(result.error, true); assert.equal(result.completed.includes(stoppedBefore), false);
    assert.equal(result.mutationCalls, 0);
  }
});
void test("foreign original relations, changed singleton SQL/modifier and accessor actor cannot complete", () => {
  for (const scenario of ["foreign-context", "foreign-callback", "wrong-singleton-sql", "wrong-modifier", "getter-actor"] as const) {
    const result = mainCompletionSelectorFixture(scenario); assert.equal(result.error, true); assert.equal(result.completed.includes("controller-return"), false);
    assert.equal(result.mutationCalls, 0); assert.equal(result.getterCalls, 0);
  }
});
void test("completion command grammar fixes source/condition/selector and rejects a forged native origin", () => {
  const source = currentFootprintCopyMainCompletionSourceArm("project-sql", "app");
  assert.ok(source.phase === "completion-source-arm");
  assert.equal(source.params.condition, `r===${JSON.stringify(SQL)}`);
  assert.throws(() => validateCurrentFootprintCopyMainCompletionCommand({ ...source, params: { ...source.params, condition: "true" } }));
  assert.throws(() => validateCurrentFootprintCopyMainCompletionCommand({ ...source, stage: "save" }));
  assert.throws(() => validateCurrentFootprintCopyMainCompletionCommand({ phase: "completion-join", stage: "save", method: "Runtime.callFunctionOn", params: { functionDeclaration: "function(){return true;}" } }));
  assert.throws(() => currentFootprintCopyMainCompletionNativeCommand(source, 0));
  assert.deepEqual(Object.keys(currentFootprintCopyMainCompletionNativeCommand(source, 1)), ["id", "method", "params"]);
  assert.throws(() => requireCurrentFootprintCopyMainCompletionOrigin({ profile: "private.current-footprint-copy-main-completion-origin.v1", executionAuthorized: false }), /COMPLETION_ORIGINAL_LEASE_REQUIRED/u);
  assert.equal(Object.keys(PROGRAMS).length, 14);
});
