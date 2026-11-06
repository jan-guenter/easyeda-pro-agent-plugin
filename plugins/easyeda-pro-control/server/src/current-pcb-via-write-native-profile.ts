/** Separate original Via birth capacity. This reserves fixed infrastructure;
 * complete source/write/Save/persistence eligibility is proved separately. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE = "pcb-via-write209";
export const CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-PcbViaWrite209",
  main: Object.freeze({ normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ opening: 103, sceneObservations: 2, sceneRequests: 267, dtoObservations: 2, dtoRequests: 9,
    fixedStages: 5, bracketsPerStage: 8, total: 103 + 2 * 267 + 2 * 9 + 5 * (8 + 1) }),
  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
});
