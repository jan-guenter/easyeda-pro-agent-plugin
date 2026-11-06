/** A source-owned producer call remains held. This collector has no resume,
 * cleanup-CDP, timer or write authority; incomplete retirement needs Job exit. */
import { types } from "node:util";
import { z } from "zod";
import { requireOriginalCurrentProjectSaveProducerOrigin } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as CALL_FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as REQUESTS, CURRENT_PROJECT_SAVE_PRODUCER_ROLES as ROLES, CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS as SHARED,
  currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerRole } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerBindings, CurrentProjectSaveProducerOrigin } from "./current-project-save-producer-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location, functionLocation: location });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
const event = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: pause });
const remote = z.looseObject({ type: z.enum(["object", "function", "string", "number", "boolean", "undefined"]), objectId: handle.optional(), value: z.union([z.string().max(16_384), z.number(), z.boolean(), z.null()]).optional() });
const property = z.looseObject({ name: z.string(), isOwn: z.literal(true), value: remote, get: z.never().optional(), set: z.never().optional() });
const properties = z.looseObject({ result: z.array(property).min(2).max(11) });
export interface CurrentProjectSaveProducerHeldCall { readonly profile: "private.current-project-save-producer-held-call.v1" }
interface OriginalHeldCall { readonly observer: CurrentProjectSaveProducerObserver; readonly role: CurrentProjectSaveProducerRole; readonly fields: readonly Readonly<{ name: string; value: z.infer<typeof remote> }>[] }
const heldCalls = new WeakMap<CurrentProjectSaveProducerHeldCall, OriginalHeldCall>();
/** Private observations only; these fields provide no original continuation. */
export function requireOriginalCurrentProjectSaveProducerHeldCall(packet: CurrentProjectSaveProducerHeldCall, observer: CurrentProjectSaveProducerObserver): OriginalHeldCall {
  const original = heldCalls.get(packet); need(original !== undefined && original.observer === observer, "ORIGINAL_HELD_CALL"); return original;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PROJECT_SAVE_PRODUCER_${code}`); } }
function binding(value: CurrentProjectSaveProducerBindings): CurrentProjectSaveProducerBindings {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype && Object.isFrozen(value), "BINDING");
  const names = ["sessionId", "scriptId", "request", "nextEvent", "originalReceivers", "originalBreakpoint", "assertCurrent", "assertOriginalGenerationExited", "fail"];
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
      if (command.phase === "project-save-producer-arm") { const reply = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(await this.#send({ ...command, params: { location: { ...command.params.location, scriptId: this.#binding.scriptId } } }));
        need(reply.actualLocation.scriptId === this.#binding.scriptId && reply.actualLocation.lineNumber === command.params.location.lineNumber && reply.actualLocation.columnNumber === command.params.location.columnNumber && ![...this.#points.values()].includes(reply.breakpointId), "ARM_REPLY"); this.#points.set(command.role, reply.breakpointId); }
    } need(this.#points.size === REQUESTS.newArms, "ARM_ROSTER"); this.#armed = true;
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async observeHeldCall(): Promise<CurrentProjectSaveProducerHeldCall> {
    need(this.#armed && !this.#busy && !this.#failed && !this.#closed && this.#held === null, "HELD_CALL_ONCE"); this.#busy = true;
    try { await this.#current(); this.#events += 1; need(this.#events <= REQUESTS.events, "EVENT_CAPACITY");
      const received = event.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value); await this.#current(); need(received.sessionId === this.#binding.sessionId, "EVENT_SESSION");
      for (const role of SHARED) { const id = this.#binding.originalBreakpoint(role); handle.parse(id); need(![...this.#points.values()].includes(id), "SHARED_POINT_ALIAS"); this.#points.set(role, id); }
      const role = ROLES.find(name => this.#points.get(name) === received.params.hitBreakpoints[0]), top = received.params.callFrames[0]; need(role !== undefined && top !== undefined, "ORIGINAL_POINT"); const site = SITES[role];
      need(top.location.scriptId === this.#binding.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === this.#binding.scriptId && top.functionLocation.lineNumber === site.functionLineNumber && top.functionLocation.columnNumber === site.functionColumnNumber, "ORIGINAL_FRAME");
      const count = (this.#occurrences.get(role) ?? 0) + 1; need(count <= REQUESTS.maximumRoleOccurrences, "ROLE_CAPACITY"); this.#occurrences.set(role, count);
      const captured = await this.#send({ phase: "project-save-producer-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME_FLAGS, callFrameId: top.callFrameId, expression: site.expression } });
      const frameId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(captured, site.length), original = this.#binding.originalReceivers();
      const joined = await this.#send({ phase: "project-save-producer-receiver", role, method: "Runtime.callFunctionOn", params: { ...CALL_FLAGS, objectId: frameId, functionDeclaration: CALLS[role], arguments: [{ objectId: original.project }, { objectId: original.wrapper }, { objectId: original.callback }] } });
      const joinedId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(joined, site.length);
      const fields = properties.parse(await this.#send({ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: joinedId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })).result;
      const actual = new Map<string, z.infer<typeof remote>>(); for (const field of fields) { need(!actual.has(field.name), "FIELD_ALIAS"); actual.set(field.name, Object.freeze(field.value)); }
      need(actual.size === site.length + 1 && actual.get("length")?.type === "number" && actual.get("length")?.value === site.length, "ARRAY_LENGTH"); for (let index = 0; index < site.length; index += 1) { need(actual.has(String(index)), "ARRAY_MEMBER"); }
      const fieldsValue = Object.freeze([...actual].map(([name, value]) => Object.freeze({ name, value })));
      const packet: CurrentProjectSaveProducerHeldCall = Object.freeze({ profile: "private.current-project-save-producer-held-call.v1" }); heldCalls.set(packet, Object.freeze({ observer: this, role, fields: fieldsValue })); this.#held = packet; return packet;
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy && !this.#closed, "RETIRE_STATE"); await this.#binding.assertOriginalGenerationExited(); this.#closed = true; }
}
