import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import { alignSchematicCoordinateLifecycle, projectSchematicCoordinateCheckpoint, schematicHalfTurnOrigin, schematicQuarterTurnOrigin, schematicThreeQuarterTurnOrigin } from "../src/schematic-coordinate-lifecycle.ts";
import { verifySchematicLayoutBaseline } from "../src/schematic-layout-batch.ts";
import { verifySchematicStorageBaseline } from "../src/schematic-storage-persistence.ts";
import { compileDesignAction, prepareDesignAction, verifyDesignAction } from "../src/design-action.ts";

void test("native quarter-turn matrix preserves its exact floating result and reaches a fixed point", () => {
  for (const [x, y, expectedX] of [[975, -555, 975.0000000000001], [465, -500, 465.00000000000006]] as const) {
    const point = schematicQuarterTurnOrigin(x, y);
    assert.deepEqual(point, [expectedX, y]);
    assert.notEqual(point[0], x);
    assert.deepEqual(schematicQuarterTurnOrigin(point[0], point[1]), point);
  }
  assert.throws(() => schematicQuarterTurnOrigin(Number.NaN, 0), /finite/u);
});

void test("native half-turn netport matrix has an exact two-cycle, not a fixed point", () => {
  const point = schematicHalfTurnOrigin(250, -475);
  assert.deepEqual(point, [250, -475.00000000000006]);
  assert.deepEqual(schematicHalfTurnOrigin(point[0], point[1]), [250, -475]);
  assert.throws(() => schematicHalfTurnOrigin(0, Number.POSITIVE_INFINITY), /finite/u);
});

function fixture(storedY = -475, comparedY = -475.00000000000006, kind = "netport", rotation = 180, isMirror = false, x = 250): {
  history: NativeHistorySnapshot; source: ReturnType<typeof parseDocumentSource>; native: ReturnType<typeof schematicNativeSnapshotSchema.parse>;
} {
  const header = { uuid: "page", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
  const component = { id: "port", type: "COMPONENT", body: { partId: "part", x, y: comparedY, rotation, isMirror, attrs: {}, zIndex: 1 } };
  const attr = { id: "symbol-attr", type: "ATTR", body: { parentId: "port", key: "Symbol", value: "symbol", x: null, y: null, zIndex: 0 } };
  const records = [component, attr];
  const text = `{"type":"DOCHEAD"}||${JSON.stringify(header)}|\n${records.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("")}`;
  const native = schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: "page@project" }, source: text,
    components: [{ id: "port", kind, locked: false, body: component.body, pins: [{ id: "port-pin", body: { x, y: comparedY, rotation: rotation === 270 ? 90 : 180, length: 10 }, attributes: [], net: "SIGNAL", noConnect: null }],
      attributes: [{ id: attr.id, key: "Symbol", value: "symbol", symbolValue: "symbol", blockValue: null, instanceValue: null, body: attr.body }] }] });
  const symbolRecords: NativeSourceObject[] = [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }, { id: "part", type: "PART", body: { title: "" } }];
  const documents = [{ uuid: "page", docType: "SCH_PAGE", metadata: header, records: records.map((row) => row.id === "port" ? Object.assign(structuredClone(row), { body: { ...component.body, y: storedY } }) : row) },
    { uuid: "symbol", docType: "SYMBOL", metadata: { uuid: "symbol", docType: "SYMBOL" }, records: symbolRecords }].map((doc) => Object.assign(structuredClone(doc), {
    records: doc.records.map((row) => Object.assign(structuredClone(row), { ticket: 1, client: null })), semanticSha256: sha256Json(doc) }));
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), headHistoryUuid: "c".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  return { history, source: parseDocumentSource(text), native };
}

void test("270-degree netports retain native negative-270 arithmetic and its exact fixed point", () => {
  for (const x of [2730, 2890]) {
    const point = schematicThreeQuarterTurnOrigin(x, -2430);
    assert.deepEqual(point, [x, -2429.9999999999995]);
    assert.deepEqual(schematicThreeQuarterTurnOrigin(point[0], point[1]), point);
    assert.notDeepEqual(point, schematicQuarterTurnOrigin(x, -2430));
  }
  assert.throws(() => schematicThreeQuarterTurnOrigin(Number.NaN, 0), /finite/u);
});

