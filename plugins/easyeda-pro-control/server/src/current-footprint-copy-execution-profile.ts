/** Separate native launch for the execution integration. Counts cover only
 * mounted commands; absent backend/create/saved routes cannot borrow these
 * reservations or claim a complete writer budget. */
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS } from "./current-footprint-copy-transaction-clock.ts";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING } from "./current-footprint-copy-parser-construction.ts";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS } from "./current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS } from "./current-footprint-copy-parent-worker-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS } from "./current-footprint-copy-manager-route-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS } from "./current-footprint-copy-clock-registration-runner.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES } from "./current-footprint-copy-destination-profiles.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const transactionClockCleanup = 5;
const cacheConstructionNative = CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.total + CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.reproof;
const cacheConstructionCleanup = CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS.release;
const cacheConstruction = cacheConstructionNative - cacheConstructionCleanup;
// The opening delegate reproves project identity twice and assignments once.
const cacheConstructionDelegates = 3;
const construction = CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING.captureRequests - 55;
const asyncAndHandoff = 19 + 6 + 1;
// Each selected method/class has one metadata read, eight shared capture
// Requests, two original-owner checks and five original reproof requests.
const destinations = CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES.length + 8 + 2 + 5;
const parentConstruction = CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS;
const parentPeer = CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS;
const parentNormal = parentConstruction.arm + parentConstruction.capture + parentConstruction.resume + parentPeer.observe +
  parentPeer.reprove + CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.originalPeerJoin;
const parentCleanup = parentConstruction.release + parentPeer.cleanup;
const clockRegistrationNative = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.total;
const clockRegistrationCleanup = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.release;
const clockRegistration = clockRegistrationNative - clockRegistrationCleanup;
export const CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE = freezeDeep({
  purpose: "worker-startup-footprint-copy209",
  normalRequestLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit + construction + asyncAndHandoff + destinations + parentNormal + cacheConstruction + cacheConstructionDelegates + clockRegistration + CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS - transactionClockCleanup,
  requestLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requestLimit + construction + asyncAndHandoff + destinations + parentNormal + parentCleanup + cacheConstructionNative + cacheConstructionDelegates + clockRegistrationNative + CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS,
  requests: { preparation: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit,
    construction, asyncAndHandoff, destinations, parentNormal, cacheConstruction, cacheConstructionNative, cacheConstructionDelegates, clockRegistration, clockRegistrationNative,
    parentNative: parentConstruction.arm + parentConstruction.capture + parentConstruction.resume + parentConstruction.release +
      parentPeer.observe + 2 * parentPeer.reprove + parentPeer.managerJoin + parentPeer.cleanup,
    transactionClock: CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_REQUESTS - transactionClockCleanup,
    cleanup: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.cleanup + transactionClockCleanup + parentCleanup + cacheConstructionCleanup + clockRegistrationCleanup },
  stateSampleLimit: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.stateSampleLimit,
  normalMilliseconds: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalMilliseconds,
  cleanupMilliseconds: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.cleanupMilliseconds,
  bytes: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.bytes,
  wholeExecutionBudgetReserved: false, nativeCreateMounted: false, savedGenerationMounted: false,
  executionAuthorized: false, saveAuthorized: false,
} as const);
