import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS, CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS, CURRENT_SCHEMATIC_DISPLAY_WORKER_BOOTSTRAP_REQUESTS as REQUESTS,
  currentSchematicDisplayWorkerBootstrapNativeCases, validateCurrentSchematicDisplayWorkerBootstrapCommand } from "../src/current-schematic-display-worker-bootstrap-protocol.ts";

void test("cold schematic bootstrap has a finite seven-source instrumentation vocabulary and derived request reservation", () => {
  const cases = currentSchematicDisplayWorkerBootstrapNativeCases(); assert.equal(cases.length, 21);
  for (const command of cases) {
    assert.deepEqual(validateCurrentSchematicDisplayWorkerBootstrapCommand(command), command);
    for (const field of ["sessionId", "url", "expression", "targetId", "purpose", "requestLimit"]) {
      assert.throws(() => validateCurrentSchematicDisplayWorkerBootstrapCommand({ ...command, [field]: "foreign" }));
    }
  }
  assert.deepEqual(cases.filter(command => command.phase === "schematic-worker-source").map(command => command.role), CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES);
  assert.equal(REQUESTS.workerNormal, 16); assert.equal(REQUESTS.workerCleanup, 8); assert.equal(REQUESTS.total, 27);
  assert.deepEqual(CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS, { ...CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS, waitForDebuggerOnStart: false });
  assert.equal(CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS.autoAttach, true);
});
void test("caller conditions, code, source selectors and a different asynchronous depth have no bootstrap representation", () => {
  for (const command of [
    { phase: "schematic-worker-async", method: "Debugger.setAsyncCallStackDepth", params: { maxDepth: 0 } },
    { phase: "schematic-worker-source", role: "latest", method: "Debugger.getScriptSource", params: { scriptId: "original" } },
    { phase: "schematic-worker-instrument", method: "Debugger.setInstrumentationBreakpoint", params: { instrumentation: "beforeScriptWithSourceMapExecution" } },
    { phase: "schematic-worker-instrument", method: "Debugger.setBreakpointByUrl", params: { urlRegex: ".*", condition: "false" } },
    { phase: "schematic-worker-runtime", method: "Runtime.evaluate", params: { expression: "globalThis" } },
  ]) { assert.throws(() => validateCurrentSchematicDisplayWorkerBootstrapCommand(command)); }
});
