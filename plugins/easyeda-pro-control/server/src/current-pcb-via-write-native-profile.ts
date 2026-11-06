/** Separate original Via birth capacity. This reserves fixed infrastructure;
 * complete source/write/Save/persistence eligibility is proved separately. */
import { CURRENT_PCB_VIA_CLOCK_REQUESTS as CLOCK } from "./current-pcb-via-clock-protocol.ts";
import { CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS as SAVE } from "./current-pcb-via-save-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_REQUESTS as MAIN } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE = "pcb-via-write209";
export const CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-PcbViaWrite209",
  main: Object.freeze({ normal: 64 + FENCE.normal + MAIN.normal, cleanup: 8 + MAIN.cleanup, total: 64 + FENCE.normal + MAIN.total + 8 }),
  renderer: Object.freeze({ opening: 103, sceneObservations: 2, sceneRequests: 267, dtoObservations: 2, dtoRequests: 9,
    fixedStages: 5, bracketsPerStage: 8, workerBootstrap: BOOTSTRAP.total, saveObservation: SAVE.total, clockObservation: CLOCK.total,
    total: 103 + 2 * 267 + 2 * 9 + 5 * (8 + 1) + BOOTSTRAP.total + SAVE.total + CLOCK.total }),
  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
});
