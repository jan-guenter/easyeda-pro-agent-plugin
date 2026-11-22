/** New-profile-only immutable metadata fork from source commit
 * 9db9d91e2116b5c6cbc9475d7dd79b680ea8af88. Readable data only: no owner,
 * callback, issuer or runtime grant. Historical profiles remain independent. */
import {freezeDeep} from "./sqlite-inventory-core.ts";

/** Canonical metadata SHA-256 4d4c3d457999637ecc6c2c13a0fcc4d71760ea9fe9eae5b1f11bb2461e2003eb. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_COLD_UI_OPENING_BASE_PROFILE=freezeDeep({
  "purpose": "worker-startup-footprint-held-saved209",
  "normalRequestLimit": 328,
  "cleanupRequestLimit": 35,
  "requestLimit": 363,
  "normalIdCeiling": 363,
  "requests": {
    "startup": 224,
    "parserConstruction": 21,
    "initialState": 9,
    "savedSource": 63,
    "heldCacheNormal": 11,
    "heldCacheCleanup": 1,
    "cleanup": 35
  },
  "stateSampleLimit": 8,
  "normalMilliseconds": 3_600_000,
  "cleanupMilliseconds": 60_000,
  "bytes": 67_108_864,
  "createRequests": 0,
  "transactionClockRequests": 0,
  "parentChallengeRequests": 0,
  "saveRequests": 0,
  "executionAuthorized": false,
  "saveAuthorized": false
} as const);

/** Canonical metadata SHA-256 0a6f761b68ec4511ed36f1413a2c111d29768c35fe527faec3d40deb5bd8fb01. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_COLD_UI_COORDINATOR_LIMITS=freezeDeep({
  "generations": 2,
  "createAttempts": 1,
  "explicitSaveAttempts": 0,
  "normalCloseAttemptsPerGeneration": 1,
  "terminationObservationsPerGeneration": 240,
  "journalRecords": 32,
  "milliseconds": 3_600_000,
  "releaseObservationsPerGeneration": 240,
  "nativeExecutionMounted": false,
  "wholeNativeBudgetReserved": false
} as const);
