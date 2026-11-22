/** Issued only by the genuine inverse's original public SDK/source holder. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInversePublicServiceCommand } from "./current-footprint-inverse-public-service-protocol.ts";

export interface CurrentFootprintInversePublicServiceOrigin { readonly profile: "private.current-footprint-inverse-public-service-origin.v1" }
export interface CurrentFootprintInversePublicServiceBindings {
 readonly prepared:CurrentFootprintInversePreparedCheckpoint;readonly initial:string;readonly callees:string;readonly apiScriptId:string;
 readonly request:(command:CurrentFootprintInversePublicServiceCommand)=>Promise<unknown>;
 readonly assertOriginalHelperReceipt:(command:CurrentFootprintInversePublicServiceCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>void;readonly assertOriginalIdle:()=>void;readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
