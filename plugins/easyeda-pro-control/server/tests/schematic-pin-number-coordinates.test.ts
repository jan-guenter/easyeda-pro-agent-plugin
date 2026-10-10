import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { alignSchematicCoordinateLifecycle, projectSchematicCoordinateCheckpoint, restoreComposedCoordinateStorage, verifyInactiveNoConnectWrites } from "../src/schematic-coordinate-lifecycle.ts";
import { expectedSchematicLayout, verifySchematicLayoutBaseline, verifySchematicLayoutEffect, verifySchematicLayoutPersistence } from "../src/schematic-layout-batch.ts";

const header = { uuid: "page", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
const componentBody = (x: number, y: number): Record<string, unknown> => ({ x, y, partId: "part", rotation: 0, isMirror: false, attrs: {}, zIndex: 1 });
const labelBody = (x: number, y: number): Record<string, unknown> => ({ x, y, parentId: "component-pin", key: "Pin Number", value: "1", rotation: 0,
  keyVisible: null, valueVisible: null, strikeout: false, zIndex: 1 });
const symbolAttribute: NativeSourceObject = { id: "symbol-attr", type: "ATTR", body: { parentId: "component", key: "Symbol", value: "symbol", x: null, y: null, zIndex: 2 } };
function document(uuid: string, docType: string, rows: readonly NativeSourceObject[]): NativeDocumentSnapshot {
  const metadata = uuid === "page" ? header : { uuid, docType };
  const records = rows.map((row, index) => ({ ...structuredClone(row), ticket: index + 1, client: null })).toSorted((a, b) => a.id.localeCompare(b.id));
  return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
}
function snapshot(rows: readonly NativeSourceObject[]): SchematicNativeSnapshot {
  const component = rows.find((row) => row.id === "component"), label = rows.find((row) => row.id === "number"); assert.ok(component && label);
  const source = `${[`{"type":"DOCHEAD"}||${JSON.stringify(header)}`, ...rows.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")}|\n`;
  return schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: "page@project" }, source,
    components: [{ id: "component", kind: "part", locked: false, body: component.body,
      attributes: [{ id: symbolAttribute.id, key: "Symbol", value: "symbol", symbolValue: "symbol", blockValue: "symbol", instanceValue: null, body: symbolAttribute.body }],
      pins: [{ id: "component-pin", body: { x: Number(component.body["x"]) - 65, y: Number(component.body["y"]) + 65, rotation: 0, length: 10 }, net: "SIGNAL", noConnect: null,
        attributes: [{ id: "number", key: "Pin Number", value: "1", symbolValue: "1", blockValue: "1", instanceValue: null, body: label.body }] }] }] });
}
function history(page: NativeDocumentSnapshot, symbolOverride?: NativeDocumentSnapshot): NativeHistorySnapshot {
  const symbol = symbolOverride ?? document("symbol", "SYMBOL", [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } },
    { id: "part", type: "PART", body: {} }, { id: "pin", type: "PIN", body: { partId: "part", x: -65, y: 65, rotation: 0, length: 10 } },
    { id: "library-number", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Number", value: "1", x: -55.5, y: 65.91498 } }]);
  const documents = [page, symbol];
  const checkpointSha256 = sha256Json(documents);
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), headHistoryUuid: "c".repeat(32),
    checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fixture(): { history: NativeHistorySnapshot; native: SchematicNativeSnapshot; rows: NativeSourceObject[] } {
  const rows = [{ id: "component", type: "COMPONENT", body: componentBody(240, -145) }, symbolAttribute,
    { id: "number", type: "ATTR", body: labelBody(184.5, 65.91498 - 145) }];
  const saved = rows.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: labelBody(184.5, -79.08501999999999) }) : row);
  const page = document("page", "SCH_PAGE", saved);
  return { history: history(page), native: snapshot(rows), rows };
}

function nullCoordinateFixture(): ReturnType<typeof fixture> {
  const original = fixture();
  const library = original.history.documents.find((doc) => doc.uuid === "symbol"); assert.ok(library);
  const rows = original.rows.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: { ...row.body, x: null, y: null } }) : row);
  const symbol = document("symbol", "SYMBOL", library.records.map((row) => row.id === "library-number"
    ? Object.assign(structuredClone(row), { body: { ...row.body, x: null, y: null, keyVisible: false, valueVisible: false } }) : row));
  return { history: history(document("page", "SCH_PAGE", rows), symbol), native: snapshot(rows), rows };
}

