/** Original SCH opening to closed raw-SQL baseline. No symbol owner conversion,
 * native writer, producer qualification or new opening is provided here.
 */
/* oxlint-disable import/max-dependencies -- Compose maintained original-owner, capture, closed-file and full-history readers without caller-selected authority callbacks. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { types } from "node:util";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import { canonicalJson, isRecord, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { assertCompletedCurrentSchematicRenameOpeningTransfer, revalidateCurrentSchematicRenameOpeningEvidence, revalidateCurrentSchematicRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentSchematicRenameOpeningOwner, CurrentSchematicRenameOpeningOwnerSource } from "./current-disposable-open-runtime.ts";
import { assertOriginalCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import { assertOriginalCurrentSchematicNativeMetadata, prepareCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { currentSchematicStoredHeaderSchema } from "./current-schematic-stored-header.ts";
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
const metadataSchema = z.object({ title: z.string().min(1).max(512), source: z.literal(""),
  board: z.union([z.literal(""), z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u)]), zIndex: z.null() }).strict();
export interface CurrentSchematicRenameBaselineInput {
  readonly owner: CurrentSchematicRenameOpeningOwner;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly proof: ClosedSessionTerminationProof;
  readonly runtime: MachineProfile["runtime"];
}
export type CurrentSchematicRenameBaselineEvidence = Readonly<{ kind: "checkpoint"; value: CheckpointReceipt }> |
  Readonly<{ kind: "copy"; value: ClosedFileCopyReceipt }> | Readonly<{ kind: "inventory"; value: Inventory }>;
export interface CurrentSchematicRenameBaseline {
  readonly profile: "private.current-schematic-rename-baseline.v1";
  readonly owner: CurrentSchematicRenameOpeningOwner;
  readonly intent: CurrentSchematicRenameOpeningOwnerSource["intent"];
  readonly checkpoint: CheckpointReceipt;
  readonly copy: ClosedFileCopyReceipt;
  readonly inventory: Inventory;
  readonly metadata: CurrentSchematicNativeMetadata;
  readonly children: CurrentSchematicChildRoster;
  readonly history: NativeHistorySnapshot;
  readonly targetMetadata: Readonly<z.infer<typeof metadataSchema>>;
  readonly targetHeader: Readonly<z.infer<typeof currentSchematicStoredHeaderSchema>>;
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
  readonly result: CurrentSchematicRenameBaseline;
  readonly engine: EasyedaControlEngine;
  readonly source: CurrentSchematicRenameOpeningOwnerSource;
  readonly input: CurrentSchematicRenameBaselineInput;
  readonly proof: ClosedSessionTerminationProof;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchText: string;
  readonly inputText: string;
  readonly clock: IssuedWindowsClockObservation;
  readonly clockReader: EasyedaControlEngine["clockObservationForClosedCapture"];
  readonly scopeReader: NonNullable<EasyedaControlEngine["upstream"]["currentAuthenticatedBridgeDispatchBinding"]>;
}
const attempts = new WeakSet<CurrentSchematicRenameOpeningOwner>(), baselines = new WeakMap<object, Original>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current SCH baseline: ${message}`); }
}

/** Certify only the internally built, deeply frozen data graph, never an owner.
 * The SQL reader already bounds encoded output to 16 MiB and the history
 * decoder bounds plaintext to 8 MiB. Visit each object once with an explicit
 * stack, without imposing a smaller object/depth limit on those admitted data.
 * Mutable captures, proofs, engines and methods stay in Original and retain
 * their existing checks; this certificate grants no file or live authority.
 */
