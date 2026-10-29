/** Partial fixed main schedule, never a whole-writer reservation. The current
 * observation purpose cannot accommodate these already implemented units. */
import { CURRENT_FOOTPRINT_COMBINED_PROFILE as COMBINED } from "./current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS as REQUEST } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as COMPLETION } from "./current-footprint-copy-main-completion-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// Holding final PB omits exactly its resume and the request group's release.
// Completion owns both commands, so counting the full32-request collector
// Together with completion would charge those two commands twice.
const held = Object.freeze({ normal: REQUEST.normal, cleanup: REQUEST.cleanup - 2, total: REQUEST.total - 2 });
const minimumNormal = CONSTRUCTION.observeNormal + CONSTRUCTION.originIssueNormal + held.normal + COMPLETION.normal;
const minimumCleanup = CONSTRUCTION.observeCleanup + held.cleanup + COMPLETION.cleanup + CONSTRUCTION.releaseCleanup;

export const CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY = freezeDeep({
  profile: "private.current-footprint-copy-main-known-capacity.v1",
  construction: { normal: CONSTRUCTION.observeNormal, cleanup: CONSTRUCTION.observeCleanup, total: CONSTRUCTION.maximumObserve },
  originReproof: { normal: CONSTRUCTION.originIssueNormal, cleanup: 0, total: CONSTRUCTION.originIssueNormal },
  heldRequest: held,
  completion: COMPLETION,
  constructionRelease: { normal: 0, cleanup: CONSTRUCTION.releaseCleanup, total: CONSTRUCTION.releaseCleanup },
  minimumNormal, minimumCleanup, minimumTotal: minimumNormal + minimumCleanup,
  currentReservation: COMBINED.main,
  // Additional invocation, publication, output, native controls and inverse
  // Units remain absent. These minima cannot fill those unknown quantities.
  wholeWriterReserved: false, executionAuthorized: false,
} as const);

function refuse(code: string): never { throw new Error(`FOOTPRINT_MAIN_COMPLETION_CAPACITY_${code}`); }

/** Call using the original native owner's current counters BEFORE transferring
 * its held-PB authority. No caller can supply a larger reservation. This pure
 * check neither advances counters nor issues an origin, owner or native send.
 * Keep the original construction group's final release separately reserved. */
export function requireCurrentFootprintCopyMainCompletionHeadroom(requestId: number, normalConsumed: number, cleanupConsumed: number): void {
  const reservation = COMBINED.main;
  if (![requestId, normalConsumed, cleanupConsumed].every(value => Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0)) ||
    requestId !== normalConsumed + cleanupConsumed || requestId > reservation.requestLimit ||
    normalConsumed > reservation.normalRequestLimit || cleanupConsumed > reservation.cleanupRequestLimit) { refuse("COUNTERS"); }
  const cleanup = COMPLETION.cleanup + CONSTRUCTION.releaseCleanup, normal = COMPLETION.normal;
  if (normalConsumed + normal > reservation.normalRequestLimit || cleanupConsumed + cleanup > reservation.cleanupRequestLimit ||
    requestId + normal + cleanup > reservation.requestLimit) { refuse("HEADROOM"); }
}
