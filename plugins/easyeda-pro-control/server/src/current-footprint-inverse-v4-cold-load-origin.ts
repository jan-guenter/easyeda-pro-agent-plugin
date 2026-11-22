/** Issued only by the separate original inverse bootstrap-held owner. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInverseStartupPlan } from "./current-footprint-inverse-startup-plan.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";
import type { CurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";

export interface CurrentFootprintInverseColdLoadOrigin{readonly profile:"private.current-footprint-inverse-cold-load-origin.v1"}
export interface CurrentFootprintInverseColdLoadBindings{
 readonly prepared:CurrentFootprintInversePreparedCheckpoint;readonly startup:CurrentFootprintInverseStartupPlan;readonly data:CurrentFootprintInverseColdLoadData;
 readonly actual:CurrentFootprintInverseBootstrapArguments;readonly cacheIntrinsics:string;readonly bytesIntrinsics:string;
 readonly originalBreakpoints:readonly Readonly<{role:CurrentPcbViaSavedLoadRole;id:string}>[];readonly assertCurrent:()=>void;
 readonly bootstrapResumeAuthorized:false;readonly completeProducerFrontierVerified:false;
}
