/** Reprove the eager snapshots owned by each original defining module.
 * Imports may be cyclic; no class value is accessed during this aggregation. */
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentFootprintForwardWriterPublicationDriverClass} from "./current-footprint-forward-writer-publication-driver.ts";
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentFootprintForwardWriterPublicationCallbacksClass} from "./current-footprint-forward-writer-publication-callbacks.ts";

export function assertOriginalCurrentFootprintForwardWriterPublicationClasses():void{
 assertOriginalCurrentFootprintForwardWriterPublicationDriverClass();
 assertOriginalCurrentFootprintForwardWriterPublicationCallbacksClass();
}
