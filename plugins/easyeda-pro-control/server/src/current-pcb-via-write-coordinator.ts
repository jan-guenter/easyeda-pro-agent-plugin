/** Disposable Via action composition. This private coordinator consumes one
 * genuine staged source and never accepts a path, owner, callback table or
 * serialized checkpoint. Public registration remains a separate index task. */
/* oxlint-disable import/max-dependencies -- One fixed original coordinator owns preparation, retained execution, historical journal qualification and the separate immutable sidecar without injecting caller authority. */
import { canonicalJson } from "./core.ts";
import { createOriginalSourceError } from "./original-source-error.ts";
import { currentPcbViaWriteDiagnostic, currentPcbViaWriteErrorCode } from "./current-pcb-via-write-diagnostic.ts";
import type { CurrentPcbViaWriteDiagnostic } from "./current-pcb-via-write-diagnostic.ts";
import type {CurrentPcbViaWriteMainFailure} from "./current-pcb-via-write-main-failure.ts";
import { loadOperation } from "./artifacts.ts";
import { CurrentPcbViaWriteAbandonmentPublication } from "./current-pcb-via-write-abandonment.ts";
import type { CurrentPcbViaWriteAbandonmentInspection } from "./current-pcb-via-write-abandonment.ts";
import { currentPcbViaWriteHistoricalTerminal } from "./current-pcb-via-write-journal-codec.ts";
import type { CurrentPcbViaWriteFailureClosureBindings } from "./current-pcb-via-write-abandonment-origin.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { consumeManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import type { ManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import { prepareGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import { prepareCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { currentPcbViaWriteActionSchema, currentPcbViaWriteResultSchema } from "./current-pcb-via-write-contract.ts";
import type { CurrentPcbViaWriteAction, CurrentPcbViaWriteResult } from "./current-pcb-via-write-contract.ts";
import { CurrentPcbViaWriteWorkflow, requireOriginalCurrentPcbViaWriteFailureClosure } from "./current-pcb-via-write-workflow.ts";
import type { CurrentPcbViaWriteWorkflowResult } from "./current-pcb-via-write-workflow.ts";

