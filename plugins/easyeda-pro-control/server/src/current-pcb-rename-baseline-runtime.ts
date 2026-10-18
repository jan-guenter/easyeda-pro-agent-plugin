/** PCB-specific initial closure coordinator used by the staged public operation.
 * This module performs no writer call or symbol-token conversion.
 */
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json } from "./core.ts";
import { assertCompletedCurrentPcbRenameOpeningTransfer, assertCurrentPcbRenameOpeningOwner, revalidateCurrentPcbRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentPcbRenameOpeningOwner, CurrentPcbRenameOpeningOwnerSource } from "./current-disposable-open-runtime.ts";
import { assertOriginalCurrentPcbRenameBaseline, captureCurrentPcbRenameBaseline, revalidateCurrentPcbRenameBaseline } from "./current-pcb-rename-owner-baseline.ts";
import type { CurrentPcbRenameBaseline, CurrentPcbRenameBaselineEvidence } from "./current-pcb-rename-owner-baseline.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, ClosedSessionTerminationProof } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertWindowsRuntimeValidator } from "./windows-runtime-validator.ts";

type Value = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.current-pcb-rename-baseline.v1";
type Binding = Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle">;
interface Journal extends TrackedDispatchOperationJournal {
  plan: Value & { profile: typeof PROFILE };
  captureAttempted: boolean; closeAttempted: boolean; copyAttempted: boolean;
}
interface Slot {
  readonly owner: CurrentPcbRenameOpeningOwner;
  readonly original: CurrentPcbRenameOpeningOwnerSource;
  readonly journal: Journal;
  readonly methods: readonly unknown[];
  readonly evidence: Map<CurrentPcbRenameBaselineEvidence["kind"], unknown>;
  created: boolean; journalText: string; capture?: ClosedSessionAuthorityCapture; binding?: Binding;
  closeAttempted: boolean; intent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt;
  observation?: ClosedSessionTerminationObservation; proof?: ClosedSessionTerminationProof;
  copyAttempted: boolean; baseline?: CurrentPcbRenameBaseline; complete: boolean;
  cleanupOnly: boolean; releaseAttempted: boolean; retired: boolean; transferred: boolean;
  continuation?: CurrentPcbRenameClosedContinuation;
}
export interface CurrentPcbRenameClosedContinuation {
  readonly profile: "private.current-pcb-rename-closed-continuation.v1";
  readonly operationId: string;
}
export interface CurrentPcbRenameClosedContinuationSource {
  readonly original: CurrentPcbRenameOpeningOwnerSource;
  readonly baseline: CurrentPcbRenameBaseline;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly proof: ClosedSessionTerminationProof;
  readonly journal: TrackedDispatchOperationJournal;
  readonly sqlRuntime: MachineProfile["runtime"];
}
const continuations = new WeakMap<object, {
  readonly engine: EasyedaControlEngine; readonly source: CurrentPcbRenameClosedContinuationSource;
  readonly available: () => void; readonly revalidate: () => Promise<void>; readonly claim: () => void;
  readonly fail: (error: unknown) => Promise<never>; claimed: boolean;
}>();
/** A successful original initial coordinator alone can issue this transfer.
 * Historical baselines and reconstructed journals cannot replace it.
 */