void test("270-degree checkpoint and baseline prove both exact durable spellings without changing inputs", () => {
  for (const x of [2730, 2890]) {
    for (const [stored, compared] of [[-2430, -2429.9999999999995], [-2429.9999999999995, -2430]] as const) {
      const f = fixture(stored, compared, "netport", 270, false, x), raw = JSON.stringify(f);
      const result = projectSchematicCoordinateCheckpoint(f.history, f.source, f.native);
      assert.deepEqual(result.proof.changes.map(({ stored: a, compared: b }) => [a, b]), [[[x, stored], [x, compared]]]);
      assert.deepEqual(result.checkpoint.documents[1], f.history.documents[1]);
      assert.deepEqual(result.checkpoint.documents[0]?.records.find((row) => row.id === "port")?.body,
        f.source.objects.find((row) => row.id === "port")?.body);
      assert.equal(verifySchematicLayoutBaseline({ checkpoint: f.history, source: f.source, native: f.native,
        targets: [{ id: "port", fields: ["x", "y"] }] })["ok"], true);
      assert.equal(JSON.stringify(f), raw);
    }
  }
});

function threeQuarterFixture(x: number, y: number): ReturnType<typeof fixture> {
  const f = fixture(-2430, y, "netport", 270, false, x);
  const component = f.native.components[0];
  assert.ok(component); const pin = component.pins[0]; assert.ok(pin);
  for (const [index, key, dx, dy] of [[0, "Relevance", 0, -100], [1, "Pin Type", -14, 2],
    [2, "Pin Name", 0, -10], [3, "Pin Number", 0, -7]] as const) {
    const parent = key === "Relevance" ? component : pin;
    parent.attributes.push({ id: String(index + 1).repeat(16), key, value: null, symbolValue: null, blockValue: null, instanceValue: null,
      body: { parentId: parent.id, key, value: null, x: x + dx, y: y + dy, rotation: 90, zIndex: index + 1 } });
  }
  component.attributes.sort((a, b) => a.id.localeCompare(b.id));
  pin.attributes.sort((a, b) => a.id.localeCompare(b.id));
  return f;
}

void test("270-degree lifecycle preserves exact inherited displacement and the full typed effect", () => {
  for (const x of [2730, 2890]) {
    const before = threeQuarterFixture(x, -2430);
    const after = threeQuarterFixture(x, -2429.9999999999995);
    const raw = JSON.stringify({ before, after });
    const result = alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history);
    assert.deepEqual(result.source, before.source); assert.deepEqual(result.native.components, before.native.components);
    assert.equal(result.proof.changes.length, 1);
    const operation = compileDesignAction({ id: "port270-layout", action: "sch.layout.batch", operations: [
      { id: "same-pose", action: "sch.component.translate", target: { primitiveId: "port" }, x, y: 2430 },
    ] });
    const ids = { createdIds: {}, layoutCloneLifecycle: true as const }, initial = { source: before.source, schematic: before.native, history: before.history };
    verifyDesignAction(operation, initial, { source: after.source, schematic: after.native }, ids);
    const downstream = { calls: 0 };
    for (const change of ["pin-coordinate", "pin-net", "inherited-coordinate", "inherited-value"] as const) {
      const drift = structuredClone(after.native), model = drift.components[0]; assert.ok(model);
      const pin = model.pins[0]; assert.ok(pin); const attr = pin.attributes[0]; assert.ok(attr);
      if (change === "pin-coordinate") { pin.body["y"] = -2429.999999999999; }
      if (change === "pin-net") { pin.net = "FOREIGN"; }
      if (change === "inherited-coordinate") { attr.body["y"] = -2427.999999999999; }
      if (change === "inherited-value") { attr.body["value"] = "changed"; }
      assert.throws(() => { verifyDesignAction(operation, initial, { source: after.source, schematic: drift }, ids); downstream.calls += 1; });
    }
    assert.equal(downstream.calls, 0); assert.equal(JSON.stringify({ before, after }), raw);
  }
});

