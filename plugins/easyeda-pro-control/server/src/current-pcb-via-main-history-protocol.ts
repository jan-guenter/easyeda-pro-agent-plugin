/** Closed history continuation vocabulary. Only the original Via backend may
 * consume the actual pending SQL/callback slot represented by a command. */
import { z } from "zod";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as CAPTURED } from "./current-main-captured-scope-frames.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING as BOOKKEEPING, CURRENT_PCB_VIA_MAIN_HISTORY_REBASE as REBASE, captureCurrentPcbViaMainRebaseCommand } from "./current-pcb-via-main-captured-rebase.ts";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PROGRAMS } from "./current-project-history-main-programs.ts";

export const CURRENT_PCB_VIA_MAIN_HISTORY_SITES = freezeDeep({
  callback: { lineNumber: 8572, columnNumber: 20_070, functionColumn: 20_054, name: "", expression: "[this,e,r,i,a]", length: 5 },
  branch: { lineNumber: 8572, columnNumber: 20_106, functionColumn: 20_054, name: "", expression: "[this,e,r,i,a,o]", length: 6 },
  writerAppend: { lineNumber: 8572, columnNumber: 24_495, functionColumn: 24_479, name: "bB", expression: "[t,e,r,i]", length: 4 },
  writerMutable: { lineNumber: 8572, columnNumber: 24_802, functionColumn: 24_782, name: "OB", expression: "[t,e,r,i,s]", length: 5 },
  encryptEntry: { lineNumber: 8572, columnNumber: 25_967, functionColumn: 25_950, name: "x4", expression: "[t,e,r,i]", length: 4 },
  cipher: { lineNumber: 8572, columnNumber: 26_129, functionColumn: 25_950, name: "x4", expression: "[t,e,r,i,s,a]", length: 6 },
  sqlCallback: { lineNumber: 1025, columnNumber: 895, functionColumn: 891, name: "", expression: "[this,o,e,r,a,n,sc,F5]", length: 8 },
  commitReturned: { lineNumber: 1025, columnNumber: 2337, functionColumn: 2199, name: "commit", expression: "[this,this.transactionDepth]", length: 2 },
  projectReturned: { lineNumber: 8572, columnNumber: 26_681, functionColumn: 26_523, name: "xB", expression: "[t,e,r,i]", length: 4 },
  saveReturned: { lineNumber: 8572, columnNumber: 20_236, functionColumn: 19_828, name: "saveProjectHistory", expression: "[this,e,r,i,a,s]", length: 6 },
  controllerReturned: { lineNumber: 8573, columnNumber: 1926, functionColumn: 1648, name: "createProjectHistory", expression: "[this,this.ctx,this.service,this.path,r]", length: 5 },
});
export const CURRENT_PCB_VIA_MAIN_HISTORY_CALLERS = freezeDeep({
  encryptCallerAppend: { lineNumber: 8572, functionColumn: 24_479, name: "bB", expression: "[t,e,r,i,s]", length: 5 },
  encryptCallerMutable: { lineNumber: 8572, functionColumn: 24_782, name: "OB", expression: "[t,e,r,i,s,a,n]", length: 7 },
  dataCaller: { lineNumber: 8572, functionColumn: 26_228, name: "DB", expression: "[t,e,r,i,s,a,n,o,c,A]", length: 10 },
  headCallerAppend: { lineNumber: 8572, functionColumn: 24_479, name: "bB", expression: "[t,e,r,i,s,a,o]", length: 7 },
  headCallerMutable: { lineNumber: 8572, functionColumn: 24_782, name: "OB", expression: "[t,e,r,i,s,a,n,c]", length: 8 },
  branchCaller: { lineNumber: 8572, functionColumn: 25_719, name: "D4", expression: "[t,e,r,i,s,a,n,o]", length: 8 },
  commitCaller: { lineNumber: 1025, functionColumn: 2514, name: "inTransaction", expression: "[this,e]", length: 2 },
  projectCaller: { lineNumber: 8572, functionColumn: 26_523, name: "xB", expression: "[t,e,r,i,Date,Date.now]", length: 6 },
  sqlRun: { lineNumber: 1025, functionColumn: 859, name: "", expression: "[this,e,r,a,n,sc,F5]", length: 7 },
});
export const CURRENT_PCB_VIA_MAIN_HISTORY_CALLBACK_CONDITION = String.raw`(function(){try{return typeof e!=="string"||!/^select\b/i.test(e);}catch{return true;}})()`;
export const CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS = ["data", "head", "branch", "commit", "project"] as const;
export const CURRENT_PCB_VIA_MAIN_HISTORY_STEPS = ["begin", "callback", "branch", "writer", "encrypt", "cipher", "sql-data", "callback-data", "sql-head", "callback-head", "sql-branch", "callback-branch", "sql-commit", "callback-commit", "commitReturned", "sql-project", "callback-project", "projectReturned", "saveReturned", "controllerReturned"] as const;
export const CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS = Object.freeze({ sourceArms: 9, originalCallbackMetadata: 2, originalCallbackArm: 1, frames: 25, joins: 31, originalSteps: CURRENT_PCB_VIA_MAIN_HISTORY_STEPS.length,
  normal: 9 + 2 + 1 + 25 + 31 + CURRENT_PCB_VIA_MAIN_HISTORY_STEPS.length, cleanup: 11, total: 9 + 2 + 1 + 25 + 31 + CURRENT_PCB_VIA_MAIN_HISTORY_STEPS.length + 11 });
