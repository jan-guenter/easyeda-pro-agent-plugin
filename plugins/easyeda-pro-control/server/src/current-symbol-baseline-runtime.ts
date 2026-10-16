/* oxlint-disable import/max-dependencies -- This retained lifecycle owner composes the distinct original-authority, source-pin and exact-reader validators; none is replaced by a caller-supplied callback. */
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertExpectedFingerprint, assertSubset, buildPlanHash, canonicalJson, isRecord, sha256Json } from "./core.ts";
import { verifyCurrentDisposableOpenImplementation, verifyCurrentProjectOnlyOpenImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Only the retained opener issues these one-way ownership transfers; no caller-provided issuer exists.
import { assertCurrentSymbolBaselineOwner, revalidateCurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenGenerationSource, CurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Closed copying consumes only original owners issued by the opener; this private coordinator never replaces that issuer.
import { assertOriginalCurrentSymbolBaselineCopy, captureCurrentSymbolBaselineCopy, captureCurrentSymbolFinishSnapshot, revalidateCurrentSymbolBaselineCopy } from "./current-symbol-baseline-copy.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import { qualifyCurrentSymbolClockRelation } from "./current-symbol-clock-relation.ts";
import type { CurrentSymbolClockRelation } from "./current-symbol-clock-relation.ts";
import { CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, buildCurrentUploadQueueReadProgram, decodeCurrentUploadQueueReadReply } from "./current-upload-queue-read.ts";
import { CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, buildCurrentProjectOnlyOpenProgram, decodeCurrentProjectOnlyOpenReply } from "./current-project-only-open.ts";
// oxlint-disable-next-line import/no-cycle -- The source reader reuses the original copy issuer; it cannot replace the retained coordinator's ownership.
import { verifyCurrentSymbolPreopenSource } from "./current-symbol-preopen-source.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertWindowsRuntimeValidator } from "./windows-runtime-validator.ts";

type Value = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
const CACHE_PHASE = "current-symbol-inactive-caches";
const OPEN_PHASE = "current-symbol-project-only-open";
type ProjectOpeningMode = "historical-subset" | "unqualified-schematic-startup-observation";
const activeSessionSchema = z.object({ sessionId: z.string().regex(/^[A-Za-z0-9_-]{43}$/u), sequence: z.number().int().positive(),
  authenticationReceiptSha256: z.string().regex(/^[a-f0-9]{64}$/u), authenticatedAtEpochMs: z.number().int().positive() }).strict();
const closedSessionSchema = activeSessionSchema.extend({ closedAtEpochMs: z.number().int().positive(), closeReason: z.string().min(1).max(160) }).strict();
export const currentSymbolBaselineRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
  preparation: currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }), confirmNormalClose: z.literal(true) }).strict();
interface Journal extends TrackedDispatchOperationJournal {
  plan: Value & { profile: typeof PROFILE }; closeAttempted: boolean; copyAttempted: boolean;
  relaunchAttempted: boolean; releaseAttempted: boolean; admissionAttempted: boolean; cacheAttempted: boolean;
  projectOpenAttempted: boolean; finishCloseAttempted: boolean; finishReleaseAttempted: boolean;
  finishSnapshotAttempted?: boolean; finishSnapshotCaptured?: boolean; finishSnapshotFailed?: boolean;
  projectOpeningMode?: ProjectOpeningMode;
}
type CopyResult = Awaited<ReturnType<typeof captureCurrentSymbolBaselineCopy>>;
type Binding = Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle">;
interface Slot {
  readonly owner: CurrentSymbolBaselineOwner; readonly journal: Journal; readonly ownerText: string;
  created: boolean; journalText: string; capture?: ClosedSessionAuthorityCapture; binding?: Binding;
  intent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt; observation?: ClosedSessionTerminationObservation;
  proof?: ClosedSessionTerminationProof; copy?: CopyResult; closeAttempted: boolean; copyAttempted: boolean; baselineCaptured: boolean;
  relaunchAttempted: boolean; releaseAttempted: boolean; captureReleased: boolean;
  launch?: WindowsAuthorityLaunch; launchClock?: IssuedWindowsClockObservation; terminationClock?: IssuedWindowsClockObservation;
  currentLaunch?: (scopeText?: string) => void;
  admissionAttempted: boolean; admissionProved: boolean;
  admissionCapture?: ClosedSessionAuthorityCapture; admissionClock?: IssuedWindowsClockObservation;
  source?: CurrentDisposableOpenGenerationSource; sessionCurrent?: (scopeText?: string) => void;
  cacheAttempted: boolean; cacheReplyRetained: boolean; cachesObserved: boolean;
  cacheRaw?: unknown; cacheObservation?: Readonly<Value>; cacheClock?: IssuedWindowsClockObservation;
  projectOpenAttempted: boolean; projectOpenReplyRetained: boolean; projectOpened: boolean;
  projectOpenRaw?: unknown; projectOpenObservation?: Readonly<Value>; projectOpenClock?: IssuedWindowsClockObservation;
  preopenSource?: Awaited<ReturnType<typeof verifyCurrentSymbolPreopenSource>>;
  finishing: boolean; finishCloseAttempted: boolean; finishReleaseAttempted: boolean; finishCaptureReleased: boolean; finished: boolean;
  finishIntent?: ClosedSessionCloseIntent; finishReceipt?: ClosedSessionCloseReceipt;
  finishObservation?: ClosedSessionTerminationObservation; finishProof?: ClosedSessionTerminationProof;
  finishCaptureText?: string;
  finishSnapshotAttempted: boolean; finishSnapshotCaptured: boolean; finishSnapshotFailed: boolean;
  finishSnapshot?: Awaited<ReturnType<typeof captureCurrentSymbolFinishSnapshot>>;
  finishSnapshotFailureEvidenceText?: string;
  readonly evidence: Map<string, unknown>;
}
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function relaunchMethods(engine: EasyedaControlEngine, runtime: WindowsControlRuntime): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity comparison only; every invocation retains its actual runtime or engine receiver. */
  return [runtime.launch, runtime.status, runtime.clockObservationForLaunch, runtime.releaseCapture, engine.releaseClosedSessionAuthority,
    runtime.capture, runtime.proveTerminated, engine.captureClosedSessionAuthority, engine.clockObservationForClosedCapture, engine.runtimeIdentity,
    engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated, engine.assertBridgeAndRecoveryAdmission, engine.upstream.withAuthenticatedBridgeDispatchScope,
    engine.status, engine.dispatchWithOrphanTracking, engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk,
    engine.clockObservationForTrackedDispatch, engine.upstream.callTool, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased,
    runtime.observeApplicationWindow, runtime.prepareClosedSessionClose, runtime.requestClosedSessionNormalClose,
    runtime.probeClosedSessionTermination];
  /* oxlint-enable typescript/unbound-method */
}
export function currentSymbolFinishSnapshotStatus(attempted: unknown, captured: unknown, failed: unknown): string {
  if (captured === true) { return "captured"; }
  if (failed === true) { return "failed"; }
  if (attempted === true) { return "attempted"; }
  return attempted === false ? "not-attempted" : "not-recorded";
}
function summary(slot: Slot): Value {
  return { operationId: slot.owner.operationId, openingOperationId: slot.owner.openingOperationId, state: slot.journal.state,
    closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined, copyAttempted: slot.copyAttempted,
    baselineCaptured: slot.baselineCaptured, relaunchAttempted: slot.relaunchAttempted, launchAcknowledged: slot.launch !== undefined,
    releaseAttempted: slot.releaseAttempted, captureReleased: slot.captureReleased, nativeLaunchClockStatus: slot.launchClock?.clock.status ?? "not-observed",
    admissionAttempted: slot.admissionAttempted, admissionCaptureRetained: slot.admissionCapture !== undefined, admissionProved: slot.admissionProved,
    nativeAdmissionClockStatus: slot.admissionClock?.clock.status ?? "not-observed",
    cacheAttempted: slot.cacheAttempted, cacheReplyRetained: slot.cacheReplyRetained, cachesObserved: slot.cachesObserved,
    projectOpenAttempted: slot.projectOpenAttempted, projectOpenReplyRetained: slot.projectOpenReplyRetained, projectOpened: slot.projectOpened,
    projectOpeningMode: slot.journal.projectOpeningMode ?? null,
    unqualifiedSchematicStartupEffectsAccepted: slot.journal.projectOpeningMode === "unqualified-schematic-startup-observation",
    finishCloseAttempted: slot.finishCloseAttempted, finishCloseAcknowledged: slot.finishReceipt !== undefined,
    finishReleaseAttempted: slot.finishReleaseAttempted, finishCaptureReleased: slot.finishCaptureReleased, retired: slot.finished,
    finishSnapshotAttempted: slot.finishSnapshotAttempted, finishSnapshotCaptured: slot.finishSnapshotCaptured,
    finishSnapshotStatus: currentSymbolFinishSnapshotStatus(slot.finishSnapshotAttempted, slot.finishSnapshotCaptured, slot.finishSnapshotFailed),
    nativeProjectOpenClockStatus: slot.projectOpenClock?.clock.status ?? "not-observed",
    startupPremises: slot.copy?.startupPremises ?? null,
    nativeCacheClockStatus: slot.cacheClock?.clock.status ?? "not-observed", startupQualified: false,
    beforeWriteBaselineVerified: false, openingEffectsVerified: false, backendActorVerified: false, backendClockVerified: false,
    writerReady: false, executionAuthorized: false, explicitSaveDispatched: false, replayAllowed: false,
    journalPath: slot.journal.journalPath, artifacts: slot.journal.artifacts, nextSafeAction: slot.journal.nextSafeAction };
}

