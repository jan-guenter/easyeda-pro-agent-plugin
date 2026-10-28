/* oxlint-disable eslint/max-classes-per-file -- The private core stays with the fixed-generation wrappers; exporting an injectable wire selector would weaken the native boundary. */
/* oxlint-disable import/max-dependencies -- The shared original channel joins fixed legacy,209 and copy-purpose grammars with one reply/event owner. */
/** Private original-native-channel adapter. The eventual retained owner must
 * irreversibly hand off its original parent attachment and request counter.
 * This module neither launches EasyEDA nor accepts a parent receipt as authority. */
import { types } from "node:util";
import { currentFootprintCopyParentWire } from "./current-footprint-copy-parent-wire.ts";
import type { CurrentFootprintParentCommand, CurrentFootprintParentCommandKind } from "./current-footprint-copy-parent-wire.ts";
import { markCurrentFootprintExecutionDependency } from "./current-footprint-copy-execution-purpose.ts";
import { requireCurrentFootprintCopyParentRoute } from "./current-footprint-copy-parent-route.ts";
import process from "node:process";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES } from "./current-footprint-copy-source-command.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, currentFootprintCopyExecutionStartupWire, currentFootprintCopyPreparationWire, currentFootprintCopySavedStartupWire,
  currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { currentFootprintCopyManagerRouteWire } from "./current-footprint-copy-manager-route-wire.ts";
import type { CurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import { currentFootprintCopyUiWire } from "./current-footprint-copy-ui-wire.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { currentFootprintCopySavedQueueWire } from "./current-footprint-copy-saved-queue-wire.ts";
import type { CurrentFootprintCopySavedQueueChannelCommand } from "./current-footprint-copy-saved-queue-wire.ts";
import type { CurrentFootprintCopySavedQueueCommand } from "./current-footprint-copy-saved-queue.ts";
import { currentFootprintCacheConstructionWire } from "./current-footprint-copy-cache-construction-wire.ts";
import type { CurrentFootprintCacheConstructionChannelCommand } from "./current-footprint-copy-cache-construction-wire.ts";
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS } from "./current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "./current-footprint-copy-transaction-clock.ts";
import { currentFootprintCopyTransactionClockWire } from "./current-footprint-copy-transaction-clock-wire.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "./current-pcb-diagnostic-pcb-opening.ts";

export interface CurrentPcbWorkerStartupParent {
  readonly targetId: string;
  readonly sessionId: string;
  readonly nextRequestId: number;
}
type NativeRequest = ReturnType<typeof currentPcbWorkerStartupWire>["request"] | Readonly<{ action: "poll" }>;
export interface CurrentPcbWorkerStartupNativeDependency {
  /** Return the same original immutable object after rechecking the retained
   * parent/process, not a new object reconstructed from an earlier receipt. */
  readonly requireOriginalParent: () => Promise<CurrentPcbWorkerStartupParent>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly observeOriginalParentEvent: (event: CurrentPcbWorkerStartupEvent) => unknown;
  readonly exchange: (request: NativeRequest) => Promise<unknown>;
}
export interface CurrentPcbWorkerStartupPriorUsage {
  readonly receivedBytes: number;
  readonly eventCount: number;
  readonly eventBytes: number;
}
const INTERNAL_PROFILE = Symbol("fixed-worker-startup-channel-wire");
const footprintDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();
const savedDependencies = new WeakSet<CurrentPcbWorkerStartupDependency>();
const executionDependencies = new WeakMap<CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupChannelCore>();
/** This marker is issued only by the separate channel, never by receipt data. */
export function isOriginalFootprintPreparationDependency(dependency: CurrentPcbWorkerStartupDependency): boolean {
  return footprintDependencies.has(dependency);
}
export function isOriginalFootprintSavedDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return savedDependencies.has(dependency); }
export { isOriginalFootprintExecutionDependency } from "./current-footprint-copy-execution-purpose.ts";
export function requestCurrentFootprintCopyTransactionClock(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintCopyTransactionClockCommand & Readonly<{ sessionId: string }>): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_CLOCK_PURPOSE")); }
  return channel.requestFootprintClock(command);
}
export function requestCurrentFootprintCopyCacheConstruction(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintCacheConstructionCommand): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_CACHE_PURPOSE")); }
  return channel.requestFootprintCacheConstruction(command);
}
export function originalCurrentFootprintExecutionProjectUuid(dependency: CurrentPcbWorkerStartupDependency): string {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { throw fail("FOOTPRINT_CACHE_PURPOSE"); }
  return channel.originalExecutionProjectUuid(dependency);
}
export function requestCurrentFootprintCopyParent(dependency: CurrentPcbWorkerStartupDependency,
  command: CurrentFootprintParentCommand, kind: CurrentFootprintParentCommandKind): Promise<unknown> {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { return Promise.reject(fail("FOOTPRINT_PARENT_PURPOSE")); }
  return channel.requestFootprintParent(dependency, command, kind);
}
export function subscribeCurrentFootprintCopyParentEvents(dependency: CurrentPcbWorkerStartupDependency,
  listener: (event: CurrentPcbWorkerStartupEvent) => void, lost: () => void): () => void {
  const channel = executionDependencies.get(dependency);
  if (channel === undefined) { throw fail("FOOTPRINT_PARENT_PURPOSE"); }
  return channel.subscribeFootprintParentEvents(dependency, listener, lost);
}
const token = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u);
const parentSchema = z.object({ targetId: token, sessionId: token,
  nextRequestId: z.number().int().min(1).max(CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) }).strict();
