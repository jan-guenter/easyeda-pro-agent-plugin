/** One original worker's pristine Nd/QA chain, with its setProfile packet held
 * until original history SQL completion. No transcript or public issuer exists. */
import { types } from "node:util";
import { z } from "zod";
// oxlint-disable-next-line import/no-namespace -- Only two fixed original central registry exports are consulted; absent issuers refuse, with no supplied callback fallback.
import * as native from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcb209WorkerProducerFunction, decodeCurrentPcb209WorkerProducerScopeList, decodeCurrentPcb209WorkerProducerScopes } from "./current-pcb-string-producer-scope.ts";
import { decodeCurrentPcb209WorkerCallbackFunction, decodeCurrentPcb209WorkerCallbackScopeList } from "./current-pcb-string-producer-callback-scope.ts";
import { captureCurrentProjectStructureCompletionReply } from "./current-project-structure-completion-protocol.ts";
import { matchesCurrentProjectSaveStructureIntent, requireCurrentProjectPrehistoryBodyIntent, requireCurrentProjectPrehistoryPublication } from "./current-project-save-structure-prehistory.ts";
import type { CurrentProjectStructureBodyReservation, CurrentProjectStructureMainPublication } from "./current-project-save-structure-prehistory.ts";
import type { CurrentProjectHistorySqlCompletion, CurrentProjectSaveStructureBindings, CurrentProjectSaveStructureEvent, CurrentProjectSaveStructureOrigin } from "./current-project-save-structure-origin.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS, CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS as CALL_FLAGS, CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_PROJECT_SAVE_STRUCTURE_GROUP as GROUP, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as REQUESTS, CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTION_SEQUENCE as SEQUENCE, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION as STARTUP_CONDITION,
  qualifyCurrentProjectSaveStructureSource, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureSite as Site } from "./current-project-save-structure-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.looseObject({ name: z.string(), value: remote.optional(), get: z.unknown().optional(), set: z.unknown().optional(), isOwn: z.literal(true) });
