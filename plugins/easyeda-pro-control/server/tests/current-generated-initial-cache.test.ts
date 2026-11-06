/* oxlint-disable import/max-dependencies -- Exercise the actual fixed programs, original cursor, and both separately sealed native grammars together. */
/** Inert original-reference jobs, actual fixed programs and both native wires.
 * No native cache, application, original capability or timer is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CurrentGeneratedInitialCacheCursor } from "../src/current-generated-initial-cache-cursor.ts";
import type { CurrentGeneratedInitialCacheHeld } from "../src/current-generated-initial-cache-cursor.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "../src/current-generated-initial-cache-programs.ts";
import type { CurrentGeneratedInitialCacheCommand } from "../src/current-generated-initial-cache-protocol.ts";
import { currentGeneratedInitialCacheNativeCases } from "../src/current-generated-initial-cache-protocol.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "../src/current-generated-initial-flow-cache-plan.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentGeneratedInitialCacheWire } from "../src/current-generated-initial-cache-wire.ts";

const head = [{ uuid: "a".repeat(32), key: "inert-generated-key", editHead: [{ ticket: 1, client: "actor" }], docs: [{ ["b".repeat(32)]: 0, ["c".repeat(32)]: 0 }], docIds: [["b".repeat(32), "c".repeat(32)]] }];
const data: CurrentGeneratedInitialFlowCacheData = Object.freeze({ projectUuid: "d".repeat(64), branchUuid: "e".repeat(32), historyUuid: "a".repeat(32), namespace: `project_${"d".repeat(64)}_v6`,
  initialSourceSha256: "0".repeat(64), initialLogicalSha256: "0".repeat(64), projectionSourceSha256: "0".repeat(64),
  documents: ["b", "c"].map(id => ({ documentUuid: id.repeat(32), url: `https://client/dataStr/${"a".repeat(32)}-${id.repeat(32)}`, body: `raw-${id}\n"\\😀`, sha256: "0".repeat(64) })),
  headIndex: { url: `https://client/index/v1/${"e".repeat(32)}`, body: JSON.stringify(head), sha256: "0".repeat(64) }, nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false });
function fixture(): Readonly<{ cursor: CurrentGeneratedInitialCacheCursor; packet: (slot: number, role: CurrentGeneratedInitialCacheHeld["role"]) => object; state: { complete: number; failed: boolean; nativeResumes: number; pending: boolean }; run: (source: string) => unknown }> {
  const context = vm.createContext({}), jobs = [...data.documents, data.headIndex];
  vm.runInContext(`let hooks=0;function Cache(){};function CacheStorage(){};function Response(){};
for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("native candidate invoked")},writable:true,enumerable:true,configurable:true});
for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});
const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());const wrapper={cache:Object.create(Cache.prototype)},rows=${JSON.stringify(jobs)};
const values=rows.map((r,index)=>{const response=Object.create(Response.prototype),initial=[wrapper,r.url,response,undefined],n=async()=>{};return{entry:[initial,[],wrapper,wrapper.cache,response,intrinsics,r.url,index===2?${JSON.stringify(head)}:r.body,"${data.projectUuid}","${data.branchUuid}"],pending:[wrapper,r.url,response,undefined,0,n],success:[wrapper,r.url,response,undefined,0,n]};});`, context);
  const original = new WeakMap<object, CurrentGeneratedInitialCacheHeld>(); const objects = new Map<string, unknown>();
  for (const [slot] of jobs.entries()) { for (const role of ["entry", "pending", "success"]) { objects.set(`${role}-${String(slot)}`, vm.runInContext(`values[${String(slot)}].${role}`, context)); } }
  const state = { complete: 0, failed: false, nativeResumes: 0, pending: false };
  const cursor = new CurrentGeneratedInitialCacheCursor(data, Object.freeze({ assertCurrent: (): Promise<void> => Promise.resolve(),
    requireHeld: (packet: object): CurrentGeneratedInitialCacheHeld => { const held = original.get(packet); assert.ok(held !== undefined); return held; },
    request: (command: CurrentGeneratedInitialCacheCommand): Promise<unknown> => {
      if (command.method === "Runtime.getProperties") { return Promise.resolve({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "original-parent" } }, { name: "[[PromiseState]]", value: { type: "string", value: state.pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }); }
      assert.equal(command.method, "Runtime.callFunctionOn"); const fn: unknown = vm.runInContext(`(${command.params.functionDeclaration})`, context); assert.ok(typeof fn === "function");
      const args = command.params.arguments.map(argument => "value" in argument ? argument.value : objects.get(argument.objectId));
      const value: unknown = Reflect.apply(fn, objects.get(command.params.objectId), args); return Promise.resolve({ result: { type: "boolean", value } });
    }, resume: (held: CurrentGeneratedInitialCacheHeld): Promise<void> => { assert.equal(original.get(held.packet), held); state.nativeResumes += 1; return Promise.resolve(); },
    complete: (): Promise<void> => { state.complete += 1; return Promise.resolve(); }, fail: (): void => { state.failed = true; } }));
  return { cursor, state, run: (source: string): unknown => vm.runInContext(source, context), packet: (slot, role): object => {
    const row = jobs[slot]; assert.ok(row !== undefined); const marker = Object.freeze({ original: true });
    original.set(marker, Object.freeze({ packet: marker, role, key: row.url, joinedId: `${({ headEntry: "entry", headPromise: "pending", headSuccess: "success" })[role]}-${String(slot)}`,
      cache: role === "headEntry" ? { role: slot === 2 ? "openCloudHead" : "flow", joinedId: `entry-${String(slot)}` } : null, promise: role === "headPromise" ? { objectId: `promise-${String(slot)}` } : null })); return marker;
  } };
}
void test("two original document puts and the dropped index may overlap; only all actual fulfilled Promises complete startup", async () => {
  const f = fixture();
  for (const slot of [0, 1, 2]) { await f.cursor.continue(f.packet(slot, "headEntry")); await f.cursor.continue(f.packet(slot, "headPromise")); }
  assert.equal(f.state.nativeResumes, 6); assert.equal(f.state.complete, 0); assert.throws(() => { f.cursor.requireCompleted(); });
  f.state.pending = true; for (const slot of [1, 0, 2]) { await f.cursor.continue(f.packet(slot, "headSuccess")); }
  assert.equal(f.state.complete, 0); assert.throws(() => { f.cursor.requireCompleted(); });
  f.state.pending = false; await f.cursor.settle(); f.cursor.requireCompleted(); assert.equal(f.state.complete, 1); assert.equal(f.state.nativeResumes, 9); assert.equal(f.run("hooks"), 0);
  await assert.rejects(f.cursor.settle()); assert.equal(f.state.complete, 1);
});
void test("body/getter/Response/async closure drift refuses before its native resume and never refunds the original attempt", async () => {
  for (const mutation of ['values[0].entry[7]="foreign"', 'Object.defineProperty(values[0].entry,"7",{get(){hooks++;return rows[0].body}})', 'Cache.prototype.put=function(){hooks++;}', 'values[0].entry[0][2]=Object.create(Response.prototype)']) {
    const f = fixture(), packet = f.packet(0, "headEntry"); f.run(mutation); await assert.rejects(f.cursor.continue(packet)); assert.equal(f.state.nativeResumes, 0); assert.equal(f.state.failed, true); assert.equal(f.run("hooks"), 0); await assert.rejects(f.cursor.continue(packet));
  }
  const f = fixture(); await f.cursor.continue(f.packet(0, "headEntry")); await f.cursor.continue(f.packet(0, "headPromise")); f.run('values[0].success[5]=async()=>{}'); await assert.rejects(f.cursor.continue(f.packet(0, "headSuccess"))); assert.equal(f.state.nativeResumes, 2);
});
void test("head comparison rejects inherited/custom serialization without invoking hooks", async () => {
  const f = fixture(); f.run('Object.defineProperty(Object.prototype,"toJSON",{get(){hooks++;throw Error("hook")}})'); await assert.rejects(f.cursor.continue(f.packet(2, "headEntry"))); assert.equal(f.run("hooks"), 0); assert.equal(f.state.nativeResumes, 0);
  assert.equal(PROGRAMS.head.includes("JSON.stringify("), false);
});
void test("fixed startup vocabulary roundtrips only its two original purposes and rejects arbitrary programs/resumes", () => {
  const cases = currentGeneratedInitialCacheNativeCases(); assert.equal(cases.length, 24);
  for (const command of cases) { for (const purpose of ["via", "schematic"] as const) {
    const bytes = Buffer.from(`${JSON.stringify({ id: 1, ...command, initialCacheCommand: true, sessionId: "original-worker" })}\0`);
    assert.deepEqual((purpose === "via" ? currentPcbViaWriteNativeRequest : currentSchematicDisplayWriteNativeRequest)(bytes), currentGeneratedInitialCacheWire(command, 1, purpose).request);
    assert.throws(() => diagnosticNativeRequest(bytes));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => currentGeneratedInitialCacheWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }, 1, purpose)); }
  } }
});
