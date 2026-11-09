/** Synthetic descriptor/collection observations only. No native delivery,
 * application execution, original owner or saved-result proof is implied. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_PROGRAMS as P } from "../src/current-schematic-relevance-modify-canvas-send-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyCanvasSendCommand as validate } from "../src/current-schematic-relevance-modify-canvas-send-protocol.ts";
import { currentSchematicRelevanceModifyCanvasSendCases as cases, currentSchematicRelevanceModifyCanvasSendWire as wire } from "../src/current-schematic-relevance-modify-canvas-send-wire.ts";
import { currentSchematicRelevanceModifyCanvasSendNativeSource as native } from "../src/current-schematic-relevance-modify-canvas-send-native.ts";
import { currentSchematicRelevanceModifyCanvasSendPromise as promise } from "../src/current-schematic-relevance-modify-canvas-send-collector.ts";

function fixture(): ReturnType<typeof createContext> {
  const realm = createContext({});
  runInContext(`"use strict";let appCalls=0;
    class BC{postMessage(){appCalls++}}class Bus{publish(){appCalls++}broadcastPublish(){appCalls++}post(){appCalls++}onMessage(){appCalls++}}
    const bc=new BC,bus=Object.assign(new Bus,{bc,uuid:"sender",subscribed:{}}),p={workerBus:bus},sheet={canvasTimer:4,revokeTimer:null},node={},cache=new Map,tasks=new Set,peers=new Map([["peer",-0]]),promise=new Promise(()=>{}),resolver=()=>{appCalls++},row=["text",7,"body","TEXT","client",true,"unique",false,undefined],rows=[row],created=[resolver,promise,rows];cache.set("page",rows);tasks.add(promise);
    const roots=[p,sheet,{},{},{},{},node,{},{},{},{},cache,{},tasks],functions=[()=>{},()=>{},()=>{},bus.publish,bus.broadcastPublish,bus.post],workerFunctions=Array(10).fill(null);workerFunctions[4]=bus.onMessage;
    const parts=Array(14).fill(null);parts[0]=Promise.prototype;parts[1]=Promise.resolve;parts[2]=Promise.prototype.then;parts[12]=console;parts[13]=console.debug;
    const members=Array(11).fill(null);members[3]=BC.prototype.postMessage;const busTuple=[bus,bc,bus.subscribed],change=Array(14).fill(null);change[1]="page";change[2]="text";change[3]="body";change[5]="client";change[6]=7;change[11]="unique";
    const envelope={type:"PUBLISH",uuid:"sender",topic:"/pro-mgr/canvas/page/update",message:rows},post=[bus,envelope],publish=[bus,envelope.topic,rows],timerFrame=[sheet,resolver,promise],collections=[cache,tasks,peers],before=[[cache,"map",[["page",rows]]],[tasks,"set",[[promise]]],[peers,"map",[["peer",-0]]]];
    const native=Array(18).fill(null);native[1]=Map.prototype;native[3]=Set.prototype;native[6]=Map.prototype.forEach;native[7]=Object.getOwnPropertyDescriptor(Map.prototype,"size").get;native[11]=Set.prototype.forEach;native[12]=Object.getOwnPropertyDescriptor(Set.prototype,"size").get;
    const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],qualified=[globalThis,p,sheet,node,bus,bc,bus.subscribed,Promise,Promise.prototype,console,console.debug,BC.prototype,Bus.prototype,Map.prototype,Set.prototype,Object.prototype,Array.prototype,Function.prototype,promise,resolver,rows,row,envelope,cache,tasks,peers];`, realm);
  return realm;
}
function evaluate(realm: ReturnType<typeof fixture>, source: string, args: string): unknown { return runInContext(`(${source}).call(I11,${args})`, realm); }

void test("sender uses the original rows, native dependencies and exact PUBLISH payload without application calls", () => {
  const realm = fixture();
  const bindings = evaluate(realm, P.bindings, "roots,functions,workerFunctions,parts,members,busTuple,created,qualified"); assert.ok(Array.isArray(bindings)); assert.equal(bindings[0], runInContext("bus.onMessage", realm));
  assert.equal(evaluate(realm, P.publish, "publish,change,created,busTuple,qualified"), true);
  assert.deepEqual(structuredClone(evaluate(realm, P.payload, "post,roots,created,change,busTuple,qualified")), ["sender", "/pro-mgr/canvas/page/update", "page", "text", 7, "body", "TEXT", "client", true, "unique", false, false, null]);
  for (const change of ["envelope.uuid='other'", "envelope.message=[row]", "row[1]=8", "row[8]=-0", "Object.defineProperty(envelope,'topic',{get(){appCalls++;return 'x'}})"]) { const fresh = fixture(); runInContext(change, fresh); assert.throws(() => { evaluate(fresh, P.payload, "post,roots,created,change,busTuple,qualified"); }); assert.equal(runInContext("appCalls", fresh), 0); }
  assert.equal(runInContext("appCalls", realm), 0);
});

void test("timer return permits only its original timer field, sole cache/task removals and unchanged ordered peers", () => {
  const realm = fixture(); runInContext(`const snapshot=(${P.snapshot}).call(I11,qualified);sheet.canvasTimer=null;cache.clear();tasks.clear();`, realm);
  assert.equal(evaluate(realm, P.timerDelta, "snapshot,qualified,roots"), true); assert.equal(evaluate(realm, P.collectionDelta, "before,collections,native,roots,created,change,qualified"), true); assert.equal(evaluate(realm, P.timerFrame, "timerFrame,roots,created,qualified"), true);
  runInContext("peers.set('peer',0)", realm); assert.throws(() => { evaluate(realm, P.collectionDelta, "before,collections,native,roots,created,change,qualified"); });
  const fresh = fixture(); runInContext(`const secret=Symbol('peer');sheet[secret]=-0;const snapshot=(${P.snapshot}).call(I11,qualified);sheet.canvasTimer=null;sheet[secret]=0`, fresh); assert.throws(() => { evaluate(fresh, P.timerDelta, "snapshot,qualified,roots"); });
  const extra = fixture(); runInContext("before[0][2].push(['other',rows]);cache.clear();tasks.clear()", extra); assert.throws(() => { evaluate(extra, P.collectionDelta, "before,collections,native,roots,created,change,qualified"); }); assert.equal(runInContext("appCalls", extra), 0);
});

void test("loopback requires the identical envelope and rejects inherited topic handlers without invoking them", () => {
  const realm = fixture(); assert.equal(evaluate(realm, P.loopback, "post,post,busTuple,parts,qualified"), true);
  runInContext("const copy=[bus,{...envelope}];qualified.push(copy[1])", realm); assert.throws(() => { evaluate(realm, P.loopback, "copy,post,busTuple,parts,qualified"); });
  const fresh = fixture(); runInContext("Object.defineProperty(Object.prototype,envelope.topic,{get(){appCalls++;return []},configurable:true})", fresh); assert.throws(() => { evaluate(fresh, P.loopback, "post,post,busTuple,parts,qualified"); }); assert.equal(runInContext("appCalls", fresh), 0);
});

const packet = (state: string, result: unknown): unknown => ({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "original_prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: state } }, { name: "[[PromiseResult]]", value: result }] });

void test("native Promise completion must be fulfilled undefined and finite sender packets reject arbitrary programs and controls", () => {
  assert.equal(promise(packet("fulfilled", { type: "undefined" }), "fulfilled"), "original_prototype"); assert.throws(() => { promise(packet("fulfilled", { type: "boolean", value: true }), "fulfilled"); }); assert.throws(() => { promise(packet("pending", { type: "undefined" }), "fulfilled"); });
  for (const command of cases()) { assert.deepEqual(wire(command, 83).command, command); if (command.phase === "modify-canvas-send-call") { assert.throws(() => { validate({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }); }); } }
  assert.throws(() => { validate({ phase: "modify-canvas-send-resume", method: "Debugger.resume", params: {} }); }); assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.reads, REQUESTS.beforeReads + REQUESTS.publishReads + REQUESTS.postReads * 2 + REQUESTS.timerReturnReads + REQUESTS.loopbackReads * 2); assert.ok(native().includes("EasyedaSchematicRelevanceModifyCanvasProtocol.Programs"));
});
