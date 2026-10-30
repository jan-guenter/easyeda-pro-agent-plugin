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
