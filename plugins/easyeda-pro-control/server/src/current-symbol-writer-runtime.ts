/** Private one-shot writer. No tool registers this coordinator. Its original
 * startup issuer is required; supplied flags, clocks or replies cannot arm it.
 */
/* oxlint-disable import/max-dependencies -- Compose the existing original lifecycle, source, clock, compiler and complete SQL owners without alternate verifier callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { qualifyCurrentAgedSqlHead } from "./current-aged-sql-issuer.ts";
import type { OriginalCurrentAgedSqlClock } from "./current-aged-sql-issuer.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { buildCurrentProjectOnlySymbolPreflightProgram, currentProjectOnlySymbolPreflightRequestSchema, decodeCurrentProjectOnlySymbolPreflightReply } from "./current-project-only-symbol-preflight.ts";
import type { CurrentProjectOnlySymbolPreflightResult } from "./current-project-only-symbol-preflight.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { assertOriginalCurrentSymbolBaselineCopy, assertOriginalCurrentSymbolFinishSnapshot, captureCurrentSymbolFinishSnapshot, revalidateCurrentSymbolFinishSnapshot } from "./current-symbol-baseline-copy.ts";
import type { CurrentSymbolFinishSnapshot, CurrentSymbolFinishSnapshotEvidence } from "./current-symbol-baseline-copy.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { assertCurrentProjectOnlySymbolGeneration, assertCurrentSymbolWriterOwner, revalidateCurrentProjectOnlySymbolGeneration, transferCurrentProjectOnlySymbolGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolGeneration, CurrentSymbolWriterOwner, CurrentSymbolWriterOwnerSource } from "./current-symbol-baseline-runtime.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { assertCurrentSymbolWriterStartup, revalidateCurrentSymbolWriterStartup } from "./current-symbol-startup-runtime.ts";
import { prepareCurrentSymbolTransactionClock, recordCurrentSymbolTransactionClockPost, verifyCurrentSymbolTransactionClock } from "./current-symbol-transaction-clock.ts";
import type { CurrentSymbolTransactionClockPlan } from "./current-symbol-transaction-clock.ts";
import { CURRENT_SYMBOL_WRITE_TIMEOUT_MS, CURRENT_SYMBOL_WRITE_TIME_CEILING, CURRENT_SYMBOL_WRITE_WINDOW_MS,
  buildCurrentSymbolWriteProgram, decodeCurrentSymbolWriteReply } from "./current-symbol-write-program.ts";
import type { CurrentSymbolWriteProgramInput, CurrentSymbolWriteProgramResult } from "./current-symbol-write-program.ts";
import { buildCurrentSymbolWriterClockProgram, decodeCurrentSymbolWriterClockReply } from "./current-symbol-writer-clock-program.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, IssuedWindowsClockObservation } from "./windows-authority.ts";

const PROFILE = "easyeda-pro-control.current-symbol-writer.v1";
const WRITE_PHASE = "current-symbol-writer-once";
type Journal = TrackedDispatchOperationJournal;
type Clock = IssuedWindowsClockObservation;
interface Slot {
  readonly owner: CurrentSymbolWriterOwner; readonly source: CurrentSymbolWriterOwnerSource;
  readonly journal: Journal; readonly dispatchOwner: object; readonly startup: unknown;
  readonly transferJournal: unknown;
  readonly methods: readonly unknown[]; journalText: string;
  preflightRaw?: unknown; preflight?: CurrentProjectOnlySymbolPreflightResult;
  beforeClock?: Clock; armedClock?: Clock; afterClock?: Clock; clockRaw?: unknown; writeRaw?: unknown;
  clockPlan?: CurrentSymbolTransactionClockPlan; writeInput?: CurrentSymbolWriteProgramInput; writeResult?: CurrentSymbolWriteProgramResult;
  dispatchStarted: boolean; writeAcknowledged: boolean; postRecorded: boolean; failed: boolean; dispatchCaptureCleanupUncertain: boolean;
  closeAttempted: boolean; closeIntent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  termination?: ClosedSessionTerminationObservation; snapshotAttempted: boolean; snapshotComplete: boolean;
  readonly snapshotEvidence: Map<CurrentSymbolFinishSnapshotEvidence["kind"], CurrentSymbolFinishSnapshotEvidence["value"]>;
  snapshotInventory?: Extract<CurrentSymbolFinishSnapshotEvidence, { kind: "inventory" }>["value"];
  snapshot?: CurrentSymbolFinishSnapshot; continuation?: CurrentSymbolWriterContinuation;
  comparisonAttempted: boolean; comparison?: Readonly<Record<string, unknown>>;
  recoveryClassificationAttempted: boolean; recoveryClassification?: Readonly<Record<string, unknown>>;
  releaseAttempted: boolean; retired: boolean;
}
export interface CurrentSymbolWriterContinuation {
  readonly profile: "private.current-symbol-writer-continuation.v1";
  readonly operationId: string;
}
export interface CurrentSymbolWriterContinuationSource {
  readonly operationId: string;
  readonly snapshot: CurrentSymbolFinishSnapshot;
  readonly clockPlan: CurrentSymbolTransactionClockPlan;
  readonly dispatchOwner: object;
  readonly writeInput: CurrentSymbolWriteProgramInput;
  readonly original: CurrentSymbolWriterOwnerSource["original"];
  readonly sqlRuntime: CurrentSymbolWriterOwnerSource["sqlRuntime"];
  readonly journal: Journal;
}
const continuations = new WeakMap<object, { readonly engine: EasyedaControlEngine;
  readonly source: CurrentSymbolWriterContinuationSource; readonly current: () => void;
  readonly journalText: () => string; consumed: boolean }>();

/** A successful original writer alone issues this continuation. JSON copies,
 * failed writes and partial retirement never acquire reopening authority.
 */
