import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { compareDocumentSources, parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import { verifyDesignPersistence } from "../src/design-persistence.ts";
import { prepareFlatDisplayProfile, verifyFlatDisplayPersistence } from "../src/flat-display-profile.ts";
import { verifyFlatDisplayMaterialization, verifyFlatDisplayRestoration } from "../src/flat-display-storage.ts";
import { expectedSchematicLayoutCooperatively } from "../src/schematic-layout-batch.ts";
import { context, encode, rehash } from "./flat-display-fixture.ts";
import { nativeFormatAfter, nativeFormatFixture, nativeFormatOperation as operation } from "./flat-display-native-fixture.ts";

function materializationInput(value: ReturnType<typeof nativeFormatFixture>): Parameters<typeof verifyFlatDisplayMaterialization>[0] {
  return { history: value.evidence.history, source: parseDocumentSource(value.native.source), native: value.native };
}
function changeRows(value: ReturnType<typeof nativeFormatFixture>, transform: (rows: NativeSourceObject[]) => NativeSourceObject[], documentUuid = "page"): void {
  const documents = value.evidence.history.documents.map((document) => document.uuid === documentUuid ? { ...document,
    records: transform([...structuredClone(document.records)]).map((record, index) => Object.assign(structuredClone(record), { ticket: index + 1, client: null })).toSorted((left, right) => left.id.localeCompare(right.id)) } : document);
  value.evidence = { ...value.evidence, history: rehash({ ...value.evidence.history, documents }) };
}
const patch = (rows: NativeSourceObject[], id: string, fields: Record<string, unknown>): NativeSourceObject[] =>
  rows.map((row) => row.id === id ? { ...row, body: { ...row.body, ...fields } } : row);

void test("real-format flat baseline proves durable-only META, default CANVAS, frame initialization and all nine documents without modifying evidence", async () => {
  const value = nativeFormatFixture();
  const input = materializationInput(value), raw = structuredClone(value);
  assert.equal(input.source.objects.some((row) => row.id === "META"), false);
  assert.equal(input.history.documents.find((document) => document.uuid === "page")?.records.some((row) => row.id === "CANVAS"), false);
  const proof = await verifyFlatDisplayMaterialization(input);
  assert.equal(proof["comparisonOnly"], true); assert.equal(proof["rawHistorySemanticSha256"], input.history.semanticSha256);
  assert.notEqual(proof["candidateSemanticSha256"], input.history.semanticSha256);
  const comparison = proof["comparison"]; assert.ok(isRecord(comparison));
  const differences = comparison["differences"]; assert.ok(Array.isArray(differences));
  assert.equal(differences.length, 29);
  const visible = differences.filter((entry: unknown) => isRecord(entry) && Array.isArray(entry["fields"]) && entry["fields"].includes("strikeout"));
  assert.equal(visible.length, 13);
  for (const entry of differences) {
    assert.ok(isRecord(entry)); assert.equal(entry["side"], "before"); assert.equal(entry["parentKind"], "sheet");
    assert.equal(typeof entry["storedZIndex"], "number"); assert.equal(typeof entry["sourceZIndex"], "number");
    assert.ok(Array.isArray(entry["fields"]));
    assert.deepEqual(entry["fields"], entry["fields"].includes("strikeout") ? ["strikeout", "zIndex"] : ["zIndex"]);
  }
  assert.deepEqual(await verifyFlatDisplayMaterialization(input), proof);
  const prepared = await prepareFlatDisplayProfile({ ...value, context, operation });
  assert.equal(prepared.binding.members.length, 9); assert.deepEqual(prepared.binding.topology, []);
  const delta = compareDocumentSources(input.source, prepared.expectedSource);
  assert.deepEqual(delta.changed.map((row) => ({ id: row.before.id, fields: row.fields })), [{ id: "text", fields: ["x"] }]);
  assert.equal(delta.added.length + delta.removed.length, 0);
  assert.deepEqual(prepared.inverse.operations, [{ id: "inverse:move-text", action: "sch.text.display", target: { primitiveId: "text" }, patch: { x: 280 } }]);
  assert.deepEqual(value, raw);
});

void test("real-format materialization rejects hidden rows, missing source rows, wrong types, metadata ambiguity and unrelated target fields", async () => {
  const changes: ((rows: NativeSourceObject[]) => NativeSourceObject[])[] = [
    (rows) => [...rows, { id: "hidden", type: "TEXT", body: { x: 0 } }],
    (rows) => rows.filter((row) => row.id !== "text"),
    (rows) => rows.map((row) => row.id === "text" ? { ...row, type: "RECT" } : row),
    (rows) => rows.map((row) => row.id === "META" ? { ...row, type: "ATTR" } : row),
    (rows) => [...rows, { id: "other-meta", type: "META", body: {} }],
    (rows) => patch(rows, "text", { x: 279 }), (rows) => patch(rows, "text", { value: "Foreign text" }),
    (rows) => patch(rows, "text", { fontSize: 99 }), (rows) => patch(rows, "company", { value: "Foreign company" }),
    (rows) => patch(rows, "untouched-text", { x: 51 }), (rows) => patch(rows, "untouched-text", { value: "Foreign note" }),
    (rows) => patch(rows, "frame", { x: 1 }), (rows) => patch(rows, "frame", { zIndex: 1 }),
  ];
  for (const transform of changes) {
    const value = nativeFormatFixture(); changeRows(value, transform);
    await assert.rejects(verifyFlatDisplayMaterialization(materializationInput(value)));
  }
  for (const body of [{ originX: 1, originY: 0 }, { originX: 0, originY: 0, extra: 1 }]) {
    const value = nativeFormatFixture();
    const rows = parseDocumentSource(value.native.source).objects.map((row) => row.id === "CANVAS" ? Object.assign(structuredClone(row), { body }) : row);
    value.native.source = encode(rows);
    await assert.rejects(verifyFlatDisplayMaterialization(materializationInput(value)), /default origin/u);
  }
});

void test("real-format post-apply durability requires complete baseline or intended materialization, never partial or unrelated target/peer state", async () => {
  const before = nativeFormatFixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const intended = nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), unchanged = nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative, false);
  const input = { binding: prepared.binding, operation, context, baseline: before.evidence.history, before: parseDocumentSource(before.native.source), beforeNative: before.native,
    current: prepared.expectedSource, currentNative: prepared.expectedNative, evidence: intended.evidence, allowAfter: true };
  const intendedProof = await verifyFlatDisplayPersistence(input), unchangedProof = await verifyFlatDisplayPersistence({ ...input, evidence: unchanged.evidence });
  assert.equal(intendedProof["classification"], "exact-intended-effect");
  assert.equal(unchangedProof["classification"], "unchanged-baseline");
  for (const [id, fields] of [["text", { x: 285 }], ["text", { value: "Unrequested" }], ["company", { value: "Unrequested" }],
    ["untouched-text", { x: 51 }], ["META", { title: "Wrong page" }]] as const) {
    const changed = structuredClone(intended); changeRows(changed, (rows) => patch(rows, id, fields));
    await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence: changed.evidence }));
  }
  const peer = structuredClone(intended); changeRows(peer, (rows) => patch(rows, "META", { title: "Other document" }), "peer5");
  await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence: peer.evidence }), /peer document/u);
});