void test("270-degree reconstruction rejects nearby values, wrong profiles and changed stored or library fields", () => {
  for (const f of [fixture(-2430, -2429.999999999999, "netport", 270, false, 2730),
    fixture(-2430, -2429.9999999999995, "part", 270, false, 2730),
    fixture(-2430, -2429.9999999999995, "netport", 90, false, 2730),
    fixture(-2430, -2429.9999999999995, "netport", 270, true, 2730)]) {
    assertLayoutBaselineRefused(f);
  }
  const f = fixture(-2430, -2429.9999999999995, "netport", 270, false, 2730), page = f.history.documents[0], symbol = f.history.documents[1];
  assert.ok(page); assert.ok(symbol);
  for (const records of [symbol.records.filter((row) => row.type !== "PART"),
    symbol.records.map((row) => row.type === "CANVAS" ? { ...row, body: { originX: 1, originY: 0 } } : row)]) {
    const changed = { ...symbol, records, semanticSha256: sha256Json({ uuid: symbol.uuid, docType: symbol.docType,
      metadata: symbol.metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
    const documents = [page, changed];
    assertLayoutBaselineRefused({ ...f, history: { ...f.history, documents,
      semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) } });
  }
  assertLayoutBaselineRefused({ ...f, history: { ...f.history, documents: [page, { ...symbol, semanticSha256: "0".repeat(64) }] } });
  assertLayoutBaselineRefused({ ...f, history: { ...f.history, documents: [page] } });
  const changedPage = { ...page, records: page.records.map((row) => row.id === "port" ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: 99 } }) : row) };
  assert.throws(() => projectSchematicCoordinateCheckpoint({ ...f.history, documents: [changedPage, symbol] }, f.source, f.native), /another component field/u);
});

void test("checkpoint projection admits only the source-bound half-turn netport two-cycle and retains raw evidence", () => {
  for (const [stored, compared] of [[-475, -475.00000000000006], [-475.00000000000006, -475]] as const) {
    const f = fixture(stored, compared), raw = JSON.stringify(f);
    const result = projectSchematicCoordinateCheckpoint(f.history, f.source, f.native);
    assert.equal(JSON.stringify(f), raw);
    assert.deepEqual(result.proof.changes.map(({ stored: a, compared: b }) => [a, b]), [[[250, stored], [250, compared]]]);
    assert.deepEqual(result.checkpoint.documents[1], f.history.documents[1]);
    const sourceRecord = f.source.objects.find((row) => row.id === "port"); assert.ok(sourceRecord);
    assert.deepEqual(result.checkpoint.documents[0]?.records.find((row) => row.id === "port")?.body, sourceRecord.body);
  }
});

void test("new-layout baseline proves the exact half-turn spelling before checking intended translation fields", () => {
  const f = fixture(), targets = [{ id: "port", fields: ["x", "y"] }];
  const input = { checkpoint: f.history, source: f.source, native: f.native, targets };
  const raw = JSON.stringify(input);
  assert.throws(() => verifySchematicStorageBaseline(input), /Intended target baseline/u);
  const proof = verifySchematicLayoutBaseline(input);
  assert.equal(proof["ok"], true);
  assert.equal(proof["checkpointSemanticSha256"], f.history.semanticSha256);
  assert.equal(proof["checkpointSha256"], f.history.checkpointSha256);
  assert.equal(proof["sourceSha256"], f.source.sha256);
  assert.deepEqual(proof["coordinateProof"], projectSchematicCoordinateCheckpoint(f.history, f.source, f.native).proof);
  assert.equal(JSON.stringify(input), raw);
  assert.throws(() => verifySchematicLayoutBaseline({ ...input, targets: [{ id: "missing", fields: ["y"] }] }), /Intended target baseline/u);
});

function assertLayoutBaselineRefused(f: ReturnType<typeof fixture>): void {
  const input = { checkpoint: f.history, source: f.source, native: f.native, targets: [{ id: "port", fields: ["y"] }] };
  const raw = JSON.stringify(input);
  assert.throws(() => verifySchematicLayoutBaseline(input));
  assert.equal(JSON.stringify(input), raw);
}

