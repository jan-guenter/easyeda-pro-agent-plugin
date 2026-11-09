/** Fixed passive Return packets carry original handles only. No caller source,
 * source coordinate, owner token or continuation control enters this wire. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyReturnCommand as validate } from "./current-schematic-relevance-modify-return-protocol.ts";
import type { CurrentSchematicRelevanceModifyReturnCommand as Command } from "./current-schematic-relevance-modify-return-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate the exact inert frame, properties and source-owned helper rows. */
export function currentSchematicRelevanceModifyReturnCases(): readonly Command[] {
  const rows: Command[] = [validate({ phase: "modify-return-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })];
  for (const row of CALLS) { rows.push(validate({ phase: "modify-return-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  return freezeDeep(rows);
}
/** Replace only the opaque original IDs in one already validated command. */
export function currentSchematicRelevanceModifyReturnTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_modifyreturn_${name}__`; };
  params["objectId"] = field("objectId", command.params.objectId);
  if (command.phase === "modify-return-call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_RETURN_PROGRAM_INDEX"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_modifyreturn_program${String(index)}__`; params["arguments"] = command.params.arguments.map((arg, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, arg.objectId) })); }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Serialize passive data only; the original native state machine must
 * separately admit this exact phase while the original CM body is held. */
export function currentSchematicRelevanceModifyReturnWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_RETURN_REQUEST_ID"); }
  const command = validate(input); const row = currentSchematicRelevanceModifyReturnTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-return", requestId, phase: row.phase, method: row.method, ...row.values } });
}
