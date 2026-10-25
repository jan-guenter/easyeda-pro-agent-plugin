import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePublicSystemCatalogRequest, queryPublicSystemCatalog, validatePublicSystemCatalogArguments,
  validatePublicSystemCatalogResult } from "../src/public-system-catalog.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";

const assetUuid = "a".repeat(32), footprintUuid = "c".repeat(32), symbolUuid = "b".repeat(32);
const searchRequest = { action: "search-footprints", query: "R0603", page: 1, pageSize: 2, confirmNetwork: true };
const symbolRequest = { action: "get-symbol", symbolUuid: assetUuid, confirmNetwork: true };
const deviceRequest = { action: "get-device", deviceUuid: assetUuid, confirmNetwork: true };
const metadata = (): Record<string, unknown> => ({ uuid: assetUuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
  display_title: "Generic part", description: "metadata\nonly", tags: { parent_tag: [], child_tag: { uuid: "d".repeat(32) } } });
const searchResult = (): Record<string, unknown> => ({ uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, page: "1", pageSize: "2", count: 100, totalPage: 1,
  lists: { lcsc: [{ ...metadata(), ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4 }], mine: [], user: [] } });
const symbolResult = (): Record<string, unknown> => ({ ...metadata(), path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 2, public: true });
const deviceResult = (): Record<string, unknown> => ({ ...metadata(), project_uuid: "", symbol_type: 2, footprint_type: 4,
  attributes: { Manufacturer: "Manufacturer", "Manufacturer Part": "R10K", Supplier: "LCSC", "Supplier Part": "C12345",
    "Supplier Footprint": "0603", Symbol: symbolUuid, Footprint: footprintUuid },
  symbol: { uuid: symbolUuid, display_title: "R" }, footprint: { uuid: footprintUuid, display_title: "R0603" }, product_code: "C12345" });
const envelope = (result: unknown): Record<string, unknown> => ({ success: true, code: 0, result });

