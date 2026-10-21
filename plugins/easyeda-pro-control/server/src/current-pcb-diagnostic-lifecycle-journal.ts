/** Private, append-only diagnostic lifecycle records. Historical JSON never
 * recreates a native owner. Partial reservations remain launch blockers. */
/* oxlint-disable import/max-dependencies -- This shared journal validates distinct diagnostic, String and common evidence, including global String exclusion, without merging their authority. */
import { constants } from "node:fs";
import type { BigIntStats, Dirent } from "node:fs";
import { lstat, mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { ControlRootDirectory } from "./control-root.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX, currentPcbStringPrecreateIdSchema } from "./current-pcb-string-precreate-validation.ts";
import { currentPcbObservationFailureSchema } from "./current-pcb-observation-failure.ts";
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
const intentSchema = z.discriminatedUnion("schema", [diagnosticIntentSchema, stringIntentSchema]);
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
export const lifecycleObservationStages = [...diagnosticObservationStageSchema.options, "common-baseline", "string-precreate"] as const;
const observationIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, stage: diagnosticObservationStageSchema,
  targetId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(), frameId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(),
  family: z.enum(["ui", "pcb", "public-api"]).optional(),
}).strict().refine(value => {
  if (value.stage === "browser" || value.stage === "workers" || value.stage === "worker-state" || value.stage === "model-state" || value.stage === "pcb-opening") {
    return value.targetId === undefined && value.frameId === undefined && value.family === undefined;
  }
  if (value.stage === "frames" || value.stage === "worker-script") { return value.targetId !== undefined && value.frameId === undefined && value.family === undefined; }
  return value.targetId === undefined && value.frameId !== undefined && value.family !== undefined;
}, "Observation selectors must match the exact stage.");
const observationResultSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-result.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, stage: diagnosticObservationStageSchema,
  result: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "Observation result exceeds its bound.");
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
  "string-precreate-intent.json": stringPrecreateIntentSchema, "string-precreate-result.json": stringPrecreateResultSchema,
  "common-baseline-intent.json": commonBaselineIntentSchema, "common-baseline-result.json": commonBaselineResultSchema,
  "common-baseline-failure.json": commonBaselineFailureSchema,
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
  // Two 4096-unit paths can each require six JSON bytes per UTF-16 unit;
  // The remaining schema-bounded fields fit within the ordinary 8 KiB envelope.
  if (name === "project-opening-intent.json") { return 64 * 1024; }
  if (name === "string-precreate-result.json") { return STRING_PRECREATE_OBSERVATION_MAX_BYTES + MAX_BYTES; }
  if (name === "common-baseline-failure.json") { return CURRENT_PCB_COMMON_FAILURE_MAX_BYTES + MAX_BYTES; }
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
  requireValue(!stringPurpose || operation.operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX), "STRING_PURPOSE_ID");
  requireValue(intent === undefined || stringPurpose || !operation.operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX), "RESERVED_STRING_PURPOSE_ID");
  requireValue(stringPurpose || records["string-precreate-intent.json"] === undefined && records["string-precreate-result.json"] === undefined, "STRING_PURPOSE_REQUIRED");
  requireValue(stringPurpose || records["common-baseline-intent.json"] === undefined && records["common-baseline-result.json"] === undefined &&
    records["common-baseline-failure.json"] === undefined && records["project-opening-intent.json"]?.commonBeforeSqlSha256 === undefined,
  "COMMON_PURPOSE_REQUIRED");
  requireValue(!stringPurpose || records["model-state-intent.json"] === undefined && records["worker-state-intent.json"] === undefined &&
    (records["script-intent.json"] === undefined || records["script-intent.json"].family === "ui"), "STRING_PURPOSE_BRANCH");
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