function certifyFrozenBaselineData(input: unknown): void {
  interface Frame { readonly value: object; readonly keys: readonly PropertyKey[]; readonly array: boolean; readonly length: number; index: number }
  const active = new WeakSet<object>(), completed = new WeakSet<object>(), stack: Frame[] = [];
  const enter = (value: unknown): void => {
    if (value === null || typeof value === "string" || typeof value === "boolean") { return; }
    if (typeof value === "number") { need(Number.isFinite(value), "frozen baseline data must be finite JSON"); return; }
    need(typeof value === "object" && !types.isProxy(value), "frozen baseline data must be plain own data");
    if (completed.has(value)) { return; }
    need(!active.has(value), "frozen baseline data must be acyclic");
    const array = Array.isArray(value), prototype: unknown = Object.getPrototypeOf(value);
    need((array ? prototype === Array.prototype : prototype === Object.prototype || prototype === null) && Object.isFrozen(value),
      "frozen baseline data has a mutable or exotic object");
    const descriptor = array ? Object.getOwnPropertyDescriptor(value, "length") : undefined, keys = Reflect.ownKeys(value);
    const length: unknown = descriptor?.value;
    need(!array || descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof length === "number" &&
      Number.isSafeInteger(length) && length >= 0 && keys.length === length + 1, "frozen baseline data requires dense arrays");
    active.add(value); stack.push({ value, keys, array, length: typeof length === "number" ? length : 0, index: 0 });
  };
  enter(input);
  while (stack.length > 0) {
    const frame = stack.at(-1); need(frame !== undefined, "frozen baseline traversal lost its frame");
    if (frame.index === frame.keys.length) { active.delete(frame.value); completed.add(frame.value); stack.pop(); }
    else {
      const key = frame.keys[frame.index]; frame.index += 1;
      need(typeof key === "string", "frozen baseline data refuses symbol keys");
      const descriptor = Object.getOwnPropertyDescriptor(frame.value, key);
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.configurable === false && descriptor.writable === false,
        "frozen baseline data refuses accessors or mutable properties");
      if (frame.array && key === "length") { need(descriptor.enumerable === false, "frozen array length differs"); }
      else {
        need(descriptor.enumerable === true, "frozen baseline data refuses hidden properties");
        need(!frame.array || String(Number(key)) === key && Number.isSafeInteger(Number(key)) && Number(key) >= 0 && Number(key) < frame.length,
          "frozen baseline data refuses non-index array properties");
        enter(descriptor.value as unknown);
      }
    }
  }
}

/** Projection equality supplements original capture/proof issuers below; it
 * never turns JSON or self-hashes into closure authority.
 */
function closure(input: CurrentSchematicRenameBaselineInput, original: CurrentSchematicRenameOpeningOwnerSource): void {
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
  "closure differs from the original SCH operation, capture, launch or session");
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
export function assertOriginalCurrentSchematicRenameBaseline(value: unknown, engine: EasyedaControlEngine): CurrentSchematicRenameBaseline {
  need(value !== null && typeof value === "object", "original baseline is missing");
  const original = baselines.get(value);
  need(original !== undefined && original.result === value && original.engine === engine &&
    original.input.proof === original.proof && original.input.capture === original.capture &&
    original.source.source.launchProjection === original.launch && canonicalJson(original.launch) === original.launchText &&
    canonicalJson(original.input) === original.inputText, "baseline was not issued unchanged by this engine");
  // This is historical identity only. A fresh assertion of its old live session
  // Would incorrectly revive or reject evidence after the deliberate relaunch.
  assertOriginalCurrentSchematicNativeMetadata(original.result.metadata, original.result.inventory);
  assertOriginalCurrentSchematicChildRoster(original.result.children, original.result.inventory, original.result.metadata);
  return original.result;
}

/** Bind scratch-time evidence to the original closed operation/proof object.
 * This historical lookup does not itself revalidate live copy authority.
 */
