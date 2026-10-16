/** Retains one disposable forward/inverse lifecycle. Never restores from JSON. */
import type { CurrentProjectOnlySymbolGeneration, CurrentSymbolBaselineCoordinator } from "./current-symbol-baseline-runtime.ts";
import type { OriginalCurrentAgedSqlClock } from "./current-aged-sql-issuer.ts";
// oxlint-disable-next-line import/no-cycle -- Inverse ownership is issued from the original verified result, not reconstructed through a caller-supplied factory.
import { CurrentSymbolInverseCoordinator } from "./current-symbol-inverse-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Qualification consumes the retained baseline registry; no caller factory or reconstructed generation is admitted.
import { qualifyCurrentSymbolWriterStartup } from "./current-symbol-startup-runtime.ts";
import { currentSymbolValidationStepSchema } from "./current-symbol-validation.ts";
import type { CurrentSymbolValidationPhase, CurrentSymbolValidationStep } from "./current-symbol-validation.ts";
// oxlint-disable-next-line import/no-cycle -- The retained verification owner consumes only original writer continuations from this lifecycle.
import { CurrentSymbolVerificationCoordinator } from "./current-symbol-verification-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- The original writer transfers the opener's baseline registry rather than accepting an injected authority callback.
import { CurrentSymbolWriterCoordinator } from "./current-symbol-writer-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type Value = Readonly<Record<string, unknown>>;
type CloseOwner = CurrentSymbolBaselineCoordinator | CurrentSymbolInverseCoordinator | CurrentSymbolWriterCoordinator | CurrentSymbolVerificationCoordinator;
interface Slot {
  readonly operationId: string;
  readonly generation: CurrentProjectOnlySymbolGeneration;
  readonly agedClock: OriginalCurrentAgedSqlClock;
  next: CurrentSymbolValidationPhase | "completed" | "stopped";
  inverseOperationId?: string;
  cleanup?: { owner: CloseOwner; operationId: string };
  attempted: CurrentSymbolValidationPhase[];
  last?: Value;
  failedPhase?: CurrentSymbolValidationPhase;
  forwardVerified: boolean;
  inverseVerified: boolean;
}
function need(value: boolean, message = "Disposable validation requires its original owner and exact next phase."): asserts value {
  if (!value) { throw new Error(message); }
}

/** Constructed only by the original disposable opener. Stage coordinators still
 * enforce their private registries, journals and native capabilities themselves.
 */