void test("real-format inverse restores sole text field while proving exact durable META and allowed initialized bookkeeping across all peers", async () => {
  const before = nativeFormatFixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const inverse = await expectedSchematicLayoutCooperatively(prepared.inverse, prepared.expectedSource, prepared.expectedNative, {}, { history: before.evidence.history, templates: {} });
  assert.equal(inverse.expected.sha256, prepared.binding.before.sourceSha256);
  const restored = nativeFormatAfter(before, inverse.expected, inverse.native);
  const input = { before: before.evidence.history, after: restored.evidence.history, expectedBefore: parseDocumentSource(before.native.source), expectedAfter: inverse.expected,
    beforeNative: before.native, afterNative: inverse.native };
  assert.throws(() => verifyDesignPersistence(input), /unchanged.*record/u);
  const proof = await verifyFlatDisplayRestoration(input);
  assert.equal(proof["ok"], true);
  for (const [documentUuid, id, fields] of [["page", "META", { title: "Changed" }], ["page", "text", { x: 281 }], ["peer5", "META", { title: "Changed" }]] as const) {
    const changed = structuredClone(restored); changeRows(changed, (rows) => patch(rows, id, fields), documentUuid);
    await assert.rejects(verifyFlatDisplayRestoration({ ...input, after: changed.evidence.history }));
  }
});

void test("real-format unchanged classification admits only exact partial default initialization and checks every current record again", async () => {
  const before = nativeFormatFixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const source = parseDocumentSource(before.native.source);
  const input = { binding: prepared.binding, operation, context, baseline: before.evidence.history, before: source, beforeNative: before.native,
    current: source, currentNative: before.native, evidence: before.evidence, allowAfter: false };
  for (const kind of ["canvas-only", "frame-only", "both"] as const) {
    const current = structuredClone(before);
    changeRows(current, (rows) => {
      let result = kind === "canvas-only" ? rows : patch(rows, "frame", { zIndex: 0 });
      if (kind !== "frame-only") { result = [...result, { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }]; }
      return result;
    });
    const proof = await verifyFlatDisplayPersistence({ ...input, evidence: current.evidence });
    assert.equal(proof["classification"], "unchanged-baseline");
    changeRows(current, (rows) => patch(rows, "untouched-text", { value: "Changed after preparation" }));
    await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence: current.evidence }), /unrequested record/u);
  }
});
