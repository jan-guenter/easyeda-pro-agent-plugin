/** Synthetic original SQL reads only; no editor, bridge or live control data. */
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, controlRootCapability } from "../src/artifacts.ts";
import { createCheckpoint } from "../src/checkpoint.ts";
import { assertCurrentSymbolMetaOnlyBaseline } from "../src/current-symbol-meta-only.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch });
const TARGET = Object.freeze({ ...IDENTITY, ownerUuid: IDS.actor, symbolUuid: IDS.target });
const DESIRED = Object.freeze({ name: "Changed synthetic", description: "Synthetic only", tags: [], source: "" });
const STARTUP = { sheetUuids: [IDS.peer], templates: [] };
function binding(input: Awaited<ReturnType<typeof fixture>>): Parameters<typeof assertCurrentSymbolMetaOnlyBaseline>[1] {
  return { copy: { source: input.path, sha256: input.before.checkpointSha256 },
    checkpoint: { source: input.path, sourceSha256: input.before.checkpointSha256, checkpointSha256: input.before.checkpointSha256 } };
}
async function prepared(shape?: string): Promise<Awaited<ReturnType<typeof fixture>>> {
  const input = await fixture();
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  const raw = decoded.chunks.join("|\n").split("|\n").filter((record) => !record.startsWith('{"type":"LINE"'));
  if (shape !== undefined) { raw.splice(3, 0, shape); }
  const encoded = encrypted(raw.join("|\n"), IDS.oldHead, IDS.oldKey);
  mutate(input.path, `UPDATE history_data SET dataStr='${encoded}' WHERE id=7`);
  return { path: input.path, before: await inventory(input.path) };
}

void test("META-only eligibility binds the complete original inventory and preserves peer canvas history", async () => {
  const input = await fixture();
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  const target = { ...TARGET, symbolUuid: IDS.peer };
  const result = await assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), target, decoded.history, DESIRED, STARTUP);
  assert.equal(result["targetUuid"], IDS.peer); assert.equal(result["canvasRecords"], 0);
  assert.equal(result["rawHistoryBytes"], decoded.history.plaintextBytes);
  assert.equal(result["beforeSqlSha256"], input.before.logicalSha256);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["cacheBranchObserved"], false);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(structuredClone(input.before), binding(input), target, decoded.history, DESIRED, STARTUP), /original inventory/u);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), { ...target, ownerUuid: IDS.peer }, decoded.history, DESIRED, STARTUP), /META-only baseline/u);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), target, { ...decoded.history, semanticSha256: "0".repeat(64) }, DESIRED, STARTUP), /META-only baseline/u);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), { ...target, symbolUuid: "f".repeat(16) }, decoded.history, DESIRED, STARTUP), /target|header/u);
});

void test("a tombstoned canvas refuses despite a META-only materialized document", async () => {
  const input = await fixture();
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  const target = decoded.history.documents.find((document) => document.uuid === IDS.target);
  assert.deepEqual(target?.records.map((record) => record.type), ["META"]);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history, DESIRED, STARTUP), /canvas/u);
});

void test("all non-metadata atom chains refuse before mutation, including empty and superseded tombstones", async () => {
  for (const type of ["PART", "PIN", "LINE", "CANVAS", "ELE_PLACEHOLDER"]) {
    for (const tombstone of [false, true]) {
      const shape = `${JSON.stringify({ type, ticket: 3, id: "shape" })}||${tombstone ? "" : '{"x":1}'}`;
      const input = await prepared(shape);
      const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
      await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history, DESIRED, STARTUP), /canvas/u);
    }
  }
});

void test("a later metadata placeholder cannot hide a historical canvas occurrence", async () => {
  for (const type of ["LINE", "PART"]) {
    const shape = `${JSON.stringify({ type, ticket: 3, id: "shape" })}||{"x":1}|\n` +
      '{"type":"META_PLACEHOLDER","ticket":4,"id":"shape"}||';
    const input = await prepared(shape);
    const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
    assert.deepEqual(decoded.history.documents.find((document) => document.uuid === IDS.target)?.records.map((record) => record.type), ["META"]);
    await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history, DESIRED, STARTUP), /historical target canvas/u);
  }
});

