/** Private, append-only diagnostic lifecycle records. Historical JSON never
 * recreates a native owner. Partial reservations remain launch blockers. */
/* oxlint-disable import/max-dependencies -- This shared journal validates distinct diagnostic, String and common evidence, including global String exclusion, without merging their authority. */
import { constants } from "node:fs";
import type { BigIntStats, Dirent } from "node:fs";
import { lstat, mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { currentFootprintCopyStatePacketSchema } from "./current-footprint-copy-state.ts";
import { currentFootprintCopyPreparationSchema } from "./current-footprint-copy-preparation.ts";
import { currentFootprintSourceReadPacketSchema } from "./current-footprint-source-read-runner.ts";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { ControlRootDirectory } from "./control-root.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX, currentPcbStringPrecreateIdSchema } from "./current-pcb-string-precreate-validation.ts";
import { CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX, currentPcbWorkerStartupLifecycleIdSchema } from "./current-pcb-worker-startup-validation.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX, currentPcb209WorkerStartupFootprintSourceInputSchema,
  currentPcb209WorkerStartupLifecycleIdSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX, currentPcb209RatlineStartupIdSchema } from "./current-pcb-209-ratline-startup-validation.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX, currentPcb209RatlineContinuationIdSchema } from "./current-pcb-209-ratline-continuation-validation.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_RESULT_MAX_BYTES, currentPcb209RatlineContinuationNativePacketSchema } from "./current-pcb-209-ratline-continuation-packet-schema.ts";
import { CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES, currentPcb209RatlineNativePacketSchema } from "./current-pcb-209-ratline-startup-packet-schema.ts";
import { CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX, currentPcb209EmptyStartupIdSchema } from "./current-pcb-209-empty-startup-validation.ts";
import { CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES, currentPcb209WorkerStartupEmptyPacketSchema,
  currentPcb209WorkerStartupPcbPacketSchema } from "./current-pcb-209-empty-startup-packet-schema.ts";
import { currentPcb209WorkerStartupActorPacketSchema } from "./current-pcb-209-worker-startup-actor.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { currentPcbWorkerStartupActorPacketSchema } from "./current-pcb-worker-startup-actor-runner.ts";
import { currentPcbWorkerStartupChannelPacketSchema } from "./current-pcb-worker-startup-channel-observation.ts";
import { currentPcbObservationFailureSchema } from "./current-pcb-observation-failure.ts";
import { CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-primitives.ts";
import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-extended-primitives.ts";
import { CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES } from "./current-pcb-209-image-shapes.ts";
import { CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES } from "./current-pcb-209-arc-shapes.ts";
import { CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES } from "./current-pcb-209-poured-shapes.ts";
import { CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES } from "./current-pcb-209-pad-shapes.ts";
import { CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES, currentPcb209SelectionRelationsComponentIdsSchema } from "./current-pcb-209-selection-relations.ts";
import { assertNoUnresolvedCurrentPcbStringLedgers } from "./current-pcb-string-ledger-exclusion.ts";
import { CURRENT_PCB_COMMON_FAILURE_MAX_BYTES, currentPcbCommonBaselineFailureSchema, currentPcbCommonBaselineResultSchema } from "./current-pcb-common-baseline-validation.ts";

const DIRECTORY = "pcb-diagnostic-lifecycle-v1";
const MAX_BYTES = 8192;
export const DIAGNOSTIC_OBSERVATION_MAX_BYTES = 128 * 1024;
/** V3 adds16KiB each for move/startup and finite-effect observations.
 * Historical V1/V2 retain384/680KiB; diagnostic remains128KiB. */
export const STRING_PRECREATE_OBSERVATION_V2_MAX_BYTES = 680 * 1024;
export const STRING_PRECREATE_OBSERVATION_MAX_BYTES = 712 * 1024;
const MAX_OPERATIONS = 4096;
export type CurrentPcbDiagnosticLifecyclePurpose = "diagnostic" | "string-precreate" | "worker-startup";
const qualifiedPcbOpeningSchema = z.looseObject({
  family: z.literal("pcb"), sourceVerified: z.literal(true), domOwnerVerified: z.literal(true),
  projectUuid: z.string(), documentUuid: z.string(), tabId: z.string(),
  openingObservation: z.looseObject({ phase: z.literal("observe"), ok: z.literal(true), status: z.literal("frame-observed"),
    failure: z.null(), frameObserved: z.literal(true), projectUuid: z.string(), branchUuid: z.string(),
    documentUuid: z.string(), tabId: z.string() }),
});
export function diagnosticPcbOpeningSourceAccepted(result: Readonly<Record<string, unknown>>,
  target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>): boolean {
  const parsed = qualifiedPcbOpeningSchema.safeParse(result);
  if (!parsed.success) { return false; }
  const value = parsed.data;
  const observed = value.openingObservation, tabId = `${target.documentUuid}@${target.projectUuid}`;
  return value.projectUuid === target.projectUuid && value.documentUuid === target.documentUuid && value.tabId === tabId &&
    observed.projectUuid === target.projectUuid && observed.branchUuid === target.branchUuid &&
    observed.documentUuid === target.documentUuid && observed.tabId === tabId;
}
export const diagnosticLifecycleIdSchema = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9_-]*$/u);
export const diagnosticLifecycleDigestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
export const diagnosticLifecycleWindowSchema = z.string().regex(/^[1-9]\d{0,18}$/u);
const token = z.string().regex(/^[a-f0-9]{32}$/u);
export const diagnosticLifecycleBindingSchema = z.object({
  helperInstance: token, jobId: token, rootPid: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  rootCreated: z.string().regex(/^(?:0|[1-9]\d{14,19})$/u),
}).strict();
const base = { operationId: diagnosticLifecycleIdSchema, createdAt: z.iso.datetime() };
const diagnosticIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-launch-intent.v1"), ...base,
  facadeSha256: diagnosticLifecycleDigestSchema, installationSha256: diagnosticLifecycleDigestSchema,
  confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true),
}).strict();
const stringIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-precreate-launch-intent.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, purpose: z.literal("string-precreate"),
  facadeSha256: diagnosticLifecycleDigestSchema, installationSha256: diagnosticLifecycleDigestSchema,
  confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true),
}).strict();
const workerStartupIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-worker-startup-launch-intent.v1"), ...base,
  operationId: currentPcbWorkerStartupLifecycleIdSchema, purpose: z.literal("worker-startup"),
  facadeSha256: diagnosticLifecycleDigestSchema, installationSha256: diagnosticLifecycleDigestSchema,
  confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true),
}).strict();
const workerStartup209IntentSchema = workerStartupIntentSchema.extend({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-launch-intent.v1"), operationId: currentPcb209WorkerStartupLifecycleIdSchema,
});
const workerStartupEmpty209IntentSchema = workerStartupIntentSchema.extend({
  schema: z.literal("easyeda-pro-control.pcb209-empty-startup-launch-intent.v1"), operationId: currentPcb209EmptyStartupIdSchema,
});
const workerStartupRatline209IntentSchema = workerStartupIntentSchema.extend({
  schema: z.literal("easyeda-pro-control.pcb209-ratline-startup-launch-intent.v1"), operationId: currentPcb209RatlineStartupIdSchema,
});
const workerStartupContinuation209IntentSchema = workerStartupIntentSchema.extend({
  schema: z.literal("easyeda-pro-control.pcb209-ratline-continuation-launch-intent.v1"), operationId: currentPcb209RatlineContinuationIdSchema,
});
const startupId = z.union([currentPcbWorkerStartupLifecycleIdSchema, currentPcb209WorkerStartupLifecycleIdSchema]);
const startupOpeningId = z.union([startupId, currentPcb209EmptyStartupIdSchema, currentPcb209RatlineStartupIdSchema, currentPcb209RatlineContinuationIdSchema]);
const intentSchema = z.discriminatedUnion("schema", [diagnosticIntentSchema, stringIntentSchema, workerStartupIntentSchema,
  workerStartup209IntentSchema, workerStartupEmpty209IntentSchema, workerStartupRatline209IntentSchema, workerStartupContinuation209IntentSchema]);
const workerStartupHandoffIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-worker-startup-handoff-intent.v1"), ...base,
  operationId: startupOpeningId, bindingSha256: diagnosticLifecycleDigestSchema,
  scriptResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupHandoffResultSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-worker-startup-handoff-result.v1"), ...base,
  operationId: startupOpeningId, intentSha256: diagnosticLifecycleDigestSchema,
  originalParentRetained: z.literal(true), handoffIrreversible: z.literal(true), executionAuthorized: z.literal(false),
}).strict();
const bindingSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-launch-binding.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, binding: diagnosticLifecycleBindingSchema,
  launchAcknowledged: z.boolean(),
}).strict().refine(value => !value.launchAcknowledged || value.binding.rootCreated !== "0", "Cleanup-only identity cannot acknowledge diagnostic startup.");
const closeIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-close-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, hwnd: diagnosticLifecycleWindowSchema, confirmNormalClose: z.literal(true),
}).strict();
const closeAcknowledgmentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-close-acknowledged.v1"), ...base,
  closeIntentSha256: diagnosticLifecycleDigestSchema, acknowledged: z.literal(true), terminationProved: z.literal(false),
}).strict();
const terminationSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-terminated.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, originalRootExited: z.literal(true), originalJobEmpty: z.literal(true),
}).strict();
const releaseIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-release-intent.v1"), ...base,
  terminationSha256: diagnosticLifecycleDigestSchema,
}).strict();
const releasedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-released.v1"), ...base,
  releaseIntentSha256: diagnosticLifecycleDigestSchema, released: z.literal(true),
}).strict();
const unlaunchedIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-unlaunched-release-intent.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, nativeLaunchInvoked: z.literal(false), helperAllocated: z.boolean(),
}).strict();
const notDispatchedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-not-dispatched.v1"), ...base,
  unlaunchedReleaseIntentSha256: diagnosticLifecycleDigestSchema, nativeLaunchInvoked: z.literal(false), helperReleased: z.boolean(),
}).strict();
export const diagnosticLifecycleNoProcessReleaseProofSchema = z.object({
  launchRequestOutcome: z.enum(["not-issued", "native-refused"]), creationState: z.enum(["not-entered", "returned-false"]),
  createProcessError: z.number().int().min(0).max(4_294_967_295).refine(value => !Object.is(value, -0)).optional(),
  processCreated: z.literal(false), released: z.literal(true),
}).strict().refine(value => value.launchRequestOutcome !== "not-issued" || value.creationState === "not-entered",
  "An unissued native request cannot have entered CreateProcess.")
  .refine(value => value.createProcessError === undefined || value.creationState === "returned-false",
    "Only a failed CreateProcess can carry its captured numeric error.");
const noProcessIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-no-process-release-intent.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, originalLaunchMethodInvoked: z.literal(true),
}).strict();
const noProcessReleasedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-no-process-released.v1"), ...base,
  noProcessReleaseIntentSha256: diagnosticLifecycleDigestSchema, proof: diagnosticLifecycleNoProcessReleaseProofSchema,
}).strict();
export const diagnosticObservationStageSchema = z.enum(["browser", "frames", "script", "workers", "worker-script", "worker-state", "pcb-opening", "model-state"]);
const extendedObservationStageSchema = z.enum([...diagnosticObservationStageSchema.options, "layers209", "primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"]);
export const lifecycleObservationStages = [...extendedObservationStageSchema.options, "common-baseline", "string-precreate"] as const;
const observationIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, stage: extendedObservationStageSchema,
  targetId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(), frameId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(),
  family: z.enum(["ui", "pcb", "public-api"]).optional(),
  componentIds: currentPcb209SelectionRelationsComponentIdsSchema.optional(),
}).strict().refine(value => {
  if (value.stage === "selection-relations209") {
    return value.componentIds !== undefined && value.targetId === undefined && value.frameId === undefined && value.family === undefined;
  }
  if (value.componentIds !== undefined) { return false; }
  if (value.stage === "browser" || value.stage === "workers" || value.stage === "worker-state" || value.stage === "model-state" || value.stage === "pcb-opening" || value.stage === "layers209" || value.stage === "primitives209" || value.stage === "extended-primitives209" || value.stage === "pad-shapes209" || value.stage === "image-shapes209" || value.stage === "arc-shapes209" || value.stage === "poured-shapes209") {
    return value.targetId === undefined && value.frameId === undefined && value.family === undefined;
  }
  if (value.stage === "frames" || value.stage === "worker-script") { return value.targetId !== undefined && value.frameId === undefined && value.family === undefined; }
  return value.targetId === undefined && value.frameId !== undefined && value.family !== undefined;
}, "Observation selectors must match the exact stage.");
const observationResultSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-result.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, stage: extendedObservationStageSchema,
  result: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false),
}).strict().refine(value => {
  const ordinaryLimit = value.stage === "primitives209" ? CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES : DIAGNOSTIC_OBSERVATION_MAX_BYTES;
  const extendedLimit = value.stage === "extended-primitives209" ? CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES : ordinaryLimit;
  const padLimit = value.stage === "pad-shapes209" ? CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES : extendedLimit;
  const imageLimit = value.stage === "image-shapes209" ? CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES : padLimit;
  const arcLimit = value.stage === "arc-shapes209" ? CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES : imageLimit;
  const limit = value.stage === "poured-shapes209" ? CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES : arcLimit;
  return Buffer.byteLength(canonicalJson(value.result)) <=
    (value.stage === "selection-relations209" ? CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES : limit);
}, "Observation result exceeds its bound.");
const stringPrecreateIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-precreate-observation-intent.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, stage: z.literal("string-precreate"),
  bindingSha256: diagnosticLifecycleDigestSchema, pcbOpeningResultSha256: diagnosticLifecycleDigestSchema,
  workerScriptResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const commonBaselineIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-intent.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, stage: z.literal("common-baseline"),
  bindingSha256: diagnosticLifecycleDigestSchema, pcbOpeningResultSha256: diagnosticLifecycleDigestSchema,
  workerScriptResultSha256: diagnosticLifecycleDigestSchema, beforeSqlSha256: diagnosticLifecycleDigestSchema,
  checkpointSha256: diagnosticLifecycleDigestSchema,
}).strict();
const commonBaselineResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-result.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, stage: z.literal("common-baseline"), intentSha256: diagnosticLifecycleDigestSchema,
  result: currentPcbCommonBaselineResultSchema, executionAuthorized: z.literal(false),
}).strict();
const commonBaselineFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-failure-record.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, intentSha256: diagnosticLifecycleDigestSchema,
  failure: currentPcbCommonBaselineFailureSchema, executionAuthorized: z.literal(false),
}).strict();
const stringPrecreateObservationV1 = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-precreate-observation.v1"),
  target: z.object({ projectUuid: diagnosticLifecycleDigestSchema, branchUuid: token,
    documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
    windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict(),
  first: z.record(z.string(), z.unknown()), second: z.record(z.string(), z.unknown()),
  matchingSamples: z.literal(true), originalContextsRechecked: z.literal(true),
  atomicSnapshotVerified: z.literal(false), projectWorkerAssociationVerified: z.literal(false),
  publicationCaptureVerified: z.literal(false), completeLiveSourceVerified: z.literal(false),
  continuousObservation: z.literal(false), queueCompletionVerified: z.literal(false),
  saveAuthorized: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
const stringWorkerObservation = z.looseObject({
  schema: z.literal("easyeda-pro-control.pcb-string-worker-producer-observation.v1"),
  identity: z.object({ projectUuid: diagnosticLifecycleDigestSchema, branchUuid: token,
    windowTabId: stringPrecreateObservationV1.shape.target.shape.windowTabId }).strict(),
  originalRunnerIssued: z.literal(true), hiddenCallbackReceiversVerified: z.literal(false), completePublishersVerified: z.literal(false),
  writeDestinationsContained: z.literal(false), atomicSnapshotVerified: z.literal(false), continuousObservation: z.literal(false),
  queueCompletionVerified: z.literal(false), saveAuthorized: z.literal(false), executionAuthorized: z.literal(false),
}).refine(value => Buffer.byteLength(canonicalJson(value)) <= 131_072);
const stringActorObservation = z.looseObject({
  profile: z.literal("private.current-pcb-string-actor-clock-packet.v1"), identity: stringPrecreateObservationV1.shape.target,
  originalRunnerIssued: z.literal(true), pairedActorValuesMatched: z.literal(true), packetSha256: diagnosticLifecycleDigestSchema,
  originalOwnerVerified: z.literal(false), nativeIntrinsicsVerified: z.literal(false), workerUserFutureUseVerified: z.literal(false),
  backendActorProvenanceVerified: z.literal(false), windowsClockProvenanceVerified: z.literal(false), serverClockObserved: z.literal(false),
  clockProvenanceVerified: z.literal(false), continuousObservation: z.literal(false), producerBindingVerified: z.literal(false),
  completePublicationIntervalVerified: z.literal(false), originalSaveVerified: z.literal(false),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => Buffer.byteLength(canonicalJson(value)) <= 131_072);
const stringPrecreateObservationV2 = stringPrecreateObservationV1.extend({
  schema: z.literal("easyeda-pro-control.pcb-string-precreate-observation.v2"),
  workerProducers: stringWorkerObservation, actorClock: stringActorObservation,
}).refine(value => canonicalJson(value.actorClock.identity) === canonicalJson(value.target) &&
  value.workerProducers.identity.projectUuid === value.target.projectUuid &&
  value.workerProducers.identity.branchUuid === value.target.branchUuid &&
  value.workerProducers.identity.windowTabId === value.target.windowTabId, "String owned observations target differs.");
const stringMoveObservation = z.looseObject({
  schema: z.literal("easyeda-pro-control.pcb-string-move-observation.v1"), identity: stringPrecreateObservationV1.shape.target,
  state: z.looseObject({ documentUuid: stringPrecreateObservationV1.shape.target.shape.documentUuid }),
  startup: z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-string-startup-route.v1"),
    state: z.looseObject({ documentUuid: stringPrecreateObservationV1.shape.target.shape.documentUuid }),
    startupCallbackCompletionVerified: z.literal(false), writeDestinationsContained: z.literal(false), executionAuthorized: z.literal(false) }),
  originalRunnerIssued: z.literal(true), continuousObservation: z.literal(false), completeProducerInventoryVerified: z.literal(false),
  queueCompletionVerified: z.literal(false), writeDestinationsContained: z.literal(false), saveAuthorized: z.literal(false), executionAuthorized: z.literal(false),
}).refine(value => Buffer.byteLength(canonicalJson(value)) <= 16_384 && value.state.documentUuid === value.identity.documentUuid &&
  value.startup.state.documentUuid === value.identity.documentUuid);
const stringFiniteEffects = z.looseObject({
  schema: z.literal("easyeda-pro-control.pcb-string-finite-effects.v1"), identity: stringPrecreateObservationV1.shape.target,
  originalRunnerObservationsMatched: z.literal(true), continuousObservation: z.literal(false), completeProducerInventoryVerified: z.literal(false),
  writeDestinationsContained: z.literal(false), queueCompletionVerified: z.literal(false), saveAuthorized: z.literal(false), executionAuthorized: z.literal(false),
}).refine(value => Buffer.byteLength(canonicalJson(value)) <= 16_384);
const stringPrecreateObservationV3 = stringPrecreateObservationV1.extend({
  schema: z.literal("easyeda-pro-control.pcb-string-precreate-observation.v3"),
  workerProducers: stringWorkerObservation, actorClock: stringActorObservation, moveProducers: stringMoveObservation, finiteEffects: stringFiniteEffects,
}).refine(value => canonicalJson(value.actorClock.identity) === canonicalJson(value.target) &&
  canonicalJson(value.moveProducers.identity) === canonicalJson(value.target) && canonicalJson(value.finiteEffects.identity) === canonicalJson(value.target) &&
  value.workerProducers.identity.projectUuid === value.target.projectUuid && value.workerProducers.identity.branchUuid === value.target.branchUuid &&
  value.workerProducers.identity.windowTabId === value.target.windowTabId, "String owned observations target differs.");
/** Historical JSON is not an issuance capability. Retain old V1 records without
 * permitting unavailable V2 managers or new collector claims to be recast V1. */
export const stringPrecreateObservationResultSchema = z.union([stringPrecreateObservationV1, stringPrecreateObservationV2, stringPrecreateObservationV3])
  .refine(value => canonicalJson(value.first) === canonicalJson(value.second) &&
    Buffer.byteLength(canonicalJson(value.first)) <= (value.schema.endsWith(".v1") ? 188_416 : 212_992),
  "String precreate sweeps differ or exceed their bound.")
  .refine(value => {
    if (value.schema.endsWith(".v1")) { return Buffer.byteLength(canonicalJson(value)) <= 393_216; }
    const limit = value.schema.endsWith(".v2") ? STRING_PRECREATE_OBSERVATION_V2_MAX_BYTES : STRING_PRECREATE_OBSERVATION_MAX_BYTES;
    return Buffer.byteLength(canonicalJson(value)) <= limit;
  });
const projectWindowSchema = z.looseObject({ observation: z.looseObject({ windowTabId: z.string() }) });
const pcbWindowSchema = z.looseObject({ openingObservation: z.looseObject({ windowTabId: z.string() }) });
export function stringPrecreateTargetMatches(result: z.infer<typeof stringPrecreateObservationResultSchema>,
  target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>, projectOpening: unknown, pcbOpening: unknown): boolean {
  const pcb = pcbWindowSchema.safeParse(pcbOpening), project = projectWindowSchema.safeParse(projectOpening);
  return pcb.success && project.success && result.target.projectUuid === target.projectUuid &&
    result.target.branchUuid === target.branchUuid && result.target.documentUuid === target.documentUuid &&
    result.target.windowTabId === project.data.observation.windowTabId && result.target.windowTabId === pcb.data.openingObservation.windowTabId;
}
const stringPrecreateResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-precreate-observation-result.v1"), ...base,
  operationId: currentPcbStringPrecreateIdSchema, stage: z.literal("string-precreate"), intentSha256: diagnosticLifecycleDigestSchema,
  result: stringPrecreateObservationResultSchema, executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= STRING_PRECREATE_OBSERVATION_MAX_BYTES, "String precreate result exceeds its bound.");
const observationFailureSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-failure.v1"), ...base,
  stage: z.enum(["model-state", "string-precreate"]), intentSha256: diagnosticLifecycleDigestSchema,
  failure: currentPcbObservationFailureSchema, executionAuthorized: z.literal(false),
}).strict().refine(value => (value.stage === "string-precreate") === (value.failure.family === "STRING_PRECREATE"));
const projectOpeningIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-project-opening-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, scriptResultSha256: diagnosticLifecycleDigestSchema,
  target: currentDisposableOpenSealedTargetSchema, preparationCheckpoint: currentDisposableOpenPreparationCheckpointSchema,
  checkpointReceiptSha256: diagnosticLifecycleDigestSchema,
  commonBeforeSqlSha256: diagnosticLifecycleDigestSchema.optional(),
  confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true),
}).strict();
const projectOpeningResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-project-opening-result.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, result: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "Opening result exceeds its bound.");
const workerStartupOpeningIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-opening-intent.v1"), ...base,
  operationId: startupOpeningId, bindingSha256: diagnosticLifecycleDigestSchema,
  handoffResultSha256: diagnosticLifecycleDigestSchema, target: currentDisposableOpenSealedTargetSchema,
  preparationCheckpoint: currentDisposableOpenPreparationCheckpointSchema, checkpointReceiptSha256: diagnosticLifecycleDigestSchema,
  beforeSqlSha256: diagnosticLifecycleDigestSchema, confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true),
  acceptDebuggerPauseEffects: z.literal(true),
}).strict();
const workerStartupOpenedSchema = z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-opening.v1"), phase: z.literal("open-project"),
      projectUuid: diagnosticLifecycleDigestSchema, branchUuid: token, documentUuid: z.string(),
      ok: z.literal(true), status: z.literal("opened-prefix-observed"), failure: z.null(), dispatchAttempted: z.literal(true),
      observation: z.looseObject({ windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }),
      executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
    });
const workerStartupConstructionSchema = z.object({ profile: z.literal("private.current-pcb-worker-construction.v1"), pauses: z.literal(9),
      originalConstructorAndFactoryEventsRetained: z.literal(true), originalProjectReceiverMatched: z.literal(true),
      channelNativeIntrinsicAndPeerOwnershipVerified: z.literal(false), wrapperAssignmentRelationVerified: z.literal(false),
      nativeStartupIntegrationVerified: z.literal(false), writeDestinationsContained: z.literal(false), executionAuthorized: z.literal(false),
    }).strict();
const workerStartupResultSchema = z.object({ opening: workerStartupOpenedSchema, construction: workerStartupConstructionSchema,
  workerIdentity: z.object({ projectUuid: diagnosticLifecycleDigestSchema, branchUuid: token,
    windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict(),
  ancillaryFrame: z.record(z.string(), z.unknown()).nullable(), executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
const workerStartup209ResultSchema = workerStartupResultSchema.extend({ construction: workerStartupConstructionSchema.extend({
  profile: z.literal("private.current-pcb209-worker-construction.v1"),
}) });
const workerStartupOpeningResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-opening-result.v1"), ...base,
  operationId: startupOpeningId, intentSha256: diagnosticLifecycleDigestSchema,
  result: z.union([workerStartupResultSchema, workerStartup209ResultSchema]), executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES &&
  (value.operationId.startsWith(CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX) || value.operationId.startsWith(CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX) || value.operationId.startsWith(CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX) || value.operationId.startsWith(CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX)) ===
    (value.result.construction.profile === "private.current-pcb209-worker-construction.v1"), "Startup opening generation or bound differs.");
const workerStartupEmptyIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-empty-intent.v1"), ...base,
  operationId: currentPcb209EmptyStartupIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  openingIntentSha256: diagnosticLifecycleDigestSchema, openingResultSha256: diagnosticLifecycleDigestSchema,
  acceptNormalOpenEffects: z.literal(true),
}).strict();
const workerStartupEmptyResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-empty-result.v1"), ...base,
  operationId: currentPcb209EmptyStartupIdSchema, intentSha256: diagnosticLifecycleDigestSchema,
  pcb: currentPcb209WorkerStartupPcbPacketSchema, result: currentPcb209WorkerStartupEmptyPacketSchema,
  validationOnly: z.literal(true), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value)) + 1 <= CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES &&
  value.result.pcbPacketSha256 === sha256Json(value.pcb) &&
  value.result.baseline.common.identity.projectUuid === value.pcb.openingObservation.projectUuid &&
  value.result.baseline.common.identity.branchUuid === value.pcb.openingObservation.branchUuid &&
  value.result.baseline.common.identity.documentUuid === value.pcb.openingObservation.documentUuid,
"Empty startup result evidence or byte bound differs.");
const workerStartupRatlineIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-ratline-intent.v1"), ...base,
  operationId: currentPcb209RatlineStartupIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  openingIntentSha256: diagnosticLifecycleDigestSchema, openingResultSha256: diagnosticLifecycleDigestSchema,
  acceptNormalOpenEffects: z.literal(true), acceptDebuggerPause: z.literal(true),
}).strict();
const workerStartupRatlineResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-ratline-result.v1"), ...base,
  operationId: currentPcb209RatlineStartupIdSchema, intentSha256: diagnosticLifecycleDigestSchema, result: currentPcb209RatlineNativePacketSchema,
  validationOnly: z.literal(true), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value)) + 1 <= CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES,
  "Ratline held-import result exceeds its byte bound.");
const workerStartupContinuationIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-continuation-intent.v1"), ...base,
  operationId: currentPcb209RatlineContinuationIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  openingIntentSha256: diagnosticLifecycleDigestSchema, openingResultSha256: diagnosticLifecycleDigestSchema,
  acceptNormalOpenEffects: z.literal(true), acceptDebuggerPause: z.literal(true),
}).strict();
const workerStartupContinuationResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-worker-startup-continuation-result.v1"), ...base,
  operationId: currentPcb209RatlineContinuationIdSchema, intentSha256: diagnosticLifecycleDigestSchema, result: currentPcb209RatlineContinuationNativePacketSchema,
  validationOnly: z.literal(true), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value)) + 1 <= CURRENT_PCB_209_RATLINE_CONTINUATION_RESULT_MAX_BYTES,
  "Ratline continuation result exceeds its byte bound.");
const workerStartupAssignmentsIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-assignments-intent.v1"), ...base,
  operationId: startupId, bindingSha256: diagnosticLifecycleDigestSchema,
  openingResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupAssignmentsSchema = z.object({
  profile: z.literal("private.current-pcb-worker-construction-assignments.v1"),
  callbackKinds: z.tuple([z.literal("uploadStructure"), z.literal("structure"), z.literal("cooperation"), z.literal("upload")]),
  originalConstructionCallbacksMatched: z.literal(true), originalCallbackReceiversVerified: z.literal(true),
  currentProjectWrapperRelationsVerified: z.literal(true), continuousAssignmentOwnershipVerified: z.literal(false),
  nativeChannelIntrinsicAndPeerOwnershipVerified: z.literal(false), completePublishersVerified: z.literal(false),
  writeDestinationsContained: z.literal(false), atomicSnapshotVerified: z.literal(false),
  queueCompletionVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
const workerStartupAssignmentsResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-assignments-result.v1"), ...base,
  operationId: startupId, intentSha256: diagnosticLifecycleDigestSchema,
  result: workerStartupAssignmentsSchema, pointInTimeObservation: z.literal(true),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
const workerStartupActorIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-actor-intent.v1"), ...base,
  operationId: startupId, bindingSha256: diagnosticLifecycleDigestSchema,
  assignmentsResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupActorResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-actor-result.v1"), ...base,
  operationId: startupId, intentSha256: diagnosticLifecycleDigestSchema,
  result: z.union([currentPcbWorkerStartupActorPacketSchema, currentPcb209WorkerStartupActorPacketSchema]), pointInTimeObservation: z.literal(true),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES &&
  value.operationId.startsWith(CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX) ===
    (value.result.profile === "private.current-pcb209-worker-startup-actor.v1"), "Startup actor generation or bound differs.");
const workerStartupChannelIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-channel-intent.v1"), ...base,
  operationId: startupId, bindingSha256: diagnosticLifecycleDigestSchema,
  assignmentsResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupChannelResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-worker-startup-channel-result.v1"), ...base,
  operationId: startupId, intentSha256: diagnosticLifecycleDigestSchema,
  result: currentPcbWorkerStartupChannelPacketSchema, pointInTimeObservation: z.literal(true),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
const workerStartupFootprintIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-state-intent.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  assignmentsResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupFootprintResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-state-result.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, intentSha256: diagnosticLifecycleDigestSchema,
  result: currentFootprintCopyStatePacketSchema, pointInTimeObservation: z.literal(true),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
const workerStartupFootprintSourceIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-source-intent.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  stateResultSha256: diagnosticLifecycleDigestSchema, beforeSqlSha256: diagnosticLifecycleDigestSchema,
  checkpointSha256: diagnosticLifecycleDigestSchema, sourcePlanSha256: diagnosticLifecycleDigestSchema,
  comparison: z.literal("complete-checkpoint-records-native-order"),
  ...currentPcb209WorkerStartupFootprintSourceInputSchema.shape,
}).strict();
// The native observation already caps its JSON encoding near 4MiB. This bound
// Includes the durable packet and chain metadata; it does not change any other
// Journal family's allowance or permit truncating source/effect evidence.
const FOOTPRINT_SOURCE_RESULT_MAX_BYTES = 4 * 1024 * 1024 + 64 * 1024;
const workerStartupFootprintSourceResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-source-result.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, intentSha256: diagnosticLifecycleDigestSchema,
  result: currentFootprintSourceReadPacketSchema,
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => value.result.route === "native-cache-equivalent" &&
  Buffer.byteLength(canonicalJson(value)) + 1 <= FOOTPRINT_SOURCE_RESULT_MAX_BYTES,
  "Footprint source result exceeds its complete evidence bound.");
const workerStartupFootprintPreparationIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-preparation-intent.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, bindingSha256: diagnosticLifecycleDigestSchema,
  sourceResultSha256: diagnosticLifecycleDigestSchema,
}).strict();
const workerStartupFootprintPreparationResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb209-footprint-preparation-result.v1"), ...base,
  operationId: currentPcb209WorkerStartupLifecycleIdSchema, intentSha256: diagnosticLifecycleDigestSchema,
  result: currentFootprintCopyPreparationSchema, executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
const pcbOpenIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-pcb-open-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, projectOpeningIntentSha256: diagnosticLifecycleDigestSchema,
  projectOpeningResultSha256: diagnosticLifecycleDigestSchema, acceptNormalOpenEffects: z.literal(true),
}).strict();
const pcbOpenResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-pcb-open-result.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, result: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "PCB opening result exceeds its bound.");
export const diagnosticLifecycleRecordSchemas = {
  "intent.json": intentSchema, "binding.json": bindingSchema, "close-intent.json": closeIntentSchema,
  "close-acknowledged.json": closeAcknowledgmentSchema, "terminated.json": terminationSchema,
  "release-intent.json": releaseIntentSchema, "released.json": releasedSchema,
  "unlaunched-release-intent.json": unlaunchedIntentSchema, "not-dispatched.json": notDispatchedSchema,
  "no-process-release-intent.json": noProcessIntentSchema, "no-process-released.json": noProcessReleasedSchema,
  "browser-intent.json": observationIntentSchema, "browser-result.json": observationResultSchema,
  "frames-intent.json": observationIntentSchema, "frames-result.json": observationResultSchema,
  "script-intent.json": observationIntentSchema, "script-result.json": observationResultSchema,
  "workers-intent.json": observationIntentSchema, "workers-result.json": observationResultSchema,
  "worker-script-intent.json": observationIntentSchema, "worker-script-result.json": observationResultSchema,
  "worker-state-intent.json": observationIntentSchema, "worker-state-result.json": observationResultSchema,
  "model-state-intent.json": observationIntentSchema, "model-state-result.json": observationResultSchema,
  "project-opening-intent.json": projectOpeningIntentSchema, "project-opening-result.json": projectOpeningResultSchema,
  "pcb-open-intent.json": pcbOpenIntentSchema, "pcb-open-result.json": pcbOpenResultSchema,
  "pcb-opening-intent.json": observationIntentSchema, "pcb-opening-result.json": observationResultSchema,
  "layers209-intent.json": observationIntentSchema, "layers209-result.json": observationResultSchema,
  "primitives209-intent.json": observationIntentSchema, "primitives209-result.json": observationResultSchema,
  "extended-primitives209-intent.json": observationIntentSchema, "extended-primitives209-result.json": observationResultSchema,
  "selection-relations209-intent.json": observationIntentSchema, "selection-relations209-result.json": observationResultSchema,
  "pad-shapes209-intent.json": observationIntentSchema, "pad-shapes209-result.json": observationResultSchema,
  "image-shapes209-intent.json": observationIntentSchema, "image-shapes209-result.json": observationResultSchema,
  "arc-shapes209-intent.json": observationIntentSchema, "arc-shapes209-result.json": observationResultSchema,
  "poured-shapes209-intent.json": observationIntentSchema, "poured-shapes209-result.json": observationResultSchema,
  "string-precreate-intent.json": stringPrecreateIntentSchema, "string-precreate-result.json": stringPrecreateResultSchema,
  "common-baseline-intent.json": commonBaselineIntentSchema, "common-baseline-result.json": commonBaselineResultSchema,
  "common-baseline-failure.json": commonBaselineFailureSchema,
  "worker-startup-handoff-intent.json": workerStartupHandoffIntentSchema,
  "worker-startup-handoff-result.json": workerStartupHandoffResultSchema,
  "worker-startup-opening-intent.json": workerStartupOpeningIntentSchema,
  "worker-startup-opening-result.json": workerStartupOpeningResultSchema,
  "worker-startup-empty-intent.json": workerStartupEmptyIntentSchema,
  "worker-startup-empty-result.json": workerStartupEmptyResultSchema,
  "worker-startup-ratline-intent.json": workerStartupRatlineIntentSchema,
  "worker-startup-ratline-result.json": workerStartupRatlineResultSchema,
  "worker-startup-continuation-intent.json": workerStartupContinuationIntentSchema,
  "worker-startup-continuation-result.json": workerStartupContinuationResultSchema,
  "worker-startup-assignments-intent.json": workerStartupAssignmentsIntentSchema,
  "worker-startup-assignments-result.json": workerStartupAssignmentsResultSchema,
  "worker-startup-actor-intent.json": workerStartupActorIntentSchema,
  "worker-startup-actor-result.json": workerStartupActorResultSchema,
  "worker-startup-footprint-intent.json": workerStartupFootprintIntentSchema,
  "worker-startup-footprint-result.json": workerStartupFootprintResultSchema,
  "worker-startup-footprint-source-intent.json": workerStartupFootprintSourceIntentSchema,
  "worker-startup-footprint-source-result.json": workerStartupFootprintSourceResultSchema,
  "worker-startup-footprint-preparation-intent.json": workerStartupFootprintPreparationIntentSchema,
  "worker-startup-footprint-preparation-result.json": workerStartupFootprintPreparationResultSchema,
  "worker-startup-channel-intent.json": workerStartupChannelIntentSchema,
  "worker-startup-channel-result.json": workerStartupChannelResultSchema,
  "observation-failure.json": observationFailureSchema,
} as const;
export type DiagnosticLifecycleRecords = { readonly [Key in keyof typeof diagnosticLifecycleRecordSchemas]?: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]> };
export interface DiagnosticLifecycleOperation { readonly operationId: string; readonly records: DiagnosticLifecycleRecords }
export type DiagnosticLifecycleBinding = z.infer<typeof diagnosticLifecycleBindingSchema>;
export type DiagnosticLifecycleRecordName = keyof typeof diagnosticLifecycleRecordSchemas;
type RecordName = DiagnosticLifecycleRecordName;
export interface CurrentPcbDiagnosticLaunchLease { readonly profile: "private.pcb-diagnostic-launch-exclusion.v1" }
let launchLease: CurrentPcbDiagnosticLaunchLease | null = null;
function requireValue(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`PCB_DIAGNOSTIC_LIFECYCLE_${message}`); }
}
function absent(value: unknown): boolean { return value instanceof Error && "code" in value && value.code === "ENOENT"; }
function recordName(value: string): value is RecordName { return Object.hasOwn(diagnosticLifecycleRecordSchemas, value); }
function recordBound(name: RecordName): number {
  // Six JSON bytes per UTF-16 code unit covers control-character escapes in16 IDs.
  if (name === "selection-relations209-intent.json") { return MAX_BYTES + 16 * 256 * 6; }
  // Two 4096-unit paths can each require six JSON bytes per UTF-16 unit;
  // The remaining schema-bounded fields fit within the ordinary 8 KiB envelope.
  if (name === "project-opening-intent.json" || name === "worker-startup-opening-intent.json") { return 64 * 1024; }
  if (name === "string-precreate-result.json") { return STRING_PRECREATE_OBSERVATION_MAX_BYTES + MAX_BYTES; }
  if (name === "primitives209-result.json") { return CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES + MAX_BYTES; }
  if (name === "extended-primitives209-result.json") { return CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES + MAX_BYTES; }
  if (name === "image-shapes209-result.json") { return CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES + MAX_BYTES; }
  if (name === "arc-shapes209-result.json") { return CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES + MAX_BYTES; }
  if (name === "poured-shapes209-result.json") { return CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES + MAX_BYTES; }
  if (name === "pad-shapes209-result.json") { return CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES + MAX_BYTES; }
  if (name === "selection-relations209-result.json") { return CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES + MAX_BYTES; }
  if (name === "common-baseline-failure.json") { return CURRENT_PCB_COMMON_FAILURE_MAX_BYTES + MAX_BYTES; }
  if (name === "worker-startup-continuation-result.json") { return CURRENT_PCB_209_RATLINE_CONTINUATION_RESULT_MAX_BYTES; }
  if (name === "worker-startup-footprint-source-result.json") { return FOOTPRINT_SOURCE_RESULT_MAX_BYTES; }
  if (name === "worker-startup-ratline-result.json") { return CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES; }
  if (name === "worker-startup-empty-result.json") { return CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES; }
  return name.endsWith("-result.json") ? DIAGNOSTIC_OBSERVATION_MAX_BYTES + MAX_BYTES : MAX_BYTES;
}
function same(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "mode", "nlink", "size", "mtimeNs", "ctimeNs"] as const).every(key => left[key] === right[key]);
}

