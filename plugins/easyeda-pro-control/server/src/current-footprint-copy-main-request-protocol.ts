/** Unmounted finite request collection grammar. Only a genuine combined native
 * owner may supply the original construction lease and shared main scheduler. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { assertCurrentFootprintCopyMainRequestFunction } from "./current-footprint-copy-main-request-source.ts";
import { validateCurrentFootprintCopyMainRequestCommand } from "./current-footprint-copy-main-request-contract.ts";
import type { CurrentFootprintCopyMainRequestCommand } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as EXPRESSIONS,
  CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-request-collect-programs.ts";

export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS = Object.freeze({ normal: 23, cleanup: 9, total: 32 });
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES = Object.freeze(["request-remove", "request-resume", "request-release"] as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES = freezeDeep({
  driver: { lineNumber: 1164, columnNumber: 2453, functionLine: 1164, functionColumn: 2434, name: "" },
  context: { lineNumber: 1164, columnNumber: 2540, functionLine: 1164, functionColumn: 2434, name: "" },
  controller: { lineNumber: 8573, columnNumber: 1663, functionLine: 8573, functionColumn: 1648, name: "createProjectHistory" },
  editHead: { lineNumber: 8572, columnNumber: 27_776, functionLine: 8572, functionColumn: 27_772, name: "PB" },
} as const);
export type CurrentFootprintCopyMainRequestCollectionStage = keyof typeof CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES;
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_ORDER = Object.freeze(["driver", "context", "controller", "editHead"] as const);
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false) };
const contextLocation = z.object({ scriptId: handle, lineNumber: z.literal(1164), columnNumber: z.literal(2540) }).strict();
const controllerLocation = z.object({ scriptId: handle, lineNumber: z.literal(8573), columnNumber: z.literal(1663) }).strict();
const editHeadLocation = z.object({ scriptId: handle, lineNumber: z.literal(8572), columnNumber: z.literal(27_776) }).strict();
const sourceParameters = z.object({ location: z.union([contextLocation, controllerLocation, editHeadLocation]) }).strict();
const frameParameters = z.object({ callFrameId: handle, expression: z.enum(Object.values(EXPRESSIONS)), objectGroup: z.literal(GROUP), silent: z.literal(true),
  returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict();
const invocationParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.invocation),
  arguments: z.tuple([object, object]), returnByValue: z.literal(false) }).strict();
const joinParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.contextJoin),
  arguments: z.tuple([object]), returnByValue: z.literal(true) }).strict();
const driverParameters = z.object({ objectId: handle }).strict(), removeParameters = z.object({ breakpointId: handle }).strict();
const releaseParameters = z.object({ objectGroup: z.literal(GROUP) }).strict();
const empty = z.object({}).strict();
const extraCommand = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("request-driver-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: driverParameters }).strict(),
  z.object({ phase: z.literal("request-site-arm"), method: z.literal("Debugger.setBreakpoint"), params: sourceParameters }).strict(),
  z.object({ phase: z.literal("request-invocation-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParameters }).strict(),
  z.object({ phase: z.literal("request-invocation"), method: z.literal("Runtime.callFunctionOn"), params: invocationParameters }).strict(),
  z.object({ phase: z.literal("request-context-join"), method: z.literal("Runtime.callFunctionOn"), params: joinParameters }).strict(),
  z.object({ phase: z.literal("request-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParameters }).strict(),
  z.object({ phase: z.literal("request-resume"), method: z.literal("Debugger.resume"), params: empty }).strict(),
  z.object({ phase: z.literal("request-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParameters }).strict(),
]);
export type CurrentFootprintCopyMainRequestCollectCommand = CurrentFootprintCopyMainRequestCommand | Readonly<z.infer<typeof extraCommand>>;
export function validateCurrentFootprintCopyMainRequestCollectCommand(input: unknown): CurrentFootprintCopyMainRequestCollectCommand {
  const captured = captureCurrentPcbStringClockReply(input).value, extra = extraCommand.safeParse(captured);
  return freezeDeep(extra.success ? extra.data : validateCurrentFootprintCopyMainRequestCommand(captured));
}
export function currentFootprintCopyMainRequestSourceArm(stage: "context" | "controller" | "editHead", scriptId: string): CurrentFootprintCopyMainRequestCollectCommand {
  const site = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[stage];
  return validateCurrentFootprintCopyMainRequestCollectCommand({ phase: "request-site-arm", method: "Debugger.setBreakpoint",
    params: { location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_MAIN_REQUEST_COLLECTION_REPLY"); } }
const frame = z.looseObject({ callFrameId: handle, functionName: z.string().max(128), location: point, functionLocation: point });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(64) });
export function decodeCurrentFootprintCopyMainRequestCollectionPause(input: unknown, stage: CurrentFootprintCopyMainRequestCollectionStage,
  scriptId: string, breakpointId: string): Readonly<{ frameId: string; callerFrameId: string | null }> {
  const event = pause.parse(captureCurrentPcbStringClockReply(input).value), first = event.callFrames[0], site = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[stage];
  need(first !== undefined && event.hitBreakpoints[0] === breakpointId && first.functionName === site.name && first.location.scriptId === scriptId &&
    first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber && first.functionLocation.scriptId === scriptId &&
    first.functionLocation.lineNumber === site.functionLine && first.functionLocation.columnNumber === site.functionColumn);
  if (stage === "driver" || stage === "context" || stage === "editHead") {
    const caller = event.callFrames[1]; const actor = stage === "editHead";
    need(caller !== undefined && caller.functionName === (actor ? "L3" : "interceptHttpProtocol") && caller.location.scriptId === scriptId &&
      caller.location.lineNumber === (actor ? 8573 : 1164) && caller.location.columnNumber === (actor ? 267 : 51_414) && caller.functionLocation.scriptId === scriptId &&
      caller.functionLocation.lineNumber === (actor ? 8573 : 1164) && caller.functionLocation.columnNumber === (actor ? 31 : 51_072));
    return Object.freeze({ frameId: first.callFrameId, callerFrameId: caller.callFrameId });
  }
  return Object.freeze({ frameId: first.callFrameId, callerFrameId: null });
}
export function currentFootprintCopyMainRequestAllocatedId(input: unknown): string | null {
  const parsed = z.looseObject({ breakpointId: handle }).safeParse(captureCurrentPcbStringClockReply(input).value); return parsed.success ? parsed.data.breakpointId : null;
}
export function decodeCurrentFootprintCopyMainRequestAllocation(input: unknown, stage: CurrentFootprintCopyMainRequestCollectionStage, scriptId: string): string {
  if (stage === "driver") { return z.object({ breakpointId: handle }).strict().parse(captureCurrentPcbStringClockReply(input).value).breakpointId; }
  const parsed = z.object({ breakpointId: handle, actualLocation: point }).strict().parse(captureCurrentPcbStringClockReply(input).value), site = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES[stage];
  need(parsed.actualLocation.scriptId === scriptId && parsed.actualLocation.lineNumber === site.lineNumber && parsed.actualLocation.columnNumber === site.columnNumber); return parsed.breakpointId;
}
export function decodeCurrentFootprintCopyMainRequestArrayCapture(input: unknown, length: number): string {
  const parsed = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string().max(32), objectId: handle }).strict() }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  need(parsed.result.description === `Array(${String(length)})`); return parsed.result.objectId;
}
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
export function decodeCurrentFootprintCopyMainRequestArrayMember(input: unknown, length: number, index: number,
  kind: "editHead" | "sqlQueryOne" | "promise"): string {
  const reply = z.object({ result: z.array(property).length(length + 1), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const entries = new Map(reply.result.map(item => [item.name, item])); const size = entries.get("length"); const parent = reply.internalProperties[0];
  need(entries.size === length + 1 && size?.value.type === "number" && size.value.value === length && size.value.objectId === undefined &&
    size.writable && !size.enumerable && !size.configurable && parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.objectId !== undefined);
  for (let i = 0; i < length; i += 1) { const entry = entries.get(String(i)); need(entry !== undefined && entry.writable && entry.enumerable && entry.configurable); }
  const value = entries.get(String(index))?.value;
  need(value !== undefined && value.objectId !== undefined && value.value === undefined);
  if (kind === "promise") { need(value.type === "object" && value.subtype === "promise" && value.className === "Promise"); }
  else { need(value.type === "function" && value.subtype === undefined && value.className === (kind === "editHead" ? "AsyncFunction" : "Function")); assertCurrentFootprintCopyMainRequestFunction(kind, value.description); }
  return value.objectId;
}
export function decodeCurrentFootprintCopyMainRequestCollectedFunction(input: unknown, role: "editHead" | "sqlQueryOne", scriptId: string): void {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const entries = new Map(reply.result.map(item => [item.name, item])); const details = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const length = entries.get("length"); const name = entries.get("name"); const location = details.get("[[FunctionLocation]]"), parent = details.get("[[Prototype]]"), scopes = details.get("[[Scopes]]");
  const actor = role === "editHead", actual = point.parse(location?.value);
  need(entries.size === 2 && length?.value.type === "number" && length.value.value === (actor ? 1 : 0) && !length.writable && !length.enumerable && length.configurable &&
    name?.value.type === "string" && name.value.value === (actor ? "PB" : "queryOne") && !name.writable && !name.enumerable && name.configurable &&
    details.size === 3 && location?.type === "object" && location.subtype === "internal#location" && actual.scriptId === scriptId &&
    actual.lineNumber === (actor ? 8572 : 1025) && actual.columnNumber === (actor ? 27_772 : 2771) &&
    parent?.type === (actor ? "object" : "function") && parent.className === (actor ? "AsyncFunction" : "Function") && parent.objectId !== undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}
export function requireCurrentFootprintCopyMainRequestEmpty(input: unknown): void { empty.parse(captureCurrentPcbStringClockReply(input).value); }
