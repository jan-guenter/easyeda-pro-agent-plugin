/* oxlint-disable import/max-dependencies -- This inert cursor regression joins the actual fixed programs, schemas, native rows and original source functions. */
import assert from "node:assert/strict";
import { CURRENT209_SYNTHETIC_WORKER_SOURCE, assertCurrent209PinnedSourceRows } from "./helpers/current209-source-excerpts.ts";
import { test } from "node:test";
import vm from "node:vm";
import { types } from "node:util";
import { currentGeneratedPeriodicSyncFrames } from "../src/current-generated-periodic-sync-replies.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as INITIAL_CALLEES } from "../src/current-generated-initial-sync-source.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS as INITIAL } from "../src/current-generated-initial-sync-programs.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_CALLEES as CALLEES, qualifyCurrentGeneratedPeriodicSyncSource } from "../src/current-generated-periodic-sync-source.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_PROGRAMS as PROGRAMS } from "../src/current-generated-periodic-sync-programs.ts";
import { CurrentGeneratedPeriodicSyncCursor } from "../src/current-generated-periodic-sync-cursor.ts";
import type { CurrentGeneratedPeriodicSyncHeld } from "../src/current-generated-periodic-sync-cursor.ts";
import { currentGeneratedPeriodicSyncNativeCases, validateCurrentGeneratedPeriodicSyncCommand } from "../src/current-generated-periodic-sync-protocol.ts";
import type { CurrentGeneratedPeriodicSyncCommand } from "../src/current-generated-periodic-sync-protocol.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";

