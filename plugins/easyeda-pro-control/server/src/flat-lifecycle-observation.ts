import { canonicalJson, sha256Text } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import type { FlatDisplayObservationEvidence } from "./schematic-flat-read.ts";

export type FlatLifecyclePhase = "commit" | "retained-save" | "baseline-reconcile" | "inverse";

interface FlatLifecycleIdentity {
  readonly phase: FlatLifecyclePhase;
  readonly sourcePhase: "before" | "after";
  readonly operationId: string;
  readonly originalPlanHash: string;
  readonly flatBindingSha256: string;
  readonly context: ExpectedContext;
  readonly sourceSha256: string;
  readonly nativeSha256: string;
}

interface FlatLifecycleObservation extends FlatLifecycleIdentity {
  readonly schema: "easyeda-pro-control.flat-lifecycle-observation.v1";
  readonly observerCheckpoint: FlatDisplayObservationEvidence["checkpoint"];
  readonly projectBinding: FlatDisplayObservationEvidence["projectBinding"];
  readonly libraryHeaderEvidence?: FlatDisplayObservationEvidence["libraryHeaderEvidence"];
  readonly observation: FlatDisplayObservationEvidence["observation"];
  readonly observationSha256: string;
  readonly topologyProof: FlatDisplayObservationEvidence["proof"];
  readonly compiledTopology: false;
}

/** Retain an already verified lifecycle observation, not execution authority or
 * terminal persistence proof. Its observer checkpoint precedes the separately
 * verified terminal checkpoint. Never copy the decoded whole-project history.
 */
export function buildFlatLifecycleObservation(identity: FlatLifecycleIdentity, evidence: FlatDisplayObservationEvidence): FlatLifecycleObservation {
  const artifact: FlatLifecycleObservation = {
    schema: "easyeda-pro-control.flat-lifecycle-observation.v1",
    phase: identity.phase, sourcePhase: identity.sourcePhase,
    operationId: identity.operationId, originalPlanHash: identity.originalPlanHash,
    flatBindingSha256: identity.flatBindingSha256, context: identity.context,
    sourceSha256: identity.sourceSha256, nativeSha256: identity.nativeSha256,
    observerCheckpoint: evidence.checkpoint, projectBinding: evidence.projectBinding,
    ...(evidence.libraryHeaderEvidence === undefined ? {} : { libraryHeaderEvidence: evidence.libraryHeaderEvidence }),
    observation: evidence.observation, observationSha256: sha256Text(canonicalJson(evidence.observation)),
    topologyProof: evidence.proof, compiledTopology: false,
  };
  // Match the managed writer's complete UTF-8 JSON, including its trailing LF.
  // Keep large raw observations separate from the terminal/recovery phase.
  if (Buffer.byteLength(`${JSON.stringify(artifact)}\n`) > 16 * 1024 * 1024) {
    throw new Error("Flat lifecycle observation exceeds the 16 MiB artifact bound.");
  }
  return artifact;
}