export function currentSchematicRenameBaselineClockBinding(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Readonly<{
  journalOperationId: string; phase: "closed-baseline"; proof: ClosedSessionTerminationProof;
}> {
  assertOriginalCurrentSchematicRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline clock issuer was lost");
  return Object.freeze({ journalOperationId: value.owner.operationId, phase: "closed-baseline", proof: original.proof });
}

/** Historical original lineage only. Fresh closure authority must come from
 * the later generation's own capture/proof, never this retired opening.
 */
export function currentSchematicRenameBaselineOrigin(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Readonly<{
  capture: ClosedSessionAuthorityCapture; launch: CurrentSchematicRenameOpeningOwnerSource["source"]["launchProjection"];
}> {
  assertOriginalCurrentSchematicRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline origin was lost");
  return Object.freeze({ capture: original.capture, launch: original.launch });
}

/** Capture once after the original opening's normal closure. The complete raw
 * SQL reader and original held capture remain separate from the vacuum copy.
 */
export async function captureCurrentSchematicRenameBaseline(engine: EasyedaControlEngine, input: CurrentSchematicRenameBaselineInput,
  onEvidence: (event: CurrentSchematicRenameBaselineEvidence) => void): Promise<CurrentSchematicRenameBaseline> {
  const original = assertCompletedCurrentSchematicRenameOpeningTransfer(input.owner, engine), { source, intent: rename } = original;
  need(!attempts.has(input.owner), "capture attempt was already consumed"); attempts.add(input.owner);
  const inputText = canonicalJson(input), originalText = canonicalJson({ target: source.target, intent: rename, checkpoint: source.preNavigationCheckpoint });
  const { proof: retainedProof, capture: retainedCapture } = input;
  const retainedLaunch = source.launchProjection, retainedLaunchText = canonicalJson(retainedLaunch);
  const sourcePath = source.preNavigationCheckpoint.checkpoint.source;
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(source.purpose === "disposable-validation" && sourcePath === normalizeEasyedaProjectPath(source.target.rawWindowsPath) &&
    rename.target.projectUuid === source.target.projectUuid && rename.target.branchUuid === source.target.branchUuid &&
    typeof scopeReader === "function", "opening target, path or purpose differs");
  // The neutral opener initially owns a PCB. Only its project/branch transfers;
  // The distinct SCH UUID and project owner are bound below by original SQL.
  // oxlint-disable-next-line typescript/unbound-method -- Identity is retained and calls below use the original engine receiver.
  const clockReader = engine.clockObservationForClosedCapture;
  const retainedEvidence: { readonly value: unknown; readonly text: string }[] = [];
  const unchanged = (): void => {
    need(assertCompletedCurrentSchematicRenameOpeningTransfer(input.owner, engine) === original && canonicalJson(input) === inputText &&
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
    need(await revalidateCurrentSchematicRenameOpeningOwner(input.owner, engine) === original, "original opening owner changed"); unchanged();
  };
  const retain = (event: CurrentSchematicRenameBaselineEvidence): void => {
    retainedEvidence.push({ value: event.value, text: canonicalJson(event.value) }); onEvidence(Object.freeze(event)); unchanged();
  };
  await current(); const root = await controlRootCapability(); await current();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = await createCheckpoint({ source: sourcePath, outputDir, label: `current-schematic-baseline-${input.owner.operationId.slice(-8)}` },
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
  const history = decoded.history, matches = history.documents.filter(document => document.uuid === rename.target.schematicUuid);
  const document = matches[0];
  need(history.projectUuid === rename.target.projectUuid && history.branchUuid === rename.target.branchUuid &&
    history.projectOwnerUuid === rename.target.ownerUuid && matches.length === 1 && document?.docType === "SCH" && !isNativeDocumentDeleted(document),
  "complete history differs from the original SCH/project/default-branch/owner");
  const entries = document.records.filter(record => record.id === "META" || record.type === "META"), entry = entries[0];
  need(entries.length === 1 && entry?.id === "META" && entry.type === "META", "unique ordinary SCH META is missing");
  const targetHeader = currentSchematicStoredHeaderSchema.parse(document.metadata), targetMetadata = metadataSchema.parse(entry.body);
  need(targetHeader.uuid === document.uuid && JSON.stringify(targetMetadata) === JSON.stringify(entry.body) &&
    targetMetadata.title !== rename.desiredTitle, "SCH metadata/header is unsupported or desired title is unchanged");
  const metadata = await prepareCurrentSchematicNativeMetadata({ before: inventory, target: rename.target, desiredTitle: rename.desiredTitle }); await current();
  const children = await prepareCurrentSchematicChildRoster(metadata, inventory); await current();
  assertOriginalCurrentSchematicNativeMetadata(metadata, inventory); assertOriginalCurrentSchematicChildRoster(children, inventory, metadata);
  await verifyReceipt(checkpoint, current); await current();
  need(readerCompletion(inventory) === completion, "original SQL completion changed");
  const result: CurrentSchematicRenameBaseline = freezeDeep({ profile: "private.current-schematic-rename-baseline.v1", owner: input.owner, intent: rename,
    checkpoint, copy, inventory, metadata, children, history, targetMetadata, targetHeader, maximumTicket: decoded.maximumTicket, rawHistorySha256: sha256Json(decoded.links),
    originalOpeningBound: true, originalCaptureBound: true, originalTerminationBound: true, completeRawSqlCaptured: true,
    openingEffectsVerified: false, producerBindingVerified: false, startupQualified: false, writerAuthority: false, executionAuthorized: false });
  certifyFrozenBaselineData(result);
  baselines.set(result, { result, engine, source: original, input, inputText, proof: retainedProof, capture: retainedCapture,
    launch: retainedLaunch, launchText: retainedLaunchText,
    clock, clockReader, scopeReader }); return result;
}

/** Last source/capture check before a new launch invalidates this old closure.
 * The baseline remains historical evidence after release, not relaunch authority.
 */
export async function revalidateCurrentSchematicRenameBaseline(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
  await revalidateBaselineEvidence(value, engine, revalidateCurrentSchematicRenameOpeningOwner);
}

/** Fixed closed-clock reader for future private clock composition. It preserves
 * fresh original closure/helper and complete targeted file checks, but issues
 * no global admission or Windows clock qualification. No SCH clock coordinator
 * is registered yet.
 */
export async function revalidateCurrentSchematicRenameClosedClockEvidence(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
  await assertClosedClockSidecarsAbsent(value, engine);
  await revalidateBaselineEvidence(value, engine, revalidateCurrentSchematicRenameOpeningEvidence);
  await assertClosedClockSidecarsAbsent(value, engine);
}

/** Original live bindings only, paired with the fixed async evidence reader and
 * fresh full admission. No file/admission result or clock sample is cached.
 */
export function assertCurrentSchematicRenameClosedClockBinding(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): void {
  currentBaselineBinding(value, engine);
}

async function assertClosedClockSidecarsAbsent(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Promise<void> {
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

function currentBaselineBinding(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine): Original {
  assertOriginalCurrentSchematicRenameBaseline(value, engine);
  const original = baselines.get(value); need(original !== undefined, "baseline issuer was lost");
  need(assertCompletedCurrentSchematicRenameOpeningTransfer(value.owner, engine) === original.source &&
    engine.clockObservationForClosedCapture === original.clockReader && engine.upstream.currentAuthenticatedBridgeDispatchBinding === original.scopeReader &&
    original.scopeReader.call(engine.upstream) === undefined, "original baseline owner, capture reader or no-dispatch scope changed");
  closure(original.input, original.source); assertIssuedClosedFileCopy(value.copy); assertCurrentClosedSessionCopyAuthority(original.input.proof);
  return original;
}

// Private composition only. The two exported readers bind fixed implementations;
// No tool or exported function accepts a caller-supplied verifier or skip flag.
async function revalidateBaselineEvidence(value: CurrentSchematicRenameBaseline, engine: EasyedaControlEngine,
  revalidateOpening: typeof revalidateCurrentSchematicRenameOpeningOwner): Promise<void> {
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

