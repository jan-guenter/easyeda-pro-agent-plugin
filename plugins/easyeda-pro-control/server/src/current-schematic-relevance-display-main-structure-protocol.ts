/** Fixed request data only. The genuine seven-record sender separately owns
 * expected-tree enrollment, callback custody and selected SQL grants. */
import { currentPcbViaMainStructureWire } from "./current-pcb-via-main-structure-wire.ts";
import type { CurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";

export function currentSchematicRelevanceDisplayMainStructureWire(input: unknown, id: number): Readonly<{
  command: CurrentPcbViaMainStructureCommand; request: Readonly<Record<string, string | number>>;
}> {
  const fixed = currentPcbViaMainStructureWire(input, id);
  return Object.freeze({ command: fixed.command, request: Object.freeze({ ...fixed.request, action: "schematic-relevance-display-main-structure" }) });
}
