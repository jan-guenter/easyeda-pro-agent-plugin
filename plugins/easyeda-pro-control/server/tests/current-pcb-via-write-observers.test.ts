/** Real fixed orchestration with explicit inert original-owner/observer seams.
 * No native factory, API mutation, Main SQL or persistence proof is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcbViaWriteObservers } from "../src/current-pcb-via-write-observers.ts";
import type { CurrentPcbViaWriteDispatch } from "../src/current-pcb-via-write-journal.ts";
import type { CurrentPcbViaPollingCancellationIntent } from "../src/current-pcb-via-polling-cancellation-intent.ts";

async function fixture(failBefore = false): Promise<Readonly<{
  group: CurrentPcbViaWriteObservers; activate: () => Promise<void>; dispatch: CurrentPcbViaWriteDispatch; polling: CurrentPcbViaPollingCancellationIntent;
  calls: string[]; pendingReads: () => number; closeRead: () => void; effect: unknown;
}>> {
  const calls: string[] = [], setup = new Map<string, (origin: unknown) => Promise<void>>();
  const prepared = Object.freeze({ inertCheckpoint: true }); const plan = Object.freeze({ prepared });
  const dispatch: CurrentPcbViaWriteDispatch = Object.freeze({ profile: "private.current-pcb-via-write-dispatch.v1" });
  const polling: CurrentPcbViaPollingCancellationIntent = Object.freeze({ profile: "private.current-pcb-via-polling-cancellation-intent.v1" });
  const effect = Object.freeze({ inertEffect: true });
  const before = Object.freeze({ beforeNative: true }), beforeScene = Object.freeze({ beforeScene: true });
  const after = Object.freeze({ afterNative: true }), afterScene = Object.freeze({ afterScene: true });
  const acknowledgement = Object.freeze({ schema: "easyeda-pro-control.pcb209-via-write-stage.v1", stage: "create", ok: true,
    dispatchAttempted: true, originalPromiseAcknowledged: true, primitiveId: "original-via", createAttempted: true, createAcknowledged: true,
    saveAttempted: false, saveAcknowledged: false, inverseAvailable: false, persistenceVerified: false });
  const held = Object.freeze({ profile: "private.current-project-save-producer-held-call.v1" });
  const read = Promise.withResolvers<typeof held>(); let reads = 0;
  const owner = Object.freeze({
    armViaProjectSyncQuiesce: (_p: unknown, token: unknown, install: (origin: unknown) => Promise<void>): void => { assert.equal(token, polling); setup.set("quiesce", install); },
    requireOriginalViaProjectSyncQuiesced: (): void => { calls.push("original-quiescence-required"); },
    armViaSaveWorker: (_p: unknown, install: (origin: unknown) => Promise<void>): void => { setup.set("save", install); },
    armViaSaveStructureWorker: (_p: unknown, install: (origin: unknown) => Promise<void>): void => { setup.set("structure", install); },
    armViaStructureTransportWorker: (_p: unknown, install: (origin: unknown) => Promise<void>): void => { setup.set("transport", install); },
    armViaProducerPrefixWorker: (): void => { calls.push("prefix-arm"); },
    armViaProducerObservationWorker: (_p: unknown, install: (origin: unknown) => Promise<void>): void => { setup.set("producer", install); },
    observeViaPrimitives: (_p: unknown, phase: string): Promise<unknown> => { calls.push(`native-${phase}`); return failBefore ? Promise.reject(new Error("original native read refused")) : Promise.resolve(phase === "before" ? before : after); },
    observeViaSceneMembership: (_p: unknown, phase: string): Promise<unknown> => { calls.push(`scene-${phase}`); return Promise.resolve(phase === "before" ? beforeScene : afterScene); },
    enrollViaProducerPrefix: (): Promise<void> => { calls.push("prefix-enroll"); return Promise.resolve(); },
    prepareViaMainObservationOrigin: async (_p: unknown, token: unknown, install: (origin: unknown) => Promise<void>): Promise<unknown> => {
      assert.equal(token, dispatch); await install(Object.freeze({ inertMainOrigin: true })); calls.push("main-armed"); return {};
    },
    executeViaStage: (stage: string, _p: unknown, token: unknown): Promise<unknown> => {
      calls.push(`sdk-${stage}`); assert.equal(stage, "create"); assert.equal(token, dispatch); return Promise.resolve(acknowledgement);
    }, bindViaMainOriginalEffect: (_p: unknown, _o: unknown, actual: unknown): void => { assert.equal(actual, effect); calls.push("effect-bound"); },
  });
  const sourceRequire = createRequire(new URL("../src/current-pcb-via-write-observers.ts", import.meta.url));
  class InertObserver {
    readonly #calls = calls; readonly #read = read;
    readonly #progress = Object.freeze({ initialCache: { completed: true }, initialSync: { completed: true }, periodicSync: null });
    public arm(): Promise<void> { this.#calls.push("observer-arm"); return Promise.resolve(); }
    public observeConstruction(): Promise<void> { this.#calls.push("construction"); return Promise.resolve(); }
    public observePacket(): Promise<object> { this.#calls.push("structure-packet-pending"); return this.#read.promise; }
    public observeFirstTimer(): Promise<object> { this.#calls.push("original-first-timer"); return Promise.resolve(Object.freeze({ inertOriginalQuiescence: true })); }
    public requireOriginal(): Promise<void> { this.#calls.push("original-quiescence-joined"); return Promise.resolve(); }
    public startupProgress(): unknown { return this.#progress; }
    public observeHeldCall(): Promise<typeof held> { reads += 1; return this.#read.promise; }
  }
  const native = {
    assertOriginalCurrentPcbViaWriteOwner: (actual: unknown): void => { assert.equal(actual, owner); },
    originalCurrentPcbViaWriteTarget: (actual: unknown): unknown => { assert.equal(actual, owner); return prepared; },
  };
  const replacements: Readonly<Record<string, unknown>> = {
    "./current-pcb-via-write-owner.ts": native,
    "./current-pcb-via-write-plan.ts": { requireOriginalCurrentPcbViaWritePlan: (actual: unknown): unknown => { assert.equal(actual, plan); return { prepared }; } },
    "./current-pcb-via-write-effect.ts": { qualifyOriginalCurrentPcbViaWriteEffect: (actual: unknown, p: unknown, observations: unknown): unknown => {
      assert.equal(actual, owner); assert.equal(p, plan); assert.ok(observations !== null && typeof observations === "object" && "createAcknowledgement" in observations);
      // This fails if schema validation clones the original acknowledgment.
      assert.equal(observations.createAcknowledgement, acknowledgement); calls.push("effect-qualified"); return effect;
    } },
    "./current-pcb-via-save-observer.ts": { CurrentPcbViaSaveObserver: InertObserver },
    "./current-project-sync-quiesce-observer.ts": { CurrentProjectSyncQuiesceObserver: InertObserver },
    "./current-project-save-structure-observer.ts": { CurrentProjectSaveStructureObserver: InertObserver },
    "./current-project-structure-transport-observer.ts": { CurrentProjectStructureTransportObserver: InertObserver },
    "./current-project-save-producer-observer.ts": { CurrentProjectSaveProducerObserver: InertObserver,
      requireOriginalCurrentProjectSaveProducerHeldCall: (packet: unknown): unknown => { assert.equal(packet, held); return { role: "headEntry" }; } },
    "./current-pcb-via-main-request-observer.ts": { CurrentPcbViaMainRequestObserver: InertObserver },
    "./current-pcb-via-main-begin-observer.ts": { CurrentPcbViaMainBeginObserver: InertObserver },
    "./current-pcb-via-main-history-observer.ts": { CurrentPcbViaMainHistoryObserver: InertObserver },
    "./current-pcb-via-main-structure-observer.ts": { CurrentPcbViaMainStructureObserver: InertObserver },
  };
  const output = await transform(await readFile(new URL("../src/current-pcb-via-write-observers.ts", import.meta.url), "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`);
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [(id: string): unknown => replacements[id] ?? sourceRequire(id), loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteObservers"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert registry and child-observer seams above differ; the production coordinator's private state and scheduling run unchanged.
  const group = Reflect.construct(Constructor, [owner, plan]) as CurrentPcbViaWriteObservers;
  return Object.freeze({ group, dispatch, polling, calls, effect, pendingReads: (): number => reads, closeRead: (): void => { read.resolve(held); },
    activate: async (): Promise<void> => { for (const name of ["quiesce", "save", "structure", "transport", "producer"]) { const install = setup.get(name); assert.ok(install !== undefined); await install(Object.freeze({ inertSourceOrigin: name })); } } });
}

void test("real original registry refuses an equal-looking observer-group owner", () => {
  // Deliberate untyped constructor attack with no native factory allocation.
  assert.throws(() => Reflect.construct(CurrentPcbViaWriteObservers, [{}, {}]), /ORIGINAL_FACTORY/u);
});
void test("one producer read spans startup and create and the original SDK acknowledgment reaches effect qualification", async () => {
  const f = await fixture(); f.group.armBeforeNavigation(f.polling); await f.activate(); await f.group.waitForStartupObservations();
  assert.equal(f.pendingReads(), 1); assert.equal(f.group.status().originalProducerReadPending, true);
  await f.group.observeBeforeNative(); await f.group.observeBeforeScene();
  assert.equal(await f.group.create(f.dispatch), f.effect); assert.equal(f.pendingReads(), 1);
  assert.equal(f.group.status().originalProducerReadPending, true);
  assert.equal(f.calls.filter(call => call === "sdk-create").length, 1); assert.ok(f.calls.indexOf("main-armed") < f.calls.indexOf("sdk-create"));
  assert.ok(f.calls.indexOf("native-after") < f.calls.indexOf("effect-qualified")); assert.ok(f.calls.indexOf("scene-after") < f.calls.indexOf("effect-qualified"));
  await assert.rejects(f.group.create(f.dispatch), /CREATE_CONSUMED/u); assert.equal(f.group.status().persistenceVerified, false);
  f.group.cancel(); f.closeRead(); await assert.rejects(f.group.originalProducerAfterAction(), /CANCELLED/u);
});
void test("failed original read consumes its observation and prevents a later create", async () => {
  const f = await fixture(true); f.group.armBeforeNavigation(f.polling); await f.activate(); await f.group.waitForStartupObservations();
  await assert.rejects(f.group.observeBeforeNative(), /original native read refused/u); await assert.rejects(f.group.observeBeforeNative(), /original native read refused/u);
  await assert.rejects(f.group.create(f.dispatch), /original native read refused/u); assert.equal(f.calls.filter(call => call === "native-before").length, 1);
  assert.equal(f.calls.includes("sdk-create"), false); assert.equal(f.group.status().failed, true); f.closeRead();
});
