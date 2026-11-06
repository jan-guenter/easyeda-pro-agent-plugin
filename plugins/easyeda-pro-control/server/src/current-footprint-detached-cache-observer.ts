/** Observe original dropped async maintenance through its real normal return.
 * It invokes no callback, Cache method, timer, resolver or application writer. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerConstructionCommand as Command } from "./current-pcb-worker-construction-contract.ts";
// oxlint-disable-next-line import/no-cycle -- The original constructor registry is queried only after that same constructor creates the observer; no initializer crosses the cycle.
import { requireCurrentFootprintDetachedCacheLease } from "./current-footprint-detached-cache-lease.ts";
import type { CurrentFootprintDetachedCacheBinding, CurrentFootprintDetachedCacheLease } from "./current-footprint-detached-cache-lease.ts";
import { CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS as CALLS, CURRENT_FOOTPRINT_HEAD_CACHE_CONDITION as CONDITION,
  CURRENT_FOOTPRINT_DETACHED_CACHE_EXPRESSION as EXPRESSION, CURRENT_FOOTPRINT_DETACHED_CACHE_GROUP as GROUP,
  CURRENT_FOOTPRINT_HEAD_CACHE_CALLS as HEAD, CURRENT_FOOTPRINT_HEAD_CACHE_EXPRESSION as HEAD_EXPRESSION,
  CURRENT_FOOTPRINT_DETACHED_CACHE_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_DETACHED_CACHE_SITES as SITES } from "./current-footprint-detached-cache-profile.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const position = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: handle, functionName: z.string().max(256), location: position, returnValue: z.unknown().optional() });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
const empty = z.object({}).strict(), truth = z.object({ result: z.object({ type: z.literal("boolean"), value: z.boolean() }).strict() }).strict();
const array = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.literal("Array(4)"), objectId: handle }).strict() }).strict();
const noProperties = z.array(z.unknown()).length(0);
const internalValue = z.looseObject({ type: z.string(), value: z.unknown().optional() });
const internalProperty = z.object({ name: z.string(), value: internalValue }).strict();
const internalProperties = z.array(internalProperty).length(3);
const promiseProperties = z.looseObject({ result: noProperties, internalProperties });
const functionNames = Object.freeze({ entry: "", returned: "", headEntry: "put", headPromise: "put", headSuccess: "n", cacheRetry: "n", historyRetry: "m" });
interface Point { readonly id: string; readonly stage: keyof typeof SITES; removed: boolean; attempted: boolean }
interface Pause { readonly frame: string; readonly stage: keyof typeof SITES; readonly promise: string | null; attempted: boolean; resumed: boolean; readonly signal: PromiseWithResolvers<null> }
interface Job { readonly tuple: string; readonly done: PromiseWithResolvers<null>; returned: boolean }
interface HeadJob { readonly tuple: string; readonly done: PromiseWithResolvers<null>; promise: string | null; success: boolean }
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_DETACHED_CACHE_CUSTODY"); } }
async function bounded<T>(work: Promise<T>): Promise<T> {
  const deadline = Promise.withResolvers<never>(); const timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_DETACHED_CACHE_DEADLINE")); }, 15_000);
  try { return await Promise.race([work, deadline.promise]); } finally { clearTimeout(timer); }
}
export interface CurrentFootprintDetachedCacheObservation {
  readonly profile: "private.current-footprint-detached-cache-observation.v1";
  readonly entered: number; readonly returned: number;
  readonly originalEnteredMaintenanceNormalReturnsObserved: true;
  readonly subsequentMaintenanceEntriesRefused: true;
  readonly headIndexCachePutCompletionVerified: false;
  readonly completeUploadFrontierVerified: false; readonly executionAuthorized: false;
}
export interface CurrentFootprintDetachedCacheObservationV2 extends Omit<CurrentFootprintDetachedCacheObservation, "profile" | "headIndexCachePutCompletionVerified"> {
  readonly profile: "private.current-footprint-detached-cache-observation.v2";
  readonly headIndexCachePuts: number; readonly originalHeadIndexCachePutPromisesFulfilled: true;
  readonly headIndexCachePutCompletionVerified: true;
}
const observations = new WeakMap<CurrentFootprintDetachedCacheObservation | CurrentFootprintDetachedCacheObservationV2, () => Promise<void>>();
/** Historical JSON and a result whose original observer was cleaned up cannot
 * reconstitute a live producer exclusion or its source-owned completion. */
