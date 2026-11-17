/** An original full Main branch read, never a caller row or callback table. */
import type { CurrentFootprintForwardWriterBranchCommand } from "./current-footprint-forward-writer-branch-protocol.ts";

export interface CurrentFootprintForwardWriterBranchOrigin { readonly profile: "private.current-footprint-forward-writer-branch-origin.v1" }
export interface CurrentFootprintForwardWriterBranchBindings {
 readonly projectUuid: string; readonly branchUuid: string; readonly ordinaryRequestLimit: number;
 readonly assertCurrent: () => void;
 readonly send: (command: CurrentFootprintForwardWriterBranchCommand,id: number) => Promise<void>;
}
// oxlint-disable-next-line import/no-cycle -- The Main runner owns the original registry; module initialization creates no origin or native call.
export { requireCurrentFootprintForwardWriterBranchOrigin, requireOriginalCurrentFootprintForwardWriterBranchData } from "./current-footprint-copy-main-backend-runner.ts";
