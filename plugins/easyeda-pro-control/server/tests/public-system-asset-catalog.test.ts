import assert from "node:assert/strict";
import { test } from "node:test";
import { publicSystemAssetCatalogRequestSchema, queryPublicSystemAssetCatalog,
  validatePublicSystemAssetCatalogResult } from "../src/public-system-asset-catalog.ts";
import { parsePublicSystemCatalogRequest, queryPublicSystemCatalog, validatePublicSystemCatalogResult } from "../src/public-system-catalog.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";

const assetUuid = "a".repeat(32), otherUuid = "b".repeat(32);
const metadata = { uuid: assetUuid, docType: 16, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
  ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, display_title: "SOT-23", description: "Public metadata",
  tags: { parent_tag: { uuid: otherUuid }, child_tag: [] } };
const searchRequest = { action: "search-3d-models", query: "SOT", page: 1, pageSize: 5, confirmNetwork: true };
const panelRequest = { action: "get-panel-library", panelLibraryUuid: assetUuid, confirmNetwork: true };
function searchResponse(items: unknown[] = [metadata], patch: Record<string, unknown> = {}): unknown {
  return { success: true, code: 0, result: { uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, page: "1", pageSize: "5", count: 600,
    totalPage: 6, wd: "sot", lists: { lcsc: items, mine: [], user: [] }, ...patch } };
}
function panelResponse(patch: Record<string, unknown> = {}): unknown {
  return { success: true, code: 0, result: { ...metadata, docType: 29, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, public: true, ...patch } };
}

void test("the three asset subsets share mounted strict schemas and expose truthful sample limits", () => {
  const entries = queryPublicSystemAssetCatalog({ includeSchemas: true }).entries;
  assert.equal(entries.length, 3);
  assert.equal(entries[0]?.["historicalAnonymousPositiveSampled"], true);
  assert.equal(entries[1]?.["historicalAnonymousEmptySampled"], true);
  assert.equal(entries[2]?.["historicalAnonymousPositiveSampled"], false);
  const catalog = queryPublicSystemCatalog({ includeSchemas: true });
  assert.ok(Array.isArray(catalog["entries"]));
  for (const entry of entries) {
    assert.equal(entry["invocationEnabledByDiscovery"], false); assert.equal(entry["publicSdkMethodExecuted"], false);
    assert.notEqual(entry["inputSchema"], undefined);
    assert.ok(catalog["entries"].some((value: Record<string, unknown>) => value["action"] === entry["action"]));
  }
  assert.deepEqual(parsePublicSystemCatalogRequest(searchRequest), publicSystemAssetCatalogRequestSchema.parse(searchRequest));
  for (const changed of [{ ...searchRequest, confirmNetwork: false }, { ...searchRequest, libraryUuid: "private" },
    { ...searchRequest, url: "https://private.invalid" }, { ...searchRequest, classification: [] }, { ...searchRequest, query: "" },
    { ...searchRequest, query: " SOT" }, { ...searchRequest, query: "x\u200By" }, { ...searchRequest, query: "x\u0000y" },
    { ...searchRequest, query: "\uD800" }, { ...searchRequest, page: 0 }, { ...searchRequest, pageSize: 21 },
    { ...panelRequest, panelLibraryUuid: "../private" }, { ...panelRequest, panelLibraryUuid: `${assetUuid}\n` },
    { ...panelRequest, branchUuid: otherUuid }]) {
    assert.throws(() => parsePublicSystemCatalogRequest(changed));
  }
});

void test("3D search projects only metadata, preserves absent witnesses and bounds the witnessed ASCII keyword echo", () => {
  const result = validatePublicSystemCatalogResult(searchRequest, searchResponse([{ ...metadata,
    dataStr: "UNPROJECTED_GEOMETRY", dataStrId: "https://private.invalid/asset", creator: { username: "UNPROJECTED_USER" } }]));
  assert.equal(result["returnedCount"], 1); assert.equal(result["vendorReportedQuery"], "sot");
  assert.equal(result["publicSdkMethodExecuted"], false); assert.equal(result["completeAssetVerified"], false);
  assert.deepEqual(result["candidates"], [{ uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "5",
    name: "SOT-23", description: "Public metadata", classification: { primaryClassificationUuid: otherUuid },
    publicVisibilityFlagVerified: false, responseLibraryPathVerified: false }]);
  assert.doesNotMatch(JSON.stringify(result), /UNPROJECTED|private\.invalid/u);
  assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([metadata], { wd: "other" })));
  assert.throws(() => validatePublicSystemAssetCatalogResult({ ...searchRequest, query: "Ä" }, searchResponse([metadata], { wd: "ä" })));
  assert.equal(validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([metadata], { wd: "SOT" }))["returnedCount"], 1);
});

