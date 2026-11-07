/** Finite read on the actual source-held yB return. The owning Main cursor
 * supplies its original custody, frame, DB capture and request capture. */
import { z } from "zod";
import type { CurrentFootprintInverseMainHistoryCustody, CurrentFootprintInverseMainHistoryRows } from "./current-footprint-inverse-main-history-custody.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "./current-pcb-via-main-live-history-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_CALL_FLAGS as CALL, CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_FRAME_FLAGS as FRAME,
  CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_GROUP as GROUP } from "./current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-main-history-programs.ts";

const object = z.strictObject({ result: z.looseObject({ type: z.literal("object"), subtype: z.literal("array"), objectId: z.string() }) });
const member = z.looseObject({ name: z.string(), value: z.looseObject({ objectId: z.string().optional() }).optional() });
const members = z.looseObject({ result: z.array(member) });
const promiseValue = z.looseObject({ objectId: z.string().optional() });
const promiseMember = z.looseObject({ name: z.string(), value: promiseValue });
const promise = z.looseObject({ internalProperties: z.array(promiseMember) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_ORIGINAL_MEMBER"); } }
export class CurrentFootprintInverseMainHistoryCollector {
  readonly #custody: CurrentFootprintInverseMainHistoryCustody; readonly #sql: string;
  #point: string | null = null; #armed = false; #attempted = false;
  public constructor(custody: CurrentFootprintInverseMainHistoryCustody, sqlCapture: string) { this.#custody = custody; this.#sql = sqlCapture; Object.freeze(this); }
  public async arm(scriptId: string): Promise<void> {
    need(!this.#armed); this.#armed = true;
    const reply = await this.#custody.request({ phase: "inverse-main-history-arm", method: "Debugger.setBreakpoint",
      params: { location: { scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } } }, false);
    this.#point = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(reply).breakpointId;
  }
  /** Each generation of this collector consumes exactly one real request. */
  public async observeHeld(frameId: string): Promise<CurrentFootprintInverseMainHistoryRows> {
    need(this.#point !== null && !this.#attempted); this.#attempted = true;
    const request = this.#custody.originalRequestObjectId();
    const frame = object.parse(await this.#custody.request({ phase: "inverse-main-history-frame", method: "Debugger.evaluateOnCallFrame",
      params: { ...FRAME, callFrameId: frameId, expression: SITE.expression } }, false)).result.objectId;
    const capture = object.parse(await this.#custody.request({ phase: "inverse-main-history-join", role: "capture", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: frame, functionDeclaration: PROGRAMS.capture.program, arguments: [{ objectId: this.#sql }, { objectId: request }], returnByValue: false } }, false)).result.objectId;
    const properties = members.parse(await this.#custody.request({ phase: "inverse-main-history-properties", role: "packet", method: "Runtime.getProperties",
      params: { objectId: capture, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, false));
    const promiseId = properties.result.find(row => row.name === "8")?.value?.objectId; need(typeof promiseId === "string");
    const state = promise.parse(await this.#custody.request({ phase: "inverse-main-history-properties", role: "promise", method: "Runtime.getProperties",
      params: { objectId: promiseId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, false));
    const resolved = state.internalProperties.find(row => row.name === "[[PromiseResult]]")?.value.objectId; need(typeof resolved === "string");
    await this.#custody.request({ phase: "inverse-main-history-join", role: "resolved", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.resolved.program, arguments: [{ objectId: resolved }], returnByValue: true } }, false);
    for (const [role, original] of Object.entries(FUNCTIONS)) {
      const objectId = properties.result.find(row => row.name === String(original.index))?.value?.objectId; need(typeof objectId === "string");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.entries enumerates only this fixed three-member source roster.
      const fixedRole = role as keyof typeof FUNCTIONS;
      await this.#custody.request({ phase: "inverse-main-history-properties", role: fixedRole, method: "Runtime.getProperties",
        params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, false);
    }
    await this.#custody.request({ phase: "inverse-main-history-join", role: "value", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.value.program, arguments: [], returnByValue: true } }, false);
    await this.#custody.request({ phase: "inverse-main-history-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#point } }, true);
    await this.#custody.request({ phase: "inverse-main-history-step", method: "Debugger.resume", params: {} }, false);
    await this.#custody.request({ phase: "inverse-main-history-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true);
    return this.#custody.result();
  }
}
