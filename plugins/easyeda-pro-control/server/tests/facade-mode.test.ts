import assert from "node:assert/strict";
import { test } from "node:test";
import { CALCULATION_ONLY_TOOLS, PUBLIC_UTILITIES_ONLY_TOOLS, configuredFacadeMode, facadeToolRegistered, publicUtilitiesOnlyCapabilities } from "../src/facade-mode.ts";

void test("only the exact legacy configuration retains legacy tool registration", () => {
  const legacy = { EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.5378b690", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.aee2f57a" };
  assert.equal(configuredFacadeMode(legacy), "legacy-reviewed");
  for (const environment of [{}, { ...legacy, EASYEDA_PCB_BUNDLE_VERSION: "3.2.193.682ed44e" },
    { ...legacy, EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.50.ab46409c" },
    { ...legacy, EASYEDA_PUBLIC_API_BUNDLE_VERSION: "future" }]) {
    assert.equal(configuredFacadeMode(environment), "calculation-only");
  }
});

void test("restricted registration admits scoped metadata and disposable opening but no generic design or recovery route", () => {
  assert.equal(CALCULATION_ONLY_TOOLS.length, 26);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_pcb_string_precreate_validation"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_open"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_history"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_pcb_identities"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_pcb_geometry"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_symbol"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_pcb"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_schematic"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_schematic_rename"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_board"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_symbol_metadata"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_disposable_symbol_copy"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_disposable_pcb_rename"), true);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_disposable_schematic_rename"), true);
  for (const name of CALCULATION_ONLY_TOOLS) { assert.equal(facadeToolRegistered("calculation-only", name), true); }
  for (const name of ["easyeda_control_design", "easyeda_control_sdk_read", "easyeda_control_read",
    "easyeda_control_read_batch", "easyeda_control_context", "easyeda_control_native_ui", "easyeda_control_runtime",
    "easyeda_control_execute", "easyeda_control_recover_incomplete", "easyeda_control_validate_closed_symbol"]) {
    assert.equal(facadeToolRegistered("calculation-only", name), false);
    assert.equal(facadeToolRegistered("legacy-reviewed", name), true);
  }
});

void test("exact209 selectors expose only six public utility tools without inheriting old native routes", () => {
  assert.equal(configuredFacadeMode({ EASYEDA_PCB_BUNDLE_VERSION: "3.2.195.6b67774e",
    EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.59.1ca9efb5" }), "public-utilities-only");
  assert.equal(PUBLIC_UTILITIES_ONLY_TOOLS.length, 6);
  for (const name of PUBLIC_UTILITIES_ONLY_TOOLS) { assert.equal(facadeToolRegistered("public-utilities-only", name), true); }
  for (const name of CALCULATION_ONLY_TOOLS.filter((entry) => !PUBLIC_UTILITIES_ONLY_TOOLS.includes(entry))) {
    assert.equal(facadeToolRegistered("public-utilities-only", name), false);
  }
  for (const name of ["easyeda_control_design", "easyeda_control_native_ui", "easyeda_control_runtime", "easyeda_control_save_reopen"]) {
    assert.equal(facadeToolRegistered("public-utilities-only", name), false);
  }
  const capabilities = publicUtilitiesOnlyCapabilities();
  assert.deepEqual(capabilities["navigation"], { enabled: false });
  assert.deepEqual(capabilities["designAccess"], { enabled: false, scope: "all-design-routes" });
  assert.equal(Object.hasOwn(capabilities, "projectSymbolMetadata"), false);
});
