/** Inert original-reference jobs, fixed programs and eight-slot grammar.
 * No native cache, application, original capability or timer is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CurrentFootprintInitialCacheCursor } from "../src/current-footprint-initial-cache-cursor.ts";
import type { CurrentFootprintInitialCacheHeld } from "../src/current-footprint-initial-cache-cursor.ts";
import { CURRENT_FOOTPRINT_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "../src/current-footprint-initial-cache-programs.ts";
import type { CurrentFootprintInitialCacheCommand } from "../src/current-footprint-initial-cache-protocol.ts";
import { currentFootprintInitialCacheNativeCases, validateCurrentFootprintInitialCacheCommand } from "../src/current-footprint-initial-cache-protocol.ts";
import { deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";
import { sha256Text } from "../src/core.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";

const branchUuid = "e".repeat(32), projectUuid = "d".repeat(64), uuids = Array.from({ length: 7 }, (_, index) => String(index + 1).repeat(32));
const line = (type: string, body: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(body)}`;
const heads = uuids.map((uuid, index) => ({ id: 7 - index, uuid, parent: uuids[index + 1] ?? null, key: "f".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }));
const chunks = uuids.map((historyUuid, index) => { const plaintext = `${line("EDIT_HEAD", { uuid: "actor", updateTime: 1000 + index })}|\n${line("DOCHEAD", { uuid: "a".repeat(16), docType: "FOOTPRINT", client: "original" }, { ticket: index + 1 })}|\n${line("META", { title: `Copy-${String(index)}` }, { id: "META", ticket: index + 1 })}|\n`; return { historyUuid, ordinal: 0, plaintext, plaintextSha256: sha256Text(plaintext) }; });
const data = deriveCurrentFootprintSavedFlowCacheData({ projectUuid, branchUuid, headHistoryUuid: uuids[0], heads, chunks });
const head: unknown = JSON.parse(data.headIndex.body);
function fixture(): Readonly<{ cursor: CurrentFootprintInitialCacheCursor; packet: (slot: number, role: CurrentFootprintInitialCacheHeld["role"]) => object; state: { complete: number; failed: boolean; nativeResumes: number; pending: boolean }; run: (source: string) => unknown }> {
  const context = vm.createContext({}), jobs = [...data.bodies, data.headIndex];
  vm.runInContext(`let hooks=0;function Cache(){};function CacheStorage(){};function Response(){};
for(const[p,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const k of names)Object.defineProperty(p,k,{value:function(){hooks++;throw Error("native candidate invoked")},writable:true,enumerable:true,configurable:true});
for(const k of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,k,{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});Object.defineProperty(globalThis,"caches",{get:function(){hooks++;throw Error("getter")},enumerable:true,configurable:true});
const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());const wrapper={cache:Object.create(Cache.prototype)},rows=${JSON.stringify(jobs)};
const values=rows.map((r,index)=>{const response=Object.create(Response.prototype),initial=[wrapper,r.url,response,undefined],n=async()=>{};return{entry:[initial,[],wrapper,wrapper.cache,response,intrinsics,r.url,index===7?${JSON.stringify(head)}:r.body,"${data.projectUuid}","${data.branchUuid}"],pending:[wrapper,r.url,response,undefined,0,n],success:[wrapper,r.url,response,undefined,0,n]};});`, context);
  const original = new WeakMap<object, CurrentFootprintInitialCacheHeld>(); const objects = new Map<string, unknown>();
  for (const [slot] of jobs.entries()) { for (const role of ["entry", "pending", "success"]) { objects.set(`${role}-${String(slot)}`, vm.runInContext(`values[${String(slot)}].${role}`, context)); } }
  const state = { complete: 0, failed: false, nativeResumes: 0, pending: false };
  const cursor = new CurrentFootprintInitialCacheCursor(data, Object.freeze({ assertCurrent: (): Promise<void> => Promise.resolve(),
    requireHeld: (packet: object): CurrentFootprintInitialCacheHeld => { const held = original.get(packet); assert.ok(held !== undefined); return held; },
    request: (command: CurrentFootprintInitialCacheCommand): Promise<unknown> => {
      if (command.method === "Runtime.getProperties") { return Promise.resolve({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "original-parent" } }, { name: "[[PromiseState]]", value: { type: "string", value: state.pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }); }
      if (command.method !== "Runtime.callFunctionOn") { throw new Error("unexpected cursor request"); } const fn: unknown = vm.runInContext(`(${command.params.functionDeclaration})`, context); assert.ok(typeof fn === "function");
      const args = command.params.arguments.map(argument => "value" in argument ? argument.value : objects.get(argument.objectId));
      const value: unknown = Reflect.apply(fn, objects.get(command.params.objectId), args); return Promise.resolve({ result: { type: "boolean", value } });
    }, resume: (held: CurrentFootprintInitialCacheHeld): Promise<void> => { assert.equal(original.get(held.packet), held); state.nativeResumes += 1; return Promise.resolve(); },
    complete: (): Promise<void> => { state.complete += 1; return Promise.resolve(); }, fail: (): void => { state.failed = true; } }));
  return { cursor, state, run: (source: string): unknown => vm.runInContext(source, context), packet: (slot, role): object => {
    const row = jobs[slot]; assert.ok(row !== undefined); const marker = Object.freeze({ original: true });
    original.set(marker, Object.freeze({ packet: marker, role, key: row.url, joinedId: `${({ headEntry: "entry", headPromise: "pending", headSuccess: "success" })[role]}-${String(slot)}`,
      cache: role === "headEntry" ? { role: slot === 7 ? "openCloudHead" : "flow", joinedId: `entry-${String(slot)}` } : null, promise: role === "headPromise" ? { objectId: `promise-${String(slot)}` } : null })); return marker;
  } };
}
void test("seven original grouped puts and the dropped index overlap, then require all eight actual Promise fulfillments", async () => {
  const f = fixture(); assert.deepEqual(f.cursor.startupProgress(), { jobs: 8, acknowledgedResumes: 0, allCallsResumed: false, settlementPasses: 0, canSettle: false, completed: false, failed: false, nativeOwnershipVerified: false, completeUploadFrontierVerified: false });
  for (const slot of [0, 1, 2, 3, 4, 5, 6, 7]) { await f.cursor.continue(f.packet(slot, "headEntry")); await f.cursor.continue(f.packet(slot, "headPromise")); }
  assert.equal(f.state.nativeResumes, 16); assert.equal(f.state.complete, 0); assert.throws(() => { f.cursor.requireCompleted(); });
  f.state.pending = true; for (const slot of [6, 1, 3, 0, 4, 7, 5, 2]) { await f.cursor.continue(f.packet(slot, "headSuccess")); }
  assert.equal(f.state.complete, 0); assert.throws(() => { f.cursor.requireCompleted(); });
  assert.equal(f.cursor.startupProgress().canSettle, true); assert.equal(f.cursor.startupProgress().acknowledgedResumes, 24);
  f.state.pending = false; await f.cursor.settle(); f.cursor.requireCompleted(); assert.equal(f.state.complete, 1); assert.equal(f.state.nativeResumes, 24); assert.equal(f.run("hooks"), 0);
  assert.equal(f.cursor.startupProgress().completed, true); assert.equal(f.cursor.startupProgress().canSettle, false);
  await assert.rejects(f.cursor.settle()); assert.equal(f.state.complete, 1);
});
void test("body/getter/Response/async closure drift refuses before its native resume and never refunds the original attempt", async () => {
  for (const mutation of ['values[0].entry[7]="foreign"', 'Object.defineProperty(values[0].entry,"7",{get(){hooks++;return rows[0].body}})', 'Cache.prototype.put=function(){hooks++;}', 'values[0].entry[0][2]=Object.create(Response.prototype)']) {
    const f = fixture(), packet = f.packet(0, "headEntry"); f.run(mutation); await assert.rejects(f.cursor.continue(packet)); assert.equal(f.state.nativeResumes, 0); assert.equal(f.state.failed, true); assert.equal(f.run("hooks"), 0); await assert.rejects(f.cursor.continue(packet));
  }
  const f = fixture(); await f.cursor.continue(f.packet(0, "headEntry")); await f.cursor.continue(f.packet(0, "headPromise")); f.run('values[0].success[5]=async()=>{}'); await assert.rejects(f.cursor.continue(f.packet(0, "headSuccess"))); assert.equal(f.state.nativeResumes, 2);
});
void test("head comparison rejects inherited/custom serialization without invoking hooks", async () => {
  const f = fixture(); f.run('Object.defineProperty(Object.prototype,"toJSON",{get(){hooks++;throw Error("hook")}})'); await assert.rejects(f.cursor.continue(f.packet(7, "headEntry"))); assert.equal(f.run("hooks"), 0); assert.equal(f.state.nativeResumes, 0);
  assert.equal(PROGRAMS.head.includes("JSON.stringify("), false);
});
void test("footprint head encoder preserves native undefined fallback and refuses an unsupported graph before enrollment", async () => {
  const f = fixture(); f.run('values[7].entry[7][0].editHead[0].username=undefined;values[7].entry[7][0].editHead[0].nickname=undefined;');
  await f.cursor.continue(f.packet(7, "headEntry")); assert.equal(f.state.nativeResumes, 1); assert.equal(f.run("hooks"), 0);
  const generatedHead = PROGRAMS.head.replace("++count>1024", "++count>128").replace("n>256", "n>4");
  assert.throws(() => f.run(`(${generatedHead}).call(values[7].entry,rows[7].url,rows[7].body)`));
  for (const body of [JSON.stringify([Object.fromEntries(Array.from({ length: 33 }, (_, index) => [String(index), null]))]), JSON.stringify({toJSON:null}), JSON.stringify(Array.from({length:257},()=>null))]) {
    assert.throws(() => new CurrentFootprintInitialCacheCursor(Object.freeze({...data,headIndex:Object.freeze({...data.headIndex,body})}), Object.freeze({assertCurrent:()=>Promise.resolve(), requireHeld:()=>{throw new Error("not reached");}, request:()=>Promise.resolve({}), resume:()=>Promise.resolve(), complete:()=>Promise.resolve(), fail:()=>{throw new Error("not reached");}})));
  }
});
void test("eight-slot grammar contains no arbitrary program, ninth job or unscoped resume", () => {
  const cases = currentFootprintInitialCacheNativeCases(); assert.equal(cases.length,96);
  for (const command of cases) { assert.equal(validateCurrentFootprintInitialCacheCommand(command).slot,command.slot); assert.throws(()=>validateCurrentFootprintInitialCacheCommand({...command,slot:8}));
    if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentFootprintInitialCacheCommand({...command,params:{...command.params,functionDeclaration:"function(){return true;}"}}));}}
});
