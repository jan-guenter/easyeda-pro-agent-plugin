/* oxlint-disable eslint/max-classes-per-file -- Two fixed role wrappers share one private constructor-boundary owner. */
/** Capture the original Worker construction boundary and waiting attachment.
 * Correlation is deliberately not native Worker/target identity: a page session
 * can report children of other frames. No native adapter adopts this stage yet. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_GROUP as GROUP, CURRENT_PCB_209_RATLINE_CREATION_PROFILES as PROFILES } from "./current-pcb-209-ratline-creation-profile.ts";
import type { CurrentPcb209RatlineCreationRole } from "./current-pcb-209-ratline-creation-profile.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frameSchema = z.looseObject({ callFrameId: token, functionName: z.string().max(128), location });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.array(token).length(1), callFrames: z.array(frameSchema).min(1).max(32) });
const targetSchema = z.looseObject({ targetId: token, type: z.string().min(1).max(64), title: z.string().max(512), url: z.string().max(4096), attached: z.boolean() });
const attachmentSchema = z.object({ sessionId: token, params: z.object({ sessionId: token, targetInfo: targetSchema, waitingForDebugger: z.literal(true) }).strict() }).strict();
const empty = z.object({}).strict();
type Expression = "s" | "i" | "a" | "n" | "o" | "this";
export type CurrentPcb209RatlineCreationCommand =
  | Readonly<{ method: "Target.getTargets"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.setBreakpoint"; sessionId: string; params: Readonly<{ location: z.infer<typeof location> }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; sessionId: string; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ method: "Debugger.resume" | "Runtime.runIfWaitingForDebugger"; sessionId: string; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.evaluateOnCallFrame"; sessionId: string; params: Readonly<{ callFrameId: string; expression: Expression;
    objectGroup: typeof GROUP; returnByValue: boolean; silent: true; throwOnSideEffect: true; generatePreview: false; includeCommandLineAPI: false }> }>;
/** The retained native adapter owns source/context/process identity and original
 * recursive auto-attachment. This is private executable authority, not MCP data.
 * It must deliver original parent events continuously before arming, and must
 * never reset the containing native request budget for this stage. */
export interface CurrentPcb209RatlineCreationTransport {
  readonly scriptId: string;
  readonly parentTargetId: string;
  readonly parentSessionId: string;
  readonly assertOriginalPinnedParentAndAutoAttach: (source: Readonly<{ relativePath: string; bytes: number; sha256: string }>) => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (command: CurrentPcb209RatlineCreationCommand) => Promise<unknown>;
  readonly subscribe: (events: Readonly<{ paused: (parameters: unknown) => void; resumed: () => void;
    attached: (event: unknown) => void; lost: () => void }>) => () => void;
}
export interface CurrentPcb209RatlineCreationPacket {
  readonly profile: "private.current-pcb209-ratline-creation-boundary.v1";
  readonly role: CurrentPcb209RatlineCreationRole;
  readonly sourceSha256: string;
  readonly constructorBoundaryObserved: true;
  readonly soleWaitingChildObserved: true;
  readonly requestedUrlSha256: string;
  readonly childTargetId: string;
  readonly childSessionId: string;
  readonly parentHeldAfterConstruction: true;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly childSourceQualified: false;
  readonly executionAuthorized: false;
}
interface Breakpoint { readonly id: string; removal: Promise<void> | null; removed: boolean }
interface Pause { readonly event: unknown; readonly error: unknown; readonly observed: PromiseWithResolvers<null>;
  resume: Promise<void> | null; resumed: boolean }