void test("unchanged null stored pin-number positions need no constructor arithmetic", () => {
  const f = nullCoordinateFixture(), raw = JSON.stringify(f), source = parseDocumentSource(f.native.source);
  const aligned = alignSchematicCoordinateLifecycle(source, f.native, source, f.native, f.history);
  assert.deepEqual(aligned.source, source); assert.deepEqual(aligned.native.components, f.native.components);
  assert.deepEqual(parseDocumentSource(aligned.native.source), source);
  assert.deepEqual(aligned.proof.storedPinNumbers, []); assert.equal(JSON.stringify(f), raw);
});

void test("changed null and numeric pin-number positions still require exact constructor proof", () => {
  for (const [beforeX, beforeY, afterX, afterY] of [[null, null, 0, null], [null, null, null, 0],
    [0, null, null, null], [null, 0, null, null], [null, null, 0, 0], [0, 0, null, null]] as const) {
    const f = nullCoordinateFixture();
    const beforeRows = f.rows.map((row) => row.id === "number" ? { ...row, body: { ...row.body, x: beforeX, y: beforeY } } : row);
    const afterRows = f.rows.map((row) => row.id === "number" ? { ...row, body: { ...row.body, x: afterX, y: afterY } } : row);
    const after = snapshot(afterRows), before = snapshot(beforeRows);
    assert.throws(() => alignSchematicCoordinateLifecycle(parseDocumentSource(before.source), before,
      parseDocumentSource(after.source), after, f.history), /constructor/u);
  }
});

void test("unchanged null positions do not exempt pin-number style or value changes from the full effect guard", () => {
  const f = nullCoordinateFixture();
  const evidence = { history: f.history, templates: {} }, source = parseDocumentSource(f.native.source);
  const operation = { id: "retain-null", action: "sch.layout.batch", documentType: 1,
    operations: [{ id: "retain-pose", action: "sch.component.translate", target: { primitiveId: "component" }, x: 240, y: 145 }] };
  const expected = expectedSchematicLayout(operation, source, f.native, undefined, evidence);
  assert.equal(verifySchematicLayoutEffect(operation, source, expected.expected, f.native, expected.native, expected.createdIds, evidence, true).documentChanged, false);
  for (const patch of [{ fontSize: 12 }, { valueVisible: true }, { value: "2" }]) {
    const rows = f.rows.map((row) => row.id === "number" ? { ...row, body: { ...row.body, ...patch } } : row);
    const changed = snapshot(rows);
    assert.throws(() => verifySchematicLayoutEffect(operation, source, parseDocumentSource(changed.source), f.native, changed, expected.createdIds, evidence, true), Error);
  }
});

void test("checkpoint Pin Number reconstruction proves ignored storage positions from exact native constructor", () => {
  const f = fixture(), raw = JSON.stringify(f), source = parseDocumentSource(f.native.source);
  const proof = verifySchematicLayoutBaseline({ checkpoint: f.history, source, native: f.native, targets: [{ id: "number", fields: ["x", "y"] }] });
  assert.equal(proof["ok"], true);
  const projected = projectSchematicCoordinateCheckpoint(f.history, source, f.native);
  assert.deepEqual(projected.proof.storedPinNumbers[0]?.origins, [[240, -145]]);
  assert.equal(projected.proof.storedPinNumbers[0]?.profile, "pinned-pin-model-ignores-stored-position");
  assert.equal(JSON.stringify(f), raw);
  for (const delta of [1e-12, 1]) {
    const rows = f.rows.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: { ...row.body, y: Number(row.body["y"]) + delta } }) : row);
    const wrong = snapshot(rows);
    assert.throws(() => projectSchematicCoordinateCheckpoint(f.history, parseDocumentSource(wrong.source), wrong), /constructor/u);
  }
  const corrupted = structuredClone(f.history), library = corrupted.documents.find((doc) => doc.uuid === "symbol"); assert.ok(library);
  Object.assign(library, { semanticSha256: "0".repeat(64) });
  assert.throws(() => projectSchematicCoordinateCheckpoint(corrupted, source, f.native), /constructor/u);
});

