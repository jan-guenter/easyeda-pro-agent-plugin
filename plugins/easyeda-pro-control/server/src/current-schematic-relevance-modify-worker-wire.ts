/** Passive original-worker codebook. Only retained handles vary; source,
 * flags, argument counts and the held-frame expression remain fixed. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyWorkerCommand as validate } from "./current-schematic-relevance-modify-worker-protocol.ts";
import type { CurrentSchematicRelevanceModifyWorkerCommand as Command } from "./current-schematic-relevance-modify-worker-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as P} from "./current-schematic-relevance-modify-worker-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate every passive request with inert representative original handles. */
export function currentSchematicRelevanceModifyWorkerCases(): readonly Command[] {
  const rows: Command[] = [
    validate({ phase: "modify-worker-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validate({ phase: "modify-worker-source", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } }),
    validate({phase:"modify-worker-literal",method:"Runtime.evaluate",params:{...FLAGS,expression:`(${P.literal})()`,uniqueContextId:"original_ref",returnByValue:false,includeCommandLineAPI:false,awaitPromise:false,userGesture:false}}),
  ];
  for (const row of CALLS) { rows.push(validate({ phase: "modify-worker-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  return freezeDeep(rows);
}
export interface CurrentSchematicRelevanceModifyWorkerTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Encode one validated fixed row while retaining only its handle substitutions. */
export function currentSchematicRelevanceModifyWorkerTemplate(input: unknown): CurrentSchematicRelevanceModifyWorkerTemplate {
  const command = validate(input), names: string[] = [], values: Record<string, string> = {};
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_modifyworker_${name}__`; };
  if (command.phase === "modify-worker-source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else if(command.phase==="modify-worker-literal"){params["uniqueContextId"]=field("uniqueContextId",command.params.uniqueContextId);}
  else {
    params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "modify-worker-call") {
      const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_WORKER_FIXED_PROGRAM"); }
      phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_modifyworker_program${String(index)}__`;
      params["arguments"] = command.params.arguments.map((arg, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, arg.objectId) }));
    }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Bind one finite worker row to an original request ID without transport. */
export function currentSchematicRelevanceModifyWorkerWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_WORKER_REQUEST_ID"); }
  const command = validate(input), row = currentSchematicRelevanceModifyWorkerTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-worker", requestId, phase: row.phase, method: row.method, ...row.values } });
}
