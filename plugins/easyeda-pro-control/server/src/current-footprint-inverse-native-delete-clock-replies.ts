/** Data-only readers for this source-pinned native DEL clock. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALLER as CALLER, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES as SITES } from "./current-footprint-inverse-native-delete-clock-profile.ts";
import type { CurrentFootprintInverseNativeDeleteClockSite as Site } from "./current-footprint-inverse-native-delete-clock-profile.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.string().max(64), subtype: z.string().max(128).optional(), className: z.string().max(128).optional(),
  description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string().max(256), functionLocation: point, location: point, returnValue: remote.optional() });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_REPLY"); } }
export function currentFootprintInverseNativeDeleteClockPause(event: DiagnosticEvent, role: Site, sessionId: string, scriptId: string, breakpointId: string): Readonly<{ frame: string; caller: string | null; returned: string | null }> {
  need(event.method === "Debugger.paused" && event.sessionId === sessionId); const packet = paused.parse(capture(event.params)); const top = packet.callFrames[0]; const site = SITES[role];
  need(top !== undefined && packet.hitBreakpoints[0] === breakpointId && top.functionName === site.functionName &&
    top.location.scriptId === scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber &&
    top.functionLocation.scriptId === scriptId && top.functionLocation.lineNumber === site.functionLine && top.functionLocation.columnNumber === site.functionColumn);
  if (role === "push" || role === "qeReturned") {
    need(packet.callFrames.some(item => item.functionName === "deleteString" && item.functionLocation.scriptId === scriptId &&
      item.functionLocation.lineNumber === SITES.entry.functionLine && item.functionLocation.columnNumber === SITES.entry.functionColumn));
  }
  let caller: string | null = null, returned: string | null = null;
  if (role === "result") { const actual = packet.callFrames.find(item => item.functionName === CALLER.functionName &&
    item.functionLocation.scriptId === scriptId && item.functionLocation.lineNumber === CALLER.functionLine && item.functionLocation.columnNumber === CALLER.functionColumn);
    need(actual !== undefined && actual.location.scriptId === scriptId && actual.location.lineNumber === CALLER.lineNumber && actual.location.columnNumber === CALLER.columnNumber); caller = actual.callFrameId; }
  if (role === "qeReturned") { const value = top.returnValue; need(value?.type === "object" && value.subtype === "promise" && value.className === "Promise" &&
    value.description === "Promise" && value.objectId !== undefined && value.value === undefined); returned = value.objectId; }
  return Object.freeze({ frame: top.callFrameId, caller, returned });
}
const property = z.looseObject({ name: z.string().max(256), value: remote.optional(), get: remote.optional(), set: remote.optional(),
  writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const nativePacket = z.strictObject({ result: z.array(property).min(2).max(24), internalProperties: z.array(internal).length(2) });
/** Native metadata rejects script implementations and proxies. Extra own
 * constructor statics are retained but never called; the fixed program checks
 * the exact Promise/prototype/then/species references separately. */
export function currentFootprintInverseNativeDeleteClockNative(input: unknown, role: "constructor" | "then" | "species"): void {
  const packet = nativePacket.parse(capture(input)); const fields = new Map(packet.result.map(item => [item.name, item]));
  need(fields.size === packet.result.length); let name = "Promise"; let arity = 1;
  if (role === "then") { name = "then"; arity = 2; } else if (role === "species") { name = "get [Symbol.species]"; arity = 0; }
  for (const [key, expected] of [["name", name], ["length", arity]] as const) { const field = fields.get(key); need(field !== undefined && field.writable === false && ! field.enumerable && field.configurable &&
    field.get === undefined && field.set === undefined && field.value?.type === (key === "name" ? "string" : "number") && field.value.objectId === undefined && field.value.value === expected); }
  if (role !== "constructor") { need(fields.size === 2); }
  const entries = new Map(packet.internalProperties.map(item => [item.name, item.value])); const parent = entries.get("[[Prototype]]"); const scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
export function currentFootprintInverseNativeDeleteClockPromise(input: unknown, state: "pending" | "fulfilled", value?: number): void {
  const packet = z.strictObject({ result: z.tuple([]), internalProperties: z.array(internal).length(3) }).parse(capture(input));
  const fields = new Map(packet.internalProperties.map(item => [item.name, item.value])); const parent = fields.get("[[Prototype]]"); const status = fields.get("[[PromiseState]]"); const result = fields.get("[[PromiseResult]]");
  need(fields.size === 3 && parent?.type === "object" && parent.className === "Promise" && parent.objectId !== undefined && parent.value === undefined &&
    status?.type === "string" && status.value === state && status.objectId === undefined && result !== undefined);
  if (state === "pending") { need(value === undefined && result.type === "undefined" && result.objectId === undefined && result.value === undefined); }
  else { need(typeof value === "number" && result.type === "number" && result.objectId === undefined && result.value === value); }
}
