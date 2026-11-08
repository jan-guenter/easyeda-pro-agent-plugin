/** Disposable schematic action composition. This private coordinator consumes one
 * genuine staged source and never accepts a path, owner, callback table or
 * serialized checkpoint. Public registration remains a separate index task. */
/* oxlint-disable import/max-dependencies -- One fixed original coordinator owns preparation, retained execution, historical journal qualification and the separate immutable sidecar without injecting caller authority. */
import { canonicalJson } from "./core.ts";
import { createOriginalSourceError } from "./original-source-error.ts";
import { loadOperation } from "./artifacts.ts";
import { CurrentSchematicRelevanceDisplayWriteAbandonmentPublication } from "./current-schematic-relevance-display-write-abandonment.ts";
import type { CurrentSchematicRelevanceDisplayWriteAbandonmentInspection } from "./current-schematic-relevance-display-write-abandonment.ts";
import { schematicRelevanceDisplayWriteHistoricalTerminal } from "./current-schematic-relevance-display-write-abandonment-data.ts";
import type { CurrentSchematicRelevanceDisplayWriteFailureClosureBindings } from "./current-schematic-relevance-display-write-abandonment-origin.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { consumeManagedSchematicRelevanceFixtureSourceForFreshNativePreparation } from "./managed-schematic-relevance-fixture-opening-source.ts";
import type { ManagedSchematicRelevanceFixtureOpeningSource } from "./managed-schematic-relevance-fixture-opening-source.ts";
import { prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { prepareCurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import { currentSchematicRelevanceDisplayWriteActionSchema, currentSchematicRelevanceDisplayWriteResultSchema } from "./current-schematic-relevance-display-write-contract.ts";
import type { CurrentSchematicRelevanceDisplayWriteAction, CurrentSchematicRelevanceDisplayWriteResult } from "./current-schematic-relevance-display-write-contract.ts";
import { currentSchematicRelevanceDisplayWriteDiagnostic, currentSchematicRelevanceDisplayWriteErrorCode } from "./current-schematic-relevance-display-write-diagnostic.ts";
import type { CurrentSchematicRelevanceDisplayWriteDiagnostic } from "./current-schematic-relevance-display-write-diagnostic.ts";
import { requireCurrentSchematicRelevanceDisplayWriteCompositionSource } from "./current-schematic-relevance-display-write-observers.ts";
import type { CurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import { CurrentSchematicRelevanceDisplayWriteWorkflow, requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure } from "./current-schematic-relevance-display-write-workflow.ts";
import type { CurrentSchematicRelevanceDisplayWriteWorkflowResult } from "./current-schematic-relevance-display-write-workflow.ts";

function need(value: boolean, code: string): asserts value { if (!value) { throw createOriginalSourceError("SCHEMATIC_RELEVANCE_COORDINATOR", code); } }
type Preparation = Extract<CurrentSchematicRelevanceDisplayWriteAction, { action: "prepare" }>;
export class CurrentSchematicRelevanceDisplayWriteCoordinator {
  readonly #request: Preparation; readonly #requestText: string; readonly #options: CurrentPcbDiagnosticInstallationOptions;
  #plan: CurrentSchematicRelevanceDisplayWritePlan | null = null; #prebirthFailed = false;
  #prebirthDiagnostic: CurrentSchematicRelevanceDisplayWriteDiagnostic | null = null;
  readonly #preparation: Promise<CurrentSchematicRelevanceDisplayWriteResult>;
  #preparationSettled = false; #preparationFailed = false; #abortedBeforeExecution = false;
  #workflow: CurrentSchematicRelevanceDisplayWriteWorkflow | null = null;
  #execution: Promise<CurrentSchematicRelevanceDisplayWriteWorkflowResult> | null = null; #executionSettled = false; #executionFailed = false;
  #executeRequested = false;
  #abortAction: Promise<CurrentSchematicRelevanceDisplayWriteResult> | null = null;
  #executionObservation: Promise<void> | null = null;
  #failureSource: NonNullable<ReturnType<CurrentSchematicRelevanceDisplayWriteWorkflow["requireOriginalFailurePublicationSource"]>> | null = null;
  #failureBindings: CurrentSchematicRelevanceDisplayWriteFailureClosureBindings | null = null;
  #failurePublication: Promise<void> | null = null; #failureSettlement: Promise<void> | null = null;
  #failurePublicationPending = false; #failureWithoutJournal = false;
  #abandonment: CurrentSchematicRelevanceDisplayWriteAbandonmentPublication | null = null; #abandonmentResult: CurrentSchematicRelevanceDisplayWriteAbandonmentInspection | null = null;
  #shutdown: Promise<void> | null = null;
  public constructor(options: CurrentPcbDiagnosticInstallationOptions, source: ManagedSchematicRelevanceFixtureOpeningSource, input: unknown) {
    captureCurrentPcbStringClockReply(options); need(Object.isFrozen(options), "FROZEN_OPTIONS");
    const request = currentSchematicRelevanceDisplayWriteActionSchema.parse(input); need(request.action === "prepare", "PREPARE_REQUIRED");
    Object.freeze(request.patch); this.#request = Object.freeze(request); this.#requestText = canonicalJson(request); this.#options = options;
    // Consumption is synchronous, before the first checkpoint await. Neither a
    // Failed preparation nor an identical JSON source can supply another birth.
    const original = consumeManagedSchematicRelevanceFixtureSourceForFreshNativePreparation(source);
    const preparation = (async (): Promise<CurrentSchematicRelevanceDisplayWriteResult> => {
      const prepared = await prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint(original);
      need(!this.#abortedBeforeExecution && this.#workflow === null, "PREPARATION_ABORTED");
      const plan = await prepareCurrentSchematicRelevanceDisplayWritePlan(prepared, { schema: "easyeda-pro-control.schematic209-relevance-display-write-request.v1", operationId: request.operationId, patch: request.patch });
      need(!this.#abortedBeforeExecution && this.#workflow === null, "PREPARATION_ABORTED");
      this.#plan = plan; return this.inspect("prepare");
    })(); this.#preparation = preparation;
    void (async (): Promise<void> => {
      try { await preparation; } catch (error) { this.#preparationFailed = true; this.#prebirthDiagnostic ??= currentSchematicRelevanceDisplayWriteDiagnostic("preparation", currentSchematicRelevanceDisplayWriteErrorCode(error)); } finally { this.#preparationSettled = true; }
    })(); Object.freeze(this);
  }
  public inspect(action: CurrentSchematicRelevanceDisplayWriteResult["action"] = "inspect"): CurrentSchematicRelevanceDisplayWriteResult {
    if (this.#workflow !== null) {
      const original = this.#workflow.operationResult(action);
      if (this.#abandonmentResult !== null) { need(this.#abandonmentResult.operationId === this.#request.operationId && !this.#abandonmentResult.saved && !this.#abandonmentResult.reopened, "ORIGINAL_ABANDONMENT_RESULT"); }
      if (this.#failurePublicationPending) { return currentSchematicRelevanceDisplayWriteResultSchema.parse({ ...original, state: "needs-cleanup", cleanup: { ...original.cleanup, publicationPending: true } }); }
      return (this.#executionFailed || this.#prebirthFailed) && original.state === "prepared" ? currentSchematicRelevanceDisplayWriteResultSchema.parse({ ...original, state: "verification-pending" }) : original;
    }
    let state: CurrentSchematicRelevanceDisplayWriteResult["state"] = "prepared";
    if (this.#prebirthFailed || this.#preparationFailed || this.#abortedBeforeExecution) { state = "verification-pending"; } else if (this.#plan === null) { state = "running"; }
    return currentSchematicRelevanceDisplayWriteResultSchema.parse({ schema: "easyeda-pro-control.schematic209-relevance-display-write-operation.v1", action, operationId: this.#request.operationId,
      state,
      effects: { modifyAttempted: false, modifyAcknowledged: false, saveAttempted: false, saveOutcome: "not-attempted" },
      verification: { saved: false, reopened: false, completeSqlVerified: false, peerRosterPreserved: false },
      cleanup: { generation: "none", allocation: "not-entered", nativeResourcesRetained: false, abortAttempted: false,
        originalTerminationVerified: false, helperReleaseVerified: false, publicationPending: false }, forwardOnly: true, inverseAvailable: false });
  }
  /** Native allocation starts only from the first explicitly confirmed execute.
   * Its original Promise is retained while inspection and cleanup stay callable. */
  public run(input: unknown): Promise<CurrentSchematicRelevanceDisplayWriteResult> {
    const request = currentSchematicRelevanceDisplayWriteActionSchema.parse(input); need(request.operationId === this.#request.operationId, "ORIGINAL_OPERATION");
    if (request.action === "inspect") { return Promise.resolve(this.inspect()); }
    if (request.action === "prepare") { need(canonicalJson(request) === this.#requestText, "ORIGINAL_PREPARATION"); return this.#preparation; }
    if (request.action === "abort") { this.#abortedBeforeExecution = true; this.#abortAction ??= this.#runOriginal(request); return this.#abortAction; }
    return this.#runOriginal(request);
  }
  async #runOriginal(request: Exclude<CurrentSchematicRelevanceDisplayWriteAction, { action: "prepare" } | { action: "inspect" }>): Promise<CurrentSchematicRelevanceDisplayWriteResult> {
    if (request.action === "abort" && this.#workflow === null) { await Promise.allSettled([this.#preparation]); return this.inspect("abort"); }
    if (request.action === "execute") { need(!this.#executeRequested && !this.#abortedBeforeExecution, "EXECUTE_CONSUMED"); this.#executeRequested = true; }
    await this.#preparation;
    if (request.action === "execute") {
      // All prebirth checks stay outside actual execution/failure publication.
      // Aborting or missing source wrappers cannot fabricate a native failure.
      if (this.#abortedBeforeExecution) { this.#executionSettled = true; }
      need(!this.#abortedBeforeExecution, "EXECUTION_ABORTED_BEFORE_BIRTH");
      let original: Promise<CurrentSchematicRelevanceDisplayWriteWorkflowResult>; let workflow: CurrentSchematicRelevanceDisplayWriteWorkflow;
      try {
        requireCurrentSchematicRelevanceDisplayWriteCompositionSource(); need(this.#plan !== null && this.#workflow === null && this.#execution === null, "ORIGINAL_PREPARATION");
        workflow = new CurrentSchematicRelevanceDisplayWriteWorkflow(this.#options, this.#plan); this.#workflow = workflow; original = workflow.execute();
      } catch (error) { this.#prebirthFailed = true; this.#executionSettled = true; this.#prebirthDiagnostic ??= currentSchematicRelevanceDisplayWriteDiagnostic("before-allocation", currentSchematicRelevanceDisplayWriteErrorCode(error)); throw error; }
      this.#execution = original;
      this.#executionObservation = (async (): Promise<void> => {
        try { const result = await original; workflow.requireOriginalResult(result); }
        catch { this.#executionFailed = true; }
        finally { this.#executionSettled = true; }
        if (this.#executionFailed) { try { await this.#publishOriginalFailure(); } catch {
          // Retain the original publication or incomplete resource prerequisite.
        } }
      })();
    } else {
      const workflow = this.#workflow; need(workflow !== null, "ORIGINAL_WORKFLOW");
      if (request.action === "settle-publication") {
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
    }
    return this.inspect(request.action);
  }
  async #joinOriginalExecution(): Promise<void> {
    if (this.#execution !== null) { await Promise.allSettled([this.#execution]); }
    if (this.#executionObservation !== null) { await this.#executionObservation; }
  }
  async #failureCurrent(): Promise<CurrentSchematicRelevanceDisplayWriteFailureClosureBindings> {
    const source = this.#failureSource; const workflow = this.#workflow; const bindings = this.#failureBindings;
    need(source !== null && workflow !== null && bindings !== null && workflow.requireOriginalFailurePublicationSource() === source &&
      requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure(source.token, source.plan, source.journal) === bindings, "ORIGINAL_FAILURE_SOURCE");
    await bindings.assertCurrent();
    need(this.#workflow === workflow && workflow.requireOriginalFailurePublicationSource() === source &&
      requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure(source.token, source.plan, source.journal) === bindings, "ORIGINAL_FAILURE_SOURCE"); return bindings;
  }
  /** The original failure source is acquired only after actual execution and
   * resource closure. Once publication starts, all callers retain that attempt. */
  #publishOriginalFailure(): Promise<void> {
    if (this.#failurePublication !== null) { return this.#failureSettlement ?? this.#failurePublication; }
    const workflow = this.#workflow; need(workflow !== null && this.#executionSettled && this.#executionFailed, "ORIGINAL_FAILURE_SETTLEMENT_REQUIRED");
    const source = workflow.requireOriginalFailurePublicationSource();
    if (source === null) { this.#failureWithoutJournal = true; this.#failurePublication = Promise.resolve(); return this.#failurePublication; }
    const bindings = requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure(source.token, source.plan, source.journal);
    this.#failureSource = source; this.#failureBindings = bindings; this.#failurePublicationPending = true;
    const original = (async (): Promise<void> => {
      await this.#failureCurrent(); const journal = await loadOperation(source.plan.operationId); await this.#failureCurrent();
      if (!schematicRelevanceDisplayWriteHistoricalTerminal(journal)) {
        this.#abandonment = new CurrentSchematicRelevanceDisplayWriteAbandonmentPublication(source.token, source.plan, source.journal);
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
  public requireOriginalPreparation(): CurrentSchematicRelevanceDisplayWritePlan {
    need(this.#preparationSettled && !this.#preparationFailed && !this.#abortedBeforeExecution && this.#plan !== null, "ORIGINAL_PREPARATION_REQUIRED"); return this.#plan;
  }
  public hasActiveReservation(): boolean {
    if (!this.#preparationSettled || this.#failurePublicationPending || this.#executeRequested && !this.#executionSettled && !this.#preparationFailed) { return true; }
    return this.#workflow?.operationResult("inspect").state === "needs-cleanup";
  }
  public failureObserved(): boolean { return this.#preparationFailed || this.#prebirthFailed || this.#executionFailed; }
  public diagnostic(): CurrentSchematicRelevanceDisplayWriteDiagnostic {
    return this.#prebirthDiagnostic ?? this.#workflow?.diagnostic() ?? currentSchematicRelevanceDisplayWriteDiagnostic(this.#plan === null ? "preparation" : "prepared", null);
  }
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
