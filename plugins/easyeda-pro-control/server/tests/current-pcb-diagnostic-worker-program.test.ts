import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256,
  CURRENT_PCB_DIAGNOSTIC_WORKER_RESULT_BYTES, decodeCurrentPcbDiagnosticWorkerReply } from "../src/current-pcb-diagnostic-worker-program.ts";

const FIXTURE = `globalThis.getterReads=0;globalThis.vendorCalls=0;
class Gd{}class Lg extends Gd{}class Vc{}class ja extends Vc{}
globalThis.PROJECT=new Lg();globalThis._TAB_ID_="window_1";
Object.assign(PROJECT,{uuid:"a".repeat(64),_branchUuid:"b".repeat(32),consistencyManager:new ja(),
isReady:true,isTemporary:false,isHistoryBack:false,_isV2Format:false,isOpening:false,isEstablished:true,isApplyShot:false,
isUploadingCloud:false,pendingSyncCloud:false,isBatchUpload:false,debugOpen:false,
task1:new Set(),task2:new Set(),task3:new Set(),cachePromise:new Set(),publishTask:new Set(),rollbackPromise:new Set(),
syncPendingNodeUuids:new Set(),confirmedEmptyNodeUuids:new Set(),warnedEmptyNodeUuids:new Set(),
bufferUploadData:new Map(),bufferUploadCache:new Map(),selectWatch:new Map(),historyErrorNodes:new Map(),
projectTimer:null,publishTimer:null,orderTimer:null,orderCache:{}});
PROJECT.consistencyManager.uniqueIds={};
for(const group of ["watcherAddSet","watcherDeleteSet","watcherUpdateSet"]){PROJECT[group]={};for(const kind of ["footprint","symbol","device","board","sch","sheet","pcb","panel","simulation"])PROJECT[group][kind]=new Map();}
Object.defineProperty(Gd.prototype,"branchUuid",{get(){getterReads++;throw new Error("GETTER");}});
Object.defineProperty(Gd.prototype,"isV2Format",{get(){getterReads++;throw new Error("GETTER");}});
PROJECT.saveCanvas=()=>{vendorCalls++;throw new Error("VENDOR");};
PROJECT.awaitUploadEnd=PROJECT.saveCanvas;`;

function fixture(change = ""): Readonly<{ evaluate: () => unknown; inspect: (source: string) => unknown }> {
  const context = createContext({});
  runInContext(FIXTURE + change, context, { timeout: 1000 });
  return { evaluate: (): unknown => runInContext(CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, context, { timeout: 1000 }) as unknown,
    inspect: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown };
}
function reply(raw: unknown): Readonly<{ result: Readonly<{ type: "string"; value: unknown }> }> {
  return { result: { type: "string", value: raw } };
}

void test("fixed worker expression reports only raw identities, flags and queue cardinalities", () => {
  const source = fixture();
  const raw = source.evaluate(), state = decodeCurrentPcbDiagnosticWorkerReply(reply(raw));
  assert.equal(state.identity.projectUuid, "a".repeat(64));
  assert.equal(state.flags["_isV2Format"], false);
  assert.equal(state.optionalFlags["isSyncing"], "absent");
  assert.equal(state.setSizes["task1"], 0);
  assert.equal(state.watcherMapSizes.watcherUpdateSet.pcb, 0);
  assert.equal(source.inspect("getterReads"), 0); assert.equal(source.inspect("vendorCalls"), 0);
  assert.equal(state.compilerOwnerVerified, false); assert.equal(state.queueCompletionVerified, false);
  assert.equal(state.projectWorkerAssociationVerified, false); assert.equal(state.completeQueueMembershipVerified, false);
  assert.equal(state.executionAuthorized, false); assert.equal(state.latentCallbacksObserved, false);
  assert.equal(Object.isFrozen(state.setSizes), true);
  assert.match(CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256, /^[a-f\d]{64}$/u);
});

void test("worker queue values and unrelated private design properties are never read or emitted", () => {
  const source = fixture(`const hidden={};Object.defineProperty(hidden,"data",{get(){getterReads++;throw new Error("PRIVATE");}});
PROJECT.task1.add(hidden);PROJECT.bufferUploadData.set("private-upload-path",hidden);
PROJECT.watcherAddSet.pcb.set("private-document-name",hidden);PROJECT.consistencyManager.uniqueIds.opaque=hidden;
PROJECT.isSyncing=undefined;PROJECT.notSyncCloud=true;PROJECT.projectTimer=0;
Object.defineProperty(PROJECT,"privateDesign",{get(){getterReads++;throw new Error("PRIVATE");}});`);
  const raw = source.evaluate(), state = decodeCurrentPcbDiagnosticWorkerReply(reply(raw));
  assert.equal(state.setSizes["task1"], 1); assert.equal(state.mapSizes.bufferUploadData, 1);
  assert.equal(state.watcherMapSizes.watcherAddSet.pcb, 1); assert.equal(state.dictionaryOwnKeyCounts.uniqueIds, 1);
  assert.equal(state.optionalFlags.isSyncing, "undefined"); assert.equal(state.optionalFlags.notSyncCloud, "true");
  assert.equal(state.timers.projectTimer, "present"); assert.equal(source.inspect("getterReads"), 0);
  assert.equal(typeof raw, "string"); assert.doesNotMatch(String(raw), /private-upload-path|private-document-name|privateDesign/u);
});

