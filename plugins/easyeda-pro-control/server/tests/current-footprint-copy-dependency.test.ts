/* oxlint-disable import/max-dependencies -- This boundary test compares source fixtures, descriptors, runner and both old/new native wires in one focused suite. */
/** Synthetic descriptors and actual fixed selectors; never connected execution. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_CALLS as CALLS, decodeCurrentFootprintCopyDependencies,
  decodeCurrentFootprintCopyDependencyFunction } from "../src/current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as PROFILES } from "../src/current-footprint-copy-dependency-profiles.ts";
import { CurrentFootprintCopyDependencyRunner, currentFootprintCopyDependencyObservationSchema, recordedCurrentFootprintCopyDependencyObservationSchema } from "../src/current-footprint-copy-dependency-runner.ts";
import { CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES as DIRECT } from "../src/current-footprint-copy-producer-scope.ts";
import { currentFootprintCopyDependencyNativeCases, currentPcb209WorkerStartupNativeCases, currentPcbWorkerStartupNativeSource } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopyPreparationWire, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-dependency-fixture.ts";
import { FOOTPRINT_PRODUCER_SOURCE_FIXTURE as DIRECT_SOURCES } from "./helpers/current-footprint-copy-producer-fixture.ts";

import { footprintDependencyWorldSource } from "./helpers/current-footprint-copy-dependency-world.ts";

import { backendCacheArrayTail, backendCacheNativeMetadata } from "./helpers/current-footprint-copy-backend-cache-metadata.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
const yes = { result: { type: "boolean", value: true } };
function arrayReply(direct = false): Data {
  const profiles = direct ? DIRECT : PROFILES, sources = direct ? DIRECT_SOURCES : SOURCES;
  const result = profiles.map((entry, index) => property(String(index), { type: "function", className: entry.async ? "AsyncFunction" : "Function",
    description: sources[index], objectId: `${direct ? "direct" : "dependency"}-${String(index)}` }, true, true));
  if (direct) {
    result.push(...[7, 8].map(index => property(String(index), { type: "object", className: "Object", description: "Object", objectId: `enum-${String(index)}` }, true, true)),
      property("9", { type: "string", value: "|\n" }, true, true));
  } else {
    result.push(...backendCacheArrayTail());
  }
  result.push(property("length", { type: "number", value: direct ? 10 : 70 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
function functionReply(index: number, direct = false): Data {
  const profile = direct ? DIRECT[index] : PROFILES[index]; assert.ok(profile);
  const result = [property("length", { type: "number", value: profile.arity }), property("name", { type: "string", value: profile.name })];
  const isClass = "class" in profile ? profile.class : profile.kind === "class", method = "kind" in profile && profile.kind === "method";
  if (!profile.async && !method) { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, !isClass, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "script",
      lineNumber: "line" in profile ? profile.line : profile.lineNumber, columnNumber: "column" in profile ? profile.column : profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes-${String(index)}` } },
  ] };
}
function owner(): { runner: CurrentFootprintCopyDependencyRunner; calls: string[]; failFinal: () => void; loseAfterReply: () => void; refuseCapture: () => void } {
  const calls: string[] = []; let current = true, exception = false, lose = false, valid = true;
  const runner = new CurrentFootprintCopyDependencyRunner(Object.freeze({
    lexicalBundleObjectId: "lexicals", assertCurrent: (): void => { assert.ok(current, "owner lost"); },
    properties: (id: string): Promise<unknown> => {
      calls.push(id); if (lose) { current = false; }
      if (id === "lexicals" || id === "dependencies") { return Promise.resolve(arrayReply(id === "lexicals")); }
      if (id.startsWith("scopes-")) { return Promise.resolve({ result: ["Closure", "Global"].map((description, index) => property(String(index), {
        type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${String(index)}`,
      }, true, true)) }); }
      const index = Number(id.split("-")[1]);
      return Promise.resolve(id.startsWith("native-") ? backendCacheNativeMetadata(index) : functionReply(index, id.startsWith("direct-")));
    },
    capture: (scope: string): Promise<unknown> => {
      calls.push(`capture-${scope}`);
      return Promise.resolve(exception ? { result: { type: "undefined" }, exceptionDetails: { lineNumber: 12, columnNumber: 3,
        text: "private fixture details must remain in raw evidence" } } :
        { result: { type: "object", subtype: "array", className: "Array", description: "Array(70)", objectId: "dependencies" } });
    },
    recheck: (scope: string, bundle: string): Promise<unknown> => { calls.push(`recheck-${scope}`); assert.equal(bundle, "dependencies"); return Promise.resolve(valid ? yes : { result: { type: "boolean", value: false } }); },
  }), "script");
  return { runner, calls, failFinal: (): void => { valid = false; }, loseAfterReply: (): void => { lose = true; },
    refuseCapture: (): void => { exception = true; } };
}

void test("dependency profiles match complete pinned sources and JavaScript arities without invoking them", () => {
  assert.equal(decodeCurrentFootprintCopyDependencies(arrayReply()).length, 61);
  const context = vm.createContext({}), done = new Set<string>();
  function compile(index: number): void {
    const profile = PROFILES[index], source = SOURCES[index]; assert.ok(profile && source);
    if (done.has(profile.key)) { return; }
    if (profile.kind === "class" && profile.parent !== null) { compile(PROFILES.findIndex(item => item.key === profile.parent)); }
    const expression = profile.kind === "method" ? `({${source}})[${JSON.stringify(profile.name)}]` : `(${source})`;
    const declaration = profile.kind === "class" ? `const ${profile.key}=selected${String(index)};` : "";
    const arity: unknown = vm.runInContext(`const selected${String(index)}=${expression};${declaration}selected${String(index)}.length`, context);
    assert.equal(arity, profile.arity, profile.key); done.add(profile.key);
    decodeCurrentFootprintCopyDependencyFunction(functionReply(index), "script", index);
    assert.throws(() => decodeCurrentFootprintCopyDependencyFunction(functionReply(index), "other-script", index));
  }
  for (const index of PROFILES.keys()) { compile(index); }
  assert.equal(done.size, 61);
  const altered = arrayReply(); assert.ok(Array.isArray(altered["result"]));
  altered["result"][0] = property("0", { type: "function", className: "Function", description: "function wa(){}", objectId: "replacement" }, true, true);
  assert.throws(() => decodeCurrentFootprintCopyDependencies(altered));
});

function fixedWorld(): vm.Context {
  const context = vm.createContext({});
  vm.runInContext(footprintDependencyWorldSource(), context);
  return context;
}

void test("fixed dependency selectors retain original identities and refuse lazy bus creation, accessors and method shadows", () => {
  for (const change of ["", "delete globalThis['/tab/notify']", "scope.wa=function replacement(){}", "project.cache={}", "project.cache.cacheName='foreign'", "project.cache.cache=Object.create(Cache.prototype)",
    "project.localCache.cache=project.cache.cache", "project.cache.put=stop", "Cache.prototype.put=function other(){}", "scope.bb.prototype.put=function other(){}",
    "notification.rpcCall=function replacement(){}", "Object.defineProperty(scope,'oo',{get(){calls++;return stop;}})", "globalThis.EDITOR_TOP={}", "manager.user='changed'"]) {
    const context = fixedWorld();
    vm.runInContext(`const original=(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals);${change}`, context);
    const invoke = (): unknown => vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals,original)`, context);
    if (change === "") { assert.equal(invoke(), true); } else { assert.throws(invoke, /FOOTPRINT_COPY_DEPENDENCY_BINDING/u); }
    assert.equal(vm.runInContext("calls", context), 0);
    if (change.startsWith("delete")) { assert.equal(vm.runInContext("Object.hasOwn(globalThis,'/tab/notify')", context), false); }
  }
});
void test("dependency runner retains76 original reads, then one fresh3-request reproof without execution authority", async () => {
  const { runner, calls } = owner(), packet = await runner.observe();
  assert.equal(calls.length, 76); assert.equal(runner.retained().replies.length, 76);
  assert.deepEqual(calls.filter(id => id.startsWith("scopes-")), ["scopes-2", "scopes-4", "scopes-5"]);
  currentFootprintCopyDependencyObservationSchema.parse(packet); assert.equal(packet.executionAuthorized, false);
  await assert.rejects(runner.requireOriginal({ ...packet })); assert.equal(calls.length, 76);
  await runner.requireOriginal(packet); assert.equal(calls.length, 79);
  await assert.rejects(runner.requireOriginal(packet)); await assert.rejects(runner.observe()); assert.equal(calls.length, 79);
});
void test("dependency selectors retain original classes when V8 omits unused lexical aliases", () => {
  const context = fixedWorld();
  vm.runInContext('for(const key of ["Lg","Gd","Tg","ar","Pi","ja","Vc","zy","JP","KP","Mb","of","th","Fo"])delete scope[key];', context);
  vm.runInContext(`const original=(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals);`, context);
  assert.equal(vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals,original)`, context), true);
  assert.equal(vm.runInContext("calls", context), 0);
  // Only the original captured class can satisfy a later lexical alias.
  vm.runInContext("scope.Lg=function Lg(){};", context);
  assert.throws(() => vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals,original)`, context), /FOOTPRINT_COPY_DEPENDENCY_BINDING/u);
  assert.equal(vm.runInContext("calls", context), 0);
});
void test("dependency selectors reject changed original class vectors and derived encoder ancestry", () => {
  for (const change of [
    "constructors[6]=class Lg{}",
    "constructors[8]=class JP{}",
    "Object.setPrototypeOf(bus,Object.create(scope.JP.prototype))",
    "Object.setPrototypeOf(scope.rl,class of{})",
    "Object.defineProperty(scope,'Gd',{get(){calls++;return stop;}})",
  ]) {
    const context = fixedWorld();
    vm.runInContext(change, context);
    assert.throws(() => vm.runInContext(`(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals)`, context), /FOOTPRINT_COPY_DEPENDENCY_BINDING/u);
    assert.equal(vm.runInContext("calls", context), 0);
  }
});
void test("dependency selector qualifies native ja parser override and its separate zy super implementation", () => {
  const context = fixedWorld();
  assert.equal(vm.runInContext("Object.hasOwn(scope.ja.prototype,'parseFull')&&Object.hasOwn(scope.zy.prototype,'parseFull')&&!Object.hasOwn(scope.Vc.prototype,'parseFull')", context), true);
  vm.runInContext(`const original=(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals);`, context);
  assert.equal(vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals,original)`, context), true);
  for (const mutation of [
    "delete scope.ja.prototype.parseFull",
    "consistency.parseFull=stop",
    "Object.defineProperty(scope.Vc.prototype,'parseFull',{value:stop,writable:true,configurable:true})",
  ]) {
    const rejected = fixedWorld(); vm.runInContext(mutation, rejected);
    assert.throws(() => vm.runInContext(`(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals)`, rejected), /FOOTPRINT_COPY_DEPENDENCY_BINDING/u);
    assert.equal(vm.runInContext("calls", rejected), 0);
  }
  for (const ownerName of ["ja", "zy"]) {
    const changed = fixedWorld();
    vm.runInContext(`const original=(${CALLS.capture.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals);scope.${ownerName}.prototype.parseFull=function parseFull(){};`, changed);
    assert.throws(() => vm.runInContext(`(${CALLS.recheck.program}).call({object:scope},project,bus,manager,consistency,constructors,lexicals,original)`, changed), /FOOTPRINT_COPY_DEPENDENCY_BINDING/u);
  }
});
void test("dependency owner loss retains the arrived reply and failed reproof cannot retry", async () => {
  const lost = owner(); lost.loseAfterReply(); await assert.rejects(lost.runner.observe(), /owner lost/u);
  assert.equal(lost.runner.retained().replies.length, 1); assert.equal(lost.runner.retained().failed, true);
  const failed = owner(), packet = await failed.runner.observe(); failed.failFinal(); await assert.rejects(failed.runner.requireOriginal(packet));
  assert.equal(failed.runner.retained().requests, 79); assert.equal(failed.runner.retained().failed, true);
  await assert.rejects(failed.runner.requireOriginal(packet)); assert.equal(failed.calls.length, 79);
});
void test("dependency inspector exception retains full raw evidence before fixed diagnostic and cannot redispatch", async () => {
  const value = owner(); value.refuseCapture();
  await assert.rejects(value.runner.observe(), { message: "FOOTPRINT_COPY_INSPECTOR_EXCEPTION:dependencies:13:4" });
  const retained = value.runner.retained();
  assert.equal(retained.failed, true); assert.equal(retained.completed, false); assert.equal(retained.requests, 4);
  assert.equal(JSON.stringify(retained.replies.at(-1)), JSON.stringify({ result: { type: "undefined" },
    exceptionDetails: { lineNumber: 12, columnNumber: 3, text: "private fixture details must remain in raw evidence" } }));
  const calls = value.calls.length;
  await assert.rejects(value.runner.observe()); assert.equal(value.calls.length, calls);
  assert.equal(value.runner.retained().replies.length, 4);
});

void test("recorded dependency observations preserve exact historical53 without admitting them as current61 evidence", async () => {
  const value = owner(); const packet = await value.runner.observe();
  const newFields = ["cacheWrapperFunctionsQualified", "cacheWrapperNamespaceNamesMatched", "originalNativeCacheReceiverCandidatesRetained",
    "nativeCacheFunctionsQualified", "nativeCacheNamespaceProvenanceVerified", "nativeParserOverrideQualified"];
  const historical = { ...Object.fromEntries(Object.entries(packet).filter(([name]) => !newFields.includes(name))), selectedFunctionCount: 53 };
  assert.deepEqual(recordedCurrentFootprintCopyDependencyObservationSchema.parse(historical), historical);
  assert.deepEqual(recordedCurrentFootprintCopyDependencyObservationSchema.parse(packet), packet);
  const historicalCache = { ...Object.fromEntries(Object.entries(packet).filter(([name]) => name !== "nativeParserOverrideQualified")), selectedFunctionCount: 60 };
  assert.deepEqual(recordedCurrentFootprintCopyDependencyObservationSchema.parse(historicalCache), historicalCache);
  assert.equal(currentFootprintCopyDependencyObservationSchema.safeParse(historicalCache).success, false);
  assert.equal(currentFootprintCopyDependencyObservationSchema.safeParse(historical).success, false);
  for (const field of newFields) {
    assert.equal(recordedCurrentFootprintCopyDependencyObservationSchema.safeParse({ ...historical, [field]: true }).success, false);
    const missing = Object.fromEntries(Object.entries(packet).filter(([name]) => name !== field));
    assert.equal(recordedCurrentFootprintCopyDependencyObservationSchema.safeParse(missing).success, false);
  }
  assert.equal(recordedCurrentFootprintCopyDependencyObservationSchema.safeParse({ ...packet, selectedFunctionCount: 53 }).success, false);
  assert.equal(recordedCurrentFootprintCopyDependencyObservationSchema.safeParse({ ...packet, nativeCacheNamespaceProvenanceVerified: true }).success, false);
  await assert.rejects(value.runner.requireOriginal(currentFootprintCopyDependencyObservationSchema.parse(packet)));
  assert.equal(value.calls.length, 76);
});
void test("dependency commands exist only in preparation wire while native generation preserves old case parity", () => {
  for (const [index, command] of currentFootprintCopyDependencyNativeCases().entries()) {
    assert.throws(() => currentPcbWorkerStartupWire(command, 1)); assert.throws(() => currentPcb209WorkerStartupWire(command, 1));
    const encoded = currentFootprintCopyPreparationWire(command, 497);
    assert.equal(encoded.request["startupPhase"], index === 0 ? "footprint-dependency-capture" : "footprint-dependency-recheck");
    assert.equal(Object.hasOwn(encoded.request, "argument6"), index === 1);
  }
  for (const command of currentPcb209WorkerStartupNativeCases()) { currentPcb209WorkerStartupWire(command, 1); }
  const native = currentPcbWorkerStartupNativeSource(); assert.ok(native.includes('phase==@"footprint-dependency-capture"'));
  assert.ok(native.includes('phase==@"footprint-dependency-recheck"'));
});