void test("rotated Pin Number uses the pinned quarter-turn matrix and exact physical pin binding", () => {
  const rows = [{ id: "component", type: "COMPONENT", body: { ...componentBody(80, -415), rotation: 270 } }, symbolAttribute,
    { id: "number", type: "ATTR", body: labelBody(83.58502, -451) }];
  const native = snapshot(rows), pin = native.components[0]?.pins[0]; assert.ok(pin);
  Object.assign(pin.body, { x: 95, y: -450, rotation: 180 });
  const page = document("page", "SCH_PAGE", rows.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: { ...row.body, x: 83.58502000000001 } }) : row));
  const symbol = document("symbol", "SYMBOL", [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } },
    { id: "part", type: "PART", body: {} }, { id: "pin", type: "PIN", body: { partId: "part", x: -35, y: -15, rotation: 270, length: 10 } },
    { id: "library-number", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Number", value: "1", x: -36, y: -3.58502 } }]);
  const h = history(page, symbol), source = parseDocumentSource(native.source);
  assert.equal(verifySchematicLayoutBaseline({ checkpoint: h, source, native, targets: [{ id: "number", fields: ["x"] }] })["ok"], true);
  const changed = structuredClone(native), wrongPin = changed.components[0]?.pins[0]; assert.ok(wrongPin);
  wrongPin.body["x"] = 95 + 1e-12;
  assert.throws(() => projectSchematicCoordinateCheckpoint(h, source, changed), /constructor/u);
});

void test("typed pin-label translation and native rebuild both pass exact effect and complete persistence", () => {
  const beforeRows = [{ id: "component", type: "COMPONENT", body: componentBody(600, -400) }, symbolAttribute,
    { id: "number", type: "ATTR", body: labelBody(544.5, 65.91498 - 400) }];
  const f = { history: history(document("page", "SCH_PAGE", beforeRows)), native: snapshot(beforeRows) };
  const before = parseDocumentSource(f.native.source);
  const operation = { id: "move", action: "sch.layout.batch", documentType: 1, operations: [{ id: "part", action: "sch.component.translate", target: { primitiveId: "component" }, x: 300, y: 199.9 }] };
  const evidence = { history: f.history, templates: {} }, expected = expectedSchematicLayout(operation, before, f.native, undefined, evidence);
  const rows = expected.expected.objects.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: { ...row.body, y: 65.91498 - 199.9 } }) : row);
  const afterNative = snapshot(rows);
  const after = parseDocumentSource(afterNative.source);
  assert.notEqual(expected.expected.objects.find((row) => row.id === "number")?.body["y"], after.objects.find((row) => row.id === "number")?.body["y"]);
  const aligned = alignSchematicCoordinateLifecycle(expected.expected, expected.native, after, afterNative, f.history);
  assert.deepEqual(aligned.source, expected.expected);
  const page = document("page", "SCH_PAGE", rows), saved = history(page);
  const input = { before: f.history, after: saved, expectedBefore: before, expectedAfter: after, beforeNative: f.native, afterNative };
  const raw = JSON.stringify(input);
  assert.equal(verifySchematicLayoutPersistence(operation, input, expected.createdIds, evidence)["ok"], true);
  assert.equal(JSON.stringify(input), raw);
  const wrongRows = rows.map((row) => row.id === "number" ? Object.assign(structuredClone(row), { body: { ...row.body, y: 20.915 } }) : row);
  const wrong = snapshot(wrongRows);
  assert.throws(() => alignSchematicCoordinateLifecycle(expected.expected, expected.native, parseDocumentSource(wrong.source), wrong, f.history), /constructor/u);
  const arbitrarySaved = history(document("page", "SCH_PAGE", wrongRows));
  assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: arbitrarySaved }, expected.createdIds, evidence), /neither retained/u);
  const typedSaved = history(document("page", "SCH_PAGE", expected.expected.objects));
  assert.equal(verifySchematicLayoutPersistence(operation, { ...input, after: typedSaved }, expected.createdIds, evidence)["ok"], true);
});

const sourceText = (entries: readonly NativeSourceObject[]): string => `${[`{"type":"DOCHEAD"}||${JSON.stringify(header)}`,
  ...entries.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")}|\n`;
