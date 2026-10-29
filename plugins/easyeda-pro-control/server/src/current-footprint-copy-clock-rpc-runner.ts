/** Unmounted original renderer sequencer. It observes the native create's own
 * two RPCs; it never invokes create, a clock, a task or a backend method. */
/* oxlint-disable import/max-dependencies -- Compose the original two lease issuers, source/metadata decoders and one fixed request/event grammar. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { requireCurrentFootprintCopyClockRpcConstructionLease } from "./current-pcb-worker-construction-runner.ts";
import { requireCurrentFootprintCopyClockRpcRegistrationLease } from "./current-footprint-copy-clock-registration-runner.ts";
import { decodeCurrentFootprintCopyClockRegistrationFunction, decodeCurrentFootprintCopyClockRegistrationScope } from "./current-footprint-copy-clock-registration-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as SITES, requireCurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcSite as Site } from "./current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP as GROUP } from "./current-footprint-copy-clock-rpc-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_UI_CALLER as UI_CALLER,
  currentFootprintCopyClockRpcCondition, decodeCurrentFootprintCopyClockRpcArray, decodeCurrentFootprintCopyClockRpcArrayCapture,
  decodeCurrentFootprintCopyClockRpcFunction, decodeCurrentFootprintCopyClockRpcPause, currentFootprintCopyClockRpcArrayObject as objectAt,
  requireCurrentFootprintCopyClockRpcDescription, validateCurrentFootprintCopyClockRpcCommand, currentFootprintCopyClockRpcArrayValue as valueAt } from "./current-footprint-copy-clock-rpc-protocol.ts";
import type { CurrentFootprintCopyClockRpcCommand as Command } from "./current-footprint-copy-clock-rpc-protocol.ts";

interface Point { readonly role: Site; readonly sessionId: string; readonly id: string; removeAttempted: boolean; removed: boolean }
interface Pause { readonly role: Site; readonly sessionId: string; readonly frameId: string; readonly callerId: string | null; resumed: boolean; resumeAttempted: boolean }
interface Request { readonly packet: string; readonly replyTopic: string; readonly id: number; value: number | null; offset: number | null }
export interface CurrentFootprintCopyClockRpcObservation {
  readonly profile: "private.current-footprint-clock-rpc-observation.v1";
  readonly samples: readonly Readonly<{ ordinal: 1 | 2; producer: "buildString" | "canvasString"; documentUuid: string; updateTime: number; lexicalOffset: number; replyTopicSha256: string }>[];
  readonly distinctOriginalRequestsAndPendingTasksObserved: true;
  readonly originalShiftAndSelectedServiceTaskJoined: true;
  readonly originalCallbackResultAndPostAwaitValueMatched: true;
  readonly allTenResumesObserved: true;
  readonly allAllocatedBreakpointsRemoved: true;
  readonly temporaryGroupsReleased: false;
  readonly nativeBroadcastSenderHandleAuthenticated: false;
  readonly backendClockOrSqlCompletionVerified: false;
  readonly nativeCreateCompletionVerified: false;
  readonly executionAuthorized: false;
}
type Phase = "ready" | "arming" | "armed" | "invocation-consumed" | "collected" | "failed";
type ArrayFields = ReturnType<typeof decodeCurrentFootprintCopyClockRpcArray>;
const consumed = new WeakSet<object>(), packets = new WeakMap<CurrentFootprintCopyClockRpcObservation, CurrentFootprintCopyClockRpcRunner>();
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const busUuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const empty = z.object({}).strict();
const sourcePoint = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const allocated = z.object({ breakpointId: handle, actualLocation: sourcePoint }).strict();
const event = z.object({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle.max(128), params: z.unknown() }).strict();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_CLOCK_RPC_${code}`); } }
function number(value: string | number): number { need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0), "NUMBER"); return value; }
function string(value: string | number): string { need(typeof value === "string", "STRING"); return value; }
export class CurrentFootprintCopyClockRpcRunner {
  readonly #token: CurrentFootprintCopyClockRpcOrigin;
  readonly #origin: ReturnType<typeof requireCurrentFootprintCopyClockRpcOrigin>;
  readonly #worker: ReturnType<typeof requireCurrentFootprintCopyClockRpcConstructionLease>;
  readonly #ui: ReturnType<typeof requireCurrentFootprintCopyClockRpcRegistrationLease>;
  readonly #documentUuid: string;
  readonly #points: Point[] = [];
  readonly #pauses: Pause[] = [];
  readonly #raw: unknown[] = [];
  readonly #requests: Request[] = [];
  readonly #samples: CurrentFootprintCopyClockRpcObservation["samples"][number][] = [];
  readonly #groupAttempts = new Set<string>();
  readonly #groupsReleased = new Set<string>();
  #workerBundle: string | null = null;
  #uiBundle: string | null = null;
  #previousUiResult: string | null = null;
  #workerUuid: string | null = null;
  #uiUuid: string | null = null;
  #phase: Phase = "ready";
  #normal = 0;
  #cleanup = 0;
  #busy = false;
  #idle: PromiseWithResolvers<null> | null = null;
  #ending = false;
  #generationEnded = false;
  #started = 0;
  #uncertainAllocation = false;
  #unknownPause = false;
  #resuming: Pause | null = null;
  #cleanupAttempted = false;
  #retired = false;
  #packet: CurrentFootprintCopyClockRpcObservation | null = null;
  #firstFailure: Readonly<{ phase: Phase; normal: number; cleanup: number; replies: number }> | null = null;
  public constructor(origin: CurrentFootprintCopyClockRpcOrigin, documentUuid: string) {
    this.#origin = requireCurrentFootprintCopyClockRpcOrigin(origin); this.#token = origin;
    this.#worker = requireCurrentFootprintCopyClockRpcConstructionLease(this.#origin.workerLease);
    this.#ui = requireCurrentFootprintCopyClockRpcRegistrationLease(this.#origin.registrationLease);
    this.#documentUuid = z.string().regex(/^[a-f\d]{16}$/u).parse(documentUuid);
    need(handle.max(128).safeParse(this.#origin.workerSessionId).success && this.#origin.workerSessionId !== this.#ui.sessionId, "REALMS");
    this.#same();
  }
  #begin(): void {
    need(!this.#busy && !this.#ending && !this.#generationEnded, "OPERATION_BUSY");
    this.#busy = true; this.#idle = Promise.withResolvers<null>();
  }
  #end(): void { this.#busy = false; this.#idle?.resolve(null); }
  #same(cleanup = false): void {
    need(!this.#retired && requireCurrentFootprintCopyClockRpcOrigin(this.#token) === this.#origin &&
      requireCurrentFootprintCopyClockRpcConstructionLease(this.#origin.workerLease) === this.#worker &&
      requireCurrentFootprintCopyClockRpcRegistrationLease(this.#origin.registrationLease) === this.#ui, "ORIGINAL_OWNER");
    this.#worker.assertCleanup(); this.#ui.assertCleanup();
    requireCurrentFootprintCopyClockRpcSource(this.#worker.qualifiedSource, "worker"); requireCurrentFootprintCopyClockRpcSource(this.#ui.qualifiedSource, "ui");
    need(cleanup || this.#phase !== "failed" && !this.#cleanupAttempted && (this.#started === 0 || performance.now() - this.#started < 300_000), "FAILED_OR_EXPIRED");
  }
  async #current(cleanup = false): Promise<void> {
    this.#same(cleanup); await (cleanup ? this.#origin.assertCleanup() : this.#origin.assertOriginal()); this.#same(cleanup);
    // The native origin proves its kernel/channel generation. Each original
    // Runner independently retains its own issued preparation and transport.
    if (!cleanup) {
      await this.#worker.assertOriginal(); this.#same(); await this.#ui.assertOriginal(); this.#same();
    }
  }
  #fail(): void { this.#origin.fail(); this.#firstFailure ??= Object.freeze({ phase: this.#phase, normal: this.#normal, cleanup: this.#cleanup, replies: this.#raw.length }); this.#phase = "failed"; }
  #session(role: Site): string { return SITES[role].realm === "worker" ? this.#origin.workerSessionId : this.#ui.sessionId; }
  #script(role: Site): string { return SITES[role].realm === "worker" ? this.#worker.scriptId : this.#ui.scriptId; }
  #drain(): void {
    for (let index = 0; index < 24; index += 1) {
      const next = this.#origin.takeEvent(); if (next === null) { return; }
      const raw = captureCurrentPcbStringClockReply(next).value; this.#raw.push(raw); const selected = event.parse(raw);
      if (selected.method === "Debugger.resumed") {
        const pause = this.#resuming; need(pause !== null && pause.sessionId === selected.sessionId && !pause.resumed && pause.resumeAttempted, "UNEXPECTED_RESUME");
        empty.parse(selected.params); pause.resumed = true; this.#resuming = null;
      } else {
        try {
          const role = ORDER[this.#pauses.length]; const previous = this.#pauses.at(-1); const breakpoint = this.#points.find(value => value.role === role);
          need(this.#phase === "invocation-consumed" && role !== undefined && breakpoint !== undefined && selected.sessionId === this.#session(role) &&
            (previous === undefined || previous.resumed), "UNEXPECTED_PAUSE");
          const ordinal = this.#pauses.length < 5 ? 1 : 2;
          this.#pauses.push({ role, sessionId: selected.sessionId, ...decodeCurrentFootprintCopyClockRpcPause(selected.params, role, this.#script(role), breakpoint.id, ordinal), resumed: false, resumeAttempted: false });
        } catch (error) { this.#unknownPause = true; throw error; }
      }
    }
    throw new Error("FOOTPRINT_CLOCK_RPC_EVENT_BOUND");
  }
  async #send(input: Command, cleanup = false, allocationRole?: Site): Promise<unknown> {
    await this.#current(cleanup); this.#drain(); need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_BOUND");
    const command = validateCurrentFootprintCopyClockRpcCommand(input);
    need(Buffer.byteLength(JSON.stringify(command)) <= 65_536, "COMMAND_BYTES");
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
    if (allocationRole !== undefined) { this.#uncertainAllocation = true; }
    const raw = captureCurrentPcbStringClockReply(await this.#origin.request(command, cleanup)).value; this.#raw.push(raw);
    if (allocationRole !== undefined) {
      const candidate = z.looseObject({ breakpointId: handle }).safeParse(raw);
      if (candidate.success && !this.#points.some(value => value.id === candidate.data.breakpointId && value.sessionId === command.sessionId)) {
        this.#points.push({ role: allocationRole, sessionId: command.sessionId, id: candidate.data.breakpointId, removed: false, removeAttempted: false }); this.#uncertainAllocation = false;
      }
    }
    await this.#current(cleanup); this.#drain(); return raw;
  }
  async #wait(predicate: () => boolean): Promise<void> {
    while (!predicate()) { await this.#current(); this.#drain(); if (predicate()) { return; }
      await this.#origin.pump(false); await this.#current(); this.#drain(); if (!predicate()) { await delay(10); } }
  }
  #properties(sessionId: string, objectId: string): Promise<unknown> {
    return this.#send({ phase: "rpc-properties", method: "Runtime.getProperties", sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #call(role: keyof typeof CALLS, sessionId: string, objectId: string, args: readonly unknown[], count: number): Promise<Readonly<{ id: string; values: ArrayFields }>> {
    const id = decodeCurrentFootprintCopyClockRpcArrayCapture(await this.#send({ phase: `rpc-${role}`, method: "Runtime.callFunctionOn", sessionId,
      params: { ...FLAGS, objectId, functionDeclaration: CALLS[role].program, arguments: args, returnByValue: false } }), count);
    return Object.freeze({ id, values: decodeCurrentFootprintCopyClockRpcArray(await this.#properties(sessionId, id), count) });
  }
  async #frame(pause: Pause, expression: string, count: number, caller = false): Promise<string> {
    const callFrameId = caller ? pause.callerId : pause.frameId; need(callFrameId !== null, "CALLER_FRAME");
    return decodeCurrentFootprintCopyClockRpcArrayCapture(await this.#send({ phase: "rpc-frame", method: "Debugger.evaluateOnCallFrame", sessionId: pause.sessionId,
      params: { callFrameId, expression, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }), count);
  }
  public async arm(): Promise<void> {
    need(!this.#busy && !this.#ending && this.#phase === "ready" && !consumed.has(this.#token), "ARM_CONSUMED"); consumed.add(this.#token); this.#begin(); this.#phase = "arming"; this.#started = performance.now();
    try {
      const worker = await this.#call("worker", this.#origin.workerSessionId, this.#worker.dependencyBundleObjectId,
        [this.#worker.projectObjectId, this.#worker.managerObjectId, this.#worker.lexicalBundleObjectId].map(objectId => ({ objectId })), 16);
      this.#workerBundle = worker.id; this.#workerUuid = busUuid.parse(valueAt(worker.values, 12));
      for (const [role, index] of [["push", 6], ["dispatch", 7], ["reply", 8]] as const) {
        requireCurrentFootprintCopyClockRpcDescription(worker.values.get(String(index))?.description, role);
        decodeCurrentFootprintCopyClockRpcFunction(await this.#properties(this.#origin.workerSessionId, objectAt(worker.values, index)), role, this.#worker.scriptId);
      }
      const ui = await this.#call("ui", this.#ui.sessionId, this.#ui.registrationArrayObjectId, [{ objectId: this.#ui.bindingsArrayObjectId }], 10);
      this.#uiBundle = ui.id; this.#uiUuid = busUuid.parse(valueAt(ui.values, 8));
      need(this.#uiUuid !== this.#workerUuid, "BUS_UUIDS");
      for (const role of ["push", "dispatch", "result", "reply", "buildString", "canvasString"] as const) {
        const site = SITES[role]; const scriptId = this.#script(role); const sessionId = this.#session(role);
        const raw = await this.#send({ phase: "rpc-arm", role, method: "Debugger.setBreakpoint", sessionId, params: {
          location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, condition: currentFootprintCopyClockRpcCondition(role, site.realm === "worker" ? this.#workerUuid : this.#uiUuid),
        } }, false, role);
        const actual = allocated.parse(raw); need(actual.breakpointId === this.#points.at(-1)?.id && actual.actualLocation.scriptId === scriptId &&
          actual.actualLocation.lineNumber === site.lineNumber && actual.actualLocation.columnNumber === site.columnNumber, "ALLOCATION_LOCATION");
      }
      need(this.#normal === 13 && this.#points.length === 6, "ARM_COUNT"); this.#phase = "armed";
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  public consumeBeforeInvocation(): void { this.#same(); need(!this.#busy && this.#phase === "armed" && !this.#ending, "INVOCATION_CONSUMED"); this.#phase = "invocation-consumed"; }
  async #capture(pause: Pause, ordinal: 1 | 2): Promise<void> {
    const role = pause.role; need(this.#workerBundle !== null && this.#uiBundle !== null && this.#workerUuid !== null && this.#uiUuid !== null, "SETUP");
    const count = { push: 4, dispatch: 7, result: 8, reply: 6, buildString: 4, canvasString: 4 }[role];
    const frame = await this.#frame(pause, SITES[role].expression, count);
    if (role === "push") {
      const previous = this.#requests.at(-1)?.packet ?? this.#workerBundle;
      const result = await this.#call("push", pause.sessionId, frame, [{ objectId: this.#workerBundle }, { objectId: previous }, { value: ordinal }], 9);
      const selected = { packet: result.id, replyTopic: string(valueAt(result.values, 7)), id: number(valueAt(result.values, 8)), value: null, offset: null };
      need(this.#requests.length === ordinal - 1 && !this.#requests.some(value => value.replyTopic === selected.replyTopic || value.id === selected.id), "DISTINCT_REQUEST");
      this.#requests.push(selected); return;
    }
    const request = this.#requests[ordinal - 1]; need(request !== undefined, "REQUEST_REQUIRED");
    if (role === "dispatch") {
      const result = await this.#call("dispatch", pause.sessionId, frame, [{ objectId: request.packet }, { value: this.#uiUuid }], 4);
      need(valueAt(result.values, 1) === this.#workerUuid && valueAt(result.values, 2) === this.#uiUuid && valueAt(result.values, 3) === request.id, "SELECTED_RESPONDER"); return;
    }
    if (role === "result") {
      const caller = await this.#frame(pause, UI_CALLER, 8, true);
      const metadata = decodeCurrentFootprintCopyClockRegistrationFunction(await this.#properties(pause.sessionId, this.#ui.callbackObjectId), "callback", this.#ui.scriptId);
      const scope = decodeCurrentFootprintCopyClockRegistrationScope(await this.#properties(pause.sessionId, metadata.scopesId), "callback");
      const result = await this.#call("result", pause.sessionId, frame, [{ objectId: this.#uiBundle }, { objectId: caller }, { objectId: scope }, { objectId: this.#previousUiResult ?? this.#uiBundle },
        { value: { replyTopic: request.replyTopic, workerUuid: this.#workerUuid, uiUuid: this.#uiUuid, requestId: request.id, ordinal } }], 8);
      request.value = number(valueAt(result.values, 3)); request.offset = number(valueAt(result.values, 4));
      need(request.value > 0 && request.value <= 8_640_000_000_000_000 && valueAt(result.values, 5) === request.replyTopic &&
        valueAt(result.values, 6) === this.#workerUuid && valueAt(result.values, 7) === request.id, "ACTUAL_RESULT"); this.#previousUiResult = result.id; return;
    }
    need(request.value !== null && request.offset !== null, "RESULT_REQUIRED");
    if (role === "reply") {
      const result = await this.#call("reply", pause.sessionId, frame, [{ objectId: request.packet }, { value: { uiUuid: this.#uiUuid, value: request.value } }], 4);
      need(valueAt(result.values, 3) === request.value, "PENDING_REPLY_RESULT"); return;
    }
    const result = await this.#call("producer", pause.sessionId, frame, [{ objectId: request.packet }, { value: { documentUuid: this.#documentUuid, value: request.value } }, { value: ordinal }], 5);
    need(valueAt(result.values, 2) === this.#documentUuid && valueAt(result.values, 3) === request.value && valueAt(result.values, 4) === ordinal, "CONSUMED_RESULT");
    this.#samples.push(Object.freeze({ ordinal, producer: role, documentUuid: this.#documentUuid, updateTime: request.value, lexicalOffset: request.offset, replyTopicSha256: sha256Text(request.replyTopic) }));
  }
  async #remove(point: Point): Promise<void> {
    if (point.removed) { return; } need(!point.removeAttempted, "REMOVE_CONSUMED"); point.removeAttempted = true;
    empty.parse(await this.#send({ phase: "rpc-remove", method: "Debugger.removeBreakpoint", sessionId: point.sessionId, params: { breakpointId: point.id } }, true)); point.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    need(!pause.resumeAttempted && !pause.resumed && this.#resuming === null, "RESUME_CONSUMED"); pause.resumeAttempted = true; this.#resuming = pause;
    empty.parse(await this.#send({ phase: "rpc-resume", method: "Debugger.resume", sessionId: pause.sessionId, params: {} }, true)); await this.#wait(() => pause.resumed);
  }
  public async collect(): Promise<CurrentFootprintCopyClockRpcObservation> {
    need(!this.#busy && !this.#ending && this.#phase === "invocation-consumed" && this.#packet === null, "COLLECT_CONSUMED"); this.#begin();
    try {
      for (const [index, role] of ORDER.entries()) {
        await this.#wait(() => this.#pauses[index] !== undefined); const pause = this.#pauses[index]; const point = this.#points.find(value => value.role === role);
        need(pause?.role === role && point !== undefined, "PAUSE_ORDER"); const ordinal = index < 5 ? 1 : 2;
        await this.#capture(pause, ordinal); if (ordinal === 2 || role === "buildString") { await this.#remove(point); } await this.#resume(pause);
      }
      need(this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup - 2 && this.#samples.length === 2 &&
        this.#points.every(value => value.removed) && this.#pauses.every(value => value.resumed) && !this.#uncertainAllocation && !this.#unknownPause, "INCOMPLETE");
      this.#packet = freezeDeep({ profile: "private.current-footprint-clock-rpc-observation.v1", samples: [...this.#samples],
        distinctOriginalRequestsAndPendingTasksObserved: true, originalShiftAndSelectedServiceTaskJoined: true, originalCallbackResultAndPostAwaitValueMatched: true,
        allTenResumesObserved: true, allAllocatedBreakpointsRemoved: true, temporaryGroupsReleased: false, nativeBroadcastSenderHandleAuthenticated: false,
        backendClockOrSqlCompletionVerified: false, nativeCreateCompletionVerified: false, executionAuthorized: false });
      packets.set(this.#packet, this); this.#phase = "collected"; return this.#packet;
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  public async requireOriginal(packet: CurrentFootprintCopyClockRpcObservation): Promise<void> {
    need(packet === this.#packet && packets.get(packet) === this && this.#phase === "collected", "ORIGINAL_PACKET"); await this.#current();
  }
  public async cleanup(): Promise<void> {
    need(!this.#busy && !this.#ending && !this.#cleanupAttempted, "CLEANUP_CONSUMED");
    need(this.#phase !== "failed" && !this.#unknownPause && !this.#uncertainAllocation && this.#resuming === null && this.#pauses.every(value => value.resumed), "GENERATION_CLOSURE_REQUIRED");
    this.#cleanupAttempted = true; this.#begin();
    try {
      for (const point of this.#points) { await this.#remove(point); }
      for (const sessionId of [this.#origin.workerSessionId, this.#ui.sessionId]) {
        need(!this.#groupAttempts.has(sessionId), "GROUP_CONSUMED"); this.#groupAttempts.add(sessionId);
        empty.parse(await this.#send({ phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } }, true)); this.#groupsReleased.add(sessionId);
      }
      this.#drain(); await this.#origin.retire(); this.#retired = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#retired && !this.#ending && !this.#generationEnded, "GENERATION_CLOSURE_CONSUMED");
    this.#ending = true; const idle = this.#idle;
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      // A failed proof leaves the original operation and its waits intact.
      // The native origin rejects pending allocations only AFTER actual root
      // And whole-Job exit. No timeout or close acknowledgement substitutes.
      await this.#origin.assertOriginalGenerationExited(); this.#generationEnded = true; this.#fail();
      const deadline = Promise.withResolvers<never>();
      timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_CLOCK_RPC_ORIGINAL_IDLE_DEADLINE")); }, 300_000);
      await Promise.race([idle?.promise ?? Promise.resolve(null), deadline.promise]);
      need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED");
      if (!this.#retired) { await this.#origin.retire(); this.#retired = true; }
    } finally { if (timer !== null) { clearTimeout(timer); } this.#ending = false; }
  }
  public diagnostics(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, replies: this.#raw.length,
      pauses: this.#pauses.length, resumes: this.#pauses.filter(value => value.resumed).length, removed: this.#points.filter(value => value.removed).length,
      uncertainAllocation: this.#uncertainAllocation, unknownPause: this.#unknownPause, groupReleaseAttempts: this.#groupAttempts.size, groupsReleased: this.#groupsReleased.size,
      retired: this.#retired, originalGenerationEnded: this.#generationEnded, endingOriginalGeneration: this.#ending, firstFailure: this.#firstFailure, rawEvidenceSha256: sha256Json(this.#raw), executionAuthorized: false });
  }
}
