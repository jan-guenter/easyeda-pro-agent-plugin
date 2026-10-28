/** Synthetic owner/descriptor observations plus pinned asynchronous bodies.
 * No app connection, native writer, Save or closed-generation proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_ASYNC_CALLS as CALLS, decodeCurrentFootprintCopyAsyncArray, decodeCurrentFootprintCopyAsyncFunction } from "../src/current-footprint-copy-async-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES as PROFILES } from "../src/current-footprint-copy-async-profiles.ts";
import { CurrentFootprintCopyAsyncRunner, currentFootprintCopyAsyncObservationSchema } from "../src/current-footprint-copy-async-runner.ts";
import type { CurrentFootprintCopyAsyncSnapshot } from "../src/current-footprint-copy-async-runner.ts";
import { CURRENT_FOOTPRINT_COPY_BUFFERED_STREAM_FIXTURE as BUFFER, CURRENT_FOOTPRINT_COPY_ASYNC_FIXTURE as SOURCES, CURRENT_FOOTPRINT_COPY_AWAIT_UPLOAD_END_FIXTURE as WAIT } from "./helpers/current-footprint-copy-async-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_FIXTURE as DEPENDENCIES } from "./helpers/current-footprint-copy-dependency-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
const empty: CurrentFootprintCopyAsyncSnapshot = Object.freeze({ timerPending: false, bufferedPromiseRetained: false, task1: 0, task2: 0, task3: 0,
  cachePromises: 0, bufferedUploads: 0, bufferedUploadCaches: 0, uploading: false, batchUploading: false, pendingSync: false });
const yes = { result: { type: "boolean", value: true } };
function arrayReply(upload: boolean): Data {
  const count = upload ? 3 : 4, start = upload ? 4 : 0;
  const result = PROFILES.slice(start, start + count).map((entry, index) => property(String(index), {
    type: "function", className: entry.async ? "AsyncFunction" : "Function", description: SOURCES[index + start], objectId: `function-${String(index + start)}`,
  }, true, true));
  if (!upload) {
    for (const [index, className] of ["Array", "Array", "Set", "Set", "Set", "Set", "Map", "Map", "Cache", "Cache"].entries()) {
      const value: Data = { type: "object", className, objectId: `original-${String(index)}` };
      if (className !== "Cache") { value["subtype"] = className.toLowerCase(); }
      result.push(property(String(index + 4), value, true, true));
    }
  }
  result.push(property("length", { type: "number", value: upload ? 3 : 14 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-parent" } }] };
}
function metadata(index: number): Data {
  const profile = PROFILES[index]; assert.ok(profile);
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (profile.kind === "function" && !profile.async) { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, true, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", objectId: "parent" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[3]", objectId: `scopes-${String(index)}` } },
  ] };
}
function owner(): { runner: CurrentFootprintCopyAsyncRunner; calls: string[]; state: { current: boolean; loseAfter: number; changeSnapshot: boolean; sampleCount: number } } {
  const calls: string[] = [], state = { current: true, loseAfter: 0, changeSnapshot: false, sampleCount: 0 };
  function reply(label: string, value: unknown): Promise<unknown> { calls.push(label); if (calls.length === state.loseAfter) { state.current = false; } return Promise.resolve(value); }
  const runner = new CurrentFootprintCopyAsyncRunner(Object.freeze({
    assertCurrent(): void { assert.equal(state.current, true, "owner lost"); },
    properties(id: string): Promise<unknown> {
      if (id === "original" || id === "upload") { return reply(id, arrayReply(id === "upload")); }
      if (id.startsWith("scopes-")) { return reply(id, { result: ["Closure (bufferedStream)", "Closure", "Global"].map((description, index) => property(String(index), {
        type: "object", subtype: "internal#scope", className: "Object", description, objectId: `scope-${String(index)}`,
      }, true, true)) }); }
      const index = Number(id.slice(9)); return reply(id, metadata(index));
    },
    capture(): Promise<unknown> { return reply("capture", { result: { type: "object", subtype: "array", className: "Array", description: "Array(14)", objectId: "original" } }); },
    recheck(original: string): Promise<unknown> { assert.equal(original, "original"); return reply("recheck", yes); },
    captureUpload(scope: string): Promise<unknown> { assert.equal(scope, "scope-0"); return reply("capture-upload", { result: { type: "object", subtype: "array", className: "Array", description: "Array(3)", objectId: "upload" } }); },
    sample(scope: string, original: string, upload: string): Promise<unknown> {
      assert.deepEqual([scope, original, upload], ["scope-0", "original", "upload"]); state.sampleCount += 1;
      return reply("sample", { result: { type: "object", value: { ...empty, task1: state.changeSnapshot && state.sampleCount > 1 ? 1 : 0 } } });
    },
  }), "script"); return { runner, calls, state };
}
void test("async collector qualifies seven callback sources and observes17 reads without completion authority", async () => {
  for (const upload of [false, true]) { assert.equal(decodeCurrentFootprintCopyAsyncArray(arrayReply(upload), upload).length, upload ? 3 : 4); }
  for (const index of PROFILES.keys()) { decodeCurrentFootprintCopyAsyncFunction(metadata(index), "script", index); }
  const fixture = owner(), packet = await fixture.runner.observe(); currentFootprintCopyAsyncObservationSchema.parse(packet);
  assert.equal(fixture.calls.length, 17); assert.equal(packet.trackedQueuesEmptyAtSamples, true); assert.equal(packet.callbacksCompleted, false);
  assert.equal(packet.parserArrowReceiversVerified, false); assert.equal(packet.untrackedUploadCacheCleanupComplete, false);
  await assert.rejects(fixture.runner.requireOriginal({ ...packet })); assert.equal(fixture.calls.length, 17);
  await fixture.runner.requireOriginal(packet); assert.equal(fixture.calls.length, 21);
  await assert.rejects(fixture.runner.observe()); await assert.rejects(fixture.runner.requireOriginal(packet));
});
void test("async collector retains arrived replies across owner loss and never retries a consumed unstable snapshot", async () => {
  const lost = owner(); lost.state.loseAfter = 1; await assert.rejects(lost.runner.observe(), /owner lost/u);
  assert.equal(lost.runner.retained().replies.length, 1); assert.equal(lost.runner.retained().failed, true);
  const changed = owner(); changed.state.changeSnapshot = true; await assert.rejects(changed.runner.observe(), /FOOTPRINT_COPY_ASYNC_OWNER/u);
  assert.equal(changed.runner.retained().requests, 17); assert.equal(changed.runner.retained().replies.length, 17);
  await assert.rejects(changed.runner.observe()); assert.equal(changed.calls.length, 17);
  const late = owner(), packet = await late.runner.observe(); late.state.changeSnapshot = true;
  await assert.rejects(late.runner.requireOriginal(packet)); assert.equal(late.runner.retained().requests, 21); assert.equal(late.runner.retained().failed, true);
});

void test("fixed selectors bind actual buffered receiver and refuse callback replacement, getters and untracked promises", () => {
  for (const change of ["", "project.task1=new Set", "project.task2=project.task1", "consistency.headCbArr.push(stop)", "scope.a={}", "scope.s=100", "scope.i=Promise.resolve();scope.n=stop",
    "Object.defineProperty(scope,'r',{get(){calls++;throw Error('invoked')}})", "project.bufferedUploadCloud=()=>{}", "consistency.getCache=()=>{}"]) {
    const context = vm.createContext({});
    vm.runInContext(`let calls=0;const stop=()=>{calls++;throw Error('invoked');};
const bus={},project={workerBus:bus,task1:new Set,task2:new Set,task3:new Set,cachePromise:new Set,bufferUploadData:new Map,bufferUploadCache:new Map,localCache:{},cache:{},isUploadingCloud:false,isBatchUpload:false,pendingSyncCloud:false,bufferedUploadCloud:stop};
const manager={projectManager:project},consistency={headCbArr:[stop],cbArr:[stop],getCache:stop};project.footprint=manager;project.consistencyManager=consistency;globalThis.PROJECT=project;
const scope={a:project,s:500,r:null,i:null,n:null,t:stop,c:stop,o:stop};
const original=(${CALLS.capture.program}).call(project,bus,manager,consistency),upload=(${CALLS.captureUpload.program}).call({object:scope},project,bus,manager,consistency);
${change}`, context);
    const invoke = (): unknown => vm.runInContext(`(${CALLS.sample.program}).call({object:scope},project,bus,manager,consistency,original,upload)`, context);
    if (change === "") { const observed = structuredClone(invoke()); assert.deepEqual(observed, empty); } else { assert.throws(invoke, /FOOTPRINT_COPY_ASYNC_BINDING/u); }
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("actual uploadCloud completes with empty task1 while detached native cache cleanup is unresolved", async () => {
  const upload = DEPENDENCIES.find(source => source.startsWith("async uploadCloud()")); assert.ok(upload);
  const value: unknown = await vm.runInNewContext(`(async()=>{let finish,puts=0,deletes=0;
const pending=new Promise(r=>finish=r),Re={getInstance:()=>({projectHistory:{set:async()=>({success:true,result:'history'})}})},cg=x=>x,Ie='|\\n';
class Response{constructor(value){this.value=value;}}
const project={${upload},${WAIT},uuid:'project',branchUuid:'branch',bufferUploadData:new Map([['upload-key','body']]),bufferUploadCache:new Map,task1:new Set,
localCache:{put:async()=>{puts++;await pending;},delete:async()=>{deletes++;}},publishUploadPending(){},syncCloud:async()=>{}};
const result=await project.uploadCloud();await project.awaitUploadEnd();
const before={success:result.success,tasks:project.task1.size,puts,deletes};finish();await pending;await Promise.resolve();await Promise.resolve();
return JSON.stringify({before,deletes});})()`, {}, { timeout: 1000 });
  assert.equal(typeof value, "string"); assert.deepEqual(JSON.parse(String(value)), { before: { success: true, tasks: 0, puts: 1, deletes: 0 }, deletes: 1 });
});
void test("actual bufferedStream resolves the superseded tracked promise and keeps the replacement until callback completion", async () => {
  const value: unknown = await vm.runInNewContext(`(async()=>{const timers=new Map;let next=0,finish;const callback=new Promise(r=>finish=r);
const setTimeout=f=>{timers.set(++next,f);return next;},clearTimeout=id=>timers.delete(id);
const project={${BUFFER},task1:new Set,bufferUploadData:new Map};const enqueue=project.bufferedStream(async()=>{await callback;},500);
enqueue({dataUrl:'first',dataStr:'a'});const first=[...project.task1][0];enqueue({dataUrl:'second',dataStr:'b'});await first;
const before={tasks:project.task1.size,timers:timers.size,keys:[...project.bufferUploadData.keys()]};
const run=[...timers.values()][0];const executing=run();await Promise.resolve();const during=project.task1.size;finish();await executing;
return JSON.stringify({before,during,after:project.task1.size});})()`, {}, { timeout: 1000 });
  assert.equal(typeof value, "string"); assert.deepEqual(JSON.parse(String(value)), { before: { tasks: 1, timers: 1, keys: ["first", "second"] }, during: 1, after: 0 });
});
