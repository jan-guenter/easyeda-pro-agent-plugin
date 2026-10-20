import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_COOPERATION_STATE, CURRENT_PCB_STRING_DEBOUNCE_SELECTOR,
  CURRENT_PCB_STRING_DEBOUNCE_STATE, CURRENT_PCB_STRING_MOVE_SELECTOR, CURRENT_PCB_STRING_MOVE_STATE, CURRENT_PCB_STRING_STRUCTURE_SELECTOR,
  CURRENT_PCB_STRING_STRUCTURE_STATE, CURRENT_PCB_STRING_UPLOAD_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STATE,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE, decodeCurrentPcbStringCooperationClosure,
  decodeCurrentPcbStringDebounceClosure, decodeCurrentPcbStringMoveClosure, decodeCurrentPcbStringSerialClosure,
  decodeCurrentPcbStringUploadClosure } from "../src/current-pcb-string-producer-program.ts";
import { observeCurrentPcbStringProducerClosures } from "../src/current-pcb-string-producer-observation.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const SETUP = `
globalThis.getterCalls=0;globalThis.callbackCalls=0;globalThis.scheduled=new Map();let nextTimer=1;
globalThis.setTimeout=callback=>{const id=nextTimer++;scheduled.set(id,callback);return id;};
globalThis.clearTimeout=id=>scheduled.delete(id);
globalThis.flushOne=()=>{const [id,callback]=scheduled.entries().next().value;scheduled.delete(id);return callback();};
globalThis.uploadBarrier=new Promise(resolve=>globalThis.finishUpload=resolve);
function Nd(e){let t=null,s=null,r;return(...i)=>(r=i,t?(s||(s=(async()=>{try{await t,t=s,s=null,await e(...r)}finally{t=null}})()),s):(t=(async()=>{try{await e(...r)}finally{t=null}})(),t))}
function QA(e,t,s=!1){let r,i=null;return function(...n){return s?(clearTimeout(r),i&&i(),s=!1,e.apply(this,n)):(clearTimeout(r),i&&i(),new Promise(a=>{i=a,r=setTimeout(async()=>{let o=await e.apply(this,n);a(o)},t)}))}}
class Gd{bufferedStream(t,s){let r=null,i=null,n=null,a=this;return l=>{r&&(clearTimeout(r),r=null),n&&n(),i&&a.task1.delete(i),i=new Promise(u=>n=u),a.task1.add(i),o(l),r=setTimeout(()=>c(),s)};function o(l){let u=Array.isArray(l)?l:[l];for(let h of u)a.bufferUploadData.set(h.dataUrl,h.dataStr)}async function c(){r=null;let l=i,u=n;n=null,i=null;try{await t()}catch(h){console.error(h)}u&&u(),l&&a.task1.delete(l)}}}
class Lg extends Gd{constructor(){super();this.uuid="a".repeat(64);this._branchUuid="b".repeat(32);this.task1=new Set();this.bufferUploadData=new Map();
this.structure=Nd(QA(async()=>{callbackCalls++;},300));this.uploadStructure=Nd(()=>{});
this.bufferedUploadCloud=this.bufferedStream(async()=>{callbackCalls++;await uploadBarrier;},500);}}
globalThis.PROJECT=new Lg();globalThis._TAB_ID_="synthetic-window";
`;
const response = (value: unknown): unknown => ({ result: { type: "string", value: JSON.stringify(value) } });
const identity = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "synthetic-window" };
const functionHandle = (input: unknown): string => z.object({ result: z.object({ type: z.literal("function"),
  objectId: z.string(), className: z.literal("Function"), description: z.string() }).strict() }).strict().parse(input).result.objectId;
function promise(value: unknown): Promise<unknown> { assert.ok(types.isPromise(value)); return value; }

void test("real effect-checked scopes preserve QA's stale markers and bufferedStream's in-flight upload gap", async () => {
  const session = new Session(); session.connect(); let contextId = 0, paused = false;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "producer-timers") { contextId = params.context.id; }
  });
  session.on("Debugger.paused", (): void => { paused = true; });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = createContext({}, { name: "producer-timers" }); runInContext(SETUP, context);
    const evaluate = async (expression: string): Promise<string> => {
      const reply = await (session.post("Runtime.evaluate", { expression, contextId, returnByValue: false,
        objectGroup: "producer-timers", throwOnSideEffect: true, silent: true }) as Promise<unknown>);
      return functionHandle(reply);
    };
    const call = (objectId: string, functionDeclaration: string, handles: readonly string[], returnByValue = true): Promise<unknown> =>
      session.post("Runtime.callFunctionOn", { objectId, functionDeclaration, arguments: handles.map(value => ({ objectId: value })),
        returnByValue, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false });
    const scopes = async (objectId: string): Promise<readonly string[]> => {
      const reply = await session.post("Runtime.getProperties", { objectId, ownProperties: true });
      const list = reply.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId; assert.ok(list !== undefined);
      const result = await session.post("Runtime.getProperties", { objectId: list, ownProperties: true });
      return result.result.map(item => { assert.ok(item.value?.objectId !== undefined); return item.value.objectId; });
    };
    const structure = await evaluate(CURRENT_PCB_STRING_STRUCTURE_SELECTOR);
    const [serialScope] = await scopes(structure); assert.ok(serialScope !== undefined);
    const debounce = functionHandle(await call(serialScope, CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, [structure], false));
    const readSerial = async (): Promise<ReturnType<typeof decodeCurrentPcbStringSerialClosure>> => {
      const [fresh] = await scopes(structure); assert.ok(fresh !== undefined);
      return decodeCurrentPcbStringSerialClosure(await call(fresh, CURRENT_PCB_STRING_STRUCTURE_STATE, [structure]));
    };
    const readDebounce = async (): Promise<ReturnType<typeof decodeCurrentPcbStringDebounceClosure>> => {
      const [block, parameters] = await scopes(debounce); assert.ok(block !== undefined); assert.ok(parameters !== undefined);
      const [freshSerial] = await scopes(structure); assert.ok(freshSerial !== undefined);
      return decodeCurrentPcbStringDebounceClosure(await call(block, CURRENT_PCB_STRING_DEBOUNCE_STATE, [parameters, freshSerial, structure, debounce]));
    };
    const initialDebounce = await readDebounce(), initialSerial = await readSerial();
    assert.equal(initialSerial.lastArguments, null); assert.equal(initialDebounce.timer, "undefined");
    const pending = promise(runInContext("PROJECT.structure()", context) as unknown);
    const oldScope = decodeCurrentPcbStringSerialClosure(await call(serialScope, CURRENT_PCB_STRING_STRUCTURE_STATE, [structure]));
    assert.equal(oldScope.inFlight, "null", "old V8 scope wrapper retains its earlier value snapshot");
    const scheduledDebounce = await readDebounce(), scheduledSerial = await readSerial();
    assert.equal(scheduledSerial.inFlight, "present"); assert.equal(scheduledDebounce.timer, "present");
    await promise(runInContext("flushOne()", context) as unknown); await pending;
    const finishedSerial = await readSerial();
    assert.equal(finishedSerial.inFlight, "null"); assert.equal(finishedSerial.lastArguments, 0);
    const stale = await readDebounce(); assert.equal(stale.timer, "present"); assert.equal(stale.resolver, "present");
    assert.equal(stale.queueCompletionVerified, false);

    const upload = await evaluate(CURRENT_PCB_STRING_UPLOAD_SELECTOR);
    const [uploadScope] = await scopes(upload); assert.ok(uploadScope !== undefined);
    const readUpload = async (): Promise<ReturnType<typeof decodeCurrentPcbStringUploadClosure>> => {
      const [fresh] = await scopes(upload); assert.ok(fresh !== undefined);
      return decodeCurrentPcbStringUploadClosure(await call(fresh, CURRENT_PCB_STRING_UPLOAD_STATE, [upload]));
    };
    runInContext("PROJECT.bufferedUploadCloud([])", context);
    const scheduledUpload = await readUpload(); assert.equal(scheduledUpload.promise, "present");
    const uploading = promise(runInContext("flushOne()", context) as unknown);
    const gap = await readUpload();
    assert.equal(gap.promise, "null"); assert.equal(gap.resolver, "null"); assert.equal(gap.timer, "null");
    assert.equal(runInContext("PROJECT.task1.size", context) as unknown, 1);
    assert.equal(gap.queueCompletionVerified, false);
    runInContext("finishUpload()", context); await uploading;
    assert.equal(runInContext("PROJECT.task1.size", context) as unknown, 0);
    assert.equal(runInContext("callbackCalls", context) as unknown, 2);
    assert.equal(runInContext("getterCalls", context) as unknown, 0); assert.equal(paused, false);

    runInContext('PROJECT=new Proxy(PROJECT,{getOwnPropertyDescriptor(target,key){getterCalls++;return Reflect.getOwnPropertyDescriptor(target,key);}})', context);
    assert.throws(() => decodeCurrentPcbStringUploadClosure(awaitedProxyReply()), /OBSERVATION_REPLY/u);
    const refusal = await call(uploadScope, CURRENT_PCB_STRING_UPLOAD_STATE, [upload]);
    assert.throws(() => decodeCurrentPcbStringUploadClosure(refusal), /OBSERVATION_REPLY/u);
    assert.equal(runInContext("getterCalls", context) as unknown, 0);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "producer-timers" });
  } finally { session.disconnect(); }
});
function awaitedProxyReply(): unknown { return { result: { type: "undefined" }, exceptionDetails: {} }; }

void test("latent move reads retained state and exact document without invoking native selection or commands", () => {
  const setup = 'scope.object.eL=()=>{vendorCalls++;};globalThis.originalMove=scope.object.eL;globalThis.move={object:{o:null,t:[],e:null,r:null}};';
  const context = pcbStringObservationFixture(false, setup);
  const call = (): unknown => runInContext(`(${CURRENT_PCB_STRING_MOVE_STATE}).call(move,originalMove,scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`, context);
  assert.equal(callPcbStringObservation(context, CURRENT_PCB_STRING_MOVE_SELECTOR), runInContext("originalMove", context) as unknown);
  const initial = decodeCurrentPcbStringMoveClosure(pcbStringReply(call()));
  assert.equal(initial.documentUuid, "d".repeat(16)); assert.equal(initial.selectionCount, 0);
  runInContext('move.object.t.push({private:"not-returned"});move.object.e={};move.object.r={};move.object.o=4;', context);
  const active = decodeCurrentPcbStringMoveClosure(pcbStringReply(call()));
  assert.equal(active.selectionCount, 1); assert.equal(active.builder, "present"); assert.equal(active.timer, "present");
  assert.equal(active.queueCompletionVerified, false);
  for (const change of [
    'scope.object.eL=()=>{};', 'scope.object.x.env._doctype=4;', 'scope.object.x.env._id="wrong";',
    'Object.defineProperty(move.object,"o",{get(){getterReads++;throw new Error("GETTER")}});',
    'move.object.t=new Array(2);', 'move.object.r=()=>{};',
  ]) {
    const hostile = pcbStringObservationFixture(false, setup + change);
    assert.throws(() => runInContext(`(${CURRENT_PCB_STRING_MOVE_STATE}).call(move,originalMove,scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`, hostile), /OBSERVATION_STATE/u);
    assert.equal(runInContext("vendorCalls+getterReads", hostile) as unknown, 0);
  }
  assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
});

function observations(change: Record<string, unknown> = {}): ReturnType<typeof observeCurrentPcbStringProducerClosures> {
  return observeCurrentPcbStringProducerClosures(
    response({ schema: "easyeda-pro-control.pcb-string-move-closure.v1", documentUuid: "c".repeat(16),
      timer: "null", selectionCount: 0, builder: "null", command: "null" }),
    response({ schema: "easyeda-pro-control.pcb-string-serial-closure.v1", identity, kind: "uploadStructure",
      inFlight: "null", queued: "null", lastArguments: 3 }),
    response({ schema: "easyeda-pro-control.pcb-string-serial-closure.v1", identity, kind: "structure",
      inFlight: "null", queued: "null", lastArguments: 0 }),
    response({ schema: "easyeda-pro-control.pcb-string-debounce-closure.v1", identity,
      timer: "present", resolver: "present", delay: 300, leading: false, ...change }),
    response({ schema: "easyeda-pro-control.pcb-string-cooperation-closure.v1", identity,
      batchCount: 0, outerTimer: "null", innerTimer: "null", delay: 10 }),
    response({ schema: "easyeda-pro-control.pcb-string-upload-closure.v1", identity,
      timer: "null", promise: "null", resolver: "null", delay: 500 }));
}
void test("supplied interpretation distinguishes retained markers and never promotes samples to completion", () => {
  const state = observations(); assert.equal(state.debounceMarkers, "retained-schedule-markers");
  assert.equal(state.moveHasNoRetainedState, true); assert.equal(state.serialWrappersHaveNoRetainedPromises, true);
  assert.equal(state.uploadHasNoRetainedSchedule, true); assert.equal(state.cooperationHasNoRetainedBatch, true);
  assert.equal(state.originalOwnerVerified, false); assert.equal(state.queueCompletionVerified, false);
  assert.equal(state.executionAuthorized, false); assert.equal(state.atomicSnapshotVerified, false);
  assert.equal(state.projectWorkerAssociationVerified, false); assert.equal(Object.isFrozen(state.debounce), true);
  assert.equal(observations({ timer: "undefined", resolver: "null" }).debounceMarkers, "not-yet-scheduled");
  assert.equal(observations({ timer: "undefined" }).debounceMarkers, "mixed-markers");
  assert.throws(() => observations({ identity: { ...identity, branchUuid: "d".repeat(32) } }), /PRODUCER_IDENTITY/u);
  assert.throws(() => observations({ executionAuthorized: true }), /OBSERVATION_REPLY/u);
});

void test("descriptor-only readers reject accessor, sparse collection, subclass and source-default drift", () => {
  const programs = [
    [CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE, 'PROJECT.uploadStructure', '{e:()=>{},t:null,s:null,r:undefined}'],
    [CURRENT_PCB_STRING_COOPERATION_STATE, 'PROJECT.bufferedPendDataStream', '{e:()=>{},t:10,s:[],r:null,i:null}'],
    [CURRENT_PCB_STRING_UPLOAD_STATE, 'PROJECT.bufferedUploadCloud', '{a:PROJECT,s:500,t:()=>{},o:()=>{},c:async()=>{},r:null,i:null,n:null}'],
  ] as const;
  for (const [program, original, initial] of programs) {
    for (const change of [
      'Object.defineProperty(holder,"r",{get(){getterCalls++;throw new Error("GETTER");}});',
      'Object.setPrototypeOf(PROJECT,{});',
      `${original}=()=>{};`,
    ]) {
      const context = createContext({}); runInContext(`${SETUP};PROJECT.bufferedPendDataStream=()=>{};globalThis.original=${original};globalThis.holder=${initial};${change}`, context);
      assert.throws(() => runInContext(`(${program}).call({object:holder},original)`, context), /OBSERVATION_STATE/u);
      assert.equal(runInContext("getterCalls", context) as unknown, 0);
    }
  }
  const context = createContext({}); runInContext(`${SETUP};PROJECT.bufferedPendDataStream=()=>{};globalThis.holder={e:()=>{},t:10,s:[],r:null,i:null}`, context);
  const read = (): unknown => runInContext(`(${CURRENT_PCB_STRING_COOPERATION_STATE}).call({object:holder},PROJECT.bufferedPendDataStream)`, context);
  const raw = read(); assert.ok(typeof raw === "string");
  assert.equal(decodeCurrentPcbStringCooperationClosure({ result: { type: "string", value: raw } }).batchCount, 0);
  for (const change of ['holder.s=new Array(2)', 'holder.s=new(class extends Array{})()', 'holder.t=11', 'holder.r=-0']) {
    runInContext('holder={e:()=>{},t:10,s:[],r:null,i:null}', context); runInContext(change, context);
    assert.throws(read, /OBSERVATION_STATE/u);
  }
  for (const invalid of [raw.replace('"batchCount":0', '"batchCount":-0'),
    raw.replace('"batchCount":0', '"batchCount":0,"batchCount":0'), raw.replace('"delay":10', '"delay":10,"executionAuthorized":true')]) {
    assert.throws(() => decodeCurrentPcbStringCooperationClosure({ result: { type: "string", value: invalid } }), /OBSERVATION_REPLY/u);
  }
});
