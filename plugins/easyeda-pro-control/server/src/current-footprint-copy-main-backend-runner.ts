/** One original-main startup continuation and construction capture. This runner
 * never opens a project, invokes an application callback, samples a clock or
 * grants a writer. The native transport retains root/Job/socket ownership. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL_PATTERN, decodeCurrentFootprintCopyMainBackendArray,
  decodeCurrentFootprintCopyMainBackendFunction, decodeCurrentFootprintCopyMainBackendNative, validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION as EXPRESSION,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP as GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE, captureCurrentFootprintCopyMainBackendSourceReply,
  qualifyCurrentFootprintCopyMainBackendSource, requireCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendSource as QualifiedSource, CurrentFootprintCopyMainBackendRole as Role } from "./current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE } from "./current-footprint-copy-main-transport-contract.ts";

export interface CurrentFootprintCopyMainBackendTransport {
  readonly assertCurrent: () => Promise<void>;
  readonly send: (command: Command, id: number) => Promise<void>;
  /** Canonical base64 chunks of NUL-separated UTF-8 inspector messages. */
  readonly poll: (cleanup: boolean) => Promise<string>;
}
export const currentFootprintCopyMainBackendObservationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-main-backend-construction.v1"),
  originalMainTransportRetained: z.literal(true), runtimeAppSourceQualified: z.literal(true),
  runtimeAppSourceSha256: z.literal(SOURCE.sha256), initialContinuationCount: z.union([z.literal(0), z.literal(1)]),
  registrationBreakpointArmedBeforeInitialContinuation: z.literal(true), actualRegistrationLocationVerified: z.literal(true),
  originalProtocolCallbackAndBackendRetained: z.literal(true), originalDriverCallbackAndRouterRetained: z.literal(true),
  originalActorClockAndSqlFunctionsRetained: z.literal(true), originalNativeDateNowRetained: z.literal(true),
  protocolRegistrationObserved: z.literal(false), requestContextRetained: z.literal(false), actualActorClockInvocationObserved: z.literal(false),
  projectSqlInvocationObserved: z.literal(false), responderExclusivityProven: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintCopyMainBackendObservation = Readonly<z.infer<typeof currentFootprintCopyMainBackendObservationSchema>>;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: handle, location });
