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
// oxlint-disable-next-line import/no-cycle -- Inverse copying accepts only the verifier-derived original owner; an injectable registry would weaken issuance.
import { assertCurrentSymbolInverseBaselineOwner, revalidateCurrentSymbolInverseBaselineOwner } from "./current-symbol-inverse-owner.ts";
import type { CurrentSymbolInverseBaselineOwner } from "./current-symbol-inverse-owner.ts";
import { assessCurrentStartupPremises } from "./current-startup-premises.ts";
import type { CurrentStartupPremises } from "./current-startup-premises.ts";
import { currentClosedSymbolMetadataProjection } from "./current-symbol-closed-target.ts";
import { prepareCurrentSymbolMetadata } from "./current-symbol-metadata-preparation.ts";
import type { CurrentSymbolMetadataPreparationResult } from "./current-symbol-metadata-preparation.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof, WindowsAuthorityLaunch } from "./windows-authority.ts";

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
  readonly owner: CurrentSymbolBaselineOwner | CurrentSymbolInverseBaselineOwner;
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
const consumed = new WeakSet<CurrentSymbolBaselineOwner | CurrentSymbolInverseBaselineOwner>();
const issued = new WeakMap<object, { readonly engine: EasyedaControlEngine; readonly text: string;
  readonly closedLaunch: WindowsAuthorityLaunch; readonly closedSession: ClosedSessionAuthorityCapture["bridgeSession"] }>();
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
    assertBaselineOwner(value.owner, engine);
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
  await revalidateBaselineOwner(value.owner, engine); current();
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

function closeBinding(input: Omit<CurrentSymbolBaselineCopyInput, "owner"> & { readonly owner: Pick<CurrentSymbolBaselineOwner, "operationId"> },
  source: Pick<ReturnType<typeof assertCurrentSymbolBaselineOwner>["source"], "launchProjection" | "bridgeSession">,
  phase: "closed-baseline" | "closed-edit" | "closed-verification" = "closed-baseline"): void {
  const { owner, capture, intent, closeReceipt, proof } = input;
  const authority = capture.executionAuthority, launch = source.launchProjection;
  const { authoritySha256, ...authorityPayload } = authority;
  const { closeIntentSha256, ...intentPayload } = intent;
  const { closeReceiptSha256, ...receiptPayload } = closeReceipt;
  need(capture.operationId === owner.operationId && capture.phase === phase && capture.challengeAttempt === 1 &&
    canonicalJson(capture.bridgeSession) === canonicalJson(source.bridgeSession) && authoritySha256 === sha256Json(authorityPayload) &&
    authority.processTreeSha256 === sha256Json(authority.processes) &&
    intent.schema === "easyeda-pro-control.closed-session-close-intent.v1" && closeIntentSha256 === sha256Json(intentPayload) &&
    intent.operationId === owner.operationId && intent.phase === phase && intent["challengeAttempt"] === 1 &&
    intent.authoritySha256 === authority.authoritySha256 && intent["captureBindingSha256"] === authority.bindingSha256 &&
    intent.launchSha256 === sha256Json(launch) && intent.bridgeSessionSha256 === sha256Json(capture.bridgeSession) &&
    intent.runtimeIdentitySha256 === sha256Json(capture.runtimeIdentity) && intent.helperInstance === launch.helperInstance && intent.jobId === launch.jobId &&
    intent.policyId === authority.policyId && intent.policySha256 === authority.policySha256 &&
    closeReceipt.schema === "easyeda-pro-control.closed-session-close-dispatch.v1" && closeReceiptSha256 === sha256Json(receiptPayload) &&
    closeReceipt.closeIntentSha256 === closeIntentSha256 && closeReceipt.closeDispatched && !closeReceipt.saveOrDiscardSelected && !closeReceipt.terminationProved &&
    proof["operationId"] === owner.operationId && proof["phase"] === phase && proof["challengeAttempt"] === 1 &&
    proof.closeIntentSha256 === closeIntentSha256 && proof.closeReceiptSha256 === closeReceiptSha256 &&
    proof.authoritySha256 === authority.authoritySha256 && proof.launchSha256 === intent.launchSha256 &&
    proof["bridgeSessionSha256"] === intent.bridgeSessionSha256 && proof["runtimeIdentitySha256"] === intent.runtimeIdentitySha256 &&
    proof["helperInstance"] === launch.helperInstance && proof["jobId"] === launch.jobId &&
    proof["policyId"] === authority.policyId && proof["policySha256"] === authority.policySha256,
  "Current symbol baseline closure does not bind its owner, capture, session, runtime and launch.");
}

