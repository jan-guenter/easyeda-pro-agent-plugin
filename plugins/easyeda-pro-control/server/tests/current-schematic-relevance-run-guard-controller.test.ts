/** Synthetic event-order checks only. They establish neither an original
 * renderer nor a native write, receiver, action or saved/reopened result. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicRelevanceRunGuardController as Controller } from "../src/current-schematic-relevance-run-guard-controller.ts";
import type { CurrentSchematicRelevanceRunGuardStep } from "../src/current-schematic-relevance-run-guard-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_SOURCE as SOURCE } from "../src/current-schematic-relevance-action-prefix-queue-source.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentSchematicRelevanceRunGuardCases, currentSchematicRelevanceRunGuardWire } from "../src/current-schematic-relevance-run-guard-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";

function fixture(): Controller { return new Controller("original_ui", "original_script", 0, { runObjectId: "run", rootsObjectId: "roots", nativeObjectId: "native", referencesObjectId: "references", firstStartObjectId: "first_start", willEndObjectId: "will_end", firstEndObjectId: "first_end", baseFunctionsObjectId: "base", queueFunctionsObjectId: "queue", intrinsicFunctionsObjectId: "intrinsic", qualifiedObjectId: "qualified", originalRequests: 512, originalRunStillHeld: true, callbackReceiversVerified: false, continuationAuthorized: false, persistenceVerified: false }); }
function resumed(): DiagnosticEvent { return { sessionId: "original_ui", method: "Debugger.resumed", params: {} }; }
function paused(index: 0 | 1 | 2, scriptId = "original_script"): DiagnosticEvent {
  const role = (["historyStartFirst", "historyWillEnd", "historyEndFirst"] as const)[index];
  const point = { scriptId, lineNumber: SOURCE[0].roles[role].lineNumber, columnNumber: SOURCE[0].roles[role].columnNumber };
  return { sessionId: "original_ui", method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [`original_bp_${String(index)}`], callFrames: [{ callFrameId: `held_${String(index)}`, functionLocation: point, location: point }] } };
}
function requiredStep(controller: Controller): CurrentSchematicRelevanceRunGuardStep { const step = controller.next(); assert.ok(step !== null); return step; }
function arm(controller: Controller): void { for (let index = 0; index < 3; index += 1) { const step = requiredStep(controller); controller.reserve(step); controller.accept(step, { breakpointId: `original_bp_${String(index)}` }); } controller.assertArmed(); }
function reply(step: CurrentSchematicRelevanceRunGuardStep, read: number): unknown {
  if (read === 0) { return { result: { type: "object", subtype: "array", className: "Array", description: "Array(1)", objectId: "receiver_tuple" } }; }
  if (read === 1) { return { result: [{ name: "0", value: { type: "object", className: "History", objectId: "original_history" }, isOwn: true, writable: true, configurable: true, enumerable: true }, { name: "length", value: { type: "number", value: 1 }, isOwn: true, writable: true, configurable: false, enumerable: false }], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array_prototype" } }] }; }
  if (read === 2) { return { result: [], internalProperties: [] }; }
  if (read === 3) { return { result: { type: "boolean", value: true } }; }
  assert.equal(step.command.phase, "prefix-remove"); return {};
}
void test("original resume ACK and event races complete each guard independently of callback settlement", async () => {
  const controller = fixture(); arm(controller); const initial = controller.beginOriginalRunResume();
  assert.throws(() => controller.beginOriginalRunResume());
  assert.throws(() => { controller.reserve({ ...initial }); });
  controller.reserve(initial); assert.equal(controller.observeOriginalEvent(resumed()), true);
  // The next original pause may arrive before the preceding CDP response.
  assert.equal(controller.observeOriginalEvent(paused(0)), true); controller.accept(initial, {}); await controller.waitOriginalRunResumed();
  for (const index of [0, 1, 2] as const) {
    await controller.waitOriginalGuard(index);
    for (let read = 0; read < 5; read += 1) { const step = requiredStep(controller); controller.reserve(step); controller.accept(step, reply(step, read)); }
    const step = requiredStep(controller); assert.equal(step.command.phase, "prefix-resume"); controller.reserve(step);
    if (index === 0) {
      controller.accept(step, {}); assert.equal(controller.next(), null); assert.equal(controller.observeOriginalEvent(resumed()), true); assert.equal(controller.observeOriginalEvent(paused(1)), true);
    } else {
      assert.equal(controller.observeOriginalEvent(resumed()), true);
      if (index === 1) { assert.equal(controller.observeOriginalEvent(paused(2)), true); }
      controller.accept(step, {});
    }
  }
  const end = await controller.waitOriginalEnd(); controller.requireCompleted(end);
  assert.equal(end.originalGuardResumesAcknowledged, 3); assert.equal(end.originalGuardResumedEventsObserved, 3);
  assert.equal(end.actionCompletionVerified, false); assert.equal(controller.next(), null);
  assert.throws(() => { controller.requireCompleted({ ...end }); });
});
void test("wrong-source pause poisons original waiters before receiver reads or another resume", async () => {
  const controller = fixture(); arm(controller); const initial = controller.beginOriginalRunResume(); controller.reserve(initial); controller.accept(initial, {});
  assert.equal(controller.observeOriginalEvent(resumed()), true); await controller.waitOriginalRunResumed();
  assert.equal(controller.observeOriginalEvent(paused(0, "foreign_script")), true);
  assert.throws(() => controller.next()); await assert.rejects(controller.waitOriginalGuard(0)); await assert.rejects(controller.waitOriginalEnd());
});
void test("the separate guard wire preserves fixed messages and rejects caller code or crossed roles", () => {
  for (const step of currentSchematicRelevanceRunGuardCases()) {
    const fixed = currentSchematicRelevanceRunGuardWire(step, 89);
    const bytes = Buffer.from(`${JSON.stringify({ id: 89, ...fixed.step.command, schematicRelevanceRunGuardCommand: true, schematicRelevanceRunGuardRole: fixed.step.guard, sessionId: "original_ui" })}\0`);
    assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(bytes), fixed.request);
    if (step.command.phase !== "prefix-resume" || step.guard !== "run") { assert.throws(() => currentSchematicRelevanceRunGuardWire({ ...step, guard: "run" }, 89)); }
  }
  assert.throws(() => currentSchematicRelevanceRunGuardWire({ guard: "first-start", command: { phase: "prefix-call", role: "callback-receiver", method: "Runtime.callFunctionOn", params: { objectId: "original", functionDeclaration: "function(){return this.modify()}" } } }, 89));
});
