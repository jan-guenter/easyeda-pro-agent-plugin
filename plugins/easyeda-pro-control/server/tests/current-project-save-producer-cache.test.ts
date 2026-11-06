/** Actual pinned caller code on inert objects and an original Node Inspector
 * event. No application worker, native Cache/Response or resume grant exists. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS } from "../src/current-native-cache-response-intrinsics.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS as CALLS } from "../src/current-project-save-producer-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "../src/current-project-save-producer-cache-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS, currentProjectSaveProducerCacheCallerFrame } from "../src/current-project-save-producer-cache-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE, CURRENT_PROJECT_SAVE_PRODUCER_SITES } from "../src/current-project-save-producer-source.ts";

function fixture(): Readonly<{ run: (source: string) => unknown }> {
  const context = vm.createContext({});
  vm.runInContext(`let invoked=0;function Cache(){invoked++;throw Error("constructor")};function CacheStorage(){invoked++;throw Error("constructor")};function Response(){invoked++;throw Error("constructor")};
for(const[prototype,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const key of names)Object.defineProperty(prototype,key,{value:function(){invoked++;throw Error("method")},enumerable:true,writable:true,configurable:true});
for(const key of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,key,{get:function(){invoked++;throw Error("getter")},enumerable:true,configurable:true});
Object.defineProperty(globalThis,"caches",{get:function(){invoked++;throw Error("caches getter")},enumerable:true,configurable:true});
const intrinsics=(${INTRINSICS.members.program}).call((${INTRINSICS.constructors.program})());
const wrapper=()=>{invoked++},callback=()=>{invoked++},uuid="a".repeat(64),branch="b".repeat(32),body="original-body",key="https://synthetic.invalid/upload/"+branch+"?key=original";
const gd={get branchUuid(){return this._branchUuid},set branchUuid(t){this._branchUuid=t,this._projectDetails&&(this._projectDetails.currentBranch=t)}};for(const key of Reflect.ownKeys(gd)){const d=Object.getOwnPropertyDescriptor(gd,key);Object.defineProperty(gd,key,{...d,enumerable:false});}const lg=Object.create(gd);
const project=Object.assign(Object.create(lg),{uuid,_branchUuid:branch,bufferedUploadCloud:wrapper,cache:{cacheName:"project_"+uuid+"_v6",cache:Object.create(Cache.prototype)},localCache:{cacheName:"localProject_"+uuid+"_v1",cache:Object.create(Cache.prototype)}});globalThis.PROJECT=project;
const response=Object.create(Response.prototype),frame=[project.localCache,key,response,undefined],caller=[project,[],false,undefined,body,key,lg,gd];`, context);
  return Object.freeze({ run: (source: string): unknown => vm.runInContext(source, context) });
}
void test("actual cache caller projection distinguishes local namespace and invokes no native candidate or getter", () => {
  const f = fixture(); assert.equal(f.run(`(${CALLS.localUpload}).call(frame,project,wrapper,callback,intrinsics,caller).length`), 10);
  assert.equal(f.run("invoked"), 0);
  for (const mutation of ['caller[5]="foreign-key"', 'project.localCache.cacheName="foreign-project"', 'Object.defineProperty(frame,"2",{get(){invoked++;return response}})',
    'Cache.prototype.put=function(){invoked++;throw Error("replacement")}']) {
    const changed = fixture(); changed.run(mutation); assert.throws(() => changed.run(`(${CALLS.localUpload}).call(frame,project,wrapper,callback,intrinsics,caller)`)); assert.equal(changed.run("invoked"), 0);
  }
  assert.throws(() => f.run(`(${CALLS.flow}).call(frame,project,wrapper,callback,intrinsics,[project,"doc",undefined,body,key,{},0,undefined])`));
  assert.equal(f.run("invoked"), 0);
});
void test("cache caller reads the original inherited branch accessor backing field without invoking a getter", () => {
  const f = fixture(); assert.equal(f.run("Object.hasOwn(project,'branchUuid')"), false);
  assert.equal(f.run(`(${CALLS.localUpload}).call(frame,project,wrapper,callback,intrinsics,caller)[9]`), "b".repeat(32)); assert.equal(f.run("invoked"), 0);
  for (const mutation of ["caller[6]=Object.create(gd)", "caller[7]=Object.create(null)", "Object.defineProperty(project,'branchUuid',{get(){invoked++;throw Error('own getter')}})", "Object.defineProperty(lg,'branchUuid',{get(){invoked++;throw Error('parent getter')}})", "Object.defineProperty(gd,'branchUuid',{get(){invoked++;throw Error('base getter')},configurable:true})", "Object.defineProperty(project,'_branchUuid',{get(){invoked++;throw Error('backing getter')}})"]) {
    const changed = fixture(); changed.run(mutation); assert.throws(() => changed.run(`(${CALLS.localUpload}).call(frame,project,wrapper,callback,intrinsics,caller)`)); assert.equal(changed.run("invoked"), 0);
  }
});
void test("every literal caller function is sealed and an unknown immediate caller stays refused", () => {
  for (const site of Object.values(CALLERS)) { assert.equal(createHash("sha256").update(site.functionSource).digest("hex"), site.functionSha256); }
  assert.throws(() => currentProjectSaveProducerCacheCallerFrame({ params: { callFrames: [{}, { callFrameId: "foreign", location: { scriptId: "original", lineNumber: 0, columnNumber: 0 }, functionLocation: { scriptId: "original", lineNumber: 0, columnNumber: 0 } }] } }, "original"), /ORIGINAL_CACHE_CALLER/u);
});
void test("all six suspended caller positions are actual V8 call locations", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const [name, site] of Object.entries(CALLERS)) {
      const prefix = name === "flow" || name === "localSave" ? "(" : "({async fixedMethod";
      const suffix = prefix === "(" ? ")" : "})";
      const compiled = await session.post("Runtime.compileScript", { expression: `${prefix}${site.functionSource}${suffix}`, sourceURL: `inert-cache-caller-${name}.js`, persistScript: true });
      assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
      const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: 0 } });
      assert.ok(possible.locations.some(point => point.lineNumber === 0 && point.columnNumber === site.callerOffset - site.functionStart + prefix.length && point.type === "call"), name);
    }
  } finally { session.disconnect(); }
});
function pad(source: string, line: number, column: number): string {
  const parts = source.split("\n"); const currentLine = parts.length - 1; const last = parts.at(-1); assert.ok(last !== undefined && currentLine <= line);
  const next = source + "\n".repeat(line - currentLine); const currentColumn = currentLine === line ? last.length : 0; assert.ok(currentColumn <= column); return next + " ".repeat(column - currentColumn);
}
void test("actual pinned flow callback produces the exact immediate caller frame at original put entry", async () => {
  const session = new Session(); session.connect(); const observed: object[] = []; let callerCapture: Promise<unknown> | null = null;
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const flow = CALLERS.flow, head = CURRENT_PROJECT_SAVE_PRODUCER_SITES.headEntry;
    let source = 'const nu=x=>x,Uo=()=>"original-key",console={time(){},timeEnd(){},error(){}};class SyntheticCache{';
    source = `${pad(source, head.functionLineNumber, head.functionColumnNumber - "async put".length)}${CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE.headPut}}\nfunction syntheticTrigger(){const l={uuid:"original-head"},s=0,o=undefined;const originalCaller=`;
    source = `${pad(source, flow.functionLineNumber, flow.functionColumnNumber)}${flow.functionSource};originalCaller("doc",undefined,"original-body")}\nclass Response{clone(){return this}};const receiver=new SyntheticCache();receiver.cache={put:()=>Promise.resolve(undefined)};class Gd{};class Lg extends Gd{};const target=Object.assign(new Lg,{cache:receiver,cachePromise:new Set()});syntheticTrigger.call(target);`;
    const compiled = await session.post("Runtime.compileScript", { expression: source, sourceURL: "fixed-cache-caller-inert.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined && compiled.exceptionDetails === undefined);
    const point = await session.post("Debugger.setBreakpoint", { location: { scriptId: compiled.scriptId, lineNumber: head.lineNumber, columnNumber: head.columnNumber } });
    session.on("Debugger.paused", event => { observed.push(event.params); const caller = event.params.callFrames[1]; assert.ok(caller !== undefined); callerCapture = session.post("Debugger.evaluateOnCallFrame", { callFrameId: caller.callFrameId, expression: flow.expression, returnByValue: false, objectGroup: "inert-cache-class-caller", throwOnSideEffect: true }); void session.post("Debugger.resume"); });
    await session.post("Runtime.runScript", { scriptId: compiled.scriptId, awaitPromise: true });
    assert.equal(observed.length, 1); const first = observed[0]; assert.ok(first !== undefined);
    const frames: unknown = Reflect.get(first, "callFrames"); assert.ok(Array.isArray(frames)); const parent: unknown = frames[1]; assert.ok(parent !== null && typeof parent === "object"); assert.deepEqual(Reflect.get(parent, "location"), { scriptId: compiled.scriptId, lineNumber: flow.lineNumber, columnNumber: flow.columnNumber }); assert.deepEqual(Reflect.get(parent, "functionLocation"), { scriptId: compiled.scriptId, lineNumber: flow.functionLineNumber, columnNumber: flow.functionColumnNumber });
    const selected = currentProjectSaveProducerCacheCallerFrame({ params: first }, compiled.scriptId); assert.equal(selected.role, "flow");
    const getCapture = (): Promise<unknown> | null => callerCapture; const pending = getCapture(); assert.ok(pending !== null); const captured = await pending; assert.ok(captured !== null && typeof captured === "object"); const array: unknown = Reflect.get(captured, "result"); assert.ok(array !== null && typeof array === "object"); const objectId: unknown = Reflect.get(array, "objectId"); assert.equal(typeof objectId, "string"); assert.ok(typeof objectId === "string");
    const identity = await session.post("Runtime.callFunctionOn", { objectId, functionDeclaration: "function(){return this.length===10&&this[8]===Object.getPrototypeOf(this[0])&&this[9]===Object.getPrototypeOf(this[8])}", returnByValue: true }); assert.equal(identity.result.value, true);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-cache-class-caller" });
    await session.post("Debugger.removeBreakpoint", { breakpointId: point.breakpointId });
  } finally { session.disconnect(); }
});
void test("actual put return pause retains the same original pending Promise and rejects invented completion metadata", async () => {
  const session = new Session(); session.connect(); let capture: Promise<unknown> | null = null;
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const method = CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE.headPut;
    const compiled = await session.post("Runtime.compileScript", { expression: `({${method}})`, sourceURL: "inert-original-cache-promise.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined);
    const container = await session.post("Runtime.runScript", { scriptId: compiled.scriptId }); assert.ok(container.result.objectId !== undefined);
    const properties = await session.post("Runtime.getProperties", { objectId: container.result.objectId, ownProperties: true });
    const put = properties.result.find(field => field.name === "put")?.value?.objectId; assert.ok(put !== undefined);
    const site = CURRENT_PROJECT_SAVE_PRODUCER_SITES.headPromise;
    const point = await session.post("Debugger.setBreakpoint", { location: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: site.offset - 1_684_363 + 2 } });
    session.on("Debugger.paused", event => { const returned = currentProjectSaveProducerCachePromiseHandle(event.params.callFrames[0]?.returnValue); capture = session.post("Runtime.callFunctionOn", { objectId: returned, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, objectGroup: "inert-cache-promise", returnByValue: false, throwOnSideEffect: true }); void session.post("Debugger.resume"); });
    const call = await session.post("Runtime.callFunctionOn", { objectId: put, functionDeclaration: 'function(){globalThis.nu=x=>x;return this.call({cache:{put:()=>new Promise(()=>{})}},"inert-key",{clone(){return{}}})}', awaitPromise: false, returnByValue: false });
    const getCapture = (): Promise<unknown> | null => capture; const originalCapture = getCapture(); assert.ok(originalCapture !== null && call.result.objectId !== undefined); const retained: unknown = await originalCapture; assert.ok(retained !== null && typeof retained === "object"); const actual = currentProjectSaveProducerCachePromiseHandle(Reflect.get(retained, "result"));
    const sameParams = { objectId: actual, functionDeclaration: "function(other){return this===other}", arguments: [{ objectId: call.result.objectId }], returnByValue: true, throwOnSideEffect: true };
    // The Node protocol type omits the supported throwOnSideEffect field.
    // Keep the actual fixed request and check its original Promise/result.
    const post = session.post.bind(session); const samePending: unknown = Reflect.apply(post, undefined, ["Runtime.callFunctionOn", sameParams]); assert.ok(samePending instanceof Promise); const same: unknown = await samePending; assert.ok(same !== null && typeof same === "object"); const result: unknown = Reflect.get(same, "result"); assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "value"), true);
    const state = await session.post("Runtime.getProperties", { objectId: actual, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    // Node's test runner adds its exact async-hooks symbol pair. Browser worker
    // Metadata stays empty-own-properties; this explicit inert harness projection
    // Preserves the original V8 state/result and grants no runtime authority.
    assert.deepEqual(state.result.map(field => field.name).toSorted(), ["Symbol(async_id_symbol)", "Symbol(trigger_async_id_symbol)"]);
    for (const field of state.result) { assert.equal(field.symbol?.description, field.name); assert.equal(field.value?.type, "number"); assert.equal(Number.isSafeInteger(field.value.value), true); assert.equal(field.writable, true); assert.equal(field.enumerable, true); assert.equal(field.configurable, true); assert.equal(field.isOwn, true); }
    assert.equal(decodeCurrentProjectSaveProducerCachePromise({ ...state, result: [] }), "pending");
    assert.throws(() => decodeCurrentProjectSaveProducerCachePromise({ ...state, result: [{ name: "then" }] }));
    await session.post("Debugger.removeBreakpoint", { breakpointId: point.breakpointId });
  } finally { session.disconnect(); }
});
