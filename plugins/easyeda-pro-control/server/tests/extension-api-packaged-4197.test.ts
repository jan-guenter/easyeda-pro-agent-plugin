import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { queryExtensionApiCatalog } from "../src/extension-api-catalog.ts";
import { inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

void test("the packaged CLI candidate preserves installed metadata and grants no execution for its twenty additions", () => {
  const installed = extensionApiSnapshots.find(snapshot => snapshot.reference === "installed-209"); assert.ok(installed);
  assert.equal(createHash("sha256").update(JSON.stringify(installed)).digest("hex"), "e9d2e4cafe00168138576239527294d88c4d090ef2082bc40ab8f0d79a110693");
  const candidate = queryExtensionApiCatalog({ reference: "packaged-4197", namespace: "pcb_Dfm", detail: true });
  assert.equal(candidate.invocationEnabled, false);
  assert.equal(candidate.provenance.applicationVersion, "4.1.97.04b092ac");
  assert.equal(candidate.provenance.version, "0.3.69.f840f579");
  assert.equal(candidate.provenance.sourceSha256, "773046ae11ae9291215226858c7dfc9f8121bbba5f0e7c71d29cd7aa53c81257");
  assert.deepEqual(candidate.totals, { namespaces: 115, methods: 862, types: 474 });
  assert.equal(candidate.entries.length, 3);
  for (const entry of candidate.entries) {
    assert.equal(entry.executable, false); assert.equal(entry.runtimeAvailability, "not-probed"); assert.equal(entry.inputSchema, null);
  }
  assert.throws(() => queryExtensionApiCatalog({ reference: "installed-209", namespace: "pcb_Dfm" }));
  const additions = inventoryExtensionApiCoverage().filter(entry => entry.declarations.every(declaration => declaration.reference === "packaged-4197"));
  assert.equal(additions.length, 20);
  for (const entry of additions) {
    assert.equal(entry.status, "omitted"); assert.deepEqual(entry.routes, []);
    assert.equal(entry.reviewedRuntimeDeclaration, false); assert.equal(entry.installed209Declaration, false);
    assert.equal(entry.currentGenerationLiveValidation, "not-recorded"); assert.equal(entry.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(entry.omission !== null); assert.equal(entry.omission.code, "packaged-4197-runtime-not-admitted");
    assert.ok(entry.omission.reason.includes(`${entry.namespace}.${entry.method}`));
    assert.match(entry.omission.nextRequirement, /isolated candidate runtime/u);
  }
  const query = queryExtensionApiCoverage({ reference: "packaged-4197", namespace: "pcb_Dfm", detail: true });
  assert.equal(query["invocationEnabled"], false); assert.ok(Buffer.byteLength(JSON.stringify(query)) <= 65_536);
});
