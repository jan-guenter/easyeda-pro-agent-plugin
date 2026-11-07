/** Maintained original SCH setup. The durable enclosing operation owns birth,
 * navigation and intent publication. This group never dispatches Modify/Save. */
/* oxlint-disable import/max-dependencies -- One original group joins separately branded worker, accessor, action and Main collectors without accepting caller implementation. */
import { assertOriginalCurrentSchematicDisplayWriteOwner, originalCurrentSchematicDisplayWriteTarget, originalCurrentSchematicDisplayWriteTermination,
  requireOriginalCurrentSchematicDisplayActionGuard, requireOriginalCurrentSchematicDisplayPreModifyMainOrigin } from "./current-schematic-display-write-owner.ts";
import type { CurrentSchematicDisplayWriteOwner } from "./current-schematic-display-write-owner.ts";
import { requireOriginalGeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayDispatch } from "./generated-schematic-display-journal.ts";
import { CurrentSchematicDisplayActionObserver } from "./current-schematic-display-action-observer.ts";
import type { CurrentSchematicDisplayActionObservation } from "./current-schematic-display-action-observer.ts";
import { CurrentSchematicDisplaySaveObserver } from "./current-schematic-display-save-observer.ts";
import { CurrentProjectSaveStructureObserver } from "./current-project-save-structure-observer.ts";
import { CurrentProjectStructureTransportObserver } from "./current-project-structure-transport-observer.ts";
import { CurrentProjectSaveProducerObserver, requireOriginalCurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-observer.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "./current-project-save-producer-protocol.ts";
import { CurrentSchematicDisplayAccessorObserver } from "./current-schematic-display-accessor-observer.ts";
import type { CurrentSchematicDisplayAccessorObservation } from "./current-schematic-display-accessor-observer.ts";
import type { CurrentSchematicDisplayActionGuardObservation } from "./current-schematic-display-action-guard-protocol.ts";
import type { CurrentSchematicDisplayPreModifyMainOrigin } from "./current-schematic-display-pre-modify-main-origin.ts";

type Outcome = Readonly<{ ok: true }> | Readonly<{ ok: false; error: unknown }>;
const consumed = new WeakSet<CurrentSchematicDisplayWriteOwner>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_DISPLAY_SETUP_${code}`); } }
function result(value: Outcome): void { if (!value.ok) { throw value.error; } }
export class CurrentSchematicDisplayWriteObservers {
  readonly #owner: CurrentSchematicDisplayWriteOwner; readonly #arguments: GeneratedSchematicDisplayNativeArguments;
  readonly #prepared: ReturnType<typeof originalCurrentSchematicDisplayWriteTarget>;
  readonly #startup = Promise.withResolvers<Outcome>();
  #failed = false; #failure: unknown; #armed = false; #accessorAttempted = false; #preparationAttempted = false;
  #save: CurrentSchematicDisplaySaveObserver | null = null; #structure: CurrentProjectSaveStructureObserver | null = null;
  #transport: CurrentProjectStructureTransportObserver | null = null; #producer: CurrentProjectSaveProducerObserver | null = null;
  #accessor: CurrentSchematicDisplayAccessorObserver | null = null; #accessorPacket: CurrentSchematicDisplayAccessorObservation | null = null;
  #construction: Promise<Outcome> | null = null; #collector: Promise<Outcome> | null = null; #pendingProducer: Promise<unknown> | null = null;
  #guard: CurrentSchematicDisplayActionGuardObservation | null = null;
  #action: CurrentSchematicDisplayActionObserver | null = null; #actionPacket: CurrentSchematicDisplayActionObservation | null = null;
  #main: CurrentSchematicDisplayPreModifyMainOrigin | null = null; #dispatch: GeneratedSchematicDisplayDispatch | null = null;
  public constructor(owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments) {
    assertOriginalCurrentSchematicDisplayWriteOwner(owner); const prepared = originalCurrentSchematicDisplayWriteTarget(owner);
    requireOriginalGeneratedSchematicDisplayNativeArguments(argumentsValue, prepared); need(!consumed.has(owner), "ORIGINAL_OWNER_CONSUMED"); consumed.add(owner);
    this.#owner = owner; this.#arguments = argumentsValue; this.#prepared = prepared; Object.freeze(this);
  }
  #current(): void {
    if (this.#failed) { throw this.#failure; } assertOriginalCurrentSchematicDisplayWriteOwner(this.#owner);
    need(originalCurrentSchematicDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_OWNER_CHANGED"); requireOriginalGeneratedSchematicDisplayNativeArguments(this.#arguments, this.#prepared);
  }
  #stop(error: unknown): void { if (!this.#failed) { this.#failed = true; this.#failure = error; } this.#startup.resolve(Object.freeze({ ok: false, error: this.#failure })); }
  async #retain(original: Promise<void>): Promise<Outcome> {
    try { await original; return Object.freeze({ ok: true }); } catch (error) { this.#stop(error); return Object.freeze({ ok: false, error }); }
  }
  /** Install trusted callbacks before the one original project navigation.
   * Each callback receives only its own actual fresh source-held origin. */
  public armBeforeNavigation(): void {
    this.#current(); need(!this.#armed, "ARM_CONSUMED"); this.#armed = true;
    try {
      this.#owner.armSchematicDisplaySaveWorker(this.#arguments, async origin => {
        this.#current(); need(this.#save === null, "ORIGINAL_SAVE"); const observer = new CurrentSchematicDisplaySaveObserver(origin, this.#owner, this.#arguments);
        this.#save = observer; await observer.arm(); this.#current();
      });
      this.#owner.armSchematicDisplaySaveStructureWorker(this.#arguments, async origin => {
        this.#current(); need(this.#structure === null && this.#construction === null, "ORIGINAL_STRUCTURE"); const observer = new CurrentProjectSaveStructureObserver(origin, this.#owner, this.#arguments);
        this.#structure = observer; await observer.arm(); this.#current(); this.#construction = this.#retain(observer.observeConstruction());
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
    } catch (error) { this.#stop(error); throw error; }
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
    throw new Error("SCHEMATIC_DISPLAY_SETUP_STARTUP_EVENT_BOUND");
  }
  public async waitForStartupObservations(): Promise<void> { result(await this.#startup.promise); this.#current(); }
  /** Capture/preflight are separately journaled by the enclosing workflow.
   * This observes the actual original holder's full setter/decorator graph. */
  public async observeAccessors(): Promise<CurrentSchematicDisplayAccessorObservation> {
    this.#current(); need(!this.#accessorAttempted && this.#armed, "ACCESSOR_CONSUMED"); this.#accessorAttempted = true;
    try {
      await this.waitForStartupObservations(); this.#current();
      await this.#owner.createSchematicDisplayAccessorOrigin(this.#arguments, async origin => {
        this.#current(); need(this.#accessor === null, "ORIGINAL_ACCESSOR"); const observer = new CurrentSchematicDisplayAccessorObserver(origin, this.#owner, this.#arguments);
        this.#accessor = observer; const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#accessorPacket = packet;
      }); this.#current(); need(this.#accessorPacket !== null, "ORIGINAL_ACCESSOR_REQUIRED"); return this.#accessorPacket;
    } catch (error) { this.#stop(error); throw error; }
  }
  /** Join the native continuous prefix, complete accessor packet, original
   * selected-file Main fence and this journal's unspent modify intent. Active
   * action history, source body, Main SQL and Save remain separate obligations. */
  public async prepareModification(dispatch: GeneratedSchematicDisplayDispatch): Promise<CurrentSchematicDisplayPreModifyMainOrigin> {
    this.#current(); need(!this.#preparationAttempted && this.#accessor !== null && this.#accessorPacket !== null, "MODIFICATION_PREPARATION_CONSUMED"); this.#preparationAttempted = true; this.#dispatch = dispatch;
    try {
      this.#accessor.requireData(this.#accessorPacket, this.#owner, this.#arguments); await this.waitForStartupObservations(); this.#current();
      await this.#owner.enrollSchematicDisplayProducerPrefix(this.#arguments); this.#current();
      const origin = await this.#owner.prepareSchematicDisplayPreModifyMain(this.#arguments, dispatch); this.#current(); this.#main = origin;
      await requireOriginalCurrentSchematicDisplayPreModifyMainOrigin(origin, this.#owner, this.#arguments).assertCurrent(); this.#current();
      const actionOrigin = await this.#owner.createSchematicDisplayActionOrigin(this.#arguments, origin, async actualActionOrigin => {
        this.#current(); need(this.#action === null, "ORIGINAL_ACTION"); const observer = new CurrentSchematicDisplayActionObserver(actualActionOrigin, this.#owner, this.#arguments);
        this.#action = observer; const packet = await observer.observe(); this.#current(); observer.requireData(packet, this.#owner, this.#arguments); this.#actionPacket = packet;
      }); this.#current(); need(this.#actionPacket !== null, "ORIGINAL_ACTION_PREFLIGHT_REQUIRED"); this.#guard = await this.#owner.armSchematicDisplayActionGuard(this.#arguments, actionOrigin); this.#current(); requireOriginalCurrentSchematicDisplayActionGuard(this.#guard, this.#owner, this.#arguments); return origin;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async requirePrepared(dispatch: GeneratedSchematicDisplayDispatch): Promise<void> {
    this.#current(); need(this.#dispatch === dispatch && this.#main !== null && this.#accessor !== null && this.#accessorPacket !== null && this.#action !== null && this.#actionPacket !== null && this.#guard !== null, "ORIGINAL_PREPARATION_REQUIRED");
    this.#accessor.requireData(this.#accessorPacket, this.#owner, this.#arguments); this.#action.requireData(this.#actionPacket, this.#owner, this.#arguments); requireOriginalCurrentSchematicDisplayActionGuard(this.#guard, this.#owner, this.#arguments); await requireOriginalCurrentSchematicDisplayPreModifyMainOrigin(this.#main, this.#owner, this.#arguments).assertCurrent(); this.#current();
  }
  /** Original Job exit wakes existing collectors; retain and join those exact
   * requests rather than starting another read or detaching live breakpoints. */
  public async settleOriginalCallsAfterExit(): Promise<void> {
    const current = (): void => { assertOriginalCurrentSchematicDisplayWriteOwner(this.#owner); originalCurrentSchematicDisplayWriteTermination(this.#owner); need(originalCurrentSchematicDisplayWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_EXIT_OWNER"); };
    current(); const pending: Promise<unknown>[] = [];
    if (this.#construction !== null) { pending.push(this.#construction); } if (this.#collector !== null) { pending.push(this.#collector); } if (this.#pendingProducer !== null) { pending.push(this.#pendingProducer); }
    await Promise.allSettled(pending); current();
  }
  public cancel(): void { this.#stop(new Error("SCHEMATIC_DISPLAY_SETUP_CANCELLED")); }
  public status(): Readonly<{ armed: boolean; failed: boolean; pendingOriginalProducerRead: boolean; accessorObserved: boolean; preModifyMainRetained: boolean; modifyAuthorized: false; saveAuthorized: false; persistenceVerified: false }> {
    return Object.freeze({ armed: this.#armed, failed: this.#failed, pendingOriginalProducerRead: this.#pendingProducer !== null, accessorObserved: this.#accessorPacket !== null,
      preModifyMainRetained: this.#main !== null, modifyAuthorized: false, saveAuthorized: false, persistenceVerified: false });
  }
}
