/** Distinct original fresh-reader tokens. The historical writer supplies data
 * only; current absence never proves a later worker selected a cold branch. */
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { CurrentPcbViaSavedCacheAbsenceData, CurrentPcbViaSavedCacheLoadingData } from "./current-pcb-via-saved-cache-invalidation-ledger.ts";

export interface CurrentSchematicRelevanceSavedCacheAbsence { readonly profile: "private.current-schematic-relevance-saved-cache-absence.v1" }
export interface CurrentSchematicRelevanceSavedLoadingPreparation { readonly profile: "private.current-schematic-relevance-saved-loading-preparation.v1" }
export interface CurrentSchematicRelevanceSavedCacheAbsenceBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan; readonly data: CurrentPcbViaSavedCacheAbsenceData;
  readonly assertCurrent: () => Promise<void>; readonly freshLoadingVerified: false;
}
export interface CurrentSchematicRelevanceSavedLoadingBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan; readonly absence: CurrentSchematicRelevanceSavedCacheAbsence;
  readonly data: CurrentPcbViaSavedCacheLoadingData; readonly assertCurrent: () => Promise<void>; readonly freshLoadingVerified: false;
}
export { requireOriginalCurrentSchematicRelevanceSavedCacheAbsence, requireOriginalCurrentSchematicRelevanceSavedLoadingPreparation } from "./current-pcb-diagnostic-owner.ts";
