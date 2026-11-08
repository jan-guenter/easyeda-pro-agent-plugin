/** Actual original UI GET result while M8 remains held before deletion.
 * Data alone cannot construct this token or authorize a continuation. */
import type { CurrentFootprintInversePublicGetJob } from "./current-footprint-inverse-public-get-job.ts";
import type { CurrentFootprintInverseGetWorkerCompletion } from "./current-footprint-inverse-get-completion.ts";
import type { CurrentFootprintInversePublicRowPlan } from "./current-footprint-inverse-public-row-plan.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInversePublicGetResult {readonly profile:"private.current-footprint-inverse-public-get-result.v1"}
export interface CurrentFootprintInversePublicGetResultBindings{
 readonly job:CurrentFootprintInversePublicGetJob;readonly workerCompletion:CurrentFootprintInverseGetWorkerCompletion;
 readonly rowPlan:CurrentFootprintInversePublicRowPlan;readonly rowData:CurrentFootprintInversePublicRowData;
 readonly assertCurrent:()=>void;readonly assertHeldBeforeDelete:()=>void;
}
export {requireOriginalCurrentFootprintInversePublicGetResult} from "./current-pcb-diagnostic-owner.ts";
