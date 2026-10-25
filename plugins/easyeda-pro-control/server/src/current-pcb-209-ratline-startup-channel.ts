/** Separate fixed native launch channel through the first ratline child's held
 * import. The original launch ledger, parent object and pipe never transfer by
 * serialized receipt. The old startup channels keep their existing limits. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcb209WorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent, CurrentPcbWorkerStartupParentCommand } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupParent } from "./current-pcb-worker-startup-channel.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as PROFILE, assertOriginalCurrentPcb209RatlineBudget, currentPcb209RatlineSourceBudget, isCurrentPcb209RatlineNormalResourceRefusal } from "./current-pcb-209-ratline-budget.ts";
import type { CurrentPcb209RatlineBudget, CurrentPcb209RatlineReplyKind } from "./current-pcb-209-ratline-budget.ts";
import { currentPcb209RatlineNativeWire } from "./current-pcb-209-ratline-native-wire.ts";
// oxlint-disable-next-line import/max-dependencies -- This channel joins the prelude vocabulary, finite ratline encoder, original launch ledger and shared bounded diagnostic classifier.
import { currentPcb209RatlineEventKind, currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import type { CurrentPcb209RatlineEventKind } from "./current-pcb-209-ratline-diagnostics.ts";
import type { CurrentPcb209RatlineNativeCommand, CurrentPcb209RatlineNativeRole } from "./current-pcb-209-ratline-native-cases.ts";
import { CurrentPcb209RatlineHeldConstruction } from "./current-pcb-209-ratline-held-construction.ts";

import { qualifyCurrentPcb209RatlineNavigationSource } from "./current-pcb-209-ratline-navigation-pause.ts";
import { qualifyCurrentPcb209RatlineLoaderSource } from "./current-pcb-209-ratline-loader-pause.ts";

export interface CurrentPcb209RatlineStartupNativeDependency {
  readonly requireOriginalParent: () => Promise<CurrentPcbWorkerStartupParent>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly observeOriginalParentEvent: (event: CurrentPcbWorkerStartupEvent) => unknown;
  readonly exchange: (request: Readonly<Record<string, unknown>>) => Promise<unknown>;
}
export interface CurrentPcb209RatlineStartupDependency {
  readonly parentTargetId: string; readonly parentSessionId: string;
  readonly assertOriginalOwner: () => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (role: CurrentPcb209RatlineNativeRole, command: CurrentPcb209RatlineNativeCommand) => Promise<unknown>;
  readonly requestParent: (command: CurrentPcbWorkerStartupParentCommand) => Promise<unknown>;
  readonly subscribe: (events: Readonly<{ event: (event: CurrentPcbWorkerStartupEvent) => void; lost: () => void }>) => () => void;
}
type Command = (CurrentPcbWorkerStartupCommand | CurrentPcb209RatlineNativeCommand) & Readonly<{ sessionId?: string }>;
type Route = "startup" | "parent" | CurrentPcb209RatlineNativeRole;
type RatlineEvents = Parameters<CurrentPcb209RatlineStartupDependency["subscribe"]>[0];
interface Realm { arms: number; armed: boolean; sources: number; resumes: number; scriptId: string | null }
interface Allocation { readonly sessionId: string; readonly kind: CurrentPcb209RatlineReplyKind; removed: boolean }
type EventObservation = Readonly<{ kind: CurrentPcb209RatlineEventKind; session: "parent" | "child" | "background" | "other" }>;
type Failure = Readonly<{ code: string; reason: string | null; phase: "startup" | "preparation" | "ratline";
  lastCommand: Command["method"] | null; lastRoute: Route | null; lastEvent: EventObservation | null; nextRequestId: number;
  pendingReplies: number; pcbArms: number; pcbSources: number; pcbResumes: number; childArms: number; childSources: number; childResumes: number }>;
const token = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u);
const nativeToken = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const externalStackSchema = z.object({ id: nativeToken, debuggerId: nativeToken }).strict();
const parentSchema = z.object({ targetId: token, sessionId: token, nextRequestId: z.number().int().min(1).max(PROFILE.requestLimit) }).strict();
const ackSchema = z.object({ written: z.literal(true) }).strict();
const MAX_FRAME = PROFILE.frames.ordinary;
interface Pending {
  readonly id: number;
  readonly command: Command;
  readonly route: Route;
  readonly phase: string;
  readonly kind: CurrentPcb209RatlineReplyKind;
  readonly frameBytes: number;
  classified: boolean;
  readonly completion: PromiseWithResolvers<unknown>;
  readonly allocation: boolean;
  written: boolean;
  writeFailed: boolean;
  replied: boolean;
  result: unknown;
  remoteError: boolean;
  settled: boolean;
}
function fail(code: string): Error { return new Error(`PCB209_RATLINE_STARTUP_CHANNEL_${code}`); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: object, keys: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === [...keys].toSorted().join(","); }
function cleanupCommand(command: Command): boolean {
  return command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
}
function parentCommand(command: Command): boolean {
  return command.method === "Target.getTargets" || command.method === "Page.getFrameTree" ||
    command.method === "DOM.getFrameOwner" || command.method === "DOM.describeNode" ||
    command.method === "Debugger.getScriptSource" && "pcbPhase" in command ||
    command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params;
}
function members(dependency: CurrentPcb209RatlineStartupNativeDependency): readonly unknown[] {
  if (!record(dependency) || types.isProxy(dependency) ||
      Object.getPrototypeOf(dependency) !== Object.prototype && Object.getPrototypeOf(dependency) !== null) { throw fail("DEPENDENCY"); }
  const fields = ["requireOriginalParent", "assertOriginalTermination", "observeOriginalParentEvent", "exchange"] as const;
  if (Reflect.ownKeys(dependency).length !== fields.length) { throw fail("DEPENDENCY"); }
  return fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(dependency, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "function") { throw fail("DEPENDENCY"); }
    return descriptor.value as unknown;
  });
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original pending operation and channel status retain the failure.
  }
}

export class CurrentPcb209RatlineStartupChannel {
  readonly #budget: CurrentPcb209RatlineBudget;
  readonly #heldConstruction = new CurrentPcb209RatlineHeldConstruction();
  readonly #allocations = new Map<string, Allocation>();
  readonly #paused = new Map<string, CurrentPcb209RatlineReplyKind>();
  readonly #resumeIssued = new Set<string>();
  readonly #realms: Readonly<Record<CurrentPcb209RatlineNativeRole, Realm>> = {
    pcb: { arms: 0, armed: false, sources: 0, resumes: 0, scriptId: null }, worker: { arms: 0, armed: false, sources: 0, resumes: 0, scriptId: null },
  };
  #phase: "startup" | "preparation" | "ratline" = "startup";
  #ratlineListener: RatlineEvents | null = null;
  #ratlineSubscribed = false;
  #routingClaimed = false;
  #child: Readonly<{ targetId: string; sessionId: string }> | null = null;
  #childStarted = false;
  #parentDebuggerId: string | null = null;
  #childFirstPauseObserved = false;
  #childExternalStack: Readonly<{ id: string; debuggerId: string }> | null = null;
  #originStackConsumed = false;
  #cleanup: Promise<void> | null = null;
  #abortAcknowledged = false;
  readonly #native: CurrentPcb209RatlineStartupNativeDependency;
  readonly #members: readonly unknown[];
  readonly #parentMethod: CurrentPcb209RatlineStartupNativeDependency["requireOriginalParent"];
  readonly #terminate: CurrentPcb209RatlineStartupNativeDependency["assertOriginalTermination"];
  readonly #parentEvent: CurrentPcb209RatlineStartupNativeDependency["observeOriginalParentEvent"];
  readonly #exchange: CurrentPcb209RatlineStartupNativeDependency["exchange"];
  readonly #pending = new Map<number, Pending>();
  readonly #workers = new Map<string, string>();
  #parent: CurrentPcbWorkerStartupParent | null = null;
  #listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  #tail: Promise<void> = Promise.resolve();
  #buffer = Buffer.alloc(4096);
  #used = 0;
  #nextId = 0;
  #pollTimer: ReturnType<typeof setTimeout> | null = null;
  #pollQueued = false;
  #started = false;
  #released = false;
  #releaseRequested = false;
  #terminationVerified = false;
  #queuedRequests = 0;
  #attachIssued = false;
  #attachAcknowledged = false;
  #openingIdentity: string | null = null;
  #openingContext: string | null = null;
  #openingConsumed = false;
  #actorReads = 0;
  #pcbPreflightConsumed = false;
  #pcbOpeningConsumed = false;
  #navigationPausedScript: string | null = null;
  #navigationSourceConsumed = false;
  #navigationSourceQualified = false;
  #navigationResumeConsumed = false;
  #navigationResumeQualified = false;
  #navigationResumeObserved = false;
  #loaderPausedScript: string | null = null;
  #loaderSourceConsumed = false;
  #loaderSourceQualified = false;
  #loaderResumeConsumed = false;
  #failure: Error | null = null;
  #firstFailure: Failure | null = null;
  #lastCommand: Command["method"] | null = null;
  #lastRoute: Route | null = null;
  #lastEvent: EventObservation | null = null;
  #fatal = false;

  public constructor(native: CurrentPcb209RatlineStartupNativeDependency, budget: CurrentPcb209RatlineBudget) {
    assertOriginalCurrentPcb209RatlineBudget(budget); this.#budget = budget;
    this.#members = members(native); this.#native = native;
    this.#parentMethod = native.requireOriginalParent; this.#terminate = native.assertOriginalTermination;
    this.#parentEvent = native.observeOriginalParentEvent; this.#exchange = native.exchange;
  }
  public status(): Readonly<{ started: boolean; released: boolean; failed: boolean; fatal: boolean;
    pendingReplies: number; nextRequestId: number; phase: "startup" | "preparation" | "ratline"; childStarted: boolean;
    attachedWorkers: number; receivedBytes: number; pollCount: number; budget: ReturnType<CurrentPcb209RatlineBudget["snapshot"]>;
    firstFailure: Failure | null; lastCommand: Command["method"] | null; lastRoute: Route | null; lastEvent: EventObservation | null }> {
    return Object.freeze({ started: this.#started, released: this.#released, failed: this.#failure !== null, fatal: this.#fatal,
      pendingReplies: this.#pending.size, nextRequestId: this.#nextId, phase: this.#phase, childStarted: this.#childStarted,
      attachedWorkers: this.#workers.size, receivedBytes: this.#budget.snapshot().receivedBytes, pollCount: this.#budget.snapshot().polls, budget: this.#budget.snapshot(),
      firstFailure: this.#firstFailure, lastCommand: this.#lastCommand, lastRoute: this.#lastRoute, lastEvent: this.#lastEvent });
  }
  #sameMethods(): void {
    assertOriginalCurrentPcb209RatlineBudget(this.#budget);
    if (members(this.#native).some((value, index) => value !== this.#members[index])) { throw fail("DEPENDENCY_CHANGED"); }
  }
  async #current(): Promise<void> {
    await this.#queue(() => this.#currentWithinQueue());
  }
  async #currentWithinQueue(): Promise<void> {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw this.#failure ?? fail("RELEASED"); }
    try {
      this.#sameMethods(); this.#budget.assertNormal(); const parent = await this.#parentMethod.call(this.#native); this.#sameMethods(); this.#budget.assertNormal();
      if (parent !== this.#parent || this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("ORIGINAL_PARENT"); }
    } catch (error) { this.#poison("OWNER", false, error); throw error; }
  }
  public async start(): Promise<CurrentPcbWorkerStartupDependency> {
    if (this.#started) { throw fail("START_CONSUMED"); } this.#started = true;
    await this.#queue(async (): Promise<void> => {
      this.#sameMethods(); const original = await this.#parentMethod.call(this.#native); this.#sameMethods();
      if (!record(original) || types.isProxy(original) || !Object.isFrozen(original)) { throw fail("PARENT"); }
      const parent = parentSchema.parse(captureCurrentPcbStringClockReply(original).value);
      if (this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
      if (this.#budget.snapshot().requests + 1 !== parent.nextRequestId) { throw fail("ORIGINAL_COUNTER"); }
      this.#parent = original; this.#nextId = parent.nextRequestId;
    });
    const parent = this.#parent;
    if (parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
    return Object.freeze({ parentTargetId: parent.targetId, parentSessionId: parent.sessionId,
      assertOriginalOwner: (): Promise<void> => this.#current(),
      assertOriginalTermination: (): Promise<void> => this.#originalTermination(),
      request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => this.#request("startup", command),
      subscribe: (listener: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
        if (this.#listener !== null || this.#released) { throw fail("SUBSCRIBER"); }
        this.#listener = listener; this.#schedulePoll(0);
        return (): void => { if (this.#listener === listener) { this.#listener = null; } };
      },
    });
  }
  #poison(code: string, fatal = false, cause?: unknown): void {
    const first = this.#failure === null; this.#failure ??= fail(code); this.#fatal ||= fatal;
    if (first) {
      this.#firstFailure = Object.freeze({ code, reason: cause === undefined ? null : currentPcb209RatlineFailureReason(cause), phase: this.#phase,
        lastCommand: this.#lastCommand, lastRoute: this.#lastRoute, lastEvent: this.#lastEvent, nextRequestId: this.#nextId, pendingReplies: this.#pending.size,
        pcbArms: this.#realms.pcb.arms, pcbSources: this.#realms.pcb.sources, pcbResumes: this.#realms.pcb.resumes,
        childArms: this.#realms.worker.arms, childSources: this.#realms.worker.sources, childResumes: this.#realms.worker.resumes });
      try { this.#ratlineListener?.lost(); } catch { this.#fatal = true; }
    }
    for (const pending of this.#pending.values()) {
      if (!pending.allocation && !pending.settled) { pending.settled = true; pending.completion.reject(this.#failure); }
    }
  }
  #queue(work: () => Promise<void>): Promise<void> {
    const previous = this.#tail;
    const next = (async (): Promise<void> => { await previous; await work(); })();
    this.#tail = observe(next); return next;
  }
  #attributed(command: Command): void {
    if (this.#parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("NOT_STARTED"); }
    if (command.method === "Target.setAutoAttach") {
      if (command.sessionId !== this.#parent.sessionId || this.#attachIssued) { throw fail("ATTACHMENT"); }
      return;
    }
    if (parentCommand(command)) {
      if (command.method !== "Target.getTargets" && command.sessionId !== this.#parent.sessionId) { throw fail("PARENT_SESSION"); }
      if (command.method === "Debugger.getScriptSource") { throw fail("PCB_SOURCE_SEQUENCE"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
        if (command.params.arguments.length === 0) {
          if (!this.#openingConsumed || command.params.uniqueContextId !== this.#openingContext || this.#actorReads >= 2) { throw fail("ACTOR_SEQUENCE"); }
          return;
        }
        const identity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
        const phase = command.params.arguments[1].value;
        if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
          if (!this.#openingConsumed || this.#openingIdentity !== identity ||
              phase === "preflight" && this.#pcbPreflightConsumed ||
              phase === "open-document" && (!this.#pcbPreflightConsumed || this.#pcbOpeningConsumed) ||
              phase === "observe" || this.#phase === "startup") { throw fail("PCB_OPENING_SEQUENCE"); }
          return;
        }
        if (phase === "preflight" ? this.#openingIdentity !== null :
            !this.#attachAcknowledged || this.#openingIdentity !== identity || this.#openingConsumed) { throw fail("OPENING_SEQUENCE"); }
      }
      return;
    }
    if (command.sessionId === undefined) { throw fail("WORKER_SESSION"); }
    if (!this.#workers.has(command.sessionId)) { throw fail("WORKER_SESSION"); }
  }
  /** Original opening must be proved before this irreversible boundary. No
   * caller-supplied usage replaces the actual ledger or outstanding requests. */
  public beginPcbPreparation(): void {
    this.#sameMethods(); this.#budget.assertNormal();
    if (!this.#started || this.#phase !== "startup" || !this.#openingConsumed || this.#pending.size > 0 || this.#used !== 0 ||
        this.#queuedRequests !== 0 || this.#failure !== null) { throw fail("PREPARATION_STATE"); }
    this.#phase = "preparation"; this.#budget.beginContinuation();
  }
  public async claimRatlineRouting(): Promise<CurrentPcb209RatlineStartupDependency> {
    if (this.#routingClaimed || this.#phase !== "preparation" || !this.#pcbPreflightConsumed || this.#pending.size > 0 || this.#used !== 0 || this.#queuedRequests !== 0) { throw fail("ROUTING_STATE"); }
    // Consume before awaiting the original owner; failed claims cannot replay.
    this.#routingClaimed = true; await this.#current(); const parent = this.#parent;
    if (parent === null || this.#pending.size > 0 || this.#used !== 0 || this.#queuedRequests !== 0) { throw fail("ROUTING_STATE"); }
    return Object.freeze<CurrentPcb209RatlineStartupDependency>({ parentTargetId: parent.targetId, parentSessionId: parent.sessionId,
      assertOriginalOwner: (): Promise<void> => this.#current(), assertOriginalTermination: (): Promise<void> => this.#originalTermination(),
      request: (role, command): Promise<unknown> => this.#request(role, command), requestParent: command => this.#request("parent", command),
      subscribe: events => {
        if (this.#ratlineSubscribed || this.#released || this.#failure !== null) { throw fail("RATLINE_SUBSCRIBER"); }
        this.#ratlineSubscribed = true; this.#ratlineListener = events; this.#phase = "ratline"; this.#schedulePoll(0);
        return (): void => { if (this.#ratlineListener !== events) { throw fail("RATLINE_SUBSCRIBER_CHANGED"); } this.#ratlineListener = null; };
      } });
  }
  /** Called synchronously by the original helper owner immediately before its
   * one budget.consumeRequest and pipe write. IDs without pending commands
   * cannot be classified; a second write attempt cannot borrow the reservation. */
  public classifyPending(id: number): CurrentPcb209RatlineReplyKind {
    this.#sameMethods(); const pending = this.#pending.get(id);
    if (pending === undefined || pending.classified || pending.written || pending.writeFailed) { throw fail("PENDING_CLASS"); }
    pending.classified = true; return pending.kind;
  }
  /** Synchronous normal-work closure precedes the queued native abort. Later
   * cleanup sends share this retained promise and cannot race the native gate. */
  public beginCleanup(): Promise<void> {
    this.#sameMethods(); this.#budget.beginCleanup();
    if (this.#cleanup === null) {
      const pending = Promise.withResolvers<null>(); this.#cleanup = (async (): Promise<void> => { await pending.promise; })(); void observe(this.#cleanup);
      this.#poison("CLEANUP");
      void observe(this.#queue(async (): Promise<void> => { try {
        z.object({ aborted: z.literal(true) }).strict().parse(captureCurrentPcbStringClockReply(
          await this.#exchange.call(this.#native, { action: "worker-startup-ratline-abort" })).value); this.#abortAcknowledged = true; pending.resolve(null);
      } catch (error) { this.#poison("CLEANUP_ACK", true, error); pending.reject(error); } }));
    }
    return this.#cleanup;
  }
  #originalNavigationPending(): boolean {
    return [...this.#pending.values()].some(pending => pending.route === "parent" && pending.written && !pending.writeFailed && !pending.replied &&
      pending.command.method === "Runtime.callFunctionOn" && "uniqueContextId" in pending.command.params &&
      pending.command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION &&
      pending.command.params.uniqueContextId === this.#openingContext && pending.command.params.arguments[1]?.value === "open-document");
  }
  #ratlineKind(role: CurrentPcb209RatlineNativeRole, command: Command, phase: string): CurrentPcb209RatlineReplyKind {
    if (this.#parent === null || this.#phase !== "ratline" || this.#ratlineListener === null) { throw fail("RATLINE_STATE"); }
    const realm = this.#realms[role], sessionId = role === "pcb" ? this.#parent.sessionId : this.#child?.sessionId;
    if (command.method !== "Target.getTargets" && (sessionId === undefined || command.sessionId !== sessionId && phase !== "start-child")) { throw fail("RATLINE_SESSION"); }
    if (this.#budget.snapshot().phase === "cleanup") {
      if (command.method !== "Debugger.removeBreakpoint" && !(role === "pcb" && command.method === "Debugger.resume")) { throw fail("CLEANUP_COMMAND"); }
      if (command.method === "Debugger.removeBreakpoint") { this.#allocation(command.sessionId, command.params.breakpointId); }
      else if (!this.#paused.has(command.sessionId) || this.#resumeIssued.has(command.sessionId)) { throw fail("CLEANUP_PAUSE"); }
      return "cleanup";
    }
    const bootstrap: CurrentPcb209RatlineReplyKind = role === "pcb" ? "pcb-bootstrap" : "child-bootstrap";
    if (phase.startsWith("bootstrap-") && phase !== "bootstrap-source") {
      const expected = ["bootstrap-auto-attach", "bootstrap-runtime", "bootstrap-debugger", "bootstrap-async-depth", "bootstrap-instrument"][realm.arms];
      if (phase !== expected || role === "pcb" && (!this.#pcbPreflightConsumed || this.#pcbOpeningConsumed) || role === "worker" && this.#childStarted) { throw fail("BOOTSTRAP_ARM_SEQUENCE"); }
      return bootstrap;
    }
    if (!realm.armed) { throw fail("BOOTSTRAP_REQUIRED"); }
    if (phase === "navigation-source" || phase === "navigation-resume") {
      if (role !== "pcb" || !this.#pcbOpeningConsumed || !this.#originalNavigationPending() || realm.sources !== 0 || realm.resumes !== 0 ||
          this.#resumeIssued.has(command.sessionId ?? "") || this.#navigationResumeConsumed) { throw fail("NAVIGATION_SEQUENCE"); }
      if (phase === "navigation-source" ? command.method !== "Debugger.getScriptSource" || this.#navigationPausedScript === null ||
          command.params.scriptId !== this.#navigationPausedScript || this.#navigationSourceConsumed || this.#paused.get(command.sessionId ?? "") !== "pcb-bootstrap" :
          !this.#navigationSourceQualified || this.#paused.get(command.sessionId ?? "") !== "navigation") { throw fail("NAVIGATION_SEQUENCE"); }
      return "navigation";
    }
    if (phase === "loader-source" || phase === "loader-resume") {
      if (role !== "pcb" || !this.#pcbOpeningConsumed || !this.#originalNavigationPending() || realm.sources !== 0 || realm.resumes !== 0 ||
          !this.#navigationResumeQualified || !this.#navigationResumeObserved || this.#resumeIssued.has(command.sessionId ?? "") || this.#loaderResumeConsumed) { throw fail("LOADER_SEQUENCE"); }
      if (phase === "loader-source" ? command.method !== "Debugger.getScriptSource" || this.#loaderPausedScript === null ||
          command.params.scriptId !== this.#loaderPausedScript || this.#loaderSourceConsumed || this.#paused.get(command.sessionId ?? "") !== "pcb-bootstrap" :
          !this.#loaderSourceQualified || this.#paused.get(command.sessionId ?? "") !== "loader") { throw fail("LOADER_SEQUENCE"); }
      return "loader";
    }
    if (phase === "bootstrap-source") {
      if (!this.#pcbOpeningConsumed || role === "worker" && !this.#childStarted || realm.sources >= (role === "pcb" ? 29 : 7) || realm.sources !== realm.resumes) { throw fail("SOURCE_SEQUENCE"); }
      return role === "pcb" ? "pcb-source" : "child-source";
    }
    if (phase === "remove" && command.method === "Debugger.removeBreakpoint") { return this.#allocation(command.sessionId, command.params.breakpointId).kind; }
    if (phase === "resume" && command.method === "Debugger.resume") {
      const kind = this.#paused.get(command.sessionId);
      if (kind === undefined || kind === "navigation" || kind === "loader" || this.#resumeIssued.has(command.sessionId) || role === "worker" && realm.resumes >= 6 ||
          (kind === "pcb-bootstrap" || kind === "child-bootstrap") && realm.sources <= realm.resumes) { throw fail("RESUME_SEQUENCE"); }
      return kind;
    }
    if (role !== "pcb" || realm.sources !== 29) { throw fail("HELD_CHILD_BOUNDARY"); }
    if (phase === "origin-stack") {
      const child = this.#child, observed = this.#childExternalStack;
      if (command.method !== "Debugger.getStackTrace" || this.#originStackConsumed || observed === null || child === null ||
          observed.debuggerId !== this.#parentDebuggerId || command.params.stackTraceId.id !== observed.id ||
          command.params.stackTraceId.debuggerId !== observed.debuggerId || !this.#childStarted || !this.#realms.worker.armed ||
          this.#realms.worker.sources !== 1 || this.#realms.worker.resumes !== 0 ||
          this.#paused.get(child.sessionId) !== "child-bootstrap" || this.#resumeIssued.has(child.sessionId)) { throw fail("ORIGIN_STACK"); }
      return "origin-stack";
    }
    if (phase === "start-child") {
      if (command.method !== "Runtime.runIfWaitingForDebugger" || this.#child === null || command.sessionId !== this.#child.sessionId ||
          this.#childStarted || !this.#realms.worker.armed) { throw fail("CHILD_START"); }
      return "pcb-construction";
    }
    if (phase === "relation-construction") {
      if (!this.#childStarted || this.#paused.has(this.#parent.sessionId) || this.#resumeIssued.has(this.#parent.sessionId) ||
          [...this.#allocations.values()].some(allocation => allocation.sessionId === this.#parent?.sessionId &&
            allocation.kind === "pcb-capture" && !allocation.removed)) { throw fail("CONSTRUCTION_JOIN_BOUNDARY"); }
      this.#heldConstruction.assertOriginalJoin(command); return "pcb-capture";
    }
    if (phase === "targets" || phase.startsWith("creation-")) { return "pcb-construction"; }
    if (phase.startsWith("capture-") || ["object-this", "object-t", "object-o", "relation-bridge", "relation-factory"].includes(phase)) { return "pcb-capture"; }
    throw fail("HELD_CHILD_BOUNDARY");
  }
  #allocation(sessionId: string, id: string): Allocation {
    const allocation = this.#allocations.get(id);
    if (allocation === undefined || allocation.sessionId !== sessionId || allocation.removed) { throw fail("ORIGINAL_ALLOCATION"); } return allocation;
  }
  #consumeRatline(role: CurrentPcb209RatlineNativeRole, command: Command, phase: string): void {
    const realm = this.#realms[role];
    if (phase.startsWith("bootstrap-") && phase !== "bootstrap-source") { realm.arms += 1; }
    if (command.method === "Debugger.getScriptSource" && phase === "bootstrap-source") { realm.sources += 1; realm.scriptId = command.params.scriptId; }
    if (command.method === "Debugger.resume") { this.#resumeIssued.add(command.sessionId); }
    if (command.method === "Debugger.removeBreakpoint") { this.#allocation(command.sessionId, command.params.breakpointId).removed = true; }
    if (phase === "start-child") { this.#childStarted = true; }
    // Attempt consumption precedes the possibly partial write. Neither a lost
    // Acknowledgement nor a late reply grants another lookup or a new ID.
    if (phase === "origin-stack") { this.#originStackConsumed = true; }
    if (phase === "navigation-source") { this.#navigationSourceConsumed = true; this.#paused.set(command.sessionId ?? "", "navigation"); }
    if (phase === "navigation-resume") { this.#navigationResumeConsumed = true; }
    if (phase === "loader-source") { this.#loaderSourceConsumed = true; this.#paused.set(command.sessionId ?? "", "loader"); }
    if (phase === "loader-resume") { this.#loaderResumeConsumed = true; }
    if (phase === "relation-construction") { this.#heldConstruction.consumeOriginalJoin(command); }
    if (command.method === "Debugger.setBreakpoint" && command.params.location.scriptId !== realm.scriptId) { throw fail("SOURCE_SCRIPT"); }
  }
  #retainRatlineReply(pending: Pending): void {
    if (pending.route !== "pcb" && pending.route !== "worker") { throw fail("REPLY_ROLE"); }
    if (pending.route === "pcb") {
      if (pending.phase === "relation-construction") { this.#heldConstruction.observeOriginalJoinReply(pending.result); }
      else { this.#heldConstruction.observeReply(pending.phase, pending.command, pending.result); }
    }
    if (pending.phase === "navigation-source") { qualifyCurrentPcb209RatlineNavigationSource(pending.result); this.#navigationSourceQualified = true; }
    if (pending.phase === "navigation-resume") { z.object({}).strict().parse(captureCurrentPcbStringClockReply(pending.result).value); this.#navigationResumeQualified = true; }
    if (pending.phase === "loader-source") { qualifyCurrentPcb209RatlineLoaderSource(pending.result); this.#loaderSourceQualified = true; }
    if (pending.phase === "bootstrap-debugger" && pending.route === "pcb") {
      this.#parentDebuggerId = z.looseObject({ debuggerId: nativeToken }).parse(pending.result).debuggerId;
    }
    if (pending.allocation) {
      const result = z.looseObject({ breakpointId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }).parse(pending.result);
      if (this.#allocations.has(result.breakpointId) || pending.command.sessionId === undefined) { throw fail("ALLOCATION_REPLY"); }
      this.#allocations.set(result.breakpointId, { sessionId: pending.command.sessionId, kind: pending.kind, removed: false });
      if (pending.phase === "bootstrap-instrument") { this.#realms[pending.route].armed = true; }
    }
  }
  async #request(route: Route, raw: Command): Promise<unknown> {
    const normalized = route === "startup" || route === "parent" ? currentPcb209WorkerStartupWire(raw, 1) : currentPcb209RatlineNativeWire(route, raw, 1);
    const { id: _validationId, ...command } = normalized.command;
    const phase = typeof normalized.request["phase"] === "string" ? normalized.request["phase"] : "";
    if (route === "startup" || route === "parent") {
      if (route === "parent" && this.#phase !== "ratline" || route === "parent" && !parentCommand(command)) { throw fail("PARENT_ROUTE"); }
      this.#attributed(command);
    } else { this.#ratlineKind(route, command, phase); }
    // Successful prelude resumes/removals remain normal work. Once that
    // Original channel has failed, its next cleanup consumes native abort first.
    if (route === "startup" && this.#failure !== null && !this.#fatal && cleanupCommand(command)) { await this.beginCleanup(); }
    const cleaning = this.#budget.snapshot().phase === "cleanup";
    if (this.#fatal || this.#failure !== null && (!cleaning || !cleanupCommand(command))) { throw this.#failure ?? fail("FATAL"); }
    if (cleaning) {
      if (this.#cleanup === null) { throw fail("NATIVE_ABORT_REQUIRED"); }
      await this.#cleanup;
    }
    if (this.#queuedRequests >= PROFILE.pendingRequests) { throw fail("QUEUE_BUDGET"); } this.#queuedRequests += 1;
    const completion = Promise.withResolvers<unknown>();
    const queued = this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      try {
        const cleanup = this.#budget.snapshot().phase === "cleanup";
        if (cleanup) {
          // Work queued before abort must not await an abort queued behind it.
          if (!cleaning || !this.#abortAcknowledged) { throw fail("CLEANUP_INTERRUPTED"); }
          this.#budget.assertCleanup();
        }
        else { await this.#currentWithinQueue(); }
        this.#sameMethods();
        this.#lastCommand = command.method; this.#lastRoute = route;
        if (this.#fatal || this.#released || this.#releaseRequested || this.#pending.size >= (cleanup ? PROFILE.pendingRequests : PROFILE.normalPendingRequests)) { throw fail("REQUEST_BUDGET"); }
        let kind: CurrentPcb209RatlineReplyKind;
        if (route === "startup" || route === "parent") {
          this.#attributed(command);
          if (cleanup) { kind = "cleanup"; }
          else if (this.#phase === "startup") { kind = "prefix"; }
          else { kind = route === "parent" && this.#pcbOpeningConsumed ? "ancestry" : "preparation"; }
        } else { kind = this.#ratlineKind(route, command, phase); }
        if (this.#budget.remainingRequests(kind) === 0) { throw fail("REQUEST_CLASS_BUDGET"); }
        if (!cleanup && this.#budget.snapshot().helperControls >= PROFILE.helperNormalControlMessages) {
          // The original ledger throws before incrementing at this exact cap.
          // Do not consume a CDP ID which the native writer has never seen.
          this.#budget.consumeHelperControl();
        }
        const id = this.#nextId; this.#nextId += 1;
        let frameBytes: number = PROFILE.requestClasses[kind].frameBytes;
        if (kind === "prefix" && command.method !== "Debugger.getScriptSource") { frameBytes = PROFILE.frames.ordinary; }
        if (kind === "pcb-source" || kind === "child-source") { frameBytes = currentPcb209RatlineSourceBudget(kind === "pcb-source" ? "pcb" : "child", this.#realms[kind === "pcb-source" ? "pcb" : "worker"].sources).frameBytes; }
        pending = { id, command, route, phase, kind, frameBytes, classified: false, completion,
          allocation: command.method === "Debugger.setBreakpoint" || command.method === "Debugger.setInstrumentationBreakpoint",
          written: false, writeFailed: false, replied: false, result: null, remoteError: false, settled: false };
        this.#pending.set(id, pending);
        if (route === "pcb" || route === "worker") { this.#consumeRatline(route, command, phase); }
        else { this.#consumePrelude(command); }
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, { ...normalized.request, requestId: id })).value);
        if (!pending.classified || this.#budget.snapshot().requests !== id) { throw fail("ORIGINAL_RESERVATION"); }
        pending.written = true; this.#complete(pending);
      } catch (error) {
        this.#poison("WRITE", false, error);
        if (isCurrentPcb209RatlineNormalResourceRefusal(error, this.#budget)) { void observe(this.beginCleanup()); }
        if (pending === null) { completion.reject(error); }
        else { pending.writeFailed = true; this.#complete(pending); }
      } finally { this.#queuedRequests -= 1; this.#schedulePoll(0); }
    });
    void observe(queued); return completion.promise;
  }
  #consumePrelude(command: Command): void {
    if (command.method === "Target.setAutoAttach") { this.#attachIssued = true; }
    if (command.method !== "Runtime.callFunctionOn" || !("uniqueContextId" in command.params)) { return; }
    if (command.params.arguments.length === 0) { this.#actorReads += 1; }
    else if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
      if (command.params.arguments[1].value === "preflight") { this.#pcbPreflightConsumed = true; } else { this.#pcbOpeningConsumed = true; }
    } else if (command.params.arguments[1].value === "preflight") {
      this.#openingIdentity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]); this.#openingContext = command.params.uniqueContextId;
    } else { this.#openingConsumed = true; }
  }
  #ratlineEvent(event: CurrentPcbWorkerStartupEvent): void {
    if (this.#parent === null || this.#ratlineListener === null) { throw fail("RATLINE_SUBSCRIBER"); }
    const parent = event.sessionId === this.#parent.sessionId;
    if (event.method === "Target.attachedToTarget") {
      const params = event.params;
      const child = params["targetInfo"];
      if (!parent || this.#child !== null || !this.#realms.pcb.armed || !record(child) || child["type"] !== "worker" ||
          child["attached"] !== true || child["title"] !== "pcb-ratline-worker" || typeof child["url"] !== "string" ||
          !/^https:\/\/client\/editor\?entry=pcb-ratline-worker\.js(?:&[^#\\\s]*)?$/u.test(child["url"]) ||
          params["waitingForDebugger"] !== true || !exact(params, ["sessionId", "targetInfo", "waitingForDebugger"])) { throw fail("RATLINE_ATTACHMENT"); }
      const sessionId = token.parse(params["sessionId"]), targetId = token.parse(child["targetId"]);
      if (sessionId === this.#parent.sessionId || this.#workers.has(sessionId) || targetId === this.#parent.targetId || [...this.#workers.values()].includes(targetId)) { throw fail("RATLINE_ATTACHMENT"); }
      this.#child = Object.freeze({ sessionId, targetId });
    }
    if (event.method === "Debugger.paused") {
      if (this.#paused.has(event.sessionId) || this.#resumeIssued.has(event.sessionId)) { throw fail("DUPLICATE_PAUSE"); }
      if (!parent && !this.#childFirstPauseObserved) {
        this.#childFirstPauseObserved = true;
        // Missing or incompatible optional origin data preserves held-source
        // Diagnostics but cannot authorize a lookup from a later event.
        const external = externalStackSchema.safeParse(event.params["asyncStackTraceId"]);
        if (event.params["reason"] === "instrumentation" && this.#childStarted &&
            this.#realms.worker.sources === 0 && this.#realms.worker.resumes === 0 && external.success) {
          this.#childExternalStack = Object.freeze(external.data);
        }
      }
      if (parent && !this.#navigationSourceConsumed) {
        const location = z.looseObject({ scriptId: nativeToken });
        const stopped = z.looseObject({ reason: z.literal("instrumentation"), data: location,
          hitBreakpoints: z.tuple([]), callFrames: z.tuple([z.looseObject({ location })]) }).safeParse(event.params);
        this.#navigationPausedScript = stopped.success && stopped.data.data.scriptId === stopped.data.callFrames[0].location.scriptId ? stopped.data.data.scriptId : null;
      }
      if (parent && this.#navigationResumeObserved && !this.#loaderSourceConsumed && this.#realms.pcb.sources === 0) {
        const location = z.looseObject({ scriptId: nativeToken });
        const stopped = z.looseObject({ reason: z.literal("instrumentation"), data: location,
          hitBreakpoints: z.tuple([]), callFrames: z.tuple([z.looseObject({ location }), z.looseObject({ location }), z.looseObject({ location })]) }).safeParse(event.params);
        this.#loaderPausedScript = stopped.success && stopped.data.data.scriptId === stopped.data.callFrames[0].location.scriptId ? stopped.data.data.scriptId : null;
      }
      const kind: CurrentPcb209RatlineReplyKind = parent ? "pcb-bootstrap" : "child-bootstrap";
      if (event.params["reason"] === "instrumentation") { this.#paused.set(event.sessionId, kind); }
      else {
        const hit = z.array(z.string()).length(1).parse(event.params["hitBreakpoints"])[0];
        const allocation = hit === undefined ? undefined : this.#allocations.get(hit);
        if (allocation === undefined || allocation.removed || allocation.sessionId !== event.sessionId) { throw fail("PAUSE_ALLOCATION"); }
        this.#paused.set(event.sessionId, allocation.kind);
      }
    }
    if (event.method === "Debugger.resumed") {
      const kind = this.#paused.get(event.sessionId);
      if (kind === undefined || !this.#resumeIssued.delete(event.sessionId) || !exact(event.params, [])) { throw fail("UNEXPECTED_RESUME"); }
      this.#paused.delete(event.sessionId);
      if (kind === "navigation") { this.#navigationResumeObserved = true; }
      if (kind === "pcb-bootstrap" || kind === "child-bootstrap") { this.#realms[parent ? "pcb" : "worker"].resumes += 1; }
    }
    this.#ratlineListener.event(event);
  }

  #complete(pending: Pending): void {
    if (!pending.replied) { return; }
    // An allocation ID remains useful cleanup evidence even when WriteFile's
    // Acknowledgment was lost. The poisoned owner prevents further arming.
    // A failed non-allocation write has already rejected its waiter, but its
    // Late original reply still closes the pending record without authority.
    if (!pending.written && !pending.writeFailed) { return; }
    this.#pending.delete(pending.id);
    if (pending.settled) { return; }
    pending.settled = true;
    if (pending.remoteError || this.#failure !== null && !pending.allocation && !cleanupCommand(pending.command)) {
      pending.completion.reject(this.#failure ?? fail("REMOTE"));
    } else {
      if (pending.route === "startup" && pending.command.method === "Target.setAutoAttach") {
        if (!record(pending.result) || !exact(pending.result, [])) { this.#poison("ATTACH_REPLY"); pending.completion.reject(fail("ATTACH_REPLY")); return; }
        this.#attachAcknowledged = true;
      }
      try { if (pending.route === "pcb" || pending.route === "worker") { this.#retainRatlineReply(pending); } }
      catch (error) { this.#poison("ALLOCATION_REPLY", true, error); pending.completion.reject(error); return; }
      pending.completion.resolve(pending.result);
    }
  }
  #schedulePoll(milliseconds: number): void {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal ||
        this.#listener === null && this.#ratlineListener === null && this.#pending.size === 0 || this.#pollQueued || this.#pollTimer !== null) { return; }
    this.#pollTimer = setTimeout(() => { this.#pollTimer = null; this.#poll(); }, milliseconds);
  }
  #poll(): void {
    if (this.#pollQueued || this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
    this.#pollQueued = true;
    const work = this.#queue(async (): Promise<void> => {
      try {
        if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
        this.#sameMethods();
        if (this.#budget.snapshot().phase === "cleanup") {
          if (!this.#abortAcknowledged) { return; }
          this.#budget.assertCleanup();
        } else { this.#budget.assertNormal(); }
        // Native chunks may be64KiB, larger than generic clock text fields.
        this.#chunk(await this.#exchange.call(this.#native, { action: "poll" }));
      } catch (error) {
        if (isCurrentPcb209RatlineNormalResourceRefusal(error, this.#budget)) {
          this.#poison("POLL_RESOURCE", false, error); void observe(this.beginCleanup());
        } else { this.#poison("POLL", true, error); }
      }
      finally { this.#pollQueued = false; this.#schedulePoll(PROFILE.polling.intervalMilliseconds); }
    });
    void observe(work);
  }
  #chunk(raw: unknown): void {
    if (!record(raw) || types.isProxy(raw) || Reflect.ownKeys(raw).join(",") !== "bytes" ||
        Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw fail("CHUNK"); }
    const descriptor = Object.getOwnPropertyDescriptor(raw, "bytes"), text: unknown = descriptor?.value;
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof text !== "string" || text.length > 87_384 ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(text)) { throw fail("CHUNK"); }
    const bytes = Buffer.from(text, "base64");
    if (bytes.length > 65_536 || bytes.toString("base64") !== text) { throw fail("CHUNK"); }
    let start = 0;
    while (start < bytes.length) {
      const zero = bytes.indexOf(0, start);
      const end = zero === -1 ? bytes.length : zero;
      const required = this.#used + end - start;
      const limit = Math.max(MAX_FRAME, ...[...this.#pending.values()].map(pending => pending.frameBytes));
      if (required > limit) { throw fail("FRAME_BUDGET"); }
      if (required > this.#buffer.length) {
        const replacement = Buffer.alloc(Math.min(limit, Math.max(required, this.#buffer.length * 2)));
        this.#buffer.copy(replacement, 0, 0, this.#used); this.#buffer = replacement;
      }
      bytes.copy(this.#buffer, this.#used, start, end); this.#used = required;
      if (zero === -1) { return; }
      this.#frame(this.#buffer.subarray(0, this.#used)); this.#used = 0; start = zero + 1;
    }
  }
  #frame(bytes: Buffer): void {
    if (bytes.length === 0) { throw fail("FRAME"); }
    const value = decodeCurrentPcbDiagnosticJson(bytes);
    if (!record(value)) { throw fail("FRAME"); }
    if (Object.hasOwn(value, "method")) { this.#event(value, bytes.length); return; }
    const id = value["id"];
    if (typeof id !== "number" || !Number.isSafeInteger(id)) { throw fail("REPLY_ID"); }
    const pending = this.#pending.get(id);
    const sessionKeys = pending?.command.sessionId === undefined ? [] : ["sessionId"];
    if (pending === undefined || pending.replied || value["sessionId"] !== pending.command.sessionId ||
        !exact(value, ["id", ...sessionKeys, Object.hasOwn(value, "result") ? "result" : "error"]) ||
        !record(value["result"] ?? value["error"]) || bytes.length + 1 > pending.frameBytes) {
      throw fail("REPLY");
    }
    this.#budget.consumeReply(id, bytes.length + 1);
    pending.replied = true; pending.remoteError = Object.hasOwn(value, "error");
    pending.result = value["result"] ?? null;
    if (pending.remoteError) { this.#poison("REMOTE"); }
    this.#complete(pending);
  }
  #event(value: Record<string, unknown>, bytes: number): void {
    this.#budget.consumeEvent(bytes + 1);
    if (bytes > MAX_FRAME || this.#parent === null) { throw fail("EVENT_BUDGET"); }
    const event = z.object({ method: z.string().min(1).max(128), params: z.record(z.string(), z.unknown()), sessionId: token }).strict()
      .parse(captureCurrentPcbStringClockReply(value).value);
    let session: EventObservation["session"] = "other";
    if (event.sessionId === this.#parent.sessionId) { session = "parent"; }
    else if (event.sessionId === this.#child?.sessionId) { session = "child"; }
    else if (this.#workers.has(event.sessionId)) { session = "background"; }
    this.#lastEvent = Object.freeze({ kind: currentPcb209RatlineEventKind(event.method), session });
    if (this.#phase === "ratline" && (event.sessionId === this.#parent.sessionId || event.sessionId === this.#child?.sessionId)) {
      this.#ratlineEvent(event); return;
    }
    if (event.sessionId === this.#parent.sessionId) {
      if (event.method !== "Target.attachedToTarget") {
        this.#deliverParent(event); return;
      }
      const params = event.params;
      const child = params["targetInfo"], sessionId = token.parse(params["sessionId"]);
      if (!this.#attachIssued || !record(child) || child["type"] !== "worker" || child["attached"] !== true ||
          typeof params["waitingForDebugger"] !== "boolean" || !exact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
          sessionId === this.#parent.sessionId || this.#workers.has(sessionId) || this.#workers.size >= 16) { throw fail("ATTACHMENT"); }
      const targetId = token.parse(child["targetId"]);
      if (targetId === this.#parent.targetId || [...this.#workers.values()].includes(targetId)) { throw fail("ATTACHMENT"); }
      this.#workers.set(sessionId, targetId);
    } else if (!this.#workers.has(event.sessionId)) { throw fail("EVENT_SESSION"); }
    if (this.#listener === null) { throw fail("WORKER_SUBSCRIBER"); }
    this.#listener(event);
  }
  #deliverParent(event: CurrentPcbWorkerStartupEvent): void {
    try {
      const result: unknown = this.#parentEvent.call(this.#native, event);
      if (result !== undefined) {
        // Reject asynchronous observers without leaving their rejection
        // Unobserved. Never assimilate an arbitrary thenable/getter.
        if (types.isPromise(result)) { void observe(result); }
        throw fail("PARENT_EVENT");
      }
    } catch (error) { this.#poison("PARENT_EVENT", false, error); }
  }
  async #originalTermination(): Promise<void> {
    await this.#queue(async (): Promise<void> => {
      this.#sameMethods(); await this.#terminate.call(this.#native); this.#sameMethods();
      this.#terminationVerified = true; this.#budget.endAfterOriginalTermination();
      for (const pending of this.#pending.values()) {
        if (!pending.settled) { pending.settled = true; pending.completion.reject(fail("TERMINATED")); }
      }
      this.#pending.clear();
      if (this.#pollTimer !== null) { clearTimeout(this.#pollTimer); this.#pollTimer = null; }
    });
  }
  /** Original termination, not a timeout or caller flag, ends reply retention.
   * This releases local polling only; native pipe handles belong to the owner. */
  public async releaseAfterTermination(): Promise<void> {
    if (!this.#started || this.#released || this.#releaseRequested) { throw fail("RELEASE_STATE"); }
    this.#releaseRequested = true;
    try { await this.#originalTermination(); }
    catch (error) { this.#releaseRequested = false; this.#schedulePoll(0); throw error; }
    this.#released = true;
    if (this.#pollTimer !== null) { clearTimeout(this.#pollTimer); this.#pollTimer = null; }
    await this.#tail;
    for (const pending of this.#pending.values()) {
      if (!pending.settled) { pending.settled = true; pending.completion.reject(fail("TERMINATED")); }
    }
    this.#pending.clear(); this.#listener = null; this.#ratlineListener = null;
  }
}
