/** Original writer-only pre-opening registration. The source checkpoint and
 * native request stay in a private owner registry; JSON issues no bindings. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";

export interface CurrentSchematicRelevanceDisplayRegistrationIntent { readonly profile: "private.current-schematic-relevance-display-registration-intent.v1" }
export interface CurrentSchematicRelevanceDisplayRegistrationBindings {
  readonly prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly schematicUuid: string;
  readonly pageUuid: string;
  readonly assertCurrent: () => Promise<void>;
  readonly assertOriginalDispatchPending: () => void;
  readonly assertOriginalNoDispatchResult: () => void;
}
