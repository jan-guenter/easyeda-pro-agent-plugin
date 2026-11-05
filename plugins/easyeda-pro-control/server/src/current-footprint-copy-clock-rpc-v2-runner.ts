/** Unmounted mixed-origin observer. Genuine worker/registration references and
 * fixed transport methods are retained, but no native owner, allocation or whole
 * budget is authenticated here. No create, clock or task method is invoked. */
/* oxlint-disable import/max-dependencies -- Compose the original two lease issuers, source/metadata decoders and one fixed request/event grammar. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { types } from "node:util";
import { requireCurrentFootprintCopyClockRpcConstructionLease } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "./current-footprint-copy-clock-rpc-leases.ts";
import { requireCurrentFootprintCopyClockRpcV2RegistrationRetention } from "./current-footprint-copy-clock-registration-v2-runner.ts";
import type { CurrentFootprintCopyClockRpcV2RegistrationRetention, CurrentFootprintCopyClockRpcV2Transport } from "./current-footprint-copy-clock-rpc-v2-retention.ts";
import { requireCurrentFootprintCopyClockRegistrationV2Source } from "./current-footprint-copy-clock-registration-v2-source.ts";
import { decodeCurrentFootprintCopyClockRegistrationScope } from "./current-footprint-copy-clock-registration-contract.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Function } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES as SITES } from "./current-footprint-copy-clock-rpc-v2-profile.ts";
import { requireCurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcV2Site as Site } from "./current-footprint-copy-clock-rpc-v2-profile.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as CALLS } from "./current-footprint-copy-clock-rpc-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_UI_CALLER as UI_CALLER,
  currentFootprintCopyClockRpcV2Condition, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture,
  decodeCurrentFootprintCopyClockRpcV2Function, decodeCurrentFootprintCopyClockRpcV2Pause, currentFootprintCopyClockRpcV2ArrayObject as objectAt,
  requireCurrentFootprintCopyClockRpcV2Description, validateCurrentFootprintCopyClockRpcV2Command, currentFootprintCopyClockRpcV2ArrayValue as valueAt } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentFootprintCopyClockRpcV2Command as Command } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

interface Point { readonly role: Site; readonly sessionId: string; readonly id: string; removeAttempted: boolean; removed: boolean }
interface Pause { readonly role: Site; readonly sessionId: string; readonly frameId: string; readonly callerId: string | null; resumed: boolean; resumeAttempted: boolean }
interface Request { readonly packet: string; readonly replyTopic: string; readonly id: number; value: number | null; offset: number | null }
const sampleSchema = z.object({ ordinal: z.union([z.literal(1), z.literal(2)]), producer: z.enum(["buildString", "canvasString"]),
    documentUuid: z.string().regex(/^[a-f\d]{16}$/u), updateTime: z.number().int().positive().max(8_640_000_000_000_000),
    lexicalOffset: z.number().int().refine(value => !Object.is(value, -0)), replyTopicSha256: z.string().regex(/^[a-f\d]{64}$/u) }).strict();
export const currentFootprintCopyClockRpcV2ObservationSchema = z.object({ profile: z.literal("private.current-footprint-clock-rpc-observation.v2"),
  samples: z.array(sampleSchema).length(2),
  distinctOriginalRequestsAndPendingTasksObserved: z.literal(true), originalShiftAndSelectedServiceTaskJoined: z.literal(true),
  originalCallbackResultAndPostAwaitValueMatched: z.literal(true), allTenResumesObserved: z.literal(true), allAllocatedBreakpointsRemoved: z.literal(true),
  temporaryGroupsReleased: z.literal(false), nativeBroadcastSenderHandleAuthenticated: z.literal(false), backendClockOrSqlCompletionVerified: z.literal(false),
  nativeCreateCompletionVerified: z.literal(false), originalUiNativeOwnerJoined: z.literal(false), nativeBudgetReserved: z.literal(false), nativeMounted: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintCopyClockRpcV2Observation = Readonly<z.infer<typeof currentFootprintCopyClockRpcV2ObservationSchema>>;
type Phase = "ready" | "arming" | "armed" | "invocation-consumed" | "collected" | "failed";
type ArrayFields = ReturnType<typeof decodeCurrentFootprintCopyClockRpcV2Array>;
const consumed = new WeakSet<object>(), packets = new WeakMap<CurrentFootprintCopyClockRpcV2Observation, CurrentFootprintCopyClockRpcV2Runner>();
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const busUuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const empty = z.object({}).strict();
const sourcePoint = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const allocated = z.object({ breakpointId: handle, actualLocation: sourcePoint }).strict();
const event = z.object({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle.max(128), params: z.unknown() }).strict();
const bindingSchema = z.object({ workerSessionId: handle.max(128), documentUuid: z.string().regex(/^[a-f\d]{16}$/u) }).strict();
type Stage = "arm" | "consume" | "worker" | "ui" | "push" | "dispatch" | "result" | "reply" | "producer" | "frame" | "properties" | "callback-metadata" | "callback-scope" | "events" | "resume" | "remove" | "release" | "retire" | "generation-exit";
interface ReplyDigest { readonly sha256: string; readonly jsonBytes: number }
interface Failure { readonly phase: Phase; readonly stage: Stage; readonly requestIndex: number | null; readonly reply: ReplyDigest | null;
  readonly normal: number; readonly cleanup: number; readonly replies: number; readonly digestEncoding: "canonical-json-utf8"; readonly executionAuthorized: false }
function methods(transport: CurrentFootprintCopyClockRpcV2Transport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === 8, "TRANSPORT");
  return ["assertOriginal", "assertCleanup", "assertOriginalGenerationExited", "request", "pump", "takeEvent", "fail", "retire"].map(key => {
    const entry = Object.getOwnPropertyDescriptor(transport, key); need(entry !== undefined && Object.hasOwn(entry, "value") && entry.enumerable === true && typeof entry.value === "function", "TRANSPORT_METHOD"); return entry.value as unknown;
  });
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_CLOCK_RPC_V2_${code}`); } }
function number(value: string | number): number { need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0), "NUMBER"); return value; }
function string(value: string | number): string { need(typeof value === "string", "STRING"); return value; }
export class CurrentFootprintCopyClockRpcV2Runner {
  readonly #workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly #retention: CurrentFootprintCopyClockRpcV2RegistrationRetention;
  readonly #transport: CurrentFootprintCopyClockRpcV2Transport;
  readonly #methods: readonly unknown[];
  readonly #binding: Readonly<z.infer<typeof bindingSchema>>;
  readonly #worker: ReturnType<typeof requireCurrentFootprintCopyClockRpcConstructionLease>;
  readonly #ui: ReturnType<typeof requireCurrentFootprintCopyClockRpcV2RegistrationRetention>;
  readonly #points: Point[] = [];
  readonly #pauses: Pause[] = [];
  readonly #raw: unknown[] = [];
  readonly #requests: Request[] = [];
  readonly #samples: CurrentFootprintCopyClockRpcV2Observation["samples"][number][] = [];
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
  #retirementSettlementAttempted = false;
  #started = 0;
  #uncertainAllocation = false;
  #unknownPause = false;
  #resuming: Pause | null = null;
  #cleanupAttempted = false;
  #retired = false;
  #packet: CurrentFootprintCopyClockRpcV2Observation | null = null;
  #stage: Stage = "arm";
  #attemptIndex: number | null = null;
  #attemptReply: ReplyDigest | null = null;
  #failureNotificationFailed = false;
  #firstFailure: Failure | null = null;
  /** Internal data-only composition. Genuine source/runner tokens are retained,
   * but this constructor and its transport shape authenticate no native owner. */
  public constructor(workerLease: CurrentFootprintCopyClockRpcConstructionLease, registration: CurrentFootprintCopyClockRpcV2RegistrationRetention,
    transport: CurrentFootprintCopyClockRpcV2Transport, binding: Readonly<z.infer<typeof bindingSchema>>) {
    this.#workerLease = workerLease; this.#retention = registration;
    this.#worker = requireCurrentFootprintCopyClockRpcConstructionLease(workerLease);
    this.#ui = requireCurrentFootprintCopyClockRpcV2RegistrationRetention(registration);
    this.#transport = transport; this.#methods = methods(transport);
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
    need(this.#binding.workerSessionId !== this.#ui.sessionId, "REALMS"); this.#same();
  }
  #attempt(stage: Stage): void { this.#stage = stage; this.#attemptIndex = null; this.#attemptReply = null; }
  #begin(): void {
    need(!this.#busy && !this.#ending && !this.#generationEnded, "OPERATION_BUSY");
    this.#busy = true; this.#idle = Promise.withResolvers<null>();
  }
  #end(): void { this.#busy = false; this.#idle?.resolve(null); }
  #same(cleanup = false): void {
    need(!this.#retired && requireCurrentFootprintCopyClockRpcConstructionLease(this.#workerLease) === this.#worker &&
      requireCurrentFootprintCopyClockRpcV2RegistrationRetention(this.#retention) === this.#ui && methods(this.#transport).every((value, index) => value === this.#methods[index]), "ORIGINAL_REFERENCES");
    this.#worker.assertCleanup(); this.#ui.assertCleanup();
    requireCurrentFootprintCopyClockRpcSource(this.#worker.qualifiedSource, "worker");
    requireCurrentFootprintCopyClockRegistrationV2Source(this.#ui.wrapperSource, "wrapper");
    requireCurrentFootprintCopyClockRegistrationV2Source(this.#ui.callbackSource, "callback");
    need(this.#ui.wrapperScriptId !== this.#ui.callbackScriptId && this.#ui.wrapperObjectId !== this.#ui.callbackObjectId, "SOURCE_ROLES");
    need(cleanup || this.#phase !== "failed" && !this.#cleanupAttempted && (this.#started === 0 || performance.now() - this.#started < 300_000), "FAILED_OR_EXPIRED");
  }
  /** Recheck both original issuers around every transport await. Cleanup never
   * evaluates project getters and cannot turn these references into an owner. */
  async #current(cleanup = false): Promise<void> {
    this.#same(cleanup); await (cleanup ? this.#transport.assertCleanup() : this.#transport.assertOriginal()); this.#same(cleanup);
    // Each runner independently rechecks its original references. The private
    // Transport shape alone cannot prove a kernel/channel generation.
    if (!cleanup) {
      await this.#worker.assertOriginal(); this.#same(); await this.#ui.assertOriginal(); this.#same();
    }
  }
  #fail(): void {
    this.#firstFailure ??= Object.freeze({ phase: this.#phase, stage: this.#stage, requestIndex: this.#attemptIndex, reply: this.#attemptReply,
      normal: this.#normal, cleanup: this.#cleanup, replies: this.#raw.length, digestEncoding: "canonical-json-utf8", executionAuthorized: false });
    this.#phase = "failed"; try { this.#transport.fail(); } catch { this.#failureNotificationFailed = true; }
  }
  #session(role: Site): string { return SITES[role].realm === "worker" ? this.#binding.workerSessionId : this.#ui.sessionId; }
  #script(role: Site): string { return SITES[role].realm === "worker" ? this.#worker.scriptId : this.#ui.wrapperScriptId; }
  #drain(): void {
    for (let index = 0; index < 24; index += 1) {
      const next = this.#transport.takeEvent(); if (next === null) { return; }
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
          this.#pauses.push({ role, sessionId: selected.sessionId, ...decodeCurrentFootprintCopyClockRpcV2Pause(selected.params, role, this.#script(role), breakpoint.id, ordinal), resumed: false, resumeAttempted: false });
        } catch (error) { this.#unknownPause = true; throw error; }
      }
    }
    throw new Error("FOOTPRINT_CLOCK_RPC_V2_EVENT_BOUND");
  }
  /** Consume a fixed request before dispatch; capture its complete bounded
   * reply before reproof, retaining ambiguous allocations for generation exit. */
  async #send(input: Command, cleanup = false, allocationRole?: Site): Promise<unknown> {
    this.#attemptIndex = null; this.#attemptReply = null;
    await this.#current(cleanup); this.#drain(); need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_BOUND");
    const command = validateCurrentFootprintCopyClockRpcV2Command(input);
    need(Buffer.byteLength(JSON.stringify(command)) <= 65_536, "COMMAND_BYTES");
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
    if (allocationRole !== undefined) { this.#uncertainAllocation = true; }
    this.#attemptIndex = this.#normal + this.#cleanup;
    const raw = captureCurrentPcbStringClockReply(await this.#transport.request(command, cleanup)).value; this.#raw.push(raw);
    const encoded = canonicalJson(raw); this.#attemptReply = Object.freeze({ sha256: sha256Text(encoded), jsonBytes: Buffer.byteLength(encoded) });
    if (allocationRole !== undefined) {
      const candidate = z.looseObject({ breakpointId: handle }).safeParse(raw);
      if (candidate.success && !this.#points.some(value => value.id === candidate.data.breakpointId && value.sessionId === command.sessionId)) {
        this.#points.push({ role: allocationRole, sessionId: command.sessionId, id: candidate.data.breakpointId, removed: false, removeAttempted: false }); this.#uncertainAllocation = false;
      }
    }
    await this.#current(cleanup); this.#drain(); return raw;
  }
  async #wait(predicate: () => boolean): Promise<void> {
    this.#attempt("events");
    while (!predicate()) { await this.#current(); this.#drain(); if (predicate()) { return; }
      await this.#transport.pump(false); await this.#current(); this.#drain(); if (!predicate()) { await delay(10); } }
  }
  #properties(sessionId: string, objectId: string, stage: "properties" | "callback-metadata" | "callback-scope" = "properties"): Promise<unknown> {
    this.#attempt(stage); return this.#send({ phase: "rpc-properties", method: "Runtime.getProperties", sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #call(role: keyof typeof CALLS, sessionId: string, objectId: string, args: readonly unknown[], count: number): Promise<Readonly<{ id: string; values: ArrayFields }>> {
    this.#attempt(role); const id = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: `rpc-${role}`, method: "Runtime.callFunctionOn", sessionId,
      params: { ...FLAGS, objectId, functionDeclaration: CALLS[role].program, arguments: args, returnByValue: false } }), count);
    return Object.freeze({ id, values: decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties(sessionId, id), count) });
  }
  async #frame(pause: Pause, expression: string, count: number, caller = false): Promise<string> {
    this.#attempt("frame"); const callFrameId = caller ? pause.callerId : pause.frameId; need(callFrameId !== null, "CALLER_FRAME");
    return decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "rpc-frame", method: "Debugger.evaluateOnCallFrame", sessionId: pause.sessionId,
      params: { callFrameId, expression, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }), count);
  }
  /** Retain original worker methods and UI bus, then allocate six exact sites.
   * A relocated acknowledgment fails while its original breakpoint is retained. */
  public async arm(): Promise<void> {
    need(!this.#busy && !this.#ending && this.#phase === "ready" && !consumed.has(this.#retention), "ARM_CONSUMED"); consumed.add(this.#retention); this.#begin(); this.#phase = "arming"; this.#attempt("arm"); this.#started = performance.now();
    try {
      const worker = await this.#call("worker", this.#binding.workerSessionId, this.#worker.dependencyBundleObjectId,
        [this.#worker.projectObjectId, this.#worker.managerObjectId, this.#worker.lexicalBundleObjectId].map(objectId => ({ objectId })), 16);
      this.#workerBundle = worker.id; this.#workerUuid = busUuid.parse(valueAt(worker.values, 12));
      for (const [role, index] of [["push", 6], ["dispatch", 7], ["reply", 8]] as const) {
        requireCurrentFootprintCopyClockRpcV2Description(worker.values.get(String(index))?.description, role);
        decodeCurrentFootprintCopyClockRpcV2Function(await this.#properties(this.#binding.workerSessionId, objectAt(worker.values, index)), role, this.#worker.scriptId);
      }
      const ui = await this.#call("ui", this.#ui.sessionId, this.#ui.registrationArrayObjectId, [{ objectId: this.#ui.bindingsArrayObjectId }], 10);
      this.#uiBundle = ui.id; this.#uiUuid = busUuid.parse(valueAt(ui.values, 8));
      need(this.#uiUuid !== this.#workerUuid, "BUS_UUIDS");
      for (const role of ["push", "dispatch", "result", "reply", "buildString", "canvasString"] as const) {
        this.#attempt("arm"); const site = SITES[role]; const scriptId = this.#script(role); const sessionId = this.#session(role);
        const raw = await this.#send({ phase: "rpc-arm", role, method: "Debugger.setBreakpoint", sessionId, params: {
          location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, condition: currentFootprintCopyClockRpcV2Condition(role, site.realm === "worker" ? this.#workerUuid : this.#uiUuid),
        } }, false, role);
        const actual = allocated.parse(raw); need(actual.breakpointId === this.#points.at(-1)?.id && actual.actualLocation.scriptId === scriptId &&
          actual.actualLocation.lineNumber === site.lineNumber && actual.actualLocation.columnNumber === site.columnNumber, "ALLOCATION_LOCATION");
      }
      need(this.#normal === 13 && this.#points.length === 6, "ARM_COUNT"); this.#phase = "armed";
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  /** One-way observation handoff only. The caller's original native invocation
   * remains outside this unmounted observer; this method dispatches nothing. */
  public consumeBeforeInvocation(): void { this.#attempt("consume"); this.#same(); need(!this.#busy && this.#phase === "armed" && !this.#ending, "INVOCATION_CONSUMED"); this.#phase = "invocation-consumed"; }
  /** Join the selected preload wrapper/caller to the distinct ws-service
   * callback's fresh Ji/Jd scope, original pending request and producer value. */
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
      const metadata = decodeCurrentFootprintCopyClockRegistrationV2Function(await this.#properties(pause.sessionId, this.#ui.callbackObjectId, "callback-metadata"), "callback", this.#ui.callbackScriptId);
      const scope = decodeCurrentFootprintCopyClockRegistrationScope(await this.#properties(pause.sessionId, metadata.scopesId, "callback-scope"), "callback");
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
    const documentUuid = this.#binding.documentUuid; this.#attempt("producer"); await this.#current();
    const result = await this.#call("producer", pause.sessionId, frame, [{ objectId: request.packet }, { value: { documentUuid, value: request.value } }, { value: ordinal }], 5);
    need(valueAt(result.values, 2) === documentUuid && valueAt(result.values, 3) === request.value && valueAt(result.values, 4) === ordinal, "CONSUMED_RESULT");
    this.#samples.push(Object.freeze({ ordinal, producer: role, documentUuid, updateTime: request.value, lexicalOffset: request.offset, replyTopicSha256: sha256Text(request.replyTopic) }));
  }
  async #remove(point: Point): Promise<void> {
    if (point.removed) { return; } this.#attempt("remove"); need(!point.removeAttempted, "REMOVE_CONSUMED"); point.removeAttempted = true;
    empty.parse(await this.#send({ phase: "rpc-remove", method: "Debugger.removeBreakpoint", sessionId: point.sessionId, params: { breakpointId: point.id } }, true)); point.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    this.#attempt("resume"); need(!pause.resumeAttempted && !pause.resumed && this.#resuming === null, "RESUME_CONSUMED"); pause.resumeAttempted = true; this.#resuming = pause;
    empty.parse(await this.#send({ phase: "rpc-resume", method: "Debugger.resume", sessionId: pause.sessionId, params: {} }, true)); await this.#wait(() => pause.resumed);
  }
  /** Observe both original request/reply continuations in fixed order. Every
   * resumed event and removal is required before the data packet is issued. */
  public async collect(): Promise<CurrentFootprintCopyClockRpcV2Observation> {
    need(!this.#busy && !this.#ending && this.#phase === "invocation-consumed" && this.#packet === null, "COLLECT_CONSUMED"); this.#begin();
    try {
      for (const [index, role] of ORDER.entries()) {
        await this.#wait(() => this.#pauses[index] !== undefined); const pause = this.#pauses[index]; const point = this.#points.find(value => value.role === role);
        need(pause?.role === role && point !== undefined, "PAUSE_ORDER"); const ordinal = index < 5 ? 1 : 2;
        await this.#capture(pause, ordinal); if (ordinal === 2 || role === "buildString") { await this.#remove(point); } await this.#resume(pause);
      }
      need(this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup - 2 && this.#samples.length === 2 &&
        this.#points.every(value => value.removed) && this.#pauses.every(value => value.resumed) && !this.#uncertainAllocation && !this.#unknownPause, "INCOMPLETE");
      this.#packet = freezeDeep(currentFootprintCopyClockRpcV2ObservationSchema.parse({ profile: "private.current-footprint-clock-rpc-observation.v2", samples: [...this.#samples],
        distinctOriginalRequestsAndPendingTasksObserved: true, originalShiftAndSelectedServiceTaskJoined: true, originalCallbackResultAndPostAwaitValueMatched: true,
        allTenResumesObserved: true, allAllocatedBreakpointsRemoved: true, temporaryGroupsReleased: false, nativeBroadcastSenderHandleAuthenticated: false,
        backendClockOrSqlCompletionVerified: false, nativeCreateCompletionVerified: false, originalUiNativeOwnerJoined: false, nativeBudgetReserved: false, nativeMounted: false, executionAuthorized: false }));
      packets.set(this.#packet, this); this.#phase = "collected"; return this.#packet;
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  public async requireOriginal(packet: CurrentFootprintCopyClockRpcV2Observation): Promise<void> {
    this.#attempt("events"); need(packet === this.#packet && packets.get(packet) === this && this.#phase === "collected", "ORIGINAL_PACKET"); await this.#current();
  }
  /** Release only retained breakpoints and temporary groups after known resumes.
   * Unknown pauses, failed sends and uncertain allocations require original exit. */
  public async cleanup(): Promise<void> {
    need(!this.#busy && !this.#ending && !this.#cleanupAttempted, "CLEANUP_CONSUMED");
    need(this.#phase !== "failed" && !this.#unknownPause && !this.#uncertainAllocation && this.#resuming === null && this.#pauses.every(value => value.resumed), "GENERATION_CLOSURE_REQUIRED");
    this.#cleanupAttempted = true; this.#begin();
    try {
      for (const point of this.#points) { await this.#remove(point); }
      for (const sessionId of [this.#binding.workerSessionId, this.#ui.sessionId]) {
        this.#attempt("release"); need(!this.#groupAttempts.has(sessionId), "GROUP_CONSUMED"); this.#groupAttempts.add(sessionId);
        empty.parse(await this.#send({ phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } }, true)); this.#groupsReleased.add(sessionId);
      }
      this.#drain(); this.#attempt("retire"); await this.#transport.retire();
      // Retirement can deliver a final event while its acknowledgment waits.
      // Reprove original custody and settle that event before publishing idle.
      await this.#current(true); this.#drain(); this.#retired = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#end(); }
  }
  /** Join the retained transport's original exit proof and pending operation
   * before one retirement settlement. No timer or close request proves exit. */
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#retired && !this.#ending && (!this.#generationEnded || !this.#retirementSettlementAttempted), "GENERATION_CLOSURE_CONSUMED");
    // An actual exit can consume native retirement before its acknowledgment
    // Arrives. Permit one bounded original-origin settlement; its retained
    // Channel settles that consumed retirement locally without another send.
    if (this.#generationEnded) { this.#retirementSettlementAttempted = true; }
    this.#attempt("generation-exit"); this.#ending = true; const idle = this.#idle;
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      // A failed proof leaves the original operation and its waits intact.
      // The native origin rejects pending allocations only AFTER actual root
      // And whole-Job exit. No timeout or close acknowledgement substitutes.
      await this.#transport.assertOriginalGenerationExited(); this.#generationEnded = true; this.#fail();
      const deadline = Promise.withResolvers<never>();
      timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_CLOCK_RPC_V2_ORIGINAL_IDLE_DEADLINE")); }, 300_000);
      await Promise.race([idle?.promise ?? Promise.resolve(null), deadline.promise]);
      need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED");
      if (!this.#retired) { await this.#transport.retire(); this.#retired = true; }
    } finally { if (timer !== null) { clearTimeout(timer); } this.#ending = false; }
  }
  public diagnostics(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, originalUiNativeOwnerJoined: false, nativeBudgetReserved: false, nativeMounted: false, normalRequests: this.#normal, cleanupRequests: this.#cleanup, replies: this.#raw.length,
      pauses: this.#pauses.length, resumes: this.#pauses.filter(value => value.resumed).length, removed: this.#points.filter(value => value.removed).length,
      uncertainAllocation: this.#uncertainAllocation, unknownPause: this.#unknownPause, groupReleaseAttempts: this.#groupAttempts.size, groupsReleased: this.#groupsReleased.size,
      retired: this.#retired, originalGenerationEnded: this.#generationEnded, retirementSettlementAttempted: this.#retirementSettlementAttempted,
      endingOriginalGeneration: this.#ending, failureNotificationFailed: this.#failureNotificationFailed, firstFailure: this.#firstFailure, rawEvidenceSha256: sha256Json(this.#raw), executionAuthorized: false });
  }
  /** Private immutable reply evidence only; no public schema exposes CDP handles. */
  public retained(): Readonly<{ replies: readonly unknown[]; failure: Failure | null }> {
    return Object.freeze({ replies: Object.freeze([...this.#raw]), failure: this.#firstFailure });
  }
}
// oxlint-disable-next-line typescript/unbound-method -- Call the captured method only on its original private-field issuer.
const originalObservation = CurrentFootprintCopyClockRpcV2Runner.prototype.requireOriginal;

/** Requires the original data packet and retained runner. This validates no
 * native owner or channel because the source-only composition is unmounted. */
export async function requireCurrentFootprintCopyClockRpcV2Observation(packet: CurrentFootprintCopyClockRpcV2Observation): Promise<void> {
  const runner = packets.get(packet); need(runner !== undefined, "ORIGINAL_PACKET");
  await originalObservation.call(runner, packet); need(packets.get(packet) === runner, "ORIGINAL_PACKET");
}
