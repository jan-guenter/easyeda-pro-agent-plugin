import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import {
  CURRENT_PCB_DIAGNOSTIC_PENDING_PROGRAM_SHA256,
  CURRENT_PCB_DIAGNOSTIC_PENDING_RESULT_BYTES,
  CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION,
  decodeCurrentPcbDiagnosticPendingReply,
} from "../src/current-pcb-diagnostic-pending-program.ts";
import { currentPcbPendingFailureDetail, currentPcbPendingFailureReasonSchema, currentPcbPendingFailureStageSchema } from "../src/current-pcb-observation-failure.ts";
import { CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING, currentPcbTeardropSources } from "./helpers/current-pcb-teardrop-fixture.ts";

const FIXTURE = `
globalThis.reads=0;
class Z1e{constructor(){this.isRunning=true;this.callback=()=>{reads++;};}}
class Oet{constructor(){this.subscribed={"pcb/saveCompiler":[new Z1e()]};}}
class HJ{constructor(){this.messageBus=new Oet();}}
globalThis.MSG_BUS_PCB=new HJ();
class x{constructor(){this._id="a".repeat(32);this._doctype=3;this._compiler={};}}
x.env=new x();
class qI{constructor(){this.data=new Set();}} qI.proxy=new qI();
class e5{constructor(){this.data=new Set();}} e5.proxy=new e5();
class pE{constructor(){this.flag=false;}} pE.proxy=new pE();
class De{constructor(){this._commands=[];this.waitingUploadStack=[];this.idMap=new Map();
this.refreshService=false;this.needCheckFilterCommand=true;this._partitionNeedAskBeforeDelete=false;
this.createPartitionFile=false;this.sendCopperOrderChange=false;}}
class kde{constructor(){this.undoCommand=[];this.redoCommand=[];this.stack=new De();}}
class Sfe{constructor(){this.isMove=false;this.suspend=true;this.modify=new Set();this.task=new Set();
this.modifyTears=new Set();this.timeoutId=null;}${currentPcbTeardropSources.join("")}}
class Of{constructor(){this.map=new Map();this.busMap={};this.ratlineWorker=new Map();
this.workerBus=new Map();this._workerStateMap={};this.id=1;this.i=0;}}
Of.manager=new Of();
class Cet{constructor(worker){this.worker=worker;this.bus=MSG_BUS_PCB.messageBus;}}
class FP{constructor(){this.openPcb=true;this.workerName=0;this._bus=new Cet({});}}
FP.manager=new FP();
Of.manager.map.set(0,FP.manager._bus.worker);Of.manager.busMap["0"]=FP.manager._bus;
globalThis.scope={object:{x,qI,e5,pE,De,kde,Xe:new kde(),Of,FP}};
const tearsOwner=new Sfe;
${CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING}
`;
const READ = `(${CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,[kde,Sfe,...Array(14).fill(class{})],teardropProof)`;
function snapshot(change = ""): Readonly<{ raw: string; reads: unknown }> {
  const context = createContext({});
  runInContext(FIXTURE + change, context, { timeout: 1000 });
  const raw: unknown = runInContext(READ, context, { timeout: 1000 });
  assert.equal(typeof raw, "string");
  return { raw: String(raw), reads: runInContext("reads", context) as unknown };
}
function reply(raw: string): unknown { return { result: { type: "string", value: raw } }; }

