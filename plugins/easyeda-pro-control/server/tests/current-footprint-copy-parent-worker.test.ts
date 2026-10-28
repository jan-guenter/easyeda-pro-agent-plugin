/** Synthetic owner/CDP and event-loop tests. No EasyEDA, browser-native
 * message delivery or original execution purpose is connected here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CurrentFootprintParentWorkerRunner, decodeCurrentFootprintParentWorkerNative } from "../src/current-footprint-copy-parent-worker-runner.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS as PROGRAMS } from "../src/current-footprint-copy-parent-worker-programs.ts";
import { validateCurrentFootprintParentWorkerCommand } from "../src/current-footprint-copy-parent-worker-wire.ts";

import { binding, fixture, native } from "./helpers/current-footprint-parent-worker-fixture.ts";

void test("private peer proof requires native metadata, fresh nonce receipt and removal before original manager join", async () => {
  const value = fixture(); const packet = await value.runner.observe();
  assert.equal(value.commands.length, 16); assert.equal(packet.parentWorkerNativeMessageReceivedByOriginalChild, true);
  assert.equal(packet.reciprocalProjectChannelQualified, false); assert.equal(packet.backendDynamicDispatchQualified, false);
  assert.match(value.state.nonce ?? "", /^[a-f\d]{64}$/u);
  await assert.rejects(value.runner.requireOriginal(structuredClone(packet))); assert.equal(value.commands.length, 16);
  await value.runner.requireOriginal(packet); assert.equal(value.commands.length, 18);
  await value.runner.joinOriginalManagerRoute(packet, "original-manager-route"); assert.equal(value.commands.length, 21);
  await value.runner.release(); assert.equal(value.commands.length, 23); assert.ok(value.runner.retained().released);
  await assert.rejects(value.runner.observe()); await assert.rejects(value.runner.requireOriginal(packet));
});
void test("wrong target receipt consumes postMessage and cannot resume, replay or issue peer proof", async () => {
  const value = fixture(); value.state.wrongReceipt = true;
  await assert.rejects(value.runner.observe()); await assert.rejects(value.runner.observe());
  assert.equal(value.commands.filter(command => command.phase === "parentSend").length, 1);
  assert.equal(value.runner.retained().completed, false); assert.equal(value.commands.some(command => command.phase === "parentRecheck"), false);
  await value.runner.release(); assert.ok(value.runner.retained().released);
});
void test("peer diagnostics retain the first bounded phase without exposing nonce or raw replies", async () => {
  const value = fixture(); value.state.failPhase = "childReceipt";
  await assert.rejects(value.runner.observe(), /lost native acknowledgment/u);
  const failure = value.runner.diagnostics().firstFailure;
  assert.equal(failure?.step, "childReceipt"); assert.equal(failure.stage, "bootstrap-idle");
  assert.equal(failure.kind, "request-or-owner"); assert.equal(failure.code, null);
  assert.equal(failure.requests, 14); assert.equal(failure.replies, 13);
  const text = JSON.stringify(value.runner.diagnostics());
  assert.equal(text.includes(value.state.nonce ?? "missing"), false);
  value.state.failReleaseSession = "parent"; await assert.rejects(value.runner.release());
  assert.equal(value.runner.diagnostics().firstFailure, failure);
  const fake = new CurrentFootprintParentWorkerRunner({ ...fixture().transport,
    request: (): Promise<never> => Promise.reject(new Error("FOOTPRINT_PARENT_WORKER_DEADLINE")) }, binding);
  await assert.rejects(fake.observe());
  assert.equal(fake.diagnostics().firstFailure?.kind, "request-or-owner");
  assert.equal(fake.diagnostics().firstFailure?.code, null);
});
void test("lost disposal acknowledgment is not retried and both group releases are attempted independently", async () => {
  const value = fixture(); value.state.failPhase = "childDispose";
  await assert.rejects(value.runner.observe(), /lost native acknowledgment/u); value.state.failReleaseSession = "parent";
  await assert.rejects(value.runner.release(), /CLEANUP_UNRESOLVED/u);
  assert.equal(value.commands.filter(command => command.phase === "childDispose").length, 1);
  assert.deepEqual(value.commands.filter(command => command.phase === "release").map(command => command.sessionId), ["parent", "child"]);
  await assert.rejects(value.runner.observeOriginalGenerationEnded(), /still alive/u);
  value.state.exited = true; await value.runner.observeOriginalGenerationEnded();
  assert.ok(value.runner.retained().originalGenerationEnded); assert.equal(value.runner.retained().listenerRemoved, false);
});
void test("contradictory removal receipt and replaced owner methods refuse without accepting a peer", async () => {
  const contradictory = fixture(); contradictory.state.disposeReceived = false;
  await assert.rejects(contradictory.runner.observe(), /DISPOSE_RECEIPT/u); assert.equal(contradictory.runner.retained().completed, false);
  const changed = fixture(); Object.defineProperty(changed.transport, "request", { value: (): Promise<unknown> => Promise.resolve({}) });
  await assert.rejects(changed.runner.observe(), /OWNER_CHANGED/u); assert.equal(changed.commands.length, 0);
  const metadata = native(0); metadata["internalProperties"] = [{ name: "[[FunctionLocation]]", value: { type: "object", objectId: "script" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[1]", objectId: "scope" } }];
  assert.throws(() => { decodeCurrentFootprintParentWorkerNative(metadata, "postMessage", 1); });
});
void test("fixed peer wire refuses nonce injection, dual contexts and side-effect flag changes", async () => {
  const value = fixture(); await value.runner.observe();
  for (const command of value.commands) {
    assert.throws(() => validateCurrentFootprintParentWorkerCommand({ ...command, arbitrary: true }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentFootprintParentWorkerCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }));
      assert.throws(() => validateCurrentFootprintParentWorkerCommand({ ...command, params: { ...command.params, throwOnSideEffect: !command.params.throwOnSideEffect } }));
      assert.throws(() => validateCurrentFootprintParentWorkerCommand({ ...command, params: { ...command.params, objectId: "object", uniqueContextId: "context" } }));
    }
  }
  await value.runner.release();
});

void test("fixed observer consumes only its diagnostic event, removes itself and prevents send replay", async () => {
  const text = String.raw`(async()=>{const listeners=[];let vendor=0,sends=0;
class EventTarget{addEventListener(type,callback){listeners.push({type,callback,capture:arguments[2]===true});}removeEventListener(type,callback){const i=listeners.findIndex(x=>x.type===type&&x.callback===callback);if(i>=0)listeners.splice(i,1);}}
class Event{constructor(type){this.kind=type;this.target=globalThis;this.stopped=false;this.isTrusted=true;}get type(){return this.kind;}get currentTarget(){return this.target;}stopImmediatePropagation(){this.stopped=true;}}
class MessageEvent extends Event{constructor(data){super("message");this.payload=data;}get data(){return this.payload;}}
const dispatch=data=>{const event=new MessageEvent(data);for(const item of [...listeners].sort((a,b)=>Number(b.capture)-Number(a.capture))){item.callback(event);if(event.stopped)break;}};
class Worker{postMessage(message){sends++;dispatch(message);}}
Object.assign(globalThis,{EventTarget,Event,MessageEvent,Worker});const intrinsics=new Set([Worker.prototype.postMessage,EventTarget.prototype.addEventListener,EventTarget.prototype.removeEventListener,Event.prototype.stopImmediatePropagation,...["data"].map(x=>Object.getOwnPropertyDescriptor(MessageEvent.prototype,x).get),...["type","currentTarget"].map(x=>Object.getOwnPropertyDescriptor(Event.prototype,x).get)]);
const toString=Function.prototype.toString;Function.prototype.toString=function(){return intrinsics.has(this)?"function "+this.name+"() { [native code] }":Reflect.apply(toString,this,[]);};
const programs=Object.fromEntries(Object.entries(source).map(([key,value])=>[key,eval("("+value+")")]));
const project={worker:new Worker},parent=programs.parentSelect.call(project),child=programs.childSelect.call(globalThis),nonce="a".repeat(64);
programs.childInstall.call(child,nonce);EventTarget.prototype.addEventListener.call(globalThis,"message",()=>{vendor++;});
dispatch({marker:"ordinary",nonce});if(vendor!==1)throw Error("ordinary event suppressed");
programs.parentSend.call(parent,nonce);const receipt=await programs.childReceipt.call(child,nonce);
if(!receipt.trusted||!receipt.removed||vendor!==1||sends!==1)throw Error("diagnostic escaped");
let refused=false;try{programs.parentSend.call(parent,nonce);}catch{refused=true;}if(!refused||sends!==1)throw Error("probe replay");
const removed=programs.childDispose.call(child,nonce);programs.childRecheck.call(child,nonce);
if(!removed.received||!removed.removed||removed.installed||listeners.length!==1)throw Error("observer retained");
const route=Array(11).fill({});route[2]=project;route[5]=project.worker;programs.managerJoin.call(parent,route,nonce);
route[5]=new Worker;let wrong=false;try{programs.managerJoin.call(parent,route,nonce);}catch{wrong=true;}if(!wrong)throw Error("wrong manager worker accepted");return true;})()`;
  const result: unknown = runInNewContext(text, { source: PROGRAMS }, { timeout: 1000 });
  assert.equal(await Promise.resolve(result), true);
});