function assertBaselineOwner(owner: CurrentSymbolBaselineCopy["owner"], engine: EasyedaControlEngine): void {
  if (owner.profile === "private.current-symbol-inverse-baseline-owner.v1") { assertCurrentSymbolInverseBaselineOwner(owner, engine); }
  else { assertCurrentSymbolBaselineOwner(owner, engine); }
}
async function revalidateBaselineOwner(owner: CurrentSymbolBaselineCopy["owner"], engine: EasyedaControlEngine): Promise<void> {
  await (owner.profile === "private.current-symbol-inverse-baseline-owner.v1" ?
    revalidateCurrentSymbolInverseBaselineOwner(owner, engine) : revalidateCurrentSymbolBaselineOwner(owner, engine));
}
/** Fixed binding for a fresh inverse scratch sample before transferring its
 * verified predecessor's held closure. Never accepts a caller-selected journal.
 */
export function currentSymbolBaselineClockBinding(value: CurrentSymbolBaselineCopy, engine: EasyedaControlEngine):
Readonly<{ journalOperationId: string; phase: "closed-baseline" | "closed-verification" }> {
  assertOriginalCurrentSymbolBaselineCopy(value, engine);
  if (value.owner.profile !== "private.current-symbol-inverse-baseline-owner.v1") {
    return Object.freeze({ journalOperationId: value.owner.operationId, phase: "closed-baseline" });
  }
  const original = assertCurrentSymbolInverseBaselineOwner(value.owner, engine);
  return Object.freeze({ journalOperationId: original.predecessor.operationId, phase: "closed-verification" });
}

/** Adopt the actual complete verified post-edit copy, never a synthetic SQL
 * baseline. New metadata preparation and startup premises use that checkpoint.
 */
export async function prepareCurrentSymbolInverseBaselineCopy(engine: EasyedaControlEngine,
  owner: CurrentSymbolInverseBaselineOwner): Promise<CurrentSymbolBaselineCopy> {
  const original = assertCurrentSymbolInverseBaselineOwner(owner, engine);
  need(!consumed.has(owner), "Current inverse baseline copy attempt already consumed."); consumed.add(owner);
  const { snapshot, originalSnapshot: snapshotSource } = original.result;
  const { checkpoint, copy } = snapshot, { inventory } = snapshotSource;
  const preparation = original.preparation.checkpointPreparation, source = original.source;
  const current = async (): Promise<void> => {
    need(await revalidateCurrentSymbolInverseBaselineOwner(owner, engine) === original, "Inverse baseline owner changed.");
    need(assertOriginalCurrentSymbolVerificationSnapshot(snapshot, engine) === snapshotSource, "Inverse baseline snapshot changed.");
  };
  await current();
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: preparation.target.projectUuid, libraryAtomHeaders: "preserve" }); await current();
  const matches = history.documents.filter((document) => document.uuid === source.target.documentUuid);
  const document = matches[0];
  need(history.projectUuid === preparation.target.projectUuid && history.branchUuid === preparation.target.branchUuid &&
    history.projectOwnerUuid === preparation.target.ownerUuid && matches.length === 1 && document?.docType === "PCB" && !isNativeDocumentDeleted(document),
  "Inverse baseline needs the original undeleted companion PCB.");
  const targetEvidence = Object.freeze({ projectUuid: history.projectUuid, branchUuid: history.branchUuid, ownerUuid: history.projectOwnerUuid,
    documentUuid: document.uuid, docType: "PCB" as const, documentSemanticSha256: document.semanticSha256,
    historySemanticSha256: history.semanticSha256, headHistoryUuid: history.headHistoryUuid });
  const startupPremises = await assessCurrentStartupPremises({ inventory, sourceSha256: copy.sha256, checkpointSha256: checkpoint.checkpointSha256,
    history, target: preparation.target, documentUuid: document.uuid }); await current();
  need(preparation.history.headHistoryUuid === history.headHistoryUuid && preparation.history.documents === history.documents.length,
    "Inverse metadata preparation differs from its complete snapshot.");
  const result: CurrentSymbolBaselineCopy = Object.freeze({ profile: "private.current-symbol-baseline-copy.v1", owner, checkpoint, copy, inventory,
    preparation, startupPremises, targetEvidence, postOpeningClosedCopyCaptured: true, beforeWriteBaselineVerified: false,
    openingEffectsVerified: false, writerReady: false, executionAuthorized: false });
  issued.set(result, { engine, text: canonicalJson(result), closedLaunch: snapshotSource.launch, closedSession: snapshotSource.capture.bridgeSession });
  return result;
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
  // The original owner's revalidation already performs fresh combined bridge
  // And recovery admission. Keep it at every boundary without duplicate scans.
  await current();
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
  issued.set(result, { engine, text: canonicalJson(result), closedLaunch: structuredClone(source.launchProjection), closedSession: structuredClone(input.capture.bridgeSession) });
  return result;
}

