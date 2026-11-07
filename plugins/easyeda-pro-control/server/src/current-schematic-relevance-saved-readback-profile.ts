/** Separate seven-record saved-reader birth. All budgets belong to this new
 * generation; historical writer handles and Via origins supply no authority. */
import { CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS as CACHE } from "./current-pcb-via-saved-cache-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS as METADATA } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as COLD } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PURPOSE = "schematic-relevance-saved-readback209";
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE = Object.freeze({
  purpose: CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PURPOSE,
  nativeSwitch: "-SchematicRelevanceSavedReadback209",
  main: Object.freeze({ constructionNormal: 64, fenceNormal: FENCE.normal, normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ cacheParent: 1, preCacheGuard: 9, guardHelper: 1, cache: CACHE.total, metadata: METADATA.total, activeCache: 3 + 16 + 1 + 9 + 1 + CACHE.total + METADATA.total, earlyActors: 3, discovery: 16, coldBootstrap: COLD.totalUntilProjectHeld, normal: 3 + 16, cleanup: 0, total: 3 + 16 }),
  writerHandlesTransferred: false, cacheMutationAuthorized: false, openingAuthorized: false,
  executionAuthorized: false, saveAuthorized: false, reopenedVerified: false,
});
