/** Original successful verification alone may derive this inverse. The patch
 * restores initial metadata, not SQLite bytes, historical tickets or versions.
 */
import { lstat } from "node:fs/promises";
import { loadOperation } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import type { CurrentDisposableOpenGenerationSource } from "./current-disposable-open-runtime.ts";
import { prepareCurrentInverseSymbolMetadata } from "./current-symbol-metadata-preparation.ts";
import type { CurrentSymbolMetadataPreparationResult } from "./current-symbol-metadata-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- Inverse derivation must consume the verifier's lexical original-result issuer, never an exported callback registry.
import { assertCurrentSymbolVerificationResult } from "./current-symbol-verification-runtime.ts";
import type { CurrentSymbolVerificationResult, CurrentSymbolVerificationResultSource } from "./current-symbol-verification-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

export interface CurrentSymbolInverseBaselineOwner {
  readonly profile: "private.current-symbol-inverse-baseline-owner.v1";
  readonly operationId: string; readonly openingOperationId: string;
}
export interface CurrentInverseSymbolPreparation {
  readonly profile: "private.current-inverse-symbol-preparation.v1";
  readonly preparationSha256: string;
  readonly checkpointPreparation: CurrentSymbolMetadataPreparationResult;
  readonly closedTargetWitness: Readonly<{ observation: Readonly<{
    value: Readonly<{ name: string; description: string; tagsJson: string; source: string; version: string; ticket: number }>;
    runtimeObservation: Readonly<{ actor: CurrentSymbolVerificationResultSource["saved"]["observation"]["expectedActor"] }>;
  }> }>;
}
export interface OriginalCurrentSymbolInverseOwner {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly preparation: CurrentInverseSymbolPreparation;
  readonly predecessor: CurrentSymbolVerificationResult;
  readonly result: CurrentSymbolVerificationResultSource;
}
interface Issuer {
  readonly engine: EasyedaControlEngine; readonly value: OriginalCurrentSymbolInverseOwner;
  readonly text: string; readonly owner: CurrentSymbolInverseBaselineOwner;
  transferAttempted: boolean; transferred: boolean; transferredJournalText?: string;
}
const attempts = new WeakSet<CurrentSymbolVerificationResult>(), owners = new WeakMap<object, Issuer>();
function need(value: boolean): asserts value { if (!value) { throw new Error("Current symbol inverse requires its original successful verification result."); } }
function projection(owner: CurrentSymbolInverseBaselineOwner, original: OriginalCurrentSymbolInverseOwner): unknown {
  return { owner, preparation: original.preparation, predecessor: original.predecessor, snapshot: original.result.snapshot,
    target: original.source.target, expectedFingerprint: original.source.expectedFingerprint,
    launch: original.source.launchProjection, session: original.source.bridgeSession };
}
export function assertCurrentSymbolInverseBaselineOwner(owner: unknown, engine: EasyedaControlEngine): OriginalCurrentSymbolInverseOwner {
  need(owner !== null && typeof owner === "object"); const issued = owners.get(owner);
  need(issued !== undefined && issued.engine === engine && canonicalJson(projection(issued.owner, issued.value)) === issued.text);
  need(assertCurrentSymbolVerificationResult(issued.value.predecessor, engine) === issued.value.result);
  return issued.value;
}
export async function revalidateCurrentSymbolInverseBaselineOwner(owner: CurrentSymbolInverseBaselineOwner,
  engine: EasyedaControlEngine): Promise<OriginalCurrentSymbolInverseOwner> {
  const original = assertCurrentSymbolInverseBaselineOwner(owner, engine);
  const issued = owners.get(owner); need(issued !== undefined);
  if (issued.transferred) {
    const journal = await loadOperation(original.predecessor.operationId);
    need(canonicalJson(journal) === issued.transferredJournalText && canonicalJson(original.result.journal) === issued.transferredJournalText && journal["state"] === "plan-invalidated");
  } else { await original.result.revalidateClosed(); }
  need(assertCurrentSymbolInverseBaselineOwner(owner, engine) === original); return original;
}
export async function transferCurrentSymbolInverseBaselineOwner(owner: CurrentSymbolInverseBaselineOwner, engine: EasyedaControlEngine): Promise<void> {
  const issued = owners.get(owner), original = assertCurrentSymbolInverseBaselineOwner(owner, engine);
  need(issued !== undefined && !issued.transferAttempted); issued.transferAttempted = true;
  await original.result.transfer(); need(assertCurrentSymbolInverseBaselineOwner(owner, engine) === original);
  issued.transferredJournalText = canonicalJson(original.result.journal); issued.transferred = true;
}
export function currentSymbolInverseOwnershipTransferred(owner: CurrentSymbolInverseBaselineOwner, engine: EasyedaControlEngine): boolean {
  assertCurrentSymbolInverseBaselineOwner(owner, engine); const issued = owners.get(owner); need(issued !== undefined); return issued.transferred;
}

