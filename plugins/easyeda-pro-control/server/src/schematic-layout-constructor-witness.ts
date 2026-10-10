import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { basename, join } from "node:path";
import { listOperationIds, loadOperation, readArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION, verifySchematicNativeProfile } from "./native-profiles.ts";
import { schematicNativeSnapshotHash, schematicNativeSnapshotSchema } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

const PROFILE = "easyeda-pro-control.schematic-layout-constructor-witness.v1";
const WORKER = Object.freeze({ relativePath: "pro-mgr/3.2.148.154949d9/js/project-worker.js", sha256: "2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949" });
export interface SchematicLayoutConstructorWitness {
  readonly profile: typeof PROFILE;
  readonly sourceSha256: string;
  readonly nativeSha256: string;
  readonly checkpointSha256: string;
  readonly projectUuid: string;
  readonly documentUuid: string;
  readonly predecessorOperationId: string;
  readonly predecessorJournalSha256: string;
  readonly lifecycleArtifactSha256: string;
  readonly terminalArtifactSha256: string;
  readonly nativeProfile: { readonly schSha256: string; readonly workerSha256: string };
}
function fail(): never { throw new Error("Schematic constructor order lacks one exact preceding managed close/reopen witness."); }
function record(value: unknown): UnknownRecord { if (!isRecord(value)) { fail(); } return value; }
function text(value: unknown): string { if (typeof value !== "string" || value.length === 0) { fail(); } return value; }
function digest(value: unknown): string { const result = text(value); if (!/^[a-f0-9]{64}$/u.test(result)) { fail(); } return result; }
function same(left: unknown, right: unknown): void { if (canonicalJson(left) !== canonicalJson(right)) { fail(); } }
function time(value: unknown): number { const result = Date.parse(text(value)); if (!Number.isFinite(result)) { fail(); } return result; }
function scope(journal: UnknownRecord): { projectUuid: string; projectPath: string; documentUuid: string; tabId: string } {
  const context = record(journal["context"]);
  const project = record(context["project"]);
  const document = record(context["document"]);
  if (document["documentType"] !== 1) { fail(); }
  return { projectUuid: text(project["uuid"] ?? project["projectUuid"]), projectPath: text(project["path"]), documentUuid: text(document["uuid"] ?? document["documentUuid"]), tabId: text(document["tabId"]) };
}
function lineageSummary(journal: UnknownRecord): OperationJournal {
  const plan = record(journal["plan"]);
  const operation = plan["operation"];
  return { operationId: text(journal["operationId"]), planHash: digest(journal["planHash"]),
    plan: { operation: isRecord(operation) ? { action: operation["action"] } : operation, expectedFingerprint: plan["expectedFingerprint"] },
    ...Object.fromEntries(["context", "createdAt", "updatedAt", "state", "saved", "reopened", "hardStop", "orphanedCallPossible", "journalSha256"].map(key => [key, journal[key]])) };
}
function external(journal: UnknownRecord): UnknownRecord {
  const fingerprint = record(record(journal["plan"])["expectedFingerprint"]);
  return Object.fromEntries(Object.entries(fingerprint).filter(([key]) => !["facadeImplementation", "reviewedCompatibilityManifest"].includes(key)));
}
function beforeState(journal: UnknownRecord): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const native = schematicNativeSnapshotSchema.parse(journal["beforeNative"]), source = parseDocumentSource(native.source);
  same(source, journal["before"]); return { source, native };
}
function phase(journal: OperationJournal, name: string): ArtifactDescriptor {
  const found = (journal.artifacts ?? []).filter(entry => basename(entry.path) === name);
  if (found.length !== 1 || found[0] === undefined) { fail(); } return found[0];
}
function parsePhase(journal: OperationJournal, name: string, bytes: string): UnknownRecord {
  const descriptor = phase(journal, name);
  if (Buffer.byteLength(bytes) !== descriptor.bytes || sha256Text(bytes) !== descriptor.sha256) { fail(); }
  const parsed: unknown = JSON.parse(bytes); return record(parsed);
}
function preceding(pending: OperationJournal, operations: readonly UnknownRecord[]): UnknownRecord {
  const target = scope(pending);
  const created = time(pending["createdAt"]);
  const found: UnknownRecord[] = [];
  for (const entry of operations) {
    if (entry["state"] === "journal-unreadable") { fail(); }
    if (entry["operationId"] !== pending.operationId) {
      const context = entry["context"];
      if (isRecord(context) && isRecord(context["project"]) && (context["project"]["uuid"] ?? context["project"]["projectUuid"]) === target.projectUuid) {
        const started = time(entry["createdAt"]);
        const ended = time(entry["updatedAt"]);
        if (started > ended || ended >= created) { fail(); }
        found.push(entry);
      }
    }
  }
  found.sort((a, b) => time(b["updatedAt"]) - time(a["updatedAt"]));
  const prior = found[0];
  if (prior === undefined || found[1] !== undefined && time(found[1]["updatedAt"]) === time(prior["updatedAt"])) { fail(); }
  same(scope(prior), target); same(external(prior), external(pending));
  if (prior["state"] !== "completed" || prior["saved"] !== true || prior["reopened"] !== true || prior["hardStop"] !== false || prior["orphanedCallPossible"] !== false ||
      record(record(prior["plan"])["operation"])["action"] !== "sch.layout.batch") { fail(); }
  // The resolver has already validated every journal and all its descriptors.
  return prior;
}

