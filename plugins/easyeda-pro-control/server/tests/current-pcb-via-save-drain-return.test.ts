/** Original uploader definitions run only on inert objects in our Node. No
 * application, native Cache, timer, network or EasyEDA process exists. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as METHODS } from "../src/current-project-save-producer-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS } from "../src/current-project-save-producer-cache-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "../src/current-project-save-producer-cache-replies.ts";

void test("all three actual uploader closing braces expose the original async invocation Promise", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const cases = [
      { role: "detachedReturned", source: `globalThis.__inertDrainTarget=(()=>{const cg=v=>v,Response=class{},f={result:"a".repeat(32)},u="body",l={url:["original-key"]},t=new Map([["original-key","body"]]);return function(){return (${CALLERS.localSave.functionSource})}.call({branchUuid:"b".repeat(32),localCache:{put:async()=>{},delete:async()=>true},bufferUploadCache:new Map})})();`, tail: `${CALLERS.localSave.functionSource})` },
      { role: "batchReturned", source: `globalThis.__inertDrainTarget=({${METHODS.batchUploadCloud}}).batchUploadCloud;globalThis.__inertDrainReceiver={uploadCloud:async()=>({success:true}),task1:new Set};`, tail: `${METHODS.batchUploadCloud}})` },
      { role: "bufferDone", source: `globalThis.__inertDrainReceiver={task1:new Set,bufferUploadData:new Map};globalThis.__inertDrainTarget=(()=>{let timer;const setTimeout=f=>{timer=f;return 1},clearTimeout=()=>{},target={${METHODS.bufferedStream}};const wrapper=target.bufferedStream.call(globalThis.__inertDrainReceiver,async()=>{},500);wrapper({dataUrl:"key",dataStr:"body"});return timer})();`, tail: `${METHODS.bufferedStream}}` },
    ];
    for (const profile of cases) {
      const offset = profile.source.indexOf(profile.tail); assert.ok(offset !== -1);
      // Each literal ends at the exact old role's closing brace; c's brace is
      // Immediately before bufferedStream's final method brace.
      let column = offset + profile.tail.length - 2;
      if (profile.role === "bufferDone" || profile.role === "batchReturned") { column = offset + profile.tail.length - 3; }
      const compiled = await session.post("Runtime.compileScript", { expression: profile.source, sourceURL: `inert-drain-${profile.role}.js`, persistScript: true }); assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
      await session.post("Runtime.runScript", { scriptId: compiled.scriptId });
      const point = await session.post("Debugger.setBreakpoint", { location: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: column } }); assert.equal(point.actualLocation.columnNumber, column);
      const retained = Promise.withResolvers<string>();
      const onPause = (event: { params: { callFrames: readonly { returnValue?: unknown }[] } }): void => {
        try { const raw = currentProjectSaveProducerCachePromiseHandle(event.params.callFrames[0]?.returnValue);
          const capture=async():Promise<void>=>{try{const value:unknown=await Promise.resolve<unknown>(session.post("Runtime.callFunctionOn", { objectId: raw, functionDeclaration: RETAIN, objectGroup: "inert-drain-return", returnByValue: false, throwOnSideEffect: true }));assert.ok(value!==null&&typeof value==="object");retained.resolve(currentProjectSaveProducerCachePromiseHandle(Reflect.get(value,"result")));}catch(error){retained.reject(error);}};void capture();
        } catch (error) { retained.reject(error); }
        void session.post("Debugger.resume");
      };
      session.on("Debugger.paused", onPause);
      const invocation = await session.post("Runtime.evaluate", { expression: "__inertDrainTarget.call(globalThis.__inertDrainReceiver)", objectGroup: "inert-drain-return", awaitPromise: false, returnByValue: false });
      const actual = currentProjectSaveProducerCachePromiseHandle(invocation.result), captured = await retained.promise;
      const identity = await session.post("Runtime.callFunctionOn", { objectId: captured, functionDeclaration: "function(actual){return this===actual;}", arguments: [{ objectId: actual }], returnByValue: true }); assert.equal(identity.result.value, true, profile.role);
      const metadata = await session.post("Runtime.getProperties", { objectId: captured, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); assert.deepEqual(metadata.result.map(field=>field.name),["Symbol(async_id_symbol)","Symbol(trigger_async_id_symbol)"],profile.role);
      // Node test-runner async_hooks add these two own symbols; browser worker
      // Production decoding remains strict and accepts no own Promise fields.
      assert.equal(decodeCurrentProjectSaveProducerCachePromise({...metadata,result:[]}), "fulfilled", profile.role);
      session.off("Debugger.paused", onPause); await session.post("Debugger.removeBreakpoint", { breakpointId: point.breakpointId });
      await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-drain-return" });
      await session.post("Runtime.evaluate", { expression: "delete globalThis.__inertDrainTarget;delete globalThis.__inertDrainReceiver" });
    }
  } finally { session.disconnect(); }
});
