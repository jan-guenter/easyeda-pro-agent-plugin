/* oxlint-disable unicorn/no-useless-undefined -- Original retained undefined receipt uses its exact settlement value. */
/** Private staged saved opening with one original held cache tuple. Matching
 * metadata or injected callbacks cannot allocate this native generation. */
/* oxlint-disable import/max-dependencies -- This original adapter joins independent native ownership, raw-file reproof, full SQL, actual reader completion and fixed held-cache/readback collectors; caller providers cannot replace these boundaries. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { captureCurrentFootprintForwardWriterSavedClosedSnapshot, requireCurrentFootprintForwardWriterClosedSnapshot, requireCurrentFootprintForwardWriterSavedClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
import { verifyCurrentFootprintForwardWriterPosteditPreopenSource, verifyCurrentFootprintForwardWriterSavedPosteditPreopenSource } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintForwardWriterPreopenSourceObservation } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopySavedExecutionNative, CurrentFootprintCopySavedStartOutcome } from "./current-footprint-copy-execution-runtime.ts";
import { CurrentFootprintCopyV2SavedReadRunner } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopyV2SavedReadPacket } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintForwardWriterPairedObservation, requireOriginalCurrentFootprintForwardWriterSavedContinuation } from "./current-footprint-forward-writer-paired-scheduler.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import {requireOriginalCurrentFootprintForwardWriterSavedProjection} from "./current-footprint-forward-writer-saved-source.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "./current-footprint-saved-cache-held-runner.ts";
import { CurrentFootprintForwardWriterHeldSavedNativeOwner, assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner, assertOriginalCurrentFootprintForwardWriterHeldSavedNativeOwner, assertOriginalCurrentFootprintForwardWriterHeldSavedNativeTermination, currentFootprintForwardWriterHeldSavedAllocationOutcome, originalCurrentFootprintForwardWriterHeldSavedNativeTarget, originalCurrentFootprintForwardWriterHeldSavedNativeTermination, originalCurrentFootprintForwardWriterNativeTarget, requireOriginalCurrentFootprintForwardWriterHeldSavedOwner, startCurrentFootprintForwardWriterHeldSavedNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintForwardWriterNativeOwner, CurrentFootprintForwardWriterReleasePreflightProof } from "./current-pcb-diagnostic-owner.ts";

export interface CurrentFootprintForwardWriterHeldSavedOpenGuard { readonly profile: "private.current-footprint-forward-writer-held-saved-open-guard.v1" }
type Stage = "new" | "starting" | "started" | "first-observing" | "first-held" | "opening" | "fresh-observing" |
  "fresh-held" | "group-released" | "preopen-verified" | "opened" | "failed" | "closing" | "closed" | "released";
interface PendingWitness {
  readonly adapter: CurrentFootprintForwardWriterHeldSavedGeneration;
  readonly owner: CurrentFootprintForwardWriterHeldSavedNativeOwner;
  readonly runner: CurrentFootprintSavedCacheHeldRunner;
  readonly first: CurrentFootprintSavedCacheHeldObservation;
}
interface CompletedWitness {
  readonly pending: PendingWitness;
  readonly fresh: CurrentFootprintSavedCacheHeldObservation;
  readonly source: Readonly<CurrentFootprintForwardWriterPreopenSourceObservation>;
}
const guards = new WeakMap<CurrentFootprintForwardWriterHeldSavedOpenGuard, CurrentFootprintForwardWriterHeldSavedGeneration>();
const witnesses = new WeakMap<object, PendingWitness>();
const completed = new WeakMap<object, CompletedWitness>();
const writers = new WeakSet<object>();
const forwardBindings = new WeakMap<CurrentFootprintCopySavedExecutionNative, CurrentFootprintForwardWriterHeldSavedGeneration>();
export interface CurrentFootprintForwardWriterSavedCheckpoint { readonly profile: "private.current-footprint-forward-writer-saved-checkpoint.v1" }
const forwardCheckpoints = new WeakMap<CurrentFootprintForwardWriterSavedCheckpoint, CurrentFootprintForwardWriterHeldSavedGeneration>();
type PairedModule = Readonly<{ requireOriginalCurrentFootprintForwardWriterSavedContinuation: typeof requireOriginalCurrentFootprintForwardWriterSavedContinuation }>;
type Predecessor = Readonly<{owner:CurrentFootprintForwardWriterNativeOwner;paired:CurrentFootprintForwardWriterPairedObservation;pairedModule:PairedModule;verifyPaired:PairedModule["requireOriginalCurrentFootprintForwardWriterSavedContinuation"]}>;
const names = { start: "startFootprintCopyHeldSavedGeneration", cache: "retainedFootprintCopyHeldSavedCache",
  requireCache: "requireOriginalFootprintCopyHeldSavedCache", prepare: "prepareFootprintCopyHeldSavedCache",
  first: "observeFirstFootprintCopyHeldSavedCache", fresh: "observeFreshFootprintCopyHeldSavedCache",
  releaseCache: "releaseFootprintCopyHeldSavedCache", open: "openFootprintForwardWriterHeldSavedProject", endObservers:"endFootprintForwardWriterHeldSavedObserversAfterTermination",abort:"abortFootprintCopyHeldSavedJob", window: "observeApplicationWindow",
  close: "requestNormalClose", termination: "observeTermination", status: "status", release: "releaseClosed",
  noProcess: "releaseNoProcess", unlaunched: "releaseUnlaunched", releaseState: "observeFootprintCopyRelease", preflight: "consumeFootprintForwardWriterReleasePreflightFailure", retryRelease: "retryFootprintForwardWriterReleaseAfterPreflight" } as const;
/* oxlint-disable typescript/unbound-method -- Captured methods are invoked only on the same registry-checked original private-field receiver. */
const runnerMethods = Object.freeze({ require: CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal,
  retained: CurrentFootprintSavedCacheHeldRunner.prototype.retained });