function composedQuarterTurnFixture(attachedWire = false, wireStart = 1950): {
  initial: NativeHistorySnapshot; before: ReturnType<typeof parseDocumentSource>; beforeNative: SchematicNativeSnapshot;
  operation: Record<string, unknown>; expected: ReturnType<typeof expectedSchematicLayout>;
  after: ReturnType<typeof parseDocumentSource>; afterNative: SchematicNativeSnapshot; saved: NativeHistorySnapshot;
} {
  const origin = [980.0000000000001, -700] as const;
  const rows: NativeSourceObject[] = [
    { id: "component", type: "COMPONENT", body: { ...componentBody(...origin), rotation: 90 } }, symbolAttribute,
    { id: "number", type: "ATTR", body: { ...labelBody(980.9149800000001, -685), rotation: 90, zIndex: 9 } },
    { id: "inactive", type: "ATTR", body: { parentId: "component-pin", key: "NO_CONNECT", value: "no", x: origin[0], y: -680, zIndex: 11 } },
  ];
  const marker = rows.find((row) => row.id === "inactive"), number = rows.find((row) => row.id === "number"); assert.ok(number && marker);
  const beforeNative = schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: "page@project" }, source: sourceText(rows),
    components: [{ id: "component", kind: "part", locked: false, body: rows[0]?.body,
      attributes: [{ id: symbolAttribute.id, key: "Symbol", value: "symbol", symbolValue: "symbol", blockValue: "symbol", instanceValue: null, body: symbolAttribute.body }],
      pins: [{ id: "component-pin", body: { x: origin[0], y: -680, rotation: 90, length: 10 }, net: "SIGNAL", noConnect: { id: "inactive", value: "no", body: marker.body },
        attributes: [{ id: "a".repeat(16), key: "Pin Name", value: "1", symbolValue: "1", blockValue: null, instanceValue: null,
          body: { parentId: "component-pin", key: "Pin Name", value: null, x: 984.9149800000001, y: -695, rotation: 90, zIndex: 8 } },
        { id: "number", key: "Pin Number", value: "1", symbolValue: "1", blockValue: "1", instanceValue: null, body: number.body }] }] }] });
  const symbol = document("symbol", "SYMBOL", [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } },
    { id: "part", type: "PART", body: {} }, { id: "pin", type: "PIN", body: { partId: "part", x: -20, y: 0, rotation: 0, length: 10 } },
    { id: "library-name", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Name", value: "1", x: -5, y: 4.91498 } },
    { id: "library-number", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Number", value: "1", x: -15, y: 0.91498 } }]);
  const before = parseDocumentSource(beforeNative.source), initial = history(document("page", "SCH_PAGE", rows), symbol);
  const operation = { id: "composed", action: "sch.layout.batch", documentType: 1, operations: [
    { id: "move", action: "sch.component.translate", target: { primitiveId: "component" }, x: 1950, y: 1930 },
    ...(attachedWire ? [
      { id: "new-wire", action: "sch.wire.create", properties: { line: [wireStart, 1910, 2000, 1910], color: null, lineWidth: null, lineType: null } },
      { id: "new-label", action: "sch.net-label.create", properties: { x: 2000, y: 1910, net: "SIGNAL" } },
    ] : []),
  ] };
  const expected = expectedSchematicLayout(operation, before, beforeNative, undefined, { history: initial, templates: {} });
  const afterNative = structuredClone(expected.native), model = afterNative.components[0], pin = model?.pins[0]; assert.ok(model && pin);
  const displacement = 2.2737367544323206e-13;
  model.body["x"] = 1950.0000000000002; pin.body["x"] = 1950.0000000000002;
  for (const attr of pin.attributes) { attr.body["x"] = Number(attr.body["x"]) + displacement; }
  assert.ok(pin.noConnect); pin.noConnect.body["x"] = 1950.0000000000002;
  const afterRows = expected.expected.objects.map((row) => ["component", "number", "inactive"].includes(row.id)
    ? { ...row, body: { ...row.body, x: Number(row.body["x"]) + displacement } } : row);
  afterNative.source = sourceText(afterRows);
  return { initial, before, beforeNative, operation, expected, after: parseDocumentSource(afterNative.source), afterNative,
    saved: history(document("page", "SCH_PAGE", expected.expected.objects), symbol) };
}

void test("quarter-turn origin, stored number and inactive NC compose without changing retained evidence", () => {
  const f = composedQuarterTurnFixture(), raw = JSON.stringify(f);
  const aligned = alignSchematicCoordinateLifecycle(f.expected.expected, f.expected.native, f.after, f.afterNative, f.initial);
  assert.deepEqual(aligned.source, f.expected.expected); assert.deepEqual(aligned.native.components, f.expected.native.components);
  assert.equal(aligned.proof.storedPinNumbers[0]?.profile, "pinned-quarter-turn-displaced-pin-number");
  assert.deepEqual(aligned.proof.storedPinNumbers[0]?.origins, [[980.0000000000001, -700], [1950, -1930], [1950.0000000000002, -1930]]);
  assert.equal(aligned.proof.inactiveNoConnects.length, 1); assert.equal(aligned.proof.quarterTurnPinAttributes.length, 0);
  const restored = restoreComposedCoordinateStorage(aligned.source, aligned.native, f.after, f.afterNative, aligned.proof);
  assert.deepEqual(restored.source, f.after); assert.deepEqual(restored.native, f.afterNative);
  const storage = projectSchematicCoordinateCheckpoint(f.saved, f.after, f.afterNative);
  assert.equal(storage.proof.inactiveNoConnects.length, 1);
  const proof = verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: f.saved, expectedBefore: f.before, expectedAfter: f.after,
    beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} });
  assert.equal(proof["ok"], true); assert.equal(JSON.stringify(f), raw);
});

