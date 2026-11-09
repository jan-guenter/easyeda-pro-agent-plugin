/** Exact passive event packets use the same original worker session as the
 * guarded handler. This codec adds no native listener or continuation. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyEventCommand as validate } from "./current-schematic-relevance-modify-event-protocol.ts";
import type { CurrentSchematicRelevanceModifyEventCommand as Command } from "./current-schematic-relevance-modify-event-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate every fixed passive row with inert representative handles. */
export function currentSchematicRelevanceModifyEventCases(): readonly Command[] {
  const rows: Command[] = [validate({ phase: "modify-event-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), validate({ phase: "modify-event-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: "[this,s]", returnByValue: false, includeCommandLineAPI: false } })];
  for (const row of CALLS) { rows.push(validate({ phase: "modify-event-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  return freezeDeep(rows);
}
/** Encode one validated source row, substituting only its retained handles. */
export function currentSchematicRelevanceModifyEventTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_modifyevent_${name}__`; };
  if (command.phase === "modify-event-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else { params["objectId"] = field("objectId", command.params.objectId); if (command.phase === "modify-event-call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_EVENT_PROGRAM"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_modifyevent_program${String(index)}__`; params["arguments"] = command.params.arguments.map((argument, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, argument.objectId) })); } }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Retain the worker action and bounded request ID; no JavaScript arrives on
 * this wire and no passive row can select a callback or resume. */
export function currentSchematicRelevanceModifyEventWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_EVENT_REQUEST_ID"); }
  const command = validate(input), row = currentSchematicRelevanceModifyEventTemplate(command); return freezeDeep({ command, request: { action: "schematic-relevance-modify-control", requestId, phase: row.phase, method: row.method, ...row.values } });
}
