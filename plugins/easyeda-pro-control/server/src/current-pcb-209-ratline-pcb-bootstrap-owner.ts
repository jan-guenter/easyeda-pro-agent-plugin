/** Private pre-navigation PCB source owner. The containing original native
 * coordinator owns durable intent, frame ancestry, installation leases and
 * cumulative budgets through the native ratline held-import boundary. */
import { types } from "node:util";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE, currentPcb209RatlineSourceBudget } from "./current-pcb-209-ratline-budget.ts";
import { z } from "zod";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl,
  qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator, qualifyCurrentPcb209RatlinePcbBootstrapCopyPause, qualifyCurrentPcb209RatlinePcbBootstrapSource } from "./current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import type { CurrentPcb209RatlinePcbBootstrapRole } from "./current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import type { CurrentPcb209RatlineBootstrapCommand, CurrentPcb209RatlineBootstrapEvent } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineRealmCommand, CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";
import { currentPcb209RatlineNativeWire } from "./current-pcb-209-ratline-native-wire.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
// oxlint-disable-next-line import/max-dependencies -- This source owner joins the existing source/runtime/clock contracts with shared bounded diagnostic classification.
import { currentPcb209RatlineEventKind, currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import type { CurrentPcb209RatlineEventKind } from "./current-pcb-209-ratline-diagnostics.ts";
import { retainCurrentPcb209RatlineAllocation } from "./current-pcb-209-ratline-transport-windows.ts";
import { inheritCurrentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { CurrentPcb209OwnershipBreakpoint } from "./current-pcb-209-ratline-ownership-breakpoint.ts";
import type { CurrentPcb209OwnershipCommand } from "./current-pcb-209-ratline-ownership-breakpoint.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentPcb209RatlinePcbBootstrapContext {
  readonly sessionId: string;
  readonly parentTargetId: string;
  readonly frameId: string;
  readonly contextId: number;
  readonly uniqueContextId: string;
  readonly origin: "https://client";
  readonly frameUrl: string | null;
}
export interface CurrentPcb209RatlinePcbBootstrapDependency {
  readonly parentSessionId: string;
  readonly parentTargetId: string;
  readonly assertOriginalOwner: () => Promise<void>;
  /** Reprove original opening, checkpoint, durable navigation intent and no
   * previous PCB open. This callback must not dispatch navigation. */
  readonly assertOriginalBeforeNavigation: () => Promise<void>;
  /** Identity checks may run at an instrumentation stop. Full DOM ancestry
   * requires the owned ordinary stop before the first source executes. */
  readonly assertOriginalPcbContext: (context: CurrentPcb209RatlinePcbBootstrapContext, mode: "identity" | "ancestry") => Promise<void>;
  /** The original one-shot PCB opener. Its promise may stay pending while the
   * source owner holds the import; completion cannot replay navigation. */
  readonly beginOriginalPcbNavigation: () => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (command: CurrentPcb209RatlineBootstrapCommand | CurrentPcb209RatlineRealmCommand | CurrentPcb209OwnershipCommand) => Promise<unknown>;
  /** Original selected-frame events plus all unexpected pauses/loss. Existing
   * UI/ancillary events stay with the containing owner; it cannot discard an
   * unrelated pause merely to satisfy this selected-frame subscription. */
  readonly subscribe: (events: Readonly<{ event: (value: CurrentPcb209RatlineBootstrapEvent) => void; lost: () => void }>) => () => void;
}
export interface CurrentPcb209RatlinePcbBootstrapPacket extends CurrentPcb209RatlinePcbBootstrapContext {
  readonly profile: "private.pcb209-ratline-pcb-bootstrap.v1";
  readonly scriptId: string;
  readonly completeImportedSourceQualified: true;
  readonly importedSourceHeldBeforeExecution: true;
  readonly nativeFrameAncestryVerified: false;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly continuousInstallationLeaseVerified: false;
  readonly executionAuthorized: false;
}
const empty = z.object({}).strict(), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const contextSchema = z.object({ id: z.number().int().positive(), uniqueId: token, origin: z.literal("https://client"), name: z.string().max(128),
  auxData: z.object({ frameId: token, isDefault: z.literal(true), type: z.literal("default") }).strict() }).strict();
const scriptSchema = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(), url: z.string().max(4096),
  hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional() });
