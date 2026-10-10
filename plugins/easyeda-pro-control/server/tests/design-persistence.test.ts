import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sha256Json } from "../src/core.ts";
import { deriveDesignBaselineTargets, verifyDesignBaseline, verifyDesignPersistence } from "../src/design-persistence.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { verifyCopperClearPersistence } from "../src/copper-persistence.ts";
import { projectFootprintScope } from "../src/footprint-action.ts";

type RecordValue = Record<string, unknown>;
void it("clear-derived permits only the target native empty durable record omitted by export", () => {
  const parent = object("pour", "POUR", { netName: "GND", layerId: 1 });
  const id = '["POURED","pour"]';
  const derived = object(id, "POURED", { pourFill: [{ id: "child", strokeWidth: 0, fill: true, path: [[0, 0, "L", 10, 0, 10, 10, 0, 0]] }] });
  const empty = object(id, "POURED", { pourFill: [] });
  const input = { before: checkpoint([parent, derived]), after: checkpoint([parent, empty]), expectedBefore: source([parent, derived]), expectedAfter: source([parent]) };
  const operation = { id: "clear", action: "pcb.pour.clear-derived", target: { primitiveId: "pour" } };
  assert.equal(verifyCopperClearPersistence(input, operation)["ok"], true);
  assert.throws(() => verifyCopperClearPersistence({ ...input, after: checkpoint([parent]) }, operation), /absent/u);
  assert.throws(() => verifyCopperClearPersistence({ ...input, after: checkpoint([parent, object(id, "POURED", { pourFill: [], extra: true })]) }, operation), /intended source delta/u);
  assert.throws(() => verifyCopperClearPersistence({ ...input, after: checkpoint([object("pour", "POUR", { netName: "OTHER", layerId: 1 }), empty]) }, operation), /unchanged/u);
});
const DOCUMENT = "fixture-pcb";
const METADATA = { uuid: DOCUMENT, docType: "PCB", editVersion: "3.2.149.88089769", user: { owner: "synthetic" },
  client: "0123456789abcdef", updateTime: 100, version: "100" };