/** Pure lineage check for the narrow ordinary layout 05/06/08 profile. The
 * production resolver alone obtains these bytes from managed journal paths. */
export function verifySchematicLayoutConstructorLineage(input: {
  readonly pending: OperationJournal; readonly predecessor: OperationJournal; readonly operations: readonly UnknownRecord[];
  readonly history: NativeHistorySnapshot; readonly afterText: string; readonly lifecycleText: string; readonly terminalText: string;
  readonly nativeProfile: SchematicLayoutConstructorWitness["nativeProfile"];
}): SchematicLayoutConstructorWitness {
  const { pending, predecessor, history } = input;
  const target = scope(pending);
  const before = beforeState(pending);
  const selected = preceding(pending, input.operations);
  if (selected["operationId"] !== predecessor.operationId) { fail(); }
  same(lineageSummary(selected), lineageSummary(predecessor));
  same(scope({ context: pending.plan["expectedContext"] }), target);
  same(scope({ context: predecessor.plan["expectedContext"] }), target);
  const after = parsePhase(predecessor, "05-after.json", input.afterText);
  const acknowledgment = parsePhase(predecessor, "06-save-reopen.json", input.lifecycleText);
  const terminal = parsePhase(predecessor, "08-reopened.json", input.terminalText);
  const artifacts = predecessor.artifacts ?? [];
  if (artifacts.at(-1)?.path !== phase(predecessor, "08-reopened.json").path ||
      artifacts.indexOf(phase(predecessor, "05-after.json")) >= artifacts.indexOf(phase(predecessor, "06-save-reopen.json")) ||
      artifacts.indexOf(phase(predecessor, "06-save-reopen.json")) >= artifacts.indexOf(phase(predecessor, "08-reopened.json"))) { fail(); }
  const afterPayload = record(after["payload"]), consistency = record(afterPayload["read_consistency"]);
  const afterSource = parseDocumentSource(text(afterPayload["source"]));
  same(after["snapshot"], afterSource); same(parseDocumentSource(schematicNativeSnapshotSchema.parse(after["native"]).source), afterSource);
  if (consistency["stable"] !== true || consistency["attempts"] !== 2) { fail(); }
  const guard = record(acknowledgment["exactSaveGuard"]);
  const close = record(acknowledgment["closeProof"]);
  const opened = record(acknowledgment["openProof"]);
  const document = record(acknowledgment["document"]);
  const barrier = record(acknowledgment["projectUploadBarrier"]);
  if (acknowledgment["ok"] !== true || acknowledgment["saved"] !== true || acknowledgment["closed"] !== true || acknowledgment["reopened"] !== true ||
      document["uuid"] !== target.documentUuid || document["tabId"] !== target.tabId || document["documentType"] !== 1 ||
      guard["passes"] !== 2 || guard["saveInvokedInSameExecution"] !== true || guard["publicCompareAndSwapAvailable"] !== false ||
      close["profile"] !== "easyeda-pro-control.native-document-close.v1" || close["closeCalls"] !== 1 || close["terminalNotification"] !== true || close["oldFrameRemoved"] !== true || close["oldTabRemoved"] !== true || close["saved"] !== false ||
      opened["profile"] !== "easyeda-pro-control.native-document-open.v1" || opened["tabId"] !== target.tabId || opened["newFrameReady"] !== true || opened["exactContext"] !== true || opened["readinessSamples"] !== 2 || typeof opened["activated"] !== "boolean" ||
      barrier["profile"] !== "easyeda-pro-control.project-upload-barrier.v1" || barrier["projectUuid"] !== target.projectUuid || barrier["scheduledWritesSettled"] !== true || barrier["savedEditorChanges"] !== false) { fail(); }
  same(guard["labels"], ["schematic-source"]); same(guard["snapshotSha256"], [digest(consistency["snapshotSha256"])]);
  const native = schematicNativeSnapshotSchema.parse(terminal["native"]), snapshot = parseDocumentSource(native.source);
  same(terminal["snapshot"], snapshot); same(snapshot, pending["before"]); same(terminal["native"], pending["beforeNative"]);
  const terminalPayload = record(terminal["payload"]);
  const terminalConsistency = record(terminalPayload["read_consistency"]);
  same(parseDocumentSource(text(terminalPayload["source"])), snapshot);
  if (terminalConsistency["stable"] !== true || terminalConsistency["attempts"] !== 2) { fail(); }
  digest(terminalConsistency["snapshotSha256"]);
  const checkpoint = record(terminal["checkpoint"]), pendingCheckpoint = record(pending["preCheckpoint"]), persistence = record(terminal["persistence"]);
  const { receiptSha256, ...receiptCore } = checkpoint;
  if (checkpoint["schema"] !== "easyeda-pro-control.checkpoint.v2" || sha256Json(receiptCore) !== receiptSha256 ||
      checkpoint["checkpointSha256"] !== pendingCheckpoint["checkpointSha256"] || checkpoint["checkpointSha256"] !== history.checkpointSha256 ||
      checkpoint["source"] !== target.projectPath || pendingCheckpoint["source"] !== target.projectPath || time(checkpoint["createdAt"]) > time(predecessor["updatedAt"]) ||
      time(pendingCheckpoint["createdAt"]) < time(checkpoint["createdAt"]) || time(pendingCheckpoint["createdAt"]) > time(pending["createdAt"]) ||
      persistence["ok"] !== true || record(persistence["comparison"])["ok"] !== true || persistence["afterCheckpointSha256"] !== history.checkpointSha256 ||
      persistence["rawExpectedAfterSourceSha256"] !== snapshot.sha256 || persistence["rawAfterNativeSha256"] !== sha256Json(native) ||
      persistence["documentCount"] !== history.documents.length || persistence["rawAfterSemanticSha256"] !== history.semanticSha256) { fail(); }
  const witness: SchematicLayoutConstructorWitness = {
    profile: PROFILE, sourceSha256: snapshot.sha256, nativeSha256: schematicNativeSnapshotHash(native), checkpointSha256: history.checkpointSha256,
    projectUuid: target.projectUuid, documentUuid: target.documentUuid, predecessorOperationId: predecessor.operationId,
    predecessorJournalSha256: digest(predecessor["journalSha256"]), lifecycleArtifactSha256: phase(predecessor, "06-save-reopen.json").sha256,
    terminalArtifactSha256: phase(predecessor, "08-reopened.json").sha256, nativeProfile: { ...input.nativeProfile },
  };
  assertSchematicLayoutConstructorWitness(witness, before.source, before.native, history); return witness;
}

