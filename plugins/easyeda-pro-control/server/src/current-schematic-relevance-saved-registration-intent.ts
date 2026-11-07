/** A separate saved SCH7 intent. Only the fresh reader's private registry and
 * its original Main runner can supply these bindings; copied JSON cannot. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";

export interface CurrentSchematicRelevanceSavedRegistrationIntent { readonly profile: "private.current-schematic-relevance-saved-registration-intent.v1" }
export interface CurrentSchematicRelevanceSavedRegistrationBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly schematicUuid: string;
  readonly pageUuid: string;
  readonly assertCurrent: () => Promise<void>;
  /** Requires the actual once-consumed original UI request to remain pending. */
  readonly assertOriginalDispatchPending: () => void;
  /** Requires the original settled SDK result to prove the exact prior path.
   * A caller-supplied no-dispatch flag cannot bypass the Main sequence. */
  readonly assertOriginalNoDispatchResult: () => void;
}
