/** Real Node Inspector proof on an inert async function only. The vendor
 * application and its code are never executed by this regression. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle } from "../src/current-project-save-producer-cache-replies.ts";

const returnFrame = z.looseObject({ returnValue: z.unknown() });
const returnFrames = z.array(returnFrame).min(1);
const captureReply = z.strictObject({ result: z.unknown() });
const paused = z.looseObject({ params: z.looseObject({ callFrames: returnFrames }) });
void test("implicit async return exposes the actual outer Promise retained through its fulfilled Inspector metadata", { timeout: 10_000 }, async () => {
  const session = new Session(); session.connect(); const retained = Promise.withResolvers<string>(); let resumed = false;
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const expression = "globalThis.__inertInitialSyncReturn=async function original(){let r,i=new Promise(u=>r=u);await Promise.resolve();r();};";
    const compiled = await session.post("Runtime.compileScript", { expression, sourceURL: "inert-initial-sync-return.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
    await session.post("Runtime.runScript", { scriptId: compiled.scriptId });
    const point = await session.post("Debugger.setBreakpoint", { location: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: expression.indexOf("};") } }); assert.equal(point.actualLocation.columnNumber, expression.indexOf("};"));
    session.on("Debugger.resumed", (): void => { resumed = true; });
    session.on("Debugger.paused", (input: unknown): void => {
      const work = async (): Promise<string> => {
        const top = paused.parse(input).params.callFrames[0]; assert.ok(top !== undefined);
        const actual = currentProjectSaveProducerCachePromiseHandle(top.returnValue);
        const params = { objectId: actual, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [], objectGroup: "inert-initial-sync-return", throwOnSideEffect: true, silent: true, returnByValue: false, awaitPromise: false };
        const reply: unknown = await Promise.resolve<unknown>(session.post("Runtime.callFunctionOn", params));
        // Self-inspection resumes when this callback yields. Remote production
        // Custody separately requires the explicit ACK and resumed event.
        return currentProjectSaveProducerCachePromiseHandle(captureReply.parse(reply).result);
      };
      void (async (): Promise<void> => { try { retained.resolve(await work()); } catch (error) { retained.reject(error); } })();
    });
    await session.post("Runtime.evaluate", { expression: "__inertInitialSyncReturn()", awaitPromise: true, returnByValue: true });
    const original = await retained.promise; const metadata = await session.post("Runtime.getProperties", { objectId: original, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.equal(resumed, true); const internal = new Map(metadata.internalProperties?.map(field => [field.name, field.value]));
    // Node's test runner adds async-hook symbol properties. This regression
    // Proves original Promise semantics, not the Electron zero-own-key profile.
    assert.deepEqual(internal.get("[[PromiseState]]"), { type: "string", value: "fulfilled" }); assert.deepEqual(internal.get("[[PromiseResult]]"), { type: "undefined" });
    await session.post("Debugger.removeBreakpoint", { breakpointId: point.breakpointId }); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-initial-sync-return" });
    await session.post("Runtime.evaluate", { expression: "delete globalThis.__inertInitialSyncReturn" });
  } finally { session.disconnect(); }
});

void test("actual Inspector nested Proxy metadata exposes the wrapper without invoking its get trap", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const captured = await session.post("Runtime.evaluate", { expression: "globalThis.__inertProxyReads=0;globalThis.__inertProxyArray=[new Proxy({value:1},{get(target,key){globalThis.__inertProxyReads++;return Reflect.get(target,key)}})]", objectGroup: "inert-proxy-metadata", returnByValue: false });
    assert.equal(captured.result.subtype, "array"); assert.ok(captured.result.objectId !== undefined);
    const metadata = await session.post("Runtime.getProperties", { objectId: captured.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const child = metadata.result.find(field => field.name === "0"); assert.equal(child?.value?.subtype, "proxy"); assert.ok(child?.value?.objectId !== undefined);
    const reads = await session.post("Runtime.evaluate", { expression: "__inertProxyReads", returnByValue: true }); assert.equal(reads.result.value, 0);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-proxy-metadata" }); await session.post("Runtime.evaluate", { expression: "delete globalThis.__inertProxyArray;delete globalThis.__inertProxyReads" });
  } finally { session.disconnect(); }
});