void test("the pure pre-edit decoder rejects identity, schema and selected-branch changes without a transaction plan", async () => {
  const input = await prepared();
  for (const identity of [{ ...IDENTITY, projectUuid: "x" }, { ...IDENTITY, branchUuid: "0".repeat(64) }]) {
    await assert.rejects(decodeCurrentSymbolPreEditHistory(input.before, identity), /identity/u);
  }
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  const admitted = await assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history, DESIRED, STARTUP);
  assert.equal(admitted["canvasRecords"], 0);
  mutate(input.path, `UPDATE projects SET branch_uuid='${IDS.start}'`);
  await assert.rejects(decodeCurrentSymbolPreEditHistory(await inventory(input.path), IDENTITY), /association/u);
});

void test("META-only admission rejects an intended value that cannot fit saved-content verification", async () => {
  const input = await prepared();
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history,
    { ...DESIRED, description: "\0".repeat(12_000) }, STARTUP), /saved content.*byte limit/u);
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, binding(input), TARGET, decoded.history,
    DESIRED, STARTUP, { ...DESIRED, description: "\0".repeat(12_000) }), /saved content.*byte limit/u);
});

void test("raw-copy and normalized-checkpoint provenance bind separately without erasing materializer lineage", async () => {
  const sheet = "a".repeat(16);
  const shape = `${JSON.stringify({ type: "DOCHEAD", ticket: 3 })}||${JSON.stringify({ docType: "SCH_PAGE", uuid: sheet,
    client: "b".repeat(16), updateTime: 1, version: "1" })}|\n` +
    '{"type":"META","ticket":3,"id":"META"}||{"title":"Synthetic sheet"}';
  const initial = await prepared(shape);
  mutate(initial.path, "PRAGMA schema_version=99");
  const input = { path: initial.path, before: await inventory(initial.path) }, outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = await createCheckpoint({ source: input.path, outputDir, label: "synthetic-meta-provenance" },
    { expectedSource: input.path, artifactRoots: [outputDir], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: IDS.project, libraryAtomHeaders: "preserve" });
  const decoded = await decodeCurrentSymbolPreEditHistory(input.before, IDENTITY);
  const selected = { copy: binding(input).copy, checkpoint };
  assert.equal(checkpoint.sourceSha256, input.before.checkpointSha256);
  assert.notEqual(checkpoint.checkpointSha256, checkpoint.sourceSha256);
  assert.equal(decoded.history.semanticSha256, history.semanticSha256);
  const normalizedSheet = history.documents.find((document) => document.uuid === sheet);
  const rawSheet = decoded.history.documents.find((document) => document.uuid === sheet);
  assert.equal(rawSheet?.headerHistory?.checkpointSha256, checkpoint.sourceSha256);
  assert.equal(normalizedSheet?.headerHistory?.checkpointSha256, checkpoint.checkpointSha256);
  assert.notEqual(rawSheet?.headerHistory?.sha256, normalizedSheet?.headerHistory?.sha256);
  const admitted = await assertCurrentSymbolMetaOnlyBaseline(input.before, selected, TARGET, history, DESIRED, STARTUP);
  assert.equal(admitted["rawCopySha256"], checkpoint.sourceSha256); assert.equal(admitted["checkpointSha256"], checkpoint.checkpointSha256);
  for (const swapped of [
    { ...selected, copy: { ...selected.copy, sha256: checkpoint.checkpointSha256 } },
    { ...selected, checkpoint: { ...checkpoint, sourceSha256: checkpoint.checkpointSha256 } },
    { ...selected, checkpoint: { ...checkpoint, checkpointSha256: checkpoint.sourceSha256 } },
    { ...selected, checkpoint: { ...checkpoint, source: `${checkpoint.source}.other` } },
    { copy: { ...selected.copy, sha256: checkpoint.checkpointSha256 },
      checkpoint: { ...checkpoint, sourceSha256: checkpoint.checkpointSha256, checkpointSha256: checkpoint.sourceSha256 } },
  ]) {
    await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, swapped, TARGET, history, DESIRED, STARTUP), /META-only baseline/u);
  }
  await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, selected, TARGET, decoded.history, DESIRED, STARTUP), /META-only baseline/u);
  for (const changed of [{ ...history, semanticSha256: "0".repeat(64) }, { ...history, headHistoryUuid: IDS.newHead },
    { ...history, historyRowCount: history.historyRowCount + 1 }, { ...history, chunkCount: history.chunkCount + 1 },
    { ...history, plaintextBytes: history.plaintextBytes + 1 }]) {
    await assert.rejects(assertCurrentSymbolMetaOnlyBaseline(input.before, selected, TARGET, changed, DESIRED, STARTUP), /META-only baseline/u);
  }
});
