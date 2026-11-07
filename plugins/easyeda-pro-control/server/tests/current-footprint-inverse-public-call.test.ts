/* oxlint-disable import/max-dependencies -- Actual-source/Inspector test joins SDK, service frame and fixed protocol boundaries. */
/** Actual pinned SDK/service declarations execute only on an inert graph.
 * The service is stopped before its handler, never an EasyEDA/native owner. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { Worker } from "node:worker_threads";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_CALLEES as API } from "../src/current-footprint-inverse-public-api-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_PROGRAMS as SDK } from "../src/current-footprint-inverse-public-api-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES as FILES, qualifyCurrentFootprintInversePublicDeleteSource } from "../src/current-footprint-inverse-public-delete-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_EXPRESSIONS as E, CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_PROGRAMS as P } from "../src/current-footprint-inverse-public-call-programs.ts";
import { currentFootprintInversePublicCallCases, currentFootprintInversePublicCallTemplate, validateCurrentFootprintInversePublicCallCommand } from "../src/current-footprint-inverse-public-call-protocol.ts";
import { currentFootprintInversePublicCallData, currentFootprintInversePublicCallPause } from "../src/current-footprint-inverse-public-call-replies.ts";

async function installed(context: TestContext): Promise<string | null> {
  try { const source = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILES.api.relativePath}`, "utf8"); qualifyCurrentFootprintInversePublicDeleteSource("api", source); return source; }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed API source unavailable"); return null; } throw error; }
}
/** Preserve original UTF16/line coordinates while evaluating only five exact
 * original class declarations. Their unrelated methods are never invoked. */
