/** Original execution transport association. Receipt JSON cannot recreate a
 * route, select a session or supply a clock request/event implementation. */
import { types } from "node:util";
import { CurrentFootprintCopyTransactionClockEvents } from "./current-footprint-copy-transaction-clock-events.ts";
import type { CurrentFootprintCopyTransactionClockEventTransport } from "./current-footprint-copy-transaction-clock-events.ts";
// oxlint-disable-next-line import/no-cycle -- Keep the original channel's private identity issuer through the construction/create cycle; no initialization-time call crosses it.
import { isOriginalFootprintExecutionDependency } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "./current-pcb-worker-construction-contract.ts";

export type CurrentFootprintCopyClockRoute = Omit<CurrentFootprintCopyTransactionClockEventTransport, "managerObjectId" | "lexicalBundleObjectId">;
const routes = new WeakMap<CurrentPcbWorkerConstructionTransport, CurrentFootprintCopyClockRoute>();
const consumed = new WeakSet<CurrentPcbWorkerConstructionTransport>();
const names = ["scriptId", "workerSessionId", "assertOriginal", "assertCleanup", "assertOriginalTermination", "request", "subscribe"] as const;

/** Called only while the startup execution owner constructs its private
 * constructor adapter, after actual worker source qualification. */
export function bindCurrentFootprintCopyClockRoute(dependency: CurrentPcbWorkerStartupDependency,
  construction: CurrentPcbWorkerConstructionTransport, route: CurrentFootprintCopyClockRoute): void {
  if (!isOriginalFootprintExecutionDependency(dependency) || routes.has(construction) || types.isProxy(route) ||
    Object.getPrototypeOf(route) !== Object.prototype || !Object.isFrozen(route) || Reflect.ownKeys(route).length !== names.length ||
    names.some((name, index) => {
      const descriptor = Object.getOwnPropertyDescriptor(route, name);
      return descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== (index < 2 ? "string" : "function");
    })) { throw new Error("FOOTPRINT_COPY_CLOCK_ORIGINAL_ROUTE"); }
  routes.set(construction, route);
}

/** The execution construction runner supplies its retained manager/lexical
 * identities after reproof. Public inputs cannot obtain the original adapter. */
export function createCurrentFootprintCopyTransactionClockEvents(construction: CurrentPcbWorkerConstructionTransport,
  managerObjectId: string, lexicalBundleObjectId: string): CurrentFootprintCopyTransactionClockEvents {
  const route = routes.get(construction);
  if (route === undefined || consumed.has(construction)) { throw new Error("FOOTPRINT_COPY_CLOCK_ORIGINAL_ROUTE"); }
  consumed.add(construction);
  return new CurrentFootprintCopyTransactionClockEvents(Object.freeze({ ...route, managerObjectId, lexicalBundleObjectId }));
}

/** Reserve the same one-use role for the paired RPC collector before its
 * original runner releases groups. No caller supplies a replacement route. */
export function consumeCurrentFootprintCopyClockRpcRoute(construction: CurrentPcbWorkerConstructionTransport): void {
  if (!routes.has(construction) || consumed.has(construction)) { throw new Error("FOOTPRINT_COPY_CLOCK_ORIGINAL_ROUTE"); }
  consumed.add(construction);
}
