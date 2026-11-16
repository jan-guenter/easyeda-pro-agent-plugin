/** Full copy adds four same-stream head jobs and the original delete points.
 * This binding is never accepted by the old Via/SCH issuer maps. */
import type {CurrentPcbViaSaveTailObservationBindings} from "./current-pcb-via-save-tail-observation-origin.ts";

export interface CurrentFootprintForwardWriterCopyTailObservationBindings extends Omit<CurrentPcbViaSaveTailObservationBindings,"additionalHeadJobs"|"additionalSharedRequests">{
 readonly additionalHeadJobs:4;readonly additionalSharedRequests:56;
}
// oxlint-disable-next-line import/no-cycle -- Only a later original full observer resolves Core's private same-stream map.
export {originalCurrentFootprintForwardWriterCopyTailObservation} from "./current-pcb-diagnostic-owner.ts";
