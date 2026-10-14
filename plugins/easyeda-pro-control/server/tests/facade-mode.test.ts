import assert from "node:assert/strict";
import { test } from "node:test";
import { CALCULATION_ONLY_TOOLS, configuredFacadeMode, facadeToolRegistered } from "../src/facade-mode.ts";

void test("only the exact legacy configuration retains legacy tool registration", () => {
  const legacy = { EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.5378b690", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.aee2f57a" };
  assert.equal(configuredFacadeMode(legacy), "legacy-reviewed");
  for (const environment of [{}, { ...legacy, EASYEDA_PCB_BUNDLE_VERSION: "3.2.193.682ed44e" },
    { ...legacy, EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.50.ab46409c" },
    { ...legacy, EASYEDA_PUBLIC_API_BUNDLE_VERSION: "future" }]) {
    assert.equal(configuredFacadeMode(environment), "calculation-only");
  }
});

void test("restricted registration admits scoped disposable opening but no generic design or recovery route", () => {
  assert.equal(CALCULATION_ONLY_TOOLS.length, 12);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_project_open"), true);
  for (const name of CALCULATION_ONLY_TOOLS) { assert.equal(facadeToolRegistered("calculation-only", name), true); }
  for (const name of ["easyeda_control_design", "easyeda_control_sdk_read", "easyeda_control_read",
    "easyeda_control_read_batch", "easyeda_control_context", "easyeda_control_native_ui", "easyeda_control_runtime",
    "easyeda_control_execute", "easyeda_control_recover_incomplete", "easyeda_control_validate_closed_symbol"]) {
    assert.equal(facadeToolRegistered("calculation-only", name), false);
    assert.equal(facadeToolRegistered("legacy-reviewed", name), true);
  }
});
