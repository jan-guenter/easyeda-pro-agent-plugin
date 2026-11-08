/** Fixed plan and actual native launch ordering; no process is started. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_NATIVE_BASELINE } from "../../scripts/native-baseline-source.ts";
import { createCurrentPcb209DiagnosticInstallationPlan, createCurrentSelectedFileMainInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { currentPcbDiagnosticCSharpRuntimeCompilerInput, expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_SELECTED_FILE_MAIN_INSTALLATION_FILES } from "../src/current-selected-file-main-installation-profile.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES } from "../src/current-selected-file-main-sql-fence-source.ts";

const options = Object.freeze({ pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "a".repeat(64), powershellBytes: 123 });
void test("selected SQL plan retains the original core order and every complete SQLite dependency", () => {
  const ordinary = createCurrentPcb209DiagnosticInstallationPlan(options), selected = createCurrentSelectedFileMainInstallationPlan(options);
  assert.equal(ordinary.plan.files.length, 5); assert.equal(selected.plan.files.length, 13);
  assert.deepEqual(selected.plan.files.slice(0, 5), ordinary.plan.files);
  assert.equal(new Set(selected.plan.files.map(row => row.windowsPath)).size, 13);
  assert.ok(Object.isFrozen(selected.plan.files) && selected.plan.files.every(Object.isFrozen));
  for (const pin of CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES) {
    const matches = selected.plan.files.filter(row => row.sha256 === pin.sha256);
    assert.equal(matches.length, 1); assert.equal(matches[0]?.bytes, pin.bytes);
  }
  assert.equal(CURRENT_SELECTED_FILE_MAIN_INSTALLATION_FILES.length, 12);
});
for (const layout of ["diagnostic", "schematic", "inverse"] as const) {
  void test(`${layout} native birth retains the complete selected SQL plan before creating the original root`, async () => {
    const seed = await readFile(new URL(`../../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8");
    const generated = generateWorkerStartupProtocol(seed, layout);
    assert.equal(generateWorkerStartupProtocol(generated, layout), generated);
    const source = expandCurrentPcbDiagnosticCSharpReviewSource(generated);
    assert.ok(Buffer.byteLength(currentPcbDiagnosticCSharpRuntimeCompilerInput(generated)) <= 2_097_152);
    const start = source.indexOf("  public void AdmitSelectedSql("); const end = source.indexOf("  public void AdmitRatline(", start);
    assert.ok(start > 0 && end > start); const method = source.slice(start, end);
    assert.ok(method.indexOf("EasyedaSelectedSql209Installation.Validate(paths,sizes,hashes)") < method.indexOf("Admit(corePaths,coreSizes,coreHashes)"));
    assert.ok(method.indexOf("Pin(paths[i],sizes[i],hashes[i])") < method.indexOf("AssertCurrent()"));
    const launch = source.slice(source.indexOf("  public void Launch(string executable,"), source.indexOf("  void CreateVerifiedRoot()"));
    assert.ok(launch.indexOf("installation.AdmitSelectedSql(paths,sizes,hashes)") < launch.indexOf("CreateVerifiedRoot()"));
    assert.ok(source.includes("if(SelectedSqlInstallation)installation.AdmitSelectedSql"));
    assert.ok(source.includes("$fileCount=if ($owner.SelectedSqlInstallation)"));
    for (const pin of CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES) { assert.ok(source.includes(pin.sha256)); }
    assert.ok(source.includes("CreateFile(path,directory?0x80u:0x80000000u,1u,IntPtr.Zero,3,0x02200000,IntPtr.Zero)")); assert.ok(source.includes("lease-bound"));
  });
}
