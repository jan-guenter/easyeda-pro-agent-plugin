/** Fixed209 actor availability cap, not a promise that every nested deadline
 * fits. The mounted stage reserves35 native requests; each keeps its2s leaf
 * limit. This allocation borrows the complete stage budget but enforcement
 * spans only four samples and their nine original-assignment checks. Those
 * checks share the70s cap; opening prelude, wrapper and publication reproofs
 * retain their existing deadlines outside this collection timer.
 * Legacy packets and their10s paired-Date interpretation remain unchanged. */
const requestMs = 2000;
//26 requests in the four-sample collector,3 opening prelude,2 wrapper reproof,
//4 publication reproof. This caps availability rather than adding allowances
//For every nested owner check; severe overhead must still refuse the stage.
const nativeRequests = 26 + 3 + 2 + 4;
export const CURRENT_PCB_209_STARTUP_ACTOR_TIMING = Object.freeze({
  profile: "private.current-pcb209-startup-actor-timing.v1",
  requestMs, nativeRequests, collectionMs: nativeRequests * requestMs,
} as const);
