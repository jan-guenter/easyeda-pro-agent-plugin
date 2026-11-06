/* oxlint-disable import/max-dependencies -- This dedicated owner joins fixed archive generation, exact managed publication, source admission, original native destination and tracked journal custody. */
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { z } from "zod";
import { createOperation, loadOperation, operationPath, readArtifact, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, sha256Json, sha256Text } from "./core.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { ManagedFixtureDestinationOwner } from "./managed-fixture-destination.ts";
import type { ManagedFixtureDestinationObservation } from "./managed-fixture-destination.ts";
import { MANAGED_FIXTURE_GENERATOR_KINDS, generateManagedFixtureArchiveData } from "./managed-fixture-generator.ts";
import { buildManagedFixtureImportPrograms, validateManagedFixtureImportJobObservation } from "./managed-fixture-import-program.ts";
import type { managedFixtureImportJobObservationSchema } from "./managed-fixture-import-program.ts";
import { MANAGED_FIXTURE_IMPORT_PROFILE, assertManagedFixtureImportFingerprint, verifyManagedFixtureImportSources } from "./managed-fixture-import-profile.ts";
import { prepareManagedFixtureArchive, prepareManagedLibraryFile } from "./managed-library-files-runtime.ts";
import { managedLibraryFileSchema } from "./managed-library-files.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { buildManagedFixtureEnvironmentProgram, managedFixtureEnvironmentObservationSchema } from "./managed-fixture-environment-program.ts";
import { captureManagedFixtureClosedSnapshot } from "./managed-fixture-closed-snapshot.ts";
import { assertOriginalGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { stageManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import type { ManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";

const operationId = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
export const managedFixtureImportRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("import-generated-fixture"), operationId: operationId.max(64), fixtureKind: z.enum(MANAGED_FIXTURE_GENERATOR_KINDS),
    confirmDisposableFixture: z.literal(true), confirmNativeImport: z.literal(true), acceptPartialImportRetention: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
  z.object({ action: z.literal("inspect-destination"), operationId }).strict(),
  z.object({ action: z.literal("release-destination"), operationId, confirmReleaseRetainedDirectory: z.literal(true) }).strict(),
  z.object({ action: z.literal("request-cleanup-close"), operationId, cleanupNonce: z.string().min(32).max(512),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-cleanup-termination"), operationId, cleanupNonce: z.string().min(32).max(512) }).strict(),
  z.object({ action: z.literal("finish-cleanup"), operationId, cleanupNonce: z.string().min(32).max(512) }).strict(),
  z.object({ action: z.literal("settle-cleanup-records"), operationId, cleanupNonce: z.string().min(32).max(512) }).strict(),
  z.object({ action: z.literal("settle-import-records"), operationId }).strict(),
  z.object({ action: z.literal("release-owner"), operationId, confirmReleaseFixtureOwner: z.literal(true) }).strict(),
  z.object({ action: z.literal("capture-closed-import"), operationId, confirmReadClosedFixture: z.literal(true) }).strict(),
  z.object({ action: z.literal("stage-for-fresh-opening"), operationId, confirmStageClosedFixture: z.literal(true) }).strict(),
]);
export type ManagedFixtureImportRequest = z.infer<typeof managedFixtureImportRequestSchema>;
type Observation = z.infer<typeof managedFixtureImportJobObservationSchema>;
export const MANAGED_FIXTURE_IMPORT_TRACKED_PROFILE = "managed-fixture-import209-v1";
export const MANAGED_FIXTURE_IMPORT_DISPATCH_PHASE = "managed-fixture-import";

export function queryManagedFixtureImport(input: unknown = {}): Record<string, unknown> {
  const request = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { tool: "easyeda_control_fixture_import", profile: MANAGED_FIXTURE_IMPORT_PROFILE,
    actions: ["import-generated-fixture", "inspect", "settle-import-records", "inspect-destination", "request-cleanup-close", "observe-cleanup-termination", "finish-cleanup", "settle-cleanup-records", "capture-closed-import", "release-destination", "release-owner", "stage-for-fresh-opening"],
    effect: "fresh-managed-disposable-native-import", nativeImportLiveValidation: "not-recorded", importedFixtureAccepted: false,
    retryAllowed: false, deletionAuthorized: false, designExecutionAuthorized: false,
    limitations: ["Requires the same original ordinary 209 launch, exact empty StartPage, current SDK/UI/manager/main pins and authenticated tracked dispatch.",
      "Generates a fresh fixed Via-only, Line+Via or Arc+Line+Via archive; no caller file, path, geometry, code, SQL or profile override is accepted.",
      "The separate environment journal binds actual native config directories; HALF_OFFLINE and retained complete no-.elib rosters/watches exclude detached system-library seeding only after original termination and drained original watch cancellation.",
      "SDK settlement is partial evidence. Complete fresh closed-file SQLite/source and persistent registration acceptance remain separate; no import replay, automatic cleanup/deletion, Save or force termination is available.",
      "Cleanup requires the retained original dispatcher journal/Promise/session/runtime; inspect never adopts historical JSON. Release-destination closes only original held directory/watch handles after original root/Job termination."],
    ...(request.includeSchemas ? { requestSchema: z.toJSONSchema(managedFixtureImportRequestSchema) } : {}) };
}
export function validateManagedFixtureImportArguments(input: unknown): Record<string, unknown> {
  const parsed = managedFixtureImportRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) };
}

export interface ManagedFixtureImportOptions {
  readonly pluginRoot: string; readonly assetsRoot: string;
  readonly engine: Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "dispatchWithOrphanTracking"> & {
    readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
    /** Actual Engine WeakMap observer, not a beforeDispatch caller flag. */
    readonly originalTrackedDispatchStatus: (journal: TrackedDispatchOperationJournal) => Readonly<{ phase: string; settled: boolean; callToolEntered: boolean }> | undefined;
  };
  readonly runtime: Pick<WindowsControlRuntime, "status" | "observeLaunchTermination">;
  /** Required synchronous closure over the actual index allocation objects.
   * Assert windowsRuntime === ordinaryLaunchRuntime === this original runtime
   * and this coordinator remains the current original owner around every await.
   * Neither external opt-in nor serialized launch JSON can supply this closure.
   */
  readonly assertOriginalOwner: () => void;
  /** Original maintained cleanup composition; retain receives this actual
   * journal only after the final plan is sealed and before tracked dispatch. */
  readonly cleanup: {
    readonly retain: (journal: TrackedDispatchOperationJournal) => void;
    readonly inspect: (operationId: string) => Record<string, unknown>;
    readonly run: (request: { action: "request-cleanup-close" | "observe-cleanup-termination" | "finish-cleanup" | "settle-cleanup-records";
      operationId: string; cleanupNonce: string; confirmNormalClose?: true; acceptUnknownFileEffects?: true }) => Promise<Record<string, unknown>>;
  };
}
/** Internal offline-test seams; production never accepts dependency overrides. */
export interface ManagedFixtureImportDependencies {
  readonly destination?: (options: ConstructorParameters<typeof ManagedFixtureDestinationOwner>[0]) => Pick<ManagedFixtureDestinationOwner, "initialize" | "inspect" | "snapshot" | "release">;
  readonly verifySources?: typeof verifyManagedFixtureImportSources;
  readonly assertFingerprint?: typeof assertManagedFixtureImportFingerprint;
  readonly prepareInput?: typeof prepareManagedLibraryFile;
  readonly prepareArchive?: typeof prepareManagedFixtureArchive;
  readonly writeArtifact?: typeof writePhaseArtifact;
  readonly updateJournal?: typeof updateOperation;
}
interface PendingPublication {
  readonly operation: TrackedDispatchOperationJournal;
  readonly baseText: string;
  readonly candidate: TrackedDispatchOperationJournal;
  readonly candidateText: string;
  readonly record?: { readonly phase: string; readonly value: unknown; readonly text: string };
}
function journalContent(value: Readonly<Record<string, unknown>>): string {
  const { journalSha256: _selfHash, ...body } = value; return canonicalJson(body);
}

/** Actual single-dispatch import owner. The server must mount its mutating
 * action inside the ordinary launch's authenticated dispatch scope and global
 * serialized bridge gate. It generates a new fixed archive itself; there is no
 * caller file/path/code/geometry/SQL, automatic retry or output deletion.
 *
 * SDK settlement is only an intermediate state. This owner deliberately keeps
 * hardStop and every original destination until separate original-process
 * cleanup and complete closed-file/registration proof have succeeded. The
 * original journal accessor composes with the maintained tracked-cleanup owner;
 * it never converts historical JSON into native cleanup authority.
 */
export class ManagedFixtureImportCoordinator {
  private readonly options: ManagedFixtureImportOptions;
  private readonly dependencies: ManagedFixtureImportDependencies;
  private readonly launchText: string;
  private readonly methods: readonly unknown[];
  private operation: TrackedDispatchOperationJournal | undefined;
  private environmentOperation: TrackedDispatchOperationJournal | undefined;
  private environmentObservation: z.infer<typeof managedFixtureEnvironmentObservationSchema> | undefined;
  private pendingPublication: PendingPublication | undefined;
  private readonly refusedBeforeDispatch = new Set<TrackedDispatchOperationJournal>();
  private reservation: "reserved" | "released" = "reserved";
  private busy = false;
  private attemptedOperationId: string | undefined;
  private lastNativeJournal: TrackedDispatchOperationJournal | undefined;
  private generatedArchive: Buffer | undefined;
  private closedCaptureAttempted = false;
  private closedCapture: Awaited<ReturnType<typeof captureManagedFixtureClosedSnapshot>> | undefined;
  private destination: ReturnType<NonNullable<ManagedFixtureImportDependencies["destination"]>> | undefined;
  private destinationReleased = false;
  private migrationExclusionVerified = false;
  private observation: Observation | null = null;
  private destinationObservation: ManagedFixtureDestinationObservation | null = null;
  private phase = "idle";
  private error: string | null = null;
  public constructor(options: ManagedFixtureImportOptions, dependencies: ManagedFixtureImportDependencies = {}) {
    this.options = Object.freeze({ ...options }); this.dependencies = Object.freeze({ ...dependencies });
    options.assertOriginalOwner(); const status = options.runtime.status();
    if (status.state !== "owned" || status.launch === null) { throw new Error("Fixture import requires the current original ordinary launch runtime."); }
    this.launchText = canonicalJson(status.launch);
    this.methods = [options.runtime.status, options.runtime.observeLaunchTermination, options.engine.status, options.engine.assertBridgeDispatchAllowed, options.engine.dispatchWithOrphanTracking, options.engine.originalTrackedDispatchStatus];
  }
  private current(): void {
    this.options.assertOriginalOwner(); const status = this.options.runtime.status();
    const methods = [this.options.runtime.status, this.options.runtime.observeLaunchTermination, this.options.engine.status, this.options.engine.assertBridgeDispatchAllowed, this.options.engine.dispatchWithOrphanTracking, this.options.engine.originalTrackedDispatchStatus];
    if (status.state !== "owned" || canonicalJson(status.launch) !== this.launchText || methods.some((method, index) => method !== this.methods[index])) { throw new Error("Fixture import lost its original ordinary launch generation or methods."); }
  }
  private async checked<T>(call: () => Promise<T>): Promise<T> {
    this.current(); try { return await call(); } finally { this.current(); }
  }
  private async publishPending(): Promise<void> {
    const pending = this.pendingPublication; if (pending === undefined) { return; }
    const { operation, candidate } = pending;
    this.current();
    if (operation !== this.operation && operation !== this.environmentOperation || journalContent(operation) !== pending.baseText || journalContent(candidate) !== pending.candidateText) { throw new Error("Retained fixture publication lost its original unchanged journal/candidate."); }
    const before = await this.checked(() => loadOperation(operation.operationId));
    if (![pending.baseText, pending.candidateText].includes(journalContent(before))) { throw new Error("Fixture publication differs from both original retained states."); }
    if (pending.record !== undefined) {
      const { phase, value, text } = pending.record;
      const path = join(dirname(operationPath(operation.operationId)), operation.operationId, `${String(candidate.sequence).padStart(2, "0")}-${phase}.json`);
      let descriptor;
      try {
        const existing = await this.checked(() => readArtifact(path, 0, Buffer.byteLength(text)));
        if (!existing.eof || existing.offset !== 0 || existing.size !== Buffer.byteLength(text) || existing.text !== text) { throw new Error("Original fixture phase artifact differs from its retained exact bytes."); }
        descriptor = { path, bytes: existing.size, sha256: sha256Text(text) };
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") { throw error; }
        descriptor = await this.checked(() => (this.dependencies.writeArtifact ?? writePhaseArtifact)(operation.operationId, candidate.sequence, phase, value));
      }
      if (descriptor.path !== path || descriptor.bytes !== Buffer.byteLength(text) || descriptor.sha256 !== sha256Text(text)) { throw new Error("Published fixture phase artifact differs from retained bytes."); }
      const last = candidate.artifacts.at(-1);
      if (last === undefined || canonicalJson(last) !== canonicalJson(descriptor)) { throw new Error("Fixture phase artifact differs from the original candidate journal."); }
    }
    const current = await this.checked(() => loadOperation(operation.operationId));
    if (![pending.baseText, pending.candidateText].includes(journalContent(current)) || journalContent(candidate) !== pending.candidateText || journalContent(operation) !== pending.baseText) { throw new Error("Fixture retained publication changed before its original update."); }
    if (journalContent(current) === pending.baseText) { await this.checked(() => (this.dependencies.updateJournal ?? updateOperation)(candidate)); }
    const published = await this.checked(() => loadOperation(operation.operationId));
    if (journalContent(published) !== pending.candidateText || journalContent(operation) !== pending.baseText) { throw new Error("Fixture original publication did not settle to its exact retained candidate."); }
    for (const key of Object.keys(operation)) { Reflect.deleteProperty(operation, key); } Object.assign(operation, published); this.pendingPublication = undefined;
  }
  private async change(changes: Readonly<Record<string, unknown>>, record?: { phase: string; value: unknown }): Promise<void> {
    const operation = this.operation; if (operation === undefined) { throw new Error("Fixture import has no original operation intent."); }
    if (this.pendingPublication !== undefined) { throw new Error("Settle the original retained fixture publication before recording another state."); }
    const candidate = structuredClone(operation); Object.assign(candidate, changes); candidate.updatedAt = new Date().toISOString();
    let event;
    if (record !== undefined) {
      const value: unknown = structuredClone(record.value); const text = `${JSON.stringify(value)}\n`;
      if (!/^[a-z0-9-]+$/u.test(record.phase) || Buffer.byteLength(text) > 256 * 1024) { throw new Error("Fixture retained phase exceeds its fixed name/byte bound."); }
      candidate.sequence += 1;
      const directory = dirname(operationPath(operation.operationId));
      const path = join(directory, operation.operationId, `${String(candidate.sequence).padStart(2, "0")}-${record.phase}.json`);
      candidate.artifacts.push({ path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) });
      event = { phase: record.phase, value, text };
    }
    this.pendingPublication = { operation, baseText: journalContent(operation), candidate, candidateText: journalContent(candidate), ...(event === undefined ? {} : { record: event }) };
    await this.publishPending();
  }
  private artifact(phase: string, value: unknown): Promise<void> {
    return this.change({}, { phase, value });
  }
  public inspect(operationIdInput: string): Record<string, unknown> {
    const id = operationId.parse(operationIdInput), operation = this.operation?.operationId === id ? this.operation : this.environmentOperation;
    if (operation === undefined || operation.operationId !== id) { throw new Error("Only the retained original fixture import can be inspected in this coordinator."); }
    return { schema: "easyeda-pro-control.managed-fixture-import-result.v1", operationId: id, phase: this.phase,
      operation: structuredClone(operation), sdkObservation: this.observation, destination: this.destinationObservation,
      environment: this.environmentObservation, environmentOperationId: this.environmentOperation?.operationId,
      publicationPending: this.pendingPublication?.operation.operationId === id, originalJournalRetained: true,
      ownerReservation: this.reservation, operationInFlight: this.busy,
      closedSnapshot: this.closedCapture?.report ?? null,
      destinationReleased: this.destinationReleased, lastError: this.error,
      libraryMigrationExcluded: this.migrationExclusionVerified,
      nativeImportMayHaveBeenDispatched: operation.mutationMayHaveOccurred, retryAllowed: false, filesDeleted: false,
      importedFixtureAccepted: false, registrationVerified: false, closedSqlVerified: false, delayedNativeJobsCompleted: false,
      originalClosureVerified: false, designExecutionAuthorized: false, liveValidation: "not-recorded",
      originalCleanup: this.options.cleanup.inspect(id) };
  }
  /** Internal composition only: returns this actual mutable journal, never a
   * clone or loaded record. The tracked-cleanup issuer must still validate its
   * own original dispatcher/capture/session/launch binding before cleanup.
   */
  public originalJournalForCleanup(operationIdInput: string): TrackedDispatchOperationJournal {
    this.current(); const id = operationId.parse(operationIdInput), operation = this.operation?.operationId === id ? this.operation : this.environmentOperation;
    if (operation === undefined || operation.operationId !== id || operation.plan["profile"] !== MANAGED_FIXTURE_IMPORT_TRACKED_PROFILE) { throw new Error("Original fixture import journal is unavailable."); }
    return operation;
  }
  public hasRetainedDestination(): boolean { return this.destination !== undefined && !this.destinationReleased; }
  /** Synchronous monotonic index custody. True from construction through every
   * preflight/import Promise, ambiguous return, publication and directory/watch
   * release. Only explicit release-owner after original cleanup can turn it
   * false. It does not reconstruct a Promise from persisted journal state.
   */
  public hasActiveReservation(): boolean { return this.reservation === "reserved" || this.busy; }
  public hasPendingWork(): boolean { return this.hasActiveReservation(); }
  /** Internal immutable data transfer only, after original owner release.
   * A fresh opening owner still needs its own original runtime/HMAC custody
   * and must recheck the source/checkpoint. Serialized report JSON cannot pass.
   */
  public qualifiedSourceForFreshOpening(): Readonly<{ qualification: QualifiedGeneratedFixtureTarget; archive: Buffer }> {
    this.current();
    const qualification = this.closedCapture?.qualifiedTarget;
    if (this.reservation !== "released" || this.busy || !this.migrationExclusionVerified || qualification === null || qualification === undefined || this.generatedArchive === undefined) { throw new Error("Original closed generated fixture has no released issued opening source with its library migration excluded."); }
    assertOriginalGeneratedFixtureTarget(qualification);
    return Object.freeze({ qualification, archive: Buffer.from(this.generatedArchive) });
  }
  /** Stage before index releases this coordinator slot. The distinct staged
   * token survives that local slot release only in this original facade. */
  public stageSourceForFreshOpening(operationIdInput: string): ManagedFixtureOpeningSource {
    if (operationId.parse(operationIdInput) !== this.attemptedOperationId) { throw new Error("Staging requires the original base import operation."); }
    return stageManagedFixtureOpeningSource(this.qualifiedSourceForFreshOpening());
  }
  private retainDispatcherStatus(journal: TrackedDispatchOperationJournal): boolean {
    this.current(); const status = this.options.engine.originalTrackedDispatchStatus(journal);
    if (status === undefined) { return false; }
    if (status.phase !== MANAGED_FIXTURE_IMPORT_DISPATCH_PHASE) { throw new Error("Original Engine dispatcher status belongs to another phase."); }
    if (status.callToolEntered) { this.lastNativeJournal = journal; }
    return status.callToolEntered;
  }
  private async observeEnvironment(id: string, fingerprint: Record<string, unknown>): Promise<z.infer<typeof managedFixtureEnvironmentObservationSchema>> {
    const environmentId = `${id}-environment`; const body = buildManagedFixtureEnvironmentProgram();
    const code = `const value=await(async()=>{${body}})();const json=JSON.stringify(value);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};`;
    const plan = { name: environmentId, profile: MANAGED_FIXTURE_IMPORT_TRACKED_PROFILE, phase: "actual-config-directory-preflight",
      intent: "Observe actual resolved native c0 library directories before any importer/destination allocation. c0 may create directories; no library content or migration is requested.",
      expectedFingerprint: fingerprint, applyCall: { tool: "easyeda_execute", code }, parentImportOperationId: id };
    const time = new Date().toISOString();
    const journal: TrackedDispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId: environmentId, journalPath: operationPath(environmentId), plan, planHash: buildPlanHash(plan),
      state: "completed", mutationState: "profile-directory-observation-prepared", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false, sequence: 0, createdAt: time, updatedAt: time, artifacts: [],
      nextSafeAction: "Await the original local config GET. On uncertainty retain original ordinary cleanup; no importer or destination was allocated." };
    this.operation = journal; this.environmentOperation = journal; this.phase = "observing-environment";
    const revalidate = async (): Promise<void> => {
      this.current(); const recorded = await this.checked(() => loadOperation(environmentId));
      if (canonicalJson(recorded) !== canonicalJson(journal)) { throw new Error("Original fixture environment journal changed."); }
    };
    try {
      await this.checked(() => createOperation(journal));
      await this.change({ mutationMayHaveOccurred: true, mutationState: "profile-config-get-intent" });
      this.options.cleanup.retain(journal); this.current();
      await this.checked(() => this.options.engine.dispatchWithOrphanTracking(journal, MANAGED_FIXTURE_IMPORT_DISPATCH_PHASE, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000,
        async () => { await revalidate(); await this.checked(() => (this.dependencies.verifySources ?? verifyManagedFixtureImportSources)(this.options.assetsRoot)); await revalidate(); },
        async (raw) => {
          this.current(); const envelope = extractToolPayload(raw);
          if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > 32_768) { throw new Error("Fixture environment response exceeds its bounded exact transport."); }
          this.environmentObservation = managedFixtureEnvironmentObservationSchema.parse(decodeExactReadEnvelope(envelope));
          await this.artifact("original-environment-observation", this.environmentObservation);
        }, revalidate));
      this.retainDispatcherStatus(journal);
      if (this.environmentObservation === undefined) { throw new Error("Original environment getter settled without its retained observation."); }
      await this.change({ state: "completed", mutationState: "actual-config-directories-observed", hardStop: false,
        nextSafeAction: "No library migration was requested. The separate importer must retain native no-candidate watches before dispatch." });
      return this.environmentObservation;
    } catch (error) {
      this.retainDispatcherStatus(journal);
      this.phase = "environment-ambiguous-or-refused"; this.error = error instanceof Error ? error.message : "Unknown environment preflight failure.";
      throw new Error(`Fixture environment ${environmentId} is incomplete. Inspect this original operation and use its retained cleanup; no import retry or destination allocation is authorized.`, { cause: error });
    }
  }
  public async execute(input: unknown, expectedFingerprint?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const request = managedFixtureImportRequestSchema.parse(input);
    if (request.action === "inspect") { return this.inspect(request.operationId); }
    if (this.busy || this.reservation !== "reserved") { throw new Error("Fixture owner is busy or its original reservation has been released."); }
    if (request.action === "import-generated-fixture") {
      if (this.attemptedOperationId !== undefined) { throw new Error("Original fixture import attempt cannot be repeated or replaced."); }
      this.attemptedOperationId = request.operationId;
    }
    this.busy = true; try { return await this.run(request, expectedFingerprint); } finally { this.busy = false; }
  }
  private async run(input: unknown, expectedFingerprint?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const request = managedFixtureImportRequestSchema.parse(input);
    if (request.action === "inspect") { return this.inspect(request.operationId); }
    if (request.action === "stage-for-fresh-opening") { throw new Error("Staging is a separate local index handoff after original owner release, never a destination cleanup action."); }
    this.current();
    if (request.action === "release-owner") {
      if (request.operationId !== this.attemptedOperationId || this.pendingPublication !== undefined || this.hasRetainedDestination() || this.refusedBeforeDispatch.size > 0 ||
          [this.operation, this.environmentOperation].some((journal) => journal !== undefined && (journal.orphanedCallPossible || journal.hardStop)) ||
          this.lastNativeJournal !== undefined && this.options.cleanup.inspect(this.lastNativeJournal.operationId)["cleanupComplete"] !== true) {
        throw new Error("Fixture reservation requires its original settled publication, root/Job/session cleanup and released destination before owner release.");
      }
      this.reservation = "released";
      return { schema: "easyeda-pro-control.managed-fixture-owner-released.v1", operationId: request.operationId,
        originalReservationReleased: true, nativeDispatcherEntered: this.lastNativeJournal !== undefined,
        originalCleanupRequiredAndCompleted: this.lastNativeJournal !== undefined, filesDeleted: false, importedFixtureAccepted: false,
        registrationVerified: false, closedSqlVerified: false, designExecutionAuthorized: false, retryAllowed: false };
    }
    if (request.action === "settle-import-records") {
      const original = this.originalJournalForCleanup(request.operationId);
      if (this.pendingPublication !== undefined && this.pendingPublication.operation !== original) { throw new Error("Pending fixture publication belongs to a different original operation."); }
      await this.publishPending();
      if (this.refusedBeforeDispatch.has(original) && !original.orphanedCallPossible) {
        await this.change({ state: "completed", hardStop: false, mutationState: "import-not-dispatched", mutationMayHaveOccurred: false,
          nextSafeAction: "Importer was not dispatched. Preserve partial staging/destination and clean up the original ordinary launch using its settled environment journal. Never replay this operation." });
        this.refusedBeforeDispatch.delete(original);
      }
      return this.inspect(request.operationId);
    }
    if (this.pendingPublication !== undefined) { throw new Error("Settle only the retained original fixture publication before further native or cleanup actions."); }
    if (request.action === "capture-closed-import") {
      this.originalJournalForCleanup(request.operationId);
      const destination = this.destination; const archive = this.generatedArchive; const last = this.lastNativeJournal;
      if (this.closedCaptureAttempted || destination === undefined || this.destinationReleased || archive === undefined || last === undefined ||
          this.options.cleanup.inspect(last.operationId)["cleanupComplete"] !== true) { throw new Error("Closed fixture capture requires its original completed cleanup and retained unopened destination."); }
      const held = this.destinationObservation ?? destination.snapshot(); if (held === null) { throw new Error("Original fixture directory identity is unavailable."); }
      await this.artifact("closed-import-capture-intent", { source: destination.snapshot(), nativeRootAndJobCleanupComplete: true, readOnly: true });
      this.closedCaptureAttempted = true;
      this.closedCapture = await this.checked(() => captureManagedFixtureClosedSnapshot({ archive, destination: held,
        assertOriginalOwner: () => { this.current(); },
        observeOriginalTermination: async () => {
          const termination = await this.checked(() => this.options.runtime.observeLaunchTermination());
          if (!termination.terminated) { throw new Error("Original import root/Job is no longer proven terminated."); }
        }, inspectOriginalDestination: () => this.checked(() => destination.inspect()) }));
      await this.artifact("closed-import-capture", this.closedCapture.report); return this.inspect(request.operationId);
    }
    if (request.action === "request-cleanup-close" || request.action === "observe-cleanup-termination" || request.action === "finish-cleanup" || request.action === "settle-cleanup-records") {
      this.originalJournalForCleanup(request.operationId);
      return this.checked(() => this.options.cleanup.run(request));
    }
    if (request.action !== "import-generated-fixture") {
      const operation = this.originalJournalForCleanup(request.operationId);
      const destination = this.destination;
      if (destination === undefined || this.destinationReleased) { throw new Error("Original fixture destination handles are unavailable."); }
      if (request.action === "inspect-destination") {
        this.destinationObservation = await this.checked(() => destination.inspect());
        await this.artifact("destination-roster", this.destinationObservation); return this.inspect(request.operationId);
      }
      // Releasing the directory while EasyEDA can still write would surrender
      // The exclusive destination. Only its own original root/Job exit permits
      // Handle release; this does not accept the import or clear quarantine.
      const termination = await this.checked(() => this.options.runtime.observeLaunchTermination());
      if (!termination.terminated) { throw new Error("Original EasyEDA root/Job has not exited; retain the managed fixture destination."); }
      await this.artifact("destination-release-intent", { operationId: operation.operationId, termination, filesDeleted: false });
      const released = await this.checked(() => destination.release());
      this.destinationReleased = true; this.migrationExclusionVerified = released.migrationExclusionHeldUntilRelease;
      this.destinationObservation = released.finalObservation ?? this.destinationObservation;
      this.phase = this.migrationExclusionVerified ? "destination-released-unverified" : "destination-released-migration-unproved";
      await this.artifact("destination-released", released); return this.inspect(request.operationId);
    }
    if (this.operation !== undefined) { throw new Error("Fixture import can be dispatched only once by this original coordinator; no replay or replacement operation is supported."); }
    if (expectedFingerprint === undefined) { throw new Error("Native fixture import requires an exact expected runtime fingerprint."); }
    (this.dependencies.assertFingerprint ?? assertManagedFixtureImportFingerprint)(expectedFingerprint);
    await this.checked(() => this.options.engine.assertBridgeDispatchAllowed());
    const initialStatus = await this.checked(() => this.options.engine.status()); const initial = structuredClone(initialStatus.stableFingerprint);
    (this.dependencies.assertFingerprint ?? assertManagedFixtureImportFingerprint)(initial);
    assertSubset(initial, expectedFingerprint, "Managed fixture import expected fingerprint");
    await this.checked(() => (this.dependencies.verifySources ?? verifyManagedFixtureImportSources)(this.options.assetsRoot));
    const environment = await this.observeEnvironment(request.operationId, initial);
    const generated = generateManagedFixtureArchiveData(request.fixtureKind), nonce = randomBytes(32).toString("hex");
    this.generatedArchive = Buffer.from(generated.bytes);
    const plan = { name: request.operationId, profile: MANAGED_FIXTURE_IMPORT_TRACKED_PROFILE,
      intent: "Import one fresh fixed generated disposable fixture into a new exclusive private Windows directory; retain all partial effects and never replay.",
      expectedFingerprint: initial, launchSha256: sha256Json(JSON.parse(this.launchText) as unknown),
      archiveSha256: generated.metadata["archiveSha256"], qualificationSha256: generated.metadata["qualificationSha256"],
      nonce, fixtureKind: request.fixtureKind, importProfile: MANAGED_FIXTURE_IMPORT_PROFILE,
      capabilityLevel: "managed-disposable-native-import", applyCall: { tool: "easyeda_execute", code: "not-yet-reserved" } };
    const time = new Date().toISOString();
    const operation: TrackedDispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId: request.operationId, journalPath: operationPath(request.operationId),
      plan, planHash: buildPlanHash(plan), state: "completed", mutationState: "fixture-preparation-only", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
      nextSafeAction: "Retain the original fixture owner; preparation is not import acceptance.", sequence: 0, createdAt: time, updatedAt: time, artifacts: [] };
    this.operation = operation; this.phase = "preparing";
    try {
      await this.checked(() => createOperation(operation));
      const prepared = await this.checked(() => (this.dependencies.prepareInput ?? prepareManagedLibraryFile)({ action: "prepare-file", name: generated.name,
        base64: generated.bytes.toString("base64"), confirmLocalArtifact: true }));
      const file = managedLibraryFileSchema.parse(prepared["file"]);
      const staged = await this.checked(() => (this.dependencies.prepareArchive ?? prepareManagedFixtureArchive)({ action: "prepare-fixture-archive", file,
        confirmDisposableFixture: true, confirmLocalArtifact: true }));
      await this.artifact("generated-archive", { generated: generated.metadata, prepared, staged });
      this.phase = "allocating-destination";
      const destination = (this.dependencies.destination ?? ((options): ManagedFixtureDestinationOwner => new ManagedFixtureDestinationOwner(options)))({ pluginRoot: this.options.pluginRoot,
        assetsRoot: this.options.assetsRoot, nonce, expectedBasename: generated.name.replace(/\.epro2$/u, ".eprj2"), libraryWindowsDirectories: environment.libraryWindowsDirectories });
      this.destination = destination;
      this.destinationObservation = await this.checked(() => destination.initialize());
      await this.artifact("destination-held", this.destinationObservation);
      const importPlan = { operationId: request.operationId, nonce, archiveName: generated.name, destinationWindowsDirectory: this.destinationObservation.windowsDirectory,
        libraryWindowsDirectories: environment.libraryWindowsDirectories };
      const programs = buildManagedFixtureImportPrograms(importPlan, generated.bytes);
      const code = `const imported=await(async()=>{${programs.launchAndWait}})();const json=JSON.stringify(imported);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};`;
      if (Buffer.byteLength(code, "utf8") > 65_536) { throw new Error("Complete fixed fixture import program exceeds its transport budget."); }
      const finalPlan = { ...operation.plan, applyCall: { tool: "easyeda_execute", code }, destination: this.destinationObservation };
      await this.change({ plan: finalPlan, planHash: buildPlanHash(finalPlan), mutationMayHaveOccurred: true, mutationState: "import-intent",
        nextSafeAction: "Await the sole original import. SDK settlement does not accept delayed jobs, registration or closed SQL; never replay." });
      this.phase = "dispatching";
      this.options.cleanup.retain(operation); this.current();
      const revalidate = async (): Promise<void> => {
        this.current(); const retained = await this.checked(() => loadOperation(operation.operationId));
        if (canonicalJson(retained) !== canonicalJson(operation)) { throw new Error("Original fixture import journal changed before dispatch or retention."); }
      };
      await this.checked(() => this.options.engine.dispatchWithOrphanTracking(operation, MANAGED_FIXTURE_IMPORT_DISPATCH_PHASE, "easyeda_execute",
        { code, timeoutMs: 60_000, confirmWrite: true }, 70_000,
        async () => {
          await revalidate();
          await this.checked(() => (this.dependencies.verifySources ?? verifyManagedFixtureImportSources)(this.options.assetsRoot));
          this.destinationObservation = await this.checked(() => destination.inspect());
          if (this.destinationObservation.entries.length > 0) { throw new Error("Managed fixture destination changed before the sole import dispatch."); }
          await revalidate();
        },
        async (raw) => {
          this.current(); const envelope = extractToolPayload(raw);
          if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > 32_768) { throw new Error("Fixture import return exceeds its complete output budget."); }
          const decoded = decodeExactReadEnvelope(envelope);
          this.observation = validateManagedFixtureImportJobObservation(decoded, importPlan, generated.bytes);
          if (this.observation.state !== "sdk-settled") { throw new Error("Tracked fixture import returned before its original SDK Promise settled."); }
          await this.change({ state: "managed-fixture-sdk-settled-unverified", hardStop: true, mutationState: "partial-import-unverified" },
            { phase: "original-sdk-settlement", value: this.observation });
        }, revalidate));
      this.retainDispatcherStatus(operation);
      this.phase = "sdk-settled-unverified";
      await this.change({ state: "managed-fixture-sdk-settled-unverified", mutationState: "partial-import-unverified",
        nextSafeAction: "Use original tracked cleanup, then prove the complete fresh closed SQLite/source/registration roster. Retain every file; never replay this import." },
      { phase: "sdk-settled-partial", value: { sdkObservation: this.observation, accepted: false } });
      return this.inspect(request.operationId);
    } catch (error) {
      const nativeDispatcherEntered = this.retainDispatcherStatus(operation);
      if (!nativeDispatcherEntered && !operation.orphanedCallPossible) {
        this.refusedBeforeDispatch.add(operation);
        if (this.pendingPublication === undefined) {
          try {
            await this.change({ state: "completed", hardStop: false, mutationState: "import-not-dispatched", mutationMayHaveOccurred: false,
              nextSafeAction: "Importer was not dispatched. Preserve partial files/destination and use the original environment journal cleanup. Never replay this operation." });
            this.refusedBeforeDispatch.delete(operation);
          } catch {
            // Retain the exact publication for local settlement before cleanup.
          }
        }
      }
      this.phase = operation.mutationMayHaveOccurred ? "import-ambiguous-or-partial" : "preparation-incomplete";
      this.error = error instanceof Error ? error.message : "Managed fixture import failed with an unknown error.";
      // Do not overwrite a failed original dispatch journal or clear its
      // Maintained orphan marker. Existing exclusive files/handles stay owned.
      throw new Error(`Managed fixture ${request.operationId} is ${this.phase}; retain original ownership and all partial files. Import retry is forbidden.`, { cause: error });
    }
  }
}
