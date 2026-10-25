/** Private same-realm composition of the fixed209 construction and capture
 * owners. It routes original allocated breakpoint IDs, never a supplied trace.
 * The containing native owner still owns its unchanged total request budget. */
import { types } from "node:util";
import { CurrentPcb209RatlineStageDiagnostics } from "./current-pcb-209-ratline-diagnostics.ts";
import { bindCurrentPcb209RatlinePcbTransport } from "./current-pcb-209-ratline-transport-windows.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CurrentPcb209RatlinePcbCreation, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationCommand, CurrentPcb209RatlineCreationTransport } from "./current-pcb-209-ratline-creation-runner.ts";
import { CurrentPcb209RatlinePcbCapture, CurrentPcb209RatlinePcbHeldCapture, CurrentPcb209RatlineWorkerCapture } from "./current-pcb-209-ratline-capture-runner.ts";
import type { CurrentPcb209RatlineAnyCapturePacket, CurrentPcb209RatlineCaptureCommand, CurrentPcb209RatlineCaptureTransport } from "./current-pcb-209-ratline-capture-runner.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_GROUP as GROUP } from "./current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureScope } from "./current-pcb-209-ratline-capture-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as PROGRAMS } from "./current-pcb-209-ratline-capture-program.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";

export type CurrentPcb209RatlineRealmCommand = CurrentPcb209RatlineCreationCommand |
  (CurrentPcb209RatlineCaptureCommand & Readonly<{ sessionId: string }>);
/** Executable authority supplied only by a retained original source owner.
 * The adapter must bind all events to this exact parent realm and preserve its
 * original source, process, context and recursive attachment across awaits. */
