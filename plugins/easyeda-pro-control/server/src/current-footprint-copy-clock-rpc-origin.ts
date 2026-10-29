/** Only the genuine combined native owner can issue this transport token after
 * its one-way paired handoff. Runner leases/source pins alone cannot obtain it. */
import type { CurrentFootprintCopyClockRpcConstructionLease, CurrentFootprintCopyClockRpcRegistrationLease } from "./current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "./current-footprint-copy-clock-rpc-protocol.ts";

// oxlint-disable-next-line import/no-cycle -- Preserve the genuine owner issuer; late-plan checks call it only after both runners exist, never during module initialization.
export { requireCurrentFootprintCopyClockRpcOrigin } from "./current-pcb-diagnostic-owner.ts";
export type { CurrentFootprintCopyClockRpcOrigin } from "./current-pcb-diagnostic-owner.ts";
export interface CurrentFootprintCopyClockRpcOriginEvent {
  readonly method: "Debugger.paused" | "Debugger.resumed";
  readonly sessionId: string;
  readonly params: unknown;
}
export interface CurrentFootprintCopyClockRpcOriginBindings {
  readonly workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly registrationLease: CurrentFootprintCopyClockRpcRegistrationLease;
  readonly workerSessionId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyClockRpcOriginEvent | null;
  /** Sticky semantic refusal only. It grants no cleanup or execution role. */
  readonly fail: () => void;
  readonly retire: () => Promise<void>;
}
