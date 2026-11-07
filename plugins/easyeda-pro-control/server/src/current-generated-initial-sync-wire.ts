/** Fixed sync template fields carry only original owner handles and private
 * pre-open data. Native custody supplies the original worker session. */
import { currentGeneratedInitialSyncNativeCases, validateCurrentGeneratedInitialSyncCommand } from "./current-generated-initial-sync-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const marker = (name: string): string => `__initial_sync_${name}__`;
export function currentGeneratedInitialSyncTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentGeneratedInitialSyncCommand(input), values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (Object.hasOwn(values, name)) { throw new Error("INITIAL_SYNC_FIELD_ALIAS"); } values[name] = value; return marker(name); };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId", command.params.objectId); }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument, index) => "objectId" in argument ? { objectId: field(`argument${String(index)}`, argument.objectId) } : { value: typeof argument.value === "string" ? field(index === 4 ? "key" : "body", argument.value) : argument.value }); }
  let suffix: string | null = null;
  if ("slot" in command) { suffix = String(command.slot); } else if ("ordinal" in command) { suffix = String(command.ordinal); } else if ("role" in command) { suffix = command.role; }
  return freezeDeep({ phase: command.phase + (suffix === null ? "" : `-${suffix}`), method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentGeneratedInitialSyncWire(input: unknown, id: number, purpose: "via" | "schematic"): Readonly<{ command: ReturnType<typeof validateCurrentGeneratedInitialSyncCommand>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || purpose !== "via" && purpose !== "schematic") { throw new Error("INITIAL_SYNC_ID"); }
  const command = validateCurrentGeneratedInitialSyncCommand(input), row = currentGeneratedInitialSyncTemplate(command);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-initial-sync" : "schematic-display-initial-sync", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentGeneratedInitialSyncTemplates(): readonly ReturnType<typeof currentGeneratedInitialSyncTemplate>[] { return freezeDeep(currentGeneratedInitialSyncNativeCases().map(value => currentGeneratedInitialSyncTemplate(value))); }
