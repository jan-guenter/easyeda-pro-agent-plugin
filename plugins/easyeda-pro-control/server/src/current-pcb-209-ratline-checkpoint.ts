import { canonicalJson } from "./core.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";

type Checkpoint = Readonly<{
  checkpoint: Pick<CurrentDisposableOpenCheckpoint["checkpoint"], "checkpoint" | "checkpointSha256" | "sourceSha256">;
  targetEvidence: CurrentDisposableOpenCheckpoint["targetEvidence"];
}>;

// Exact stored physical families only. PRIMITIVE visibility/pick settings and
// NET/PAD_NET metadata are deliberately not evidence of a physical object.
// This subset rejects known population; its absence proves no empty baseline.
const physical = new Set(["COMPONENT", "LINE", "ARC", "PAD", "VIA", "TEARDROP", "POUR", "POLY", "POURED"]);

/** Negative eligibility filter for the empty-only ratline diagnostic. Reads only
 * the original completed checkpoint, never the current project. A return grants
 * no live state, empty baseline, navigation or execution authority. Unsupported
 * history still refuses through the maintained complete history reader. */
export async function rejectCurrentPcb209RatlineCheckpointPopulation(input: Checkpoint): Promise<void> {
  const original = canonicalJson(input), retained = structuredClone(input);
  const { checkpoint, targetEvidence: evidence } = retained;
  if (checkpoint.checkpointSha256 !== evidence.checkpointSha256 || checkpoint.sourceSha256 !== evidence.sourceSha256 || evidence.docType !== "PCB") {
    throw new Error("PCB209_RATLINE_CHECKPOINT_BINDING");
  }
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: evidence.projectUuid, libraryAtomHeaders: "preserve" });
  const matches = history.documents.filter(document => document.uuid === evidence.documentUuid);
  const document = matches[0];
  if (canonicalJson(input) !== original || history.projectUuid !== evidence.projectUuid || history.branchUuid !== evidence.branchUuid ||
      history.checkpointSha256 !== evidence.checkpointSha256 || history.headHistoryUuid !== evidence.headHistoryUuid ||
      history.semanticSha256 !== evidence.historySemanticSha256 || matches.length !== 1 || document?.docType !== "PCB" ||
      document.semanticSha256 !== evidence.documentSemanticSha256 || isNativeDocumentDeleted(document)) {
    throw new Error("PCB209_RATLINE_CHECKPOINT_BINDING");
  }
  if (document.records.some(record => physical.has(record.type))) {
    throw new Error("PCB209_RATLINE_CHECKPOINT_KNOWN_POPULATED: empty-only continuation requires a separate empty disposable PCB");
  }
}
