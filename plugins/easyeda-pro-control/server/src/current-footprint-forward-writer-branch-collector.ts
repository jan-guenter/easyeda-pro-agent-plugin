/** Finite read on the actual source-held branch-show return. The owning Main cursor
 * supplies its original custody, frame, DB capture and request capture. */
import { z } from "zod";
import type { CurrentFootprintForwardWriterBranchCustody, CurrentFootprintForwardWriterBranchRows } from "./current-footprint-forward-writer-branch-custody.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE as SITE } from "./current-footprint-forward-writer-branch-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_CALL_FLAGS as CALL, CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_FRAME_FLAGS as FRAME,
  CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_GROUP as GROUP } from "./current-footprint-forward-writer-branch-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_PROGRAMS as PROGRAMS } from "./current-footprint-forward-writer-branch-programs.ts";

const object = z.strictObject({ result: z.looseObject({ type: z.literal("object"), subtype: z.literal("array"), objectId: z.string() }) });
const member = z.looseObject({ name: z.string(), value: z.looseObject({ objectId: z.string().optional() }).optional() });
const members = z.looseObject({ result: z.array(member) });
const promiseValue = z.looseObject({ objectId: z.string().optional() });
const promiseMember = z.looseObject({ name: z.string(), value: promiseValue });
const promise = z.looseObject({ internalProperties: z.array(promiseMember) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_BRANCH_ORIGINAL_MEMBER"); } }
export class CurrentFootprintForwardWriterBranchCollector {
  readonly #custody: CurrentFootprintForwardWriterBranchCustody; readonly #sql: string;
  #point: string | null = null; #armed = false; #attempted = false;
  public constructor(custody: CurrentFootprintForwardWriterBranchCustody, sqlCapture: string) { this.#custody = custody; this.#sql = sqlCapture; Object.freeze(this); }
  public async arm(scriptId: string): Promise<void> {
    need(!this.#armed); this.#armed = true;
    const reply = await this.#custody.request({ phase: "forward-writer-branch-arm", method: "Debugger.setBreakpoint",
      params: { location: { scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } } }, false);
    this.#point = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(reply).breakpointId;
  }
  /** Each generation of this collector consumes exactly one real request. */
  public async observeHeld(frameId: string): Promise<CurrentFootprintForwardWriterBranchRows> {
    need(this.#point !== null && !this.#attempted); this.#attempted = true;
    try { return await this.#observeHeld(frameId); }
    catch (error) { this.#custody.failOriginalObservation(error); throw error; }
  }
  async #observeHeld(frameId: string): Promise<CurrentFootprintForwardWriterBranchRows> {
    const point = this.#point; need(point !== null);
    const request = this.#custody.originalRequestObjectId();
    const frame = object.parse(await this.#custody.request({ phase: "forward-writer-branch-frame", method: "Debugger.evaluateOnCallFrame",
      params: { ...FRAME, callFrameId: frameId, expression: SITE.expression } }, false)).result.objectId;
    const capture = object.parse(await this.#custody.request({ phase: "forward-writer-branch-join", role: "capture", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: frame, functionDeclaration: PROGRAMS.capture.program, arguments: [{ objectId: this.#sql }, { objectId: request }], returnByValue: false } }, false)).result.objectId;
    const properties = members.parse(await this.#custody.request({ phase: "forward-writer-branch-properties", role: "packet", method: "Runtime.getProperties",
      params: { objectId: capture, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, false));
    const promiseId = properties.result.find(row => row.name === "4")?.value?.objectId; need(typeof promiseId === "string");
    const state = promise.parse(await this.#custody.request({ phase: "forward-writer-branch-properties", role: "promise", method: "Runtime.getProperties",
      params: { objectId: promiseId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }, false));
    const resolved = state.internalProperties.find(row => row.name === "[[PromiseResult]]")?.value.objectId; need(typeof resolved === "string");
    await this.#custody.request({ phase: "forward-writer-branch-join", role: "resolved", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.resolved.program, arguments: [{ objectId: resolved }], returnByValue: true } }, false);
    await this.#custody.request({ phase: "forward-writer-branch-join", role: "value", method: "Runtime.callFunctionOn",
      params: { ...CALL, objectId: capture, functionDeclaration: PROGRAMS.value.program, arguments: [], returnByValue: true } }, false);
    await this.#custody.request({ phase: "forward-writer-branch-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point } }, true);
    await this.#custody.request({ phase: "forward-writer-branch-step", method: "Debugger.resume", params: {} }, false);
    await this.#custody.request({ phase: "forward-writer-branch-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true);
    return this.#custody.result();
  }
}