export interface CurrentSymbolFinishSnapshotInput {
  readonly baseline: CurrentSymbolBaselineCopy;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly proof: ClosedSessionTerminationProof;
  readonly launch: WindowsAuthorityLaunch;
  readonly runtime: MachineProfile["runtime"];
}
export type CurrentSymbolFinishSnapshotEvidence = Readonly<{ kind: "checkpoint"; value: CheckpointReceipt }> |
  Readonly<{ kind: "copy"; value: ClosedFileCopyReceipt }> | Readonly<{ kind: "inventory"; value: SqlInventory }>;
export interface CurrentSymbolFinishSnapshot {
  readonly profile: "private.current-symbol-finish-snapshot.v1";
  readonly checkpoint: CheckpointReceipt;
  readonly copy: ClosedFileCopyReceipt;
  readonly sql: Readonly<{ checkpointSha256: string; schemaSha256: string; logicalSha256: string }>;
  readonly native: Readonly<{ projectUuid: string; branchUuid: string; ownerUuid: string;
    headHistoryUuid: string; historyRows: number; chunks: number; documents: number; historySemanticSha256: string }>;
  readonly baselineCopyReceiptSha256: string;
  readonly snapshotCaptured: true;
  readonly openingEffectsVerified: false;
  readonly persistenceVerified: false;
  readonly writerReady: false;
  readonly executionAuthorized: false;
}
const finishAttempts = new WeakSet<CurrentSymbolBaselineCopy>();
export interface CurrentSymbolVerificationSnapshot extends Omit<CurrentSymbolFinishSnapshot, "profile"> {
  readonly profile: "private.current-symbol-verification-snapshot.v1";
  readonly posteditCopyReceiptSha256: string;
}
export interface CurrentSymbolVerificationSnapshotInput extends Omit<CurrentSymbolFinishSnapshotInput, "baseline"> {
  readonly finishSnapshot: CurrentSymbolFinishSnapshot;
}
export interface OriginalCurrentSymbolSnapshot {
  readonly baseline: CurrentSymbolBaselineCopy;
  readonly inventory: SqlInventory;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly proof: ClosedSessionTerminationProof;
  readonly launch: WindowsAuthorityLaunch;
}
interface SnapshotIssuer {
  readonly engine: EasyedaControlEngine;
  readonly original: OriginalCurrentSymbolSnapshot;
  readonly text: string;
  readonly originalText: string;
}
const snapshots = new WeakMap<object, SnapshotIssuer>();
const verificationAttempts = new WeakSet<CurrentSymbolFinishSnapshot>();
function originalSnapshot(value: CurrentSymbolFinishSnapshot | CurrentSymbolVerificationSnapshot,
  engine: EasyedaControlEngine): OriginalCurrentSymbolSnapshot {
  const issuedSnapshot = snapshots.get(value);
  need(issuedSnapshot !== undefined && issuedSnapshot.engine === engine && issuedSnapshot.text === canonicalJson(value) &&
    issuedSnapshot.originalText === canonicalJson(issuedSnapshot.original), "Current symbol snapshot was not issued unchanged by this engine.");
  assertOriginalCurrentSymbolBaselineCopy(issuedSnapshot.original.baseline, engine);
  return issuedSnapshot.original;
}
/** Original completed snapshot only, not a journal reconstruction or permission
 * to reopen. The writer separately owns its successful comparison and transfer.
 */
