/** Original-owner validation lifecycle with one checkpoint-bound disposable
 * opening. No generic debugger command, CAD writer or historical owner recreation. */
import type { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { prepareCurrentDisposableOpenCheckpoint, verifyCurrentDisposableOpenCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { startCurrentPcbDiagnosticOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbDiagnosticOwner } from "./current-pcb-diagnostic-owner.ts";
import { verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_DIAGNOSTIC_SCRIPTS } from "./current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "./current-pcb-diagnostic-validation.ts";
import type { CurrentPcbDiagnosticValidationRequest as Request } from "./current-pcb-diagnostic-validation.ts";
import { DIAGNOSTIC_OBSERVATION_MAX_BYTES, acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLifecycleSnapshot,
  assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleBindingSchema,
  diagnosticLifecycleDigestSchema, diagnosticLifecycleNoProcessReleaseProofSchema, diagnosticLifecycleRecordSchemas, diagnosticLifecycleWindowSchema,
  diagnosticObservationStageSchema, diagnosticPcbOpeningSourceAccepted, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles, releaseCurrentPcbDiagnosticLaunchExclusion,
  reserveCurrentPcbDiagnosticLifecycle } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease, DiagnosticLifecycleBinding, DiagnosticLifecycleOperation, DiagnosticLifecycleRecordName, DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";

type CleanupRequest = Exclude<Request, { action: "launch" | "inspect" | "settle-records" | "cleanup-unlaunched" | "cleanup-no-process" }>;
type ObservationRequest = Extract<Request, { action: "browser-observation" | "inspect-frames" | "inspect-script" | "inspect-workers" | "inspect-worker-script" | "observe-worker-state" | "observe-model-state" | "observe-pcb-opening" }>;
type ObservationStage = z.infer<typeof diagnosticObservationStageSchema>;
const methods = ["launch", "status", "observeApplicationWindow", "requestNormalClose", "observeTermination", "releaseClosed", "releaseUnlaunched",
  "releaseNoProcess", "browserObservation", "inspectFrames", "inspectScript", "inspectWorkers", "inspectWorkerScript", "observeWorkerState", "observeModelState", "openProject",
  "openPcb", "observePcbOpening"] as const;
export type CurrentPcbDiagnosticLifecycleOwner = Pick<CurrentPcbDiagnosticOwner, (typeof methods)[number]>;
export interface CurrentPcbDiagnosticLifecycleOptions extends CurrentPcbDiagnosticInstallationOptions {
  readonly assertAllowed: () => Promise<void>;
  /** Original local method/environment identity only. No bridge or full startup admission. */
  readonly assertLocalAllowed: () => void;
  /** Must scan unresolved engine/project replacement owners in addition to the
   * mandatory ordinary/diagnostic journals. Presence is not termination proof. */
  readonly assertOtherLaunchesSettled: () => Promise<void>;
}
/** Offline fixture seams only. No public request selects factories or pins. */
export interface CurrentPcbDiagnosticLifecycleDependencies {
  readonly verifyInstallation?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbDiagnosticInstallation>;
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbDiagnosticLifecycleOwner>;
  readonly publishRecord?: typeof publishCurrentPcbDiagnosticLifecycleRecord;
  readonly prepareCheckpoint?: typeof prepareCurrentDisposableOpenCheckpoint;
  readonly verifyCheckpoint?: typeof verifyCurrentDisposableOpenCheckpoint;
  readonly verifyHistoricalCheckpoint?: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
}
interface Retained {
  readonly operationId: string;
  readonly owner: CurrentPcbDiagnosticLifecycleOwner;
  readonly methods: CurrentPcbDiagnosticLifecycleOwner;
  readonly installation: string;
  readonly intentSha256: string;
  binding: DiagnosticLifecycleBinding | null;
}
interface Attempt { readonly operationId: string; readonly intentSha256: string; allocationInvoked: boolean; launchInvoked: boolean }
interface ProjectPreparation {
  readonly sealedTarget: CurrentDisposableOpenSealedTarget;
  readonly prepared: CurrentDisposableOpenCheckpoint;
  readonly preparedText: string;
  readonly originalTarget: Extract<Request, { action: "open-project" }>["target"];
}
const claims = Object.freeze({ bridgeAuthentication: false, frameWorkerVerified: false, startupQualified: false,
  validationOnly: true, executionAuthorized: false, designExecutionAuthorized: false, savedStateVerified: false, historicalOwnershipRecreated: false });
function requireValue(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`PCB_DIAGNOSTIC_LIFECYCLE_${message}`); }
}
async function assertSnapshot(expected: readonly DiagnosticLifecycleOperation[]): Promise<void> {
  assertCurrentPcbDiagnosticLifecycleSnapshot(await readCurrentPcbDiagnosticLifecycles(), expected);
}
function describe(operationId: string, operation: DiagnosticLifecycleOperation | undefined): Record<string, unknown> {
  const records = operation?.records;
  const binding = records?.["binding.json"];
  let state = operation === undefined ? "not-found" : "launch-unknown";
  if (binding?.launchAcknowledged === true) { state = "launched"; }
  if (binding?.binding.rootCreated === "0") { state = "cleanup-only"; }
  if (records?.["terminated.json"] !== undefined) { state = "terminated"; }
  if (records?.["released.json"] !== undefined) { state = "released"; }
  if (records?.["not-dispatched.json"] !== undefined) { state = "not-dispatched"; }
  if (records?.["no-process-released.json"] !== undefined) { state = "no-process-released"; }
  return { operationId, state, attemptConsumed: operation !== undefined, closeAttemptConsumed: records?.["close-intent.json"] !== undefined,
    closeAcknowledged: records?.["close-acknowledged.json"] !== undefined, releaseAttemptConsumed: records?.["release-intent.json"] !== undefined,
    noProcessReleaseAttemptConsumed: records?.["no-process-release-intent.json"] !== undefined,
    noProcessReleaseProof: records?.["no-process-released.json"]?.proof,
    projectOpeningAttemptConsumed: records?.["project-opening-intent.json"] !== undefined,
    projectOpeningResultPublished: records?.["project-opening-result.json"] !== undefined,
    pcbOpeningAttemptConsumed: records?.["pcb-open-intent.json"] !== undefined,
    pcbOpeningResultPublished: records?.["pcb-open-result.json"] !== undefined,
    ...(binding === undefined ? {} : { binding: binding.binding, bindingSha256: sha256Json(binding), launchAcknowledged: binding.launchAcknowledged }),
    ...claims };
}

