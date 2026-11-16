/** Resolve only the later original Core registry. Delayed loading keeps the
 * channel's inert startup module from evaluating a native owner during birth. */
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentFootprintForwardWriterClockChannelBindings, CurrentFootprintForwardWriterClockChannelOrigin } from "./current-footprint-forward-writer-clock-origin.ts";

export async function resolveCurrentFootprintForwardWriterClockChannelOrigin(origin: CurrentFootprintForwardWriterClockChannelOrigin,
  dependency: CurrentPcbWorkerStartupDependency): Promise<Readonly<{ binding: CurrentFootprintForwardWriterClockChannelBindings; reprove: () => CurrentFootprintForwardWriterClockChannelBindings }>> {
  const module = await import("./current-footprint-forward-writer-clock-origin.ts"), original = module.requireCurrentFootprintForwardWriterClockChannelOrigin;
  const binding = original(origin, dependency);
  return Object.freeze({ binding, reprove: (): CurrentFootprintForwardWriterClockChannelBindings => {
    if (module.requireCurrentFootprintForwardWriterClockChannelOrigin !== original || original(origin, dependency) !== binding) { throw new Error("FORWARD_WRITER_CLOCK_ORIGINAL_REGISTRY"); } return binding;
  } });
}
