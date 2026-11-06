/** Finite shared structure lane. Original Via and SCH births remain distinct;
 * this vocabulary admits no caller expression, path, target or SQL grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS } from "./current-project-save-structure-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "./current-project-save-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_STRUCTURE_GROUP = "easyeda-pro-control-project-save-structure209-v1";
const GROUP = CURRENT_PROJECT_SAVE_STRUCTURE_GROUP;
export const CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false,
  throwOnSideEffect: true, includeCommandLineAPI: false } as const);
export const CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const roles = ["bootstrap", "packet", "response", "callbackReturn", "initialFinally", "queuedFinally"] as const;
const specs = { retain: [0, false], pristine: [7, true], serial: [1, false], debounce: [2, false], callbackKind: [2, true], packet: [2, false],
  taskSet: [0, false], data: [0, false], taskRemoved: [2, true], same: [1, true], packetText: [0, true], success: [0, true], bootstrap: [0, false],
  callback: [0, false], taskExclusive: [2, true] } as const;
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const callRoles = ["retain", "pristine", "serial", "debounce", "callbackKind", "packet", "taskSet", "data", "taskRemoved", "same", "packetText", "success", "bootstrap", "callback", "taskExclusive"] as const;
const callSchemas = callRoles.map(role => z.strictObject({ phase: z.literal(`project-save-structure-${role}`), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS[role]), arguments: z.array(object).length(specs[role][0]), returnByValue: z.literal(specs[role][1]) }) }));
const position = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const armParams = z.strictObject({ location: position });
const frameParams = z.strictObject({ objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false), callFrameId: handle, expression: z.enum(roles.map(role => SITES[role].expression)) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const commands = z.union([...callSchemas,
  z.strictObject({ phase: z.literal("project-save-structure-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("project-save-structure-arm"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("project-save-structure-frame"), role: z.enum(roles), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("project-save-structure-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("project-save-structure-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("project-save-structure-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("project-save-structure-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams })
]);
export type CurrentProjectSaveStructureCommand = z.infer<typeof commands>;
export function validateCurrentProjectSaveStructureCommand(input: unknown): CurrentProjectSaveStructureCommand {
  const command = commands.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "project-save-structure-arm") { const site = SITES[command.role]; if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("PROJECT_SAVE_STRUCTURE_FIXED_SITE"); } }
  if (command.phase === "project-save-structure-frame" && command.params.expression !== SITES[command.role].expression) { throw new Error("PROJECT_SAVE_STRUCTURE_FIXED_EXPRESSION"); }
  return freezeDeep(command);
}
/** Fixed examples feed the native case generator; handles are substitution
 * markers, never authority or application values selected by callers. */
export function currentProjectSaveStructureNativeCases(): readonly CurrentProjectSaveStructureCommand[] {
  const result: CurrentProjectSaveStructureCommand[] = []; const callFrameId = "structure_callFrameId", objectId = "structure_objectId", scriptId = "structure_scriptId";
  for (const role of roles) { const site = SITES[role]; result.push(validateCurrentProjectSaveStructureCommand({ phase: "project-save-structure-arm", role, method: "Debugger.setBreakpoint",
    params: { location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }), validateCurrentProjectSaveStructureCommand({ phase: "project-save-structure-frame", role,
    method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS, callFrameId, expression: site.expression } })); }
  for (const role of callRoles) { result.push(validateCurrentProjectSaveStructureCommand({ phase: `project-save-structure-${role}`, method: "Runtime.callFunctionOn", params: {
    ...CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS, objectId, functionDeclaration: CALLS[role], arguments: Array.from({ length: specs[role][0] }, (_, index) => ({ objectId: `structure_arg${String(index)}` })), returnByValue: specs[role][1] } })); }
  result.push({ phase: "project-save-structure-source", method: "Debugger.getScriptSource", params: { scriptId } },
    { phase: "project-save-structure-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "project-save-structure-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "structure_breakpointId" } },
    { phase: "project-save-structure-resume", method: "Debugger.resume", params: {} },
    { phase: "project-save-structure-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } });
  return freezeDeep(result.map(command => validateCurrentProjectSaveStructureCommand(command)));
}
