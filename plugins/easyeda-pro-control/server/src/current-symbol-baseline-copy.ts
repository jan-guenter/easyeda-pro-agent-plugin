/** Internal post-opening closed evidence. No native writer or opening-effect
 * acceptance follows from copying a terminated generation's source.
 */
/* oxlint-disable import/max-dependencies -- Compose the existing owner, closed-file, checkpoint and metadata guards without introducing alternative readers or caller verifiers. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import { canonicalJson, isRecord, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- Only the retained opening coordinator can issue the owner consumed by its closed-copy stage; no alternate issuer or caller verifier is exposed.
import { assertCurrentSymbolBaselineOwner, revalidateCurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentSymbolBaselineOwner } from "./current-disposable-open-runtime.ts";
import { assessCurrentStartupPremises } from "./current-startup-premises.ts";
import type { CurrentStartupPremises } from "./current-startup-premises.ts";
import { currentClosedSymbolMetadataProjection } from "./current-symbol-closed-target.ts";
import { prepareCurrentSymbolMetadata } from "./current-symbol-metadata-preparation.ts";
import type { CurrentSymbolMetadataPreparationResult } from "./current-symbol-metadata-preparation.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof } from "./windows-authority.ts";

type SqlInventory = Awaited<ReturnType<typeof readClosedCopySqlInventory>>;
export interface CurrentSymbolBaselineCopyInput {
  readonly owner: CurrentSymbolBaselineOwner;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly proof: ClosedSessionTerminationProof;
  readonly runtime: MachineProfile["runtime"];
}
export type CurrentSymbolBaselineCopyEvidence =
  Readonly<{ kind: "checkpoint"; value: CheckpointReceipt }> |
  Readonly<{ kind: "copy"; value: ClosedFileCopyReceipt }> |
  Readonly<{ kind: "inventory"; value: SqlInventory }> |
  Readonly<{ kind: "startup-premises"; value: CurrentStartupPremises }> |
  Readonly<{ kind: "preparation"; value: CurrentSymbolMetadataPreparationResult }>;
export interface CurrentSymbolBaselineCopy {
  readonly profile: "private.current-symbol-baseline-copy.v1";
  readonly owner: CurrentSymbolBaselineOwner;
  readonly checkpoint: CheckpointReceipt;
  readonly copy: ClosedFileCopyReceipt;
  readonly inventory: SqlInventory;
  readonly preparation: CurrentSymbolMetadataPreparationResult;
  readonly startupPremises: CurrentStartupPremises;
  readonly targetEvidence: Readonly<{
    projectUuid: string; branchUuid: string; ownerUuid: string; documentUuid: string; docType: "PCB";
    documentSemanticSha256: string; historySemanticSha256: string; headHistoryUuid: string;
  }>;
  readonly postOpeningClosedCopyCaptured: true;
  readonly beforeWriteBaselineVerified: false;
  readonly openingEffectsVerified: false;
  readonly writerReady: false;
  readonly executionAuthorized: false;
}
const consumed = new WeakSet<CurrentSymbolBaselineOwner>();
const issued = new WeakMap<object, { readonly engine: EasyedaControlEngine; readonly text: string }>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }

/** Original result only. Its issuer and bytes are not future source freshness,
 * queued-write persistence, producer provenance or before-write admission.
 */
export function assertOriginalCurrentSymbolBaselineCopy(value: CurrentSymbolBaselineCopy, engine: EasyedaControlEngine): void {
  const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.text === canonicalJson(value),
    "Current symbol baseline copy was not issued unchanged by this engine.");
}

/** Last closed-source check before a subsequent launch consumes the old proof.
 * The original in-memory inventory remains historical evidence. This does not
 * admit reopening effects or promise freshness of a later artifact-path read.
 */