void test("composed storage proves raw constructor pose then uses exact typed pins for the attached-wire graph", () => {
  const f = composedQuarterTurnFixture(true), raw = JSON.stringify(f);
  const proof = verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: f.saved, expectedBefore: f.before, expectedAfter: f.after,
    beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} });
  assert.equal(proof["ok"], true); assert.equal(proof["comparisonSourceSha256"], f.expected.expected.sha256);
  assert.equal(JSON.stringify(f), raw);
  assert.throws(() => composedQuarterTurnFixture(true, 1950.0000000000005), /ambiguous near-coincident endpoints/u);
  const changed = structuredClone(f.after), line = changed.objects.find((row) => row.type === "LINE"); assert.ok(line);
  line.body["startX"] = 1950.0000000000005;
  assert.throws(() => verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: f.saved, expectedBefore: f.before, expectedAfter: changed,
    beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} }), Error);
});

void test("composed pin and inactive NC proofs refuse wrong arithmetic, identity, style, activity and library evidence", () => {
  for (const mutation of ["number-coordinate", "number-style", "number-value", "number-id", "pin-coordinate", "pin-net", "nc-coordinate", "nc-value", "nc-parent", "nc-style", "symbol-value", "library", "original-origin", "original-number", "mirror"] as const) {
    const f = composedQuarterTurnFixture(), model = f.afterNative.components[0], pin = model?.pins[0];
    const number = pin?.attributes.find((attr) => attr.id === "number");
    assert.ok(model && pin && number && pin.noConnect);
    if (mutation === "number-coordinate") { number.body["x"] = 1950.9149800000005; }
    if (mutation === "number-style") { number.body["zIndex"] = 90; }
    if (mutation === "number-value") { number.value = "2"; }
    if (mutation === "number-id") { number.id = "other"; }
    if (mutation === "pin-coordinate") { pin.body["x"] = 1950.0000000000005; }
    if (mutation === "pin-net") { pin.net = "FOREIGN"; }
    if (mutation === "nc-coordinate") { pin.noConnect.body["x"] = 1950.0000000000005; }
    if (mutation === "nc-value") { pin.noConnect.value = "yes"; pin.noConnect.body["value"] = "yes"; }
    if (mutation === "nc-parent") { pin.noConnect.body["parentId"] = "other"; }
    if (mutation === "nc-style") { pin.noConnect.body["zIndex"] = 90; }
    if (mutation === "mirror") { model.body["isMirror"] = true; }
    if (mutation === "symbol-value") { const attr = model.attributes[0]; assert.ok(attr); attr.value = "other-symbol"; }
    if (mutation === "library") {
      const symbol = f.initial.documents.find((doc) => doc.docType === "SYMBOL"); assert.ok(symbol); Object.assign(symbol, { semanticSha256: "0".repeat(64) });
    }
    if (mutation === "original-origin" || mutation === "original-number") {
      const page = f.initial.documents[0]; assert.ok(page);
      const row = page.records.find((entry) => entry.id === (mutation === "original-origin" ? "component" : "number")); assert.ok(row); row.body["x"] = Number(row.body["x"]) + 1;
      Object.assign(page, { semanticSha256: sha256Json({ uuid: page.uuid, docType: page.docType, metadata: page.metadata, records: page.records.map(({ id, type, body }) => ({ id, type, body })) }) });
    }
    assert.throws(() => alignSchematicCoordinateLifecycle(f.expected.expected, f.expected.native, f.after, f.afterNative, f.initial), Error, mutation);
  }
});

