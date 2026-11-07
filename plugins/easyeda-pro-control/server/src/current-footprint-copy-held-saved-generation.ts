/** Private staged saved opening with one original held cache tuple. Matching
 * metadata or injected callbacks cannot allocate this native generation. */
/* oxlint-disable import/max-dependencies -- This original adapter joins independent native ownership, raw-file reproof, full SQL, actual reader completion and fixed held-cache/readback collectors; caller providers cannot replace these boundaries. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
// oxlint-disable-next-line import/no-cycle -- The original native issuer selects the snapshot; this adapter never reconstructs it from data.
import { captureCurrentFootprintCopyClosedSnapshot, requireCurrentFootprintCopyClosedSnapshot, requireCurrentFootprintForwardExecutionClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
// oxlint-disable-next-line import/no-cycle -- The guarded opener consumes the original predecessor's descriptor-bound bytes, not a supplied filename.
import { verifyCurrentFootprintCopyPosteditPreopenSource, verifyCurrentFootprintForwardExecutionPosteditPreopenSource } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopyPreopenSourceObservation, CurrentFootprintForwardExecutionPreopenSourceObservation } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopySavedExecutionNative, CurrentFootprintCopySavedStartOutcome } from "./current-footprint-copy-execution-runtime.ts";
import { CurrentFootprintCopyV2SavedReadRunner } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintCopyV2SavedReadPacket } from "./current-footprint-copy-v2-saved-read-runner.ts";
import type { CurrentFootprintForwardExecutionPairedObservation, requireOriginalCurrentFootprintForwardSavedContinuation } from "./current-footprint-forward-paired-scheduler.ts";
import { currentFootprintCopyV2SavedSqlSource, currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { decodeCurrentFootprintCopyV2NativeResult } from "./current-footprint-copy-v2-native-result.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "./current-footprint-saved-cache-held-runner.ts";
/* oxlint-disable import/no-cycle -- Only the genuine native factory can issue the retained owner used by this private adapter. */
import { CurrentFootprintCopyHeldSavedNativeOwner, assertOriginalCurrentFootprintCopyHeldSavedNativeOwner,
  assertOriginalCurrentFootprintCopyNativeOwner, assertOriginalCurrentFootprintCopyNativeTermination, assertOriginalCurrentFootprintForwardExecutionNativeOwner,
  currentFootprintCopyHeldSavedAllocationOutcome, currentFootprintForwardHeldSavedAllocationOutcome, originalCurrentFootprintCopyNativeTarget, originalCurrentFootprintCopyNativeTermination,
  originalCurrentFootprintForwardExecutionNativeTarget, requireOriginalCurrentFootprintForwardHeldSavedOwner, requireOriginalCurrentFootprintForwardSavedProjection, startCurrentFootprintCopyHeldSavedNativeOwner, startCurrentFootprintForwardHeldSavedNativeOwner } from "./current-pcb-diagnostic-owner.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintCopyNativeOwner, CurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";

export interface CurrentFootprintCopyHeldSavedOpenGuard { readonly profile: "private.current-footprint-copy-held-saved-open-guard.v1" }
type Stage = "new" | "starting" | "started" | "first-observing" | "first-held" | "opening" | "fresh-observing" |
  "fresh-held" | "group-released" | "preopen-verified" | "opened" | "failed" | "closing" | "closed" | "released";
