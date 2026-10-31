import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";
import { PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS, publicSystemClassificationRequestSchema,
  queryPublicSystemClassification, validatePublicSystemClassificationResult } from "../src/public-system-classification.ts";
import { parsePublicSystemCatalogRequest, queryPublicSystemCatalog, validatePublicSystemCatalogResult } from "../src/public-system-catalog.ts";

const otherUuid = "c".repeat(32), primaryUuid = "a".repeat(32), secondaryUuid = "b".repeat(32);
const row = { uuid: primaryUuid, user_uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, type: 4, parent_uuid: "", name: "Package",
  name_cn: "", szlcsc_id: 0, order_no: 0, updated_at: "2022-04-02 06:09:37", created_at: "2022-04-02 06:09:37" };
const child = { ...row, uuid: secondaryUuid, parent_uuid: primaryUuid, name: "0603", order_no: 3 };
const envelope = (rows: unknown[] = [child, row]): unknown => ({ success: true, code: 0, result: rows });
const common = { libraryType: "4", confirmNetwork: true };
const treeRequest = { action: "get-classification-tree", ...common, offset: 0, limit: 1 };

void test("classification discovery and the mounted catalog use the same four strict schemas", () => {
  const descriptors = queryPublicSystemClassification({ includeSchemas: true }).entries;
  assert.equal(descriptors.length, 4);
  for (const descriptor of descriptors) {
    assert.equal(descriptor["implementationKind"], "vendor-http-task-equivalent");
    assert.equal(descriptor["publicSdkMethodExecuted"], false); assert.notEqual(descriptor["inputSchema"], undefined);
    assert.ok(Array.isArray(queryPublicSystemCatalog()["entries"]));
  }
  assert.deepEqual(parsePublicSystemCatalogRequest(treeRequest), publicSystemClassificationRequestSchema.parse(treeRequest));
  for (const changed of [{ ...treeRequest, confirmNetwork: false }, { ...treeRequest, libraryUuid: "private" },
    { ...treeRequest, libraryType: "29" }, { ...treeRequest, limit: 101 }, { ...treeRequest, offset: -1 },
    { ...treeRequest, expectedTreeSha256: "broken" }, { action: "get-classification-name-by-index", ...common,
      classificationIndex: { primaryClassificationUuid: primaryUuid, libraryUuid: "private" } },
    { action: "get-classification-name-by-index", ...common, classificationIndex: { primaryClassificationUuid: primaryUuid, libraryType: "2" } }]) {
    assert.throws(() => parsePublicSystemCatalogRequest(changed));
  }
});

void test("tree paging validates the complete response and binds subsequent pages to its whole-tree digest", () => {
  const first = validatePublicSystemClassificationResult(treeRequest, envelope());
  assert.deepEqual(first["rows"], [{ uuid: primaryUuid, name: "Package", parentUuid: null, order: 0 }]);
  assert.equal(first["totalRows"], 2); assert.equal(first["nextOffset"], 1);
  assert.equal(first["completeNestedSdkArrayReturned"], false); assert.equal(first["completeReceivedTreeValidated"], true);
  const next = { ...treeRequest, offset: 1, expectedTreeSha256: first["treeSha256"] };
  const second = validatePublicSystemCatalogResult(next, envelope());
  assert.deepEqual(second["rows"], [{ uuid: secondaryUuid, name: "0603", parentUuid: primaryUuid, order: 3 }]);
  assert.equal(second["nextOffset"], null); assert.equal(second["treeSha256"], first["treeSha256"]);
  assert.throws(() => validatePublicSystemClassificationResult(next, envelope([row, { ...child, name: "changed" }])));
  assert.throws(() => validatePublicSystemClassificationResult(treeRequest, envelope([row, child, { ...row, uuid: otherUuid, type: 2 }])));
});

void test("equal-order roots and children use UUID ties so shuffled responses preserve every digest-bound page", () => {
  const anotherChild = { ...child, uuid: "d".repeat(32), name: "0805" };
  const anotherRoot = { ...row, uuid: otherUuid, name: "Another package" };
  const rows = [row, child, anotherRoot, anotherChild];
  const shuffled = [anotherRoot, anotherChild, child, row];
  const first = validatePublicSystemClassificationResult({ ...treeRequest, limit: 2 }, envelope(rows));
  for (const offset of [0, 2]) {
    const page = { ...treeRequest, offset, limit: 2, expectedTreeSha256: first["treeSha256"] };
    const expected = validatePublicSystemClassificationResult(page, envelope(rows));
    const observed = validatePublicSystemClassificationResult(page, envelope(shuffled));
    assert.deepEqual(observed["rows"], expected["rows"]); assert.equal(observed["treeSha256"], expected["treeSha256"]);
    assert.equal(observed["nextOffset"], expected["nextOffset"]);
  }
  assert.deepEqual(first["rows"], [{ uuid: primaryUuid, name: "Package", parentUuid: null, order: 0 },
    { uuid: secondaryUuid, name: "0603", parentUuid: primaryUuid, order: 3 }]);
  for (const changed of [[row, child, { ...anotherRoot, order_no: -1 }, anotherChild],
    [row, child, anotherRoot, { ...anotherChild, order_no: 2 }]]) {
    const result = validatePublicSystemClassificationResult({ ...treeRequest, limit: 2 }, envelope(changed));
    assert.notEqual(result["treeSha256"], first["treeSha256"]); assert.notDeepEqual(result["rows"], first["rows"]);
  }
});