export async function requireCurrentFootprintDetachedCacheObservation(result: CurrentFootprintDetachedCacheObservation | CurrentFootprintDetachedCacheObservationV2): Promise<void> {
  const current = observations.get(result); need(current !== undefined); await current();
}
export class CurrentFootprintDetachedCacheObserver {
  readonly #binding: CurrentFootprintDetachedCacheBinding;
  readonly #lease: CurrentFootprintDetachedCacheLease;
  readonly #points: Point[] = [];
  readonly #jobs: Job[] = [];
  readonly #headJobs: HeadJob[] = [];
  readonly #stopped = Promise.withResolvers<null>();
  #chain: Promise<void> = Promise.resolve();
  #pause: Pause | null = null;
  #unsubscribe: (() => void) | null = null;
  #armAttempted = false;
  #armed = false;
  #uncertain = false;
  #unknownPause = false;
  #unsafeToResume = false;
  #failed = false;
  #failure: unknown = null;
  #revocationFailed = false;
  #closed = false;
  #cleanupStarted = false;
  #originalGenerationExited = false;
  #cleaned = false;
  #releaseAttempted = false;
  #suspended = false;
  #suspensionConsumed = false;
  readonly #continuation = Promise.withResolvers<null>();
  #normal = 0;
  #cleanup = 0;
  public constructor(lease: CurrentFootprintDetachedCacheLease) { this.#lease = lease; this.#binding = requireCurrentFootprintDetachedCacheLease(lease); }
  #same(): void { need(requireCurrentFootprintDetachedCacheLease(this.#lease) === this.#binding); }
  #stop(error: unknown): void { if (!this.#failed) { this.#failed = true; this.#failure = error; try { this.#binding.fail(); } catch { this.#revocationFailed = true; } } this.#stopped.resolve(null); }
  async #send(command: Command, cleanup = false, retain?: (reply: unknown) => void): Promise<unknown> {
    this.#same(); if (cleanup) { this.#binding.assertCleanup(); need(this.#cleanup < REQUESTS.cleanup); this.#cleanup += 1; }
    else { need(!this.#failed && !this.#cleanupStarted); await this.#binding.assertOriginal(); need(this.#normal < REQUESTS.normal); this.#normal += 1; }
    const raw = await this.#binding.request(command, cleanup, retain); this.#same();
    if (!cleanup) { await this.#binding.assertOriginal(); } this.#binding.assertCleanup(); return captureCurrentPcbStringClockReply(raw).value;
  }
  async #call(role: keyof typeof CALLS, tuple: string, original?: string): Promise<boolean> {
    return truth.parse(await this.#send({ method: "Runtime.callFunctionOn", params: { objectId: tuple, functionDeclaration: CALLS[role],
      arguments: [{ objectId: this.#binding.project }, ...(original === undefined ? [] : [{ objectId: original }])], objectGroup: GROUP,
      returnByValue: true, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } })).result.value;
  }
  async #headCall(role: "admit" | "matches", tuple: string, original?: string): Promise<boolean> {
    return truth.parse(await this.#send({ method: "Runtime.callFunctionOn", params: { objectId: tuple, functionDeclaration: HEAD[role],
      arguments: [{ objectId: this.#binding.project }, ...(original === undefined ? [] : [{ objectId: original }])], objectGroup: GROUP,
      returnByValue: true, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } })).result.value;
  }
  public acceptsPause(input: unknown): boolean {
    try { const value = z.looseObject({ hitBreakpoints: z.array(z.string()).max(32) }).safeParse(captureCurrentPcbStringClockReply(input).value);
      return value.success && value.data.hitBreakpoints.some(id => this.#points.some(point => point.id === id)); } catch { return false; }
  }
  readonly #paused = (input: unknown): void => {
    try {
      const value = pauseSchema.parse(captureCurrentPcbStringClockReply(input).value); const top = value.callFrames[0];
      const point = this.#points.find(candidate => candidate.id === value.hitBreakpoints[0]);
      const expectedName = point === undefined ? null : functionNames[point.stage];
      need(this.#armed && point !== undefined && top !== undefined && top.functionName === expectedName && top.location.scriptId === this.#binding.scriptId &&
        top.location.lineNumber === SITES[point.stage].lineNumber && top.location.columnNumber === SITES[point.stage].columnNumber &&
        (this.#pause === null || this.#pause.resumed));
      let promise: string | null = null;
      if (point.stage === "headPromise") { promise = z.object({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).strict().parse(top.returnValue).objectId; }
      const pause: Pause = { frame: top.callFrameId, stage: point.stage, promise, attempted: false, resumed: false, signal: Promise.withResolvers<null>() };
      this.#pause = pause;
      if (point.stage === "entry") {
        const caller = value.callFrames[1]; need(caller?.functionName === "m" && caller.location.scriptId === this.#binding.scriptId &&
          caller.location.lineNumber === 110 && caller.location.columnNumber >= 10_007 && caller.location.columnNumber <= 10_326);
      }
      if (point.stage === "headEntry") {
        const caller = value.callFrames[1]; need(caller?.functionName === "syncCloud" && caller.location.scriptId === this.#binding.scriptId &&
          caller.location.lineNumber === 110 && caller.location.columnNumber >= 19_357 && caller.location.columnNumber <= 19_452);
      }
      const previous = this.#chain;
      if (this.#suspended && (point.stage === "cacheRetry" || point.stage === "historyRetry")) {
        this.#unsafeToResume = true; this.#stop(new Error("FOOTPRINT_NARROW_RETRY_REFUSED")); return;
      }
      this.#chain = (async (): Promise<void> => { await previous; try { await this.#process(pause); } catch (error) {
        if ((pause.stage === "entry" || pause.stage === "headEntry" || pause.stage === "cacheRetry" || pause.stage === "historyRetry") && !pause.attempted) { this.#unsafeToResume = true; } this.#stop(error);
      } })();
    } catch (error) { this.#unknownPause = true; this.#stop(error); }
  };
  readonly #resumed = (): void => {
    const pause = this.#pause;
    if (pause === null || !pause.attempted || pause.resumed) { this.#stop(new Error("FOOTPRINT_DETACHED_CACHE_UNEXPECTED_RESUME")); return; }
    pause.resumed = true; pause.signal.resolve(null);
  };
  async #resume(pause: Pause, cleanup = false): Promise<void> {
    need(!pause.attempted && !pause.resumed); pause.attempted = true;
    empty.parse(await this.#send({ method: "Debugger.resume", params: {} }, cleanup)); await bounded(pause.signal.promise);
  }
  async #process(pause: Pause): Promise<void> {
    if (this.#suspended) { await this.#continuation.promise; }
    need(!this.#failed && !this.#cleanupStarted);
    if (pause.stage === "cacheRetry" || pause.stage === "historyRetry") { throw new Error("FOOTPRINT_NARROW_RETRY_REFUSED"); }
    if (pause.stage === "headEntry" || pause.stage === "headPromise" || pause.stage === "headSuccess") { await this.#processHead(pause); return; }
    if (pause.stage === "entry") { need(!this.#closed && this.#jobs.length < REQUESTS.entries); }
    const tuple = array.parse(await this.#send({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId: pause.frame, expression: EXPRESSION,
      objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } })).result.objectId;
    if (pause.stage === "entry") {
      need(await this.#call("admit", tuple)); this.#jobs.push({ tuple, done: Promise.withResolvers<null>(), returned: false });
    } else {
      const matched: Job[] = [];
      for (const job of this.#jobs) { if (await this.#call("matches", tuple, job.tuple)) { matched.push(job); } }
      need(matched.length === 1); const job = matched[0]; need(job !== undefined && !job.returned); job.returned = true; job.done.resolve(null);
    }
    await this.#resume(pause);
  }
  /** The original clock handoff may retain an owned pause without servicing
   * it through the clock request ledger. A retry branch still fails at once. */
  public suspendForClock(): void {
    need(this.#armed && !this.#closed && !this.#failed && !this.#cleanupStarted && !this.#suspensionConsumed &&
      (this.#pause === null || this.#pause.resumed) && this.#jobs.every(job => job.returned) &&
      this.#headJobs.every(job => job.success && job.promise !== null));
    this.#suspensionConsumed = true; this.#suspended = true;
  }
  public continueAfterClock(): void {
    need(this.#suspended && !this.#closed && !this.#failed && !this.#cleanupStarted);
    this.#suspended = false; this.#continuation.resolve(null);
  }
  public remainingClockContinuationRequests(): Readonly<{ normal: number; cleanup: number; total: number }> {
    need(this.#suspended && !this.#failed && !this.#cleanupStarted);
    const cleanup = REQUESTS.cleanup - this.#cleanup, normal = REQUESTS.normal - this.#normal;
    need(cleanup >= 0 && normal >= 0); return Object.freeze({ normal, cleanup, total: normal + cleanup });
  }
  async #processHead(pause: Pause): Promise<void> {
    if (pause.stage === "headEntry") { need(!this.#closed && this.#headJobs.length < REQUESTS.headEntries); }
    const headArray = array.extend({ result: array.shape.result.extend({ description: z.literal("Array(3)") }) });
    const tuple = headArray.parse(await this.#send({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId: pause.frame, expression: HEAD_EXPRESSION,
      objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } })).result.objectId;
    let completed: HeadJob | null = null;
    if (pause.stage === "headEntry") {
      need(await this.#headCall("admit", tuple)); this.#headJobs.push({ tuple, done: Promise.withResolvers<null>(), promise: null, success: false });
    } else {
      const matches: HeadJob[] = []; for (const job of this.#headJobs) { if (await this.#headCall("matches", tuple, job.tuple)) { matches.push(job); } }
      need(matches.length === 1); const job = matches[0]; need(job !== undefined); completed = job;
      if (pause.stage === "headSuccess") { need(!job.success); job.success = true; }
      else {
        need(job.promise === null && pause.promise !== null);
        const retained = await this.#send({ method: "Runtime.callFunctionOn", params: { objectId: pause.promise, functionDeclaration: HEAD.retain,
          arguments: [], objectGroup: GROUP, returnByValue: false, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
        job.promise = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).strict() }).strict().parse(retained).result.objectId;
      }
    }
    await this.#resume(pause); if (completed !== null && completed.promise !== null && completed.success) { completed.done.resolve(null); }
  }
  public async arm(): Promise<void> {
    need(!this.#armAttempted); this.#armAttempted = true;
    try {
      await this.#binding.assertOriginal(); this.#unsubscribe = this.#binding.subscribe({ paused: this.#paused, resumed: this.#resumed,
        lost: (): void => { this.#stop(new Error("FOOTPRINT_DETACHED_CACHE_OWNER_LOST")); } });
      for (const stage of ["entry", "returned", "headEntry", "headPromise", "headSuccess", "cacheRetry", "historyRetry"] as const) {
        this.#uncertain = true;
        const raw = await this.#send({ method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#binding.scriptId, ...SITES[stage] },
          ...(stage.startsWith("head") ? { condition: CONDITION } : {}) } }, false, reply => {
          const allocated = z.looseObject({ breakpointId: handle }).parse(reply);
          need(!this.#points.some(point => point.id === allocated.breakpointId)); this.#points.push({ id: allocated.breakpointId, stage, attempted: false, removed: false }); this.#uncertain = false;
        });
        const allocated = z.object({ breakpointId: handle, actualLocation: position }).strict().parse(raw);
        need(this.#points.at(-1)?.id === allocated.breakpointId && allocated.actualLocation.scriptId === this.#binding.scriptId &&
          allocated.actualLocation.lineNumber === SITES[stage].lineNumber && allocated.actualLocation.columnNumber === SITES[stage].columnNumber);
      }
      this.#armed = true;
    } catch (error) { this.#stop(error); throw error; }
  }
  /** Close this observed producer after the operation's final dispatch. Wait
   * for original returns, not stable polling; no later entry may write a cache.
   * Other producer families remain outside this completion statement. */
  public async closeAndObserve(): Promise<CurrentFootprintDetachedCacheObservationV2> {
    need(this.#armed && !this.#closed && !this.#failed && !this.#cleanupStarted); this.#closed = true;
    try {
      const barrier = (): Promise<unknown> => this.#send({ method: "Runtime.callFunctionOn", params: { objectId: this.#binding.project, functionDeclaration: HEAD.barrier,
        arguments: [], objectGroup: GROUP, returnByValue: true, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
      need(truth.parse(await barrier()).result.value); await this.#chain;
      const stopped = (async (): Promise<never> => { await this.#stopped.promise; throw this.#failure; })();
      const originalReturns = Promise.all([...this.#jobs.map(job => job.done.promise), ...this.#headJobs.map(job => job.done.promise)]);
      const outcome = Promise.race([originalReturns, stopped]); await bounded(outcome);
      await this.#chain; await this.#binding.assertOriginal(); this.#same();
      need(truth.parse(await barrier()).result.value); await this.#chain;
      if (this.#failed) { throw this.#failure; }
      need(this.#jobs.every(job => job.returned) && (this.#pause === null || this.#pause.resumed));
      for (const job of this.#headJobs) {
        need(job.promise !== null && job.success);
        const properties = promiseProperties.parse(await this.#send({ method: "Runtime.getProperties", params: { objectId: job.promise, ownProperties: true, generatePreview: false } }));
        const fields = new Map(properties.internalProperties.map(property => [property.name, property.value]));
        const result = fields.get("[[PromiseResult]]"), state = fields.get("[[PromiseState]]");
        need(fields.size === 3 && state?.type === "string" && state.value === "fulfilled" && result?.type === "undefined" &&
          !Object.hasOwn(result, "value") && fields.get("[[Prototype]]")?.type === "object");
      }
      const result: CurrentFootprintDetachedCacheObservationV2 = Object.freeze({ profile: "private.current-footprint-detached-cache-observation.v2", entered: this.#jobs.length, returned: this.#jobs.length,
        originalEnteredMaintenanceNormalReturnsObserved: true, subsequentMaintenanceEntriesRefused: true,
        headIndexCachePuts: this.#headJobs.length, originalHeadIndexCachePutPromisesFulfilled: true,
        headIndexCachePutCompletionVerified: true, completeUploadFrontierVerified: false, executionAuthorized: false });
      observations.set(result, async (): Promise<void> => {
        need(this.#closed && !this.#failed && !this.#cleanupStarted && this.#jobs.length === result.entered && this.#jobs.every(job => job.returned) &&
          this.#headJobs.length === result.headIndexCachePuts && this.#headJobs.every(job => job.promise !== null && job.success));
        this.#same(); await this.#binding.assertOriginal(); this.#same(); need(!this.#failed && !this.#cleanupStarted);
      });
      return result;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async cleanup(): Promise<void> {
    if (this.#cleaned) { return; } this.#cleanupStarted = true; this.#closed = true;
    if (this.#suspended) {
      if (this.#pause !== null && !this.#pause.resumed) { this.#unsafeToResume = true; }
      this.#suspended = false; this.#continuation.resolve(null);
    }
    await this.#chain;
    for (const point of this.#points) { if (!point.removed) { need(!point.attempted); point.attempted = true;
      empty.parse(await this.#send({ method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true; } }
    need(!this.#uncertain && !this.#unknownPause && !this.#unsafeToResume);
    const pause = this.#pause; if (pause !== null && !pause.resumed) { await this.#resume(pause, true); }
    need((pause === null || pause.resumed) && !this.#releaseAttempted); this.#releaseAttempted = true;
    empty.parse(await this.#send({ method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true));
    this.#unsubscribe?.(); this.#unsubscribe = null; this.#cleaned = true;
  }
  /** The original constructor first verifies the channel's retained whole-Job
   * exit. Local waits end without inventing a resume or another native reply. */
  public async observeOriginalGenerationExited(): Promise<void> {
    if (this.#originalGenerationExited) { return; }
    this.#originalGenerationExited = true; this.#cleanupStarted = true; this.#closed = true;
    this.#stop(new Error("FOOTPRINT_DETACHED_CACHE_ORIGINAL_GENERATION_EXITED"));
    this.#suspended = false; this.#continuation.resolve(null); await this.#chain;
    this.#unsubscribe?.(); this.#unsubscribe = null; this.#cleaned = true;
  }
  public retained(): Readonly<{ cleaned: boolean; uncertain: boolean; pendingPause: boolean; entered: number; returned: number; failed: boolean; revocationFailed: boolean; requiresGenerationExit: boolean }> {
    return Object.freeze({ cleaned: this.#cleaned, uncertain: this.#uncertain, pendingPause: this.#pause !== null && !this.#pause.resumed,
      entered: this.#jobs.length, returned: this.#jobs.filter(job => job.returned).length, failed: this.#failed, revocationFailed: this.#revocationFailed,
      requiresGenerationExit: this.#unsafeToResume || this.#unknownPause });
  }
}
