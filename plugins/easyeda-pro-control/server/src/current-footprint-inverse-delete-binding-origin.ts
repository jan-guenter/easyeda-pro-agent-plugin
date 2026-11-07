/** Only the original inverse ready/Core adapter may populate this origin. No
 * caller callback, frame ID or equal checkpoint can replace that issuance. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseDeleteBindingCommand, CurrentFootprintInverseDeleteBindingExpected } from "./current-footprint-inverse-delete-binding-protocol.ts";

export interface CurrentFootprintInverseDeleteBindingOrigin{readonly profile:"private.current-footprint-inverse-delete-binding-origin.v1"}
export interface CurrentFootprintInverseDeleteBindingBindings{
 readonly prepared:CurrentFootprintForwardSavedCheckpoint;readonly sessionId:string;readonly scriptId:string;readonly source:string;readonly project:string;readonly readyFrameId:string;readonly expected:CurrentFootprintInverseDeleteBindingExpected;
 readonly request:(command:CurrentFootprintInverseDeleteBindingCommand)=>Promise<unknown>;
 readonly assertOriginalHelperReceipt:(command:CurrentFootprintInverseDeleteBindingCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>Promise<void>;readonly assertOriginalReadyHeld:()=>void;readonly assertOriginalIdle:()=>void;
 readonly complete:()=>Promise<void>;readonly assertOriginalGenerationExited:()=>Promise<void>;readonly fail:()=>void;
}
