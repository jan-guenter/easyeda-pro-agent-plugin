import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "../src/current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_STRING_DEFAULT_BASE_ID, CURRENT_PCB_STRING_DEFAULT_BASE_KEY, CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS,
  compareCurrentPcbStringPhaseAssets, decodeCurrentPcbStringPhaseAssets } from "../src/current-pcb-string-phase-assets.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

type Phase = keyof typeof CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS;
const SETUP = `
class df{constructor(){this.map=new Map();this._last=undefined;this.uuidMap={};}}df.mgr=null;
class U8{constructor(){Object.assign(this,{num:1,type:0,origin:3,strokeWidth:.8,mirror:false,showKey:false,showValue:true,
fontFamily:"default",fontSize:12,reverse:false,reverseExpansion:0,positionIsNull:false,silkColor:make("ee",{r:0,g:0,b:0,alpha:1})});}}
class rd{constructor(base){Object.assign(this,{_globalIndex:"e".repeat(16),modelType:"Text",base,_dataState:65,_matrixChange:false,
_key:"",_value:"Test",_position:make("S",{x:12,y:-45}),_rotation:0});}}
class bo{constructor(){this.map=new Map();}}bo.manager=new bo();
class t7{constructor(){this.mgr=bo.manager;}}
Object.assign(scope.object,{df,U8,rd,bo,t7,Jr:new t7()});
`;
const CREATED = `
df.mgr=new df();const textBase=new U8(),model=new rd(textBase);
df.mgr.map.set(${JSON.stringify(CURRENT_PCB_STRING_DEFAULT_BASE_ID)},textBase);
df.mgr.uuidMap[${JSON.stringify(CURRENT_PCB_STRING_DEFAULT_BASE_KEY)}]=${JSON.stringify(CURRENT_PCB_STRING_DEFAULT_BASE_ID)};
bo.manager.map.set(model._globalIndex,model);
`;
function fixture(phase: Phase, change = ""): Context {
  return pcbCommonFixture(SETUP + (phase === "baseline" ? "" : CREATED) + change);
}
function sample(phase: Phase, change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(fixture(phase, change), CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS[phase]));
}
function raw(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(fixture("created", change), CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION));
}

void test("phase assets distinguishes absent and initialized-empty text bases from the one reciprocal U8", () => {
  const initial = decodeCurrentPcbStringPhaseAssets(sample("baseline"));
  assert.equal(initial.textBaseManager, null); assert.equal(initial.primitiveId, null);
  const initialized = decodeCurrentPcbStringPhaseAssets(sample("baseline", "df.mgr=new df();"));
  assert.deepEqual(initialized.textBaseManager, { count: 0, baseId: null, baseKey: null, last: "undefined" });
  for (const phase of ["created", "saved"] as const) {
    const result = decodeCurrentPcbStringPhaseAssets(sample(phase));
    assert.equal(result.phase, phase); assert.equal(result.primitiveId, "e".repeat(16));
    assert.equal(result.textBaseManager?.count, 1); assert.equal(result.textBaseManager.baseId, CURRENT_PCB_STRING_DEFAULT_BASE_ID);
    assert.equal(result.phaseLabelProvesDispatch, false); assert.equal(result.nativeSaveEffectVerified, false);
    assert.equal(result.persistenceVerified, false); assert.equal(result.executionAuthorized, false);
  }
});

