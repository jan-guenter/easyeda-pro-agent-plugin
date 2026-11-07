/* oxlint-disable import/max-dependencies -- The inert source cursor regression joins its finite codebook and exact source/data leaves. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { types } from "node:util";
import vm from "node:vm";
import { CurrentPcbViaPostHistorySyncCursor } from "../src/current-pcb-via-post-history-sync-cursor.ts";
import type { CurrentPcbViaPostHistorySyncHeld } from "../src/current-pcb-via-post-history-sync-cursor.ts";
import { compareCurrentPcbViaLiveHistoryCacheData } from "../src/current-pcb-via-live-history-cache-data.ts";
import { currentPcbViaPostHistorySyncNativeCases, validateCurrentPcbViaPostHistorySyncCommand } from "../src/current-pcb-via-post-history-sync-protocol.ts";
import type { CurrentPcbViaPostHistorySyncCommand } from "../src/current-pcb-via-post-history-sync-protocol.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES as CALLEES, CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER, qualifyCurrentPcbViaPostHistorySyncSource } from "../src/current-pcb-via-post-history-sync-source.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as INITIAL } from "../src/current-generated-initial-sync-source.ts";
import { currentPcbViaPostHistorySyncFrames } from "../src/current-pcb-via-post-history-sync-replies.ts";
import { viaLiveHistoryCacheInput } from "./helpers/via-live-history-cache-data.ts";

function fixture(mode: "append" | "mutable"): Readonly<{ cursor: CurrentPcbViaPostHistorySyncCursor; next: (role: CurrentPcbViaPostHistorySyncHeld["role"]) => object; run: (text: string) => unknown; state: { resumes: number; late: number; replay: number; completed: number; failed: boolean; pending: boolean; unknown: boolean; replace: boolean } }> {
  const input = viaLiveHistoryCacheInput(mode); const live = compareCurrentPcbViaLiveHistoryCacheData(input); const context = vm.createContext({});
  const run = (text: string): unknown => vm.runInContext(text, context) as unknown;
  run(`let traps=0;const old=${input.initial.headIndex.body},api=${JSON.stringify(live.historyApiRows)},finalIndex=${live.headIndex.body},branch=${live.branch.body};
${INITIAL.slice(7).map(row => row.source).join("\n")};${CALLEES.slice(0,9).map(row => row.source).join("\n")};
const gd={${[...INITIAL.slice(0,7),...CALLEES.slice(9)].map(row=>row.source).join(",")},get branchUuid(){return this._branchUuid},set branchUuid(t){this._branchUuid=t},get isV2Format(){return this._isV2Format}};
for(const k of Reflect.ownKeys(gd)){const d=Object.getOwnPropertyDescriptor(gd,k);Object.defineProperty(gd,k,{...d,enumerable:false});}const lg=Object.create(gd);
const PROJECT=Object.assign(Object.create(lg),{uuid:${JSON.stringify(input.projectUuid)},_branchUuid:${JSON.stringify(input.branchUuid)},historyIndex:old,cache:{},localCache:{},consistencyManager:{},isTemporary:false,isHistoryBack:false,_isV2Format:false,isUploadingCloud:false,notSyncCloud:false,isSyncing:false,pendingSyncCloud:true,isApplyShot:true,task3:new Set,cachePromise:new Set,syncPendingNodeUuids:new Set,confirmedEmptyNodeUuids:new Set,warnedEmptyNodeUuids:new Set});globalThis.PROJECT=PROJECT;
const initial=[PROJECT,[PROJECT,lg,gd],null,null,old,()=>true,null,null,null,null,null,null,null,null,null,null];
const rI=["SYMBOL","FOOTPRINT","BLOB","FONT","PANEL_LIB","DEVICE","BOARD","INSTANCE","CONFIG","VARIANT","COMPONENT_GROUP","COMPONENT_GROUP_DATA"],module=[du,mg,fc,Us,Uo,ou,Na,Ro,Gu,rI],caller=[PROJECT],entry=[PROJECT,undefined];let resolve;const task=new Promise(r=>resolve=r),full=[PROJECT,undefined,false,resolve,task];`);
  const objects = new Map<string, unknown>(); let ids = 0;
  const remote = (value: unknown): Record<string, unknown> => {
    if (value === undefined) { return { type: "undefined" }; } if (value === null) { return { type: "object", subtype: "null", value: null }; }
    if (typeof value !== "object" && typeof value !== "function") { return { type: typeof value, value }; }
    let objectId: string | undefined; for (const [id, original] of objects) { if (original === value) { objectId = id; break; } } if (objectId === undefined) { ids += 1; objectId = `object_${String(ids)}`; objects.set(objectId, value); }
    if (types.isProxy(value)) { return { type: "object", subtype: "proxy", className: "Object", objectId }; }
    // oxlint-disable-next-line typescript/unbound-method -- Inspector descriptions apply this exact builtin with the original function as receiver.
    if (typeof value === "function") { return { type: "function", className: "Function", objectId, description: Reflect.apply(Function.prototype.toString, value, []) }; }
    if (types.isPromise(value)) { return { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId }; }
    return { type: "object", ...(Array.isArray(value) ? { subtype: "array" } : {}), className: Array.isArray(value) ? "Array" : "Object", ...(Array.isArray(value) ? { description: `Array(${String(value.length)})` } : {}), objectId };
  };
  const props = (id: string): unknown => { const value = objects.get(id); assert.ok(value !== null && (typeof value === "object" || typeof value === "function")); assert.equal(types.isProxy(value),false); return { result: Reflect.ownKeys(value).map(key=>{assert.ok(typeof key === "string");const d=Object.getOwnPropertyDescriptor(value,key);assert.ok(d!==undefined);const row:Record<string,unknown>={name:key,writable:d.writable,enumerable:d.enumerable,configurable:d.configurable,isOwn:true};if("value"in d){row["value"]=remote(d.value);}else{row["get"]=remote(Reflect.get(d,"get") as unknown);row["set"]=remote(Reflect.get(d,"set") as unknown);}return row;}),internalProperties:[{name:"[[Prototype]]",value:remote(Object.getPrototypeOf(value) as unknown)}]}; };
  const held = new WeakMap<object,CurrentPcbViaPostHistorySyncHeld>(), state={resumes:0,late:0,replay:0,completed:0,failed:false,pending:false,unknown:false,replace:false};
  const request = async (command:CurrentPcbViaPostHistorySyncCommand):Promise<unknown> => {
    // Exercise the original host reproof after a real transport-style await.
    await Promise.resolve();
    if(command.phase==="via-post-sync-frame"){return{result:remote(run(command.role))};}
    if(command.phase==="via-post-sync-replay"){state.replay+=1;return{result:{type:"boolean",value:true}};}
    if(command.phase==="via-post-sync-properties"){
      if(command.role==="task"||command.role==="outer"){return{result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"Promise",description:"Promise",objectId:"original_promise_proto"}},{name:"[[PromiseState]]",value:{type:"string",value:state.pending?"pending":"fulfilled"}},{name:"[[PromiseResult]]",value:{type:"undefined"}}]};}
      if(command.role==="callee"){const p=CALLEES[command.slot];assert.ok(p!==undefined);return{result:[{name:"length",value:{type:"number",value:p.arity},writable:false,enumerable:false,configurable:true,isOwn:true},{name:"name",value:{type:"string",value:p.name},writable:false,enumerable:false,configurable:true,isOwn:true},...(p.regular?[{name:"prototype",value:{type:"object",className:"Object",objectId:"original_function_prototype"},writable:true,enumerable:false,configurable:false,isOwn:true}]:[])],internalProperties:[{name:"[[FunctionLocation]]",value:{type:"object",subtype:"internal#location",value:{scriptId:"original_script",lineNumber:p.lineNumber,columnNumber:p.columnNumber}}},{name:"[[Prototype]]",value:p.async?{type:"object",className:"AsyncFunction",description:"AsyncFunction",objectId:"async_proto"}:{type:"function",className:"Function",description:"function () { [native code] }",objectId:"function_proto"}},{name:"[[Scopes]]",value:{type:"object",subtype:"internal#scopeList",description:"Scopes[2]",objectId:"original_scopes"}}]};}
      return props(command.params.objectId);
    }
    assert.equal(command.phase,"via-post-sync-call");assert.ok(command.phase==="via-post-sync-call");
    if(state.replace&&command.role==="history"){run("historyFrame[7].result=new Proxy(historyFrame[7].result,{getOwnPropertyDescriptor(){traps++;throw Error('trap')}})");}
    const receiver=objects.get(command.params.objectId);const args=command.params.arguments.map(arg=>"objectId"in arg?objects.get(arg.objectId):arg.value);const fn:unknown=run(`(${command.params.functionDeclaration})`);assert.ok(typeof fn==="function");return{result:remote(Reflect.apply(fn,receiver,args) as unknown)};
  };
  const initialRemote=remote(run("initial"));assert.ok(typeof initialRemote["objectId"]==="string");const initialId=initialRemote["objectId"];
  const cursor=new CurrentPcbViaPostHistorySyncCursor(Object.freeze({projectUuid:input.projectUuid,branchUuid:input.branchUuid,documentUuid:input.documentUuid,historyUuid:live.historyUuid,mode,historyNum:live.historyNum,initialHeadIndexBody:input.initial.headIndex.body,branchBody:live.branch.body,historyBodySha256:live.historyBodySha256,actualHistoryRowsVerified:false,workerContinuationAuthorized:false}),Object.freeze({scriptId:"original_script",originalInitialCapture:()=>initialId,assertCurrent:():Promise<void>=>Promise.resolve(),requireHeld:(packet:object):CurrentPcbViaPostHistorySyncHeld=>{const item=held.get(packet);assert.ok(item!==undefined);return item;},liveData:()=>{state.late+=1;assert.equal(state.resumes,3);return Promise.resolve(live);},request,resume:():Promise<void>=>{state.resumes+=1;return state.unknown?Promise.reject(new Error("lost original ACK")):Promise.resolve();},complete:():Promise<void>=>{state.completed+=1;return Promise.resolve();},fail:():void=>{state.failed=true;}}));
  return{cursor,run,state,next:role=>{
    let variable="entry";
    if(role==="syncFull"){run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false");variable="full";}
    if(role==="syncLast"){run("PROJECT.task3.add(task);globalThis.branchFrame=[PROJECT,undefined,false,resolve,task,{success:true,result:{...branch}}]");variable="branchFrame";}
    if(role==="syncHistory"){run(`globalThis.historyFrame=[PROJECT,${JSON.stringify(live.historyUuid)},false,resolve,task,old[0],undefined,{success:true,result:api},1]`);variable="historyFrame";}
    if(role==="syncMerged"){run(`globalThis.merged=[PROJECT,${JSON.stringify(live.historyUuid)},false,resolve,task,old[0],undefined,hd(api,old),${mode==="append"?1:-1},false]`);variable="merged";}
    if(role==="syncFinalizing"){run(`PROJECT.historyIndex=finalIndex;PROJECT.cachePromise.add(task);PROJECT.isSyncing=true;PROJECT.isApplyShot=false;globalThis.resolved=[PROJECT,${JSON.stringify(live.historyUuid)},false,resolve,task]`);variable="resolved";}
    if(role==="syncReturned"){run("resolve();PROJECT.task3.delete(task);PROJECT.cachePromise.delete(task);PROJECT.notSyncCloud=false;PROJECT.isSyncing=false;globalThis.outer=(async()=>{})()");variable="resolved";}
    const value=remote(run(variable));assert.ok(typeof value["objectId"]==="string");const packet=Object.freeze({});const outer=role==="syncReturned"?remote(run("outer"))["objectId"]:null;assert.ok(outer===null||typeof outer==="string");held.set(packet,Object.freeze({packet,role,joinedId:value["objectId"],callFrameId:"original_frame",callerFrameId:role==="syncEntry"?"original_caller":null,returnPromiseId:outer}));return packet;
  }};
}
void test("mutable and appended sync bind actual rows only after the original GET, then join index/task/outer settlement",async()=>{
  for(const mode of ["mutable","append"] as const){const f=fixture(mode);for(const role of ["syncEntry","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing"] as const){await f.cursor.continue(f.next(role));}f.state.pending=true;await f.cursor.continue(f.next("syncReturned"));assert.equal(f.state.late,1);assert.equal(f.state.replay,1);assert.equal(f.state.completed,0);assert.equal(f.cursor.progress().canSettle,true);f.state.pending=false;await f.cursor.settle();f.cursor.requireCompleted();assert.equal(f.state.completed,1);assert.equal(f.state.resumes,7);assert.equal(f.cursor.progress().completeUploadFrontierVerified,false);}
});
void test("changed response metadata, replaced original row pointer and Proxy index cannot resume model/finalizer work",async()=>{
  for(const drift of ["historyFrame[7].result[0].updated_at='foreign'","historyFrame[7].result[0]=new Proxy(historyFrame[7].result[0],{getOwnPropertyDescriptor(){traps++;throw Error('trap')}})"]){const f=fixture("append");for(const role of ["syncEntry","syncFull","syncLast"] as const){await f.cursor.continue(f.next(role));}const packet=f.next("syncHistory");f.run(drift);await assert.rejects(f.cursor.continue(packet));assert.equal(f.state.resumes,3);assert.equal(f.state.replay,0);assert.equal(f.run("traps"),0);}
  const f=fixture("mutable");for(const role of ["syncEntry","syncFull","syncLast"] as const){await f.cursor.continue(f.next(role));}f.state.replace=true;await assert.rejects(f.cursor.continue(f.next("syncHistory")));assert.equal(f.run("traps"),0);assert.equal(f.state.resumes,3);
  const g=fixture("append");for(const role of ["syncEntry","syncFull","syncLast","syncHistory","syncMerged"] as const){await g.cursor.continue(g.next(role));}const final=g.next("syncFinalizing");g.run("PROJECT.historyIndex=new Proxy(PROJECT.historyIndex,{getOwnPropertyDescriptor(){traps++;throw Error('trap')}})");await assert.rejects(g.cursor.continue(final));assert.equal(g.state.resumes,5);assert.equal(g.run("traps"),0);
});
void test("unknown original resume ACK consumes the cursor and finite replay selectors reject substitution",async()=>{
  const f=fixture("append");f.state.unknown=true;const packet=f.next("syncEntry");await assert.rejects(f.cursor.continue(packet));await assert.rejects(f.cursor.continue(packet));assert.equal(f.state.resumes,1);assert.equal(f.state.failed,true);
  const cases=currentPcbViaPostHistorySyncNativeCases();for(const command of cases){if(command.phase==="via-post-sync-call"){assert.throws(()=>validateCurrentPcbViaPostHistorySyncCommand({...command,params:{...command.params,functionDeclaration:"function(){return true}"}}));}if(command.phase==="via-post-sync-replay"){assert.throws(()=>validateCurrentPcbViaPostHistorySyncCommand({...command,params:{objectId:"caller_handle"}}));}}
});
const point=(columnNumber:number):Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>=>({scriptId:"original_script",lineNumber:110,columnNumber});
void test("source qualification and exact upload-finally caller refuse the startup/periodic caller",async()=>{
  qualifyCurrentPcbViaPostHistorySyncSource(await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js","utf8"));const top={callFrameId:"sync",functionName:"syncCloud",location:point(17_676),functionLocation:point(17_658)};const caller={callFrameId:"cloud",functionName:"uploadCloud",location:point(CALLER.columnNumber),functionLocation:point(CALLER.functionColumnNumber)};const event={method:"Debugger.paused",sessionId:"worker",params:{callFrames:[top,caller]}};assert.equal(currentPcbViaPostHistorySyncFrames(event,"syncEntry","original_script").callerFrameId,"cloud");assert.throws(()=>currentPcbViaPostHistorySyncFrames({...event,params:{callFrames:[top,{...caller,functionName:"checkProject"}]}},"syncEntry","original_script"));
});