export async function prepareCurrentSymbolInverseOwner(engine: EasyedaControlEngine,
  predecessor: CurrentSymbolVerificationResult): Promise<CurrentSymbolInverseBaselineOwner> {
  const result = assertCurrentSymbolVerificationResult(predecessor, engine);
  need(result.writer.original.source.purpose === "disposable-validation");
  need(!attempts.has(predecessor)); attempts.add(predecessor);
  await result.revalidateClosed(); need(assertCurrentSymbolVerificationResult(predecessor, engine) === result);
  const snapshot = result.snapshot, target = result.saved.observation.target;
  const initial = result.initialMetadata, previous = result.writer.original.baseline.preparation;
  need(canonicalJson(target) === canonicalJson(previous.target) && canonicalJson(initial) === canonicalJson(previous.metadata.before) &&
    canonicalJson({ name: result.saved.observation.expectedBefore.name, description: result.saved.observation.expectedBefore.description,
      source: result.saved.observation.expectedBefore.source, tags: JSON.parse(result.saved.observation.expectedBefore.tagsJson) as unknown }) === canonicalJson(previous.metadata.after));
  const owner: CurrentSymbolInverseBaselineOwner = Object.freeze({ profile: "private.current-symbol-inverse-baseline-owner.v1",
    operationId: `inverse-${sha256Json({ operationId: predecessor.operationId, snapshot: snapshot.copy.receiptSha256 })}`,
    openingOperationId: predecessor.operationId });
  const stat = await lstat(snapshot.checkpoint.checkpoint, { bigint: true }); await result.revalidateClosed();
  const checkpointPreparation = await prepareCurrentInverseSymbolMetadata({ checkpoint: { path: snapshot.checkpoint.checkpoint,
    bytes: Number(stat.size), sha256: snapshot.checkpoint.checkpointSha256 }, target,
  patch: { name: initial.name, description: initial.description } });
  await result.revalidateClosed();
  need(canonicalJson(checkpointPreparation.metadata.before) === canonicalJson(previous.metadata.after) &&
    canonicalJson(checkpointPreparation.metadata.after) === canonicalJson(initial));
  const valueProjection = Object.freeze(structuredClone(result.saved.observation.expectedBefore));
  const actor = Object.freeze(structuredClone(result.saved.observation.expectedActor));
  const runtimeObservation = Object.freeze({ actor });
  const observation = Object.freeze({ value: valueProjection, runtimeObservation });
  const closedTargetWitness = Object.freeze({ observation });
  const body = { profile: "private.current-inverse-symbol-preparation.v1" as const, checkpointPreparation, closedTargetWitness };
  const preparation: CurrentInverseSymbolPreparation = Object.freeze({ ...body, preparationSha256: sha256Json(body) });
  const source: CurrentDisposableOpenGenerationSource = Object.freeze({ ...result.writer.original.source,
    target: Object.freeze({ ...result.writer.original.source.target, expectedSourceSha256: snapshot.checkpoint.sourceSha256 }),
    launchProjection: result.originalSnapshot.launch, bridgeSession: result.originalSnapshot.capture.bridgeSession });
  const value = Object.freeze({ source, preparation, predecessor, result });
  owners.set(owner, { engine, value, owner, text: canonicalJson(projection(owner, value)), transferAttempted: false, transferred: false });
  return owner;
}
