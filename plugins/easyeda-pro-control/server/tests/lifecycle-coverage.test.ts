import assert from "node:assert/strict";
import { test } from "node:test";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { maintainedApiCoverageRoutes } from "../src/extension-api-coverage-routes.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";

void test("all design routes expose structure lifecycle containment while non-design and footprint routes retain their contracts", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  let blocked = 0, unchangedFootprints = 0, unchangedReaders = 0;
  for (const [path, originals] of maintainedApiCoverageRoutes()) {
    for (const original of originals) {
      const route = rows.get(path)?.routes.find((entry) => entry.tool === original.tool && entry.selector === original.selector);
      assert.ok(route);
      if (route.tool !== "easyeda_control_design") {
        if (route.tool !== "easyeda_control_library") { assert.deepEqual(route, original); unchangedReaders += 1; }
      } else if (route.selector.startsWith("footprint.")) { assert.deepEqual(route, original); unchangedFootprints += 1; }
      else {
        blocked += 1;
        assert.ok(route.source.includes("design-execution-lifecycle.ts"));
        assert.equal(route.blockedReason?.includes(DESIGN_STRUCTURE_LIFECYCLE_REFUSAL), true);
        assert.ok(route.blockedDocumentTypes !== undefined && route.blockedDocumentTypes.length > 0);
        assert.ok(route.blockedDocumentTypes.every((type) => [1, 2, 3].includes(type)));
        assert.equal(route.executionState, route.selector === "commit/recovery lifecycle" ? "partially-blocked" : "blocked");
        assert.match(route.scope, /Retained source\/proof contract/u);
      }
    }
  }
  assert.ok(blocked > 70); assert.equal(unchangedFootprints, 3); assert.ok(unchangedReaders > 30);
  for (const [path, types] of [["eda.pcb_Document.save", [3]], ["eda.sch_Document.save", [1]]] as const) {
    const route = rows.get(path)?.routes.find((entry) => entry.selector === "execute/commit"); assert.ok(route);
    assert.deepEqual(route.documentTypes, types); assert.deepEqual(route.blockedDocumentTypes, types);
    assert.equal(route.executionState, "blocked");
  }
  for (const row of rows.values()) {
    for (const route of row.routes.filter((entry) => entry.tool === "easyeda_control_sdk_read")) {
      assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.blockedReason, undefined);
      assert.equal(route.source.includes("design-execution-lifecycle.ts"), false);
    }
  }
});

void test("symbol deletion remains nonexecutable until subscriber and delayed structure effects have a completion proof", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.lib_Symbol.delete");
  assert.ok(row);
  assert.equal(row.status, "omitted"); assert.deepEqual(row.routes, []);
  assert.ok(row.omission);
  assert.equal(row.omission?.code, "symbol-delete-subscriber-and-structure-lifecycle");
  assert.ok(row.omission.evidence.includes("docs/symbol-delete-native-effects-2026-10-12.md"));
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
  const operation = { id: "closed-symbol-delete", action: "library.symbol.delete", libraryUuid: "project", target: { uuid: "symbol" } };
  assert.throws(() => libraryExecutionKind(operation), /no completed execution proof profile/u);
  assert.throws(() => buildLibraryExecutionExpression(operation), /no completed execution proof profile/u);
});
