/** Original-parent event routing for the held PCB source. Native launch,
 * installation leases and cumulative accounting remain with the same owner. */
import { types } from "node:util";
import { z } from "zod";
import { CurrentPcbDiagnosticContext } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcb209RatlineEventKind, currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import type { CurrentPcb209RatlineEventKind } from "./current-pcb-209-ratline-diagnostics.ts";
import { CurrentPcb209RatlinePcbBootstrapOwner } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import type { CurrentPcb209RatlinePcbBootstrapContext, CurrentPcb209RatlinePcbBootstrapDependency,
  CurrentPcb209RatlinePcbBootstrapPacket } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import { captureCurrentPcb209RatlineStop, captureCurrentPcb209RatlineStopRecord, currentPcb209RatlineIsStop, summarizeCurrentPcb209RatlineStop } from "./current-pcb-209-ratline-stop-observation.ts";
import type { CurrentPcb209RatlineStopCapture, CurrentPcb209RatlineStopEvidence } from "./current-pcb-209-ratline-stop-observation.ts";

import { qualifyCurrentPcb209RatlineNavigationPause, qualifyCurrentPcb209RatlineNavigationSource } from "./current-pcb-209-ratline-navigation-pause.ts";
import type { CurrentPcb209RatlineNavigationCommand } from "./current-pcb-209-ratline-navigation-pause.ts";

type Row = Readonly<Record<string, unknown>>;
type SourceCommand = Parameters<CurrentPcb209RatlinePcbBootstrapDependency["request"]>[0];
type NavigationCommand = CurrentPcb209RatlineNavigationCommand;
export type CurrentPcb209RatlinePcbContextParentCommand =
  Readonly<{ method: "Target.getTargets"; params: Readonly<Record<string, never>> }> |
  Readonly<{ method: "Page.getFrameTree"; sessionId: string; params: Readonly<Record<string, never>> }> |
  Readonly<{ method: "DOM.getFrameOwner"; sessionId: string; params: Readonly<{ frameId: string }> }> |
  Readonly<{ method: "DOM.describeNode"; sessionId: string; params: Readonly<{ backendNodeId: number; depth: 0; pierce: false }> }>;
export type CurrentPcb209RatlinePcbContextCommand = SourceCommand | NavigationCommand | CurrentPcb209RatlinePcbContextParentCommand;
export interface CurrentPcb209RatlinePcbContextDependency {
  readonly parentSessionId: string;
  readonly parentTargetId: string;
  readonly assertOriginalOwner: () => Promise<void>;
  readonly assertOriginalBeforeNavigation: () => Promise<void>;
  /** The router consumes the actual context transition before this original
   * opener. This promise may remain pending while the source is held. */
  readonly beginOriginalPcbNavigation: () => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (command: SourceCommand | NavigationCommand) => Promise<unknown>;
  readonly requestParent: (command: CurrentPcb209RatlinePcbContextParentCommand) => Promise<unknown>;
  /** Exclusive retained parent stream. The enclosing original coordinator
   * routes child-session events separately; it must not pre-observe this stream. */
  readonly subscribe: (events: Readonly<{ event: (event: DiagnosticEvent) => void; lost: () => void }>) => () => void;
}
type SourceEvents = Parameters<CurrentPcb209RatlinePcbBootstrapDependency["subscribe"]>[0];
type Failure = Readonly<{ reason: string; step: string; lastEvent: CurrentPcb209RatlineEventKind;
  lastCommand: CurrentPcb209RatlinePcbContextCommand["method"] | null; transitionStarted: boolean; selectedContextObserved: boolean;
  proofSets: number; proofCommands: number; events: number }>;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const eventSchema = z.object({ method: z.string().max(128), sessionId: token, params: z.record(z.string(), z.unknown()) }).strict();
