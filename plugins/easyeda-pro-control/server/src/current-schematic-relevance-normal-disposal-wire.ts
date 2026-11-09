/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DISPOSAL_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DISPOSAL_FLAGS as FLAGS, validateCurrentSchematicRelevanceNormalDisposalCommand } from "./current-schematic-relevance-normal-disposal-protocol.ts";
import type { CurrentSchematicRelevanceNormalDisposalCommand } from "./current-schematic-relevance-normal-disposal-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceNormalDisposalCases(): readonly CurrentSchematicRelevanceNormalDisposalCommand[] {
  const result:CurrentSchematicRelevanceNormalDisposalCommand[]=[];
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceNormalDisposalCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceNormalDisposalCommand({phase:"source",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}}),validateCurrentSchematicRelevanceNormalDisposalCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceNormalDisposalTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** The single resume syntax is separately guarded by the native stage and
 * original controller reservation. No other pause can use it. */
export function currentSchematicRelevanceNormalDisposalTemplate(input: unknown): CurrentSchematicRelevanceNormalDisposalTemplate {
  const command = validateCurrentSchematicRelevanceNormalDisposalCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_normaldisposal_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if(command.phase==="source"){params["scriptId"]=field("scriptId",command.params.scriptId);}
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_NORMAL_DISPOSAL_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_normaldisposal_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceNormalDisposalWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceNormalDisposalCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_NORMAL_DISPOSAL_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceNormalDisposalCommand(input); const row = currentSchematicRelevanceNormalDisposalTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-normal-disposal", requestId, phase: row.phase, method: row.method, ...row.values } });
}
