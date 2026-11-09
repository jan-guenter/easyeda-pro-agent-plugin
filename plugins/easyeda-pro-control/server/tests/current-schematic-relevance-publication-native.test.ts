/** Inert/source tests only. Local Inspector execution supplies no embedded
 * EasyEDA pause, original native owner, sender or publication proof. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { runInThisContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_PROGRAMS as P } from "../src/current-schematic-relevance-publication-native-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_REQUESTS as REQUESTS, validateCurrentSchematicRelevancePublicationNativeCommand as validate } from "../src/current-schematic-relevance-publication-native-protocol.ts";
import { qualifyCurrentSchematicRelevancePublicationNativeFunction as nativeFunction, currentSchematicRelevancePublicationNativeOrigin as origin, currentSchematicRelevancePublicationNativeProperties as properties, currentSchematicRelevancePublicationNativeRecord as record } from "../src/current-schematic-relevance-publication-native-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as SAME, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as SNAPSHOT } from "../src/current-schematic-relevance-publication-snapshot-programs.ts";

/** Require an own data descriptor and return its value without invoking an
 * accessor while assembling hostile fixture mutations. */
function own(object: object, key: string): unknown { const descriptor = Object.getOwnPropertyDescriptor(object, key); assert.ok(descriptor !== undefined && Object.hasOwn(descriptor, "value")); return descriptor.value as unknown; }
function run(program: string, receiver: unknown, args: readonly unknown[]): unknown { const fn: unknown = runInThisContext(`(${program})`); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); }
/** Construct an inert publisher/bus prototype graph and counted methods.
 * Retained links and state support drift checks without application effects. */
