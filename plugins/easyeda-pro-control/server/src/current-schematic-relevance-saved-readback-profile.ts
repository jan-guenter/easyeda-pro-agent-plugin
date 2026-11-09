/** Separate seven-record saved-reader birth. All budgets belong to this new
 * generation; historical writer handles and Via origins supply no authority. */
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as REGISTRATION } from "./current-saved-project-registration-config-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as OBSERVE } from "./current-pcb-via-saved-load-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS as CACHE } from "./current-pcb-via-saved-cache-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS as METADATA } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as COLD } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";

const cacheRequests = 3 + 16 + 1 + 9 + 1 + CACHE.total + METADATA.total;
const deleteGuards = 2 * (9 + 1), loadingGuard = 9 + 1;
const loading = cacheRequests + deleteGuards + loadingGuard; const registration = 1 + 1; const opening = 8 + 3 * (1 + 1) + 4;
const cold = loading + registration + opening + COLD.totalUntilProjectHeld + OBSERVE.total;
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PURPOSE = "schematic-relevance-saved-readback209";
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE = Object.freeze({
  purpose: CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PURPOSE,
  nativeSwitch: "-SchematicRelevanceSavedReadback209",
  main: Object.freeze({ constructionNormal: 64, fenceNormal: FENCE.normal, registrationNormal: REGISTRATION, normal: 64 + FENCE.normal + REGISTRATION, cleanup: 8, total: 64 + FENCE.normal + REGISTRATION + 8 }),
  renderer: Object.freeze({ cacheParent: 1, preCacheGuard: 9, guardHelper: 1, cache: CACHE.total, metadata: METADATA.total, activeCache: cacheRequests, deleteGuards, loadingGuard, activeInvalidation: cacheRequests + deleteGuards, activeLoading: loading, registration, opening, activeRegistration: loading + registration, activeOpening: loading + registration + opening, activeBootstrap: loading + registration + opening + COLD.totalUntilProjectHeld, coldObservation: OBSERVE.total, activeCold: cold, scene: 3, sceneHelperSources: 2, activeScene: cold + 3 + 2, earlyActors: 3, discovery: 16, coldBootstrap: COLD.totalUntilProjectHeld, normal: 3 + 16, cleanup: 0, total: 3 + 16 }),
  writerHandlesTransferred: false, cacheMutationAuthorized: false, openingAuthorized: false,
  executionAuthorized: false, saveAuthorized: false, reopenedVerified: false,
});
