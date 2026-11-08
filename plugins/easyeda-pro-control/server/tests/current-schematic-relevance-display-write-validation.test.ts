/** Offline argument checks allocate no fixture, owner or native process. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { queryOfflineApi } from "../src/offline-api.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_EXECUTE_ACKNOWLEDGEMENTS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL } from "../src/current-schematic-relevance-display-write-contract.ts";

void test("offline seven-record writer discovery retains false execution and connected claims", () => {
  const value: unknown = queryOfflineApi({ action: "schematic209-relevance-display-write", query: { includeSchemas: true } }).result;
  assert.ok(value !== null && typeof value === "object"); assert.equal(Reflect.get(value, "tool"), CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL);
  for (const field of ["executionAuthorized", "connectedValidation", "ordinaryProjectsSupported", "inverseAvailable"]) { assert.equal(Reflect.get(value, field), false); }
  for (const field of ["mountedInPublicUtilities", "validationOnly", "runtimeAdmissionRequired", "sourceAdmissionRequired", "originalReleasedClosedDataQualificationRequired"]) { assert.equal(Reflect.get(value, field), true); }
  assert.ok("inputSchema" in value && "outputSchema" in value);
});
void test("offline write validation accepts exact confirmations and refuses supplied owners, paths and partial acknowledgements", () => {
  const request = { action: "execute", operationId: "sch209-relevance-display-offline-test", ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_EXECUTE_ACKNOWLEDGEMENTS };
  const value: unknown = queryOfflineApi({ action: "schematic209-relevance-display-write-validate", query: { request } }).result;
  assert.ok(value !== null && typeof value === "object"); assert.equal(Reflect.get(value, "valid"), true); assert.equal(Reflect.get(value, "executionAuthorized"), false);
  for (const invalid of [{ action: request.action, operationId: request.operationId }, { ...request, owner: {} }, { ...request, path: "supplied.eprj2" }, { ...request, confirmOneSave: false }]) {
    const result: unknown = queryOfflineApi({ action: "schematic209-relevance-display-write-validate", query: { request: invalid } }).result;
    assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "valid"), false);
  }
});
void test("the new public lifecycle stays separately blocked until actual action composition exists", () => {
  const inventory = inventoryExtensionApiCoverage();
  for (const path of ["eda.sch_PrimitiveText.modify", "eda.sch_Document.save"]) {
    const entry = inventory.find(value => value.path === path); assert.ok(entry);
    const route = entry.routes.find(value => value.tool === CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL); assert.ok(route);
    assert.equal(route.executionState, "blocked"); assert.match(route.blockedReason ?? "", /before allocation/u);
    assert.equal(entry.currentGenerationLiveValidation, "not-recorded"); assert.equal(entry.completeDeclaredContractSupported, false);
  }
});
