/** Fixed codebook projection. The controller's expected value is supplied
 * only from the native owner's original enrolled body; wire fields are handles. */
import { currentPcbViaMainStructureNativeCases, validateCurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import type { CurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_MAIN_STRUCTURE_EXPECTED_MARKER = "__via_structure_original_expected__";
export interface CurrentPcbViaMainStructureTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Replace original inspector handles only; the fixed source, readonly
 * flags and role remain sealed in the corresponding native codebook row. */
export function currentPcbViaMainStructureTemplate(input: unknown): CurrentPcbViaMainStructureTemplate {
  const command = validateCurrentPcbViaMainStructureCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("PCB_VIA_STRUCTURE_FIELD_ALIAS"); } fields.push(name); values[name] = value; return `__via_structure_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "via-main-structure-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if ((command.phase === "via-main-structure-frame" || command.phase === "via-main-structure-raw-frame")) { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if ((command.phase === "via-main-structure-join" || command.phase === "via-main-structure-rebase" || command.phase === "via-main-structure-bookkeeping")) { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, index) => "objectId" in argument ? { objectId: field(`argument${String(index)}`, argument.objectId) } : { value: CURRENT_PCB_VIA_MAIN_STRUCTURE_EXPECTED_MARKER }); }
  else if (command.phase === "via-main-structure-properties" || command.phase === "via-main-structure-final-arm") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "via-main-structure-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentPcbViaMainStructureWire(input: unknown, requestId: number): Readonly<{ command: CurrentPcbViaMainStructureCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("PCB_VIA_STRUCTURE_WIRE_ID"); } const command = validateCurrentPcbViaMainStructureCommand(input), fixed = currentPcbViaMainStructureTemplate(command);
  return freezeDeep({ command, request: { action: "pcb-via-main-structure", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
export function currentPcbViaMainStructureTemplates(): readonly CurrentPcbViaMainStructureTemplate[] { return freezeDeep(currentPcbViaMainStructureNativeCases().map(command => currentPcbViaMainStructureTemplate(command))); }
