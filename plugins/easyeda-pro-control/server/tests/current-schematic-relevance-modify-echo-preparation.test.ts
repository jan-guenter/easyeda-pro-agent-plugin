/** Passive program and protocol checks. Synthetic references grant no native qualification. */
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_PROGRAMS as P } from "../src/current-schematic-relevance-modify-echo-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEchoCommand as validate } from "../src/current-schematic-relevance-modify-echo-protocol.ts";
import { collectCurrentSchematicRelevanceModifyEcho } from "../src/current-schematic-relevance-modify-echo-collector.ts";
import type { CurrentSchematicRelevanceSdkGateInputs } from "../src/current-schematic-relevance-sdk-gate-collector.ts";
import type { CurrentSchematicRelevancePublicationNativePrepared } from "../src/current-schematic-relevance-publication-native-collector.ts";

void test("closed Echo vocabulary rejects mutation, programs, flags and extra arguments", () => {
  for (const [role, program, arity, byValue] of CALLS) {
    const command = { phase: "modify-echo-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: program, arguments: Array.from({ length: arity }, () => ({ objectId: "dependency" })), returnByValue: byValue, awaitPromise: false, userGesture: false } };
    assert.ok(Object.isFrozen(validate(command)));
    for (const key of ["functionDeclaration", "returnByValue", "throwOnSideEffect", "awaitPromise", "userGesture"] as const) { const changed = structuredClone(command); Reflect.set(changed.params, key, key === "functionDeclaration" ? "function(){this.postMessage({});}" : !changed.params[key]); assert.throws(() => { validate(changed); }); }
    const extra = structuredClone(command); extra.params.arguments.push({ objectId: "extra" }); assert.throws(() => { validate(extra); });
  }
  assert.throws(() => { validate({ phase: "modify-echo-call", method: "Debugger.resume", params: {} }); });
  assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.publicationReproofReads, 24); assert.equal(REQUESTS.publicationReproofHelpers, 24); assert.equal(REQUESTS.publicationReproofs, 2); assert.equal(REQUESTS.total, REQUESTS.reads + REQUESTS.helpers);
});

void test("pre-event references never invoke Event getters and handler reread uses JS identity", () => {
  const context = createContext({});
  runInContext(`"use strict";let eventReads=0,channelReads=0,handlerCalls=0;
    function Event(){throw "no event construction"}function MessageEvent(){throw "no event construction"}
    Object.setPrototypeOf(MessageEvent,Event);Object.setPrototypeOf(MessageEvent.prototype,Event.prototype);
    for(const key of ["target","type","currentTarget","eventPhase"])Object.defineProperty(Event.prototype,key,{get:function(){eventReads++;throw "event getter"},enumerable:true,configurable:true});
    for(const key of ["data","origin","source"])Object.defineProperty(MessageEvent.prototype,key,{get:function(){eventReads++;throw "event getter"},enumerable:true,configurable:true});
    let registered=function(){handlerCalls++};function BroadcastChannel(){};
    Object.defineProperty(BroadcastChannel.prototype,"onmessage",{get:function(){channelReads++;return registered},set:function(){throw "setter"},enumerable:true,configurable:true});
    const bc=Object.create(BroadcastChannel.prototype),bus={bc,onMessage:function(){throw "application call"}},roots=[{},bus,bc,{},{},{},{},"channel"],natives=[BroadcastChannel,BroadcastChannel.prototype,null,null,null,null,null,null,null,globalThis];
    const d=Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,"onmessage"),functions=[null,null,d.get,d.set],getterTuple=[d.get];
    const intrinsics=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    let qualified=[globalThis,Event,MessageEvent,Event.prototype,MessageEvent.prototype];
    const constructors=(${P.constructors}).call(intrinsics,qualified,natives),prototypes=(${P.prototypes}).call(intrinsics,qualified,constructors),members=(${P.members}).call(intrinsics,qualified,prototypes);
    qualified=qualified.concat(members);
    const native=()=>(${P.native}).call(intrinsics,qualified,constructors,prototypes,members,natives);
    const capture=()=>(${P.handler}).call(intrinsics,natives,functions,roots,getterTuple),original=capture();
    const same=()=>(${P.handlerSame}).call(intrinsics,natives,functions,roots,getterTuple,original);
    native();same();`, context);
  assert.equal(runInContext("eventReads", context), 0); assert.equal(runInContext("handlerCalls", context), 0); assert.equal(runInContext("channelReads", context), 2);
  runInContext("registered=function(){handlerCalls++}", context); assert.throws(() => { runInContext("same()", context); });
  assert.equal(runInContext("eventReads", context), 0); assert.equal(runInContext("handlerCalls", context), 0);
  runInContext('Object.defineProperty(MessageEvent.prototype,"data",{get:function(){eventReads++},enumerable:true,configurable:true})', context); assert.throws(() => { runInContext("native()", context); });
  assert.equal(runInContext("eventReads", context), 0);
});

void test("collector refuses original dependency drift before source or native handler access", async () => {
  const calls: Parameters<Parameters<typeof collectCurrentSchematicRelevanceModifyEcho>[0]["request"]>[0][] = []; let checks = 0;
  // Deliberately incomplete supplied data cannot recreate original custody.
  // The very first stable-dependency reproof must fail closed.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Incomplete inputs must fail the first original-dependency check.
  const input = { raw: { nativeObjectId: "raw" }, clone: {}, ui: {} } as unknown as CurrentSchematicRelevanceSdkGateInputs;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Incomplete publication data must not recreate original custody.
  const publication = { dependencyObjectsObjectId: "dependencies", dependencySnapshotObjectId: "snapshot" } as unknown as CurrentSchematicRelevancePublicationNativePrepared;
  await assert.rejects(collectCurrentSchematicRelevanceModifyEcho({ current: () => { checks += 1; }, request: command => { calls.push(command); return Promise.resolve({ result: { type: "boolean", value: false } }); } }, input, publication));
  assert.equal(calls.length, 1); assert.ok(checks > 0); assert.equal(calls[0]?.phase === "publication-native-call" ? calls[0].role : null, "same-snapshot");
});
