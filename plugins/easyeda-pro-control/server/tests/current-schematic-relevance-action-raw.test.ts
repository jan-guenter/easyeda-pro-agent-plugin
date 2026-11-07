/** Original Node24 Inspector on an owned inert graph. No EasyEDA, action,
 * application getter, setter, cache or native owner is invoked. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { currentSchematicRelevanceDisplayModifyEntryNativeCases, validateCurrentSchematicRelevanceDisplayModifyEntryCommand } from "../src/current-schematic-relevance-display-modify-entry-protocol.ts";
import { CurrentSchematicRelevanceRawCursor } from "../src/current-schematic-relevance-action-raw-cursor.ts";

function graph(): unknown {
  const root = { children: [] as unknown[], invalidZIndexChildMap: new Map(), getterCalls: 0 }; const models = Array.from({ length: 8 }, () => ({ children: [] as unknown[] }));
  const first = models[0]; const second = models[1]; const third = models[2]; const fourth = models[3]; assert.ok(first !== undefined && second !== undefined && third !== undefined && fourth !== undefined);
  Object.assign(first, { _lines: new Set(), _netNames: new Set(), _customAttrMap: new Map(), _unConnectDotModels: new Set() });
  Object.assign(second, { _lines: new Set(), _netNames: new Set(), _customAttrMap: new Map() });
  Object.assign(third, { _points: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }); Object.assign(fourth, { _points: [{ x: 5, y: 6 }, { x: 7, y: 8 }] });
  for (const model of models.slice(4, 6)) { Object.assign(model, { connectionPointNode: { Wire: new Set(), Bus: new Set(), Pin: new Set(), BusEntry: new Set() } }); }
  root.children.push(...models); const netPointManager = { unConnectDotModels: new Set(), junctionModels: new Set(), netGroupLineUnConnectDotIdMap: {}, netGroupLineJunctionIdMap: {} };
  const before = { rootModel: root, tree: models.map(model => ({ model })), sourceMap: new Map() };
  const b = { page: {}, shapes: { netPointManager }, ids: {}, index: new Map(), consistency: { getSourceCode(): never { root.getterCalls += 1; throw new Error("inert encoder must stay uncalled"); } }, handler: { sourceCodeIdMap: new Map(), getSourceCodeIdMap(): never { root.getterCalls += 1; throw new Error("inert getter must stay uncalled"); } }, host: {}, metadata: {}, tab: {}, tabs: {}, manager: {}, ui: {}, sch: {}, runner: {} };
  const state = { owner: null as unknown, failed: false, modifyAttempted: true, modifyAcknowledged: false, saveAttempted: false, before }; const holder = [b, state]; state.owner = holder; return holder;
}
void test("raw commands are fixed and reserve one original attempt before an ambiguous reply", () => {
  const cursor = new CurrentSchematicRelevanceRawCursor("original-frame", "original-holder"); const command = cursor.next(); assert.ok(command !== null);
  assert.throws(() =>{  cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() => cursor.next()); assert.throws(() =>{  cursor.reserve(command); });
  cursor.fail(); assert.throws(() =>{  cursor.accept(command, {}); }); assert.throws(() => cursor.requireCompleted());
  for (const nativeCommand of currentSchematicRelevanceDisplayModifyEntryNativeCases()) { assert.deepEqual(validateCurrentSchematicRelevanceDisplayModifyEntryCommand(nativeCommand), nativeCommand); if (nativeCommand.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSchematicRelevanceDisplayModifyEntryCommand({ ...nativeCommand, params: { ...nativeCommand.params, functionDeclaration: "function(){return true;}" } })); } }
});
void test("actual paused Inspector qualifies and retains every original descriptor and native collection without getter execution", async context => {
  assert.equal(process.versions.node, "24.18.0"); const key = `__inertRawDisplay_${globalThis.crypto.randomUUID().replaceAll("-", "")}`; Object.defineProperty(globalThis, key, { value: graph(), configurable: true });
  const modulePath = fileURLToPath(new URL("../src/current-schematic-relevance-action-raw-cursor.ts", import.meta.url)), repliesPath = fileURLToPath(new URL("../src/current-schematic-relevance-action-raw-replies.ts", import.meta.url));
  const worker = new Worker(`const {parentPort}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const {CurrentSchematicRelevanceRawCursor}=await import(${JSON.stringify(modulePath)}),{currentSchematicRelevanceRawArray}=await import(${JSON.stringify(repliesPath)}),session=new Session();session.connectToMainThread();await session.post("Runtime.enable");await session.post("Debugger.enable");
const target=await session.post("Runtime.evaluate",{expression:${JSON.stringify(`globalThis[${JSON.stringify(key)}]`)},objectGroup:"inert-raw-display"});const point=await session.post("Debugger.setInstrumentationBreakpoint",{instrumentation:"beforeScriptExecution"});let done=false;
const timeout=setTimeout(()=>{if(!done){void session.post("Debugger.resume").catch(()=>{});parentPort.postMessage({error:"owned inert raw proof exceeded deadline"});session.disconnect();parentPort.close();}},15000);
session.on("Debugger.paused",event=>{void(async()=>{if(done)throw Error("unexpected second pause");done=true;await session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId});const cursor=new CurrentSchematicRelevanceRawCursor(event.params.callFrames[0].callFrameId,target.result.objectId);let count=0,last=null,snapshotCommand=null;
for(;;){const command=cursor.next();if(command===null)break;cursor.reserve(command);last=command;if(command.phase==="schematic-raw-snapshot")snapshotCommand=command;let reply;try{reply=await session.post(command.method,command.params);cursor.accept(command,reply);}catch(error){throw Error("request "+count+" "+command.phase+" "+String(error)+" "+JSON.stringify(reply));}count++;}
const value=cursor.requireCompleted();const changed=await session.post("Runtime.callFunctionOn",{objectId:value.referencesObjectId,functionDeclaration:'function(){Object.defineProperty(this[0],"unrelated",{value:1,configurable:true});}',returnByValue:true});const refused=await session.post(last.method,last.params);
await session.post("Runtime.callFunctionOn",{objectId:value.referencesObjectId,functionDeclaration:'function(){delete this[0].unrelated;Object.defineProperty(this[0],"danger",{get(){this.getterCalls++;return 7;},configurable:true});}',returnByValue:true});
const accessor=await session.post(snapshotCommand.method,snapshotCommand.params);await session.post("Runtime.callFunctionOn",{objectId:value.referencesObjectId,functionDeclaration:'function(){delete this[0].danger;}',returnByValue:true});
const proxy=await session.post("Runtime.callFunctionOn",{objectId:value.referencesObjectId,functionDeclaration:'function(){const root=this[0];return[new Proxy(root,{getOwnPropertyDescriptor(){root.getterCalls++;throw Error("inert trap");},getPrototypeOf(){root.getterCalls++;throw Error("inert trap");}})];}',returnByValue:false});
const proxyFields=await session.post("Runtime.getProperties",{objectId:proxy.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});let proxyRefused=false;try{currentSchematicRelevanceRawArray(proxyFields,1);}catch{proxyRefused=true;}
const getterCount=await session.post("Runtime.callFunctionOn",{objectId:value.referencesObjectId,functionDeclaration:'function(){return this[0].getterCalls;}',returnByValue:true});
await session.post("Debugger.resume");await session.post("Runtime.releaseObjectGroup",{objectGroup:"easyeda-pro-control-schematic-relevance-modify-entry-v1"});clearTimeout(timeout);parentPort.postMessage({count,value,changed:!!changed,refused:!!refused.exceptionDetails,accessorRefused:accessor.result.value==="SCH209_RAW_SNAPSHOT",proxyRefused,getterCalls:getterCount.result.value});session.disconnect();parentPort.close();})().catch(async error=>{clearTimeout(timeout);try{await session.post("Debugger.resume");}catch{}parentPort.postMessage({error:String(error)});session.disconnect();parentPort.close();});});parentPort.postMessage({ready:true});})().catch(error=>{parentPort.postMessage({error:String(error)});parentPort.close();});`, { eval: true });
  context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); }); const completed = Promise.withResolvers<unknown>(); worker.on("error", completed.reject);
  worker.on("message", (value: unknown): void => { if (value !== null && typeof value === "object" && "ready" in value && value.ready === true) { new Script("void 0;", { filename: "original-owned-raw-display.js" }).runInThisContext(); } else { completed.resolve(value); } });
  const value = await completed.promise; assert.ok(value !== null && typeof value === "object" && "count" in value && "value" in value && "refused" in value, JSON.stringify(value));
  assert.equal(value.count, 63); assert.equal(value.refused, true); assert.ok("accessorRefused" in value && "proxyRefused" in value && "getterCalls" in value); assert.equal(value.accessorRefused, true); assert.equal(value.proxyRefused, true); assert.equal(value.getterCalls, 0); assert.ok(value.value !== null && typeof value.value === "object" && "encoderInvoked" in value.value && "continuationAuthorized" in value.value); assert.equal(value.value.encoderInvoked, false); assert.equal(value.value.continuationAuthorized, false);
});
