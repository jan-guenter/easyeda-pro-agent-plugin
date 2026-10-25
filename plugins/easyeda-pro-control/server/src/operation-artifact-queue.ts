import { OPERATION_HASH_STREAMS } from "./operation-verification-queue.ts";

interface ArtifactFailure { readonly index: number; readonly reason: unknown }

/** Keep phase verification moving when one descriptor takes longer. The caller
 * owns the fixed descriptor array and verifies every current byte and identity.
 * Stop scheduling after an observed failure, drain all started verifiers, then
 * report the earliest failing descriptor. This queue retains at most four
 * workers and one failure; it neither admits journals nor caches evidence.
 */
export async function verifyOperationArtifactQueue<T>(
  descriptors: readonly T[],
  verify: (descriptor: T) => Promise<void>,
): Promise<void> {
  const count = descriptors.length;
  let nextIndex = 0;
  const state: { failure: ArtifactFailure | undefined } = { failure: undefined };
  const recordFailure = (failure: ArtifactFailure): void => {
    if (state.failure === undefined || failure.index < state.failure.index) { state.failure = failure; }
  };
  const work = async (): Promise<void> => {
    while (state.failure === undefined && nextIndex < count) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        const descriptor = descriptors[index];
        if (descriptor === undefined) { throw new Error("Operation phase-artifact descriptor is missing."); }
        await verify(descriptor);
      } catch (error) { recordFailure({ index, reason: error }); }
    }
  };
  const workers = await Promise.allSettled(Array.from({ length: Math.min(OPERATION_HASH_STREAMS, count) }, work));
  for (const worker of workers) {
    if (worker.status === "rejected") { throw worker.reason; }
  }
  if (state.failure !== undefined) { throw state.failure.reason; }
}
