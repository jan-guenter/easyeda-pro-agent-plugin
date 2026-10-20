/** Synthetic receivers only: no application, native helper or filesystem. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { DORMANT_CURRENT_PCB_STRING_SAVE_FUNCTION, compareCurrentPcbStringSaveObservation,
  dormantCurrentPcbStringSaveArguments, planCurrentPcbStringSaveObservation } from "../src/current-pcb-string-save-observation.ts";
import type { CurrentPcbStringSaveObservationPlan } from "../src/current-pcb-string-save-observation.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const primitiveId = "d".repeat(16);
function plan(): CurrentPcbStringSaveObservationPlan {
  const create = planCurrentPcbStringCreateObservation(planCurrentPcbStringCreate({ x: 100, y: -20, text: "Saved" }), target);
  return planCurrentPcbStringSaveObservation(create, JSON.stringify({
    profile: "private.current-pcb-string-create-dormant-result.v1", planSha256: create.planSha256,
    completed: true, stage: "complete", dispatchAttempts: 1, acknowledgedPrimitiveId: primitiveId,
    matchingBeforeSamples: 2, matchingAfterSamples: 2,
    readback: { globalIndex: primitiveId, ...create.expectedExposedScalars }, deadlineExpired: false,
  }));
}
function fixture(options: { before?: string; afterCall?: string; fastDeadline?: boolean } = {}): {
  run: () => Promise<ReturnType<typeof compareCurrentPcbStringSaveObservation>>;
  evaluate: (source: string) => unknown;
} {
  const original = plan();
  const context = createContext({ setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
      assert.equal(delay, 15_000); return setTimeout(callback, 1);
    } : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis._TAB_ID_='original-window';
globalThis.target=${JSON.stringify(target)};globalThis.calls=0;globalThis.saves=0;globalThis.reads=0;globalThis.getters=0;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};globalThis.activeTab=target.tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tab.tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};
class Bus {async rpcCall(topic,arg,timeout){
 if(this!==child.MSG_BUS_PCB.messageBus||timeout!==0)throw new Error('RECEIVER');
 calls++;let reply;
 if(topic==='getTabIdAndDocType'&&arg===undefined){reads++;reply={tabId:target.tabId,docType:3};}
 else if(topic==='pcb/saveCompiler'&&arg===''){saves++;reply={success:true};}
 else throw new Error('UNEXPECTED_TOPIC');
 await Promise.resolve();${options.afterCall ?? ""}
 return {message:reply,bridge:undefined,source:undefined};
}}
globalThis.child={Object,Array,MSG_BUS_PCB:{messageBus:new Bus()}};
globalThis.attributes={'c_dbid':target.tabId,'c_doctype':'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: async (): Promise<ReturnType<typeof compareCurrentPcbStringSaveObservation>> => {
      const args = dormantCurrentPcbStringSaveArguments(original, "original-window").map(argument => argument.value);
      const result: unknown = await Promise.resolve(runInContext(
        `(${DORMANT_CURRENT_PCB_STRING_SAVE_FUNCTION})(...${JSON.stringify(args)})`, context, { timeout: 1000 }) as unknown);
      return compareCurrentPcbStringSaveObservation(original, result);
    },
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

void test("dormant canvas Save calls one exact service and keeps acknowledgment separate from persistence", async () => {
  const environment = fixture(), result = await environment.run();
  assert.equal(result.completed, true); assert.equal(result.saveAttempted, true); assert.equal(result.saveAcknowledgment, true);
  assert.equal(result.beforeIdentity, true); assert.equal(result.afterIdentity, true);
  assert.equal(environment.evaluate("calls"), 3); assert.equal(environment.evaluate("saves"), 1);
  for (const flag of ["liveExecutionVerified", "originalOwnerVerified", "saveEligibilityVerified", "fullSqlVerified",
    "queueCompletionVerified", "persistenceVerified", "reopened", "repeatAcrossInvocationsPrevented", "executionAuthorized"] as const) {
    assert.equal(result[flag], false);
  }
});

void test("dormant Save refuses changed original identity before dispatch", async () => {
  for (const before of ["_TAB_ID_='foreign';", "activeTab='foreign';", "attributes.fromFile='true';",
    "gVars.currentProject.branchUuid='foreign';", "tab.parentLibraryUuid='foreign';"]) {
    const environment = fixture({ before }), result = await environment.run();
    assert.equal(result.completed, false); assert.equal(result.saveAttempted, false);
    assert.equal(environment.evaluate("saves"), 0);
  }
});

void test("dormant Save retains true/false acknowledgments and never retries after malformed or replaced receivers", async () => {
  for (const mutation of ["_TAB_ID_='foreign';", "child.MSG_BUS_PCB={messageBus:new Bus()};", "reply.extra=true;"]) {
    const environment = fixture({ afterCall: `if(topic==='pcb/saveCompiler'){${mutation}}` });
    const result = await environment.run();
    assert.equal(result.completed, false); assert.equal(result.stage, "save"); assert.equal(result.saveAttempted, true);
    assert.equal(result.saveAcknowledgment, true); assert.equal(environment.evaluate("saves"), 1);
    assert.equal(environment.evaluate("calls"), 2);
  }
  const failed = fixture({ afterCall: "if(topic==='pcb/saveCompiler')reply={success:false,message:'Refused'};" });
  const failure = await failed.run();
  assert.equal(failure.saveAcknowledgment, false); assert.equal(failure.completed, false); assert.equal(failed.evaluate("saves"), 1);
  const accessor = fixture({ afterCall: "if(topic==='pcb/saveCompiler')Object.defineProperty(reply,'success',{get(){getters++;throw new Error('GETTER');}});" });
  const rejected = await accessor.run();
  assert.equal(rejected.saveAcknowledgment, null); assert.equal(rejected.saveAttempted, true); assert.equal(accessor.evaluate("getters"), 0);
});

void test("dormant Save timeout consumes the call and a late acknowledgment causes no follow-up call", async () => {
  const environment = fixture({ fastDeadline: true,
    afterCall: "if(topic==='pcb/saveCompiler')await new Promise(resolve=>{globalThis.release=resolve;});" });
  const result = await environment.run();
  assert.equal(result.stage, "save"); assert.equal(result.saveAttempted, true); assert.equal(result.deadlineExpired, true);
  assert.equal(result.saveAcknowledgment, null); assert.equal(environment.evaluate("calls"), 2);
  environment.evaluate("release()"); await yieldToEventLoop();
  assert.equal(environment.evaluate("calls"), 2); assert.equal(environment.evaluate("saves"), 1);
  assert.equal(result.saveAcknowledgment, null);
});

void test("Save plan/result validation rejects copied plans, forged completion and additional authority fields", () => {
  const original = plan();
  assert.throws(() => dormantCurrentPcbStringSaveArguments(structuredClone(original), "window"), /original/u);
  assert.throws(() => dormantCurrentPcbStringSaveArguments(original, "window/other"), /selector/u);
  const value = { profile: "private.current-pcb-string-save-dormant-result.v1", planSha256: original.planSha256,
    primitiveId, completed: true, stage: "complete", saveAttempted: true, saveAcknowledgment: true,
    beforeIdentity: true, afterIdentity: true, deadlineExpired: false };
  for (const changes of [{ saveAttempted: false }, { saveAcknowledgment: null }, { beforeIdentity: false },
    { afterIdentity: false }, { deadlineExpired: true }, { stage: "save" }, { executionAuthorized: true },
    { primitiveId: "e".repeat(16) }]) {
    assert.throws(() => compareCurrentPcbStringSaveObservation(original, JSON.stringify({ ...value, ...changes })));
  }
  assert.throws(() => compareCurrentPcbStringSaveObservation(structuredClone(original), JSON.stringify(value)), /original/u);
  assert.throws(() => compareCurrentPcbStringSaveObservation(original, " ".repeat(8193)), /bounded/u);
});

void test("Save result refuses contradictory duplicate fields, escaped aliases and malformed Unicode before decoding", () => {
  const original = plan();
  const encoded = JSON.stringify({ profile: "private.current-pcb-string-save-dormant-result.v1", planSha256: original.planSha256,
    primitiveId, completed: true, stage: "complete", saveAttempted: true, saveAcknowledgment: true,
    beforeIdentity: true, afterIdentity: true, deadlineExpired: false });
  assert.equal(compareCurrentPcbStringSaveObservation(original, encoded).completed, true);
  for (const changed of [
    encoded.replace('"completed":true', '"completed":false,"completed":true'),
    encoded.replace('"saveAttempted":true', String.raw`"saveAttempted":false,"save\u0041ttempted":true`),
    encoded.replace('"saveAcknowledgment":true', String.raw`"saveAcknowledgment":false,"\u0073aveAcknowledgment":true`),
  ]) {
    assert.notEqual(changed, encoded);
    assert.throws(() => compareCurrentPcbStringSaveObservation(original, changed), /FRAMING/u);
  }
  for (const surrogate of ["\uD800", "\uDFFF"]) {
    const malformed = encoded.replace('"completed"', `"${surrogate}completed"`);
    assert.equal(malformed.isWellFormed(), false);
    assert.throws(() => compareCurrentPcbStringSaveObservation(original, malformed), /bounded JSON/u);
  }
});
