/** Source-derived shared native request reservation. Qualification uses3 prior
 * state requests,19 method/factory descriptor reads and5 final state requests.
 * Four source bracket states use5 requests each. Each source read uses
 * 2 assignment +4 method/factory rechecks +1 async read. Each opening delegate
 * adds a project-identity read and an assignment recheck. The32 cleanup slots
 * remain separate. This leaf can enter native profiles without importing the
 * source reader's project/model graph. */
export const CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS = 3 + 19 + 5 + 4 * 5 + 2 * 7 + 2 * 2;
