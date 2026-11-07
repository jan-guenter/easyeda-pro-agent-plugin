import { CurrentSchematicRelevanceDisplayModifyEntryObserver } from "./current-schematic-relevance-display-modify-entry-observer.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryObservation, CurrentSchematicRelevanceDisplayRawSceneObservation } from "./current-schematic-relevance-display-modify-entry-observer.ts";
/** Maintained original SCH setup. The durable enclosing operation owns birth,
 * navigation and intent publication. This group never dispatches Modify/Save. */
/* oxlint-disable import/max-dependencies -- One original group joins separately branded worker, accessor, action and Main collectors without accepting caller implementation. */
import { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner, originalCurrentSchematicRelevanceDisplayWriteTarget, originalCurrentSchematicRelevanceDisplayWriteTermination,
  requireOriginalCurrentSchematicRelevanceDisplayActionGuard, requireOriginalCurrentSchematicRelevanceDisplayPreModifyMainOrigin } from "./current-schematic-relevance-display-write-owner.ts";
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
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "./current-project-save-producer-protocol.ts";
import { CurrentSchematicRelevanceDisplayAccessorObserver } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceDisplayAccessorObservation } from "./current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicRelevanceDisplayActionGuardObservation } from "./current-schematic-relevance-display-action-origin.ts";
import type { CurrentSchematicRelevanceDisplayPreModifyMainOrigin } from "./current-schematic-relevance-display-pre-modify-main-origin.ts";

