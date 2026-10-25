/** Shared by journal scheduling and the managed-file semaphore. The queue
 * changes scheduling only; every verifier still checks current complete bytes.
 */
export const OPERATION_HASH_STREAMS = 4;

/** Keep four journal verifiers working without waiting for a fixed group of
 * four to finish. Results retain input order. No caller projection or cold
 * parsing runs here, and all scheduled work settles before this returns. Bind
 * the caller's bounded candidate map before any await: concurrent scans must
 * not add more retained candidates as this queue advances.
 */
export async function settleOperationVerifications<T, Candidate>(
  operationIds: readonly string[],
  candidates: ReadonlyMap<string, Candidate> | undefined,
  verify: (operationId: string, candidate: Candidate | undefined) => Promise<T>,
): Promise<PromiseSettledResult<T>[]> {
  const ids = [...operationIds];
  const snapshot = new Map(candidates);
  const results: PromiseSettledResult<T>[] = [];
  let nextIndex = 0;
  const work = async (): Promise<void> => {
    while (nextIndex < ids.length) {
      const index = nextIndex;
      nextIndex += 1;
      const operationId = ids[index];
      if (operationId === undefined) { throw new Error("Operation verification identity is missing."); }
      try { results[index] = { status: "fulfilled", value: await verify(operationId, snapshot.get(operationId)) }; }
      catch (error) { results[index] = { status: "rejected", reason: error }; }
    }
  };
  const workers = await Promise.allSettled(Array.from({ length: Math.min(OPERATION_HASH_STREAMS, ids.length) }, work));
  for (const worker of workers) {
    if (worker.status === "rejected") { throw worker.reason; }
  }
  if (results.length !== ids.length || ids.some((_id, index) => results[index] === undefined)) {
    throw new Error("Operation verification queue is incomplete.");
  }
  return results;
}
