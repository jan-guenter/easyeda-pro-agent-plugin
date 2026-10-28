/** Synthetic original event source and fixed-program fixtures. No EasyEDA,
 * native CacheStorage.open or browser namespace is exercised by these tests. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { isRecord } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_NATIVE_PROFILES as NATIVES,
  CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_SITES as SITES } from "../src/current-footprint-copy-cache-construction-contract.ts";
import type { CurrentFootprintCacheConstructionCommand as Command } from "../src/current-footprint-copy-cache-construction-contract.ts";
import { CurrentFootprintCopyCacheConstructionRunner } from "../src/current-footprint-copy-cache-construction-runner.ts";
import type { CurrentFootprintCopyCacheConstructionTransport } from "../src/current-footprint-copy-cache-construction-runner.ts";
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_PROFILES as WRAPPERS } from "../src/current-footprint-copy-backend-cache-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-backend-cache-fixture.ts";
import { fixture as peerFixture } from "./helpers/current-footprint-parent-worker-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });

void test("both fixed cache sites are actual unrelocated V8 breakpoints in the exact inert wrapper source", async () => {
  const session = new Session(); session.connect(); const group = "cache-construction-sites", ids: string[] = [];
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const body = SOURCES[0], profile = WRAPPERS[0];
    const column = profile.columnNumber - body.indexOf("(");
    const expression = `"use strict";${"\n".repeat(profile.lineNumber)}${" ".repeat(column - 7)}var bb=${body};bb`;
    const reply = await session.post("Runtime.evaluate", { expression, objectGroup: group });
    assert.equal(reply.exceptionDetails, undefined); const id = reply.result.objectId; assert.ok(id !== undefined);
    const properties = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
    const point: unknown = properties.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
    assert.ok(isRecord(point) && typeof point["scriptId"] === "string"); const scriptId = point["scriptId"];
    const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId, lineNumber: 106, columnNumber: 55_710 },
      end: { scriptId, lineNumber: 106, columnNumber: 55_903 }, restrictToFunction: true });
    for (const site of SITES) {
      const location = { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      assert.ok(possible.locations.some(value => value.lineNumber === site.lineNumber && value.columnNumber === site.columnNumber));
      const installed = await session.post("Debugger.setBreakpoint", { location }); ids.push(installed.breakpointId);
      assert.deepEqual(installed.actualLocation, location);
    }
  } finally {
    try { for (const breakpointId of ids) { await session.post("Debugger.removeBreakpoint", { breakpointId }); } await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});
function metadata(index: number, native: boolean): Data {
  const expected = native ? NATIVES[index] : WRAPPERS[index]; assert.ok(expected !== undefined);
  const constructor = native ? NATIVES[index]?.constructor === true : index === 0, name = expected.name;
  const result = [property("name", { type: "string", value: name }), property("length", { type: "number", value: expected.arity })];
  if (constructor) { result.push(property("prototype", { type: "object", className: name, description: name, objectId: `prototype-${name}` }, false, false, false)); }
  const internals: Data[] = [{ name: "[[Prototype]]", value: { type: !native && index === 1 ? "object" : "function", className: "Function",
    description: "function () { [native code] }", objectId: "function-prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
    description: native ? "Scopes[0]" : "Scopes[2]", objectId: "scopes" } }];
  if (!native && "lineNumber" in expected) { internals.unshift({ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location",
    value: { scriptId: "script", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } }); }
  return { result, internalProperties: internals };
}
function arrayProperties(size: number, namespace: number): Data {
  const ids = [`wrapper-${String(namespace)}`, "wrapper-function-0", "wrapper-function-1", "native-0", "native-1", "native-2", "native-3", "root", "storage", `cache-${String(namespace)}`].slice(0, size);
  const classes: Readonly<Record<number, string>> = { 0: "bb", 7: "DedicatedWorkerGlobalScope", 8: "CacheStorage", 9: "Cache" };
  const result = ids.map((objectId, index) => {
    const callable = index >= 1 && index <= 6;
    const description = index <= 2 ? SOURCES[index - 1] : `function ${NATIVES[index - 3]?.name ?? ""}() { [native code] }`;
    const functionClass = index === 2 ? "AsyncFunction" : "Function";
    return property(String(index), { type: callable ? "function" : "object", className: callable ? functionClass : classes[index],
      ...(callable ? { description } : {}), objectId }, true, true);
  });
  result.push(property("length", { type: "number", value: size }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function fixture(mode: "success" | "resume-lost" | "release-lost" | "unsubscribe-failed" | "relocated" | "settlement-held" = "success"): Readonly<{
  runner: CurrentFootprintCopyCacheConstructionRunner; calls: Command[]; emit: (ordinal: number) => void; lost: () => void;
  unblockMetadata: () => void; metadataEntered: Promise<null>;
}> {
  let listener: Parameters<CurrentFootprintCopyCacheConstructionTransport["subscribe"]>[0] | null = null;
  let arrayCount = 0, ordinal = 0, resumes = 0;
  const arrays = new Map<string, Data>(), calls: Command[] = [], removed = new Set<string>();
  const entered = Promise.withResolvers<null>(), metadataGate = Promise.withResolvers<null>();
  const emit = (index: number): void => {
    ordinal = index; const site = SITES[index % 2]; assert.ok(site !== undefined && listener !== null);
    listener.paused({ reason: "other", hitBreakpoints: [`point-${String(index % 2)}`], callFrames: [{ callFrameId: `frame-${String(index)}`, functionName: "open",
      location: { scriptId: "script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } },
      { callFrameId: "caller", functionName: "Gi", location: { scriptId: "script", lineNumber: 106, columnNumber: 57_200 } }] });
  };
  const request = async (command: Command): Promise<unknown> => {
    await Promise.resolve(); calls.push(command);
    if (command.method === "Debugger.setBreakpoint") {
      const index = calls.filter(item => item.method === "Debugger.setBreakpoint").length - 1;
      return { breakpointId: `point-${String(index)}`, actualLocation: { ...command.params.location, ...(mode === "relocated" ? { columnNumber: command.params.location.columnNumber + 1 } : {}) } };
    }
    if (command.method === "Debugger.evaluateOnCallFrame") { return { result: { type: "object", className: "bb", description: "bb", objectId: `wrapper-${String(Math.floor(ordinal / 2))}` } }; }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (mode === "settlement-held" && id === "wrapper-function-0") { entered.resolve(null); await metadataGate.promise; }
      if (id.startsWith("wrapper-function-")) { return metadata(Number(id.at(-1)), false); }
      if (id.startsWith("native-")) { return metadata(Number(id.at(-1)), true); }
      const result = arrays.get(id); assert.ok(result !== undefined); return result;
    }
    if (command.method === "Runtime.callFunctionOn") {
      if (command.params.functionDeclaration === CALLS.join.program) { return { result: { type: "boolean", value: true } }; }
      const role = Object.entries(CALLS).find(([, value]) => value.program === command.params.functionDeclaration)?.[0];
      assert.ok(role === "before" || role === "bind" || role === "after");
      const id = `array-${String(arrayCount)}`, size = { before: 8, bind: 9, after: 10 }[role]; arrayCount += 1;
      arrays.set(id, arrayProperties(size, Math.floor(ordinal / 2)));
      return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(size)})`, objectId: id } };
    }
    if (command.method === "Debugger.removeBreakpoint") { removed.add(command.params.breakpointId); }
    if (command.method === "Runtime.releaseObjectGroup" && mode === "release-lost") { throw new Error("lost release acknowledgment"); }
    if (command.method === "Debugger.resume") {
      resumes += 1; assert.ok(listener !== null); listener.resumed();
      if (ordinal < 3 && !removed.has(`point-${String((ordinal + 1) % 2)}`)) { const next = ordinal + 1; queueMicrotask(() => { emit(next); }); }
      if (mode === "resume-lost" && resumes === 1) { throw new Error("lost resume acknowledgment"); }
    }
    return {};
  };
  const transport: CurrentFootprintCopyCacheConstructionTransport = Object.freeze({
    assertOriginalWorker: (): Promise<void> => { assert.ok(listener !== undefined); return Promise.resolve(); },
    assertCleanup: (): void => { assert.ok(transport !== undefined); }, request,
    subscribe: (value: Parameters<CurrentFootprintCopyCacheConstructionTransport["subscribe"]>[0]): (() => void) => {
      assert.equal(listener, null); listener = value; return (): void => {
        if (mode === "unsubscribe-failed") { throw new Error("cache listener remains owned"); }
        listener = null;
      };
    },
  });
  return { runner: new CurrentFootprintCopyCacheConstructionRunner(transport, { scriptId: "script", projectObjectId: "project", projectUuid: "a".repeat(64) }), calls, emit,
    unblockMetadata: (): void => { metadataGate.resolve(null); }, metadataEntered: entered.promise,
    lost: (): void => { assert.ok(listener !== null); listener.lost(); } };
}

void test("registered original cache events consume33 requests through reproof and release, without native open dispatch", async () => {
  const f = fixture(); await f.runner.arm(); f.emit(0);
  const packet = await f.runner.result(); assert.equal(f.calls.length, 31); assert.equal(packet.originalNativeCacheResultsMatched, true);
  await assert.rejects(f.runner.requireOriginal({ ...packet })); assert.equal(f.calls.length, 31);
  await f.runner.requireOriginal(packet); await f.runner.release(); assert.equal(f.calls.length, 33);
  assert.equal(f.calls.filter(call => call.method === "Debugger.resume").length, 4);
  await assert.rejects(f.runner.arm()); await assert.rejects(f.runner.result()); await assert.rejects(f.runner.release());
});
void test("original cache pauses settle before the short peer receipt without consuming the later joined result", async () => {
  const cache = fixture("settlement-held"); await cache.runner.arm();
  const peer = peerFixture(); peer.state.continueParent = async (): Promise<void> => {
    const settled = cache.runner.waitOriginalCaptureComplete(); cache.emit(0); await settled;
  };
  const observing = peer.runner.observe(); await cache.metadataEntered;
  assert.equal(cache.runner.diagnostics().pauseCount, 1); assert.equal(cache.runner.diagnostics().captureComplete, false);
  assert.equal(peer.commands.some(command => command.phase === "childReceipt"), false);
  assert.equal(peer.runner.retained().completed, false);
  cache.unblockMetadata(); await observing;
  assert.equal(cache.runner.diagnostics().resumedPauses, 4); assert.equal(cache.runner.diagnostics().captureComplete, true);
  assert.equal(cache.calls.length, 30); assert.equal(cache.runner.retained()["observation"], null);
  const packet = await cache.runner.result(); assert.equal(cache.calls.length, 31);
  await cache.runner.requireOriginal(packet); await cache.runner.release(); await peer.runner.release();
  assert.equal(cache.calls.length, 33); await assert.rejects(cache.runner.waitOriginalCaptureComplete());
});
void test("relocated allocation retains its original breakpoint and cleanup never repeats arming", async () => {
  const f = fixture("relocated"); await assert.rejects(f.runner.arm()); await f.runner.cleanup();
  assert.deepEqual(f.calls.map(call => call.method), ["Debugger.setBreakpoint", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"]);
  await assert.rejects(f.runner.arm());
});
void test("cache pause routing uses only retained breakpoint IDs and never evaluates caller accessors", async () => {
  const f = fixture();
  assert.equal(f.runner.acceptsPause({ hitBreakpoints: ["point-0"] }), false);
  await f.runner.arm(); const beforeState = f.runner.retained();
  assert.equal(f.runner.acceptsPause({ hitBreakpoints: ["point-0"] }), true);
  assert.equal(f.runner.acceptsPause({ hitBreakpoints: ["point-1"] }), true);
  assert.equal(f.runner.acceptsPause({ hitBreakpoints: ["foreign"] }), false);
  let getterCalls = 0;
  const hostile = Object.defineProperty({}, "hitBreakpoints", { enumerable: true, get: () => { getterCalls += 1; return ["point-0"]; } });
  assert.equal(f.runner.acceptsPause(hostile), false); assert.equal(getterCalls, 0);
  assert.deepEqual(f.runner.retained(), beforeState);
  await f.runner.cleanup();
});
void test("lost resume acknowledgment retains a delivered next pause and prevents successful namespace evidence", async () => {
  const f = fixture("resume-lost"); await f.runner.arm(); f.emit(0); await assert.rejects(f.runner.result(), /lost resume acknowledgment/u);
  const failure = f.runner.diagnostics().firstFailure; assert.equal(failure?.step, "resume"); assert.equal(failure.code, "DEPENDENCY_OR_REPLY");
  assert.equal(JSON.stringify(f.runner.diagnostics()).includes("lost resume acknowledgment"), false);
  await f.runner.cleanup(); assert.equal(f.calls.filter(call => call.method === "Debugger.resume").length, 2);
  assert.equal(f.runner.retained()["observation"], null); assert.equal(f.runner.retained()["failed"], true);
  await assert.rejects(f.runner.waitOriginalCaptureComplete()); assert.equal(f.runner.diagnostics().firstFailure, failure);
});
void test("lost cache group release remains a cleanup failure without repeating the original release", async () => {
  const f = fixture("release-lost"); await f.runner.arm();
  await assert.rejects(f.runner.cleanup(), /CLEANUP_FAILED/u);
  await assert.rejects(f.runner.cleanup(), /CLEANUP_FAILED/u);
  assert.equal(f.calls.filter(call => call.method === "Runtime.releaseObjectGroup").length, 1);
  assert.equal(f.runner.retained()["released"], false);
});
void test("failed cache unsubscribe remains a cleanup failure without repeating release or resume", async () => {
  const f = fixture("unsubscribe-failed"); await f.runner.arm(); f.emit(0); await f.runner.result();
  await assert.rejects(f.runner.release(), /cache listener remains owned/u);
  const consumedCalls = [...f.calls];
  await assert.rejects(f.runner.cleanup(), /CLEANUP_FAILED/u);
  await assert.rejects(f.runner.cleanup(), /CLEANUP_FAILED/u);
  assert.deepEqual(f.calls, consumedCalls);
  assert.equal(f.calls.filter(call => call.method === "Runtime.releaseObjectGroup").length, 1);
  assert.equal(f.calls.filter(call => call.method === "Debugger.resume").length, 4);
  assert.equal(f.runner.retained()["releaseAttempted"], true); assert.equal(f.runner.retained()["released"], false);
  f.lost();
});

const before = (wrapper: string, ordinal: number, original: string): string => `(${CALLS.before.program}).call(${wrapper},path,${String(ordinal)},${original})`;

void test("fixed cache programs retain native getter/open identities and reject swapped namespace assignments", () => {
  const context = vm.createContext({});
  const setup = `let opened=0,getters=0;globalThis.Cache=class Cache{};globalThis.CacheStorage=class CacheStorage{};
Object.defineProperty(CacheStorage.prototype,'open',{value:function open(){opened++;throw Error('must-not-invoke');},enumerable:true,writable:true,configurable:true});
const nativeStorage=Object.create(CacheStorage.prototype);Object.defineProperty(globalThis,'caches',{get(){getters++;return nativeStorage},enumerable:true,configurable:true});
const bb=${SOURCES[0]},path='a'.repeat(64),first=new bb('project_'+path+'_v6'),second=new bb('localProject_'+path+'_v1');`;
  vm.runInContext(setup, context);
  vm.runInContext(`const p0=${before("first", 0, "null")};`, context); assert.equal(vm.runInContext("getters", context), 0);
  vm.runInContext(`const b0=(${CALLS.bind.program}).call(p0,path,0);first.cache=Object.create(Cache.prototype);const a0=(${CALLS.after.program}).call(first,b0,path,0);`, context);
  vm.runInContext(`const p1=${before("second", 1, "a0")};const b1=(${CALLS.bind.program}).call(p1,path,1);second.cache=Object.create(Cache.prototype);const a1=(${CALLS.after.program}).call(second,b1,path,1);globalThis.PROJECT={uuid:path,cache:first,localCache:second};`, context);
  assert.equal(vm.runInContext(`(${CALLS.join.program}).call(PROJECT,a0,a1,path)`, context), true);
  vm.runInContext("PROJECT.localCache=first", context);
  assert.throws(() => vm.runInContext(`(${CALLS.join.program}).call(PROJECT,a0,a1,path)`, context), /FOOTPRINT_CACHE_CONSTRUCTION/u);
  assert.equal(vm.runInContext("opened", context), 0);
});
