/** Actual fixed service-to-F2 source boundary, with no lookup RPC executed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE as S } from "../src/current-footprint-inverse-public-service-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE as L } from "../src/current-footprint-inverse-public-lookup-source.ts";
import { currentFootprintInverseLookupPreentryCases, currentFootprintInverseLookupPreentryNativeFrame, currentFootprintInverseLookupPreentryTemplate, currentFootprintInverseLookupPreentryWire, validateCurrentFootprintInverseLookupPreentryCommand } from "../src/current-footprint-inverse-lookup-preentry-protocol.ts";
import { currentFootprintInverseLookupEntryPause } from "../src/current-footprint-inverse-lookup-preentry-replies.ts";
import { currentInverseLookupGraphSources } from "./fixtures/current-footprint-inverse-public-lookup-graph.ts";

function overlay(source: string, pieces: readonly Readonly<{ start: number; end: number; prefix: string; suffix: string }>[], intro: string, tail: string): string {
  let output = intro + source.replaceAll(/[^\r\n]/gu, " ").slice(intro.length);
  for (const piece of pieces) { output = output.slice(0, piece.start - piece.prefix.length) + piece.prefix + source.slice(piece.start, piece.end) + piece.suffix + output.slice(piece.end + piece.suffix.length); }
  return output + tail;
}
const inspector = String.raw`
const {parentPort,workerData}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const session=new Session;session.connectToMainThread();await session.post("Debugger.enable");await session.post("Runtime.enable");
const compile=async(text,name)=>{const c=await session.post("Runtime.compileScript",{expression:text,sourceURL:name,persistScript:true});if(!c.scriptId)throw Error("compile");const r=await session.post("Runtime.runScript",{scriptId:c.scriptId});if(r.exceptionDetails)throw Error("run:"+r.exceptionDetails.text);return c.scriptId;};const ui=await compile(workerData.ui,"inert-original-lookup-ui.js"),api=await compile(workerData.api,"inert-original-service-api.js");
const f=await session.post("Runtime.evaluate",{expression:"globalThis.preentryF2.getFootprint"});if(!f.result.objectId)throw Error("function");const arm=await session.post("Debugger.setBreakpointOnFunctionCall",{objectId:f.result.objectId,condition:""});const service=await session.post("Debugger.setBreakpoint",{location:{scriptId:api,lineNumber:1,columnNumber:99832},condition:""});
const completed=Promise.withResolvers();let first=true,entryEvent;session.on("Debugger.paused",event=>{void(async()=>{if(first){first=false;if(event.params.hitBreakpoints[0]!==service.breakpointId)throw Error("service");await session.post("Debugger.resume");return;}entryEvent=event.params;const top=event.params.callFrames[0];const read=await session.post("Debugger.evaluateOnCallFrame",{callFrameId:top.callFrameId,expression:"[this===globalThis.preentryF2,t,globalThis.preentryRpcCalls]",returnByValue:true,silent:true,throwOnSideEffect:true});if(read.exceptionDetails)throw Error("entry");if(read.result.value[0]!==true||read.result.value[2]!==0)throw Error("rpc-escaped");completed.resolve(read.result.value);})().catch(completed.reject);});
const call=session.post("Runtime.evaluate",{expression:"globalThis.preentryService.call({pull(){},publish(){}}, {message:{footprintUuid:'c'.repeat(16),libraryUuid:'Project'},replyTopic:'original-reply'})",awaitPromise:false});void call.catch(()=>{});const value=await completed.promise;await session.post("Debugger.resume");await call;await session.post("Debugger.disable");parentPort.postMessage({value,entryEvent,ui,api,breakpoint:arm.breakpointId});session.disconnect();parentPort.close();})().catch(error=>parentPort.postMessage({error:String(error),stack:error.stack}));`;
void test("original service advance stops at F2 before its first statement and before any lookup RPC", async context => {
  let api: string, ui: string;
  try { ({ ui } = await currentInverseLookupGraphSources()); api = await readFile("/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/pro-api/0.3.59.1ca9efb5/api.js", "utf8"); } catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
  const uiSource = overlay(ui, [{ ...L.projectGet, prefix: "F2={", suffix: "};" }, { ...L.facadeGet, prefix: "Ze=class{", suffix: "};" }, { ...L.lookup, prefix: ";", suffix: ";" }, { ...S.publicUiDelete, prefix: "M8=class{", suffix: "};" }], '(()=>{let F2,Ze,M8;const w={currentProject:{projectId:"a".repeat(64)}},Wo={SystematicUuid:"system"},h4={getInstance:()=>({hasLib:()=>false})},Lo={messageBus:{rpcCall(){globalThis.preentryRpcCalls++;return new Promise(()=>{})}}},$e={FOOTPRINT:{GET:"/PrjDB/footprint/getData"}};', ';globalThis.preentryF2=F2;globalThis.preentryHandler=M8.delete;globalThis.preentryRpcCalls=0;})()');
  const apiSource = overlay(api, [{ ...S.rpcServiceCallback, prefix: "const i=", suffix: ";" }], '(()=>{"use strict";const e="extensionApi.LIB_Footprint.delete",t=globalThis.preentryHandler;', ';globalThis.preentryService=i;})()');
  const worker = new Worker(inspector, { eval: true, workerData: { ui: uiSource, api: apiSource } });
  try {
    // oxlint-disable-next-line promise/avoid-new -- The independent Inspector worker owns the actual paused-thread reply.
    const result: unknown = await new Promise((resolve, reject) => { worker.once("error", reject); worker.once("message", resolve); });
    assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result)); assert.ok("value" in result && "entryEvent" in result); assert.deepEqual(result.value, [true, { isProject: true, path: "a".repeat(64), uuid: "c".repeat(16) }, 0]);
    const event = result.entryEvent; assert.ok(event !== null && typeof event === "object" && "callFrames" in event && Array.isArray(event.callFrames));
    assert.ok("ui" in result && typeof result.ui === "string" && "api" in result && typeof result.api === "string" && "breakpoint" in result && typeof result.breakpoint === "string");
    const uiId = result.ui; const apiId = result.api; const breakpoint = result.breakpoint;
    const packet = { method: "Debugger.paused", sessionId: "original-ui", params: event };
    assert.equal(typeof currentFootprintInverseLookupEntryPause(packet, "original-ui", uiId, apiId, breakpoint), "string");
    assert.throws(() => currentFootprintInverseLookupEntryPause(packet, "foreign", uiId, apiId, breakpoint));
    const shifted = structuredClone(packet); const shiftedFrames = shifted.params.callFrames; assert.ok(Array.isArray(shiftedFrames)); const top: unknown = shiftedFrames[0]; assert.ok(top !== null && typeof top === "object" && "location" in top && top.location !== null && typeof top.location === "object"); Reflect.set(top.location, "columnNumber", 113_059);
    assert.throws(() => currentFootprintInverseLookupEntryPause(shifted, "original-ui", uiId, apiId, breakpoint));
  } finally { await worker.terminate(); for (const key of ["preentryF2", "preentryHandler", "preentryRpcCalls", "preentryService"]) { Reflect.deleteProperty(globalThis, key); } }
});

void test("pre-entry wire is exact and refuses arbitrary code, getters and later lookup/delete resumes", () => {
  const cases = currentFootprintInverseLookupPreentryCases(); assert.equal(cases.length, 26);
  for (const command of cases) { const row = currentFootprintInverseLookupPreentryTemplate(command); let text = row.template; if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__lookup_preentry_program_${command.role}__`), JSON.stringify(command.params.functionDeclaration)); }
    for (const name of row.names) { let value = "original_ref"; if (name === "projectUuid") { value = "a".repeat(64); } else if (name === "branchUuid") { value = "b".repeat(32); } else if (name === "documentUuid") { value = "c".repeat(32); } text = text.replace(JSON.stringify(`__lookup_preentry_${name}__`), JSON.stringify(value)); }
    assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params }); const bytes = Buffer.from(`${JSON.stringify(currentFootprintInverseLookupPreentryWire(command, 79, "original_ui"))}\0`); assert.equal(currentFootprintInverseLookupPreentryNativeFrame(bytes, command, "original_ui")["action"], "footprint-inverse-lookup-preentry"); assert.throws(() => currentFootprintInverseLookupPreentryNativeFrame(bytes, command, "foreign_ui"));
  }
  const call = cases.find(command => command.method === "Runtime.callFunctionOn"); assert.ok(call !== undefined); assert.throws(() => validateCurrentFootprintInverseLookupPreentryCommand({ ...call, params: { ...call.params, functionDeclaration: "function(){return true;}" } }));
  for (const phase of ["inverse-lookup-rpc-resume", "inverse-lookup-row", "inverse-delete-resume", "inverse-public-call-completion"]) { assert.throws(() => validateCurrentFootprintInverseLookupPreentryCommand({ phase, method: "Debugger.resume", params: {} })); }
  let effects = 0; const hostile = {}; Object.defineProperty(hostile, "phase", { get(): string { effects += 1; throw new Error("getter"); }, enumerable: true }); assert.throws(() => validateCurrentFootprintInverseLookupPreentryCommand(hostile)); assert.equal(effects, 0);
});
