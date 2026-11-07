/** Native-owned holder/target substitution; wire exposes no programs or realm. */
import { currentSchematicDisplayActionNativeCases, validateCurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";
import type { CurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicDisplayActionTemplate { readonly phase: string; readonly method: string; readonly fields: Readonly<Record<string, "handle">>; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentSchematicDisplayActionTemplate(input: unknown): CurrentSchematicDisplayActionTemplate {
  const command = validateCurrentSchematicDisplayActionCommand(input); const fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (Object.hasOwn(fields, name)) { throw new Error("SCHEMATIC_DISPLAY_ACTION_FIELD_ALIAS"); } fields[name] = "handle"; values[name] = value; return `__schematic_action_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Runtime.callFunctionOn") {
    params["objectId"] = command.phase === "schematic-action-preflight" ? "__schematic_action_boundHolder__" : field("objectId", command.params.objectId);
    params["arguments"] = command.phase === "schematic-action-preflight" ? [{ value: "__schematic_action_boundTarget__" }, { value: "__schematic_action_boundOperation__" }] :
      [{ objectId: "__schematic_action_boundHolder__" }, { value: "__schematic_action_boundTarget__" }, { value: "__schematic_action_boundOperation__" }];
  } else if (command.method === "Runtime.getProperties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicDisplayActionWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicDisplayActionCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_DISPLAY_ACTION_ID"); }
  const command = validateCurrentSchematicDisplayActionCommand(input), fixed = currentSchematicDisplayActionTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-display-action", requestId: id, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
export function currentSchematicDisplayActionTemplates(): readonly CurrentSchematicDisplayActionTemplate[] { return freezeDeep(currentSchematicDisplayActionNativeCases().map(command => currentSchematicDisplayActionTemplate(command))); }
