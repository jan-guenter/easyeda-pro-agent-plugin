import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { listDesignActionCapabilities } from "../src/design-capabilities.ts";
import { SCHEMATIC_NATIVE_WIRE_PROFILE } from "../src/schematic-native-wire.ts";
import { getOperationValidationRecord, getOperationValidationRegistry } from "../src/validation-registry.ts";

void test("historical validation has unique operation identities, stages and exact external profile bindings", () => {
  const registry = getOperationValidationRegistry();
  assert.equal(registry.schema, "easyeda-pro-control.operation-validation-registry.v1");
  assert.equal(registry.scope, "historical-profile-validation;not-this-facade-generation");
  assert.equal(registry.unlistedActions, "no-recorded-status;no-inherited-sibling-validation");
  assert.equal(registry.records.length, 1);
  assert.equal(new Set(registry.records.map((record) => record.id)).size, registry.records.length);
  assert.equal(new Set(registry.records.map((record) => record.action)).size, registry.records.length);
  assert.equal(new Set(registry.records.map((record) => `${record.action}:${record.adapterProfile}`)).size, registry.records.length);
  const record = registry.records[0];
  assert.ok(record);
  assert.equal(record.action, "sch.wire.modify");
  assert.equal(record.adapterProfile, SCHEMATIC_NATIVE_WIRE_PROFILE);
  assert.equal(record.scope, registry.scope);
  assert.deepEqual(record.externalProfile, {
    applicationVersion: "3.2.149.88089769",
    publicApiVersion: "0.2.53.aee2f57a",
    publicApiImplementationSha256: "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc",
    dispatcherBuildId: "ded07x99dcxb504",
    schematicBundleVersion: "3.2.149.35ae2987",
    schematicImplementationSha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f",
  });
  assert.deepEqual(record.fixture, { category: "disposable-schematic-validation", case: "existing-named-wire-cardinal-split-with-junction", durableDocumentCount: 16 });
  assert.deepEqual(record.stages.map((entry) => entry.stage), ["historical-live-native-effect", "historical-live-saved-reopened", "historical-live-retained-save-recovery"]);
  assert.equal(new Set(record.stages.map((entry) => entry.stage)).size, record.stages.length);
  assert.ok(record.stages.every((entry) => entry.date === "2026-09-25" && entry.evidenceScope.length > 0));
  assert.ok(record.exclusions.includes("no-current-facade-generation-live-validation"));
  assert.ok(record.exclusions.includes("no-new-runtime-or-guard-live-validation"));
  assert.ok(record.exclusions.includes("no-sibling-operation-validation"));
});

void test("adapter changes, including comments, require a deliberate historical record review", async () => {
  const record = getOperationValidationRecord("sch.wire.modify");
  assert.ok(record);
  assert.deepEqual(record.adapterBindings.map((entry) => entry.path), ["schematic-native-wire.ts", "schematic-wire-order.ts", "schematic-wire-persistence.ts"]);
  assert.equal(new Set(record.adapterBindings.map((entry) => entry.path)).size, record.adapterBindings.length);
  assert.equal(new Set(record.sourceRevisionReviews?.map((entry) => entry.path)).size, record.sourceRevisionReviews?.length);
  assert.deepEqual(record.sourceRevisionReviews, [{
    path: "schematic-native-wire.ts",
    historicalSha256: "13db7218226c6636c51136ea9b96fc99a4bb784ad21ba10731d81ecd25e3a837",
    reviewedSha256: "a4336c2fae96b142a50cdfbba722e35f3456ef290847c937d23292db8f298ec9",
    reviewedAt: "2026-10-12",
    scope: "historical-explicit-false-profile-only;omitted-lock-and-sealed-wire-live-unvalidated",
    reference: "docs/history/2026-10-12-api-coverage-220050-release.md#historical-wire-source-review",
  }]);
  assert.ok(record.sourceRevisionReviews.every((revision) => record.adapterBindings.some((binding) =>
    binding.path === revision.path && binding.sha256 === revision.historicalSha256)));
  assert.ok(record.exclusions.includes("no-flat-wire-reroute-v1-live-validation"));
  assert.ok(record.exclusions.includes("no-omitted-lock-live-validation"));
  for (const binding of record.adapterBindings) {
    assert.match(binding.path, /^schematic-(?:native-wire|wire-order|wire-persistence)\.ts$/u);
    assert.match(binding.sha256, /^[a-f0-9]{64}$/u);
    const bytes = await readFile(new URL(`../src/${binding.path}`, import.meta.url));
    const reviewedSha256: string | undefined = record.sourceRevisionReviews.find((entry) => entry.path === binding.path)?.reviewedSha256;
    assert.equal(createHash("sha256").update(bytes).digest("hex"), reviewedSha256 ?? binding.sha256,
      `Historical validation registry review required for ${binding.path}; do not automatically refresh its digest.`);
  }
});

void test("unrecorded and sibling actions receive no inferred validation status", () => {
  for (const action of ["sch.wire.create", "sch.component.modify", "sch.layout.batch", "pcb.wire.modify", "sch.rule.check", "SCH.WIRE.MODIFY", ""]) {
    assert.equal(getOperationValidationRecord(action), undefined);
  }
});

void test("capability and record responses cannot mutate maintained historical evidence", () => {
  const original = getOperationValidationRegistry();
  const first = getOperationValidationRegistry();
  const record = first.records[0];
  assert.ok(record);
  const binding = record.adapterBindings[0];
  const stage = record.stages[0];
  assert.ok(binding);
  assert.ok(stage);
  assert.ok(Reflect.set(record.externalProfile, "applicationVersion", "changed"));
  assert.ok(Reflect.set(binding, "sha256", "changed"));
  assert.ok(Reflect.set(stage, "date", "changed"));
  assert.ok(Reflect.set(record.fixture, "durableDocumentCount", 0));
  const revision = record.sourceRevisionReviews?.[0];
  assert.ok(revision);
  assert.ok(Reflect.set(revision, "reviewedSha256", "changed"));
  assert.deepEqual(getOperationValidationRegistry(), original);
  const individual = getOperationValidationRecord("sch.wire.modify");
  assert.ok(individual);
  assert.ok(Reflect.set(individual, "action", "changed"));
  assert.deepEqual(getOperationValidationRecord("sch.wire.modify"), original.records[0]);
  const capabilities = listDesignActionCapabilities();
  assert.deepEqual(capabilities["operationValidation"], original);
  assert.ok(!JSON.stringify(capabilities["specialCases"]).includes("live-validation-pending"));
  assert.ok(JSON.stringify(capabilities["specialCases"]).includes("validation-registry:sch.wire.modify"));
});
