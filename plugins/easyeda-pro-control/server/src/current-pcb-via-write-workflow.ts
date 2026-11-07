/** Fixed disposable Via workflow. Only original in-memory plans, factories and
 * observers can enter it. This private coordinator is not a mounted MCP route. */
/* oxlint-disable import/max-dependencies -- This one fixed workflow joins the original journal, writer, full closed SQL proof and separate fresh reader; no caller function table is accepted. */
import { setTimeout as delay } from "node:timers/promises";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "./current-pcb-209-start-page-selection.ts";
import { verifyGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWriteFailureClosure, CurrentPcbViaWriteFailureClosureBindings, CurrentPcbViaWriteFailureClosureValue, CurrentPcbViaWriteGenerationClosure } from "./current-pcb-via-write-abandonment-origin.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { assertOriginalCurrentPcbViaWriteOwner, currentPcbViaWriteAllocationOutcome, originalCurrentPcbViaWriteNoResource,
  originalCurrentPcbViaWriteTarget, originalCurrentPcbViaWriteTermination, requireOriginalCurrentPcbViaWriteNoResourceProof, startCurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { CurrentPcbViaWriteJournal, assertNoUnresolvedCurrentPcbViaWrites } from "./current-pcb-via-write-journal.ts";
import type { CurrentPcbViaWriteJournalStage } from "./current-pcb-via-write-journal.ts";
import { currentPcbViaWriteResultSchema, currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";
import type { CurrentPcbViaWriteResult, CurrentPcbViaWriteStageResult } from "./current-pcb-via-write-contract.ts";
import { CurrentPcbViaWriteObservers } from "./current-pcb-via-write-observers.ts";
import { CurrentPcbViaWriteClosedCapture, requireOriginalCurrentPcbViaWriteClosedSnapshot } from "./current-pcb-via-write-closed-snapshot.ts";
import { qualifyOriginalCurrentPcbViaWriteClosedSql, requireOriginalCurrentPcbViaWriteClosedSql } from "./current-pcb-via-write-closed-proof.ts";
import { prepareCurrentPcbViaWriteClosedCheckpoint, requireOriginalCurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import { CurrentPcbViaSavedReadbackWorkflow } from "./current-pcb-via-saved-readback-workflow.ts";
import type { CurrentPcbViaSavedReadbackWorkflowResult } from "./current-pcb-via-saved-readback-workflow.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";

const attempts = new WeakSet<CurrentPcbViaWritePlan>();
const EXIT = Object.freeze({ observations: 40, delayMilliseconds: 250 });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_WORKFLOW_${code}`); } }
type Evidence = Readonly<Record<string, unknown>>;
export interface CurrentPcbViaWriteWorkflowResult {
  readonly profile: "private.current-pcb-via-write-workflow-result.v1";
  readonly operationId: string; readonly savedReadback: CurrentPcbViaSavedReadbackWorkflowResult;
  readonly saved: true; readonly reopened: true; readonly completeSqlVerified: true;
  readonly peerRosterPreserved: true; readonly originalHelpersReleased: true; readonly inverseAvailable: false;
}
const results = new WeakMap<CurrentPcbViaWriteWorkflowResult, CurrentPcbViaWriteWorkflow>();
const failureClosures = new WeakMap<CurrentPcbViaWriteFailureClosure, CurrentPcbViaWriteFailureClosureBindings>();
/* oxlint-disable-next-line typescript/unbound-method -- Call only on the same retained original private-field reader below. */
const readerResourceClosure = CurrentPcbViaSavedReadbackWorkflow.prototype.requireOriginalResourceClosure;

export class CurrentPcbViaWriteWorkflow {
  readonly #options: CurrentPcbDiagnosticInstallationOptions; readonly #plan: CurrentPcbViaWritePlan;
  readonly #prepared: ReturnType<typeof requireOriginalCurrentPcbViaWritePlan>["prepared"];
  readonly #journal: CurrentPcbViaWriteJournal;
  readonly #pending = new Set<Promise<unknown>>();
  #owner: CurrentPcbViaWriteOwner | null = null; #group: CurrentPcbViaWriteObservers | null = null;
  #writerBound = false;
  #factory: Promise<CurrentPcbViaWriteOwner> | null = null; #factorySettled = false;
  #execution: Promise<CurrentPcbViaWriteWorkflowResult> | null = null; #executionSettled = false; #result: CurrentPcbViaWriteWorkflowResult | null = null;
  #normalPending: Promise<unknown> | null = null; #reader: CurrentPcbViaSavedReadbackWorkflow | null = null;
  #capture: CurrentPcbViaWriteClosedCapture | null = null;
  #stage = "prepared"; #aborted = false; #failed = false; #closed = false; #normalClose = false;
  #saveEntered = false; #saveAcknowledgement: CurrentPcbViaWriteStageResult | null = null;
  #cleanup: Promise<void> | null = null; #cleanupSettled = false; #cleanupExitExhausted = false;
  #cleanupPublicationBlocked = false; #abortAcknowledged = false;
  #cleanupBinding: string | null = null; #settlement: Promise<void> | null = null;
  #abort: Promise<void> | null = null; #release: Promise<void> | null = null;
  #launchLease: CurrentPcbDiagnosticLaunchLease | null = null; #launchLeaseReleased = false;
  #failureClosure: CurrentPcbViaWriteFailureClosure | null = null;
  #failurePublicationSource: Readonly<{ token: CurrentPcbViaWriteFailureClosure; plan: CurrentPcbViaWritePlan; journal: CurrentPcbViaWriteJournal }> | null = null;
  #journalReserveEntered = false;
  public constructor(options: CurrentPcbDiagnosticInstallationOptions, plan: CurrentPcbViaWritePlan) {
    const original = requireOriginalCurrentPcbViaWritePlan(plan); captureCurrentPcbStringClockReply(options);
    need(Object.isFrozen(options) && !attempts.has(plan), "ORIGINAL_PREPARATION"); attempts.add(plan);
    this.#options = options; this.#plan = plan; this.#prepared = original.prepared; this.#journal = new CurrentPcbViaWriteJournal(plan);
    Object.freeze(this);
  }
  #current(cleanup = false): void {
    need(requireOriginalCurrentPcbViaWritePlan(this.#plan).prepared === this.#prepared && (cleanup || !this.#aborted), "ORIGINAL_PLAN");
    if (this.#launchLease !== null && !this.#launchLeaseReleased) { assertCurrentPcbDiagnosticLaunchExclusion(this.#launchLease); }
    if (this.#owner !== null) { assertOriginalCurrentPcbViaWriteOwner(this.#owner); need(originalCurrentPcbViaWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_OWNER"); }
  }
  #ownerRequired(cleanup = false): CurrentPcbViaWriteOwner { this.#current(cleanup); need(this.#owner !== null, "ORIGINAL_OWNER_REQUIRED"); return this.#owner; }
  #retain<T>(promise: Promise<T>): Promise<T> {
    this.#pending.add(promise);
    // Attach the rejection handler immediately even when another original lane
    // Must finish before this lane can be joined. The original Promise remains.
    void (async (): Promise<void> => {
      try { await promise; } catch {
        // Preserve the rejection on the original retained Promise.
      } finally { this.#pending.delete(promise); }
    })(); return promise;
  }
  async #invoke<T>(stage: string, action: () => Promise<T>): Promise<T> {
    this.#current(); need(this.#normalPending === null, "ORIGINAL_NORMAL_CALL_PENDING"); this.#stage = stage;
    const pending = this.#retain(action()); this.#normalPending = pending;
    try { const value = await pending; this.#current(); return value; }
    finally { if (this.#normalPending === pending) { this.#normalPending = null; } }
  }
  async #stageCall<T>(stage: CurrentPcbViaWriteJournalStage, before: Evidence, action: () => Promise<T>, after: (value: T) => Evidence): Promise<T> {
    await this.#journal.append(`${stage}-intent`, before); this.#current();
    const value = await this.#invoke(stage, action); this.#current(); await this.#journal.append(`${stage}-result`, after(value)); this.#current(); return value;
  }
  public inspect(): Readonly<Record<string, unknown>> {
    const original = currentPcbViaWriteAllocationOutcome(this.#prepared);
    return Object.freeze({ profile: "private.current-pcb-via-write-workflow-status.v1", operationId: this.#plan.operationId, stage: this.#stage,
      started: this.#execution !== null, failed: this.#failed, aborted: this.#aborted, allocation: original.state,
      factorySettled: this.#factorySettled, pendingOriginalCalls: this.#pending.size, normalCloseAttempted: this.#normalClose,
      originalRootAndJobClosed: this.#closed, cleanupSettled: this.#cleanupSettled, cleanupExitWaitExhausted: this.#cleanupExitExhausted,
      cleanupPublicationBlocked: this.#cleanupPublicationBlocked, originalAbortAcknowledged: this.#abortAcknowledged,
      saveRequestGenerationEntered: this.#saveEntered, originalSaveAcknowledgement: this.#saveAcknowledgement,
      originalCreate: this.#group?.retainedCreateState() ?? null,
      owner: this.#owner?.status() ?? null, observers: this.#group?.status() ?? null, reader: this.#reader?.inspect() ?? null,
      closedCapture: this.#capture?.status() ?? null,
      originalLaunchExclusionRetained: this.#launchLease !== null && !this.#launchLeaseReleased,
      journal: this.#journal.retained(), saved: this.#result !== null, reopened: this.#result !== null, inverseAvailable: false });
  }
  /** Stable public data derived from this actual coordinator. It grants no
   * historical cleanup, resource adoption, continuation or retry. */
  public operationResult(action: CurrentPcbViaWriteResult["action"]): CurrentPcbViaWriteResult {
    this.#current(true);
    const original = currentPcbViaWriteAllocationOutcome(this.#prepared), owner = this.#owner ?? original.owner;
    if (owner !== null) {
      assertOriginalCurrentPcbViaWriteOwner(owner); need(originalCurrentPcbViaWriteTarget(owner) === this.#prepared, "ORIGINAL_STATUS_OWNER");
    }
    const state = owner?.status(); const released = state?.released === true && state.helperClosed;
    let allocation: CurrentPcbViaWriteResult["cleanup"]["allocation"] = "unresolved";
    if (released) { allocation = "released"; }
    else if (owner !== null) { allocation = "retained"; }
    else if (original.state === "not-attempted") { allocation = "not-entered"; }
    else if (original.state === "no-resource") { allocation = "no-resource"; }
    const reader = this.#reader?.cleanupStatus();
    const nativeCleanup: CurrentPcbViaWriteResult["cleanup"] = reader?.native ?? { generation: owner === null && allocation === "not-entered" ? "none" : "writer", allocation,
      nativeResourcesRetained: allocation === "retained" || allocation === "unresolved", abortAttempted: this.#abort !== null,
      originalTerminationVerified: this.#closed, helperReleaseVerified: released, publicationPending: this.#journal.retained().publicationPending || this.#cleanupPublicationBlocked };
    const cleanup = { ...nativeCleanup, publicationPending: nativeCleanup.publicationPending || this.#cleanupPublicationBlocked };
    const create = this.#group?.retainedCreateState();
    const capturePending = this.#capture !== null && !this.#capture.isReleaseAcknowledged() || reader?.captureReleasePending === true;
    const completed = this.#result !== null;
    if (completed) { need(this.#result !== null, "ORIGINAL_STATUS_RESULT"); this.requireOriginalResult(this.#result); }
    let phase: CurrentPcbViaWriteResult["state"] = "verification-pending";
    if (completed) { phase = "completed"; }
    else if (this.#execution === null && !this.#aborted) { phase = "prepared"; }
    else if (!this.#failed && !this.#aborted) { phase = "running"; }
    else if (cleanup.nativeResourcesRetained || cleanup.publicationPending || capturePending || this.#pending.size > 0 || reader?.originalCallsPending === true || this.#launchLease !== null && !this.#launchLeaseReleased) { phase = "needs-cleanup"; }
    let saveOutcome: CurrentPcbViaWriteResult["effects"]["saveOutcome"] = "not-attempted";
    if (this.#saveEntered) { saveOutcome = this.#saveAcknowledgement === null ? "unknown" : "acknowledged"; }
    return currentPcbViaWriteResultSchema.parse({ schema: "easyeda-pro-control.pcb209-via-write-operation.v1", action, operationId: this.#plan.operationId,
      state: phase,
      effects: { createAttempted: create?.requestGenerationEntered === true, createAcknowledged: create?.originalAcknowledgement !== null && create?.originalAcknowledgement !== undefined,
        saveAttempted: this.#saveEntered, saveOutcome },
      verification: { saved: completed, reopened: completed, completeSqlVerified: completed, peerRosterPreserved: completed }, cleanup,
      forwardOnly: true, inverseAvailable: false });
  }
  async #open(owner: CurrentPcbViaWriteOwner, group: CurrentPcbViaWriteObservers): Promise<void> {
    const browser = await this.#invoke("writer-browser", () => owner.observeViaWriteStartPage(this.#plan));
    const selected = selectCurrentPcb209StartPage(browser);
    const frames = await this.#invoke("writer-frames", () => owner.inspectFrames(selected.targetId));
    const frame = selectCurrentPcb209StartPageFrame(frames, selected);
    await this.#invoke("writer-ui-source", () => owner.inspectScript(frame.frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui));
    const intent = await this.#journal.appendPollingCancellationIntent(owner); this.#current(); group.armBeforeNavigation(intent);
    const project = await this.#invoke("writer-project-open", () => owner.openGeneratedFixtureProject(this.#prepared.qualification,
      () => verifyGeneratedFixtureOpenCheckpoint(this.#prepared)));
    need(project.ok, "ORIGINAL_PROJECT_OPEN");
    const pcb = await this.#invoke("writer-pcb-open", () => owner.openPcb(this.#plan.target,
      () => verifyGeneratedFixtureOpenCheckpoint(this.#prepared)));
    need(pcb.ok, "ORIGINAL_PCB_OPEN");
    await this.#invoke("writer-pcb-source", () => owner.observePcbOpening(this.#plan.target, CURRENT_PCB_209_OPENING_SCRIPTS.pcb));
    await this.#invoke("writer-startup-observations", () => group.waitForStartupObservations());
    await this.#journal.append("opening-result", { project, pcb, originalStartupAndTimerCancellationVerified: true }); this.#current();
  }
  async #create(owner: CurrentPcbViaWriteOwner, group: CurrentPcbViaWriteObservers): Promise<ReturnType<CurrentPcbViaWriteObservers["qualifyEffect"]>> {
    const create = await this.#journal.appendIntent("create", { originalPlan: this.#plan, forwardOnly: true }, owner); this.#current();
    await this.#invoke("writer-create-observers", () => group.prepareCreate(create));
    const ack = await this.#invoke("writer-create", () => group.dispatchCreate(create));
    await this.#journal.append("create-result", ack); this.#current();
    await this.#stageCall("native-after", { originalCreatedViaRequired: true }, () => group.observeAfterNative(), value => ({ originalObservation: value }));
    await this.#stageCall("scene-after", { wholeSceneRequired: true }, () => group.observeAfterScene(), value => ({ originalObservation: value }));
    return this.#stageCall("effect", { exactNativeAndSceneDifferenceRequired: true },
      () => Promise.resolve(group.qualifyEffect()), value => ({ originalEffect: value }));
  }
  async #saveOriginal(owner: CurrentPcbViaWriteOwner, group: CurrentPcbViaWriteObservers,
    effect: ReturnType<CurrentPcbViaWriteObservers["qualifyEffect"]>): Promise<void> {
    await this.#invoke("writer-save-clock-arm", () => group.armSaveClock());
    owner.requireViaProspectiveSaveMainReady(this.#plan, effect);
    const dispatch = await this.#journal.appendIntent("save", { originalEffect: effect, attemptsAuthorized: 1 }, owner); this.#current();
    await this.#invoke("writer-save-generation", () => owner.prepareViaSaveGeneration(this.#plan, effect, dispatch));
    this.#stage = "writer-original-save";
    // All original lanes are retained before awaiting any one. An early
    // Failure reaches original Job cleanup before joining blocked collectors.
    this.#saveEntered = true; const sdk = this.#retain((async (): Promise<CurrentPcbViaWriteStageResult> => {
      const value = await owner.executeViaStage("save", this.#plan, dispatch);
      need("stage" in value && value.stage === "save", "ORIGINAL_SAVE_ACKNOWLEDGEMENT");
      currentPcbViaWriteStageResultSchema.parse(value); this.#saveAcknowledgement = value; return value;
    })());
    const main = this.#retain(group.observeOriginalSave()); const local = this.#retain(group.serviceSaveLocalCalls());
    // The drain waits the same local collector, then services buffer/cloud
    // Ingress before Main history can finish. Starting it later would deadlock.
    const drain = this.#retain(group.drainOriginalSave());
    const acknowledgements = await Promise.all([sdk, main, local, drain]); this.#current();
    const ack = acknowledgements[0]; need("stage" in ack && ack.stage === "save", "ORIGINAL_SAVE_ACKNOWLEDGEMENT");
    currentPcbViaWriteStageResultSchema.parse(ack); this.#saveAcknowledgement = ack;
    group.requireOriginalSaveDrained(); this.#current(); await this.#journal.append("save-result", ack); this.#current();
  }
  async #observeExit(owner: CurrentPcbViaWriteOwner, cleanup: boolean): Promise<void> {
    for (let index = 0; index < EXIT.observations; index += 1) {
      this.#current(cleanup); const pending = this.#retain(owner.observeTermination());
      if (await pending) { this.#current(cleanup); originalCurrentPcbViaWriteTermination(owner); this.#closed = true; return; }
      this.#current(cleanup); if (index + 1 < EXIT.observations) { await delay(EXIT.delayMilliseconds); }
    }
    if (cleanup) { this.#cleanupExitExhausted = true; } throw new Error("PCB_VIA_WORKFLOW_ORIGINAL_EXIT_NOT_OBSERVED");
  }
  async #releaseClosed(owner: CurrentPcbViaWriteOwner): Promise<void> {
    this.#current(true); need(this.#closed, "ORIGINAL_CLOSURE_REQUIRED");
    if (this.#group !== null) { await this.#group.settleOriginalCallsAfterExit(); this.#current(true); }
    this.#release ??= owner.releaseClosed(); await this.#release; this.#current(true);
    need(owner.status().released && owner.status().helperClosed, "ORIGINAL_HELPER_NOT_RELEASED");
  }
  async #closeAndCapture(owner: CurrentPcbViaWriteOwner, group: CurrentPcbViaWriteObservers): Promise<CurrentPcbViaWriteClosedCheckpoint> {
    group.requireOriginalSaveDrained();
    await this.#stageCall("close", { originalNormalCloseOnly: true }, async () => {
      const hwnd = await owner.observeApplicationWindow(); this.#current(); need(hwnd !== null, "ORIGINAL_WINDOW_REQUIRED");
      this.#normalClose = true; await owner.requestNormalClose(hwnd); this.#current(); return { originalNormalCloseAcknowledged: true, saveOrDiscardSelected: false };
    }, value => value);
    await this.#stageCall("exit", { originalRootAndEmptyJobRequired: true }, async () => {
      await this.#observeExit(owner, false); this.#current(); await this.#releaseClosed(owner);
      return { rootExited: true, jobEmpty: true, helperReleased: true };
    }, value => value);
    return this.#stageCall("closed-sql", { completeSourceAndAllSqlTablesRequired: true }, async () => {
      const termination = originalCurrentPcbViaWriteTermination(owner); this.#capture = new CurrentPcbViaWriteClosedCapture(owner, termination, this.#plan);
      const snapshot = await this.#capture.capture(); this.#current(); await this.#capture.settleRelease(); this.#current();
      const sql = await qualifyOriginalCurrentPcbViaWriteClosedSql(owner, this.#plan, termination, snapshot); this.#current();
      requireOriginalCurrentPcbViaWriteClosedSql(sql, owner, this.#plan);
      const checkpoint = await prepareCurrentPcbViaWriteClosedCheckpoint(owner, this.#plan, snapshot, sql); this.#current();
      return checkpoint;
    }, checkpoint => {
      const original = requireOriginalCurrentPcbViaWriteClosedCheckpoint(checkpoint);
      const capture = requireOriginalCurrentPcbViaWriteClosedSnapshot(original.snapshot, owner, this.#plan);
      need(capture.rawHistory !== null, "COMPLETE_RAW_HISTORY_REQUIRED");
      return { logicalSha256: original.sql.logicalSha256, nativeHistorySha256: sha256Json(capture.rawHistory), completeSqlVerified: true, sourceMembershipVerified: true };
    });
  }
  public execute(): Promise<CurrentPcbViaWriteWorkflowResult> {
    if (this.#execution !== null) { return this.#execution; } this.#current();
    const execution = (async (): Promise<CurrentPcbViaWriteWorkflowResult> => {
      try {
        this.#launchLease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#current();
        await assertNoUnresolvedCurrentPcbViaWrites(); this.#current(); this.#journalReserveEntered = true; await this.#journal.reserve(); this.#current();
        await this.#stageCall("baseline", { completeInitialSqlRequired: true }, () => verifyGeneratedFixtureOpenCheckpoint(this.#prepared),
          () => ({ logicalSha256: this.#plan.initialLogicalSha256, nativeHistorySha256: sha256Json(this.#prepared.history), sourceSha256: this.#plan.target.expectedSourceSha256 }));
        const owner = await this.#stageCall("allocation", { originalFactoryRequired: true }, async () => {
          this.#factory = startCurrentPcbViaWriteOwner(this.#options, this.#prepared); const factory = this.#factory;
          try {
            const original = await factory; this.#owner = original;
            this.#journal.bindWriter(original); this.#writerBound = true; this.#current(); return original;
          }
          finally { this.#factorySettled = true; }
        }, value => ({ helperPid: value.status().helperPid, originalFactoryVerified: true }));
        const group = new CurrentPcbViaWriteObservers(owner, this.#plan); this.#group = group;
        await this.#stageCall("launch", { originalCheckpointAndExecutableRequired: true }, () => owner.startViaWriteGeneration(this.#plan),
          () => ({ originalBinding: owner.status().binding }));
        await this.#stageCall("main", { originalConstructorsAndSelectedSqlRequired: true }, () => owner.observeFootprintMainConstruction(), value => ({ originalMain: value }));
        await this.#open(owner, group);
        await this.#stageCall("sdk", { originalSdkSourceRequired: true }, () => owner.executeViaStage("capture", this.#plan), value => ({ originalCapture: value }));
        await this.#stageCall("preflight", { exactOriginalTargetRequired: true }, () => owner.executeViaStage("preflight", this.#plan), value => ({ originalPreflight: value }));
        await this.#stageCall("native-before", { completePrimitiveRosterRequired: true }, () => group.observeBeforeNative(), value => ({ originalObservation: value }));
        await this.#stageCall("scene-before", { wholeSceneRequired: true }, () => group.observeBeforeScene(), value => ({ originalObservation: value }));
        const effect = await this.#create(owner, group); await this.#saveOriginal(owner, group, effect);
        const checkpoint = await this.#closeAndCapture(owner, group); this.#current();
        await this.#journal.append("reopen-intent", { originalClosedCheckpoint: checkpoint, freshGenerationRequired: true }); this.#current();
        const reader = new CurrentPcbViaSavedReadbackWorkflow(this.#options, checkpoint, this.#journal); this.#reader = reader;
        const savedReadback = await this.#invoke("fresh-saved-readback", () => reader.execute()); reader.requireOriginalResult(savedReadback); this.#current();
        await this.#stageCall("complete", { originalWriterAndReaderHelpersReleased: true }, () => Promise.resolve(savedReadback),
          () => ({ saved: true, reopened: true, completeSqlVerified: true, peerRosterPreserved: true, inverseAvailable: false }));
        const result: CurrentPcbViaWriteWorkflowResult = Object.freeze({ profile: "private.current-pcb-via-write-workflow-result.v1", operationId: this.#plan.operationId,
          savedReadback, saved: true, reopened: true, completeSqlVerified: true, peerRosterPreserved: true, originalHelpersReleased: true, inverseAvailable: false });
        this.#releaseOriginalLaunchExclusion(); need(this.#launchLeaseReleased, "ORIGINAL_LAUNCH_EXCLUSION_NOT_RELEASED");
        results.set(result, this); this.#result = result; this.#stage = "complete"; return result;
      } catch (caughtError) {
        this.#failed = true; try { await this.#cleanupOriginal(); } catch {
          // Preserve the first execution failure, original pending calls and
          // Separately inspectable unresolved cleanup. Nothing is repeated.
        } throw caughtError;
      } finally { this.#executionSettled = true; this.#releaseOriginalLaunchExclusion(); }
    })(); this.#execution = execution; return execution;
  }
  /** A process-local lease supplements the durable quarantine. It spans both
   * native generations and survives an unresolved cleanup/publication. Only
   * this exact original lease can be released after genuine resource closure. */
  #releaseOriginalLaunchExclusion(): void {
    const lease = this.#launchLease;
    if (lease === null || this.#launchLeaseReleased || this.#cleanupPublicationBlocked || this.#journal.retained().publicationPending || this.#pending.size > 0 || this.#factory !== null && !this.#factorySettled ||
      this.#capture !== null && !this.#capture.isReleaseAcknowledged()) { return; }
    const original = currentPcbViaWriteAllocationOutcome(this.#prepared), owner = this.#owner ?? original.owner;
    if (owner === null) { if (original.state !== "not-attempted" && original.state !== "no-resource") { return; } }
    else {
      assertOriginalCurrentPcbViaWriteOwner(owner); const state = owner.status();
      if (!state.released || !state.helperClosed || state.binding !== null && !this.#closed) { return; }
      if (state.binding !== null) { originalCurrentPcbViaWriteTermination(owner); }
    }
    const reader = this.#reader?.cleanupStatus();
    if (reader !== undefined && (reader.native.nativeResourcesRetained || reader.originalCallsPending || reader.captureReleasePending)) { return; }
    assertCurrentPcbDiagnosticLaunchExclusion(lease); releaseCurrentPcbDiagnosticLaunchExclusion(lease); this.#launchLeaseReleased = true;
  }
  #hasRecord(kind: string): boolean { return this.#journal.retained().records.some(record => record.kind === kind); }
  async #cleanupPublication<T>(publish: () => Promise<T>): Promise<T> {
    try { return await publish(); } catch (caughtError) { this.#cleanupPublicationBlocked = true; throw caughtError; }
  }
  async #journalReady(): Promise<void> {
    await this.#cleanupPublication(async (): Promise<void> => {
      await this.#journal.waitForPublication();
      if (this.#journal.retained().publicationPending) { await this.#journal.settlePublication(); }
      await this.#journal.assertCurrent(); this.#current(true);
    });
  }
  async #cleanupRecord(kind: Parameters<CurrentPcbViaWriteJournal["append"]>[0], evidence: Evidence): Promise<void> {
    await this.#journalReady();
    if (!this.#hasRecord(kind)) { await this.#cleanupPublication(() => this.#journal.append(kind, evidence)); }
    await this.#journalReady();
  }
  async #runCleanup(): Promise<void> {
      if (this.#factory !== null && this.#owner === null) {
        try { this.#owner = await this.#factory; } catch { this.#owner = currentPcbViaWriteAllocationOutcome(this.#prepared).owner; }
      }
      this.#current(true);
      if (!this.#journalReserveEntered && !this.#journal.retained().reserved && !this.#journal.retained().publicationPending) { need(this.#factory === null, "UNPUBLISHED_FACTORY"); return; }
      await this.#journalReady(); this.#cleanupPublicationBlocked = false;
      await this.#cleanupRecord("failure", { stage: this.#stage, originalExecutionStopped: true, retryAuthorized: false }); this.#current(true);
      if (this.#capture !== null) { await this.#capture.settleRelease(); need(this.#capture.isReleaseAcknowledged(), "ORIGINAL_CAPTURE_RELEASE_UNRESOLVED"); }
      if (this.#reader !== null) { await this.#reader.abort(true); this.#current(true); return; }
      const owner = this.#owner;
      if (owner === null) {
        const original = currentPcbViaWriteAllocationOutcome(this.#prepared);
        if (original.state === "not-attempted") { await this.#cleanupRecord("no-allocation", { allocationNeverEntered: true }); return; }
        need(original.state === "no-resource", "ORIGINAL_ALLOCATION_UNRESOLVED");
        if (!this.#hasRecord("allocation-refused")) { await this.#cleanupPublication(() => this.#journal.recordAllocationRefusal(originalCurrentPcbViaWriteNoResource(this.#plan))); } return;
      }
      if (!this.#writerBound) { this.#journal.bindWriter(owner); this.#writerBound = true; }
      if (owner.status().released && owner.status().helperClosed) {
        if (owner.status().binding === null && this.#hasRecord("no-process-release-intent") && !this.#hasRecord("no-process-release-result")) {
          await this.#cleanupPublication(() => this.#journal.recordWriterNoProcessReleaseResult(owner));
        } return;
      }
      if (owner.status().binding === null) {
        const pending = this.#normalPending; if (pending !== null) { await Promise.allSettled([pending]); }
        if (owner.status().binding === null) {
          if (!this.#hasRecord("no-process-release-intent")) { await this.#cleanupPublication(() => this.#journal.recordWriterNoProcessReleaseIntent(owner)); } this.#current(true);
          this.#journal.requireWriterNoProcessReleaseReady(owner); this.#current(true);
          if (this.#release === null) {
            const state = owner.status();
            if (state.noProcessCleanupAvailable) { this.#release = (async (): Promise<void> => { await owner.releaseNoProcess(); })(); }
            else { need(!state.launchConsumed, "ORIGINAL_LAUNCH_UNRESOLVED"); this.#release = owner.releaseUnlaunched(); }
          }
          await this.#release; this.#current(true); await this.#cleanupPublication(() => this.#journal.recordWriterNoProcessReleaseResult(owner)); return;
        }
      }
      const binding = owner.status().binding; need(binding !== null, "ORIGINAL_CLEANUP_BINDING");
      need(this.#cleanupBinding === null || this.#cleanupBinding === canonicalJson(binding), "ORIGINAL_CLEANUP_BINDING"); this.#cleanupBinding = canonicalJson(binding);
      if (!this.#closed) {
        if (this.#abort === null) {
          await this.#cleanupRecord("abort-intent", { originalJobOnly: true }); this.#current(true);
          this.#group?.cancel(); this.#abort = owner.abortPcbViaWrite();
        }
        try { await this.#abort; this.#abortAcknowledged = true; } catch {
          // An unknown original Abort result grants no retry. Its original
          // Root/Job can still be independently observed through retained handles.
        }
        this.#current(true); await this.#cleanupRecord("abort-result", { originalAbortAcknowledged: this.#abortAcknowledged, retryAuthorized: false });
        // Original abort wakes held collectors. Join their actual Promises only
        // After dispatching it, so blocked readers cannot deadlock cleanup.
        await Promise.allSettled(this.#pending); this.#current(true);
        await this.#cleanupRecord("termination-intent", { originalRootAndJobRequired: true });
        await this.#observeExit(owner, true); this.#current(true);
        await this.#cleanupRecord("termination-result", { rootExited: true, jobEmpty: true });
      } else if (!this.#hasRecord("termination-result")) {
        await this.#cleanupRecord("termination-intent", { originalRootAndJobAlreadyObserved: true });
        originalCurrentPcbViaWriteTermination(owner); await this.#cleanupRecord("termination-result", { rootExited: true, jobEmpty: true });
      }
      await this.#cleanupRecord("release-intent", { originalHelperOnly: true }); await this.#releaseClosed(owner);
      await this.#cleanupRecord("release-result", { released: true });
  }
  #cleanupOriginal(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; }
    const retained = (async (): Promise<void> => { try { await this.#runCleanup(); } finally { this.#cleanupSettled = true; this.#releaseOriginalLaunchExclusion(); } })(); this.#cleanup = retained; return retained;
  }
  public abort(confirmOriginalJobOnly: true): Promise<void> {
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must expressly confirm original-Job-only cleanup.
    need(confirmOriginalJobOnly === true, "ORIGINAL_ABORT_CONFIRMATION");
    if (this.#result !== null) { return Promise.resolve(); } this.#aborted = true;
    if (this.#execution === null) { return Promise.resolve(); } return this.#settlement ?? this.#cleanupOriginal();
  }
  public async settlePublication(): Promise<void> {
    await this.#journal.settlePublication(); this.#current(true); this.#releaseOriginalLaunchExclusion();
  }
  /** Only original private fields distinguish an execution stopped before any
   * journal reservation from a closed failed operation with historical records.
   * The coordinator owns publication; this workflow remains its sole authorizer. */
  public requireOriginalFailurePublicationSource(): Readonly<{ token: CurrentPcbViaWriteFailureClosure; plan: CurrentPcbViaWritePlan; journal: CurrentPcbViaWriteJournal }> | null {
    this.#current(true);
    need(this.#execution !== null && this.#executionSettled && (this.#failed || this.#aborted) && this.#result === null, "ORIGINAL_FAILURE_PUBLICATION_REQUIRED");
    if (!this.#journalReserveEntered) {
      need(!this.#journal.retained().reserved && !this.#journal.retained().publicationPending && this.#factory === null && this.#owner === null &&
        this.#pending.size === 0 && this.#capture === null && this.#reader === null && currentPcbViaWriteAllocationOutcome(this.#prepared).state === "not-attempted" &&
        (this.#launchLease === null || this.#launchLeaseReleased), "ORIGINAL_UNPUBLISHED_FAILURE_RESOURCES");
      return null;
    }
    const token = this.requireOriginalFailureClosure();
    this.#failurePublicationSource ??= Object.freeze({ token, plan: this.#plan, journal: this.#journal });
    need(this.#failurePublicationSource.token === token, "ORIGINAL_FAILURE_PUBLICATION_SOURCE"); return this.#failurePublicationSource;
  }
  /** One later read-only exit round can settle the original exhausted wait.
   * It never repeats Abort, Close or the original helper-release Promise. */
  public settleCleanup(): Promise<void> {
    if (this.#reader !== null) {
      const reader = this.#reader;
      this.#settlement ??= (async (): Promise<void> => { await reader.settleCleanup(); this.#current(true); this.#releaseOriginalLaunchExclusion(); })();
      return this.#settlement;
    }
    const cleanup = this.#cleanup; need(cleanup !== null, "ORIGINAL_CLEANUP_NOT_SUBMITTED");
    if (this.#settlement !== null) { return this.#settlement; }
    if (!this.#cleanupSettled || !this.#cleanupExitExhausted && !this.#cleanupPublicationBlocked) { return cleanup; }
    const publicationRecovery = this.#cleanupPublicationBlocked;
    const binding = this.#cleanupBinding, owner = this.#owner;
    if (!publicationRecovery) { need(owner !== null && binding !== null, "ORIGINAL_SETTLEMENT_BINDING"); }
    const settlement = (async (): Promise<void> => {
      await Promise.allSettled([cleanup]); await this.#journalReady(); this.#current(true);
      if (publicationRecovery) { await this.#runCleanup(); this.#releaseOriginalLaunchExclusion(); return; }
      need(owner !== null && binding !== null, "ORIGINAL_SETTLEMENT_BINDING");
      need(canonicalJson(owner.status().binding) === binding, "ORIGINAL_SETTLEMENT_BINDING"); await this.#observeExit(owner, true); this.#current(true);
      await this.#runCleanup(); this.#releaseOriginalLaunchExclusion();
    })(); this.#settlement = settlement; return settlement;
  }
  #failureClosureValue(): CurrentPcbViaWriteFailureClosureValue {
    this.#current(true);
    need(this.#execution !== null && this.#executionSettled && (this.#failed || this.#aborted) && this.#result === null &&
      this.#journal.retained().reserved && this.#hasRecord("failure") && !this.#cleanupPublicationBlocked && !this.#journal.retained().publicationPending && this.#pending.size === 0 &&
      (this.#factory === null || this.#factorySettled) && (this.#capture === null || this.#capture.isReleaseAcknowledged()) &&
      (this.#launchLease === null || this.#launchLeaseReleased), "ORIGINAL_FAILURE_CLOSURE_PENDING");
    const original = currentPcbViaWriteAllocationOutcome(this.#prepared), owner = this.#owner ?? original.owner;
    let writer: CurrentPcbViaWriteGenerationClosure;
    if (owner === null) {
      if (original.state === "not-attempted" && this.#factory === null) {
        writer = Object.freeze({ outcome: "allocation-never-entered", helperAllocated: false, rootCreated: false, exitClaimed: false });
      } else {
        need(original.state === "no-resource" && this.#factorySettled, "ORIGINAL_FAILURE_ALLOCATION_UNRESOLVED");
        requireOriginalCurrentPcbViaWriteNoResourceProof(originalCurrentPcbViaWriteNoResource(this.#plan), this.#plan);
        writer = Object.freeze({ outcome: "no-resource-allocated", helperAllocated: false, rootCreated: false, exitClaimed: false });
      }
    } else {
      assertOriginalCurrentPcbViaWriteOwner(owner); need(originalCurrentPcbViaWriteTarget(owner) === this.#prepared, "ORIGINAL_FAILURE_OWNER");
      const state = owner.status(); need(state.released && state.helperClosed, "ORIGINAL_FAILURE_HELPER_UNRELEASED");
      if (state.binding === null) { writer = Object.freeze({ outcome: "root-never-created", helperAllocated: true, helperReleased: true, rootCreated: false, exitClaimed: false }); }
      else {
        need(this.#closed, "ORIGINAL_FAILURE_ROOT_EXIT"); originalCurrentPcbViaWriteTermination(owner);
        writer = Object.freeze({ outcome: "root-exited", helperAllocated: true, helperReleased: true, rootCreated: true, originalRootExited: true, originalJobEmpty: true });
      }
    }
    const reader = this.#reader;
    if (reader !== null) { need(Object.getPrototypeOf(reader) === CurrentPcbViaSavedReadbackWorkflow.prototype &&
      reader.requireOriginalResourceClosure === readerResourceClosure && CurrentPcbViaSavedReadbackWorkflow.prototype.requireOriginalResourceClosure === readerResourceClosure,
      "ORIGINAL_FAILURE_READER_METHOD"); }
    const readback = reader === null ? null : readerResourceClosure.call(reader);
    return Object.freeze({ writer, readback: readback?.generation ?? null,
      capture: this.#capture !== null || readback?.captureStarted === true ? "all-original-handles-closed" : "not-started",
      saved: false, reopened: false, completionClaimed: false, ownerTransferred: false, replayAllowed: false });
  }
  /** Issue only after this exact failed execution and all its original native
   * and file resources settle. JSON and historical records cannot recreate it. */
  public requireOriginalFailureClosure(): CurrentPcbViaWriteFailureClosure {
    const value = this.#failureClosureValue();
    if (this.#failureClosure !== null) {
      const original = failureClosures.get(this.#failureClosure); need(original !== undefined && canonicalJson(original.value) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED");
      return this.#failureClosure;
    }
    const token: CurrentPcbViaWriteFailureClosure = Object.freeze({ profile: "private.current-pcb-via-write-failure-closure.v1" });
    const bindings: CurrentPcbViaWriteFailureClosureBindings = Object.freeze({ plan: this.#plan, journal: this.#journal, value,
      assertCurrent: async (): Promise<void> => {
        need(this.#failureClosure === token && canonicalJson(this.#failureClosureValue()) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED");
        await this.#journal.assertCurrent();
        need(this.#failureClosure === token && canonicalJson(this.#failureClosureValue()) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED");
      } });
    failureClosures.set(token, bindings); this.#failureClosure = token; return token;
  }
  public requireOriginalResult(result: CurrentPcbViaWriteWorkflowResult): CurrentPcbViaWriteWorkflowResult {
    this.#current(); need(this.#result === result && results.get(result) === this && this.#normalClose && this.#closed && this.#reader !== null, "ORIGINAL_RESULT");
    const owner = this.#ownerRequired(); need(owner.status().released && owner.status().helperClosed && !this.#journal.retained().publicationPending &&
      this.#journal.retained().records.at(-1)?.kind === "complete-result", "ORIGINAL_RESULT_CLEANUP");
    this.#reader.requireOriginalResult(result.savedReadback); return result;
  }
}

/** Authorizer for the immutable abandonment sidecar. Returning the same private
 * binding on every call lets its publisher reprove identity across each await. */
export function requireOriginalCurrentPcbViaWriteFailureClosure(token: CurrentPcbViaWriteFailureClosure,
  plan: CurrentPcbViaWritePlan, journal: CurrentPcbViaWriteJournal): CurrentPcbViaWriteFailureClosureBindings {
  const bindings = failureClosures.get(token);
  need(bindings !== undefined && bindings.plan === plan && bindings.journal === journal, "ORIGINAL_FAILURE_CLOSURE_TOKEN"); return bindings;
}
