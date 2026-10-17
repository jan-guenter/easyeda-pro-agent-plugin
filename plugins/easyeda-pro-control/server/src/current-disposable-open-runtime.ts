/* oxlint-disable import/max-dependencies -- This operation composes fixed checkpoint, current implementation, retained runtime and shared journal boundaries. */
import { z } from "zod";
import { controlDataDirectory, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { listQualifiedOperationStates } from "./closed-symbol-terminal-admission.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_MAX_BYTES, CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS, buildCurrentDisposableOpenProgram, currentDisposableOpenSealedTargetSchema,
  parseCurrentDisposableOpenRequest, validateCurrentDisposableOpenResult } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenRequest, CurrentDisposableOpenSealedTarget, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure } from "./current-disposable-open-diagnostics.ts";
import type { CurrentOpenFailureContext, CurrentOpenFailureDiagnostic } from "./current-disposable-open-diagnostics.ts";
import { prepareCurrentDisposableOpenCheckpoint, prepareCurrentSymbolOperationCheckpoint,
  verifyCurrentDisposableOpenCheckpoint, verifyCurrentSymbolOperationCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { EasyedaControlEngine } from "./engine.ts";
import type { AuthenticatedBridgeSessionIdentity, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";
// oxlint-disable-next-line import/no-cycle -- The fixed preparation stage consumes this module's private original-object issuer after initialization.
import { assertOriginalCurrentOwnedSymbolPreparation, prepareCurrentOwnedSymbolMetadata } from "./current-symbol-owned-preparation.ts";
import type { CurrentOwnedSymbolMetadataPreparation } from "./current-symbol-owned-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- The baseline consumes the opener's private original-object transfer; public actions cannot construct that owner.
import { CurrentSymbolBaselineCoordinator, currentSymbolBaselineRequestSchema, currentSymbolFinishSnapshotStatus } from "./current-symbol-baseline-runtime.ts";
import { inspectCurrentSymbolClockEvidence } from "./current-symbol-clock-evidence.ts";
// oxlint-disable-next-line import/no-cycle -- The disposable route retains the original baseline; validation never reconstructs its private opener owner.
import { CurrentSymbolValidationCoordinator } from "./current-symbol-validation-runtime.ts";
import { CURRENT_SYMBOL_OPERATION_PURPOSE, parseCurrentSymbolOperationRequest } from "./current-symbol-operation.ts";
import type { CurrentSymbolOperationRequest } from "./current-symbol-operation.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";

type Value = Record<string, unknown>;
type Phase = "preflight" | "open-project" | "open-document" | "observe";
type OpenRequest = Extract<CurrentDisposableOpenRequest, { action: "open" }>;
type OrdinaryOpenRequest = Extract<CurrentSymbolOperationRequest, { action: "open" }>;
export type CurrentDisposableOpenPurpose = "disposable-validation" | typeof CURRENT_SYMBOL_OPERATION_PURPOSE;
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
  intent: { request: OpenRequest | OrdinaryOpenRequest; target: CurrentDisposableOpenSealedTarget; implementation: typeof CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
    startupExpectation?: CurrentSymbolStartupExpectation };
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
export interface CurrentDisposableOpenOptions {
  readonly engine: Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertNativeUiEditingAllowed" | "assertRecoveryOperationIsolated" | "assertBridgeAndRecoveryAdmission" |
    "assertBridgeAndNativeUiEditingAdmission" | "dispatchWithOrphanTracking" | "executionAuthorityValidator" | "upstream"> & {
      readonly status: () => Promise<{ stableFingerprint: Value }>;
    };
  readonly runtime: () => OpenRuntime;
  readonly assertOwner: () => void;
}
const defaults = { createOperation, loadOperation, updateOperation, writePhaseArtifact, listOperations: listQualifiedOperationStates,
  prepareCheckpoint: prepareCurrentDisposableOpenCheckpoint, verifyCheckpoint: verifyCurrentDisposableOpenCheckpoint,
  prepareOrdinaryCheckpoint: prepareCurrentSymbolOperationCheckpoint, verifyOrdinaryCheckpoint: verifyCurrentSymbolOperationCheckpoint,
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
export interface CurrentSymbolBaselineOwner {
  readonly profile: "private.current-symbol-baseline-owner.v1";
  readonly operationId: string;
  readonly openingOperationId: string;
}
export interface CurrentSymbolBaselineOwnerSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly preparation: CurrentOwnedSymbolMetadataPreparation;
}
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
  requireValue(value === CURRENT_SYMBOL_OPERATION_PURPOSE, "Current opening purpose is unsupported.");
  return value;
}
function targetOnly(request: CurrentDisposableOpenTarget): CurrentDisposableOpenTarget {
  return { rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
    documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256 };
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
    checkpoint["profile"] === "easyeda-pro-control.current-disposable-open-checkpoint.v1" && isRecord(checkpoint["checkpoint"]) &&
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
  private readonly baselinePurposes = new Map<string, CurrentDisposableOpenPurpose>();
  private readonly validations = new Map<string, CurrentSymbolValidationCoordinator>();
  private readonly ordinaryOperations = new Map<string, CurrentSymbolValidationCoordinator>();
  private readonly normalCloseAttempts = new Set<string>();
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
        return await this.requestNormalClose(journal);
      }
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  /** Internal future ordinary entry only. No tool registers this method. Purpose
   * comes from this distinct parser/entry, never a caller-supplied override.
   */
  public async runOrdinary(input: unknown, expectedFingerprint?: Value): Promise<Value> {
    const request = parseCurrentSymbolOperationRequest(structuredClone(input));
    requireValue(!this.busy, "Current ordinary symbol operation is already in progress.");
    if (request.action === "metadata-begin" || request.action === "metadata-advance" || request.action === "metadata-inspect") {
      requireValue(expectedFingerprint === undefined, "Ordinary metadata cannot replace its original runtime fingerprint.");
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
    if (request.action !== "open" && request.action !== "observe" && request.action !== "inspect" && request.action !== "retire-after-termination") {
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
      if (request.action === "inspect") { return summary(journal); }
      this.generations.clear();
      if (request.action === "retire-after-termination") { return await this.retire(journal); }
      return await this.observe(journal);
    } finally { this.busy = false; }
  }

  private assertBaselinePurpose(operationId: string, purpose: CurrentDisposableOpenPurpose): void {
    const retained = this.baselinePurposes.get(operationId);
    requireValue(purpose === "disposable-validation" ? retained !== CURRENT_SYMBOL_OPERATION_PURPOSE : retained === purpose,
      "Current symbol baseline belongs to another purpose or its ordinary owner is unavailable.");
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

  private async beginBaseline(openingOperationId: string, input: unknown, sqlRuntime: MachineProfile["runtime"],
    purpose: CurrentDisposableOpenPurpose): Promise<Value> {
    const request = currentSymbolBaselineRequestSchema.parse(input);
    requireValue(request.operationId !== openingOperationId && !this.busy && !this.baselines.has(request.operationId),
      "Current symbol baseline needs a distinct unused operation.");
    requireValue(this.productionServices && this.options.engine instanceof EasyedaControlEngine,
      "Current symbol baseline cannot issue from injected opening services or an unowned engine.");
    const engine = this.options.engine, slot = this.retained.get(openingOperationId);
    requireValue(slot !== undefined && slot.runtime instanceof WindowsControlRuntime, "Current symbol baseline needs the original retained opening and runtime.");
    requireValue(openingPurpose(slot.journal.plan.purpose) === purpose, "Current symbol baseline cannot transfer an opening of another purpose.");
    const runtime = slot.runtime;
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime); this.current(slot);
    baselineRuntimeReservations.add(runtime);
    this.baselineJobs.add(slot.launch.jobId);
    this.generations.clear(); this.busy = true;
    const stage = new CurrentSymbolBaselineCoordinator(engine, runtime, sqlRuntime);
    this.baselines.set(request.operationId, stage);
    this.baselinePurposes.set(request.operationId, purpose);
    let owner: CurrentSymbolBaselineOwner | undefined;
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
          const preparation = await prepareCurrentOwnedSymbolMetadata(engine, generation, request.preparation);
          owner = this.transferBaseline(slot, engine, generation, preparation, request.operationId);
          await stage.capture(owner);
        });
      } catch (error) {
        if (owner !== undefined) {
          try { await stage.stopAfterScopeFailure(owner); }
          catch (recordError) { throw new AggregateError([error, recordError], "Current symbol baseline scope failed and could not record its stopped state.", { cause: recordError }); }
        }
        throw error;
      }
      requireValue(owner !== undefined, "Current symbol baseline scope returned without its retained owner.");
      return await stage.close(owner);
    } finally { this.generations.delete(openingOperationId); this.busy = false; }
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

  public async inspectSymbolBaseline(operationId: string, purpose: CurrentDisposableOpenPurpose = "disposable-validation"): Promise<Value> {
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
    preparation: CurrentOwnedSymbolMetadataPreparation, operationId: string): CurrentSymbolBaselineOwner {
    const original = assertOriginalCurrentOwnedSymbolPreparation(preparation, engine);
    requireValue(original.generation === generation && original.source === assertCurrentDisposableOpenGeneration(generation, engine),
      "Current symbol baseline transfer needs its original preparation and generation.");
    const journalText = canonicalJson(slot.journal), preparationText = canonicalJson(preparation), source = original.source;
    const upstream = engine.upstream, validator = engine.executionAuthorityValidator;
    const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
    const owner = Object.freeze({ profile: "private.current-symbol-baseline-owner.v1" as const, operationId, openingOperationId: generation.operationId });
    const value = Object.freeze({ source, preparation });
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
    issuedBaselineOwners.set(owner, { value, current, revalidate }); return owner;
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
    const request = purpose === CURRENT_SYMBOL_OPERATION_PURPOSE ? parseCurrentSymbolOperationRequest(plan.intent.request) : parseCurrentDisposableOpenRequest(plan.intent.request);
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
    if (openingPurpose(journal.plan.purpose) === CURRENT_SYMBOL_OPERATION_PURPOSE) {
      requireValue(journal.checkpointProof.purpose === CURRENT_SYMBOL_OPERATION_PURPOSE &&
        currentSymbolStartupExpectationSchema.safeParse(journal.plan.intent.startupExpectation).success &&
        canonicalJson(journal.plan.intent.startupExpectation) === canonicalJson(journal.checkpointProof.startupExpectation),
      "Ordinary symbol opening lost its sealed pre-navigation startup expectation.");
    } else {
      requireValue(journal.plan.intent.startupExpectation === undefined && journal.checkpointProof.purpose === undefined &&
        journal.checkpointProof.startupExpectation === undefined, "Disposable opening cannot inherit ordinary startup authority.");
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
            await (openingPurpose(journal.plan.purpose) === CURRENT_SYMBOL_OPERATION_PURPOSE
              ? this.services.verifyOrdinaryCheckpoint(journal.checkpointProof, targetOnly(journal.plan.intent.request))
              : this.services.verifyCheckpoint(journal.checkpointProof, targetOnly(journal.plan.intent.request)));
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

  private async open(request: OpenRequest | OrdinaryOpenRequest, fingerprint: Value,
    purpose: CurrentDisposableOpenPurpose = "disposable-validation"): Promise<Value> {
    const { engine } = this.options;
    this.options.assertOwner();
    const runtime = this.options.runtime(), status = runtime.status();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    requireValue(status.state === "owned", "Current disposable opening requires this facade's original supervised application.");
    const launch = launchSchema.parse(status.launch);
    await engine.assertBridgeAndNativeUiEditingAdmission();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    const operations = await this.services.listOperations();
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    requireValue(!operations.some((operation) => operation["operationId"] === request.operationId), "Current disposable-open operation ID is consumed.");
    this.services.validateFingerprint(fingerprint);
    const checkpointProof = await (purpose === CURRENT_SYMBOL_OPERATION_PURPOSE
      ? this.services.prepareOrdinaryCheckpoint(targetOnly(request)) : this.services.prepareCheckpoint(targetOnly(request)));
    CurrentDisposableOpenCoordinator.assertNotTransferred(runtime);
    const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: request.rawWindowsPath, projectUuid: request.projectUuid,
      documentUuid: request.documentUuid, expectedSourceSha256: request.expectedSourceSha256, branchUuid: checkpointProof.targetEvidence.branchUuid });
    const plan: Plan = { profile: PROFILE, purpose, intent: { request, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION,
      ...(purpose === CURRENT_SYMBOL_OPERATION_PURPOSE ? { startupExpectation: checkpointProof.startupExpectation } : {}) }, expectedFingerprint: fingerprint };
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

  /** Terminal native cleanup for this failed disposable opener only. This does
   * not enter a bridge scope or clear quarantine; the existing retirement still
   * requires original root/Job exit and released authenticated dispatch proof.
   */
  private async requestNormalClose(loaded: OpenJournal): Promise<Value> {
    requireValue(!isTerminalOperation(loaded) && loaded.hardStop && loaded.orphanedCallPossible && loaded.state === "current-open-outcome-unknown",
      "Disposable normal close requires a stopped nonterminal orphan-risk opening.");
    requireValue(!this.normalCloseAttempts.has(loaded.operationId) && loaded.normalCloseAttempted !== true,
      "Disposable normal-close attempt is consumed; do not repeat close.");
    const slot = this.retained.get(loaded.operationId);
    requireValue(slot !== undefined && canonicalJson(slot.journal) === canonicalJson(loaded),
      "This facade no longer retains the original disposable-open owner and journal; loaded history cannot restore authority.");
    const { engine } = this.options, { runtime, journal } = slot;
    const authority = journal.executionAuthorityBeforeOrphan, binding = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
    requireValue(prior !== undefined && binding !== undefined && authority !== undefined &&
      authority.processes.some((process) => process.pid === slot.launch.root.pid && process.startIdentity === slot.launch.root.startIdentity && process.role === "easyeda-main") &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${slot.launch.jobId}`)),
    "Disposable normal close lacks the operation's original retained launch/capture binding.");
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
        originalBinding() === bindingText && canonicalJson(journal) === journalText, "Disposable normal-close retained methods or journal changed.");
      this.currentUntransferred(slot);
    };
    const unchanged = async (): Promise<void> => {
      current();
      const persisted = await this.load(journal.operationId); current();
      requireValue(canonicalJson(persisted) === journalText, "Disposable normal-close persisted journal changed.");
    };
    current(); await isolate.call(engine, journal.operationId); await unchanged();
    const window = await observeWindow.call(runtime); await unchanged();
    requireValue(Object.keys(window).toSorted().join(",") === "helperInstance,hwnd,jobId,outcome" &&
      window.outcome === "available" && typeof window.hwnd === "string" && /^[1-9]\d{0,18}$/u.test(window.hwnd) &&
      window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance,
    "Disposable normal close requires the original launch's unique application window.");
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
