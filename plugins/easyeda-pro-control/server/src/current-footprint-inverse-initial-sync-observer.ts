/** Original inverse startup sync collector. No generated owner/origin or
 * caller-supplied row observation can enter its private continuation registry. */
/* oxlint-disable import/max-dependencies -- Original registry, strict source/frame/metadata projections and own finite cursor are all mandatory. */
import { types } from "node:util";
import { z } from "zod";
// oxlint-disable-next-line import/no-namespace -- Only the original central private issuer is accepted.
import * as native from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS as FRAME } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { currentGeneratedInitialSyncFrames } from "./current-generated-initial-sync-replies.ts";
import { CurrentFootprintInverseInitialSyncCursor } from "./current-footprint-inverse-initial-sync-cursor.ts";
import type { CurrentFootprintInverseInitialSyncHeld } from "./current-footprint-inverse-initial-sync-cursor.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_ROLES as ROLES, validateCurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { CurrentFootprintInverseInitialSyncCommand, CurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { CurrentFootprintInverseInitialSyncCompletion, CurrentFootprintInverseInitialSyncOrigin, CurrentFootprintInverseInitialSyncOriginBindings } from "./current-footprint-inverse-initial-sync-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const at = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location: at, functionLocation: at });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
const event = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle, params: z.unknown() });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_ORIGINAL"); } }
const lookupSchema = z.custom<(origin: CurrentFootprintInverseInitialSyncOrigin, owner: object, prepared: object) => CurrentFootprintInverseInitialSyncOriginBindings>(value => typeof value === "function" && !types.isProxy(value));
const completed = new WeakMap<CurrentFootprintInverseInitialSyncCompletion, Readonly<{ observer: CurrentFootprintInverseInitialSyncObserver; origin: CurrentFootprintInverseInitialSyncOrigin; owner: object; prepared: object }>>();
export function requireOriginalCurrentFootprintInverseInitialSyncCompletion(packet: CurrentFootprintInverseInitialSyncCompletion, observer: CurrentFootprintInverseInitialSyncObserver, origin: CurrentFootprintInverseInitialSyncOrigin, owner: object, prepared: object): void { const found = completed.get(packet); need(found !== undefined && found.observer === observer && found.origin === origin && found.owner === owner && found.prepared === prepared); }
export class CurrentFootprintInverseInitialSyncObserver {
  readonly #origin: CurrentFootprintInverseInitialSyncOrigin; readonly #owner: object; readonly #prepared: object; readonly #lookup: z.infer<typeof lookupSchema>; readonly #binding: CurrentFootprintInverseInitialSyncOriginBindings;
  readonly #cursor: CurrentFootprintInverseInitialSyncCursor; readonly #packets = new WeakMap<object, CurrentFootprintInverseInitialSyncHeld>();
  #held: CurrentFootprintInverseInitialSyncHeld | null = null; #captures = 0; #events = 0; #busy = false; #failed = false;
  public constructor(origin: CurrentFootprintInverseInitialSyncOrigin, owner: object, prepared: object) {
    this.#origin = origin; this.#owner = owner; this.#prepared = prepared; this.#lookup = lookupSchema.parse(Reflect.get(native, "requireOriginalCurrentFootprintInverseInitialSyncOrigin")); this.#binding = this.#lookup(origin, owner, prepared);
    this.#cursor = new CurrentFootprintInverseInitialSyncCursor(this.#binding.data, Object.freeze({ scriptId: this.#binding.actual.scriptId, projectId: this.#binding.actual.project,
      assertCurrent: (): Promise<void> => { this.#current(); return Promise.resolve(); }, headEntry: this.#binding.headEntry,
      armHistory: this.#binding.armHistory, waitHistory: this.#binding.waitHistory, requireHistory: this.#binding.requireHistory,
      requireHeld: (packet: object): CurrentFootprintInverseInitialSyncHeld => { this.#current(); const held = this.#packets.get(packet); need(held !== undefined && held === this.#held); return held; },
      request: (command: CurrentFootprintInverseInitialSyncCommand): Promise<unknown> => this.#send(command),
      resume: async (held: CurrentFootprintInverseInitialSyncHeld, command: CurrentFootprintInverseInitialSyncCommand): Promise<void> => { this.#current(); need(this.#held === held); z.strictObject({}).parse(await this.#send(command)); const resumed = await this.#event(); need(resumed.method === "Debugger.resumed"); z.strictObject({}).parse(resumed.params); this.#held = null; },
      complete: async (): Promise<void> => { this.#current(); const packet: CurrentFootprintInverseInitialSyncCompletion = Object.freeze({ profile: "private.current-footprint-inverse-initial-sync-completion.v1" }); completed.set(packet, Object.freeze({ observer: this, origin: this.#origin, owner: this.#owner, prepared: this.#prepared })); await this.#binding.complete(packet); this.#current(); },
      fail: (): void => { this.#failed = true; this.#binding.fail(); },
    })); Object.freeze(this);
  }
  #current(): void { need(!this.#failed && Reflect.get(native, "requireOriginalCurrentFootprintInverseInitialSyncOrigin") === this.#lookup && this.#lookup(this.#origin, this.#owner, this.#prepared) === this.#binding); this.#binding.assertCurrent(); }
  async #send(input: CurrentFootprintInverseInitialSyncNativeCommand): Promise<unknown> { this.#current(); const reply = captureCurrentPcbStringClockReply(await this.#binding.request(validateCurrentFootprintInverseInitialSyncNativeCommand(input))).value; this.#current(); return reply; }
  async #event(): Promise<z.infer<typeof event>> { this.#current(); this.#events += 1; need(this.#events <= 18); const value = event.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value); this.#current(); need(value.sessionId === this.#binding.actual.sessionId); return value; }
  public async serviceOriginalHeld(): Promise<void> {
    this.#current(); need(!this.#busy && this.#held === null); this.#busy = true;
    try {
      const original = await this.#event(); need(original.method === "Debugger.paused"); const actual = this.#binding.actual, received = pause.parse(original.params);
      const role = ROLES.find(name => this.#binding.originalBreakpoints.some(point => point.role === name && point.id === received.hitBreakpoints[0])), top = received.callFrames[0]; need(role !== undefined && top !== undefined);
      const site = SITES[role]; need(top.location.scriptId === actual.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === actual.scriptId && top.functionLocation.lineNumber === site.functionLineNumber && top.functionLocation.columnNumber === site.functionColumnNumber);
      const source = currentGeneratedInitialSyncFrames(original, role, actual.scriptId); this.#captures += 3; need(this.#captures <= 27);
      const frameId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-save-producer-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId: top.callFrameId, expression: site.expression } }), site.length);
      const joinedId = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-save-producer-receiver", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: frameId, functionDeclaration: CALLS[role], arguments: [{ objectId: actual.project }, { objectId: this.#binding.producer.wrapper }, { objectId: this.#binding.producer.callback }] } }), site.length);
      decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: joinedId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), site.length);
      const packet = Object.freeze({ profile: "private.current-footprint-inverse-initial-sync-held.v1" }); const held = Object.freeze({ packet, role, joinedId, ...source }); this.#held = held; this.#packets.set(packet, held); await this.#cursor.continue(packet); this.#current(); need(this.#held === null);
    } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; }
  }
  public async settleOriginal(): Promise<void> { this.#current(); need(!this.#busy && this.#held === null); this.#busy = true; try { await this.#cursor.settle(); this.#current(); } catch (error) { this.#failed = true; this.#binding.fail(); throw error; } finally { this.#busy = false; } }
  public requireCompleted(): void { this.#current(); this.#cursor.requireCompleted(); }
  public status(): ReturnType<CurrentFootprintInverseInitialSyncCursor["startupProgress"]> { return this.#cursor.startupProgress(); }
}
