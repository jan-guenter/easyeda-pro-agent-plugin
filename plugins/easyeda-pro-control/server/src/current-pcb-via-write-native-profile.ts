/* oxlint-disable import/max-dependencies -- Derive the actual Via reservation from each separate fixed protocol; released purpose budgets remain independent. */
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS as UPLOAD } from "./current-pcb-via-upload-request-protocol.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS as QUIESCE } from "./current-project-sync-quiesce-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_REQUESTS as LIVE_HISTORY } from "./current-pcb-via-main-live-history-protocol.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS as LOCAL } from "./current-pcb-via-local-upload-protocol.ts";
import { CURRENT_PCB_VIA_WRITE_START_PAGE as PAGE } from "./current-pcb-via-write-start-page-profile.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS as PERIODIC } from "./current-generated-periodic-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_REQUESTS as INITIAL_SYNC } from "./current-generated-initial-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_REQUESTS as INITIAL_CACHE } from "./current-generated-initial-cache-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as PRODUCER } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS as TRANSPORT } from "./current-project-structure-transport-protocol.ts";
/** Separate original Via birth capacity. This reserves fixed infrastructure;
 * complete source/write/Save/persistence eligibility is proved separately. */
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as STRUCTURE_MAIN } from "./current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as HISTORY } from "./current-pcb-via-main-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as BEGIN } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_CLOCK_REQUESTS as CLOCK } from "./current-pcb-via-clock-protocol.ts";
import { CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS as SAVE } from "./current-pcb-via-save-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STEP_REQUESTS as STEPS } from "./current-pcb-via-main-step-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_REQUESTS as MAIN } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS as GUARD, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE = "pcb-via-write209";
export const CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-PcbViaWrite209",
  main: Object.freeze({ normal: 64 + FENCE.normal + MAIN.normal + STEPS.normal + BEGIN.normal + HISTORY.normal + STRUCTURE_MAIN.normal + LIVE_HISTORY.normal, cleanup: 8 + MAIN.cleanup + BEGIN.cleanup + HISTORY.cleanup + STRUCTURE_MAIN.cleanup + LIVE_HISTORY.cleanup, total: 64 + FENCE.normal + MAIN.total + STEPS.total + BEGIN.total + HISTORY.total + STRUCTURE_MAIN.total + LIVE_HISTORY.total + 8 }),
  renderer: Object.freeze({ opening: 103, startPage: PAGE, sceneObservations: 2, sceneRequests: 267, dtoObservations: 2, dtoRequests: 9,
    fixedStages: 5, bracketsPerStage: 8, workerBootstrap: BOOTSTRAP.total, saveObservation: SAVE.total, structureObservation: STRUCTURE.cdpRequests, producerGuards: GUARD.cdpRequests, producerObservation: PRODUCER.cdpRequests, initialCache: INITIAL_CACHE.cdpRequests, initialSync: INITIAL_SYNC.cdpRequests, periodicSync: PERIODIC.cdpRequests, syncQuiesce: QUIESCE.cdpRequests, localUpload: LOCAL.cdpRequests, uploadRequest: UPLOAD.cdpRequests, producerEnrollmentControls: GUARD.enrollmentControls, structureTransport: TRANSPORT.cdpRequests, structureTransportBindingControls: 1, clockObservation: CLOCK.total,
    total: 103 + PAGE.additionalInventoryRequests + 2 * 267 + 2 * 9 + 5 * (8 + 1) + BOOTSTRAP.total + SAVE.total + STRUCTURE.cdpRequests + TRANSPORT.cdpRequests + GUARD.cdpRequests + PRODUCER.cdpRequests + INITIAL_CACHE.cdpRequests + INITIAL_SYNC.cdpRequests + PERIODIC.cdpRequests + QUIESCE.cdpRequests + LOCAL.cdpRequests + UPLOAD.cdpRequests + CLOCK.total }),

  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
});
