/** Original PCB opening to closed raw-SQL baseline. No symbol owner conversion,
 * native writer, producer qualification or new opening is provided here.
 */
/* oxlint-disable import/max-dependencies -- Compose maintained original-owner, capture, closed-file and full-history readers without caller-selected authority callbacks. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import { canonicalJson, isRecord, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { assertCompletedCurrentPcbRenameOpeningTransfer, revalidateCurrentPcbRenameOpeningEvidence, revalidateCurrentPcbRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentPcbRenameOpeningOwner, CurrentPcbRenameOpeningOwnerSource } from "./current-disposable-open-runtime.ts";
import { currentPcbStoredHeaderSchema } from "./current-pcb-stored-header.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";

type Inventory = Awaited<ReturnType<typeof readClosedCopySqlInventory>>;
const metadataSchema = z.object({ title: z.string().min(1).max(512), parent: z.literal(""), source: z.literal(""),
  board: z.union([z.literal(""), z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u)]), zIndex: z.null() }).strict();
export interface CurrentPcbRenameBaselineInput {
  readonly owner: CurrentPcbRenameOpeningOwner;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly proof: ClosedSessionTerminationProof;
  readonly runtime: MachineProfile["runtime"];
}
export type CurrentPcbRenameBaselineEvidence = Readonly<{ kind: "checkpoint"; value: CheckpointReceipt }> |
  Readonly<{ kind: "copy"; value: ClosedFileCopyReceipt }> | Readonly<{ kind: "inventory"; value: Inventory }>;
export interface CurrentPcbRenameBaseline {
  readonly profile: "private.current-pcb-rename-baseline.v1";
  readonly owner: CurrentPcbRenameOpeningOwner;
  readonly intent: CurrentPcbRenameOpeningOwnerSource["intent"];
  readonly checkpoint: CheckpointReceipt;
  readonly copy: ClosedFileCopyReceipt;
  readonly inventory: Inventory;
  readonly history: NativeHistorySnapshot;
  readonly targetMetadata: Readonly<z.infer<typeof metadataSchema>>;
  readonly targetHeader: Readonly<z.infer<typeof currentPcbStoredHeaderSchema>>;
  readonly maximumTicket: number;
  readonly rawHistorySha256: string;
  readonly originalOpeningBound: true;
  readonly originalCaptureBound: true;
  readonly originalTerminationBound: true;
  readonly completeRawSqlCaptured: true;
  readonly openingEffectsVerified: false;
  readonly producerBindingVerified: false;
  readonly startupQualified: false;
  readonly writerAuthority: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly result: CurrentPcbRenameBaseline;
  readonly engine: EasyedaControlEngine;
  readonly source: CurrentPcbRenameOpeningOwnerSource;
  readonly input: CurrentPcbRenameBaselineInput;
  readonly proof: ClosedSessionTerminationProof;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchText: string;
  readonly inputText: string;
  readonly clock: IssuedWindowsClockObservation;
  readonly clockReader: EasyedaControlEngine["clockObservationForClosedCapture"];
  readonly scopeReader: NonNullable<EasyedaControlEngine["upstream"]["currentAuthenticatedBridgeDispatchBinding"]>;
  readonly resultText: string;
}
const attempts = new WeakSet<CurrentPcbRenameOpeningOwner>(), baselines = new WeakMap<object, Original>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB baseline: ${message}`); }
}

/** Projection equality supplements original capture/proof issuers below; it
 * never turns JSON or self-hashes into closure authority.
 */
