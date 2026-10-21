import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, CURRENT_PCB_STRING_WORKER_GATE_SELECTOR,
  decodeCurrentPcbStringWorkerGates } from "../src/current-pcb-string-worker-gate-program.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_ORDER, decodeCurrentPcbStringWorkerGateBundle,
  decodeCurrentPcbStringWorkerGateProperties, decodeCurrentPcbStringWorkerGateScope,
  decodeCurrentPcbStringWorkerGateTuple } from "../src/current-pcb-string-worker-gate-scope.ts";
import { currentPcbStringWorkerGateFixture } from "./helpers/current-pcb-string-worker-gate-fixture.ts";

void test("original effect-checked worker methods and scope qualify gates without calling native bodies", async () => {
  const session = new Session(); session.connect(); let contextId = 0, paused = false, scriptId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "worker-gates") { contextId = params.context.id; }
  });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === "worker-gates.js") { scriptId = params.scriptId; } });
  session.on("Debugger.paused", (): void => { paused = true; });
  const properties = (objectId: string): Promise<unknown> => session.post("Runtime.getProperties",
    { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = createContext({}, { name: "worker-gates" });
    runInContext(currentPcbStringWorkerGateFixture(), context, { filename: "worker-gates.js", timeout: 1000 });
    const result = await (session.post("Runtime.evaluate", { expression: "PROJECT", contextId,
      returnByValue: false, objectGroup: "worker-gates", throwOnSideEffect: true, silent: true }) as Promise<unknown>);
    const project = z.object({ result: z.object({ objectId: z.string() }) }).parse(result).result.objectId;
    const call = (program: string, handles: readonly string[] = [], returnByValue = false): Promise<unknown> => session.post("Runtime.callFunctionOn", {
      objectId: project, functionDeclaration: program, arguments: handles.map(objectId => ({ objectId })),
      objectGroup: "worker-gates", returnByValue, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false,
    });
    const bundle = decodeCurrentPcbStringWorkerGateBundle(await call(CURRENT_PCB_STRING_WORKER_GATE_SELECTOR));
    const tupleReply = await properties(bundle);
    const methods = decodeCurrentPcbStringWorkerGateTuple(tupleReply);
    assert.equal(methods.length, 8);
    let canPublish = "";
    for (const [index, kind] of CURRENT_PCB_STRING_WORKER_GATE_ORDER.entries()) {
      const method = methods[index]; assert.ok(method !== undefined);
      const reply = await properties(method), value = decodeCurrentPcbStringWorkerGateProperties(reply, scriptId, kind);
      assert.equal(value.methodReceiverVerified, false);
      assert.throws(() => decodeCurrentPcbStringWorkerGateProperties(reply, "foreign-script", kind), /WORKER_GATE_SCOPE/u);
      if (kind === "canPublish") { canPublish = method; }
    }
    const scope = async (): Promise<string> => {
      const list = decodeCurrentPcbStringWorkerGateProperties(await properties(canPublish), scriptId, "canPublish");
      return decodeCurrentPcbStringWorkerGateScope(await properties(list.scopesId));
    };
    const read = async (): Promise<ReturnType<typeof decodeCurrentPcbStringWorkerGates>> =>
      decodeCurrentPcbStringWorkerGates(await call(CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, [bundle, await scope()], true));
    const initial = await read();
    assert.deepEqual(initial.raw.isSyncing, { state: "absent", value: null });
    assert.equal(initial.predicates.canWsPublish, false);
    // Private mode gates canWsPublish, but does not gate the cooperation callback.
    assert.equal(initial.predicates.cooperationCallbackGateOpen, true);
    assert.equal(initial.predicates.structureCallbackStateGateOpen, true);
    assert.equal(initial.writeDestinationsContained, false); assert.equal(initial.executionAuthorized, false);
    assert.equal(initial.publisher.nativeChannelVerified, false); assert.equal(initial.hiddenCallbackReceiversVerified, false);
    runInContext("setPrivate(true);PROJECT.isSyncing=undefined", context);
    const undefinedSync = await read(); assert.deepEqual(undefinedSync.raw.isSyncing, { state: "undefined", value: null });
    assert.equal(undefinedSync.predicates.canWsPublish, true);
    for (const [field, expectedReadOnly] of [["isTemporary", true], ["isHistoryBack", true], ["_isV2Format", true], ["isSyncing", false]] as const) {
      runInContext(`PROJECT.${field}=true`, context);
      const state = await read(); assert.equal(state.predicates.isReadOnly, expectedReadOnly); assert.equal(state.predicates.canWsPublish, false);
      runInContext(`PROJECT.${field}=false`, context);
    }
    for (const value of ["null", "1", '"false"', "{}"] as const) {
      runInContext(`PROJECT.isSyncing=${value}`, context); await assert.rejects(read(), /OBSERVATION_REPLY/u);
    }
    runInContext("delete PROJECT.isSyncing;Object.getPrototypeOf(PROJECT).isSyncing=false", context);
    await assert.rejects(read(), /OBSERVATION_REPLY/u);
    runInContext("delete Object.getPrototypeOf(PROJECT).isSyncing;PROJECT.canWsPublish=()=>false", context);
    await assert.rejects(read(), /OBSERVATION_REPLY/u);
    runInContext('delete PROJECT.canWsPublish;Object.defineProperty(PROJECT,"isReady",{get(){trapCalls++;return true},configurable:true})', context);
    await assert.rejects(read(), /OBSERVATION_REPLY/u);
    runInContext('Object.defineProperty(PROJECT,"isReady",{value:true,writable:true,configurable:true});globalThis.saved=PROJECT;PROJECT=new Proxy(PROJECT,{getOwnPropertyDescriptor(t,k){trapCalls++;return Reflect.getOwnPropertyDescriptor(t,k)}})', context);
    const proxy = await call(CURRENT_PCB_STRING_WORKER_GATE_SELECTOR);
    assert.throws(() => decodeCurrentPcbStringWorkerGateBundle(proxy), /WORKER_GATE_SCOPE/u);
    runInContext("PROJECT=saved;PROJECT.workerBus.post=()=>{}", context); await assert.rejects(read(), /OBSERVATION_REPLY/u);
    assert.equal(runInContext("trapCalls", context) as unknown, 0); assert.equal(paused, false);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "worker-gates" });
  } finally { session.disconnect(); }
});

void test("gate metadata rejects hostile values before traps and refuses incomplete tuples", () => {
  let calls = 0; const trap = (): never => { calls += 1; throw new Error("TRAP"); };
  for (const input of [new Proxy({}, { ownKeys: trap }), Object.defineProperty({}, "result", { get: trap }),
    { result: [], internalProperties: [] }]) {
    assert.throws(() => decodeCurrentPcbStringWorkerGateBundle(input), /WORKER_GATE_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringWorkerGateTuple(input), /WORKER_GATE_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringWorkerGateProperties(input, "script", "readOnly"), /WORKER_GATE_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringWorkerGateScope(input), /WORKER_GATE_SCOPE/u);
  }
  assert.equal(calls, 0);
});
