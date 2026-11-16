/** Separate natural-ticket component. Records retain local facts only;
 * no serialized callback, timer, body or boolean issues native ownership. */
import {z} from "zod";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PROFILE="private.current-footprint-forward-writer-ticket-timer.v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PREFIX="footprint-forward-ticket-timer-";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BUDGET=Object.freeze({
 maximumTimers:2,arms:3,setupRequests:37,precreateRequests:1,heldRequests:20,finalSlotRequests:3,startupWsRequests:1,
 rendererRequests:62,resumes:6,controls:9,events:48,sourceEventBoundPending:false,
 evaluationScripts:20,pointResolutions:3,conditionCompileAndRuns:5,busConsoleEvents:8,pausedAndResumed:12,
 normalRecords:23,cleanupRecords:2,records:25,recordBytes:4096,artifactPathUnits:8192,manifestBytes:385_536,
 wholeWriterReserved:false,executionAuthorized:false,saveAuthorized:false,
});
const parentPrefix="footprint-forward-writer-",prefix=CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PREFIX;
export const currentFootprintForwardWriterTicketTimerIdSchema=z.string().min(prefix.length+8).max(96).regex(/^footprint-forward-ticket-timer-[a-z0-9][a-z0-9-]*$(?![\s\S])/u);
export const currentFootprintForwardWriterTicketTimerRequestSchema=z.strictObject({operationId:currentFootprintForwardWriterTicketTimerIdSchema,parentOperationId:z.string().min(parentPrefix.length+8).max(96).regex(/^footprint-forward-writer-[a-z0-9][a-z0-9-]*$(?![\s\S])/u),acceptOriginalNaturalTicketTimer:z.literal(true)}).refine(value=>value.parentOperationId===parentPrefix+value.operationId.slice(prefix.length));
export type CurrentFootprintForwardWriterTicketTimerRequest=Readonly<z.infer<typeof currentFootprintForwardWriterTicketTimerRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PHASES=Object.freeze(["operation-intent","ws-intent","ws-result","setup-intent","setup-result","precreate-intent","precreate-result","timer-intent","timer-result","quiesce-intent","quiesce-result","complete","failure","release-intent","release-result"]as const);
export type CurrentFootprintForwardWriterTicketTimerPhase=typeof CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PHASES[number];
export const currentFootprintForwardWriterTicketTimerRecordSchema=z.strictObject({schema:z.literal("easyeda-pro-control.footprint-forward-writer-ticket-timer-record.v1"),operationId:currentFootprintForwardWriterTicketTimerIdSchema,sequence:z.number().int().min(0).max(24),previousSha256:z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/u).nullable(),kind:z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PHASES),evidence:z.record(z.string(),z.unknown()),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false)});
export type CurrentFootprintForwardWriterTicketTimerRecord=Readonly<z.infer<typeof currentFootprintForwardWriterTicketTimerRecordSchema>>;
export {CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE as CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PURPOSE} from "./current-footprint-forward-writer-profile.ts";
