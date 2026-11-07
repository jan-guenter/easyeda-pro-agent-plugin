/** Exact metadata and original function-call stop. No row or delete grant. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["undefined", "object", "function", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const property = z.strictObject({ name: z.string(), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true), symbol: remote.optional() });
const internal = z.strictObject({ name: z.string(), value: remote });
export type CurrentFootprintInverseLookupRemote = Readonly<z.infer<typeof remote>>;
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_LOOKUP_PREENTRY_REPLY"); } }
export function currentFootprintInverseLookupObject(value: CurrentFootprintInverseLookupRemote): string { need((value.type === "object" || value.type === "function") && value.subtype !== "proxy" && value.subtype !== "null" && value.objectId !== undefined && value.value === undefined); return value.objectId; }
export function currentFootprintInverseLookupResult(input: unknown, length: number): string { const raw = z.strictObject({ result: remote }).parse(capture(input)); need(raw.result.type === "object" && raw.result.subtype === "array" && raw.result.className === "Array" && raw.result.description === `Array(${String(length)})`); return currentFootprintInverseLookupObject(raw.result); }
export function currentFootprintInverseLookupProperties(input: unknown): readonly z.infer<typeof property>[] {
  const raw = z.strictObject({ result: z.array(property).max(512), internalProperties: z.array(internal).max(3).optional() }).parse(capture(input)); const keys = new Set<string>(); for (const item of raw.result) { need(!keys.has(item.name)); keys.add(item.name); if (item.value !== undefined) { need(item.value.subtype !== "proxy"); } }
  const names = new Set<string>(); for (const item of raw.internalProperties ?? []) { need(!names.has(item.name) && ["[[Prototype]]", "[[Entries]]", "[[Scopes]]", "[[FunctionLocation]]"].includes(item.name) && item.value.subtype !== "proxy"); names.add(item.name); }
  return raw.result;
}
export function currentFootprintInverseLookupArray(input: unknown, length?: number): readonly CurrentFootprintInverseLookupRemote[] {
  const fields = currentFootprintInverseLookupProperties(input); const count = fields.find(row => row.name === "length"); need(count?.value?.type === "number" && typeof count.value.value === "number"); const size = count.value.value;
  need(Number.isSafeInteger(size) && size >= 0 && size <= 64 && (length === undefined || size === length) && fields.length === size + 1 && count.writable === true && !count.enumerable && !count.configurable);
  const values: CurrentFootprintInverseLookupRemote[] = []; for (let index = 0; index < size; index += 1) { const field = fields.find(row => row.name === String(index)); need(field?.value !== undefined && field.writable === true && field.enumerable && field.configurable); values.push(field.value); } return Object.freeze(values);
}
export function currentFootprintInverseLookupScopes(input: unknown): readonly [string, string] {
  const raw = z.strictObject({ result: z.array(property).min(3).max(4) }).parse(capture(input)); const labels = ["Block", "Closure", ...(raw.result.length === 4 ? ["Script"] : []), "Global"]; const ids: string[] = [];
  for (const [index, label] of labels.entries()) { const field = raw.result[index]; need(field?.name === String(index) && field.value?.type === "object" && field.value.subtype === "internal#scope" && field.value.description === label && field.value.objectId !== undefined && field.writable === true && field.enumerable && field.configurable); if (index < 2) { ids.push(field.value.objectId); } }
  need(ids[0] !== undefined && ids[1] !== undefined); return Object.freeze([ids[0], ids[1]]);
}
export function currentFootprintInverseLookupPoint(input: unknown): string { return z.strictObject({ breakpointId: handle }).parse(capture(input)).breakpointId; }
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: point, location: point, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
export function currentFootprintInverseLookupEntryPause(input: unknown, sessionId: string, uiScriptId: string, apiScriptId: string, breakpointId: string): string {
  const raw = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(5).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) }).parse(capture(input)); need(raw.sessionId === sessionId && raw.params.hitBreakpoints[0] === breakpointId);
  const expected = [
    { name: "getFootprint", line: 1171, column: 113_048, pc: 113_058, script: uiScriptId },
    { name: "getFootprint", line: 1171, column: 125_106, pc: 125_183, script: uiScriptId },
    { name: "tw", line: 1326, column: 1619, pc: 1733, script: uiScriptId },
    { name: "delete", line: 2657, column: 140_826, pc: 140_960, script: uiScriptId },
    { name: "i", line: 1, column: 99_812, pc: 99_860, script: apiScriptId },
  ];
  for (const [index, row] of expected.entries()) { const actual = raw.params.callFrames[index]; need(actual !== undefined && actual.functionName === row.name && actual.functionLocation.scriptId === row.script && actual.functionLocation.lineNumber === row.line && actual.functionLocation.columnNumber === row.column && actual.location.scriptId === row.script && actual.location.lineNumber === row.line && actual.location.columnNumber === row.pc); }
  const top = raw.params.callFrames[0]; need(top !== undefined); return top.callFrameId;
}
