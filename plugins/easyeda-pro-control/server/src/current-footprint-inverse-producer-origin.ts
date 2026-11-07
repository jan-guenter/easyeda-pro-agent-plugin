/** Original inverse issuer only. A copied label and the inert constructor
 * summary provide no worker, receiver or native enrollment custody. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseStartupPlan } from "./current-footprint-inverse-startup-plan.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";

export interface CurrentFootprintInverseProducerOrigin { readonly profile: "private.current-footprint-inverse-producer-origin.v1" }
export interface CurrentFootprintInverseProducerBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint;
  readonly startup:CurrentFootprintInverseStartupPlan;
  readonly actual: CurrentFootprintInverseBootstrapArguments;
  readonly intrinsics: string;
  readonly originalBreakpoints: readonly Readonly<{ role: string; id: string }>[];
  readonly assertCurrent: () => void;
  readonly producerBootstrapResumeAuthorized: false;
  readonly fullProducerFrontierVerified: false;
}
