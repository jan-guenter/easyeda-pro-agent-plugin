import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { prepareFlatDisplayProfile, verifyFlatDisplayObservation } from "../src/flat-display-profile.ts";
import { encodeSchematicLayoutSource } from "../src/schematic-layout-batch.ts";
import { schematicNativeSnapshotHash } from "../src/schematic-native-adapter.ts";
import { verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import { context } from "./flat-display-fixture.ts";
import { nativeExportSource, nativeFormatAfter, nativeFormatFixture, nativeFormatOperation as operation } from "./flat-display-native-fixture.ts";

void test("flat after comparison preserves the immutable v1 projection seal across native export ordering without changing raw evidence", async () => {
  const before = nativeFormatFixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const after = nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative);
  const retained = structuredClone({ prepared, before, after });
  assert.notEqual(after.native.source, prepared.expectedNative.source);
  assert.equal(after.native.source.endsWith("|\n"), false);
  assert.match(after.native.source, /\{"type":"CANVAS","ticket":1,"id":"CANVAS"\}/u);
  assert.equal(encodeSchematicLayoutSource(parseDocumentSource(after.native.source)), prepared.expectedNative.source);
  assert.equal(prepared.binding.after.nativeSha256, schematicNativeSnapshotHash(prepared.expectedNative));
  assert.notEqual(prepared.binding.after.nativeSha256, schematicNativeSnapshotHash(after.native));
  verifyFlatDisplayObservation(prepared.binding, operation, context, after.evidence, after.native, "after");
  verifyFlatDisplayObservation(prepared.binding, operation, context, before.evidence, before.native, "before");
  assert.deepEqual({ prepared, before, after }, retained);
  assert.equal(sha256Json(prepared.binding), sha256Json(retained.prepared.binding));
});

void test("flat comparison keeps before observations raw-strict and refuses source metadata, records and every other native field", async () => {
  const before = nativeFormatFixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const beforeReencoded = { ...before.native, source: encodeSchematicLayoutSource(parseDocumentSource(before.native.source)) };
  assert.throws(() => { verifyFlatDisplayObservation(prepared.binding, operation, context, before.evidence, beforeReencoded, "before"); }, /phase source/u);
  for (const drift of ["text-body", "unknown-body", "metadata", "native-only-metadata", "missing-record", "extra-record", "record-type",
    "native-locked", "native-override", "native-body", "native-document", "unknown-native"] as const) {
    const after = nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative);
    const model = after.native.components[0], page = after.evidence.observation.pages[0]; assert.ok(page && model);
    const parsed = parseDocumentSource(after.native.source);
    let document = structuredClone(parsed.document), rows = [...structuredClone(parsed.objects)];
    if (drift === "text-body" || drift === "unknown-body") {
      const target = rows.find((row) => row.id === "text"); assert.ok(target); target.body[drift === "text-body" ? "x" : "unknown"] = 999;
    } else if (drift === "metadata" || drift === "native-only-metadata") { document = { ...document, unknown: "not volatile" }; }
    else if (drift === "missing-record") { rows = rows.filter((row) => row.id !== "untouched-text"); }
    else if (drift === "extra-record") { rows.push({ id: "extra", type: "TEXT", body: { x: 1, y: 2 } }); }
    else if (drift === "record-type") { rows = rows.map((row) => row.id === "text" ? { ...row, type: "RECT" } : row); }
    else if (drift === "native-locked") { model.locked = true; }
    else if (drift === "native-override") { const attribute = model.attributes[0]; assert.ok(attribute); attribute.instanceValue = "unexpected"; }
    else if (drift === "native-body") { model.body["unknown"] = "unrequested"; }
    else if (drift === "native-document") { after.native.document.tabId = "other"; }
    else { Reflect.set(after.native, "unknown", "unrequested"); }
    after.native.source = nativeExportSource({ ...parsed, document, objects: rows });
    if (drift !== "native-only-metadata") { page.source = after.native.source; }
    assert.throws(() => {
      after.evidence = { ...after.evidence, proof: verifySchematicFlatTopology(after.evidence.observation) };
      verifyFlatDisplayObservation(prepared.binding, operation, context, after.evidence, after.native, "after");
    }, /./u, drift);
  }
});
