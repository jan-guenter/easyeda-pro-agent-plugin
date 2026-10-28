/** One original-main startup continuation and construction capture. This runner
 * never opens a project, invokes an application callback, samples a clock or
 * grants a writer. The native transport retains root/Job/socket ownership. */
/* oxlint-disable import/max-dependencies -- The sole main scheduler directly joins its fixed grammars, source issuers and genuine native-owner capability; separating them would obscure the original lease boundary. */
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
import { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
import type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS,
  currentFootprintCopyMainRequestAllocatedId, validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import { qualifyCurrentFootprintCopyMainRequestSource, requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner constructs this runner; its original private-factory guards are invoked only after that construction, never at module initialization. A callback registration seam would weaken this authority check.
import { currentFootprintCombinedMainGenerationExited, requireCurrentFootprintCombinedMainCapability, requireCurrentFootprintCombinedMainCleanup, sendCurrentFootprintCombinedMainCommand } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedMainCapability } from "./current-pcb-diagnostic-owner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
export type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
export { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";

export interface CurrentFootprintCopyMainBackendTransport {
  readonly assertCurrent: () => Promise<void>;
  readonly send: (command: Command, id: number) => Promise<void>;
  /** Canonical base64 chunks of NUL-separated UTF-8 inspector messages. */
  readonly poll: (cleanup: boolean) => Promise<string>;
}
export interface CurrentFootprintCopyMainRequestOrigin {
  readonly profile: "private.current-footprint-copy-main-request-origin.v1"; readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainRequestOriginEvent {
  readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown;
}
export interface CurrentFootprintCopyMainRequestOriginBindings {
  readonly scriptId: string; readonly retainedArrayObjectId: string; readonly driverCallbackObjectId: string;
  readonly qualifiedSource: CurrentFootprintCopyMainRequestSource;
  readonly assertOriginal: () => Promise<void>; readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyMainRequestOriginEvent | null;
  readonly retire: () => Promise<void>;
}
interface OriginEntry { readonly assertOriginalEntry: () => void; readonly bindings: CurrentFootprintCopyMainRequestOriginBindings }
const requestOrigins = new WeakMap<CurrentFootprintCopyMainRequestOrigin, OriginEntry>();
export function requireCurrentFootprintCopyMainRequestOrigin(token: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined, "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}

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
type MetadataRole = Role | "Date" | "now" | "retained-array";
interface SchemaIssue { readonly code: string; readonly path: readonly (string | number)[] }
const schemaPathKeys = new Set(["args", "breakpointId", "callFrameId", "callFrames", "className", "columnNumber", "configurable", "context", "debuggerId",
  "description", "enumerable", "executionContextId", "hitBreakpoints", "id", "internalProperties", "isOwn", "lineNumber", "location", "locations", "name",
  "objectId", "reason", "result", "scriptId", "scriptSource", "subtype", "type", "url", "value", "writable"]);
const schemaIssueCodes = new Set(["custom", "invalid_element", "invalid_format", "invalid_key", "invalid_type", "invalid_union", "invalid_value",
  "not_multiple_of", "too_big", "too_small", "unrecognized_keys"]);
const issuedFailures = new WeakMap<Error, string>();
const methodNames = ["assertCurrent", "send", "poll"] as const;
function need(value: boolean, detail: string): asserts value {
  if (!value) { const error = new Error(`FOOTPRINT_MAIN_CONSTRUCTION_${detail}`); issuedFailures.set(error, detail); throw error; }
}
function schemaIssues(error: z.ZodError): readonly SchemaIssue[] {
  return Object.freeze(error.issues.slice(0, 6).map(issue => Object.freeze({ code: schemaIssueCodes.has(issue.code) ? issue.code : "other",
    path: Object.freeze(issue.path.slice(0, 8).map(segment => schemaPathSegment(segment))) })));
}
function schemaPathSegment(segment: PropertyKey): string | number {
  if (typeof segment === "number" && Number.isSafeInteger(segment) && segment >= 0 && segment <= 256) { return segment; }
  if (typeof segment === "string" && schemaPathKeys.has(segment)) { return segment; }
  return "$unknown";
}
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
  #normalRequests = 0;
  #cleanupRequests = 0;
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
  #appSource: string | null = null;
  #appScriptId: string | null = null;
  #sourceArray: string | null = null;
  #retainedArray: string | null = null;
  #driverCallbackObjectId: string | null = null;
  #packet: CurrentFootprintCopyMainBackendObservation | null = null;
  #phase = "idle";
  #lastFailure: string | null = null;
  #registrationLocationFailure: RegistrationLocationFailure | null = null;
  #metadataRole: MetadataRole | null = null;
  #schemaIssues: readonly SchemaIssue[] | null = null;
  #originAttempted = false;
  #originActive = false;
  #originCapability: CurrentFootprintCombinedMainCapability | null = null;
  #originToken: CurrentFootprintCopyMainRequestOrigin | null = null;
  #originSource: CurrentFootprintCopyMainRequestSource | null = null;
  readonly #originEvents: CurrentFootprintCopyMainRequestOriginEvent[] = [];
  readonly #originBreakpoints = new Set<string>();
  #originPauseActive = false;
  #originResumeExpected = false;
  #originUncertain = false;
  #originGroupReleased = false;
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
    if (this.#originActive && (method === "Debugger.paused" || method === "Debugger.resumed")) {
      need(this.#originEvents.length < 64, "REQUEST_EVENT_BOUND");
      if (method === "Debugger.paused") { if (this.#originPauseActive) { this.#originUncertain = true; } this.#originPauseActive = true; }
      else { empty.parse(input); if (!this.#originPauseActive || !this.#originResumeExpected) { this.#originUncertain = true; }
        this.#originPauseActive = false; this.#originResumeExpected = false; }
      this.#originEvents.push(Object.freeze({ method, params: freezeDeep(input) })); return;
    }
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
  async #request(input: Command | CurrentFootprintCopyMainRequestCollectCommand, cleanup = false): Promise<unknown> {
    this.#phase = input.phase; await this.#current(cleanup);
    const collection = input.phase.startsWith("request-");
    const cleanupCommand = collection ? (CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES as readonly string[]).includes(input.phase) : ["resume", "remove", "release"].includes(input.phase);
    const normalMaximum = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.normal;
    const cleanupMaximum = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.cleanup;
    need(this.#pendingId === null && (this.#originAttempted ? this.#requests < normalMaximum + cleanupMaximum &&
      (cleanupCommand ? this.#cleanupRequests < cleanupMaximum : this.#normalRequests < normalMaximum) : this.#requests < (cleanup ? 72 : 64)), "REQUEST_BOUND");
    this.#requests += 1; if (cleanupCommand) { this.#cleanupRequests += 1; } else { this.#normalRequests += 1; }
    const id = this.#requests; this.#pendingId = id; this.#replySeen = false; this.#reply = null;
    if (collection) {
      need(this.#originCapability !== null && this.#originActive, "REQUEST_ORIGINAL_LEASE_REQUIRED");
      await sendCurrentFootprintCombinedMainCommand(this.#originCapability, this, validateCurrentFootprintCopyMainRequestCollectCommand(input), id);
    } else { await this.#transport.send(validateCurrentFootprintCopyMainBackendCommand(input), id); }
    await this.#current(cleanup); await this.#wait(() => this.#replySeen, cleanup);
    const result = this.#reply; this.#pendingId = null; this.#reply = null; this.#replySeen = false; return result;
  }
  #properties(objectId: string, role: MetadataRole): Promise<unknown> {
    this.#metadataRole = role;
    return this.#request({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #qualify(scriptId: string): Promise<void> {
    if (this.#source !== null) { need(this.#appScriptId === scriptId, "SOURCE_CHANGED"); return; }
    need(this.#scripts.has(scriptId), "APP_SCRIPT_REQUIRED");
    const reply = captureCurrentFootprintCopyMainBackendSourceReply(await this.#request({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId } }));
    this.#source = qualifyCurrentFootprintCopyMainBackendSource(reply.scriptSource); this.#appScriptId = scriptId; this.#appSource = reply.scriptSource;
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
    if (this.#lastFailure !== null) { return; }
    if (error instanceof z.ZodError) { this.#lastFailure = "REPLY_SCHEMA"; this.#schemaIssues = schemaIssues(error); }
    else { this.#lastFailure = error instanceof Error ? issuedFailures.get(error) ?? "ORIGINAL_TRANSPORT_OR_CAPTURE" : "ORIGINAL_TRANSPORT_OR_CAPTURE"; }
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
      const ids = decodeCurrentFootprintCopyMainBackendArray(await this.#properties(this.#retainedArray, "retained-array"));
      for (const [index, role] of [[10, "Date"], [11, "now"]] as const) {
        const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#properties(id, role), role);
      }
      for (const [index, role] of [[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"]] as readonly (readonly [number, Role])[]) {
        const id = ids[index]; need(id !== undefined && this.#appScriptId !== null, "MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendFunction(await this.#properties(id, role), role, this.#appScriptId);
      }
      this.#metadataRole = null;
      this.#driverCallbackObjectId = ids[6] ?? null;
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
    need(!this.#originAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET_REQUIRED"); this.#busy = true;
    try { await this.#reprove(); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(!this.#originActive && this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try {
      if (this.#breakpoint !== null && !this.#removeAttempted) { await this.#remove(true); }
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Only the actual new combined native owner can join this original runner.
   * No caller-supplied scheduler, handles, flags or serialized packet is issued. */
  public async issueRequestOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainBackendObservation): Promise<CurrentFootprintCopyMainRequestOrigin> {
    need(!this.#originAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this &&
      this.#appScriptId !== null && this.#appSource !== null && this.#retainedArray !== null && this.#driverCallbackObjectId !== null,
    "REQUEST_ORIGINAL_CONSTRUCTION_REQUIRED");
    requireCurrentFootprintCombinedMainCapability(capability, this);
    this.#originAttempted = true; this.#busy = true;
    try {
      await this.#reprove(); requireCurrentFootprintCombinedMainCapability(capability, this); this.#same(false);
      this.#originSource = qualifyCurrentFootprintCopyMainRequestSource(this.#appSource);
      const token = Object.freeze({ profile: "private.current-footprint-copy-main-request-origin.v1" as const, executionAuthorized: false as const });
      const bindings: CurrentFootprintCopyMainRequestOriginBindings = Object.freeze({ scriptId: this.#appScriptId,
        retainedArrayObjectId: this.#retainedArray, driverCallbackObjectId: this.#driverCallbackObjectId, qualifiedSource: this.#originSource,
        assertOriginal: (): Promise<void> => this.#originCurrent(token),
        assertCleanup: (): Promise<void> => { this.#originCheck(token, true); return Promise.resolve(); },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#originCheck(token, true); need(currentFootprintCombinedMainGenerationExited(capability, this), "REQUEST_ORIGINAL_GENERATION_LIVE"); return Promise.resolve();
        },
        request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean): Promise<unknown> => this.#originRequest(token, command, cleanup),
        pump: (cleanup: boolean): Promise<void> => this.#originPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#originCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => {
          this.#originCheck(token, true); need(!this.#busy && (currentFootprintCombinedMainGenerationExited(capability, this) ||
            this.#originGroupReleased && this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected &&
            !this.#originUncertain && this.#pendingId === null && this.#originEvents.length === 0), "REQUEST_ORIGINAL_CLEANUP_INCOMPLETE");
          this.#originActive = false; return Promise.resolve();
        },
      });
      this.#originCapability = capability; this.#originToken = token; this.#originActive = true;
      requestOrigins.set(token, Object.freeze({ assertOriginalEntry: (): void => { this.#originCheck(token, true); }, bindings })); return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #originCheck(token: CurrentFootprintCopyMainRequestOrigin, cleanup: boolean): void {
    need(this.#originActive && token === this.#originToken && this.#originCapability !== null && this.#originSource !== null,
      "REQUEST_ORIGINAL_LEASE_REQUIRED");
    if (cleanup && currentFootprintCombinedMainGenerationExited(this.#originCapability, this)) {
      // Actual original-root exit and empty Job settle the retained lease even
      // After inspector budgets expire. This path cannot revive native I/O.
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER");
      requireCurrentFootprintCopyMainRequestSource(this.#originSource);
      if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
      return;
    }
    if (cleanup) { requireCurrentFootprintCombinedMainCleanup(this.#originCapability, this); }
    else { requireCurrentFootprintCombinedMainCapability(this.#originCapability, this); }
    requireCurrentFootprintCopyMainRequestSource(this.#originSource); this.#same(cleanup);
  }
  async #originCurrent(token: CurrentFootprintCopyMainRequestOrigin): Promise<void> {
    this.#originCheck(token, false); await this.#current(); this.#originCheck(token, false);
  }
  async #originPump(token: CurrentFootprintCopyMainRequestOrigin, cleanup: boolean): Promise<void> {
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#originCheck(token, cleanup); }
    catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #originRequest(token: CurrentFootprintCopyMainRequestOrigin, input: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainRequestCollectCommand(input);
    if (command.phase === "request-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "REQUEST_BREAKPOINT_OWNER"); }
    if (command.phase === "request-resume") { need(this.#originPauseActive && !this.#originResumeExpected, "REQUEST_ORIGINAL_RESUME_CONSUMED"); this.#originResumeExpected = true; }
    this.#busy = true;
    const mutation = ["request-driver-arm", "request-site-arm", ...CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES].includes(command.phase);
    try {
      const result = await this.#request(command, cleanup); this.#originCheck(token, cleanup);
      if (command.phase === "request-driver-arm" || command.phase === "request-site-arm") {
        const allocated = currentFootprintCopyMainRequestAllocatedId(result);
        need(allocated !== null && !this.#originBreakpoints.has(allocated), "REQUEST_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated);
      } else if (command.phase === "request-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.phase === "request-resume") { empty.parse(result); }
      else if (command.phase === "request-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { if (mutation) { this.#originUncertain = true; } this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; phase: string; failure: string | null; requests: number; replies: number;
    pendingReplies: number; events: number; receivedBytes: number; initialContinuationCount: number; registrationPaused: boolean; sourceQualified: boolean;
    breakpointRemoved: boolean; releaseAttempted: boolean; released: boolean; registrationLocationFailure: RegistrationLocationFailure | null;
    metadataRole: MetadataRole | null; schemaIssues: readonly SchemaIssue[] | null; requestOriginIssued: boolean; requestOriginActive: boolean }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, phase: this.#phase, failure: this.#lastFailure,
      requests: this.#requests, replies: this.#replies.length, pendingReplies: this.#pendingId === null ? 0 : 1, events: this.#events, receivedBytes: this.#received,
      initialContinuationCount: this.#initialContinuationCount, registrationPaused: this.#registrationSeen, sourceQualified: this.#source !== null,
      breakpointRemoved: this.#removed, releaseAttempted: this.#releaseAttempted, released: this.#released,
      registrationLocationFailure: this.#registrationLocationFailure, metadataRole: this.#metadataRole, schemaIssues: this.#schemaIssues,
      requestOriginIssued: this.#originAttempted, requestOriginActive: this.#originActive });
  }
}