void test("composed durable NC comparison preserves exact typed/native write authority", () => {
  const f = composedQuarterTurnFixture(), page = f.saved.documents[0], symbol = f.saved.documents[1]; assert.ok(page && symbol);
  for (const [target, value] of [["inactive", 1950.0000000000005], ["inactive", 0], ["number", 1950.9149800000005]] as const) {
    const changed = history(document("page", "SCH_PAGE", page.records.map((row) => row.id === target ? Object.assign(structuredClone(row), { body: { ...row.body, x: value } }) : row)), symbol);
    assert.throws(() => verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: changed, expectedBefore: f.before, expectedAfter: f.after,
      beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} }), /neither retained/u);
  }
  const delta = 2.2737367544323206e-13;
  assert.equal(0 + delta, 1e-50 + delta, "IEEE addition alone must not authorize the durable spelling");
  const original = document("page", "SCH_PAGE", [{ id: "inactive", type: "ATTR", body: { key: "NO_CONNECT", value: "no", x: -10, y: 0 } }]);
  const corrupt = document("page", "SCH_PAGE", [{ id: "inactive", type: "ATTR", body: { key: "NO_CONNECT", value: "no", x: 1e-50, y: 0 } }]);
  const source = { ...f.before, objects: [{ id: "inactive", type: "ATTR", body: { key: "NO_CONNECT", value: "no", x: delta, y: 0 } }] };
  const typed = { ...source, objects: [{ id: "inactive", type: "ATTR", body: { key: "NO_CONNECT", value: "no", x: 0, y: 0 } }] };
  assert.throws(() => { verifyInactiveNoConnectWrites(history(original), history(corrupt), source, typed); }, /neither retained/u);
});

void test("captured coordinate restoration rejects non-coordinate changes and unproved owned records", () => {
  for (const mutation of ["attribute-style", "pin-net", "stored-attribute", "nc-value", "pose", "captured-part-hash"] as const) {
    const f = composedQuarterTurnFixture();
    const aligned = alignSchematicCoordinateLifecycle(f.expected.expected, f.expected.native, f.after, f.afterNative, f.initial);
    const model = aligned.native.components[0], pin = model?.pins[0]; assert.ok(model && pin && pin.noConnect);
    if (mutation === "attribute-style") { const attr = pin.attributes[0]; assert.ok(attr); attr.body["zIndex"] = 99; }
    if (mutation === "pin-net") { pin.net = "FOREIGN"; }
    if (mutation === "stored-attribute") { const attr = model.attributes[0]; assert.ok(attr); attr.body["x"] = 1; }
    if (mutation === "nc-value") { pin.noConnect.value = "yes"; }
    if (mutation === "pose") { model.body["x"] = 1951; }
    if (mutation === "captured-part-hash") { const change = aligned.proof.changes[0]; assert.ok(change); Object.assign(change, { capturedComponentSha256: "0".repeat(64) }); }
    assert.throws(() => restoreComposedCoordinateStorage(aligned.source, aligned.native, f.after, f.afterNative, aligned.proof), Error, mutation);
  }
});

function recenteredQuarterTurnFixture(): ReturnType<typeof composedQuarterTurnFixture> {
  const first = composedQuarterTurnFixture(true), initial = structuredClone(first.saved);
  const beforeNative = structuredClone(first.afterNative);
  const before = parseDocumentSource(beforeNative.source);
  const operation = { id: "recenter", action: "sch.layout.batch", documentType: 1, operations: [
    { id: "return-to-saved-origin", action: "sch.component.translate", target: { primitiveId: "component" }, x: 1950, y: 1930 },
  ] };
  const expected = expectedSchematicLayout(operation, before, beforeNative, undefined, { history: initial, templates: {} });
  const afterNative = structuredClone(first.afterNative);
  const after = parseDocumentSource(afterNative.source);
  return { initial, before, beforeNative, operation, expected, after, afterNative, saved: structuredClone(first.saved) };
}

