/** Offline comparison tests only. The actual doctor, machine profile, native
 * runtime, bridge and MCP child are never started or read by this fixture.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { selectDoctorRuntimeContract } from "../../scripts/doctor-runtime-contract.ts";
import type { DoctorRuntimeContract } from "../../scripts/doctor-runtime-contract.ts";
import { FACADE_TOOL_NAMES } from "../../scripts/plugin-contract.ts";
import { loadReviewedCompatibilityManifest } from "../src/core.ts";
import { CALCULATION_ONLY_TOOLS } from "../src/facade-mode.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";

const legacy = loadReviewedCompatibilityManifest().installedBundles;
const current = SDK_LOCAL_RUNTIME_PROFILE.installedBundles;

function selected(kind: "current" | "legacy"): DoctorRuntimeContract {
  const bundles = kind === "current" ? current : legacy;
  const result = selectDoctorRuntimeContract(bundles.pcbEditor.version, bundles.publicApi.version, legacy);
  assert.ok(result !== undefined); return result;
}

void test("doctor keeps exact current installed identity and restricted catalog separate from legacy", () => {
  const result = selected("current");
  assert.equal(result.profile, SDK_LOCAL_RUNTIME_PROFILE.schema); assert.equal(result.facadeMode, "calculation-only");
  assert.equal(result.pcbBundleVersion, current.pcbEditor.version); assert.equal(result.publicApiBundleVersion, current.publicApi.version);
  assert.deepEqual(result.bundleHashes, { pcbImplementation: current.pcbEditor.implementationSha256,
    publicApiImplementation: current.publicApi.implementationSha256, publicApiAdapter: current.publicApi.adapterSha256,
    publicApiDeclarations: current.publicApi.declarationsSha256 });
  assert.deepEqual(result.toolNames, CALCULATION_ONLY_TOOLS); assert.equal(result.toolNames.length, 22);
  assert.equal(result.toolNames.includes("easyeda_control_project_pcb"), true);
  assert.equal(result.toolNames.includes("easyeda_control_disposable_pcb_rename"), true);
  assert.equal(result.toolNames.includes("easyeda_control_disposable_schematic_rename"), true);
  assert.equal(result.toolNames.includes("easyeda_control_project_symbol_metadata"), true);
  assert.equal(result.toolNames.includes("easyeda_control_design"), false);
  assert.equal(result.executionAuthorized, false); assert.equal(result.connectedValidation, false);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.bundleHashes) && Object.isFrozen(result.toolNames));
});

void test("doctor preserves the exact reviewed legacy tuple and full catalog", () => {
  const result = selected("legacy");
  assert.equal(result.profile, "reviewed-legacy-installed-bundles"); assert.equal(result.facadeMode, "legacy-reviewed");
  assert.equal(result.pcbBundleVersion, legacy.pcbEditor.version); assert.equal(result.publicApiBundleVersion, legacy.publicApi.version);
  assert.deepEqual(result.bundleHashes, { pcbImplementation: legacy.pcbEditor.implementationSha256,
    publicApiImplementation: legacy.publicApi.implementationSha256, publicApiAdapter: legacy.publicApi.adapterSha256,
    publicApiDeclarations: legacy.publicApi.declarationsSha256 });
  assert.deepEqual(result.toolNames, FACADE_TOOL_NAMES); assert.equal(result.toolNames.length, 47);
  assert.equal(result.executionAuthorized, false); assert.equal(result.connectedValidation, false);
});

void test("doctor rejects unknown, missing, partial and mixed configured version pairs", () => {
  for (const [pcb, api] of [["", ""], [current.pcbEditor.version, ""], ["", current.publicApi.version],
    [legacy.pcbEditor.version, current.publicApi.version], [current.pcbEditor.version, legacy.publicApi.version],
    [current.pcbEditor.version, "future"], ["future", current.publicApi.version], ["future", "future"],
    [current.pcbEditor.version.toUpperCase(), current.publicApi.version],
    [current.pcbEditor.version, `${current.publicApi.version} `]] as const) {
    assert.equal(selectDoctorRuntimeContract(pcb, api, legacy), undefined);
  }
  const changedLegacy = structuredClone(legacy); changedLegacy.pcbEditor.version = "future";
  assert.equal(selectDoctorRuntimeContract("future", legacy.publicApi.version, changedLegacy), undefined);
  assert.equal(selectDoctorRuntimeContract(legacy.pcbEditor.version, legacy.publicApi.version, changedLegacy), undefined);
});

interface Catalog { readonly count: number; readonly names: readonly string[]; readonly allHaveMeaningfulOutputSchema: boolean }
interface Check { readonly check: string; readonly ok: boolean; readonly detail: string }
function runComparison(program: string, values: object): Check {
  const checks: Check[] = [];
  runInNewContext(program, { ...values, check: (name: string, ok: boolean, detail: string): void => {
    checks.push({ check: name, ok, detail });
  } });
  assert.equal(checks.length, 1); const result = checks[0]; assert.ok(result !== undefined); return result;
}
async function comparisonFixture(): Promise<{
  hashes: (contract: DoctorRuntimeContract | undefined, hashes: DoctorRuntimeContract["bundleHashes"]) => Check;
  catalog: (contract: DoctorRuntimeContract | undefined, catalog: Catalog) => Check;
}> {
  const source = await readFile(new URL("../../scripts/doctor.ts", import.meta.url), "utf8");
  function expression(name: string): string {
    const start = source.indexOf(`  check(\n    "${name}",`);
    const end = source.indexOf("\n  );", start);
    assert.ok(start > 0 && end > start); return source.slice(start, end + "\n  );".length);
  }
  const catalog = expression("mcp-tool-catalog"), hashes = expression("installed-easyeda-bundle-hashes");
  return {
    hashes: (runtimeContract, installedBundleHashes): Check => runComparison(hashes, { runtimeContract, installedBundleHashes }),
    catalog: (runtimeContract, toolCatalog): Check => runComparison(catalog, { runtimeContract, toolCatalog }),
  };
}

void test("maintained doctor selects from resolved path versions and refuses missing manifest authority", async () => {
  const source = await readFile(new URL("../../scripts/doctor.ts", import.meta.url), "utf8");
  const end = source.indexOf("const installedBundleFiles ="), start = source.indexOf("const runtimeContract =");
  assert.ok(start > 0 && end > start);
  const program = `${source.slice(start, end)}\nruntimeContract;`;
  for (const kind of ["current", "legacy"] as const) {
    const expected = selected(kind);
    // There is deliberately no process/env or profile loader in this context.
    const context = { selectDoctorRuntimeContract, pcbBundleVersion: expected.pcbBundleVersion,
      publicApiBundleVersion: expected.publicApiBundleVersion, reviewedCompatibility: { installedBundles: legacy } };
    assert.deepEqual(runInNewContext(program, context), expected);
    assert.equal(runInNewContext(program, { ...context, pcbBundleVersion: "future" }), undefined);
    assert.equal(runInNewContext(program, { ...context, reviewedCompatibility: { error: "manifest refused" } }), undefined);
  }
});

void test("maintained doctor hash comparison checks every byte hash without cross-profile fallback", async () => {
  const fixture = await comparisonFixture();
  for (const kind of ["current", "legacy"] as const) {
    const contract = selected(kind), other = selected(kind === "current" ? "legacy" : "current");
    assert.deepEqual(fixture.hashes(contract, contract.bundleHashes),
      { check: "installed-easyeda-bundle-hashes", ok: true, detail: contract.profile });
    assert.equal(fixture.hashes(contract, other.bundleHashes).ok, false);
    for (const key of ["pcbImplementation", "publicApiImplementation", "publicApiAdapter", "publicApiDeclarations"] as const) {
      assert.equal(fixture.hashes(contract, { ...contract.bundleHashes, [key]: "0".repeat(64) }).ok, false);
    }
    assert.equal(fixture.hashes(undefined, contract.bundleHashes).ok, false);
  }
});

void test("maintained doctor catalog requires exact selected names, count and meaningful output schemas", async () => {
  const fixture = await comparisonFixture();
  for (const kind of ["current", "legacy"] as const) {
    const contract = selected(kind), other = selected(kind === "current" ? "legacy" : "current");
    const catalog = { count: contract.toolNames.length, names: contract.toolNames.toSorted(), allHaveMeaningfulOutputSchema: true };
    assert.deepEqual(fixture.catalog(contract, catalog), { check: "mcp-tool-catalog", ok: true, detail: contract.profile });
    for (const invalid of [{ ...catalog, count: catalog.count + 1 }, { ...catalog, allHaveMeaningfulOutputSchema: false },
      { ...catalog, names: [...catalog.names.slice(1), "foreign_tool"].toSorted() },
      { ...catalog, count: other.toolNames.length, names: other.toolNames.toSorted() }]) {
      assert.equal(fixture.catalog(contract, invalid).ok, false);
    }
    assert.deepEqual(fixture.catalog(undefined, catalog), { check: "mcp-tool-catalog", ok: false, detail: "unreviewed-configured-runtime" });
  }
});
