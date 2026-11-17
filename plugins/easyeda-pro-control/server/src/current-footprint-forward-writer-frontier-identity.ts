/** Reprove the eager snapshots owned by each original defining module.
 * Imports may be cyclic; no class value is accessed during this aggregation. */
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentFootprintForwardWriterStartupFrontierClass} from "./current-footprint-forward-writer-startup-frontier.ts";
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentFootprintForwardWriterStartupCallbacksClass} from "./current-footprint-forward-writer-startup-callbacks.ts";
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentFootprintForwardWriterStartupTimerClass} from "./current-footprint-forward-writer-startup-timer.ts";
// oxlint-disable-next-line import/no-cycle -- Only later calls reprove snapshots already captured in the defining module.
import {assertOriginalCurrentProjectSyncQuiesceObserverClass} from "./current-project-sync-quiesce-observer.ts";

export function assertOriginalCurrentFootprintForwardWriterStartupFrontierClasses():void{
 assertOriginalCurrentFootprintForwardWriterStartupFrontierClass();
 assertOriginalCurrentFootprintForwardWriterStartupCallbacksClass();
 assertOriginalCurrentFootprintForwardWriterStartupTimerClass();
 assertOriginalCurrentProjectSyncQuiesceObserverClass();
}