export async function claimCurrentPcbRenameClosedContinuation(value: CurrentPcbRenameClosedContinuation,
  engine: EasyedaControlEngine, runtime: WindowsControlRuntime): Promise<CurrentPcbRenameClosedContinuationSource> {
  const entry = continuations.get(value);
  need(entry !== undefined && entry.engine === engine && entry.source.original.source.runtime === runtime && !entry.claimed,
    "original closed continuation is unavailable, belongs to another runtime or was consumed");
  entry.available();
  // Reserve synchronously before awaited validation; even a failed claim is not replayable.
  entry.claimed = true;
  try { await entry.revalidate(); entry.claim(); return entry.source; }
  catch (error) { return entry.fail(error); }
}
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB baseline coordinator: ${message}`); }
}
function methods(engine: EasyedaControlEngine, runtime: WindowsControlRuntime): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- This fixed array retains identities only; all calls below keep their original engine/runtime receiver. */
  return [runtime.status, runtime.observeApplicationWindow, runtime.prepareClosedSessionClose, runtime.requestClosedSessionNormalClose,
    runtime.probeClosedSessionTermination, engine.captureClosedSessionAuthority, engine.clockObservationForClosedCapture,
    engine.releaseClosedSessionAuthority, engine.assertBridgeAndRecoveryAdmission,
    engine.upstream.currentAuthenticatedBridgeDispatchBinding, engine.upstream.withAuthenticatedBridgeDispatchScope];
  /* oxlint-enable typescript/unbound-method */
}
function summary(slot: Slot): Value {
  const cleanupCurrent = slot.cleanupOnly && !slot.transferred && !slot.retired && !slot.releaseAttempted;
  const finishObservationAvailable = cleanupCurrent && ["stopped", "awaiting-termination", "baseline-captured"].includes(slot.journal.state) &&
    slot.capture !== undefined && slot.binding !== undefined && slot.intent !== undefined && slot.closeReceipt !== undefined;
  return { operationId: slot.owner.operationId, openingOperationId: slot.owner.openingOperationId, state: slot.journal.state,
    originalOwnerRetained: true, captureRetained: slot.capture !== undefined, closeAttempted: slot.closeAttempted,
    closeAcknowledged: slot.closeReceipt !== undefined, terminationProved: slot.proof !== undefined,
    baselineAttempted: slot.copyAttempted, baselineCaptured: slot.complete, cleanupOnly: slot.cleanupOnly,
    releaseAttempted: slot.releaseAttempted, finishObservationAvailable,
    closedBaselineRetirementAvailable: finishObservationAvailable && slot.proof !== undefined && slot.observation?.status === "terminated",
    cleanupCloseAvailable: cleanupCurrent && !slot.closeAttempted && slot.capture !== undefined && slot.binding !== undefined &&
      ["captured", "stopped"].includes(slot.journal.state),
    retired: slot.retired, ownershipTransferred: slot.transferred,
    partialEvidence: [...slot.evidence.keys()], journalPath: slot.journal.journalPath, artifacts: slot.journal.artifacts,
    originalLaunch: slot.original.source.launchProjection,
    openingEffectsVerified: false, producerBindingVerified: false, startupQualified: false, writerAuthority: false,
    executionAuthorized: false, explicitSaveDispatched: false, replayAllowed: false, nextSafeAction: slot.journal.nextSafeAction };
}

/** This private coordinator starts only after the neutral opener's completed
 * atomic PCB transfer. Each attempted effect is consumed before its first await.
 * Only a genuine pending termination observation may be polled again.
 */
export class CurrentPcbRenameBaselineCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: WindowsControlRuntime;
  private readonly sqlRuntime: MachineProfile["runtime"];
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine, runtime: WindowsControlRuntime, sqlRuntime: MachineProfile["runtime"]) {
    this.engine = engine; this.runtime = runtime; this.sqlRuntime = structuredClone(sqlRuntime);
  }
  private current(slot: Slot): void {
    const original = slot.cleanupOnly ? assertCurrentPcbRenameOpeningOwner(slot.owner, this.engine) :
      assertCompletedCurrentPcbRenameOpeningTransfer(slot.owner, this.engine);
    need(!slot.transferred && !slot.retired && this.slots.get(slot.owner.operationId) === slot && methods(this.engine, this.runtime).every((method, index) => method === slot.methods[index]) &&
      original === slot.original && slot.original.source.runtime === this.runtime,
    "original owner, capture producer or runtime methods changed");
    if (slot.capture !== undefined) { assertWindowsRuntimeValidator(this.engine.executionAuthorityValidator, this.runtime); }
  }
  private outside(slot: Slot): void {
    this.current(slot);
    const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(reader !== undefined && reader.call(this.engine.upstream) === undefined, "normal close/copy requires an ended authenticated scope");
  }
  private async unchanged(slot: Slot): Promise<void> {
    this.current(slot); need(await revalidateCurrentPcbRenameOpeningOwner(slot.owner, this.engine) === slot.original, "opening owner changed"); this.current(slot);
    const persisted = await loadOperation(slot.owner.operationId); this.current(slot);
    need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "journal changed");
  }
  private static async record(slot: Slot, phase: string, value: unknown): Promise<void> {
    slot.journal.sequence += 1;
    slot.journal.artifacts.push(await writePhaseArtifact(slot.owner.operationId, slot.journal.sequence, phase, value));
    slot.journal.updatedAt = new Date().toISOString();
    await updateOperation(slot.journal); slot.journalText = canonicalJson(slot.journal);
  }
  private static async fail(slot: Slot, phase: string, error: unknown): Promise<never> {
    // A stale continuation cannot reopen a completed cleanup or touch its new
    // Recipient's journal after ownership has moved.
    if (slot.retired || slot.transferred) { throw error; }
    slot.cleanupOnly = true;
    slot.journal.state = "stopped"; slot.journal.hardStop = true;
    slot.journal.nextSafeAction = "Keep this facade and original handles. Inspect retained failure/evidence; do not repeat capture, close, copy, Save or navigation.";
    if (slot.created) {
      try {
        const persisted = await loadOperation(slot.owner.operationId);
        // External journal changes remain untouched. The in-memory attempts and
        // Acquired captures/evidence stay retained even if publication failed.
        if (canonicalJson(persisted) === slot.journalText) {
          await CurrentPcbRenameBaselineCoordinator.record(slot, "stopped", { phase, closeAttempted: slot.closeAttempted,
            copyAttempted: slot.copyAttempted, capture: slot.capture ?? null, intent: slot.intent ?? null, closeReceipt: slot.closeReceipt ?? null,
            termination: slot.proof ?? null, retainedEvidence: Object.fromEntries(slot.evidence), baselineRetained: slot.baseline !== undefined,
            replayAllowed: false, executionAuthorized: false });
        }
      } catch (recordError) { throw new AggregateError([error, recordError], "PCB baseline failed and could not publish its retained failure.", { cause: recordError }); }
    }
    throw error;
  }

  /** Create the operation and acquire its original capture in a fresh lease of
   * the same opening session. A failed scope exit leaves capture handles held.
   */
  public capture(owner: CurrentPcbRenameOpeningOwner): Promise<Value> { return this.captureOwner(owner, false); }
  /** Failed opening-scope exit retained the exact original owner, but cannot
   * authorize a baseline. A fresh capture here is solely for normal closure.
   */
  public captureForCleanup(owner: CurrentPcbRenameOpeningOwner): Promise<Value> { return this.captureOwner(owner, true); }
  private async captureOwner(owner: CurrentPcbRenameOpeningOwner, cleanupOnly: boolean): Promise<Value> {
    need(!this.busy && !this.slots.has(owner.operationId), "capture requires an unused original operation");
    const original = cleanupOnly ? assertCurrentPcbRenameOpeningOwner(owner, this.engine) : assertCompletedCurrentPcbRenameOpeningTransfer(owner, this.engine);
    need(original.source.runtime === this.runtime, "opening runtime differs");
    const plan: Journal["plan"] = { profile: PROFILE, purpose: "disposable-pcb-rename", openingOperationId: owner.openingOperationId,
      target: original.source.target, intent: original.intent, launch: original.source.launchProjection,
      expectedFingerprintSha256: sha256Json(original.source.expectedFingerprint) };
    const journal: Journal = { schema: OPERATION_SCHEMA, operationId: owner.operationId, journalPath: operationPath(owner.operationId), plan,
      planHash: buildPlanHash(plan), state: "capturing", mutationState: "not-inferred", saved: false, reopened: false,
      orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: false, sequence: 0, artifacts: [],
      captureAttempted: true, closeAttempted: false, copyAttempted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      nextSafeAction: "Await the one original closed-session capture; no close or writer has been dispatched." };
    const slot: Slot = { owner, original, journal, methods: methods(this.engine, this.runtime), evidence: new Map(),
      created: false, journalText: canonicalJson(journal), closeAttempted: false, copyAttempted: false, complete: false,
      cleanupOnly, releaseAttempted: false, retired: false, transferred: false };
    this.slots.set(owner.operationId, slot); this.busy = true;
    try {
      this.outside(slot); await createOperation(journal); slot.created = true; this.outside(slot);
      await CurrentPcbRenameBaselineCoordinator.record(slot, "capture-intent", { owner, intent: original.intent, cleanupOnly }); this.outside(slot);
      await this.unchanged(slot); this.outside(slot);
      const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(scope !== undefined, "authenticated capture scope is unavailable");
      await scope.call(this.engine.upstream, async () => {
        const reader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
        need(reader !== undefined, "capture dispatch reader is unavailable");
        const binding = reader.call(this.engine.upstream), session = original.source.bridgeSession;
        need(binding !== undefined && binding.gatewayInstanceId === session.gatewayInstanceId && binding.sessionId === session.sessionId &&
          binding.sessionSequence === session.sequence, "capture scope differs from the original opening session");
        const scopeText = canonicalJson(binding);
        const inside = (): void => {
          this.current(slot); need(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === reader &&
            canonicalJson(reader.call(this.engine.upstream)) === scopeText, "capture scope changed");
        };
        inside(); const capture = await this.engine.captureClosedSessionAuthority(owner.operationId, "closed-baseline", 1);
        slot.capture = capture;
        slot.binding = { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
          bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
        inside();
        const launch = original.source.launchProjection, roots = capture.executionAuthority.processes.filter(process => process.role === "easyeda-main");
        need(capture.operationId === owner.operationId && capture.phase === "closed-baseline" && capture.challengeAttempt === 1 &&
          canonicalJson(capture.bridgeSession) === canonicalJson(session) && roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(launch.root) &&
          capture.executionAuthority.processes.every(process => process.startIdentity.endsWith(`:job:${launch.jobId}`)),
        "captured original process/Job/session differs");
        await this.unchanged(slot); inside(); await CurrentPcbRenameBaselineCoordinator.record(slot, "capture-result", { capture }); inside();
      });
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      journal.state = "captured"; journal.nextSafeAction = "Original capture retained. Request one normal application close; never choose Save or Discard.";
      await CurrentPcbRenameBaselineCoordinator.record(slot, "capture-scope-ended", { originalCaptureRetained: true }); this.outside(slot);
      return summary(slot);
    } catch (error) { return await CurrentPcbRenameBaselineCoordinator.fail(slot, "capture", error); }
    finally { this.busy = false; }
  }

  public close(operationId: string, confirmNormalClose: unknown): Promise<Value> {
    return this.requestClose(operationId, confirmNormalClose, false);
  }
  /** Cleanup only after a failed initial capture. Never retries a consumed close. */
  public cleanupClose(operationId: string, confirmNormalClose: unknown): Promise<Value> {
    return this.requestClose(operationId, confirmNormalClose, true);
  }
  private async requestClose(operationId: string, confirmNormalClose: unknown, cleanup: boolean): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(confirmNormalClose === true && !this.busy && slot !== undefined &&
      (cleanup ? slot.cleanupOnly && ["captured", "stopped"].includes(slot.journal.state) : !slot.cleanupOnly && slot.journal.state === "captured") &&
      !slot.closeAttempted && slot.capture !== undefined && slot.binding !== undefined, "close needs its original completed capture");
    this.busy = true; slot.closeAttempted = true;
    try {
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      // Publish attempt consumption before even observing the native window.
      slot.journal.closeAttempted = true;
      await CurrentPcbRenameBaselineCoordinator.record(slot, "close-attempt", { confirmNormalClose: true }); this.outside(slot); await this.unchanged(slot); this.outside(slot);
      const window = await this.runtime.observeApplicationWindow(); this.outside(slot);
      need(window.outcome === "available" && window.hwnd !== null, "owned application window is unavailable");
      const intent = await this.runtime.prepareClosedSessionClose({ ...slot.binding, windowHandle: window.hwnd }); slot.intent = intent;
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      slot.journal.state = "close-dispatching"; slot.journal.mutationMayHaveOccurred = true;
      await CurrentPcbRenameBaselineCoordinator.record(slot, "close-intent", { intent }); this.outside(slot); await this.unchanged(slot); this.outside(slot);
      const receipt = await this.runtime.requestClosedSessionNormalClose({ ...slot.binding, intent, confirmNormalClose: true }); slot.closeReceipt = receipt;
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      slot.journal.state = "awaiting-termination"; slot.journal.nextSafeAction = "Poll only original root/Job termination; do not repeat close or choose Save/Discard.";
      await CurrentPcbRenameBaselineCoordinator.record(slot, "close-result", { closeReceipt: receipt }); this.outside(slot);
      return summary(slot);
    } catch (error) { return await CurrentPcbRenameBaselineCoordinator.fail(slot, "close", error); }
    finally { this.busy = false; }
  }

  public observeTermination(operationId: string): Promise<Value> {
    return this.observeClosure(operationId, false);
  }
  /** A retained close acknowledgement may finish cleanup after failed publication.
   * This route never copies or promotes a failed attempt to a successful baseline.
   */
  public cleanupObserveTermination(operationId: string): Promise<Value> {
    return this.observeClosure(operationId, true);
  }
  private async observeClosure(operationId: string, cleanup: boolean): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && !slot.releaseAttempted &&
      (cleanup ? slot.cleanupOnly && ["stopped", "awaiting-termination", "baseline-captured"].includes(slot.journal.state) :
        !slot.cleanupOnly && slot.journal.state === "awaiting-termination" && !slot.copyAttempted) && slot.binding !== undefined &&
      slot.intent !== undefined && slot.closeReceipt !== undefined && slot.capture !== undefined,
    "termination observation needs its original acknowledged close");
    this.busy = true;
    try {
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      if (slot.observation !== undefined) { assertCurrentClosedSessionTerminationObservation(slot.observation); }
      const observation = cleanup && slot.observation?.status === "terminated" ? slot.observation :
        await this.runtime.probeClosedSessionTermination({ ...slot.binding, intent: slot.intent, closeReceipt: slot.closeReceipt });
      slot.observation = observation;
      if (observation.status === "terminated") { slot.proof = observation.proof; }
      assertCurrentClosedSessionTerminationObservation(observation); this.outside(slot); await this.unchanged(slot); this.outside(slot);
      if (observation.status === "pending") { return { ...summary(slot), termination: "pending" }; }
      if (cleanup) {
        assertCurrentClosedSessionCopyAuthority(observation.proof);
        need(await assertClosedSessionCopyAuthority(observation.proof) === observation.proof, "original cleanup proof changed"); this.outside(slot);
        await CurrentPcbRenameBaselineCoordinator.record(slot, "cleanup-termination", { proof: observation.proof,
          baselineAccepted: false, durableEffects: "unknown", executionAuthorized: false }); this.outside(slot);
        await this.unchanged(slot); this.outside(slot); assertCurrentClosedSessionCopyAuthority(observation.proof);
        slot.releaseAttempted = true;
        await CurrentPcbRenameBaselineCoordinator.record(slot, "cleanup-release-intent", { capture: slot.capture }); this.outside(slot);
        await this.unchanged(slot); this.outside(slot); assertCurrentClosedSessionCopyAuthority(observation.proof);
        await this.engine.releaseClosedSessionAuthority(slot.capture); this.outside(slot); await this.unchanged(slot); this.outside(slot);
        slot.journal.state = "plan-invalidated"; slot.journal.hardStop = false;
        slot.journal.nextSafeAction = "Original failed PCB attempt normally closed and retired. Effects remain unknown; do not replay or claim a verified baseline.";
        await CurrentPcbRenameBaselineCoordinator.record(slot, "cleanup-retired", { proof: observation.proof, captureReleased: true,
          baselineAccepted: false, durableEffects: "unknown", executionAuthorized: false }); this.outside(slot);
        slot.retired = true; return summary(slot);
      }
      slot.copyAttempted = true; slot.journal.copyAttempted = true; slot.journal.state = "copying";
      await CurrentPcbRenameBaselineCoordinator.record(slot, "copy-intent", { proof: observation.proof }); this.outside(slot); await this.unchanged(slot); this.outside(slot);
      const baseline = await captureCurrentPcbRenameBaseline(this.engine, { owner: slot.owner, capture: slot.capture, intent: slot.intent,
        closeReceipt: slot.closeReceipt, proof: observation.proof, runtime: this.sqlRuntime }, event => { slot.evidence.set(event.kind, event.value); });
      slot.baseline = baseline;
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      assertOriginalCurrentPcbRenameBaseline(baseline, this.engine); assertCurrentClosedSessionCopyAuthority(observation.proof);
      slot.journal.state = "baseline-captured"; slot.journal.hardStop = false;
      slot.journal.nextSafeAction = "Original PCB baseline captured. Continue through the retained PCB operation; record the ordinary launcher's original termination before replacement launch. No writer is authorized by this baseline alone.";
      await CurrentPcbRenameBaselineCoordinator.record(slot, "baseline-result", { checkpoint: baseline.checkpoint, copy: baseline.copy,
        target: baseline.intent.target, targetMetadata: baseline.targetMetadata, targetHeader: baseline.targetHeader,
        historySemanticSha256: baseline.history.semanticSha256, rawHistorySha256: baseline.rawHistorySha256, maximumTicket: baseline.maximumTicket,
        sql: { checkpointSha256: baseline.inventory.checkpointSha256, schemaSha256: baseline.inventory.schemaSha256, logicalSha256: baseline.inventory.logicalSha256 },
        originalLaunch: slot.original.source.launchProjection, originalTerminationProofSha256: observation.proof.proofSha256,
        executionAuthorized: false });
      this.outside(slot); await this.unchanged(slot); this.outside(slot); slot.complete = true; return summary(slot);
    } catch (error) { return await CurrentPcbRenameBaselineCoordinator.fail(slot, "termination-or-copy", error); }
    finally { this.busy = false; }
  }

  /** Permanently abandon further baseline/continuation issuance while retaining
   * every original handle and consumed attempt for cleanup. No CAD action.
   */
  public async requestCleanup(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && !slot.transferred && !slot.retired, "original untransferred cleanup owner is unavailable");
    this.busy = true; slot.cleanupOnly = true;
    try {
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      slot.journal.nextSafeAction = "Cleanup only: retain original captures and close attempts; no baseline promotion, relaunch, Save or navigation replay.";
      await CurrentPcbRenameBaselineCoordinator.record(slot, "cleanup-requested", { cleanupOnly: true, captureRetained: slot.capture !== undefined,
        closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined, terminationProved: slot.proof !== undefined });
      this.outside(slot); await this.unchanged(slot); return summary(slot);
    } catch (error) { return await CurrentPcbRenameBaselineCoordinator.fail(slot, "cleanup-request", error); }
    finally { this.busy = false; }
  }
  /** Release the already proved-closed original capture without relaunching.
   * Requires prior cleanup selection and never replays a probe/copy/close.
   */
  public retireClosedBaseline(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(slot !== undefined && slot.cleanupOnly && slot.proof !== undefined && slot.observation?.status === "terminated",
      "closed-baseline retirement needs its original retained termination proof");
    return this.observeClosure(operationId, true);
  }

  /** Original object only, while its process/capture closure is still held.
   * This is not a journal loader, lifecycle transfer or relaunch capability.
   */
  public async closedBaseline(operationId: string): Promise<CurrentPcbRenameBaseline> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && !slot.cleanupOnly && !slot.transferred && slot.complete && slot.journal.state === "baseline-captured" && slot.baseline !== undefined,
      "original completed baseline is unavailable");
    this.busy = true;
    try {
      this.outside(slot); await this.unchanged(slot); this.outside(slot);
      await revalidateCurrentPcbRenameBaseline(slot.baseline, this.engine); this.outside(slot); await this.unchanged(slot); this.outside(slot);
      return slot.baseline;
    } finally { this.busy = false; }
  }
  public async closedContinuation(operationId: string): Promise<CurrentPcbRenameClosedContinuation> {
    const baseline = await this.closedBaseline(operationId), slot = this.slots.get(operationId);
    need(slot !== undefined && slot.capture !== undefined && slot.proof !== undefined && slot.baseline === baseline && !slot.transferred,
      "original completed closure is unavailable");
    if (slot.continuation !== undefined) { return slot.continuation; }
    const token: CurrentPcbRenameClosedContinuation = Object.freeze({ profile: "private.current-pcb-rename-closed-continuation.v1", operationId });
    const source = Object.freeze({ original: slot.original, baseline, capture: slot.capture, proof: slot.proof, journal: slot.journal,
      sqlRuntime: Object.freeze(structuredClone(this.sqlRuntime)) });
    const available = (): void => {
      need(slot.continuation === token && !slot.cleanupOnly && !slot.transferred && !slot.retired, "closed continuation changed"); this.outside(slot);
    };
    continuations.set(token, { engine: this.engine, source, claimed: false, available,
      revalidate: async (): Promise<void> => {
        available();
        await this.closedBaseline(operationId);
      }, claim: (): void => { available(); slot.transferred = true; },
      fail: (error: unknown): Promise<never> => CurrentPcbRenameBaselineCoordinator.fail(slot, "continuation-claim", error) });
    slot.continuation = token; return token;
  }
  public inspect(operationId: string): Value {
    const slot = this.slots.get(operationId); need(slot !== undefined && !this.busy, "original operation is unavailable or still running");
    // Inspection stays available when a current authority check fails. It does
    // Not clear that failure, return authority tokens or dispatch anything.
    return summary(slot);
  }
  public originalOpeningOwner(operationId: string): CurrentPcbRenameOpeningOwner {
    const slot = this.slots.get(operationId); need(slot !== undefined && !this.busy, "original opening owner is unavailable");
    assertCurrentPcbRenameOpeningOwner(slot.owner, this.engine); return slot.owner;
  }
}