export function assertOriginalCurrentSymbolFinishSnapshot(value: CurrentSymbolFinishSnapshot,
  engine: EasyedaControlEngine): OriginalCurrentSymbolSnapshot {
  need(value.profile === "private.current-symbol-finish-snapshot.v1", "Current symbol post-edit snapshot profile differs.");
  return originalSnapshot(value, engine);
}
export function assertOriginalCurrentSymbolVerificationSnapshot(value: CurrentSymbolVerificationSnapshot,
  engine: EasyedaControlEngine): OriginalCurrentSymbolSnapshot {
  need(value.profile === "private.current-symbol-verification-snapshot.v1", "Current symbol verification snapshot profile differs.");
  return originalSnapshot(value, engine);
}

/** Before a replacement launch consumes the closed proof, check the exact
 * post-edit checkpoint, raw copy and source. This never substitutes the older
 * baseline or grants authority after a restart.
 */
export function revalidateCurrentSymbolFinishSnapshot(engine: EasyedaControlEngine,
  snapshot: CurrentSymbolFinishSnapshot): Promise<void> {
  return revalidateSnapshot(engine, snapshot);
}
export function revalidateCurrentSymbolVerificationSnapshot(engine: EasyedaControlEngine,
  snapshot: CurrentSymbolVerificationSnapshot): Promise<void> {
  return revalidateSnapshot(engine, snapshot);
}
async function revalidateSnapshot(engine: EasyedaControlEngine,
  snapshot: CurrentSymbolFinishSnapshot | CurrentSymbolVerificationSnapshot): Promise<void> {
  const original = originalSnapshot(snapshot, engine);
  const current = (): void => {
    need(originalSnapshot(snapshot, engine) === original, "Current symbol post-edit snapshot owner changed.");
    assertIssuedClosedFileCopy(snapshot.copy); assertCurrentClosedSessionCopyAuthority(original.proof);
    const completion = readerCompletion(original.inventory);
    need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      snapshot.copy.closureProofSha256 === original.proof.proofSha256 && snapshot.copy.sha256 === snapshot.checkpoint.sourceSha256 &&
      original.inventory.checkpointSha256 === snapshot.copy.sha256 && snapshot.copy.source === snapshot.checkpoint.source,
    "Current symbol post-edit snapshot lineage or reader completion differs.");
  };
  current();
  need(await assertClosedSessionCopyAuthority(original.proof) === original.proof, "Current symbol post-edit closure authority changed."); current();
  const root = await controlRootCapability(); current();
  const receiptCurrent = async (): Promise<void> => {
    const receipt = await readArtifact(snapshot.checkpoint.receiptPath, 0, 65_536); current();
    need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(snapshot.checkpoint),
      "Current symbol post-edit checkpoint receipt changed.");
  };
  await receiptCurrent(); current();
  const checkpoint = snapshot.checkpoint;
  const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: checkpoint.source,
    artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root, maximumSourceBytes: 268_435_456 }); current();
  need(verified.ok && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint && !verified.sourceChanged &&
    verified.source === checkpoint.source && verified.sourceSha256 === checkpoint.sourceSha256 && verified.receiptPath === checkpoint.receiptPath &&
    verified.checkpoint === checkpoint.checkpoint && verified.checkpointSha256 === checkpoint.checkpointSha256 &&
    verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 && verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256,
  "Current symbol post-edit checkpoint or source changed.");
  await receiptCurrent(); current();
  for (const [path, identity] of [[checkpoint.source, checkpoint.sourceIdentity], [checkpoint.checkpoint, checkpoint.checkpointIdentity]] as const) {
    const stat = await lstat(path, { bigint: true }); current();
    need(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && stat.dev.toString() === identity.dev && stat.ino.toString() === identity.ino &&
      stat.birthtimeNs.toString() === identity.birthtimeNs && stat.ctimeNs.toString() === identity.ctimeNs,
    "Current symbol post-edit source or checkpoint lineage changed.");
  }
}

/** Fixed final observation before releasing the new generation's original
 * capture. The old owner/termination proof is deliberately not revalidated.
 * Source lineage comes from the original baseline, while current authority
 * comes only from the engine-issued new capture and genuine terminal proof.
 * Neither the snapshot nor its hashes classify or accept startup effects.
 */
