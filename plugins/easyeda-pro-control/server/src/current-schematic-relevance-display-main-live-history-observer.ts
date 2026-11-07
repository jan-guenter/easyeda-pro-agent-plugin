/** One original live selected-history read. Actual DB timestamps remain
 * private data; no SQL, producer, cache or persistence grant is issued. */
import { z } from "zod";
import { requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";
import type { CurrentPcbViaMainLiveHistoryRows } from "./current-pcb-via-main-live-history-custody.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "./current-pcb-via-main-live-history-source.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_CALL_FLAGS as CALL, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FRAME_FLAGS as FRAME, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_GROUP as GROUP, validateCurrentPcbViaMainLiveHistoryCommand } from "./current-pcb-via-main-live-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_PROGRAMS as PROGRAMS } from "./current-pcb-via-main-live-history-programs.ts";

const object = z.strictObject({ result: z.looseObject({ type: z.literal("object"), subtype: z.literal("array"), objectId: z.string() }) });
const frameDescription = z.looseObject({ callFrameId: z.string() });
const pauseDescription = z.looseObject({ hitBreakpoints: z.tuple([z.string()]), callFrames: z.array(frameDescription).min(1).max(64) });
const pauseEvent = z.strictObject({ method: z.literal("Debugger.paused"), params: pauseDescription });
const memberValue = z.looseObject({ objectId: z.string().optional() }); const member = z.looseObject({ name: z.string(), value: memberValue.optional() });
const promiseMember = z.looseObject({ name: z.string(), value: memberValue });
const promiseProperties = z.looseObject({ internalProperties: z.array(promiseMember) });
const packetProperties = z.looseObject({ result: z.array(member) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_RELEVANCE_MAIN_LIVE_OBSERVER_${reason}`); } }
export class CurrentSchematicRelevanceDisplayMainLiveHistoryObserver {
  readonly #origin: CurrentSchematicRelevanceDisplaySaveMainOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #plan: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #bindings: ReturnType<typeof requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin>;
  #point: string | null = null; #armAttempted = false; #observed = false; #busy = false; #failed = false;
  public constructor(origin: CurrentSchematicRelevanceDisplaySaveMainOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, plan: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#plan = plan; this.#bindings = requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(origin, owner, plan); Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "ORIGINAL");
    this.#owner.requireSchematicRelevanceDisplayHistorySqlEffects(this.#plan); await this.#bindings.assertCurrent();
    need(!this.#failed && requireOriginalCurrentSchematicRelevanceDisplaySaveMainOrigin(this.#origin, this.#owner, this.#plan) === this.#bindings, "CHANGED"); this.#bindings.assertSaveAttempt();
  }
  async #send(input: unknown, cleanup = false): Promise<unknown> {
    await this.#current(); const reply = captureCurrentPcbStringClockReply(await this.#bindings.liveHistoryRequest(validateCurrentPcbViaMainLiveHistoryCommand(input), cleanup)).value;
    await this.#current(); return reply;
  }
  public async arm(): Promise<void> {
    need(!this.#armAttempted && !this.#busy, "ARM_CONSUMED"); this.#armAttempted = true; this.#busy = true;
    try { const reply = await this.#send({ phase: "via-main-live-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#bindings.scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } } });
      this.#point = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(reply).breakpointId;
    } catch (caughtError) { this.#failed = true; this.#bindings.fail(); throw caughtError; } finally { this.#busy = false; }
  }
  public async observe(): Promise<CurrentPcbViaMainLiveHistoryRows> {
    need(this.#point !== null && !this.#observed && !this.#busy, "OBSERVATION_CONSUMED"); this.#observed = true; this.#busy = true;
    try {
      let frameId: string | null = null;
      for (let i = 0; i < 64; i += 1) {
        const raw = captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value; await this.#current();
        const event = pauseEvent.parse(raw);
        if (event.params.hitBreakpoints[0] === this.#bindings.persistentDriverBreakpointId) {
          const request = await this.#bindings.observeRequest(); this.#bindings.requireOriginalRequest(request);
          need(request.method === "GET" || request.method === "HEAD", "FOREIGN_WRITE"); await this.#bindings.continueReadonlyRequest(request);
        } else { need(event.params.hitBreakpoints[0] === this.#point, "ORIGINAL_RETURN_POINT"); frameId = event.params.callFrames[0]?.callFrameId ?? null; break; }
      }
      need(frameId !== null, "RETURN_BOUND");
      const frame = object.parse(await this.#send({ phase: "via-main-live-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId: frameId, expression: SITE.expression } })).result.objectId;
      // The SQL-owner receiver is supplied by the original backend, never the
      // Caller. Its private request closure verifies both exact arguments.
      const originalRequest = this.#bindings.originalLiveHistoryRequestObjectId();
      const capture = object.parse(await this.#send({ phase: "via-main-live-join", role: "capture", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: frame, functionDeclaration: PROGRAMS.capture.program,
        arguments: [{ objectId: this.#bindings.sqlCaptureObjectId }, { objectId: originalRequest }], returnByValue: false } })).result.objectId;
      const properties = packetProperties.parse(await this.#send({ phase: "via-main-live-properties", role: "packet", method: "Runtime.getProperties", params: { objectId: capture, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
      const promiseId = properties.result.find(item => item.name === "8")?.value?.objectId; need(typeof promiseId === "string", "ORIGINAL_DB_PROMISE");
      const promise = promiseProperties.parse(await this.#send({ phase: "via-main-live-properties", role: "promise", method: "Runtime.getProperties", params: { objectId: promiseId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
      const resolved = promise.internalProperties.find(item => item.name === "[[PromiseResult]]")?.value.objectId; need(typeof resolved === "string", "ORIGINAL_DB_RESULT");
      await this.#send({ phase: "via-main-live-join", role: "resolved", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.resolved.program, arguments: [{ objectId: resolved }], returnByValue: true } });
      for (const [role, original] of Object.entries(FUNCTIONS)) {
        const objectId = properties.result.find(item => item.name === String(original.index))?.value?.objectId; need(typeof objectId === "string", "ORIGINAL_FUNCTION");
        await this.#send({ phase: "via-main-live-properties", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
      }
      await this.#send({ phase: "via-main-live-join", role: "value", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.value.program, arguments: [], returnByValue: true } });
      await this.#send({ phase: "via-main-live-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#point } }, true);
      await this.#send({ phase: "via-main-live-step", method: "Debugger.resume", params: {} });
      await this.#send({ phase: "via-main-live-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true);
      const rows = this.#bindings.originalLiveHistoryRows(); need(this.#owner.requireSchematicRelevanceDisplayLiveHistoryRows(this.#plan) === rows, "ORIGINAL_COMPLETED_ROWS"); return rows;
    } catch (caughtError) { this.#failed = true; this.#bindings.fail(); throw caughtError; } finally { this.#busy = false; }
  }
}
