/** Fixed original callback/timer method tables. Program and origin custody
 * cannot be replaced by patched observer methods after source preparation. */
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentFootprintForwardWriterStartupFrontier } from "./current-footprint-forward-writer-startup-frontier.ts";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentFootprintForwardWriterStartupCallbacks } from "./current-footprint-forward-writer-startup-callbacks.ts";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentFootprintForwardWriterStartupTimer } from "./current-footprint-forward-writer-startup-timer.ts";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentProjectSyncQuiesceObserver } from "./current-project-sync-quiesce-observer.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

const prototypes = [CurrentFootprintForwardWriterStartupFrontier, CurrentFootprintForwardWriterStartupCallbacks, CurrentFootprintForwardWriterStartupTimer, CurrentProjectSyncQuiesceObserver]
  .map(value => captureCurrentFootprintForwardExecutionPrototypes(value.prototype));
export function assertOriginalCurrentFootprintForwardWriterStartupFrontierClasses(): void {
  for (const prototype of prototypes) { requireCurrentFootprintForwardExecutionPrototypes(prototype); }
}