const contextCreated = z.looseObject({ context: z.looseObject({ id: z.number().int().positive() }) }), row = z.record(z.string(), z.unknown());
const scriptParsed = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive() });
const originalMethods = Object.freeze(Object.fromEntries(Object.getOwnPropertyNames(CurrentPcbDiagnosticContext.prototype)
  .filter(key => key !== "constructor").map(key => [key, Object.getOwnPropertyDescriptor(CurrentPcbDiagnosticContext.prototype, key)?.value as unknown])));
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`PCB209_RATLINE_CONTEXT_${code}`); } }
function members(value: CurrentPcb209RatlinePcbContextDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.isFrozen(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["parentSessionId", "parentTargetId", "assertOriginalOwner", "assertOriginalBeforeNavigation", "beginOriginalPcbNavigation",
    "assertOriginalTermination", "request", "requestParent", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const field = Object.getOwnPropertyDescriptor(value, key);
    need(field !== undefined && Object.hasOwn(field, "value") && typeof field.value === (index < 2 ? "string" : "function"), "DEPENDENCY"); return field.value as unknown; });
}
async function observed(promise: Promise<unknown>): Promise<void> { try { await promise; } catch {
  // The retained original consumer owns failure.
} }
async function withoutValue(promise: Promise<null>): Promise<void> { await promise; }
async function bounded<T>(promise: Promise<T>): Promise<T> {
  const deadline = Promise.withResolvers<never>(), timer = setTimeout(() => { deadline.reject(new Error("PCB209_RATLINE_CONTEXT_DEADLINE")); }, 2500);
  try { return await Promise.race([promise, deadline.promise]); } finally { clearTimeout(timer); }
}