const project = "b".repeat(64); const branch = "d".repeat(32); const history = "a".repeat(32);
const api = { id: 1, uuid: history, parent: null, key: "inert-private-key", is_lock: 0, num: 0, snapshot_num: 0, created_at: "2026-11-06", updated_at: "2026-11-06", lock_time: null, iv: history, dataStrUrl: `/api/v4/histories/dataStr?path=${project}&uuid=${history}` };
const head = [{ ...api, editHead: [{ ticket: 1 }], docs: [{ ["c".repeat(32)]: 0 }], docIds: [["c".repeat(32)]] }];
const row = { uuid: branch, delete_status: 0, name: "main", project_uuid: project, branch_uuid: branch, history_uuid: history, description: "", node: false, created_at: "2026-11-06 12:00:00", updated_at: "2026-11-06 12:00:00", parent_uuid: null, parent_name: null, creator_nickname: null, creator_uuid: null, modifier_nickname: null, default: true, project_histories_id: 1 };
function graph(): Readonly<{ run: (text: string) => unknown }> {
  const context = vm.createContext({});
  vm.runInContext([
    "let hooks=0,requests=0,branches=0,modelParses=0;function Cache(){};function CacheStorage(){};function Response(){};",
    'for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("cache invoked")},writable:true,enumerable:true,configurable:true});',
    'for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});',
    `const api=${JSON.stringify(api)},head=${JSON.stringify(head)},row=${JSON.stringify(row)};`, INITIAL_CALLEES.slice(7).map(value => value.source).join("\n"),
    'const Re={getInstance:()=>({projectHistory:{get:async()=>{requests++;return {success:true,result:[{...api}]};}},branch:{get:async()=>{branches++;return {success:true,result:{...row}};}}})};const du=()=>{modelParses++;throw Error("model parse forbidden")};',
    `const gd={${INITIAL_CALLEES.slice(0, 7).map(value => value.source).join(",")},${CALLEES[0]?.source},get isV2Format(){return this._isV2Format},set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)},get branchUuid(){return this._branchUuid},set branchUuid(t){this._branchUuid=t,this._projectDetails&&(this._projectDetails.currentBranch=t)}};for(const key of Object.keys(gd)){const d=Object.getOwnPropertyDescriptor(gd,key);Object.defineProperty(gd,key,{...d,enumerable:false});}`,
    `const lg=Object.create(gd);Object.defineProperty(lg,"checkProject",{value:({${CALLEES[1]?.source}}).checkProject,writable:true,enumerable:false,configurable:true});`,
    `const PROJECT=Object.assign(Object.create(lg),{uuid:"${project}",_branchUuid:"${branch}",historyIndex:head,task3:new Set,cachePromise:new Set,syncPendingNodeUuids:new Set,confirmedEmptyNodeUuids:new Set,warnedEmptyNodeUuids:new Set,isTemporary:false,isHistoryBack:false,_isV2Format:false,isUploadingCloud:false,pendingSyncCloud:false,isEstablished:false,projectTimer:1});globalThis.PROJECT=PROJECT;`,
    `const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());`,
    `const wrapper={cache:Object.create(Cache.prototype)},response=Object.create(Response.prototype),key="https://client/index/v1/${branch}";PROJECT.cache=wrapper;`,
    `const cacheEntry=[wrapper,key,response,undefined],cache=[cacheEntry,[],wrapper,wrapper.cache,response,intrinsics,key,head,"${project}","${branch}"];`,
    'const initialEntry=[PROJECT,api.uuid],module=[PROJECT,lg,gd,IA,hd,ag],initialCaller=[PROJECT,api.uuid];',
    `const initial=(${INITIAL.capture}).call(initialEntry,module,PROJECT,cache,initialCaller,key,${JSON.stringify(JSON.stringify(head))});`,
    'const entry=[PROJECT,undefined],caller=[PROJECT];let resolve;const task=new Promise(r=>resolve=r),full=[PROJECT,undefined,false,resolve,task];',
  ].join("\n"), context);
  return { run: (text): unknown => { const value: unknown = vm.runInContext(text, context); return value; } };
}
const arrayReply = (objectId: string, count: number): unknown => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId } });
function cursorFixture(): Readonly<{ cursor: CurrentGeneratedPeriodicSyncCursor; state: { requests: number; resumes: number; completed: number; failed: boolean; pending: boolean; ambiguous: boolean }; next: (role: CurrentGeneratedPeriodicSyncHeld["role"]) => object; run: (source: string) => unknown }> {
  const f = graph(), held = new WeakMap<object, CurrentGeneratedPeriodicSyncHeld>(), state = { requests: 0, resumes: 0, completed: 0, failed: false, pending: false, ambiguous: false };
  const properties = (variable: string, count: number): unknown => ({ result: [
    ...Array.from({ length: count }, (_, index) => {
      const value = f.run(`${variable}[${String(index)}]`); let remote: Record<string, unknown>;
      if (value !== null && (typeof value === "object" || typeof value === "function") && types.isProxy(value)) { remote = { type: "object", subtype: "proxy", className: "Object", description: "Proxy", objectId: `${variable}_${String(index)}` }; }
      else if (value === undefined) { remote = { type: "undefined" }; }
      else if (typeof value === "function") { remote = { type: "function", className: "Function", objectId: `${variable}_${String(index)}`, description: f.run(`Function.prototype.toString.call(${variable}[${String(index)}])`) }; }
      else if (value !== null && typeof value === "object") { remote = { type: "object", className: Array.isArray(value) ? "Array" : "Object", ...(Array.isArray(value) ? { subtype: "array" } : {}), objectId: `${variable}_${String(index)}`, ...(types.isPromise(value) ? { subtype: "promise", className: "Promise", description: "Promise" } : {}) }; }
      else { remote = { type: typeof value, value }; }
      return { name: String(index), value: remote, writable: true, configurable: true, enumerable: true, isOwn: true };
    }), { name: "length", value: { type: "number", value: count }, writable: true, configurable: false, enumerable: false, isOwn: true }
  ], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "original-array-prototype" } }] });
  const request = (command: CurrentGeneratedPeriodicSyncCommand): Promise<unknown> => {
    state.requests += 1;
    if (command.phase === "periodic-sync-caller") { return Promise.resolve(arrayReply("caller", 1)); }
    if (command.phase === "periodic-sync-capture-properties") { return Promise.resolve(properties("capture", 6)); }
    if (command.phase === "periodic-sync-full-properties") { return Promise.resolve(properties("full", 5)); }
    if (command.phase === "periodic-sync-branch-properties") { return Promise.resolve(properties("branchObjects", 2)); }
    if (command.phase === "periodic-sync-response-properties") { return Promise.resolve(properties("responseObjects", 3)); }
    if (command.phase === "periodic-sync-callee") {
      const profile = CALLEES[command.slot]; assert.ok(profile !== undefined);
      return Promise.resolve({ result: [{ name: "length", value: { type: "number", value: profile.arity }, writable: false, enumerable: false, configurable: true, isOwn: true }, { name: "name", value: { type: "string", value: profile.name }, writable: false, enumerable: false, configurable: true, isOwn: true }], internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original-script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
        { name: "[[Prototype]]", value: profile.async ? { type: "object", className: "AsyncFunction", description: "AsyncFunction", objectId: "original-async-parent" } : { type: "function", className: "Function", description: "function () { [native code] }", objectId: "original-function-parent" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[2]", objectId: "original-scopes" } }
      ] });
    }
    if (command.phase === "periodic-sync-settled") { return Promise.resolve({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "original-promise-parent" } }, { name: "[[PromiseState]]", value: { type: "string", value: state.pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }); }
    assert.equal(command.method, "Runtime.callFunctionOn"); assert.ok(command.method === "Runtime.callFunctionOn");
    const args = command.params.arguments.map(arg => "objectId" in arg ? arg.objectId : JSON.stringify(arg.value)).join(",");
    if (command.phase === "periodic-sync-capture") { f.run(`globalThis.capture=(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve(arrayReply("capture", 6)); }
    if (command.phase === "periodic-sync-branchObjects" || command.phase === "periodic-sync-responseObjects") { const name = command.phase === "periodic-sync-branchObjects" ? "branchObjects" : "responseObjects"; f.run(`globalThis.${name}=(${command.params.functionDeclaration}).call(${command.params.objectId})`); return Promise.resolve(arrayReply(name, name === "branchObjects" ? 2 : 3)); }
    if (command.phase === "periodic-sync-return-promise") { f.run(`globalThis.outerRetained=(${command.params.functionDeclaration}).call(${command.params.objectId})`); return Promise.resolve({ result: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "outerRetained" } }); }
    const value = f.run(`(${command.params.functionDeclaration}).call(${command.params.objectId},${args})`); return Promise.resolve({ result: { type: "boolean", value } });
  };
  const cursor = new CurrentGeneratedPeriodicSyncCursor(Object.freeze({ projectUuid: project, branchUuid: branch, historyUuid: history, body: JSON.stringify(row), importLocalOffsetMinutes: 0, nativeCurrentTimezoneVerified: false, writerClockAuthority: false, continuationAuthorized: false }), Object.freeze({ scriptId: "original-script", assertCurrent: (): Promise<void> => Promise.resolve(), originalCompletedCapture: (): string => "initial", requireHeld: (packet: object): CurrentGeneratedPeriodicSyncHeld => { const actual = held.get(packet); assert.ok(actual !== undefined); return actual; }, request,
    resume: (): Promise<void> => { state.resumes += 1; return state.ambiguous ? Promise.reject(new Error("unknown original ACK")) : Promise.resolve(); }, complete: (): Promise<void> => { state.completed += 1; return Promise.resolve(); }, fail: (): void => { state.failed = true; } }));
  return { cursor, state, run: f.run, next: role => {
    let variable = "entry";
    if (role === "syncFull") { f.run("PROJECT.notSyncCloud=true;PROJECT.pendingSyncCloud=false"); variable = "full"; }
    if (role === "syncLast") { f.run("PROJECT.task3.add(task);PROJECT.projectTimer=2;globalThis.branchFrame=[PROJECT,undefined,false,resolve,task,{success:true,result:{...row}}]"); variable = "branchFrame"; }
    if (role === "syncHistory") { f.run("globalThis.historyFrame=[PROJECT,api.uuid,false,resolve,task,head[0],undefined,{success:true,result:[{...api}]},1]"); variable = "historyFrame"; }
    if (role === "syncMerged") { f.run("globalThis.mergedFrame=[PROJECT,api.uuid,false,resolve,task,head[0],undefined,hd(historyFrame[7].result,head),0,false]"); variable = "mergedFrame"; }
    if (role === "syncFinalizing") { f.run("PROJECT.cachePromise.add(task);PROJECT.isSyncing=true;globalThis.resolvedFull=[PROJECT,api.uuid,false,resolve,task]"); variable = "resolvedFull"; }
    if (role === "syncReturned") { f.run("resolve();PROJECT.cachePromise.delete(task);PROJECT.task3.delete(task);PROJECT.notSyncCloud=false;PROJECT.isSyncing=false;globalThis.rawOuter=(async()=>{})()"); variable = "resolvedFull"; }
    const packet = Object.freeze({ profile: "inert-original-periodic-packet" }); held.set(packet, Object.freeze({ packet, role, joinedId: variable, callFrameId: "original-frame", callerFrameId: role === "syncEntry" ? "original-timer-caller" : null, returnPromiseId: role === "syncReturned" ? "rawOuter" : null })); return packet;
  } };
}
void test("actual periodic sync performs one branch and one history GET without parsing or cache effects", async () => {
  const f = graph(); await f.run("PROJECT.syncCloud()"); assert.equal(f.run("branches"), 1); assert.equal(f.run("requests"), 1); assert.equal(f.run("modelParses"), 0); assert.equal(f.run("hooks"), 0); assert.equal(f.run("PROJECT.task3.size"), 0);
});
void test("real periodic cursor joins seven original pauses and both Promise settlements, retaining rearmed timer semantics", async () => {
  const f = cursorFixture(); for (const role of ["syncEntry", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing"] as const) { await f.cursor.continue(f.next(role)); }
  f.state.pending = true; await f.cursor.continue(f.next("syncReturned")); assert.equal(f.state.resumes, 7); assert.equal(f.state.completed, 0); assert.throws(() => { f.cursor.requireIdle(); });
  assert.equal(f.cursor.startupProgress().active, true); assert.equal(f.cursor.startupProgress().canSettle, true);
  f.state.pending = false; await f.cursor.settle(); f.cursor.requireIdle(); assert.equal(f.cursor.startupProgress().completedCalls, 1); assert.equal(f.cursor.startupProgress().active, false); assert.equal(f.cursor.startupProgress().canSettle, false); assert.equal(f.state.completed, 1); assert.equal(f.state.requests, 21); assert.equal(f.run("hooks"), 0);
});
void test("changed full branch row or nested Proxy refuses before the original branch-head read and any history/model call", async () => {
  for (const mutation of ["branchFrame[5].result.history_uuid='foreign'", "branchFrame[5].result.updated_at='foreign'", "branchFrame[5].result.extra='foreign'", "Object.defineProperty(branchFrame[5].result,'history_uuid',{get(){hooks++;throw Error('getter')}})", "branchFrame[5].result=new Proxy(branchFrame[5].result,{get(target,key){hooks++;return Reflect.get(target,key)}})"]) {
    const f = cursorFixture(); await f.cursor.continue(f.next("syncEntry")); await f.cursor.continue(f.next("syncFull")); const packet = f.next("syncLast"); f.run(mutation); await assert.rejects(f.cursor.continue(packet)); assert.equal(f.state.resumes, 2); assert.equal(f.run("hooks"), 0); assert.equal(f.run("requests"), 0); assert.equal(f.run("modelParses"), 0);
  }
});
void test("changed history, foreign caller metadata and ambiguous native ACK never permit a replacement resume", async () => {
  const f = cursorFixture(); for (const role of ["syncEntry", "syncFull", "syncLast"] as const) { await f.cursor.continue(f.next(role)); } const packet = f.next("syncHistory"); f.run("historyFrame[7].result[0].num=1"); await assert.rejects(f.cursor.continue(packet)); assert.equal(f.state.resumes, 3); assert.equal(f.run("modelParses"), 0);
  const unknown = cursorFixture(); unknown.state.ambiguous = true; const entry = unknown.next("syncEntry"); await assert.rejects(unknown.cursor.continue(entry)); const count = unknown.state.requests; await assert.rejects(unknown.cursor.continue(entry)); assert.equal(unknown.state.requests, count); assert.equal(unknown.state.resumes, 1);
  const cases = currentGeneratedPeriodicSyncNativeCases(); assert.equal(cases.length, 26); for (const command of cases) { if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentGeneratedPeriodicSyncCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } })); } }
});
void test("retained periodic method hashes verify while incomplete worker source refuses", () => { assertCurrent209PinnedSourceRows(CALLEES);assertCurrent209PinnedSourceRows(INITIAL_CALLEES);assert.throws(()=>{qualifyCurrentGeneratedPeriodicSyncSource(CURRENT209_SYNTHETIC_WORKER_SOURCE);}); assert.ok(PROGRAMS.branch.includes("own(reply,\"success\")")); });

const point = (columnNumber: number): Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> => ({ scriptId: "original-script", lineNumber: 110, columnNumber });
void test("periodic entry accepts only its source-fixed timer caller and retains the original returned Promise", () => {
  const top = { callFrameId: "sync-frame", functionName: "syncCloud", location: point(17_676), functionLocation: point(17_658) };
  const caller = { callFrameId: "timer-frame", functionName: "", location: point(112_915), functionLocation: point(112_879) };
  const event = { method: "Debugger.paused", sessionId: "original-worker", params: { callFrames: [top, caller] } };
  assert.equal(currentGeneratedPeriodicSyncFrames(event, "syncEntry", "original-script").callerFrameId, "timer-frame");
  for (const changed of [{ ...caller, functionName: "open" }, { ...caller, location: point(112_914) }, { ...caller, functionLocation: point(112_880) }]) { assert.throws(() => currentGeneratedPeriodicSyncFrames({ ...event, params: { callFrames: [top, changed] } }, "syncEntry", "original-script")); }
  assert.throws(() => currentGeneratedPeriodicSyncFrames(event, "syncReturned", "original-script"));
});

void test("the unchanged-head native source does not inspect or replace an independent pending Via consistency record",async()=>{
  const f=graph();f.run('const pendingVia={id:"original-pending-via",ticket:17,uniqueId:"original-create"};PROJECT.consistencyManager={pendingVia};globalThis.originalPending=pendingVia;');
  await f.run("PROJECT.syncCloud()");assert.equal(f.run("PROJECT.consistencyManager.pendingVia===originalPending"),true);assert.equal(f.run("PROJECT.consistencyManager.pendingVia.ticket"),17);assert.equal(f.run("requests"),1);assert.equal(f.run("branches"),1);assert.equal(f.run("modelParses"),0);assert.equal(f.run("hooks"),0);
});
