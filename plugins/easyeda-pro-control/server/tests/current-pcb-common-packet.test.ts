import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ,
  CURRENT_PCB_COMMON_PACKET_RESULT, CURRENT_PCB_COMMON_PACKET_SEEDS } from "../src/current-pcb-common-packet-program.ts";
import { decodeCurrentPcbCommonPacketHandle } from "../src/current-pcb-common-packet.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";

const LARGE = `scope.object.Ke.manager.map.clear();for(let i=1;i<=270;i++){
const color=make("ee",{r:i/270,g:0,b:0,alpha:.5}),inactive=make("ee",{r:i/540,g:0,b:0,alpha:.5});
scope.object.Ke.manager.map.set(i,make("WA",{_temporaryActiveColor:undefined,layerId:i,type:"CUSTOM",hashed:i,name:"Custom Ω 中 😀"+i,status:make("Ff",{state:0}),_activeColor:color,deactiveColor:inactive}));}`;
const PROGRAMS = { presentation: CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, rules: CURRENT_PCB_COMMON_RULES_FUNCTION,
  preference: CURRENT_PCB_COMMON_PREFERENCE_FUNCTION } as const;

void test("bounded packets use exact effect-checked callFunctionOn and preserve complete native graph text", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" && "uniqueId" in params.context &&
        typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const leaf of ["presentation", "rules", "preference"] as const) {
      const context = pcbCommonFixture(leaf === "presentation" ? LARGE : "");
      const expected: unknown = runInContext(`(${PROGRAMS[leaf]}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors)`, context);
      const refs: string[] = [];
      for (const expression of ["scope", 'MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback', "producerConstructors"]) {
        const parameters = { expression, uniqueContextId, objectGroup: "common-packet-test",
          returnByValue: false, throwOnSideEffect: true, silent: true, timeout: 1000 };
        // Node's declarations omit uniqueContextId and choose the void overload.
        const reply = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
        assert.ok(reply !== null && typeof reply === "object" && "result" in reply);
        const remote = reply.result; assert.ok(remote !== null && typeof remote === "object" && "objectId" in remote && typeof remote.objectId === "string");
        refs.push(remote.objectId);
      }
      const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false,
        userGesture: false, objectGroup: "common-packet-test" } as const;
      assert.ok(refs[0] !== undefined && refs[1] !== undefined && refs[2] !== undefined);
      let packet = await session.post("Runtime.callFunctionOn", { ...effects, objectId: refs[0],
        functionDeclaration: CURRENT_PCB_COMMON_PACKET_SEEDS[leaf], returnByValue: false,
        arguments: [{ objectId: refs[1] }, { objectId: refs[2] }] });
      let complete = false, previousHandle: string | undefined, previousText: unknown;
      for (let sequence = 0; sequence < 512; sequence += 1) {
        assert.equal(packet.exceptionDetails, undefined); assert.ok(packet.result.objectId !== undefined);
        if (previousHandle !== undefined) {
          const old = await session.post("Runtime.callFunctionOn", { ...effects, objectId: previousHandle,
            functionDeclaration: CURRENT_PCB_COMMON_PACKET_READ, returnByValue: true });
          assert.equal(old.exceptionDetails, undefined); assert.equal(old.result.value, previousText);
        }
        const read = await session.post("Runtime.callFunctionOn", { ...effects, objectId: packet.result.objectId,
          functionDeclaration: CURRENT_PCB_COMMON_PACKET_READ, returnByValue: true });
        assert.equal(read.exceptionDetails, undefined); assert.equal(typeof read.result.value, "string");
        const chunk: unknown = JSON.parse(String(read.result.value));
        assert.ok(chunk !== null && typeof chunk === "object" && "sequence" in chunk && "phase" in chunk);
        assert.equal(chunk.sequence, sequence);
        if (chunk.phase === "complete") { complete = true; break; }
        previousHandle = packet.result.objectId; previousText = read.result.value;
        packet = await session.post("Runtime.callFunctionOn", { ...effects, objectId: packet.result.objectId,
          functionDeclaration: CURRENT_PCB_COMMON_PACKET_ADVANCE, returnByValue: false });
      }
      assert.equal(complete, true); assert.ok(packet.result.objectId !== undefined);
      const result = await session.post("Runtime.callFunctionOn", { ...effects, objectId: packet.result.objectId,
        functionDeclaration: CURRENT_PCB_COMMON_PACKET_RESULT, returnByValue: true });
      assert.equal(result.exceptionDetails, undefined); assert.equal(result.result.value, expected);
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
      await session.post("Runtime.releaseObjectGroup", { objectGroup: "common-packet-test" });
    }
  } finally { session.disconnect(); }
});

