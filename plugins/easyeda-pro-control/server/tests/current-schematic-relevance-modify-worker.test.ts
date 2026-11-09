/* oxlint-disable max-classes-per-file, class-methods-use-this, typescript/no-extraneous-class -- Inert class inheritance and throwing methods test exact receiver/prototype associations without application execution. */
/** Inert models and local Inspector reads only. They issue no worker owner,
 * registered callback receiver, trusted delivery or Modify/Save proof. */
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { createContext, runInContext, runInThisContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as P } from "../src/current-schematic-relevance-modify-worker-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyWorkerCommand as validate } from "../src/current-schematic-relevance-modify-worker-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyWorkerFunction as qualifyFunction, qualifyCurrentSchematicRelevanceModifyWorkerSource as source, currentSchematicRelevanceModifyWorkerScript as sourceScript } from "../src/current-schematic-relevance-modify-worker-replies.ts";

function run(program: string, receiver: unknown, args: readonly unknown[]): unknown { const fn: unknown = runInThisContext(`(${program})`); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); }
/** Build an inert worker PROJECT/bus/task graph with real native intrinsics
 * and counted callbacks, so descriptor joins can prove no callback executed. */
function model(): { readonly intrinsics: readonly unknown[]; readonly root: Record<string, unknown>; readonly project: Record<string, unknown>; readonly bus: Record<string, unknown>; readonly known: readonly unknown[]; readonly task: object; readonly callback: () => void; readonly calls: () => number } {
  let calls = 0; const callback = (): void => { calls += 1; };
  class Mb {} class KP extends Mb { public onReceivedPublish(): void { calls += 1; } } class JP extends KP { [key: string]: unknown; public onMessage(): void { calls += 1; } } class Lg { [key: string]: unknown; } class Task { public callback = callback; public unsafe = true; public isRunning = true; public running(): void { calls += 1; } public execute(): void { calls += 1; } }
  const task = new Task(); const subscribed = { "/pro-mgr/worker/batchPendData": [task] }; const bus = Object.assign(new JP(), { bc: {}, subscribed }); const project = Object.assign(new Lg(), { workerBus: bus });
  const root: Record<string, unknown> = { PROJECT: project, Object, Array, Function, _TAB_ID_: "tab", "/tab/project/original": bus };
  const apply: unknown = Object.getOwnPropertyDescriptor(Function.prototype, "apply")?.value;
  const intrinsics = [Object.getOwnPropertyDescriptor, Object.getPrototypeOf, Object.hasOwn, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Array.isArray, apply, Object.prototype, Array.prototype, Function.prototype, root];
  return { intrinsics, root, project, bus, task, callback, calls: (): number => calls, known: [root, project, bus, task, subscribed, subscribed["/pro-mgr/worker/batchPendData"], bus.bc, JP.prototype, KP.prototype, Mb.prototype, Lg.prototype, Task.prototype, JP, KP, Mb, Lg, Task, Object.prototype, Array.prototype, Function.prototype] };
}
void test("actual own PROJECT/bus/task roster and closed class/method references are required without invoking callbacks", () => {
  const m = model(), project = run(P.project, m.intrinsics, [m.project, m.known]); assert.ok(Array.isArray(project));
  const bus = run(P.bus, m.intrinsics, [project, m.known]); const sub = run(P.subscription, m.intrinsics, [bus, m.known]); const task = run(P.task, m.intrinsics, [sub, m.known]); const functions = run(P.functions, m.intrinsics, [project, bus, task, m.known]);
  assert.ok(Array.isArray(functions)); assert.equal(functions[6], m.callback); const originalFunctions: readonly unknown[] = functions; const known = [...m.known, ...originalFunctions]; assert.equal(run(P.bindings, m.intrinsics, [project, bus, task, functions, known]), true); assert.equal(m.calls(), 0);
  m.root["PROJECT"] = {}; assert.throws(() => run(P.project, m.intrinsics, [m.project, known])); m.root["PROJECT"] = m.project;
  assert.throws(() => run(P.task, m.intrinsics, [[[m.task, m.task]], known])); Object.defineProperty(m.bus, "onMessage", { configurable: true, get(): never { throw new Error("application getter must stay uncalled"); } }); assert.throws(() => run(P.functions, m.intrinsics, [project, bus, task, known])); assert.equal(m.calls(), 0);
});
void test("native-name and registered-handler reads have distinct fixed roles, while Event/data accessors remain uninvoked", () => {
  const m = model(); const bus = [m.bus, {}, {}]; let handler: unknown = m.callback, nativeGets = 0;
  const name = (): string => { nativeGets += 1; return "/tab/project/original"; }; const getHandler = (): unknown => { nativeGets += 1; return handler; };
  const members: unknown[] = [name, getHandler, ...Array.from({ length: 9 }, () => (): never => { throw new Error("event getter must stay uncalled"); })];
  assert.equal(run(P.channel, m.intrinsics, [bus, members, m.known]), "/tab/project/original"); const registered = run(P.handler, m.intrinsics, [bus, members]); assert.deepEqual(registered, [m.callback]); assert.equal(run(P.handlerSame, m.intrinsics, [bus, members, registered]), true); assert.equal(nativeGets, 3); assert.equal(m.calls(), 0);
  handler = name; assert.throws(() => run(P.handlerSame, m.intrinsics, [bus, members, registered])); m.root["/tab/project/original"] = {}; assert.throws(() => run(P.channel, m.intrinsics, [bus, members, m.known]));
});
void test("complete descriptor snapshots preserve unknown accessors, symbols and SameValue differences", () => {
  const m = model(); let getters = 0; const symbol = Symbol("unknown"); Object.defineProperty(m.project, symbol, { value: -0, configurable: true }); Object.defineProperty(m.project, "unknown", { get(): never { getters += 1; throw new Error("must not run"); } });
  const before = run(P.snapshot, m.intrinsics, [m.known]); assert.equal(run(P.same, m.intrinsics, [before, m.known]), true); assert.equal(getters, 0);
  Object.defineProperty(m.project, symbol, { value: 0 }); assert.throws(() => run(P.same, m.intrinsics, [before, m.known])); assert.equal(getters, 0);
});
void test("the finite own7 vocabulary rejects controls, caller programs, changed flags and premature event reads", () => {
  assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.helpers, REQUESTS.reads); assert.equal(new Set(CALLS.map(row => row[0])).size, CALLS.length);
  for (const row of CALLS) { assert.ok(row[1].length <= 16_384); const command = { phase: "modify-worker-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original" })), returnByValue: row[3], awaitPromise: false, userGesture: false } }; assert.deepEqual(validate(command), command); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } })); assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){return this.data;}" } })); }
  for (const method of ["Debugger.resume", "Debugger.setBreakpoint", "Runtime.getEventData"]) { assert.throws(() => validate({ phase: "modify-worker-control", method, params: {} })); }
  assert.equal(SOURCE.roles.handler.bytes, 27); assert.equal(SOURCE.roles.batch.start, 2_112_964); assert.equal(SOURCE.roles.batch.end, 2_113_127); assert.throws(() => { source("caller worker source"); });
});
void test("actual local Inspector snapshot/reproof programs retain throwOnSideEffect and invoke no application getter", async () => {
  const m = model(); Object.defineProperty(globalThis, "__modifyWorkerInert", { configurable: true, value: [m.intrinsics, m.known] }); const inspector = new Session(); inspector.connect();
  try {
    const root = await inspector.post("Runtime.evaluate", { expression: "globalThis.__modifyWorkerInert", objectGroup: "modify-worker-inert" }); assert.ok(root.result.objectId !== undefined); const fields = await inspector.post("Runtime.getProperties", { objectId: root.result.objectId, ownProperties: true });
    const ids = [0, 1].map(index => { const id = fields.result.find(row => row.name === String(index))?.value?.objectId; assert.ok(id !== undefined); return id; }); const known = ids[1], receiver = ids[0]; assert.ok(receiver !== undefined && known !== undefined); const flags = { throwOnSideEffect: true } as const;
    const parameters: Runtime.CallFunctionOnParameterType = { objectId: receiver, functionDeclaration: P.snapshot, arguments: [{ objectId: known }], returnByValue: false, ...flags }; const snapshot = await inspector.post("Runtime.callFunctionOn", parameters); assert.equal(snapshot.exceptionDetails, undefined); assert.ok(snapshot.result.objectId !== undefined);
    const check: Runtime.CallFunctionOnParameterType = { objectId: receiver, functionDeclaration: P.same, arguments: [{ objectId: snapshot.result.objectId }, { objectId: known }], returnByValue: true, ...flags }; const result = await inspector.post("Runtime.callFunctionOn", check); assert.equal(result.exceptionDetails, undefined); assert.equal(result.result.value, true); assert.equal(m.calls(), 0);
  } finally { await inspector.post("Runtime.releaseObjectGroup", { objectGroup: "modify-worker-inert" }); inspector.disconnect(); Reflect.deleteProperty(globalThis, "__modifyWorkerInert"); }
});