/** Internal only. Normal close is one-shot; only a qualified pending observation
 * permits another termination probe. Lost original owners cannot be restored by
 * loading journals. Subsequent launch retains a new original result without
 * reusing the old closure authority. No Save or writer is admitted.
 */
export class CurrentSymbolBaselineCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: WindowsControlRuntime;
  private readonly sqlRuntime: MachineProfile["runtime"];
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine, runtime: WindowsControlRuntime, sqlRuntime: MachineProfile["runtime"]) {
    this.engine = engine; this.runtime = runtime; this.sqlRuntime = structuredClone(sqlRuntime);
  }

  private current(slot: Slot): void {
    const original = assertCurrentSymbolBaselineOwner(slot.owner, this.engine);
    need(this.slots.get(slot.owner.operationId) === slot && canonicalJson(slot.owner) === slot.ownerText && original.source.runtime === this.runtime,
      "Current symbol baseline original owner changed.");
    if (slot.capture !== undefined) { assertWindowsRuntimeValidator(this.engine.executionAuthorityValidator, this.runtime); }
  }
  private outsideScope(slot: Slot): void {
    this.current(slot);
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(reader !== undefined && reader.call(this.engine.upstream) === undefined, "Current symbol baseline close/copy requires the ended authenticated scope.");
  }
  private async unchanged(slot: Slot): Promise<void> {
    this.current(slot);
    await revalidateCurrentSymbolBaselineOwner(slot.owner, this.engine); this.current(slot);
    const persisted = await loadOperation(slot.owner.operationId); this.current(slot);
    need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "Current symbol baseline journal changed.");
  }
  private static async record(slot: Slot, phase: string, value: unknown): Promise<void> {
    const journal = slot.journal;
    journal.sequence += 1;
    journal.artifacts.push(await writePhaseArtifact(journal.operationId, journal.sequence, phase, value));
    journal.updatedAt = new Date().toISOString();
    await updateOperation(journal); slot.journalText = canonicalJson(journal);
  }
  private static async stopped(slot: Slot, phase: string): Promise<void> {
    slot.journal.state = "stopped"; slot.journal.hardStop = true;
    slot.journal.relaunchAttempted = slot.relaunchAttempted; slot.journal.releaseAttempted = slot.releaseAttempted;
    slot.journal.admissionAttempted = slot.admissionAttempted;
    slot.journal.cacheAttempted = slot.cacheAttempted;
    slot.journal.projectOpenAttempted = slot.projectOpenAttempted;
    slot.journal.finishCloseAttempted = slot.finishCloseAttempted; slot.journal.finishReleaseAttempted = slot.finishReleaseAttempted;
    slot.journal.finishSnapshotAttempted = slot.finishSnapshotAttempted; slot.journal.finishSnapshotCaptured = slot.finishSnapshotCaptured;
    slot.journal.finishSnapshotFailed = slot.finishSnapshotFailed;
    slot.journal.nextSafeAction = "Inspect this consumed attempt. Do not repeat close, copy, launch, release, admission, cache observation, Save or navigation; retain the original facade and process handles.";
    if (phase === "finish-snapshot" && slot.finishSnapshotFailed) {
      slot.journal.nextSafeAction = "Final snapshot failed and will not be retried. Retain this facade; baseline-observe-finish may retire using its original terminal proof without another close, navigation or snapshot. File effects remain unknown.";
    }
    if (slot.created) {
      const persisted = await loadOperation(slot.owner.operationId);
      // Preserve externally advanced or conflicting history instead of replacing
      // It with our stopped state. The in-memory attempt remains consumed.
      if (canonicalJson(persisted) !== slot.journalText) { return; }
      await CurrentSymbolBaselineCoordinator.record(slot, "stopped", { phase, replayAllowed: false, closeAttempted: slot.closeAttempted, copyAttempted: slot.copyAttempted,
        relaunchAttempted: slot.relaunchAttempted, launchAcknowledged: slot.launch !== undefined, releaseAttempted: slot.releaseAttempted, captureReleased: slot.captureReleased,
        admissionAttempted: slot.admissionAttempted, admissionCaptureRetained: slot.admissionCapture !== undefined,
        cacheAttempted: slot.cacheAttempted, cacheReplyRetained: slot.cacheReplyRetained,
        projectOpenAttempted: slot.projectOpenAttempted, projectOpenReplyRetained: slot.projectOpenReplyRetained,
        finishCloseAttempted: slot.finishCloseAttempted, finishCloseAcknowledged: slot.finishReceipt !== undefined,
        finishSnapshotAttempted: slot.finishSnapshotAttempted, finishSnapshotCaptured: slot.finishSnapshotCaptured, finishSnapshotFailed: slot.finishSnapshotFailed,
        finishSnapshotEvidence: CurrentSymbolBaselineCoordinator.finishEvidence(slot),
        finishReleaseAttempted: slot.finishReleaseAttempted, finishCaptureReleased: slot.finishCaptureReleased });
    }
  }
  private static async fail(slot: Slot, phase: string, error: unknown): Promise<never> {
    try { await CurrentSymbolBaselineCoordinator.stopped(slot, phase); }
    catch (recordError) { throw new AggregateError([error, recordError], "Current symbol baseline failed and could not record its stopped state.", { cause: recordError }); }
    throw error;
  }

  /** Called inside the opener's original authenticated scope. The transfer has
   * already consumed that opening, even if capture or scope settlement fails.
   */
  public async capture(owner: CurrentSymbolBaselineOwner): Promise<void> {
    need(!this.busy && !this.slots.has(owner.operationId), "Current symbol baseline is busy or already consumed.");
    const original = assertCurrentSymbolBaselineOwner(owner, this.engine), source = original.source;
    need(source.runtime === this.runtime, "Current symbol baseline has another runtime.");
    const plan: Journal["plan"] = { profile: PROFILE, openingOperationId: owner.openingOperationId, target: source.target,
      expectedFingerprintSha256: sha256Json(source.expectedFingerprint), launch: source.launchProjection,
      preparationSha256: original.preparation.preparationSha256 };
    const journal: Journal = { schema: OPERATION_SCHEMA, operationId: owner.operationId, journalPath: operationPath(owner.operationId), plan,
      planHash: buildPlanHash(plan), state: "capturing", mutationState: "not-inferred", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: false, sequence: 0, artifacts: [],
      closeAttempted: false, copyAttempted: false, relaunchAttempted: false, releaseAttempted: false, admissionAttempted: false, cacheAttempted: false, projectOpenAttempted: false,
      finishCloseAttempted: false, finishReleaseAttempted: false,
      finishSnapshotAttempted: false, finishSnapshotCaptured: false, finishSnapshotFailed: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      nextSafeAction: "Retain one closed-session capture in the original authenticated scope before normal close." };
    const slot: Slot = { owner, ownerText: canonicalJson(owner), journal, journalText: canonicalJson(journal), created: false,
      closeAttempted: false, copyAttempted: false, baselineCaptured: false, relaunchAttempted: false, releaseAttempted: false, captureReleased: false,
      admissionAttempted: false, admissionProved: false, cacheAttempted: false, cacheReplyRetained: false, cachesObserved: false,
      projectOpenAttempted: false, projectOpenReplyRetained: false, projectOpened: false,
      finishSnapshotAttempted: false, finishSnapshotCaptured: false, finishSnapshotFailed: false,
      finishing: false, finishCloseAttempted: false, finishReleaseAttempted: false, finishCaptureReleased: false, finished: false, evidence: new Map() };
    this.slots.set(owner.operationId, slot); this.busy = true;
    try {
      const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
      need(reader !== undefined, "Current symbol baseline cannot inspect its authenticated scope.");
      const scope = reader.call(this.engine.upstream), session = source.bridgeSession;
      need(scope !== undefined && scope.gatewayInstanceId === session.gatewayInstanceId && scope.sessionId === session.sessionId &&
        scope.sessionSequence === session.sequence, "Current symbol baseline scope differs from its opening.");
      const scopeText = canonicalJson(scope);
      const inside = (): void => {
        this.current(slot);
        need(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === reader && canonicalJson(reader.call(this.engine.upstream)) === scopeText,
          "Current symbol baseline authenticated scope changed.");
      };
      await createOperation(journal); slot.created = true; inside();
      await CurrentSymbolBaselineCoordinator.record(slot, "capture-intent", { openingOperationId: owner.openingOperationId, preparation: original.preparation }); inside();
      const capture = await this.engine.captureClosedSessionAuthority(owner.operationId, "closed-baseline", 1);
      slot.capture = capture;
      slot.binding = { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
        bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
      // Retain acquired handles before validating or publishing their projections.
      inside();
      need(capture.operationId === owner.operationId && capture.phase === "closed-baseline" && capture.challengeAttempt === 1 &&
        canonicalJson(capture.bridgeSession) === canonicalJson(source.bridgeSession), "Current symbol baseline capture binding differs.");
      const launch = source.launchProjection, roots = capture.executionAuthority.processes.filter((process) => process.role === "easyeda-main");
      need(roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(launch.root) &&
        capture.executionAuthority.processes.every((process) => process.startIdentity.endsWith(`:job:${launch.jobId}`)),
      "Current symbol baseline capture differs from its original root or Job.");
      await this.unchanged(slot); inside();
      journal.state = "captured";
      await CurrentSymbolBaselineCoordinator.record(slot, "capture-result", { capture }); inside(); await this.unchanged(slot); inside();
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "capture", error); }
    finally { this.busy = false; }
  }

  public async stopAfterScopeFailure(owner: CurrentSymbolBaselineOwner): Promise<void> {
    const slot = this.slots.get(owner.operationId);
    if (slot !== undefined && slot.owner === owner && slot.journal.state !== "stopped") { await CurrentSymbolBaselineCoordinator.stopped(slot, "scope-settlement"); }
  }

  public async close(owner: CurrentSymbolBaselineOwner): Promise<Value> {
    const slot = this.slots.get(owner.operationId);
    need(!this.busy && slot !== undefined && slot.owner === owner && slot.journal.state === "captured" && slot.capture !== undefined && slot.binding !== undefined,
      "Current symbol baseline close needs its original completed capture.");
    this.busy = true;
    try {
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      const window = await this.runtime.observeApplicationWindow(); this.outsideScope(slot);
      need(window.outcome === "available" && window.hwnd !== null, "Current symbol baseline has no exact owned application window.");
      const intent = await this.runtime.prepareClosedSessionClose({ ...slot.binding, windowHandle: window.hwnd });
      slot.intent = intent;
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      slot.closeAttempted = true; slot.journal.closeAttempted = true; slot.journal.mutationMayHaveOccurred = true;
      slot.journal.state = "close-dispatching";
      await CurrentSymbolBaselineCoordinator.record(slot, "close-intent", { intent }); this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      const receipt = await this.runtime.requestClosedSessionNormalClose({ ...slot.binding, intent, confirmNormalClose: true });
      slot.closeReceipt = receipt;
      // The acknowledgment is retained before any ownership, persistence or exit check.
      await this.unchanged(slot); this.outsideScope(slot);
      slot.journal.state = "awaiting-termination";
      slot.journal.nextSafeAction = "Observe original process/Job termination only. Do not repeat close or choose Save/Discard.";
      await CurrentSymbolBaselineCoordinator.record(slot, "close-result", { closeReceipt: receipt }); this.outsideScope(slot);
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "close", error); }
    finally { this.busy = false; }
  }

  public async observe(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "awaiting-termination" && slot.binding !== undefined &&
      slot.intent !== undefined && slot.closeReceipt !== undefined && !slot.copyAttempted,
    "Current symbol baseline observation needs its original acknowledged close.");
    this.busy = true;
    try {
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      if (slot.observation !== undefined) { assertCurrentClosedSessionTerminationObservation(slot.observation); }
      const observation = await this.runtime.probeClosedSessionTermination({ ...slot.binding, intent: slot.intent, closeReceipt: slot.closeReceipt });
      slot.observation = observation;
      assertCurrentClosedSessionTerminationObservation(observation); this.outsideScope(slot);
      if (observation.status === "terminated") { slot.proof = observation.proof; }
      await this.unchanged(slot); this.outsideScope(slot);
      if (observation.status === "pending") {
        assertCurrentClosedSessionTerminationObservation(observation);
        return { ...summary(slot), termination: "pending" };
      }
      const proof = observation.proof;
      slot.copyAttempted = true; slot.journal.copyAttempted = true;
      slot.journal.state = "copying";
      await CurrentSymbolBaselineCoordinator.record(slot, "copy-intent", { proof }); this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      const capture = slot.capture; need(capture !== undefined, "Current symbol baseline capture was lost.");
      const result = await captureCurrentSymbolBaselineCopy(this.engine, { owner: slot.owner, capture, intent: slot.intent,
        closeReceipt: slot.closeReceipt, proof, runtime: this.sqlRuntime }, (event) => { slot.evidence.set(event.kind, event.value); });
      slot.copy = result;
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      slot.journal.state = "completed"; slot.journal.hardStop = false;
      slot.journal.nextSafeAction = "Closed baseline captured. Qualify later opening effects and backend actor/clock before any writer; no before-write baseline or persistence completion is inferred.";
      await CurrentSymbolBaselineCoordinator.record(slot, "copy-result", { checkpoint: result.checkpoint, copy: result.copy, preparation: result.preparation, targetEvidence: result.targetEvidence,
        startupPremises: result.startupPremises,
        sql: { checkpointSha256: result.inventory.checkpointSha256, schemaSha256: result.inventory.schemaSha256, logicalSha256: result.inventory.logicalSha256 },
        beforeWriteBaselineVerified: false, openingEffectsVerified: false, writerReady: false, executionAuthorized: false });
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      assertCurrentClosedSessionCopyAuthority(proof);
      slot.baselineCaptured = true;
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "termination-or-copy", error); }
    finally { this.busy = false; }
  }

  /** Owned subsequent launch only. Consumes the attempt before any await and
   * keeps actual return objects even when publication or handle release fails.
   * The later admission is separate; this dispatch opens no project or writer.
   */
  public async relaunch(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "completed" && slot.baselineCaptured && slot.copy !== undefined &&
      slot.proof !== undefined && slot.capture !== undefined && !slot.relaunchAttempted,
    "Current symbol relaunch needs its original completed baseline and unused attempt.");
    this.busy = true; slot.relaunchAttempted = true;
    const { copy, proof, capture } = slot;
    try {
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      const source = assertCurrentSymbolBaselineOwner(slot.owner, this.engine).source;
      slot.source = source;
      const upstream = this.engine.upstream, validator = this.engine.executionAuthorityValidator;
      const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
      need(typeof scopeReader === "function" && typeof lifecycleReader === "function",
        "Current symbol relaunch needs its original runtime validator and lifecycle readers.");
      assertWindowsRuntimeValidator(validator, this.runtime);
      const methods = relaunchMethods(this.engine, this.runtime);
      const captureText = canonicalJson(capture), priorLaunch = canonicalJson(source.launchProjection);
      const sourceText = canonicalJson({ target: source.target, expectedFingerprint: source.expectedFingerprint, preNavigationCheckpoint: source.preNavigationCheckpoint });
      const endpoint = lifecycleReader.call(upstream), priorSession = source.bridgeSession;
      const priorSessionText = canonicalJson(priorSession);
      need(isRecord(endpoint), "Current symbol relaunch lifecycle is unavailable.");
      const endpointText = canonicalJson(endpoint["publicEndpoint"]);
      let replacementSessionText: string | undefined;
      const infrastructure = (launched: boolean, scopeText?: string): void => {
        assertWindowsRuntimeValidator(validator, this.runtime);
        const scope = scopeReader.call(upstream);
        need(this.engine.upstream === upstream && this.engine.executionAuthorityValidator === validator &&
          upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && upstream.bridgeSessionLifecycle === lifecycleReader &&
          relaunchMethods(this.engine, this.runtime).every((method, index) => method === methods[index]) &&
          (scopeText === undefined ? scope === undefined : scope !== undefined && canonicalJson(scope) === scopeText) &&
          this.slots.get(operationId) === slot && slot.source === source && canonicalJson(slot.owner) === slot.ownerText && canonicalJson(capture) === captureText &&
          canonicalJson(source.launchProjection) === priorLaunch && canonicalJson(priorSession) === priorSessionText &&
          canonicalJson({ target: source.target, expectedFingerprint: source.expectedFingerprint, preNavigationCheckpoint: source.preNavigationCheckpoint }) === sourceText,
        "Current symbol relaunch infrastructure, capture or ended scope changed.");
        assertOriginalCurrentSymbolBaselineCopy(copy, this.engine);
        const lifecycle = lifecycleReader.call(upstream);
        need(isRecord(lifecycle) && lifecycle["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
          lifecycle["gatewayInstanceId"] === priorSession.gatewayInstanceId && canonicalJson(lifecycle["publicEndpoint"]) === endpointText &&
          Array.isArray(lifecycle["recentClosedSessions"]), "Current symbol relaunch gateway changed.");
        const closed = lifecycle["recentClosedSessions"].filter((entry: unknown) => isRecord(entry) && entry["sessionId"] === priorSession.sessionId);
        const old: unknown = closed[0];
        need(closed.length === 1 && isRecord(old) && old["sequence"] === priorSession.sequence &&
          old["authenticationReceiptSha256"] === priorSession.authenticationReceiptSha256 && old["authenticatedAtEpochMs"] === priorSession.authenticatedAtEpochMs &&
          typeof old["closedAtEpochMs"] === "number" && Number.isSafeInteger(old["closedAtEpochMs"]) && old["closedAtEpochMs"] >= priorSession.authenticatedAtEpochMs,
        "Current symbol relaunch lacks its original disconnected session.");
        const active = lifecycle["activeSession"];
        if (!launched) { need(active === null, "Current symbol relaunch requires a disconnected bridge before launch."); }
        else if (active !== null) {
          need(isRecord(active) && typeof active["sequence"] === "number" && Number.isSafeInteger(active["sequence"]) && active["sequence"] > priorSession.sequence &&
            typeof active["sessionId"] === "string" && /^[A-Za-z0-9_-]{43}$/u.test(active["sessionId"]) && active["sessionId"] !== priorSession.sessionId,
          "Current symbol relaunch observed an invalid replacement session.");
          replacementSessionText ??= canonicalJson(active);
        }
        if (slot.finishing && active === null && replacementSessionText !== undefined) {
          const selected = activeSessionSchema.parse(JSON.parse(replacementSessionText) as unknown);
          const ended = lifecycle["recentClosedSessions"].filter((entry: unknown) => isRecord(entry) && entry["sessionId"] === selected.sessionId);
          need(ended.length === 1, "Current symbol finish lacks its selected closed session.");
          const closedSession = closedSessionSchema.parse(ended[0]);
          const { closeReason: _reason, closedAtEpochMs, ...identity } = closedSession;
          need(canonicalJson(identity) === replacementSessionText && closedAtEpochMs >= selected.authenticatedAtEpochMs,
            "Current symbol finish selected closed session changed.");
        } else {
          need(replacementSessionText === undefined || canonicalJson(active) === replacementSessionText,
            "Current symbol relaunch replacement session changed.");
        }
      };
      const previous = (): void => {
        infrastructure(false); this.outsideScope(slot);
        need(canonicalJson(this.runtime.status().launch) === priorLaunch, "Current symbol relaunch prior launch changed.");
        assertCurrentClosedSessionCopyAuthority(proof);
      };
      previous();
      await revalidateCurrentSymbolBaselineCopy(this.engine, copy, proof); previous();
      slot.terminationClock = await windowsClockObservationForResult(proof, "termination"); previous();
      slot.journal.relaunchAttempted = true; slot.journal.state = "relaunch-dispatching"; slot.journal.hardStop = true;
      slot.journal.nextSafeAction = "Retain this one launch result; never repeat launch after an uncertain return.";
      await CurrentSymbolBaselineCoordinator.record(slot, "relaunch-intent", { copyReceiptSha256: copy.copy.receiptSha256,
        checkpoint: copy.checkpoint, proof, terminationClock: slot.terminationClock }); previous();
      await revalidateCurrentSymbolBaselineCopy(this.engine, copy, proof); previous();
      await this.unchanged(slot); previous();
      // Launch invalidates the old closure epoch before its first native await.
      // No old-owner/proof assertion is valid beyond this dispatch boundary.
      const launch = await this.runtime.launch(); slot.launch = launch;
      const launchText = canonicalJson(launch);
      const launched = (scopeText?: string): void => {
        infrastructure(true, scopeText);
        const status = this.runtime.status();
        need(status.state === "owned" && canonicalJson(status.launch) === launchText && canonicalJson(launch) === launchText &&
          launch.helperInstance === source.launchProjection.helperInstance && launch.jobId !== source.launchProjection.jobId &&
          launch.root.startIdentity !== source.launchProjection.root.startIdentity,
        "Current symbol relaunch original result or new generation changed.");
      };
      // Retain this original closure, not a reconstruction from journal JSON.
      // Each post-launch scope exception names the exact owned continuation lease.
      slot.currentLaunch = launched;
      const journalCurrent = async (): Promise<void> => {
        launched(); const journal = await loadOperation(operationId); launched();
        need(canonicalJson(journal) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
          "Current symbol relaunch journal changed.");
      };
      launched(); await journalCurrent();
      slot.journal.state = "relaunch-acknowledged";
      await CurrentSymbolBaselineCoordinator.record(slot, "relaunch-result", { launch, admissionProved: false, executionAuthorized: false }); launched(); await journalCurrent();
      slot.launchClock = await this.runtime.clockObservationForLaunch(launch); launched(); await journalCurrent();
      need(await assertIssuedWindowsClockObservation(slot.launchClock) === slot.launchClock, "Current symbol relaunch clock issuer changed."); launched(); await journalCurrent();
      slot.releaseAttempted = true; slot.journal.releaseAttempted = true;
      await CurrentSymbolBaselineCoordinator.record(slot, "capture-release-intent", { captureSha256: sha256Json(capture), launch, launchClock: slot.launchClock });
      launched(); await journalCurrent();
      await this.engine.releaseClosedSessionAuthority(capture); slot.captureReleased = true;
      launched(); await journalCurrent();
      slot.journal.state = "relaunched";
      slot.journal.nextSafeAction = "New launch retained. Admit its new authenticated session and qualify startup/opening effects and backend actor/clock before any writer. Do not relaunch or release again.";
      await CurrentSymbolBaselineCoordinator.record(slot, "capture-release-result", { captureReleased: true, launchClock: slot.launchClock,
        admissionProved: false, beforeWriteBaselineVerified: false, openingEffectsVerified: false, backendActorVerified: false, backendClockVerified: false, executionAuthorized: false });
      launched(); await journalCurrent();
      need(await assertIssuedWindowsClockObservation(slot.launchClock) === slot.launchClock, "Current symbol relaunch final clock issuer changed."); launched(); await journalCurrent();
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "relaunch-or-release", error); }
    finally { this.busy = false; }
  }

  /** One new-session capture on the retained relaunched Job. A disconnected
   * observation is repeatable; once a session is selected, every failure consumes
   * admission. Scope settlement is part of success, not merely the callback.
   */
  public async admit(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "relaunched" && slot.captureReleased &&
      slot.launch !== undefined && slot.launchClock !== undefined && slot.currentLaunch !== undefined && !slot.admissionAttempted,
    "Current symbol admission needs its original retained relaunch and unused attempt.");
    this.busy = true;
    const { launch, launchClock, currentLaunch } = slot;
    try {
      currentLaunch();
      const upstream = this.engine.upstream;
      const reader = upstream.bridgeSessionLifecycle, scope = upstream.withAuthenticatedBridgeDispatchScope;
      need(typeof scope === "function" && typeof reader === "function", "Current symbol admission lacks its original scope or lifecycle reader.");
      const lifecycle = reader.call(upstream);
      need(isRecord(lifecycle), "Current symbol admission lifecycle is unavailable.");
      const unchanged = async (scopeText?: string): Promise<void> => {
        currentLaunch(scopeText); const persisted = await loadOperation(operationId); currentLaunch(scopeText);
        need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
          "Current symbol admission journal changed.");
      };
      if (lifecycle["activeSession"] === null) {
        await unchanged();
        return { ...summary(slot), authentication: "pending", nextSafeAction: "Wait for this owned launch's authenticated bridge. Do not relaunch." };
      }
      slot.admissionAttempted = true;
      const session = { ...activeSessionSchema.parse(lifecycle["activeSession"]), gatewayInstanceId: lifecycle["gatewayInstanceId"] };
      const sessionText = canonicalJson(session);
      let captureText: string | undefined, retainedCapture: ClosedSessionAuthorityCapture | undefined;
      const sessionCurrent = (scopeText?: string): void => {
        currentLaunch(scopeText);
        need(slot.admissionCapture === retainedCapture && (retainedCapture === undefined || canonicalJson(retainedCapture) === captureText),
          "Current symbol admission original capture changed.");
        const now = reader.call(upstream);
        need(isRecord(now) && isRecord(now["activeSession"]) &&
          canonicalJson({ ...now["activeSession"], gatewayInstanceId: now["gatewayInstanceId"] }) === sessionText,
        "Current symbol admission selected session changed.");
      };
      const current = async (scopeText?: string): Promise<void> => {
        sessionCurrent(scopeText); await unchanged(scopeText); sessionCurrent(scopeText);
      };
      await current();
      need(await assertIssuedWindowsClockObservation(launchClock) === launchClock, "Current symbol admission launch clock changed."); await current();
      // Acquiring a scope can connect the upstream. Quarantine/isolation must
      // Refuse before that acquisition, as well as within the engine capture.
      await this.engine.assertBridgeDispatchAllowed(); await current();
      await this.engine.assertRecoveryOperationIsolated(operationId); await current();
      slot.journal.admissionAttempted = true; slot.journal.state = "admission-dispatching";
      slot.journal.nextSafeAction = "Retain one capture from the new authenticated session; no project open, Save or writer is authorized.";
      await CurrentSymbolBaselineCoordinator.record(slot, "admission-intent", { launch, launchClock, session, capturePhase: "closed-edit", challengeAttempt: 1 });
      await current();
      let completed = false;
      await scope.call(upstream, async (binding) => {
        const scopeText = canonicalJson(binding);
        sessionCurrent(scopeText);
        need(binding.gatewayInstanceId === session.gatewayInstanceId && binding.sessionId === session.sessionId && binding.sessionSequence === session.sequence,
          "Current symbol admission scope differs from its selected session.");
        await current(scopeText);
        await CurrentSymbolBaselineCoordinator.record(slot, "admission-capture-intent", { bridgeDispatch: binding }); await current(scopeText);
        const capture = await this.engine.captureClosedSessionAuthority(operationId, "closed-edit", 1);
        slot.admissionCapture = capture; retainedCapture = capture;
        // Keep original handles before validation, publication or lease settlement.
        captureText = canonicalJson(capture);
        const captured = (): void => {
          sessionCurrent(scopeText);
          need(canonicalJson(capture) === captureText, "Current symbol admission original capture changed.");
        };
        captured(); await current(scopeText); captured();
        need(capture.operationId === operationId && capture.phase === "closed-edit" && capture.challengeAttempt === 1 &&
          canonicalJson(capture.bridgeSession) === sessionText, "Current symbol admission capture identity differs.");
        const roots = capture.executionAuthority.processes.filter((process) => process.role === "easyeda-main");
        need(roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(launch.root) &&
          capture.executionAuthority.processes.every((process) => process.startIdentity.endsWith(`:job:${launch.jobId}`)),
        "Current symbol admission capture differs from its relaunched root or Job.");
        const identity = await this.engine.runtimeIdentity(binding); captured(); await current(scopeText); captured();
        need(canonicalJson(identity) === canonicalJson(capture.runtimeIdentity), "Current symbol admission native runtime changed.");
        slot.admissionClock = await this.engine.clockObservationForClosedCapture(capture); captured(); await current(scopeText); captured();
        need(await assertIssuedWindowsClockObservation(slot.admissionClock) === slot.admissionClock, "Current symbol admission capture clock changed.");
        captured(); await current(scopeText); captured();
        await CurrentSymbolBaselineCoordinator.record(slot, "admission-capture-result", { capture, captureClock: slot.admissionClock,
          admissionProved: false, startupQualified: false, executionAuthorized: false }); captured(); await current(scopeText); captured();
        completed = true;
      });
      await current();
      need(completed && slot.admissionCapture !== undefined && slot.admissionClock !== undefined, "Current symbol admission callback did not complete.");
      // Revalidate the engine-branded capture after scope settlement too. The
      // Clock lookup checks its original immutable snapshot and current issuer.
      const finalClock = await this.engine.clockObservationForClosedCapture(slot.admissionCapture); await current();
      need(finalClock === slot.admissionClock && await assertIssuedWindowsClockObservation(finalClock) === finalClock,
        "Current symbol admission settled capture clock changed."); await current();
      slot.journal.state = "admitted";
      slot.journal.nextSafeAction = "New session admitted only. Observe inactive caches before the separately guarded baseline-open-project continuation. No document opening, Save or writer is authorized.";
      await CurrentSymbolBaselineCoordinator.record(slot, "admission-result", { admissionProved: true, startupQualified: false,
        openingEffectsVerified: false, beforeWriteBaselineVerified: false, executionAuthorized: false }); await current();
      need(await assertIssuedWindowsClockObservation(finalClock) === finalClock, "Current symbol admission final capture clock changed."); await current();
      slot.admissionProved = true;
      slot.sessionCurrent = sessionCurrent;
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "new-session-admission", error); }
    finally { this.busy = false; }
  }

  /** One fixed read on the admitted session. Cache absence is sequential and
   * historical, never startup completion or permission to open/write a project.
   * A failed decoder (including the inner deadline) retains dispatch quarantine.
   */
  public async observeCaches(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "admitted" && slot.admissionProved &&
      slot.source !== undefined && slot.sessionCurrent !== undefined && slot.admissionCapture !== undefined &&
      slot.admissionClock !== undefined && slot.launch !== undefined && !slot.cacheAttempted,
    "Current symbol cache observation needs its original admitted session and unused attempt.");
    this.busy = true; slot.cacheAttempted = true;
    const { source, sessionCurrent, admissionCapture, admissionClock, launch } = slot;
    try {
      const current = async (scopeText?: string): Promise<void> => {
        sessionCurrent(scopeText); const persisted = await loadOperation(operationId); sessionCurrent(scopeText);
        need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
          "Current symbol cache journal changed.");
      };
      const original = async (scopeText?: string): Promise<void> => {
        await current(scopeText);
        const clock = await this.engine.clockObservationForClosedCapture(admissionCapture); await current(scopeText);
        need(clock === admissionClock && await assertIssuedWindowsClockObservation(clock) === clock,
          "Current symbol cache admission clock changed."); await current(scopeText);
      };
      await original();
      await this.engine.assertBridgeDispatchAllowed(); await current();
      await this.engine.assertRecoveryOperationIsolated(operationId); await current();
      validateSdkLocalRuntimeFingerprint(source.expectedFingerprint);
      const target = { projectUuid: source.target.projectUuid, branchUuid: source.target.branchUuid };
      const code = buildCurrentUploadQueueReadProgram(target), scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(typeof scope === "function", "Current symbol cache observation lacks its owned scope.");
      let completed = false;
      const initial = await scope.call(this.engine.upstream, async (binding) => {
        const scopeText = canonicalJson(binding);
        sessionCurrent(scopeText);
        need(binding.gatewayInstanceId === admissionCapture.bridgeSession.gatewayInstanceId &&
          binding.sessionId === admissionCapture.bridgeSession.sessionId && binding.sessionSequence === admissionCapture.bridgeSession.sequence,
        "Current symbol cache scope differs from its admitted session.");
        await original(scopeText);
        // Status itself dispatches authenticated health/registry probes. Keep
        // Both fingerprint observations in this original session's lease.
        const initialStatus = await this.engine.status(); await current(scopeText);
        const fingerprint = structuredClone(initialStatus.stableFingerprint);
        validateSdkLocalRuntimeFingerprint(fingerprint); assertExpectedFingerprint(fingerprint);
        assertSubset(fingerprint, source.expectedFingerprint, "Current symbol cache runtime");
        await verifyCurrentDisposableOpenImplementation(fingerprint.installedBundles.assetsRoot); await original(scopeText);
        slot.journal.cacheAttempted = true; slot.journal.state = "cache-dispatching";
        slot.journal.nextSafeAction = "Retain this single inactive-target cache observation; do not repeat, navigate, Save or write.";
        await CurrentSymbolBaselineCoordinator.record(slot, "cache-intent", { target, programSha256: sha256Json({ code }),
          runtimeFingerprintSha256: sha256Json(fingerprint), startupQualified: false, executionAuthorized: false }); await original(scopeText);
        await this.engine.assertBridgeDispatchAllowed(); await current(scopeText);
        await this.engine.assertRecoveryOperationIsolated(operationId); await current(scopeText);
        const before = structuredClone(slot.journal);
        let marked: Journal | undefined;
        await this.engine.dispatchWithOrphanTracking(slot.journal, CACHE_PHASE, "easyeda_execute",
          { code, timeoutMs: CURRENT_UPLOAD_QUEUE_TIMEOUT_MS + 5000, confirmWrite: true }, CURRENT_UPLOAD_QUEUE_TIMEOUT_MS + 15_000,
          async () => {
            sessionCurrent(scopeText);
            assertCurrentSymbolCacheMark(before, slot.journal, { phase: CACHE_PHASE, bridgeDispatch: binding, capture: admissionCapture, launch });
            const markedText = canonicalJson(slot.journal), persisted = await loadOperation(operationId); sessionCurrent(scopeText);
            need(canonicalJson(persisted) === markedText && canonicalJson(slot.journal) === markedText,
              "Current symbol cache marked journal changed.");
            // Accept only the engine's exact mark transition, never loaded history.
            slot.journalText = markedText; marked = structuredClone(slot.journal);
            slot.cacheClock = await this.engine.clockObservationForTrackedDispatch(slot.journal, CACHE_PHASE); await current(scopeText);
            need(await assertIssuedWindowsClockObservation(slot.cacheClock) === slot.cacheClock,
              "Current symbol cache dispatch clock changed."); await original(scopeText);
            await this.engine.assertRecoveryOperationIsolated(operationId); await current(scopeText);
          },
          async (raw) => {
            // Retain the actual return before decoding or fallible validation.
            // Generic transport timeouts may throw before this callback is reached.
            slot.cacheRaw = raw; slot.cacheReplyRetained = true;
            await current(scopeText);
            slot.cacheObservation = decodeCurrentUploadQueueReadReply(raw, target);
            await original(scopeText);
          },
          async () => {
            // Even a pre-dispatch refusal must not clear over an observed
            // Foreign journal. This veto cannot authorize or bypass cleanup.
            need(marked !== undefined, "Current symbol cache mark was not accepted; cleanup refused.");
            await current(scopeText);
          });
        sessionCurrent(scopeText);
        need(marked !== undefined && slot.cacheReplyRetained && slot.cacheObservation !== undefined,
          "Current symbol cache dispatch returned without retained evidence.");
        assertCurrentSymbolCacheClear(marked, slot.journal, CACHE_PHASE);
        const clearedText = canonicalJson(slot.journal), persisted = await loadOperation(operationId); sessionCurrent(scopeText);
        need(canonicalJson(persisted) === clearedText && canonicalJson(slot.journal) === clearedText,
          "Current symbol cache cleared journal changed.");
        slot.journalText = clearedText;
        await original(scopeText);
        await this.engine.assertBridgeDispatchAllowed(); await current(scopeText);
        await verifyCurrentDisposableOpenImplementation(fingerprint.installedBundles.assetsRoot); await original(scopeText);
        const finalStatus = await this.engine.status(); await current(scopeText);
        const final = finalStatus.stableFingerprint;
        validateSdkLocalRuntimeFingerprint(final);
        need(canonicalJson(final) === canonicalJson(fingerprint), "Current symbol cache runtime changed around observation.");
        completed = true; return fingerprint;
      });
      await original();
      need(completed && slot.cacheObservation !== undefined, "Current symbol cache scope did not complete.");
      await this.engine.assertBridgeDispatchAllowed(); await current();
      slot.journal.state = "caches-observed";
      slot.journal.nextSafeAction = "Cache absence is point-in-time only. Use baseline-open-project with explicit opening-effect acceptance for its fresh source, registry and cache checks. Startup, backend actor/clock and writer authority remain unqualified. Do not open a document or Save.";
      await CurrentSymbolBaselineCoordinator.record(slot, "cache-result", { observation: slot.cacheObservation,
        observationSha256: sha256Json(slot.cacheObservation), dispatchClock: slot.cacheClock, runtimeFingerprintSha256: sha256Json(initial),
        startupQualified: false, persistenceVerified: false, executionAuthorized: false }); await original();
      slot.cachesObserved = true;
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "inactive-cache-observation", error); }
    finally { this.busy = false; }
  }

  /** One project-only navigation from the admitted generation. Historical
   * premises and a fresh source hash are admission inputs, not startup
   * completion. Explicit disposable observation can accept the sole active-page
   * blocker without qualifying initialization effects. The generated program
   * repeats inactive-cache observations and never opens an editor document.
   */
  public async openProject(operationId: string, acceptUnqualifiedSchematicStartupEffects?: true): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "caches-observed" && slot.cachesObserved &&
      slot.admissionProved && slot.copy !== undefined &&
      slot.source !== undefined && slot.sessionCurrent !== undefined && slot.admissionCapture !== undefined &&
      slot.admissionClock !== undefined && slot.launch !== undefined && !slot.projectOpenAttempted,
    "Current project-only opening needs its original closed baseline, admitted session and unused attempt.");
    const premises = slot.copy.startupPremises;
    // Explicit disposable observation may accept this sole historical blocker,
    // Not unsupported schema/version/count evidence or a qualified writer baseline.
    const observeSchematicEffects = acceptUnqualifiedSchematicStartupEffects === true && !premises.historicalSubsetSatisfied &&
      premises.activeSchematicPages > 0 && premises.blockers.length === 1 && premises.blockers[0] === "active-schematic-pages";
    need(premises.historicalSubsetSatisfied || observeSchematicEffects,
      "Current project-only opening needs its original qualified baseline, or explicit acceptance of its sole active-schematic-pages blocker for observation only.");
    this.busy = true; slot.projectOpenAttempted = true;
    const { source, copy, sessionCurrent, admissionCapture, admissionClock, launch } = slot;
    try {
      const current = async (scopeText?: string): Promise<void> => {
        sessionCurrent(scopeText); assertOriginalCurrentSymbolBaselineCopy(copy, this.engine);
        const persisted = await loadOperation(operationId); sessionCurrent(scopeText);
        need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
          "Current project-only journal changed.");
      };
      const original = async (scopeText?: string): Promise<void> => {
        await current(scopeText);
        const clock = await this.engine.clockObservationForClosedCapture(admissionCapture); await current(scopeText);
        need(clock === admissionClock && await assertIssuedWindowsClockObservation(clock) === clock,
          "Current project-only admission clock changed."); await current(scopeText);
      };
      await original();
      await this.engine.assertBridgeDispatchAllowed(); await current();
      await this.engine.assertRecoveryOperationIsolated(operationId); await current();
      validateSdkLocalRuntimeFingerprint(source.expectedFingerprint);
      // The earlier ordinary opening may have changed storage. Bind this new
      // Attempt to its actual closed baseline, never the original input hash.
      const target = { ...source.target, expectedSourceSha256: copy.checkpoint.sourceSha256 };
      const code = buildCurrentProjectOnlyOpenProgram(target), scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(typeof scope === "function", "Current project-only opening lacks its owned scope.");
      let completed = false;
      const initial = await scope.call(this.engine.upstream, async (binding) => {
        const scopeText = canonicalJson(binding);
        sessionCurrent(scopeText);
        need(binding.gatewayInstanceId === admissionCapture.bridgeSession.gatewayInstanceId &&
          binding.sessionId === admissionCapture.bridgeSession.sessionId && binding.sessionSequence === admissionCapture.bridgeSession.sequence,
        "Current project-only scope differs from its admitted session.");
        await original(scopeText);
        // These status probes require the same authenticated lease as the
        // Navigation; their validators are not disconnected/offline checks.
        const initialStatus = await this.engine.status(); await current(scopeText);
        const fingerprint = structuredClone(initialStatus.stableFingerprint);
        validateSdkLocalRuntimeFingerprint(fingerprint); assertExpectedFingerprint(fingerprint);
        assertSubset(fingerprint, source.expectedFingerprint, "Current project-only runtime");
        await verifyCurrentProjectOnlyOpenImplementation(fingerprint.installedBundles.assetsRoot); await original(scopeText);
        slot.preopenSource = await verifyCurrentSymbolPreopenSource(this.engine, copy); await original(scopeText);
        slot.journal.projectOpenAttempted = true; slot.journal.state = "project-only-dispatching";
        slot.journal.projectOpeningMode = observeSchematicEffects ? "unqualified-schematic-startup-observation" : "historical-subset";
        slot.journal.mutationMayHaveOccurred = true;
        slot.journal.nextSafeAction = "Retain this single project-only navigation. Do not repeat navigation, open an editor, Save or write.";
        await CurrentSymbolBaselineCoordinator.record(slot, "project-only-intent", { target, programSha256: sha256Json({ code }),
          source: slot.preopenSource, startupPremises: copy.startupPremises, runtimeFingerprintSha256: sha256Json(fingerprint),
          projectOpeningMode: slot.journal.projectOpeningMode, unqualifiedSchematicStartupEffectsAccepted: observeSchematicEffects,
          schematicStartupEffects: observeSchematicEffects ? "native-document-rewrites-and-queued-persistence-may-occur" : "linked-sheet-loop-excluded",
          startupQualified: false, executionAuthorized: false }); await original(scopeText);
        await this.engine.assertBridgeDispatchAllowed(); await current(scopeText);
        await this.engine.assertRecoveryOperationIsolated(operationId); await current(scopeText);
        const before = structuredClone(slot.journal);
        let marked: Journal | undefined;
        await this.engine.dispatchWithOrphanTracking(slot.journal, OPEN_PHASE, "easyeda_execute",
          { code, timeoutMs: CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, confirmWrite: true }, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS + 10_000,
          async () => {
            sessionCurrent(scopeText);
            assertCurrentSymbolCacheMark(before, slot.journal, { phase: OPEN_PHASE, bridgeDispatch: binding, capture: admissionCapture, launch });
            const markedText = canonicalJson(slot.journal), persisted = await loadOperation(operationId); sessionCurrent(scopeText);
            need(canonicalJson(persisted) === markedText && canonicalJson(slot.journal) === markedText,
              "Current project-only marked journal changed.");
            slot.journalText = markedText; marked = structuredClone(slot.journal);
            slot.projectOpenClock = await this.engine.clockObservationForTrackedDispatch(slot.journal, OPEN_PHASE); await current(scopeText);
            need(await assertIssuedWindowsClockObservation(slot.projectOpenClock) === slot.projectOpenClock,
              "Current project-only dispatch clock changed."); await original(scopeText);
            await this.engine.assertRecoveryOperationIsolated(operationId); await current(scopeText);
            slot.preopenSource = await verifyCurrentSymbolPreopenSource(this.engine, copy); await original(scopeText);
          },
          async (raw) => {
            slot.projectOpenRaw = raw; slot.projectOpenReplyRetained = true;
            await current(scopeText);
            slot.projectOpenObservation = decodeCurrentProjectOnlyOpenReply(raw, target);
            await original(scopeText);
          },
          async () => {
            need(marked !== undefined, "Current project-only mark was not accepted; cleanup refused.");
            await current(scopeText);
          });
        sessionCurrent(scopeText);
        need(marked !== undefined && slot.projectOpenReplyRetained && slot.projectOpenObservation !== undefined,
          "Current project-only dispatch returned without retained evidence.");
        assertCurrentSymbolCacheClear(marked, slot.journal, OPEN_PHASE);
        const clearedText = canonicalJson(slot.journal), persisted = await loadOperation(operationId); sessionCurrent(scopeText);
        need(canonicalJson(persisted) === clearedText && canonicalJson(slot.journal) === clearedText,
          "Current project-only cleared journal changed.");
        slot.journalText = clearedText;
        await original(scopeText);
        await this.engine.assertBridgeDispatchAllowed(); await current(scopeText);
        await verifyCurrentProjectOnlyOpenImplementation(fingerprint.installedBundles.assetsRoot); await original(scopeText);
        const finalStatus = await this.engine.status(); await current(scopeText);
        const final = finalStatus.stableFingerprint;
        validateSdkLocalRuntimeFingerprint(final);
        need(canonicalJson(final) === canonicalJson(fingerprint), "Current project-only runtime changed around navigation.");
        completed = true; return fingerprint;
      });
      await original();
      need(completed && slot.projectOpenObservation !== undefined, "Current project-only scope did not complete.");
      await this.engine.assertBridgeDispatchAllowed(); await current();
      slot.journal.state = "project-only-opened";
      slot.journal.nextSafeAction = "Project-only return retained; startup producers, backend actor/clock and opening effects remain unqualified. Use baseline-finish-close then baseline-observe-finish for retained normal closure. Do not navigate again, Save or write.";
      await CurrentSymbolBaselineCoordinator.record(slot, "project-only-result", { observation: slot.projectOpenObservation,
        observationSha256: sha256Json(slot.projectOpenObservation), dispatchClock: slot.projectOpenClock,
        sourceBeforeDispatch: slot.preopenSource, runtimeFingerprintSha256: sha256Json(initial),
        projectOpeningMode: slot.journal.projectOpeningMode, unqualifiedSchematicStartupEffectsAccepted: observeSchematicEffects,
        startupPremises: copy.startupPremises,
        startupQualified: false, persistenceVerified: false, executionAuthorized: false }); await original();
      slot.projectOpened = true;
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "project-only-opening", error); }
    finally { this.busy = false; }
  }

  private finishCurrent(slot: Slot): void {
    need(this.slots.get(slot.owner.operationId) === slot && slot.currentLaunch !== undefined && slot.launch !== undefined &&
      slot.admissionProved && slot.admissionCapture !== undefined && canonicalJson(slot.admissionCapture) === slot.finishCaptureText,
    "Current symbol finish lost its original admitted generation or capture.");
    slot.currentLaunch();
  }

  private async finishUnchanged(slot: Slot): Promise<void> {
    this.finishCurrent(slot);
    const journal = await loadOperation(slot.owner.operationId); this.finishCurrent(slot);
    need(canonicalJson(journal) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
      "Current symbol finish journal changed.");
  }

  private static finishEvidence(slot: Slot): Value {
    // Keep partial file descriptors durable even if a later reader refuses.
    // The complete SQL/native data can be reread from these preserved files.
    return { checkpoint: slot.evidence.get("finish-checkpoint") ?? null, copy: slot.evidence.get("finish-copy") ?? null };
  }

  /** Terminal cleanup only, with unknown disposable file effects accepted by
   * the fixed public request. No fallback to an old owner or a new capture is
   * allowed, including when this attempt already owns an orphan marker.
   */
  public async finishNormalClose(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && ["admitted", "caches-observed", "project-only-opened", "stopped"].includes(slot.journal.state) &&
      slot.admissionProved && slot.admissionCapture !== undefined && slot.admissionClock !== undefined && slot.currentLaunch !== undefined &&
      slot.launch !== undefined && !slot.finishCloseAttempted,
    "Current symbol finish requires its original admitted new generation and unused close attempt.");
    this.busy = true; slot.finishCloseAttempted = true; slot.finishCaptureText = canonicalJson(slot.admissionCapture);
    const capture = slot.admissionCapture, launch = slot.launch;
    const binding: Binding = { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
      bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
    try {
      await this.finishUnchanged(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.finishUnchanged(slot);
      const clock = await this.engine.clockObservationForClosedCapture(capture); await this.finishUnchanged(slot);
      need(clock === slot.admissionClock && await assertIssuedWindowsClockObservation(clock) === clock,
        "Current symbol finish lost its original admission capture clock."); await this.finishUnchanged(slot);
      const window = await this.runtime.observeApplicationWindow(); await this.finishUnchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === launch.jobId && window.helperInstance === launch.helperInstance,
        "Current symbol finish lacks its exact new-generation application window.");
      const intent = await this.runtime.prepareClosedSessionClose({ ...binding, windowHandle: window.hwnd }); slot.finishIntent = intent;
      await this.finishUnchanged(slot);
      slot.journal.finishCloseAttempted = true; slot.journal.state = "finish-close-dispatching"; slot.journal.hardStop = true;
      slot.journal.mutationMayHaveOccurred = true;
      slot.journal.nextSafeAction = "One terminal normal close is consumed. Do not repeat it or choose Save/Discard; retain this facade for termination observation.";
      await CurrentSymbolBaselineCoordinator.record(slot, "finish-close-intent", { intent, originalLaunch: launch,
        admissionCaptureSha256: sha256Json(capture), acceptUnknownFileEffects: true, replayAllowed: false }); await this.finishUnchanged(slot);
      // Only this private terminal dispatch permits the already selected new
      // Session to become exactly closed. Other replacements still refuse.
      slot.finishing = true;
      const receipt = await this.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }); slot.finishReceipt = receipt;
      await this.finishUnchanged(slot);
      slot.journal.state = "awaiting-finish-termination";
      await CurrentSymbolBaselineCoordinator.record(slot, "finish-close-result", { closeReceipt: receipt, terminationObserved: false }); await this.finishUnchanged(slot);
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "finish-close", error); }
    finally { this.busy = false; }
  }

  /** Pending may be observed again. Only a stopped final-snapshot failure may
   * resume retirement from its original terminal proof, skipping that consumed
   * snapshot. Neither path repeats close/navigation or accepts file effects.
   */
  public async observeFinish(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    const failedSnapshot = slot !== undefined && slot.journal.state === "stopped" && slot.finishSnapshotFailed && slot.finishSnapshotAttempted &&
      !slot.finishSnapshotCaptured && slot.finishObservation?.status === "terminated" && slot.finishProof === slot.finishObservation.proof &&
      slot.finishSnapshotFailureEvidenceText === canonicalJson([...slot.evidence]);
    need(!this.busy && slot !== undefined && (slot.journal.state === "awaiting-finish-termination" || failedSnapshot) && slot.finishing &&
      slot.admissionCapture !== undefined && slot.launch !== undefined && slot.finishIntent !== undefined && slot.finishReceipt !== undefined &&
      !slot.finishReleaseAttempted,
    "Current symbol finish observation requires its original acknowledged close.");
    this.busy = true;
    const capture = slot.admissionCapture, launch = slot.launch;
    const binding: Binding = { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
      bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
    try {
      await this.finishUnchanged(slot);
      if (slot.finishObservation !== undefined) { assertCurrentClosedSessionTerminationObservation(slot.finishObservation); }
      const observation = failedSnapshot ? slot.finishObservation :
        await this.runtime.probeClosedSessionTermination({ ...binding, intent: slot.finishIntent, closeReceipt: slot.finishReceipt });
      need(observation !== undefined, "Current symbol finish lost its original terminal observation.");
      slot.finishObservation = observation;
      if (observation.status === "terminated") { slot.finishProof = observation.proof; }
      assertCurrentClosedSessionTerminationObservation(observation); await this.finishUnchanged(slot);
      if (observation.status === "pending") {
        assertCurrentClosedSessionTerminationObservation(observation);
        return { ...summary(slot), termination: "pending" };
      }
      const journal = slot.journal, proof = observation.proof;
      assertCurrentClosedSessionCopyAuthority(proof);
      const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.();
      need(isRecord(lifecycle) && lifecycle["activeSession"] === null,
        "Current symbol finish requires its selected session to be closed.");
      const authority = journal.executionAuthorityBeforeOrphan, dispatch = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
      const observeClosure = this.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
      const hadOrphan = journal.orphanedCallPossible;
      let closure: z.infer<typeof closedSessionSchema> | undefined;
      const closedDispatch = (): void => {
        this.finishCurrent(slot);
        if (dispatch === undefined && prior === undefined && authority === undefined && !hadOrphan) { return; }
        need(dispatch !== undefined && prior !== undefined && authority !== undefined && observeClosure !== undefined &&
          this.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased === observeClosure &&
          canonicalJson(prior) === canonicalJson(capture.bridgeSession) &&
          authority.processes.some((process) => process.role === "easyeda-main" && process.pid === launch.root.pid && process.startIdentity === launch.root.startIdentity) &&
          authority.processes.every((process) => process.startIdentity.endsWith(`:job:${launch.jobId}`)),
        "Current symbol finish lacks its exact last-dispatch capture and session binding.");
        const current = closedSessionSchema.parse(observeClosure.call(this.engine.upstream, dispatch, prior));
        need(current.sessionId === prior.sessionId && current.sequence === prior.sequence &&
          current.authenticationReceiptSha256 === prior.authenticationReceiptSha256 && current.authenticatedAtEpochMs === prior.authenticatedAtEpochMs &&
          current.closedAtEpochMs >= prior.authenticatedAtEpochMs && (closure === undefined || canonicalJson(current) === canonicalJson(closure)),
        "Current symbol finish last-dispatch closure changed.");
        closure ??= current;
      };
      closedDispatch(); await this.engine.assertRecoveryOperationIsolated(operationId); await this.finishUnchanged(slot); closedDispatch();
      if (failedSnapshot) {
        // Reusing the original observation must still rehash the native helper;
        // Synchronous proof identity alone cannot detect later file drift.
        need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol finish retirement lost its original terminal proof.");
        await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
      }
      let terminationClock: IssuedWindowsClockObservation | undefined;
      let relation: CurrentSymbolClockRelation | undefined;
      let clockReason: "missing-stage-observations" | "clock-observation-unavailable" | "clock-relation-refused" | null = "missing-stage-observations";
      try { terminationClock = await windowsClockObservationForResult(proof, "termination"); }
      catch { clockReason = "clock-observation-unavailable"; }
      // Optional clock evidence must never swallow a changed owner, journal or
      // Original terminal proof. These checks remain outside its refusal catch.
      await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
      need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol clock observation lost its original terminal proof.");
      await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
      if (terminationClock !== undefined && slot.launchClock !== undefined && slot.admissionClock !== undefined &&
          slot.cacheClock !== undefined && slot.projectOpenClock !== undefined) {
        if ([slot.launchClock, slot.admissionClock, slot.cacheClock, slot.projectOpenClock, terminationClock]
          .some((clock) => clock.clock.status !== "observed")) {
          clockReason = "clock-observation-unavailable";
        } else {
          try {
            relation = await qualifyCurrentSymbolClockRelation({ operationId, runtime: this.runtime, launch, launchClock: slot.launchClock,
              admissionClock: slot.admissionClock, cacheClock: slot.cacheClock, projectOpenClock: slot.projectOpenClock,
              terminationClock, finishProof: proof });
            clockReason = null;
          } catch { clockReason = "clock-relation-refused"; }
          await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
          need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol clock relation lost its original terminal proof.");
          await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
        }
      }
      const clockRelation = { status: relation === undefined ? "not-qualified" : "observed", reason: clockReason,
        terminationClock: terminationClock ?? null, relation: relation ?? null,
        backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false,
        persistenceVerified: false, executionAuthorized: false };
      if (!slot.finishSnapshotAttempted) {
        slot.finishSnapshotAttempted = true; journal.finishSnapshotAttempted = true;
        try {
          need(slot.copy !== undefined && slot.baselineCaptured, "Current symbol finish snapshot lost its original baseline.");
          journal.state = "finish-snapshotting";
          await CurrentSymbolBaselineCoordinator.record(slot, "finish-snapshot-intent", { proof, closeIntent: slot.finishIntent,
            closeReceipt: slot.finishReceipt, admissionCaptureSha256: sha256Json(capture), baselineCopyReceiptSha256: slot.copy.copy.receiptSha256 });
          await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
          const snapshot = await captureCurrentSymbolFinishSnapshot(this.engine, { baseline: slot.copy, capture, intent: slot.finishIntent,
            closeReceipt: slot.finishReceipt, proof, launch, runtime: this.sqlRuntime },
          (event) => { slot.evidence.set(`finish-${event.kind}`, event.value); });
          slot.finishSnapshot = snapshot;
          await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
          await CurrentSymbolBaselineCoordinator.record(slot, "finish-snapshot-result", snapshot);
          await this.finishUnchanged(slot); closedDispatch(); assertCurrentClosedSessionCopyAuthority(proof);
          slot.finishSnapshotCaptured = true; journal.finishSnapshotCaptured = true;
        } catch (error) {
          slot.finishSnapshotFailed = true;
          slot.finishSnapshotFailureEvidenceText = canonicalJson([...slot.evidence]);
          return await CurrentSymbolBaselineCoordinator.fail(slot, "finish-snapshot", error);
        }
      }
      const retirement = { schema: "easyeda-pro-control.current-symbol-finish-retirement.v1", operationId, originalLaunch: launch,
        proof, closeIntent: slot.finishIntent, closeReceipt: slot.finishReceipt, admissionCaptureSha256: sha256Json(capture),
        bridgeSession: capture.bridgeSession, bridgeDispatch: dispatch ?? null, closedDispatchSession: closure ?? null,
        authoritySha256: authority?.authoritySha256 ?? null, priorOrphan: hadOrphan, durableEffects: "unknown-and-accepted",
        finishSnapshotStatus: slot.finishSnapshotCaptured ? "captured" : "failed", finishSnapshotCaptured: slot.finishSnapshotCaptured,
        finishSnapshotEvidence: CurrentSymbolBaselineCoordinator.finishEvidence(slot),
        clockRelation,
        navigationOutcome: "not-inferred", replayAllowed: false, continuationAuthorized: false, persistenceVerified: false, writerAuthority: false };
      await CurrentSymbolBaselineCoordinator.record(slot, "finish-retirement-proof", retirement); await this.finishUnchanged(slot); closedDispatch();
      assertCurrentClosedSessionCopyAuthority(proof);
      slot.finishReleaseAttempted = true; journal.finishReleaseAttempted = true; journal.state = "finish-releasing";
      await CurrentSymbolBaselineCoordinator.record(slot, "finish-release-intent", { admissionCaptureSha256: sha256Json(capture),
        trackedCaptureSha256: hadOrphan ? authority?.authoritySha256 : null }); await this.finishUnchanged(slot); closedDispatch();
      assertCurrentClosedSessionCopyAuthority(proof);
      // Releasing any capture invalidates the old proof epoch. Retain the
      // Terminal proof first, then use only new-launch checks after release.
      if (hadOrphan) {
        need(authority !== undefined, "Current symbol finish lost its tracked capture.");
        await this.runtime.releaseCapture(authority); await this.finishUnchanged(slot); closedDispatch();
      }
      await this.engine.releaseClosedSessionAuthority(capture); slot.finishCaptureReleased = true;
      await this.finishUnchanged(slot); closedDispatch();
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.finishUnchanged(slot); closedDispatch();
      // Clear only this no-replay family after genuine termination and exact
      // Gateway lease release, never through generic design recovery.
      const terminal: Journal = { ...journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        result: { ...retirement, admissionCaptureReleased: true, retired: true }, updatedAt: new Date().toISOString(),
        nextSafeAction: "Validation attempt retired without replay. Unknown disposable file effects remain; no startup, persistence or writer qualification was inferred." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); this.finishCurrent(slot); closedDispatch();
      Object.assign(journal, terminal); delete journal.runtimeRestartChallenge; delete journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(journal); await this.finishUnchanged(slot); closedDispatch();
      slot.finished = true;
      return { ...summary(slot), termination: "terminated", durableEffects: "unknown-and-accepted" };
    } catch (error) {
      if (slot.finishSnapshotFailed && slot.journal.state === "stopped" && slot.finishSnapshotFailureEvidenceText === canonicalJson([...slot.evidence])) { throw error; }
      return await CurrentSymbolBaselineCoordinator.fail(slot, "finish-termination-or-retirement", error);
    }
    finally { this.busy = false; }
  }

  public async inspect(operationId: string): Promise<Value> {
    const journal = await loadOperation(operationId);
    need(isRecord(journal.plan) && journal.plan["profile"] === PROFILE && journal.operationId === operationId,
      "Current symbol baseline history has another profile.");
    const slot = this.slots.get(operationId);
    return { ...(slot === undefined ? {} : summary(slot)), operationId, state: journal["state"], journalPath: journal["journalPath"], artifacts: journal.artifacts,
      projectOpeningMode: journal["projectOpeningMode"] ?? null,
      finishSnapshotAttempted: journal["finishSnapshotAttempted"] ?? null, finishSnapshotCaptured: journal["finishSnapshotCaptured"] ?? null,
      finishSnapshotStatus: currentSymbolFinishSnapshotStatus(journal["finishSnapshotAttempted"], journal["finishSnapshotCaptured"], journal["finishSnapshotFailed"]),
      unqualifiedSchematicStartupEffectsAccepted: journal["projectOpeningMode"] === "unqualified-schematic-startup-observation",
      nextSafeAction: journal["nextSafeAction"], originalOwnerRetained: this.slots.has(operationId), writerReady: false, executionAuthorized: false };
  }
}
