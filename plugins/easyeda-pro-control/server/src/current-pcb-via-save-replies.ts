/** Bounded inert inspector decoders for the original Save observer. Matching
 * packets contain no transport, native owner or completion authority. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVE_METHODS as METHODS, CURRENT_PCB_VIA_SAVE_SITES as SITES, CURRENT_PCB_VIA_SAVE_SOURCE as SOURCE } from "./current-pcb-via-save-source.ts";
import type { CurrentPcbViaSaveSite } from "./current-pcb-via-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), functionLocation: point, location: point });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_SAVE_REPLY"); } }
export function decodeCurrentPcbViaSavePause(input: unknown, role: CurrentPcbViaSaveSite, scriptId: string, breakpointId: string): string {
  const parsed = pause.parse(captureCurrentPcbStringClockReply(input).value);
  const site = SITES[role], top = parsed.callFrames[0];
  need(top !== undefined && parsed.hitBreakpoints[0] === breakpointId && top.functionName === "saveCanvas" && top.location.scriptId === scriptId &&
    top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === scriptId &&
    top.functionLocation.lineNumber === SOURCE.saveCanvas.functionLine && top.functionLocation.columnNumber === SOURCE.saveCanvas.functionColumn);
  return top.callFrameId;
}
export function decodeCurrentPcbViaSaveArrayCapture(input: unknown, length: number): string {
  const remote = z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), objectId: handle, description: z.literal(`Array(${String(length)})`) });
  return z.strictObject({ result: remote }).parse(captureCurrentPcbStringClockReply(input).value).result.objectId;
}
const value = z.strictObject({ documentUuid: z.string().regex(/^[a-f\d]{32}$/u), projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  uniqueId: z.string().min(1).max(128), client: z.string().min(1).max(128), clock: z.number().int().positive().max(8_640_000_000_000_000),
  headTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1), body: z.string().min(1).max(16_384).refine(text => text.isWellFormed() && Buffer.byteLength(text) <= 16_384),
  userUndefined: z.boolean(), userJson: z.string().max(4096).nullable() }).refine(packet => packet.userUndefined === (packet.userJson === null));
export type CurrentPcbViaSaveBodyValue = Readonly<z.infer<typeof value>>;
export function decodeCurrentPcbViaSaveBodyValue(input: unknown): CurrentPcbViaSaveBodyValue {
  const remote = z.strictObject({ type: z.literal("object"), value });
  return freezeDeep(z.strictObject({ result: remote }).parse(captureCurrentPcbStringClockReply(input).value).result.value);
}
export function requireCurrentPcbViaSaveMethodDescription(input: unknown, role: keyof typeof METHODS): void {
  const expected = METHODS[role]; need(typeof input === "string" && Buffer.byteLength(input) === expected.bytes && createHash("sha256").update(input).digest("hex") === expected.sha256);
}
/** Runtime metadata joins each captured original function to the qualified
 * worker script; equal function text in a different script cannot pass. */
export function decodeCurrentPcbViaSaveMethod(input: unknown, role: keyof typeof METHODS, scriptId: string): void {
  const remote = z.looseObject({ type: z.string(), value: z.unknown().optional(), objectId: handle.optional(), subtype: z.string().optional() });
  const property = z.looseObject({ name: z.string(), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
  const internal = z.looseObject({ name: z.string(), value: remote });
  const reply = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).parse(captureCurrentPcbStringClockReply(input).value);
  const expected = METHODS[role], fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const [key, literal] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.value === literal && field.value.objectId === undefined);
  }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), location = entries.get("[[FunctionLocation]]"), scopes = entries.get("[[Scopes]]");
  const at = point.parse(location?.value); need(entries.size === 3 && location?.type === "object" && location.subtype === "internal#location" && at.scriptId === scriptId &&
    at.lineNumber === expected.lineNumber && at.columnNumber === expected.columnNumber && scopes?.subtype === "internal#scopeList" && scopes.objectId !== undefined && entries.get("[[Prototype]]")?.type === "function");
}
