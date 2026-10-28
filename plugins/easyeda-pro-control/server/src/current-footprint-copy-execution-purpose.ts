/** Issued marker for fixed construction/parent adapters. The actual request
 * authority remains the execution channel's private dependency-to-owner map. */
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";

const issued = new WeakSet<CurrentPcbWorkerStartupDependency>();
export function markCurrentFootprintExecutionDependency(dependency: CurrentPcbWorkerStartupDependency): void {
  if (issued.has(dependency)) { throw new Error("FOOTPRINT_EXECUTION_DEPENDENCY_ISSUED"); }
  issued.add(dependency);
}
export function isOriginalFootprintExecutionDependency(dependency: CurrentPcbWorkerStartupDependency): boolean { return issued.has(dependency); }
