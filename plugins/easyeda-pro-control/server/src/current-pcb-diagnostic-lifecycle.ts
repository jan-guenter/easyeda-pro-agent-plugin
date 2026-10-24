/** Original-owner validation lifecycle with one checkpoint-bound disposable
 * opening. No generic debugger command, CAD writer or historical owner recreation. */
/* oxlint-disable max-classes-per-file, import/max-dependencies -- Four fixed facades share one private cleanup/journal core; keeping the purpose selector unexported prevents a caller-selectable upgrade API. */
import type { z } from "zod";
import { join } from "node:path";
import { controlDataDirectory } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { prepareCurrentDisposableOpenCheckpoint, readCurrentPcbCommonOpenInventory, verifyCurrentDisposableOpenCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { startCurrentPcb209DiagnosticOwner, startCurrentPcbDiagnosticOwner, startCurrentPcbStringPrecreateOwner, startCurrentPcbWorkerStartupOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentPcbDiagnosticOwner, CurrentPcbStringPrecreateOwner, CurrentPcbWorkerStartupHandoff, CurrentPcbWorkerStartupOwner } from "./current-pcb-diagnostic-owner.ts";
import { verifyCurrentPcb209DiagnosticInstallation, verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_DIAGNOSTIC_SCRIPTS } from "./current-pcb-diagnostic-profile.ts";
import { CURRENT_PCB_209_OPENING_PROFILE, CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { currentPcb209OpeningRequestSchema } from "./current-pcb-209-opening-validation.ts";
import type { CurrentPcb209OpeningRequest } from "./current-pcb-209-opening-validation.ts";
import { CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-primitives.ts";
import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-extended-primitives.ts";
import { CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES } from "./current-pcb-209-image-shapes.ts";
import { CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES } from "./current-pcb-209-arc-shapes.ts";
import { CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES } from "./current-pcb-209-poured-shapes.ts";
import { CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES } from "./current-pcb-209-pad-shapes.ts";
import { CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES } from "./current-pcb-209-selection-relations.ts";
import { queryCurrentPcb209Observation } from "./current-pcb-209-observation-query.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "./current-pcb-diagnostic-validation.ts";
import type { CurrentPcbDiagnosticValidationRequest as Request } from "./current-pcb-diagnostic-validation.ts";
import { CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX, currentPcbStringPrecreateRequestSchema, currentPcbStringPrecreateStages } from "./current-pcb-string-precreate-validation.ts";
import type { CurrentPcbStringPrecreateRequest } from "./current-pcb-string-precreate-validation.ts";
import { DIAGNOSTIC_OBSERVATION_MAX_BYTES, STRING_PRECREATE_OBSERVATION_MAX_BYTES, acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLifecycleSnapshot,
  assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleBindingSchema,
  diagnosticLifecycleDigestSchema, diagnosticLifecycleNoProcessReleaseProofSchema, diagnosticLifecycleRecordSchemas, diagnosticLifecycleWindowSchema,
  diagnosticObservationStageSchema, diagnosticPcbOpeningSourceAccepted, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles, releaseCurrentPcbDiagnosticLaunchExclusion,
  reserveCurrentPcbDiagnosticLifecycle, stringPrecreateObservationResultSchema, stringPrecreateTargetMatches } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease, CurrentPcbDiagnosticLifecyclePurpose, DiagnosticLifecycleBinding, DiagnosticLifecycleOperation, DiagnosticLifecycleRecordName, DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { currentPcbObservationFailureDetail } from "./current-pcb-observation-failure.ts";
import { currentPcbCommonBaselineFailureSchema, currentPcbCommonBaselineFailureSummary, currentPcbCommonBaselineResultSchema } from "./current-pcb-common-baseline-validation.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { CurrentPcbWorkerStartupOpening } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningResult } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerStartupActorPacket } from "./current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import { CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX, currentPcbWorkerStartupCaptureRequestSchema,
  currentPcbWorkerStartupLifecycleIdSchema, currentPcbWorkerStartupLifecycleRequestSchema } from "./current-pcb-worker-startup-validation.ts";

type LifecycleRequest = Request | CurrentPcbStringPrecreateRequest | CurrentPcb209OpeningRequest;
const startupStages = ["browser", "frames", "script"] as const;
const launchPurposeFields = {
  diagnostic: { schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" },
  "string-precreate": { schema: "easyeda-pro-control.pcb-string-precreate-launch-intent.v1", purpose: "string-precreate" },
  "worker-startup": { schema: "easyeda-pro-control.pcb-worker-startup-launch-intent.v1", purpose: "worker-startup" },
} as const;
const startupCaptureInputSchema = currentPcbWorkerStartupCaptureRequestSchema.omit({ action: true, operationId: true, expectedBindingSha256: true });
const startupOpeningMethods = ["open", "status", "retainedOpeningResult", "requireOriginal", "proveCurrentAssignments", "requireCurrentAssignments",
  "retainedActorObservation", "observeActorClock", "requireActorClock", "retainedChannelObservation", "observeCurrentChannel", "requireCurrentChannel",
  "releaseAfterTermination"] as const;
export type CurrentPcbWorkerStartupOpeningCoordinator = Pick<CurrentPcbWorkerStartupOpening, (typeof startupOpeningMethods)[number]>;
type CleanupRequest = Exclude<LifecycleRequest, { action: "launch" | "inspect" | "query-observation" | "settle-records" | "cleanup-unlaunched" | "cleanup-no-process" }>;
type ObservationRequest = Extract<LifecycleRequest, { action: "browser-observation" | "inspect-frames" | "inspect-script" | "inspect-workers" | "inspect-worker-script" | "observe-worker-state" | "observe-model-state" | "observe-pcb-opening" | "observe-string-precreate" | "observe-layers" | "observe-primitives" | "observe-extended-primitives" | "observe-selection-relations" | "observe-pad-shapes" | "observe-image-shapes" | "observe-arc-shapes" | "observe-poured-shapes" }>;
type ObservationStage = z.infer<typeof diagnosticObservationStageSchema> | "common-baseline" | "string-precreate" | "layers209" | "primitives209" | "extended-primitives209" | "selection-relations209" | "pad-shapes209" | "image-shapes209" | "arc-shapes209" | "poured-shapes209";
const methods = ["launch", "status", "observeApplicationWindow", "requestNormalClose", "observeTermination", "releaseClosed", "releaseUnlaunched",
  "releaseNoProcess", "browserObservation", "inspectFrames", "inspectScript", "inspectWorkers", "inspectWorkerScript", "observeWorkerState", "observeModelState", "openProject",
  "openPcb", "observePcbOpening"] as const;
export type CurrentPcbDiagnosticLifecycleOwner = Pick<CurrentPcbDiagnosticOwner, (typeof methods)[number]> &
  Partial<Pick<CurrentPcbDiagnosticOwner, "observeLayers209" | "observePrimitives209" | "observeExtendedPrimitives209" | "observeSelectionRelations209" | "observePadShapes209" | "observeImageShapes209" | "observeArcShapes209" | "observePouredShapes209">>;
type StringOwnerMethods = Pick<CurrentPcbStringPrecreateOwner, "observeStringPrecreate" | "observeCommonBaseline" | "retainedCommonBaselineFailure">;
type StartupOwnerMethods = Pick<CurrentPcbWorkerStartupOwner, "handoffWorkerStartup">;
export type CurrentPcbStringPrecreateLifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & StringOwnerMethods;
export type CurrentPcbWorkerStartupLifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & StartupOwnerMethods;
type LifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & Partial<StringOwnerMethods & StartupOwnerMethods>;
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
export interface CurrentPcbStringPrecreateLifecycleDependencies extends Omit<CurrentPcbDiagnosticLifecycleDependencies, "allocateOwner"> {
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbStringPrecreateLifecycleOwner>;
  readonly readCommonInventory?: typeof readCurrentPcbCommonOpenInventory;
}
export interface CurrentPcbWorkerStartupLifecycleDependencies extends Omit<CurrentPcbDiagnosticLifecycleDependencies, "allocateOwner"> {
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbWorkerStartupLifecycleOwner>;
  readonly readCommonInventory?: typeof readCurrentPcbCommonOpenInventory;
  readonly createStartupOpening?: (handoff: CurrentPcbWorkerStartupHandoff) => CurrentPcbWorkerStartupOpeningCoordinator;
}
interface Retained {
  readonly operationId: string;
  readonly owner: LifecycleOwner;
  readonly methods: LifecycleOwner;
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
  readonly commonInventory: Awaited<ReturnType<typeof readExactSqlInventory>> | null;
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
    workerStartupHandoffAttemptConsumed: records?.["worker-startup-handoff-intent.json"] !== undefined,
    workerStartupHandoffResultPublished: records?.["worker-startup-handoff-result.json"] !== undefined,
    workerStartupOpeningAttemptConsumed: records?.["worker-startup-opening-intent.json"] !== undefined,
    workerStartupOpeningResultPublished: records?.["worker-startup-opening-result.json"] !== undefined,
    workerStartupAssignmentsAttemptConsumed: records?.["worker-startup-assignments-intent.json"] !== undefined,
    workerStartupAssignmentsResultPublished: records?.["worker-startup-assignments-result.json"] !== undefined,
    workerStartupActorAttemptConsumed: records?.["worker-startup-actor-intent.json"] !== undefined,
    workerStartupActorResultPublished: records?.["worker-startup-actor-result.json"] !== undefined,
    workerStartupChannelAttemptConsumed: records?.["worker-startup-channel-intent.json"] !== undefined,
    workerStartupChannelResultPublished: records?.["worker-startup-channel-result.json"] !== undefined,
    ...(binding === undefined ? {} : { binding: binding.binding, bindingSha256: sha256Json(binding), launchAcknowledged: binding.launchAcknowledged }),
    ...claims };
}
/** V2/V3 retain up to680/712KiB on disk. Keep initial and inspect responses
 * below the facade512KiB envelope; the complete original record is unchanged. */
function publicObservationResult(operationId: string, stage: ObservationStage,
  result: Readonly<Record<string, unknown>> | undefined, published: boolean): Readonly<Record<string, unknown>> | undefined {
  if (stage !== "string-precreate" || result?.["schema"] !== "easyeda-pro-control.pcb-string-precreate-observation.v2" &&
      result?.["schema"] !== "easyeda-pro-control.pcb-string-precreate-observation.v3") { return result; }
  const value = stringPrecreateObservationResultSchema.parse(result);
  return { schema: "easyeda-pro-control.pcb-string-precreate-summary.v1", observationSchema: value.schema,
    target: value.target, matchingSamples: value.matchingSamples, originalContextsRechecked: value.originalContextsRechecked,
    summaryOnly: true, record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "string-precreate-result.json"),
      published, resultSha256: sha256Json(value), resultBytes: Buffer.byteLength(canonicalJson(value)) },
    projectWorkerAssociationVerified: false, publicationCaptureVerified: false, completeLiveSourceVerified: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
}
/** Inspection already includes parent/opening evidence. Do not duplicate the
 * complete actor packet beside its retained four native samples. */
function publicStartupActorResult(operationId: string,
  record: DiagnosticLifecycleRecords["worker-startup-actor-result.json"], published: boolean): Readonly<Record<string, unknown>> | null {
  if (record === undefined) { return null; }
  const { samples, workerUserText, ...summary } = record.result;
  return { schema: "easyeda-pro-control.pcb-worker-startup-actor-summary.v1", ...summary,
    summaryOnly: true, pointInTimeObservation: true, sampleCount: samples.length, workerUserTextSha256: sha256Text(workerUserText),
    record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "worker-startup-actor-result.json"),
      published, sha256: sha256Json(record), bytes: Buffer.byteLength(canonicalJson(record)) } };
}
function publicStartupChannelResult(operationId: string,
  record: DiagnosticLifecycleRecords["worker-startup-channel-result.json"], published: boolean): Readonly<Record<string, unknown>> | null {
  if (record === undefined) { return null; }
  const { gateReplies, ...summary } = record.result;
  return { schema: "easyeda-pro-control.pcb-worker-startup-channel-summary.v1", ...summary,
    summaryOnly: true, pointInTimeObservation: true, sampleCount: gateReplies.length,
    gateReplySha256: gateReplies.map(reply => sha256Text(reply)),
    record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "worker-startup-channel-result.json"),
      published, sha256: sha256Json(record), bytes: Buffer.byteLength(canonicalJson(record)) } };
}

