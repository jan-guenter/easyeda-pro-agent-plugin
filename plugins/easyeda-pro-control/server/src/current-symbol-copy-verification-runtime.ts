/** Private original-owner saved-result lifecycle. This is not a registered
 * tool, a second write, a Save or a way to adopt a persisted journal.
 */
/* oxlint-disable import/max-dependencies -- Reuse the original writer, native launch/capture, fixed cache/open/read programs and complete SQL readers without alternate issuer callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { assertExpectedFingerprint, assertSubset, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentDisposableOpenImplementation, verifyCurrentProjectOnlyOpenImplementation } from "./current-disposable-open-profile.ts";
import { CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, buildCurrentProjectOnlyOpenProgram, decodeCurrentProjectOnlyOpenReply } from "./current-project-only-open.ts";
// oxlint-disable-next-line import/no-cycle -- The verifier consumes only snapshots issued by the shared original-owner capture registry.
import { assertOriginalCurrentSymbolCopyFinishSnapshot, assertOriginalCurrentSymbolCopyVerificationSnapshot, captureCurrentSymbolCopyVerificationSnapshot } from "./current-symbol-baseline-copy.ts";
import type { CurrentSymbolCopyVerificationSnapshot, CurrentSymbolFinishSnapshotEvidence } from "./current-symbol-baseline-copy.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
// oxlint-disable-next-line import/no-cycle -- The fixed preopen reader binds the original captured copy; no caller-selected byte verifier is accepted.
import { verifyCurrentSymbolCopyPosteditPreopenSource } from "./current-symbol-preopen-source.ts";
// oxlint-disable-next-line import/no-cycle -- The fixed saved reader consumes only the original generation issued here; it cannot create a replacement generation.
import { assertCurrentCopiedSymbolRead, collectCurrentCopiedSymbolContent, currentCopiedSymbolReadEvidence } from "./current-symbol-copy-saved-read.ts";
import type { CurrentCopiedSymbolRead } from "./current-symbol-copy-saved-read.ts";
// oxlint-disable-next-line import/no-cycle -- Saved-source issuance consumes this lifecycle's original writer continuation, not a reconstructed descriptor.
import { prepareCurrentCopiedSymbolSource } from "./current-symbol-copy-saved-source.ts";
// oxlint-disable-next-line import/no-cycle -- Only the writer can issue and transfer its successful continuation into this verifier.
import { assertOriginalCurrentSymbolCopyWriterContinuation, revalidateCurrentSymbolCopyWriterContinuation, transferCurrentSymbolCopyWriterContinuation } from "./current-symbol-copy-writer-runtime.ts";
import type { CurrentSymbolCopyWriterContinuation, CurrentSymbolCopyWriterContinuationSource } from "./current-symbol-copy-writer-runtime.ts";
import { CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, buildCurrentUploadQueueReadProgram, decodeCurrentUploadQueueReadReply } from "./current-upload-queue-read.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, IssuedWindowsClockObservation, WindowsAuthorityLaunch, WindowsLaunchTerminationObservation } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertWindowsRuntimeValidator } from "./windows-runtime-validator.ts";

type Journal = TrackedDispatchOperationJournal;
type Value = Readonly<Record<string, unknown>>;
const PROFILE = "easyeda-pro-control.current-symbol-copy-verification.v1";
interface Slot {
  readonly continuation: CurrentSymbolCopyWriterContinuation;
  readonly source: CurrentSymbolCopyWriterContinuationSource;
  readonly journal: Journal; journalText: string;
  readonly savedSource: Awaited<ReturnType<typeof prepareCurrentCopiedSymbolSource>>;
  readonly runtime: WindowsControlRuntime;
  readonly infrastructure: (scopeText?: string) => void;
  launch?: WindowsAuthorityLaunch; launchText?: string; launchClock?: IssuedWindowsClockObservation;
  admissionAttempted: boolean; captureAttempted: boolean; admitted: boolean; capture?: ClosedSessionAuthorityCapture; captureText?: string;
  captureClock?: IssuedWindowsClockObservation; sessionText?: string;
  cacheAttempted: boolean; cachesObserved: boolean; cacheRaw?: unknown;
  openAttempted: boolean; opened: boolean; openRaw?: unknown;
  readAttempted: boolean; saved?: CurrentCopiedSymbolRead; generation?: CurrentSymbolCopyVerificationGeneration;
  closeAttempted: boolean; finishing: boolean; intent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  preCaptureCloseIntent?: Value; preCaptureCloseAttempted: boolean; preCaptureCloseAcknowledged: boolean;
  preCaptureTermination?: WindowsLaunchTerminationObservation;
  termination?: ClosedSessionTerminationObservation; snapshotAttempted: boolean; snapshot?: CurrentSymbolCopyVerificationSnapshot;
  readonly snapshotEvidence: Map<CurrentSymbolFinishSnapshotEvidence["kind"], CurrentSymbolFinishSnapshotEvidence["value"]>;
  comparisonAttempted: boolean; comparison?: Value; releaseAttempted: boolean; retired: boolean;
  failed: boolean; dispatchCaptureCleanupUncertain: boolean;
}
export interface CurrentSymbolCopyVerificationGeneration {
  readonly profile: "private.current-symbol-copy-verification-generation.v1";
  readonly operationId: string;
}
export interface CurrentSymbolCopyVerificationGenerationSource {
  readonly continuation: CurrentSymbolCopyWriterContinuation;
  readonly expectedFingerprint: CurrentSymbolCopyWriterContinuationSource["original"]["source"]["expectedFingerprint"];
  readonly operationId: string;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly launch: WindowsAuthorityLaunch;
  readonly journal: Journal;
  readonly current: (scopeText?: string) => void;
  readonly revalidate: (scopeText?: string) => Promise<void>;
  readonly record: (phase: string, value: unknown, scopeText?: string) => Promise<void>;
  readonly acceptMark: (before: Journal, phase: string, scopeText: string) => Promise<Journal>;
  readonly acceptClear: (marked: Journal, phase: string, scopeText: string) => Promise<void>;
  readonly retainEngineFailure: (marked: Journal | undefined, phase: string, scopeText: string) => Promise<void>;
}
const generations = new WeakMap<object, { readonly engine: EasyedaControlEngine; readonly source: CurrentSymbolCopyVerificationGenerationSource }>();
function need(condition: boolean, message = "Current symbol verification owner or evidence changed."): asserts condition { if (!condition) { throw new Error(message); } }
export function assertCurrentSymbolCopyVerificationGeneration(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): CurrentSymbolCopyVerificationGenerationSource {
  need(value !== null && typeof value === "object"); const issued = generations.get(value);
  need(issued !== undefined && issued.engine === engine, "Current symbol saved read needs its original verification generation.");
  issued.source.current(scopeText); return issued.source;
}
export async function revalidateCurrentSymbolCopyVerificationGeneration(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): Promise<CurrentSymbolCopyVerificationGenerationSource> {
  const source = assertCurrentSymbolCopyVerificationGeneration(value, engine, scopeText);
  await source.revalidate(scopeText);
  need(assertCurrentSymbolCopyVerificationGeneration(value, engine, scopeText) === source); return source;
}
function methods(engine: EasyedaControlEngine, runtime: WindowsControlRuntime): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity comparison only; all invocations retain their original receiver. */
  return [runtime.launch, runtime.status, runtime.clockObservationForLaunch, runtime.releaseCapture,
    runtime.observeApplicationWindow, runtime.normalClose, runtime.observeLaunchTermination,
    runtime.prepareClosedSessionClose, runtime.requestClosedSessionNormalClose, runtime.probeClosedSessionTermination,
    engine.captureClosedSessionAuthority, engine.releaseClosedSessionAuthority, engine.clockObservationForClosedCapture,
    engine.runtimeIdentity, engine.status, engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated,
    engine.dispatchWithOrphanTracking, engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk,
    engine.upstream.callTool, engine.upstream.withAuthenticatedBridgeDispatchScope, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
  /* oxlint-enable typescript/unbound-method */
}
function summary(slot: Slot): Value {
  return Object.freeze({ profile: PROFILE, operationId: slot.source.operationId, state: slot.journal.state,
    launchAttemptConsumed: true, launchAcknowledged: slot.launch !== undefined, admissionAttempted: slot.admissionAttempted,
    captureAttempted: slot.captureAttempted, captureAcquisitionCleanupUncertain: slot.captureAttempted && slot.capture === undefined,
    admitted: slot.admitted, cacheAttempted: slot.cacheAttempted, inactiveCachesObservedAbsent: slot.cachesObserved,
    openAttempted: slot.openAttempted, reopenedProjectOnly: slot.opened, readAttempted: slot.readAttempted,
    savedContentVerified: slot.saved !== undefined, saved: slot.saved === undefined ? null : structuredClone(slot.saved),
    closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined || slot.preCaptureCloseAcknowledged,
    preCaptureCloseAttempted: slot.preCaptureCloseAttempted,
    preCaptureTerminationObserved: slot.preCaptureTermination?.terminated === true,
    captureBoundClosureProved: slot.termination?.status === "terminated",
    snapshotAttempted: slot.snapshotAttempted, snapshotComplete: slot.snapshot !== undefined,
    comparisonAttempted: slot.comparisonAttempted, comparison: slot.comparison === undefined ? null : structuredClone(slot.comparison),
    failed: slot.failed, retired: slot.retired, dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain,
    finishObservationAvailable: !slot.releaseAttempted && !slot.retired && (slot.closeReceipt !== undefined || slot.preCaptureCloseAttempted),
    persistentUploadReplayExcluded: slot.cachesObserved && slot.opened,
    uploadExclusionScope: "point-in-time-inactive-generation-and-immediate-preopen",
    fullReopenReadbackInvariant: slot.saved !== undefined && slot.comparison !== undefined && !slot.failed && slot.retired,
    explicitSaveDispatched: false, inverseValidated: false, executionAuthorized: false, replayAllowed: false });
}
function closeBinding(slot: Slot): Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle"> {
  const { capture } = slot; need(capture !== undefined);
  return { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
}

export class CurrentSymbolCopyVerificationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  private current(slot: Slot, scopeText?: string): void {
    need(this.slots.get(slot.source.operationId) === slot && !slot.retired);
    need(assertOriginalCurrentSymbolCopyWriterContinuation(slot.continuation, this.engine) === slot.source);
    slot.infrastructure(scopeText);
    if (slot.capture !== undefined) { need(canonicalJson(slot.capture) === slot.captureText); }
    if (slot.saved !== undefined) {
      need(slot.generation !== undefined && assertCurrentCopiedSymbolRead(slot.saved, this.engine, slot.generation) === slot.saved);
    }
  }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    this.current(slot, scopeText); const saved = await loadOperation(slot.source.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
      "Current symbol verification journal changed.");
  }
  private async original(slot: Slot, scopeText?: string): Promise<void> {
    await this.unchanged(slot, scopeText); const { capture, captureClock } = slot;
    need(capture !== undefined && captureClock !== undefined && slot.admitted);
    need(await this.engine.clockObservationForClosedCapture(capture) === captureClock); this.current(slot, scopeText);
    need(await assertIssuedWindowsClockObservation(captureClock) === captureClock); await this.unchanged(slot, scopeText);
  }
  private async record(slot: Slot, phase: string, value: unknown, scopeText?: string): Promise<void> {
    this.current(slot, scopeText); const previous = await loadOperation(slot.source.operationId); this.current(slot, scopeText);
    need(canonicalJson(previous) === slot.journalText, "Current symbol verification refuses to overwrite a changed journal.");
    slot.journal.sequence += 1;
    const artifact = await writePhaseArtifact(slot.source.operationId, slot.journal.sequence, phase, value);
    this.current(slot, scopeText); slot.journal.artifacts.push(artifact); slot.journal.updatedAt = new Date().toISOString();
    await updateOperation(slot.journal); this.current(slot, scopeText); slot.journalText = canonicalJson(slot.journal);
    await this.unchanged(slot, scopeText);
  }
  private async acceptMark(slot: Slot, before: Journal, phase: string, scopeText: string): Promise<Journal> {
    this.current(slot, scopeText); const lease = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
    need(lease !== undefined && slot.capture !== undefined && slot.launch !== undefined);
    assertCurrentSymbolCacheMark(before, slot.journal, { phase, bridgeDispatch: lease, capture: slot.capture, launch: slot.launch });
    const text = canonicalJson(slot.journal);
    const saved = await loadOperation(slot.source.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === text && canonicalJson(slot.journal) === text); slot.journalText = text;
    return structuredClone(slot.journal);
  }
  private async acceptClear(slot: Slot, marked: Journal, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText); assertCurrentSymbolCacheClear(marked, slot.journal, phase);
    const text = canonicalJson(slot.journal);
    const saved = await loadOperation(slot.source.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === text && canonicalJson(slot.journal) === text); slot.journalText = text;
  }
  private async retainEngineFailure(slot: Slot, marked: Journal | undefined, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText);
    if (canonicalJson(slot.journal) === slot.journalText) { await this.unchanged(slot, scopeText); return; }
    need(marked !== undefined); await this.acceptClear(slot, marked, phase, scopeText);
    slot.dispatchCaptureCleanupUncertain = true;
  }
  private async stop(slot: Slot, stage: string): Promise<void> {
    slot.failed = true; slot.journal.state = "verification-stopped"; slot.journal.hardStop = true;
    slot.journal.nextSafeAction = "Do not relaunch, replay navigation, Save or write. Retain this original generation for normal closure and closed inspection.";
    const lease = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
    await this.record(slot, "verification-stopped", { stage, ...summary(slot), cacheRaw: slot.cacheRaw ?? null,
      openRaw: slot.openRaw ?? null, snapshotEvidence: [...slot.snapshotEvidence],
      savedReadEvidence: slot.generation === undefined ? null : currentCopiedSymbolReadEvidence(slot.generation, this.engine) ?? null },
    lease === undefined ? undefined : canonicalJson(lease));
  }

  public async start(continuation: CurrentSymbolCopyWriterContinuation): Promise<Value> {
    need(!this.busy && !this.slots.has(continuation.operationId)); this.busy = true;
    let slot: Slot | undefined;
    try {
      const source = await revalidateCurrentSymbolCopyWriterContinuation(continuation, this.engine);
      const savedSource = await prepareCurrentCopiedSymbolSource(continuation, this.engine);
      await revalidateCurrentSymbolCopyWriterContinuation(continuation, this.engine);
      // Retirement released the prior capture and invalidated its closure
      // Epoch. Rehash the exact issued result, never revive its old proof.
      await verifyCurrentSymbolCopyPosteditPreopenSource(this.engine, source.snapshot);
      const runtime = source.original.source.runtime, upstream = this.engine.upstream, validator = this.engine.executionAuthorityValidator;
      const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
      need(lifecycleReader !== undefined && scopeReader !== undefined); assertWindowsRuntimeValidator(validator, runtime);
      const retainedMethods = methods(this.engine, runtime);
      const previousLaunch = source.original.launch, prior = source.original.capture.bridgeSession;
      const endpoint = lifecycleReader.call(upstream); need(isRecord(endpoint));
      const endpointText = canonicalJson(endpoint["publicEndpoint"]), priorLaunchText = canonicalJson(previousLaunch), priorText = canonicalJson(prior);
      const infrastructure = (scopeText?: string): void => {
        assertWindowsRuntimeValidator(validator, runtime);
        need(this.engine.upstream === upstream && this.engine.executionAuthorityValidator === validator &&
          upstream.bridgeSessionLifecycle === lifecycleReader && upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
          methods(this.engine, runtime).every((method, index) => method === retainedMethods[index]) &&
          canonicalJson(prior) === priorText && canonicalJson(previousLaunch) === priorLaunchText);
        const lease = scopeReader.call(upstream);
        need(scopeText === undefined ? lease === undefined : lease !== undefined && canonicalJson(lease) === scopeText);
        const state = lifecycleReader.call(upstream);
        need(isRecord(state) && state["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
          state["gatewayInstanceId"] === prior.gatewayInstanceId && canonicalJson(state["publicEndpoint"]) === endpointText && Array.isArray(state["recentClosedSessions"]));
        const closed = state["recentClosedSessions"].filter((entry: unknown) => isRecord(entry) && entry["sessionId"] === prior.sessionId);
        const old: unknown = closed[0];
        need(closed.length === 1 && isRecord(old) && old["sequence"] === prior.sequence && old["authenticationReceiptSha256"] === prior.authenticationReceiptSha256 &&
          old["authenticatedAtEpochMs"] === prior.authenticatedAtEpochMs && typeof old["closedAtEpochMs"] === "number" &&
          Number.isSafeInteger(old["closedAtEpochMs"]) && old["closedAtEpochMs"] >= prior.authenticatedAtEpochMs);
        const active = state["activeSession"];
        if (slot?.launch === undefined) {
          need(active === null && canonicalJson(runtime.status().launch) === priorLaunchText); return;
        }
        const status = runtime.status();
        need(status.state === "owned" && canonicalJson(status.launch) === slot.launchText && canonicalJson(slot.launch) === slot.launchText &&
          slot.launch.helperInstance === previousLaunch.helperInstance && slot.launch.jobId !== previousLaunch.jobId &&
          slot.launch.root.startIdentity !== previousLaunch.root.startIdentity);
        if (active !== null) {
          need(isRecord(active) && typeof active["sessionId"] === "string" && /^[A-Za-z0-9_-]{43}$/u.test(active["sessionId"]) &&
            active["sessionId"] !== prior.sessionId && typeof active["sequence"] === "number" && Number.isSafeInteger(active["sequence"]) &&
            active["sequence"] > prior.sequence && typeof active["authenticationReceiptSha256"] === "string" && /^[a-f0-9]{64}$/u.test(active["authenticationReceiptSha256"]) &&
            typeof active["authenticatedAtEpochMs"] === "number" && Number.isSafeInteger(active["authenticatedAtEpochMs"]) && active["authenticatedAtEpochMs"] > 0);
          const selected = canonicalJson({ ...active, gatewayInstanceId: state["gatewayInstanceId"] });
          slot.sessionText ??= selected; need(slot.sessionText === selected);
        } else if (slot.sessionText !== undefined) {
          need(slot.finishing, "Current symbol verification selected session disconnected before closure.");
          const selected: unknown = JSON.parse(slot.sessionText); need(isRecord(selected));
          const ended = state["recentClosedSessions"].filter((entry: unknown) => isRecord(entry) && entry["sessionId"] === selected["sessionId"]);
          const found: unknown = ended[0]; need(ended.length === 1 && isRecord(found));
          const { closeReason: _reason, closedAtEpochMs, ...identity } = found;
          need(canonicalJson({ ...identity, gatewayInstanceId: state["gatewayInstanceId"] }) === slot.sessionText &&
            typeof closedAtEpochMs === "number" && Number.isSafeInteger(closedAtEpochMs) &&
            typeof selected["authenticatedAtEpochMs"] === "number" && closedAtEpochMs >= selected["authenticatedAtEpochMs"]);
        }
      };
      infrastructure(); await this.engine.assertBridgeDispatchAllowed(); infrastructure();
      await this.engine.assertRecoveryOperationIsolated(source.operationId); infrastructure();
      await revalidateCurrentSymbolCopyWriterContinuation(continuation, this.engine); infrastructure();
      need(transferCurrentSymbolCopyWriterContinuation(continuation, this.engine) === source);
      slot = { continuation, source, savedSource, runtime, infrastructure, journal: source.journal, journalText: canonicalJson(source.journal),
        admissionAttempted: false, captureAttempted: false, admitted: false, cacheAttempted: false, cachesObserved: false, openAttempted: false, opened: false,
        readAttempted: false, closeAttempted: false, finishing: false, snapshotAttempted: false, snapshotEvidence: new Map(),
        preCaptureCloseAttempted: false, preCaptureCloseAcknowledged: false,
        comparisonAttempted: false, releaseAttempted: false, retired: false, failed: false, dispatchCaptureCleanupUncertain: false };
      this.slots.set(source.operationId, slot);
      const previous = structuredClone(slot.journal);
      // The prior generation is terminal. Preserve all of its fields in the
      // Transfer artifact, but do not misidentify its released dispatch as a
      // New-generation orphan when closing before the first new dispatch.
      need(!slot.journal.orphanedCallPossible);
      delete slot.journal.bridgeSessionBeforeOrphan; delete slot.journal.bridgeDispatchBeforeOrphan;
      delete slot.journal.executionAuthorityBeforeOrphan; delete slot.journal.runtimeIdentityBeforeOrphan;
      delete slot.journal.orphanedCallPhase; delete slot.journal.orphanedCallMarkedAt; delete slot.journal.orphanedCallReturnedAt;
      slot.journal.plan = { profile: PROFILE, writerPlan: previous.plan, writerJournalSha256: sha256Json(previous), posteditCopyReceiptSha256: source.snapshot.copy.receiptSha256 };
      slot.journal.planHash = buildPlanHash(slot.journal.plan); slot.journal.state = "verification-launch-dispatching"; slot.journal.hardStop = true;
      await this.record(slot, "verification-launch-intent", { previousJournal: previous, posteditSnapshot: source.snapshot, replayAllowed: false });
      await verifyCurrentSymbolCopyPosteditPreopenSource(this.engine, source.snapshot); await this.unchanged(slot);
      slot.launch = await runtime.launch(); slot.launchText = canonicalJson(slot.launch); this.current(slot);
      await this.record(slot, "verification-launch-result", { launch: slot.launch });
      slot.launchClock = await runtime.clockObservationForLaunch(slot.launch); this.current(slot);
      need(await assertIssuedWindowsClockObservation(slot.launchClock) === slot.launchClock); await this.unchanged(slot);
      slot.journal.state = "verification-launched";
      await this.record(slot, "verification-launch-clock", { clock: slot.launchClock }); return summary(slot);
    } catch (error) { if (slot !== undefined) { await this.stop(slot, "launch"); } throw error; }
    finally { this.busy = false; }
  }

  public async admit(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && !slot.failed && !slot.admissionAttempted && slot.launch !== undefined);
    this.busy = true;
    try {
      await this.unchanged(slot);
      const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.(); need(isRecord(lifecycle));
      if (lifecycle["activeSession"] === null) { return Object.freeze({ ...summary(slot), authentication: "pending" }); }
      slot.admissionAttempted = true;
      const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined && slot.sessionText !== undefined);
      await this.engine.assertBridgeDispatchAllowed(); await this.unchanged(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      await this.record(slot, "verification-admission-intent", { session: JSON.parse(slot.sessionText) as unknown, capturePhase: "closed-verification" });
      await scope.call(this.engine.upstream, async (lease) => {
        const scopeText = canonicalJson(lease); await this.unchanged(slot, scopeText);
        slot.captureAttempted = true;
        const capture = await this.engine.captureClosedSessionAuthority(operationId, "closed-verification", 1);
        slot.capture = capture; slot.captureText = canonicalJson(capture); this.current(slot, scopeText);
        need(capture.operationId === operationId && capture.phase === "closed-verification" && capture.challengeAttempt === 1 &&
          canonicalJson(capture.bridgeSession) === slot.sessionText && lease.gatewayInstanceId === capture.bridgeSession.gatewayInstanceId &&
          lease.sessionId === capture.bridgeSession.sessionId && lease.sessionSequence === capture.bridgeSession.sequence);
        const roots = capture.executionAuthority.processes.filter((process) => process.role === "easyeda-main");
        need(slot.launch !== undefined && roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(slot.launch.root) &&
          capture.executionAuthority.processes.every((process) => process.startIdentity.endsWith(`:job:${slot.launch?.jobId ?? ""}`)));
        const identity = await this.engine.runtimeIdentity(lease); await this.unchanged(slot, scopeText);
        need(canonicalJson(identity) === canonicalJson(capture.runtimeIdentity));
        slot.captureClock = await this.engine.clockObservationForClosedCapture(capture); await this.unchanged(slot, scopeText);
        need(await assertIssuedWindowsClockObservation(slot.captureClock) === slot.captureClock); await this.unchanged(slot, scopeText);
        await this.record(slot, "verification-admission-capture", { capture, clock: slot.captureClock }, scopeText);
      });
      await this.unchanged(slot); need(slot.capture !== undefined && slot.captureClock !== undefined);
      need(await this.engine.clockObservationForClosedCapture(slot.capture) === slot.captureClock); await this.unchanged(slot);
      need(await assertIssuedWindowsClockObservation(slot.captureClock) === slot.captureClock); await this.unchanged(slot);
      slot.admitted = true; slot.journal.state = "verification-admitted";
      await this.record(slot, "verification-admission-result", summary(slot)); return summary(slot);
    } catch (error) { await this.stop(slot, "admission"); throw error; }
    finally { this.busy = false; }
  }

  private async dispatch(slot: Slot, phase: string, code: string, timeout: number, opening: boolean): Promise<void> {
    await this.original(slot); await this.engine.assertBridgeDispatchAllowed(); await this.unchanged(slot);
    await this.engine.assertRecoveryOperationIsolated(slot.source.operationId); await this.unchanged(slot);
    const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined);
    const expected = slot.source.original.source.expectedFingerprint;
    await scope.call(this.engine.upstream, async (lease) => {
      const scopeText = canonicalJson(lease); await this.original(slot, scopeText);
      const capture = slot.capture; need(capture !== undefined && lease.gatewayInstanceId === capture.bridgeSession.gatewayInstanceId &&
        lease.sessionId === capture.bridgeSession.sessionId && lease.sessionSequence === capture.bridgeSession.sequence);
      const initial = await this.engine.status(); await this.original(slot, scopeText);
      const fingerprint = structuredClone(initial.stableFingerprint);
      validateSdkLocalRuntimeFingerprint(fingerprint); assertExpectedFingerprint(fingerprint); assertSubset(fingerprint, expected, "Current symbol verification runtime");
      const implementation = opening ? verifyCurrentProjectOnlyOpenImplementation : verifyCurrentDisposableOpenImplementation;
      await implementation(fingerprint.installedBundles.assetsRoot); await this.original(slot, scopeText);
      const source = opening ? await verifyCurrentSymbolCopyPosteditPreopenSource(this.engine, slot.source.snapshot) : undefined;
      await this.original(slot, scopeText);
      slot.journal.state = `${phase}-dispatching`; slot.journal.mutationMayHaveOccurred ||= opening;
      await this.record(slot, `${phase}-intent`, { codeSha256: sha256Text(code), source: source ?? null,
        posteditCopyReceiptSha256: slot.source.snapshot.copy.receiptSha256, runtimeFingerprintSha256: sha256Json(fingerprint) }, scopeText);
      const before = structuredClone(slot.journal); let marked: Journal | undefined;
      try {
        await this.engine.dispatchWithOrphanTracking(slot.journal, phase, "easyeda_execute", { code, timeoutMs: timeout, confirmWrite: true }, timeout + 10_000,
          async () => {
            marked = await this.acceptMark(slot, before, phase, scopeText); await this.original(slot, scopeText);
            if (opening) { await verifyCurrentSymbolCopyPosteditPreopenSource(this.engine, slot.source.snapshot); await this.original(slot, scopeText); }
          },
          async (raw) => {
            if (opening) { slot.openRaw = raw; } else { slot.cacheRaw = raw; }
            await this.record(slot, `${phase}-reply`, { raw }, scopeText); marked = structuredClone(slot.journal);
            const target = slot.source.original.source.target;
            if (opening) { decodeCurrentProjectOnlyOpenReply(raw, { ...target, expectedSourceSha256: slot.source.snapshot.checkpoint.sourceSha256 }); }
            else { decodeCurrentUploadQueueReadReply(raw, { projectUuid: target.projectUuid, branchUuid: target.branchUuid }); }
            await this.original(slot, scopeText);
          },
          async () => {
            if (marked === undefined) { marked = await this.acceptMark(slot, before, phase, scopeText); }
            else { await this.unchanged(slot, scopeText); }
          });
      } catch (error) { await this.retainEngineFailure(slot, marked, phase, scopeText); throw error; }
      need(marked !== undefined); await this.acceptClear(slot, marked, phase, scopeText); await this.original(slot, scopeText);
      await implementation(fingerprint.installedBundles.assetsRoot); await this.original(slot, scopeText);
      const final = await this.engine.status(); await this.original(slot, scopeText);
      need(canonicalJson(final.stableFingerprint) === canonicalJson(fingerprint));
    });
    await this.original(slot);
  }
  public async observeCaches(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && slot.admitted && !slot.failed && !slot.cacheAttempted);
    this.busy = true; slot.cacheAttempted = true;
    try {
      const { projectUuid, branchUuid } = slot.source.original.source.target;
      await this.dispatch(slot, "verification-inactive-caches", buildCurrentUploadQueueReadProgram({ projectUuid, branchUuid }), CURRENT_UPLOAD_QUEUE_TIMEOUT_MS + 5000, false);
      slot.cachesObserved = true; slot.journal.state = "verification-caches-observed";
      await this.record(slot, "verification-cache-result", summary(slot)); return summary(slot);
    } catch (error) { await this.stop(slot, "inactive-caches"); throw error; }
    finally { this.busy = false; }
  }
  public async openProject(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && slot.cachesObserved && !slot.failed && !slot.openAttempted);
    this.busy = true; slot.openAttempted = true;
    try {
      const target = { ...slot.source.original.source.target, expectedSourceSha256: slot.source.snapshot.checkpoint.sourceSha256 };
      await this.dispatch(slot, "verification-project-only-open", buildCurrentProjectOnlyOpenProgram(target), CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, true);
      slot.opened = true; slot.journal.state = "verification-project-only-opened";
      await this.record(slot, "verification-open-result", summary(slot)); this.issueGeneration(slot); return summary(slot);
    } catch (error) { await this.stop(slot, "project-only-open"); throw error; }
    finally { this.busy = false; }
  }
  private issueGeneration(slot: Slot): void {
    const { capture, launch } = slot; need(capture !== undefined && launch !== undefined && slot.generation === undefined);
    const token: CurrentSymbolCopyVerificationGeneration = Object.freeze({ profile: "private.current-symbol-copy-verification-generation.v1", operationId: slot.source.operationId });
    const current = (scopeText?: string): void => {
      this.current(slot, scopeText); need(slot.generation === token && slot.opened && slot.admitted && slot.cachesObserved &&
        !slot.failed && !slot.finishing && !slot.closeAttempted && slot.capture === capture && slot.launch === launch);
    };
    slot.generation = token;
    generations.set(token, { engine: this.engine, source: Object.freeze({ continuation: slot.continuation,
      expectedFingerprint: slot.source.original.source.expectedFingerprint, operationId: slot.source.operationId, capture, launch, journal: slot.journal,
      current, revalidate: async (scopeText?: string): Promise<void> => { current(scopeText); await this.original(slot, scopeText); current(scopeText); },
      record: async (phase: string, value: unknown, scopeText?: string): Promise<void> => { current(scopeText); await this.record(slot, phase, value, scopeText); current(scopeText); },
      acceptMark: (before: Journal, phase: string, scopeText: string): Promise<Journal> => { current(scopeText); return this.acceptMark(slot, before, phase, scopeText); },
      acceptClear: async (marked: Journal, phase: string, scopeText: string): Promise<void> => { current(scopeText); await this.acceptClear(slot, marked, phase, scopeText); current(scopeText); },
      retainEngineFailure: async (marked: Journal | undefined, phase: string, scopeText: string): Promise<void> => { current(scopeText); await this.retainEngineFailure(slot, marked, phase, scopeText); current(scopeText); } }) });
    current();
  }
  public async collectSavedContent(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && !slot.failed && !slot.readAttempted && slot.generation !== undefined);
    this.busy = true; slot.readAttempted = true;
    try {
      await this.original(slot); await this.engine.assertBridgeDispatchAllowed(); await this.unchanged(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined);
      const generation = slot.generation;
      await scope.call(this.engine.upstream, async (lease) => {
        const scopeText = canonicalJson(lease); await this.original(slot, scopeText);
        const capture = slot.capture; need(capture !== undefined && lease.gatewayInstanceId === capture.bridgeSession.gatewayInstanceId &&
          lease.sessionId === capture.bridgeSession.sessionId && lease.sessionSequence === capture.bridgeSession.sequence);
        slot.saved = await collectCurrentCopiedSymbolContent(this.engine, generation, slot.savedSource); await this.original(slot, scopeText);
      });
      await this.original(slot); need(slot.saved !== undefined);
      slot.journal.state = "verification-saved-content-read"; await this.record(slot, "verification-saved-result", slot.saved); return summary(slot);
    } catch (error) { await this.stop(slot, "saved-content"); throw error; }
    finally { this.busy = false; }
  }

  public async finishNormalClose(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && slot.launch !== undefined && !slot.closeAttempted && !slot.retired);
    this.busy = true; slot.closeAttempted = true;
    try {
      await this.unchanged(slot); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const window = await slot.runtime.observeApplicationWindow(); await this.unchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance);
      if (slot.capture === undefined) {
        // Launch-clock or admission failure can precede capture acquisition.
        // The original runtime still owns its root and Job. Use its ordinary
        // One-shot WM_CLOSE, never manufacture a closed-session binding.
        slot.preCaptureCloseIntent = Object.freeze({ profile: "private.current-symbol-pre-capture-close-intent.v1",
          operationId, launch: structuredClone(slot.launch), hwnd: window.hwnd, confirmNormalClose: true,
          createdAt: new Date().toISOString(), saveOrDiscardSelected: false, replayAllowed: false });
        slot.journal.state = "verification-pre-capture-close-dispatching";
        await this.record(slot, "verification-pre-capture-close-intent", slot.preCaptureCloseIntent);
        await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
        slot.finishing = true; slot.preCaptureCloseAttempted = true;
        await slot.runtime.normalClose(window.hwnd); this.current(slot);
        slot.preCaptureCloseAcknowledged = true; slot.journal.state = "verification-pre-capture-awaiting-termination";
        await this.record(slot, "verification-pre-capture-close-reply", { intentSha256: sha256Json(slot.preCaptureCloseIntent),
          acknowledged: true, terminationProved: false }); return summary(slot);
      }
      slot.intent = await slot.runtime.prepareClosedSessionClose({ ...closeBinding(slot), windowHandle: window.hwnd }); await this.unchanged(slot);
      slot.journal.state = "verification-close-dispatching";
      await this.record(slot, "verification-close-intent", { intent: slot.intent, replayAllowed: false });
      slot.finishing = true;
      slot.closeReceipt = await slot.runtime.requestClosedSessionNormalClose({ ...closeBinding(slot), intent: slot.intent, confirmNormalClose: true });
      this.current(slot); slot.journal.state = "verification-awaiting-termination";
      await this.record(slot, "verification-close-reply", { receipt: slot.closeReceipt }); return summary(slot);
    } catch (error) { await this.stop(slot, "normal-close"); throw error; }
    finally { this.busy = false; }
  }
  public async observeFinish(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && slot.launch !== undefined && !slot.releaseAttempted && !slot.retired &&
      (slot.capture === undefined ? slot.preCaptureCloseAttempted : slot.intent !== undefined && slot.closeReceipt !== undefined));
    this.busy = true;
    try {
      await this.unchanged(slot);
      if (slot.capture === undefined) { return await this.observePreCaptureFinish(slot); }
      need(slot.intent !== undefined && slot.closeReceipt !== undefined);
      if (slot.termination?.status !== "terminated") {
        slot.termination = await slot.runtime.probeClosedSessionTermination({ ...closeBinding(slot), intent: slot.intent, closeReceipt: slot.closeReceipt });
      }
      assertCurrentClosedSessionTerminationObservation(slot.termination); await this.unchanged(slot);
      if (slot.termination.status === "pending") { return Object.freeze({ ...summary(slot), termination: "pending" }); }
      const { proof } = slot.termination;
      need(await assertClosedSessionCopyAuthority(proof) === proof); await this.unchanged(slot); this.closedDispatch(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      if (!slot.snapshotAttempted) {
        slot.snapshotAttempted = true; await this.record(slot, "verification-snapshot-intent", { proof });
        slot.snapshot = await captureCurrentSymbolCopyVerificationSnapshot(this.engine, { finishSnapshot: slot.source.snapshot, capture: slot.capture,
          intent: slot.intent, closeReceipt: slot.closeReceipt, proof, launch: slot.launch, runtime: slot.source.sqlRuntime },
        (event) => { slot.snapshotEvidence.set(event.kind, event.value); });
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "verification-snapshot-result", slot.snapshot);
      }
      if (!slot.comparisonAttempted && slot.snapshot !== undefined) {
        slot.comparisonAttempted = true;
        const before = assertOriginalCurrentSymbolCopyFinishSnapshot(slot.source.snapshot, this.engine);
        const after = assertOriginalCurrentSymbolCopyVerificationSnapshot(slot.snapshot, this.engine);
        slot.comparison = await compareCompleteClosedSql(before.inventory, after.inventory);
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "verification-closed-comparison", slot.comparison);
      }
      await this.record(slot, "verification-retirement-intent", { proof, ...summary(slot) });
      this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof); slot.releaseAttempted = true;
      if (slot.journal.orphanedCallPossible) {
        const authority = slot.journal.executionAuthorityBeforeOrphan; need(authority !== undefined);
        await slot.runtime.releaseCapture(authority); this.current(slot); this.closedDispatch(slot);
      }
      await this.engine.releaseClosedSessionAuthority(slot.capture); this.current(slot); this.closedDispatch(slot);
      const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        updatedAt: new Date().toISOString(), nextSafeAction: "Verification retired. No replay, Save or inverse is authorized; inspect the retained complete result." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); this.current(slot); Object.assign(slot.journal, terminal);
      delete slot.journal.runtimeRestartChallenge; delete slot.journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot); slot.retired = true;
      return Object.freeze({ ...summary(slot), termination: "terminated" });
    } catch (error) { await this.stop(slot, "termination-or-comparison"); throw error; }
    finally { this.busy = false; }
  }
  private async observePreCaptureFinish(slot: Slot): Promise<Value> {
    need(slot.capture === undefined && slot.launch !== undefined && slot.preCaptureCloseIntent !== undefined && slot.preCaptureCloseAttempted);
    await this.engine.assertRecoveryOperationIsolated(slot.source.operationId); await this.unchanged(slot);
    const observation = await slot.runtime.observeLaunchTermination(); slot.preCaptureTermination = observation;
    await this.unchanged(slot);
    need(observation.jobId === slot.launch.jobId && observation.helperInstance === slot.launch.helperInstance && typeof observation.terminated === "boolean");
    if (!observation.terminated) { return Object.freeze({ ...summary(slot), termination: "pending" }); }
    const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.();
    need(isRecord(lifecycle) && lifecycle["activeSession"] === null && !slot.journal.orphanedCallPossible);
    await this.record(slot, "verification-pre-capture-termination", { observation, launch: slot.launch,
      closeIntent: slot.preCaptureCloseIntent, closeAcknowledged: slot.preCaptureCloseAcknowledged,
      originalLaunchTerminationObserved: true, closedSessionCopyAuthority: false, persistenceVerified: false,
      captureAcquisitionCleanupUncertain: slot.captureAttempted });
    const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, updatedAt: new Date().toISOString(),
      nextSafeAction: "Original pre-capture launch terminated. No closed-session snapshot, saved-result proof or replay authority was issued." };
    await updateOperation(terminal); this.current(slot); Object.assign(slot.journal, terminal);
    slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot); slot.retired = true;
    return Object.freeze({ ...summary(slot), termination: "terminated", closedSessionCopyAuthority: false });
  }
  private closedDispatch(slot: Slot): void {
    this.current(slot); const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.();
    need(isRecord(lifecycle) && lifecycle["activeSession"] === null);
    const { journal, capture, launch } = slot; need(capture !== undefined && launch !== undefined);
    const authority = journal.executionAuthorityBeforeOrphan, dispatch = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
    if (prior === undefined && dispatch === undefined && authority === undefined && !journal.orphanedCallPossible) { return; }
    const observe = this.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
    need(prior !== undefined && dispatch !== undefined && authority !== undefined && observe !== undefined &&
      canonicalJson(prior) === canonicalJson(capture.bridgeSession) && authority.processes.some((process) => canonicalJson(process) === canonicalJson(launch.root)) &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${launch.jobId}`)));
    const closed = observe.call(this.engine.upstream, dispatch, prior);
    need(isRecord(closed) && closed["sessionId"] === prior.sessionId && closed["sequence"] === prior.sequence &&
      closed["authenticationReceiptSha256"] === prior.authenticationReceiptSha256 && closed["authenticatedAtEpochMs"] === prior.authenticatedAtEpochMs &&
      typeof closed["closedAtEpochMs"] === "number" && Number.isSafeInteger(closed["closedAtEpochMs"]) && closed["closedAtEpochMs"] >= prior.authenticatedAtEpochMs);
  }
  public inspect(operationId: string): Value {
    const slot = this.slots.get(operationId); need(slot !== undefined);
    const evidence = slot.generation === undefined ? undefined : currentCopiedSymbolReadEvidence(slot.generation, this.engine);
    return Object.freeze({ ...summary(slot), savedReadEvidence: evidence === undefined ? null : structuredClone(evidence) });
  }
}
