/* oxlint-disable import/max-dependencies -- This retained lifecycle owner composes the distinct original-authority, source-pin and exact-reader validators; none is replaced by a caller-supplied callback. */
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertExpectedFingerprint, assertSubset, buildPlanHash, canonicalJson, isRecord, sha256Json } from "./core.ts";
import { verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Only the retained opener issues these one-way ownership transfers; no caller-provided issuer exists.
import { assertCurrentSymbolBaselineOwner, revalidateCurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenGenerationSource, CurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Closed copying consumes only original owners issued by the opener; this private coordinator never replaces that issuer.
import { assertOriginalCurrentSymbolBaselineCopy, captureCurrentSymbolBaselineCopy, revalidateCurrentSymbolBaselineCopy } from "./current-symbol-baseline-copy.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import { CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, buildCurrentUploadQueueReadProgram, decodeCurrentUploadQueueReadReply } from "./current-upload-queue-read.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type Value = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
const CACHE_PHASE = "current-symbol-inactive-caches";
const activeSessionSchema = z.object({ sessionId: z.string().regex(/^[A-Za-z0-9_-]{43}$/u), sequence: z.number().int().positive(),
  authenticationReceiptSha256: z.string().regex(/^[a-f0-9]{64}$/u), authenticatedAtEpochMs: z.number().int().positive() }).strict();
export const currentSymbolBaselineRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
  preparation: currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }), confirmNormalClose: z.literal(true) }).strict();
interface Journal extends TrackedDispatchOperationJournal {
  plan: Value & { profile: typeof PROFILE }; closeAttempted: boolean; copyAttempted: boolean;
  relaunchAttempted: boolean; releaseAttempted: boolean; admissionAttempted: boolean; cacheAttempted: boolean;
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
  readonly evidence: Map<string, unknown>;
}
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function relaunchMethods(engine: EasyedaControlEngine, runtime: WindowsControlRuntime): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity comparison only; every invocation retains its actual runtime or engine receiver. */
  return [runtime.launch, runtime.status, runtime.clockObservationForLaunch, runtime.releaseCapture, engine.releaseClosedSessionAuthority,
    runtime.capture, runtime.proveTerminated, engine.captureClosedSessionAuthority, engine.clockObservationForClosedCapture, engine.runtimeIdentity,
    engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated, engine.upstream.withAuthenticatedBridgeDispatchScope,
    engine.status, engine.dispatchWithOrphanTracking, engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk,
    engine.clockObservationForTrackedDispatch, engine.upstream.callTool];
  /* oxlint-enable typescript/unbound-method */
}
function summary(slot: Slot): Value {
  return { operationId: slot.owner.operationId, openingOperationId: slot.owner.openingOperationId, state: slot.journal.state,
    closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined, copyAttempted: slot.copyAttempted,
    baselineCaptured: slot.baselineCaptured, relaunchAttempted: slot.relaunchAttempted, launchAcknowledged: slot.launch !== undefined,
    releaseAttempted: slot.releaseAttempted, captureReleased: slot.captureReleased, nativeLaunchClockStatus: slot.launchClock?.clock.status ?? "not-observed",
    admissionAttempted: slot.admissionAttempted, admissionCaptureRetained: slot.admissionCapture !== undefined, admissionProved: slot.admissionProved,
    nativeAdmissionClockStatus: slot.admissionClock?.clock.status ?? "not-observed",
    cacheAttempted: slot.cacheAttempted, cacheReplyRetained: slot.cacheReplyRetained, cachesObserved: slot.cachesObserved,
    startupPremises: slot.copy?.startupPremises ?? null,
    nativeCacheClockStatus: slot.cacheClock?.clock.status ?? "not-observed", startupQualified: false,
    beforeWriteBaselineVerified: false, openingEffectsVerified: false, backendActorVerified: false, backendClockVerified: false,
    writerReady: false, executionAuthorized: false, explicitSaveDispatched: false, replayAllowed: false,
    journalPath: slot.journal.journalPath, artifacts: slot.journal.artifacts, nextSafeAction: slot.journal.nextSafeAction };
}

