/** Closed shared transport grammar. Neither original purpose, application
 * invocation, arbitrary source nor a body/publication grant is caller data. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS as PROGRAMS } from "./current-project-structure-transport-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_CONDITION as CONDITION, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES as SITES } from "./current-project-structure-transport-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS } from "./current-project-structure-transport-programs.ts";
export { CURRENT_PROJECT_STRUCTURE_TRANSPORT_CONDITION, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES, qualifyCurrentProjectStructureTransportSource } from "./current-project-structure-transport-source.ts";
export type { CurrentProjectStructureTransportRole } from "./current-project-structure-transport-source.ts";

export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_GROUP = "easyeda-project-structure-transport209-v1";
export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS = Object.freeze({ capture: 1, arms: 3, frames: 3, joins: 3, originalResumes: 2, normal: 12, cleanup: 4, cdpRequests: 16, events: 5 });
const GROUP = CURRENT_PROJECT_STRUCTURE_TRANSPORT_GROUP;
export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_PROJECT_STRUCTURE_TRANSPORT_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const roles = ["send", "returned", "failed"] as const;
const position = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const schemas = [
  z.strictObject({ phase: z.literal("project-structure-transport-capture"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, uniqueContextId: handle, functionDeclaration: z.literal(PROGRAMS.capture), arguments: z.tuple([]), returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-arm"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: position, condition: z.literal(CONDITION) }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-frame"), role: z.enum(roles), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string() }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-send"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.send), arguments: z.tuple([ref]), returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-value"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.value), arguments: z.tuple([]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-returned"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.returned), arguments: z.tuple([ref]), returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-resume"), role: z.enum(["send", "returned"]), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("project-structure-transport-remove"), role: z.enum(roles), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("project-structure-transport-release"), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: z.literal(GROUP) }) }),
] as const;
const schema = z.union(schemas);
export type CurrentProjectStructureTransportCommand = z.infer<typeof schema>;
export function validateCurrentProjectStructureTransportCommand(input: unknown): CurrentProjectStructureTransportCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "project-structure-transport-arm") { const site = SITES[command.role]; if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_FIXED_SITE"); } }
  else if (command.phase === "project-structure-transport-frame" && command.params.expression !== SITES[command.role].expression) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_FIXED_FRAME"); }
  return freezeDeep(command);
}
export function currentProjectStructureTransportNativeCases(): readonly CurrentProjectStructureTransportCommand[] {
  const commands: unknown[] = [{ phase: "project-structure-transport-capture", method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_STRUCTURE_TRANSPORT_CALL_FLAGS, uniqueContextId: "original_context", functionDeclaration: PROGRAMS.capture, arguments: [], returnByValue: false } }];
  for (const role of roles) { const site = SITES[role]; commands.push({ phase: "project-structure-transport-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, condition: CONDITION } },
    { phase: "project-structure-transport-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_STRUCTURE_TRANSPORT_FRAME_FLAGS, callFrameId: "original_frame", expression: site.expression } },
    { phase: "project-structure-transport-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_point" } }); }
  for (const role of ["send", "value", "returned"] as const) { commands.push({ phase: `project-structure-transport-${role}`, method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_STRUCTURE_TRANSPORT_CALL_FLAGS, objectId: "original_packet", functionDeclaration: PROGRAMS[role], arguments: role === "value" ? [] : [{ objectId: "original_argument" }], returnByValue: role === "value" } }); }
  for (const role of ["send", "returned"]) { commands.push({ phase: "project-structure-transport-resume", role, method: "Debugger.resume", params: {} }); }
  commands.push({ phase: "project-structure-transport-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }); return freezeDeep(commands.map(command => validateCurrentProjectStructureTransportCommand(command)));
}
