/** Finite readonly saved inverse history-row observation. There is no mutation,
 * caller expression, SQL, body, target or timestamp input. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "./current-pcb-via-main-live-history-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-main-history-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_GROUP = "easyeda-footprint-inverse-main-history209-v1";
export const CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS = Object.freeze({ arms: 1, frames: 1, joins: 3, properties: 5, originalSteps: 1, normal: 11, cleanup: 2, total: 13, events: 2, repetitions: 4 });
const GROUP = CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_GROUP, handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
export const CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const armLocation = z.strictObject({ scriptId: handle, lineNumber: z.literal(SITE.lineNumber), columnNumber: z.literal(SITE.columnNumber) });
const armParams = z.strictObject({ location: armLocation });
const frameParams = z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.literal(SITE.expression) });
const joinParams = z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(2), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const empty = z.strictObject({}); const removeParams = z.strictObject({ breakpointId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-main-history-arm"), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("inverse-main-history-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("inverse-main-history-join"), role: z.enum(["capture", "resolved", "value"]), method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("inverse-main-history-properties"), role: z.enum(["packet", "promise", "projectSql", "table", "branches"]), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-main-history-step"), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("inverse-main-history-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("inverse-main-history-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentFootprintInverseMainHistoryCommand = z.infer<typeof schema>;
export function validateCurrentFootprintInverseMainHistoryCommand(input: unknown): CurrentFootprintInverseMainHistoryCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "inverse-main-history-join") { const program = PROGRAMS[command.role];
    if (command.params.functionDeclaration !== program.program || command.params.arguments.length !== program.arguments || command.params.returnByValue !== program.returnByValue) { throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_FIXED_PROGRAM"); }
  } return freezeDeep(command);
}
export function currentFootprintInverseMainHistoryNativeCases(): readonly CurrentFootprintInverseMainHistoryCommand[] {
  return freezeDeep([
    { phase: "inverse-main-history-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "live_script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } } },
    { phase: "inverse-main-history-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_FRAME_FLAGS, callFrameId: "live_frame", expression: SITE.expression } },
    ...(["capture", "resolved", "value"] as const).map(role => ({ phase: "inverse-main-history-join" as const, role, method: "Runtime.callFunctionOn" as const, params: { ...CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_CALL_FLAGS, objectId: "live_packet", functionDeclaration: PROGRAMS[role].program, arguments: Array.from({ length: PROGRAMS[role].arguments }, (_, i) => ({ objectId: `live_argument${String(i)}` })), returnByValue: PROGRAMS[role].returnByValue } })),
    ...(["packet", "promise", "projectSql", "table", "branches"] as const).map(role => ({ phase: "inverse-main-history-properties" as const, role, method: "Runtime.getProperties" as const, params: { objectId: "live_member", ownProperties: true as const, accessorPropertiesOnly: false as const, generatePreview: false as const } })),
    { phase: "inverse-main-history-step", method: "Debugger.resume", params: {} },
    { phase: "inverse-main-history-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "live_point" } },
    { phase: "inverse-main-history-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ]);
}
