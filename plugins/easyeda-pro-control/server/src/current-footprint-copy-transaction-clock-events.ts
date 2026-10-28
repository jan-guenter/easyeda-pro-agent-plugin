/** Bounded original-event adapter for the clock collector. It subscribes before
 * breakpoint allocation and arms each resumed-event waiter before dispatch.
 * It does not launch a worker, transfer a preparation owner or invoke create. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CurrentFootprintCopyTransactionClockRunner } from "./current-footprint-copy-transaction-clock-runner.ts";
import type { CurrentFootprintCopyTransactionClocks } from "./current-footprint-copy-transaction-clock-runner.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "./current-footprint-copy-transaction-clock.ts";
import { currentFootprintCopyTransactionClockWire } from "./current-footprint-copy-transaction-clock-wire.ts";

export interface CurrentFootprintCopyTransactionClockEventTransport {
  readonly scriptId: string;
  readonly managerObjectId: string;
  readonly lexicalBundleObjectId: string;
  readonly workerSessionId: string;
  /** Original owner checks must not send debugger work into a paused worker. */
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  /** Observes the retained original root and complete non-breakaway Job exit.
   * A timeout, same-name process lookup or caller attestation is insufficient. */
  readonly assertOriginalTermination: () => Promise<void>;
  /** Shares the execution owner's complete request reservation. The adapter
   * passes a closed command grammar; the owner supplies the global request ID. */
  readonly request: (command: CurrentFootprintCopyTransactionClockCommand & Readonly<{ sessionId: string }>) => Promise<unknown>;
  /** A retained owner allocates this exclusive original worker event route.
   * Receipt JSON, matching IDs and an arbitrary EventEmitter confer no authority. */
  readonly subscribe: (listener: (event: unknown) => void) => () => void;
}
const names = ["scriptId", "managerObjectId", "lexicalBundleObjectId", "workerSessionId",
  "assertOriginal", "assertCleanup", "assertOriginalTermination", "request", "subscribe"] as const;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const eventSchema = z.object({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: token.max(128),
  params: z.record(z.string(), z.unknown()) }).strict();
