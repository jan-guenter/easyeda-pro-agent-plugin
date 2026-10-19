/** Original SCH post-write and saved-verification snapshots. Shared file and
 * SQL algorithms are document-neutral; no PCB or symbol lifecycle token is accepted.
 */
/* oxlint-disable import/max-dependencies -- Compose maintained closed-file, checkpoint, complete SQL and original SCH issuers without alternate authority callbacks. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertOriginalCurrentSchematicRenameBaseline, currentSchematicRenameBaselineOrigin } from "./current-schematic-rename-owner-baseline.ts";
import type { CurrentSchematicRenameBaseline } from "./current-schematic-rename-owner-baseline.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";

type Inventory = Awaited<ReturnType<typeof readClosedCopySqlInventory>>;
type Phase = "closed-edit" | "closed-verification";
export interface CurrentSchematicRenameSnapshotInput {
  readonly baseline: CurrentSchematicRenameBaseline;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly proof: ClosedSessionTerminationProof;
  readonly launch: WindowsAuthorityLaunch;
  readonly runtime: MachineProfile["runtime"];
}
export type CurrentSchematicRenameSnapshotEvidence = Readonly<{ kind: "checkpoint"; value: CheckpointReceipt }> |
  Readonly<{ kind: "copy"; value: ClosedFileCopyReceipt }> | Readonly<{ kind: "inventory"; value: Inventory }>;
export interface CurrentSchematicRenameSnapshot {
  readonly profile: "private.current-schematic-rename-snapshot.v1";
  readonly phase: Phase;
  readonly checkpoint: CheckpointReceipt;
  readonly copy: ClosedFileCopyReceipt;
  readonly sql: Readonly<{ checkpointSha256: string; schemaSha256: string; logicalSha256: string }>;
  readonly native: Readonly<{ projectUuid: string; branchUuid: string; ownerUuid: string; schematicUuid: string;
    headHistoryUuid: string; historyRows: number; chunks: number; documents: number; historySemanticSha256: string }>;
  readonly baselineCopyReceiptSha256: string;
  readonly predecessorCopyReceiptSha256: string;
  readonly snapshotCaptured: true;
  readonly requestedEffectVerified: false;
  readonly persistenceVerified: false;
  readonly writerReady: false;
  readonly executionAuthorized: false;
}
export interface OriginalCurrentSchematicRenameSnapshot {
  readonly baseline: CurrentSchematicRenameBaseline;
  readonly inventory: Inventory;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly proof: ClosedSessionTerminationProof;
  readonly launch: WindowsAuthorityLaunch;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly input: CurrentSchematicRenameSnapshotInput;
  readonly source: OriginalCurrentSchematicRenameSnapshot; readonly inputText: string; readonly text: string;
  readonly captureClock: IssuedWindowsClockObservation;
  readonly clockReader: EasyedaControlEngine["clockObservationForClosedCapture"];
  readonly scopeReader: NonNullable<EasyedaControlEngine["upstream"]["currentAuthenticatedBridgeDispatchBinding"]>;
}
const snapshots = new WeakMap<CurrentSchematicRenameSnapshot, Original>();
const finishAttempts = new WeakSet<CurrentSchematicRenameBaseline>(), verificationAttempts = new WeakSet<CurrentSchematicRenameSnapshot>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Current SCH snapshot: ${message}`); } }

function closure(input: CurrentSchematicRenameSnapshotInput, phase: Phase): void {
  const { baseline, capture, intent, closeReceipt, proof, launch } = input, operationId = baseline.owner.operationId;
  const authority = capture.executionAuthority, { authoritySha256, ...authorityPayload } = authority;
  const roots = authority.processes.filter(process => process.role === "easyeda-main");
  const { closeIntentSha256, ...intentPayload } = intent, { closeReceiptSha256, ...receiptPayload } = closeReceipt;
  need(capture.operationId === operationId && capture.phase === phase && capture.challengeAttempt === 1 &&
    authoritySha256 === sha256Json(authorityPayload) && authority.processTreeSha256 === sha256Json(authority.processes) &&
    roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(launch.root) &&
    authority.processes.every(process => process.startIdentity.endsWith(`:job:${launch.jobId}`)) &&
    intent.schema === "easyeda-pro-control.closed-session-close-intent.v1" && closeIntentSha256 === sha256Json(intentPayload) &&
    intent.operationId === operationId && intent.phase === phase && intent["challengeAttempt"] === 1 &&
    intent.authoritySha256 === authority.authoritySha256 && intent["captureBindingSha256"] === authority.bindingSha256 &&
    intent.launchSha256 === sha256Json(launch) && intent.bridgeSessionSha256 === sha256Json(capture.bridgeSession) &&
    intent.runtimeIdentitySha256 === sha256Json(capture.runtimeIdentity) && intent.helperInstance === launch.helperInstance && intent.jobId === launch.jobId &&
    intent.policyId === authority.policyId && intent.policySha256 === authority.policySha256 &&
    closeReceipt.schema === "easyeda-pro-control.closed-session-close-dispatch.v1" && closeReceiptSha256 === sha256Json(receiptPayload) &&
    closeReceipt.closeIntentSha256 === closeIntentSha256 && closeReceipt.closeDispatched && !closeReceipt.saveOrDiscardSelected && !closeReceipt.terminationProved &&
    proof["operationId"] === operationId && proof["phase"] === phase && proof["challengeAttempt"] === 1 &&
    proof.closeIntentSha256 === closeIntentSha256 && proof.closeReceiptSha256 === closeReceiptSha256 &&
    proof.authoritySha256 === authority.authoritySha256 && proof.launchSha256 === intent.launchSha256 &&
    proof["bridgeSessionSha256"] === intent.bridgeSessionSha256 && proof["runtimeIdentitySha256"] === intent.runtimeIdentitySha256 &&
    proof["helperInstance"] === launch.helperInstance && proof["jobId"] === launch.jobId &&
    proof["policyId"] === authority.policyId && proof["policySha256"] === authority.policySha256,
  "original operation, capture, launch or close evidence differs");
}
function copyLineage(checkpoint: CheckpointReceipt, copy: ClosedFileCopyReceipt): void {
  const lineage = checkpoint.sourceIdentity, source = copy.sourceIdentity, stat = checkpoint["sourceStatAfter"];
  need(copy.source === checkpoint.source && copy.sha256 === checkpoint.sourceSha256 && String(copy.bytes) === source.size &&
    lineage.dev === source.device && lineage.ino === source.inode && lineage.birthtimeNs === source.birthtimeNs && lineage.ctimeNs === source.ctimeNs &&
    isRecord(stat) && stat["size"] === source.size && stat["mtimeNs"] === source.mtimeNs && stat["ctimeNs"] === source.ctimeNs,
  "raw source identity differs from checkpoint");
}
async function verifyReceipt(checkpoint: CheckpointReceipt, current: () => Promise<void>): Promise<void> {
  const root = await controlRootCapability(); await current();
  const receipt = await readArtifact(checkpoint.receiptPath, 0, 65_536); await current();
  need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(checkpoint), "checkpoint receipt changed");
  const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: checkpoint.source,
    artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root, maximumSourceBytes: 268_435_456 }); await current();
  need(verified.ok && !verified.sourceChanged && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint &&
    verified.source === checkpoint.source && verified.sourceSha256 === checkpoint.sourceSha256 && verified.receiptPath === checkpoint.receiptPath &&
    verified.checkpoint === checkpoint.checkpoint && verified.checkpointSha256 === checkpoint.checkpointSha256 &&
    verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 && verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256,
  "closed source/checkpoint or complete logical dump changed");
  for (const [path, identity] of [[checkpoint.source, checkpoint.sourceIdentity], [checkpoint.checkpoint, checkpoint.checkpointIdentity]] as const) {
    const stat = await lstat(path, { bigint: true }); await current();
    need(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && stat.dev.toString() === identity.dev && stat.ino.toString() === identity.ino &&
      stat.birthtimeNs.toString() === identity.birthtimeNs && stat.ctimeNs.toString() === identity.ctimeNs, "source/checkpoint identity changed");
  }
}
export function assertOriginalCurrentSchematicRenameSnapshot(value: CurrentSchematicRenameSnapshot, engine: EasyedaControlEngine): OriginalCurrentSchematicRenameSnapshot {
  const original = snapshots.get(value);
  need(original !== undefined && original.engine === engine && canonicalJson(value) === original.text && canonicalJson(original.input) === original.inputText &&
    original.input.baseline === original.source.baseline && original.input.capture === original.source.capture &&
    original.input.proof === original.source.proof && original.input.launch === original.source.launch, "original snapshot or retained input changed");
  assertOriginalCurrentSchematicRenameBaseline(original.source.baseline, engine); return original.source;
}
/** A historical snapshot stays readable after deliberate relaunch. This async
 * recheck instead requires its still-held original closure and unchanged file.
 */