const properties = z.looseObject({ result: z.array(property).max(64) });
const position = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const pausedFrame = z.looseObject({ callFrameId: handle, functionName: z.string().optional(), location: position, functionLocation: position, returnValue: remote.optional() });
const pauseSchema = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(pausedFrame).min(1).max(32) });
const eventSchema = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle, params: z.unknown() });
const internal = z.strictObject({ name: z.string(), value: remote });
const promiseProperties = z.looseObject({ internalProperties: z.array(internal).min(2).max(4) });
const packetSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), ticket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  structureText: z.string().max(2_097_152).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 2_097_152) });
const completionSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^[a-f\d]{32}$/u),
  bodySha256: z.string().regex(/^[a-f\d]{64}$/u), saveHeadTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), workerClock: z.number().int().positive().max(8_640_000_000_000_000),
  workerEditVersion: z.string().max(128).nullable(), originalHistoryNativeCallbacksCompleted: z.literal(true), selectedSqlStillFenced: z.literal(true) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PROJECT_SAVE_STRUCTURE_${code}`); } }
function object(value: z.infer<typeof remote> | undefined): string { need(value?.type === "object" && value.subtype !== "null" && value.objectId !== undefined, "OBJECT"); return value.objectId; }
function fn(value: z.infer<typeof remote> | undefined): string { need(value?.type === "function" && value.objectId !== undefined, "FUNCTION"); return value.objectId; }
function remoteResult(raw: unknown): z.infer<typeof remote> { return z.strictObject({ result: remote }).parse(raw).result; }
function sourceReply(raw: unknown): Readonly<{ scriptSource: string }> {
  need(raw !== null && typeof raw === "object" && !types.isProxy(raw) && !Array.isArray(raw) && (Object.getPrototypeOf(raw) === Object.prototype || Object.getPrototypeOf(raw) === null) && Reflect.ownKeys(raw).length === 1, "SOURCE_REPLY");
  const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "string", "SOURCE_DATA");
  const text: unknown = descriptor.value; need(typeof text === "string", "SOURCE_STRING"); qualifyCurrentProjectSaveStructureSource(text); return Object.freeze({ scriptSource: text });
}
const lookupFunction = z.custom<(origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object) => unknown>(value => typeof value === "function" && !types.isProxy(value));
const consumeBodyFunction = z.custom<(token: CurrentProjectStructureBodyReservation, owner: object, operation: object) => unknown>(value => typeof value === "function" && !types.isProxy(value));
const publicationFunction = z.custom<(token: CurrentProjectStructureMainPublication, origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object) => unknown>(value => typeof value === "function" && !types.isProxy(value));
const consumeFunction = z.custom<(token: CurrentProjectHistorySqlCompletion, owner: object, operation: object) => unknown>(value => typeof value === "function" && !types.isProxy(value));
const bindingsSchema = z.custom<CurrentProjectSaveStructureBindings>(value => {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Object.getPrototypeOf(value) !== Object.prototype || !Object.isFrozen(value)) { return false; }
  const fields = ["sessionId", "scriptId", "uniqueContextId", "prepared", "request", "nextEvent", "assertCurrent", "assertStartupPending", "assertOperationPending", "assertOriginalGenerationExited", "fail"];
  if (Reflect.ownKeys(value).length !== fields.length) { return false; }
  return fields.every((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key); if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return false; }
    if (index < 3) { return handle.safeParse(descriptor.value).success; } if (index === 3) { return descriptor.value !== null && typeof descriptor.value === "object"; }
    return typeof descriptor.value === "function" && !types.isProxy(descriptor.value); });
});
export interface CurrentProjectSaveProducerConstruction {
  readonly profile: "private.current-project-save-producer-construction.v1";
  readonly originalSevenConstructorContinuationsObserved: true;
  readonly originalFourArrowReceiversAndCurrentWrappersJoined: true;
  readonly originalBootstrapColdStateObserved: true;
  readonly continuousProducerExclusionVerified: false;
  readonly completeUploadFrontierVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentProjectSaveStructurePacket { readonly profile: "private.current-project-save-structure-packet.v1" }
export interface CurrentProjectSaveStructureCompletion {
  readonly profile: "private.current-project-save-structure-completion.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly ticket: number; readonly structureText: string;
  readonly originalHeldPacketAndHistoryJoinVerified: true; readonly originalTaskAndBothSerialFinalizersObserved: true;
  readonly mainStructurePublicationVerified: false; readonly completeClosedSqlVerified: false; readonly persistenceVerified: false;
}
export interface CurrentProjectPrehistoryStructureCompletion {
  readonly profile: "private.current-project-prehistory-structure-completion.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly ticket: number; readonly structureText: string;
  readonly originalHeldPacketAndBodyJoinVerified: true; readonly originalMainPublicationJoined: true; readonly originalTaskAndBothSerialFinalizersObserved: true;
  readonly originalHistorySqlCompleted: false; readonly completeUploadFrontierVerified: false; readonly completeClosedSqlVerified: false; readonly persistenceVerified: false;
}
const prehistoryCompletions = new WeakMap<CurrentProjectPrehistoryStructureCompletion, Readonly<{ observer: CurrentProjectSaveStructureObserver; packet: CurrentProjectSaveStructurePacket; reservation: CurrentProjectStructureBodyReservation; publication: CurrentProjectStructureMainPublication }>>();
export function requireOriginalCurrentProjectPrehistoryStructureCompletion(value: CurrentProjectPrehistoryStructureCompletion, observer: CurrentProjectSaveStructureObserver): void {
  need(prehistoryCompletions.get(value)?.observer === observer, "ORIGINAL_PREHISTORY_COMPLETION");
}
interface Retained { readonly observer: CurrentProjectSaveStructureObserver; readonly packet: CurrentProjectSaveStructurePacket; readonly completion: CurrentProjectHistorySqlCompletion }
const completions = new WeakMap<CurrentProjectSaveStructureCompletion, Retained>();
export function requireOriginalCurrentProjectSaveStructureCompletion(value: CurrentProjectSaveStructureCompletion, observer: CurrentProjectSaveStructureObserver): void {
  need(completions.get(value)?.observer === observer, "ORIGINAL_COMPLETION");
}
export class CurrentProjectSaveStructureObserver {
  readonly #origin: CurrentProjectSaveStructureOrigin; readonly #owner: object; readonly #operation: object;
  readonly #lookup: (origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object) => unknown;
  readonly #binding: CurrentProjectSaveStructureBindings; readonly #points = new Map<Site, { id: string; removeAttempted: boolean; removed: boolean }>();
  readonly #frameArrays = new Map<Site, string>();
  readonly #replies: unknown[] = []; readonly #finalizers = new Set<"upload" | "structure">();
  #normal = 0; #cleanup = 0; #events = 0; #busy = false; #failed = false; #armed = false; #constructionAttempted = false; #constructed = false; #packetAttempted = false;
  #releaseAttempted = false; #completionAttempted = false; #complete = false; #closed = false; #uncertainAllocation = false; #groupReleaseAttempted = false;
  #cleanupUncertain = false; #startupMode = false; #startupCalls = 0; #startupOutstanding = 0; #startupActive: string | null = null;
  #error: unknown = null; #revocationError: unknown = null;
  #pause: Readonly<{ role: Site; frameId: string; callerFrameId: string | null; resumeAttempted: boolean }> | null = null;
  #constructorProject: string | null = null;
  readonly #constructorCallbacks = new Map<"upload" | "cooperation" | "uploadStructure" | "structure" | "debounce", string>();
  #producerConstruction: CurrentProjectSaveProducerConstruction | null = null; #nonprivateModeObserved = false;
  #project: string | null = null; #uploadWrapper: string | null = null; #structureWrapper: string | null = null;
  #uploadCallback: string | null = null; #debounce: string | null = null; #structureCallback: string | null = null;
  #uploadPromise: string | null = null; #structurePromise: string | null = null; #resolver: string | null = null; #timer: number | null = null;
  #packet: string | null = null; #task: string | null = null; #datas: string | null = null; #taskSet: string | null = null; #response: string | null = null;
  #value: z.infer<typeof packetSchema> | null = null; #held: CurrentProjectSaveStructurePacket | null = null; #bodyReservation: CurrentProjectStructureBodyReservation | null = null; #publication: CurrentProjectStructureMainPublication | null = null; #prehistoryComplete = false; #history: CurrentProjectHistorySqlCompletion | null = null;
  public constructor(origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object) {
    this.#origin = origin; this.#owner = owner; this.#operation = operation;
    this.#lookup = lookupFunction.parse(Reflect.get(native, "requireOriginalCurrentProjectSaveStructureOrigin"));
    this.#binding = bindingsSchema.parse(this.#lookup(origin, owner, operation)); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed && !this.#closed && this.#lookup(this.#origin, this.#owner, this.#operation) === this.#binding, "ORIGINAL");
    if (this.#startupMode) { this.#binding.assertStartupPending(); } await this.#binding.assertCurrent(); if (this.#startupMode) { this.#binding.assertStartupPending(); } need(!this.#failed && !this.#closed && this.#lookup(this.#origin, this.#owner, this.#operation) === this.#binding, "CHANGED"); }
  #failure(error: unknown): void { if (!this.#failed) { this.#failed = true; this.#error = error; try { this.#binding.fail(); } catch (revocationError) { this.#revocationError = revocationError; } } }
  async #send(input: unknown, cleanup = false, retain?: (reply: unknown) => void): Promise<unknown> {
    const command = validateCurrentProjectSaveStructureCommand(input); if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_CAPACITY"); }
    else { await this.#current(); this.#normal += 1; need(this.#normal <= REQUESTS.normal, "NORMAL_CAPACITY"); }
    const raw = await this.#binding.request(command, cleanup, retain); let value: unknown;
    if (command.phase === "project-save-structure-source") { value = sourceReply(raw); }
    else if (command.phase === "project-save-structure-packetText") { value = captureCurrentProjectStructureCompletionReply(raw).value; }
    else { value = captureCurrentPcbStringClockReply(raw).value; }
    this.#replies.push(value); if (!cleanup) { await this.#current(); } return value;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "project-save-structure-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(role: keyof typeof CALLS, objectId: string, args: readonly string[], returnByValue = true): Promise<unknown> {
    return this.#send({ phase: `project-save-structure-${role}`, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId, functionDeclaration: CALLS[role], arguments: args.map(id => ({ objectId: id })), returnByValue } });
  }
  async #own(objectId: string): Promise<Map<string, z.infer<typeof remote>>> {
    const fields = properties.parse(await this.#properties(objectId)).result; const result = new Map<string, z.infer<typeof remote>>();
    for (const field of fields) { need(field.get === undefined && field.set === undefined && field.value !== undefined && !result.has(field.name), "OWN_DATA"); result.set(field.name, field.value); } return result;
  }
  async #array(raw: unknown, length: number): Promise<Map<string, z.infer<typeof remote>>> { const array = remoteResult(raw); need(array.type === "object" && array.className === "Array", "ARRAY");
    const fields = await this.#own(object(array)); need(fields.size === length + 1 && fields.get("length")?.value === length && Array.from({ length }, (_, index) => fields.has(String(index))).every(Boolean), "ARRAY_ROSTER"); return fields;
  }
  async #true(role: "same" | "success" | "pristine" | "taskExclusive" | "taskRemoved" | "uploadRelation" | "cooperationRelation" | "coldProject" | "coldStream" | "coldCooperation" | "startupEntry" | "startupReturn" | "startupFinalizer", objectId: string, args: readonly string[] = []): Promise<void> {
    z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await this.#call(role, objectId, args));
  }
  async #scope(functionId: string, kind: "serial" | "debounce" | "cooperation" | "upload"): Promise<readonly string[]> {
    const scopes = decodeCurrentPcb209WorkerProducerScopeList(await this.#properties(functionId), this.#binding.scriptId, kind);
    return decodeCurrentPcb209WorkerProducerScopes(await this.#properties(scopes), kind);
  }
  async #freshScopes(): Promise<Readonly<{ upload: string; structure: string; debounce: string; parameters: string }>> {
    need(this.#uploadWrapper !== null && this.#structureWrapper !== null && this.#debounce !== null, "CONSTRUCTED_HANDLES");
    const upload = await this.#scope(this.#uploadWrapper, "serial"); const structure = await this.#scope(this.#structureWrapper, "serial"); const debounce = await this.#scope(this.#debounce, "debounce");
    need(upload[0] !== undefined && structure[0] !== undefined && debounce[0] !== undefined && debounce[1] !== undefined, "FRESH_SCOPES");
    return { upload: upload[0], structure: structure[0], debounce: debounce[0], parameters: debounce[1] };
  }
  async #pristine(): Promise<void> { need(this.#project !== null && this.#uploadCallback !== null && this.#debounce !== null && this.#structureCallback !== null, "CONSTRUCTION");
    const scopes = await this.#freshScopes(); await this.#true("pristine", this.#project, [scopes.upload, scopes.structure, scopes.debounce, scopes.parameters, this.#uploadCallback, this.#debounce, this.#structureCallback]); }
  async #event(): Promise<CurrentProjectSaveStructureEvent> { await this.#current(); this.#events += 1; need(this.#events <= REQUESTS.events, "EVENT_CAPACITY"); const event = eventSchema.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value); await this.#current();
    need(event.sessionId === this.#binding.sessionId, "FOREIGN_SESSION"); return event; }
  async #nextPause(expected?: Site): Promise<Site> { need(this.#pause === null, "PAUSE_RETAINED"); const event = await this.#event(); need(event.method === "Debugger.paused", "PAUSE_EXPECTED");
    const paused = pauseSchema.parse(captureCurrentPcbStringClockReply(event.params).value); const selected = [...this.#points].find(([, point]) => point.id === paused.hitBreakpoints[0]);
    need(selected !== undefined && (expected === undefined || selected[0] === expected || expected === "packet" && this.#history === null && ["startupEntry", "startupReturn", "initialFinally", "queuedFinally"].includes(selected[0])), "ORIGINAL_BREAKPOINT"); const [role] = selected; const frame = paused.callFrames[0], site = SITES[role];
    need(frame !== undefined && frame.location.scriptId === this.#binding.scriptId && frame.location.lineNumber === site.lineNumber && frame.location.columnNumber === site.columnNumber, "EXACT_PAUSE");
    let callerFrameId: string | null = null;
    if (role === "packet") { const caller = paused.callFrames[1]; need(caller !== undefined && caller.functionLocation.scriptId === this.#binding.scriptId && caller.functionLocation.lineNumber === SITES.timer.lineNumber && caller.functionLocation.columnNumber === SITES.timer.columnNumber, "ORIGINAL_TIMER_FRAME"); callerFrameId = caller.callFrameId; }
    if (role === "startupEntry") {
      const caller = paused.callFrames[1], constructor = SITES.producerSerial;
      need(caller !== undefined && caller.location.scriptId === this.#binding.scriptId && caller.location.lineNumber === constructor.lineNumber && caller.location.columnNumber >= constructor.columnNumber - (constructor.offset - constructor.start) && caller.location.columnNumber < constructor.columnNumber - (constructor.offset - constructor.start) + constructor.bytes, "ORIGINAL_STARTUP_SERIAL_CALLER"); callerFrameId = caller.callFrameId;
    }
    if (role === "startupReturn") { need(z.strictObject({ type: z.literal("undefined") }).safeParse(frame.returnValue).success, "ORIGINAL_UNDEFINED_STARTUP_RETURN"); }
    if (role === "producerUpload" || role === "producerCooperation" || role === "producerSerial" || role === "producerDebounce") {
      const caller = paused.callFrames[1], constructor = role === "producerUpload" ? SITES.producerBase : SITES.producerProject;
      need(caller !== undefined && caller.location.scriptId === this.#binding.scriptId && caller.location.lineNumber === constructor.lineNumber && caller.location.columnNumber >= constructor.columnNumber - (constructor.offset - constructor.start) && caller.location.columnNumber <= constructor.columnNumber &&
        caller.functionName === constructor.name, "ORIGINAL_CONSTRUCTOR_CALLER");
      callerFrameId = caller.callFrameId;
    }
    this.#pause = { role, frameId: frame.callFrameId, callerFrameId, resumeAttempted: false }; need(role !== "queuedFinally" || expected === "packet" && this.#history === null && this.#startupOutstanding > 0, "QUEUED_WAVE_UNSUPPORTED");
    if (expected === "packet" && role !== "packet") { await this.#serviceStartup(role); return this.#nextPause(expected); }
    return role;
  }
  async #frame(role: Site): Promise<Map<string, z.infer<typeof remote>>> {
    need(this.#pause !== null, "FRAME_PAUSE");
    if (role === "mode") { need(this.#pause.role === "bootstrap", "MODE_BOOTSTRAP_FRAME"); }
    else if (role === "startupCaller") { need(this.#pause.role === "startupEntry" && this.#pause.callerFrameId !== null, "STARTUP_CALLER_FRAME"); }
    else if (role === "timer") { need(this.#pause.role === "packet" && this.#pause.callerFrameId !== null, "TIMER_FRAME_PAUSE"); }
    else if (role === "producerCaller") { need(this.#pause.callerFrameId !== null && this.#pause.role.startsWith("producer"), "CONSTRUCTOR_FRAME_PAUSE"); }
    else { need(this.#pause.role === role, "FRAME_PAUSE_ROLE"); }
    const callFrameId = role === "timer" || role === "producerCaller" || role === "startupCaller" ? this.#pause.callerFrameId : this.#pause.frameId; const raw = await this.#send({ phase: "project-save-structure-frame", role, method: "Debugger.evaluateOnCallFrame",
    params: { ...FRAME_FLAGS, callFrameId, expression: SITES[role].expression } }); this.#frameArrays.set(role, object(remoteResult(raw))); return this.#array(raw, SITES[role].length); }
  async #resume(role: Site): Promise<void> { need(this.#pause?.role === role && !this.#pause.resumeAttempted && (role === "bootstrap" && this.#nonprivateModeObserved || CONSTRUCTORS.some(value => value === role) || this.#history !== null || (role === "packet" ? this.#bodyReservation !== null : this.#publication !== null) || this.#startupMode && (role === "startupEntry" || role === "startupReturn" || role === "initialFinally" || role === "queuedFinally")), "RESUME_AUTHORITY");
    this.#pause = { ...this.#pause, resumeAttempted: true }; z.strictObject({}).parse(await this.#send({ phase: "project-save-structure-resume", role, method: "Debugger.resume", params: {} }));
    const event = await this.#event(); need(event.method === "Debugger.resumed", "RESUME_ACK"); z.strictObject({}).parse(event.params); this.#pause = null;
  }
  public async arm(): Promise<void> { need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try { sourceReply(await this.#send({ phase: "project-save-structure-source", method: "Debugger.getScriptSource", params: { scriptId: this.#binding.scriptId } }));
      for (const role of [...CONSTRUCTORS, "startupEntry", "startupReturn", "bootstrap", "packet", "response", "callbackReturn", "initialFinally", "queuedFinally"] as const) { const site = SITES[role]; this.#uncertainAllocation = true;
        const retain = (raw: unknown): void => { const result = z.looseObject({ breakpointId: handle }).safeParse(raw); if (result.success && ![...this.#points.values()].some(point => point.id === result.data.breakpointId)) {
          this.#points.set(role, { id: result.data.breakpointId, removeAttempted: false, removed: false }); this.#uncertainAllocation = false; } };
        const raw = await this.#send({ phase: "project-save-structure-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#binding.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(role === "startupEntry" || role === "startupReturn" ? { condition: STARTUP_CONDITION } : {}) } }, false, retain);
        const result = z.strictObject({ breakpointId: handle, actualLocation: position }).parse(raw); need(!this.#uncertainAllocation && this.#points.get(role)?.id === result.breakpointId && result.actualLocation.scriptId === this.#binding.scriptId && result.actualLocation.lineNumber === site.lineNumber && result.actualLocation.columnNumber === site.columnNumber, "ARM_REPLY");
      }
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  async #captureProducerConstructors(): Promise<void> {
    for (const [index, role] of SEQUENCE.entries()) {
      await this.#nextPause(role); const frame = await this.#frame(role);
      const receiver = role === "producerBase" || role === "producerProject" ? frame : await this.#frame("producerCaller");
      const project = object(receiver.get("0"));
      if (this.#constructorProject === null) { this.#constructorProject = project; }
      else { await this.#true("same", project, [this.#constructorProject]); }
      if (role !== "producerBase" && role !== "producerProject") {
        const delays = { producerUpload: 500, producerCooperation: 10, producerDebounce: 300 };
        if (role === "producerUpload" || role === "producerCooperation" || role === "producerDebounce") { need(frame.get("1")?.value === delays[role], "ORIGINAL_CONSTRUCTOR_DELAY"); }
        const callback = frame.get("0"); need(callback !== undefined, "ORIGINAL_CONSTRUCTOR_CALLBACK");
        if (role === "producerSerial" && index === 5) {
          const selected = decodeCurrentPcb209WorkerProducerFunction({ result: callback }, "debounce");
          decodeCurrentPcb209WorkerProducerScopeList(await this.#properties(selected), this.#binding.scriptId, "debounce"); this.#constructorCallbacks.set("debounce", selected);
        } else {
          let kind: "upload" | "cooperation" | "structure" | "uploadStructure" = "uploadStructure";
          if (role === "producerUpload") { kind = "upload"; } else if (role === "producerCooperation") { kind = "cooperation"; } else if (role === "producerDebounce") { kind = "structure"; }
          const selected = decodeCurrentPcb209WorkerCallbackFunction({ result: callback }, kind);
          decodeCurrentPcb209WorkerCallbackScopeList(await this.#properties(selected), this.#binding.scriptId, kind); this.#constructorCallbacks.set(kind, selected);
        }
      }
      await this.#resume(role);
    }
  }
  async #joinProducerConstructors(): Promise<void> {
    need(this.#project !== null && this.#constructorProject !== null && this.#uploadCallback !== null && this.#structureCallback !== null && this.#debounce !== null && this.#constructorCallbacks.size === 5, "ORIGINAL_CONSTRUCTION_HANDLES");
    await this.#true("same", this.#project, [this.#constructorProject]);
    for (const [kind, selected] of [["uploadStructure", this.#uploadCallback], ["structure", this.#structureCallback], ["debounce", this.#debounce]] as const) { const original = this.#constructorCallbacks.get(kind); need(original !== undefined, "ORIGINAL_CONSTRUCTION_CALLBACK"); await this.#true("same", selected, [original]); }
    for (const kind of ["upload", "cooperation"] as const) {
      const callback = this.#constructorCallbacks.get(kind); need(callback !== undefined, "ORIGINAL_BUFFERED_CALLBACK");
      const wrapper = decodeCurrentPcb209WorkerProducerFunction(await this.#call(kind === "upload" ? "uploadSelect" : "cooperationSelect", this.#project, [], false), kind);
      const scopes = await this.#scope(wrapper, kind); need(scopes[0] !== undefined, "ORIGINAL_BUFFERED_SCOPE");
      await this.#true(kind === "upload" ? "uploadRelation" : "cooperationRelation", scopes[0], [this.#project, wrapper, callback]);
      await this.#true(kind === "upload" ? "coldStream" : "coldCooperation", scopes[0], [this.#project, wrapper, callback]);
    }
    await this.#true("coldProject", this.#project);
    this.#producerConstruction = Object.freeze({ profile: "private.current-project-save-producer-construction.v1", originalSevenConstructorContinuationsObserved: true,
      originalFourArrowReceiversAndCurrentWrappersJoined: true, originalBootstrapColdStateObserved: true, continuousProducerExclusionVerified: false, completeUploadFrontierVerified: false, executionAuthorized: false });
  }
  async #removeProducerConstructorPoints(): Promise<void> {
    for (const role of CONSTRUCTORS) {
      await this.#current(); const point = this.#points.get(role); need(point !== undefined && !point.removeAttempted && !point.removed && this.#pause?.role === "bootstrap", "CONSTRUCTOR_POINT_RETAINED");
      point.removeAttempted = true; z.strictObject({}).parse(await this.#send({ phase: "project-save-structure-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
      await this.#current();
    }
  }
  /** Data from this observer's actual original constructor route only. A cold
   * snapshot does not authorize a later producer, publication or SQL call. */
  public producerConstruction(): CurrentProjectSaveProducerConstruction { need(this.#constructed && this.#producerConstruction !== null, "PRODUCER_CONSTRUCTION_REQUIRED"); return this.#producerConstruction; }
  /** Start concurrently with original project opening, after arm returns.
   * The original controller waits its own source-resume acknowledgement. */
  public async observeConstruction(): Promise<void> { need(this.#armed && !this.#busy && !this.#constructionAttempted, "CONSTRUCTION_CONSUMED"); this.#constructionAttempted = true; this.#busy = true;
    try { await this.#captureProducerConstructors(); await this.#nextPause("bootstrap"); await this.#frame("bootstrap"); const frameArray = this.#frameArrays.get("bootstrap"); need(frameArray !== undefined, "ORIGINAL_BOOTSTRAP_ARRAY"); const tuple = await this.#array(await this.#call("bootstrap", frameArray, [], false), 3);
      const mode = await this.#frame("mode"); need(mode.get("0")?.type === "boolean" && mode.get("0")?.value === false, "ORIGINAL_NONPRIVATE_MODE_REQUIRED"); this.#nonprivateModeObserved = true;
      this.#project = object(tuple.get("0")); this.#uploadWrapper = decodeCurrentPcb209WorkerProducerFunction({ result: tuple.get("1") }, "serial"); this.#structureWrapper = decodeCurrentPcb209WorkerProducerFunction({ result: tuple.get("2") }, "serial");
      const upload = await this.#scope(this.#uploadWrapper, "serial"); const structure = await this.#scope(this.#structureWrapper, "serial"); need(upload[0] !== undefined && structure[0] !== undefined, "INITIAL_SCOPES");
      this.#uploadCallback = decodeCurrentPcb209WorkerCallbackFunction(await this.#call("callback", upload[0], [], false), "uploadStructure"); decodeCurrentPcb209WorkerCallbackScopeList(await this.#properties(this.#uploadCallback), this.#binding.scriptId, "uploadStructure");
      this.#debounce = decodeCurrentPcb209WorkerProducerFunction(await this.#call("callback", structure[0], [], false), "debounce"); const scopes = await this.#scope(this.#debounce, "debounce"); need(scopes[1] !== undefined, "DEBOUNCE_PARAMETERS");
      this.#structureCallback = decodeCurrentPcb209WorkerCallbackFunction(await this.#call("callback", scopes[1], [], false), "structure"); decodeCurrentPcb209WorkerCallbackScopeList(await this.#properties(this.#structureCallback), this.#binding.scriptId, "structure");
      await this.#pristine(); await this.#joinProducerConstructors(); await this.#removeProducerConstructorPoints(); this.#constructed = true; await this.#resume("bootstrap");
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  async #serviceStartup(role: Site): Promise<void> {
    need(this.#constructed && this.#history === null && !this.#startupMode && this.#project !== null && this.#uploadWrapper !== null && this.#uploadCallback !== null, "STARTUP_ORIGINAL_CONSTRUCTION");
    this.#startupMode = true;
    try {
      this.#binding.assertStartupPending();
      if (role === "startupEntry") {
        need(this.#startupActive === null, "STARTUP_CALLBACK_ACTIVE"); const count = this.#binding.prepared.history.documents.reduce((total, document) => total + document.records.length, 0);
        need(Number.isSafeInteger(count) && count >= 1 && count <= 7 && this.#startupCalls < count, "STARTUP_SOURCE_RECORD_BOUND"); this.#startupCalls += 1;
        await this.#frame(role); await this.#frame("startupCaller"); const caller = this.#frameArrays.get("startupCaller"), entry = this.#frameArrays.get(role);
        const scopes = await this.#scope(this.#uploadWrapper, "serial"); need(entry !== undefined && caller !== undefined && scopes[0] !== undefined, "STARTUP_ORIGINAL_FRAMES");
        await this.#true("startupEntry", entry, [this.#project, this.#uploadCallback, caller, scopes[0]]); this.#startupActive = entry;
      } else if (role === "startupReturn") {
        need(this.#startupActive !== null, "STARTUP_ORIGINAL_ENTRY"); await this.#frame(role); const current = this.#frameArrays.get(role); need(current !== undefined, "STARTUP_ORIGINAL_RETURN");
        await this.#true("startupReturn", current, [this.#startupActive, this.#project]); this.#startupActive = null; this.#startupOutstanding += 1;
      } else {
        need((role === "initialFinally" || role === "queuedFinally") && this.#startupActive === null && this.#startupOutstanding > 0, "STARTUP_NO_PUBLICATION_RETURN_REQUIRED");
        await this.#frame(role); const frame = this.#frameArrays.get(role), scopes = await this.#scope(this.#uploadWrapper, "serial"); need(frame !== undefined && scopes[0] !== undefined, "STARTUP_ORIGINAL_FINALIZER");
        await this.#true("startupFinalizer", frame, [this.#project, this.#uploadCallback, scopes[0]]); this.#startupOutstanding -= 1;
      }
      await this.#resume(role); this.#binding.assertStartupPending();
    } finally { this.#startupMode = false; }
  }
  async #queues(): Promise<void> { need(this.#uploadCallback !== null && this.#debounce !== null && this.#structureCallback !== null, "QUEUES"); const scopes = await this.#freshScopes();
    const debounce = await this.#array(await this.#call("debounce", scopes.debounce, [scopes.parameters, this.#structureCallback], false), 2); const resolver = fn(debounce.get("1")), timer = debounce.get("0")?.value;
    need(typeof timer === "number" && Number.isSafeInteger(timer) && timer > 0, "TIMER");
    const upload = await this.#array(await this.#call("serial", scopes.upload, [this.#uploadCallback], false), 2); const structure = await this.#array(await this.#call("serial", scopes.structure, [this.#debounce], false), 2);
    if (this.#timer === null) { this.#timer = timer; this.#resolver = resolver; this.#uploadPromise = object(upload.get("0")); this.#structurePromise = object(structure.get("0")); }
    else { need(this.#timer === timer && this.#resolver !== null && this.#uploadPromise !== null && this.#structurePromise !== null, "QUEUE_RETAINED"); await this.#true("same", resolver, [this.#resolver]);
      await this.#true("same", object(upload.get("0")), [this.#uploadPromise]); await this.#true("same", object(structure.get("0")), [this.#structurePromise]); }
  }
  async #readPacket(packet: string): Promise<z.infer<typeof packetSchema>> { const raw = remoteResult(await this.#call("packetText", packet, [])); return packetSchema.parse(raw.value); }
  /** Start after construction, concurrently with the original opening. It
   * services only proved startup no-publication returns before retaining the
   * one actual Save structure packet. A packet requires the original Save role. */
  public async observePacket(): Promise<CurrentProjectSaveStructurePacket> { need(this.#constructed && !this.#busy && !this.#packetAttempted, "PACKET_CONSUMED"); this.#packetAttempted = true; this.#busy = true;
    try { await this.#nextPause("packet"); this.#binding.assertOperationPending(); need(this.#startupActive === null && this.#startupOutstanding === 0, "STARTUP_DRAIN_REQUIRED"); const frame = await this.#frame("packet"); need(this.#project !== null, "PROJECT"); await this.#true("same", object(frame.get("0")), [this.#project]);
      this.#packet = object(frame.get("1")); this.#task = object(frame.get("2")); await this.#queues(); const timer = await this.#frame("timer"); need(this.#structureCallback !== null && this.#resolver !== null && timer.get("2")?.value === this.#timer, "ORIGINAL_TIMER_ID");
      await this.#true("same", fn(timer.get("0")), [this.#structureCallback]); await this.#true("same", fn(timer.get("1")), [this.#resolver]); const data = await this.#array(await this.#call("packet", this.#packet, [this.#project, this.#task], false), 2);
      this.#datas = object(data.get("0")); this.#taskSet = object(data.get("1")); await this.#true("taskExclusive", this.#project, [this.#task, this.#taskSet]); this.#value = await this.#readPacket(this.#packet);
      this.#held = Object.freeze({ profile: "private.current-project-save-structure-packet.v1" }); return this.#held;
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  public async releasePacket(packet: CurrentProjectSaveStructurePacket, completion: CurrentProjectHistorySqlCompletion): Promise<void> {
    need(!this.#busy && !this.#releaseAttempted && this.#held === packet && this.#value !== null && this.#pause?.role === "packet", "HELD_PACKET"); this.#releaseAttempted = true; this.#busy = true;
    try { const consume = consumeFunction.parse(Reflect.get(native, "consumeOriginalCurrentProjectHistorySqlCompletion")); const value = completionSchema.parse(consume(completion, this.#owner, this.#operation));
      need(matchesCurrentProjectSaveStructureIntent(this.#binding.prepared, this.#value, value), "EXACT_HISTORY_AND_METADATA_INTENT");
      this.#history = completion; await this.#current(); this.#binding.assertOperationPending(); await this.#resume("packet");
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  /** A separate prehistory path. The original body consumer grants only this
   * packet/send; actual main response publication is required for its tail. */
  public async releasePrehistoryPacket(packet: CurrentProjectSaveStructurePacket, reservation: CurrentProjectStructureBodyReservation): Promise<void> {
    need(!this.#busy && !this.#releaseAttempted && this.#held === packet && this.#value !== null && this.#pause?.role === "packet", "HELD_PACKET"); this.#releaseAttempted = true; this.#busy = true;
    try { const consume = consumeBodyFunction.parse(Reflect.get(native, "consumeOriginalCurrentProjectStructureBodyReservation")); const value = consume(reservation, this.#owner, this.#operation);
      requireCurrentProjectPrehistoryBodyIntent(this.#binding.prepared, this.#value, value);
      this.#bodyReservation = reservation; await this.#current(); this.#binding.assertOperationPending(); await this.#resume("packet");
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  async #fulfilled(promise: string): Promise<void> { const raw = promiseProperties.parse(await this.#properties(promise));
    const values = raw.internalProperties.filter(field => field.name === "[[PromiseState]]"); need(values.length === 1 && values[0]?.value.type === "string" && values[0].value.value === "fulfilled", "ORIGINAL_PROMISE_FULFILLED"); }
  async #observeTaskCompletion(): Promise<void> {
    for (const role of ["response", "callbackReturn"] as const) { await this.#nextPause(role); const frame = await this.#frame(role);
        need(this.#project !== null && this.#packet !== null && this.#task !== null && this.#datas !== null && this.#taskSet !== null && this.#value !== null, "PACKET_RETAINED");
        await this.#true("same", object(frame.get("0")), [this.#project]); await this.#true("same", object(frame.get("1")), [this.#packet]); await this.#true("same", object(frame.get("2")), [this.#task]);
        const data = remoteResult(await this.#call("data", this.#packet, [], false)); await this.#true("same", object(data), [this.#datas]); const current = await this.#readPacket(this.#packet);
        need(current.projectUuid === this.#value.projectUuid && current.branchUuid === this.#value.branchUuid && current.ticket === this.#value.ticket && current.structureText === this.#value.structureText, "UNCHANGED_PACKET");
        const response = object(frame.get("3")); await this.#true("success", response);
        if (role === "response") { await this.#true("taskExclusive", this.#project, [this.#task, this.#taskSet]); await this.#queues(); this.#response = response; }
        else { need(this.#response !== null, "RESPONSE_RETAINED"); await this.#true("same", response, [this.#response]); await this.#true("taskRemoved", this.#project, [this.#task, this.#taskSet]); await this.#fulfilled(this.#task); }
        await this.#resume(role);
      }
      for (let index = 0; index < 2; index += 1) { await this.#nextPause("initialFinally"); const frame = await this.#frame("initialFinally"); const callback = fn(frame.get("2")); need(frame.get("1")?.type === "object" && frame.get("1")?.subtype === "null" && this.#uploadCallback !== null && this.#debounce !== null, "UNQUEUED_FINALIZER");
        const same = remoteResult(await this.#call("same", callback, [this.#uploadCallback])); need(same.type === "boolean", "CALLBACK_KIND"); const kind = same.value === true ? "upload" : "structure";
        if (kind === "structure") { await this.#true("same", callback, [this.#debounce]); } need(!this.#finalizers.has(kind), "DUPLICATE_FINALIZER"); const promise = kind === "upload" ? this.#uploadPromise : this.#structurePromise; need(promise !== null, "SERIAL_PROMISE_RETAINED");
        await this.#true("same", object(frame.get("0")), [promise]); this.#finalizers.add(kind); await this.#resume("initialFinally");
      }
      need(this.#value !== null && this.#uploadPromise !== null && this.#structurePromise !== null && this.#held !== null, "COMPLETE_RETAINED"); await this.#fulfilled(this.#uploadPromise); await this.#fulfilled(this.#structurePromise); await this.#current();
  }
  public async observeCompletion(): Promise<CurrentProjectSaveStructureCompletion> { need(!this.#busy && !this.#completionAttempted && this.#history !== null && this.#held !== null, "COMPLETION_CONSUMED"); this.#completionAttempted = true; this.#busy = true;
    try { await this.#observeTaskCompletion(); need(this.#value !== null, "COMPLETE_VALUE_RETAINED");
      this.#complete = true; const result = Object.freeze({ profile: "private.current-project-save-structure-completion.v1" as const, ...this.#value, originalHeldPacketAndHistoryJoinVerified: true as const,
        originalTaskAndBothSerialFinalizersObserved: true as const, mainStructurePublicationVerified: false as const, completeClosedSqlVerified: false as const, persistenceVerified: false as const });
      completions.set(result, { observer: this, packet: this.#held, completion: this.#history }); return result;
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  public async observePrehistoryCompletion(publication: CurrentProjectStructureMainPublication): Promise<CurrentProjectPrehistoryStructureCompletion> {
    need(!this.#busy && !this.#completionAttempted && this.#history === null && this.#bodyReservation !== null && this.#held !== null && this.#value !== null, "PREHISTORY_COMPLETION_CONSUMED"); this.#completionAttempted = true; this.#busy = true;
    try { const lookup = publicationFunction.parse(Reflect.get(native, "requireOriginalCurrentProjectStructurePublicationForSharedOrigin")); const value = lookup(publication, this.#origin, this.#owner, this.#operation);
      requireCurrentProjectPrehistoryPublication(this.#value, value);
      this.#publication = publication; await this.#current(); this.#binding.assertOperationPending(); await this.#observeTaskCompletion(); this.#prehistoryComplete = true;
      const result = Object.freeze({ profile: "private.current-project-prehistory-structure-completion.v1" as const, ...this.#value, originalHeldPacketAndBodyJoinVerified: true as const, originalMainPublicationJoined: true as const,
        originalTaskAndBothSerialFinalizersObserved: true as const, originalHistorySqlCompleted: false as const, completeUploadFrontierVerified: false as const, completeClosedSqlVerified: false as const, persistenceVerified: false as const });
      prehistoryCompletions.set(result, { observer: this, packet: this.#held, reservation: this.#bodyReservation, publication }); return result;
    } catch (error) { this.#failure(error); throw error; } finally { this.#busy = false; }
  }
  /** An incomplete held publication is never resumed as cleanup. The original
   * generation must actually exit before its observational handles can end. */
  public async cleanup(): Promise<void> { need(!this.#busy && !this.#closed, "CLEANUP_STATE"); this.#busy = true;
    try { if (!this.#complete || this.#failed || this.#uncertainAllocation || this.#cleanupUncertain) { await this.#binding.assertOriginalGenerationExited(); this.#closed = true; return; }
      this.#cleanupUncertain = true;
      need(this.#pause === null, "PAUSE_RETAINED"); for (const point of this.#points.values()) { if (!point.removed) { need(!point.removeAttempted, "REMOVE_CONSUMED"); point.removeAttempted = true;
        z.strictObject({}).parse(await this.#send({ phase: "project-save-structure-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true; } }
      need(!this.#groupReleaseAttempted, "GROUP_RELEASE_CONSUMED"); this.#groupReleaseAttempted = true; z.strictObject({}).parse(await this.#send({ phase: "project-save-structure-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#cleanupUncertain = false; this.#closed = true;
    } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ normalRequests: number; cleanupRequests: number; failed: boolean; error: unknown; revocationError: unknown; busy: boolean; constructed: boolean; packetHeld: boolean; packetReleaseAttempted: boolean; completed: boolean; prehistoryCompleted: boolean; resourcesClosed: boolean; uncertainAllocation: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ normalRequests: this.#normal, cleanupRequests: this.#cleanup, failed: this.#failed, error: this.#error, revocationError: this.#revocationError, busy: this.#busy, constructed: this.#constructed, packetHeld: this.#pause?.role === "packet", packetReleaseAttempted: this.#releaseAttempted,
      completed: this.#complete, prehistoryCompleted: this.#prehistoryComplete, resourcesClosed: this.#closed, uncertainAllocation: this.#uncertainAllocation, replies: Object.freeze([...this.#replies]) });
  }
}
