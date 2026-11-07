/** Owned inert Inspector/source tests. No app or inverse authority is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { Worker } from "node:worker_threads";
import { currentFootprintInverseConstructionNativeFrame, currentFootprintInverseConstructionWire, validateCurrentFootprintInverseConstructionCommand } from "../src/current-footprint-inverse-construction-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, currentProjectSaveStructureNativeCases } from "../src/current-project-save-structure-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS } from "../src/current-project-save-structure-programs.ts";

void test("inverse construction uses only fixed source commands and the original worker session", () => {
  for (const command of currentProjectSaveStructureNativeCases()) {
    const frame = currentFootprintInverseConstructionWire(command, 90, "original-worker"); const encoded = Buffer.from(`${JSON.stringify(frame)}\0`);
    const native = currentFootprintInverseConstructionNativeFrame(encoded, command, "original-worker");
    assert.equal(native["action"], "footprint-inverse-construction"); assert.equal(Object.hasOwn(native, "sessionId"), false);
    assert.throws(() => currentFootprintInverseConstructionNativeFrame(encoded, command, "foreign"));
  }
  assert.throws(() => validateCurrentFootprintInverseConstructionCommand({ phase: "inverse-construction-start", method: "Runtime.evaluate", params: {} }));
});
void test("real paused Inspector compiles the fixed constructor call and frame expression as exact helper sources", async context => {
  const expression = SITES.bootstrap.expression, program = CALLS.bootstrap;
  const worker = new Worker(`const{parentPort}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const session=new Session();session.connectToMainThread();const scripts=[];let pauses=0;session.on("Debugger.scriptParsed",event=>scripts.push(event.params));
await session.post("Runtime.enable");await session.post("Debugger.enable");const target=await session.post("Runtime.evaluate",{expression:"globalThis",returnByValue:false});const point=await session.post("Debugger.setInstrumentationBreakpoint",{instrumentation:"beforeScriptExecution"});
const timeout=setTimeout(()=>{void session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId}).then(()=>session.post("Debugger.resume")).catch(()=>{});parentPort.postMessage({error:"owned constructor probe exceeded deadline"});session.disconnect();parentPort.close();},10000);
session.on("Debugger.paused",event=>{void(async()=>{pauses++;if(pauses>1){await session.post("Debugger.resume");return;}const start=scripts.length;
for(let repeat=0;repeat<2;repeat++){await session.post("Runtime.callFunctionOn",{objectId:target.result.objectId,functionDeclaration:${JSON.stringify(program)},arguments:[],returnByValue:false,throwOnSideEffect:true,silent:true,generatePreview:false,awaitPromise:false,userGesture:false});
await session.post("Debugger.evaluateOnCallFrame",{callFrameId:event.params.callFrames[0].callFrameId,expression:${JSON.stringify(expression)},returnByValue:false,throwOnSideEffect:true,silent:true,generatePreview:false,includeCommandLineAPI:false});}
const helpers=[];for(const item of scripts.slice(start)){helpers.push({url:item.url,source:(await session.post("Debugger.getScriptSource",{scriptId:item.scriptId})).scriptSource});}
await session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId});await session.post("Debugger.resume");clearTimeout(timeout);parentPort.postMessage({pauses,helpers});session.disconnect();parentPort.close();})().catch(error=>{clearTimeout(timeout);parentPort.postMessage({error:String(error)});session.disconnect();parentPort.close();});});parentPort.postMessage({ready:true});})().catch(error=>{parentPort.postMessage({error:String(error)});parentPort.close();});`, { eval: true });
  context.after(async () => { await worker.terminate(); });
  const completed = Promise.withResolvers<unknown>(); worker.on("error", completed.reject);
  worker.on("message", (value: unknown): void => { if (value !== null && typeof value === "object" && "ready" in value && value.ready === true) {
    new Script("void 0;", { filename: "original-inverse-constructor-probe.js" }).runInThisContext();
  } else { completed.resolve(value); } });
  const value = await completed.promise; assert.ok(value !== null && typeof value === "object" && "pauses" in value && "helpers" in value);
  assert.equal(value.pauses, 1); assert.deepEqual(value.helpers, [{ url: "", source: `(${program})` }, { url: "", source: expression }, { url: "", source: `(${program})` }, { url: "", source: expression }]);
});
