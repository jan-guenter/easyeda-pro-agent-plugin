/** One original SCH Save clock. The native issuer retains both original
 * sessions; this observer invokes neither a clock nor an application task. */
/* oxlint-disable import/max-dependencies -- Join the original native issuer, independent inert source/metadata decoders and fixed two-realm protocol. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { requireOriginalCurrentSchematicDisplayClockOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicDisplayWriteOwner } from "./current-schematic-display-write-owner.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { CurrentSchematicDisplayClockBindings, CurrentSchematicDisplayClockOrigin, CurrentSchematicDisplayClockRealm as Realm } from "./current-schematic-display-clock-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_CLOCK_GROUP as GROUP } from "./current-schematic-display-clock-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_UI_CALLER as CALLER, CURRENT_SCHEMATIC_DISPLAY_CLOCK_FLAGS as FLAGS, CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS as REQUESTS,
  CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES as SITES, currentSchematicDisplayClockCondition, validateCurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplayClockSite as Site } from "./current-schematic-display-clock-protocol.ts";
import { currentSchematicDisplayClockPauseId, decodeCurrentSchematicDisplayClockBreakpoint, decodeCurrentSchematicDisplayClockOffset, decodeCurrentSchematicDisplayClockPause } from "./current-schematic-display-clock-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRegistrationNative as decodeNative, decodeCurrentFootprintCopyClockRegistrationScope as decodeScope } from "./current-footprint-copy-clock-registration-contract.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Array as decodeRegistrationArray, decodeCurrentFootprintCopyClockRegistrationV2Function as decodeRegistrationFunction } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { assertCurrentFootprintCopyClockRegistrationV2Function, captureCurrentFootprintCopyClockRegistrationV2SourceReply as captureSource,
  qualifyCurrentFootprintCopyClockRegistrationV2Source as qualifySource, requireCurrentFootprintCopyClockRegistrationV2Source as requireSource } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRegistrationV2Source as Source, CurrentFootprintCopyClockRegistrationV2Role as SourceRole } from "./current-footprint-copy-clock-registration-v2-source.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as decodeArray, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as decodeArrayCapture,
  decodeCurrentFootprintCopyClockRpcV2Function as decodeWorkerFunction, currentFootprintCopyClockRpcV2ArrayObject as objectAt,
  requireCurrentFootprintCopyClockRpcV2Description as requireWorkerDescription, currentFootprintCopyClockRpcV2ArrayValue as valueAt } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { requireOriginalCurrentSchematicDisplaySaveBody, requireOriginalCurrentSchematicDisplaySaveBodyData } from "./current-schematic-display-save-observer.ts";
import type { CurrentSchematicDisplaySaveBodyObservation } from "./current-schematic-display-save-observer.ts";
import { requireOriginalCurrentSchematicDisplaySaveSource } from "./current-schematic-display-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

interface Pause { readonly role: Site; readonly realm: Realm; readonly frameId: string; readonly callerId: string | null; resumeAttempted: boolean; resumed: boolean }
interface SourceBinding { readonly scriptId: string; readonly source: Source }
interface RetainedRegistration { readonly first: string; readonly wrapper: string; readonly callback: string; readonly bindings: string }
export interface CurrentSchematicDisplayClockObservation {
  readonly schema: "private.current-schematic-display-clock-observation.v1"; readonly value: number; readonly lexicalOffset: number; readonly replyTopicSha256: string;
  readonly originalSaveCanvasRequestObserved: true; readonly selectedOriginalResponderObserved: true; readonly originalPendingReplyObserved: true;
  readonly selectedServiceReplacementObserved: true; readonly allFiveResumesObserved: true; readonly allFiveBreakpointsRemoved: true;
  readonly nativeBroadcastSenderHandleAuthenticated: false; readonly mainActorClockVerified: false;
  readonly originalSaveBodyJoined: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
export interface CurrentSchematicDisplayClockBodyJoin {
  readonly schema: "private.current-schematic-display-clock-body-join.v1"; readonly bodySha256: string; readonly clockValue: number;
  readonly originalSaveBodyJoined: true; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
const packets = new WeakMap<CurrentSchematicDisplayClockObservation, CurrentSchematicDisplayClockObserver>();
const joins = new WeakMap<CurrentSchematicDisplayClockBodyJoin, Readonly<{ observer: CurrentSchematicDisplayClockObserver; body: CurrentSchematicDisplaySaveBodyObservation; text: string }>>();
const uuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const empty = z.strictObject({});
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_DISPLAY_CLOCK_OBSERVER_${code}`); } }
function number(value: string | number): number { need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0), "NUMBER"); return value; }
function text(value: string | number): string { need(typeof value === "string", "STRING"); return value; }
function realmFor(role: Site): Realm { return role === "result" || role === "complete" ? "ui" : "worker"; }

export class CurrentSchematicDisplayClockObserver {
  readonly #origin: CurrentSchematicDisplayClockOrigin; readonly #owner: CurrentSchematicDisplayWriteOwner; readonly #plan: GeneratedSchematicDisplayNativeArguments; readonly #bindings: CurrentSchematicDisplayClockBindings;
  readonly #sources: Partial<Record<SourceRole, SourceBinding>> = {}; readonly #points = new Map<Site, string>(); readonly #pauses = new Map<Site, Pause>();
  readonly #removed = new Set<Site>(); readonly #held = new Map<Realm, Pause>();
  #registration: RetainedRegistration | null = null; #worker: string | null = null; #ui: string | null = null; #workerUuid: string | null = null; #uiUuid: string | null = null;
  #push: string | null = null; #replyTopic: string | null = null; #requestId: number | null = null; #resultFrame: string | null = null; #value: number | null = null; #offset: number | null = null;
  #initialOffset: number | null = null; #normal = 0; #cleanup = 0; #armed = false; #busy = false; #observing = false; #failed = false; #retired = false; #released = false;
  #packet: CurrentSchematicDisplayClockObservation | null = null; #join: CurrentSchematicDisplayClockBodyJoin | null = null;
  public constructor(origin: CurrentSchematicDisplayClockOrigin, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentSchematicDisplayClockOrigin(origin, owner, plan);
    need(this.#bindings.workerSessionId !== this.#bindings.uiSessionId, "REALMS"); requireOriginalCurrentSchematicDisplaySaveSource(this.#bindings.workerSource); Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#retired && !this.#released && requireOriginalCurrentSchematicDisplayClockOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL");
    requireOriginalCurrentSchematicDisplaySaveSource(this.#bindings.workerSource);
    for (const role of ["wrapper", "callback"] as const) { const source = this.#sources[role]; if (source !== undefined) { requireSource(source.source, role); } }
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#retired && !this.#released && requireOriginalCurrentSchematicDisplayClockOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "CHANGED");
    if (this.#observing) { this.#bindings.assertSaveAttempt(); }
  }
  #failure(): void { this.#failed = true; this.#bindings.fail(); }
  async #send(input: unknown, realm: Realm, cleanup = false): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicDisplayClockCommand(input);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_CAPACITY"); } else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "CAPACITY"); }
    const raw = await this.#bindings.request(command, realm, cleanup);
    const captured = command.phase === "schematic-clock-source" ? captureSource(command.role, raw) : captureCurrentPcbStringClockReply(raw).value;
    await this.#current(); return captured;
  }
  #properties(realm: Realm, objectId: string): Promise<unknown> { return this.#send({ phase: "schematic-clock-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, realm); }
  #call(role: keyof typeof CALLS, realm: Realm, objectId: string, args: readonly unknown[]): Promise<unknown> {
    return this.#send({ phase: `schematic-clock-${role}`, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS[role], arguments: args, returnByValue: role === "offset" } }, realm);
  }
  async #array(role: keyof typeof CALLS, realm: Realm, objectId: string, args: readonly unknown[], count: number): Promise<Readonly<{ id: string; fields: ReturnType<typeof decodeArray> }>> {
    const id = decodeArrayCapture(await this.#call(role, realm, objectId, args), count); return Object.freeze({ id, fields: decodeArray(await this.#properties(realm, id), count) });
  }
  #identity(): readonly Readonly<{ value: string }>[] { return [{ value: this.#plan.target.projectUuid }, { value: this.#plan.target.branchUuid }, { value: this.#bindings.windowTabId }]; }
  async #scope(objectId: string, role: SourceRole): Promise<string> {
    const previous = this.#sources[role]; const metadata = decodeRegistrationFunction(await this.#properties("ui", objectId), role, previous?.scriptId);
    if (previous === undefined) {
      need(metadata.scriptId !== this.#sources[role === "wrapper" ? "callback" : "wrapper"]?.scriptId, "SOURCE_ALIAS");
      const raw = captureSource(role, await this.#send({ phase: "schematic-clock-source", role, method: "Debugger.getScriptSource", params: { scriptId: metadata.scriptId } }, "ui"));
      this.#sources[role] = Object.freeze({ scriptId: metadata.scriptId, source: qualifySource(role, raw.scriptSource) });
    }
    return decodeScope(await this.#properties("ui", metadata.scopesId), role);
  }
  async #sample(): Promise<number> {
    const r = this.#registration; need(r !== null, "REGISTRATION"); const wrapper = await this.#scope(r.wrapper, "wrapper"); const callback = await this.#scope(r.callback, "callback");
    return decodeCurrentSchematicDisplayClockOffset(await this.#call("offset", "ui", callback, [...[wrapper, r.first, r.callback, r.bindings].map(objectId => ({ objectId })), ...this.#identity()]));
  }
  /** Arm before the single original SDK Save. No clock is invoked here. */
  public async arm(): Promise<void> {
    need(!this.#armed && !this.#busy, "ARM_CONSUMED"); this.#armed = true; this.#busy = true;
    try {
      const first = decodeArrayCapture(await this.#call("registration", "ui", this.#bindings.uiSdkObjectId, this.#identity()), 10);
      const firstIds = decodeRegistrationArray(await this.#properties("ui", first), "initial"); const wrapper = firstIds[4]; const getter = firstIds[8]; need(wrapper !== undefined && getter !== undefined, "REGISTRATION_ARRAY");
      const wrapperScope = await this.#scope(wrapper, "wrapper");
      const callbackRemote = z.strictObject({ result: z.strictObject({ type: z.literal("function"), className: z.literal("Function"), description: z.string().max(8192), objectId: z.string().min(1).max(256) }) }).parse(await this.#call("callback", "ui", wrapperScope, []));
      assertCurrentFootprintCopyClockRegistrationV2Function("callback", callbackRemote.result.description); const callback = callbackRemote.result.objectId; need(callback !== wrapper, "FUNCTION_ALIAS");
      const callbackScope = await this.#scope(callback, "callback");
      const bindings = decodeArrayCapture(await this.#call("bindings", "ui", callbackScope, [{ objectId: wrapperScope }, { objectId: first }, { objectId: callback }, ...this.#identity()]), 4);
      const ids = decodeRegistrationArray(await this.#properties("ui", bindings), "bindings"), now = ids[3]; need(now !== undefined, "NATIVE_NOW");
      decodeNative(await this.#properties("ui", now), "now"); decodeNative(await this.#properties("ui", getter), "name");
      this.#registration = Object.freeze({ first, wrapper, callback, bindings }); this.#initialOffset = await this.#sample();
      const workerId = decodeArrayCapture(await this.#send({ phase: "schematic-clock-worker", method: "Runtime.callFunctionOn", params: { ...FLAGS, uniqueContextId: this.#bindings.workerUniqueContextId,
        functionDeclaration: CALLS.worker, arguments: [{ value: this.#plan.target.projectUuid }, { value: this.#bindings.windowTabId }], returnByValue: false } }, "worker"), 14);
      const worker = decodeArray(await this.#properties("worker", workerId), 14); this.#worker = workerId; this.#workerUuid = uuid.parse(valueAt(worker, 12));
      for (const [role, index] of [["push", 3], ["dispatch", 4], ["reply", 5]] as const) {
        requireWorkerDescription(worker.get(String(index))?.description, role); decodeWorkerFunction(await this.#properties("worker", objectAt(worker, index)), role, this.#bindings.workerScriptId);
      }
      decodeNative(await this.#properties("worker", objectAt(worker, 8)), "name");
      const ui = await this.#array("ui", "ui", first, [{ objectId: bindings }], 10); this.#ui = ui.id; this.#uiUuid = uuid.parse(valueAt(ui.fields, 8)); need(this.#workerUuid !== this.#uiUuid, "BUS_ALIAS");
      for (const role of ["push", "dispatch", "result", "reply", "complete"] as const) {
        const site = SITES[role]; const scriptId = this.#script(role); const realm = realmFor(role); const busUuid = realm === "worker" ? this.#workerUuid : this.#uiUuid;
        const id = decodeCurrentSchematicDisplayClockBreakpoint(await this.#send({ phase: "schematic-clock-arm", role, method: "Debugger.setBreakpoint", params: {
          location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, condition: currentSchematicDisplayClockCondition(role, busUuid) } }, realm), role, scriptId);
        need(![...this.#points.values()].includes(id), "POINT_ALIAS"); this.#points.set(role, id);
      }
      need(await this.#sample() === this.#initialOffset && this.#normal === 36, "PRE_OFFSET_OR_COUNT");
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  #script(role: Site): string { const id = SITES[role].realm === "worker" ? this.#bindings.workerScriptId : this.#sources.wrapper?.scriptId; need(id !== undefined, "SCRIPT"); return id; }
  async #pump(): Promise<void> {
    await this.#current(); const event = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value;
    const parsed = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: z.string(), params: z.unknown() }).parse(event); await this.#current();
    const realm = parsed.sessionId === this.#bindings.workerSessionId ? "worker" : "ui"; need(parsed.sessionId === (realm === "worker" ? this.#bindings.workerSessionId : this.#bindings.uiSessionId), "SESSION");
    if (parsed.method === "Debugger.resumed") { const p = this.#held.get(realm); need(p !== undefined && p.resumeAttempted && !p.resumed, "UNEXPECTED_RESUME"); empty.parse(parsed.params); p.resumed = true; this.#held.delete(realm); return; }
    const id = currentSchematicDisplayClockPauseId(parsed.params), role = [...this.#points].find(([, value]) => value === id)?.[0];
    need(role !== undefined && SITES[role].realm === realm && !this.#pauses.has(role) && !this.#held.has(realm), "FOREIGN_PAUSE");
    if (role === "push") { need(this.#pauses.size === 0, "PUSH_ORDER"); }
    else if (role === "dispatch") { need(this.#pauses.get("push")?.resumed === true, "DISPATCH_ORDER"); }
    else if (role === "result") { need(this.#pauses.get("dispatch")?.resumed === true, "RESULT_ORDER"); }
    else { need(this.#pauses.get("result")?.resumed === true, "TAIL_ORDER"); }
    const p: Pause = { role, realm, ...decodeCurrentSchematicDisplayClockPause(parsed.params, role, this.#script(role), id), resumeAttempted: false, resumed: false };
    this.#pauses.set(role, p); this.#held.set(realm, p);
  }
  async #wait(predicate: () => boolean): Promise<void> { while (!predicate()) { await this.#pump(); } }
  async #frame(p: Pause, expression: string, count: number, caller = false): Promise<string> {
    const callFrameId = caller ? p.callerId : p.frameId; need(callFrameId !== null, "CALLER");
    return decodeArrayCapture(await this.#send({ phase: "schematic-clock-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression, objectGroup: GROUP,
      silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }, p.realm), count);
  }
  async #capture(p: Pause): Promise<void> {
    const role = p.role; need(this.#worker !== null && this.#ui !== null && this.#workerUuid !== null && this.#uiUuid !== null && this.#registration !== null, "SETUP");
    const count = { push: 4, dispatch: 7, result: 8, reply: 6, complete: 5 }[role], raw = await this.#frame(p, SITES[role].expression, count);
    if (role === "push") {
      const result = await this.#array("push", "worker", raw, [{ objectId: this.#worker }], 9); this.#push = result.id; this.#replyTopic = text(valueAt(result.fields, 7)); this.#requestId = number(valueAt(result.fields, 8)); return;
    }
    need(this.#push !== null && this.#replyTopic !== null && this.#requestId !== null, "REQUEST");
    if (role === "dispatch") { const r = await this.#array("dispatch", "worker", raw, [{ objectId: this.#push }, { value: this.#uiUuid }], 4);
      need(valueAt(r.fields, 1) === this.#workerUuid && valueAt(r.fields, 2) === this.#uiUuid && valueAt(r.fields, 3) === this.#requestId, "RESPONDER"); return; }
    if (role === "result") {
      const caller = await this.#frame(p, CALLER.expression, 8, true), scope = await this.#scope(this.#registration.callback, "callback");
      const r = await this.#array("result", "ui", raw, [{ objectId: this.#ui }, { objectId: caller }, { objectId: scope }, { value: {
        replyTopic: this.#replyTopic, workerUuid: this.#workerUuid, uiUuid: this.#uiUuid, requestId: this.#requestId, ordinal: 1 } }], 8);
      this.#value = number(valueAt(r.fields, 3)); this.#offset = number(valueAt(r.fields, 4)); this.#resultFrame = raw;
      need(this.#value > 0 && this.#value <= 8_640_000_000_000_000 && this.#offset === this.#initialOffset && valueAt(r.fields, 5) === this.#replyTopic &&
        valueAt(r.fields, 6) === this.#workerUuid && valueAt(r.fields, 7) === this.#requestId, "RESULT"); return;
    }
    need(this.#value !== null && this.#resultFrame !== null, "RESULT_REQUIRED");
    if (role === "reply") { const r = await this.#array("reply", "worker", raw, [{ objectId: this.#push }, { value: { uiUuid: this.#uiUuid, value: this.#value } }], 4); need(valueAt(r.fields, 3) === this.#value, "REPLY_VALUE"); }
    else { await this.#array("complete", "ui", raw, [{ objectId: this.#resultFrame }, { objectId: this.#ui }], 5); }
  }
  async #finishPause(p: Pause): Promise<void> {
    const id = this.#points.get(p.role); need(id !== undefined && !this.#removed.has(p.role), "REMOVE_CONSUMED"); this.#removed.add(p.role);
    empty.parse(await this.#send({ phase: "schematic-clock-remove", role: p.role, method: "Debugger.removeBreakpoint", params: { breakpointId: id } }, p.realm, true));
    need(!p.resumeAttempted, "RESUME_CONSUMED"); p.resumeAttempted = true;
    empty.parse(await this.#send({ phase: "schematic-clock-resume", role: p.role, method: "Debugger.resume", params: {} }, p.realm, true)); await this.#wait(() => p.resumed);
  }
  public async collect(): Promise<CurrentSchematicDisplayClockObservation> {
    need(this.#armed && !this.#busy && !this.#observing, "COLLECT_CONSUMED"); this.#busy = true; this.#observing = true;
    try {
      for (const role of ["push", "dispatch", "result"] as const) { await this.#wait(() => this.#pauses.has(role)); const p = this.#pauses.get(role); need(p !== undefined, "PAUSE"); await this.#capture(p); await this.#finishPause(p); }
      const remaining = new Set<Site>(["reply", "complete"]);
      while (remaining.size > 0) { await this.#wait(() => [...remaining].some(role => this.#pauses.has(role))); const role = [...remaining].find(candidate => this.#pauses.has(candidate));
        need(role !== undefined, "TAIL_PAUSE"); const p = this.#pauses.get(role); need(p !== undefined, "PAUSE"); await this.#capture(p); await this.#finishPause(p); remaining.delete(role); }
      need(await this.#sample() === this.#initialOffset && this.#normal === REQUESTS.normal && this.#cleanup === 10 && this.#value !== null && this.#offset !== null &&
        this.#replyTopic !== null && this.#held.size === 0 && this.#pauses.size === 5 && this.#removed.size === 5 && [...this.#pauses.values()].every(p => p.resumed), "INCOMPLETE");
      this.#packet = freezeDeep({ schema: "private.current-schematic-display-clock-observation.v1", value: this.#value, lexicalOffset: this.#offset, replyTopicSha256: sha256Text(this.#replyTopic),
        originalSaveCanvasRequestObserved: true, selectedOriginalResponderObserved: true, originalPendingReplyObserved: true, selectedServiceReplacementObserved: true,
        allFiveResumesObserved: true, allFiveBreakpointsRemoved: true, nativeBroadcastSenderHandleAuthenticated: false, mainActorClockVerified: false,
        originalSaveBodyJoined: false, selectedSqlAuthorized: false, persistenceVerified: false });
      packets.set(this.#packet, this); return this.#packet;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async joinBody(packet: CurrentSchematicDisplayClockObservation, body: CurrentSchematicDisplaySaveBodyObservation): Promise<CurrentSchematicDisplayClockBodyJoin> {
    need(!this.#busy && this.#join === null, "BODY_JOIN_CONSUMED"); this.#busy = true;
    try { await this.requireOriginal(packet); await requireOriginalCurrentSchematicDisplaySaveBody(body, this.#owner, this.#plan); await this.#current();
      need(body.value.clock === packet.value && body.value.documentUuid === this.#plan.target.pageUuid && body.value.projectUuid === this.#plan.target.projectUuid, "BODY_CLOCK");
      this.#join = freezeDeep({ schema: "private.current-schematic-display-clock-body-join.v1", bodySha256: body.bodySha256, clockValue: packet.value, originalSaveBodyJoined: true, selectedSqlAuthorized: false, persistenceVerified: false });
      joins.set(this.#join, Object.freeze({ observer: this, body, text: canonicalJson(this.#join) })); return this.#join;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentSchematicDisplayClockObservation): Promise<void> { need(packet === this.#packet && packets.get(packet) === this, "ORIGINAL_PACKET"); await this.#current(); }
  public async requireBodyJoin(join: CurrentSchematicDisplayClockBodyJoin, body: CurrentSchematicDisplaySaveBodyObservation, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): Promise<void> {
    const original = joins.get(join); need(original?.observer === this && original.body === body && original.text === canonicalJson(join) && this.#join === join && owner === this.#owner && plan === this.#plan, "ORIGINAL_BODY_JOIN");
    await requireOriginalCurrentSchematicDisplaySaveBody(body, owner, plan); await this.#current();
  }
  /** Historical data retrieval carries no live observer/Save/SQL authority. */
  public requireHistorical(packet: CurrentSchematicDisplayClockObservation, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayClockObservation {
    need(packet === this.#packet && packets.get(packet) === this && owner === this.#owner && plan === this.#plan, "ORIGINAL_PACKET_DATA"); return packet;
  }
  public requireHistoricalBodyJoin(join: CurrentSchematicDisplayClockBodyJoin, body: CurrentSchematicDisplaySaveBodyObservation, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayClockBodyJoin {
    const original = joins.get(join); need(original?.observer === this && original.body === body && original.text === canonicalJson(join) && this.#join === join && this.#packet !== null, "ORIGINAL_BODY_JOIN_DATA");
    this.requireHistorical(this.#packet, owner, plan); const value = requireOriginalCurrentSchematicDisplaySaveBodyData(body, owner, plan);
    need(value.clock === this.#packet.value && join.clockValue === value.clock && join.bodySha256 === body.bodySha256, "ORIGINAL_BODY_JOIN_DATA"); return join;
  }
  /** Successful observation only. Any ambiguous pause/allocation/resume keeps
   * cleanup on the original Job exit path, without an inspector detach. */
  public async release(): Promise<void> {
    need(!this.#busy && this.#packet !== null && !this.#released && this.#held.size === 0, "RELEASE_CONSUMED"); this.#busy = true;
    try { for (const realm of ["worker", "ui"] as const) { empty.parse(await this.#send({ phase: "schematic-clock-release", realm, method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, realm, true)); }
      need(this.#cleanup === REQUESTS.cleanup, "RELEASE_COUNT"); this.#released = true;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy && !this.#retired, "RETIRE_PENDING"); await this.#bindings.assertOriginalGenerationExited(); this.#retired = true; }
}
export async function requireOriginalCurrentSchematicDisplayClockBodyJoin(join: CurrentSchematicDisplayClockBodyJoin, body: CurrentSchematicDisplaySaveBodyObservation,
  owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): Promise<void> {
  const original = joins.get(join); need(original !== undefined, "ORIGINAL_BODY_JOIN"); await original.observer.requireBodyJoin(join, body, owner, plan);
}

export function requireOriginalCurrentSchematicDisplayClockData(packet: CurrentSchematicDisplayClockObservation, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayClockObservation {
  const original = packets.get(packet); need(original !== undefined, "ORIGINAL_PACKET_DATA"); return original.requireHistorical(packet, owner, plan);
}
export function requireOriginalCurrentSchematicDisplayClockBodyJoinData(join: CurrentSchematicDisplayClockBodyJoin, body: CurrentSchematicDisplaySaveBodyObservation, owner: CurrentSchematicDisplayWriteOwner, plan: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayClockBodyJoin {
  const original = joins.get(join); need(original !== undefined, "ORIGINAL_BODY_JOIN_DATA"); return original.observer.requireHistoricalBodyJoin(join, body, owner, plan);
}
