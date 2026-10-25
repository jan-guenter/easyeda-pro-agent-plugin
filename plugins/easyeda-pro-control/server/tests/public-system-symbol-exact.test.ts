import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";
import { parsePublicSystemSymbolExactRequest, queryPublicSystemSymbolExact, validatePublicSystemSymbolExactArguments,
  validatePublicSystemSymbolExactResult } from "../src/public-system-symbol-exact.ts";

const request = { action: "search-symbols-by-name", name: "R0603", confirmNetwork: true };
const assetUuid = "a".repeat(32);
const nativeHeader = '["DOCTYPE","SYMBOL","1.0"]\r\n["HEAD",{"symbolType":2,"originX":0,"originY":0}]\r\n';
const item = (): Record<string, unknown> => ({ uuid: assetUuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
  docType: 2, display_title: "R0603", description: "ordinary symbol\nmetadata" });
const response = (items: unknown[] = [item()]): Record<string, unknown> => ({ success: true, code: 0, result: { R0603: items } });

void test("symbol title lookup requires one bounded literal name and network confirmation", () => {
  assert.deepEqual(parsePublicSystemSymbolExactRequest(request), request);
  for (const change of [{ action: "search-symbols" }, { confirmNetwork: false }, { confirmNetwork: undefined }, { name: "" }, { name: " " },
    { name: " R0603" }, { name: "R0603 " }, { name: "R\n0603" }, { name: "R\u00000603" }, { name: "\uD800" }, { name: "a".repeat(129) },
    { page: 1 }, { pageSize: 20 }, { libraryUuid: assetUuid }, { docType: 4 }, { url: "https://private.invalid" },
    { headers: {} }, { credentials: "include" }, { cookie: "private" }, { name: ["R0603"] }]) {
    assert.throws(() => parsePublicSystemSymbolExactRequest({ ...request, ...change }));
  }
  assert.equal(validatePublicSystemSymbolExactArguments(request)["valid"], true);
  assert.equal(validatePublicSystemSymbolExactArguments({})["valid"], false);
  const catalog = queryPublicSystemSymbolExact({ includeSchemas: true });
  assert.equal(catalog.offline, true); assert.equal(catalog.invocationEnabledByDiscovery, false);
  assert.match(JSON.stringify(catalog), /inputSchema/u); assert.match(JSON.stringify(catalog), /desktopPathCheckUtf16Offset/u);
  assert.throws(() => queryPublicSystemSymbolExact({ url: "https://private.invalid" }));
});

void test("symbol title lookup preserves bounded candidates and display-name differences without completeness claims", () => {
  const raw = { ...item(), display_title: "r0603", public: true, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    dataStr: `${nativeHeader}UNPROJECTED_SOURCE`, images: ["UNPROJECTED_IMAGE"], owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, username: "UNPROJECTED_ACCOUNT" } };
  const result = validatePublicSystemSymbolExactResult(request, response([raw]));
  assert.deepEqual(result["candidates"], [{ uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2",
    name: "r0603", description: "ordinary symbol\nmetadata", displayNameEqualsRequestedName: false,
    publicVisibilityFlagVerified: true, responseLibraryPathVerified: true, docTypeProvided: true, typeVerifiedFrom: "docType-and-native-header" }]);
  assert.equal(result["returnedCount"], 1); assert.equal(result["systemOwnerVerified"], true);
  for (const flag of ["publicSdkMethodExecuted", "installedRuntimeAdmission", "exactMatchVerified", "exhaustiveResultsVerified",
    "backendFreshnessVerified", "completeAssetVerified", "linkedAssetsFetched", "subpartsVerified", "pinDefinitionsVerified", "persistenceVerified", "cadAuthority"]) {
    assert.equal(result[flag], false);
  }
  assert.doesNotMatch(JSON.stringify(result), /UNPROJECTED_/u);
  assert.equal(validatePublicSystemSymbolExactResult(request, response())["returnedCount"], 1);
  for (const empty of [{}, { R0603: [] }]) {
    assert.equal(validatePublicSystemSymbolExactResult(request, { success: true, code: 0, result: empty })["returnedCount"], 0);
  }
});

