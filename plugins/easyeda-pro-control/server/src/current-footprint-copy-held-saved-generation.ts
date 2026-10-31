/** Private staged saved opening with one original held cache tuple. Matching
 * metadata or injected callbacks cannot allocate this native generation. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import type { Inventory } from "./closed-sql-equality.ts";
// oxlint-disable-next-line import/no-cycle -- The original native issuer selects the snapshot; this adapter never reconstructs it from data.
import { captureCurrentFootprintCopyClosedSnapshot, requireCurrentFootprintCopyClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
// oxlint-disable-next-line import/no-cycle -- The guarded opener consumes the original predecessor's descriptor-bound bytes, not a supplied filename.
import { verifyCurrentFootprintCopyPosteditPreopenSource } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopyPreopenSourceObservation } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopySavedExecutionNative, CurrentFootprintCopySavedStartOutcome } from "./current-footprint-copy-execution-runtime.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "./current-footprint-saved-cache-held-runner.ts";
/* oxlint-disable import/no-cycle -- Only the genuine native factory can issue the retained owner used by this private adapter. */
import { CurrentFootprintCopyHeldSavedNativeOwner, assertOriginalCurrentFootprintCopyHeldSavedNativeOwner,
  assertOriginalCurrentFootprintCopyNativeOwner, assertOriginalCurrentFootprintCopyNativeTermination,
  currentFootprintCopyHeldSavedAllocationOutcome, originalCurrentFootprintCopyNativeTarget,
  originalCurrentFootprintCopyNativeTermination, startCurrentFootprintCopyHeldSavedNativeOwner } from "./current-pcb-diagnostic-owner.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintCopyNativeOwner } from "./current-pcb-diagnostic-owner.ts";

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
  readonly source: Readonly<CurrentFootprintCopyPreopenSourceObservation>;
}
const guards = new WeakMap<CurrentFootprintCopyHeldSavedOpenGuard, CurrentFootprintCopyHeldSavedGeneration>();
const witnesses = new WeakMap<object, PendingWitness>();
const completed = new WeakMap<object, CompletedWitness>();
const writers = new WeakSet<CurrentFootprintCopyNativeOwner>();
const names = { start: "startFootprintCopyHeldSavedGeneration", cache: "retainedFootprintCopyHeldSavedCache",
  requireCache: "requireOriginalFootprintCopyHeldSavedCache", prepare: "prepareFootprintCopyHeldSavedCache",
  first: "observeFirstFootprintCopyHeldSavedCache", fresh: "observeFreshFootprintCopyHeldSavedCache",
  releaseCache: "releaseFootprintCopyHeldSavedCache", open: "openFootprintCopyHeldSavedProject", window: "observeApplicationWindow",
  close: "requestNormalClose", termination: "observeTermination", status: "status", release: "releaseClosed",
  noProcess: "releaseNoProcess", unlaunched: "releaseUnlaunched", releaseState: "observeFootprintCopyRelease" } as const;
/* oxlint-disable typescript/unbound-method -- Captured methods are invoked only on the same registry-checked original private-field receiver. */
const runnerMethods = Object.freeze({ require: CurrentFootprintSavedCacheHeldRunner.prototype.requireOriginal,
  retained: CurrentFootprintSavedCacheHeldRunner.prototype.retained });
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
  readonly #writer: CurrentFootprintCopyNativeOwner;
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

  /** Accept only the original predecessor. Its factory, closed snapshot and
   * allocation registry remain the native authority boundary. */
  public constructor(writer: CurrentFootprintCopyNativeOwner) {
    assertOriginalCurrentFootprintCopyNativeOwner(writer);
    need(!writers.has(writer), "WRITER_CONSUMED"); writers.add(writer); this.#writer = writer;
  }

  /** Reprove original references and captured methods without a native request.
   * These checks establish custody, not fresh Windows or continuous cache state. */
  #current(): void {
    assertOriginalCurrentFootprintCopyNativeOwner(this.#writer);
    if (this.#after !== null) { requireCurrentFootprintCopyClosedSnapshot(this.#writer, this.#after); }
    if (this.#projection !== null) {
      need(canonicalJson(this.#projection) === this.#projectionText, "PROJECTION_CHANGED");
      const origin = originalCurrentFootprintCopyNativeTarget(this.#writer), target = currentFootprintCopyV2SavedTarget(this.#projection);
      need(target.projectUuid === origin.target.projectUuid && target.branchUuid === origin.target.branchUuid &&
        this.#projection.afterSqlSha256 === this.#after?.logicalSha256, "ORIGINAL_PROJECTION");
    }
    if (this.#owner !== null) {
      const owner = this.#owner; assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner);
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
      const snapshot = requireCurrentFootprintCopyClosedSnapshot(this.#writer, after);
      currentFootprintCopyV2SavedTarget(projection);
      this.#projection = projection; this.#projectionText = canonicalJson(projection); this.#after = after; this.#current();
      allocationAttempted = true;
      const owner = await startCurrentFootprintCopyHeldSavedNativeOwner(this.#writer, after);
      this.#owner = owner; this.#startOutcome = "retained"; this.#at("starting");
      const origin = originalCurrentFootprintCopyNativeTarget(owner);
      need(origin.checkpoint === snapshot.checkpoint && origin.source === snapshot.checkpoint.source, "SAVED_POSTEDIT_BINDING");
      await this.#methods.start.call(owner); this.#at("starting");
      const saved = this.#methods.status.call(owner).binding, writer = this.#methods.status.call(this.#writer).binding;
      need(writer !== null && saved !== null && writer.jobId !== saved.jobId && writer.helperInstance !== saved.helperInstance,
        "FRESH_NATIVE_GENERATION"); this.#stage = "started";
    } catch (error) {
      if (allocationAttempted) {
        const outcome = currentFootprintCopyHeldSavedAllocationOutcome(this.#writer);
        this.#owner = outcome.owner; this.#startOutcome = outcome.status === "not-attempted" ? "unresolved" : outcome.status;
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
      need(this.#guardCompleted && completed.get(replay)?.pending === pending, "OPEN_GUARD_NOT_COMPLETED"); this.#stage = "opened"; return result;
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
      const source = await verifyCurrentFootprintCopyPosteditPreopenSource(this.#writer, this.#after); this.#at("group-released");
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
    const result = await captureCurrentFootprintCopyClosedSnapshot(this.#native(), original); this.#requireTermination(original); return result;
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
  return new CurrentFootprintCopyHeldSavedGeneration(writer).binding();
}
