/** Observed native roster and the separate held-cache leaf's complete phase budget.
 * This is not a saved353 profile, native owner permit or public execution route.
 */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_GROUP = "easyeda-saved-cache-held-v1";
export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE = freezeDeep({
  protocolVersion: "1.3", product: "Chrome/146.0.7680.188", revision: "@6c5909a6912f2a8f33135ac7443f5c8a2c19e177",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) EasyEDAPro/3.2.209.8a704eab Chrome/146.0.7680.188 Electron/41.2.1-jlc-sa-win-x64.6 Safari/537.36",
  jsVersion: "14.6.202.33",
} as const);
export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_DESCRIPTORS = freezeDeep({
  globalConstructor: { writable: true, enumerable: false, configurable: true },
  constructorPrototype: { writable: false, enumerable: false, configurable: false },
  prototypeConstructor: { writable: true, enumerable: false, configurable: true },
  match: { writable: true, enumerable: true, configurable: true },
  globalAccessor: { enumerable: true, configurable: true, hasGetter: true, hasSetter: false },
} as const);
const capture = 1;
const tupleMetadata = 1;
const functionMetadata = 3;
const preGetterRecheck = 1;
const retainReceiver = 1;
const observations = 2;
const observationRequests = 1;
const postObservationRecheck = 1;
const cleanup = 1;
const normal = capture + tupleMetadata + functionMetadata + preGetterRecheck + retainReceiver +
  observations * (observationRequests + postObservationRecheck), replyBytes = 32_768;
export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS = freezeDeep({
  normal, cleanup,
  requests: { capture, tupleMetadata, functionMetadata, preGetterRecheck, retainReceiver,
    observations, observationRequests, postObservationRecheck, cleanup },
  replyBytes, aggregateReplyBytes: (normal + cleanup) * replyBytes, requestMilliseconds: 15_000,
  executionAuthorized: false, replayTokenIssued: false,
} as const);
