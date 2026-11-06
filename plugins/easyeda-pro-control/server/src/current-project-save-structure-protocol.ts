/** Finite shared structure lane. Original Via and SCH births remain distinct;
 * this vocabulary admits no caller expression, path, target or SQL grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS } from "./current-project-save-structure-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION as STARTUP_CONDITION } from "./current-project-save-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS } from "./current-project-save-structure-programs.ts";
export { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTION_SEQUENCE, CURRENT_PROJECT_SAVE_STRUCTURE_SITES, CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION, qualifyCurrentProjectSaveStructureSource } from "./current-project-save-structure-source.ts";
export type { CurrentProjectSaveStructureSite } from "./current-project-save-structure-source.ts";

export const CURRENT_PROJECT_SAVE_STRUCTURE_GROUP = "easyeda-pro-control-project-save-structure209-v1";
/** Prior producer/Save sequence169. Two startup arms plus at most seven
 * original initial records each use entry8, return4 and finalizer6 commands.
 * Cleanup removes fourteen points and one group. The two ready-state conditions
 * are fixed on the wire; no arbitrary predicate is accepted. One original
 * mode frame plus its properties add two readonly commands before EP. */
export const CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS = Object.freeze({ normal: 169 + 2 + 7 * (8 + 4 + 6) + 2, cleanup: 14 + 1, cdpRequests: 314, events: 26 + 7 * 6, total: 382 });
const GROUP = CURRENT_PROJECT_SAVE_STRUCTURE_GROUP;
export const CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false,
  throwOnSideEffect: true, includeCommandLineAPI: false } as const);
export const CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const roles = [...CONSTRUCTORS, "startupEntry", "startupReturn", "bootstrap", "packet", "response", "callbackReturn", "initialFinally", "queuedFinally"] as const;
const frameRoles = [...roles, "mode", "timer", "producerCaller", "startupCaller"] as const;
const specs = { startupEntry: [4, true], startupReturn: [2, true], startupFinalizer: [3, true], retain: [0, false], pristine: [7, true], serial: [1, false], debounce: [2, false], callbackKind: [2, true], packet: [2, false],
  uploadSelect: [0, false], cooperationSelect: [0, false], uploadRelation: [3, true], cooperationRelation: [3, true], coldProject: [0, true], coldStream: [3, true], coldCooperation: [3, true],
  taskSet: [0, false], data: [0, false], taskRemoved: [2, true], same: [1, true], packetText: [0, true], success: [0, true], bootstrap: [0, false],
  callback: [0, false], taskExclusive: [2, true] } as const;
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const callRoles = ["startupEntry", "startupReturn", "startupFinalizer", "uploadSelect", "cooperationSelect", "uploadRelation", "cooperationRelation", "coldProject", "coldStream", "coldCooperation", "retain", "pristine", "serial", "debounce", "callbackKind", "packet", "taskSet", "data", "taskRemoved", "same", "packetText", "success", "bootstrap", "callback", "taskExclusive"] as const;
const callSchemas = callRoles.map(role => z.strictObject({ phase: z.literal(`project-save-structure-${role}`), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS[role]), arguments: z.array(object).length(specs[role][0]), returnByValue: z.literal(specs[role][1]) }) }));
const position = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const armParams = z.strictObject({ location: position, condition: z.literal(STARTUP_CONDITION).optional() });
const frameParams = z.strictObject({ objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false), callFrameId: handle, expression: z.enum(frameRoles.map(role => SITES[role].expression)) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const commands = z.union([...callSchemas,
  z.strictObject({ phase: z.literal("project-save-structure-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("project-save-structure-arm"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("project-save-structure-frame"), role: z.enum(frameRoles), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("project-save-structure-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("project-save-structure-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("project-save-structure-resume"), role: z.enum(roles), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("project-save-structure-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams })
]);
export type CurrentProjectSaveStructureCommand = z.infer<typeof commands>;
export function validateCurrentProjectSaveStructureCommand(input: unknown): CurrentProjectSaveStructureCommand {
  const command = commands.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "project-save-structure-arm") { const site = SITES[command.role]; if ((command.role === "startupEntry" || command.role === "startupReturn") !== Object.hasOwn(command.params, "condition")) { throw new Error("PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION"); } if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("PROJECT_SAVE_STRUCTURE_FIXED_SITE"); } }
  if (command.phase === "project-save-structure-frame" && command.params.expression !== SITES[command.role].expression) { throw new Error("PROJECT_SAVE_STRUCTURE_FIXED_EXPRESSION"); }
  return freezeDeep(command);
}
/** Fixed examples feed the native case generator; handles are substitution
 * markers, never authority or application values selected by callers. */
export function currentProjectSaveStructureNativeCases(): readonly CurrentProjectSaveStructureCommand[] {
  const result: CurrentProjectSaveStructureCommand[] = []; const callFrameId = "structure_callFrameId", objectId = "structure_objectId", scriptId = "structure_scriptId";
  for (const role of roles) { const site = SITES[role]; result.push(validateCurrentProjectSaveStructureCommand({ phase: "project-save-structure-arm", role, method: "Debugger.setBreakpoint",
    params: { location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(role === "startupEntry" || role === "startupReturn" ? { condition: STARTUP_CONDITION } : {}) } }), validateCurrentProjectSaveStructureCommand({ phase: "project-save-structure-frame", role,
    method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS, callFrameId, expression: site.expression } })); }
  for (const role of ["mode", "timer", "producerCaller", "startupCaller"] as const) { result.push(validateCurrentProjectSaveStructureCommand({ phase: "project-save-structure-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_STRUCTURE_FRAME_FLAGS, callFrameId, expression: SITES[role].expression } })); }
  for (const role of callRoles) { result.push(validateCurrentProjectSaveStructureCommand({ phase: `project-save-structure-${role}`, method: "Runtime.callFunctionOn", params: {
    ...CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS, objectId, functionDeclaration: CALLS[role], arguments: Array.from({ length: specs[role][0] }, (_, index) => ({ objectId: `structure_arg${String(index)}` })), returnByValue: specs[role][1] } })); }
  result.push({ phase: "project-save-structure-source", method: "Debugger.getScriptSource", params: { scriptId } },
    { phase: "project-save-structure-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "project-save-structure-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "structure_breakpointId" } },
    { phase: "project-save-structure-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } });
  for (const role of roles) { result.push({ phase: "project-save-structure-resume", role, method: "Debugger.resume", params: {} }); }
  return freezeDeep(result.map(command => validateCurrentProjectSaveStructureCommand(command)));
}

/** Only the original literal [qh] frame's own one-element array is accepted.
 * This value does not establish a continuous producer prefix. */
export function decodeCurrentProjectSaveProducerNonprivateMode(input: unknown): false {
  const field = z.looseObject({ name: z.string(), isOwn: z.literal(true), value: z.looseObject({ type: z.string(), value: z.unknown() }), get: z.never().optional(), set: z.never().optional() });
  const value = z.looseObject({ result: z.array(field).length(2) }).parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(value.result.map(item => [item.name, item.value]));
  if (fields.size !== 2 || fields.get("0")?.type !== "boolean" || fields.get("0")?.value !== false || fields.get("length")?.type !== "number" || fields.get("length")?.value !== 1) { throw new Error("PROJECT_SAVE_PRODUCER_NONPRIVATE_MODE_REQUIRED"); } return false;
}
