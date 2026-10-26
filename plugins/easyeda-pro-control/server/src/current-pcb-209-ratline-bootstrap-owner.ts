/* oxlint-disable import/max-dependencies -- The original child owner joins fixed source qualification, creation ownership, native grammar and the cumulative source deadline profile. */
/** Original waiting-child source owner. The native ratline purpose adopts it
 * through the held import. Creation alone consumes the child's initial start. */
import { types } from "node:util";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE, currentPcb209RatlineSourceBudget } from "./current-pcb-209-ratline-budget.ts";
import { z } from "zod";
import { isCurrentPcb209ContinuedSourceSeal, issueCurrentPcb209ContinuedSourceSeal } from "./current-pcb-209-ratline-continuation-handoff.ts";
import type { CurrentPcb209ContinuedSourceSeal } from "./current-pcb-209-ratline-continuation-handoff.ts";
import { CurrentPcb209RatlinePcbCreation, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationPacket } from "./current-pcb-209-ratline-creation-runner.ts";
import { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, currentPcb209RatlineBootstrapRoleUrl,
  qualifyCurrentPcb209RatlineBootstrapSource, qualifyCurrentPcb209RatlineBootstrapUrl } from "./current-pcb-209-ratline-bootstrap-profile.ts";
import type { CurrentPcb209RatlineBootstrapRole } from "./current-pcb-209-ratline-bootstrap-profile.ts";
import { CURRENT_PCB_209_WORKER_PRELOAD_LOG, currentPcb209PreloadCopyCaller, qualifyCurrentPcb209PreloadCopyCreator,
  qualifyCurrentPcb209PreloadCopyPause } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcb209RatlineRealmCommand, CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";
import { currentPcb209RatlineNativeWire } from "./current-pcb-209-ratline-native-wire.ts";
import { currentPcb209RatlineEventKind, currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import type { CurrentPcb209RatlineEventKind } from "./current-pcb-209-ratline-diagnostics.ts";
import { retainCurrentPcb209RatlineAllocation } from "./current-pcb-209-ratline-transport-windows.ts";
import { currentPcb209RatlineContinuationTiming, inheritCurrentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import type { CurrentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { captureCurrentPcb209RatlineStopRecord } from "./current-pcb-209-ratline-stop-observation.ts";
import type { CurrentPcb209RatlineStopCapture } from "./current-pcb-209-ratline-stop-observation.ts";

const monotonic = process.hrtime.bigint.bind(process.hrtime);
type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
export type CurrentPcb209RatlineBootstrapCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_WORKER_STARTUP_ATTACH }>
  | Readonly<{ method: "Runtime.enable" | "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.enable"; params: Readonly<{ maxScriptsCacheSize: 33_554_432 }> }>
  | Readonly<{ method: "Debugger.setAsyncCallStackDepth"; params: Readonly<{ maxDepth: 1 }> }>
  | Readonly<{ method: "Debugger.setInstrumentationBreakpoint"; params: Readonly<{ instrumentation: "beforeScriptExecution" }> }>
  | Readonly<{ method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
);
export interface CurrentPcb209RatlineBootstrapEvent {
  readonly method: string;
  readonly sessionId: string;
  readonly params: Readonly<Record<string, unknown>>;
}
export interface CurrentPcb209RatlineBootstrapDependency {
  /** Reprove original process/pipe/leases and the creation owner's original
   * waiting child. A matching target name or URL is insufficient. */
  readonly assertOriginalChild: (creation: Creation, packet: CurrentPcb209RatlineCreationPacket) => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  /** Observe the first qualified script while its original pause is still held.
   * The callback grants no imported-source continuation or target identity. */
  readonly observeOriginalFirstScript: (creation: Creation, packet: CurrentPcb209RatlineCreationPacket,
    owner: CurrentPcb209RatlineBootstrapOwner) => Promise<void>;
  readonly request: (command: CurrentPcb209RatlineBootstrapCommand | CurrentPcb209RatlineRealmCommand) => Promise<unknown>;
  /** Only this original child's events, including loss from its parent, may
   * enter this subscription. The containing owner keeps its cumulative budget. */
  readonly subscribe: (events: Readonly<{ event: (value: CurrentPcb209RatlineBootstrapEvent) => void; lost: () => void }>) => () => void;
}
export interface CurrentPcb209RatlineBootstrapPacket {
  readonly profile: "private.pcb209-ratline-bootstrap.v1";
  readonly childTargetId: string;
  readonly childSessionId: string;
  readonly scriptId: string;
  readonly uniqueContextId: string;
  readonly completeImportedSourceQualified: true;
  readonly importedSourceHeldBeforeExecution: true;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly continuousInstallationLeaseVerified: false;
  readonly executionAuthorized: false;
}
const empty = z.object({}).strict(), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const contextSchema = z.object({ id: z.number().int().positive(), uniqueId: token, name: z.literal("pcb-ratline-worker"),
  origin: z.string().max(4096) }).strict();
const scriptSchema = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(), url: z.string().max(4096),
  hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional() });
const asyncStackId = z.object({ id: z.string().regex(/^[1-9]\d{0,19}$/u).refine(value => value.trim() === value),
  debuggerId: token.refine(value => value.trim() === value) }).strict();
