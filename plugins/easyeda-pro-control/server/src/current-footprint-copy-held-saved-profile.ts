/** Separate held-saved generation. Legacy saved353 remains unchanged; this
 * profile replaces its two generic cache reads with the complete held leaf.
 * Fixed data ceilings neither allocate a native owner nor authorize execution. */
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE as SAVED } from "./current-footprint-copy-saved-profile.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as HELD } from "./current-footprint-saved-cache-held-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const normal = SAVED.normalRequestLimit - SAVED.requests.uploadQueue + HELD.normal;
const cleanup = SAVED.requests.cleanup + HELD.cleanup;
export const CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE = freezeDeep({
  purpose: "worker-startup-footprint-held-saved209",
  normalRequestLimit: normal, cleanupRequestLimit: cleanup, requestLimit: normal + cleanup,
  // Cleanup may precede later normal opening/source work. Keep the normal
  // Request count distinct from the greatest physical normal ID.
  normalIdCeiling: normal + cleanup,
  requests: { startup: SAVED.requests.startup, parserConstruction: SAVED.requests.parserConstruction,
    initialState: SAVED.requests.initialState, savedSource: SAVED.requests.savedSource,
    heldCacheNormal: HELD.normal, heldCacheCleanup: HELD.cleanup, cleanup },
  stateSampleLimit: SAVED.stateSampleLimit,
  normalMilliseconds: SAVED.normalMilliseconds, cleanupMilliseconds: SAVED.cleanupMilliseconds,
  bytes: SAVED.bytes,
  createRequests: 0, transactionClockRequests: 0, parentChallengeRequests: 0, saveRequests: 0,
  executionAuthorized: false, saveAuthorized: false,
} as const);
