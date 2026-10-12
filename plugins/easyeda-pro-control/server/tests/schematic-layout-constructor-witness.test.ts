import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, loadOperation, readArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { OperationJournal } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { assertSchematicLayoutConstructorWitness, resolveSchematicLayoutConstructorWitness, verifySchematicLayoutConstructorLineage } from "../src/schematic-layout-constructor-witness.ts";

type Input = Parameters<typeof verifySchematicLayoutConstructorLineage>[0];
function object(value: unknown): UnknownRecord { assert.ok(isRecord(value)); return value; }
function fixture(projectUuid = "project"): Input {
  const source = '{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"page"}|\n';
  const snapshot = parseDocumentSource(source);
  const native: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: `page@${projectUuid}` }, source, components: [] };
  const documents = [{ uuid: "page", docType: "SCH_PAGE", metadata: snapshot.document, records: [], semanticSha256: "a".repeat(64) }];
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "b".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  const context = { project: { uuid: projectUuid, path: "/project.eprj2" }, document: { uuid: "page", documentType: 1, tabId: `page@${projectUuid}` } };
  const plan = { operation: { action: "sch.layout.batch" }, expectedContext: context, expectedFingerprint: { native: "exact", facadeImplementation: "old" } };
  const checkpointCore = { schema: "easyeda-pro-control.checkpoint.v2", checkpointSha256: history.checkpointSha256, source: "/project.eprj2", createdAt: "2026-09-21T00:00:02Z" };
  const checkpoint = { ...checkpointCore, receiptSha256: sha256Json(checkpointCore) };
  const pending: OperationJournal = { operationId: "pending", plan, planHash: "c".repeat(64), context, createdAt: "2026-09-21T00:00:05Z", before: snapshot, beforeNative: native,
    preCheckpoint: { ...checkpoint, createdAt: "2026-09-21T00:00:04Z" } };
  const predecessor: OperationJournal = { operationId: "prior", plan: structuredClone(plan), planHash: "d".repeat(64), journalSha256: "e".repeat(64), context,
    state: "completed", saved: true, reopened: true, hardStop: false, orphanedCallPossible: false,
    createdAt: "2026-09-21T00:00:00Z", updatedAt: "2026-09-21T00:00:03Z", artifacts: [] };
  const payload = { source, read_consistency: { stable: true, attempts: 2, snapshotSha256: "f".repeat(64) } };
  const after = { payload, snapshot, native };
  const lifecycle = { ok: true, saved: true, closed: true, reopened: true, document: context.document,
    exactSaveGuard: { passes: 2, saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false, labels: ["schematic-source"], snapshotSha256: ["f".repeat(64)] },
    closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
    openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: `page@${projectUuid}`, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
    projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid, scheduledWritesSettled: true, savedEditorChanges: false } };
  const terminal = { payload, snapshot, native, checkpoint, persistence: { ok: true, comparison: { ok: true }, afterCheckpointSha256: history.checkpointSha256,
    rawExpectedAfterSourceSha256: snapshot.sha256, rawAfterNativeSha256: sha256Json(native), documentCount: 1, rawAfterSemanticSha256: history.semanticSha256 } };
  const texts = [JSON.stringify(after), JSON.stringify(lifecycle), JSON.stringify(terminal)];
  predecessor.artifacts = ["05-after.json", "06-save-reopen.json", "08-reopened.json"].map((name, index) => {
    const value = texts[index]; assert.ok(value !== undefined && value !== ""); return { path: `/managed/prior/${name}`, bytes: Buffer.byteLength(value), sha256: sha256Text(value) };
  });
  const [afterText, lifecycleText, terminalText] = texts;
  assert.ok(afterText !== undefined && afterText !== "");
  assert.ok(lifecycleText !== undefined && lifecycleText !== "");
  assert.ok(terminalText !== undefined && terminalText !== "");
  return { pending, predecessor, operations: [predecessor, pending], history, afterText, lifecycleText, terminalText,
    nativeProfile: { schSha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f", workerSha256: "2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949" } };
}
function changePhase(input: Input, field: "afterText" | "lifecycleText" | "terminalText", change: (phase: UnknownRecord) => void): Input {
  const changed = structuredClone(input), parsed: unknown = JSON.parse(changed[field]);
  const phase = object(parsed); change(phase); const value = JSON.stringify(phase);
  const name = { afterText: "05-after.json", lifecycleText: "06-save-reopen.json", terminalText: "08-reopened.json" }[field];
  const descriptor = changed.predecessor.artifacts?.find(entry => entry.path.endsWith(name)); assert.ok(descriptor);
  descriptor.bytes = Buffer.byteLength(value); descriptor.sha256 = sha256Text(value);
  return { ...changed, [field]: value };
}

void test("constructor witness binds exact managed predecessor bytes without changing inputs", () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const witness = verifySchematicLayoutConstructorLineage(input);
  assert.equal(witness.predecessorOperationId, "prior"); assert.equal(witness.checkpointSha256, input.history.checkpointSha256);
  assert.equal(JSON.stringify(input), before);
  const native = schematicNativeSnapshotSchema.parse(input.pending["beforeNative"]);
  assertSchematicLayoutConstructorWitness(witness, parseDocumentSource(native.source), native, input.history);
  assert.throws(() => { assertSchematicLayoutConstructorWitness({ ...witness, nativeSha256: "0".repeat(64) }, parseDocumentSource(native.source), native, input.history); });
});
void test("constructor witness refuses missing and corrupt phase descriptors", () => {
  const missing = fixture(); missing.predecessor.artifacts?.splice(1, 1);
  assert.throws(() => verifySchematicLayoutConstructorLineage(missing));
  const corrupt = fixture(); assert.throws(() => verifySchematicLayoutConstructorLineage({ ...corrupt, terminalText: `${corrupt.terminalText} ` }));
});
void test("constructor witness refuses source, raw native and checkpoint mismatch", () => {
  for (const change of [
    (phase: UnknownRecord): void => { object(phase["snapshot"])["sha256"] = "0".repeat(64); },
    (phase: UnknownRecord): void => { object(object(phase["native"])["document"])["tabId"] = "other"; },
    (phase: UnknownRecord): void => { object(phase["checkpoint"])["checkpointSha256"] = "0".repeat(64); },
  ]) { assert.throws(() => verifySchematicLayoutConstructorLineage(changePhase(fixture(), "terminalText", change))); }
});
void test("constructor witness refuses unfinished, reversed and ambiguous predecessors", () => {
  for (const patch of [{ state: "commit-needs-recovery" }, { updatedAt: "2026-09-21T00:00:06Z" }, { createdAt: "2026-09-21T00:00:04Z" }, { orphanedCallPossible: true }]) {
    const input = fixture(); Object.assign(input.predecessor, patch); assert.throws(() => verifySchematicLayoutConstructorLineage(input));
  }
  const input = fixture();
  const duplicate = { ...input.predecessor, operationId: "ambiguous" };
  assert.throws(() => verifySchematicLayoutConstructorLineage({ ...input, operations: [...input.operations, duplicate] }));
});
void test("constructor witness refuses an intervening or unreadable managed journal", () => {
  const input = fixture(), intervening = { ...input.predecessor, operationId: "intervening", createdAt: "2026-09-21T00:00:03Z", updatedAt: "2026-09-21T00:00:04Z" };
  assert.throws(() => verifySchematicLayoutConstructorLineage({ ...input, operations: [...input.operations, intervening] }));
  assert.throws(() => verifySchematicLayoutConstructorLineage({ ...input, operations: [...input.operations, { state: "journal-unreadable" }] }));
});
void test("constructor witness refuses failed close/reopen, source guard and persistence", () => {
  for (const key of ["saved", "closed", "reopened"]) {
    assert.throws(() => verifySchematicLayoutConstructorLineage(changePhase(fixture(), "lifecycleText", phase => { phase[key] = false; })));
  }
  for (const [key, field] of [["closeProof", "oldFrameRemoved"], ["openProof", "newFrameReady"], ["exactSaveGuard", "saveInvokedInSameExecution"]] as const) {
    assert.throws(() => verifySchematicLayoutConstructorLineage(changePhase(fixture(), "lifecycleText", phase => { object(phase[key])[field] = false; })));
  }
  assert.throws(() => verifySchematicLayoutConstructorLineage(changePhase(fixture(), "terminalText", phase => { object(phase["persistence"])["ok"] = false; })));
});
void test("constructor witness refuses wrong external runtime or pinned native tuple", () => {
  const runtime = fixture(); object(runtime.predecessor.plan["expectedFingerprint"])["native"] = "other";
  assert.throws(() => verifySchematicLayoutConstructorLineage(runtime));
  const path = fixture(); object(object(path.predecessor["context"])["project"])["path"] = "/other.eprj2";
  assert.throws(() => verifySchematicLayoutConstructorLineage(path));
  const pinned = fixture(); assert.throws(() => verifySchematicLayoutConstructorLineage({ ...pinned, nativeProfile: { ...pinned.nativeProfile, workerSha256: "0".repeat(64) } }));
});

