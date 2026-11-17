/** Only the original full native owner can issue this separate clock origin.
 * Existing v2/Combined registries cannot resolve its brand or equal data. */
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "./current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyCreateInvocationLease } from "./current-footprint-copy-create-invocation-lease.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintForwardWriterProducerEvents } from "./current-footprint-forward-writer-producer-origin.ts";
import type { CurrentFootprintCopyClockRpcOriginEvent } from "./current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcV2RegistrationRetention } from "./current-footprint-copy-clock-rpc-v2-retention.ts";
import type { CurrentFootprintCopyClockRpcV2Command } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

export interface CurrentFootprintForwardWriterClockRpcOrigin { readonly profile: "private.current-footprint-forward-writer-clock-rpc-origin.v1" }
export interface CurrentFootprintForwardWriterClockChannelOrigin { readonly profile: "private.current-footprint-forward-writer-clock-channel-origin.v1" }
export interface CurrentFootprintForwardWriterClockChannelBindings {
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly invocationLease: CurrentFootprintCopyCreateInvocationLease;
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly events: CurrentFootprintForwardWriterProducerEvents;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly observeExited: () => Promise<void>;
}
export interface CurrentFootprintForwardWriterClockRpcOriginBindings {
  readonly workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly registration: CurrentFootprintCopyClockRpcV2RegistrationRetention;
  readonly workerSessionId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyClockRpcV2Command, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyClockRpcOriginEvent | null;
  readonly fail: () => void;
  readonly retire: () => Promise<void>;
}
// oxlint-disable-next-line import/no-cycle -- Resolve the original Core registry only in later owner checks; importing or matching an origin profile cannot mint custody.
export { requireCurrentFootprintForwardWriterClockChannelOrigin, requireCurrentFootprintForwardWriterClockRpcOrigin } from "./current-pcb-diagnostic-owner.ts";
