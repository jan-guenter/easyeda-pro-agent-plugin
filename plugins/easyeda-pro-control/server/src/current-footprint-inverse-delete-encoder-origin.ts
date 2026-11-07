/** Issued only by the actual inverse ready owner after its original callee
 * packet; equal remote handles or copied metadata cannot create this origin. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseDeleteEncoderCommand } from "./current-footprint-inverse-delete-encoder-protocol.ts";

export interface CurrentFootprintInverseDeleteEncoderOrigin{readonly profile:"private.current-footprint-inverse-delete-encoder-origin.v1"}
export interface CurrentFootprintInverseDeleteEncoderBindings{
 readonly prepared:CurrentFootprintForwardSavedCheckpoint;readonly scriptId:string;readonly source:string;readonly original:string;readonly ke:string;
 readonly request:(command:CurrentFootprintInverseDeleteEncoderCommand)=>Promise<unknown>;readonly assertOriginalHelperReceipt:(command:CurrentFootprintInverseDeleteEncoderCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>void;readonly assertOriginalReadyHeld:()=>void;readonly assertOriginalIdle:()=>void;readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