export async function revalidateCurrentSymbolBaselineCopy(engine: EasyedaControlEngine, value: CurrentSymbolBaselineCopy,
  proof: ClosedSessionTerminationProof): Promise<void> {
  const current = (): void => {
    assertOriginalCurrentSymbolBaselineCopy(value, engine);
    assertCurrentSymbolBaselineOwner(value.owner, engine);
    assertIssuedClosedFileCopy(value.copy);
    assertCurrentClosedSessionCopyAuthority(proof);
    const completion = readerCompletion(value.inventory);
    need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      value.copy.closureProofSha256 === proof.proofSha256 && value.copy.sha256 === value.checkpoint.sourceSha256 &&
      value.inventory.checkpointSha256 === value.copy.sha256 && value.copy.source === value.checkpoint.source,
    "Current symbol relaunch baseline lineage or reader completion differs.");
  };
  current();
  need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol relaunch lost its original closed authority."); current();
  await revalidateCurrentSymbolBaselineOwner(value.owner, engine); current();
  const root = await controlRootCapability(); current();
  const receiptCurrent = async (): Promise<void> => {
    const receipt = await readArtifact(value.checkpoint.receiptPath, 0, 65_536); current();
    need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(value.checkpoint),
      "Current symbol relaunch checkpoint receipt changed.");
  };
  await receiptCurrent(); current();
  const verified = await verifyCheckpoint(value.checkpoint.receiptPath, { expectedSource: value.copy.source,
    artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root, maximumSourceBytes: 268_435_456 }); current();
  const checkpoint = value.checkpoint;
  need(verified.ok && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint && !verified.sourceChanged &&
    verified.source === checkpoint.source && verified.sourceSha256 === checkpoint.sourceSha256 && verified.receiptPath === checkpoint.receiptPath &&
    verified.checkpoint === checkpoint.checkpoint && verified.checkpointSha256 === checkpoint.checkpointSha256 &&
    verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 && verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256,
  "Current symbol relaunch checkpoint or source changed.");
  await receiptCurrent(); current();
  for (const [path, identity] of [[checkpoint.source, checkpoint.sourceIdentity], [checkpoint.checkpoint, checkpoint.checkpointIdentity]] as const) {
    const stat = await lstat(path, { bigint: true }); current();
    need(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && stat.dev.toString() === identity.dev && stat.ino.toString() === identity.ino &&
      stat.birthtimeNs.toString() === identity.birthtimeNs && stat.ctimeNs.toString() === identity.ctimeNs,
    "Current symbol relaunch source or checkpoint lineage changed.");
  }
}

function closeBinding(input: CurrentSymbolBaselineCopyInput, source: ReturnType<typeof assertCurrentSymbolBaselineOwner>["source"]): void {
  const { owner, capture, intent, closeReceipt, proof } = input;
  const authority = capture.executionAuthority, launch = source.launchProjection;
  const { authoritySha256, ...authorityPayload } = authority;
  const { closeIntentSha256, ...intentPayload } = intent;
  const { closeReceiptSha256, ...receiptPayload } = closeReceipt;
  need(capture.operationId === owner.operationId && capture.phase === "closed-baseline" && capture.challengeAttempt === 1 &&
    canonicalJson(capture.bridgeSession) === canonicalJson(source.bridgeSession) && authoritySha256 === sha256Json(authorityPayload) &&
    authority.processTreeSha256 === sha256Json(authority.processes) &&
    intent.schema === "easyeda-pro-control.closed-session-close-intent.v1" && closeIntentSha256 === sha256Json(intentPayload) &&
    intent.operationId === owner.operationId && intent.phase === "closed-baseline" && intent["challengeAttempt"] === 1 &&
    intent.authoritySha256 === authority.authoritySha256 && intent["captureBindingSha256"] === authority.bindingSha256 &&
    intent.launchSha256 === sha256Json(launch) && intent.bridgeSessionSha256 === sha256Json(capture.bridgeSession) &&
    intent.runtimeIdentitySha256 === sha256Json(capture.runtimeIdentity) && intent.helperInstance === launch.helperInstance && intent.jobId === launch.jobId &&
    intent.policyId === authority.policyId && intent.policySha256 === authority.policySha256 &&
    closeReceipt.schema === "easyeda-pro-control.closed-session-close-dispatch.v1" && closeReceiptSha256 === sha256Json(receiptPayload) &&
    closeReceipt.closeIntentSha256 === closeIntentSha256 && closeReceipt.closeDispatched && !closeReceipt.saveOrDiscardSelected && !closeReceipt.terminationProved &&
    proof["operationId"] === owner.operationId && proof["phase"] === "closed-baseline" && proof["challengeAttempt"] === 1 &&
    proof.closeIntentSha256 === closeIntentSha256 && proof.closeReceiptSha256 === closeReceiptSha256 &&
    proof.authoritySha256 === authority.authoritySha256 && proof.launchSha256 === intent.launchSha256 &&
    proof["bridgeSessionSha256"] === intent.bridgeSessionSha256 && proof["runtimeIdentitySha256"] === intent.runtimeIdentitySha256 &&
    proof["helperInstance"] === launch.helperInstance && proof["jobId"] === launch.jobId &&
    proof["policyId"] === authority.policyId && proof["policySha256"] === authority.policySha256,
  "Current symbol baseline closure does not bind its owner, capture, session, runtime and launch.");
}

