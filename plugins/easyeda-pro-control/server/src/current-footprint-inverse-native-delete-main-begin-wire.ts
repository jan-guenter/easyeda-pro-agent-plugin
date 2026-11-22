/** Finite main wire: all variable slots are original CDP handles. SQL,
 * conditions, source selectors and executable programs stay in the codebook. */
import { currentFootprintInverseNativeDeleteMainBeginNativeCases, validateCurrentFootprintInverseNativeDeleteMainBeginCommand } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginCommand } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintInverseNativeDeleteMainBeginTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
/** Replace original inspector handles only; the fixed source, readonly
 * flags and role remain sealed in the corresponding native codebook row. */
export function currentFootprintInverseNativeDeleteMainBeginTemplate(input: unknown): CurrentFootprintInverseNativeDeleteMainBeginTemplate {
  const command = validateCurrentFootprintInverseNativeDeleteMainBeginCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("INVERSE_NATIVE_DELETE_BEGIN_FIELD_ALIAS"); } fields.push(name); values[name] = value; return `__inverse_delete_begin_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-native-delete-main-begin-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if ((command.phase === "inverse-native-delete-main-begin-frame" || command.phase === "inverse-native-delete-main-begin-raw-frame")) { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if ((command.phase === "inverse-native-delete-main-begin-join" || command.phase === "inverse-native-delete-main-begin-rebase" || command.phase === "inverse-native-delete-main-begin-bookkeeping")) { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  else if (command.phase === "inverse-native-delete-main-begin-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: `${command.phase}-${command.role}`, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseNativeDeleteMainBeginWire(input: unknown, requestId: number): Readonly<{ command: CurrentFootprintInverseNativeDeleteMainBeginCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("INVERSE_NATIVE_DELETE_BEGIN_WIRE_ID"); }
  const command = validateCurrentFootprintInverseNativeDeleteMainBeginCommand(input), fixed = currentFootprintInverseNativeDeleteMainBeginTemplate(command);
  return freezeDeep({ command, request: { action: "inverse-native-delete-main-begin", phase: fixed.phase, method: fixed.method, requestId, ...fixed.values } });
}
export function currentFootprintInverseNativeDeleteMainBeginTemplates(): readonly CurrentFootprintInverseNativeDeleteMainBeginTemplate[] { return freezeDeep(currentFootprintInverseNativeDeleteMainBeginNativeCases().map(command => currentFootprintInverseNativeDeleteMainBeginTemplate(command))); }
