/** Disposable SCHEMATIC rename composition. Only original issuers supply live owners. */
/* oxlint-disable import/max-dependencies -- Compose fixed original baseline, clock, writer and verifier issuers instead of accepting caller-provided capabilities. */
import { performance } from "node:perf_hooks";
import { controlDataDirectory, loadOperation } from "./artifacts.ts";
import { isRecord } from "./core.ts";
import { assertCurrentSchematicRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenCoordinator, CurrentSchematicRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import { collectCurrentSchematicAgedSqlClock } from "./current-schematic-aged-sql-issuer.ts";
import type { OriginalCurrentSchematicAgedSqlClock } from "./current-schematic-aged-sql-issuer.ts";
import { CurrentSchematicAgedSqlReferenceStage } from "./current-schematic-aged-sql-reference.ts";
import type { OriginalCurrentSchematicAgedSqlReference } from "./current-schematic-aged-sql-reference.ts";
import { CurrentSchematicRenameBaselineCoordinator } from "./current-schematic-rename-baseline-runtime.ts";
import { CurrentSchematicRenameGenerationCoordinator } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentProjectOnlySchematicRenameGeneration } from "./current-schematic-rename-generation-runtime.ts";
import { currentSchematicRenameBaselineClockBinding } from "./current-schematic-rename-owner-baseline.ts";
import { CURRENT_SCHEMATIC_RENAME_NEXT_PHASES, CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE, currentSchematicRenameOperationRequestSchema } from "./current-schematic-rename-operation.ts";
import type { CurrentSchematicRenameOperationPhase, CurrentSchematicRenameOperationRequest, CurrentSchematicRenameOperationStep } from "./current-schematic-rename-operation.ts";
import { collectCurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import { CurrentSchematicRenameVerificationCoordinator } from "./current-schematic-rename-verification-runtime.ts";
import { CurrentSchematicRenameWriterCoordinator } from "./current-schematic-rename-writer-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";

type Value = Readonly<Record<string, unknown>>;
type CleanupOwner = "opening" | "baseline" | "generation" | "writer" | "verification";
type DiagnosticOutcome = "succeeded" | "failed" | "observation-pending";
interface ActiveDiagnostic {
  readonly action: "baseline-begin" | "advance" | "cleanup";
  readonly phase: CurrentSchematicRenameOperationPhase | "baseline-begin" | "cleanup";
  readonly startedAt: number;
  stage: "performing" | "cleanup-selection";
}
interface FinishedDiagnostic {
  readonly action: ActiveDiagnostic["action"]; readonly phase: ActiveDiagnostic["phase"];
  readonly durationMs: number; readonly outcome: DiagnosticOutcome;
}
interface BatchProgress {
  readonly requestedPhases: readonly CurrentSchematicRenameOperationPhase[];
  attemptedSteps: number; completedSteps: number;
  status: "running" | "finished" | "observation-pending" | "failed";
}
interface Slot {
  readonly operationId: string; readonly openingOperationId: string;
  next: CurrentSchematicRenameOperationPhase | "completed" | "stopped";
  readonly attempted: string[]; failedPhase?: string; last?: Value;
  owner?: CurrentSchematicRenameOpeningOwner;
  baseline?: CurrentSchematicRenameBaselineCoordinator; generation?: CurrentSchematicRenameGenerationCoordinator;
  reference?: OriginalCurrentSchematicAgedSqlReference; currentGeneration?: CurrentProjectOnlySchematicRenameGeneration;
  startup?: CurrentSchematicRenameStartupObservation; agedClock?: OriginalCurrentSchematicAgedSqlClock;
  cleanup?: CleanupOwner; cleanupRequested: boolean; renameVerified: boolean;
  diagnosticCurrent?: ActiveDiagnostic; diagnosticLast?: FinishedDiagnostic;
  lastBatch?: BatchProgress;
}
function diagnosticElapsed(startedAt: number): number {
  const elapsed = Math.floor(performance.now() - startedAt);
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, elapsed));
}
function finishDiagnostic(slot: Slot, outcome: DiagnosticOutcome): void {
  const current = slot.diagnosticCurrent;
  if (current !== undefined) {
    const terminal = outcome === "succeeded" && current.action === "advance" && slot.next === current.phase ? "observation-pending" : outcome;
    slot.diagnosticLast = Object.freeze({ action: current.action, phase: current.phase, durationMs: diagnosticElapsed(current.startedAt), outcome: terminal });
    delete slot.diagnosticCurrent;
  }
}
function inspectDiagnostic(slot: Slot): Value {
  const current = slot.diagnosticCurrent;
  return Object.freeze({ profile: "easyeda-pro-control.current-schematic-rename-phase-diagnostic.v1",
    current: current === undefined ? null : Object.freeze({ action: current.action, phase: current.phase, stage: current.stage,
      elapsedMs: diagnosticElapsed(current.startedAt) }), last: slot.diagnosticLast ?? null,
    diagnosticOnly: true, monotonicElapsedOnly: true, clockAuthority: false, replayAllowed: false });
}
function need(condition: boolean, message = "SCHEMATIC rename requires its retained owner and exact next phase."): asserts condition {
  if (!condition) { throw new Error(message); }
}

