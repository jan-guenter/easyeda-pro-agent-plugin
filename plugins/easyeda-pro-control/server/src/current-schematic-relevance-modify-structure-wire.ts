/** Distinct fixed commands for the original Modify TEXT serial wave. The
 * startup-eight and Save codebooks retain their existing bytes and limits. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES as SITES, validateCurrentSchematicRelevanceModifyStructureCommand as validate } from "./current-schematic-relevance-modify-structure-protocol.ts";
import type { CurrentSchematicRelevanceModifyStructureCommand as Command } from "./current-schematic-relevance-modify-structure-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate only the two temporary epochs, five captures, passive helpers
 * and three once-only resumes reached by the original structure reader. */
export function currentSchematicRelevanceModifyStructureCases(): readonly Command[] {
  const rows: Command[] = [];
  for (const role of ["startupEntry", "startupReturn", "entry", "returned"] as const) { rows.push(validate({ phase: "modify-structure-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } })); }
  for (const role of ["entry", "returned"] as const) { const at = SITES[role]; rows.push(validate({ phase: "modify-structure-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", lineNumber: at.lineNumber, columnNumber: at.columnNumber } } })); }
  for (const role of ["entry", "returned", "finalizer", "serialCaller", "onChange"] as const) { rows.push(validate({ phase: "modify-structure-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: SITES[role].expression, returnByValue: false, includeCommandLineAPI: false } })); }
  rows.push(validate({ phase: "modify-structure-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  for (const row of CALLS) { rows.push(validate({ phase: "modify-structure-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  for (const role of ["entry", "returned", "finalizer"] as const) { rows.push(validate({ phase: "modify-structure-resume", role, method: "Debugger.resume", params: {} })); }
  return freezeDeep(rows);
}
/** Encode retained handles in the one exact source row. No program, role,
 * frame expression, condition or method can arrive from native JSON. */
export function currentSchematicRelevanceModifyStructureTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_modifystructure_${name}__`; };
  if (command.phase === "modify-structure-remove") { phase += `-${command.role}`; params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase === "modify-structure-arm") { phase += `-${command.role}`; params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "modify-structure-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "modify-structure-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "modify-structure-call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_STRUCTURE_PROGRAM"); } phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["functionDeclaration"] = `__schematic_modifystructure_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, argument.objectId) })); }
  else { phase += `-${command.role}`; }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Retain the own7 action and positive original request ID. The encoder has
 * no generic JavaScript field or alternate native recipient. */
export function currentSchematicRelevanceModifyStructureWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_STRUCTURE_REQUEST_ID"); }
  const command = validate(input), row = currentSchematicRelevanceModifyStructureTemplate(command); return freezeDeep({ command, request: { action: "schematic-relevance-modify-structure", requestId, phase: row.phase, method: row.method, ...row.values } });
}
