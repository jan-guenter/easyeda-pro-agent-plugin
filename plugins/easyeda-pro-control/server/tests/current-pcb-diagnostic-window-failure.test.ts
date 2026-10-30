/** Fixed fault metadata, never an owner or native execution token. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentWindowFailure } from "../src/current-pcb-diagnostic-window-failure.ts";

void test("window faults keep geometry/paint snapshots bounded and release action-specific", () => {
  const fault = { schema: "easyeda-pro-control.window-failure.v1", action: "capture-window", stage: "bounds", code: "window-capture-dimensions",
    paintPhase: "not-dispatched", nativeResourcesRetained: false, bounds: { left: 0, top: 0, right: 3840, bottom: 2160 }, snapshotOnly: true, executionAuthorized: false };
  assert.equal(decodeCurrentWindowFailure(fault, "capture-window", "pcb-diagnostic-window-capture-dimensions").paintPhase, "not-dispatched");
  assert.throws(() => decodeCurrentWindowFailure({ ...fault, stage: "secret stack" }, "capture-window", "pcb-diagnostic-window-capture-dimensions"));
  assert.throws(() => decodeCurrentWindowFailure({ ...fault, bounds: { ...fault.bounds, right: 1_000_001 } }, "capture-window", "pcb-diagnostic-window-capture-dimensions"));
  const release = { ...fault, action: "release", stage: "cleanup", code: "window-capture-gdi-release", bounds: null, paintPhase: "possibly-dispatched", nativeResourcesRetained: true };
  assert.equal(decodeCurrentWindowFailure(release, "release", "pcb-diagnostic-window-capture-gdi-release").action, "release");
  assert.throws(() => decodeCurrentWindowFailure({ ...release, stage: "paint" }, "release", "pcb-diagnostic-window-capture-gdi-release"));
  const childRelease = { ...release, code: "window-capture-child-release", paintPhase: "not-dispatched" };
  assert.equal(decodeCurrentWindowFailure(childRelease, "release", "pcb-diagnostic-window-capture-child-release").nativeResourcesRetained, true);
  assert.throws(() => decodeCurrentWindowFailure({ ...childRelease, stage: "children" }, "release", "pcb-diagnostic-window-capture-child-release"));
});

void test("unavailable native entry points retain fixed fault metadata without exception text or retry authority", () => {
  const fault = { schema: "easyeda-pro-control.window-failure.v1", action: "window-capture-readiness", stage: "bounds", code: "native-entry-point-unavailable",
    paintPhase: "not-dispatched", nativeResourcesRetained: false, bounds: null, snapshotOnly: true, executionAuthorized: false };
  const result = decodeCurrentWindowFailure(fault, "window-capture-readiness", "pcb-diagnostic-native-call");
  assert.equal(result.code, "native-entry-point-unavailable"); assert.equal(result.bounds, null); assert.equal(Object.isFrozen(result), true);
  assert.throws(() => decodeCurrentWindowFailure({ ...fault, message: "unbounded native exception text" }, "window-capture-readiness", "pcb-diagnostic-native-call"));
  assert.throws(() => decodeCurrentWindowFailure({ ...fault, code: "EntryPointNotFoundException" }, "window-capture-readiness", "pcb-diagnostic-native-call"));
  assert.throws(() => decodeCurrentWindowFailure(fault, "window-capture-readiness", "pcb-diagnostic-window-readiness-changed"));
  assert.throws(() => decodeCurrentWindowFailure({ ...fault, executionAuthorized: true }, "window-capture-readiness", "pcb-diagnostic-native-call"));
});

const childFault = { schema: "easyeda-pro-control.window-failure.v1", action: "capture-window", stage: "children", code: "window-capture-child-ownership",
  paintPhase: "not-dispatched", nativeResourcesRetained: false, bounds: { left: 106, top: 0, right: 1402, bottom: 728 }, snapshotOnly: true, executionAuthorized: false };

void test("child ownership faults distinguish the fixed native refusals without process or window identifiers", () => {
  for (const childOwnership of [
    { reason: "descendant-limit", visited: 257, visible: 0, nativeError: null },
    { reason: "descendant-limit", visited: 257, visible: 256, nativeError: null },
    { reason: "pid-query-failed", visited: 7, visible: 4, nativeError: 0 },
    { reason: "pid-query-failed", visited: 7, visible: 4, nativeError: 4_294_967_295 },
    { reason: "window-disappeared", visited: 7, visible: 4, nativeError: 1400 },
    { reason: "different-process", visited: 7, visible: 4, nativeError: null },
  ]) {
    const result = decodeCurrentWindowFailure({ ...childFault, childOwnership }, "capture-window", "pcb-diagnostic-window-capture-child-ownership");
    assert.deepEqual(result.childOwnership, childOwnership); assert.equal(Object.isFrozen(result.childOwnership), true);
    assert.equal(result.snapshotOnly, true); assert.equal(result.executionAuthorized, false);
  }
  for (const stage of ["before-paint", "after-paint", "after-encoding"]) {
    const result = decodeCurrentWindowFailure({ ...childFault, stage, childOwnership: { reason: "different-process", visited: 1, visible: 1, nativeError: null } }, "capture-window", "pcb-diagnostic-window-capture-child-ownership");
    assert.equal(result.stage, stage);
  }
  assert.equal(decodeCurrentWindowFailure(childFault, "capture-window", "pcb-diagnostic-window-capture-child-ownership").childOwnership, undefined);
});

void test("retained child process refusals keep proof failures bounded without granting process authority", () => {
  for (const reason of ["process-open-failed", "process-query-failed", "process-job-query-failed"]) {
    for (const nativeError of [0, 5, 1400, 4_294_967_295]) {
      const childOwnership = { reason, visited: 2, visible: 1, nativeError };
      const result = decodeCurrentWindowFailure({ ...childFault, nativeResourcesRetained: reason !== "process-open-failed", childOwnership }, "capture-window", "pcb-diagnostic-window-capture-child-ownership");
      assert.deepEqual(result.childOwnership, childOwnership);
      assert.equal(result.executionAuthorized, false);
    }
    assert.throws(() => decodeCurrentWindowFailure({ ...childFault, childOwnership: { reason, visited: 2, visible: 1, nativeError: null } }, "capture-window", "pcb-diagnostic-window-capture-child-ownership"));
  }
  for (const reason of ["process-not-live", "process-identity", "process-outside-job", "process-image", "window-linkage-changed"]) {
    const childOwnership = { reason, visited: 2, visible: 1, nativeError: null };
    const result = decodeCurrentWindowFailure({ ...childFault, nativeResourcesRetained: true, childOwnership }, "capture-window", "pcb-diagnostic-window-capture-child-ownership");
    assert.deepEqual(result.childOwnership, childOwnership);
    assert.throws(() => decodeCurrentWindowFailure({ ...childFault, childOwnership: { ...childOwnership, nativeError: 5 } }, "capture-window", "pcb-diagnostic-window-capture-child-ownership"));
    for (const extra of [{ pid: 7 }, { processCreated: 10 }, { threadId: 11 }, { executable: "private-image" }]) {
      assert.throws(() => decodeCurrentWindowFailure({ ...childFault, childOwnership: { ...childOwnership, ...extra } }, "capture-window", "pcb-diagnostic-window-capture-child-ownership"));
    }
  }
});

void test("child snapshots reject inconsistent native outcomes, unbounded counts, extra identity data and foreign failure scopes", () => {
  const valid = { reason: "different-process", visited: 7, visible: 4, nativeError: null };
  for (const changes of [
    { reason: "arbitrary reason" }, { visited: 0 }, { visited: 258 }, { visited: 2 }, { visited: Number.NaN },
    { visible: -0 }, { visible: 0 }, { visible: 257 }, { visible: 8 }, { visible: 0.5 },
    { reason: "descendant-limit", visited: 256 }, { reason: "descendant-limit", visited: 257, nativeError: 5 },
    { reason: "pid-query-failed", nativeError: null }, { reason: "pid-query-failed", nativeError: 1400 },
    { reason: "pid-query-failed", nativeError: -1 }, { reason: "pid-query-failed", nativeError: -0 },
    { reason: "pid-query-failed", nativeError: 4_294_967_296 }, { reason: "pid-query-failed", nativeError: 0.5 },
    { reason: "window-disappeared", nativeError: null }, { reason: "window-disappeared", nativeError: 5 },
    { nativeError: 5 }, { pid: 123 }, { hwnd: "456" }, { title: "private window title" }, { executable: "private executable" },
  ]) {
    assert.throws(() => decodeCurrentWindowFailure({ ...childFault, childOwnership: { ...valid, ...changes } }, "capture-window", "pcb-diagnostic-window-capture-child-ownership"));
  }
  for (const changes of [
    { action: "window-capture-readiness" }, { stage: "paint" }, { stage: "bounds" }, { stage: "cleanup" },
    { code: "window-capture-window-changed" },
  ]) {
    assert.throws(() => decodeCurrentWindowFailure({ ...childFault, ...changes, childOwnership: valid }, "capture-window", "pcb-diagnostic-window-capture-child-ownership"));
  }
});
