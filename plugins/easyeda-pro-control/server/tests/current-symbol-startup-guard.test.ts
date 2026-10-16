import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentSymbolStartupGuard } from "../src/current-symbol-startup-guard.ts";
import { assertCurrentSymbolWriterStartup, buildCurrentSymbolStartupObservation, decodeCurrentSymbolStartupObservation, revalidateCurrentSymbolWriterStartup } from "../src/current-symbol-startup-runtime.ts";
import type { CurrentProjectOnlySymbolGeneration } from "../src/current-symbol-baseline-runtime.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) };
const expectation = { sheetUuids: ["c".repeat(16)], templates: [{ uuid: "d".repeat(16), docType: 2 as const, partId: "sole-part" }] };
function fixture(setup = ""): { run: () => unknown; evaluate: (source: string) => unknown } {
  const context = createContext({});
  runInContext(`globalThis.target=${JSON.stringify(target)};globalThis.startupExpected=${JSON.stringify(expectation)};globalThis.reads=0;
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.runner={_currentAction:null};runner.realTimeSyncActionManager={transactionRunner:runner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1}};
globalThis.manager={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner:runner},get docMemoryManager(){return manager;}};
globalThis.doc={uuid:startupExpected.templates[0].uuid,docType:2,path:target.projectUuid,project_uuid:target.projectUuid,projectMgr};
globalThis.part={partId:'sole-part'};globalThis.shapes={docManager:doc,_parts:[part],_partIdMap:{'sole-part':part}};doc.shapeManager=shapes;
Object.defineProperty(shapes,'parts',{get(){reads++;throw new Error('SIDE_EFFECTING_PARTS_GETTER');}});
globalThis.nativeBase={uuid:doc.uuid,path:target.projectUuid,isProject:true,isInit:true,isInitIng:false,isDestroy:false,pendTimer:null,pendPromise:null,pendCacheLength:0,pendCache:{}};
globalThis.consistency={docManager:doc,manager:{base:nativeBase}};doc.consistencyImpl=consistency;
globalThis.handler={consistencyImpl:consistency,_state:'initialized',isPaused:false,docUpdateImpl:{taskMap:new Map()}};
handler._realTimeSyncTask={handler,shouldCommitModelChanged:false,existLocalSaved:false,existRemoteSaved:false,_parentChildIdMapFromRemote:new Map()};consistency.handler=handler;consistency.decodeAndRealTimeSyncHandler=handler;
projectMgr.componentCache.symbolTemplate[doc.uuid]=doc;
${setup}`, context, { timeout: 1000 });
  return { run: (): unknown => runInContext(`(()=>{const root=globalThis,apply=Reflect.apply,projectOnly={check(){}};
const bad=()=>{throw new Error('REFUSED');};const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
${buildCurrentSymbolStartupGuard()}
globalThis.recheck=startup.check;startup.check();return true;})()`, context, { timeout: 1000 }) as unknown,
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }

void test("startup guard reads exact hidden template holders without invoking sorting getters or operations", () => {
  const env = fixture(); assert.equal(env.run(), true); assert.equal(env.evaluate("reads"), 0);
  assert.equal(env.evaluate("recheck()"), undefined); assert.equal(env.evaluate("reads"), 0);
});

void test("startup guard refuses linked-page leftovers, pending init/updates, altered parts and foreign templates", () => {
  for (const setup of ["manager.docMap.set('page',{});", "manager._docFetchPromiseMap.set('page',Promise.resolve());",
    "handler._state='willInitialized';", "handler.isPaused=true;", "nativeBase.isInitIng=true;", "nativeBase.isDestroy=true;",
    "nativeBase.pendPromise=Promise.resolve();", "nativeBase.pendTimer=1;", "nativeBase.pendCacheLength=1;", "nativeBase.pendCache.x=[];",
    "handler.docUpdateImpl.taskMap.set('task',()=>{});", "handler._realTimeSyncTask.existLocalSaved=true;",
    "handler._realTimeSyncTask._parentChildIdMapFromRemote.set('x',new Set());", "part.partId='other';", "shapes._parts.push({});",
    "projectMgr.componentCache.symbolTemplate.other={};", "doc._canvas={};", "runner._currentAction={};",
    "runner.realTimeSyncActionManager._runnerSet._idMap.set('x',{});", "runner.realTimeSyncActionManager._runTimer._mark=1;"]) {
    assert.throws(() => fixture(setup).run(), /REFUSED/u, setup);
  }
});

void test("startup guard re-proves all retained manager, pending-map and part receiver identities", () => {
  for (const drift of ["manager.docMap=new Map();", "nativeBase.pendCache={};", "handler.docUpdateImpl.taskMap=new Map();",
    "handler._realTimeSyncTask._parentChildIdMapFromRemote=new Map();", "runner.realTimeSyncActionManager._runnerSet._idMap=new Map();",
    "shapes._parts=[part];", "Object.defineProperty(SCH,'docMemoryManager',{get(){return manager;}});"]) {
    const env = fixture(); env.run(); env.evaluate(drift); assert.throws(() => env.evaluate("recheck()"), /REFUSED/u, drift);
  }
});

void test("startup reply is exact, bounded, target-bound and never grants execution", () => {
  const value = { profile: "private.current-symbol-startup-observation.v1", ...target, ...expectation, executionAuthorized: false };
  decodeCurrentSymbolStartupObservation(reply(encodeExactReadEnvelope(value)), target, expectation);
  for (const drift of [{ ...value, executionAuthorized: true }, { ...value, projectUuid: "f".repeat(64) }, { ...value, extra: false }, { ...value, templates: [] }]) {
    assert.throws(() => { decodeCurrentSymbolStartupObservation(reply(encodeExactReadEnvelope(drift)), target, expectation); });
  }
  assert.throws(() => { decodeCurrentSymbolStartupObservation(reply(value), target, expectation); });
  assert.throws(() => { decodeCurrentSymbolStartupObservation(reply({ schema: "easyeda-pro-control.exact-json.v1", utf8Bytes: 100_000, json: "x".repeat(100_000) }), target, expectation); });
  assert.throws(() => buildCurrentSymbolStartupObservation(target, { ...expectation, sheetUuids: [] }));
  assert.throws(() => buildCurrentSymbolStartupObservation({ ...target, projectUuid: "bad" }, expectation));
});

void test("caller snapshots and authorization booleans cannot create an original startup token", async () => {
  // Deliberately unissued negatives must fail before any engine method or file.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forge both nominal inputs to verify rejection before any receiver is touched.
  const engine = {} as EasyedaControlEngine, generation = {} as CurrentProjectOnlySymbolGeneration;
  const value = { profile: "private.current-symbol-writer-startup.v1", expectation, startupLocalChangesExcluded: true, runtimeHoldersObserved: true };
  assert.throws(() => assertCurrentSymbolWriterStartup(value, engine, generation), /qualification refused/u);
  await assert.rejects(revalidateCurrentSymbolWriterStartup(value, engine, generation), /qualification refused/u);
});
