/** An actual original readonly manager native send. No caller labels or
 * matching reply topic can construct the private Core registry entry. */
import type{CurrentFootprintInversePublicDeleteCall}from"./current-footprint-inverse-public-delete-call.ts";
import type{CurrentFootprintInverseReferenceEntry}from"./current-footprint-inverse-reference-entry.ts";
import type{CurrentFootprintInversePublicRowPlan}from"./current-footprint-inverse-public-row-plan.ts";
import type{CurrentFootprintInverseReferenceData}from"./current-footprint-inverse-public-row-data.ts";

export type CurrentFootprintInverseReferenceQueryKind="pcb-all"|"footprint-derived"|"device-all";
export interface CurrentFootprintInverseReferenceQueryJob{readonly profile:"private.current-footprint-inverse-reference-query-job.v1"}
export interface CurrentFootprintInverseReferenceQueryJobBindings{
 readonly kind:CurrentFootprintInverseReferenceQueryKind;readonly entry:CurrentFootprintInverseReferenceEntry;readonly call:CurrentFootprintInversePublicDeleteCall;
 readonly rowPlan:CurrentFootprintInversePublicRowPlan;readonly data:CurrentFootprintInverseReferenceData;
 readonly projectUuid:string;readonly footprintUuid:string;readonly replyTopic:string;
 readonly nativeEnvelope:Readonly<{type:"IGIVE";uuid:string;topic:"/mgr/projectWorker/pcb/getAllArrData"|"/mgr/projectWorker/footprint/getKeysBySource"|"/mgr/projectWorker/device/getAllArrData";id:number;target:string;
 /** Own undefined for PCB/device requests must survive actual structured clone. */
 message:Readonly<{message:string|undefined;replyTopic:string}>}>;
 readonly nativeOrigin:string;readonly assertCurrent:()=>void;readonly assertOriginalForwarded:()=>void;
}
export{requireOriginalCurrentFootprintInverseReferenceQueryJob}from"./current-pcb-diagnostic-owner.ts";
