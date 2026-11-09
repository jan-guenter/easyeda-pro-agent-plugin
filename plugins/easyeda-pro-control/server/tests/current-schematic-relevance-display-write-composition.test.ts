/** Inert original-registry seams exercise the real group's scheduling only.
 * No application, inspector, owner allocation or writer is executed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CurrentSchematicRelevanceDisplayWriteObservers } from "../src/current-schematic-relevance-display-write-observers.ts";
import type { CurrentSchematicRelevanceDisplayWriteComposition } from "../src/current-schematic-relevance-display-write-composition.ts";
import type { GeneratedSchematicRelevanceDisplayDispatch } from "../src/generated-schematic-relevance-display-journal.ts";
import type { GeneratedSchematicRelevanceDisplayNativeEffect } from "../src/generated-schematic-relevance-display-effect.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

const CALLBACK_ORDER = [
  "observeEntry", "continueToFirstSetter", "observeFirstSetter", "observeUnderlineForwarding", "continueToSetAttribute", "observeSetAttribute", "observeActiveHistory",
  "observeUiPublicationPristine", "observeNormalCompletionGraph", "prepareOriginalPrimitive", "continueOriginalPrimitiveToRecord", "observeOriginalPrimitiveRecord",
  "prepareOriginalRecord", "continueOriginalRecordToAst", "observeOriginalAstHeld", "continueOriginalMonitorsToHistory", "continueOriginalHistoryToFinish",
  "continueOriginalNormalHistoryToCanRecord", "prepareOriginalListenerDisposal", "continueOriginalNormalRecordToUpload", "prepareOriginalNoEcho",
  "continueOriginalDidRecordToUploader", "continueOriginalUploaderToText", "continueOriginalTextToConsistency", "continueOriginalConsistencyToPendingCache",
  "continueOriginalPendingCacheBody", "continueOriginalUploaderToStatus", "continueOriginalStatusToFirstCallback", "continueOriginalStatusToLocalPublish",
  "continueOriginalLocalPublishToTask", "continueOriginalTaskToCloneDependencies", "continueOriginalCloneToUiFunction", "continueOriginalUiLookupToStore",
  "continueOriginalStoreToRender", "continueOriginalRenderDelegate", "continueOriginalFileSaveUi", "continueOriginalStatusCommands", "continueOriginalQueuedNotifications",
  "continueOriginalPublicationTimer", "prepareOriginalPublicationNative", "continueOriginalPublisherToPost", "prepareOriginalModifyWorker", "createOriginalModifyStructureOrigin",
  "continueOriginalNativePostToWorkerBatch", "continueOriginalWorkerToCm", "continueOriginalWorkerToCanvasTicket", "continueOriginalWorkerToCanvasTimer",
  "continueOriginalPublisherToLoopback", "continueOriginalCanvasEcho", "completeOriginalSdkModification",
] as const;
const LOCAL_ROLES = ["localIngress", "headEntry", "headPromise", "headSuccess", "bufferIngress", "bufferScheduled", "localReturned"] as const;
function done(): Promise<void> { return Promise.resolve(); }
function asConstructor(factory: () => object): () => object { return function fixtureConstructor(): object { return factory(); }; }
async function turn(): Promise<void> { const next = Promise.withResolvers<true>(); setImmediate(() => { next.resolve(true); }); await next.promise; }
function stage(stageValue: "modify" | "observe"): object {
  return Object.freeze({ schema: "easyeda-pro-control.generated-schematic-relevance-display-stage.v1", stage: stageValue, ok: true,
    dispatchAttempted: stageValue === "modify", originalPromiseSettled: stageValue === "modify", modifyAttempted: true, modifyAcknowledged: true,
    saveAttempted: false, saveAcknowledged: false, savePromiseSettled: false, source: "inert", windowTabId: "synthetic", originalContextIntact: true,
    connectivityVerified: false, sourceVersionAliased: false, workerCompletionVerified: false, structureCompletionVerified: false, persistenceVerified: false, inverseAvailable: false });
}
async function fixture(failCallback?: string, heldCallback?: string): Promise<Readonly<{
  group: CurrentSchematicRelevanceDisplayWriteObservers; composition: CurrentSchematicRelevanceDisplayWriteComposition; calls: string[];
  callbackHold: PromiseWithResolvers<object>; prefix: PromiseWithResolvers<true>; body: PromiseWithResolvers<object>; structurePacket: PromiseWithResolvers<object>; clock: PromiseWithResolvers<object>;
  modified: object; observed: object; effect: GeneratedSchematicRelevanceDisplayNativeEffect; drained: object;
  prepare: () => Promise<void>; send: (role: string) => Promise<void>; exit: () => void; rejectProducer: () => void;
}>> {
  const calls: string[] = [], setups: Promise<void>[] = [];
  const args = Object.freeze({}); const prepared = Object.freeze({}); const origin = Object.freeze({}); const modified = stage("modify"); const observed = stage("observe");
  const effectValue = Object.freeze({}); const drained = Object.freeze({ profile: "private.current-schematic-relevance-display-save-drained.v1" });
  const callbackHold = Promise.withResolvers<object>();
  const prefix = Promise.withResolvers<true>(); const body = Promise.withResolvers<object>(); const clock = Promise.withResolvers<object>(); const structurePacket = Promise.withResolvers<object>();
  let exited = false; let pending: PromiseWithResolvers<object> | null = null; let structureInstance: object | null = null; let bodyReleased = false; let drainedReady = false;
  const originalPackets = new WeakSet<object>();
  const armOnly = (): object => ({ arm: done, retireAfterOriginalExit: (): Promise<void> => { assert.equal(exited, true); calls.push("retired"); return done(); } });
  const mainObserver = (): object => ({ ...armOnly(), bindOriginalBody: done, captureDriver: (): Promise<object> => Promise.resolve(origin),
    continueToContext: (): Promise<object> => Promise.resolve(origin), continueToController: (): Promise<object> => Promise.resolve(origin), continueToActor: (): Promise<object> => Promise.resolve(origin),
    begin: (): Promise<object> => Promise.resolve(origin), observe: (): Promise<object> => Promise.resolve(origin) });
  const owner = Object.freeze({
    armSchematicDisplaySaveWorker: (_args: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    armSchematicDisplaySaveStructureWorker: (_args: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    armSchematicDisplayStructureTransportWorker: (_args: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    armSchematicDisplayProducerPrefixWorker: (): void => { calls.push("prefix-arm"); },
    armSchematicDisplayProducerObservationWorker: (_args: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    armSchematicRelevanceDisplayPollingQuiescence: (_args: unknown, _intent: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    armSchematicRelevanceDisplayLibraryRefresh: (_args: unknown, _intent: unknown, setup: (value: object) => Promise<void>): void => { setups.push(setup(origin)); },
    requireSchematicRelevanceDisplayStartupQuiesced: (): void => { calls.push("quiesced"); },
    createSchematicRelevanceDisplayAccessorOrigin: async (_args: unknown, setup: (value: object) => Promise<unknown>): Promise<void> => { await setup(origin); },
    enrollSchematicRelevanceDisplayProducerPrefix: done,
    prepareSchematicRelevanceDisplayPreModifyMain: (): Promise<object> => Promise.resolve(origin),
    createSchematicRelevanceDisplayActionOrigin: async (_args: unknown, _main: unknown, setup: (value: object) => Promise<void>): Promise<object> => { await setup(origin); return origin; },
    armSchematicRelevanceDisplayActionGuard: (): Promise<object> => Promise.resolve(origin),
    generateSchematicRelevanceDisplayModifyEntry: (): Promise<object> => Promise.resolve(origin),
    createSchematicRelevanceDisplayRunPrefix: (): Promise<object> => Promise.resolve(origin),
    continueSchematicRelevanceDisplayOriginalRun: async (_args: unknown, _entry: unknown, setup: (value: object) => Promise<void>): Promise<void> => {
      calls.push("original-run"); await setup(origin); calls.push("setup-completed"); await prefix.promise; calls.push("prefix-completed");
    },
    requireSchematicRelevanceDisplayOriginalModification: (): object => { calls.push("historical-modify"); return modified; },
    executeSchematicDisplayStage: (value: string): Promise<object> => { assert.equal(value, "observe"); calls.push("observe-stage"); return Promise.resolve(observed); },
    createSchematicRelevanceDisplayClockOrigin: async (_args: unknown, value: unknown, setup: (value: object) => Promise<void>): Promise<object> => { assert.equal(value, effectValue); await setup(origin); return origin; },
    prepareSchematicRelevanceDisplaySaveMain: async (_args: unknown, value: unknown, setup: (value: object) => Promise<void>): Promise<object> => { assert.equal(value, effectValue); await setup(origin); return origin; },
    requireSchematicRelevanceDisplaySaveMainReady: (): object => origin,
    reserveSchematicRelevanceDisplayStructurePublication: (): Promise<object> => { calls.push("body-reserved"); return Promise.resolve(origin); },
    completeSchematicRelevanceDisplayStructurePublication: (): object => origin,
    completeSchematicRelevanceDisplayHistorySql: (): object => { calls.push("history-completed"); return origin; },
    requireSchematicRelevanceDisplayLiveHistoryRows: (): object => origin,
    settleSchematicRelevanceDisplayModifyEntryAfterExit: done,
  });
  const observation = (): object => ({ ...armOnly(), observe: (): Promise<object> => Promise.resolve(origin), observeRawScene: (): Promise<object> => Promise.resolve(origin),
    requireData: (): void => { calls.push("qualified"); }, requireRawData: (): void => { calls.push("qualified"); } });
  const structure = (): object => {
    const value = { ...armOnly(), observeConstruction: done, observePacket: (): Promise<object> => { calls.push("structure-read"); return structurePacket.promise; },
      observeOriginalSchematicRelevanceStartupDrain: (): Promise<object> => Promise.resolve(origin),
      releasePrehistoryPacket: async (packet: unknown): Promise<void> => { assert.equal(packet, await structurePacket.promise); calls.push("structure-released"); }, observePrehistoryCompletion: done };
    structureInstance = value; return value;
  };
  const callback = (): object => Object.fromEntries(CALLBACK_ORDER.map(name => [name, (value?: unknown): Promise<object> => {
    calls.push(name); if (name === "createOriginalModifyStructureOrigin") { assert.equal(value, structureInstance); }
    if (name === failCallback) { throw new Error(`INERT_CALLBACK_FAILURE_${name}`); }
    if (name === heldCallback) { return callbackHold.promise; }
    return Promise.resolve(name === "completeOriginalSdkModification" ? modified : origin);
  }]));
  const producer = (): object => ({ ...armOnly(), startupProgress: (): object => ({ initialCache: { completed: true }, initialSync: { completed: true } }),
    observeHeldCall: (): Promise<object> => { assert.equal(pending, null, "No second producer reader"); pending = Promise.withResolvers<object>(); calls.push("producer-read"); return pending.promise; },
    continueSchematicRelevanceDisplaySaveLocalCall: (packet: object): Promise<void> => { assert.ok(originalPackets.has(packet)); assert.equal(bodyReleased, true); calls.push("own7-local"); return done(); },
    requireSchematicRelevanceDisplaySaveLocalCompleted: (): void => { assert.equal(calls.filter(value => value === "own7-local").length, LOCAL_ROLES.length); calls.push("own7-local-completed"); },
    continueSchematicRelevanceDisplaySaveDrainCall: (packet: object): Promise<void> => { assert.ok(originalPackets.has(packet)); calls.push("own7-drain"); return done(); },
    schematicRelevanceDisplaySaveDrainProgress: (): object => ({ allCallsResumed: true, canSettle: !drainedReady, completed: drainedReady }),
    settleSchematicRelevanceDisplaySaveDrain: (): Promise<void> => { calls.push("own7-settle"); drainedReady = true; return done(); },
    requireOriginalSchematicRelevanceDisplaySaveDrained: (): object => { assert.equal(drainedReady, true); return drained; },
  });
  const loaded = await loadSyntheticRegistryModule(new URL("../src/current-schematic-relevance-display-write-observers.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-schematic-relevance-display-write-owner.ts") { return { ...actual,
      assertOriginalCurrentSchematicRelevanceDisplayWriteOwner: (value: unknown): void => { assert.equal(value, owner); },
      originalCurrentSchematicRelevanceDisplayWriteTarget: (): object => prepared,
      originalCurrentSchematicRelevanceDisplayWriteTermination: (): object => { assert.equal(exited, true); return origin; },
      requireOriginalCurrentSchematicRelevanceDisplayActionGuard: (): object => origin,
      requireOriginalCurrentSchematicRelevanceDisplayPreModifyMainOrigin: (): object => ({ assertCurrent: done }),
      requireOriginalSchematicRelevanceDisplayStage: (_owner: unknown, _args: unknown, packet: unknown, value: string): unknown => { assert.equal(packet, value === "modify" ? modified : observed); return packet; },
    }; }
    if (name === "./generated-schematic-relevance-display-source.ts") { return { ...actual, requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, target: unknown): void => { assert.equal(value, args); assert.equal(target, prepared); } }; }
    if (name === "./generated-schematic-relevance-display-effect.ts") { return { ...actual, requireOriginalGeneratedSchematicRelevanceDisplayEffect: (value: unknown): object => { assert.equal(value, effectValue); return origin; } }; }
    if (name === "./generated-schematic-relevance-display-native-save.ts") { return { ...actual, qualifyOriginalGeneratedSchematicRelevanceDisplaySaveData: (): Promise<object> => { calls.push("body-qualified"); return Promise.resolve(origin); } }; }
    if (name === "./current-schematic-relevance-display-accessor-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayAccessorObserver: asConstructor(observation) }; }
    if (name === "./current-schematic-relevance-display-action-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayActionObserver: asConstructor(observation) }; }
    if (name === "./current-schematic-relevance-display-modify-entry-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayModifyEntryObserver: asConstructor(observation) }; }
    if (name === "./current-schematic-relevance-run-prefix-observer.ts") { return { ...actual, CurrentSchematicRelevanceRunPrefixObserver: asConstructor(observation) }; }
    if (name === "./current-schematic-relevance-action-callback-observer.ts") { return { ...actual, CurrentSchematicRelevanceActionCallbackObserver: asConstructor(callback) }; }
    if (name === "./current-project-save-structure-observer.ts") { return { ...actual, CurrentProjectSaveStructureObserver: asConstructor(structure) }; }
    if (name === "./current-project-save-producer-observer.ts") { return { ...actual, CurrentProjectSaveProducerObserver: asConstructor(producer),
      requireOriginalCurrentProjectSaveProducerHeldCall: (value: object): object => { assert.ok(originalPackets.has(value)); return value; } }; }
    if (name === "./current-project-sync-quiesce-observer.ts") { return { ...actual, CurrentProjectSyncQuiesceObserver: asConstructor((): object => ({ ...armOnly(), observeFirstTimer: (): Promise<object> => Promise.resolve(origin), requireOriginal: done })) }; }
    if (name === "./current-project-library-refresh-observer.ts") { return { ...actual, CurrentProjectLibraryRefreshObserver: asConstructor((): object => ({ ...armOnly(), preparePristine: (): Promise<object> => Promise.resolve(origin), observeFirstLoop: (): Promise<object> => Promise.resolve(origin), observeMountReturn: (): Promise<object> => Promise.resolve(origin), requireOriginal: done })) }; }
    if (name === "./current-schematic-relevance-display-save-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplaySaveObserver: asConstructor((): object => ({ ...armOnly(),
      observeBody: (): Promise<object> => { calls.push("body-read"); return body.promise; }, releaseBody: (): Promise<void> => { bodyReleased = true; calls.push("body-released"); return done(); }, observeCompletion: done })) }; }
    if (name === "./current-schematic-relevance-display-clock-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayClockObserver: asConstructor((): object => ({ ...armOnly(),
      collect: (): Promise<object> => { calls.push("clock-read"); return clock.promise; }, joinBody: (): Promise<object> => Promise.resolve(origin) })) }; }
    if (name === "./current-project-structure-transport-observer.ts") { return { ...actual, CurrentProjectStructureTransportObserver: asConstructor((): object => ({ ...armOnly(), observeSend: (): Promise<object> => Promise.resolve(origin), releaseSend: done, observeReturned: done, releaseReturned: done })) }; }
    if (name === "./current-schematic-relevance-display-main-request-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayMainRequestObserver: asConstructor(mainObserver) }; }
    if (name === "./current-schematic-relevance-display-main-begin-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayMainBeginObserver: asConstructor(mainObserver) }; }
    if (name === "./current-schematic-relevance-display-main-history-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayMainHistoryObserver: asConstructor(mainObserver) }; }
    if (name === "./current-schematic-relevance-display-main-structure-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayMainStructureObserver: asConstructor(mainObserver) }; }
    if (name === "./current-schematic-relevance-display-main-live-history-observer.ts") { return { ...actual, CurrentSchematicRelevanceDisplayMainLiveHistoryObserver: asConstructor(mainObserver) }; }
    return actual;
  });
  const constructor = loaded["CurrentSchematicRelevanceDisplayWriteObservers"], requireComposition = loaded["requireOriginalCurrentSchematicRelevanceDisplayWriteComposition"];
  assert.ok(typeof constructor === "function"); assert.ok(typeof requireComposition === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit inert original registries above exercise the actual original constructor, without a production capability.
  const group = Reflect.construct(constructor, [owner, args]) as CurrentSchematicRelevanceDisplayWriteObservers;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual sealed constructor issues the fixed interface; only its private native/registry dependencies are inert seams.
  const composition = Reflect.apply(requireComposition, undefined, [group, owner, args]) as CurrentSchematicRelevanceDisplayWriteComposition;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This inert effect is accepted only by the test's purpose-specific original-effect registry seam.
  const effect = effectValue as GeneratedSchematicRelevanceDisplayNativeEffect;
  return { group, composition, calls, callbackHold, prefix, body, clock, structurePacket, modified, observed, effect, drained,
    prepare: async (): Promise<void> => {
      group.armBeforeNavigation({ polling: { profile: "private.generated-schematic-relevance-display-polling-intent.v1" }, library: { profile: "private.generated-schematic-relevance-display-library-intent.v1" } });
      await Promise.all(setups); await group.observeAccessors();
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This dispatch never reaches an actual journal or owner; only registry scheduling is under test.
      const dispatch = Object.freeze({}) as GeneratedSchematicRelevanceDisplayDispatch;
      await group.prepareModification(dispatch); await group.generateModificationEntry(dispatch); await group.observeOriginalRunPrefix();
    },
    send: async (role: string): Promise<void> => { assert.ok(pending !== null); const next = pending; pending = null; const packet = Object.freeze({ role }); originalPackets.add(packet); next.resolve(packet); await turn(); },
    exit: (): void => { exited = true; },
    rejectProducer: (): void => { if (pending !== null) { const next = pending; pending = null; next.reject(new Error("Original inert Job exited")); } },
  };
}

void test("full callback source order joins the same original continuation before historical Modify and preserves original observe identity", async () => {
  const f = await fixture(); await f.prepare(); const continuation = f.composition.continueOriginalRun();
  assert.equal(f.composition.waitOriginalModification(), f.composition.waitOriginalModification());
  let completed = false; const wait = (async (): Promise<object> => { const value = await f.composition.waitOriginalModification(); completed = true; return value; })();
  await turn(); assert.equal(completed, false); assert.equal(f.calls.includes("historical-modify"), false);
  assert.deepEqual(f.calls.filter(value => CALLBACK_ORDER.some(name => name === value)), CALLBACK_ORDER);
  assert.throws(() => f.composition.continueOriginalRun(), /ORIGINAL_RUN_CONTINUATION_REQUIRED/u);
  f.prefix.resolve(true); assert.equal(await wait, f.modified); await continuation; assert.equal(await f.composition.waitOriginalModification(), f.modified);
  assert.equal(f.calls.filter(value => value === "original-run").length, 1);
  assert.equal(await f.composition.observeAfterModification(), f.observed);
  f.exit(); f.rejectProducer(); f.structurePacket.reject(new Error("Original inert structure exited")); await f.group.settleOriginalCallsAfterExit();
});
void test("callback failure stops at its original stage and exit joins every retained request", async () => {
  const f = await fixture("prepareOriginalNoEcho"); await f.prepare();
  const original = f.composition.continueOriginalRun(); const wait = f.composition.waitOriginalModification();
  await assert.rejects(original, /INERT_CALLBACK_FAILURE_prepareOriginalNoEcho/u); await assert.rejects(wait, /INERT_CALLBACK_FAILURE_prepareOriginalNoEcho/u);
  assert.equal(f.calls.includes("continueOriginalDidRecordToUploader"), false); assert.equal(f.calls.includes("historical-modify"), false);
  f.exit(); f.rejectProducer(); let cleaned = false; const cleanup = (async (): Promise<void> => { await f.group.settleOriginalCallsAfterExit(); cleaned = true; })();
  await turn(); assert.equal(cleaned, false); f.structurePacket.reject(new Error("Original inert structure exited")); await cleanup;
});
void test("one startup reader hands original Save ingress to own7 local/drain after body release without another startup read", async () => {
  const f = await fixture(); await f.prepare(); const continuation = f.composition.continueOriginalRun(); f.prefix.resolve(true); await continuation;
  await f.composition.waitOriginalModification(); await f.composition.observeAfterModification(); await f.composition.armSaveClock(f.effect); await f.composition.prepareSaveMain(f.effect);
  const save = f.composition.observeOriginalSave(); const local = f.composition.serviceSaveLocalCalls(); const drain = f.composition.drainOriginalSave();
  assert.equal(f.calls.filter(value => value === "producer-read").length, 1); assert.equal(f.calls.includes("body-released"), false);
  f.clock.resolve(Object.freeze({})); f.body.resolve(Object.freeze({})); f.structurePacket.resolve(Object.freeze({})); await turn();
  assert.ok(f.calls.indexOf("body-qualified") < f.calls.indexOf("body-reserved")); assert.ok(f.calls.indexOf("body-reserved") < f.calls.indexOf("body-released"));
  for (const role of LOCAL_ROLES) { await f.send(role); }
  await local; await f.send("uploadTail"); await Promise.all([save, drain]);
  assert.equal(f.composition.requireOriginalSaveDrained(), f.drained); assert.equal(f.calls.filter(value => value === "producer-read").length, LOCAL_ROLES.length + 1);
  assert.equal(f.calls.filter(value => value === "own7-local").length, LOCAL_ROLES.length); assert.equal(f.calls.filter(value => value === "own7-drain").length, 1);
  assert.equal(f.calls.filter(value => value === "structure-read").length, 1); assert.equal(f.calls.filter(value => value === "own7-settle").length, 1);
  f.exit(); await f.group.settleOriginalCallsAfterExit();
});
void test("early Save ingress and unsupported pre-Save periodic calls remain held with no local continuation", async () => {
  for (const role of ["localIngress", "syncEntry"]) {
    const f = await fixture(); await f.prepare(); const continuation = f.composition.continueOriginalRun(); f.prefix.resolve(true); await continuation;
    await f.send(role); assert.equal(f.group.status().failed, true); assert.equal(f.calls.includes("own7-local"), false); assert.equal(f.calls.filter(value => value === "producer-read").length, 1);
    f.exit(); f.structurePacket.reject(new Error("Original inert structure exited")); await f.group.settleOriginalCallsAfterExit();
  }
});
void test("original exit waits the second clock/body collector and retained local/drain promises after first failure", async () => {
  const f = await fixture(); await f.prepare(); const continuation = f.composition.continueOriginalRun(); f.prefix.resolve(true); await continuation;
  await f.composition.waitOriginalModification(); await f.composition.observeAfterModification(); await f.composition.armSaveClock(f.effect); await f.composition.prepareSaveMain(f.effect);
  const save = f.composition.observeOriginalSave(); const local = f.composition.serviceSaveLocalCalls(); const drain = f.composition.drainOriginalSave();
  f.exit(); f.clock.reject(new Error("Original inert clock exited")); f.rejectProducer(); f.structurePacket.reject(new Error("Original inert structure exited"));
  let cleaned = false; const cleanup = (async (): Promise<void> => { await f.group.settleOriginalCallsAfterExit(); cleaned = true; })();
  await turn(); assert.equal(cleaned, false); assert.equal(f.calls.includes("body-released"), false); assert.equal(f.calls.includes("retired"), false);
  f.body.reject(new Error("Original inert body exited")); await cleanup;
  const outcomes = await Promise.allSettled([save, local, drain]); assert.ok(outcomes.every(value => value.status === "rejected"));
  assert.equal(f.calls.filter(value => value === "producer-read").length, 1); assert.equal(f.calls.includes("own7-local"), false);
});

void test("producer failure wakes outward Modify waits while exit still joins the held original callback", async () => {
  const f = await fixture(undefined, "observeFirstSetter"); await f.prepare();
  const continuation = f.composition.continueOriginalRun(); const modification = f.composition.waitOriginalModification();
  await turn(); assert.equal(f.calls.includes("observeFirstSetter"), true); assert.equal(f.calls.includes("observeUnderlineForwarding"), false);
  f.rejectProducer();
  await assert.rejects(continuation, /Original inert Job exited/u); await assert.rejects(modification, /Original inert Job exited/u);
  assert.equal(f.calls.includes("historical-modify"), false); assert.equal(f.calls.includes("setup-completed"), false);
  f.exit(); f.structurePacket.reject(new Error("Original inert structure exited"));
  let cleaned = false; const cleanup = (async (): Promise<void> => { await f.group.settleOriginalCallsAfterExit(); cleaned = true; })();
  await turn(); assert.equal(cleaned, false); assert.equal(f.calls.includes("retired"), false);
  f.callbackHold.resolve(Object.freeze({})); await cleanup;
  assert.equal(f.calls.filter(value => value === "original-run").length, 1); assert.equal(f.calls.includes("observeUnderlineForwarding"), false);
});
