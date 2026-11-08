/** One fixed original seven-record write and its separate fresh saved reader.
 * No caller owner, callback table, path or serialized plan can enter this route. */
/* oxlint-disable import/max-dependencies -- This one fixed lifecycle joins independently branded original native, journal, SQL, closed-file and fresh-reader receipts. */
import { setTimeout as delay } from "node:timers/promises";
import { createOriginalSourceError } from "./original-source-error.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "./current-pcb-209-start-page-selection.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import type { CurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import { currentSchematicRelevanceDisplayWriteResultSchema } from "./current-schematic-relevance-display-write-contract.ts";
import type { CurrentSchematicRelevanceDisplayWriteResult } from "./current-schematic-relevance-display-write-contract.ts";
import { currentSchematicRelevanceDisplayWriteDiagnostic, currentSchematicRelevanceDisplayWriteErrorCode } from "./current-schematic-relevance-display-write-diagnostic.ts";
import type { CurrentSchematicRelevanceDisplayWriteDiagnostic } from "./current-schematic-relevance-display-write-diagnostic.ts";
import type { CurrentSchematicRelevanceDisplayWriteFailureClosure, CurrentSchematicRelevanceDisplayWriteFailureClosureBindings, CurrentSchematicRelevanceDisplayWriteFailureClosureValue, CurrentSchematicRelevanceDisplayWriteGenerationClosure } from "./current-schematic-relevance-display-write-abandonment-origin.ts";
import { GeneratedSchematicRelevanceDisplayJournal, assertGeneratedSchematicRelevanceDisplayJournalChain } from "./generated-schematic-relevance-display-journal.ts";
import type { GeneratedSchematicRelevanceDisplayJournalStage } from "./generated-schematic-relevance-display-journal.ts";
import { CurrentSchematicRelevanceDisplayWriteObservers, requireCurrentSchematicRelevanceDisplayWriteCompositionSource, requireOriginalCurrentSchematicRelevanceDisplayWriteComposition } from "./current-schematic-relevance-display-write-observers.ts";
import type { CurrentSchematicRelevanceDisplayWriteComposition } from "./current-schematic-relevance-display-write-composition.ts";
import { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner, currentSchematicRelevanceDisplayWriteAllocationOutcome, originalCurrentSchematicRelevanceDisplayWriteTarget, originalCurrentSchematicRelevanceDisplayWriteTermination, requireOriginalSchematicRelevanceDisplayStage, startCurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "./generated-schematic-relevance-display.ts";
import type { GeneratedSchematicRelevanceDisplayStageResult } from "./generated-schematic-relevance-display.ts";
import { qualifyOriginalGeneratedSchematicRelevanceDisplayEffect, requireOriginalGeneratedSchematicRelevanceDisplayEffect } from "./generated-schematic-relevance-display-effect.ts";
import type { GeneratedSchematicRelevanceDisplayNativeEffect } from "./generated-schematic-relevance-display-effect.ts";
import { requireOriginalCurrentSchematicRelevanceDisplaySaveDrained } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplaySaveDrained } from "./current-schematic-relevance-display-save-drained.ts";
import { GeneratedSchematicRelevanceDisplayClosedCapture, requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { completeOriginalGeneratedSchematicRelevanceClosedLifecycle } from "./generated-schematic-relevance-closed-lifecycle.ts";
import { prepareGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { prepareOriginalCurrentSchematicRelevanceSavedReadbackParent } from "./current-schematic-relevance-saved-readback-parent.ts";
import { CurrentSchematicRelevanceSavedReadbackWorkflow } from "./current-schematic-relevance-saved-readback-workflow.ts";
import type { CurrentSchematicRelevanceSavedReadbackWorkflowResult } from "./current-schematic-relevance-saved-readback-workflow.ts";
import { verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites } from "./current-schematic-relevance-display-write-admission.ts";

const attempts = new WeakSet<CurrentSchematicRelevanceDisplayWritePlan>();
const EXIT = Object.freeze({ observations: 40, delayMilliseconds: 250 });
type Evidence = Readonly<Record<string, unknown>>;
type Kind = Parameters<GeneratedSchematicRelevanceDisplayJournal["append"]>[0];
function need(value: boolean, code: string): asserts value { if (!value) { throw createOriginalSourceError("SCHEMATIC_RELEVANCE_WORKFLOW", code); } }
function isStage(value: unknown): value is GeneratedSchematicRelevanceDisplayStageResult { return generatedSchematicRelevanceDisplayStageResultSchema.safeParse(value).success; }
export interface CurrentSchematicRelevanceDisplayWriteWorkflowResult {
  readonly profile: "private.current-schematic-relevance-display-write-workflow-result.v1";
  readonly operationId: string; readonly savedReadback: CurrentSchematicRelevanceSavedReadbackWorkflowResult;
  readonly saved: true; readonly reopened: true; readonly completeSqlVerified: true;
  readonly peerRosterPreserved: true; readonly originalHelpersReleased: true; readonly inverseAvailable: false;
}
const results = new WeakMap<CurrentSchematicRelevanceDisplayWriteWorkflowResult, CurrentSchematicRelevanceDisplayWriteWorkflow>();
const failureClosures = new WeakMap<CurrentSchematicRelevanceDisplayWriteFailureClosure, CurrentSchematicRelevanceDisplayWriteFailureClosureBindings>();
/* oxlint-disable-next-line typescript/unbound-method -- Used only on the same retained original private-field reader below. */
const readerResourceClosure = CurrentSchematicRelevanceSavedReadbackWorkflow.prototype.requireOriginalResourceClosure;

export class CurrentSchematicRelevanceDisplayWriteWorkflow {
  readonly #options: CurrentPcbDiagnosticInstallationOptions; readonly #plan: CurrentSchematicRelevanceDisplayWritePlan;
  readonly #original: ReturnType<typeof requireOriginalCurrentSchematicRelevanceDisplayWritePlan>;
  readonly #journal: GeneratedSchematicRelevanceDisplayJournal;
  readonly #pending = new Set<Promise<unknown>>();
  #owner: CurrentSchematicRelevanceDisplayWriteOwner | null = null; #group: CurrentSchematicRelevanceDisplayWriteObservers | null = null;
  #composition: CurrentSchematicRelevanceDisplayWriteComposition | null = null;
  #factory: Promise<CurrentSchematicRelevanceDisplayWriteOwner> | null = null; #factorySettled = false; #writerBound = false;
  #execution: Promise<CurrentSchematicRelevanceDisplayWriteWorkflowResult> | null = null; #executionSettled = false;
  #result: CurrentSchematicRelevanceDisplayWriteWorkflowResult | null = null;
  #normalPending: Promise<unknown> | null = null; #publication: Promise<unknown> | null = null; #reserveEntered = false;
  #reader: CurrentSchematicRelevanceSavedReadbackWorkflow | null = null; #capture: GeneratedSchematicRelevanceDisplayClosedCapture | null = null;
  #stage = "prepared"; #aborted = false; #failed = false; #closed = false; #normalCloseAcknowledged = false;
  #failureDiagnostic: CurrentSchematicRelevanceDisplayWriteDiagnostic | null = null;
  #modifyEntered = false; #modifyAcknowledgement: GeneratedSchematicRelevanceDisplayStageResult | null = null;
  #saveEntered = false; #saveAcknowledgement: GeneratedSchematicRelevanceDisplayStageResult | null = null;
  #cleanup: Promise<void> | null = null; #cleanupSettled = false; #cleanupExitExhausted = false; #cleanupPublicationBlocked = false;
  #abort: Promise<void> | null = null; #abortAcknowledged = false; #release: Promise<void> | null = null;
  #cleanupBinding: string | null = null; #settlement: Promise<void> | null = null; #publicationSettlement: Promise<void> | null = null;
  #launchLease: CurrentPcbDiagnosticLaunchLease | null = null; #launchLeaseReleased = false;
  #failureClosure: CurrentSchematicRelevanceDisplayWriteFailureClosure | null = null;
  #failureSource: Readonly<{ token: CurrentSchematicRelevanceDisplayWriteFailureClosure; plan: CurrentSchematicRelevanceDisplayWritePlan; journal: GeneratedSchematicRelevanceDisplayJournal }> | null = null;
  public constructor(options: CurrentPcbDiagnosticInstallationOptions, plan: CurrentSchematicRelevanceDisplayWritePlan) {
    this.#original = requireOriginalCurrentSchematicRelevanceDisplayWritePlan(plan); captureCurrentPcbStringClockReply(options);
    requireCurrentSchematicRelevanceDisplayWriteCompositionSource(); need(Object.isFrozen(options) && !attempts.has(plan), "ORIGINAL_PREPARATION"); attempts.add(plan);
    this.#options = options; this.#plan = plan; this.#journal = new GeneratedSchematicRelevanceDisplayJournal(this.#original.argumentsValue, this.#original.prepared); Object.freeze(this);
  }
  #current(cleanup = false): void {
    need(requireOriginalCurrentSchematicRelevanceDisplayWritePlan(this.#plan) === this.#original && (cleanup || !this.#aborted), "ORIGINAL_PLAN");
    if (this.#launchLease !== null && !this.#launchLeaseReleased) { assertCurrentPcbDiagnosticLaunchExclusion(this.#launchLease); }
    if (this.#owner !== null) { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(this.#owner); need(originalCurrentSchematicRelevanceDisplayWriteTarget(this.#owner) === this.#original.prepared, "ORIGINAL_OWNER"); }
    if (!cleanup && !this.#normalCloseAcknowledged && !this.#closed && this.#group !== null) { need(this.#owner !== null && this.#composition !== null, "ORIGINAL_COMPOSITION"); requireOriginalCurrentSchematicRelevanceDisplayWriteComposition(this.#group, this.#owner, this.#original.argumentsValue); }
  }
  #ownerRequired(cleanup = false): CurrentSchematicRelevanceDisplayWriteOwner { this.#current(cleanup); need(this.#owner !== null, "OWNER_REQUIRED"); return this.#owner; }
  #retain<T>(promise: Promise<T>): Promise<T> {
    this.#pending.add(promise); void (async (): Promise<void> => { try { await promise; } catch {
      // Preserve the rejection on the actual retained original Promise.
    } finally { this.#pending.delete(promise); } })(); return promise;
  }
  async #invoke<T>(stage: string, action: () => Promise<T>): Promise<T> {
    this.#current(); need(this.#normalPending === null, "ORIGINAL_NORMAL_CALL_PENDING"); this.#stage = stage;
    const pending = this.#retain(action()); this.#normalPending = pending;
    try { const result = await pending; this.#current(); return result; } finally { if (this.#normalPending === pending) { this.#normalPending = null; } }
  }
  #records(): ReturnType<typeof assertGeneratedSchematicRelevanceDisplayJournalChain> { return assertGeneratedSchematicRelevanceDisplayJournalChain(this.#journal.retained()["records"]); }
  #has(kind: Kind): boolean { return this.#records().some(record => record.kind === kind); }
  async #publish<T>(action: () => Promise<T>, cleanup = false): Promise<T> {
    this.#current(cleanup); need(this.#publication === null, "ORIGINAL_PUBLICATION_PENDING");
    const pending = this.#retain(action()); this.#publication = pending;
    try { const result = await pending; this.#current(cleanup); return result; } finally { if (this.#publication === pending) { this.#publication = null; } }
  }
  async #record(kind: Kind, evidence: Evidence, cleanup = false): Promise<void> { await this.#publish(() => this.#journal.append(kind, evidence), cleanup); }
  async #stageCall<T>(stage: GeneratedSchematicRelevanceDisplayJournalStage, before: Evidence, action: () => Promise<T>, after: (value: T) => Evidence): Promise<T> {
    await this.#record(`${stage}-intent`, before); const value = await this.#invoke(stage, action); await this.#record(`${stage}-result`, after(value)); return value;
  }
  #stagePacket(value: unknown, stage: GeneratedSchematicRelevanceDisplayStageResult["stage"]): GeneratedSchematicRelevanceDisplayStageResult {
    need(isStage(value), "ORIGINAL_STAGE_PACKET"); return requireOriginalSchematicRelevanceDisplayStage(this.#ownerRequired(), this.#original.argumentsValue, value, stage);
  }
  async #open(owner: CurrentSchematicRelevanceDisplayWriteOwner, group: CurrentSchematicRelevanceDisplayWriteObservers): Promise<void> {
    const intents = await this.#publish(() => this.#journal.appendStartupCancellationIntents(owner));
    const browser = await this.#invoke("writer-browser", () => owner.browserObservation()); const selected = selectCurrentPcb209StartPage(browser);
    const frames = await this.#invoke("writer-frames", () => owner.inspectFrames(selected.targetId)); const frame = selectCurrentPcb209StartPageFrame(frames, selected);
    await this.#invoke("writer-ui-source", () => owner.inspectScript(frame.frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui));
    this.#current(); group.armBeforeNavigation(intents);
    const opening = await this.#invoke("writer-project-and-page", () => owner.openGeneratedSchematicDisplay(this.#original.argumentsValue));
    need(opening.outcome === "opened-ready", "ORIGINAL_OPENING"); await this.#invoke("writer-startup", () => group.waitForStartupObservations());
    await this.#record("opening-result", { opening, originalStartupAndPollingAndLibraryControlsVerified: true });
  }
  async #modify(owner: CurrentSchematicRelevanceDisplayWriteOwner, group: CurrentSchematicRelevanceDisplayWriteObservers, composition: CurrentSchematicRelevanceDisplayWriteComposition,
    preflight: GeneratedSchematicRelevanceDisplayStageResult): Promise<GeneratedSchematicRelevanceDisplayNativeEffect> {
    await this.#invoke("writer-accessors", () => group.observeAccessors());
    const dispatch = await this.#publish(() => this.#journal.appendIntent("modify", { originalPlan: this.#plan, attemptsAuthorized: 1 }, owner)); this.#current();
    await this.#invoke("writer-pre-modify", () => group.prepareModification(dispatch)); this.#modifyEntered = true;
    await this.#invoke("writer-original-entry", () => group.generateModificationEntry(dispatch));
    await this.#invoke("writer-original-prefix", () => group.observeOriginalRunPrefix());
    this.#stage = "writer-original-run"; const continuation = this.#retain(composition.continueOriginalRun());
    const acknowledgement = this.#retain((async (): Promise<GeneratedSchematicRelevanceDisplayStageResult> => { const value = this.#stagePacket(await composition.waitOriginalModification(), "modify"); this.#modifyAcknowledgement = value; return value; })());
    const completed = await Promise.all([acknowledgement, continuation]); this.#current();
    const modified = this.#stagePacket(completed[0], "modify"); this.#modifyAcknowledgement = modified; await this.#record("modify-result", modified);
    const observed = await this.#stageCall("observe", { originalModifiedSourceRequired: true }, () => composition.observeAfterModification(), value => this.#stagePacket(value, "observe"));
    return this.#stageCall("effect", { exactOriginalStageReferencesRequired: true }, () => Promise.resolve(qualifyOriginalGeneratedSchematicRelevanceDisplayEffect(owner, this.#original.argumentsValue, preflight, modified, observed)), value => {
      requireOriginalGeneratedSchematicRelevanceDisplayEffect(value, owner, this.#original.argumentsValue); return { originalEffect: value };
    });
  }
  async #save(owner: CurrentSchematicRelevanceDisplayWriteOwner, composition: CurrentSchematicRelevanceDisplayWriteComposition, effect: GeneratedSchematicRelevanceDisplayNativeEffect): Promise<CurrentSchematicRelevanceDisplaySaveDrained> {
    await this.#stageCall("clock", { originalNativeEffectRequired: true }, async () => { await composition.armSaveClock(effect); this.#current(); await composition.prepareSaveMain(effect); this.#current(); owner.requireSchematicRelevanceDisplaySaveMainReady(this.#original.argumentsValue, effect); }, () => ({ originalClockAndProspectiveMainArmed: true }));
    const dispatch = await this.#publish(() => this.#journal.appendIntent("save", { originalEffect: effect, attemptsAuthorized: 1 }, owner)); this.#current();
    await this.#invoke("writer-save-generation", () => owner.prepareSchematicRelevanceDisplaySaveGeneration(this.#original.argumentsValue, effect, dispatch));
    // All original collectors start before SDK generation. The same producer
    // Stream must service local/buffer/cloud ingress while Main remains held.
    this.#stage = "writer-save-and-drain"; const observation = this.#retain(composition.observeOriginalSave()); const local = this.#retain(composition.serviceSaveLocalCalls()); const drain = this.#retain(composition.drainOriginalSave());
    this.#saveEntered = true; const generation = this.#retain(owner.generateSchematicRelevanceDisplaySave(this.#original.argumentsValue, effect, dispatch));
    const sdk = this.#retain((async (): Promise<GeneratedSchematicRelevanceDisplayStageResult> => { await generation; const value = this.#stagePacket(await owner.waitSchematicRelevanceDisplaySave(this.#original.argumentsValue), "save"); this.#saveAcknowledgement = value; return value; })());
    const completed = await Promise.all([sdk, observation, local, drain]); this.#current(); this.#saveAcknowledgement = completed[0];
    const drained = composition.requireOriginalSaveDrained(); requireOriginalCurrentSchematicRelevanceDisplaySaveDrained(drained, owner, this.#original.argumentsValue);
    await this.#record("save-result", completed[0]); return drained;
  }
  async #observeExit(owner: CurrentSchematicRelevanceDisplayWriteOwner, cleanup: boolean): Promise<void> {
    for (let index = 0; index < EXIT.observations; index += 1) {
      this.#current(cleanup); if (await this.#retain(owner.observeTermination())) { this.#current(true); originalCurrentSchematicRelevanceDisplayWriteTermination(owner); this.#closed = true; this.#current(cleanup); return; }
      this.#current(cleanup); if (index + 1 < EXIT.observations) { await delay(EXIT.delayMilliseconds); }
    }
    if (cleanup) { this.#cleanupExitExhausted = true; } throw createOriginalSourceError("SCHEMATIC_RELEVANCE_WORKFLOW", "ORIGINAL_EXIT_NOT_OBSERVED");
  }
  async #releaseClosed(owner: CurrentSchematicRelevanceDisplayWriteOwner): Promise<void> {
    this.#current(true); need(this.#closed, "ORIGINAL_CLOSURE_REQUIRED");
    if (this.#group !== null) { await this.#group.settleOriginalCallsAfterExit(); this.#current(true); }
    this.#release ??= owner.releaseClosed(); await this.#release; this.#current(true); need(owner.status().released && owner.status().helperClosed, "ORIGINAL_HELPER_NOT_RELEASED");
  }
  async #closeAndCapture(owner: CurrentSchematicRelevanceDisplayWriteOwner, drained: CurrentSchematicRelevanceDisplaySaveDrained): Promise<GeneratedSchematicRelevanceSavedReadbackPlan> {
    requireOriginalCurrentSchematicRelevanceDisplaySaveDrained(drained, owner, this.#original.argumentsValue);
    await this.#stageCall("close", { originalNormalCloseOnly: true }, async () => { const hwnd = await owner.observeApplicationWindow(); this.#current(); need(hwnd !== null, "ORIGINAL_WINDOW_REQUIRED"); await owner.requestNormalClose(hwnd); this.#normalCloseAcknowledged = true; this.#current(); return { originalNormalCloseAcknowledged: true, saveOrDiscardSelected: false }; }, value => value);
    await this.#stageCall("exit", { originalRootAndEmptyJobRequired: true }, async () => { await this.#observeExit(owner, false); return { rootExited: true, jobEmpty: true }; }, value => value);
    const snapshot = await this.#stageCall("closed-sql", { completeSourceAndAllSqlTablesRequired: true }, async () => {
      this.#capture = new GeneratedSchematicRelevanceDisplayClosedCapture(owner, originalCurrentSchematicRelevanceDisplayWriteTermination(owner)); const result = await this.#capture.capture(); this.#current(); await this.#capture.settleRelease(); this.#current(); need(this.#capture.isReleaseAcknowledged(), "ORIGINAL_FD_RELEASE"); return result;
    }, value => { const data = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(value, owner); need(data.rawHistory !== null, "COMPLETE_RAW_HISTORY_REQUIRED"); return { sourceSha256: value.sourceSha256, logicalSha256: data.inventory.logicalSha256, rawHistorySha256: sha256Json(data.rawHistory), allOriginalHandlesClosed: true }; });
    const lifecycle = await this.#stageCall("qualify", { actualHistoryAndStructureEffectsRequired: true }, () => completeOriginalGeneratedSchematicRelevanceClosedLifecycle(owner, this.#original.argumentsValue, drained, originalCurrentSchematicRelevanceDisplayWriteTermination(owner), snapshot), value => ({ originalClosedLifecycle: value }));
    await this.#stageCall("release", { originalHelperOnly: true }, () => this.#releaseClosed(owner), () => ({ released: true }));
    return prepareGeneratedSchematicRelevanceSavedReadbackPlan(lifecycle);
  }
  public execute(): Promise<CurrentSchematicRelevanceDisplayWriteWorkflowResult> {
    if (this.#execution !== null) { return this.#execution; } this.#current();
    const execution = (async (): Promise<CurrentSchematicRelevanceDisplayWriteWorkflowResult> => {
      try {
        this.#launchLease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#current();
        await assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites(); this.#current(); this.#reserveEntered = true; await this.#journal.reserve(); this.#current();
        await this.#stageCall("baseline", { completeInitialSqlRequired: true }, () => verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(this.#original.prepared), () => ({ sourceSha256: this.#original.argumentsValue.target.expectedSourceSha256, originalHistorySha256: sha256Json(this.#original.prepared.history) }));
        const owner = await this.#stageCall("allocation", { originalFactoryRequired: true }, async () => {
          this.#factory = startCurrentSchematicRelevanceDisplayWriteOwner(this.#options, this.#original.prepared);
          try { const original = await this.#factory; this.#owner = original; this.#journal.bindWriter(original); this.#writerBound = true; this.#current(); return original; }
          finally { this.#factorySettled = true; }
        }, value => ({ helperPid: value.status().helperPid, originalFactoryVerified: true }));
        const group = new CurrentSchematicRelevanceDisplayWriteObservers(owner, this.#original.argumentsValue); this.#group = group;
        const composition = requireOriginalCurrentSchematicRelevanceDisplayWriteComposition(group, owner, this.#original.argumentsValue); this.#composition = composition;
        await this.#stageCall("launch", { originalCheckpointAndExecutableRequired: true }, () => owner.startSchematicRelevanceDisplayWriteGeneration(this.#original.argumentsValue), () => ({ originalBinding: owner.status().binding }));
        await this.#stageCall("main", { originalBeforeImportSqlFenceRequired: true }, () => owner.observeFootprintMainConstruction(), value => ({ originalMain: value }));
        await this.#open(owner, group);
        await this.#stageCall("capture", { originalSdkAndHolderRequired: true }, () => owner.executeSchematicDisplayStage("capture", this.#original.argumentsValue), value => ({ originalCapture: value }));
        const preflight = await this.#stageCall("preflight", { exactOriginalTargetRequired: true }, async () => this.#stagePacket(await owner.executeSchematicDisplayStage("preflight", this.#original.argumentsValue), "preflight"), value => ({ originalPreflight: value }));
        const effect = await this.#modify(owner, group, composition, preflight); const drained = await this.#save(owner, composition, effect);
        const savedPlan = await this.#closeAndCapture(owner, drained); this.#current();
        const parent = prepareOriginalCurrentSchematicRelevanceSavedReadbackParent(this.#journal, savedPlan);
        const reader = new CurrentSchematicRelevanceSavedReadbackWorkflow(this.#options, savedPlan, parent); this.#reader = reader;
        const savedReadback = await this.#invoke("fresh-saved-reader", () => reader.execute()); reader.requireOriginalResult(savedReadback); this.#current();
        await this.#stageCall("complete", { originalWriterAndReaderReleased: true }, () => Promise.resolve(savedReadback), () => ({ saved: true, reopened: true, completeSqlVerified: true, completePeerRosterPreserved: true, inverseAvailable: false }));
        this.#releaseLaunchExclusion(); need(this.#launchLeaseReleased, "ORIGINAL_LAUNCH_EXCLUSION_NOT_RELEASED");
        const result: CurrentSchematicRelevanceDisplayWriteWorkflowResult = Object.freeze({ profile: "private.current-schematic-relevance-display-write-workflow-result.v1", operationId: this.#plan.operationId,
          savedReadback, saved: true, reopened: true, completeSqlVerified: true, peerRosterPreserved: true, originalHelpersReleased: true, inverseAvailable: false });
        results.set(result, this); this.#result = result; this.#stage = "complete"; return result;
      } catch (error) {
        this.#failureDiagnostic ??= currentSchematicRelevanceDisplayWriteDiagnostic(this.#stage, currentSchematicRelevanceDisplayWriteErrorCode(error));
        this.#failed = true; try { await this.#cleanupOriginal(); } catch {
          // Retain the first execution failure and independently visible cleanup.
        } throw error;
      } finally { this.#executionSettled = true; this.#releaseLaunchExclusion(); }
    })(); this.#execution = execution; return execution;
  }
  #releaseLaunchExclusion(): void {
    const lease = this.#launchLease;
    if (lease === null || this.#launchLeaseReleased || this.#cleanupPublicationBlocked || this.#journal.retained()["publicationPending"] === true || this.#publication !== null || this.#pending.size > 0 || this.#factory !== null && !this.#factorySettled || this.#capture !== null && !this.#capture.isReleaseAcknowledged()) { return; }
    const allocation = currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared), owner = this.#owner ?? allocation.owner;
    if (owner === null) { if (allocation.state !== "not-attempted" && allocation.state !== "no-resource") { return; } }
    else {
      assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); const state = owner.status();
      if (!state.released || !state.helperClosed || state.binding !== null && !this.#closed) { return; }
    }
    if (this.#reader !== null) { try { this.#originalReaderClosure(); } catch { return; } }
    releaseCurrentPcbDiagnosticLaunchExclusion(lease); this.#launchLeaseReleased = true;
  }
  async #journalReady(): Promise<void> {
    const pending = this.#publication; if (pending !== null) { await Promise.allSettled([pending]); }
    try {
      if (this.#journal.retained()["publicationPending"] === true || this.#journal.retained()["reserved"] !== true) { await this.#journal.settlePublication(); }
      await this.#journal.assertOriginalPublication(); this.#current(true);
    } catch (error) { this.#cleanupPublicationBlocked = true; throw error; }
  }
  async #cleanupRecord(kind: Kind, evidence: Evidence): Promise<void> {
    await this.#journalReady(); if (!this.#has(kind)) { try { await this.#record(kind, evidence, true); } catch (error) { this.#cleanupPublicationBlocked = true; throw error; } }
  }
  async #runCleanup(): Promise<void> {
    if (this.#factory !== null && this.#owner === null) { try { this.#owner = await this.#factory; } catch { this.#owner = currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared).owner; } }
    this.#current(true);
    if (!this.#reserveEntered) { need(this.#factory === null, "UNPUBLISHED_FACTORY"); return; }
    await this.#journalReady(); this.#cleanupPublicationBlocked = false;
    await this.#cleanupRecord("failure", { stage: this.#stage, originalExecutionStopped: true, retryAuthorized: false });
    const errors: unknown[] = [];
    if (this.#capture !== null) { try { await this.#capture.settleRelease(); need(this.#capture.isReleaseAcknowledged(), "ORIGINAL_FD_RELEASE_UNRESOLVED"); } catch (error) { errors.push(error); } }
    if (this.#reader !== null) {
      try { await this.#reader.abort(true); await Promise.allSettled(this.#pending); this.#current(true); } catch (error) { errors.push(error); }
      if (errors.length > 0) { throw new AggregateError(errors, "SCHEMATIC_RELEVANCE_WORKFLOW_ORIGINAL_CLEANUP_PENDING"); } return;
    }
    const owner = this.#owner;
    if (owner === null) {
      const allocation = currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared);
      if (allocation.state === "not-attempted") { need(this.#factory === null, "ORIGINAL_ALLOCATION_NEVER_ENTERED"); if (!this.#has("allocation-intent")) { await this.#cleanupRecord("no-allocation", { allocationNeverEntered: true }); } }
      else { need(allocation.state === "no-resource" && this.#factorySettled, "ORIGINAL_ALLOCATION_UNRESOLVED"); }
      if (errors.length > 0) { throw new AggregateError(errors, "SCHEMATIC_RELEVANCE_WORKFLOW_ORIGINAL_FD_PENDING"); } return;
    }
    if (!this.#writerBound) { this.#journal.bindWriter(owner); this.#writerBound = true; }
    let state = owner.status();
    if (state.released && state.helperClosed) { if (errors.length > 0) { throw new AggregateError(errors, "SCHEMATIC_RELEVANCE_WORKFLOW_ORIGINAL_FD_PENDING"); } return; }
    if (state.binding === null) {
      const pending = this.#normalPending; if (pending !== null) { await Promise.allSettled([pending]); } this.#current(true); state = owner.status();
      if (state.binding === null) {
        need(!state.launchConsumed || state.noProcessCleanupAvailable, "ORIGINAL_LAUNCH_UNRESOLVED");
        this.#release ??= state.noProcessCleanupAvailable ? (async (): Promise<void> => { await owner.releaseNoProcess(); })() : owner.releaseUnlaunched();
        await this.#release; this.#current(true); need(owner.status().released && owner.status().helperClosed, "ORIGINAL_NO_ROOT_HELPER_RELEASE");
        if (errors.length > 0) { throw new AggregateError(errors, "SCHEMATIC_RELEVANCE_WORKFLOW_ORIGINAL_FD_PENDING"); } return;
      }
    }
    const binding = owner.status().binding; need(binding !== null, "ORIGINAL_CLEANUP_BINDING");
    need(this.#cleanupBinding === null || this.#cleanupBinding === canonicalJson(binding), "ORIGINAL_CLEANUP_BINDING"); this.#cleanupBinding = canonicalJson(binding);
    if (!this.#closed) {
      if (this.#abort === null) { await this.#cleanupRecord("abort-intent", { originalJobOnly: true }); this.#group?.cancel(); this.#abort = owner.abortSchematicDisplayWrite(); }
      try { await this.#abort; this.#abortAcknowledged = true; } catch {
        // An unknown original abort result never permits another dispatch.
      }
      await this.#cleanupRecord("abort-result", { originalAbortAcknowledged: this.#abortAcknowledged, retryAuthorized: false });
      await Promise.allSettled(this.#pending); this.#current(true);
      await this.#cleanupRecord("termination-intent", { originalRootAndJobRequired: true }); await this.#observeExit(owner, true);
      await this.#cleanupRecord("termination-result", { rootExited: true, jobEmpty: true });
    } else if (!this.#has("termination-result")) {
      await this.#cleanupRecord("termination-intent", { originalRootAndJobAlreadyObserved: true }); originalCurrentSchematicRelevanceDisplayWriteTermination(owner);
      await this.#cleanupRecord("termination-result", { rootExited: true, jobEmpty: true });
    }
    await this.#cleanupRecord("release-intent", { originalHelperOnly: true }); await this.#releaseClosed(owner); await this.#cleanupRecord("release-result", { released: true });
    if (errors.length > 0) { throw new AggregateError(errors, "SCHEMATIC_RELEVANCE_WORKFLOW_ORIGINAL_FD_PENDING"); }
  }
  #cleanupOriginal(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; }
    const pending = (async (): Promise<void> => { try { await this.#runCleanup(); } finally { this.#cleanupSettled = true; this.#releaseLaunchExclusion(); } })(); this.#cleanup = pending; return pending;
  }
  public abort(confirmOriginalJobOnly: true): Promise<void> {
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime confirmation is exactly original-Job-only cleanup, never caller PID/path control.
    need(confirmOriginalJobOnly === true, "ORIGINAL_ABORT_CONFIRMATION"); if (this.#result !== null) { return Promise.resolve(); } this.#aborted = true;
    return this.#execution === null ? Promise.resolve() : this.#settlement ?? this.#cleanupOriginal();
  }
  public settleCleanup(): Promise<void> {
    const cleanup = this.#cleanup; need(cleanup !== null, "CLEANUP_NOT_SUBMITTED"); if (this.#settlement !== null) { return this.#settlement; }
    if (!this.#cleanupSettled || !this.#cleanupExitExhausted && !this.#cleanupPublicationBlocked && this.#reader?.cleanupStatus().publicationPending !== true) { return cleanup; }
    const binding = this.#cleanupBinding, owner = this.#owner, publication = this.#cleanupPublicationBlocked;
    const pending = (async (): Promise<void> => {
      await Promise.allSettled([cleanup]); this.#current(true); await this.#journalReady();
      if (this.#reader !== null) { await this.#reader.settleCleanup(); await Promise.allSettled(this.#pending); }
      else if (!publication) { need(owner !== null && binding !== null && canonicalJson(owner.status().binding) === binding, "ORIGINAL_SETTLEMENT_BINDING"); await this.#observeExit(owner, true); }
      await this.#runCleanup(); this.#releaseLaunchExclusion();
    })(); this.#settlement = pending; return pending;
  }
  public settlePublication(): Promise<void> {
    this.#publicationSettlement ??= (async (): Promise<void> => {
      if (this.#execution !== null) { await Promise.allSettled([this.#execution]); }
      if (!this.#reserveEntered) { return; } await this.#journalReady(); this.#cleanupPublicationBlocked = false;
      if (this.#failed || this.#aborted) { await this.settleCleanup(); }
    })(); return this.#publicationSettlement;
  }
  #originalReaderClosure(): ReturnType<CurrentSchematicRelevanceSavedReadbackWorkflow["requireOriginalResourceClosure"]> {
    const reader = this.#reader; need(reader !== null && Object.getPrototypeOf(reader) === CurrentSchematicRelevanceSavedReadbackWorkflow.prototype &&
      reader.requireOriginalResourceClosure === readerResourceClosure && CurrentSchematicRelevanceSavedReadbackWorkflow.prototype.requireOriginalResourceClosure === readerResourceClosure, "ORIGINAL_READER_METHOD");
    return readerResourceClosure.call(reader);
  }
  #failureValue(): CurrentSchematicRelevanceDisplayWriteFailureClosureValue {
    this.#current(true); need((this.#failed || this.#aborted) && this.#execution !== null && this.#executionSettled && this.#result === null && this.#cleanupSettled && this.#pending.size === 0 &&
      this.#publication === null && !this.#cleanupPublicationBlocked && this.#journal.retained()["publicationPending"] === false && (this.#factory === null || this.#factorySettled) &&
      (this.#capture === null || this.#capture.isReleaseAcknowledged()) && (this.#launchLease === null || this.#launchLeaseReleased), "ORIGINAL_FAILURE_CLOSURE_PENDING");
    const allocation = currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared), owner = this.#owner ?? allocation.owner;
    let writer: CurrentSchematicRelevanceDisplayWriteGenerationClosure;
    if (owner === null) {
      if (allocation.state === "not-attempted" && this.#factory === null) { writer = Object.freeze({ outcome: "allocation-never-entered", helperAllocated: false, rootCreated: false, exitClaimed: false }); }
      else { need(allocation.state === "no-resource" && this.#factorySettled, "ORIGINAL_FAILURE_ALLOCATION_UNRESOLVED"); writer = Object.freeze({ outcome: "no-resource-allocated", helperAllocated: false, rootCreated: false, exitClaimed: false }); }
    } else {
      assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); const state = owner.status(); need(state.released && state.helperClosed, "ORIGINAL_FAILURE_HELPER_UNRELEASED");
      if (state.binding === null) { writer = Object.freeze({ outcome: "root-never-created", helperAllocated: true, helperReleased: true, rootCreated: false, exitClaimed: false }); }
      else { need(this.#closed, "ORIGINAL_FAILURE_ROOT_EXIT"); originalCurrentSchematicRelevanceDisplayWriteTermination(owner); writer = Object.freeze({ outcome: "root-exited", helperAllocated: true, helperReleased: true, rootCreated: true, originalRootExited: true, originalJobEmpty: true }); }
    }
    const reader = this.#reader === null ? null : this.#originalReaderClosure(); let readback: CurrentSchematicRelevanceDisplayWriteGenerationClosure | null = null;
    if (reader !== null) {
      const source = reader.generation;
      if (source.outcome === "allocation-never-entered") { readback = Object.freeze({ ...source, outcome: "allocation-never-entered" }); }
      else if (source.outcome === "no-resource-allocated") { readback = Object.freeze({ ...source, outcome: "no-resource-allocated" }); }
      else { readback = source; }
    }
    return Object.freeze({ writer, readback, capture: this.#capture !== null || reader?.captureStarted === true ? "all-original-handles-closed" : "not-started", saved: false, reopened: false, completionClaimed: false, ownerTransferred: false, replayAllowed: false });
  }
  public requireOriginalFailureClosure(): CurrentSchematicRelevanceDisplayWriteFailureClosure {
    const value = this.#failureValue();
    if (this.#failureClosure !== null) { const original = failureClosures.get(this.#failureClosure); need(original !== undefined && canonicalJson(original.value) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED"); return this.#failureClosure; }
    const token: CurrentSchematicRelevanceDisplayWriteFailureClosure = Object.freeze({ profile: "private.current-schematic-relevance-display-write-failure-closure.v1" });
    const bindings: CurrentSchematicRelevanceDisplayWriteFailureClosureBindings = Object.freeze({ plan: this.#plan, journal: this.#journal, value,
      assertCurrent: async (): Promise<void> => { need(this.#failureClosure === token && canonicalJson(this.#failureValue()) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED"); await this.#journal.assertOriginalPublication(); need(this.#failureClosure === token && canonicalJson(this.#failureValue()) === canonicalJson(value), "ORIGINAL_FAILURE_CLOSURE_CHANGED"); } });
    failureClosures.set(token, bindings); this.#failureClosure = token; return token;
  }
  public requireOriginalFailurePublicationSource(): Readonly<{ token: CurrentSchematicRelevanceDisplayWriteFailureClosure; plan: CurrentSchematicRelevanceDisplayWritePlan; journal: GeneratedSchematicRelevanceDisplayJournal }> | null {
    this.#failureValue(); if (!this.#reserveEntered) { return null; } this.#failureSource ??= Object.freeze({ token: this.requireOriginalFailureClosure(), plan: this.#plan, journal: this.#journal });
    requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure(this.#failureSource.token, this.#plan, this.#journal); return this.#failureSource;
  }
  public requireOriginalResult(result: CurrentSchematicRelevanceDisplayWriteWorkflowResult): CurrentSchematicRelevanceDisplayWriteWorkflowResult {
    this.#current(); need(this.#result === result && results.get(result) === this && this.#normalCloseAcknowledged && this.#closed && this.#reader !== null && this.#launchLeaseReleased, "ORIGINAL_RESULT");
    const owner = this.#ownerRequired(); need(owner.status().released && owner.status().helperClosed && this.#journal.retained()["publicationPending"] === false && this.#records().at(-1)?.kind === "complete-result", "ORIGINAL_RESULT_CLEANUP");
    this.#reader.requireOriginalResult(result.savedReadback); return result;
  }
  public inspect(): Readonly<Record<string, unknown>> {
    this.#current(true); return Object.freeze({ profile: "private.current-schematic-relevance-display-write-workflow-status.v1", operationId: this.#plan.operationId, stage: this.#stage,
      started: this.#execution !== null, executionSettled: this.#executionSettled, failed: this.#failed, aborted: this.#aborted, allocation: currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared).state,
      pendingOriginalCalls: this.#pending.size, cleanupSettled: this.#cleanupSettled, cleanupExitWaitExhausted: this.#cleanupExitExhausted, cleanupPublicationBlocked: this.#cleanupPublicationBlocked,
      originalAbortAcknowledged: this.#abortAcknowledged, originalRootAndJobClosed: this.#closed, originalNormalCloseAcknowledged: this.#normalCloseAcknowledged,
      originalLaunchExclusionRetained: this.#launchLease !== null && !this.#launchLeaseReleased, observers: this.#group?.status() ?? null, owner: this.#owner?.status() ?? null,
      reader: this.#reader?.inspect() ?? null, capture: this.#capture?.status() ?? null, journal: this.#journal.retained(), saved: this.#result !== null, reopened: this.#result !== null });
  }
  public diagnostic(): CurrentSchematicRelevanceDisplayWriteDiagnostic {
    return this.#failureDiagnostic ?? currentSchematicRelevanceDisplayWriteDiagnostic(this.#stage, null);
  }
  public operationResult(action: CurrentSchematicRelevanceDisplayWriteResult["action"]): CurrentSchematicRelevanceDisplayWriteResult {
    this.#current(true); const allocation = currentSchematicRelevanceDisplayWriteAllocationOutcome(this.#original.prepared), owner = this.#owner ?? allocation.owner, state = owner?.status();
    let currentAllocation: CurrentSchematicRelevanceDisplayWriteResult["cleanup"]["allocation"] = "unresolved";
    if (state?.released === true && state.helperClosed) { currentAllocation = "released"; } else if (owner !== null) { currentAllocation = "retained"; }
    else if (allocation.state === "not-attempted") { currentAllocation = "not-entered"; } else if (allocation.state === "no-resource") { currentAllocation = "no-resource"; }
    const reader = this.#reader?.cleanupStatus(); const capturePending = this.#capture !== null && !this.#capture.isReleaseAcknowledged() || reader?.captureReleasePending === true;
    const cleanup: CurrentSchematicRelevanceDisplayWriteResult["cleanup"] = reader === undefined ? { generation: owner === null && currentAllocation === "not-entered" ? "none" : "writer", allocation: currentAllocation,
      nativeResourcesRetained: currentAllocation === "retained" || currentAllocation === "unresolved", abortAttempted: this.#abort !== null, originalTerminationVerified: this.#closed,
      helperReleaseVerified: state?.released === true && state.helperClosed, publicationPending: this.#cleanupPublicationBlocked || this.#publication !== null || this.#journal.retained()["publicationPending"] === true } : {
      generation: "readback", allocation: reader.allocation, nativeResourcesRetained: reader.nativeResourcesRetained, abortAttempted: reader.abortAttempted,
      originalTerminationVerified: reader.originalTerminationVerified, helperReleaseVerified: reader.helperReleaseVerified,
      publicationPending: reader.publicationPending || this.#cleanupPublicationBlocked || this.#publication !== null || this.#journal.retained()["publicationPending"] === true };
    const completed = this.#result !== null; if (this.#result !== null) { this.requireOriginalResult(this.#result); }
    let phase: CurrentSchematicRelevanceDisplayWriteResult["state"] = "verification-pending";
    if (completed) { phase = "completed"; } else if (this.#execution === null && !this.#aborted) { phase = "prepared"; } else if (!this.#failed && !this.#aborted) { phase = "running"; }
    else if (cleanup.nativeResourcesRetained || cleanup.publicationPending || capturePending || this.#pending.size > 0 || reader?.originalCallsPending === true || this.#launchLease !== null && !this.#launchLeaseReleased) { phase = "needs-cleanup"; }
    let saveOutcome: CurrentSchematicRelevanceDisplayWriteResult["effects"]["saveOutcome"] = "not-attempted"; if (this.#saveEntered) { saveOutcome = this.#saveAcknowledgement === null ? "unknown" : "acknowledged"; }
    return currentSchematicRelevanceDisplayWriteResultSchema.parse({ schema: "easyeda-pro-control.schematic209-relevance-display-write-operation.v1", action, operationId: this.#plan.operationId, state: phase,
      effects: { modifyAttempted: this.#modifyEntered, modifyAcknowledged: this.#modifyAcknowledgement !== null, saveAttempted: this.#saveEntered, saveOutcome },
      verification: { saved: completed, reopened: completed, completeSqlVerified: completed, peerRosterPreserved: completed }, cleanup, forwardOnly: true, inverseAvailable: false });
  }
}

/** Same private original binding on every lookup; publication must await its
 * current-resource reproof before and after every original file operation. */
export function requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure(token: CurrentSchematicRelevanceDisplayWriteFailureClosure,
  plan: CurrentSchematicRelevanceDisplayWritePlan, journal: GeneratedSchematicRelevanceDisplayJournal): CurrentSchematicRelevanceDisplayWriteFailureClosureBindings {
  const original = failureClosures.get(token);
  if (original === undefined || original.plan !== plan || original.journal !== journal) { throw createOriginalSourceError("SCHEMATIC_RELEVANCE_WORKFLOW", "ORIGINAL_FAILURE_CLOSURE"); }
  requireOriginalCurrentSchematicRelevanceDisplayWritePlan(plan); return original;
}