const copyStack = z.object({ callFrames: z.unknown(), parentId: asyncStackId.optional() }).strict();
const frameSchema = z.looseObject({ location: z.looseObject({ scriptId: token }) });
const pauseSchema = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: token, url: z.string().max(4096) }),
  hitBreakpoints: z.array(token).max(1), callFrames: z.array(frameSchema).min(1).max(16) });
const logArgument = z.object({ type: z.literal("string"), value: z.literal(CURRENT_PCB_209_WORKER_PRELOAD_LOG.message) }).strict();
const logFrame = z.looseObject({ scriptId: token, functionName: z.string(), url: z.string(), lineNumber: z.number().int(), columnNumber: z.number().int() });
const logStack = z.looseObject({ callFrames: z.array(logFrame).min(1).max(16) });
const logSchema = z.object({ type: z.literal("log"), args: z.tuple([logArgument]), executionContextId: z.number().int().positive(),
  timestamp: z.number().nonnegative(), stackTrace: logStack }).strict();
interface Stage {
  readonly role: CurrentPcb209RatlineBootstrapRole;
  readonly paused: PromiseWithResolvers<unknown>;
  readonly resumed: PromiseWithResolvers<null>;
  script: z.infer<typeof scriptSchema> | null;
  pause: unknown;
  qualified: boolean;
  resume: Promise<void> | null;
  resumeSeen: boolean;
}
type RealmEvents = Parameters<CurrentPcb209RatlineRealmDependency["subscribe"]>[0];
const childAttachmentSchema = z.object({ sessionId: token, waitingForDebugger: z.literal(true), targetInfo: z.looseObject({
  targetId: token, type: z.literal("worker"), attached: z.literal(true), title: z.literal("pcb-ratline-worker"),
  url: z.literal("https://client/editor?entry=pcb-ratline-worker.js") }) }).strict();