void test("new-layout baseline refuses wrong poses, rotations, symbol evidence and corrupted raw checkpoints", () => {
  assertLayoutBaselineRefused(fixture(-475, -475.0000000000001));
  assertLayoutBaselineRefused(fixture(-475, -475.00000000000006, "netport", 90));
  assertLayoutBaselineRefused(fixture(-475, -475.00000000000006, "netport", 180, true));
  const changed = fixture(), page = changed.history.documents[0], symbol = changed.history.documents[1];
  assert.ok(page); assert.ok(symbol);
  for (const records of [symbol.records.filter((row) => row.type !== "PART"),
    symbol.records.map((row) => row.type === "CANVAS" ? { ...row, body: { originX: 1, originY: 0 } } : row)]) {
    const changedSymbol = { ...symbol, records, semanticSha256: sha256Json({ uuid: symbol.uuid, docType: symbol.docType,
      metadata: symbol.metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
    const documents = [page, changedSymbol];
    assertLayoutBaselineRefused({ ...changed, history: { ...changed.history, documents,
      semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) } });
  }
  assertLayoutBaselineRefused({ ...changed, history: { ...changed.history, documents: [page, { ...symbol, semanticSha256: "0".repeat(64) }] } });
  assertLayoutBaselineRefused({ ...changed, history: { ...changed.history, documents: [page] } });
  assertLayoutBaselineRefused({ ...changed, history: { ...changed.history, documents: [{ ...page, semanticSha256: "0".repeat(64) }, symbol] } });
});

void test("half-turn lifecycle alignment preserves pins and nets and refuses inherited displacement drift", () => {
  const after = fixture(), before = fixture(-475, -475);
  const result = alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history);
  assert.deepEqual(result.source, before.source);
  assert.deepEqual(result.native.components, before.native.components);
  const drift = structuredClone(after.native), pin = drift.components[0]?.pins[0]; assert.ok(pin);
  pin.body["y"] = -475.0000000000001;
  assert.throws(() => alignSchematicCoordinateLifecycle(before.source, before.native, after.source, drift, before.history), /exact component displacement/u);
});

void test("typed non-clone layout retains authenticated coordinate evidence without a templates property", () => {
  const before = fixture(-475, -475); const after = fixture();
  const operation = { id: "non-clone-layout", action: "sch.layout.batch", operations: [
    { id: "same-pose", action: "sch.component.translate", target: { primitiveId: "port" }, x: 250, y: 475 },
  ] };
  const initial = { source: before.source, schematic: before.native, history: before.history };
  const observed = { source: after.source, schematic: after.native };
  const ids = { createdIds: {}, layoutCloneLifecycle: true as const };
  const retained = JSON.stringify({ initial, observed });
  const prepared = prepareDesignAction(operation, initial, ids);
  const compiled = compileDesignAction(operation);
  assert.equal(prepared.adapterProfile, "easyeda-pro-control.schematic-layout-batch.v1");
  assert.deepEqual(verifyDesignAction(compiled, initial, observed, ids),
    verifyDesignAction(compiled, { ...initial, layoutTemplates: {} }, observed, ids));
  assert.equal(JSON.stringify({ initial, observed }), retained);
  assert.throws(() => verifyDesignAction(compiled, { source: before.source, schematic: before.native }, observed, ids), /changed content/u);
  const symbol = before.history.documents[1]; assert.ok(symbol);
  const corrupted = { ...before.history, documents: before.history.documents.map((doc) => doc.uuid === symbol.uuid ? Object.assign(structuredClone(doc), { semanticSha256: "0".repeat(64) }) : doc) };
  assert.throws(() => verifyDesignAction(compiled, { ...initial, history: corrupted }, observed, ids), /hash|semantic|scope|evidence/iu);
});

void test("half-turn checkpoint rejects nearby numbers, unreviewed profiles, changed library evidence and other fields", () => {
  for (const f of [fixture(-475, -475.0000000000001), fixture(-475, -475.00000000000006, "part"), fixture(-475, -475.00000000000006, "netport", 90), fixture(-475, -475.00000000000006, "netport", 180, true)]) {
    assert.throws(() => projectSchematicCoordinateCheckpoint(f.history, f.source, f.native));
  }
  const f = fixture(), page = f.history.documents[0], symbol = f.history.documents[1]; assert.ok(symbol); assert.ok(page);
  for (const badSymbol of [{ ...symbol, semanticSha256: "0".repeat(64) }, { ...symbol, records: symbol.records.filter((row) => row.type !== "PART") },
    { ...symbol, records: symbol.records.map((row) => row.type === "CANVAS" ? { ...row, body: { originX: 1, originY: 0 } } : row) }]) {
    assert.throws(() => projectSchematicCoordinateCheckpoint({ ...f.history, documents: [page, badSymbol] }, f.source, f.native));
  }
  const changedPage = { ...page, records: page.records.map((row) => row.id === "port" ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: 99 } }) : row) };
  assert.throws(() => projectSchematicCoordinateCheckpoint({ ...f.history, documents: [changedPage, symbol] }, f.source, f.native), /another component field/u);
});

