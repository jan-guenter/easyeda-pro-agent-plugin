/** Original worker transaction collector. The enclosing copy owner journals and
 * dispatches native create exactly once between consumeBeforeCreate and the two
 * routed pauses. This class has no create, qe, Save or process-termination call. */
import { types } from "node:util";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION as RELATION,
  CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES,
  currentFootprintCopyTransactionClockAllocatedId, currentFootprintCopyTransactionClockHandle,
  decodeCurrentFootprintCopyTransactionClockAllocation, decodeCurrentFootprintCopyTransactionClockCapture,
  decodeCurrentFootprintCopyTransactionClockPause, decodeCurrentFootprintCopyTransactionClockValue,
  requireCurrentFootprintCopyTransactionClockEmpty } from "./current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand, CurrentFootprintCopyTransactionClockRole } from "./current-footprint-copy-transaction-clock.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintCopyTransactionClockTransport {
  readonly scriptId: string;
  readonly managerObjectId: string;
  readonly lexicalBundleObjectId: string;
  /** Reprove the original worker, exact producer bundle, method owners and copy
   * generation. This must not dispatch into the worker while it is paused. */
  readonly assertOriginal: () => Promise<void>;
  /** Must retain the same original channel after a normal qualification failure. */
  readonly assertCleanup: () => void;
  readonly request: (command: CurrentFootprintCopyTransactionClockCommand) => Promise<unknown>;
  /** The owner's event subscription must already be armed before resume dispatch. */
  readonly observeResumed: () => Promise<void>;
}
export interface CurrentFootprintCopyTransactionClockSample {
  readonly role: CurrentFootprintCopyTransactionClockRole;
  readonly ordinal: 1 | 2;
  readonly documentUuid: string;
  readonly updateTime: number;
  readonly pauseSha256: string;
  readonly captureReplySha256: string;
  readonly relationReplySha256: string;
}
export interface CurrentFootprintCopyTransactionClocks {
  readonly profile: "private.current-footprint-copy-transaction-clocks.v1";
  readonly samples: readonly [CurrentFootprintCopyTransactionClockSample, CurrentFootprintCopyTransactionClockSample];
  readonly originalCollectorIssued: true;
  readonly distinctNativeContinuationResultsObserved: true;
  readonly originalReceiverAndQeIdentityCompared: true;
  readonly allAllocatedBreakpointsRemoved: true;
  readonly bothResumesObserved: true;
  readonly temporaryObjectGroupReleased: true;
  readonly nativeCreateCompletionVerified: false;
  readonly transitiveClockRpcProvenanceVerified: false;
  readonly backendClockWindowVerified: false;
  readonly executionAuthorized: false;
}
type Phase = "ready" | "arming" | "armed" | "dispatched" | "completed" | "failed";
interface Breakpoint { readonly id: string; removalAttempted: boolean; removed: boolean }
interface Paused { readonly index: number; resumeAttempted: boolean; resumed: boolean }
const consumedTransports = new WeakSet<CurrentFootprintCopyTransactionClockTransport>();
const names = ["scriptId", "managerObjectId", "lexicalBundleObjectId", "assertOriginal", "assertCleanup", "request", "observeResumed"] as const;
function need(condition: boolean, reason: string): asserts condition { if (!condition) { throw new Error(`FOOTPRINT_COPY_TRANSACTION_CLOCK_${reason}`); } }
function members(value: CurrentFootprintCopyTransactionClockTransport): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === names.length, "TRANSPORT");
  return names.map((name, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 3 ? "string" : "function"), "TRANSPORT");
    if (index < 3) { currentFootprintCopyTransactionClockHandle(descriptor.value as unknown); }
    return descriptor.value as unknown;
  });
}
export class CurrentFootprintCopyTransactionClockRunner {
  readonly #transport: CurrentFootprintCopyTransactionClockTransport;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentFootprintCopyTransactionClockTransport["request"];
  readonly #assertOriginal: CurrentFootprintCopyTransactionClockTransport["assertOriginal"];
  readonly #assertCleanup: CurrentFootprintCopyTransactionClockTransport["assertCleanup"];
  readonly #observeResumed: CurrentFootprintCopyTransactionClockTransport["observeResumed"];
  readonly #scriptId: string;
  readonly #managerObjectId: string;
  readonly #lexicalBundleObjectId: string;
  readonly #breakpoints: Breakpoint[] = [];
  readonly #raw: unknown[] = [];
  readonly #samples: CurrentFootprintCopyTransactionClockSample[] = [];
  #phase: Phase = "ready";
  #busy = false;
  #requests = 0;
  #dispatched = false;
  #paused: Paused | null = null;
  #groupAttempted = false;
  #groupReleased = false;
  #packet: CurrentFootprintCopyTransactionClocks | null = null;
  public constructor(transport: CurrentFootprintCopyTransactionClockTransport) {
    this.#methods = members(transport); this.#transport = transport;
    this.#request = transport.request; this.#assertOriginal = transport.assertOriginal; this.#assertCleanup = transport.assertCleanup;
    this.#observeResumed = transport.observeResumed; this.#scriptId = transport.scriptId;
    this.#managerObjectId = transport.managerObjectId; this.#lexicalBundleObjectId = transport.lexicalBundleObjectId;
  }
  #same(): void { need(members(this.#transport).every((item, index) => item === this.#methods[index]), "ORIGINAL_TRANSPORT"); }
  async #current(): Promise<void> {
    this.#same(); await this.#assertOriginal.call(this.#transport); this.#same();
  }
  async #send(command: CurrentFootprintCopyTransactionClockCommand, cleanup = false): Promise<ReturnType<typeof captureCurrentPcbStringClockReply>> {
    this.#same();
    if (cleanup) { this.#assertCleanup.call(this.#transport); } else { await this.#current(); }
    need(this.#requests < REQUESTS, "REQUEST_BUDGET"); this.#requests += 1;
    const raw = captureCurrentPcbStringClockReply(await this.#request.call(this.#transport, command));
    // Preserve every delivered reply before an awaited owner check can fail.
    this.#raw.push(raw.value);
    this.#same(); if (cleanup) { this.#assertCleanup.call(this.#transport); } else { await this.#current(); }
    return raw;
  }
  async #step<T>(action: () => Promise<T>): Promise<T> {
    need(!this.#busy, "BUSY"); this.#busy = true;
    try { return await action(); } catch (error) { this.#phase = "failed"; throw error; }
    finally { this.#busy = false; }
  }
  public async arm(): Promise<void> {
    need(this.#phase === "ready" && !consumedTransports.has(this.#transport), "ARM_CONSUMED");
    consumedTransports.add(this.#transport); this.#phase = "arming";
    await this.#step(async () => {
      for (const [index, site] of SITES.entries()) {
        // Allocation is special: retain the returned handle before post-await
        // Owner checks and even when V8 relocated the requested breakpoint.
        await this.#current(); need(this.#requests < REQUESTS, "REQUEST_BUDGET"); this.#requests += 1;
        const raw = captureCurrentPcbStringClockReply(await this.#request.call(this.#transport, { method: "Debugger.setBreakpoint",
          params: { location: { scriptId: this.#scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }));
        this.#raw.push(raw.value);
        const id = currentFootprintCopyTransactionClockAllocatedId(raw.value);
        if (id !== null && !this.#breakpoints.some(item => item.id === id)) { this.#breakpoints.push({ id, removalAttempted: false, removed: false }); }
        await this.#current();
        need(this.#breakpoints.length === index + 1 && id === decodeCurrentFootprintCopyTransactionClockAllocation(raw.value, this.#scriptId, index), "BREAKPOINT");
      }
      this.#phase = "armed";
    });
  }
  /** Called synchronously by the original owner after durable intent and before
   * native dispatch. Any subsequent failure is potentially mutating, including
   * failure before the first qe continuation. It never authorizes dispatch. */
  public consumeBeforeCreate(): void {
    need(this.#phase === "armed" && !this.#busy && !this.#dispatched, "CREATE_CONSUMED");
    this.#same(); this.#assertCleanup.call(this.#transport); this.#dispatched = true; this.#phase = "dispatched";
  }
  async #remove(point: Breakpoint): Promise<void> {
    if (point.removed) { return; } need(!point.removalAttempted, "REMOVE_CONSUMED"); point.removalAttempted = true;
    const reply = await this.#send({ method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true);
    requireCurrentFootprintCopyTransactionClockEmpty(reply.value);
    point.removed = true;
  }
  async #resume(paused: Paused): Promise<void> {
    if (paused.resumed) { return; } need(!paused.resumeAttempted, "RESUME_CONSUMED"); paused.resumeAttempted = true;
    const reply = await this.#send({ method: "Debugger.resume", params: {} }, true);
    requireCurrentFootprintCopyTransactionClockEmpty(reply.value);
    await this.#observeResumed.call(this.#transport); this.#same(); this.#assertCleanup.call(this.#transport); paused.resumed = true;
  }
  /** The owner's existing event dispatcher supplies each original pause once.
   * An unrelated pause is retained and refused without resuming that pause. */
  public observePause(input: unknown): Promise<CurrentFootprintCopyTransactionClockSample> {
    need(this.#phase === "dispatched" && this.#samples.length < 2 && !this.#busy, "PAUSE_ORDER");
    return this.#step(async () => {
      const pause = captureCurrentPcbStringClockReply(input); this.#raw.push(pause.value);
      const index = this.#samples.length, point = this.#breakpoints[index], site = SITES[index];
      need(site !== undefined && point !== undefined, "PAUSE_SITE");
      const callFrameId = decodeCurrentFootprintCopyTransactionClockPause(pause.value, this.#scriptId, index, point.id);
      const paused: Paused = { index, resumeAttempted: false, resumed: false }; this.#paused = paused;
      await this.#current();
      const captured = await this.#send({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: site.expression,
        objectGroup: GROUP, returnByValue: false, silent: true, throwOnSideEffect: true, generatePreview: false, includeCommandLineAPI: false } });
      const sampleId = decodeCurrentFootprintCopyTransactionClockCapture(captured.value);
      const related = await this.#send({ method: "Runtime.callFunctionOn", params: { objectId: this.#managerObjectId,
        functionDeclaration: RELATION, arguments: [{ objectId: sampleId }, { objectId: this.#lexicalBundleObjectId }],
        objectGroup: GROUP, returnByValue: true, silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } });
      const value = decodeCurrentFootprintCopyTransactionClockValue(related.value);
      const first = this.#samples[0];
      need(first === undefined || first.documentUuid === value.documentUuid, "DESTINATION_CHANGED");
      const sample: CurrentFootprintCopyTransactionClockSample = Object.freeze({ role: site.role, ordinal: index === 0 ? 1 : 2, ...value,
        pauseSha256: pause.sha256, captureReplySha256: captured.sha256, relationReplySha256: related.sha256 });
      await this.#remove(point); await this.#resume(paused); await this.#current();
      this.#samples.push(sample); return sample;
    });
  }
  async #release(): Promise<void> {
    if (this.#groupReleased) { return; } need(!this.#groupAttempted, "RELEASE_CONSUMED"); this.#groupAttempted = true;
    const reply = await this.#send({ method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true);
    requireCurrentFootprintCopyTransactionClockEmpty(reply.value);
    this.#groupReleased = true;
  }
  public complete(): Promise<CurrentFootprintCopyTransactionClocks> {
    need(this.#phase === "dispatched" && this.#samples.length === 2, "INCOMPLETE");
    return this.#step(async () => {
      await this.#current(); await this.#release(); await this.#current();
      const first = this.#samples[0], second = this.#samples[1]; need(first !== undefined && second !== undefined, "INCOMPLETE");
      this.#packet = freezeDeep({ profile: "private.current-footprint-copy-transaction-clocks.v1", samples: [first, second],
        originalCollectorIssued: true, distinctNativeContinuationResultsObserved: true, originalReceiverAndQeIdentityCompared: true,
        allAllocatedBreakpointsRemoved: true, bothResumesObserved: true, temporaryObjectGroupReleased: true,
        nativeCreateCompletionVerified: false, transitiveClockRpcProvenanceVerified: false, backendClockWindowVerified: false, executionAuthorized: false });
      this.#phase = "completed"; return this.#packet;
    });
  }
  /** Uses only retained allocations/original channel. Missing acknowledgments
   * consume their command; cleanup never retries a possibly delivered resume. */
  public async cleanup(): Promise<void> {
    need(!this.#busy, "BUSY");
    if (this.#phase !== "completed") { this.#phase = "failed"; }
    await this.#step(async () => {
      const failures: unknown[] = [];
      for (const point of this.#breakpoints) {
        try { await this.#remove(point); } catch (error) { failures.push(error); }
      }
      if (this.#paused !== null) {
        try { await this.#resume(this.#paused); } catch (error) { failures.push(error); }
      }
      try { await this.#release(); } catch (error) { failures.push(error); }
      if (failures.length > 0) { throw new AggregateError(failures, "FOOTPRINT_COPY_TRANSACTION_CLOCK_CLEANUP"); }
    });
  }
  public async requireOriginal(packet: CurrentFootprintCopyTransactionClocks): Promise<void> {
    need(this.#phase === "completed" && !this.#busy && packet === this.#packet, "ORIGINAL_PACKET");
    try { await this.#current(); } catch (error) { this.#phase = "failed"; throw error; }
  }
  public retained(): Readonly<{ phase: Phase; requests: number; mutationMayHaveOccurred: boolean; busy: boolean;
    rawRepliesAndPauses: readonly unknown[]; samples: readonly CurrentFootprintCopyTransactionClockSample[];
    allocatedBreakpoints: number; removedBreakpoints: number; resumeAttempted: boolean; resumeObserved: boolean;
    groupReleaseAttempted: boolean; groupReleased: boolean; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, requests: this.#requests, mutationMayHaveOccurred: this.#dispatched, busy: this.#busy,
      rawRepliesAndPauses: Object.freeze([...this.#raw]), samples: Object.freeze([...this.#samples]),
      allocatedBreakpoints: this.#breakpoints.length, removedBreakpoints: this.#breakpoints.filter(item => item.removed).length,
      resumeAttempted: this.#paused?.resumeAttempted ?? false, resumeObserved: this.#paused?.resumed ?? false,
      groupReleaseAttempted: this.#groupAttempted, groupReleased: this.#groupReleased, executionAuthorized: false });
  }
}
