import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as INITIAL_HISTORY } from "./current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_CONDITION_SOURCE_REQUESTS as CONDITIONS } from "./current-footprint-inverse-condition-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_REQUESTS as QUEUE, CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_REQUESTS as STARTUP } from "./current-footprint-inverse-startup-callback-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS as TIMER } from "./current-footprint-inverse-timer-budget.ts";
import { CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_REQUESTS as COLD, CURRENT_FOOTPRINT_INVERSE_COLD_STEP_REQUESTS as STEP } from "./current-footprint-inverse-cold-load-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as PRODUCER } from "./current-footprint-inverse-producer-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS as CACHE } from "./current-footprint-inverse-cache-wire.ts";
/** Separate third-generation source-held prefix. Original registration and
 * discovery are admitted; producer/delete/Save continuations remain closed. */
import { CURRENT_FOOTPRINT_INVERSE_CONSTRUCTION_REQUESTS as CONSTRUCTION } from "./current-footprint-inverse-construction-protocol.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as REGISTRATION, CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES as REGISTRATION_SITES } from "./current-saved-project-registration-config-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as WORKER } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
// oxlint-disable-next-line import/max-dependencies -- This one inverse reservation derives every original phase and Main reproof from its owning contract rather than duplicating constants.
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "./current-footprint-copy-main-transport-contract.ts";

export { currentFootprintInverseColdLoadNativeSource } from "./current-footprint-inverse-cold-load-native.ts";
export { currentFootprintInverseNoPublicationNativeSource } from "./current-footprint-inverse-no-publication-native.ts";
export { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS, currentFootprintInverseProducerArmOrder } from "./current-footprint-inverse-producer-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE = "footprint-inverse209";
const mainCleanup = MAIN.cleanupRequests + INITIAL_HISTORY.repetitions * INITIAL_HISTORY.cleanup, mainNormal = MAIN.normalRequests + FENCE.normal + REGISTRATION + INITIAL_HISTORY.repetitions * INITIAL_HISTORY.normal;
const discovery = 16, emptyGuard = 9 + 1, parent = 3 + 1, projectOpening = 9 + 1, registration = 2;
const generic = discovery + 2 * 8 + 3 + 4;
const sourceHeldPrefix = discovery + emptyGuard + registration + parent + WORKER.totalUntilProjectHeld + projectOpening;
const renderer = sourceHeldPrefix + CONSTRUCTION.cdpRequests + CACHE.total + PRODUCER.cdpRequests + COLD.total + 1 + STEP.maximum + STARTUP.cdpRequests + CONDITIONS.reads + TIMER.direct + QUEUE.cdpRequests;
// One finite renderer poll lane, paired with the existing original-main poll
// Envelope. A consumed failure does not replenish this reservation.
const rendererPolls = MAIN.totalPolls;
// MainRunner.#request has two reproofs per command; the fixed selected request
// Reader adds two around its subset of FENCE commands. #pumpOriginal adds two
// Per main poll. pumpSelectedSqlFence adds one per renderer polling iteration;
// A failed iteration may precede its poll, bounded by the renderer command IDs.
// Two post-construction guards and registration's lazy-import/initial/three-site
// Guards are the only additional reachable native reproofs in this prefix.
const mainReproofs = 2 * (mainNormal + mainCleanup) + 2 * FENCE.normal + 2 * MAIN.totalPolls + rendererPolls + renderer + 2 + 2 + REGISTRATION_SITES.length;
export const CURRENT_FOOTPRINT_INVERSE_ACTION_LIMITS = Object.freeze({
  identity: 2, launch: 1, send: generic, poll: rendererPolls, window: 240, termination: 240,
  "normal-close": 1, release: 1, "release-unlaunched": 1, "no-process-proof": 1, "release-no-process": 1,
  "main-attach": 1, "main-reprove": mainReproofs, "main-send": MAIN.normalRequests + FENCE.normal + REGISTRATION + MAIN.cleanupRequests, "main-poll": MAIN.totalPolls,
  "footprint-inverse-abort": 1, "footprint-inverse-preflight": 1, "footprint-inverse-register": 1,
  "footprint-inverse-cache-guard": 1, "footprint-inverse-cache-enroll": 1, "footprint-inverse-cache-delete-guard": 2, "footprint-inverse-cache-loading-guard": 1, "footprint-inverse-cache-invalidate": CACHE.invalidation, "footprint-inverse-cache": CACHE.cacheNormal + CACHE.cacheCleanup, "footprint-inverse-cache-metadata": CACHE.metadataNormal + CACHE.metadataCleanup,
  "footprint-inverse-startup-queue": QUEUE.controls, "footprint-inverse-condition-source":CONDITIONS.controls, "footprint-inverse-startup-callback":STARTUP.controls, "footprint-inverse-cold-step":STEP.maximum, "footprint-inverse-startup":1, "footprint-inverse-cold": COLD.total + 2 + COLD.pauses, "footprint-inverse-producer-arm": PRODUCER.cdpRequests, "footprint-inverse-actors": 3, "footprint-inverse-parent": 1, "footprint-inverse-worker-bind": 1,
  "footprint-inverse-main-history": INITIAL_HISTORY.repetitions * INITIAL_HISTORY.total,
  "footprint-inverse-timer": TIMER.directControls,
  "footprint-inverse-worker": WORKER.totalUntilProjectHeld, "footprint-inverse-construction": CONSTRUCTION.controls, "footprint-inverse-source-bind": 1, "footprint-inverse-project": 1,
});
const controls = Object.values(CURRENT_FOOTPRINT_INVERSE_ACTION_LIMITS).reduce((sum, limit) => sum + limit, 0);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE, nativeSwitch: "-FootprintInverse209",
  main: Object.freeze({ constructionNormal: MAIN.normalRequests, fenceNormal: FENCE.normal,
    registrationNormal: REGISTRATION, initialHistory: INITIAL_HISTORY, normal: mainNormal, cleanup: mainCleanup, total: mainNormal + mainCleanup,
    reproofs: mainReproofs, polls: MAIN.totalPolls }),
  renderer: Object.freeze({ discovery, emptyGuard, generic, registration, parent, projectOpening, sourceHeldPrefix, construction: CONSTRUCTION.cdpRequests, producerArm: PRODUCER, cold: COLD, cache: CACHE, sourceHeldBootstrap: WORKER.totalUntilProjectHeld, total: renderer, polls: rendererPolls }), controls,
  completeInverseReserved: false, deleteInvocationAuthorized: false, executionAuthorized: false, saveAuthorized: false,
});
export const CURRENT_FOOTPRINT_INVERSE_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);
