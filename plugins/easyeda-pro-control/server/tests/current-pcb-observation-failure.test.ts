import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbObservationFailure, currentPcbObservationFailureDetail,
  currentPcbPendingFailure, currentPcbPendingFailureDetail } from "../src/current-pcb-observation-failure.ts";

void test("observation failures retain the original leaf separately from cleanup and ignore forged messages or getters", () => {
  const cleanup = new Error("PRIVATE_CLEANUP"), primary = currentPcbPendingFailure("dynamic-copper", "object");
  const failure = currentPcbObservationFailure("STRING_PRECREATE", "pending", [primary, cleanup], true);
  assert.equal(failure.cause, primary); assert.deepEqual(failure.errors, [primary, cleanup]);
  assert.match(failure.message, /FAILED_PENDING_LEAF_DYNAMIC_COPPER_OBJECT_RELEASE_FAILED$/u);
  assert.doesNotMatch(failure.message, /PRIVATE_CLEANUP/u);
  const details = currentPcbObservationFailureDetail(failure); assert.ok(details !== null);
  assert.equal(details.cleanupFailed, true); assert.equal(details.leaf?.stage, "dynamic-copper");
  assert.equal(details.executionAuthorized, false); assert.equal(Object.isFrozen(details.leaf), true);
  let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("PRIVATE_TRAP"); };
  for (const fake of [new Error(primary.message), { ...details }, new Proxy({}, { get: trap }),
    Object.defineProperty({}, "message", { get: trap })]) {
    assert.equal(currentPcbObservationFailureDetail(fake), null); assert.equal(currentPcbPendingFailureDetail(fake), null);
    const reported = currentPcbObservationFailure("MODEL", "pending", [fake], false);
    assert.equal(currentPcbObservationFailureDetail(reported)?.leaf, null);
    assert.equal(reported.message, "PCB_DIAGNOSTIC_MODEL_OBSERVATION_FAILED_PENDING");
  }
  assert.equal(calls, 0);
});
