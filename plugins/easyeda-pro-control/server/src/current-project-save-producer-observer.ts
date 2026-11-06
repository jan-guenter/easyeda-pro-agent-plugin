/** Source-owned producer calls remain held unless the separate original
 * startup-cache cursor admits that exact packet. There is no generic resume,
 * cleanup-CDP or timer authority; incomplete retirement needs Job exit. */
/* oxlint-disable import/max-dependencies -- One original collector joins separately audited source, native intrinsic, caller and actual owner boundaries. */
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS as CACHE_CALLS, CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH } from "./current-project-save-producer-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CACHE_CALLERS, currentProjectSaveProducerCacheCallerFrame } from "./current-project-save-producer-cache-source.ts";
import type { CurrentGeneratedStartupProgress } from "./current-generated-startup-progress.ts";
import type { CurrentProjectSaveProducerCacheCaller } from "./current-project-save-producer-cache-source.ts";
import { types } from "node:util";
import { z } from "zod";
import { continueOriginalCurrentGeneratedInitialCacheCall,continueOriginalCurrentGeneratedInitialSyncCall,continueOriginalCurrentGeneratedPeriodicSyncCall, continueOriginalCurrentPcbViaLocalUploadCall, continueOriginalCurrentPcbViaPreSavePeriodicSyncCall, continueOriginalCurrentPcbViaUploadRequestCall, originalCurrentProjectSaveProducerStartupProgress, requireOriginalCurrentPcbViaLocalUploadCompleted, requireOriginalCurrentPcbViaUploadRequestDispatched, requireOriginalCurrentProjectSaveProducerOrigin, settleOriginalCurrentGeneratedInitialCacheCalls, settleOriginalCurrentGeneratedInitialSyncCall, settleOriginalCurrentGeneratedPeriodicSyncCall, settleOriginalCurrentPcbViaPreSavePeriodicSyncCall } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as CALL_FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as REQUESTS, CURRENT_PROJECT_SAVE_PRODUCER_ROLES as ROLES, CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS as SHARED,
  currentProjectSaveProducerNativeCases, currentProjectSaveProducerRoleLimit, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerRole } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerBindings, CurrentProjectSaveProducerHeldCall, CurrentProjectSaveProducerOrigin } from "./current-project-save-producer-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location, functionLocation: location });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
