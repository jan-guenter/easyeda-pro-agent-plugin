/** Source-specific scope and actual held-RPC frame data, without continuation. */
import { z } from "zod";
import { createHash } from "node:crypto";
import { types } from "node:util";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE, qualifyCurrentFootprintInverseInitializedGetSource } from "./current-footprint-inverse-initialized-get-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number", "undefined", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const scopeValue = z.strictObject({ type: z.literal("object"), subtype: z.literal("internal#scope"), className: z.literal("Object"), description: z.enum(["Closure", "Script", "Global"]), objectId: handle });
const scopeField = z.strictObject({ name: z.string(), value: scopeValue, writable: z.literal(true), enumerable: z.literal(true), configurable: z.literal(true), isOwn: z.literal(true) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_GET_RPC_ENTRY_REPLY"); } }
export type CurrentFootprintInverseGetRpcEntryProfile = "ui" | "manager";
export function currentFootprintInverseGetRpcEntryProfile(description: string): CurrentFootprintInverseGetRpcEntryProfile { const sha = createHash("sha256").update(description).digest("hex"); if (sha === SOURCE.uiBusClass.sha256) { return "ui"; } need(sha === SOURCE.managerBusClass.sha256); return "manager"; }
export function qualifyCurrentFootprintInverseGetRpcManagerSource(input: unknown): void { need(input !== null && typeof input === "object" && !types.isProxy(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === 1); const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "string"); qualifyCurrentFootprintInverseInitializedGetSource(descriptor.value, "manager"); }
export function currentFootprintInverseGetRpcEntryScope(input: unknown): string { const fields = z.strictObject({ result: z.array(scopeField).min(2).max(5) }).parse(capture(input)).result; need(fields[0]?.value.description === "Closure" && fields.at(-1)?.value.description === "Global"); for (const [index, field] of fields.entries()) { need(field.name === String(index)); if (index > 0 && index < fields.length - 1) { need(field.value.description === "Closure" || index === fields.length - 2 && field.value.description === "Script"); } } const first = fields[0]; need(first !== undefined); return first.value.objectId; }
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: point, location: point, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
export function currentFootprintInverseGetRpcEntryPause(input: unknown, sessionId: string, uiScriptId: string, managerScriptId: string, apiScriptId: string, breakpointId: string, profile: CurrentFootprintInverseGetRpcEntryProfile): string {
  const raw = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(6).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) }).parse(capture(input)); need(raw.sessionId === sessionId && raw.params.hitBreakpoints[0] === breakpointId);
  const expected = [
    profile === "ui" ? { name: "rpcCall", line: 1033, column: 30_110, pc: 30_128, script: uiScriptId } : { name: "rpcCall", line: 0, column: 7412, pc: 7429, script: managerScriptId },
    { name: "getFootprint", line: 1171, column: 113_048, pc: 113_106, script: uiScriptId },
    { name: "getFootprint", line: 1171, column: 125_106, pc: 125_183, script: uiScriptId },
    { name: "tw", line: 1326, column: 1619, pc: 1733, script: uiScriptId },
    { name: "delete", line: 2657, column: 140_826, pc: 140_960, script: uiScriptId },
    { name: "i", line: 1, column: 99_812, pc: 99_860, script: apiScriptId },
  ];
  for (const [index, row] of expected.entries()) { const actual = raw.params.callFrames[index]; need(actual !== undefined && actual.functionName === row.name && actual.functionLocation.scriptId === row.script && actual.functionLocation.lineNumber === row.line && actual.functionLocation.columnNumber === row.column && actual.location.scriptId === row.script && actual.location.lineNumber === row.line && actual.location.columnNumber === row.pc); } const top = raw.params.callFrames[0]; need(top !== undefined); return top.callFrameId;
}
