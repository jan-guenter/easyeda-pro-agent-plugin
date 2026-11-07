/** Distinct original workers populate the central private registry. These
 * serialized interfaces expose no issuer and transfer no other purpose. */
import type { CurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";

export interface CurrentFootprintInverseLibraryRefreshOrigin { readonly profile:"private.current-footprint-inverse-library-refresh-origin.v1" }
export interface CurrentSchematicRelevanceLibraryRefreshOrigin { readonly profile:"private.current-schematic-relevance-library-refresh-origin.v1" }
export type CurrentProjectLibraryRefreshOrigin=CurrentFootprintInverseLibraryRefreshOrigin|CurrentSchematicRelevanceLibraryRefreshOrigin;
export interface CurrentProjectLibraryRefreshEvent {readonly method:"Debugger.paused"|"Debugger.resumed";readonly sessionId:string;readonly params:unknown}
export interface CurrentProjectLibraryRefreshBindings {
 readonly sessionId:string;readonly scriptId:string;readonly uniqueContextId:string;readonly source:string;
 readonly originalProject:()=>string;
 readonly request:(command:CurrentProjectLibraryRefreshCommand)=>Promise<unknown>;
 readonly nextEvent:()=>Promise<CurrentProjectLibraryRefreshEvent>;
 readonly assertCurrent:()=>Promise<void>;
 /** Original beforeScriptExecution/setup custody; never a caller fresh flag. */
 readonly assertOriginalSourceHeld:()=>void;
 /** Exact original command and raw reply references select one private source
  * receipt. Must finish its bounded helper-source read before returning. */
 readonly assertOriginalHelperReceipt:(command:CurrentProjectLibraryRefreshCommand,rawReply:unknown)=>Promise<void>;
 readonly complete:()=>Promise<void>;
 readonly assertOriginalGenerationExited:()=>Promise<void>;
 readonly fail:()=>void;
}
