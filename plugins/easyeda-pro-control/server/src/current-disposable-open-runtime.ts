/* oxlint-disable import/max-dependencies -- This operation composes fixed checkpoint, current implementation, retained runtime and shared journal boundaries. */
import { z } from "zod";
import { assertOperationIdUnused, controlDataDirectory, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_MAX_BYTES, CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS, buildCurrentDisposableOpenProgram,
  currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest, validateCurrentDisposableOpenResult } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenRequest, CurrentDisposableOpenSealedTarget, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure } from "./current-disposable-open-diagnostics.ts";
import type { CurrentOpenFailureContext, CurrentOpenFailureDiagnostic } from "./current-disposable-open-diagnostics.ts";
import { prepareCurrentDisposableOpenCheckpoint, prepareCurrentSchematicOperationCheckpoint, prepareCurrentSymbolOperationCheckpoint,
  verifyCurrentDisposableOpenCheckpoint, verifyCurrentSchematicOperationCheckpoint, verifyCurrentSymbolOperationCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { EasyedaControlEngine } from "./engine.ts";
import type { AuthenticatedBridgeSessionIdentity, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";
// oxlint-disable-next-line import/no-cycle -- The fixed preparation stage consumes this module's private original-object issuer after initialization.
import { assertOriginalCurrentOwnedSymbolCopyPreparation, assertOriginalCurrentOwnedSymbolPreparation, currentOwnedSymbolCopyRequestSchema, prepareCurrentOwnedSymbolCopy, prepareCurrentOwnedSymbolMetadata } from "./current-symbol-owned-preparation.ts";
import type { CurrentOwnedSymbolCopyPreparation, CurrentOwnedSymbolMetadataPreparation } from "./current-symbol-owned-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- The baseline consumes the opener's private original-object transfer; public actions cannot construct that owner.
import { CurrentSymbolBaselineCoordinator, currentSymbolBaselineRequestSchema, currentSymbolFinishSnapshotStatus } from "./current-symbol-baseline-runtime.ts";
import { inspectCurrentSymbolClockEvidence } from "./current-symbol-clock-evidence.ts";
import { inspectCurrentSymbolHistory } from "./current-symbol-history-inspection.ts";
// oxlint-disable-next-line import/no-cycle -- The disposable route retains the original baseline; validation never reconstructs its private opener owner.
import { CurrentSymbolValidationCoordinator } from "./current-symbol-validation-runtime.ts";
import { CURRENT_SYMBOL_OPERATION_PURPOSE, parseCurrentSymbolOperationRequest } from "./current-symbol-operation.ts";
import type { CurrentSymbolOperationRequest } from "./current-symbol-operation.ts";
import { CURRENT_SYMBOL_COPY_OPERATION_PURPOSE, parseCurrentSymbolCopyOperationRequest } from "./current-symbol-copy-operation.ts";
// oxlint-disable-next-line import/no-cycle -- The separate disposable copy route retains this opener's original copy baseline, never reconstructed JSON.
import { CurrentSymbolCopyOperationCoordinator } from "./current-symbol-copy-operation-runtime.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { parseCurrentPcbRenameOwnerRequest } from "./current-pcb-rename-owner.ts";
import type { CurrentPcbRenameOwnerIntent } from "./current-pcb-rename-owner.ts";
import { parseCurrentSchematicRenameOwnerRequest } from "./current-schematic-rename-owner.ts";
import type { CurrentSchematicRenameOwnerIntent } from "./current-schematic-rename-owner.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationOpeningRequestSchema } from "./current-schematic-operation.ts";
import type { CurrentSchematicOperationOpeningRequest } from "./current-schematic-operation.ts";
import { currentSchematicOpeningExpectationSchema } from "./current-schematic-operation-startup.ts";
import type { CurrentSchematicOpeningExpectation } from "./current-schematic-operation-startup.ts";

type Value = Record<string, unknown>;
type Phase = "preflight" | "open-project" | "open-document" | "observe";
type OpenRequest = Extract<CurrentDisposableOpenRequest, { action: "open" }>;
type OrdinaryOpenRequest = Extract<CurrentSymbolOperationRequest, { action: "open" }>;
type SchematicOpenRequest = Extract<CurrentSchematicOperationOpeningRequest, { action: "open" }>;
export type CurrentDisposableOpenPurpose = "disposable-validation" | typeof CURRENT_SYMBOL_OPERATION_PURPOSE | typeof CURRENT_SCHEMATIC_OPERATION_PURPOSE;
type SymbolOpenPurpose = Exclude<CurrentDisposableOpenPurpose, typeof CURRENT_SCHEMATIC_OPERATION_PURPOSE>;
type BaselinePurpose = SymbolOpenPurpose | "disposable-symbol-copy";
const PROFILE = "easyeda-pro-control.current-disposable-open.v1";
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const launchSchema = z.object({ jobId: z.string().regex(/^[a-f0-9]{32}$/u), helperInstance: z.string().regex(/^[a-f0-9]{32}$/u),
  root: z.object({ pid: z.number().int().positive(), role: z.literal("easyeda-main"), startIdentity: z.string().regex(/^win32:[0-9]{15,20}:job:[a-f0-9]{32}$/u) }).strict() }).strict()
  .refine((value) => value.root.startIdentity.endsWith(`:job:${value.jobId}`));
const terminationSchema = z.object({ jobId: z.string(), helperInstance: z.string(), terminated: z.literal(true) }).strict();
const closedSessionSchema = z.object({ authenticatedAtEpochMs: z.number().int().nonnegative(), authenticationReceiptSha256: digest,
  sequence: z.number().int().positive(), sessionId: z.string().min(1).max(256), closeReason: z.string().min(1).max(160),
  closedAtEpochMs: z.number().int().nonnegative() }).strict();

interface Plan extends Value {
  profile: typeof PROFILE;
  purpose?: CurrentDisposableOpenPurpose;
  intent: { request: OpenRequest | OrdinaryOpenRequest | SchematicOpenRequest; target: CurrentDisposableOpenSealedTarget; implementation: typeof CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
    startupExpectation?: CurrentSymbolStartupExpectation; schematicExpectation?: CurrentSchematicOpeningExpectation };
  expectedFingerprint: Value;
}
interface OpenJournal extends TrackedDispatchOperationJournal {
  plan: Plan;
  checkpointProof: CurrentDisposableOpenCheckpoint;
  originalLaunch: WindowsAuthorityLaunch;
  projectDispatchConsumed: boolean;
  documentDispatchConsumed: boolean;
  result?: Value;
  failureDiagnostic?: CurrentOpenFailureDiagnostic;
  normalCloseAttempted?: boolean;
  normalCloseAcknowledged?: boolean;
}
type OpenRuntime = Pick<WindowsControlRuntime, "status" | "observeLaunchTermination" | "observeApplicationWindow" | "normalClose">;
interface Retained {
  readonly journal: OpenJournal;
  readonly runtime: OpenRuntime;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchText: string;
  readonly planText: string;
  readonly nativeCleanup: Readonly<Pick<OpenRuntime, "status" | "observeApplicationWindow" | "normalClose">>;
}
interface CopyOpeningCleanup {
  readonly operationId: string;
  readonly opening: Retained;
  readonly openingText: string;
  readonly stage: CurrentSymbolBaselineCoordinator;
  readonly methods: readonly unknown[];
  readonly artifacts: Awaited<ReturnType<typeof writePhaseArtifact>>[];
  failed: boolean;
  failureRecorded: boolean;
  closeAttempted: boolean;
  closeAcknowledged: boolean;
  releaseAttempted: boolean;
  retired: boolean;
}
export interface CurrentDisposableOpenOptions {
  readonly engine: Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertNativeUiEditingAllowed" | "assertRecoveryOperationIsolated" | "assertBridgeAndRecoveryAdmission" |
    "assertBridgeAndNativeUiEditingAdmission" | "dispatchWithOrphanTracking" | "executionAuthorityValidator" | "upstream"> & {
      readonly status: () => Promise<{ stableFingerprint: Value }>;
    };
  readonly runtime: () => OpenRuntime;
  readonly assertOwner: () => void;
}
const defaults = { createOperation, loadOperation, updateOperation, writePhaseArtifact, assertOperationIdUnused,
  prepareCheckpoint: prepareCurrentDisposableOpenCheckpoint, verifyCheckpoint: verifyCurrentDisposableOpenCheckpoint,
  prepareOrdinaryCheckpoint: prepareCurrentSymbolOperationCheckpoint, verifyOrdinaryCheckpoint: verifyCurrentSymbolOperationCheckpoint,
  prepareSchematicCheckpoint: prepareCurrentSchematicOperationCheckpoint, verifySchematicCheckpoint: verifyCurrentSchematicOperationCheckpoint,
  verifyImplementation: verifyCurrentDisposableOpenImplementation, validateFingerprint: validateSdkLocalRuntimeFingerprint };
/** Offline-test seams only; never parsed from a tool request. */
export type CurrentDisposableOpenDependencies = Partial<typeof defaults>;

export interface CurrentDisposableOpenGeneration {
  readonly profile: "private.current-disposable-open-generation.v1";
  readonly operationId: string;
}
export interface CurrentDisposableOpenGenerationSource {
  readonly engine: EasyedaControlEngine;
  readonly runtime: WindowsControlRuntime;
  readonly purpose: CurrentDisposableOpenPurpose;
  readonly startupExpectation?: CurrentSymbolStartupExpectation;
  readonly schematicExpectation?: CurrentSchematicOpeningExpectation;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly expectedFingerprint: Value;
  /** A retained status projection, not an issued launch/close/copy capability. */
  readonly launchProjection: WindowsAuthorityLaunch;
  readonly bridgeSession: AuthenticatedBridgeSessionIdentity;
  /** Ordinary opening may change storage; this is never a post-opening baseline. */
  readonly preNavigationCheckpoint: CurrentDisposableOpenCheckpoint;
}
const issuedGenerations = new WeakMap<object, {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly current: () => void;
  readonly revalidate: () => Promise<void>;
}>();
export interface CurrentPcbRenameOpeningOwner {
  readonly profile: "private.current-pcb-rename-opening-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentPcbRenameOpeningOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly intent: CurrentPcbRenameOwnerIntent;
}
const issuedPcbRenameOpeningOwners = new WeakMap<object, {
  readonly value: CurrentPcbRenameOpeningOwnerSource; readonly current: () => void; readonly revalidate: () => Promise<void>;
  readonly revalidateEvidence: () => Promise<void>;
  state: "retained" | "completed" | "failed";
}>();
/** Original neutral opening transfer, never a converted symbol owner. This
 * retains the historical opening after closure without reviving its session.
 */
export function assertCurrentPcbRenameOpeningOwner(value: unknown, engine: EasyedaControlEngine): CurrentPcbRenameOpeningOwnerSource {
  requireValue(value !== null && typeof value === "object", "Current PCB opening owner is missing.");
  const issued = issuedPcbRenameOpeningOwners.get(value);
  requireValue(issued !== undefined && issued.value.source.engine === engine, "Current PCB opening owner was not issued by this engine.");
  issued.current(); return issued.value;
}
export async function revalidateCurrentPcbRenameOpeningOwner(value: unknown, engine: EasyedaControlEngine): Promise<CurrentPcbRenameOpeningOwnerSource> {
  const original = assertCurrentPcbRenameOpeningOwner(value, engine);
  requireValue(value !== null && typeof value === "object", "Current PCB opening owner is missing.");
  const issued = issuedPcbRenameOpeningOwners.get(value); requireValue(issued !== undefined, "Current PCB opening owner was lost.");
  await issued.revalidate();
  requireValue(assertCurrentPcbRenameOpeningOwner(value, engine) === original, "Current PCB opening owner changed during revalidation.");
  return original;
}
/** Targeted original opening evidence only, not quarantine/isolation admission.
 * The closed PCB clock stage supplies fresh full admission at each effect/result
 * boundary. No caller-selected guard, cached approval or replacement owner.
 */
export async function revalidateCurrentPcbRenameOpeningEvidence(value: unknown, engine: EasyedaControlEngine): Promise<CurrentPcbRenameOpeningOwnerSource> {
  const original = assertCompletedCurrentPcbRenameOpeningTransfer(value, engine);
  requireValue(value !== null && typeof value === "object", "Current PCB opening owner is missing.");
  const issued = issuedPcbRenameOpeningOwners.get(value);
  requireValue(issued !== undefined, "Current PCB opening owner was lost.");
  await issued.revalidateEvidence();
  requireValue(assertCompletedCurrentPcbRenameOpeningTransfer(value, engine) === original,
    "Current PCB opening evidence changed during revalidation.");
  return original;
}
/** Failed scope exit keeps its original object for cleanup only. A successful
 * in-scope transfer alone does not admit subsequent baseline collection.
 */
export function assertCompletedCurrentPcbRenameOpeningTransfer(value: unknown, engine: EasyedaControlEngine): CurrentPcbRenameOpeningOwnerSource {
  const original = assertCurrentPcbRenameOpeningOwner(value, engine);
  requireValue(value !== null && typeof value === "object" && issuedPcbRenameOpeningOwners.get(value)?.state === "completed",
    "Current PCB opening transfer did not complete; its retained owner is cleanup-only.");
  return original;
}
export interface CurrentSchematicRenameOpeningOwner {
  readonly profile: "private.current-schematic-rename-opening-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentSchematicRenameOpeningOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly intent: CurrentSchematicRenameOwnerIntent;
}
const issuedSchematicRenameOpeningOwners = new WeakMap<object, {
  readonly value: CurrentSchematicRenameOpeningOwnerSource; readonly current: () => void; readonly revalidate: () => Promise<void>;
  readonly revalidateEvidence: () => Promise<void>;
  state: "retained" | "completed" | "failed";
}>();
/** Original neutral opening transfer, never a converted symbol owner. This
 * retains the historical opening after closure without reviving its session.
 */
export function assertCurrentSchematicRenameOpeningOwner(value: unknown, engine: EasyedaControlEngine): CurrentSchematicRenameOpeningOwnerSource {
  requireValue(value !== null && typeof value === "object", "Current SCH opening owner is missing.");
  const issued = issuedSchematicRenameOpeningOwners.get(value);
  requireValue(issued !== undefined && issued.value.source.engine === engine, "Current SCH opening owner was not issued by this engine.");
  issued.current(); return issued.value;
}
export async function revalidateCurrentSchematicRenameOpeningOwner(value: unknown, engine: EasyedaControlEngine): Promise<CurrentSchematicRenameOpeningOwnerSource> {
  const original = assertCurrentSchematicRenameOpeningOwner(value, engine);
  requireValue(value !== null && typeof value === "object", "Current SCH opening owner is missing.");
  const issued = issuedSchematicRenameOpeningOwners.get(value); requireValue(issued !== undefined, "Current SCH opening owner was lost.");
  await issued.revalidate();
  requireValue(assertCurrentSchematicRenameOpeningOwner(value, engine) === original, "Current SCH opening owner changed during revalidation.");
  return original;
}
/** Targeted original opening evidence only, not quarantine/isolation admission.
 * A future SCH lifecycle must supply fresh full admission at each effect/result
 * boundary. No caller-selected guard, cached approval or replacement owner.
 */
export async function revalidateCurrentSchematicRenameOpeningEvidence(value: unknown, engine: EasyedaControlEngine): Promise<CurrentSchematicRenameOpeningOwnerSource> {
  const original = assertCompletedCurrentSchematicRenameOpeningTransfer(value, engine);
  requireValue(value !== null && typeof value === "object", "Current SCH opening owner is missing.");
  const issued = issuedSchematicRenameOpeningOwners.get(value);
  requireValue(issued !== undefined, "Current SCH opening owner was lost.");
  await issued.revalidateEvidence();
  requireValue(assertCompletedCurrentSchematicRenameOpeningTransfer(value, engine) === original,
    "Current SCH opening evidence changed during revalidation.");
  return original;
}
/** Failed scope exit keeps its original object for cleanup only. A successful
 * in-scope transfer alone does not admit subsequent baseline collection.
 */
export function assertCompletedCurrentSchematicRenameOpeningTransfer(value: unknown, engine: EasyedaControlEngine): CurrentSchematicRenameOpeningOwnerSource {
  const original = assertCurrentSchematicRenameOpeningOwner(value, engine);
  requireValue(value !== null && typeof value === "object" && issuedSchematicRenameOpeningOwners.get(value)?.state === "completed",
    "Current SCH opening transfer did not complete; its retained owner is cleanup-only.");
  return original;
}
export interface CurrentSymbolBaselineOwner {
  readonly profile: "private.current-symbol-baseline-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentSymbolBaselineOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly preparation: CurrentOwnedSymbolMetadataPreparation;
}
export interface CurrentSymbolCopyBaselineOwner {
  readonly profile: "private.current-symbol-copy-baseline-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentSymbolCopyBaselineOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly preparation: CurrentOwnedSymbolCopyPreparation;
}
const issuedCopyBaselineOwners = new WeakMap<object, {
  readonly value: CurrentSymbolCopyBaselineOwnerSource; readonly current: () => void; readonly revalidate: () => Promise<void>;
}>();
const issuedBaselineOwners = new WeakMap<object, {
  readonly value: CurrentSymbolBaselineOwnerSource; readonly current: () => void; readonly revalidate: () => Promise<void>;
}>();
// The transfer owns the runtime, not just its current Job. A later owned launch
// Must not reopen ordinary navigation or let a sibling baseline take over.
const baselineRuntimeReservations = new WeakSet<object>();

/** One-way transfer out of an active generation. This checks the original
 * opening, runtime and validator, but deliberately not a now-closed session.
 * It grants no termination, copy or subsequent opening authority by itself.
 */
export function assertCurrentSymbolBaselineOwner(value: unknown, engine: EasyedaControlEngine): CurrentSymbolBaselineOwnerSource {
  requireValue(value !== null && typeof value === "object", "Current symbol baseline original owner is missing.");
  const issued = issuedBaselineOwners.get(value);
  requireValue(issued !== undefined && issued.value.source.engine === engine, "Current symbol baseline owner was not issued by this engine.");
  issued.current(); return issued.value;
}
export async function revalidateCurrentSymbolBaselineOwner(value: unknown, engine: EasyedaControlEngine): Promise<CurrentSymbolBaselineOwnerSource> {
  const original = assertCurrentSymbolBaselineOwner(value, engine);
  requireValue(value !== null && typeof value === "object", "Current symbol baseline original owner is missing.");
  const issued = issuedBaselineOwners.get(value);
  requireValue(issued !== undefined, "Current symbol baseline original owner is missing.");
  await issued.revalidate();
  requireValue(assertCurrentSymbolBaselineOwner(value, engine) === original, "Current symbol baseline owner changed during revalidation.");
  return original;
}
export function assertCurrentSymbolCopyBaselineOwner(value: unknown, engine: EasyedaControlEngine): CurrentSymbolCopyBaselineOwnerSource {
  requireValue(value !== null && typeof value === "object", "Current copy baseline original owner is missing.");
  const issued = issuedCopyBaselineOwners.get(value);
  requireValue(issued !== undefined && issued.value.source.engine === engine, "Current copy baseline owner was not issued by this engine.");
  issued.current(); return issued.value;
}
export async function revalidateCurrentSymbolCopyBaselineOwner(value: unknown, engine: EasyedaControlEngine): Promise<CurrentSymbolCopyBaselineOwnerSource> {
  const original = assertCurrentSymbolCopyBaselineOwner(value, engine);
  requireValue(value !== null && typeof value === "object", "Current copy baseline original owner is missing.");
  const issued = issuedCopyBaselineOwners.get(value);
  requireValue(issued !== undefined, "Current copy baseline original owner is missing.");
  await issued.revalidate();
  requireValue(assertCurrentSymbolCopyBaselineOwner(value, engine) === original, "Current copy baseline owner changed during revalidation.");
  return original;
}

/** Fixed lookup of the coordinator's original in-memory owner. JSON, loaded
 * history and a matching launch projection cannot recreate this identity.
 */
export function assertCurrentDisposableOpenGeneration(value: unknown, engine: EasyedaControlEngine): CurrentDisposableOpenGenerationSource {
  requireValue(value !== null && typeof value === "object", "Current disposable-open original generation is missing.");
  const issued = issuedGenerations.get(value);
  requireValue(issued !== undefined && issued.source.engine === engine, "Current disposable-open generation was not issued by this engine's retained coordinator.");
  issued.current(); return issued.source;
}

export async function revalidateCurrentDisposableOpenGeneration(value: unknown, engine: EasyedaControlEngine): Promise<CurrentDisposableOpenGenerationSource> {
  const source = assertCurrentDisposableOpenGeneration(value, engine);
  requireValue(value !== null && typeof value === "object", "Current disposable-open original generation is missing.");
  const issued = issuedGenerations.get(value);
  requireValue(issued !== undefined, "Current disposable-open original generation is missing.");
  await issued.revalidate();
  requireValue(assertCurrentDisposableOpenGeneration(value, engine) === source, "Current disposable-open generation changed during revalidation.");
  return source;
}

function requireValue(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
/** Historical missing purpose is disposable only, never an ordinary edit grant. */
function openingPurpose(value: unknown): CurrentDisposableOpenPurpose {
  if (value === undefined || value === "disposable-validation") { return "disposable-validation"; }
  requireValue(value === CURRENT_SYMBOL_OPERATION_PURPOSE || value === CURRENT_SCHEMATIC_OPERATION_PURPOSE, "Current opening purpose is unsupported.");
  return value;
}
/** Read-only ordinary SCH opening history. Never creates or recovers an owner. */
export async function inspectCurrentSchematicOpeningHistory(operationId: string): Promise<Value> {
  const journal: unknown = await loadOperation(operationId);
  requireValue(isOpenJournal(journal) && journal.operationId === operationId &&
    journal.schema === OPERATION_SCHEMA && canonicalJson(journal.plan.intent.implementation) === canonicalJson(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION) &&
    openingPurpose(journal.plan.purpose) === CURRENT_SCHEMATIC_OPERATION_PURPOSE &&
    journal.planHash === buildPlanHash(journal.plan), "Ordinary SCH opening history has another purpose or malformed plan.");
  const request = currentSchematicOperationOpeningRequestSchema.parse(journal.plan.intent.request);
  requireValue(request.action === "open" && request.operationId === operationId, "Ordinary SCH opening request differs.");
  const target = currentDisposableOpenSealedTargetSchema.parse(journal.plan.intent.target);
  const expectation = currentSchematicOpeningExpectationSchema.parse(journal.plan.intent.schematicExpectation);
  requireValue(canonicalJson(targetOnly(target)) === canonicalJson(targetOnly(request)) &&
    expectation.intent.target.projectUuid === target.projectUuid && expectation.intent.target.branchUuid === target.branchUuid &&
    canonicalJson(expectation.intent) === canonicalJson(request.rename) && journal.checkpointProof.purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE &&
    canonicalJson(expectation) === canonicalJson(journal.checkpointProof.schematicExpectation) &&
    canonicalJson(expectation.startup) === canonicalJson(journal.plan.intent.startupExpectation) &&
    canonicalJson(expectation.startup) === canonicalJson(journal.checkpointProof.startupExpectation), "Ordinary SCH opening history lost its sealed expectation.");
  return { ...summary(journal), originalOwnerRetained: false, continuationAvailable: false, historicalOnly: true,
    normalCloseAttempted: journal.normalCloseAttempted === true };
}
function targetOnly(request: CurrentDisposableOpenTarget): CurrentDisposableOpenTarget {
  return { rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
    documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256 };
}
function hasValidPreparationCheckpoint(checkpoint: Value): boolean {
  if (checkpoint["preparationCheckpoint"] === undefined) { return true; }
  const descriptor = currentDisposableOpenPreparationCheckpointSchema.safeParse(checkpoint["preparationCheckpoint"]), receipt = checkpoint["checkpoint"];
  return descriptor.success && isRecord(receipt) && descriptor.data.path === receipt["checkpoint"] && descriptor.data.sha256 === receipt["checkpointSha256"];
}
function isOpenJournal(value: unknown): value is OpenJournal {
  if (!isRecord(value) || !isRecord(value["plan"]) || !isRecord(value["checkpointProof"])) { return false; }
  const checkpoint = value["checkpointProof"], plan = value["plan"];
  return plan["profile"] === PROFILE && isRecord(plan["intent"]) && isRecord(plan["expectedFingerprint"]) &&
    typeof value["operationId"] === "string" && typeof value["journalPath"] === "string" && typeof value["planHash"] === "string" &&
    typeof value["state"] === "string" && typeof value["mutationState"] === "string" && typeof value["saved"] === "boolean" &&
    typeof value["reopened"] === "boolean" && typeof value["orphanedCallPossible"] === "boolean" && typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" && typeof value["updatedAt"] === "string" &&
    Number.isSafeInteger(value["sequence"]) && typeof value["projectDispatchConsumed"] === "boolean" && typeof value["documentDispatchConsumed"] === "boolean" &&
    Array.isArray(value["artifacts"]) && value["artifacts"].every((item: unknown) => isRecord(item) && typeof item["path"] === "string" &&
      typeof item["bytes"] === "number" && digest.safeParse(item["sha256"]).success) &&
    checkpoint["profile"] === "easyeda-pro-control.current-disposable-open-checkpoint.v1" && isRecord(checkpoint["checkpoint"]) && hasValidPreparationCheckpoint(checkpoint) &&
    isRecord(checkpoint["targetEvidence"]) && launchSchema.safeParse(value["originalLaunch"]).success &&
    (value["failureDiagnostic"] === undefined || currentOpenFailureDiagnosticSchema.safeParse(value["failureDiagnostic"]).success) &&
    (value["normalCloseAttempted"] === undefined || value["normalCloseAttempted"] === true) &&
    (value["normalCloseAcknowledged"] === undefined || value["normalCloseAcknowledged"] === true && value["normalCloseAttempted"] === true);
}
function observationOutcome(result: Value): string {
  if (result["phase"] === "open-document" && result["publicResult"] === null) { return "public-returned-not-opened"; }
  if (result["activeTarget"] === true && result["nativeIdentityVerified"] === true) { return "target-native-identity-observed"; }
  return result["documentPresent"] === true ? "target-present-readiness-unverified" : "target-not-observed";
}
function summary(journal: OpenJournal): Value {
  return { operationId: journal.operationId, state: journal.state, attemptConsumed: true, replayAllowed: false,
    projectDispatchConsumed: journal.projectDispatchConsumed, documentDispatchConsumed: journal.documentDispatchConsumed,
    orphanedCallPossible: journal.orphanedCallPossible, hardStop: journal.hardStop, result: journal.result ?? null,
    failureDiagnostic: journal.failureDiagnostic ?? null,
    normalCloseAttempted: journal.normalCloseAttempted === true, normalCloseAcknowledged: journal.normalCloseAcknowledged === true,
    normalOpenEffectsMayHaveOccurred: journal.mutationMayHaveOccurred, explicitSaveDispatched: false,
    persistenceVerified: false, writerAuthority: false, nextSafeAction: journal.nextSafeAction,
    ...(journal.checkpointProof.preparationCheckpoint === undefined ? {} : { preparationCheckpoint: { ...journal.checkpointProof.preparationCheckpoint } }),
    journalPath: journal.journalPath, artifacts: journal.artifacts };
}

/** One current-version disposable navigation attempt. Retirement ends that
 * attempt after original process/session termination; it cannot continue or
 * repeat it, restore lost supervision, or satisfy shared CAD recovery APIs.
 */
export class CurrentDisposableOpenCoordinator {
  private readonly options: CurrentDisposableOpenOptions;
  private readonly services: typeof defaults;
  private readonly retained = new Map<string, Retained>();
  private readonly productionServices: boolean;
  private readonly generations = new Map<string, CurrentDisposableOpenGeneration>();
  private readonly baselineJobs = new Set<string>();
  private readonly baselines = new Map<string, CurrentSymbolBaselineCoordinator>();
  private readonly baselinePurposes = new Map<string, BaselinePurpose>();
  private readonly validations = new Map<string, CurrentSymbolValidationCoordinator>();
  private readonly ordinaryOperations = new Map<string, CurrentSymbolValidationCoordinator>();
  private readonly copyOperations = new Map<string, CurrentSymbolCopyOperationCoordinator>();
  private readonly copyOpeningCleanups = new Map<string, CopyOpeningCleanup>();
  private readonly normalCloseAttempts = new Set<string>();
  private readonly pcbRenameOpeningOwners = new Map<string, CurrentPcbRenameOpeningOwner>();
  private readonly schematicRenameOpeningOwners = new Map<string, CurrentSchematicRenameOpeningOwner>();
  private busy = false;

  public constructor(options: CurrentDisposableOpenOptions, dependencies: CurrentDisposableOpenDependencies = {}) {
    this.options = options; this.services = { ...defaults, ...dependencies };
    this.productionServices = Reflect.ownKeys(dependencies).length === 0;
  }

  public async run(input: unknown, expectedFingerprint?: Value): Promise<Value> {
    const request = parseCurrentDisposableOpenRequest(structuredClone(input));
    requireValue(!this.busy, "Current disposable opening is already in progress.");
    if (request.action === "validation-begin" || request.action === "validation-advance" || request.action === "validation-inspect") {
      requireValue(expectedFingerprint === undefined, "Disposable validation cannot replace its original runtime fingerprint.");
      if (request.action === "validation-inspect" && !this.validations.has(request.operationId) && !this.baselines.has(request.operationId)) {
        return this.inspectSymbolHistory(request.operationId, "disposable-validation");
      }
      requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
        "Disposable validation requires its original production opening owner.");
      this.assertBaselinePurpose(request.operationId, "disposable-validation");
      let validation = this.validations.get(request.operationId);
      if (request.action === "validation-begin") {
        const baseline = this.baselines.get(request.operationId);
        requireValue(validation === undefined && baseline !== undefined, "Disposable validation requires an unused original baseline.");
        validation = new CurrentSymbolValidationCoordinator(this.options.engine, baseline);
        // Begin only checks local original tokens. If it refuses, the original
        // Baseline still owns its existing close path. Retain before dispatch.
        const result = validation.begin(request.operationId);
        this.validations.set(request.operationId, validation); return result;
      }
      requireValue(validation !== undefined, "Disposable validation cannot resume from journal JSON; its original coordinator is unavailable.");
      if (request.action === "validation-inspect") { return validation.inspect(request.operationId); }
      this.busy = true;
      try { return await validation.advance(request.operationId, request.step); }
      finally { this.busy = false; }
    }
    if (request.action === "baseline-begin") {
      requireValue(expectedFingerprint === undefined, "Baseline validation derives its runtime from the original opening; do not supply a replacement fingerprint.");
      requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine && this.retained.has(request.openingOperationId),
        "Baseline validation requires its original production opening owner.");
      this.busy = true;
      let configured: Awaited<ReturnType<typeof loadRuntimeMachineProfile>>;
      try { configured = await loadRuntimeMachineProfile(); }
      finally { this.busy = false; }
      requireValue(configured.profile.controlDirectory === controlDataDirectory() &&
        configured.profile.easyeda.assetsRoot === process.env["EASYEDA_ASSETS_ROOT"], "Baseline machine configuration differs from the active facade.");
      return this.beginSymbolBaseline(request.openingOperationId, { operationId: request.operationId,
        preparation: request.preparation, confirmNormalClose: true }, configured.profile.runtime);
    }
    if (request.action !== "open" && request.action !== "observe" && request.action !== "inspect" && request.action !== "retire-after-termination" && request.action !== "request-normal-close") {
      requireValue(expectedFingerprint === undefined, "Baseline continuation cannot replace its original runtime fingerprint.");
      this.assertBaselinePurpose(request.operationId, "disposable-validation");
      requireValue(!this.validations.has(request.operationId) || request.action === "baseline-inspect",
        "Disposable validation retains this original baseline; use validation inspection or its exact next phase.");
      switch (request.action) {
        case "baseline-observe-termination": { return this.observeSymbolBaseline(request.operationId); }
        case "baseline-prepare-clock": { return this.prepareSymbolBaselineClock(request.operationId); }
        case "baseline-relaunch": { return this.relaunchSymbolBaseline(request.operationId); }
        case "baseline-admit": { return this.admitSymbolBaseline(request.operationId); }
        case "baseline-observe-caches": { return this.observeSymbolBaselineCaches(request.operationId); }
        case "baseline-open-project": { return this.openSymbolBaselineProject(request.operationId, request.acceptUnqualifiedSchematicStartupEffects); }
        case "baseline-observe-clock": { return this.observeSymbolBaselineClock(request.operationId); }
        case "baseline-finish-close": { return this.finishSymbolBaseline(request.operationId); }
        case "baseline-observe-finish": { return this.observeSymbolBaselineFinish(request.operationId); }
        case "baseline-inspect": { return this.inspectSymbolBaseline(request.operationId); }
        default: { throw new Error("Unsupported baseline continuation."); }
      }
    }
    this.busy = true;
    try {
      if (request.action === "open") {
        requireValue(expectedFingerprint !== undefined, "Current disposable opening requires its expected fingerprint.");
        this.generations.clear();
        return await this.open(request, structuredClone(expectedFingerprint));
      }
      const journal = await this.load(request.operationId);
      requireValue(openingPurpose(journal.plan.purpose) === "disposable-validation", "Disposable route cannot consume an ordinary symbol opening.");
      if (request.action === "inspect") {
        return { ...summary(journal), normalCloseAttempted: this.normalCloseAttempts.has(journal.operationId) || journal.normalCloseAttempted === true };
      }
      this.generations.clear();
      if (request.action === "request-normal-close") {
        requireValue(expectedFingerprint === undefined, "Disposable normal close cannot replace its original runtime fingerprint.");
        return await this.requestNormalClose(journal, "disposable-validation");
      }
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  /** Separate ordinary metadata route entry. Purpose comes from this distinct
   * parser/entry, never a caller-supplied override or disposable route.
   */
  public async runOrdinary(input: unknown, expectedFingerprint?: Value): Promise<Value> {
    const request = parseCurrentSymbolOperationRequest(structuredClone(input));
    requireValue(request.action === "open" || expectedFingerprint === undefined,
      "Ordinary continuation cannot replace its original runtime fingerprint.");
    requireValue(!this.busy, "Current ordinary symbol operation is already in progress.");
    if (request.action === "metadata-begin" || request.action === "metadata-advance" || request.action === "metadata-inspect") {
      requireValue(expectedFingerprint === undefined, "Ordinary metadata cannot replace its original runtime fingerprint.");
      if (request.action === "metadata-inspect" && !this.ordinaryOperations.has(request.operationId) && !this.baselines.has(request.operationId)) {
        return this.inspectSymbolHistory(request.operationId, CURRENT_SYMBOL_OPERATION_PURPOSE);
      }
      requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
        "Ordinary metadata requires its original production opening owner.");
      this.assertBaselinePurpose(request.operationId, CURRENT_SYMBOL_OPERATION_PURPOSE);
      let operation = this.ordinaryOperations.get(request.operationId);
      if (request.action === "metadata-begin") {
        const baseline = this.baselines.get(request.operationId);
        requireValue(operation === undefined && baseline !== undefined, "Ordinary metadata requires an unused original baseline.");
        operation = new CurrentSymbolValidationCoordinator(this.options.engine, baseline);
        const result = operation.beginOrdinary(request.operationId);
        this.ordinaryOperations.set(request.operationId, operation); return result;
      }
      requireValue(operation !== undefined, "Ordinary metadata cannot resume from journal JSON; its original coordinator is unavailable.");
      if (request.action === "metadata-inspect") { return operation.inspect(request.operationId); }
      this.busy = true;
      try { return await operation.advanceOrdinary(request.operationId, request.step); }
      finally { this.busy = false; }
    }
    if (request.action === "baseline-begin") {
      requireValue(expectedFingerprint === undefined, "Ordinary baseline derives its runtime from the original opening.");
      requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine && this.retained.has(request.openingOperationId),
        "Ordinary baseline requires its original production opening owner.");
      this.busy = true;
      let configured: Awaited<ReturnType<typeof loadRuntimeMachineProfile>>;
      try { configured = await loadRuntimeMachineProfile(); }
      finally { this.busy = false; }
      requireValue(configured.profile.controlDirectory === controlDataDirectory() &&
        configured.profile.easyeda.assetsRoot === process.env["EASYEDA_ASSETS_ROOT"], "Ordinary baseline machine configuration differs from the active facade.");
      return this.beginBaseline(request.openingOperationId, { operationId: request.operationId,
        preparation: request.preparation, confirmNormalClose: true }, configured.profile.runtime, CURRENT_SYMBOL_OPERATION_PURPOSE);
    }
    if (request.action !== "open" && request.action !== "observe" && request.action !== "inspect" && request.action !== "retire-after-termination" && request.action !== "request-normal-close") {
      requireValue(expectedFingerprint === undefined, "Ordinary baseline continuation cannot replace its original runtime fingerprint.");
      if (request.action !== "baseline-inspect") { this.assertBaselinePurpose(request.operationId, CURRENT_SYMBOL_OPERATION_PURPOSE); }
      requireValue(!this.ordinaryOperations.has(request.operationId) || request.action === "baseline-inspect",
        "Ordinary metadata retains this original baseline; use metadata inspection or its exact next phase.");
      switch (request.action) {
        case "baseline-observe-termination": { return this.observeSymbolBaseline(request.operationId); }
        case "baseline-prepare-clock": { return this.prepareSymbolBaselineClock(request.operationId); }
        case "baseline-relaunch": { return this.relaunchSymbolBaseline(request.operationId); }
        case "baseline-admit": { return this.admitSymbolBaseline(request.operationId); }
        case "baseline-observe-caches": { return this.observeSymbolBaselineCaches(request.operationId); }
        case "baseline-open-project": {
          const stage = this.baselines.get(request.operationId);
          requireValue(stage !== undefined, "Ordinary baseline original coordinator is unavailable.");
          this.busy = true;
          try { return await stage.openOrdinaryProject(request.operationId); }
          finally { this.busy = false; }
        }
        case "baseline-observe-clock": { return this.observeSymbolBaselineClock(request.operationId); }
        case "baseline-finish-close": { return this.finishSymbolBaseline(request.operationId); }
        case "baseline-observe-finish": { return this.observeSymbolBaselineFinish(request.operationId); }
        case "baseline-inspect": { return this.inspectSymbolBaseline(request.operationId, CURRENT_SYMBOL_OPERATION_PURPOSE); }
        default: { throw new Error("Unsupported ordinary baseline continuation."); }
      }
    }
    this.busy = true;
    try {
      if (request.action === "open") {
        requireValue(expectedFingerprint !== undefined, "Ordinary symbol opening requires its expected fingerprint.");
        this.generations.clear();
        return await this.open(request, structuredClone(expectedFingerprint), CURRENT_SYMBOL_OPERATION_PURPOSE);
      }
      const journal = await this.load(request.operationId);
      requireValue(openingPurpose(journal.plan.purpose) === CURRENT_SYMBOL_OPERATION_PURPOSE, "Ordinary route cannot consume a disposable opening.");
      if (request.action === "inspect") {
        return { ...summary(journal), normalCloseAttempted: this.normalCloseAttempts.has(journal.operationId) || journal.normalCloseAttempted === true };
      }
      this.generations.clear();
      if (request.action === "request-normal-close") {
        requireValue(expectedFingerprint === undefined, "Ordinary normal close cannot replace its original runtime fingerprint.");
        return await this.requestNormalClose(journal, CURRENT_SYMBOL_OPERATION_PURPOSE);
      }
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  /** Fixed ordinary SCH entry; it cannot consume symbol or disposable openings. */
  public async runSchematicOpening(input: unknown, expectedFingerprint?: Value): Promise<Value> {
    const request = currentSchematicOperationOpeningRequestSchema.parse(structuredClone(input));
    requireValue(request.action === "open" || expectedFingerprint === undefined, "SCH continuation cannot replace its original runtime fingerprint.");
    if (request.action === "inspect-opening") {
      const journal = await this.load(request.operationId);
      requireValue(openingPurpose(journal.plan.purpose) === CURRENT_SCHEMATIC_OPERATION_PURPOSE, "Ordinary SCH route cannot consume another opening purpose.");
      return { ...summary(journal), normalCloseAttempted: this.normalCloseAttempts.has(journal.operationId) || journal.normalCloseAttempted === true };
    }
    requireValue(!this.busy, "Current project opening is already in progress."); this.busy = true;
    try {
      if (request.action === "open") {
        requireValue(expectedFingerprint !== undefined, "Ordinary SCH opening requires its expected fingerprint.");
        this.generations.clear(); return await this.open(request, structuredClone(expectedFingerprint), CURRENT_SCHEMATIC_OPERATION_PURPOSE);
      }
      const journal = await this.load(request.operationId);
      requireValue(openingPurpose(journal.plan.purpose) === CURRENT_SCHEMATIC_OPERATION_PURPOSE, "Ordinary SCH route cannot consume another opening purpose.");
      this.generations.clear();
      if (request.action === "request-normal-close") { return await this.requestNormalClose(journal, CURRENT_SCHEMATIC_OPERATION_PURPOSE); }
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  /** Separate copy entry: no opening, fingerprint replacement or metadata token is accepted. */
  public async runCopy(input: unknown): Promise<Value> {
    const request = parseCurrentSymbolCopyOperationRequest(structuredClone(input));
    requireValue(!this.busy, "Current disposable copy operation is already in progress.");
    const cleanup = this.copyOpeningCleanups.get(request.operationId);
    if (cleanup?.failed === true) {
      if (request.action === "baseline-inspect" || request.action === "copy-inspect") { return this.copyOpeningCleanupSummary(cleanup); }
      requireValue(request.action === "baseline-finish-close" || request.action === "baseline-observe-finish",
        "Failed copy preparation permits only original-opening cleanup or inspection, never retry or continuation.");
      this.busy = true;
      try { return await (request.action === "baseline-finish-close" ? this.closeCopyOpeningCleanup(cleanup) : this.observeCopyOpeningCleanup(cleanup)); }
      finally { this.busy = false; }
    }
    if ((request.action === "copy-inspect" || request.action === "baseline-inspect") && !this.baselines.has(request.operationId)) {
      this.busy = true;
      try {
        const journal = await this.services.loadOperation(request.operationId);
        requireValue(journal.operationId === request.operationId && isRecord(journal.plan), "Current copy history is unavailable.");
        const plan = journal.plan;
        requireValue((plan["profile"] === "easyeda-pro-control.current-symbol-closed-baseline.v1" &&
          plan["purpose"] === CURRENT_SYMBOL_COPY_OPERATION_PURPOSE) ||
          plan["profile"] === "easyeda-pro-control.current-symbol-copy-writer.v1" ||
          plan["profile"] === "easyeda-pro-control.current-symbol-copy-verification.v1", "Current copy history belongs to another purpose.");
        return { profile: "easyeda-pro-control.current-symbol-copy-history.v1", operationId: request.operationId,
          state: journal["state"], journalPath: journal["journalPath"], artifacts: journal.artifacts, nextSafeAction: journal["nextSafeAction"],
          hardStop: journal["hardStop"], orphanedCallPossible: journal["orphanedCallPossible"], mutationMayHaveOccurred: journal["mutationMayHaveOccurred"],
          originalOwnerRetained: false, continuationAvailable: false, copyVerified: false, historicalOnly: true,
          replayAllowed: false, executionAuthorized: false };
      } finally { this.busy = false; }
    }
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Disposable copy requires its original production opening owner.");
    if (request.action === "baseline-begin") {
      requireValue(this.retained.has(request.openingOperationId), "Copy baseline needs its original retained disposable opening.");
      this.busy = true;
      let configured: Awaited<ReturnType<typeof loadRuntimeMachineProfile>>;
      try { configured = await loadRuntimeMachineProfile(); }
      finally { this.busy = false; }
      requireValue(configured.profile.controlDirectory === controlDataDirectory() &&
        configured.profile.easyeda.assetsRoot === process.env["EASYEDA_ASSETS_ROOT"], "Copy baseline machine configuration differs from the active facade.");
      return this.beginCopyBaseline(request.openingOperationId, { operationId: request.operationId, source: request.source,
        confirmNormalClose: true }, configured.profile.runtime);
    }
    this.assertBaselinePurpose(request.operationId, CURRENT_SYMBOL_COPY_OPERATION_PURPOSE);
    const baseline = this.baselines.get(request.operationId);
    requireValue(baseline !== undefined, "Copy continuation cannot recover ownership from journal JSON.");
    if (request.action === "copy-begin") {
      requireValue(!this.copyOperations.has(request.operationId), "Copy operation already retained its original baseline.");
      const operation = new CurrentSymbolCopyOperationCoordinator(this.options.engine, baseline);
      const result = operation.begin(request.operationId); this.copyOperations.set(request.operationId, operation); return result;
    }
    if (request.action === "copy-advance" || request.action === "copy-inspect" || request.action === "copy-cleanup") {
      const operation = this.copyOperations.get(request.operationId);
      requireValue(operation !== undefined, "Copy operation needs its original retained coordinator.");
      if (request.action === "copy-inspect") { return operation.inspect(request.operationId); }
      if (request.action === "copy-cleanup") { return operation.requestCleanup(request.operationId); }
      this.busy = true;
      try { return await operation.advance(request.operationId, request.step); }
      finally { this.busy = false; }
    }
    requireValue(!this.copyOperations.has(request.operationId) || request.action === "baseline-inspect",
      "Copy operation retains this baseline; use copy inspection or its exact next phase.");
    this.busy = true;
    try {
      switch (request.action) {
        case "baseline-observe-termination": { return await baseline.observe(request.operationId); }
        case "baseline-prepare-clock": { return await baseline.prepareCopyClockReference(request.operationId); }
        case "baseline-relaunch": { return await baseline.relaunch(request.operationId); }
        case "baseline-admit": { return await baseline.admit(request.operationId); }
        case "baseline-observe-caches": { return await baseline.observeCaches(request.operationId); }
        case "baseline-open-project": { return await baseline.openCopyProject(request.operationId, request.acceptUnqualifiedSchematicStartupEffects); }
        case "baseline-observe-clock": { return await baseline.observeCopyAgedClock(request.operationId); }
        case "baseline-finish-close": { return await baseline.finishNormalClose(request.operationId); }
        case "baseline-observe-finish": { return await baseline.observeFinish(request.operationId); }
        case "baseline-inspect": { return await baseline.inspect(request.operationId); }
        default: { throw new Error("Unsupported disposable copy continuation."); }
      }
    } finally { this.busy = false; }
  }

  private assertBaselinePurpose(operationId: string, purpose: BaselinePurpose): void {
    const retained = this.baselinePurposes.get(operationId);
    requireValue(retained === purpose || (purpose === "disposable-validation" && retained === undefined),
      "Current symbol baseline belongs to another purpose or its ordinary owner is unavailable.");
  }

  private async inspectSymbolHistory(operationId: string, purpose: SymbolOpenPurpose): Promise<Value> {
    this.busy = true;
    try { return await inspectCurrentSymbolHistory(operationId, purpose); }
    finally { this.busy = false; }
  }

  /** Original PCB transfer for the staged rename operation. No close, project
   * navigation, native preflight or write is dispatched by this transfer.
   */
  public async preparePcbRenameOpeningOwner(openingOperationId: string, input: unknown): Promise<CurrentPcbRenameOpeningOwner> {
    const request = parseCurrentPcbRenameOwnerRequest(input);
    requireValue(!this.busy && request.operationId !== openingOperationId && !this.pcbRenameOpeningOwners.has(request.operationId),
      "Current PCB opening transfer needs one distinct unused operation.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current PCB opening owner cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine; this.busy = true;
    try {
      const loaded = await this.load(openingOperationId), slot = this.retainedJournal(loaded);
      this.currentUntransferred(slot);
      requireValue(openingPurpose(slot.journal.plan.purpose) === "disposable-validation" && slot.runtime instanceof WindowsControlRuntime &&
        !this.normalCloseAttempts.has(openingOperationId) && slot.journal.normalCloseAttempted !== true,
      "Current PCB opening owner requires its live disposable original opening.");
      const runtime = slot.runtime, target = slot.journal.plan.intent.target;
      requireValue(request.target.projectUuid === target.projectUuid && request.target.branchUuid === target.branchUuid &&
        request.target.pcbUuid === target.documentUuid, "Current PCB opening transfer cannot retarget the opened PCB.");
      await this.services.assertOperationIdUnused(request.operationId); this.currentUntransferred(slot);
      await engine.assertBridgeAndRecoveryAdmission(openingOperationId); this.currentUntransferred(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current PCB opening transfer needs an authenticated scope.");
      const result: unknown = await scope.call(engine.upstream, async () => {
        const generation = this.issueGeneration(slot, engine, runtime);
        const source = await revalidateCurrentDisposableOpenGeneration(generation, engine); this.currentUntransferred(slot);
        requireValue(source.purpose === "disposable-validation" && source.runtime === runtime &&
          assertCurrentDisposableOpenGeneration(generation, engine) === source, "Current PCB opening generation changed.");
        const owner = Object.freeze({ profile: "private.current-pcb-rename-opening-owner.v1" as const,
          operationId: request.operationId, openingOperationId });
        const intent = Object.freeze({ target: request.target, desiredTitle: request.desiredTitle });
        const intentText = canonicalJson(intent), journalText = canonicalJson(slot.journal), sourceText = canonicalJson({ target: source.target,
          expectedFingerprint: source.expectedFingerprint, checkpoint: source.preNavigationCheckpoint, launch: source.launchProjection, session: source.bridgeSession });
        const upstream = engine.upstream, validator = engine.executionAuthorityValidator;
        const dispatch = upstream.currentAuthenticatedBridgeDispatchBinding, lifecycle = upstream.bridgeSessionLifecycle;
        // oxlint-disable-next-line typescript/unbound-method -- Retained for identity only; the later baseline calls each with its original receiver.
        const capture = engine.captureClosedSessionAuthority, clock = engine.clockObservationForClosedCapture, release = engine.releaseClosedSessionAuthority;
        // oxlint-disable-next-line typescript/unbound-method -- Identity check precedes the coordinator's retained receiver-bound status call.
        const runtimeStatus = runtime.status;
        const current = (): void => {
          requireValue(runtime.status === runtimeStatus && engine.captureClosedSessionAuthority === capture &&
            engine.clockObservationForClosedCapture === clock && engine.releaseClosedSessionAuthority === release,
          "Current PCB opening capture producer or runtime status method changed.");
          this.current(slot);
          requireValue(this.pcbRenameOpeningOwners.get(request.operationId) === owner && baselineRuntimeReservations.has(runtime) &&
            this.baselineJobs.has(slot.launch.jobId) && this.options.engine === engine && engine.upstream === upstream &&
            engine.executionAuthorityValidator === validator && upstream.bridgeSessionLifecycle === lifecycle &&
            upstream.currentAuthenticatedBridgeDispatchBinding === dispatch && canonicalJson(slot.journal) === journalText &&
            canonicalJson(intent) === intentText && canonicalJson({ target: source.target, expectedFingerprint: source.expectedFingerprint,
              checkpoint: source.preNavigationCheckpoint, launch: source.launchProjection, session: source.bridgeSession }) === sourceText,
          "Current PCB opening transfer lost its original owner, intention or historical opening.");
        };
        const revalidateEvidence = async (): Promise<void> => {
          current();
          const persisted = await this.load(openingOperationId); current();
          requireValue(canonicalJson(persisted) === journalText, "Current PCB opening persisted journal changed.");
        };
        const revalidate = async (): Promise<void> => {
          current(); await engine.assertBridgeAndRecoveryAdmission(owner.operationId); current();
          await revalidateEvidence(); current();
        };
        // Every preceding await was read-only. Reserve atomically before the
        // Original owner leaves this scope; competing transfers cannot win.
        this.currentUntransferred(slot); baselineRuntimeReservations.add(runtime); this.baselineJobs.add(slot.launch.jobId);
        this.generations.clear(); this.pcbRenameOpeningOwners.set(request.operationId, owner);
        issuedPcbRenameOpeningOwners.set(owner, { value: Object.freeze({ source, intent }), current, revalidate, revalidateEvidence, state: "retained" }); current();
        return owner;
      });
      assertCurrentPcbRenameOpeningOwner(result, engine);
      const retained = this.pcbRenameOpeningOwners.get(request.operationId);
      requireValue(retained !== undefined && retained === result, "Current PCB opening scope lost its transferred owner.");
      const issued = issuedPcbRenameOpeningOwners.get(retained);
      requireValue(issued !== undefined && issued.state === "retained", "Current PCB opening transfer outcome was already consumed.");
      issued.state = "completed"; return retained;
    } catch (error) {
      const retained = this.pcbRenameOpeningOwners.get(request.operationId);
      const issued = retained === undefined ? undefined : issuedPcbRenameOpeningOwners.get(retained);
      if (issued !== undefined) { issued.state = "failed"; }
      throw error;
    } finally { this.generations.delete(openingOperationId); this.busy = false; }
  }

  /** Keep a transferred owner reachable if the authenticated scope's exit
   * failed. This is the same object, not a fresh attempt or recovered authority.
   */
  public getPcbRenameOpeningOwner(operationId: string): CurrentPcbRenameOpeningOwner {
    const owner = this.pcbRenameOpeningOwners.get(operationId);
    requireValue(!this.busy && owner !== undefined && this.options.engine instanceof EasyedaControlEngine,
      "Current PCB transfer requires its original retained owner.");
    assertCurrentPcbRenameOpeningOwner(owner, this.options.engine); return owner;
  }


  public prepareSchematicRenameOpeningOwner(openingOperationId: string, input: unknown): Promise<CurrentSchematicRenameOpeningOwner> {
    return this.prepareSchematicOpeningOwner(openingOperationId, input, "disposable-validation");
  }
  public prepareOrdinarySchematicRenameOpeningOwner(openingOperationId: string, input: unknown): Promise<CurrentSchematicRenameOpeningOwner> {
    return this.prepareSchematicOpeningOwner(openingOperationId, input, CURRENT_SCHEMATIC_OPERATION_PURPOSE);
  }
  private async prepareSchematicOpeningOwner(openingOperationId: string, input: unknown,
    purpose: "disposable-validation" | typeof CURRENT_SCHEMATIC_OPERATION_PURPOSE): Promise<CurrentSchematicRenameOpeningOwner> {
    const request = parseCurrentSchematicRenameOwnerRequest(input);
    requireValue(!this.busy && request.operationId !== openingOperationId && !this.schematicRenameOpeningOwners.has(request.operationId),
      "Current SCH opening transfer needs one distinct unused operation.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current SCH opening owner cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine; this.busy = true;
    try {
      const loaded = await this.load(openingOperationId), slot = this.retainedJournal(loaded);
      this.currentUntransferred(slot);
      requireValue(openingPurpose(slot.journal.plan.purpose) === purpose && slot.runtime instanceof WindowsControlRuntime &&
        !this.normalCloseAttempts.has(openingOperationId) && slot.journal.normalCloseAttempted !== true,
      "Current SCH opening owner requires its live original opening with the same purpose.");
      if (purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
        requireValue(canonicalJson(slot.journal.plan.intent.schematicExpectation?.intent) === canonicalJson({ target: request.target, desiredTitle: request.desiredTitle }),
          "Ordinary SCH transfer cannot change its pre-navigation rename intention.");
      }
      // SCH is a project container, not the initial PCB document. Its UUID and
      // Owner remain unqualified until the separate original closed-SQL baseline.
      const runtime = slot.runtime, target = slot.journal.plan.intent.target;
      requireValue(request.target.projectUuid === target.projectUuid && request.target.branchUuid === target.branchUuid, "Current SCH opening transfer cannot leave the opened project branch.");
      await this.services.assertOperationIdUnused(request.operationId); this.currentUntransferred(slot);
      await engine.assertBridgeAndRecoveryAdmission(openingOperationId); this.currentUntransferred(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current SCH opening transfer needs an authenticated scope.");
      const result: unknown = await scope.call(engine.upstream, async () => {
        const generation = this.issueGeneration(slot, engine, runtime);
        const source = await revalidateCurrentDisposableOpenGeneration(generation, engine); this.currentUntransferred(slot);
        requireValue(source.purpose === purpose && source.runtime === runtime &&
          assertCurrentDisposableOpenGeneration(generation, engine) === source, "Current SCH opening generation changed.");
        const owner = Object.freeze({ profile: "private.current-schematic-rename-opening-owner.v1" as const,
          operationId: request.operationId, openingOperationId });
        const intent = Object.freeze({ target: request.target, desiredTitle: request.desiredTitle });
        const intentText = canonicalJson(intent), journalText = canonicalJson(slot.journal), sourceText = canonicalJson({ target: source.target,
          expectedFingerprint: source.expectedFingerprint, checkpoint: source.preNavigationCheckpoint, launch: source.launchProjection, session: source.bridgeSession });
        const upstream = engine.upstream, validator = engine.executionAuthorityValidator;
        const dispatch = upstream.currentAuthenticatedBridgeDispatchBinding, lifecycle = upstream.bridgeSessionLifecycle;
        // oxlint-disable-next-line typescript/unbound-method -- Retained for identity only; the later baseline calls each with its original receiver.
        const capture = engine.captureClosedSessionAuthority, clock = engine.clockObservationForClosedCapture, release = engine.releaseClosedSessionAuthority;
        // oxlint-disable-next-line typescript/unbound-method -- Identity check precedes the coordinator's retained receiver-bound status call.
        const runtimeStatus = runtime.status;
        const current = (): void => {
          requireValue(runtime.status === runtimeStatus && engine.captureClosedSessionAuthority === capture &&
            engine.clockObservationForClosedCapture === clock && engine.releaseClosedSessionAuthority === release,
          "Current SCH opening capture producer or runtime status method changed.");
          this.current(slot);
          requireValue(this.schematicRenameOpeningOwners.get(request.operationId) === owner && baselineRuntimeReservations.has(runtime) &&
            this.baselineJobs.has(slot.launch.jobId) && this.options.engine === engine && engine.upstream === upstream &&
            engine.executionAuthorityValidator === validator && upstream.bridgeSessionLifecycle === lifecycle &&
            upstream.currentAuthenticatedBridgeDispatchBinding === dispatch && canonicalJson(slot.journal) === journalText &&
            canonicalJson(intent) === intentText && canonicalJson({ target: source.target, expectedFingerprint: source.expectedFingerprint,
              checkpoint: source.preNavigationCheckpoint, launch: source.launchProjection, session: source.bridgeSession }) === sourceText,
          "Current SCH opening transfer lost its original owner, intention or historical opening.");
        };
        const revalidateEvidence = async (): Promise<void> => {
          current();
          const persisted = await this.load(openingOperationId); current();
          requireValue(canonicalJson(persisted) === journalText, "Current SCH opening persisted journal changed.");
        };
        const revalidate = async (): Promise<void> => {
          current(); await engine.assertBridgeAndRecoveryAdmission(owner.operationId); current();
          await revalidateEvidence(); current();
        };
        // Every preceding await was read-only. Reserve atomically before the
        // Original owner leaves this scope; competing transfers cannot win.
        this.currentUntransferred(slot); baselineRuntimeReservations.add(runtime); this.baselineJobs.add(slot.launch.jobId);
        this.generations.clear(); this.schematicRenameOpeningOwners.set(request.operationId, owner);
        issuedSchematicRenameOpeningOwners.set(owner, { value: Object.freeze({ source, intent }), current, revalidate, revalidateEvidence, state: "retained" }); current();
        return owner;
      });
      assertCurrentSchematicRenameOpeningOwner(result, engine);
      const retained = this.schematicRenameOpeningOwners.get(request.operationId);
      requireValue(retained !== undefined && retained === result, "Current SCH opening scope lost its transferred owner.");
      const issued = issuedSchematicRenameOpeningOwners.get(retained);
      requireValue(issued !== undefined && issued.state === "retained", "Current SCH opening transfer outcome was already consumed.");
      issued.state = "completed"; return retained;
    } catch (error) {
      const retained = this.schematicRenameOpeningOwners.get(request.operationId);
      const issued = retained === undefined ? undefined : issuedSchematicRenameOpeningOwners.get(retained);
      if (issued !== undefined) { issued.state = "failed"; }
      throw error;
    } finally { this.generations.delete(openingOperationId); this.busy = false; }
  }

  /** Keep a transferred owner reachable if the authenticated scope's exit
   * failed. This is the same object, not a fresh attempt or recovered authority.
   */
  public getSchematicRenameOpeningOwner(operationId: string): CurrentSchematicRenameOpeningOwner {
    const owner = this.schematicRenameOpeningOwners.get(operationId);
    requireValue(!this.busy && owner !== undefined && this.options.engine instanceof EasyedaControlEngine,
      "Current SCH transfer requires its original retained owner.");
    assertCurrentSchematicRenameOpeningOwner(owner, this.options.engine); return owner;
  }

  /** Internal preparation only. The public opener request schema has no route
   * here. Later writer stages still need their independently issued witness,
   * post-opening baseline, original close reservation and full SQL inventory.
   */
  public async prepareSymbolMetadata(operationId: string, input: unknown): Promise<CurrentOwnedSymbolMetadataPreparation> {
    requireValue(!this.busy, "Current disposable opening is already in progress.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current symbol preparation cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine;
    this.busy = true;
    try {
      const loaded = await this.load(operationId), slot = this.retainedJournal(loaded);
      requireValue(openingPurpose(slot.journal.plan.purpose) === "disposable-validation", "Disposable preparation cannot consume an ordinary symbol opening.");
      this.generations.clear();
      CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
      requireValue(slot.runtime instanceof WindowsControlRuntime, "Current symbol preparation requires the retained Windows runtime object.");
      const runtime = slot.runtime;
      // Scope acquisition can connect the upstream.
      // Refuse quarantine before entering, not only inside the callback.
      this.currentUntransferred(slot);
      await engine.assertBridgeAndRecoveryAdmission(operationId); this.currentUntransferred(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current symbol preparation requires an authenticated dispatch scope.");
      const result: unknown = await scope.call(engine.upstream, async () => {
        const generation = this.issueGeneration(slot, engine, runtime);
        try { return await prepareCurrentOwnedSymbolMetadata(engine, generation, input); }
        catch (error) { this.generations.delete(operationId); throw error; }
      });
      return assertOriginalCurrentOwnedSymbolPreparation(result, engine).preparation;
    } finally { this.busy = false; }
  }

  /** Owned baseline stage, reached only through the fixed validation request.
   * Consumes this Job before the first await, transfers a fresh preparation,
   * then requests one normal close outside its authenticated scope.
   */
  public beginSymbolBaseline(openingOperationId: string, input: unknown, sqlRuntime: MachineProfile["runtime"]): Promise<Value> {
    return this.beginBaseline(openingOperationId, input, sqlRuntime, "disposable-validation");
  }

  /** Fixed copy composition; public input still cannot issue an original owner. */
  public beginCopyBaseline(openingOperationId: string, input: unknown, sqlRuntime: MachineProfile["runtime"]): Promise<Value> {
    return this.beginBaseline(openingOperationId, input, sqlRuntime, "disposable-symbol-copy");
  }

  /** Original private continuation only. Public metadata/disposable parsers
   * cannot reach copy state through their existing purpose checks.
   */
  public getCopyBaseline(operationId: string): CurrentSymbolBaselineCoordinator {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined && this.baselinePurposes.get(operationId) === "disposable-symbol-copy",
      "Current copy baseline requires its original retained coordinator."); return stage;
  }

  private async beginBaseline(openingOperationId: string, input: unknown, sqlRuntime: MachineProfile["runtime"],
    purpose: BaselinePurpose): Promise<Value> {
    const copyBaselineRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
      source: currentOwnedSymbolCopyRequestSchema, confirmNormalClose: z.literal(true) }).strict();
    const parsed = purpose === "disposable-symbol-copy" ? copyBaselineRequestSchema.parse(input) : currentSymbolBaselineRequestSchema.parse(input);
    const request = { operationId: parsed.operationId, preparation: "source" in parsed ? parsed.source : parsed.preparation };
    requireValue(request.operationId !== openingOperationId && !this.busy && !this.baselines.has(request.operationId),
      "Current symbol baseline needs a distinct unused operation.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current symbol baseline cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine, slot = this.retained.get(openingOperationId);
    requireValue(slot !== undefined && slot.runtime instanceof WindowsControlRuntime, "Current symbol baseline needs the original retained opening and runtime.");
    requireValue(openingPurpose(slot.journal.plan.purpose) === (purpose === "disposable-symbol-copy" ? "disposable-validation" : purpose),
      "Current symbol baseline cannot transfer an opening of another purpose.");
    const runtime = slot.runtime;
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime); this.current(slot);
    const stage = new CurrentSymbolBaselineCoordinator(engine, runtime, sqlRuntime);
    baselineRuntimeReservations.add(runtime);
    this.baselineJobs.add(slot.launch.jobId);
    this.generations.clear(); this.busy = true;
    this.baselines.set(request.operationId, stage);
    this.baselinePurposes.set(request.operationId, purpose);
    if (purpose === "disposable-symbol-copy") {
      this.copyOpeningCleanups.set(request.operationId, { operationId: request.operationId, opening: slot, openingText: canonicalJson(slot.journal), stage,
        methods: this.copyOpeningCleanupMethods(slot), artifacts: [], failed: false, failureRecorded: false, closeAttempted: false,
        closeAcknowledged: false, releaseAttempted: false, retired: false });
    }
    let owner: CurrentSymbolBaselineOwner | CurrentSymbolCopyBaselineOwner | undefined;
    let failureStage = "opening-revalidation";
    try {
      const loaded = await this.load(openingOperationId);
      requireValue(this.retainedJournal(loaded) === slot, "Current symbol baseline original opening changed.");
      this.current(slot);
      await engine.assertBridgeAndRecoveryAdmission(openingOperationId); this.current(slot);
      const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
      requireValue(scope !== undefined, "Current symbol baseline needs an authenticated scope.");
      try {
        await scope.call(engine.upstream, async () => {
          const generation = this.issueGeneration(slot, engine, runtime, request.operationId);
          failureStage = "source-preparation";
          const preparation = purpose === "disposable-symbol-copy"
            ? await prepareCurrentOwnedSymbolCopy(engine, generation, request.preparation)
            : await prepareCurrentOwnedSymbolMetadata(engine, generation, request.preparation);
          failureStage = "owner-transfer";
          owner = this.transferBaseline(slot, engine, generation, preparation, request.operationId);
          failureStage = "initial-capture";
          await (owner.profile === "private.current-symbol-copy-baseline-owner.v1" ? stage.captureCopy(owner) : stage.capture(owner));
        });
      } catch (error) {
        if (owner !== undefined) {
          try { await stage.stopAfterScopeFailure(owner); }
          catch (recordError) { throw new AggregateError([error, recordError], "Current symbol baseline scope failed and could not record its stopped state.", { cause: recordError }); }
        }
        throw error;
      }
      requireValue(owner !== undefined, "Current symbol baseline scope returned without its retained owner.");
      failureStage = "initial-close";
      return await stage.close(owner);
    } catch (error) {
      const cleanup = this.copyOpeningCleanups.get(request.operationId);
      if (cleanup !== undefined) {
        cleanup.failed = true;
        try {
          // Failure recording itself grants no authority and must survive loss
          // Of the original owner. Do not rewrite that owner's journal.
          const artifact = await this.services.writePhaseArtifact(slot.journal.operationId, slot.journal.sequence + 1, "copy-initial-begin-failed", {
            operationId: request.operationId, failureStage, originalOpeningSha256: sha256Text(cleanup.openingText),
            error: error instanceof Error ? { name: error.name.slice(0, 160), message: error.message.slice(0, 2048) } : { name: "UnknownError", message: "Non-Error rejection retained by caller." },
            ownerTransferred: owner !== undefined, retryAllowed: false, executionAuthorized: false,
          });
          cleanup.artifacts.push(artifact); cleanup.failureRecorded = true;
        } catch (recordError) {
          throw new AggregateError([error, recordError], "Copy preparation failed and its separate failure artifact could not be published.", { cause: recordError });
        }
      }
      throw error;
    } finally { this.generations.delete(openingOperationId); this.busy = false; }
  }

  private copyOpeningCleanupMethods(slot: Retained): readonly unknown[] {
    const { engine } = this.options;
    return [slot.runtime.status, slot.runtime.normalClose, slot.runtime.observeApplicationWindow, slot.runtime.observeLaunchTermination,
      engine.assertRecoveryOperationIsolated, engine.upstream, engine.executionAuthorityValidator,
      engine.upstream.currentAuthenticatedBridgeDispatchBinding, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
  }

  private copyOpeningCleanupSummary(cleanup: CopyOpeningCleanup): Value {
    requireValue(this.copyOpeningCleanups.get(cleanup.operationId) === cleanup, "Copy cleanup original inspection owner is missing.");
    const captured = cleanup.stage.copyOpeningCleanupStatus(cleanup.operationId);
    return { profile: "easyeda-pro-control.current-symbol-copy-opening-cleanup.v1", operationId: cleanup.operationId,
      openingOperationId: cleanup.opening.journal.operationId, purpose: CURRENT_SYMBOL_COPY_OPERATION_PURPOSE,
      state: cleanup.retired ? "plan-invalidated" : "copy-opening-stopped", originalOwnerRetained: true, terminalCleanupOnly: true,
      closeAttempted: cleanup.closeAttempted || captured["closeAttempted"] === true,
      closeAcknowledged: cleanup.closeAcknowledged || captured["closeAcknowledged"] === true,
      finishObservationAvailable: !cleanup.retired && !cleanup.releaseAttempted,
      releaseAttempted: cleanup.releaseAttempted, retired: cleanup.retired, capture: captured,
      artifacts: structuredClone(cleanup.artifacts), originalFailurePreserved: cleanup.failureRecorded, reservationConsumed: true,
      nextSafeAction: cleanup.retired ? "Attempt retired. No retry, navigation, copy or saved-state claim is permitted." :
        "Use baseline-finish-close once if no close was attempted, then baseline-observe-finish. Leave Save/Discard prompts untouched. Never repeat baseline-begin.",
      fileEffects: "unknown", closedSessionCopyAuthority: false, copyVerified: false, replayAllowed: false, executionAuthorized: false };
  }

  private copyOpeningCleanupCurrent(cleanup: CopyOpeningCleanup): void {
    const slot = cleanup.opening;
    requireValue(this.copyOpeningCleanups.get(cleanup.operationId) === cleanup && cleanup.failed && !cleanup.retired &&
      this.baselines.get(cleanup.operationId) === cleanup.stage && this.baselinePurposes.get(cleanup.operationId) === CURRENT_SYMBOL_COPY_OPERATION_PURPOSE &&
      baselineRuntimeReservations.has(slot.runtime) && this.baselineJobs.has(slot.launch.jobId) &&
      canonicalJson(slot.journal) === cleanup.openingText &&
      this.copyOpeningCleanupMethods(slot).every((method, index) => method === cleanup.methods[index]),
    "Copy opening cleanup lost its original consumed reservation, methods or journal.");
    requireValue(slot.runtime.normalClose === slot.nativeCleanup.normalClose && slot.runtime.observeApplicationWindow === slot.nativeCleanup.observeApplicationWindow &&
      slot.runtime.status === slot.nativeCleanup.status, "Copy opening cleanup native methods differ from the original opener.");
    this.current(slot);
    const reader = this.options.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    requireValue(reader !== undefined && reader.call(this.options.engine.upstream) === undefined,
      "Copy opening cleanup requires the ended original dispatch scope.");
  }

  private async copyOpeningCleanupUnchanged(cleanup: CopyOpeningCleanup): Promise<void> {
    this.copyOpeningCleanupCurrent(cleanup);
    const persisted = await this.load(cleanup.opening.journal.operationId); this.copyOpeningCleanupCurrent(cleanup);
    requireValue(canonicalJson(persisted) === cleanup.openingText, "Copy opening cleanup persisted opening changed.");
  }

  /** Separate exclusive artifacts preserve the opening journal bytes used by
   * the original capture owner. They never overwrite its primary failure.
   */
  private async recordCopyOpeningCleanup(cleanup: CopyOpeningCleanup, phase: string, value: unknown): Promise<void> {
    await this.copyOpeningCleanupUnchanged(cleanup);
    const artifact = await this.services.writePhaseArtifact(cleanup.opening.journal.operationId,
      cleanup.opening.journal.sequence + cleanup.artifacts.length + 1, `copy-initial-${phase}`, { operationId: cleanup.operationId, value });
    cleanup.artifacts.push(artifact); await this.copyOpeningCleanupUnchanged(cleanup);
  }

  private async closeCopyOpeningCleanup(cleanup: CopyOpeningCleanup): Promise<Value> {
    const captured = cleanup.stage.copyOpeningCleanupStatus(cleanup.operationId);
    requireValue(!cleanup.closeAttempted && captured["closeAttempted"] !== true && !cleanup.releaseAttempted && !cleanup.retired,
      "Original copy opening close is consumed; observe termination without repeating it.");
    await this.copyOpeningCleanupUnchanged(cleanup);
    await this.options.engine.assertRecoveryOperationIsolated(cleanup.operationId); await this.copyOpeningCleanupUnchanged(cleanup);
    const slot = cleanup.opening, window = await slot.runtime.observeApplicationWindow(); await this.copyOpeningCleanupUnchanged(cleanup);
    requireValue(window.outcome === "available" && window.hwnd !== null && window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance,
      "Copy opening cleanup requires its original retained application's unique window.");
    // Reserve before publication and dispatch. An uncertain reply cannot permit a second close.
    cleanup.closeAttempted = true;
    await this.recordCopyOpeningCleanup(cleanup, "close-intent", { originalLaunch: slot.launch, hwnd: window.hwnd,
      confirmNormalClose: true, acceptUnknownFileEffects: true, saveOrDiscardSelected: false, replayAllowed: false });
    await this.options.engine.assertRecoveryOperationIsolated(cleanup.operationId); await this.copyOpeningCleanupUnchanged(cleanup);
    await slot.runtime.normalClose(window.hwnd); cleanup.closeAcknowledged = true;
    await this.recordCopyOpeningCleanup(cleanup, "close-reply", { requestAcknowledged: true, terminationProved: false });
    return this.copyOpeningCleanupSummary(cleanup);
  }

  private async observeCopyOpeningCleanup(cleanup: CopyOpeningCleanup): Promise<Value> {
    requireValue(!cleanup.releaseAttempted && !cleanup.retired, "Copy opening retirement attempt is consumed.");
    await this.copyOpeningCleanupUnchanged(cleanup);
    await this.options.engine.assertRecoveryOperationIsolated(cleanup.operationId); await this.copyOpeningCleanupUnchanged(cleanup);
    const slot = cleanup.opening;
    const observation = await slot.runtime.observeLaunchTermination(); await this.copyOpeningCleanupUnchanged(cleanup);
    requireValue(observation.jobId === slot.launch.jobId && observation.helperInstance === slot.launch.helperInstance,
      "Copy opening termination belongs to another retained launch.");
    if (!observation.terminated) { return { ...this.copyOpeningCleanupSummary(cleanup), termination: "pending" }; }
    const dispatch = slot.journal.bridgeDispatchBeforeOrphan, prior = slot.journal.bridgeSessionBeforeOrphan;
    const observeClosure = this.options.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
    requireValue(dispatch !== undefined && prior !== undefined && observeClosure !== undefined,
      "Copy opening cleanup lost its original dispatch/session binding.");
    const closure = closedSessionSchema.parse(observeClosure.call(this.options.engine.upstream, dispatch, prior));
    await this.recordCopyOpeningCleanup(cleanup, "termination-proof", { observation, closedBridgeSession: closure, snapshotAuthority: false });
    requireValue(canonicalJson(observeClosure.call(this.options.engine.upstream, dispatch, prior)) === canonicalJson(closure),
      "Copy opening cleanup bridge closure changed.");
    cleanup.releaseAttempted = true;
    await cleanup.stage.retireCopyOpeningCapture(cleanup.operationId);
    await this.copyOpeningCleanupUnchanged(cleanup);
    await this.recordCopyOpeningCleanup(cleanup, "retired", { retired: true, fileEffects: "unknown", baselineRetryAllowed: false, snapshotAuthority: false });
    cleanup.retired = true;
    return { ...this.copyOpeningCleanupSummary(cleanup), termination: "terminated" };
  }

  public async observeSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.observe(operationId); }
    finally { this.busy = false; }
  }

  /** One exact-literal scratch comparison before the owned replacement launch. */
  public async prepareSymbolBaselineClock(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.prepareClockReference(operationId); }
    finally { this.busy = false; }
  }

  /** Fixed continuation on the original retained baseline; no owner adoption. */
  public async relaunchSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.relaunch(operationId); }
    finally { this.busy = false; }
  }

  /** New-session admission; never an ordinary opener or writer route. */
  public async admitSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.admit(operationId); }
    finally { this.busy = false; }
  }

  /** Cache-only continuation; public requests cannot supply code or targets. */
  public async observeSymbolBaselineCaches(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.observeCaches(operationId); }
    finally { this.busy = false; }
  }

  /** Project-only continuation on the retained replacement generation. */
  public async openSymbolBaselineProject(operationId: string, acceptUnqualifiedSchematicStartupEffects?: true): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.openProject(operationId, acceptUnqualifiedSchematicStartupEffects); }
    finally { this.busy = false; }
  }

  /** Fixed Date controls only; caller input cannot select code or a target. */
  public async observeSymbolBaselineClock(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.observeAgedClock(operationId); }
    finally { this.busy = false; }
  }

  public async finishSymbolBaseline(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.finishNormalClose(operationId); }
    finally { this.busy = false; }
  }

  public async observeSymbolBaselineFinish(operationId: string): Promise<Value> {
    const stage = this.baselines.get(operationId);
    requireValue(!this.busy && stage !== undefined, "Current symbol baseline original coordinator is unavailable or busy.");
    this.busy = true;
    try { return await stage.observeFinish(operationId); }
    finally { this.busy = false; }
  }

  public async inspectSymbolBaseline(operationId: string, purpose: SymbolOpenPurpose = "disposable-validation"): Promise<Value> {
    requireValue(!this.busy, "Current symbol baseline coordinator is busy.");
    this.busy = true;
    try {
      const stage = this.baselines.get(operationId);
      if (stage !== undefined) { this.assertBaselinePurpose(operationId, purpose); return await stage.inspect(operationId); }
      const journal = await this.services.loadOperation(operationId);
      requireValue(journal.operationId === operationId && isRecord(journal.plan) &&
        journal.plan["profile"] === "easyeda-pro-control.current-symbol-closed-baseline.v1", "Current symbol baseline history has another profile.");
      requireValue(openingPurpose(journal.plan["purpose"]) === purpose, "Current symbol baseline history belongs to another purpose.");
      const clockSidecar = await inspectCurrentSymbolClockEvidence(operationId);
      return { operationId, state: journal["state"], journalPath: journal["journalPath"], artifacts: journal.artifacts, clockSidecar,
        projectOpeningMode: journal["projectOpeningMode"] ?? null,
        unqualifiedSchematicStartupEffectsAccepted: journal["projectOpeningMode"] === "unqualified-schematic-startup-observation",
        finishSnapshotAttempted: journal["finishSnapshotAttempted"] ?? null,
        finishSnapshotCaptured: journal["finishSnapshotCaptured"] ?? null,
        finishSnapshotStatus: currentSymbolFinishSnapshotStatus(journal["finishSnapshotAttempted"], journal["finishSnapshotCaptured"], journal["finishSnapshotFailed"]),
        nextSafeAction: journal["nextSafeAction"], originalOwnerRetained: false, writerReady: false, executionAuthorized: false };
    } finally { this.busy = false; }
  }

  private static assertNotTransferred(runtime: Retained["runtime"]): void {
    requireValue(!baselineRuntimeReservations.has(runtime), "Current disposable opening was transferred to a one-shot baseline owner.");
  }

  private transferBaseline(slot: Retained, engine: EasyedaControlEngine, generation: CurrentDisposableOpenGeneration,
    preparation: CurrentOwnedSymbolMetadataPreparation | CurrentOwnedSymbolCopyPreparation, operationId: string): CurrentSymbolBaselineOwner | CurrentSymbolCopyBaselineOwner {
    const original = preparation.profile === "private.current-owned-symbol-copy-preparation.v1"
      ? assertOriginalCurrentOwnedSymbolCopyPreparation(preparation, engine) : assertOriginalCurrentOwnedSymbolPreparation(preparation, engine);
    requireValue(original.generation === generation && original.source === assertCurrentDisposableOpenGeneration(generation, engine),
      "Current symbol baseline transfer needs its original preparation and generation.");
    const journalText = canonicalJson(slot.journal), preparationText = canonicalJson(preparation), source = original.source;
    const upstream = engine.upstream, validator = engine.executionAuthorityValidator;
    const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
    const owner = Object.freeze({ profile: preparation.profile === "private.current-owned-symbol-copy-preparation.v1"
      ? "private.current-symbol-copy-baseline-owner.v1" as const : "private.current-symbol-baseline-owner.v1" as const,
    operationId, openingOperationId: generation.operationId });
    const current = (): void => {
      this.current(slot);
      requireValue(this.baselineJobs.has(slot.launch.jobId) && this.options.engine === engine && engine.upstream === upstream &&
        engine.executionAuthorityValidator === validator && upstream.bridgeSessionLifecycle === lifecycleReader &&
        upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(slot.journal) === journalText &&
        canonicalJson(slot.launch) === slot.launchText && canonicalJson(preparation) === preparationText, "Current symbol baseline transferred owner changed.");
    };
    const revalidate = async (): Promise<void> => {
      current(); await engine.assertBridgeAndRecoveryAdmission(operationId); current();
      const persisted = await this.load(owner.openingOperationId); current();
      requireValue(canonicalJson(persisted) === journalText, "Current symbol baseline persisted opening changed.");
    };
    current(); this.generations.delete(generation.operationId);
    if (preparation.profile === "private.current-owned-symbol-copy-preparation.v1") {
      requireValue(source.purpose === "disposable-validation", "Copy baseline transfer requires its disposable original opening.");
      issuedCopyBaselineOwners.set(owner, { value: Object.freeze({ source, preparation }), current, revalidate });
    } else { issuedBaselineOwners.set(owner, { value: Object.freeze({ source, preparation }), current, revalidate }); }
    return owner;
  }

  private issueGeneration(slot: Retained, engine: EasyedaControlEngine, runtime: WindowsControlRuntime, baselineOperationId?: string): CurrentDisposableOpenGeneration {
    this.current(slot);
    const journal = slot.journal, journalText = canonicalJson(journal), session = journal.bridgeSessionBeforeOrphan;
    requireValue(journal.state === "completed" && !journal.hardStop && !journal.orphanedCallPossible &&
      journal.projectDispatchConsumed && journal.result?.["outcome"] === "target-native-identity-observed" && session !== undefined,
    "Current symbol preparation requires the retained successful native-identity opening and original session.");
    const reader = engine.upstream.bridgeSessionLifecycle, sessionText = canonicalJson(session), upstream = engine.upstream;
    requireValue(reader !== undefined, "Current symbol preparation cannot inspect the original authenticated session.");
    const generation = Object.freeze({ profile: "private.current-disposable-open-generation.v1" as const, operationId: journal.operationId });
    this.generations.set(journal.operationId, generation);
    const current = (): void => {
      try {
        this.current(slot);
        if (baselineOperationId === undefined) { CurrentDisposableOpenCoordinator.assertNotTransferred(runtime); }
        else {
          requireValue(this.baselines.has(baselineOperationId) && this.baselineJobs.has(slot.launch.jobId),
            "Current symbol baseline generation lost its original reservation.");
        }
        requireValue(this.generations.get(journal.operationId) === generation && canonicalJson(journal) === journalText &&
          engine.upstream === upstream && upstream.bridgeSessionLifecycle === reader, "Current symbol preparation retained opening or lifecycle reader changed.");
        const lifecycle = reader.call(engine.upstream);
        requireValue(isRecord(lifecycle) && lifecycle["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
          isRecord(lifecycle["activeSession"]) && canonicalJson({ ...lifecycle["activeSession"], gatewayInstanceId: lifecycle["gatewayInstanceId"] }) === sessionText,
        "Current symbol preparation original authenticated session changed.");
      } catch (error) { this.generations.delete(journal.operationId); throw error; }
    };
    const source = Object.freeze({ engine, runtime, purpose: openingPurpose(journal.plan.purpose),
      ...(journal.plan.intent.startupExpectation === undefined ? {} : { startupExpectation: journal.plan.intent.startupExpectation }),
      ...(journal.plan.intent.schematicExpectation === undefined ? {} : { schematicExpectation: journal.plan.intent.schematicExpectation }),
      target: journal.plan.intent.target, expectedFingerprint: journal.plan.expectedFingerprint,
      launchProjection: slot.launch, bridgeSession: session, preNavigationCheckpoint: journal.checkpointProof });
    const revalidate = async (): Promise<void> => {
      try {
        current(); await engine.assertBridgeAndRecoveryAdmission(journal.operationId); current();
        await this.admission(source.expectedFingerprint); current();
        const persisted = await this.load(journal.operationId); current();
        requireValue(canonicalJson(persisted) === journalText, "Current symbol preparation persisted opening changed.");
      } catch (error) { this.generations.delete(journal.operationId); throw error; }
    };
    current(); issuedGenerations.set(generation, { source, current, revalidate }); return generation;
  }

  private async load(operationId: string): Promise<OpenJournal> {
    const raw: unknown = await this.services.loadOperation(operationId);
    requireValue(isOpenJournal(raw), "Current disposable-open journal is malformed or has another profile.");
    const { plan } = raw;
    const purpose = openingPurpose(plan.purpose);
    let request;
    if (purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) { request = currentSchematicOperationOpeningRequestSchema.parse(plan.intent.request); }
    else if (purpose === CURRENT_SYMBOL_OPERATION_PURPOSE) { request = parseCurrentSymbolOperationRequest(plan.intent.request); }
    else { request = parseCurrentDisposableOpenRequest(plan.intent.request); }
    requireValue(request.action === "open" && request.operationId === operationId, "Current disposable-open original request differs.");
    const target = currentDisposableOpenSealedTargetSchema.parse(plan.intent.target);
    requireValue(target.projectUuid === request.projectUuid && target.documentUuid === request.documentUuid &&
      target.rawWindowsPath === request.rawWindowsPath && target.expectedSourceSha256 === request.expectedSourceSha256 &&
      canonicalJson(plan.intent.implementation) === canonicalJson(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION) &&
      raw.schema === OPERATION_SCHEMA && raw.operationId === operationId && raw.planHash === buildPlanHash(plan),
    "Current disposable-open journal target or state differs.");
    CurrentDisposableOpenCoordinator.assertStartupPurpose(raw);
    // Managed load already verified journal/artifact bytes. This checked family
    // Projection never reconstructs the coordinator's original retained slot.
    return raw;
  }

  private current(slot: Retained): void {
    this.options.assertOwner();
    CurrentDisposableOpenCoordinator.assertStartupPurpose(slot.journal);
    requireValue(this.retained.get(slot.journal.operationId) === slot && this.options.runtime() === slot.runtime &&
      canonicalJson(slot.journal.plan) === slot.planText, "Current disposable-open retained owner or plan changed.");
    const status = slot.runtime.status();
    requireValue(status.state === "owned" && canonicalJson(status.launch) === slot.launchText,
      "Current disposable-open original supervised generation changed or was lost.");
  }

  private static assertStartupPurpose(journal: OpenJournal): void {
    const purpose = openingPurpose(journal.plan.purpose);
    if (purpose === CURRENT_SYMBOL_OPERATION_PURPOSE || purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
      requireValue(journal.checkpointProof.purpose === purpose &&
        currentSymbolStartupExpectationSchema.safeParse(journal.plan.intent.startupExpectation).success &&
        canonicalJson(journal.plan.intent.startupExpectation) === canonicalJson(journal.checkpointProof.startupExpectation),
      "Ordinary opening lost its sealed pre-navigation startup expectation.");
    } else {
      requireValue(journal.plan.intent.startupExpectation === undefined && journal.checkpointProof.purpose === undefined &&
        journal.checkpointProof.startupExpectation === undefined, "Disposable opening cannot inherit ordinary startup authority.");
    }
    if (purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
      const expectation = currentSchematicOpeningExpectationSchema.parse(journal.plan.intent.schematicExpectation);
      requireValue(canonicalJson(expectation) === canonicalJson(journal.checkpointProof.schematicExpectation) &&
        canonicalJson(expectation.startup) === canonicalJson(journal.plan.intent.startupExpectation) &&
        "rename" in journal.plan.intent.request && canonicalJson(expectation.intent) === canonicalJson(journal.plan.intent.request.rename),
      "Ordinary SCH opening lost its sealed rename/startup/child expectation.");
    } else {
      requireValue(journal.plan.intent.schematicExpectation === undefined && journal.checkpointProof.schematicExpectation === undefined,
        "Other opening purposes cannot inherit ordinary SCH expectations.");
    }
  }

  private currentUntransferred(slot: Retained): void {
    this.current(slot); CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
  }

  private async record(journal: OpenJournal, phase: string, value: unknown): Promise<void> {
    journal.sequence += 1;
    journal.artifacts.push(await this.services.writePhaseArtifact(journal.operationId, journal.sequence, phase, value));
    journal.updatedAt = new Date().toISOString();
    await this.services.updateOperation(journal);
  }

  private async admission(fingerprint: Value): Promise<void> {
    this.services.validateFingerprint(fingerprint);
    const status = await this.options.engine.status();
    const actual = status.stableFingerprint;
    this.services.validateFingerprint(actual);
    assertSubset(actual, fingerprint, "Current disposable-open runtime");
    requireValue(isRecord(actual["installedBundles"]) && typeof actual["installedBundles"]["assetsRoot"] === "string", "Current disposable-open installed assets are unavailable.");
    await this.services.verifyImplementation(actual["installedBundles"]["assetsRoot"]);
  }

  private async dispatch(slot: Retained, phase: Phase, failureContext: CurrentOpenFailureContext): Promise<Value> {
    const { engine } = this.options, journal = slot.journal;
    failureContext.phase = phase; failureContext.hostStage = "owner-check";
    this.currentUntransferred(slot);
    requireValue(!this.normalCloseAttempts.has(journal.operationId) && journal.normalCloseAttempted !== true,
      "A normal-close attempt is consumed; this opening cannot dispatch further observations or navigation.");
    failureContext.hostStage = "dispatch-guards";
    await engine.assertBridgeAndRecoveryAdmission(journal.operationId); this.currentUntransferred(slot);
    const scope = engine.upstream.withAuthenticatedBridgeDispatchScope;
    requireValue(scope !== undefined, "Current disposable opening requires authenticated dispatch scopes.");
    failureContext.hostStage = "scope";
    const result: unknown = await scope.call(engine.upstream, async () => {
      failureContext.hostStage = "runtime-admission";
      this.currentUntransferred(slot); await this.admission(journal.plan.expectedFingerprint); this.currentUntransferred(slot);
      const navigate = phase === "open-project" || phase === "open-document";
      failureContext.hostStage = "reserve-navigation";
      if (phase === "open-project") {
        requireValue(!journal.projectDispatchConsumed, "Project-open dispatch is already consumed.");
        journal.projectDispatchConsumed = true;
      }
      if (phase === "open-document") {
        requireValue(journal.projectDispatchConsumed && !journal.documentDispatchConsumed, "Document-open dispatch is unavailable or consumed.");
        journal.documentDispatchConsumed = true;
      }
      failureContext.hostStage = "build-program";
      const code = buildCurrentDisposableOpenProgram(journal.plan.intent.target, phase);
      journal.state = `${phase}-dispatching`; journal.hardStop = true;
      journal.mutationMayHaveOccurred ||= navigate;
      journal.nextSafeAction = "Await this tracked phase; no project or document open may be replayed.";
      failureContext.hostStage = "write-intent";
      await this.record(journal, `${phase}-intent`, { phase, codeSha256: sha256Text(code), navigationIntent: navigate }); this.currentUntransferred(slot);
      let parsed: Value | undefined;
      const toolTimeout = navigate ? CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS : 20_000;
      failureContext.hostStage = "tracked-dispatch";
      await engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: toolTimeout, confirmWrite: true }, toolTimeout + 10_000,
        async () => {
          failureContext.hostStage = "before-dispatch";
          this.currentUntransferred(slot);
          await engine.assertRecoveryOperationIsolated(journal.operationId);
          if (phase === "open-project") {
            failureContext.hostStage = "checkpoint-reproof";
            const purpose = openingPurpose(journal.plan.purpose), request = journal.plan.intent.request;
            if (purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
              requireValue("rename" in request, "Ordinary SCH opening intention is missing.");
              await this.services.verifySchematicCheckpoint(journal.checkpointProof, targetOnly(request), request.rename);
            } else {
              await (purpose === CURRENT_SYMBOL_OPERATION_PURPOSE
                ? this.services.verifyOrdinaryCheckpoint(journal.checkpointProof, targetOnly(request))
                : this.services.verifyCheckpoint(journal.checkpointProof, targetOnly(request)));
            }
          }
          this.currentUntransferred(slot);
          failureContext.hostStage = "tracked-dispatch";
        },
        async (raw) => {
          failureContext.hostStage = "decode-result";
          const envelope = extractToolPayload(raw);
          requireValue(Buffer.byteLength(JSON.stringify(envelope), "utf8") <= CURRENT_DISPOSABLE_OPEN_MAX_BYTES, "Current disposable-open reply exceeds its bound.");
          const decoded: unknown = decodeExactReadEnvelope(envelope);
          failureContext.hostStage = "validate-result";
          parsed = validateCurrentDisposableOpenResult(journal.plan.intent.target, phase, decoded);
          failureContext.hostStage = "retain-result";
          await this.record(journal, `${phase}-return`, parsed);
          this.currentUntransferred(slot);
          failureContext.hostStage = "tracked-dispatch";
        });
      failureContext.hostStage = "settled-result";
      this.currentUntransferred(slot);
      requireValue(parsed !== undefined, "Current disposable-open settled result was not retained.");
      failureContext.hostStage = "post-admission";
      await this.admission(journal.plan.expectedFingerprint); this.currentUntransferred(slot);
      return parsed;
    });
    this.currentUntransferred(slot);
    failureContext.hostStage = "settled-result";
    requireValue(isRecord(result), "Current disposable-open dispatch returned no exact result.");
    return result;
  }

  private async open(request: OpenRequest | OrdinaryOpenRequest | SchematicOpenRequest, fingerprint: Value,
    purpose: CurrentDisposableOpenPurpose = "disposable-validation"): Promise<Value> {
    const { engine } = this.options;
    this.options.assertOwner();
    const runtime = this.options.runtime(), status = runtime.status();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    requireValue(status.state === "owned", "Current disposable opening requires this facade's original supervised application.");
    const launch = launchSchema.parse(status.launch);
    await engine.assertBridgeAndNativeUiEditingAdmission();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    await this.services.assertOperationIdUnused(request.operationId);
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    this.services.validateFingerprint(fingerprint);
    let checkpointProof: CurrentDisposableOpenCheckpoint;
    try {
      if (purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
        requireValue("rename" in request, "Ordinary SCH opening intention is missing.");
        checkpointProof = await this.services.prepareSchematicCheckpoint(targetOnly(request), request.rename);
      } else {
        checkpointProof = await (purpose === CURRENT_SYMBOL_OPERATION_PURPOSE
          ? this.services.prepareOrdinaryCheckpoint(targetOnly(request)) : this.services.prepareCheckpoint(targetOnly(request)));
      }
    } catch (error) {
      // This boundary precedes our journal and every navigation dispatch. Keep
      // The original local cause without exposing its arbitrary paths/message.
      throw Object.assign(new Error(
        "Project opening stopped during checkpoint preparation before journal creation or navigation. Retain any checkpoint evidence; do not automatically repeat opening. Any application closure must use the original ordinary launcher and its retained ownership checks.",
        { cause: error },
      ), { dispatched: false });
    }
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
      documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256, branchUuid: checkpointProof.targetEvidence.branchUuid });
    const plan: Plan = { profile: PROFILE, purpose, intent: { request, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION,
      ...(purpose === "disposable-validation" ? {} : { startupExpectation: checkpointProof.startupExpectation }),
      ...(purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE ? { schematicExpectation: checkpointProof.schematicExpectation } : {}) }, expectedFingerprint: fingerprint };
    const journal: OpenJournal = { schema: OPERATION_SCHEMA, operationId: request.operationId, journalPath: operationPath(request.operationId),
      planHash: buildPlanHash(plan), plan, state: "planned", mutationState: "not-inferred", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: false, sequence: 0, artifacts: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), checkpointProof, originalLaunch: launch,
      projectDispatchConsumed: false, documentDispatchConsumed: false,
      nextSafeAction: "Run one current-profile disposable project/document open; normal open effects are accepted, not validated design changes." };
    const slot: Retained = { journal, runtime, launch, launchText: canonicalJson(launch), planText: canonicalJson(plan),
      nativeCleanup: Object.freeze({ status: runtime.status, observeApplicationWindow: runtime.observeApplicationWindow, normalClose: runtime.normalClose }) };
    this.retained.set(request.operationId, slot); this.currentUntransferred(slot);
    await this.services.createOperation(journal);
    const failureContext: CurrentOpenFailureContext = { phase: "preflight", hostStage: "owner-check" };
    try {
      await this.dispatch(slot, "preflight", failureContext); this.currentUntransferred(slot);
      const project = await this.dispatch(slot, "open-project", failureContext); this.currentUntransferred(slot);
      failureContext.hostStage = "project-acknowledgement";
      requireValue(project["publicResult"] === true && project["projectPresent"] === true, "Project opening did not acknowledge the exact target project.");
      // Project restoration may already have activated the selected PCB. A
      // Second ordinary open can Save again, so only observe that result.
      const document = project["documentPresent"] === true && project["activeTarget"] === true ? project : await this.dispatch(slot, "open-document", failureContext);
      this.currentUntransferred(slot);
      journal.result = { ...document, outcome: observationOutcome(document) }; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Navigation attempt completed. Inspect target identity/readiness separately; no Save, persistence or writer authority is inferred.";
      failureContext.hostStage = "write-completion";
      await this.record(journal, "completed", { result: journal.result, replayAllowed: false, persistenceVerified: false, writerAuthority: false });
      this.currentUntransferred(slot);
      return summary(journal);
    } catch (error) { return this.stop(journal, error, failureContext); }
  }

  private async stop(journal: OpenJournal, error: unknown, context: CurrentOpenFailureContext): Promise<Value> {
    const beforeNavigation = !journal.projectDispatchConsumed && !journal.documentDispatchConsumed && !journal.orphanedCallPossible;
    journal.state = journal.orphanedCallPossible ? "current-open-outcome-unknown" : "current-open-stopped";
    journal.hardStop = !beforeNavigation;
    if (beforeNavigation) {
      journal.state = "plan-invalidated";
      journal.result = { outcome: "stopped-before-navigation", navigationAttempted: false, replayAllowed: false };
    }
    journal.nextSafeAction = journal.orphanedCallPossible
      ? "Do not replay navigation. Keep this facade alive; request-normal-close may request one original-owner normal closure, then retire this exact attempt only after original root/Job termination and bridge closure. Never choose Save/Discard or force exit."
      : "Inspect or observe this consumed attempt without navigation. No successful opening or unchanged durable state is inferred.";
    if (beforeNavigation) { journal.nextSafeAction = "Attempt ended before navigation. Inspect its consumed history; never reuse this operation ID."; }
    journal.failureDiagnostic = describeCurrentOpenFailure(error, context);
    await this.record(journal, "failure-diagnostic", journal.failureDiagnostic);
    return { ...summary(journal), failure: "CURRENT_DISPOSABLE_OPEN_STOPPED" };
  }

  private retainedJournal(journal: OpenJournal): Retained {
    const slot = this.retained.get(journal.operationId);
    requireValue(slot !== undefined && canonicalJson(slot.journal) === canonicalJson(journal),
      "This facade no longer retains the original disposable-open owner and journal; loaded history cannot restore authority.");
    this.current(slot); return slot;
  }

  private async observe(loaded: OpenJournal): Promise<Value> {
    requireValue(!loaded.orphanedCallPossible && loaded.state !== "plan-invalidated", "An uncertain or retired open cannot dispatch observations.");
    const slot = this.retainedJournal(loaded);
    CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
    const journal = slot.journal;
    const failureContext: CurrentOpenFailureContext = { phase: "observe", hostStage: "owner-check" };
    try {
      const observation = await this.dispatch(slot, "observe", failureContext); this.currentUntransferred(slot);
      journal.result = { ...observation, outcome: observationOutcome(observation) }; journal.state = "completed"; journal.hardStop = false;
      journal.nextSafeAction = "Read-only target observation completed. Earlier navigation outcome is not reconstructed and navigation remains consumed.";
      failureContext.hostStage = "write-completion";
      await this.record(journal, "observed", { observation, earlierNavigationOutcome: "not-inferred", replayAllowed: false });
      this.currentUntransferred(slot);
      return summary(journal);
    } catch (error) { return this.stop(journal, error, failureContext); }
  }

  /** Terminal native cleanup for this failed purpose-bound opener only. This does
   * not enter a bridge scope or clear quarantine; the existing retirement still
   * requires original root/Job exit and released authenticated dispatch proof.
   */
  private async requestNormalClose(loaded: OpenJournal, purpose: CurrentDisposableOpenPurpose): Promise<Value> {
    requireValue(openingPurpose(loaded.plan.purpose) === purpose, "Current normal close cannot consume an opening of another purpose.");
    requireValue(!isTerminalOperation(loaded) && loaded.hardStop && loaded.orphanedCallPossible && loaded.state === "current-open-outcome-unknown",
      "Current normal close requires a stopped nonterminal orphan-risk opening.");
    requireValue(!this.normalCloseAttempts.has(loaded.operationId) && loaded.normalCloseAttempted !== true,
      "Current normal-close attempt is consumed; do not repeat close.");
    const slot = this.retained.get(loaded.operationId);
    requireValue(slot !== undefined && canonicalJson(slot.journal) === canonicalJson(loaded),
      "This facade no longer retains the original opening owner and journal; loaded history cannot restore authority.");
    const { engine } = this.options, { runtime, journal } = slot;
    const authority = journal.executionAuthorityBeforeOrphan, binding = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
    requireValue(prior !== undefined && binding !== undefined && authority !== undefined &&
      authority.processes.some((process) => process.pid === slot.launch.root.pid && process.startIdentity === slot.launch.root.startIdentity && process.role === "easyeda-main") &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${slot.launch.jobId}`)),
    "Current normal close lacks the operation's original retained launch/capture binding.");
    const { normalClose: close, observeApplicationWindow: observeWindow, status } = slot.nativeCleanup;
    const isolate = engine.assertRecoveryOperationIsolated, upstream = engine.upstream, validator = engine.executionAuthorityValidator;
    requireValue(typeof observeWindow === "function" && typeof close === "function", "Original retained native normal-close methods are unavailable.");
    const originalBinding = (): string => canonicalJson({ authority: journal.executionAuthorityBeforeOrphan,
      binding: journal.bridgeDispatchBeforeOrphan, prior: journal.bridgeSessionBeforeOrphan,
      state: journal.state, hardStop: journal.hardStop, orphanedCallPossible: journal.orphanedCallPossible });
    const bindingText = originalBinding();
    let journalText = canonicalJson(journal);
    const current = (): void => {
      requireValue(runtime.observeApplicationWindow === observeWindow && runtime.normalClose === close && runtime.status === status &&
        engine.assertRecoveryOperationIsolated === isolate && engine.executionAuthorityValidator === validator && engine.upstream === upstream &&
        originalBinding() === bindingText && canonicalJson(journal) === journalText, "Current normal-close retained methods or journal changed.");
      this.currentUntransferred(slot);
    };
    const unchanged = async (): Promise<void> => {
      current();
      const persisted = await this.load(journal.operationId); current();
      requireValue(canonicalJson(persisted) === journalText, "Current normal-close persisted journal changed.");
    };
    current(); await isolate.call(engine, journal.operationId); await unchanged();
    const window = await observeWindow.call(runtime); await unchanged();
    requireValue(Object.keys(window).toSorted().join(",") === "helperInstance,hwnd,jobId,outcome" &&
      window.outcome === "available" && typeof window.hwnd === "string" && /^[1-9]\d{0,18}$/u.test(window.hwnd) &&
      window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance,
    "Current normal close requires the original launch's unique application window.");
    await isolate.call(engine, journal.operationId); await unchanged();
    const intent = { schema: "easyeda-pro-control.current-open-normal-close-intent.v1", operationId: journal.operationId,
      planHash: journal.planHash, originalLaunch: slot.launch, originalLaunchSha256: sha256Json(slot.launch),
      authoritySha256: authority.authoritySha256, bridgeDispatch: binding, bridgeSession: prior, hwnd: window.hwnd,
      confirmNormalClose: true, acceptUnknownFileEffects: true, replayAllowed: false };
    // Publication can fail after leaving durable bytes. Reserve in memory first,
    // Then publish intent before the only native dispatch. Never reset on error.
    this.normalCloseAttempts.add(journal.operationId);
    journal.normalCloseAttempted = true;
    journal.nextSafeAction = "Normal-close intent consumed. Inspect or observe original termination for retirement; never repeat close, navigate, Save or choose a prompt response.";
    await this.record(journal, "normal-close-intent", intent);
    journalText = canonicalJson(journal); await unchanged();
    await isolate.call(engine, journal.operationId); await unchanged();
    // The shared retained helper rechecks root/Job/HWND and consumes its own
    // Per-Job close reservation. Ordinary and closed-session routes cannot retry.
    await close.call(runtime, window.hwnd); await unchanged();
    journal.normalCloseAcknowledged = true;
    await this.record(journal, "normal-close-acknowledged", {
      schema: "easyeda-pro-control.current-open-normal-close-acknowledged.v1", operationId: journal.operationId,
      intentSha256: sha256Json(intent), requestAcknowledged: true, terminationProved: false, quarantineCleared: false,
    });
    journalText = canonicalJson(journal); await unchanged();
    return { ...summary(journal), action: "request-normal-close", terminationProved: false, quarantineCleared: false };
  }

  private async retire(loaded: OpenJournal): Promise<Value> {
    requireValue(!isTerminalOperation(loaded), "Current disposable-open attempt is already terminal.");
    const slot = this.retainedJournal(loaded);
    CurrentDisposableOpenCoordinator.assertNotTransferred(slot.runtime);
    const { engine } = this.options, journal = slot.journal;
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    const authority = journal.executionAuthorityBeforeOrphan, binding = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
    requireValue(prior !== undefined && binding !== undefined && authority !== undefined &&
      authority.processes.some((process) => process.pid === slot.launch.root.pid && process.startIdentity === slot.launch.root.startIdentity && process.role === "easyeda-main") &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${slot.launch.jobId}`)),
    "Retirement lacks the operation's original retained launch/capture binding.");
    const observeClosure = engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
    requireValue(observeClosure !== undefined, "Closed bridge dispatch retirement proof is unavailable.");
    const observation = terminationSchema.parse(await slot.runtime.observeLaunchTermination()); this.currentUntransferred(slot);
    requireValue(observation.jobId === slot.launch.jobId && observation.helperInstance === slot.launch.helperInstance,
      "Retirement termination observation belongs to another original launch.");
    const closure = closedSessionSchema.parse(observeClosure.call(engine.upstream, binding, prior));
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    requireValue(canonicalJson(await this.load(journal.operationId)) === canonicalJson(journal), "Disposable-open journal changed before retirement.");
    this.currentUntransferred(slot);
    requireValue(canonicalJson(observeClosure.call(engine.upstream, binding, prior)) === canonicalJson(closure), "Original bridge closure changed before retirement.");
    const proof = { schema: "easyeda-pro-control.current-open-retirement.v1", operationId: journal.operationId, planHash: journal.planHash,
      originalLaunch: slot.launch, originalLaunchSha256: sha256Json(slot.launch), authoritySha256: authority.authoritySha256,
      phase: journal.orphanedCallPhase, bridgeSession: prior, bridgeDispatch: binding, closedBridgeSession: closure,
      termination: observation, navigationOutcome: "not-inferred", durableEffects: "unknown-and-accepted", replayAllowed: false,
      continuationAuthorized: false, replacementAuthorityGranted: false, persistenceVerified: false, writerAuthority: false };
    // Publish complete proof while the original quarantine is still set. Only
    // This no-replay family consumes it; shared CAD recovery is unchanged.
    await this.record(journal, "retirement-proof", proof); this.currentUntransferred(slot);
    requireValue(canonicalJson(observeClosure.call(engine.upstream, binding, prior)) === canonicalJson(closure), "Original bridge closure changed after proof publication.");
    await engine.assertRecoveryOperationIsolated(journal.operationId); this.currentUntransferred(slot);
    const hadOrphan = journal.orphanedCallPossible;
    const terminal: OpenJournal = { ...journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
      result: { retired: true, ...proof }, updatedAt: new Date().toISOString(),
      nextSafeAction: "Attempt retired without replay or continuation. Unknown disposable file effects remain. Ordinary startup may be considered separately; no original design outcome was inferred." };
    delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
    await this.services.updateOperation(terminal);
    this.currentUntransferred(slot);
    Object.assign(journal, terminal);
    delete journal.runtimeRestartChallenge; delete journal.runtimeRestartChallengeIssuedAt;
    if (hadOrphan) { await engine.executionAuthorityValidator?.releaseCapture?.(authority); }
    return summary(journal);
  }
}
