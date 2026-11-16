/** Original complete-timer custody, installed only by its actual Core.
 * A label, callback or serialized frame cannot register this origin. */
import type {CurrentFootprintForwardWriterTicketTimerCommand} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";
import type {CurrentFootprintForwardWriterStartupFrontierEvent} from "./current-footprint-forward-writer-frontier-origin.ts";

export interface CurrentFootprintForwardWriterTicketTimerOrigin{readonly profile:"private.current-footprint-forward-writer-ticket-timer-origin.v1"}
export type CurrentFootprintForwardWriterTicketTimerRole="entry"|"returned"|"selfReturned";
export interface CurrentFootprintForwardWriterTicketTimerBindings{
 readonly actual:Readonly<{scriptId:string;sessionId:string;reflection:string;project:string;dependencies:string;destinations:string;source:string}>;
 readonly assertCurrent:()=>Promise<void>;
 readonly request:(command:CurrentFootprintForwardWriterTicketTimerCommand)=>Promise<unknown>;
 readonly pump:()=>Promise<void>;
 readonly point:(role:CurrentFootprintForwardWriterTicketTimerRole,id:string)=>void;
 readonly control:(operation:"bind"|"ready"|"held"|"complete",role?:CurrentFootprintForwardWriterTicketTimerRole,timerOrdinal?:number)=>Promise<void>;
 readonly journal:(kind:string,evidence:Readonly<Record<string,unknown>>)=>Promise<void>;
 readonly inputSha256:string;
 readonly originalCreateWritten:()=>boolean;
 readonly requireOriginalCallbacksCompleted:()=>void;
 readonly assertOriginalGenerationExited:()=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export type CurrentFootprintForwardWriterTicketTimerEvent=CurrentFootprintForwardWriterStartupFrontierEvent;
// oxlint-disable-next-line import/no-cycle -- Only later original Core construction installs and resolves this private original-instance registry.
export {requireOriginalCurrentFootprintForwardWriterTicketTimerOrigin} from "./current-pcb-diagnostic-owner.ts";
