/** Synthetic native objects and source descriptors, never connected effects. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_UI_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_UI_LIMITS,
  CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER as ORDER, decodeCurrentFootprintCopyUiArray, decodeCurrentFootprintCopyUiFunction,
  decodeCurrentFootprintCopyUiNativeHas, decodeCurrentFootprintCopyUiResponder, decodeCurrentFootprintCopyUiScope } from "../src/current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_FUNCTION_NAMES as NAMES, CURRENT_FOOTPRINT_COPY_UI_SOURCE as SOURCE, assertCurrentFootprintCopyUiFunction,
  qualifyCurrentFootprintCopyUiSource, requireCurrentFootprintCopyUiSource } from "../src/current-footprint-copy-ui-source.ts";
import { FOOTPRINT_COPY_UI_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-fixture.ts";
import type { CurrentFootprintCopyUiFunction } from "../src/current-footprint-copy-ui-source.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
  { name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
const setup = String.raw`
let calls=0;const forbidden=()=>{calls++;throw Error('must not invoke')};
const path='a'.repeat(64),branch='b'.repeat(32),tab='tab_1';
const project={projectId:path,branchUuid:branch},wrapper=forbidden,responder=forbidden;
const task={callback:wrapper,isRunning:true,unsafe:true},queue=[task],notify={pulled:{'/pro-ui/libSource/getProLibSource':queue},pushed:{}};
const bus={},host={currentProject:project,concurrentBus:notify,messageBus:bus},root={gVars:host,_TAB_ID_:tab,_MSG_BUS_:bus,'/tab_1/notify':notify};
class Registry{static getInstance(){forbidden()}static get context(){return forbidden()}hasLib(){return forbidden()}}
root.extendLibManager=new Registry();root.extendLibManager._map=new Map();
class Router{static async getProLibSource(){forbidden()}static async getProjectLibByWorker(){forbidden()}}
const holder={bus,get messageBus(){return forbidden()}};
const scope={description:"Closure",object:{ZI:Router,Lo:holder,h4:Registry,Po:forbidden,$e:{FOOTPRINT:{GET_STR:'/PrjDB/footprint/getStr'}}}};
const wrapperScope={description:'Closure (rpcService)',object:{i:wrapper,t:'/pro-ui/libSource/getProLibSource',e:responder}};`;
function fixture(): vm.Context {
  const context = vm.createContext({}); vm.runInContext(setup, context);
  vm.runInContext(`const notification=(${CALLS.notification.program}).call(root,host,project,path,branch,tab);`, context);
  return context;
}

void test("UI selectors retain an existing responder, initialized bus and registry without calling any producer", () => {
  const context = fixture();
  assert.equal(vm.runInContext(`(${CALLS.responder.program}).call(wrapperScope,wrapper)===responder`, context), true);
  vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context);
  assert.equal(vm.runInContext(`(${CALLS.routeRecheck.program}).call(scope,notification,path,branch,tab,route)`, context), true);
  assert.equal(vm.runInContext(`(${CALLS.notificationRecheck.program}).call(null,notification,path,branch,tab)`, context), true);
  assert.equal(vm.runInContext(`(${CALLS.responderRecheck.program}).call(wrapperScope,wrapper,responder)`, context), true);
  assert.equal(vm.runInContext("calls", context), 0);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.executionAuthorized, false);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.projectWorkerTargetBound, false);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.minimumDescriptorRequests, 21);
});

void test("missing initialization and own shadows refuse without invoking lazy accessors", () => {
  for (const change of ["delete root.extendLibManager", "holder.bus=undefined", "delete holder.bus", "root._MSG_BUS_={}",
    "Object.defineProperty(root,'extendLibManager',{get:forbidden})", "Object.defineProperty(holder,'bus',{get:forbidden})",
    "root.EDITOR_TOP={}", "scope.object.$e.FOOTPRINT.GET_STR='/wrong'",
    "root.extendLibManager.hasLib=forbidden", "root.extendLibManager._map.has=forbidden"]) {
    const context = fixture(); vm.runInContext(change, context);
    assert.throws(() => vm.runInContext(`(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context));
    assert.equal(vm.runInContext("calls", context), 0);
  }
});

void test("fresh relation rechecks reject route replacement, project drift and occupied notification queues", () => {
  for (const change of ["root.extendLibManager._map=new Map()", "holder.bus={}", "scope.object.Po=()=>{}",
    "Router.getProLibSource=async()=>{}", "task.callback=()=>{}", "task.isRunning=false", "queue.push(task)",
    "project.branchUuid='c'.repeat(32)", "notify.pushed['/pro-ui/libSource/getProLibSource']=[]",
    "root.extendLibManager._map.set(path,{})", "Object.defineProperty(scope.object,'ZI',{get:forbidden})"]) {
    const context = fixture(); vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab);${change}`, context);
    assert.throws(() => vm.runInContext(`(${CALLS.routeRecheck.program}).call(scope,notification,path,branch,tab,route)`, context));
    assert.equal(vm.runInContext("calls", context), 0);
  }
  const context = fixture(); vm.runInContext("wrapperScope.object.e=()=>{}", context);
  assert.throws(() => vm.runInContext(`(${CALLS.responderRecheck.program}).call(wrapperScope,wrapper,responder)`, context));
});

void test("membership waits for retained native has and refuses pure-false substitutions without invoking them", () => {
  for (const change of ["", "root.extendLibManager._map.set(path,{})", "Map.prototype.has=function(){calls++;return false}",
    "Object.defineProperty(Map.prototype,'has',{get:forbidden})"]) {
    const context = fixture(); vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab);${change}`, context);
    const call = (): unknown => vm.runInContext(`(${CALLS.membership.program}).call(scope,notification,path,branch,tab,route)`, context);
    if (change === "") { assert.equal(call(), true); } else { assert.throws(call); }
    assert.equal(vm.runInContext("calls", context), 0);
  }
  const context = fixture();
  vm.runInContext("Map.prototype.has=function(){calls++;return false}", context);
  vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context);
  assert.equal(vm.runInContext("calls", context), 0);
  assert.throws(() => vm.runInContext(`(${CALLS.membership.program}).call(scope,notification,path,branch,tab,route)`, context));
  assert.equal(vm.runInContext("calls", context), 0);
  const native = { result: [property("name", { type: "string", value: "has" }), property("length", { type: "number", value: 1 })],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] };
  decodeCurrentFootprintCopyUiNativeHas(native);
  assert.throws(() => { decodeCurrentFootprintCopyUiNativeHas({ ...native, internalProperties: [...native.internalProperties,
    { name: "[[FunctionLocation]]", value: { type: "object", objectId: "location" } }] }); });
});

function metadata(role: CurrentFootprintCopyUiFunction): Data {
  const profile = SOURCE.functions[role];
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (role === "contextProducer") { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, true, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "ui", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", className: profile.async ? "AsyncFunction" : "Function", objectId: "prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[3]" } },
  ] };
}
function bundle(kind: "route" | "notification"): Data {
  const count = kind === "route" ? 17 : 7;
  const roles: readonly CurrentFootprintCopyUiFunction[] = kind === "route" ? ORDER : ["wrapper"];
  const result = Array.from({ length: count }, (_, index) => {
    const role = roles[index], value = role === undefined ? { type: kind === "route" && (index === 7 || index === 8 || index === 16) ? "function" : "object", objectId: `native-${String(index)}`, ...(index === 16 ? { className: "Function", description: "function has() { [native code] }" } : {}) } :
      { type: "function", className: SOURCE.functions[role].async ? "AsyncFunction" : "Function", objectId: role, description: FIXTURE[role] };
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: count }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}

void test("complete source spans and function metadata must match, without granting runtime authority", () => {
  for (const role of NAMES) {
    assertCurrentFootprintCopyUiFunction(role, FIXTURE[role]);
    assert.throws(() => { assertCurrentFootprintCopyUiFunction(role, `${FIXTURE[role]} `); });
    assert.equal(decodeCurrentFootprintCopyUiFunction(metadata(role), role, "ui"), `${role}-scopes`);
    assert.throws(() => decodeCurrentFootprintCopyUiFunction(metadata(role), role, "another-script"));
  }
  assert.throws(() => qualifyCurrentFootprintCopyUiSource(FIXTURE.responder));
  assert.throws(() => { requireCurrentFootprintCopyUiSource({ sourceSha256: SOURCE.sha256, runtimeBound: false }); });
  assert.equal(decodeCurrentFootprintCopyUiResponder({ result: { type: "function", className: "AsyncFunction", description: FIXTURE.responder, objectId: "responder" } }), "responder");
  assert.equal(decodeCurrentFootprintCopyUiArray(bundle("route"), "route").length, 8);
  assert.deepEqual(decodeCurrentFootprintCopyUiArray(bundle("notification"), "notification"), ["wrapper"]);
});

const scopes = (first: string): Data => ({ result: [first, "Global"].map((description, index) => property(String(index), {
    type: "object", subtype: "internal#scope", className: "Object", objectId: `scope-${String(index)}`, description,
  }, true, true)) });

void test("scope and array decoders reject hostile descriptors, duplicates and global fallback", () => {

  assert.equal(decodeCurrentFootprintCopyUiScope(scopes("Closure (rpcService)"), "wrapper"), "scope-0");
  assert.equal(decodeCurrentFootprintCopyUiScope(scopes("Closure"), "responder"), "scope-0");
  assert.throws(() => decodeCurrentFootprintCopyUiScope(scopes("Global"), "responder"));
  let calls = 0;
  assert.throws(() => decodeCurrentFootprintCopyUiScope(new Proxy({}, { ownKeys(): never { calls += 1; throw new Error("trap"); } }), "wrapper"));
  const value = bundle("route"); Object.defineProperty(value, "result", { get(): never { calls += 1; throw new Error("accessor"); } });
  assert.throws(() => decodeCurrentFootprintCopyUiArray(value, "route")); assert.equal(calls, 0);
  const duplicate = bundle("route"), fields = duplicate["result"]; assert.ok(Array.isArray(fields)); fields.copyWithin(1, 0, 1);
  assert.throws(() => decodeCurrentFootprintCopyUiArray(duplicate, "route"));
});

void test("actual V8 internal scope receivers require their description/object envelope before responder selection", async () => {
  const session = new Session(); session.connect();
  // The pinned Node inspector declarations omit this supported V8 parameter.
  // Keep it as a structural extension while testing the actual runtime guard.
  const sideEffectCheck = { throwOnSideEffect: true };
  try {
    await session.post("Runtime.enable");
    const evaluated = await session.post("Runtime.evaluate", { expression: `(()=>{const ZI={getProLibSource(){throw Error('must not invoke')}};const responder=${FIXTURE.responder};return new class{rpcService(e,t){let i=${FIXTURE.wrapper};return i}}().rpcService(responder,'/pro-ui/libSource/getProLibSource')})()`, objectGroup: "ui-scope-regression" });
    const wrapper = evaluated.result.objectId; assert.ok(wrapper !== undefined);
    const wrapperMetadata = await session.post("Runtime.getProperties", { objectId: wrapper, ownProperties: true });
    const scopesId = wrapperMetadata.internalProperties?.find(entry => entry.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined);
    const scopeList = await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true });
    const scope = scopeList.result[0]?.value?.objectId; assert.ok(scope !== undefined);
    assert.equal(scopeList.result[0]?.value?.description, "Closure (rpcService)");
    const selected = await session.post("Runtime.callFunctionOn", { objectId: scope, functionDeclaration: CALLS.responder.program,
      arguments: [{ objectId: wrapper }], objectGroup: "ui-scope-regression", returnByValue: false, ...sideEffectCheck });
    assert.equal(selected.exceptionDetails, undefined); assert.equal(selected.result.description, FIXTURE.responder);
    const responder = selected.result.objectId; assert.ok(responder !== undefined);
    const rechecked = await session.post("Runtime.callFunctionOn", { objectId: scope, functionDeclaration: CALLS.responderRecheck.program,
      arguments: [{ objectId: wrapper }, { objectId: responder }], returnByValue: true, ...sideEffectCheck });
    assert.equal(rechecked.exceptionDetails, undefined); assert.equal(rechecked.result.value, true);
    const plain = await session.post("Runtime.callFunctionOn", { objectId: scope, functionDeclaration: "function(){return this.object}", returnByValue: false, ...sideEffectCheck });
    assert.ok(plain.result.objectId !== undefined);
    const refused = await session.post("Runtime.callFunctionOn", { objectId: plain.result.objectId, functionDeclaration: CALLS.responder.program,
      arguments: [{ objectId: wrapper }], returnByValue: false, ...sideEffectCheck });
    assert.ok(refused.exceptionDetails !== undefined);
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: "ui-scope-regression" }); }
    finally { session.disconnect(); }
  }
});

void test("scope envelopes reject wrong labels, extra fields and lexical accessors without invoking them", () => {
  for (const change of ["scope.description='Global'", "scope.extra=true", "wrapperScope.description='Closure'", "wrapperScope.extra=true",
    "Object.defineProperty(wrapperScope,'object',{get:forbidden})", "Object.defineProperty(scope,'object',{get:forbidden})"]) {
    const context = fixture(); vm.runInContext(change, context);
    const responder = change.includes("wrapperScope");
    const call = responder ? `(${CALLS.responder.program}).call(wrapperScope,wrapper)` : `(${CALLS.route.program}).call(scope,notification,path,branch,tab)`;
    assert.throws(() => vm.runInContext(call, context)); assert.equal(vm.runInContext("calls", context), 0);
  }
});
