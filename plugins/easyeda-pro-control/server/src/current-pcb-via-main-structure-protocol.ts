/** Closed Via-only structure request/SQL/publication grammar. Parsing this
 * data cannot issue original body, callback-loan or native mutation authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as LEGACY } from "./current-project-structure-main-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_MAIN_PROGRAMS as CURRENT } from "./current-project-save-structure-main-programs.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_CALLERS as CALLERS, CURRENT_PCB_VIA_MAIN_STRUCTURE_CONDITIONS as CONDITIONS, CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES as SITES } from "./current-pcb-via-main-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_MAIN_STRUCTURE_GROUP = "easyeda-via-main-structure209-v1";
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS = freezeDeep({
  invocation: { program: LEGACY.driver, arguments: 2, length: 6, returnByValue: false },
  context: { program: LEGACY.context, arguments: 1, length: 6, returnByValue: false },
  contextJoin: { program: LEGACY["context-join"], arguments: 1, length: 0, returnByValue: true },
  controller: { program: CURRENT.controller, arguments: 3, length: 12, returnByValue: false },
  query: { program: CURRENT.query, arguments: 2, length: 7, returnByValue: false },
  connection: { program: CURRENT.connection, arguments: 1, length: 0, returnByValue: true },
  selected: { program: CURRENT.selected, arguments: 1, length: 3, returnByValue: false },
  selectedValue: { program: CURRENT.selectedValue, arguments: 0, length: 0, returnByValue: true },
  update: { program: CURRENT.update, arguments: 1, length: 4, returnByValue: false },
  rowsValue: { program: CURRENT.rowsValue, arguments: 0, length: 0, returnByValue: true },
  exec: { program: CURRENT.exec, arguments: 1, length: 2, returnByValue: false },
  run: { program: CURRENT.run, arguments: 3, length: 4, returnByValue: false },
  runValue: { program: CURRENT.runValue, arguments: 0, length: 0, returnByValue: true },
  callback: { program: CURRENT.callback, arguments: 1, length: 4, returnByValue: false },
  callbackValue: { program: CURRENT.callbackValue, arguments: 0, length: 0, returnByValue: true },
  updateReturned: { program: CURRENT.updateReturned, arguments: 1, length: 2, returnByValue: false },
  serviceReturned: { program: CURRENT.serviceReturned, arguments: 1, length: 2, returnByValue: false },
  controllerReturned: { program: CURRENT.controllerReturned, arguments: 1, length: 3, returnByValue: false },
  response: { program: CURRENT.response, arguments: 1, length: 5, returnByValue: false },
  responseValue: { program: CURRENT.responseValue, arguments: 0, length: 0, returnByValue: true },
  finalSelect: { program: CURRENT.finalSelect, arguments: 0, length: 4, returnByValue: false },
  finalEntry: { program: CURRENT.finalEntry, arguments: 1, length: 2, returnByValue: false },
  finalReturned: { program: CURRENT.finalReturned, arguments: 1, length: 2, returnByValue: false },
  finalValue: { program: CURRENT.finalValue, arguments: 0, length: 0, returnByValue: true },
});
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_STEPS = ["driver", "context", "controller", "query", "selected", "update", "exec", "run", "callback", "updateReturned", "serviceReturned", "controllerReturned", "response", "finalEntry", "finalReturned"] as const;
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS = Object.freeze({ arms: 12, originalFinalArm: 1, frames: 18, joins: 24, properties: 4, originalSteps: 15, normal: 12 + 1 + 18 + 24 + 4 + 15,
  ownPointRemovals: 13, groupRelease: 1, cleanup: 14, total: 12 + 1 + 18 + 24 + 4 + 15 + 14, events: 31 });
const roles = ["context", "controller", "query", "selected", "update", "exec", "callback", "updateReturned", "serviceReturned", "controllerReturned", "response", "finalEntry", "finalReturned", "finalFailed"] as const;
const callers = ["driver", "driverCaller", "queryCaller", "run", "runCaller"] as const;
const programs = ["invocation", "context", "contextJoin", "controller", "query", "connection", "selected", "selectedValue", "update", "rowsValue", "exec", "run", "runValue", "callback", "callbackValue", "updateReturned", "serviceReturned", "controllerReturned", "response", "responseValue", "finalSelect", "finalEntry", "finalReturned", "finalValue"] as const;
export type CurrentPcbViaMainStructureRole = typeof roles[number];
export type CurrentPcbViaMainStructureFrameRole = typeof roles[number] | typeof callers[number];
export type CurrentPcbViaMainStructureProgramRole = typeof programs[number];
export type CurrentPcbViaMainStructureStep = typeof CURRENT_PCB_VIA_MAIN_STRUCTURE_STEPS[number];
const GROUP = CURRENT_PCB_VIA_MAIN_STRUCTURE_GROUP, handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const currentPcbViaMainStructureExpectedSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), ticket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), structureText: z.string().min(1).max(9999).refine(value => value.isWellFormed()) }).refine(value => Buffer.byteLength(JSON.stringify({ ticket: value.ticket, structure: value.structureText })) < 10_000);
export type CurrentPcbViaMainStructureExpected = Readonly<z.infer<typeof currentPcbViaMainStructureExpectedSchema>>;
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const armParams = z.strictObject({ location: point, condition: z.string().max(1200).optional() });
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const frameParams = z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string().max(256) });
const expectedArgument = z.strictObject({ value: currentPcbViaMainStructureExpectedSchema }); const argumentSchema = z.union([ref, expectedArgument]);
const joinParams = z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argumentSchema).max(3), returnByValue: z.boolean() });
const empty = z.strictObject({}); const removeParams = z.strictObject({ breakpointId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("via-main-structure-arm"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("via-main-structure-final-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: ref }),
  z.strictObject({ phase: z.literal("via-main-structure-properties"), role: z.enum(["query", "promise", "final", "finalFunction"]), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("via-main-structure-frame"), role: z.enum([...roles, ...callers]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("via-main-structure-join"), role: z.enum(programs), method: z.literal("Runtime.callFunctionOn"), params: joinParams }),
  z.strictObject({ phase: z.literal("via-main-structure-step"), role: z.enum(CURRENT_PCB_VIA_MAIN_STRUCTURE_STEPS), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("via-main-structure-remove"), role: z.enum(roles), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("via-main-structure-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentPcbViaMainStructureCommand = z.infer<typeof schema>;
export function currentPcbViaMainStructureFrame(role: CurrentPcbViaMainStructureFrameRole): Readonly<{ lineNumber: number; functionColumn: number; name: string; expression: string; length: number }> { return Object.hasOwn(SITES, role) ? SITES[z.enum(roles).parse(role)] : CALLERS[z.enum(callers).parse(role)]; }
export function validateCurrentPcbViaMainStructureCommand(input: unknown): CurrentPcbViaMainStructureCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "via-main-structure-arm") { if (command.role === "callback" || command.role === "finalEntry") { throw new Error("PCB_VIA_STRUCTURE_ORIGINAL_POINT_REQUIRED"); } const site = SITES[command.role]; const expected: unknown = Object.getOwnPropertyDescriptor(CONDITIONS, command.role)?.value; if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber || command.params.condition !== expected) { throw new Error("PCB_VIA_STRUCTURE_FIXED_SITE"); } }
  else if (command.phase === "via-main-structure-frame") { if (command.params.expression !== currentPcbViaMainStructureFrame(command.role).expression) { throw new Error("PCB_VIA_STRUCTURE_FIXED_FRAME"); } }
  else if (command.phase === "via-main-structure-join") { const fixed = CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS[command.role]; if (command.params.functionDeclaration !== fixed.program || command.params.arguments.length !== fixed.arguments || command.params.returnByValue !== fixed.returnByValue || command.params.arguments.some((argument, index) => Object.hasOwn(argument, "value") !== (command.role === "controller" && index === 2))) { throw new Error("PCB_VIA_STRUCTURE_FIXED_JOIN"); } }
  else if (command.phase === "via-main-structure-remove" && command.role === "callback") { throw new Error("PCB_VIA_STRUCTURE_BORROWED_CALLBACK"); }
  return freezeDeep(command);
}
function location(role: CurrentPcbViaMainStructureRole): Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> { return { scriptId: "via_script", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber }; }
export function currentPcbViaMainStructureNativeCases(): readonly CurrentPcbViaMainStructureCommand[] {
  const commands: unknown[] = [];
  for (const role of roles) { if (role !== "callback" && role !== "finalEntry") { const condition: unknown = Object.getOwnPropertyDescriptor(CONDITIONS, role)?.value; commands.push({ phase: "via-main-structure-arm", role, method: "Debugger.setBreakpoint", params: { location: location(role), ...(condition === undefined ? {} : { condition }) } }); }
    if (role !== "callback") { commands.push({ phase: "via-main-structure-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "via_point" } }); } }
  for (const role of [...roles, ...callers]) { commands.push({ phase: "via-main-structure-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PCB_VIA_MAIN_STRUCTURE_FRAME_FLAGS, callFrameId: "via_frame", expression: currentPcbViaMainStructureFrame(role).expression } }); }
  for (const role of programs) { const fixed = CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS[role]; commands.push({ phase: "via-main-structure-join", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_MAIN_STRUCTURE_CALL_FLAGS, objectId: "via_packet", functionDeclaration: fixed.program, arguments: Array.from({ length: fixed.arguments }, (_, index) => role === "controller" && index === 2 ? { value: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 3, structureText: "{}" } } : { objectId: `via_argument${String(index)}` }), returnByValue: fixed.returnByValue } }); }
  for (const role of CURRENT_PCB_VIA_MAIN_STRUCTURE_STEPS) { commands.push({ phase: "via-main-structure-step", role, method: "Debugger.resume", params: {} }); }
  for (const role of ["query", "promise", "final", "finalFunction"]) { commands.push({ phase: "via-main-structure-properties", role, method: "Runtime.getProperties", params: { objectId: "via_packet", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  commands.push({ phase: "via-main-structure-final-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "via_function" } }, { phase: "via-main-structure-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }); return freezeDeep(commands.map(command => validateCurrentPcbViaMainStructureCommand(command)));
}
