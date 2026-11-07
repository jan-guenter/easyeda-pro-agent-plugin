/** One original held-F2 to held-worker-GET advance. It proves no GET result,
 * queue rearm, deletion, clock or persistence. Only Core can issue it. */
import type { CurrentFootprintInversePublicLookupEntry } from "./current-footprint-inverse-public-lookup-entry.ts";
import type { CurrentFootprintInversePublicRowPlan } from "./current-footprint-inverse-public-row-plan.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInverseGetWorkerReadiness{readonly profile:"private.current-footprint-inverse-get-worker-readiness.v1"}
export interface CurrentFootprintInverseGetWorkerReadinessBindings{
 readonly lookupEntry:CurrentFootprintInversePublicLookupEntry;
 readonly rowPlan:CurrentFootprintInversePublicRowPlan;
 readonly rowData:CurrentFootprintInversePublicRowData;
 readonly call:CurrentFootprintInversePublicDeleteCall;
 readonly assertCurrent:()=>void;
 /** Live original F2 hold and unspent readiness, before its fixed resume. */
 readonly assertOriginalReady:()=>void;
}
export {requireOriginalCurrentFootprintInverseGetWorkerReadiness,consumeOriginalCurrentFootprintInverseGetWorkerReadiness}from"./current-pcb-diagnostic-owner.ts";