function inertSource(source: string): string {
  let output = source.replaceAll(/[^\r\n]/gu, " ");
  const intro = '(()=>{"use strict";let p4,qh,xae,xT,Iy;const _ae="_MSG_BUS_RPC_",dd=(t,k)=>t[k]??=[],WI=(a,v)=>a.splice(a.indexOf(v),1);'; output = intro + output.slice(intro.length);
  for (const name of ["qh", "p4", "xae", "xT", "Iy"]) { const row = API.find(entry => entry.key === name); assert.ok(row !== undefined); const prefix = `;${name}=`; output = output.slice(0, row.start - prefix.length) + prefix + source.slice(row.start, row.end) + output.slice(row.end); }
  return `${output};const bus=new xae(true);bus.uuid="inert-original-bus";const lib=Object.create(xT.prototype),Pe=Object.create(Iy.prototype);Pe.extensionUuid="eda";Pe.lib_Footprint=lib;const T={extensionApiMessageBus2:bus};globalThis._EXTAPI_ROOT_=Pe;globalThis._MSG_BUS2_EXTAPI_=bus;globalThis.gVars={currentProject:{projectId:"a".repeat(64),branchUuid:"b".repeat(32),isV2Format:false},isHistoryMode:false,extensionApiMessageBus2:bus};
globalThis.__inverseHandlerCalls=0;globalThis.__inverseHandlerPromise=new Promise(resolve=>{globalThis.__inverseHandlerResolve=resolve});const handler=()=>{globalThis.__inverseHandlerCalls++;return globalThis.__inverseHandlerPromise};bus.rpcService("extensionApi.LIB_Footprint.delete",handler);globalThis.__inverseTask=[bus.pulled["extensionApi.LIB_Footprint.delete"][0],bus.pulled["extensionApi.LIB_Footprint.delete"][0].callback,()=>true];globalThis.__inverseHandler=[handler];globalThis.__inverseOriginal=(${SDK.capture})({projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16)});globalThis.__inverseCallees=(${SDK.scopes}).call({object:{T,Pe,Iy,xT,xae,qh}},__inverseOriginal,{object:{xae,qh}});})()`;
}
const inspect = String.raw`
const {parentPort,workerData}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const session=new Session;session.connectToMainThread();await session.post("Debugger.enable");await session.post("Runtime.enable");const compiled=await session.post("Runtime.compileScript",{expression:workerData.source,sourceURL:"inert-original-sdk.js",persistScript:true});if(!compiled.scriptId)throw Error("compile");const ran=await session.post("Runtime.runScript",{scriptId:compiled.scriptId});if(ran.exceptionDetails)throw Error("run");
const ids=[];for(const columnNumber of [99832,99878]){const value=await session.post("Debugger.setBreakpoint",{location:{scriptId:compiled.scriptId,lineNumber:1,columnNumber}});if(value.actualLocation.columnNumber!==columnNumber)throw Error("moved");ids.push(value.breakpointId);}
const object=async expression=>{const raw=await session.post("Runtime.evaluate",{expression});if(!raw.result.objectId||raw.exceptionDetails)throw Error("object");return raw.result.objectId;};
const original=await object("globalThis.__inverseOriginal"),callees=await object("globalThis.__inverseCallees"),task=await object("globalThis.__inverseTask"),handler=await object("globalThis.__inverseHandler");let stage=0,entryEvent,helperScript,entryValid,afterValid,rawPacket,rawMessage;const reply=Promise.withResolvers();
session.on("Debugger.paused",event=>{void(async()=>{const frames=event.params.callFrames,top=frames[0];if(stage++===0){entryEvent={...event.params,callFrames:frames};helperScript=frames[6].functionLocation.scriptId;
const entry=await session.post("Debugger.evaluateOnCallFrame",{callFrameId:top.callFrameId,expression:workerData.expressions.entry,returnByValue:false,silent:true,throwOnSideEffect:true});const dispatch=await session.post("Debugger.evaluateOnCallFrame",{callFrameId:frames[6].callFrameId,expression:workerData.expressions.dispatch,returnByValue:false,silent:true,throwOnSideEffect:true});if(entry.exceptionDetails||dispatch.exceptionDetails)throw Error("frame");
const fields=await session.post("Runtime.getProperties",{objectId:entry.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});const packet=fields.result.find(row=>row.name==="1").value.objectId;rawPacket=await session.post("Runtime.getProperties",{objectId:packet,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});const message=rawPacket.result.find(row=>row.name==="message").value.objectId;rawMessage=await session.post("Runtime.getProperties",{objectId:message,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
const proof=await session.post("Runtime.callFunctionOn",{objectId:entry.result.objectId,functionDeclaration:workerData.programs.entry,arguments:[{objectId:original},{objectId:callees},{objectId:task},{objectId:handler},{objectId:dispatch.result.objectId},{value:"c".repeat(16)}],returnByValue:false,silent:true,throwOnSideEffect:true});if(proof.exceptionDetails||!proof.result.objectId)throw Error("proof");const same=await session.post("Runtime.callFunctionOn",{objectId:proof.result.objectId,functionDeclaration:workerData.programs.reprove,arguments:[],returnByValue:true,silent:true,throwOnSideEffect:true});if(same.exceptionDetails)throw Error("same");entryValid=same.result.value;
const calls=await session.post("Runtime.evaluate",{expression:"globalThis.__inverseHandlerCalls",returnByValue:true});if(calls.result.value!==0)throw Error("handler-ran-before-entry-proof");await session.post("Debugger.resume");
}else{const value=await session.post("Debugger.evaluateOnCallFrame",{callFrameId:top.callFrameId,expression:"[this===globalThis._MSG_BUS2_EXTAPI_,n.message.footprintUuid==='c'.repeat(16),r===n.message,s===n.replyTopic,a===globalThis.__inverseHandlerPromise,globalThis.__inverseHandlerCalls]",returnByValue:true,silent:true,throwOnSideEffect:true});if(value.exceptionDetails)throw Error("returned");afterValid=value.result.value;await session.post("Debugger.resume");reply.resolve();}})().catch(async error=>{try{await session.post("Debugger.resume")}catch{}reply.reject(error);});});
const pending=session.post("Runtime.callFunctionOn",{objectId:original,functionDeclaration:workerData.programs.invoke,arguments:[{objectId:callees},{value:"c".repeat(16)}],returnByValue:false,silent:true,throwOnSideEffect:false,awaitPromise:false});await reply.promise;const sdk=await pending;if(sdk.exceptionDetails||sdk.result.subtype!=="promise")throw Error("sdk-promise");for(const breakpointId of ids)await session.post("Debugger.removeBreakpoint",{breakpointId});await session.post("Runtime.evaluate",{expression:"globalThis.__inverseHandlerResolve(true)"});parentPort.postMessage({entryEvent,scriptId:compiled.scriptId,helperScript,breakpoint:ids[0],entryValid,afterValid,rawPacket,rawMessage});session.disconnect();parentPort.close();})().catch(error=>{parentPort.postMessage({error:String(error)});parentPort.close();});`;
void test("actual SDK reaches the exact original service entry before its handler and retains the distinct handler Promise", async context => {
  const source = await installed(context); if (source === null) { return; } assert.equal(process.versions.node, "24.18.0");
  const worker = new Worker(inspect, { eval: true, workerData: { source: inertSource(source), programs: P, expressions: E } });
  try {
    // oxlint-disable-next-line promise/avoid-new -- Worker events are the actual Inspector completion boundary.
    const result: unknown = await new Promise((resolve, reject) => { worker.once("error", reject); worker.once("message", resolve); worker.once("exit", code => { if (code !== 0) { reject(new Error("inert Inspector worker exited")); } }); });
    assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result));
    assert.ok("scriptId" in result && typeof result.scriptId === "string"); assert.ok("helperScript" in result && typeof result.helperScript === "string"); assert.ok("breakpoint" in result && typeof result.breakpoint === "string");
    assert.ok("entryEvent" in result && "entryValid" in result && "afterValid" in result && "rawPacket" in result && "rawMessage" in result); const data = result; const scriptId = data.scriptId; const helperScript = data.helperScript; const breakpoint = data.breakpoint; assert.ok(typeof scriptId === "string" && typeof helperScript === "string" && typeof breakpoint === "string");
    assert.equal(data.entryValid, true); assert.deepEqual(data.afterValid, [true, true, true, true, true, 1]);
    const pause = { method: "Debugger.paused", sessionId: "original-ui", params: data.entryEvent };
    assert.equal(typeof currentFootprintInversePublicCallPause(pause, "original-ui", scriptId, helperScript, breakpoint).entryFrame, "string");
    assert.throws(() => currentFootprintInversePublicCallPause(pause, "foreign-ui", scriptId, helperScript, breakpoint));
    const packet = currentFootprintInversePublicCallData(data.rawPacket, "packet", "c".repeat(16)); assert.equal(typeof packet.message, "string"); currentFootprintInversePublicCallData(data.rawMessage, "message", "c".repeat(16)); assert.throws(() => currentFootprintInversePublicCallData(data.rawMessage, "message", "d".repeat(16)));
  } finally { await worker.terminate(); for (const key of ["_EXTAPI_ROOT_", "_MSG_BUS2_EXTAPI_", "gVars", "__inverseTask", "__inverseHandler", "__inverseOriginal", "__inverseCallees", "__inverseHandlerPromise", "__inverseHandlerResolve", "__inverseHandlerCalls"]) { Reflect.deleteProperty(globalThis, key); } }
});
void test("entry proof refuses accessor packet fields without invoking them", () => {
  const context = createContext({}); runInContext(`globalThis.effects=0;const bus={uuid:"inert",rpcTicket:1,unsafe:true},lib={};globalThis._EXTAPI_ROOT_={lib_Footprint:lib};globalThis._MSG_BUS2_EXTAPI_=bus;globalThis.original=[_EXTAPI_ROOT_,lib,()=>{}, {extensionApiMessageBus2:bus},{},bus,()=>{},()=>true];globalThis.callees=Array(18).fill(()=>{});callees[17]=()=>true;const callback=()=>{},handler=()=>{},task=[{callback,unsafe:true,isRunning:true},callback,()=>true];const message={footprintUuid:"c".repeat(16),libraryUuid:"Project"},packet={message,replyTopic:"_MSG_BUS_RPC_-extensionApi.LIB_Footprint.delete-inert-0"};Object.defineProperty(packet,"message",{get(){effects++;throw Error("hook")},enumerable:true,configurable:true});globalThis.run=()=>(${P.entry}).call([bus,packet,"extensionApi.LIB_Footprint.delete",handler,callback],original,callees,task,[handler],[0,"inert"],"c".repeat(16));`, context);
  assert.throws(() => runInContext("run()", context)); assert.equal(runInContext("effects", context), 0);
});
void test("closed SDK-prefix vocabulary preserves all fixed bytes and offers no handler resume", () => {
  const cases = currentFootprintInversePublicCallCases(); assert.equal(cases.length, 13);
  for (const command of cases) { const row = currentFootprintInversePublicCallTemplate(command); let text = row.template;
    if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__inverse_call_program_${command.phase.slice(20)}__`), JSON.stringify(command.params.functionDeclaration)); }
    for (const name of row.names) { const value = name === "argument1" && command.phase === "inverse-public-call-sdk" || name === "argument5" ? "a".repeat(16) : "original_ref"; text = text.replace(JSON.stringify(`__inverse_call_${name}__`), JSON.stringify(value)); }
    assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
  }
  for (const phase of ["inverse-public-call-resume", "inverse-public-call-returned", "inverse-public-call-delete", "inverse-public-call-completed"]) { assert.throws(() => validateCurrentFootprintInversePublicCallCommand({ phase, method: "Debugger.resume", params: {} })); }
});
