/** Dormant original-event capture. No native transport, startup registration,
 * peer exclusion, create/Save or writer permit is implemented by this class. */
import { z } from "zod";
import { types } from "node:util";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcbStringProducerCallbackFunction, decodeCurrentPcbStringProducerCallbackScopeList } from "./current-pcb-string-producer-callback-scope.ts";
import type { CurrentPcbStringProducerCallbackKind } from "./current-pcb-string-producer-callback-scope.ts";
import { decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "./current-pcb-string-producer-scope.ts";
import type { CurrentPcbStringProducerKind } from "./current-pcb-string-producer-scope.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS,
  CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS, CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerConstructionAssignment, CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE, CURRENT_PCB_WORKER_CONSTRUCTION_SITES,
  CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerConstructionCommand, CurrentPcbWorkerConstructionExpression,
  CurrentPcbWorkerConstructionSite, CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION,
  decodeCurrentPcbWorkerStartupActor } from "./current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS } from "./current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupChannelObservationCommand,
  CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import { CurrentPcbWorkerStartupChannelObservationRunner } from "./current-pcb-worker-startup-channel-observation-runner.ts";

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
const PAUSE_MS = 5000, REQUEST_MS = 2000, WAIT_MS = 15_000;
interface RetainedPause {
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
export interface CurrentPcbWorkerConstructionPacket {
  readonly profile: "private.current-pcb-worker-construction.v1";
  readonly pauses: 9;
  readonly originalConstructorAndFactoryEventsRetained: true;
  readonly originalProjectReceiverMatched: true;
  readonly channelNativeIntrinsicAndPeerOwnershipVerified: false;
  readonly wrapperAssignmentRelationVerified: false;
  readonly nativeStartupIntegrationVerified: false;
  readonly writeDestinationsContained: false;
  readonly executionAuthorized: false;
}
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
const issued = new WeakMap<CurrentPcbWorkerConstructionPacket, CurrentPcbWorkerConstructionRunner>();
const assignmentsIssued = new WeakMap<CurrentPcbWorkerConstructionAssignments, CurrentPcbWorkerConstructionRunner>();
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

export class CurrentPcbWorkerConstructionRunner {
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
  #released = false;
  #releaseConsumed = false;
  #packet: CurrentPcbWorkerConstructionPacket | null = null;
  #assignmentConsumed = false;
  #assignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #assignedWrappers: Readonly<Record<CurrentPcbWorkerConstructionAssignment, string>> | null = null;
  #projectIdentityConsumed = false;
  #projectIdentity: CurrentPcbWorkerConstructionProjectIdentity | null = null;
  #actorSampleAttempts = 0;
  #actorSampleBusy = false;
  #channelAttempted = false;
  #channel: CurrentPcbWorkerStartupChannelObservationRunner | null = null;
  #channelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;

