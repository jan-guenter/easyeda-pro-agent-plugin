/** A fresh readonly birth after the original writer's complete closed SQL proof.
 * Cache grants and restored-source acceptance remain separate from these bounds. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS as CACHE } from "./current-pcb-via-saved-cache-protocol.ts";

export const CURRENT_PCB_VIA_SAVED_READBACK_PURPOSE = "pcb-via-saved-readback209";
export const CURRENT_PCB_VIA_SAVED_READBACK_PROFILE = Object.freeze({
  purpose: CURRENT_PCB_VIA_SAVED_READBACK_PURPOSE, nativeSwitch: "-PcbViaSavedReadback209",
  main: Object.freeze({ constructionNormal: 64, fenceNormal: FENCE.normal, normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ enabledDiscovery: 16, opening: 103, workerBootstrap: BOOTSTRAP.total, cache: CACHE.total,
    normal: 103 + BOOTSTRAP.parent + BOOTSTRAP.inventory + BOOTSTRAP.workerNormal + CACHE.normal,
    cleanup: BOOTSTRAP.workerCleanup + CACHE.cleanup, total: 103 + BOOTSTRAP.total + CACHE.total }),
  cacheDeletionAuthorized: false, executionAuthorized: false, saveAuthorized: false, reopenedVerified: false,
});
