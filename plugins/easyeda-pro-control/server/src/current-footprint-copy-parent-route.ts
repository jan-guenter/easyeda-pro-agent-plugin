/** Native-context issuer for the fixed parent construction diagnostic. The
 * original runtime source read still precedes every breakpoint allocation. */
import { types } from "node:util";
import { isOriginalFootprintExecutionDependency } from "./current-footprint-copy-execution-purpose.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";

export interface CurrentFootprintCopyParentRoute {
  readonly parentSessionId: string;
  readonly parentUniqueContextId: string;
  readonly managerScriptId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertOriginalSynchronous: () => void;
}
const routes = new WeakMap<CurrentPcbWorkerStartupDependency, CurrentFootprintCopyParentRoute>();
const members = ["parentSessionId", "parentUniqueContextId", "managerScriptId", "assertOriginal", "assertOriginalSynchronous"] as const;
export function bindCurrentFootprintCopyParentRoute(dependency: CurrentPcbWorkerStartupDependency, route: CurrentFootprintCopyParentRoute): void {
  if (!isOriginalFootprintExecutionDependency(dependency) || routes.has(dependency) || types.isProxy(route) ||
      Object.getPrototypeOf(route) !== Object.prototype || !Object.isFrozen(route) || Reflect.ownKeys(route).length !== members.length ||
      members.some((name, index) => {
        const item = Object.getOwnPropertyDescriptor(route, name);
        return item === undefined || !Object.hasOwn(item, "value") || typeof item.value !== (index < 3 ? "string" : "function");
      }) || route.parentSessionId !== dependency.parentSessionId) { throw new Error("FOOTPRINT_PARENT_ORIGINAL_ROUTE"); }
  route.assertOriginalSynchronous(); routes.set(dependency, route);
}
export function requireCurrentFootprintCopyParentRoute(dependency: CurrentPcbWorkerStartupDependency): CurrentFootprintCopyParentRoute {
  const route = routes.get(dependency);
  if (route === undefined || !isOriginalFootprintExecutionDependency(dependency)) { throw new Error("FOOTPRINT_PARENT_ORIGINAL_ROUTE"); }
  route.assertOriginalSynchronous(); return route;
}