void test("public constructor resolver preserves every four-byte page boundary with real managed journals when native sources are mounted", async (t) => {
  const assetsRoot = "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
  try {
    await access(join(assetsRoot, "pro-sch/3.2.149.35ae2987/js/sch.js"));
    await access(join(assetsRoot, "pro-mgr/3.2.148.154949d9/js/project-worker.js"));
  } catch (error) {
    if (isRecord(error) && error["code"] === "ENOENT") { t.skip("Pinned Windows application is not mounted on this test host."); return; }
    throw error;
  }
  assert.ok(basename(controlDataDirectory()).startsWith("easyeda-test-control-"), "Run with the mandatory test-isolation preload.");
  const pageBytes = 256 * 1024;
  for (const selectedPhase of ["afterText", "lifecycleText", "terminalText"] as const) {
    for (const split of [1, 2, 3, 4]) {
      for (const predecessorText of ["", "\uFFFD", "\uFFFD\uFFFD"]) {
        await t.test(`${selectedPhase} split ${String(split)} with ${String(predecessorText.length)} preceding replacements`, async () => {
          const input = fixture(newOperationId());
          input.predecessor.operationId = newOperationId(); input.pending.operationId = newOperationId();
          for (const journal of [input.predecessor, input.pending]) {
            object(journal.plan["expectedFingerprint"])["installedBundles"] = { available: true, assetsRoot };
            journal.planHash = buildPlanHash(journal.plan); journal["schema"] = OPERATION_SCHEMA;
          }
          const count = pageBytes - Buffer.byteLength('{"utf8Padding":"') - Buffer.byteLength(predecessorText) - split;
          const padding = `${"x".repeat(count)}${predecessorText}😀${"y".repeat(2 * pageBytes)}`;
          input.predecessor.artifacts = [];
          for (const [field, sequence, phaseName] of [["afterText", 5, "after"], ["lifecycleText", 6, "save-reopen"], ["terminalText", 8, "reopened"]] as const) {
            const value = object(JSON.parse(input[field]) as unknown);
            const descriptor = await writePhaseArtifact(input.predecessor.operationId, sequence, phaseName,
              field === selectedPhase ? { utf8Padding: padding, ...value } : value);
            input.predecessor.artifacts.push(descriptor);
            if (field === selectedPhase && split === 3) {
              const first = await readArtifact(descriptor.path, 0, pageBytes);
              assert.ok(first.text.endsWith("\uFFFD")); assert.equal(Buffer.byteLength(first.text), first.bytesRead);
            }
          }
          await createOperation(input.predecessor); await createOperation(input.pending);
          const prior = await loadOperation(input.predecessor.operationId);
          const pending = await loadOperation(input.pending.operationId);
          // The actual resolver reads only these synthetic journals and pinned implementation files.
          // It constructs no engine and cannot dispatch Save, close, open or another CAD call.
          const witness = await resolveSchematicLayoutConstructorWitness(pending, input.history);
          assert.equal(witness.predecessorOperationId, prior.operationId);
          assert.deepEqual(await loadOperation(prior.operationId), prior);
          assert.deepEqual(await loadOperation(pending.operationId), pending);
        });
      }
    }
  }
});
