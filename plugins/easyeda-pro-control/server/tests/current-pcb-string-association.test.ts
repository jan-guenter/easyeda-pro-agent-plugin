import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION,
  CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION, CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION,
  CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION,
  compareCurrentPcbStringChannelAssociation, decodeCurrentPcbStringRendererAssociation,
  decodeCurrentPcbStringWorkerAfterCreate, decodeCurrentPcbStringWorkerAfterSave,
  decodeCurrentPcbStringWorkerAssociation } from "../src/current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, decodeCurrentPcbStringEmptyProducers } from "../src/current-pcb-string-empty-producers.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function renderer(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(pcbStringObservationFixture(false, change), CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION));
}
function worker(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(runInContext(CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION,
    pcbStringObservationFixture(true, change), { timeout: 1000 }) as unknown);
}

void test("renderer and worker expose source-derived channel relation without issuing an owner", () => {
  const r = renderer(), state = decodeCurrentPcbStringRendererAssociation(r), w = worker();
  assert.equal(state.identity.client, "window_1");
  assert.equal(state.compilerState.isDestroy, false);
  assert.equal(state.channelState.temporaryUnlock, "absent");
  assert.deepEqual(state.compilerRegistry, { PCB: ["c".repeat(16)], FOOTPRINT: [] });
  assert.deepEqual(decodeCurrentPcbStringWorkerAssociation(w).uniqueIdsKeys, []);
  const joined = compareCurrentPcbStringChannelAssociation(r, w);
  assert.equal(joined.suppliedChannelRelationMatches, true);
  assert.equal(joined.identity.branchUuid, "b".repeat(32));
  assert.equal(joined.projectWorkerAssociationVerified, false);
  assert.equal(joined.publicationDelivered, false);
  assert.equal(joined.saveAuthorized, false);
  assert.equal(joined.executionAuthorized, false);
  assert.equal(Object.isFrozen(joined.identity), true);
});

