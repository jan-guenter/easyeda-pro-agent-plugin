/** Original construction-bound pre-await allocation observer. Existing native
 * purposes do not mount or reserve this separate ten-command grammar. */
/* oxlint-disable import/max-dependencies -- Keep actual construction/origin issuers and the exact independent grammar explicit. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES as FRAMES, CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_RELATION as RELATION, CURRENT_FOOTPRINT_COPY_ALLOCATION_REQUESTS as REQUESTS,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE as SITE, CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE as WRAPPER,
  decodeCurrentFootprintCopyAllocationPause, validateCurrentFootprintCopyAllocationCommand } from "./current-footprint-copy-allocation-contract.ts";
import type { CurrentFootprintCopyAllocationCommand as Command } from "./current-footprint-copy-allocation-contract.ts";
import { requireCurrentFootprintCopyCreateInvocationLease } from "./current-footprint-copy-create-invocation-lease.ts";
import type { CurrentFootprintCopyCreateInvocationBinding, CurrentFootprintCopyCreateInvocationLease } from "./current-footprint-copy-create-invocation-lease.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner issues both original capabilities; no ownership getter runs during module initialization.
import { requireCurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { requireCurrentFootprintCopyClockRpcConstructionLease } from "./current-pcb-worker-construction-runner.ts";
import { currentFootprintCopyV2NativeCreateArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintCopyClockRpcArrayValue, decodeCurrentFootprintCopyClockRpcArray, decodeCurrentFootprintCopyClockRpcArrayCapture } from "./current-footprint-copy-clock-rpc-protocol.ts";

const empty = z.object({}).strict();
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const allocation = z.object({ breakpointId: handle, actualLocation: point }).strict();
const event = z.object({ sessionId: handle.max(128), method: z.enum(["Debugger.paused", "Debugger.resumed"]), params: z.unknown() }).strict();
const issued = new WeakMap<CurrentFootprintCopyAllocationRunner, CurrentFootprintCopyClockRpcOrigin>();
const consumed = new WeakSet<CurrentFootprintCopyCreateInvocationLease>();
type Phase = "ready" | "armed" | "invocation-consumed" | "held" | "resumed" | "released" | "failed" | "ended";
function need(condition: boolean, reason: string): asserts condition { if (!condition) { throw new Error(`FOOTPRINT_ALLOCATION_${reason}`); } }
export class CurrentFootprintCopyAllocationRunner {
  readonly #token: CurrentFootprintCopyClockRpcOrigin;
  readonly #origin: ReturnType<typeof requireCurrentFootprintCopyClockRpcOrigin>;
  readonly #lease: CurrentFootprintCopyCreateInvocationLease;
  readonly #binding: ReturnType<typeof requireCurrentFootprintCopyCreateInvocationLease>;
  readonly #clock: ReturnType<typeof requireCurrentFootprintCopyClockRpcConstructionLease>;
  readonly #plan: CurrentFootprintCopyV2Plan;
  readonly #argumentJson: string;
  readonly #raw: unknown[] = [];
  #phase: Phase = "ready";
  #busy = false;
  #normal = 0;
  #cleanup = 0;
  #started = 0;
  #point: string | null = null;
  #allocationUncertain = false;
  #removeAttempted = false;
  #removed = false;
  #resumeAttempted = false;
  #resumeObserved = false;
  #releaseAttempted = false;
  #destination: string | null = null;
  #failure: Phase | null = null;
  public constructor(origin: CurrentFootprintCopyClockRpcOrigin, lease: CurrentFootprintCopyCreateInvocationLease, plan: CurrentFootprintCopyV2Plan) {
    this.#token = origin; this.#origin = requireCurrentFootprintCopyClockRpcOrigin(origin);
    this.#lease = lease; this.#binding = requireCurrentFootprintCopyCreateInvocationLease(lease);
    this.#clock = requireCurrentFootprintCopyClockRpcConstructionLease(this.#origin.workerLease); this.#plan = plan;
    const args = currentFootprintCopyV2NativeCreateArguments(plan); this.#argumentJson = JSON.stringify(args.createArgument);
    need(this.#argumentJson.length <= 16_384 && Buffer.byteLength(this.#argumentJson) <= 16_384, "ARGUMENT_OUTPUT_RESERVATION");
    need(this.#binding.clockLease === this.#origin.workerLease && this.#binding.issuer === this.#clock.issuer &&
      this.#binding.projectObjectId === this.#clock.projectObjectId && this.#binding.handles[1] === this.#clock.managerObjectId, "ORIGINAL_CONSTRUCTION");
    this.#same(); issued.set(this, origin);
  }
  #same(): void {
    need(this.#phase !== "failed" && this.#phase !== "ended" && requireCurrentFootprintCopyClockRpcOrigin(this.#token) === this.#origin &&
      requireCurrentFootprintCopyCreateInvocationLease(this.#lease) === this.#binding &&
      requireCurrentFootprintCopyClockRpcConstructionLease(this.#origin.workerLease) === this.#clock, "ORIGINAL_OWNER");
    this.#binding.assertCleanup(); this.#clock.assertCleanup();
    need(this.#started === 0 || performance.now() - this.#started < 300_000, "EXPIRED");
    need(JSON.stringify(currentFootprintCopyV2NativeCreateArguments(this.#plan).createArgument) === this.#argumentJson, "ORIGINAL_PLAN");
  }
  async #current(): Promise<void> {
    this.#same(); await this.#origin.assertOriginal(); this.#same(); await this.#binding.assertOriginal(); this.#same();
  }
  #fail(): void { this.#failure ??= this.#phase; this.#phase = "failed"; this.#origin.fail(); }
  async #step<T>(phase: Phase, action: () => Promise<T>): Promise<T> {
    need(!this.#busy && this.#phase === phase, "PHASE"); this.#same(); this.#busy = true;
    try { return await action(); } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  async #send(command: Command, cleanup = false): Promise<unknown> {
    await this.#current(); need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_LIMIT");
    const value = validateCurrentFootprintCopyAllocationCommand(command);
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
    // Existing original channels still reject every unmounted allocation phase.
    const raw = captureCurrentPcbStringClockReply(await this.#origin.request(value, cleanup));
    this.#raw.push(raw.value); need(Buffer.byteLength(raw.text) <= REQUESTS.replyBytes, "REPLY_BYTES");
    if (command.phase === "allocation-arm") {
      const candidate = z.looseObject({ breakpointId: handle }).safeParse(raw.value);
      if (candidate.success) { this.#point = candidate.data.breakpointId; this.#allocationUncertain = false; }
    }
    await this.#current(); return raw.value;
  }
  public arm(): Promise<void> {
    return this.#step("ready", async () => {
      need(!consumed.has(this.#lease), "ARM_CONSUMED"); consumed.add(this.#lease); this.#started = performance.now(); this.#allocationUncertain = true;
      const value = allocation.parse(await this.#send({ phase: "allocation-arm", method: "Debugger.setBreakpoint", sessionId: this.#origin.workerSessionId,
        params: { location: { scriptId: this.#clock.scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber }, condition: "true" } }));
      need(value.breakpointId === this.#point && value.actualLocation.scriptId === this.#clock.scriptId && value.actualLocation.lineNumber === SITE.lineNumber &&
        value.actualLocation.columnNumber === SITE.columnNumber, "BREAKPOINT_LOCATION"); this.#phase = "armed";
    });
  }
  public consumeBeforeInvocation(): void {
    this.#same(); need(!this.#busy && this.#phase === "armed", "INVOCATION_CONSUMED"); this.#phase = "invocation-consumed";
  }
  async #event(method: "Debugger.paused" | "Debugger.resumed"): Promise<unknown> {
    for (;;) {
      await this.#current(); const next = this.#origin.takeEvent();
      if (next !== null) {
        const raw = captureCurrentPcbStringClockReply(next).value; this.#raw.push(raw); const value = event.parse(raw);
        need(value.sessionId === this.#origin.workerSessionId && value.method === method, "UNEXPECTED_EVENT"); return value.params;
      }
      await this.#origin.pump(false); await this.#current(); await delay(10);
    }
  }
  async #frame(callFrameId: string, expression: typeof FRAMES[keyof typeof FRAMES], count: number): Promise<string> {
    return decodeCurrentFootprintCopyClockRpcArrayCapture(await this.#send({ phase: "allocation-frame", method: "Debugger.evaluateOnCallFrame",
      sessionId: this.#origin.workerSessionId, params: { callFrameId, expression, objectGroup: GROUP, silent: true, returnByValue: false,
        generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }), count);
  }
  /** After the observed resume, the first clock push remains queued for the
   * separate collector. It cannot be swallowed as allocation cleanup. */
  public collectAndResume(): Promise<void> {
    return this.#step("invocation-consumed", async () => {
      this.#binding.requireInvocationConsumed(); need(this.#point !== null, "POINT");
      const pause = decodeCurrentFootprintCopyAllocationPause(await this.#event("Debugger.paused"), this.#clock.scriptId, this.#point);
      this.#binding.requireInvocationConsumed();
      const build = await this.#frame(pause.buildFrameId, FRAMES.build, 5);
      const create = await this.#frame(pause.createFrameId, FRAMES.create, 2);
      const wrapper = await this.#frame(pause.wrapperFrameId, FRAMES.wrapper, 10);
      const source = z.object({ scriptSource: z.string().max(REQUESTS.wrapperSourceBytes) }).strict().parse(await this.#send({ phase: "allocation-source",
        method: "Debugger.getScriptSource", sessionId: this.#origin.workerSessionId, params: { scriptId: pause.wrapperScriptId } }));
      need(source.scriptSource === WRAPPER && Buffer.byteLength(source.scriptSource) <= REQUESTS.wrapperSourceBytes, "WRAPPER_SOURCE");
      const id = decodeCurrentFootprintCopyClockRpcArrayCapture(await this.#send({ phase: "allocation-join", method: "Runtime.callFunctionOn", sessionId: this.#origin.workerSessionId,
        params: { objectId: this.#binding.projectObjectId, functionDeclaration: RELATION, arguments: [...this.#binding.handles, build, create, wrapper].map(objectId => ({ objectId })),
          objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } }), 2);
      const result = decodeCurrentFootprintCopyClockRpcArray(await this.#send({ phase: "allocation-properties", method: "Runtime.getProperties", sessionId: this.#origin.workerSessionId,
        params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), 2);
      const destination = currentFootprintCopyClockRpcArrayValue(result, 0), json = currentFootprintCopyClockRpcArrayValue(result, 1);
      need(typeof destination === "string" && /^[a-f\d]{16}$/u.test(destination) && json === this.#argumentJson && destination !== this.#plan.source.footprintUuid, "ORIGINAL_ARGUMENT");
      this.#destination = destination; this.#phase = "held"; this.#binding.requireInvocationConsumed();
      this.#removeAttempted = true; empty.parse(await this.#send({ phase: "allocation-remove", method: "Debugger.removeBreakpoint", sessionId: this.#origin.workerSessionId, params: { breakpointId: this.#point } }, true)); this.#removed = true;
      this.#resumeAttempted = true; empty.parse(await this.#send({ phase: "allocation-resume", method: "Debugger.resume", sessionId: this.#origin.workerSessionId, params: {} }, true));
      empty.parse(await this.#event("Debugger.resumed")); this.#resumeObserved = true; this.#phase = "resumed";
    });
  }
  public release(): Promise<void> {
    return this.#step("resumed", async () => {
      need(!this.#releaseAttempted && this.#removed && this.#resumeObserved, "RELEASE_CONSUMED"); this.#releaseAttempted = true;
      empty.parse(await this.#send({ phase: "allocation-release", method: "Runtime.releaseObjectGroup", sessionId: this.#origin.workerSessionId, params: { objectGroup: GROUP } }, true));
      need(this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup, "INCOMPLETE"); this.#phase = "released";
    });
  }
  public requireForOrigin(origin: CurrentFootprintCopyClockRpcOrigin): void { this.#same(); need(origin === this.#token && issued.get(this) === origin, "ORIGINAL_ORIGIN"); }
  public requireForCopyPlan(origin: CurrentFootprintCopyClockRpcOrigin, plan: CurrentFootprintCopyV2Plan,
    binding: CurrentFootprintCopyCreateInvocationBinding): void {
    this.#same(); need(origin === this.#token && issued.get(this) === origin && this.#plan === plan && this.#binding === binding &&
      this.#phase === "armed", "ORIGINAL_COPY_PLAN");
  }
  public async requireDestination(origin: CurrentFootprintCopyClockRpcOrigin): Promise<string> {
    this.requireForOrigin(origin); need(!this.#busy && (this.#phase === "resumed" || this.#phase === "released") && this.#destination !== null, "DESTINATION_NOT_ISSUED");
    await this.#current(); this.requireForOrigin(origin); this.#binding.requireInvocationConsumed(); return this.#destination;
  }
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#busy && this.#phase !== "ended", "GENERATION_END_CONSUMED"); await this.#origin.assertOriginalGenerationExited(); this.#phase = "ended";
  }
  public diagnostics(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, allocationUncertain: this.#allocationUncertain,
      removeAttempted: this.#removeAttempted, removed: this.#removed, resumeAttempted: this.#resumeAttempted, resumeObserved: this.#resumeObserved,
      releaseAttempted: this.#releaseAttempted, firstFailure: this.#failure, rawEvidenceSha256: sha256Json(this.#raw), executionAuthorized: false });
  }
}
/* oxlint-disable typescript/unbound-method -- Call only the original private-field receiver; own-property methods cannot issue allocation custody. */
const originalOrigin = CurrentFootprintCopyAllocationRunner.prototype.requireForOrigin;
const originalCopy = CurrentFootprintCopyAllocationRunner.prototype.requireForCopyPlan;
const originalDestination = CurrentFootprintCopyAllocationRunner.prototype.requireDestination;
/* oxlint-enable typescript/unbound-method */

export function requireCurrentFootprintCopyAllocationCopyPlan(runner: CurrentFootprintCopyAllocationRunner,
  origin: CurrentFootprintCopyClockRpcOrigin, plan: CurrentFootprintCopyV2Plan, binding: CurrentFootprintCopyCreateInvocationBinding): void {
  originalCopy.call(runner, origin, plan, binding);
}
export function requireCurrentFootprintCopyAllocationOrigin(runner: CurrentFootprintCopyAllocationRunner, origin: CurrentFootprintCopyClockRpcOrigin): void {
  need(issued.get(runner) === origin, "ORIGINAL_RUNNER"); originalOrigin.call(runner, origin);
}
export async function requireCurrentFootprintCopyAllocatedDestination(runner: CurrentFootprintCopyAllocationRunner, origin: CurrentFootprintCopyClockRpcOrigin): Promise<string> {
  requireCurrentFootprintCopyAllocationOrigin(runner, origin); const result = await originalDestination.call(runner, origin);
  requireCurrentFootprintCopyAllocationOrigin(runner, origin); return result;
}
