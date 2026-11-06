/** One finite worker stream, sealed by the actual original schematic owner. Session
 * selection belongs to native custody and is absent from this field grammar. */
import { currentSchematicDisplaySaveNativeCases, validateCurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import type { CurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import { currentSchematicDisplayWorkerBootstrapNativeCases, validateCurrentSchematicDisplayWorkerBootstrapCommand } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import type { CurrentSchematicDisplayWorkerBootstrapCommand } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentSchematicDisplayWorkerCommand = CurrentSchematicDisplaySaveCommand | CurrentSchematicDisplayWorkerBootstrapCommand;
export function validateCurrentSchematicDisplayWorkerCommand(input: unknown): CurrentSchematicDisplayWorkerCommand {
  try { return validateCurrentSchematicDisplaySaveCommand(input); }
  catch { return validateCurrentSchematicDisplayWorkerBootstrapCommand(input); }
}
export function currentSchematicDisplayWorkerWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicDisplayWorkerCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_DISPLAY_WORKER_REQUEST_ID"); }
  const command = validateCurrentSchematicDisplayWorkerCommand(input);
  const request: Record<string, string | number> = { action: "schematic-display-worker", requestId: id, phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method };
  if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else { request[index === 0 ? "pageUuid" : "projectUuid"] = argument.value; }
    }
  }
  return freezeDeep({ command, request });
}
export function currentSchematicDisplayWorkerNativeCases(): readonly CurrentSchematicDisplayWorkerCommand[] {
  return freezeDeep([...currentSchematicDisplayWorkerBootstrapNativeCases(), ...currentSchematicDisplaySaveNativeCases()]);
}
