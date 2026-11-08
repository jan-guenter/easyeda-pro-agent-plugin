/** Only the original new reader substitutes this finite source/loading cursor.
 * Reused command syntax carries no Via owner, origin or checkpoint. */
import { currentPcbViaSavedLoadWorkerFrame, currentPcbViaSavedLoadWorkerWire } from "./current-pcb-via-saved-load-worker-wire.ts";
import type { CurrentPcbViaSavedLoadWorkerCommand } from "./current-pcb-via-saved-load-worker-wire.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceSavedColdWire(command: CurrentPcbViaSavedLoadWorkerCommand, id: number, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<CurrentPcbViaSavedLoadWorkerCommand & { id: number; sessionId: string; schematicSavedCold: true }> {
  if (id > PROFILE.renderer.activeCold) { throw new Error("SCHEMATIC_SAVED_COLD_BUDGET"); }
  const { savedReadbackWorker: _marker, ...wire } = currentPcbViaSavedLoadWorkerFrame(command, id, pair); return freezeDeep({ ...wire, schematicSavedCold: true });
}
export function currentSchematicRelevanceSavedColdNativeFrame(chunk: Buffer, command: CurrentPcbViaSavedLoadWorkerCommand, pair: CurrentPcbViaSavedLoadWorkerPair): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_SAVED_COLD_FRAME"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(currentSchematicRelevanceSavedColdWire(command, value.id, pair))}\0`) { throw new Error("SCHEMATIC_SAVED_COLD_FRAME"); }
  return Object.freeze({ ...currentPcbViaSavedLoadWorkerWire(command, value.id).request, action: "schematic-saved-cold-worker" });
}
