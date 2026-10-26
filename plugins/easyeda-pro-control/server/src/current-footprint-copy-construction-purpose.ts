/** Private identity propagation from the native-purpose dependency. Neither a
 * copied adapter nor a caller-provided field can enlarge the state-read bound. */
import { isOriginalFootprintPreparationDependency } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";

const originals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
export function bindFootprintPreparationConstructionTransport(dependency: CurrentPcbWorkerStartupDependency,
  transport: CurrentPcbWorkerConstructionTransport): void {
  if (isOriginalFootprintPreparationDependency(dependency)) { originals.add(transport); }
}
export function isOriginalFootprintPreparationConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean {
  return originals.has(transport);
}