/** Historical inspection never restores authority or changes journal state. */
export async function inspectCurrentSchematicRenameHistory(operationId: string): Promise<Value> {
  const journal = await loadOperation(operationId);
  need(journal.operationId === operationId && isRecord(journal.plan) &&
    ["easyeda-pro-control.current-schematic-rename-baseline.v1", "easyeda-pro-control.current-schematic-rename-writer.v1",
      "easyeda-pro-control.current-schematic-rename-verification.v1"].includes(String(journal.plan["profile"])), "SCHEMATIC rename history belongs to another purpose.");
  return { profile: "easyeda-pro-control.current-schematic-rename-history.v1", operationId, state: journal["state"],
    journalPath: journal["journalPath"], artifacts: journal.artifacts, nextSafeAction: journal["nextSafeAction"],
    hardStop: journal["hardStop"], orphanedCallPossible: journal["orphanedCallPossible"], mutationMayHaveOccurred: journal["mutationMayHaveOccurred"],
    originalOwnerRetained: false, continuationAvailable: false, renameVerified: false, historicalOnly: true,
    replayAllowed: false, executionAuthorized: false };
}

export class CurrentSchematicRenameOperationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly opener: CurrentDisposableOpenCoordinator;
  private readonly writer: CurrentSchematicRenameWriterCoordinator;
  private readonly verifier: CurrentSchematicRenameVerificationCoordinator;
  private readonly scratch: CurrentSchematicAgedSqlReferenceStage;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine, opener: CurrentDisposableOpenCoordinator) {
    this.engine = engine; this.opener = opener; this.writer = new CurrentSchematicRenameWriterCoordinator(engine);
    this.verifier = new CurrentSchematicRenameVerificationCoordinator(engine); this.scratch = new CurrentSchematicAgedSqlReferenceStage(engine);
  }
  public async run(input: unknown): Promise<Value> {
    const request = currentSchematicRenameOperationRequestSchema.parse(structuredClone(input));
    if (request.action === "inspect") {
      return this.slots.has(request.operationId) ? this.inspect(request.operationId) : inspectCurrentSchematicRenameHistory(request.operationId);
    }
    need(!this.busy, "SCHEMATIC rename operation is already running.");
    if (request.action === "baseline-begin") { return this.begin(request); }
    const slot = this.slots.get(request.operationId); need(slot !== undefined, "SCHEMATIC rename cannot reconstruct ownership from a journal.");
    if (request.action === "cleanup") {
      need(!slot.renameVerified && slot.next !== "completed" && !slot.cleanupRequested, "SCHEMATIC rename cleanup was already selected or operation completed.");
      this.busy = true; slot.cleanupRequested = true;
      slot.diagnosticCurrent = { action: "cleanup", phase: "cleanup", stage: "cleanup-selection", startedAt: performance.now() };
      let outcome: DiagnosticOutcome = "failed";
      try { await this.chooseCleanup(slot); outcome = "succeeded"; }
      finally { finishDiagnostic(slot, outcome); this.busy = false; }
      return this.inspect(slot.operationId);
    }
    const steps = request.action === "advance-batch" ? request.steps : [request.step];
    const first = steps[0]; need(first !== undefined && slot.next === first.expectedPhase);
    this.busy = true;
    try {
      await (request.action === "advance-batch" ? this.advanceBatch(slot, steps) : this.advanceStep(slot, first));
    } finally { this.busy = false; }
    return this.inspect(slot.operationId);
  }
  private async advanceBatch(slot: Slot, steps: readonly CurrentSchematicRenameOperationStep[]): Promise<void> {
    const progress: BatchProgress = { requestedPhases: Object.freeze(steps.map(step => step.expectedPhase)),
      attemptedSteps: 0, completedSteps: 0, status: "running" };
    slot.lastBatch = progress;
    try {
      for (const step of steps) {
        // Never infer a phase from a successful-looking preceding response.
        need(slot.next === step.expectedPhase);
        progress.attemptedSteps += 1;
        await this.advanceStep(slot, step);
        if (slot.next === step.expectedPhase) { progress.status = "observation-pending"; return; }
        progress.completedSteps += 1;
      }
      progress.status = "finished";
    } catch (error) { progress.status = "failed"; throw error; }
  }
  private async advanceStep(slot: Slot, step: CurrentSchematicRenameOperationStep): Promise<void> {
    const { expectedPhase: phase } = step;
    need(slot.next === phase); slot.next = "stopped"; slot.attempted.push(phase);
    slot.diagnosticCurrent = { action: "advance", phase, stage: "performing", startedAt: performance.now() };
    let outcome: DiagnosticOutcome = "failed";
    try {
      const result = await this.perform(slot, step); slot.last = structuredClone(result);
      need(phase.startsWith("cleanup-") || result["failed"] !== true && result["state"] !== "stopped", "SCHEMATIC rename retained a stopped stage.");
      this.advanceNext(slot, phase, result);
      outcome = "succeeded";
    } catch (error) {
      slot.failedPhase ??= phase;
      slot.diagnosticCurrent.stage = "cleanup-selection";
      try { await this.chooseCleanup(slot); }
      catch (cleanupError) { throw new AggregateError([error, cleanupError], "SCHEMATIC rename failed; inspect the retained cleanup owner.", { cause: cleanupError }); }
      throw error;
    } finally { finishDiagnostic(slot, outcome); }
  }
  public inspect(operationId: string): Value {
    const slot = this.slots.get(operationId); need(slot !== undefined);
    return Object.freeze({ profile: "easyeda-pro-control.current-schematic-rename-operation.v1", operationId, purpose: CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE,
      openingOperationId: slot.openingOperationId, nextPhase: slot.next, busy: this.busy, attemptedPhases: [...slot.attempted], failedPhase: slot.failedPhase ?? null,
      lastResult: slot.last === undefined ? null : structuredClone(slot.last), originalOwnerRetained: slot.owner !== undefined,
      cleanupOwner: slot.cleanup ?? null, cleanupRequested: slot.cleanupRequested, renameVerified: slot.renameVerified,
      phaseDiagnostics: inspectDiagnostic(slot),
      lastBatch: slot.lastBatch === undefined ? null : Object.freeze({ ...slot.lastBatch,
        requestedPhases: Object.freeze([...slot.lastBatch.requestedPhases]), diagnosticOnly: true, replayAllowed: false }),
      savedMetadataAndChildRosterOnly: true, completeCanvasRead: false, ordinaryProjectsSupported: false, genericWritersEnabled: false,
      forwardOnly: true, inverseSupported: false, explicitSaveDispatched: false, replayAllowed: false, executionAuthorized: false });
  }
  private async begin(request: Extract<CurrentSchematicRenameOperationRequest, { action: "baseline-begin" }>): Promise<Value> {
    need(!this.slots.has(request.operationId), "SCHEMATIC rename baseline attempt already exists."); this.busy = true;
    const slot: Slot = { operationId: request.operationId, openingOperationId: request.openingOperationId, next: "stopped",
      attempted: ["baseline-begin"], cleanupRequested: false, renameVerified: false };
    this.slots.set(request.operationId, slot);
    slot.diagnosticCurrent = { action: "baseline-begin", phase: "baseline-begin", stage: "performing", startedAt: performance.now() };
    let outcome: DiagnosticOutcome = "failed";
    let configured: Awaited<ReturnType<typeof loadRuntimeMachineProfile>> | undefined;
    try {
      configured = await loadRuntimeMachineProfile();
      need(configured.profile.controlDirectory === controlDataDirectory() && configured.profile.easyeda.assetsRoot === process.env["EASYEDA_ASSETS_ROOT"],
        "SCHEMATIC baseline machine profile differs from the active facade.");
      slot.owner = await this.opener.prepareSchematicRenameOpeningOwner(request.openingOperationId,
        { operationId: request.operationId, target: request.target, desiredTitle: request.desiredTitle });
      const original = assertCurrentSchematicRenameOpeningOwner(slot.owner, this.engine);
      slot.baseline = new CurrentSchematicRenameBaselineCoordinator(this.engine, original.source.runtime, configured.profile.runtime);
      slot.generation = new CurrentSchematicRenameGenerationCoordinator(this.engine, original.source.runtime);
      slot.last = structuredClone(await slot.baseline.capture(slot.owner)); slot.next = "baseline-close";
      outcome = "succeeded";
    } catch (error) {
      slot.failedPhase = "baseline-begin";
      slot.diagnosticCurrent.stage = "cleanup-selection";
      try { slot.owner ??= this.opener.getSchematicRenameOpeningOwner(request.operationId); }
      catch {
        // A refused transfer supplies no authority.
      }
      try {
        if (slot.owner !== undefined && slot.baseline === undefined && configured !== undefined) {
          const original = assertCurrentSchematicRenameOpeningOwner(slot.owner, this.engine);
          slot.baseline = new CurrentSchematicRenameBaselineCoordinator(this.engine, original.source.runtime, configured.profile.runtime);
          slot.generation = new CurrentSchematicRenameGenerationCoordinator(this.engine, original.source.runtime);
        }
        await this.chooseCleanup(slot);
      } catch (cleanupError) { throw new AggregateError([error, cleanupError], "SCHEMATIC baseline failed; its original cleanup owner remains retained.", { cause: cleanupError }); }
      throw error;
    } finally { finishDiagnostic(slot, outcome); this.busy = false; }
    return this.inspect(slot.operationId);
  }
  private async perform(slot: Slot, step: CurrentSchematicRenameOperationStep): Promise<Value> {
    const { baseline, generation } = slot;
    const id = slot.operationId;
    need(baseline !== undefined && generation !== undefined);
    switch (step.expectedPhase) {
      case "baseline-close": { return baseline.close(id, true); }
      case "baseline-observe-termination": { return baseline.observeTermination(id); }
      case "baseline-prepare-clock": {
        const closed = await baseline.closedBaseline(id);
        const binding = currentSchematicRenameBaselineClockBinding(closed, this.engine);
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
          slot.startup = await collectCurrentSchematicRenameStartupObservation(this.engine, slot.currentGeneration);
          slot.agedClock = await collectCurrentSchematicAgedSqlClock(this.engine, slot.currentGeneration, slot.reference, slot.startup);
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
        throw new Error("SCHEMATIC cleanup has no original close owner.");
      }
      case "cleanup-observe-termination": {
        if (slot.cleanup === "baseline") { return baseline.cleanupObserveTermination(id); }
        if (slot.cleanup === "generation") { return generation.observeFinish(id); }
        if (slot.cleanup === "writer") { return this.writer.observeFinish(id); }
        if (slot.cleanup === "verification") { return this.verifier.observeFinish(id); }
        throw new Error("SCHEMATIC cleanup has no original termination owner.");
      }
      case "cleanup-retire-closed": {
        if (slot.cleanup === "baseline") { return baseline.retireClosedBaseline(id); }
        if (slot.cleanup === "verification") { return this.verifier.retireBeforeLaunch(id); }
        need(slot.cleanup === "generation"); return generation.retireClosedBaseline(id);
      }
      default: { throw new Error("Unsupported SCHEMATIC rename phase."); }
    }
  }
  private advanceNext(slot: Slot, phase: CurrentSchematicRenameOperationPhase, result: Value): void {
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
      need(result["fullReopenReadbackInvariant"] === true && result["reopenedSchematicMetadataVerified"] === true &&
        result["reopenedSchematicChildRosterVerified"] === true);
      slot.renameVerified = true; slot.next = "completed"; return;
    }
    slot.next = CURRENT_SCHEMATIC_RENAME_NEXT_PHASES[phase] ?? "stopped";
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