void test("reconstructed quarter-turn recenter preserves stored number, inactive NC and attached wire through reopening", () => {
  const f = recenteredQuarterTurnFixture(), raw = JSON.stringify(f);
  const aligned = alignSchematicCoordinateLifecycle(f.expected.expected, f.expected.native, f.after, f.afterNative, f.initial);
  assert.deepEqual(aligned.source, f.expected.expected); assert.deepEqual(aligned.native.components, f.expected.native.components);
  assert.deepEqual(aligned.proof.storedPinNumbers[0]?.origins, [[1950, -1930], [1950, -1930], [1950.0000000000002, -1930]]);
  assert.deepEqual(aligned.proof.storedPinNumbers[0]?.recenter, {
    profile: "pinned-quarter-turn-reconstructed-origin-recenter", translationOrigin: [1950.0000000000002, -1930],
  });
  assert.equal(aligned.proof.inactiveNoConnects.length, 1);
  const restored = restoreComposedCoordinateStorage(aligned.source, aligned.native, f.after, f.afterNative, aligned.proof);
  assert.deepEqual(restored.source, f.after); assert.deepEqual(restored.native, f.afterNative);
  const proof = verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: f.saved, expectedBefore: f.before, expectedAfter: f.after,
    beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} });
  assert.equal(proof["ok"], true); assert.equal(proof["comparisonSourceSha256"], f.expected.expected.sha256);
  assert.deepEqual(f.after.objects.filter((row) => ["WIRE", "LINE"].includes(row.type)), f.before.objects.filter((row) => ["WIRE", "LINE"].includes(row.type)));
  assert.equal(JSON.stringify(f), raw);
});

void test("reconstructed recenter refuses altered saved body, marker, label, physical pin and library", () => {
  for (const mutation of ["saved-origin", "saved-order", "saved-number", "saved-marker", "number-coordinate", "number-style", "pin-coordinate", "pin-net", "nc-active", "library"] as const) {
    const f = recenteredQuarterTurnFixture(), model = f.afterNative.components[0], pin = model?.pins[0];
    const number = pin?.attributes.find((attr) => attr.id === "number"), page = f.initial.documents[0]; assert.ok(model && pin && number && pin.noConnect && page);
    if (mutation.startsWith("saved-")) {
      let targetId = "component";
      if (mutation === "saved-number") { targetId = "number"; }
      if (mutation === "saved-marker") { targetId = "inactive"; }
      const row = page.records.find((entry) => entry.id === targetId); assert.ok(row);
      const field = mutation === "saved-order" ? "zIndex" : "x";
      row.body[field] = Number(row.body[field]) + 1;
      Object.assign(page, { semanticSha256: sha256Json({ uuid: page.uuid, docType: page.docType, metadata: page.metadata, records: page.records.map(({ id, type, body }) => ({ id, type, body })) }) });
    }
    if (mutation === "number-coordinate") { number.body["x"] = 1950.9149800000005; }
    if (mutation === "number-style") { number.body["zIndex"] = 90; }
    if (mutation === "pin-coordinate") { pin.body["x"] = 1950.0000000000005; }
    if (mutation === "pin-net") { pin.net = "FOREIGN"; }
    if (mutation === "nc-active") { pin.noConnect.value = "yes"; pin.noConnect.body["value"] = "yes"; }
    if (mutation === "library") { const symbol = f.initial.documents[1]; assert.ok(symbol); Object.assign(symbol, { semanticSha256: "0".repeat(64) }); }
    assert.throws(() => alignSchematicCoordinateLifecycle(f.expected.expected, f.expected.native, f.after, f.afterNative, f.initial), Error, mutation);
  }
});

void test("reconstructed recenter retains durable write and exact attached-wire guards", () => {
  const f = recenteredQuarterTurnFixture(), page = f.saved.documents[0], symbol = f.saved.documents[1]; assert.ok(page && symbol);
  for (const [id, x] of [["number", 1950.9149800000005], ["inactive", 1950.0000000000005]] as const) {
    const altered = history(document("page", "SCH_PAGE", page.records.map((row) => row.id === id ? Object.assign(structuredClone(row), { body: { ...row.body, x } }) : row)), symbol);
    assert.throws(() => verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: altered, expectedBefore: f.before, expectedAfter: f.after,
      beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} }), /neither retained/u);
  }
  const changed = structuredClone(f.after), line = changed.objects.find((row) => row.type === "LINE"); assert.ok(line);
  line.body["startX"] = 1950.0000000000005;
  assert.throws(() => verifySchematicLayoutPersistence(f.operation, { before: f.initial, after: f.saved, expectedBefore: f.before, expectedAfter: changed,
    beforeNative: f.beforeNative, afterNative: f.afterNative }, f.expected.createdIds, { history: f.initial, templates: {} }), Error);
});
