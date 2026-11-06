/** Separately born original worker custody. A serialized brand cannot issue
 * either this observation channel or the separately journaled cancellation. */
import type { CurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";

export interface CurrentPcbViaProjectSyncQuiesceOrigin { readonly profile:"private.current-pcb-via-project-sync-quiesce-origin.v1" }
export interface CurrentSchematicDisplayProjectSyncQuiesceOrigin { readonly profile:"private.current-schematic-display-project-sync-quiesce-origin.v1" }
export type CurrentProjectSyncQuiesceOrigin=CurrentPcbViaProjectSyncQuiesceOrigin|CurrentSchematicDisplayProjectSyncQuiesceOrigin;
export interface CurrentProjectSyncQuiesceEvent { readonly method:"Debugger.paused"|"Debugger.resumed";readonly sessionId:string;readonly params:unknown }
export interface CurrentProjectSyncQuiesceBindings {
  readonly sessionId:string;readonly scriptId:string;readonly uniqueContextId:string;readonly source:string;
  readonly originalProject:()=>string;
  /** Only the actual cancel phase consumes the original pre-navigation intent. */
  readonly request:(command:CurrentProjectSyncQuiesceCommand)=>Promise<unknown>;
  readonly nextEvent:()=>Promise<CurrentProjectSyncQuiesceEvent>;
  readonly assertCurrent:()=>Promise<void>;
  readonly complete:()=>Promise<void>;
  readonly assertOriginalGenerationExited:()=>Promise<void>;
  readonly fail:()=>void;
}