export function assertOriginalCurrentSymbolWriterContinuation(value: unknown,
  engine: EasyedaControlEngine): CurrentSymbolWriterContinuationSource {
  need(value !== null && typeof value === "object", "Current symbol verification needs its original writer continuation.");
  const issued = continuations.get(value);
  need(issued !== undefined && issued.engine === engine, "Current symbol verification continuation was not issued by this engine.");
  issued.current(); return issued.source;
}
export async function revalidateCurrentSymbolWriterContinuation(value: CurrentSymbolWriterContinuation,
  engine: EasyedaControlEngine): Promise<CurrentSymbolWriterContinuationSource> {
  const source = assertOriginalCurrentSymbolWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed, "Current symbol verification transfer already consumed.");
  const disk = await loadOperation(source.operationId);
  need(assertOriginalCurrentSymbolWriterContinuation(value, engine) === source && !issued.consumed &&
    canonicalJson(disk) === issued.journalText() && canonicalJson(source.journal) === issued.journalText(),
  "Current symbol verification original retired journal changed.");
  return source;
}
export function transferCurrentSymbolWriterContinuation(value: CurrentSymbolWriterContinuation,
  engine: EasyedaControlEngine): CurrentSymbolWriterContinuationSource {
  const source = assertOriginalCurrentSymbolWriterContinuation(value, engine);
  const issued = continuations.get(value);
  need(issued !== undefined && !issued.consumed && canonicalJson(source.journal) === issued.journalText(),
    "Current symbol verification transfer already consumed or changed.");
  issued.consumed = true; return source;
}
function need(condition: boolean, message = "Current symbol writer owner or evidence changed."): asserts condition { if (!condition) { throw new Error(message); } }
function methods(engine: EasyedaControlEngine): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity only; every invocation below retains its original receiver. */
  return [engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk, engine.freshClockObservationForClosedCapture,
    engine.dispatchWithOrphanTracking, engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated,
    engine.upstream.callTool, engine.upstream.withAuthenticatedBridgeDispatchScope,
    engine.upstream.currentAuthenticatedBridgeDispatchBinding, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
  /* oxlint-enable typescript/unbound-method */
}
function binding(slot: Slot): Omit<Parameters<CurrentSymbolWriterOwnerSource["original"]["source"]["runtime"]["prepareClosedSessionClose"]>[0], "windowHandle"> {
  const capture = slot.source.original.capture;
  return { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
}
function summary(slot: Slot): Readonly<Record<string, unknown>> {
  return Object.freeze({ profile: PROFILE, operationId: slot.owner.operationId, state: slot.journal.state,
    dispatchAttemptConsumed: true, mutationMayHaveOccurred: slot.dispatchStarted, writeAcknowledged: slot.writeAcknowledged,
    originalClockRepliesRetained: slot.clockRaw !== undefined && slot.writeRaw !== undefined,
    originalWindowsSamplesRetained: slot.beforeClock !== undefined && slot.armedClock !== undefined && slot.afterClock !== undefined,
    retainedEvidence: { preflightReply: slot.preflightRaw !== undefined, clockReply: slot.clockRaw !== undefined,
      writeReply: slot.writeRaw !== undefined, beforeClock: slot.beforeClock !== undefined,
      armedClock: slot.armedClock !== undefined, afterClock: slot.afterClock !== undefined },
    postRecorded: slot.postRecorded, closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined,
    finishObservationAvailable: slot.closeIntent !== undefined && slot.closeReceipt !== undefined && !slot.releaseAttempted && !slot.retired,
    snapshotAttempted: slot.snapshotAttempted, snapshotComplete: slot.snapshotComplete,
    comparisonAttempted: slot.comparisonAttempted, comparison: slot.comparison === undefined ? null : structuredClone(slot.comparison),
    recoveryClassificationAttempted: slot.recoveryClassificationAttempted,
    recoveryClassification: slot.recoveryClassification === undefined ? null : structuredClone(slot.recoveryClassification),
    failed: slot.failed, retired: slot.retired, verificationContinuationRetained: slot.continuation !== undefined,
    dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain,
    replayAllowed: false, explicitSaveDispatched: false,
    persistentUploadReplayExcluded: false, reopened: false, inverseValidated: false, executionAuthorized: false });
}

export class CurrentSymbolWriterCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }

  private current(slot: Slot, scopeText?: string): void {
    need(this.slots.get(slot.owner.operationId) === slot && !slot.retired &&
      assertCurrentSymbolWriterOwner(slot.owner, this.engine, scopeText) === slot.source &&
      methods(this.engine).every((method, index) => method === slot.methods[index]) && slot.journal === slot.source.journal);
  }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const saved = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === slot.journalText && canonicalJson(slot.journal) === slot.journalText,
      "Current symbol writer journal changed.");
  }
  private async record(slot: Slot, phase: string, value: unknown, scopeText?: string): Promise<void> {
    this.current(slot, scopeText);
    const previous = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(previous) === slot.journalText, "Current symbol writer refused to overwrite a changed journal.");
    slot.journal.sequence += 1;
    const artifact = await writePhaseArtifact(slot.owner.operationId, slot.journal.sequence, phase, value);
    this.current(slot, scopeText); slot.journal.artifacts.push(artifact);
    slot.journal.updatedAt = new Date().toISOString(); await updateOperation(slot.journal);
    this.current(slot, scopeText); slot.journalText = canonicalJson(slot.journal);
    await this.unchanged(slot, scopeText);
  }
  private async acceptMark(slot: Slot, before: Journal, phase: string, scopeText: string): Promise<Journal> {
    this.current(slot, scopeText);
    const lease = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); need(lease !== undefined);
    assertCurrentSymbolCacheMark(before, slot.journal, { phase, bridgeDispatch: lease,
      capture: slot.source.original.capture, launch: slot.source.original.launch });
    const text = canonicalJson(slot.journal);
    const saved = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === text && canonicalJson(slot.journal) === text, "Current symbol writer marked journal changed.");
    slot.journalText = text; return structuredClone(slot.journal);
  }
  private async acceptClear(slot: Slot, marked: Journal, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText); assertCurrentSymbolCacheClear(marked, slot.journal, phase);
    const text = canonicalJson(slot.journal);
    const saved = await loadOperation(slot.owner.operationId); this.current(slot, scopeText);
    need(canonicalJson(saved) === text && canonicalJson(slot.journal) === text, "Current symbol writer cleared journal changed.");
    slot.journalText = text;
  }
  private async retainEngineFailure(slot: Slot, marked: Journal | undefined, phase: string, scopeText: string): Promise<void> {
    this.current(slot, scopeText);
    if (canonicalJson(slot.journal) === slot.journalText) { await this.unchanged(slot, scopeText); return; }
    // The maintained engine can durably clear, then throw while releasing its
    // Capture. Admit only that exact transition, never arbitrary loaded history.
    need(marked !== undefined, "Current symbol writer has no retained mark for engine failure cleanup.");
    await this.acceptClear(slot, marked, phase, scopeText);
    // A durable clear does not prove the engine's later native capture release
    // Completed. Preserve uncertainty; that one-shot release must not repeat.
    slot.dispatchCaptureCleanupUncertain = true;
  }
  private async stop(slot: Slot, stage: string): Promise<void> {
    slot.failed = true; slot.journal.state = "writer-stopped"; slot.journal.hardStop = true;
    slot.journal.mutationMayHaveOccurred ||= slot.dispatchStarted;
    slot.journal.nextSafeAction = "Do not replay, Save or reopen. Retain this original writer for one normal close and complete closed-result inspection.";
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    const scope = reader?.call(this.engine.upstream);
    await this.record(slot, "writer-stopped", { stage, ...summary(slot),
      transferJournal: slot.transferJournal,
      preflightRaw: slot.preflightRaw ?? null, clockRaw: slot.clockRaw ?? null, writeRaw: slot.writeRaw ?? null,
      beforeClock: slot.beforeClock ?? null, armedClock: slot.armedClock ?? null, afterClock: slot.afterClock ?? null,
      snapshotEvidence: [...slot.snapshotEvidence] }, scope === undefined ? undefined : canonicalJson(scope));
  }

  /** Requires an original qualified startup before consuming the baseline.
   * The transfer replaces only the mutable operation plan, not old artifacts.
   * Any failure after transfer leaves closure exclusively with this instance.
   */
  public async execute(generation: CurrentProjectOnlySymbolGeneration, startup: unknown,
    agedHead?: OriginalCurrentAgedSqlClock): Promise<Readonly<Record<string, unknown>>> {
    need(!this.busy && !this.slots.has(generation.operationId), "Current symbol writer attempt already consumed or busy.");
    this.busy = true;
    let slot: Slot | undefined;
    try {
      const original = assertCurrentProjectOnlySymbolGeneration(generation, this.engine);
      assertCurrentSymbolWriterStartup(startup, this.engine, generation);
      await revalidateCurrentSymbolWriterStartup(startup, this.engine, generation);
      await revalidateCurrentProjectOnlySymbolGeneration(generation, this.engine);
      need(assertCurrentProjectOnlySymbolGeneration(generation, this.engine) === original);
      const fingerprint = original.source.expectedFingerprint;
      assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
      await verifyCurrentProjectOnlySymbolPreflightImplementation(fingerprint.installedBundles.assetsRoot);
      await verifyCurrentSymbolPersistenceImplementation(fingerprint.installedBundles.assetsRoot);
      await this.engine.assertBridgeDispatchAllowed();
      await this.engine.assertRecoveryOperationIsolated(generation.operationId);
      await revalidateCurrentSymbolWriterStartup(startup, this.engine, generation);
      const beforeJournal = await loadOperation(generation.operationId);
      const owner = transferCurrentProjectOnlySymbolGeneration(generation, this.engine);
      const source = assertCurrentSymbolWriterOwner(owner, this.engine);
      const journal = source.journal;
      slot = { owner, source, journal, startup, transferJournal: beforeJournal, dispatchOwner: Object.freeze({}), methods: methods(this.engine),
        journalText: canonicalJson(journal), dispatchStarted: false, writeAcknowledged: false, postRecorded: false, failed: false, dispatchCaptureCleanupUncertain: false,
        closeAttempted: false, snapshotAttempted: false, snapshotComplete: false, snapshotEvidence: new Map(), comparisonAttempted: false,
        recoveryClassificationAttempted: false, releaseAttempted: false, retired: false };
      this.slots.set(owner.operationId, slot);
      need(canonicalJson(beforeJournal) === slot.journalText);
      journal.plan = { profile: PROFILE, baselinePlan: structuredClone(journal.plan), baselineJournalSha256: sha256Json(beforeJournal),
        baselineCopyReceiptSha256: original.baseline.copy.receiptSha256, startupSha256: sha256Json(startup) };
      journal.planHash = buildPlanHash(journal.plan); journal.state = "writer-preparing"; journal.hardStop = true;
      journal.nextSafeAction = "Retain the original one-shot writer; no public writer, Save, replay or reopen is enabled.";
      await this.record(slot, "writer-ownership-transfer", { beforeJournal, capture: original.capture, launch: original.launch,
        startup, executionAuthorized: false });
      const retained = slot;
      const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(scope !== undefined, "Current symbol writer requires an authenticated dispatch scope.");
      await scope.call(this.engine.upstream, async (lease) => {
        const scopeText = canonicalJson(lease); this.current(retained, scopeText);
        await this.run(retained, agedHead, scopeText);
      });
      await this.unchanged(retained);
      need(retained.postRecorded && retained.writeAcknowledged);
      retained.journal.state = "writer-returned";
      await this.record(retained, "writer-returned", summary(retained));
      return summary(retained);
    } catch (error) {
      if (slot !== undefined) {
        try { await this.stop(slot, "dispatch"); }
        catch (retentionError) { throw new AggregateError([error, retentionError], "Current symbol writer failed; its consumed owner and partial evidence remain retained.", { cause: retentionError }); }
      }
      throw error;
    } finally { this.busy = false; }
  }

  private async run(slot: Slot, agedHead: OriginalCurrentAgedSqlClock | undefined, scopeText: string): Promise<void> {
    const { original, generation } = slot.source, { baseline } = original;
    const projection = original.originalPreparation.closedTargetWitness.observation.value;
    const request = currentProjectOnlySymbolPreflightRequestSchema.parse({ target: baseline.preparation.target,
      expectedBefore: { name: projection.name, description: projection.description, tagsJson: projection.tagsJson,
        source: projection.source, version: projection.version, ticket: projection.ticket } });
    need(canonicalJson({ name: projection.name, description: projection.description, source: projection.source, tags: JSON.parse(projection.tagsJson) as unknown }) ===
      canonicalJson(baseline.preparation.metadata.before), "Current symbol writer baseline metadata differs from its original observation.");
    await this.unchanged(slot, scopeText);
    await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    const preflightCode = buildCurrentProjectOnlySymbolPreflightProgram(request);
    await this.record(slot, "writer-preflight-intent", { request, codeSha256: sha256Text(preflightCode) }, scopeText);
    const beforeMark = structuredClone(slot.journal);
    let marked: Journal | undefined;
    let raw: unknown;
    try {
      raw = await this.engine.dispatchWithOrphanTracking(slot.journal, "current-symbol-writer-preflight", "easyeda_execute",
        { code: preflightCode, timeoutMs: 15_000, confirmWrite: true }, 25_000,
        async () => { marked = await this.acceptMark(slot, beforeMark, "current-symbol-writer-preflight", scopeText); },
        async (reply) => { slot.preflightRaw = reply; this.current(slot, scopeText); await this.record(slot, "writer-preflight-reply", { raw: reply }, scopeText); marked = structuredClone(slot.journal); },
        async () => {
          // The engine can invoke this before beforeDispatch when its final
          // Runtime reproof fails. Retain the exact mark before cleanup.
          if (marked === undefined) { marked = await this.acceptMark(slot, beforeMark, "current-symbol-writer-preflight", scopeText); }
          else { await this.unchanged(slot, scopeText); }
        });
    } catch (error) {
      await this.retainEngineFailure(slot, marked, "current-symbol-writer-preflight", scopeText); throw error;
    }
    need(marked !== undefined); await this.acceptClear(slot, marked, "current-symbol-writer-preflight", scopeText);
    await this.unchanged(slot, scopeText);
    slot.preflight = decodeCurrentProjectOnlySymbolPreflightReply(raw, request);
    const expectedActor = slot.preflight.runtimeObservation.actor;
    need(canonicalJson(expectedActor) === canonicalJson(original.originalPreparation.closedTargetWitness.observation.runtimeObservation.actor));
    await revalidateCurrentSymbolWriterStartup(slot.startup, this.engine, generation); this.current(slot, scopeText);
    await this.engine.assertBridgeDispatchAllowed(); this.current(slot, scopeText);
    const clockRequest = { target: request.target, expectedActor };
    const clockCode = buildCurrentSymbolWriterClockProgram(clockRequest);
    await this.record(slot, "writer-clock-intent", { request: clockRequest, codeSha256: sha256Text(clockCode) }, scopeText);
    const unmarked = structuredClone(slot.journal);
    let dispatch: Awaited<ReturnType<EasyedaControlEngine["markOrphanedCallRisk"]>>, writeMark: Journal | undefined;
    try {
      dispatch = await this.engine.markOrphanedCallRisk(slot.journal, WRITE_PHASE, async () => {
        writeMark = await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText);
      });
    } catch (error) { await this.retainEngineFailure(slot, writeMark, WRITE_PHASE, scopeText); throw error; }
    await this.acceptMark(slot, unmarked, WRITE_PHASE, scopeText); await this.unchanged(slot, scopeText);
    // All expensive native/source preparation precedes W0. Nothing resamples
    // A failed interval or widens its fixed 60-second windows.
    slot.beforeClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const clockRaw = await this.engine.upstream.callTool("easyeda_execute", { code: clockCode, timeoutMs: 15_000, confirmWrite: true }, 25_000, dispatch.binding);
    slot.clockRaw = clockRaw; this.current(slot, scopeText);
    slot.armedClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    const documentBefore = decodeCurrentSymbolWriterClockReply(clockRaw, clockRequest);
    const age = agedHead === undefined ? undefined : qualifyCurrentAgedSqlHead(agedHead, this.engine, generation, slot.beforeClock);
    const operation = { id: slot.owner.operationId, action: "library.symbol.modify", libraryUuid: request.target.projectUuid,
      target: { uuid: request.target.symbolUuid }, patch: baseline.preparation.patch };
    slot.clockPlan = await prepareCurrentSymbolTransactionClock({ before: baseline.inventory, operation,
      startupActor: expectedActor, cachedActor: expectedActor, dispatchOwner: slot.dispatchOwner,
      comparisonIdentity: { projectUuid: request.target.projectUuid, branchUuid: request.target.branchUuid,
        client: slot.preflight.clientTicketObservation.client, preDispatchMaxTicket: slot.preflight.clientTicketObservation.maxTicket,
        ...(age === undefined ? {} : { agedHead: age }) }, launchClock: original.launchClock, captureClock: original.captureClock,
      beforeClock: slot.beforeClock, armedClock: slot.armedClock, documentBefore });
    this.current(slot, scopeText);
    const startup = assertCurrentSymbolWriterStartup(slot.startup, this.engine, generation);
    if (startup.canvasClock !== undefined) {
      // Bound to the original startup, never a request flag. Every new header
      // Must supersede all prior target headers, including the inverse's input.
      const { maximumTargetHeaderTime, remainingWrites } = startup.canvasClock;
      need(original.source.purpose === "disposable-validation" && slot.clockPlan.documentWindow.minimumMs > maximumTargetHeaderTime &&
        slot.clockPlan.documentWindow.maximumMs <= CURRENT_SYMBOL_WRITE_TIME_CEILING - (remainingWrites === 2 ? CURRENT_SYMBOL_WRITE_WINDOW_MS + 1 : 0),
      "Disposable canvas metadata requires a strictly newer document window and reserved inverse window headroom.");
    }
    slot.writeInput = { ...request, startup: startup.expectation,
      desired: { name: baseline.preparation.metadata.after.name, description: baseline.preparation.metadata.after.description },
      peerNames: baseline.preparation.metadata.peerNames, expectedActor,
      expectedWorker: { client: slot.preflight.clientTicketObservation.client, maxTicket: slot.preflight.clientTicketObservation.maxTicket },
      backendWindow: slot.clockPlan.backendWindow, documentWindow: slot.clockPlan.documentWindow,
      rendererTimezoneOffsetMinutes: documentBefore.rendererTimezoneOffsetMinutes };
    const code = buildCurrentSymbolWriteProgram(slot.writeInput);
    slot.journal.state = "writer-dispatching"; slot.journal.mutationMayHaveOccurred = true;
    await this.record(slot, "writer-dispatch-intent", { input: slot.writeInput, clockPlan: slot.clockPlan, clockRaw,
      beforeClock: slot.beforeClock, armedClock: slot.armedClock, codeSha256: sha256Text(code), replayAllowed: false }, scopeText);
    // Only synchronous owner checks remain. The compiled program owns its final
    // Deadline/target/receiver check immediately before the sole native mutation.
    this.current(slot, scopeText); slot.dispatchStarted = true;
    const writeRaw = await this.engine.upstream.callTool("easyeda_execute", { code, timeoutMs: CURRENT_SYMBOL_WRITE_TIMEOUT_MS + 5000, confirmWrite: true },
      CURRENT_SYMBOL_WRITE_TIMEOUT_MS + 15_000, dispatch.binding);
    slot.writeRaw = writeRaw; this.current(slot, scopeText);
    slot.afterClock = await this.engine.freshClockObservationForClosedCapture(original.capture); this.current(slot, scopeText);
    await this.record(slot, "writer-dispatch-reply", { raw: writeRaw, afterClock: slot.afterClock }, scopeText);
    slot.writeResult = decodeCurrentSymbolWriteReply(writeRaw, slot.writeInput); slot.writeAcknowledged = true;
    await recordCurrentSymbolTransactionClockPost(slot.clockPlan, { dispatchOwner: slot.dispatchOwner,
      afterClock: slot.afterClock, documentAfter: slot.writeResult.documentAfter });
    this.current(slot, scopeText); slot.postRecorded = true;
    assertUpstreamReplySettled(writeRaw);
    const beforeClear = structuredClone(slot.journal);
    await this.unchanged(slot, scopeText);
    try { await this.engine.clearOrphanedCallRisk(slot.journal, WRITE_PHASE, dispatch); }
    catch (error) { await this.retainEngineFailure(slot, beforeClear, WRITE_PHASE, scopeText); throw error; }
    await this.acceptClear(slot, beforeClear, WRITE_PHASE, scopeText);
    await this.unchanged(slot, scopeText);
  }

  /** A failed/ambiguous dispatch still owns this one normal close. Never Save,
   * force termination, select a prompt response or reconstruct a lost owner.
   */
  public async finishNormalClose(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined && !slot.closeAttempted && !slot.retired);
    this.busy = true; slot.closeAttempted = true;
    try {
      await this.unchanged(slot); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const launch = slot.source.original.launch, runtime = slot.source.original.source.runtime;
      const window = await runtime.observeApplicationWindow(); await this.unchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === launch.jobId && window.helperInstance === launch.helperInstance);
      slot.closeIntent = await runtime.prepareClosedSessionClose({ ...binding(slot), windowHandle: window.hwnd }); await this.unchanged(slot);
      slot.journal.state = "writer-close-dispatching";
      await this.record(slot, "writer-close-intent", { intent: slot.closeIntent, replayAllowed: false });
      slot.source.beginFinish();
      const receipt = await runtime.requestClosedSessionNormalClose({ ...binding(slot), intent: slot.closeIntent, confirmNormalClose: true });
      slot.closeReceipt = receipt; this.current(slot);
      slot.journal.state = "writer-awaiting-termination";
      await this.record(slot, "writer-close-reply", { receipt }); return summary(slot);
    } catch (error) { await this.stop(slot, "normal-close"); throw error; }
    finally { this.busy = false; }
  }

  /** Pending probes may repeat. Snapshot, comparison and release each consume
   * their attempt first; no missing effect can trigger a second write or Save.
   */
  public async observeFinish(operationId: string): Promise<Readonly<Record<string, unknown>>> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.closeIntent !== undefined && slot.closeReceipt !== undefined && !slot.releaseAttempted && !slot.retired);
    this.busy = true;
    try {
      await this.unchanged(slot);
      const { original } = slot.source, runtime = original.source.runtime;
      if (slot.termination?.status !== "terminated") {
        slot.termination = await runtime.probeClosedSessionTermination({ ...binding(slot), intent: slot.closeIntent, closeReceipt: slot.closeReceipt });
      }
      assertCurrentClosedSessionTerminationObservation(slot.termination); await this.unchanged(slot);
      if (slot.termination.status === "pending") { return Object.freeze({ ...summary(slot), termination: "pending" }); }
      const { proof } = slot.termination;
      need(await assertClosedSessionCopyAuthority(proof) === proof); await this.unchanged(slot);
      this.closedDispatch(slot);
      await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      if (!slot.snapshotAttempted) {
        slot.snapshotAttempted = true;
        await this.record(slot, "writer-snapshot-intent", { proof, closeIntent: slot.closeIntent, closeReceipt: slot.closeReceipt });
        const snapshot = await captureCurrentSymbolFinishSnapshot(this.engine, { baseline: original.baseline, capture: original.capture,
          intent: slot.closeIntent, closeReceipt: slot.closeReceipt, proof, launch: original.launch, runtime: slot.source.sqlRuntime },
        (event) => { slot.snapshotEvidence.set(event.kind, event.value); if (event.kind === "inventory") { slot.snapshotInventory = event.value; } });
        slot.snapshot = snapshot;
        await this.unchanged(slot); this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
        await this.record(slot, "writer-snapshot-result", snapshot);
        slot.snapshotComplete = true;
      }
      if (!slot.comparisonAttempted && slot.snapshotComplete && slot.postRecorded && slot.clockPlan !== undefined) {
        slot.comparisonAttempted = true;
        const inventory = slot.snapshotInventory;
        need(inventory !== undefined, "Current symbol writer lacks its original complete closed inventory.");
        slot.comparison = await verifyCurrentSymbolTransactionClock(slot.clockPlan, { dispatchOwner: slot.dispatchOwner, terminationProof: proof, after: inventory });
        await this.unchanged(slot); this.closedDispatch(slot);
        await this.record(slot, "writer-comparison", { comparison: slot.comparison, originalDispatchOwned: true,
          originalDocumentSamplesRetained: true, persistenceLifecycleComplete: false, persistentUploadReplayExcluded: false, reopened: false });
      }
      if (!slot.recoveryClassificationAttempted) {
        slot.recoveryClassificationAttempted = true;
        await this.classifyClosedRecovery(slot);
      }
      if (!slot.failed && !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined &&
        slot.writeAcknowledged && slot.postRecorded) {
        need(slot.snapshot !== undefined);
        await revalidateCurrentSymbolFinishSnapshot(this.engine, slot.snapshot); await this.unchanged(slot); this.closedDispatch(slot);
        this.issueContinuation(slot);
      }
      await this.record(slot, "writer-retirement-intent", { proof, comparison: slot.comparison ?? null, ...summary(slot) });
      this.closedDispatch(slot); assertCurrentClosedSessionCopyAuthority(proof);
      slot.releaseAttempted = true;
      const hadOrphan = slot.journal.orphanedCallPossible;
      if (hadOrphan) {
        const authority = slot.journal.executionAuthorityBeforeOrphan; need(authority !== undefined);
        await runtime.releaseCapture(authority); this.current(slot); this.closedDispatch(slot);
      }
      await this.engine.releaseClosedSessionAuthority(original.capture); this.current(slot); this.closedDispatch(slot);
      const terminal = { ...slot.journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        updatedAt: new Date().toISOString(), nextSafeAction: "Writer retired. No replay or reopen; fresh inactive upload-cache exclusion and saved-result verification remain required." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); this.current(slot); Object.assign(slot.journal, terminal);
      delete slot.journal.runtimeRestartChallenge; delete slot.journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(slot.journal); await this.unchanged(slot);
      slot.source.retire(); slot.retired = true; return Object.freeze({ ...summary(slot), termination: "terminated" });
    } catch (error) { await this.stop(slot, "termination-or-comparison"); throw error; }
    finally { this.busy = false; }
  }

  /** Read-only diagnosis of the original completed snapshot. In particular,
   * unchanged bytes cannot replace a missing post-dispatch clock sample, and
   * an exact effect does not revive a failed writer or authorize an inverse.
   */
  private async classifyClosedRecovery(slot: Slot): Promise<void> {
    let basis = "complete-snapshot-unavailable", outcome = "unresolved";
    let exactLogicalSqlUnchanged = false;
    const postEvidenceComplete = slot.postRecorded && slot.clockPlan !== undefined && slot.writeResult !== undefined &&
      slot.beforeClock !== undefined && slot.armedClock !== undefined && slot.afterClock !== undefined;
    if (slot.snapshotComplete && slot.snapshot !== undefined) {
      const original = assertOriginalCurrentSymbolFinishSnapshot(slot.snapshot, this.engine);
      need(original.inventory === slot.snapshotInventory);
      assertOriginalCurrentSymbolBaselineCopy(slot.source.original.baseline, this.engine);
      await revalidateCurrentSymbolFinishSnapshot(this.engine, slot.snapshot);
      await this.unchanged(slot); this.closedDispatch(slot);
      if (slot.dispatchCaptureCleanupUncertain) { basis = "dispatch-capture-cleanup-uncertain"; }
      else if (slot.dispatchStarted && !postEvidenceComplete) { basis = "original-post-dispatch-evidence-incomplete"; }
      else if (slot.comparison === undefined) {
        // A comparison refusal is diagnostic only. Original-owner, journal and
        // Snapshot checks still run outside this catch and cannot be suppressed.
        try {
          await compareCompleteClosedSql(slot.source.original.baseline.inventory, original.inventory);
          exactLogicalSqlUnchanged = true;
        } catch { exactLogicalSqlUnchanged = false; }
        await this.unchanged(slot); this.closedDispatch(slot);
        need(assertOriginalCurrentSymbolFinishSnapshot(slot.snapshot, this.engine) === original);
        assertOriginalCurrentSymbolBaselineCopy(slot.source.original.baseline, this.engine);
        if (exactLogicalSqlUnchanged) { outcome = "unchanged"; basis = "complete-original-closed-sql-equality"; }
        else { basis = "closed-effect-not-established"; }
      } else {
        need(slot.writeAcknowledged && postEvidenceComplete);
        outcome = "exact-intended-effect"; basis = "original-complete-clock-and-sql-comparison";
      }
    }
    const result = Object.freeze({ profile: "private.current-symbol-closed-recovery.v1", operationId: slot.owner.operationId,
      outcome, basis, completeClosedSnapshot: slot.snapshotComplete, exactLogicalSqlUnchanged,
      originalPostEvidenceComplete: postEvidenceComplete, originalTransactionComparisonVerified: slot.comparison !== undefined,
      dispatchCaptureCleanupUncertain: slot.dispatchCaptureCleanupUncertain, mutationMayHaveOccurred: slot.dispatchStarted,
      writerFailed: slot.failed, executionAuthorized: false, persistenceLifecycleComplete: false,
      verificationContinuationAuthorized: false, inverseAuthorized: false, replayAllowed: false });
    await this.record(slot, "writer-closed-recovery-classification", result);
    slot.recoveryClassification = result;
  }

  private issueContinuation(slot: Slot): void {
    const { snapshot, clockPlan, writeInput } = slot;
    need(snapshot !== undefined && clockPlan !== undefined && writeInput !== undefined && slot.continuation === undefined);
    const observed = assertOriginalCurrentSymbolFinishSnapshot(snapshot, this.engine);
    need(observed.inventory === slot.snapshotInventory);
    const token: CurrentSymbolWriterContinuation = Object.freeze({ profile: "private.current-symbol-writer-continuation.v1", operationId: slot.owner.operationId });
    const source: CurrentSymbolWriterContinuationSource = Object.freeze({ operationId: token.operationId, snapshot, clockPlan,
      dispatchOwner: slot.dispatchOwner, writeInput, original: slot.source.original, sqlRuntime: slot.source.sqlRuntime, journal: slot.journal });
    const projection = (): unknown => ({ snapshot, clockPlan, writeInput, target: source.original.source.target,
      expectedFingerprint: source.original.source.expectedFingerprint, launch: source.original.launch,
      capture: source.original.capture, sqlRuntime: source.sqlRuntime });
    const frozen = canonicalJson(projection());
    const current = (): void => {
      need(this.slots.get(token.operationId) === slot && slot.continuation === token && slot.retired && !slot.failed &&
        !slot.dispatchCaptureCleanupUncertain && slot.snapshotComplete && slot.comparison !== undefined && slot.writeAcknowledged && slot.postRecorded &&
        slot.snapshot === snapshot && slot.clockPlan === clockPlan && slot.writeInput === writeInput &&
        methods(this.engine).every((method, index) => method === slot.methods[index]) &&
        canonicalJson(projection()) === frozen,
      "Current symbol verification continuation was changed or its writer did not retire successfully.");
      need(assertOriginalCurrentSymbolFinishSnapshot(snapshot, this.engine).inventory === slot.snapshotInventory);
    };
    slot.continuation = token;
    continuations.set(token, { engine: this.engine, source, current, journalText: () => slot.journalText, consumed: false });
  }

  public getVerificationContinuation(operationId: string): CurrentSymbolWriterContinuation {
    const slot = this.slots.get(operationId); need(slot?.continuation !== undefined);
    assertOriginalCurrentSymbolWriterContinuation(slot.continuation, this.engine); return slot.continuation;
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
      authority.processes.some((process) => canonicalJson(process) === canonicalJson(original.launch.root)) &&
      authority.processes.every((process) => process.startIdentity.endsWith(`:job:${original.launch.jobId}`)));
    const closed = observe.call(this.engine.upstream, dispatch, prior);
    need(isRecord(closed) && closed["sessionId"] === prior.sessionId && closed["sequence"] === prior.sequence &&
      closed["authenticationReceiptSha256"] === prior.authenticationReceiptSha256 && closed["authenticatedAtEpochMs"] === prior.authenticatedAtEpochMs &&
      typeof closed["closedAtEpochMs"] === "number" && Number.isSafeInteger(closed["closedAtEpochMs"]) && closed["closedAtEpochMs"] >= prior.authenticatedAtEpochMs);
  }

  public inspect(operationId: string): Readonly<Record<string, unknown>> {
    const slot = this.slots.get(operationId); need(slot !== undefined, "Current symbol writer has no original retained operation.");
    return summary(slot);
  }
}
