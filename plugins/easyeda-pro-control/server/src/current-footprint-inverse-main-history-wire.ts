/** Finite native selectors are only original correlated inspector handles. */
import { currentFootprintInverseMainHistoryNativeCases, validateCurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintInverseMainHistoryTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentFootprintInverseMainHistoryCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_ALIAS"); } fields.push(name); values[name] = value; return `__inverse_history_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-main-history-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "inverse-main-history-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "inverse-main-history-join") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, i) => ({ objectId: field(`argument${String(i)}`, argument.objectId) })); }
  else if (command.phase === "inverse-main-history-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "inverse-main-history-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseMainHistoryWire(input: unknown, requestId: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("FOOTPRINT_INVERSE_MAIN_HISTORY_ID"); }
  const fixed = currentFootprintInverseMainHistoryTemplate(input); return freezeDeep({ action: "footprint-inverse-main-history", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values });
}
export function currentFootprintInverseMainHistoryTemplates(): readonly ReturnType<typeof currentFootprintInverseMainHistoryTemplate>[] { return freezeDeep(currentFootprintInverseMainHistoryNativeCases().map(command => currentFootprintInverseMainHistoryTemplate(command))); }