void test("pending reader distinguishes optional producers and samples worker zero without payload reads", () => {
  const observed = snapshot(`
const privatePayload=Object.defineProperty({},"secret",{get(){reads++;throw new Error("PRIVATE_PAYLOAD");}});
scope.object.qI.proxy.data.add(privatePayload);scope.object.e5.proxy.data.add(privatePayload);
scope.object.Xe.stack._commands.push(privatePayload);scope.object.Xe.stack.waitingUploadStack.push(privatePayload);
teardropProof[0].modify.add(privatePayload);teardropProof[0].timeoutId=0;
Object.defineProperty(scope.object.Xe.stack,"commands",{get(){reads++;throw new Error("VENDOR_GETTER");}});
`);
  const state = decodeCurrentPcbDiagnosticPendingReply(reply(observed.raw));
  assert.equal(state.copperUploads.count, 1); assert.equal(state.planeUploads.count, 1);
  assert.equal(state.commands.activeStack?.waitingUploadCount, 1); assert.equal(state.teardrops.modifyCount, 1);
  assert.equal(state.teardrops.timer, "present"); assert.equal(state.dynamicCopper.workerId, 0);
  assert.equal(state.dynamicCopper.association, "matched"); assert.equal(state.workerLivenessVerified, false);
  assert.equal(state.producerCompletionVerified, false); assert.equal(state.executionAuthorized, false);
  assert.equal(observed.reads, 0); assert.doesNotMatch(observed.raw, /secret|PRIVATE_PAYLOAD|VENDOR_GETTER/u);
  const absent = decodeCurrentPcbDiagnosticPendingReply(reply(snapshot(`
delete scope.object.qI.proxy;scope.object.e5.proxy=undefined;scope.object.pE.proxy=null;
scope.object.Xe.stack=null;scope.object.FP.manager.workerName=null;scope.object.Of.manager=null;
`).raw));
  assert.deepEqual(absent.copperUploads, { marker: "absent", count: null });
  assert.deepEqual(absent.planeUploads, { marker: "undefined", count: null });
  assert.deepEqual(absent.boardUpload, { marker: "null", flag: null });
  assert.equal(absent.commands.activeStack, null); assert.equal(absent.workerRegistry.workers, null);
  assert.equal(absent.dynamicCopper.association, "no-worker-id");
});

void test("pending reader reports structural worker mismatches and rejects unsupported state before getters", () => {
  for (const [change, association] of [
    ["scope.object.Of.manager=null;", "registry-unavailable"],
    ["scope.object.Of.manager.map.clear();", "missing-worker"],
    ['delete scope.object.Of.manager.busMap["0"];', "missing-bridge"],
    ['scope.object.Of.manager.busMap["0"]={};', "bridge-mismatch"],
    ["scope.object.FP.manager._bus.worker={};", "worker-mismatch"],
    ["scope.object.FP.manager._bus.bus={};", "bus-mismatch"],
  ] as const) {
    const observed = snapshot(change), state = decodeCurrentPcbDiagnosticPendingReply(reply(observed.raw));
    assert.equal(state.dynamicCopper.association, association);
  }
  for (const change of [
    'scope.object.Xe.stack={};',
    'scope.object.Xe.undoCommand.length=51;',
    'scope.object.qI.proxy.data=new Map();',
    'scope.object.qI.proxy.data.unknown=1;',
    'scope.object.FP.manager.workerName=-0;',
    'scope.object.x.env._doctype=4;',
    'scope.object.x.env._id="private-title";',
    'teardropProof[0].modify=new Set(Array.from({length:65537},(_,i)=>i));',
    'Object.defineProperty(teardropProof[0],"task",{get(){reads++;throw new Error("GETTER");}});',
    'Object.defineProperty(scope.object.qI,"proxy",{get(){reads++;throw new Error("GETTER");}});',
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(reply(snapshot(change).raw)), /PCB_DIAGNOSTIC_PENDING_REPLY/u, change); }
});

