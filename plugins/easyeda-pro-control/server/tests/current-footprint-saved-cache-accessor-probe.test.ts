/** Synthetic native descriptors, not a Chromium CacheStorage profile. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_GROUP as GROUP,
  decodeCurrentFootprintSavedCacheAccessorProbeArray } from "../src/current-footprint-saved-cache-accessor-probe.ts";
import { currentFootprintSavedCacheAccessorWire, validateCurrentFootprintSavedCacheAccessorCommand } from "../src/current-footprint-saved-cache-accessor-protocol.ts";
import type { CurrentFootprintSavedCacheAccessorCommand as Command } from "../src/current-footprint-saved-cache-accessor-protocol.ts";
import { CurrentFootprintSavedCacheAccessorRunner, currentFootprintSavedCacheAccessorObservationSchema } from "../src/current-footprint-saved-cache-accessor-runner.ts";

type Data = Record<string, unknown>;
const engine = { protocolVersion: "synthetic", product: "synthetic", revision: "synthetic", userAgent: "synthetic", jsVersion: "synthetic" };
const flags = { writable: true, enumerable: false, configurable: true };
const baseline = JSON.stringify({ globalConstructor: flags, constructorPrototype: flags, prototypeConstructor: flags, match: flags, globalAccessor: { enumerable: true, configurable: true, hasGetter: true, hasSetter: false } });
function property(name: string, value: Data, writable = true, enumerable = true, configurable = true): Data {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}
function arrayMetadata(writable = true, enumerable = true, configurable = true): Data {
  return { result: [property("0", { type: "function", className: "Function", objectId: "constructor" }),
    property("1", { type: "object", className: "SyntheticCacheStorage", objectId: "prototype" }),
    property("2", { type: "function", className: "Function", objectId: "match" }),
    property("3", { type: "function", className: "Function", objectId: "getter" }),
    property("length", { type: "number", value: 5 }, true, false, false), property("4", { type: "string", value: baseline }, writable, enumerable, configurable)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function nativeException(kind: "side-effect" | "unknown"): Data {
  const remote = { type: "object", subtype: "error", className: kind === "side-effect" ? "EvalError" : "Error",
    description: kind === "side-effect" ? "EvalError: Possible side-effect in debug-evaluate" : "Error: synthetic-private-note" };
  return { result: { ...remote, objectId: "result-error" }, exceptionDetails: { exceptionId: 4, text: "Uncaught",
    lineNumber: -1, columnNumber: -1, scriptId: "1", exception: { ...remote, objectId: "exception-error" } } };
}
function fixture(fail = ""): { runner: CurrentFootprintSavedCacheAccessorRunner; commands: Command[]; metadata: Data } {
  const commands: Command[] = [], metadata = { result: [{ name: "unreviewed-roster-entry", value: { type: "string", value: "complete synthetic metadata" } }],
    internalProperties: [{ name: "[[Unreviewed]]", value: { type: "string", value: "retained" } }] };
  const transport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: (command: Command): Promise<unknown> => {
    commands.push(command);
    if (command.cacheAccessorPhase === "capture") {
      if (fail === "side-effect" || fail === "unknown") { return Promise.resolve(nativeException(fail)); }
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(5)", objectId: "array" } });
    }
    if (command.cacheAccessorPhase === "array-properties") { return Promise.resolve(fail === "array" ? metadata : arrayMetadata()); }
    if (command.cacheAccessorPhase === "constructor-properties" || command.cacheAccessorPhase === "match-properties" || command.cacheAccessorPhase === "getter-properties") { return Promise.resolve(metadata); }
    if (command.cacheAccessorPhase === "recheck") { return Promise.resolve({ result: { type: "string", value: fail === "recheck" ? "{}" : baseline } }); }
    return Promise.resolve({});
  } };
  return { runner: new CurrentFootprintSavedCacheAccessorRunner(transport, { sessionId: "parent", uniqueContextId: "original" }, engine), commands, metadata };
}

void test("fixed selectors retain constructor/prototype/match/getter without invoking the caches getter or any method", () => {
  const context = createContext({});
  runInContext(`let calls=0,getters=0;globalThis.PRO_EDITOR_VERSION='3.2.209';globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};globalThis.UI={tabBar:{currentTabId:'tab_page1'}};
globalThis.CacheStorage=class CacheStorage{constructor(){calls++;throw Error('constructor');}match(){calls++;throw Error('match');}};
Object.defineProperty(globalThis,'caches',{get(){getters++;throw Error('getter');}});
const captured=(${CALLS.capture})();const rechecked=(${CALLS.recheck}).call(captured);`, context);
  assert.equal(runInContext("calls+getters", context), 0);
  assert.equal(runInContext("captured.length", context), 5);
  runInContext("CacheStorage.prototype.match=function replacement(){}", context);
  assert.throws(() => runInContext(`(${CALLS.recheck}).call(captured)`, context), /SAVED_CACHE_ACCESSOR_PROBE/u);
  assert.equal(runInContext("calls+getters", context), 0);
});

void test("literal tuple baseline and ordinary descriptors are rechecked before metadata can succeed", () => {
  assert.equal(decodeCurrentFootprintSavedCacheAccessorProbeArray(arrayMetadata()).baseline, baseline);
  for (const attributes of [[false, true, true], [true, false, true], [true, true, false]] as const) {
    assert.throws(() => decodeCurrentFootprintSavedCacheAccessorProbeArray(arrayMetadata(...attributes)));
  }
  for (const mutation of ["captured[4]='{}'", "Object.defineProperty(captured,'4',{writable:false})", "Object.defineProperty(captured,'length',{writable:false})"]) {
    const context = createContext({});
    runInContext(`globalThis.PRO_EDITOR_VERSION='3.2.209';globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};globalThis.UI={tabBar:{currentTabId:'tab_page1'}};
globalThis.CacheStorage=class CacheStorage{match(){throw Error('must not call');}};Object.defineProperty(globalThis,'caches',{get(){throw Error('must not call');}});const captured=(${CALLS.capture})();${mutation};`, context);
    assert.throws(() => runInContext(`(${CALLS.recheck}).call(captured)`, context), /SAVED_CACHE_ACCESSOR_PROBE/u);
  }
});

void test("six fixed reads preserve complete unknown rosters and original descriptor recheck without qualification", async () => {
  const value = fixture(); const result = await value.runner.observe();
  assert.deepEqual(value.commands.map(command => command.cacheAccessorPhase), ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties", "recheck", "release"]);
  assert.deepEqual(structuredClone(result.getterMetadata), value.metadata); assert.deepEqual(structuredClone(result.matchMetadata), value.metadata); assert.deepEqual(structuredClone(result.constructorMetadata), value.metadata);
  assert.equal(result.nativeGetterQualified, false); assert.equal(result.nativeMatchQualified, false); assert.equal(result.replayTokenIssued, false); assert.equal(result.matchInvoked, false);
  assert.throws(() => currentFootprintSavedCacheAccessorObservationSchema.parse({ ...result, nativeMatchQualified: true }));
  await assert.rejects(value.runner.observe()); assert.equal(value.commands.length, 7);
});

void test("failed descriptor read retains bounded raw evidence and consumes its once-only attempt before cleanup", async () => {
  const value = fixture("array"); await assert.rejects(value.runner.observe());
  assert.deepEqual(value.commands.map(command => command.cacheAccessorPhase), ["capture", "array-properties", "release"]);
  const retained = value.runner.retained(); const replies = retained["replies"]; assert.ok(Array.isArray(replies));
  const second: unknown = replies[1]; assert.ok(second !== null && typeof second === "object");
  assert.equal(Reflect.get(second, "phase"), "array-properties"); assert.deepEqual(structuredClone(Reflect.get(second, "reply")), value.metadata);
  assert.ok(Buffer.byteLength(JSON.stringify(retained)) < 229_376); assert.equal(retained["replayTokenIssued"], false);
  await assert.rejects(value.runner.observe()); assert.equal(value.commands.length, 3);
});

void test("fixed native exception labels retain the complete original reply and never retry a consumed probe", async () => {
  for (const kind of ["side-effect", "unknown"] as const) {
    const value = fixture(kind);
    await assert.rejects(value.runner.observe(), kind === "side-effect" ? /SIDE_EFFECT_REFUSED/u : /NATIVE_EXCEPTION/u);
    assert.deepEqual(value.commands.map(command => command.cacheAccessorPhase), ["capture", "release"]);
    const retained = value.runner.retained();
    assert.deepEqual(structuredClone(retained["failure"]), { phase: "capture", replyIndex: 0 });
    assert.deepEqual(structuredClone(retained["nativeException"]), { phase: "capture", replyIndex: 0,
      code: kind === "side-effect" ? "debug-evaluate-side-effect-refused" : "unclassified-native-exception" });
    assert.equal(retained["released"], true); assert.equal(retained["replayTokenIssued"], false);
    const replies = retained["replies"]; assert.ok(Array.isArray(replies));
    const first: unknown = replies[0]; assert.ok(first !== null && typeof first === "object" && "reply" in first);
    assert.deepEqual(structuredClone(first.reply), nativeException(kind));
    assert.equal(JSON.stringify(retained["nativeException"]).includes("synthetic-private-note"), false);
    await assert.rejects(value.runner.observe()); assert.equal(value.commands.length, 2);
  }
});

void test("closed cache metadata protocol refuses caller code, getter calls, wrong flags and extra fields", async () => {
  const value = fixture(); await value.runner.observe();
  for (const command of value.commands) {
    assert.equal(currentFootprintSavedCacheAccessorWire(command, 1).request["action"], "saved-cache-accessor");
    assert.throws(() => validateCurrentFootprintSavedCacheAccessorCommand({ ...command, replayTokenIssued: true }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentFootprintSavedCacheAccessorCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return caches}" } }));
      assert.throws(() => validateCurrentFootprintSavedCacheAccessorCommand({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
    }
  }
  const last = value.commands.at(-1); assert.ok(last?.method === "Runtime.releaseObjectGroup"); assert.equal(last.params.objectGroup, GROUP);
});

void test("accessor diagnostic rejects inherited getters, data properties, setters and identity drift without invoking accessors", () => {
  const initial = `globalThis.PRO_EDITOR_VERSION='3.2.209';globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};globalThis.UI={tabBar:{currentTabId:'tab_page1'}};
let getters=0;globalThis.CacheStorage=class CacheStorage{match(){throw Error('must not call');}};`;
  for (const setup of ["Object.defineProperty(globalThis,'caches',{value:{}})",
    "Object.defineProperty(globalThis,'caches',{get(){getters++;},set(v){throw Error('setter')}})",
    "Object.defineProperty(Object.getPrototypeOf(globalThis),'caches',{get(){getters++;},configurable:true})"]) {
    const context = createContext({}); runInContext(`${initial}${setup}`, context);
    assert.throws(() => runInContext(`(${CALLS.capture})()`, context), /SAVED_CACHE_ACCESSOR_PROBE/u);
    assert.equal(runInContext("getters", context), 0);
  }
  for (const mutation of ["Object.defineProperty(globalThis,'caches',{get(){getters++;},configurable:true})",
    "Object.defineProperty(globalThis,'caches',{enumerable:false})", "captured[3]=function replacement(){}"] ) {
    const context = createContext({});
    runInContext(`${initial}Object.defineProperty(globalThis,'caches',{get(){getters++;},enumerable:true,configurable:true});const captured=(${CALLS.capture})();${mutation}`, context);
    assert.throws(() => runInContext(`(${CALLS.recheck}).call(captured)`, context), /SAVED_CACHE_ACCESSOR_PROBE/u);
    assert.equal(runInContext("getters", context), 0);
  }
});
