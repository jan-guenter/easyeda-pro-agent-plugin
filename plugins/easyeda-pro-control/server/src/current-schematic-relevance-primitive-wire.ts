/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_FLAGS as FLAGS, validateCurrentSchematicRelevancePrimitiveCommand } from "./current-schematic-relevance-primitive-protocol.ts";
import type { CurrentSchematicRelevancePrimitiveCommand } from "./current-schematic-relevance-primitive-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevancePrimitiveCases(): readonly CurrentSchematicRelevancePrimitiveCommand[] {
  const result: CurrentSchematicRelevancePrimitiveCommand[] = [];
  for (const role of ["before", "record"] as const) { result.push(validateCurrentSchematicRelevancePrimitiveCommand({ phase: "frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: role === "before" ? "[this,n,s,a,o]" : "[this,n]", returnByValue: false, includeCommandLineAPI: false } })); }
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevancePrimitiveCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevancePrimitiveCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validateCurrentSchematicRelevancePrimitiveCommand({ phase: "resume", method: "Debugger.resume", params: {} }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevancePrimitiveTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** The single resume syntax is separately guarded by the native stage and
 * original controller reservation. No other pause can use it. */
export function currentSchematicRelevancePrimitiveTemplate(input: unknown): CurrentSchematicRelevancePrimitiveTemplate {
  const command = validateCurrentSchematicRelevancePrimitiveCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_primitive_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "resume") {
    // The one original receiver is privately reserved by the controller.
  }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_PRIMITIVE_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_primitive_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevancePrimitiveWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevancePrimitiveCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_PRIMITIVE_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevancePrimitiveCommand(input); const row = currentSchematicRelevancePrimitiveTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-primitive", requestId, phase: row.phase, method: row.method, ...row.values } });
}
