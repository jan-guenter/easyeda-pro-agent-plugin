import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbConstructorFailure } from "../src/current-pcb-constructor-failure.ts";
import { currentPcbTeardropFailure } from "../src/current-pcb-teardrop-failure.ts";
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

void test("bound producer failures preserve source topic while cleanup cannot replace the cause", () => {
  const primary = currentPcbTeardropFailure({ schema: "easyeda-pro-control.pcb-teardrop-owner-failure.v1",
    stage: "receiver", topic: "SetSuspend", reason: "receiver" });
  const failure = currentPcbObservationFailure("MODEL", "teardrop-owner", [primary, new Error("PRIVATE_VALUE")], true);
  const detail = currentPcbObservationFailureDetail(failure); assert.ok(detail !== null);
  assert.equal(detail.leaf?.schema, "easyeda-pro-control.pcb-teardrop-owner-failure.v1");
  if (detail.leaf?.schema === "easyeda-pro-control.pcb-teardrop-owner-failure.v1") {
    assert.equal(detail.leaf.topic, "SetSuspend");
  }
  assert.equal(failure.cause, primary); assert.equal(detail.cleanupFailed, true);
  assert.doesNotMatch(failure.message, /PRIVATE_VALUE/u);
  const copy = currentPcbObservationFailure("MODEL", "teardrop-owner", [structuredClone(detail.leaf)], false);
  assert.equal(currentPcbObservationFailureDetail(copy)?.leaf, null);
});

void test("constructor selection preserves fixed profile details without interpreting copied failures", () => {
  const primary = currentPcbConstructorFailure({ schema: "easyeda-pro-control.pcb-constructor-failure.v1",
    bundle: "precreate", profile: "Sfe", stage: "owner", reason: "own" });
  const failure = currentPcbObservationFailure("STRING_PRECREATE", "constructors-precreate", [primary], false);
  const detail = currentPcbObservationFailureDetail(failure);
  assert.ok(detail !== null);
  assert.deepEqual(detail.leaf, { schema: "easyeda-pro-control.pcb-constructor-failure.v1",
    bundle: "precreate", profile: "Sfe", stage: "owner", reason: "own" });
  assert.equal(detail.cleanupFailed, false); assert.equal(detail.failureCount, 1);
  assert.equal(failure.cause, primary); assert.equal(Object.isFrozen(detail.leaf), true);
  assert.match(failure.message, /FAILED_CONSTRUCTORS_PRECREATE_LEAF_OWNER_OWN$/u);
  for (const copy of [new Error(primary.message), structuredClone(detail.leaf)]) {
    const forged = currentPcbObservationFailure("STRING_PRECREATE", "constructors-precreate", [copy], false);
    assert.equal(currentPcbObservationFailureDetail(forged)?.leaf, null);
  }
});
