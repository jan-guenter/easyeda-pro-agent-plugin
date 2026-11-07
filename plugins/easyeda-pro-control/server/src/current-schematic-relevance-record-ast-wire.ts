/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_FLAGS as FLAGS, validateCurrentSchematicRelevanceRecordAstCommand } from "./current-schematic-relevance-record-ast-protocol.ts";
import type { CurrentSchematicRelevanceRecordAstCommand } from "./current-schematic-relevance-record-ast-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceRecordAstCases(): readonly CurrentSchematicRelevanceRecordAstCommand[] {
  const result: CurrentSchematicRelevanceRecordAstCommand[] = [];
  for (const role of ["record", "ast"] as const) { result.push(validateCurrentSchematicRelevanceRecordAstCommand({ phase: "frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: role === "record" ? "[this,n,t]" : "[this]", returnByValue: false, includeCommandLineAPI: false } })); }
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceRecordAstCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceRecordAstCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validateCurrentSchematicRelevanceRecordAstCommand({ phase: "resume", method: "Debugger.resume", params: {} }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceRecordAstTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** The single resume syntax is separately guarded by the native stage and
 * original controller reservation. No other pause can use it. */
export function currentSchematicRelevanceRecordAstTemplate(input: unknown): CurrentSchematicRelevanceRecordAstTemplate {
  const command = validateCurrentSchematicRelevanceRecordAstCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_recordast_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "resume") {
    // The one original receiver is privately reserved by the controller.
  }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_RECORD_AST_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_recordast_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceRecordAstWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceRecordAstCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_RECORD_AST_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceRecordAstCommand(input); const row = currentSchematicRelevanceRecordAstTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-record-ast", requestId, phase: row.phase, method: row.method, ...row.values } });
}
