/** Only the original inverse Core can issue this completed GET observation.
 * It proves that one GET returned/rearmed; it grants no DELETE, clock or Save. */
import type { CurrentFootprintInversePublicGetJob } from "./current-footprint-inverse-public-get-job.ts";
import type { CurrentFootprintInversePublicRowPlan } from "./current-footprint-inverse-public-row-plan.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInverseGetWorkerCompletion{readonly profile:"private.current-footprint-inverse-get-worker-completion.v1"}
export interface CurrentFootprintInverseGetWorkerCompletionBindings{readonly job:CurrentFootprintInversePublicGetJob;readonly rowPlan:CurrentFootprintInversePublicRowPlan;readonly rowData:CurrentFootprintInversePublicRowData;readonly assertCurrent:()=>void;}
export { requireOriginalCurrentFootprintInverseGetWorkerCompletion } from "./current-pcb-diagnostic-owner.ts";
