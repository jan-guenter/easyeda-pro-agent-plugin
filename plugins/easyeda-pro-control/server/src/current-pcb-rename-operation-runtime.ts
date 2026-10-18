/** Disposable PCB rename composition. Only original issuers supply live owners. */
/* oxlint-disable import/max-dependencies -- Compose fixed original baseline, clock, writer and verifier issuers instead of accepting caller-provided capabilities. */
import { controlDataDirectory, loadOperation } from "./artifacts.ts";
import { isRecord } from "./core.ts";
import { assertCurrentPcbRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenCoordinator, CurrentPcbRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import { collectCurrentPcbAgedSqlClock } from "./current-pcb-aged-sql-issuer.ts";
import type { OriginalCurrentPcbAgedSqlClock } from "./current-pcb-aged-sql-issuer.ts";
import { CurrentPcbAgedSqlReferenceStage } from "./current-pcb-aged-sql-reference.ts";
import type { OriginalCurrentPcbAgedSqlReference } from "./current-pcb-aged-sql-reference.ts";
import { CurrentPcbRenameBaselineCoordinator } from "./current-pcb-rename-baseline-runtime.ts";
import { CurrentPcbRenameGenerationCoordinator } from "./current-pcb-rename-generation-runtime.ts";
import type { CurrentProjectOnlyPcbRenameGeneration } from "./current-pcb-rename-generation-runtime.ts";
import { currentPcbRenameBaselineClockBinding } from "./current-pcb-rename-owner-baseline.ts";
import { CURRENT_PCB_RENAME_OPERATION_PURPOSE, currentPcbRenameOperationRequestSchema } from "./current-pcb-rename-operation.ts";
import type { CurrentPcbRenameOperationPhase, CurrentPcbRenameOperationRequest, CurrentPcbRenameOperationStep } from "./current-pcb-rename-operation.ts";
import { collectCurrentPcbRenameStartupObservation } from "./current-pcb-rename-startup-runtime.ts";
import type { CurrentPcbRenameStartupObservation } from "./current-pcb-rename-startup-runtime.ts";
import { CurrentPcbRenameVerificationCoordinator } from "./current-pcb-rename-verification-runtime.ts";
import { CurrentPcbRenameWriterCoordinator } from "./current-pcb-rename-writer-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";

type Value = Readonly<Record<string, unknown>>;
type CleanupOwner = "opening" | "baseline" | "generation" | "writer" | "verification";
interface Slot {
  readonly operationId: string; readonly openingOperationId: string;
  next: CurrentPcbRenameOperationPhase | "completed" | "stopped";
  readonly attempted: string[]; failedPhase?: string; last?: Value;
  owner?: CurrentPcbRenameOpeningOwner;
  baseline?: CurrentPcbRenameBaselineCoordinator; generation?: CurrentPcbRenameGenerationCoordinator;
  reference?: OriginalCurrentPcbAgedSqlReference; currentGeneration?: CurrentProjectOnlyPcbRenameGeneration;
  startup?: CurrentPcbRenameStartupObservation; agedClock?: OriginalCurrentPcbAgedSqlClock;
  cleanup?: CleanupOwner; cleanupRequested: boolean; renameVerified: boolean;
}
function need(condition: boolean, message = "PCB rename requires its retained owner and exact next phase."): asserts condition {
  if (!condition) { throw new Error(message); }
}

/** Historical inspection never restores authority or changes journal state. */
export async function inspectCurrentPcbRenameHistory(operationId: string): Promise<Value> {
  const journal = await loadOperation(operationId);
  need(journal.operationId === operationId && isRecord(journal.plan) &&
    ["easyeda-pro-control.current-pcb-rename-baseline.v1", "easyeda-pro-control.current-pcb-rename-writer.v1",
      "easyeda-pro-control.current-pcb-rename-verification.v1"].includes(String(journal.plan["profile"])), "PCB rename history belongs to another purpose.");
  return { profile: "easyeda-pro-control.current-pcb-rename-history.v1", operationId, state: journal["state"],
    journalPath: journal["journalPath"], artifacts: journal.artifacts, nextSafeAction: journal["nextSafeAction"],
    hardStop: journal["hardStop"], orphanedCallPossible: journal["orphanedCallPossible"], mutationMayHaveOccurred: journal["mutationMayHaveOccurred"],
    originalOwnerRetained: false, continuationAvailable: false, renameVerified: false, historicalOnly: true,
    replayAllowed: false, executionAuthorized: false };
}

export class CurrentPcbRenameOperationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly opener: CurrentDisposableOpenCoordinator;
  private readonly writer: CurrentPcbRenameWriterCoordinator;
  private readonly verifier: CurrentPcbRenameVerificationCoordinator;
  private readonly scratch: CurrentPcbAgedSqlReferenceStage;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine, opener: CurrentDisposableOpenCoordinator) {
    this.engine = engine; this.opener = opener; this.writer = new CurrentPcbRenameWriterCoordinator(engine);
    this.verifier = new CurrentPcbRenameVerificationCoordinator(engine); this.scratch = new CurrentPcbAgedSqlReferenceStage(engine);
  }
  public async run(input: unknown): Promise<Value> {
    const request = currentPcbRenameOperationRequestSchema.parse(structuredClone(input));
    if (request.action === "inspect") {
      return this.slots.has(request.operationId) ? this.inspect(request.operationId) : inspectCurrentPcbRenameHistory(request.operationId);
    }
    need(!this.busy, "PCB rename operation is already running.");
    if (request.action === "baseline-begin") { return this.begin(request); }
    const slot = this.slots.get(request.operationId); need(slot !== undefined, "PCB rename cannot reconstruct ownership from a journal.");
    if (request.action === "cleanup") {
      need(!slot.renameVerified && slot.next !== "completed" && !slot.cleanupRequested, "PCB rename cleanup was already selected or operation completed.");
      this.busy = true; slot.cleanupRequested = true;
      try { await this.chooseCleanup(slot); }
      finally { this.busy = false; }
      return this.inspect(slot.operationId);
    }
    const { expectedPhase: phase } = request.step;
    need(slot.next === phase); this.busy = true; slot.next = "stopped"; slot.attempted.push(phase);
    try {
      const result = await this.perform(slot, request.step); slot.last = structuredClone(result);
      need(phase.startsWith("cleanup-") || result["failed"] !== true && result["state"] !== "stopped", "PCB rename retained a stopped stage.");
      this.advanceNext(slot, phase, result);
    } catch (error) {
      slot.failedPhase ??= phase;
      try { await this.chooseCleanup(slot); }
      catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB rename failed; inspect the retained cleanup owner.", { cause: cleanupError }); }
      throw error;
    } finally { this.busy = false; }
    return this.inspect(slot.operationId);
  }
  public inspect(operationId: string): Value {
    const slot = this.slots.get(operationId); need(slot !== undefined);
    return Object.freeze({ profile: "easyeda-pro-control.current-pcb-rename-operation.v1", operationId, purpose: CURRENT_PCB_RENAME_OPERATION_PURPOSE,
      openingOperationId: slot.openingOperationId, nextPhase: slot.next, busy: this.busy, attemptedPhases: [...slot.attempted], failedPhase: slot.failedPhase ?? null,
      lastResult: slot.last === undefined ? null : structuredClone(slot.last), originalOwnerRetained: slot.owner !== undefined,
      cleanupOwner: slot.cleanup ?? null, cleanupRequested: slot.cleanupRequested, renameVerified: slot.renameVerified,
      savedMetadataOnly: true, completeCanvasRead: false, ordinaryProjectsSupported: false, genericWritersEnabled: false,
      forwardOnly: true, inverseSupported: false, explicitSaveDispatched: false, replayAllowed: false, executionAuthorized: false });
  }
  private async begin(request: Extract<CurrentPcbRenameOperationRequest, { action: "baseline-begin" }>): Promise<Value> {
    need(!this.slots.has(request.operationId), "PCB rename baseline attempt already exists."); this.busy = true;
    const slot: Slot = { operationId: request.operationId, openingOperationId: request.openingOperationId, next: "stopped",
      attempted: ["baseline-begin"], cleanupRequested: false, renameVerified: false };
    this.slots.set(request.operationId, slot);
    let configured: Awaited<ReturnType<typeof loadRuntimeMachineProfile>> | undefined;
    try {
      configured = await loadRuntimeMachineProfile();
      need(configured.profile.controlDirectory === controlDataDirectory() && configured.profile.easyeda.assetsRoot === process.env["EASYEDA_ASSETS_ROOT"],
        "PCB baseline machine profile differs from the active facade.");
      slot.owner = await this.opener.preparePcbRenameOpeningOwner(request.openingOperationId,
        { operationId: request.operationId, target: request.target, desiredTitle: request.desiredTitle });
      const original = assertCurrentPcbRenameOpeningOwner(slot.owner, this.engine);
      slot.baseline = new CurrentPcbRenameBaselineCoordinator(this.engine, original.source.runtime, configured.profile.runtime);
      slot.generation = new CurrentPcbRenameGenerationCoordinator(this.engine, original.source.runtime);
      slot.last = structuredClone(await slot.baseline.capture(slot.owner)); slot.next = "baseline-close";
    } catch (error) {
      slot.failedPhase = "baseline-begin";
      try { slot.owner ??= this.opener.getPcbRenameOpeningOwner(request.operationId); }
      catch {
        // A refused transfer supplies no authority.
      }
      try {
        if (slot.owner !== undefined && slot.baseline === undefined && configured !== undefined) {
          const original = assertCurrentPcbRenameOpeningOwner(slot.owner, this.engine);
          slot.baseline = new CurrentPcbRenameBaselineCoordinator(this.engine, original.source.runtime, configured.profile.runtime);
          slot.generation = new CurrentPcbRenameGenerationCoordinator(this.engine, original.source.runtime);
        }
        await this.chooseCleanup(slot);
      } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB baseline failed; its original cleanup owner remains retained.", { cause: cleanupError }); }
      throw error;
    } finally { this.busy = false; }
    return this.inspect(slot.operationId);
  }
  private async perform(slot: Slot, step: CurrentPcbRenameOperationStep): Promise<Value> {
    const { baseline, generation } = slot;
    const id = slot.operationId;
    need(baseline !== undefined && generation !== undefined);
    switch (step.expectedPhase) {
      case "baseline-close": { return baseline.close(id, true); }
      case "baseline-observe-termination": { return baseline.observeTermination(id); }
      case "baseline-prepare-clock": {
        const closed = await baseline.closedBaseline(id);
        const binding = currentPcbRenameBaselineClockBinding(closed, this.engine);
        slot.reference = await this.scratch.runOnce({ baseline: closed, proof: binding.proof });
        return { scratchReferenceRetained: true, operationId: id, ordinaryTerminationRecordRequiredBeforeRelaunch: true };
      }
      case "baseline-relaunch": { need(slot.reference !== undefined); return generation.relaunch(await baseline.closedContinuation(id)); }
      case "baseline-admit": { return generation.admit(id); }
      case "baseline-observe-caches": { return generation.observeCaches(id); }
      case "baseline-open-project": { return generation.openProject(id, step.acceptUnqualifiedSchematicStartupEffects); }
      case "baseline-observe-clock": {
        need(slot.reference !== undefined); slot.currentGeneration = generation.generation(id);
        await this.engine.assertBridgeAndRecoveryAdmission(id);
        const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined);
        await scope.call(this.engine.upstream, async () => {
          need(slot.currentGeneration !== undefined && slot.reference !== undefined);
          slot.startup = await collectCurrentPcbRenameStartupObservation(this.engine, slot.currentGeneration);
          slot.agedClock = await collectCurrentPcbAgedSqlClock(this.engine, slot.currentGeneration, slot.reference, slot.startup);
        });
        need(slot.startup !== undefined && slot.agedClock !== undefined);
        return { operationId: id, startupRetained: true, agedClockRetained: true, completeAstSourceBindingVerified: false, executionAuthorized: false };
      }
      case "rename-write": {
        need(slot.currentGeneration !== undefined && slot.startup !== undefined && slot.agedClock !== undefined && !slot.cleanupRequested);
        return this.writer.execute(slot.currentGeneration, slot.startup, slot.agedClock);
      }
      case "rename-close": { return this.writer.finishNormalClose(id); }
      case "rename-observe-termination": { return this.writer.observeFinish(id); }
      case "verification-start": { return this.verifier.start(this.writer.getVerificationContinuation(id)); }
      case "verification-admit": { return this.verifier.admit(id); }
      case "verification-caches": { return this.verifier.observeCaches(id); }
      case "verification-open": { return this.verifier.openProject(id); }
      case "verification-read": { return this.verifier.collectSavedContent(id); }
      case "verification-close": { return this.verifier.finishNormalClose(id); }
      case "verification-finish": { return this.verifier.observeFinish(id); }
      case "cleanup-capture": {
        need(slot.owner !== undefined && slot.cleanup === "opening");
        const result = await baseline.captureForCleanup(slot.owner); slot.cleanup = "baseline"; return result;
      }
      case "cleanup-close": {
        if (slot.cleanup === "baseline") { return baseline.cleanupClose(id, true); }
        if (slot.cleanup === "generation") { return generation.finishNormalClose(id, true); }
        if (slot.cleanup === "writer") { return this.writer.finishNormalClose(id); }
        if (slot.cleanup === "verification") { return this.verifier.finishNormalClose(id); }
        throw new Error("PCB cleanup has no original close owner.");
      }
      case "cleanup-observe-termination": {
        if (slot.cleanup === "baseline") { return baseline.cleanupObserveTermination(id); }
        if (slot.cleanup === "generation") { return generation.observeFinish(id); }
        if (slot.cleanup === "writer") { return this.writer.observeFinish(id); }
        if (slot.cleanup === "verification") { return this.verifier.observeFinish(id); }
        throw new Error("PCB cleanup has no original termination owner.");
      }
      case "cleanup-retire-closed": {
        if (slot.cleanup === "baseline") { return baseline.retireClosedBaseline(id); }
        if (slot.cleanup === "verification") { return this.verifier.retireBeforeLaunch(id); }
        need(slot.cleanup === "generation"); return generation.retireClosedBaseline(id);
      }
      default: { throw new Error("Unsupported PCB rename phase."); }
    }
  }
  private advanceNext(slot: Slot, phase: CurrentPcbRenameOperationPhase, result: Value): void {
    need(this.slots.get(slot.operationId) === slot);
    if (phase === "baseline-admit" || phase === "verification-admit") {
      if (result["authentication"] === "pending") { need(result["admissionAttempted"] === false); slot.next = phase; return; }
      need(result["admitted"] === true);
    }
    if (phase.endsWith("observe-termination") || phase === "verification-finish") {
      if (result["termination"] === "pending") { slot.next = phase; return; }
      need(result["termination"] === "terminated" || result["terminationProved"] === true ||
        phase === "cleanup-observe-termination" && result["retired"] === true);
    }
    if (phase === "baseline-observe-termination") { need(result["baselineCaptured"] === true); }
    if (phase === "rename-observe-termination") { need(result["verificationContinuationRetained"] === true); }
    if (phase === "verification-finish") {
      need(result["fullReopenReadbackInvariant"] === true && result["reopenedPcbMetadataVerified"] === true);
      slot.renameVerified = true; slot.next = "completed"; return;
    }
    const next: Partial<Record<CurrentPcbRenameOperationPhase, CurrentPcbRenameOperationPhase>> = {
      "baseline-close": "baseline-observe-termination", "baseline-observe-termination": "baseline-prepare-clock",
      "baseline-prepare-clock": "baseline-relaunch", "baseline-relaunch": "baseline-admit", "baseline-admit": "baseline-observe-caches",
      "baseline-observe-caches": "baseline-open-project", "baseline-open-project": "baseline-observe-clock", "baseline-observe-clock": "rename-write",
      "rename-write": "rename-close", "rename-close": "rename-observe-termination", "rename-observe-termination": "verification-start",
      "verification-start": "verification-admit", "verification-admit": "verification-caches", "verification-caches": "verification-open",
      "verification-open": "verification-read", "verification-read": "verification-close", "verification-close": "verification-finish",
      "cleanup-capture": "cleanup-close", "cleanup-close": "cleanup-observe-termination",
    };
    slot.next = next[phase] ?? "stopped";
  }
  private async chooseCleanup(slot: Slot): Promise<void> {
    slot.next = "stopped";
    const candidates: readonly [CleanupOwner, () => Value][] = [
      ["verification", () => this.verifier.inspect(slot.operationId)], ["writer", () => this.writer.inspect(slot.operationId)],
      ["generation", () => { need(slot.generation !== undefined); return slot.generation.inspect(slot.operationId); }],
      ["baseline", () => { need(slot.baseline !== undefined); return slot.baseline.inspect(slot.operationId); }],
    ];
    for (const [owner, inspect] of candidates) {
      let state: Value | undefined;
      try { state = inspect(); }
      catch {
        // Try the preceding original owner only when this stage retained none.
      }
      if (owner === "writer" && state?.["ownerRetained"] === false) { state = undefined; }
      if (state !== undefined) {
        slot.cleanup = owner; slot.last = structuredClone(state);
        if (state["retired"] === true || state["finished"] === true) { return; }
        if (owner === "baseline") {
          need(slot.baseline !== undefined);
          if (state["cleanupOnly"] !== true) { state = await slot.baseline.requestCleanup(slot.operationId); slot.last = structuredClone(state); }
        }
        if (state["closedBaselineRetirementAvailable"] === true) { slot.next = "cleanup-retire-closed"; }
        else if (state["finishObservationAvailable"] === true) { slot.next = "cleanup-observe-termination"; }
        else if (state["cleanupCloseAvailable"] === true) { slot.next = "cleanup-close"; }
        return;
      }
    }
    if (slot.owner !== undefined && slot.baseline !== undefined && slot.generation !== undefined) {
      slot.cleanup = "opening"; slot.next = "cleanup-capture";
    }
  }
}
