/** Registered original startup events only. Caller-supplied pause JSON has no
 * public entrypoint and cannot reconstruct a completed cache construction. */
import { setTimeout as delay } from "node:timers/promises";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_SITES as SITES,
  decodeFootprintCacheConstructionArray, decodeFootprintCacheConstructionNative, footprintCacheConstructionHandle } from "./current-footprint-copy-cache-construction-contract.ts";
import type { CurrentFootprintCacheConstructionCommand as Command } from "./current-footprint-copy-cache-construction-contract.ts";
import { decodeCurrentFootprintCopyDependencyFunction } from "./current-footprint-copy-dependency-bindings.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export interface CurrentFootprintCopyCacheConstructionTransport {
  readonly assertOriginalWorker: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly request: (command: Command) => Promise<unknown>;
  /** Register on the retained constructor event source before its bootstrap
   * resume. The enclosing dispatcher must route these two IDs away from its
   * normal constructor sequence; unrelated events remain its responsibility. */
  readonly subscribe: (listener: Readonly<{ paused: (parameters: unknown) => void; resumed: () => void; lost: () => void }>) => () => void;
}
export interface CurrentFootprintCopyCacheConstructionObservation {
  readonly profile: "private.current-footprint-cache-construction.v1";
  readonly originalOpenEventsObserved: 4;
  readonly originalWrapperReceiversMatched: true;
  readonly originalNativeCacheResultsMatched: true;
  readonly bothNamespaceArgumentsMatched: true;
  readonly originalProjectAssignmentsMatched: true;
  readonly nativeOpenInvokedByAgent: false;
  readonly networkBackendOwned: false;
  readonly executionAuthorized: false;
}
interface Breakpoint { readonly id: string; readonly site: number; attempted: boolean; removed: boolean }
interface Pause { readonly ordinal: number; readonly frame: string; resumeAttempted: boolean; resumed: boolean }
type Step = "not-started" | "arm" | "frame" | "before" | "metadata" | "bind" | "after" | "remove" | "resume" | "join" | "capture-wait" | "release" | "cleanup";
interface Failure { readonly step: Step; readonly code: string; readonly requests: number; readonly replies: number; readonly pauses: number; readonly metadataIndex: number | null }
const failures = new WeakMap<Error, string>();
function fail(code: "OWNER" | "DEADLINE" | "CLEANUP" | "CHANNEL_LOST"): Error {
  const error = new Error(`FOOTPRINT_CACHE_CONSTRUCTION_${code}`); failures.set(error, code); return error;
}
const fields = ["assertOriginalWorker", "assertCleanup", "request", "subscribe"] as const;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frameSchema = z.looseObject({ callFrameId: handle, functionName: z.literal("open"), location });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(z.unknown()).min(1).max(32) });
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const empty = z.object({}).strict();
const consumed = new WeakSet<CurrentFootprintCopyCacheConstructionTransport>();
function need(condition: boolean): asserts condition { if (!condition) { throw fail("OWNER"); } }
function members(transport: CurrentFootprintCopyCacheConstructionTransport): readonly unknown[] {
  need(!types.isProxy(transport) && Object.isFrozen(transport) && Object.getPrototypeOf(transport) === Object.prototype && Reflect.ownKeys(transport).length === fields.length);
  return fields.map(key => { const d = Object.getOwnPropertyDescriptor(transport, key); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === "function"); return d.value as unknown; });
}

