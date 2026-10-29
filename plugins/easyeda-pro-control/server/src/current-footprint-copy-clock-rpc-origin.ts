/** The native owner alone may issue this future transport token. There is no
 * public binding factory; runner leases/source pins alone cannot obtain it. */
import type { CurrentFootprintCopyClockRpcConstructionLease, CurrentFootprintCopyClockRpcRegistrationLease } from "./current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "./current-footprint-copy-clock-rpc-protocol.ts";

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
  readonly retire: () => Promise<void>;
}
