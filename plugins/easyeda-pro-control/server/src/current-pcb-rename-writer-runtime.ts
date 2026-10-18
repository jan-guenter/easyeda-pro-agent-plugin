/** Dormant one-shot PCB title coordinator. Original PCB generation, clocks,
 * native acknowledgment and full closed SQL remain one retained lifecycle.
 */
/* oxlint-disable import/max-dependencies -- Compose original PCB issuers and maintained document-neutral lifecycle checks; no caller-supplied authority callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { qualifyCurrentPcbAgedSqlHead } from "./current-pcb-aged-sql-issuer.ts";
import type { OriginalCurrentPcbAgedSqlClock } from "./current-pcb-aged-sql-issuer.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import type { CurrentPcbRenameBinding } from "./current-pcb-rename-binding.ts";
import { assertOriginalCurrentPcbRenameClock, completedCurrentPcbRenameClockSource, prepareCurrentPcbRenameClock,
  recordCurrentPcbRenameClockPost, verifyCurrentPcbRenameClockEffect } from "./current-pcb-rename-clock.ts";
import type { CurrentPcbRenameClockPlan } from "./current-pcb-rename-clock.ts";
import { assertCurrentPcbRenameWriterOwner, assertCurrentProjectOnlyPcbRenameGeneration, retainedCurrentPcbRenameWriterOwner,
  revalidateCurrentProjectOnlyPcbRenameGeneration, transferCurrentProjectOnlyPcbRenameGeneration } from "./current-pcb-rename-generation-runtime.ts";
import type { CurrentPcbRenameWriterOwner, CurrentPcbRenameWriterOwnerSource, CurrentProjectOnlyPcbRenameGeneration } from "./current-pcb-rename-generation-runtime.ts";
import { assertOriginalCurrentPcbRenameBaseline } from "./current-pcb-rename-owner-baseline.ts";
import { inventoryForOriginalCurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import type { CurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import { CURRENT_PCB_RENAME_TIMEOUT_MS, buildCurrentPcbRenameProgram, decodeCurrentPcbRenameReply, decodeCurrentPcbRenameStoppedReply } from "./current-pcb-rename-program.ts";
import type { CurrentPcbRenameProgramInput, CurrentPcbRenameProgramResult, CurrentPcbRenameStoppedResult } from "./current-pcb-rename-program.ts";
import { assertOriginalCurrentPcbRenameSnapshot, captureCurrentPcbRenameFinishSnapshot, revalidateCurrentPcbRenameSnapshot } from "./current-pcb-rename-snapshot.ts";
import type { CurrentPcbRenameSnapshot, CurrentPcbRenameSnapshotEvidence } from "./current-pcb-rename-snapshot.ts";
import { assertOriginalCurrentPcbRenameStartup, revalidateCurrentPcbRenameStartupObservation } from "./current-pcb-rename-startup-runtime.ts";
import type { CurrentPcbRenameStartupObservation } from "./current-pcb-rename-startup-runtime.ts";
import type { CurrentPcbRenameStoredEffect } from "./current-pcb-rename-stored-effect.ts";
import { buildCurrentPcbRenameWriterClockProgram, decodeCurrentPcbRenameWriterClockReply } from "./current-pcb-rename-writer-clock-program.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, IssuedWindowsClockObservation } from "./windows-authority.ts";

const PROFILE = "easyeda-pro-control.current-pcb-rename-writer.v1", WRITE_PHASE = "current-pcb-rename-writer-once";
type Journal = TrackedDispatchOperationJournal;
type Clock = IssuedWindowsClockObservation;
interface Reservation {
  readonly generation: CurrentProjectOnlyPcbRenameGeneration; readonly startup: CurrentPcbRenameStartupObservation;
  readonly transferJournal: unknown; readonly methods: readonly unknown[];
  owner?: CurrentPcbRenameWriterOwner;
}
interface Slot {
  readonly owner: CurrentPcbRenameWriterOwner; readonly source: CurrentPcbRenameWriterOwnerSource;
  readonly journal: Journal; readonly dispatchOwner: object; readonly startup: CurrentPcbRenameStartupObservation; readonly transferJournal: unknown;
  readonly methods: readonly unknown[]; journalText: string;
  preparation?: CurrentPcbRenamePreparation; binding?: CurrentPcbRenameBinding; storedEffect?: CurrentPcbRenameStoredEffect;
  beforeClock?: Clock; armedClock?: Clock; afterClock?: Clock; clockRaw?: unknown; writeRaw?: unknown;
  clockPlan?: CurrentPcbRenameClockPlan; writeInput?: CurrentPcbRenameProgramInput;
  writeResult?: CurrentPcbRenameProgramResult; stoppedResult?: CurrentPcbRenameStoppedResult;
  dispatchStarted: boolean; writeAcknowledged: boolean; postRecorded: boolean; failed: boolean; dispatchCaptureCleanupUncertain: boolean;
  closeAttempted: boolean; closeIntent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  termination?: ClosedSessionTerminationObservation; snapshotAttempted: boolean; snapshotComplete: boolean;
  readonly snapshotEvidence: Map<CurrentPcbRenameSnapshotEvidence["kind"], CurrentPcbRenameSnapshotEvidence["value"]>;
  snapshotInventory?: Extract<CurrentPcbRenameSnapshotEvidence, { kind: "inventory" }>["value"];
  snapshot?: CurrentPcbRenameSnapshot; continuation?: CurrentPcbRenameWriterContinuation;
  comparisonAttempted: boolean; comparison?: Readonly<Record<string, unknown>>;
  recoveryClassificationAttempted: boolean; recoveryClassification?: Readonly<Record<string, unknown>>;
  releaseAttempted: boolean; retired: boolean;
}
export interface CurrentPcbRenameWriterContinuation {
  readonly profile: "private.current-pcb-rename-writer-continuation.v1";
  readonly operationId: string;
}
export interface CurrentPcbRenameWriterContinuationSource {
  readonly operationId: string;
  readonly snapshot: CurrentPcbRenameSnapshot;
  readonly preparation: CurrentPcbRenamePreparation;
  readonly storedEffect: CurrentPcbRenameStoredEffect;
  readonly clockPlan: CurrentPcbRenameClockPlan;
  readonly dispatchOwner: object;
  readonly writeInput: CurrentPcbRenameProgramInput;
  readonly writeResult: CurrentPcbRenameProgramResult;
  readonly original: CurrentPcbRenameWriterOwnerSource["original"];
  readonly sqlRuntime: CurrentPcbRenameWriterOwnerSource["sqlRuntime"];
  readonly journal: Journal;
}
const continuations = new WeakMap<object, { readonly engine: EasyedaControlEngine;
  readonly source: CurrentPcbRenameWriterContinuationSource; readonly current: () => void;
  readonly journalText: () => string; consumed: boolean }>();
function need(condition: boolean, message = "Current PCB rename writer owner or evidence changed."): asserts condition {
  if (!condition) { throw new Error(message); }
}
export function assertOriginalCurrentPcbRenameWriterContinuation(value: unknown,
  engine: EasyedaControlEngine): CurrentPcbRenameWriterContinuationSource {
  need(value !== null && typeof value === "object", "Current PCB rename verification needs its original writer continuation.");
  const issued = continuations.get(value);
  need(issued !== undefined && issued.engine === engine, "Current PCB rename verification continuation was not issued by this engine.");
  issued.current(); return issued.source;
}
export async function revalidateCurrentPcbRenameWriterContinuation(value: CurrentPcbRenameWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentPcbRenameWriterContinuationSource> {
  const source = assertOriginalCurrentPcbRenameWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed, "Current PCB rename verification transfer already consumed.");
  const disk = await loadOperation(source.operationId);
  need(assertOriginalCurrentPcbRenameWriterContinuation(value, engine) === source && !issued.consumed &&
    canonicalJson(disk) === issued.journalText() && canonicalJson(source.journal) === issued.journalText(),
  "Current PCB rename verification original retired journal changed."); return source;
}
export function transferCurrentPcbRenameWriterContinuation(value: CurrentPcbRenameWriterContinuation,
  engine: EasyedaControlEngine): CurrentPcbRenameWriterContinuationSource {
  const source = assertOriginalCurrentPcbRenameWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed && canonicalJson(source.journal) === issued.journalText(),
    "Current PCB rename verification transfer already consumed or changed.");
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
function binding(slot: Slot): Omit<Parameters<CurrentPcbRenameWriterOwnerSource["original"]["source"]["runtime"]["prepareClosedSessionClose"]>[0], "windowHandle"> {
  const capture = slot.source.original.capture;
  return { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
}
function summary(slot: Slot): Readonly<Record<string, unknown>> {
  return Object.freeze({ profile: PROFILE, operationId: slot.owner.operationId, state: slot.journal.state,
    dispatchAttemptConsumed: true, mutationMayHaveOccurred: slot.dispatchStarted, writeAcknowledged: slot.writeAcknowledged,
    nativeAcknowledgedMetadata: slot.writeResult?.acknowledged ?? slot.stoppedResult?.acknowledged ?? null,
    nativeReturnAcknowledged: slot.writeResult !== undefined || slot.stoppedResult?.nativeReturnAcknowledged === true,
    stoppedNativeResult: slot.stoppedResult === undefined ? null : structuredClone(slot.stoppedResult),
    retainedEvidence: { preparation: slot.preparation !== undefined, binding: slot.binding !== undefined, clockReply: slot.clockRaw !== undefined, writeReply: slot.writeRaw !== undefined,
      beforeClock: slot.beforeClock !== undefined, armedClock: slot.armedClock !== undefined, afterClock: slot.afterClock !== undefined },
    postRecorded: slot.postRecorded, closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined,
    cleanupCloseAvailable: !slot.closeAttempted && !slot.retired,
    finishObservationAvailable: slot.closeIntent !== undefined && slot.closeReceipt !== undefined && !slot.releaseAttempted && !slot.retired,
    snapshotAttempted: slot.snapshotAttempted, snapshotComplete: slot.snapshotComplete,
    comparisonAttempted: slot.comparisonAttempted, comparison: slot.comparison === undefined ? null : structuredClone(slot.comparison),
    recoveryClassificationAttempted: slot.recoveryClassificationAttempted,
    recoveryClassification: slot.recoveryClassification === undefined ? null : structuredClone(slot.recoveryClassification),
    failed: slot.failed, retired: slot.retired, verificationContinuationRetained: slot.continuation !== undefined,
    dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, replayAllowed: false, explicitSaveDispatched: false,
    persistentUploadReplayExcluded: false, reopened: false, inverseValidated: false, executionAuthorized: false });
}

export class CurrentPcbRenameWriterCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly slots = new Map<string, Slot>();
  private readonly reservations = new Map<string, Reservation>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  private retainSlot(reservation: Reservation, failed: boolean): Slot {
    const { owner } = reservation; need(owner !== undefined, "PCB writer transfer did not retain an owner.");
    const source = assertCurrentPcbRenameWriterOwner(owner, this.engine); const journal = source.journal;
    const slot: Slot = { owner, source, journal, startup: reservation.startup, transferJournal: reservation.transferJournal,
      dispatchOwner: Object.freeze({}), methods: reservation.methods, journalText: canonicalJson(reservation.transferJournal),
      dispatchStarted: false, writeAcknowledged: false, postRecorded: false, failed, dispatchCaptureCleanupUncertain: false,
      closeAttempted: false, snapshotAttempted: false, snapshotComplete: false, snapshotEvidence: new Map(), comparisonAttempted: false,
      recoveryClassificationAttempted: false, releaseAttempted: false, retired: false };
    this.slots.set(owner.operationId, slot); return slot;
  }
  private cleanupSlot(operationId: string): Slot {
    const slot = this.slots.get(operationId); if (slot !== undefined) { return slot; }
    const reservation = this.reservations.get(operationId); need(reservation !== undefined, "PCB writer has no retained transfer reservation.");
    // No transfer or native write is retried. A previously failed owner assertion
    // Can only make this already-retained token usable for normal closure.
    return this.retainSlot(reservation, true);
  }
  private current(slot: Slot, scopeText?: string): void {
    need(this.slots.get(slot.owner.operationId) === slot && !slot.retired &&
      assertCurrentPcbRenameWriterOwner(slot.owner, this.engine, scopeText) === slot.source &&
      methods(this.engine).every((method, index) => method === slot.methods[index]) && slot.journal === slot.source.journal);
    assertOriginalCurrentPcbRenameBaseline(slot.source.original.baseline, this.engine);
    if (slot.preparation !== undefined) { need(inventoryForOriginalCurrentPcbRenamePreparation(slot.preparation) === slot.source.original.baseline.inventory); }
  }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "Current PCB rename writer journal changed.");
  }
  private async record(slot: Slot, phase: string, value: unknown, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const prior = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(prior) === slot.journalText, "Current PCB rename writer refused to overwrite a changed journal.");
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
    need(canonicalJson(disk) === text && canonicalJson(slot.journal) === text, "Current PCB rename writer marked journal changed.");
    slot.journalText = text; return structuredClone(slot.journal);
  }
  private async acceptClear(slot: Slot, marked: Journal, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText); assertCurrentSymbolCacheClear(marked, slot.journal, phase);
    const text = canonicalJson(slot.journal);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === text && canonicalJson(slot.journal) === text, "Current PCB rename writer cleared journal changed."); slot.journalText = text;
  }
  private async retainEngineFailure(slot: Slot, marked: Journal | undefined, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText);
    if (canonicalJson(slot.journal) === slot.journalText) { await this.unchanged(slot, scopeText); return; }
    need(marked !== undefined, "Current PCB rename writer has no retained mark for engine failure cleanup.");
    await this.acceptClear(slot, marked, phase, scopeText);
    // The durable clear alone does not prove the engine's later native capture
    // Release. Preserve uncertainty rather than retry that consumed release.
    slot.dispatchCaptureCleanupUncertain = true;
  }
  private async stop(slot: Slot, stage: string): Promise<void> {
    slot.failed = true; slot.journal.state = "pcb-rename-writer-stopped"; slot.journal.hardStop = true;
    slot.journal.mutationMayHaveOccurred ||= slot.dispatchStarted;
    slot.journal.nextSafeAction = "Do not replay, Save, inverse, delete or reopen. Retain this original PCB writer for one normal close and complete closed-result inspection.";
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, scope = reader?.call(this.engine.upstream);
    await this.record(slot, "pcb-rename-writer-stopped", { stage, ...summary(slot), transferJournal: slot.transferJournal,
      preparation: slot.preparation ?? null, binding: slot.binding ?? null,
      clockRaw: slot.clockRaw ?? null, writeRaw: slot.writeRaw ?? null,
      writeResult: slot.writeResult ?? null, stoppedResult: slot.stoppedResult ?? null,
      beforeClock: slot.beforeClock ?? null, armedClock: slot.armedClock ?? null, afterClock: slot.afterClock ?? null,
      snapshotEvidence: [...slot.snapshotEvidence] }, scope === undefined ? undefined : canonicalJson(scope));
  }
  private async stopAfterFailure(slot: Slot, stage: string, error: unknown): Promise<never> {
    try { await this.stop(slot, stage); }
    catch (retentionError) {
      throw new AggregateError([error, retentionError], "PCB writer failed; original error, consumed owner and partial evidence remain retained.", { cause: retentionError });
    }
    throw error;
  }

  /** Consume the fixed PCB generation once; any later failure leaves normal
   * closure and evidence inspection with this same retained coordinator.
   */
  public async execute(generation: CurrentProjectOnlyPcbRenameGeneration, startup: CurrentPcbRenameStartupObservation,
    agedHead?: OriginalCurrentPcbAgedSqlClock): Promise<Readonly<Record<string, unknown>>> {
    need(!this.busy && !this.slots.has(generation.operationId) && !this.reservations.has(generation.operationId), "Current PCB rename writer attempt already consumed or busy.");
    this.busy = true; let slot: Slot | undefined;
    try {
      const original = assertCurrentProjectOnlyPcbRenameGeneration(generation, this.engine);
      need(original.source.purpose === "disposable-validation");
      assertOriginalCurrentPcbRenameStartup(startup, this.engine, generation);
      await revalidateCurrentPcbRenameStartupObservation(startup, this.engine, generation);
      await revalidateCurrentProjectOnlyPcbRenameGeneration(generation, this.engine);
      need(assertCurrentProjectOnlyPcbRenameGeneration(generation, this.engine) === original);
      const fingerprint = original.source.expectedFingerprint;
      assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
      await verifyCurrentProjectOnlySymbolPreflightImplementation(fingerprint.installedBundles.assetsRoot);
      await verifyCurrentSymbolPersistenceImplementation(fingerprint.installedBundles.assetsRoot);
      await this.engine.assertBridgeDispatchAllowed(); await this.engine.assertRecoveryOperationIsolated(generation.operationId);
      await revalidateCurrentPcbRenameStartupObservation(startup, this.engine, generation);
      const beforeJournal = await loadOperation(generation.operationId);
      const reservation: Reservation = { generation, startup, transferJournal: beforeJournal, methods: methods(this.engine) };
      this.reservations.set(generation.operationId, reservation);
      try { reservation.owner = transferCurrentProjectOnlyPcbRenameGeneration(generation, this.engine); }
      finally {
        // The issuer may fail its final guard after committing the transfer.
        // Retain that exact owner before attempting another fallible assertion.
        const retained = retainedCurrentPcbRenameWriterOwner(generation, this.engine);
        if (retained !== undefined) { reservation.owner = retained; }
      }
      slot = this.retainSlot(reservation, false); const journal = slot.journal;
      need(canonicalJson(journal) === slot.journalText); await this.unchanged(slot);
      journal.plan = { profile: PROFILE, baselinePlan: structuredClone(journal.plan), baselineJournalSha256: sha256Json(beforeJournal),
        baselineCopyReceiptSha256: original.baseline.copy.receiptSha256, intentSha256: sha256Json(original.baseline.intent), startupSha256: sha256Json(startup) };
      journal.planHash = buildPlanHash(journal.plan); journal.state = "pcb-rename-writer-preparing"; journal.hardStop = true;
      journal.nextSafeAction = "Retain the original one-shot PCB writer; no public writer, Save, replay, inverse, delete or reopen is enabled.";
      await this.record(slot, "pcb-rename-writer-ownership-transfer", { beforeJournal, capture: original.capture, launch: original.launch,
        startup, intent: original.baseline.intent, executionAuthorized: false });
      const retained = slot, scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(scope !== undefined, "Current PCB rename writer requires an authenticated dispatch scope.");
      await scope.call(this.engine.upstream, async lease => {
        const scopeText = canonicalJson(lease); this.current(retained, scopeText); await this.run(retained, agedHead, scopeText);
      });
      await this.unchanged(retained); need(retained.postRecorded && retained.writeAcknowledged);
      retained.journal.state = "pcb-rename-writer-returned"; await this.record(retained, "pcb-rename-writer-returned", summary(retained)); return summary(retained);
    } catch (error) {
      if (slot !== undefined) { return await this.stopAfterFailure(slot, "dispatch", error); }
      throw error;
    } finally { this.busy = false; }
  }

  /** A returned identity is retained synchronously before any later native
   * clock observation or journal I/O. Even an invalid ACK cannot lose it.
   */
  private static retainWriteReply(slot: Slot, raw: unknown): void {
    slot.writeRaw = raw; need(slot.writeInput !== undefined && slot.preparation !== undefined && slot.binding !== undefined);
    try {
      slot.writeResult = decodeCurrentPcbRenameReply(raw, slot.preparation, slot.binding, slot.writeInput); slot.writeAcknowledged = true;
    } catch (error) {
      try { slot.stoppedResult = decodeCurrentPcbRenameStoppedReply(raw, slot.preparation, slot.binding, slot.writeInput); }
      catch { throw error; }
      throw new Error(`Native PCB rename stopped at ${slot.stoppedResult.failureStage}; original acknowledgment remains retained.`, { cause: error });
    }
  }

  private async run(slot: Slot, agedHead: OriginalCurrentPcbAgedSqlClock | undefined, scopeText: string): Promise<void> {
    const { original, generation } = slot.source;
    const startup = assertOriginalCurrentPcbRenameStartup(slot.startup, this.engine, generation);
    const expectedActor = startup.observation.runtimeObservation.actor;
    const clockRequest = { target: original.baseline.intent.target, expectedActor };
    await this.unchanged(slot, scopeText); await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    await revalidateCurrentPcbRenameStartupObservation(slot.startup, this.engine, generation); this.current(slot, scopeText);
    const clockCode = buildCurrentPcbRenameWriterClockProgram(clockRequest);
    await this.record(slot, "pcb-rename-writer-clock-intent", { request: clockRequest, codeSha256: sha256Text(clockCode) }, scopeText);
    const unmarked = structuredClone(slot.journal);
    let dispatch: Awaited<ReturnType<EasyedaControlEngine["markOrphanedCallRisk"]>>, writeMark: Journal | undefined;
    try {
      dispatch = await this.engine.markOrphanedCallRisk(slot.journal, WRITE_PHASE,
        async () => { writeMark = await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText); });
    } catch (error) { await this.retainEngineFailure(slot, writeMark, WRITE_PHASE, scopeText); throw error; }
    await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText); await this.unchanged(slot, scopeText);
    slot.beforeClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const clockRaw = await this.engine.upstream.callTool("easyeda_execute", { code: clockCode, timeoutMs: 15_000, confirmWrite: true }, 25_000, dispatch.binding);
    slot.clockRaw = clockRaw; this.current(slot, scopeText);
    slot.armedClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const documentBefore = decodeCurrentPcbRenameWriterClockReply(clockRaw, clockRequest);
    const age = agedHead === undefined ? undefined : qualifyCurrentPcbAgedSqlHead(agedHead, this.engine, generation, slot.beforeClock);
    slot.clockPlan = await prepareCurrentPcbRenameClock({ engine: this.engine, generation, startup: slot.startup,
      dispatchOwner: slot.dispatchOwner, beforeClock: slot.beforeClock, armedClock: slot.armedClock, documentBefore,
      ...(age === undefined ? {} : { agedHead: age }) }); this.current(slot, scopeText);
    const prepared = assertOriginalCurrentPcbRenameClock(slot.clockPlan, this.engine, generation, slot.startup, slot.dispatchOwner);
    slot.preparation = prepared.preparation; slot.binding = prepared.binding;
    need(assertOriginalCurrentPcbRenameStartup(slot.startup, this.engine, generation) === startup);
    slot.writeInput = Object.freeze({ expectedActor, startup: startup.expectation, rendererTimezoneOffsetMinutes: documentBefore.rendererTimezoneOffsetMinutes });
    const code = buildCurrentPcbRenameProgram(slot.preparation, slot.binding, slot.writeInput);
    slot.journal.state = "pcb-rename-writer-dispatching"; slot.journal.mutationMayHaveOccurred = true;
    await this.record(slot, "pcb-rename-writer-dispatch-intent", { input: slot.writeInput, preparation: slot.preparation, binding: slot.binding,
      clockPlan: slot.clockPlan, clockRaw, beforeClock: slot.beforeClock, armedClock: slot.armedClock, codeSha256: sha256Text(code), replayAllowed: false }, scopeText);
    // The fixed compiler checks the original deadlines, actor and whole PCB map
    // Immediately before the sole updateData call. No host await remains here.
    this.current(slot, scopeText); slot.dispatchStarted = true;
    const writeRaw = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: CURRENT_PCB_RENAME_TIMEOUT_MS + 5000, confirmWrite: true },
      CURRENT_PCB_RENAME_TIMEOUT_MS + 15_000, dispatch.binding);
    CurrentPcbRenameWriterCoordinator.retainWriteReply(slot, writeRaw); this.current(slot, scopeText);
    slot.afterClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    await this.record(slot, "pcb-rename-writer-dispatch-reply", { raw: writeRaw, result: slot.writeResult, afterClock: slot.afterClock }, scopeText);
    need(slot.writeResult !== undefined);
    await recordCurrentPcbRenameClockPost(slot.clockPlan, { engine: this.engine, generation, startup: slot.startup, dispatchOwner: slot.dispatchOwner,
      afterClock: slot.afterClock, result: slot.writeResult }); this.current(slot, scopeText); slot.postRecorded = true; assertUpstreamReplySettled(writeRaw);
    const beforeClear = structuredClone(slot.journal); await this.unchanged(slot, scopeText);
    try { await this.engine.clearOrphanedCallRisk(slot.journal, WRITE_PHASE, dispatch); }
    catch (error) { await this.retainEngineFailure(slot, beforeClear, WRITE_PHASE, scopeText); throw error; }
    await this.acceptClear(slot, beforeClear, WRITE_PHASE, scopeText); await this.unchanged(slot, scopeText);
  }

  public async finishNormalClose(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    need(!this.busy); const slot = this.cleanupSlot(operationId); need(!slot.closeAttempted && !slot.retired);
    this.busy = true; slot.closeAttempted = true;
    try {
      await this.unchanged(slot); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const launch = slot.source.original.launch, runtime = slot.source.original.source.runtime;
      const window = await runtime.observeApplicationWindow(); await this.unchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === launch.jobId && window.helperInstance === launch.helperInstance);
      slot.closeIntent = await runtime.prepareClosedSessionClose({ ...binding(slot), windowHandle: window.hwnd }); await this.unchanged(slot);
      slot.journal.state = "pcb-rename-writer-close-dispatching"; await this.record(slot, "pcb-rename-writer-close-intent", { intent: slot.closeIntent, replayAllowed: false });
      slot.source.beginFinish();
      const receipt = await runtime.requestClosedSessionNormalClose({ ...binding(slot), intent: slot.closeIntent, confirmNormalClose: true });
      slot.closeReceipt = receipt; this.current(slot); slot.journal.state = "pcb-rename-writer-awaiting-termination";
      await this.record(slot, "pcb-rename-writer-close-reply", { receipt }); return summary(slot);
    } catch (error) { return await this.stopAfterFailure(slot, "normal-close", error); }
    finally { this.busy = false; }
  }

  /** Pending termination probes may repeat; snapshot, SQL comparison and
   * release consume their own attempts. Nothing triggers a second rename.
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
        await this.record(slot, "pcb-rename-writer-snapshot-intent", { proof, closeIntent: slot.closeIntent, closeReceipt: slot.closeReceipt });
        slot.snapshot = await captureCurrentPcbRenameFinishSnapshot(this.engine, { baseline: original.baseline, capture: original.capture,
          intent: slot.closeIntent, closeReceipt: slot.closeReceipt, proof, launch: original.launch, runtime: slot.source.sqlRuntime },
        event => { slot.snapshotEvidence.set(event.kind, event.value); if (event.kind === "inventory") { slot.snapshotInventory = event.value; } });
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "pcb-rename-writer-snapshot-result", slot.snapshot); slot.snapshotComplete = true;
      }
      if (!slot.comparisonAttempted && slot.snapshotComplete && slot.postRecorded && slot.clockPlan !== undefined) {
        slot.comparisonAttempted = true;
        const inventory = slot.snapshotInventory; need(inventory !== undefined, "Current PCB rename writer lacks its original complete closed inventory.");
        slot.comparison = await verifyCurrentPcbRenameClockEffect(slot.clockPlan, { engine: this.engine, dispatchOwner: slot.dispatchOwner, terminationProof: proof, after: inventory });
        await this.unchanged(slot); this.closedDispatch(slot);
        const completed = completedCurrentPcbRenameClockSource(slot.clockPlan, this.engine, slot.dispatchOwner, inventory);
        need(completed.preparation === slot.preparation && completed.binding === slot.binding); slot.storedEffect = completed.storedEffect;
        await this.record(slot, "pcb-rename-writer-comparison", { comparison: slot.comparison, originalDispatchOwned: true,
          originalDocumentSamplesRetained: true, persistenceLifecycleComplete: false, persistentUploadReplayExcluded: false, reopened: false });
      }
      if (!slot.recoveryClassificationAttempted) { slot.recoveryClassificationAttempted = true; await this.classifyClosedRecovery(slot); }
      if (!slot.failed && !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded) {
        need(slot.snapshot !== undefined);
        await revalidateCurrentPcbRenameSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
      }
      await this.record(slot, "pcb-rename-writer-retirement-intent", { proof, comparison: slot.comparison ?? null, ...summary(slot) });
      this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof); slot.releaseAttempted = true;
      if (slot.journal.orphanedCallPossible) {
        const authority = slot.journal.executionAuthorityBeforeOrphan; need(authority !== undefined);
        await runtime.releaseCapture(authority); this.current(slot); this.closedDispatch(slot);
      }
      await this.engine.releaseClosedSessionAuthority(original.capture); this.current(slot); this.closedDispatch(slot); await this.unchanged(slot);
      const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        updatedAt: new Date().toISOString(), nextSafeAction: "PCB rename writer retired. No replay, inverse, delete or reopen; fresh inactive upload-cache exclusion and saved-result verification remain required." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); this.current(slot); Object.assign(slot.journal, terminal);
      delete slot.journal.runtimeRestartChallenge; delete slot.journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot); slot.source.retire(); slot.retired = true;
      if (!slot.failed && !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded) {
        this.issueContinuation(slot);
      }
      return Object.freeze({ ...summary(slot), termination: "terminated" });
    } catch (error) { return await this.stopAfterFailure(slot, "termination-or-comparison", error); }
    finally { this.busy = false; }
  }

  private async classifyClosedRecovery(slot: Slot): Promise<void> {
    let basis = "complete-snapshot-unavailable", outcome = "unresolved";
    let exactLogicalSqlUnchanged = false;
    const postEvidenceComplete = slot.postRecorded && slot.clockPlan !== undefined && slot.writeResult !== undefined &&
      slot.beforeClock !== undefined && slot.armedClock !== undefined && slot.afterClock !== undefined;
    if (slot.snapshotComplete && slot.snapshot !== undefined) {
      const original = assertOriginalCurrentPcbRenameSnapshot(slot.snapshot, this.engine); need(original.inventory === slot.snapshotInventory);
      assertOriginalCurrentPcbRenameBaseline(slot.source.original.baseline, this.engine);
      await revalidateCurrentPcbRenameSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
      if (slot.dispatchCaptureCleanupUncertain) { basis = "dispatch-capture-cleanup-uncertain"; }
      else if (slot.dispatchStarted && !postEvidenceComplete) { basis = "original-post-dispatch-evidence-incomplete"; }
      else if (slot.comparison === undefined) {
        // Only the diagnostic equality refusal is caught. Original-owner,
        // Snapshot, journal and closed-dispatch checks remain mandatory.
        try { await compareCompleteClosedSql(slot.source.original.baseline.inventory, original.inventory); exactLogicalSqlUnchanged = true; }
        catch { exactLogicalSqlUnchanged = false; }
        await this.unchanged(slot); this.closedDispatch(slot);
        need(assertOriginalCurrentPcbRenameSnapshot(slot.snapshot, this.engine) === original);
        assertOriginalCurrentPcbRenameBaseline(slot.source.original.baseline, this.engine);
        if (exactLogicalSqlUnchanged) { outcome = "unchanged"; basis = "complete-original-closed-sql-equality"; }
        else { basis = "closed-effect-not-established"; }
      } else {
        need(slot.writeAcknowledged && postEvidenceComplete); outcome = "exact-intended-effect"; basis = "original-complete-clock-and-sql-comparison";
      }
    }
    const result = Object.freeze({ profile: "private.current-pcb-rename-closed-recovery.v1", operationId: slot.owner.operationId,
      outcome, basis, completeClosedSnapshot: slot.snapshotComplete, exactLogicalSqlUnchanged,
      originalPostEvidenceComplete: postEvidenceComplete, originalTransactionComparisonVerified: slot.comparison !== undefined,
      dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, mutationMayHaveOccurred: slot.dispatchStarted,
      writerFailed: slot.failed, executionAuthorized: false, persistenceLifecycleComplete: false,
      verificationContinuationAuthorized: false, inverseAuthorized: false, replayAllowed: false });
    await this.record(slot, "pcb-rename-writer-closed-recovery-classification", result); slot.recoveryClassification = result;
  }

  private issueContinuation(slot: Slot): void {
    const { snapshot, clockPlan, writeInput, writeResult, preparation, storedEffect } = slot;
    need(snapshot !== undefined && clockPlan !== undefined && writeInput !== undefined && writeResult !== undefined &&
      preparation !== undefined && storedEffect !== undefined && slot.continuation === undefined);
    const inventory = assertOriginalCurrentPcbRenameSnapshot(snapshot, this.engine).inventory;
    need(inventory === slot.snapshotInventory);
    const completed = completedCurrentPcbRenameClockSource(clockPlan, this.engine, slot.dispatchOwner, inventory);
    need(completed.preparation === preparation && completed.storedEffect === storedEffect && completed.comparison === slot.comparison);
    const token: CurrentPcbRenameWriterContinuation = Object.freeze({ profile: "private.current-pcb-rename-writer-continuation.v1", operationId: slot.owner.operationId });
    const source: CurrentPcbRenameWriterContinuationSource = Object.freeze({ operationId: token.operationId, snapshot, preparation, storedEffect, clockPlan,
      dispatchOwner: slot.dispatchOwner, writeInput, writeResult, original: slot.source.original, sqlRuntime: slot.source.sqlRuntime, journal: slot.journal });
    const projection = (): unknown => ({ snapshot, preparation, storedEffect, clockPlan, writeInput, writeResult, target: source.original.source.target,
      expectedFingerprint: source.original.source.expectedFingerprint, launch: source.original.launch, capture: source.original.capture, sqlRuntime: source.sqlRuntime });
    const frozen = canonicalJson(projection());
    const current = (): void => {
      need(this.slots.get(token.operationId) === slot && slot.continuation === token && slot.retired && !slot.failed &&
        !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded &&
        slot.snapshot === snapshot && slot.clockPlan === clockPlan && slot.writeInput === writeInput && slot.writeResult === writeResult &&
        slot.preparation === preparation && slot.storedEffect === storedEffect &&
        methods(this.engine).every((method, index) => method === slot.methods[index]) && canonicalJson(projection()) === frozen,
      "PCB verification continuation changed or its writer did not retire successfully.");
      need(assertOriginalCurrentPcbRenameSnapshot(snapshot, this.engine).inventory === inventory &&
        inventoryForOriginalCurrentPcbRenamePreparation(preparation) === slot.source.original.baseline.inventory);
      const result = completedCurrentPcbRenameClockSource(clockPlan, this.engine, slot.dispatchOwner, inventory);
      need(result.preparation === preparation && result.storedEffect === storedEffect && result.comparison === slot.comparison);
    };
    slot.continuation = token; continuations.set(token, { engine: this.engine, source, current, journalText: () => slot.journalText, consumed: false });
    current();
  }
  public getVerificationContinuation(operationId: string): CurrentPcbRenameWriterContinuation {
    const slot = this.slots.get(operationId); need(slot?.continuation !== undefined);
    assertOriginalCurrentPcbRenameWriterContinuation(slot.continuation, this.engine); return slot.continuation;
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
    const slot = this.slots.get(operationId); if (slot !== undefined) { return summary(slot); }
    const reservation = this.reservations.get(operationId); need(reservation !== undefined, "Current PCB rename writer has no original retained operation.");
    return Object.freeze({ profile: PROFILE, operationId, state: "transfer-cleanup-only", ownerRetained: reservation.owner !== undefined,
      cleanupCloseAvailable: reservation.owner !== undefined,
      dispatchAttemptConsumed: true, mutationMayHaveOccurred: false, replayAllowed: false, explicitSaveDispatched: false, executionAuthorized: false });
  }
}