void test("renderer rejects alternate compiler membership, substituted bus and wrong raw owner fields", () => {
  for (const change of [
    'scope.object.x.env._compiler.base.dataBus=new J(name);',
    'scope.object.x.env._compiler.base.dataBus.bc._name="/foreign/project/"+"a".repeat(64);',
    'scope.object.x.env._compiler.base.dataBus.bc=new(class extends BroadcastChannel{})(name);',
    'Object.defineProperty(scope.object.x.env._compiler.base.dataBus.bc,"name",{value:name});',
    'scope.object.x.env._compiler.base.isDestroy=null;',
    'scope.object.x.env._compiler.consistencyManager.client="foreign";',
    'scope.object.x.env.compilerChannel.compiler.PCB.set("e".repeat(16),{});',
    'scope.object.x.env.compilerChannel.compiler.FOOTPRINT.set("e".repeat(16),{});',
    'scope.object.x.env.compilerChannel.compiler.UNKNOWN=new Map();',
    'scope.object.wi.manager.map.set("hidden",{});',
    'scope.object.wi.otherProjectManagerMap.hidden={};',
    'scope.object.wi.otherDecodingProjectId="other";',
    'scope.object.x.env.compilerChannel._locker=-0;',
    'Object.defineProperty(scope.object.x.env._compiler.base,"dataBus",{get(){getterReads++;return globalThis[name];}});',
  ]) { assert.throws(() => renderer(change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("complete empty worker memberships reject every occupied inventory without reading its payload", () => {
  for (const field of ["task1", "task2", "task3", "cachePromise", "publishTask", "rollbackPromise",
    "syncPendingNodeUuids", "confirmedEmptyNodeUuids", "warnedEmptyNodeUuids"]) {
    assert.throws(() => worker(`PROJECT.${field}.add({});`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
  for (const field of ["bufferUploadData", "bufferUploadCache"]) {
    assert.throws(() => worker(`PROJECT.${field}.set("private",{});`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
  for (const change of [
    'PROJECT.consistencyManager.uniqueIds.hidden={};',
    'PROJECT.workerBus=new JP(name);',
    'PROJECT.workerBus.bc._name="other";',
    'PROJECT.task1=new(class extends Set{})();',
    'Object.defineProperty(PROJECT,"task1",{get(){getterReads++;return new Set();}});',
  ]) { assert.throws(() => worker(change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("supplied channel comparison requires matching project/window and distinct bus endpoints", () => {
  assert.throws(() => compareCurrentPcbStringChannelAssociation(renderer(),
    worker('PROJECT.workerBus.uuid="11111111-1111-4111-8111-111111111111";')), /PCB_STRING_CHANNEL_ASSOCIATION/u);
  const different = worker('PROJECT.uuid="f".repeat(64);const other="/window_1/project/"+PROJECT.uuid;PROJECT.workerBus=new JP(other);globalThis[other]=PROJECT.workerBus;');
  assert.throws(() => compareCurrentPcbStringChannelAssociation(renderer(), different), /PCB_STRING_CHANNEL_ASSOCIATION/u);
});

void test("strict reply decoders reject spoofed claims, duplicate keys, null isDestroy and hostile envelopes", () => {
  const r = renderer().result.value, w = worker().result.value;
  assert.ok(typeof r === "string" && typeof w === "string");
  for (const input of [
    pcbStringReply(r.replace('"isDestroy":false', '"isDestroy":null')),
    pcbStringReply(r.replace('"isDestroy":false', '"isDestroy":false,"isDestroy":false')),
    pcbStringReply(r.replace('"identity":', '"saveAuthorized":true,"identity":')),
    { result: { type: "string", value: r, objectId: "remote" } },
    { result: { type: "string", value: r }, exceptionDetails: {} },
  ]) { assert.throws(() => decodeCurrentPcbStringRendererAssociation(input), /PCB_STRING_OBSERVATION_REPLY/u); }
  assert.throws(() => decodeCurrentPcbStringWorkerAssociation(pcbStringReply(
    w.replace('"uniqueIdsKeys":[]', '"uniqueIdsKeys":["hidden"]'))), /PCB_STRING_OBSERVATION_REPLY/u);
  let reads = 0;
  const getter = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  const proxy = new Proxy({}, { ownKeys(): never { reads += 1; throw new Error("PROXY"); } });
  for (const value of [getter, proxy]) {
    assert.throws(() => decodeCurrentPcbStringRendererAssociation(value), /PCB_STRING_OBSERVATION_REPLY/u);
    assert.throws(() => decodeCurrentPcbStringWorkerAssociation(value), /PCB_STRING_OBSERVATION_REPLY/u);
  }
  assert.equal(reads, 0);
});

/** Real in-process V8 effect check over synthetic classes and a synthetic name
 * getter. No browser, real BroadcastChannel, native app or worker is created. */
void test("fixed association and empty observations survive V8 effect checking and refuse mutating proxy traps", async () => {
  const session = new Session(); session.connect();
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const [source, workerRole, decoder, setup] of [
      [CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, false, decodeCurrentPcbStringRendererAssociation, ""],
      [CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, false, decodeCurrentPcbStringEmptyProducers, ""],
      [CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION, true, decodeCurrentPcbStringWorkerAssociation, ""],
      [CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION, true, decodeCurrentPcbStringWorkerAfterCreate,
        'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]={["d".repeat(16)]:new Set(["e".repeat(16)])};'],
      [CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION, true, decodeCurrentPcbStringWorkerAfterSave,
        'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]={};'],
    ] as const) {
      const context = pcbStringObservationFixture(workerRole, setup);
      assert.notEqual(uniqueContextId, "");
      const expression = workerRole ? source :
        `(${source}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors)`;
      const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
        awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
        userGesture: false, generatePreview: false, timeout: 1000 };
      // Node's declarations omit uniqueContextId and select a void overload;
      // The actual protocol response is decoded as unknown.
      const observed = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      decoder(observed);
      runInContext(workerRole ?
        'PROJECT=new Proxy(PROJECT,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});' :
        'scope.object.x.env=new Proxy(scope.object.x.env,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});', context);
      const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      assert.throws(() => decoder(refused), /PCB_STRING_OBSERVATION_REPLY/u);
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});

function phasedWorker(phase: "after-create" | "after-save", change = ""): ReturnType<typeof pcbStringReply> {
  const setup = phase === "after-create" ?
    'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]={["d".repeat(16)]:new Set(["e".repeat(16)])};' :
    'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]={};';
  const source = phase === "after-create" ? CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION : CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION;
  return pcbStringReply(runInContext(source, pcbStringObservationFixture(true, setup + change), { timeout: 1000 }) as unknown);
}

void test("phase-specific worker readers retain one pending String then the compressed empty token", () => {
  const created = phasedWorker("after-create"), saved = phasedWorker("after-save");
  const c = decodeCurrentPcbStringWorkerAfterCreate(created), s = decodeCurrentPcbStringWorkerAfterSave(saved);
  assert.equal(c.uniqueId, "c".repeat(16)); assert.equal(c.documentUuid, "d".repeat(16)); assert.equal(c.primitiveId, "e".repeat(16));
  assert.equal(s.uniqueId, c.uniqueId); assert.deepEqual(s.documentKeys, []);
  assert.equal(c.publicationDelivered, false); assert.equal(s.queueCompletionVerified, false); assert.equal(s.saveAuthorized, false);
  assert.throws(() => decodeCurrentPcbStringWorkerAssociation(created), /PCB_STRING_OBSERVATION_REPLY/u);
  assert.throws(() => decodeCurrentPcbStringWorkerAfterCreate(saved), /PCB_STRING_OBSERVATION_REPLY/u);
  assert.throws(() => decodeCurrentPcbStringWorkerAfterSave(created), /PCB_STRING_OBSERVATION_REPLY/u);
});

void test("phase-specific worker readers refuse extra tokens, documents, IDs and pending uploads", () => {
  for (const phase of ["after-create", "after-save"] as const) {
    for (const change of [
      'PROJECT.consistencyManager.uniqueIds["f".repeat(16)]={};',
      'PROJECT.consistencyManager.uniqueIds={};',
      'PROJECT.consistencyManager.uniqueIds["c".repeat(16)].FONT=new Set();',
      'PROJECT.task1.add({});',
      'PROJECT.bufferUploadData.set("private",{});',
    ]) { assert.throws(() => phasedWorker(phase, change), /PCB_STRING_OBSERVATION_STATE/u, `${phase}: ${change}`); }
  }
  for (const change of [
    'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]["d".repeat(16)].add("f".repeat(16));',
    'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]["d".repeat(16)].clear();',
    'PROJECT.consistencyManager.uniqueIds["c".repeat(16)]["d".repeat(16)]=["e".repeat(16)];',
  ]) { assert.throws(() => phasedWorker("after-create", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});