export const CURRENT_PCB_VIA_MAIN_HISTORY_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const roles = ["callback", "branch", "writerAppend", "writerMutable", "encryptEntry", "cipher", "sqlCallback", "commitReturned", "projectReturned", "saveReturned", "controllerReturned"] as const;
const callerRoles = ["encryptCallerAppend", "encryptCallerMutable", "dataCaller", "headCallerAppend", "headCallerMutable", "branchCaller", "commitCaller", "projectCaller", "sqlRun"] as const;
const programRoles = ["callback", "branch", "branchValue", "writer", "encryptEntry", "cipher", "cipherValue", "sqlValue", "sqlCallback", "sqlCallbackValue", "commitReturned", "projectReturned", "saveReturned", "controllerReturned", "runData", "runHead", "runBranch", "runCommit", "runProject"] as const;
export type CurrentPcbViaMainHistoryRole = typeof roles[number];
export type CurrentPcbViaMainHistoryFrameRole = typeof roles[number] | typeof callerRoles[number];
export type CurrentPcbViaMainHistoryProgramRole = typeof programRoles[number];
export type CurrentPcbViaMainHistoryStep = typeof CURRENT_PCB_VIA_MAIN_HISTORY_STEPS[number];
export type CurrentPcbViaMainHistorySlot = typeof CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS[number];
const roleSchema = z.enum(roles); const frameRole = z.enum([...roles, ...callerRoles]); const programRole = z.enum(programRoles); const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const ref = z.strictObject({ objectId: handle });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const armParams = z.strictObject({ location: point, condition: z.literal(CURRENT_PCB_VIA_MAIN_HISTORY_CALLBACK_CONDITION).optional() });
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const frameParams = z.strictObject({ callFrameId: handle, expression: z.string(), objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) });
const joinParams = z.strictObject({ objectId: handle, functionDeclaration: z.string(), arguments: z.array(ref).max(3), objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.boolean() });
const removeParams = z.strictObject({ breakpointId: handle }); const empty = z.strictObject({});
const command = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("via-main-history-arm"), role: roleSchema, method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("via-main-history-callback-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: ref }),
  z.strictObject({ phase: z.literal("via-main-history-properties"), role: z.enum(["transaction", "callback"]), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("via-main-history-frame"), role: frameRole, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("via-main-history-raw-frame"), role: z.enum(["sqlRun", "sqlCallback"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("via-main-history-bookkeeping"), role: z.enum(["callback", "branch", "branchValue", "writer", "encryptEntry", "cipher", "cipherValue", "sqlValue", "sqlCallbackValue", "commitReturned", "projectReturned", "saveReturned", "controllerReturned"]), method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("via-main-history-rebase"), role: z.enum(["runData", "runHead", "runBranch", "runCommit", "runProject", "sqlCallback"]), method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("via-main-history-join"), role: programRole, method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("via-main-history-step"), role: z.enum(CURRENT_PCB_VIA_MAIN_HISTORY_STEPS), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("via-main-history-remove"), role: roleSchema, method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
]);
export type CurrentPcbViaMainHistoryCommand = Readonly<z.infer<typeof command>>;
export function currentPcbViaMainHistoryFrame(role: CurrentPcbViaMainHistoryFrameRole): Readonly<{ lineNumber: number; functionColumn: number; name: string; expression: string; length: number }> { return role in CURRENT_PCB_VIA_MAIN_HISTORY_SITES ? CURRENT_PCB_VIA_MAIN_HISTORY_SITES[z.enum(roles).parse(role)] : CURRENT_PCB_VIA_MAIN_HISTORY_CALLERS[z.enum(callerRoles).parse(role)]; }
function plain(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null); }
/** Only an exact fixed own-data program is substituted during the ordinary
 * inert capture. Unknown source and the shared16KiB scalar guard stay intact. */
function captureCommand(input: unknown): unknown {
  if (!plain(input)) { return captureCurrentPcbStringClockReply(input).value; }
  if ((Object.getOwnPropertyDescriptor(input, "phase")?.value === "via-main-history-rebase" || Object.getOwnPropertyDescriptor(input, "phase")?.value === "via-main-history-bookkeeping")) { return captureCurrentPcbViaMainRebaseCommand(input); }
  const params = Object.getOwnPropertyDescriptor(input, "params"), raw: unknown = params?.value;
  if (params === undefined || !Object.hasOwn(params, "value") || !plain(raw)) { return captureCurrentPcbStringClockReply(input).value; }
  const declaration = Object.getOwnPropertyDescriptor(raw, "functionDeclaration"), source: unknown = declaration?.value;
  if (declaration === undefined || !Object.hasOwn(declaration, "value") || typeof source !== "string" || !Object.values(PROGRAMS).some(fixed => fixed.program === source)) { return captureCurrentPcbStringClockReply(input).value; }
  const inner = Object.getOwnPropertyDescriptors(raw), outer = Object.getOwnPropertyDescriptors(input);
  inner["functionDeclaration"] = { ...declaration, value: "fixed-original-main-history" }; outer["params"] = { ...params, value: Object.create(null, inner) as unknown };
  const captured = captureCurrentPcbStringClockReply(Object.create(null, outer)).value;
  if (!plain(captured) || !plain(captured["params"])) { throw new Error("PCB_VIA_HISTORY_FIXED_CAPTURE"); }
  return { ...captured, params: { ...captured["params"], functionDeclaration: source } };
}
/** Parse only the fixed legacy vocabulary or its separate captured-frame
 * partner. No caller expression, program, argument value or grant is accepted. */
export function validateCurrentPcbViaMainHistoryCommand(input: unknown): CurrentPcbViaMainHistoryCommand {
  const value = command.parse(captureCommand(input));
  if (value.phase === "via-main-history-arm") { if (value.role === "callback" || value.role === "sqlCallback") { throw new Error("PCB_VIA_HISTORY_ORIGINAL_FUNCTION_POINT_REQUIRED"); } const site = CURRENT_PCB_VIA_MAIN_HISTORY_SITES[value.role]; if (value.params.location.lineNumber !== site.lineNumber || value.params.location.columnNumber !== site.columnNumber || value.params.condition !== undefined) { throw new Error("PCB_VIA_HISTORY_FIXED_SITE"); } }
  else if (value.phase === "via-main-history-frame") { if (value.params.expression !== currentPcbViaMainHistoryFrame(value.role).expression) { throw new Error("PCB_VIA_HISTORY_FIXED_FRAME"); } }
  else if (value.phase === "via-main-history-raw-frame") { if (value.params.expression !== { sqlRun: CAPTURED.historyRun, sqlCallback: CAPTURED.historyCallback }[value.role].rawExpression) { throw new Error("PCB_VIA_HISTORY_FIXED_RAW_FRAME"); } }
  else if (value.phase === "via-main-history-bookkeeping") { const fixed = BOOKKEEPING[value.role]; if (value.params.functionDeclaration !== fixed.program || value.params.arguments.length !== fixed.arguments || value.params.returnByValue !== fixed.returnByValue) { throw new Error("PCB_VIA_HISTORY_FIXED_BOOKKEEPING"); } }
  else if (value.phase === "via-main-history-rebase") { const fixed = REBASE[value.role]; if (value.params.functionDeclaration !== fixed.program || value.params.arguments.length !== fixed.arguments || value.params.returnByValue) { throw new Error("PCB_VIA_HISTORY_FIXED_REBASE"); } }
  else if (value.phase === "via-main-history-join") { const fixed = PROGRAMS[value.role]; if (value.params.functionDeclaration !== fixed.program || value.params.arguments.length !== fixed.arguments || value.params.returnByValue !== fixed.returnByValue) { throw new Error("PCB_VIA_HISTORY_FIXED_PROGRAM"); } }
  return freezeDeep(value);
}
/** Enumerate immutable legacy rows first, then closed captured/bookkeeping
 * alternatives. Replacing existing requests leaves live request caps fixed. */
export function currentPcbViaMainHistoryNativeCases(): readonly CurrentPcbViaMainHistoryCommand[] {
  const commands: unknown[] = [];
  for (const role of roles) { const site = CURRENT_PCB_VIA_MAIN_HISTORY_SITES[role]; if (role !== "callback" && role !== "sqlCallback") { commands.push({ phase: "via-main-history-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "via_script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }); } commands.push({ phase: "via-main-history-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "via_point" } }); }
  for (const role of [...roles, ...callerRoles]) { commands.push({ phase: "via-main-history-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "via_frame", expression: currentPcbViaMainHistoryFrame(role).expression, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }); }
  for (const role of programRoles) { const fixed = PROGRAMS[role]; commands.push({ phase: "via-main-history-join", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_MAIN_HISTORY_FLAGS, objectId: "via_packet", functionDeclaration: fixed.program, arguments: Array.from({ length: fixed.arguments }, (_, index) => ({ objectId: `via_argument${String(index)}` })), returnByValue: fixed.returnByValue } }); }
  for (const role of CURRENT_PCB_VIA_MAIN_HISTORY_STEPS) { commands.push({ phase: "via-main-history-step", role, method: "Debugger.resume", params: {} }); }
  for (const role of ["transaction", "callback"]) { commands.push({ phase: "via-main-history-properties", role, method: "Runtime.getProperties", params: { objectId: "via_packet", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  commands.push({ phase: "via-main-history-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "via_callback" } });

  for (const [role, fixed] of Object.entries({ sqlRun: CAPTURED.historyRun, sqlCallback: CAPTURED.historyCallback })) { commands.push({ phase: "via-main-history-raw-frame", role, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false, callFrameId: "via_frame", expression: fixed.rawExpression } }); }
  for (const [role, fixed] of Object.entries(REBASE)) { commands.push({ phase: "via-main-history-rebase", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_MAIN_HISTORY_FLAGS, objectId: "via_packet", functionDeclaration: fixed.program, arguments: Array.from({ length: fixed.arguments }, (_, index) => ({ objectId: `via_argument${String(index)}` })), returnByValue: false } }); }
    for (const [key, fixed] of Object.entries(BOOKKEEPING)) { commands.push({ phase: "via-main-history-bookkeeping", role: key, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_MAIN_HISTORY_FLAGS, objectId: "via_packet", functionDeclaration: fixed.program, arguments: Array.from({ length: fixed.arguments }, (_, index) => ({ objectId: `via_argument${String(index)}` })), returnByValue: fixed.returnByValue } }); }
  return freezeDeep(commands.map(item => validateCurrentPcbViaMainHistoryCommand(item)));
}
