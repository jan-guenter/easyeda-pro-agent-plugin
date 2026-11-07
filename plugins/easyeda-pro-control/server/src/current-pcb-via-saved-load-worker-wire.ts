/** Fixed fields for the distinct saved reader. Both actual worker attachment
 * sessions belong to the original controller and never appear as selectors. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcbViaSavedLoadBootstrapCases, validateCurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import { currentPcbViaSavedLoadObservationCases, validateCurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcbViaSavedLoadWorkerCommand = CurrentPcbViaSavedLoadBootstrapCommand | CurrentPcbViaSavedLoadObservationCommand;
export function validateCurrentPcbViaSavedLoadWorkerCommand(input: unknown): CurrentPcbViaSavedLoadWorkerCommand {
  try { return validateCurrentPcbViaSavedLoadBootstrapCommand(input); } catch { return validateCurrentPcbViaSavedLoadObservationCommand(input); }
}
export function currentPcbViaSavedLoadWorkerCases(): readonly CurrentPcbViaSavedLoadWorkerCommand[] { return freezeDeep([...currentPcbViaSavedLoadBootstrapCases(), ...currentPcbViaSavedLoadObservationCases()]); }
export function currentPcbViaSavedLoadWorkerWire(input: unknown, id: number): Readonly<{ command: CurrentPcbViaSavedLoadWorkerCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SAVED_READBACK_WORKER_ID"); }
  const command = validateCurrentPcbViaSavedLoadWorkerCommand(input);
  const request: Record<string, string | number> = { action: "saved-readback-worker", requestId: id, phase: `${command.phase}${"role" in command ? `-${command.role}` : ""}${"index" in command ? `-${String(command.index)}` : ""}`, method: command.method };
  if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn" && "objectId" in command.params) {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) { request[`argument${String(index)}`] = argument.objectId; }
  }
  return freezeDeep({ command, request });
}
export function currentPcbViaSavedLoadWorkerFrame(input: CurrentPcbViaSavedLoadWorkerCommand, id: number, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<CurrentPcbViaSavedLoadWorkerCommand & { id: number; sessionId: string; savedReadbackWorker: true }> {
  const wire = currentPcbViaSavedLoadWorkerWire(input, id);
  return freezeDeep({ ...wire.command, id, sessionId: input.phase === "saved-load-run-browser" ? pair.browserSessionId : pair.pageSessionId, savedReadbackWorker: true });
}
export function currentPcbViaSavedLoadWorkerNativeFrame(chunk: Buffer, command: CurrentPcbViaSavedLoadWorkerCommand, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_WORKER_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))), value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || canonicalJson(value) !== canonicalJson(currentPcbViaSavedLoadWorkerFrame(command, value.id, pair)) || chunk.toString("utf8") !== `${JSON.stringify(currentPcbViaSavedLoadWorkerFrame(command, value.id, pair))}\0`) { throw new Error("SAVED_READBACK_WORKER_FRAME"); }
  return currentPcbViaSavedLoadWorkerWire(command, value.id).request;
}
