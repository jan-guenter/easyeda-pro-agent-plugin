/** Exact binding of issued copy/reader evidence to the existing data journal. */
import { dirname, join } from "node:path";
import { operationPath, readExactUtf8Artifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import type { ClosedJournal, Generation, PhaseEvent } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { ClosedSessionTerminationProof } from "./windows-authority.ts";
import type { Inventory } from "./closed-sql-equality.ts";

export type CopyPhase = "baseline-copy" | "edit-copy" | "verify-copy";
const PHASES = { "baseline-copy": { ordinal: 0, close: "closed-baseline" },
  "edit-copy": { ordinal: 1, close: "closed-edit" }, "verify-copy": { ordinal: 2, close: "closed-verification" } } as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("Closed SQL copy binding refused."); } }
export function sqlDigests(inventory: Inventory): Readonly<Record<string, string>> {
  return { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 };
}
/** Rehash evidence only. Parsing this auxiliary artifact cannot issue a witness. */
export async function readWitnessClockArtifact(operationId: string, descriptor: Readonly<ArtifactDescriptor>, expectedSha256: string): Promise<Readonly<Record<string, unknown>>> {
  need(descriptor.path === join(operationPath(operationId).slice(0, -5), "20-edit-witness-clock-qualification.json") &&
    descriptor.sha256 === expectedSha256 && descriptor.bytes > 0 && descriptor.bytes <= 60_000);
  const original = canonicalJson(descriptor);
  const read = await readExactUtf8Artifact(descriptor);
  need(canonicalJson(descriptor) === original && read.path === descriptor.path && read.bytes === descriptor.bytes && read.sha256 === expectedSha256);
  const value: unknown = JSON.parse(read.text);
  need(isRecord(value) && value["profile"] === "private.closed-symbol-witness-clock-qualification.v1" && value["operationId"] === operationId);
  return value;
}
export function bindClosedSqlCopy(input: Readonly<{
  journal: ClosedJournal; events: readonly PhaseEvent[]; phase: CopyPhase;
  copy: ClosedFileCopyReceipt; inventory: Inventory; proof?: ClosedSessionTerminationProof;
}>): Readonly<{ generation: Generation; resultArtifactSha256: string }> {
  need(Object.hasOwn(PHASES, input.phase));
  const selected = PHASES[input.phase], { copy, inventory, journal } = input;
  assertIssuedClosedFileCopy(copy); need(readerCompletion(inventory).exitCode === 0);
  need(copy.source === journal.plan.projectPath && dirname(copy.artifact) === operationPath(journal.operationId).slice(0, -5) &&
    inventory.checkpointSha256 === copy.sha256);
  const intent = input.events.find((event) => event.step === input.phase && event.kind === "intent");
  const result = input.events.find((event) => event.step === input.phase && event.kind === "result");
  const generation = result?.generation;
  need(result !== undefined && intent !== undefined && isRecord(result.data) && isRecord(intent.data) && generation !== undefined &&
    generation !== null && "captureSha256" in generation && generation.ordinal === selected.ordinal);
  need(canonicalJson(result.data) === canonicalJson({ copyReceipt: copy, sqlDigests: sqlDigests(inventory) }) &&
    canonicalJson(intent.generation) === canonicalJson(generation));
  const storedProof = intent.data["proof"];
  need(isRecord(storedProof) && storedProof["proofSha256"] === copy.closureProofSha256 &&
    storedProof["operationId"] === journal.operationId && storedProof["phase"] === selected.close &&
    storedProof["challengeAttempt"] === 1 && storedProof["jobId"] === generation.jobId && storedProof["helperInstance"] === generation.helperInstance &&
    storedProof["bridgeSessionSha256"] === generation.sessionSha256 && storedProof["runtimeIdentitySha256"] === generation.runtimeSha256 &&
    intent.data["source"] === journal.plan.projectPath && canonicalJson(intent.data["generation"]) === canonicalJson(generation));
  if (input.proof !== undefined) { need(canonicalJson(input.proof) === canonicalJson(storedProof)); }
  const artifact = journal.artifacts[result.sequence - 1];
  need(artifact !== undefined);
  return Object.freeze({ generation, resultArtifactSha256: artifact.sha256 });
}
