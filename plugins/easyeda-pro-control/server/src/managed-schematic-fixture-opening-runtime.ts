/* oxlint-disable import/max-dependencies -- Dedicated original custody joins issued SCH data, narrow checkpoints, fixed native programs, tracked HMAC/process authority and no-replay cleanup. */
import { createOperation, loadOperation, operationPath } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, assertUpstreamReplySettled, buildPlanHash, canonicalJson, extractToolPayload, sha256Json, sha256Text } from "./core.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal, UpstreamClient } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { GeneratedFixtureJournalPublication } from "./generated-fixture-journal-publication.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "./generated-fixture-journal-publication.ts";
import { verifyCurrentSchematicPageOpeningImplementation } from "./current-schematic-page-read-profile.ts";
import { consumeManagedSchematicFixtureOpeningSource } from "./managed-schematic-fixture-opening-source.ts";
import type { ManagedSchematicFixtureOpeningSource } from "./managed-schematic-fixture-opening-source.ts";
import { prepareGeneratedSchematicFixtureOpenCheckpoint, verifyGeneratedSchematicFixtureOpenCheckpoint, verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { buildGeneratedSchematicNavigationProgram, buildGeneratedSchematicReadersProgram, validateGeneratedSchematicNavigation, validateGeneratedSchematicReaders } from "./managed-schematic-fixture-opening-program.ts";
import { GENERATED_SCHEMATIC_OPEN_PHASE, GENERATED_SCHEMATIC_OPEN_PROFILE, generatedSchematicOpeningIdSchema, generatedSchematicOpeningRequestSchema } from "./managed-schematic-fixture-opening.ts";
import type { GeneratedSchematicOpeningRequest } from "./managed-schematic-fixture-opening.ts";
import type { OrdinaryTrackedOpenCleanup } from "./ordinary-tracked-open-cleanup.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { validateSdkPublicReadersFingerprint } from "./sdk-public-readers-runtime.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type Engine = SdkLocalEngine & Pick<EasyedaControlEngine, "dispatchWithOrphanTracking" | "originalTrackedDispatchStatus"> & {
  readonly upstream: SdkLocalEngine["upstream"] & Pick<UpstreamClient, "bridgeSessionLifecycle">;
};
export interface GeneratedSchematicOpeningOptions {
  readonly operationId: string; readonly source: ManagedSchematicFixtureOpeningSource;
  readonly engine: Engine; readonly runtime: Pick<WindowsControlRuntime, "status">; readonly assetsRoot: string;
  /** Exact new ordinary runtime/index/coordinator identities. Root's allocation
   * slot must retain this token before construction and clear it once only. */
  readonly assertOriginalOwner: () => void;
  readonly cleanup: Pick<OrdinaryTrackedOpenCleanup, "retain" | "inspect" | "run">;
}
/** Offline test seams only. Production construction uses no override object. */
export interface GeneratedSchematicOpeningDependencies extends GeneratedFixtureJournalPublicationDependencies {
  readonly prepareCheckpoint?: typeof prepareGeneratedSchematicFixtureOpenCheckpoint;
  readonly verifyCheckpoint?: typeof verifyGeneratedSchematicFixtureOpenCheckpoint;
  readonly verifyHistoricalCheckpoint?: typeof verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint;
  readonly verifySources?: typeof verifyCurrentSchematicPageOpeningImplementation;
  readonly assertFingerprint?: typeof validateSdkPublicReadersFingerprint;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`GENERATED_SCHEMATIC_${code}`); } }
function decode(raw: unknown): unknown {
  assertUpstreamReplySettled(raw); const envelope = extractToolPayload(raw); need(Buffer.byteLength(JSON.stringify(envelope)) <= 131_072, "NATIVE_REPLY_BOUND");
  return decodeExactReadEnvelope(envelope);
}
/** One freshly born coordinator on a new original ordinary application.
 * No historical JSON, PCB token, target argument or former runtime can enter.
 * Navigation is one tracked Promise; later reads are the existing synchronous
 * native getter contract and do not replace its original cleanup source.
 */
