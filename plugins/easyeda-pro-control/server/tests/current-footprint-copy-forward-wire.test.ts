/* oxlint-disable import/max-dependencies -- Compare the new encoder against actual existing native grammars, stage counts and blocked create/clock programs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as CAPACITY } from "../src/current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE as PROFILE, CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE as RENDERER,
  currentFootprintCopyForwardNativeLimits } from "../src/current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE as COMBINED } from "../src/current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "../src/current-footprint-copy-source-stage-budget.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as REEXPORTED_SOURCE } from "../src/current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyExecutionWorkerNativeCases } from "../src/current-footprint-copy-execution-worker-native.ts";
import { currentPcb209WorkerStartupNativeCases, currentPcb209WorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCombinedStartupWire, currentFootprintCopyForwardStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../src/current-footprint-copy-create-bindings.ts";
import { currentFootprintCopyNativeCreateWire } from "../src/current-footprint-copy-native-create-wire.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP as CLOCK_GROUP, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION as CLOCK_RELATION } from "../src/current-footprint-copy-transaction-clock.ts";
import { currentFootprintCopyTransactionClockWire } from "../src/current-footprint-copy-transaction-clock-wire.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "../src/current-pcb-worker-construction-contract.ts";

void test("forward birth derives separate ID and class ceilings without widening combined or granting execution", () => {
  assert.equal(SOURCE, 65); assert.equal(REEXPORTED_SOURCE, SOURCE);
  assert.equal(PROFILE.purpose, "worker-startup-footprint-forward209");
  assert.equal(PROFILE.nativeSwitch, "-WorkerStartupFootprintForward209");
  assert.equal(RENDERER.requestLimit, 996); assert.equal(RENDERER.normalRequestLimit, 996);
  assert.equal(RENDERER.normalClassLimit, 935); assert.equal(RENDERER.cleanupClassLimit, 61);
  assert.equal(RENDERER.normalClassLimit + RENDERER.cleanupClassLimit, RENDERER.requestLimit);
  assert.equal(RENDERER.requestLimit, CAPACITY.writer.renderer.requestLimit);
  assert.equal(RENDERER.normalClassLimit, CAPACITY.writer.renderer.normalClassLimit);
  assert.equal(RENDERER.cleanupClassLimit, CAPACITY.writer.renderer.cleanupClassLimit);
  assert.equal(PROFILE.main.normalRequestLimit, 87); assert.equal(PROFILE.main.cleanupRequestLimit, 41);
  assert.equal(PROFILE.main.requestLimit, CAPACITY.writer.main.requestLimit);
  assert.equal(PROFILE.main.requestLimit, 128);
  assert.equal(COMBINED.renderer.normalRequestLimit, 811); assert.equal(COMBINED.renderer.requestLimit, 856);
  assert.equal(PROFILE.nativeWriterMounted, false); assert.equal(PROFILE.wholeFourGenerationBudgetReserved, false);
  assert.equal(RENDERER.executionAuthorized, false); assert.equal(RENDERER.saveAuthorized, false);
  assert.ok(Object.isFrozen(PROFILE) && Object.isFrozen(RENDERER) && Object.isFrozen(RENDERER.requests));
  const native = currentFootprintCopyForwardNativeLimits();
  for (const declaration of ["MainNormal=87;", "MainCleanup=41;", "MainRequests=128;", "Requests=996;",
    "NormalRequests=996;", "NormalClass=935;", "CleanupClass=61;", "NormalMilliseconds=3600000L;", "TotalMilliseconds=3660000L;"]) {
    assert.ok(native.includes(declaration));
  }
});

void test("forward wire retains fixed observation programs and its own final ID while old combined stays at856", () => {
  const cases = [...currentPcb209WorkerStartupNativeCases(), ...currentPcb209WorkerStartupNativeParentCases(),
    ...currentFootprintCopyExecutionWorkerNativeCases()];
  assert.ok(cases.length > 10);
  for (const command of cases) {
    const result = currentFootprintCopyForwardStartupWire(command, 996);
    assert.deepEqual(result.command, { ...command, id: 996 });
    assert.equal(result.request["requestId"], 996);
    assert.equal(Object.hasOwn(result.request, "functionDeclaration"), false);
    assert.throws(() => currentFootprintCombinedStartupWire(command, 857));
    assert.doesNotThrow(() => currentFootprintCombinedStartupWire(command, 856));
    assert.throws(() => currentFootprintCopyForwardStartupWire({ ...command, extra: true }, 1));
    for (const id of [0, -0, -1, 997, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => currentFootprintCopyForwardStartupWire(command, id));
    }
  }
});

void test("valid dedicated native-create and transaction-clock envelopes cannot enter the forward observation grammar", () => {
  const project = "a".repeat(64);
  const argument = { uuid: "b".repeat(16), path: project, isProject: true, docType: 4,
    title: "Copy", display_title: "Copy", description: "", custom_tags: "[]", source: "", version: "" };
  const create = { method: "Runtime.callFunctionOn", sessionId: "worker", params: { objectId: "project",
    functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: [...["bus", "manager", "consistency", "constructors", "methods"].map(objectId => ({ objectId })),
      { value: project }, { value: JSON.stringify(argument) },
      ...["prewrite-scope", "prewrite-original", "prewrite-upload"].map(objectId => ({ objectId }))],
    objectGroup: CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
  assert.equal(currentFootprintCopyNativeCreateWire(JSON.stringify(create), 1).request["action"], "footprint-copy-native-create");
  assert.throws(() => currentFootprintCopyForwardStartupWire(create, 1));
  const clock = { method: "Runtime.callFunctionOn", params: { objectId: "manager", functionDeclaration: CLOCK_RELATION,
    arguments: [{ objectId: "sample" }, { objectId: "lexicals" }], objectGroup: CLOCK_GROUP,
    returnByValue: true, silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } };
  assert.equal(currentFootprintCopyTransactionClockWire(clock, 1, "worker").request["action"], "footprint-copy-clock");
  assert.throws(() => currentFootprintCopyForwardStartupWire({ ...clock, sessionId: "worker" }, 1));
  assert.throws(() => currentFootprintCopyForwardStartupWire({ method: "Runtime.evaluate", sessionId: "worker", params: { expression: "1" } }, 1));
});

void test("forward wire refuses caller accessors and proxies before invoking hooks", () => {
  const sample = currentPcb209WorkerStartupNativeCases()[0]; assert.ok(sample !== undefined); let hooks = 0;
  const accessor = Object.defineProperty({ ...sample }, "params", { get: (): never => { hooks += 1; throw new Error("getter invoked"); } });
  assert.throws(() => currentFootprintCopyForwardStartupWire(accessor, 1));
  const proxy = new Proxy(sample, { ownKeys: (): never => { hooks += 1; throw new Error("proxy invoked"); } });
  assert.throws(() => currentFootprintCopyForwardStartupWire(proxy, 1));
  assert.equal(hooks, 0);
});