function vmPackets(change = ""): ReturnType<typeof pcbCommonFixture> {
  const context = pcbCommonFixture(change);
  runInContext(`globalThis.packet=(${CURRENT_PCB_COMMON_PACKET_SEEDS.presentation}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors);`, context);
  return context;
}
function advance(context: ReturnType<typeof pcbCommonFixture>): void {
  runInContext(`globalThis.packet=(${CURRENT_PCB_COMMON_PACKET_ADVANCE}).call(packet);`, context);
}
function finish(context: ReturnType<typeof pcbCommonFixture>): unknown {
  for (let step = 0; step < 512; step += 1) {
    if (runInContext("packet.state.phase", context) as unknown === "complete") {
      return runInContext(`(${CURRENT_PCB_COMMON_PACKET_RESULT}).call(packet)`, context) as unknown;
    }
    advance(context);
  }
  throw new Error("Synthetic packet sequence did not finish");
}

void test("packet reconstruction preserves aliases, cycles, collection order and signed zero", () => {
  const context = vmPackets(`const extra={zero:-0,text:"é中😀",hidden:undefined};extra.self=extra;
scope.object.Ke.manager.extra={first:extra,second:extra,map:new Map([[extra,"one"],["two",extra]]),set:new Set([extra,"last"])};`);
  const expected: unknown = runInContext(`(${CURRENT_PCB_COMMON_PRESENTATION_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors)`, context);
  assert.equal(finish(context), expected);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
});

void test("packet guards reprove constructor tuple, static flags, nested descriptors and members", () => {
  for (const change of [
    'producerConstructors.extra=true;',
    'Object.setPrototypeOf(producerConstructors,{});',
    'Object.defineProperty(producerConstructors[0],"name",{enumerable:true});',
  ]) {
    for (const complete of [false, true]) {
      const context = vmPackets(); if (complete) { finish(context); }
      runInContext(change, context);
      assert.throws(() => { if (complete) { finish(context); } else { advance(context); } }, /PCB_COMMON_PACKET/u, change);
    }
  }
  for (const change of [
    'scope.object.Ke.manager.map.get(3).status.state=9;',
    'Object.defineProperty(scope.object.Ke.manager.map.get(3).status,"state",{enumerable:false});',
    'scope.object.Ke.manager.map.get(3).status.extra=1;',
    'scope.object.Ke.manager.extra.set("new",2);',
  ]) {
    const context = vmPackets('scope.object.Ke.manager.extra=new Map([["original",1]]);');
    do { advance(context); } while (runInContext("packet.state.phase", context) as unknown === "capture");
    runInContext(change, context); assert.throws(() => finish(context), /PCB_COMMON_PACKET/u, change);
  }
});

void test("packet traversal refuses unsupported shapes without invoking getters and handle decoder rejects proxies", () => {
  for (const change of [
    'Object.defineProperty(scope.object.Ke.manager,"extra",{get(){getterReads++;return 1;}});',
    'scope.object.Ke.manager.extra=new Date();', 'scope.object.Ke.manager.extra=[,1];',
    'scope.object.Ke.manager.extra=Infinity;', 'scope.object.Ke.manager.extra=()=>{};',
    'let tail=scope.object.Ke.manager;for(let i=0;i<34;i++){tail.extra={};tail=tail.extra;}',
  ]) {
    const context = vmPackets(change); assert.throws(() => finish(context), /PCB_COMMON_PACKET/u, change);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  }
  let traps = 0;
  const proxy = new Proxy({}, { ownKeys: (): never => { traps += 1; throw new Error("Unwanted trap"); } });
  assert.throws(() => decodeCurrentPcbCommonPacketHandle(proxy), /PCB_COMMON_PACKET_HANDLE/u); assert.equal(traps, 0);
});
