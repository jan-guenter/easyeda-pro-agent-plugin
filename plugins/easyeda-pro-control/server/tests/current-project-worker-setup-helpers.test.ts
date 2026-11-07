/** Real Inspector compiler behavior on an owned inert Node script. No app,
 * browser, cache method/getter or native owner is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_PROJECT_WORKER_SETUP_HELPERS as HELPERS, qualifyCurrentProjectWorkerSetupHelperSource, requireCurrentProjectWorkerSetupHelper } from "../src/current-project-worker-setup-helpers.ts";

void test("only exact correlated fixed helper source can be consumed during original setup", () => {
  for (const program of HELPERS) { qualifyCurrentProjectWorkerSetupHelperSource(`(${program})`, program);
    assert.throws(() => { qualifyCurrentProjectWorkerSetupHelperSource(program, program); });
    assert.throws(() => { qualifyCurrentProjectWorkerSetupHelperSource(`(${program})\n`, program); }); }
  assert.throws(() => { requireCurrentProjectWorkerSetupHelper("function(){return true;}"); });
});
void test("real paused-thread Inspector reports the helper script before original resumed without a nested pause", async context => {
  const program = HELPERS[1]; assert.ok(program !== undefined);
  const worker = new Worker(`const{parentPort}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const session=new Session();session.connectToMainThread();const scripts=[];let pauses=0;session.on("Debugger.scriptParsed",event=>scripts.push(event.params));
await session.post("Runtime.enable");await session.post("Debugger.enable");const target=await session.post("Runtime.evaluate",{expression:"globalThis",returnByValue:false});
const point=await session.post("Debugger.setInstrumentationBreakpoint",{instrumentation:"beforeScriptExecution"});
const timeout=setTimeout(()=>{void session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId}).then(()=>session.post("Debugger.resume")).catch(()=>{});parentPort.postMessage({error:"owned inert probe exceeded deadline"});session.disconnect();parentPort.close();},10000);
session.on("Debugger.paused",()=>{void(async()=>{pauses++;if(pauses>1){await session.post("Debugger.resume");return;}const start=scripts.length;
await session.post("Runtime.callFunctionOn",{objectId:target.result.objectId,functionDeclaration:${JSON.stringify(program)},arguments:[],returnByValue:false,throwOnSideEffect:true,silent:true,generatePreview:false,awaitPromise:false,userGesture:false});
const helpers=[];for(const item of scripts.slice(start)){helpers.push({url:item.url,source:(await session.post("Debugger.getScriptSource",{scriptId:item.scriptId})).scriptSource});}
await session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId});await session.post("Debugger.resume");clearTimeout(timeout);parentPort.postMessage({pauses,helpers});session.disconnect();parentPort.close();})().catch(error=>{clearTimeout(timeout);parentPort.postMessage({error:String(error)});session.disconnect();parentPort.close();});});parentPort.postMessage({ready:true});})().catch(error=>{parentPort.postMessage({error:String(error)});parentPort.close();});`, { eval: true });
  context.after(async () => { await worker.terminate(); });
  const completed = Promise.withResolvers<unknown>(); worker.on("error", completed.reject);
  worker.on("message", (value: unknown): void => { if (value !== null && typeof value === "object" && "ready" in value && value.ready === true) {
    new Script("globalThis.__easyedaOwnedHelperProbe=1;", { filename: "original-owned-helper-probe.js" }).runInThisContext();
  } else { completed.resolve(value); } });
  const value = await completed.promise; assert.ok(value !== null && typeof value === "object" && "pauses" in value && "helpers" in value);
  assert.equal(value.pauses, 1); assert.ok(Array.isArray(value.helpers)); assert.equal(value.helpers.length, 1); const item: unknown = value.helpers[0];
  assert.ok(item !== null && typeof item === "object" && "url" in item && "source" in item); assert.equal(item.url, ""); qualifyCurrentProjectWorkerSetupHelperSource(item.source, program);
});