void test("every candidate and contradictory owner, project, visibility or type witness is checked before projection", () => {
  for (const patch of [{ owner: { uuid: otherUuid } }, { ownerUuid: otherUuid }, { owner_uuid: otherUuid },
    { path: otherUuid }, { project_uuid: otherUuid }, { public: false }, { docType: 4 }, { docType: 29 },
    { uuid: `${otherUuid}\n` }, { tags: { parent_tag: { uuid: `${otherUuid}\n` }, child_tag: [] } },
    { tags: { parent_tag: [], child_tag: [{ uuid: otherUuid }] } }, { display_title: "\uD800" }]) {
    assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([metadata, { ...metadata, uuid: otherUuid, ...patch }])));
  }
  for (const lists of [{ lcsc: [metadata], mine: [metadata], user: [] }, { lcsc: [metadata], mine: [], user: [metadata] },
    { lcsc: [metadata], mine: [], user: [], private: [] }]) {
    assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([], { lists })));
  }
});

void test("search preserves raw vendor pagination while refusing wrong pages, duplicate rows, excess results and oversized projections", () => {
  for (const patch of [{ uid: otherUuid }, { page: 2 }, { pageSize: 1 }, { count: -1 }, { totalPage: Number.NaN }]) {
    assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([metadata], patch)));
  }
  assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse([metadata, metadata])));
  assert.throws(() => validatePublicSystemAssetCatalogResult({ ...searchRequest, pageSize: 1 },
    searchResponse([metadata, { ...metadata, uuid: otherUuid }], { pageSize: 1 })));
  assert.throws(() => validatePublicSystemAssetCatalogResult({ ...searchRequest, pageSize: 20 },
    searchResponse(Array.from({ length: 21 }, () => metadata), { pageSize: 20 })));
  const large: typeof metadata[] = [];
  for (const letter of ["a", "b", "c"]) { large.push({ ...metadata, uuid: letter.repeat(32), description: "x".repeat(65_536) }); }
  assert.throws(() => validatePublicSystemAssetCatalogResult(searchRequest, searchResponse(large)), { message: "PUBLIC_SYSTEM_ASSET_RESULT_SIZE" });
  const result = validatePublicSystemAssetCatalogResult(searchRequest, searchResponse());
  assert.deepEqual(result["vendorReportedPagination"], { count: 600, totalPage: 6, page: "1", pageSize: "5" });
  assert.equal(result["paginationConsistencyVerified"], false);
});

void test("panel search and exact public panel lookup retain library type29 without geometry, child or absence claims", () => {
  const search = validatePublicSystemAssetCatalogResult({ ...searchRequest, action: "search-panel-libraries" },
    searchResponse([{ ...metadata, docType: 29 }]));
  assert.deepEqual(search["candidates"], [{ uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "29",
    name: "SOT-23", description: "Public metadata", classification: { primaryClassificationUuid: otherUuid },
    publicVisibilityFlagVerified: false, responseLibraryPathVerified: false }]);
  const empty = validatePublicSystemAssetCatalogResult({ ...searchRequest, action: "search-panel-libraries" }, searchResponse([], { count: 0, totalPage: 0 }));
  assert.equal(empty["returnedCount"], 0); assert.equal(empty["exhaustiveResultsVerified"], false);
  const result = validatePublicSystemCatalogResult(panelRequest, panelResponse({ dataStr: "UNPROJECTED_PANEL_GEOMETRY", children: [{ secret: "PRIVATE" }] }));
  assert.equal(result["kind"], "public-system-panel-library-metadata"); assert.equal(result["linkedAssetsFetched"], false);
  assert.doesNotMatch(JSON.stringify(result), /UNPROJECTED|PRIVATE/u);
  for (const patch of [{ uuid: otherUuid }, { uuid: `${assetUuid}\n` }, { path: otherUuid }, { path: undefined }, { public: false }, { public: undefined },
    { docType: 16 }, { owner: { uuid: otherUuid } }, { project_uuid: otherUuid }]) {
    assert.throws(() => validatePublicSystemAssetCatalogResult(panelRequest, panelResponse(patch)));
  }
  for (const raw of [undefined, {}, { success: false, code: 404, result: null }, { success: true, code: 0, result: null }]) {
    assert.throws(() => validatePublicSystemAssetCatalogResult(panelRequest, raw));
  }
});