const forwardReaderMethods = Object.freeze({ observe: CurrentFootprintCopyV2SavedReadRunner.prototype.observe,
  require: CurrentFootprintCopyV2SavedReadRunner.prototype.requireOriginal, status: CurrentFootprintCopyV2SavedReadRunner.prototype.status });
type NativeMethods = { readonly [Key in keyof typeof names]: CurrentFootprintForwardWriterHeldSavedNativeOwner[typeof names[Key]] };
/** Retain the fixed native methods before allocating or launching a helper. */
function nativeMethods(): NativeMethods {
  return Object.freeze({ start: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.startFootprintCopyHeldSavedGeneration,
    cache: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.retainedFootprintCopyHeldSavedCache,
    requireCache: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.requireOriginalFootprintCopyHeldSavedCache,
    prepare: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.prepareFootprintCopyHeldSavedCache,
    first: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.observeFirstFootprintCopyHeldSavedCache,
    fresh: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.observeFreshFootprintCopyHeldSavedCache,
    releaseCache: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.releaseFootprintCopyHeldSavedCache,
    open: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.openFootprintForwardWriterHeldSavedProject,
    endObservers:CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.endFootprintForwardWriterHeldSavedObserversAfterTermination,abort:CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.abortFootprintCopyHeldSavedJob,
    window: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.observeApplicationWindow,
    close: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.requestNormalClose,
    termination: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.observeTermination,
    status: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.status,
    release: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.releaseClosed,
    noProcess: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.releaseNoProcess,
    unlaunched: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.releaseUnlaunched,
    releaseState: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.observeFootprintCopyRelease,
    preflight: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.consumeFootprintForwardWriterReleasePreflightFailure,
    retryRelease: CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype.retryFootprintForwardWriterReleaseAfterPreflight });
}
/* oxlint-enable typescript/unbound-method */

