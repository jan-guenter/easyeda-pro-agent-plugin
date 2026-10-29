/** Synthetic native descriptors, not a Chromium CacheStorage profile. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_GROUP as GROUP } from "../src/current-footprint-saved-cache-probe.ts";
import { currentFootprintSavedCacheWire, validateCurrentFootprintSavedCacheCommand } from "../src/current-footprint-saved-cache-protocol.ts";
import type { CurrentFootprintSavedCacheCommand as Command } from "../src/current-footprint-saved-cache-protocol.ts";
import { CurrentFootprintSavedCacheRunner, currentFootprintSavedCacheObservationSchema } from "../src/current-footprint-saved-cache-runner.ts";

type Data = Record<string, unknown>;
const engine = { protocolVersion: "synthetic", product: "synthetic", revision: "synthetic", userAgent: "synthetic", jsVersion: "synthetic" };
const flags = { writable: true, enumerable: false, configurable: true };
const baseline = JSON.stringify({ globalConstructor: flags, constructorPrototype: flags, prototypeConstructor: flags, match: flags });
function property(name: string, value: Data, writable = true, enumerable = true, configurable = true): Data {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}
function arrayMetadata(): Data {
  return { result: [property("0", { type: "function", className: "Function", objectId: "constructor" }),
    property("1", { type: "object", className: "SyntheticCacheStorage", objectId: "prototype" }),
    property("2", { type: "function", className: "Function", objectId: "match" }),
    property("length", { type: "number", value: 3 }, true, false, false), property("descriptorBaseline", { type: "string", value: baseline }, false, false, false)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function fixture(fail = ""): { runner: CurrentFootprintSavedCacheRunner; commands: Command[]; metadata: Data } {
  const commands: Command[] = [], metadata = { result: [{ name: "unreviewed-roster-entry", value: { type: "string", value: "complete synthetic metadata" } }],
    internalProperties: [{ name: "[[Unreviewed]]", value: { type: "string", value: "retained" } }] };
  const transport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: (command: Command): Promise<unknown> => {
    commands.push(command);
    if (command.cacheNativePhase === "capture") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(3)", objectId: "array" } }); }
    if (command.cacheNativePhase === "array-properties") { return Promise.resolve(fail === "array" ? metadata : arrayMetadata()); }
    if (command.cacheNativePhase === "constructor-properties" || command.cacheNativePhase === "match-properties") { return Promise.resolve(metadata); }
    if (command.cacheNativePhase === "recheck") { return Promise.resolve({ result: { type: "string", value: fail === "recheck" ? "{}" : baseline } }); }
    return Promise.resolve({});
  } };
  return { runner: new CurrentFootprintSavedCacheRunner(transport, { sessionId: "parent", uniqueContextId: "original" }, engine), commands, metadata };
}

void test("fixed selectors retain constructor/prototype/match without invoking the caches getter or any method", () => {
  const context = createContext({});
  runInContext(`let calls=0,getters=0;globalThis.PRO_EDITOR_VERSION='3.2.209';globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''}};globalThis.UI={tabBar:{currentTabId:'tab_page1'}};
globalThis.CacheStorage=class CacheStorage{constructor(){calls++;throw Error('constructor');}match(){calls++;throw Error('match');}};
Object.defineProperty(globalThis,'caches',{get(){getters++;throw Error('getter');}});
const captured=(${CALLS.capture})();const rechecked=(${CALLS.recheck}).call(captured);`, context);
  assert.equal(runInContext("calls+getters", context), 0);
  assert.equal(runInContext("captured.length", context), 3);
  runInContext("CacheStorage.prototype.match=function replacement(){}", context);
  assert.throws(() => runInContext(`(${CALLS.recheck}).call(captured)`, context), /SAVED_CACHE_NATIVE_PROBE/u);
  assert.equal(runInContext("calls+getters", context), 0);
});

void test("five fixed reads preserve complete unknown rosters and original descriptor recheck without qualification", async () => {
  const value = fixture(); const result = await value.runner.observe();
  assert.deepEqual(value.commands.map(command => command.cacheNativePhase), ["capture", "array-properties", "constructor-properties", "match-properties", "recheck", "release"]);
  assert.deepEqual(structuredClone(result.matchMetadata), value.metadata); assert.deepEqual(structuredClone(result.constructorMetadata), value.metadata);
  assert.equal(result.nativeMatchQualified, false); assert.equal(result.replayTokenIssued, false); assert.equal(result.matchInvoked, false);
  assert.throws(() => currentFootprintSavedCacheObservationSchema.parse({ ...result, nativeMatchQualified: true }));
  await assert.rejects(value.runner.observe()); assert.equal(value.commands.length, 6);
});

void test("failed descriptor read retains bounded raw evidence and consumes its once-only attempt before cleanup", async () => {
  const value = fixture("array"); await assert.rejects(value.runner.observe());
  assert.deepEqual(value.commands.map(command => command.cacheNativePhase), ["capture", "array-properties", "release"]);
  const retained = value.runner.retained(); const replies = retained["replies"]; assert.ok(Array.isArray(replies));
  const second: unknown = replies[1]; assert.ok(second !== null && typeof second === "object");
  assert.equal(Reflect.get(second, "phase"), "array-properties"); assert.deepEqual(structuredClone(Reflect.get(second, "reply")), value.metadata);
  assert.ok(Buffer.byteLength(JSON.stringify(retained)) < 196_608); assert.equal(retained["replayTokenIssued"], false);
  await assert.rejects(value.runner.observe()); assert.equal(value.commands.length, 3);
});

void test("closed cache metadata protocol refuses caller code, getter calls, wrong flags and extra fields", async () => {
  const value = fixture(); await value.runner.observe();
  for (const command of value.commands) {
    assert.equal(currentFootprintSavedCacheWire(command, 1).request["action"], "saved-cache-native");
    assert.throws(() => validateCurrentFootprintSavedCacheCommand({ ...command, replayTokenIssued: true }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentFootprintSavedCacheCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return caches}" } }));
      assert.throws(() => validateCurrentFootprintSavedCacheCommand({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
    }
  }
  const last = value.commands.at(-1); assert.ok(last?.method === "Runtime.releaseObjectGroup"); assert.equal(last.params.objectGroup, GROUP);
});
