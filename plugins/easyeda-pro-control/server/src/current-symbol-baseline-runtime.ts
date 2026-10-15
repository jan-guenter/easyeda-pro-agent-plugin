import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- Only the retained opener issues these one-way ownership transfers; no caller-provided issuer exists.
import { assertCurrentSymbolBaselineOwner, revalidateCurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Closed copying consumes only original owners issued by the opener; this private coordinator never replaces that issuer.
import { captureCurrentSymbolBaselineCopy } from "./current-symbol-baseline-copy.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationObservation, ClosedSessionTerminationProof } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type Value = Record<string, unknown>;
const PROFILE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
export const currentSymbolBaselineRequestSchema = z.object({ operationId: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/u),
  preparation: currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }), confirmNormalClose: z.literal(true) }).strict();
interface Journal extends TrackedDispatchOperationJournal {
  plan: Value & { profile: typeof PROFILE }; closeAttempted: boolean; copyAttempted: boolean;
}
type CopyResult = Awaited<ReturnType<typeof captureCurrentSymbolBaselineCopy>>;
type Binding = Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle">;
interface Slot {
  readonly owner: CurrentSymbolBaselineOwner; readonly journal: Journal; readonly ownerText: string;
  created: boolean; journalText: string; capture?: ClosedSessionAuthorityCapture; binding?: Binding;
  intent?: ClosedSessionCloseIntent; closeReceipt?: ClosedSessionCloseReceipt; observation?: ClosedSessionTerminationObservation;
  proof?: ClosedSessionTerminationProof; copy?: CopyResult; closeAttempted: boolean; copyAttempted: boolean;
  readonly evidence: Map<string, unknown>;
}
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function summary(slot: Slot): Value {
  return { operationId: slot.owner.operationId, openingOperationId: slot.owner.openingOperationId, state: slot.journal.state,
    closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeReceipt !== undefined, copyAttempted: slot.copyAttempted,
    baselineCaptured: slot.journal.state === "completed", beforeWriteBaselineVerified: false, openingEffectsVerified: false,
    writerReady: false, executionAuthorized: false, explicitSaveDispatched: false, replayAllowed: false,
    journalPath: slot.journal.journalPath, artifacts: slot.journal.artifacts, nextSafeAction: slot.journal.nextSafeAction };
}

/** Internal only. Normal close is one-shot; only a qualified pending observation
 * permits another termination probe. Lost original owners cannot be restored by
 * loading journals. No public request registration, Save or relaunch is added.
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
    slot.journal.nextSafeAction = "Inspect this consumed baseline attempt. Do not repeat close, copy, Save or navigation; retain the original facade and process handles.";
    if (slot.created) {
      const persisted = await loadOperation(slot.owner.operationId);
      // Preserve externally advanced or conflicting history instead of replacing
      // It with our stopped state. The in-memory attempt remains consumed.
      if (canonicalJson(persisted) !== slot.journalText) { return; }
      await CurrentSymbolBaselineCoordinator.record(slot, "stopped", { phase, replayAllowed: false, closeAttempted: slot.closeAttempted, copyAttempted: slot.copyAttempted });
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
      closeAttempted: false, copyAttempted: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      nextSafeAction: "Retain one closed-session capture in the original authenticated scope before normal close." };
    const slot: Slot = { owner, ownerText: canonicalJson(owner), journal, journalText: canonicalJson(journal), created: false,
      closeAttempted: false, copyAttempted: false, evidence: new Map() };
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
        sql: { checkpointSha256: result.inventory.checkpointSha256, schemaSha256: result.inventory.schemaSha256, logicalSha256: result.inventory.logicalSha256 },
        beforeWriteBaselineVerified: false, openingEffectsVerified: false, writerReady: false, executionAuthorized: false });
      this.outsideScope(slot); await this.unchanged(slot); this.outsideScope(slot);
      assertCurrentClosedSessionCopyAuthority(proof);
      return summary(slot);
    } catch (error) { return await CurrentSymbolBaselineCoordinator.fail(slot, "termination-or-copy", error); }
    finally { this.busy = false; }
  }

  public async inspect(operationId: string): Promise<Value> {
    const journal = await loadOperation(operationId);
    need(isRecord(journal.plan) && journal.plan["profile"] === PROFILE && journal.operationId === operationId,
      "Current symbol baseline history has another profile.");
    return { operationId, state: journal["state"], journalPath: journal["journalPath"], artifacts: journal.artifacts,
      nextSafeAction: journal["nextSafeAction"], originalOwnerRetained: this.slots.has(operationId), writerReady: false, executionAuthorized: false };
  }
}