export class CurrentSymbolValidationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly baseline: CurrentSymbolBaselineCoordinator;
  private readonly forwardWriter: CurrentSymbolWriterCoordinator;
  private readonly forwardVerifier: CurrentSymbolVerificationCoordinator;
  private readonly inverse: CurrentSymbolInverseCoordinator;
  private readonly inverseWriter: CurrentSymbolWriterCoordinator;
  private readonly inverseVerifier: CurrentSymbolVerificationCoordinator;
  private slot?: Slot;
  private busy = false;

  public constructor(engine: EasyedaControlEngine, baseline: CurrentSymbolBaselineCoordinator) {
    this.engine = engine; this.baseline = baseline;
    this.forwardWriter = new CurrentSymbolWriterCoordinator(engine); this.forwardVerifier = new CurrentSymbolVerificationCoordinator(engine);
    this.inverse = new CurrentSymbolInverseCoordinator(engine);
    this.inverseWriter = new CurrentSymbolWriterCoordinator(engine); this.inverseVerifier = new CurrentSymbolVerificationCoordinator(engine);
  }

  /** No dispatch. Preserve the original baseline even when later startup fails. */
  public begin(operationId: string): Value {
    need(this.slot === undefined && !this.busy, "Disposable validation already retained its one original baseline.");
    const generation = this.baseline.getProjectOnlyGeneration(operationId);
    const agedClock = this.baseline.getAgedClock(operationId);
    this.slot = { operationId, generation, agedClock, next: "forward-write", attempted: [], forwardVerified: false, inverseVerified: false };
    return this.inspect(operationId);
  }

  public inspect(operationId: string): Value {
    const slot = this.slot; need(slot !== undefined && slot.operationId === operationId);
    return Object.freeze({ profile: "easyeda-pro-control.current-symbol-disposable-validation.v1", operationId,
      inverseOperationId: slot.inverseOperationId ?? null, nextPhase: slot.next, busy: this.busy,
      attemptedPhases: [...slot.attempted], failedPhase: slot.failedPhase ?? null, lastResult: slot.last === undefined ? null : structuredClone(slot.last),
      originalOwnerRetained: true, forwardVerified: slot.forwardVerified, inverseVerified: slot.inverseVerified,
      metadataRestorationVerified: slot.forwardVerified && slot.inverseVerified, historicalDatabaseBytesRestored: false,
      normalWritersEnabled: false, explicitSaveDispatched: false, replayAllowed: false, executionAuthorized: false });
  }

  /** The expected phase is checked before consuming anything. A retry of a lost
   * response cannot silently enter the next mutation, launch or closure stage.
   */
  public async advance(operationId: string, input: CurrentSymbolValidationStep): Promise<Value> {
    const slot = this.slot, step = currentSymbolValidationStepSchema.parse(input);
    need(!this.busy && slot !== undefined && slot.operationId === operationId && slot.next === step.expectedPhase);
    this.busy = true; slot.next = "stopped"; slot.attempted.push(step.expectedPhase);
    try {
      const result = await this.perform(slot, step.expectedPhase); slot.last = structuredClone(result);
      // A retained coordinator may return a stopped diagnostic instead of
      // Throwing. It never becomes permission for the following stage.
      need(step.expectedPhase.startsWith("cleanup-") || (result["failed"] !== true && result["state"] !== "stopped" && result["state"] !== "baseline-stopped"),
        "Disposable validation retained a stopped stage; inspect its original owner.");
      this.next(slot, step.expectedPhase, result);
    } catch (error) {
      slot.failedPhase ??= step.expectedPhase;
      try { await this.failed(slot, step.expectedPhase); }
      catch (cleanupError) {
        throw new AggregateError([error, cleanupError], "Disposable validation failed and its retained cleanup owner needs inspection.", { cause: cleanupError });
      }
      throw error;
    } finally { this.busy = false; }
    return this.inspect(operationId);
  }

  private async write(generation: CurrentProjectOnlySymbolGeneration, agedClock: OriginalCurrentAgedSqlClock,
    writer: CurrentSymbolWriterCoordinator): Promise<Value> {
    await this.engine.assertBridgeAndRecoveryAdmission(generation.operationId);
    const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined);
    let startup: Awaited<ReturnType<typeof qualifyCurrentSymbolWriterStartup>> | undefined;
    await scope.call(this.engine.upstream, async () => { startup = await qualifyCurrentSymbolWriterStartup(this.engine, generation); });
    need(startup !== undefined);
    return writer.execute(generation, startup, agedClock);
  }

  private async perform(slot: Slot, phase: CurrentSymbolValidationPhase): Promise<Value> {
    const id = slot.operationId;
    switch (phase) {
      case "forward-write": { return this.write(slot.generation, slot.agedClock, this.forwardWriter); }
      case "forward-close": { return this.forwardWriter.finishNormalClose(id); }
      case "forward-observe-termination": { return this.forwardWriter.observeFinish(id); }
      case "forward-verification-start": { return this.forwardVerifier.start(this.forwardWriter.getVerificationContinuation(id)); }
      case "forward-verification-admit": { return this.forwardVerifier.admit(id); }
      case "forward-verification-caches": { return this.forwardVerifier.observeCaches(id); }
      case "forward-verification-open": { return this.forwardVerifier.openProject(id); }
      case "forward-verification-read": { return this.forwardVerifier.collectSavedContent(id); }
      case "forward-verification-close": { return this.forwardVerifier.finishNormalClose(id); }
      case "forward-verification-finish": { return this.forwardVerifier.observeFinish(id, true); }
      case "inverse-prepare": {
        const result = await this.inverse.prepare(this.forwardVerifier.getResultContinuation(id));
        need(typeof result["operationId"] === "string" && result["operationId"] !== id && result["prepared"] === true);
        slot.inverseOperationId = result["operationId"]; return result;
      }
      case "inverse-relaunch": { return this.inverse.relaunch(this.inverseId(slot)); }
      case "inverse-admit": { return this.inverse.admit(this.inverseId(slot)); }
      case "inverse-caches": { return this.inverse.observeCaches(this.inverseId(slot)); }
      case "inverse-open": { return this.inverse.openProject(this.inverseId(slot)); }
      case "inverse-clock": { return this.inverse.observeAgedClock(this.inverseId(slot)); }
      case "inverse-write": {
        const inverseId = this.inverseId(slot);
        return this.write(this.inverse.getProjectOnlyGeneration(inverseId), this.inverse.getAgedClock(inverseId), this.inverseWriter);
      }
      case "inverse-close": { return this.inverseWriter.finishNormalClose(this.inverseId(slot)); }
      case "inverse-observe-termination": { return this.inverseWriter.observeFinish(this.inverseId(slot)); }
      case "inverse-verification-start": { return this.inverseVerifier.start(this.inverseWriter.getVerificationContinuation(this.inverseId(slot))); }
      case "inverse-verification-admit": { return this.inverseVerifier.admit(this.inverseId(slot)); }
      case "inverse-verification-caches": { return this.inverseVerifier.observeCaches(this.inverseId(slot)); }
      case "inverse-verification-open": { return this.inverseVerifier.openProject(this.inverseId(slot)); }
      case "inverse-verification-read": { return this.inverseVerifier.collectSavedContent(this.inverseId(slot)); }
      case "inverse-verification-close": { return this.inverseVerifier.finishNormalClose(this.inverseId(slot)); }
      case "inverse-verification-finish": { return this.inverseVerifier.observeFinish(this.inverseId(slot)); }
      case "cleanup-close": { need(slot.cleanup !== undefined); return slot.cleanup.owner.finishNormalClose(slot.cleanup.operationId); }
      case "cleanup-observe-termination": { need(slot.cleanup !== undefined); return slot.cleanup.owner.observeFinish(slot.cleanup.operationId); }
      default: { throw new Error("Disposable validation phase is unsupported."); }
    }
  }

  private inverseId(slot: Slot): string { need(this.slot === slot && slot.inverseOperationId !== undefined); return slot.inverseOperationId; }

  private next(slot: Slot, phase: CurrentSymbolValidationPhase, result: Value): void {
    const next: Partial<Record<CurrentSymbolValidationPhase, CurrentSymbolValidationPhase>> = {
      "forward-write": "forward-close", "forward-close": "forward-observe-termination", "forward-observe-termination": "forward-verification-start",
      "forward-verification-start": "forward-verification-admit", "forward-verification-admit": "forward-verification-caches",
      "forward-verification-caches": "forward-verification-open", "forward-verification-open": "forward-verification-read",
      "forward-verification-read": "forward-verification-close", "forward-verification-close": "forward-verification-finish",
      "forward-verification-finish": "inverse-prepare", "inverse-prepare": "inverse-relaunch", "inverse-relaunch": "inverse-admit",
      "inverse-admit": "inverse-caches", "inverse-caches": "inverse-open", "inverse-open": "inverse-clock", "inverse-clock": "inverse-write",
      "inverse-write": "inverse-close", "inverse-close": "inverse-observe-termination", "inverse-observe-termination": "inverse-verification-start",
      "inverse-verification-start": "inverse-verification-admit", "inverse-verification-admit": "inverse-verification-caches",
      "inverse-verification-caches": "inverse-verification-open", "inverse-verification-open": "inverse-verification-read",
      "inverse-verification-read": "inverse-verification-close", "inverse-verification-close": "inverse-verification-finish",
      "cleanup-close": "cleanup-observe-termination",
    };
    if (phase === "forward-verification-admit" || phase === "inverse-verification-admit" || phase === "inverse-admit") {
      if (result["authentication"] === "pending") {
        need(result["admissionAttempted"] === false); slot.next = phase; return;
      }
      need(result[phase === "inverse-admit" ? "admissionProved" : "admitted"] === true);
    }
    if (phase.endsWith("observe-termination") || phase.endsWith("verification-finish")) {
      if (result["termination"] === "pending") { slot.next = phase; return; }
      need(result["termination"] === "terminated");
    }
    if (phase === "forward-observe-termination" || phase === "inverse-observe-termination") { need(result["verificationContinuationRetained"] === true); }
    if (phase === "forward-verification-finish") {
      this.forwardVerifier.getResultContinuation(slot.operationId); slot.forwardVerified = true;
    }
    if (phase === "inverse-verification-finish") {
      need(result["fullReopenReadbackInvariant"] === true); slot.inverseVerified = true; slot.next = "completed"; return;
    }
    slot.next = next[phase] ?? "stopped";
  }

  /** Errors keep the actual close owner. No failed writer can acquire a
   * verification continuation, even if its closed diagnostic finds the effect.
   */
  private async failed(slot: Slot, phase: CurrentSymbolValidationPhase): Promise<void> {
    slot.next = "stopped";
    let operationId = slot.operationId, owner: CloseOwner;
    if (phase === "inverse-prepare") {
      const retained = await this.inverse.inspect();
      if (retained["cleanupOwner"] === "predecessor-verifier") { owner = this.forwardVerifier; }
      else if (retained["cleanupOwner"] === "inverse-baseline") {
        need(typeof retained["operationId"] === "string" && retained["operationId"] !== slot.operationId);
        operationId = retained["operationId"]; slot.inverseOperationId = operationId; owner = this.inverse;
      } else { return; }
    }
    else if (phase === "cleanup-close" || phase === "cleanup-observe-termination") { need(slot.cleanup !== undefined); ({ owner, operationId } = slot.cleanup); }
    else if (phase.startsWith("forward-verification-")) { owner = this.forwardVerifier; }
    else if (phase.startsWith("inverse-verification-")) { owner = this.inverseVerifier; operationId = this.inverseId(slot); }
    else if (phase.startsWith("inverse-")) { owner = this.inverse; operationId = this.inverseId(slot); }
    else { owner = this.baseline; }
    let writer: CurrentSymbolWriterCoordinator | undefined;
    if (phase === "forward-write" || phase === "forward-close" || phase === "forward-observe-termination") { writer = this.forwardWriter; }
    else if (phase === "inverse-write" || phase === "inverse-close" || phase === "inverse-observe-termination") { writer = this.inverseWriter; }
    if (writer !== undefined) {
      try { writer.inspect(operationId); owner = writer; }
      catch {
        // The original baseline retains closure when writer transfer never occurred.
      }
    }
    slot.cleanup = { owner, operationId };
    try {
      const result = await owner.inspect(operationId);
      slot.last = structuredClone(result);
      if (result["retired"] === true || result["finished"] === true) { return; }
      if (result["finishObservationAvailable"] === true) { slot.next = "cleanup-observe-termination"; return; }
      if (phase.endsWith("observe-termination") || phase.endsWith("verification-finish")) { return; }
      const baselineOwner = owner === this.baseline || owner === this.inverse;
      if (result[baselineOwner ? "finishCloseAttempted" : "closeAttempted"] === true) { return; }
      if ((owner === this.forwardVerifier || owner === this.inverseVerifier) && result["launchAcknowledged"] !== true) { return; }
      if (owner === this.inverse && result["relaunchAttempted"] === true && result["launchAcknowledged"] !== true) { return; }
      slot.next = "cleanup-close";
    } catch {
      // Missing original ownership is review-only, never reconstructed.
    }
  }
}
