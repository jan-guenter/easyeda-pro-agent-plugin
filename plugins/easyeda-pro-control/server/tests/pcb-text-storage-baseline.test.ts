import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { prepareDesignAction, verifyDesignAction } from "../src/design-action.ts";
import { deriveDesignBaselineTargets, verifyDesignBaseline, verifyDesignPersistence } from "../src/design-persistence.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";

type RecordValue = Record<string, unknown>;
const documentId = "d".repeat(16), peerId = "e".repeat(16), textId = "1".repeat(16);
const metadata = { uuid: documentId, docType: "PCB", editVersion: "3.2.149.88089769" };
// Synthetic records retain the independently traced collision and malformed
// Color representations. Neither the test nor the adapter normalizes storage.
const layers = [
  { id: "LAYER:19", layerId: 19, stored: "#386d7d", exported: "#39503f" },
  { id: "LAYER:24", layerId: 24, stored: "#a.492f", exported: "#0a492f" },
] as const;
const operations = [
  { id: "storage-modify", action: "pcb.text.modify", target: { primitiveId: textId }, patch: { x: 100, y: 205, text: "Fixture2" } },
  { id: "storage-create", action: "pcb.text.create", properties: { x: 140, y: 210, text: "Fixture2", fontSize: 120, strokeWidth: 8 } },
  { id: "storage-delete", action: "pcb.text.delete", target: { primitiveId: textId } },
] as const;
type Operation = (typeof operations)[number];