export async function captureCurrentSymbolFinishSnapshot(engine: EasyedaControlEngine, input: CurrentSymbolFinishSnapshotInput,
  onEvidence: (event: CurrentSymbolFinishSnapshotEvidence) => void): Promise<CurrentSymbolFinishSnapshot> {
  const snapshot = await captureSnapshot(engine, input, onEvidence);
  need(snapshot.profile === "private.current-symbol-finish-snapshot.v1", "Current symbol finish snapshot profile changed.");
  return snapshot;
}

/** A separate one-shot closed verification observation. The previous snapshot
 * is historical provenance; only the new retained capture and proof authorize
 * reading the now-closed source. It cannot repeat the post-write capture.
 */
export async function captureCurrentSymbolVerificationSnapshot(engine: EasyedaControlEngine, input: CurrentSymbolVerificationSnapshotInput,
  onEvidence: (event: CurrentSymbolFinishSnapshotEvidence) => void): Promise<CurrentSymbolVerificationSnapshot> {
  const original = assertOriginalCurrentSymbolFinishSnapshot(input.finishSnapshot, engine);
  const snapshot = await captureSnapshot(engine, { ...input, baseline: original.baseline }, onEvidence, input.finishSnapshot);
  need(snapshot.profile === "private.current-symbol-verification-snapshot.v1", "Current symbol verification snapshot profile changed.");
  return snapshot;
}

