/** Actual lifecycle/journal composition with synthetic native/source/plan boundaries.
 * This proves publication ordering and refusal semantics, not connected ownership. */
/* oxlint-disable import/max-dependencies -- The composed lifecycle keeps its real journal, adapter, complete SQL reader and explicit synthetic native boundaries in one test. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { z } from "zod";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "../src/current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS, currentFootprintCopyBindingsSchema } from "../src/current-footprint-copy-bindings.ts";
import { currentFootprintCopyUiObservationSchema } from "../src/current-footprint-copy-ui-runner.ts";
import { currentFootprintCopyManagerRouteObservationSchema } from "../src/current-footprint-copy-manager-route-runner.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS, currentFootprintCopyDependencyObservationSchema } from "../src/current-footprint-copy-dependency-runner.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { currentPcb209WorkerStartupActorPacketSchema } from "../src/current-pcb-209-worker-startup-actor.ts";
import { currentFootprintCopyPreparationSchema } from "../src/current-footprint-copy-preparation.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { currentFootprintSourceReadPacketSchema } from "../src/current-footprint-source-read-runner.ts";
import { publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupHandoff } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcb209WorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { readExactSqlInventory } from "../src/sqlite-inventory.ts";

type Row = Record<string, unknown>;
interface Fixture {
  readonly coordinator: CurrentPcb209WorkerStartupLifecycle;
  readonly owner: Row;
  readonly state: { terminated: boolean };
}
interface FixtureModule {
  readonly fixture: (context: TestContext, id: string, dependencies: Row) => Fixture;
  readonly readyForOpening: (id: string, value: Fixture) => Promise<void>;
  readonly directory: (id: string) => string;
  readonly OPEN_RESULT: CurrentPcb209WorkerStartupOpeningResult["opening"];
  readonly STARTUP_OPEN_INPUT: Row;
}
async function loadSource(path: URL, source: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const generated = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const actualRequire = createRequire(path), loaded: { exports: Row } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : actualRequire(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
async function loadFile(relative: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const path = new URL(relative, import.meta.url); return loadSource(path, await readFile(path, "utf8"), replacements);
}
async function loadFixture(lifecycle: Row, bindingsMode: boolean): Promise<FixtureModule> {
  const path = new URL("current-pcb-diagnostic-lifecycle.test.ts", import.meta.url);
  const complete = await readFile(path, "utf8");
  const offset = complete.indexOf("\nvoid test("); assert.ok(offset > 10_000 && offset < 40_000);
  let source = complete.slice(0, offset);
  const substitutions = [
    ["diagnostic-test|pcb209-test|string-precreate-test|worker-startup-test", "diagnostic-test|pcb209-test|pcb209-startup-test|footprint-preparation-test|string-precreate-test|worker-startup-test"],
    ['const startupPurpose = id.startsWith("worker-startup-");', 'const startupPurpose = id.startsWith("worker-startup-") || id.startsWith("pcb209-startup-") || id.startsWith("footprint-preparation-");'],
    ['profile: ownerPurpose, stringPrecreateConsumed:', 'profile: id.startsWith("footprint-preparation-") ? "worker-startup-footprint209" : startupPurpose ? "worker-startup209" : ownerPurpose, stringPrecreateConsumed:'],
    ['if (opening209) { coordinator =', 'if (opening209 && !startupPurpose) { coordinator ='],
    ['return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });',
      'return Promise.resolve({ sourceVerified: true, family: profile.family, sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, relativePath: profile.relativePath, executionAuthorized: false });'],
  ] as const;
  for (const [before, after] of substitutions) { assert.equal(source.split(before).length, 2); source = source.replace(before, after); }
  assert.equal(source.split("/worker-startup-launch-intent/u").length, 3);
  source = source.replaceAll("/worker-startup-launch-intent/u", '(id.startsWith("footprint-preparation-") ? /footprint-copy-preparation-launch-intent/u : /worker-startup-launch-intent/u)');
  source += "\nexport { fixture, readyForOpening, directory, OPEN_RESULT, STARTUP_OPEN_INPUT };\n";
  const loaded = await loadSource(path, source, new Map([["../src/current-pcb-diagnostic-lifecycle.ts", {
    ...lifecycle, CurrentPcbWorkerStartupLifecycle: lifecycle[bindingsMode ? "CurrentFootprintCopyPreparationLifecycle" : "CurrentPcb209WorkerStartupLifecycle"],
  }]]));
  for (const name of ["fixture", "readyForOpening", "directory"]) { assert.equal(typeof loaded[name], "function"); }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained non-test fixture exports are evaluated with the explicit current209 substitutions above.
  return loaded as unknown as FixtureModule;
}
function unused(): never { throw new Error("Unexpected synthetic native operation"); }
async function fixture(context: TestContext, mode: "success" | "capacity" | "publication" | "reproof", bindingsMode = false):
Promise<Readonly<{ value: Fixture; id: string; binding: string; prepare: () => Promise<Row>; observeUi: () => Promise<Row>;
  prepareDependencies: () => Promise<Row>; setNextRequestId: (next: number) => void; expireUi: () => void;
  observeManagerRoute: () => Promise<Row>; expireManagerRoute: () => void;
  expireDependencies: () => void; refuseDependencyPublication: () => void; calls: string[]; directory: string }>> {
  let dependenciesExpired = false, dependencyPublicationRefused = false, managerRouteExpired = false, uiExpired = false;
  const calls: string[] = [], id = `${bindingsMode ? "footprint-preparation" : "pcb209-startup"}-test-preparation-${mode}`;
  let module: FixtureModule | null = null, result: CurrentPcb209WorkerStartupOpeningResult | null = null;
  let before: Awaited<ReturnType<typeof readExactSqlInventory>> | null = null, plan: Row | null = null;
  let state: ReturnType<typeof currentFootprintCopyStatePacketSchema.parse> | null = null;
  let packet: ReturnType<typeof currentFootprintSourceReadPacketSchema.parse> | null = null;
  let actor: ReturnType<typeof currentPcb209WorkerStartupActorPacketSchema.parse> | null = null;
  let prepared: ReturnType<typeof currentFootprintCopyPreparationSchema.parse> | null = null;
  let bindingToken: ReturnType<typeof currentFootprintCopyBindingsSchema.parse> | null = null;
  const producers = Object.freeze({ synthetic: "original-producers" });
  const dependencies = Object.freeze(currentFootprintCopyDependencyObservationSchema.parse({ profile: "private.current-footprint-copy-dependencies.v1",
    selectedFunctionCount: 53, freshDirectScopeCount: 3, originalSelectedIdentitiesRechecked: true, initializedNotificationBusRetained: true,
    originalCacheObjectsRetained: true, parserSubscriberCallbacksBound: false, uploadCallbacksBound: false, transitiveProducerClosuresBound: false,
    notificationPeerOwnershipVerified: false, clockProvenanceVerified: false, executionAuthorized: false }));
  const assignments = Object.freeze({ profile: "private.current-pcb-worker-construction-assignments.v1",
    callbackKinds: ["uploadStructure", "structure", "cooperation", "upload"], originalConstructionCallbacksMatched: true,
    originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true, continuousAssignmentOwnershipVerified: false,
    nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false, writeDestinationsContained: false,
    atomicSnapshotVerified: false, queueCompletionVerified: false, executionAuthorized: false });
  class Opening {
    readonly #original = Object.freeze({ synthetic: true });
    public async open(_target: unknown, check: () => Promise<void>): Promise<CurrentPcb209WorkerStartupOpeningResult> { assert.equal(this.#original.synthetic, true); await check(); assert.ok(result); return result; }
    public status(): Row { return { completed: true, synthetic: this.#original.synthetic }; }
    public retainedOpeningResult(): CurrentPcb209WorkerStartupOpeningResult["opening"] | null { assert.equal(this.#original.synthetic, true); return result?.opening ?? null; }
    public requireOriginal(selected: unknown): Promise<object> { assert.equal(selected, result); return Promise.resolve(this.#original); }
    public proveCurrentAssignments(): Promise<object> { assert.equal(this.#original.synthetic, true); return Promise.resolve(assignments); }
    public requireCurrentAssignments(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public retainedActorObservation(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeActorClock(): Promise<typeof actor> { assert.equal(this.#original.synthetic, true); assert.ok(actor); return Promise.resolve(actor); }
    public requireActorClock(_result: unknown, _assignments: unknown, selected: unknown): Promise<void> {
      assert.equal(this.#original.synthetic, true); assert.equal(selected, actor); return Promise.resolve();
    }
    public retainedChannelObservation(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeCurrentChannel = unused;
    public requireCurrentChannel = unused;
    public retainedFootprintState(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeFootprintState(): Promise<typeof state> { assert.equal(this.#original.synthetic, true); return Promise.resolve(state); }
    public requireFootprintState(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public retainedFootprintSource(): null { assert.equal(this.#original.synthetic, true); return null; }
    public observeFootprintSource(): Promise<typeof packet> { assert.equal(this.#original.synthetic, true); return Promise.resolve(packet); }
    public requireFootprintSource(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
    public retainedFootprintDependencies(): null { assert.equal(this.#original.synthetic, true); return null; }
    public async observeFootprintDependencies(selected: unknown, assigned: unknown, observed: unknown, source: unknown): Promise<typeof dependencies> {
      assert.equal(this.#original.synthetic, true); assert.ok(module);
      assert.equal(selected, result); assert.equal(assigned, assignments); assert.equal(observed, state); assert.equal(source, producers);
      const path = join(module.directory(id), "footprint-copy-dependencies-intent.json");
      assert.match(await readFile(path, "utf8"), /dependencies-intent/u);
      calls.push("dependencies-after-intent"); return dependencies;
    }
    public requireFootprintDependencies(selected: unknown, assigned: unknown, observed: unknown, source: unknown, packetInput: unknown): Promise<void> {
      assert.equal(this.#original.synthetic, true); assert.equal(selected, result); assert.equal(assigned, assignments);
      assert.equal(observed, state); assert.equal(source, producers); assert.equal(packetInput, dependencies); calls.push("dependencies-reproof");
      return dependenciesExpired ? Promise.reject(new Error("synthetic dependency owner lost")) : Promise.resolve();
    }
    public releaseAfterTermination(): Promise<void> { assert.equal(this.#original.synthetic, true); return Promise.resolve(); }
  }
  const classes = new Map<string, unknown>([["./current-pcb-209-worker-startup-opening.ts", { CurrentPcb209WorkerStartupOpening: Opening }],
    ["./current-footprint-source-plan.ts", { prepareCurrentFootprintSourcePlan: (inventory: NonNullable<typeof before>): Promise<Row> => {
      before = inventory; plan = Object.freeze({ maximumTicket: 100, beforeSqlSha256: inventory.logicalSha256, beforeCheckpointSha256: inventory.checkpointSha256 });
      return Promise.resolve(plan);
    } }],
    ["./current-footprint-copy-preparation-runtime.ts", {
      prepareCurrentFootprintCopyOwned: async (input: Row): Promise<NonNullable<typeof prepared>> => {
        assert.ok(module && before && plan && packet); assert.ok(input["opening"] instanceof Opening);
        assert.equal(input["result"], result); assert.equal(input["assignments"], assignments); assert.equal(input["state"], state);
        assert.equal(input["sourcePlan"], plan); assert.equal(input["source"], packet); assert.equal(input["before"], before);
        const path = join(module.directory(id), "worker-startup-footprint-preparation-intent.json"), raw = await readFile(path, "utf8");
        assert.match(raw, /footprint-preparation-intent/u); calls.push("prepared-after-intent");
        prepared = currentFootprintCopyPreparationSchema.parse({ profile: "private.current-footprint-copy-owned-preparation.v1",
          beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256, sourcePlanSha256: sha256Json(plan),
          sourcePacketSha256: sha256Json(packet), copyPlanSha256: "a".repeat(64), nativeArgumentsSha256: "b".repeat(64),
          originalOpeningRetained: true, originalSourceObservationRetained: true, lifecyclePublicationVerified: false,
          copyLaunchPurposeQualified: false, completeCapacityReserved: false, producerBindingVerified: false,
          actorAndClocksVerified: false, executionAuthorized: false, persistenceVerified: false });
        return prepared;
      },
      requireCurrentFootprintCopyOwned: (selected: unknown, opening: unknown): Promise<void> => {
        assert.equal(selected, prepared); assert.ok(opening instanceof Opening); calls.push("reproof");
        return !bindingsMode && mode === "reproof" ? Promise.reject(new Error("synthetic original owner lost")) : Promise.resolve();
      },
    }], ["./current-footprint-copy-bindings-runtime.ts", {
    prepareCurrentFootprintCopyBindingsOwned: async (input: Row): Promise<ReturnType<typeof currentFootprintCopyBindingsSchema.parse>> => {
      assert.ok(module && before && actor && prepared); assert.ok(input["opening"] instanceof Opening);
      assert.equal(input["preparation"], prepared); assert.equal(input["actor"], actor); assert.equal(input["state"], state);
      assert.equal(input["assignments"], assignments); assert.equal(input["result"], result);
      const path = join(module.directory(id), "footprint-copy-bindings-intent.json");
      assert.match(await readFile(path, "utf8"), /bindings-intent/u);
      calls.push("bindings-after-intent");
      if (mode === "reproof") { throw new Error("synthetic original bindings owner lost"); }
      bindingToken = currentFootprintCopyBindingsSchema.parse({ profile: "private.current-footprint-copy-owned-bindings.v1",
        sourcePreparationSha256: sha256Json(prepared), actorPacketSha256: sha256Json(actor), actorPreparationSha256: "a".repeat(64),
        producerObservationSha256: "c".repeat(64), beforeSqlSha256: before.logicalSha256,
        originalOpeningRetained: true, originalProducerObservationRetained: true, originalActorPreparationRetained: true,
        methodCount: 8, lexicalFunctionCount: 7, footprintCapturedUser: "own-undefined", footprintDocheadUserOmitted: true,
        parserAndUploadCallbacksBound: false, transitiveProducerClosuresBound: false, uiSourceRouteBound: false,
        clockProvenanceVerified: false, executionAuthorized: false, persistenceVerified: false });
      return bindingToken;
    },
    retainedCurrentFootprintCopyBindingsProducers: (selected: unknown, opening: unknown): typeof producers => {
      assert.equal(selected, bindingToken); assert.ok(opening instanceof Opening); return producers;
    },
  }]]);
  const adapter = await loadFile("../src/current-pcb-worker-startup-lifecycle-adapter.ts", classes);
  classes.set("./current-pcb-worker-startup-lifecycle-adapter.ts", adapter);
  const lifecycle = await loadFile("../src/current-pcb-diagnostic-lifecycle.ts", classes); module = await loadFixture(lifecycle, bindingsMode);
  let publicationRefused = false;
  const value = module.fixture(context, id, { create209StartupOpening: (): Opening => new Opening(),
    publishRecord: async (...args: Parameters<typeof publishCurrentPcbDiagnosticLifecycleRecord>): Promise<void> => {
      if (dependencyPublicationRefused && args[1] === "footprint-copy-dependencies-result.json") {
        dependencyPublicationRefused = false; throw new Error("synthetic dependency publication refusal");
      }
      if (mode === "publication" && args[1] === (bindingsMode ? "footprint-copy-bindings-result.json" : "worker-startup-footprint-preparation-result.json") && !publicationRefused) {
        publicationRefused = true; throw new Error("synthetic publication refusal");
      }
      await publishCurrentPcbDiagnosticLifecycleRecord(...args);
    },
  });
  if (bindingsMode) {
    const ui = Object.freeze(currentFootprintCopyUiObservationSchema.parse({ profile: "private.current-footprint-copy-ui.v1", functionCount: 9,
      originalNotificationRetained: true, initializedRegistryAndBusRetained: true, extensionEntryAbsentAtObservation: true,
      freshClosureRelationsRechecked: true, projectWorkerTargetBound: false, transitiveClosuresBound: false, executionAuthorized: false }));
    value.owner["observeFootprintCopyUi"] = async (opening: unknown, selected: unknown): Promise<typeof ui> => {
      assert.ok(opening instanceof Opening); assert.equal(selected, result);
      const path = join(module.directory(id), "footprint-copy-ui-intent.json");
      assert.match(await readFile(path, "utf8"), /ui-intent/u); calls.push("ui-after-intent"); return ui;
    };
    value.owner["requireFootprintCopyUi"] = (selected: unknown): Promise<void> => {
      assert.equal(selected, ui); calls.push("ui-reproof");
      return uiExpired ? Promise.reject(new Error("synthetic UI owner lost")) : Promise.resolve();
    };
    value.owner["retainedFootprintCopyUi"] = (): Row => ({ synthetic: true });
    const managerRoute = Object.freeze(currentFootprintCopyManagerRouteObservationSchema.parse({ profile: "private.current-footprint-copy-manager-route.v1",
      runtimeManagerSourceQualified: true, originalUiBusSubscriptionRetained: true, initializedProjectRegistryBound: true,
      footprintReceiverAndWorkerBusBound: true, managerWorkerObjectRetained: true, initializedProjectChannelEntryMatched: true, projectChannelNameMatched: false,
      reciprocalWorkerPeerBound: false, backendDynamicDispatchQualified: false, executionAuthorized: false }));
    let managerRaw: Row = { attempted: false, replies: [] };
    value.owner["observeFootprintCopyManagerRoute"] = async (opening: unknown, selected: unknown): Promise<typeof managerRoute> => {
      assert.ok(opening instanceof Opening); assert.equal(selected, result);
      const path = join(module.directory(id), "footprint-copy-manager-route-intent.json");
      assert.match(await readFile(path, "utf8"), /manager-route-intent/u); calls.push("manager-route-after-intent");
      managerRaw = { attempted: true, replies: [{ scriptSource: "x".repeat(2_200_000) }] }; return managerRoute;
    };
    value.owner["requireFootprintCopyManagerRoute"] = (selected: unknown): Promise<void> => {
      assert.equal(selected, managerRoute); calls.push("manager-route-reproof");
      return managerRouteExpired ? Promise.reject(new Error("synthetic manager route owner lost")) : Promise.resolve();
    };
    value.owner["retainedFootprintCopyManagerRoute"] = (): Row => managerRaw;
  }
  result = Object.freeze({ opening: module.OPEN_RESULT, construction: Object.freeze({ profile: "private.current-pcb209-worker-construction.v1", pauses: 9,
    originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false,
    wrapperAssignmentRelationVerified: false, nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false }),
    workerIdentity: { projectUuid: module.OPEN_RESULT.projectUuid, branchUuid: module.OPEN_RESULT.branchUuid, windowTabId: "fixture-tab" },
    ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  state = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: result.workerIdentity,
    client: "1234567890abcdef", maximumTicket: 100, capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true,
    atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
  packet = currentFootprintSourceReadPacketSchema.parse({ profile: "private.current-footprint-source-read.v1",
    request: { identity: result.workerIdentity, footprintUuid: "1234567890abcdef", client: state.client, maximumTicket: 100 },
    content: "synthetic source", sourceSha256: sha256Text("synthetic source"), sourceSamples: 2, stateSamples: 4, route: "native-cache-equivalent",
    sourceGetterDispatched: false, cacheRead: { keys: 1, bytes: 100, atoms: 1 }, cacheWrites: 0, networkRequests: 0,
    exactKeyedSourceVerified: true, comparison: "complete-checkpoint-records-native-order", checkpointByteOrderMatched: false, nativeOrderStable: true,
    keyedRecordsSha256: "a".repeat(64), observedOrderSha256: "b".repeat(64), canvasRecords: 1, tombstones: 0,
    cacheEffectsPossible: false, cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false });
  if (bindingsMode) {
    const identity = result.workerIdentity, user = { uuid: "c".repeat(32), nickname: "Synthetic", username: "synthetic", avatar: "" };
    const stamp = { milliseconds: 1_700_000_000_000, iso: "2023-11-14T22:13:20.000Z", timezoneOffsetMinutes: 0 };
    const sample = (phase: "ui" | "worker"): unknown => ({ result: { type: "string", value: JSON.stringify({
      schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", phase, identity, workerUser: user, workerUserText: JSON.stringify(user),
      clock: { before: stamp, after: stamp }, ...(phase === "ui" ? { cachedActor: { uuid: user.uuid, username: user.username, nickname: user.nickname },
        startupActor: { uuid: user.uuid, username: user.username, nickname: user.nickname } } :
        { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
    }) } });
    const originalActorPacket = await new CurrentPcbWorkerStartupActorRunner({
      observeUi: (): Promise<unknown> => Promise.resolve(sample("ui")), observeWorker: (): Promise<unknown> => Promise.resolve(sample("worker")),
      assertCurrent: (): Promise<void> => Promise.resolve(),
    }, identity).observe();
    const body = { profile: "private.current-pcb209-worker-startup-actor.v1", sourceClosureSha256: "d".repeat(64), originalActorPacket,
      originalConstructorOwnerVerified: false, nativeSourceContextsOwned: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
      futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false };
    actor = currentPcb209WorkerStartupActorPacketSchema.parse({ ...body, packetSha256: sha256Json(body) });
  }
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const channel = new CurrentPcbWorkerStartupChannel({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(value.state.terminated); return Promise.resolve(); }, observeOriginalParentEvent: unused, exchange: unused });
  const handoff: CurrentPcbWorkerStartupHandoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({
    context: (): Readonly<{ sessionId: string; uniqueContextId: string }> => ({ sessionId: parent.sessionId, uniqueContextId: "parent-context" }),
    reprove: (): Promise<void> => Promise.resolve(), begin: unused, finish: unused, observeParent: unused,
    ancillaryFrame: (): null => null, observeAncillary: unused, ancillaryObservation: (): null => null,
  }) });
  value.owner["handoffWorkerStartup"] = (): Promise<CurrentPcbWorkerStartupHandoff> => Promise.resolve(handoff);
  const status = value.owner["status"]; assert.ok(typeof status === "function"); let nextRequestId = 100;
  value.owner["status"] = (): Row => {
    const observed: unknown = Reflect.apply(status, value.owner, []); assert.ok(observed !== null && typeof observed === "object");
    return { ...observed, workerStartupChannel: { ...channel.status(), nextRequestId } };
  };
  context.after(async (): Promise<void> => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  await module.readyForOpening(id, value);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = inspected["bindingSha256"];
  assert.ok(typeof binding === "string"); await value.coordinator.handoffWorkerStartup(id, binding);
  await value.coordinator.openWorkerStartup(id, binding, module.STARTUP_OPEN_INPUT);
  await value.coordinator.observeWorkerStartupAssignments(id, binding);
  await value.coordinator.observeWorkerStartupFootprint(id, binding);
  await value.coordinator.observeWorkerStartupFootprintSource(id, binding, { footprintUuid: "1234567890abcdef" });
  nextRequestId = !bindingsMode && mode === "capacity" ? 218 : 217;
  const directory = module.directory(id);
  const invoke = async (name: string): Promise<Row> => {
    const method: unknown = Reflect.get(value.coordinator, name); assert.ok(typeof method === "function");
    const response: unknown = await Reflect.apply(method, value.coordinator, [id, binding]);
    assert.ok(response !== null && typeof response === "object"); return Object.fromEntries(Object.entries(response));
  };
  const uiCallbacks = { observeUi: (): Promise<Row> => invoke("observeWorkerStartupFootprintUi"),
    prepareDependencies: (): Promise<Row> => invoke("prepareWorkerStartupFootprintDependencies"),
    observeManagerRoute: (): Promise<Row> => invoke("observeWorkerStartupFootprintManagerRoute"),
    expireManagerRoute: (): void => { managerRouteExpired = true; },
    expireDependencies: (): void => { dependenciesExpired = true; },
    refuseDependencyPublication: (): void => { dependencyPublicationRefused = true; },
    setNextRequestId: (next: number): void => { nextRequestId = next; }, expireUi: (): void => { uiExpired = true; } };
  if (!bindingsMode) { return { ...uiCallbacks, value, id, binding, calls, directory,
    prepare: (): Promise<Row> => value.coordinator.prepareWorkerStartupFootprintCopy(id, binding) }; }
  await value.coordinator.prepareWorkerStartupFootprintCopy(id, binding);
  await value.coordinator.observeWorkerStartupActor(id, binding); calls.length = 0;
  nextRequestId = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit - CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS +
    (mode === "capacity" ? 2 : 1);
  return { ...uiCallbacks, value, id, binding, calls, directory, prepare: (): Promise<Row> => invoke("prepareWorkerStartupFootprintBindings") };
}
for (const mode of ["success", "capacity", "reproof", "publication"] as const) {
  void test(`footprint preparation publishes original inputs once and preserves cleanup: ${mode}`, async context => {
    const f = await fixture(context, mode);
    if (mode === "success") {
      const result = await f.prepare(); assert.equal(result["preparationPublished"], true); assert.equal(result["executionAuthorized"], false);
      assert.deepEqual(f.calls, ["prepared-after-intent", "reproof"]);
      assert.match(await readFile(join(f.directory, "worker-startup-footprint-preparation-result.json"), "utf8"), /"copyLaunchPurposeQualified":false/u);
    } else {
      const expected = { capacity: /FOOTPRINT_PREPARATION_CAPACITY/u, publication: /publication refusal/u, reproof: /original owner lost/u }[mode];
      await assert.rejects(f.prepare(), expected);
      assert.deepEqual(f.calls, mode === "capacity" ? [] : ["prepared-after-intent", "reproof"]);
      await assert.rejects(readFile(join(f.directory, "worker-startup-footprint-preparation-result.json")), { code: "ENOENT" });
    }
    await assert.rejects(f.prepare(), /WORKER_STARTUP_FOOTPRINT_PREPARATION_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["workerStartupFootprintPreparationAttemptConsumed"], true);
    assert.equal(inspection["workerStartupFootprintPreparationRetained"], mode !== "capacity");
    if (mode === "publication") {
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspection["intentSha256"] });
      assert.match(await readFile(join(f.directory, "worker-startup-footprint-preparation-result.json"), "utf8"), /"executionAuthorized":false/u);
      assert.deepEqual(f.calls, ["prepared-after-intent", "reproof"]);
    }
  });
}

for (const mode of ["success", "capacity", "reproof"] as const) {
  void test(`manager route requires published dependencies and preserves an unproved peer: ${mode}`, async context => {
    const f = await fixture(context, "success", true); await f.prepare(); f.setNextRequestId(1); await f.observeUi();
    await assert.rejects(f.observeManagerRoute(), /ORIGINAL_FOOTPRINT_MANAGER_ROUTE_INPUT_REQUIRED/u);
    await f.prepareDependencies(); f.calls.length = 0;
    const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.managerRoute; assert.equal(requests, 56);
    f.setNextRequestId(CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit - requests + (mode === "capacity" ? 2 : 1));
    if (mode === "reproof") { f.expireManagerRoute(); }
    if (mode === "success") {
      const observed = await f.observeManagerRoute(); assert.equal(observed["managerRoutePublished"], true); assert.equal(observed["executionAuthorized"], false);
      assert.match(await readFile(join(f.directory, "footprint-copy-manager-route-result.json"), "utf8"), /"reciprocalWorkerPeerBound":false/u);
    } else { await assert.rejects(f.observeManagerRoute(), mode === "capacity" ? /FOOTPRINT_MANAGER_ROUTE_CAPACITY/u : /manager route owner lost/u); }
    assert.deepEqual(f.calls, mode === "capacity" ? [] : ["manager-route-after-intent", "manager-route-reproof"]);
    await assert.rejects(f.observeManagerRoute(), /FOOTPRINT_MANAGER_ROUTE_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["footprintManagerRouteAttemptConsumed"], true); assert.equal(inspection["footprintManagerRouteRetained"], mode !== "capacity");
    assert.equal(inspection["footprintManagerRouteResultPublished"], mode === "success");
    const summary = z.record(z.string(), z.unknown()).parse(inspection["footprintManagerRouteObservation"]);
    assert.equal(summary["rawRepliesInline"], false); assert.equal(summary["fullObservationPersisted"], false);
    const retained = f.value.owner["retainedFootprintCopyManagerRoute"]; assert.ok(typeof retained === "function");
    assert.equal(summary["sha256"], sha256Json(Reflect.apply(retained, f.value.owner, []) as unknown));
    if (mode !== "capacity") { assert.ok(typeof summary["jsonBytes"] === "number" && summary["jsonBytes"] > 2_200_000); }
    assert.ok(Buffer.byteLength(JSON.stringify(inspection)) < 512 * 1024);
  });
}

for (const mode of ["success", "capacity", "reproof", "publication"] as const) {
  void test(`copy-purpose bindings retain original composition and journal before dispatch: ${mode}`, async context => {
    const f = await fixture(context, mode, true);
    if (mode === "success") {
      const result = await f.prepare(); assert.equal(result["bindingsPublished"], true); assert.equal(result["executionAuthorized"], false);
    } else {
      const expected = { capacity: /FOOTPRINT_BINDINGS_CAPACITY/u, publication: /publication refusal/u, reproof: /bindings owner lost/u }[mode];
      await assert.rejects(f.prepare(), expected);
      await assert.rejects(readFile(join(f.directory, "footprint-copy-bindings-result.json")), { code: "ENOENT" });
    }
    assert.deepEqual(f.calls, mode === "capacity" ? [] : ["bindings-after-intent"]);
    await assert.rejects(f.prepare(), /FOOTPRINT_BINDINGS_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["footprintBindingsAttemptConsumed"], true);
    assert.equal(inspection["footprintBindingsRetained"], mode === "success" || mode === "publication");
    if (mode === "publication") {
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspection["intentSha256"] });
      assert.match(await readFile(join(f.directory, "footprint-copy-bindings-result.json"), "utf8"), /"executionAuthorized":false/u);
      assert.deepEqual(f.calls, ["bindings-after-intent"]);
    }
  });
}

for (const mode of ["success", "capacity", "reproof"] as const) {
  void test(`copy-purpose UI stage chains published bindings and retains lost post-read proof: ${mode}`, async context => {
    const f = await fixture(context, "success", true); await f.prepare(); f.calls.length = 0;
    const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests;
    f.setNextRequestId(CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit - requests.uiObserve - requests.uiReprove +
      (mode === "capacity" ? 2 : 1));
    if (mode === "reproof") { f.expireUi(); }
    if (mode === "success") {
      const observed = await f.observeUi(); assert.equal(observed["uiObservationPublished"], true); assert.equal(observed["executionAuthorized"], false);
      const record = await readFile(join(f.directory, "footprint-copy-ui-result.json"), "utf8");
      assert.match(record, /"projectWorkerTargetBound":false/u);
    } else { await assert.rejects(f.observeUi(), mode === "capacity" ? /FOOTPRINT_UI_CAPACITY/u : /UI owner lost/u); }
    assert.deepEqual(f.calls, mode === "capacity" ? [] : ["ui-after-intent", "ui-reproof"]);
    await assert.rejects(f.observeUi(), /FOOTPRINT_UI_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["footprintUiAttemptConsumed"], true); assert.equal(inspection["footprintUiRetained"], mode !== "capacity");
    assert.equal(inspection["footprintUiResultPublished"], mode === "success");
  });
}

for (const mode of ["success", "capacity", "reproof", "publication"] as const) {
  void test(`copy dependencies require original bindings and UI publication, consume once and preserve evidence: ${mode}`, async context => {
    const f = await fixture(context, "success", true); await f.prepare();
    await assert.rejects(f.prepareDependencies(), /ORIGINAL_FOOTPRINT_DEPENDENCIES_INPUT_REQUIRED/u);
    f.setNextRequestId(1); await f.observeUi(); f.calls.length = 0;
    const requests = 4 + CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS.observeMaximum + CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS.requireMaximum;
    assert.equal(requests, 89);
    f.setNextRequestId(CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit - requests + (mode === "capacity" ? 2 : 1));
    if (mode === "reproof") { f.expireDependencies(); }
    if (mode === "publication") { f.refuseDependencyPublication(); }
    if (mode === "success") {
      const observed = await f.prepareDependencies(); assert.equal(observed["dependenciesPublished"], true); assert.equal(observed["executionAuthorized"], false);
      assert.match(await readFile(join(f.directory, "footprint-copy-dependencies-result.json"), "utf8"), /"parserSubscriberCallbacksBound":false/u);
    } else {
      const expected = { capacity: /FOOTPRINT_DEPENDENCIES_CAPACITY/u, reproof: /dependency owner lost/u, publication: /dependency publication refusal/u }[mode];
      await assert.rejects(f.prepareDependencies(), expected);
      await assert.rejects(readFile(join(f.directory, "footprint-copy-dependencies-result.json")), { code: "ENOENT" });
    }
    assert.deepEqual(f.calls, mode === "capacity" ? [] : ["dependencies-after-intent", "dependencies-reproof"]);
    await assert.rejects(f.prepareDependencies(), /FOOTPRINT_DEPENDENCIES_CONSUMED/u);
    const inspection = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspection["footprintDependenciesAttemptConsumed"], true); assert.equal(inspection["footprintDependenciesRetained"], mode !== "capacity");
    assert.equal(inspection["footprintDependenciesResultPublished"], mode === "success");
    if (mode === "publication") {
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspection["intentSha256"] });
      assert.match(await readFile(join(f.directory, "footprint-copy-dependencies-result.json"), "utf8"), /"originalDependencyReproofCompleted":true/u);
      assert.deepEqual(f.calls, ["dependencies-after-intent", "dependencies-reproof"]);
    }
  });
}
