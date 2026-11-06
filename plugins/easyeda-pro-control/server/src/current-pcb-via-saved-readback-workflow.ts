/** Private saved/reopened workflow. Constructor data cannot supply an owner,
 * function table, session, target selector or replacement generation. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { setTimeout as delay } from "node:timers/promises";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "./current-pcb-209-start-page-selection.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { assertOriginalCurrentPcbViaSavedReadbackOwner, currentPcbViaSavedReadbackAllocationOutcome,
  originalCurrentPcbViaSavedReadbackTarget, originalCurrentPcbViaSavedReadbackTermination,
  requireOriginalCurrentPcbViaSavedLoadOrigin, startCurrentPcbViaSavedReadbackOwner } from "./current-pcb-via-saved-readback-owner.ts";
import type { CurrentPcbViaSavedReadbackOwner, CurrentPcbViaSavedReopenedModel } from "./current-pcb-via-saved-readback-owner.ts";
import { observeOriginalCurrentPcbViaSavedCaches } from "./current-pcb-via-saved-cache-observer.ts";
import { requireOriginalCurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import { CurrentPcbViaSavedReadbackClosedCapture, requireOriginalCurrentPcbViaSavedReadbackClosedProof } from "./current-pcb-via-saved-readback-closed-proof.ts";
import type { CurrentPcbViaSavedReadbackClosedProof } from "./current-pcb-via-saved-readback-closed-proof.ts";

const attempts = new WeakSet<CurrentPcbViaWriteClosedCheckpoint>();
const EXIT = Object.freeze({ observations: 40, delayMilliseconds: 250 });
export interface CurrentPcbViaSavedReadbackWorkflowResult {
  readonly schema: "private.current-pcb-via-saved-readback-workflow-result.v1";
  readonly operationId: string; readonly model: CurrentPcbViaSavedReopenedModel; readonly proof: CurrentPcbViaSavedReadbackClosedProof;
  readonly originalNormalCloseObserved: true; readonly originalReaderHelperReleased: true;
  readonly persistenceVerified: true; readonly reopenedVerified: true; readonly executionAuthorized: false;
}
const results = new WeakMap<CurrentPcbViaSavedReadbackWorkflowResult, CurrentPcbViaSavedReadbackWorkflow>();

export class CurrentPcbViaSavedReadbackWorkflow {
  readonly #options: CurrentPcbDiagnosticInstallationOptions; readonly #prepared: CurrentPcbViaWriteClosedCheckpoint;
  #owner: CurrentPcbViaSavedReadbackOwner | null = null;
  #factory: Promise<CurrentPcbViaSavedReadbackOwner> | null = null; #factorySettled = false;
  #execution: Promise<CurrentPcbViaSavedReadbackWorkflowResult> | null = null;
  #cleanup: Promise<void> | null = null; #cleanupSettled = false; #cleanupExitWaitExhausted = false;
  #cleanupBinding: string | null = null; #settlement: Promise<void> | null = null; #abort: Promise<void> | null = null; #release: Promise<void> | null = null;
  #pending: Promise<unknown> | null = null; #stage = "prepared"; #failed = false; #aborted = false;
  #closed = false; #normalClose = false; #cleanupComplete = false;
  #capture: CurrentPcbViaSavedReadbackClosedCapture | null = null;
  #result: CurrentPcbViaSavedReadbackWorkflowResult | null = null;
  public constructor(options: CurrentPcbDiagnosticInstallationOptions, prepared: CurrentPcbViaWriteClosedCheckpoint) {
    requireOriginalCurrentPcbViaWriteClosedCheckpoint(prepared); captureCurrentPcbStringClockReply(options);
    if (attempts.has(prepared) || !Object.isFrozen(options)) { throw new Error("SAVED_WORKFLOW_ORIGINAL_PREPARATION"); }
    attempts.add(prepared); this.#options = options; this.#prepared = prepared;
  }
  public inspect(): Readonly<Record<string, unknown>> {
    return Object.freeze({ schema: "private.current-pcb-via-saved-readback-workflow-status.v1", operationId: this.#prepared.operationId,
      stage: this.#stage, started: this.#execution !== null, pending: this.#pending !== null || this.#factory !== null && !this.#factorySettled, failed: this.#failed, abortAttempted: this.#abort !== null,
      originalClosureObserved: this.#closed, cleanupSettled: this.#cleanupSettled, cleanupExitWaitExhausted: this.#cleanupExitWaitExhausted, settlementAttempted: this.#settlement !== null, normalCloseAttempted: this.#normalClose, cleanupComplete: this.#cleanupComplete,
      allocation: currentPcbViaSavedReadbackAllocationOutcome(this.#prepared).state,
      owner: this.#owner?.status() ?? null, capture: this.#capture?.status() ?? null,
      persistenceVerified: this.#result !== null, reopenedVerified: this.#result !== null, executionAuthorized: false });
  }
  #current(owner: CurrentPcbViaSavedReadbackOwner, cleanup = false): void {
    assertOriginalCurrentPcbViaSavedReadbackOwner(owner);
    if (this.#owner !== owner || originalCurrentPcbViaSavedReadbackTarget(owner) !== this.#prepared || !cleanup && this.#aborted) { throw new Error("SAVED_WORKFLOW_ORIGINAL_OWNER"); }
  }
  async #step<T>(stage: string, owner: CurrentPcbViaSavedReadbackOwner, invoke: () => Promise<T>): Promise<T> {
    this.#current(owner); if (this.#pending !== null) { throw new Error("SAVED_WORKFLOW_ORIGINAL_PENDING"); }
    this.#stage = stage; const pending = invoke(); this.#pending = pending;
    try { const result = await pending; this.#current(owner); return result; }
    finally { if (this.#pending === pending) { this.#pending = null; } }
  }
  async #observeExit(owner: CurrentPcbViaSavedReadbackOwner, cleanup: boolean): Promise<void> {
    for (let index = 0; index < EXIT.observations; index += 1) {
      this.#current(owner, cleanup);
      const pending = owner.observeTermination(); this.#pending = pending; let terminated: boolean;
      try { terminated = await pending; } finally { if (this.#pending === pending) { this.#pending = null; } }
      if (terminated) { this.#current(owner, cleanup); originalCurrentPcbViaSavedReadbackTermination(owner); this.#closed = true; return; }
      this.#current(owner, cleanup); if (index + 1 < EXIT.observations) { await delay(EXIT.delayMilliseconds); }
    }
    if (cleanup) { this.#cleanupExitWaitExhausted = true; }
    throw new Error("SAVED_WORKFLOW_ORIGINAL_EXIT_NOT_OBSERVED");
  }
  async #releaseClosed(owner: CurrentPcbViaSavedReadbackOwner): Promise<void> {
    this.#current(owner, true);
    if (!this.#closed) { throw new Error("SAVED_WORKFLOW_ORIGINAL_CLOSURE_REQUIRED"); }
    this.#release ??= owner.releaseClosed();
    await this.#release; this.#current(owner, true);
    if (!owner.status().released || !owner.status().helperClosed) { throw new Error("SAVED_WORKFLOW_ORIGINAL_HELPER_NOT_CLOSED"); }
    this.#cleanupComplete = true;
  }
  public execute(): Promise<CurrentPcbViaSavedReadbackWorkflowResult> {
    if (this.#execution !== null) { return this.#execution; }
    if (this.#aborted) { throw new Error("SAVED_WORKFLOW_ABORTED_BEFORE_EXECUTION"); }
    const execution = (async (): Promise<CurrentPcbViaSavedReadbackWorkflowResult> => {
      try {
        this.#stage = "native-birth"; this.#factory = startCurrentPcbViaSavedReadbackOwner(this.#options, this.#prepared);
        let owner: CurrentPcbViaSavedReadbackOwner; try { owner = await this.#factory; } finally { this.#factorySettled = true; } this.#owner = owner; this.#current(owner);
        await this.#step("native-launch", owner, () => owner.startSavedReadbackGeneration());
        await this.#step("original-main", owner, () => owner.observeFootprintMainConstruction());
        const browser = await this.#step("browser", owner, () => owner.observeSavedReadbackStartPage());
        const selected = selectCurrentPcb209StartPage(browser);
        const frames = await this.#step("frames", owner, () => owner.inspectFrames(selected.targetId));
        const frame = selectCurrentPcb209StartPageFrame(frames, selected);
        await this.#step("ui-source", owner, () => owner.inspectScript(frame.frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui));
        const origin = await this.#step("cache-origin", owner, () => owner.createSavedReadbackCacheOrigin());
        await this.#step("complete-cache-backup-observations", owner, () => observeOriginalCurrentPcbViaSavedCaches(owner, this.#prepared, origin));
        await this.#step("durable-cache-backup", owner, () => owner.publishSavedCacheBackup());
        await this.#step("exact-cache-invalidation", owner, () => owner.invalidateSavedCaches());
        await this.#step("cold-loading-preparation", owner, () => owner.prepareSavedReadbackLoading());
        await this.#step("original-cold-worker", owner, () => owner.armSavedReadbackLoadWorker(async source => {
          this.#current(owner); const original = requireOriginalCurrentPcbViaSavedLoadOrigin(source, owner, this.#prepared);
          await original.assertCurrent(); this.#current(owner);
        }));
        await this.#step("registration-intent", owner, () => owner.prepareSavedReadbackRegistrationIntent());
        await this.#step("original-registration", owner, () => owner.registerSavedReadbackProject());
        const project = await this.#step("original-project-open-and-cold-load", owner, () => owner.openSavedReadbackProject());
        if (!project.ok) { throw new Error("SAVED_WORKFLOW_PROJECT_OPEN_REFUSED"); }
        const pcb = await this.#step("original-pcb-open", owner, () => owner.openSavedReadbackPcb());
        if (!pcb.ok) { throw new Error("SAVED_WORKFLOW_PCB_OPEN_REFUSED"); }
        await this.#step("pcb-source-and-frame", owner, () => owner.observeSavedReadbackPcbOpening());
        await this.#step("original-four-family-dto", owner, () => owner.observeSavedReadbackPrimitives());
        await this.#step("complete-original-scene", owner, () => owner.observeSavedReadbackScene());
        this.#current(owner); const model = owner.qualifySavedReadbackModel();
        const hwnd = await this.#step("original-window", owner, () => owner.observeApplicationWindow());
        if (hwnd === null) { throw new Error("SAVED_WORKFLOW_ORIGINAL_WINDOW_REQUIRED"); }
        this.#normalClose = true; await this.#step("normal-close", owner, () => owner.requestNormalClose(hwnd));
        this.#stage = "original-exit"; await this.#observeExit(owner, false); this.#current(owner);
        const termination = originalCurrentPcbViaSavedReadbackTermination(owner);
        this.#capture = new CurrentPcbViaSavedReadbackClosedCapture(owner, termination, model);
        const proof = await this.#step("complete-closed-source-and-sql", owner, () => {
          const capture = this.#capture; if (capture === null) { throw new Error("SAVED_WORKFLOW_ORIGINAL_CAPTURE"); } return capture.capture();
        });
        await this.#capture.settleRelease(); this.#current(owner); requireOriginalCurrentPcbViaSavedReadbackClosedProof(proof, owner, model);
        this.#stage = "original-helper-release"; await this.#releaseClosed(owner);
        requireOriginalCurrentPcbViaSavedReadbackClosedProof(proof, owner, model);
        if (this.#aborted) { throw new Error("SAVED_WORKFLOW_ABORTED_BEFORE_PUBLICATION"); }
        const result: CurrentPcbViaSavedReadbackWorkflowResult = Object.freeze({ schema: "private.current-pcb-via-saved-readback-workflow-result.v1",
          operationId: this.#prepared.operationId, model, proof, originalNormalCloseObserved: true, originalReaderHelperReleased: true,
          persistenceVerified: true, reopenedVerified: true, executionAuthorized: false });
        results.set(result, this); this.#result = result; this.#stage = "complete"; return result;
      } catch (caughtError) {
        this.#failed = true;
        try { await this.#cleanupOriginal(); } catch {
          // Retain the same cleanup Promise and unresolved original resources.
        }
        throw caughtError;
      }
    })(); this.#execution = execution; return execution;
  }
  #cleanupOriginal(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; }
    const cleanup = (async (): Promise<void> => {
      if (this.#owner === null && this.#factory !== null) { try { this.#owner = await this.#factory; } catch { this.#owner = currentPcbViaSavedReadbackAllocationOutcome(this.#prepared).owner; } }
      const owner = this.#owner;
      if (owner === null) {
        const outcome = currentPcbViaSavedReadbackAllocationOutcome(this.#prepared);
        if (outcome.state !== "not-attempted" && outcome.state !== "no-resource") { throw new Error("SAVED_WORKFLOW_ORIGINAL_ALLOCATION_UNRESOLVED"); }
        this.#cleanupComplete = true; return;
      }
      this.#current(owner, true); const state = owner.status();
      if (state.released && state.helperClosed) { this.#cleanupComplete = true; return; }
      if (state.binding === null) {
        const pending = this.#pending; if (pending !== null) { try { await pending; } catch {
          // Original failure remains retained by execution.
        } }
        const current = owner.status();
        if (current.binding === null) {
          if (this.#release === null) {
            if (current.noProcessCleanupAvailable) { this.#release = (async (): Promise<void> => { await owner.releaseNoProcess(); })(); }
            else if (current.launchConsumed) { throw new Error("SAVED_WORKFLOW_ORIGINAL_LAUNCH_UNRESOLVED"); }
            else { this.#release = owner.releaseUnlaunched(); }
          }
          await this.#release; this.#current(owner, true);
          if (!owner.status().released || !owner.status().helperClosed) { throw new Error("SAVED_WORKFLOW_ORIGINAL_HELPER_NOT_CLOSED"); }
          this.#cleanupComplete = true; return;
        }
      }
      const binding = owner.status().binding;
      if (binding === null || this.#cleanupBinding !== null && this.#cleanupBinding !== canonicalJson(binding)) { throw new Error("SAVED_WORKFLOW_ORIGINAL_CLEANUP_BINDING"); }
      this.#cleanupBinding = canonicalJson(binding);
      if (!this.#closed) {
        if (this.#abort === null) { this.#aborted = true; this.#abort = owner.abortSavedReadback(true); }
        await this.#abort;
        const pending = this.#pending; if (pending !== null) { try { await pending; } catch {
            // Keep the actual original parent settlement.
          } }
        await this.#observeExit(owner, true);
      }
      const pending = this.#pending;
      if (pending !== null) { try { await pending; } catch {
        // Join every original operation before releasing its helper.
      } }
      await this.#releaseClosed(owner);
    })();
    const retained = (async (): Promise<void> => { try { await cleanup; } finally { this.#cleanupSettled = true; } })(); this.#cleanup = retained; return retained;
  }
  public abort(confirmOriginalJobOnly: true): Promise<void> {
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- The runtime caller must explicitly confirm this original Job-only cleanup.
    if (confirmOriginalJobOnly !== true) { throw new Error("SAVED_WORKFLOW_ORIGINAL_JOB_CONFIRMATION"); }
    this.#aborted = true; return this.#settlement ?? this.#cleanupOriginal();
  }
  public requireOriginalResult(result: CurrentPcbViaSavedReadbackWorkflowResult): CurrentPcbViaSavedReadbackWorkflowResult {
    const owner = this.#owner;
    if (this.#result !== result || results.get(result) !== this || owner === null || !this.#cleanupComplete || !this.#closed || !this.#normalClose) { throw new Error("SAVED_WORKFLOW_ORIGINAL_RESULT"); }
    this.#current(owner, true); requireOriginalCurrentPcbViaSavedReadbackClosedProof(result.proof, owner, result.model);
    if (!owner.status().released || !owner.status().helperClosed) { throw new Error("SAVED_WORKFLOW_ORIGINAL_HELPER_NOT_CLOSED"); } return result;
  }
  /** Only a privately recorded exhausted cleanup wait admits one further
   * bounded read-only round. Consumed controls are never reconstructed. */
  public settleCleanup(): Promise<void> {
    const cleanup = this.#cleanup;
    if (cleanup === null) { return Promise.reject(new Error("SAVED_WORKFLOW_CLEANUP_NOT_SUBMITTED")); }
    if (this.#settlement !== null) { return this.#settlement; }
    if (!this.#cleanupSettled || !this.#cleanupExitWaitExhausted) { return cleanup; }
    const binding = this.#cleanupBinding, owner = this.#owner;
    if (owner === null || binding === null) { return Promise.reject(new Error("SAVED_WORKFLOW_ORIGINAL_SETTLEMENT_BINDING")); }
    const settlement = (async (): Promise<void> => {
      try { await cleanup; } catch {
        // Preserve the original failed operation and its exhausted wait.
      }
      const current = (): void => { this.#current(owner, true);
        if (this.#owner !== owner || this.#cleanupBinding !== binding || canonicalJson(owner.status().binding) !== binding) { throw new Error("SAVED_WORKFLOW_ORIGINAL_SETTLEMENT_BINDING"); } };
      current(); await this.#observeExit(owner, true); current();
      await this.#releaseClosed(owner); current();
      // No result or data proof is issued from cleanup settlement.
    })(); this.#settlement = settlement; return settlement;
  }
}
export function requireOriginalCurrentPcbViaSavedReadbackWorkflowResult(result: CurrentPcbViaSavedReadbackWorkflowResult,
  workflow: CurrentPcbViaSavedReadbackWorkflow): CurrentPcbViaSavedReadbackWorkflowResult {
  if (results.get(result) !== workflow) { throw new Error("SAVED_WORKFLOW_ORIGINAL_RESULT"); } return workflow.requireOriginalResult(result);
}