// oxlint-disable-next-line typescript/unbound-method -- Invoke the original private-slot method on its retained actual class instance.
const requireCreation = CurrentPcb209RatlinePcbCreation.prototype.requireOriginal;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_BOOTSTRAP_${code}`); } }
async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original operation retains its failure.
  }
}
async function withoutValue(work: Promise<null>): Promise<void> { await work; }
async function bounded<T>(work: Promise<T>, milliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_BOOTSTRAP_DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
function members(value: CurrentPcb209RatlineBootstrapDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["assertOriginalChild", "assertOriginalTermination", "observeOriginalFirstScript", "request", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map(key => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "DEPENDENCY"); return descriptor.value as unknown; });
}
function isCopy(role: CurrentPcb209RatlineBootstrapRole): boolean { return role !== "worker" && currentPcb209PreloadCopyCaller(role) !== null; }

export class CurrentPcb209RatlineBootstrapOwner {
  readonly #dependency: CurrentPcb209RatlineBootstrapDependency;
  readonly #members: readonly unknown[];
  readonly #timing: CurrentPcb209RatlineContinuationTiming | null;
  readonly #stages: readonly Stage[];
  readonly #qualified = Promise.withResolvers<CurrentPcb209RatlineBootstrapPacket>();
  #creation: Creation | null = null;
  #construction: CurrentPcb209RatlineCreationPacket | null = null;
  #context: z.infer<typeof contextSchema> | null = null;
  #debuggerId: string | null = null;
  #asyncDepthArmed = false;
  #firstObservationConsumed = false;
  #index = 0;
  #consumed = false;
  #armed = false;
  #failed = false;
  #firstChild = false;
  #firstPauseStartedAt: bigint | null = null;
  #firstPauseTimer: ReturnType<typeof setTimeout> | null = null;
  #step = "idle";
  #lastCommand: CurrentPcb209RatlineBootstrapCommand["method"] | null = null;
  #lastEvent: CurrentPcb209RatlineEventKind = "unparsed";
  #firstFailure: Readonly<{ reason: string; step: string; stage: CurrentPcb209RatlineBootstrapRole | null;
    lastCommand: CurrentPcb209RatlineBootstrapCommand["method"] | null; lastEvent: CurrentPcb209RatlineEventKind;
    events: number; contextSeen: boolean; scriptSeen: boolean; pauseSeen: boolean; qualified: boolean }> | null = null;
  #firstRejectedEvent: CurrentPcb209RatlineStopCapture | null = null;
  #released = false;
  #retired = false;
  #sealConsumed = false;
  #continuedSeal: CurrentPcb209ContinuedSourceSeal | null = null;
  #releaseStarted = false;
  #continuationConsumed = false;
  #continuationCompleted = false;
  #instrumentation: string | null = null;
  #allocationUncertain = false;
  #allocation: Promise<void> | null = null;
  #removal: Promise<void> | null = null;
  #removed = false;
  #unsubscribe: (() => void) | null = null;
  #capture: Promise<void> | null = null;
  #packet: CurrentPcb209RatlineBootstrapPacket | null = null;
  #logSeen = false;
  #commands = 0;
  #events = 0;
  #eventBytes = 0;
  #realmClaimed = false;
  #realmEvents: RealmEvents | null = null;
  #realmEventMembers: readonly unknown[] | null = null;
  #realmSubscribed = false;
  #realmRequests = 0;
  #workerScriptLoadedObserved = false;
  readonly #subordinates = new Map<string, { readonly targetId: string; startConsumed: boolean }>();
  public constructor(dependency: CurrentPcb209RatlineBootstrapDependency) {
    this.#members = members(dependency); this.#dependency = dependency;
    this.#timing = currentPcb209RatlineContinuationTiming(dependency); inheritCurrentPcb209RatlineContinuationTiming(dependency, this);
    this.#stages = CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES.map(role => ({ role, paused: Promise.withResolvers(), resumed: Promise.withResolvers(),
      script: null, pause: null, qualified: false, resume: null, resumeSeen: false }));
    void observed(this.#qualified.promise);
    for (const stage of this.#stages) { void observed(stage.paused.promise); void observed(stage.resumed.promise); }
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ consumed: this.#consumed, armed: this.#armed, failed: this.#failed, released: this.#released, retired: this.#retired,
      stage: this.#stages[this.#index]?.role ?? null, qualified: this.#packet !== null, sourceContinuationConsumed: this.#continuationConsumed,
      unresolvedInstrumentation: this.#allocationUncertain || this.#instrumentation !== null && !this.#removed, commands: this.#commands,
      workerRealmClaimed: this.#realmClaimed, workerRealmRequests: this.#realmRequests,
      workerScriptLoadedObserved: this.#workerScriptLoadedObserved, firstPauseWindowStarted: this.#firstPauseStartedAt !== null, firstFailure: this.#firstFailure, step: this.#step,
      firstRejectedEvent: this.#firstRejectedEvent, lastCommand: this.#lastCommand, lastEvent: this.#lastEvent, events: this.#events });
  }
  #same(): void { need(members(this.#dependency).every((value, index) => value === this.#members[index]), "OWNER_CHANGED"); }
  async #current(): Promise<void> {
    this.#same(); need(!this.#failed && !this.#released && !this.#retired && this.#creation !== null && this.#construction !== null, "NOT_CURRENT");
    const creation = this.#creation, packet = this.#construction;
    this.#step = "creation-reproof"; await bounded(requireCreation.call(creation, packet), this.#timing?.parentOwnerMilliseconds); this.#same();
    this.#step = "child-owner-reproof";
    await bounded(this.#dependency.assertOriginalChild(creation, packet), this.#timing?.childDependencyMilliseconds ??
      (this.#firstChild ? 2 : 1) * CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
    this.#same(); need(!this.#failed && !this.#released && !this.#retired, "NOT_CURRENT");
  }
  #poison(cause: unknown = new Error("PCB209_RATLINE_BOOTSTRAP_ABORTED"), step = this.#step): void {
    if (this.#firstPauseTimer !== null) { clearTimeout(this.#firstPauseTimer); this.#firstPauseTimer = null; }
    if (this.#failed) { return; } const active = this.#stages[this.#index];
    this.#firstFailure = Object.freeze({ reason: currentPcb209RatlineFailureReason(cause), step, stage: active?.role ?? null,
      lastCommand: this.#lastCommand, lastEvent: this.#lastEvent, events: this.#events, contextSeen: this.#context !== null,
      scriptSeen: active?.script !== null && active?.script !== undefined, pauseSeen: active?.pause !== null && active?.pause !== undefined, qualified: active?.qualified ?? false });
    this.#failed = true;
    const error = new Error("PCB209_RATLINE_BOOTSTRAP_FAILED", { cause }); this.#qualified.reject(error);
    for (const stage of this.#stages) { stage.paused.reject(error); stage.resumed.reject(error); }
    this.#realmEvents?.lost();
  }
  readonly #lost = (): void => { this.#poison(new Error("PCB209_RATLINE_BOOTSTRAP_STREAM_LOST")); };
  #qualifyCopyCreator(preloadScriptId: string, script: z.infer<typeof scriptSchema>): void {
    const stack = copyStack.parse(script["stackTrace"]);
    if (stack.parentId !== undefined) {
      const first = this.#stages[0];
      need(this.#asyncDepthArmed && first?.qualified === true && first.pause !== null, "COPY_ASYNC_ORIGIN");
      const origin = z.looseObject({ asyncStackTraceId: asyncStackId }).parse(first.pause).asyncStackTraceId;
      need(stack.parentId.id === origin.id && stack.parentId.debuggerId === origin.debuggerId, "COPY_ASYNC_ORIGIN");
    }
    // Async-stack depth1 adds the original worker-creation parentId in Chromium.
    // Bind that sole extra field above; preserve the shared synchronous creator
    // And source/pause qualification without admitting arbitrary stack parents.
    qualifyCurrentPcb209PreloadCopyCreator(preloadScriptId, { ...script, stackTrace: { callFrames: stack.callFrames } });
  }
  readonly #event = (input: CurrentPcb209RatlineBootstrapEvent): void => {
    let step = "event-envelope";
    try {
      this.#same(); need(!this.#released && !this.#retired && this.#construction !== null, "EVENT_STATE");
      const captured = captureCurrentPcbStringClockReply(input); this.#events += 1; this.#eventBytes += Buffer.byteLength(captured.text);
      need(this.#events <= 128 && this.#eventBytes <= 256 * 1024, "EVENT_BUDGET");
      const event = z.object({ method: z.string().max(128), sessionId: token, params: z.record(z.string(), z.unknown()) }).strict().parse(captured.value);
      this.#lastEvent = currentPcb209RatlineEventKind(event.method);
      step = "event-session";
      need(event.sessionId === this.#construction.childSessionId, "EVENT_SESSION");
      const stage = this.#stages[this.#index];
      if (event.method === "Inspector.workerScriptLoaded") {
        empty.parse(event.params);
        // The pinned Chromium notification can follow failed evaluation too;
        // It establishes no capture, subordinate or callback completion.
        need(!this.#failed && !this.#workerScriptLoadedObserved && this.#packet !== null && this.#continuationConsumed &&
          this.#realmClaimed && this.#index === this.#stages.length &&
          this.#stages.every(value => value.qualified && value.resume !== null && value.resumeSeen), "WORKER_SCRIPT_LOADED");
        this.#realmListener(); this.#workerScriptLoadedObserved = true; return;
      }
      if (event.method === "Runtime.executionContextCreated") {
        step = "context-metadata";
        need(this.#context === null && this.#index === 0, "CONTEXT");
        const context = z.object({ context: contextSchema }).strict().parse(event.params).context;
        qualifyCurrentPcb209RatlineBootstrapUrl(this.#construction.role, context.origin, this.#construction.requestedUrlSha256);
        this.#context = context; return;
      }
      if (event.method === "Debugger.scriptParsed") {
        step = "script-metadata";
        const script = scriptSchema.parse(event.params); need(this.#context !== null && script.executionContextId === this.#context.id, "SCRIPT_CONTEXT");
        if (this.#index === this.#stages.length && script.url === "") { return; }
        need(stage !== undefined && stage.script === null && !this.#stages.some(value => value.script?.scriptId === script.scriptId), "SCRIPT_ORDER");
        need(script.url === currentPcb209RatlineBootstrapRoleUrl(stage.role, this.#context.origin), "SCRIPT_URL");
        if (isCopy(stage.role)) {
          step = "copy-creator-metadata";
          const preload = this.#stages[1]; need(preload?.script !== null && preload?.script !== undefined && preload.qualified && preload.resumeSeen, "COPY_PRELOAD");
          this.#qualifyCopyCreator(preload.script.scriptId, script);
        }
        stage.script = script; return;
      }
      if (event.method === "Debugger.paused") {
        step = "pause-observation";
        if ((this.#firstChild || this.#timing !== null) && this.#index === 0) {
          need(this.#firstPauseStartedAt !== null, "CHILD_START_NOT_READY");
          need(Number(monotonic() - this.#firstPauseStartedAt) / 1_000_000 < CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds, "DEADLINE");
          if (this.#firstPauseTimer !== null) { clearTimeout(this.#firstPauseTimer); this.#firstPauseTimer = null; }
        }
        // The successor owns fixed capture pauses after the sole source continuation.
        if (this.#index === this.#stages.length) { this.#realmListener().paused(event.params); return; }
        need(stage !== undefined && stage.pause === null, "DUPLICATE_PAUSE");
        stage.pause = event.params; stage.paused.resolve(event.params); return;
      }
      if (event.method === "Debugger.resumed") {
        step = "resume-observation";
        empty.parse(event.params);
        if (this.#index === this.#stages.length) { this.#realmListener().resumed(); return; }
        need(stage !== undefined && stage.pause !== null && stage.resume !== null && !stage.resumeSeen, "UNEXPECTED_RESUME");
        stage.resumeSeen = true; this.#index += 1; stage.resumed.resolve(null);
        if (stage.role === "worker") { this.#realmListener().resumed(); } return;
      }
      if (event.method === "Runtime.consoleAPICalled") {
        step = "console-observation";
        if (this.#index === this.#stages.length) { return; }
        const log = CURRENT_PCB_209_WORKER_PRELOAD_LOG, preload = this.#stages[1];
        need(stage?.role === "worker" && !this.#logSeen && preload?.script !== null && preload?.script !== undefined, "PRELOAD_LOG_ORDER");
        const value = logSchema.parse(event.params);
        const first = value.stackTrace.callFrames[0];
        need(value.executionContextId === this.#context?.id && first?.scriptId === preload.script.scriptId && first.url === preload.script.url &&
          first.functionName === log.functionName && first.lineNumber === log.lineNumber && first.columnNumber === log.columnNumber, "PRELOAD_LOG");
        this.#logSeen = true; return;
      }
      // Child attachments after the source handoff belong to the successor's
      // Construction owner; detach/context replacement/exception always refuse.
      if (this.#index === this.#stages.length && event.method === "Target.attachedToTarget") {
        step = "subordinate-attachment";
        const child = childAttachmentSchema.parse(event.params);
        need(child.sessionId !== this.#construction.childSessionId && child.targetInfo.targetId !== this.#construction.childTargetId &&
          this.#subordinates.size === 0, "SUBORDINATE_ATTACHMENT");
        this.#subordinates.set(child.sessionId, { targetId: child.targetInfo.targetId, startConsumed: false });
        this.#realmListener().attached({ sessionId: event.sessionId, params: event.params }); return;
      }
      throw new Error("PCB209_RATLINE_BOOTSTRAP_UNEXPECTED_EVENT");
    } catch (error) {
      // Preserve the first complete bounded event before later cleanup events
      // Can replace its diagnostic context. This supplies no retry authority.
      if (!this.#failed) { this.#firstRejectedEvent = captureCurrentPcb209RatlineStopRecord(input, 32_768); }
      this.#poison(error, step);
    }
  };
  async #send(command: CurrentPcb209RatlineBootstrapCommand, cleanup = false,
    requestMilliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<unknown> {
    this.#same(); need(!this.#released && this.#construction !== null && command.sessionId === this.#construction.childSessionId, "COMMAND_SESSION");
    if (!cleanup) { await this.#current(); }
    need(this.#commands < 32, "COMMAND_BUDGET"); this.#commands += 1;
    this.#lastCommand = command.method; this.#step = "native-request";
    if (command.method === "Debugger.setInstrumentationBreakpoint") { this.#allocationUncertain = true; }
    const raw = command.method === "Debugger.setInstrumentationBreakpoint" ? await retainCurrentPcb209RatlineAllocation(() => this.#dependency.request(command),
      () => { this.#poison(new Error("PCB209_RATLINE_BOOTSTRAP_DEADLINE")); }) : await bounded(this.#dependency.request(command), requestMilliseconds);
    this.#same(); need(!this.#released, "RELEASED");
    // The caller qualifies the sole large source string synchronously before
    // Its following awaited reproof. Ordinary replies are copied here first.
    if (command.method === "Debugger.getScriptSource") { return raw; }
    const captured = captureCurrentPcbStringClockReply(raw).value;
    // Retain a late allocation handle before semantic owner reproof can fail.
    if (!cleanup && command.method !== "Debugger.setInstrumentationBreakpoint") { await this.#current(); }
    return captured;
  }
  async #remove(): Promise<void> {
    need(!this.#allocationUncertain, "UNRESOLVED_ALLOCATION");
    if (this.#instrumentation === null || this.#removed) { return; }
    if (this.#removal === null) {
      const packet = this.#construction; need(packet !== null, "ORIGINAL_CHILD");
      const pending = Promise.withResolvers<null>(); this.#removal = withoutValue(pending.promise); void observed(this.#removal);
      void observed((async (): Promise<void> => {
        try { empty.parse(captureCurrentPcbStringClockReply(await this.#send({ method: "Debugger.removeBreakpoint", sessionId: packet.childSessionId,
          params: { breakpointId: this.#instrumentation ?? "" } }, true)).value); this.#removed = true; pending.resolve(null);
        } catch (error) { pending.reject(error); }
      })());
    }
    await bounded(this.#removal);
  }
  async #resume(stage: Stage, cleanup = false): Promise<void> {
    const packet = this.#construction; need(packet !== null && stage.pause !== null, "PAUSE_REQUIRED");
    if (stage.resume === null) {
      // Store before dispatch, since resumed and the next pause can arrive inline.
      const pending = Promise.withResolvers<null>(); stage.resume = withoutValue(pending.promise); void observed(stage.resume);
      void observed((async (): Promise<void> => {
        try { empty.parse(captureCurrentPcbStringClockReply(await this.#send({ method: "Debugger.resume", params: {}, sessionId: packet.childSessionId }, cleanup)).value);
          this.#step = "resumed-event-wait"; await bounded(stage.resumed.promise); pending.resolve(null); } catch (error) { pending.reject(error); }
      })());
    }
    const milliseconds = cleanup ? 2 * CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds :
      CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childBootstrapResumeMilliseconds;
    await bounded(stage.resume, this.#timing?.bootstrapResumeMilliseconds ??
      (this.#firstChild ? milliseconds : CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds));
  }
  /** Direct adapter for composite.armOriginalChildBootstrap. It never starts
   * the child, resumes the parent, or accepts a copied construction packet. */
  public async armOriginalChildBootstrap(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    need(!this.#consumed, "ARM_CONSUMED"); this.#consumed = true;
    try {
      need(creation !== null && typeof creation === "object" && !types.isProxy(creation) &&
        (Object.getPrototypeOf(creation) === CurrentPcb209RatlinePcbCreation.prototype || Object.getPrototypeOf(creation) === CurrentPcb209RatlineWorkerCreation.prototype), "CREATION_OWNER");
      this.#creation = creation; this.#construction = packet;
      this.#firstChild = Object.getPrototypeOf(creation) === CurrentPcb209RatlinePcbCreation.prototype;
      await bounded(requireCreation.call(creation, packet), this.#timing?.parentOwnerMilliseconds); await this.#current();
      this.#unsubscribe = this.#dependency.subscribe({ event: this.#event, lost: this.#lost }); need(typeof this.#unsubscribe === "function", "SUBSCRIPTION");
      const sessionId = packet.childSessionId;
      const sendMilliseconds = this.#timing?.bootstrapSendMilliseconds ?? (this.#firstChild ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childBootstrapSendMilliseconds :
        CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
      const attachReply = await bounded(this.#send({ method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH }), sendMilliseconds);
      empty.parse(captureCurrentPcbStringClockReply(attachReply).value);
      const runtimeReply = await bounded(this.#send({ method: "Runtime.enable", sessionId, params: {} }), sendMilliseconds);
      empty.parse(captureCurrentPcbStringClockReply(runtimeReply).value);
      const debuggerReply = await bounded(this.#send({ method: "Debugger.enable", sessionId, params: { maxScriptsCacheSize: 33_554_432 } }), sendMilliseconds);
      this.#debuggerId = z.object({ debuggerId: token }).strict().parse(captureCurrentPcbStringClockReply(debuggerReply).value).debuggerId;
      empty.parse(await bounded(this.#send({ method: "Debugger.setAsyncCallStackDepth", sessionId, params: { maxDepth: 1 } }), sendMilliseconds));
      this.#asyncDepthArmed = true;
      const allocated = Promise.withResolvers<null>(); this.#allocation = withoutValue(allocated.promise); void observed(this.#allocation);
      void observed((async (): Promise<void> => {
        try {
          const reply = z.object({ breakpointId: token }).strict().parse(captureCurrentPcbStringClockReply(await this.#send({
            method: "Debugger.setInstrumentationBreakpoint", sessionId, params: { instrumentation: "beforeScriptExecution" } })).value);
          this.#instrumentation = reply.breakpointId; this.#allocationUncertain = false;
          if (this.#failed) { await this.#remove(); }
          allocated.resolve(null);
        } catch (error) { allocated.reject(error); }
      })()); await bounded(this.#allocation, this.#timing?.allocationMilliseconds ?? (this.#firstChild ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childBootstrapAllocationMilliseconds :
        CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds)); await this.#current(); this.#armed = true;
      this.#capture = this.#qualify(); void observed(this.#capture);
    } catch (error) { this.#poison(error); throw error; }
  }
  async #qualify(): Promise<void> {
    try {
      for (const [ordinal, stage] of this.#stages.entries()) {
        this.#step = "source-pause-wait";
        const pause = pauseSchema.parse(await ((this.#firstChild || this.#timing !== null) && ordinal === 0 ? stage.paused.promise : bounded(stage.paused.promise))), script = stage.script;
        need(script !== null && this.#context !== null && pause.data.scriptId === script.scriptId && pause.data.url === script.url &&
          pause.callFrames[0]?.location.scriptId === script.scriptId && script.executionContextId === this.#context.id &&
          (pause.hitBreakpoints.length === 0 || pause.hitBreakpoints[0] === this.#instrumentation), "PAUSE_IDENTITY");
        if (isCopy(stage.role) && stage.role !== "worker") {
          const preload = this.#stages[1]?.script; need(preload !== null && preload !== undefined, "COPY_PRELOAD");
          qualifyCurrentPcb209PreloadCopyPause(stage.role, script.scriptId, preload.scriptId, pause);
        }
        await this.#current();
        const sourceMilliseconds = currentPcb209RatlineSourceBudget("child", ordinal).deadlineMilliseconds;
        const raw = await bounded(this.#send({ method: "Debugger.getScriptSource", sessionId: this.#construction?.childSessionId ?? "",
          params: { scriptId: script.scriptId } }, false, sourceMilliseconds), sourceMilliseconds +
          (this.#timing?.sourceOwnerExtraMilliseconds ?? (this.#firstChild ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childOwnerMilliseconds : 0)));
        this.#step = "source-qualification"; qualifyCurrentPcb209RatlineBootstrapSource(stage.role, raw);
        stage.qualified = true; await this.#current();
        if (ordinal === 0) {
          need(!this.#firstObservationConsumed && this.#creation !== null && this.#construction !== null, "FIRST_OBSERVATION");
          this.#firstObservationConsumed = true;
          await this.#dependency.observeOriginalFirstScript(this.#creation, this.#construction, this); await this.#current();
        }
        if (stage.role === "worker") {
          need(this.#logSeen && this.#construction !== null, "PRELOAD_LOG_REQUIRED");
          await this.#remove(); await this.#current();
          this.#packet = Object.freeze({ profile: "private.pcb209-ratline-bootstrap.v1", childTargetId: this.#construction.childTargetId,
            childSessionId: this.#construction.childSessionId, scriptId: script.scriptId, uniqueContextId: this.#context.uniqueId,
            completeImportedSourceQualified: true, importedSourceHeldBeforeExecution: true, nativeWorkerTargetIdentityVerified: false,
            continuousInstallationLeaseVerified: false, executionAuthorized: false }); this.#qualified.resolve(this.#packet); return;
        }
        await this.#resume(stage); await this.#current();
      }
    } catch (error) { this.#poison(error); }
  }
  /** Only the actual first held script, after complete source qualification.
   * Copies of construction packets cannot retrieve its native observations. */
  public async requireOriginalFirstScript(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<Readonly<{
    debuggerId: string; uniqueContextId: string; scriptId: string; url: string; pause: unknown;
  }>> {
    await this.#current(); const stage = this.#stages[0];
    need(creation === this.#creation && packet === this.#construction && this.#firstObservationConsumed && this.#asyncDepthArmed &&
      this.#debuggerId !== null && this.#context !== null && this.#index === 0 && stage !== undefined && stage.qualified &&
      stage.script !== null && stage.pause !== null && stage.resume === null, "FIRST_SCRIPT_OWNER");
    return Object.freeze({ debuggerId: this.#debuggerId, uniqueContextId: this.#context.uniqueId, scriptId: stage.script.scriptId,
      url: stage.script.url, pause: stage.pause });
  }
  public async whenSourceQualified(): Promise<CurrentPcb209RatlineBootstrapPacket> { const packet = await this.#qualified.promise; await this.requireOriginal(packet); return packet; }
  public async requireOriginal(packet: CurrentPcb209RatlineBootstrapPacket): Promise<void> {
    need(this.#packet !== null && packet === this.#packet, "ORIGINAL_PACKET"); await this.#current();
  }
  /** A fresh continuation can retain completed source observations before the
   * exact parent deletion path. This seal carries no live request authority. */
  public async sealOriginalContinuedSource(packet: CurrentPcb209RatlineBootstrapPacket): Promise<CurrentPcb209ContinuedSourceSeal> {
    need(this.#timing !== null && !this.#sealConsumed, "SEAL_CONSUMED"); this.#sealConsumed = true;
    await this.requireOriginal(packet); need(this.#context !== null && this.#continuationCompleted && this.#removed &&
      !this.#allocationUncertain && this.#index === this.#stages.length && this.#stages.every(stage => stage.qualified && stage.resume !== null && stage.resumeSeen), "SEAL_INCOMPLETE");
    this.#continuedSeal = issueCurrentPcb209ContinuedSourceSeal(this, packet, this.#context.id); return this.#continuedSeal;
  }
  public requireOriginalSealedSource(seal: CurrentPcb209ContinuedSourceSeal): void {
    this.#same(); need(!this.#failed && !this.#released && this.#continuedSeal === seal && this.#packet !== null &&
      isCurrentPcb209ContinuedSourceSeal(seal, this, this.#packet), "ORIGINAL_SOURCE_SEAL");
  }
  public retireOriginalSealedSource(seal: CurrentPcb209ContinuedSourceSeal): void {
    this.requireOriginalSealedSource(seal); need(!this.#retired, "RETIREMENT_CONSUMED"); this.#retired = true;
  }
  public async releaseOriginalPinnedSource(packet: CurrentPcb209RatlineBootstrapPacket): Promise<void> {
    need(!this.#continuationConsumed, "CONTINUATION_CONSUMED"); this.#continuationConsumed = true;
    try { await this.requireOriginal(packet); this.#realmListener(); const stage = this.#stages[6]; need(stage !== undefined && this.#removed, "SOURCE_HELD");
      await this.#resume(stage); await this.#current(); this.#continuationCompleted = true; } catch (error) { this.#poison(error); throw error; }
  }
  /** The containing original native adapter must call this before permitting
   * creation.startOriginalChild, including after an ambiguous arm failure. */
  public async requireOriginalChildStartReady(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    this.#assertChildStartReady(creation, packet); await this.#current();
    this.#assertChildStartReady(creation, packet);
  }
  /** The original gate calls this synchronously immediately before its one
   * child-start dispatch. Listeners already retain even synchronous pauses;
   * the unchanged first-pause allowance begins only at this boundary. */
  public assertOriginalChildStartStillReady(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): void {
    this.#assertChildStartReady(creation, packet);
    if ((this.#firstChild || this.#timing !== null) && this.#firstPauseStartedAt === null) {
      this.#firstPauseStartedAt = monotonic(); this.#step = "source-pause-wait";
      this.#firstPauseTimer = setTimeout(() => { this.#poison(new Error("PCB209_RATLINE_BOOTSTRAP_DEADLINE")); },
        CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
    }
  }
  #assertChildStartReady(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): void {
    this.#same();
    need(creation === this.#creation && packet === this.#construction && this.#armed && !this.#allocationUncertain &&
      this.#instrumentation !== null && !this.#removed && !this.#failed && !this.#released && !this.#releaseStarted, "CHILD_START_NOT_READY");
  }
  #realmListener(): RealmEvents {
    const events = this.#realmEvents; need(events !== null && this.#realmEventMembers !== null, "REALM_SUBSCRIPTION");
    need(realmMembers(events).every((value, index) => value === this.#realmEventMembers?.[index]), "REALM_SUBSCRIPTION_CHANGED"); return events;
  }
  /** Claim executable authority once while the imported source remains held.
   * The returned realm uses this owner's original pipe and events. JSON cannot
   * recreate it, and bootstrap commands are refused by its request method. */
  public async claimOriginalWorkerRealm(packet: CurrentPcb209RatlineBootstrapPacket): Promise<CurrentPcb209RatlineRealmDependency> {
    need(!this.#realmClaimed && !this.#continuationConsumed, "REALM_CLAIM_CONSUMED"); this.#realmClaimed = true;
    await this.requireOriginal(packet);
    const realm = Object.freeze({ scriptId: packet.scriptId, parentTargetId: packet.childTargetId, parentSessionId: packet.childSessionId,
      assertOriginalPinnedParentAndAutoAttach: async (source: Readonly<{ relativePath: string; bytes: number; sha256: string }>): Promise<void> => {
        need(source === CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker, "REALM_SOURCE"); await this.requireOriginal(packet);
      },
      assertOriginalTermination: async (): Promise<void> => { this.#same(); await bounded(this.#dependency.assertOriginalTermination()); this.#same(); },
      request: (command: CurrentPcb209RatlineRealmCommand): Promise<unknown> => this.#realmRequest(packet, command),
      subscribe: (events: RealmEvents): (() => void) => {
        this.#same(); need(!this.#realmSubscribed && !this.#failed && !this.#released && packet === this.#packet, "REALM_SUBSCRIPTION");
        this.#realmSubscribed = true; this.#realmEventMembers = realmMembers(events); this.#realmEvents = events;
        return (): void => { need(this.#realmEvents === events, "REALM_SUBSCRIPTION_CHANGED"); this.#realmEvents = null; this.#realmEventMembers = null; };
      },
    });
    inheritCurrentPcb209RatlineContinuationTiming(this.#dependency, realm); return realm;
  }
  async #realmRequest(packet: CurrentPcb209RatlineBootstrapPacket, input: CurrentPcb209RatlineRealmCommand): Promise<unknown> {
    // Finite native syntax is a second gate here; the typed union alone cannot
    // Exclude a raw caller's bootstrap-only or arbitrary relation program.
    const wire = currentPcb209RatlineNativeWire("worker", input, 1);
    const phase = wire.request["phase"];
    need(typeof phase === "string" && !phase.startsWith("bootstrap-"), "REALM_COMMAND");
    const { id: _validationId, ...command } = wire.command;
    need(command.method !== "Debugger.getStackTrace", "ORIGIN_COMMAND_OWNER");
    const cleanup = command.method === "Debugger.resume" || command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.runIfWaitingForDebugger";
    this.#same(); need(!this.#released && packet === this.#packet && this.#realmClaimed, "REALM_OWNER");
    if (!cleanup) { await this.requireOriginal(packet); }
    if (command.method === "Debugger.resume") { need(this.#index === this.#stages.length, "REALM_SOURCE_HELD"); }
    if (command.method === "Runtime.runIfWaitingForDebugger") {
      const child = this.#subordinates.get(command.sessionId);
      need(child !== undefined && !child.startConsumed && this.#index === this.#stages.length, "REALM_CHILD_START"); child.startConsumed = true;
      // A subordinate source owner must separately enforce its instrumentation
      // Readiness through the containing native adapter before this dispatch.
    } else if (command.method !== "Target.getTargets") {
      need(command.sessionId === packet.childSessionId, "REALM_SESSION");
      if (command.method === "Debugger.setBreakpoint") { need(command.params.location.scriptId === packet.scriptId, "REALM_SCRIPT"); }
    }
    need(this.#realmRequests < 128, "REALM_REQUEST_BUDGET"); this.#realmRequests += 1;
    const captured = captureCurrentPcbStringClockReply(await this.#dependency.request(command)).value; this.#same();
    need(!this.#released, "RELEASED");
    // The dispatcher must retain late breakpoint handles before reproof. Its
    // Original cleanup request remains possible after a semantic source loss.
    if (!cleanup && command.method !== "Debugger.setBreakpoint") { await this.requireOriginal(packet); }
    return captured;
  }
  /** Remove only this owner's instrumentation. A refused source remains held
   * for original process termination; this method grants no unqualified resume. */
  public async abort(): Promise<void> { this.#poison(); await this.#remove(); }
  /** Executable cleanup barrier for the containing original child-start gate.
   * A late allocation retains its original handle and removal promise. This
   * never makes a failed child ready to start or releases an unqualified pause. */
  public async settleOriginalInstrumentationAfterAbort(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    need(creation === this.#creation && packet === this.#construction && this.#consumed && !this.#released, "CLEANUP_OWNER");
    this.#same(); this.#poison();
    if (this.#allocation !== null) { await bounded(this.#allocation, this.#timing?.allocationMilliseconds); }
    await this.#remove(); this.#same();
    need(!this.#allocationUncertain && (this.#instrumentation === null || this.#removed) && !this.#released, "CLEANUP_UNSETTLED");
  }
  public async releaseAfterTermination(): Promise<void> {
    need(!this.#releaseStarted && !this.#released, "RELEASE_CONSUMED"); this.#releaseStarted = true;
    try { this.#same(); await bounded(this.#dependency.assertOriginalTermination()); this.#same(); this.#poison();
      this.#released = true; this.#unsubscribe?.(); this.#unsubscribe = null;
    } finally { this.#releaseStarted = false; }
  }
}

function realmMembers(value: RealmEvents): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "REALM_EVENTS");
  const keys = ["paused", "resumed", "attached", "lost"] as const; need(Reflect.ownKeys(value).length === keys.length, "REALM_EVENTS");
  return keys.map(key => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "REALM_EVENTS"); return descriptor.value as unknown; });
}
