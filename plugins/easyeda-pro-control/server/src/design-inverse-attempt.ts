import { basename } from "node:path";
import type { ArtifactDescriptor } from "./artifacts.ts";

interface InverseJournal {
  readonly state: string;
  readonly orphanedCallPhase?: string | undefined;
  readonly inverseAttempted?: unknown;
  readonly artifacts: readonly ArtifactDescriptor[];
}

/** A retained inverse intent is consumed even if a later proof or runtime
 * rebind fails. Historical preparation/return evidence is also one-shot.
 * There is deliberately no automatic retry exception or new recovery write.
 */
export function hasDesignInverseAttempt(journal: InverseJournal): boolean {
  if (journal.inverseAttempted !== undefined && journal.inverseAttempted !== true) {
    throw new Error("Design inverse-attempt marker is malformed.");
  }
  return journal.inverseAttempted === true || journal.orphanedCallPhase === "inverse" ||
    ["inverse-dispatching", "inverse-needs-recovery", "rolled-back"].includes(journal.state) ||
    journal.artifacts.some((entry) => /^[0-9]+-(?:design-inverse-intent|flat-inverse-prepared|inverse|inverse-upload-barrier|inverse-verified)\.json$/u.test(basename(entry.path)));
}
