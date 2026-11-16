/** Same full worker startup callbacks and original serial Promise drain.
 * This original cursor supplies no inverse owner or complete writer frontier. */
import { CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL, currentFootprintInverseStartupQueueBudget, validateCurrentFootprintInverseStartupQueueCommand } from "./current-footprint-inverse-startup-queue-protocol.ts";
import { currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { types } from "node:util";
import { z } from "zod";
// oxlint-disable-next-line import/no-cycle -- Resolve the original Core registry only after its full owner and constructor exist.
import { requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";
import { currentFootprintForwardWriterFrontierArms } from "./current-footprint-forward-writer-frontier-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcb209WorkerProducerScopeList, decodeCurrentPcb209WorkerProducerScopes } from "./current-pcb-string-producer-scope.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS, CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS as FLAGS, CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS as FRAME, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "./current-project-save-structure-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES as ROLES, currentFootprintInverseStartupCallbackBudget, validateCurrentFootprintInverseStartupCallbackCommand } from "./current-footprint-inverse-startup-callback-protocol.ts";
import type { CurrentFootprintForwardWriterStartupFrontierBindings, CurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";
import type { CurrentFootprintInverseStartupCallbackRole as Role } from "./current-footprint-inverse-startup-callback-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const at = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location: at, functionLocation: at, returnValue: remote.optional() });
const property = z.looseObject({ name: z.string(), isOwn: z.literal(true), get: z.never().optional(), set: z.never().optional(), value: remote });
const properties = z.looseObject({ result: z.array(property).max(8) });
const paused = z.looseObject({ hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_STARTUP_CALLBACK_ORIGINAL"); } }
function object(value: z.infer<typeof remote> | undefined): string { need(value?.type === "object" && value.subtype !== "null" && value.objectId !== undefined); return value.objectId; }
const lookupSchema = z.custom<(origin: CurrentFootprintForwardWriterStartupFrontierOrigin, owner: object, prepared: object) => CurrentFootprintForwardWriterStartupFrontierBindings>(value => typeof value === "function" && !types.isProxy(value));
export class CurrentFootprintForwardWriterStartupCallbacks {
  readonly #origin: CurrentFootprintForwardWriterStartupFrontierOrigin; readonly #owner: object; readonly #prepared: object;
  readonly #lookup: z.infer<typeof lookupSchema>; readonly #binding: CurrentFootprintForwardWriterStartupFrontierBindings;
  #queueMode=false;#queueAttempted=false;#queueCommands=0;
  #busy = false; #failed = false; #commands = 0; #events = 0; #calls = 0; #outstanding = 0; #active: string | null = null;
  readonly #finalizerFrames: unknown[] = [];
  readonly #points = new Map<string, string>(); #armed = false; #ordinal = 0;
  public constructor(origin: CurrentFootprintForwardWriterStartupFrontierOrigin, owner: object, prepared: object) {
    this.#origin = origin; this.#owner = owner; this.#prepared = prepared;
    this.#lookup = lookupSchema.parse(requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin);
    this.#binding = this.#lookup(origin, owner, prepared); need(Object.isFrozen(this.#binding)); currentFootprintInverseStartupCallbackBudget(this.#binding.sourceRecords); Object.freeze(this);
  }
  #current(): void { need(!this.#failed && this.#lookup === requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin && this.#lookup(this.#origin, this.#owner, this.#prepared) === this.#binding); this.#binding.assertCurrent(); }
  async #send(input: unknown): Promise<unknown> {
    this.#current();if(this.#queueMode){const command=validateCurrentFootprintInverseStartupQueueCommand(input);this.#queueCommands+=1;need(this.#queueCommands<=currentFootprintInverseStartupQueueBudget(this.#binding.sourceRecords).normal);const reply=captureCurrentPcbStringClockReply(await this.#binding.request({phase:"forward-startup-frontier",lane:"queue",command})).value;this.#current();return reply;}
    const command = validateCurrentFootprintInverseStartupCallbackCommand(input); need(command.phase !== "inverse-startup-callback-helper"); this.#commands += 1;
    need(this.#commands <= currentFootprintInverseStartupCallbackBudget(this.#binding.sourceRecords).normal);
    const reply = captureCurrentPcbStringClockReply(await this.#binding.request({phase:"forward-startup-frontier",lane:"callback",command})).value; this.#current(); return reply;
  }
  public async arm(): Promise<void> {
    this.#current(); need(!this.#armed && !this.#busy); this.#armed = true; this.#busy = true;
    try {
      for (const seed of currentFootprintForwardWriterFrontierArms()) {
        need(seed.phase === "project-save-structure-arm");
        const command = { ...seed, params: { ...seed.params, location: { ...seed.params.location, scriptId: this.#binding.actual.scriptId } } };
        const reply = z.strictObject({breakpointId:handle,actualLocation:at}).parse(await this.#binding.request({phase:"forward-startup-frontier",lane:"callback",command})); this.#current();
        need(reply.actualLocation.scriptId === this.#binding.actual.scriptId && reply.actualLocation.lineNumber === seed.params.location.lineNumber && reply.actualLocation.columnNumber === seed.params.location.columnNumber && ![...this.#points.values()].includes(reply.breakpointId));
        this.#points.set(seed.role, reply.breakpointId); this.#binding.point("callback",seed.role,reply.breakpointId);
      }
      need(this.#points.size === 4);
    } catch(error) { this.#failed = true; this.#binding.fail(error); throw error; } finally { this.#busy = false; }
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "project-save-structure-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  async #array(raw: unknown, length: number): Promise<string> {
    const result = z.strictObject({ result: remote }).parse(raw).result; need(result.type === "object" && result.className === "Array"); const id = object(result);
    await this.#ownArray(id,length);return id;
  }
  async #ownArray(id:string,length:number):Promise<Map<string,z.infer<typeof remote>>>{const own=properties.parse(await this.#properties(id));const fields=new Map(own.result.map(value=>[value.name,value.value]));need(fields.size===length+1&&own.result.length===fields.size&&fields.get("length")?.value===length&&Array.from({length},(_,index)=>fields.has(String(index))).every(Boolean));return fields;
  }
  async #frame(role: Role | "startupCaller", callFrameId: string): Promise<string> {
    return this.#array(await this.#send({ phase: "project-save-structure-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: SITES[role].expression } }), SITES[role].length);
  }
  async #scope(): Promise<string> {
    const binding = this.#binding; const scopes = decodeCurrentPcb209WorkerProducerScopeList(await this.#properties(binding.actual.wrapper), binding.actual.scriptId, "serial");
    const values = decodeCurrentPcb209WorkerProducerScopes(await this.#properties(scopes), "serial"); need(values[0] !== undefined); return values[0];
  }
  async #true(role: "startupEntry" | "startupReturn" | "startupFinalizer", receiver: string, args: readonly string[]): Promise<void> {
    z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await this.#send({ phase: `project-save-structure-${role}`, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: CALLS[role], arguments: args.map(objectId => ({ objectId })), returnByValue: true } }));
  }
  async #event(): Promise<Readonly<{ method: "Debugger.paused" | "Debugger.resumed"; params: unknown }>> {
    this.#current(); this.#events += 1; need(this.#events <= currentFootprintInverseStartupCallbackBudget(this.#binding.sourceRecords).events);
    const event = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle, params: z.unknown() }).parse(captureCurrentPcbStringClockReply(await this.#binding.event("callback")).value);
    this.#current(); need(event.sessionId === this.#binding.actual.sessionId); return event;
  }
  /** Only Core's retained same-stream pause can satisfy nextEvent. Supplied
   * event JSON or a second collector cannot enter this original cursor. */
  public async serviceOriginalHeld(): Promise<void> {
    this.#current(); need(this.#armed && !this.#busy); this.#busy = true;
    try {
      const event = await this.#event(); need(event.method === "Debugger.paused"); const value = paused.parse(event.params);
      const point = [...this.#points].map(([role,id])=>({role,id})).find(entry => entry.id === value.hitBreakpoints[0]); need(point !== undefined);
      const role = z.enum(ROLES).parse(point.role); const first = value.callFrames[0], site = SITES[role];
      need(first !== undefined && first.location.scriptId === this.#binding.actual.scriptId && first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber);
      const actual = this.#binding.actual, before = this.#commands; this.#ordinal += 1;
      await this.#binding.journal("callback-intent",{ordinal:this.#ordinal,role}); this.#current();
      await this.#binding.control("callback-held",role); this.#current();
      if (role === "startupEntry") {
        need(this.#active === null && this.#calls < this.#binding.sourceRecords); this.#calls += 1;
        const caller = value.callFrames[1], serial = SITES.producerSerial;
        need(caller !== undefined && caller.location.scriptId === actual.scriptId && caller.location.lineNumber === serial.lineNumber && caller.location.columnNumber >= serial.columnNumber - (serial.offset - serial.start) && caller.location.columnNumber < serial.columnNumber - (serial.offset - serial.start) + serial.bytes);
        const entry = await this.#frame(role, first.callFrameId); const callerArray = await this.#frame("startupCaller", caller.callFrameId), scope = await this.#scope();
        await this.#true("startupEntry", entry, [actual.project, actual.callback, callerArray, scope]); this.#active = entry;
      } else if (role === "startupReturn") {
        need(this.#active !== null); z.strictObject({ type: z.literal("undefined") }).parse(first.returnValue);
        await this.#true("startupReturn", await this.#frame(role, first.callFrameId), [this.#active, actual.project]); this.#active = null; this.#outstanding += 1;
      } else {
        need(this.#active === null && this.#outstanding > 0); const current = await this.#frame(role, first.callFrameId), scope = await this.#scope();
        await this.#true("startupFinalizer", current, [actual.project, actual.callback, scope]); this.#finalizerFrames.push(Object.freeze({ role, frame: current, scope })); this.#outstanding -= 1;
      }
      z.strictObject({}).parse(await this.#send({ phase: "project-save-structure-resume", role, method: "Debugger.resume", params: {} }));
      const resumed = await this.#event(); need(resumed.method === "Debugger.resumed"); z.strictObject({}).parse(resumed.params);
      const commands = this.#commands - before, expected = { startupEntry: 8, startupReturn: 4, initialFinally: 6, queuedFinally: 6 }; need(commands === expected[role]);
      await this.#binding.journal("callback-result",{ordinal:this.#ordinal,role,originalResumed:true,commands}); this.#current();
    } catch (error) { this.#failed = true; this.#binding.fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Retained own-group frame arrays hold the actual native Promise objects.
   * One original ready pause may inspect them; no Promise method is invoked. */
  public async verifyOriginalQueue():Promise<Readonly<{calls:number;finalizers:number;fulfilledPromiseReferences:number;originalSerialSlotsNull:true;originalOpeningCompleted:true}>>{
    this.#current();need(!this.#busy&&!this.#queueAttempted&&this.#calls>0&&this.#active===null&&this.#outstanding===0&&this.#finalizerFrames.length===this.#calls);this.#queueAttempted=true;this.#busy=true;this.#queueMode=true;
    try{await this.#binding.journal("queue-intent",{});this.#current();await this.#binding.control("queue-open");this.#current();let fulfilledPromiseReferences=0;for(const retained of this.#finalizerFrames){const packet=z.strictObject({role:z.enum(["initialFinally","queuedFinally"]),frame:handle,scope:handle}).parse(retained);const fields=await this.#ownArray(packet.frame,3);
      for(const index of ["0","1"]){const value=fields.get(index);need(value!==undefined);if(value.type==="object"&&value.subtype==="null"&&value.value===null){need(index==="1");}else{const promise=currentProjectSaveProducerCachePromiseHandle(value);need(decodeCurrentProjectSaveProducerCachePromise(await this.#properties(promise))==="fulfilled");fulfilledPromiseReferences+=1;}}}
      const scope=await this.#scope();const actual=this.#binding.actual;const result=await this.#send({phase:"inverse-startup-queue-empty",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:scope,functionDeclaration:CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL,arguments:[{objectId:actual.project},{objectId:actual.wrapper},{objectId:actual.callback}],returnByValue:true}});
      z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(result);this.#current();const observed = Object.freeze({calls:this.#calls,finalizers:this.#finalizerFrames.length,fulfilledPromiseReferences,originalSerialSlotsNull:true as const,originalOpeningCompleted:true as const});
      await this.#binding.journal("queue-result",observed);this.#current();return observed;
    }catch(error){this.#failed=true;this.#binding.fail();throw error;}finally{this.#queueMode=false;this.#busy=false;}
  }
  public status(): Readonly<{ calls: number; outstanding: number; active: boolean; failed: boolean; originalFinalizersObserved: number; completeQueuedPromiseFulfillmentVerified: false; completeProducerFrontierVerified: false }> {
    return Object.freeze({ calls: this.#calls, outstanding: this.#outstanding, active: this.#active !== null, failed: this.#failed, originalFinalizersObserved: this.#finalizerFrames.length, completeQueuedPromiseFulfillmentVerified: false, completeProducerFrontierVerified: false });
  }
}
