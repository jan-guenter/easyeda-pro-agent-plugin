import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_VIA_WORKER_PARENT_PARAMS, CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS, CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS as REQUESTS,
  currentPcbViaWorkerBootstrapNativeCases, validateCurrentPcbViaWorkerBootstrapCommand } from "../src/current-pcb-via-worker-bootstrap-protocol.ts";

void test("cold Via bootstrap has a finite seven-source instrumentation vocabulary and derived request reservation", () => {
  const cases = currentPcbViaWorkerBootstrapNativeCases(); assert.equal(cases.length, 21);
  for (const command of cases) {
    assert.deepEqual(validateCurrentPcbViaWorkerBootstrapCommand(command), command);
    for (const field of ["sessionId", "url", "expression", "targetId", "purpose", "requestLimit"]) {
      assert.throws(() => validateCurrentPcbViaWorkerBootstrapCommand({ ...command, [field]: "foreign" }));
    }
  }
  assert.deepEqual(cases.filter(command => command.phase === "via-worker-source").map(command => command.role), CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES);
  assert.equal(REQUESTS.setupHelpers, 5); assert.equal(REQUESTS.workerNormal, 17); assert.equal(REQUESTS.workerCleanup, 8); assert.equal(REQUESTS.total, 28);
  assert.deepEqual(CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS, { ...CURRENT_PCB_VIA_WORKER_PARENT_PARAMS, waitForDebuggerOnStart: false });
  assert.equal(CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS.autoAttach, true);
});
void test("caller conditions, code, source selectors and a different asynchronous depth have no bootstrap representation", () => {
  for (const command of [
    { phase: "via-worker-async", method: "Debugger.setAsyncCallStackDepth", params: { maxDepth: 0 } },
    { phase: "via-worker-source", role: "latest", method: "Debugger.getScriptSource", params: { scriptId: "original" } },
    { phase: "via-worker-instrument", method: "Debugger.setInstrumentationBreakpoint", params: { instrumentation: "beforeScriptWithSourceMapExecution" } },
    { phase: "via-worker-instrument", method: "Debugger.setBreakpointByUrl", params: { urlRegex: ".*", condition: "false" } },
    { phase: "via-worker-runtime", method: "Runtime.evaluate", params: { expression: "globalThis" } },
  ]) { assert.throws(() => validateCurrentPcbViaWorkerBootstrapCommand(command)); }
});
