/** Original inverse owner and worker only. Data labels issue no cache grant. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";
import type { CurrentFootprintInverseStartupPlan } from "./current-footprint-inverse-startup-plan.ts";
import type { CurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentFootprintInverseInitialCacheOrigin { readonly profile: "private.current-footprint-inverse-initial-cache-origin.v1" }
export interface CurrentFootprintInverseInitialCacheCompletion {readonly profile:"private.current-footprint-inverse-initial-cache-completion.v1"}
export interface CurrentFootprintInverseInitialCacheBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly startup: CurrentFootprintInverseStartupPlan; readonly data: CurrentFootprintInverseInitialCacheData;
  readonly actual: CurrentFootprintInverseBootstrapArguments; readonly producer: Readonly<{ wrapper: string; callback: string }>; readonly intrinsics: string;
  readonly originalBreakpoints: readonly Readonly<{ role: string; id: string }>[];
  readonly request: (command: CurrentFootprintInverseInitialCacheCommand) => Promise<unknown>;
  readonly nextEvent: () => Promise<DiagnosticEvent>;readonly complete:(packet:CurrentFootprintInverseInitialCacheCompletion)=>Promise<void>; readonly assertCurrent: () => void; readonly fail: () => void;
}
