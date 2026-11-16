/** V4-only finite caller subtotal. No prior owner/profile receives these
 * slots, and a budget alone supplies no original event or readiness grant.
 *
 * Prearm:51 normal +12 helper-source reads +11 arms =74.
 * Cursor:81 normal (19 worker,62 UI) +37 helpers; five UI promises can each
 * require one extra pending pass. Runtime:one nested return arm,12 removals,
 * 10 actual resumes. Classifier:at most16 original full-source candidates,
 * including the separate duplicate checks of Clock6 and drain2 predicates.
 * Unknown/repeated excess compilation refuses; no engine cache is assumed. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_REQUESTS=Object.freeze({
 prepareNormal:62,prepareHelpers:12,prepareRequests:74,
 cursorNormal:81,cursorHelpers:37,pendingPromisePasses:5,
 normal:175,cleanup:12,helpers:49,cdpRequests:236,minimumRequests:215,
 candidateSources:16,resumes:10,points:12,events:89,controls:25,
 nativeActions:236+25,sourceReproofs:236,
 publicSdkParity:false,preferencesReserved:false,persistenceReserved:false,coldAbsenceReserved:false,wholeInverseReserved:false,
});

/** A single source read can defer original frames from every already bounded
 * downstream reader. This is scheduling capacity, not extra renderer events:
 * Clock45 + serialization34 + publication4 + segments4 + local74 + upload18
 * + methodReturn7 + drain171 + caller89. A coalesced transport chunk does not
 * imply a microtask between its original event frames. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROUTER_MAXIMUM_EVENTS=45+34+4+4+74+18+7+171+89;