/** Internal only. Normal close is one-shot; only a qualified pending observation
 * permits another termination probe. Lost original owners cannot be restored by
 * loading journals. Subsequent launch retains a new original result without
 * reusing the old closure authority. No public route, Save or writer is added.
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
    slot.journal.nextSafeAction = "Inspect this consumed attempt. Do not repeat close, copy, launch, release, admission, cache observation, Save or navigation; retain the original facade and process handles.";
    if (slot.created) {
      const persisted = await loadOperation(slot.owner.operationId);
      // Preserve externally advanced or conflicting history instead of replacing
      // It with our stopped state. The in-memory attempt remains consumed.
      if (canonicalJson(persisted) !== slot.journalText) { return; }
      await CurrentSymbolBaselineCoordinator.record(slot, "stopped", { phase, replayAllowed: false, closeAttempted: slot.closeAttempted, copyAttempted: slot.copyAttempted,
        relaunchAttempted: slot.relaunchAttempted, launchAcknowledged: slot.launch !== undefined, releaseAttempted: slot.releaseAttempted, captureReleased: slot.captureReleased,
        admissionAttempted: slot.admissionAttempted, admissionCaptureRetained: slot.admissionCapture !== undefined,
        cacheAttempted: slot.cacheAttempted, cacheReplyRetained: slot.cacheReplyRetained });
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
      closeAttempted: false, copyAttempted: false, relaunchAttempted: false, releaseAttempted: false, admissionAttempted: false, cacheAttempted: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      nextSafeAction: "Retain one closed-session capture in the original authenticated scope before normal close." };
    const slot: Slot = { owner, ownerText: canonicalJson(owner), journal, journalText: canonicalJson(journal), created: false,
      closeAttempted: false, copyAttempted: false, baselineCaptured: false, relaunchAttempted: false, releaseAttempted: false, captureReleased: false,
      admissionAttempted: false, admissionProved: false, cacheAttempted: false, cacheReplyRetained: false, cachesObserved: false, evidence: new Map() };
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
      need(typeof scopeReader === "function" && typeof lifecycleReader === "function" && validator === this.runtime,
        "Current symbol relaunch needs its original runtime validator and lifecycle readers.");
      const methods = relaunchMethods(this.engine, this.runtime);
      const captureText = canonicalJson(capture), priorLaunch = canonicalJson(source.launchProjection);
      const sourceText = canonicalJson({ target: source.target, expectedFingerprint: source.expectedFingerprint, preNavigationCheckpoint: source.preNavigationCheckpoint });
      const endpoint = lifecycleReader.call(upstream), priorSession = source.bridgeSession;
      const priorSessionText = canonicalJson(priorSession);
      need(isRecord(endpoint), "Current symbol relaunch lifecycle is unavailable.");
      const endpointText = canonicalJson(endpoint["publicEndpoint"]);
      let replacementSessionText: string | undefined;
      const infrastructure = (launched: boolean, scopeText?: string): void => {
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
        need(replacementSessionText === undefined || canonicalJson(active) === replacementSessionText,
          "Current symbol relaunch replacement session changed.");
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
      slot.journal.nextSafeAction = "New session admitted only. Qualify inactive caches, project-only startup effects and backend actor/clock before opening or writing.";
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
      const initialStatus = await this.engine.status(); await current();
      const initial = structuredClone(initialStatus.stableFingerprint);
      validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
      assertSubset(initial, source.expectedFingerprint, "Current symbol cache runtime");
      await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot); await original();
      const target = { projectUuid: source.target.projectUuid, branchUuid: source.target.branchUuid };
      const code = buildCurrentUploadQueueReadProgram(target), scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(typeof scope === "function", "Current symbol cache observation lacks its owned scope.");
      slot.journal.cacheAttempted = true; slot.journal.state = "cache-dispatching";
      slot.journal.nextSafeAction = "Retain this single inactive-target cache observation; do not repeat, navigate, Save or write.";
      await CurrentSymbolBaselineCoordinator.record(slot, "cache-intent", { target, programSha256: sha256Json({ code }),
        runtimeFingerprintSha256: sha256Json(initial), startupQualified: false, executionAuthorized: false }); await original();
      await this.engine.assertBridgeDispatchAllowed(); await current();
      await this.engine.assertRecoveryOperationIsolated(operationId); await current();
      let completed = false;
      await scope.call(this.engine.upstream, async (binding) => {
        const scopeText = canonicalJson(binding);
        sessionCurrent(scopeText);
        need(binding.gatewayInstanceId === admissionCapture.bridgeSession.gatewayInstanceId &&
          binding.sessionId === admissionCapture.bridgeSession.sessionId && binding.sessionSequence === admissionCapture.bridgeSession.sequence,
        "Current symbol cache scope differs from its admitted session.");
        await original(scopeText);
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
        await original(scopeText); completed = true;
      });
      await original();
      need(completed && slot.cacheObservation !== undefined, "Current symbol cache scope did not complete.");
      await this.engine.assertBridgeDispatchAllowed(); await current();
      await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot); await original();
      const finalStatus = await this.engine.status(); await current();
      const final = finalStatus.stableFingerprint;
      validateSdkLocalRuntimeFingerprint(final);
      need(canonicalJson(final) === canonicalJson(initial), "Current symbol cache runtime changed around observation.");
      slot.journal.state = "caches-observed";
      slot.journal.nextSafeAction = "Cache absence observed only at the recorded samples. Qualify pre-opening continuity, startup producers and backend actor/clock; no opening or writer is authorized.";
      await CurrentSymbolBaselineCoordinator.record(slot, "cache-result", { observation: slot.cacheObservation,
        observationSha256: sha256Json(slot.cacheObservation), dispatchClock: slot.cacheClock, runtimeFingerprintSha256: sha256Json(initial),
        startupQualified: false, persistenceVerified: false, executionAuthorized: false }); await original();
      slot.cachesObserved = true;
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "inactive-cache-observation", error); }
    finally { this.busy = false; }
  }

  public async inspect(operationId: string): Promise<Value> {
    const journal = await loadOperation(operationId);
    need(isRecord(journal.plan) && journal.plan["profile"] === PROFILE && journal.operationId === operationId,
      "Current symbol baseline history has another profile.");
    const slot = this.slots.get(operationId);
    return { ...(slot === undefined ? {} : summary(slot)), operationId, state: journal["state"], journalPath: journal["journalPath"], artifacts: journal.artifacts,
      nextSafeAction: journal["nextSafeAction"], originalOwnerRetained: this.slots.has(operationId), writerReady: false, executionAuthorized: false };
  }
}
