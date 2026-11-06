/** Fixed fields for the distinct saved reader. Both actual worker attachment
 * sessions belong to the original controller and never appear as selectors. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateCurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentPcbViaSavedLoadWorkerWire(input: unknown, id: number): Readonly<{ command: CurrentPcbViaSavedLoadBootstrapCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SAVED_READBACK_WORKER_ID"); }
  const command = validateCurrentPcbViaSavedLoadBootstrapCommand(input);
  const request: Record<string, string | number> = { action: "saved-readback-worker", requestId: id, phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method };
  if (command.phase === "saved-load-source") { request["scriptId"] = command.params.scriptId; }
  return freezeDeep({ command, request });
}
export function currentPcbViaSavedLoadWorkerFrame(input: CurrentPcbViaSavedLoadBootstrapCommand, id: number, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<CurrentPcbViaSavedLoadBootstrapCommand & { id: number; sessionId: string; savedReadbackWorker: true }> {
  const wire = currentPcbViaSavedLoadWorkerWire(input, id);
  return freezeDeep({ ...wire.command, id, sessionId: input.phase === "saved-load-run-browser" ? pair.browserSessionId : pair.pageSessionId, savedReadbackWorker: true });
}
export function currentPcbViaSavedLoadWorkerNativeFrame(chunk: Buffer, command: CurrentPcbViaSavedLoadBootstrapCommand, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<Record<string, string | number>> {
  if (chunk.length > 4096 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_WORKER_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))), value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || canonicalJson(value) !== canonicalJson(currentPcbViaSavedLoadWorkerFrame(command, value.id, pair)) || chunk.toString("utf8") !== `${JSON.stringify(currentPcbViaSavedLoadWorkerFrame(command, value.id, pair))}\0`) { throw new Error("SAVED_READBACK_WORKER_FRAME"); }
  return currentPcbViaSavedLoadWorkerWire(command, value.id).request;
}
