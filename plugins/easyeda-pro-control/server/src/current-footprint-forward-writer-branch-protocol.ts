/** Finite readonly saved inverse history-row observation. There is no mutation,
 * caller expression, SQL, body, target or timestamp input. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE as SITE } from "./current-footprint-forward-writer-branch-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_PROGRAMS as PROGRAMS } from "./current-footprint-forward-writer-branch-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_GROUP = "easyeda-footprint-forward-writer-branch209-v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_REQUESTS = Object.freeze({ arms: 1, frames: 1, joins: 3, properties: 2, originalSteps: 1, normal: 8, cleanup: 2, total: 10, events: 2, repetitions: 1 });
const GROUP = CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_GROUP, handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const armLocation = z.strictObject({ scriptId: handle, lineNumber: z.literal(SITE.lineNumber), columnNumber: z.literal(SITE.columnNumber) });
const armParams = z.strictObject({ location: armLocation });
const frameParams = z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.literal(SITE.expression) });
const joinParams = z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(2), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const empty = z.strictObject({}); const removeParams = z.strictObject({ breakpointId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("forward-writer-branch-arm"), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("forward-writer-branch-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("forward-writer-branch-join"), role: z.enum(["capture", "resolved", "value"]), method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("forward-writer-branch-properties"), role: z.enum(["packet", "promise"]), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("forward-writer-branch-step"), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("forward-writer-branch-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("forward-writer-branch-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentFootprintForwardWriterBranchCommand = z.infer<typeof schema>;
export function validateCurrentFootprintForwardWriterBranchCommand(input: unknown): CurrentFootprintForwardWriterBranchCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "forward-writer-branch-join") { const program = PROGRAMS[command.role];
    if (command.params.functionDeclaration !== program.program || command.params.arguments.length !== program.arguments || command.params.returnByValue !== program.returnByValue) { throw new Error("FORWARD_WRITER_BRANCH_FIXED_PROGRAM"); }
  } return freezeDeep(command);
}
export function currentFootprintForwardWriterBranchNativeCases(): readonly CurrentFootprintForwardWriterBranchCommand[] {
  return freezeDeep([
    { phase: "forward-writer-branch-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "live_script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber } } },
    { phase: "forward-writer-branch-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_FRAME_FLAGS, callFrameId: "live_frame", expression: SITE.expression } },
    ...(["capture", "resolved", "value"] as const).map(role => ({ phase: "forward-writer-branch-join" as const, role, method: "Runtime.callFunctionOn" as const, params: { ...CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_CALL_FLAGS, objectId: "live_packet", functionDeclaration: PROGRAMS[role].program, arguments: Array.from({ length: PROGRAMS[role].arguments }, (_, i) => ({ objectId: `live_argument${String(i)}` })), returnByValue: PROGRAMS[role].returnByValue } })),
    ...(["packet", "promise"] as const).map(role => ({ phase: "forward-writer-branch-properties" as const, role, method: "Runtime.getProperties" as const, params: { objectId: "live_member", ownProperties: true as const, accessorPropertiesOnly: false as const, generatePreview: false as const } })),
    { phase: "forward-writer-branch-step", method: "Debugger.resume", params: {} },
    { phase: "forward-writer-branch-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "live_point" } },
    { phase: "forward-writer-branch-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ]);
}