export async function revalidateCurrentSchematicRenameSnapshot(engine: EasyedaControlEngine, value: CurrentSchematicRenameSnapshot): Promise<void> {
  const source = assertOriginalCurrentSchematicRenameSnapshot(value, engine); const original = snapshots.get(value);
  need(original !== undefined, "original snapshot issuer is absent");
  const unchanged = (): void => {
    need(assertOriginalCurrentSchematicRenameSnapshot(value, engine) === source && engine.clockObservationForClosedCapture === original.clockReader &&
      engine.upstream.currentAuthenticatedBridgeDispatchBinding === original.scopeReader && original.scopeReader.call(engine.upstream) === undefined,
    "original capture reader or closed scope changed");
    closure(original.input, value.phase); assertIssuedClosedFileCopy(value.copy); assertCurrentClosedSessionCopyAuthority(source.proof);
    const completion = readerCompletion(source.inventory);
    need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      source.inventory.checkpointSha256 === value.copy.sha256 && value.copy.closureProofSha256 === source.proof.proofSha256, "original reader or copy lineage changed");
  };
  const current = async (): Promise<void> => {
    unchanged(); need(await assertClosedSessionCopyAuthority(source.proof) === source.proof, "original closure authority changed"); unchanged();
    need(await original.clockReader.call(engine, source.capture) === original.captureClock, "original capture changed"); unchanged();
    need(await assertIssuedWindowsClockObservation(original.captureClock) === original.captureClock, "original capture clock changed"); unchanged();
  };
  await current(); await verifyReceipt(value.checkpoint, current); copyLineage(value.checkpoint, value.copy);
  await verifyExactManagedArtifact({ path: value.copy.artifact, sha256: value.copy.sha256, bytes: value.copy.bytes }); await current();
}
export function captureCurrentSchematicRenameFinishSnapshot(engine: EasyedaControlEngine, input: CurrentSchematicRenameSnapshotInput,
  onEvidence: (event: CurrentSchematicRenameSnapshotEvidence) => void): Promise<CurrentSchematicRenameSnapshot> {
  return captureSnapshot(engine, input, onEvidence);
}
export function captureCurrentSchematicRenameVerificationSnapshot(engine: EasyedaControlEngine,
  input: Omit<CurrentSchematicRenameSnapshotInput, "baseline"> & Readonly<{ finishSnapshot: CurrentSchematicRenameSnapshot }>,
  onEvidence: (event: CurrentSchematicRenameSnapshotEvidence) => void): Promise<CurrentSchematicRenameSnapshot> {
  const original = assertOriginalCurrentSchematicRenameSnapshot(input.finishSnapshot, engine);
  need(input.finishSnapshot.phase === "closed-edit", "verification requires the original post-write snapshot");
  return captureSnapshot(engine, { baseline: original.baseline, capture: input.capture, intent: input.intent, closeReceipt: input.closeReceipt,
    proof: input.proof, launch: input.launch, runtime: input.runtime }, onEvidence, input.finishSnapshot);
}
async function captureSnapshot(engine: EasyedaControlEngine, input: CurrentSchematicRenameSnapshotInput,
  onEvidence: (event: CurrentSchematicRenameSnapshotEvidence) => void, predecessor?: CurrentSchematicRenameSnapshot): Promise<CurrentSchematicRenameSnapshot> {
  const { baseline, capture: retainedCapture, proof, launch } = input;
  assertOriginalCurrentSchematicRenameBaseline(baseline, engine);
  const previous = predecessor === undefined ? undefined : assertOriginalCurrentSchematicRenameSnapshot(predecessor, engine);
  const origin = previous ?? currentSchematicRenameBaselineOrigin(baseline, engine);
  if (predecessor === undefined) { need(!finishAttempts.has(baseline), "finish snapshot attempt consumed"); finishAttempts.add(baseline); } else {
    need(previous?.baseline === baseline && !verificationAttempts.has(predecessor), "verification snapshot attempt consumed or baseline changed"); verificationAttempts.add(predecessor);
  }
  const phase = predecessor === undefined ? "closed-edit" : "closed-verification", priorCopy = predecessor?.copy ?? baseline.copy;
  const inputText = canonicalJson(input), sourcePath = baseline.checkpoint.source;
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding; need(scopeReader !== undefined, "scope reader missing");
  // oxlint-disable-next-line typescript/unbound-method -- Identity only; every invocation retains the engine receiver.
  const clockReader = engine.clockObservationForClosedCapture;
  const evidence: { readonly value: unknown; readonly text: string }[] = [];
  const unchanged = (): void => {
    assertOriginalCurrentSchematicRenameBaseline(baseline, engine);
    if (predecessor !== undefined) { need(assertOriginalCurrentSchematicRenameSnapshot(predecessor, engine) === previous, "predecessor changed"); }
    need(input.baseline === baseline && input.capture === retainedCapture && input.proof === proof && input.launch === launch && canonicalJson(input) === inputText &&
      engine.clockObservationForClosedCapture === clockReader && engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
      scopeReader.call(engine.upstream) === undefined && evidence.every(item => canonicalJson(item.value) === item.text), "input, evidence or closed scope changed");
    closure(input, phase);
    need(proof.proofSha256 !== priorCopy.closureProofSha256 && priorCopy.source === sourcePath && launch.helperInstance === origin.launch.helperInstance &&
      launch.jobId !== origin.launch.jobId && retainedCapture.bridgeSession.gatewayInstanceId === origin.capture.bridgeSession.gatewayInstanceId &&
      retainedCapture.bridgeSession.sessionId !== origin.capture.bridgeSession.sessionId && retainedCapture.bridgeSession.sequence > origin.capture.bridgeSession.sequence,
    "fresh closure reused a prior Job/session or changed source"); assertCurrentClosedSessionCopyAuthority(proof);
  };
  unchanged(); const clock = await clockReader.call(engine, retainedCapture); unchanged();
  const current = async (): Promise<void> => {
    unchanged(); need(await assertClosedSessionCopyAuthority(proof) === proof, "original terminal proof changed"); unchanged();
    need(await clockReader.call(engine, retainedCapture) === clock, "original capture changed"); unchanged();
    need(await assertIssuedWindowsClockObservation(clock) === clock, "original capture clock changed"); unchanged();
  };
  const retain = (event: CurrentSchematicRenameSnapshotEvidence): void => { evidence.push({ value: event.value, text: canonicalJson(event.value) }); onEvidence(Object.freeze(event)); unchanged(); };
  await current(); await engine.assertRecoveryOperationIsolated(baseline.owner.operationId); await current();
  const root = await controlRootCapability(); await current(); const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = await createCheckpoint({ source: sourcePath, outputDir, label: `current-schematic-${phase}-${baseline.owner.operationId.slice(-8)}` },
    { expectedSource: sourcePath, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 }); retain({ kind: "checkpoint", value: checkpoint }); await current();
  const old = baseline.checkpoint.sourceIdentity;
  need(checkpoint.sourceIdentity.dev === old.dev && checkpoint.sourceIdentity.ino === old.ino && checkpoint.sourceIdentity.birthtimeNs === old.birthtimeNs,
    "source replaced since original baseline");
  const copy = await copyClosedProjectBytes({ closureProof: proof, source: sourcePath, expectedSourceSha256: checkpoint.sourceSha256,
    artifactDirectory: operationPath(baseline.owner.operationId).slice(0, -5) }); retain({ kind: "copy", value: copy }); await current(); copyLineage(checkpoint, copy);
  const inventory = await readClosedCopySqlInventory({ copy, runtime: input.runtime }); retain({ kind: "inventory", value: inventory }); await current();
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null && inventory.checkpointSha256 === copy.sha256,
    "original complete raw SQL reader did not finish");
  const target = baseline.intent.target;
  const decoded = await decodeCurrentSymbolPreEditHistory(inventory, { projectUuid: target.projectUuid, branchUuid: target.branchUuid }); await current();
  const { history } = decoded, matches = history.documents.filter(document => document.uuid === target.schematicUuid);
  const document = matches[0];
  need(history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.projectOwnerUuid === target.ownerUuid &&
    matches.length === 1 && document?.docType === "SCH" && !isNativeDocumentDeleted(document),
  "complete history differs from the original SCH/project/default-branch/owner");
  await verifyReceipt(checkpoint, current); await current(); need(readerCompletion(inventory) === completion, "original reader changed");
  const result: CurrentSchematicRenameSnapshot = freezeDeep({ profile: "private.current-schematic-rename-snapshot.v1", phase, checkpoint, copy,
    sql: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 },
    native: { projectUuid: history.projectUuid, branchUuid: history.branchUuid, ownerUuid: history.projectOwnerUuid,
      schematicUuid: target.schematicUuid, headHistoryUuid: history.headHistoryUuid,
      historyRows: history.historyRowCount, chunks: history.chunkCount, documents: history.documents.length, historySemanticSha256: history.semanticSha256 },
    baselineCopyReceiptSha256: baseline.copy.receiptSha256, predecessorCopyReceiptSha256: priorCopy.receiptSha256,
    snapshotCaptured: true, requestedEffectVerified: false, persistenceVerified: false, writerReady: false, executionAuthorized: false });
  const source = Object.freeze({ baseline, inventory, capture: retainedCapture, proof, launch });
  snapshots.set(result, { engine, input, source, inputText, text: canonicalJson(result), captureClock: clock, clockReader, scopeReader }); return result;
}
