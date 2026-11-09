/** Finite native selectors are only original correlated inspector handles. */
import { currentPcbViaMainLiveHistoryNativeCases, validateCurrentPcbViaMainLiveHistoryCommand } from "./current-pcb-via-main-live-history-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentPcbViaMainLiveHistoryTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentPcbViaMainLiveHistoryCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("PCB_VIA_MAIN_LIVE_ALIAS"); } fields.push(name); values[name] = value; return `__via_live_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "via-main-live-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "via-main-live-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "via-main-live-join") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, i) => ({ objectId: field(`argument${String(i)}`, argument.objectId) })); }
  else if (command.phase === "via-main-live-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "via-main-live-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentPcbViaMainLiveHistoryWire(input: unknown, requestId: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("PCB_VIA_MAIN_LIVE_ID"); }
  const fixed = currentPcbViaMainLiveHistoryTemplate(input); return freezeDeep({ action: "pcb-via-main-live-history", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values });
}
export function currentPcbViaMainLiveHistoryTemplates(): readonly ReturnType<typeof currentPcbViaMainLiveHistoryTemplate>[] { return freezeDeep(currentPcbViaMainLiveHistoryNativeCases().map(command => currentPcbViaMainLiveHistoryTemplate(command))); }
