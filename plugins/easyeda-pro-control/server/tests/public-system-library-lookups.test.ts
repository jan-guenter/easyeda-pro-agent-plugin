import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePublicSystemCatalogRequest, validatePublicSystemCatalogResult } from "../src/public-system-catalog.ts";
import { parsePublicSystemLookupCandidates } from "../src/public-system-library-lookups.ts";
import { asset, deviceCandidate, deviceMetadata, envelope, footprintCandidate, footprintMetadata, footprintNameRequest,
  lcscRequest, symbol } from "./public-system-library-lookups-fixture.ts";

void test("footprint-name and LCSC schemas require bounded explicit disclosures without owner or transport overrides", () => {
  for (const request of [footprintNameRequest, lcscRequest]) {
    assert.deepEqual(parsePublicSystemCatalogRequest(request), request);
    for (const change of [{ confirmNetwork: false }, { confirmNetwork: undefined }, { path: "private" }, { libraryUuid: asset },
      { url: "https://private.invalid" }, { token: "secret" }, { page: 1 }, { allowMultiMatch: false }, { metadata: [] }]) {
      assert.throws(() => parsePublicSystemCatalogRequest({ ...request, ...change }));
    }
  }
  for (const name of ["", " ", " R", "R\n", "R\u0000", "\uD800", "R".repeat(129)]) {
    assert.throws(() => parsePublicSystemCatalogRequest({ ...footprintNameRequest, name }));
  }
  for (const lcscIds of [[], ["C1523", "C1523"], ["c1523"], ["C01523"], ["C0"], ["C1\n"], ["C12345678901"],
    ["../private"], [1], ["C1", "C2", "C3", "C4", "C5", "C6"]]) {
    assert.throws(() => parsePublicSystemCatalogRequest({ ...lcscRequest, lcscIds }));
  }
});

void test("complete lookup candidates need separate metadata witnesses and retain all matches", () => {
  for (const [request, rows, metadata] of [[footprintNameRequest, { [footprintNameRequest.name]: [footprintCandidate(), footprintCandidate(symbol)] },
    [envelope(footprintMetadata()), envelope(footprintMetadata(symbol))]],
  [lcscRequest, [deviceCandidate(), deviceCandidate(symbol)], [envelope(deviceMetadata()), envelope(deviceMetadata(symbol))]]] as const) {
    const lookup = envelope(rows);
    const candidates = parsePublicSystemLookupCandidates(request, lookup);
    assert.equal(candidates.length, 2);
    assert.throws(() => validatePublicSystemCatalogResult(request, lookup));
    assert.throws(() => validatePublicSystemCatalogResult(request, { lookup, metadata: [] }));
    const result = validatePublicSystemCatalogResult(request, { lookup, metadata });
    assert.equal(result["returnedCount"], 2); assert.equal(result["requestCount"], 3);
    assert.equal(result["candidateMetadataVerified"], true);
    for (const key of ["publicSdkMethodExecuted", "installedRuntimeAdmission", "atomicSnapshotVerified", "exactMatchVerified",
      "exhaustiveResultsVerified", "linkedAssetsFetched", "pinToPadMappingVerified", "persistenceVerified", "cadAuthority"]) { assert.equal(result[key], false); }
  }
  const result = validatePublicSystemCatalogResult(lcscRequest, { lookup: envelope([deviceCandidate()]), metadata: [envelope(deviceMetadata())] });
  assert.match(JSON.stringify(result), /"publicVisibilityFlagVerified":false/u);
  assert.doesNotMatch(JSON.stringify(result), /"public":true/u);
});

void test("initial candidate lists refuse contradictions and overflow before any enrichment", () => {
  for (const change of [{ uuid: "../private" }, { owner: { uuid: symbol } }, { owner_uuid: symbol }, { ownerUuid: symbol },
    { path: symbol }, { public: false }, { project_uuid: asset }, { docType: 2 }]) {
    assert.throws(() => parsePublicSystemLookupCandidates(footprintNameRequest,
      envelope({ [footprintNameRequest.name]: [{ ...footprintCandidate(), ...change }] })));
  }
  for (const rows of [{ Other: [] }, { [footprintNameRequest.name]: [], Other: [] }, [], null,
    { [footprintNameRequest.name]: [footprintCandidate(), footprintCandidate()] },
    { [footprintNameRequest.name]: Array.from({ length: 6 }, (_, i) => footprintCandidate(String(i).repeat(32))) }]) {
    assert.throws(() => parsePublicSystemLookupCandidates(footprintNameRequest, envelope(rows)));
  }
  for (const change of [{ product_code: "C99" }, { owner: { uuid: symbol } }, { owner_uuid: symbol }, { path: symbol }, { public: false },
    { project_uuid: asset }, { symbol_type: 19 }, { footprint_type: 5 }, { symbol: { uuid: asset } }, { footprint_info: { uuid: asset } },
    { symbol_info: { uuid: symbol, owner_uuid: asset } }, { attributes: { "Supplier Part": "C99", Symbol: symbol, Footprint: asset } }]) {
    assert.throws(() => parsePublicSystemLookupCandidates(lcscRequest, envelope([{ ...deviceCandidate(), ...change }])));
  }
  assert.throws(() => parsePublicSystemLookupCandidates(lcscRequest, envelope([deviceCandidate(), deviceCandidate()])));
  assert.throws(() => parsePublicSystemLookupCandidates(lcscRequest, envelope(Array.from({ length: 6 }, (_, i) => deviceCandidate(String(i).repeat(32))))));
});

void test("metadata requires type, owner and exact lookup correlation without filtering a later bad row", () => {
  const lookup = envelope({ [footprintNameRequest.name]: [footprintCandidate()] });
  for (const change of [{ docType: undefined }, { docType: 2 }, { public: undefined }, { owner: undefined }, { owner_uuid: symbol },
    { ownerUuid: symbol }, { uuid: symbol }, { display_title: "Other" }, { description: "Changed" }, { path: undefined }]) {
    assert.throws(() => validatePublicSystemCatalogResult(footprintNameRequest, { lookup, metadata: [envelope({ ...footprintMetadata(), ...change })] }));
  }
  for (const change of [{ owner: undefined }, { owner: { uuid: symbol } }, { owner_uuid: symbol }, { uuid: symbol },
    { symbol_type: undefined }, { footprint_type: 5 }, { project_uuid: undefined }, { product_code: "C99" },
    { attributes: { "Supplier Part": "C99", Symbol: symbol, Footprint: asset } }, { symbol: { uuid: symbol, owner_uuid: asset } }]) {
    assert.throws(() => validatePublicSystemCatalogResult(lcscRequest, { lookup: envelope([deviceCandidate()]),
      metadata: [envelope({ ...deviceMetadata(), ...change })] }));
  }
  assert.throws(() => validatePublicSystemCatalogResult(lcscRequest, { lookup: envelope([deviceCandidate(), deviceCandidate(symbol)]),
    metadata: [envelope(deviceMetadata()), envelope({ ...deviceMetadata(symbol), footprint_type: 5 })] }));
  const empty = validatePublicSystemCatalogResult(footprintNameRequest, { lookup: envelope({}), metadata: [] });
  assert.equal(empty["returnedCount"], 0); assert.equal(empty["requestCount"], 1); assert.equal(empty["exhaustiveResultsVerified"], false);
});
