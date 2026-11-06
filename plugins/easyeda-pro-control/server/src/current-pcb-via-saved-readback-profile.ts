/** A fresh readonly birth after the original writer's complete closed SQL proof.
 * Cache grants and restored-source acceptance remain separate from these bounds. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as OBSERVE } from "./current-pcb-via-saved-load-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as LOAD } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS as METADATA } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS as CACHE } from "./current-pcb-via-saved-cache-protocol.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as REGISTRATION } from "./current-saved-project-registration-config-protocol.ts";

/** Pure readonly seven-source runner only. Writer-specific setup helpers and
 * original Save/clock/producer lanes supply no authority or budget here. */
export const CURRENT_PCB_VIA_SAVED_READBACK_BOOTSTRAP_REQUESTS = Object.freeze({ parent: 2, inventory: 1,
  workerNormal: LOAD.normal, workerCleanup: ROLES.length + 1,
  total: 2 + 1 + LOAD.normal + ROLES.length + 1 });
const ACTIVE_READ_ONLY = 16 + 9 + 2 + CACHE.total + METADATA.total + 2 * (9 + 1) + (9 + 1);
const BOOTSTRAP = CURRENT_PCB_VIA_SAVED_READBACK_BOOTSTRAP_REQUESTS;

export const CURRENT_PCB_VIA_SAVED_READBACK_PURPOSE = "pcb-via-saved-readback209";
export const CURRENT_PCB_VIA_SAVED_READBACK_PROFILE = Object.freeze({
  purpose: CURRENT_PCB_VIA_SAVED_READBACK_PURPOSE, nativeSwitch: "-PcbViaSavedReadback209",
  main: Object.freeze({ constructionNormal: 64, fenceNormal: FENCE.normal, registrationNormal: REGISTRATION, normal: 64 + FENCE.normal + REGISTRATION, cleanup: 8, total: 64 + FENCE.normal + REGISTRATION + 8 }),
  renderer: Object.freeze({ enabledDiscovery: 16, preCacheGuard: 9, preDeleteGuards: 2 * (9 + 1), preLoadGuard: 9 + 1, earlyWorkerParent: 2, activeReadOnly: ACTIVE_READ_ONLY, activeLoadBootstrap: ACTIVE_READ_ONLY + LOAD.totalUntilProjectHeld, activeLoadObservation: ACTIVE_READ_ONLY + LOAD.totalUntilProjectHeld + OBSERVE.total, loadingObservation: OBSERVE.total, nativeMetadata: METADATA.total, opening: 103, workerBootstrap: BOOTSTRAP.total, cache: CACHE.total,
    normal: 9 + 103 + BOOTSTRAP.parent + BOOTSTRAP.inventory + BOOTSTRAP.workerNormal + OBSERVE.normal + CACHE.normal + METADATA.normal + 2 * (9 + 1) + (9 + 1),
    cleanup: BOOTSTRAP.workerCleanup + OBSERVE.continuation + CACHE.cleanup + METADATA.cleanup, total: 9 + 103 + BOOTSTRAP.total + OBSERVE.total + CACHE.total + METADATA.total + 2 * (9 + 1) + (9 + 1) }),
  cacheDeletionAuthorized: false, executionAuthorized: false, saveAuthorized: false, reopenedVerified: false,
});
