/** Only the genuine original inverse bootstrap owner issues this origin. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";
import type { CurrentFootprintInverseStartupPlan } from "./current-footprint-inverse-startup-plan.ts";
import type { CurrentFootprintInverseStartupCallbackCommand } from "./current-footprint-inverse-startup-callback-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentFootprintInverseStartupCallbackOrigin { readonly profile: "private.current-footprint-inverse-startup-callback-origin.v1" }
export interface CurrentFootprintInverseStartupCallbackBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly startup: CurrentFootprintInverseStartupPlan;
  readonly actual: CurrentFootprintInverseBootstrapArguments; readonly sourceRecordUpperBound: number;
  readonly originalBreakpoints: readonly Readonly<{ role: string; id: string }>[];
  readonly request: (command: CurrentFootprintInverseStartupCallbackCommand) => Promise<unknown>;
  readonly nextEvent: () => Promise<DiagnosticEvent>;
  readonly assertCurrent: () => void; readonly fail: () => void;
}
