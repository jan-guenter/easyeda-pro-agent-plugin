/* oxlint-disable eslint/max-classes-per-file -- Keep the private core with its fixed-generation wrappers so no caller-selectable profile or decoder constructor is exported. */
/* oxlint-disable import/max-dependencies -- The original construction owner joins independent fixed state, method, timing, actor and channel contracts without merging their authority. */
/** Original-event capture through the fixed startup transport. Peer exclusion,
 * create/Save and writer permits remain outside this class. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION, CURRENT_FOOTPRINT_COPY_STATE_CALLS, decodeCurrentFootprintCopyState } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopyStatePacket, CurrentFootprintCopyStateSample } from "./current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_METHOD_CALLS, decodeCurrentFootprintCopyCacheMethodArray, decodeCurrentFootprintCopyMethodProperties,
  decodeCurrentFootprintCopyNativeMethodProperties } from "./current-footprint-copy-method-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS, decodeCurrentFootprintCopyCacheFactoryArray,
  decodeCurrentFootprintCopyCacheFactoryProperties } from "./current-footprint-copy-cache-factory.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { currentFootprintCopySourceCommand } from "./current-footprint-copy-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS } from "./current-footprint-copy-source-read.ts";
import { CurrentFootprintSourceReplyCapture } from "./current-footprint-source-reply-capture.ts";
import type { CurrentFootprintCopySourceReadRequest } from "./current-footprint-copy-source-read.ts";
import { CurrentFootprintSourceReadRunner } from "./current-footprint-source-read-runner.ts";
import type { CurrentFootprintSourceReadPacket } from "./current-footprint-source-read-runner.ts";
import { types } from "node:util";
import { CURRENT_PCB_209_STARTUP_TIMING, currentPcbStartupMonotonicMs, currentPcbStartupWindowObservation } from "./current-pcb-209-worker-startup-timing.ts";
import type { CurrentPcbStartupWindow, CurrentPcbStartupWindowObservation } from "./current-pcb-209-worker-startup-timing.ts";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES } from "./current-pcb-209-worker-startup-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcb209WorkerCallbackFunction, decodeCurrentPcb209WorkerCallbackScopeList, decodeCurrentPcbStringProducerCallbackFunction, decodeCurrentPcbStringProducerCallbackScopeList } from "./current-pcb-string-producer-callback-scope.ts";
import type { CurrentPcbStringProducerCallbackKind } from "./current-pcb-string-producer-callback-scope.ts";
import { decodeCurrentPcb209WorkerProducerFunction, decodeCurrentPcb209WorkerProducerScopeList, decodeCurrentPcb209WorkerProducerScopes, decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "./current-pcb-string-producer-scope.ts";
import type { CurrentPcb209WorkerProducerKind } from "./current-pcb-string-producer-scope.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS,
  CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS, CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerConstructionAssignment, CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE, CURRENT_PCB_WORKER_CONSTRUCTION_SITES,
  CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerConstructionCommand, CurrentPcbWorkerConstructionExpression,
  CurrentPcbWorkerConstructionSite, CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION, decodeCurrentPcbWorkerStartupActor } from "./current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS } from "./current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupChannelObservationCommand,
  CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import { CurrentPcb209WorkerStartupChannelObservationRunner, CurrentPcbWorkerStartupChannelObservationRunner } from "./current-pcb-worker-startup-channel-observation-runner.ts";

const GROUP = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: token, functionName: z.string().max(256), location });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.array(token).length(1), callFrames: z.array(frame).min(1).max(16) });
const objectReply = z.object({ result: z.looseObject({ type: z.literal("object"), objectId: token }) }).strict();
const resultBoolean = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const emptyReply = z.object({}).strict();
const projectIdentitySchema = z.object({
  projectUuid: z.string().refine(value => /^(?:[a-f\d]{32}|[a-f\d]{64})$/u.exec(value)?.[0] === value),
  branchUuid: z.string().refine(value => /^[a-f\d]{32}$/u.exec(value)?.[0] === value),
  windowTabId: z.string().refine(value => /^[A-Za-z\d_-]{1,128}$/u.exec(value)?.[0] === value),
}).strict();
const projectIdentityReply = z.object({ result: z.object({ type: z.literal("object"), value: projectIdentitySchema }).strict() }).strict();
export type CurrentPcbWorkerConstructionProjectIdentity = Readonly<z.infer<typeof projectIdentitySchema>>;
const REQUEST_MS = 2000, WAIT_MS = 15_000;
type ResumeOrigin = "normal" | "cleanup";
interface ConstructionProgress {
  readonly step: string;
  readonly pauseIndex: number | null;
  readonly window: CurrentPcbStartupWindowObservation | null;
  readonly lastCommand: CurrentPcbWorkerConstructionCommand["method"] | null;
}
interface ConstructionFailure {
  readonly code: string;
  readonly step: string;
  readonly pauseIndex: number | null;
  readonly window: CurrentPcbStartupWindowObservation | null;
  readonly resumeOrigin: ResumeOrigin | null;
  readonly resumeObserved: boolean;
  readonly lastCommand: CurrentPcbWorkerConstructionCommand["method"] | null;
}
interface RetainedPause {
  readonly index: number;
  readonly window: CurrentPcbStartupWindow;
  resumeOrigin: ResumeOrigin | null;
  readonly raw: unknown;
  readonly captureError: unknown;
  readonly resumed: PromiseWithResolvers<null>;
  readonly watchdog: ReturnType<typeof setTimeout>;
  resumeConsumed: boolean;
  resumeObserved: boolean;
  resumeResult: Promise<void> | null;
}
interface RetainedBreakpoint {
  readonly id: string;
  removal: Promise<void> | null;
  removed: boolean;
}
type PacketProfile = "private.current-pcb-worker-construction.v1" | "private.current-pcb209-worker-construction.v1";
interface ConstructionPacket<P extends PacketProfile> {
  readonly profile: P;
  readonly pauses: 9;
  readonly originalConstructorAndFactoryEventsRetained: true;
  readonly originalProjectReceiverMatched: true;
  readonly channelNativeIntrinsicAndPeerOwnershipVerified: false;
  readonly wrapperAssignmentRelationVerified: false;
  readonly nativeStartupIntegrationVerified: false;
  readonly writeDestinationsContained: false;
  readonly executionAuthorized: false;
}
export type CurrentPcbWorkerConstructionPacket = ConstructionPacket<"private.current-pcb-worker-construction.v1">;
export type CurrentPcb209WorkerConstructionPacket = ConstructionPacket<"private.current-pcb209-worker-construction.v1">;
export interface CurrentPcbWorkerConstructionIdentities {
  readonly project: string;
  readonly channelBus: string;
  readonly channel: string;
  readonly onmessage: string;
  readonly upload: string;
  readonly cooperation: string;
  readonly uploadStructure: string;
  readonly structure: string;
  readonly structureDebounce: string;
}
const INTERNAL_PROFILE = Symbol("fixed-worker-construction-profile");
const issued = new WeakMap<ConstructionPacket<PacketProfile>, CurrentPcbWorkerConstructionCore<PacketProfile>>();
const assignmentsIssued = new WeakMap<CurrentPcbWorkerConstructionAssignments, CurrentPcbWorkerConstructionCore<PacketProfile>>();
function fail(code: string): Error { return new Error(`PCB_WORKER_CONSTRUCTION_${code}`); }
async function bounded<T>(promise: Promise<T>, duration = REQUEST_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = Promise.withResolvers<never>();
  try { timer = setTimeout(() => { deadline.reject(fail("DEADLINE")); }, duration); return await Promise.race([promise, deadline.promise]); }
  finally { clearTimeout(timer); }
}
async function observeRejection(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // Original owner retains the error separately.
  }
}
function transportMembers(transport: CurrentPcbWorkerConstructionTransport): readonly unknown[] {
  if (transport === null || typeof transport !== "object" || types.isProxy(transport) || Array.isArray(transport) ||
      Object.getPrototypeOf(transport) !== Object.prototype && Object.getPrototypeOf(transport) !== null) { throw fail("TRANSPORT"); }
  const fields = ["scriptId", "assertOriginalPinnedWorker", "request", "subscribe"] as const;
  const keys = Reflect.ownKeys(transport);
  if (keys.length !== fields.length || keys.some(key => typeof key !== "string" || !fields.some(field => field === key))) { throw fail("TRANSPORT"); }
  return fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") ||
        typeof descriptor.value !== (key === "scriptId" ? "string" : "function")) { throw fail("TRANSPORT"); }
    return descriptor.value as unknown;
  });
}

interface ConstructionDecoders {
  readonly callbackFunction: typeof decodeCurrentPcbStringProducerCallbackFunction;
  readonly callbackScopeList: typeof decodeCurrentPcbStringProducerCallbackScopeList;
  readonly producerFunction: typeof decodeCurrentPcb209WorkerProducerFunction;
  readonly producerScopeList: typeof decodeCurrentPcb209WorkerProducerScopeList;
  readonly producerScopes: typeof decodeCurrentPcb209WorkerProducerScopes;
}
class CurrentPcbWorkerConstructionCore<P extends PacketProfile> {
  readonly #profile: P;
  readonly #sites: typeof CURRENT_PCB_WORKER_CONSTRUCTION_SITES | typeof CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES;
  readonly #decoders: ConstructionDecoders;
  readonly #transport: CurrentPcbWorkerConstructionTransport;
  readonly #send: CurrentPcbWorkerConstructionTransport["request"];
  readonly #assertOwner: CurrentPcbWorkerConstructionTransport["assertOriginalPinnedWorker"];
  readonly #subscribe: CurrentPcbWorkerConstructionTransport["subscribe"];
  readonly #scriptId: string;
  readonly #breakpoints = new Map<CurrentPcbWorkerConstructionSite, RetainedBreakpoint>();
  readonly #identities: { -readonly [K in keyof CurrentPcbWorkerConstructionIdentities]?: string } = {};
  readonly #ready = Promise.withResolvers<null>();
  #waiting = Promise.withResolvers<RetainedPause>();
  #pause: RetainedPause | null = null;
  #unsubscribe: (() => void) | null = null;
  #consumed = false;
  #settled = false;
  #uncertainBreakpoint = false;
  #failed: Error | null = null;
  #firstFailure: ConstructionFailure | null = null;
  #step = "not-started";
  #acceptedPauses = 0;
  #armingWindow: CurrentPcbStartupWindow | null = null;
  #armingWatchdog: ReturnType<typeof setTimeout> | undefined;
  #lastCommand: CurrentPcbWorkerConstructionCommand["method"] | null = null;
  #released = false;
  #releaseConsumed = false;
  #packet: ConstructionPacket<P> | null = null;
  #assignmentConsumed = false;
  #assignmentStep: string | null = null;
  #assignmentReplyCount = 0;
  #assignmentLastReply: Readonly<{ step: string; method: CurrentPcbWorkerConstructionCommand["method"];
    sha256: string; bytes: number; value: unknown }> | null = null;
  #assignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #assignedWrappers: Readonly<Record<CurrentPcbWorkerConstructionAssignment, string>> | null = null;
  #projectIdentityConsumed = false;
  #projectIdentity: CurrentPcbWorkerConstructionProjectIdentity | null = null;
  #actorSampleAttempts = 0;
  #actorSampleBusy = false;
  #footprintConstructors: string | null = null;
  #footprintManager: string | null = null;
  #footprintConsistency: string | null = null;
  #footprintAttempted = false;
  #footprintPacket: CurrentFootprintCopyStatePacket | null = null;
  readonly #footprintReplies: unknown[] = [];
  #footprintMethodsAttempted = false;
  #footprintMethods: string | null = null;
  #footprintMethodScopes: readonly string[] | null = null;
  readonly #footprintMethodReplies: unknown[] = [];
  #footprintCacheFactory: string | null = null;
  #footprintCacheFactoryQualified = false;
  #footprintSourceAttempted = false;
  #footprintSourceRunner: CurrentFootprintSourceReadRunner | null = null;
  #footprintSourcePlan: CurrentFootprintSourcePlan | null = null;
  #footprintSourcePacket: CurrentFootprintSourceReadPacket | null = null;
  readonly #footprintSourceReplies: unknown[] = [];
  readonly #footprintSourceCapture = new CurrentFootprintSourceReplyCapture();
  #channelAttempted = false;
  #channel: CurrentPcbWorkerStartupChannelObservationRunner | null = null;
  #channelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;

  public constructor(internal: typeof INTERNAL_PROFILE, transport: CurrentPcbWorkerConstructionTransport, profile: P,
    sites: typeof CURRENT_PCB_WORKER_CONSTRUCTION_SITES | typeof CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES, decoders: ConstructionDecoders) {
    if (internal !== INTERNAL_PROFILE) { throw fail("INTERNAL_PROFILE"); }
    this.#profile = profile; this.#sites = sites; this.#decoders = Object.freeze(decoders);
    transportMembers(transport);
    this.#transport = transport; this.#scriptId = token.parse(transport.scriptId);
    this.#send = transport.request; this.#assertOwner = transport.assertOriginalPinnedWorker; this.#subscribe = transport.subscribe;
    // A caller may await arming after capture() starts. Avoid an unhandled
    // Rejection when an earlier owner check refuses before that await.
    void observeRejection(this.#ready.promise);
    void observeRejection(this.#waiting.promise);
  }
  public async whenArmed(): Promise<void> { await this.#ready.promise; }
  public status(): Readonly<{ consumed: boolean; failed: boolean; paused: boolean; resumeAttempted: boolean;
    resumeObserved: boolean; retainedIdentities: number; released: boolean; unresolvedBreakpoints: boolean;
    firstFailure: ConstructionFailure | null; resumeOrigin: ResumeOrigin | null; progress: ConstructionProgress;
    assignments: Readonly<{ attempted: boolean; completed: boolean; step: string | null; replyCount: number;
      lastReply: Readonly<{ step: string; method: CurrentPcbWorkerConstructionCommand["method"];
        sha256: string; bytes: number; value: unknown }> | null }> }> {
    return Object.freeze({ progress: this.#progress(), firstFailure: this.#firstFailure, resumeOrigin: this.#pause?.resumeOrigin ?? null, consumed: this.#consumed, failed: this.#failed !== null,
      paused: this.#pause !== null && !this.#pause.resumeObserved, resumeAttempted: this.#pause?.resumeConsumed ?? false,
      resumeObserved: this.#pause?.resumeObserved ?? false, retainedIdentities: Object.keys(this.#identities).length, released: this.#released,
      unresolvedBreakpoints: this.#uncertainBreakpoint || [...this.#breakpoints.values()].some(value => !value.removed),
      assignments: Object.freeze({ attempted: this.#assignmentConsumed, completed: this.#assignments !== null,
        step: this.#assignmentStep, replyCount: this.#assignmentReplyCount, lastReply: this.#assignmentLastReply }) });
  }
  #progress(): ConstructionProgress {
    const pause = this.#pause, window = this.#armingWindow ?? (pause !== null && !pause.resumeObserved ? pause.window : null);
    return Object.freeze({ step: this.#step, pauseIndex: pause?.index ?? null,
      window: window === null ? null : currentPcbStartupWindowObservation(window, currentPcbStartupMonotonicMs()), lastCommand: this.#lastCommand });
  }
  #fail(code: string): void {
    if (this.#failed !== null) { return; }
    this.#firstFailure = Object.freeze({ code, ...this.#progress(), resumeOrigin: this.#pause?.resumeOrigin ?? null,
      resumeObserved: this.#pause?.resumeObserved ?? false });
    this.#failed = fail(code);
  }
  #checkWindow(): void {
    const pause = this.#pause, window = this.#armingWindow ?? (pause !== null && !pause.resumeObserved ? pause.window : null);
    if (window !== null && currentPcbStartupMonotonicMs() - window.startedAtMs >= window.limitMs) {
      this.#fail(this.#armingWindow === null ? "PAUSE_DEADLINE" : "ARMING_DEADLINE");
    }
    if (this.#failed !== null) { throw this.#failed; }
  }
  #sendOriginal(command: CurrentPcbWorkerConstructionCommand): Promise<unknown> {
    this.#lastCommand = command.method; return this.#send.call(this.#transport, command);
  }
  #sameTransport(): void {
    const fields = transportMembers(this.#transport);
    if (fields[0] !== this.#scriptId || fields[1] !== this.#assertOwner || fields[2] !== this.#send || fields[3] !== this.#subscribe) { throw fail("TRANSPORT_CHANGED"); }
  }
  async #current(): Promise<void> {
    this.#checkWindow();
    if (this.#releaseConsumed) { throw fail("RELEASED"); }
    try { this.#sameTransport(); await bounded(this.#assertOwner.call(this.#transport)); this.#sameTransport(); }
    catch (error) { this.#fail("OWNER_LOST"); throw error; }
    this.#checkWindow();
    if (this.#releaseConsumed) { throw fail("OWNER_CHANGED"); }
  }
  async #request(command: CurrentPcbWorkerConstructionCommand, retained?: unknown[], assignmentStep?: string): Promise<unknown> {
    if (assignmentStep !== undefined) { this.#assignmentStep = assignmentStep; this.#step = assignmentStep; }
    if (!this.#settled) { this.#step = "pause-read-owner-before"; } await this.#current();
    if (!this.#settled) { this.#step = "pause-read-request"; }
    const captured = captureCurrentPcbStringClockReply(await bounded(this.#sendOriginal(command)));
    retained?.push(captured.value);
    // Keep the bounded original reply before decoding or an awaited owner
    // Reproof. A refusal must remain diagnosable without resending the probe.
    if (assignmentStep !== undefined) {
      this.#assignmentReplyCount += 1;
      this.#assignmentLastReply = Object.freeze({ step: assignmentStep, method: command.method,
        sha256: captured.sha256, bytes: Buffer.byteLength(captured.text), value: captured.value });
    }
    if (!this.#settled) { this.#step = "pause-read-owner-after"; } await this.#current(); return captured.value;
  }
  readonly #onPaused = (input: unknown): void => {
    if (this.#pause !== null && !this.#pause.resumeObserved) {
      this.#fail("DUPLICATE_PAUSE"); return;
    }
    let captureError: unknown = null, raw: unknown = null;
    try { raw = captureCurrentPcbStringClockReply(input).value; } catch (error) { captureError = error; }
    // Event ordinal, not the capture loop index: the next pause may precede
    // The previous Debugger.resume acknowledgment.
    const index = this.#acceptedPauses; this.#acceptedPauses += 1;
    const limitMs = this.#profile === "private.current-pcb209-worker-construction.v1"
      ? CURRENT_PCB_209_STARTUP_TIMING.constructionPauseMs[index] ?? CURRENT_PCB_209_STARTUP_TIMING.legacyPauseMs
      : CURRENT_PCB_209_STARTUP_TIMING.legacyPauseMs;
    const window = Object.freeze({ startedAtMs: currentPcbStartupMonotonicMs(), limitMs });
    const paused: RetainedPause = { raw, captureError, index, window, resumeOrigin: null,
      resumed: Promise.withResolvers(), resumeConsumed: false, resumeObserved: false, resumeResult: null,
      watchdog: setTimeout(() => {
        this.#fail("PAUSE_DEADLINE"); void observeRejection(this.#cleanupPause(paused));
      }, limitMs) };
    this.#pause = paused; this.#waiting.resolve(paused);
    if (this.#settled) { this.#fail("EXTRA_PAUSE"); void observeRejection(this.#cleanupPause(paused)); }
  };
  readonly #onResumed = (): void => {
    const paused = this.#pause;
    if (paused === null || paused.resumeObserved) { this.#fail("UNEXPECTED_RESUME"); return; }
    if (!paused.resumeConsumed) { this.#fail("UNEXPECTED_RESUME"); }
    if (currentPcbStartupMonotonicMs() - paused.window.startedAtMs >= paused.window.limitMs) { this.#fail("PAUSE_DEADLINE"); }
    paused.resumeObserved = true; clearTimeout(paused.watchdog); paused.resumed.resolve(null);
  };
  readonly #onLost = (): void => { this.#fail("OWNER_LOST"); this.#waiting.reject(this.#failed); };
  #resume(paused: RetainedPause, origin: ResumeOrigin = "normal"): Promise<void> {
    if (paused.resumeResult !== null) { return paused.resumeResult; }
    if (origin === "normal") { this.#checkWindow(); }
    paused.resumeConsumed = true; paused.resumeOrigin = origin;
    // Cleanup deliberately bypasses a failed source check, never the original
    // Transport/session binding. A lost reply consumes resume, without retry.
    paused.resumeResult = (async (): Promise<void> => {
      if (origin === "normal") { this.#step = "pause-resume-request"; }
      const reply = await bounded(this.#sendOriginal({ method: "Debugger.resume", params: {} }));
      emptyReply.parse(captureCurrentPcbStringClockReply(reply).value);
      if (origin === "normal") { this.#step = "pause-resume-observation"; }
      await bounded(paused.resumed.promise);
    })();
    return paused.resumeResult;
  }
  async #cleanupPause(paused: RetainedPause): Promise<void> {
    const errors: unknown[] = [];
    try { await this.#removeBreakpoints(); } catch (error) { errors.push(error); }
    if (!paused.resumeObserved) { try { await this.#resume(paused, "cleanup"); } catch (error) { errors.push(error); } }
    if (errors.length > 0) { throw new AggregateError(errors, "PCB_WORKER_CONSTRUCTION_PAUSE_CLEANUP"); }
  }
  #select(callFrameId: string, expression: CurrentPcbWorkerConstructionExpression): Promise<unknown> {
    return this.#request({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression, objectGroup: GROUP,
      silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } });
  }
  async #object(callFrameId: string, expression: CurrentPcbWorkerConstructionExpression): Promise<string> {
    return objectReply.parse(await this.#select(callFrameId, expression)).result.objectId;
  }
  async #same(objectId: string, other: string, project = false): Promise<void> {
    resultBoolean.parse(await this.#request({ method: "Runtime.callFunctionOn", params: { objectId,
      functionDeclaration: project ? CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT : CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
      arguments: [{ objectId: other }], objectGroup: GROUP, silent: true, returnByValue: true, generatePreview: false,
      throwOnSideEffect: true, awaitPromise: false, userGesture: false } }));
  }
  async #receiver(callFrameId: string): Promise<void> {
    const current = await this.#object(callFrameId, "this"), original = this.#identities.project;
    if (original === undefined) { this.#identities.project = current; }
    else { await this.#same(original, current); }
  }
  async #arrow(callFrameId: string, expression: "e" | "t", kind: CurrentPcbStringProducerCallbackKind): Promise<string> {
    const original = this.#decoders.callbackFunction(await this.#select(callFrameId, expression), kind);
    this.#decoders.callbackScopeList(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: original, ownProperties: true, generatePreview: false } }), this.#scriptId, kind);
    return original;
  }
  async #capturePause(paused: RetainedPause, index: number): Promise<void> {
    if (paused.captureError !== null) { throw new Error("PCB_WORKER_CONSTRUCTION_EVENT_CAPTURE", { cause: paused.captureError }); }
    const event = pauseSchema.parse(paused.raw), site = CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE[index];
    if (site === undefined) { throw fail("EXTRA_PAUSE"); }
    const target = this.#sites[site], top = event.callFrames[0];
    if (top === undefined || event.hitBreakpoints[0] !== this.#breakpoints.get(site)?.id || top.functionName !== target.name ||
        top.location.scriptId !== this.#scriptId || top.location.lineNumber !== target.lineNumber || top.location.columnNumber !== target.columnNumber) {
      throw fail("PAUSE_LOCATION");
    }
    if (site === "channel") {
      this.#identities.channelBus = await this.#object(top.callFrameId, "this");
      this.#identities.channel = await this.#object(top.callFrameId, "this.bc");
      const arrow = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"),
        description: z.literal("s=>{this.onMessage(s.data)}"), objectId: token }).strict() }).strict().parse(await this.#select(top.callFrameId, "this.bc.onmessage"));
      // oxlint-disable-next-line unicorn/prefer-add-event-listener -- This records an identity string, not a live event-handler assignment.
      this.#identities.onmessage = arrow.result.objectId;
    } else if (site === "base" || site === "project") {
      await this.#receiver(top.callFrameId);
      if (site === "base" && this.#profile === "private.current-pcb209-worker-construction.v1") {
        const project = this.#identities.project;
        if (project === undefined) { throw fail("MISSING_OWNER"); }
        this.#footprintCacheFactory = objectReply.parse(await this.#assignmentCall(project,
          CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.capture.program, [], false)).result.objectId;
      }
      if (site === "project" && this.#profile === "private.current-pcb209-worker-construction.v1") {
        const project = this.#identities.project;
        if (project === undefined) { throw fail("MISSING_OWNER"); }
        this.#footprintConstructors = await this.#object(top.callFrameId, CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION);
        this.#footprintManager = objectReply.parse(await this.#assignmentCall(project,
          CURRENT_FOOTPRINT_COPY_STATE_CALLS["manager-select"].program, [], false)).result.objectId;
        this.#footprintConsistency = objectReply.parse(await this.#assignmentCall(project,
          CURRENT_FOOTPRINT_COPY_STATE_CALLS["consistency-select"].program, [], false)).result.objectId;
      }
    }
    else if (site === "bootstrap") {
      const bus = this.#identities.channelBus, original = this.#identities.project;
      if (original === undefined || bus === undefined) { throw fail("MISSING_OWNER"); }
      await this.#same(original, bus, true);
    } else {
      const caller = event.callFrames[1], expected = site === "upload" ? this.#sites.base : this.#sites.project;
      const startColumn = expected.columnNumber - (expected.offset - expected.start);
      if (caller === undefined || caller.functionName !== expected.name || caller.location.scriptId !== this.#scriptId ||
          caller.location.lineNumber !== expected.lineNumber || caller.location.columnNumber < startColumn ||
          caller.location.columnNumber > expected.columnNumber) { throw fail("CONSTRUCTING_CALLER"); }
      await this.#receiver(caller.callFrameId);
      if (site === "upload") { this.#identities.upload = await this.#arrow(top.callFrameId, "t", "upload"); }
      else if (site === "cooperation") { this.#identities.cooperation = await this.#arrow(top.callFrameId, "e", "cooperation"); }
      else if (site === "debounce") { this.#identities.structure = await this.#arrow(top.callFrameId, "e", "structure"); }
      else if (index === 4) { this.#identities.uploadStructure = await this.#arrow(top.callFrameId, "e", "uploadStructure"); }
      else { this.#identities.structureDebounce = this.#decoders.producerFunction(await this.#select(top.callFrameId, "e"), "debounce"); }
    }
  }
  async #removeBreakpoints(): Promise<void> {
    const removals: Promise<void>[] = [];
    for (const breakpoint of this.#breakpoints.values()) {
      breakpoint.removal ??= (async (): Promise<void> => {
        const reply = await bounded(this.#sendOriginal({ method: "Debugger.removeBreakpoint", params: { breakpointId: breakpoint.id } }));
        emptyReply.parse(captureCurrentPcbStringClockReply(reply).value); breakpoint.removed = true;
      })();
      removals.push(breakpoint.removal);
    }
    const results = await Promise.allSettled(removals);
    const failures = results.flatMap(result => result.status === "rejected" ? [result.reason as unknown] : []);
    if (failures.length > 0) { throw new AggregateError(failures, "PCB_WORKER_CONSTRUCTION_BREAKPOINT_CLEANUP"); }
  }
  async #arm(site: CurrentPcbWorkerConstructionSite): Promise<void> {
    this.#step = `arm-${site}-owner-before`; await this.#current();
    const target = this.#sites[site];
    const point = { scriptId: this.#scriptId, lineNumber: target.lineNumber, columnNumber: target.columnNumber };
    this.#uncertainBreakpoint = true;
    this.#step = `arm-${site}-request`;
    const pending = (async (): Promise<void> => {
      const raw = await this.#sendOriginal({ method: "Debugger.setBreakpoint", params: { location: point } });
      const result = z.object({ breakpointId: token, actualLocation: location }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
      // Retain before any owner check, including a late reply after the deadline.
      this.#breakpoints.set(site, { id: result.breakpointId, removal: null, removed: false }); this.#uncertainBreakpoint = false;
      if (this.#failed !== null) { void observeRejection(this.#removeBreakpoints()); }
      if (JSON.stringify(result.actualLocation) !== JSON.stringify(point)) { throw fail("BREAKPOINT_RELOCATED"); }
    })();
    await bounded(pending);
    this.#step = `arm-${site}-owner-after`; await this.#current();
  }
  public async capture(): Promise<ConstructionPacket<P>> {
    if (this.#consumed) { throw fail("CONSUMED"); } this.#consumed = true;
    try {
      this.#step = "arming-initial-owner";
      if (this.#profile === "private.current-pcb209-worker-construction.v1") {
        const limitMs = CURRENT_PCB_209_STARTUP_TIMING.constructionArmMs;
        this.#armingWindow = Object.freeze({ startedAtMs: currentPcbStartupMonotonicMs(), limitMs });
        this.#armingWatchdog = setTimeout(() => {
          this.#fail("ARMING_DEADLINE"); this.#ready.reject(this.#failed);
        }, limitMs);
      }
      await this.#current();
      this.#unsubscribe = this.#subscribe.call(this.#transport, { paused: this.#onPaused, resumed: this.#onResumed, lost: this.#onLost });
      for (const site of new Set(CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE)) {
        await this.#arm(site);
      }
      this.#checkWindow(); clearTimeout(this.#armingWatchdog); this.#armingWindow = null;
      this.#step = "waiting-construction-pause"; this.#ready.resolve(null);
      for (let index = 0; index < CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE.length; index += 1) {
        const paused = await bounded(this.#waiting.promise, WAIT_MS); this.#waiting = Promise.withResolvers<RetainedPause>();
        void observeRejection(this.#waiting.promise);
        this.#step = "pause-owner"; await this.#current();
        this.#step = "pause-snapshot"; await this.#capturePause(paused, index);
        if (index === CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE.length - 1) { this.#step = "final-breakpoint-removal"; await this.#removeBreakpoints(); }
        this.#step = "pause-resume"; await this.#resume(paused);
        this.#step = "waiting-construction-pause";
      }
      await this.#removeBreakpoints(); await this.#current();
      if (Object.keys(this.#identities).length !== 9) { throw fail("MISSING_IDENTITY"); }
      const packet: ConstructionPacket<P> = Object.freeze({ profile: this.#profile, pauses: 9,
        originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true,
        channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
        nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false });
      this.#packet = packet; issued.set(packet, this); return packet;
    } catch (error) {
      this.#fail("FAILED"); clearTimeout(this.#armingWatchdog); this.#ready.reject(error); const errors: unknown[] = [error];
      try { await this.#removeBreakpoints(); } catch (cleanupError) { errors.push(cleanupError); }
      if (this.#pause !== null && !this.#pause.resumeObserved) { try { await this.#resume(this.#pause, "cleanup"); } catch (cleanupError) { errors.push(cleanupError); } }
      throw errors.length === 1 ? error : new AggregateError(errors, "PCB_WORKER_CONSTRUCTION_FAILED", { cause: error });
    } finally { clearTimeout(this.#armingWatchdog); this.#armingWindow = null; this.#settled = true; }
  }
  public async requireOriginal(packet: ConstructionPacket<P>): Promise<Readonly<CurrentPcbWorkerConstructionIdentities>> {
    if (packet !== this.#packet || issued.get(packet) !== this) { throw fail("ORIGINAL_PACKET"); }
    await this.#current();
    return Object.freeze(z.object({ project: token, channelBus: token, channel: token, onmessage: token,
      upload: token, cooperation: token, uploadStructure: token, structure: token, structureDebounce: token }).strict().parse(this.#identities));
  }
  #assignmentCall(objectId: string, functionDeclaration: string, args: readonly string[], returnByValue = true, retained?: unknown[],
    assignmentStep?: string): Promise<unknown> {
    return this.#request({ method: "Runtime.callFunctionOn", params: { objectId, functionDeclaration,
      arguments: args.map(value => ({ objectId: value })), objectGroup: GROUP, silent: true, returnByValue,
      generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } }, retained, assignmentStep);
  }
  /** Same original PROJECT receiver and bus, not a title-derived association.
   * The opener separately compares these fields with its checkpoint target. */
  public async proveProjectIdentity(packet: ConstructionPacket<P>): Promise<CurrentPcbWorkerConstructionProjectIdentity> {
    const original = await this.requireOriginal(packet);
    if (this.#projectIdentityConsumed) { throw fail("PROJECT_IDENTITY_CONSUMED"); } this.#projectIdentityConsumed = true;
    try {
      const reply = await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, [original.channelBus]);
      const observed = Object.freeze(projectIdentityReply.parse(reply).result.value);
      await this.requireOriginal(packet); this.#projectIdentity = observed; return observed;
    } catch (error) { this.#fail("PROJECT_IDENTITY_FAILED"); throw error; }
  }
  public async requireProjectIdentity(packet: ConstructionPacket<P>, identity: CurrentPcbWorkerConstructionProjectIdentity): Promise<void> {
    if (identity !== this.#projectIdentity || this.#projectIdentity === null) { throw fail("ORIGINAL_PROJECT_IDENTITY"); }
    const original = await this.requireOriginal(packet);
    try {
      const reply = await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, [original.channelBus]);
      const observed = projectIdentityReply.parse(reply).result.value;
      if (observed.projectUuid !== identity.projectUuid || observed.branchUuid !== identity.branchUuid || observed.windowTabId !== identity.windowTabId) {
        throw fail("PROJECT_IDENTITY_CHANGED");
      }
      await this.requireOriginal(packet);
    } catch (error) { this.#fail("PROJECT_IDENTITY_CHANGED"); throw error; }
  }
  async #assignmentScopes(original: string, kind: CurrentPcb209WorkerProducerKind,
    field: CurrentPcbWorkerConstructionAssignment | "debounce"): Promise<readonly string[]> {
    const list = this.#decoders.producerScopeList(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: original, ownProperties: true, generatePreview: false } }, undefined, `${field}-function-metadata`), this.#scriptId, kind);
    return this.#decoders.producerScopes(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: list, ownProperties: true, generatePreview: false } }, undefined, `${field}-scope-list`), kind);
  }
  async #assignmentRecheck(original: Readonly<CurrentPcbWorkerConstructionIdentities>,
    wrappers: Readonly<Record<CurrentPcbWorkerConstructionAssignment, string>>, assignmentStep?: string): Promise<void> {
    resultBoolean.parse(await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK,
      [original.channelBus, wrappers.uploadStructure, wrappers.structure, wrappers.cooperation, wrappers.upload], true, undefined, assignmentStep));
  }
  /** This original-event continuation is not a supplied-data projection. Every
   * callback argument comes from the retained constructor pauses. Current
   * wrappers are independently source/location-qualified in the same worker.
   * It neither observes continuous ownership nor admits a pending writer. */
  public async proveCurrentAssignments(packet: ConstructionPacket<P>): Promise<CurrentPcbWorkerConstructionAssignments> {
    const original = await this.requireOriginal(packet);
    if (this.#assignmentConsumed) { throw fail("ASSIGNMENTS_CONSUMED"); } this.#assignmentConsumed = true;
    try {
      const wrappers: Partial<Record<CurrentPcbWorkerConstructionAssignment, string>> = {};
      for (const field of ["uploadStructure", "structure", "cooperation", "upload"] as const) {
        const kind = field === "uploadStructure" || field === "structure" ? "serial" : field;
        const wrapper = this.#decoders.producerFunction(await this.#assignmentCall(original.project,
          CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS[field], [], false, undefined, `${field}-select`), kind);
        const scopes = await this.#assignmentScopes(wrapper, kind, field);
        const scope = scopes[0];
        if (scope === undefined) { throw fail("ASSIGNMENT_SCOPE"); }
        const callback = field === "structure" ? original.structureDebounce : original[field];
        resultBoolean.parse(await this.#assignmentCall(scope, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS[field],
          [original.project, wrapper, callback], true, undefined, `${field}-relation`));
        if (field === "structure") {
          const debounceScopes = await this.#assignmentScopes(original.structureDebounce, "debounce", "debounce"), parameters = debounceScopes[1];
          if (parameters === undefined) { throw fail("ASSIGNMENT_SCOPE"); }
          resultBoolean.parse(await this.#assignmentCall(parameters, CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION,
            [original.project, wrapper, scope, original.structureDebounce, original.structure], true, undefined, "debounce-relation"));
        }
        wrappers[field] = wrapper;
      }
      const complete = Object.freeze(z.object({ uploadStructure: token, structure: token, cooperation: token, upload: token }).strict().parse(wrappers));
      await this.#assignmentRecheck(original, complete, "assignments-recheck");
      const observation: CurrentPcbWorkerConstructionAssignments = Object.freeze({
        profile: "private.current-pcb-worker-construction-assignments.v1",
        callbackKinds: Object.freeze(["uploadStructure", "structure", "cooperation", "upload"] as const), originalConstructionCallbacksMatched: true,
        originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true,
        continuousAssignmentOwnershipVerified: false, nativeChannelIntrinsicAndPeerOwnershipVerified: false,
        completePublishersVerified: false, writeDestinationsContained: false, atomicSnapshotVerified: false,
        queueCompletionVerified: false, executionAuthorized: false,
      });
      this.#assignedWrappers = complete; this.#assignments = observation; assignmentsIssued.set(observation, this); return observation;
    } catch (error) { this.#fail("ASSIGNMENTS_FAILED"); throw error; }
  }
  /** Reprove current PROJECT and all four field assignments, not only that a
   * historical report once existed. Constant callback bindings were qualified
   * from the pinned wrapper source in proveCurrentAssignments. */
  public async requireCurrentAssignments(packet: ConstructionPacket<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<void> {
    if (assignments !== this.#assignments || assignmentsIssued.get(assignments) !== this || this.#assignedWrappers === null) {
      throw fail("ORIGINAL_ASSIGNMENTS");
    }
    const original = await this.requireOriginal(packet);
    try { await this.#assignmentRecheck(original, this.#assignedWrappers); }
    catch (error) { this.#fail("ASSIGNMENTS_CHANGED"); throw error; }
  }
  public retainedFootprintState(): Readonly<Record<string, unknown>> {
    return Object.freeze({ attempted: this.#footprintAttempted, completed: this.#footprintPacket !== null,
      replies: Object.freeze([...this.#footprintReplies]), methodBindingAttempted: this.#footprintMethodsAttempted,
      methodBindingCompleted: this.#footprintMethodScopes !== null, producerBindingVerified: false,
      originalCacheFactoryCaptured: this.#footprintCacheFactory !== null, cacheFactorySourceQualified: this.#footprintCacheFactoryQualified,
      methodReplies: Object.freeze([...this.#footprintMethodReplies]) });
  }
  /** Retain five original vendor methods and nine native cache/stream functions
   * without invoking them. This qualifies the separate owned source reader. */
  public async proveFootprintMethods(packet: ConstructionPacket<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket): Promise<void> {
    if (state !== this.#footprintPacket || this.#footprintMethodsAttempted) { throw fail("FOOTPRINT_METHODS_CONSUMED"); }
    this.#footprintMethodsAttempted = true;
    try {
      await this.requireFootprintState(packet, assignments, state);
      if (this.#footprintManager === null || this.#footprintConsistency === null || this.#footprintConstructors === null) { throw fail("FOOTPRINT_OWNER"); }
      const original = await this.requireOriginal(packet);
      const capture = await this.#assignmentCall(original.project, CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-capture"].program,
        [original.channelBus, this.#footprintManager, this.#footprintConsistency, this.#footprintConstructors], false, this.#footprintMethodReplies);
      const bundle = objectReply.parse(capture).result.objectId;
      const arrayReply = await this.#request({ method: "Runtime.getProperties", params: { objectId: bundle, ownProperties: true, generatePreview: false } }, this.#footprintMethodReplies);
      const ids = decodeCurrentFootprintCopyCacheMethodArray(arrayReply), scopes: string[] = [];
      for (const [index, objectId] of ids.entries()) {
        const reply = await this.#request({ method: "Runtime.getProperties", params: { objectId, ownProperties: true, generatePreview: false } }, this.#footprintMethodReplies);
        if (index < 5) { scopes.push(decodeCurrentFootprintCopyMethodProperties(reply, this.#scriptId, index).scopesId); }
        else { decodeCurrentFootprintCopyNativeMethodProperties(reply, index - 5); }
      }
      if (this.#footprintCacheFactory === null) { throw fail("FOOTPRINT_CACHE_FACTORY"); }
      const factoryReply = await this.#request({ method: "Runtime.getProperties", params: {
        objectId: this.#footprintCacheFactory, ownProperties: true, generatePreview: false } }, this.#footprintMethodReplies);
      const factory = decodeCurrentFootprintCopyCacheFactoryArray(factoryReply);
      for (const [index, objectId] of [factory.setterId, factory.factoryId].entries()) {
        const reply = await this.#request({ method: "Runtime.getProperties", params: { objectId, ownProperties: true, generatePreview: false } }, this.#footprintMethodReplies);
        decodeCurrentFootprintCopyCacheFactoryProperties(reply, this.#scriptId, index);
      }
      this.#footprintCacheFactoryQualified = true;
      this.#footprintMethods = bundle; this.#footprintMethodScopes = Object.freeze(scopes);
      await this.requireFootprintState(packet, assignments, state);
    } catch (error) { this.#fail("FOOTPRINT_METHODS_FAILED"); throw error; }
  }
  async #requireFootprintMethods(original: Readonly<CurrentPcbWorkerConstructionIdentities>): Promise<void> {
    if (this.#footprintMethods === null) { return; }
    if (this.#footprintManager === null || this.#footprintConsistency === null || this.#footprintConstructors === null || this.#footprintMethodScopes === null) { throw fail("FOOTPRINT_OWNER"); }
    resultBoolean.parse(await this.#assignmentCall(original.project, CURRENT_FOOTPRINT_COPY_METHOD_CALLS["cache-recheck"].program,
      [original.channelBus, this.#footprintManager, this.#footprintConsistency, this.#footprintConstructors, this.#footprintMethods]));
    if (this.#footprintCacheFactory === null || !this.#footprintCacheFactoryQualified) { throw fail("FOOTPRINT_CACHE_FACTORY"); }
    resultBoolean.parse(await this.#assignmentCall(original.project, CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS.recheck.program,
      [original.channelBus, this.#footprintCacheFactory]));
  }
  async #footprintSample(packet: ConstructionPacket<P>, assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentFootprintCopyStateSample> {
    if (this.#profile !== "private.current-pcb209-worker-construction.v1" || this.#footprintManager === null ||
        this.#footprintConsistency === null || this.#footprintConstructors === null || this.#projectIdentity === null || this.#footprintReplies.length >= 16) { throw fail("FOOTPRINT_OWNER"); }
    await this.requireCurrentAssignments(packet, assignments);
    const original = await this.requireOriginal(packet);
    await this.#requireFootprintMethods(original);
    await this.#current();
    const args = [original.channelBus, this.#footprintManager, this.#footprintConsistency, this.#footprintConstructors].map(objectId => ({ objectId }));
    const reply = captureCurrentPcbStringClockReply(await bounded(this.#sendOriginal({ method: "Runtime.callFunctionOn", params: {
      objectId: original.project, functionDeclaration: CURRENT_FOOTPRINT_COPY_STATE_CALLS.observe.program,
      arguments: args,
      objectGroup: GROUP, silent: true, returnByValue: true, generatePreview: false,
      throwOnSideEffect: true, awaitPromise: false, userGesture: false,
    } }))).value;
    // Preserve the inert native reply before a later owner or decoder refusal.
    this.#footprintReplies.push(reply); await this.#current();
    const sample = decodeCurrentFootprintCopyState(reply);
    if (sample.identity.projectUuid !== this.#projectIdentity.projectUuid || sample.identity.branchUuid !== this.#projectIdentity.branchUuid ||
        sample.identity.windowTabId !== this.#projectIdentity.windowTabId) { throw fail("FOOTPRINT_IDENTITY"); }
    await this.requireCurrentAssignments(packet, assignments); return sample;
  }
  /** Current209 only: two synchronous observations of the constructor-captured
   * manager, consistency object and their own client/user/ticket data fields. */
  public async observeFootprintState(packet: ConstructionPacket<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentFootprintCopyStatePacket> {
    if (this.#footprintAttempted) { throw fail("FOOTPRINT_CONSUMED"); } this.#footprintAttempted = true;
    try {
      const first = await this.#footprintSample(packet, assignments), second = await this.#footprintSample(packet, assignments);
      if (JSON.stringify(first) !== JSON.stringify(second)) { throw fail("FOOTPRINT_CHANGED"); }
      const state: CurrentFootprintCopyStatePacket = Object.freeze({ profile: "private.current-footprint-copy-state.v1",
        identity: first.identity, client: first.client, maximumTicket: first.maximumTicket, capturedUser: first.capturedUser,
        samples: 2, originalConstructorManagerMatched: true, atomicSnapshotVerified: false, cacheBranchObserved: false,
        executionAuthorized: false, persistenceVerified: false });
      this.#footprintPacket = state; return state;
    } catch (error) { this.#fail("FOOTPRINT_OBSERVATION_FAILED"); throw error; }
  }
  public async requireFootprintState(packet: ConstructionPacket<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket): Promise<void> {
    if (state !== this.#footprintPacket || this.#footprintPacket === null) { throw fail("ORIGINAL_FOOTPRINT_PACKET"); }
    try {
      const sample = await this.#footprintSample(packet, assignments);
      if (sample.client !== state.client || sample.maximumTicket !== state.maximumTicket ||
          JSON.stringify(sample.identity) !== JSON.stringify(state.identity)) { throw fail("FOOTPRINT_CHANGED"); }
    } catch (error) { this.#fail("FOOTPRINT_STATE_CHANGED"); throw error; }
  }
  public retainedFootprintSource(): Readonly<Record<string, unknown>> | null {
    return this.#footprintSourceAttempted ? Object.freeze({ attempted: true, completed: this.#footprintSourcePacket !== null,
      status: this.#footprintSourceRunner?.status() ?? null, replies: this.#footprintSourceRunner?.retainedReplies() ?? [],
      originalSourceReplies: Object.freeze([...this.#footprintSourceReplies]), firstRejectedSourceReply: this.#footprintSourceCapture.firstRejected(),
      methodObservation: this.retainedFootprintState() }) : null;
  }
  /** Exactly61 worker requests after the already published state observation.
   * The lifecycle reserves the shared parent/worker budget before its intent.
   * Native source replies are retained before any awaited owner reproof. */
  public async observeFootprintSource(packet: ConstructionPacket<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, plan: CurrentFootprintSourcePlan): Promise<CurrentFootprintSourceReadPacket> {
    if (this.#footprintSourceAttempted || state !== this.#footprintPacket || this.#profile !== "private.current-pcb209-worker-construction.v1") { throw fail("FOOTPRINT_SOURCE_CONSUMED"); }
    this.#footprintSourceAttempted = true; this.#footprintSourcePlan = plan;
    try {
      await this.proveFootprintMethods(packet, assignments, state);
      const runner = new CurrentFootprintSourceReadRunner(Object.freeze({
        assertOriginalState: async (selected: CurrentFootprintCopyStatePacket): Promise<void> => {
          if (selected !== state || state !== this.#footprintPacket || assignments !== this.#assignments || this.#footprintSourcePlan !== plan) { throw fail("ORIGINAL_FOOTPRINT_SOURCE_STATE"); }
          await this.requireOriginal(packet);
        },
        observeState: async (): Promise<unknown> => {
          await this.#footprintSample(packet, assignments);
          const raw = this.#footprintReplies.at(-1);
          if (raw === undefined) { throw fail("FOOTPRINT_SOURCE_STATE_REPLY"); } return raw;
        },
        readSource: async (selected: CurrentFootprintCopySourceReadRequest): Promise<unknown> => {
          await this.requireCurrentAssignments(packet, assignments);
          const original = await this.requireOriginal(packet); await this.#requireFootprintMethods(original);
          if (this.#footprintManager === null || this.#footprintConsistency === null || this.#footprintConstructors === null || this.#footprintMethods === null) { throw fail("FOOTPRINT_OWNER"); }
          const command = currentFootprintCopySourceCommand({ project: original.project, bus: original.channelBus,
            manager: this.#footprintManager, consistency: this.#footprintConsistency,
            constructors: this.#footprintConstructors, methods: this.#footprintMethods }, selected);
          const raw = this.#footprintSourceCapture.capture(await bounded(this.#sendOriginal(command), CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.hostTimeoutMs));
          this.#footprintSourceReplies.push(raw); await this.#current();
          await this.requireCurrentAssignments(packet, assignments); await this.#requireFootprintMethods(original); return raw;
        },
      }), state, plan);
      this.#footprintSourceRunner = runner;
      const source = await runner.observe(); this.#footprintSourcePacket = source; return source;
    } catch (error) { this.#fail("FOOTPRINT_SOURCE_FAILED"); throw error; }
  }
  public async requireFootprintSource(packet: ConstructionPacket<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, plan: CurrentFootprintSourcePlan, source: CurrentFootprintSourceReadPacket): Promise<void> {
    if (this.#footprintSourceRunner === null || source !== this.#footprintSourcePacket || plan !== this.#footprintSourcePlan ||
      state !== this.#footprintPacket || assignments !== this.#assignments) { throw fail("ORIGINAL_FOOTPRINT_SOURCE_PACKET"); }
    await this.requireOriginal(packet); await this.#footprintSourceRunner.requireOriginal(source);
  }
  /** Two worker samples for the separate four-read startup actor bracket. Each
   * request retains the original constructor PROJECT and bus, not a later
   * global lookup or caller-provided remote handle. Failure consumes the read. */
  public async observeActorClock(packet: ConstructionPacket<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<unknown> {
    if (this.#actorSampleAttempts >= 2 || this.#actorSampleBusy || this.#projectIdentity === null) { throw fail("ACTOR_SAMPLES_CONSUMED"); }
    this.#actorSampleAttempts += 1; this.#actorSampleBusy = true;
    try {
      await this.requireCurrentAssignments(packet, assignments);
      const original = await this.requireOriginal(packet);
      const raw = await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION,
        [original.channelBus]);
      const sample = decodeCurrentPcbWorkerStartupActor(raw);
      if (sample.phase !== "worker" || this.#projectIdentity === null || sample.identity.projectUuid !== this.#projectIdentity.projectUuid ||
          sample.identity.branchUuid !== this.#projectIdentity.branchUuid || sample.identity.windowTabId !== this.#projectIdentity.windowTabId) {
        throw fail("ACTOR_IDENTITY");
      }
      await this.requireCurrentAssignments(packet, assignments); return raw;
    } catch (error) { this.#fail("ACTOR_OBSERVATION_FAILED"); throw error; }
    finally { this.#actorSampleBusy = false; }
  }
  /** Original private handles are closed over here. The leaf only selects
   * metadata handles returned by these fixed programs, never another PROJECT,
   * worker bus, channel, callback, worker session or execution context. */
  #channelRequest(original: Readonly<CurrentPcbWorkerConstructionIdentities>,
    command: CurrentPcbWorkerStartupChannelObservationCommand): Promise<unknown> {
    switch (command.phase) {
      case "channel-relation": {
        return this.#assignmentCall(original.project, CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS["channel-relation"].program,
          [original.channelBus, original.channel, original.onmessage]);
      }
      case "gate-select": { return this.#assignmentCall(original.project, CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS["gate-select"].program, [], false); }
      case "properties": {
        return this.#request({ method: "Runtime.getProperties", params: { objectId: command.objectId, ownProperties: true, generatePreview: false } });
      }
      case "gates": { return this.#assignmentCall(original.project, CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS.gates.program, [command.bundle, command.scope]); }
      default: { throw fail("CHANNEL_PHASE"); }
    }
  }
  public retainedChannelObservation(): Readonly<Record<string, unknown>> | null {
    return this.#channel === null ? null : Object.freeze({ status: this.#channel.status(), gateReplies: this.#channel.retainedGateReplies() });
  }
  /** Full wrapper association is checked on both sides of this consumed stage.
   * Each internal await rechecks the same worker/source owner. Samples cannot
   * establish continuous assignment, native peers or destination containment. */
  public async observeCurrentChannel(packet: ConstructionPacket<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentPcbWorkerStartupChannelPacket> {
    if (this.#channelAttempted || this.#projectIdentity === null) { throw fail("CHANNEL_CONSUMED"); }
    this.#channelAttempted = true;
    try {
      await this.requireCurrentAssignments(packet, assignments);
      const original = await this.requireOriginal(packet);
      const Runner = this.#profile === "private.current-pcb209-worker-construction.v1"
        ? CurrentPcb209WorkerStartupChannelObservationRunner : CurrentPcbWorkerStartupChannelObservationRunner;
      const channel = new Runner(Object.freeze({ scriptId: this.#scriptId,
        request: (command: CurrentPcbWorkerStartupChannelObservationCommand): Promise<unknown> => this.#channelRequest(original, command),
        assertCurrent: (): Promise<void> => this.#current(),
      }), this.#projectIdentity);
      this.#channel = channel;
      const observation = await channel.observe(); this.#channelPacket = observation;
      await this.requireCurrentAssignments(packet, assignments); return observation;
    } catch (error) { this.#fail("CHANNEL_OBSERVATION_FAILED"); throw error; }
  }
  public async requireCurrentChannel(packet: ConstructionPacket<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, channelPacket: CurrentPcbWorkerStartupChannelPacket): Promise<void> {
    if (channelPacket !== this.#channelPacket || this.#channel === null) { throw fail("ORIGINAL_CHANNEL_PACKET"); }
    try {
      await this.requireCurrentAssignments(packet, assignments);
      const original = await this.requireOriginal(packet);
      resultBoolean.parse(await this.#channelRequest(original, { phase: "channel-relation" }));
      await this.#channel.requireOriginal(channelPacket); await this.#current();
    } catch (error) { this.#fail("CHANNEL_OBSERVATION_CHANGED"); throw error; }
  }
  public async release(): Promise<void> {
    if (this.#releaseConsumed) { throw fail("RELEASE_CONSUMED"); }
    if (!this.#settled || this.#uncertainBreakpoint) { throw fail("RETAIN_PENDING_OWNER"); }
    if (this.#pause !== null && !this.#pause.resumeObserved) { throw fail("RETAIN_PAUSED_OWNER"); }
    this.#releaseConsumed = true;
    try {
      await this.#removeBreakpoints(); await this.#settleLatePause();
      const reply = await bounded(this.#sendOriginal({ method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }));
      emptyReply.parse(captureCurrentPcbStringClockReply(reply).value); await this.#settleLatePause();
    } catch (error) {
      try { await this.#settleLatePause(); }
      catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB_WORKER_CONSTRUCTION_RELEASE_FAILED", { cause: cleanupError }); }
      throw error;
    }
    // This check must be synchronous: a new event can arrive while the final
    // Awaited cleanup helper resolves, before this continuation runs.
    if (this.#uncertainBreakpoint || this.#pause !== null && !this.#pause.resumeObserved) { throw fail("RETAIN_PAUSED_OWNER"); }
    this.#released = true;
    this.#unsubscribe?.(); this.#unsubscribe = null;
  }
  async #settleLatePause(): Promise<void> {
    const paused = this.#pause;
    if (paused !== null && !paused.resumeObserved) { await this.#cleanupPause(paused); }
    // A second pause while cleaning up is not a reason to detach the owner.
    if (this.#pause !== paused || paused !== null && !paused.resumeObserved) { throw fail("RETAIN_PAUSED_OWNER"); }
  }
}

/** Fixed legacy construction API. Its source, locations and decoders remain
 * unchanged; the implementation core is private and cannot accept an override. */
export class CurrentPcbWorkerConstructionRunner extends CurrentPcbWorkerConstructionCore<"private.current-pcb-worker-construction.v1"> {
  public constructor(transport: CurrentPcbWorkerConstructionTransport) {
    super(INTERNAL_PROFILE, transport, "private.current-pcb-worker-construction.v1", CURRENT_PCB_WORKER_CONSTRUCTION_SITES, {
      callbackFunction: decodeCurrentPcbStringProducerCallbackFunction, callbackScopeList: decodeCurrentPcbStringProducerCallbackScopeList,
      producerFunction: decodeCurrentPcbStringProducerFunction, producerScopeList: decodeCurrentPcbStringProducerScopeList,
      producerScopes: decodeCurrentPcbStringProducerScopes,
    });
  }
}
/** Generation209 uses actual209 debugger locations and original owner events.
 * No location rewriting, supplied-proof adoption or native transport is added. */
export class CurrentPcb209WorkerConstructionRunner extends CurrentPcbWorkerConstructionCore<"private.current-pcb209-worker-construction.v1"> {
  public constructor(transport: CurrentPcbWorkerConstructionTransport) {
    super(INTERNAL_PROFILE, transport, "private.current-pcb209-worker-construction.v1", CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES, {
      callbackFunction: decodeCurrentPcb209WorkerCallbackFunction, callbackScopeList: decodeCurrentPcb209WorkerCallbackScopeList,
      producerFunction: decodeCurrentPcb209WorkerProducerFunction, producerScopeList: decodeCurrentPcb209WorkerProducerScopeList,
      producerScopes: decodeCurrentPcb209WorkerProducerScopes,
    });
  }
}