type Outcome = Readonly<{ ok: true }> | Readonly<{ ok: false; error: unknown }>;
type StructurePacketOutcome = Readonly<{ ok: true; packet: CurrentProjectSaveStructurePacket }> | Readonly<{ ok: false; error: unknown }>;
const consumed = new WeakSet<CurrentSchematicRelevanceDisplayWriteOwner>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_RELEVANCE_DISPLAY_SETUP_${code}`); } }
function result(value: Outcome): void { if (!value.ok) { throw value.error; } }
export class CurrentSchematicRelevanceDisplayWriteObservers {
  readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #arguments: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #prepared: ReturnType<typeof originalCurrentSchematicRelevanceDisplayWriteTarget>;
  readonly #startup = Promise.withResolvers<Outcome>();
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
  #modifyEntryAttempted = false; #modifyEntryCollection: Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> | null = null;
  #modifyEntryObserver: CurrentSchematicRelevanceDisplayModifyEntryObserver | null = null; #modifyEntryPacket: CurrentSchematicRelevanceDisplayModifyEntryObservation | null = null;
  #modifyRawPacket: CurrentSchematicRelevanceDisplayRawSceneObservation | null = null;
  #guard: CurrentSchematicRelevanceDisplayActionGuardObservation | null = null;
  #action: CurrentSchematicRelevanceDisplayActionObserver | null = null; #actionPacket: CurrentSchematicRelevanceDisplayActionObservation | null = null;
  #main: CurrentSchematicRelevanceDisplayPreModifyMainOrigin | null = null; #dispatch: GeneratedSchematicRelevanceDisplayDispatch | null = null;
  public constructor(owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); const prepared = originalCurrentSchematicRelevanceDisplayWriteTarget(owner);
    requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, prepared); need(!consumed.has(owner), "ORIGINAL_OWNER_CONSUMED"); consumed.add(owner);
    this.#owner = owner; this.#arguments = argumentsValue; this.#prepared = prepared; Object.freeze(this);
  }
  #current(): void {
    if (this.#failed) { throw this.#failure; } assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(this.#owner);
    need(originalCurrentSchematicRelevanceDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_OWNER_CHANGED"); requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(this.#arguments, this.#prepared);
  }
  #stop(error: unknown): void { if (!this.#failed) { this.#failed = true; this.#failure = error; } this.#startup.resolve(Object.freeze({ ok: false, error: this.#failure })); }
  async #retain(original: Promise<void>): Promise<Outcome> {
    try { await original; return Object.freeze({ ok: true }); } catch (error) { this.#stop(error); return Object.freeze({ ok: false, error }); }
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
    if (progress.periodicSync?.canSettle === true) { await observer.settlePeriodicSyncCall(); this.#current(); }
  }
  async #collectStartup(observer: CurrentProjectSaveProducerObserver): Promise<void> {
    const construction = this.#construction; need(construction !== null, "ORIGINAL_CONSTRUCTION_REQUIRED"); result(await construction); this.#current();
    for (let count = 0; count < CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.events; count += 1) {
      await this.#settleStartup(observer); this.#current(); const progress = observer.startupProgress();
      if (progress.initialCache?.completed === true && progress.initialSync?.completed === true && progress.periodicSync?.active !== true) { this.#startup.resolve(Object.freeze({ ok: true })); }
      need(this.#pendingProducer === null, "ORIGINAL_PRODUCER_READ_PENDING"); const pending = observer.observeHeldCall(); this.#pendingProducer = pending;
      const packet = await pending; need(this.#pendingProducer === pending, "ORIGINAL_PRODUCER_READ_CHANGED"); this.#pendingProducer = null;
      this.#current(); await this.#settleStartup(observer); this.#current(); const actual = requireOriginalCurrentProjectSaveProducerHeldCall(packet, observer);
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
        this.#accessor = observer; const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#accessorPacket = packet;
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
  /** One original request generation stops at runner entry. No action-start
   * or setter continuation is available through this maintained group. */
  public generateModificationEntry(dispatch: GeneratedSchematicRelevanceDisplayDispatch): Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> {
    this.#current(); need(!this.#modifyEntryAttempted, "MODIFY_GENERATION_CONSUMED"); this.#modifyEntryAttempted = true;
    this.#modifyEntryCollection = (async (): Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> => {
      try {
        await this.requirePrepared(dispatch); this.#current(); const guard = this.#guard, main = this.#main, startup = this.#startupStructureDrain; need(main !== null && guard !== null && startup !== null, "ORIGINAL_MODIFY_PREPARATION");
        const origin = await this.#owner.generateSchematicRelevanceDisplayModifyEntry(this.#arguments, main, dispatch, guard, startup); this.#current();
        const observer = new CurrentSchematicRelevanceDisplayModifyEntryObserver(origin, this.#owner, this.#arguments); this.#modifyEntryObserver = observer;
        const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#modifyEntryPacket = packet;
        const raw = await observer.observeRawScene(); this.#current(); observer.requireRawData(raw, this.#owner, this.#arguments); this.#modifyRawPacket = raw; return packet;
      } catch (error) { this.#stop(error); throw error; }
    })(); return this.#modifyEntryCollection;
  }
  public requireOriginalModificationEntry(): CurrentSchematicRelevanceDisplayModifyEntryObservation {
    this.#current(); need(this.#modifyEntryObserver !== null && this.#modifyEntryPacket !== null, "ORIGINAL_MODIFY_ENTRY_REQUIRED"); this.#modifyEntryObserver.requireData(this.#modifyEntryPacket, this.#owner, this.#arguments); return this.#modifyEntryPacket;
  }
  public requireOriginalModificationRawScene(): CurrentSchematicRelevanceDisplayRawSceneObservation {
    this.#current(); need(this.#modifyEntryObserver !== null && this.#modifyRawPacket !== null, "ORIGINAL_RAW_SCENE_REQUIRED"); this.#modifyEntryObserver.requireRawData(this.#modifyRawPacket, this.#owner, this.#arguments); return this.#modifyRawPacket;
  }
  /** Original Job exit wakes existing collectors; retain and join those exact
   * requests rather than starting another read or detaching live breakpoints. */
  public async settleOriginalCallsAfterExit(): Promise<void> {
    const current = (): void => { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(this.#owner); originalCurrentSchematicRelevanceDisplayWriteTermination(this.#owner); need(originalCurrentSchematicRelevanceDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_EXIT_OWNER"); };
    current(); const pending: Promise<unknown>[] = [];
    if (this.#construction !== null) { pending.push(this.#construction); } if (this.#structurePacket !== null) { pending.push(this.#structurePacket); } if (this.#collector !== null) { pending.push(this.#collector); } if (this.#pendingProducer !== null) { pending.push(this.#pendingProducer); }
    if (this.#modifyEntryCollection !== null) { pending.push(this.#modifyEntryCollection, this.#owner.settleSchematicRelevanceDisplayModifyEntryAfterExit()); }
    if (this.#pollingCollection !== null) { pending.push(this.#pollingCollection); } if (this.#libraryCollection !== null) { pending.push(this.#libraryCollection); }
    await Promise.allSettled(pending); current();
    this.#controlsRetirement ??= (async (): Promise<void> => {
      const controls: Promise<void>[] = []; if (this.#polling !== null) { controls.push(this.#polling.retireAfterOriginalExit()); } if (this.#library !== null) { controls.push(this.#library.retireAfterOriginalExit()); }
      const settled = await Promise.allSettled(controls); current(); for (const item of settled) { if (item.status === "rejected") { throw item.reason; } }
    })(); await this.#controlsRetirement; current();
  }
  public cancel(): void { this.#stop(new Error("SCHEMATIC_RELEVANCE_DISPLAY_SETUP_CANCELLED")); }
  public status(): Readonly<{ armed: boolean; failed: boolean; pendingOriginalProducerRead: boolean; accessorObserved: boolean; preModifyMainRetained: boolean; modifyAuthorized: false; saveAuthorized: false; persistenceVerified: false }> {
    return Object.freeze({ armed: this.#armed, failed: this.#failed, pendingOriginalProducerRead: this.#pendingProducer !== null, accessorObserved: this.#accessorPacket !== null,
      preModifyMainRetained: this.#main !== null, modifyAuthorized: false, saveAuthorized: false, persistenceVerified: false });
  }
}
