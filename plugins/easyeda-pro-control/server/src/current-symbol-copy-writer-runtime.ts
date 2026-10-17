/** Private one-shot native symbol clone coordinator, invoked only by disposable
 * orchestration. It consumes original copy owners, never metadata operations.
 */
/* oxlint-disable import/max-dependencies -- Compose the original copy lifecycle, compiler, clocks and complete SQL owners without caller-supplied verifier callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- The original copy generation owns its issued age evidence; an injectable qualification callback is not equivalent.
import { qualifyCurrentCopyAgedSqlHead } from "./current-copy-aged-sql-issuer.ts";
import type { OriginalCurrentCopyAgedSqlClock } from "./current-copy-aged-sql-issuer.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Complete snapshots must come from the original retained-owner capture registry.
import { assertOriginalCurrentSymbolCopyBaselineCopy, assertOriginalCurrentSymbolCopyFinishSnapshot, captureCurrentSymbolCopyFinishSnapshot, revalidateCurrentSymbolCopyFinishSnapshot } from "./current-symbol-baseline-copy.ts";
import type { CurrentSymbolCopyFinishSnapshot, CurrentSymbolFinishSnapshotEvidence } from "./current-symbol-baseline-copy.ts";
// oxlint-disable-next-line import/no-cycle -- The baseline alone issues and transfers the one-shot writer owner; public composition must retain that lexical registry.
import { assertCurrentProjectOnlySymbolCopyGeneration, assertCurrentSymbolCopyWriterOwner, revalidateCurrentProjectOnlySymbolCopyGeneration, transferCurrentProjectOnlySymbolCopyGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolCopyGeneration, CurrentSymbolCopyWriterOwner, CurrentSymbolCopyWriterOwnerSource } from "./current-symbol-baseline-runtime.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import { prepareCurrentSymbolCopyClock, recordCurrentSymbolCopyClockPost, verifyCurrentSymbolCopyClock } from "./current-symbol-copy-clock.ts";
import type { CurrentSymbolCopyClockPlan } from "./current-symbol-copy-clock.ts";
import { assertCurrentSymbolCopyPlanInventory, currentSymbolCopyProgramSource, currentSymbolCopySourceMetadata } from "./current-symbol-copy-plan.ts";
import type { CurrentSymbolCopyPlan } from "./current-symbol-copy-plan.ts";
import { CURRENT_SYMBOL_COPY_TIMEOUT_MS, buildCurrentSymbolCopyProgram, decodeCurrentSymbolCopyReply, decodeCurrentSymbolCopyStoppedReply } from "./current-symbol-copy-program.ts";
import type { CurrentSymbolCopyProgramInput, CurrentSymbolCopyProgramResult, CurrentSymbolCopyStoppedResult } from "./current-symbol-copy-program.ts";
import { buildCurrentSymbolCopySourceReadProgram, currentSymbolCopySourceReadRequestSchema, decodeCurrentSymbolCopySourceReadReply } from "./current-symbol-copy-source-read-program.ts";
// oxlint-disable-next-line import/no-cycle -- Startup tokens are issued only from the original generation; the writer cannot accept a caller verifier instead.
import { assertCurrentSymbolCopyStartup, revalidateCurrentSymbolCopyStartup } from "./current-symbol-copy-startup-runtime.ts";
import { buildCurrentSymbolWriterClockProgram, decodeCurrentSymbolWriterClockReply } from "./current-symbol-writer-clock-program.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, IssuedWindowsClockObservation } from "./windows-authority.ts";

const PROFILE = "easyeda-pro-control.current-symbol-copy-writer.v1", WRITE_PHASE = "current-symbol-copy-writer-once";
type Journal = TrackedDispatchOperationJournal;
type Clock = IssuedWindowsClockObservation;
interface Slot {
  readonly owner: CurrentSymbolCopyWriterOwner; readonly source: CurrentSymbolCopyWriterOwnerSource;
  readonly journal: Journal; readonly dispatchOwner: object; readonly startup: unknown; readonly transferJournal: unknown;
  readonly methods: readonly unknown[]; journalText: string;
  sourceRaw?: unknown; sourceObservation?: CurrentSymbolCopyProgramInput["sourceObservation"];
  beforeClock?: Clock; armedClock?: Clock; afterClock?: Clock; clockRaw?: unknown; writeRaw?: unknown;
  clockPlan?: CurrentSymbolCopyClockPlan; writeInput?: CurrentSymbolCopyProgramInput;
  writeResult?: CurrentSymbolCopyProgramResult; stoppedResult?: CurrentSymbolCopyStoppedResult;
  dispatchStarted: boolean; writeAcknowledged: boolean; postRecorded: boolean; failed: boolean; dispatchCaptureCleanupUncertain: boolean;
  closeAttempted: boolean; closeIntent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  termination?: ClosedSessionTerminationObservation; snapshotAttempted: boolean; snapshotComplete: boolean;
  readonly snapshotEvidence: Map<CurrentSymbolFinishSnapshotEvidence["kind"], CurrentSymbolFinishSnapshotEvidence["value"]>;
  snapshotInventory?: Extract<CurrentSymbolFinishSnapshotEvidence, { kind: "inventory" }>["value"];
  snapshot?: CurrentSymbolCopyFinishSnapshot; continuation?: CurrentSymbolCopyWriterContinuation;
  comparisonAttempted: boolean; comparison?: Readonly<Record<string, unknown>>;
  recoveryClassificationAttempted: boolean; recoveryClassification?: Readonly<Record<string, unknown>>;
  releaseAttempted: boolean; retired: boolean;
}
export interface CurrentSymbolCopyWriterContinuation {
  readonly profile: "private.current-symbol-copy-writer-continuation.v1";
  readonly operationId: string;
}
export interface CurrentSymbolCopyWriterContinuationSource {
  readonly operationId: string;
  readonly snapshot: CurrentSymbolCopyFinishSnapshot;
  readonly copyPlan: CurrentSymbolCopyPlan;
  readonly clockPlan: CurrentSymbolCopyClockPlan;
  readonly dispatchOwner: object;
  readonly writeInput: CurrentSymbolCopyProgramInput;
  readonly writeResult: CurrentSymbolCopyProgramResult;
  readonly original: CurrentSymbolCopyWriterOwnerSource["original"];
  readonly sqlRuntime: CurrentSymbolCopyWriterOwnerSource["sqlRuntime"];
  readonly journal: Journal;
}
const continuations = new WeakMap<object, { readonly engine: EasyedaControlEngine;
  readonly source: CurrentSymbolCopyWriterContinuationSource; readonly current: () => void;
  readonly journalText: () => string; consumed: boolean }>();
function need(condition: boolean, message = "Current symbol copy writer owner or evidence changed."): asserts condition {
  if (!condition) { throw new Error(message); }
}
export function assertOriginalCurrentSymbolCopyWriterContinuation(value: unknown,
  engine: EasyedaControlEngine): CurrentSymbolCopyWriterContinuationSource {
  need(value !== null && typeof value === "object", "Current copy verification needs its original writer continuation.");
  const issued = continuations.get(value);
  need(issued !== undefined && issued.engine === engine, "Current copy verification continuation was not issued by this engine.");
  issued.current(); return issued.source;
}
export async function revalidateCurrentSymbolCopyWriterContinuation(value: CurrentSymbolCopyWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentSymbolCopyWriterContinuationSource> {
  const source = assertOriginalCurrentSymbolCopyWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed, "Current copy verification transfer already consumed.");
  const disk = await loadOperation(source.operationId);
  need(assertOriginalCurrentSymbolCopyWriterContinuation(value, engine) === source && !issued.consumed &&
    canonicalJson(disk) === issued.journalText() && canonicalJson(source.journal) === issued.journalText(),
  "Current copy verification original retired journal changed."); return source;
}
export function transferCurrentSymbolCopyWriterContinuation(value: CurrentSymbolCopyWriterContinuation,
  engine: EasyedaControlEngine): CurrentSymbolCopyWriterContinuationSource {
  const source = assertOriginalCurrentSymbolCopyWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed && canonicalJson(source.journal) === issued.journalText(),
    "Current copy verification transfer already consumed or changed.");
  issued.consumed = true; return source;
}
function methods(engine: EasyedaControlEngine): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity only; each invocation retains its actual receiver. */
  return [engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk, engine.freshClockObservationForClosedCapture,
    engine.dispatchWithOrphanTracking, engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated,
    engine.upstream.callTool, engine.upstream.withAuthenticatedBridgeDispatchScope,
    engine.upstream.currentAuthenticatedBridgeDispatchBinding, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
  /* oxlint-enable typescript/unbound-method */
}
function binding(slot: Slot): Omit<Parameters<CurrentSymbolCopyWriterOwnerSource["original"]["source"]["runtime"]["prepareClosedSessionClose"]>[0], "windowHandle"> {
  const capture = slot.source.original.capture;
  return { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
}
function summary(slot: Slot): Readonly<Record<string, unknown>> {
  return Object.freeze({ profile: PROFILE, operationId: slot.owner.operationId, state: slot.journal.state,
    dispatchAttemptConsumed: true, mutationMayHaveOccurred: slot.dispatchStarted, writeAcknowledged: slot.writeAcknowledged,
    nativeReturnedUuid: slot.writeResult?.createdUuid ?? slot.stoppedResult?.createdUuid ?? null,
    nativeReturnAcknowledged: slot.writeResult !== undefined || slot.stoppedResult?.nativeReturnAcknowledged === true,
    stoppedNativeResult: slot.stoppedResult === undefined ? null : structuredClone(slot.stoppedResult),
    retainedEvidence: { sourceReply: slot.sourceRaw !== undefined, sourceObservation: slot.sourceObservation !== undefined,
      clockReply: slot.clockRaw !== undefined, writeReply: slot.writeRaw !== undefined,
      beforeClock: slot.beforeClock !== undefined, armedClock: slot.armedClock !== undefined, afterClock: slot.afterClock !== undefined },
    postRecorded: slot.postRecorded, closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined,
    finishObservationAvailable: slot.closeIntent !== undefined && slot.closeReceipt !== undefined && !slot.releaseAttempted && !slot.retired,
    snapshotAttempted: slot.snapshotAttempted, snapshotComplete: slot.snapshotComplete,
    comparisonAttempted: slot.comparisonAttempted, comparison: slot.comparison === undefined ? null : structuredClone(slot.comparison),
    recoveryClassificationAttempted: slot.recoveryClassificationAttempted,
    recoveryClassification: slot.recoveryClassification === undefined ? null : structuredClone(slot.recoveryClassification),
    failed: slot.failed, retired: slot.retired, verificationContinuationRetained: slot.continuation !== undefined,
    dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, replayAllowed: false, explicitSaveDispatched: false,
    persistentUploadReplayExcluded: false, reopened: false, inverseValidated: false, executionAuthorized: false });
}

export class CurrentSymbolCopyWriterCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  private current(slot: Slot, scopeText?: string): void {
    need(this.slots.get(slot.owner.operationId) === slot && !slot.retired &&
      assertCurrentSymbolCopyWriterOwner(slot.owner, this.engine, scopeText) === slot.source &&
      methods(this.engine).every((method, index) => method === slot.methods[index]) && slot.journal === slot.source.journal);
    assertCurrentSymbolCopyPlanInventory(slot.source.original.baseline.preparation, slot.source.original.baseline.inventory);
  }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "Current copy writer journal changed.");
  }
  private async record(slot: Slot, phase: string, value: unknown, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const prior = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(prior) === slot.journalText, "Current copy writer refused to overwrite a changed journal.");
    slot.journal.sequence += 1;
    const artifact = await writePhaseArtifact(slot.owner.operationId, slot.journal.sequence, phase, value);
    this.current(slot, scopeText); slot.journal.artifacts.push(artifact);
    slot.journal.updatedAt = new Date().toISOString(); await updateOperation(slot.journal);
    this.current(slot, scopeText); slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot, scopeText);
  }
  private async acceptMark(slot: Slot, before: Journal, phase: string, scopeText: string): Promise<Journal> {
    this.current(slot, scopeText);
    const lease = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); need(lease !== undefined);
    assertCurrentSymbolCacheMark(before, slot.journal, { phase, bridgeDispatch: lease,
      capture: slot.source.original.capture, launch: slot.source.original.launch });
    const text = canonicalJson(slot.journal);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === text && canonicalJson(slot.journal) === text, "Current copy writer marked journal changed.");
    slot.journalText = text; return structuredClone(slot.journal);
  }
  private async acceptClear(slot: Slot, marked: Journal, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText); assertCurrentSymbolCacheClear(marked, slot.journal, phase);
    const text = canonicalJson(slot.journal);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === text && canonicalJson(slot.journal) === text, "Current copy writer cleared journal changed."); slot.journalText = text;
  }
  private async retainEngineFailure(slot: Slot, marked: Journal | undefined, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText);
    if (canonicalJson(slot.journal) === slot.journalText) { await this.unchanged(slot, scopeText); return; }
    need(marked !== undefined, "Current copy writer has no retained mark for engine failure cleanup.");
    await this.acceptClear(slot, marked, phase, scopeText);
    // The durable clear alone does not prove the engine's later native capture
    // Release. Preserve uncertainty rather than retry that consumed release.
    slot.dispatchCaptureCleanupUncertain = true;
  }
  private async stop(slot: Slot, stage: string): Promise<void> {
    slot.failed = true; slot.journal.state = "copy-writer-stopped"; slot.journal.hardStop = true;
    slot.journal.mutationMayHaveOccurred ||= slot.dispatchStarted;
    slot.journal.nextSafeAction = "Do not replay, Save, inverse, delete or reopen. Retain this original copy writer for one normal close and complete closed-result inspection.";
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, scope = reader?.call(this.engine.upstream);
    await this.record(slot, "copy-writer-stopped", { stage, ...summary(slot), transferJournal: slot.transferJournal,
      sourceRaw: slot.sourceRaw ?? null, sourceObservation: slot.sourceObservation ?? null,
      clockRaw: slot.clockRaw ?? null, writeRaw: slot.writeRaw ?? null,
      writeResult: slot.writeResult ?? null, stoppedResult: slot.stoppedResult ?? null,
      beforeClock: slot.beforeClock ?? null, armedClock: slot.armedClock ?? null, afterClock: slot.afterClock ?? null,
      snapshotEvidence: [...slot.snapshotEvidence] }, scope === undefined ? undefined : canonicalJson(scope));
  }

  /** Consume the fixed copy generation once; any later failure leaves normal
   * closure and evidence inspection with this same retained coordinator.
   */
  public async execute(generation: CurrentProjectOnlySymbolCopyGeneration, startup: unknown,
    agedHead?: OriginalCurrentCopyAgedSqlClock): Promise<Readonly<Record<string, unknown>>> {
    need(!this.busy && !this.slots.has(generation.operationId), "Current copy writer attempt already consumed or busy.");
    this.busy = true; let slot: Slot | undefined;
    try {
      const original = assertCurrentProjectOnlySymbolCopyGeneration(generation, this.engine);
      need(original.source.purpose === "disposable-validation");
      assertCurrentSymbolCopyStartup(startup, this.engine, generation);
      await revalidateCurrentSymbolCopyStartup(startup, this.engine, generation);
      await revalidateCurrentProjectOnlySymbolCopyGeneration(generation, this.engine);
      need(assertCurrentProjectOnlySymbolCopyGeneration(generation, this.engine) === original);
      const fingerprint = original.source.expectedFingerprint;
      assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
      await verifyCurrentProjectOnlySymbolPreflightImplementation(fingerprint.installedBundles.assetsRoot);
      await verifyCurrentSymbolPersistenceImplementation(fingerprint.installedBundles.assetsRoot);
      await this.engine.assertBridgeDispatchAllowed(); await this.engine.assertRecoveryOperationIsolated(generation.operationId);
      await revalidateCurrentSymbolCopyStartup(startup, this.engine, generation);
      const beforeJournal = await loadOperation(generation.operationId), owner = transferCurrentProjectOnlySymbolCopyGeneration(generation, this.engine);
      const source = assertCurrentSymbolCopyWriterOwner(owner, this.engine);
      const journal = source.journal;
      slot = { owner, source, journal, startup, transferJournal: beforeJournal, dispatchOwner: Object.freeze({}), methods: methods(this.engine),
        journalText: canonicalJson(journal), dispatchStarted: false, writeAcknowledged: false, postRecorded: false, failed: false,
        dispatchCaptureCleanupUncertain: false, closeAttempted: false, snapshotAttempted: false, snapshotComplete: false,
        snapshotEvidence: new Map(), comparisonAttempted: false, recoveryClassificationAttempted: false, releaseAttempted: false, retired: false };
      this.slots.set(owner.operationId, slot); need(canonicalJson(beforeJournal) === slot.journalText);
      journal.plan = { profile: PROFILE, baselinePlan: structuredClone(journal.plan), baselineJournalSha256: sha256Json(beforeJournal),
        baselineCopyReceiptSha256: original.baseline.copy.receiptSha256, copyPlanSha256: sha256Json(original.baseline.preparation), startupSha256: sha256Json(startup) };
      journal.planHash = buildPlanHash(journal.plan); journal.state = "copy-writer-preparing"; journal.hardStop = true;
      journal.nextSafeAction = "Retain the original one-shot copy writer; no public writer, Save, replay, inverse, delete or reopen is enabled.";
      await this.record(slot, "copy-writer-ownership-transfer", { beforeJournal, capture: original.capture, launch: original.launch,
        startup, copyPlan: original.baseline.preparation, executionAuthorized: false });
      const retained = slot, scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(scope !== undefined, "Current copy writer requires an authenticated dispatch scope.");
      await scope.call(this.engine.upstream, async lease => {
        const scopeText = canonicalJson(lease); this.current(retained, scopeText); await this.run(retained, agedHead, scopeText);
      });
      await this.unchanged(retained); need(retained.postRecorded && retained.writeAcknowledged);
      retained.journal.state = "copy-writer-returned"; await this.record(retained, "copy-writer-returned", summary(retained)); return summary(retained);
    } catch (error) {
      if (slot !== undefined) {
        try { await this.stop(slot, "dispatch"); }
        catch (retentionError) { throw new AggregateError([error, retentionError], "Current copy writer failed; its consumed owner and partial evidence remain retained.", { cause: retentionError }); }
      }
      throw error;
    } finally { this.busy = false; }
  }

  /** A returned identity is retained synchronously before any later native
   * clock observation or journal I/O. Even an invalid ACK cannot lose it.
   */
  private static retainWriteReply(slot: Slot, raw: unknown): void {
    slot.writeRaw = raw; need(slot.writeInput !== undefined);
    const plan = slot.source.original.baseline.preparation;
    try {
      slot.writeResult = decodeCurrentSymbolCopyReply(raw, plan, slot.writeInput); slot.writeAcknowledged = true;
    } catch (error) {
      try { slot.stoppedResult = decodeCurrentSymbolCopyStoppedReply(raw, plan, slot.writeInput); }
      catch { throw error; }
      throw new Error(`Current native copy stopped at ${slot.stoppedResult.failureStage}; original returned identity is retained.`, { cause: error });
    }
  }

  private async run(slot: Slot, agedHead: OriginalCurrentCopyAgedSqlClock | undefined, scopeText: string): Promise<void> {
    const { original, generation } = slot.source, { baseline } = original;
    const copyPlan = baseline.preparation, expectedActor = original.originalPreparation.closedTargetWitness.observation.runtimeObservation.actor;
    const startup = assertCurrentSymbolCopyStartup(slot.startup, this.engine, generation);
    const request = currentSymbolCopySourceReadRequestSchema.parse({ target: { ...copyPlan.source, ownerUuid: copyPlan.ownerUuid },
      expectedBefore: currentSymbolCopySourceMetadata(copyPlan), expectedActor, maximumTicket: copyPlan.maximumTicket, startup: startup.expectation });
    await this.unchanged(slot, scopeText); await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    const sourceCode = buildCurrentSymbolCopySourceReadProgram(copyPlan, request), sourcePhase = "current-symbol-copy-writer-source";
    await this.record(slot, "copy-writer-source-intent", { request, codeSha256: sha256Text(sourceCode) }, scopeText);
    const beforeMark = structuredClone(slot.journal);
    let marked: Journal | undefined;
    let raw: unknown;
    try {
      raw = await this.engine.dispatchWithOrphanTracking(slot.journal, sourcePhase, "easyeda_execute",
        { code: sourceCode, timeoutMs: 15_000, confirmWrite: true }, 25_000,
        async () => { marked = await this.acceptMark(slot, beforeMark, sourcePhase, scopeText); },
        async reply => { slot.sourceRaw = reply; this.current(slot, scopeText); await this.record(slot, "copy-writer-source-reply", { raw: reply }, scopeText); marked = structuredClone(slot.journal); },
        async () => {
          if (marked === undefined) { marked = await this.acceptMark(slot, beforeMark, sourcePhase, scopeText); }
          else { await this.unchanged(slot, scopeText); }
        });
    } catch (error) { await this.retainEngineFailure(slot, marked, sourcePhase, scopeText); throw error; }
    need(marked !== undefined); await this.acceptClear(slot, marked, sourcePhase, scopeText); await this.unchanged(slot, scopeText);
    const observed = decodeCurrentSymbolCopySourceReadReply(raw, copyPlan, request).observation;
    // The original source reply owns this generation's worker client; the old
    // Preparation's client belongs to a different, already-closed process.
    slot.sourceObservation = Object.freeze({ profile: observed.profile, targetUuid: observed.targetUuid,
      maximumTicket: observed.maximumTicket, workerClient: observed.workerClient, content: observed.content });
    currentSymbolCopyProgramSource(copyPlan, slot.sourceObservation);
    await revalidateCurrentSymbolCopyStartup(slot.startup, this.engine, generation); this.current(slot, scopeText);
    await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    const clockRequest = { target: request.target, expectedActor };
    const clockCode = buildCurrentSymbolWriterClockProgram(clockRequest);
    await this.record(slot, "copy-writer-clock-intent", { request: clockRequest, codeSha256: sha256Text(clockCode) }, scopeText);
    const unmarked = structuredClone(slot.journal);
    let dispatch: Awaited<ReturnType<EasyedaControlEngine["markOrphanedCallRisk"]>>, writeMark: Journal | undefined;
    try {
      dispatch = await this.engine.markOrphanedCallRisk(slot.journal, WRITE_PHASE, async () => { writeMark = await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText); });
    } catch (error) { await this.retainEngineFailure(slot, writeMark, WRITE_PHASE, scopeText); throw error; }
    await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText); await this.unchanged(slot, scopeText);
    // No replacement sample widens a failed window. The source and startup
    // Qualification above finish before the first frozen Windows bracket.
    slot.beforeClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const clockRaw = await this.engine.upstream.callTool("easyeda_execute", { code: clockCode, timeoutMs: 15_000, confirmWrite: true }, 25_000, dispatch.binding);
    slot.clockRaw = clockRaw; this.current(slot, scopeText);
    slot.armedClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const documentBefore = decodeCurrentSymbolWriterClockReply(clockRaw, clockRequest);
    const age = agedHead === undefined ? undefined : qualifyCurrentCopyAgedSqlHead(agedHead, this.engine, generation, slot.beforeClock);
    slot.clockPlan = await prepareCurrentSymbolCopyClock({ before: baseline.inventory, copyPlan,
      startupActor: expectedActor, cachedActor: expectedActor, dispatchOwner: slot.dispatchOwner,
      comparisonIdentity: { projectUuid: request.target.projectUuid, branchUuid: request.target.branchUuid,
        client: observed.workerClient, preDispatchMaxTicket: observed.maximumTicket, ...(age === undefined ? {} : { agedHead: age }) },
      launchClock: original.launchClock, captureClock: original.captureClock, beforeClock: slot.beforeClock, armedClock: slot.armedClock, documentBefore });
    this.current(slot, scopeText);
    need(assertCurrentSymbolCopyStartup(slot.startup, this.engine, generation) === startup);
    slot.writeInput = { target: request.target, expectedBefore: request.expectedBefore, expectedActor, startup: startup.expectation,
      expectedWorker: { client: observed.workerClient, maxTicket: observed.maximumTicket }, sourceObservation: slot.sourceObservation,
      backendWindow: slot.clockPlan.backendWindow, documentWindow: slot.clockPlan.documentWindow,
      rendererTimezoneOffsetMinutes: documentBefore.rendererTimezoneOffsetMinutes };
    // The compiler also reserves destination getStr and envelope capacity.
    const code = buildCurrentSymbolCopyProgram(copyPlan, slot.writeInput);
    slot.journal.state = "copy-writer-dispatching"; slot.journal.mutationMayHaveOccurred = true;
    await this.record(slot, "copy-writer-dispatch-intent", { input: slot.writeInput, clockPlan: slot.clockPlan, clockRaw,
      beforeClock: slot.beforeClock, armedClock: slot.armedClock, codeSha256: sha256Text(code), replayAllowed: false }, scopeText);
    // The fixed compiler rechecks its deadline, receivers, source and roster
    // Immediately before the sole cloneData call. No host await remains here.
    this.current(slot, scopeText); slot.dispatchStarted = true;
    const writeRaw = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: CURRENT_SYMBOL_COPY_TIMEOUT_MS + 5000, confirmWrite: true },
      CURRENT_SYMBOL_COPY_TIMEOUT_MS + 15_000, dispatch.binding);
    CurrentSymbolCopyWriterCoordinator.retainWriteReply(slot, writeRaw); this.current(slot, scopeText);
    slot.afterClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    await this.record(slot, "copy-writer-dispatch-reply", { raw: writeRaw, result: slot.writeResult, afterClock: slot.afterClock }, scopeText);
    need(slot.writeResult !== undefined);
    await recordCurrentSymbolCopyClockPost(slot.clockPlan, { dispatchOwner: slot.dispatchOwner, afterClock: slot.afterClock,
      documentAfter: slot.writeResult.documentAfter, returnedUuid: slot.writeResult.createdUuid });
    this.current(slot, scopeText); slot.postRecorded = true; assertUpstreamReplySettled(writeRaw);
    const beforeClear = structuredClone(slot.journal); await this.unchanged(slot, scopeText);
    try { await this.engine.clearOrphanedCallRisk(slot.journal, WRITE_PHASE, dispatch); }
    catch (error) { await this.retainEngineFailure(slot, beforeClear, WRITE_PHASE, scopeText); throw error; }
    await this.acceptClear(slot, beforeClear, WRITE_PHASE, scopeText); await this.unchanged(slot, scopeText);
  }

  public async finishNormalClose(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && !slot.closeAttempted && !slot.retired);
    this.busy = true; slot.closeAttempted = true;
    try {
      await this.unchanged(slot); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const launch = slot.source.original.launch, runtime = slot.source.original.source.runtime;
      const window = await runtime.observeApplicationWindow(); await this.unchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === launch.jobId && window.helperInstance === launch.helperInstance);
      slot.closeIntent = await runtime.prepareClosedSessionClose({ ...binding(slot), windowHandle: window.hwnd }); await this.unchanged(slot);
      slot.journal.state = "copy-writer-close-dispatching"; await this.record(slot, "copy-writer-close-intent", { intent: slot.closeIntent, replayAllowed: false });
      slot.source.beginFinish();
      const receipt = await runtime.requestClosedSessionNormalClose({ ...binding(slot), intent: slot.closeIntent, confirmNormalClose: true });
      slot.closeReceipt = receipt; this.current(slot); slot.journal.state = "copy-writer-awaiting-termination";
      await this.record(slot, "copy-writer-close-reply", { receipt }); return summary(slot);
    } catch (error) { await this.stop(slot, "normal-close"); throw error; }
    finally { this.busy = false; }
  }

  /** Pending termination probes may repeat; snapshot, SQL comparison and
   * release consume their own attempts. Nothing triggers a second clone.
   */
  public async observeFinish(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.closeIntent !== undefined && slot.closeReceipt !== undefined && !slot.releaseAttempted && !slot.retired);
    this.busy = true;
    try {
      await this.unchanged(slot); const { original } = slot.source, runtime = original.source.runtime;
      if (slot.termination?.status !== "terminated") {
        slot.termination = await runtime.probeClosedSessionTermination({ ...binding(slot), intent: slot.closeIntent, closeReceipt: slot.closeReceipt });
      }
      assertCurrentClosedSessionTerminationObservation(slot.termination); await this.unchanged(slot);
      if (slot.termination.status === "pending") { return Object.freeze({ ...summary(slot), termination: "pending" }); }
      const { proof } = slot.termination;
      need(await assertClosedSessionCopyAuthority(proof) === proof); await this.unchanged(slot); this.closedDispatch(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      if (!slot.snapshotAttempted) {
        slot.snapshotAttempted = true;
        await this.record(slot, "copy-writer-snapshot-intent", { proof, closeIntent: slot.closeIntent, closeReceipt: slot.closeReceipt });
        slot.snapshot = await captureCurrentSymbolCopyFinishSnapshot(this.engine, { baseline: original.baseline, capture: original.capture,
          intent: slot.closeIntent, closeReceipt: slot.closeReceipt, proof, launch: original.launch, runtime: slot.source.sqlRuntime },
        event => { slot.snapshotEvidence.set(event.kind, event.value); if (event.kind === "inventory") { slot.snapshotInventory = event.value; } });
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "copy-writer-snapshot-result", slot.snapshot); slot.snapshotComplete = true;
      }
      if (!slot.comparisonAttempted && slot.snapshotComplete && slot.postRecorded && slot.clockPlan !== undefined) {
        slot.comparisonAttempted = true;
        const inventory = slot.snapshotInventory; need(inventory !== undefined, "Current copy writer lacks its original complete closed inventory.");
        slot.comparison = await verifyCurrentSymbolCopyClock(slot.clockPlan, { dispatchOwner: slot.dispatchOwner, terminationProof: proof, after: inventory });
        await this.unchanged(slot); this.closedDispatch(slot);
        await this.record(slot, "copy-writer-comparison", { comparison: slot.comparison, originalDispatchOwned: true,
          originalDocumentSamplesRetained: true, persistenceLifecycleComplete: false, persistentUploadReplayExcluded: false, reopened: false });
      }
      if (!slot.recoveryClassificationAttempted) { slot.recoveryClassificationAttempted = true; await this.classifyClosedRecovery(slot); }
      if (!slot.failed && !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded) {
        need(slot.snapshot !== undefined);
        await revalidateCurrentSymbolCopyFinishSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot); this.issueContinuation(slot);
      }
      await this.record(slot, "copy-writer-retirement-intent", { proof, comparison: slot.comparison ?? null, ...summary(slot) });
      this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof); slot.releaseAttempted = true;
      if (slot.journal.orphanedCallPossible) {
        const authority = slot.journal.executionAuthorityBeforeOrphan; need(authority !== undefined);
        await runtime.releaseCapture(authority); this.current(slot); this.closedDispatch(slot);
      }
      await this.engine.releaseClosedSessionAuthority(original.capture); this.current(slot); this.closedDispatch(slot);
      const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        updatedAt: new Date().toISOString(), nextSafeAction: "Copy writer retired. No replay, inverse, delete or reopen; fresh inactive upload-cache exclusion and saved-result verification remain required." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); this.current(slot); Object.assign(slot.journal, terminal);
      delete slot.journal.runtimeRestartChallenge; delete slot.journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot); slot.source.retire(); slot.retired = true;
      return Object.freeze({ ...summary(slot), termination: "terminated" });
    } catch (error) { await this.stop(slot, "termination-or-comparison"); throw error; }
    finally { this.busy = false; }
  }

  private async classifyClosedRecovery(slot: Slot): Promise<void> {
    let basis = "complete-snapshot-unavailable", outcome = "unresolved";
    let exactLogicalSqlUnchanged = false;
    const postEvidenceComplete = slot.postRecorded && slot.clockPlan !== undefined && slot.writeResult !== undefined &&
      slot.beforeClock !== undefined && slot.armedClock !== undefined && slot.afterClock !== undefined;
    if (slot.snapshotComplete && slot.snapshot !== undefined) {
      const original = assertOriginalCurrentSymbolCopyFinishSnapshot(slot.snapshot, this.engine); need(original.inventory === slot.snapshotInventory);
      assertOriginalCurrentSymbolCopyBaselineCopy(slot.source.original.baseline, this.engine);
      await revalidateCurrentSymbolCopyFinishSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
      if (slot.dispatchCaptureCleanupUncertain) { basis = "dispatch-capture-cleanup-uncertain"; }
      else if (slot.dispatchStarted && !postEvidenceComplete) { basis = "original-post-dispatch-evidence-incomplete"; }
      else if (slot.comparison === undefined) {
        // Only the diagnostic equality refusal is caught. Original-owner,
        // Snapshot, journal and closed-dispatch checks remain mandatory.
        try { await compareCompleteClosedSql(slot.source.original.baseline.inventory, original.inventory); exactLogicalSqlUnchanged = true; }
        catch { exactLogicalSqlUnchanged = false; }
        await this.unchanged(slot); this.closedDispatch(slot);
        need(assertOriginalCurrentSymbolCopyFinishSnapshot(slot.snapshot, this.engine) === original);
        assertOriginalCurrentSymbolCopyBaselineCopy(slot.source.original.baseline, this.engine);
        if (exactLogicalSqlUnchanged) { outcome = "unchanged"; basis = "complete-original-closed-sql-equality"; }
        else { basis = "closed-effect-not-established"; }
      } else {
        need(slot.writeAcknowledged && postEvidenceComplete); outcome = "exact-intended-effect"; basis = "original-complete-clock-and-sql-comparison";
      }
    }
    const result = Object.freeze({ profile: "private.current-symbol-copy-closed-recovery.v1", operationId: slot.owner.operationId,
      outcome, basis, completeClosedSnapshot: slot.snapshotComplete, exactLogicalSqlUnchanged,
      originalPostEvidenceComplete: postEvidenceComplete, originalTransactionComparisonVerified: slot.comparison !== undefined,
      dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, mutationMayHaveOccurred: slot.dispatchStarted,
      writerFailed: slot.failed, executionAuthorized: false, persistenceLifecycleComplete: false,
      verificationContinuationAuthorized: false, inverseAuthorized: false, replayAllowed: false });
    await this.record(slot, "copy-writer-closed-recovery-classification", result); slot.recoveryClassification = result;
  }

  private issueContinuation(slot: Slot): void {
    const { snapshot, clockPlan, writeInput, writeResult } = slot;
    need(snapshot !== undefined && clockPlan !== undefined && writeInput !== undefined && writeResult !== undefined && slot.continuation === undefined);
    need(assertOriginalCurrentSymbolCopyFinishSnapshot(snapshot, this.engine).inventory === slot.snapshotInventory);
    const copyPlan = slot.source.original.baseline.preparation;
    const token: CurrentSymbolCopyWriterContinuation = Object.freeze({ profile: "private.current-symbol-copy-writer-continuation.v1", operationId: slot.owner.operationId });
    const source: CurrentSymbolCopyWriterContinuationSource = Object.freeze({ operationId: token.operationId, snapshot, copyPlan, clockPlan,
      dispatchOwner: slot.dispatchOwner, writeInput, writeResult, original: slot.source.original, sqlRuntime: slot.source.sqlRuntime, journal: slot.journal });
    const projection = (): unknown => ({ snapshot, copyPlan, clockPlan, writeInput, writeResult, target: source.original.source.target,
      expectedFingerprint: source.original.source.expectedFingerprint, launch: source.original.launch, capture: source.original.capture, sqlRuntime: source.sqlRuntime });
    const frozen = canonicalJson(projection());
    const current = (): void => {
      need(this.slots.get(token.operationId) === slot && slot.continuation === token && slot.retired && !slot.failed &&
        !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded &&
        slot.snapshot === snapshot && slot.clockPlan === clockPlan && slot.writeInput === writeInput && slot.writeResult === writeResult &&
        slot.source.original.baseline.preparation === copyPlan && methods(this.engine).every((method, index) => method === slot.methods[index]) && canonicalJson(projection()) === frozen,
      "Current copy verification continuation changed or its writer did not retire successfully.");
      need(assertOriginalCurrentSymbolCopyFinishSnapshot(snapshot, this.engine).inventory === slot.snapshotInventory);
      assertCurrentSymbolCopyPlanInventory(copyPlan, slot.source.original.baseline.inventory);
    };
    slot.continuation = token; continuations.set(token, { engine: this.engine, source, current, journalText: () => slot.journalText, consumed: false });
  }
  public getVerificationContinuation(operationId: string): CurrentSymbolCopyWriterContinuation {
    const slot = this.slots.get(operationId); need(slot?.continuation !== undefined);
    assertOriginalCurrentSymbolCopyWriterContinuation(slot.continuation, this.engine); return slot.continuation;
  }
  private closedDispatch(slot: Slot): void {
    this.current(slot);
    const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.(); need(isRecord(lifecycle) && lifecycle["activeSession"] === null);
    const journal = slot.journal;
    const authority = journal.executionAuthorityBeforeOrphan, dispatch = journal.bridgeDispatchBeforeOrphan,
      original = slot.source.original, prior = journal.bridgeSessionBeforeOrphan;
    if (prior === undefined && dispatch === undefined && authority === undefined && !journal.orphanedCallPossible) { return; }
    const observe = this.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
    need(prior !== undefined && dispatch !== undefined && authority !== undefined && observe !== undefined &&
      canonicalJson(prior) === canonicalJson(original.capture.bridgeSession) &&
      authority.processes.some(process => canonicalJson(process) === canonicalJson(original.launch.root)) &&
      authority.processes.every(process => process.startIdentity.endsWith(`:job:${original.launch.jobId}`)));
    const closed = observe.call(this.engine.upstream, dispatch, prior);
    need(isRecord(closed) && closed["sessionId"] === prior.sessionId && closed["sequence"] === prior.sequence &&
      closed["authenticationReceiptSha256"] === prior.authenticationReceiptSha256 && closed["authenticatedAtEpochMs"] === prior.authenticatedAtEpochMs &&
      typeof closed["closedAtEpochMs"] === "number" && Number.isSafeInteger(closed["closedAtEpochMs"]) && closed["closedAtEpochMs"] >= prior.authenticatedAtEpochMs);
  }
  public inspect(operationId: string): Readonly<Record<string, unknown>> {
    const slot = this.slots.get(operationId); need(slot !== undefined, "Current copy writer has no original retained operation."); return summary(slot);
  }
}
