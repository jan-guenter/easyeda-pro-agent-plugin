/** Fixed transport calls. Native custody supplies the original worker context;
 * neither it nor a session, program or source location occurs on the wire. */
import { currentProjectStructureTransportNativeCases, validateCurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import type { CurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentProjectStructureTransportPurpose = "via" | "schematic";
export interface CurrentProjectStructureTransportTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
const marker = (name: string): string => `__project_structure_transport_${name}__`;
export function currentProjectStructureTransportTemplate(input: unknown): CurrentProjectStructureTransportTemplate {
  const command = validateCurrentProjectStructureTransportCommand(input), values: Record<string, string> = {};
  const field = (key: string, value: string): string => { if (Object.hasOwn(values, key)) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_FIELD_ALIAS"); } values[key] = value; return marker(key); };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if ("role" in command) { phase += `-${command.role}`; }
  if (command.phase === "project-structure-transport-capture") { params["uniqueContextId"] = marker("boundContext"); }
  else if (command.phase === "project-structure-transport-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "project-structure-transport-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "project-structure-transport-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.method === "Runtime.callFunctionOn" && "objectId" in command.params) {
    params["objectId"] = field("objectId", command.params.objectId);
    params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) }));
  }
  return freezeDeep({ phase, method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentProjectStructureTransportWire(input: unknown, id: number, purpose: CurrentProjectStructureTransportPurpose): Readonly<{ command: CurrentProjectStructureTransportCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || purpose !== "via" && purpose !== "schematic") { throw new Error("PROJECT_STRUCTURE_TRANSPORT_WIRE"); }
  const command = validateCurrentProjectStructureTransportCommand(input), row = currentProjectStructureTransportTemplate(command);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-structure-transport" : "schematic-display-structure-transport", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentProjectStructureTransportTemplates(): readonly CurrentProjectStructureTransportTemplate[] { return freezeDeep(currentProjectStructureTransportNativeCases().map(command => currentProjectStructureTransportTemplate(command))); }