void test("symbol type requires explicit metadata or an exact bounded ordinary-symbol header, with conflicting representations refused", () => {
  const row = item(); delete row["docType"]; row["dataStr"] = `${nativeHeader}UNINTERPRETED_DRAWING_BODY`;
  const result = validatePublicSystemSymbolExactResult(request, response([row]));
  assert.deepEqual(result["candidates"], [{ uuid: assetUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2",
    name: "R0603", description: "ordinary symbol\nmetadata", displayNameEqualsRequestedName: true,
    publicVisibilityFlagVerified: false, responseLibraryPathVerified: false, docTypeProvided: false, typeVerifiedFrom: "native-header" }]);
  assert.doesNotMatch(JSON.stringify(result), /UNINTERPRETED_DRAWING_BODY|originX/u);
  assert.throws(() => validatePublicSystemSymbolExactResult(request, response([{ ...row, dataStr: undefined }])));
  assert.throws(() => validatePublicSystemSymbolExactResult(request, response([{ ...row, docType: 4 }])));
  for (const dataStr of ["", '["DOCTYPE","SYMBOL","1.0"]', nativeHeader.replace("SYMBOL", "FOOTPRINT"), nativeHeader.replace('"1.0"', '"2.0"'),
    nativeHeader.replace('"symbolType":2', '"symbolType":18'), nativeHeader.replace('"symbolType":2', '"symbolType":"2"'),
    nativeHeader.replace('"symbolType":2', '"symbolType":18,"symbolType":2'),
    nativeHeader.replace('["HEAD",{', '["HEAD",false,{'), nativeHeader.replace('["HEAD",{', '["HEAD",\n{'),
    nativeHeader.replace('"originX":0', `"description":"${"x".repeat(8192)}"`),
    nativeHeader.replace('"symbolType":2', '"symbolType":2,"description":'), nativeHeader.replace('["DOCTYPE"', ' ["DOCTYPE"')]) {
    for (const docType of [2, undefined]) { assert.throws(() => validatePublicSystemSymbolExactResult(request, response([{ ...row, docType, dataStr }]))); }
  }
});

void test("symbol title lookup refuses malformed or contradictory ownership, scope and duplicate records", () => {
  for (const change of [{ uuid: "bad" }, { owner: { uuid: "b".repeat(32) } }, { owner: {} }, { ownerUuid: "b".repeat(32) },
    { path: "private" }, { project_uuid: assetUuid }, { public: false }, { public: "true" }, { docType: 4 }, { docType: "2" },
    { description: null }, { description: "x".repeat(8193) }, { display_title: "\uD800" }, { display_title: "a".repeat(513) }]) {
    assert.throws(() => validatePublicSystemSymbolExactResult(request, response([{ ...item(), ...change }])));
  }
  assert.throws(() => validatePublicSystemSymbolExactResult(request, response([item(), item()])), /DUPLICATE_IDENTITY/u);
  assert.throws(() => validatePublicSystemSymbolExactResult(request, response(Array.from({ length: 21 }, (_, index) =>
    ({ ...item(), uuid: index.toString(16).padStart(32, "0") })))));
  assert.throws(() => validatePublicSystemSymbolExactResult(request, response(Array.from({ length: 20 }, (_, index) =>
    ({ ...item(), uuid: index.toString(16).padStart(32, "0"), description: "x".repeat(8192) })))), /RESULT_SIZE/u);
});

void test("symbol title lookup preserves exact own query-key identity, including prototype-like names", () => {
  const inherited: unknown = Object.create({ R0603: [] });
  for (const result of [null, [], "", { Other: [] }, { R0603: [], Other: [] }, { R0603: null }, inherited]) {
    assert.throws(() => validatePublicSystemSymbolExactResult(request, { success: true, code: 0, result }));
  }
  let invoked = false;
  const getter = Object.defineProperty({}, "R0603", { get(): unknown[] { invoked = true; return []; } });
  assert.throws(() => validatePublicSystemSymbolExactResult(request, { success: true, code: 0, result: getter }));
  assert.equal(invoked, false);
  for (const prototypeName of ["__proto__", "constructor", "prototype"]) {
    const value: unknown = JSON.parse(`{"success":true,"code":0,"result":{${JSON.stringify(prototypeName)}:[]}}`);
    assert.equal(validatePublicSystemSymbolExactResult({ ...request, name: prototypeName }, value)["returnedCount"], 0);
  }
  for (const raw of [null, {}, { success: false, code: 0, result: {} }, { success: true, code: 1, result: {} }, { success: true, code: 0 }]) {
    assert.throws(() => validatePublicSystemSymbolExactResult(request, raw));
  }
});