/** Shared cleanup and journal machinery. Only the four fixed exported facades
 * construct it; neither public requests nor dependency seams select purpose. */
class CurrentPcbLifecycleCore {
  readonly #purpose: CurrentPcbDiagnosticLifecyclePurpose;
  readonly #generation: "206" | "209-opening";
  readonly #stringPurpose: boolean;
  readonly #stages: readonly ObservationStage[];
  readonly #options: CurrentPcbDiagnosticLifecycleOptions;
  readonly #verify: NonNullable<CurrentPcbDiagnosticLifecycleDependencies["verifyInstallation"]>;
  readonly #allocate: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<LifecycleOwner>;
  readonly #publish: typeof publishCurrentPcbDiagnosticLifecycleRecord;
  readonly #prepareCheckpoint: typeof prepareCurrentDisposableOpenCheckpoint;
  readonly #verifyCheckpoint: typeof verifyCurrentDisposableOpenCheckpoint;
  readonly #verifyHistoricalCheckpoint: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
  readonly #readCommonInventory: typeof readCurrentPcbCommonOpenInventory;
  readonly #createStartupOpening: NonNullable<CurrentPcbWorkerStartupLifecycleDependencies["createStartupOpening"]>;
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
  #startupHandoffAttempted = false;
  #startupHandoff: CurrentPcbWorkerStartupHandoff | null = null;
  #startupOpening: Readonly<{ owner: CurrentPcbWorkerStartupOpeningCoordinator; methods: CurrentPcbWorkerStartupOpeningCoordinator }> | null = null;
  #startupOpeningResult: CurrentPcbWorkerStartupOpeningResult | null = null;
  #startupOpeningReleased = false;
  #startupAssignmentsAttempted = false;
  #startupAssignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #startupActorAttempted = false;
  #startupActorPacket: CurrentPcbWorkerStartupActorPacket | null = null;
  #startupChannelAttempted = false;
  #startupChannelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;

