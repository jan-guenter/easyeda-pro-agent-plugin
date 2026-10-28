/** Separate native launch for the execution integration. Counts cover only
 * mounted commands; absent backend/create/saved routes cannot borrow these
 * reservations or claim a complete writer budget. */
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS } from "./current-footprint-copy-transaction-clock.ts";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING } from "./current-footprint-copy-parser-construction.ts";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS } from "./current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS } from "./current-footprint-copy-parent-worker-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS } from "./current-footprint-copy-manager-route-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const transactionClockCleanup = 5;
const construction = CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING.captureRequests - 55;
const asyncAndHandoff = 19 + 6 + 1;
const destinations = 38 + 5;
const parentConstruction = CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS;
const parentPeer = CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS;
const parentNormal = parentConstruction.arm + parentConstruction.capture + parentConstruction.resume + parentPeer.observe +
  parentPeer.reprove + CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.originalPeerJoin;
const parentCleanup = parentConstruction.release + parentPeer.cleanup;
export const CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE = freezeDeep({
  purpose: "worker-startup-footprint-copy209",
  normalRequestLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit + construction + asyncAndHandoff + destinations + parentNormal + CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS - transactionClockCleanup,
  requestLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requestLimit + construction + asyncAndHandoff + destinations + parentNormal + parentCleanup + CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS,
  requests: { preparation: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit,
    construction, asyncAndHandoff, destinations, parentNormal,
    parentNative: parentConstruction.arm + parentConstruction.capture + parentConstruction.resume + parentConstruction.release +
      parentPeer.observe + 2 * parentPeer.reprove + parentPeer.managerJoin + parentPeer.cleanup,
    transactionClock: CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS - transactionClockCleanup,
    cleanup: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.cleanup + transactionClockCleanup + parentCleanup },
  stateSampleLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.stateSampleLimit,
  normalMilliseconds: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalMilliseconds,
  cleanupMilliseconds: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.cleanupMilliseconds,
  bytes: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.bytes,
  wholeExecutionBudgetReserved: false, nativeCreateMounted: false, savedGenerationMounted: false,
  executionAuthorized: false, saveAuthorized: false,
} as const);