/** Root must wrap every ordinary/replacement launch in this same gate. The
 * original lexical lease alone releases it; JSON and copied IDs cannot. This
 * process-local gate supplements durable scans and the facade's sole-host lease. */
export function acquireCurrentPcbDiagnosticLaunchExclusion(): CurrentPcbDiagnosticLaunchLease {
  requireValue(launchLease === null, "LAUNCH_BUSY");
  const original = Object.freeze({ profile: "private.pcb-diagnostic-launch-exclusion.v1" as const });
  launchLease = original; return original;
}
export function assertCurrentPcbDiagnosticLaunchExclusion(original: CurrentPcbDiagnosticLaunchLease): void {
  requireValue(launchLease === original, "LAUNCH_LEASE_CHANGED");
}
export function releaseCurrentPcbDiagnosticLaunchExclusion(original: CurrentPcbDiagnosticLaunchLease): void {
  assertCurrentPcbDiagnosticLaunchExclusion(original); launchLease = null;
}
export async function withCurrentPcbDiagnosticLaunchExclusion<T>(action: () => Promise<T>): Promise<T> {
  const original = acquireCurrentPcbDiagnosticLaunchExclusion();
  try { return await action(); }
  finally { releaseCurrentPcbDiagnosticLaunchExclusion(original); }
}

