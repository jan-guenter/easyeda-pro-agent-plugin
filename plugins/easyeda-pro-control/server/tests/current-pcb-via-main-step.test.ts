/** Finite data grammar only. No native owner or request grant is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_VIA_MAIN_STEP_PHASES, CURRENT_PCB_VIA_MAIN_STEP_REQUESTS, currentPcbViaMainStepWire,
  validateCurrentPcbViaMainStepCommand } from "../src/current-pcb-via-main-step-protocol.ts";
import { validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

void test("four fixed request steps use a distinct finite action and the observation grammar still cannot resume", () => {
  assert.equal(CURRENT_PCB_VIA_MAIN_STEP_PHASES.length, 4); assert.equal(CURRENT_PCB_VIA_MAIN_STEP_REQUESTS.total, 4);
  assert.equal(CURRENT_PCB_VIA_MAIN_STEP_REQUESTS.selectedSqlResumeAvailable, false); assert.equal(CURRENT_PCB_VIA_MAIN_STEP_REQUESTS.saveAuthorized, false);
  for (const phase of CURRENT_PCB_VIA_MAIN_STEP_PHASES) {
    const command = { phase, method: "Debugger.resume", params: {} };
    assert.deepEqual(currentPcbViaMainStepWire(command, 7), { action: "pcb-via-main-step", phase, method: "Debugger.resume", requestId: 7 });
    assert.throws(() => validateCurrentPcbViaMainCommand(command));
    for (const extra of [{ sessionId: "foreign" }, { grant: true }, { scriptId: "app" }]) { assert.throws(() => validateCurrentPcbViaMainStepCommand({ ...command, ...extra })); }
    assert.throws(() => validateCurrentPcbViaMainStepCommand({ ...command, params: { terminateOnResume: true } }));
    assert.throws(() => validateCurrentPcbViaMainStepCommand({ ...command, method: "Runtime.evaluate" }));
  }
  assert.throws(() => currentPcbViaMainStepWire({ phase: "via-main-sql-step", method: "Debugger.resume", params: {} }, 7));
});
