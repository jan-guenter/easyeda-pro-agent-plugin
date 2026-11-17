/** Original ready publication custody is issued only by the same full Core.
 * Historical startup receipts and matching data cannot create this origin. */
import type {CurrentFootprintForwardWriterPublicationCommand} from "./current-footprint-forward-writer-publication-protocol.ts";
import type {CurrentFootprintForwardWriterStartupFrontierEvent} from "./current-footprint-forward-writer-frontier-origin.ts";
import type {CurrentFootprintForwardWriterStartupCallbackRole} from "./current-footprint-forward-writer-frontier-protocol.ts";

export interface CurrentFootprintForwardWriterPublicationOrigin{readonly profile:"private.current-footprint-forward-writer-publication-origin.v1"}
export interface CurrentFootprintForwardWriterPublicationBindings{
 readonly sourceRecords:number;
 readonly actual:Readonly<{sessionId:string;scriptId:string;uniqueContextId:string;source:string;project:string;wrapper:string;callback:string}>;
 readonly originalPoint:(role:CurrentFootprintForwardWriterStartupCallbackRole)=>string;
 readonly request:(command:CurrentFootprintForwardWriterPublicationCommand)=>Promise<unknown>;
 readonly event:()=>Promise<CurrentFootprintForwardWriterStartupFrontierEvent>;
 readonly control:(operation:"callback-held"|"queue-open"|"complete",role?:CurrentFootprintForwardWriterStartupCallbackRole)=>Promise<void>;
 readonly journal:(kind:string,evidence:Readonly<Record<string,unknown>>)=>Promise<void>;
 readonly assertCurrent:()=>void;
 readonly assertOriginalGenerationExited:()=>Promise<void>;
 readonly fail:(cause?:unknown)=>void;
}
// oxlint-disable-next-line import/no-cycle -- The later original Core factory alone installs and resolves the private publication registry.
export {requireOriginalCurrentFootprintForwardWriterPublicationOrigin} from "./current-pcb-diagnostic-owner.ts";