export class CurrentFootprintCopyCacheConstructionRunner {
  readonly #transport: CurrentFootprintCopyCacheConstructionTransport;
  readonly #members: readonly unknown[];
  readonly #scriptId: string;
  readonly #projectId: string;
  readonly #path: string;
  readonly #breakpoints: Breakpoint[] = [];
  readonly #raw: unknown[] = [];
  readonly #pauses: Pause[] = [];
  readonly #completed: string[] = [];
  readonly #completion = Promise.withResolvers<null>();
  #unsubscribe: (() => void) | null = null;
  #chain: Promise<void> = Promise.resolve();
  #resumeSignal: (() => void) | null = null;
  #bound: string | null = null;
  #armed = false;
  #armAttempted = false;
  #failed = false;
  #error: unknown = null;
  #requests = 0;
  #resultAttempted = false;
  #reproofAttempted = false;
  #releaseAttempted = false;
  #released = false;
  #packet: CurrentFootprintCopyCacheConstructionObservation | null = null;
  #waitAttempted = false;
  #captureComplete = false;
  #step: Step = "not-started";
  #firstFailure: Failure | null = null;
  #replies = 0;
  #metadataIndex: number | null = null;
  public constructor(transport: CurrentFootprintCopyCacheConstructionTransport,
    binding: Readonly<{ scriptId: string; projectObjectId: string; projectUuid: string }>) {
    this.#members = members(transport); this.#transport = transport;
    this.#scriptId = footprintCacheConstructionHandle(binding.scriptId); this.#projectId = footprintCacheConstructionHandle(binding.projectObjectId);
    this.#path = z.string().length(64).regex(/^[a-f\d]{64}$/u).parse(binding.projectUuid);
  }
  #same(): void { need(members(this.#transport).every((value, index) => value === this.#members[index])); }
  async #current(): Promise<void> { need(!this.#failed && !this.#releaseAttempted); this.#same(); await this.#transport.assertOriginalWorker(); this.#same(); }
  #stop(error: unknown): void {
    if (!this.#failed) {
      this.#firstFailure = Object.freeze({ step: this.#step, code: error instanceof Error ? failures.get(error) ?? "DEPENDENCY_OR_REPLY" : "DEPENDENCY_OR_REPLY",
        requests: this.#requests, replies: this.#replies, pauses: this.#pauses.length, metadataIndex: this.#metadataIndex });
      this.#failed = true; this.#error = error;
    }
    this.#completion.resolve(null);
  }
  async #send(command: Command, cleanup = false): Promise<unknown> {
    const steps = { "Debugger.evaluateOnCallFrame": "frame", "Runtime.getProperties": "metadata", "Debugger.removeBreakpoint": "remove",
      "Debugger.resume": "resume", "Runtime.releaseObjectGroup": "release" } as const;
    if (command.method === "Runtime.callFunctionOn") {
      const selected = (["before", "bind", "after", "join"] as const).find(role => CALLS[role].program === command.params.functionDeclaration);
      need(selected !== undefined); this.#step = selected;
    } else if (command.method !== "Debugger.setBreakpoint") { this.#step = steps[command.method]; }
    if (cleanup) { this.#same(); this.#transport.assertCleanup(); } else { await this.#current(); }
    need(this.#requests < REQUESTS.total + REQUESTS.reproof); this.#requests += 1;
    const reply = captureCurrentPcbStringClockReply(await this.#transport.request(command)).value; this.#raw.push(reply); this.#replies += 1;
    if (cleanup) { this.#same(); this.#transport.assertCleanup(); } else { await this.#current(); }
    return reply;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ method: "Runtime.getProperties", params: {
    objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(role: keyof typeof CALLS, objectId: string, arguments_: readonly Readonly<{ objectId: string } | { value: string | number | null }>[]): Promise<unknown> {
    return this.#send({ method: "Runtime.callFunctionOn", params: { objectId, functionDeclaration: CALLS[role].program, arguments: arguments_,
      objectGroup: GROUP, returnByValue: CALLS[role].returnByValue, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
  }
  async #array(role: "before" | "bind" | "after", objectId: string, arguments_: readonly Readonly<{ objectId: string } | { value: string | number | null }>[]): Promise<Readonly<{ id: string; ids: readonly string[] }>> {
    const sizes = { before: 8, bind: 9, after: 10 } as const;
    const size = sizes[role];
    const raw = await this.#call(role, objectId, arguments_);
    const description = `Array(${String(size)})`;
    const result = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
      description: z.literal(description), objectId: handle }).strict() }).strict().parse(raw).result;
    return Object.freeze({ id: result.objectId, ids: decodeFootprintCacheConstructionArray(await this.#properties(result.objectId), size) });
  }
  /** Only owned breakpoint IDs are intercepted. The original subscription
   * remains installed on failure so late events are retained for cleanup. */
  public acceptsPause(input: unknown): boolean {
    try {
      const raw = captureCurrentPcbStringClockReply(input).value;
      const value = z.looseObject({ hitBreakpoints: z.array(z.string()).max(32) }).safeParse(raw);
      return value.success && value.data.hitBreakpoints.some(id => this.#breakpoints.some(point => point.id === id));
    } catch { return false; }
  }
  #receive(input: unknown): void {
    let raw: unknown;
    try { raw = captureCurrentPcbStringClockReply(input).value; } catch (error) { this.#stop(error); return; }
    const maybe = z.looseObject({ hitBreakpoints: z.array(z.string()) }).safeParse(raw);
    if (!maybe.success || !maybe.data.hitBreakpoints.some(id => this.#breakpoints.some(point => point.id === id))) { return; }
    this.#raw.push(raw);
    this.#chain = this.#queued(this.#chain, raw);
  }
  async #queued(previous: Promise<void>, raw: unknown): Promise<void> {
    await previous; try { await this.#process(raw); } catch (error) { this.#stop(error); }
  }
  static async #deadline(milliseconds: number, signal: AbortSignal): Promise<never> {
    await delay(milliseconds, undefined, { signal }); throw fail("DEADLINE");
  }
  /** Called while the original bootstrap constructor pause is held. This
   * allocates no process, invokes no open, and never resumes that outer pause. */
  public async arm(): Promise<void> {
    need(!this.#armAttempted && !consumed.has(this.#transport)); this.#armAttempted = true; consumed.add(this.#transport);
    this.#step = "arm";
    try {
      await this.#current();
      this.#unsubscribe = this.#transport.subscribe(Object.freeze({ paused: (input: unknown): void => { this.#receive(input); },
        resumed: (): void => { this.#resumeSignal?.(); }, lost: (): void => { this.#stop(fail("CHANNEL_LOST")); } }));
      need(typeof this.#unsubscribe === "function");
      for (const [index, site] of SITES.entries()) {
        await this.#current(); need(this.#requests < REQUESTS.arm); this.#requests += 1;
        const raw = captureCurrentPcbStringClockReply(await this.#transport.request({ method: "Debugger.setBreakpoint", params: {
          location: { scriptId: this.#scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } })).value;
        this.#raw.push(raw); this.#replies += 1;
        const allocated = z.looseObject({ breakpointId: handle }).safeParse(raw);
        if (allocated.success && !this.#breakpoints.some(point => point.id === allocated.data.breakpointId)) {
          this.#breakpoints.push({ id: allocated.data.breakpointId, site: index, attempted: false, removed: false });
        }
        await this.#current(); const reply = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(raw);
        need(this.#breakpoints.length === index + 1 && reply.actualLocation.scriptId === this.#scriptId && reply.actualLocation.lineNumber === site.lineNumber && reply.actualLocation.columnNumber === site.columnNumber);
      }
      this.#armed = true;
    } catch (error) { this.#stop(error); throw error; }
  }
  async #remove(point: Breakpoint): Promise<void> {
    if (point.removed) { return; } need(!point.attempted); point.attempted = true;
    empty.parse(await this.#send({ method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    need(!pause.resumeAttempted); pause.resumeAttempted = true;
    const signal = Promise.withResolvers<null>(), timeout = new AbortController(); this.#resumeSignal = (): void => { signal.resolve(null); };
    // Observe the event deadline immediately, including when the native resume
    // Acknowledgment fails before its event can be awaited.
    const observed = Promise.allSettled([Promise.race([signal.promise, CurrentFootprintCopyCacheConstructionRunner.#deadline(10_000, timeout.signal)])]);
    try {
      empty.parse(await this.#send({ method: "Debugger.resume", params: {} }, true));
      const [outcome] = await observed; need(outcome !== undefined); if (outcome.status === "rejected") { throw outcome.reason as unknown; } pause.resumed = true;
    } finally { timeout.abort(); this.#resumeSignal = null; }
  }
  async #process(input: unknown): Promise<void> {
    need(this.#armed && this.#pauses.length < 4 && !this.#released);
    const ordinal = this.#pauses.length, siteIndex = ordinal % 2;
    const expected = SITES[siteIndex], point = this.#breakpoints[siteIndex];
    const value = paused.parse(input);
    const frame = frameSchema.parse(value.callFrames[0]);
    need(expected !== undefined && point !== undefined && value.hitBreakpoints[0] === point.id &&
      frame.location.scriptId === this.#scriptId && frame.location.lineNumber === expected.lineNumber && frame.location.columnNumber === expected.columnNumber);
    const held: Pause = { ordinal, frame: frame.callFrameId, resumeAttempted: false, resumed: false }; this.#pauses.push(held);
    // Retain a recognized late pause but never continue qualification after a
    // Lost acknowledgment. Cleanup may resume it once on the original channel.
    need(!this.#failed);
    const receiver = z.object({ result: z.object({ type: z.literal("object"), className: z.literal("bb"), description: z.literal("bb"), objectId: handle }).strict() }).strict()
      .parse(await this.#send({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId: frame.callFrameId, expression: "this", objectGroup: GROUP,
        returnByValue: false, silent: true, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } })).result.objectId;
    const namespace = Math.floor(ordinal / 2);
    if (siteIndex === 0) {
      const first = this.#completed[0];
      const captured = await this.#array("before", receiver, [{ value: this.#path }, { value: namespace }, first === undefined ? { value: null } : { objectId: first }]);
      if (ordinal === 0) {
        for (const [index, id] of captured.ids.slice(1, 7).entries()) {
          this.#metadataIndex = index;
          const metadata = await this.#properties(id);
          if (index < 2) { decodeCurrentFootprintCopyDependencyFunction(metadata, this.#scriptId, 53 + index); }
          else { decodeFootprintCacheConstructionNative(metadata, index - 2); }
        }
        this.#metadataIndex = null;
      }
      const bound = await this.#array("bind", captured.id, [{ value: this.#path }, { value: namespace }]); this.#bound = bound.id;
      if (ordinal === 2) { await this.#remove(point); }
    } else {
      need(this.#bound !== null); const result = await this.#array("after", receiver, [{ objectId: this.#bound }, { value: this.#path }, { value: namespace }]);
      this.#completed.push(result.id); this.#bound = null;
      if (ordinal === 3) { await this.#remove(point); }
    }
    await this.#resume(held);
    if (ordinal === 3) { this.#captureComplete = true; this.#completion.resolve(null); }
  }
  async #join(): Promise<void> {
    const first = this.#completed[0], second = this.#completed[1]; need(first !== undefined && second !== undefined);
    yes.parse(await this.#call("join", this.#projectId, [{ objectId: first }, { objectId: second }, { value: this.#path }]));
  }
  async #awaitCaptureComplete(): Promise<void> {
    need(this.#armAttempted); this.#step = "capture-wait";
    const timeout = new AbortController();
    try {
      await this.#current();
      await Promise.race([this.#completion.promise, CurrentFootprintCopyCacheConstructionRunner.#deadline(300_000, timeout.signal)]);
      await this.#chain; if (this.#failed) { throw this.#error; }
      need(this.#captureComplete && this.#completed.length === 2 && this.#pauses.length === 4 && this.#pauses.every(pause => pause.resumed)); await this.#current();
    } catch (error) { this.#stop(error); throw error; }
    finally { timeout.abort(); }
  }
  /** Let the original startup's four debugger pauses settle before awaiting a
   * short native message receipt. This consumes no result, join or reproof. */
  public async waitOriginalCaptureComplete(): Promise<void> {
    need(!this.#waitAttempted); this.#waitAttempted = true; await this.#awaitCaptureComplete();
  }
  public async result(): Promise<CurrentFootprintCopyCacheConstructionObservation> {
    need(this.#armAttempted && !this.#resultAttempted); this.#resultAttempted = true;
    try {
      await this.#awaitCaptureComplete(); await this.#join();
      need(this.#requests === REQUESTS.total - REQUESTS.release);
      this.#packet = Object.freeze({ profile: "private.current-footprint-cache-construction.v1", originalOpenEventsObserved: 4,
        originalWrapperReceiversMatched: true, originalNativeCacheResultsMatched: true, bothNamespaceArgumentsMatched: true,
        originalProjectAssignmentsMatched: true, nativeOpenInvokedByAgent: false, networkBackendOwned: false, executionAuthorized: false });
      return this.#packet;
    } catch (error) { this.#stop(error); throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintCopyCacheConstructionObservation): Promise<void> {
    need(packet === this.#packet && this.#packet !== null && !this.#reproofAttempted); this.#reproofAttempted = true;
    try { await this.#join(); } catch (error) { this.#stop(error); throw error; }
  }
  public async release(): Promise<void> {
    need(!this.#releaseAttempted && (this.#packet !== null || this.#failed)); this.#releaseAttempted = true;
    empty.parse(await this.#send({ method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true));
    this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
  }
  public async cleanup(): Promise<void> {
    this.#step = "cleanup"; this.#stop(fail("CLEANUP")); await this.#chain;
    const errors: unknown[] = [];
    for (const point of this.#breakpoints) { try { await this.#remove(point); } catch (error) { errors.push(error); } }
    const held = this.#pauses.at(-1);
    if (held !== undefined && !held.resumeAttempted) { try { await this.#resume(held); } catch (error) { errors.push(error); } }
    if (!this.#releaseAttempted) { try { await this.release(); } catch (error) { errors.push(error); } }
    if (!this.#released) { errors.push(new Error("FOOTPRINT_CACHE_CONSTRUCTION_RELEASE_UNCONFIRMED")); }
    if (errors.length > 0) { throw new AggregateError(errors, "FOOTPRINT_CACHE_CONSTRUCTION_CLEANUP_FAILED"); }
  }
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ armAttempted: this.#armAttempted, armed: this.#armed, failed: this.#failed, requests: this.#requests,
      pauseCount: this.#pauses.length, completedNamespaces: this.#completed.length, rawRepliesAndEvents: Object.freeze([...this.#raw]),
      resumed: Object.freeze(this.#pauses.map(pause => pause.resumed)), reproofAttempted: this.#reproofAttempted,
      releaseAttempted: this.#releaseAttempted, released: this.#released, observation: this.#packet, executionAuthorized: false });
  }
  public diagnostics(): Readonly<{ armAttempted: boolean; armed: boolean; failed: boolean; requests: number; replies: number;
    pauseCount: number; resumedPauses: number; completedNamespaces: number; captureComplete: boolean; waitAttempted: boolean;
    step: Step; metadataIndex: number | null; firstFailure: Failure | null; released: boolean }> {
    return Object.freeze({ armAttempted: this.#armAttempted, armed: this.#armed, failed: this.#failed, requests: this.#requests, replies: this.#replies,
      pauseCount: this.#pauses.length, resumedPauses: this.#pauses.filter(pause => pause.resumed).length, completedNamespaces: this.#completed.length,
      captureComplete: this.#captureComplete, waitAttempted: this.#waitAttempted, step: this.#step, metadataIndex: this.#metadataIndex,
      firstFailure: this.#firstFailure, released: this.#released });
  }
}
