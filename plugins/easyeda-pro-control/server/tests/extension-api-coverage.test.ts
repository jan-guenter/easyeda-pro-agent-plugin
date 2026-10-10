import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { extensionApiCoverageQuerySchema, extensionApiCoverageSummary, inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { queryOperationCatalog } from "../src/operation-catalog.ts";
import { queryPublicSdkReads } from "../src/public-sdk-catalog.ts";
import { isRecord } from "../src/core.ts";

void test("coverage enumerates every distinct mounted method and retains every overload in both pinned snapshots", () => {
  const rows = inventoryExtensionApiCoverage();
  const expected = new Set(extensionApiSnapshots.flatMap((snapshot) => snapshot.namespaces.flatMap((namespace) => namespace.methods.map((method) => `eda.${namespace.name}.${method.name}`))));
  assert.equal(expected.size, 774);
  assert.equal(rows.length, expected.size);
  assert.deepEqual(new Set(rows.map((row) => row.path)), expected);
  assert.equal(rows.filter((row) => row.reviewedRuntimeDeclaration).length, 697);
  assert.equal(rows.filter((row) => row.declarations.some((declaration) => declaration.reference === "official-latest")).length, 773);
  assert.equal(rows.reduce((count, row) => count + row.declarations.length, 0), 749 + 806);
  for (const row of rows) {
    assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.equal(row.completeDeclaredContractSupported, false);
    if (row.status === "omitted") {
      assert.equal(row.routes.length, 0);
      assert.ok(row.omission !== null);
      assert.notEqual(row.omission.reason, "");
      assert.ok(row.omission.nextRequirement);
      assert.ok(row.omission.code);
    } else {
      assert.ok(row.routes.length > 0);
      assert.equal(row.omission, null);
    }
  }
});

void test("coverage does not promote schema-only, native equivalent, stub, latest-only or historical evidence to public execution", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.status, "implemented-but-blocked");
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.routes[0]?.implementation, "native-task-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.lib_Symbol.create")?.status, "omitted");
  assert.equal(rows.get("eda.dmt_Project.createProject")?.status, "omitted");
  assert.equal(rows.get("eda.sch_PrimitiveBus.create")?.status, "omitted");
  assert.equal(rows.get("eda.pcb_Document.save")?.status, "internal-lifecycle-only");
  assert.equal(rows.get("eda.pcb_Layer.getCurrentLayer")?.omission?.code, "reviewed-native-stub");
  assert.equal(rows.get("eda.sch_PrimitiveText.getAllPrimitiveId")?.omission?.code, "lossy-or-unawaited-public-reader");
  assert.equal(rows.get("eda.sys_Help.help")?.omission?.code, "not-in-reviewed-runtime");
  assert.equal(rows.get("eda.pcb_ManufactureData.placePcbOrder")?.omission?.code, "external-commercial-action");
  assert.equal(rows.get("eda.sys_MessageBus.rpcCall")?.omission?.code, "unrestricted-transport-or-service");
});

void test("topology-dependent schematic routes are blocked without disabling independent symbol and PCB routes", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const path of ["eda.sch_PrimitiveComponent.create", "eda.sch_PrimitiveComponent.modify", "eda.sch_PrimitiveComponent.delete",
    "eda.sch_PrimitiveWire.create", "eda.sch_PrimitiveWire.modify", "eda.sch_PrimitiveWire.delete", "eda.sch_PrimitiveAttribute.createNetLabel", "eda.sch_PrimitiveComponent.createNetFlag"]) {
    const row = rows.get(path); assert.ok(row);
    assert.equal(row.status, "implemented-but-blocked");
    for (const route of row.routes) {
      assert.equal(route.executionState, "blocked"); assert.deepEqual(route.blockedDocumentTypes, [1]);
      assert.match(route.blockedReason ?? "", /SaveAll/u); assert.ok(route.source.includes("design-topology.ts"));
    }
  }
  const pinRoutes = rows.get("eda.sch_PrimitivePin.modify")?.routes; assert.ok(pinRoutes);
  assert.equal(pinRoutes.find((route) => route.selector.includes("documentType=2"))?.executionState, "available-with-runtime-guards");
  assert.equal(pinRoutes.find((route) => route.selector === "sch.component-pin.no-connect")?.executionState, "blocked");
  assert.equal(rows.get("eda.pcb_PrimitiveLine.create")?.routes[0]?.executionState, "available-with-runtime-guards");
  assert.equal(rows.get("eda.sch_Document.save")?.routes[0]?.executionState, "partially-blocked");
  assert.deepEqual(rows.get("eda.sch_Document.save")?.routes[0]?.blockedDocumentTypes, [1]);
  const compact = queryExtensionApiCoverage({ search: "eda.sch_PrimitiveWire.modify" })["entries"];
  assert.ok(Array.isArray(compact) && isRecord(compact[0]));
  assert.ok(JSON.stringify(compact).includes("blockedReason"));
});

