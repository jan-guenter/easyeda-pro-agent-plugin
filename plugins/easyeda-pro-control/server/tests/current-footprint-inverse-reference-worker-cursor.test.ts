/** Cursor/source facts only; synthetic callbacks cannot issue Core tokens. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS as CALLERS } from "../src/current-footprint-inverse-delete-native-event-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_SITES as SITES } from "../src/current-footprint-inverse-reference-worker-source.ts";
import { CurrentFootprintInverseReferenceWorkerCursor, currentFootprintInverseReferenceEntryFrames } from "../src/current-footprint-inverse-reference-worker-cursor.ts";
import { currentFootprintInverseReferenceWorkerCases } from "../src/current-footprint-inverse-reference-worker-protocol.ts";
import type { CurrentFootprintInverseReferenceWorkerCommand } from "../src/current-footprint-inverse-reference-worker-protocol.ts";
import { requireOriginalCurrentFootprintInverseReferenceReadiness, requireOriginalCurrentFootprintInverseReferenceWorkerCompletion } from "../src/current-footprint-inverse-reference-worker.ts";

const breakpoint = "original_point", script = "original_script", session = "original_session";
interface TestLocation { scriptId: string; lineNumber: number; columnNumber: number }
interface TestFrame { callFrameId: string; functionName: string; functionLocation: TestLocation; location: TestLocation; url: string; scopeChain: readonly never[]; this: Readonly<{ type: string }>; canBeRestarted: boolean }
function entry(): { method: string; sessionId: string; params: { reason: string; hitBreakpoints: string[]; callFrames: TestFrame[] } } {
  const sites = [SITES.entry, ...CALLERS.map(caller => ({ functionName: caller.functionName, functionLine: caller.lineNumber, functionColumn: caller.columnNumber, lineNumber: caller.lineNumber, columnNumber: caller.pausedColumn }))];
  return { method: "Debugger.paused", sessionId: session, params: { reason: "other", hitBreakpoints: [breakpoint], callFrames: sites.map((site, index) => ({ callFrameId: `frame_${String(index)}`, functionName: site.functionName, functionLocation: { scriptId: script, lineNumber: site.functionLine, columnNumber: site.functionColumn }, location: { scriptId: script, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, url: "", scopeChain: [], this: { type: "undefined" }, canBeRestarted: false })) } };
}
void test("reference entry authenticates the actual five-frame native caller path", () => {
  assert.deepEqual(currentFootprintInverseReferenceEntryFrames(entry(), session, script, breakpoint), { entryFrame: "frame_0", nativeEventFrame: "frame_4" });
  for (const fault of ["caller-pc", "function", "duplicate-id", "native-missing", "foreign-script", "foreign-point"] as const) {
    const value = entry(); const caller = value.params.callFrames[1]; assert.ok(caller);
    if (fault === "caller-pc") { caller.location.columnNumber += 1; }
    if (fault === "function") { caller.functionLocation.columnNumber += 1; }
    if (fault === "duplicate-id") { caller.callFrameId = "frame_0"; }
    if (fault === "native-missing") { value.params.callFrames.pop(); }
    if (fault === "foreign-script") { caller.location.scriptId = "foreign"; }
    if (fault === "foreign-point") { value.params.hitBreakpoints = ["foreign"]; }
    assert.throws(() => currentFootprintInverseReferenceEntryFrames(value, session, script, breakpoint), Error, fault);
  }
  let getters = 0; const value = Object.defineProperty({}, "method", { enumerable: true, get: () => { getters += 1; return "Debugger.paused"; } });
  assert.throws(() => currentFootprintInverseReferenceEntryFrames(value, session, script, breakpoint)); assert.equal(getters, 0);
});
void test("reference helpers require their own dispatched command and exact original script receipt", async () => {
  const command = currentFootprintInverseReferenceWorkerCases().find(value => value.method === "Runtime.callFunctionOn"); assert.ok(command?.method === "Runtime.callFunctionOn");
  for (const wrongSource of [false, true]) {
    let requests = 0; const program = command.params.functionDeclaration;
    const cursor = new CurrentFootprintInverseReferenceWorkerCursor(Object.freeze({ scriptId: script, sessionId: session, executionContextId: 7, nodes: [1], current: () => Promise.resolve(), next: () => Promise.reject(new Error("no event")), request: (input: CurrentFootprintInverseReferenceWorkerCommand) => {
      requests += 1;
      if (input.method === "Runtime.callFunctionOn") { assert.equal(cursor.observe({ method: "Debugger.scriptParsed", sessionId: session, params: { scriptId: "helper_1", executionContextId: 7, url: "" } }), true); return Promise.resolve({ result: { type: "undefined" } }); }
      assert.equal(input.method, "Debugger.getScriptSource"); return Promise.resolve({ scriptSource: wrongSource ? `(${program});` : `(${program})` });
    } }));
    await cursor.request(command);
    await assert.rejects(cursor.qualifyHelper({ ...command })); assert.equal(requests, 1);
    await (wrongSource ? assert.rejects(cursor.qualifyHelper(command)) : cursor.qualifyHelper(command));
    assert.equal(requests, 2); assert.throws(() => { cursor.prepareComplete(); }); assert.throws(() => { cursor.requireReady(); }); assert.throws(() => { cursor.beginQuery(0); });
  }
  const cursor = new CurrentFootprintInverseReferenceWorkerCursor(Object.freeze({ scriptId: script, sessionId: session, executionContextId: 7, nodes: [1], current: () => Promise.resolve(), request: () => Promise.reject(new Error("no request")), next: () => Promise.reject(new Error("no event")) }));
  assert.throws(() => cursor.observe({ method: "Debugger.scriptParsed", sessionId: session, params: { scriptId: "unknown", executionContextId: 7, url: "" } }));
  const prepared = Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" as const });
  assert.throws(() => requireOriginalCurrentFootprintInverseReferenceReadiness({ profile: "private.current-footprint-inverse-reference-readiness.v1" }, {}, prepared));
  assert.throws(() => requireOriginalCurrentFootprintInverseReferenceWorkerCompletion({ profile: "private.current-footprint-inverse-reference-worker-completion.v1" }, {}, prepared));
});