export function assertSchematicLayoutConstructorWitness(witness: SchematicLayoutConstructorWitness | undefined, before: NativeSourceSnapshot, beforeNative: SchematicNativeSnapshot, history: NativeHistorySnapshot): void {
  if (witness === undefined || witness.profile !== PROFILE || witness.sourceSha256 !== before.sha256 ||
      before.sha256 !== sha256Json({ schema: before.schema, document: before.document, objects: before.objects }) ||
      witness.nativeSha256 !== schematicNativeSnapshotHash(beforeNative) || witness.checkpointSha256 !== history.checkpointSha256 ||
      witness.projectUuid !== history.projectUuid || witness.documentUuid !== before.document["uuid"] || witness.documentUuid !== beforeNative.document.documentUuid ||
      history.documents.filter(document => document.uuid === witness.documentUuid && document.docType === "SCH_PAGE").length !== 1 ||
      witness.nativeProfile.schSha256 !== SCHEMATIC_NATIVE_IMPLEMENTATION.sha256 || witness.nativeProfile.workerSha256 !== WORKER.sha256) { fail(); }
  same(parseDocumentSource(beforeNative.source), before);
  text(witness.predecessorOperationId); digest(witness.predecessorJournalSha256); digest(witness.lifecycleArtifactSha256); digest(witness.terminalArtifactSha256);
}

