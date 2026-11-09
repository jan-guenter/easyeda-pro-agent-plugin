/** Fixed history CDP requests. Variable fields carry original inspector
 * handles only; SQL, body, keys, conditions and programs are never inputs. */
import { currentPcbViaMainHistoryNativeCases, validateCurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaMainHistoryTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Replace original inspector handles only; the fixed source, readonly
 * flags and role remain sealed in the corresponding native codebook row. */
export function currentPcbViaMainHistoryTemplate(input: unknown): CurrentPcbViaMainHistoryTemplate {
  const command = validateCurrentPcbViaMainHistoryCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("PCB_VIA_HISTORY_FIELD_ALIAS"); } fields.push(name); values[name] = value; return `__via_history_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "via-main-history-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if ((command.phase === "via-main-history-frame" || command.phase === "via-main-history-raw-frame")) { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if ((command.phase === "via-main-history-join" || command.phase === "via-main-history-rebase" || command.phase === "via-main-history-bookkeeping")) { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  else if (command.phase === "via-main-history-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase !== "via-main-history-step") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentPcbViaMainHistoryWire(input: unknown, requestId: number): Readonly<{ command: CurrentPcbViaMainHistoryCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("PCB_VIA_HISTORY_WIRE_ID"); }
  const command = validateCurrentPcbViaMainHistoryCommand(input), fixed = currentPcbViaMainHistoryTemplate(command);
  return freezeDeep({ command, request: { action: "pcb-via-main-history", phase: fixed.phase, method: fixed.method, requestId, ...fixed.values } });
}
export function currentPcbViaMainHistoryTemplates(): readonly CurrentPcbViaMainHistoryTemplate[] { return freezeDeep(currentPcbViaMainHistoryNativeCases().map(command => currentPcbViaMainHistoryTemplate(command))); }
