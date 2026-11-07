/** Fixed sync template fields carry only original owner handles and private
 * pre-open data. Native custody supplies the original worker session. */
import { currentGeneratedPeriodicSyncNativeCases, validateCurrentGeneratedPeriodicSyncCommand } from "./current-generated-periodic-sync-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const marker = (name: string): string => `__periodic_sync_${name}__`;
export function currentGeneratedPeriodicSyncTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentGeneratedPeriodicSyncCommand(input), values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (Object.hasOwn(values, name)) { throw new Error("PERIODIC_SYNC_FIELD_ALIAS"); } values[name] = value; return marker(name); };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId", command.params.objectId); }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument, index) => "objectId" in argument ? { objectId: field(`argument${String(index)}`, argument.objectId) } : { value: typeof argument.value === "string" ? field("body", argument.value) : argument.value }); }
  let suffix: string | null = null;
  if ("slot" in command) { suffix = String(command.slot); } else if ("ordinal" in command) { suffix = String(command.ordinal); } else if ("role" in command) { suffix = command.role; }
  return freezeDeep({ phase: command.phase + (suffix === null ? "" : `-${suffix}`), method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentGeneratedPeriodicSyncWire(input: unknown, id: number, purpose: "via" | "schematic"): Readonly<{ command: ReturnType<typeof validateCurrentGeneratedPeriodicSyncCommand>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || purpose !== "via" && purpose !== "schematic") { throw new Error("PERIODIC_SYNC_ID"); }
  const command = validateCurrentGeneratedPeriodicSyncCommand(input), row = currentGeneratedPeriodicSyncTemplate(command);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-periodic-sync" : "schematic-display-periodic-sync", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentGeneratedPeriodicSyncTemplates(): readonly ReturnType<typeof currentGeneratedPeriodicSyncTemplate>[] { return freezeDeep(currentGeneratedPeriodicSyncNativeCases().map(value => currentGeneratedPeriodicSyncTemplate(value))); }
