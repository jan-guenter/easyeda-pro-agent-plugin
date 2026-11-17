/** Fixed history CDP requests. Variable fields carry original inspector
 * handles only; SQL, body, keys, conditions and programs are never inputs. */
import { currentFootprintInverseNativeDeleteMainHistoryNativeCases, validateCurrentFootprintInverseNativeDeleteMainHistoryCommand } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainHistoryCommand } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintInverseNativeDeleteMainHistoryTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Replace original inspector handles only; the fixed source, readonly
 * flags and role remain sealed in the corresponding native codebook row. */
export function currentFootprintInverseNativeDeleteMainHistoryTemplate(input: unknown): CurrentFootprintInverseNativeDeleteMainHistoryTemplate {
  const command = validateCurrentFootprintInverseNativeDeleteMainHistoryCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("INVERSE_NATIVE_DELETE_HISTORY_FIELD_ALIAS"); } fields.push(name); values[name] = value; return `__inverse_delete_history_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-native-delete-main-history-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if ((command.phase === "inverse-native-delete-main-history-frame" || command.phase === "inverse-native-delete-main-history-raw-frame")) { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if ((command.phase === "inverse-native-delete-main-history-join" || command.phase === "inverse-native-delete-main-history-rebase" || command.phase === "inverse-native-delete-main-history-bookkeeping")) { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  else if (command.phase === "inverse-native-delete-main-history-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase !== "inverse-native-delete-main-history-step") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseNativeDeleteMainHistoryWire(input: unknown, requestId: number): Readonly<{ command: CurrentFootprintInverseNativeDeleteMainHistoryCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("INVERSE_NATIVE_DELETE_HISTORY_WIRE_ID"); }
  const command = validateCurrentFootprintInverseNativeDeleteMainHistoryCommand(input), fixed = currentFootprintInverseNativeDeleteMainHistoryTemplate(command);
  return freezeDeep({ command, request: { action: "inverse-native-delete-main-history", phase: fixed.phase, method: fixed.method, requestId, ...fixed.values } });
}
export function currentFootprintInverseNativeDeleteMainHistoryTemplates(): readonly CurrentFootprintInverseNativeDeleteMainHistoryTemplate[] { return freezeDeep(currentFootprintInverseNativeDeleteMainHistoryNativeCases().map(command => currentFootprintInverseNativeDeleteMainHistoryTemplate(command))); }
