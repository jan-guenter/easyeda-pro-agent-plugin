/* oxlint-disable import/max-dependencies -- Actual pinned parser/sync/metadata and the original-row cursor seam must be checked together without issuing a native capability. */
/** Actual pinned parser/sync/hd on an inert saved multi-head graph. No native
 * owner, API request, cache effect or continuation authority is issued. */
import assert from "node:assert/strict";
import { types } from "node:util";
import { CurrentFootprintInverseInitialSyncCursor } from "../src/current-footprint-inverse-initial-sync-cursor.ts";
import type { CurrentFootprintInverseInitialSyncHeld } from "../src/current-footprint-inverse-initial-sync-cursor.ts";
import type { CurrentFootprintInverseInitialSyncCommand } from "../src/current-footprint-inverse-initial-sync-protocol.ts";
import { test } from "node:test";
import vm from "node:vm";
import { currentFootprintInverseInitialSyncNativeFrame, currentFootprintInverseInitialSyncTemplates, currentFootprintInverseInitialSyncWire } from "../src/current-footprint-inverse-initial-sync-wire.ts";
import { decodeCurrentFootprintInverseInitialSyncCapture } from "../src/current-footprint-inverse-initial-sync-replies.ts";
import { sha256Text } from "../src/core.ts";
import { deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseInitialSyncData } from "../src/current-footprint-inverse-initial-sync-data.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_GUARD_DESCRIPTION as GUARD, CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "../src/current-generated-initial-sync-source.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";
import { currentFootprintInverseInitialSyncNativeCases, currentFootprintInverseInitialSyncNativeCommands, validateCurrentFootprintInverseInitialSyncCommand } from "../src/current-footprint-inverse-initial-sync-protocol.ts";

