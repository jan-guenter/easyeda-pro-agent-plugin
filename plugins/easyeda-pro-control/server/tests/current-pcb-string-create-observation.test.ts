import assert from "node:assert/strict";
import { test } from "node:test";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { compareCurrentPcbStringCreateObservation, planCurrentPcbStringCreateObservation,
  requireOriginalCurrentPcbStringCreateObservationPlan } from "../src/current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "../src/current-pcb-string-create-observation.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const id = "0123456789abcdef";
function plan(): CurrentPcbStringCreateObservationPlan {
  return planCurrentPcbStringCreateObservation(planCurrentPcbStringCreate({ x: 0, y: -20, text: 'Board "A"' }), target);
}
function resultFor(value: CurrentPcbStringCreateObservationPlan): Record<string, unknown> {
  return { profile: "private.current-pcb-string-create-dormant-result.v1", planSha256: value.planSha256,
    completed: true, stage: "complete", dispatchAttempts: 1, acknowledgedPrimitiveId: id, matchingBeforeSamples: 2,
    matchingAfterSamples: 2, readback: { globalIndex: id, ...value.expectedExposedScalars }, deadlineExpired: false };
}

void test("dormant String observation binds only original candidates and preserves all unsupported claims", () => {
  const candidate = planCurrentPcbStringCreate({ x: 0, y: -20, text: 'Board "A"' }), value = plan();
  assert.throws(() => planCurrentPcbStringCreateObservation({ ...candidate }, target), /original candidate/u);
  assert.throws(() => planCurrentPcbStringCreateObservation(new Proxy(candidate, {}), target), /original candidate/u);
  assert.throws(() => requireOriginalCurrentPcbStringCreateObservationPlan({ ...value }), /original dormant plan/u);
  assert.equal(requireOriginalCurrentPcbStringCreateObservationPlan(value), value);
  assert.equal(value.dormant, true);
  assert.equal(Object.keys(value.candidateArguments).length, 13);
  assert.equal(Object.hasOwn(value.expectedExposedScalars, "type"), false);
  assert.equal(Object.hasOwn(value.expectedExposedScalars, "modelType"), false);
  assert.equal(Object.hasOwn(value.expectedExposedScalars, "zIndex"), false);
  assert.equal(value.expectedExposedScalars.silkColor, "#000000");
  assert.ok(Object.isFrozen(value) && Object.isFrozen(value.target) && Object.isFrozen(value.expectedExposedScalars.position));
  const result = compareCurrentPcbStringCreateObservation(value, JSON.stringify(resultFor(value)));
  for (const key of ["liveExecutionVerified", "originalNativeIdVerified", "liveReceiverVerified", "emptyRootPcbVerified",
    "sourceOwnershipVerified", "nativeModelVerified", "completeLiveBaselineVerified", "completeStoredBaselineVerified",
    "queueCompletionVerified", "completeEffectVerified", "renderingVerified", "persistenceVerified",
    "repeatAcrossInvocationsPrevented", "writerSupported", "executionAuthorized"] as const) {
    assert.equal(value[key], false); assert.equal(result[key], false);
  }
  assert.equal(result.suppliedResultMatchesContract, true);
});

void test("dormant String observation rejects non-data targets without invoking accessors or proxy traps", () => {
  const candidate = planCurrentPcbStringCreate({ x: 0, y: 0, text: "A" }); let reads = 0;
  const accessor = { ...target, get tabId(): string { reads += 1; return target.tabId; } };
  const proxy = new Proxy(target, { ownKeys: (): never => { reads += 1; throw new Error("TRAP"); } });
  for (const input of [accessor, proxy, { ...target, unexpected: true }, { ...target, tabId: target.documentUuid },
    { ...target, branchUuid: `${target.branchUuid}\n` }]) {
    assert.throws(() => planCurrentPcbStringCreateObservation(candidate, input));
  }
  assert.equal(reads, 0);
});

void test("dormant String observation retains acknowledged failures and rejects incoherent supplied stages", () => {
  const value = plan();
  const success = resultFor(value);
  const failed = { ...success, completed: false, stage: "after-first", matchingAfterSamples: 0, readback: null };
  const result = compareCurrentPcbStringCreateObservation(value, JSON.stringify(failed));
  assert.equal(result.acknowledgedPrimitiveId, id); assert.equal(result.stage, "after-first");
  for (const changes of [{ dispatchAttempts: 0 }, { matchingBeforeSamples: 1 }, { acknowledgedPrimitiveId: null },
    { stage: "complete" }, { matchingAfterSamples: 1 }, { liveExecutionVerified: true }, { planSha256: "f".repeat(64) }]) {
    assert.throws(() => compareCurrentPcbStringCreateObservation(value, JSON.stringify({ ...failed, ...changes })));
  }
  assert.throws(() => compareCurrentPcbStringCreateObservation({ ...value }, JSON.stringify(success)), /original dormant plan/u);
  assert.throws(() => compareCurrentPcbStringCreateObservation(value, " ".repeat(8193)), /bounded JSON/u);
  assert.throws(() => compareCurrentPcbStringCreateObservation(value, { toString: (): string => JSON.stringify(success) }), /bounded JSON/u);
});

void test("dormant String comparison does not normalize signed zero, color, hidden fields or key order", () => {
  const value = plan();
  const success = resultFor(value);
  const encoded = JSON.stringify(success);
  const changed = [encoded.replace('"x":0', '"x":-0'), encoded.replace('"silkColor":"#000000"', '"silkColor":null'),
    encoded.replace('"x":0,"y":-2', '"y":-2,"x":0'), encoded.replace('"globalIndex":', '"zIndex":-1,"globalIndex":')];
  for (const json of changed) {
    assert.notEqual(json, encoded); assert.throws(() => compareCurrentPcbStringCreateObservation(value, json));
  }
});
