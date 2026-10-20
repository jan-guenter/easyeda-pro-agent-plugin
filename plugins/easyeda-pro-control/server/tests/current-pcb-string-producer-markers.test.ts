import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION,
  decodeCurrentPcbStringProducerMarkers } from "../src/current-pcb-string-producer-markers.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const SETUP = `class FP{constructor(){this.openPcb=false;}}FP.manager=null;scope.object.FP=FP;`;
function sample(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(pcbStringObservationFixture(false, SETUP + change), CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION));
}

void test("producer markers keep null owners distinct from initialized-empty owners and inspect independent views", () => {
  const absent = decodeCurrentPcbStringProducerMarkers(sample('MI.manager=null;scope.object.jo.map.set("private-net",{});'));
  assert.deepEqual(absent.dynamicCopper, { manager: "null", state: null });
  assert.deepEqual(absent.ratlineModel, { manager: "null", state: null });
  assert.equal(absent.ratlineView.netCount, 1);
  const present = decodeCurrentPcbStringProducerMarkers(sample("FP.manager=new FP();"));
  assert.deepEqual(present.dynamicCopper, { manager: "present", state: {
    openPcb: false, workerNameMarker: "absent", workerId: null, timerMarker: "absent", busMarker: "absent",
  } });
  assert.deepEqual(present.ratlineModel, { manager: "present", state: {
    netCount: 0, idCount: 0, lastRatlineMarker: "null", lastMarker: "absent",
  } });
  assert.deepEqual(present.notification, { funcMarker: "null", frameMarker: "null", frameId: null,
    lastTime: -1, delay: 0, updateLeftTreeMarker: "absent", sameCallbackReference: null });
  assert.equal(present.managerAbsenceImpliesEmpty, false); assert.equal(present.emptyBaselineVerified, false);
  assert.equal(present.producerCompletionVerified, false); assert.equal(present.continuousObservation, false);
  assert.equal(present.queueCompletionVerified, false); assert.equal(present.saveAuthorized, false);
  assert.equal(present.executionAuthorized, false); assert.ok(Object.isFrozen(present.ratlineModel.state));
});

void test("producer markers retain zero IDs, raw callback references and nonempty counts without returning payloads", () => {
  const change = `
FP.manager=new FP();Object.assign(FP.manager,{openPcb:true,workerName:0,time:0,_bus:{private:"private-payload"}});
Object.assign(MI.manager,{_lastRatline:{private:"private-payload"},_last:undefined});
const callback=()=>{vendorCalls++;};scope.object.ze.updateLeftTree=callback;
Object.assign(scope.object.ze.debounce,{func:callback,animationFrameId:0,lastTime:123.25,delay:200});
for(const field of [MI.manager.map,MI.manager.idMap,scope.object.jo.idMap,scope.object.ze.map,
 scope.object.ze.noneNetMap,scope.object.ze.netLength,scope.object.ze.netModify,scope.object.pP.map,scope.object.h_.map,scope.object.aE.map])field.set("private-net",{});
for(const field of [scope.object.jo.highLightNets,scope.object.jo.clickHighlightRatlines,scope.object.jo.hoverHighlightRatlines,scope.object.ze.rubbish])field.add("private-net");
for(const field of [scope.object.ze.netOptions,scope.object.ze.updateNets.addNet,scope.object.ze.updateNets.deleteNet])field.push("private-net");
scope.object.ze.updateNets.updateNetLength["private-net"]=123;
scope.object.ze.ratlineVisibleBeforeGray["private-net"]=true;scope.object.ze._viewGroupIds=["private-group"];
`;
  const context = pcbStringObservationFixture(false, SETUP + change);
  const raw = callPcbStringObservation(context, CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION);
  assert.ok(typeof raw === "string"); assert.doesNotMatch(raw, /private-/u);
  const state = decodeCurrentPcbStringProducerMarkers(pcbStringReply(raw));
  assert.equal(state.dynamicCopper.state?.workerId, 0); assert.equal(state.dynamicCopper.state.timerMarker, "present");
  assert.equal(state.dynamicCopper.state.busMarker, "present");
  assert.equal(state.ratlineModel.state?.lastRatlineMarker, "present"); assert.equal(state.ratlineModel.state.lastMarker, "undefined");
  assert.equal(state.notification.frameId, 0); assert.equal(state.notification.frameMarker, "token");
  assert.equal(state.notification.sameCallbackReference, true); assert.equal(state.callbackOwnerVerified, false);
  assert.equal(state.ratlineView.idCount, 1); assert.equal(state.clusters.wireClusterCount, 1);
  assert.deepEqual(state.net, { netCount: 1, noneNetCount: 1, lengthCount: 1, modifyCount: 1, rubbishCount: 1,
    optionCount: 1, addCount: 1, deleteCount: 1, updateLengthCount: 1, grayCount: 1, viewGroupsMarker: "present", viewGroupCount: 1 });
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
});

