/** Only the original inverse held-ready factory may issue this live origin. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseClockWorkerCommand } from "./current-footprint-inverse-clock-worker-protocol.ts";

export interface CurrentFootprintInverseClockWorkerOrigin{readonly profile:"private.current-footprint-inverse-clock-worker-origin.v1"}
export interface CurrentFootprintInverseClockWorkerBindings{
 readonly prepared:CurrentFootprintForwardSavedCheckpoint;readonly scriptId:string;readonly source:string;readonly original:string;readonly readyFrameId:string;
 readonly request:(command:CurrentFootprintInverseClockWorkerCommand)=>Promise<unknown>;readonly assertOriginalHelperReceipt:(command:CurrentFootprintInverseClockWorkerCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>void;readonly assertOriginalReadyHeld:()=>void;readonly assertOriginalIdle:()=>void;readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
