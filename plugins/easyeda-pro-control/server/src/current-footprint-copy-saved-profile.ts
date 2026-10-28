/** Independent saved-generation request envelope. A writer or preparation
 * owner cannot acquire these slots, and normal work cannot consume cleanup. */
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING } from "./current-footprint-copy-parser-construction.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS } from "./current-footprint-copy-source-read-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const startup = 224;
const parserConstruction = CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING.captureRequests - 55;
const initialState = 2 * 3 + 3;
const savedSource = CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS - 2;
const cleanup = 32 + 2, uploadQueue = 2;
/** The224-slot original startup envelope includes initial browser/UI attachment,
 * source/bootstrap, nine construction pauses and assignment qualification.
 * Add the two parser pauses, two initial state samples and three opening
 * delegates, then the63-request method/factory +four-state/two-source bracket
 * with its two opening delegates (the generic source stage has four). Two UI
 * cache probes share the same CDP counter. Two extra breakpoint removals extend
 * the32-slot cleanup reserve; no new manager or parent-challenge group exists. */
export const CURRENT_FOOTPRINT_COPY_SAVED_PROFILE = freezeDeep({
  purpose: "worker-startup-footprint-saved209",
  normalRequestLimit: startup + parserConstruction + initialState + savedSource + uploadQueue,
  requestLimit: startup + parserConstruction + initialState + savedSource + uploadQueue + cleanup,
  requests: { startup, parserConstruction, initialState, savedSource, uploadQueue, cleanup },
  stateSampleLimit: 2 + 2 + 4,
  normalMilliseconds: 60 * 60 * 1000, cleanupMilliseconds: 60 * 1000,
  bytes: 64 * 1024 * 1024,
  createRequests: 0, transactionClockRequests: 0, parentChallengeRequests: 0, saveRequests: 0,
  executionAuthorized: false, saveAuthorized: false,
} as const);