void test("phase assets refuses extra bases, UUID keys, false reciprocal references and scalar changes", () => {
  for (const change of [
    'df.mgr.map.set("hidden",new U8());', 'df.mgr.uuidMap.hidden="unexpected";',
    'df.mgr.map.delete(Object.keys(df.mgr.uuidMap)[0]);df.mgr.map.clear();',
    'bo.manager.map.get("e".repeat(16)).base=new U8();', 'bo.manager.map.set("f".repeat(16),new rd(textBase));',
    'textBase.num=2;', 'textBase.num=-0;', 'textBase.type=1;', 'textBase.origin=0;', 'textBase.fontFamily="default2";',
    'textBase.strokeWidth=.9;', 'textBase.reverse=true;', 'textBase.positionIsNull=true;', 'textBase.silkColor.r=-0;',
    'textBase.silkColor.alpha=.5;', 'textBase.extra=true;', 'df.mgr._last=null;', 'df.mgr=null;',
    'bo.manager.map.get("e".repeat(16))._globalIndex="f".repeat(16);',
  ]) { assert.throws(() => sample("created", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
  assert.throws(() => sample("baseline", "df.mgr=undefined;"), /PCB_STRING_OBSERVATION_STATE/u);
  assert.throws(() => sample("baseline", CREATED), /PCB_STRING_OBSERVATION_STATE/u);
});

void test("default-font phase assets excludes custom FONT, unresolved text and BLOB changes in every phase", () => {
  for (const phase of ["baseline", "created", "saved"] as const) {
    for (const change of [
      'scope.object.nb.manager.map.set("font",{});', 'scope.object.H8.mgr.map.set("font",{});',
      'scope.object.H8.mgr.uuidMap.cached="font";', 'scope.object.Am.ins.texts.add({});',
      'scope.object.z8.ins.footprints.set({},{});', 'scope.object.id.map.set("blob",{});',
    ]) { assert.throws(() => sample(phase, change), /PCB_STRING_OBSERVATION_STATE/u, phase + change); }
  }
});

void test("supplied phase assets relation binds documents, identity, raw default base and unchanged custom assets", () => {
  const before = sample("baseline"), created = sample("created"), rawSample = raw(), saved = sample("saved");
  const result = compareCurrentPcbStringPhaseAssets(before, created, saved, rawSample, rawSample);
  assert.equal(result.suppliedPhaseAssetRelationMatches, true); assert.equal(result.baselineTextBaseInitialized, false);
  assert.equal(result.beforeBaseCount, 0); assert.equal(result.afterBaseCount, 1); assert.equal(result.executionAuthorized, false);
  assert.match(result.relationSha256, /^[a-f0-9]{64}$/u); assert.ok(Object.isFrozen(result));
  for (const changedRaw of [raw('model._value="Ω";'), raw('textBase.fontFamily="default2";'), raw('textBase.num=2;')]) {
    assert.throws(() => compareCurrentPcbStringPhaseAssets(before, created, saved, rawSample, changedRaw), /PCB_STRING_PHASE_ASSETS_RELATION/u);
  }
  assert.throws(() => compareCurrentPcbStringPhaseAssets(before, saved, created, rawSample, rawSample), /PCB_STRING_PHASE_ASSETS_RELATION/u);
  const other = sample("saved", 'x.env._id="f".repeat(16);');
  assert.throws(() => compareCurrentPcbStringPhaseAssets(before, created, other, rawSample, rawSample), /PCB_STRING_PHASE_ASSETS_RELATION/u);
  const changedAssets = sample("saved", "scope.object.nb.manager=null;");
  assert.throws(() => compareCurrentPcbStringPhaseAssets(before, created, changedAssets, rawSample, rawSample), /PCB_STRING_PHASE_ASSETS_RELATION/u);
});

void test("phase assets rejects malformed decodings and never invokes manager/base getters", () => {
  const context = fixture("created", 'Object.defineProperty(textBase,"num",{get(){getterReads++;return 1;}});');
  assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS.created), /PCB_STRING_OBSERVATION_STATE/u);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  const value = sample("created").result.value; assert.ok(typeof value === "string");
  for (const invalid of [
    value.replace('"count":1', '"count":0'), value.replace('"phase":"created"', '"phase":"baseline"'),
    value.replace(CURRENT_PCB_STRING_DEFAULT_BASE_ID, "f".repeat(32)),
    value.replace('"primitiveId":', '"saveAuthorized":true,"primitiveId":'),
  ]) { assert.throws(() => decodeCurrentPcbStringPhaseAssets(pcbStringReply(invalid)), /PCB_STRING_OBSERVATION_REPLY/u); }
});

void test("all fixed phase asset readers pass synthetic V8 side-effect checks and refuse a Proxy without traps", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
      "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const phase of ["baseline", "created", "saved"] as const) {
      const context = fixture(phase);
      assert.notEqual(uniqueContextId, "");
      const expression = `(${CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS[phase]}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,globalThis.producerConstructors)`;
      const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
        awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
        userGesture: false, generatePreview: false, timeout: 1000 };
      // Node does not declare uniqueContextId and selects its void overload.
      const observed = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      decodeCurrentPcbStringPhaseAssets(observed);
      runInContext('scope.object.bo.manager.map=new Proxy(scope.object.bo.manager.map,{getPrototypeOf(o){getterReads++;return Reflect.getPrototypeOf(o);}});', context);
      const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      assert.throws(() => decodeCurrentPcbStringPhaseAssets(refused), /PCB_STRING_OBSERVATION_REPLY/u);
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});
