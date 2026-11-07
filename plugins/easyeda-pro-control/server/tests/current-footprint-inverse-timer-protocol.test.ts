/** Exact real pipe frames and original immutable leaf separation only. These
 * tests do not construct a timer, native owner or application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseTimerNativeFrame, currentFootprintInverseTimerWire, validateCurrentFootprintInverseTimerCommand } from "../src/current-footprint-inverse-timer-protocol.ts";
import { currentProjectSyncQuiesceNativeCases, validateCurrentProjectSyncQuiesceCommand } from "../src/current-project-sync-quiesce-protocol.ts";
import { currentProjectSyncQuiesceWire } from "../src/current-project-sync-quiesce-wire.ts";

const frame = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("inverse first-timer native frames preserve all exact leaf methods and their original marker", () => {
  for (const command of currentProjectSyncQuiesceNativeCases()) {
    const wire = currentFootprintInverseTimerWire(command, 79, "original-session"); const result = currentFootprintInverseTimerNativeFrame(frame(wire), command, "original-session");
    assert.equal(result["action"], "footprint-inverse-timer"); assert.equal(result["requestId"], 79);
    assert.throws(() => currentFootprintInverseTimerNativeFrame(frame({ ...wire, sessionId: "foreign" }), command, "original-session"));
    assert.throws(() => currentFootprintInverseTimerNativeFrame(frame({ ...wire, inverseTimer: false }), command, "original-session"));
    assert.throws(() => currentFootprintInverseTimerNativeFrame(frame({ ...wire, extra: "caller override" }), command, "original-session"));
    assert.throws(() => currentFootprintInverseTimerNativeFrame(Buffer.from(JSON.stringify(wire)), command, "original-session"));
  }
});
void test("own source receipts grant neither caller expressions nor a Via transport", () => {
  const command = validateCurrentFootprintInverseTimerCommand({ phase: "inverse-timer-helper", method: "Debugger.getScriptSource", params: { scriptId: "original-helper" } });
  const wire = currentFootprintInverseTimerWire(command, 79, "original-session");
  assert.deepEqual(currentFootprintInverseTimerNativeFrame(frame(wire), command, "original-session"), { action: "footprint-inverse-timer", requestId: 79, phase: "inverse-timer-helper", method: "Debugger.getScriptSource", scriptId: "original-helper" });
  assert.throws(() => validateCurrentProjectSyncQuiesceCommand(command));
  assert.throws(() => validateCurrentFootprintInverseTimerCommand({ phase: "inverse-timer-helper", method: "Runtime.evaluate", params: { expression: "caller code" } }));
  assert.throws(() => Reflect.apply(currentProjectSyncQuiesceWire, undefined, [currentProjectSyncQuiesceNativeCases()[0], 79, "inverse"]));
});