export interface CurrentPcb209RatlineRealmDependency extends Omit<CurrentPcb209RatlineCreationTransport, "request"> {
  readonly request: (command: CurrentPcb209RatlineRealmCommand) => Promise<unknown>;
}
type Stage = "creation" | "capture";
type Role = "pcb" | "worker";
type Events = Parameters<CurrentPcb209RatlineCreationTransport["subscribe"]>[0];
type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
type Capture = CurrentPcb209RatlinePcbCapture | CurrentPcb209RatlineWorkerCapture | CurrentPcb209RatlinePcbHeldCapture;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const breakpointReply = z.object({ breakpointId: token, actualLocation: z.object({ scriptId: token,
  lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict() }).strict();
const pauseFrame = z.looseObject({ location: z.looseObject({ scriptId: token }) });
const pauseSchema = z.looseObject({ hitBreakpoints: z.array(token).length(1), callFrames: z.array(pauseFrame).min(1).max(32) });
interface Allocation { readonly stage: Stage; removed: boolean }
interface HeldPause { readonly stage: Stage; resumeRequested: boolean }
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_DISPATCH_${code}`); } }
async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original consumer retains the failure.
  }
}
function members(value: CurrentPcb209RatlineRealmDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["scriptId", "parentTargetId", "parentSessionId", "assertOriginalPinnedParentAndAutoAttach", "assertOriginalTermination", "request", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 3 ? "string" : "function"), "DEPENDENCY");
    return descriptor.value as unknown; });
}
function stageMethods(value: object, names: readonly string[]): readonly unknown[] {
  const prototype: unknown = Object.getPrototypeOf(value); need(prototype !== null && typeof prototype === "object", "STAGE_PROTOTYPE");
  const base: unknown = Object.getPrototypeOf(prototype); need(base !== null && typeof base === "object", "STAGE_PROTOTYPE");
  return [prototype, base, ...names.map(name => {
    need(Object.getOwnPropertyDescriptor(value, name) === undefined && Object.getOwnPropertyDescriptor(prototype, name) === undefined, "STAGE_OVERRIDE");
    const descriptor = Object.getOwnPropertyDescriptor(base, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "STAGE_METHOD");
    return descriptor.value as unknown;
  })];
}
function stageIdentities(creation: Creation, capture: Capture): readonly unknown[] {
  return [...stageMethods(creation, ["status", "capture", "whenArmed", "requireOriginal", "continueOriginalParent", "startOriginalChild", "abort", "releaseAfterTermination"]),
    ...stageMethods(capture, ["status", "capture", "whenArmed", "requireOriginal", "abort", "releaseAfterTermination"])];
}
export class CurrentPcb209RatlineEventDispatcher {
  readonly #diagnostics = new CurrentPcb209RatlineStageDiagnostics();
  readonly #dependency: CurrentPcb209RatlineRealmDependency;
  readonly #original: readonly unknown[];
  readonly #request: CurrentPcb209RatlineRealmDependency["request"];
  readonly #assert: CurrentPcb209RatlineRealmDependency["assertOriginalPinnedParentAndAutoAttach"];
  readonly #terminate: CurrentPcb209RatlineRealmDependency["assertOriginalTermination"];
  readonly #role: Role;
  readonly #scope: CurrentPcb209RatlineCaptureScope;
  readonly #listeners = new Map<Stage, Events>();
  readonly #allocations = new Map<string, Allocation>();
  readonly #cleanupReady = Promise.withResolvers<null>();
  readonly #sourceResumed = Promise.withResolvers<null>();
  readonly #stages: Readonly<{ creation: Creation; capture: Capture }>;
  readonly #creationStatus: Creation["status"];
  readonly #captureStatus: Capture["status"];
  readonly #stageIdentities: readonly unknown[];
  #unsubscribe: (() => void) | null = null;
  #pause: HeldPause | null = null;
  #deferredPause: unknown = null;
  #uncertain = 0;
  #failed = false;
  #claimed = false;
  #released = false;
  #releaseStarted = false;
  #sourceContinuationConsumed = false;
  #sourceResumePending = false;
  #constructionComparisonConsumed = false;
  public constructor(role: Role, dependency: CurrentPcb209RatlineRealmDependency, scope: CurrentPcb209RatlineCaptureScope = "full") {
    need((role === "pcb" || role === "worker") && (scope === "full" || scope === "pcb-held-prefix" && role === "pcb"), "ROLE");
    this.#role = role; this.#scope = scope; this.#dependency = dependency; this.#original = members(dependency);
    token.parse(dependency.scriptId); token.parse(dependency.parentSessionId); token.parse(dependency.parentTargetId);
    this.#request = dependency.request; this.#assert = dependency.assertOriginalPinnedParentAndAutoAttach; this.#terminate = dependency.assertOriginalTermination;
    void observed(this.#cleanupReady.promise); void observed(this.#sourceResumed.promise);
    const creationTransport: CurrentPcb209RatlineCreationTransport = {
      scriptId: dependency.scriptId, parentSessionId: dependency.parentSessionId, parentTargetId: dependency.parentTargetId,
      assertOriginalPinnedParentAndAutoAttach: source => this.#current(source), assertOriginalTermination: () => this.#originalTermination(),
      request: command => this.#send("creation", command), subscribe: events => this.#subscribe("creation", events),
    };
    const captureTransport: CurrentPcb209RatlineCaptureTransport = {
      scriptId: dependency.scriptId, assertOriginalPinnedRealm: source => this.#current(source), assertOriginalTermination: () => this.#originalTermination(),
      request: command => this.#send("capture", { ...command, sessionId: dependency.parentSessionId }),
      subscribe: events => this.#subscribe("capture", { ...events, attached: (): void => { this.#poison(new Error("PCB209_RATLINE_DISPATCH_CAPTURE_ATTACHMENT")); } }),
    };
    if (role === "pcb") { bindCurrentPcb209RatlinePcbTransport(creationTransport); bindCurrentPcb209RatlinePcbTransport(captureTransport); }
    this.#stages = Object.freeze(role === "pcb" ? { creation: new CurrentPcb209RatlinePcbCreation(creationTransport), capture: scope === "pcb-held-prefix" ?
      new CurrentPcb209RatlinePcbHeldCapture(captureTransport) : new CurrentPcb209RatlinePcbCapture(captureTransport) } :
      { creation: new CurrentPcb209RatlineWorkerCreation(creationTransport), capture: new CurrentPcb209RatlineWorkerCapture(captureTransport) });
    // oxlint-disable-next-line typescript/unbound-method -- Retain exact methods for identity checks; every invocation below uses the original receiver via call.
    this.#creationStatus = this.#stages.creation.status; this.#captureStatus = this.#stages.capture.status;
    this.#stageIdentities = stageIdentities(this.#stages.creation, this.#stages.capture);
    this.#unsubscribe = dependency.subscribe({ paused: this.#paused, resumed: this.#resumed, attached: this.#attached, lost: this.#lost });
    need(typeof this.#unsubscribe === "function", "SUBSCRIPTION");
  }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ ...this.#diagnostics.snapshot(), role: this.#role, scope: this.#scope,
    failed: this.#failed, released: this.#released, uncertainBreakpoints: this.#uncertain, retainedBreakpoints: this.#allocations.size,
    sourceContinuationConsumed: this.#sourceContinuationConsumed, sourceResumePending: this.#sourceResumePending,
    paused: this.#pause !== null, deferredPause: this.#deferredPause !== null }); }
  public claimOriginalStages(): Readonly<{ creation: Creation; capture: Capture }> {
    this.#same(); need(!this.#claimed && !this.#failed && !this.#released, "STAGES_CONSUMED"); this.#claimed = true; return this.#stages;
  }
  #same(): void {
    need(members(this.#dependency).every((value, index) => value === this.#original[index]), "OWNER_CHANGED");
    need(stageIdentities(this.#stages.creation, this.#stages.capture).every((value, index) => value === this.#stageIdentities[index]), "STAGES_CHANGED");
  }
  public async requireOriginal(): Promise<void> { await this.#current(CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role]); }
  async #current(source: Readonly<{ relativePath: string; bytes: number; sha256: string }>): Promise<void> {
    this.#diagnostics.step = "owner-reproof";
    try {
      this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted && source === CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role], "NOT_CURRENT");
      await this.#assert.call(this.#dependency, source); this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted, "NOT_CURRENT");
    } catch (error) { this.#poison(error); throw error; }
  }
  async #originalTermination(): Promise<void> { this.#same(); await this.#terminate.call(this.#dependency); this.#same(); }
  #subscribe(stage: Stage, events: Events): () => void {
    this.#same(); need(!this.#listeners.has(stage) && !this.#released, "SUBSCRIPTION_CONSUMED"); this.#listeners.set(stage, events);
    if (this.#failed) { events.lost(); }
    return (): void => { need(this.#listeners.get(stage) === events, "SUBSCRIPTION_CHANGED"); this.#listeners.delete(stage); };
  }
  #ready(): void {
    if (this.#failed && this.#uncertain === 0 && [...this.#allocations.values()].every(value => value.removed)) { this.#cleanupReady.resolve(null); }
  }
  #poison(cause: unknown = new Error("PCB209_RATLINE_DISPATCH_ABORTED")): void {
    this.#diagnostics.record(cause);
    if (!this.#failed) { this.#failed = true; for (const events of this.#listeners.values()) { events.lost(); } }
    this.#ready();
  }
  readonly #lost = (): void => { this.#diagnostics.lastEvent = "lost"; this.#poison(new Error("PCB209_RATLINE_DISPATCH_STREAM_LOST")); };
  readonly #attached = (event: unknown): void => {
    this.#diagnostics.lastEvent = "attached"; this.#diagnostics.step = "event-routing";
    const events = this.#listeners.get("creation"); if (events === undefined) { this.#poison(new Error("PCB209_RATLINE_DISPATCH_CREATION_SUBSCRIBER")); return; }
    events.attached(event);
  };
  readonly #paused = (input: unknown): void => {
    this.#diagnostics.lastEvent = "paused"; this.#diagnostics.step = "event-routing";
    try {
      this.#same(); need(!this.#released && this.#pause === null && this.#deferredPause === null, "DUPLICATE_PAUSE");
      const captured = captureCurrentPcbStringClockReply(input).value, event = pauseSchema.parse(captured);
      need(event.callFrames[0]?.location.scriptId === this.#dependency.scriptId, "PAUSE_REALM");
      const id = event.hitBreakpoints[0]; need(id !== undefined, "PAUSE_BREAKPOINT"); const allocation = this.#allocations.get(id);
      if (allocation === undefined && this.#uncertain > 0) { this.#deferredPause = captured; return; }
      need(allocation !== undefined, "UNKNOWN_BREAKPOINT"); const events = this.#listeners.get(allocation.stage); need(events !== undefined, "PAUSE_SUBSCRIPTION");
      this.#pause = { stage: allocation.stage, resumeRequested: false };
      if (allocation.removed) { this.#poison(new Error("PCB209_RATLINE_DISPATCH_REMOVED_BREAKPOINT")); } events.paused(captured);
    } catch (error) { this.#poison(error); }
  };
  readonly #resumed = (): void => {
    this.#diagnostics.lastEvent = "resumed"; this.#diagnostics.step = "event-routing";
    if (this.#sourceResumePending && this.#pause === null) {
      this.#sourceResumePending = false; this.#sourceResumed.resolve(null); return;
    }
    const pause = this.#pause;
    if (pause === null || !pause.resumeRequested) { this.#poison(new Error("PCB209_RATLINE_DISPATCH_UNEXPECTED_RESUME")); return; }
    // Clear the realm slot before delivery: the next original pause may arrive
    // Synchronously from the same request, owned by a different stage.
    this.#pause = null; this.#listeners.get(pause.stage)?.resumed();
  };
  /** The source owner already holds its qualified pre-execution pause. Retain
   * The consumed continuation before dispatch so its synchronous resumed event
   * Is not mistaken for a construction or capture-stage resume. */
  public async continueOriginalSource(releaseOriginal: () => Promise<void>): Promise<void> {
    this.#diagnostics.stage = "source-continuation"; this.#diagnostics.step = "source-resume";
    need(this.#claimed && !this.#sourceContinuationConsumed, "SOURCE_CONTINUATION_CONSUMED"); this.#sourceContinuationConsumed = true;
    try {
      await this.requireOriginal(); need(this.#pause === null && this.#deferredPause === null, "SOURCE_NOT_HELD");
      this.#sourceResumePending = true;
      await releaseOriginal(); await this.#sourceResumed.promise; await this.requireOriginal();
    } catch (error) { this.#poison(error); throw error; }
  }
  async #send(stage: Stage, command: CurrentPcb209RatlineRealmCommand): Promise<unknown> {
    this.#diagnostics.stage = stage;
    this.#diagnostics.lastCommand = command.method; this.#diagnostics.step = "native-request";
    this.#same(); need(!this.#released, "RELEASED");
    if (this.#creationStatus.call(this.#stages.creation)["failed"] === true || this.#captureStatus.call(this.#stages.capture)["failed"] === true) { this.#poison(new Error("PCB209_RATLINE_DISPATCH_STAGE_FAILED")); }
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.runIfWaitingForDebugger";
    need(!this.#failed || cleanup, "FAILED");
    if (command.method === "Debugger.resume" || command.method === "Runtime.runIfWaitingForDebugger") {
      if (this.#failed) { await this.#cleanupReady.promise; this.#same(); need(!this.#released, "RELEASED"); }
      if (command.method === "Debugger.resume") {
        need(command.sessionId === this.#dependency.parentSessionId && this.#pause?.stage === stage && !this.#pause.resumeRequested, "RESUME_OWNER");
        this.#pause.resumeRequested = true;
      }
    }
    if (command.method === "Debugger.setBreakpoint") {
      need(command.sessionId === this.#dependency.parentSessionId && command.params.location.scriptId === this.#dependency.scriptId, "ALLOCATION_REALM");
      this.#uncertain += 1;
      try {
        const raw = await this.#request.call(this.#dependency, command), reply = breakpointReply.parse(captureCurrentPcbStringClockReply(raw).value);
        need(!this.#allocations.has(reply.breakpointId), "DUPLICATE_ALLOCATION"); this.#allocations.set(reply.breakpointId, { stage, removed: false }); this.#uncertain -= 1;
        // The runner must retain the returned ID before a pause delivered before
        // Its allocation acknowledgment can be routed back to it.
        setImmediate(() => { if (this.#deferredPause !== null) { const input = this.#deferredPause; this.#deferredPause = null; this.#paused(input); } });
        this.#ready(); return raw;
      } catch (error) { this.#poison(error); throw error; }
    }
    if (command.method === "Debugger.removeBreakpoint") {
      const allocation = this.#allocations.get(command.params.breakpointId);
      need(command.sessionId === this.#dependency.parentSessionId && allocation?.stage === stage && !allocation.removed, "REMOVAL_OWNER");
      try {
        const raw = await this.#request.call(this.#dependency, command); z.object({}).strict().parse(captureCurrentPcbStringClockReply(raw).value);
        allocation.removed = true; this.#ready(); return raw;
      } catch (error) { this.#poison(error); throw error; }
    }
    return this.#request.call(this.#dependency, command);
  }
  /** Only same-realm retained handles are compared; this establishes no child
   * CDP target identity, cross-realm object equality or callback completion. */
  public async requireOriginalConstruction(creationPacket: Parameters<Creation["requireOriginal"]>[0],
    capturePacket: CurrentPcb209RatlineAnyCapturePacket): Promise<void> {
    need(!this.#constructionComparisonConsumed, "CONSTRUCTION_COMPARISON_CONSUMED"); this.#constructionComparisonConsumed = true;
    await this.requireOriginal();
    const construction = await this.#stages.creation.requireOriginal(creationPacket);
    const captured = await this.requireOriginalCapture(capturePacket);
    await this.requireOriginal();
    if (this.#scope === "pcb-held-prefix") {
      const manager = captured["manager"], worker = captured["childWorker"];
      need(worker !== undefined && manager !== undefined, "ORIGINAL_OBJECTS");
      const raw = await this.#request.call(this.#dependency, { method: "Runtime.callFunctionOn", sessionId: this.#dependency.parentSessionId,
        params: { objectId: construction.workerObjectId, functionDeclaration: PROGRAMS.construction,
          arguments: [worker, construction.managerObjectId, manager].map(objectId => ({ objectId })), objectGroup: GROUP,
          returnByValue: true, silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } });
      await this.requireOriginal();
      z.object({ result: z.looseObject({ type: z.literal("boolean"), value: z.literal(true) }) }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
      return;
    }
    for (const [first, second] of [[construction.workerObjectId, captured["childWorker"]], [construction.managerObjectId, captured["manager"]]] as const) {
      need(first !== undefined && second !== undefined, "ORIGINAL_OBJECTS");
      const raw = await this.#request.call(this.#dependency, { method: "Runtime.callFunctionOn", sessionId: this.#dependency.parentSessionId,
        params: { objectId: first, functionDeclaration: PROGRAMS.same, arguments: [{ objectId: second }], objectGroup: GROUP,
          returnByValue: true, silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } });
      await this.requireOriginal(); const reply = z.object({ result: z.looseObject({ type: z.literal("boolean"), value: z.literal(true) }) }).strict();
      reply.parse(captureCurrentPcbStringClockReply(raw).value);
    }
  }
  /** Each scope accepts only its actual capture owner and original packet. */
  public requireOriginalCapture(packet: CurrentPcb209RatlineAnyCapturePacket): Promise<Readonly<Record<string, string>>> {
    this.#same(); const capture = this.#stages.capture;
    if (packet.profile === "private.current-pcb209-ratline-pcb-held-prefix-capture.v1") {
      need(this.#scope === "pcb-held-prefix" && capture instanceof CurrentPcb209RatlinePcbHeldCapture, "ORIGINAL_OBJECTS");
      return capture.requireOriginal(packet);
    }
    need(this.#scope === "full" && !(capture instanceof CurrentPcb209RatlinePcbHeldCapture), "ORIGINAL_OBJECTS");
    return capture.requireOriginal(packet);
  }
  public abort(): void { this.#poison(); }
  public async releaseAfterTermination(): Promise<void> {
    need(!this.#released && !this.#releaseStarted, "RELEASE_STATE"); this.#releaseStarted = true;
    try { await this.#originalTermination(); this.#released = true; this.#cleanupReady.reject(new Error("PCB209_RATLINE_DISPATCH_TERMINATED"));
      this.#sourceResumed.reject(new Error("PCB209_RATLINE_DISPATCH_TERMINATED"));
      this.#unsubscribe?.(); this.#unsubscribe = null; this.#deferredPause = null;
    } finally { this.#releaseStarted = false; }
  }
}
