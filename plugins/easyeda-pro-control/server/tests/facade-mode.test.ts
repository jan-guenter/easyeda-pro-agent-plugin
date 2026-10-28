import assert from "node:assert/strict";
import { test } from "node:test";
import { CALCULATION_ONLY_TOOLS, PUBLIC_UTILITIES_ONLY_SCOPE, PUBLIC_UTILITIES_ONLY_TOOLS, configuredFacadeMode, facadeToolRegistered, publicUtilitiesOnlyCapabilities } from "../src/facade-mode.ts";

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
  assert.equal(CALCULATION_ONLY_TOOLS.length, 27);
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

void test("exact209 selectors expose sixteen scoped tools without inheriting unreviewed old routes", () => {
  assert.equal(configuredFacadeMode({ EASYEDA_PCB_BUNDLE_VERSION: "3.2.195.6b67774e",
    EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.59.1ca9efb5" }), "public-utilities-only");
  assert.equal(PUBLIC_UTILITIES_ONLY_TOOLS.length, 16);
  assert.equal(facadeToolRegistered("legacy-reviewed", "easyeda_control_public_readers"), false);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_public_readers"), false);
  assert.equal(facadeToolRegistered("legacy-reviewed", "easyeda_control_catalog_footprint"), false);
  assert.equal(facadeToolRegistered("calculation-only", "easyeda_control_catalog_footprint"), false);
  for (const tool of ["easyeda_control_netlist_files", "easyeda_control_catalog_components", "easyeda_control_pcb209_opening", "easyeda_control_pcb209_worker_startup"]) {
    assert.equal(facadeToolRegistered("legacy-reviewed", tool), false);
    assert.equal(facadeToolRegistered("calculation-only", tool), false);
  }
  for (const name of PUBLIC_UTILITIES_ONLY_TOOLS) { assert.equal(facadeToolRegistered("public-utilities-only", name), true); }
  for (const name of CALCULATION_ONLY_TOOLS.filter((entry) => !PUBLIC_UTILITIES_ONLY_TOOLS.includes(entry))) {
    assert.equal(facadeToolRegistered("public-utilities-only", name), false);
  }
  for (const name of ["easyeda_control_design", "easyeda_control_native_ui", "easyeda_control_runtime", "easyeda_control_save_reopen"]) {
    assert.equal(facadeToolRegistered("public-utilities-only", name), false);
  }
  const capabilities = publicUtilitiesOnlyCapabilities();
  assert.deepEqual(capabilities["libraryFiles"], { tool: "easyeda_control_library_files", runtimeAdmissionRequired: false, offline: true,
    implementation: "native-task-equivalent", localArtifactConfirmationRequired: true, publicSdkMethodExecuted: false,
    metadataOnly: false, suppliedFootprintSourceExtraction: true });
  assert.deepEqual(capabilities["netlistFiles"], { tool: "easyeda_control_netlist_files", runtimeAdmissionRequiredForComparison: true,
    connectedValidation: false, preparation: "exclusive-managed-artifact-from-supplied-ascii", comparison: "allegro-file-memberships-only", cadAuthority: false });
  assert.deepEqual(capabilities["publicReaders"], { tool: "easyeda_control_public_readers", runtimeAdmissionRequired: true, connectedValidation: false,
    batch: { maximumMethods: 7, sharedDeadlineMilliseconds: 10_000, atomicSnapshot: false, partialSuccess: false },
    scope: "supported-and-sdk-resolved-languages-api-page-viewport-theme-toolbar-unit-and-fixed-system-library-id" });
  assert.deepEqual(capabilities["navigation"], { enabled: true, scope: "original-owner-disposable209-opening-and-seven-project-startup-purposes-only" });
  assert.deepEqual(capabilities["designAccess"], { enabled: false, scope: "general-geometry-and-writers;disposable-bounded-observations-and-historical-queries-only" });
  const opening = capabilities["disposableOpening"]; assert.ok(typeof opening === "object" && opening !== null && "layerObservation" in opening);
  assert.equal(opening.layerObservation, "double-sampled-metadata-and-copper-count");
  assert.equal(Object.hasOwn(capabilities, "projectSymbolMetadata"), false);
  assert.deepEqual(capabilities["disposableWorkerStartup"], { tool: "easyeda_control_pcb209_worker_startup", validationOnly: true, connectedValidation: false,
    runtimeAdmissionRequired: true, debuggerPauseAcceptanceRequired: true, startupCompletionVerified: false,
    scope: "separate-project-worker-constructor-footprint-copy-preparation-and-route-preparation-combined-main-renderer-empty-baseline-ratline-held-import-and-continuation-purposes;no-complete-startup-or-writer-authority",
    completeLiveBaselineVerified: false, serverClockProvenanceVerified: false, cadAuthority: false });
  assert.deepEqual(capabilities["save"], { enabled: false }); assert.deepEqual(capabilities["recovery"], { enabled: false });
  assert.deepEqual(capabilities["nativeAdapters"], { enabled: true,
    scope: "identity-and-disposable209-opening-layer-primitive-selection-relations;project-worker-constructor-footprint-copy-preparation-and-route-preparation-empty-baseline-held-ratline-import-and-ratline-continuation-observations-only" });
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /eight distinct disposable launch purposes/u);
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /empty-baseline purpose joins fixed common data to the original completed SQL checkpoint/u);
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /ratline-held-import purpose qualifies PCB construction/u);
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /observes a bounded first-child native creation stack/u);
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /does not independently associate the JavaScript Worker object with its CDP target/u);
  assert.match(PUBLIC_UTILITIES_ONLY_SCOPE, /No complete startup or live baseline, general geometry read\/write, explicit Save or recovery is offered/u);
  assert.doesNotMatch(PUBLIC_UTILITIES_ONLY_SCOPE, /No [^.]*PCB-worker\/ratline route is registered/u);
});
