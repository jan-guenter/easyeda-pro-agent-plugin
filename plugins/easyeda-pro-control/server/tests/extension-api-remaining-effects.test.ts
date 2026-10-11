import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { extensionApiCoverageSummary, inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

const cases = [
  { path: "eda.pcb_Layer.selectLayer", code: "layer-selection-collateral-state", facts: [/returns true even/u, /visibility, colors, ordering/u, /ACTIVE_LAYER/u], next: /complete before\/after/u },
  { path: "eda.dmt_Schematic.reorderSchematicPages", code: "page-order-partial-write-lifecycle", facts: [/not duplicate page IDs/u, /1,2,4,8/u, /currentProject\.projectId/u], next: /partial-progress recovery without batch replay/u },
  { path: "eda.pcb_Drc.modifyPadPairGroupName", code: "pad-pair-group-replacement-effects", facts: [/deletes its old EQLEN_GRP/u, /fresh native number/u, /old color/u, /no explicit RULE or RULE_SELECTOR write/u], next: /delete\/create interval/u },
] as const;

void test("remaining researched mutations expose concrete native effects without enabling a route", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((entry) => [entry.path, entry]));
  for (const item of cases) {
    const row = rows.get(item.path); assert.ok(row);
    assert.equal(row.reviewedRuntimeDeclaration, true);
    assert.equal(row.status, "omitted"); assert.deepEqual(row.routes, []);
    assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(row.omission); assert.equal(row.omission.code, item.code);
    for (const fact of item.facts) { assert.match(row.omission.reason, fact); }
    assert.match(row.omission.nextRequirement, item.next);
    assert.match(row.omission.nextRequirement, /feasible|not inherent infeasibility/u);
    assert.ok(row.omission.evidence.includes("docs/api-remaining-method-effects-2026-10-11.md"));
    assert.ok(row.omission.evidence.some((entry) => /@sha256:[a-f0-9]{64};utf16:\d/u.test(entry)));
  }
});

void test("compact and detailed offline discovery retain each concrete omission and no execution authority", () => {
  for (const item of cases) {
    for (const detail of [false, true]) {
      const result = queryExtensionApiCoverage({ search: item.path, status: "omitted", detail });
      assert.equal(result["offline"], true); assert.equal(result["invocationEnabled"], false);
      const entries = result["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
      const row: unknown = entries[0]; assert.ok(isRecord(row));
      assert.equal(row["path"], item.path); assert.deepEqual(row["routes"], []);
      assert.equal(row["runtimeAdmission"], "not-granted-by-inventory");
      assert.ok(isRecord(row["omission"])); assert.equal(row["omission"]["code"], item.code);
    }
  }
});

void test("new omission buckets remain exact to the researched method and do not reclassify other pad-pair actions", () => {
  const rows = inventoryExtensionApiCoverage();
  const summary = extensionApiCoverageSummary(rows);
  const omissions = summary["omissions"];
  assert.ok(isRecord(omissions));
  for (const item of cases) {
    assert.equal(omissions[item.code], 1);
    assert.deepEqual(rows.filter((row) => row.omission?.code === item.code).map((row) => row.path), [item.path]);
  }
  for (const method of ["createPadPairGroup", "deletePadPairGroup", "addPadPairToPadPairGroup", "removePadPairFromPadPairGroup"]) {
    const row = rows.find((entry) => entry.path === `eda.pcb_Drc.${method}`); assert.ok(row);
    assert.equal(row.status, "omitted"); assert.equal(row.omission?.code, "scoped-effect-adapter-needed");
  }
});