void test("retained notification callback without a frame marker never becomes completion evidence", () => {
  const change = 'scope.object.ze.debounce.func=()=>{vendorCalls++;};scope.object.ze.debounce.lastTime=123;scope.object.ze.debounce.delay=200;';
  for (const [setup, marker, equality] of [
    ["scope.object.ze.updateLeftTree=null;", "null", null],
    ["scope.object.ze.updateLeftTree=undefined;", "undefined", null],
    ["scope.object.ze.updateLeftTree=()=>{vendorCalls++;};", "function", false],
    ["scope.object.ze.updateLeftTree=scope.object.ze.debounce.func;", "function", true],
  ] as const) {
    const state = decodeCurrentPcbStringProducerMarkers(sample(change + setup));
    assert.equal(state.notification.funcMarker, "function"); assert.equal(state.notification.frameMarker, "null");
    assert.equal(state.notification.updateLeftTreeMarker, marker); assert.equal(state.notification.sameCallbackReference, equality);
    assert.equal(state.producerCompletionVerified, false); assert.equal(state.publicationDelivered, false);
    assert.equal(state.callbackOwnerVerified, false); assert.equal(state.saveAuthorized, false);
  }
});

void test("producer marker reader refuses unsupported owners, getters, inherited markers and malformed collections", () => {
  for (const change of [
    "FP.manager=undefined;", "delete FP.manager;", "FP.manager={openPcb:false};",
    "MI.manager=undefined;", "MI.manager=new(class extends MI{})();",
    'Object.defineProperty(FP,"manager",{get(){getterReads++;return null;}});',
    'Object.defineProperty(scope.object.ze.debounce,"func",{get(){getterReads++;return null;}});',
    "scope.object.ze.debounce.func=undefined;", "scope.object.ze.debounce.animationFrameId=undefined;",
    "scope.object.ze.debounce.animationFrameId=-1;", "scope.object.ze.debounce.animationFrameId=-0;",
    "scope.object.ze.debounce.lastTime=NaN;", "scope.object.ze.debounce.delay=Infinity;",
    "scope.object.ze.debounce.lastTime=-0;", "scope.object.ze.debounce.delay=-0;",
    "scope.object.ze.updateLeftTree={};", "scope.object.Yde.prototype.updateLeftTree=null;",
    "FP.manager=new FP();FP.manager.workerName=-0;", "FP.manager=new FP();FP.manager.workerName='0';",
    "scope.object.jo.map=new(class extends Map{})();", "scope.object.ze.updateNets.extra=[];",
    "scope.object.ze.netOptions.length=1;", "scope.object.ze.netOptions.extra=1;",
    'Object.defineProperty(scope.object.ze.updateNets.updateNetLength,"private",{get(){getterReads++;return 1;}});',
    "scope.object.ze.netOptions=new Array(65537).fill(null);",
  ]) {
    const context = pcbStringObservationFixture(false, SETUP + change);
    assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION), /PCB_STRING_OBSERVATION_STATE/u, change);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  }
});

void test("producer marker decoder rejects contradictory unions, callback relations, counts and invented authority", () => {
  const raw = sample("FP.manager=new FP();").result.value; assert.ok(typeof raw === "string");
  for (const text of [
    raw.replace('"manager":"present"', '"manager":"null"'),
    raw.replace('"workerId":null', '"workerId":0'),
    raw.replace('"frameId":null', '"frameId":0'),
    raw.replace('"sameCallbackReference":null', '"sameCallbackReference":true'),
    raw.replace('"viewGroupCount":null', '"viewGroupCount":0'),
    raw.replace('"netCount":0', '"netCount":65537'), raw.replace('"netCount":0', '"netCount":-0'),
    raw.replace('"delay":0', '"delay":-0'), raw.replace('"lastTime":-1', '"lastTime":1e400'),
    raw.replace('"lastTime":-1', '"lastTime":-1,"lastTime":-1'),
    raw.replace('"documentUuid":', '"saveAuthorized":true,"documentUuid":'),
    raw.replace('"documentUuid":', '"producerCompletionVerified":false,"documentUuid":'),
  ]) { assert.throws(() => decodeCurrentPcbStringProducerMarkers(pcbStringReply(text)), /PCB_STRING_OBSERVATION_REPLY/u, text); }
  const missing = sample("MI.manager=null;").result.value; assert.ok(typeof missing === "string");
  assert.throws(() => decodeCurrentPcbStringProducerMarkers(pcbStringReply(missing.replace('"state":null', '"state":{}'))), /PCB_STRING_OBSERVATION_REPLY/u);
});

void test("producer marker leaf passes synthetic V8 effect checks and refuses proxies without running traps", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
      "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    const context = pcbStringObservationFixture(false, `${SETUP}MI.manager=null;`);
    assert.notEqual(uniqueContextId, "");
    const expression = `(${CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors)`;
    const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
      awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
      userGesture: false, generatePreview: false, timeout: 1000 };
    // Node does not declare uniqueContextId and selects its void overload.
    const initial = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    decodeCurrentPcbStringProducerMarkers(initial);
    runInContext("FP.manager=new FP();MI.manager=new MI();scope.object.ze.debounce.func=()=>{vendorCalls++;};scope.object.ze.debounce.animationFrameId=0;", context);
    const observed = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    const present = decodeCurrentPcbStringProducerMarkers(observed);
    assert.equal(present.notification.frameId, 0); assert.equal(present.notification.funcMarker, "function");
    runInContext('scope.object.ze.updateNets=new Proxy(scope.object.ze.updateNets,{ownKeys(o){getterReads++;return Reflect.ownKeys(o);}});', context);
    const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    assert.throws(() => decodeCurrentPcbStringProducerMarkers(refused), /PCB_STRING_OBSERVATION_REPLY/u);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});
