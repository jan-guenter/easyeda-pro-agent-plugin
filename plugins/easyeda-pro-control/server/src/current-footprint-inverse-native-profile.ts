/* oxlint-disable import/max-dependencies -- This sole inverse reservation composes every independently bounded lane rather than duplicating native limits. */
import{CURRENT_FOOTPRINT_INVERSE_DELETE_PREFIX_REQUESTS as DELETE_PREFIX}from"./current-footprint-inverse-delete-prefix-protocol.ts";

import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_PROGRESS_REQUESTS as REFERENCE_PROGRESS}from"./current-footprint-inverse-reference-progress-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_RESULT_REQUESTS as REFERENCE_RESULT}from"./current-footprint-inverse-reference-result-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_SEND_REQUESTS as REFERENCE_SEND}from"./current-footprint-inverse-reference-send-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_MAXIMUM as REFERENCE_WORKER } from "./current-footprint-inverse-reference-worker-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_CALLBACK_REQUESTS as REFERENCE_CALLBACK}from"./current-footprint-inverse-reference-callback-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_DISPATCH_REQUESTS as REFERENCE_DISPATCH}from"./current-footprint-inverse-reference-dispatch-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_UI_REQUESTS as REFERENCE_UI}from"./current-footprint-inverse-reference-ui-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_ENTRY_REQUESTS as REFERENCE_ENTRY}from"./current-footprint-inverse-reference-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RESULT_REQUESTS as GET_RESULT } from "./current-footprint-inverse-get-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_SEND_REQUESTS as GET_SEND } from "./current-footprint-inverse-get-send-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_CALLBACK_REQUESTS as GET_CALLBACK } from "./current-footprint-inverse-get-callback-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_MANAGER_REQUESTS as GET_MANAGER } from "./current-footprint-inverse-get-manager-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_REQUESTS as GET_FORWARDING } from "./current-footprint-inverse-get-forwarding-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_REQUESTS as GET_INTRINSICS } from "./current-footprint-inverse-get-intrinsics-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RPC_ENTRY_REQUESTS as GET_RPC_ENTRY } from "./current-footprint-inverse-get-rpc-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_MAXIMUM as GET_COMPLETION } from "./current-footprint-inverse-get-completion-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_REQUESTS as GET_NATIVE } from "./current-footprint-inverse-get-native-delivery-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_REQUESTS as GET_WORKER } from "./current-footprint-inverse-get-worker-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_REQUESTS as LOOKUP_PREENTRY } from "./current-footprint-inverse-lookup-preentry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_REQUESTS as NATIVE_DELIVERY } from "./current-footprint-inverse-native-delivery-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_CHANNEL_REQUESTS as NATIVE_CHANNEL } from "./current-footprint-inverse-native-channel-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_UI_OWN_DATA_REQUESTS as UI_OWN_DATA } from "./current-footprint-inverse-ui-own-data-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_OWN_DATA_REQUESTS as OWN_DATA } from "./current-footprint-inverse-own-data-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_WORKER_PEER_REQUESTS as WORKER_PEER } from "./current-footprint-inverse-delete-worker-peer-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_REQUESTS as PUBLIC_PREFERENCES } from "./current-footprint-inverse-public-preferences-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_REQUESTS as PUBLIC_CALL } from "./current-footprint-inverse-public-call-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_REQUESTS as DELETE_JOB } from "./current-footprint-inverse-delete-job-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_REQUESTS as DELETE_RPC } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_REQUESTS as CLOCK_WORKER } from "./current-footprint-inverse-clock-worker-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_REQUESTS as PUBLIC_SERVICE } from "./current-footprint-inverse-public-service-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_REQUESTS as PUBLIC_API } from "./current-footprint-inverse-public-api-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_REQUESTS as DELETE_ENCODER } from "./current-footprint-inverse-delete-encoder-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_BINDING_REQUESTS as DELETE_BINDING } from "./current-footprint-inverse-delete-binding-protocol.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as LIBRARY } from "./current-project-library-refresh-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_REQUESTS as MODEL } from "./current-footprint-inverse-model-step-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_NATIVE_REQUESTS as INITIAL_SYNC } from "./current-footprint-inverse-initial-sync-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_REQUESTS as DELETE_ENTRY } from "./current-footprint-inverse-delete-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_REQUESTS as INITIAL_CACHE } from "./current-footprint-inverse-initial-cache-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as INITIAL_HISTORY } from "./current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_CONDITION_SOURCE_REQUESTS as CONDITIONS } from "./current-footprint-inverse-condition-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_REQUESTS as QUEUE, CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_REQUESTS as STARTUP } from "./current-footprint-inverse-startup-callback-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS as TIMER } from "./current-footprint-inverse-timer-budget.ts";
import { CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_REQUESTS as COLD, CURRENT_FOOTPRINT_INVERSE_COLD_STEP_REQUESTS as STEP } from "./current-footprint-inverse-cold-load-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as PRODUCER } from "./current-footprint-inverse-producer-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS as CACHE } from "./current-footprint-inverse-cache-wire.ts";
/** Separate third-generation source-held prefix. Original registration and
 * discovery and original readonly reference continuations are admitted; deletion and Save remain closed. */
