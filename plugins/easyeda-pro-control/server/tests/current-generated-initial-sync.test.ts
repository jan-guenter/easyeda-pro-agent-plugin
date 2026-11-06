/* oxlint-disable import/max-dependencies -- Exercise the actual fixed programs, source metadata, cursor, native candidates and finite schemas together without application ownership. */
import { CurrentGeneratedInitialSyncCursor } from "../src/current-generated-initial-sync-cursor.ts";
import type { CurrentGeneratedInitialSyncHeld } from "../src/current-generated-initial-sync-cursor.ts";
import type { CurrentGeneratedInitialSyncCommand } from "../src/current-generated-initial-sync-protocol.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "../src/current-generated-initial-flow-cache-plan.ts";
import { types } from "node:util";
/** Actual pinned sync methods on an inert graph, plus fixed response guards.
 * No application, Cache API, native owner or original capability is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS as PROGRAMS } from "../src/current-generated-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "../src/current-generated-initial-sync-source.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";
import { currentGeneratedInitialSyncNativeCases, validateCurrentGeneratedInitialSyncCommand } from "../src/current-generated-initial-sync-protocol.ts";
import { decodeCurrentGeneratedInitialSyncCallee } from "../src/current-generated-initial-sync-replies.ts";

const api = { id: 1, uuid: "a".repeat(32), parent: null, key: "inert-private-key", is_lock: 0, num: 0, snapshot_num: 0, created_at: "2026-11-06", updated_at: "2026-11-06", lock_time: null, iv: "a".repeat(32), dataStrUrl: `/api/v4/histories/dataStr?path=${"b".repeat(64)}&uuid=${"a".repeat(32)}` };
const head = [{ ...api, editHead: [{ ticket: 1 }], docs: [{ ["c".repeat(32)]: 0 }], docIds: [["c".repeat(32)]] }];
function fixture(): Readonly<{ run: (source: string) => unknown; proof: (role: keyof typeof PROGRAMS, receiver: string, args: string) => unknown }> {
  const context = vm.createContext({ structuredClone });
  const declarations = CALLEES.slice(7).map(row => row.source).join("\n");
  const setup = [
    "let hooks=0,requests=0,modelParses=0;function Cache(){};function CacheStorage(){};function Response(){};",
    'for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("cache invoked")},writable:true,enumerable:true,configurable:true});',
    'for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});',
    `const api=${JSON.stringify(api)},head=${JSON.stringify(head)};`,
    declarations,
    "const Re={getInstance:()=>({projectHistory:{get:async()=>{requests++;return {success:true,result:[{...api}]};}}})};const du=()=>{modelParses++;throw Error('model parse forbidden')};",
    `const gd={${CALLEES.slice(0, 7).map(row => row.source).join(",")},get isV2Format(){return this._isV2Format},set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}};for(const key of Object.keys(gd)){const d=Object.getOwnPropertyDescriptor(gd,key);Object.defineProperty(gd,key,{...d,enumerable:false});}`,
    'const lg=Object.create(gd),PROJECT=Object.assign(Object.create(lg),{historyIndex:head,task3:new Set,cachePromise:new Set,syncPendingNodeUuids:new Set,confirmedEmptyNodeUuids:new Set,warnedEmptyNodeUuids:new Set,isTemporary:false,isHistoryBack:false,_isV2Format:false,isUploadingCloud:false,pendingSyncCloud:false});globalThis.PROJECT=PROJECT;',
    `const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());`,
    `const wrapper={cache:Object.create(Cache.prototype)},response=Object.create(Response.prototype),key="https://client/index/v1/${"d".repeat(32)}";PROJECT.cache=wrapper;`,
    `const initial=[wrapper,key,response,undefined],cache=[initial,[],wrapper,wrapper.cache,response,intrinsics,key,head,"${  "b".repeat(64)  }","${  "d".repeat(32)  }"];`,
    'const entry=[PROJECT,api.uuid],module=[PROJECT,lg,gd,IA,hd,ag],caller=[PROJECT,api.uuid];',
    `const original=(${PROGRAMS.capture}).call(entry,module,PROJECT,cache,caller,key,${JSON.stringify(JSON.stringify(head))});`,
    'let resolve;const task=new Promise(r=>resolve=r),full=[PROJECT,api.uuid,true,resolve,task];',
  ];
  vm.runInContext(setup.join("\n"), context);
  return { run: (source: string): unknown => { const value: unknown = vm.runInContext(source, context); return value; }, proof: (role, receiver, args): unknown => { const value: unknown = vm.runInContext(`(${PROGRAMS[role]}).call(${receiver},${args})`, context); return value; } };
}
void test("actual pinned same-head sync performs four GETs with no model parse, cache write or residual task", async () => {
  const f = fixture(); const promise = f.run("PROJECT.syncCloud(api.uuid)"); await promise;
  assert.equal(f.run("requests"), 4); assert.equal(f.run("modelParses"), 0); assert.equal(f.run("hooks"), 0);
  assert.equal(f.run("PROJECT.task3.size"), 0); assert.equal(f.run("PROJECT.cachePromise.size"), 0); assert.equal(f.run("PROJECT.historyIndex===head"), true);
});
void test("four original responses and exact merge/task finalizers pass; changed head is held before model parsing", () => {
  const f = fixture(); f.run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false"); assert.equal(f.proof("full", "full", "original"), true);
  f.run("PROJECT.task3.add(task);");
  for (const ordinal of [1, 2, 3, 4]) {
    f.run(`globalThis.historyFrame=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,{success:true,result:[{...api}]},${String(ordinal)}]`);
    assert.equal(f.proof("history", "historyFrame", `original,full,${String(ordinal)}`), true);
  }
  f.run("const rows=hd(historyFrame[7].result,head);globalThis.mergedFrame=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,rows,0,false]");
  assert.equal(f.proof("merged", "mergedFrame", "original,full,historyFrame"), true);
  f.run("PROJECT.cachePromise.add(task);PROJECT.isSyncing=true");
  assert.equal(f.proof("finalizing", "full", "original,full"), true);
  f.run("resolve();PROJECT.cachePromise.delete(task);PROJECT.task3.delete(task);PROJECT.notSyncCloud=false;PROJECT.isSyncing=false");
  assert.equal(f.proof("returned", "full", "original,full"), true);
  for (const mutation of ["historyFrame[7].result[0].uuid='foreign'", "historyFrame[7].result[0].num=1", "historyFrame[7].result[0].snapshot='foreign'", "Object.defineProperty(historyFrame[7].result[0],'key',{get(){hooks++;throw Error('getter')}})"]) {
    const other = fixture(); other.run("PROJECT.notSyncCloud=true;PROJECT.task3.add(task);globalThis.historyFrame=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,{success:true,result:[{...api}]},1]"); other.run(mutation);
    assert.throws(() => other.proof("history", "historyFrame", "original,full,1")); assert.equal(other.run("modelParses"), 0); assert.equal(other.run("hooks"), 0);
  }
});
void test("original module/prototype/collection/task/ordinal drift refuses without invoking application replacements", () => {
  for (const mutation of ["PROJECT.getHistories=async()=>{hooks++;}", "module[3]=async function IA(e,t,s){hooks++;}", "PROJECT.task3=new Set", "Object.defineProperty(Object.prototype,'snapshot',{get(){hooks++;}})", "Promise.prototype.then=function(){hooks++;}"]) {
    const f = fixture(); f.run("PROJECT.notSyncCloud=true"); f.run(mutation);
    assert.throws(() => f.proof("full", "full", "original")); assert.equal(f.run("hooks"), 0);
  }
  const f = fixture(); f.run("PROJECT.notSyncCloud=true;PROJECT.task3.add(task);globalThis.historyFrame=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,{success:true,result:[{...api}]},2]");
  assert.throws(() => f.proof("history", "historyFrame", "original,full,1"));
});
void test("fixed metadata and vocabulary require actual current209 script/functions and exact response ordinal", () => {
  const cases = currentGeneratedInitialSyncNativeCases(); assert.equal(cases.length, 35);
  for (const command of cases) { if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentGeneratedInitialSyncCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } })); } }
  const historyCase = cases.find(command => command.phase === "initial-sync-history"); assert.ok(historyCase?.phase === "initial-sync-history"); assert.throws(() => validateCurrentGeneratedInitialSyncCommand({ ...historyCase, ordinal: 2 }));
  for (const [slot, profile] of CALLEES.entries()) {
    const fields = [
      { name: "length", value: { type: "number", value: profile.arity }, writable: false, enumerable: false, configurable: true, isOwn: true },
      { name: "name", value: { type: "string", value: profile.name }, writable: false, enumerable: false, configurable: true, isOwn: true },
    ];
    const parsed: unknown = { result: profile.regular ? [...fields, { name: "prototype", value: { type: "object", className: "Object", objectId: "original-prototype" }, writable: true, enumerable: false, configurable: false, isOwn: true }] : fields,
      internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original-script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
        { name: "[[Prototype]]", value: profile.async ? { type: "object", className: "AsyncFunction", description: "AsyncFunction", objectId: "original-async-parent" } : { type: "function", className: "Function", description: "function () { [native code] }", objectId: "original-function-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[2]", objectId: "original-scopes" } }] };
    decodeCurrentGeneratedInitialSyncCallee(parsed, slot, "original-script"); assert.throws(() =>{  decodeCurrentGeneratedInitialSyncCallee(parsed, slot, "foreign-script"); });
  }
});

/** The original-worker registry and CDP packets have an explicit inert seam.
 * The real cursor and fixed proof programs execute unchanged. */