void test("hidden Save and unsupported-editor exports have no callable route", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const path of ["eda.sch_ManufactureData.getNetlistFile", "eda.sch_ManufactureData.getBomFile", "eda.sch_ManufactureData.getExportDocumentFile",
    "eda.pcb_ManufactureData.getBomFile", "eda.pcb_ManufactureData.getPdfFile", "eda.pcb_ManufactureData.getNetlistFile"]) {
    assert.equal(rows.get(path)?.status, "omitted");
    assert.equal(rows.get(path)?.omission?.code, path === "eda.sch_ManufactureData.getNetlistFile" ? "implicit-annotation-and-save-all" : "implicit-save-before-export");
  }
  assert.equal(rows.get("eda.sch_ManufactureData.getSimulationNetlistFile")?.omission?.code, "simulation-editor-not-admitted");
  assert.match(rows.get("eda.pcb_Net.getNetlist")?.omission?.nextRequirement ?? "", /also refused/u);
});

void test("every maintained execution link names real source and regression evidence", async () => {
  const paths = new Set<string>();
  for (const row of inventoryExtensionApiCoverage()) {
    for (const route of row.routes) {
      assert.ok(route.source.length > 0);
      assert.ok(route.tests.length > 0);
      for (const source of route.source) { paths.add(resolve(import.meta.dirname, "../src", source)); }
      for (const source of route.tests) { paths.add(resolve(import.meta.dirname, source)); }
      if (route.tool === "easyeda_control_sdk_read") {
        assert.ok(row.reviewedRuntimeDeclaration);
        assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "sdk-reads", query: { method: row.path, includeSchemas: true } } } });
      }
    }
  }
  await Promise.all([...paths].map(async (path) => { await access(path); }));
});

void test("coverage queries reject unknown selectors and never accept caller code or method invocation arguments", () => {
  for (const input of [null, [], { reference: "runtime" }, { method: "eda.sys_MessageBus.rpcCall", args: [] }, { script: "run()" }, { limit: "25" },
    { limit: 101 }, { offset: -1 }, { search: "" }, { search: "x".repeat(129) }, { namespace: "sys_Window.constructor" }, { status: "validated" },
    JSON.parse('{"__proto__":{"polluted":true}}') as unknown]) {
    assert.equal(extensionApiCoverageQuerySchema.safeParse(input).success, false);
  }
  assert.throws(() => queryExtensionApiCoverage({ namespace: "sys_Missing" }), /Unknown/u);
  assert.deepEqual(queryExtensionApiCoverage({ search: "[.*]+" })["entries"], []);
});

void test("every coverage input-discovery request resolves to an actual strict argument schema", () => {
  const requests = new Map<string, unknown>();
  for (const row of inventoryExtensionApiCoverage()) {
    for (const route of row.routes) {
      const discovery = route.inputDiscovery;
      if (discovery !== undefined) { requests.set(JSON.stringify(discovery.arguments), discovery.arguments["request"]); }
    }
  }
  assert.ok(requests.size > 100);
  for (const request of requests.values()) {
    assert.ok(isRecord(request));
    const result = request["action"] === "operations" ? queryOperationCatalog(request["query"]) : queryPublicSdkReads(request["query"]);
    const entries = result["entries"];
    assert.ok(Array.isArray(entries));
    assert.ok(entries.length > 0);
    const first: unknown = entries[0];
    assert.ok(isRecord(first) && isRecord(first["inputSchema"]));
  }
});

void test("coverage pages are deterministic, bounded, complete and return isolated data", () => {
  const expected = inventoryExtensionApiCoverage();
  let offset = 0;
  const collected: unknown[] = [];
  do {
    const result = queryExtensionApiCoverage({ limit: 100, offset, detail: true });
    assert.equal(result["offline"], true);
    assert.equal(result["invocationEnabled"], false);
    assert.ok(Buffer.byteLength(JSON.stringify(result), "utf8") <= 65_536);
    const entries: unknown = result["entries"], page: unknown = result["page"];
    assert.ok(Array.isArray(entries));
    assert.ok(entries.length > 0);
    const values: unknown[] = entries;
    collected.push(...values);
    assert.ok(typeof page === "object" && page !== null && "nextOffset" in page);
    if (page.nextOffset === null) { break; }
    assert.ok(typeof page.nextOffset === "number" && page.nextOffset > offset);
    offset = page.nextOffset;
  } while (offset < 10_000);
  assert.deepEqual(collected, expected);
  const first = expected[0];
  assert.ok(first);
  Object.assign(first, { status: "forged" });
  assert.notDeepEqual(inventoryExtensionApiCoverage()[0], first);
});

void test("committed machine-readable inventory matches current declarations, routes and omission policy exactly", async () => {
  const entries = inventoryExtensionApiCoverage();
  const expected = { schema: "easyeda-pro-control.extension-api-coverage-inventory.v1", scope: "offline-implementation-inventory;not-execution-authority", summary: extensionApiCoverageSummary(entries), entries };
  const actual: unknown = JSON.parse(await readFile(resolve(import.meta.dirname, "../../api-coverage.json"), "utf8"));
  assert.deepEqual(actual, expected);
});
