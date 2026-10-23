import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, parsePublicSystemFootprintRequest, queryPublicSystemFootprint,
  validatePublicSystemFootprintArguments, validatePublicSystemFootprintResult } from "../src/public-system-footprint.ts";

const footprintUuid = "a".repeat(32), request = { footprintUuid, confirmNetwork: true };
const payload = (): Record<string, unknown> => ({ success: true, code: 0, result: { uuid: footprintUuid,
  path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4, public: true, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
  display_title: "QFN-32", description: "line 1\nline 2", tags: { parent_tag: { uuid: "b".repeat(32), name: "QFN" }, child_tag: [] } } });

void test("catalog footprint accepts one explicit public ID and network acknowledgment, no SDK or destination arguments", () => {
  assert.deepEqual(parsePublicSystemFootprintRequest(request), request);
  assert.equal(validatePublicSystemFootprintArguments(request)["valid"], true);
  for (const value of [{ footprintUuid }, { ...request, confirmNetwork: false }, { ...request, footprintUuid: "../design.eprj2" },
    { ...request, footprintUuid: footprintUuid.toUpperCase() }, { ...request, footprintUuid: "a".repeat(64) },
    { ...request, url: "https://private.invalid" }, { ...request, libraryUuid: "project" },
    { ...request, method: "eda.lib_Footprint.get" }, { ...request, expectedFingerprint: {} }, { ...request, cookie: "PRIVATE" }]) {
    assert.throws(() => parsePublicSystemFootprintRequest(value));
    assert.equal(validatePublicSystemFootprintArguments(value)["valid"], false);
  }
  const query = queryPublicSystemFootprint({ includeSchemas: true });
  assert.equal(query["offline"], true); assert.equal(query["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(query), /vendor-http-task-equivalent/u); assert.match(JSON.stringify(query), /inputSchema/u);
  assert.throws(() => queryPublicSystemFootprint({ libraryUuid: "project" }));
});

void test("catalog footprint projects supported metadata exactly without returning geometry or implying SDK validation", () => {
  const raw = payload(); assert.ok(raw["result"] !== null && typeof raw["result"] === "object");
  Object.assign(raw["result"], { dataStr: "UNINSPECTED_GEOMETRY", key: "UNINSPECTED_VENDOR_KEY", model_3d: { source: "UNINSPECTED_3D" } });
  const result = validatePublicSystemFootprintResult(request, raw);
  assert.deepEqual(result["footprint"], { uuid: footprintUuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "4",
    name: "QFN-32", description: "line 1\nline 2", classification: { primaryClassificationUuid: "b".repeat(32) } });
  for (const key of ["backendFreshnessVerified", "completeAssetVerified", "persistenceVerified", "cadAuthority", "publicSdkMethodExecuted", "installedRuntimeAdmission"]) {
    assert.equal(result[key], false);
  }
  assert.equal(result["observationCount"], 1); assert.equal(result["connectedSdkValidation"], "not-performed");
  assert.doesNotMatch(JSON.stringify(result), /UNINSPECTED/u);
});

void test("catalog footprint refuses foreign identity, nonpublic and malformed evidence rather than normalize it", () => {
  for (const change of [
    { uuid: "b".repeat(32) }, { path: "project" }, { docType: 2 }, { public: false }, { public: 1 },
    { owner: { uuid: "b".repeat(32) } }, { owner: undefined }, { display_title: "x".repeat(513) }, { display_title: "\u0000" },
    { description: "\uD800" }, { description: "x".repeat(65_537) }, { description: null },
    { tags: { parent_tag: ["UNKNOWN"], child_tag: [] } }, { tags: { parent_tag: {}, child_tag: [] } },
    { tags: { parent_tag: [], child_tag: null } },
  ]) {
    const raw = payload(); assert.ok(raw["result"] !== null && typeof raw["result"] === "object");
    Object.assign(raw["result"], change); assert.throws(() => validatePublicSystemFootprintResult(request, raw));
  }
  for (const raw of [undefined, null, { success: false, code: 404, message: "Component not found" },
    { ...payload(), code: 401 }, { ...payload(), success: false }, { ...payload(), result: null }]) {
    assert.throws(() => validatePublicSystemFootprintResult(request, raw));
  }
});
