/** Opaque original construction custody. Equal JSON/remote IDs cannot issue it.
 * Native dispatch, intent and whole-writer admission remain separate duties. */
import type { CurrentFootprintCopyClockRpcConstructionLease } from "./current-footprint-copy-clock-rpc-leases.ts";

export interface CurrentFootprintCopyCreateInvocationLease { readonly profile: "private.current-footprint-copy-create-invocation-lease.v1" }
export interface CurrentFootprintCopyCreateInvocationBinding {
  readonly issuer: object;
  readonly clockLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly projectObjectId: string;
  readonly handles: readonly [string, string, string, string, string];
  readonly prewriteHandles: readonly [string, string, string];
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly consumeBeforeInvocation: () => void;
  /** A matching competing call cannot satisfy the original consumed dispatch. */
  readonly requireInvocationConsumed: () => void;
}
export { requireCurrentFootprintCopyCreateInvocationLease } from "./current-pcb-worker-construction-runner.ts";