async function captureSnapshot(engine: EasyedaControlEngine, input: CurrentSymbolFinishSnapshotInput,
  onEvidence: (event: CurrentSymbolFinishSnapshotEvidence) => void, predecessor?: CurrentSymbolFinishSnapshot):
  Promise<CurrentSymbolFinishSnapshot | CurrentSymbolVerificationSnapshot> {
  const { baseline, capture, proof, launch } = input;
  assertOriginalCurrentSymbolBaselineCopy(baseline, engine);
  const baselineOrigin = issued.get(baseline); need(baselineOrigin !== undefined, "Current symbol finish snapshot lost its baseline issuer.");
  const previous = predecessor === undefined ? undefined : assertOriginalCurrentSymbolFinishSnapshot(predecessor, engine);
  const origin = previous === undefined ? baselineOrigin : { closedLaunch: previous.launch, closedSession: previous.capture.bridgeSession };
  if (predecessor === undefined) {
    need(!finishAttempts.has(baseline), "Current symbol finish snapshot attempt already consumed."); finishAttempts.add(baseline);
  } else {
    need(previous?.baseline === baseline && !verificationAttempts.has(predecessor), "Current symbol verification snapshot attempt consumed or baseline changed.");
    verificationAttempts.add(predecessor);
  }
  const phase = predecessor === undefined ? "closed-edit" : "closed-verification";
  const priorCopy = predecessor?.copy ?? baseline.copy;
  const inputText = canonicalJson(input), sourcePath = baseline.checkpoint.source;
  const reader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(typeof reader === "function", "Current symbol finish snapshot cannot inspect bridge scope.");
  // oxlint-disable-next-line typescript/unbound-method -- Identity is retained and every call supplies the original engine receiver.
  const clockReader = engine.clockObservationForClosedCapture;
  const evidence: { readonly value: unknown; readonly text: string }[] = [];
  const unchanged = (): void => {
    assertOriginalCurrentSymbolBaselineCopy(baseline, engine);
    if (predecessor !== undefined) { need(assertOriginalCurrentSymbolFinishSnapshot(predecessor, engine) === previous, "Current symbol verification predecessor changed."); }
    need(canonicalJson(input) === inputText && engine.upstream.currentAuthenticatedBridgeDispatchBinding === reader &&
      reader.call(engine.upstream) === undefined && engine.clockObservationForClosedCapture === clockReader &&
      evidence.every((item) => canonicalJson(item.value) === item.text), "Current symbol finish snapshot inputs or evidence changed.");
    closeBinding({ ...input, owner: baseline.owner }, { launchProjection: launch, bridgeSession: capture.bridgeSession }, phase);
    need(proof.proofSha256 !== priorCopy.closureProofSha256 && priorCopy.source === sourcePath &&
      launch.helperInstance === origin.closedLaunch.helperInstance && launch.jobId !== origin.closedLaunch.jobId &&
      capture.bridgeSession.gatewayInstanceId === origin.closedSession.gatewayInstanceId &&
      capture.bridgeSession.sessionId !== origin.closedSession.sessionId && capture.bridgeSession.sequence > origin.closedSession.sequence,
      "Current symbol finish snapshot reused its old closure or changed source.");
    assertCurrentClosedSessionCopyAuthority(proof);
  };
  unchanged();
  const clock = await clockReader.call(engine, capture); unchanged();
  const current = async (): Promise<void> => {
    unchanged();
    need(await assertClosedSessionCopyAuthority(proof) === proof, "Current symbol finish snapshot lost its original terminal proof."); unchanged();
    need(await clockReader.call(engine, capture) === clock, "Current symbol finish snapshot lost its original capture."); unchanged();
    need(await assertIssuedWindowsClockObservation(clock) === clock, "Current symbol finish snapshot capture clock changed."); unchanged();
  };
  const retain = (event: CurrentSymbolFinishSnapshotEvidence): void => {
    evidence.push({ value: event.value, text: canonicalJson(event.value) }); onEvidence(Object.freeze(event)); unchanged();
  };
  await current();
  // A stopped opening may own an orphan marker. This is isolated local copying
  // After genuine termination, not a bridge dispatch or quarantine bypass.
  await engine.assertRecoveryOperationIsolated(baseline.owner.operationId); await current();
  const root = await controlRootCapability(); await current();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const policy = { expectedSource: sourcePath, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 };
  const checkpoint = await createCheckpoint({ source: sourcePath, outputDir, label: `current-symbol-finish-${baseline.owner.operationId.slice(-8)}` }, policy);
  retain({ kind: "checkpoint", value: checkpoint }); await current();
  const oldIdentity = baseline.checkpoint.sourceIdentity;
  need(checkpoint.sourceIdentity.dev === oldIdentity.dev && checkpoint.sourceIdentity.ino === oldIdentity.ino &&
    checkpoint.sourceIdentity.birthtimeNs === oldIdentity.birthtimeNs, "Current symbol finish source lineage changed.");
  const copy = await copyClosedProjectBytes({ closureProof: proof, source: sourcePath, expectedSourceSha256: checkpoint.sourceSha256,
    artifactDirectory: operationPath(baseline.owner.operationId).slice(0, -5) });
  retain({ kind: "copy", value: copy }); await current(); copyLineage(checkpoint, copy);
  const inventory = await readClosedCopySqlInventory({ copy, runtime: input.runtime });
  retain({ kind: "inventory", value: inventory }); await current();
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null && inventory.checkpointSha256 === copy.sha256,
    "Current symbol finish SQL reader did not complete for its original raw copy.");
  const target = baseline.preparation.target;
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256,
    projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" }); await current();
  need(history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.projectOwnerUuid === target.ownerUuid,
    "Current symbol finish native project, branch or owner changed.");
  const receipt = await readArtifact(checkpoint.receiptPath, 0, 65_536); await current();
  need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(checkpoint), "Current symbol finish checkpoint receipt changed.");
  const verified = await verifyCheckpoint(checkpoint.receiptPath, policy); await current();
  need(verified.ok && !verified.sourceChanged && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint &&
    verified.source === sourcePath && verified.checkpoint === checkpoint.checkpoint && verified.sourceSha256 === copy.sha256 &&
    verified.checkpointSha256 === checkpoint.checkpointSha256, "Current symbol finish source or checkpoint changed during capture.");
  const result = Object.freeze({ ...(predecessor === undefined ? { profile: "private.current-symbol-finish-snapshot.v1" as const } :
    { profile: "private.current-symbol-verification-snapshot.v1" as const, posteditCopyReceiptSha256: predecessor.copy.receiptSha256 }), checkpoint, copy,
    sql: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 },
    native: { projectUuid: history.projectUuid, branchUuid: history.branchUuid, ownerUuid: history.projectOwnerUuid,
      headHistoryUuid: history.headHistoryUuid, historyRows: history.historyRowCount, chunks: history.chunkCount,
      documents: history.documents.length, historySemanticSha256: history.semanticSha256 },
    baselineCopyReceiptSha256: baseline.copy.receiptSha256, snapshotCaptured: true,
    openingEffectsVerified: false, persistenceVerified: false, writerReady: false, executionAuthorized: false });
  const original: OriginalCurrentSymbolSnapshot = Object.freeze({ baseline, inventory, capture, proof, launch });
  snapshots.set(result, { engine, original, text: canonicalJson(result), originalText: canonicalJson(original) });
  return result;
}