async function entries(directory: ControlRootDirectory, limit: number): Promise<Dirent[]> {
  const result: Dirent[] = [];
  const handle = await opendir(`/proc/self/fd/${String(directory.handle.fd)}`);
  for await (const entry of handle) {
    requireValue(result.length < limit, "INVENTORY_BOUND"); result.push(entry);
  }
  return result;
}
async function readRecord(directory: ControlRootDirectory, name: RecordName): Promise<unknown> {
  const path = `/proc/self/fd/${String(directory.handle.fd)}/${name}`;
  // oxlint-disable-next-line no-bitwise -- Bound regular journal descriptors must not follow links or block on devices.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const initial = await handle.stat({ bigint: true });
    requireValue(initial.isFile() && initial.nlink === 1n && initial.size > 0n && initial.size <= BigInt(recordBound(name)) &&
      initial.mode % 512n === 0o600n && typeof process.getuid === "function" && initial.uid === BigInt(process.getuid()), "RECORD_AUTHORITY");
    const bytes = Buffer.alloc(Number(initial.size) + 1); let count = 0;
    while (count < bytes.length) {
      const read = await handle.read(bytes, count, bytes.length - count, count);
      if (read.bytesRead === 0) { break; } count += read.bytesRead;
    }
    requireValue(count === Number(initial.size) && same(initial, await handle.stat({ bigint: true })) &&
      same(initial, await lstat(path, { bigint: true })), "RECORD_CHANGED");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, count))) as unknown;
  } finally { await handle.close(); }
}
function validateChain(operation: DiagnosticLifecycleOperation): void {
  const records = operation.records;
  for (const record of Object.values(records)) { requireValue(record.operationId === operation.operationId, "RECORD_OPERATION"); }
  const binding = records["binding.json"], close = records["close-intent.json"], intent = records["intent.json"];
  const acknowledgment = records["close-acknowledged.json"], termination = records["terminated.json"];
  const release = records["release-intent.json"], released = records["released.json"];
  const notDispatched = records["not-dispatched.json"], unlaunched = records["unlaunched-release-intent.json"];
  const noProcess = records["no-process-release-intent.json"], noProcessReleased = records["no-process-released.json"];
  const stringPurpose = intent?.schema === "easyeda-pro-control.pcb-string-precreate-launch-intent.v1";
  const startupEmpty209 = intent?.schema === "easyeda-pro-control.pcb209-empty-startup-launch-intent.v1";
  const startupLegacy209 = intent?.schema === "easyeda-pro-control.pcb209-worker-startup-launch-intent.v1";
  const startupRatline209 = intent?.schema === "easyeda-pro-control.pcb209-ratline-startup-launch-intent.v1";
  const startupContinuation209 = intent?.schema === "easyeda-pro-control.pcb209-ratline-continuation-launch-intent.v1";
  const startup209 = startupLegacy209 || startupEmpty209 || startupRatline209 || startupContinuation209;
  const startup206 = intent?.schema === "easyeda-pro-control.pcb-worker-startup-launch-intent.v1";
  const startupPurpose = startup206 || startup209;
  requireValue(!stringPurpose || operation.operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX), "STRING_PURPOSE_ID");
  requireValue(intent === undefined || stringPurpose || !operation.operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX), "RESERVED_STRING_PURPOSE_ID");
  requireValue(!startup206 || operation.operationId.startsWith(CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX), "WORKER_STARTUP_PURPOSE_ID");
  requireValue(!startupLegacy209 || operation.operationId.startsWith(CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX), "WORKER_STARTUP209_PURPOSE_ID");
  requireValue(!startupEmpty209 || operation.operationId.startsWith(CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX), "WORKER_STARTUP_EMPTY209_PURPOSE_ID");
  requireValue(!startupRatline209 || operation.operationId.startsWith(CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX), "WORKER_STARTUP_RATLINE209_PURPOSE_ID");
  requireValue(intent === undefined || startupRatline209 || !operation.operationId.startsWith(CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX), "RESERVED_WORKER_STARTUP_RATLINE209_PURPOSE_ID");
  requireValue(startupRatline209 || records["worker-startup-ratline-intent.json"] === undefined && records["worker-startup-ratline-result.json"] === undefined,
    "WORKER_STARTUP_RATLINE209_PURPOSE_REQUIRED");
  requireValue(!startupContinuation209 || operation.operationId.startsWith(CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX), "WORKER_STARTUP_CONTINUATION209_PURPOSE_ID");
  requireValue(intent === undefined || startupContinuation209 || !operation.operationId.startsWith(CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX), "RESERVED_WORKER_STARTUP_CONTINUATION209_PURPOSE_ID");
  requireValue(startupContinuation209 || records["worker-startup-continuation-intent.json"] === undefined && records["worker-startup-continuation-result.json"] === undefined,
    "WORKER_STARTUP_CONTINUATION209_PURPOSE_REQUIRED");
  requireValue(intent === undefined || startup206 || !operation.operationId.startsWith(CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX), "RESERVED_WORKER_STARTUP_PURPOSE_ID");
  requireValue(intent === undefined || startupLegacy209 || !operation.operationId.startsWith(CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX), "RESERVED_WORKER_STARTUP209_PURPOSE_ID");
  requireValue(intent === undefined || startupEmpty209 || !operation.operationId.startsWith(CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX), "RESERVED_WORKER_STARTUP_EMPTY209_PURPOSE_ID");
  requireValue(startupEmpty209 || records["worker-startup-empty-intent.json"] === undefined && records["worker-startup-empty-result.json"] === undefined,
    "WORKER_STARTUP_EMPTY209_PURPOSE_REQUIRED");
  requireValue(stringPurpose || records["string-precreate-intent.json"] === undefined && records["string-precreate-result.json"] === undefined, "STRING_PURPOSE_REQUIRED");
  requireValue(stringPurpose || records["common-baseline-intent.json"] === undefined && records["common-baseline-result.json"] === undefined &&
    records["common-baseline-failure.json"] === undefined && records["project-opening-intent.json"]?.commonBeforeSqlSha256 === undefined,
  "COMMON_PURPOSE_REQUIRED");
  requireValue(!stringPurpose || records["model-state-intent.json"] === undefined && records["worker-state-intent.json"] === undefined &&
    (records["script-intent.json"] === undefined || records["script-intent.json"].family === "ui"), "STRING_PURPOSE_BRANCH");
  requireValue(!startupPurpose || records["workers-intent.json"] === undefined && records["worker-script-intent.json"] === undefined &&
    records["worker-state-intent.json"] === undefined && records["model-state-intent.json"] === undefined &&
    records["project-opening-intent.json"] === undefined && records["pcb-open-intent.json"] === undefined &&
    records["pcb-opening-intent.json"] === undefined &&
    (records["script-intent.json"] === undefined || records["script-intent.json"].family === "ui"), "WORKER_STARTUP_PURPOSE_BRANCH");
  const handedOff = records["worker-startup-handoff-result.json"], handoff = records["worker-startup-handoff-intent.json"];
  const qualifiedUi = records["script-result.json"];
  requireValue(!startup209 || qualifiedUi === undefined || qualifiedUi.result["family"] === "ui" &&
    qualifiedUi.result["sourceVerified"] === true && qualifiedUi.result["sourceSha256"] === CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256 &&
    qualifiedUi.result["sourceBytes"] === CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes &&
    qualifiedUi.result["relativePath"] === CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath, "WORKER_STARTUP209_UI_SOURCE");
  requireValue(handoff === undefined || startupPurpose && binding !== undefined && binding.launchAcknowledged &&
    binding.binding.rootCreated !== "0" && handoff.bindingSha256 === sha256Json(binding) && qualifiedUi !== undefined &&
    handoff.scriptResultSha256 === sha256Json(qualifiedUi) && records["script-intent.json"]?.family === "ui" &&
    qualifiedUi.result["family"] === "ui" && qualifiedUi.result["sourceVerified"] === true, "WORKER_STARTUP_HANDOFF_CHAIN");
  requireValue(handedOff === undefined || handoff !== undefined && handedOff.intentSha256 === sha256Json(handoff), "WORKER_STARTUP_HANDOFF_RESULT_CHAIN");
  const startupOpened = records["worker-startup-opening-result.json"], startupOpening = records["worker-startup-opening-intent.json"];
  requireValue(startupOpened === undefined || (startupOpened.result.construction.profile === "private.current-pcb209-worker-construction.v1") === startup209,
    "WORKER_STARTUP_CONSTRUCTION_GENERATION");
  requireValue(startupOpening === undefined || startupPurpose && handedOff !== undefined && binding !== undefined &&
    startupOpening.handoffResultSha256 === sha256Json(handedOff) && startupOpening.bindingSha256 === sha256Json(binding), "WORKER_STARTUP_OPENING_CHAIN");
  requireValue(startupOpened === undefined || startupOpening !== undefined && startupOpened.intentSha256 === sha256Json(startupOpening) &&
    startupOpened.result.opening.projectUuid === startupOpening.target.projectUuid &&
    startupOpened.result.opening.branchUuid === startupOpening.target.branchUuid &&
    startupOpened.result.opening.documentUuid === startupOpening.target.documentUuid &&
    startupOpened.result.workerIdentity.projectUuid === startupOpening.target.projectUuid &&
    startupOpened.result.workerIdentity.branchUuid === startupOpening.target.branchUuid &&
    startupOpened.result.workerIdentity.windowTabId === startupOpened.result.opening.observation.windowTabId, "WORKER_STARTUP_OPENING_RESULT_CHAIN");
  const empty = records["worker-startup-empty-intent.json"], emptyResult = records["worker-startup-empty-result.json"];
  requireValue(empty === undefined || startupEmpty209 && binding !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    empty.bindingSha256 === sha256Json(binding) && empty.openingIntentSha256 === sha256Json(startupOpening) &&
    empty.openingResultSha256 === sha256Json(startupOpened), "WORKER_STARTUP_EMPTY209_CHAIN");
  requireValue(emptyResult === undefined || empty !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    emptyResult.intentSha256 === sha256Json(empty) && emptyResult.pcb.targetSha256 === sha256Json(startupOpening.target) &&
    emptyResult.pcb.constructionPacketSha256 === sha256Json(startupOpened.result.construction) &&
    emptyResult.pcb.openingObservation.projectUuid === startupOpening.target.projectUuid &&
    emptyResult.pcb.openingObservation.branchUuid === startupOpening.target.branchUuid &&
    emptyResult.pcb.openingObservation.documentUuid === startupOpening.target.documentUuid &&
    emptyResult.pcb.openingObservation.windowTabId === startupOpened.result.workerIdentity.windowTabId &&
    emptyResult.result.baseline.common.historicalHeader.beforeSqlSha256 === startupOpening.beforeSqlSha256 &&
    emptyResult.result.baseline.common.historicalHeader.checkpointSha256 === startupOpening.preparationCheckpoint.sha256,
  "WORKER_STARTUP_EMPTY209_RESULT_CHAIN");
  const ratline = records["worker-startup-ratline-intent.json"], ratlineResult = records["worker-startup-ratline-result.json"];
  requireValue(ratline === undefined || startupRatline209 && binding !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    ratline.bindingSha256 === sha256Json(binding) && ratline.openingIntentSha256 === sha256Json(startupOpening) &&
    ratline.openingResultSha256 === sha256Json(startupOpened), "WORKER_STARTUP_RATLINE209_CHAIN");
  requireValue(ratlineResult === undefined || ratline !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    ratlineResult.intentSha256 === sha256Json(ratline) && ratlineResult.result.targetSha256 === sha256Json(startupOpening.target) &&
    ratlineResult.result.originalProjectConstructionSha256 === sha256Json(startupOpened.result.construction), "WORKER_STARTUP_RATLINE209_RESULT_CHAIN");
  const continuation = records["worker-startup-continuation-intent.json"], continuationResult = records["worker-startup-continuation-result.json"];
  requireValue(continuation === undefined || startupContinuation209 && binding !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    continuation.bindingSha256 === sha256Json(binding) && continuation.openingIntentSha256 === sha256Json(startupOpening) &&
    continuation.openingResultSha256 === sha256Json(startupOpened), "WORKER_STARTUP_CONTINUATION209_CHAIN");
  requireValue(continuationResult === undefined || continuation !== undefined && startupOpening !== undefined && startupOpened !== undefined &&
    continuationResult.intentSha256 === sha256Json(continuation) && continuationResult.result.targetSha256 === sha256Json(startupOpening.target) &&
    continuationResult.result.originalProjectConstructionSha256 === sha256Json(startupOpened.result.construction), "WORKER_STARTUP_CONTINUATION209_RESULT_CHAIN");
  const assigned = records["worker-startup-assignments-result.json"], assignments = records["worker-startup-assignments-intent.json"];
  requireValue(assignments === undefined || startupPurpose && startupOpened !== undefined && binding !== undefined &&
    assignments.openingResultSha256 === sha256Json(startupOpened) && assignments.bindingSha256 === sha256Json(binding), "WORKER_STARTUP_ASSIGNMENTS_CHAIN");
  requireValue(assigned === undefined || assignments !== undefined && assigned.intentSha256 === sha256Json(assignments),
    "WORKER_STARTUP_ASSIGNMENTS_RESULT_CHAIN");
  const actor = records["worker-startup-actor-intent.json"], actorResult = records["worker-startup-actor-result.json"];
  requireValue(actorResult === undefined || (actorResult.result.profile === "private.current-pcb209-worker-startup-actor.v1") === startup209,
    "WORKER_STARTUP_ACTOR_GENERATION");
  requireValue(actor === undefined || startupPurpose && assigned !== undefined && binding !== undefined &&
    actor.assignmentsResultSha256 === sha256Json(assigned) && actor.bindingSha256 === sha256Json(binding), "WORKER_STARTUP_ACTOR_CHAIN");
  requireValue(actorResult === undefined || actor !== undefined && startupOpened !== undefined && actorResult.intentSha256 === sha256Json(actor) &&
    canonicalJson(actorResult.result.profile === "private.current-pcb209-worker-startup-actor.v1" ? actorResult.result.originalActorPacket.identity : actorResult.result.identity) === canonicalJson(startupOpened.result.workerIdentity), "WORKER_STARTUP_ACTOR_RESULT_CHAIN");
  const footprint = records["worker-startup-footprint-intent.json"], footprintResult = records["worker-startup-footprint-result.json"];
  requireValue(footprint === undefined || startup209 && startupPurpose && assigned !== undefined && binding !== undefined &&
    footprint.assignmentsResultSha256 === sha256Json(assigned) && footprint.bindingSha256 === sha256Json(binding), "WORKER_STARTUP_FOOTPRINT_CHAIN");
  requireValue(footprintResult === undefined || footprint !== undefined && startupOpened !== undefined &&
    footprintResult.intentSha256 === sha256Json(footprint) && canonicalJson(footprintResult.result.identity) === canonicalJson(startupOpened.result.workerIdentity),
  "WORKER_STARTUP_FOOTPRINT_RESULT_CHAIN");
  const footprintSource = records["worker-startup-footprint-source-intent.json"], footprintSourceResult = records["worker-startup-footprint-source-result.json"];
  requireValue(footprintSource === undefined || startup209 && startupPurpose && footprintResult !== undefined &&
    binding !== undefined && startupOpening !== undefined && footprintSource.bindingSha256 === sha256Json(binding) &&
    footprintSource.stateResultSha256 === sha256Json(footprintResult) &&
    footprintSource.beforeSqlSha256 === startupOpening.beforeSqlSha256 &&
    footprintSource.checkpointSha256 === startupOpening.preparationCheckpoint.sha256, "WORKER_STARTUP_FOOTPRINT_SOURCE_CHAIN");
  requireValue(footprintSourceResult === undefined || footprintSource !== undefined && footprintResult !== undefined &&
    footprintSourceResult.intentSha256 === sha256Json(footprintSource) &&
    footprintSourceResult.result.comparison === footprintSource.comparison &&
    footprintSourceResult.result.request.footprintUuid === footprintSource.footprintUuid &&
    footprintSourceResult.result.request.client === footprintResult.result.client &&
    footprintSourceResult.result.request.maximumTicket === footprintResult.result.maximumTicket &&
    canonicalJson(footprintSourceResult.result.request.identity) === canonicalJson(footprintResult.result.identity),
  "WORKER_STARTUP_FOOTPRINT_SOURCE_RESULT_CHAIN");
  const footprintPreparation = records["worker-startup-footprint-preparation-intent.json"];
  const footprintPrepared = records["worker-startup-footprint-preparation-result.json"];
  requireValue(footprintPreparation === undefined || operation.records["intent.json"]?.schema === "easyeda-pro-control.pcb209-worker-startup-launch-intent.v1" &&
    binding !== undefined && footprintSourceResult !== undefined && footprintPreparation.bindingSha256 === sha256Json(binding) &&
    footprintPreparation.sourceResultSha256 === sha256Json(footprintSourceResult), "WORKER_STARTUP_FOOTPRINT_PREPARATION_CHAIN");
  requireValue(footprintPrepared === undefined || footprintPreparation !== undefined && footprintSource !== undefined && footprintSourceResult !== undefined &&
    footprintPrepared.intentSha256 === sha256Json(footprintPreparation) &&
    footprintPrepared.result.beforeCheckpointSha256 === footprintSource.checkpointSha256 &&
    footprintPrepared.result.beforeSqlSha256 === footprintSource.beforeSqlSha256 &&
    footprintPrepared.result.sourcePlanSha256 === footprintSource.sourcePlanSha256 &&
    footprintPrepared.result.sourcePacketSha256 === sha256Json(footprintSourceResult.result), "WORKER_STARTUP_FOOTPRINT_PREPARATION_RESULT_CHAIN");
  const channel = records["worker-startup-channel-intent.json"], channelResult = records["worker-startup-channel-result.json"];
  requireValue(channel === undefined || startupPurpose && assigned !== undefined && binding !== undefined &&
    channel.assignmentsResultSha256 === sha256Json(assigned) && channel.bindingSha256 === sha256Json(binding), "WORKER_STARTUP_CHANNEL_CHAIN");
  requireValue(channelResult === undefined || channel !== undefined && startupOpened !== undefined && channelResult.intentSha256 === sha256Json(channel) &&
    canonicalJson(channelResult.result.identity) === canonicalJson(startupOpened.result.workerIdentity), "WORKER_STARTUP_CHANNEL_RESULT_CHAIN");
  for (const stage of lifecycleObservationStages) {
    const observation = records[`${stage}-intent.json`], result = records[`${stage}-result.json`];
    requireValue(observation === undefined || binding !== undefined && observation.stage === stage &&
      observation.bindingSha256 === sha256Json(binding) && binding.launchAcknowledged && binding.binding.rootCreated !== "0", "OBSERVATION_CHAIN");
    requireValue(result === undefined || observation !== undefined && result.stage === stage && result.intentSha256 === sha256Json(observation), "OBSERVATION_RESULT_CHAIN");
  }
  const observationFailure = records["observation-failure.json"];
  if (observationFailure !== undefined) {
    const stage = observationFailure.stage;
    const observation = records[`${stage}-intent.json`];
    requireValue(observation !== undefined && observationFailure.intentSha256 === sha256Json(observation) &&
      records[`${stage}-result.json`] === undefined && (stage === "string-precreate") === stringPurpose, "OBSERVATION_FAILURE_CHAIN");
  }
  requireValue(records["frames-intent.json"] === undefined || records["browser-result.json"] !== undefined, "FRAMES_CHAIN");
  requireValue(records["script-intent.json"] === undefined || records["frames-result.json"] !== undefined, "SCRIPT_CHAIN");
  requireValue(records["workers-intent.json"] === undefined || records["frames-result.json"] !== undefined, "WORKERS_CHAIN");
  requireValue(records["worker-script-intent.json"] === undefined || records["workers-result.json"] !== undefined, "WORKER_SCRIPT_CHAIN");
  requireValue(records["worker-state-intent.json"] === undefined || records["worker-script-result.json"] !== undefined, "WORKER_STATE_CHAIN");
  const opened = records["project-opening-result.json"], opening = records["project-opening-intent.json"], script = records["script-result.json"];
  const pcbObserved = records["pcb-opening-result.json"], pcbOpen = records["pcb-open-intent.json"], pcbOpened = records["pcb-open-result.json"];
  requireValue(records["layers209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "LAYERS209_CHAIN");
  requireValue(records["primitives209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "PRIMITIVES209_CHAIN");
  requireValue(records["extended-primitives209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "EXTENDED_PRIMITIVES209_CHAIN");
  requireValue(records["pad-shapes209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "PAD_SHAPES209_CHAIN");
  requireValue(records["image-shapes209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "IMAGE_SHAPES209_CHAIN");
  requireValue(records["arc-shapes209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "ARC_SHAPES209_CHAIN");
  requireValue(records["poured-shapes209-intent.json"] === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "POURED_SHAPES209_CHAIN");
  const selectionIntent = records["selection-relations209-intent.json"], selectionResult = records["selection-relations209-result.json"];
  requireValue(selectionIntent === undefined || operation.operationId.startsWith("pcb209-") && pcbObserved !== undefined &&
    pcbObserved.result["sourceVerified"] === true && records["workers-intent.json"] === undefined && records["model-state-intent.json"] === undefined,
  "SELECTION_RELATIONS209_CHAIN");
  requireValue(selectionResult === undefined || selectionIntent !== undefined && Array.isArray(selectionResult.result["requestedComponentIds"]) &&
    canonicalJson(selectionResult.result["requestedComponentIds"]) === canonicalJson(selectionIntent.componentIds), "SELECTION_RELATIONS209_REQUEST");
  requireValue(pcbOpen === undefined || binding !== undefined && pcbOpen.bindingSha256 === sha256Json(binding) &&
    opening !== undefined && pcbOpen.projectOpeningIntentSha256 === sha256Json(opening) && opened !== undefined &&
    pcbOpen.projectOpeningResultSha256 === sha256Json(opened) && opened.result["ok"] === true &&
    opened.result["status"] === "opened-prefix-observed" && opened.result["failure"] === null &&
    (stringPurpose || records["workers-intent.json"] === undefined), "PCB_OPEN_CHAIN");
  requireValue(pcbOpened === undefined || pcbOpen !== undefined && pcbOpened.intentSha256 === sha256Json(pcbOpen), "PCB_OPEN_RESULT_CHAIN");
  requireValue(records["pcb-opening-intent.json"] === undefined || pcbOpened !== undefined &&
    pcbOpened.result["ok"] === true && pcbOpened.result["status"] === "opened" && pcbOpened.result["failure"] === null, "PCB_OPEN_OBSERVATION_CHAIN");
  requireValue(!stringPurpose || records["workers-intent.json"] === undefined ||
    pcbObserved !== undefined && opening !== undefined && diagnosticPcbOpeningSourceAccepted(pcbObserved.result, opening.target), "STRING_WORKERS_SOURCE_CHAIN");
  const stringObservation = records["string-precreate-intent.json"], workerScript = records["worker-script-result.json"];
  const commonObservation = records["common-baseline-intent.json"], commonResult = records["common-baseline-result.json"];
  const commonFailure = records["common-baseline-failure.json"];
  requireValue(commonObservation === undefined || stringPurpose && pcbObserved !== undefined && opening !== undefined &&
    diagnosticPcbOpeningSourceAccepted(pcbObserved.result, opening.target) && commonObservation.pcbOpeningResultSha256 === sha256Json(pcbObserved) &&
    workerScript !== undefined && workerScript.result["sourceVerified"] === true && commonObservation.workerScriptResultSha256 === sha256Json(workerScript) &&
    commonObservation.beforeSqlSha256 === opening.commonBeforeSqlSha256 && commonObservation.checkpointSha256 === opening.preparationCheckpoint.sha256,
  "COMMON_BASELINE_SOURCE_CHAIN");
  requireValue(commonResult === undefined || commonObservation !== undefined && opening !== undefined &&
    canonicalJson(commonResult.result.identity) === canonicalJson({ projectUuid: opening.target.projectUuid, branchUuid: opening.target.branchUuid,
      documentUuid: opening.target.documentUuid }) && commonResult.result.beforeSqlSha256 === commonObservation.beforeSqlSha256 &&
    commonResult.result.checkpointSha256 === commonObservation.checkpointSha256, "COMMON_BASELINE_TARGET_CHAIN");
  requireValue(commonFailure === undefined || commonObservation !== undefined && opening !== undefined &&
    commonFailure.intentSha256 === sha256Json(commonObservation) && canonicalJson(commonFailure.failure.identity) === canonicalJson({
      projectUuid: opening.target.projectUuid, branchUuid: opening.target.branchUuid, documentUuid: opening.target.documentUuid }) &&
    (commonFailure.failure.historicalHeader === null || commonFailure.failure.historicalHeader.beforeSqlSha256 === commonObservation.beforeSqlSha256 &&
      commonFailure.failure.historicalHeader.checkpointSha256 === commonObservation.checkpointSha256), "COMMON_BASELINE_FAILURE_CHAIN");
  const comparisonRefused = commonResult?.result.schema === "easyeda-pro-control.pcb-common-baseline-refusal.v1";
  requireValue(commonResult === undefined || (comparisonRefused ? commonFailure?.failure.nativeContinuationAllowed === true &&
    commonResult.result.historicalHeaderSha256 === commonFailure.failure.historicalHeader?.headerSha256 &&
    commonResult.result.observationSha256 === commonFailure.failure.observationSha256 &&
    canonicalJson(commonResult.result.retainedReplySha256) === canonicalJson(commonFailure.failure.retainedReplySha256) : commonFailure === undefined),
  "COMMON_BASELINE_REFUSAL_CHAIN");
  requireValue(commonFailure === undefined || commonResult === undefined || comparisonRefused, "COMMON_BASELINE_FAILURE_RESULT");
  requireValue(stringObservation === undefined || commonObservation === undefined || commonResult !== undefined &&
    (commonFailure === undefined || comparisonRefused && commonFailure.failure.nativeContinuationAllowed),
    "COMMON_BASELINE_PRECREATE_ORDER");
  requireValue(stringObservation === undefined || stringPurpose && pcbObserved !== undefined && opening !== undefined &&
    diagnosticPcbOpeningSourceAccepted(pcbObserved.result, opening.target) &&
    stringObservation.pcbOpeningResultSha256 === sha256Json(pcbObserved) && workerScript !== undefined &&
    workerScript.result["sourceVerified"] === true && stringObservation.workerScriptResultSha256 === sha256Json(workerScript), "STRING_PRECREATE_SOURCE_CHAIN");
  const stringResult = records["string-precreate-result.json"];
  requireValue(stringResult === undefined || opening !== undefined && stringPrecreateTargetMatches(stringResult.result, opening.target,
    opened?.result, pcbObserved?.result), "STRING_PRECREATE_TARGET_CHAIN");
  requireValue(records["model-state-intent.json"] === undefined ||
    script !== undefined && script.result["family"] === "pcb" && script.result["sourceVerified"] === true &&
      records["script-intent.json"]?.family === "pcb" ||
    pcbObserved !== undefined && opening !== undefined && diagnosticPcbOpeningSourceAccepted(pcbObserved.result, opening.target), "MODEL_STATE_SOURCE_CHAIN");
  requireValue(opening === undefined || binding !== undefined && binding.launchAcknowledged && binding.binding.rootCreated !== "0" &&
    opening.bindingSha256 === sha256Json(binding) && script !== undefined &&
    opening.scriptResultSha256 === sha256Json(script) && script.result["family"] === "ui" && script.result["sourceVerified"] === true &&
    records["script-intent.json"]?.family === "ui", "PROJECT_OPENING_CHAIN");
  requireValue(opened === undefined || opening !== undefined && opened.intentSha256 === sha256Json(opening), "PROJECT_OPENING_RESULT_CHAIN");
  requireValue(binding === undefined || intent !== undefined && binding.intentSha256 === sha256Json(intent), "BINDING_CHAIN");
  requireValue(close === undefined || binding !== undefined && close.bindingSha256 === sha256Json(binding), "CLOSE_CHAIN");
  requireValue(acknowledgment === undefined || close !== undefined && acknowledgment.closeIntentSha256 === sha256Json(close), "CLOSE_ACK_CHAIN");
  requireValue(termination === undefined || binding !== undefined && termination.bindingSha256 === sha256Json(binding), "TERMINATION_CHAIN");
  requireValue(release === undefined || termination !== undefined && release.terminationSha256 === sha256Json(termination), "RELEASE_CHAIN");
  requireValue(released === undefined || release !== undefined && released.releaseIntentSha256 === sha256Json(release), "RELEASE_ACK_CHAIN");
  requireValue(unlaunched === undefined || intent !== undefined && unlaunched.intentSha256 === sha256Json(intent) &&
    binding === undefined && close === undefined && acknowledgment === undefined && termination === undefined && release === undefined && released === undefined, "UNLAUNCHED_CHAIN");
  requireValue(notDispatched === undefined || unlaunched !== undefined && notDispatched.unlaunchedReleaseIntentSha256 === sha256Json(unlaunched) &&
    notDispatched.helperReleased === unlaunched.helperAllocated, "NONDISPATCH_CHAIN");
  requireValue(noProcess === undefined || intent !== undefined && noProcess.intentSha256 === sha256Json(intent) && binding === undefined &&
    unlaunched === undefined && notDispatched === undefined && close === undefined && acknowledgment === undefined &&
    termination === undefined && release === undefined && released === undefined, "NO_PROCESS_CHAIN");
  requireValue(noProcessReleased === undefined || noProcess !== undefined && noProcessReleased.noProcessReleaseIntentSha256 === sha256Json(noProcess), "NO_PROCESS_RELEASE_CHAIN");
}

/** Missing root/parent means no records. Anything else unknown, partial or
 * corrupt refuses the scan or remains an unresolved operation. */
export async function readCurrentPcbDiagnosticLifecycles(): Promise<readonly DiagnosticLifecycleOperation[]> {
  const root = await controlRootCapability(false);
  const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY), false).catch((error: unknown) => {
    if (absent(error)) { return null; } throw error;
  });
  if (parent === null) { return []; }
  try {
    const operations: DiagnosticLifecycleOperation[] = [];
    const children = await entries(parent, MAX_OPERATIONS);
    for (const entry of children.toSorted((left, right) => left.name.localeCompare(right.name))) {
      requireValue(entry.isDirectory() && diagnosticLifecycleIdSchema.safeParse(entry.name).success, "UNKNOWN_OPERATION");
      const slot = await root.openDirectory(join(parent.absolute, entry.name), false);
      try {
        const records: DiagnosticLifecycleRecords = {};
        for (const record of await entries(slot, Object.keys(diagnosticLifecycleRecordSchemas).length)) {
          requireValue(record.isFile() && recordName(record.name), "UNKNOWN_RECORD");
          const name = record.name;
          Object.defineProperty(records, name, { enumerable: true, value: diagnosticLifecycleRecordSchemas[name].parse(await readRecord(slot, name)) });
        }
        const operation = { operationId: entry.name, records };
        validateChain(operation); operations.push(operation);
      } finally { await slot.handle.close(); }
    }
    await root.assertCurrent(); return operations;
  } finally { await parent.handle.close(); }
}

export async function assertNoUnresolvedCurrentPcbDiagnosticLaunches(): Promise<void> {
  await assertNoUnresolvedCurrentPcbStringLedgers();
  const operations = await readCurrentPcbDiagnosticLifecycles();
  requireValue(operations.every(operation => operation.records["released.json"] !== undefined || operation.records["not-dispatched.json"] !== undefined ||
    operation.records["no-process-released.json"] !== undefined), "UNRESOLVED_LAUNCH");
}
export async function reserveCurrentPcbDiagnosticLifecycle(operationId: string): Promise<void> {
  diagnosticLifecycleIdSchema.parse(operationId);
  const root = await controlRootCapability();
  const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY));
  try {
    await mkdir(`/proc/self/fd/${String(parent.handle.fd)}/${operationId}`, { mode: 0o700 });
    await parent.handle.sync(); await root.assertCurrent();
  } finally { await parent.handle.close(); }
}
export async function publishCurrentPcbDiagnosticLifecycleRecord<Key extends RecordName>(operationId: string, name: Key,
  record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): Promise<void> {
  diagnosticLifecycleIdSchema.parse(operationId);
  const parsed = diagnosticLifecycleRecordSchemas[name].parse(record);
  requireValue(parsed.operationId === operationId, "PUBLICATION_OPERATION");
  const bytes = Buffer.from(`${JSON.stringify(parsed)}\n`);
  requireValue(bytes.length <= recordBound(name), "PUBLICATION_BOUND");
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), DIRECTORY, operationId, name),
    "PCB diagnostic lifecycle record", bytes, "easyeda-pro-control.pcb-diagnostic-lifecycle.v1");
}
export function assertCurrentPcbDiagnosticLifecycleSnapshot(actual: readonly DiagnosticLifecycleOperation[], expected: readonly DiagnosticLifecycleOperation[]): void {
  requireValue(canonicalJson(actual) === canonicalJson(expected), "JOURNAL_CHANGED");
}
