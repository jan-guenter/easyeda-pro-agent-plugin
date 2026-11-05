import assert from "node:assert/strict";
import { test } from "node:test";
import { maintainedApiCoverageRoutes } from "../src/extension-api-coverage-routes.ts";

void test("coverage keeps ordinary PCB admission separate from disposable, spatial and writer scopes", () => {
  const routes = maintainedApiCoverageRoutes();
  for (const [method, selector] of [["eda.dmt_Project.openProject", "open-project"], ["eda.dmt_EditorControl.openDocument", "open-pcb"],
    ["eda.pcb_Layer.getAllLayers", "observe-layers"], ["eda.pcb_PrimitiveVia.getAll", "observe-primitives"],
    ["eda.pcb_PrimitiveComponent.getAll", "observe-extended-primitives"], ["eda.pcb_SelectControl.getSelectedPrimitives", "observe-selection-relations"]]) {
    const found = routes.get(method ?? "") ?? [], old = found.find(route => route.selector === selector), ordinary = found.find(route => route.selector === `ordinary/${selector}`);
    assert.ok(old && ordinary); assert.match(old.scope, /disposable/u); assert.match(ordinary.scope, /pcb209-ordinary-\*/u);
    assert.ok(ordinary.source.includes("current-pcb-ordinary-read-validation.ts"));
    assert.deepEqual(ordinary.documentTypes, [3]); assert.equal(ordinary.executionState, "available-with-runtime-guards");
  }
  assert.equal(routes.get("eda.pcb_Document.getPrimitiveAtPoint")?.some(route => route.selector.startsWith("ordinary/")), false);
  assert.equal(routes.get("eda.pcb_Document.save")?.some(route => route.selector.startsWith("ordinary/")), false);
});

void test("coverage exposes exact current type-1 page opener and seven supported read methods with unclaimed live validation", () => {
  const routes = maintainedApiCoverageRoutes();
  const opening = routes.get("eda.dmt_EditorControl.openDocument")?.find(route => route.selector === "schematic-page-open/open");
  assert.ok(opening); assert.deepEqual(opening.documentTypes, [1]); assert.match(opening.scope, /physical process authority/u);
  assert.match(opening.scope, /automatic persistence\/Save/u); assert.ok(opening.source.includes("current-schematic-page-opening-checkpoint.ts"));
  for (const method of ["eda.sch_PrimitiveText.get", "eda.sch_PrimitiveText.getAll", "eda.sch_PrimitiveWire.get", "eda.sch_PrimitiveWire.getAll",
    "eda.sch_PrimitiveBus.get", "eda.sch_PrimitiveBus.getAll", "eda.sch_SelectControl.getSelectedPrimitives"]) {
    const route = routes.get(method)?.find(value => value.selector === "schematic-page-read"); assert.ok(route);
    assert.deepEqual(route.documentTypes, [1]); assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.match(route.scope, /Unknown, inherited, missing or unsupported/u);
  }
  assert.equal(routes.get("eda.sch_PrimitivePin.get")?.some(route => route.selector === "schematic-page-read") ?? false, false);
  assert.equal(routes.get("eda.sch_PrimitiveComponent.get")?.some(route => route.selector === "schematic-page-read") ?? false, false);
});
