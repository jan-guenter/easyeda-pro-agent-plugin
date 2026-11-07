/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_NOECHO_FLAGS as FLAGS, validateCurrentSchematicRelevanceNoEchoCommand } from "./current-schematic-relevance-noecho-protocol.ts";
import type { CurrentSchematicRelevanceNoEchoCommand } from "./current-schematic-relevance-noecho-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceNoEchoCases(): readonly CurrentSchematicRelevanceNoEchoCommand[] {
  const result:CurrentSchematicRelevanceNoEchoCommand[]=[];
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceNoEchoCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceNoEchoCommand({phase:"source",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}}),validateCurrentSchematicRelevanceNoEchoCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validateCurrentSchematicRelevanceNoEchoCommand({phase:"namespace",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:"original_ref",expression:"[C]",returnByValue:false,includeCommandLineAPI:false}}));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceNoEchoTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** This fixed readonly preparation exposes no resume syntax. */
export function currentSchematicRelevanceNoEchoTemplate(input: unknown): CurrentSchematicRelevanceNoEchoTemplate {
  const command = validateCurrentSchematicRelevanceNoEchoCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_noecho_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if(command.phase==="namespace"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
  else if(command.phase==="source"){params["scriptId"]=field("scriptId",command.params.scriptId);}
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_NOECHO_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_noecho_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceNoEchoWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceNoEchoCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_NOECHO_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceNoEchoCommand(input); const row = currentSchematicRelevanceNoEchoTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-noecho", requestId, phase: row.phase, method: row.method, ...row.values } });
}