const registrationId = z.literal(REGISTRATION_ID);
const pauseSchema = z.looseObject({ reason: z.string().max(128), callFrames: z.array(frame).min(1).max(64), hitBreakpoints: z.array(registrationId).max(1).optional() });
const empty = z.object({}).strict();
const objectReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string().max(32), objectId: handle }).strict() }).strict();
interface Pause { readonly frameId: string; readonly location: z.infer<typeof location>; readonly registration: boolean; resumeAttempted: boolean; resumed: boolean }
interface Resolved { readonly breakpointId: string; readonly location: z.infer<typeof location> }
interface RegistrationLocationFailure {
  readonly lineNumber: number;
  readonly columnNumber: number;
  readonly scriptObserved: boolean;
}
const methodNames = ["assertCurrent", "send", "poll"] as const;
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_MAIN_CONSTRUCTION_${detail}`); } }
function methods(transport: CurrentFootprintCopyMainBackendTransport): readonly unknown[] {
  need(!types.isProxy(transport) && Object.isFrozen(transport) && Object.getPrototypeOf(transport) === Object.prototype && Reflect.ownKeys(transport).length === methodNames.length, "TRANSPORT");
  return methodNames.map(name => { const entry = Object.getOwnPropertyDescriptor(transport, name); need(entry !== undefined && Object.hasOwn(entry, "value") && typeof entry.value === "function", "TRANSPORT"); return entry.value as unknown; });
}
const issued = new WeakMap<CurrentFootprintCopyMainBackendObservation, CurrentFootprintCopyMainBackendRunner>();
export class CurrentFootprintCopyMainBackendRunner {
  readonly #transport: CurrentFootprintCopyMainBackendTransport;
  readonly #methods: readonly unknown[];
  readonly #decoder = new TextDecoder("utf-8", { fatal: true });
  readonly #scripts = new Map<string, number>();
  readonly #resolved: Resolved[] = [];
  readonly #replies: unknown[] = [];
  #text = "";
  #attempted = false;
  #busy = false;
  #failed = false;
  #releaseAttempted = false;
  #released = false;
  #started = 0;
  #requests = 0;
  #events = 0;
  #received = 0;
  #pendingId: number | null = null;
  #reply: unknown = null;
  #replySeen = false;
  #breakpoint: string | null = null;
  #removeAttempted = false;
  #removed = false;
  #pause: Pause | null = null;
  #initialContinuationCount: 0 | 1 = 0;
  #registrationSeen = false;
  #source: QualifiedSource | null = null;
  #appScriptId: string | null = null;
  #sourceArray: string | null = null;
  #retainedArray: string | null = null;
  #packet: CurrentFootprintCopyMainBackendObservation | null = null;
  #phase = "idle";
  #lastFailure: string | null = null;
  #registrationLocationFailure: RegistrationLocationFailure | null = null;
  public constructor(transport: CurrentFootprintCopyMainBackendTransport) {
    this.#methods = methods(transport); this.#transport = transport;
  }
  #same(cleanup: boolean): void {
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released && (cleanup || !this.#failed && !this.#releaseAttempted), "OWNER");
    if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
    need(this.#started === 0 || performance.now() - this.#started < (cleanup ? PROFILE.totalMilliseconds : PROFILE.normalMilliseconds), "TOTAL_DEADLINE");
  }
  async #current(cleanup = false): Promise<void> { this.#same(cleanup); await this.#transport.assertCurrent(); this.#same(cleanup); }
  #location(actual: z.infer<typeof location>): void {
    const scriptObserved = this.#scripts.has(actual.scriptId);
    const matches = actual.lineNumber === SOURCE.registration.https.lineNumber && actual.columnNumber === SOURCE.registration.https.breakpointColumnNumber && scriptObserved;
    if (!matches) { this.#registrationLocationFailure ??= Object.freeze({ lineNumber: actual.lineNumber, columnNumber: actual.columnNumber, scriptObserved }); }
    need(matches, "REGISTRATION_LOCATION");
  }
  #resolve(record: Resolved): void {
    need(this.#resolved.length < 8, "RESOLUTION_BOUND"); this.#resolved.push(record);
    if (this.#breakpoint !== null) { need(record.breakpointId === this.#breakpoint, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
  }
  #event(method: string, input: unknown): void {
    this.#events += 1; need(this.#events <= 4096, "EVENT_BOUND");
    if (method === "Debugger.scriptParsed") {
      const script = z.looseObject({ scriptId: handle, url: z.string().max(4096), executionContextId: z.number().int().positive() }).parse(input);
      if (new RegExp(URL_PATTERN, "u").test(script.url)) { need(!this.#scripts.has(script.scriptId) && this.#scripts.size === 0, "APP_SCRIPT_CHANGED"); this.#scripts.set(script.scriptId, script.executionContextId); }
      return;
    }
    if (method === "Runtime.executionContextCreated") { z.looseObject({ context: z.looseObject({ id: z.number().int().positive() }) }).parse(input); return; }
    if (method === "Runtime.consoleAPICalled") {
      z.looseObject({ type: z.enum(["log", "debug", "info", "error", "warning", "dir", "dirxml", "table", "trace", "clear", "startGroup", "startGroupCollapsed", "endGroup", "assert", "profile", "profileEnd", "count", "timeEnd"]),
        args: z.array(z.unknown()).max(64), executionContextId: z.number().int().positive() }).parse(input); return;
    }
    if (method === "Debugger.breakpointResolved") { this.#resolve(z.object({ breakpointId: registrationId, location }).strict().parse(input)); return; }
    if (method === "Debugger.paused") {
      need(this.#pause === null || this.#pause.resumed, "DUPLICATE_PAUSE"); const event = pauseSchema.parse(input), first = event.callFrames[0]; need(first !== undefined, "PAUSE_FRAME");
      const points = event.hitBreakpoints ?? [], registration = points.length === 1;
      if (registration) {
        need(this.#breakpoint !== null && points[0] === this.#breakpoint && !this.#registrationSeen && event.reason === "other", "REGISTRATION_PAUSE");
        this.#location(first.location); this.#registrationSeen = true;
      } else { need(event.reason === "Break on start" && this.#initialContinuationCount === 0 && !this.#registrationSeen && this.#pause === null && this.#breakpoint !== null, "INITIAL_PAUSE"); }
      this.#pause = { frameId: first.callFrameId, location: first.location, registration, resumeAttempted: false, resumed: false }; return;
    }
    if (method === "Debugger.resumed") { empty.parse(input); need(this.#pause !== null && this.#pause.resumeAttempted && !this.#pause.resumed, "UNEXPECTED_RESUME"); this.#pause.resumed = true; return; }
    // Preserve the original process on exceptions, context replacement and
    // Unknown events. They never cause a retry or another resume.
    need(false, "UNEXPECTED_EVENT");
  }
  #message(text: string): void {
    const value: unknown = JSON.parse(text);
    const response = z.object({ id: z.number().int().positive(), result: z.unknown().optional(), error: z.unknown().optional() }).strict().safeParse(value);
    if (response.success) {
      need(this.#pendingId !== null && response.data.id === this.#pendingId && !this.#replySeen && !Object.hasOwn(response.data, "error") && Object.hasOwn(response.data, "result"), "REPLY_ID_OR_ERROR");
      this.#reply = response.data.result; this.#replySeen = true; this.#replies.push(response.data.result); return;
    }
    const event = z.object({ method: z.string().max(128), params: z.unknown() }).strict().parse(value); this.#event(event.method, event.params);
  }
  async #pump(cleanup = false): Promise<void> {
    await this.#current(cleanup); const raw = await this.#transport.poll(cleanup); await this.#current(cleanup);
    need(typeof raw === "string" && raw.length <= 43_692 && /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(raw), "CHUNK_GRAMMAR");
    if (raw === "") { await delay(10); return; }
    const bytes = Buffer.from(raw, "base64"); need(bytes.length <= 32_768 && bytes.toString("base64") === raw, "CHUNK_BOUND");
    this.#received += bytes.length; need(this.#received <= 64 * 1024 * 1024, "RECEIVED_BOUND"); this.#text += this.#decoder.decode(bytes, { stream: true });
    let boundary = this.#text.indexOf("\0");
    while (boundary !== -1) { const message = this.#text.slice(0, boundary); need(message.length > 0 && Buffer.byteLength(message) <= 4 * 1024 * 1024, "MESSAGE_BOUND"); this.#text = this.#text.slice(boundary + 1); this.#message(message); boundary = this.#text.indexOf("\0"); }
    need(Buffer.byteLength(this.#text) <= 4 * 1024 * 1024, "PARTIAL_MESSAGE_BOUND");
  }
  async #wait(predicate: () => boolean, cleanup = false): Promise<void> {
    const started = performance.now(); while (!predicate()) { need(performance.now() - started < 20_000, "REPLY_DEADLINE"); await this.#pump(cleanup); }
  }
  async #request(input: Command, cleanup = false): Promise<unknown> {
    this.#phase = input.phase; await this.#current(cleanup); need(this.#pendingId === null && this.#requests < (cleanup ? 72 : 64), "REQUEST_BOUND");
    const command = validateCurrentFootprintCopyMainBackendCommand(input); this.#requests += 1; const id = this.#requests; this.#pendingId = id; this.#replySeen = false; this.#reply = null;
    await this.#transport.send(command, id); await this.#current(cleanup); await this.#wait(() => this.#replySeen, cleanup);
    const result = this.#reply; this.#pendingId = null; this.#reply = null; this.#replySeen = false; return result;
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #qualify(scriptId: string): Promise<void> {
    if (this.#source !== null) { need(this.#appScriptId === scriptId, "SOURCE_CHANGED"); return; }
    need(this.#scripts.has(scriptId), "APP_SCRIPT_REQUIRED");
    const reply = captureCurrentFootprintCopyMainBackendSourceReply(await this.#request({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId } }));
    this.#source = qualifyCurrentFootprintCopyMainBackendSource(reply.scriptSource); this.#appScriptId = scriptId;
  }
  async #resume(pause: Pause): Promise<void> {
    need(this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#breakpoint !== null, "RESUME_CONSUMED");
    pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "resume", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed);
  }
  async #remove(cleanup = false): Promise<void> {
    need(this.#breakpoint !== null && !this.#removeAttempted, "REMOVE_CONSUMED"); this.#removeAttempted = true;
    empty.parse(await this.#request({ phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#breakpoint } }, cleanup)); this.#removed = true;
  }
  #fail(error: unknown): void {
    this.#failed = true;
    this.#lastFailure ??= error instanceof z.ZodError ? "REPLY_SCHEMA" : "ORIGINAL_TRANSPORT_OR_CAPTURE";
  }
  public async observe(): Promise<CurrentFootprintCopyMainBackendObservation> {
    need(!this.#attempted && !this.#busy, "OBSERVE_CONSUMED"); this.#attempted = true; this.#busy = true; this.#started = performance.now();
    try {
      empty.parse(await this.#request({ phase: "runtime-enable", method: "Runtime.enable", params: {} }));
      z.object({ debuggerId: handle }).strict().parse(await this.#request({ phase: "debugger-enable", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } }));
      const armed = z.object({ breakpointId: registrationId, locations: z.array(location).max(1) }).strict().parse(await this.#request({ phase: "registration-arm", method: "Debugger.setBreakpointByUrl", params: {
        urlRegex: URL_PATTERN, lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber } }));
      this.#breakpoint = armed.breakpointId;
      for (const record of this.#resolved) { need(record.breakpointId === armed.breakpointId, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
      for (const actual of armed.locations) { this.#location(actual); }
      empty.parse(await this.#request({ phase: "run-waiting", method: "Runtime.runIfWaitingForDebugger", params: {} }));
      await this.#wait(() => this.#pause !== null); const first = this.#pause; need(first !== null, "INITIAL_PAUSE_REQUIRED");
      if (!first.registration) {
        if (this.#scripts.has(first.location.scriptId)) { await this.#qualify(first.location.scriptId); }
        this.#initialContinuationCount = 1; await this.#resume(first); await this.#wait(() => this.#pause !== first);
      }
      const registration = this.#pause; need(registration !== null && registration.registration && !registration.resumeAttempted, "REGISTRATION_REQUIRED");
      await this.#qualify(registration.location.scriptId);
      need(this.#resolved.some(record => record.breakpointId === this.#breakpoint && record.location.scriptId === registration.location.scriptId &&
        record.location.lineNumber === registration.location.lineNumber && record.location.columnNumber === registration.location.columnNumber) || armed.locations.some(actual => actual.scriptId === registration.location.scriptId), "REGISTRATION_RESOLUTION_REQUIRED");
      const selected = objectReply.parse(await this.#request({ phase: "frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: registration.frameId,
        expression: EXPRESSION, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
      need(selected.result.description === "Array(8)", "FRAME_ARRAY"); this.#sourceArray = selected.result.objectId;
      const captured = objectReply.parse(await this.#request({ phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
        functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } }));
      need(captured.result.description === "Array(12)", "CAPTURE_ARRAY"); this.#retainedArray = captured.result.objectId;
      const ids = decodeCurrentFootprintCopyMainBackendArray(await this.#properties(this.#retainedArray));
      for (const [index, role] of [[10, "Date"], [11, "now"]] as const) {
        const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#properties(id), role);
      }
      for (const [index, role] of [[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"]] as readonly (readonly [number, Role])[]) {
        const id = ids[index]; need(id !== undefined && this.#appScriptId !== null, "MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendFunction(await this.#properties(id), role, this.#appScriptId);
      }
      await this.#reprove(); await this.#remove(); await this.#resume(registration); await this.#current();
      this.#packet = Object.freeze(currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: SOURCE.sha256, initialContinuationCount: this.#initialContinuationCount,
        registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true, originalProtocolCallbackAndBackendRetained: true,
        originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true,
        protocolRegistrationObserved: false, requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
        responderExclusivityProven: false, executionAuthorized: false })); issued.set(this.#packet, this); return this.#packet;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #reprove(): Promise<void> {
    need(this.#sourceArray !== null && this.#retainedArray !== null && this.#source !== null, "ORIGINAL_CAPTURE_REQUIRED");
    const result = await this.#request({ phase: "require", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
      functionDeclaration: CALLS.require.program, arguments: [{ objectId: this.#retainedArray }], returnByValue: true } });
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(result);
  }
  public async reprove(packet: CurrentFootprintCopyMainBackendObservation): Promise<void> {
    need(!this.#busy && packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET_REQUIRED"); this.#busy = true;
    try { await this.#reprove(); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try {
      if (this.#breakpoint !== null && !this.#removeAttempted) { await this.#remove(true); }
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; phase: string; failure: string | null; requests: number; replies: number;
    pendingReplies: number; events: number; receivedBytes: number; initialContinuationCount: number; registrationPaused: boolean; sourceQualified: boolean;
    breakpointRemoved: boolean; releaseAttempted: boolean; released: boolean; registrationLocationFailure: RegistrationLocationFailure | null }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, phase: this.#phase, failure: this.#lastFailure,
      requests: this.#requests, replies: this.#replies.length, pendingReplies: this.#pendingId === null ? 0 : 1, events: this.#events, receivedBytes: this.#received,
      initialContinuationCount: this.#initialContinuationCount, registrationPaused: this.#registrationSeen, sourceQualified: this.#source !== null,
      breakpointRemoved: this.#removed, releaseAttempted: this.#releaseAttempted, released: this.#released,
      registrationLocationFailure: this.#registrationLocationFailure });
  }
}
