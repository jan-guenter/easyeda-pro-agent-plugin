/** Synthetic descriptor identities and actual local V8 locations. No native
 * owner, EasyEDA process or writer is created by this file. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import type { createContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES as FRAMES, CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_RELATION as RELATION, CURRENT_FOOTPRINT_COPY_ALLOCATION_REQUESTS as REQUESTS,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE as SITE, CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE as WRAPPER,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SITE as WRAPPER_SITE, decodeCurrentFootprintCopyAllocationPause,
  validateCurrentFootprintCopyAllocationCommand } from "../src/current-footprint-copy-allocation-contract.ts";
import { allocationVmFixture as fixture } from "./helpers/footprint-copy-allocation-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET as OLD_BUDGET } from "../src/current-footprint-copy-create-clock-budget.ts";
import { validateCurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { FOOTPRINT_CREATE_SOURCE_FIXTURE as SOURCE } from "./helpers/current-footprint-copy-create-source-fixture.ts";

function join(context: ReturnType<typeof createContext>): unknown {
  return runInContext(`(${RELATION}).call(PROJECT,bus,manager,consistency,constructors,methods,build,create,wrapper)`, context);
}
void test("allocation relation binds the original wrapper, create argument and buildString input without native method calls", () => {
  const context = fixture(); const output: unknown = join(context); assert.ok(Array.isArray(output));
  assert.equal(output[0], "c".repeat(16)); assert.equal(output[1], runInContext("JSON.stringify(argument)", context));
  assert.equal(runInContext("calls", context), 0);
});
void test("equal-valued competing inputs, kept UUIDs and replaced receivers fail the descriptor join", () => {
  for (const change of ["build[1]={data:{...argument}}", "build[2]={...argument}", "create[1]={...argument}", "wrapper[6]={...argument}",
    "build[3]=true", "build[4]=argument.uuid", "wrapper[8]=JSON.stringify({...argument,title:'Other'})", "wrapper[5]=Array.from(methods)",
    "wrapper[7][0]=methods[1]", "create[0]={...manager}", "input.keepUUID=false", "Tg.prototype.create=async()=>{calls++}",
    "Object.defineProperty(input,'data',{get(){calls++;return argument;}})"]) {
    const context = fixture(); runInContext(change, context); assert.throws(() => join(context)); assert.equal(runInContext("calls", context), 0);
  }
});
function pause(): { reason: "other"; hitBreakpoints: string[]; callFrames: { callFrameId: string; functionName: string; functionLocation: { scriptId: string; lineNumber: number; columnNumber: number }; location: { scriptId: string; lineNumber: number; columnNumber: number } }[] } {
  return { reason: "other", hitBreakpoints: ["allocation-point"], callFrames: [
    { callFrameId: "build", functionName: "buildString", functionLocation: { scriptId: "worker", lineNumber: SITE.functionLine, columnNumber: SITE.functionColumn }, location: { scriptId: "worker", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } },
    { callFrameId: "create", functionName: "create", functionLocation: { scriptId: "worker", lineNumber: SITE.createLine, columnNumber: SITE.createColumn }, location: { scriptId: "worker", lineNumber: SITE.createLine, columnNumber: SITE.createCallColumn } },
    { callFrameId: "wrapper", functionName: "", functionLocation: { scriptId: "wrapper-script", lineNumber: WRAPPER_SITE.functionLine, columnNumber: WRAPPER_SITE.functionColumn }, location: { scriptId: "wrapper-script", lineNumber: WRAPPER_SITE.callLine, columnNumber: WRAPPER_SITE.callColumn } },
  ] };
}
void test("pre-await pause requires adjacent original create and fixed wrapper frames", () => {
  assert.deepEqual(decodeCurrentFootprintCopyAllocationPause(pause(), "worker", "allocation-point"), { buildFrameId: "build", createFrameId: "create", wrapperFrameId: "wrapper", wrapperScriptId: "wrapper-script" });
  for (const index of [0, 1, 2]) {
    for (const field of ["location", "functionLocation"] as const) {
      const value = pause(); const frame = value.callFrames[index]; assert.ok(frame); frame[field].columnNumber += 1;
      assert.throws(() => decodeCurrentFootprintCopyAllocationPause(value, "worker", "allocation-point"));
    }
  }
  const value = pause(); value.callFrames.reverse(); assert.throws(() => decodeCurrentFootprintCopyAllocationPause(value, "worker", "allocation-point"));
  assert.throws(() => decodeCurrentFootprintCopyAllocationPause(pause(), "foreign-worker", "allocation-point"));
});
void test("new allocation grammar stays separate from current native clock phases and reserves ten additional IDs", () => {
  const arm = { phase: "allocation-arm", method: "Debugger.setBreakpoint", sessionId: "worker", params: { location: { scriptId: "worker-script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber }, condition: "true" } };
  assert.deepEqual(validateCurrentFootprintCopyAllocationCommand(arm), arm); assert.throws(() => validateCurrentFootprintCopyClockRpcCommand(arm));
  assert.equal(REQUESTS.normal + REQUESTS.cleanup, REQUESTS.total); assert.equal(OLD_BUDGET.total + REQUESTS.total, REQUESTS.combinedCreateClockTotal);
  assert.equal(OLD_BUDGET.normal + REQUESTS.normal, REQUESTS.combinedCreateClockNormal); assert.equal(OLD_BUDGET.cleanup + REQUESTS.cleanup, REQUESTS.combinedCreateClockCleanup);
  assert.equal(REQUESTS.mounted, false); assert.equal(FRAMES.build, "[this,s,r,i,n]");
  for (const change of [{ ...arm, params: { ...arm.params, condition: "callerCode()" } }, { ...arm, params: { ...arm.params, location: { ...arm.params.location, columnNumber: SITE.columnNumber + 1 } } }, { ...arm, sessionId: "x".repeat(129) }]) {
    assert.throws(() => validateCurrentFootprintCopyAllocationCommand(change));
  }
  assert.throws(() => validateCurrentFootprintCopyAllocationCommand({ phase: "allocation-frame", method: "Debugger.evaluateOnCallFrame", sessionId: "worker", params: { callFrameId: "frame", expression: "callerCode()", objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
});
void test("actual local V8 retains the source-derived pre-await site and original fixed wrapper call location", async () => {
  let line = `class Tg{${" ".repeat(36_602 - 9)}${SOURCE.worker.buildString}`;
  line += `${" ".repeat(37_585 - line.length)}${SOURCE.worker.create}}`;
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const native = await session.post("Runtime.compileScript", { expression: `${"\n".repeat(109)}${line}`, sourceURL: "allocation-native-sites.js", persistScript: true }); assert.ok(native.scriptId !== undefined && native.scriptId.length > 0);
    const requested = { scriptId: native.scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber };
    const allocated = await session.post("Debugger.setBreakpoint", { location: requested }); assert.deepEqual(allocated.actualLocation, requested);
    await session.post("Debugger.removeBreakpoint", { breakpointId: allocated.breakpointId });
    const original = await session.post("Runtime.compileScript", { expression: WRAPPER, sourceURL: "allocation-wrapper.js", persistScript: true }); assert.ok(original.scriptId !== undefined && original.scriptId.length > 0);
    const actual = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: original.scriptId, lineNumber: WRAPPER_SITE.callLine, columnNumber: WRAPPER_SITE.callColumn }, end: { scriptId: original.scriptId, lineNumber: WRAPPER_SITE.callLine, columnNumber: WRAPPER_SITE.callColumn + 1 } });
    assert.deepEqual(actual.locations, [{ scriptId: original.scriptId, lineNumber: WRAPPER_SITE.callLine, columnNumber: WRAPPER_SITE.callColumn, type: "call" }]);
  } finally { session.disconnect(); }
});
