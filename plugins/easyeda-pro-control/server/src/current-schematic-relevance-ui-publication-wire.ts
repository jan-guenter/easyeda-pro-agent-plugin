/** Fixed wire projection. The original owner's private cursor still chooses
 * every actual handle and next command. Parsing supplies no live permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FLAGS as FLAGS, validateCurrentSchematicRelevanceUiPublicationCommand } from "./current-schematic-relevance-ui-publication-protocol.ts";
import type { CurrentSchematicRelevanceUiPublicationCommand } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceUiPublicationCases(): readonly CurrentSchematicRelevanceUiPublicationCommand[] {
  const result: CurrentSchematicRelevanceUiPublicationCommand[] = [validateCurrentSchematicRelevanceUiPublicationCommand({ phase: "global", method: "Runtime.evaluate", params: { ...FLAGS, expression: "this", uniqueContextId: "original_ref", returnByValue: false, includeCommandLineAPI: false, awaitPromise: false, userGesture: false } })];
  for (const variant of [0, 1] as const) { result.push(validateCurrentSchematicRelevanceUiPublicationCommand({ phase: "namespace", variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: variant === 0 ? "[da]" : "[ya]", returnByValue: false, includeCommandLineAPI: false } })); }
  for (const row of CALLS) { result.push(validateCurrentSchematicRelevanceUiPublicationCommand({ phase: "call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  result.push(validateCurrentSchematicRelevanceUiPublicationCommand({ phase: "properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validateCurrentSchematicRelevanceUiPublicationCommand({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } }));
  return freezeDeep(result);
}
export interface CurrentSchematicRelevanceUiPublicationTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** This encoder deliberately has no arm, remove or resume row. Those require
 * separate original callback custody and native continuation admission. */
export function currentSchematicRelevanceUiPublicationTemplate(input: unknown): CurrentSchematicRelevanceUiPublicationTemplate {
  const command = validateCurrentSchematicRelevanceUiPublicationCommand(input);
  let phase: string = command.phase;
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_publication_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "global") { params["uniqueContextId"] = "__schematic_publication_context__"; }
  else if (command.phase === "namespace") { phase += `-${String(command.variant)}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCHEMATIC_UI_PUBLICATION_CALL_ROLE"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_publication_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, slot) => ({ objectId: field(`argument${String(slot)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceUiPublicationWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceUiPublicationCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_UI_PUBLICATION_REQUEST_ID"); }
  const command = validateCurrentSchematicRelevanceUiPublicationCommand(input); const row = currentSchematicRelevanceUiPublicationTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-ui-publication", requestId, phase: row.phase, method: row.method, ...row.values } });
}
