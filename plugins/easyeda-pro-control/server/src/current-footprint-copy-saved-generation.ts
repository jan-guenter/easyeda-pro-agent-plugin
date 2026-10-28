/** Fresh footprint saved generation. Allocation precedes native launch; only
 * the writer's retained closed snapshot can supply the destination and file. */
import { canonicalJson } from "./core.ts";
import type { Inventory } from "./closed-sql-equality.ts";
// oxlint-disable-next-line import/no-cycle -- These deferred calls retain the native issuer and original snapshot; no authority is reconstructed to break the ownership cycle.
import { captureCurrentFootprintCopyClosedSnapshot, requireCurrentFootprintCopyClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
// oxlint-disable-next-line import/no-cycle -- These deferred calls retain the native issuer and original snapshot; no authority is reconstructed to break the ownership cycle.
import { verifyCurrentFootprintCopyPosteditPreopenSource } from "./current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopySavedExecutionNative } from "./current-footprint-copy-execution-runtime.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
// oxlint-disable-next-line import/no-cycle -- These deferred calls retain the native issuer and original snapshot; no authority is reconstructed to break the ownership cycle.
import { CurrentFootprintCopySavedNativeOwner, assertOriginalCurrentFootprintCopyNativeOwner, assertOriginalCurrentFootprintCopyNativeTermination, originalCurrentFootprintCopyNativeTarget, originalCurrentFootprintCopyNativeTermination, retainedCurrentFootprintCopySavedAllocation, startCurrentFootprintCopySavedNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateCurrentUploadQueueReadResult } from "./current-upload-queue-read.ts";

export interface CurrentFootprintCopySavedOpenGuard { readonly profile: "private.current-footprint-copy-saved-open-guard.v1" }
const guards = new WeakMap<CurrentFootprintCopySavedOpenGuard, CurrentFootprintCopySavedGeneration>();
/* oxlint-disable typescript/unbound-method -- Invoke only with the genuine original saved native receiver; recheck both instance and prototype before use. */
type NativeMethods = { readonly [Key in keyof typeof names]: CurrentFootprintCopySavedNativeOwner[typeof names[Key]] };
function nativeMethods(): NativeMethods { return Object.freeze({
  start: CurrentFootprintCopySavedNativeOwner.prototype.startFootprintCopySavedGeneration,
  queue: CurrentFootprintCopySavedNativeOwner.prototype.observeFootprintCopyUploadQueue,
  open: CurrentFootprintCopySavedNativeOwner.prototype.openFootprintCopySavedProject,
  window: CurrentFootprintCopySavedNativeOwner.prototype.observeApplicationWindow,
  close: CurrentFootprintCopySavedNativeOwner.prototype.requestNormalClose,
  termination: CurrentFootprintCopySavedNativeOwner.prototype.observeTermination,
  status: CurrentFootprintCopySavedNativeOwner.prototype.status,
  release: CurrentFootprintCopySavedNativeOwner.prototype.releaseClosed,
  noProcess: CurrentFootprintCopySavedNativeOwner.prototype.releaseNoProcess,
  unlaunched: CurrentFootprintCopySavedNativeOwner.prototype.releaseUnlaunched,
  releaseState: CurrentFootprintCopySavedNativeOwner.prototype.observeFootprintCopyRelease,
}); }
/* oxlint-enable typescript/unbound-method */
const names = { start: "startFootprintCopySavedGeneration", queue: "observeFootprintCopyUploadQueue", open: "openFootprintCopySavedProject",
  window: "observeApplicationWindow", close: "requestNormalClose", termination: "observeTermination", status: "status", release: "releaseClosed", noProcess: "releaseNoProcess", unlaunched: "releaseUnlaunched", releaseState: "observeFootprintCopyRelease" } as const;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_SAVED_GENERATION_${detail}`); }
}
/** Called by the fixed native opener after its preflight and immediately before
 * its sole open request. Neither a copied guard nor a caller function is valid. */
export async function revalidateCurrentFootprintCopySavedOpenGuard(owner: CurrentFootprintCopySavedNativeOwner,
  guard: CurrentFootprintCopySavedOpenGuard): Promise<void> {
  const held = guards.get(guard); need(held !== undefined, "ORIGINAL_OPEN_GUARD");
  await held.beforeOpen(owner, guard);
}
class CurrentFootprintCopySavedGeneration {
  readonly #writer: CurrentFootprintCopyNativeOwner;
  readonly #methods = nativeMethods();
  readonly #generation = Object.freeze({});
  #owner: CurrentFootprintCopySavedNativeOwner | null = null;
  #projection: CurrentFootprintCopyV2SavedProjection | null = null;
  #projectionText: string | null = null;
  #after: Inventory | null = null;
  #startAttempted = false;
  #started = false;
  #exclusionAttempted = false;
  #replay: object | null = null;
  #guard: CurrentFootprintCopySavedOpenGuard | null = null;
  #guardAttempted = false;
  #guardCompleted = false;
  #openAttempted = false;
  #closeAttempted = false;
  #termination: object | null = null;
  #snapshotAttempted = false;
  #releaseAttempted = false;
  #noProcessReleased = false;
  readonly #rawQueues: unknown[] = [];
  public constructor(writer: CurrentFootprintCopyNativeOwner) {
    assertOriginalCurrentFootprintCopyNativeOwner(writer); this.#writer = writer;
  }
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
      const owner = this.#owner; assertOriginalCurrentFootprintCopyNativeOwner(owner);
      need(Object.getPrototypeOf(owner) === CurrentFootprintCopySavedNativeOwner.prototype && Reflect.ownKeys(owner).length === 0,
        "ORIGINAL_NATIVE_OWNER");
      for (const key of ["start", "queue", "open", "window", "close", "termination", "status", "release", "noProcess", "unlaunched", "releaseState"] as const) {
        need(owner[names[key]] === this.#methods[key] && CurrentFootprintCopySavedNativeOwner.prototype[names[key]] === this.#methods[key], "NATIVE_METHOD_CHANGED");
      }
    }
  }
  #native(): CurrentFootprintCopySavedNativeOwner {
    this.#current(); need(this.#owner !== null, "NATIVE_OWNER_NOT_ALLOCATED"); return this.#owner;
  }
  #live(): CurrentFootprintCopySavedNativeOwner {
    const owner = this.#native();
    need(this.#started && !this.#closeAttempted && this.#termination === null && !this.#releaseAttempted, "LIVE_GENERATION_REQUIRED"); return owner;
  }
  public binding(): CurrentFootprintCopySavedExecutionNative {
    return Object.freeze<CurrentFootprintCopySavedExecutionNative>({ generation: this.#generation, assertOwned: (): void => { this.#current(); },
      start: async (projection, after): Promise<void> => { await this.#start(projection, after); },
      excludeReplay: (): Promise<object> => this.#excludeReplay(),
      requireReplayExclusion: (original): Promise<void> => { this.#requireReplay(original); return Promise.resolve(); },
      open: (projection, after, replay) => this.#open(projection, after, replay),
      close: (): Promise<unknown> => this.#close(),
      termination: () => this.#observeTermination(),
      requireTermination: (original): Promise<void> => { this.#requireTermination(original); return Promise.resolve(); },
      snapshot: (original): Promise<Inventory> => this.#snapshot(original),
      release: async (original): Promise<void> => { await this.#release(original); },
      observeRelease: (original): Promise<"pending" | "released"> => Promise.resolve(this.#observeRelease(original)),
    });
  }
  async #start(projection: CurrentFootprintCopyV2SavedProjection, after: Inventory): Promise<void> {
    this.#current(); need(!this.#startAttempted, "START_CONSUMED"); this.#startAttempted = true;
    const snapshot = requireCurrentFootprintCopyClosedSnapshot(this.#writer, after);
    currentFootprintCopyV2SavedTarget(projection);
    this.#projection = projection; this.#projectionText = canonicalJson(projection); this.#after = after; this.#current();
    // Factory allocates a distinct helper, retains it and returns before app
    // Launch. Store its owner before the first launch-capable native method.
    let owner: CurrentFootprintCopySavedNativeOwner;
    try { owner = await startCurrentFootprintCopySavedNativeOwner(this.#writer, after); }
    catch (error) { this.#owner = retainedCurrentFootprintCopySavedAllocation(this.#writer); throw error; }
    this.#owner = owner; this.#current();
    const origin = originalCurrentFootprintCopyNativeTarget(owner);
    need(origin.checkpoint === snapshot.checkpoint && origin.source === snapshot.checkpoint.source, "SAVED_POSTEDIT_BINDING");
    await this.#methods.start.call(owner); this.#current();
    const saved = this.#methods.status.call(owner).binding, writer = this.#methods.status.call(this.#writer).binding;
    need(writer !== null && saved !== null && writer.jobId !== saved.jobId && writer.helperInstance !== saved.helperInstance,
      "FRESH_NATIVE_GENERATION"); this.#started = true;
  }
  async #queue(): Promise<void> {
    const owner = this.#live(); need(this.#projection !== null && this.#rawQueues.length < 2, "QUEUE_BUDGET");
    const target = currentFootprintCopyV2SavedTarget(this.#projection);
    const raw = await this.#methods.queue.call(owner); this.#rawQueues.push(raw); this.#current();
    validateCurrentUploadQueueReadResult(captureCurrentPcbStringClockReply(raw).value,
      { projectUuid: target.projectUuid, branchUuid: target.branchUuid }); this.#current();
  }
  async #excludeReplay(): Promise<object> {
    this.#live(); need(!this.#exclusionAttempted && !this.#openAttempted, "EXCLUSION_CONSUMED"); this.#exclusionAttempted = true;
    await this.#queue(); this.#replay = Object.freeze({}); return this.#replay;
  }
  #requireReplay(original: object): void {
    this.#live(); need(original === this.#replay && this.#replay !== null && !this.#openAttempted, "ORIGINAL_REPLAY_EXCLUSION");
  }
  async #open(projection: CurrentFootprintCopyV2SavedProjection, after: Inventory, replay: object): ReturnType<CurrentFootprintCopySavedExecutionNative["open"]> {
    this.#requireReplay(replay);
    need(projection === this.#projection && after === this.#after, "ORIGINAL_SAVED_INPUTS");
    this.#openAttempted = true; const owner = this.#live();
    this.#guard = Object.freeze({ profile: "private.current-footprint-copy-saved-open-guard.v1" }); guards.set(this.#guard, this);
    const result = await this.#methods.open.call(owner, projection, this.#guard); this.#current();
    need(this.#guardCompleted, "OPEN_GUARD_NOT_COMPLETED"); return result;
  }
  public async beforeOpen(owner: CurrentFootprintCopySavedNativeOwner, guard: CurrentFootprintCopySavedOpenGuard): Promise<void> {
    need(this.#live() === owner && guard === this.#guard && this.#openAttempted && !this.#guardAttempted && this.#after !== null,
      "OPEN_GUARD_CONSUMED"); this.#guardAttempted = true;
    await this.#queue(); this.#live();
    await verifyCurrentFootprintCopyPosteditPreopenSource(this.#writer, this.#after); this.#live();
    this.#guardCompleted = true;
  }
  async #close(): Promise<unknown> {
    const owner = this.#native(); need(!this.#closeAttempted, "CLOSE_CONSUMED"); this.#closeAttempted = true;
    const status = this.#methods.status.call(owner);
    if (!status.launchConsumed || status.noProcessCleanupAvailable) {
      this.#noProcessReleased = true;
      const result = await (status.launchConsumed ? this.#methods.noProcess.call(owner) : this.#methods.unlaunched.call(owner));
      this.#current(); return result;
    }
    const window = await this.#methods.window.call(owner); this.#current(); need(window !== null, "CLOSE_WINDOW_MISSING");
    await this.#methods.close.call(owner, window); this.#current();
    return Object.freeze({ closeDispatched: true, saveOrDiscardSelected: false });
  }
  async #observeTermination(): ReturnType<CurrentFootprintCopySavedExecutionNative["termination"]> {
    const owner = this.#native(); need(this.#closeAttempted, "CLOSE_REQUIRED");
    if (!this.#noProcessReleased && !await this.#methods.termination.call(owner)) { this.#current(); return Object.freeze({ status: "pending" }); }
    this.#current(); const original = originalCurrentFootprintCopyNativeTermination(owner);
    assertOriginalCurrentFootprintCopyNativeTermination(owner, original); this.#termination = original;
    return Object.freeze({ status: "terminated", original });
  }
  #requireTermination(original: object): void {
    const owner = this.#native(); need(this.#termination !== null && original === this.#termination, "ORIGINAL_TERMINATION");
    assertOriginalCurrentFootprintCopyNativeTermination(owner, original);
  }
  async #snapshot(original: object): Promise<Inventory> {
    this.#requireTermination(original); need(!this.#snapshotAttempted, "SNAPSHOT_CONSUMED"); this.#snapshotAttempted = true;
    const result = await captureCurrentFootprintCopyClosedSnapshot(this.#native(), original); this.#requireTermination(original); return result;
  }
  async #release(original: object): Promise<void> {
    this.#requireTermination(original); need(!this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true;
    if (!this.#noProcessReleased) { await this.#methods.release.call(this.#native()); } this.#requireTermination(original);
  }
  #observeRelease(original: object): "pending" | "released" {
    this.#requireTermination(original); need(this.#releaseAttempted, "RELEASE_NOT_ATTEMPTED");
    return this.#methods.releaseState.call(this.#native());
  }
}
/** Pure allocation. No helper, application, SQL reader or navigation starts. */
export function createCurrentFootprintCopySavedExecutionNative(writer: CurrentFootprintCopyNativeOwner): CurrentFootprintCopySavedExecutionNative {
  return new CurrentFootprintCopySavedGeneration(writer).binding();
}
