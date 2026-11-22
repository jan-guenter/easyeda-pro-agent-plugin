/** Populated only by the genuine inverse idle owner; no supplied callback,
 * equal target or copied handle can issue original public-receiver custody. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInversePublicApiCommand, CurrentFootprintInversePublicApiTarget } from "./current-footprint-inverse-public-api-protocol.ts";

export interface CurrentFootprintInversePublicApiOrigin{readonly profile:"private.current-footprint-inverse-public-api-origin.v1"}
export interface CurrentFootprintInversePublicApiBindings{
 readonly prepared:CurrentFootprintInversePreparedCheckpoint;readonly target:CurrentFootprintInversePublicApiTarget;readonly context:string;
 readonly request:(command:CurrentFootprintInversePublicApiCommand)=>Promise<unknown>;
 readonly assertOriginalHelperReceipt:(command:CurrentFootprintInversePublicApiCommand,reply:unknown)=>Promise<void>;
 readonly assertCurrent:()=>void;readonly assertOriginalIdle:()=>void;readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