void test("the three exact projections preserve parent-child membership and explicitly report a missing child", () => {
  const index = validatePublicSystemClassificationResult({ action: "get-classification-index-by-name", ...common,
    primaryClassificationName: "Package", secondaryClassificationName: "0603" }, envelope());
  assert.equal(index["found"], true); assert.deepEqual(index["classificationIndex"], { libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    libraryType: "4", primaryClassificationUuid: primaryUuid, secondaryClassificationUuid: secondaryUuid });
  const indexRoundtrip = validatePublicSystemClassificationResult({ action: "get-classification-name-by-index", ...common,
    classificationIndex: index["classificationIndex"] }, envelope());
  assert.equal(indexRoundtrip["found"], true);
  for (const action of ["get-classification-name-by-uuid", "get-classification-name-by-index"]) {
    const selector = { primaryClassificationUuid: primaryUuid, secondaryClassificationUuid: secondaryUuid };
    const request = { action, ...common, ...(action.endsWith("-index") ? { classificationIndex: selector } : selector) };
    const result = validatePublicSystemClassificationResult(request, envelope());
    assert.equal(result["found"], true); assert.deepEqual(result["names"], { primaryClassificationName: "Package", secondaryClassificationName: "0603" });
    const missing = { ...selector, secondaryClassificationUuid: otherUuid };
    const absent = validatePublicSystemClassificationResult({ action, ...common,
      ...(action.endsWith("-index") ? { classificationIndex: missing } : missing) }, envelope());
    assert.equal(absent["found"], false); assert.equal(absent["names"], undefined);
  }
  const missingName = validatePublicSystemClassificationResult({ action: "get-classification-index-by-name", ...common,
    primaryClassificationName: "Package", secondaryClassificationName: "absent" }, envelope());
  assert.equal(missingName["found"], false); assert.equal(missingName["classificationIndex"], undefined);
});

void test("complete-tree validation refuses malformed rows, cross-owner/type records, duplicates, unknown fields and deep or orphan parents", () => {
  for (const rows of [[{ ...row, user_uuid: otherUuid }], [{ ...row, type: 2 }], [row, row], [{ ...row, extra: "unknown" }],
    [{ ...row, uuid: "@all" }], [{ ...row, order_no: Number.NaN }], [{ ...row, order_no: -0 }],
    [{ ...row, name: "\u0000private" }], [{ ...row, name: "\uD800" }], [row, { ...child, parent_uuid: otherUuid }],
    [row, child, { ...child, uuid: otherUuid, parent_uuid: secondaryUuid }],
    Array.from({ length: PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS + 1 }, () => row)]) {
    assert.throws(() => validatePublicSystemClassificationResult(treeRequest, envelope(rows)));
  }
  for (const raw of [undefined, false, {}, { success: false, code: 0, result: [] }, { success: true, code: 0, result: [], unknown: 1 }]) {
    assert.throws(() => validatePublicSystemClassificationResult(treeRequest, raw));
  }
  const empty = validatePublicSystemClassificationResult(treeRequest, envelope([]));
  assert.deepEqual(empty["rows"], []); assert.equal(empty["totalRows"], 0);
  const witnessedZero = validatePublicSystemClassificationResult(treeRequest, envelope([{ ...row, order_no: "0" }]));
  assert.deepEqual(witnessedZero["rows"], [{ uuid: primaryUuid, name: "Package", parentUuid: null, order: 0 }]);
  for (const order_no of ["00", "-0", "1", "", null, false]) {
    assert.throws(() => validatePublicSystemClassificationResult(treeRequest, envelope([{ ...row, order_no }])));
  }
});

void test("duplicate exact names refuse instead of selecting the SDK's first match", () => {
  const request = { action: "get-classification-index-by-name", ...common, primaryClassificationName: "Package" };
  assert.throws(() => validatePublicSystemClassificationResult(request, envelope([row, { ...row, uuid: otherUuid }])));
  assert.throws(() => validatePublicSystemClassificationResult({ ...request, secondaryClassificationName: "0603" },
    envelope([row, child, { ...child, uuid: otherUuid }])));
});