const frameSchema = z.looseObject({ location: z.looseObject({ scriptId: token }) });
const pauseSchema = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: token, url: z.string().max(4096) }),
  hitBreakpoints: z.array(token).max(1), callFrames: z.array(frameSchema).min(1).max(32) });
const childSchema = z.object({ sessionId: token, waitingForDebugger: z.literal(true), targetInfo: z.looseObject({ targetId: token,
  type: z.literal("worker"), attached: z.literal(true), title: z.literal("pcb-ratline-worker"), url: z.string().max(4096) }) }).strict();
type RealmEvents = Parameters<CurrentPcb209RatlineRealmDependency["subscribe"]>[0];
type Failure = Readonly<{ reason: string; step: string; stage: CurrentPcb209RatlinePcbBootstrapRole | null;
  lastCommand: CurrentPcb209RatlineBootstrapCommand["method"] | CurrentPcb209RatlineRealmCommand["method"] | null;
  lastEvent: CurrentPcb209RatlineEventKind; events: number; eventBytes: number; navigationDispatched: boolean;
  contextSeen: boolean; scriptSeen: boolean; pauseSeen: boolean; sourceQualified: boolean; resumeSeen: boolean }>;
interface Stage {
  readonly role: CurrentPcb209RatlinePcbBootstrapRole;
  readonly paused: PromiseWithResolvers<unknown>;
  readonly resumed: PromiseWithResolvers<null>;
  script: z.infer<typeof scriptSchema> | null;
  pause: unknown;
  qualified: boolean;
  resume: Promise<void> | null;
  resumeSeen: boolean;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_PCB_BOOTSTRAP_${code}`); } }
async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original consumer retains the failure.
  }
}
async function withoutValue(work: Promise<null>): Promise<void> { await work; }
async function bounded<T>(work: Promise<T>, milliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_PCB_BOOTSTRAP_DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
function members(value: CurrentPcb209RatlinePcbBootstrapDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["parentSessionId", "parentTargetId", "assertOriginalOwner", "assertOriginalBeforeNavigation", "assertOriginalPcbContext",
    "beginOriginalPcbNavigation", "assertOriginalTermination", "request", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 2 ? "string" : "function"), "DEPENDENCY"); return descriptor.value as unknown; });
}
function realmMembers(value: RealmEvents): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "REALM_EVENTS");
  const keys = ["paused", "resumed", "attached", "lost"] as const; need(Reflect.ownKeys(value).length === keys.length, "REALM_EVENTS");
  return keys.map(key => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "REALM_EVENTS"); return descriptor.value as unknown; });
}

export class CurrentPcb209RatlinePcbBootstrapOwner {
  readonly #dependency: CurrentPcb209RatlinePcbBootstrapDependency;
  readonly #members: readonly unknown[];
  readonly #stages: readonly Stage[];
  readonly #qualified = Promise.withResolvers<CurrentPcb209RatlinePcbBootstrapPacket>();
  #context: z.infer<typeof contextSchema> | null = null;
  #debuggerId: string | null = null;
  #asyncDepthArmed = false;
  #frameUrl: string | null = null;
  #contextMode: "identity" | "ancestry" = "identity";
  #ownership: CurrentPcb209OwnershipBreakpoint | null = null;
  readonly #ownershipTransfers: CurrentPcb209OwnershipBreakpoint[] = [];
  #ownershipCommands = 0;
  #index = 0;
  #consumed = false;
  #armed = false;
  #failed = false;
  #firstFailure: Failure | null = null;
  #step = "idle";
  #lastCommand: Failure["lastCommand"] = null;
  #lastEvent: CurrentPcb209RatlineEventKind = "unparsed";
  #released = false;
  #releaseStarted = false;
  #navigationConsumed = false;
  #navigationDispatched = false;
  #navigationSettled = false;
  #navigation: Promise<void> | null = null;
  #continuationConsumed = false;
  #instrumentation: string | null = null;
  #allocationUncertain = false;
  #removal: Promise<void> | null = null;
  #removed = false;
  #unsubscribe: (() => void) | null = null;
  #packet: CurrentPcb209RatlinePcbBootstrapPacket | null = null;
  #commands = 0;
  #events = 0;
  #eventBytes = 0;
  #realmClaimed = false;
  #realmEvents: RealmEvents | null = null;
  #realmEventMembers: readonly unknown[] | null = null;
  #realmSubscribed = false;
  #realmRequests = 0;
  #child: Readonly<{ targetId: string; sessionId: string }> | null = null;
  #childStartConsumed = false;
  public constructor(dependency: CurrentPcb209RatlinePcbBootstrapDependency) {
    this.#members = members(dependency); this.#dependency = dependency; token.parse(dependency.parentTargetId);
    z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).parse(dependency.parentSessionId);
    this.#stages = CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES.map(role => ({ role, paused: Promise.withResolvers(), resumed: Promise.withResolvers(),
      script: null, pause: null, qualified: false, resume: null, resumeSeen: false }));
    void observed(this.#qualified.promise); for (const stage of this.#stages) { void observed(stage.paused.promise); void observed(stage.resumed.promise); }
  }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ consumed: this.#consumed, armed: this.#armed, failed: this.#failed,
    released: this.#released, navigationConsumed: this.#navigationConsumed, navigationDispatched: this.#navigationDispatched, navigationSettled: this.#navigationSettled,
    stage: this.#stages[this.#index]?.role ?? null, sourceQualified: this.#packet !== null, sourceContinuationConsumed: this.#continuationConsumed,
    unresolvedInstrumentation: this.#allocationUncertain || this.#instrumentation !== null && !this.#removed,
    commands: this.#commands, ownershipCommands: this.#ownershipCommands,
    ownershipTransitions: this.#ownershipTransfers.map(value => value.status()), contextProof: this.#contextMode,
    realmClaimed: this.#realmClaimed, realmRequests: this.#realmRequests,
    step: this.#step, firstFailure: this.#firstFailure, lastCommand: this.#lastCommand, lastEvent: this.#lastEvent,
    events: this.#events, eventBytes: this.#eventBytes }); }
  #same(): void { need(members(this.#dependency).every((value, index) => value === this.#members[index]), "OWNER_CHANGED"); }
  #contextObservation(): CurrentPcb209RatlinePcbBootstrapContext {
    const context = this.#context; need(context !== null, "CONTEXT_REQUIRED");
    return Object.freeze({ sessionId: this.#dependency.parentSessionId, parentTargetId: this.#dependency.parentTargetId,
      frameId: context.auxData.frameId, contextId: context.id, uniqueContextId: context.uniqueId, origin: context.origin, frameUrl: this.#frameUrl });
  }
  async #current(mode: "identity" | "ancestry" = this.#contextMode): Promise<void> {
    this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
    this.#step = "owner-reproof"; await bounded(this.#dependency.assertOriginalOwner()); this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
    if (this.#context !== null) { this.#step = "context-reproof";
      await bounded(this.#dependency.assertOriginalPcbContext(this.#contextObservation(), mode), CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ancestryProofMilliseconds); this.#same(); }
    need(!this.#failed && !this.#released, "NOT_CURRENT");
  }
  #poison(cause: unknown = new Error("PCB209_RATLINE_PCB_BOOTSTRAP_ABORTED")): void {
    if (this.#failed) { return; } const stage = this.#stages[this.#index];
    this.#firstFailure = Object.freeze({ reason: currentPcb209RatlineFailureReason(cause), step: this.#step, stage: stage?.role ?? null,
      lastCommand: this.#lastCommand, lastEvent: this.#lastEvent, events: this.#events, eventBytes: this.#eventBytes,
      navigationDispatched: this.#navigationDispatched, contextSeen: this.#context !== null, scriptSeen: stage?.script !== null && stage?.script !== undefined,
      pauseSeen: stage?.pause !== null && stage?.pause !== undefined, sourceQualified: stage?.qualified ?? false, resumeSeen: stage?.resumeSeen ?? false });
    this.#failed = true; const error = new Error("PCB209_RATLINE_PCB_BOOTSTRAP_FAILED", { cause });
    this.#qualified.reject(error); for (const pendingStage of this.#stages) { pendingStage.paused.reject(error); pendingStage.resumed.reject(error); } this.#realmEvents?.lost(); }
  readonly #lost = (): void => { this.#poison(new Error("PCB209_RATLINE_PCB_BOOTSTRAP_STREAM_LOST")); };
  #realmListener(): RealmEvents { const events = this.#realmEvents; need(events !== null && this.#realmEventMembers !== null, "REALM_SUBSCRIPTION");
    need(realmMembers(events).every((value, index) => value === this.#realmEventMembers?.[index]), "REALM_SUBSCRIPTION_CHANGED"); return events; }
  /** The original router consumes auxiliary transfer events before counting
   * source resumes. Direct subscriptions use the same hook below. */
  public observeOwnershipTransition(event: DiagnosticEvent): boolean {
    try { this.#same(); need(!this.#released, "EVENT_STATE"); return this.#ownership?.observe(event) ?? false; }
    catch (error) { this.#poison(error); throw error; }
  }
  readonly #event = (input: CurrentPcb209RatlineBootstrapEvent): void => {
    try {
      this.#same(); need(!this.#released, "EVENT_STATE");
      const captured = captureCurrentPcbStringClockReply(input); this.#events += 1; this.#eventBytes += Buffer.byteLength(captured.text);
      need(this.#events <= 256 && this.#eventBytes <= 512 * 1024, "EVENT_BUDGET");
      const event = z.object({ method: z.string().max(128), sessionId: token, params: z.record(z.string(), z.unknown()) }).strict().parse(captured.value);
      this.#lastEvent = currentPcb209RatlineEventKind(event.method);
      need(this.#navigationDispatched, "EVENT_STATE");
      need(event.sessionId === this.#dependency.parentSessionId, "EVENT_SESSION"); const stage = this.#stages[this.#index];
      if (this.observeOwnershipTransition(event)) { return; }
      if (event.method === "Runtime.executionContextCreated") {
        need(this.#context === null && this.#index === 0, "CONTEXT"); this.#context = z.object({ context: contextSchema }).strict().parse(event.params).context; return;
      }
      if (event.method === "Debugger.scriptParsed") {
        const script = scriptSchema.parse(event.params); need(this.#context !== null && script.executionContextId === this.#context.id, "SCRIPT_CONTEXT");
        if (this.#index === this.#stages.length && script.url === "") { return; }
        need(stage !== undefined && stage.script === null && !this.#stages.some(value => value.script?.scriptId === script.scriptId), "SCRIPT_ORDER");
        if (this.#frameUrl === null) {
          need(stage.role === "bootstrap" && script.url === "https://client/editor?entry=pcb", "FRAME_URL"); this.#frameUrl = script.url;
        }
        need(script.url === currentPcb209RatlinePcbBootstrapRoleUrl(stage.role, this.#frameUrl), "SCRIPT_URL");
        const copy = currentPcb209RatlinePcbBootstrapCopy(stage.role);
        if (copy !== null) { const parent = this.#stages.find(value => value.role === copy.ownerRole);
          need(parent?.script !== null && parent?.script !== undefined && parent.qualified && parent.resumeSeen, "COPY_PARENT");
          qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator(stage.role, parent.script.scriptId, script); }
        stage.script = script; return;
      }
      if (event.method === "Debugger.paused") {
        if (this.#index === this.#stages.length) { this.#realmListener().paused(event.params); return; }
        need(stage !== undefined && stage.pause === null, "DUPLICATE_PAUSE"); stage.pause = event.params; stage.paused.resolve(event.params); return;
      }
      if (event.method === "Debugger.resumed") {
        empty.parse(event.params); if (this.#index === this.#stages.length) { this.#realmListener().resumed(); return; }
        need(stage !== undefined && stage.pause !== null && stage.resume !== null && !stage.resumeSeen, "UNEXPECTED_RESUME");
        stage.resumeSeen = true; this.#index += 1; stage.resumed.resolve(null); if (stage.role === "pcb") { this.#realmListener().resumed(); } return;
      }
      if (event.method === "Runtime.consoleAPICalled") {
        // Console output is bounded evidence, never source or completion proof.
        const log = z.looseObject({ executionContextId: z.number().int().positive() }).parse(event.params);
        need(log.executionContextId === this.#context?.id, "CONSOLE_CONTEXT"); return;
      }
      if (event.method === "Target.attachedToTarget") {
        need(this.#index === this.#stages.length && this.#child === null, "CHILD_ATTACHMENT"); const child = childSchema.parse(event.params);
        need(child.sessionId !== this.#dependency.parentSessionId && child.targetInfo.targetId !== this.#dependency.parentTargetId &&
          /^https:\/\/client\/editor\?entry=pcb-ratline-worker\.js(?:&[^#\\\s]*)?$/u.test(child.targetInfo.url), "CHILD_IDENTITY");
        this.#child = Object.freeze({ targetId: child.targetInfo.targetId, sessionId: child.sessionId });
        this.#realmListener().attached({ sessionId: event.sessionId, params: event.params }); return;
      }
      throw new Error("PCB209_RATLINE_PCB_BOOTSTRAP_UNEXPECTED_EVENT");
    } catch (error) { this.#poison(error); }
  };
  async #send(command: CurrentPcb209RatlineBootstrapCommand, cleanup = false,
    requestMilliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<unknown> {
    this.#same(); need(!this.#released && command.sessionId === this.#dependency.parentSessionId, "COMMAND_SESSION");
    if (!cleanup) { await this.#current(); }
    this.#same(); need(!this.#released && (cleanup || !this.#failed), "NOT_CURRENT");
    need(this.#commands < 2 * this.#stages.length + 8, "COMMAND_BUDGET"); this.#commands += 1;
    this.#lastCommand = command.method; this.#step = "native-request";
    if (command.method === "Debugger.setInstrumentationBreakpoint") {
      // Retain the actual allocation after its own request deadline. A timeout
      // Must not discard the late handle or grant another allocation attempt.
      this.#allocationUncertain = true;
      const allocation = (async (): Promise<unknown> => {
        const raw = await retainCurrentPcb209RatlineAllocation(() => this.#dependency.request(command),
          () => { this.#poison(new Error("PCB209_RATLINE_PCB_BOOTSTRAP_DEADLINE")); }); this.#same(); need(!this.#released, "RELEASED");
        const value = z.object({ breakpointId: token }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
        this.#instrumentation = value.breakpointId; this.#allocationUncertain = false;
        if (this.#failed) { await this.#remove(); } return value;
      })(); void observed(allocation); return bounded(allocation, requestMilliseconds);
    }
    const raw = await bounded(this.#dependency.request(command), requestMilliseconds); this.#same(); need(!this.#released, "RELEASED");
    if (command.method === "Debugger.getScriptSource") { return raw; }
    const value = captureCurrentPcbStringClockReply(raw).value;
    if (!cleanup) { await this.#current(); } return value;
  }
  async #remove(): Promise<void> {
    need(!this.#allocationUncertain, "UNRESOLVED_ALLOCATION"); if (this.#instrumentation === null || this.#removed) { return; }
    if (this.#removal === null) {
      const pending = Promise.withResolvers<null>(); this.#removal = withoutValue(pending.promise); void observed(this.#removal);
      void observed((async (): Promise<void> => { try {
        empty.parse(await this.#send({ method: "Debugger.removeBreakpoint", sessionId: this.#dependency.parentSessionId,
          params: { breakpointId: this.#instrumentation ?? "" } }, true)); this.#removed = true; pending.resolve(null);
      } catch (error) { pending.reject(error); } })());
    } await bounded(this.#removal, 2 * CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
  }
  async #resume(stage: Stage): Promise<void> {
    need(stage.pause !== null, "PAUSE_REQUIRED"); if (stage.resume === null) {
      const pending = Promise.withResolvers<null>(); stage.resume = withoutValue(pending.promise); void observed(stage.resume);
      void observed((async (): Promise<void> => { try {
        empty.parse(await this.#send({ method: "Debugger.resume", params: {}, sessionId: this.#dependency.parentSessionId }));
        this.#step = "resumed-event-wait"; await bounded(stage.resumed.promise); pending.resolve(null);
      } catch (error) { pending.reject(error); } })());
    } await bounded(stage.resume, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.pcbBootstrapResumeMilliseconds);
  }
  readonly #ownershipRequest = async (command: CurrentPcb209OwnershipCommand): Promise<unknown> => {
    this.#same(); need(!this.#released && (command.ownershipPhase === "remove" || !this.#failed), "NOT_CURRENT");
    need(command.sessionId === this.#dependency.parentSessionId && command.ownershipStage !== "initial-window" &&
      this.#ownershipCommands < 6, "OWNERSHIP_COMMAND"); this.#ownershipCommands += 1;
    this.#lastCommand = command.method; this.#step = "ownership-request";
    // The helper retains the actual allocation/removal promise through its own
    // Deadline. Racing it here would lose a late owned breakpoint handle.
    const result = await this.#dependency.request(command); this.#same(); need(!this.#released, "RELEASED"); return result;
  };
  async #ordinaryOwnershipStop(stage: Stage, script: z.infer<typeof scriptSchema>): Promise<void> {
    need(stage.qualified && this.#ownership === null && (stage.role === "bootstrap" || stage.role === "pcb"), "OWNERSHIP_STAGE");
    const entry = stage.role === "bootstrap" ? z.looseObject({ startLine: z.number().int().min(0).max(65_535),
      startColumn: z.number().int().min(0).max(1_048_575) }).parse(script) : { startLine: 0, startColumn: 0 };
    const transfer = new CurrentPcb209OwnershipBreakpoint(stage.role === "bootstrap" ? "pcb-admission" : "pcb-release",
      this.#dependency.parentSessionId, stage.pause, { lineNumber: entry.startLine, columnNumber: entry.startColumn });
    this.#ownership = transfer; this.#ownershipTransfers.push(transfer);
    await transfer.enter(this.#ownershipRequest, (): Promise<void> => this.#current("identity"));
    this.#step = "ordinary-context-reproof"; await this.#current("ancestry"); this.#contextMode = "ancestry";
    await transfer.remove(this.#ownershipRequest); this.#ownership = null;
  }
  public async armBeforeNavigation(): Promise<void> {
    need(!this.#consumed, "ARM_CONSUMED"); this.#consumed = true;
    try {
      await this.#current(); await bounded(this.#dependency.assertOriginalBeforeNavigation()); await this.#current();
      this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
      this.#unsubscribe = this.#dependency.subscribe({ event: this.#event, lost: this.#lost }); need(typeof this.#unsubscribe === "function", "SUBSCRIPTION");
      const sessionId = this.#dependency.parentSessionId;
      const sendMilliseconds = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.pcbBootstrapSendMilliseconds;
      empty.parse(await bounded(this.#send({ method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH }), sendMilliseconds));
      empty.parse(await bounded(this.#send({ method: "Runtime.enable", sessionId, params: {} }), sendMilliseconds));
      this.#debuggerId = z.object({ debuggerId: token }).strict().parse(await bounded(this.#send({ method: "Debugger.enable", sessionId, params: { maxScriptsCacheSize: 33_554_432 } }), sendMilliseconds)).debuggerId;
      empty.parse(await bounded(this.#send({ method: "Debugger.setAsyncCallStackDepth", sessionId, params: { maxDepth: 1 } }), sendMilliseconds));
      this.#asyncDepthArmed = true;
      await bounded(this.#send({ method: "Debugger.setInstrumentationBreakpoint", sessionId,
        params: { instrumentation: "beforeScriptExecution" } }), sendMilliseconds); await this.#current(); this.#armed = true;
    } catch (error) { this.#poison(error); throw error; }
  }
  /** Resolves after the original opening was dispatched, not after it finishes.
   * The retained completion stays concurrent with intentionally paused source. */
  public async startOriginalNavigation(): Promise<void> {
    need(!this.#navigationConsumed, "NAVIGATION_CONSUMED"); this.#navigationConsumed = true;
    try {
      need(this.#armed && this.#instrumentation !== null && !this.#allocationUncertain && !this.#removed, "NOT_ARMED");
      await this.#current(); await bounded(this.#dependency.assertOriginalBeforeNavigation()); await this.#current();
      this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
      const pending = Promise.withResolvers<null>(); this.#navigation = withoutValue(pending.promise); void observed(this.#navigation);
      // Begin capture before the opener can synchronously report its first pause.
      void observed(this.#qualify());
      void observed((async (): Promise<void> => { try {
        this.#navigationDispatched = true;
        await this.#dependency.beginOriginalPcbNavigation(); this.#same(); this.#navigationSettled = true; pending.resolve(null);
      } catch (error) { this.#navigationSettled = true; this.#poison(error); pending.reject(error); } })());
    } catch (error) { this.#poison(error); throw error; }
  }
  public async whenOriginalNavigationSettled(): Promise<void> {
    need(this.#navigation !== null, "NAVIGATION_REQUIRED"); await this.#navigation; await this.#current();
  }
  async #qualify(): Promise<void> {
    try {
      for (const [ordinal, stage] of this.#stages.entries()) {
        this.#step = "source-pause-wait";
        const pauseMilliseconds = ordinal === 0 ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.pcbBootstrapFirstPauseMilliseconds :
          CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds;
        const pause = pauseSchema.parse(await bounded(stage.paused.promise, pauseMilliseconds)), script = stage.script;
        this.#step = "source-identity";
        need(script !== null && this.#context !== null && this.#frameUrl !== null && pause.data.scriptId === script.scriptId && pause.data.url === script.url &&
          pause.callFrames[0]?.location.scriptId === script.scriptId && script.executionContextId === this.#context.id &&
          (pause.hitBreakpoints.length === 0 || pause.hitBreakpoints[0] === this.#instrumentation), "PAUSE_IDENTITY");
        const copy = currentPcb209RatlinePcbBootstrapCopy(stage.role);
        if (copy !== null) { const parent = this.#stages.find(value => value.role === copy.ownerRole)?.script;
          need(parent !== null && parent !== undefined, "COPY_PARENT"); qualifyCurrentPcb209RatlinePcbBootstrapCopyPause(stage.role, script.scriptId, parent.scriptId, pause); }
        await this.#current(); const sourceMilliseconds = currentPcb209RatlineSourceBudget("pcb", ordinal).deadlineMilliseconds;
        const raw = await bounded(this.#send({ method: "Debugger.getScriptSource", sessionId: this.#dependency.parentSessionId,
          params: { scriptId: script.scriptId } }, false, sourceMilliseconds), sourceMilliseconds + CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
        this.#step = "source-qualification"; qualifyCurrentPcb209RatlinePcbBootstrapSource(stage.role, raw);
        stage.qualified = true;
        if (stage.role === "bootstrap" || stage.role === "pcb") { await this.#ordinaryOwnershipStop(stage, script); }
        await this.#current();
        if (stage.role === "pcb") {
          await this.#remove(); await this.#current(); this.#packet = Object.freeze({ ...this.#contextObservation(), profile: "private.pcb209-ratline-pcb-bootstrap.v1",
            scriptId: script.scriptId, completeImportedSourceQualified: true, importedSourceHeldBeforeExecution: true, nativeFrameAncestryVerified: false,
            nativeWorkerTargetIdentityVerified: false, continuousInstallationLeaseVerified: false, executionAuthorized: false });
          this.#qualified.resolve(this.#packet); return;
        } await this.#resume(stage); await this.#current();
      }
    } catch (error) { this.#poison(error); }
  }
  public async whenSourceQualified(): Promise<CurrentPcb209RatlinePcbBootstrapPacket> { const packet = await this.#qualified.promise; await this.requireOriginal(packet); return packet; }
  public async requireOriginal(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<void> {
    need(this.#packet !== null && packet === this.#packet, "ORIGINAL_PACKET"); await this.#current();
  }
  public async releaseOriginalPinnedSource(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<void> {
    need(!this.#continuationConsumed, "CONTINUATION_CONSUMED"); this.#continuationConsumed = true;
    try { await this.requireOriginal(packet); this.#realmListener(); const stage = this.#stages.at(-1);
      need(stage?.role === "pcb" && this.#removed, "SOURCE_HELD"); await this.#resume(stage); await this.#current();
    } catch (error) { this.#poison(error); throw error; }
  }
  public async claimOriginalPcbRealm(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<CurrentPcb209RatlineRealmDependency> {
    need(!this.#realmClaimed && !this.#continuationConsumed, "REALM_CLAIM_CONSUMED"); this.#realmClaimed = true; await this.requireOriginal(packet);
    this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
    const realm = Object.freeze({ scriptId: packet.scriptId, parentTargetId: packet.parentTargetId, parentSessionId: packet.sessionId,
      assertOriginalPinnedParentAndAutoAttach: async (source: Readonly<{ relativePath: string; bytes: number; sha256: string }>): Promise<void> => {
        need(source === CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.pcb, "REALM_SOURCE"); await this.requireOriginal(packet);
      },
      assertOriginalTermination: async (): Promise<void> => { this.#same(); await bounded(this.#dependency.assertOriginalTermination()); this.#same(); },
      request: (command: CurrentPcb209RatlineRealmCommand): Promise<unknown> => this.#realmRequest(packet, command),
      subscribe: (events: RealmEvents): (() => void) => {
        this.#same(); need(!this.#realmSubscribed && !this.#failed && !this.#released && packet === this.#packet, "REALM_SUBSCRIPTION");
        this.#realmSubscribed = true; this.#realmEventMembers = realmMembers(events); this.#realmEvents = events;
        return (): void => { need(this.#realmEvents === events, "REALM_SUBSCRIPTION_CHANGED"); this.#realmEvents = null; this.#realmEventMembers = null; };
      } });
    inheritCurrentPcb209RatlineContinuationTiming(this.#dependency, realm); return realm;
  }
  /** Native debugger identity stays bound to this original PCB source owner. */
  public async requireOriginalDebugger(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<string> {
    await this.requireOriginal(packet);
    need(this.#debuggerId !== null && this.#asyncDepthArmed, "ORIGINAL_DEBUGGER"); return this.#debuggerId;
  }
  async #realmRequest(packet: CurrentPcb209RatlinePcbBootstrapPacket, input: CurrentPcb209RatlineRealmCommand): Promise<unknown> {
    const wire = currentPcb209RatlineNativeWire("pcb", input, 1); const phase = wire.request["phase"];
    need(typeof phase === "string" && !phase.startsWith("bootstrap-"), "REALM_COMMAND"); const { id: _validationId, ...command } = wire.command;
    need(command.method !== "Debugger.getStackTrace", "ORIGIN_COMMAND_OWNER");
    const cleanup = command.method === "Debugger.resume" || command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.runIfWaitingForDebugger";
    this.#same(); need(!this.#released && packet === this.#packet && this.#realmClaimed, "REALM_OWNER"); if (!cleanup) { await this.requireOriginal(packet); }
    this.#same(); need(!this.#released && (cleanup || !this.#failed), "NOT_CURRENT");
    if (command.method === "Debugger.resume") { need(this.#index === this.#stages.length, "REALM_SOURCE_HELD"); }
    if (command.method === "Runtime.runIfWaitingForDebugger") {
      need(this.#child?.sessionId === command.sessionId && !this.#childStartConsumed && this.#index === this.#stages.length, "REALM_CHILD_START");
      this.#childStartConsumed = true;
      // The containing original adapter must also enforce the child bootstrap
      // Readiness/late-allocation cleanup barrier before this request dispatches.
    } else if (command.method !== "Target.getTargets") {
      need(command.sessionId === packet.sessionId, "REALM_SESSION");
      if (command.method === "Debugger.setBreakpoint") { need(command.params.location.scriptId === packet.scriptId, "REALM_SCRIPT"); }
    }
    need(this.#realmRequests < 128, "REALM_REQUEST_BUDGET"); this.#realmRequests += 1;
    this.#lastCommand = command.method; this.#step = "realm-request";
    // Breakpoint allocation belongs to the original dispatcher/runner. Its
    // Outer deadline retains this promise until the original late reply arrives;
    // An inner race here would lose the cleanup handle permanently.
    const raw = command.method === "Debugger.setBreakpoint" ? await retainCurrentPcb209RatlineAllocation(() => this.#dependency.request(command),
      () => { this.#poison(new Error("PCB209_RATLINE_PCB_BOOTSTRAP_DEADLINE")); }) : await bounded(this.#dependency.request(command));
    const captured = captureCurrentPcbStringClockReply(raw).value; this.#same(); need(!this.#released, "RELEASED");
    if (!cleanup && command.method !== "Debugger.setBreakpoint") { await this.requireOriginal(packet); } return captured;
  }
  /** Failed or unqualified source stays paused. Only acknowledged original
   * instrumentation is removed; process termination owns the remaining stop. */
  public async abort(): Promise<void> {
    this.#poison();
    try { await this.#ownership?.remove(this.#ownershipRequest); }
    finally { await this.#remove(); }
  }
  public async releaseAfterTermination(): Promise<void> {
    need(!this.#released && !this.#releaseStarted, "RELEASE_CONSUMED"); this.#releaseStarted = true;
    try { this.#same(); await bounded(this.#dependency.assertOriginalTermination()); this.#same(); this.#poison();
      this.#released = true; this.#unsubscribe?.(); this.#unsubscribe = null;
    } finally { this.#releaseStarted = false; }
  }
}
