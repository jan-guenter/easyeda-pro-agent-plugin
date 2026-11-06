/** Original birth supplies the session. Only fixed role programs and source
 * locations survive this encoder; it has no continuation vocabulary. */
import { currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentProjectSaveProducerTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
const marker = (key: string): string => `__project_save_producer_${key}__`;
export function currentProjectSaveProducerTemplate(input: unknown): CurrentProjectSaveProducerTemplate {
  const command = validateCurrentProjectSaveProducerCommand(input), values: Record<string, string> = {};
  const field = (key: string, value: string): string => { if (Object.hasOwn(values, key)) { throw new Error("PROJECT_SAVE_PRODUCER_FIELD_ALIAS"); } values[key] = value; return marker(key); };
  const params: Record<string, unknown> = { ...command.params }; const phase = "role" in command ? `${command.phase}-${command.role}` : command.phase;
  if (command.phase === "project-save-producer-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "project-save-producer-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "project-save-producer-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((value, index) => ({ objectId: field(`argument${String(index)}`, value.objectId) })); }
  return freezeDeep({ phase, method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentProjectSaveProducerWire(input: unknown, id: number, purpose: "via" | "schematic"): Readonly<{ command: CurrentProjectSaveProducerCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || purpose !== "via" && purpose !== "schematic") { throw new Error("PROJECT_SAVE_PRODUCER_WIRE"); }
  const command = validateCurrentProjectSaveProducerCommand(input), row = currentProjectSaveProducerTemplate(command);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-producer-observe" : "schematic-display-producer-observe", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentProjectSaveProducerTemplates(): readonly CurrentProjectSaveProducerTemplate[] { return freezeDeep(currentProjectSaveProducerNativeCases().map(command => currentProjectSaveProducerTemplate(command))); }
