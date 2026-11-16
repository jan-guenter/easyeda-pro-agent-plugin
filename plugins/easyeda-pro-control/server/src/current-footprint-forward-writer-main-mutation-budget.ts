/** Fixed complete-only selected SQL continuation accounting. Raw Main output
 * remains under its existing cumulative ceilings; no new artifact is emitted. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_REQUESTS = Object.freeze({
  reads: 3, writes: 6, frames: 16, proofs: 9, captureReproofs: 6, resumes: 9,
  normal: 40, cleanup: 0, total: 40, controls: 80, pausedAndResumedEvents: 18, evaluationEvents: 31, events: 49,
  artifactBytes: 0, journalBytes: 0, retainedBytes: 0,
});