function fixture(): { readonly raw: readonly unknown[]; readonly known: unknown[]; readonly publisher: Record<string, unknown>; readonly bus: Record<string, unknown>; readonly topic: string; readonly links: readonly unknown[]; readonly state: readonly unknown[]; readonly calls: () => number } {
  let calls = 0;
  const broadcastPublish = (): void => { calls += 1; }; const onMessage = (): void => { calls += 1; }; const onReceivedPublish = (): void => { calls += 1; }; const post = (): void => { calls += 1; }; const publish = (): void => { calls += 1; };
  const base = { publish, onReceivedPublish }, parent = { broadcastPublish, post, onMessage }; Object.setPrototypeOf(parent, base);
  const bc = {}, pulled = {}, pushed = {}, subscribed = {};
  const bus: Record<string, unknown> = { subscribed, pushed, pulled, bc }; Object.setPrototypeOf(bus, parent);
  const topic = "/pro-mgr/worker/batchPendData", topics = { pushPend: topic }; const compiler = {}; const publisher = { dataBus: bus, channel: compiler, windowId: "original-window", path: "original-project" };
  const raw: unknown[] = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is, Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray]; raw[15] = Object.prototype; raw[16] = Array.prototype;
  return { raw, known: [publisher, bus, parent, base, topics, subscribed, pushed, pulled, bc, compiler, Object.prototype], publisher, bus, topic, links: [{}, {}, publisher, {}], state: [{}, {}, {}, [], bus, compiler, topics], calls: (): number => calls };
}
void test("held publisher receiver and selected bus chain reject drift and inherited target subscriptions without invoking application bodies", () => {
  const f = fixture(), roots = run(P.roots, [f.publisher], [f.raw, f.known, f.links, f.state]); assert.ok(Array.isArray(roots)); assert.equal(roots[7], "/original-window/project/original-project"); assert.equal(typeof f.publisher["channel"], "object");
  const methods = run(P.methods, roots, [f.raw, f.known]); assert.ok(Array.isArray(methods)); assert.equal(methods.length, 5); assert.equal(run(P.subscriptions, roots, [f.raw, f.known]), true); assert.equal(f.calls(), 0);
  assert.throws(() => run(P.roots, [{}], [f.raw, f.known, f.links, f.state]));
  let getters = 0; const inherited: unknown = Object.create(null); assert.ok(typeof inherited === "object" && inherited !== null); Object.defineProperty(inherited, f.topic, { get(): never { getters += 1; throw new Error("inherited handler must stay uncalled"); } });
  const subscribed: unknown = f.bus["subscribed"]; assert.ok(typeof subscribed === "object" && subscribed !== null); Object.setPrototypeOf(subscribed, inherited); f.known.push(inherited);
  assert.throws(() => run(P.subscriptions, roots, [f.raw, f.known])); assert.equal(getters, 0);
  Object.setPrototypeOf(subscribed, Object.prototype); Object.defineProperty(subscribed, f.topic, { value: [], configurable: true }); assert.throws(() => run(P.subscriptions, roots, [f.raw, f.known]));
  Reflect.deleteProperty(subscribed, f.topic); assert.equal(run(P.subscriptions, roots, [f.raw, f.known]), true);
  Object.defineProperty(f.bus, "post", { get(): never { getters += 1; throw new Error("method accessor must stay uncalled"); } }); assert.throws(() => run(P.methods, roots, [f.raw, f.known])); assert.equal(getters, 0); assert.equal(f.calls(), 0);
});
void test("native bus naming derives from the initialized publisher factory and never coerces its compiler channel or path", () => {
 const f=fixture();let hooks=0;const compiler=f.publisher["channel"];assert.ok(compiler!==null&&typeof compiler==="object");Object.defineProperty(compiler,"toString",{value:():never=>{hooks+=1;throw new Error("compiler is not a name");}});
 const roots=run(P.roots,[f.publisher],[f.raw,f.known,f.links,f.state]);assert.ok(Array.isArray(roots));assert.equal(roots[7],"/original-window/project/original-project");assert.equal(hooks,0);
 const fieldGetter=():never=>{hooks+=1;throw new Error("field getter");};
 for(const field of["windowId","path"]){const before=Object.getOwnPropertyDescriptor(f.publisher,field);assert.ok(before!==undefined);try{Object.defineProperty(f.publisher,field,{get:fieldGetter,configurable:true});assert.throws(()=>run(P.roots,[f.publisher],[f.raw,f.known,f.links,f.state]));}finally{Object.defineProperty(f.publisher,field,before);}}
 const path=f.publisher["path"];f.publisher["path"]=new Proxy({}, {get():never{hooks+=1;throw new Error("no coercion");}});assert.throws(()=>run(P.roots,[f.publisher],[f.raw,f.known,f.links,f.state]));f.publisher["path"]=path;assert.equal(hooks,0);
});
void test("complete record waves retain unknown data, symbols and accessor identities without calling getters", () => {
  const f = fixture(), roots = run(P.roots, [f.publisher], [f.raw, f.known, f.links, f.state]); assert.ok(Array.isArray(roots));
  let getters = 0; const getter = (): never => { getters += 1; throw new Error("record getter must stay uncalled"); }; const opaque = { unknown: "retained" }, symbol = Symbol("unknown");
  const store: unknown = roots[4]; assert.ok(typeof store === "object" && store !== null); Object.defineProperty(store, "unknown-field", { value: opaque }); Object.defineProperty(store, symbol, { get: getter });
  const stores = run(P.stores, roots, [f.raw, f.known]); assert.ok(Array.isArray(stores)); const wave = run(P.records, stores, [f.raw, f.known]); assert.deepEqual(wave, [opaque, getter]); assert.equal(getters, 0);
  f.known.push(opaque, getter); const final = run(P.records, wave, [f.raw, f.known]); assert.deepEqual(final, []); assert.equal(getters, 0);
  assert.throws(() => run(P.records, [{}], [f.raw, f.known]));
});
void test("all fixed call rows have strict readonly schemas and reject changed code, arguments, effect flags and controls", () => {
  assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.helpers, REQUESTS.reads); assert.equal(REQUESTS.total, REQUESTS.reads * 2); assert.equal(new Set(CALLS.map(row => row[0])).size, CALLS.length);
  for (const row of CALLS) {
    const command = { phase: "publication-native-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original" })), returnByValue: row[3], awaitPromise: false, userGesture: false } };
    assert.deepEqual(validate(command), command); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } })); assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){this.postMessage({});}" } })); assert.throws(() => validate({ ...command, params: { ...command.params, arguments: [...command.params.arguments, { objectId: "extra" }] } }));
  }
  assert.throws(() => validate({ phase: "publication-native-resume", method: "Debugger.resume", params: {} })); assert.throws(() => validate({ phase: "publication-native-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original", expression: "[this.dataBus]", returnByValue: false, includeCommandLineAPI: false } }));
  assert.throws(() => { nativeFunction({}, { type: "function", className: "Function", description: "function renamed() { [native code] }", objectId: "foreign" }, 3); });
  assert.throws(() => { origin({ result: { type: "string", value: "https://foreign" } }); }); origin({ result: { type: "string", value: "https://client" } });
});
void test("same original realm and Promise references are mandatory, while stable dependency snapshots exclude pending-state deltas", () => {
  const f = fixture(), roots = run(P.roots, [f.publisher], [f.raw, f.known, f.links, f.state]); assert.ok(Array.isArray(roots));
  function BC(): void { assert.equal(f.calls(), -1); } const debug = own(console, "debug"), promisePrototype = own(Promise, "prototype"); assert.ok(typeof promisePrototype === "object" && promisePrototype !== null); const resolve = own(Promise, "resolve"), then = own(promisePrototype, "then"); const consoleObject = { debug }, realm = { Promise, BroadcastChannel: BC, console: consoleObject };
  f.known.push(BC, Promise, consoleObject, realm); const raw = Array.from({ length: 19 }, (_value, index) => f.raw[index]);
  const reflection = [Object.getOwnPropertyDescriptor, Object.getPrototypeOf, Object.hasOwn, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Array.isArray, own(Function.prototype, "apply"), Object.prototype, Array.prototype, Function.prototype, realm];
  const globals = [JSON, Promise, setTimeout, clearTimeout, consoleObject, BC, Object, Array], members = [JSON.stringify, JSON.parse, debug, promisePrototype, Object.prototype, Array.prototype];
  const nativeMembers = Array.from({ length: 24 }, () => undefined as unknown), nativeRoots = Array.from({ length: 20 }, () => undefined as unknown); nativeRoots[4] = Promise; nativeMembers[10] = resolve; nativeMembers[11] = then; nativeMembers[21] = promisePrototype;
  const actual = run(P.nativeRoots, reflection, [raw, globals, members, nativeRoots, nativeMembers, f.known, realm]); assert.ok(Array.isArray(actual)); assert.equal(actual[3], Promise); assert.equal(actual[5], resolve); assert.equal(actual[6], then); assert.equal(actual[8], debug);
  assert.throws(() => run(P.nativeRoots, reflection, [raw, globals, members, nativeRoots, nativeMembers, f.known, {}])); nativeMembers[10] = BC; assert.throws(() => run(P.nativeRoots, reflection, [raw, globals, members, nativeRoots, nativeMembers, f.known, realm]));
  const dependencies = run(P.dependencies, roots, [raw, f.known, actual]), snapshot = run(SNAPSHOT, dependencies, [raw]); f.publisher["pendCache"] = { newlyPending: true }; f.publisher["pendTimer"] = 1;
  assert.equal(run(SAME, snapshot, [raw, dependencies]), true); f.bus["post"] = BC; assert.throws(() => run(SAME, snapshot, [raw, dependencies]));
});
void test("unknown bound callbacks retain complete metadata while Proxy and internal-slot record state refuse before traversal", () => {
  const metadata = { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "functionPrototype" } }, { name: "[[TargetFunction]]", value: { type: "function", className: "Function", objectId: "unknownCallback" } }, { name: "[[BoundThis]]", value: { type: "object", objectId: "unknownReceiver" } }, { name: "[[BoundArgs]]", value: { type: "object", subtype: "array", objectId: "completeBoundArgs" } }] };
  assert.deepEqual(properties(metadata), metadata); record(metadata, { type: "function", objectId: "boundCallback" });
  assert.throws(() => { record({ result: [], internalProperties: [{ name: "[[Entries]]", value: { type: "object", objectId: "entries" } }] }, { type: "object", subtype: "map", objectId: "unknownMap" }); });
  assert.throws(() => properties({ result: [], internalProperties: [{ name: "[[Target]]", value: { type: "object", objectId: "proxyTarget" } }] }));
  let traps = 0; assert.throws(() => properties(new Proxy({}, { ownKeys(): never { traps += 1; throw new Error("must stay opaque"); } }))); assert.equal(traps, 0);
});
void test("local Inspector executes actual descriptor-only programs with throwOnSideEffect enabled", async () => {
  const f = fixture(), roots = run(P.roots, [f.publisher], [f.raw, f.known, f.links, f.state]); assert.ok(Array.isArray(roots));
  Object.defineProperty(globalThis, "__publicationNativeInert", { configurable: true, value: [roots, f.raw, f.known] }); const inspector = new Session(); inspector.connect();
  try {
    const result = await inspector.post("Runtime.evaluate", { expression: "globalThis.__publicationNativeInert", objectGroup: "publication-native-inert" }); assert.ok(result.result.objectId !== undefined);
    const values = await inspector.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true });
    const handles = [0, 1, 2].map(index => { const objectId = values.result.find(row => row.name === String(index))?.value?.objectId; assert.ok(objectId !== undefined); return { objectId }; }); const receiver = handles[0]; assert.ok(receiver !== undefined);
    for (const [program, byValue] of [[P.methods, false], [P.subscriptions, true], [P.stores, false]] as const) {
      const effectCheck = { throwOnSideEffect: true } as const;
      const parameters: Runtime.CallFunctionOnParameterType = { objectId: receiver.objectId, functionDeclaration: program, arguments: handles.slice(1), returnByValue: byValue, ...effectCheck };
      const reply = await inspector.post("Runtime.callFunctionOn", parameters); assert.equal(reply.exceptionDetails, undefined);
    }
    assert.equal(f.calls(), 0);
  } finally { await inspector.post("Runtime.releaseObjectGroup", { objectGroup: "publication-native-inert" }); inspector.disconnect(); Reflect.deleteProperty(globalThis, "__publicationNativeInert"); }
});
