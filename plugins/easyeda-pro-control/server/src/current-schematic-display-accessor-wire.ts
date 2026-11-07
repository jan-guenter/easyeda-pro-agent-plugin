/** Fixed original SCH metadata codebook. Initial holder and target data belong
 * to native custody and never enter caller-selectable wire fields. */
import { currentSchematicDisplayAccessorNativeCases, validateCurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";
import type { CurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicDisplayAccessorTemplate { readonly phase: string; readonly method: string; readonly fields: Readonly<Record<string, "handle" | "field">>; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentSchematicDisplayAccessorTemplate(input: unknown): CurrentSchematicDisplayAccessorTemplate {
  const command = validateCurrentSchematicDisplayAccessorCommand(input); const fields: Record<string, "handle" | "field"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string, kind: "handle" | "field" = "handle"): string => { if (Object.hasOwn(fields, name)) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_FIELD_ALIAS"); } fields[name] = kind; values[name] = value; return `__schematic_accessor_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Runtime.callFunctionOn") {
    params["objectId"] = command.phase === "schematic-accessor-callees" ? "__schematic_accessor_boundHolder__" : field("objectId", command.params.objectId);
    if (command.phase === "schematic-accessor-callees") { params["arguments"] = [{ value: "__schematic_accessor_boundTarget__" }, { value: "__schematic_accessor_boundOperation__" }]; }
    else { const argumentsValue: unknown[] = [{ objectId: "__schematic_accessor_boundHolder__" }, { value: "__schematic_accessor_boundTarget__" }, { value: "__schematic_accessor_boundOperation__" }];
      if (command.phase === "schematic-accessor-closure") { const captured = field("field", command.params.arguments[3].value, "field"); argumentsValue.push({ value: captured }, { objectId: field("decorator", command.params.arguments[4].objectId) }, { value: captured }); }
      params["arguments"] = argumentsValue;
    }
  } else if (command.method === "Runtime.getProperties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicDisplayAccessorWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicDisplayAccessorCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_ID"); }
  const command = validateCurrentSchematicDisplayAccessorCommand(input), fixed = currentSchematicDisplayAccessorTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-display-accessor", requestId: id, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
export function currentSchematicDisplayAccessorTemplates(): readonly CurrentSchematicDisplayAccessorTemplate[] { return freezeDeep(currentSchematicDisplayAccessorNativeCases().map(command => currentSchematicDisplayAccessorTemplate(command))); }
