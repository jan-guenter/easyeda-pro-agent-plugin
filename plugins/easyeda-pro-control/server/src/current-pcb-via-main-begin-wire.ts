/** Finite main wire: all variable slots are original CDP handles. SQL,
 * conditions, source selectors and executable programs stay in the codebook. */
import { currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaMainBeginTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentPcbViaMainBeginTemplate(input: unknown): CurrentPcbViaMainBeginTemplate {
  const command = validateCurrentPcbViaMainBeginCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("PCB_VIA_BEGIN_FIELD_ALIAS"); } fields.push(name); values[name] = value; return `__via_begin_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "via-main-begin-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "via-main-begin-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "via-main-begin-join") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  else if (command.phase === "via-main-begin-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: `${command.phase}-${command.role}`, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentPcbViaMainBeginWire(input: unknown, requestId: number): Readonly<{ command: CurrentPcbViaMainBeginCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("PCB_VIA_BEGIN_WIRE_ID"); }
  const command = validateCurrentPcbViaMainBeginCommand(input), fixed = currentPcbViaMainBeginTemplate(command);
  return freezeDeep({ command, request: { action: "pcb-via-main-begin", phase: fixed.phase, method: fixed.method, requestId, ...fixed.values } });
}
export function currentPcbViaMainBeginTemplates(): readonly CurrentPcbViaMainBeginTemplate[] { return freezeDeep(currentPcbViaMainBeginNativeCases().map(command => currentPcbViaMainBeginTemplate(command))); }
