import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_COMPOSITION_METHODS as COMPOSITION_METHODS } from "./current-schematic-relevance-display-write-composition.ts";
import { createOriginalSourceError } from "./original-source-error.ts";
import type { CurrentSchematicRelevanceDisplayWriteComposition } from "./current-schematic-relevance-display-write-composition.ts";
import { CurrentSchematicRelevanceRunPrefixObserver } from "./current-schematic-relevance-run-prefix-observer.ts";
import type { CurrentSchematicRelevanceRunPrefixObservation } from "./current-schematic-relevance-run-prefix-observer.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryOrigin } from "./current-schematic-relevance-display-modify-entry-origin.ts";
import { CurrentSchematicRelevanceDisplayModifyEntryObserver } from "./current-schematic-relevance-display-modify-entry-observer.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryObservation, CurrentSchematicRelevanceDisplayRawSceneObservation } from "./current-schematic-relevance-display-modify-entry-observer.ts";
/** Original SCH composition. The durable enclosing operation owns birth,
 * navigation, intent publication and one-shot Modify/Save generation. */
/* oxlint-disable import/max-dependencies -- One original group joins separately branded worker, accessor, action and Main collectors without accepting caller implementation. */
import { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner, originalCurrentSchematicRelevanceDisplayWriteTarget, originalCurrentSchematicRelevanceDisplayWriteTermination,
  requireOriginalCurrentSchematicRelevanceDisplayActionGuard, requireOriginalCurrentSchematicRelevanceDisplayPreModifyMainOrigin, requireOriginalSchematicRelevanceDisplayStage } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import { CurrentProjectSyncQuiesceObserver } from "./current-project-sync-quiesce-observer.ts";
import type { CurrentProjectSyncQuiesceCompletion } from "./current-project-sync-quiesce-observer.ts";
import { CurrentProjectLibraryRefreshObserver } from "./current-project-library-refresh-observer.ts";
import type { CurrentProjectLibraryRefreshCompletion } from "./current-project-library-refresh-observer.ts";
import type { GeneratedSchematicRelevanceDisplayDispatch, GeneratedSchematicRelevanceDisplayLibraryIntent, GeneratedSchematicRelevanceDisplayPollingIntent } from "./generated-schematic-relevance-display-journal.ts";
import { CurrentSchematicRelevanceDisplayActionObserver } from "./current-schematic-relevance-display-action-observer.ts";
import type { CurrentSchematicRelevanceDisplayActionObservation } from "./current-schematic-relevance-display-action-observer.ts";
import { CurrentSchematicRelevanceDisplaySaveObserver } from "./current-schematic-relevance-display-save-observer.ts";
import { CurrentProjectSaveStructureObserver } from "./current-project-save-structure-observer.ts";
import type { CurrentProjectSaveStructurePacket } from "./current-project-save-structure-observer.ts";
import type { CurrentSchematicRelevanceStartupStructureDrained } from "./current-schematic-relevance-startup-structure-origin.ts";
import { CurrentProjectStructureTransportObserver } from "./current-project-structure-transport-observer.ts";
import { CurrentProjectSaveProducerObserver, requireOriginalCurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-observer.ts";
import type { CurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-observer.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "./current-project-save-producer-protocol.ts";
import { CurrentSchematicRelevanceDisplayAccessorObserver } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceDisplayAccessorObservation } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceDisplayActionGuardObservation } from "./current-schematic-relevance-display-action-origin.ts";
import type { CurrentSchematicRelevanceDisplayPreModifyMainOrigin } from "./current-schematic-relevance-display-pre-modify-main-origin.ts";

import { CurrentSchematicRelevanceActionCallbackObserver } from "./current-schematic-relevance-action-callback-observer.ts";
import { CurrentSchematicRelevanceDisplayClockObserver } from "./current-schematic-relevance-display-clock-observer.ts";
import { CurrentSchematicRelevanceDisplayMainRequestObserver } from "./current-schematic-relevance-display-main-request-observer.ts";
import { CurrentSchematicRelevanceDisplayMainBeginObserver } from "./current-schematic-relevance-display-main-begin-observer.ts";
import { CurrentSchematicRelevanceDisplayMainHistoryObserver } from "./current-schematic-relevance-display-main-history-observer.ts";
import { CurrentSchematicRelevanceDisplayMainStructureObserver } from "./current-schematic-relevance-display-main-structure-observer.ts";
import { CurrentSchematicRelevanceDisplayMainLiveHistoryObserver } from "./current-schematic-relevance-display-main-live-history-observer.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";
import type { CurrentSchematicRelevanceDisplaySaveDrained } from "./current-schematic-relevance-display-save-drained.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayEffect } from "./generated-schematic-relevance-display-effect.ts";
import type { GeneratedSchematicRelevanceDisplayNativeEffect } from "./generated-schematic-relevance-display-effect.ts";
import { qualifyOriginalGeneratedSchematicRelevanceDisplaySaveData } from "./generated-schematic-relevance-display-native-save.ts";
import type { GeneratedSchematicRelevanceDisplayStageResult } from "./generated-schematic-relevance-display.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "./generated-schematic-relevance-display.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES } from "./current-pcb-via-local-upload-protocol.ts";
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS } from "./current-pcb-via-upload-request-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS } from "./current-pcb-via-save-drain-protocol.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS } from "./current-pcb-via-post-history-sync-protocol.ts";

