/** Only the original cold construction issues this in-memory lease. */
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";

// oxlint-disable-next-line import/no-cycle -- Only the original constructor owns the issuance registry; an injectable registration hook would accept synthetic native leases. No initializer invokes the observer.
export { requireCurrentFootprintDetachedCacheLease } from "./current-pcb-worker-construction-runner.ts";
export interface CurrentFootprintDetachedCacheLease { readonly profile: "private.current-footprint-detached-cache-lease.v1" }
export interface CurrentFootprintDetachedCacheEvents {
  readonly paused: (input: unknown) => void; readonly resumed: () => void; readonly lost: () => void;
}
export interface CurrentFootprintDetachedCacheBinding {
  readonly issuer: object; readonly scriptId: string; readonly project: string;
  readonly assertOriginal: () => Promise<void>; readonly assertCleanup: () => void; readonly fail: () => void;
  readonly request: (command: CurrentPcbWorkerConstructionCommand, cleanup: boolean, retain?: (reply: unknown) => void) => Promise<unknown>;
  readonly subscribe: (events: CurrentFootprintDetachedCacheEvents) => () => void;
}