void test("catalog expansion has six strict bounded requests and offline schemas, without destination selection", () => {
  for (const request of [searchRequest, symbolRequest, deviceRequest, { ...searchRequest, action: "search-symbols" }, { ...searchRequest, action: "search-devices" }]) {
    assert.deepEqual(parsePublicSystemCatalogRequest(request), request);
    assert.equal(validatePublicSystemCatalogArguments(request)["valid"], true);
    for (const change of [{ confirmNetwork: false }, { url: "https://private.invalid" }, { path: "private" }, { cookie: "private" },
      { headers: {} }, { retries: 1 }, { expectedFingerprint: {} }, { action: "invoke" }]) {
      assert.throws(() => parsePublicSystemCatalogRequest({ ...request, ...change }));
    }
  }
  for (const change of [{ query: "" }, { query: " " }, { query: " R0603" }, { query: "x\n" }, { query: "x\u0000y" },
    { query: "\uD800" }, { query: "x".repeat(129) }, { page: 0 }, { page: "1" }, { page: 1001 }, { page: 1.1 },
    { pageSize: 0 }, { pageSize: 21 }, { page: undefined }, { confirmNetwork: undefined }, { docType: 2 }, { tag: [] }]) {
    for (const action of ["search-footprints", "search-symbols", "search-devices"]) {
      assert.throws(() => parsePublicSystemCatalogRequest({ ...searchRequest, action, ...change }));
    }
  }
  for (const symbol of ["../project.eprj2", "A".repeat(32), "a".repeat(64)]) {
    assert.throws(() => parsePublicSystemCatalogRequest({ ...symbolRequest, symbolUuid: symbol }));
  }
  assert.equal(validatePublicSystemCatalogArguments({})["valid"], false);
  const catalog = queryPublicSystemCatalog({ includeSchemas: true });
  assert.equal(catalog["total"], 6); assert.equal(catalog["offline"], true); assert.equal(catalog["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(catalog), /inputSchema/u); assert.match(JSON.stringify(catalog), /read-only POST/u);
  assert.throws(() => queryPublicSystemCatalog({ method: "private" }));
});

void test("search projects system-owned candidates and preserves inconsistent vendor pagination without completeness claims", () => {
  const result = validatePublicSystemCatalogResult(searchRequest, envelope(searchResult()));
  assert.deepEqual(result["vendorReportedPagination"], { count: 100, page: "1", pageSize: "2", totalPage: 1 });
  assert.deepEqual(result["candidates"], [{ uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "4",
    name: "Generic part", description: "metadata\nonly", classification: { secondaryClassificationUuid: "d".repeat(32) },
    publicVisibilityFlagVerified: false, responseLibraryPathVerified: false }]);
  for (const field of ["paginationConsistencyVerified", "exactMatchVerified", "exhaustiveResultsVerified", "linkedAssetsFetched",
    "publicSdkMethodExecuted", "installedRuntimeAdmission", "backendFreshnessVerified", "completeAssetVerified", "persistenceVerified", "cadAuthority"]) {
    assert.equal(result[field], false);
  }
  assert.equal(result["systemOwnerVerified"], true); assert.equal(result["anonymousAvailabilityObserved"], true);
  const empty = searchResult(); empty["lists"] = { lcsc: [], mine: [], user: [] }; empty["count"] = 0; empty["totalPage"] = 0;
  assert.equal(validatePublicSystemCatalogResult(searchRequest, envelope(empty))["returnedCount"], 0);
});

void test("search refuses foreign/nonpublic/wrong-type/duplicate or unexpected grouped results without filtering", () => {
  for (const change of [{ uuid: "bad" }, { owner: { uuid: symbolUuid } }, { ownerUuid: symbolUuid }, { ownerUuid: undefined },
    { docType: 2 }, { docType: "4" }, { path: "private" }, { public: false }, { public: 1 }, { display_title: "\uD800" }]) {
    const result = { ...searchResult(), lists: { lcsc: [{ ...metadata(), ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4, ...change }], mine: [], user: [] } };
    assert.throws(() => validatePublicSystemCatalogResult(searchRequest, envelope(result)));
  }
  const item = { ...metadata(), ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4 };
  for (const lists of [{ lcsc: [item, item], mine: [], user: [] }, { lcsc: [], mine: [item], user: [] },
    { lcsc: [], mine: [], user: [item] }, { lcsc: [], mine: [], user: [], custom: [] }, { lcsc: [], user: [] }]) {
    assert.throws(() => validatePublicSystemCatalogResult(searchRequest, envelope({ ...searchResult(), lists })));
  }
  for (const change of [{ uid: "private" }, { uid: undefined }, { page: 2 }, { page: "01" }, { pageSize: "3" }, { count: -1 }, { totalPage: null }]) {
    assert.throws(() => validatePublicSystemCatalogResult(searchRequest, envelope({ ...searchResult(), ...change })));
  }
  assert.throws(() => validatePublicSystemCatalogResult({ ...searchRequest, pageSize: 1 }, envelope({ ...searchResult(), pageSize: 1,
    lists: { lcsc: [item, { ...item, uuid: symbolUuid }], mine: [], user: [] } })));
});

void test("symbol metadata excludes drawing sources and claims no subpart/pin validation", () => {
  const result = validatePublicSystemCatalogResult(symbolRequest, envelope({ ...symbolResult(), dataStr: "PRIVATE_GEOMETRY",
    key: "PRIVATE_KEY", dataStrId: "https://private.invalid", images: ["PRIVATE_IMAGE"] }));
  assert.deepEqual(result["symbol"], { uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2",
    name: "Generic part", description: "metadata\nonly", classification: { secondaryClassificationUuid: "d".repeat(32) } });
  assert.equal(result["publicVisibilityFlagVerified"], true); assert.equal(result["subpartsVerified"], false);
  assert.equal(result["pinDefinitionsVerified"], false); assert.doesNotMatch(JSON.stringify(result), /PRIVATE_/u);
  for (const change of [{ uuid: symbolUuid }, { path: undefined }, { path: "private" }, { owner: {} }, { public: false },
    { public: undefined }, { docType: 4 }, { ownerUuid: symbolUuid }, { description: null }, { description: "\u0000" }]) {
    assert.throws(() => validatePublicSystemCatalogResult(symbolRequest, envelope({ ...symbolResult(), ...change })));
  }
});

void test("device preserves absent visibility/path flags and validates its bounded associations without fetching them", () => {
  const raw = deviceResult(), selected = raw["attributes"];
  assert.ok(selected !== null && typeof selected === "object"); Object.assign(selected, { Datasheet: "PRIVATE_URL" });
  const result = validatePublicSystemCatalogResult(deviceRequest, envelope({ ...raw, images: ["PRIVATE_IMAGE"], dataStr: "PRIVATE_DRAWING" }));
  assert.equal(result["publicVisibilityFlagVerified"], false); assert.equal(result["responseLibraryPathVerified"], false);
  assert.equal(result["pinToPadMappingVerified"], false); assert.equal(result["linkedAssetsFetched"], false);
  assert.equal(result["associationsOwnershipVerified"], false);
  assert.deepEqual(result["device"], { uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "3",
    name: "Generic part", description: "metadata\nonly", classification: { secondaryClassificationUuid: "d".repeat(32) },
    manufacturer: "Manufacturer", manufacturerPart: "R10K", supplier: "LCSC", supplierPart: "C12345", supplierFootprint: "0603",
    associations: { symbolUuid, footprintUuid, symbolName: "R", footprintName: "R0603" } });
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_/u);
  const noNames = deviceResult(); delete noNames["symbol"]; delete noNames["footprint"];
  assert.equal(validatePublicSystemCatalogResult(deviceRequest, envelope(noNames))["ok"], true);
  for (const change of [{ uuid: footprintUuid }, { owner: { uuid: symbolUuid } }, { ownerUuid: symbolUuid }, { project_uuid: "private" },
    { project_uuid: undefined }, { path: "private" }, { public: false }, { symbol_type: 19 }, { footprint_type: 5 },
    { symbol: { uuid: footprintUuid } }, { footprint: { uuid: symbolUuid } }, { product_code: "different" }, { attributes: { Symbol: symbolUuid } },
    { symbol: { uuid: symbolUuid, path: "private" } }, { footprint: { uuid: footprintUuid, owner: { uuid: symbolUuid } } },
    { symbol: { uuid: symbolUuid, docType: 4 } }, { footprint: { uuid: footprintUuid, public: false } },
    { attributes: { Symbol: symbolUuid, Footprint: footprintUuid, Manufacturer: "x".repeat(513) } }]) {
    assert.throws(() => validatePublicSystemCatalogResult(deviceRequest, envelope({ ...deviceResult(), ...change })));
  }
});

void test("all catalog actions refuse unsuccessful/malformed envelopes and bound the projected result independently", () => {
  for (const request of [searchRequest, symbolRequest, deviceRequest, { ...searchRequest, action: "search-symbols" }, { ...searchRequest, action: "search-devices" }]) {
    for (const raw of [null, {}, { success: false, code: 404, message: "PRIVATE_VENDOR_ERROR" },
      { success: true, code: 1, result: symbolResult() }, envelope(null)]) {
      assert.throws(() => validatePublicSystemCatalogResult(request, raw));
    }
  }
  assert.throws(() => validatePublicSystemCatalogResult(symbolRequest, envelope({ ...symbolResult(), description: "😀".repeat(32_768) })),
    { message: "PUBLIC_SYSTEM_CATALOG_RESULT_SIZE" });
});
