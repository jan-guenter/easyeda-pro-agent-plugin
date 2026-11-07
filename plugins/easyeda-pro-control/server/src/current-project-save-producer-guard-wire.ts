/** Session and script execution custody remain with the original native owner. */
import { validateCurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import type { CurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentProjectSaveProducerGuardWire(input: unknown, id: number, purpose: "via" | "schematic"): Readonly<{ command: CurrentProjectSaveProducerGuardCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || purpose !== "via" && purpose !== "schematic") { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_WIRE"); }
  const command = validateCurrentProjectSaveProducerGuardCommand(input);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-producer-guard" : "schematic-display-producer-guard", requestId: id, phase: `${command.phase}-${command.role}`, method: command.method, scriptId: command.params.location.scriptId } });
}
