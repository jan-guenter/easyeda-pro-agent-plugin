import assert from "node:assert/strict";
import { test } from "node:test";

import { compileLibraryOperation } from "../src/library-operations.ts";
import { listLibraryExecutionCapabilities } from "../src/library-execution.ts";
import { queryOperationCatalog } from "../src/operation-catalog.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind, libraryExportRefusalReason } from "../src/library-runtime.ts";

const base = { id: "disposable-export", fileName: "disposable", maxBytes: 1024 };
const hiddenSaveExports = [
  { ...base, action: "export.schematic.netlist", fileType: "JLCEDA" },
  { ...base, action: "export.pcb.netlist", fileType: "JLCEDA" },
  { ...base, action: "export.schematic.bom", fileType: "csv" },
  { ...base, action: "export.pcb.bom", fileType: "csv" },
  { ...base, action: "export.schematic.document", fileType: "PDF", object: "Current Schematic Page" },
  { ...base, action: "export.pcb.pdf" },
];

for (const operation of hiddenSaveExports) {
  void test(`hidden-Save export refuses before generating any dispatch code: ${operation.action}`, () => {
    // Discovery/compilation describes the API, but cannot grant execution.
    assert.equal(compileLibraryOperation(operation).scope, "export");
    assert.match(libraryExportRefusalReason(operation.action) ?? "", /SaveAll/u);
    assert.throws(() => libraryExecutionKind(operation), /SaveAll/u);
    assert.throws(() => buildLibraryExecutionExpression(operation), /SaveAll/u);
    const descriptor = listLibraryExecutionCapabilities().find((entry) => entry["action"] === operation.action);
    assert.ok(descriptor);
    assert.equal(descriptor["status"], "unavailable-installed-export-side-effect-or-editor-contract");
    assert.equal(descriptor["executionRefusal"], libraryExportRefusalReason(operation.action));
    const catalog = queryOperationCatalog({ family: "library", operationAction: operation.action });
    assert.ok(JSON.stringify(catalog["entries"]).includes("SaveAll"));
  });
}

void test("simulation-netlist export is not advertised as executable in ordinary editor contexts", () => {
  const operation = { ...base, action: "export.schematic.simulation" };
  assert.equal(compileLibraryOperation(operation).scope, "export");
  assert.throws(() => libraryExecutionKind(operation), /NGSPICE/u);
  assert.throws(() => buildLibraryExecutionExpression(operation), /NGSPICE/u);
});

void test("export refusals do not disable separately admitted file transfer or metadata reads", () => {
  const operation = { ...base, action: "export.pcb.dsn" };
  assert.equal(libraryExportRefusalReason(operation.action), undefined);
  assert.equal(libraryExecutionKind(operation), "file-export");
  assert.ok(buildLibraryExecutionExpression(operation).includes("getDsnFile"));
  assert.equal(libraryExecutionKind({ id: "read", action: "library.footprint.get", libraryUuid: "project", target: { uuid: "footprint" } }), "metadata-read");
});
