/** One finite worker stream, sealed by the actual original Via owner. Session
 * selection belongs to native custody and is absent from this field grammar. */
import { currentPcbViaSaveNativeCases, validateCurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import type { CurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import { currentPcbViaWorkerBootstrapNativeCases, validateCurrentPcbViaWorkerBootstrapCommand } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import type { CurrentPcbViaWorkerBootstrapCommand } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { currentProjectSaveStructureNativeCases, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcbViaWorkerCommand = CurrentPcbViaSaveCommand | CurrentPcbViaWorkerBootstrapCommand | CurrentProjectSaveStructureCommand;
export function validateCurrentPcbViaWorkerCommand(input: unknown): CurrentPcbViaWorkerCommand {
  try { return validateCurrentPcbViaSaveCommand(input); }
  catch { try { return validateCurrentPcbViaWorkerBootstrapCommand(input); } catch { return validateCurrentProjectSaveStructureCommand(input); } }
}
export function currentPcbViaWorkerWire(input: unknown, id: number): Readonly<{ command: CurrentPcbViaWorkerCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("PCB_VIA_WORKER_REQUEST_ID"); }
  const command = validateCurrentPcbViaWorkerCommand(input);
  const request: Record<string, string | number> = { action: "pcb-via-worker", requestId: id, phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method };
  if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else { request[index === 0 ? "documentUuid" : "projectUuid"] = argument.value; }
    }
  }
  return freezeDeep({ command, request });
}
export function currentPcbViaWorkerNativeCases(): readonly CurrentPcbViaWorkerCommand[] {
  return freezeDeep([...currentPcbViaWorkerBootstrapNativeCases(), ...currentPcbViaSaveNativeCases(), ...currentProjectSaveStructureNativeCases()]);
}

export type { CurrentPcbViaWorkerBootstrapCommand } from "./current-pcb-via-worker-bootstrap-protocol.ts";
