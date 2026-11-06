/* oxlint-disable import/max-dependencies -- Derive separate original renderer budgets from fixed source protocols without merging authority. */
import { CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS as PERIODIC } from "./current-generated-periodic-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_REQUESTS as INITIAL_SYNC } from "./current-generated-initial-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_REQUESTS as INITIAL_CACHE } from "./current-generated-initial-cache-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as PRODUCER } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS as TRANSPORT } from "./current-project-structure-transport-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS as ACCESSORS } from "./current-schematic-display-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS as CLOCK } from "./current-schematic-display-clock-protocol.ts";
/** Distinct original schematic display birth. Fixed navigation and source
 * read stages share this immutable budget; writer/Save grants stay separate. */
import { CURRENT_SCHEMATIC_DISPLAY_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS as SAVE } from "./current-schematic-display-save-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS as GUARD, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE = "schematic-display-write209";
export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE = Object.freeze({ purpose: CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-SchematicDisplayWrite209", main: Object.freeze({ normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ discovery: 16, navigationCalls: 2, stageCalls: 5, stageBrackets: 5 * 8, workerBootstrap: BOOTSTRAP.total, saveObservation: SAVE.total, structureObservation: STRUCTURE.cdpRequests, producerGuards: GUARD.cdpRequests, producerObservation: PRODUCER.cdpRequests, initialCache: INITIAL_CACHE.cdpRequests, initialSync: INITIAL_SYNC.cdpRequests, periodicSync: PERIODIC.cdpRequests, producerEnrollmentControls: GUARD.enrollmentControls, structureTransport: TRANSPORT.cdpRequests, structureTransportBindingControls: 1, clockObservation: CLOCK.total, accessorObservation: ACCESSORS.total, total: 16 + 2 + 5 + 5 * 8 + BOOTSTRAP.total + SAVE.total + STRUCTURE.cdpRequests + TRANSPORT.cdpRequests + GUARD.cdpRequests + PRODUCER.cdpRequests + INITIAL_CACHE.cdpRequests + INITIAL_SYNC.cdpRequests + PERIODIC.cdpRequests + CLOCK.total + ACCESSORS.total }), workerOwnershipIssued: false,
  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false });
export const CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);
