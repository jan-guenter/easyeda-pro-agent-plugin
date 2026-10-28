/** Fixed post-await capture of the two clocks used by native footprint create.
 * This protocol never calls qe. Its original owner must supply the pinned
 * worker, retained manager/lexical bundle, dispatch intent and pause routing. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES = freezeDeep([
  // V8 pauses at the property access, after the preceding await result was
  // Assigned. Declarator starts36821/42317 relocate and must not be requested.
  { role: "buildString", lineNumber: 109, columnNumber: 36_825, expression: "[this,n,l,qe]" },
  { role: "canvasString", lineNumber: 109, columnNumber: 42_324, expression: "[this,s,a,qe]" },
] as const);
export const CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP = "easyeda-footprint-copy-clocks-v1";
/** 2 breakpoint allocations, 2 frame captures, 2 receiver/producer relations,
 * 2 removals, 2 resumes, 1 group release. Owner reproof and dispatch are extra. */
export const CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS = 11;
export const CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION = String.raw`function(sample,producers){"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_CLOCK_RELATION");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
array(sample,4);array(producers,10);
if(own(sample,"0")!==this||own(sample,"3")!==own(producers,"2")||typeof own(sample,"3")!=="function"||own(this,"user")!==undefined)bad();
const documentUuid=own(sample,"1"),updateTime=own(sample,"2");
if(typeof documentUuid!=="string"||!/^[a-f\d]{16}$/.test(documentUuid)||typeof updateTime!=="number"||!Number.isSafeInteger(updateTime)||updateTime<=0||updateTime>8640000000000000)bad();
for(const [o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}
return {documentUuid,updateTime};}`;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: token, functionName: z.string().max(128), location });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([token]), callFrames: z.array(frame).min(1).max(32) });
const capture = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(4)"), objectId: token }).strict() }).strict();
const value = z.object({ documentUuid: z.string().regex(/^[a-f\d]{16}$/u), updateTime: z.number().int().positive().max(8_640_000_000_000_000) }).strict();
const relation = z.object({ result: z.object({ type: z.literal("object"), value }).strict() }).strict();
export type CurrentFootprintCopyTransactionClockRole = typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES[number]["role"];
export type CurrentFootprintCopyTransactionClockCommand =
  | Readonly<{ method: "Debugger.setBreakpoint"; params: Readonly<{ location: z.infer<typeof location> }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ method: "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP }> }>
  | Readonly<{ method: "Debugger.evaluateOnCallFrame"; params: Readonly<{ callFrameId: string;
    expression: typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES[number]["expression"];
    objectGroup: typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP; returnByValue: false; silent: true;
    throwOnSideEffect: true; generatePreview: false; includeCommandLineAPI: false }> }>
  | Readonly<{ method: "Runtime.callFunctionOn"; params: Readonly<{ objectId: string;
    functionDeclaration: typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION;
    arguments: readonly [Readonly<{ objectId: string }>, Readonly<{ objectId: string }>];
    objectGroup: typeof CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP; returnByValue: true; silent: true;
    throwOnSideEffect: true; generatePreview: false; awaitPromise: false; userGesture: false }> }>;
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_TRANSACTION_CLOCK_PROTOCOL"); } }
export function currentFootprintCopyTransactionClockHandle(input: unknown): string { return token.parse(input); }
export function decodeCurrentFootprintCopyTransactionClockAllocation(input: unknown, scriptId: string, index: number): string {
  const result = z.object({ breakpointId: token, actualLocation: location }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const site = CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES[index];
  need(site !== undefined && result.actualLocation.scriptId === scriptId && result.actualLocation.lineNumber === site.lineNumber &&
    result.actualLocation.columnNumber === site.columnNumber); return result.breakpointId;
}
/** Retain a returned breakpoint even if its actual location later refuses. */
export function currentFootprintCopyTransactionClockAllocatedId(input: unknown): string | null {
  const result = z.looseObject({ breakpointId: token }).safeParse(captureCurrentPcbStringClockReply(input).value);
  return result.success ? result.data.breakpointId : null;
}
export function decodeCurrentFootprintCopyTransactionClockPause(input: unknown, scriptId: string, index: number, breakpointId: string): string {
  const stopped = pause.parse(captureCurrentPcbStringClockReply(input).value);
  const site = CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES[index], top = stopped.callFrames[0];
  need(site !== undefined && top !== undefined && stopped.hitBreakpoints[0] === breakpointId && top.functionName === site.role &&
    top.location.scriptId === scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber);
  return top.callFrameId;
}
export function decodeCurrentFootprintCopyTransactionClockCapture(input: unknown): string {
  return capture.parse(captureCurrentPcbStringClockReply(input).value).result.objectId;
}
export function decodeCurrentFootprintCopyTransactionClockValue(input: unknown): Readonly<z.infer<typeof value>> {
  return Object.freeze(relation.parse(captureCurrentPcbStringClockReply(input).value).result.value);
}
export function requireCurrentFootprintCopyTransactionClockEmpty(input: unknown): void {
  z.object({}).strict().parse(captureCurrentPcbStringClockReply(input).value);
}