export class CurrentPcb209RatlinePcbContextRouter {
  readonly #sourceOwner: CurrentPcb209RatlinePcbBootstrapOwner;
  readonly #context: CurrentPcbDiagnosticContext;
  readonly #dependency: CurrentPcb209RatlinePcbContextDependency;
  readonly #members: readonly unknown[];
  readonly #target: CurrentDisposableOpenSealedTarget;
  readonly #contexts = new Map<number, DiagnosticEvent>();
  readonly #scripts = new Map<string, number>();
  readonly #scriptEvents = new Map<string, CurrentPcb209RatlineStopCapture>();
  #scriptEvidenceBytes = 0;
  #scriptEvidenceExhausted = false;
  readonly #originalUiContextId: number;
  readonly #navigationScriptEvents = new Set<string>();
  #navigationPending = false;
  #navigationPause: "unused" | "source" | "resume" | "complete" = "unused";
  #navigationResumed = false;
  readonly #navigationResumeEvent = Promise.withResolvers<null>();
  readonly #originalUiUniqueContextId: string;
  #rejectedStop: CurrentPcb209RatlineStopEvidence | null = null;
  #listener: SourceEvents | null = null;
  #unsubscribe: (() => void) | null = null;
  #subscribed = false;
  #failed = false;
  #firstFailure: Failure | null = null;
  #step = "idle";
  #lastEvent: CurrentPcb209RatlineEventKind = "unparsed";
  #lastCommand: Failure["lastCommand"] = null;
  #released = false;
  #release: Promise<void> | null = null;
  #transition = false;
  #enable: "Runtime.enable" | "Debugger.enable" | null = null;
  #selected: CurrentPcb209RatlinePcbBootstrapContext | null = null;
  #admission: Promise<void> | null = null;
  #continuation: Promise<void> | null = null;
  #childHeld: Promise<void> | null = null;
  #sourceReleaseArmed = false;
  #sourceReleaseConsumed = false;
  #resumes = 0;
  #proofSets = 0;
  #commands = 0;
  #events = 0;
  public constructor(context: CurrentPcbDiagnosticContext, target: CurrentDisposableOpenSealedTarget,
    dependency: CurrentPcb209RatlinePcbContextDependency) {
    need(!types.isProxy(context) && Object.getPrototypeOf(context) === CurrentPcbDiagnosticContext.prototype, "ORIGINAL_CONTEXT");
    this.#context = context; this.#dependency = dependency; this.#members = members(dependency);
    token.parse(dependency.parentSessionId); token.parse(dependency.parentTargetId);
    this.#target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value));
    this.#same(); const opening = context.openingContext(); need(opening.sessionId === dependency.parentSessionId, "PARENT_SESSION");
    this.#originalUiUniqueContextId = opening.uniqueContextId;
    const retained = context.script().context; this.#originalUiContextId = z.number().int().positive().parse(retained["id"]);
    need(retained["uniqueId"] === opening.uniqueContextId, "ORIGINAL_UI_CONTEXT");
    this.#contexts.set(this.#originalUiContextId, { method: "Runtime.executionContextCreated", sessionId: opening.sessionId, params: { context: retained } });
    this.#sourceOwner = new CurrentPcb209RatlinePcbBootstrapOwner(Object.freeze<CurrentPcb209RatlinePcbBootstrapDependency>({ parentSessionId: dependency.parentSessionId,
      parentTargetId: dependency.parentTargetId, assertOriginalOwner: (): Promise<void> => this.#current(),
      assertOriginalBeforeNavigation: (): Promise<void> => this.#before(), assertOriginalPcbContext: (value): Promise<void> => this.#proveContext(value),
      beginOriginalPcbNavigation: (): Promise<void> => this.#navigate(), assertOriginalTermination: (): Promise<void> => this.#termination(),
      request: (command): Promise<unknown> => this.#sourceRequest(command), subscribe: (events): (() => void) => this.#subscribe(events) }));
  }
  public get sourceOwner(): CurrentPcb209RatlinePcbBootstrapOwner { return this.#sourceOwner; }
  #same(): void {
    need(members(this.#dependency).every((value, index) => value === this.#members[index]) && !types.isProxy(this.#context) &&
      Object.getPrototypeOf(this.#context) === CurrentPcbDiagnosticContext.prototype, "OWNER_CHANGED");
    for (const [key, method] of Object.entries(originalMethods)) {
      need(!Object.hasOwn(this.#context, key) && Object.getOwnPropertyDescriptor(CurrentPcbDiagnosticContext.prototype, key)?.value === method, "CONTEXT_METHOD_CHANGED");
    }
  }
  public assertCurrent(): void {
    this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT"); this.#context.assertCurrent();
    const context = this.#transition ? this.#context.pcbOpeningContext() : this.#context.openingContext();
    need(context.sessionId === this.#dependency.parentSessionId, "PARENT_CHANGED");
    if (this.#selected !== null && this.#proofSets > 0) { this.#context.assertPcbBootstrapContext(this.#selected); }
  }
  async #current(): Promise<void> { this.assertCurrent(); this.#step = "owner-reproof"; await bounded(this.#dependency.assertOriginalOwner()); this.assertCurrent(); }
  #poison(cause: unknown = new Error("PCB209_RATLINE_CONTEXT_ABORTED")): void {
    if (!this.#failed) {
      this.#firstFailure = Object.freeze({ reason: currentPcb209RatlineFailureReason(cause), step: this.#step, lastEvent: this.#lastEvent,
        lastCommand: this.#lastCommand, transitionStarted: this.#transition, selectedContextObserved: this.#selected !== null,
        proofSets: this.#proofSets, proofCommands: this.#commands, events: this.#events });
      this.#failed = true; this.#listener?.lost();
    }
  }
  async #before(): Promise<void> {
    try { await this.#current(); need(!this.#transition, "NAVIGATION_CONSUMED");
      await bounded(this.#dependency.assertOriginalBeforeNavigation()); this.assertCurrent(); need(!this.#transition, "NAVIGATION_CONSUMED");
    } catch (error) { this.#poison(error); throw error; }
  }
  #navigate(): Promise<void> {
    try { this.assertCurrent(); need(!this.#transition, "NAVIGATION_CONSUMED"); this.#transition = true;
      this.#context.beginPcbOpeningTransition(this.#target.projectUuid, this.#target.documentUuid);
      this.#navigationPending = true;
      return this.#dependency.beginOriginalPcbNavigation().finally(() => { this.#navigationPending = false; });
    } catch (error) { this.#poison(error); return Promise.reject(error instanceof Error ? error : new Error("PCB209_RATLINE_CONTEXT_NAVIGATION", { cause: error })); }
  }
  #subscribe(events: SourceEvents): () => void {
    this.assertCurrent(); need(!this.#subscribed, "SUBSCRIPTION_CONSUMED"); this.#subscribed = true; this.#listener = events;
    this.#unsubscribe = this.#dependency.subscribe({ event: this.#event, lost: (): void => { this.#poison(new Error("PCB209_RATLINE_CONTEXT_STREAM_LOST")); } });
    need(typeof this.#unsubscribe === "function", "SUBSCRIPTION");
    return (): void => { need(this.#listener === events, "SUBSCRIPTION_CHANGED"); this.#listener = null; };
  }
  #selectedEvent(contextId: number): boolean {
    const selected = this.#context.pcbBootstrapEventContext(contextId); if (selected === null) { return false; }
    need(this.#transition && this.#listener !== null, "PRE_NAVIGATION_CONTEXT");
    if (this.#selected === null) {
      const event = this.#contexts.get(contextId); need(event !== undefined, "ORIGINAL_CONTEXT_EVENT");
      const aux = row.parse(selected["auxData"]);
      this.#selected = Object.freeze({ sessionId: this.#dependency.parentSessionId, parentTargetId: this.#dependency.parentTargetId,
        frameId: token.parse(aux["frameId"]), contextId, uniqueContextId: token.parse(selected["uniqueId"]), origin: "https://client", frameUrl: null });
      this.#listener.event(eventSchema.parse(event));
    }
    need(contextId === this.#selected.contextId && selected["uniqueId"] === this.#selected.uniqueContextId, "SELECTED_CONTEXT_CHANGED"); return true;
  }
  readonly #event = (input: DiagnosticEvent): void => {
    let capturedEvent: DiagnosticEvent | null = null;
    try {
      this.assertCurrent(); const event = eventSchema.parse(captureCurrentPcbStringClockReply(input).value);
      capturedEvent = event;
      this.#lastEvent = currentPcb209RatlineEventKind(event.method); this.#step = "event-classification";
      need(event.sessionId === this.#dependency.parentSessionId && this.#listener !== null && this.#events < 4096, "EVENT_OWNER"); this.#events += 1;
      const { method, params } = event;
      if (method === "Debugger.resumed" && this.#navigationPause === "resume" && !this.#navigationResumed) {
        need(Object.keys(params).length === 0, "NAVIGATION_RESUMED"); this.#navigationResumed = true; this.#navigationResumeEvent.resolve(null); return;
      }
      if (method === "Debugger.paused" && this.#selected === null) { this.#navigationStop(event); return; }
      if (method === "Debugger.paused" || method === "Debugger.resumed" || method === "Target.attachedToTarget") {
        need(this.#transition && this.#selected !== null, "UNEXPECTED_STOP");
        if (method === "Debugger.paused") {
          const location = z.looseObject({ scriptId: token });
          const callFrame = z.looseObject({ location });
          const frames = z.looseObject({ callFrames: z.array(callFrame).min(1).max(32) }).parse(params);
          need(this.#scripts.get(frames.callFrames[0]?.location.scriptId ?? "") === this.#selected.contextId, "FOREIGN_PAUSE");
        }
        if (method === "Debugger.resumed") { this.#resumes += 1; }
        this.#listener.event(event); return;
      }
      const enableReplay = !this.#transition && (this.#enable === "Runtime.enable" && method === "Runtime.executionContextCreated" ||
        this.#enable === "Debugger.enable" && method === "Debugger.scriptParsed");
      if (!enableReplay || !this.#context.observePcbBootstrapEnableReplay(event)) { this.#context.observeEvent(event); }
      if (method === "Runtime.executionContextCreated") {
        const id = contextCreated.parse(params).context.id; this.#contexts.set(id, event); this.#selectedEvent(id); return;
      }
      if (method === "Debugger.scriptParsed") {
        const script = scriptParsed.parse(params); this.#scripts.set(script.scriptId, script.executionContextId);
        const prior = this.#scriptEvents.get(script.scriptId); this.#scriptEvidenceBytes -= prior?.bytes ?? 0; this.#scriptEvents.delete(script.scriptId); this.#navigationScriptEvents.delete(script.scriptId);
        const captured = captureCurrentPcb209RatlineStopRecord(event, 16_384);
        while (this.#scriptEvents.size >= 32 || this.#scriptEvidenceBytes + (captured.bytes ?? 0) > 131_072) {
          const first = this.#scriptEvents.entries().next().value; need(first !== undefined, "SCRIPT_EVIDENCE_BOUND");
          this.#scriptEvents.delete(first[0]); this.#navigationScriptEvents.delete(first[0]); this.#scriptEvidenceBytes -= first[1].bytes ?? 0; this.#scriptEvidenceExhausted = true;
        }
        this.#scriptEvents.set(script.scriptId, captured); this.#scriptEvidenceBytes += captured.bytes ?? 0;
        if (this.#transition && this.#navigationPending && this.#selected === null) { this.#navigationScriptEvents.add(script.scriptId); }
        if (this.#selectedEvent(script.executionContextId)) { this.#listener.event(event); } return;
      }
      if (method === "Runtime.consoleAPICalled") {
        const id = z.looseObject({ executionContextId: z.number().int().positive() }).parse(params).executionContextId;
        if (this.#selectedEvent(id)) { this.#listener.event(event); }
      }
      this.assertCurrent();
    } catch (error) {
      this.#retainStop(input, capturedEvent);
      this.#poison(error);
    }
  };
  #retainStop(input: DiagnosticEvent, capturedEvent: DiagnosticEvent | null, originalPending = false): void {
    if (this.#failed && !originalPending || this.#rejectedStop !== null || !currentPcb209RatlineIsStop(input)) { return; }
    const frame = z.looseObject({ location: z.looseObject({ scriptId: token }) });
    const top = z.looseObject({ callFrames: z.array(frame).min(1).max(32) }).safeParse(capturedEvent?.params);
    const scriptId = top.success ? top.data.callFrames[0]?.location.scriptId : undefined;
    const contextId = scriptId === undefined ? null : this.#scripts.get(scriptId) ?? null;
    const contextEvent = contextId === null ? undefined : this.#contexts.get(contextId);
    this.#rejectedStop = captureCurrentPcb209RatlineStop(input, scriptId === undefined ? null : this.#scriptEvents.get(scriptId) ?? null,
      contextEvent === undefined ? null : captureCurrentPcb209RatlineStopRecord(contextEvent, 8192), { transitionStarted: this.#transition,
        selectedContextObserved: this.#selected !== null, originalUiUniqueContextId: this.#originalUiUniqueContextId,
        selectedContextId: this.#selected?.contextId ?? null, observedTopScriptContextId: contextId });
  }
  #navigationStop(event: DiagnosticEvent): void {
    need(this.#transition && this.#navigationPending && this.#navigationPause === "unused", "NAVIGATION_PAUSE_PHASE");
    const top = z.looseObject({ data: z.looseObject({ scriptId: token }) }).parse(event.params);
    const script = this.#scriptEvents.get(top.data.scriptId);
    need(script?.status === "captured" && this.#navigationScriptEvents.has(top.data.scriptId), "NAVIGATION_SCRIPT_EVENT");
    const scriptId = qualifyCurrentPcb209RatlineNavigationPause(event, eventSchema.parse(script.value), this.#dependency.parentSessionId, this.#originalUiContextId);
    this.#navigationPause = "source";
    void observed((async (): Promise<void> => {
      try {
        await this.#current(); need(this.#navigationPending, "NAVIGATION_SETTLED"); this.#step = "navigation-source"; this.#lastCommand = "Debugger.getScriptSource";
        const raw = await bounded(this.#dependency.request({ method: "Debugger.getScriptSource", sessionId: this.#dependency.parentSessionId,
          navigationPhase: "source", params: { scriptId } }));
        this.assertCurrent(); need(this.#navigationPending, "NAVIGATION_SETTLED"); qualifyCurrentPcb209RatlineNavigationSource(raw);
        await this.#current(); need(this.#navigationPending, "NAVIGATION_SETTLED"); this.#navigationPause = "resume";
        this.#step = "navigation-resume"; this.#lastCommand = "Debugger.resume";
        const reply = await bounded(this.#dependency.request({ method: "Debugger.resume", sessionId: this.#dependency.parentSessionId,
          navigationPhase: "resume", params: {} }));
        z.object({}).strict().parse(captureCurrentPcbStringClockReply(reply).value);
        await bounded(this.#navigationResumeEvent.promise); this.assertCurrent(); this.#navigationPause = "complete";
      } catch (error) { this.#retainStop(event, event, true); this.#poison(error); }
    })());
  }
  public retainedRejectedStopEvidence(): CurrentPcb209RatlineStopEvidence | null { return this.#rejectedStop; }
  async #sourceRequest(command: SourceCommand): Promise<unknown> {
    this.#same(); need(!this.#released, "RELEASED");
    const cleanup = command.method === "Debugger.removeBreakpoint";
    if (!cleanup) { this.assertCurrent(); }
    if (command.method === "Debugger.resume" && this.#resumes === 28) {
      need(this.#sourceReleaseArmed && !this.#sourceReleaseConsumed, "SOURCE_CONTINUATION_PROOF"); this.#sourceReleaseConsumed = true;
    }
    const enabling = command.method === "Runtime.enable" || command.method === "Debugger.enable";
    if (enabling) { need(!this.#transition && this.#enable === null, "ENABLE_PHASE"); this.#enable = command.method; }
    this.#lastCommand = command.method; this.#step = "source-request";
    try { return await this.#dependency.request(command); } finally { if (enabling) { this.#enable = null; } }
  }
  async #snapshot(command: CurrentPcb209RatlinePcbContextParentCommand): Promise<Row> {
    await this.#current(); need(this.#commands < 12, "PROOF_COMMAND_BUDGET"); this.#commands += 1;
    this.#lastCommand = command.method; this.#step = "ancestry-request";
    const raw = await bounded(this.#dependency.requestParent(command));
    const reply = row.parse(captureCurrentPcbStringClockReply(raw).value);
    await this.#current(); return reply;
  }
  async #fresh(admission: boolean): Promise<void> {
    need(this.#selected !== null && this.#proofSets < 3, "PROOF_STAGE"); const selected = this.#selected, sessionId = this.#dependency.parentSessionId;
    const targets = await this.#snapshot({ method: "Target.getTargets", params: {} });
    const frames = await this.#snapshot({ method: "Page.getFrameTree", params: {}, sessionId });
    if (admission) { need(this.#context.observePcbOpeningFrames(targets, frames).frameId === selected.frameId, "SELECTED_FRAME"); }
    else { this.#context.reprovePcbBootstrapFrames(targets, frames); }
    const owner = await this.#snapshot({ method: "DOM.getFrameOwner", sessionId, params: { frameId: selected.frameId } });
    const backendNodeId = z.number().int().positive().max(2_147_483_647).parse(owner["backendNodeId"]);
    const node = await this.#snapshot({ method: "DOM.describeNode", sessionId, params: { backendNodeId, depth: 0, pierce: false } });
    if (admission) { this.#context.observePcbFrameOwner(owner, node); } else { this.#context.reprovePcbBootstrapOwner(owner, node); }
    this.#context.assertPcbBootstrapContext(selected); this.#proofSets += 1; this.assertCurrent();
  }
  async #proveContext(value: CurrentPcb209RatlinePcbBootstrapContext): Promise<void> {
    try {
      this.assertCurrent(); const selected = this.#selected;
      need(selected !== null && value.sessionId === selected.sessionId && value.parentTargetId === selected.parentTargetId &&
        value.frameId === selected.frameId && value.contextId === selected.contextId && value.uniqueContextId === selected.uniqueContextId &&
        value.origin === selected.origin && (value.frameUrl === null || value.frameUrl === "https://client/editor?entry=pcb"), "SOURCE_CONTEXT");
      if (this.#admission === null) {
        const pending = Promise.withResolvers<null>(); this.#admission = withoutValue(pending.promise); void observed(this.#admission);
        void observed((async (): Promise<void> => { try { await this.#fresh(true); pending.resolve(null); } catch (error) { pending.reject(error); } })());
      }
      await this.#admission; this.assertCurrent(); this.#context.assertPcbBootstrapContext(value);
    } catch (error) { this.#poison(error); throw error; }
  }
  public async releaseOriginalPinnedSource(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<void> {
    need(this.#continuation === null, "CONTINUATION_CONSUMED"); const pending = Promise.withResolvers<null>(); this.#continuation = withoutValue(pending.promise); void observed(this.#continuation);
    try {
      await this.#sourceOwner.requireOriginal(packet); this.assertCurrent(); need(this.#proofSets === 1 && this.#resumes === 28, "SOURCE_HELD");
      await this.#fresh(false); this.assertCurrent(); this.#sourceReleaseArmed = true;
      await this.#sourceOwner.releaseOriginalPinnedSource(packet); this.assertCurrent(); pending.resolve(null);
    } catch (error) { this.#poison(error); pending.reject(error); throw error; }
  }
  /** The enclosing coordinator first requires the actual held child packet.
   * This method rechecks its original parent only and grants no child identity. */
  public async reproveFirstChildHeld(packet: CurrentPcb209RatlinePcbBootstrapPacket): Promise<void> {
    need(this.#childHeld === null, "CHILD_PROOF_CONSUMED"); const pending = Promise.withResolvers<null>(); this.#childHeld = withoutValue(pending.promise); void observed(this.#childHeld);
    try {
      await this.#sourceOwner.requireOriginal(packet); this.assertCurrent(); need(this.#proofSets === 2 && this.#sourceReleaseConsumed, "SOURCE_CONTINUATION_REQUIRED");
      await this.#fresh(false); this.assertCurrent(); pending.resolve(null);
    } catch (error) { this.#poison(error); pending.reject(error); throw error; }
  }
  async #termination(): Promise<void> { this.#same(); await bounded(this.#dependency.assertOriginalTermination()); this.#same(); }
  public async abort(): Promise<void> { this.#poison(); await this.#sourceOwner.abort(); }
  public async releaseAfterTermination(): Promise<void> {
    if (this.#release === null) {
      const pending = Promise.withResolvers<null>(); this.#release = withoutValue(pending.promise); void observed(this.#release);
      void observed((async (): Promise<void> => { try {
        await this.#termination(); await this.#sourceOwner.releaseAfterTermination();
        this.#same(); this.#released = true; this.#unsubscribe?.(); this.#unsubscribe = null; pending.resolve(null);
      } catch (error) { pending.reject(error); } })());
    }
    await this.#release;
  }
  public status(): Row { return Object.freeze({ failed: this.#failed, released: this.#released, transitionStarted: this.#transition,
    selectedContextObserved: this.#selected !== null, proofSets: this.#proofSets, proofCommands: this.#commands, events: this.#events,
    firstFailure: this.#firstFailure, step: this.#step, lastCommand: this.#lastCommand, lastEvent: this.#lastEvent, sourceOwner: this.#sourceOwner.status(),
    navigationPause: this.#navigationPause, navigationResumed: this.#navigationResumed,
    retainedScriptEvidenceBytes: this.#scriptEvidenceBytes, scriptEvidenceExhausted: this.#scriptEvidenceExhausted,
    rejectedStop: this.#rejectedStop === null ? null : summarizeCurrentPcb209RatlineStop(this.#rejectedStop),
    sourceContinuationConsumed: this.#sourceReleaseConsumed, nativeWorkerTargetIdentityVerified: false, executionAuthorized: false }); }
}