function copyLineage(checkpoint: CheckpointReceipt, copy: ClosedFileCopyReceipt): void {
  const lineage = checkpoint.sourceIdentity, source = copy.sourceIdentity, stat = checkpoint["sourceStatAfter"];
  need(copy.source === checkpoint.source && copy.sha256 === checkpoint.sourceSha256 && String(copy.bytes) === source.size &&
    lineage.dev === source.device && lineage.ino === source.inode && lineage.birthtimeNs === source.birthtimeNs && lineage.ctimeNs === source.ctimeNs &&
    isRecord(stat) && stat["size"] === source.size && stat["mtimeNs"] === source.mtimeNs && stat["ctimeNs"] === source.ctimeNs,
  "Current symbol baseline copy source lineage changed after checkpoint.");
}

/** The owner and termination proof must be genuinely issued originals. Capture,
 * intent and close-receipt fields are exact matching projections, not a claim
 * that equality establishes their object issuance. The coordinator retains the
 * originals. The synchronous hook retains outputs only; it grants no authority.
 */
export async function captureCurrentSymbolBaselineCopy(engine: EasyedaControlEngine, input: CurrentSymbolBaselineCopyInput,
  onEvidence: (event: CurrentSymbolBaselineCopyEvidence) => void): Promise<CurrentSymbolBaselineCopy> {
  const { owner, proof } = input;
  const original = assertCurrentSymbolBaselineOwner(owner, engine), { source, preparation: previous } = original;
  need(!consumed.has(owner), "Current symbol baseline copy attempt already consumed."); consumed.add(owner);
  const inputText = canonicalJson(input), originalText = canonicalJson({ target: source.target, previous });
  const sourcePath = source.preNavigationCheckpoint.checkpoint.source;
  need(sourcePath === normalizeEasyedaProjectPath(source.target.rawWindowsPath), "Current symbol baseline source differs from its original opening target.");
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(typeof scopeReader === "function", "Current symbol baseline cannot inspect its bridge scope.");
  const evidence: { readonly value: unknown; readonly text: string }[] = [];
  const unchanged = (): void => {
    const retained = assertCurrentSymbolBaselineOwner(owner, engine);
    need(retained.source === source && retained.preparation === previous && canonicalJson(input) === inputText &&
      canonicalJson({ target: source.target, previous }) === originalText && source.preNavigationCheckpoint.checkpoint.source === sourcePath &&
      evidence.every((item) => canonicalJson(item.value) === item.text), "Current symbol baseline input or retained evidence changed.");
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(engine.upstream) === undefined,
      "Current symbol baseline cannot run inside an unknown or authenticated bridge scope.");
    closeBinding(input, source);
  };
  const retain = (event: CurrentSymbolBaselineCopyEvidence): void => {
    evidence.push({ value: event.value, text: canonicalJson(event.value) });
    onEvidence(Object.freeze(event)); unchanged();
  };
  const current = async (): Promise<void> => {
    unchanged();
    need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol baseline termination proof changed."); unchanged();
    const retained = await revalidateCurrentSymbolBaselineOwner(owner, engine);
    need(retained.source === source && retained.preparation === previous, "Current symbol baseline owner changed."); unchanged();
    assertCurrentClosedSessionCopyAuthority(proof);
  };
  await current();
  await engine.assertBridgeDispatchAllowed(); await current();
  await engine.assertRecoveryOperationIsolated(owner.operationId); await current();
  const root = await controlRootCapability(); await current();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const policy = { expectedSource: sourcePath, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 };
  const checkpoint = await createCheckpoint({ source: sourcePath, outputDir, label: `current-symbol-baseline-${owner.operationId.slice(-8)}` }, policy);
  retain({ kind: "checkpoint", value: checkpoint }); await current();
  // Normal opening can change bytes and modification times, but replacing the
  // File is not continuity with the retained original opening's source.
  const openingIdentity = source.preNavigationCheckpoint.checkpoint.sourceIdentity;
  need(checkpoint.sourceIdentity.dev === openingIdentity.dev && checkpoint.sourceIdentity.ino === openingIdentity.ino &&
    checkpoint.sourceIdentity.birthtimeNs === openingIdentity.birthtimeNs,
  "Current symbol baseline source lineage changed since its original opening checkpoint.");
  const copy = await copyClosedProjectBytes({ closureProof: proof, source: sourcePath, expectedSourceSha256: checkpoint.sourceSha256,
    artifactDirectory: operationPath(owner.operationId).slice(0, -5) });
  retain({ kind: "copy", value: copy }); await current(); copyLineage(checkpoint, copy);
  const inventory = await readClosedCopySqlInventory({ copy, runtime: input.runtime });
  retain({ kind: "inventory", value: inventory }); await current();
  need(inventory.checkpointSha256 === copy.sha256, "Current symbol baseline inventory does not bind its raw copy.");

  // The raw byte copy above is the complete SQL baseline. The separate VACUUM
  // Checkpoint below supplies only bounded native-history/metadata preparation.
  const target = previous.checkpointPreparation.target;
  need(target.projectUuid === source.target.projectUuid && target.branchUuid === source.target.branchUuid &&
    target.symbolUuid !== source.target.documentUuid && previous.openingOperationId === owner.openingOperationId,
  "Current symbol baseline metadata target differs from its original opening.");
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" }); await current();
  const matches = history.documents.filter((document) => document.uuid === source.target.documentUuid);
  const document = matches[0];
  need(history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.projectOwnerUuid === target.ownerUuid &&
    matches.length === 1 && document?.docType === "PCB" && !isNativeDocumentDeleted(document),
  "Current symbol baseline active target is not its exact undeleted default-branch PCB.");
  const targetEvidence = Object.freeze({ projectUuid: history.projectUuid, branchUuid: history.branchUuid, ownerUuid: history.projectOwnerUuid,
    documentUuid: document.uuid, docType: "PCB" as const, documentSemanticSha256: document.semanticSha256,
    historySemanticSha256: history.semanticSha256, headHistoryUuid: history.headHistoryUuid });
  const startupPremises = await assessCurrentStartupPremises({ inventory, sourceSha256: copy.sha256,
    checkpointSha256: checkpoint.checkpointSha256, history, target, documentUuid: document.uuid });
  retain({ kind: "startup-premises", value: startupPremises }); await current();
  const checkpointInfo = await lstat(checkpoint.checkpoint, { bigint: true }); await current();
  const preparation = await prepareCurrentSymbolMetadata({ checkpoint: { path: checkpoint.checkpoint, bytes: Number(checkpointInfo.size), sha256: checkpoint.checkpointSha256 },
    target, patch: previous.checkpointPreparation.patch, observationProjection: currentClosedSymbolMetadataProjection(previous.closedTargetWitness.observation) });
  retain({ kind: "preparation", value: preparation }); await current();
  need(preparation.history.headHistoryUuid === history.headHistoryUuid && preparation.history.documents === history.documents.length,
    "Current symbol baseline metadata and active PCB history disagree.");
  const receipt = await readArtifact(checkpoint.receiptPath, 0, 65_536); await current();
  need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(checkpoint), "Current symbol baseline checkpoint receipt changed.");
  const verified = await verifyCheckpoint(checkpoint.receiptPath, policy); await current();
  need(verified.ok && !verified.sourceChanged && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint &&
    verified.source === sourcePath && verified.checkpoint === checkpoint.checkpoint && verified.sourceSha256 === checkpoint.sourceSha256 &&
    verified.checkpointSha256 === checkpoint.checkpointSha256, "Current symbol baseline source or checkpoint changed during capture.");
  const result: CurrentSymbolBaselineCopy = Object.freeze({ profile: "private.current-symbol-baseline-copy.v1", owner, checkpoint, copy, inventory, preparation, targetEvidence, startupPremises,
    postOpeningClosedCopyCaptured: true, beforeWriteBaselineVerified: false, openingEffectsVerified: false, writerReady: false, executionAuthorized: false });
  assertCurrentClosedSessionCopyAuthority(proof); unchanged();
  issued.set(result, { engine, text: canonicalJson(result) });
  return result;
}