import { CURRENT_FOOTPRINT_INVERSE_CONSTRUCTION_REQUESTS as CONSTRUCTION } from "./current-footprint-inverse-construction-protocol.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as REGISTRATION, CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES as REGISTRATION_SITES } from "./current-saved-project-registration-config-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as WORKER } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
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
const renderer = sourceHeldPrefix + CONSTRUCTION.cdpRequests + CACHE.total + PRODUCER.cdpRequests + COLD.total + 1 + STEP.maximum + STARTUP.cdpRequests + CONDITIONS.reads + TIMER.direct + QUEUE.cdpRequests + INITIAL_CACHE.cdpRequests + INITIAL_SYNC.cdpRequests + MODEL.cdpRequests + LIBRARY.total + DELETE_BINDING.cdpRequests + DELETE_ENCODER.cdpRequests + PUBLIC_API.cdpRequests + CLOCK_WORKER.cdpRequests + PUBLIC_SERVICE.cdpRequests + DELETE_ENTRY.cdpRequests + PUBLIC_CALL.cdpRequests + DELETE_RPC.cdpRequests + DELETE_JOB.cdpRequests + WORKER_PEER.cdpRequests + PUBLIC_PREFERENCES.cdpRequests + OWN_DATA.cdpRequests + NATIVE_CHANNEL.cdpRequests + UI_OWN_DATA.cdpRequests + LOOKUP_PREENTRY.cdpRequests + NATIVE_DELIVERY.cdpRequests + GET_INTRINSICS.cdpRequests + GET_WORKER.cdpRequests + GET_RPC_ENTRY.cdpRequests + GET_FORWARDING.cdpRequests + GET_SEND.cdpRequests + GET_CALLBACK.cdpRequests + GET_MANAGER.cdpRequests + GET_NATIVE.cdpRequests + GET_COMPLETION.cdpRequests + GET_RESULT.cdpRequests + REFERENCE_ENTRY.cdpRequests + REFERENCE_UI.cdpRequests + REFERENCE_DISPATCH.cdpRequests + REFERENCE_CALLBACK.cdpRequests + REFERENCE_WORKER.cdpRequests + 3 * REFERENCE_SEND.cdpRequests + REFERENCE_PROGRESS.cdpRequests + REFERENCE_RESULT.cdpRequests + DELETE_PREFIX.cdpRequests;
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
  "footprint-inverse-model-step": MODEL.controls, "footprint-inverse-initial-sync": INITIAL_SYNC.controls, "footprint-inverse-initial-cache": INITIAL_CACHE.controls, "footprint-inverse-startup-queue": QUEUE.controls, "footprint-inverse-condition-source":CONDITIONS.controls, "footprint-inverse-startup-callback":STARTUP.controls, "footprint-inverse-cold-step":STEP.maximum, "footprint-inverse-startup":1, "footprint-inverse-cold": COLD.total + 2 + COLD.pauses, "footprint-inverse-producer-arm": PRODUCER.cdpRequests, "footprint-inverse-actors": 3, "footprint-inverse-parent": 1, "footprint-inverse-worker-bind": 1,
  "footprint-inverse-main-history": INITIAL_HISTORY.repetitions * INITIAL_HISTORY.total,
  "footprint-inverse-timer": TIMER.directControls, "footprint-inverse-library-refresh":LIBRARY.controls,"footprint-inverse-delete-bindings":DELETE_BINDING.controls,"footprint-inverse-delete-encoder":DELETE_ENCODER.controls,"footprint-inverse-public-api":PUBLIC_API.controls,"footprint-inverse-clock-worker":CLOCK_WORKER.controls,"footprint-inverse-delete-entry":DELETE_ENTRY.controls,"footprint-inverse-public-service":PUBLIC_SERVICE.controls,"footprint-inverse-public-call":PUBLIC_CALL.controls,"footprint-inverse-public-preferences":PUBLIC_PREFERENCES.controls,"footprint-inverse-delete-rpc":DELETE_RPC.controls,"footprint-inverse-delete-job":DELETE_JOB.controls,"footprint-inverse-delete-worker-peer":WORKER_PEER.controls,"footprint-inverse-own-data":OWN_DATA.controls,"footprint-inverse-native-channel":NATIVE_CHANNEL.controls,"footprint-inverse-ui-own-data":UI_OWN_DATA.controls,"footprint-inverse-lookup-preentry":LOOKUP_PREENTRY.controls,"footprint-inverse-native-delivery":NATIVE_DELIVERY.controls,
  "footprint-inverse-get-intrinsics": GET_INTRINSICS.controls,
  "footprint-inverse-get-worker": GET_WORKER.controls,
  "footprint-inverse-get-rpc-entry": GET_RPC_ENTRY.controls,
  "footprint-inverse-get-forwarding": GET_FORWARDING.controls,
  "footprint-inverse-get-manager": GET_MANAGER.controls,
  "footprint-inverse-get-callback": GET_CALLBACK.controls,
  "footprint-inverse-reference-callback":REFERENCE_CALLBACK.controls,
  "footprint-inverse-reference-dispatch":REFERENCE_DISPATCH.controls,
  "footprint-inverse-reference-ui":REFERENCE_UI.controls,
  "footprint-inverse-reference-progress":REFERENCE_PROGRESS.controls,"footprint-inverse-reference-result":REFERENCE_RESULT.controls,
  "footprint-inverse-reference-send":3 * REFERENCE_SEND.controls,
  "footprint-inverse-delete-prefix":DELETE_PREFIX.controls,
  "footprint-inverse-reference-entry": REFERENCE_ENTRY.controls,
  "footprint-inverse-reference-worker": REFERENCE_WORKER.controls,
  "footprint-inverse-get-result": GET_RESULT.controls,
  "footprint-inverse-get-send": GET_SEND.controls,
  "footprint-inverse-get-native": GET_NATIVE.controls,
  "footprint-inverse-get-completion": GET_COMPLETION.controls,
  "footprint-inverse-worker": WORKER.totalUntilProjectHeld, "footprint-inverse-construction": CONSTRUCTION.controls, "footprint-inverse-source-bind": 1, "footprint-inverse-project": 1,
});
const controls = Object.values(CURRENT_FOOTPRINT_INVERSE_ACTION_LIMITS).reduce((sum, limit) => sum + limit, 0);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE, nativeSwitch: "-FootprintInverse209",
  main: Object.freeze({ constructionNormal: MAIN.normalRequests, fenceNormal: FENCE.normal,
    registrationNormal: REGISTRATION, initialHistory: INITIAL_HISTORY, normal: mainNormal, cleanup: mainCleanup, total: mainNormal + mainCleanup,
    reproofs: mainReproofs, polls: MAIN.totalPolls }),
  renderer: Object.freeze({ discovery, emptyGuard, generic, registration, parent, projectOpening, sourceHeldPrefix, construction: CONSTRUCTION.cdpRequests, producerArm: PRODUCER, libraryRefresh:LIBRARY,deleteBindings:DELETE_BINDING,deleteEncoder:DELETE_ENCODER,publicApi:PUBLIC_API,clockWorker:CLOCK_WORKER,deleteEntry:DELETE_ENTRY,publicService:PUBLIC_SERVICE,publicCall:PUBLIC_CALL,publicPreferences:PUBLIC_PREFERENCES,deleteRpc:DELETE_RPC,deleteJob:DELETE_JOB,workerPeer:WORKER_PEER,ownData:OWN_DATA,nativeChannel:NATIVE_CHANNEL,nativeDelivery:NATIVE_DELIVERY,uiOwnData:UI_OWN_DATA,lookupPreentry:LOOKUP_PREENTRY,getIntrinsics:GET_INTRINSICS,getWorker:GET_WORKER,getRpcEntry:GET_RPC_ENTRY,getForwarding:GET_FORWARDING,getSend:GET_SEND,getCallback:GET_CALLBACK,getManager:GET_MANAGER,getNative:GET_NATIVE,getCompletion:GET_COMPLETION,getResult:GET_RESULT,deletePrefix:DELETE_PREFIX,referenceProgress:REFERENCE_PROGRESS,referenceResult:REFERENCE_RESULT,referenceSend:REFERENCE_SEND,referenceWorker:REFERENCE_WORKER,referenceEntry:REFERENCE_ENTRY,referenceUi:REFERENCE_UI,referenceDispatch:REFERENCE_DISPATCH, cold: COLD, cache: CACHE, sourceHeldBootstrap: WORKER.totalUntilProjectHeld, total: renderer, polls: rendererPolls }), controls,
  completeInverseReserved: false, deleteInvocationAuthorized: false, executionAuthorized: false, saveAuthorized: false,
});
export const CURRENT_FOOTPRINT_INVERSE_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);

export { currentFootprintInverseInitialCacheNativeSource } from "./current-footprint-inverse-initial-cache-native.ts";

export { currentFootprintInverseInitialSyncNativeSource } from "./current-footprint-inverse-initial-sync-native.ts";

export { currentFootprintInverseModelStepNativeSource } from "./current-footprint-inverse-model-step-native.ts";