async function phaseText(descriptor: ArtifactDescriptor): Promise<string> {
  let result = "";
  let offset = 0;
  while (offset < descriptor.bytes) {
    let length = Math.min(256 * 1024, descriptor.bytes - offset);
    let chunk = await readArtifact(descriptor.path, offset, length);
    for (let attempt = 0; attempt < 3 && Buffer.byteLength(chunk.text) !== chunk.bytesRead; attempt += 1) { length -= 1; chunk = await readArtifact(descriptor.path, offset, length); }
    if (chunk.size !== descriptor.bytes || chunk.offset !== offset || chunk.bytesRead < 1 || Buffer.byteLength(chunk.text) !== chunk.bytesRead) { fail(); }
    result += chunk.text; offset += chunk.bytesRead;
  }
  if (Buffer.byteLength(result) !== descriptor.bytes || sha256Text(result) !== descriptor.sha256) { fail(); } return result;
}
async function workerProfile(assetsRoot: string): Promise<void> {
  const path = join(assetsRoot, WORKER.relativePath);
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { fail(); }
  // oxlint-disable-next-line eslint/no-bitwise -- Pin the reviewed worker without following a substituted symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) { if (!Buffer.isBuffer(chunk)) { fail(); } hash.update(chunk); }
    const after = await file.stat({ bigint: true }), current = await lstat(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs ||
        after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== WORKER.sha256) { fail(); }
  } finally { await file.close(); }
}

/** No path or expected native hash comes from a caller. Resolve only the latest
 * same-project managed journal, with an exact raw pre-edit state bracket. */
export async function resolveSchematicLayoutConstructorWitness(pending: OperationJournal, history: NativeHistorySnapshot): Promise<SchematicLayoutConstructorWitness> {
  const retained = await loadOperation(pending.operationId);
  for (const key of ["before", "beforeNative", "context", "preCheckpoint", "createdAt", "plan"] as const) { same(retained[key], pending[key]); }
  // Keep only chronology/scope/runtime summaries. Full native journals can be
  // Many megabytes each and must not accumulate alongside decoded history.
  const operations: OperationJournal[] = [];
  for (const operationId of await listOperationIds()) { operations.push(lineageSummary(await loadOperation(operationId))); }
  const selected = preceding(pending, operations);
  const predecessor = await loadOperation(text(selected["operationId"]));
  same(lineageSummary(selected), lineageSummary(predecessor));
  const fingerprint = record(pending.plan["expectedFingerprint"]);
  const bundles = record(fingerprint["installedBundles"]);
  const assetsRoot = text(bundles["assetsRoot"]);
  if (bundles["available"] !== true) { fail(); }
  await verifySchematicNativeProfile(assetsRoot); await workerProfile(assetsRoot);
  const [afterText, lifecycleText, terminalText] = await Promise.all(["05-after.json", "06-save-reopen.json", "08-reopened.json"].map(name => phaseText(phase(predecessor, name))));
  if (afterText === undefined || lifecycleText === undefined || terminalText === undefined) { fail(); }
  const witness = verifySchematicLayoutConstructorLineage({ pending, predecessor, operations, history, afterText, lifecycleText, terminalText,
    nativeProfile: { schSha256: SCHEMATIC_NATIVE_IMPLEMENTATION.sha256, workerSha256: WORKER.sha256 } });
  same(await loadOperation(predecessor.operationId), predecessor); same(await loadOperation(pending.operationId), retained);
  return witness;
}
