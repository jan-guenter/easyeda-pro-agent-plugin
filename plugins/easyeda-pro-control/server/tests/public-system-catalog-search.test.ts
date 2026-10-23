import assert from "node:assert/strict";
import { test } from "node:test";
import { queryPublicSystemCatalog, validatePublicSystemCatalogResult } from "../src/public-system-catalog.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";

const deviceUuid = "a".repeat(32), footprintUuid = "c".repeat(32), symbolUuid = "b".repeat(32);
const request = (action: string): Record<string, unknown> => ({ action, query: "resistor", page: 1, pageSize: 2, confirmNetwork: true });
const metadata = { uuid: deviceUuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "Part", tags: { parent_tag: [], child_tag: [] } };
const symbol = (): Record<string, unknown> => ({ ...metadata, uuid: symbolUuid, ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 2 });
const device = (): Record<string, unknown> => ({ ...metadata, project_uuid: "", symbol_type: 2, footprint_type: 4,
  attributes: { Symbol: symbolUuid, Footprint: footprintUuid, Manufacturer: "M", "Supplier Part": "C123" }, product_code: "C123",
  symbol: { uuid: symbolUuid }, footprint: { uuid: footprintUuid },
  symbol_info: { uuid: symbolUuid, docType: 2, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, public: true, dataStr: "INLINE_SYMBOL_SOURCE" },
  footprint_info: { uuid: footprintUuid, docType: 4, ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, dataStr: "INLINE_FOOTPRINT_SOURCE" } });
const raw = (items: unknown[], changes: Record<string, unknown> = {}): Record<string, unknown> => ({ success: true, code: 0,
  result: { uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, page: "1", pageSize: "2", count: 5200, totalPage: 52,
    wd: "resistor", lists: { lcsc: items, mine: [], user: [] }, ...changes } });

void test("ordinary symbol search projects only metadata, retains ranking order and does not invent optional flags", () => {
  const result = validatePublicSystemCatalogResult(request("search-symbols"), raw([symbol(), { ...symbol(), uuid: footprintUuid,
    public: true, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, dataStr: "INLINE_SOURCE", images: ["IMAGE"], stock: 12, price: 2 }]));
  assert.equal(result["kind"], "system-owned-symbol-candidates"); assert.equal(result["returnedCount"], 2);
  assert.deepEqual(result["candidates"], [
    { uuid: symbolUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2", name: "Part", classification: {},
      publicVisibilityFlagVerified: false, responseLibraryPathVerified: false },
    { uuid: footprintUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2", name: "Part", classification: {},
      publicVisibilityFlagVerified: true, responseLibraryPathVerified: true },
  ]);
  assert.doesNotMatch(JSON.stringify(result), /INLINE_SOURCE|IMAGE|"stock"|"price"/u);
  assert.equal(result["exactMatchVerified"], false); assert.equal(result["exhaustiveResultsVerified"], false);
  assert.equal(result["paginationConsistencyVerified"], false); assert.equal(result["linkedAssetsFetched"], false);
});

void test("symbol search refuses special types, missing or contradictory owners, and malformed text", () => {
  for (const change of [{ docType: 4 }, { docType: 19 }, { docType: "2" }, { owner: undefined }, { ownerUuid: undefined },
    { owner: { uuid: deviceUuid } }, { ownerUuid: deviceUuid }, { public: false }, { path: "private" },
    { display_title: "x".repeat(513) }, { display_title: "\uD800" }, { description: "\u0000" }]) {
    assert.throws(() => validatePublicSystemCatalogResult(request("search-symbols"), raw([{ ...symbol(), ...change }])));
  }
});

void test("device search validates direct and inline associations, omits inline source, and keeps absent optional identity absent", () => {
  const result = validatePublicSystemCatalogResult(request("search-devices"), raw([device()]));
  assert.equal(result["kind"], "system-owned-device-candidates");
  assert.deepEqual(result["candidates"], [{ uuid: deviceUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "3", name: "Part",
    classification: {}, manufacturer: "M", supplierPart: "C123", associations: { symbolUuid, footprintUuid },
    publicVisibilityFlagVerified: false, responseLibraryPathVerified: false, pinToPadMappingVerified: false,
    associationsOwnershipVerified: false, linkedAssetsFetched: false }]);
  assert.doesNotMatch(JSON.stringify(result), /INLINE_SYMBOL_SOURCE|INLINE_FOOTPRINT_SOURCE|"dataStr"/u);
  const minimal = device(); delete minimal["symbol"]; delete minimal["footprint"]; delete minimal["symbol_info"]; delete minimal["footprint_info"];
  assert.equal(validatePublicSystemCatalogResult(request("search-devices"), raw([minimal]))["ok"], true);
  const verifiedFlags = validatePublicSystemCatalogResult(request("search-devices"), raw([{ ...device(), ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, public: true }]));
  assert.match(JSON.stringify(verifiedFlags["candidates"]), /"publicVisibilityFlagVerified":true/u);
});

void test("device search refuses incomplete, private, special-type or contradictory device bindings", () => {
  for (const change of [{ project_uuid: "private" }, { project_uuid: undefined }, { symbol_type: 19 }, { footprint_type: 5 },
    { owner: { uuid: symbolUuid } }, { owner: undefined }, { ownerUuid: symbolUuid }, { public: false }, { path: "private" },
    { attributes: { Symbol: symbolUuid } }, { attributes: { Symbol: "", Footprint: footprintUuid } }, { product_code: "C456" },
    { symbol: { uuid: footprintUuid } }, { footprint: { uuid: symbolUuid } }, { symbol_info: { uuid: footprintUuid } },
    { footprint_info: { uuid: symbolUuid } }, { symbol_info: { uuid: symbolUuid, owner: { uuid: deviceUuid } } },
    { symbol_info: { uuid: symbolUuid, docType: 19 } }, { footprint_info: { uuid: footprintUuid, docType: 2 } },
    { footprint_info: { uuid: footprintUuid, public: false } }, { symbol_info: { uuid: symbolUuid, path: "private" } },
    { footprint_info: { uuid: footprintUuid, ownerUuid: deviceUuid } }, { symbol_info: null }]) {
    assert.throws(() => validatePublicSystemCatalogResult(request("search-devices"), raw([{ ...device(), ...change }])));
    assert.throws(() => validatePublicSystemCatalogResult({ action: "get-device", deviceUuid, confirmNetwork: true },
      { success: true, code: 0, result: { ...device(), ...change } }));
  }
});

