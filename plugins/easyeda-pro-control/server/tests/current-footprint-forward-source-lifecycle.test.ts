/** Real lifecycle, adapter, journal and completed SQL custody with synthetic
 * native collectors. These checks prove routing and refusal, not connected CAD. */
/* oxlint-disable import/max-dependencies -- Join the actual lifecycle/adapter and complete SQL fixture with explicitly synthetic native boundaries. */
import assert from "node:assert/strict";
import { readFile, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { controlDataDirectory } from "../src/artifacts.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS } from "../src/current-footprint-copy-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY, CurrentFootprintCopyForwardResourceLedger } from "../src/current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE } from "../src/current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "../src/current-footprint-copy-preparation-profile.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { currentPcb209WorkerStartupActorPacketSchema } from "../src/current-pcb-209-worker-startup-actor.ts";
import { currentFootprintCopyMainBackendObservationSchema } from "../src/current-footprint-copy-main-backend-runner.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { currentFootprintCopyPreparationSchema } from "../src/current-footprint-copy-preparation.ts";
import { currentFootprintSourceReadPacketSchema } from "../src/current-footprint-source-read-runner.ts";
import { currentFootprintCopyRouteObservationSchema } from "../src/current-footprint-copy-route-observation.ts";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_FOOTPRINT_FORWARD_PREWRITE_FAILURE_MAX_BYTES, CURRENT_FOOTPRINT_FORWARD_PREWRITE_RESULT_MAX_BYTES, diagnosticLifecycleRecordSchemas,
  publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CurrentFootprintForwardPrewriteLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import type { CurrentFootprintCopyStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { readExactSqlInventory } from "../src/sqlite-inventory.ts";

type Row = Record<string, unknown>;
interface Fixture {
  readonly coordinator: CurrentFootprintForwardPrewriteLifecycle;
  readonly owner: Row;
  readonly options: CurrentPcbDiagnosticLifecycleOptions;
  readonly state: { terminated: boolean };
}
interface Module {
  readonly fixture: (context: TestContext, id: string, dependencies: Row) => Fixture;
  readonly readyForOpening: (id: string, value: Fixture) => Promise<void>;
  readonly directory: (id: string) => string;
  readonly OPEN_RESULT: CurrentFootprintCopyStartupOpeningResult["opening"];
  readonly STARTUP_OPEN_INPUT: Row;
}
/** Evaluate unchanged production modules against explicit synthetic imports. */
async function load(path: URL, source: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const generated = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Row } = { exports: {} }, original = createRequire(path);
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : original(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
/** Reuse only the existing synthetic owner/SQL setup, with a fresh fixed purpose. */
async function fixtureModule(lifecycle: Row): Promise<Module> {
  const path = new URL("current-pcb-diagnostic-lifecycle.test.ts", import.meta.url);
  const complete = await readFile(path, "utf8");
  const offset = complete.indexOf("\nvoid test("); assert.ok(offset > 10_000 && offset < 40_000); let source = complete.slice(0, offset);
  const substitutions = [
    ["diagnostic-test|pcb209-test|string-precreate-test|worker-startup-test", "diagnostic-test|pcb209-test|footprint-copy-qualify-test|string-precreate-test|worker-startup-test"],
    ['const startupPurpose = id.startsWith("worker-startup-");', 'const startupPurpose = id.startsWith("worker-startup-") || id.startsWith("footprint-copy-qualify-");'],
    ['profile: ownerPurpose, stringPrecreateConsumed:', 'profile: startupPurpose ? "worker-startup-footprint-forward209" : ownerPurpose, stringPrecreateConsumed:'],
    ['return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });', 'return Promise.resolve({ sourceVerified: true, family: profile.family, sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, relativePath: profile.relativePath, executionAuthorized: false });'],
    ['acceptExistingProfileEffects: true };', 'acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true };'],
  ] as const;
  for (const [before, after] of substitutions) { assert.equal(source.split(before).length, 2); source = source.replace(before, after); }
  source = source.replaceAll("/worker-startup-launch-intent/u", "/footprint-forward-prewrite-launch-intent/u");
  source += "\nexport { fixture, readyForOpening, directory, OPEN_RESULT, STARTUP_OPEN_INPUT };\n";
  const loaded = await load(path, source, new Map([["../src/current-pcb-diagnostic-lifecycle.ts", { ...lifecycle,
    CurrentPcbWorkerStartupLifecycle: lifecycle["CurrentFootprintForwardPrewriteLifecycle"] }]]));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This bounded fixture prefix exports the checked synthetic fixture above, never a production capability.
  return loaded as unknown as Module;
}
/** Supply finite, ordered synthetic Windows clock samples. */
function clockSample(milliseconds: number): Row {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1",
    utcBeforeTicks: String(639_274_896_000_000_000n + BigInt(milliseconds) * 10_000n), utcAfterTicks: String(639_274_896_000_010_000n + BigInt(milliseconds) * 10_000n),
    qpcBefore: String(10_000_000_000_000_000n + BigInt(milliseconds) * 1000n), qpcAfter: String(10_000_000_000_001_000n + BigInt(milliseconds) * 1000n),
    qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: "a".repeat(64) };
}
/** Complete strict route sample data. Only the synthetic original methods below
 * issue these objects; the test never treats their JSON as a native capability. */
function routeEvidence(binding: Row): Row {
  const shape = currentFootprintCopyRouteObservationSchema.shape;

  return {
    cacheConstruction: shape.cacheConstruction.parse({ profile: "private.current-footprint-cache-construction.v1", originalOpenEventsObserved: 4,
      originalWrapperReceiversMatched: true, originalNativeCacheResultsMatched: true, bothNamespaceArgumentsMatched: true,
      originalProjectAssignmentsMatched: true, nativeOpenInvokedByAgent: false, networkBackendOwned: false, executionAuthorized: false }),
    producers: shape.producers.parse({ profile: "private.current-footprint-copy-producer.v1", methodCount: 8, lexicalFunctionCount: 7, freshScopeCount: 5,
      originalMethodRelationsRechecked: true, lexicalIdentitiesRechecked: true, parserAndUploadCallbacksBound: false, transitiveProducerClosuresBound: false,
      uiSourceRouteBound: false, clockProvenanceVerified: false, nativeGenerationClosed: false, executionAuthorized: false }),
    dependencies: shape.dependencies.parse({ profile: "private.current-footprint-copy-dependencies.v1", selectedFunctionCount: 64, freshDirectScopeCount: 3,
      nativeParserOverrideQualified: true, nativePublicationMethodsRetained: true, ownUploadStructureCallbackRetained: true, uploadStructureArrowReceiverVerified: false,
      originalSelectedIdentitiesRechecked: true, initializedNotificationBusRetained: true, originalCacheObjectsRetained: true, cacheWrapperFunctionsQualified: 7,
      cacheWrapperNamespaceNamesMatched: true, originalNativeCacheReceiverCandidatesRetained: true, nativeCacheFunctionsQualified: 4, nativeCacheNamespaceProvenanceVerified: false,
      parserSubscriberCallbacksBound: false, uploadCallbacksBound: false, transitiveProducerClosuresBound: false, notificationPeerOwnershipVerified: false,
      clockProvenanceVerified: false, executionAuthorized: false }),
    callbacks: shape.callbacks.parse({ profile: "private.current-footprint-copy-async.v1", sourceQualifiedCallbacks: 7, parserHeadSubscribers: 1, parserChangeSubscribers: 1,
      originalCallbackIdentitiesRetained: true, bufferedClosureProjectMatched: true, coherentSnapshots: 2,
      snapshot: { timerPending: false, bufferedPromiseRetained: false, task1: 0, task2: 0, task3: 0, cachePromises: 0, bufferedUploads: 0,
        bufferedUploadCaches: 0, uploading: false, batchUploading: false, pendingSync: false }, trackedQueuesEmptyAtSamples: true,
      parserArrowReceiversVerified: true, uploadArrowReceiverVerified: true, untrackedUploadCacheCleanupComplete: false, callbacksCompleted: false,
      originalConstructionUploadMatched: true, originalParserRegistrationArgumentsMatched: true, executionAuthorized: false }),
    destinations: shape.destinations.parse({ profile: "private.current-footprint-copy-destinations.v1", selectedFunctions: 28, originalProjectAndApiObjectsMatched: true,
      privateCooperationBranchExcluded: true, trackedUploadQueuesEmptyAtObservation: true, relativeHistoryRoutesQualified: true,
      nativeHttpBackendOwned: false, notificationPeerOwned: false, cacheNamespacesQualified: false, callbacksCompleted: false, executionAuthorized: false }),
    ui: shape.ui.parse({ profile: "private.current-footprint-copy-ui.v1", functionCount: 9, originalNotificationRetained: true, initializedRegistryAndBusRetained: true,
      extensionEntryAbsentAtObservation: true, freshClosureRelationsRechecked: true, projectWorkerTargetBound: false, transitiveClosuresBound: false, executionAuthorized: false }),
    manager: shape.manager.parse({ profile: "private.current-footprint-copy-manager-route.v2", runtimeManagerSourceQualified: true, originalUiBusSubscriptionRetained: true,
      initializedProjectRegistryBound: true, footprintReceiverAndWorkerBusBound: true, managerWorkerObjectRetained: true, initializedProjectChannelEntryMatched: true,
      projectChannelNameMatched: true, reciprocalWorkerPeerBound: false, backendDynamicDispatchQualified: false, executionAuthorized: false }),
    peer: shape.peer.parse({ profile: "private.current-footprint-parent-worker-peer.v1", parentWorkerNativeMessageReceivedByOriginalChild: true,
      diagnosticListenerRemoved: true, reciprocalProjectChannelQualified: false, backendDynamicDispatchQualified: false, executionAuthorized: false }),
    clockRegistration: shape.clockRegistration.parse({ profile: "private.current-footprint-copy-clock-registration.v1", runtimeWsSourceQualified: true,
      originalNotificationBusRetained: true, originalRpcWrapperAndCallbackRetained: true, originalNativeDateNowRetained: true, initialLexicalOffset: 0,
      documentClockInvocationObserved: false, responderExclusivityProven: false, backendOwnershipProven: false, executionAuthorized: false }),
    clockRegistrationFinalSample: shape.clockRegistrationFinalSample.parse({ profile: "private.current-footprint-copy-clock-registration-sample.v1",
      sampleIndex: 1, lexicalOffset: 0, documentClockInvocationObserved: false, executionAuthorized: false }),
    windowsClock: shape.windowsClock.parse({ profile: "private.current-footprint-copy-windows-clock.v1", phase: "before", sequence: 1, binding,
      before: clockSample(1000), after: clockSample(1010), originalTransportIssued: true, rawReplySha256: "d".repeat(64), nativeClockSamplesVerified: true,
      backendActorProvenanceVerified: false, documentClockProvenanceVerified: false, executionAuthorized: false, saveAuthorized: false }),
  };
}
function unused(): never { throw new Error("Unexpected synthetic native operation"); }
/** Match the durable publisher's complete UTF-8 JSON and trailing newline. */
function recordBytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\n`); }

/** Exercise the genuine mounted stage and original-reference joins. Native
 * inspection and plan leaves are synthetic; all lifecycle/journal guards run. */
type BaselineMode = "success" | "seal-capacity" | "seal-failure" | "seal-publication" | "closed-failure" | "closed-publication" | "seal-failure-publication" | "closed-failure-publication";
async function fixture(context: TestContext, mode: "success" | "capacity" | "source-failure" | "checkpoint-failure" | "publication" | "method-drift" | "unsupported" | "unicode-failure" | "route-capacity" | "result-bound" | "failure-chain" | "failure-publication" | "source-page", routeHeadroom: "exact" | "short" = "short", baselineMode?: BaselineMode):
Promise<Readonly<{ value: Fixture; id: string; binding: string; calls: string[]; errors: Readonly<{ qualification: Error; publication: Error; seal: Error; closed: Error }>; qualify: () => Promise<Row>; next: () => number; route: () => Promise<Row>; routeStarted: () => boolean; normal: () => number; packetHash: () => string }>> {
  const calls: string[] = [];
  const errors = Object.freeze({ qualification: new Error("synthetic source failure"), publication: new Error("synthetic failure record publication failure"),
    seal: new Error("synthetic source seal failure"), closed: new Error("synthetic closed SQL difference") });
  let id = `footprint-copy-qualify-test-${mode}${baselineMode === undefined ? "" : `-${baselineMode}`}`;
  if (mode === "unicode-failure") { id = id.padEnd(80, "x"); }
  if (mode === "route-capacity") { id += `-${routeHeadroom}`; }
  let module: Module | null = null, result: CurrentFootprintCopyStartupOpeningResult | null = null;
  let state: ReturnType<typeof currentFootprintCopyStatePacketSchema.parse> | null = null;
  let source: ReturnType<typeof currentFootprintSourceReadPacketSchema.parse> | null = null;
  let preparation: ReturnType<typeof currentFootprintCopyPreparationSchema.parse> | null = null;
  let actor: ReturnType<typeof currentPcb209WorkerStartupActorPacketSchema.parse> | null = null;
  let before: Awaited<ReturnType<typeof readExactSqlInventory>> | null = null, plan: Row | null = null;
  let failFailurePublication = mode === "failure-publication", failPublication = mode === "publication", routeStarted = false, sourceStarted = false;
  let baselineFailurePublicationFailed = false, baselinePublicationFailed = false, originalSeal: Row | null = null;
  let baselineOwner: Row | null = null;
  let baselineState: Fixture["state"] | null = null;
  let consumeNormal: ((count: number) => void) | null = null;
  const packets = routeEvidence({ helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" });
  const assignments = Object.freeze({ profile: "private.current-pcb-worker-construction-assignments.v1", callbackKinds: ["uploadStructure", "structure", "cooperation", "upload"],
    originalConstructionCallbacksMatched: true, originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true,
    continuousAssignmentOwnershipVerified: false, nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false,
    writeDestinationsContained: false, atomicSnapshotVerified: false, queueCompletionVerified: false, executionAuthorized: false });
  class Opening {
    readonly #original = Object.freeze({ synthetic: true });
    public async open(_target: unknown, check: () => Promise<void>): Promise<CurrentFootprintCopyStartupOpeningResult> { assert.ok(this.#original.synthetic); await check(); assert.ok(result); return result; }
    public status(): Row { assert.ok(this.#original.synthetic); return { completed: true, synthetic: this.#original.synthetic }; }
    public retainedOpeningResult(): CurrentFootprintCopyStartupOpeningResult["opening"] | null { assert.ok(this.#original.synthetic); return result?.opening ?? null; }
    public requireOriginal(selected: unknown): Promise<object> { assert.ok(this.#original.synthetic); assert.equal(selected, result); return Promise.resolve(this.#original); }
    public proveCurrentAssignments(): Promise<object> { assert.ok(this.#original.synthetic); return Promise.resolve(assignments); }
    public requireCurrentAssignments(): Promise<void> { assert.ok(this.#original.synthetic); return Promise.resolve(); }
    public retainedActorObservation(): null { assert.ok(this.#original.synthetic); return null; }
    public observeActorClock(): Promise<typeof actor> { assert.ok(this.#original.synthetic); return Promise.resolve(actor); }
    public requireActorClock(_result: unknown, _assignments: unknown, selected: unknown): Promise<void> { assert.ok(this.#original.synthetic); assert.equal(selected, actor); return Promise.resolve(); }
    public retainedChannelObservation(): null { assert.ok(this.#original.synthetic); return null; }
    public observeCurrentChannel = unused;
    public requireCurrentChannel = unused;
    public retainedFootprintState(): null { assert.ok(this.#original.synthetic); return null; }
    public observeFootprintState(): Promise<typeof state> { assert.ok(this.#original.synthetic); return Promise.resolve(state); }
    public requireFootprintState(): Promise<void> { assert.ok(this.#original.synthetic); return Promise.resolve(); }
    public retainedFootprintSource(): Row { assert.ok(this.#original.synthetic); return { sourceStarted }; }
    public async observeFootprintSource(selected: unknown, assigned: unknown, observed: unknown, selectedPlan: unknown): Promise<NonNullable<typeof source>> { assert.ok(this.#original.synthetic);
      assert.ok(module && result && source); assert.equal(selected, result); assert.equal(assigned, assignments); assert.equal(observed, state); assert.equal(selectedPlan, plan);
      const intentPath = join(module.directory(id), "forward-prewrite-intent.json");
      assert.match(await readFile(intentPath, "utf8"), /footprint-forward-prewrite-intent/u);
      sourceStarted = true; calls.push("source-after-intent"); assert.ok(consumeNormal); consumeNormal(65);
      if (mode === "source-failure" || mode === "failure-publication") { throw errors.qualification; }
      if (mode === "method-drift") { this.requireFootprintSource = unused; }
      return source;
    }
    public requireFootprintSource(selected: unknown, assigned: unknown, observed: unknown, selectedPlan: unknown, packet: unknown): Promise<void> { assert.ok(this.#original.synthetic);
      assert.equal(selected, result); assert.equal(assigned, assignments); assert.equal(observed, state); assert.equal(selectedPlan, plan); assert.equal(packet, source);
      calls.push("source-reproof");  return Promise.resolve();
    }
    public observeFootprintCacheConstruction(): Promise<unknown> { assert.ok(this.#original.synthetic); routeStarted = true; return Promise.resolve(packets["cacheConstruction"]); }
    public observeFootprintProducers(): Promise<unknown> { assert.ok(this.#original.synthetic); return Promise.resolve(packets["producers"]); }
    public observeFootprintDependencies(): Promise<unknown> { assert.ok(this.#original.synthetic); return Promise.resolve(packets["dependencies"]); }
    public observeFootprintRegisteredAsync(): Promise<unknown> { assert.ok(this.#original.synthetic); return Promise.resolve(packets["callbacks"]); }
    public observeFootprintDestinations(): Promise<unknown> { assert.ok(this.#original.synthetic); return Promise.resolve(packets["destinations"]); }
    public requireFootprintRouteObservations(): Promise<void> { assert.ok(this.#original.synthetic); return Promise.resolve(); }
    public retainedFootprintRouteObservations(): Row { assert.ok(this.#original.synthetic); return packets; }
    public releaseAfterTermination(): Promise<void> { assert.ok(this.#original.synthetic); calls.push("opening-release"); return Promise.resolve(); }
  }
  const classes = new Map<string, unknown>([["./current-pcb-209-worker-startup-opening.ts", { CurrentFootprintCopyStartupOpening: Opening, CurrentPcb209WorkerStartupOpening: Opening }],
    ["./current-footprint-source-plan.ts", { prepareCurrentFootprintSourcePlan: (inventory: NonNullable<typeof before>): Promise<Row> => {
      before = inventory; if (mode === "checkpoint-failure") { throw new Error("synthetic source plan refusal"); }
      plan = Object.freeze({ maximumTicket: 100, beforeSqlSha256: inventory.logicalSha256, beforeCheckpointSha256: inventory.checkpointSha256 }); return Promise.resolve(plan);
    } }], ["./current-footprint-copy-preparation-runtime.ts", {
      prepareCurrentFootprintCopyOwned: async (input: Row): Promise<NonNullable<typeof preparation>> => {
        assert.ok(before && plan && source && result && module); assert.ok(input["opening"] instanceof Opening);
        assert.equal(input["result"], result); assert.equal(input["assignments"], assignments); assert.equal(input["state"], state);
        assert.equal(input["sourcePlan"], plan); assert.equal(input["source"], source); assert.equal(input["before"], before);
        const intentPath = join(module.directory(id), "forward-prewrite-intent.json");
      assert.match(await readFile(intentPath, "utf8"), /footprint-forward-prewrite-intent/u);
        calls.push("preparation-after-intent");
        for (let index = 0; index < 3; index += 1) {
          const opening = input["opening"]; assert.ok(opening instanceof Opening);
          await opening.requireFootprintSource(result, assignments, state, plan, source);
        }
        assert.ok(consumeNormal); consumeNormal(6);
        preparation = currentFootprintCopyPreparationSchema.parse({ profile: "private.current-footprint-copy-owned-preparation.v1", beforeCheckpointSha256: before.checkpointSha256,
          beforeSqlSha256: before.logicalSha256, sourcePlanSha256: sha256Json(plan), sourcePacketSha256: sha256Json(source), copyPlanSha256: "a".repeat(64),
          nativeArgumentsSha256: "b".repeat(64), originalOpeningRetained: true, originalSourceObservationRetained: true, lifecyclePublicationVerified: false,
          copyLaunchPurposeQualified: false, completeCapacityReserved: false, producerBindingVerified: false, actorAndClocksVerified: false, executionAuthorized: false, persistenceVerified: false });
        return preparation;
      },
      requireCurrentFootprintCopyOwned: async (selected: unknown, opening: unknown): Promise<Row> => {
        assert.equal(selected, preparation); assert.ok(opening instanceof Opening); assert.ok(consumeNormal); consumeNormal(2);
        await opening.requireFootprintSource(result, assignments, state, plan, source);
        if (mode === "unicode-failure") { throw new Error("\u0000\uD800".repeat(2048)); }
        return { before, sourcePlan: plan, sourceAssets: Object.freeze({ status: mode === "unsupported" || mode === "failure-chain" ? "unsupported" : "qualified" }), headReference: Object.freeze({ ageVerified: false }) };
      },
    }], ["./current-footprint-forward-source-seal.ts", {
    sealCurrentFootprintForwardSource: async (owner: unknown, operationId: string, opening: unknown, actualResult: unknown,
      actualPreparation: unknown, checkpoint: Row): Promise<Row> => {
      assert.ok(module && before); assert.equal(owner, baselineOwner); assert.equal(operationId, id);
      assert.ok(opening instanceof Opening); assert.equal(actualResult, result); assert.equal(actualPreparation, preparation);
      assert.equal(checkpoint["checkpointSha256"], before.checkpointSha256);
      const intentPath = join(module.directory(id), "forward-source-seal-intent.json");
      assert.match(await readFile(intentPath, "utf8"), /source-seal-intent/u);
      calls.push("seal-after-intent"); assert.ok(consumeNormal); consumeNormal(6);
      if (baselineMode === "seal-failure" || baselineMode === "seal-failure-publication") { throw errors.seal; }
      originalSeal = Object.freeze({ beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256, sourceBindingSha256: "a".repeat(64) });
      return originalSeal;
    },
    proveCurrentFootprintForwardClosedBaseline: async (seal: unknown): Promise<Row> => {
      assert.ok(module && before && originalSeal); assert.equal(seal, originalSeal); assert.equal(baselineState?.terminated, true);
      const intentPath = join(module.directory(id), "forward-closed-baseline-intent.json");
      assert.match(await readFile(intentPath, "utf8"), /closed-baseline-intent/u);
      calls.push("closed-after-intent");
      if (baselineMode === "closed-failure" || baselineMode === "closed-failure-publication") { throw errors.closed; }
      return { before, after: before, closedCheckpointSha256: "c".repeat(64), closedSqlSha256: before.logicalSha256 };
    },
  }]]);
  const adapterPath = new URL("../src/current-pcb-worker-startup-lifecycle-adapter.ts", import.meta.url);
  classes.set("./current-pcb-worker-startup-lifecycle-adapter.ts", await load(adapterPath, await readFile(adapterPath, "utf8"), classes));
  const lifecyclePath = new URL("../src/current-pcb-diagnostic-lifecycle.ts", import.meta.url);
  module = await fixtureModule(await load(lifecyclePath, await readFile(lifecyclePath, "utf8"), classes));
  const value = module.fixture(context, id, { createFootprintRouteStartupOpening: (): Opening => new Opening(),
    publishRecord: async (...args: Parameters<typeof publishCurrentPcbDiagnosticLifecycleRecord>): Promise<void> => {
      if (args[1] === "forward-prewrite-result.json" && failPublication) { failPublication = false; throw new Error("synthetic qualification publication failure"); }
      if (args[1] === "forward-prewrite-failure.json" && failFailurePublication) { failFailurePublication = false; throw errors.publication; }
      if (args[1] === "forward-baseline-failure.json" && !baselineFailurePublicationFailed &&
        (baselineMode === "seal-failure-publication" || baselineMode === "closed-failure-publication")) {
        baselineFailurePublicationFailed = true; throw errors.publication;
      }
      if (!baselinePublicationFailed && (args[1] === "forward-source-seal-result.json" && baselineMode === "seal-publication" ||
        args[1] === "forward-closed-baseline-result.json" && baselineMode === "closed-publication")) {
        baselinePublicationFailed = true; throw new Error("synthetic baseline publication failure");
      }
      await publishCurrentPcbDiagnosticLifecycleRecord(...args);
    } });
  baselineOwner = value.owner; baselineState = value.state;
  result = Object.freeze({ opening: module.OPEN_RESULT, construction: Object.freeze({ profile: "private.current-footprint-copy-construction.v1", pauses: 11,
    originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false,
    wrapperAssignmentRelationVerified: false, nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false }),
    workerIdentity: { projectUuid: module.OPEN_RESULT.projectUuid, branchUuid: module.OPEN_RESULT.branchUuid, windowTabId: "fixture-tab" },
    ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  state = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: result.workerIdentity, client: "1234567890abcdef", maximumTicket: 100,
    capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true, atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
  let content = "synthetic source";
  if (mode === "unicode-failure") { content = "\u0000".repeat(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes); }
  else if (mode === "source-page") { content = "\uFEFF中🧪é\r\n\u0000\\\"".repeat(6000); }
  source = freezeDeep(currentFootprintSourceReadPacketSchema.parse({ profile: "private.current-footprint-source-read.v1", request: { identity: result.workerIdentity, footprintUuid: "1234567890abcdef", client: state.client, maximumTicket: 100 },
    content, sourceSha256: sha256Text(content), sourceSamples: 2, stateSamples: 4, route: "native-cache-equivalent", sourceGetterDispatched: false,
    cacheRead: { keys: 1, bytes: 100, atoms: 1 }, cacheWrites: 0, networkRequests: 0, exactKeyedSourceVerified: true, comparison: "complete-checkpoint-records-native-order",
    checkpointByteOrderMatched: false, nativeOrderStable: true, keyedRecordsSha256: "a".repeat(64), observedOrderSha256: "b".repeat(64), canvasRecords: 1, tombstones: 0,
    cacheEffectsPossible: false, cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false }));
  const user = { uuid: "c".repeat(32), nickname: "Synthetic", username: "synthetic", avatar: "" };
  const stamp = { milliseconds: 1_700_000_000_000, iso: "2023-11-14T22:13:20.000Z", timezoneOffsetMinutes: 0 };
  const sample = (phase: "ui" | "worker"): unknown => ({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", phase,
    identity: result?.workerIdentity, workerUser: user, workerUserText: JSON.stringify(user), clock: { before: stamp, after: stamp },
    ...(phase === "ui" ? { cachedActor: { uuid: user.uuid, username: user.username, nickname: user.nickname }, startupActor: { uuid: user.uuid, username: user.username, nickname: user.nickname } } : { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }) }) } });
  const originalActorPacket = await new CurrentPcbWorkerStartupActorRunner({ observeUi: (): Promise<unknown> => Promise.resolve(sample("ui")), observeWorker: (): Promise<unknown> => Promise.resolve(sample("worker")), assertCurrent: (): Promise<void> => Promise.resolve() }, result.workerIdentity).observe();
  const body = { profile: "private.current-pcb209-worker-startup-actor.v1", sourceClosureSha256: "d".repeat(64), originalActorPacket, originalConstructorOwnerVerified: false,
    nativeSourceContextsOwned: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false, futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false };
  actor = currentPcb209WorkerStartupActorPacketSchema.parse({ ...body, packetSha256: sha256Json(body) });
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const channel = new CurrentPcbWorkerStartupChannel({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent), assertOriginalTermination: (): Promise<void> => { assert.ok(value.state.terminated); return Promise.resolve(); }, observeOriginalParentEvent: unused, exchange: unused });
  const handoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({ context: () => ({ sessionId: parent.sessionId, uniqueContextId: "parent-context" }), reprove: () => Promise.resolve(), begin: unused, finish: unused, observeParent: unused, ancillaryFrame: (): null => null, observeAncillary: unused, ancillaryObservation: (): null => null }) });
  const ledger = new CurrentFootprintCopyForwardResourceLedger(); ledger.bind("forward-writer", value.owner);
  const usage = (): ReturnType<CurrentFootprintCopyForwardResourceLedger["generationStatus"]> => ledger.generationStatus("forward-writer", value.owner);
  const advance = (normal: number, cleanup = 0): void => {
    while (usage().rendererCleanupRequests < cleanup) { ledger.consumeRequest("forward-writer", value.owner, "renderer", usage().rendererRequests + 1, true); }
    while (usage().rendererNormalRequests < normal) { ledger.consumeRequest("forward-writer", value.owner, "renderer", usage().rendererRequests + 1, false); }
  };
  consumeNormal = (count: number): void => { advance(usage().rendererNormalRequests + count); };
  advance(99);
  const status = value.owner["status"]; assert.ok(typeof status === "function");
  Object.assign(value.owner, {
    status: (): Row => {
      const current: unknown = Reflect.apply(status, value.owner, []); assert.ok(current !== null && typeof current === "object");
      return { ...current, workerStartupChannel: { ...channel.status(), nextRequestId: usage().rendererRequests + 1 },
        forwardResources: { counters: ledger.status(), generation: usage(), cleanupOnly: false,
          artifactAccountingMounted: false, journalAccountingMounted: false, nativeWriterMounted: false }, combinedAbortDispatchAttempted: false, combinedOutputCleanupOnly: false };
    },
    handoffWorkerStartup: () => Promise.resolve(handoff), observeFootprintCopyUi: () => Promise.resolve(packets["ui"]), requireFootprintCopyUi: () => Promise.resolve(), retainedFootprintCopyUi: (): null => null,
    observeFootprintCopyManagerRoute: () => Promise.resolve(packets["manager"]), requireFootprintCopyManagerRoute: () => Promise.resolve(), retainedFootprintCopyManagerRoute: (): null => null,
    observeFootprintCopyWindowsClock: () => Promise.resolve(packets["windowsClock"]), joinFootprintCopyManagerPeer: () => Promise.resolve(packets["peer"]),
    observeFootprintCopyClockRegistration: () => Promise.resolve(packets["clockRegistration"]), sampleFootprintCopyClockRegistration: () => Promise.resolve(packets["clockRegistrationFinalSample"]), retainedFootprintCopyClockRegistration: (): null => null, releaseFootprintCopyClockRegistration: () => Promise.resolve(),
    requireWorkerStartupEmptyDependency209: unused, prepareWorkerStartupPcbSession209: unused, abortFootprintCombined: unused, reserveFootprintCombinedAbort: unused, dispatchFootprintCombinedAbort: unused,
    retainedFootprintMainConstruction: (): null => null,
    observeFootprintMainConstruction: () => Promise.resolve(currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
      originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256, initialContinuationCount: 1,
      registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true, originalProtocolCallbackAndBackendRetained: true,
      originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, protocolRegistrationObserved: false,
      requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false, responderExclusivityProven: false, executionAuthorized: false })),
  });
  context.after(async () => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  await module.readyForOpening(id, value);
  const inspect = await value.coordinator.run({ action: "inspect", operationId: id }); const binding = inspect["bindingSha256"]; assert.ok(typeof binding === "string");
  await value.coordinator.run({ action: "observe-main-construction", operationId: id, expectedBindingSha256: binding });
  await value.coordinator.captureWorkerStartup(id, binding, module.STARTUP_OPEN_INPUT);
  await value.coordinator.observeWorkerStartupAssignments(id, binding); await value.coordinator.observeWorkerStartupActor(id, binding);
  await assert.rejects(value.coordinator.qualifyWorkerStartupFootprintSource(id, binding, { footprintUuid: "1234567890abcdef" }), /ORIGINAL_FORWARD_ROUTE_REQUIRED/u);
  const route = (): Promise<Row> => value.coordinator.observeWorkerStartupFootprintRoute(id, binding);
  if (mode === "route-capacity") {
    const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.bindings + CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.dependencies +
      CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiObserve + CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiReprove +
      CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.managerRoute + CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.asyncAndHandoff +
      CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.destinations + 18 + CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.cacheConstructionDelegates +
      CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.clockRegistration;
    advance(CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalClassLimit - requests + (routeHeadroom === "short" ? 1 : 0));
  } else {
    await route();
    advance(CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalClassLimit - 73 + (mode === "capacity" ? 1 : 0) -
      (baselineMode !== undefined && baselineMode !== "seal-capacity" ? 6 : 0),
      mode === "capacity" || baselineMode === "seal-capacity" ? 0 : CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.cleanupClassLimit);
  }
  return { value, id, binding, calls, errors, next: (): number => usage().rendererRequests + 1, route, routeStarted: (): boolean => routeStarted,
    normal: (): number => usage().rendererNormalRequests, packetHash: (): string => sha256Json(source),
    qualify: () => value.coordinator.qualifyWorkerStartupFootprintSource(id, binding, { footprintUuid: "1234567890abcdef" }) };
}

void test("forward route reserves its original normal class separately from unused renderer IDs", async context => {
  for (const headroom of ["exact", "short"] as const) {
    const f = await fixture(context, "route-capacity", headroom); const before = f.next(), normal = f.normal();
    assert.equal(f.routeStarted(), false);
    if (headroom === "exact") { await f.route(); assert.equal(f.routeStarted(), true); }
    else {
      await assert.rejects(f.route(), /FOOTPRINT_ROUTE_CAPACITY/u);
      assert.equal(f.routeStarted(), false); assert.equal(f.next(), before); assert.equal(f.normal(), normal);
      const intentPath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "footprint-copy-route-intent.json");
      await assert.rejects(readFile(intentPath), { code: "ENOENT" });
    }
    await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true;
    await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  }
});

void test("forward success schema refuses beyond its unchanged complete publication byte bound", async context => {
  const f = await fixture(context, "result-bound");
  await f.qualify();
  const name = "forward-prewrite-result.json", path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, name);
  const original = await readFile(path), schema = diagnosticLifecycleRecordSchemas[name];
  try {
    const observed = schema.parse(JSON.parse(original.toString("utf8")) as unknown);
    const content = "\\".repeat(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes);
    const source = currentFootprintSourceReadPacketSchema.parse({ ...observed.source, content, sourceSha256: sha256Text(content) });
    const sourcePacketSha256 = sha256Json(source);
    const maximum = schema.parse({ ...observed, createdAt: new Date(0).toISOString(), source,
      preparation: { ...observed.preparation, sourcePacketSha256 }, result: { ...observed.result, sourcePacketSha256 } });
    assert.equal(CURRENT_FOOTPRINT_FORWARD_PREWRITE_RESULT_MAX_BYTES, 4 * 1024 * 1024 + 64 * 1024 + 8192);
    const padding = CURRENT_FOOTPRINT_FORWARD_PREWRITE_RESULT_MAX_BYTES - recordBytes(maximum).length;
    assert.ok(padding > 0);
    const edge = schema.parse({ ...maximum, createdAt: `1970-01-01T00:00:00.${"0".repeat(3 + padding)}Z` });
    assert.equal(recordBytes(edge).length, CURRENT_FOOTPRINT_FORWARD_PREWRITE_RESULT_MAX_BYTES);
    const excessive = { ...edge, createdAt: edge.createdAt.replace(/Z$/u, "0Z") };
    assert.equal(recordBytes(excessive).length, CURRENT_FOOTPRINT_FORWARD_PREWRITE_RESULT_MAX_BYTES + 1);
    assert.equal(schema.safeParse(excessive).success, false);
    await assert.rejects(publishCurrentPcbDiagnosticLifecycleRecord(f.id, name, excessive), /complete evidence bound/u);
    assert.deepEqual(await readFile(path), original);
  } finally {
    await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true;
    await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  }
});

void test("maximum escaped forward failure publishes and reads at the exact finite byte boundary", async context => {
  const f = await fixture(context, "unicode-failure");
  await assert.rejects(f.qualify(), error => error instanceof Error && error.message === "\u0000\uD800".repeat(2048));
  const name = "forward-prewrite-failure.json", path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, name);
  const original = await readFile(path), schema = diagnosticLifecycleRecordSchemas[name];
  const failure = schema.parse(JSON.parse(original.toString("utf8")) as unknown);
  assert.ok(failure.source !== null && failure.preparation !== null);
  assert.equal(failure.error.length, 4096);
  assert.equal(Buffer.byteLength(JSON.stringify(failure.error)), 4096 * 6 + 2);
  assert.equal(Buffer.byteLength(failure.source.content), CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes);
  // Preserve the original intent/route request when publishing boundary data.
  const source = currentFootprintSourceReadPacketSchema.parse({ ...failure.source,
    cacheRead: { keys: 64, bytes: 8_388_608, atoms: 4096 }, canvasRecords: 4096, tombstones: 4096 });
  const maximum = schema.parse({ ...failure, createdAt: new Date(0).toISOString(), failedStage: "source-assets", source,
    preparation: { ...failure.preparation, sourcePacketSha256: sha256Json(source) } });
  // Independently maximize schema metadata without claiming original ownership.
  // These foreign request headers are never published into the managed chain.
  const maximumMetadataSource = currentFootprintSourceReadPacketSchema.parse({ ...source,
    request: { identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "w".repeat(128) },
      footprintUuid: "c".repeat(32), client: "d".repeat(16), maximumTicket: Number.MAX_SAFE_INTEGER - 3 } });
  const maximumMetadata = schema.parse({ ...maximum, source: maximumMetadataSource,
    preparation: { ...maximum.preparation, sourcePacketSha256: sha256Json(maximumMetadataSource) } });
  const payloadBytes = (CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes + 4096) * 6;
  const metadataBytes = recordBytes(maximumMetadata).length - payloadBytes;
  assert.equal(metadataBytes, 2574);
  assert.ok(recordBytes(maximum).length - payloadBytes <= metadataBytes);
  assert.equal(CURRENT_FOOTPRINT_FORWARD_PREWRITE_FAILURE_MAX_BYTES, payloadBytes + 8192);
  assert.ok(original.length > 4 * 1024 * 1024 + 64 * 1024 + 8192);
  // ISO precision has no schema length maximum. Fill the finite metadata reserve.
  // Neither publisher nor reader may accept one byte beyond it.
  const padding = CURRENT_FOOTPRINT_FORWARD_PREWRITE_FAILURE_MAX_BYTES - recordBytes(maximum).length;
  const edge = schema.parse({ ...maximum, createdAt: `1970-01-01T00:00:00.${"0".repeat(3 + padding)}Z` });
  const bytes = recordBytes(edge); assert.equal(bytes.length, CURRENT_FOOTPRINT_FORWARD_PREWRITE_FAILURE_MAX_BYTES);
  await rename(path, join(controlDataDirectory(), `${f.id}-original-failure.json`));
  try {
    await publishCurrentPcbDiagnosticLifecycleRecord(f.id, name, edge);
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.deepEqual(operations.find(value => value.operationId === f.id)?.records[name], edge);
    const excessive = schema.parse({ ...edge, createdAt: edge.createdAt.replace(/Z$/u, "0Z") });
    assert.equal(recordBytes(excessive).length, bytes.length + 1);
    await assert.rejects(publishCurrentPcbDiagnosticLifecycleRecord(f.id, name, excessive), /PUBLICATION_BOUND/u);
    assert.deepEqual(await readFile(path), bytes);
    await writeFile(path, recordBytes(excessive));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RECORD_AUTHORITY/u);
  } finally {
    // Restore this synthetic owner's original publication before its cleanup;
    // Schema boundary probes cannot replace its private pending-record identity.
    await writeFile(path, original);
  }
  await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
  await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
  f.value.state.terminated = true;
  await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
  await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
  assert.equal(f.value.coordinator.hasActiveReservation(), false);
});

void test("managed forward failure reader joins present source and preparation while preserving null stages", async context => {
  const f = await fixture(context, "failure-chain");
  await assert.rejects(f.qualify(), /SOURCE_ASSETS_UNSUPPORTED/u);
  const name = "forward-prewrite-failure.json", path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, name);
  const original = await readFile(path), schema = diagnosticLifecycleRecordSchemas[name];
  const failure = schema.parse(JSON.parse(original.toString("utf8")) as unknown);
  assert.ok(failure.source !== null && failure.preparation !== null);
  const { preparation, source } = failure;
  try {
    for (const valid of [failure, schema.parse({ ...failure, failedStage: "preparation", preparation: null }),
      schema.parse({ ...failure, failedStage: "source", source: null, preparation: null })]) {
      await writeFile(path, recordBytes(valid));
      const operations = await readCurrentPcbDiagnosticLifecycles();
      assert.deepEqual(operations.find(value => value.operationId === f.id)?.records[name], valid);
    }
    for (const request of [
      { ...source.request, footprintUuid: "fedcba0987654321" },
      { ...source.request, identity: { ...source.request.identity, projectUuid: sha256Text("foreign-project") } },
      { ...source.request, identity: { ...source.request.identity, branchUuid: sha256Text("foreign-branch").slice(0, 32) } },
      { ...source.request, identity: { ...source.request.identity, windowTabId: "foreign-window-tab" } },
      { ...source.request, client: "fedcba0987654321" },
      { ...source.request, maximumTicket: source.request.maximumTicket + 1 },
    ]) {
      const foreign = currentFootprintSourceReadPacketSchema.parse({ ...source, request });
      // Keep the packet digest coherent so only its original request join fails.
      const changed = schema.parse({ ...failure, source: foreign,
        preparation: { ...preparation, sourcePacketSha256: sha256Json(foreign) } });
      await writeFile(path, recordBytes(changed));
      await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /FORWARD_PREWRITE_FAILURE_CHAIN/u);
    }
    for (const key of ["sourcePacketSha256", "sourcePlanSha256", "beforeCheckpointSha256", "beforeSqlSha256"] as const) {
      const digest = sha256Text(`foreign-${key}`); assert.notEqual(digest, preparation[key]);
      const changed = schema.parse({ ...failure, preparation: { ...preparation, [key]: digest } });
      await writeFile(path, recordBytes(changed));
      await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /FORWARD_PREWRITE_FAILURE_CHAIN/u);
    }
    await writeFile(path, recordBytes(schema.parse({ ...failure, source: null })));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /FORWARD_PREWRITE_FAILURE_CHAIN/u);
  } finally {
    await writeFile(path, original);
    await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true;
    await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  }
});
void test("forward qualification retains original and failure-publication errors for exact record settlement", async context => {
  const f = await fixture(context, "failure-publication");
  const failurePath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-failure.json");
  const resultPath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-result.json");
  let settled = false;
  try {
    await assert.rejects(f.qualify(), (error: unknown): boolean => {
      assert.ok(error instanceof AggregateError); assert.equal(error.message, "FORWARD_PREWRITE_FAILURE_PUBLICATION");
      assert.equal(error.cause, f.errors.qualification);
      assert.equal(error.errors[0], f.errors.qualification); assert.equal(error.errors[1], f.errors.publication);
      return true;
    });
    await assert.rejects(readFile(failurePath), { code: "ENOENT" });
    await assert.rejects(readFile(resultPath), { code: "ENOENT" });
    const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspect["forwardQualificationFailure"], null); assert.equal(inspect["forwardQualificationResult"], null);
    await assert.rejects(f.qualify(), /FORWARD_QUALIFICATION_CONSUMED/u);
    await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] }); settled = true;
    const failure = diagnosticLifecycleRecordSchemas["forward-prewrite-failure.json"].parse(JSON.parse(await readFile(failurePath, "utf8")) as unknown);
    assert.equal(failure.error, f.errors.qualification.message); assert.equal(failure.failedStage, "source");
    assert.equal(failure.source, null); assert.equal(failure.preparation, null);
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.deepEqual(operations.find(value => value.operationId === f.id)?.records["forward-prewrite-failure.json"], failure);
    await assert.rejects(readFile(resultPath), { code: "ENOENT" });
    assert.equal(f.calls.filter(call => call === "source-after-intent").length, 1);
  } finally {
    if (!settled) {
      const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
    }
    await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true;
    await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  }
});

for (const mode of ["success", "capacity", "source-failure", "checkpoint-failure", "publication", "method-drift", "unsupported"] as const) {
  void test(`born-forward source/route qualification preserves original inputs and cleanup: ${mode}`, async context => {
    const f = await fixture(context, mode);
    const before = f.next();
    if (mode === "success") {
      const qualified = await f.qualify(); assert.equal(qualified["executionReady"], false); assert.equal(qualified["qualificationPublished"], true);
      assert.equal(f.calls.filter(call => call === "source-after-intent").length, 1);
    } else { await assert.rejects(f.qualify(), /CAPACITY|source failure|source plan refusal|publication failure|SOURCE_METHODS|SOURCE_ASSETS_UNSUPPORTED/u); }
    const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    assert.equal(inspect["forwardQualificationAttemptConsumed"], true);
    await assert.rejects(f.qualify(), /FORWARD_QUALIFICATION_CONSUMED/u);
    if (mode === "capacity" || mode === "checkpoint-failure") { assert.deepEqual(f.calls, []); assert.equal(f.next(), before); }
    if (mode === "capacity") {
      assert.ok(f.next() + 73 - 1 <= CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalIdCeiling);
      assert.equal(f.normal() + 73, CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalClassLimit + 1);
      const intentPath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-intent.json");
      await assert.rejects(readFile(intentPath), { code: "ENOENT" });
    }
    if (mode === "method-drift") { assert.deepEqual(f.calls, ["source-after-intent"]); }
    if (mode === "publication") {
      assert.equal(inspect["forwardQualificationResult"], null);
      const failurePath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-failure.json");
      await assert.rejects(readFile(failurePath), { code: "ENOENT" });
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
      const settled = await f.value.coordinator.run({ action: "inspect", operationId: f.id }); assert.notEqual(settled["forwardQualificationResult"], null);
      await assert.rejects(readFile(failurePath), { code: "ENOENT" });
    }
    await f.value.coordinator.run({ action: "observe-window", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "normal-close", operationId: f.id, expectedBindingSha256: f.binding, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true;
    await f.value.coordinator.run({ action: "observe-termination", operationId: f.id, expectedBindingSha256: f.binding });
    await f.value.coordinator.run({ action: "release-closed", operationId: f.id, expectedBindingSha256: f.binding });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  });
}

for (const mode of ["success", "seal-capacity", "seal-failure", "seal-publication", "closed-failure", "closed-publication"] as const) {
  void test(`forward source sealing and closed baseline retain once-only original cleanup: ${mode}`, async context => {
    const f = await fixture(context, "success", "short", mode);
    const bound = { operationId: f.id, expectedBindingSha256: f.binding };
    const closed = { action: "prove-closed-baseline", ...bound }, seal = { action: "seal-footprint-source", ...bound };
    await assert.rejects(f.value.coordinator.run(seal), /ORIGINAL_FORWARD_BASELINE_REQUIRED/u);
    await f.qualify();
    if (mode === "seal-capacity") {
      assert.equal(f.normal(), CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalClassLimit);
      assert.ok(f.next() + 6 - 1 <= CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.writer.renderer.normalIdCeiling);
    }
    await assert.rejects(f.value.coordinator.run({ ...seal, expectedBindingSha256: "f".repeat(64) }), /ORIGINAL_FORWARD_BASELINE_REQUIRED/u);
    if (mode === "seal-capacity" || mode === "seal-failure" || mode === "seal-publication") {
      await assert.rejects(f.value.coordinator.run(seal), /SOURCE_SEAL_CAPACITY|source seal failure|publication failure/u);
    } else {
      const sealed = await f.value.coordinator.run(seal); assert.equal(sealed["executionReady"], false);
      assert.equal(sealed["baselineStagePublished"], true);
    }
    await assert.rejects(f.value.coordinator.run(seal), /SOURCE_SEAL_CONSUMED/u);
    if (mode === "seal-publication") {
      const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
      await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
    }
    await assert.rejects(f.value.coordinator.run(closed), /CLOSED_BASELINE_UNAVAILABLE/u);
    await f.value.coordinator.run({ action: "normal-close", ...bound, hwnd: "12345", confirmNormalClose: true });
    f.value.state.terminated = true; await f.value.coordinator.run({ action: "observe-termination", ...bound });
    if (mode === "seal-capacity" || mode === "seal-failure") {
      await assert.rejects(f.value.coordinator.run(closed), /CLOSED_BASELINE_UNAVAILABLE/u);
      assert.equal(f.calls.includes("closed-after-intent"), false);
    } else {
      if (mode === "closed-failure" || mode === "closed-publication") { await assert.rejects(f.value.coordinator.run(closed), /closed SQL difference|publication failure/u); }
      else { const result = await f.value.coordinator.run(closed); assert.equal(result["executionReady"], false); }
      await assert.rejects(f.value.coordinator.run(closed), /CLOSED_BASELINE_UNAVAILABLE/u);
      if (mode === "closed-publication") {
        const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
        await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
      }
    }
    const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    const original = inspect["forwardQualificationResult"]; assert.ok(original !== null && typeof original === "object");
    assert.equal(Reflect.get(original, "sourceSealedForClosedSnapshot"), false);
    if (mode === "seal-capacity") { assert.equal(f.calls.includes("seal-after-intent"), false); }
    assert.ok(f.calls.filter(call => call === "seal-after-intent").length <= 1);
    assert.ok(f.calls.filter(call => call === "closed-after-intent").length <= 1);
    await f.value.coordinator.run({ action: "release-closed", ...bound });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
  });
}

for (const stage of ["seal", "closed"] as const) {
  void test(`forward baseline retains original ${stage} error across failure-publication failure and settlement`, async context => {
    const f = await fixture(context, "success", "short", `${stage}-failure-publication`);
    const bound = { operationId: f.id, expectedBindingSha256: f.binding };
    const seal = { action: "seal-footprint-source", ...bound };
    const close = async (): Promise<void> => {
      await f.value.coordinator.run({ action: "normal-close", ...bound, hwnd: "12345", confirmNormalClose: true });
      f.value.state.terminated = true;
      await f.value.coordinator.run({ action: "observe-termination", ...bound });
    };
    await f.qualify();
    if (stage === "closed") { await f.value.coordinator.run(seal); await close(); }
    const request = stage === "seal" ? seal : { action: "prove-closed-baseline", ...bound };
    await assert.rejects(f.value.coordinator.run(request), (error: unknown): boolean => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.message, "FORWARD_BASELINE_FAILURE_PUBLICATION");
      assert.equal(error.cause, f.errors[stage]);
      assert.deepEqual(error.errors, [f.errors[stage], f.errors.publication]);
      return true;
    });
    const failurePath = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-baseline-failure.json");
    await assert.rejects(readFile(failurePath), { code: "ENOENT" });
    const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
    await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
    const failure = diagnosticLifecycleRecordSchemas["forward-baseline-failure.json"].parse(JSON.parse(await readFile(failurePath, "utf8")) as unknown);
    assert.equal(failure.error, f.errors[stage].message);
    assert.equal(failure.failedStage, stage === "seal" ? "source-seal" : "closed-baseline");
    await assert.rejects(f.value.coordinator.run(request), /SOURCE_SEAL_CONSUMED|CLOSED_BASELINE_UNAVAILABLE/u);
    if (stage === "seal") { await close(); }
    await f.value.coordinator.run({ action: "release-closed", ...bound });
    assert.equal(f.value.coordinator.hasActiveReservation(), false);
    assert.equal(f.calls.filter(call => call === `${stage}-after-intent`).length, 1);
  });
}

void test("published source packet pages require this original private packet and make no native calls", async context => {
  const f = await fixture(context, "source-page");
  const bound = { operationId: f.id, expectedBindingSha256: f.binding };
  const read = { action: "read-qualified-source", ...bound, expectedSourcePacketSha256: "a".repeat(64), offsetBytes: 0, lengthBytes: 65_536 };
  await assert.rejects(f.value.coordinator.run(read), /ORIGINAL_PUBLISHED_FORWARD_PACKET_REQUIRED/u);
  const qualified = await f.qualify(); const result = qualified["result"]; assert.ok(result !== null && typeof result === "object");
  const expectedSourcePacketSha256: unknown = Reflect.get(result, "sourcePacketSha256"); assert.ok(typeof expectedSourcePacketSha256 === "string");
  const request = { ...read, expectedSourcePacketSha256 };
  const path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-result.json");
  const originalBytes = await readFile(path), record = diagnosticLifecycleRecordSchemas["forward-prewrite-result.json"].parse(JSON.parse(originalBytes.toString("utf8")) as unknown);
  const nativeCalls = [...f.calls], nativeNext = f.next(); const pages: Buffer[] = [];
  let offsetBytes = 0;
  for (;;) {
    const page = await f.value.coordinator.run({ ...request, offsetBytes });
    assert.equal(page["format"], "canonical-json-utf8"); assert.equal(page["encoding"], "base64"); assert.equal(page["pointInTime"], true);
    for (const key of ["currentStateVerified", "savedStateVerified", "executionReady", "executionAuthorized", "saveAuthorized"]) { assert.equal(page[key], false); }
    assert.equal(page["nativeCalls"], 0); assert.equal(page["sourcePacketSha256"], expectedSourcePacketSha256);
    const base64 = page["pageBase64"]; assert.ok(typeof base64 === "string"); pages.push(Buffer.from(base64, "base64"));
    const next = page["nextOffsetBytes"]; assert.ok(typeof next === "number"); offsetBytes = next;
    if (page["endOfPacket"] === true) { break; }
  }
  const complete = Buffer.concat(pages), decoded = currentFootprintSourceReadPacketSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(complete)) as unknown);
  assert.deepEqual(decoded, record.source); assert.equal(sha256Json(decoded), expectedSourcePacketSha256);
  assert.equal(complete.toString("utf8"), canonicalJson(record.source)); assert.deepEqual(f.calls, nativeCalls); assert.equal(f.next(), nativeNext);
  const copiedOwner = new CurrentFootprintForwardPrewriteLifecycle(f.value.options);
  await assert.rejects(copiedOwner.run(request), /ORIGINAL_PUBLISHED_FORWARD_PACKET_REQUIRED/u);
  await assert.rejects(f.value.coordinator.run({ ...request, sourcePacket: record.source }));
  await assert.rejects(f.value.coordinator.run({ ...request, expectedBindingSha256: "f".repeat(64) }), /ORIGINAL_PUBLISHED_FORWARD_PACKET_REQUIRED/u);
  const changed = currentFootprintSourceReadPacketSchema.parse({ ...record.source, content: "different", sourceSha256: sha256Text("different") });
  const changedHash = sha256Json(changed);
  const drifted = { ...record, source: changed, preparation: { ...record.preparation, sourcePacketSha256: changedHash },
    result: { ...record.result, sourcePacketSha256: changedHash } };
  try {
    await writeFile(path, `${JSON.stringify(drifted)}\n`);
    const driftedOperations = await readCurrentPcbDiagnosticLifecycles();
    assert.ok(driftedOperations.find(value => value.operationId === f.id)?.records["forward-prewrite-result.json"]);
    await assert.rejects(f.value.coordinator.run(request), /ORIGINAL_PUBLISHED_FORWARD_PACKET_REQUIRED/u);
  } finally { await writeFile(path, originalBytes); }
  await f.value.coordinator.run({ action: "normal-close", ...bound, hwnd: "12345", confirmNormalClose: true });
  f.value.state.terminated = true; await f.value.coordinator.run({ action: "observe-termination", ...bound });
  await f.value.coordinator.run({ action: "release-closed", ...bound });
  const afterCleanup = await f.value.coordinator.run(request); assert.equal(afterCleanup["sourcePacketSha256"], expectedSourcePacketSha256);
  assert.equal(f.value.coordinator.hasActiveReservation(), false);
});
void test("unpublished qualification source cannot be paged until exact record settlement", async context => {
  const f = await fixture(context, "publication");
  const bound = { operationId: f.id, expectedBindingSha256: f.binding };
  await assert.rejects(f.qualify(), /publication failure/u);
  const path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.id, "forward-prewrite-intent.json");
  const intentBytes = await readFile(path); assert.ok(intentBytes.length > 0);
  const request = { action: "read-qualified-source", ...bound, expectedSourcePacketSha256: f.packetHash(), offsetBytes: 0, lengthBytes: 1024 };
  await assert.rejects(f.value.coordinator.run(request), /ORIGINAL_PUBLISHED_FORWARD_PACKET_REQUIRED/u);
  const inspect = await f.value.coordinator.run({ action: "inspect", operationId: f.id });
  await f.value.coordinator.run({ action: "settle-records", operationId: f.id, expectedIntentSha256: inspect["intentSha256"] });
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const saved = operations.find(value => value.operationId === f.id)?.records["forward-prewrite-result.json"]; assert.ok(saved);
  const page = await f.value.coordinator.run({ ...request, expectedSourcePacketSha256: saved.result.sourcePacketSha256 });
  assert.equal(page["nativeCalls"], 0); assert.equal(page["sourceSha256"], saved.source.sourceSha256);
});