function object(id: string, type: string, body: RecordValue): NativeSourceObject { return { id, type, body }; }
function durable(record: NativeSourceObject): NativeObjectSnapshot { return { ...record, ticket: 1, client: "0123456789abcdef" }; }
function document(uuid: string, docType: string, records: readonly NativeSourceObject[], metadata: RecordValue): NativeDocumentSnapshot {
  const projection = { uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })).toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...projection, records: projection.records.map(durable), semanticSha256: sha256Json(projection) };
}
function checkpoint(records: readonly NativeSourceObject[], options: { metadata?: RecordValue; libraryMetadata?: RecordValue; libraryBody?: RecordValue } = {}): NativeHistorySnapshot {
  const documents = [document(DOCUMENT, "PCB", records, options.metadata ?? METADATA),
    document("library", "FOOTPRINT", [object("pad1", "PAD", options.libraryBody ?? { x: 0, y: 0 })],
      options.libraryMetadata ?? { uuid: "library", docType: "FOOTPRINT", client: "imported", version: "v2" })];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), branchUuid: "22".repeat(16),
    headHistoryUuid: "33".repeat(16), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100,
    documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function source(objects: readonly NativeSourceObject[], metadata?: RecordValue): NativeSourceSnapshot {
  const projection = { schema: "easyeda-pro-control.document-source.v1" as const, document: metadata ?? { uuid: DOCUMENT, docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...projection, sha256: sha256Json(projection) };
}
function fixture(): { before: NativeHistorySnapshot; after: NativeHistorySnapshot; expectedBefore: NativeSourceSnapshot; expectedAfter: NativeSourceSnapshot } {
  const common = [object("META", "META", { hidden: true }), object("layer19", "LAYER", { inactiveColor: "durable-color", visible: true })];
  const exported = [object("layer19", "LAYER", { inactiveColor: "export-color", visible: true }), object("default", "RULE_SELECTOR", { ruleOrder: 4 })];
  return { before: checkpoint([object("c1", "COMPONENT", { x: 1, y: 2 }), ...common]),
    after: checkpoint([object("c1", "COMPONENT", { x: 3, y: 2 }), ...common], { metadata: { ...METADATA, client: "abcdef0123456789", updateTime: 200, version: "200" } }),
    expectedBefore: source([object("c1", "COMPONENT", { x: 1, y: 2 }), ...exported]),
    expectedAfter: source([object("c1", "COMPONENT", { x: 3, y: 2 }), ...exported]) };
}
function replaceRecord(snapshot: NativeHistorySnapshot, id: string, body: RecordValue): NativeHistorySnapshot {
  const records = snapshot.documents[0]?.records;
  assert.ok(records);
  return checkpoint(records.map((record) => object(record.id, record.type, record.id === id ? body : record.body)));
}
function withDocuments(snapshot: NativeHistorySnapshot, documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  return { ...snapshot, documents, checkpointSha256: sha256Json(documents),
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function schematicFixture(attributeBody?: RecordValue, durableBody?: RecordValue): {
  native: SchematicNativeSnapshot; source: NativeSourceSnapshot; checkpoint: NativeHistorySnapshot;
} {
  const metadata = { uuid: "fixture-schematic", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
  const componentBody = { x: 100, y: 200, rotation: 0, isMirror: false };
  const component = object("part", "COMPONENT", componentBody);
  const objects = [component, ...(attributeBody === undefined ? [] : [object("stored-attribute", "ATTR", attributeBody)])];
  const rawSource = `{"type":"DOCHEAD"}||${JSON.stringify(metadata)}|\n${objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  const native = schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1",
    document: { documentUuid: metadata.uuid, tabId: "fixture-tab" }, source: rawSource,
    components: [{ id: "part", kind: "part", locked: false, body: componentBody, pins: [],
      attributes: attributeBody === undefined ? [] : [{ id: "stored-attribute", key: attributeBody["key"], value: attributeBody["value"],
        symbolValue: attributeBody["value"], blockValue: null, instanceValue: null, body: attributeBody }] }] });
  const documents = [document(metadata.uuid, "SCH_PAGE", objects.map((entry) => entry.type === "ATTR" && durableBody !== undefined ? object(entry.id, entry.type, durableBody) : entry), metadata),
    ...Array.from({ length: 12 }, (_, index) => document(`unchanged-library-${index}`, "SYMBOL", [object("library-attribute", "ATTR", { x: null, y: null, zIndex: 16, value: "untouched" })],
      { uuid: `unchanged-library-${index}`, docType: "SYMBOL" }))];
  return { native, source: parseDocumentSource(rawSource), checkpoint: withDocuments(checkpoint([]), documents) };
}
const hiddenBody = { parentId: "part", key: "Manufacturer", x: null, y: null, zIndex: 14, value: "retained value", color: "#008800", visible: false };

void describe("selected-branch design persistence", () => {
  void it("a restored live source cannot prove rollback while the forward edit remains durable", () => {
    const forward = fixture();
    const restored = { ...forward, expectedAfter: forward.expectedBefore };
    assert.throws(() => verifyDesignPersistence(restored), /unchanged|delta|source/u);
    const proof = verifyDesignPersistence({ ...restored, after: forward.before });
    assert.equal(proof["ok"], true);
    assert.equal(proof["afterSourceSha256"], forward.expectedBefore.sha256);
    assert.throws(() => verifyDesignPersistence({ ...restored, after: checkpoint([object("c1", "COMPONENT", { x: 1, y: 2 })], { libraryBody: { x: 99, y: 0 } }) }), /unchanged|collateral|outside/u);
  });
  void it("preserves the native PCB export header while binding an active FOOTPRINT checkpoint and editor 4", () => {
    const metadata = { uuid: "library", docType: "FOOTPRINT", editVersion: "3.2.149.88089769" };
    const records = [object("META", "META", { title: "Fixture" }), object("name", "ATTR", { key: "Footprint", value: "Fixture" })];
    const base = checkpoint([]);
    const before = { ...withDocuments(base, [document("library", "FOOTPRINT", records, metadata)]), projectOwnerUuid: "owner" };
    const exported = source(records.slice(1), { ...metadata, docType: "PCB" });
    const context = { project: { uuid: before.projectUuid, path: "/fixture.eprj2" }, document: { uuid: "library", documentType: 4, parentLibraryUuid: "owner", tabId: `library@${before.projectUuid}` } };
    const raw = JSON.stringify({ before, exported });
    assert.equal(projectFootprintScope(exported, before, context).footprintUuid, "library");
    assert.throws(() => projectFootprintScope(exported, before, { ...context, document: { ...context.document, documentType: 3 } }), /context/u);
    assert.throws(() => projectFootprintScope(exported, before, { ...context, document: { ...context.document, parentLibraryUuid: "other" } }), /context/u);
    const created = object("line", "LINE", { startX: 0, startY: 80, endX: 100, endY: 80, width: 6, layerId: 3, netName: "", locked: false });
    const after = withDocuments(before, [document("library", "FOOTPRINT", [...records, created], metadata)]);
    const expectedAfter = source([...exported.objects, created], exported.document);
    const baseline = verifyDesignBaseline({ checkpoint: before, source: exported, targets: [] });
    assert.equal(baseline["sourceDocumentType"], "PCB");
    assert.equal(baseline["durableDocumentType"], "FOOTPRINT");
    const proof = verifyDesignPersistence({ before, after, expectedBefore: exported, expectedAfter });
    assert.equal(proof["beforeSourceSha256"], exported.sha256);
    assert.equal(proof["sourceDocumentType"], "PCB");
    assert.equal(proof["durableDocumentType"], "FOOTPRINT");
    assert.equal(JSON.stringify({ before, exported }), raw);
    const otherType = withDocuments(before, [document("library", "SYMBOL", records, { ...metadata, docType: "SYMBOL" })]);
    assert.throws(() => verifyDesignBaseline({ checkpoint: otherType, source: exported, targets: [] }), /identities disagree/u);
    const wrongVersion = source(exported.objects, { ...exported.document, editVersion: "other" });
    assert.throws(() => verifyDesignBaseline({ checkpoint: before, source: wrongVersion, targets: [] }), /identities disagree/u);
    const changedMetadata = withDocuments(before, [document("library", "FOOTPRINT", [...records, created], { ...metadata, title: "unrequested" })]);
    assert.throws(() => verifyDesignPersistence({ before, after: changedMetadata, expectedBefore: exported, expectedAfter }), /metadata changed/u);
  });
  void it("refuses an inactive document as a source/baseline target", () => {
    const component = object("c1", "COMPONENT", { x: 1, y: 2 });
    const inactive = checkpoint([component, object("DELETE_DOC", "DELETE_DOC", { isDelete: true })]);
    assert.throws(() => verifyDesignBaseline({ checkpoint: inactive, source: source([component]), targets: [{ id: "c1", fields: ["x"] }] }), /identities disagree/u);
  });
  void it("permits only source-bound non-drawing stored attribute order bookkeeping and preserves every raw hash", () => {
    const before = schematicFixture(hiddenBody, { ...hiddenBody, zIndex: 16 });
    const after = schematicFixture({ ...hiddenBody, value: "intended value" }, { ...hiddenBody, value: "intended value", zIndex: 16 });
    const raw = JSON.stringify({ before, after });
    const baseline = { checkpoint: before.checkpoint, source: before.source, targets: [{ id: "stored-attribute", fields: ["value", "zIndex"] }] };
    assert.throws(() => verifyDesignBaseline(baseline), /baseline/u);
    assert.equal(verifyDesignBaseline({ ...baseline, native: before.native })["representationDifferenceCount"], 1);
    const input = { before: before.checkpoint, after: after.checkpoint, expectedBefore: before.source, expectedAfter: after.source,
      beforeNative: before.native, afterNative: after.native };
    const proof = verifyDesignPersistence(input);
    assert.equal(proof["documentCount"], 13);
    assert.equal(proof["beforeSemanticSha256"], before.checkpoint.semanticSha256);
    assert.equal(proof["afterSourceSha256"], after.source.sha256);
    assert.deepEqual(proof["schematicAttributeOrderDifferences"], [
      { id: "stored-attribute", parentId: "part", key: "Manufacturer", comparison: "before-durable-source", beforeZIndex: 16, afterZIndex: 14 },
      { id: "stored-attribute", parentId: "part", key: "Manufacturer", comparison: "after-durable-source", beforeZIndex: 16, afterZIndex: 14 },
    ]);
    assert.equal(JSON.stringify({ before, after }), raw);
    assert.throws(() => verifyDesignPersistence({ ...input, afterNative: before.native }), /exact source/u);
    assert.throws(() => verifyDesignPersistence({ ...input, beforeNative: undefined }), /both native/u);
  });

  void it("accepts a newly materialized hidden attribute with an exact created identity and rejects every other body difference", () => {
    const before = schematicFixture();
    const after = schematicFixture(hiddenBody, { ...hiddenBody, zIndex: 16 });
    const input = { before: before.checkpoint, after: after.checkpoint, expectedBefore: before.source, expectedAfter: after.source,
      beforeNative: before.native, afterNative: after.native };
    const proof = verifyDesignPersistence(input);
    assert.equal(proof["ok"], true);
    assert.deepEqual(proof["schematicAttributeOrderDifferences"], [
      { id: "stored-attribute", parentId: "part", key: "Manufacturer", comparison: "after-durable-source", beforeZIndex: 16, afterZIndex: 14 },
    ]);
    assert.throws(() => verifyDesignPersistence({ ...input, beforeNative: undefined, afterNative: undefined }), /Created durable/u);
    for (const body of [{ ...hiddenBody, zIndex: 16, value: "wrong" }, { ...hiddenBody, zIndex: 16, color: "wrong" },
      { ...hiddenBody, zIndex: 16, net: "unexpected" }, { ...hiddenBody, zIndex: 16, parentId: "other" },
      { ...hiddenBody, zIndex: 16, key: "other" }, { ...hiddenBody, zIndex: 16, x: 0 },
      { ...hiddenBody, zIndex: 16, y: 0 }, { ...hiddenBody, zIndex: -1 }]) {
      const changed = schematicFixture(hiddenBody, body);
      assert.throws(() => verifyDesignPersistence({ ...input, after: changed.checkpoint }), /Created durable/u);
    }
  });

  void it("keeps visible attributes, source identities and all other documents exact", () => {
    const before = schematicFixture({ ...hiddenBody, x: 0 });
    const after = schematicFixture({ ...hiddenBody, x: 0, value: "intended" }, { ...hiddenBody, x: 0, value: "intended", zIndex: 16 });
    assert.throws(() => verifyDesignPersistence({ before: before.checkpoint, after: after.checkpoint,
      expectedBefore: before.source, expectedAfter: after.source, beforeNative: before.native, afterNative: after.native }), /outside/u);
    const createdBefore = schematicFixture();
    const createdAfter = schematicFixture(hiddenBody, { ...hiddenBody, zIndex: 16 });
    const input = { before: createdBefore.checkpoint, after: createdAfter.checkpoint,
      expectedBefore: createdBefore.source, expectedAfter: createdAfter.source, beforeNative: createdBefore.native, afterNative: createdAfter.native };
    const changedDocuments = createdAfter.checkpoint.documents.map((entry) => entry.uuid === "unchanged-library-0" ?
      document(entry.uuid, entry.docType, entry.records.map((record) => ({ ...record, body: { ...record.body, zIndex: 14 } })), entry.metadata) : entry);
    assert.throws(() => verifyDesignPersistence({ ...input, after: withDocuments(input.after, changedDocuments) }), /Another document/u);
    const target = input.after.documents[0];
    assert.ok(target);
    const renamed = document(target.uuid, target.docType, target.records.map((record) => record.type === "ATTR" ? { ...record, id: "different-attribute" } : record), target.metadata);
    assert.throws(() => verifyDesignPersistence({ ...input, after: withDocuments(input.after, [renamed, ...input.after.documents.slice(1)]) }), /unchanged|absent/u);
    assert.throws(() => verifyDesignBaseline({ checkpoint: fixture().before, source: fixture().expectedBefore, targets: [], native: before.native }), /another document family/u);
  });
  void it("derives all changed existing fields including collateral attributes while excluding creates and unchanged defaults", () => {
    const before = source([object("component", "COMPONENT", { x: 1, y: 2 }), object("label", "ATTR", { x: 3, y: 4, parentId: "component" }),
      object("removed", "LINE", { width: 1, locked: false }), object("default", "RULE_SELECTOR", {})]);
    const after = source([object("component", "COMPONENT", { x: 5, y: 2 }), object("label", "ATTR", { x: 7, y: 4, parentId: "component" }),
      object("created", "LINE", { width: 2 }), object("default", "RULE_SELECTOR", {})]);
    assert.deepEqual(deriveDesignBaselineTargets(before, after), [
      { id: "component", fields: ["x"] }, { id: "label", fields: ["x"] }, { id: "removed", fields: ["locked", "width"] },
    ]);
    assert.throws(() => deriveDesignBaselineTargets(before, { ...after, sha256: "ab".repeat(32) }), /hash/u);
    assert.throws(() => deriveDesignBaselineTargets(before, source(after.objects, { ...after.document, title: "rename" })), /metadata/u);
  });

  void it("accepts exact field persistence with unchanged omitted META, layer projection differences and absent export defaults", () => {
    const input = fixture();
    const result = verifyDesignPersistence(input);
    assert.equal(result["ok"], true);
    assert.equal(result["documentCount"], 2);
    assert.equal(result["scope"], "all-materialized-selected-branch-documents");
    assert.notEqual(result["beforeSemanticSha256"], result["afterSemanticSha256"]);
    const alteredIdentity = verifyDesignPersistence({ ...input, after: { ...input.after, checkpointSha256: "ab".repeat(32) } });
    assert.notEqual(result["scopeSha256"], alteredIdentity["scopeSha256"]);
  });

  void it("proves only selected target fields before write and reports representation gaps", () => {
    const input = fixture();
    const result = verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [{ id: "c1", fields: ["x", "y"] }] });
    assert.equal(result["exportOnlyCount"], 1);
    assert.equal(result["durableOnlyCount"], 1);
    assert.equal(result["representationDifferenceCount"], 1);
    assert.equal(result["scope"], "selected-target-fields-not-whole-editor-cleanliness");
    assert.throws(() => verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [{ id: "layer19", fields: ["inactiveColor"] }] }), /baseline/u);
    assert.throws(() => verifyDesignBaseline({ checkpoint: input.before, source: input.expectedAfter, targets: [{ id: "c1", fields: ["x"] }] }), /baseline/u);
    assert.throws(() => verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [{ id: "default", fields: [] }] }), /baseline/u);
  });

  void it("rejects unrelated durable-only, export-projected and same-record collateral changes", () => {
    const input = fixture();
    for (const [id, body] of [
      ["META", { hidden: false }], ["layer19", { inactiveColor: "export-color", visible: true }], ["c1", { x: 3, y: 99 }],
    ] as const) {
      assert.throws(() => verifyDesignPersistence({ ...input, after: replaceRecord(input.after, id, body) }), /outside|unchanged/u);
    }
    assert.throws(() => verifyDesignPersistence({ ...input, after: replaceRecord(input.after, "c1", { x: 2, y: 2 }) }), /captured source/u);
    assert.throws(() => verifyDesignPersistence({ ...input, before: replaceRecord(input.before, "c1", { x: 0, y: 2 }) }), /captured source/u);
  });

  void it("rejects all unrelated library body and metadata changes including normally volatile fields", () => {
    const input = fixture();
    const records = input.after.documents[0]?.records;
    assert.ok(records);
    for (const options of [{ libraryBody: { x: 4, y: 0 } },
      { libraryMetadata: { uuid: "library", docType: "FOOTPRINT", client: "different", version: "v2" } },
      { libraryMetadata: { uuid: "library", docType: "FOOTPRINT", client: "imported", version: "v3", updateTime: 200 } }]) {
      assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint(records, options) }), /Another document/u);
    }
  });

  void it("allows only well-shaped target edit metadata and preserves native-only owner/configuration", () => {
    const input = fixture();
    const records = input.after.documents[0]?.records;
    assert.ok(records);
    for (const metadata of [{ ...METADATA, user: { owner: "other" } }, { ...METADATA, title: "new title" },
      { ...METADATA, editVersion: "new version" }, { ...METADATA, client: "arbitrary" },
      { ...METADATA, updateTime: 50, version: "50" }, { ...METADATA, updateTime: 200, version: "wrong" }]) {
      assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint(records, { metadata }) }), /metadata/u);
    }
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: source(input.expectedAfter.objects, { ...input.expectedAfter.document, title: "rename" }) }), /metadata/u);
  });

  void it("requires creates, changed export defaults and deletions to persist", () => {
    const input = fixture();
    const created = object("new", "VIA", { x: 1, y: 4 });
    const expectedAfter = source([...input.expectedAfter.objects, created]);
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter }), /absent/u);
    const records = input.after.documents[0]?.records;
    assert.ok(records);
    assert.equal(verifyDesignPersistence({ ...input, expectedAfter, after: checkpoint([...records, created]) })["ok"], true);
    const defaultChanged = source(input.expectedAfter.objects.map((entry) => entry.id === "default" ? { ...entry, body: { ruleOrder: 5 } } : entry));
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: defaultChanged }), /absent/u);
    const persistedDefault = checkpoint([...records, object("default", "RULE_SELECTOR", { ruleOrder: 5 })]);
    assert.equal(verifyDesignPersistence({ ...input, expectedAfter: defaultChanged, after: persistedDefault })["ok"], true);
    const removed = source(input.expectedAfter.objects.filter((entry) => entry.id !== "c1"));
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: removed }), /Deleted record/u);
    const removedCheckpoint = checkpoint(records.filter((entry) => entry.id !== "c1"));
    assert.equal(verifyDesignPersistence({ ...input, expectedAfter: removed, after: removedCheckpoint })["ok"], true);
  });

  void it("rejects unsolicited durable additions/removals and missing changed fields", () => {
    const input = fixture();
    const records = input.after.documents[0]?.records;
    assert.ok(records);
    assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint([...records, object("default", "RULE_SELECTOR", { ruleOrder: 4 })]) }), /unchanged/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint(records.filter((entry) => entry.id !== "META")) }), /unchanged/u);
    const addedField = source(input.expectedAfter.objects.map((entry) => entry.id === "c1" ? { ...entry, body: { ...entry.body, locked: false } } : entry));
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: addedField }), /captured source/u);
  });

  void it("validates semantic hashes, unique identities and exact JSON rather than trusting metadata", () => {
    const input = fixture();
    assert.throws(() => verifyDesignPersistence({ ...input, after: { ...input.after, checkpointSha256: "bad" } }), /hash/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: { ...input.after, semanticSha256: "ab".repeat(32) } }), /semantic hash/u);
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: { ...input.expectedAfter, sha256: "ab".repeat(32) } }), /source hash/u);
    const records = input.after.documents[0]?.records;
    assert.ok(records);
    assert.throws(() => verifyDesignPersistence({ ...input, after: checkpoint([...records, object("c1", "COMPONENT", { x: 3 })]) }), /duplicated/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: { ...input.after, documents: [...input.after.documents, ...input.after.documents] } }), /duplicated/u);
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: source([...input.expectedAfter.objects, object("c1", "COMPONENT", { x: 3 })]) }), /duplicated/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: replaceRecord(input.after, "c1", { x: Number.NaN, y: 2 }) }), /exact JSON/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: replaceRecord(input.after, "c1", { x: 3, y: 2, missing: undefined }) }), /exact JSON/u);
  });

  void it("binds source, project, branch and every document identity", () => {
    const input = fixture();
    assert.throws(() => verifyDesignPersistence({ ...input, after: { ...input.after, projectUuid: "ab".repeat(32) } }), /identities/u);
    assert.throws(() => verifyDesignPersistence({ ...input, after: { ...input.after, branchUuid: "ab".repeat(16) } }), /identities/u);
    assert.throws(() => verifyDesignPersistence({ ...input, expectedAfter: source(input.expectedAfter.objects, { uuid: "unknown", docType: "PCB" }) }), /identities/u);
    const documents = input.after.documents.slice(0, 1);
    const after = { ...input.after, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    assert.throws(() => verifyDesignPersistence({ ...input, after }), /identity changed/u);
  });
});
