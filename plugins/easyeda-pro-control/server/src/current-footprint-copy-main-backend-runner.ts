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
import { qualifyCurrentFootprintCopyMainCompletionSource, requireCurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS, currentFootprintCopyMainCompletionAllocatedId, validateCurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionOrigin, CurrentFootprintCopyMainCompletionOriginBindings } from "./current-footprint-copy-main-completion-origin.ts";
// oxlint-disable-next-line import/no-cycle -- The collector's issuer getter returns here; transfer is invoked only after both original owners exist, never during initialization.
import { requireCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner constructs this runner; its original private-factory guards are invoked only after that construction, never at module initialization. A callback registration seam would weaken this authority check.
import { assertCurrentFootprintCombinedMainCompletionCapacity, beginCurrentFootprintCombinedMainCompletion, currentFootprintCombinedMainGenerationExited, failCurrentFootprintCombinedMainCompletion, requireCurrentFootprintCombinedMainCapability, requireCurrentFootprintCombinedMainCleanup, requireCurrentFootprintCombinedPairedSchedule, requireCurrentFootprintHeadAgeBootstrapCapability, retireCurrentFootprintCombinedMainCompletion, sendCurrentFootprintCombinedMainCommand, sendCurrentFootprintCombinedMainCompletion } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedMainCapability } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM, decodeCurrentFootprintHeadAgeContextAccessor, decodeCurrentFootprintHeadAgeContextArray, decodeCurrentFootprintHeadAgeContextScopes, qualifyCurrentFootprintHeadAgeContextSource, requireCurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import type { CurrentFootprintHeadAgeBootstrapCapability, CurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
  decodeCurrentFootprintHeadAgeArray, decodeCurrentFootprintHeadAgeMainObservation, decodeCurrentFootprintHeadAgeNativeMethod } from "./current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeMainObservation } from "./current-footprint-head-age-main.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";
import { decodeCurrentFootprintHeadAgeCdpReply, isCurrentFootprintHeadAgeCdpPhase, rejectCurrentFootprintHeadAgeCdpException } from "./current-footprint-head-age-cdp-exception.ts";

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
interface OriginEntry { readonly assertOriginalEntry: () => void; readonly bindings: CurrentFootprintCopyMainRequestOriginBindings;
  readonly capability: CurrentFootprintCombinedMainCapability; readonly runner: CurrentFootprintCopyMainBackendRunner }