interface PendingWitness {
  readonly adapter: CurrentFootprintCopyHeldSavedGeneration;
  readonly owner: CurrentFootprintCopyHeldSavedNativeOwner;
  readonly runner: CurrentFootprintSavedCacheHeldRunner;
  readonly first: CurrentFootprintSavedCacheHeldObservation;
}
interface CompletedWitness {
  readonly pending: PendingWitness;
  readonly fresh: CurrentFootprintSavedCacheHeldObservation;
  readonly source: Readonly<CurrentFootprintCopyPreopenSourceObservation | CurrentFootprintForwardExecutionPreopenSourceObservation>;
}
const guards = new WeakMap<CurrentFootprintCopyHeldSavedOpenGuard, CurrentFootprintCopyHeldSavedGeneration>();
const witnesses = new WeakMap<object, PendingWitness>();
const completed = new WeakMap<object, CompletedWitness>();
const writers = new WeakSet<object>();
const forwardBindings = new WeakMap<CurrentFootprintCopySavedExecutionNative, CurrentFootprintCopyHeldSavedGeneration>();
export interface CurrentFootprintForwardSavedCheckpoint { readonly profile: "private.current-footprint-forward-saved-checkpoint.v1" }
const forwardCheckpoints = new WeakMap<CurrentFootprintForwardSavedCheckpoint, CurrentFootprintCopyHeldSavedGeneration>();
type PairedModule = Readonly<{ requireOriginalCurrentFootprintForwardSavedContinuation: typeof requireOriginalCurrentFootprintForwardSavedContinuation }>;
type Predecessor = Readonly<{ kind: "copy"; owner: CurrentFootprintCopyNativeOwner }> | Readonly<{ kind: "forward-execution"; owner: CurrentFootprintForwardExecutionNativeOwner; paired: CurrentFootprintForwardExecutionPairedObservation; pairedModule: PairedModule; verifyPaired: PairedModule["requireOriginalCurrentFootprintForwardSavedContinuation"] }>;
const names = { start: "startFootprintCopyHeldSavedGeneration", cache: "retainedFootprintCopyHeldSavedCache",
  requireCache: "requireOriginalFootprintCopyHeldSavedCache", prepare: "prepareFootprintCopyHeldSavedCache",
  first: "observeFirstFootprintCopyHeldSavedCache", fresh: "observeFreshFootprintCopyHeldSavedCache",
  releaseCache: "releaseFootprintCopyHeldSavedCache", open: "openFootprintCopyHeldSavedProject", window: "observeApplicationWindow",
  close: "requestNormalClose", termination: "observeTermination", status: "status", release: "releaseClosed",
  noProcess: "releaseNoProcess", unlaunched: "releaseUnlaunched", releaseState: "observeFootprintCopyRelease" } as const;
/* oxlint-disable typescript/unbound-method -- Captured methods are invoked only on the same registry-checked original private-field receiver. */
const runnerMethods = Object.freeze({ require: CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal,
  retained: CurrentFootprintSavedCacheHeldRunner.prototype.retained });
const forwardReaderMethods = Object.freeze({ observe: CurrentFootprintCopyV2SavedReadRunner.prototype.observe,
  require: CurrentFootprintCopyV2SavedReadRunner.prototype.requireOriginal, status: CurrentFootprintCopyV2SavedReadRunner.prototype.status });
type NativeMethods = { readonly [Key in keyof typeof names]: CurrentFootprintCopyHeldSavedNativeOwner[typeof names[Key]] };
/** Retain the fixed native methods before allocating or launching a helper. */
function nativeMethods(): NativeMethods {
  return Object.freeze({ start: CurrentFootprintCopyHeldSavedNativeOwner.prototype.startFootprintCopyHeldSavedGeneration,
    cache: CurrentFootprintCopyHeldSavedNativeOwner.prototype.retainedFootprintCopyHeldSavedCache,
    requireCache: CurrentFootprintCopyHeldSavedNativeOwner.prototype.requireOriginalFootprintCopyHeldSavedCache,
    prepare: CurrentFootprintCopyHeldSavedNativeOwner.prototype.prepareFootprintCopyHeldSavedCache,
    first: CurrentFootprintCopyHeldSavedNativeOwner.prototype.observeFirstFootprintCopyHeldSavedCache,
    fresh: CurrentFootprintCopyHeldSavedNativeOwner.prototype.observeFreshFootprintCopyHeldSavedCache,
    releaseCache: CurrentFootprintCopyHeldSavedNativeOwner.prototype.releaseFootprintCopyHeldSavedCache,
    open: CurrentFootprintCopyHeldSavedNativeOwner.prototype.openFootprintCopyHeldSavedProject,
    window: CurrentFootprintCopyHeldSavedNativeOwner.prototype.observeApplicationWindow,
    close: CurrentFootprintCopyHeldSavedNativeOwner.prototype.requestNormalClose,
    termination: CurrentFootprintCopyHeldSavedNativeOwner.prototype.observeTermination,
    status: CurrentFootprintCopyHeldSavedNativeOwner.prototype.status,
    release: CurrentFootprintCopyHeldSavedNativeOwner.prototype.releaseClosed,
    noProcess: CurrentFootprintCopyHeldSavedNativeOwner.prototype.releaseNoProcess,
    unlaunched: CurrentFootprintCopyHeldSavedNativeOwner.prototype.releaseUnlaunched,
    releaseState: CurrentFootprintCopyHeldSavedNativeOwner.prototype.observeFootprintCopyRelease });
}
/* oxlint-enable typescript/unbound-method */

