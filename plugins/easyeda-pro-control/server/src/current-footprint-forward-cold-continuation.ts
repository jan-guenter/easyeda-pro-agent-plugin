/** Opaque original-runner and original-channel tokens. No result JSON or
 * supplied function table can restore either side of this one-way handoff. */
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "./current-footprint-copy-clock-rpc-leases.ts";

export { requireCurrentFootprintForwardColdContinuationLease } from "./current-pcb-worker-construction-runner.ts";
export { requireCurrentFootprintForwardColdTail } from "./current-pcb-worker-startup-channel.ts";
export interface CurrentFootprintForwardColdContinuationLease { readonly profile: "private.current-footprint-forward-cold-continuation.v1" }
export interface CurrentFootprintForwardColdTail { readonly profile: "private.current-footprint-forward-cold-tail.v1" }
export interface CurrentFootprintForwardColdContinuationBinding {
  readonly issuer: object;
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly assertCleanup: () => void;
  readonly suspend: () => void;
  readonly remainingRequests: () => Readonly<{ normal: number; cleanup: number; total: number }>;
  readonly acceptsPause: (input: unknown) => boolean;
  readonly paused: (input: unknown) => void;
  readonly resumed: () => void;
  readonly lost: () => void;
  readonly attach: (tail: CurrentFootprintForwardColdTail) => void;
  readonly observeExited: () => Promise<void>;
}
export interface CurrentFootprintForwardColdTailBinding {
  readonly continuation: CurrentFootprintForwardColdContinuationLease;
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly workerLease: CurrentFootprintCopyClockRpcConstructionLease;
  readonly workerSessionId: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly request: (command: CurrentPcbWorkerConstructionCommand, cleanup: boolean, retain?: (reply: unknown) => void) => Promise<unknown>;
}
