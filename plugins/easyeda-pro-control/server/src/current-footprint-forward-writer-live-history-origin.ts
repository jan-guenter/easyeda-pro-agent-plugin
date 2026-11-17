/** Full-only actual completed copy/history. Matching callbacks, JSON and
 * Via origins cannot create this original Main/worker data relationship. */
import type { CurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";
import type { CurrentFootprintForwardWriterLiveHistoryCacheData } from "./current-footprint-forward-writer-live-history-cache-data.ts";
import type { CurrentPcbViaProspectiveSyncData } from "./current-pcb-via-prospective-sync-data.ts";

export interface CurrentFootprintForwardWriterLiveHistoryOrigin { readonly profile: "private.current-footprint-forward-writer-live-history-origin.v1" }
export interface CurrentFootprintForwardWriterLiveHistoryInitialData {
 readonly projectUuid:string; readonly branchUuid:string; readonly documentUuid:string; readonly historyUuid:string;
 readonly initialHeadIndexBody:string; readonly historyBodySha256:string;
}
export interface CurrentFootprintForwardWriterLiveHistoryBindings {
 readonly ordinaryRequestLimit:number; readonly assertCurrent:()=>void;
 readonly historyResult:()=>Promise<Readonly<{historyUuid:string;bodySha256:string}>>;
 readonly initial:()=>CurrentFootprintForwardWriterLiveHistoryInitialData;
 readonly prospective:()=>CurrentPcbViaProspectiveSyncData;
 readonly liveData:()=>Promise<CurrentFootprintForwardWriterLiveHistoryCacheData>;
 readonly send:(command:CurrentFootprintInverseMainHistoryCommand,id:number)=>Promise<void>;
}
// oxlint-disable-next-line import/no-cycle -- The same original Main owns this registry; no module initialization constructs an origin or invokes a callback.
export { requireCurrentFootprintForwardWriterLiveHistoryOrigin } from "./current-footprint-copy-main-backend-runner.ts";
