import {CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_EXPRESSIONS as EXPRESSIONS} from "./current-schematic-relevance-history-command-programs.ts";
/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_FLAGS as FLAGS, validateCurrentSchematicRelevanceHistoryCommand } from "./current-schematic-relevance-history-command-protocol.ts";
import type { CurrentSchematicRelevanceHistoryCommand } from "./current-schematic-relevance-history-command-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceHistoryCommandCases(): readonly CurrentSchematicRelevanceHistoryCommand[] {
  const result:CurrentSchematicRelevanceHistoryCommand[]=[];
  for(const role of ["getModel","attribute"] as const){result.push(validateCurrentSchematicRelevanceHistoryCommand({phase:"arm",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original_ref",condition:""}}));}
  for(const role of ["history","getModelMain","getModelChild","attributeMain","attributeChild","finish"] as const){result.push(validateCurrentSchematicRelevanceHistoryCommand({phase:"frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:"original_ref",expression:EXPRESSIONS[role],returnByValue:false,includeCommandLineAPI:false}}));}
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceHistoryCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceHistoryCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validateCurrentSchematicRelevanceHistoryCommand({ phase: "resume", method: "Debugger.resume", params: {} }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceHistoryCommandTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** The single resume syntax is separately guarded by the native stage and
 * original controller reservation. No other pause can use it. */
export function currentSchematicRelevanceHistoryCommandTemplate(input: unknown): CurrentSchematicRelevanceHistoryCommandTemplate {
  const command = validateCurrentSchematicRelevanceHistoryCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_historycommand_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if(command.phase==="arm"){phase+=`-${command.role}`;params["objectId"]=field("objectId",command.params.objectId);}
  else if (command.phase === "resume") {
    // The one original receiver is privately reserved by the controller.
  }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_HISTORY_COMMAND_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_historycommand_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceHistoryCommandWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceHistoryCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_HISTORY_COMMAND_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceHistoryCommand(input); const row = currentSchematicRelevanceHistoryCommandTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-history-command", requestId, phase: row.phase, method: row.method, ...row.values } });
}