void test("fresh descriptor output refuses inherited numeric setters before any application hook", () => {
  const context = createContext({});
  runInContext('var hits=0;var native=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,this];var qualified=[{a:1}];Object.defineProperty(Array.prototype,"0",{set(){hits++},configurable:true})', context);
  assert.throws(() => runInContext(`(${P.snapshot}).call(native,qualified)`, context)); assert.equal(runInContext("hits", context), 0);
});

void test("the exact JP constructor creates an anonymous registered handler with source-bound metadata", async context => {
  const text = await readConfiguredEasyedaAsset("pro-mgr/3.2.185.bf63a159/js/project-worker.js");
  if (text === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } source(text);
  const inspector = new Session(); inspector.connect(); let contextId: number | null = null;
  inspector.on("Runtime.executionContextCreated", event => { if (event.params.context.name === "inert-original-jp-handler") { contextId = event.params.context.id; } });
  try {
    await inspector.post("Runtime.enable");
    const realm = createContext({}, { name: "inert-original-jp-handler" });
    const prelude = 'class KP{constructor(id){this.uuid=id}}class BroadcastChannel{}';
    const constructor = SOURCE.roles.channelConstructor;
    const prefix = `${prelude}${" ".repeat(constructor.start - prelude.length - "var JP=".length)}var JP=`;
    runInContext(`${prefix}${text.slice(constructor.start, constructor.end)};var handler=new JP("inert-channel","inert-uuid").bc.onmessage;`, realm);
    assert.ok(contextId !== null);
    const parameters: Runtime.EvaluateParameterType & Readonly<{ throwOnSideEffect: true }> = { expression: "handler", contextId, returnByValue: false, throwOnSideEffect: true };
    const actual = await inspector.post("Runtime.evaluate", parameters);
    assert.equal(actual.exceptionDetails, undefined); assert.ok(actual.result.objectId !== undefined);
    if (actual.result.type !== "function") { assert.fail("the original constructor must return a callable handler"); }
    const remote: Parameters<typeof qualifyFunction>[1] = { ...actual.result, type: actual.result.type };
    const metadata = await inspector.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.equal(metadata.result.find(row => row.name === "name")?.value?.value, "");
    qualifyFunction(metadata, remote, "handler", sourceScript(metadata));
    const mislabeled = { ...metadata, result: metadata.result.map(row => row.name === "name" ? { ...row, value: { ...row.value, type: "string", value: "JP.bc.onmessage" } } : row) };
    assert.throws(() => { qualifyFunction(mislabeled, remote, "handler", sourceScript(metadata)); });
  } finally { inspector.disconnect(); }
});
