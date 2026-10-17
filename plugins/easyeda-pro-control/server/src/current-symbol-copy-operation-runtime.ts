/** Forward-only disposable copy lifecycle; every stage retains its original owner. */
// oxlint-disable-next-line import/no-cycle -- The opener composes this fixed lifecycle; it must consume the original lexical generation registry.
import { assertCurrentProjectOnlySymbolCopyGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolCopyGeneration, CurrentSymbolBaselineCoordinator } from "./current-symbol-baseline-runtime.ts";
import type { OriginalCurrentCopyAgedSqlClock } from "./current-copy-aged-sql-issuer.ts";
import { currentSymbolCopyOperationStepSchema } from "./current-symbol-copy-operation.ts";
import type { CurrentSymbolCopyOperationPhase, CurrentSymbolCopyOperationStep } from "./current-symbol-copy-operation.ts";
// oxlint-disable-next-line import/no-cycle -- Qualification consumes this lifecycle's original generation, never caller data.
import { qualifyCurrentSymbolCopyStartup } from "./current-symbol-copy-startup-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Transfer uses the opener's original registry rather than replaceable callback factories.
import { CurrentSymbolCopyWriterCoordinator } from "./current-symbol-copy-writer-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- The verifier consumes the original writer continuation within this fixed lifecycle.
import { CurrentSymbolCopyVerificationCoordinator } from "./current-symbol-copy-verification-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type Value = Readonly<Record<string, unknown>>;
type CloseOwner = CurrentSymbolBaselineCoordinator | CurrentSymbolCopyWriterCoordinator | CurrentSymbolCopyVerificationCoordinator;
interface Slot {
  readonly operationId: string;
  readonly generation: CurrentProjectOnlySymbolCopyGeneration;
  readonly agedClock: OriginalCurrentCopyAgedSqlClock;
  next: CurrentSymbolCopyOperationPhase | "completed" | "stopped";
  readonly attempted: CurrentSymbolCopyOperationPhase[];
  cleanup?: CloseOwner;
  last?: Value;
  failedPhase?: CurrentSymbolCopyOperationPhase;
  copyVerified: boolean;
  cleanupRequested: boolean;
}
function need(condition: boolean, message = "Current copy operation requires its original owner and exact next phase."): asserts condition {
  if (!condition) { throw new Error(message); }
}

export class CurrentSymbolCopyOperationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly baseline: CurrentSymbolBaselineCoordinator;
  private readonly writer: CurrentSymbolCopyWriterCoordinator;
  private readonly verifier: CurrentSymbolCopyVerificationCoordinator;
  private slot?: Slot;
  private busy = false;

  public constructor(engine: EasyedaControlEngine, baseline: CurrentSymbolBaselineCoordinator) {
    this.engine = engine; this.baseline = baseline;
    this.writer = new CurrentSymbolCopyWriterCoordinator(engine); this.verifier = new CurrentSymbolCopyVerificationCoordinator(engine);
  }

  /** Local original-token checks only; a refusal leaves the baseline close path intact. */
  public begin(operationId: string): Value {
    need(this.slot === undefined && !this.busy);
    const generation = this.baseline.getCopyProjectOnlyGeneration(operationId);
    const original = assertCurrentProjectOnlySymbolCopyGeneration(generation, this.engine);
    need(original.source.purpose === "disposable-validation");
    const agedClock = this.baseline.getCopyAgedClock(operationId);
    this.slot = { operationId, generation, agedClock, next: "copy-write", attempted: [], copyVerified: false, cleanupRequested: false };
    return this.inspect(operationId);
  }

  public inspect(operationId: string): Value {
    const slot = this.slot; need(slot !== undefined && slot.operationId === operationId);
    return Object.freeze({ profile: "easyeda-pro-control.current-symbol-copy-operation.v1", operationId, purpose: "disposable-symbol-copy",
      nextPhase: slot.next, busy: this.busy, attemptedPhases: [...slot.attempted], failedPhase: slot.failedPhase ?? null,
      lastResult: slot.last === undefined ? null : structuredClone(slot.last), originalOwnerRetained: true,
      copyVerified: slot.copyVerified, cleanupRequested: slot.cleanupRequested, ordinaryProjectsSupported: false, genericWritersEnabled: false,
      forwardOnly: true, inverseSupported: false, explicitSaveDispatched: false, replayAllowed: false, executionAuthorized: false });
  }

  /** A ready copy can be abandoned without requiring its first mutation. */
  public requestCleanup(operationId: string): Value {
    const slot = this.slot;
    need(!this.busy && slot !== undefined && slot.operationId === operationId && slot.next === "copy-write" && slot.attempted.length === 0);
    slot.cleanupRequested = true; slot.cleanup = this.baseline; slot.next = "cleanup-close";
    return this.inspect(operationId);
  }

  public async advance(operationId: string, input: CurrentSymbolCopyOperationStep): Promise<Value> {
    const { expectedPhase: phase } = currentSymbolCopyOperationStepSchema.parse(input), slot = this.slot;
    need(!this.busy && slot !== undefined && slot.operationId === operationId && slot.next === phase);
    this.busy = true; slot.next = "stopped"; slot.attempted.push(phase);
    try {
      const result = await this.perform(slot, phase); slot.last = structuredClone(result);
      need(phase.startsWith("cleanup-") || (result["failed"] !== true && result["state"] !== "stopped" && result["state"] !== "baseline-stopped"),
        "Current copy operation retained a stopped stage; inspect its original owner.");
      this.next(slot, phase, result);
    } catch (error) {
      slot.failedPhase ??= phase;
      try { await this.failed(slot, phase); }
      catch (cleanupError) {
        throw new AggregateError([error, cleanupError], "Current copy operation failed; inspect its retained cleanup owner.", { cause: cleanupError });
      }
      throw error;
    } finally { this.busy = false; }
    return this.inspect(operationId);
  }

  private async perform(slot: Slot, phase: CurrentSymbolCopyOperationPhase): Promise<Value> {
    const id = slot.operationId;
    switch (phase) {
      case "copy-write": {
        await this.engine.assertBridgeAndRecoveryAdmission(id);
        const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined);
        let startup: Awaited<ReturnType<typeof qualifyCurrentSymbolCopyStartup>> | undefined;
        await scope.call(this.engine.upstream, async () => { startup = await qualifyCurrentSymbolCopyStartup(this.engine, slot.generation); });
        need(startup !== undefined); return this.writer.execute(slot.generation, startup, slot.agedClock);
      }
      case "copy-close": { return this.writer.finishNormalClose(id); }
      case "copy-observe-termination": { return this.writer.observeFinish(id); }
      case "verification-start": { return this.verifier.start(this.writer.getVerificationContinuation(id)); }
      case "verification-admit": { return this.verifier.admit(id); }
      case "verification-caches": { return this.verifier.observeCaches(id); }
      case "verification-open": { return this.verifier.openProject(id); }
      case "verification-read": { return this.verifier.collectSavedContent(id); }
      case "verification-close": { return this.verifier.finishNormalClose(id); }
      case "verification-finish": { return this.verifier.observeFinish(id); }
      case "cleanup-close": { need(slot.cleanup !== undefined); return slot.cleanup.finishNormalClose(id); }
      case "cleanup-observe-termination": { need(slot.cleanup !== undefined); return slot.cleanup.observeFinish(id); }
      default: { throw new Error("Unsupported copy operation phase."); }
    }
  }

  private next(slot: Slot, phase: CurrentSymbolCopyOperationPhase, result: Value): void {
    need(this.slot === slot);
    const next: Partial<Record<CurrentSymbolCopyOperationPhase, CurrentSymbolCopyOperationPhase>> = {
      "copy-write": "copy-close", "copy-close": "copy-observe-termination", "copy-observe-termination": "verification-start",
      "verification-start": "verification-admit", "verification-admit": "verification-caches", "verification-caches": "verification-open",
      "verification-open": "verification-read", "verification-read": "verification-close", "verification-close": "verification-finish",
      "cleanup-close": "cleanup-observe-termination",
    };
    if (phase === "verification-admit") {
      if (result["authentication"] === "pending") { need(result["admissionAttempted"] === false); slot.next = phase; return; }
      need(result["admitted"] === true);
    }
    if (phase.endsWith("observe-termination") || phase === "verification-finish") {
      if (result["termination"] === "pending") { slot.next = phase; return; }
      need(result["termination"] === "terminated");
    }
    if (phase === "copy-observe-termination") { need(result["verificationContinuationRetained"] === true); }
    if (phase === "verification-finish") {
      need(result["fullReopenReadbackInvariant"] === true); slot.copyVerified = true; slot.next = "completed"; return;
    }
    slot.next = next[phase] ?? "stopped";
  }

  private async failed(slot: Slot, phase: CurrentSymbolCopyOperationPhase): Promise<void> {
    slot.next = "stopped";
    let owner: CloseOwner = this.baseline;
    if (phase.startsWith("cleanup-")) { need(slot.cleanup !== undefined); owner = slot.cleanup; }
    else if (phase.startsWith("verification-")) { owner = this.verifier; }
    else {
      try { this.writer.inspect(slot.operationId); owner = this.writer; }
      catch {
        // No writer transfer: the original baseline still owns normal closure.
      }
    }
    slot.cleanup = owner;
    try {
      const result = await owner.inspect(slot.operationId); slot.last = structuredClone(result);
      if (result["retired"] === true || result["finished"] === true) { return; }
      if (result["finishObservationAvailable"] === true) { slot.next = "cleanup-observe-termination"; return; }
      if (phase.endsWith("observe-termination") || phase === "verification-finish") { return; }
      if (result[owner === this.baseline ? "finishCloseAttempted" : "closeAttempted"] === true) { return; }
      if (owner === this.verifier && result["launchAcknowledged"] !== true) { return; }
      slot.next = "cleanup-close";
    } catch {
      // Missing original ownership cannot be reconstructed from JSON.
    }
  }
}
