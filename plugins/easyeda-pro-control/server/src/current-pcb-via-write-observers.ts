/** Fixed original Via choreography. The enclosing journal publishes allocation,
 * opening, create and Save intents; this group supplies no public writer grant. */
/* oxlint-disable import/max-dependencies -- One fixed coordinator joins the independently qualified worker, clock, main SQL and XHR observers without accepting a caller function table. */
import { assertOriginalCurrentPcbViaWriteOwner, originalCurrentPcbViaWriteTarget } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWriteDispatch } from "./current-pcb-via-write-journal.ts";
import { currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";
import { qualifyOriginalCurrentPcbViaWriteEffect } from "./current-pcb-via-write-effect.ts";
import type { CurrentPcbViaWriteEffect } from "./current-pcb-via-write-effect.ts";
import type { CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import { CurrentPcbViaSaveObserver } from "./current-pcb-via-save-observer.ts";
import { CurrentPcbViaClockObserver } from "./current-pcb-via-clock-observer.ts";
import { CurrentPcbViaMainRequestObserver } from "./current-pcb-via-main-request-observer.ts";
import { CurrentPcbViaMainBeginObserver } from "./current-pcb-via-main-begin-observer.ts";
import { CurrentPcbViaMainHistoryObserver } from "./current-pcb-via-main-history-observer.ts";
import { CurrentPcbViaMainStructureObserver } from "./current-pcb-via-main-structure-observer.ts";
import { CurrentProjectSaveStructureObserver } from "./current-project-save-structure-observer.ts";
import { CurrentProjectSaveProducerObserver, requireOriginalCurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-observer.ts";
import type { CurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-observer.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "./current-project-save-producer-protocol.ts";
import { CurrentProjectStructureTransportObserver } from "./current-project-structure-transport-observer.ts";
import { qualifyOriginalCurrentPcbViaSaveProjection } from "./current-pcb-via-save-projection.ts";

type Outcome<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: unknown }>;
type NativeObservation = Awaited<ReturnType<CurrentPcbViaWriteOwner["observeViaPrimitives"]>>;
type SceneObservation = Awaited<ReturnType<CurrentPcbViaWriteOwner["observeViaSceneMembership"]>>;
const consumed = new WeakSet<CurrentPcbViaWriteOwner>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_OBSERVER_GROUP_${code}`); } }
function result<T>(outcome: Outcome<T>): T { if (!outcome.ok) { throw outcome.error; } return outcome.value; }

export class CurrentPcbViaWriteObservers {
  readonly #owner: CurrentPcbViaWriteOwner; readonly #plan: CurrentPcbViaWritePlan;
  readonly #prepared: ReturnType<typeof originalCurrentPcbViaWriteTarget>;
  readonly #startupReady = Promise.withResolvers<Outcome<void>>();
  readonly #afterAction = Promise.withResolvers<Outcome<CurrentProjectSaveProducerHeldCall>>();
  #armAttempted = false; #failed = false; #failure: unknown; #phase: "startup" | "action" = "startup";
  #save: CurrentPcbViaSaveObserver | null = null; #structure: CurrentProjectSaveStructureObserver | null = null;
  #transport: CurrentProjectStructureTransportObserver | null = null; #producer: CurrentProjectSaveProducerObserver | null = null;
  #construction: Promise<Outcome<void>> | null = null; #collector: Promise<Outcome<void>> | null = null;
  #originalPendingProducer: Promise<CurrentProjectSaveProducerHeldCall> | null = null;
  #main: CurrentPcbViaMainOrigin | null = null; #mainRequest: CurrentPcbViaMainRequestObserver | null = null;
  #mainBegin: CurrentPcbViaMainBeginObserver | null = null; #mainHistory: CurrentPcbViaMainHistoryObserver | null = null;
  #mainStructure: CurrentPcbViaMainStructureObserver | null = null; #clock: CurrentPcbViaClockObserver | null = null;
  #before: NativeObservation | null = null; #beforeScene: SceneObservation | null = null; #beforeAttempted = false; #beforeSceneAttempted = false;
  #createAttempted = false; #effect: CurrentPcbViaWriteEffect | null = null; #clockAttempted = false; #bodyAttempted = false;
  public constructor(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan) {
    assertOriginalCurrentPcbViaWriteOwner(owner); const prepared = requireOriginalCurrentPcbViaWritePlan(plan).prepared;
    need(originalCurrentPcbViaWriteTarget(owner) === prepared && !consumed.has(owner), "ORIGINAL_OWNER_AND_PLAN"); consumed.add(owner);
    this.#owner = owner; this.#plan = plan; this.#prepared = prepared; Object.freeze(this);
  }
  #current(): void {
    if (this.#failed) { throw this.#failure; } assertOriginalCurrentPcbViaWriteOwner(this.#owner);
    need(requireOriginalCurrentPcbViaWritePlan(this.#plan).prepared === this.#prepared && originalCurrentPcbViaWriteTarget(this.#owner) === this.#prepared, "ORIGINAL_CHANGED");
  }
  #stop(error: unknown): void {
    if (!this.#failed) { this.#failed = true; this.#failure = error; }
    this.#startupReady.resolve(Object.freeze({ ok: false, error: this.#failure })); this.#afterAction.resolve(Object.freeze({ ok: false, error: this.#failure }));
  }
  async #retain<T>(original: Promise<T>): Promise<Outcome<T>> {
    try { return Object.freeze({ ok: true, value: await original }); }
    catch (error) { this.#stop(error); return Object.freeze({ ok: false, error }); }
  }
  /** Fixed callbacks run only against original source-held origins issued by
   * this same owner. Pending construction/producer promises remain retained. */
  public armBeforeNavigation(): void {
    this.#current(); need(!this.#armAttempted, "ARM_CONSUMED"); this.#armAttempted = true;
    try {
      this.#owner.armViaSaveWorker(this.#plan, async origin => {
        this.#current(); need(this.#save === null, "SAVE_OBSERVER_CONSUMED"); const observer = new CurrentPcbViaSaveObserver(origin, this.#owner, this.#plan);
        this.#save = observer; await observer.arm(); this.#current();
      });
      this.#owner.armViaSaveStructureWorker(this.#plan, async origin => {
        this.#current(); need(this.#structure === null && this.#construction === null, "STRUCTURE_OBSERVER_CONSUMED");
        const observer = new CurrentProjectSaveStructureObserver(origin, this.#owner, this.#plan); this.#structure = observer;
        await observer.arm(); this.#current(); this.#construction = this.#retain(observer.observeConstruction());
      });
      this.#owner.armViaStructureTransportWorker(this.#plan, async origin => {
        this.#current(); need(this.#transport === null, "TRANSPORT_OBSERVER_CONSUMED"); const observer = new CurrentProjectStructureTransportObserver(origin, this.#owner, this.#plan);
        this.#transport = observer; await observer.arm(); this.#current();
      });
      this.#owner.armViaProducerPrefixWorker(this.#plan);
      this.#owner.armViaProducerObservationWorker(this.#plan, async origin => {
        this.#current(); need(this.#producer === null && this.#collector === null, "PRODUCER_OBSERVER_CONSUMED");
        const observer = new CurrentProjectSaveProducerObserver(origin, this.#owner, this.#plan); this.#producer = observer;
        await observer.arm(); this.#current(); this.#collector = this.#retain(this.#collectStartup(observer));
      });
    } catch (error) { this.#stop(error); throw error; }
  }
  async #settleStartup(observer: CurrentProjectSaveProducerObserver): Promise<void> {
    let progress = observer.startupProgress();
    if (progress.initialSync?.canSettle === true) { await observer.settleInitialSyncCall(); this.#current(); progress = observer.startupProgress(); }
    // Initial sync provides a causal settlement opportunity for earlier cache work.
    // No delay, stability counter or copied completed flag is authority.
    if (progress.initialSync?.completed === true && progress.initialCache?.canSettle === true) { await observer.settleInitialCacheCalls(); this.#current(); progress = observer.startupProgress(); }
    if (progress.periodicSync?.canSettle === true) { await observer.settlePeriodicSyncCall(); this.#current(); }
  }
  async #collectStartup(observer: CurrentProjectSaveProducerObserver): Promise<void> {
    const construction = this.#construction; need(construction !== null, "ORIGINAL_CONSTRUCTION_REQUIRED"); result(await construction); this.#current();
    for (let count = 0; count < CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.events; count += 1) {
      await this.#settleStartup(observer); this.#current(); const progress = observer.startupProgress();
      if (progress.initialCache?.completed === true && progress.initialSync?.completed === true && progress.periodicSync?.active !== true) {
        // This guides the outer coordinator. Original Core checks independently
        // Reprove prefix/create authority and every native acknowledgment.
        this.#startupReady.resolve(Object.freeze({ ok: true, value: undefined }));
      }
      need(this.#originalPendingProducer === null, "ORIGINAL_PRODUCER_READ_PENDING");
      const pending = observer.observeHeldCall(); this.#originalPendingProducer = pending;
      const packet = await pending; need(this.#originalPendingProducer === pending, "ORIGINAL_PRODUCER_READ_CHANGED"); this.#originalPendingProducer = null;
      this.#current(); await this.#settleStartup(observer); this.#current();
      if (this.#phase === "action") { this.#afterAction.resolve(Object.freeze({ ok: true, value: packet })); return; }
      const actual = requireOriginalCurrentProjectSaveProducerHeldCall(packet, observer);
      if (actual.role === "headEntry" || actual.role === "headPromise" || actual.role === "headSuccess") { await observer.continueInitialCacheCall(packet); }
      else if (observer.startupProgress().initialSync?.completed === true) { await observer.continuePeriodicSyncCall(packet); }
      else { await observer.continueInitialSyncCall(packet); }
      this.#current();
    }
    throw new Error("PCB_VIA_OBSERVER_GROUP_STARTUP_EVENT_BOUND");
  }
  /** This joins the same collector started before navigation. It never starts
   * another poll, claims a drained frontier or abandons a pending native read. */
  public async waitForStartupObservations(): Promise<void> { result(await this.#startupReady.promise); this.#current(); }
  public async observeBeforeNative(): Promise<NativeObservation> {
    this.#current(); need(!this.#beforeAttempted && !this.#createAttempted, "BEFORE_NATIVE_CONSUMED"); this.#beforeAttempted = true;
    try { const value = await this.#owner.observeViaPrimitives(this.#plan, "before"); this.#current(); this.#before = value; return value; }
    catch (error) { this.#stop(error); throw error; }
  }
  public async observeBeforeScene(): Promise<SceneObservation> {
    this.#current(); need(!this.#beforeSceneAttempted && !this.#createAttempted, "BEFORE_SCENE_CONSUMED"); this.#beforeSceneAttempted = true;
    try { const value = await this.#owner.observeViaSceneMembership(this.#plan, "before"); this.#current(); this.#beforeScene = value; return value; }
    catch (error) { this.#stop(error); throw error; }
  }
  /** Caller must already have published this original journal's create intent.
   * All main collectors arm before the actual one-shot SDK create. */
  public async create(dispatch: CurrentPcbViaWriteDispatch): Promise<CurrentPcbViaWriteEffect> {
    this.#current(); need(!this.#createAttempted && this.#before !== null && this.#beforeScene !== null, "CREATE_CONSUMED"); this.#createAttempted = true;
    try {
      await this.waitForStartupObservations(); this.#current(); await this.#owner.enrollViaProducerPrefix(this.#plan); this.#current();
      this.#main = await this.#owner.prepareViaMainObservationOrigin(this.#plan, dispatch, async origin => {
        this.#current(); need(this.#mainRequest === null && this.#mainBegin === null && this.#mainHistory === null && this.#mainStructure === null, "ORIGINAL_MAIN_OBSERVERS");
        this.#mainRequest = new CurrentPcbViaMainRequestObserver(origin, this.#owner, this.#plan); await this.#mainRequest.arm(); this.#current();
        this.#mainBegin = new CurrentPcbViaMainBeginObserver(origin, this.#owner, this.#plan); await this.#mainBegin.arm(); this.#current();
        this.#mainHistory = new CurrentPcbViaMainHistoryObserver(origin, this.#owner, this.#plan); await this.#mainHistory.arm(); this.#current();
        this.#mainStructure = new CurrentPcbViaMainStructureObserver(origin, this.#owner, this.#plan); await this.#mainStructure.arm(); this.#current();
      });
      this.#current(); this.#phase = "action";
      const acknowledgement = await this.#owner.executeViaStage("create", this.#plan, dispatch); this.#current();
      need("stage" in acknowledgement, "ORIGINAL_CREATE_ACKNOWLEDGEMENT"); currentPcbViaWriteStageResultSchema.parse(acknowledgement);
      const after = await this.#owner.observeViaPrimitives(this.#plan, "after"); this.#current();
      const afterScene = await this.#owner.observeViaSceneMembership(this.#plan, "after"); this.#current();
      const effect = qualifyOriginalCurrentPcbViaWriteEffect(this.#owner, this.#plan, { before: this.#before, beforeScene: this.#beforeScene, after, afterScene, createAcknowledgement: acknowledgement });
      this.#owner.bindViaMainOriginalEffect(this.#plan, this.#main, effect); this.#effect = effect; return effect;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async armSaveClock(): Promise<void> {
    this.#current(); need(this.#effect !== null && !this.#clockAttempted, "SAVE_CLOCK_CONSUMED"); this.#clockAttempted = true;
    try {
      const observed = await this.#owner.executeViaStage("observe", this.#plan); this.#current();
      need("stage" in observed && observed.stage === "observe", "ORIGINAL_SDK_OBSERVATION"); currentPcbViaWriteStageResultSchema.parse(observed);
      await this.#owner.createViaClockOrigin(this.#plan, this.#effect, async origin => {
      this.#current(); need(this.#clock === null, "ORIGINAL_CLOCK"); this.#clock = new CurrentPcbViaClockObserver(origin, this.#owner, this.#plan); await this.#clock.arm(); this.#current();
      }); this.#current();
    } catch (error) { this.#stop(error); throw error; }
  }
  /** Runs beside the original pending Save SDK Promise. Complete clock/body
   * projection precedes any original structure or history continuation. */
  public async observeOriginalSave(): Promise<void> {
    this.#current(); need(!this.#bodyAttempted && this.#clock !== null && this.#save !== null && this.#effect !== null && this.#main !== null &&
      this.#mainRequest !== null && this.#mainBegin !== null && this.#mainHistory !== null && this.#mainStructure !== null && this.#structure !== null && this.#transport !== null, "ORIGINAL_SAVE_OBSERVERS_REQUIRED");
    this.#bodyAttempted = true;
    try {
      const bodies = await Promise.allSettled([this.#clock.collect(), this.#save.observeBody()]); this.#current();
      const body = bodies[1], clock = bodies[0]; if (clock.status === "rejected" || body.status === "rejected") {
        const errors: unknown[] = []; if (clock.status === "rejected") { errors.push(clock.reason); } if (body.status === "rejected") { errors.push(body.reason); }
        throw new AggregateError(errors, "Original Via clock/body collection failed.");
      }
      const joined = await this.#clock.joinBody(clock.value, body.value); this.#current();
      const projection = await qualifyOriginalCurrentPcbViaSaveProjection(this.#owner, this.#plan, this.#effect, body.value, joined); this.#current();
      await this.#mainRequest.bindOriginalBody(projection); this.#current();
      const reservation = await this.#owner.reserveViaStructurePublication(this.#plan, this.#main); this.#current();
      await this.#save.releaseBody(body.value); this.#current();
      // The original Save result precedes the delayed structure/history timers.
      // Resume it first while the separate planned local producer is serviced.
      // Its SDK acknowledgment alone never completes this orchestration.
      await this.#save.observeCompletion(); this.#current();
      const packet = await this.#structure.observePacket(); this.#current();
      await this.#structure.releasePrehistoryPacket(packet, reservation); this.#current();
      const transport = await this.#transport.observeSend(); this.#current(); await this.#transport.releaseSend(transport, reservation); this.#current();
      await this.#transport.observeReturned(transport); this.#current(); await this.#mainStructure.observe(); this.#current();
      const publication = this.#owner.completeViaStructurePublication(this.#plan); await this.#transport.releaseReturned(transport, publication); this.#current();
      await this.#structure.observePrehistoryCompletion(publication); this.#current();
      const driver = await this.#mainRequest.captureDriver(projection); this.#current(); const context = await this.#mainRequest.continueToContext(driver); this.#current();
      const controller = await this.#mainRequest.continueToController(context); this.#current(); const actor = await this.#mainRequest.continueToActor(controller); this.#current();
      const begin = await this.#mainBegin.begin(actor); this.#current(); await this.#mainHistory.observe(begin); this.#current();
      this.#owner.completeViaHistorySql(this.#plan); this.#current();
    } catch (error) { this.#stop(error); throw error; }
  }
  /** The first original post-action producer remains held. The eventual fixed
   * writer continuation must use this same observer/packet, never copied JSON. */
  public async originalProducerAfterAction(): Promise<Readonly<{ observer: CurrentProjectSaveProducerObserver; packet: CurrentProjectSaveProducerHeldCall }>> {
    const packet = result(await this.#afterAction.promise); this.#current(); need(this.#producer !== null, "ORIGINAL_PRODUCER_REQUIRED");
    requireOriginalCurrentProjectSaveProducerHeldCall(packet, this.#producer); return Object.freeze({ observer: this.#producer, packet });
  }
  /** Revoke only this orchestration. The original native owner and every
   * pending read remain retained for separately authorized original cleanup. */
  public cancel(): void { this.#stop(new Error("PCB_VIA_OBSERVER_GROUP_CANCELLED")); }
  public status(): Readonly<{ armed: boolean; failed: boolean; originalProducerReadPending: boolean; originalCollectorRetained: boolean; effectRetained: boolean; persistenceVerified: false }> {
    return Object.freeze({ armed: this.#armAttempted, failed: this.#failed, originalProducerReadPending: this.#originalPendingProducer !== null,
      originalCollectorRetained: this.#collector !== null, effectRetained: this.#effect !== null, persistenceVerified: false });
  }
}