/* oxlint-disable-next-line typescript/unbound-method -- Retain the original private-field workflow getter; a substituted instance/prototype method never supplies diagnostics. */
const originalMainFailure=CurrentPcbViaWriteWorkflow.prototype.mainFailure;
function need(value: boolean, code: string): asserts value { if (!value) { throw createOriginalSourceError("PCB_VIA_COORDINATOR", code); } }
type Preparation = Extract<CurrentPcbViaWriteAction, { action: "prepare" }>;
export class CurrentPcbViaWriteCoordinator {
  readonly #request: Preparation; readonly #requestText: string;
  readonly #preparation: Promise<CurrentPcbViaWriteResult>;
  #preparationSettled = false; #preparationFailed = false; #abortedBeforeExecution = false;
  #workflow: CurrentPcbViaWriteWorkflow | null = null;
  #execution: Promise<CurrentPcbViaWriteWorkflowResult> | null = null; #executionSettled = false; #executionFailed = false;
  #executeRequested = false;
  #executionObservation: Promise<void> | null = null;
  #failureSource: NonNullable<ReturnType<CurrentPcbViaWriteWorkflow["requireOriginalFailurePublicationSource"]>> | null = null;
  #failureBindings: CurrentPcbViaWriteFailureClosureBindings | null = null;
  #failurePublication: Promise<void> | null = null; #failureSettlement: Promise<void> | null = null;
  #failurePublicationPending = false; #failureWithoutJournal = false;
  #abandonment: CurrentPcbViaWriteAbandonmentPublication | null = null; #abandonmentResult: CurrentPcbViaWriteAbandonmentInspection | null = null;
  #shutdown: Promise<void> | null = null;
  #prebirthDiagnostic: CurrentPcbViaWriteDiagnostic | null = null;
  public constructor(options: CurrentPcbDiagnosticInstallationOptions, source: ManagedFixtureOpeningSource, input: unknown) {
    captureCurrentPcbStringClockReply(options); need(Object.isFrozen(options), "FROZEN_OPTIONS");
    const request = currentPcbViaWriteActionSchema.parse(input); need(request.action === "prepare", "PREPARE_REQUIRED");
    this.#request = Object.freeze(request); this.#requestText = canonicalJson(request);
    // Consumption is synchronous, before the first checkpoint await. Neither a
    // Failed preparation nor an identical JSON source can supply another birth.
    const original = consumeManagedFixtureOpeningSource(source);
    const preparation = (async (): Promise<CurrentPcbViaWriteResult> => {
      const prepared = await prepareGeneratedFixtureOpenCheckpoint(original);
      need(!this.#abortedBeforeExecution && this.#workflow === null, "PREPARATION_ABORTED");
      const plan = await prepareCurrentPcbViaWritePlan(prepared, { schema: "easyeda-pro-control.pcb209-via-write-request.v1", operationId: request.operationId, via: request.via });
      need(!this.#abortedBeforeExecution && this.#workflow === null, "PREPARATION_ABORTED");
      this.#workflow = new CurrentPcbViaWriteWorkflow(options, plan); return this.#workflow.operationResult("prepare");
    })(); this.#preparation = preparation;
    void (async (): Promise<void> => {
      try { await preparation; } catch (error) { this.#preparationFailed = true; this.#prebirthDiagnostic ??= currentPcbViaWriteDiagnostic("preparation", currentPcbViaWriteErrorCode(error)); } finally { this.#preparationSettled = true; }
    })(); Object.freeze(this);
  }
  public inspect(action: CurrentPcbViaWriteResult["action"] = "inspect"): CurrentPcbViaWriteResult {
    if (this.#workflow !== null) {
      const original = this.#workflow.operationResult(action);
      if (this.#abandonmentResult !== null) { need(this.#abandonmentResult.operationId === this.#request.operationId && !this.#abandonmentResult.saved && !this.#abandonmentResult.reopened, "ORIGINAL_ABANDONMENT_RESULT"); }
      if (this.#failurePublicationPending) { return currentPcbViaWriteResultSchema.parse({ ...original, state: "needs-cleanup", cleanup: { ...original.cleanup, publicationPending: true } }); }
      return this.#executionFailed && original.state === "prepared" ? currentPcbViaWriteResultSchema.parse({ ...original, state: "verification-pending" }) : original;
    }
    return currentPcbViaWriteResultSchema.parse({ schema: "easyeda-pro-control.pcb209-via-write-operation.v1", action, operationId: this.#request.operationId,
      state: this.#preparationSettled || this.#abortedBeforeExecution ? "verification-pending" : "running",
      effects: { createAttempted: false, createAcknowledged: false, saveAttempted: false, saveOutcome: "not-attempted" },
      verification: { saved: false, reopened: false, completeSqlVerified: false, peerRosterPreserved: false },
      cleanup: { generation: "none", allocation: "not-entered", nativeResourcesRetained: false, abortAttempted: false,
        originalTerminationVerified: false, helperReleaseVerified: false, publicationPending: false }, forwardOnly: true, inverseAvailable: false });
  }
  /** Native allocation starts only from the first explicitly confirmed execute.
   * Its original Promise is retained while inspection and cleanup stay callable. */
  public async run(input: unknown): Promise<CurrentPcbViaWriteResult> {
    const request = currentPcbViaWriteActionSchema.parse(input); need(request.operationId === this.#request.operationId, "ORIGINAL_OPERATION");
    if (request.action === "inspect") { return this.inspect(); }
    if (request.action === "prepare") { need(canonicalJson(request) === this.#requestText, "ORIGINAL_PREPARATION"); return this.#preparation; }
    if (request.action === "abort") { this.#abortedBeforeExecution = true; }
    if (request.action === "abort" && this.#workflow === null) { await Promise.allSettled([this.#preparation]); return this.inspect("abort"); }
    if (request.action === "execute") { need(!this.#executeRequested && !this.#abortedBeforeExecution, "EXECUTE_CONSUMED"); this.#executeRequested = true; }
    await this.#preparation; const workflow = this.#workflow; need(workflow !== null, "ORIGINAL_WORKFLOW");
    if (request.action === "execute") {
      // A preparation continuation can create the workflow just before an
      // Original abort wins this await. No execution or failure source exists.
      if (this.#abortedBeforeExecution) { this.#executionSettled = true; }
      need(!this.#abortedBeforeExecution, "EXECUTION_ABORTED_BEFORE_BIRTH");
      try {
        need(this.#execution === null, "ORIGINAL_EXECUTION"); const original = workflow.execute(); this.#execution = original;
        this.#executionObservation = (async (): Promise<void> => {
          try { const result = await original; workflow.requireOriginalResult(result); }
          catch { this.#executionFailed = true; }
          finally { this.#executionSettled = true; }
          if (this.#executionFailed) {
            try { await this.#publishOriginalFailure(); } catch {
              // Retain the failed original publication or resource precondition.
              // Its explicit cleanup/settlement action cannot repeat a write.
            }
          }
        })();
      } catch (caughtError) { this.#executionFailed = true; this.#executionSettled = true; this.#prebirthDiagnostic ??= currentPcbViaWriteDiagnostic("execution-start", currentPcbViaWriteErrorCode(caughtError)); throw caughtError; }
    } else if (request.action === "settle-publication") {
      // The original publisher rechecks this same journal around its awaits.
      // Join that attempt before the journal can enter settlement itself.
      await this.#joinOriginalExecution();
      if (!this.#failureWithoutJournal) { await workflow.settlePublication(); }
      if (this.#executionFailed) { await this.#settleOriginalFailure(); }
    } else {
      await (request.action === "abort" ? workflow.abort(request.confirmOriginalJobOnly) : workflow.settleCleanup());
      await this.#joinOriginalExecution();
      if (this.#executionFailed) { await this.#publishOriginalFailure(); }
    }
    return this.inspect(request.action);
  }
  async #joinOriginalExecution(): Promise<void> {
    if (this.#execution !== null) { await Promise.allSettled([this.#execution]); }
    if (this.#executionObservation !== null) { await this.#executionObservation; }
  }
  async #failureCurrent(): Promise<CurrentPcbViaWriteFailureClosureBindings> {
    const source = this.#failureSource; const workflow = this.#workflow; const bindings = this.#failureBindings;
    need(source !== null && workflow !== null && bindings !== null && workflow.requireOriginalFailurePublicationSource() === source &&
      requireOriginalCurrentPcbViaWriteFailureClosure(source.token, source.plan, source.journal) === bindings, "ORIGINAL_FAILURE_SOURCE");
    await bindings.assertCurrent();
    need(this.#workflow === workflow && workflow.requireOriginalFailurePublicationSource() === source &&
      requireOriginalCurrentPcbViaWriteFailureClosure(source.token, source.plan, source.journal) === bindings, "ORIGINAL_FAILURE_SOURCE"); return bindings;
  }
  /** The original failure source is acquired only after actual execution and
   * resource closure. Once publication starts, all callers retain that attempt. */
  #publishOriginalFailure(): Promise<void> {
    if (this.#failurePublication !== null) { return this.#failureSettlement ?? this.#failurePublication; }
    const workflow = this.#workflow; need(workflow !== null && this.#executionSettled && this.#executionFailed, "ORIGINAL_FAILURE_SETTLEMENT_REQUIRED");
    const source = workflow.requireOriginalFailurePublicationSource();
    if (source === null) { this.#failureWithoutJournal = true; this.#failurePublication = Promise.resolve(); return this.#failurePublication; }
    const bindings = requireOriginalCurrentPcbViaWriteFailureClosure(source.token, source.plan, source.journal);
    this.#failureSource = source; this.#failureBindings = bindings; this.#failurePublicationPending = true;
    const original = (async (): Promise<void> => {
      await this.#failureCurrent(); const journal = await loadOperation(source.plan.operationId); await this.#failureCurrent();
      if (!currentPcbViaWriteHistoricalTerminal(journal)) {
        this.#abandonment = new CurrentPcbViaWriteAbandonmentPublication(source.token, source.plan, source.journal);
        this.#abandonmentResult = await this.#abandonment.publish(); await this.#failureCurrent();
      }
      this.#failurePublicationPending = false;
    })(); this.#failurePublication = original; return original;
  }
  async #settleOriginalFailure(): Promise<void> {
    if (this.#failurePublication === null) { await this.#publishOriginalFailure(); return; }
    if (this.#failureSettlement !== null) { return this.#failureSettlement; }
    const original = this.#failurePublication;
    const settlement = (async (): Promise<void> => {
      await Promise.allSettled([original]);
      if (this.#failureWithoutJournal) { return; }
      const publication = this.#abandonment;
      if (publication === null) { await original; return; }
      await this.#failureCurrent(); this.#abandonmentResult = await publication.settle(); await this.#failureCurrent();
      this.#failurePublicationPending = false;
    })(); this.#failureSettlement = settlement; return settlement;
  }
  public hasActiveReservation(): boolean {
    if (!this.#preparationSettled || this.#failurePublicationPending || this.#executeRequested && !this.#executionSettled && !this.#preparationFailed) { return true; }
    return this.#workflow?.operationResult("inspect").state === "needs-cleanup";
  }
  public failureObserved(): boolean { return this.#preparationFailed || this.#executionFailed; }
  public mainFailure():CurrentPcbViaWriteMainFailure|null{
    const workflow=this.#workflow;if(workflow===null){return null;}
    need(Object.getPrototypeOf(workflow)===CurrentPcbViaWriteWorkflow.prototype&&Object.isFrozen(workflow)&&Reflect.ownKeys(workflow).length===0&&Object.getOwnPropertyDescriptor(CurrentPcbViaWriteWorkflow.prototype,"mainFailure")?.value===originalMainFailure,"MAIN_FAILURE_ORIGINAL_WORKFLOW");
    return originalMainFailure.call(workflow);
  }
  public diagnostic(): CurrentPcbViaWriteDiagnostic { return this.#prebirthDiagnostic ?? this.#workflow?.diagnostic() ?? currentPcbViaWriteDiagnostic("preparation", null); }
  /** Host shutdown joins this same operation's cleanup. It neither sends a
   * host/helper signal nor recreates an owner from the public status object. */
  public shutdownOriginal(): Promise<void> {
    if (this.#shutdown !== null) { return this.#shutdown; } this.#abortedBeforeExecution = true;
    const original = (async (): Promise<void> => {
      await Promise.allSettled([this.#preparation]); const workflow = this.#workflow;
      if (workflow !== null) { await workflow.abort(true); }
      await this.#joinOriginalExecution();
      if (workflow !== null && this.#executionFailed) { await this.#publishOriginalFailure(); }
      need(!this.hasActiveReservation(), "ORIGINAL_SHUTDOWN_CLEANUP_PENDING");
    })(); this.#shutdown = original; return original;
  }
}