/** Refuse a consumed or substituted original without exposing private replies. */
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_HELD_SAVED_GENERATION_${detail}`); }
}

/** The fixed native opener calls this after preflight and worker arming, directly
 * before its sole open. A copied guard cannot reach an adapter or native stage. */
export async function revalidateCurrentFootprintCopyHeldSavedOpenGuard(owner: CurrentFootprintCopyHeldSavedNativeOwner,
  guard: CurrentFootprintCopyHeldSavedOpenGuard): Promise<void> {
  const adapter = guards.get(guard); need(adapter !== undefined, "ORIGINAL_OPEN_GUARD");
  await adapter.beforeOpen(owner, guard);
}

class CurrentFootprintCopyHeldSavedGeneration {
  readonly #writer: Predecessor;
  readonly #methods = nativeMethods();
  readonly #generation = Object.freeze({});
  #owner: CurrentFootprintCopyHeldSavedNativeOwner | null = null;
  #projection: CurrentFootprintCopyV2SavedProjection | null = null;
  #projectionText: string | null = null;
  #after: Inventory | null = null;
  #runner: CurrentFootprintSavedCacheHeldRunner | null = null;
  #stage: Stage = "new";
  #startOutcome: CurrentFootprintCopySavedStartOutcome = "not-started";
  #replay: object | null = null;
  #guard: CurrentFootprintCopyHeldSavedOpenGuard | null = null;
  #guardAttempted = false;
  #guardCompleted = false;
  #closeAttempted = false;
  #termination: object | null = null;
  #snapshotAttempted = false;
  #releaseAttempted = false;
  #noProcessReleased = false;
  #noProcessReleaseAttempted = false;
  #opened: Awaited<ReturnType<CurrentFootprintCopySavedExecutionNative["open"]>> | null = null;
  #closedInventory: Inventory | null = null;
  #forwardReadAttempted = false;
  #forwardReader: CurrentFootprintCopyV2SavedReadRunner | null = null;
  #forwardRead: CurrentFootprintCopyV2SavedReadPacket | null = null;
  #forwardReadQualified = false;
  #forwardCheckpointAttempted = false;
  #forwardCheckpoint: CurrentFootprintForwardSavedCheckpoint | null = null;

  /** Accept only the original predecessor. Its factory, closed snapshot and
   * allocation registry remain the native authority boundary. */
  public constructor(writer: Predecessor) {
    if (writer.kind === "copy") { assertOriginalCurrentFootprintCopyNativeOwner(writer.owner); }
    else { assertOriginalCurrentFootprintForwardExecutionNativeOwner(writer.owner); need(writer.pairedModule.requireOriginalCurrentFootprintForwardSavedContinuation === writer.verifyPaired, "ORIGINAL_PAIRED_MODULE"); writer.verifyPaired(writer.paired, writer.owner); }
    need(!writers.has(writer.owner), "WRITER_CONSUMED"); writers.add(writer.owner); this.#writer = Object.freeze(writer);
  }
  #parentSnapshot(after: Inventory): ReturnType<typeof requireCurrentFootprintCopyClosedSnapshot> {
    return this.#writer.kind === "copy" ? requireCurrentFootprintCopyClosedSnapshot(this.#writer.owner, after) : requireCurrentFootprintForwardExecutionClosedSnapshot(this.#writer.owner, after);
  }
  #parentTarget(): ReturnType<typeof originalCurrentFootprintCopyNativeTarget> {
    return this.#writer.kind === "copy" ? originalCurrentFootprintCopyNativeTarget(this.#writer.owner) : originalCurrentFootprintForwardExecutionNativeTarget(this.#writer.owner);
  }

  #requireForwardProjection(projection: CurrentFootprintCopyV2SavedProjection, after: Inventory): void {
    need(this.#writer.kind === "forward-execution", "ORIGINAL_FORWARD_PREDECESSOR");
    requireOriginalCurrentFootprintForwardSavedProjection(this.#writer.owner, projection, after);
    const paired = this.#writer.paired, source = currentFootprintCopyV2SavedSqlSource(projection).source;
    const observed = decodeCurrentFootprintCopyV2NativeResult(source.copyPlan, paired.serializedCreateResult), samples = paired.clocks.samples;
    need(observed.returnedUuid === projection.targetUuid && samples.length === 2 && samples[0]?.ordinal === 1 && samples[1]?.ordinal === 2 &&
      samples[0].documentUuid === observed.returnedUuid && samples[1].documentUuid === observed.returnedUuid &&
      samples[0].updateTime === source.documentClocks[0] && samples[1].updateTime === source.documentClocks[1] &&
      observed.envelope.result["createTime"] === source.documentClocks[0] && observed.envelope.result["updateTime"] === source.documentClocks[1], "ORIGINAL_CREATED_SQL_TARGET");
  }
  /** Reprove original references and captured methods without a native request.
   * These checks establish custody, not fresh Windows or continuous cache state. */
  #current(): void {
    if (this.#writer.kind === "copy") { assertOriginalCurrentFootprintCopyNativeOwner(this.#writer.owner); }
    else { assertOriginalCurrentFootprintForwardExecutionNativeOwner(this.#writer.owner); need(this.#writer.pairedModule.requireOriginalCurrentFootprintForwardSavedContinuation === this.#writer.verifyPaired, "ORIGINAL_PAIRED_MODULE"); this.#writer.verifyPaired(this.#writer.paired, this.#writer.owner); }
    if (this.#after !== null) { this.#parentSnapshot(this.#after); }
    if (this.#projection !== null) {
      if (this.#writer.kind === "forward-execution") { need(this.#after !== null, "ORIGINAL_FORWARD_SNAPSHOT"); this.#requireForwardProjection(this.#projection, this.#after); }
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
      const owner = this.#owner; assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner);
      if (this.#writer.kind === "forward-execution") { need(this.#after !== null, "ORIGINAL_FORWARD_SNAPSHOT"); requireOriginalCurrentFootprintForwardHeldSavedOwner(owner, this.#writer.owner, this.#after); }
      need(Object.getPrototypeOf(owner) === CurrentFootprintCopyHeldSavedNativeOwner.prototype && Reflect.ownKeys(owner).length === 0,
        "ORIGINAL_NATIVE_OWNER");
      for (const key of ["start", "cache", "requireCache", "prepare", "first", "fresh", "releaseCache", "open", "window", "close",
        "termination", "status", "release", "noProcess", "unlaunched", "releaseState"] as const) {
        need(owner[names[key]] === this.#methods[key] && CurrentFootprintCopyHeldSavedNativeOwner.prototype[names[key]] === this.#methods[key],
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
  #native(): CurrentFootprintCopyHeldSavedNativeOwner {
    this.#current(); need(this.#owner !== null, "NATIVE_OWNER_NOT_ALLOCATED"); return this.#owner;
  }

  /** Keep all normal stages on the same unclosed owner and exact expected stage. */
  #at(stage: Stage): CurrentFootprintCopyHeldSavedNativeOwner {
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

  /** Expose only the existing fixed execution binding. Constructor callbacks and
   * runner inputs cannot be supplied through this data-free native interface. */
  public binding(): CurrentFootprintCopySavedExecutionNative {
    return Object.freeze<CurrentFootprintCopySavedExecutionNative>({ generation: this.#generation, assertOwned: (): void => { this.#current(); },
      start: (projection, after): Promise<void> => this.#start(projection, after),
      startOutcome: (): CurrentFootprintCopySavedStartOutcome => { this.#current(); return this.#startOutcome; },
      excludeReplay: (): Promise<object> => this.#excludeReplay(),
      requireReplayExclusion: (original): Promise<void> => { this.#requireReplay(original); return Promise.resolve(); },
      open: (projection, after, replay) => this.#open(projection, after, replay), close: (): Promise<unknown> => this.#close(),
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
      if (this.#writer.kind === "forward-execution") { this.#requireForwardProjection(projection, after); }
      this.#projection = projection; this.#projectionText = canonicalJson(projection); this.#after = after; this.#current();
      allocationAttempted = true;
      const owner = await (this.#writer.kind === "copy" ? startCurrentFootprintCopyHeldSavedNativeOwner(this.#writer.owner, after) : startCurrentFootprintForwardHeldSavedNativeOwner(this.#writer.owner, after));
      this.#owner = owner; this.#startOutcome = "retained"; this.#at("starting");
      const origin = originalCurrentFootprintCopyNativeTarget(owner);
      need(origin.checkpoint === snapshot.checkpoint && origin.source === snapshot.checkpoint.source, "SAVED_POSTEDIT_BINDING");
      await this.#methods.start.call(owner); this.#at("starting");
      const saved = this.#methods.status.call(owner).binding, writer = this.#methods.status.call(this.#writer.owner).binding;
      need(writer !== null && saved !== null && writer.jobId !== saved.jobId && writer.helperInstance !== saved.helperInstance,
        "FRESH_NATIVE_GENERATION"); this.#stage = "started";
    } catch (error) {
      if (allocationAttempted) {
        const outcome = this.#writer.kind === "copy" ? currentFootprintCopyHeldSavedAllocationOutcome(this.#writer.owner) : currentFootprintForwardHeldSavedAllocationOutcome(this.#writer.owner);
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
    this.#guard = Object.freeze({ profile: "private.current-footprint-copy-held-saved-open-guard.v1" }); guards.set(this.#guard, this);
    try {
      const result = await this.#methods.open.call(pending.owner, projection, this.#guard); this.#at("preopen-verified");
      need(this.#guardCompleted && completed.get(replay)?.pending === pending, "OPEN_GUARD_NOT_COMPLETED"); this.#opened = result; this.#stage = "opened"; return result;
    } catch (error) { this.#failed(); throw error; }
  }

  /** Refresh on the original tuple after native preflight, acknowledge its one
   * release, then verify original post-edit bytes. Completion retains custody
   * after release without calling requireOriginal on a released runner. */
  public async beforeOpen(owner: CurrentFootprintCopyHeldSavedNativeOwner, guard: CurrentFootprintCopyHeldSavedOpenGuard): Promise<void> {
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
      const source = await (this.#writer.kind === "copy" ? verifyCurrentFootprintCopyPosteditPreopenSource(this.#writer.owner, this.#after) : verifyCurrentFootprintForwardExecutionPosteditPreopenSource(this.#writer.owner, this.#after)); this.#at("group-released");
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
    this.#current(); const original = originalCurrentFootprintCopyNativeTermination(owner);
    assertOriginalCurrentFootprintCopyNativeTermination(owner, original); this.#termination = original; this.#stage = "closed";
    return Object.freeze({ status: "terminated", original });
  }

  /** Reprove the native issuer's retained exit reference throughout SQL/release. */
  #requireTermination(original: object): void {
    const owner = this.#native(); need(this.#termination !== null && original === this.#termination, "ORIGINAL_TERMINATION");
    assertOriginalCurrentFootprintCopyNativeTermination(owner, original);
  }

  /** Capture complete closed SQL once, independently from in-memory cache samples. */
  async #snapshot(original: object): Promise<Inventory> {
    this.#requireTermination(original); need(!this.#snapshotAttempted, "SNAPSHOT_CONSUMED"); this.#snapshotAttempted = true;
    const result = await captureCurrentFootprintCopyClosedSnapshot(this.#native(), original); this.#requireTermination(original); this.#closedInventory = result; return result;
  }

  /** Consume this new generation's actual fixed saved-content transport while
   * it is live. A supplied packet/reader/callback cannot replace the held open. */
  public async observeForwardSavedSource(): Promise<CurrentFootprintCopyV2SavedReadPacket> {
    need(this.#writer.kind === "forward-execution" && this.#opened !== null && this.#projection !== null && !this.#forwardReadAttempted, "FORWARD_READ_CONSUMED");
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
  public async sealForwardSavedCheckpoint(): Promise<CurrentFootprintForwardSavedCheckpoint> {
    this.#current();
    need(this.#writer.kind === "forward-execution" && !this.#forwardCheckpointAttempted && this.#forwardReadQualified && this.#forwardReader !== null &&
      this.#forwardRead !== null && forwardReaderMethods.status.call(this.#forwardReader).phase === "completed" && this.#closedInventory !== null && this.#after !== null &&
      this.#termination !== null && this.#releaseAttempted && this.#observeRelease(this.#termination) === "released" && this.#replay !== null &&
      completed.get(this.#replay)?.pending.adapter === this, "FORWARD_CHECKPOINT_REQUIRED");
    need(this.#closedInventory !== this.#after && readerCompletion(this.#closedInventory) !== readerCompletion(this.#after), "INDEPENDENT_FORWARD_CLOSED_READER");
    this.#forwardCheckpointAttempted = true;
    await compareCompleteClosedSql(this.#after, this.#closedInventory); this.#current(); this.#requireTermination(this.#termination);
    need(this.#observeRelease(this.#termination) === "released", "FORWARD_RELEASE_REQUIRED");
    const token = Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" as const });
    this.#forwardCheckpoint = token; forwardCheckpoints.set(token, this); this.requireForwardSavedCheckpoint(token); return token;
  }
  /** Historical exact-reference data lookup. Native ownership must be freshly
   * allocated for the inverse; these original closed resources stay closed. */
  public requireForwardSavedCheckpoint(token: CurrentFootprintForwardSavedCheckpoint): Readonly<{
    writer: CurrentFootprintForwardExecutionNativeOwner; owner: CurrentFootprintCopyHeldSavedNativeOwner;
    writerAfter: Inventory; inventory: Inventory; projection: CurrentFootprintCopyV2SavedProjection;
    savedRead: CurrentFootprintCopyV2SavedReadPacket; paired: CurrentFootprintForwardExecutionPairedObservation; snapshot: ReturnType<typeof requireCurrentFootprintCopyClosedSnapshot>;
  }> {
    this.#current(); need(this.#writer.kind === "forward-execution" && token === this.#forwardCheckpoint && forwardCheckpoints.get(token) === this &&
      this.#after !== null && this.#closedInventory !== null && this.#projection !== null && this.#forwardRead !== null && this.#forwardReadQualified &&
      this.#termination !== null && this.#releaseAttempted && this.#observeRelease(this.#termination) === "released", "ORIGINAL_FORWARD_CHECKPOINT");
    const owner = this.#native(); this.#requireTermination(this.#termination);
    const snapshot = requireCurrentFootprintCopyClosedSnapshot(owner, this.#closedInventory);
    return Object.freeze({ writer: this.#writer.owner, owner, writerAfter: this.#after, inventory: this.#closedInventory,
      projection: this.#projection, savedRead: this.#forwardRead, paired: this.#writer.paired, snapshot });
  }

  /** Release the same terminated helper once. Lost acknowledgment stays consumed. */
  async #release(original: object): Promise<void> {
    this.#requireTermination(original); need(!this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true;
    if (!this.#noProcessReleased) { await this.#methods.release.call(this.#native()); }
    this.#requireTermination(original); this.#stage = "released";
  }

  /** Poll only the retained release result, without sending another command. */
  #observeRelease(original: object): "pending" | "released" {
    this.#requireTermination(original); need(this.#releaseAttempted, "RELEASE_NOT_ATTEMPTED");
    return this.#methods.releaseState.call(this.#native());
  }
}

/** Pure adapter allocation. The original native factory still must issue and
 * retain a distinct held-purpose owner before any helper/application launch. */
export function createCurrentFootprintCopyHeldSavedExecutionNative(writer: CurrentFootprintCopyNativeOwner): CurrentFootprintCopySavedExecutionNative {
  return new CurrentFootprintCopyHeldSavedGeneration({ kind: "copy", owner: writer }).binding();
}

/** New original readonly saved adapter. The predecessor is a genuine v2 writer;
 * this never upgrades an old held/saved owner or accepts supplied callbacks. */
export async function createCurrentFootprintForwardHeldSavedExecutionNative(writer: CurrentFootprintForwardExecutionNativeOwner, paired: CurrentFootprintForwardExecutionPairedObservation): Promise<CurrentFootprintCopySavedExecutionNative> {
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(writer);
  const pairedModule = await import("./current-footprint-forward-paired-scheduler.ts");
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(writer);
  const verifyPaired = pairedModule.requireOriginalCurrentFootprintForwardSavedContinuation; verifyPaired(paired, writer);
  const owner = new CurrentFootprintCopyHeldSavedGeneration({ kind: "forward-execution", owner: writer, paired, pairedModule, verifyPaired });
  const binding = owner.binding();
  forwardBindings.set(binding, owner); return binding;
}

/** No caller content or reader can be injected into this genuine binding. */
export function observeCurrentFootprintForwardHeldSavedSource(binding: CurrentFootprintCopySavedExecutionNative): Promise<CurrentFootprintCopyV2SavedReadPacket> {
  const owner = forwardBindings.get(binding); need(owner !== undefined, "ORIGINAL_FORWARD_BINDING"); return owner.observeForwardSavedSource();
}
export function sealCurrentFootprintForwardSavedCheckpoint(binding: CurrentFootprintCopySavedExecutionNative): Promise<CurrentFootprintForwardSavedCheckpoint> {
  const owner = forwardBindings.get(binding); need(owner !== undefined, "ORIGINAL_FORWARD_BINDING"); return owner.sealForwardSavedCheckpoint();
}
export function requireOriginalCurrentFootprintForwardSavedCheckpoint(token: CurrentFootprintForwardSavedCheckpoint): ReturnType<CurrentFootprintCopyHeldSavedGeneration["requireForwardSavedCheckpoint"]> {
  const owner = forwardCheckpoints.get(token); need(owner !== undefined, "ORIGINAL_FORWARD_CHECKPOINT"); return owner.requireForwardSavedCheckpoint(token);
}
/** Fresh complete raw-byte reproof from the checkpoint's actual closed owner.
 * Caller paths, JSON receipts and old owner reconstruction are not admitted. */
export async function verifyCurrentFootprintForwardSavedCheckpoint(token: CurrentFootprintForwardSavedCheckpoint): Promise<void> {
  const original = requireOriginalCurrentFootprintForwardSavedCheckpoint(token);
  await verifyCurrentFootprintCopyPosteditPreopenSource(original.owner, original.inventory);
  const current = requireOriginalCurrentFootprintForwardSavedCheckpoint(token);
  need(current.owner === original.owner && current.writer === original.writer && current.inventory === original.inventory && current.snapshot === original.snapshot &&
    current.projection === original.projection && current.savedRead === original.savedRead && current.paired === original.paired, "FORWARD_CHECKPOINT_CHANGED");
}
