/** Actual original force/history source sites. A matching packet is data;
 * original event custody and every receiver projection remain with Core. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: point, location: point, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const schema = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(2).max(10), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
export type CurrentFootprintInverseDeleteForceRole = "rpc" | "publish" | "callback" | "wrapper" | "body" | "returned" | "history-pcb" | "history-sch" | "history-bottom";
interface Site { readonly file: "ui" | "manager"; readonly name: string; readonly line: number; readonly fn: number; readonly pc: number; readonly pcLine?: number }
const rpc: Site = { file: "ui", name: "rpcCall", line: 1033, fn: 30_110, pc: 30_128 }; const caller: Site = { file: "ui", name: "c", line: 1935, fn: 400, pc: 1845 }; const yw: Site = { file: "ui", name: "yw", line: 1933, fn: 28_667, pc: 4472, pcLine: 1935 };
const executor: Site = { file: "ui", name: "", line: 1033, fn: 30_140, pc: 30_178 }; const task: Site = { file: "ui", name: "execute", line: 1033, fn: 28_690, pc: 28_722 }; const publish: Site = { file: "ui", name: "publish", line: 1033, fn: 29_000, pc: 29_076 };
const callback: Site = { file: "ui", name: "", line: 1033, fn: 29_836, pc: 29_881 }, wrapper: Site = { file: "manager", name: "", line: 108, fn: 25_065, pc: 25_079 };
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_FORCE_PAUSE"); } }
/** Fixed full synchronous stacks, including the original caller's exact force
 * or history call site. A foreign event fails before any frame request. */
/** Require the complete selected synchronous source stack and unique frames.
 * Only the actual implicit body return and outer return carry Promises. */
export function currentFootprintInverseDeleteForcePause(input: unknown, role: CurrentFootprintInverseDeleteForceRole, sessionId: string, scripts: Readonly<{ ui: string; manager: string }>, breakpointId: string): Readonly<{ frame: string; caller: string | null; promise: string | null }> {
  const raw = schema.parse(capture(input)); need(raw.sessionId === sessionId && raw.params.hitBreakpoints[0] === breakpointId); const expected: Site[] = [];
  if (role === "rpc" || role === "returned") { expected.push({ ...rpc, pc: role === "returned" ? 30_341 : rpc.pc }, caller, yw); }
  else if (role.startsWith("history-")) { let pc = 2436; if (role === "history-pcb") { pc = 1897; } else if (role === "history-sch") { pc = 1943; } expected.push({ ...publish, pc: 29_021 }, { ...caller, pc }); }
  else if (role === "publish") { expected.push({ ...publish, pc: 29_021 }, executor, rpc, caller, yw); }
  else { if (role === "body") { expected.push({ file: "manager", name: "", line: 108, fn: 57_540, pc: 57_550 }, { file: "manager", name: "", line: 107, fn: 158_442, pc: 158_447 }); } if (role === "wrapper" || role === "body") { expected.push(wrapper); } expected.push({ ...callback, pc: role === "callback" ? 29_858 : callback.pc }, task, publish, executor, rpc, caller, yw); }
  need(raw.params.callFrames.length === expected.length && new Set(raw.params.callFrames.map(value => value.callFrameId)).size === expected.length);
  for (const [index, site] of expected.entries()) { const actual = raw.params.callFrames[index]; need(actual !== undefined && actual.functionName === site.name && actual.functionLocation.scriptId === scripts[site.file] && actual.functionLocation.lineNumber === site.line && actual.functionLocation.columnNumber === site.fn && actual.location.scriptId === scripts[site.file] && actual.location.lineNumber === (site.pcLine ?? site.line) && actual.location.columnNumber === site.pc && (index === 0 && (role === "returned" || role === "body") || actual.returnValue === undefined)); }
  const top = raw.params.callFrames[0]; need(top !== undefined); let promise: string | null = null; if (role === "returned" || role === "body") { const value = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).parse(top.returnValue); promise = value.objectId; }
  const c = raw.params.callFrames.find(value => value.functionName === "c"); return Object.freeze({ frame: top.callFrameId, caller: c?.callFrameId ?? null, promise });
}
