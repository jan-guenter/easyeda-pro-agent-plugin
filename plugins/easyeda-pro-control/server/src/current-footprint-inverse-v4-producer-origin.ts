/** Original inverse issuer only. A copied label and the inert constructor
 * summary provide no worker, receiver or native enrollment custody. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintInverseStartupPlan } from "./current-footprint-inverse-startup-plan.ts";
import type { CurrentFootprintInverseBootstrapArguments } from "./current-footprint-inverse-bootstrap-origin.ts";

export interface CurrentFootprintInverseProducerOrigin { readonly profile: "private.current-footprint-inverse-producer-origin.v1" }
export interface CurrentFootprintInverseProducerBindings {
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly startup:CurrentFootprintInverseStartupPlan;
  readonly actual: CurrentFootprintInverseBootstrapArguments;
  readonly intrinsics: string;
  readonly readOnlyGates:string;
  readonly originalBreakpoints: readonly Readonly<{ role: string; id: string }>[];
  readonly assertCurrent: () => void;
  readonly producerBootstrapResumeAuthorized: false;
  readonly fullProducerFrontierVerified: false;
}
