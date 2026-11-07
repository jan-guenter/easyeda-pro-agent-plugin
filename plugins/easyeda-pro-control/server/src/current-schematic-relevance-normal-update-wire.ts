import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_EXPRESSIONS as EXPRESSIONS} from "./current-schematic-relevance-normal-update-programs.ts";
/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_FLAGS as FLAGS, validateCurrentSchematicRelevanceNormalUpdateCommand } from "./current-schematic-relevance-normal-update-protocol.ts";
import type { CurrentSchematicRelevanceNormalUpdateCommand } from "./current-schematic-relevance-normal-update-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceNormalUpdateCases(): readonly CurrentSchematicRelevanceNormalUpdateCommand[] {
  const result:CurrentSchematicRelevanceNormalUpdateCommand[]=[];
  for(const role of ["promise","runSuccess","finishing","success","stack","update","canRecord"] as const){result.push(validateCurrentSchematicRelevanceNormalUpdateCommand({phase:"arm",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original_ref",condition:""}}));}
  for(const role of ["finish","promise","promiseCaller","runSuccess","finishing","success","stackMain","stackChild","update","canRecordMain","canRecordChild"] as const){result.push(validateCurrentSchematicRelevanceNormalUpdateCommand({phase:"frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:"original_ref",expression:EXPRESSIONS[role],returnByValue:false,includeCommandLineAPI:false}}));}
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceNormalUpdateCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceNormalUpdateCommand({phase:"source",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}}),validateCurrentSchematicRelevanceNormalUpdateCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validateCurrentSchematicRelevanceNormalUpdateCommand({ phase: "resume", method: "Debugger.resume", params: {} }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceNormalUpdateTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** The single resume syntax is separately guarded by the native stage and
 * original controller reservation. No other pause can use it. */
export function currentSchematicRelevanceNormalUpdateTemplate(input: unknown): CurrentSchematicRelevanceNormalUpdateTemplate {
  const command = validateCurrentSchematicRelevanceNormalUpdateCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_normalupdate_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if(command.phase==="source"){params["scriptId"]=field("scriptId",command.params.scriptId);}
  else if (command.phase === "frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if(command.phase==="arm"){phase+=`-${command.role}`;params["objectId"]=field("objectId",command.params.objectId);}
  else if (command.phase === "resume") {
    // The one original receiver is privately reserved by the controller.
  }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_NORMAL_UPDATE_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_normalupdate_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceNormalUpdateWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceNormalUpdateCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_NORMAL_UPDATE_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceNormalUpdateCommand(input); const row = currentSchematicRelevanceNormalUpdateTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-normal-update", requestId, phase: row.phase, method: row.method, ...row.values } });
}
