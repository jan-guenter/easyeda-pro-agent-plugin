/** One-shot SCH title coordinator. Original SCH generation, clocks,
 * native acknowledgment and full closed SQL remain one retained lifecycle.
 */
/* oxlint-disable import/max-dependencies -- Compose original SCH issuers and maintained document-neutral lifecycle checks; no caller-supplied authority callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE } from "./current-schematic-operation.ts";
import { assertCurrentSchematicOpeningExpectation } from "./current-schematic-operation-startup.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { OriginalCurrentSchematicAgedSqlClock } from "./current-schematic-aged-sql-issuer.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertOriginalCurrentSchematicRenameClock, completedCurrentSchematicRenameClockSource,
  recordCurrentSchematicRenameClockPost, verifyCurrentSchematicRenameClockEffect } from "./current-schematic-rename-clock.ts";
import type { CurrentSchematicRenameClockPlan } from "./current-schematic-rename-clock.ts";
import { assertCurrentProjectOnlySchematicRenameGeneration, assertCurrentSchematicRenameWriterOwner, retainedCurrentSchematicRenameWriterOwner,
  revalidateCurrentProjectOnlySchematicRenameGeneration, transferCurrentProjectOnlySchematicRenameGeneration } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentProjectOnlySchematicRenameGeneration, CurrentSchematicRenameWriterOwner, CurrentSchematicRenameWriterOwnerSource } from "./current-schematic-rename-generation-runtime.ts";
import { assertOriginalCurrentSchematicRenameBaseline } from "./current-schematic-rename-owner-baseline.ts";
import { originalCurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import { assertCurrentSchematicRenameSavedReadEligibility } from "./current-schematic-rename-saved-source.ts";
import { CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS, buildCurrentSchematicRenameProgram, decodeCurrentSchematicRenameReply, decodeCurrentSchematicRenameStoppedReply } from "./current-schematic-rename-program.ts";
import type { CurrentSchematicRenameProgramInput, CurrentSchematicRenameProgramResult, CurrentSchematicRenameStoppedResult } from "./current-schematic-rename-program.ts";
import { assertOriginalCurrentSchematicRenameSnapshot, captureCurrentSchematicRenameFinishSnapshot, revalidateCurrentSchematicRenameSnapshot } from "./current-schematic-rename-snapshot.ts";
import type { CurrentSchematicRenameSnapshot, CurrentSchematicRenameSnapshotEvidence } from "./current-schematic-rename-snapshot.ts";
import { assertOriginalCurrentSchematicRenameStartup, revalidateCurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStoredEffect } from "./current-schematic-rename-stored-effect.ts";
import { CURRENT_SCHEMATIC_RENAME_WRITER_DISPATCH_PHASE, assertOriginalCurrentSchematicRenameWriterClock, collectCurrentSchematicRenameWriterClock, currentSchematicRenameWriterClockEvidence,
  retainedCurrentSchematicRenameWriterClockJournal } from "./current-schematic-rename-writer-clock-runtime.ts";
import { assertCurrentSymbolCacheClear } from "./current-symbol-cache-journal.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, IssuedWindowsClockObservation } from "./windows-authority.ts";

const PROFILE = "easyeda-pro-control.current-schematic-rename-writer.v1", WRITE_PHASE = CURRENT_SCHEMATIC_RENAME_WRITER_DISPATCH_PHASE;
type Journal = TrackedDispatchOperationJournal;
type Clock = IssuedWindowsClockObservation;
interface Reservation {
  readonly generation: CurrentProjectOnlySchematicRenameGeneration; readonly startup: CurrentSchematicRenameStartupObservation;
  readonly transferJournal: unknown; readonly methods: readonly unknown[];
  owner?: CurrentSchematicRenameWriterOwner;
}
interface Slot {
  readonly owner: CurrentSchematicRenameWriterOwner; readonly source: CurrentSchematicRenameWriterOwnerSource;
  readonly journal: Journal; readonly dispatchOwner: CurrentSchematicRenameWriterOwner; readonly startup: CurrentSchematicRenameStartupObservation; readonly transferJournal: unknown;
  readonly methods: readonly unknown[]; journalText: string;
  preparation?: CurrentSchematicRenameSqlPreparation; storedEffect?: CurrentSchematicRenameStoredEffect;
  beforeClock?: Clock; armedClock?: Clock; afterClock?: Clock; clockRaw?: unknown; writeRaw?: unknown;
  clockPlan?: CurrentSchematicRenameClockPlan; writeInput?: CurrentSchematicRenameProgramInput;
  writeResult?: CurrentSchematicRenameProgramResult; stoppedResult?: CurrentSchematicRenameStoppedResult;
  dispatchStarted: boolean; writeAcknowledged: boolean; postRecorded: boolean; failed: boolean; dispatchCaptureCleanupUncertain: boolean;
  closeAttempted: boolean; closeIntent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  termination?: ClosedSessionTerminationObservation; snapshotAttempted: boolean; snapshotComplete: boolean;
  readonly snapshotEvidence: Map<CurrentSchematicRenameSnapshotEvidence["kind"], CurrentSchematicRenameSnapshotEvidence["value"]>;
  snapshotInventory?: Extract<CurrentSchematicRenameSnapshotEvidence, { kind: "inventory" }>["value"];
  snapshot?: CurrentSchematicRenameSnapshot; continuation?: CurrentSchematicRenameWriterContinuation;
  comparisonAttempted: boolean; comparison?: Readonly<Record<string, unknown>>;
  recoveryClassificationAttempted: boolean; recoveryClassification?: Readonly<Record<string, unknown>>;
  releaseAttempted: boolean; retired: boolean;
}
export interface CurrentSchematicRenameWriterContinuation {
  readonly profile: "private.current-schematic-rename-writer-continuation.v1";
  readonly operationId: string;
}
export interface CurrentSchematicRenameWriterContinuationSource {
  readonly operationId: string;
  readonly snapshot: CurrentSchematicRenameSnapshot;
  readonly preparation: CurrentSchematicRenameSqlPreparation;
  readonly storedEffect: CurrentSchematicRenameStoredEffect;
  readonly clockPlan: CurrentSchematicRenameClockPlan;
  readonly dispatchOwner: CurrentSchematicRenameWriterOwner;
  readonly writeInput: CurrentSchematicRenameProgramInput;
  readonly writeResult: CurrentSchematicRenameProgramResult;
  readonly original: CurrentSchematicRenameWriterOwnerSource["original"];
  readonly sqlRuntime: CurrentSchematicRenameWriterOwnerSource["sqlRuntime"];
  readonly journal: Journal;
}
const continuations = new WeakMap<object, { readonly engine: EasyedaControlEngine;
  readonly source: CurrentSchematicRenameWriterContinuationSource; readonly current: () => void;
  readonly journalText: () => string; consumed: boolean }>();
function need(condition: boolean, message = "Current SCH rename writer owner or evidence changed."): asserts condition {
  if (!condition) { throw new Error(message); }
}
export function assertOriginalCurrentSchematicRenameWriterContinuation(value: unknown,
  engine: EasyedaControlEngine): CurrentSchematicRenameWriterContinuationSource {
  need(value !== null && typeof value === "object", "Current SCH rename verification needs its original writer continuation.");
  const issued = continuations.get(value);
  need(issued !== undefined && issued.engine === engine, "Current SCH rename verification continuation was not issued by this engine.");
  issued.current(); return issued.source;
}
export async function revalidateCurrentSchematicRenameWriterContinuation(value: CurrentSchematicRenameWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentSchematicRenameWriterContinuationSource> {
  const source = assertOriginalCurrentSchematicRenameWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed, "Current SCH rename verification transfer already consumed.");
  const disk = await loadOperation(source.operationId);
  need(assertOriginalCurrentSchematicRenameWriterContinuation(value, engine) === source && !issued.consumed &&
    canonicalJson(disk) === issued.journalText() && canonicalJson(source.journal) === issued.journalText(),
  "Current SCH rename verification original retired journal changed."); return source;
}
export function transferCurrentSchematicRenameWriterContinuation(value: CurrentSchematicRenameWriterContinuation,
  engine: EasyedaControlEngine): CurrentSchematicRenameWriterContinuationSource {
  const source = assertOriginalCurrentSchematicRenameWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed && canonicalJson(source.journal) === issued.journalText(),
    "Current SCH rename verification transfer already consumed or changed.");
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
function binding(slot: Slot): Omit<Parameters<CurrentSchematicRenameWriterOwnerSource["original"]["source"]["runtime"]["prepareClosedSessionClose"]>[0], "windowHandle"> {
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
    retainedEvidence: { preparation: slot.preparation !== undefined, clockReply: slot.clockRaw !== undefined, writeReply: slot.writeRaw !== undefined,
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

export class CurrentSchematicRenameWriterCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly slots = new Map<string, Slot>();
  private readonly reservations = new Map<string, Reservation>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  private retainSlot(reservation: Reservation, failed: boolean): Slot {
    const { owner } = reservation; need(owner !== undefined, "SCH writer transfer did not retain an owner.");
    const source = assertCurrentSchematicRenameWriterOwner(owner, this.engine); const journal = source.journal;
    const slot: Slot = { owner, source, journal, startup: reservation.startup, transferJournal: reservation.transferJournal,
      dispatchOwner: owner, methods: reservation.methods, journalText: canonicalJson(reservation.transferJournal),
      dispatchStarted: false, writeAcknowledged: false, postRecorded: false, failed, dispatchCaptureCleanupUncertain: false,
      closeAttempted: false, snapshotAttempted: false, snapshotComplete: false, snapshotEvidence: new Map(), comparisonAttempted: false,
      recoveryClassificationAttempted: false, releaseAttempted: false, retired: false };
    this.slots.set(owner.operationId, slot); return slot;
  }
  private cleanupSlot(operationId: string): Slot {
    const slot = this.slots.get(operationId); if (slot !== undefined) { return slot; }
    const reservation = this.reservations.get(operationId); need(reservation !== undefined, "SCH writer has no retained transfer reservation.");
    // No transfer or native write is retried. A previously failed owner assertion
    // Can only make this already-retained token usable for normal closure.
    return this.retainSlot(reservation, true);
  }
  private current(slot: Slot, scopeText?: string): void {
    need(this.slots.get(slot.owner.operationId) === slot && !slot.retired &&
      assertCurrentSchematicRenameWriterOwner(slot.owner, this.engine, scopeText) === slot.source &&
      methods(this.engine).every((method, index) => method === slot.methods[index]) && slot.journal === slot.source.journal);
    assertOriginalCurrentSchematicRenameBaseline(slot.source.original.baseline, this.engine);
    if (slot.preparation !== undefined) { need(originalCurrentSchematicRenameSqlPreparation(slot.preparation, slot.source.original.baseline.inventory, slot.source.original.baseline.metadata) !== undefined); }
  }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "Current SCH rename writer journal changed.");
  }
  private async record(slot: Slot, phase: string, value: unknown, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const prior = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(prior) === slot.journalText, "Current SCH rename writer refused to overwrite a changed journal.");
    const sequence = slot.journal.sequence + 1;
    const artifact = await writePhaseArtifact(slot.owner.operationId, sequence, phase, value);
    this.current(slot, scopeText); slot.journal.sequence = sequence; slot.journal.artifacts.push(artifact);
    slot.journal.updatedAt = new Date().toISOString(); await updateOperation(slot.journal);
    this.current(slot, scopeText); slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot, scopeText);
  }
  private async acceptClear(slot: Slot, marked: Journal, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText); assertCurrentSymbolCacheClear(marked, slot.journal, phase);
    const text = canonicalJson(slot.journal);
    const disk = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(disk) === text && canonicalJson(slot.journal) === text, "Current SCH rename writer cleared journal changed."); slot.journalText = text;
  }
  private async retainEngineFailure(slot: Slot, marked: Journal | undefined, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText);
    if (canonicalJson(slot.journal) === slot.journalText) { await this.unchanged(slot, scopeText); return; }
    need(marked !== undefined, "Current SCH rename writer has no retained mark for engine failure cleanup.");
    await this.acceptClear(slot, marked, phase, scopeText);
    // The durable clear alone does not prove the engine's later native capture
    // Release. Preserve uncertainty rather than retry that consumed release.
    slot.dispatchCaptureCleanupUncertain = true;
  }
  private async stop(slot: Slot, stage: string): Promise<void> {
    slot.failed = true; slot.journal.state = "schematic-rename-writer-stopped"; slot.journal.hardStop = true;
    slot.journal.mutationMayHaveOccurred ||= slot.dispatchStarted;
    slot.journal.nextSafeAction = "Do not replay, Save, inverse, delete or reopen. Retain this original SCH writer for one normal close and complete closed-result inspection.";
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, scope = reader?.call(this.engine.upstream);
    await this.record(slot, "schematic-rename-writer-stopped", { stage, ...summary(slot), transferJournal: slot.transferJournal,
      preparation: slot.preparation ?? null,
      clockCollection: currentSchematicRenameWriterClockEvidence(slot.owner, this.engine) ?? null,
      clockRaw: slot.clockRaw ?? null, writeRaw: slot.writeRaw ?? null,
      writeResult: slot.writeResult ?? null, stoppedResult: slot.stoppedResult ?? null,
      beforeClock: slot.beforeClock ?? null, armedClock: slot.armedClock ?? null, afterClock: slot.afterClock ?? null,
      snapshotEvidence: [...slot.snapshotEvidence] }, scope === undefined ? undefined : canonicalJson(scope));
  }
  private async stopAfterFailure(slot: Slot, stage: string, error: unknown): Promise<never> {
    try { await this.stop(slot, stage); }
    catch (retentionError) {
      throw new AggregateError([error, retentionError], "SCH writer failed; original error, consumed owner and partial evidence remain retained.", { cause: retentionError });
    }
    throw error;
  }
  private retainClockJournal(slot: Slot): void {
    const retained = retainedCurrentSchematicRenameWriterClockJournal(slot.owner, this.engine);
    if (retained !== undefined) { slot.journalText = retained.journalText; slot.dispatchCaptureCleanupUncertain ||= retained.cleanupUncertain; }
  }

  /** Consume the fixed SCH generation once; any later failure leaves normal
   * closure and evidence inspection with this same retained coordinator.
   */
  public async execute(generation: CurrentProjectOnlySchematicRenameGeneration, startup: CurrentSchematicRenameStartupObservation,
    agedHead?: OriginalCurrentSchematicAgedSqlClock): Promise<Readonly<Record<string, unknown>>> {
    need(!this.busy && !this.slots.has(generation.operationId) && !this.reservations.has(generation.operationId), "Current SCH rename writer attempt already consumed or busy.");
    this.busy = true; let slot: Slot | undefined;
    try {
      const original = assertCurrentProjectOnlySchematicRenameGeneration(generation, this.engine);
      need(original.source.purpose === "disposable-validation" || original.source.purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE);
      if (original.source.purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE) {
        assertCurrentSchematicOpeningExpectation(original.source.schematicExpectation, original.baseline.metadata, original.baseline.children);
      }
      assertCurrentSchematicRenameSavedReadEligibility(original.baseline.metadata, original.baseline.inventory);
      assertOriginalCurrentSchematicRenameStartup(startup, this.engine, generation);
      await revalidateCurrentSchematicRenameStartupObservation(startup, this.engine, generation);
      await revalidateCurrentProjectOnlySchematicRenameGeneration(generation, this.engine);
      need(assertCurrentProjectOnlySchematicRenameGeneration(generation, this.engine) === original);
      const fingerprint = original.source.expectedFingerprint;
      assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
      await verifyCurrentProjectOnlySymbolPreflightImplementation(fingerprint.installedBundles.assetsRoot);
      await verifyCurrentSymbolPersistenceImplementation(fingerprint.installedBundles.assetsRoot);
      await this.engine.assertBridgeDispatchAllowed(); await this.engine.assertRecoveryOperationIsolated(generation.operationId);
      await revalidateCurrentSchematicRenameStartupObservation(startup, this.engine, generation);
      const beforeJournal = await loadOperation(generation.operationId);
      const reservation: Reservation = { generation, startup, transferJournal: beforeJournal, methods: methods(this.engine) };
      this.reservations.set(generation.operationId, reservation);
      try { reservation.owner = transferCurrentProjectOnlySchematicRenameGeneration(generation, this.engine); }
      finally {
        // The issuer may fail its final guard after committing the transfer.
        // Retain that exact owner before attempting another fallible assertion.
        const retained = retainedCurrentSchematicRenameWriterOwner(generation, this.engine);
        if (retained !== undefined) { reservation.owner = retained; }
      }
      slot = this.retainSlot(reservation, false); const journal = slot.journal;
      need(canonicalJson(journal) === slot.journalText); await this.unchanged(slot);
      journal.plan = { profile: PROFILE, purpose: journal.plan["purpose"], baselinePlan: structuredClone(journal.plan), baselineJournalSha256: sha256Json(beforeJournal),
        baselineCopyReceiptSha256: original.baseline.copy.receiptSha256, intentSha256: sha256Json(original.baseline.intent), startupSha256: sha256Json(startup) };
      journal.planHash = buildPlanHash(journal.plan); journal.state = "schematic-rename-writer-preparing"; journal.hardStop = true;
      journal.nextSafeAction = "Retain the original one-shot SCH writer; no public writer, Save, replay, inverse, delete or reopen is enabled.";
      await this.record(slot, "schematic-rename-writer-ownership-transfer", { beforeJournal, capture: original.capture, launch: original.launch,
        startup, intent: original.baseline.intent, executionAuthorized: false });
      const retained = slot, scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(scope !== undefined, "Current SCH rename writer requires an authenticated dispatch scope.");
      await scope.call(this.engine.upstream, async lease => {
        const scopeText = canonicalJson(lease); this.current(retained, scopeText); await this.run(retained, agedHead, scopeText);
      });
      await this.unchanged(retained); need(retained.postRecorded && retained.writeAcknowledged);
      retained.journal.state = "schematic-rename-writer-returned"; await this.record(retained, "schematic-rename-writer-returned", summary(retained)); return summary(retained);
    } catch (error) {
      if (slot !== undefined) {
        slot.failed = true;
        // A failed N0 read may have appended its own durable failure evidence.
        // It cannot supply writer authority, only its exact last journal state.
        if (slot.clockPlan === undefined) {
          try {
            this.retainClockJournal(slot);
          } catch (retentionError) {
            return await this.stopAfterFailure(slot, "clock-journal-handoff", new AggregateError([error, retentionError],
              "SCH clock failure and refused journal handoff remain retained.", { cause: retentionError }));
          }
        }
        return await this.stopAfterFailure(slot, "dispatch", error);
      }
      throw error;
    } finally { this.busy = false; }
  }

  /** A returned identity is retained synchronously before any later native
   * clock observation or journal I/O. Even an invalid ACK cannot lose it.
   */
  private static retainWriteReply(slot: Slot, raw: unknown): void {
    slot.writeRaw = raw; need(slot.writeInput !== undefined && slot.preparation !== undefined);
    try {
      slot.writeResult = decodeCurrentSchematicRenameReply(raw, slot.preparation, slot.source.original.baseline.inventory, slot.source.original.baseline.metadata, slot.source.original.baseline.children, slot.writeInput); slot.writeAcknowledged = true;
    } catch (error) {
      try { slot.stoppedResult = decodeCurrentSchematicRenameStoppedReply(raw, slot.preparation, slot.source.original.baseline.inventory, slot.source.original.baseline.metadata, slot.source.original.baseline.children, slot.writeInput); }
      catch { throw error; }
      throw new Error(`Native SCH rename stopped at ${slot.stoppedResult.failureStage}; original acknowledgment remains retained.`, { cause: error });
    }
  }

  private async run(slot: Slot, agedHead: OriginalCurrentSchematicAgedSqlClock | undefined, scopeText: string): Promise<void> {
    const { original, generation } = slot.source;
    const startup = assertOriginalCurrentSchematicRenameStartup(slot.startup, this.engine, generation);
    const expectedActor = startup.observation.runtimeObservation.actor;
    await this.unchanged(slot, scopeText); await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    await revalidateCurrentSchematicRenameStartupObservation(slot.startup, this.engine, generation); this.current(slot, scopeText);
    const observed = await collectCurrentSchematicRenameWriterClock(this.engine, slot.owner, slot.startup, agedHead);
    const clock = assertOriginalCurrentSchematicRenameWriterClock(observed, this.engine, slot.owner);
    need(clock.source === slot.source && clock.startup === slot.startup);
    slot.beforeClock = clock.beforeClock; slot.armedClock = clock.armedClock; slot.clockRaw = clock.raw; slot.clockPlan = clock.clockPlan;
    // The collector owns its exact append/mark sequence. Adopt only the
    // Original successful issuer's journal text, then independently reread it.
    slot.journalText = clock.journalText; await this.unchanged(slot, scopeText);
    const prepared = assertOriginalCurrentSchematicRenameClock(slot.clockPlan, this.engine, generation, slot.startup, slot.dispatchOwner);
    slot.preparation = prepared.preparation;
    need(assertOriginalCurrentSchematicRenameStartup(slot.startup, this.engine, generation) === startup);
    slot.writeInput = Object.freeze({ expectedActor, rendererTimezoneOffsetMinutes: clock.documentBefore.rendererTimezoneOffsetMinutes });
    const code = buildCurrentSchematicRenameProgram(slot.preparation, original.baseline.inventory, original.baseline.metadata, original.baseline.children, slot.writeInput);
    slot.journal.state = "schematic-rename-writer-dispatching"; slot.journal.mutationMayHaveOccurred = true;
    await this.record(slot, "schematic-rename-writer-dispatch-intent", { input: slot.writeInput, preparation: slot.preparation,
      clockPlan: slot.clockPlan, clockObservation: observed, clockRaw: clock.raw, beforeClock: slot.beforeClock, armedClock: slot.armedClock,
      codeSha256: sha256Text(code), replayAllowed: false }, scopeText);
    const { dispatch } = clock;
    // The original N0 mark remains held. A new capture here would invalidate
    // The Windows clock observations' original supervisor epoch.
    await this.unchanged(slot, scopeText);
    // The fixed compiler checks the original deadlines, actor and whole SCH map
    // Immediately before the sole updateData call. No host await remains here.
    this.current(slot, scopeText);
    // Recheck retained observations synchronously after the last host await.
    // An intervening capture must refuse before mutation, never resample N0.
    need(assertOriginalCurrentSchematicRenameClock(slot.clockPlan, this.engine, generation, slot.startup, slot.dispatchOwner) === prepared);
    slot.dispatchStarted = true;
    const writeRaw = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS + 5000, confirmWrite: true },
      CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS + 15_000, dispatch.binding);
    CurrentSchematicRenameWriterCoordinator.retainWriteReply(slot, writeRaw); this.current(slot, scopeText);
    slot.afterClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    await this.record(slot, "schematic-rename-writer-dispatch-reply", { raw: writeRaw, result: slot.writeResult, afterClock: slot.afterClock }, scopeText);
    need(slot.writeResult !== undefined);
    await recordCurrentSchematicRenameClockPost(slot.clockPlan, { engine: this.engine, generation, startup: slot.startup, dispatchOwner: slot.dispatchOwner,
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
      slot.journal.state = "schematic-rename-writer-close-dispatching"; await this.record(slot, "schematic-rename-writer-close-intent", { intent: slot.closeIntent, replayAllowed: false });
      slot.source.beginFinish();
      const receipt = await runtime.requestClosedSessionNormalClose({ ...binding(slot), intent: slot.closeIntent, confirmNormalClose: true });
      slot.closeReceipt = receipt; this.current(slot); slot.journal.state = "schematic-rename-writer-awaiting-termination";
      await this.record(slot, "schematic-rename-writer-close-reply", { receipt }); return summary(slot);
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
        await this.record(slot, "schematic-rename-writer-snapshot-intent", { proof, closeIntent: slot.closeIntent, closeReceipt: slot.closeReceipt });
        slot.snapshot = await captureCurrentSchematicRenameFinishSnapshot(this.engine, { baseline: original.baseline, capture: original.capture,
          intent: slot.closeIntent, closeReceipt: slot.closeReceipt, proof, launch: original.launch, runtime: slot.source.sqlRuntime },
        event => { slot.snapshotEvidence.set(event.kind, event.value); if (event.kind === "inventory") { slot.snapshotInventory = event.value; } });
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "schematic-rename-writer-snapshot-result", slot.snapshot); slot.snapshotComplete = true;
      }
      if (!slot.comparisonAttempted && slot.snapshotComplete && slot.postRecorded && slot.clockPlan !== undefined) {
        slot.comparisonAttempted = true;
        const inventory = slot.snapshotInventory; need(inventory !== undefined, "Current SCH rename writer lacks its original complete closed inventory.");
        slot.comparison = await verifyCurrentSchematicRenameClockEffect(slot.clockPlan, { engine: this.engine, dispatchOwner: slot.dispatchOwner, terminationProof: proof, after: inventory });
        await this.unchanged(slot); this.closedDispatch(slot);
        const completed = completedCurrentSchematicRenameClockSource(slot.clockPlan, this.engine, slot.dispatchOwner, inventory);
        need(completed.preparation === slot.preparation); slot.storedEffect = completed.storedEffect;
        await this.record(slot, "schematic-rename-writer-comparison", { comparison: slot.comparison, originalDispatchOwned: true,
          originalDocumentSamplesRetained: true, persistenceLifecycleComplete: false, persistentUploadReplayExcluded: false, reopened: false });
      }
      if (!slot.recoveryClassificationAttempted) { slot.recoveryClassificationAttempted = true; await this.classifyClosedRecovery(slot); }
      if (!slot.failed && !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded) {
        need(slot.snapshot !== undefined);
        await revalidateCurrentSchematicRenameSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
      }
      await this.record(slot, "schematic-rename-writer-retirement-intent", { proof, comparison: slot.comparison ?? null, ...summary(slot) });
      this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof); slot.releaseAttempted = true;
      if (slot.journal.orphanedCallPossible) {
        const authority = slot.journal.executionAuthorityBeforeOrphan; need(authority !== undefined);
        await runtime.releaseCapture(authority); this.current(slot); this.closedDispatch(slot);
      }
      await this.engine.releaseClosedSessionAuthority(original.capture); this.current(slot); this.closedDispatch(slot); await this.unchanged(slot);
      const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        updatedAt: new Date().toISOString(), nextSafeAction: "SCH rename writer retired. No replay, inverse, delete or reopen; fresh inactive upload-cache exclusion and saved-result verification remain required." };
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
      const original = assertOriginalCurrentSchematicRenameSnapshot(slot.snapshot, this.engine); need(original.inventory === slot.snapshotInventory);
      assertOriginalCurrentSchematicRenameBaseline(slot.source.original.baseline, this.engine);
      await revalidateCurrentSchematicRenameSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
      if (slot.dispatchCaptureCleanupUncertain) { basis = "dispatch-capture-cleanup-uncertain"; }
      else if (slot.dispatchStarted && !postEvidenceComplete) { basis = "original-post-dispatch-evidence-incomplete"; }
      else if (slot.comparison === undefined) {
        // Only the diagnostic equality refusal is caught. Original-owner,
        // Snapshot, journal and closed-dispatch checks remain mandatory.
        try { await compareCompleteClosedSql(slot.source.original.baseline.inventory, original.inventory); exactLogicalSqlUnchanged = true; }
        catch { exactLogicalSqlUnchanged = false; }
        await this.unchanged(slot); this.closedDispatch(slot);
        need(assertOriginalCurrentSchematicRenameSnapshot(slot.snapshot, this.engine) === original);
        assertOriginalCurrentSchematicRenameBaseline(slot.source.original.baseline, this.engine);
        if (exactLogicalSqlUnchanged) { outcome = "unchanged"; basis = "complete-original-closed-sql-equality"; }
        else { basis = "closed-effect-not-established"; }
      } else {
        need(slot.writeAcknowledged && postEvidenceComplete); outcome = "exact-intended-effect"; basis = "original-complete-clock-and-sql-comparison";
      }
    }
    const result = Object.freeze({ profile: "private.current-schematic-rename-closed-recovery.v1", operationId: slot.owner.operationId,
      outcome, basis, completeClosedSnapshot: slot.snapshotComplete, exactLogicalSqlUnchanged,
      originalPostEvidenceComplete: postEvidenceComplete, originalTransactionComparisonVerified: slot.comparison !== undefined,
      dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, mutationMayHaveOccurred: slot.dispatchStarted,
      writerFailed: slot.failed, executionAuthorized: false, persistenceLifecycleComplete: false,
      verificationContinuationAuthorized: false, inverseAuthorized: false, replayAllowed: false });
    await this.record(slot, "schematic-rename-writer-closed-recovery-classification", result); slot.recoveryClassification = result;
  }

  private issueContinuation(slot: Slot): void {
    const { snapshot, clockPlan, writeInput, writeResult, preparation, storedEffect } = slot;
    need(snapshot !== undefined && clockPlan !== undefined && writeInput !== undefined && writeResult !== undefined &&
      preparation !== undefined && storedEffect !== undefined && slot.continuation === undefined);
    const inventory = assertOriginalCurrentSchematicRenameSnapshot(snapshot, this.engine).inventory;
    need(inventory === slot.snapshotInventory);
    const completed = completedCurrentSchematicRenameClockSource(clockPlan, this.engine, slot.dispatchOwner, inventory);
    need(completed.preparation === preparation && completed.storedEffect === storedEffect && completed.comparison === slot.comparison);
    const token: CurrentSchematicRenameWriterContinuation = Object.freeze({ profile: "private.current-schematic-rename-writer-continuation.v1", operationId: slot.owner.operationId });
    const source: CurrentSchematicRenameWriterContinuationSource = Object.freeze({ operationId: token.operationId, snapshot, preparation, storedEffect, clockPlan,
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
      "SCH verification continuation changed or its writer did not retire successfully.");
      need(assertOriginalCurrentSchematicRenameSnapshot(snapshot, this.engine).inventory === inventory &&
        originalCurrentSchematicRenameSqlPreparation(preparation, slot.source.original.baseline.inventory, slot.source.original.baseline.metadata) !== undefined);
      const result = completedCurrentSchematicRenameClockSource(clockPlan, this.engine, slot.dispatchOwner, inventory);
      need(result.preparation === preparation && result.storedEffect === storedEffect && result.comparison === slot.comparison);
    };
    slot.continuation = token; continuations.set(token, { engine: this.engine, source, current, journalText: () => slot.journalText, consumed: false });
    current();
  }
  public getVerificationContinuation(operationId: string): CurrentSchematicRenameWriterContinuation {
    const slot = this.slots.get(operationId); need(slot?.continuation !== undefined);
    assertOriginalCurrentSchematicRenameWriterContinuation(slot.continuation, this.engine); return slot.continuation;
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
    const reservation = this.reservations.get(operationId); need(reservation !== undefined, "Current SCH rename writer has no original retained operation.");
    return Object.freeze({ profile: PROFILE, operationId, state: "transfer-cleanup-only", ownerRetained: reservation.owner !== undefined,
      cleanupCloseAvailable: reservation.owner !== undefined,
      dispatchAttemptConsumed: true, mutationMayHaveOccurred: false, replayAllowed: false, explicitSaveDispatched: false, executionAuthorized: false });
  }
}