  public constructor(options: CurrentPcbDiagnosticLifecycleOptions,
    dependencies: CurrentPcbDiagnosticLifecycleDependencies | CurrentPcbStringPrecreateLifecycleDependencies | CurrentPcbWorkerStartupLifecycleDependencies,
    purpose: CurrentPcbDiagnosticLifecyclePurpose, generation: "206" | "209-opening" = "206") {
    const stringPurpose = purpose === "string-precreate";
    requireValue(generation !== "209-opening" || purpose === "diagnostic", "GENERATION_PURPOSE");
    this.#generation = generation;
    this.#purpose = purpose;
    this.#stringPurpose = stringPurpose;
    this.#stages = generation === "209-opening" ? ["browser", "frames", "script", "pcb-opening", "layers209", "primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"] :
      { diagnostic: diagnosticObservationStageSchema.options, "string-precreate": currentPcbStringPrecreateStages,
        "worker-startup": startupStages }[purpose];
    this.#options = Object.freeze({ ...options });
    this.#verify = dependencies.verifyInstallation ?? (generation === "209-opening" ? verifyCurrentPcb209DiagnosticInstallation : verifyCurrentPcbDiagnosticInstallation);
    this.#allocate = dependencies.allocateOwner ?? (generation === "209-opening" ? startCurrentPcb209DiagnosticOwner :
      { diagnostic: startCurrentPcbDiagnosticOwner, "string-precreate": startCurrentPcbStringPrecreateOwner,
        "worker-startup": startCurrentPcbWorkerStartupOwner }[purpose]);
    this.#publish = dependencies.publishRecord ?? publishCurrentPcbDiagnosticLifecycleRecord;
    this.#prepareCheckpoint = dependencies.prepareCheckpoint ?? prepareCurrentDisposableOpenCheckpoint;
    this.#verifyCheckpoint = dependencies.verifyCheckpoint ?? verifyCurrentDisposableOpenCheckpoint;
    this.#verifyHistoricalCheckpoint = dependencies.verifyHistoricalCheckpoint ?? verifyHistoricalCurrentDisposableOpenCheckpoint;
    this.#readCommonInventory = "readCommonInventory" in dependencies ? dependencies.readCommonInventory ?? readCurrentPcbCommonOpenInventory : readCurrentPcbCommonOpenInventory;
    this.#createStartupOpening = "createStartupOpening" in dependencies && dependencies.createStartupOpening !== undefined
      ? dependencies.createStartupOpening : (handoff): CurrentPcbWorkerStartupOpeningCoordinator => new CurrentPcbWorkerStartupOpening(handoff);
  }

  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request: LifecycleRequest = this.#generation === "209-opening" ? currentPcb209OpeningRequestSchema.parse(input) :
      { diagnostic: currentPcbDiagnosticValidationRequestSchema, "string-precreate": currentPcbStringPrecreateRequestSchema,
        "worker-startup": currentPcbWorkerStartupLifecycleRequestSchema }[this.#purpose].parse(input);
    if (request.action === "query-observation") {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const record = operation?.records[`${request.observation}-result.json`];
      const opening = operation?.records["project-opening-intent.json"];
      const selection = operation?.records["selection-relations209-intent.json"];
      requireValue(record !== undefined && opening !== undefined &&
        sha256Json(record) === request.expectedResultRecordSha256, "QUERY_PUBLISHED_RESULT_REQUIRED");
      const result = queryCurrentPcb209Observation(record.result, opening.target, request.query, {
        operationId: request.operationId, stage: request.observation, resultRecordSha256: request.expectedResultRecordSha256,
        observedAt: record.createdAt,
      }, request.observation === "selection-relations209" ? selection?.componentIds : undefined);
      await assertSnapshot(operations);
      return result;
    }
    if (request.action === "inspect") {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const original = this.#retained?.operationId === request.operationId;
      const pendingIntent = this.#attempt?.operationId === request.operationId ? this.#attempt : null;
      const noProcessCleanupAvailable = original && this.#retained !== null && this.#lease !== null && !this.#noProcessInvoked &&
        this.#retained.methods.status.call(this.#retained.owner).noProcessCleanupAvailable;
      const native = original && this.#retained !== null ? this.#retained.methods.status.call(this.#retained.owner) : null;
      const pendingFailure = original ? this.#pending.get("observation-failure.json") : undefined;
      const failureRecord = pendingFailure === undefined ? operation?.records["observation-failure.json"] :
        diagnosticLifecycleRecordSchemas["observation-failure.json"].parse(JSON.parse(pendingFailure) as unknown);
      const commonPending = original ? this.#pending.get("common-baseline-failure.json") : undefined;
      const commonFailure = commonPending === undefined ? operation?.records["common-baseline-failure.json"] :
        diagnosticLifecycleRecordSchemas["common-baseline-failure.json"].parse(JSON.parse(commonPending) as unknown);
      const selectedStage = request.observation ?? this.#stages.toReversed().find(stage =>
        operation?.records[`${stage}-result.json`] !== undefined || original && this.#pending.has(`${stage}-result.json`));
      const observations = this.#stages.map(stage => {
        const record = operation?.records[`${stage}-result.json`];
        const pending = original ? this.#pending.get(`${stage}-result.json`) : undefined;
        const retained = pending === undefined ? undefined : diagnosticLifecycleRecordSchemas[`${stage}-result.json`].parse(JSON.parse(pending) as unknown);
        return { stage, consumed: operation?.records[`${stage}-intent.json`] !== undefined || original && this.#observationConsumed.has(stage),
          resultRetained: original && this.#observations.has(stage), published: record !== undefined,
          ...(record === undefined || this.#generation !== "209-opening" ||
            !["primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"].includes(stage) ? {} :
            { resultRecordSha256: sha256Json(record), observedAt: record.createdAt }),
          result: stage === selectedStage ? publicObservationResult(request.operationId, stage, (record ?? retained)?.result, record !== undefined) : undefined };
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
      const actorPending = original ? this.#pending.get("worker-startup-actor-result.json") : undefined;
      const actorPublished = operation?.records["worker-startup-actor-result.json"];
      const actorRecord = actorPending === undefined ? actorPublished :
        diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse(JSON.parse(actorPending) as unknown);
      const channelPending = original ? this.#pending.get("worker-startup-channel-result.json") : undefined;
      const channelPublished = operation?.records["worker-startup-channel-result.json"];
      const channelRecord = channelPending === undefined ? channelPublished :
        diagnosticLifecycleRecordSchemas["worker-startup-channel-result.json"].parse(JSON.parse(channelPending) as unknown);
      let openingState = openingConsumed ? "opening-unknown" : "not-attempted";
      if (openingResult !== undefined) {
        openingState = openingResult["ok"] === true && openingResult["status"] === "opened-prefix-observed" ? "opened-prefix-observed" : "refused";
      }
      return { ...describe(request.operationId, operation), busy: this.#busy, observations, noProcessCleanupAvailable,
        workerStartupHandoffAttemptConsumed: operation?.records["worker-startup-handoff-intent.json"] !== undefined || original && this.#startupHandoffAttempted,
        workerStartupHandoffRetained: original && this.#startupHandoff !== null,
        workerStartupChannel: native?.workerStartupChannel ?? null,
        workerStartupOpeningAttemptConsumed: operation?.records["worker-startup-opening-intent.json"] !== undefined ||
          original && this.#purpose === "worker-startup" && this.#openingAttempted,
        workerStartupOpeningResultRetained: original && this.#startupOpeningResult !== null,
        workerStartupOpeningState: original && this.#startupOpening !== null ? this.#startupOpening.methods.status.call(this.#startupOpening.owner) : null,
        workerStartupOpeningNativeReply: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedOpeningResult.call(this.#startupOpening.owner) : null,
        workerStartupOpeningResult: operation?.records["worker-startup-opening-result.json"]?.result ?? null,
        workerStartupAssignmentsAttemptConsumed: operation?.records["worker-startup-assignments-intent.json"] !== undefined ||
          original && this.#startupAssignmentsAttempted,
        workerStartupAssignmentsResultRetained: original && this.#startupAssignments !== null,
        workerStartupAssignmentsResult: operation?.records["worker-startup-assignments-result.json"]?.result ?? null,
        workerStartupActorAttemptConsumed: operation?.records["worker-startup-actor-intent.json"] !== undefined || original && this.#startupActorAttempted,
        workerStartupActorResultRetained: original && this.#startupActorPacket !== null,
        workerStartupActorObservation: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedActorObservation.call(this.#startupOpening.owner) : null,
        workerStartupActorResult: publicStartupActorResult(request.operationId, actorRecord, actorPublished !== undefined),
        workerStartupChannelAttemptConsumed: operation?.records["worker-startup-channel-intent.json"] !== undefined || original && this.#startupChannelAttempted,
        workerStartupChannelResultRetained: original && this.#startupChannelPacket !== null,
        workerStartupChannelObservation: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedChannelObservation.call(this.#startupOpening.owner) : null,
        workerStartupChannelResult: publicStartupChannelResult(request.operationId, channelRecord, channelPublished !== undefined),
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
        observationFailure: native?.observationFailure ?? failureRecord?.failure ?? null,
        lastTerminationObservation: native?.lastTerminationObservation ?? null,
        observationFailurePublished: operation?.records["observation-failure.json"] !== undefined,
        commonBaselineFailure: commonFailure === undefined ? null : currentPcbCommonBaselineFailureSummary(commonFailure.failure),
        commonBaselineFailurePublished: operation?.records["common-baseline-failure.json"] !== undefined,
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

  /** Transfer the original live capability only after its intent is durable.
   * A failed transfer or publication remains consumed and retains cleanup.
   * The generic run path never returns this object or accepts a replacement. */
  protected async handoffStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId);
    diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const binding = operation?.records["binding.json"], retained = this.#retained;
      requireValue(retained !== null && retained.operationId === operationId && operation !== undefined && binding !== undefined &&
        binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupHandoffAttempted && operation.records["worker-startup-handoff-intent.json"] === undefined,
        "WORKER_STARTUP_HANDOFF_CONSUMED");
      requireValue(binding.launchAcknowledged && retained.binding?.rootCreated !== "0" && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        !this.#openingAttempted && !this.#pcbOpeningAttempted && !this.#observationConsumed.has("workers") &&
        !this.#observationConsumed.has("model-state"), "WORKER_STARTUP_HANDOFF_UNAVAILABLE");
      const original = this.#observations.get("script"), script = operation.records["script-result.json"];
      requireValue(script !== undefined && original !== undefined && original["family"] === "ui" && original["sourceVerified"] === true &&
        operation.records["script-intent.json"]?.family === "ui" && canonicalJson(script.result) === canonicalJson(original) &&
        this.#pending.get("script-result.json") === canonicalJson(script), "ORIGINAL_UI_SOURCE_REQUIRED");
      const transfer = retained.methods.handoffWorkerStartup;
      requireValue(transfer !== undefined, "WORKER_STARTUP_PURPOSE_REQUIRED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-handoff-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, scriptResultSha256: sha256Json(script),
      };
      this.#startupHandoffAttempted = true;
      await this.#record(operationId, "worker-startup-handoff-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-handoff-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const handoff = await transfer.call(retained.owner);
      // Keep the same channel even if final checks or publication fail. It is
      // Never reconstructed from a result record or handed to another owner.
      this.#startupHandoff = handoff;
      this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      const result: NonNullable<DiagnosticLifecycleRecords["worker-startup-handoff-result.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false,
      };
      await this.#record(operationId, "worker-startup-handoff-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-handoff-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return handoff;
    } finally { this.#busy = false; }
  }

  protected async openStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcbWorkerStartupOpeningResult> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    const request = startupCaptureInputSchema.parse(input);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const binding = operation?.records["binding.json"], retained = this.#retained;
      requireValue(operation !== undefined && binding !== undefined && retained !== null && retained.operationId === operationId &&
        binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertOwner(retained);
      const handedOff = operation.records["worker-startup-handoff-result.json"], handoff = this.#startupHandoff;
      requireValue(handedOff !== undefined && handoff !== null && this.#pending.get("worker-startup-handoff-result.json") === canonicalJson(handedOff),
        "ORIGINAL_STARTUP_HANDOFF_REQUIRED");
      requireValue(!this.#openingAttempted && operation.records["worker-startup-opening-intent.json"] === undefined, "WORKER_STARTUP_OPENING_CONSUMED");
      requireValue(binding.launchAcknowledged && retained.binding?.rootCreated !== "0" && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "WORKER_STARTUP_OPENING_UNAVAILABLE");
      // The checkpoint can persist evidence even before the native opener. Any
      // Attempt here is consumed, including a failed checkpoint or publication.
      this.#openingAttempted = true;
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const target = Object.freeze(structuredClone(request.target));
      const prepared = await this.#prepareCheckpoint(target); this.#assertOwner(retained);
      const preparedText = canonicalJson(prepared);
      requireValue(prepared.targetEvidence.projectUuid === target.projectUuid && prepared.targetEvidence.documentUuid === target.documentUuid &&
        prepared.targetEvidence.docType === "PCB" && prepared.targetEvidence.sourceSha256 === target.expectedSourceSha256, "PROJECT_CHECKPOINT_BINDING");
      const sealedTarget = Object.freeze(currentDisposableOpenSealedTargetSchema.parse({ ...target, branchUuid: prepared.targetEvidence.branchUuid }));
      const commonInventory = await this.#readCommonInventory(prepared, target); this.#assertOwner(retained);
      const completion = readerCompletion(commonInventory);
      requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
        commonInventory.checkpointSha256 === prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
      const preparation = Object.freeze({ sealedTarget, prepared, preparedText, originalTarget: target, commonInventory });
      this.#projectPreparation = preparation;
      const preparationCheckpoint = currentDisposableOpenPreparationCheckpointSchema.parse(prepared.preparationCheckpoint);
      await this.#verifyCheckpoint(prepared, target); this.#assertOwner(retained);
      requireValue(canonicalJson(prepared) === preparedText && readerCompletion(commonInventory) === completion, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-opening-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, handoffResultSha256: sha256Json(handedOff), target: sealedTarget,
        preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint), beforeSqlSha256: commonInventory.logicalSha256,
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: request.acceptDebuggerPauseEffects,
      };
      await this.#record(operationId, "worker-startup-opening-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-opening-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const owner = this.#createStartupOpening(handoff);
      const captured = Object.freeze({ open: owner.open, status: owner.status, retainedOpeningResult: owner.retainedOpeningResult,
        requireOriginal: owner.requireOriginal, proveCurrentAssignments: owner.proveCurrentAssignments,
        requireCurrentAssignments: owner.requireCurrentAssignments, retainedActorObservation: owner.retainedActorObservation,
        observeActorClock: owner.observeActorClock, requireActorClock: owner.requireActorClock,
        retainedChannelObservation: owner.retainedChannelObservation, observeCurrentChannel: owner.observeCurrentChannel,
        requireCurrentChannel: owner.requireCurrentChannel, releaseAfterTermination: owner.releaseAfterTermination });
      this.#startupOpening = Object.freeze({ owner, methods: captured }); this.#assertOwner(retained);
      let reverified = false, reverifyAttempted = false;
      const result = await captured.open.call(owner, sealedTarget, async () => {
        requireValue(!reverifyAttempted, "WORKER_STARTUP_REVERIFICATION_CONSUMED"); reverifyAttempted = true;
        await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
        requireValue(this.#projectPreparation === preparation && canonicalJson(prepared) === preparedText &&
          readerCompletion(commonInventory) === completion && this.#startupHandoff === handoff, "PROJECT_CHECKPOINT_CHANGED");
        await this.#verifyCheckpoint(prepared, target); this.#assertOwner(retained);
        requireValue(canonicalJson(prepared) === preparedText && readerCompletion(commonInventory) === completion, "PROJECT_CHECKPOINT_CHANGED");
        await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained); reverified = true;
      });
      // Keep the original packet, not the serialized journal projection. Its
      // Constructor runner retains the live object identity needed by require.
      this.#startupOpeningResult = result;
      requireValue(reverified, "WORKER_STARTUP_REVERIFICATION_REQUIRED");
      this.#assertOwner(retained);
      await captured.requireOriginal.call(owner, result); this.#assertOwner(retained);
      const record = diagnosticLifecycleRecordSchemas["worker-startup-opening-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
      });
      requireValue(record.result.opening.projectUuid === sealedTarget.projectUuid && record.result.opening.branchUuid === sealedTarget.branchUuid &&
        record.result.opening.documentUuid === sealedTarget.documentUuid && record.result.workerIdentity.projectUuid === sealedTarget.projectUuid &&
        record.result.workerIdentity.branchUuid === sealedTarget.branchUuid &&
        record.result.workerIdentity.windowTabId === record.result.opening.observation.windowTabId, "WORKER_STARTUP_OPENING_TARGET");
      this.#retainRecord("worker-startup-opening-result.json", record);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-opening-result.json", record);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-opening-result.json": record } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return result;
    } finally { this.#busy = false; }
  }

  /** Only the original successful packet can reach subsequent private
   * constructor observations. Historical JSON and failed publications cannot. */
  protected async requireStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcbWorkerStartupOpeningResult): Promise<CurrentPcbWorkerStartupTransport> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId &&
        result === this.#startupOpeningResult && this.#startupOpening !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        operation.records["worker-startup-opening-result.json"] !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(operation.records["worker-startup-opening-result.json"]),
      "ORIGINAL_STARTUP_RESULT_REQUIRED");
      this.#assertOwner(retained);
      const original = this.#startupOpening;
      const transport = await original.methods.requireOriginal.call(original.owner, result);
      this.#assertOwner(retained); await assertSnapshot(operations); this.#assertOwner(retained); return transport;
    } finally { this.#busy = false; }
  }

  /** One journaled continuation of the original capture. The public response
   * contains data only; its report cannot recreate the runner's lexical token. */
  protected async observeStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord), "ORIGINAL_STARTUP_RESULT_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupAssignmentsAttempted && operation.records["worker-startup-assignments-intent.json"] === undefined,
        "WORKER_STARTUP_ASSIGNMENTS_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-assignments-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-assignments-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, openingResultSha256: sha256Json(openingRecord),
      };
      this.#startupAssignmentsAttempted = true;
      await this.#record(operationId, "worker-startup-assignments-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-assignments-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const assignments = await original.methods.proveCurrentAssignments.call(original.owner, openingResult);
      // Retain partial success before later reproof/publication. A failed
      // Reproof leaves no accepted result plan for settlement to manufacture.
      this.#startupAssignments = assignments; this.#assertOwner(retained);
      await original.methods.requireCurrentAssignments.call(original.owner, openingResult, assignments); this.#assertOwner(retained);
      const record = diagnosticLifecycleRecordSchemas["worker-startup-assignments-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-assignments-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(assignments), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-assignments-result.json", record);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-assignments-result.json", record);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-assignments-result.json": record } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(record.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  /** Future private compositions must reprove the current original assignments.
   * No public action accepts a report, token or replacement owner. */
  protected async requireStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerConstructionAssignments> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      await original.methods.requireCurrentAssignments.call(original.owner, openingResult, assignments); this.#assertOwner(retained);
      await assertSnapshot(operations); this.#assertOwner(retained); return assignments;
    } finally { this.#busy = false; }
  }

  protected async observeStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupActorAttempted && operation.records["worker-startup-actor-intent.json"] === undefined, "WORKER_STARTUP_ACTOR_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-actor-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-actor-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(record),
      };
      this.#startupActorAttempted = true;
      await this.#record(operationId, "worker-startup-actor-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-actor-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const packet = await original.methods.observeActorClock.call(original.owner, openingResult, assignments);
      this.#startupActorPacket = packet; this.#assertOwner(retained);
      await original.methods.requireActorClock.call(original.owner, openingResult, assignments, packet); this.#assertOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-actor-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      requireValue(canonicalJson(result.result.identity) === canonicalJson(openingResult.workerIdentity), "WORKER_STARTUP_ACTOR_IDENTITY");
      this.#retainRecord("worker-startup-actor-result.json", result);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-actor-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-actor-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(result.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  protected async observeStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupChannelAttempted && operation.records["worker-startup-channel-intent.json"] === undefined, "WORKER_STARTUP_CHANNEL_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-channel-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-channel-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(record),
      };
      this.#startupChannelAttempted = true;
      await this.#record(operationId, "worker-startup-channel-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-channel-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const packet = await original.methods.observeCurrentChannel.call(original.owner, openingResult, assignments);
      this.#startupChannelPacket = packet; this.#assertOwner(retained);
      await original.methods.requireCurrentChannel.call(original.owner, openingResult, assignments, packet); this.#assertOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-channel-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-channel-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      requireValue(canonicalJson(result.result.identity) === canonicalJson(openingResult.workerIdentity), "WORKER_STARTUP_CHANNEL_IDENTITY");
      this.#retainRecord("worker-startup-channel-result.json", result);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-channel-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-channel-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(result.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  #assertPurpose(operationId: string, operation?: DiagnosticLifecycleOperation): void {
    const intent = operation?.records["intent.json"];
    let idPurpose: CurrentPcbDiagnosticLifecyclePurpose = "diagnostic";
    if (operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX)) { idPurpose = "string-precreate"; }
    else if (operationId.startsWith(CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX)) { idPurpose = "worker-startup"; }
    const expectedSchema = launchPurposeFields[this.#purpose].schema;
    requireValue(operationId.startsWith(CURRENT_PCB_209_OPENING_PROFILE.operationPrefix) === (this.#generation === "209-opening"), "GENERATION_MISMATCH");
    requireValue(idPurpose === this.#purpose && (intent === undefined || intent.schema === expectedSchema), "PURPOSE_MISMATCH");
  }
  #assertOwner(retained: Retained): void {
    this.#options.assertLocalAllowed();
    requireValue(this.#lease !== null, "ORIGINAL_LEASE_REQUIRED"); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    requireValue(this.#retained === retained && methods.every(name => retained.owner[name] === retained.methods[name]), "OWNER_CHANGED");
    const status = retained.methods.status.call(retained.owner);
    requireValue(status.profile === (this.#generation === "209-opening" ? "diagnostic209" : this.#purpose) &&
      (this.#generation !== "209-opening" || typeof retained.methods.observeLayers209 === "function" &&
        retained.owner.observeLayers209 === retained.methods.observeLayers209 &&
        typeof retained.methods.observePrimitives209 === "function" && retained.owner.observePrimitives209 === retained.methods.observePrimitives209 &&
        typeof retained.methods.observeExtendedPrimitives209 === "function" && retained.owner.observeExtendedPrimitives209 === retained.methods.observeExtendedPrimitives209 &&
        typeof retained.methods.observeSelectionRelations209 === "function" && retained.owner.observeSelectionRelations209 === retained.methods.observeSelectionRelations209 &&
        typeof retained.methods.observePadShapes209 === "function" && retained.owner.observePadShapes209 === retained.methods.observePadShapes209 &&
        typeof retained.methods.observeImageShapes209 === "function" && retained.owner.observeImageShapes209 === retained.methods.observeImageShapes209 &&
        typeof retained.methods.observeArcShapes209 === "function" && retained.owner.observeArcShapes209 === retained.methods.observeArcShapes209 &&
        typeof retained.methods.observePouredShapes209 === "function" && retained.owner.observePouredShapes209 === retained.methods.observePouredShapes209) &&
      (!this.#stringPurpose || typeof retained.methods.observeStringPrecreate === "function" &&
        retained.owner.observeStringPrecreate === retained.methods.observeStringPrecreate &&
        typeof retained.methods.observeCommonBaseline === "function" && retained.owner.observeCommonBaseline === retained.methods.observeCommonBaseline &&
        typeof retained.methods.retainedCommonBaselineFailure === "function" && retained.owner.retainedCommonBaselineFailure === retained.methods.retainedCommonBaselineFailure) &&
      (this.#purpose !== "worker-startup" || typeof retained.methods.handoffWorkerStartup === "function" &&
        retained.owner.handoffWorkerStartup === retained.methods.handoffWorkerStartup), "OWNER_PURPOSE_CHANGED");
    requireValue(retained.binding === null || canonicalJson(status.binding) === canonicalJson(retained.binding), "BINDING_CHANGED");
    requireValue(this.#startupOpening === null || startupOpeningMethods.every(name =>
      this.#startupOpening?.owner[name] === this.#startupOpening?.methods[name]), "STARTUP_OPENING_OWNER_CHANGED");
  }
  async #installation(retained: Retained): Promise<void> {
    this.#assertOwner(retained);
    requireValue(canonicalJson(await this.#verify(this.#options)) === retained.installation, "INSTALLATION_CHANGED");
    this.#assertOwner(retained);
  }
  async #otherLaunches(): Promise<void> {
    await assertNoUnresolvedOrdinaryLaunches(); await this.#options.assertOtherLaunchesSettled();
  }
  async #launchAdmission(): Promise<void> {
    // Production supplies the same combined guard for both contracts. Run it
    // Once, after the mandatory ordinary inventory, at this boundary. Distinct
    // Guards still both run; no result is retained across another await/boundary.
    if (this.#options.assertAllowed !== this.#options.assertOtherLaunchesSettled) { await this.#options.assertAllowed(); }
    await this.#otherLaunches();
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
    this.#assertPurpose(operationId);
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
  async #launch(request: Extract<LifecycleRequest, { action: "launch" }>): Promise<Record<string, unknown>> {
    requireValue(!this.#launchAttempted && this.#retained === null, "LAUNCH_CONSUMED");
    this.#assertPurpose(request.operationId);
    await this.#launchAdmission();
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
      ...launchPurposeFields[this.#purpose], operationId: request.operationId, createdAt: new Date().toISOString(),
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
      openPcb: owner.openPcb, observePcbOpening: owner.observePcbOpening,
      ...(this.#generation === "209-opening" ? { observeLayers209: owner.observeLayers209, observePrimitives209: owner.observePrimitives209,
        observeExtendedPrimitives209: owner.observeExtendedPrimitives209, observeSelectionRelations209: owner.observeSelectionRelations209,
        observePadShapes209: owner.observePadShapes209, observeImageShapes209: owner.observeImageShapes209, observeArcShapes209: owner.observeArcShapes209, observePouredShapes209: owner.observePouredShapes209 } : {}),
      ...(this.#stringPurpose ? { observeStringPrecreate: owner.observeStringPrecreate, observeCommonBaseline: owner.observeCommonBaseline,
        retainedCommonBaselineFailure: owner.retainedCommonBaselineFailure } : {}),
      ...(this.#purpose === "worker-startup" ? { handoffWorkerStartup: owner.handoffWorkerStartup } : {}) });
    const retained: Retained = { operationId: request.operationId, owner, methods: captured, installation: installationText,
      intentSha256: sha256Json(intent), binding: null };
    this.#retained = retained;
    await this.#installation(retained); await this.#launchAdmission();
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
    this.#assertPurpose(request.operationId, operation);
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
    if (request.action === "observe-common-baseline") { return this.#observeCommonBaseline(request, operation, operations, retained); }
    if (request.action === "browser-observation" || request.action === "inspect-frames" || request.action === "inspect-script" ||
        request.action === "inspect-workers" || request.action === "inspect-worker-script" || request.action === "observe-worker-state" ||
        request.action === "observe-model-state" || request.action === "observe-pcb-opening" || request.action === "observe-string-precreate" || request.action === "observe-layers" || request.action === "observe-primitives" || request.action === "observe-extended-primitives" || request.action === "observe-selection-relations" || request.action === "observe-pad-shapes" || request.action === "observe-image-shapes" || request.action === "observe-arc-shapes" || request.action === "observe-poured-shapes") {
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
    if (!terminated) { return { ...describe(request.operationId, operation), terminationObserved: false,
      lastTerminationObservation: retained.methods.status.call(retained.owner).lastTerminationObservation ?? null }; }
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
    if (request.action === "observe-string-precreate") { stage = "string-precreate"; }
    if (request.action === "observe-layers") { stage = "layers209"; }
    if (request.action === "observe-primitives") { stage = "primitives209"; }
    if (request.action === "observe-extended-primitives") { stage = "extended-primitives209"; }
    if (request.action === "observe-selection-relations") { stage = "selection-relations209"; }
    if (request.action === "observe-pad-shapes") { stage = "pad-shapes209"; }
    if (request.action === "observe-image-shapes") { stage = "image-shapes209"; }
    if (request.action === "observe-arc-shapes") { stage = "arc-shapes209"; }
    if (request.action === "observe-poured-shapes") { stage = "poured-shapes209"; }
    requireValue(operation.records["binding.json"]?.launchAcknowledged === true && retained.binding?.rootCreated !== "0" &&
      operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "OBSERVATION_UNAVAILABLE");
    requireValue(!this.#observationConsumed.has(stage) && operation.records[`${stage}-intent.json`] === undefined, "OBSERVATION_CONSUMED");
    requireValue(stage !== "frames" || operation.records["browser-result.json"] !== undefined, "BROWSER_OBSERVATION_REQUIRED");
    requireValue(stage !== "script" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "workers" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-script" || operation.records["workers-result.json"] !== undefined, "WORKER_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-state" || operation.records["worker-script-result.json"] !== undefined, "WORKER_SOURCE_REQUIRED");
    if (stage === "layers209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observeLayers209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "LAYERS209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "primitives209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observePrimitives209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "PRIMITIVES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "extended-primitives209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observeExtendedPrimitives209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "EXTENDED_PRIMITIVES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "selection-relations209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observeSelectionRelations209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "SELECTION_RELATIONS209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "pad-shapes209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observePadShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "PAD_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "image-shapes209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observeImageShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "IMAGE_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "arc-shapes209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observeArcShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "ARC_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "poured-shapes209") {
      requireValue(this.#generation === "209-opening" && retained.methods.observePouredShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "POURED_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
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
      if (this.#stringPurpose) { this.#originalPcbSource(operation); }
      else { requireValue(!this.#pcbOpeningAttempted && operation.records["pcb-open-intent.json"] === undefined, "PCB_BRANCH_SELECTED"); }
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
    if (stage === "string-precreate") {
      requireValue(this.#stringPurpose, "STRING_PURPOSE_REQUIRED");
      if (this.#observationConsumed.has("common-baseline") || operation.records["common-baseline-intent.json"] !== undefined) {
        const common = operation.records["common-baseline-result.json"], failure = operation.records["common-baseline-failure.json"];
        requireValue(common !== undefined && this.#pending.get("common-baseline-result.json") === canonicalJson(common) &&
          canonicalJson(this.#observations.get("common-baseline")) === canonicalJson(common.result) &&
          (common.result.schema === "easyeda-pro-control.pcb-common-baseline-refusal.v1" ? failure !== undefined &&
            failure.failure.nativeContinuationAllowed && this.#pending.get("common-baseline-failure.json") === canonicalJson(failure) : failure === undefined),
        "COMMON_RESULT_PUBLICATION_REQUIRED");
      }
      this.#originalPcbSource(operation);
      const record = operation.records["worker-script-result.json"], source = this.#observations.get("worker-script");
      requireValue(source !== undefined && record !== undefined && source["sourceVerified"] === true &&
        canonicalJson(source) === canonicalJson(record.result) && this.#pending.get("worker-script-result.json") === canonicalJson(record), "ORIGINAL_WORKER_SOURCE_REQUIRED");
    }
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["browser-intent.json"] | DiagnosticLifecycleRecords["string-precreate-intent.json"]> = stage === "string-precreate" ? {
      schema: "easyeda-pro-control.pcb-string-precreate-observation-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, stage, pcbOpeningResultSha256: sha256Json(operation.records["pcb-opening-result.json"]),
      workerScriptResultSha256: sha256Json(operation.records["worker-script-result.json"]),
    } : {
      schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, stage,
      ...(request.action === "inspect-frames" || request.action === "inspect-worker-script" ? { targetId: request.targetId } : {}),
      ...(request.action === "inspect-script" ? { frameId: request.frameId, family: request.family } : {}),
      ...(request.action === "observe-selection-relations" ? { componentIds: [...request.componentIds] } : {}),
    };
    this.#observationConsumed.add(stage); await this.#record(request.operationId, `${stage}-intent.json`, intent);
    const updated = { ...operation, records: { ...operation.records, [`${stage}-intent.json`]: intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let result: Readonly<Record<string, unknown>>;
    try {
    if (request.action === "browser-observation") { result = await retained.methods.browserObservation.call(retained.owner); }
    else if (request.action === "inspect-frames") { result = await retained.methods.inspectFrames.call(retained.owner, request.targetId); }
    else if (request.action === "inspect-script") {
      requireValue(this.#generation !== "209-opening" || request.family === "ui", "GENERATION_SCRIPT_FAMILY");
      const script = this.#generation === "209-opening" ? CURRENT_PCB_209_OPENING_SCRIPTS.ui : CURRENT_PCB_DIAGNOSTIC_SCRIPTS[request.family];
      result = await retained.methods.inspectScript.call(retained.owner, request.frameId, script);
    }
    else if (request.action === "inspect-workers") { result = await retained.methods.inspectWorkers.call(retained.owner); }
    else if (request.action === "inspect-worker-script") { result = await retained.methods.inspectWorkerScript.call(retained.owner, request.targetId); }
    else if (request.action === "observe-model-state") { result = await retained.methods.observeModelState.call(retained.owner); }
    else if (request.action === "observe-layers") {
      const observe = retained.methods.observeLayers209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "LAYERS209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-primitives") {
      const observe = retained.methods.observePrimitives209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "PRIMITIVES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-extended-primitives") {
      const observe = retained.methods.observeExtendedPrimitives209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "EXTENDED_PRIMITIVES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-pad-shapes") {
      const observe = retained.methods.observePadShapes209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "PAD_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-image-shapes") {
      const observe = retained.methods.observeImageShapes209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "IMAGE_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-arc-shapes") {
      const observe = retained.methods.observeArcShapes209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "ARC_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-poured-shapes") {
      const observe = retained.methods.observePouredShapes209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "POURED_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-string-precreate") {
      const observe = retained.methods.observeStringPrecreate;
      requireValue(this.#stringPurpose && observe !== undefined, "STRING_PURPOSE_REQUIRED");
      const before = this.#originalProjectOpening(operation).commonInventory;
      requireValue(before !== null, "STRING_ORIGINAL_SQL_REQUIRED");
      result = await observe.call(retained.owner, before);
    }
    else if (request.action === "observe-selection-relations") {
      const observe = retained.methods.observeSelectionRelations209;
      requireValue(this.#generation === "209-opening" && observe !== undefined, "SELECTION_RELATIONS209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget, request.componentIds);
    }
    else if (request.action === "observe-pcb-opening") {
      const preparation = this.#originalProjectOpening(operation);
      result = await retained.methods.observePcbOpening.call(retained.owner, preparation.sealedTarget,
        this.#generation === "209-opening" ? CURRENT_PCB_209_OPENING_SCRIPTS.pcb : CURRENT_PCB_DIAGNOSTIC_SCRIPTS.pcb);
    }
    else { result = await retained.methods.observeWorkerState.call(retained.owner); }
    } catch (caughtError) {
      const failure = currentPcbObservationFailureDetail(caughtError);
      if (failure !== null && (stage === "model-state" || stage === "string-precreate")) {
        const record = diagnosticLifecycleRecordSchemas["observation-failure.json"].parse({
          schema: "easyeda-pro-control.pcb-diagnostic-observation-failure.v1", operationId: request.operationId,
          createdAt: new Date().toISOString(), stage, intentSha256: sha256Json(intent), failure, executionAuthorized: false,
        });
        this.#retainRecord("observation-failure.json", record);
        try {
          this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
          await this.#publish(request.operationId, "observation-failure.json", record);
          const failed = { ...updated, records: { ...updated.records, "observation-failure.json": record } };
          await assertSnapshot(expected.map(value => value.operationId === request.operationId ? failed : value)); this.#assertOwner(retained);
        } catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- Keep the primary observation as cause; both it and this later publication error remain in errors.
          throw new AggregateError([caughtError, publicationError], "PCB_DIAGNOSTIC_OBSERVATION_FAILURE_PUBLICATION", { cause: caughtError });
        }
      }
      throw caughtError;
    }
    // Preserve the original observation before validation/publication can fail.
    this.#observations.set(stage, result);
    const observationLimit = stage === "primitives209" ? CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES : DIAGNOSTIC_OBSERVATION_MAX_BYTES;
    const extendedLimit = stage === "extended-primitives209" ? CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES : observationLimit;
    const selectionLimit = stage === "selection-relations209" ? CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES : extendedLimit;
    const padShapesLimit = stage === "pad-shapes209" ? CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES : selectionLimit;
    const imageShapesLimit = stage === "image-shapes209" ? CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES : padShapesLimit;
    const arcShapesLimit = stage === "arc-shapes209" ? CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES : imageShapesLimit;
    const pouredShapesLimit = stage === "poured-shapes209" ? CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES : arcShapesLimit;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= (stage === "string-precreate" ? STRING_PRECREATE_OBSERVATION_MAX_BYTES : pouredShapesLimit), "OBSERVATION_BOUND");
    if (request.action === "observe-selection-relations") {
      requireValue(Array.isArray(result["requestedComponentIds"]) &&
        canonicalJson(result["requestedComponentIds"]) === canonicalJson(request.componentIds), "SELECTION_RELATIONS209_REQUEST");
    }
    if (stage === "string-precreate") {
      const observed = stringPrecreateObservationResultSchema.parse(result), target = this.#projectPreparation?.sealedTarget;
      requireValue(target !== undefined && stringPrecreateTargetMatches(observed, target, this.#openingResult,
        this.#observations.get("pcb-opening")), "STRING_PRECREATE_TARGET");
    }
    const record = {
      ...(stage === "string-precreate" ? { schema: "easyeda-pro-control.pcb-string-precreate-observation-result.v1" as const,
        stage, result: stringPrecreateObservationResultSchema.parse(structuredClone(result)) } :
        { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1" as const, stage, result: structuredClone(result) }),
      operationId: request.operationId, createdAt: new Date().toISOString(),
      intentSha256: sha256Json(intent), executionAuthorized: false as const,
    };
    this.#retainRecord(`${stage}-result.json`, record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, `${stage}-result.json`, record);
    const completed = { ...updated, records: { ...updated.records, [`${stage}-result.json`]: record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), stage, result: publicObservationResult(request.operationId, stage, record.result, true) };
  }
  async #observeCommonBaseline(request: Extract<CleanupRequest, { action: "observe-common-baseline" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    const failureReader = retained.methods.retainedCommonBaselineFailure, observe = retained.methods.observeCommonBaseline;
    requireValue(this.#stringPurpose && observe !== undefined && failureReader !== undefined, "COMMON_PURPOSE_REQUIRED");
    requireValue(!this.#observationConsumed.has("common-baseline") && operation.records["common-baseline-intent.json"] === undefined,
      "COMMON_OBSERVATION_CONSUMED");
    requireValue(!this.#observationConsumed.has("string-precreate") && operation.records["string-precreate-intent.json"] === undefined &&
      operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "COMMON_OBSERVATION_UNAVAILABLE");
    this.#originalPcbSource(operation);
    const preparation = this.#originalProjectOpening(operation);
    const before = preparation.commonInventory, originalWorker = this.#observations.get("worker-script"), worker = operation.records["worker-script-result.json"];
    requireValue(before !== null && worker !== undefined && originalWorker !== undefined && originalWorker["sourceVerified"] === true &&
      canonicalJson(worker.result) === canonicalJson(originalWorker) && this.#pending.get("worker-script-result.json") === canonicalJson(worker),
    "COMMON_ORIGINAL_BASELINE_REQUIRED");
    const completion = readerCompletion(before);
    requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      before.logicalSha256 === operation.records["project-opening-intent.json"]?.commonBeforeSqlSha256 &&
      before.checkpointSha256 === preparation.prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget);
    requireValue(this.#projectPreparation === preparation && canonicalJson(preparation.prepared) === preparation.preparedText &&
      readerCompletion(before) === completion, "COMMON_BASELINE_CHANGED");
    await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["common-baseline-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-common-baseline-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      stage: "common-baseline", bindingSha256: request.expectedBindingSha256,
      pcbOpeningResultSha256: sha256Json(operation.records["pcb-opening-result.json"]), workerScriptResultSha256: sha256Json(worker),
      beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256,
    };
    this.#observationConsumed.add("common-baseline"); await this.#record(request.operationId, "common-baseline-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "common-baseline-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let result: Awaited<ReturnType<NonNullable<LifecycleOwner["observeCommonBaseline"]>>>;
    try { result = await observe.call(retained.owner, before); }
    catch (caughtError) {
      const rawFailure = failureReader.call(retained.owner);
      if (rawFailure !== null) {
        const failure = currentPcbCommonBaselineFailureSchema.parse(rawFailure);
        const record: NonNullable<DiagnosticLifecycleRecords["common-baseline-failure.json"]> = {
          schema: "easyeda-pro-control.pcb-common-baseline-failure-record.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
          intentSha256: sha256Json(intent), failure, executionAuthorized: false,
        };
        this.#retainRecord("common-baseline-failure.json", record);
        try {
          this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
          await this.#publish(request.operationId, "common-baseline-failure.json", record);
          const failed = { ...updated, records: { ...updated.records, "common-baseline-failure.json": record } };
          await assertSnapshot(expected.map(value => value.operationId === request.operationId ? failed : value)); this.#assertOwner(retained);
        } catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- Preserve the original observation cause and the distinct later evidence-publication failure.
          throw new AggregateError([caughtError, publicationError], "PCB_COMMON_BASELINE_FAILURE_PUBLICATION", { cause: caughtError });
        }
      }
      throw caughtError;
    }
    this.#observations.set("common-baseline", result);
    const parsed = currentPcbCommonBaselineResultSchema.parse(result), target = preparation.sealedTarget;
    requireValue(parsed.identity.projectUuid === target.projectUuid && parsed.identity.branchUuid === target.branchUuid &&
      parsed.identity.documentUuid === target.documentUuid && parsed.beforeSqlSha256 === before.logicalSha256 &&
      parsed.checkpointSha256 === before.checkpointSha256, "COMMON_RESULT_TARGET");
    const record: NonNullable<DiagnosticLifecycleRecords["common-baseline-result.json"]> = {
      schema: "easyeda-pro-control.pcb-common-baseline-result.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      stage: "common-baseline", intentSha256: sha256Json(intent), result: parsed, executionAuthorized: false,
    };
    let preceding = updated;
    if (parsed.schema === "easyeda-pro-control.pcb-common-baseline-refusal.v1") {
      const failure = currentPcbCommonBaselineFailureSchema.parse(failureReader.call(retained.owner));
      requireValue(failure.nativeContinuationAllowed && canonicalJson(failure.identity) === canonicalJson(parsed.identity) &&
        failure.historicalHeader?.headerSha256 === parsed.historicalHeaderSha256 &&
        failure.observationSha256 === parsed.observationSha256 &&
        canonicalJson(failure.retainedReplySha256) === canonicalJson(parsed.retainedReplySha256), "COMMON_REFUSAL_EVIDENCE_REQUIRED");
      const failed: NonNullable<DiagnosticLifecycleRecords["common-baseline-failure.json"]> = {
        schema: "easyeda-pro-control.pcb-common-baseline-failure-record.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), failure, executionAuthorized: false,
      };
      // Retain both plans before the first publication. Settlement can only
      // Publish these same bytes, in failure-before-result order.
      this.#retainRecord("common-baseline-failure.json", failed);
      this.#retainRecord("common-baseline-result.json", record);
      this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(request.operationId, "common-baseline-failure.json", failed);
      preceding = { ...updated, records: { ...updated.records, "common-baseline-failure.json": failed } };
    } else { this.#retainRecord("common-baseline-result.json", record); }
    const precedingExpected = expected.map(value => value.operationId === request.operationId ? preceding : value);
    this.#assertOwner(retained); await assertSnapshot(precedingExpected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "common-baseline-result.json", record);
    const completed = { ...preceding, records: { ...preceding.records, "common-baseline-result.json": record } };
    await assertSnapshot(precedingExpected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), stage: "common-baseline", result: parsed };
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
    const commonInventory = this.#stringPurpose ? await this.#readCommonInventory(prepared, target) : null;
    this.#assertOwner(retained);
    if (commonInventory !== null) {
      const completion = readerCompletion(commonInventory);
      requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
        commonInventory.checkpointSha256 === prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
    }
    this.#projectPreparation = Object.freeze({ sealedTarget, prepared, preparedText, originalTarget: target, commonInventory });
    const preparationCheckpoint = currentDisposableOpenPreparationCheckpointSchema.parse(prepared.preparationCheckpoint);
    await this.#verifyCheckpoint(prepared, target);
    requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["project-opening-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-project-opening-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256, scriptResultSha256: sha256Json(script),
      target: sealedTarget, preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint),
      ...(commonInventory === null ? {} : { commonBeforeSqlSha256: commonInventory.logicalSha256 }),
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
  #originalPcbSource(operation: DiagnosticLifecycleOperation): void {
    const preparation = this.#originalProjectOpening(operation);
    const record = operation.records["pcb-opening-result.json"], source = this.#observations.get("pcb-opening");
    requireValue(source !== undefined && record !== undefined &&
      diagnosticPcbOpeningSourceAccepted(source, preparation.sealedTarget) &&
      canonicalJson(source) === canonicalJson(record.result) && this.#pending.get("pcb-opening-result.json") === canonicalJson(record), "ORIGINAL_PCB_SOURCE_REQUIRED");
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
    if (this.#startupOpening !== null && !this.#startupOpeningReleased) {
      const opening = this.#startupOpening;
      await opening.methods.releaseAfterTermination.call(opening.owner);
      this.#startupOpeningReleased = true; this.#assertOwner(retained);
      await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    }
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

/** Existing diagnostic facade never joins its mutually exclusive branches. */
export class CurrentPcbDiagnosticLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "diagnostic");
  }
}

/** New source-qualified disposable project/PCB opening subset. A new instance
 * owns a separate pcb209-* lifetime; no legacy owner or serialized record can
 * select a different generation or enable the old model/worker vocabulary. */
export class CurrentPcb209DiagnosticLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "diagnostic", "209-opening");
  }
}

/** Separate, fixed-purpose precreate observation only; no create or Save. */
export class CurrentPcbStringPrecreateLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbStringPrecreateLifecycleDependencies = {}) {
    super(options, dependencies, "string-precreate");
  }
}

/** Fixed startup lifecycle. Its data-only capture entry opens a sealed
 * disposable project; the generic grammar admits no navigation, CAD or Save. */
export class CurrentPcbWorkerStartupLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbWorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcbWorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input);
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcbWorkerStartupOpeningResult): Promise<CurrentPcbWorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request);
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
}
