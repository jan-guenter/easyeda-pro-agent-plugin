/** Original structure grammar composes the fixed observer suffix with the
 * unchanged startup prefix. Cold observers import only the fixed suffix. */
import { currentProjectStructureWorkerFixedWire } from "./current-project-structure-worker-fixed-wire.ts";
import { currentPcb209WorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentProjectStructureWorkerWire(input: unknown, id: number): ReturnType<typeof currentPcb209WorkerStartupWire> {
  const fixed = currentProjectStructureWorkerFixedWire(input, id);
  if (fixed !== null) { return fixed; }
  const original = currentPcb209WorkerStartupWire(input, 1);
  return freezeDeep({ command: { ...original.command, id }, request: { ...original.request, requestId: id } });
}