function closure(input: CurrentPcbRenameBaselineInput, original: CurrentPcbRenameOpeningOwnerSource): void {
  const { owner, capture, intent, closeReceipt, proof } = input, { launchProjection: launch, bridgeSession } = original.source;
  const authority = capture.executionAuthority, { authoritySha256, ...authorityPayload } = authority;
  const { closeIntentSha256, ...intentPayload } = intent, { closeReceiptSha256, ...receiptPayload } = closeReceipt;
  need(capture.operationId === owner.operationId && capture.phase === "closed-baseline" && capture.challengeAttempt === 1 &&
    canonicalJson(capture.bridgeSession) === canonicalJson(bridgeSession) && authoritySha256 === sha256Json(authorityPayload) &&
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
  "closure differs from the original PCB operation, capture, launch or session");
}
function copyLineage(checkpoint: CheckpointReceipt, copy: ClosedFileCopyReceipt): void {
  const lineage = checkpoint.sourceIdentity, source = copy.sourceIdentity, stat = checkpoint["sourceStatAfter"];
  need(copy.source === checkpoint.source && copy.sha256 === checkpoint.sourceSha256 && String(copy.bytes) === source.size &&
    lineage.dev === source.device && lineage.ino === source.inode && lineage.birthtimeNs === source.birthtimeNs && lineage.ctimeNs === source.ctimeNs &&
    isRecord(stat) && stat["size"] === source.size && stat["mtimeNs"] === source.mtimeNs && stat["ctimeNs"] === source.ctimeNs,
  "raw source identity differs from its checkpoint");
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
      stat.birthtimeNs.toString() === identity.birthtimeNs && stat.ctimeNs.toString() === identity.ctimeNs, "source/checkpoint file identity changed");
  }
}
export function assertOriginalCurrentPcbRenameBaseline(value: unknown, engine: EasyedaControlEngine): CurrentPcbRenameBaseline {
  need(value !== null && typeof value === "object", "original baseline is missing");
  const original = baselines.get(value);
  need(original !== undefined && original.engine === engine && canonicalJson(value) === original.resultText &&
    original.input.proof === original.proof && original.input.capture === original.capture &&
    original.source.source.launchProjection === original.launch && canonicalJson(original.launch) === original.launchText &&
    canonicalJson(original.input) === original.inputText, "baseline was not issued unchanged by this engine");
  // This is historical identity only. A fresh assertion of its old live session
  // Would incorrectly revive or reject evidence after the deliberate relaunch.
  return original.result;
}

/** Bind scratch-time evidence to the original closed operation/proof object.
 * This historical lookup does not itself revalidate live copy authority.
 */
