/** Independent inert qe execution. No native owner or application is opened. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Debugger, Runtime } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { currentFootprintInverseNativeDeleteClockNative as qualifyNative } from "../../src/current-footprint-inverse-native-delete-clock-replies.ts";

import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES} from "../../src/current-footprint-inverse-native-delete-serialization-profile.ts";
import {currentFootprintInverseNativeDeleteSerializationPromise as qualifyPromise} from "../../src/current-footprint-inverse-native-delete-serialization-replies.ts";

const input = z.strictObject({ source: z.string().max(2_181_308), program: z.string().max(4096) }).parse(workerData);
const nullablePort = parentPort; assert.ok(nullablePort !== null); const port = nullablePort;
const session = new Session(); session.connectToMainThread();
const keep = setInterval((): void => { port.ref(); }, 100);
interface Retained { readonly cell: string; readonly promise: string }
const work: { pending: Promise<Retained> | null; join: Promise<void> | null } = { pending: null, join: null };
const finished = Promise.withResolvers<Retained>();
let held = false;
let resumeAttempted = false;
let requests = 0;
function count(): void { requests += 1; assert.ok(requests <= 18); }
function checked(params: Runtime.CallFunctionOnParameterType): Promise<Runtime.CallFunctionOnReturnType> {
  const actual = { ...params, throwOnSideEffect: true };
  return session.post("Runtime.callFunctionOn", actual);
}
async function resume(): Promise<void> {
  assert.ok(held && !resumeAttempted); resumeAttempted = true; count();
  await session.post("Debugger.resume"); held = false;
}
async function run(): Promise<void> {
  count(); await session.post("Runtime.enable"); count(); await session.post("Debugger.enable");
  count(); const compiled = await session.post("Runtime.compileScript", { expression: input.source, sourceURL: "inert-original-native-del-qe.js", persistScript: true });
  assert.ok(compiled.scriptId !== undefined); const scriptId = compiled.scriptId;
  count(); await session.post("Runtime.runScript", { scriptId });
  count(); const point = await session.post("Debugger.setBreakpoint", { location: { scriptId, lineNumber: 109, columnNumber: 40_282 }, condition: "true" });
  assert.deepEqual(point.actualLocation, { scriptId, lineNumber: 109, columnNumber: 40_282 });
  const onPaused = (notification: { params: Debugger.PausedEventDataType }): void => {
    const pending = (async (): Promise<Retained> => {
      assert.equal(work.pending, null); const frame = notification.params.callFrames[0];
      assert.ok(frame !== undefined && frame.returnValue !== undefined); assert.equal(frame.functionName, "deleteString");
      assert.deepEqual(frame.location, { scriptId, lineNumber: 109, columnNumber: 40_282 });
      assert.equal(frame.returnValue.type, "object"); assert.equal(frame.returnValue.subtype, "promise");
      assert.equal(frame.returnValue.className, "Promise"); assert.ok(frame.returnValue.objectId !== undefined); held = true;
      count();const lexical=await session.post("Debugger.evaluateOnCallFrame",{callFrameId:frame.callFrameId,expression:SITES.stringReturned.expression,objectGroup:"inert-native-delete-clock-return",silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false});
      assert.equal(lexical.exceptionDetails,undefined);assert.equal(lexical.result.description,"Array(14)");
      count(); const before = await session.post("Runtime.getProperties", { objectId: frame.returnValue.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      qualifyPromise(before, "head|\natom"); assert.equal(before.result.length, 0); assert.equal(before.internalProperties?.find(row => row.name === "[[PromiseState]]")?.value?.value, "fulfilled");
      count(); const captured = await checked({ objectId: frame.returnValue.objectId, functionDeclaration: input.program,
        arguments: [], returnByValue: false, objectGroup: "inert-native-delete-clock-return", silent: true, generatePreview: false,
        awaitPromise: false });
      assert.equal(captured.exceptionDetails, undefined); assert.equal(captured.result.description, "Array(3)"); assert.ok(captured.result.objectId !== undefined);
      const cell = captured.result.objectId;
      count(); const values = await session.post("Runtime.getProperties", { objectId: cell, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const promise = values.result.find(row => row.name === "0")?.value;
      assert.ok(promise !== undefined && promise.type === "object" && promise.subtype === "promise" && promise.className === "Promise" && promise.objectId !== undefined);
      const constructor = values.result.find(row => row.name === "2")?.value; assert.ok(constructor?.objectId !== undefined);
      count(); qualifyNative(await session.post("Runtime.getProperties", { objectId: constructor.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), "constructor");
      const promiseId = promise.objectId; await resume(); return Object.freeze({ cell, promise: promiseId });
    })(); work.pending = pending;
    work.join = (async (): Promise<void> => { try { finished.resolve(await pending); } catch (caughtError) { finished.reject(caughtError); } })();
  };
  session.on("Debugger.paused", onPaused);
  try {
    count(); const invocation = await session.post("Runtime.evaluate", { expression: 'globalThis.__nativeClockOuter=(new C).deleteString("1234567890abcdef")', awaitPromise: false, returnByValue: false });
    const retained = await finished.promise; assert.ok(invocation.result.objectId !== undefined);
    count(); const matched = await checked({ objectId: retained.cell, functionDeclaration: "function(outer){return [this[0]===outer]}",
      arguments: [{ objectId: invocation.result.objectId }], returnByValue: true });
    assert.deepEqual(matched.result.value, [true]);
    count(); const after = await session.post("Runtime.getProperties", { objectId: retained.promise, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    qualifyPromise(after, "head|\natom"); assert.equal(after.result.length, 0); assert.equal(after.internalProperties?.find(row => row.name === "[[PromiseState]]")?.value?.value, "fulfilled");
    assert.equal(after.internalProperties?.find(row => row.name === "[[PromiseResult]]")?.value?.value, "head|\natom");
    count(); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-native-delete-clock-return" });
    count(); await session.post("Debugger.removeBreakpoint", { breakpointId: point.breakpointId });
    port.postMessage({ originalReturnCapturedBeforeResume: true, capturedReturnIsOuterPromise: true, capturedReturnIsInnerPromise: false,
      sameRetainedPromiseFulfilled: true, requests, nativeOwnerIssued: false });
  } finally { session.off("Debugger.paused", onPaused); }
}
try {
  // oxlint-disable-next-line node/no-top-level-await -- This isolated fixture is a Worker entrypoint; it must join its original Inspector work before closing.
  await run();
} catch (caughtError) {
  if (held && !resumeAttempted) {
    // oxlint-disable-next-line node/no-top-level-await -- Only this fixture's own verified held pause can require original cleanup.
    await resume();
  }
  port.postMessage({ failure: caughtError instanceof Error ? caughtError.message : "unknown" });
} finally {
  // oxlint-disable-next-line node/no-top-level-await -- Join the exact callback and its settlement task before this fixture's session closes.
  await Promise.allSettled([...(work.pending === null ? [] : [work.pending]), ...(work.join === null ? [] : [work.join])]);
  session.disconnect(); clearInterval(keep); port.close();
}
