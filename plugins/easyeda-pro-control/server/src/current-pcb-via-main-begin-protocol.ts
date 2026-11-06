/** Via-only finite transaction BEGIN grammar. A command cannot issue the
 * original pending native-call grant required by the retained main owner. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as CALLS } from "./current-pcb-via-main-begin-programs.ts";

export const CURRENT_PCB_VIA_MAIN_BEGIN_SITES = freezeDeep({
  save: { lineNumber: 8572, columnNumber: 19_844, functionLine: 8572, functionColumn: 19_828, name: "saveProjectHistory", expression: "[this,e,r,i]" },
  transaction: { lineNumber: 1025, columnNumber: 2529, functionLine: 1025, functionColumn: 2514, name: "inTransaction", expression: "[this,e]" },
  callback: { lineNumber: 1025, columnNumber: 895, functionLine: 1025, functionColumn: 891, name: "", expression: "[this,o,e,r,a,n,sc,F5]" },
  returned: { lineNumber: 1025, columnNumber: 2186, functionLine: 1025, functionColumn: 2040, name: "begin", expression: "[this,this.transactionDepth]" },
});
export type CurrentPcbViaMainBeginRole = keyof typeof CURRENT_PCB_VIA_MAIN_BEGIN_SITES;
export type CurrentPcbViaMainBeginCall = keyof typeof CALLS;
export const CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION = "[this,e,r,a,n,sc,F5]";
export const CURRENT_PCB_VIA_MAIN_BEGIN_CALLBACK_CONDITION = String.raw`(function(){try{return typeof e!=="string"||!/^select\b/i.test(e);}catch{return true;}})()`;
export const CURRENT_PCB_VIA_MAIN_BEGIN_STEPS = ["actor", "save", "transaction", "run", "callback"] as const;
export const CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS = Object.freeze({ sourceArms: 4, frames: 5, joins: 5, originalSteps: CURRENT_PCB_VIA_MAIN_BEGIN_STEPS.length,
  normal: 4 + 5 + 5 + CURRENT_PCB_VIA_MAIN_BEGIN_STEPS.length, cleanup: 4, total: 4 + 5 + 5 + CURRENT_PCB_VIA_MAIN_BEGIN_STEPS.length + 4 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const role = z.enum(["save", "transaction", "callback", "returned"]);
const call = z.enum(["save", "transaction", "run", "callback", "returned"]);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
export const CURRENT_PCB_VIA_MAIN_BEGIN_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const armParams = z.strictObject({ location: point, condition: z.literal(CURRENT_PCB_VIA_MAIN_BEGIN_CALLBACK_CONDITION).optional() });
const frameRoles = z.union([role, z.literal("run")]);
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string(), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const joinParams = z.strictObject({ ...flags, awaitPromise: z.literal(false), userGesture: z.literal(false), objectId: handle, functionDeclaration: z.string(), arguments: z.array(ref).min(1).max(2), returnByValue: z.boolean() });
const empty = z.strictObject({}), removeParams = z.strictObject({ breakpointId: handle });
const command = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("via-main-begin-arm"), role, method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("via-main-begin-frame"), role: frameRoles, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("via-main-begin-join"), role: call, method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("via-main-begin-step"), role: z.enum(CURRENT_PCB_VIA_MAIN_BEGIN_STEPS), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("via-main-begin-remove"), role, method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
]);
export type CurrentPcbViaMainBeginCommand = Readonly<z.infer<typeof command>>;
export function validateCurrentPcbViaMainBeginCommand(input: unknown): CurrentPcbViaMainBeginCommand {
  const value = command.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.phase === "via-main-begin-arm") { const site = CURRENT_PCB_VIA_MAIN_BEGIN_SITES[value.role]; if (value.params.location.lineNumber !== site.lineNumber || value.params.location.columnNumber !== site.columnNumber || value.params.condition !== (value.role === "callback" ? CURRENT_PCB_VIA_MAIN_BEGIN_CALLBACK_CONDITION : undefined)) { throw new Error("PCB_VIA_BEGIN_FIXED_SITE"); } }
  else if (value.phase === "via-main-begin-frame") { if (value.params.expression !== (value.role === "run" ? CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION : CURRENT_PCB_VIA_MAIN_BEGIN_SITES[value.role].expression)) { throw new Error("PCB_VIA_BEGIN_FIXED_FRAME"); } }
  else if (value.phase === "via-main-begin-join") { const fixed = CALLS[value.role]; if (value.params.functionDeclaration !== fixed.program || value.params.arguments.length !== fixed.arguments || value.params.returnByValue !== fixed.returnByValue) { throw new Error("PCB_VIA_BEGIN_FIXED_PROGRAM"); } }
  return freezeDeep(value);
}
export function currentPcbViaMainBeginNativeCases(): readonly CurrentPcbViaMainBeginCommand[] {
  const commands: unknown[] = [];
  for (const [key, site] of Object.entries(CURRENT_PCB_VIA_MAIN_BEGIN_SITES)) { commands.push({ phase: "via-main-begin-arm", role: key, method: "Debugger.setBreakpoint", params: { location: { scriptId: "via_script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(key === "callback" ? { condition: CURRENT_PCB_VIA_MAIN_BEGIN_CALLBACK_CONDITION } : {}) } },
    { phase: "via-main-begin-frame", role: key, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, callFrameId: "via_frame", expression: site.expression, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "via-main-begin-remove", role: key, method: "Debugger.removeBreakpoint", params: { breakpointId: "via_point" } }); }
  commands.push({ phase: "via-main-begin-frame", role: "run", method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, callFrameId: "via_frame", expression: CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } });
  for (const [key, fixed] of Object.entries(CALLS)) { commands.push({ phase: "via-main-begin-join", role: key, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_MAIN_BEGIN_FLAGS, objectId: "via_packet", functionDeclaration: fixed.program, arguments: Array.from({ length: fixed.arguments }, (_, index) => ({ objectId: `via_argument${String(index)}` })), returnByValue: fixed.returnByValue } }); }
  for (const step of CURRENT_PCB_VIA_MAIN_BEGIN_STEPS) { commands.push({ phase: "via-main-begin-step", role: step, method: "Debugger.resume", params: {} }); }
  return freezeDeep(commands.map(item => validateCurrentPcbViaMainBeginCommand(item)));
}
