/** Original saved-footprint cache jobs, guarded before each native put. */
/* oxlint-disable import/max-dependencies -- Closed original origin, source/caller/intrinsic proofs and the separate finite eight-job cursor are all mandatory. */
import { types } from "node:util";
import { z } from "zod";
// oxlint-disable-next-line import/no-namespace -- One exact original issuer; no caller validator fallback.
import * as native from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS as FRAME } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS, currentProjectSaveProducerCacheCallerFrame } from "./current-project-save-producer-cache-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS as CACHE_CALLS } from "./current-project-save-producer-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CurrentFootprintInverseInitialCacheCursor } from "./current-footprint-inverse-initial-cache-cursor.ts";
import type { CurrentFootprintInverseInitialCacheHeld } from "./current-footprint-inverse-initial-cache-cursor.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES as ROLES, currentFootprintInverseInitialCacheBudget, validateCurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheBindings, CurrentFootprintInverseInitialCacheCompletion, CurrentFootprintInverseInitialCacheOrigin } from "./current-footprint-inverse-initial-cache-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.looseObject({ name: z.string(), isOwn: z.literal(true), value: remote, get: z.never().optional(), set: z.never().optional() });
const properties = z.looseObject({ result: z.array(property).max(16) });
const at = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location: at, functionLocation: at, returnValue: z.unknown().optional() });
const event = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle, params: z.unknown() });
const pause = z.looseObject({reason:z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_ORIGINAL"); } }
const lookupSchema = z.custom<(origin: CurrentFootprintInverseInitialCacheOrigin, owner: object, prepared: object) => CurrentFootprintInverseInitialCacheBindings>(value => typeof value === "function" && !types.isProxy(value));
const completions=new WeakMap<CurrentFootprintInverseInitialCacheCompletion,Readonly<{observer:CurrentFootprintInverseInitialCacheObserver;origin:CurrentFootprintInverseInitialCacheOrigin;owner:object;prepared:object}>>();
export function requireOriginalCurrentFootprintInverseInitialCacheCompletion(packet:CurrentFootprintInverseInitialCacheCompletion,observer:CurrentFootprintInverseInitialCacheObserver,origin:CurrentFootprintInverseInitialCacheOrigin,owner:object,prepared:object):void{const original=completions.get(packet);need(original!==undefined&&original.observer===observer&&original.origin===origin&&original.owner===owner&&original.prepared===prepared);}
export class CurrentFootprintInverseInitialCacheObserver {
  readonly #origin: CurrentFootprintInverseInitialCacheOrigin; readonly #owner: object; readonly #prepared: object;
  readonly #lookup: z.infer<typeof lookupSchema>; readonly #binding: CurrentFootprintInverseInitialCacheBindings;
  readonly #cursor: CurrentFootprintInverseInitialCacheCursor; readonly #packets = new WeakMap<object, CurrentFootprintInverseInitialCacheHeld>();
  readonly #occurrences = new Map<string, number>(); #held: CurrentFootprintInverseInitialCacheHeld | null = null;
  #captureRequests = 0; #events = 0; #failed = false; #busy = false;
  public constructor(origin: CurrentFootprintInverseInitialCacheOrigin, owner: object, prepared: object) {
    this.#origin = origin; this.#owner = owner; this.#prepared = prepared;
    this.#lookup = lookupSchema.parse(Reflect.get(native, "requireOriginalCurrentFootprintInverseInitialCacheOrigin")); this.#binding = this.#lookup(origin, owner, prepared);
    const current = (): Promise<void> => { this.#current(); return Promise.resolve(); };
    this.#cursor = new CurrentFootprintInverseInitialCacheCursor(this.#binding.data, Object.freeze({ assertCurrent: current,
      requireHeld: (packet: object): CurrentFootprintInverseInitialCacheHeld => { this.#current(); const original = this.#packets.get(packet); need(original !== undefined && original === this.#held); return original; },
      request: (command: CurrentFootprintInverseInitialCacheCommand): Promise<unknown> => this.#send(command, false),
      resume: async (held: CurrentFootprintInverseInitialCacheHeld, command: CurrentFootprintInverseInitialCacheCommand): Promise<void> => {
        this.#current(); need(this.#held === held); z.strictObject({}).parse(await this.#send(command, false)); const resumed = await this.#event(); need(resumed.method === "Debugger.resumed"); z.strictObject({}).parse(resumed.params); this.#held = null;
      }, complete:async():Promise<void>=>{this.#current();const packet:CurrentFootprintInverseInitialCacheCompletion=Object.freeze({profile:"private.current-footprint-inverse-initial-cache-completion.v1"});completions.set(packet,Object.freeze({observer:this,origin:this.#origin,owner:this.#owner,prepared:this.#prepared}));await this.#binding.complete(packet);this.#current();}, fail: (): void => { this.#failed = true; this.#binding.fail(); } })); Object.freeze(this);
  }
  #current(): void { need(!this.#failed && this.#lookup === Reflect.get(native, "requireOriginalCurrentFootprintInverseInitialCacheOrigin") && this.#lookup(this.#origin, this.#owner, this.#prepared) === this.#binding); this.#binding.assertCurrent(); }
  async #send(input: CurrentFootprintInverseInitialCacheCommand, capture = true): Promise<unknown> {
    this.#current(); const command = validateCurrentFootprintInverseInitialCacheCommand(input); if (capture) { this.#captureRequests += 1; need(this.#captureRequests <= currentFootprintInverseInitialCacheBudget(this.#binding.data.jobs.length).captureNormal); }
    const reply = captureCurrentPcbStringClockReply(await this.#binding.request(command)).value; this.#current(); return reply;
  }
  async #event(): Promise<z.infer<typeof event>> {
    this.#current(); this.#events += 1; need(this.#events <= 6 * this.#binding.data.jobs.length); const result = event.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value); this.#current(); need(result.sessionId === this.#binding.actual.sessionId); return result;
  }
  async #array(id: string, length: number, phase: "project-save-producer-properties" | "project-save-producer-cache-properties"): Promise<Map<string, z.infer<typeof remote>>> {
    const reply = properties.parse(await this.#send({ phase, method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
    const values = new Map(reply.result.map(field => [field.name, field.value])); need(values.size === length + 1 && values.size === reply.result.length && values.get("length")?.value === length && Array.from({ length }, (_, index) => values.has(String(index))).every(Boolean)); return values;
  }
  public async serviceOriginalHeld(): Promise<void> {
    this.#current(); need(!this.#busy && this.#held === null); this.#busy = true;
    try {
      const original = await this.#event(); need(original.method === "Debugger.paused"); const received = pause.parse(original.params);
      const role = ROLES.find(name => this.#binding.originalBreakpoints.some(point => point.role === name && point.id === received.hitBreakpoints[0])), top = received.callFrames[0]; need(role !== undefined && top !== undefined);
      const actual = this.#binding.actual, producer = this.#binding.producer, site = SITES[role];
      need(top.location.scriptId === actual.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === actual.scriptId && top.functionLocation.lineNumber === site.functionLineNumber && top.functionLocation.columnNumber === site.functionColumnNumber);
      const count = (this.#occurrences.get(role) ?? 0) + 1; need(count <= this.#binding.data.jobs.length); this.#occurrences.set(role, count);
      const captured = await this.#send({ phase: "project-save-producer-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId: top.callFrameId, expression: site.expression } });
      const frameId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(captured, site.length);
      const joined = await this.#send({ phase: "project-save-producer-receiver", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frameId, functionDeclaration: CALLS[role], arguments: [{ objectId: actual.project }, { objectId: producer.wrapper }, { objectId: producer.callback }] } });
      const joinedId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(joined, site.length); const fields = await this.#array(joinedId, site.length, "project-save-producer-properties"); const key = fields.get("1"); need(key?.type === "string" && typeof key.value === "string");
      let cache: CurrentFootprintInverseInitialCacheHeld["cache"] = null, promise: CurrentFootprintInverseInitialCacheHeld["promise"] = null;
      if (role === "headPromise") {
        const id = currentProjectSaveProducerCachePromiseHandle(top.returnValue); const retained = await this.#send({ phase: "project-save-producer-cache-promise", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: id, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } });
        const owned = currentProjectSaveProducerCachePromiseHandle(z.strictObject({ result: z.unknown() }).parse(retained).result); decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "project-save-producer-cache-promise-properties", method: "Runtime.getProperties", params: { objectId: owned, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); promise = Object.freeze({ objectId: owned });
      }
      if (role === "headEntry") {
        const caller = currentProjectSaveProducerCacheCallerFrame(original, actual.scriptId); need(caller.role === "flow" || caller.role === "openCloudHead"); const callerSite = CALLERS[caller.role];
        const rawCaller = await this.#send({ phase: "project-save-producer-cache-caller", cacheRole: caller.role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId: caller.callFrameId, expression: callerSite.expression } });
        const callerId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(rawCaller, callerSite.length);
        const capturedCache = await this.#send({ phase: "project-save-producer-cache-receiver", cacheRole: caller.role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: joinedId, functionDeclaration: CACHE_CALLS[caller.role], arguments: [{ objectId: actual.project }, { objectId: producer.wrapper }, { objectId: producer.callback }, { objectId: this.#binding.intrinsics }, { objectId: callerId }] } });
        const cacheId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(capturedCache, 10), metadata = await this.#array(cacheId, 10, "project-save-producer-cache-properties");
        need(metadata.get("6")?.value === key.value && metadata.get("8")?.value === this.#binding.data.projectUuid && metadata.get("9")?.value === this.#binding.data.branchUuid); cache = Object.freeze({ role: caller.role, joinedId: cacheId });
      }
      const packet = Object.freeze({ profile: "private.current-footprint-inverse-initial-cache-held.v1" }); const held = Object.freeze({ packet, role, key: key.value, joinedId, cache, promise }); this.#packets.set(packet, held); this.#held = held; await this.#cursor.continue(packet); this.#current(); need(this.#held === null);
    } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; }
  }
  public async settleOriginal(): Promise<void> { this.#current(); need(!this.#busy && this.#held === null); this.#busy = true; try { await this.#cursor.settle(); this.#current(); } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; } }
  public originalHeadEntry(): string { this.#current(); return this.#cursor.originalHeadEntry(); }
  public requireCompleted(): void { this.#current(); this.#cursor.requireCompleted(); }
  public status(): ReturnType<CurrentFootprintInverseInitialCacheCursor["status"]> { return this.#cursor.status(); }
}
