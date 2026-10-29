/** Synthetic native objects and source descriptors, never connected effects. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_UI_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_UI_LIMITS,
  CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER as ORDER, decodeCurrentFootprintCopyUiArray, decodeCurrentFootprintCopyUiFunction,
  decodeCurrentFootprintCopyUiNativeHas, decodeCurrentFootprintCopyUiResponder, decodeCurrentFootprintCopyUiScope, rejectCurrentFootprintCopyUiException } from "../src/current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_FUNCTION_NAMES as NAMES, CURRENT_FOOTPRINT_COPY_UI_SOURCE as SOURCE, assertCurrentFootprintCopyUiFunction,
  qualifyCurrentFootprintCopyUiSource, requireCurrentFootprintCopyUiSource } from "../src/current-footprint-copy-ui-source.ts";
import { FOOTPRINT_COPY_UI_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-fixture.ts";
import { FOOTPRINT_COPY_UI_REGISTRY_FIXTURE as REGISTRY_FIXTURE } from "./current-footprint-copy-ui-registry-fixture.ts";
import { decodeCurrentFootprintCopyUiRegistryArray, decodeCurrentFootprintCopyUiRegistryClassScope } from "../src/current-footprint-copy-ui-registry-metadata.ts";
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
class PreloadRegistry{static getInstance(){forbidden()}static get context(){return forbidden()}hasLib(){return forbidden()}}
root.extendLibManager=new PreloadRegistry();root.extendLibManager._map=new Map();
class Router{static async getProLibSource(){forbidden()}static async getProjectLibByWorker(){forbidden()}}
const holder={bus,get messageBus(){return forbidden()}};
const scope={description:"Closure",object:{ZI:Router,Lo:holder,h4:Registry,Po:forbidden,$e:{FOOTPRINT:{GET_STR:'/PrjDB/footprint/getStr'}}}};
const wrapperScope={description:'Closure (rpcService)',object:{i:wrapper,t:'/pro-ui/libSource/getProLibSource',e:responder}};`;
function fixture(): vm.Context {
  const context = vm.createContext({}); vm.runInContext(setup, context);
  vm.runInContext(`const notification=(${CALLS.notification.program}).call(root,host,project,path,branch,tab);`, context);
  vm.runInContext(`const registryOriginal=(${CALLS.registry.program}).call(notification,notification,path,branch,tab);`, context);
  return context;
}

void test("UI selectors retain an existing responder, initialized bus and registry without calling any producer", () => {
  const context = fixture();
  assert.equal(vm.runInContext(`(${CALLS.responder.program}).call(wrapperScope,wrapper)===responder`, context), true);
  vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context);
  assert.equal(vm.runInContext(`(${CALLS.routeRecheck.program}).call(scope,notification,path,branch,tab,route,registryOriginal)`, context), true);
  assert.equal(vm.runInContext(`(${CALLS.notificationRecheck.program}).call(null,notification,path,branch,tab)`, context), true);
  assert.equal(vm.runInContext(`(${CALLS.responderRecheck.program}).call(wrapperScope,wrapper,responder)`, context), true);
  assert.equal(vm.runInContext("calls", context), 0);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.executionAuthorized, false);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.projectWorkerTargetBound, false);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_LIMITS.minimumDescriptorRequests, 35);
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
    assert.throws(() => vm.runInContext(`(${CALLS.routeRecheck.program}).call(scope,notification,path,branch,tab,route,registryOriginal)`, context));
    assert.equal(vm.runInContext("calls", context), 0);
  }
  const context = fixture(); vm.runInContext("wrapperScope.object.e=()=>{}", context);
  assert.throws(() => vm.runInContext(`(${CALLS.responderRecheck.program}).call(wrapperScope,wrapper,responder)`, context));
});

void test("membership waits for retained native has and refuses pure-false substitutions without invoking them", () => {
  for (const change of ["", "root.extendLibManager._map.set(path,{})", "Map.prototype.has=function(){calls++;return false}",
    "Object.defineProperty(Map.prototype,'has',{get:forbidden})"]) {
    const context = fixture(); vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab);${change}`, context);
    const call = (): unknown => vm.runInContext(`(${CALLS.membership.program}).call(scope,notification,path,branch,tab,route,registryOriginal)`, context);
    if (change === "") { assert.equal(call(), true); } else { assert.throws(call); }
    assert.equal(vm.runInContext("calls", context), 0);
  }
  const context = fixture();
  vm.runInContext("Map.prototype.has=function(){calls++;return false}", context);
  vm.runInContext(`const route=(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context);
  assert.equal(vm.runInContext("calls", context), 0);
  assert.throws(() => vm.runInContext(`(${CALLS.membership.program}).call(scope,notification,path,branch,tab,route,registryOriginal)`, context));
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

void test("UI binding failures identify the exact rejected relation without widening prototype checks", () => {
  for (const [change, guard] of [
    ["Object.setPrototypeOf(root.extendLibManager,Registry.prototype)", "PRELOAD_REGISTRY_REQUIRED"],
    ["Object.defineProperty(Registry.prototype,'constructor',{value:function substituted(){}})", "REGISTRY_CONSTRUCTOR"],
    ["root.extendLibManager._map={}", "MAP_PROTOTYPE"],
  ]) {
    const context = fixture(); vm.runInContext(change ?? "", context);
    assert.throws(() => vm.runInContext(`(${CALLS.route.program}).call(scope,notification,path,branch,tab)`, context),
      new RegExp(`FOOTPRINT_COPY_UI_BINDING:${guard ?? ""}`, "u"));
    assert.equal(vm.runInContext("calls", context), 0);
  }
  assert.throws(() => { rejectCurrentFootprintCopyUiException({ result: { type: "object", subtype: "error" }, exceptionDetails: {
    lineNumber: 1, columnNumber: 15, exception: { description: "Error: FOOTPRINT_COPY_UI_BINDING:MAP_PROTOTYPE\n private vendor details" },
  } }, "route"); }, /^Error: FOOTPRINT_COPY_UI_CDP_EXCEPTION:route:MAP_PROTOTYPE:1:15$/u);
  assert.throws(() => { rejectCurrentFootprintCopyUiException({ exceptionDetails: null }, "route"); }, /:route:UNCLASSIFIED$/u);
  assert.throws(() => { rejectCurrentFootprintCopyUiException({ exceptionDetails: { exception: { description: "unclassified private text" } } }, "route"); }, /:route:UNCLASSIFIED$/u);
});

void test("actual V8 closure receivers retain their UI realm across all seven route selections", async () => {
  const session = new Session(); session.connect();
  const contexts: { id: number; name: string }[] = [];
  session.on("Runtime.executionContextCreated", event => { contexts.push(event.params.context); });
  const group = "ui-route-realms-regression", sideEffectCheck = { throwOnSideEffect: true };
  try {
    await session.post("Runtime.enable");
    const context = vm.createContext({}, { name: group });
    vm.runInContext(`(()=>{
      const path='a'.repeat(64),branch='b'.repeat(32),tab='tab_1',project={projectId:path,branchUuid:branch};
      const ws=${REGISTRY_FIXTURE.contextProducer},PreloadRegistry=(${REGISTRY_FIXTURE.registryConstructor});
      const Po=${FIXTURE.contextProducer},$e={FOOTPRINT:{GET_STR:'/PrjDB/footprint/getStr'}};
      const h4=class kgt{constructor(){this._map=new Map()}static ${FIXTURE.registryInstance}static ${FIXTURE.registryContext}${FIXTURE.registryHas}};
      const bus={},lCe={bus,${FIXTURE.messageBus}},Lo=lCe;
      const ZI=class boe{static ${FIXTURE.sourceRouter}static ${FIXTURE.projectSource}};
      const responder=${FIXTURE.responder};
      const wrapper=new class{rpcService(e,t){let i=${FIXTURE.wrapper};return i}}().rpcService(responder,'/pro-ui/libSource/getProLibSource');
      const task={callback:wrapper,isRunning:true,unsafe:true},queue=[task],notify={pulled:{'/pro-ui/libSource/getProLibSource':queue},pushed:{}};
      const host={currentProject:project,concurrentBus:notify,messageBus:bus};
      Object.assign(globalThis,{gVars:host,_TAB_ID_:tab,_MSG_BUS_:bus,'/tab_1/notify':notify,extendLibManager:Object.assign(Object.create(PreloadRegistry.prototype),{_map:new Map()}),routeResponder:responder});
    })()`, context);
    const original = contexts.find(value => value.name === group); assert.ok(original !== undefined);
    const evaluated = await session.post("Runtime.evaluate", { expression: "globalThis", contextId: original.id, objectGroup: group });
    const root = evaluated.result.objectId; assert.ok(root !== undefined);
    const target = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "tab_1" }];
    const initialParams: Runtime.CallFunctionOnParameterType = { objectId: root, functionDeclaration: CALLS.initial.program,
      arguments: target, objectGroup: group, returnByValue: false, ...sideEffectCheck };
    const initial = await session.post("Runtime.callFunctionOn", initialParams);
    assert.equal(initial.exceptionDetails, undefined); const notification = initial.result.objectId; assert.ok(notification !== undefined);
    const responder = await session.post("Runtime.evaluate", { expression: "routeResponder", contextId: original.id, objectGroup: group });
    assert.ok(responder.result.objectId !== undefined);
    const metadataReply = await session.post("Runtime.getProperties", { objectId: responder.result.objectId, ownProperties: true });
    const scopesId = metadataReply.internalProperties?.find(value => value.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined);
    const list = await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true });
    assert.equal(list.result[0]?.value?.description, "Closure"); const scope = list.result[0]?.value?.objectId; assert.ok(scope !== undefined);
    const routeParams: Runtime.CallFunctionOnParameterType = { objectId: scope, functionDeclaration: CALLS.route.program,
      arguments: [{ objectId: notification }, ...target], objectGroup: group, returnByValue: false, ...sideEffectCheck };
    const route = await session.post("Runtime.callFunctionOn", routeParams);
    assert.equal(route.exceptionDetails, undefined); assert.ok(route.result.objectId !== undefined);
    const handles = decodeCurrentFootprintCopyUiArray(await session.post("Runtime.getProperties", { objectId: route.result.objectId, ownProperties: true }), "route");
    assert.equal(handles.length, 8);
    for (const [index, role] of ORDER.entries()) {
      const objectId = handles[index]; assert.ok(objectId !== undefined);
      const actual = await session.post("Runtime.getProperties", { objectId, ownProperties: true });
      assert.equal(actual.result.find(value => value.name === "name")?.value?.value, SOURCE.functions[role].name);
      assert.equal(actual.result.find(value => value.name === "length")?.value?.value, SOURCE.functions[role].arity);
    }
    const mapHas = handles[7]; assert.ok(mapHas !== undefined);
    decodeCurrentFootprintCopyUiNativeHas(await session.post("Runtime.getProperties", { objectId: mapHas, ownProperties: true }));
    const registryParams: Runtime.CallFunctionOnParameterType = { objectId: notification, functionDeclaration: CALLS.registry.program,
      arguments: [{ objectId: notification }, ...target], objectGroup: group, returnByValue: false, ...sideEffectCheck };
    const registry = await session.post("Runtime.callFunctionOn", registryParams); assert.ok(registry.result.objectId !== undefined);
    const registryFunctions = decodeCurrentFootprintCopyUiRegistryArray(await session.post("Runtime.getProperties", { objectId: registry.result.objectId, ownProperties: true }));
    const getter = registryFunctions[3]; assert.ok(getter !== undefined);
    const getterMetadata = await session.post("Runtime.getProperties", { objectId: getter, ownProperties: true });
    const getterScopesId = getterMetadata.internalProperties?.find(value => value.name === "[[Scopes]]")?.value?.objectId; assert.ok(getterScopesId !== undefined);
    const registryScopes = decodeCurrentFootprintCopyUiRegistryClassScope(await session.post("Runtime.getProperties", { objectId: getterScopesId, ownProperties: true }));
    const contextParams: Runtime.CallFunctionOnParameterType = { objectId: registryScopes.closureScopeId,
      functionDeclaration: CALLS.registryContextProducer.program, arguments: [{ objectId: notification }, { objectId: registry.result.objectId }, { objectId: registryScopes.blockScopeId }, ...target], objectGroup: group, returnByValue: false, ...sideEffectCheck };
    const contextProducer = await session.post("Runtime.callFunctionOn", contextParams);
    assert.equal(contextProducer.exceptionDetails, undefined); assert.equal(contextProducer.result.description, REGISTRY_FIXTURE.contextProducer);
    assert.ok(contextProducer.result.objectId !== undefined);
    const registryRecheckParams: Runtime.CallFunctionOnParameterType = { objectId: registryScopes.closureScopeId,
      functionDeclaration: CALLS.registryRecheck.program, arguments: [{ objectId: notification }, { objectId: registry.result.objectId }, { objectId: contextProducer.result.objectId }, { objectId: registryScopes.blockScopeId }, ...target], objectGroup: group, returnByValue: true, ...sideEffectCheck };
    const registryRechecked = await session.post("Runtime.callFunctionOn", registryRecheckParams);
    assert.equal(registryRechecked.exceptionDetails, undefined); assert.equal(registryRechecked.result.value, true);
    const membershipParams: Runtime.CallFunctionOnParameterType = { objectId: scope, functionDeclaration: CALLS.membership.program,
      arguments: [{ objectId: notification }, ...target, { objectId: route.result.objectId }, { objectId: registry.result.objectId }], objectGroup: group, returnByValue: true, ...sideEffectCheck };
    const membership = await session.post("Runtime.callFunctionOn", membershipParams);
    assert.equal(membership.exceptionDetails, undefined); assert.equal(membership.result.value, true);
    assert.notEqual(vm.runInContext("Map.prototype", context), Map.prototype);
    assert.notEqual(vm.runInContext("Array.prototype", context), Array.prototype);
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});