const event = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: pause });
const remote = z.looseObject({ type: z.enum(["object", "function", "string", "number", "boolean", "undefined"]), objectId: handle.optional(), value: z.union([z.string().max(16_384), z.number(), z.boolean(), z.null()]).optional() });
const property = z.looseObject({ name: z.string(), isOwn: z.literal(true), value: remote, get: z.never().optional(), set: z.never().optional() });
const properties = z.looseObject({ result: z.array(property).min(2).max(11) });
export type { CurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-origin.ts";
interface CacheHeldCall { readonly caller: CurrentProjectSaveProducerCacheCaller; readonly fields: readonly Readonly<{ name: string; value: z.infer<typeof remote> }>[] }
interface OriginalHeldCall { readonly promise: "pending" | "fulfilled" | null; readonly cache: Readonly<CacheHeldCall> | null; readonly observer: CurrentProjectSaveProducerObserver; readonly role: CurrentProjectSaveProducerRole; readonly fields: readonly Readonly<{ name: string; value: z.infer<typeof remote> }>[] }
const heldCalls = new WeakMap<CurrentProjectSaveProducerHeldCall, OriginalHeldCall>();
/** Private observations only; these fields provide no original continuation. */
export function requireOriginalCurrentProjectSaveProducerHeldCall(packet: CurrentProjectSaveProducerHeldCall, observer: CurrentProjectSaveProducerObserver): OriginalHeldCall {
  const original = heldCalls.get(packet); need(original !== undefined && original.observer === observer, "ORIGINAL_HELD_CALL"); return original;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PROJECT_SAVE_PRODUCER_${code}`); } }
function binding(value: CurrentProjectSaveProducerBindings): CurrentProjectSaveProducerBindings {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype && Object.isFrozen(value), "BINDING");
  const names = ["sessionId", "scriptId", "request", "nextEvent", "retainHeldCall", "originalIntrinsics", "originalReceivers", "originalBreakpoint", "assertCurrent", "assertOriginalGenerationExited", "fail"];
  need(Reflect.ownKeys(value).length === names.length, "BINDING_FIELDS");
  for (const [index, name] of names.entries()) { const own = Object.getOwnPropertyDescriptor(value, name); need(own !== undefined && Object.hasOwn(own, "value"), "BINDING_DATA");
    if (index < 2) { handle.parse(own.value); } else { need(typeof own.value === "function" && !types.isProxy(own.value), "BINDING_FUNCTION"); } }
  return value;
}
export class CurrentProjectSaveProducerObserver {
  readonly #origin: CurrentProjectSaveProducerOrigin; readonly #owner: object; readonly #operation: object; readonly #binding: CurrentProjectSaveProducerBindings;
  readonly #points = new Map<CurrentProjectSaveProducerRole, string>(); readonly #occurrences = new Map<CurrentProjectSaveProducerRole, number>();
  #busy = false; #armed = false; #failed = false; #closed = false; #requests = 0; #events = 0;
  #held: CurrentProjectSaveProducerHeldCall | null = null;
  public constructor(origin: CurrentProjectSaveProducerOrigin, owner: object, operation: object) {
    this.#origin = origin; this.#owner = owner; this.#operation = operation; this.#binding = binding(requireOriginalCurrentProjectSaveProducerOrigin(origin, owner, operation)); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed && !this.#closed && requireOriginalCurrentProjectSaveProducerOrigin(this.#origin, this.#owner, this.#operation) === this.#binding, "ORIGINAL");
    await this.#binding.assertCurrent(); need(!this.#failed && !this.#closed && requireOriginalCurrentProjectSaveProducerOrigin(this.#origin, this.#owner, this.#operation) === this.#binding, "CHANGED"); }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#binding.fail(); } }
  async #send(input: unknown): Promise<unknown> {
    const command = validateCurrentProjectSaveProducerCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests, "REQUEST_CAPACITY");
    const captured = captureCurrentPcbStringClockReply(await this.#binding.request(command)).value; await this.#current(); return captured;
  }
  public async arm(): Promise<void> {
    need(!this.#busy && !this.#armed && !this.#failed && !this.#closed, "ARM_ONCE"); this.#busy = true;
    try { for (const command of currentProjectSaveProducerNativeCases()) {
      if (command.phase === "project-save-producer-arm") { const reply = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(await this.#send({ ...command, params: { ...command.params, location: { ...command.params.location, scriptId: this.#binding.scriptId } } }));
        need(reply.actualLocation.scriptId === this.#binding.scriptId && reply.actualLocation.lineNumber === command.params.location.lineNumber && reply.actualLocation.columnNumber === command.params.location.columnNumber && ![...this.#points.values()].includes(reply.breakpointId), "ARM_REPLY"); this.#points.set(command.role, reply.breakpointId); }
    } need(this.#points.size === REQUESTS.newArms, "ARM_ROSTER"); this.#armed = true;
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async observeHeldCall(): Promise<CurrentProjectSaveProducerHeldCall> {
    need(this.#armed && !this.#busy && !this.#failed && !this.#closed && this.#held === null, "HELD_CALL_ONCE"); this.#busy = true;
    try { await this.#current(); this.#events += 1; need(this.#events <= REQUESTS.events, "EVENT_CAPACITY");
      const received = event.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value); await this.#current(); need(received.sessionId === this.#binding.sessionId, "EVENT_SESSION");
      for (const role of SHARED) { const id = this.#binding.originalBreakpoint(role); handle.parse(id); const prior = this.#points.get(role); need(prior === id || prior === undefined && ![...this.#points.values()].includes(id), "SHARED_POINT_ALIAS"); this.#points.set(role, id); }
      const role = ROLES.find(name => this.#points.get(name) === received.params.hitBreakpoints[0]), top = received.params.callFrames[0]; need(role !== undefined && top !== undefined, "ORIGINAL_POINT"); const site = SITES[role];
      need(top.location.scriptId === this.#binding.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === this.#binding.scriptId && top.functionLocation.lineNumber === site.functionLineNumber && top.functionLocation.columnNumber === site.functionColumnNumber, "ORIGINAL_FRAME");
      const count = (this.#occurrences.get(role) ?? 0) + 1; need(count <= currentProjectSaveProducerRoleLimit(role), "ROLE_CAPACITY"); this.#occurrences.set(role, count);
      const captured = await this.#send({ phase: "project-save-producer-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME_FLAGS, callFrameId: top.callFrameId, expression: site.expression } });
      const frameId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(captured, site.length), original = this.#binding.originalReceivers();
      const joined = await this.#send({ phase: "project-save-producer-receiver", role, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: frameId, functionDeclaration: CALLS[role], arguments: [{ objectId: original.project }, { objectId: original.wrapper }, { objectId: original.callback }] } });
      const joinedId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(joined, site.length);
      const fields = properties.parse(await this.#send({ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: joinedId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })).result;
      const actual = new Map<string, z.infer<typeof remote>>(); for (const field of fields) { need(!actual.has(field.name), "FIELD_ALIAS"); actual.set(field.name, Object.freeze(field.value)); }
      need(actual.size === site.length + 1 && actual.get("length")?.type === "number" && actual.get("length")?.value === site.length, "ARRAY_LENGTH"); for (let index = 0; index < site.length; index += 1) { need(actual.has(String(index)), "ARRAY_MEMBER"); }
      const fieldsValue = Object.freeze([...actual].map(([name, value]) => Object.freeze({ name, value })));
      let promise: "pending" | "fulfilled" | null = null;
      if (role === "headPromise") { const promiseId = currentProjectSaveProducerCachePromiseHandle(top["returnValue"]);
        const retained = await this.#send({ phase: "project-save-producer-cache-promise", method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: promiseId, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } });
        const retainedId = currentProjectSaveProducerCachePromiseHandle(z.strictObject({ result: z.unknown() }).parse(retained).result);
        promise = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "project-save-producer-cache-promise-properties", method: "Runtime.getProperties", params: { objectId: retainedId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); }
      let cache: Readonly<CacheHeldCall> | null = null;
      if (role === "headEntry") {
        const caller = currentProjectSaveProducerCacheCallerFrame(received, this.#binding.scriptId), callerSite = CACHE_CALLERS[caller.role];
        const capturedCaller = await this.#send({ phase: "project-save-producer-cache-caller", cacheRole: caller.role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME_FLAGS, callFrameId: caller.callFrameId, expression: callerSite.expression } });
        const callerId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(capturedCaller, callerSite.length);
        const capturedCache = await this.#send({ phase: "project-save-producer-cache-receiver", cacheRole: caller.role, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: joinedId, functionDeclaration: CACHE_CALLS[caller.role], arguments: [{ objectId: original.project }, { objectId: original.wrapper }, { objectId: original.callback }, { objectId: this.#binding.originalIntrinsics() }, { objectId: callerId }] } });
        const cacheId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(capturedCache, CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH);
        const cacheFields = properties.parse(await this.#send({ phase: "project-save-producer-cache-properties", method: "Runtime.getProperties", params: { objectId: cacheId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })).result;
        const values = new Map<string, z.infer<typeof remote>>(); for (const field of cacheFields) { need(!values.has(field.name), "CACHE_FIELD_ALIAS"); values.set(field.name, Object.freeze(field.value)); }
        need(values.size === CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH + 1 && values.get("length")?.type === "number" && values.get("length")?.value === CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH, "CACHE_ARRAY_LENGTH");
        for (let index = 0; index < CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CAPTURE_LENGTH; index += 1) { need(values.has(String(index)), "CACHE_ARRAY_MEMBER"); }
        cache = Object.freeze({ caller: caller.role, fields: Object.freeze([...values].map(([name, value]) => Object.freeze({ name, value }))) });
      }
      const packet = this.#binding.retainHeldCall(); need(packet !== null && typeof packet === "object" && !types.isProxy(packet) && Object.isFrozen(packet) && Reflect.ownKeys(packet).length === 1 && Object.getOwnPropertyDescriptor(packet, "profile")?.value === "private.current-project-save-producer-held-call.v1", "ORIGINAL_NATIVE_MARKER"); heldCalls.set(packet, Object.freeze({ observer: this, role, fields: fieldsValue, cache, promise })); this.#held = packet; return packet;
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continueInitialCacheCall(packet: CurrentProjectSaveProducerHeldCall): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed && this.#held === packet, "INITIAL_CACHE_ORIGINAL_HELD"); this.#busy = true;
    try { await this.#current(); await continueOriginalCurrentGeneratedInitialCacheCall(this.#origin, this.#owner, this.#operation, packet); await this.#current(); this.#held = null; }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continueSaveLocalCall(packet: CurrentProjectSaveProducerHeldCall): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed && this.#held === packet,"SAVE_LOCAL_ORIGINAL_HELD"); this.#busy = true;
    try { await this.#current(); await continueOriginalCurrentPcbViaLocalUploadCall(this.#origin,this.#owner,this.#operation,packet); await this.#current(); this.#held = null; }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continueSaveUploadCall(packet:CurrentProjectSaveProducerHeldCall):Promise<void>{need(!this.#busy&&!this.#failed&&!this.#closed&&this.#held===packet,"SAVE_UPLOAD_ORIGINAL_HELD");this.#busy=true;try{await this.#current();await continueOriginalCurrentPcbViaUploadRequestCall(this.#origin,this.#owner,this.#operation,packet);await this.#current();this.#held=null;}catch(error){this.#refuse();throw error;}finally{this.#busy=false;}}
  public requireSaveUploadDispatched():void{need(!this.#busy&&!this.#failed&&!this.#closed,"SAVE_UPLOAD_STATE");requireOriginalCurrentPcbViaUploadRequestDispatched(this.#origin,this.#owner,this.#operation);}
  public requireSaveLocalCompleted(): void { need(!this.#busy && !this.#failed && !this.#closed,"SAVE_LOCAL_COMPLETION_STATE"); requireOriginalCurrentPcbViaLocalUploadCompleted(this.#origin,this.#owner,this.#operation); }
  public startupProgress(): CurrentGeneratedStartupProgress { need(!this.#busy && !this.#failed && !this.#closed, "STARTUP_PROGRESS_STATE"); return originalCurrentProjectSaveProducerStartupProgress(this.#origin, this.#owner, this.#operation); }
  public async settleInitialCacheCalls(): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed, "INITIAL_CACHE_SETTLE_STATE"); const held = this.#held;
    if (held !== null) { requireOriginalCurrentProjectSaveProducerHeldCall(held, this); } this.#busy = true;
    try { await this.#current(); need(this.#held === held, "INITIAL_CACHE_SETTLE_HELD_CHANGED"); await settleOriginalCurrentGeneratedInitialCacheCalls(this.#origin, this.#owner, this.#operation); await this.#current(); need(this.#held === held, "INITIAL_CACHE_SETTLE_HELD_CHANGED"); }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continueInitialSyncCall(packet: CurrentProjectSaveProducerHeldCall): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed && this.#held === packet, "INITIAL_SYNC_ORIGINAL_HELD"); this.#busy = true;
    try { await this.#current(); await continueOriginalCurrentGeneratedInitialSyncCall(this.#origin, this.#owner, this.#operation, packet); await this.#current(); this.#held = null; }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async settleInitialSyncCall(): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed, "INITIAL_SYNC_SETTLE_STATE"); const held = this.#held;
    if (held !== null) { requireOriginalCurrentProjectSaveProducerHeldCall(held, this); } this.#busy = true;
    try { await this.#current(); need(this.#held === held, "INITIAL_SYNC_SETTLE_HELD_CHANGED"); await settleOriginalCurrentGeneratedInitialSyncCall(this.#origin, this.#owner, this.#operation); await this.#current(); need(this.#held === held, "INITIAL_SYNC_SETTLE_HELD_CHANGED"); }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continuePeriodicSyncCall(packet: CurrentProjectSaveProducerHeldCall): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed && this.#held === packet, "PERIODIC_SYNC_ORIGINAL_HELD"); this.#busy = true;
    try { await this.#current(); await continueOriginalCurrentGeneratedPeriodicSyncCall(this.#origin, this.#owner, this.#operation, packet); await this.#current(); this.#held = null; }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async continuePreSavePeriodicSyncCall(packet: CurrentProjectSaveProducerHeldCall): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed && this.#held === packet,"PRESAVE_PERIODIC_ORIGINAL_HELD");this.#busy=true;
    try{await this.#current();await continueOriginalCurrentPcbViaPreSavePeriodicSyncCall(this.#origin,this.#owner,this.#operation,packet);await this.#current();this.#held=null;}
    catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
  }
  public async settlePreSavePeriodicSyncCall(): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed,"PRESAVE_PERIODIC_SETTLE_STATE");const held=this.#held;if(held!==null){requireOriginalCurrentProjectSaveProducerHeldCall(held,this);}this.#busy=true;
    try{await this.#current();need(this.#held===held,"PRESAVE_PERIODIC_HELD_CHANGED");await settleOriginalCurrentPcbViaPreSavePeriodicSyncCall(this.#origin,this.#owner,this.#operation);await this.#current();need(this.#held===held,"PRESAVE_PERIODIC_HELD_CHANGED");}
    catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
  }
  public async settlePeriodicSyncCall(): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#closed, "PERIODIC_SYNC_SETTLE_STATE"); const held = this.#held;
    if (held !== null) { requireOriginalCurrentProjectSaveProducerHeldCall(held, this); } this.#busy = true;
    try { await this.#current(); need(this.#held === held, "PERIODIC_SYNC_SETTLE_HELD_CHANGED"); await settleOriginalCurrentGeneratedPeriodicSyncCall(this.#origin, this.#owner, this.#operation); await this.#current(); need(this.#held === held, "PERIODIC_SYNC_SETTLE_HELD_CHANGED"); }
    catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy && !this.#closed, "RETIRE_STATE"); await this.#binding.assertOriginalGenerationExited(); this.#closed = true; }
}
