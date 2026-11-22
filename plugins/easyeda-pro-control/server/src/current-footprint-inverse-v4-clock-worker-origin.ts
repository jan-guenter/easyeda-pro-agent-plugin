/** Only the original inverse held-ready factory may issue this live origin. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInverseClockWorkerCommand } from "./current-footprint-inverse-clock-worker-protocol.ts";

export interface CurrentFootprintInverseClockWorkerOrigin{readonly profile:"private.current-footprint-inverse-clock-worker-origin.v1"}
export interface CurrentFootprintInverseClockWorkerBindings{
 readonly prepared:CurrentFootprintInversePreparedCheckpoint;readonly scriptId:string;readonly source:string;readonly original:string;readonly readyFrameId:string;
 readonly request:(command:CurrentFootprintInverseClockWorkerCommand)=>Promise<unknown>;readonly assertOriginalHelperReceipt:(command:CurrentFootprintInverseClockWorkerCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>void;readonly assertOriginalReadyHeld:()=>void;readonly assertOriginalIdle:()=>void;readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
