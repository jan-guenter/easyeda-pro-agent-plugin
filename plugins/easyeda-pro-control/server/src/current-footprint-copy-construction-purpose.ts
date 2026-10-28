/** Private identity propagation from the native-purpose dependency. Neither a
 * copied adapter nor a caller-provided field can enlarge the state-read bound. */
import { isOriginalFootprintExecutionDependency, isOriginalFootprintPreparationDependency, isOriginalFootprintSavedDependency,
  originalCurrentFootprintExecutionProjectUuid, requestCurrentFootprintCopyCacheConstruction } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";

const originals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
const executionOriginals = new WeakMap<CurrentPcbWorkerConstructionTransport, Readonly<{ dependency: CurrentPcbWorkerStartupDependency; projectUuid: string }>>();
const savedOriginals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
export function bindFootprintPreparationConstructionTransport(dependency: CurrentPcbWorkerStartupDependency,
  transport: CurrentPcbWorkerConstructionTransport): void {
  if (isOriginalFootprintPreparationDependency(dependency)) { originals.add(transport); }
  if (isOriginalFootprintExecutionDependency(dependency)) {
    if (executionOriginals.has(transport)) { throw new Error("FOOTPRINT_EXECUTION_CONSTRUCTION_ISSUED"); }
    executionOriginals.set(transport, Object.freeze({ dependency, projectUuid: originalCurrentFootprintExecutionProjectUuid(dependency) }));
  }
  if (isOriginalFootprintSavedDependency(dependency)) { savedOriginals.add(transport); }
}
export function isOriginalFootprintSavedConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean { return savedOriginals.has(transport); }
export function isOriginalFootprintExecutionConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean {
  return executionOriginals.has(transport);
}
export function originalFootprintExecutionConstructionProjectUuid(transport: CurrentPcbWorkerConstructionTransport): string {
  const held = executionOriginals.get(transport);
  if (held === undefined || originalCurrentFootprintExecutionProjectUuid(held.dependency) !== held.projectUuid) { throw new Error("FOOTPRINT_EXECUTION_CONSTRUCTION_PROJECT"); }
  return held.projectUuid;
}
export function requestFootprintExecutionConstructionCache(transport: CurrentPcbWorkerConstructionTransport,
  command: CurrentFootprintCacheConstructionCommand): Promise<unknown> {
  const held = executionOriginals.get(transport);
  if (held === undefined) { return Promise.reject(new Error("FOOTPRINT_EXECUTION_CONSTRUCTION_ORIGINAL")); }
  return requestCurrentFootprintCopyCacheConstruction(held.dependency, command);
}
export function isOriginalFootprintPreparationConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean {
  return originals.has(transport);
}
