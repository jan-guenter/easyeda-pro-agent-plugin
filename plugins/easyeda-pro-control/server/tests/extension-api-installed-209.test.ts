import assert from "node:assert/strict";
import { test } from "node:test";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { extensionApiCoverageSummary, inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { installed209ApiOmission } from "../src/extension-api-installed-209-omissions.ts";

void test("all 61 installed 209 additions have concrete source findings without registered execution routes", () => {
  const previous = new Set(extensionApiSnapshots.filter((snapshot) => snapshot.reference !== "installed-209")
    .flatMap((snapshot) => snapshot.namespaces.flatMap((namespace) => namespace.methods.map((method) => `eda.${namespace.name}.${method.name}`))));
  const additions = inventoryExtensionApiCoverage().filter((entry) => !previous.has(entry.path));
  assert.equal(additions.length, 61);
  const counts = new Map<string, number>();
  for (const entry of additions) {
    assert.equal(entry.status, "omitted"); assert.deepEqual(entry.routes, []);
    assert.equal(entry.reviewedRuntimeDeclaration, false); assert.equal(entry.installed209Declaration, true);
    assert.equal(entry.runtimeAdmission, "not-granted-by-inventory"); assert.equal(entry.currentGenerationLiveValidation, "not-recorded");
    assert.equal(entry.completeDeclaredContractSupported, false);
    assert.ok(entry.omission); assert.ok(entry.omission.evidence.includes("docs/history/2026-10-23-installed-209-declaration-inventory.md"));
    assert.ok(entry.omission.nextRequirement); assert.match(entry.omission.reason, /3\.2\.209/u);
    counts.set(entry.omission.code, (counts.get(entry.omission.code) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(counts), {
    "installed-209-readiness-backend-absent": 4,
    "installed-209-error-stub": 18,
    "installed-209-auto-job-backend-absent": 5,
    "installed-209-raytracer-backend-absent": 5,
    "installed-209-source-backend-absent": 29,
  });
  assert.equal(extensionApiCoverageSummary()["installed209DistinctMethods"], 811);
});

void test("installed 209 findings use closed exact method lists and cannot mutate retained evidence", () => {
  for (const path of ["dmt_SourceProject.unknown", "sch_SourcePrimitiveComponent.constructor", "pcb_Document.autoRouting", "pcb_RayTracerEngine.init", "eda.dmt_Project.waitForReady"]) {
    assert.equal(installed209ApiOmission(path), undefined);
  }
  const first = installed209ApiOmission("dmt_SourceProject.virtualOpenProject"); assert.ok(first);
  assert.match(first.reason, /share persisted project data.*not provide isolation/u);
  Reflect.set(first, "reason", "changed");
  const second = installed209ApiOmission("dmt_SourceProject.virtualOpenProject"); assert.ok(second);
  assert.notEqual(first.reason, second.reason);
});

void test("installed 209 coverage filter is bounded and does not relabel legacy declaration support", () => {
  const query = queryExtensionApiCoverage({ reference: "installed-209", namespace: "dmt_SourceProject", detail: true });
  assert.equal(query["offline"], true); assert.equal(query["invocationEnabled"], false);
  const entries = query["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 3);
  const old = queryExtensionApiCoverage({ reference: "reviewed-installed", namespace: "dmt_SourceProject" });
  assert.deepEqual(old["entries"], []);
  assert.ok(Buffer.byteLength(JSON.stringify(query), "utf8") <= 65_536);
});
