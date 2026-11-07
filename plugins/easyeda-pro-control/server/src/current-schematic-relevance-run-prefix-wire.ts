/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS as FLAGS, currentSchematicRelevanceRunPrefixExpression, validateCurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceRunPrefixCases(): readonly CurrentSchematicRelevanceRunPrefixCommand[] {
  const result: CurrentSchematicRelevanceRunPrefixCommand[] = [];
  for (const variant of [0, 1] as const) { for (const role of ["run", "group", "module", "intrinsics", "empty", "receiver"] as const) { result.push(validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-frame", role, variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: currentSchematicRelevanceRunPrefixExpression(role, variant), returnByValue: false, includeCommandLineAPI: false } })); } }
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validateCurrentSchematicRelevanceRunPrefixCommand({ phase: "prefix-source", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceRunPrefixTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** This encoder deliberately has no arm, remove or resume row. Those require
 * separate original callback custody and native continuation admission. */
export function currentSchematicRelevanceRunPrefixTemplate(input: unknown): CurrentSchematicRelevanceRunPrefixTemplate {
  const command = validateCurrentSchematicRelevanceRunPrefixCommand(input);
  if (command.phase !== "prefix-frame" && command.phase !== "prefix-call" && command.phase !== "prefix-properties" && command.phase !== "prefix-source") { throw new Error("SCHEMATIC_PREFIX_READ_ONLY_WIRE"); }
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_prefix_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "prefix-frame") { phase += `-${command.role}-${String(command.variant)}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "prefix-source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "prefix-call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_PREFIX_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_prefix_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceRunPrefixWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceRunPrefixCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_PREFIX_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceRunPrefixCommand(input); const row = currentSchematicRelevanceRunPrefixTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-run-prefix", requestId, phase: row.phase, method: row.method, ...row.values } });
}