  public constructor(transport: CurrentPcbWorkerConstructionTransport) {
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
    resumeObserved: boolean; retainedIdentities: number; released: boolean; unresolvedBreakpoints: boolean }> {
    return Object.freeze({ consumed: this.#consumed, failed: this.#failed !== null,
      paused: this.#pause !== null && !this.#pause.resumeObserved, resumeAttempted: this.#pause?.resumeConsumed ?? false,
      resumeObserved: this.#pause?.resumeObserved ?? false, retainedIdentities: Object.keys(this.#identities).length, released: this.#released,
      unresolvedBreakpoints: this.#uncertainBreakpoint || [...this.#breakpoints.values()].some(value => !value.removed) });
  }
  #sameTransport(): void {
    const fields = transportMembers(this.#transport);
    if (fields[0] !== this.#scriptId || fields[1] !== this.#assertOwner || fields[2] !== this.#send || fields[3] !== this.#subscribe) { throw fail("TRANSPORT_CHANGED"); }
  }
  async #current(): Promise<void> {
    if (this.#failed !== null || this.#releaseConsumed) { throw this.#failed ?? fail("RELEASED"); }
    try { this.#sameTransport(); await bounded(this.#assertOwner.call(this.#transport)); this.#sameTransport(); }
    catch (error) { this.#failed ??= fail("OWNER_LOST"); throw error; }
    if (this.#failed !== null || this.#releaseConsumed) { throw this.#failed ?? fail("OWNER_CHANGED"); }
  }
  async #request(command: CurrentPcbWorkerConstructionCommand): Promise<unknown> {
    await this.#current();
    const captured = captureCurrentPcbStringClockReply(await bounded(this.#send.call(this.#transport, command)));
    await this.#current(); return captured.value;
  }
  readonly #onPaused = (input: unknown): void => {
    if (this.#pause !== null && !this.#pause.resumeObserved) {
      this.#failed ??= fail("DUPLICATE_PAUSE"); return;
    }
    let captureError: unknown = null, raw: unknown = null;
    try { raw = captureCurrentPcbStringClockReply(input).value; } catch (error) { captureError = error; }
    const paused: RetainedPause = { raw, captureError, resumed: Promise.withResolvers(), resumeConsumed: false,
      resumeObserved: false, resumeResult: null, watchdog: setTimeout(() => {
        this.#failed ??= fail("PAUSE_DEADLINE"); void observeRejection(this.#cleanupPause(paused));
      }, PAUSE_MS) };
    this.#pause = paused; this.#waiting.resolve(paused);
    if (this.#settled) { this.#failed ??= fail("EXTRA_PAUSE"); void observeRejection(this.#cleanupPause(paused)); }
  };
  readonly #onResumed = (): void => {
    const paused = this.#pause;
    if (paused === null || paused.resumeObserved) { this.#failed ??= fail("UNEXPECTED_RESUME"); return; }
    if (!paused.resumeConsumed) { this.#failed ??= fail("UNEXPECTED_RESUME"); }
    paused.resumeObserved = true; clearTimeout(paused.watchdog); paused.resumed.resolve(null);
  };
  readonly #onLost = (): void => { this.#failed ??= fail("OWNER_LOST"); this.#waiting.reject(this.#failed); };
  #resume(paused: RetainedPause): Promise<void> {
    if (paused.resumeResult !== null) { return paused.resumeResult; }
    paused.resumeConsumed = true;
    // Cleanup deliberately bypasses a failed source check, never the original
    // Transport/session binding. A lost reply consumes resume, without retry.
    paused.resumeResult = (async (): Promise<void> => {
      const reply = await bounded(this.#send.call(this.#transport, { method: "Debugger.resume", params: {} }));
      emptyReply.parse(captureCurrentPcbStringClockReply(reply).value);
      await bounded(paused.resumed.promise);
    })();
    return paused.resumeResult;
  }
  async #cleanupPause(paused: RetainedPause): Promise<void> {
    const errors: unknown[] = [];
    try { await this.#removeBreakpoints(); } catch (error) { errors.push(error); }
    if (!paused.resumeObserved) { try { await this.#resume(paused); } catch (error) { errors.push(error); } }
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
    const original = decodeCurrentPcbStringProducerCallbackFunction(await this.#select(callFrameId, expression), kind);
    decodeCurrentPcbStringProducerCallbackScopeList(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: original, ownProperties: true, generatePreview: false } }), this.#scriptId, kind);
    return original;
  }
  async #capturePause(paused: RetainedPause, index: number): Promise<void> {
    if (paused.captureError !== null) { throw new Error("PCB_WORKER_CONSTRUCTION_EVENT_CAPTURE", { cause: paused.captureError }); }
    const event = pauseSchema.parse(paused.raw), site = CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE[index];
    if (site === undefined) { throw fail("EXTRA_PAUSE"); }
    const target = CURRENT_PCB_WORKER_CONSTRUCTION_SITES[site], top = event.callFrames[0];
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
    } else if (site === "base" || site === "project") { await this.#receiver(top.callFrameId); }
    else if (site === "bootstrap") {
      const bus = this.#identities.channelBus, original = this.#identities.project;
      if (original === undefined || bus === undefined) { throw fail("MISSING_OWNER"); }
      await this.#same(original, bus, true);
    } else {
      const caller = event.callFrames[1], expected = site === "upload" ? CURRENT_PCB_WORKER_CONSTRUCTION_SITES.base : CURRENT_PCB_WORKER_CONSTRUCTION_SITES.project;
      const startColumn = expected.columnNumber - (expected.offset - expected.start);
      if (caller === undefined || caller.functionName !== expected.name || caller.location.scriptId !== this.#scriptId ||
          caller.location.lineNumber !== expected.lineNumber || caller.location.columnNumber < startColumn ||
          caller.location.columnNumber > expected.columnNumber) { throw fail("CONSTRUCTING_CALLER"); }
      await this.#receiver(caller.callFrameId);
      if (site === "upload") { this.#identities.upload = await this.#arrow(top.callFrameId, "t", "upload"); }
      else if (site === "cooperation") { this.#identities.cooperation = await this.#arrow(top.callFrameId, "e", "cooperation"); }
      else if (site === "debounce") { this.#identities.structure = await this.#arrow(top.callFrameId, "e", "structure"); }
      else if (index === 4) { this.#identities.uploadStructure = await this.#arrow(top.callFrameId, "e", "uploadStructure"); }
      else { this.#identities.structureDebounce = decodeCurrentPcbStringProducerFunction(await this.#select(top.callFrameId, "e"), "debounce"); }
    }
  }
  async #removeBreakpoints(): Promise<void> {
    const removals: Promise<void>[] = [];
    for (const breakpoint of this.#breakpoints.values()) {
      breakpoint.removal ??= (async (): Promise<void> => {
        const reply = await bounded(this.#send.call(this.#transport, { method: "Debugger.removeBreakpoint", params: { breakpointId: breakpoint.id } }));
        emptyReply.parse(captureCurrentPcbStringClockReply(reply).value); breakpoint.removed = true;
      })();
      removals.push(breakpoint.removal);
    }
    const results = await Promise.allSettled(removals);
    const failures = results.flatMap(result => result.status === "rejected" ? [result.reason as unknown] : []);
    if (failures.length > 0) { throw new AggregateError(failures, "PCB_WORKER_CONSTRUCTION_BREAKPOINT_CLEANUP"); }
  }
  async #arm(site: CurrentPcbWorkerConstructionSite): Promise<void> {
    await this.#current();
    const target = CURRENT_PCB_WORKER_CONSTRUCTION_SITES[site];
    const point = { scriptId: this.#scriptId, lineNumber: target.lineNumber, columnNumber: target.columnNumber };
    this.#uncertainBreakpoint = true;
    const pending = (async (): Promise<void> => {
      const raw = await this.#send.call(this.#transport, { method: "Debugger.setBreakpoint", params: { location: point } });
      const result = z.object({ breakpointId: token, actualLocation: location }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
      // Retain before any owner check, including a late reply after the deadline.
      this.#breakpoints.set(site, { id: result.breakpointId, removal: null, removed: false }); this.#uncertainBreakpoint = false;
      if (this.#failed !== null) { void observeRejection(this.#removeBreakpoints()); }
      if (JSON.stringify(result.actualLocation) !== JSON.stringify(point)) { throw fail("BREAKPOINT_RELOCATED"); }
    })();
    await bounded(pending); await this.#current();
  }
  public async capture(): Promise<CurrentPcbWorkerConstructionPacket> {
    if (this.#consumed) { throw fail("CONSUMED"); } this.#consumed = true;
    try {
      await this.#current();
      this.#unsubscribe = this.#subscribe.call(this.#transport, { paused: this.#onPaused, resumed: this.#onResumed, lost: this.#onLost });
      for (const site of new Set(CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE)) {
        await this.#arm(site);
      }
      this.#ready.resolve(null);
      for (let index = 0; index < CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE.length; index += 1) {
        const paused = await bounded(this.#waiting.promise, WAIT_MS); this.#waiting = Promise.withResolvers<RetainedPause>();
        void observeRejection(this.#waiting.promise);
        await this.#current(); await this.#capturePause(paused, index);
        if (index === CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE.length - 1) { await this.#removeBreakpoints(); }
        await this.#resume(paused);
      }
      await this.#removeBreakpoints(); await this.#current();
      if (Object.keys(this.#identities).length !== 9) { throw fail("MISSING_IDENTITY"); }
      const packet: CurrentPcbWorkerConstructionPacket = Object.freeze({ profile: "private.current-pcb-worker-construction.v1", pauses: 9,
        originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true,
        channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
        nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false });
      this.#packet = packet; issued.set(packet, this); return packet;
    } catch (error) {
      this.#failed ??= fail("FAILED"); this.#ready.reject(error); const errors: unknown[] = [error];
      try { await this.#removeBreakpoints(); } catch (cleanupError) { errors.push(cleanupError); }
      if (this.#pause !== null && !this.#pause.resumeObserved) { try { await this.#resume(this.#pause); } catch (cleanupError) { errors.push(cleanupError); } }
      throw errors.length === 1 ? error : new AggregateError(errors, "PCB_WORKER_CONSTRUCTION_FAILED", { cause: error });
    } finally { this.#settled = true; }
  }
  public async requireOriginal(packet: CurrentPcbWorkerConstructionPacket): Promise<Readonly<CurrentPcbWorkerConstructionIdentities>> {
    if (packet !== this.#packet || issued.get(packet) !== this) { throw fail("ORIGINAL_PACKET"); }
    await this.#current();
    return Object.freeze(z.object({ project: token, channelBus: token, channel: token, onmessage: token,
      upload: token, cooperation: token, uploadStructure: token, structure: token, structureDebounce: token }).strict().parse(this.#identities));
  }
  #assignmentCall(objectId: string, functionDeclaration: string, args: readonly string[], returnByValue = true): Promise<unknown> {
    return this.#request({ method: "Runtime.callFunctionOn", params: { objectId, functionDeclaration,
      arguments: args.map(value => ({ objectId: value })), objectGroup: GROUP, silent: true, returnByValue,
      generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
  }
  /** Same original PROJECT receiver and bus, not a title-derived association.
   * The opener separately compares these fields with its checkpoint target. */
  public async proveProjectIdentity(packet: CurrentPcbWorkerConstructionPacket): Promise<CurrentPcbWorkerConstructionProjectIdentity> {
    const original = await this.requireOriginal(packet);
    if (this.#projectIdentityConsumed) { throw fail("PROJECT_IDENTITY_CONSUMED"); } this.#projectIdentityConsumed = true;
    try {
      const reply = await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, [original.channelBus]);
      const observed = Object.freeze(projectIdentityReply.parse(reply).result.value);
      await this.requireOriginal(packet); this.#projectIdentity = observed; return observed;
    } catch (error) { this.#failed ??= fail("PROJECT_IDENTITY_FAILED"); throw error; }
  }
  public async requireProjectIdentity(packet: CurrentPcbWorkerConstructionPacket, identity: CurrentPcbWorkerConstructionProjectIdentity): Promise<void> {
    if (identity !== this.#projectIdentity || this.#projectIdentity === null) { throw fail("ORIGINAL_PROJECT_IDENTITY"); }
    const original = await this.requireOriginal(packet);
    try {
      const reply = await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, [original.channelBus]);
      const observed = projectIdentityReply.parse(reply).result.value;
      if (observed.projectUuid !== identity.projectUuid || observed.branchUuid !== identity.branchUuid || observed.windowTabId !== identity.windowTabId) {
        throw fail("PROJECT_IDENTITY_CHANGED");
      }
      await this.requireOriginal(packet);
    } catch (error) { this.#failed ??= fail("PROJECT_IDENTITY_CHANGED"); throw error; }
  }
  async #assignmentScopes(original: string, kind: CurrentPcbStringProducerKind): Promise<readonly string[]> {
    const list = decodeCurrentPcbStringProducerScopeList(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: original, ownProperties: true, generatePreview: false } }), this.#scriptId, kind);
    return decodeCurrentPcbStringProducerScopes(await this.#request({ method: "Runtime.getProperties",
      params: { objectId: list, ownProperties: true, generatePreview: false } }), kind);
  }
  async #assignmentRecheck(original: Readonly<CurrentPcbWorkerConstructionIdentities>,
    wrappers: Readonly<Record<CurrentPcbWorkerConstructionAssignment, string>>): Promise<void> {
    resultBoolean.parse(await this.#assignmentCall(original.project, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK,
      [original.channelBus, wrappers.uploadStructure, wrappers.structure, wrappers.cooperation, wrappers.upload]));
  }
  /** This original-event continuation is not a supplied-data projection. Every
   * callback argument comes from the retained constructor pauses. Current
   * wrappers are independently source/location-qualified in the same worker.
   * It neither observes continuous ownership nor admits a pending writer. */
  public async proveCurrentAssignments(packet: CurrentPcbWorkerConstructionPacket): Promise<CurrentPcbWorkerConstructionAssignments> {
    const original = await this.requireOriginal(packet);
    if (this.#assignmentConsumed) { throw fail("ASSIGNMENTS_CONSUMED"); } this.#assignmentConsumed = true;
    try {
      const wrappers: Partial<Record<CurrentPcbWorkerConstructionAssignment, string>> = {};
      for (const field of ["uploadStructure", "structure", "cooperation", "upload"] as const) {
        const kind = field === "uploadStructure" || field === "structure" ? "serial" : field;
        const wrapper = decodeCurrentPcbStringProducerFunction(await this.#assignmentCall(original.project,
          CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_SELECTORS[field], [], false), kind);
        const scopes = await this.#assignmentScopes(wrapper, kind);
        const scope = scopes[0];
        if (scope === undefined) { throw fail("ASSIGNMENT_SCOPE"); }
        const callback = field === "structure" ? original.structureDebounce : original[field];
        resultBoolean.parse(await this.#assignmentCall(scope, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RELATIONS[field],
          [original.project, wrapper, callback]));
        if (field === "structure") {
          const debounceScopes = await this.#assignmentScopes(original.structureDebounce, "debounce"), parameters = debounceScopes[1];
          if (parameters === undefined) { throw fail("ASSIGNMENT_SCOPE"); }
          resultBoolean.parse(await this.#assignmentCall(parameters, CURRENT_PCB_WORKER_CONSTRUCTION_DEBOUNCE_RELATION,
            [original.project, wrapper, scope, original.structureDebounce, original.structure]));
        }
        wrappers[field] = wrapper;
      }
      const complete = Object.freeze(z.object({ uploadStructure: token, structure: token, cooperation: token, upload: token }).strict().parse(wrappers));
      await this.#assignmentRecheck(original, complete);
      const observation: CurrentPcbWorkerConstructionAssignments = Object.freeze({
        profile: "private.current-pcb-worker-construction-assignments.v1",
        callbackKinds: Object.freeze(["uploadStructure", "structure", "cooperation", "upload"] as const), originalConstructionCallbacksMatched: true,
        originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true,
        continuousAssignmentOwnershipVerified: false, nativeChannelIntrinsicAndPeerOwnershipVerified: false,
        completePublishersVerified: false, writeDestinationsContained: false, atomicSnapshotVerified: false,
        queueCompletionVerified: false, executionAuthorized: false,
      });
      this.#assignedWrappers = complete; this.#assignments = observation; assignmentsIssued.set(observation, this); return observation;
    } catch (error) { this.#failed ??= fail("ASSIGNMENTS_FAILED"); throw error; }
  }
  /** Reprove current PROJECT and all four field assignments, not only that a
   * historical report once existed. Constant callback bindings were qualified
   * from the pinned wrapper source in proveCurrentAssignments. */
  public async requireCurrentAssignments(packet: CurrentPcbWorkerConstructionPacket,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<void> {
    if (assignments !== this.#assignments || assignmentsIssued.get(assignments) !== this || this.#assignedWrappers === null) {
      throw fail("ORIGINAL_ASSIGNMENTS");
    }
    const original = await this.requireOriginal(packet);
    try { await this.#assignmentRecheck(original, this.#assignedWrappers); }
    catch (error) { this.#failed ??= fail("ASSIGNMENTS_CHANGED"); throw error; }
  }
  /** Two worker samples for the separate four-read startup actor bracket. Each
   * request retains the original constructor PROJECT and bus, not a later
   * global lookup or caller-provided remote handle. Failure consumes the read. */
  public async observeActorClock(packet: CurrentPcbWorkerConstructionPacket,
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
    } catch (error) { this.#failed ??= fail("ACTOR_OBSERVATION_FAILED"); throw error; }
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
  public async observeCurrentChannel(packet: CurrentPcbWorkerConstructionPacket,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentPcbWorkerStartupChannelPacket> {
    if (this.#channelAttempted || this.#projectIdentity === null) { throw fail("CHANNEL_CONSUMED"); }
    this.#channelAttempted = true;
    try {
      await this.requireCurrentAssignments(packet, assignments);
      const original = await this.requireOriginal(packet);
      const channel = new CurrentPcbWorkerStartupChannelObservationRunner(Object.freeze({ scriptId: this.#scriptId,
        request: (command: CurrentPcbWorkerStartupChannelObservationCommand): Promise<unknown> => this.#channelRequest(original, command),
        assertCurrent: (): Promise<void> => this.#current(),
      }), this.#projectIdentity);
      this.#channel = channel;
      const observation = await channel.observe(); this.#channelPacket = observation;
      await this.requireCurrentAssignments(packet, assignments); return observation;
    } catch (error) { this.#failed ??= fail("CHANNEL_OBSERVATION_FAILED"); throw error; }
  }
  public async requireCurrentChannel(packet: CurrentPcbWorkerConstructionPacket,
    assignments: CurrentPcbWorkerConstructionAssignments, channelPacket: CurrentPcbWorkerStartupChannelPacket): Promise<void> {
    if (channelPacket !== this.#channelPacket || this.#channel === null) { throw fail("ORIGINAL_CHANNEL_PACKET"); }
    try {
      await this.requireCurrentAssignments(packet, assignments);
      const original = await this.requireOriginal(packet);
      resultBoolean.parse(await this.#channelRequest(original, { phase: "channel-relation" }));
      await this.#channel.requireOriginal(channelPacket); await this.#current();
    } catch (error) { this.#failed ??= fail("CHANNEL_OBSERVATION_CHANGED"); throw error; }
  }
  public async release(): Promise<void> {
    if (this.#releaseConsumed) { throw fail("RELEASE_CONSUMED"); }
    if (!this.#settled || this.#uncertainBreakpoint) { throw fail("RETAIN_PENDING_OWNER"); }
    if (this.#pause !== null && !this.#pause.resumeObserved) { throw fail("RETAIN_PAUSED_OWNER"); }
    this.#releaseConsumed = true;
    try {
      await this.#removeBreakpoints(); await this.#settleLatePause();
      const reply = await bounded(this.#send.call(this.#transport, { method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }));
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