const requestOrigins = new WeakMap<CurrentFootprintCopyMainRequestOrigin, OriginEntry>();
const completionOrigins = new WeakMap<CurrentFootprintCopyMainCompletionOrigin, Readonly<{
  assertOriginalEntry: () => void; bindings: CurrentFootprintCopyMainCompletionOriginBindings;
}>>();
export function requireCurrentFootprintCopyMainCompletionOrigin(token: CurrentFootprintCopyMainCompletionOrigin): CurrentFootprintCopyMainCompletionOriginBindings {
  const entry = completionOrigins.get(token); need(entry !== undefined, "COMPLETION_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
export function requireCurrentFootprintCopyMainRequestOrigin(token: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined, "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
/** The actual native issuer joins both origins through the same retained
 * combined core. Equal plan bytes or a foreign genuine clock packet fail. */
export function requireCurrentFootprintCopyMainRequestClockOrigin(token: CurrentFootprintCopyMainRequestOrigin,
  clock: CurrentFootprintCopyClockRpcOrigin): void {
  const entry = requestOrigins.get(token); need(entry !== undefined, "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); requireCurrentFootprintCombinedPairedSchedule(entry.capability, entry.runner, clock);
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
type MetadataRole = "head-age-context-array" | "head-age-context-getter" | "head-age-context-setter" | "head-age-context-getter-scopes" | "head-age-context-setter-scopes" | Role | "Date" | "now" | "retained-array" | "head-age-array" | typeof CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS[number];
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
  readonly #headAgeBootstrapCapture: boolean;
  readonly #headAgeBootstrapCapability: CurrentFootprintHeadAgeBootstrapCapability | null;
  #headAgeBootstrapScriptId: string | null = null;
  readonly #resolved: Resolved[] = [];
  readonly #replies: unknown[] = [];
  #text = "";
  #attempted = false;
  #busy = false;
  #failed = false;
  #releaseAttempted = false;
  #released = false;
  #normalCloseAttempted = false;
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
  #completionAttempted = false;
  #completionBeginAttempted = false;
  #completionActive = false;
  #completionFailed = false;
  #completionToken: CurrentFootprintCopyMainCompletionOrigin | null = null;
  #completionSource: CurrentFootprintCopyMainCompletionSource | null = null;
  #completionNormal = 0;
  #completionCleanup = 0;
  #completionFinalResumeAttempted = false;
  #completionRetireAttempted = false;
  #headAgePreparationAttempted = false;
  #headAgeArray: string | null = null;
  #headAgeContextSource: CurrentFootprintHeadAgeContextSource | null = null;
  #headAgeAttempted = false;
  public constructor(transport: CurrentFootprintCopyMainBackendTransport, headAgeBootstrap?: CurrentFootprintHeadAgeBootstrapCapability) {
    if (headAgeBootstrap !== undefined) { requireCurrentFootprintHeadAgeBootstrapCapability(headAgeBootstrap, transport); }
    this.#headAgeBootstrapCapture = headAgeBootstrap !== undefined; this.#headAgeBootstrapCapability = headAgeBootstrap ?? null;
    this.#methods = methods(transport); this.#transport = transport;
  }
  #same(cleanup: boolean): void {
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released &&
      (cleanup || !this.#failed && !this.#releaseAttempted && !this.#normalCloseAttempted), "OWNER");
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
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    this.#events += 1; need(this.#events <= 4096, "EVENT_BOUND");
    if (this.#originActive && (method === "Debugger.paused" || method === "Debugger.resumed")) {
      need(this.#originEvents.length < 64, "REQUEST_EVENT_BOUND");
      if (method === "Debugger.paused") { if (this.#originPauseActive) { this.#originUncertain = true; } this.#originPauseActive = true; }
      else { empty.parse(input); if (!this.#originPauseActive || !this.#originResumeExpected) { this.#originUncertain = true; }
        this.#originPauseActive = false; this.#originResumeExpected = false; }
      this.#originEvents.push(Object.freeze({ method, params: freezeDeep(input) })); return;
    }
    if (method === "Debugger.scriptParsed") {
      if (this.#headAgeBootstrapCapture) {
        const bootstrap = z.looseObject({ scriptId: handle, url: z.literal("node:internal/bootstrap/node"), executionContextId: z.number().int().nonnegative(),
          startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(479), endColumn: z.literal(0), length: z.literal(15_939),
          isLiveEdit: z.literal(false), hasSourceURL: z.literal(false), isModule: z.literal(false), scriptLanguage: z.literal("JavaScript"),
          embedderName: z.literal("node:internal/bootstrap/node") }).safeParse(input);
        if (bootstrap.success) {
          need(this.#headAgeBootstrapScriptId === null, "HEAD_AGE_BOOTSTRAP_CHANGED"); this.#headAgeBootstrapScriptId = bootstrap.data.scriptId; return;
        }
      }
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
  async #request(input: Command | CurrentFootprintCopyMainRequestCollectCommand | CurrentFootprintCopyMainCompletionCommand, cleanup = false): Promise<unknown> {
    this.#phase = input.phase; await this.#current(cleanup);
    const collection = input.phase.startsWith("request-");
    const completion = input.phase.startsWith("completion-");
    let cleanupCommand: boolean;
    if (completion) { cleanupCommand = ["Debugger.resume", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"].includes(input.method); }
    else if (collection) { cleanupCommand = (CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES as readonly string[]).includes(input.phase); }
    else { cleanupCommand = ["resume", "remove", "release"].includes(input.phase); }
    const normalMaximum = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.normal +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal);
    const cleanupMaximum = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.cleanup +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup - 2);
    need(this.#pendingId === null && (this.#originAttempted ? this.#requests < normalMaximum + cleanupMaximum &&
      (cleanupCommand ? this.#cleanupRequests < cleanupMaximum : this.#normalRequests < normalMaximum) : this.#requests < (cleanup ? 72 : 64)), "REQUEST_BOUND");
    this.#requests += 1; if (cleanupCommand) { this.#cleanupRequests += 1; } else { this.#normalRequests += 1; }
    const id = this.#requests; this.#pendingId = id; this.#replySeen = false; this.#reply = null;
    if (completion) {
      need(this.#originCapability !== null && this.#completionActive, "COMPLETION_ORIGINAL_LEASE_REQUIRED");
      await sendCurrentFootprintCombinedMainCompletion(this.#originCapability, this, validateCurrentFootprintCopyMainCompletionCommand(input), id);
    } else if (collection) {
      need(this.#originCapability !== null && this.#originActive, "REQUEST_ORIGINAL_LEASE_REQUIRED");
      await sendCurrentFootprintCombinedMainCommand(this.#originCapability, this, validateCurrentFootprintCopyMainRequestCollectCommand(input), id);
    } else { await this.#transport.send(validateCurrentFootprintCopyMainBackendCommand(input), id); }
    await this.#current(cleanup); await this.#wait(() => this.#replySeen, cleanup);
    const result = this.#reply; this.#pendingId = null; this.#reply = null; this.#replySeen = false;
    if (isCurrentFootprintHeadAgeCdpPhase(input.phase)) { rejectCurrentFootprintHeadAgeCdpException(result, input.phase); }
    return result;
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
      need(selected.result.description === "Array(9)", "FRAME_ARRAY"); this.#sourceArray = selected.result.objectId;
      const captured = objectReply.parse(await this.#request({ phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
        functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } }));
      need(captured.result.description === "Array(13)", "CAPTURE_ARRAY"); this.#retainedArray = captured.result.objectId;
      const ids = decodeCurrentFootprintCopyMainBackendArray(await this.#properties(this.#retainedArray, "retained-array"));
      for (const [index, role] of [[10, "Date"], [11, "now"]] as const) {
        const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#properties(id, role), role);
      }
      for (const [index, role] of [[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"], [12, "dateParser"]] as readonly (readonly [number, Role])[]) {
        const id = ids[index]; need(id !== undefined && this.#appScriptId !== null, "MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendFunction(await this.#properties(id, role), role, this.#appScriptId);
      }
      this.#metadataRole = null;
      this.#driverCallbackObjectId = ids[6] ?? null;
      await this.#reprove(); await this.#remove(); await this.#resume(registration); await this.#current();
      this.#packet = Object.freeze(currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: SOURCE.sha256, initialContinuationCount: this.#initialContinuationCount,
        registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true, originalProtocolCallbackAndBackendRetained: true,
        originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, originalDateParserRetained: true,
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
  /** The native owner admits these two fixed phases only for its separate
   * head-age birth. This method cannot grant that birth to another transport.
   * Every actual Date method receives native V8 metadata checks before the one
   * synchronous parser/control call; failures consume the complete attempt. */
  public async prepareHeadAge(nativeRootPid: number): Promise<void> {
    need(this.#headAgeBootstrapCapture && !this.#headAgePreparationAttempted && !this.#originAttempted && !this.#busy && this.#packet !== null && issued.get(this.#packet) === this &&
      this.#retainedArray !== null && this.#sourceArray !== null, "HEAD_AGE_CONSUMED");
    this.#headAgePreparationAttempted = true; this.#busy = true;
    try {
      need(Number.isSafeInteger(nativeRootPid) && nativeRootPid > 0 && nativeRootPid <= 4_294_967_295, "HEAD_AGE_NATIVE_ROOT");
      await this.#reprove();
      const captured = objectReply.parse(await this.#request({ phase: "head-age-context-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }], returnByValue: false } }));
      need(captured.result.description === "Array(4)", "HEAD_AGE_CONTEXT_ARRAY");
      const accessors = decodeCurrentFootprintHeadAgeContextArray(await this.#properties(captured.result.objectId, "head-age-context-array"));
      const getter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.getter, "head-age-context-getter"), "getter");
      const setter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.setter, "head-age-context-setter"), "setter");
      need(getter.scriptId === setter.scriptId && getter.scriptId === this.#headAgeBootstrapScriptId, "HEAD_AGE_CONTEXT_SCRIPT");
      const source = z.object({ scriptSource: z.string().length(15_939) }).strict().parse(await this.#request({ phase: "head-age-context-source", method: "Debugger.getScriptSource", params: { scriptId: getter.scriptId } }));
      this.#headAgeContextSource = qualifyCurrentFootprintHeadAgeContextSource(source.scriptSource);
      const getterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(getter.scopesId, "head-age-context-getter-scopes"));
      const setterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(setter.scopesId, "head-age-context-setter-scopes"));
      const context = objectReply.parse(await this.#request({ phase: "head-age-context-bind", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: getterScopes[0], functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM,
        arguments: [{ objectId: getterScopes[1] }, { objectId: setterScopes[0] }, { objectId: setterScopes[1] },
          { objectId: captured.result.objectId }, { value: nativeRootPid }], returnByValue: false } }));
      need(context.result.description === "Array(5)", "HEAD_AGE_CONTEXT_BOUND"); requireCurrentFootprintHeadAgeContextSource(this.#headAgeContextSource);
      const selected = objectReply.parse(await this.#request({ phase: "head-age-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }, { objectId: context.result.objectId }], returnByValue: false } }));
      need(selected.result.description === "Array(16)", "HEAD_AGE_ARRAY");
      const ids = decodeCurrentFootprintHeadAgeArray(await this.#properties(selected.result.objectId, "head-age-array"));
      for (const [index, name] of CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS.entries()) {
        const id = ids[index]; need(id !== undefined, "HEAD_AGE_METHOD"); decodeCurrentFootprintHeadAgeNativeMethod(await this.#properties(id, name), name);
      }
      this.#metadataRole = null; this.#headAgeArray = selected.result.objectId;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Run the one synchronous native Date/parser observation only after the
   * original method roster was fully checked. Metadata reads occur outside the
   * Windows collection bracket; no retry or new array is allocated here. */
  public async observeHeadAge(input: unknown): Promise<CurrentFootprintHeadAgeMainObservation> {
    need(!this.#headAgeAttempted && !this.#originAttempted && !this.#busy && this.#headAgeArray !== null && this.#packet !== null && issued.get(this.#packet) === this, "HEAD_AGE_CONSUMED");
    this.#headAgeAttempted = true; this.#busy = true;
    try {
      const scope = validateClockControlScope(input); need(scope.createdAtLiteral.length === 19, "HEAD_AGE_LITERAL");
      const observed = await this.#request({ phase: "head-age-observe", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, throwOnSideEffect: false, objectId: this.#headAgeArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
        arguments: [{ value: scope.createdAtLiteral }, { value: Date.parse(`${scope.createdAtLiteral.replace(" ", "T")}Z`) }], returnByValue: true } });
      const value = decodeCurrentFootprintHeadAgeCdpReply(observed);
      const decoded = decodeCurrentFootprintHeadAgeMainObservation(value, scope.createdAtLiteral); await this.#reprove(); return decoded;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    await this.#release();
  }
  async #release(): Promise<void> {
    need(!this.#originActive && this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try {
      if (this.#breakpoint !== null && !this.#removeAttempted) { await this.#remove(true); }
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #normalCloseQuiescence(released: boolean): void {
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && this.#packet !== null &&
      !this.#busy && !this.#failed && this.#pendingId === null && this.#text.length === 0 && this.#removed &&
      this.#pause !== null && this.#pause.resumed && !this.#originActive && !this.#completionActive && !this.#completionFailed &&
      !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain && this.#originBreakpoints.size === 0 &&
      this.#originEvents.length === 0 && this.#released === released && (!released || this.#releaseAttempted), "NORMAL_CLOSE_QUIESCENCE");
  }
  /** No resume is dispatched here. A complete original observation, settled
   * origins and the acknowledged registration resume precede the existing
   * object-group release. A failed release consumes this cleanup attempt. */
  public async prepareNormalClose(): Promise<void> {
    need(!this.#normalCloseAttempted, "NORMAL_CLOSE_CONSUMED"); this.#normalCloseAttempted = true;
    this.#normalCloseQuiescence(this.#released);
    if (!this.#released) { await this.#release(); }
    this.#normalCloseQuiescence(true);
  }
  public requireNormalClosePrepared(): void {
    need(this.#normalCloseAttempted, "NORMAL_CLOSE_REQUIRED"); this.#normalCloseQuiescence(true);
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
          if (this.#completionAttempted) {
            need(currentFootprintCombinedMainGenerationExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
            return this.#retireFailedCompletionTransfer(capability);
          }
          this.#originActive = false; return Promise.resolve();
        },
      });
      this.#originCapability = capability; this.#originToken = token; this.#originActive = true;
      requestOrigins.set(token, Object.freeze({ assertOriginalEntry: (): void => { this.#originCheck(token, true); }, bindings, capability, runner: this })); return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Synchronous identity join before any create. Equal receipts or an origin
   * belonging to another original backend cannot pass this capability check. */
  public requireRequestOrigin(capability: CurrentFootprintCombinedMainCapability, token: CurrentFootprintCopyMainRequestOrigin): void {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    need(capability === this.#originCapability && token === this.#originToken, "REQUEST_ORIGINAL_OWNER");
    this.#originCheck(token, false);
  }
  /** Private original-owner handoff. Capacity refuses before either the old
   * lease or a native phase is consumed. A dispatched begin is one-shot; only
   * actual original exit can settle a lost acknowledgment. No writer starts. */
  public async issueCompletionOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<CurrentFootprintCopyMainCompletionOrigin> {
    need(!this.#completionAttempted && !this.#busy && this.#originToken !== null && capability === this.#originCapability &&
      this.#appSource !== null && this.#appScriptId !== null && this.#originSource !== null, "COMPLETION_ORIGINAL_CONSTRUCTION_REQUIRED");
    const held = requireCurrentFootprintCopyMainRequestHeldFinalPb(packet), originalToken = this.#originToken;
    need(held.qualifiedSource === this.#originSource && held.scriptId === this.#appScriptId &&
      held.retainedArrayObjectId === this.#retainedArray, "COMPLETION_ORIGINAL_HELD_OWNER");
    this.#originCheck(originalToken, false);
    assertCurrentFootprintCombinedMainCompletionCapacity(capability, this, this.#requests + 1);
    const source = qualifyCurrentFootprintCopyMainCompletionSource(this.#appSource);
    this.#completionAttempted = true; this.#busy = true;
    try {
      await held.assertOriginal(); this.#originCheck(originalToken, false);
      need(requireCurrentFootprintCopyMainRequestHeldFinalPb(packet) === held && this.#pendingId === null && this.#text === "" &&
        this.#originEvents.length === 0 && this.#originBreakpoints.size === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      this.#completionBeginAttempted = true; await beginCurrentFootprintCombinedMainCompletion(capability, this, this.#requests + 1);
      this.#originCheck(originalToken, false);
      need(this.#pendingId === null && this.#text === "" && this.#originEvents.length === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      // No await between consuming the exact old held lease and installing its
      // Sole new origin. The old collector cannot resume, release or retire it.
      const transferredHeld = transferCurrentFootprintCopyMainRequestHeldFinalPb(packet, originalToken);
      need(transferredHeld === held, "COMPLETION_TRANSFER_IDENTITY");
      const token = Object.freeze({ profile: "private.current-footprint-copy-main-completion-origin.v1" as const, executionAuthorized: false as const });
      this.#completionSource = source; this.#completionToken = token; this.#completionActive = true;
      const bindings: CurrentFootprintCopyMainCompletionOriginBindings = Object.freeze({ heldFinalPb: packet, transferredHeld,
        source, scriptId: held.scriptId,
        assertOriginal: (): Promise<void> => this.#completionCurrent(token),
        assertCleanup: (): Promise<void> => { this.#completionCheck(token, true); return Promise.resolve(); },
        assertOriginalHeld: (): Promise<void> => {
          this.#completionCheck(token, false); need(this.#originPauseActive && !this.#originResumeExpected &&
            !this.#completionFinalResumeAttempted && this.#originEvents.length === 0, "COMPLETION_ORIGINAL_PB_ADVANCED"); return Promise.resolve();
        },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#completionCheck(token, true); need(currentFootprintCombinedMainGenerationExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
          // Only observed retained-root exit and empty Job permit abandoned
          // Inspector replies/events to settle without pretending they replied.
          this.#originEvents.length = 0; return Promise.resolve();
        },
        fail: (): void => {
          if (this.#completionToken === token) { this.#completionFailed = true; failCurrentFootprintCombinedMainCompletion(capability, this); }
        },
        request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean): Promise<unknown> => this.#completionRequest(token, command, cleanup),
        pump: (cleanup: boolean): Promise<void> => this.#completionPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#completionCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => this.#completionRetire(token),
      });
      completionOrigins.set(token, Object.freeze({ assertOriginalEntry: (): void => { this.#completionCheck(token, true); }, bindings })); return token;
    } catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #completionCheck(token: CurrentFootprintCopyMainCompletionOrigin, cleanup: boolean): void {
    need(this.#completionActive && token === this.#completionToken && this.#originCapability !== null && this.#completionSource !== null,
      "COMPLETION_ORIGINAL_LEASE_REQUIRED");
    requireCurrentFootprintCopyMainCompletionSource(this.#completionSource);
    if (cleanup && currentFootprintCombinedMainGenerationExited(this.#originCapability, this)) {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER"); return;
    }
    if (cleanup) { requireCurrentFootprintCombinedMainCleanup(this.#originCapability, this); }
    else { need(!this.#completionFailed && !this.#originUncertain, "COMPLETION_FAILED"); requireCurrentFootprintCombinedMainCapability(this.#originCapability, this); }
    this.#same(cleanup);
  }
  async #completionCurrent(token: CurrentFootprintCopyMainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, false); await this.#current(); this.#completionCheck(token, false);
  }
  async #completionPump(token: CurrentFootprintCopyMainCompletionOrigin, cleanup: boolean): Promise<void> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#completionCheck(token, cleanup); }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #completionRequest(token: CurrentFootprintCopyMainCompletionOrigin, input: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainCompletionCommand(input);
    const actualCleanup = ["completion-remove", "completion-resume", "completion-resume-final-pb", "completion-release"].includes(command.phase);
    need(cleanup === actualCleanup && (cleanup ? this.#completionCleanup < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup :
      this.#completionNormal < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal), "COMPLETION_REQUEST_CLASS_OR_BOUND");
    if (command.phase === "completion-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "COMPLETION_BREAKPOINT_OWNER"); }
    if (command.method === "Debugger.resume") {
      // Resume consumes cleanup capacity but advances native application work.
      // A retained alias must never resume after a semantic/protocol failure.
      this.#completionCheck(token, false);
      need(this.#originPauseActive && !this.#originResumeExpected && (command.phase === "completion-resume-final-pb") === !this.#completionFinalResumeAttempted,
        "COMPLETION_ORIGINAL_RESUME_CONSUMED");
      if (command.phase === "completion-resume-final-pb") { this.#completionFinalResumeAttempted = true; }
      this.#originResumeExpected = true;
    }
    this.#busy = true; if (cleanup) { this.#completionCleanup += 1; } else { this.#completionNormal += 1; }
    try {
      const result = await this.#request(command, cleanup); this.#completionCheck(token, cleanup);
      if (command.phase === "completion-source-arm" || command.phase === "completion-callback-arm") {
        const allocated = currentFootprintCopyMainCompletionAllocatedId(result);
        need(allocated !== null && !this.#originBreakpoints.has(allocated), "COMPLETION_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated);
      } else if (command.phase === "completion-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.method === "Debugger.resume") { empty.parse(result); }
      else if (command.phase === "completion-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { this.#completionFailed = true; this.#originUncertain = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #completionRetire(token: CurrentFootprintCopyMainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, true); need(!this.#busy && this.#originCapability !== null, "COMPLETION_ORIGINAL_BUSY");
    const exited = currentFootprintCombinedMainGenerationExited(this.#originCapability, this);
    need(exited || !this.#completionFailed && this.#completionNormal === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal &&
      this.#completionCleanup === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup && this.#originGroupReleased &&
      this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain &&
      this.#pendingId === null && this.#originEvents.length === 0, "COMPLETION_ORIGINAL_CLEANUP_INCOMPLETE");
    // A lost native retirement acknowledgement is never replayed. After actual
    // Exit the retained phase may be released locally without another request.
    if (this.#completionRetireAttempted) { need(exited, "COMPLETION_RETIRE_CONSUMED"); this.#completionActive = false; this.#originActive = false; return; }
    this.#completionRetireAttempted = true; this.#busy = true;
    try { await retireCurrentFootprintCombinedMainCompletion(this.#originCapability, this); this.#completionActive = false; this.#originActive = false; }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #retireFailedCompletionTransfer(capability: CurrentFootprintCombinedMainCapability): Promise<void> {
    if (this.#completionBeginAttempted && !this.#completionRetireAttempted) {
      this.#completionRetireAttempted = true; await retireCurrentFootprintCombinedMainCompletion(capability, this);
    }
    this.#originActive = false;
  }
  #originCheck(token: CurrentFootprintCopyMainRequestOrigin, cleanup: boolean): void {
    need(!this.#completionActive, "COMPLETION_OWNS_MAIN");
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
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#originCheck(token, cleanup); }
    catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #originRequest(token: CurrentFootprintCopyMainRequestOrigin, input: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean): Promise<unknown> {
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
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