export function currentPcbRenameBaselineClockBinding(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Readonly<{
  journalOperationId: string; phase: "closed-baseline"; proof: ClosedSessionTerminationProof;
}> {
  assertOriginalCurrentPcbRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline clock issuer was lost");
  return Object.freeze({ journalOperationId: value.owner.operationId, phase: "closed-baseline", proof: original.proof });
}

/** Historical original lineage only. Fresh closure authority must come from
 * the later generation's own capture/proof, never this retired opening.
 */
export function currentPcbRenameBaselineOrigin(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Readonly<{
  capture: ClosedSessionAuthorityCapture; launch: CurrentPcbRenameOpeningOwnerSource["source"]["launchProjection"];
}> {
  assertOriginalCurrentPcbRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline origin was lost");
  return Object.freeze({ capture: original.capture, launch: original.launch });
}

/** Capture once after the original opening's normal closure. The complete raw
 * SQL reader and original held capture remain separate from the vacuum copy.
 */
export async function captureCurrentPcbRenameBaseline(engine: EasyedaControlEngine, input: CurrentPcbRenameBaselineInput,
  onEvidence: (event: CurrentPcbRenameBaselineEvidence) => void): Promise<CurrentPcbRenameBaseline> {
  const original = assertCompletedCurrentPcbRenameOpeningTransfer(input.owner, engine), { source, intent: rename } = original;
  need(!attempts.has(input.owner), "capture attempt was already consumed"); attempts.add(input.owner);
  const inputText = canonicalJson(input), originalText = canonicalJson({ target: source.target, intent: rename, checkpoint: source.preNavigationCheckpoint });
  const { proof: retainedProof, capture: retainedCapture } = input;
  const retainedLaunch = source.launchProjection, retainedLaunchText = canonicalJson(retainedLaunch);
  const sourcePath = source.preNavigationCheckpoint.checkpoint.source;
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(source.purpose === "disposable-validation" && sourcePath === normalizeEasyedaProjectPath(source.target.rawWindowsPath) &&
    rename.target.projectUuid === source.target.projectUuid && rename.target.branchUuid === source.target.branchUuid &&
    rename.target.pcbUuid === source.target.documentUuid && typeof scopeReader === "function", "opening target, path or purpose differs");
  // oxlint-disable-next-line typescript/unbound-method -- Identity is retained and calls below use the original engine receiver.
  const clockReader = engine.clockObservationForClosedCapture;
  const retainedEvidence: { readonly value: unknown; readonly text: string }[] = [];
  const unchanged = (): void => {
    need(assertCompletedCurrentPcbRenameOpeningTransfer(input.owner, engine) === original && canonicalJson(input) === inputText &&
      input.proof === retainedProof && input.capture === retainedCapture &&
      source.launchProjection === retainedLaunch && canonicalJson(retainedLaunch) === retainedLaunchText &&
      canonicalJson({ target: source.target, intent: rename, checkpoint: source.preNavigationCheckpoint }) === originalText &&
      engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(engine.upstream) === undefined &&
      engine.clockObservationForClosedCapture === clockReader && retainedEvidence.every(item => canonicalJson(item.value) === item.text),
    "original owner, input, retained evidence or no-dispatch scope changed");
    closure(input, original); assertCurrentClosedSessionCopyAuthority(input.proof);
  };
  unchanged(); const clock = await clockReader.call(engine, input.capture); unchanged();
  const current = async (): Promise<void> => {
    unchanged(); need(await assertClosedSessionCopyAuthority(input.proof) === input.proof, "original termination proof changed"); unchanged();
    need(await clockReader.call(engine, input.capture) === clock, "original capture changed"); unchanged();
    need(await assertIssuedWindowsClockObservation(clock) === clock, "capture clock issuer changed"); unchanged();
    need(await revalidateCurrentPcbRenameOpeningOwner(input.owner, engine) === original, "original opening owner changed"); unchanged();
  };
  const retain = (event: CurrentPcbRenameBaselineEvidence): void => {
    retainedEvidence.push({ value: event.value, text: canonicalJson(event.value) }); onEvidence(Object.freeze(event)); unchanged();
  };
  await current(); const root = await controlRootCapability(); await current();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = await createCheckpoint({ source: sourcePath, outputDir, label: `current-pcb-baseline-${input.owner.operationId.slice(-8)}` },
    { expectedSource: sourcePath, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 });
  retain({ kind: "checkpoint", value: checkpoint }); await current();
  const identity = source.preNavigationCheckpoint.checkpoint.sourceIdentity;
  need(checkpoint.sourceIdentity.dev === identity.dev && checkpoint.sourceIdentity.ino === identity.ino &&
    checkpoint.sourceIdentity.birthtimeNs === identity.birthtimeNs, "source was replaced after original opening");
  const copy = await copyClosedProjectBytes({ closureProof: input.proof, source: sourcePath, expectedSourceSha256: checkpoint.sourceSha256,
    artifactDirectory: operationPath(input.owner.operationId).slice(0, -5) });
  retain({ kind: "copy", value: copy }); await current(); copyLineage(checkpoint, copy);
  const inventory = await readClosedCopySqlInventory({ copy, runtime: input.runtime }); retain({ kind: "inventory", value: inventory }); await current();
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null && inventory.checkpointSha256 === copy.sha256,
    "complete SQL reader did not finish for its original raw copy");
  // Despite its historical name this maintained decoder is document-neutral.
  // No symbol preparation, owner, writer or saved-content token is consumed.
  const decoded = await decodeCurrentSymbolPreEditHistory(inventory, { projectUuid: rename.target.projectUuid, branchUuid: rename.target.branchUuid }); await current();
  const history = decoded.history, matches = history.documents.filter(document => document.uuid === rename.target.pcbUuid);
  const document = matches[0];
  need(history.projectUuid === rename.target.projectUuid && history.branchUuid === rename.target.branchUuid &&
    history.projectOwnerUuid === rename.target.ownerUuid && matches.length === 1 && document?.docType === "PCB" && !isNativeDocumentDeleted(document),
  "complete history differs from the original PCB/project/default-branch/owner");
  const entries = document.records.filter(record => record.id === "META" || record.type === "META"), entry = entries[0];
  need(entries.length === 1 && entry?.id === "META" && entry.type === "META", "unique ordinary PCB META is missing");
  const targetHeader = currentPcbStoredHeaderSchema.parse(document.metadata), targetMetadata = metadataSchema.parse(entry.body);
  need(targetHeader.uuid === document.uuid && JSON.stringify(targetMetadata) === JSON.stringify(entry.body) &&
    targetMetadata.title !== rename.desiredTitle, "PCB metadata/header is unsupported or desired title is unchanged");
  await verifyReceipt(checkpoint, current); await current();
  need(readerCompletion(inventory) === completion, "original SQL completion changed");
  const result: CurrentPcbRenameBaseline = freezeDeep({ profile: "private.current-pcb-rename-baseline.v1", owner: input.owner, intent: rename,
    checkpoint, copy, inventory, history, targetMetadata, targetHeader, maximumTicket: decoded.maximumTicket, rawHistorySha256: sha256Json(decoded.links),
    originalOpeningBound: true, originalCaptureBound: true, originalTerminationBound: true, completeRawSqlCaptured: true,
    openingEffectsVerified: false, producerBindingVerified: false, startupQualified: false, writerAuthority: false, executionAuthorized: false });
  baselines.set(result, { result, engine, source: original, input, inputText, proof: retainedProof, capture: retainedCapture,
    launch: retainedLaunch, launchText: retainedLaunchText,
    clock, clockReader, scopeReader, resultText: canonicalJson(result) }); return result;
}

/** Last source/capture check before a new launch invalidates this old closure.
 * The baseline remains historical evidence after release, not relaunch authority.
 */
export async function revalidateCurrentPcbRenameBaseline(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
  await revalidateBaselineEvidence(value, engine, revalidateCurrentPcbRenameOpeningOwner);
}

/** Fixed closed-clock reader. It preserves fresh original closure/helper and
 * complete targeted file checks, but issues no global admission. Only the PCB
 * scratch coordinator uses it between its four full admission boundaries.
 */
export async function revalidateCurrentPcbRenameClosedClockEvidence(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
  await assertClosedClockSidecarsAbsent(value, engine);
  await revalidateBaselineEvidence(value, engine, revalidateCurrentPcbRenameOpeningEvidence);
  await assertClosedClockSidecarsAbsent(value, engine);
}

/** Original live bindings only, paired with the fixed async evidence reader and
 * fresh full admission. No file/admission result or clock sample is cached.
 */
export function assertCurrentPcbRenameClosedClockBinding(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): void {
  currentBaselineBinding(value, engine);
}

async function assertClosedClockSidecarsAbsent(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
  const original = currentBaselineBinding(value, engine);
  const current = (): void => {
    need(currentBaselineBinding(value, engine) === original, "closed-clock sidecar owner changed");
  };
  for (const path of [value.checkpoint.source, value.checkpoint.checkpoint, value.copy.artifact]) {
    for (const suffix of ["-wal", "-shm", "-journal"]) {
      current();
      const absent = await lstat(`${path}${suffix}`).then(() => false, (error: unknown) => {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") { return true; }
        throw error;
      });
      current(); need(absent, "closed-clock source, checkpoint or raw copy has a SQLite sidecar");
    }
  }
}

function currentBaselineBinding(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine): Original {
  assertOriginalCurrentPcbRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline issuer was lost");
  need(assertCompletedCurrentPcbRenameOpeningTransfer(value.owner, engine) === original.source &&
    engine.clockObservationForClosedCapture === original.clockReader && engine.upstream.currentAuthenticatedBridgeDispatchBinding === original.scopeReader &&
    original.scopeReader.call(engine.upstream) === undefined, "original baseline owner, capture reader or no-dispatch scope changed");
  closure(original.input, original.source); assertIssuedClosedFileCopy(value.copy); assertCurrentClosedSessionCopyAuthority(original.input.proof);
  return original;
}

// Private composition only. The two exported readers bind fixed implementations;
// No tool or exported function accepts a caller-supplied verifier or skip flag.
async function revalidateBaselineEvidence(value: CurrentPcbRenameBaseline, engine: EasyedaControlEngine,
  revalidateOpening: typeof revalidateCurrentPcbRenameOpeningOwner): Promise<void> {
  const original = currentBaselineBinding(value, engine);
  const unchanged = (): void => {
    need(currentBaselineBinding(value, engine) === original, "original baseline binding changed");
  };
  const current = async (): Promise<void> => {
    unchanged(); need(await assertClosedSessionCopyAuthority(original.input.proof) === original.input.proof, "original closed authority changed"); unchanged();
    need(await original.clockReader.call(engine, original.input.capture) === original.clock, "original capture was released or changed"); unchanged();
    need(await assertIssuedWindowsClockObservation(original.clock) === original.clock, "capture clock issuer changed"); unchanged();
    need(await revalidateOpening(value.owner, engine) === original.source, "opening owner changed"); unchanged();
  };
  await current(); await verifyReceipt(value.checkpoint, current);
  await verifyExactManagedArtifact({ path: value.copy.artifact, bytes: value.copy.bytes, sha256: value.copy.sha256 }); await current();
  copyLineage(value.checkpoint, value.copy);
  const completion = readerCompletion(value.inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
    value.inventory.checkpointSha256 === value.copy.sha256, "original SQL reader lineage changed");
}