const MAX_EVENTS = 4, MAX_EVENT_BYTES = 65_536, WAIT_MILLISECONDS = 30_000;
const consumed = new WeakSet<CurrentFootprintCopyTransactionClockEventTransport>();
function need(condition: boolean, reason: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_CLOCK_EVENTS_${reason}`); }
}
function members(value: CurrentFootprintCopyTransactionClockEventTransport): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === names.length, "TRANSPORT");
  return names.map((name, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 4 ? "string" : "function"), "TRANSPORT");
    if (index < 4) { (index === 3 ? token.max(128) : token).parse(descriptor.value); }
    return descriptor.value as unknown;
  });
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original outcome and retained failure remain authoritative.
  }
}
interface ResumeWaiter { readonly result: PromiseWithResolvers<null>; observed: boolean; consumed: boolean }
export class CurrentFootprintCopyTransactionClockEvents {
  readonly #transport: CurrentFootprintCopyTransactionClockEventTransport;
  readonly #members: readonly unknown[];
  readonly #request: CurrentFootprintCopyTransactionClockEventTransport["request"];
  readonly #subscribe: CurrentFootprintCopyTransactionClockEventTransport["subscribe"];
  readonly #assertOriginal: CurrentFootprintCopyTransactionClockEventTransport["assertOriginal"];
  readonly #assertCleanup: CurrentFootprintCopyTransactionClockEventTransport["assertCleanup"];
  readonly #assertOriginalTermination: CurrentFootprintCopyTransactionClockEventTransport["assertOriginalTermination"];
  readonly #workerSessionId: string;
  readonly #runner: CurrentFootprintCopyTransactionClockRunner;
  readonly #events: unknown[] = [];
  readonly #outcome = Promise.withResolvers<CurrentFootprintCopyTransactionClocks>();
  #unsubscribe: (() => void) | null = null;
  #resume: ResumeWaiter | null = null;
  #tail: Promise<void> = Promise.resolve();
  #timer: ReturnType<typeof setTimeout> | null = null;
  #failed = false;
  #arming = false;
  #armed = false;
  #dispatched = false;
  #cleanupStarted = false;
  #released = false;
  #terminationObserved = false;
  #terminationPending = false;
  #eventBytes = 0;
  #pauseCount = 0;
  #resumeCount = 0;
  #sequence = 0;
  public constructor(transport: CurrentFootprintCopyTransactionClockEventTransport) {
    this.#members = members(transport); this.#transport = transport; this.#request = transport.request; this.#subscribe = transport.subscribe;
    this.#assertOriginal = transport.assertOriginal; this.#assertCleanup = transport.assertCleanup; this.#workerSessionId = transport.workerSessionId;
    this.#assertOriginalTermination = transport.assertOriginalTermination;
    this.#runner = new CurrentFootprintCopyTransactionClockRunner(Object.freeze({ scriptId: transport.scriptId,
      managerObjectId: transport.managerObjectId, lexicalBundleObjectId: transport.lexicalBundleObjectId,
      assertOriginal: (): Promise<void> => this.#current(), assertCleanup: (): void => { this.#cleanupCurrent(); },
      request: (command: CurrentFootprintCopyTransactionClockCommand): Promise<unknown> => this.#send(command),
      observeResumed: (): Promise<void> => this.#observeResumed() }));
    void observe(this.#outcome.promise);
  }
  #same(): void { need(members(this.#transport).every((value, index) => value === this.#members[index]), "ORIGINAL_TRANSPORT"); }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && !this.#cleanupStarted, "UNAVAILABLE");
    this.#same(); await this.#assertOriginal.call(this.#transport); this.#same();
    need(!this.#failed && !this.#released && !this.#cleanupStarted, "UNAVAILABLE");
  }
  #cleanupCurrent(): void { this.#same(); need(!this.#released, "RELEASED"); this.#assertCleanup.call(this.#transport); }
  #fail(error: unknown): void {
    this.#failed = true; this.#outcome.reject(error);
    if (this.#timer !== null) { clearTimeout(this.#timer); this.#timer = null; }
  }
  #send(command: CurrentFootprintCopyTransactionClockCommand): Promise<unknown> {
    this.#cleanupCurrent();
    if (command.method === "Debugger.resume") {
      need(this.#resume === null || this.#resume.observed, "RESUME_PENDING");
      this.#resume = { result: Promise.withResolvers<null>(), observed: false, consumed: false };
      void observe(this.#resume.result.promise);
    }
    this.#sequence += 1;
    const wire = currentFootprintCopyTransactionClockWire(command, this.#sequence, this.#workerSessionId);
    const { id: _localSequence, ...native } = wire.command;
    return this.#request.call(this.#transport, native);
  }
  async #observeResumed(): Promise<void> {
    const resume = this.#resume; need(resume !== null && !resume.consumed, "RESUME_WAITER"); resume.consumed = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const deadline = Promise.withResolvers<never>();
    try {
      timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_COPY_CLOCK_EVENTS_RESUME_DEADLINE")); }, WAIT_MILLISECONDS);
      await Promise.race([resume.result.promise, deadline.promise]); this.#cleanupCurrent();
    } finally { if (timer !== null) { clearTimeout(timer); } }
  }
  #event(raw: unknown): void {
    try {
      this.#cleanupCurrent();
      const captured = captureCurrentPcbStringClockReply(raw);
      const bytes = Buffer.byteLength(captured.text);
      need(this.#events.length < MAX_EVENTS && this.#eventBytes + bytes <= MAX_EVENT_BYTES, "EVENT_BUDGET");
      this.#events.push(captured.value); this.#eventBytes += bytes;
      const event = eventSchema.parse(captured.value);
      need(event.sessionId === this.#workerSessionId && this.#dispatched, "EVENT_OWNER_OR_PHASE");
      if (event.method === "Debugger.resumed") {
        z.object({}).strict().parse(event.params);
        need(this.#resume !== null && !this.#resume.observed && this.#resumeCount < this.#pauseCount, "UNEXPECTED_RESUME");
        this.#resume.observed = true; this.#resumeCount += 1; this.#resume.result.resolve(null); return;
      }
      need(this.#pauseCount < 2 && this.#pauseCount === this.#resumeCount && !this.#cleanupStarted, "UNEXPECTED_PAUSE");
      this.#pauseCount += 1;
      // Keep the actual second pause when it arrives before the first resume's
      // Request acknowledgment. Processing remains serial, event capture does not.
      const previous = this.#tail;
      this.#tail = (async (): Promise<void> => {
        try {
          await previous;
          if (this.#failed) { this.#runner.retainCleanupPause(event.params); return; }
          await this.#runner.observePause(event.params);
          if (this.#pauseCount === 2 && this.#runner.retained().samples.length === 2) {
            const packet = await this.#runner.complete();
            if (this.#timer !== null) { clearTimeout(this.#timer); this.#timer = null; }
            this.#outcome.resolve(packet);
          }
        } catch (error) { this.#fail(error); }
      })();
      void observe(this.#tail);
    } catch (error) { this.#fail(error); }
  }
  public async arm(): Promise<void> {
    need(!this.#arming && !consumed.has(this.#transport) && !this.#cleanupStarted, "ARM_CONSUMED");
    this.#arming = true; consumed.add(this.#transport);
    try {
      await this.#current();
      const unsubscribe = this.#subscribe.call(this.#transport, (event: unknown): void => { this.#event(event); });
      need(typeof unsubscribe === "function", "SUBSCRIPTION"); this.#unsubscribe = unsubscribe;
      await this.#current(); await this.#runner.arm(); this.#armed = true;
    } catch (error) { this.#fail(error); throw error; }
  }
  /** Original copy owner calls only after durable dispatch intent. This records
   * possible mutation even if the subsequent native create request fails. */
  public consumeBeforeCreate(): void {
    need(this.#armed && !this.#dispatched && !this.#failed && !this.#cleanupStarted, "DISPATCH_CONSUMED");
    this.#cleanupCurrent(); this.#runner.consumeBeforeCreate(); this.#dispatched = true;
    this.#timer = setTimeout(() => { this.#fail(new Error("FOOTPRINT_COPY_CLOCK_EVENTS_DEADLINE")); }, WAIT_MILLISECONDS);
  }
  public result(): Promise<CurrentFootprintCopyTransactionClocks> { return this.#outcome.promise; }
  public async requireOriginal(packet: CurrentFootprintCopyTransactionClocks): Promise<void> {
    await this.#current(); await this.#runner.requireOriginal(packet); await this.#current();
  }
  public async cleanup(): Promise<void> {
    need(!this.#cleanupStarted && !this.#released, "CLEANUP_CONSUMED"); this.#cleanupStarted = true;
    if (this.#timer !== null) { clearTimeout(this.#timer); this.#timer = null; }
    await observe(this.#tail);
    if (this.#runner.retained().phase !== "completed") { this.#fail(new Error("FOOTPRINT_COPY_CLOCK_EVENTS_CLEANUP")); }
    const failures: unknown[] = [];
    try { await this.#runner.cleanup(); } catch (error) { failures.push(error); }
    // Keep the subscription if cleanup is still busy or a resume has no event.
    // A consumed failed command remains evidence and cannot be retried.
    if (!this.#runner.retained().busy && (this.#resume === null || this.#resume.observed)) {
      try {
        const unsubscribe = this.#unsubscribe;
        if (unsubscribe !== null) { unsubscribe(); this.#unsubscribe = null; }
        this.#released = true;
      } catch (error) { failures.push(error); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, "FOOTPRINT_COPY_CLOCK_EVENTS_CLEANUP_FAILED"); }
  }
  /** Ends event retention after the native owner actually observes complete
   * termination. It does not repair missing replies or upgrade clock evidence. */
  public async releaseAfterTermination(): Promise<void> {
    need(!this.#released && !this.#terminationObserved && !this.#terminationPending, "TERMINATION_RELEASE_CONSUMED");
    this.#terminationPending = true;
    try {
      this.#same(); await this.#assertOriginalTermination.call(this.#transport); this.#same();
      need(!this.#released, "TERMINATION_RELEASE_CONSUMED"); this.#terminationObserved = true;
      const error = new Error("FOOTPRINT_COPY_CLOCK_EVENTS_ORIGINAL_TERMINATED");
      this.#fail(error); this.#resume?.result.reject(error);
      const unsubscribe = this.#unsubscribe;
      if (unsubscribe !== null) { unsubscribe(); this.#unsubscribe = null; }
      this.#released = true;
    } finally { this.#terminationPending = false; }
  }
  public retained(): Readonly<{ runner: ReturnType<CurrentFootprintCopyTransactionClockRunner["retained"]>;
    events: readonly unknown[]; pauseCount: number; resumeCount: number; failed: boolean; cleanupStarted: boolean;
    released: boolean; originalTerminationObserved: boolean; executionAuthorized: false }> {
    return Object.freeze({ runner: this.#runner.retained(), events: Object.freeze([...this.#events]), pauseCount: this.#pauseCount,
      resumeCount: this.#resumeCount, failed: this.#failed, cleanupStarted: this.#cleanupStarted, released: this.#released,
      originalTerminationObserved: this.#terminationObserved, executionAuthorized: false });
  }
}
