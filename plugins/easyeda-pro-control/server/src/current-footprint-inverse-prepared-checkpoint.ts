/** Private inverse source domains. Type membership does not enroll a token;
 * historical and full-successor issuers keep disjoint original registries. */
import type {CurrentFootprintForwardSavedCheckpoint} from "./current-footprint-copy-held-saved-generation.ts";
import type {CurrentFootprintInverseFullPreparation} from "./current-footprint-inverse-full-preparation.ts";

export type CurrentFootprintInversePreparedCheckpoint=CurrentFootprintForwardSavedCheckpoint|CurrentFootprintInverseFullPreparation;