void test("pending failure labels identify the failed group without disclosing values or invoking getters", () => {
  for (const [change, stage, reason] of [
    ["scope.object.FP.manager=null;", "dynamic-copper", "object"],
    ["scope.object.Xe.stack={};", "active-stack", "instance"],
    ['Object.defineProperty(teardropProof[0],"task",{get(){reads++;throw new Error("PRIVATE_PAYLOAD");}});', "teardrops", "own"],
  ] as const) {
    const observed = snapshot(change);
    assert.equal(observed.reads, 0); assert.doesNotMatch(observed.raw, /PRIVATE_PAYLOAD/u);
    assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(reply(observed.raw)), (caught: unknown) => {
      assert.deepEqual(currentPcbPendingFailureDetail(caught), { schema: "easyeda-pro-control.pcb-diagnostic-pending-failure.v1", stage, reason });
      return true;
    });
  }
  const stages = [...CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION.matchAll(/stage="([a-z-]+)"/gu)].map(match => match[1]);
  const reasons = [...CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION.matchAll(/bad\("([a-z-]+)"\)/gu)].map(match => match[1]);
  for (const stage of stages) { assert.ok(currentPcbPendingFailureStageSchema.safeParse(stage).success); }
  for (const reason of reasons) { assert.ok(currentPcbPendingFailureReasonSchema.safeParse(reason).success); }
  assert.deepEqual(new Set(stages), new Set(currentPcbPendingFailureStageSchema.options.filter(stage => stage !== "decode")));
  for (const field of ["stage", "reason"]) {
    const raw = JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-pending-failure.v1", stage: "teardrops", reason: "own", [field]: "private-payload" });
    assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(reply(raw)), (caught: unknown) => {
      assert.equal(currentPcbPendingFailureDetail(caught)?.stage, "decode");
      assert.ok(caught instanceof Error); assert.doesNotMatch(caught.message, /private-payload/u); return true;
    });
  }
});

void test("pending decoder refuses duplicate keys, invented authority, contradictions and hostile transport objects", () => {
  const { raw } = snapshot();
  for (const value of [
    reply(raw.replace('"undoCount":0', '"undoCount":-0')),
    reply(raw.replace('"undoCount":0', '"undoCount":0,"undoCount":0')),
    reply(raw.replace('"documentUuid":', '"executionAuthorized":true,"documentUuid":')),
    reply(raw.replace('"workerCount":1', '"workerCount":0')),
    reply(raw.replace('"workerId":0', '"workerId":null')),
    reply(raw.replace('"association":"matched"', '"association":"registry-unavailable"')),
    reply(" ".repeat(CURRENT_PCB_DIAGNOSTIC_PENDING_RESULT_BYTES + 1)),
    { result: { type: "string", value: raw }, exceptionDetails: {} },
    { result: { type: "string", value: raw, objectId: "foreign" } },
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(value), /PENDING_REPLY/u); }
  let reads = 0;
  const accessor = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  const proxy = new Proxy({}, { ownKeys(): never { reads += 1; throw new Error("PROXY"); } });
  for (const value of [accessor, proxy]) { assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(value), /PENDING_REPLY/u); }
  assert.equal(reads, 0);
  assert.equal(createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION).digest("hex"),
    CURRENT_PCB_DIAGNOSTIC_PENDING_PROGRAM_SHA256);
  assert.ok(Buffer.byteLength(raw, "utf8") < CURRENT_PCB_DIAGNOSTIC_PENDING_RESULT_BYTES);
});

/** Real Node inspector execution of synthetic descriptor graphs, not original
 * EasyEDA scope admission. Confirms effect checking accepts Set/Map intrinsic
 * reads and rejects a mutating proxy without running its side effect.
 */
void test("pending fixed program works under inspector effect checking without calling vendor code", async () => {
  const session = new Session(); session.connect();
  const name = "pcb-pending-synthetic";
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueContextId = params.context.uniqueId;
    }
  });
  try {
    await session.post("Runtime.enable");
    const context = createContext({}, { name });
    runInContext(FIXTURE, context, { timeout: 1000 });
    assert.notEqual(uniqueContextId, "");
    const read = (): Promise<unknown> => session.post("Runtime.evaluate", {
      expression: READ, uniqueContextId, returnByValue: true, throwOnSideEffect: true,
      silent: true, awaitPromise: false, generatePreview: false, userGesture: false,
      includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, timeout: 1000,
    });
    assert.equal(decodeCurrentPcbDiagnosticPendingReply(await read()).dynamicCopper.association, "matched");
    runInContext('teardropProof[0]=new Proxy(teardropProof[0],{getOwnPropertyDescriptor(target,key){reads++;return Reflect.getOwnPropertyDescriptor(target,key);}});', context);
    const refused = await read();
    assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(refused), /PENDING_REPLY/u);
    assert.equal(runInContext("reads", context) as unknown, 0);
  } finally { session.disconnect(); }
});