function inheritedNameFixture(): { before: ReturnType<typeof fixture>; after: ReturnType<typeof fixture> } {
  const make = (x: number): ReturnType<typeof fixture> => {
    const value = fixture(-1370, -1370, "part", 0);
    const component = value.native.components[0], page = value.history.documents[0], symbol = value.history.documents[1];
    assert.ok(component); assert.ok(page); assert.ok(symbol);
    component.body["x"] = 180;
    const pin = component.pins[0]; assert.ok(pin);
    pin.id = "port-e1"; pin.body = { x: 160, y: -1370, rotation: 0, length: 10 };
    pin.attributes = [{ id: "a".repeat(16), key: "Pin Name", value: "DATA", symbolValue: "DATA", blockValue: null, instanceValue: null,
      body: { parentId: pin.id, key: "Pin Name", value: null, x, y: -1364.08502, rotation: 0, align: "LEFT_BOTTOM", zIndex: 1 } }];
    const sourceRows = value.source.objects.map((row) => row.type === "COMPONENT" ? { ...row, body: component.body } : row);
    value.native.source = `{"type":"DOCHEAD"}||${JSON.stringify(value.source.document)}|\n${sourceRows.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("")}`;
    value.source = parseDocumentSource(value.native.source);
    const symbolRows: NativeSourceObject[] = [...symbol.records, { id: "e1", type: "PIN", body: { partId: "part", x: -20, y: 0, rotation: 0 } },
      { id: "e2", type: "ATTR", body: { partId: "part", parentId: "e1", key: "Pin Name", value: "DATA", x: -6.3, y: 5.91498 } }];
    const documents = [{ ...page, records: page.records.map((row) => row.type === "COMPONENT" ? Object.assign(structuredClone(row), { body: { ...component.body, x: 925, y: -645 } }) : row) },
      { ...symbol, records: symbolRows.map((row) => Object.assign(structuredClone(row), { ticket: 1, client: null })) }].map((doc) => Object.assign(structuredClone(doc), {
      semanticSha256: sha256Json({ uuid: doc.uuid, docType: doc.docType, metadata: doc.metadata, records: doc.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
    value.history = { ...value.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    return value;
  };
  return { before: make((-6.3 + 925) + (180 - 925)), after: make(-6.3 + 180) };
}

void test("unstored unrotated pin names prove exact original-translation and library-reconstruction arithmetic", () => {
  const { before, after } = inheritedNameFixture(), raw = JSON.stringify({ before, after });
  const result = alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history);
  assert.equal(JSON.stringify({ before, after }), raw);
  assert.deepEqual(result.source, after.source);
  assert.deepEqual(result.native.components, before.native.components);
  assert.equal(result.proof.changes.length, 0);
  assert.equal(result.proof.inheritedPinNames.length, 1);
  assert.deepEqual(result.proof.inheritedPinNames[0]?.translated, [173.70000000000005, -1364.08502]);
  assert.deepEqual(result.proof.inheritedPinNames[0]?.reconstructed, [173.7, -1364.08502]);
  assert.equal(result.proof.rawNativeSha256, sha256Json(after.native));
});

void test("pin-name reconstruction refuses nearby numbers, style/value drift and altered library evidence", () => {
  for (const mutation of ["x", "y", "style", "value", "symbol", "checkpoint", "stored", "pin"] as const) {
    const { before, after } = inheritedNameFixture(), component = after.native.components[0], page = before.history.documents[0], symbol = before.history.documents[1];
    assert.ok(component); assert.ok(symbol); assert.ok(page);
    const pin = component.pins[0];
    const attr = pin?.attributes[0]; assert.ok(pin); assert.ok(attr);
    if (mutation === "x") { attr.body["x"] = 173.70000000000002; }
    if (mutation === "y") { attr.body["y"] = -1364.0850200000002; }
    if (mutation === "style") { attr.body["align"] = "RIGHT_BOTTOM"; }
    if (mutation === "value") { attr.value = "OTHER"; }
    if (mutation === "symbol") { const row = symbol.records[0]; assert.ok(row); row.body["originX"] = 1; }
    if (mutation === "checkpoint") { const row = page.records[0]; assert.ok(row); row.body["x"] = 926; }
    if (mutation === "pin") { pin.body["x"] = 161; }
    if (mutation === "stored") {
      after.native.source += `${JSON.stringify({ id: attr.id, type: "ATTR" })}||${JSON.stringify(attr.body)}|\n`;
      after.source = parseDocumentSource(after.native.source);
    }
    assert.throws(() => alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history), Error, mutation);
  }
});

function quarterTurnAttributeFixture(key: "Pin Name" | "Pin Number" = "Pin Name"): ReturnType<typeof inheritedNameFixture> {
  const make = (reopened: boolean): ReturnType<typeof fixture> => {
    const value = inheritedNameFixture().before;
    const component = value.native.components[0], page = value.history.documents[0], symbol = value.history.documents[1];
    assert.ok(component); assert.ok(page); assert.ok(symbol);
    component.body["rotation"] = 90; component.body["y"] = -1090;
    const pin = component.pins[0];
    const attr = pin?.attributes[0]; assert.ok(pin); assert.ok(attr);
    pin.body = { x: 180, y: -1070, rotation: 90, length: 10 };
    attr.id = (reopened ? "b" : "a").repeat(16); attr.key = key;
    const x = key === "Pin Name" ? 181.91498 : 177.91498;
    attr.body = { ...attr.body, key, x: reopened ? x - 2.842170943040401e-14 : x,
      y: key === "Pin Name" ? -1084 : -1076, rotation: 90 };
    const rows = value.source.objects.map((row) => row.type === "COMPONENT" ? { ...row, body: structuredClone(component.body) } : row);
    value.native.source = `{"type":"DOCHEAD"}||${JSON.stringify(value.source.document)}|\n${rows.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("")}`;
    value.source = parseDocumentSource(value.native.source);
    const documents = [
      { ...page, records: page.records.map((row) => row.type === "COMPONENT" ? Object.assign(structuredClone(row), { body: { ...component.body, x: 100, y: -340 } }) : row) },
      { ...symbol, records: symbol.records.map((row) => row.id === "e2" ? Object.assign(structuredClone(row), { body: { ...row.body, key,
        x: key === "Pin Name" ? -6 : -14, y: key === "Pin Name" ? 1.91498 : -2.08502 } }) : row) },
    ].map((doc) => Object.assign(structuredClone(doc), { semanticSha256: sha256Json({ uuid: doc.uuid, docType: doc.docType, metadata: doc.metadata, records: doc.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
    value.history = { ...value.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    return value;
  };
  return { before: make(false), after: make(true) };
}

void test("unstored quarter-turn Pin Name and Number reproduce both exact constructor arithmetic paths", () => {
  for (const key of ["Pin Name", "Pin Number"] as const) {
    const { before, after } = quarterTurnAttributeFixture(key), raw = JSON.stringify({ before, after });
    const result = alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history);
    assert.equal(JSON.stringify({ before, after }), raw);
    assert.deepEqual(result.source, after.source);
    assert.equal(result.proof.changes.length, 0);
    assert.equal(result.proof.inheritedPinNames.length, 0);
    assert.equal(result.proof.quarterTurnPinAttributes.length, 1);
    const proof = result.proof.quarterTurnPinAttributes[0]; assert.ok(proof);
    assert.equal(proof.key, key);
    assert.deepEqual(proof.originalOrigin, [100, -340]);
    assert.deepEqual(proof.currentOrigin, [180, -1090]);
    assert.deepEqual(proof.translated, key === "Pin Name" ? [181.91498, -1084] : [177.91498, -1076]);
    assert.deepEqual(proof.reconstructed, key === "Pin Name" ? [181.91497999999999, -1084] : [177.91497999999999, -1076]);
    assert.equal(result.proof.rawNativeSha256, sha256Json(after.native));
    const normalized = result.native.components[0]?.pins[0]?.attributes[0], original = before.native.components[0]?.pins[0]?.attributes[0];
    assert.ok(normalized); assert.ok(original);
    assert.deepEqual({ ...normalized, id: original.id }, original);
    assert.deepEqual(result.native.components[0]?.pins[0]?.body, before.native.components[0]?.pins[0]?.body);
  }
});

void test("quarter-turn pin attributes reject nearby coordinates, stored overrides and physical/value/style drift", () => {
  for (const mutation of ["nearby", "translated-before", "pin", "style", "value", "stored-before", "stored-after", "duplicate", "instance"] as const) {
    const { before, after } = quarterTurnAttributeFixture();
    const component = after.native.components[0], pin = component?.pins[0];
    const attr = pin?.attributes[0], old = before.native.components[0]?.pins[0]?.attributes[0];
    assert.ok(component); assert.ok(pin); assert.ok(attr); assert.ok(old);
    if (mutation === "nearby") { attr.body["x"] = 181.91497999999996; }
    if (mutation === "translated-before") { old.body["x"] = 181.91498 + 2.842170943040401e-14; }
    if (mutation === "pin") { pin.body["x"] = 180.00000000000003; }
    if (mutation === "style") { attr.body["align"] = "RIGHT_BOTTOM"; }
    if (mutation === "value") { attr.value = "OTHER"; }
    if (mutation === "instance") { attr.instanceValue = "DATA"; }
    if (mutation === "duplicate") { pin.attributes.push(structuredClone(attr)); }
    if (mutation === "stored-before" || mutation === "stored-after") {
      const selected = mutation === "stored-before" ? before : after, target = mutation === "stored-before" ? old : attr;
      selected.native.source += `${JSON.stringify({ id: target.id, type: "ATTR" })}||${JSON.stringify(target.body)}|\n`;
      selected.source = parseDocumentSource(selected.native.source);
    }
    assert.throws(() => alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history), Error, mutation);
  }
});

void test("quarter-turn pin attributes reject altered hash-bound library, origin, rotation and checkpoint overrides", () => {
  for (const mutation of ["library-hash", "page-hash", "canvas", "original-origin", "rotation", "mirror", "checkpoint-override"] as const) {
    const { before, after } = quarterTurnAttributeFixture("Pin Number");
    const page = before.history.documents[0], symbol = before.history.documents[1];
    const component = after.native.components[0];
    const attr = component?.pins[0]?.attributes[0];
    assert.ok(page); assert.ok(symbol); assert.ok(component); assert.ok(attr);
    let documents = before.history.documents;
    if (mutation === "library-hash") { documents = [page, { ...symbol, semanticSha256: "0".repeat(64) }]; }
    if (mutation === "page-hash") { documents = [{ ...page, semanticSha256: "0".repeat(64) }, symbol]; }
    if (mutation === "canvas") { const canvas = symbol.records.find((row) => row.type === "CANVAS"); assert.ok(canvas); canvas.body["originX"] = 1; }
    if (mutation === "original-origin") { const pose = page.records.find((row) => row.type === "COMPONENT"); assert.ok(pose); pose.body["x"] = 0; }
    if (mutation === "rotation" || mutation === "mirror") {
      component.body[mutation === "rotation" ? "rotation" : "isMirror"] = mutation === "rotation" ? 270 : true;
      const row = after.source.objects.find((entry) => entry.type === "COMPONENT"); assert.ok(row); Object.assign(row.body, structuredClone(component.body));
      after.native.source = `{"type":"DOCHEAD"}||${JSON.stringify(after.source.document)}|\n${after.source.objects.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("")}`;
      after.source = parseDocumentSource(after.native.source);
    }
    if (mutation === "checkpoint-override") {
      documents = [{ ...page, records: [...page.records, { id: "c".repeat(16), type: "ATTR", body: structuredClone(attr.body), ticket: 2, client: null }] }, symbol];
    }
    // Rehash adversarial content so refusal is about binding/arithmetic, not
    // Merely an intentionally stale digest, except the two hash-only cases.
    if (mutation !== "library-hash" && mutation !== "page-hash") {
      documents = documents.map((doc) => ({ ...doc, semanticSha256: sha256Json({ uuid: doc.uuid, docType: doc.docType, metadata: doc.metadata, records: doc.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
    }
    before.history = { ...before.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    // A changed whole component is outside this comparison profile even when
    // Its altered rotation makes the special branch inapplicable.
    if (mutation === "rotation") {
      const result = alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history);
      assert.equal(result.proof.quarterTurnPinAttributes.length, 0);
      assert.notDeepEqual(result.native.components, before.native.components);
    } else {
      assert.throws(() => alignSchematicCoordinateLifecycle(before.source, before.native, after.source, after.native, before.history), Error, mutation);
    }
  }
});