void test("both new searches reject wrong pages, duplicate results and extra groups without filtering", () => {
  for (const action of ["search-symbols", "search-devices"]) {
    const item = action === "search-symbols" ? symbol() : device();
    for (const changes of [{ uid: deviceUuid }, { page: "01" }, { page: 2 }, { pageSize: 1 }, { wd: "different" },
      { count: -1 }, { totalPage: Number.POSITIVE_INFINITY }, { lists: { lcsc: [item, item], mine: [], user: [] } },
      { lists: { lcsc: [], mine: [item], user: [] } }, { lists: { lcsc: [], mine: [], user: [item] } },
      { lists: { lcsc: [], mine: [], user: [], other: [] } }, { lists: { lcsc: [], mine: [] } },
      { lists: { lcsc: [item, { ...item, uuid: "d".repeat(32) }, { ...item, uuid: "e".repeat(32) }], mine: [], user: [] } }]) {
      assert.throws(() => validatePublicSystemCatalogResult(request(action), raw([item], changes)));
    }
    const empty = validatePublicSystemCatalogResult(request(action), raw([], { count: 0, totalPage: 0 }));
    assert.equal(empty["returnedCount"], 0); assert.equal(empty["exhaustiveResultsVerified"], false);
  }
});

void test("component searches refuse supplied project scope and preserve absent project identity", () => {
  for (const action of ["search-symbols", "search-footprints"]) {
    const item = { ...symbol(), docType: action === "search-symbols" ? 2 : 4 };
    const expected = validatePublicSystemCatalogResult(request(action), raw([item]));
    assert.deepEqual(validatePublicSystemCatalogResult(request(action), raw([{ ...item, project_uuid: "" }])), expected);
    assert.doesNotMatch(JSON.stringify(expected), /"project_uuid"/u);
    for (const projectUuid of [deviceUuid, PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, null, 0, {}]) {
      assert.throws(() => validatePublicSystemCatalogResult(request(action), raw([{ ...item, project_uuid: projectUuid }])));
    }
  }
});

void test("symbol detail refuses supplied project scope without requiring a missing project field", () => {
  const input = { action: "get-symbol", symbolUuid, confirmNetwork: true };
  const item = { ...symbol(), public: true, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY };
  const expected = validatePublicSystemCatalogResult(input, { success: true, code: 0, result: item });
  assert.deepEqual(validatePublicSystemCatalogResult(input, { success: true, code: 0, result: { ...item, project_uuid: "" } }), expected);
  assert.doesNotMatch(JSON.stringify(expected), /"project_uuid"/u);
  for (const projectUuid of [deviceUuid, PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, null, 0, {}]) {
    assert.throws(() => validatePublicSystemCatalogResult(input, { success: true, code: 0, result: { ...item, project_uuid: projectUuid } }));
  }
});

void test("device detail and search reject project-scoped direct or inline associations", () => {
  for (const key of ["symbol", "symbol_info", "footprint", "footprint_info"]) {
    const associationUuid = key.startsWith("symbol") ? symbolUuid : footprintUuid;
    const item = { ...device(), [key]: { uuid: associationUuid } };
    const getRequest = { action: "get-device", deviceUuid, confirmNetwork: true };
    const expectedGet = validatePublicSystemCatalogResult(getRequest, { success: true, code: 0, result: item });
    const expectedSearch = validatePublicSystemCatalogResult(request("search-devices"), raw([item]));
    const explicitlyEmpty = { ...item, [key]: { uuid: associationUuid, project_uuid: "" } };
    assert.deepEqual(validatePublicSystemCatalogResult(getRequest, { success: true, code: 0, result: explicitlyEmpty }), expectedGet);
    assert.deepEqual(validatePublicSystemCatalogResult(request("search-devices"), raw([explicitlyEmpty])), expectedSearch);
    for (const projectUuid of [deviceUuid, PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, null, 0, {}]) {
      const invalid = { ...item, [key]: { uuid: associationUuid, project_uuid: projectUuid } };
      assert.throws(() => validatePublicSystemCatalogResult(getRequest, { success: true, code: 0, result: invalid }));
      assert.throws(() => validatePublicSystemCatalogResult(request("search-devices"), raw([invalid])));
    }
  }
});

void test("new search projections independently enforce the output byte bound and disclose source/transport limits", () => {
  for (const action of ["search-symbols", "search-devices"]) {
    const item = action === "search-symbols" ? symbol() : device();
    assert.throws(() => validatePublicSystemCatalogResult(request(action), raw([{ ...item, description: "😀".repeat(32_768) }])),
      { message: "PUBLIC_SYSTEM_CATALOG_RESULT_SIZE" });
  }
  const catalog = JSON.stringify(queryPublicSystemCatalog({ includeSchemas: true }));
  assert.match(catalog, /Inline vendor dataStr may be received/u);
  assert.match(catalog, /never projected, parsed as CAD or executed/u);
  assert.match(catalog, /desktop helper defaults to JSON/u);
  assert.doesNotMatch(catalog, /No source.*fetched or returned/u);
});