interface Child { readonly targetId: string; readonly sessionId: string; readonly url: string; readonly title: string; release: Promise<void> | null }
const INTERNAL = Symbol("fixed209-ratline-creation");
function fail(code: string): Error { return new Error(`PCB209_RATLINE_CREATION_${code}`); }
function need(value: boolean, code: string): asserts value { if (!value) { throw fail(code); } }
async function bounded<T>(work: Promise<T>, milliseconds = 2500): Promise<T> {
  const deadline = Promise.withResolvers<never>(), timer = setTimeout(() => { deadline.reject(fail("DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, deadline.promise]); } finally { clearTimeout(timer); }
}
async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original attempt retains its failure.
  }
}
async function settle(work: Promise<void>, completion: PromiseWithResolvers<undefined>): Promise<void> {
  try {
    await work;
    // oxlint-disable-next-line unicorn/no-useless-undefined -- PromiseWithResolvers<undefined>.resolve requires its value argument under strict TypeScript.
    completion.resolve(undefined);
  } catch (error) { completion.reject(error); }
}
function members(value: CurrentPcb209RatlineCreationTransport): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "TRANSPORT");
  const keys = ["scriptId", "parentTargetId", "parentSessionId", "assertOriginalPinnedParentAndAutoAttach", "assertOriginalTermination", "request", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "TRANSPORT");
  return keys.map((key, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 3 ? "string" : "function"), "TRANSPORT");
    return descriptor.value as unknown;
  });
}
class CurrentPcb209RatlineCreationCore {
  readonly #role: CurrentPcb209RatlineCreationRole;
  readonly #transport: CurrentPcb209RatlineCreationTransport;
  readonly #original: readonly unknown[];
  readonly #scriptId: string;
  readonly #parent: string;
  readonly #target: string;
  readonly #request: CurrentPcb209RatlineCreationTransport["request"];
  readonly #assert: CurrentPcb209RatlineCreationTransport["assertOriginalPinnedParentAndAutoAttach"];
  readonly #terminate: CurrentPcb209RatlineCreationTransport["assertOriginalTermination"];
  readonly #subscribe: CurrentPcb209RatlineCreationTransport["subscribe"];
  readonly #armed = Promise.withResolvers<null>();
  readonly #childReady = Promise.withResolvers<Child>();
  readonly #breakpoints = new Map<"before" | "after", Breakpoint>();
  readonly #children = new Map<string, Child>();
  #waiting = Promise.withResolvers<Pause>();
  #pause: Pause | null = null;
  #unsubscribe: (() => void) | null = null;
  #failure: Error | null = null;
  #consumed = false;
  #settled = false;
  #continued = false;
  #continuationStarted = false;
  #childStartRequested = false;
  #released = false;
  #releaseStarted = false;
  #bracket = false;
  #commands = 0;
  #uncertain = 0;
  #packet: CurrentPcb209RatlineCreationPacket | null = null;
  #worker: string | null = null;
  #manager: string | null = null;
  #watchdog: ReturnType<typeof setTimeout> | null = null;
  #cleanupPending: Promise<void> | null = null;
  #cleanupRequested = false;
  public constructor(key: typeof INTERNAL, role: CurrentPcb209RatlineCreationRole, transport: CurrentPcb209RatlineCreationTransport) {
    need(key === INTERNAL, "PROFILE"); this.#role = role; this.#transport = transport; this.#original = members(transport);
    this.#scriptId = token.parse(transport.scriptId); this.#parent = token.parse(transport.parentSessionId); this.#target = token.parse(transport.parentTargetId);
    this.#request = transport.request; this.#assert = transport.assertOriginalPinnedParentAndAutoAttach;
    this.#terminate = transport.assertOriginalTermination; this.#subscribe = transport.subscribe;
    void observed(this.#armed.promise); void observed(this.#waiting.promise); void observed(this.#childReady.promise);
  }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ consumed: this.#consumed, settled: this.#settled, failed: this.#failure !== null,
    parentContinued: this.#continued, childStartRequested: this.#childStartRequested,
    parentPaused: this.#pause !== null && !this.#pause.resumed, retainedChildren: this.#children.size,
    commands: this.#commands, uncertainBreakpoints: this.#uncertain,
    unresolvedBreakpoints: this.#uncertain > 0 || [...this.#breakpoints.values()].some(value => !value.removed), released: this.#released }); }
  #same(): void { need(members(this.#transport).every((value, index) => value === this.#original[index]), "OWNER_CHANGED"); }
  async #current(): Promise<void> {
    try { this.#same(); need(this.#failure === null && !this.#released && !this.#releaseStarted, "FAILED_OR_RELEASED");
      await bounded(this.#assert.call(this.#transport, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role])); this.#same();
      need(this.#failure === null && !this.#released && !this.#releaseStarted, "FAILED_OR_RELEASED");
    } catch (error) { this.#poison("OWNER_LOST"); void observed(this.#cleanup()); throw error; }
  }
  #poison(code: string): void { this.#failure ??= fail(code); this.#waiting.reject(this.#failure); this.#childReady.reject(this.#failure); this.#armed.reject(this.#failure); }
  async #send(command: CurrentPcb209RatlineCreationCommand): Promise<unknown> {
    await this.#current(); need(this.#commands < 24, "BUDGET"); this.#commands += 1;
    const reply = captureCurrentPcbStringClockReply(await bounded(this.#request.call(this.#transport, command))).value;
    await this.#current(); return reply;
  }
  async #cleanupSend(command: CurrentPcb209RatlineCreationCommand): Promise<void> {
    this.#same(); need(this.#commands < 32, "CLEANUP_BUDGET"); this.#commands += 1;
    const reply = await bounded(this.#request.call(this.#transport, command));
    empty.parse(captureCurrentPcbStringClockReply(reply).value); this.#same();
  }
  readonly #paused = (input: unknown): void => {
    if (this.#continued) { return; }
    if (this.#pause !== null && !this.#pause.resumed) { this.#poison("DUPLICATE_PAUSE"); return; }
    let capturedError: unknown = null, event: unknown = null;
    try { event = captureCurrentPcbStringClockReply(input).value; } catch (error) { capturedError = error; }
    const retained: Pause = { event, error: capturedError, observed: Promise.withResolvers(), resume: null, resumed: false };
    this.#pause = retained; this.#waiting.resolve(retained);
    if (this.#failure !== null || this.#settled) { this.#poison("EXTRA_PAUSE"); void observed(this.#cleanup()); }
  };
  readonly #resumed = (): void => {
    if (this.#continued && this.#pause?.resumed === true) { return; }
    const paused = this.#pause;
    if (paused === null || paused.resumed || paused.resume === null) { this.#poison("UNEXPECTED_RESUME"); }
    if (paused !== null) { paused.resumed = true; paused.observed.resolve(null); }
  };
  readonly #attached = (input: unknown): void => {
    try {
      const event = attachmentSchema.parse(captureCurrentPcbStringClockReply(input).value);
      const child = event.params, info = child.targetInfo;
      need(event.sessionId === this.#parent && child.sessionId !== this.#parent && info.targetId !== this.#target && info.type === "worker" && info.attached, "CHILD_OWNER");
      need(this.#children.size < 4 && !this.#children.has(child.sessionId) && ![...this.#children.values()].some(value => value.targetId === info.targetId), "DUPLICATE_CHILD");
      const retained: Child = { targetId: info.targetId, sessionId: child.sessionId, title: info.title, url: info.url, release: null };
      this.#children.set(child.sessionId, retained);
      need(this.#bracket && this.#children.size === 1 && !this.#settled, "CHILD_ORDER"); this.#childReady.resolve(retained);
    } catch { this.#poison("ATTACHMENT"); void observed(this.#cleanup()); }
  };
  readonly #lost = (): void => { this.#poison("OWNER_LOST"); void observed(this.#cleanup()); };
  #resume(paused: Pause): Promise<void> {
    if (paused.resume === null) {
      const completion = Promise.withResolvers<undefined>(); paused.resume = completion.promise;
      void settle((async (): Promise<void> => {
        await this.#cleanupSend({ method: "Debugger.resume", sessionId: this.#parent, params: {} }); await bounded(paused.observed.promise);
      })(), completion);
    }
    return paused.resume;
  }
  #removeBreakpoint(breakpoint: Breakpoint): Promise<void> {
    if (breakpoint.removal === null) {
      const completion = Promise.withResolvers<undefined>(); breakpoint.removal = completion.promise;
      void settle((async (): Promise<void> => {
        await this.#cleanupSend({ method: "Debugger.removeBreakpoint", sessionId: this.#parent, params: { breakpointId: breakpoint.id } }); breakpoint.removed = true;
      })(), completion);
    }
    return breakpoint.removal;
  }
  #releaseChild(child: Child): Promise<void> {
    if (child.release === null) {
      const completion = Promise.withResolvers<undefined>(); child.release = completion.promise;
      void settle(this.#cleanupSend({ method: "Runtime.runIfWaitingForDebugger", sessionId: child.sessionId, params: {} }), completion);
    }
    return child.release;
  }
  async #remove(): Promise<void> {
    const failures: unknown[] = [];
    for (const breakpoint of this.#breakpoints.values()) {
      try { await this.#removeBreakpoint(breakpoint); } catch (error) { failures.push(error); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, "PCB209_RATLINE_CREATION_REMOVE"); }
  }
  #cleanup(): Promise<void> {
    if (this.#cleanupPending !== null) { this.#cleanupRequested = true; return this.#cleanupPending; }
    const completion = Promise.withResolvers<undefined>(); this.#cleanupPending = completion.promise;
    void settle((async (): Promise<void> => {
      try {
        do { this.#cleanupRequested = false; await this.#cleanupPass(); } while (this.#cleanupRequested);
      } finally {
        this.#cleanupPending = null;
        if (this.#cleanupRequested) { void observed((async (): Promise<void> => { await Promise.resolve(); await this.#cleanup(); })()); }
      }
    })(), completion);
    return completion.promise;
  }
  async #cleanupPass(): Promise<void> {
    const failures: unknown[] = []; if (this.#watchdog !== null) { clearTimeout(this.#watchdog); }
    // A missing allocation reply or failed removal leaves executable pauses
    // Unresolved. Never resume code until every original breakpoint is removed.
    await this.#remove(); need(this.#uncertain === 0, "UNRESOLVED_BREAKPOINTS");
    if (this.#pause !== null && !this.#pause.resumed) { try { await this.#resume(this.#pause); } catch (error) { failures.push(error); } }
    for (const child of this.#children.values()) {
      try { await this.#releaseChild(child); } catch (error) { failures.push(error); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, "PCB209_RATLINE_CREATION_CLEANUP"); }
  }
  async #arm(name: "before" | "after"): Promise<void> {
    const point = PROFILES[this.#role][name], requested = { scriptId: this.#scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber };
    await this.#current(); need(this.#commands < 24, "BUDGET"); this.#commands += 1; this.#uncertain += 1;
    const pending = (async (): Promise<void> => {
      const raw = await this.#request.call(this.#transport, { method: "Debugger.setBreakpoint", sessionId: this.#parent, params: { location: requested } });
      const reply = z.object({ breakpointId: token, actualLocation: location }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
      this.#breakpoints.set(name, { id: reply.breakpointId, removal: null, removed: false }); this.#uncertain -= 1;
      if (this.#failure !== null) { void observed(this.#cleanup()); }
      need(JSON.stringify(reply.actualLocation) === JSON.stringify(requested), "BREAKPOINT_RELOCATED");
    })(); await bounded(pending); await this.#current();
  }
  async #next(name: "before" | "after"): Promise<Readonly<{ retained: Pause; frameId: string }>> {
    const retained = await bounded(this.#waiting.promise, 20_000); this.#waiting = Promise.withResolvers(); void observed(this.#waiting.promise);
    await this.#current(); need(retained.error === null, "PAUSE_CAPTURE");
    const event = pauseSchema.parse(retained.event), point = PROFILES[this.#role][name], top = event.callFrames[0];
    need(top !== undefined && top.functionName === "addWorker" && event.hitBreakpoints[0] === this.#breakpoints.get(name)?.id &&
      top.location.scriptId === this.#scriptId && top.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber, "PAUSE_LOCATION");
    return { retained, frameId: top.callFrameId };
  }
  #select(frameId: string, expression: Expression, returnByValue: boolean): Promise<unknown> {
    return this.#send({ method: "Debugger.evaluateOnCallFrame", sessionId: this.#parent, params: { callFrameId: frameId, expression,
      objectGroup: GROUP, returnByValue, silent: true, throwOnSideEffect: true, generatePreview: false, includeCommandLineAPI: false } });
  }
  async #object(frameId: string, expression: Expression): Promise<string> {
    return z.object({ result: z.looseObject({ type: z.literal("object"), objectId: token }) }).strict().parse(await this.#select(frameId, expression, false)).result.objectId;
  }
  async #string(frameId: string, expression: Expression): Promise<string> {
    return z.object({ result: z.looseObject({ type: z.literal("string"), value: z.string().max(4096) }) }).strict().parse(await this.#select(frameId, expression, true)).result.value;
  }
  async #inventory(): Promise<readonly z.infer<typeof targetSchema>[]> {
    const values = z.object({ targetInfos: z.array(targetSchema).max(256) }).strict().parse(await this.#send({ method: "Target.getTargets", params: {} })).targetInfos;
    need(new Set(values.map(value => value.targetId)).size === values.length, "INVENTORY_DUPLICATE");
    need(values.some(value => value.targetId === this.#target && value.attached), "INVENTORY_PARENT"); return values;
  }
  public async whenArmed(): Promise<void> { await this.#armed.promise; await this.#current(); }
  public async capture(): Promise<CurrentPcb209RatlineCreationPacket> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      await this.#current(); this.#unsubscribe = this.#subscribe.call(this.#transport, { paused: this.#paused, resumed: this.#resumed, attached: this.#attached, lost: this.#lost });
      need(typeof this.#unsubscribe === "function", "SUBSCRIPTION"); await this.#arm("before"); await this.#arm("after"); this.#armed.resolve(null);
      const before = await this.#next("before"), profile = PROFILES[this.#role];
      const url = await this.#string(before.frameId, profile.url);
      const name = await this.#string(before.frameId, profile.name);
      need(name === "pcb-ratline-worker" && /^editor\?entry=pcb-ratline-worker\.js(?:&[^#\\\s]*)?$/u.test(url), "CONSTRUCTOR_ARGUMENTS");
      if (this.#role === "worker") { need(url === "editor?entry=pcb-ratline-worker.js", "SUBORDINATE_URL"); }
      const resolved = new URL(url, "https://client/").href;
      const inventory = await this.#inventory();
      need(!inventory.some(value => value.targetId !== this.#target && value.type === "worker" && (value.title === name || value.url === resolved)), "EXISTING_CHILD");
      this.#bracket = true; await this.#resume(before.retained);
      const after = await this.#next("after"); this.#worker = await this.#object(after.frameId, profile.worker); this.#manager = await this.#object(after.frameId, "this");
      const child = await bounded(this.#childReady.promise); await this.#current();
      need(child.url === resolved && child.title === name && this.#children.size === 1, "CHILD_ARGUMENTS");
      const final = await this.#inventory(), prior = new Map(inventory.map(value => [value.targetId, value]));
      need(final.length === inventory.length + 1 && final.filter(value => !prior.has(value.targetId)).length === 1, "INVENTORY_DELTA");
      for (const value of final) {
        const original = prior.get(value.targetId);
        if (original === undefined) { need(value.targetId === child.targetId && value.url === child.url && value.title === child.title && value.attached && value.type === "worker", "INVENTORY_CHILD"); }
        else { need(JSON.stringify(value) === JSON.stringify(original), "INVENTORY_CHANGED"); }
      }
      await this.#remove(); await this.#current(); need(this.#pause === after.retained && !after.retained.resumed, "PARENT_NOT_HELD");
      this.#packet = Object.freeze({ profile: "private.current-pcb209-ratline-creation-boundary.v1", role: this.#role,
        sourceSha256: CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role].sha256, constructorBoundaryObserved: true, soleWaitingChildObserved: true,
        requestedUrlSha256: createHash("sha256").update(url).digest("hex"), childTargetId: child.targetId, childSessionId: child.sessionId,
        parentHeldAfterConstruction: true, nativeWorkerTargetIdentityVerified: false, childSourceQualified: false, executionAuthorized: false });
      this.#watchdog = setTimeout(() => { this.#poison("CONTINUATION_DEADLINE"); void observed(this.#cleanup()); }, 6000);
      return this.#packet;
    } catch (error) { this.#poison("FAILED");
      try { await this.#cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_RATLINE_CREATION_FAILED", { cause: cleanupError }); } throw error;
    } finally { this.#settled = true; }
  }
  public async requireOriginal(packet: CurrentPcb209RatlineCreationPacket): Promise<Readonly<{ workerObjectId: string; managerObjectId: string; childSessionId: string }>> {
    need(this.#packet !== null && packet === this.#packet && this.#worker !== null && this.#manager !== null, "ORIGINAL_PACKET"); await this.#current();
    return Object.freeze({ workerObjectId: this.#worker, managerObjectId: this.#manager, childSessionId: packet.childSessionId });
  }
  /** The next original stage must arm its factory/bridge observers before this
   * continuation. Child execution stays held for its separate source qualifier. */
  public async continueOriginalParent(packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    need(!this.#continuationStarted && this.#packet !== null && packet === this.#packet, "CONTINUATION_CONSUMED"); this.#continuationStarted = true; await this.requireOriginal(packet);
    need(this.#pause !== null && !this.#pause.resumed, "PARENT_NOT_HELD"); this.#continued = true;
    if (this.#watchdog !== null) { clearTimeout(this.#watchdog); }
    try { await this.#resume(this.#pause); await this.#current(); } catch (error) { this.#poison("CONTINUATION_FAILED"); await this.#cleanup(); throw error; }
  }
  /** Only the private successor may call this after arming its original child
   * instrumentation. Normal bootstrap start and failure cleanup share the same
   * consumed promise; a successor must never dispatch a separate start. */
  public async startOriginalChild(packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    need(!this.#childStartRequested && this.#packet !== null && packet === this.#packet, "CHILD_START_CONSUMED"); this.#childStartRequested = true;
    try {
      await this.requireOriginal(packet); const child = this.#children.get(packet.childSessionId);
      need(child !== undefined && child.targetId === packet.childTargetId, "ORIGINAL_CHILD");
      await this.#releaseChild(child); await this.#current();
    } catch (error) { this.#poison("CHILD_START_FAILED"); await this.#cleanup(); throw error; }
  }
  /** Failure cleanup is one-shot per original resume/child-start request. */
  public async abort(): Promise<void> { need(this.#consumed && !this.#released, "ABORT_STATE"); this.#poison("ABORTED"); await this.#cleanup(); }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#settled && !this.#released && !this.#releaseStarted, "RELEASE_STATE"); this.#releaseStarted = true;
    try { this.#same(); await bounded(this.#terminate.call(this.#transport)); this.#same();
      if (this.#watchdog !== null) { clearTimeout(this.#watchdog); } this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
    } finally { this.#releaseStarted = false; }
  }
}
export class CurrentPcb209RatlinePcbCreation extends CurrentPcb209RatlineCreationCore {
  public constructor(transport: CurrentPcb209RatlineCreationTransport) { super(INTERNAL, "pcb", transport); }
}
export class CurrentPcb209RatlineWorkerCreation extends CurrentPcb209RatlineCreationCore {
  public constructor(transport: CurrentPcb209RatlineCreationTransport) { super(INTERNAL, "worker", transport); }
}
