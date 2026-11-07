/** Inert grammar and actual function-location metadata checks only. These
 * supplied values issue no original held packet or native continuation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_COLD_STEP_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES as ROLES, currentFootprintInverseColdStepBudget, currentFootprintInverseColdStepNativeFrame, currentFootprintInverseColdStepWire, validateCurrentFootprintInverseColdStepCommand } from "../src/current-footprint-inverse-cold-step-protocol.ts";
import { qualifyCurrentFootprintInverseColdFlowMethod } from "../src/current-footprint-inverse-cold-load-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS as FLOW } from "../src/current-pcb-via-saved-load-source.ts";

const frame = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
const property = (name: string, value: unknown): unknown => ({ name, value, writable: false, configurable: true, enumerable: false, isOwn: true });

void test("inverse cold continuation encodes only six exact pre-model roles and retains its own frame", () => {
  assert.equal(REQUESTS.maximum, 27); assert.equal(currentFootprintInverseColdStepBudget(1), 6);
  for (const chunks of [0, 9, 1.5, Number.NaN]) { assert.throws(() => currentFootprintInverseColdStepBudget(chunks)); }
  for (const role of ROLES) {
    const command = validateCurrentFootprintInverseColdStepCommand({ phase: "inverse-cold-step", role, method: "Debugger.resume", params: {} });
    const wire = currentFootprintInverseColdStepWire(command, 79, "original-worker");
    assert.deepEqual(currentFootprintInverseColdStepNativeFrame(frame(wire), command, "original-worker"), { action: "footprint-inverse-cold-step", requestId: 79, stepRole: role });
    for (const altered of [{ ...wire, sessionId: "foreign" }, { ...wire, inverseColdStep: false }, { ...wire, inverseColdLoad: true }, { ...wire, params: { arbitrary: true } }]) {
      assert.throws(() => currentFootprintInverseColdStepNativeFrame(frame(altered), command, "original-worker"));
    }
  }
  for (const role of ["plaintext", "parsed", "ready", "warm", "pending", "fallback", "failed", "bootstrap"]) {
    assert.throws(() => validateCurrentFootprintInverseColdStepCommand({ phase: "inverse-cold-step", role, method: "Debugger.resume", params: {} }));
  }
  assert.throws(() => validateCurrentFootprintInverseColdStepCommand({ phase: "inverse-cold-step", role: "branch", method: "Debugger.resume", params: {}, original: true }));
});

void test("inverse actual flow metadata must retain both pinned parser closures in the original script", () => {
  for (const role of ["update", "end"] as const) {
    const expected = FLOW[role];
    const location = { scriptId: "original-script", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber };
    const metadata = { result: [property("name", { type: "string", value: expected.name }), property("length", { type: "number", value: expected.arity })], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: location } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "original-scopes" } },
      { name: "[[Prototype]]", value: { type: "function", objectId: "original-prototype" } },
    ] };
    qualifyCurrentFootprintInverseColdFlowMethod(metadata, role, "original-script");
    assert.throws(() => { qualifyCurrentFootprintInverseColdFlowMethod(metadata, role, "foreign-script"); });
    const moved = { ...metadata, internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { ...location, columnNumber: expected.columnNumber + 1 } } }, ...metadata.internalProperties.slice(1)] };
    assert.throws(() => { qualifyCurrentFootprintInverseColdFlowMethod(moved, role, "original-script"); });
  }
});