export class GeneratedSchematicOpeningCoordinator {
  readonly #options: GeneratedSchematicOpeningOptions;
  readonly #dependencies: GeneratedSchematicOpeningDependencies;
  readonly #source: ReturnType<typeof consumeManagedSchematicFixtureOpeningSource>;
  readonly #launchText: string;
  readonly #methods: readonly unknown[];
  #reserved = true; #busy = false; #openAttempted = false; #readerAttempted = false; #cleanupStarted = false;
  #journal: TrackedDispatchOperationJournal | undefined;
  #publication: GeneratedFixtureJournalPublication | undefined;
  #prepared: GeneratedSchematicFixtureOpenCheckpoint | undefined;
  #fingerprint: Record<string, unknown> | undefined;
  #navigation: ReturnType<typeof validateGeneratedSchematicNavigation> | undefined;
  #readers: Readonly<Record<string, unknown>> | undefined;
  #phase = "allocated"; #lastError: string | null = null;
  public constructor(options: GeneratedSchematicOpeningOptions, dependencies: GeneratedSchematicOpeningDependencies = {}) {
    generatedSchematicOpeningIdSchema.parse(options.operationId); options.assertOriginalOwner();
    const status = options.runtime.status(); need(status.state === "owned" && status.launch !== null, "NEW_ORIGINAL_RUNTIME_REQUIRED");
    this.#options = Object.freeze({ ...options }); this.#dependencies = Object.freeze({ ...dependencies });
    this.#launchText = canonicalJson(status.launch); this.#methods = this.#methodIdentities();
    this.#source = consumeManagedSchematicFixtureOpeningSource(options.source, options.runtime); this.#current();
  }
  #methodIdentities(): readonly unknown[] {
    const { engine, runtime, cleanup } = this.#options;
    return [runtime.status, engine.status, engine.assertBridgeDispatchAllowed, engine.dispatchWithOrphanTracking, engine.originalTrackedDispatchStatus,
      engine.upstream, engine.upstream.callTool, engine.upstream.bridgeSessionLifecycle, cleanup, cleanup.retain, cleanup.inspect, cleanup.run];
  }
  #current(): void {
    this.#options.assertOriginalOwner(); const status = this.#options.runtime.status();
    need(status.state === "owned" && canonicalJson(status.launch) === this.#launchText && this.#methodIdentities().every((method, index) => method === this.#methods[index]), "ORIGINAL_OWNER_CHANGED");
  }
  async #checked<T>(work: () => Promise<T>): Promise<T> { this.#current(); try { return await work(); } finally { this.#current(); } }
  #assertOriginalSession(): void {
    const original = this.#journal?.bridgeSessionBeforeOrphan;
    if (original === undefined) { return; }
    const upstream = this.#options.engine.upstream; const observe = upstream.bridgeSessionLifecycle;
    need(typeof observe === "function", "ORIGINAL_SESSION_OBSERVER_REQUIRED"); const current = observe.call(upstream);
    need(current !== null && typeof current === "object" && "schema" in current && current.schema === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
      "gatewayInstanceId" in current && "activeSession" in current && current.activeSession !== null && typeof current.activeSession === "object" &&
      canonicalJson({ ...current.activeSession, gatewayInstanceId: current.gatewayInstanceId }) === canonicalJson(original), "ORIGINAL_HMAC_SESSION_CHANGED");
  }
  #change(changes: Readonly<Record<string, unknown>>, record?: { phase: string; value: unknown }): Promise<void> {
    need(this.#publication !== undefined, "ORIGINAL_JOURNAL_REQUIRED"); return this.#publication.change(changes, record);
  }
  #status(): ReturnType<Engine["originalTrackedDispatchStatus"]> {
    if (this.#journal === undefined) { return undefined; } const status = this.#options.engine.originalTrackedDispatchStatus(this.#journal);
    need(status === undefined || status.phase === GENERATED_SCHEMATIC_OPEN_PHASE, "ORIGINAL_DISPATCH_PHASE_CHANGED"); return status;
  }
  public hasActiveReservation(): boolean { return this.#reserved || this.#busy; }
  public hasPendingWork(): boolean { return this.hasActiveReservation(); }
  public inspect(operationId: string): Record<string, unknown> {
    need(generatedSchematicOpeningIdSchema.parse(operationId) === this.#options.operationId, "ORIGINAL_OPERATION_REQUIRED");
    return { schema: "easyeda-pro-control.generated-schematic-owner.v1", operationId, phase: this.#phase,
      ownerReservation: this.#reserved ? "reserved" : "released", operationInFlight: this.#busy, publicationPending: this.#publication?.pending() ?? false,
      originalDataTokenConsumed: true, originalImportRuntimeAdopted: false, journal: this.#journal === undefined ? null : structuredClone(this.#journal),
      navigation: this.#navigation ?? null, readers: this.#readers ?? null, readerBatchConsumed: this.#readerAttempted, lastError: this.#lastError,
      cleanup: this.#journal === undefined ? { cleanupAvailable: false } : this.#options.cleanup.inspect(operationId),
      callerTargetAccepted: false, nativeOwnerRecreated: false, navigationReplayAllowed: false, completeSourceVerified: false, connectivityVerified: false,
      persistentRegistrationVerified: false, persistenceVerified: false, executionAuthorized: false, explicitSaveDispatched: false };
  }
  public async execute(input: unknown, expectedFingerprint?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const request = generatedSchematicOpeningRequestSchema.parse(input); need(request.operationId === this.#options.operationId, "ORIGINAL_OPERATION_REQUIRED");
    if (request.action === "inspect") { return this.inspect(request.operationId); }
    this.#current(); need(this.#reserved && !this.#busy, "OWNER_BUSY_OR_RELEASED"); this.#busy = true;
    try { return await this.#run(request, expectedFingerprint); } catch (error) {
      if (this.#phase === "reading") { this.#phase = "readers-refused-or-ambiguous"; }
      if (this.#phase === "preparing") { this.#phase = "preparation-refused"; }
      this.#lastError = error instanceof Error ? error.message.slice(0, 1024) : "Original generated schematic stage refused."; throw error;
    }
    finally { this.#busy = false; }
  }
  async #run(request: GeneratedSchematicOpeningRequest, expectedFingerprint?: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (request.action === "settle-records") { need(this.#publication !== undefined, "NO_PENDING_PUBLICATION"); await this.#publication.settle(); return this.inspect(request.operationId); }
    need(this.#publication?.pending() !== true, "SETTLE_ORIGINAL_RECORDS_FIRST");
    if (request.action === "release-owner") {
      const status = this.#status(); const journal = this.#journal;
      need(status?.settled !== false && journal?.orphanedCallPossible !== true &&
        (status?.callToolEntered !== true || this.#options.cleanup.inspect(request.operationId)["cleanupComplete"] === true), "ORIGINAL_CLEANUP_REQUIRED");
      if (journal !== undefined && status?.callToolEntered !== true) { await this.#change({ state: "completed", hardStop: false, mutationMayHaveOccurred: false, mutationState: "generated-navigation-not-dispatched" }); }
      this.#reserved = false; this.#phase = "released"; return this.inspect(request.operationId);
    }
    if (request.action === "request-cleanup-close" || request.action === "observe-cleanup-termination" || request.action === "finish-cleanup" || request.action === "settle-cleanup-records") {
      this.#cleanupStarted = true; return this.#checked(() => this.#options.cleanup.run(request));
    }
    if (request.action === "open-generated-schematic") {
      need(!this.#openAttempted && !this.#cleanupStarted, "OPENING_CONSUMED"); this.#openAttempted = true; return this.#open(expectedFingerprint);
    }
    need(request.action === "observe-text-wire-bus" && !this.#readerAttempted && !this.#cleanupStarted && this.#navigation?.page?.opened === true && this.#navigation.originalContextIntact &&
      this.#journal?.orphanedCallPossible === false && this.#status()?.settled === true, "READERS_UNAVAILABLE");
    this.#readerAttempted = true; return this.#read(expectedFingerprint);
  }
  async #admit(expectedInput: Record<string, unknown> | undefined): Promise<Record<string, unknown>> {
    this.#assertOriginalSession();
    const expected = structuredClone(expectedInput); need(expected !== undefined, "EXPECTED_FINGERPRINT_REQUIRED");
    const assertFingerprint = this.#dependencies.assertFingerprint ?? validateSdkPublicReadersFingerprint;
    assertFingerprint(expected); await this.#checked(() => this.#options.engine.assertBridgeDispatchAllowed()); this.#assertOriginalSession();
    const status = await this.#checked(() => this.#options.engine.status()); this.#assertOriginalSession(); const actual = structuredClone(status.stableFingerprint);
    assertFingerprint(actual); assertSubset(actual, expected, "Generated schematic expected runtime");
    const installed = actual["installedBundles"];
    need(installed !== null && typeof installed === "object" && "assetsRoot" in installed && installed.assetsRoot === this.#options.assetsRoot, "INSTALLED_ASSET_ROOT_CHANGED");
    need(this.#fingerprint === undefined || canonicalJson(actual) === canonicalJson(this.#fingerprint), "FINGERPRINT_CHANGED");
    await this.#checked(() => (this.#dependencies.verifySources ?? verifyCurrentSchematicPageOpeningImplementation)(this.#options.assetsRoot)); this.#assertOriginalSession(); return actual;
  }
  async #open(expected?: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.#phase = "preparing"; this.#fingerprint = await this.#admit(expected);
    const prepared = await this.#checked(() => (this.#dependencies.prepareCheckpoint ?? prepareGeneratedSchematicFixtureOpenCheckpoint)(this.#source)); this.#prepared = prepared;
    const code = buildGeneratedSchematicNavigationProgram(this.#source.qualification), plan = { profile: GENERATED_SCHEMATIC_OPEN_PROFILE,
      purpose: "fresh-generated-schematic-opening", target: this.#source.qualification.target, originalQualificationSha256: sha256Json(this.#source.qualification),
      originalFreshLaunchSha256: sha256Text(this.#launchText), checkpoint: prepared.preparationCheckpoint, expectedFingerprintSha256: sha256Json(this.#fingerprint),
      codeSha256: sha256Text(code), callerTargetAccepted: false, acceptRecentPathRegistration: true, acceptNormalOpenEffects: true, explicitSaveDispatched: false, replayAllowed: false };
    const time = new Date().toISOString(); const journal: TrackedDispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId: this.#options.operationId,
      journalPath: operationPath(this.#options.operationId), plan, planHash: buildPlanHash(plan), state: "prepared", mutationState: "generated-navigation-intent",
      mutationMayHaveOccurred: true, saved: false, reopened: false, hardStop: true, orphanedCallPossible: false, createdAt: time, updatedAt: time, sequence: 0, artifacts: [],
      nextSafeAction: "Await this original generated SCH navigation. Never repeat registration/project/page opening; retain original ordinary cleanup." };
    this.#journal = journal; this.#publication = new GeneratedFixtureJournalPublication(journal, (): void => { this.#current(); }, this.#dependencies);
    await this.#checked(() => createOperation(journal)); this.#options.cleanup.retain(journal); this.#phase = "dispatching";
    const revalidate = async (): Promise<void> => { this.#current(); const stored = await this.#checked(() => loadOperation(journal.operationId)); need(canonicalJson(stored) === canonicalJson(journal), "ORIGINAL_JOURNAL_CHANGED"); };
    try {
      await this.#checked(() => this.#options.engine.dispatchWithOrphanTracking(journal, GENERATED_SCHEMATIC_OPEN_PHASE, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000,
        async (): Promise<void> => { await revalidate(); await this.#checked(() => (this.#dependencies.verifyCheckpoint ?? verifyGeneratedSchematicFixtureOpenCheckpoint)(prepared));
          await this.#checked(() => (this.#dependencies.verifySources ?? verifyCurrentSchematicPageOpeningImplementation)(this.#options.assetsRoot)); await revalidate(); },
        async (raw): Promise<void> => { this.#current(); need(Buffer.byteLength(JSON.stringify(raw)) <= 131_072, "ORIGINAL_NAVIGATION_REPLY_BOUND");
          await this.#change({}, { phase: "original-navigation-reply", value: raw });
          this.#navigation = validateGeneratedSchematicNavigation(decode(raw), this.#source.qualification);
          await this.#change({ state: "generated-schematic-navigation-unverified", hardStop: true, mutationState: "generated-navigation-returned" }, { phase: "native-navigation", value: this.#navigation }); }, revalidate));
      need(this.#navigation !== undefined, "NATIVE_NAVIGATION_RESULT_MISSING"); this.#phase = this.#navigation.outcome;
      await this.#change({ nextSafeAction: this.#navigation.page?.opened === true ? "Optionally observe the generated Text/Wire/Bus once; retain original normal cleanup. Opening readiness is separate and navigation cannot replay." : "Preserve partial generated opening effects and use original cleanup; never repeat navigation." });
      return this.inspect(journal.operationId);
    } catch (error) { this.#phase = "navigation-refused-or-ambiguous";
      if (this.#status()?.callToolEntered !== true && !journal.orphanedCallPossible && !this.#publication.pending()) { await this.#change({ state: "completed", hardStop: false, mutationMayHaveOccurred: false, mutationState: "generated-navigation-not-dispatched" }); }
      throw error;
    }
  }
  async #read(expected?: Record<string, unknown>): Promise<Record<string, unknown>> {
    need(this.#prepared !== undefined && this.#journal !== undefined, "ORIGINAL_PREPARATION_REQUIRED"); const prepared = this.#prepared;
    this.#phase = "reading"; await this.#change({}, { phase: "reader-intent", value: { methods: ["Text", "Wire", "Bus"], originalTargetDerived: true, navigationDispatched: false } });
    await this.#admit(expected); await this.#checked(() => (this.#dependencies.verifyHistoricalCheckpoint ?? verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint)(prepared));
    const windowTabId = this.#navigation?.page?.windowTabId; need(windowTabId !== undefined, "ORIGINAL_WINDOW_REQUIRED");
    const upstream = this.#options.engine.upstream; const execute = upstream.callTool; this.#assertOriginalSession();
    try { const raw = await this.#checked(() => execute.call(upstream, "easyeda_execute", { code: buildGeneratedSchematicReadersProgram(this.#source.qualification, windowTabId), timeoutMs: 60_000, confirmWrite: true }, 70_000)); this.#assertOriginalSession();
      need(Buffer.byteLength(JSON.stringify(raw)) <= 131_072, "ORIGINAL_READER_REPLY_BOUND"); await this.#change({}, { phase: "original-reader-reply", value: raw });
      this.#readers = validateGeneratedSchematicReaders(decode(raw), this.#source.qualification, prepared.history, windowTabId);
      await this.#checked(() => (this.#dependencies.verifyHistoricalCheckpoint ?? verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint)(prepared));
      await this.#admit(expected); await this.#change({}, { phase: "reader-result", value: this.#readers }); this.#phase = "readers-observed-unverified";
      return this.inspect(this.#options.operationId);
    } catch (error) { this.#phase = "readers-refused-or-ambiguous"; throw error; }
  }
}
