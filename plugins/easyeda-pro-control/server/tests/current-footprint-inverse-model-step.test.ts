/** Finite model grammar and actual production drain algorithm with explicit
 * synthetic stream/completion bindings. No native ownership is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseModelStepBudget, currentFootprintInverseModelStepNativeFrame, currentFootprintInverseModelStepWire, validateCurrentFootprintInverseModelStepCommand } from "../src/current-footprint-inverse-model-step-protocol.ts";
import { validateCurrentFootprintInverseColdStepCommand } from "../src/current-footprint-inverse-cold-step-protocol.ts";
import { drainCurrentFootprintInverseStartup } from "../src/current-footprint-inverse-startup-drain.ts";

void test("model steps have separate three-role grammar, exact original wire and derived per-chunk reservation", () => {
  for (const role of ["plaintext", "parsed", "ready"] as const) { const command = validateCurrentFootprintInverseModelStepCommand({ phase: "inverse-model-step", role, method: "Debugger.resume", params: {} }); const wire = currentFootprintInverseModelStepWire(command, 79, "original"); const bytes=Buffer.from(`${JSON.stringify(wire)}\0`); const frame=currentFootprintInverseModelStepNativeFrame(bytes,command,"original"); assert.deepEqual(frame, { action: "footprint-inverse-model-step", requestId: 79, stepRole: role }); assert.throws(() => validateCurrentFootprintInverseColdStepCommand({ ...command, phase: "inverse-cold-step" })); assert.throws(() => currentFootprintInverseModelStepNativeFrame(bytes, command, "foreign")); }
  for (const role of ["branch", "cold", "histories", "fetchEntry", "response", "bytes", "caller"]) { assert.throws(() => validateCurrentFootprintInverseModelStepCommand({ phase: "inverse-model-step", role, method: "Debugger.resume", params: {} })); }
  assert.deepEqual(currentFootprintInverseModelStepBudget(8), { chunks: 8, cdpRequests: 10, permits: 10, idle: 1, controls: 21 }); assert.throws(() => currentFootprintInverseModelStepBudget(9));
});
void test("drain waits only for positive original completions and retains an unsupported actual pause", async () => {
  const original = Object.freeze({ role: "original sync response" }), records: object[] = []; let completed = false, polls = 0, samples = 0;
  await drainCurrentFootprintInverseStartup<object>(Object.freeze({ maximumPauses: 1, assertCurrent: (): Promise<void> => Promise.resolve(), settleOriginalPromises: (): Promise<void> => { samples += 1; return Promise.resolve(); }, originalCompletionsPresent: (): boolean => completed, nextOriginalEvent: (): Promise<object> => { polls += 1; return Promise.resolve(original); }, serviceOriginalEvent: (event: object): Promise<boolean> => { assert.equal(event, original); completed = true; return Promise.resolve(true); }, retainUnsupported: (event: object): void => { records.push(event); } }));
  assert.equal(polls, 1); assert.equal(samples, 2); assert.equal(records.length, 0);
  await assert.rejects(drainCurrentFootprintInverseStartup<object>(Object.freeze({ maximumPauses: 1, assertCurrent: (): Promise<void> => Promise.resolve(), settleOriginalPromises: (): Promise<void> => Promise.resolve(), originalCompletionsPresent: (): boolean => false, nextOriginalEvent: (): Promise<object> => Promise.resolve(original), serviceOriginalEvent: (): Promise<boolean> => Promise.resolve(false), retainUnsupported: (event: object): void => { records.push(event); } })), /UNSUPPORTED_POST_READY_EVENT_HELD/u); assert.equal(records[0], original);
});
void test("a refused final Promise sample and an exhausted actual event allowance cannot become idle", async () => {
  let events = 0;
  const bindings = Object.freeze({ maximumPauses: 1, assertCurrent: (): Promise<void> => Promise.resolve(), settleOriginalPromises: (): Promise<void> => Promise.resolve(), originalCompletionsPresent: (): boolean => false, nextOriginalEvent: (): Promise<object> => { events += 1; return Promise.resolve(Object.freeze({})); }, serviceOriginalEvent: (): Promise<boolean> => Promise.resolve(true), retainUnsupported: (): void => { assert.fail("no unsupported event was provided"); } });
  await assert.rejects(drainCurrentFootprintInverseStartup<object>(bindings), /STARTUP_DRAIN/u); assert.equal(events, 1);
  const failure = new Error("original final native Promise remains pending"); await assert.rejects(drainCurrentFootprintInverseStartup<object>(Object.freeze({ ...bindings, settleOriginalPromises: (): Promise<void> => Promise.reject(failure) })), error => error === failure); assert.equal(events, 1);
});