export class CurrentPcbDiagnosticLifecycle {
  readonly #options: CurrentPcbDiagnosticLifecycleOptions;
  readonly #verify: NonNullable<CurrentPcbDiagnosticLifecycleDependencies["verifyInstallation"]>;
  readonly #allocate: NonNullable<CurrentPcbDiagnosticLifecycleDependencies["allocateOwner"]>;
  readonly #publish: typeof publishCurrentPcbDiagnosticLifecycleRecord;
  readonly #prepareCheckpoint: typeof prepareCurrentDisposableOpenCheckpoint;
  readonly #verifyCheckpoint: typeof verifyCurrentDisposableOpenCheckpoint;
  readonly #verifyHistoricalCheckpoint: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
  readonly #pending = new Map<DiagnosticLifecycleRecordName, string>();
  readonly #observations = new Map<ObservationStage, Readonly<Record<string, unknown>>>();
  readonly #observationConsumed = new Set<ObservationStage>();
  #attempt: Attempt | null = null;
  #retained: Retained | null = null;
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #busy = false;
  #launchAttempted = false;
  #closeAttempted = false;
  #releaseAttempted = false;
  #releaseInvoked = false;
  #unlaunchedInvoked = false;
  #noProcessInvoked = false;
  #openingAttempted = false;
  #openingResult: Readonly<Record<string, unknown>> | null = null;
  #projectPreparation: ProjectPreparation | null = null;
  #pcbOpeningAttempted = false;
  #pcbOpeningResult: Readonly<Record<string, unknown>> | null = null;

  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    this.#options = Object.freeze({ ...options });
    this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcbDiagnosticInstallation;
    this.#allocate = dependencies.allocateOwner ?? startCurrentPcbDiagnosticOwner;
    this.#publish = dependencies.publishRecord ?? publishCurrentPcbDiagnosticLifecycleRecord;
    this.#prepareCheckpoint = dependencies.prepareCheckpoint ?? prepareCurrentDisposableOpenCheckpoint;
    this.#verifyCheckpoint = dependencies.verifyCheckpoint ?? verifyCurrentDisposableOpenCheckpoint;
    this.#verifyHistoricalCheckpoint = dependencies.verifyHistoricalCheckpoint ?? verifyHistoricalCurrentDisposableOpenCheckpoint;
  }

  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentPcbDiagnosticValidationRequestSchema.parse(input);
    if (request.action === "inspect") {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      const original = this.#retained?.operationId === request.operationId;
      const pendingIntent = this.#attempt?.operationId === request.operationId ? this.#attempt : null;
      const noProcessCleanupAvailable = original && this.#retained !== null && this.#lease !== null && !this.#noProcessInvoked &&
        this.#retained.methods.status.call(this.#retained.owner).noProcessCleanupAvailable;
      const native = original && this.#retained !== null ? this.#retained.methods.status.call(this.#retained.owner) : null;
      const selectedStage = request.observation ?? diagnosticObservationStageSchema.options.toReversed().find(stage =>
        operation?.records[`${stage}-result.json`] !== undefined || original && this.#pending.has(`${stage}-result.json`));
      const observations = diagnosticObservationStageSchema.options.map(stage => {
        const record = operation?.records[`${stage}-result.json`];
        const pending = original ? this.#pending.get(`${stage}-result.json`) : undefined;
        const retained = pending === undefined ? undefined : diagnosticLifecycleRecordSchemas[`${stage}-result.json`].parse(JSON.parse(pending) as unknown);
        return { stage, consumed: operation?.records[`${stage}-intent.json`] !== undefined || original && this.#observationConsumed.has(stage),
          resultRetained: original && this.#observations.has(stage), published: record !== undefined,
          result: stage === selectedStage ? (record ?? retained)?.result : undefined };
      });
      const openingPending = original ? this.#pending.get("project-opening-result.json") : undefined;
      const openingPublished = operation?.records["project-opening-result.json"];
      const openingRecord = openingPending === undefined ? openingPublished :
        diagnosticLifecycleRecordSchemas["project-opening-result.json"].parse(JSON.parse(openingPending) as unknown);
      const openingConsumed = operation?.records["project-opening-intent.json"] !== undefined || original && this.#openingAttempted;
      const openingResult = original && this.#openingResult !== null ? this.#openingResult : openingRecord?.result;
      const pcbOpeningPending = original ? this.#pending.get("pcb-open-result.json") : undefined;
      const pcbOpeningRecord = pcbOpeningPending === undefined ? operation?.records["pcb-open-result.json"] :
        diagnosticLifecycleRecordSchemas["pcb-open-result.json"].parse(JSON.parse(pcbOpeningPending) as unknown);
      const pcbOpeningResult = original && this.#pcbOpeningResult !== null ? this.#pcbOpeningResult : pcbOpeningRecord?.result;
      // A decoded renderer reply can precede a failed original-frame or final
      // Installation check. Preserve it separately, never as an accepted result
      // Or a publication plan that could authorize worker discovery.
      const nativeOpeningReply = original && openingConsumed && this.#openingResult === null
        ? native?.projectOpeningResult ?? null : null;
      const nativePcbOpeningReply = original && this.#pcbOpeningAttempted && this.#pcbOpeningResult === null
        ? native?.pcbOpeningResult ?? null : null;
      const nativePcbFrameObservation = original && this.#observationConsumed.has("pcb-opening") && !this.#observations.has("pcb-opening")
        ? native?.pcbFrameObservation ?? null : null;
      let openingState = openingConsumed ? "opening-unknown" : "not-attempted";
      if (openingResult !== undefined) {
        openingState = openingResult["ok"] === true && openingResult["status"] === "opened-prefix-observed" ? "opened-prefix-observed" : "refused";
      }
      return { ...describe(request.operationId, operation), busy: this.#busy, observations, noProcessCleanupAvailable,
        projectOpeningAttemptConsumed: openingConsumed,
        projectOpeningResultRetained: original && this.#openingResult !== null,
        projectOpeningState: openingState,
        pcbOpeningAttemptConsumed: operation?.records["pcb-open-intent.json"] !== undefined || original && this.#pcbOpeningAttempted,
        pcbOpeningResultRetained: original && this.#pcbOpeningResult !== null,
        ...(pcbOpeningResult === undefined ? {} : { pcbOpeningResult }),
        ...(openingResult === undefined ? {} : { projectOpeningResult: openingResult }),
        ...(nativeOpeningReply === null ? {} : { nativeOpeningReply, hostTransitionAccepted: false }),
        ...(nativePcbOpeningReply === null ? {} : { nativePcbOpeningReply, pcbHostTransitionAccepted: false }),
        ...(nativePcbFrameObservation === null ? {} : { nativePcbFrameObservation, pcbSourceAdmissionAccepted: false }),
        diagnosticFailureObservation: native?.diagnosticFailureObservation ?? null,
        nativeSendError: native?.nativeSendError ?? null,
        ...(native === null ? {} : { nativeLaunchError: native.nativeLaunchError, createProcessError: native.createProcessError }),
        ...(pendingIntent === null ? {} : { intentSha256: pendingIntent.intentSha256, publicationSettlementAvailable: this.#lease !== null,
          unlaunchedCleanupAvailable: !pendingIntent.launchInvoked && (!pendingIntent.allocationInvoked || this.#retained !== null) }),
        closeAttemptConsumed: operation?.records["close-intent.json"] !== undefined || original && this.#closeAttempted,
        releaseAttemptConsumed: operation?.records["release-intent.json"] !== undefined || original && this.#releaseAttempted };
    }
    this.#options.assertLocalAllowed();
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      if (request.action === "launch") {
        requireValue(this.#lease === null && !this.#launchAttempted, "LAUNCH_CONSUMED");
        this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion();
        try { return await this.#launch(request); }
        finally {
          if (!this.#launchAttempted) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
        }
      }
      if (request.action === "settle-records") { return await this.#settleRecords(request.operationId, request.expectedIntentSha256); }
      if (request.action === "cleanup-unlaunched") { return await this.#cleanupUnlaunched(request.operationId, request.expectedIntentSha256); }
      if (request.action === "cleanup-no-process") { return await this.#cleanupNoProcess(request.operationId, request.expectedIntentSha256); }
      return await this.#cleanup(request);
    } finally { this.#busy = false; }
  }

  public hasActiveReservation(): boolean { return this.#lease !== null; }

  #assertOwner(retained: Retained): void {
    this.#options.assertLocalAllowed();
    requireValue(this.#lease !== null, "ORIGINAL_LEASE_REQUIRED"); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    requireValue(this.#retained === retained && methods.every(name => retained.owner[name] === retained.methods[name]), "OWNER_CHANGED");
    const status = retained.methods.status.call(retained.owner);
    requireValue(retained.binding === null || canonicalJson(status.binding) === canonicalJson(retained.binding), "BINDING_CHANGED");
  }
  async #installation(retained: Retained): Promise<void> {
    this.#assertOwner(retained);
    requireValue(canonicalJson(await this.#verify(this.#options)) === retained.installation, "INSTALLATION_CHANGED");
    this.#assertOwner(retained);
  }
  async #otherLaunches(): Promise<void> {
    await assertNoUnresolvedOrdinaryLaunches(); await this.#options.assertOtherLaunchesSettled();
  }
  async #record<Key extends DiagnosticLifecycleRecordName>(operationId: string, name: Key,
    record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): Promise<void> {
    this.#retainRecord(name, record); await this.#publish(operationId, name, record);
  }
  #retainRecord<Key extends DiagnosticLifecycleRecordName>(name: Key, record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): void {
    const original = this.#pending.get(name), text = canonicalJson(record);
    requireValue(original === undefined || original === text, "PUBLICATION_PLAN_CHANGED");
    this.#pending.set(name, text);
  }
  #assertAttempt(operationId: string, intentSha256: string): Attempt {
    this.#options.assertLocalAllowed();
    const attempt = this.#attempt;
    requireValue(attempt !== null && attempt.operationId === operationId && attempt.intentSha256 === intentSha256 && this.#lease !== null, "ORIGINAL_ATTEMPT_REQUIRED");
    assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    if (this.#retained !== null) { this.#assertOwner(this.#retained); }
    return attempt;
  }
  /** Re-publish only the original in-memory bytes when absent; an existing
   * complete record must match exactly. No helper/native operation is called. */
  async #settleRecords(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    this.#assertAttempt(operationId, intentSha256);
    for (const [name, text] of this.#pending) {
      const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertAttempt(operationId, intentSha256);
      const operation = operations.find(value => value.operationId === operationId);
      requireValue(operation !== undefined, "RESERVATION_MISSING");
      requireValue(Object.keys(operation.records).every(key => [...this.#pending].some(([known, value]) =>
        known === key && canonicalJson(operation.records[known]) === value)), "JOURNAL_CHANGED");
      const existing = operation.records[name];
      if (existing === undefined) {
        const parsed = diagnosticLifecycleRecordSchemas[name].parse(JSON.parse(text) as unknown);
        await this.#publish(operationId, name, parsed); this.#assertAttempt(operationId, intentSha256);
      } else { requireValue(canonicalJson(existing) === text, "JOURNAL_CHANGED"); }
    }
    const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertAttempt(operationId, intentSha256);
    const operation = operations.find(value => value.operationId === operationId);
    requireValue(operation !== undefined, "RESERVATION_MISSING");
    requireValue(Object.keys(operation.records).length === this.#pending.size && [...this.#pending].every(([name, text]) =>
      canonicalJson(operation.records[name]) === text), "JOURNAL_CHANGED");
    if (operation.records["released.json"] !== undefined || operation.records["not-dispatched.json"] !== undefined ||
        operation.records["no-process-released.json"] !== undefined) {
      this.#releaseLease();
    }
    return describe(operationId, operation);
  }
  #releaseLease(): void {
    requireValue(this.#lease !== null, "ORIGINAL_LEASE_REQUIRED");
    releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null;
  }
  async #cleanupUnlaunched(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    const attempt = this.#assertAttempt(operationId, intentSha256);
    requireValue(!attempt.launchInvoked && (!attempt.allocationInvoked || this.#retained !== null), "NONDISPATCH_NOT_PROVED");
    const settled = await this.#settleRecords(operationId, intentSha256);
    if (settled["state"] === "not-dispatched") { return settled; }
    this.#assertAttempt(operationId, intentSha256);
    const retained = this.#retained;
    if (retained !== null) {
      const status = retained.methods.status.call(retained.owner);
      requireValue(!status.launchConsumed && status.binding === null && !status.released, "NONDISPATCH_NOT_PROVED");
    }
    const existing = this.#pending.get("unlaunched-release-intent.json");
    const intent: NonNullable<DiagnosticLifecycleRecords["unlaunched-release-intent.json"]> = existing === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-unlaunched-release-intent.v1", operationId, createdAt: new Date().toISOString(),
      intentSha256, nativeLaunchInvoked: false, helperAllocated: retained !== null,
    } : diagnosticLifecycleRecordSchemas["unlaunched-release-intent.json"].parse(JSON.parse(existing) as unknown);
    if (existing === undefined) { await this.#record(operationId, "unlaunched-release-intent.json", intent); }
    this.#assertAttempt(operationId, intentSha256); requireValue(!this.#unlaunchedInvoked, "UNLAUNCHED_RELEASE_CONSUMED");
    if (retained !== null) {
      this.#unlaunchedInvoked = true; await retained.methods.releaseUnlaunched.call(retained.owner); this.#assertOwner(retained);
      const status = retained.methods.status.call(retained.owner);
      requireValue(status.released && status.helperClosed && status.failure === null && !status.launchConsumed && status.binding === null, "UNLAUNCHED_RELEASE_UNCONFIRMED");
    }
    const record: NonNullable<DiagnosticLifecycleRecords["not-dispatched.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-not-dispatched.v1", operationId, createdAt: new Date().toISOString(),
      unlaunchedReleaseIntentSha256: sha256Json(intent), nativeLaunchInvoked: false, helperReleased: retained !== null,
    };
    await this.#record(operationId, "not-dispatched.json", record); this.#releaseLease();
    const operations = await readCurrentPcbDiagnosticLifecycles();
    return describe(operationId, operations.find(value => value.operationId === operationId));
  }
  async #cleanupNoProcess(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    const attempt = this.#assertAttempt(operationId, intentSha256), retained = this.#retained;
    requireValue(attempt.launchInvoked && retained !== null && retained.binding === null, "ORIGINAL_ROOTLESS_OWNER_REQUIRED");
    const settled = await this.#settleRecords(operationId, intentSha256);
    if (settled["state"] === "no-process-released") { return settled; }
    this.#assertAttempt(operationId, intentSha256); requireValue(!this.#noProcessInvoked, "NO_PROCESS_RELEASE_CONSUMED");
    const healthy = (): void => {
      this.#assertOwner(retained);
      const status = retained.methods.status.call(retained.owner);
      requireValue(status.noProcessCleanupAvailable && status.failure === null && status.binding === null &&
        !status.busy && !status.released && !status.helperClosed, "NO_PROCESS_RELEASE_UNAVAILABLE");
    };
    healthy();
    const original = this.#pending.get("no-process-release-intent.json");
    const intent: NonNullable<DiagnosticLifecycleRecords["no-process-release-intent.json"]> = original === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-no-process-release-intent.v1", operationId, createdAt: new Date().toISOString(),
      intentSha256, originalLaunchMethodInvoked: true,
    } : diagnosticLifecycleRecordSchemas["no-process-release-intent.json"].parse(JSON.parse(original) as unknown);
    if (original === undefined) { await this.#record(operationId, "no-process-release-intent.json", intent); }
    const operations = await readCurrentPcbDiagnosticLifecycles(); healthy();
    const operation = operations.find(value => value.operationId === operationId);
    requireValue(operation !== undefined && Object.keys(operation.records).length === this.#pending.size &&
      [...this.#pending].every(([name, text]) => canonicalJson(operation.records[name]) === text), "PUBLICATION_UNSETTLED");
    this.#noProcessInvoked = true;
    const proof = diagnosticLifecycleNoProcessReleaseProofSchema.parse(await retained.methods.releaseNoProcess.call(retained.owner));
    this.#assertOwner(retained);
    const status = retained.methods.status.call(retained.owner);
    requireValue(status.released && status.helperClosed && status.failure === null && status.binding === null, "NO_PROCESS_RELEASE_UNCONFIRMED");
    const record: NonNullable<DiagnosticLifecycleRecords["no-process-released.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-no-process-released.v1", operationId, createdAt: new Date().toISOString(),
      noProcessReleaseIntentSha256: sha256Json(intent), proof,
    };
    this.#retainRecord("no-process-released.json", record);
    await assertSnapshot(operations); this.#assertOwner(retained);
    await this.#publish(operationId, "no-process-released.json", record);
    const completed = { ...operation, records: { ...operation.records, "no-process-released.json": record } };
    await assertSnapshot(operations.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
    this.#releaseLease(); return describe(operationId, completed);
  }
  async #launch(request: Extract<Request, { action: "launch" }>): Promise<Record<string, unknown>> {
    requireValue(!this.#launchAttempted && this.#retained === null, "LAUNCH_CONSUMED");
    await this.#options.assertAllowed(); await this.#otherLaunches();
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    const before = await readCurrentPcbDiagnosticLifecycles();
    requireValue(!before.some(value => value.operationId === request.operationId), "OPERATION_CONSUMED");
    const installation = await this.#verify(this.#options);
    diagnosticLifecycleDigestSchema.parse(installation.facadeSha256);
    const executable = installation.plan.files[0]; requireValue(executable !== undefined, "EXECUTABLE_MISSING");
    const installationText = canonicalJson(installation);
    await assertSnapshot(before); await this.#otherLaunches();
    // Reserve before helper allocation. Even failure creating/syncing the intent
    // Can leave a durable reservation and never permits another attempt.
    this.#launchAttempted = true;
    await reserveCurrentPcbDiagnosticLifecycle(request.operationId);
    const intent: NonNullable<DiagnosticLifecycleRecords["intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
      confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
    };
    this.#attempt = { operationId: request.operationId, intentSha256: sha256Json(intent), allocationInvoked: false, launchInvoked: false };
    await this.#record(request.operationId, "intent.json", intent);
    const expected = [...before, { operationId: request.operationId, records: { "intent.json": intent } }]
      .toSorted((left, right) => left.operationId.localeCompare(right.operationId));
    await assertSnapshot(expected);
    this.#attempt.allocationInvoked = true;
    const owner = await this.#allocate(this.#options);
    // Capture original identities; calls below always use the original receiver.
    const captured = Object.freeze({ launch: owner.launch, status: owner.status, observeApplicationWindow: owner.observeApplicationWindow,
      requestNormalClose: owner.requestNormalClose, observeTermination: owner.observeTermination, releaseClosed: owner.releaseClosed,
      releaseUnlaunched: owner.releaseUnlaunched, releaseNoProcess: owner.releaseNoProcess,
      browserObservation: owner.browserObservation, inspectFrames: owner.inspectFrames, inspectScript: owner.inspectScript,
      inspectWorkers: owner.inspectWorkers, inspectWorkerScript: owner.inspectWorkerScript, observeWorkerState: owner.observeWorkerState,
      observeModelState: owner.observeModelState, openProject: owner.openProject,
      openPcb: owner.openPcb, observePcbOpening: owner.observePcbOpening });
    const retained: Retained = { operationId: request.operationId, owner, methods: captured, installation: installationText,
      intentSha256: sha256Json(intent), binding: null };
    this.#retained = retained;
    await this.#installation(retained); await this.#options.assertAllowed(); await this.#otherLaunches();
    await assertSnapshot(expected); this.#assertOwner(retained);
    let acknowledged = false; let failure: unknown;
    try {
      this.#attempt.launchInvoked = true;
      retained.binding = diagnosticLifecycleBindingSchema.parse(await captured.launch.call(owner, {
        executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true,
      }));
      this.#assertOwner(retained); requireValue(retained.binding.rootCreated !== "0", "CLEANUP_ONLY"); acknowledged = true;
    } catch (error) {
      failure = error;
      this.#assertOwner(retained);
      const binding = captured.status.call(owner).binding;
      if (binding !== null) { retained.binding = diagnosticLifecycleBindingSchema.parse(binding); }
    }
    if (retained.binding !== null) {
      const record: NonNullable<DiagnosticLifecycleRecords["binding.json"]> = {
        schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: retained.intentSha256, binding: retained.binding, launchAcknowledged: acknowledged,
      };
      try {
        await assertSnapshot(expected); this.#assertOwner(retained);
        await this.#record(request.operationId, "binding.json", record);
        const updated = { operationId: request.operationId, records: { "intent.json": intent, "binding.json": record } };
        await assertSnapshot(expected.map(value => value.operationId === request.operationId ? updated : value));
      }
      catch (error) { if (failure !== undefined) { throw new AggregateError([failure, error], "PCB_DIAGNOSTIC_LIFECYCLE_BINDING_PUBLICATION", { cause: error }); } throw error; }
      this.#assertOwner(retained);
    }
    if (!acknowledged) { throw failure instanceof Error ? failure : new Error("PCB_DIAGNOSTIC_LIFECYCLE_LAUNCH_UNACKNOWLEDGED", { cause: failure }); }
    const completed = await readCurrentPcbDiagnosticLifecycles();
    return describe(request.operationId, completed.find(value => value.operationId === request.operationId));
  }

  async #cleanup(request: CleanupRequest): Promise<Record<string, unknown>> {
    const operations = await readCurrentPcbDiagnosticLifecycles();
    const operation = operations.find(value => value.operationId === request.operationId);
    const binding = operation?.records["binding.json"], retained = this.#retained;
    requireValue(retained !== null && retained.operationId === request.operationId && operation !== undefined && binding !== undefined &&
      binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
      sha256Json(binding) === request.expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
    // Installation is startup admission, not permission to strand original
    // Handles. The native owner still checks its retained helper on cleanup.
    this.#assertOwner(retained);
    await assertSnapshot(operations); this.#assertOwner(retained);
    if (request.action === "open-project") { return this.#openProject(request, operation, operations, retained); }
    if (request.action === "open-pcb") { return this.#openPcb(request, operation, operations, retained); }
    if (request.action === "browser-observation" || request.action === "inspect-frames" || request.action === "inspect-script" ||
        request.action === "inspect-workers" || request.action === "inspect-worker-script" || request.action === "observe-worker-state" ||
        request.action === "observe-model-state" || request.action === "observe-pcb-opening") {
      return this.#observe(request, operation, operations, retained);
    }
    if (request.action === "observe-window") {
      requireValue(operation.records["terminated.json"] === undefined, "ALREADY_TERMINATED");
      const hwnd = await retained.methods.observeApplicationWindow.call(retained.owner);
      this.#assertOwner(retained); await assertSnapshot(operations);
      return { ...describe(request.operationId, operation), hwnd: diagnosticLifecycleWindowSchema.nullable().parse(hwnd) };
    }
    if (request.action === "normal-close") { return this.#close(request, operation, operations, retained); }
    if (request.action === "release-closed") { return this.#release(operation, operations, retained); }
    if (operation.records["terminated.json"] !== undefined) { return describe(request.operationId, operation); }
    const terminated = await retained.methods.observeTermination.call(retained.owner);
    this.#assertOwner(retained); await assertSnapshot(operations);
    requireValue(typeof terminated === "boolean", "TERMINATION_REPLY");
    if (!terminated) { return { ...describe(request.operationId, operation), terminationObserved: false }; }
    const record: NonNullable<DiagnosticLifecycleRecords["terminated.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-terminated.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, originalRootExited: true, originalJobEmpty: true,
    };
    await this.#record(request.operationId, "terminated.json", record); this.#assertOwner(retained);
    return describe(request.operationId, { ...operation, records: { ...operation.records, "terminated.json": record } });
  }
  async #close(request: Extract<CleanupRequest, { action: "normal-close" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "CLOSE_CONSUMED");
    requireValue(await retained.methods.observeApplicationWindow.call(retained.owner) === request.hwnd, "WINDOW_CHANGED");
    this.#assertOwner(retained); await assertSnapshot(operations);
    const intent: NonNullable<DiagnosticLifecycleRecords["close-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-close-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, hwnd: request.hwnd, confirmNormalClose: true,
    };
    this.#closeAttempted = true; await this.#record(request.operationId, "close-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "close-intent.json": intent } };
    this.#options.assertLocalAllowed();
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    await retained.methods.requestNormalClose.call(retained.owner, request.hwnd); this.#assertOwner(retained);
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    const acknowledged: NonNullable<DiagnosticLifecycleRecords["close-acknowledged.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-close-acknowledged.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      closeIntentSha256: sha256Json(intent), acknowledged: true, terminationProved: false,
    };
    await this.#record(request.operationId, "close-acknowledged.json", acknowledged);
    return describe(request.operationId, { ...updated, records: { ...updated.records, "close-acknowledged.json": acknowledged } });
  }
  async #observe(request: ObservationRequest, operation: DiagnosticLifecycleOperation, operations: readonly DiagnosticLifecycleOperation[],
    retained: Retained): Promise<Record<string, unknown>> {
    let stage: ObservationStage = "browser";
    if (request.action === "inspect-frames") { stage = "frames"; }
    if (request.action === "inspect-script") { stage = "script"; }
    if (request.action === "inspect-workers") { stage = "workers"; }
    if (request.action === "inspect-worker-script") { stage = "worker-script"; }
    if (request.action === "observe-worker-state") { stage = "worker-state"; }
    if (request.action === "observe-model-state") { stage = "model-state"; }
    if (request.action === "observe-pcb-opening") { stage = "pcb-opening"; }
    requireValue(operation.records["binding.json"]?.launchAcknowledged === true && retained.binding?.rootCreated !== "0" &&
      operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "OBSERVATION_UNAVAILABLE");
    requireValue(!this.#observationConsumed.has(stage) && operation.records[`${stage}-intent.json`] === undefined, "OBSERVATION_CONSUMED");
    requireValue(stage !== "frames" || operation.records["browser-result.json"] !== undefined, "BROWSER_OBSERVATION_REQUIRED");
    requireValue(stage !== "script" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "workers" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-script" || operation.records["workers-result.json"] !== undefined, "WORKER_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-state" || operation.records["worker-script-result.json"] !== undefined, "WORKER_SOURCE_REQUIRED");
    if (stage === "model-state") {
      const originalScript = this.#observations.get("script"), script = operation.records["script-result.json"];
      const originalPcb = this.#observations.get("pcb-opening"), pcb = operation.records["pcb-opening-result.json"];
      const originalSource = script !== undefined && originalScript !== undefined && originalScript["family"] === "pcb" &&
        originalScript["sourceVerified"] === true && canonicalJson(script.result) === canonicalJson(originalScript) &&
        this.#pending.get("script-result.json") === canonicalJson(script);
      const openedSource = originalPcb !== undefined && pcb !== undefined && originalPcb["family"] === "pcb" &&
        this.#projectPreparation !== null && diagnosticPcbOpeningSourceAccepted(originalPcb, this.#projectPreparation.sealedTarget) &&
        canonicalJson(pcb.result) === canonicalJson(originalPcb) && this.#pending.get("pcb-opening-result.json") === canonicalJson(pcb);
      requireValue(originalSource || openedSource, "ORIGINAL_PCB_SOURCE_REQUIRED");
    }
    if (stage === "workers") {
      requireValue(!this.#pcbOpeningAttempted && operation.records["pcb-open-intent.json"] === undefined, "PCB_BRANCH_SELECTED");
    }
    if (stage === "pcb-opening") {
      this.#originalProjectOpening(operation);
      const opened = operation.records["pcb-open-result.json"];
      requireValue(this.#pcbOpeningResult !== null && this.#pcbOpeningResult["ok"] === true &&
        this.#pcbOpeningResult["status"] === "opened" && this.#pcbOpeningResult["failure"] === null &&
        opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#pcbOpeningResult) &&
        this.#pending.get("pcb-open-result.json") === canonicalJson(opened), "PCB_OPENING_UNCONFIRMED");
      requireValue(!this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined, "WORKER_BRANCH_SELECTED");
    }
    if (stage === "workers" && (this.#openingAttempted || operation.records["project-opening-intent.json"] !== undefined)) {
      const opened = operation.records["project-opening-result.json"];
      requireValue(this.#openingResult !== null && this.#openingResult["ok"] === true &&
        this.#openingResult["status"] === "opened-prefix-observed" && this.#openingResult["failure"] === null &&
        opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#openingResult) &&
        this.#pending.get("project-opening-result.json") === canonicalJson(opened), "PROJECT_OPENING_UNCONFIRMED");
    }
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["browser-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, stage,
      ...(request.action === "inspect-frames" || request.action === "inspect-worker-script" ? { targetId: request.targetId } : {}),
      ...(request.action === "inspect-script" ? { frameId: request.frameId, family: request.family } : {}),
    };
    this.#observationConsumed.add(stage); await this.#record(request.operationId, `${stage}-intent.json`, intent);
    const updated = { ...operation, records: { ...operation.records, [`${stage}-intent.json`]: intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let result: Readonly<Record<string, unknown>>;
    if (request.action === "browser-observation") { result = await retained.methods.browserObservation.call(retained.owner); }
    else if (request.action === "inspect-frames") { result = await retained.methods.inspectFrames.call(retained.owner, request.targetId); }
    else if (request.action === "inspect-script") { result = await retained.methods.inspectScript.call(retained.owner, request.frameId, CURRENT_PCB_DIAGNOSTIC_SCRIPTS[request.family]); }
    else if (request.action === "inspect-workers") { result = await retained.methods.inspectWorkers.call(retained.owner); }
    else if (request.action === "inspect-worker-script") { result = await retained.methods.inspectWorkerScript.call(retained.owner, request.targetId); }
    else if (request.action === "observe-model-state") { result = await retained.methods.observeModelState.call(retained.owner); }
    else if (request.action === "observe-pcb-opening") {
      const preparation = this.#originalProjectOpening(operation);
      result = await retained.methods.observePcbOpening.call(retained.owner, preparation.sealedTarget, CURRENT_PCB_DIAGNOSTIC_SCRIPTS.pcb);
    }
    else { result = await retained.methods.observeWorkerState.call(retained.owner); }
    // Preserve the original observation before validation/publication can fail.
    this.#observations.set(stage, result);
    requireValue(Buffer.byteLength(canonicalJson(result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "OBSERVATION_BOUND");
    const record: NonNullable<DiagnosticLifecycleRecords["browser-result.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      intentSha256: sha256Json(intent), stage, result: structuredClone(result), executionAuthorized: false,
    };
    this.#retainRecord(`${stage}-result.json`, record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, `${stage}-result.json`, record);
    const completed = { ...updated, records: { ...updated.records, [`${stage}-result.json`]: record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, operation), stage, result: record.result };
  }
  async #openProject(request: Extract<CleanupRequest, { action: "open-project" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#openingAttempted && operation.records["project-opening-intent.json"] === undefined, "PROJECT_OPENING_CONSUMED");
    requireValue(operation.records["binding.json"]?.launchAcknowledged === true && retained.binding?.rootCreated !== "0" &&
      !this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
      !this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined, "PROJECT_OPENING_UNAVAILABLE");
    const originalScript = this.#observations.get("script"), script = operation.records["script-result.json"];
    requireValue(script !== undefined && originalScript !== undefined && originalScript["family"] === "ui" &&
      originalScript["sourceVerified"] === true && canonicalJson(script.result) === canonicalJson(originalScript) &&
      this.#pending.get("script-result.json") === canonicalJson(script), "ORIGINAL_UI_SOURCE_REQUIRED");
    // Consume before checkpoint or installation work. Failure can preserve a
    // Backup or an uncertain durable intent; neither grants a retry.
    this.#openingAttempted = true;
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const target = Object.freeze(structuredClone(request.target));
    const prepared = await this.#prepareCheckpoint(target);
    const preparedText = canonicalJson(prepared);
    requireValue(prepared.targetEvidence.projectUuid === target.projectUuid && prepared.targetEvidence.documentUuid === target.documentUuid &&
      prepared.targetEvidence.docType === "PCB" && prepared.targetEvidence.sourceSha256 === target.expectedSourceSha256, "PROJECT_CHECKPOINT_BINDING");
    const sealedTarget = Object.freeze(currentDisposableOpenSealedTargetSchema.parse({ ...target, branchUuid: prepared.targetEvidence.branchUuid }));
    this.#projectPreparation = Object.freeze({ sealedTarget, prepared, preparedText, originalTarget: target });
    const preparationCheckpoint = currentDisposableOpenPreparationCheckpointSchema.parse(prepared.preparationCheckpoint);
    await this.#verifyCheckpoint(prepared, target);
    requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["project-opening-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-project-opening-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256, scriptResultSha256: sha256Json(script),
      target: sealedTarget, preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint),
      confirmDisposableProject: true, acceptNormalOpenEffects: true,
    };
    await this.#record(request.operationId, "project-opening-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "project-opening-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let reverificationAttempted = false, reverified = false;
    const result = await retained.methods.openProject.call(retained.owner, sealedTarget, async () => {
      requireValue(!reverificationAttempted, "PROJECT_REVERIFICATION_CONSUMED"); reverificationAttempted = true;
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#verifyCheckpoint(prepared, target);
      requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      reverified = true;
    });
    // Keep the exact decoded reply even when final owner checks or publication
    // Fail. This result is never a writer token or evidence of full restoration.
    this.#openingResult = result;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "PROJECT_OPENING_BOUND");
    requireValue(!result.ok || reverified, "PROJECT_REVERIFICATION_REQUIRED");
    const record: NonNullable<DiagnosticLifecycleRecords["project-opening-result.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-project-opening-result.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
    };
    this.#retainRecord("project-opening-result.json", record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "project-opening-result.json", record);
    const completed = { ...updated, records: { ...updated.records, "project-opening-result.json": record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), projectOpeningResultRetained: true, result: record.result, preparationCheckpoint };
  }
  #originalProjectOpening(operation: DiagnosticLifecycleOperation): ProjectPreparation {
    const intent = operation.records["project-opening-intent.json"], opened = operation.records["project-opening-result.json"];
    const preparation = this.#projectPreparation;
    requireValue(preparation !== null && this.#openingResult !== null && this.#openingResult["ok"] === true &&
      this.#openingResult["status"] === "opened-prefix-observed" && this.#openingResult["failure"] === null &&
      opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#openingResult) &&
      this.#pending.get("project-opening-result.json") === canonicalJson(opened) && intent !== undefined &&
      this.#pending.get("project-opening-intent.json") === canonicalJson(intent) &&
      canonicalJson(intent.target) === canonicalJson(preparation.sealedTarget), "PROJECT_OPENING_UNCONFIRMED");
    return preparation;
  }
  async #openPcb(request: Extract<CleanupRequest, { action: "open-pcb" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#pcbOpeningAttempted && operation.records["pcb-open-intent.json"] === undefined, "PCB_OPENING_CONSUMED");
    const preparation = this.#originalProjectOpening(operation);
    requireValue(!this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
      !this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined &&
      !this.#observationConsumed.has("model-state") && operation.records["model-state-intent.json"] === undefined, "PCB_OPENING_UNAVAILABLE");
    this.#pcbOpeningAttempted = true;
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["pcb-open-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-pcb-open-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256,
      projectOpeningIntentSha256: sha256Json(operation.records["project-opening-intent.json"]),
      projectOpeningResultSha256: sha256Json(operation.records["project-opening-result.json"]), acceptNormalOpenEffects: true,
    };
    await this.#record(request.operationId, "pcb-open-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "pcb-open-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let reverificationAttempted = false, reverified = false;
    const result = await retained.methods.openPcb.call(retained.owner, preparation.sealedTarget, async () => {
      requireValue(!reverificationAttempted, "PCB_REVERIFICATION_CONSUMED"); reverificationAttempted = true;
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      requireValue(this.#projectPreparation === preparation && canonicalJson(preparation.prepared) === preparation.preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget);
      requireValue(canonicalJson(preparation.prepared) === preparation.preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained); reverified = true;
    });
    this.#pcbOpeningResult = result;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "PCB_OPENING_BOUND");
    requireValue(!result.dispatchAttempted || reverified, "PCB_REVERIFICATION_REQUIRED");
    const record: NonNullable<DiagnosticLifecycleRecords["pcb-open-result.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-pcb-open-result.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
    };
    this.#retainRecord("pcb-open-result.json", record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "pcb-open-result.json", record);
    const completed = { ...updated, records: { ...updated.records, "pcb-open-result.json": record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), pcbOpeningResultRetained: true, result: record.result };
  }
  async #release(operation: DiagnosticLifecycleOperation, operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    const termination = operation.records["terminated.json"];
    requireValue(termination !== undefined && !this.#releaseInvoked, "RELEASE_UNAVAILABLE");
    requireValue([...this.#pending].every(([name, text]) => canonicalJson(operation.records[name]) === text), "PUBLICATION_UNSETTLED");
    const original = this.#pending.get("release-intent.json");
    requireValue(!this.#releaseAttempted || original !== undefined && canonicalJson(operation.records["release-intent.json"]) === original, "RELEASE_INTENT_UNSETTLED");
    const intent: NonNullable<DiagnosticLifecycleRecords["release-intent.json"]> = original === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-release-intent.v1", operationId: operation.operationId,
      createdAt: new Date().toISOString(), terminationSha256: sha256Json(termination),
    } : diagnosticLifecycleRecordSchemas["release-intent.json"].parse(JSON.parse(original) as unknown);
    this.#releaseAttempted = true;
    if (original === undefined) { await this.#record(operation.operationId, "release-intent.json", intent); }
    const updated = { ...operation, records: { ...operation.records, "release-intent.json": intent } };
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    this.#releaseInvoked = true; await retained.methods.releaseClosed.call(retained.owner); this.#assertOwner(retained);
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    const status = retained.methods.status.call(retained.owner);
    requireValue(status.released && status.helperClosed && status.failure === null, "RELEASE_UNCONFIRMED");
    const released: NonNullable<DiagnosticLifecycleRecords["released.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-released.v1", operationId: operation.operationId,
      createdAt: new Date().toISOString(), releaseIntentSha256: sha256Json(intent), released: true,
    };
    await this.#record(operation.operationId, "released.json", released); this.#releaseLease();
    return describe(operation.operationId, { ...updated, records: { ...updated.records, "released.json": released } });
  }
}
