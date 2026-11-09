/** Passive original-Echo codebook. Only retained handles vary; source,
 * flags, argument counts and the held-frame expression remain fixed. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyEchoEventCommand as validate } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoEventCommand as Command } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate every fixed passive phase and proof call for native codec parity.
 * Each placeholder case passes the same strict validator as an actual request. */
export function currentSchematicRelevanceModifyEchoEventCases(): readonly Command[] {
  const rows: Command[] = [
    validate({ phase: "modify-echo-event-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validate({ phase: "modify-echo-event-source", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } }),
    validate({ phase: "modify-echo-event-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: "[this,K]", returnByValue: false, includeCommandLineAPI: false } }),
  ];
  for (const row of CALLS) { rows.push(validate({ phase: "modify-echo-event-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  return freezeDeep(rows);
}
export interface CurrentSchematicRelevanceModifyEchoEventTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Convert a validated request to a fixed template and named handle values.
 * Function text comes only from the closed codebook; an unknown call role
 * refuses before a native program index can be emitted. */
export function currentSchematicRelevanceModifyEchoEventTemplate(input: unknown): CurrentSchematicRelevanceModifyEchoEventTemplate {
  const command = validate(input), names: string[] = [], values: Record<string, string> = {};
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_modifyechoevent_${name}__`; };
  if (command.phase === "modify-echo-event-source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else if (command.phase === "modify-echo-event-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else {
    params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "modify-echo-event-call") {
      const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_ECHO_EVENT_FIXED_PROGRAM"); }
      phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_modifyechoevent_program${String(index)}__`;
      params["arguments"] = command.params.arguments.map((arg, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, arg.objectId) }));
    }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Bind one positive native request ID to the validated passive command and
 * its exact template fields. This encoding issues no owner or resume grant. */
export function currentSchematicRelevanceModifyEchoEventWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_ECHO_EVENT_REQUEST_ID"); }
  const command = validate(input), row = currentSchematicRelevanceModifyEchoEventTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-echo-event", requestId, phase: row.phase, method: row.method, ...row.values } });
}