const ackSchema = z.object({ written: z.literal(true) }).strict();
const MAX_BYTES = 64 * 1024 * 1024, MAX_EVENTS = 4096, MAX_EVENT_BYTES = 8 * 1024 * 1024;
const MAX_FRAME = 1024 * 1024, SOURCE_FRAME = 32 * 1024 * 1024;
const ACTIVE_POLL_MS = 20, IDLE_POLL_MS = 250, LIFETIME_MS = 60 * 60 * 1000;
const MAX_DATA_POLLS = 8192, MAX_IDLE_POLLS = LIFETIME_MS / IDLE_POLL_MS, MAX_WAIT_POLLS = 8192;
const monotonicNow = process.hrtime.bigint.bind(process.hrtime);
const failureCodes = new WeakMap<Error, string>();
type ClockCommand = CurrentFootprintCopyTransactionClockCommand & Readonly<{ sessionId: string }>;
type ChannelCommand = CurrentPcbWorkerStartupCommand | CurrentFootprintCopyUiCommand | CurrentFootprintCopyManagerRouteCommand | ClockCommand | CurrentFootprintParentCommand | CurrentFootprintCopySavedQueueChannelCommand | CurrentFootprintCacheConstructionChannelCommand;
function clockWire(raw: unknown, id: number): ReturnType<typeof currentFootprintCopyTransactionClockWire> {
  const captured = captureCurrentPcbStringClockReply(raw).value;
  if (!record(captured) || !exact(captured, ["method", "params", "sessionId"]) || typeof captured["sessionId"] !== "string") { throw fail("FOOTPRINT_CLOCK_COMMAND"); }
  const { sessionId, ...command } = captured;
  return currentFootprintCopyTransactionClockWire(command, id, sessionId);
}
function replyFrameLimit(command: ChannelCommand): number {
  if (command.method === "Debugger.getScriptSource") { return SOURCE_FRAME; }
  return command.method === "Runtime.callFunctionOn" && "objectId" in command.params && command.params.awaitPromise ?
    CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES : MAX_FRAME;
}
interface Pending {
  readonly id: number;
  readonly command: ChannelCommand;
  readonly completion: PromiseWithResolvers<unknown>;
  readonly allocation: boolean;
  written: boolean;
  writeFailed: boolean;
  replied: boolean;
  result: unknown;
  remoteError: boolean;
  settled: boolean;
}
function fail(code: string): Error {
  const error = new Error(`PCB_WORKER_STARTUP_CHANNEL_${code}`); failureCodes.set(error, code); return error;
}
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: object, keys: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === [...keys].toSorted().join(","); }
function cleanupCommand(command: ChannelCommand): boolean {
  return command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" ||
    command.method === "Runtime.runIfWaitingForDebugger" || command.method === "Runtime.releaseObjectGroup";
}
function parentCommand(command: ChannelCommand): boolean {
  return command.method === "Target.getTargets" || command.method === "Page.getFrameTree" ||
    command.method === "DOM.getFrameOwner" || command.method === "DOM.describeNode" ||
    command.method === "Debugger.getScriptSource" && "pcbPhase" in command ||
    command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params;
}
function members(dependency: CurrentPcbWorkerStartupNativeDependency): readonly unknown[] {
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

class CurrentPcbWorkerStartupChannelCore {
  readonly #wire: typeof currentPcbWorkerStartupWire;
  readonly #footprintPurpose: boolean;
  readonly #executionPurpose: boolean;
  readonly #savedPurpose: boolean;
  readonly #footprintProfile: typeof CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE | typeof CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE | typeof CURRENT_FOOTPRINT_COPY_SAVED_PROFILE;
  readonly #requestLimit: number;
  readonly #native: CurrentPcbWorkerStartupNativeDependency;
  readonly #members: readonly unknown[];
  readonly #parentMethod: CurrentPcbWorkerStartupNativeDependency["requireOriginalParent"];
  readonly #terminate: CurrentPcbWorkerStartupNativeDependency["assertOriginalTermination"];
  readonly #parentEvent: CurrentPcbWorkerStartupNativeDependency["observeOriginalParentEvent"];
  readonly #exchange: CurrentPcbWorkerStartupNativeDependency["exchange"];
  readonly #pending = new Map<number, Pending>();
  readonly #workers = new Map<string, string>();
  readonly #created = monotonicNow();
  #parent: CurrentPcbWorkerStartupParent | null = null;
  #listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  #tail: Promise<void> = Promise.resolve();
  #buffer = Buffer.alloc(4096);
  #used = 0;
  #nextId = 0;
  #bytes = 0;
  #events = 0;
  #eventBytes = 0;
  #polls = 0;
  #dataPolls = 0;
  #waitPolls = 0;
  #idlePolls = 0;
  #nextPollDelay = ACTIVE_POLL_MS;
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
  #openingProjectUuid: string | null = null;
  #openingConsumed = false;
  #actorReads = 0;
  #savedQueueReads = 0;
  #savedQueueContext: string | null = null;
  #savedQueueScope: string | null = null;
  #footprintUiStarted = false;
  #footprintUiReleased = false;
  #footprintManagerStarted = false;
  #footprintManagerSourceConsumed = false;
  #footprintManagerReleased = false;
  #footprintParentSubscriber: Readonly<{ event: (event: CurrentPcbWorkerStartupEvent) => void; lost: () => void }> | null = null;
  #footprintParentSubscriptionConsumed = false;
  #executionWorkerSession: string | null = null;
  #executionChildContext: string | null = null;
  #footprintClockSession: string | null = null;
  #footprintClockRequests = 0;
  #footprintCacheRequests = 0;
  #pcbPreflightConsumed = false;
  #pcbOpeningConsumed = false;
  #pcbSourceConsumed = false;
  #pcbObservationConsumed = false;
  #failure: Error | null = null;
  #failureCode: string | null = null;
  #fatal = false;

  public constructor(internal: typeof INTERNAL_PROFILE, native: CurrentPcbWorkerStartupNativeDependency,
    wire: typeof currentPcbWorkerStartupWire, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    if (internal !== INTERNAL_PROFILE) { throw fail("INTERNAL_PROFILE"); } this.#wire = wire;
    this.#executionPurpose = wire === currentFootprintCopyExecutionStartupWire;
    this.#savedPurpose = wire === currentFootprintCopySavedStartupWire;
    this.#footprintPurpose = this.#executionPurpose || this.#savedPurpose || wire === currentFootprintCopyPreparationWire;
    const writerProfile = this.#executionPurpose ? CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE : CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE;
    this.#footprintProfile = this.#savedPurpose ? CURRENT_FOOTPRINT_COPY_SAVED_PROFILE : writerProfile;
    this.#requestLimit = this.#footprintPurpose ? this.#footprintProfile.requestLimit : CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT;
    this.#members = members(native); this.#native = native;
    this.#parentMethod = native.requireOriginalParent; this.#terminate = native.assertOriginalTermination;
    this.#parentEvent = native.observeOriginalParentEvent; this.#exchange = native.exchange;
    if (priorUsage !== undefined) {
      const prior = z.object({ receivedBytes: z.number().int().min(0).max(MAX_BYTES),
        eventCount: z.number().int().min(0).max(MAX_EVENTS), eventBytes: z.number().int().min(0).max(MAX_EVENT_BYTES) }).strict()
        .parse(captureCurrentPcbStringClockReply(priorUsage).value);
      this.#bytes = prior.receivedBytes; this.#events = prior.eventCount; this.#eventBytes = prior.eventBytes;
    }
  }
  public status(): Readonly<{ started: boolean; released: boolean; failed: boolean; fatal: boolean;
    pendingReplies: number; nextRequestId: number; receivedBytes: number; pollCount: number; attachedWorkers: number;
    dataPollCount: number; waitingPollCount: number; idlePollCount: number; failureCode: string | null }> {
    return Object.freeze({ started: this.#started, released: this.#released, failed: this.#failure !== null, fatal: this.#fatal,
      pendingReplies: this.#pending.size, nextRequestId: this.#nextId, receivedBytes: this.#bytes,
      pollCount: this.#polls, attachedWorkers: this.#workers.size, dataPollCount: this.#dataPolls,
      waitingPollCount: this.#waitPolls, idlePollCount: this.#idlePolls, failureCode: this.#failureCode });
  }
  #withinLifetime(cleanup = false): void {
    const age = monotonicNow() - this.#created;
    const normal = this.#footprintPurpose ? this.#footprintProfile.normalMilliseconds : LIFETIME_MS;
    const total = normal + (this.#footprintPurpose ? this.#footprintProfile.cleanupMilliseconds : 0);
    if (age < 0n || age >= BigInt(total) * 1_000_000n) {
      this.#poison("LIFETIME", true); throw this.#failure ?? fail("LIFETIME");
    }
    // Reject new normal work without poisoning the retained pipe. Original
    // Cleanup and reply polling remain available during the sealed reserve.
    if (!cleanup && age >= BigInt(normal) * 1_000_000n) { throw fail("NORMAL_LIFETIME"); }
  }
  #sameMethods(): void {
    if (members(this.#native).some((value, index) => value !== this.#members[index])) { throw fail("DEPENDENCY_CHANGED"); }
  }
  async #current(): Promise<void> {
    await this.#queue(() => this.#currentWithinQueue());
  }
  async #currentWithinQueue(): Promise<void> {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw this.#failure ?? fail("RELEASED"); }
    try {
      this.#withinLifetime();
      this.#sameMethods(); const parent = await this.#parentMethod.call(this.#native); this.#sameMethods();
      this.#withinLifetime();
      if (parent !== this.#parent || this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("ORIGINAL_PARENT"); }
    } catch (error) {
      if (!(error instanceof Error && failureCodes.get(error) === "NORMAL_LIFETIME")) { this.#poison("OWNER"); }
      throw error;
    }
  }
  public async start(): Promise<CurrentPcbWorkerStartupDependency> {
    if (this.#started) { throw fail("START_CONSUMED"); } this.#started = true;
    await this.#queue(async (): Promise<void> => {
      this.#withinLifetime();
      this.#sameMethods(); const original = await this.#parentMethod.call(this.#native); this.#sameMethods();
      this.#withinLifetime();
      if (!record(original) || types.isProxy(original) || !Object.isFrozen(original)) { throw fail("PARENT"); }
      const parent = (this.#footprintPurpose ? parentSchema.extend({ nextRequestId: z.number().int().min(1).max(this.#requestLimit) }) : parentSchema)
        .parse(captureCurrentPcbStringClockReply(original).value);
      if (this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
      this.#parent = original; this.#nextId = parent.nextRequestId;
    });
    const parent = this.#parent;
    if (parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
    const dependency = Object.freeze({ parentTargetId: parent.targetId, parentSessionId: parent.sessionId,
      assertOriginalOwner: (): Promise<void> => this.#current(),
      assertOriginalTermination: (): Promise<void> => this.#originalTermination(),
      request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => this.#request(command),
      subscribe: (listener: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
        if (this.#listener !== null || this.#released) { throw fail("SUBSCRIBER"); }
        this.#listener = listener; this.#schedulePoll(0);
        return (): void => { if (this.#listener === listener) { this.#listener = null; } };
      },
    });
    if (this.#footprintPurpose && !this.#savedPurpose) { footprintDependencies.add(dependency); }
    if (this.#savedPurpose) { savedDependencies.add(dependency); }
    if (this.#executionPurpose) { markCurrentFootprintExecutionDependency(dependency); executionDependencies.set(dependency, this); }
    return dependency;
  }
  #poison(code: string, fatal = false): void {
    const first = this.#failure === null;
    this.#failure ??= fail(code); this.#failureCode ??= code; this.#fatal ||= fatal;
    if (first) {
      try { this.#footprintParentSubscriber?.lost(); }
      catch { this.#fatal = true; }
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
  #attributed(command: ChannelCommand, manager = false, clock = false, parentKind?: CurrentFootprintParentCommandKind): void {
    if (this.#parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("NOT_STARTED"); }
    if ("phase" in command && command.phase === "cache-construction") {
      if (!this.#executionPurpose || this.#executionWorkerSession === null || command.sessionId !== this.#executionWorkerSession ||
        !this.#openingConsumed || this.#footprintCacheRequests >= CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.total +
          CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.reproof) { throw fail("FOOTPRINT_CACHE_OWNER"); }
      return;
    }
    if ("phase" in command && command.phase === "saved-upload-queue") {
      const scope = JSON.stringify(command.params.arguments.map(argument => argument.value));
      if (!this.#savedPurpose || command.sessionId !== this.#parent.sessionId || this.#openingConsumed || this.#savedQueueReads >= 2 ||
        this.#savedQueueContext !== null && this.#savedQueueContext !== command.params.uniqueContextId ||
        this.#savedQueueScope !== null && this.#savedQueueScope !== scope) { throw fail("SAVED_QUEUE_OWNER"); }
      return;
    }
    if (parentKind !== undefined) {
      if (!this.#executionPurpose || this.#footprintParentSubscriber === null || !("phase" in command)) { throw fail("FOOTPRINT_PARENT_OWNER"); }
      if (parentKind === "construction") {
        if (command.sessionId !== this.#parent.sessionId || !this.#openingConsumed &&
            !["source", "breakpoint-before", "breakpoint-after"].includes(command.phase)) { throw fail("FOOTPRINT_PARENT_SEQUENCE"); }
      } else {
        if (!this.#openingConsumed || this.#executionWorkerSession === null ||
            command.sessionId !== this.#parent.sessionId && command.sessionId !== this.#executionWorkerSession) { throw fail("FOOTPRINT_PEER_SESSION"); }
        if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params &&
            command.params.uniqueContextId !== this.#executionChildContext) { throw fail("FOOTPRINT_PEER_CONTEXT"); }
      }
      return;
    }
    if (clock) {
      if (!this.#executionPurpose || !this.#openingConsumed || command.sessionId === undefined || command.sessionId !== this.#executionWorkerSession || !this.#workers.has(command.sessionId) ||
        this.#footprintClockSession !== null && command.sessionId !== this.#footprintClockSession ||
        this.#footprintClockRequests >= CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS) { throw fail("FOOTPRINT_CLOCK_OWNER"); }
      return;
    }
    if (manager) {
      if (!("phase" in command) || !this.#footprintPurpose || !this.#openingConsumed || !this.#footprintUiStarted || this.#footprintUiReleased && command.phase !== "release" ||
          command.sessionId !== this.#parent.sessionId || this.#footprintManagerReleased ||
          (command.phase === "initial" ? this.#footprintManagerStarted : !this.#footprintManagerStarted) ||
          command.phase === "source" && this.#footprintManagerSourceConsumed) { throw fail("FOOTPRINT_MANAGER_ROUTE_SEQUENCE"); }
      return;
    }
    if ("phase" in command) {
      if (!this.#footprintPurpose || !this.#openingConsumed || command.sessionId !== this.#parent.sessionId || this.#footprintUiReleased ||
          (command.phase === "initial" ? this.#footprintUiStarted : !this.#footprintUiStarted)) { throw fail("FOOTPRINT_UI_SEQUENCE"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params && command.params.uniqueContextId !== this.#openingContext) {
        throw fail("FOOTPRINT_UI_CONTEXT");
      }
      return;
    }
    if (command.method === "Target.setAutoAttach") {
      if (command.sessionId !== this.#parent.sessionId || this.#attachIssued) { throw fail("ATTACHMENT"); }
      return;
    }
    if (parentCommand(command)) {
      if (command.method !== "Target.getTargets" && command.sessionId !== this.#parent.sessionId) { throw fail("PARENT_SESSION"); }
      if (command.method === "Debugger.getScriptSource" && (!this.#pcbOpeningConsumed || this.#pcbSourceConsumed)) { throw fail("PCB_SOURCE_SEQUENCE"); }
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
        if (command.params.arguments.length === 0) {
          if (!this.#openingConsumed || command.params.uniqueContextId !== this.#openingContext || this.#actorReads >= 2) { throw fail("ACTOR_SEQUENCE"); }
          return;
        }
        const identity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
        const phase = command.params.arguments[1].value;
        if (this.#savedPurpose) {
          const target = command.params.arguments[0].value;
          if (this.#savedQueueReads < 1 || this.#savedQueueContext !== command.params.uniqueContextId ||
            this.#savedQueueScope !== JSON.stringify([target.projectUuid, target.branchUuid]) ||
            phase === "open-project" && this.#savedQueueReads !== 2) { throw fail("SAVED_REPLAY_BRACKETS"); }
        }
        if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
          if (!this.#openingConsumed || this.#openingIdentity !== identity ||
              phase === "preflight" && this.#pcbPreflightConsumed ||
              phase === "open-document" && (!this.#pcbPreflightConsumed || this.#pcbOpeningConsumed) ||
              phase === "observe" && (!this.#pcbSourceConsumed || this.#pcbObservationConsumed)) { throw fail("PCB_OPENING_SEQUENCE"); }
          return;
        }
        if (phase === "preflight" ? this.#openingIdentity !== null :
            !this.#attachAcknowledged || this.#openingIdentity !== identity || this.#openingConsumed) { throw fail("OPENING_SEQUENCE"); }
      }
      return;
    }
    if (command.sessionId === undefined) { throw fail("WORKER_SESSION"); }
    if (!this.#workers.has(command.sessionId)) { throw fail("WORKER_SESSION"); }
    if (this.#executionPurpose && command.method === "Runtime.enable" &&
        (!this.#openingConsumed || this.#executionWorkerSession !== null)) { throw fail("EXECUTION_WORKER_RUNTIME"); }
  }
  // oxlint-disable-next-line eslint/require-await -- Return the original retained completion, with synchronous guards converted to rejection.
  async #request(raw: ChannelCommand, manager = false, clock = false, parentKind?: CurrentFootprintParentCommandKind): Promise<unknown> {
    // Select the fixed grammar only after rejecting prototype/proxy traps.
    if (!record(raw) || types.isProxy(raw) ||
      Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw fail("COMMAND"); }
    if ("phase" in raw && (!this.#footprintPurpose || this.#savedPurpose &&
      Object.getOwnPropertyDescriptor(raw, "phase")?.value !== "saved-upload-queue")) { throw fail("FOOTPRINT_UI_PURPOSE"); }
    const copyWire = manager ? currentFootprintCopyManagerRouteWire : currentFootprintCopyUiWire;
    const encode = (value: ChannelCommand, id: number): Readonly<{ command: ChannelCommand & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>> }> => {
      if (Object.getOwnPropertyDescriptor(value, "phase")?.value === "saved-upload-queue") { return currentFootprintCopySavedQueueWire(value, id); }
      if (Object.getOwnPropertyDescriptor(value, "phase")?.value === "cache-construction") { return currentFootprintCacheConstructionWire(value, id); }
      if (parentKind !== undefined) {
        if (this.#parent === null) { throw fail("NOT_STARTED"); }
        return currentFootprintCopyParentWire(value, id, parentKind, this.#parent.sessionId, this.#executionWorkerSession);
      }
      if (clock) { return clockWire(value, id); }
      return "phase" in value ? copyWire(value, id) : this.#wire(value, id);
    };
    const normalized = encode(raw, 1).command;
    const { id: _id, ...command } = normalized;
    this.#attributed(command, manager, clock, parentKind);
    this.#withinLifetime(cleanupCommand(command));
    if (this.#fatal || this.#failure !== null && !cleanupCommand(command)) { throw this.#failure ?? fail("FATAL"); }
    if (this.#queuedRequests >= 32) { throw fail("QUEUE_BUDGET"); } this.#queuedRequests += 1;
    const completion = Promise.withResolvers<unknown>();
    const queued = this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      try {
        if (!cleanupCommand(command)) { await this.#currentWithinQueue(); }
        this.#attributed(command, manager, clock, parentKind);
        this.#withinLifetime(cleanupCommand(command));
        const limit = this.#footprintPurpose && !cleanupCommand(command) ? this.#footprintProfile.normalRequestLimit : this.#requestLimit;
        if (this.#fatal || this.#released || this.#nextId > limit) { throw fail("REQUEST_BUDGET"); }
        const wire = encode(command, this.#nextId); this.#nextId += 1;
        if (this.#executionPurpose && command.method === "Runtime.enable") { this.#executionWorkerSession = command.sessionId ?? null; }
        if (clock) { this.#footprintClockSession ??= command.sessionId ?? null; this.#footprintClockRequests += 1; }
        pending = { id: wire.command.id, command, completion,
          allocation: command.method === "Debugger.setBreakpoint" || command.method === "Debugger.setInstrumentationBreakpoint",
          written: false, writeFailed: false, replied: false, result: null, remoteError: false, settled: false };
        this.#pending.set(pending.id, pending);
        if ("phase" in command && command.phase === "cache-construction") { this.#footprintCacheRequests += 1; }
        if ("phase" in command && command.phase === "saved-upload-queue") {
          this.#savedQueueReads += 1; this.#savedQueueContext ??= command.params.uniqueContextId;
          this.#savedQueueScope ??= JSON.stringify(command.params.arguments.map(argument => argument.value));
        }
        if (command.method === "Target.setAutoAttach") { this.#attachIssued = true; }
        if (command.method === "Debugger.getScriptSource" && "pcbPhase" in command) { this.#pcbSourceConsumed = true; }
        if (manager && "phase" in command) {
          if (command.phase === "initial") { this.#footprintManagerStarted = true; }
          if (command.phase === "source") { this.#footprintManagerSourceConsumed = true; }
          if (command.phase === "release") { this.#footprintManagerReleased = true; }
        } else if ("phase" in command) {
          if (command.phase === "initial") { this.#footprintUiStarted = true; }
          if (command.phase === "release") { this.#footprintUiReleased = true; }
        }
        if (!clock && parentKind === undefined && !("phase" in command) && command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
          if (command.params.arguments.length === 0) { this.#actorReads += 1; }
          else if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
            if (command.params.arguments[1].value === "preflight") { this.#pcbPreflightConsumed = true; }
            else if (command.params.arguments[1].value === "open-document") { this.#pcbOpeningConsumed = true; }
            else { this.#pcbObservationConsumed = true; }
          }
          else if (command.params.arguments[1].value === "preflight") {
            this.#openingIdentity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
            this.#openingContext = command.params.uniqueContextId;
            this.#openingProjectUuid = command.params.arguments[0].value.projectUuid;
          } else { this.#openingConsumed = true; }
        }
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, wire.request)).value);
        pending.written = true; this.#complete(pending);
      } catch (error) {
        if (!(error instanceof Error && failureCodes.get(error) === "NORMAL_LIFETIME" && pending === null)) { this.#poison("WRITE"); }
        if (pending === null) { completion.reject(error); }
        else { pending.writeFailed = true; this.#complete(pending); }
      } finally { this.#queuedRequests -= 1; this.#schedulePoll(0); }
    });
    void observe(queued); return completion.promise;
  }
  /** Fixed copy-purpose parent requests share the original counter, stream and
   * attachment. Other purposes refuse before dispatch. */
  public requestFootprintUi(command: CurrentFootprintCopyUiCommand): Promise<unknown> {
    if (!this.#footprintPurpose || this.#savedPurpose) { return Promise.reject(fail("FOOTPRINT_UI_PURPOSE")); }
    return this.#request(command);
  }
  public requestFootprintManagerRoute(command: CurrentFootprintCopyManagerRouteCommand): Promise<unknown> {
    if (!this.#footprintPurpose || this.#savedPurpose) { return Promise.reject(fail("FOOTPRINT_MANAGER_ROUTE_PURPOSE")); }
    return this.#request(command, true);
  }
  public requestFootprintSavedUploadQueue(command: CurrentFootprintCopySavedQueueCommand): Promise<unknown> {
    if (!this.#savedPurpose) { return Promise.reject(fail("SAVED_QUEUE_PURPOSE")); }
    try {
      const captured = captureCurrentPcbStringClockReply(command).value;
      if (!record(captured)) { return Promise.reject(fail("SAVED_QUEUE_COMMAND")); }
      const parsed = currentFootprintCopySavedQueueWire({ ...captured, phase: "saved-upload-queue" }, 1);
      const { id: _id, ...original } = parsed.command; return this.#request(original);
    } catch (error) { return Promise.reject(error instanceof Error ? error : fail("SAVED_QUEUE_COMMAND")); }
  }
  public requestFootprintCacheConstruction(command: CurrentFootprintCacheConstructionCommand): Promise<unknown> {
    if (!this.#executionPurpose || this.#executionWorkerSession === null) { return Promise.reject(fail("FOOTPRINT_CACHE_PURPOSE")); }
    try {
      const captured = captureCurrentPcbStringClockReply(command).value;
      if (!record(captured) || Object.hasOwn(captured, "sessionId") || Object.hasOwn(captured, "phase")) { return Promise.reject(fail("FOOTPRINT_CACHE_COMMAND")); }
      const parsed = currentFootprintCacheConstructionWire({ ...captured, phase: "cache-construction", sessionId: this.#executionWorkerSession }, 1);
      const { id: _id, ...original } = parsed.command; return this.#request(original);
    } catch (error) { return Promise.reject(error instanceof Error ? error : fail("FOOTPRINT_CACHE_COMMAND")); }
  }
  public originalExecutionProjectUuid(dependency: CurrentPcbWorkerStartupDependency): string {
    if (executionDependencies.get(dependency) !== this || !this.#executionPurpose || !this.#openingConsumed || this.#openingProjectUuid === null ||
      this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("FOOTPRINT_CACHE_PROJECT"); }
    return this.#openingProjectUuid;
  }
  public requestFootprintParent(dependency: CurrentPcbWorkerStartupDependency,
    command: CurrentFootprintParentCommand, kind: CurrentFootprintParentCommandKind): Promise<unknown> {
    const route = requireCurrentFootprintCopyParentRoute(dependency);
    if (executionDependencies.get(dependency) !== this || command.sessionId === route.parentSessionId &&
        (command.method === "Debugger.getScriptSource" && command.params.scriptId !== route.managerScriptId ||
         command.method === "Debugger.setBreakpoint" && command.params.location.scriptId !== route.managerScriptId)) {
      return Promise.reject(fail("FOOTPRINT_PARENT_SOURCE"));
    }
    return this.#request(command, false, false, kind);
  }
  public subscribeFootprintParentEvents(dependency: CurrentPcbWorkerStartupDependency,
    listener: (event: CurrentPcbWorkerStartupEvent) => void, lost: () => void): () => void {
    const route = requireCurrentFootprintCopyParentRoute(dependency);
    if (!this.#executionPurpose || executionDependencies.get(dependency) !== this || this.#footprintParentSubscriptionConsumed ||
        this.#parent === null || route.parentSessionId !== this.#parent.sessionId || this.#released || this.#releaseRequested ||
        this.#failure !== null || this.#openingConsumed) { throw fail("FOOTPRINT_PARENT_SUBSCRIBER"); }
    this.#footprintParentSubscriptionConsumed = true;
    const selected = Object.freeze({ event: (event: CurrentPcbWorkerStartupEvent): void => {
      route.assertOriginalSynchronous(); listener(event); route.assertOriginalSynchronous();
    }, lost });
    this.#footprintParentSubscriber = selected;
    return (): void => {
      if (this.#footprintParentSubscriber !== selected) { throw fail("FOOTPRINT_PARENT_SUBSCRIBER"); }
      this.#footprintParentSubscriber = null;
    };
  }
  public requestFootprintClock(command: ClockCommand): Promise<unknown> {
    if (!this.#executionPurpose) { return Promise.reject(fail("FOOTPRINT_CLOCK_PURPOSE")); }
    return this.#request(command, false, true);
  }
  #complete(pending: Pending): void {
    if (!pending.replied) { return; }
    // An allocation ID remains useful cleanup evidence even when WriteFile's
    // Acknowledgment was lost. The poisoned owner prevents further arming.
    if (!pending.written && !(pending.allocation && pending.writeFailed)) { return; }
    this.#pending.delete(pending.id);
    if (pending.settled) { return; }
    pending.settled = true;
    if (pending.remoteError || this.#failure !== null && !pending.allocation && !cleanupCommand(pending.command)) {
      pending.completion.reject(this.#failure ?? fail("REMOTE"));
    } else {
      if (pending.command.method === "Target.setAutoAttach") {
        if (!record(pending.result) || !exact(pending.result, [])) { this.#poison("ATTACH_REPLY"); pending.completion.reject(fail("ATTACH_REPLY")); return; }
        this.#attachAcknowledged = true;
      }
      pending.completion.resolve(pending.result);
    }
  }
  #schedulePoll(milliseconds: number): void {
    if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal ||
        this.#listener === null && this.#pending.size === 0 || this.#pollQueued) { return; }
    if (this.#pollTimer !== null) {
      if (milliseconds !== 0) { return; }
      // A new command wakes an idle listener immediately. Keep one serialized
      // Poll owner and all cumulative counters; only the pending timer changes.
      clearTimeout(this.#pollTimer); this.#pollTimer = null;
    }
    this.#pollTimer = setTimeout(() => { this.#pollTimer = null; this.#poll(); }, milliseconds);
  }
  #poll(): void {
    if (this.#pollQueued || this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
    this.#pollQueued = true;
    const work = this.#queue(async (): Promise<void> => {
      try {
        if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
        this.#withinLifetime(true); this.#polls += 1;
        const waiting = this.#pending.size > 0 || this.#queuedRequests !== 0 || this.#used !== 0;
        // Native chunks may be64KiB, larger than generic clock text fields.
        const raw = await this.#exchange.call(this.#native, { action: "poll" });
        this.#withinLifetime(true); this.#chunk(raw, waiting);
      } catch (error) { this.#poison(error instanceof Error ? failureCodes.get(error) ?? "POLL" : "POLL", true); }
      finally { this.#pollQueued = false; this.#schedulePoll(this.#nextPollDelay); }
    });
    void observe(work);
  }
  #chunk(raw: unknown, waiting: boolean): void {
    if (!record(raw) || types.isProxy(raw) || Reflect.ownKeys(raw).join(",") !== "bytes" ||
        Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { throw fail("CHUNK"); }
    const descriptor = Object.getOwnPropertyDescriptor(raw, "bytes"), text: unknown = descriptor?.value;
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof text !== "string" || text.length > 87_384 ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(text)) { throw fail("CHUNK"); }
    const bytes = Buffer.from(text, "base64");
    if (bytes.length > 65_536 || bytes.toString("base64") !== text) { throw fail("CHUNK"); }
    // Empty idle checks observe unsolicited events, but consume no data or
    // Request-wait allowance. Bound all three forms separately and never reset
    // A count after progress. The nonrenewable monotonic lifetime caps idle time.
    if (bytes.length > 0) {
      if (this.#dataPolls >= MAX_DATA_POLLS) { throw fail("DATA_POLL_BUDGET"); }
      this.#dataPolls += 1; this.#nextPollDelay = ACTIVE_POLL_MS;
    } else if (waiting) {
      if (this.#waitPolls >= MAX_WAIT_POLLS) { throw fail("WAIT_POLL_BUDGET"); }
      this.#waitPolls += 1; this.#nextPollDelay = ACTIVE_POLL_MS;
    } else {
      if (this.#idlePolls >= MAX_IDLE_POLLS) { throw fail("IDLE_POLL_BUDGET"); }
      this.#idlePolls += 1; this.#nextPollDelay = IDLE_POLL_MS;
    }
    this.#bytes += bytes.length; if (this.#bytes > MAX_BYTES) { throw fail("BYTE_BUDGET"); }
    let start = 0;
    while (start < bytes.length) {
      const zero = bytes.indexOf(0, start);
      const end = zero === -1 ? bytes.length : zero;
      const required = this.#used + end - start;
      const limit = Math.max(MAX_FRAME, ...[...this.#pending.values()].map(pending => replyFrameLimit(pending.command)));
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
        !record(value["result"] ?? value["error"]) || bytes.length > replyFrameLimit(pending.command)) {
      throw fail("REPLY");
    }
    pending.replied = true; pending.remoteError = Object.hasOwn(value, "error");
    pending.result = value["result"] ?? null;
    if (pending.remoteError) { this.#poison("REMOTE"); }
    this.#complete(pending);
  }
  #event(value: Record<string, unknown>, bytes: number): void {
    this.#events += 1; this.#eventBytes += bytes;
    if (bytes > MAX_FRAME || this.#events > MAX_EVENTS || this.#eventBytes > MAX_EVENT_BYTES || this.#parent === null) { throw fail("EVENT_BUDGET"); }
    const event = z.object({ method: z.string().min(1).max(128), params: z.record(z.string(), z.unknown()), sessionId: token }).strict()
      .parse(captureCurrentPcbStringClockReply(value).value);
    if (event.sessionId === this.#parent.sessionId) {
      if (event.method !== "Target.attachedToTarget") {
        if (this.#executionPurpose && this.#footprintParentSubscriber !== null &&
            (event.method === "Debugger.paused" || event.method === "Debugger.resumed")) {
          this.#footprintParentSubscriber.event(event); return;
        }
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
    if (this.#executionPurpose && event.sessionId === this.#executionWorkerSession && event.method === "Runtime.executionContextCreated") {
      const context = event.params["context"];
      if (!record(context) || this.#executionChildContext !== null) { throw fail("FOOTPRINT_PEER_CONTEXT"); }
      this.#executionChildContext = token.parse(context["uniqueId"]);
    }
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
    } catch { this.#poison("PARENT_EVENT"); }
  }
  async #originalTermination(): Promise<void> {
    await this.#queue(async (): Promise<void> => {
      this.#sameMethods(); await this.#terminate.call(this.#native); this.#sameMethods();
      this.#terminationVerified = true;
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
    this.#pending.clear(); this.#listener = null;
  }
}

export class CurrentPcbWorkerStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentPcbWorkerStartupWire, priorUsage);
  }
}
export class CurrentPcb209WorkerStartupChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentPcb209WorkerStartupWire, priorUsage);
  }
}
/** A separately constructed channel; the old256 owners retain their bounds. */
export class CurrentFootprintCopyPreparationChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyPreparationWire, priorUsage);
  }
}
/** Separate fixed launch identity. Preparation channels cannot be upgraded. */
export class CurrentFootprintCopyExecutionChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopyExecutionStartupWire, priorUsage);
  }
}
/** Fixed saved-generation owner; no writer, clock or parent challenge marker. */
export class CurrentFootprintCopySavedChannel extends CurrentPcbWorkerStartupChannelCore {
  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
    super(INTERNAL_PROFILE, native, currentFootprintCopySavedStartupWire, priorUsage);
  }
}
