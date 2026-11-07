/** Private identity propagation from the native-purpose dependency. Neither a
 * copied adapter nor a caller-provided field can enlarge the state-read bound. */
/* oxlint-disable import/no-cycle -- Retain genuine channel identity checks through the construction/create cycle; these imports run only inside later owner operations. */
import { isOriginalFootprintExecutionDependency, isOriginalFootprintForwardExecutionDependency, isOriginalFootprintHeldSavedDependency, isOriginalFootprintPreparationDependency, isOriginalFootprintSavedDependency, isOriginalProjectStructureDependency,
  originalCurrentFootprintExecutionProjectUuid, requestCurrentFootprintCopyCacheConstruction } from "./current-pcb-worker-startup-channel.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";

const originals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
const executionOriginals = new WeakMap<CurrentPcbWorkerConstructionTransport, Readonly<{ dependency: CurrentPcbWorkerStartupDependency; projectUuid: string }>>();
const savedOriginals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
const heldSavedOriginals = new WeakSet<CurrentPcbWorkerConstructionTransport>();
const structureOriginals = new WeakMap<CurrentPcbWorkerConstructionTransport, CurrentPcbWorkerStartupDependency>();
export function bindFootprintPreparationConstructionTransport(dependency: CurrentPcbWorkerStartupDependency,
  transport: CurrentPcbWorkerConstructionTransport): void {
  if (isOriginalFootprintPreparationDependency(dependency)) { originals.add(transport); }
  if (isOriginalFootprintExecutionDependency(dependency)) {
    if (executionOriginals.has(transport)) { throw new Error("FOOTPRINT_EXECUTION_CONSTRUCTION_ISSUED"); }
    executionOriginals.set(transport, Object.freeze({ dependency, projectUuid: originalCurrentFootprintExecutionProjectUuid(dependency) }));
  }
  if (isOriginalFootprintSavedDependency(dependency)) { savedOriginals.add(transport); }
  if (isOriginalFootprintHeldSavedDependency(dependency)) { heldSavedOriginals.add(transport); }
  if (isOriginalProjectStructureDependency(dependency)) { structureOriginals.set(transport, dependency); }
}
/** Join only the native owner's exact dependency to its original constructor
 * transport. Neither equal source nor a genuine foreign lease can satisfy it. */
export function requireOriginalProjectStructureConstructionDependency(transport: CurrentPcbWorkerConstructionTransport,
  dependency: CurrentPcbWorkerStartupDependency): void {
  if (!isOriginalProjectStructureDependency(dependency) || structureOriginals.get(transport) !== dependency) {
    throw new Error("PROJECT_STRUCTURE_CONSTRUCTION_ORIGINAL_DEPENDENCY");
  }
}
/** Only the original dedicated startup binding enables the early bootstrap
 * roster. Caller transport fields and another native purpose cannot select it. */
export function isOriginalProjectStructureConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean {
  const dependency = structureOriginals.get(transport);
  return dependency !== undefined && isOriginalProjectStructureDependency(dependency);
}
/** Cold instrumentation belongs to these two exact original births only. */
export function isOriginalFootprintColdConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean {
  const held = executionOriginals.get(transport);
  return isOriginalProjectStructureConstructionTransport(transport) || held !== undefined && isOriginalFootprintForwardExecutionDependency(held.dependency);
}
export function originalFootprintForwardExecutionConstructionDependency(transport: CurrentPcbWorkerConstructionTransport): CurrentPcbWorkerStartupDependency {
  const held = executionOriginals.get(transport);
  if (held === undefined || !isOriginalFootprintForwardExecutionDependency(held.dependency)) { throw new Error("FOOTPRINT_FORWARD_EXECUTION_ORIGINAL_CONSTRUCTION"); }
  return held.dependency;
}
export function isOriginalFootprintSavedConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean { return savedOriginals.has(transport); }
/** Distinct held-saved state-read marker; old saved and writer markers are not
 * inferred from this transport's shape or its separately retained identity.
 */
export function isOriginalFootprintHeldSavedConstructionTransport(transport: CurrentPcbWorkerConstructionTransport): boolean { return heldSavedOriginals.has(transport); }
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