void test("worker selected getters, wrong raw prototypes, decorated queues and identities refuse", () => {
  for (const change of [
    'Object.defineProperty(PROJECT,"uuid",{get(){getterReads++;throw new Error("GETTER");}});',
    'Object.defineProperty(PROJECT,"task1",{get(){getterReads++;throw new Error("GETTER");}});',
    'Object.defineProperty(PROJECT.watcherAddSet,"pcb",{get(){getterReads++;throw new Error("GETTER");}});',
    'Object.defineProperty(globalThis,"PROJECT",{get(){getterReads++;throw new Error("GETTER");}});',
    "PROJECT.task1=new(class extends Set{})();",
    'Object.defineProperty(PROJECT.task1,"size",{get(){getterReads++;throw new Error("GETTER");}});',
    String.raw`PROJECT.uuid="C:\\private\\project.eprj2";`,
    'PROJECT._branchUuid="foreign";',
    'globalThis._TAB_ID_="private title";',
    "PROJECT.isReady=1;",
    "PROJECT.projectTimer=false;",
    "PROJECT.watcherAddSet.extra=new Map();",
    'PROJECT.orderCache[Symbol("hidden")]=1;',
    "Object.setPrototypeOf(PROJECT,{});",
    "delete PROJECT.task3;",
  ]) {
    const source = fixture(change);
    assert.throws(source.evaluate, /PCB_DIAGNOSTIC_WORKER_STATE/u, change);
    assert.equal(source.inspect("getterReads"), 0, change); assert.equal(source.inspect("vendorCalls"), 0, change);
  }
});

void test("worker result decoder rejects remote exceptions, handles, malformed inventories and unsafe wrappers", () => {
  const raw = fixture().evaluate(); assert.equal(typeof raw, "string");
  const parsed: unknown = JSON.parse(String(raw));
  assert.ok(parsed !== null && typeof parsed === "object");
  const state = parsed;
  for (const input of [
    { ...reply(raw), exceptionDetails: {} },
    { result: { type: "string", value: raw, objectId: "remote" } },
    { result: { type: "object", value: state } },
    reply(" ".repeat(CURRENT_PCB_DIAGNOSTIC_WORKER_RESULT_BYTES + 1)),
    reply(String(raw).replace('"task1":0', '"task1":65537')),
    reply(String(raw).replace('"task1":0', '"task1":-0')),
    reply(String(raw).replace('"task1":0', '"task1":1,"task1":0')),
    reply(JSON.stringify({ ...state, executionAuthorized: true })),
    reply(JSON.stringify({ ...state, setSizes: {} })),
    new Proxy(reply(raw), { getOwnPropertyDescriptor(): never { throw new Error("TRAP"); } }),
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticWorkerReply(input), /PCB_DIAGNOSTIC_WORKER_REPLY/u); }
  let reads = 0;
  const getter = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticWorkerReply(getter), /PCB_DIAGNOSTIC_WORKER_REPLY/u);
  assert.equal(reads, 0);
});

/** In-process inspector only, no TCP listener or child process. This validates
 * this Node/V8 effect check, not the installed Electron's native implementation.
 */
void test("local V8 executes the fixed read with throwOnSideEffect and blocks a state-changing proxy trap", async () => {
  const session = new Session(); session.connect();
  const name = "pcb-worker-effect-check";
  let uniqueId: string | null = null;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueId = params.context.uniqueId;
    }
  });
  try {
    await session.post("Runtime.enable");
    const context = createContext({}, { name });
    runInContext(FIXTURE, context, { timeout: 1000 });
    assert.notEqual(uniqueId, null);
    const parameters = { expression: CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, uniqueContextId: uniqueId ?? "",
      returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, includeCommandLineAPI: false,
      allowUnsafeEvalBlockedByCSP: false, userGesture: false, timeout: 1000, generatePreview: false };
    // The pinned Node declarations omit the experimental unique-context/effect
    // Fields, selecting their generic Promise<void> overload. Decode as unknown.
    const first = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    assert.equal(decodeCurrentPcbDiagnosticWorkerReply(first).setSizes.task1, 0);
    runInContext('PROJECT=new Proxy(PROJECT,{getOwnPropertyDescriptor(target,key){getterReads++;return Reflect.getOwnPropertyDescriptor(target,key);}});', context, { timeout: 1000 });
    const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    assert.ok(refused !== null && typeof refused === "object" && "exceptionDetails" in refused);
    assert.equal(runInContext("getterReads", context) as unknown, 0);
    assert.throws(() => decodeCurrentPcbDiagnosticWorkerReply(refused), /PCB_DIAGNOSTIC_WORKER_REPLY/u);
  } finally { session.disconnect(); }
});