const arrayReply = (objectId: string, count: number): unknown => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId } });
function cursorFixture(): Readonly<{ cursor: CurrentGeneratedInitialSyncCursor; state: { requests: number; resumes: number; pending: boolean; completed: number; failed: boolean; ambiguous: boolean }; next: (role: CurrentGeneratedInitialSyncHeld["role"], ordinal?: number) => object; run: (source: string) => unknown }> {
  const f = fixture(), held = new WeakMap<object, CurrentGeneratedInitialSyncHeld>();
  const state = { requests: 0, resumes: 0, pending: false, completed: 0, failed: false, ambiguous: false };
  const properties = (variable: string, count: number): unknown => ({ result: [
    ...Array.from({ length: count }, (_, index) => {
      const value = f.run(`${variable}[${String(index)}]`); let remote: Record<string, unknown>;
      if (value === undefined) { remote = { type: "undefined" }; }
      else if (typeof value === "function") { remote = { type: "function", className: "Function", objectId: `${variable}_${String(index)}`, description: f.run(`Function.prototype.toString.call(${variable}[${String(index)}])`) }; }
      else if (value !== null && typeof value === "object") { remote = { type: "object", objectId: `${variable}_${String(index)}`, ...(types.isPromise(value) ? { subtype: "promise", className: "Promise", description: "Promise" } : {}) }; }
      else { remote = { type: typeof value, value }; }
      return { name: String(index), value: remote, writable: true, configurable: true, enumerable: true, isOwn: true };
    }),
    { name: "length", value: { type: "number", value: count }, writable: true, configurable: false, enumerable: false, isOwn: true }
  ], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "original-array-prototype" } }] });
  const data: CurrentGeneratedInitialFlowCacheData = Object.freeze({ projectUuid: "b".repeat(64), branchUuid: "d".repeat(32), historyUuid: api.uuid, namespace: `project_${"b".repeat(64)}_v6`,
    initialSourceSha256: "0".repeat(64), initialLogicalSha256: "0".repeat(64), projectionSourceSha256: "0".repeat(64), documents: [], headIndex: { url: `https://client/index/v1/${"d".repeat(32)}`, body: JSON.stringify(head), sha256: "0".repeat(64) },
    nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false });

  const request = (command: CurrentGeneratedInitialSyncCommand): Promise<unknown> => {
    state.requests += 1;
    if (command.phase === "initial-sync-module" || command.phase === "initial-sync-caller") { return Promise.resolve(arrayReply(command.phase === "initial-sync-module" ? "module" : "caller", command.phase === "initial-sync-module" ? 6 : 2)); }
    if (command.phase === "initial-sync-capture-properties") { return Promise.resolve(properties("cursorOriginal", 16)); }
    if (command.phase === "initial-sync-full-properties") { return Promise.resolve(properties("full", 5)); }
    if (command.phase === "initial-sync-callee") {
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
    if (command.phase === "initial-sync-settled") { return Promise.resolve({ result: [], internalProperties: [
      { name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "original-promise-prototype" } },
      { name: "[[PromiseState]]", value: { type: "string", value: state.pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }
    ] }); }
    assert.equal(command.method, "Runtime.callFunctionOn"); assert.ok(command.method === "Runtime.callFunctionOn");
    const args = command.params.arguments.map(arg => "objectId" in arg ? arg.objectId : JSON.stringify(arg.value)).join(",");
    if (command.phase === "initial-sync-capture") { f.run(`globalThis.cursorOriginal=(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve(arrayReply("cursorOriginal", 16)); }
    if (command.phase === "initial-sync-return-promise") { f.run(`globalThis.outerRetained=(${command.params.functionDeclaration}).call(${command.params.objectId})`); return Promise.resolve({ result: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "outerRetained" } }); }
    const value = f.run(`(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve({ result: { type: "boolean", value } });
  };
  const cursor = new CurrentGeneratedInitialSyncCursor(data, Object.freeze({ scriptId: "original-script", projectId: "PROJECT", assertCurrent: (): Promise<void> => Promise.resolve(),
    requireHeld: (packet: object): CurrentGeneratedInitialSyncHeld => { const original = held.get(packet); assert.ok(original !== undefined); return original; }, headEntry: (): string => "cache", request,
    resume: (_original: CurrentGeneratedInitialSyncHeld, command: CurrentGeneratedInitialSyncCommand): Promise<void> => { assert.equal(command.method, "Debugger.resume"); state.resumes += 1; if (state.ambiguous) { return Promise.reject(new Error("unknown original ACK")); } return Promise.resolve(); },
    complete: (): Promise<void> => { state.completed += 1; return Promise.resolve(); }, fail: (): void => { state.failed = true; }
  }));
  return { cursor, state, run: f.run, next: (role, ordinal = 1): object => {
    let variable = "entry";
    if (role === "syncFull") { f.run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false"); variable = "full"; }
    else if (role === "syncHistory") { f.run(`PROJECT.task3.add(task);globalThis.history${String(ordinal)}=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,{success:true,result:[{...api}]},${String(ordinal)}]`); variable = `history${String(ordinal)}`; }
    else if (role === "syncMerged") { f.run("globalThis.mergedFrame=[PROJECT,api.uuid,true,resolve,task,head[0],undefined,hd(history4[7].result,head),0,false]"); variable = "mergedFrame"; }
    else if (role === "syncFinalizing") { f.run("PROJECT.cachePromise.add(task);PROJECT.isSyncing=true"); variable = "full"; }
    else if (role === "syncReturned") { f.run("resolve();PROJECT.cachePromise.delete(task);PROJECT.task3.delete(task);PROJECT.notSyncCloud=false;PROJECT.isSyncing=false;globalThis.rawOuter=(async()=>{})()"); variable = "full"; }
    const marker = Object.freeze({ profile: "inert-original-held" }); held.set(marker, Object.freeze({ packet: marker, role, joinedId: variable, callFrameId: "original-entry-frame", callerFrameId: role === "syncEntry" ? "original-open-frame" : null, returnPromiseId: role === "syncReturned" ? "rawOuter" : null })); return marker;
  } };
}
void test("real sync cursor consumes all nine source calls and waits for both actual metadata settlements", async () => {
  const f = cursorFixture();
  for (const role of ["syncEntry", "syncFull"] as const) { await f.cursor.continue(f.next(role)); }
  for (const ordinal of [1, 2, 3, 4]) { await f.cursor.continue(f.next("syncHistory", ordinal)); }
  for (const role of ["syncMerged", "syncFinalizing"] as const) { await f.cursor.continue(f.next(role)); }
  f.state.pending = true; await f.cursor.continue(f.next("syncReturned")); assert.equal(f.state.requests, 26); assert.equal(f.state.resumes, 9); assert.equal(f.state.completed, 0); assert.throws(() => { f.cursor.requireCompleted(); });
  f.state.pending = false; await f.cursor.settle(); f.cursor.requireCompleted(); assert.equal(f.state.requests, 28); assert.equal(f.state.completed, 1); assert.equal(f.run("hooks"), 0);
});
void test("cursor refuses changed history before that response resume; unknown original ACK burns the source attempt", async () => {
  const changed = cursorFixture(); await changed.cursor.continue(changed.next("syncEntry")); await changed.cursor.continue(changed.next("syncFull"));
  const packet = changed.next("syncHistory"); changed.run("history1[7].result[0].num=1"); await assert.rejects(changed.cursor.continue(packet)); assert.equal(changed.state.resumes, 2); assert.equal(changed.state.failed, true); assert.equal(changed.run("modelParses"), 0);
  const unknown = cursorFixture(); unknown.state.ambiguous = true; const entry = unknown.next("syncEntry"); await assert.rejects(unknown.cursor.continue(entry), /unknown original ACK/u); const count = unknown.state.requests;
  await assert.rejects(unknown.cursor.continue(entry)); assert.equal(unknown.state.requests, count); assert.equal(unknown.state.resumes, 1); assert.equal(unknown.state.completed, 0);
});