const line = (type: string, value: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(value)}|\n`;
const make = (uuid: string, ordinal: number): string => line("EDIT_HEAD", { uuid: "actor" }) + line("DOCHEAD", { uuid, docType: "FOOTPRINT", client: "native" }, { ticket: ordinal * 2 + 1 }) + line("META", { title: `Footprint ${String(ordinal)}` }, { id: "META", ticket: ordinal * 2 + 2 });
function source(): ReturnType<typeof deriveCurrentFootprintInverseInitialSyncData> {
  const first = "a".repeat(32), second = "b".repeat(32);

  const chunks = [[first, 0], [first, 1], [second, 0]].map(([uuid, ordinal]) => { assert.ok(typeof uuid === "string" && typeof ordinal === "number"); const plaintext = make(uuid, ordinal); return { historyUuid: uuid, ordinal, plaintext, plaintextSha256: sha256Text(plaintext) }; });
  const input = { projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), headHistoryUuid: first, heads: [{ id: 2, uuid: first, parent: second, key: "e".repeat(32), is_lock: 0, num: 1, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }, { id: 1, uuid: second, parent: null, key: "f".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }], chunks };
  return deriveCurrentFootprintInverseInitialSyncData(input, deriveCurrentFootprintSavedFlowCacheData(input));
}
function fixture(): Readonly<{ run: (text: string) => unknown; proof: (name: keyof typeof PROGRAMS, receiver: string, args: string) => unknown }> {
  const context = vm.createContext({ structuredClone }), data = source();
  const setup = [
    "let hooks=0,requests=0,modelParses=0;function Cache(){};function CacheStorage(){};function Response(){};",
    'for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("cache invoked")},writable:true,enumerable:true,configurable:true});',
    'for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});',
    `const head=${data.headIndex.body};const api=head.map(row=>Object.fromEntries(Object.entries(row).filter(([key])=>!["docs","editHead","docIds"].includes(key))));`,
    CALLEES.slice(7).map(row => row.source).join("\n"),
    "const Re={getInstance:()=>({projectHistory:{get:async()=>{requests++;return {success:true,result:api.map(row=>({...row}))};}}})};const du=()=>{modelParses++;throw Error('model parse forbidden')};",
    `const gd={${CALLEES.slice(0, 7).map(row => row.source).join(",")},get isV2Format(){return this._isV2Format},set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)},get branchUuid(){return this._branchUuid},set branchUuid(t){this._branchUuid=t,this._projectDetails&&(this._projectDetails.currentBranch=t)}};for(const key of Object.keys(gd)){const d=Object.getOwnPropertyDescriptor(gd,key);Object.defineProperty(gd,key,{...d,enumerable:false});}`,
    'const lg=Object.create(gd),PROJECT=Object.assign(Object.create(lg),{uuid:"c".repeat(64),_branchUuid:"d".repeat(32),historyIndex:head,task3:new Set,cachePromise:new Set,syncPendingNodeUuids:new Set,confirmedEmptyNodeUuids:new Set,warnedEmptyNodeUuids:new Set,isTemporary:false,isHistoryBack:false,_isV2Format:false,isUploadingCloud:false,pendingSyncCloud:false});globalThis.PROJECT=PROJECT;',
    `const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());`,
    'const wrapper={cache:Object.create(Cache.prototype)},response=Object.create(Response.prototype),key="https://client/index/v1/"+"d".repeat(32);PROJECT.cache=wrapper;',
    'const initial=[wrapper,key,response,undefined],cache=[initial,[],wrapper,wrapper.cache,response,intrinsics,key,head,"c".repeat(64),"d".repeat(32)],entry=[PROJECT,api[0].uuid],module=[PROJECT,lg,gd,IA,hd,ag],caller=[PROJECT,api[0].uuid];',
    `const original=(${PROGRAMS.capture}).call(entry,module,PROJECT,cache,caller,key,${JSON.stringify(data.headIndex.body)},${Object.values(data.cache.headLimits).join(",")},${String(data.headCount)});`,
    'let resolve;const task=new Promise(r=>resolve=r),full=[PROJECT,api[0].uuid,true,resolve,task];',
  ];
  vm.runInContext(setup.join("\n"), context);
  return { run: (text: string): unknown => vm.runInContext(text, context) as unknown, proof: (name, receiver, args): unknown => vm.runInContext(`(${PROGRAMS[name]}).call(${receiver},${args})`, context) as unknown };
}
void test("saved mutable multi-head same-index sync performs exactly four inert reads and no parse/cache effects", async () => {
  const data = source(); assert.equal(data.headCount, 2); assert.equal(data.baseline.rows[0]?.num, 1); assert.ok(data.baselineObjects > 8);
  const f = fixture(); await f.run("PROJECT.syncCloud(api[0].uuid)"); assert.equal(f.run("requests"), 4); assert.equal(f.run("modelParses"), 0); assert.equal(f.run("hooks"), 0); assert.equal(f.run("PROJECT.historyIndex===head&&PROJECT.task3.size===0&&PROJECT.cachePromise.size===0"), true);
});
void test("all saved response rows and original hd reference projection qualify; peer changes refuse before effects", () => {
  const f = fixture(); f.run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false;PROJECT.task3.add(task);");
  for (const ordinal of [1, 2, 3, 4]) { f.run(`globalThis.historyFrame=[PROJECT,api[0].uuid,true,resolve,task,head[0],head[1],{success:true,result:api.map(row=>({...row}))},${String(ordinal)}]`); assert.equal(f.proof("history", "historyFrame", `original,full,${String(ordinal)}`), true); }
  f.run("const rows=hd(historyFrame[7].result,head);globalThis.mergedFrame=[PROJECT,api[0].uuid,true,resolve,task,head[0],head[1],rows,0,false]"); assert.equal(f.proof("merged", "mergedFrame", "original,full,historyFrame"), true);
  for (const change of ["historyFrame[7].result[1].key='foreign'", "historyFrame[7].result[1].num=2", "historyFrame[7].result.pop()", "Object.defineProperty(historyFrame[7].result[1],'uuid',{get(){hooks++;throw Error('getter')}})"]) { const other = fixture(); other.run("PROJECT.notSyncCloud=true;PROJECT.task3.add(task);globalThis.historyFrame=[PROJECT,api[0].uuid,true,resolve,task,head[0],head[1],{success:true,result:api.map(row=>({...row}))},1]"); other.run(change); assert.throws(() => other.proof("history", "historyFrame", "original,full,1")); assert.equal(other.run("hooks+modelParses"), 0); }
  const commands = currentFootprintInverseInitialSyncNativeCases(); assert.equal(commands.length, 45); for (const command of commands) { if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentFootprintInverseInitialSyncCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } })); } }
});

const arrayReply = (objectId: string, count: number): unknown => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId } });
function cursorFixture(): Readonly<{ cursor: CurrentFootprintInverseInitialSyncCursor; state: { requests: number; resumes: number; pending: boolean; completed: number; failed: boolean; ambiguous: boolean }; next: (role: CurrentFootprintInverseInitialSyncHeld["role"], ordinal?: number) => object; run: (source: string) => unknown }> {
  const f = fixture(), held = new WeakMap<object, CurrentFootprintInverseInitialSyncHeld>();
  const state = { requests: 0, resumes: 0, pending: false, completed: 0, failed: false, ambiguous: false };
  const properties = (variable: string, count: number): unknown => ({ result: [
    ...Array.from({ length: count }, (_, index) => {
      const value = f.run(`${variable}[${String(index)}]`); let remote: Record<string, unknown>;
      if ((typeof value === "object" && value !== null || typeof value === "function") && types.isProxy(value)) { remote = { type: "object", subtype: "proxy", className: "Object", description: "Proxy", objectId: `${variable}_${String(index)}` }; }
      else if (value === undefined) { remote = { type: "undefined" }; }
      else if (typeof value === "function") { remote = { type: "function", className: "Function", objectId: `${variable}_${String(index)}`, description: f.run(`Function.prototype.toString.call(${variable}[${String(index)}])`) }; }
      else if (value !== null && typeof value === "object") { remote = { type: "object", className: Array.isArray(value) ? "Array" : "Object", ...(Array.isArray(value) ? { subtype: "array" } : {}), objectId: `${variable}_${String(index)}`, ...(types.isPromise(value) ? { subtype: "promise", className: "Promise", description: "Promise" } : {}) }; }
      else { remote = { type: typeof value, value }; }
      return { name: String(index), value: remote, writable: true, configurable: true, enumerable: true, isOwn: true };
    }),
    { name: "length", value: { type: "number", value: count }, writable: true, configurable: false, enumerable: false, isOwn: true }
  ], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "original-array-prototype" } }] });
  const arms:number[]=[],data=source();const receipts=Array.from({length:4},()=>Object.freeze({...data.baseline}));const received=new Set<number>();
  const request = (command: CurrentFootprintInverseInitialSyncCommand): Promise<unknown> => {
    state.requests += 1;
    if (command.phase === "inverse-initial-sync-module" || command.phase === "inverse-initial-sync-caller") { return Promise.resolve(arrayReply(command.phase === "inverse-initial-sync-module" ? "module" : "caller", command.phase === "inverse-initial-sync-module" ? 6 : 2)); }
    if (command.phase === "inverse-initial-sync-capture-properties") { return Promise.resolve(properties("cursorOriginal", 16)); }
    if (command.phase === "inverse-initial-sync-baseline-object-properties") { return Promise.resolve(properties("baselineObjects", data.baselineObjects)); }
    if (command.phase === "inverse-initial-sync-response-object-properties") { return Promise.resolve(properties(`responseObjects${String(command.ordinal)}`, 2+data.headCount)); }
    if (command.phase === "inverse-initial-sync-full-properties") { return Promise.resolve(properties("full", 5)); }
    if (command.phase === "inverse-initial-sync-callee") {
      const profile = CALLEES[command.slot]; assert.ok(profile !== undefined);
      return Promise.resolve({ result: [
        { name: "length", value: { type: "number", value: profile.arity }, writable: false, enumerable: false, configurable: true, isOwn: true },
        { name: "name", value: { type: "string", value: profile.name }, writable: false, enumerable: false, configurable: true, isOwn: true },
        ...(profile.regular ? [{ name: "prototype", value: { type: "object", className: "Object", objectId: "original-prototype" }, writable: true, enumerable: false, configurable: false, isOwn: true }] : [])
      ], internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original-script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
        { name: "[[Prototype]]", value: profile.async ? { type: "object", className: "AsyncFunction", description: "AsyncFunction", objectId: "original-async-parent" } : { type: "function", className: "Function", description: "function () { [native code] }", objectId: "original-function-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[2]", objectId: "original-scopes" } }
      ] });
    }
    if (command.phase === "inverse-initial-sync-settled") { return Promise.resolve({ result: [], internalProperties: [
      { name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "original-promise-prototype" } },
      { name: "[[PromiseState]]", value: { type: "string", value: state.pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }
    ] }); }
    assert.equal(command.method, "Runtime.callFunctionOn"); assert.ok(command.method === "Runtime.callFunctionOn");
    const args = command.params.arguments.map(arg => "objectId" in arg ? arg.objectId : JSON.stringify(arg.value)).join(",");
    if (command.phase === "inverse-initial-sync-capture") { f.run(`globalThis.cursorOriginal=(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve(arrayReply("cursorOriginal", 16)); }
    if (command.phase === "inverse-initial-sync-baseline-objects") { f.run(`globalThis.baselineObjects=(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve(arrayReply("baselineObjects", data.baselineObjects)); }
    if (command.phase === "inverse-initial-sync-response-objects") { const name = `responseObjects${String(command.ordinal)}`; f.run(`globalThis.${name}=(${command.params.functionDeclaration}).call(${command.params.objectId})`); return Promise.resolve(arrayReply(name, 2+data.headCount)); }
    if (command.phase === "inverse-initial-sync-return-promise") { f.run(`globalThis.outerRetained=(${command.params.functionDeclaration}).call(${command.params.objectId})`); return Promise.resolve({ result: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "outerRetained" } }); }
    const value = f.run(`(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve({ result: { type: "boolean", value } });
  };
  const cursor = new CurrentFootprintInverseInitialSyncCursor(data, Object.freeze({ scriptId: "original-script", projectId: "PROJECT", assertCurrent: (): Promise<void> => Promise.resolve(),
    requireHeld: (packet: object): CurrentFootprintInverseInitialSyncHeld => { const original = held.get(packet); assert.ok(original !== undefined); return original; }, headEntry: (): string => "cache", request,
    resume: (_original: CurrentFootprintInverseInitialSyncHeld, command: CurrentFootprintInverseInitialSyncCommand): Promise<void> => { assert.equal(command.method, "Debugger.resume"); state.resumes += 1; if (state.ambiguous) { return Promise.reject(new Error("unknown original ACK")); } return Promise.resolve(); },
    armHistory:(ordinal:1|2|3|4):Promise<void>=>{assert.equal(ordinal,arms.length+1);assert.equal(state.resumes,[0,2,3,4][ordinal-1]);arms.push(ordinal);return Promise.resolve();},
    waitHistory:(ordinal:1|2|3|4):Promise<typeof data.baseline>=>{assert.ok(arms.includes(ordinal));received.add(ordinal);const actual=receipts[ordinal-1];assert.ok(actual!==undefined);return Promise.resolve(actual);},
    requireHistory:(ordinal:1|2|3|4):typeof data.baseline=>{assert.ok(received.has(ordinal));const actual=receipts[ordinal-1];assert.ok(actual!==undefined);return state.ambiguous?Object.freeze({...actual}):actual;},
    complete: (): Promise<void> => { state.completed += 1; return Promise.resolve(); }, fail: (): void => { state.failed = true; }
  }));
  return { cursor, state, run: f.run, next: (role, ordinal = 1): object => {
    let variable = "entry";
    if (role === "syncFull") { f.run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false"); variable = "full"; }
    else if (role === "syncHistory") { f.run(`PROJECT.task3.add(task);globalThis.history${String(ordinal)}=[PROJECT,api[0].uuid,true,resolve,task,head[0],head[1],{success:true,result:api.map(row=>({...row}))},${String(ordinal)}]`); variable = `history${String(ordinal)}`; }
    else if (role === "syncMerged") { f.run("globalThis.mergedFrame=[PROJECT,api[0].uuid,true,resolve,task,head[0],head[1],hd(history4[7].result,head),0,false]"); variable = "mergedFrame"; }
    else if (role === "syncFinalizing") { f.run("PROJECT.cachePromise.add(task);PROJECT.isSyncing=true"); variable = "full"; }
    else if (role === "syncReturned") { f.run("resolve();PROJECT.cachePromise.delete(task);PROJECT.task3.delete(task);PROJECT.notSyncCloud=false;PROJECT.isSyncing=false;globalThis.rawOuter=(async()=>{})()"); variable = "full"; }
    const marker = Object.freeze({ profile: "inert-original-held" }); held.set(marker, Object.freeze({ packet: marker, role, joinedId: variable, callFrameId: "original-entry-frame", callerFrameId: role === "syncEntry" ? "original-open-frame" : null, returnPromiseId: role === "syncReturned" ? "rawOuter" : null })); return marker;
  } };
}
void test("original inverse cursor joins four Main receipts at their held worker responses before each resume",async()=>{
 const f=cursorFixture();for(const role of ["syncEntry","syncFull"]as const){await f.cursor.continue(f.next(role));}for(const ordinal of[1,2,3,4]){await f.cursor.continue(f.next("syncHistory",ordinal));}for(const role of["syncMerged","syncFinalizing","syncReturned"]as const){await f.cursor.continue(f.next(role));}f.cursor.requireCompleted();assert.equal(f.state.completed,1);assert.equal(f.state.resumes,9);assert.equal(f.run("hooks+modelParses"),0);
});
void test("a replaced original Main receipt refuses at the actual response before its resume",async()=>{
 const f=cursorFixture();await f.cursor.continue(f.next("syncEntry"));await f.cursor.continue(f.next("syncFull"));const packet=f.next("syncHistory");f.state.ambiguous=true;await assert.rejects(f.cursor.continue(packet));assert.equal(f.state.resumes,2);assert.equal(f.state.failed,true);assert.equal(f.state.completed,0);assert.equal(f.run("hooks+modelParses"),0);
});

void test("inverse-only exact long guard admission and finite native tables preserve the older decoder bound",()=>{
 assert.ok(GUARD.length>8192&&GUARD.length<=16_384);
 const result=Array.from({length:17},(_,index)=>({name:String(index),value:{type:"function",description:index===5?`${GUARD} `:"",objectId:"synthetic"}}));assert.throws(()=>decodeCurrentFootprintInverseInitialSyncCapture({result,internalProperties:[{}]}));
 const commands=currentFootprintInverseInitialSyncNativeCommands(),templates=currentFootprintInverseInitialSyncTemplates();assert.equal(templates.filter(row=>row.phase.startsWith("inverse-initial-sync-")).length,46);assert.equal(templates.length,59);
 for(const command of commands){const wire=currentFootprintInverseInitialSyncWire(command,79,"original");const frame=currentFootprintInverseInitialSyncNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`),command,"original");assert.equal(frame["action"],"footprint-inverse-initial-sync");}
});
