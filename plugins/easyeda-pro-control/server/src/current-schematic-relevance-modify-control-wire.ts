/** Fixed worker command rows. Only retained IDs vary in the serialized
 * native request; no caller script or callback can become executable code. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_KINDS as KINDS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_ROLES as ROLES, currentSchematicRelevanceModifyControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyControlPoint as point, validateCurrentSchematicRelevanceModifyControlCommand as validate } from "./current-schematic-relevance-modify-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyControlCommand as Command } from "./current-schematic-relevance-modify-control-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate the closed source guards, removals, captures and one resume. */
export function currentSchematicRelevanceModifyControlCases(): readonly Command[] {
  const rows: Command[] = [];
  for (const kind of KINDS) {
    const start = functionPoint(kind); const at = point(kind === "handler" ? "handlerReturned" : "batchReturned");
    rows.push(validate({ phase: "modify-control-possible", kind, method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId: "original_ref", ...start }, end: { scriptId: "original_ref", ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } }), validate({ phase: "modify-control-return", kind, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", ...at }, condition: "" } }));
  }
  for (const kind of KINDS) { rows.push(validate({ phase: "modify-control-function", kind, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })); }
  rows.push(validate({ phase: "modify-control-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  for (const role of ROLES) { rows.push(validate({ phase: "modify-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: "[this,s]", returnByValue: false, includeCommandLineAPI: false } })); }
  for (const proof of CALLS) { rows.push(validate({ phase: "modify-control-proof", role: proof[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: proof[1], arguments: Array.from({ length: proof[2] }, () => ({ objectId: "original_ref" })), returnByValue: proof[3], awaitPromise: false, userGesture: false } })); }
  rows.push(validate({ phase: "modify-control-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } }), validate({ phase: "modify-control-resume", method: "Debugger.resume", params: {} }));
  return freezeDeep(rows);
}
/** Replace only the opaque original IDs in one immutable command template. */
export function currentSchematicRelevanceModifyControlTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_modifycontrol_${name}__`; };
  if (command.phase === "modify-control-possible") { phase += `-${command.kind}`; params["start"] = { ...command.params.start, scriptId: field("scriptId", command.params.start.scriptId) }; params["end"] = { ...command.params.end, scriptId: field("scriptId", command.params.end.scriptId) }; }
  else if (command.phase === "modify-control-return") { phase += `-${command.kind}`; params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "modify-control-function") { phase += `-${command.kind}`; params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "modify-control-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "modify-control-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "modify-control-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase === "modify-control-proof") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_CONTROL_PROOF_INDEX"); } phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["functionDeclaration"] = `__schematic_modifycontrol_program${String(index)}__`; params["arguments"] = command.params.arguments.map((arg, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, arg.objectId) })); }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Serialize one fixed row; a native owner must still issue every control. */
export function currentSchematicRelevanceModifyControlWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_CONTROL_REQUEST_ID"); }
  const command = validate(input), row = currentSchematicRelevanceModifyControlTemplate(command); return freezeDeep({ command, request: { action: "schematic-relevance-modify-control", requestId, phase: row.phase, method: row.method, ...row.values } });
}
