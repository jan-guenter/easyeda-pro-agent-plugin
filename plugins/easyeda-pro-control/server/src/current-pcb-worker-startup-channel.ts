/** Private original-native-channel adapter. The eventual retained owner must
 * irreversibly hand off its original parent attachment and request counter.
 * This module neither launches EasyEDA nor accepts a parent receipt as authority. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, currentPcbWorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
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
const token = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u);
const parentSchema = z.object({ targetId: token, sessionId: token,
  nextRequestId: z.number().int().min(1).max(CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) }).strict();
const ackSchema = z.object({ written: z.literal(true) }).strict();
const MAX_BYTES = 64 * 1024 * 1024, MAX_EVENTS = 4096, MAX_EVENT_BYTES = 8 * 1024 * 1024;
const MAX_FRAME = 1024 * 1024, MAX_POLLS = 8192, SOURCE_FRAME = 32 * 1024 * 1024;
interface Pending {
  readonly id: number;
  readonly command: CurrentPcbWorkerStartupCommand;
  readonly completion: PromiseWithResolvers<unknown>;
  readonly allocation: boolean;
  written: boolean;
  writeFailed: boolean;
  replied: boolean;
  result: unknown;
  remoteError: boolean;
  settled: boolean;
}
function fail(code: string): Error { return new Error(`PCB_WORKER_STARTUP_CHANNEL_${code}`); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: object, keys: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === [...keys].toSorted().join(","); }
function cleanupCommand(command: CurrentPcbWorkerStartupCommand): boolean {
  return command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" ||
    command.method === "Runtime.runIfWaitingForDebugger" || command.method === "Runtime.releaseObjectGroup";
}
function parentCommand(command: CurrentPcbWorkerStartupCommand): boolean {
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

export class CurrentPcbWorkerStartupChannel {
  readonly #native: CurrentPcbWorkerStartupNativeDependency;
  readonly #members: readonly unknown[];
  readonly #parentMethod: CurrentPcbWorkerStartupNativeDependency["requireOriginalParent"];
  readonly #terminate: CurrentPcbWorkerStartupNativeDependency["assertOriginalTermination"];
  readonly #parentEvent: CurrentPcbWorkerStartupNativeDependency["observeOriginalParentEvent"];
  readonly #exchange: CurrentPcbWorkerStartupNativeDependency["exchange"];
  readonly #pending = new Map<number, Pending>();
  readonly #workers = new Map<string, string>();
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
  #pcbSourceConsumed = false;
  #pcbObservationConsumed = false;
  #failure: Error | null = null;
  #fatal = false;

  public constructor(native: CurrentPcbWorkerStartupNativeDependency, priorUsage?: CurrentPcbWorkerStartupPriorUsage) {
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
    pendingReplies: number; nextRequestId: number; receivedBytes: number; pollCount: number; attachedWorkers: number }> {
    return Object.freeze({ started: this.#started, released: this.#released, failed: this.#failure !== null, fatal: this.#fatal,
      pendingReplies: this.#pending.size, nextRequestId: this.#nextId, receivedBytes: this.#bytes,
      pollCount: this.#polls, attachedWorkers: this.#workers.size });
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
      this.#sameMethods(); const parent = await this.#parentMethod.call(this.#native); this.#sameMethods();
      if (parent !== this.#parent || this.#released || this.#releaseRequested || this.#terminationVerified || this.#failure !== null) { throw fail("ORIGINAL_PARENT"); }
    } catch (error) { this.#poison("OWNER"); throw error; }
  }
  public async start(): Promise<CurrentPcbWorkerStartupDependency> {
    if (this.#started) { throw fail("START_CONSUMED"); } this.#started = true;
    await this.#queue(async (): Promise<void> => {
      this.#sameMethods(); const original = await this.#parentMethod.call(this.#native); this.#sameMethods();
      if (!record(original) || types.isProxy(original) || !Object.isFrozen(original)) { throw fail("PARENT"); }
      const parent = parentSchema.parse(captureCurrentPcbStringClockReply(original).value);
      if (this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
      this.#parent = original; this.#nextId = parent.nextRequestId;
    });
    const parent = this.#parent;
    if (parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("START_CLOSING"); }
    return Object.freeze({ parentTargetId: parent.targetId, parentSessionId: parent.sessionId,
      assertOriginalOwner: (): Promise<void> => this.#current(),
      assertOriginalTermination: (): Promise<void> => this.#originalTermination(),
      request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => this.#request(command),
      subscribe: (listener: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
        if (this.#listener !== null || this.#released) { throw fail("SUBSCRIBER"); }
        this.#listener = listener; this.#schedulePoll(0);
        return (): void => { if (this.#listener === listener) { this.#listener = null; } };
      },
    });
  }
  #poison(code: string, fatal = false): void {
    this.#failure ??= fail(code); this.#fatal ||= fatal;
    for (const pending of this.#pending.values()) {
      if (!pending.allocation && !pending.settled) { pending.settled = true; pending.completion.reject(this.#failure); }
    }
  }
  #queue(work: () => Promise<void>): Promise<void> {
    const previous = this.#tail;
    const next = (async (): Promise<void> => { await previous; await work(); })();
    this.#tail = observe(next); return next;
  }
  #attributed(command: CurrentPcbWorkerStartupCommand): void {
    if (this.#parent === null || this.#released || this.#releaseRequested || this.#terminationVerified) { throw fail("NOT_STARTED"); }
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
  }
  // oxlint-disable-next-line eslint/require-await -- Return the original retained completion, with synchronous guards converted to rejection.
  async #request(raw: CurrentPcbWorkerStartupCommand): Promise<unknown> {
    const normalized = currentPcbWorkerStartupWire(raw, 1).command;
    const { id: _id, ...command } = normalized;
    this.#attributed(command);
    if (this.#fatal || this.#failure !== null && !cleanupCommand(command)) { throw this.#failure ?? fail("FATAL"); }
    if (this.#queuedRequests >= 32) { throw fail("QUEUE_BUDGET"); } this.#queuedRequests += 1;
    const completion = Promise.withResolvers<unknown>();
    const queued = this.#queue(async (): Promise<void> => {
      let pending: Pending | null = null;
      try {
        if (!cleanupCommand(command)) { await this.#currentWithinQueue(); }
        this.#attributed(command);
        if (this.#fatal || this.#released || this.#nextId > CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) { throw fail("REQUEST_BUDGET"); }
        const wire = currentPcbWorkerStartupWire(command, this.#nextId); this.#nextId += 1;
        pending = { id: wire.command.id, command, completion,
          allocation: command.method === "Debugger.setBreakpoint" || command.method === "Debugger.setInstrumentationBreakpoint",
          written: false, writeFailed: false, replied: false, result: null, remoteError: false, settled: false };
        this.#pending.set(pending.id, pending);
        if (command.method === "Target.setAutoAttach") { this.#attachIssued = true; }
        if (command.method === "Debugger.getScriptSource" && "pcbPhase" in command) { this.#pcbSourceConsumed = true; }
        if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params) {
          if (command.params.arguments.length === 0) { this.#actorReads += 1; }
          else if (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) {
            if (command.params.arguments[1].value === "preflight") { this.#pcbPreflightConsumed = true; }
            else if (command.params.arguments[1].value === "open-document") { this.#pcbOpeningConsumed = true; }
            else { this.#pcbObservationConsumed = true; }
          }
          else if (command.params.arguments[1].value === "preflight") {
            this.#openingIdentity = JSON.stringify([command.params.uniqueContextId, command.params.arguments[0].value]);
            this.#openingContext = command.params.uniqueContextId;
          } else { this.#openingConsumed = true; }
        }
        ackSchema.parse(captureCurrentPcbStringClockReply(await this.#exchange.call(this.#native, wire.request)).value);
        pending.written = true; this.#complete(pending);
      } catch (error) {
        this.#poison("WRITE");
        if (pending === null) { completion.reject(error); }
        else { pending.writeFailed = true; this.#complete(pending); }
      } finally { this.#queuedRequests -= 1; this.#schedulePoll(0); }
    });
    void observe(queued); return completion.promise;
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
        this.#listener === null && this.#pending.size === 0 || this.#pollQueued || this.#pollTimer !== null) { return; }
    this.#pollTimer = setTimeout(() => { this.#pollTimer = null; this.#poll(); }, milliseconds);
  }
  #poll(): void {
    if (this.#pollQueued || this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
    this.#pollQueued = true;
    const work = this.#queue(async (): Promise<void> => {
      try {
        if (this.#released || this.#releaseRequested || this.#terminationVerified || this.#fatal) { return; }
        if (this.#polls >= MAX_POLLS) { throw fail("POLL_BUDGET"); } this.#polls += 1;
        // Native chunks may be64KiB, larger than generic clock text fields.
        this.#chunk(await this.#exchange.call(this.#native, { action: "poll" }));
      } catch { this.#poison("POLL", true); }
      finally { this.#pollQueued = false; this.#schedulePoll(20); }
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
    this.#bytes += bytes.length; if (this.#bytes > MAX_BYTES) { throw fail("BYTE_BUDGET"); }
    let start = 0;
    while (start < bytes.length) {
      const zero = bytes.indexOf(0, start);
      const end = zero === -1 ? bytes.length : zero;
      const required = this.#used + end - start;
      const limit = [...this.#pending.values()].some(pending => pending.command.method === "Debugger.getScriptSource") ? SOURCE_FRAME : MAX_FRAME;
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
        !record(value["result"] ?? value["error"]) || bytes.length > (pending.command.method === "Debugger.getScriptSource" ? SOURCE_FRAME : MAX_FRAME)) {
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