type Outcome = Readonly<{ ok: true }> | Readonly<{ ok: false; error: unknown }>;
type StructurePacketOutcome = Readonly<{ ok: true; packet: CurrentProjectSaveStructurePacket }> | Readonly<{ ok: false; error: unknown }>;
const consumed = new WeakSet<CurrentSchematicRelevanceDisplayWriteOwner>();
function need(value: boolean, code: string): asserts value { if (!value) { throw createOriginalSourceError("SCHEMATIC_RELEVANCE_DISPLAY_SETUP", code); } }
function result(value: Outcome): void { if (!value.ok) { throw value.error; } }
function requireStageShape(value: unknown): asserts value is GeneratedSchematicRelevanceDisplayStageResult { generatedSchematicRelevanceDisplayStageResultSchema.parse(value); }
const originalGroups = new WeakMap<CurrentSchematicRelevanceDisplayWriteObservers, Readonly<{ owner: CurrentSchematicRelevanceDisplayWriteOwner; argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments; assertCurrent: () => void }>>();
export class CurrentSchematicRelevanceDisplayWriteObservers {
  readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #arguments: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #prepared: ReturnType<typeof originalCurrentSchematicRelevanceDisplayWriteTarget>;
  readonly #startup = Promise.withResolvers<Outcome>();
  readonly #failureSignal = Promise.withResolvers<Readonly<{ error: unknown }>>();
  readonly #afterModification = Promise.withResolvers<Readonly<{ ok: true; packet: CurrentProjectSaveProducerHeldCall }> | Readonly<{ ok: false; error: unknown }>>();
  readonly #retained = new Set<Promise<unknown>>();
  #phase: "startup" | "action" = "startup"; #bodyReleaseEntered = false;
  #modification: Promise<GeneratedSchematicRelevanceDisplayStageResult> | null = null; #exiting = false;
  #continuation: Promise<void> | null = null; #callback: CurrentSchematicRelevanceActionCallbackObserver | null = null;
  #modified: GeneratedSchematicRelevanceDisplayStageResult | null = null; #after: Promise<GeneratedSchematicRelevanceDisplayStageResult> | null = null;
  #effect: GeneratedSchematicRelevanceDisplayNativeEffect | null = null; #clock: CurrentSchematicRelevanceDisplayClockObserver | null = null;
  #clockCollection: Promise<void> | null = null; #saveMainCollection: Promise<void> | null = null; #saveCollection: Promise<void> | null = null;
  #saveMain: CurrentSchematicRelevanceDisplaySaveMainOrigin | null = null; #mainRequest: CurrentSchematicRelevanceDisplayMainRequestObserver | null = null;
  #mainBegin: CurrentSchematicRelevanceDisplayMainBeginObserver | null = null; #mainHistory: CurrentSchematicRelevanceDisplayMainHistoryObserver | null = null;
  #mainStructure: CurrentSchematicRelevanceDisplayMainStructureObserver | null = null; #mainLive: CurrentSchematicRelevanceDisplayMainLiveHistoryObserver | null = null;
  #localService: Promise<void> | null = null; #drain: Promise<void> | null = null; #drained: CurrentSchematicRelevanceDisplaySaveDrained | null = null;
  #failed = false; #failure: unknown; #armed = false; #accessorAttempted = false; #preparationAttempted = false;
  #save: CurrentSchematicRelevanceDisplaySaveObserver | null = null; #structure: CurrentProjectSaveStructureObserver | null = null;
  #transport: CurrentProjectStructureTransportObserver | null = null; #producer: CurrentProjectSaveProducerObserver | null = null;
  #accessor: CurrentSchematicRelevanceDisplayAccessorObserver | null = null; #accessorPacket: CurrentSchematicRelevanceDisplayAccessorObservation | null = null;
  #structurePacket: Promise<StructurePacketOutcome> | null = null;
  #startupStructureDrain: CurrentSchematicRelevanceStartupStructureDrained | null = null;
  #construction: Promise<Outcome> | null = null; #collector: Promise<Outcome> | null = null; #pendingProducer: Promise<unknown> | null = null;
  #polling: CurrentProjectSyncQuiesceObserver | null = null; #pollingCompletion: CurrentProjectSyncQuiesceCompletion | null = null; #pollingCollection: Promise<Outcome> | null = null;
  #library: CurrentProjectLibraryRefreshObserver | null = null; #libraryCompletion: CurrentProjectLibraryRefreshCompletion | null = null; #libraryCollection: Promise<Outcome> | null = null;
  #controlsRetirement: Promise<void> | null = null;
  #modifyEntryOrigin: CurrentSchematicRelevanceDisplayModifyEntryOrigin | null = null;
  #runPrefixCollection: Promise<CurrentSchematicRelevanceRunPrefixObservation> | null = null;
  #runPrefixObserver: CurrentSchematicRelevanceRunPrefixObserver | null = null; #runPrefixPacket: CurrentSchematicRelevanceRunPrefixObservation | null = null;
  #modifyEntryAttempted = false; #modifyEntryCollection: Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> | null = null;
  #modifyEntryObserver: CurrentSchematicRelevanceDisplayModifyEntryObserver | null = null; #modifyEntryPacket: CurrentSchematicRelevanceDisplayModifyEntryObservation | null = null;
  #modifyRawPacket: CurrentSchematicRelevanceDisplayRawSceneObservation | null = null;
  #guard: CurrentSchematicRelevanceDisplayActionGuardObservation | null = null;
  #action: CurrentSchematicRelevanceDisplayActionObserver | null = null; #actionPacket: CurrentSchematicRelevanceDisplayActionObservation | null = null;
  #main: CurrentSchematicRelevanceDisplayPreModifyMainOrigin | null = null; #dispatch: GeneratedSchematicRelevanceDisplayDispatch | null = null;
  public constructor(owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); const prepared = originalCurrentSchematicRelevanceDisplayWriteTarget(owner);
    requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, prepared); need(!consumed.has(owner), "ORIGINAL_OWNER_CONSUMED"); consumed.add(owner);
    this.#owner = owner; this.#arguments = argumentsValue; this.#prepared = prepared; originalGroups.set(this, Object.freeze({ owner, argumentsValue, assertCurrent: (): void => { this.#current(); } })); Object.freeze(this);
  }
  #current(): void {
    if (this.#failed) { throw this.#failure; } need(!this.#exiting, "ORIGINAL_EXIT_CLEANUP_ONLY"); assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(this.#owner);
    need(originalCurrentSchematicRelevanceDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_OWNER_CHANGED"); requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(this.#arguments, this.#prepared);
  }
  #stop(error: unknown): void { if (!this.#failed) { this.#failed = true; this.#failure = error; } this.#failureSignal.resolve(Object.freeze({ error: this.#failure })); this.#startup.resolve(Object.freeze({ ok: false, error: this.#failure })); this.#afterModification.resolve(Object.freeze({ ok: false, error: this.#failure })); }
  async #retain(original: Promise<void>): Promise<Outcome> {
    try { await original; return Object.freeze({ ok: true }); } catch (error) { this.#stop(error); return Object.freeze({ ok: false, error }); }
  }
  #retainCall<T>(original: Promise<T>): Promise<T> {
    this.#retained.add(original);
    // Retain the failure handler too; callers and original-exit cleanup join
    // The same source-started request, including failures before their join.
    this.#retained.add((async (): Promise<void> => { try { await original; } catch (error) { this.#stop(error); } })()); return original;
  }
  /** Install trusted callbacks before the one original project navigation.
   * Each callback receives only its own actual fresh source-held origin. */
  public armBeforeNavigation(intents: Readonly<{ polling: GeneratedSchematicRelevanceDisplayPollingIntent; library: GeneratedSchematicRelevanceDisplayLibraryIntent }>): void {
    this.#current(); need(!this.#armed, "ARM_CONSUMED"); this.#armed = true;
    try {
      this.#owner.armSchematicDisplaySaveWorker(this.#arguments, async origin => {
        this.#current(); need(this.#save === null, "ORIGINAL_SAVE"); const observer = new CurrentSchematicRelevanceDisplaySaveObserver(origin, this.#owner, this.#arguments);
        this.#save = observer; await observer.arm(); this.#current();
      });
      this.#owner.armSchematicDisplaySaveStructureWorker(this.#arguments, async origin => {
        this.#current(); need(this.#structure === null && this.#construction === null, "ORIGINAL_STRUCTURE"); const observer = new CurrentProjectSaveStructureObserver(origin, this.#owner, this.#arguments);
        this.#structure = observer; await observer.arm(); this.#current();
        const construction = this.#retain(observer.observeConstruction()); this.#construction = construction;
        // This one reader must service original parsing callbacks while the
        // Opening is still pending. Save later joins the same packet Promise.
        this.#structurePacket = this.#retainStructurePacket(observer, construction);
      });
      this.#owner.armSchematicDisplayStructureTransportWorker(this.#arguments, async origin => {
        this.#current(); need(this.#transport === null, "ORIGINAL_TRANSPORT"); const observer = new CurrentProjectStructureTransportObserver(origin, this.#owner, this.#arguments);
        this.#transport = observer; await observer.arm(); this.#current();
      });
      this.#owner.armSchematicDisplayProducerPrefixWorker(this.#arguments);
      this.#owner.armSchematicDisplayProducerObservationWorker(this.#arguments, async origin => {
        this.#current(); need(this.#producer === null && this.#collector === null, "ORIGINAL_PRODUCER"); const observer = new CurrentProjectSaveProducerObserver(origin, this.#owner, this.#arguments);
        this.#producer = observer; await observer.arm(); this.#current(); this.#collector = this.#retain(this.#collectStartup(observer));
      });
      this.#owner.armSchematicRelevanceDisplayPollingQuiescence(this.#arguments, intents.polling, async origin => {
        this.#current(); need(this.#polling === null && this.#pollingCollection === null, "ORIGINAL_POLLING");
        const observer = new CurrentProjectSyncQuiesceObserver(origin, this.#owner, this.#arguments); this.#polling = observer;
        await observer.arm(); this.#current(); this.#pollingCollection = this.#retain((async (): Promise<void> => {
          const completion = await observer.observeFirstTimer(); this.#current(); await observer.requireOriginal(completion); this.#current(); this.#pollingCompletion = completion;
        })());
      });
      this.#owner.armSchematicRelevanceDisplayLibraryRefresh(this.#arguments, intents.library, async origin => {
        this.#current(); need(this.#library === null && this.#libraryCollection === null, "ORIGINAL_LIBRARY");
        const observer = new CurrentProjectLibraryRefreshObserver(origin, this.#owner, this.#arguments); this.#library = observer;
        const pristine = await observer.preparePristine(); this.#current(); await observer.arm(pristine); this.#current();
        this.#libraryCollection = this.#retain((async (): Promise<void> => {
          const suspension = await observer.observeFirstLoop(); this.#current(); const completion = await observer.observeMountReturn(suspension); this.#current();
          await observer.requireOriginal(completion); this.#current(); this.#libraryCompletion = completion;
        })());
      });
    } catch (error) { this.#stop(error); throw error; }
  }
  async #retainStructurePacket(observer: CurrentProjectSaveStructureObserver, construction: Promise<Outcome>): Promise<StructurePacketOutcome> {
    try { result(await construction); this.#current(); const packet = await observer.observePacket(); this.#current(); return Object.freeze({ ok: true, packet }); }
    catch (error) { this.#stop(error); return Object.freeze({ ok: false, error }); }
  }
  /** Joins the reader started during original construction. A Save body never
   * starts a second event read or replays the already serviced startup calls. */
  public async waitForOriginalSaveStructurePacket(): Promise<CurrentProjectSaveStructurePacket> {
    this.#current(); const original = this.#structurePacket; need(original !== null, "ORIGINAL_STRUCTURE_READER_REQUIRED");
    const outcome = await original; this.#current(); if (!outcome.ok) { throw outcome.error; } return outcome.packet;
  }
  async #settleStartup(observer: CurrentProjectSaveProducerObserver): Promise<void> {
    let progress = observer.startupProgress();
    if (progress.initialSync?.canSettle === true) { await observer.settleInitialSyncCall(); this.#current(); progress = observer.startupProgress(); }
    if (progress.initialSync?.completed === true && progress.initialCache?.canSettle === true) { await observer.settleInitialCacheCalls(); this.#current(); progress = observer.startupProgress(); }
    if (progress.periodicSync?.canSettle === true) { need(this.#phase === "startup", "PRE_SAVE_PERIODIC_SCOPE_UNAVAILABLE"); await observer.settlePeriodicSyncCall(); this.#current(); }
  }
  async #collectStartup(observer: CurrentProjectSaveProducerObserver): Promise<void> {
    const construction = this.#construction; need(construction !== null, "ORIGINAL_CONSTRUCTION_REQUIRED"); result(await construction); this.#current();
    for (let count = 0; count < CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.events; count += 1) {
      await this.#settleStartup(observer); this.#current(); const progress = observer.startupProgress();
      if (progress.initialCache?.completed === true && progress.initialSync?.completed === true && progress.periodicSync?.active !== true) { this.#startup.resolve(Object.freeze({ ok: true })); }
      need(this.#pendingProducer === null, "ORIGINAL_PRODUCER_READ_PENDING"); const pending = observer.observeHeldCall(); this.#pendingProducer = pending;
      const packet = await pending; need(this.#pendingProducer === pending, "ORIGINAL_PRODUCER_READ_CHANGED"); this.#pendingProducer = null;
      this.#current(); await this.#settleStartup(observer); this.#current(); const actual = requireOriginalCurrentProjectSaveProducerHeldCall(packet, observer);
      if (this.#phase === "action") {
        // Own7's periodic cursor is explicitly startup-only. Quiescence must
        // Keep it inactive; Via's separate pre-Save scope cannot be borrowed.
        need(actual.role === "localIngress" && this.#bodyReleaseEntered, "UNPLANNED_PRODUCER_BEFORE_ORIGINAL_BODY_RELEASE");
        this.#afterModification.resolve(Object.freeze({ ok: true, packet })); return;
      }
      if (actual.role === "headEntry" || actual.role === "headPromise" || actual.role === "headSuccess") { await observer.continueInitialCacheCall(packet); }
      else if (observer.startupProgress().initialSync?.completed === true) { await observer.continuePeriodicSyncCall(packet); }
      else { await observer.continueInitialSyncCall(packet); }
      this.#current();
    }
    throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_SETUP_STARTUP_EVENT_BOUND");
  }
  public async waitForStartupObservations(): Promise<void> {
    result(await this.#startup.promise); this.#current();
    const library = this.#libraryCollection, polling = this.#pollingCollection; need(polling !== null && library !== null, "ORIGINAL_STARTUP_CONTROLS_REQUIRED");
    const settled = await Promise.all([polling, library]); this.#current(); for (const outcome of settled) { result(outcome); }
    need(this.#polling !== null && this.#pollingCompletion !== null && this.#library !== null && this.#libraryCompletion !== null, "ORIGINAL_STARTUP_COMPLETIONS_REQUIRED");
    await this.#polling.requireOriginal(this.#pollingCompletion); this.#current(); await this.#library.requireOriginal(this.#libraryCompletion); this.#current();
    this.#owner.requireSchematicRelevanceDisplayStartupQuiesced(this.#arguments);
  }
  /** Capture/preflight are separately journaled by the enclosing workflow.
   * This observes the actual original holder's full setter/decorator graph. */
  public async observeAccessors(): Promise<CurrentSchematicRelevanceDisplayAccessorObservation> {
    this.#current(); need(!this.#accessorAttempted && this.#armed, "ACCESSOR_CONSUMED"); this.#accessorAttempted = true;
    try {
      await this.waitForStartupObservations(); this.#current();
      await this.#owner.createSchematicRelevanceDisplayAccessorOrigin(this.#arguments, async origin => {
        this.#current(); need(this.#accessor === null, "ORIGINAL_ACCESSOR"); const observer = new CurrentSchematicRelevanceDisplayAccessorObserver(origin, this.#owner, this.#arguments);
        this.#accessor = observer; const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#accessorPacket = packet; return packet;
      }); this.#current(); need(this.#accessorPacket !== null, "ORIGINAL_ACCESSOR_REQUIRED"); return this.#accessorPacket;
    } catch (error) { this.#stop(error); throw error; }
  }
  /** Join the native continuous prefix, complete accessor packet, original
   * selected-file Main fence and this journal's unspent modify intent. Active
   * action history, source body, Main SQL and Save remain separate obligations. */
  public async prepareModification(dispatch: GeneratedSchematicRelevanceDisplayDispatch): Promise<CurrentSchematicRelevanceDisplayPreModifyMainOrigin> {
    this.#current(); need(!this.#preparationAttempted && this.#accessor !== null && this.#accessorPacket !== null, "MODIFICATION_PREPARATION_CONSUMED"); this.#preparationAttempted = true; this.#dispatch = dispatch;
    try {
      this.#accessor.requireData(this.#accessorPacket, this.#owner, this.#arguments); await this.waitForStartupObservations(); this.#current();
      need(this.#structure !== null && this.#startupStructureDrain === null, "ORIGINAL_STARTUP_STRUCTURE_REQUIRED");
      this.#startupStructureDrain = await this.#structure.observeOriginalSchematicRelevanceStartupDrain(); this.#current();
      await this.#owner.enrollSchematicRelevanceDisplayProducerPrefix(this.#arguments); this.#current();
      const origin = await this.#owner.prepareSchematicRelevanceDisplayPreModifyMain(this.#arguments, dispatch); this.#current(); this.#main = origin;
      await requireOriginalCurrentSchematicRelevanceDisplayPreModifyMainOrigin(origin, this.#owner, this.#arguments).assertCurrent(); this.#current();
      const actionOrigin = await this.#owner.createSchematicRelevanceDisplayActionOrigin(this.#arguments, origin, async actualActionOrigin => {
        this.#current(); need(this.#action === null, "ORIGINAL_ACTION"); const observer = new CurrentSchematicRelevanceDisplayActionObserver(actualActionOrigin, this.#owner, this.#arguments);
        this.#action = observer; const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#actionPacket = packet;
      }); this.#current(); need(this.#actionPacket !== null, "ORIGINAL_ACTION_PREFLIGHT_REQUIRED"); this.#guard = await this.#owner.armSchematicRelevanceDisplayActionGuard(this.#arguments, actionOrigin); this.#current(); requireOriginalCurrentSchematicRelevanceDisplayActionGuard(this.#guard, this.#owner, this.#arguments); return origin;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async requirePrepared(dispatch: GeneratedSchematicRelevanceDisplayDispatch): Promise<void> {
    this.#current(); need(this.#dispatch === dispatch && this.#main !== null && this.#accessor !== null && this.#accessorPacket !== null && this.#action !== null && this.#actionPacket !== null && this.#guard !== null, "ORIGINAL_PREPARATION_REQUIRED");
    this.#accessor.requireData(this.#accessorPacket, this.#owner, this.#arguments); this.#action.requireData(this.#actionPacket, this.#owner, this.#arguments); requireOriginalCurrentSchematicRelevanceDisplayActionGuard(this.#guard, this.#owner, this.#arguments); await requireOriginalCurrentSchematicRelevanceDisplayPreModifyMainOrigin(this.#main, this.#owner, this.#arguments).assertCurrent(); this.#current();
  }
  /** One original generation stops at runner entry. Its later continuation
   * joins the retained entry/prefix and source-owned callback setup. */
  public generateModificationEntry(dispatch: GeneratedSchematicRelevanceDisplayDispatch): Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> {
    this.#current(); need(!this.#modifyEntryAttempted, "MODIFY_GENERATION_CONSUMED"); this.#modifyEntryAttempted = true;
    this.#modifyEntryCollection = (async (): Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> => {
      try {
        await this.requirePrepared(dispatch); this.#current(); const guard = this.#guard, main = this.#main, startup = this.#startupStructureDrain; need(main !== null && guard !== null && startup !== null, "ORIGINAL_MODIFY_PREPARATION");
        const origin = await this.#owner.generateSchematicRelevanceDisplayModifyEntry(this.#arguments, main, dispatch, guard, startup); this.#current(); this.#modifyEntryOrigin = origin;
        const observer = new CurrentSchematicRelevanceDisplayModifyEntryObserver(origin, this.#owner, this.#arguments); this.#modifyEntryObserver = observer;
        const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#modifyEntryPacket = packet;
        const raw = await observer.observeRawScene(); this.#current(); observer.requireRawData(raw, this.#owner, this.#arguments); this.#modifyRawPacket = raw; return packet;
      } catch (error) { this.#stop(error); throw error; }
    })(); return this.#modifyEntryCollection;
  }
  public observeOriginalRunPrefix(): Promise<CurrentSchematicRelevanceRunPrefixObservation> {
    this.#current(); need(this.#modifyEntryCollection !== null && this.#runPrefixCollection === null, "ORIGINAL_RUN_PREFIX_CONSUMED");
    this.#runPrefixCollection = (async (): Promise<CurrentSchematicRelevanceRunPrefixObservation> => {
      try {
        const entryCollection = this.#modifyEntryCollection; need(entryCollection !== null, "ORIGINAL_RUN_ENTRY_COLLECTION"); await entryCollection; this.#current();
        this.requireOriginalModificationEntry(); this.requireOriginalModificationRawScene();
        const entry = this.#modifyEntryOrigin; need(entry !== null, "ORIGINAL_RUN_ENTRY_ORIGIN");
        const origin = await this.#owner.createSchematicRelevanceDisplayRunPrefix(this.#arguments, entry); this.#current();
        const observer = new CurrentSchematicRelevanceRunPrefixObserver(origin, this.#owner, this.#arguments); this.#runPrefixObserver = observer;
        const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#runPrefixPacket = packet; return packet;
      } catch (error) { this.#stop(error); throw error; }
    })(); return this.#runPrefixCollection;
  }
  public requireOriginalRunPrefix(): CurrentSchematicRelevanceRunPrefixObservation {
    this.#current(); need(this.#runPrefixObserver !== null && this.#runPrefixPacket !== null, "ORIGINAL_RUN_PREFIX_REQUIRED"); this.#runPrefixObserver.requireData(this.#runPrefixPacket, this.#owner, this.#arguments); return this.#runPrefixPacket;
  }
  public requireOriginalModificationEntry(): CurrentSchematicRelevanceDisplayModifyEntryObservation {
    this.#current(); need(this.#modifyEntryObserver !== null && this.#modifyEntryPacket !== null, "ORIGINAL_MODIFY_ENTRY_REQUIRED"); this.#modifyEntryObserver.requireData(this.#modifyEntryPacket, this.#owner, this.#arguments); return this.#modifyEntryPacket;
  }
  public requireOriginalModificationRawScene(): CurrentSchematicRelevanceDisplayRawSceneObservation {
    this.#current(); need(this.#modifyEntryObserver !== null && this.#modifyRawPacket !== null, "ORIGINAL_RAW_SCENE_REQUIRED"); this.#modifyEntryObserver.requireRawData(this.#modifyRawPacket, this.#owner, this.#arguments); return this.#modifyRawPacket;
  }
  /** Start the original run once. Core retains and joins its independent
   * prefix-end pump; the callback never substitutes that proof. */
  public continueOriginalRun(): Promise<void> {
    this.#current(); need(this.#continuation === null && this.#modifyEntryOrigin !== null && this.#runPrefixPacket !== null && this.#structure !== null, "ORIGINAL_RUN_CONTINUATION_REQUIRED");
    this.requireOriginalModificationEntry(); this.requireOriginalModificationRawScene(); this.requireOriginalRunPrefix();
    const entry = this.#modifyEntryOrigin; this.#phase = "action";
    const original = this.#owner.continueSchematicRelevanceDisplayOriginalRun(this.#arguments, entry, origin => {
      this.#current(); need(this.#callback === null, "ORIGINAL_CALLBACK_CONSUMED");
      const observer = new CurrentSchematicRelevanceActionCallbackObserver(origin, this.#owner, this.#arguments); this.#callback = observer;
      return this.#retainCall(this.#continueCallback(observer));
    });
    // A producer failure must wake the outward wait even when the original
    // Callback is still held. Retain that exact Core/setup work for exit.
    const retained = this.#retainCall(original);
    const failed = (async (): Promise<never> => { const failure = await this.#failureSignal.promise; throw failure.error; })();
    this.#continuation = this.#retainCall(Promise.race([retained, failed])); return this.#continuation;
  }
  async #continueCallback(observer: CurrentSchematicRelevanceActionCallbackObserver): Promise<void> {
    await observer.observeEntry(); this.#current();
    await observer.continueToFirstSetter(); this.#current();
    await observer.observeFirstSetter(); this.#current();
    await observer.observeUnderlineForwarding(); this.#current();
    await observer.continueToSetAttribute(); this.#current();
    await observer.observeSetAttribute(); this.#current();
    await observer.observeActiveHistory(); this.#current();
    await observer.observeUiPublicationPristine(); this.#current();
    await observer.observeNormalCompletionGraph(); this.#current();
    await observer.prepareOriginalPrimitive(); this.#current();
    await observer.continueOriginalPrimitiveToRecord(); this.#current();
    await observer.observeOriginalPrimitiveRecord(); this.#current();
    await observer.prepareOriginalRecord(); this.#current();
    await observer.continueOriginalRecordToAst(); this.#current();
    await observer.observeOriginalAstHeld(); this.#current();
    await observer.continueOriginalMonitorsToHistory(); this.#current();
    await observer.continueOriginalHistoryToFinish(); this.#current();
    await observer.continueOriginalNormalHistoryToCanRecord(); this.#current();
    await observer.prepareOriginalListenerDisposal(); this.#current();
    await observer.continueOriginalNormalRecordToUpload(); this.#current();
    await observer.prepareOriginalNoEcho(); this.#current();
    await observer.continueOriginalDidRecordToUploader(); this.#current();
    await observer.continueOriginalUploaderToText(); this.#current();
    await observer.continueOriginalTextToConsistency(); this.#current();
    await observer.continueOriginalConsistencyToPendingCache(); this.#current();
    await observer.continueOriginalPendingCacheBody(); this.#current();
    await observer.continueOriginalUploaderToStatus(); this.#current();
    await observer.continueOriginalStatusToFirstCallback(); this.#current();
    await observer.continueOriginalStatusToLocalPublish(); this.#current();
    await observer.continueOriginalLocalPublishToTask(); this.#current();
    await observer.continueOriginalTaskToCloneDependencies(); this.#current();
    await observer.continueOriginalCloneToUiFunction(); this.#current();
    await observer.continueOriginalUiLookupToStore(); this.#current();
    await observer.continueOriginalStoreToRender(); this.#current();
    await observer.continueOriginalRenderDelegate(); this.#current();
    await observer.continueOriginalFileSaveUi(); this.#current();
    await observer.continueOriginalStatusCommands(); this.#current();
    await observer.continueOriginalQueuedNotifications(); this.#current();
    await observer.continueOriginalPublicationTimer(); this.#current();
    await observer.prepareOriginalPublicationNative(); this.#current();
    await observer.continueOriginalPublisherToPost(); this.#current();
    await observer.prepareOriginalModifyWorker(); this.#current();
    const structure = this.#structure; need(structure !== null, "ORIGINAL_MODIFY_STRUCTURE_READER");
    await observer.createOriginalModifyStructureOrigin(structure); this.#current();
    await observer.continueOriginalNativePostToWorkerBatch(); this.#current();
    await observer.continueOriginalWorkerToCm(); this.#current();
    await observer.continueOriginalWorkerToCanvasTicket(); this.#current();
    await observer.continueOriginalWorkerToCanvasTimer(); this.#current();
    await observer.continueOriginalPublisherToLoopback(); this.#current();
    await observer.continueOriginalCanvasEcho(); this.#current();
    const modified = await observer.completeOriginalSdkModification(); this.#current();
    requireOriginalSchematicRelevanceDisplayStage(this.#owner, this.#arguments, modified, "modify"); this.#modified = modified;
  }
  /** Completion requires the SAME original run/setup and independent prefix
   * guards before reading Core's historical native modification receipt. */
  public waitOriginalModification(): Promise<GeneratedSchematicRelevanceDisplayStageResult> {
    this.#current(); const continuation = this.#continuation; need(continuation !== null, "ORIGINAL_RUN_CONTINUATION_REQUIRED");
    this.#modification ??= this.#retainCall((async (): Promise<GeneratedSchematicRelevanceDisplayStageResult> => {
      await continuation; this.#current(); const packet = this.#owner.requireSchematicRelevanceDisplayOriginalModification(this.#arguments);
      need(this.#modified === packet, "ORIGINAL_MODIFICATION_CHANGED"); return packet;
    })()); return this.#modification;
  }
  public observeAfterModification(): Promise<GeneratedSchematicRelevanceDisplayStageResult> {
    this.#current(); need(this.#after === null && this.#modified !== null, "ORIGINAL_AFTER_CONSUMED");
    const original = (async (): Promise<GeneratedSchematicRelevanceDisplayStageResult> => {
      await this.waitOriginalModification(); this.#current();
      const raw = await this.#owner.executeSchematicDisplayStage("observe", this.#arguments); this.#current();
      requireStageShape(raw);
      need("stage" in raw && raw.stage === "observe" && raw.schema === "easyeda-pro-control.generated-schematic-relevance-display-stage.v1", "ORIGINAL_AFTER_STAGE");
      return requireOriginalSchematicRelevanceDisplayStage(this.#owner, this.#arguments, raw, "observe");
    })(); this.#after = this.#retainCall(original); return original;
  }
  public armSaveClock(effect: GeneratedSchematicRelevanceDisplayNativeEffect): Promise<void> {
    this.#current(); need(this.#clockCollection === null && this.#after !== null, "ORIGINAL_CLOCK_CONSUMED");
    requireOriginalGeneratedSchematicRelevanceDisplayEffect(effect, this.#owner, this.#arguments); this.#effect = effect;
    const original = (async (): Promise<void> => { await this.#owner.createSchematicRelevanceDisplayClockOrigin(this.#arguments, effect, async origin => {
      this.#current(); need(this.#clock === null, "ORIGINAL_CLOCK_REQUIRED");
      const observer = new CurrentSchematicRelevanceDisplayClockObserver(origin, this.#owner, this.#arguments); this.#clock = observer;
      await observer.arm(); this.#current();
    }); this.#current(); need(this.#clock !== null, "ORIGINAL_CLOCK_REQUIRED"); })();
    this.#clockCollection = this.#retainCall(original); return original;
  }
  public prepareSaveMain(effect: GeneratedSchematicRelevanceDisplayNativeEffect): Promise<void> {
    this.#current(); need(this.#saveMainCollection === null && this.#effect === effect && this.#clock !== null && this.#clockCollection !== null, "ORIGINAL_SAVE_MAIN_CONSUMED");
    requireOriginalGeneratedSchematicRelevanceDisplayEffect(effect, this.#owner, this.#arguments);
    const clock = this.#clockCollection;
    const original = (async (): Promise<void> => {
      await clock; this.#current();
      const origin = await this.#owner.prepareSchematicRelevanceDisplaySaveMain(this.#arguments, effect, async actual => {
        this.#current(); need(this.#saveMain === null && this.#mainRequest === null, "ORIGINAL_SAVE_MAIN_REQUIRED"); this.#saveMain = actual;
        const request = new CurrentSchematicRelevanceDisplayMainRequestObserver(actual, this.#owner, this.#arguments); this.#mainRequest = request; await request.arm(); this.#current();
        const begin = new CurrentSchematicRelevanceDisplayMainBeginObserver(actual, this.#owner, this.#arguments); this.#mainBegin = begin; await begin.arm(); this.#current();
        const history = new CurrentSchematicRelevanceDisplayMainHistoryObserver(actual, this.#owner, this.#arguments); this.#mainHistory = history; await history.arm(); this.#current();
        const structure = new CurrentSchematicRelevanceDisplayMainStructureObserver(actual, this.#owner, this.#arguments); this.#mainStructure = structure; await structure.arm(); this.#current();
      }); this.#current(); need(origin === this.#saveMain && this.#owner.requireSchematicRelevanceDisplaySaveMainReady(this.#arguments, effect) === origin, "ORIGINAL_SAVE_MAIN_CHANGED");
    })(); this.#saveMainCollection = this.#retainCall(original); return original;
  }
  /** Clock and body start before SDK Save generation. Only this exact joined
   * data can reserve and release the original worker body and Main effects. */
  public observeOriginalSave(): Promise<void> {
    this.#current(); need(this.#saveCollection === null && this.#clock !== null && this.#save !== null && this.#effect !== null && this.#saveMain !== null &&
      this.#mainRequest !== null && this.#mainBegin !== null && this.#mainHistory !== null && this.#mainStructure !== null && this.#structure !== null && this.#transport !== null, "ORIGINAL_SAVE_OBSERVERS_REQUIRED");
    const beginObserver = this.#mainBegin, clock = this.#clock, effect = this.#effect, history = this.#mainHistory, main = this.#saveMain, mainStructure = this.#mainStructure,
      request = this.#mainRequest, save = this.#save, structure = this.#structure, transport = this.#transport;
    const original = (async (): Promise<void> => {
      const bodies = await Promise.allSettled([this.#retainCall(clock.collect()), this.#retainCall(save.observeBody())]); this.#current();
      const [clockResult, bodyResult] = bodies;
      if (clockResult.status === "rejected" || bodyResult.status === "rejected") {
        const errors: unknown[] = []; if (clockResult.status === "rejected") { errors.push(clockResult.reason); } if (bodyResult.status === "rejected") { errors.push(bodyResult.reason); }
        throw new AggregateError(errors, "Original schematic clock/body collection failed.");
      }
      const joined = await clock.joinBody(clockResult.value, bodyResult.value); this.#current();
      const data = await qualifyOriginalGeneratedSchematicRelevanceDisplaySaveData(this.#owner, this.#arguments, effect, bodyResult.value, clockResult.value, joined); this.#current();
      await request.bindOriginalBody(data); this.#current(); const reservation = await this.#owner.reserveSchematicRelevanceDisplayStructurePublication(this.#arguments, main); this.#current();
      this.#bodyReleaseEntered = true; await save.releaseBody(bodyResult.value); this.#current(); await save.observeCompletion(); this.#current();
      const packet = await this.waitForOriginalSaveStructurePacket(); this.#current(); await structure.releasePrehistoryPacket(packet, reservation); this.#current();
      const sent = await transport.observeSend(); this.#current(); await transport.releaseSend(sent, reservation); this.#current();
      await transport.observeReturned(sent); this.#current(); await mainStructure.observe(); this.#current();
      const publication = this.#owner.completeSchematicRelevanceDisplayStructurePublication(this.#arguments); this.#current();
      await transport.releaseReturned(sent, publication); this.#current(); await structure.observePrehistoryCompletion(publication); this.#current();
      const driver = await request.captureDriver(data); this.#current(); const context = await request.continueToContext(driver); this.#current();
      const controller = await request.continueToController(context); this.#current(); const actor = await request.continueToActor(controller); this.#current();
      const begin = await beginObserver.begin(actor); this.#current(); await history.observe(begin); this.#current();
      this.#owner.completeSchematicRelevanceDisplayHistorySql(this.#arguments); this.#current(); need(this.#mainLive === null, "ORIGINAL_LIVE_HISTORY_CONSUMED");
      const live = new CurrentSchematicRelevanceDisplayMainLiveHistoryObserver(main, this.#owner, this.#arguments); this.#mainLive = live;
      await live.arm(); this.#current(); const rows = await live.observe(); this.#current();
      need(this.#owner.requireSchematicRelevanceDisplayLiveHistoryRows(this.#arguments) === rows, "ORIGINAL_LIVE_HISTORY_ROWS");
    })(); this.#saveCollection = this.#retainCall(original); return original;
  }
  async #nextProducer(observer: CurrentProjectSaveProducerObserver): Promise<CurrentProjectSaveProducerHeldCall> {
    this.#current(); need(this.#pendingProducer === null, "ORIGINAL_PRODUCER_READ_PENDING"); const pending = observer.observeHeldCall(); this.#pendingProducer = pending;
    const packet = await pending; need(this.#pendingProducer === pending, "ORIGINAL_PRODUCER_READ_CHANGED"); this.#pendingProducer = null;
    this.#current(); requireOriginalCurrentProjectSaveProducerHeldCall(packet, observer); return packet;
  }
  public serviceSaveLocalCalls(): Promise<void> {
    this.#current(); need(this.#localService === null && this.#saveCollection !== null && this.#phase === "action", "ORIGINAL_LOCAL_SERVICE_CONSUMED");
    const original = (async (): Promise<void> => {
      const first = await this.#afterModification.promise; this.#current(); if (!first.ok) { throw first.error; }
      const observer = this.#producer; need(observer !== null && this.#collector !== null, "ORIGINAL_PRODUCER_REQUIRED");
      // The startup collector ends at this exact packet, before any new read.
      result(await this.#collector); this.#current(); let packet = first.packet;
      for (const [index, role] of CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES.entries()) {
        if (index > 0) { packet = await this.#nextProducer(observer); }
        need(requireOriginalCurrentProjectSaveProducerHeldCall(packet, observer).role === role, "ORIGINAL_LOCAL_ROLE");
        await observer.continueSchematicRelevanceDisplaySaveLocalCall(packet); this.#current();
      }
      observer.requireSchematicRelevanceDisplaySaveLocalCompleted(); this.#current();
    })(); this.#localService = this.#retainCall(original); return original;
  }
  public drainOriginalSave(): Promise<void> {
    this.#current(); const local = this.#localService; need(this.#drain === null && local !== null, "ORIGINAL_DRAIN_CONSUMED");
    const original = (async (): Promise<void> => {
      await local; this.#current(); const observer = this.#producer; need(observer !== null, "ORIGINAL_PRODUCER_REQUIRED");
      const maximum = CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS.events + CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS.events + CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS.events;
      for (let index = 0; index < maximum; index += 1) {
        const packet = await this.#nextProducer(observer); await observer.continueSchematicRelevanceDisplaySaveDrainCall(packet); this.#current();
        let progress = observer.schematicRelevanceDisplaySaveDrainProgress();
        if (progress.allCallsResumed && progress.canSettle) { await observer.settleSchematicRelevanceDisplaySaveDrain(); this.#current(); progress = observer.schematicRelevanceDisplaySaveDrainProgress(); }
        if (progress.completed) { this.#drained = observer.requireOriginalSchematicRelevanceDisplaySaveDrained(); return; }
        need(!progress.allCallsResumed, "ORIGINAL_DRAIN_SETTLEMENT_UNRESOLVED");
      }
      throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_SETUP_ORIGINAL_DRAIN_CAPACITY");
    })(); this.#drain = this.#retainCall(original); return original;
  }
  public requireOriginalSaveDrained(): CurrentSchematicRelevanceDisplaySaveDrained {
    this.#current(); need(this.#drained !== null && this.#producer !== null, "ORIGINAL_DRAIN_REQUIRED");
    need(this.#producer.requireOriginalSchematicRelevanceDisplaySaveDrained() === this.#drained, "ORIGINAL_DRAIN_CHANGED"); return this.#drained;
  }
  /** Original Job exit wakes existing collectors; retain and join those exact
   * requests rather than starting another read or detaching live breakpoints. */
  public async settleOriginalCallsAfterExit(): Promise<void> {
    const current = (): void => { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(this.#owner); originalCurrentSchematicRelevanceDisplayWriteTermination(this.#owner); need(originalCurrentSchematicRelevanceDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_EXIT_OWNER"); };
    current(); this.#exiting = true; const pending: Promise<unknown>[] = [...this.#retained];
    if (this.#construction !== null) { pending.push(this.#construction); } if (this.#structurePacket !== null) { pending.push(this.#structurePacket); } if (this.#collector !== null) { pending.push(this.#collector); } if (this.#pendingProducer !== null) { pending.push(this.#pendingProducer); }
    if (this.#modifyEntryCollection !== null) { pending.push(this.#modifyEntryCollection, this.#owner.settleSchematicRelevanceDisplayModifyEntryAfterExit()); }
    if (this.#runPrefixCollection !== null) { pending.push(this.#runPrefixCollection); }
    if (this.#pollingCollection !== null) { pending.push(this.#pollingCollection); } if (this.#libraryCollection !== null) { pending.push(this.#libraryCollection); }
    await Promise.allSettled(pending); current();
    this.#controlsRetirement ??= (async (): Promise<void> => {
      const controls: Promise<void>[] = []; if (this.#save !== null) { controls.push(this.#save.retireAfterOriginalExit()); } if (this.#clock !== null) { controls.push(this.#clock.retireAfterOriginalExit()); } if (this.#transport !== null) { controls.push(this.#transport.retireAfterOriginalExit()); } if (this.#producer !== null) { controls.push(this.#producer.retireAfterOriginalExit()); } if (this.#polling !== null) { controls.push(this.#polling.retireAfterOriginalExit()); } if (this.#library !== null) { controls.push(this.#library.retireAfterOriginalExit()); }
      const settled = await Promise.allSettled(controls); current(); for (const item of settled) { if (item.status === "rejected") { throw item.reason; } }
    })(); await this.#controlsRetirement; current();
  }
  public cancel(): void { this.#stop(new Error("SCHEMATIC_RELEVANCE_DISPLAY_SETUP_CANCELLED")); }
  public status(): Readonly<{ armed: boolean; failed: boolean; pendingOriginalProducerRead: boolean; accessorObserved: boolean; preModifyMainRetained: boolean; modifyAuthorized: false; saveAuthorized: false; persistenceVerified: false }> {
    return Object.freeze({ armed: this.#armed, failed: this.#failed, pendingOriginalProducerRead: this.#pendingProducer !== null, accessorObserved: this.#accessorPacket !== null,
      preModifyMainRetained: this.#main !== null, modifyAuthorized: false, saveAuthorized: false, persistenceVerified: false });
  }
}

type GroupDescriptor = Readonly<{ value: unknown; get: unknown; set: unknown; writable: boolean | undefined; enumerable: boolean | undefined; configurable: boolean | undefined }>;
function groupDescriptor(object: object, key: PropertyKey): GroupDescriptor | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor === undefined) { return undefined; }
  const value: unknown = descriptor.value; const get: unknown = Object.getOwnPropertyDescriptor(descriptor, "get")?.value; const set: unknown = Object.getOwnPropertyDescriptor(descriptor, "set")?.value;
  return Object.freeze({ value, get, set, writable: descriptor.writable, enumerable: descriptor.enumerable, configurable: descriptor.configurable });
}
const originalGroupPrototype = CurrentSchematicRelevanceDisplayWriteObservers.prototype;
const originalGroupParent: unknown = Object.getPrototypeOf(originalGroupPrototype);
const originalGroupDescriptors = new Map(Reflect.ownKeys(originalGroupPrototype).map(key => [key, groupDescriptor(originalGroupPrototype, key)]));
/** Build/source prerequisite only. Missing real wrappers refuse before native
 * allocation; matching methods injected after initialization are insufficient. */
export function requireCurrentSchematicRelevanceDisplayWriteCompositionSource(): void {
  need(Object.getPrototypeOf(originalGroupPrototype) === originalGroupParent && Reflect.ownKeys(originalGroupPrototype).length === originalGroupDescriptors.size, "COMPOSITION_SOURCE_CHANGED");
  for (const [key, before] of originalGroupDescriptors) {
    const current = groupDescriptor(originalGroupPrototype, key);
    need(before !== undefined && current !== undefined && current.value === before.value && current.get === before.get && current.set === before.set && current.writable === before.writable && current.enumerable === before.enumerable && current.configurable === before.configurable, "COMPOSITION_SOURCE_CHANGED");
  }
  for (const key of COMPOSITION_METHODS) { need(typeof groupDescriptor(originalGroupPrototype, key)?.value === "function", "ORIGINAL_MODIFY_COMPLETION_UNAVAILABLE"); }
}
/** Only the actual constructor can populate this registry. No caller function
 * table, profile string, proxy, owner copy or cross-purpose group is accepted. */
export function requireOriginalCurrentSchematicRelevanceDisplayWriteComposition(group: CurrentSchematicRelevanceDisplayWriteObservers, owner: CurrentSchematicRelevanceDisplayWriteOwner,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): CurrentSchematicRelevanceDisplayWriteComposition {
  const original = originalGroups.get(group);
  need(original !== undefined && original.owner === owner && original.argumentsValue === argumentsValue, "ORIGINAL_COMPOSITION");
  const current = (): void => {
    need(originalGroups.get(group) === original && Object.getPrototypeOf(group) === originalGroupPrototype && Reflect.ownKeys(group).length === 0, "ORIGINAL_COMPOSITION");
    original.assertCurrent(); assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, originalCurrentSchematicRelevanceDisplayWriteTarget(owner));
    requireCurrentSchematicRelevanceDisplayWriteCompositionSource();
  }; current();
  const methods = Object.fromEntries(COMPOSITION_METHODS.map(key => {
    const value: unknown = Object.getOwnPropertyDescriptor(originalGroupPrototype, key)?.value; need(typeof value === "function", "ORIGINAL_COMPOSITION_METHOD");
    return [key, (...args: unknown[]): unknown => { current(); need(args.length === (key === "armSaveClock" || key === "prepareSaveMain" ? 1 : 0), "COMPOSITION_ARGUMENTS"); return Reflect.apply(value, group, args); }];
  }));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fixed closed roster is derived only from unchanged original source descriptors and a constructor-private owner/args registry. Original receipt qualifiers remain separate.
  return Object.freeze(methods) as unknown as CurrentSchematicRelevanceDisplayWriteComposition;
}