function record(id: string, type: string, body: RecordValue): NativeSourceObject { return { id, type, body }; }
function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  return parseDocumentSource(`{"type":"DOCHEAD"}||${JSON.stringify(metadata)}|\n${objects.map((row) =>
    `${JSON.stringify({ id: row.id, type: row.type })}||${JSON.stringify(row.body)}|\n`).join("")}`);
}
function document(uuid: string, records: readonly NativeSourceObject[]): NativeDocumentSnapshot {
  const projection = { uuid, docType: "PCB", metadata: { ...metadata, uuid },
    records: records.map(({ id, type, body }) => ({ id, type, body })).toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...projection, records: projection.records.map((row) => ({ ...row, ticket: 1, client: null })), semanticSha256: sha256Json(projection) };
}
function checkpoint(records: readonly NativeSourceObject[], peers = [record("peer-layer", "LAYER", { layerId: 19, inactiveColor: "#386d7d" })]): NativeHistorySnapshot {
  const documents = [document(documentId, records), document(peerId, peers)];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
    headHistoryUuid: "c".repeat(32), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100,
    documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fixture(operation: Operation): {
  before: NativeHistorySnapshot; after: NativeHistorySnapshot; expectedBefore: NativeSourceSnapshot; expectedAfter: NativeSourceSnapshot;
  records: readonly NativeSourceObject[]; prepared: ReturnType<typeof prepareDesignAction>;
} {
  const common = [record("CANVAS", "CANVAS", { unit: "mil", originX: 0, originY: 0 }),
    record("LAYER:3", "LAYER", { layerId: 3, use: true, show: true, locked: false }),
    record(textId, "STRING", { partitionId: "", groupId: 0, layerId: 3, x: 95, y: 210, text: "Fixture1", fontSize: 120, strokeWidth: 8,
      fontFamily: "default", bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 0, reverse: false, expansion: 0,
      mirror: false, locked: false, zIndex: -1, specialColor: "#000000" })];
  const layerRecords = (representation: "stored" | "exported"): NativeSourceObject[] => layers.map((layer) =>
    record(layer.id, "LAYER", { layerId: layer.layerId, use: false, show: false, locked: false, inactiveColor: layer[representation] }));
  const expectedBefore = source([...common, ...layerRecords("exported")]);
  const before = checkpoint([...common, ...layerRecords("stored"), record("META", "META", { title: "Synthetic fixture", retained: true })]);
  const prepared = prepareDesignAction(operation, { source: expectedBefore, history: before });
  assert.ok(prepared.expectedSource);
  const expectedAfter = prepared.expectedSource;
  const prior = before.documents.find((entry) => entry.uuid === documentId);
  assert.ok(prior);
  // Apply only the maintained producer's STRING records to independent durable
  // State. Copying the full export would silently normalize both layer colors.
  const records = [...prior.records.filter((row) => row.type !== "STRING"), ...expectedAfter.objects.filter((row) => row.type === "STRING")];
  return { before, after: checkpoint(records), expectedBefore, expectedAfter, records, prepared };
}
function proveSource(input: ReturnType<typeof fixture>, after = input.expectedAfter): void {
  verifyDesignAction(input.prepared.compiled, { source: input.expectedBefore, history: input.before }, { source: after, history: input.after },
    input.prepared.createdId === undefined ? {} : { createdId: input.prepared.createdId });
}

for (const operation of operations) {
  void test(`${operation.action} permits unchanged independent layer representations through the maintained baseline and persistence proofs`, () => {
    const input = fixture(operation);
    const retained = JSON.stringify(input);
    const targets = deriveDesignBaselineTargets(input.expectedBefore, input.expectedAfter);
    proveSource(input);
    if (operation.action === "pcb.text.modify") { assert.deepEqual(targets, [{ id: textId, fields: ["text", "x", "y"] }]); }
    else if (operation.action === "pcb.text.create") { assert.deepEqual(targets, []); assert.match(input.prepared.createdId ?? "", /^[a-f0-9]{16}$/u); }
    else {
      const text = input.expectedBefore.objects.find((row) => row.id === textId);
      assert.ok(text);
      assert.deepEqual(targets, [{ id: textId, fields: Object.keys(text.body).toSorted() }]);
    }
    const baseline = verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets });
    assert.equal(baseline["ok"], true);
    assert.equal(baseline["representationDifferenceCount"], 2);
    assert.equal(baseline["durableOnlyCount"], 1);
    assert.equal(baseline["scope"], "selected-target-fields-not-whole-editor-cleanliness");
    const persistence = verifyDesignPersistence(input);
    assert.equal(persistence["ok"], true);
    assert.equal(persistence["scope"], "all-materialized-selected-branch-documents");
    assert.equal(persistence["documentCount"], 2);
    assert.equal(persistence["beforeSemanticSha256"], input.before.semanticSha256);
    assert.equal(persistence["afterSemanticSha256"], input.after.semanticSha256);
    for (const layer of layers) {
      assert.equal(input.expectedAfter.objects.find((row) => row.id === layer.id)?.body["inactiveColor"], layer.exported);
      assert.equal(input.records.find((row) => row.id === layer.id)?.body["inactiveColor"], layer.stored);
      assert.throws(() => verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore,
        targets: [{ id: layer.id, fields: ["inactiveColor"] }] }), /target baseline/u);
    }
    assert.equal(JSON.stringify(input), retained);
  });

  void test(`${operation.action} rejects durable layer normalization, other field changes and record membership or type changes`, () => {
    const input = fixture(operation);
    for (const layer of layers) {
      const original = input.records.find((row) => row.id === layer.id);
      assert.ok(original);
      const variants = [
        { ...original, body: { ...original.body, inactiveColor: layer.exported } },
        { ...original, body: { ...original.body, inactiveColor: "#123456" } },
        { ...original, body: { ...original.body, show: true } },
        { ...original, body: { ...original.body, unexpected: null } },
        { ...original, body: { layerId: layer.layerId } },
        { ...original, type: "RULE" },
        { ...original, id: `${layer.id}:replacement` },
      ];
      for (const replacement of variants) {
        const after = checkpoint(input.records.map((row) => row.id === layer.id ? replacement : row));
        assert.throws(() => verifyDesignPersistence({ ...input, after }), /unchanged or export-invisible durable record/u);
      }
      assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint(input.records.filter((row) => row.id !== layer.id)) }), /unchanged or export-invisible durable record/u);
    }
    assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint([...input.records, record("LAYER:25", "LAYER", { layerId: 25 })]) }), /unchanged or export-invisible durable record/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint(input.records,
      [record("peer-layer", "LAYER", { layerId: 19, inactiveColor: "#39503f" })]) }), /Another document/u);
  });

  void test(`${operation.action} refuses source layer collateral and missing durable STRING effects`, () => {
    const input = fixture(operation);
    for (const layer of layers) {
      const altered = source(input.expectedAfter.objects.map((row) => row.id === layer.id ? { ...row, body: { ...row.body, inactiveColor: layer.stored } } : row));
      assert.throws(() => { proveSource(input, altered); }, /beyond|more than/u);
    }
    assert.throws(() => verifyDesignPersistence({ ...input, after: input.before }), /captured source|absent from durable|Deleted record/u);
  });
}

void test("existing STRING baseline fields remain strict despite unrelated layer representation gaps", () => {
  for (const operation of operations.filter((entry) => entry.action !== "pcb.text.create")) {
    const input = fixture(operation);
    const target = input.before.documents.find((entry) => entry.uuid === documentId);
    assert.ok(target);
    const changed = operation.action === "pcb.text.modify" ? { x: 96 } : { specialColor: null };
    const checkpointBefore = checkpoint(target.records.map((row) => row.id === textId ? record(row.id, row.type, { ...row.body, ...changed }) : row));
    assert.throws(() => verifyDesignBaseline({ checkpoint: checkpointBefore, source: input.expectedBefore,
      targets: deriveDesignBaselineTargets(input.expectedBefore, input.expectedAfter) }), /target baseline/u);
  }
});
