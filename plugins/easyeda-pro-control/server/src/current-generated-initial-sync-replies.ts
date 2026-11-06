/** Inert original-script function metadata. Text equality without the actual
 * qualified script/location and exact function shape cannot pass. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "./current-generated-initial-sync-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), description: z.string().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const reply = z.strictObject({ result: z.array(property).min(2).max(3), internalProperties: z.array(internal).length(3) });
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("INITIAL_SYNC_ORIGINAL_CALLEE"); } }
export function decodeCurrentGeneratedInitialSyncCallee(input: unknown, slot: number, scriptId: string): void {
  const profile = CALLEES[slot]; need(profile !== undefined && Number.isInteger(slot)); handle.parse(scriptId);
  const parsed = reply.parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(parsed.result.map(field => [field.name, field]));
  need(fields.size === (profile.regular ? 3 : 2));
  for (const [name, value] of [["name", profile.name], ["length", profile.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined);
  }
  if (profile.regular) { const field = fields.get("prototype"); need(field?.value.type === "object" && field.value.className === "Object" && field.value.objectId !== undefined && field.writable && !field.enumerable && !field.configurable); }
  const values = new Map(parsed.internalProperties.map(field => [field.name, field.value])); need(values.size === 3);
  const at = values.get("[[FunctionLocation]]"); const parent = values.get("[[Prototype]]"); const scopes = values.get("[[Scopes]]"); const point = location.parse(at?.value);
  need(at?.type === "object" && at.subtype === "internal#location" && point.scriptId === scriptId && point.lineNumber === profile.lineNumber && point.columnNumber === profile.columnNumber);
  need(parent?.objectId !== undefined && (profile.async ? parent.type === "object" && parent.className === "AsyncFunction" && parent.description === "AsyncFunction" : parent.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }"));
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.objectId !== undefined && /^Scopes\[[1-4]\]$/u.test(scopes.description ?? ""));
}
export function requireCurrentGeneratedInitialSyncCalleeDescription(input: unknown, slot: number): void { const profile = CALLEES[slot]; need(profile !== undefined && input === profile.source); }
/** Source-only frame projection. Ownership and the exact delivered event are
 * supplied separately by the original worker/controller registry. */
export function currentGeneratedInitialSyncFrames(input: unknown, role: string, scriptId: string): Readonly<{ callFrameId: string; callerFrameId: string | null; returnPromiseId: string | null }> {
  const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location, functionLocation: location, returnValue: z.unknown().optional() });
  const parsed = z.looseObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.looseObject({ callFrames: z.array(frame).min(1).max(64) }) }).parse(captureCurrentPcbStringClockReply(input).value);
  const top = parsed.params.callFrames[0]; need(top !== undefined && top.functionName === "syncCloud" && top.location.scriptId === scriptId && top.functionLocation.scriptId === scriptId && top.functionLocation.lineNumber === 110 && top.functionLocation.columnNumber === 17_658);
  let callerFrameId: string | null = null, returnPromiseId: string | null = null;
  if (role === "syncEntry") {
    const caller = parsed.params.callFrames[1]; need(caller !== undefined && caller.functionName === "open" && caller.location.scriptId === scriptId && caller.location.lineNumber === 110 && caller.location.columnNumber === 96_941 && caller.functionLocation.scriptId === scriptId && caller.functionLocation.lineNumber === 110 && caller.functionLocation.columnNumber === 94_422); callerFrameId = caller.callFrameId;
  }
  if (role === "syncReturned") {
    const value = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).parse(top.returnValue); returnPromiseId = value.objectId;
  }
  return Object.freeze({ callFrameId: top.callFrameId, callerFrameId, returnPromiseId });
}
