/** Private bindings attach to the already-original producer observer. There is no alternate event read. */
import type { CurrentProjectSaveProducerHeldCall } from "./current-project-save-producer-origin.ts";
import type { CurrentPcbViaSaveTailDeleteRole } from "./current-pcb-via-save-tail-observation-source.ts";

export interface CurrentPcbViaSaveTailObservationField {readonly name:string;readonly value:Readonly<{type:"object"|"function"|"string"|"number"|"boolean"|"undefined";objectId?:string;value?:string|number|boolean|null}>}
export interface CurrentPcbViaSaveTailDeleteCapture {readonly packet:CurrentProjectSaveProducerHeldCall;readonly role:CurrentPcbViaSaveTailDeleteRole;readonly fields:readonly CurrentPcbViaSaveTailObservationField[]}
export interface CurrentPcbViaSaveTailObservationBindings {
  readonly additionalHeadJobs:3;
  readonly additionalSharedRequests:42;
  readonly arm:()=>Promise<void>;
  readonly originalBreakpoint:(role:CurrentPcbViaSaveTailDeleteRole)=>string;
  /** Uses the current retained producer event. It never polls or accepts a supplied event/handle. */
  readonly captureHeldCall:(role:CurrentPcbViaSaveTailDeleteRole)=>Promise<CurrentPcbViaSaveTailDeleteCapture>;
  readonly assertCurrent:()=>Promise<void>;
}
