import assert from "node:assert/strict";
import { test } from "node:test";
import { captureOriginalSpatialManagerRequest, consumeOriginalSpatialManagerControl, createOriginalSpatialManagerRecovery,
  learnOriginalSpatialManagerInspection, learnOriginalSpatialManagerWindow, originalSpatialManagerControl } from "../../scripts/control-session-spatial-adapter.ts";

void test("spatial manager controls retain strict family/operation, original receipt data and one close/release", () => {
  for (const family of ["spatial", "component-spatial"] as const) {
    const operationId = family === "spatial" ? "pcb209-spatial-manager" : "pcb209-spatial-component-manager";
    const original = captureOriginalSpatialManagerRequest("easyeda_control_pcb209_opening", { request: { action: family, request: {
      action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
    } } }); assert.ok(original !== null); assert.equal(original.family, family);
    const state = createOriginalSpatialManagerRecovery(original);
    assert.throws(() => originalSpatialManagerControl(original, state, { action: "observe-window" }), /inspection-required/u);
    for (const input of [{ action: "inspect", operationId: "foreign" }, { action: "normal-close", confirmNormalClose: true, hwnd: "123" }, { action: "normal-close", confirmNormalClose: false }]) { assert.throws(() => originalSpatialManagerControl(original, state, input)); }
    const value = { operationId, busy: false, publicationSettlementAvailable: true, intentSha256: "a".repeat(64), launchAcknowledged: true,
      bindingSha256: "b".repeat(64), binding: { helperInstance: "c".repeat(32), jobId: "d".repeat(32), rootPid: 123, rootCreated: "123456789012345" }, closeAttemptConsumed: false, releaseAttemptConsumed: false };
    learnOriginalSpatialManagerInspection(original, state, { structuredContent: { result: { ...value, publicationSettlementAvailable: false } } });
    assert.equal(state.bindingSha256, undefined);
    learnOriginalSpatialManagerInspection(original, state, { structuredContent: { result: value } });
    assert.equal(state.bindingSha256, "b".repeat(64));
    assert.throws(() => originalSpatialManagerControl(original, state, { action: "normal-close", confirmNormalClose: true }), /original-window/u);
    learnOriginalSpatialManagerWindow(original, state, { structuredContent: { result: { operationId, bindingSha256: "b".repeat(64), launchAcknowledged: true, hwnd: "123" } } });
    const close = originalSpatialManagerControl(original, state, { action: "normal-close", confirmNormalClose: true });
    assert.equal(close.arguments.request.action, family); assert.equal(close.arguments.request.request.operationId, operationId);
    assert.equal(Reflect.get(close.arguments.request.request, "hwnd"), "123");
    consumeOriginalSpatialManagerControl(state, "normal-close"); assert.throws(() => originalSpatialManagerControl(original, state, { action: "normal-close", confirmNormalClose: true }));
    consumeOriginalSpatialManagerControl(state, "release-closed"); assert.throws(() => originalSpatialManagerControl(original, state, { action: "release-closed" }));
    assert.throws(() => { learnOriginalSpatialManagerInspection(original, state, { structuredContent: { result: { ...value, bindingSha256: "e".repeat(64) } } }); }, /binding-changed/u);
  }
  assert.equal(captureOriginalSpatialManagerRequest("easyeda_control_runtime", { request: {} }), null);
});