/** Refuse a consumed or substituted original without exposing private replies. */
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FORWARD_WRITER_HELD_SAVED_GENERATION_${detail}`); }
}

/** The fixed native opener calls this after preflight and worker arming, directly
 * before its sole open. A copied guard cannot reach an adapter or native stage. */
export async function revalidateCurrentFootprintForwardWriterHeldSavedOpenGuard(owner: CurrentFootprintForwardWriterHeldSavedNativeOwner,
  guard: CurrentFootprintForwardWriterHeldSavedOpenGuard): Promise<void> {
  const adapter = guards.get(guard); need(adapter !== undefined, "ORIGINAL_OPEN_GUARD");
  await adapter.beforeOpen(owner, guard);
}

class CurrentFootprintForwardWriterHeldSavedGeneration {
  readonly #writer: Predecessor;
  readonly #methods = nativeMethods();
  readonly #generation = Object.freeze({});
  readonly #normalPending=new Set<Promise<unknown>>();
  #observersEnded:Promise<void>|null=null;
  #abortPending:Promise<void>|null=null;

  #owner: CurrentFootprintForwardWriterHeldSavedNativeOwner | null = null;
  #projection: CurrentFootprintCopyV2SavedProjection | null = null;
  #projectionText: string | null = null;
  #after: Inventory | null = null;
  #runner: CurrentFootprintSavedCacheHeldRunner | null = null;
  #stage: Stage = "new";
  #startOutcome: CurrentFootprintCopySavedStartOutcome = "not-started";
  #replay: object | null = null;
  #guard: CurrentFootprintForwardWriterHeldSavedOpenGuard | null = null;
  #guardAttempted = false;
  #guardCompleted = false;
  #closeAttempted = false;
  #termination: object | null = null;
  #snapshotAttempted = false;
  #releaseAttempted = false;
  #releaseFirstFailure: unknown;
  #releasePreflightProof: CurrentFootprintForwardWriterReleasePreflightProof | null = null;
  #releaseRetryAttempted = false;
  #noProcessReleased = false;
  #noProcessReleaseAttempted = false;
  #opened: Awaited<ReturnType<CurrentFootprintCopySavedExecutionNative["open"]>> | null = null;
  #closedInventory: Inventory | null = null;
  #forwardReadAttempted = false;
  #forwardReader: CurrentFootprintCopyV2SavedReadRunner | null = null;
  #forwardRead: CurrentFootprintCopyV2SavedReadPacket | null = null;
  #forwardReadQualified = false;
  #forwardCheckpointAttempted = false;
  #forwardCheckpoint: CurrentFootprintForwardWriterSavedCheckpoint | null = null;

  /** Accept only the original predecessor. Its factory, closed snapshot and
   * allocation registry remain the native authority boundary. */
  public constructor(writer:Predecessor){
    assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(writer.owner);
    need(writer.pairedModule.requireOriginalCurrentFootprintForwardWriterSavedContinuation===writer.verifyPaired,"ORIGINAL_PAIRED_MODULE");writer.verifyPaired(writer.paired,writer.owner);
    need(!writers.has(writer.owner),"WRITER_CONSUMED");writers.add(writer.owner);this.#writer=Object.freeze(writer);
  }
  #parentSnapshot(after:Inventory):ReturnType<typeof requireCurrentFootprintForwardWriterClosedSnapshot>{
    return requireCurrentFootprintForwardWriterClosedSnapshot(this.#writer.owner,after);
  }
  #parentTarget():ReturnType<typeof originalCurrentFootprintForwardWriterNativeTarget>{
    return originalCurrentFootprintForwardWriterNativeTarget(this.#writer.owner);
  }
  #requireForwardProjection(projection:CurrentFootprintCopyV2SavedProjection,after:Inventory):void{
    requireOriginalCurrentFootprintForwardWriterSavedProjection(this.#writer.owner,this.#writer.paired,projection,after);
  }
  /** Reprove original references and captured methods without a native request.
   * These checks establish custody, not fresh Windows or continuous cache state. */
  #current(): void {
    assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(this.#writer.owner);need(this.#writer.pairedModule.requireOriginalCurrentFootprintForwardWriterSavedContinuation===this.#writer.verifyPaired,"ORIGINAL_PAIRED_MODULE");this.#writer.verifyPaired(this.#writer.paired,this.#writer.owner);
    if (this.#after !== null) { this.#parentSnapshot(this.#after); }
    if (this.#projection !== null) {
      need(this.#after !== null, "ORIGINAL_FORWARD_SNAPSHOT"); this.#requireForwardProjection(this.#projection, this.#after);
      need(canonicalJson(this.#projection) === this.#projectionText, "PROJECTION_CHANGED");
      const origin = this.#parentTarget(), target = currentFootprintCopyV2SavedTarget(this.#projection);
      need(target.projectUuid === origin.target.projectUuid && target.branchUuid === origin.target.branchUuid &&
        this.#projection.afterSqlSha256 === this.#after?.logicalSha256, "ORIGINAL_PROJECTION");
    }
    if (this.#forwardReader !== null) {
      need(!types.isProxy(this.#forwardReader) && Object.getPrototypeOf(this.#forwardReader) === CurrentFootprintCopyV2SavedReadRunner.prototype &&
        Reflect.ownKeys(this.#forwardReader).length === 0 && this.#forwardReader.observe === forwardReaderMethods.observe &&
        this.#forwardReader.requireOriginal === forwardReaderMethods.require && this.#forwardReader.status === forwardReaderMethods.status,
        "ORIGINAL_FORWARD_READER");
      forwardReaderMethods.status.call(this.#forwardReader);
    }
    if (this.#owner !== null) {
      const owner = this.#owner; assertOriginalCurrentFootprintForwardWriterHeldSavedNativeOwner(owner);
      need(this.#after !== null&&this.#projection!==null, "ORIGINAL_FORWARD_SNAPSHOT"); requireOriginalCurrentFootprintForwardWriterHeldSavedOwner(owner,this.#writer.owner,this.#after,this.#projection,this.#writer.paired);
      need(Object.getPrototypeOf(owner) === CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype && Reflect.ownKeys(owner).length === 0,
        "ORIGINAL_NATIVE_OWNER");
      for (const key of ["start", "cache", "requireCache", "prepare", "first", "fresh", "releaseCache", "open", "endObservers","abort","window", "close",
        "termination", "status", "release", "noProcess", "unlaunched", "releaseState", "preflight", "retryRelease"] as const) {
        need(owner[names[key]] === this.#methods[key] && CurrentFootprintForwardWriterHeldSavedNativeOwner.prototype[names[key]] === this.#methods[key],
          "NATIVE_METHOD_CHANGED");
      }
      if (this.#runner !== null) {
        need(!types.isProxy(this.#runner) && Object.getPrototypeOf(this.#runner) === CurrentFootprintSavedCacheHeldRunner.prototype &&
          Reflect.ownKeys(this.#runner).length === 0 && CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal === runnerMethods.require &&
          CurrentFootprintSavedCacheHeldRunner.prototype.retained === runnerMethods.retained, "ORIGINAL_HELD_RUNNER");
        this.#methods.requireCache.call(owner, this.#runner);
        need(this.#methods.cache.call(owner) === this.#runner, "HELD_RUNNER_CHANGED");
      }
    }
  }

  /** Obtain the retained native owner even when allocation or launch failed. */
  #native(): CurrentFootprintForwardWriterHeldSavedNativeOwner {
    this.#current(); need(this.#owner !== null, "NATIVE_OWNER_NOT_ALLOCATED"); return this.#owner;
  }

  /** Keep all normal stages on the same unclosed owner and exact expected stage. */
  #at(stage: Stage): CurrentFootprintForwardWriterHeldSavedNativeOwner {
    const owner = this.#native(); need(this.#stage === stage && !this.#closeAttempted && this.#termination === null && !this.#releaseAttempted,
      "STAGE_CONSUMED"); return owner;
  }

  /** Obtain the actual owner's retained runner. No transport or evidence input is
   * accepted, and the original owner rechecks its private runner reference. */
  #cache(): CurrentFootprintSavedCacheHeldRunner {
    const owner = this.#native();
    this.#runner ??= this.#methods.cache.call(owner);
    this.#current(); need(this.#runner !== null, "HELD_RUNNER_REQUIRED"); return this.#runner;
  }

  /** Preserve failure across delayed callbacks. Cleanup never restores a normal
   * stage or makes a pending/released observation into a reusable witness. */
  #failed(): void { if (!this.#closeAttempted) { this.#stage = "failed"; } }

  #retain<T>(run:()=>Promise<T>):Promise<T>{
    need(this.#normalPending.size<4,"NORMAL_PENDING_BOUND");
    const pending=run();this.#normalPending.add(pending);return pending;
  }
  /** The caller must publish its original abort intent first. A duplicate
   * request returns the same pending action, never another native dispatch. */
  public abortOriginalJob():Promise<void>{
    if(this.#abortPending!==null){return this.#abortPending;}
    const owner=this.#native();this.#closeAttempted=true;this.#stage="closing";
    const completion=Promise.withResolvers<undefined>();this.#abortPending=completion.promise;
    void(async():Promise<void>=>{try{await this.#methods.abort.call(owner,true);completion.resolve(undefined);}catch(error){completion.reject(error);}})();return completion.promise;
  }
  /** Expose only the existing fixed execution binding. Constructor callbacks and
   * runner inputs cannot be supplied through this data-free native interface. */
  public binding(): CurrentFootprintCopySavedExecutionNative {
    return Object.freeze<CurrentFootprintCopySavedExecutionNative>({ generation: this.#generation, assertOwned: (): void => { this.#current(); },
      start: (projection, after): Promise<void> => this.#retain(()=>this.#start(projection, after)),
      startOutcome: (): CurrentFootprintCopySavedStartOutcome => { this.#current(); return this.#startOutcome; },
      excludeReplay: (): Promise<object> => this.#retain(()=>this.#excludeReplay()),
      requireReplayExclusion: (original): Promise<void> => { this.#requireReplay(original); return Promise.resolve(); },
      open: (projection, after, replay) => this.#retain(()=>this.#open(projection, after, replay)), close: (): Promise<unknown> => this.#close(),
      termination: () => this.#observeTermination(),
      requireTermination: (original): Promise<void> => { this.#requireTermination(original); return Promise.resolve(); },
      snapshot: (original): Promise<Inventory> => this.#snapshot(original), release: (original): Promise<void> => this.#release(original),
      observeRelease: (original): Promise<"pending" | "released"> => Promise.resolve(this.#observeRelease(original)) });
  }

  /** Consume allocation before any await and retain a factory-issued helper
   * before launch. Partial allocation remains owned for original cleanup. */
  async #start(projection: CurrentFootprintCopyV2SavedProjection, after: Inventory): Promise<void> {
    this.#current(); need(this.#stage === "new", "START_CONSUMED"); this.#stage = "starting"; this.#startOutcome = "pending";
    let allocationAttempted = false;
    try {
      const snapshot = this.#parentSnapshot(after);
      currentFootprintCopyV2SavedTarget(projection);
      this.#requireForwardProjection(projection, after);
      this.#projection = projection; this.#projectionText = canonicalJson(projection); this.#after = after; this.#current();
      allocationAttempted = true;
      const owner=await startCurrentFootprintForwardWriterHeldSavedNativeOwner(this.#writer.owner,this.#writer.paired,projection,after);
      this.#owner = owner; this.#startOutcome = "retained"; this.#at("starting");
      const origin = originalCurrentFootprintForwardWriterHeldSavedNativeTarget(owner);
      need(origin.checkpoint === snapshot.checkpoint && origin.source === snapshot.checkpoint.source, "SAVED_POSTEDIT_BINDING");
      await this.#methods.start.call(owner); this.#at("starting");
      const saved = this.#methods.status.call(owner).binding, writer = this.#methods.status.call(this.#writer.owner).binding;
      need(writer !== null && saved !== null && writer.jobId !== saved.jobId && writer.helperInstance !== saved.helperInstance,
        "FRESH_NATIVE_GENERATION"); this.#stage = "started";
    } catch (error) {
      if (allocationAttempted) {
        const outcome=currentFootprintForwardWriterHeldSavedAllocationOutcome(this.#writer.owner);
        this.#owner = outcome.owner; this.#startOutcome = outcome.status === "not-attempted" || outcome.status === "retained-before-owner" || outcome.status === "closed-before-owner" ? "unresolved" : outcome.status;
      } else { this.#startOutcome = "no-resource"; }
      this.#failed(); throw error;
    }
  }

  /** Qualify and sample once through native stage wrappers, then issue one
   * private pending witness. Both namespaces are in this first sample. */
  async #excludeReplay(): Promise<object> {
    const owner = this.#at("started"); this.#stage = "first-observing";
    try {
      const runner = this.#cache(); await this.#methods.prepare.call(owner); this.#at("first-observing");
      const first = await this.#methods.first.call(owner); this.#at("first-observing");
      await runnerMethods.require.call(runner, first, "first"); this.#at("first-observing");
      this.#replay = Object.freeze({}); witnesses.set(this.#replay, Object.freeze({ adapter: this, owner, runner, first }));
      this.#stage = "first-held"; return this.#replay;
    } catch (error) { this.#failed(); throw error; }
  }

  /** A pending witness check adds no native/CDP work and makes no freshness
   * claim. Only the exact original reference in its unconsumed stage passes. */
  #requireReplay(original: object): PendingWitness {
    const held = witnesses.get(original), owner = this.#at("first-held");
    need(original === this.#replay && held !== undefined && held.adapter === this && held.owner === owner && held.runner === this.#runner,
      "ORIGINAL_REPLAY_EXCLUSION");
    const retained = runnerMethods.retained.call(held.runner);
    need(retained["phase"] === "first-observed" && retained["failure"] === null && retained["pendingCallbacks"] === 0 &&
      retained["releaseAttempted"] === false, "ORIGINAL_REPLAY_STAGE"); return held;
  }

  /** Consume one open before invoking its native preflight. The original guard
   * must complete even when a malformed native route returns a success object. */
  async #open(projection: CurrentFootprintCopyV2SavedProjection, after: Inventory, replay: object): ReturnType<CurrentFootprintCopySavedExecutionNative["open"]> {
    const pending = this.#requireReplay(replay);
    need(projection === this.#projection && after === this.#after, "ORIGINAL_SAVED_INPUTS"); this.#stage = "opening";
    this.#guard = Object.freeze({ profile: "private.current-footprint-forward-writer-held-saved-open-guard.v1" }); guards.set(this.#guard, this);
    try {
      const result = await this.#methods.open.call(pending.owner, projection, this.#guard); this.#at("preopen-verified");
      need(this.#guardCompleted && completed.get(replay)?.pending === pending, "OPEN_GUARD_NOT_COMPLETED"); this.#opened = result; this.#stage = "opened"; return result;
    } catch (error) { this.#failed(); throw error; }
  }

  /** Refresh on the original tuple after native preflight, acknowledge its one
   * release, then verify original post-edit bytes. Completion retains custody
   * after release without calling requireOriginal on a released runner. */
  public async beforeOpen(owner: CurrentFootprintForwardWriterHeldSavedNativeOwner, guard: CurrentFootprintForwardWriterHeldSavedOpenGuard): Promise<void> {
    need(this.#at("opening") === owner && guard === this.#guard && !this.#guardAttempted && this.#after !== null && this.#replay !== null,
      "OPEN_GUARD_CONSUMED"); this.#guardAttempted = true; this.#stage = "fresh-observing";
    try {
      const pending = witnesses.get(this.#replay); need(pending !== undefined && pending.adapter === this && pending.owner === owner &&
        pending.runner === this.#runner, "ORIGINAL_REPLAY_EXCLUSION");
      const fresh = await this.#methods.fresh.call(owner); this.#at("fresh-observing");
      await runnerMethods.require.call(pending.runner, fresh, "fresh"); this.#at("fresh-observing"); this.#stage = "fresh-held";
      await this.#methods.releaseCache.call(owner); this.#at("fresh-held");
      const retained = runnerMethods.retained.call(pending.runner);
      need(retained["released"] === true && retained["pendingCallbacks"] === 0, "HELD_RELEASE_UNACKNOWLEDGED"); this.#stage = "group-released";
      const source = await verifyCurrentFootprintForwardWriterPosteditPreopenSource(this.#writer.owner,this.#after); this.#at("group-released");
      completed.set(this.#replay, Object.freeze({ pending, fresh, source })); this.#guardCompleted = true; this.#stage = "preopen-verified";
    } catch (error) { this.#failed(); throw error; }
  }

  /** Consume normal closure once. The native owner retains uncertain runner
   * cleanup and chooses only its original cleanup-compatible request route. */
  async #close(): Promise<unknown> {
    const owner = this.#native(); need(!this.#closeAttempted, "CLOSE_CONSUMED"); this.#closeAttempted = true; this.#stage = "closing";
    const status = this.#methods.status.call(owner);
    if (!status.launchConsumed || status.noProcessCleanupAvailable) {
      this.#noProcessReleaseAttempted = true;
      const result = await (status.launchConsumed ? this.#methods.noProcess.call(owner) : this.#methods.unlaunched.call(owner));
      this.#current(); this.#noProcessReleased = this.#methods.releaseState.call(owner) === "released"; return result;
    }
    const window = await this.#methods.window.call(owner); this.#current(); need(window !== null, "CLOSE_WINDOW_MISSING");
    await this.#methods.close.call(owner, window); this.#current(); return Object.freeze({ closeDispatched: true, saveOrDiscardSelected: false });
  }

  /** Observe original no-process cleanup or retained root/whole-Job exit; a
   * missing acknowledgment cannot be replaced with a copied termination token. */
  async #observeTermination(): ReturnType<CurrentFootprintCopySavedExecutionNative["termination"]> {
    const owner = this.#native(); need(this.#closeAttempted, "CLOSE_REQUIRED");
    if (this.#noProcessReleaseAttempted && !this.#noProcessReleased) {
      this.#noProcessReleased = this.#methods.releaseState.call(owner) === "released";
      if (!this.#noProcessReleased) { return Object.freeze({ status: "pending" }); }
    }
    if (!this.#noProcessReleased && !await this.#methods.termination.call(owner)) { this.#current(); return Object.freeze({ status: "pending" }); }
    this.#current();
    if(!this.#noProcessReleased){this.#observersEnded??=this.#methods.endObservers.call(owner);await this.#observersEnded;}
    await Promise.allSettled(this.#normalPending);this.#current();
    const original = originalCurrentFootprintForwardWriterHeldSavedNativeTermination(owner);
    assertOriginalCurrentFootprintForwardWriterHeldSavedNativeTermination(owner, original); this.#termination = original; this.#stage = "closed";
    return Object.freeze({ status: "terminated", original });
  }

  /** Reprove the native issuer's retained exit reference throughout SQL/release. */
  #requireTermination(original: object): void {
    const owner = this.#native(); need(this.#termination !== null && original === this.#termination, "ORIGINAL_TERMINATION");
    assertOriginalCurrentFootprintForwardWriterHeldSavedNativeTermination(owner, original);
  }

  /** Capture complete closed SQL once, independently from in-memory cache samples. */
  async #snapshot(original: object): Promise<Inventory> {
    this.#requireTermination(original); need(!this.#snapshotAttempted, "SNAPSHOT_CONSUMED"); this.#snapshotAttempted = true;
    const result = await captureCurrentFootprintForwardWriterSavedClosedSnapshot(this.#native(), original); this.#requireTermination(original); this.#closedInventory = result; return result;
  }

  /** Consume this new generation's actual fixed saved-content transport while
   * it is live. A supplied packet/reader/callback cannot replace the held open. */
  public observeForwardSavedSource():Promise<CurrentFootprintCopyV2SavedReadPacket>{return this.#retain(()=>this.#observeForwardSavedSource());}
  async #observeForwardSavedSource(): Promise<CurrentFootprintCopyV2SavedReadPacket> {
    need(this.#opened !== null && this.#projection !== null && !this.#forwardReadAttempted, "FORWARD_READ_CONSUMED");
    this.#at("opened"); this.#forwardReadAttempted = true;
    const reader = new CurrentFootprintCopyV2SavedReadRunner(this.#opened.transport, this.#opened.state, this.#projection); this.#forwardReader = reader;
    try {
      const packet = await forwardReaderMethods.observe.call(reader); this.#forwardRead = packet; this.#at("opened");
      await forwardReaderMethods.require.call(reader, packet); this.#at("opened");
      this.#forwardReadQualified = true; return packet;
    } catch (error) { this.#failed(); throw error; }
  }
  /** New data checkpoint only after actual read/open/normal closure, complete
   * SQL invariance and acknowledged release. No old runtime authority transfers. */
  public async sealForwardSavedCheckpoint(): Promise<CurrentFootprintForwardWriterSavedCheckpoint> {
    this.#current();
    need(!this.#forwardCheckpointAttempted && this.#forwardReadQualified && this.#forwardReader !== null &&
      this.#forwardRead !== null && forwardReaderMethods.status.call(this.#forwardReader).phase === "completed" && this.#closedInventory !== null && this.#after !== null &&
      this.#termination !== null && this.#releaseAttempted && this.#observeRelease(this.#termination) === "released" && this.#replay !== null &&
      completed.get(this.#replay)?.pending.adapter === this, "FORWARD_CHECKPOINT_REQUIRED");
    need(this.#closedInventory !== this.#after && readerCompletion(this.#closedInventory) !== readerCompletion(this.#after), "INDEPENDENT_FORWARD_CLOSED_READER");
    this.#forwardCheckpointAttempted = true;
    await compareCompleteClosedSql(this.#after, this.#closedInventory); this.#current(); this.#requireTermination(this.#termination);
    need(this.#observeRelease(this.#termination) === "released", "FORWARD_RELEASE_REQUIRED");
    const token = Object.freeze({ profile: "private.current-footprint-forward-writer-saved-checkpoint.v1" as const });
    this.#forwardCheckpoint = token; forwardCheckpoints.set(token, this); this.requireForwardSavedCheckpoint(token); return token;
  }
  /** Historical exact-reference data lookup. Native ownership must be freshly
   * allocated for the inverse; these original closed resources stay closed. */
  public requireForwardSavedCheckpoint(token: CurrentFootprintForwardWriterSavedCheckpoint): Readonly<{
    writer: CurrentFootprintForwardWriterNativeOwner; owner: CurrentFootprintForwardWriterHeldSavedNativeOwner;
    writerAfter: Inventory; inventory: Inventory; projection: CurrentFootprintCopyV2SavedProjection;
    savedRead: CurrentFootprintCopyV2SavedReadPacket; paired: CurrentFootprintForwardWriterPairedObservation; snapshot: ReturnType<typeof requireCurrentFootprintForwardWriterSavedClosedSnapshot>;
  }> {
    this.#current(); need(token === this.#forwardCheckpoint && forwardCheckpoints.get(token) === this &&
      this.#after !== null && this.#closedInventory !== null && this.#projection !== null && this.#forwardRead !== null && this.#forwardReadQualified &&
      this.#termination !== null && this.#releaseAttempted && this.#observeRelease(this.#termination) === "released", "ORIGINAL_FORWARD_CHECKPOINT");
    const owner = this.#native(); this.#requireTermination(this.#termination);
    const snapshot = requireCurrentFootprintForwardWriterSavedClosedSnapshot(owner, this.#closedInventory);
    return Object.freeze({ writer: this.#writer.owner, owner, writerAfter: this.#after, inventory: this.#closedInventory,
      projection: this.#projection, savedRead: this.#forwardRead, paired: this.#writer.paired, snapshot });
  }

  /** Release the same terminated helper once. Lost acknowledgment stays consumed. */
  async #release(original: object): Promise<void> {
    this.#requireTermination(original); need(!this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true;
    if (!this.#noProcessReleased) {
      try { await this.#methods.release.call(this.#native()); }
      catch(caughtError) { this.#releaseFirstFailure=caughtError;throw caughtError; }
    }
    this.#requireTermination(original); this.#stage = "released";
  }

  public consumeReleasePreflightFailure(cause:unknown):CurrentFootprintForwardWriterReleasePreflightProof|null {
    this.#current();
    if(!this.#releaseAttempted||this.#noProcessReleased||cause!==this.#releaseFirstFailure||this.#releaseRetryAttempted||this.#releasePreflightProof!==null){return null;}
    const proof=this.#methods.preflight.call(this.#native(),cause);this.#releasePreflightProof=proof;return proof;
  }
  public async retryReleaseAfterPreflight(proof:CurrentFootprintForwardWriterReleasePreflightProof):Promise<void> {
    this.#current();const termination=this.#termination;
    need(termination!==null&&this.#releaseAttempted&&!this.#noProcessReleased&&!this.#releaseRetryAttempted&&proof===this.#releasePreflightProof,"ORIGINAL_RELEASE_PREFLIGHT");
    this.#requireTermination(termination);this.#releaseRetryAttempted=true;
    await this.#methods.retryRelease.call(this.#native(),proof);
    this.#requireTermination(termination);this.#stage="released";
  }

  /** Poll only the retained release result, without sending another command. */
  #observeRelease(original: object): "pending" | "released" {
    this.#requireTermination(original); need(this.#releaseAttempted, "RELEASE_NOT_ATTEMPTED");
    return this.#methods.releaseState.call(this.#native());
  }
}

/** Allocate only this full writer's original adapter. Native birth is later,
 * once its actual closed SQL projection has passed the disjoint factory. */
export async function createCurrentFootprintForwardWriterHeldSavedExecutionNative(writer:CurrentFootprintForwardWriterNativeOwner,paired:CurrentFootprintForwardWriterPairedObservation):Promise<CurrentFootprintCopySavedExecutionNative>{
 assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(writer);
 const pairedModule=await import("./current-footprint-forward-writer-paired-scheduler.ts");
 assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(writer);
 const verifyPaired=pairedModule.requireOriginalCurrentFootprintForwardWriterSavedContinuation;verifyPaired(paired,writer);
 const owner=new CurrentFootprintForwardWriterHeldSavedGeneration({owner:writer,paired,pairedModule,verifyPaired});const binding=owner.binding();forwardBindings.set(binding,owner);return binding;
}
export function observeCurrentFootprintForwardWriterHeldSavedSource(binding:CurrentFootprintCopySavedExecutionNative):Promise<CurrentFootprintCopyV2SavedReadPacket>{
 const owner=forwardBindings.get(binding);need(owner!==undefined,"ORIGINAL_FULL_BINDING");return owner.observeForwardSavedSource();
}
export function sealCurrentFootprintForwardWriterSavedCheckpoint(binding:CurrentFootprintCopySavedExecutionNative):Promise<CurrentFootprintForwardWriterSavedCheckpoint>{
 const owner=forwardBindings.get(binding);need(owner!==undefined,"ORIGINAL_FULL_BINDING");return owner.sealForwardSavedCheckpoint();
}
export function requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(token:CurrentFootprintForwardWriterSavedCheckpoint):ReturnType<CurrentFootprintForwardWriterHeldSavedGeneration["requireForwardSavedCheckpoint"]>{
 const owner=forwardCheckpoints.get(token);need(owner!==undefined,"ORIGINAL_FULL_CHECKPOINT");return owner.requireForwardSavedCheckpoint(token);
}
export async function verifyCurrentFootprintForwardWriterSavedCheckpoint(token:CurrentFootprintForwardWriterSavedCheckpoint):Promise<void>{
 const original=requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(token);await verifyCurrentFootprintForwardWriterSavedPosteditPreopenSource(original.owner,original.inventory);
 const current=requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(token);
 need(current.owner===original.owner&&current.writer===original.writer&&current.inventory===original.inventory&&current.snapshot===original.snapshot&&current.projection===original.projection&&current.savedRead===original.savedRead&&current.paired===original.paired,"FULL_CHECKPOINT_CHANGED");
}


/** Original Job abort only, with no new handle, signal or restart path. */
export function abortCurrentFootprintForwardWriterHeldSavedJob(binding:CurrentFootprintCopySavedExecutionNative):Promise<void>{
 const owner=forwardBindings.get(binding);need(owner!==undefined,"ORIGINAL_FULL_BINDING");return owner.abortOriginalJob();
}

/** Retained full-workflow binding only; historical/shared saved adapters cannot
 * manufacture the original owner's pre-native release proof. */
export function requireCurrentFootprintForwardWriterHeldSavedReleasePreflightFailure(binding:CurrentFootprintCopySavedExecutionNative,cause:unknown):CurrentFootprintForwardWriterReleasePreflightProof|null {
 const owner=forwardBindings.get(binding);need(owner!==undefined,"ORIGINAL_FULL_BINDING");return owner.consumeReleasePreflightFailure(cause);
}
export function retryCurrentFootprintForwardWriterHeldSavedReleaseAfterPreflight(binding:CurrentFootprintCopySavedExecutionNative,proof:CurrentFootprintForwardWriterReleasePreflightProof):Promise<void> {
 const owner=forwardBindings.get(binding);need(owner!==undefined,"ORIGINAL_FULL_BINDING");return owner.retryReleaseAfterPreflight(proof);
}
