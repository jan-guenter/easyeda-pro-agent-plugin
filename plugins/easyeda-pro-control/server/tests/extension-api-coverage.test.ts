import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { extensionApiCoverageQuerySchema, extensionApiCoverageSummary, inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { queryOperationCatalog, validateCatalogOperation } from "../src/operation-catalog.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { isRecord } from "../src/core.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";


void test("all eight legacy project-structure writer routes remain blocked without removing argument discovery", () => {
  const mappings = [
    ["eda.lib_Symbol.create", "library.symbol.create"], ["eda.lib_Symbol.modify", "library.symbol.modify"],
    ["eda.dmt_Schematic.createSchematicPage", "document.page.create"], ["eda.dmt_Schematic.modifySchematicPageName", "document.page.rename"],
    ["eda.dmt_Pcb.createPcb", "document.pcb.create"], ["eda.dmt_Pcb.modifyPcbName", "document.pcb.rename"],
    ["eda.dmt_Schematic.createSchematic", "document.schematic.create"], ["eda.dmt_Schematic.modifySchematicName", "document.schematic.rename"],
  ] as const;
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const [path, action] of mappings) {
    const row = rows.get(path); assert.ok(row);
    const hasSeparateRoute = path === "eda.lib_Symbol.modify" || path === "eda.dmt_Pcb.modifyPcbName" || path === "eda.dmt_Schematic.modifySchematicName";
    assert.equal(row.status, hasSeparateRoute ? "implemented-native-equivalent" : "implemented-but-blocked"); assert.equal(row.omission, null);
    assert.equal(row.routes.length, 1 + Number(hasSeparateRoute) + Number(path === "eda.dmt_Schematic.modifySchematicName"));
    const route = row.routes.find((candidate) => candidate.selector === action); assert.ok(route);
    assert.equal(route.selector, action); assert.equal(route.tool, "easyeda_control_library");
    assert.equal(route.executionState, "blocked");
    assert.match(route.blockedReason ?? "", /operation-owned completion.*project_structures.*complete SQLite effect/u);
    assert.match(route.blockedReason ?? "", /task1.*pending timer\/task2/u);
    assert.ok(route.source.includes("library-execution-lifecycle.ts"));
    const discovery = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(discovery));
    const catalog = queryOperationCatalog(discovery["query"]);
    assert.equal(catalog["offline"], true); assert.equal(catalog["executionAuthorized"], false);
    const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
    const entry: unknown = entries[0]; assert.ok(isRecord(entry));
    assert.equal(entry["action"], action); assert.ok(isRecord(entry["inputSchema"]));
    const compact = queryExtensionApiCoverage({ search: path, status: row.status });
    assert.ok(JSON.stringify(compact).includes(route.blockedReason ?? "missing refusal"));
  }
  for (const path of ["eda.lib_Symbol.get", "eda.lib_Footprint.get", "eda.lib_Device.get", "eda.lib_3DModel.get",
    "eda.lib_Footprint.create", "eda.lib_Footprint.modify", "eda.lib_Device.create", "eda.lib_Device.modify"]) {
    const row = rows.get(path); assert.ok(row); assert.notEqual(row.status, "implemented-but-blocked");
    for (const route of row.routes) {
      if (route.tool === "easyeda_control_catalog_footprint" || route.tool === "easyeda_control_catalog_components") {
        assert.equal(route.implementation, "vendor-http-task-equivalent");
        assert.equal(route.executionState, "available-with-network-guards");
      } else { assert.equal(route.executionState, "available-with-runtime-guards"); }
      assert.equal(route.blockedReason, undefined);
      assert.equal(route.source.includes("library-execution-lifecycle.ts"), false);
    }
  }
});


void test("209 disposable opening coverage discovers native owner stages without promoting completion or writer authority", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const [path, action] of [["eda.dmt_Project.openProject", "open-project"], ["eda.dmt_EditorControl.openDocument", "open-pcb"]] as const) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb209_opening"); assert.ok(route);
    assert.equal(route.selector, action); assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.deepEqual(route.documentTypes, [3]);
    for (const required of ["installed209 validation-only", "not public SDK execution", "registered disposable project/checkpoint",
      "automatic Save", "not unchanged-storage proof", "do not prove startup completion", "persistence or writer authority", "without replay"]) {
      assert.ok(route.scope.includes(required));
    }
    assert.ok(row.routes.some(entry => entry.tool === "easyeda_control_project_open"));
    assert.ok(route.inputDiscovery);
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"]));
    assert.equal(discovery.offline, true); assert.ok(isRecord(discovery.result));
    assert.equal(discovery.result["tool"], "easyeda_control_pcb209_opening");
    for (const flag of ["connectedValidation", "startupCompletionVerified", "completeLiveBaselineVerified", "executionAuthorized", "saveAuthorized"]) {
      assert.equal(discovery.result[flag], false);
    }
    const actions = discovery.result["actions"]; assert.ok(Array.isArray(actions)); assert.ok(actions.includes(action));
    assert.equal(actions.includes("worker-startup"), false); assert.equal(actions.includes("observe-model-state"), false);
  }
});

void test("209 layer coverage retains original-owner observation without admitting general PCB methods", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const path of ["eda.pcb_Layer.getAllLayers", "eda.pcb_Layer.getTheNumberOfCopperLayers"]) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb209_opening"); assert.ok(route);
    assert.equal(route.selector, "observe-layers"); assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.completeDeclaredContractSupported, false); assert.deepEqual(route.documentTypes, [3]);
    for (const required of ["two complete matching", "512 layers", "65536 native", "SIGNAL/PLANE", "physical stackup", "writer/Save authority"]) {
      assert.ok(route.scope.includes(required));
    }
    assert.ok(route.inputDiscovery);
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"]));
    assert.ok(isRecord(discovery.result)); assert.equal(discovery.result["connectedValidation"], false);
    const actions = discovery.result["actions"]; assert.ok(Array.isArray(actions)); assert.ok(actions.includes("observe-layers"));
  }
  const unsupported = rows.find(entry => entry.path === "eda.pcb_Layer.getCurrentLayer"); assert.ok(unsupported);
  assert.equal(unsupported.routes.some(entry => entry.tool === "easyeda_control_pcb209_opening"), false);
});

void test("209 primitive coverage adds exactly eight bounded native subsets while retaining separate legacy routes", () => {
  const rows = inventoryExtensionApiCoverage();
  const expected = ["Line", "Arc", "Via", "String"].flatMap(family =>
    ["getAll", "getAllPrimitiveId"].map(method => `eda.pcb_Primitive${family}.${method}`));
  const selected = rows.filter(row => row.routes.some(route => route.tool === "easyeda_control_pcb209_opening" && route.selector === "observe-primitives"));
  assert.deepEqual(selected.map(row => row.path).toSorted(), expected.toSorted());
  for (const row of selected) {
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb209_opening"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, [3]);
    assert.ok(row.routes.some(entry => entry.tool === "easyeda_control_sdk_read"));
    assert.ok(row.routes.some(entry => entry.tool === (row.method === "getAll" ? "easyeda_control_pcb_geometry" : "easyeda_control_pcb_identities")));
    for (const required of ["installed209 disposable original-owner", "not public SDK execution or instance parity", "existing stateWatcher views",
      "empty results do not prove an empty PCB", "aggregate393216-byte", "at most256 rows", "sequential, not atomic",
      "null versus empty string", "without partial output", "writer/Save authority", "legacy206 owners cannot select"]) {
      assert.ok(route.scope.includes(required), `${row.path}: ${required}`);
    }
    for (const file of ["current-pcb-209-primitives.ts", "current-pcb-diagnostic-owner.ts", "current-pcb-diagnostic-protocol.ts",
      "current-pcb-diagnostic-lifecycle-journal.ts", "../../scripts/pcb-diagnostic-owner.ps1"]) { assert.ok(route.source.includes(file)); }
    assert.ok(route.inputDiscovery); const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"]));
    assert.ok(isRecord(discovery.result)); assert.equal(discovery.result["connectedValidation"], false); assert.equal(discovery.result["executionAuthorized"], false);
    const actions = discovery.result["actions"]; assert.ok(Array.isArray(actions)); assert.ok(actions.includes("observe-primitives"));
  }
  for (const path of ["eda.pcb_PrimitiveLine.get",
    "eda.pcb_SelectControl.getSelectedPrimitives", "eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId", "eda.pcb_PrimitiveLine.create"]) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.routes.some(entry => entry.tool === "easyeda_control_pcb209_opening"), false);
  }
});

void test("209 extended collection coverage adds ten scoped routes without enabling filters or writers", () => {
  const rows = inventoryExtensionApiCoverage();
  const families = ["Component", "Pad", "Attribute", "Dimension", "Image"];
  const expected = families.flatMap(family => ["getAll", "getAllPrimitiveId"].map(method => `eda.pcb_Primitive${family}.${method}`));
  const selected = rows.filter(row => row.routes.some(route => route.tool === "easyeda_control_pcb209_opening" && route.selector === "observe-extended-primitives"));
  assert.deepEqual(selected.map(row => row.path).toSorted(), expected.toSorted());
  for (const row of selected) {
    const route = row.routes.find(entry => entry.selector === "observe-extended-primitives"); assert.ok(route);
    assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.equal(route.executionState, "available-with-runtime-guards");
    assert.deepEqual(route.documentTypes, [3]);
    assert.ok(route.inputDiscovery);
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"]));
    assert.ok(isRecord(discovery.result)); assert.equal(discovery.result["executionAuthorized"], false);
    const actions = discovery.result["actions"]; assert.ok(Array.isArray(actions)); assert.ok(actions.includes("observe-extended-primitives"));
  }
  for (const family of families) {
    const row = rows.find(entry => entry.path === `eda.pcb_Primitive${family}.get`); assert.ok(row);
    assert.equal(row.routes.some(route => route.tool === "easyeda_control_pcb209_opening"), false);
  }
});

void test("project board coverage exposes bounded observed metadata without public parity or writer authority", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const path of ["eda.dmt_Board.getBoardInfo", "eda.dmt_Board.getAllBoardsInfo"]) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_project_board"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.equal(route.documentTypes, undefined);
    for (const required of ["complete bounded native board", "before selected filtering", "128 boards", "65536 UTF-8 bytes", "No public IDMT_BoardItem parity", "writer authority"]) {
      assert.ok(route.scope.includes(required));
    }
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "project-board", query: { includeSchemas: true } } } });
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments.request));
    assert.equal(discovery.offline, true); const result = discovery.result; assert.ok(isRecord(result));
    assert.equal(result["total"], 2); assert.equal(result["invocationEnabledByDiscovery"], false);
  }
});

void test("project schematic coverage exposes only complete observed metadata and child rosters", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const path of ["eda.dmt_Schematic.getSchematicInfo", "eda.dmt_Schematic.getAllSchematicsInfo", "eda.dmt_Schematic.getSchematicPageInfo", "eda.dmt_Schematic.getAllSchematicPagesInfo"]) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_project_schematic"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, [1]);
    for (const required of ["complete bounded schematic and sheet", "before selected filtering", "No public object parity", "writer authority", "No canvas/source loading"]) {
      assert.ok(route.scope.includes(required));
    }
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "project-schematic", query: { includeSchemas: true } } } });
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments.request));
    assert.equal(discovery.offline, true); const result = discovery.result; assert.ok(isRecord(result));
    assert.equal(result["total"], 4); assert.equal(result["invocationEnabledByDiscovery"], false);
  }
});

void test("project PCB coverage exposes selected metadata and bounded complete inventory without writer authority", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const path of ["eda.dmt_Pcb.getPcbInfo", "eda.dmt_Pcb.getAllPcbsInfo"]) {
    const row = rows.find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_project_pcb"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, [3]);
    for (const required of ["complete key/value metadata map", "genuine empty maps", "128 PCBs", "after native enumeration", "No public-wrapper parity", "writer authority"]) {
      assert.ok(route.scope.includes(required));
    }
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "project-pcb", query: { includeSchemas: true } } } });
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments.request));
    assert.equal(discovery.offline, true); const result = discovery.result; assert.ok(isRecord(result));
    assert.equal(result["total"], 2); assert.equal(result["invocationEnabledByDiscovery"], false);
  }
});

void test("ordinary symbol coverage exposes its bounded forward-only history profiles without promoting legacy writes or live evidence", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.lib_Symbol.modify"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
  const route = row.routes.find((entry) => entry.tool === "easyeda_control_project_symbol_metadata"); assert.ok(route);
  assert.equal(route.selector, "metadata-advance;forward-only-unused-meta-or-canvas-segments-symbol"); assert.equal(route.executionState, "available-with-runtime-guards");
  assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.deepEqual(route.documentTypes, [2]);
  for (const required of ["every tombstoned occurrence", "unused project-local symbol", "sealed pre-navigation startup", "reserve one write",
    "final closed SQL equality", "No inverse", "installed101500", "installed123000", "Historical results grant no current-invocation authority",
    "META-only or satisfy the bounded canvas-segments profile", "at most 101 complete chunks", "strictly newer than every target header",
    "Installed080000 passed the ordinary unused canvas-segments forward lifecycle", "classification, otherProperty and geometry changes are unsupported"]) {
    assert.ok(route.scope.includes(required));
  }
  assert.equal(row.routes.find((entry) => entry.selector === "library.symbol.modify")?.executionState, "blocked");
  assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "project-symbol-operation", query: { includeSchemas: true } } } });
  const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments.request));
  assert.equal(discovery.offline, true); const result = discovery.result; assert.ok(isRecord(result));
  assert.equal(result["registrationEnabled"], true); assert.equal(result["executionAuthorized"], false); assert.equal(result["connectedValidation"], false);
  assert.equal(result["historicalConnectedValidation"], "installed123000-ordinary-unused-meta-only-forward-only");
  assert.equal(result["historicalCanvasConnectedValidation"], "installed080000-ordinary-unused-canvas-segments-forward-only");
});

void test("coverage enumerates every distinct mounted method and retains every overload in all three pinned snapshots", () => {
  const rows = inventoryExtensionApiCoverage();
  const expected = new Set(extensionApiSnapshots.flatMap((snapshot) => snapshot.namespaces.flatMap((namespace) => namespace.methods.map((method) => `eda.${namespace.name}.${method.name}`))));
  assert.equal(expected.size, 835);
  assert.equal(rows.length, expected.size);
  assert.deepEqual(new Set(rows.map((row) => row.path)), expected);
  assert.equal(rows.filter((row) => row.reviewedRuntimeDeclaration).length, 697);
  assert.equal(rows.filter((row) => row.declarations.some((declaration) => declaration.reference === "official-latest")).length, 773);
  assert.equal(rows.filter((row) => row.installed209Declaration).length, 811);
  assert.equal(rows.reduce((count, row) => count + row.declarations.length, 0), 749 + 806 + 844);
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

void test("copy coverage exposes only the disposable native subset and preserves live-validation limits", () => {
  const row = inventoryExtensionApiCoverage().find(entry => entry.path === "eda.lib_Symbol.copy"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.routes.length, 1);
  const route = row.routes[0]; assert.ok(route);
  assert.equal(route.tool, "easyeda_control_disposable_symbol_copy"); assert.equal(route.executionState, "available-with-runtime-guards");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, [2]);
  for (const text of ["no generic public lib_Symbol.copy", "original retained disposable opening", "native returned UUID", "unchanged source/peer SQL", "No ordinary projects"]) {
    assert.ok(route.scope.includes(text));
  }
  assert.ok(route.inputDiscovery); const result = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result;
  assert.ok(isRecord(result)); assert.equal(result["connectedValidation"], false); assert.equal(result["ordinaryProjectsSupported"], false);
});

void test("coverage does not promote schema-only, native equivalent, stub, latest-only or historical evidence to public execution", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.status, "implemented-but-blocked");
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.routes[0]?.implementation, "native-task-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveWire.modify")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.lib_Symbol.create")?.status, "implemented-but-blocked");
  const symbolCreate = rows.get("eda.lib_Symbol.create")?.routes[0];
  assert.ok(symbolCreate); assert.equal(symbolCreate.selector, "library.symbol.create");
  assert.deepEqual(symbolCreate.documentTypes, [3]);
  assert.equal(symbolCreate.executionState, "blocked");
  assert.match(symbolCreate.scope, /Permission denial can display a native dialog/u);
  assert.equal(rows.get("eda.lib_Symbol.create")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.lib_Symbol.modify")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.lib_Symbol.modify")?.routes[0]?.selector, "library.symbol.modify");
  assert.equal(rows.get("eda.lib_Symbol.modify")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.dmt_EditorControl.activateDocument")?.status, "implemented-public-subset");
  assert.equal(rows.get("eda.dmt_EditorControl.activateDocument")?.routes.some((route) => route.selector === "document.activate"), true);
  assert.equal(rows.get("eda.dmt_EditorControl.closeDocument")?.status, "implemented-public-subset");
  const close = rows.get("eda.dmt_EditorControl.closeDocument")?.routes.find((route) => route.selector === "document.close");
  assert.ok(close); assert.equal(close.implementation, "public-method"); assert.deepEqual(close.documentTypes, [3, 4]);
  assert.equal(close.executionState, "available-with-runtime-guards"); assert.equal(close.validation, "offline-regression;current-live-unclaimed");
  assert.equal(rows.get("eda.dmt_Schematic.createSchematicPage")?.status, "implemented-but-blocked");
  const create = rows.get("eda.dmt_Schematic.createSchematicPage")?.routes[0];
  assert.ok(create); assert.equal(create.selector, "document.page.create"); assert.equal(create.implementation, "native-task-equivalent");
  assert.deepEqual(create.documentTypes, [1, 3]); assert.equal(create.executionState, "blocked");
  assert.equal(rows.get("eda.dmt_Schematic.createSchematicPage")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.status, "implemented-but-blocked");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.routes[0]?.selector, "document.page.rename");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.dmt_Project.createProject")?.status, "omitted");
  assert.equal(rows.get("eda.sch_PrimitiveBus.create")?.status, "omitted");
  assert.equal(rows.get("eda.pcb_Document.save")?.status, "implemented-but-blocked");
  assert.equal(rows.get("eda.pcb_Layer.getCurrentLayer")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveText.getAllPrimitiveId")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveText.getAllPrimitiveId")?.routes[0]?.implementation, "native-task-equivalent");
  assert.equal(rows.get("eda.sys_Help.help")?.omission?.code, "not-in-reviewed-runtime");
  assert.equal(rows.get("eda.pcb_ManufactureData.placePcbOrder")?.omission?.code, "external-commercial-action");
  assert.equal(rows.get("eda.sys_MessageBus.rpcCall")?.omission?.code, "unrestricted-transport-or-service");
});

void test("PCB rename coverage exposes only its disposable native subset while preserving the blocked generic route", () => {
  const row = inventoryExtensionApiCoverage().find(entry => entry.path === "eda.dmt_Pcb.modifyPcbName"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.routes.length, 2);
  const route = row.routes.find(item => item.tool === "easyeda_control_disposable_pcb_rename"); assert.ok(route);
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.implementation, "native-task-equivalent");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, [3]);
  for (const text of ["not generic public dmt_Pcb.modifyPcbName", "original retained disposable opening", "metadata-only", "No ordinary projects",
    "Installed195000 passed one disposable title-only lifecycle", "Later generations and other project histories remain unvalidated"]) {
    assert.ok(route.scope.includes(text));
  }
  assert.equal(row.routes.find(item => item.tool === "easyeda_control_library")?.executionState, "blocked");
  assert.ok(route.inputDiscovery); const result = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result;
  assert.ok(isRecord(result)); assert.equal(result["connectedValidation"], false); assert.equal(result["executionAuthorized"], false);
  assert.equal(result["historicalConnectedValidation"], "installed195000-disposable-pcb-title-only-lifecycle");
  assert.equal(result["ordinaryProjectsSupported"], false);
});

void test("SCH rename coverage exposes the disposable metadata and child roster lifecycle without generic or live authority", () => {
  const row = inventoryExtensionApiCoverage().find(entry => entry.path === "eda.dmt_Schematic.modifySchematicName"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.routes.length, 3);
  const route = row.routes.find(item => item.tool === "easyeda_control_disposable_schematic_rename"); assert.ok(route);
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.implementation, "native-task-equivalent");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, []);
  assert.match(route.scope, /retained disposable opener/u);
  assert.match(route.scope, /child roster/u);
  assert.match(route.scope, /No explicit Save, inverse, deletion, ordinary-project scope/u);
  assert.equal(row.routes.find(item => item.tool === "easyeda_control_library")?.executionState, "blocked");
  assert.ok(route.inputDiscovery); const result = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result;
  assert.ok(isRecord(result)); assert.equal(result["connectedValidation"], false); assert.equal(result["executionAuthorized"], false);
  assert.equal(result["historicalConnectedValidation"], "installed143713-disposable-schematic-title-only-lifecycle"); assert.equal(result["ordinaryProjectsSupported"], false);
  assert.equal(result["forwardOnly"], true); assert.equal(result["inverseSupported"], false);
});

void test("ordinary-purpose SCH coverage enables narrow ordinary scope after its own historical lifecycle", () => {
  const row = inventoryExtensionApiCoverage().find(entry => entry.path === "eda.dmt_Schematic.modifySchematicName"); assert.ok(row);
  assert.equal(row.routes.length, 3); assert.equal(row.status, "implemented-native-equivalent");
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
  const route = row.routes.find(item => item.tool === "easyeda_control_project_schematic_rename"); assert.ok(route);
  assert.equal(route.selector, "advance;rename-write;ordinary-project-local-schematic-title-forward-only");
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.implementation, "native-task-equivalent");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.deepEqual(route.documentTypes, []);
  for (const restriction of ["ordinary-project SCH-container title lifecycle", "Legacy confirmDisposableProject true is optional",
    "separate disposable route retains its required confirmations", "Before first navigation", "changed closed baseline refuses", "exactly one title write",
    "full closed SQL effect", "final closed SQL equality", "unqualified startup opt-ins cannot supply authority", "Installed203733 passed",
    "Historical validation grants no current-invocation authority", "No complete canvas/connectivity read",
    "explicit Save, inverse, delete, restore or generic writer enablement"]) { assert.ok(route.scope.includes(restriction)); }
  assert.equal(row.routes.find(item => item.tool === "easyeda_control_library")?.executionState, "blocked");
  assert.equal(row.routes.find(item => item.tool === "easyeda_control_disposable_schematic_rename")?.executionState, "available-with-runtime-guards");
  assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: {
    request: { action: "project-schematic-operation", query: { includeSchemas: true } },
  } });
  const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments.request));
  assert.equal(discovery.offline, true); const result = discovery.result; assert.ok(isRecord(result));
  assert.equal(result["tool"], "easyeda_control_project_schematic_rename"); assert.equal(result["purpose"], "ordinary-schematic-rename");
  assert.equal(result["registrationEnabled"], true); assert.equal(result["validationOnly"], false); assert.equal(result["forwardOnly"], true);
  assert.equal(result["ordinaryProjectsSupported"], true);
  for (const key of ["connectedValidation", "executionAuthorized", "invocationEnabledByDiscovery",
    "inverseSupported", "replayAllowed", "explicitSaveDispatched"]) { assert.equal(result[key], false); }
  assert.equal(result["historicalConnectedValidation"], "installed203733-ordinary-schematic-title-only-lifecycle");
  assert.ok(isRecord(result["inputSchema"]));
});

void test("topology restrictions remain documented beneath the broader schematic, symbol and PCB lifecycle refusal", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const path of ["eda.sch_PrimitiveComponent.create", "eda.sch_PrimitiveComponent.modify", "eda.sch_PrimitiveComponent.delete",
    "eda.sch_PrimitiveWire.create", "eda.sch_PrimitiveWire.modify", "eda.sch_PrimitiveWire.delete", "eda.sch_PrimitiveAttribute.createNetLabel", "eda.sch_PrimitiveComponent.createNetFlag"]) {
    const row = rows.get(path); assert.ok(row);
    assert.equal(row.status, "implemented-but-blocked");
    const genericRoutes = row.routes.filter((route) => !route.selector.includes("sealed-profile="));
    assert.ok(genericRoutes.length > 0);
    for (const route of genericRoutes) {
      assert.equal(route.executionState, "blocked"); assert.deepEqual(route.blockedDocumentTypes, [1]);
      assert.match(route.blockedReason ?? "", /SaveAll/u); assert.ok(route.source.includes("design-topology.ts"));
    }
  }
  const pinRoutes = rows.get("eda.sch_PrimitivePin.modify")?.routes; assert.ok(pinRoutes);
  assert.equal(pinRoutes.find((route) => route.selector.includes("documentType=2"))?.executionState, "blocked");
  assert.equal(pinRoutes.find((route) => route.selector === "sch.component-pin.no-connect")?.executionState, "blocked");
  assert.equal(rows.get("eda.pcb_PrimitiveLine.create")?.routes[0]?.executionState, "blocked");
  const genericSave = rows.get("eda.sch_Document.save")?.routes.find((route) => route.selector === "execute/commit");
  assert.equal(genericSave?.executionState, "blocked");
  assert.deepEqual(genericSave?.blockedDocumentTypes, [1]);
  const compact = queryExtensionApiCoverage({ search: "eda.sch_PrimitiveWire.modify" })["entries"];
  assert.ok(Array.isArray(compact) && isRecord(compact[0]));
  assert.ok(JSON.stringify(compact).includes("blockedReason"));
});

void test("sealed wire coverage retains endpoint and no-repeat Save source contracts while execution is blocked", () => {
  const profile = "easyeda-pro-control.flat-wire-reroute.v1";
  const admitted = inventoryExtensionApiCoverage().flatMap((row) => row.routes
    .filter((route) => route.selector.includes(`sealed-profile=${profile}`)).map((route) => ({ row, route })));
  assert.deepEqual(admitted.map(({ row }) => row.path).toSorted(), ["eda.sch_Document.save", "eda.sch_PrimitiveWire.modify"]);
  for (const { row, route } of admitted) {
    assert.deepEqual(route.documentTypes, [1]); assert.equal(route.executionState, "blocked");
    assert.equal(route.blockedReason, DESIGN_STRUCTURE_LIFECYCLE_REFUSAL); assert.deepEqual(route.blockedDocumentTypes, [1]);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.ok(route.source.includes("flat-wire-markers.ts")); assert.ok(route.tests.includes("flat-wire-lifecycle.test.ts"));
    assert.match(route.scope, /contact-incidence multiset/u); assert.match(route.scope, /fresh unchanged durable baseline/u);
    assert.match(route.scope, /refuses shared-WIRE endpoints and pin-bearing junctions/u);
    assert.match(route.scope, /no caller override or historical journal migration/u);
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: {
      action: "operations", query: { family: "design", operationAction: "sch.wire.modify", includeSchemas: true },
    } } });
    assert.equal(route.implementation, row.path === "eda.sch_Document.save" ? "internal-lifecycle-only" : "native-task-equivalent");
  }
});

void test("sealed flat display coverage retains its source contracts without a lifecycle exception", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const profile of ["easyeda-pro-control.flat-display-transaction.v1", "easyeda-pro-control.flat-display-transaction.v2"]) {
  const admitted = rows.flatMap((row) => row.routes.filter((route) => route.selector.includes(`sealed-profile=${profile}`)).map((route) => ({ path: row.path, row, route })));
  assert.deepEqual(admitted.map(({ path }) => path).toSorted(), ["eda.sch_Document.save", "eda.sch_PrimitiveAttribute.modify", "eda.sch_PrimitiveText.modify"]);
  for (const { path, row, route } of admitted) {
    assert.equal(route.tool, "easyeda_control_design"); assert.deepEqual(route.documentTypes, [1]);
    assert.equal(route.executionState, "blocked"); assert.equal(route.blockedReason, DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
    assert.deepEqual(route.blockedDocumentTypes, [1]); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(route.source.includes("flat-display-profile.ts")); assert.ok(route.source.includes("flat-display-runtime.ts"));
    assert.ok(route.tests.includes("flat-display-execution.test.ts")); assert.match(route.scope, /current-generation live validation remains unclaimed/u);
    assert.match(route.scope, /Offline synthetic coordinator and runtime regression evidence only/u);
    if (profile.endsWith(".v2")) {
      for (const source of ["native-history.ts", "native-atom-header-history.ts", "native-library-header-evidence.ts", "flat-display-library-peers.ts", "flat-display-storage.ts", "recovery-navigation.ts"]) {
        assert.ok(route.source.includes(source));
      }
      for (const regression of ["native-history-first-ticket.test.ts", "native-history-first-ticket-adversarial.test.ts", "flat-display-imported-peer-adversarial.test.ts", "flat-display-imported-lifecycle.test.ts", "recovery-navigation-capture.test.ts"]) {
        assert.ok(route.tests.includes(regression));
      }
      assert.match(route.scope, /only unchanged imported SYMBOL\/FOOTPRINT peers/u);
      assert.match(route.scope, /rereads the sealed original immutable checkpoint/u);
      assert.match(route.scope, /No library write, history compaction/u);
    } else { assert.match(route.scope, /V1 continues to refuse imported firstTicket provenance/u); }
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "operations", query: { family: "design", operationAction: "sch.layout.batch", includeSchemas: true } } } });
    if (path === "eda.sch_Document.save") {
      assert.equal(route.implementation, "internal-lifecycle-only"); assert.equal(route.selector, `execute/commit;sealed-profile=${profile}`);
      assert.match(route.scope, /No standalone Save, generic schematic commit/u);
      assert.ok(route.source.includes("design-save-attempt.ts"));
    } else {
      const step = path === "eda.sch_PrimitiveAttribute.modify" ? "sch.attribute.display" : "sch.text.display";
      assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.selector, `sch.layout.batch;sealed-profile=${profile};step=${step}`);
      assert.match(route.scope, /no text-content or attribute-value edits, pin\/net or NO_CONNECT changes, component translation, creation, deletion, mixed layout/u);
      assert.match(route.scope, /no caller-supplied profile or topology grants authority/u);
      assert.equal(row.routes.find((entry) => entry.selector.includes("documentType=2"))?.executionState, "blocked");
    }
  }
  }
  assert.equal(rows.find((row) => row.path === "eda.sch_PrimitiveComponent.createNetFlag")?.routes.every((route) => route.executionState === "blocked"), true);
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

void test("NetGroup and filtered PCB membership reads expose narrow native routes without claiming public parity", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const family of ["Bus", "Wire"]) {
    for (const method of ["get", "getAll"]) {
      const path = `eda.sch_Primitive${family}.${method}`, row = rows.get(path); assert.ok(row);
      assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
      assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
      assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
      const route = row.routes[0]; assert.ok(route);
      assert.equal(route.tool, "easyeda_control_sdk_read"); assert.equal(route.selector, path);
      assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [1]);
      assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
      assert.deepEqual(route.source, ["schematic-netgroup-read.ts"]); assert.deepEqual(route.tests, ["schematic-netgroup-read.test.ts"]);
      assert.match(route.scope, /not public SDK getter parity/u); assert.match(route.scope, /net filters refuse/u);
      assert.match(route.scope, /nullable color\/width\/strokeStyle/u); assert.match(route.scope, /literal value/u);
    }
  }
  const net = rows.get("eda.pcb_Net.getAllPrimitivesByNet"); assert.ok(net);
  assert.equal(net.status, "implemented-native-equivalent"); assert.equal(net.omission, null);
  assert.equal(net.completeDeclaredContractSupported, false); assert.equal(net.currentGenerationLiveValidation, "not-recorded");
  assert.equal(net.runtimeAdmission, "not-granted-by-inventory"); assert.equal(net.routes.length, 1);
  const route = net.routes[0]; assert.ok(route);
  assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
  assert.deepEqual(route.source, ["pcb-net-membership-read.ts"]); assert.deepEqual(route.tests, ["pcb-net-membership.test.ts"]);
  assert.match(route.scope, /not public primitive instances/u); assert.match(route.scope, /explicit nonempty unique filters/u);
  assert.match(route.scope, /source\/inventory\/source/u);
  assert.deepEqual(extensionApiCoverageSummary()["statuses"], {
    "implemented-public-subset": 213, "implemented-native-equivalent": 34, "implemented-vendor-http-equivalent": 3, "internal-lifecycle-only": 0, "implemented-but-blocked": 79, omitted: 506,
  });
});

void test("explicit-ID PCB object coverage advertises complete narrowed source DTOs instead of public stubs", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const name of ["getPrimitiveByPrimitiveId", "getPrimitivesByPrimitiveId"]) {
    const row = rows.get(`eda.pcb_Primitive.${name}`); assert.ok(row);
    assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.routes.length, 1); const route = row.routes[0]; assert.ok(route);
    assert.deepEqual(route.documentTypes, [3]); assert.equal(route.implementation, "native-task-equivalent");
    assert.deepEqual(route.source, ["pcb-source-objects-read.ts"]); assert.deepEqual(route.tests, ["pcb-source-objects-read.test.ts"]);
    assert.match(route.scope, /Missing IDs refuse/u); assert.match(route.scope, /No selection RPC/u);
    assert.match(route.scope, /not public primitive instances/u); assert.match(route.scope, /1–256 unique IDs/u);
  }
});

void test("current PCB String coverage exposes bounded parentless-view read equivalents without writer authority", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const method of ["get", "getAll", "getAllPrimitiveId"]) {
    const entry = rows.get(`eda.pcb_PrimitiveString.${method}`); assert.ok(entry);
    const identitiesOnly = method === "getAllPrimitiveId";
    const route = entry.routes.find((candidate) => candidate.tool === (identitiesOnly ? "easyeda_control_pcb_identities" : "easyeda_control_pcb_geometry"));
    assert.ok(route); assert.equal(route.implementation, "native-task-equivalent");
    assert.deepEqual(route.documentTypes, [3]); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(entry.completeDeclaredContractSupported, false); assert.equal(entry.currentGenerationLiveValidation, "not-recorded");
    for (const text of ["two complete matching ordered samples", "excludes parented views", "No complete source ownership", "no public wrapper or SDK constructor"]) {
      assert.ok(route.scope.includes(text));
    }
    if (identitiesOnly) { assert.match(route.scope, /Only globalIndex/u); assert.match(route.scope, /Line\/Arc\/Via only/u); }
    else {
      for (const text of ["distances multiply by10 to mil", "rotation multiplies by180 then divides by Math.PI", "No defaults/coercion", "Full-family bounds/stability"]) {
        assert.ok(route.scope.includes(text));
      }
      if (method === "get") { assert.match(route.scope, /refuses any unavailable ID/u); }
    }
  }
});
void test("five reviewed empty or constant-false methods remain omitted with concrete implementation reasons", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const path of ["sch_Document.navigateToCoordinates", "sch_Document.navigateToRegion", "pcb_PrimitiveAttribute.create", "pcb_PrimitivePoured.create", "pcb_PrimitivePoured.modify"]) {
    const row = rows.get(`eda.${path}`); assert.ok(row);
    assert.equal(row.status, "omitted"); assert.equal(row.routes.length, 0);
    assert.equal(row.omission?.code, "reviewed-native-stub"); assert.match(row.omission.reason, /empty body|constant false/u);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
  }
});

void test("closed free PCB creation retains its native argument subset while execution is blocked", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.dmt_Pcb.createPcb");
  assert.ok(row);
  assert.equal(row.status, "implemented-but-blocked"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
  const route = row.routes[0]; assert.ok(route);
  assert.equal(route.selector, "document.pcb.create"); assert.equal(route.implementation, "native-task-equivalent");
  assert.deepEqual(route.documentTypes, [3]); assert.equal(route.executionState, "blocked");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /boardName absent/u); assert.match(route.scope, /retained original UUID/u);
  assert.match(route.scope, /No board creation or attachment/u); assert.match(route.scope, /never recreates/u);
  for (const source of ["project-pcb-create.ts", "project-pcb-create-runtime.ts", "native-history.ts", "native-document-record-history.ts", "library-recovery.ts", "library-undispatched-recovery.ts"]) { assert.ok(route.source.includes(source)); }
  for (const file of ["native-history.test.ts", "native-document-record-history.test.ts", "library-undispatched-recovery.test.ts"]) { assert.ok(route.tests.includes(file)); }
  assert.match(route.scope, /per-document raw occurrence chains/u);
  const catalog = queryOperationCatalog({ family: "library", operationAction: "document.pcb.create", includeSchemas: true });
  const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
  const entry: unknown = entries[0]; assert.ok(isRecord(entry));
  assert.equal(entry["status"], "unavailable-native-project-structure-lifecycle");
  assert.match(JSON.stringify(entry), /boardNameMustBeAbsent/u);
  assert.equal(validateCatalogOperation({ family: "library", operation: { id: "create-free", action: "document.pcb.create" } })["valid"], true);
  assert.equal(validateCatalogOperation({ family: "library", operation: { id: "create-bound", action: "document.pcb.create", boardName: "Board" } })["valid"], true);
  // Structural acceptance of the optional public argument does not make that
  // Branch execution-enabled; the runtime rejects every supplied boardName.
});

void test("closed free schematic creation reports its blocked empty-container profile without public sheet parity", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.dmt_Schematic.createSchematic");
  assert.ok(row); assert.equal(row.status, "implemented-but-blocked"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.routes.length, 1); const route = row.routes[0]; assert.ok(route);
  assert.equal(route.selector, "document.schematic.create"); assert.deepEqual(route.documentTypes, [3]);
  assert.equal(route.executionState, "blocked");
  const catalog = queryOperationCatalog({ family: "library", operationAction: "document.schematic.create", includeSchemas: true });
  const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
  const entry: unknown = entries[0]; assert.ok(isRecord(entry));
  assert.equal(entry["status"], "unavailable-native-project-structure-lifecycle");
  const capabilities = entry["executionCapabilities"]; assert.ok(isRecord(capabilities));
  for (const key of ["pageCreated", "editorOpened", "saveInvoked", "reopened", "currentGenerationLiveValidated", "automaticInverse", "nonemptyInlineComponentAttributes", "nativeSubscriberAtomicProjectIsolation"]) { assert.equal(capabilities[key], false); }
  for (const key of ["boardNameMustBeAbsent", "emptySchematic", "recoveryRequiresOriginalNativeIdentity", "exactLocalOrdinarySymbolReferencesRequired"]) { assert.equal(capabilities[key], true); }
  assert.equal(validateCatalogOperation({ family: "library", operation: { id: "free-sch", action: "document.schematic.create" } })["valid"], true);
});

void test("String footprint routes retain their type-4 scope alongside the separate narrow PCB routes", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const method of ["create", "modify", "delete"]) {
    const row = rows.get(`eda.pcb_PrimitiveString.${method}`); assert.ok(row);
    assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
    assert.equal(row.reviewedRuntimeDeclaration, true); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.equal(row.routes.length, 2);
    const route = row.routes.find((entry) => entry.selector === `footprint.text.${method}`); assert.ok(route);
    assert.equal(route.tool, "easyeda_control_design"); assert.equal(route.selector, `footprint.text.${method}`);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [4]);
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.match(route.scope, /one standalone built-in-default-font STRING per operation/u);
    assert.match(route.scope, /Modify preserves identity\/layer and refuses reverse-state changes/u);
    assert.match(route.scope, /delete has no automatic inverse/u);
    assert.match(route.scope, /No type-3 PCB text, external fonts, placed-instance propagation, public pcb_PrimitiveString wrapper execution\/parity/u);
    assert.match(route.scope, /class-instance or bulk-delete arguments, or full declared-contract claim/u);
    assert.ok(route.source.includes("footprint-public-geometry.ts")); assert.ok(route.source.includes("design-action.ts"));
    assert.ok(route.source.includes("design-execution.ts")); assert.ok(route.tests.includes("footprint-lifecycle.test.ts"));
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "operations", query: { family: "design", operationAction: `footprint.text.${method}`, includeSchemas: true } } } });
    const discovery = route.inputDiscovery?.arguments.request; assert.ok(isRecord(discovery));
    const catalog = queryOperationCatalog(discovery.query);
    assert.equal(catalog["offline"], true); assert.equal(catalog["executionAuthorized"], false); assert.equal(catalog["matched"], 1);
    const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
    const entry: unknown = entries[0]; assert.ok(isRecord(entry)); assert.equal(entry["action"], route.selector);
    const schema = entry["inputSchema"]; assert.ok(isRecord(schema)); assert.equal(schema["additionalProperties"], false);
    const properties = schema["properties"]; assert.ok(isRecord(properties));
    assert.deepEqual(properties["action"], { type: "string", const: route.selector });
    assert.equal(queryOperationCatalog({ family: "design", operationAction: `pcb.text.${method}` })["matched"], 1);
  }
});

void test("PCB String modification discovers only its strict source-merge subset, with no public or connected parity", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.pcb_PrimitiveString.modify"); assert.ok(row);
  const route = row.routes.find((entry) => entry.selector === "pcb.text.modify"); assert.ok(route);
  assert.deepEqual(route.documentTypes, [3]); assert.equal(route.tool, "easyeda_control_design");
  assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "blocked");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.match(route.scope, /exact x\/y\/text changes/u); assert.match(route.scope, /does not invoke the public wrapper/u);
  assert.match(route.scope, /No creation, deletion, component ATTR, inherited text/u);
  const query = { family: "design", operationAction: "pcb.text.modify", includeSchemas: true };
  assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "operations", query } } });
  const catalog = queryOperationCatalog(query); assert.equal(catalog["matched"], 1); assert.equal(catalog["executionAuthorized"], false);
  const operation = { id: "pcb-text", action: "pcb.text.modify", target: { primitiveId: "0123456789abcdef" }, patch: { x: 12.5, text: "MARK 1" } };
  assert.equal(validateCatalogOperation({ family: "design", operation })["valid"], true);
  for (const patch of [{}, { x: undefined }, { x: 0.00001 }, { text: "{value}" }, { fontFamily: "external" }, { reverse: true }, { layer: 4 }]) {
    assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, patch } })["valid"], false);
  }
  assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, code: "caller" } })["valid"], false);
});

void test("PCB text create/delete discovery retains the separate type-3 identity and inverse boundaries", () => {
  for (const method of ["create", "delete"] as const) {
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === `eda.pcb_PrimitiveString.${method}`); assert.ok(row);
    const route = row.routes.find((entry) => entry.selector === `pcb.text.${method}`); assert.ok(route);
    assert.deepEqual(route.documentTypes, [3]); assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.match(route.scope, /facade-reserved identity sealed with the prepared program before dispatch/u);
    assert.match(route.scope, /deletion has no inverse/u); assert.match(route.scope, /No regeneration or redispatch/u);
    assert.match(route.scope, /Creation profile v2 fixes specialColor to explicit native-UI-default #000000/u);
    if (method === "create") {
      assert.match(route.scope, /original six sealed phases and one successful Save\/close\/reopen acknowledgment/u);
      assert.match(route.scope, /Legacy storage stays null, observed export stays black/u);
      assert.ok(route.source.includes("pcb-text-retained-save.ts"));
      assert.ok(route.tests.includes("pcb-text-retained-save-coordinator.test.ts"));
    } else {
      assert.match(route.scope, /Consumed-Save deletion has no retained-Save recovery route/u);
      assert.equal(route.source.includes("pcb-text-retained-save.ts"), false);
    }
    assert.ok(route.source.includes("pcb-text-lifecycle.ts")); assert.ok(route.tests.includes("pcb-text-lifecycle.test.ts"));
    const query = { family: "design", operationAction: route.selector, includeSchemas: true };
    assert.deepEqual(route.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "operations", query } } });
    const catalog = queryOperationCatalog(query); assert.equal(catalog["matched"], 1); assert.equal(catalog["executionAuthorized"], false);
    const operation = method === "create"
      ? { id: "create-pcb-text", action: route.selector, properties: { x: 95, y: 210, text: "Fixture 1", fontSize: 120, strokeWidth: 8 } }
      : { id: "delete-pcb-text", action: route.selector, target: { primitiveId: "0123456789abcdef" } };
    assert.equal(validateCatalogOperation({ family: "design", operation })["valid"], true);
    for (const extra of [{ createdId: "0123456789abcdef" }, { code: "caller" }, { documentType: 4 }]) {
      assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, ...extra } })["valid"], false);
    }
  }
});

void test("legacy PCB and schematic rename discovery retains its closed-target profile with execution blocked", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const [path, action] of [["eda.dmt_Pcb.modifyPcbName", "document.pcb.rename"], ["eda.dmt_Schematic.modifySchematicName", "document.schematic.rename"]] as const) {
    const row = rows.get(path); assert.ok(row);
    assert.equal(row.status, "implemented-native-equivalent");
    assert.equal(row.routes.length, path === "eda.dmt_Schematic.modifySchematicName" ? 3 : 2);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    const route = row.routes.find(item => item.tool === "easyeda_control_library"); assert.ok(route); assert.equal(route.selector, action);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.executionState, "blocked"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.match(route.scope, /every schematic child closed/u); assert.match(route.scope, /independent DOM-frame proof/u);
    assert.match(route.scope, /nonimported checkpoint and full peer record clocks\/header lineage/u);
    assert.match(route.scope, /No public wrapper, Save\/reopen, automatic inverse or current-generation live-validation claim/u);
    assert.ok(route.source.includes("document-container-rename-native-profile.ts")); assert.ok(route.source.includes("library-undispatched-recovery.ts"));
    for (const file of ["native-history.ts", "native-document-record-history.ts"]) { assert.ok(route.source.includes(file)); }
    for (const file of ["native-history.test.ts", "native-document-record-history.test.ts"]) { assert.ok(route.tests.includes(file)); }
    assert.match(route.scope, /per-document raw occurrence chains/u);
    const discovery = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(discovery));
    const catalog = queryOperationCatalog(discovery["query"]); assert.equal(catalog["offline"], true); assert.equal(catalog["executionAuthorized"], false);
    const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
    const entry: unknown = entries[0]; assert.ok(isRecord(entry)); assert.equal(entry["action"], action);
    assert.ok(isRecord(entry["inputSchema"])); assert.equal(entry["inputSchema"]["additionalProperties"], false);
    const operation = { id: "rename", action, target: { uuid: "closed-target" }, name: "New name" };
    const valid = validateCatalogOperation({ family: "library", operation }); assert.equal(valid["valid"], true); assert.equal(valid["executionAuthorized"], false);
    assert.equal(validateCatalogOperation({ family: "library", operation: { ...operation, code: "caller" } })["valid"], false);
  }
});

void test("footprint String coverage discovers strict task arguments, not the public primitive contract or execution authority", () => {
  const properties = { layer: 3, x: 0, y: 0, text: "TEST", fontSize: 50, lineWidth: 8, origin: "LEFT_BOTTOM", rotation: 0, mirror: false, reverse: false, expansion: 0, primitiveLock: false };
  const target = { primitiveId: "fixture-text" };
  const operations = [
    { id: "text-create", action: "footprint.text.create", properties },
    { id: "text-modify", action: "footprint.text.modify", target, patch: { text: "MARK" } },
    { id: "text-delete", action: "footprint.text.delete", target },
  ];
  for (const operation of operations) {
    const result = validateCatalogOperation({ family: "design", operation });
    assert.equal(result["valid"], true); assert.equal(result["offline"], true);
    assert.equal(result["executionAuthorized"], false); assert.equal(result["nativePreflightPerformed"], false);
    for (const extra of [{ documentType: 3 }, { primitiveId: "public-instance", property: {} }]) {
      assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, ...extra } })["valid"], false);
    }
    assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, action: operation.action.replace("footprint.", "pcb.") } })["valid"], false);
  }
  for (const invalid of [
    { ...operations[0], properties: { ...properties, fontFamily: "external" } },
    { ...operations[0], properties: { ...properties, origin: 3 } },
    { ...operations[0], properties: { ...properties, layer: 12 } },
    { ...operations[0], properties: { text: "implicit-defaults" } },
    { ...operations[1], patch: { fontFamily: "default" } },
    { ...operations[1], patch: {} },
    { ...operations[2], target: { primitiveIds: ["first", "second"] } },
  ]) {
    assert.equal(validateCatalogOperation({ family: "design", operation: invalid })["valid"], false);
  }
});

void test("active layer coverage separates its native identity/public fields from the empty public stub", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.pcb_Layer.getCurrentLayer"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
  const route = row.routes[0]; assert.ok(route);
  assert.equal(route.tool, "easyeda_control_sdk_read"); assert.deepEqual(route.documentTypes, [3]);
  assert.deepEqual(route.source, ["pcb-active-layer-read.ts"]); assert.deepEqual(route.tests, ["pcb-active-layer-read.test.ts"]);
  assert.match(route.scope, /body is empty/u); assert.match(route.scope, /source\/layers\/source/u);
  assert.match(route.scope, /public getAllLayers projection/u); assert.match(route.scope, /no undefined\/no-active-layer result/u);
});

void test("PCB type lookup coverage exposes the native classification subset instead of its public stub", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId"); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 2);
  const route = row.routes.find((entry) => entry.tool === "easyeda_control_sdk_read"); assert.ok(route);
  assert.equal(route.selector, row.path);
  assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
  assert.deepEqual(route.source, ["pcb-primitive-type-read.ts"]); assert.deepEqual(route.tests, ["pcb-primitive-type-read.test.ts"]);
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /body is empty/u); assert.match(route.scope, /empty-net objects/u); assert.match(route.scope, /ambiguous membership refuse/u);
  const current = row.routes.find((entry) => entry.tool === "easyeda_control_pcb_identities"); assert.ok(current);
  assert.equal(current.selector, row.path); assert.equal(current.implementation, "native-task-equivalent");
  assert.deepEqual(current.documentTypes, [3]); assert.equal(current.executionState, "available-with-runtime-guards");
  assert.equal(current.validation, "offline-regression;current-live-unclaimed");
  assert.match(current.scope, /positive unique membership/u); assert.match(current.scope, /loaded views/u);
  assert.match(current.scope, /Type lookup admits only a positive unique membership in Line\/Arc\/Via, not Component\/Pad/u);
  assert.deepEqual(current.inputDiscovery?.arguments, { request: { action: "pcb-identities", query: { method: row.path, includeSchemas: true } } });
});

void test("existing capture workflows have truthful public-subset coverage without enabling standalone navigation", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const [method, selector] of [["getCurrentRenderedAreaImage", "easyeda_canvas_capture"], ["zoomToRegion", "easyeda_canvas_capture_region"]]) {
    const row = rows.get(`eda.dmt_EditorControl.${method}`); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.omission, null);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
    const route = row.routes[0]; assert.ok(route);
    assert.equal(route.tool, "easyeda_control_capture"); assert.equal(route.selector, selector);
    assert.equal(route.implementation, "public-method"); assert.equal(route.executionState, "available-with-runtime-guards");
    assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.ok(route.source.includes("index.ts")); assert.ok(route.source.includes("../../easyeda-bridge-extension/src/canvas-operations.ts"));
    assert.ok(route.tests.includes("facade-capture.test.ts")); assert.match(route.scope, /visual acceptance/u);
  }
  assert.match(rows.get("eda.dmt_EditorControl.getCurrentRenderedAreaImage")?.routes[0]?.scope ?? "", /Viewport-image observation only/u);
  assert.match(rows.get("eda.dmt_EditorControl.zoomToRegion")?.routes[0]?.scope ?? "", /no standalone zoom operation/u);
  for (const method of ["zoomTo", "zoomToAllPrimitives", "zoomToSelectedPrimitives"]) {
    assert.equal(rows.get(`eda.dmt_EditorControl.${method}`)?.status, "omitted");
  }
});

void test("current PCB layer coverage preserves the separate legacy route and discloses native execution", () => {
  for (const method of ["getAllLayers", "getTheNumberOfCopperLayers"]) {
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === `eda.pcb_Layer.${method}`);
    assert.ok(row); assert.equal(row.status, "implemented-public-subset"); assert.equal(row.routes.length, 3);
    assert.equal(row.routes.some((route) => route.tool === "easyeda_control_sdk_read"), true);
    const route = row.routes.find((entry) => entry.tool === "easyeda_control_pcb_layers"); assert.ok(route);
    assert.deepEqual(route.documentTypes, [3]); assert.equal(route.implementation, "native-task-equivalent");
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    const discovery = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(discovery));
    const result = queryOfflineApi(apiRequestSchema.parse(discovery)).result; assert.ok(isRecord(result));
    assert.equal(result["total"], 2); assert.equal(result["invocationEnabledByDiscovery"], false);
    assert.match(JSON.stringify(result), /inputSchema/u);
  }
});

void test("current project symbol metadata is a closed local read distinct from legacy library execution", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.lib_Symbol.get"); assert.ok(row);
  assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.routes.some((route) => route.tool === "easyeda_control_library"), true);
  const route = row.routes.find((entry) => entry.tool === "easyeda_control_project_symbol"); assert.ok(route);
  assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /symbol to remain absent from the complete registered editor tree/u); assert.match(route.scope, /workerIdentityVerified remains false/u);
  assert.match(route.scope, /No geometry load, navigation, write or Save/u);
  const discovery = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(discovery));
  const catalog = queryOfflineApi(apiRequestSchema.parse(discovery)).result; assert.ok(isRecord(catalog));
  assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(catalog), /inputSchema/u);
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  const request = { method: "eda.lib_Symbol.get", arguments: { symbolUuid: "d".repeat(32) }, target };
  const valid = queryOfflineApi(apiRequestSchema.parse({ action: "project-symbol-validate", query: { request } })).result;
  assert.ok(isRecord(valid)); assert.equal(valid["valid"], true); assert.equal(valid["executionAuthorized"], false);
  const invalid = queryOfflineApi(apiRequestSchema.parse({ action: "project-symbol-validate", query: {
    request: { ...request, arguments: { ...request.arguments, libraryUuid: "cloud-library" } },
  } })).result;
  assert.ok(isRecord(invalid)); assert.equal(invalid["valid"], false); assert.equal(invalid["executionAuthorized"], false);
});

void test("current PCB geometry adds narrow native routes without replacing legacy inventory or granting authority", () => {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  const childMethod = "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId";
  const childRow = inventoryExtensionApiCoverage().find((entry) => entry.path === childMethod); assert.ok(childRow);
  assert.equal(childRow.routes.some((route) => route.tool === "easyeda_control_sdk_read"), true);
  const childRoute = childRow.routes.find((route) => route.tool === "easyeda_control_pcb_geometry"); assert.ok(childRoute);
  assert.equal(childRoute.implementation, "native-task-equivalent"); assert.deepEqual(childRoute.documentTypes, [3]);
  const childDiscovery = childRoute.inputDiscovery?.arguments["request"]; assert.ok(isRecord(childDiscovery));
  const childCatalog = queryOfflineApi(apiRequestSchema.parse(childDiscovery)).result; assert.ok(isRecord(childCatalog));
  assert.equal(childCatalog["total"], 1); assert.equal(childCatalog["invocationEnabledByDiscovery"], false);
  const childValid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: {
    request: { method: childMethod, arguments: { primitiveId: "component-a" }, target },
  } })).result;
  assert.ok(isRecord(childValid)); assert.equal(childValid["valid"], true); assert.equal(childValid["executionAuthorized"], false);
  for (const family of ["Line", "Arc", "Via", "Component", "Pad"]) {
    const getMethod = `eda.pcb_Primitive${family}.get`;
    const getRow = inventoryExtensionApiCoverage().find((entry) => entry.path === getMethod); assert.ok(getRow);
    assert.equal(getRow.status, "implemented-public-subset"); assert.equal(getRow.completeDeclaredContractSupported, false);
    assert.equal(getRow.routes.some((route) => route.tool === "easyeda_control_sdk_read"), true);
    const getRoute = getRow.routes.find((route) => route.tool === "easyeda_control_pcb_geometry"); assert.ok(getRoute);
    assert.equal(getRoute.implementation, "native-task-equivalent"); assert.equal(getRoute.validation, "offline-regression;current-live-unclaimed");
    assert.match(getRoute.scope, /distinct bounded primitiveIds/u);
    const getDiscovery = getRoute.inputDiscovery?.arguments["request"]; assert.ok(isRecord(getDiscovery));
    const getCatalog = queryOfflineApi(apiRequestSchema.parse(getDiscovery)).result; assert.ok(isRecord(getCatalog));
    assert.equal(getCatalog["total"], 1); assert.equal(getCatalog["invocationEnabledByDiscovery"], false);
    const getValid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: {
      request: { method: getMethod, arguments: { primitiveIds: ["second", "first"] }, target },
    } })).result;
    assert.ok(isRecord(getValid)); assert.equal(getValid["valid"], true); assert.equal(getValid["executionAuthorized"], false);
    const method = `eda.pcb_Primitive${family}.getAll`;
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === method); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.equal(row.routes.some((route) => route.tool === "easyeda_control_exact_read"), true);
    const route = row.routes.find((entry) => entry.tool === "easyeda_control_pcb_geometry"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
    assert.match(route.scope, /loaded-view geometry/u); assert.match(route.scope, /No filters/u);
    const request = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(request));
    const discovered = queryOfflineApi(apiRequestSchema.parse(request)).result; assert.ok(isRecord(discovered));
    assert.equal(discovered["total"], 1); assert.equal(discovered["invocationEnabledByDiscovery"], false);
    const valid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: { request: { method, arguments: {}, target } } })).result;
    assert.ok(isRecord(valid)); assert.equal(valid["valid"], true); assert.equal(valid["executionAuthorized"], false);
    const invalid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: { request: { method, arguments: { layer: 1 }, target } } })).result;
    assert.ok(isRecord(invalid)); assert.equal(invalid["valid"], false); assert.equal(invalid["executionAuthorized"], false);
    if (family === "Component" || family === "Pad") {
      const idMethod = `eda.pcb_Primitive${family}.getAllPrimitiveId`;
      const identityRow = inventoryExtensionApiCoverage().find((entry) => entry.path === idMethod); assert.ok(identityRow);
      assert.equal(identityRow.status, "implemented-public-subset"); assert.equal(identityRow.completeDeclaredContractSupported, false);
      assert.equal(identityRow.currentGenerationLiveValidation, "not-recorded");
      assert.equal(identityRow.routes.some((entry) => entry.tool === "easyeda_control_exact_read"), true);
      const identityRoute = identityRow.routes.find((entry) => entry.tool === "easyeda_control_pcb_identities"); assert.ok(identityRoute);
      assert.equal(identityRoute.implementation, "native-task-equivalent"); assert.deepEqual(identityRoute.documentTypes, [3]);
      assert.equal(identityRoute.executionState, "available-with-runtime-guards");
      assert.equal(identityRoute.validation, "offline-regression;current-live-unclaimed");
      const identityRequest = identityRoute.inputDiscovery?.arguments["request"]; assert.ok(isRecord(identityRequest));
      const identityDiscovered = queryOfflineApi(apiRequestSchema.parse(identityRequest)).result; assert.ok(isRecord(identityDiscovered));
      assert.equal(identityDiscovered["total"], 1); assert.equal(identityDiscovered["invocationEnabledByDiscovery"], false);
      const identityValid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-identities-validate", query: {
        request: { method: idMethod, arguments: {}, target },
      } })).result;
      assert.ok(isRecord(identityValid)); assert.equal(identityValid["valid"], true); assert.equal(identityValid["executionAuthorized"], false);
    }
  }
});

void test("shortcut coverage keeps legacy and current-version routes distinct without design-context admission", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.sys_ShortcutKey.getShortcutKeys");
  assert.ok(row); assert.equal(row.status, "implemented-public-subset"); assert.equal(row.routes.length, 2);
  assert.equal(row.routes.some((route) => route.tool === "easyeda_control_sdk_read"), true);
  const route = row.routes.find((entry) => entry.tool === "easyeda_control_shortcuts"); assert.ok(route);
  assert.equal(route.documentTypes, undefined); assert.equal(route.implementation, "public-method");
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /API 0\.3\.50\/UI 3\.2\.196.*installed-209 API 0\.3\.59\/UI 3\.2\.198/u);
  assert.match(route.scope, /206 scope remains 0-10.*209 raw UI registry scope is 0-14/u);
  assert.match(route.scope, /declarationScopeConformanceVerified remains false/u);
  assert.ok(route.source.includes("editor-observation209-profile.ts"));
  assert.ok(route.tests.includes("editor-observation209-runtime.test.ts"));
  const discovery = route.inputDiscovery?.arguments["request"]; assert.ok(isRecord(discovery));
  const result = queryOfflineApi(apiRequestSchema.parse(discovery)).result; assert.ok(isRecord(result));
  assert.equal(result["total"], 1); assert.equal(result["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(result), /inputSchema/u);
});

void test("current Dimension/Image/Attribute identities retain separate scope without promoting effectful polygon serializers", () => {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  const rows = inventoryExtensionApiCoverage();
  for (const family of ["Dimension", "Image", "Attribute"]) {
    const method = `eda.pcb_Primitive${family}.getAllPrimitiveId`, row = rows.find(entry => entry.path === method); assert.ok(row);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb_identities"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.ok(route.inputDiscovery);
    const catalog = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result; assert.ok(isRecord(catalog));
    assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    for (const [argumentsValue, accepted] of [[{}, true], [{ layer: 3 }, false]] as const) {
      const valid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-identities-validate", query: {
        request: { method, arguments: argumentsValue, target },
      } })).result;
      assert.ok(isRecord(valid)); assert.equal(valid["valid"], accepted); assert.equal(valid["executionAuthorized"], false);
    }
    for (const getter of ["get", "getAll"]) {
      assert.equal(rows.find(entry => entry.path === `eda.pcb_Primitive${family}.${getter}`)?.routes.some(entry => entry.tool === "easyeda_control_pcb_geometry"), true);
    }
  }
  for (const family of ["Fill", "Polyline", "Region"]) {
    assert.equal(rows.find(entry => entry.path === `eda.pcb_Primitive${family}.getAllPrimitiveId`)?.routes.some(entry => entry.tool === "easyeda_control_pcb_identities"), false);
  }
});

void test("current Attribute geometry discovery retains legacy routes and the grouped native subset", () => {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  for (const method of ["get", "getAll"]) {
    const path = `eda.pcb_PrimitiveAttribute.${method}`;
    const row = inventoryExtensionApiCoverage().find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(row.routes.some(route => route.tool === "easyeda_control_sdk_read"));
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb_geometry"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.ok(route.inputDiscovery);
    for (const scope of ["ordered component parent groups including empty groups", "expanded Name formula", "Null coordinates are refused", "No filters", "No fonts/outlines"]) {
      assert.ok(route.scope.includes(scope));
    }
    const catalog = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result; assert.ok(isRecord(catalog));
    assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    const argumentsValue = method === "get" ? { primitiveIds: ["attribute-b", "attribute-a"] } : {};
    for (const [argumentsInput, accepted] of [[argumentsValue, true], [{ ...argumentsValue, parentPrimitiveId: "component-a" }, false]] as const) {
      const valid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: {
        request: { method: path, arguments: argumentsInput, target },
      } })).result;
      assert.ok(isRecord(valid)); assert.equal(valid["valid"], accepted); assert.equal(valid["executionAuthorized"], false);
    }
  }
});

void test("current Dimension geometry discovery separates canvas units from fixed mil coordinates", () => {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  for (const method of ["get", "getAll"]) {
    const path = `eda.pcb_PrimitiveDimension.${method}`, row = inventoryExtensionApiCoverage().find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(row.routes.some(route => route.tool === "easyeda_control_sdk_read"));
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb_geometry"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.ok(route.inputDiscovery);
    for (const text of ["already mil", "canvasUnit", "not the coordinate unit or verified annotation unit", "native generic getByIds", "No filters"]) {
      assert.ok(route.scope.includes(text));
    }
    const catalog = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result; assert.ok(isRecord(catalog));
    assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    const argumentsValue = method === "get" ? { primitiveIds: ["dimension-b", "dimension-a"] } : {};
    for (const [argumentsInput, accepted] of [[argumentsValue, true], [{ ...argumentsValue, layer: 13 }, false], [{ primitiveIds: "dimension-b" }, false]] as const) {
      const valid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: {
        request: { method: path, arguments: argumentsInput, target },
      } })).result;
      assert.ok(isRecord(valid)); assert.equal(valid["valid"], accepted); assert.equal(valid["executionAuthorized"], false);
    }
  }
});

void test("current Image geometry discovery preserves native Picture scope without asset or writer authority", () => {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  for (const method of ["get", "getAll"]) {
    const path = `eda.pcb_PrimitiveImage.${method}`, row = inventoryExtensionApiCoverage().find(entry => entry.path === path); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    assert.ok(row.routes.some(route => route.tool === "easyeda_control_sdk_read"));
    const route = row.routes.find(entry => entry.tool === "easyeda_control_pcb_geometry"); assert.ok(route);
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.validation, "offline-regression;current-live-unclaimed"); assert.ok(route.inputDiscovery);
    for (const text of ["vector Image then Picture", "already mil", "native getByIds searches only vector images",
      "asset-backed source getter", "omitted and not compared", "before selection", "writer-baseline"]) {
      assert.ok(route.scope.toLowerCase().includes(text.toLowerCase()));
    }
    const catalog = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"])).result; assert.ok(isRecord(catalog));
    assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    const argumentsValue = method === "get" ? { primitiveIds: ["picture", "vector-image"] } : {};
    for (const [argumentsInput, accepted] of [[argumentsValue, true], [{ ...argumentsValue, layer: 13 }, false],
      [{ ...argumentsValue, primitiveLock: false }, false], [{ primitiveIds: "picture" }, false]] as const) {
      const valid = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry-validate", query: {
        request: { method: path, arguments: argumentsInput, target },
      } })).result;
      assert.ok(isRecord(valid)); assert.equal(valid["valid"], accepted); assert.equal(valid["executionAuthorized"], false);
    }
  }
  for (const method of ["create", "modify", "delete"]) {
    const row = inventoryExtensionApiCoverage().find(entry => entry.path === `eda.pcb_PrimitiveImage.${method}`); assert.ok(row);
    assert.equal(row.status, "omitted"); assert.equal(row.routes.length, 0);
  }
});

void test("LCSC catalogue lookup retains the concrete local-library fallback omission", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.lib_Device.getByLcscIds");
  assert.ok(row); assert.equal(row.status, "omitted"); assert.equal(row.routes.length, 0);
  assert.equal(row.omission?.code, "catalogue-fallback-library-effects");
  assert.match(row.omission.reason, /Concurrent library refresh/u);
  assert.match(row.omission.nextRequirement, /remote-only/u);
});

void test("omitted heterogeneous geometric getters retain proven projection defects", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const path of ["eda.pcb_Document.getPrimitiveAtPoint", "eda.pcb_Document.getPrimitivesInRegion"]) {
    const row = rows.get(path);
    assert.ok(row);
    assert.equal(row.status, "omitted");
    assert.equal(row.omission?.code, "lossy-heterogeneous-primitive-projection");
    assert.match(row.omission.reason, /Text/u);
    assert.equal(row.routes.length, 0);
  }
});

void test("selected PCB objects expose source DTOs without promoting the lossy public wrapper", () => {
  const path = "eda.pcb_SelectControl.getAllSelectedPrimitives";
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === path); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.routes.length, 1); const route = row.routes[0]; assert.ok(route);
  assert.equal(route.selector, path); assert.equal(route.tool, "easyeda_control_sdk_read");
  assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
  assert.deepEqual(route.source, ["pcb-selected-objects-read.ts"]);
  assert.match(route.scope, /Native-source DTO equivalent/u); assert.match(route.scope, /entire result/u);
  assert.match(route.scope, /Generated poured-state correlation must be exactly empty/u);
  assert.match(route.scope, /no atomic snapshot or persistence claim/u);
  const publicRead = queryOfflineApi(apiRequestSchema.parse({ action: "sdk-reads", query: { method: path } })).result;
  assert.ok(isRecord(publicRead));
  assert.equal(publicRead["authority"], "native-selected-source-objects-not-public-instance-or-persistence-proof");
  const raw = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.pcb_SelectControl.getSelectedPrimitives");
  assert.equal(raw?.status, "implemented-native-equivalent"); assert.equal(raw.omission, null);
  const selectedRoute = raw.routes[0]; assert.ok(selectedRoute);
  assert.equal(selectedRoute.tool, "easyeda_control_pcb_geometry");
  assert.equal(selectedRoute.executionState, "available-with-runtime-guards");
  assert.match(selectedRoute.scope, /two compound samples must match/u);
  assert.match(selectedRoute.scope, /unsupported, never silently dropped/u);
  assert.match(selectedRoute.scope, /raw selected-object serializer is never called/u);
  assert.match(selectedRoute.scope, /showNet/u);
  const selectedDiscovery = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-geometry", query: { method: raw.path } })).result;
  assert.ok(isRecord(selectedDiscovery)); assert.equal(selectedDiscovery["total"], 1);
});

void test("polygon splitting is bounded public data, Pin enumeration is a native equivalent and discretize remains a stub", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  const split = rows.get("eda.pcb_MathPolygon.splitPolygon");
  assert.equal(split?.status, "implemented-public-subset");
  assert.equal(split?.omission, null);
  assert.equal(split?.completeDeclaredContractSupported, false);
  assert.equal(split?.currentGenerationLiveValidation, "not-recorded");
  assert.match(split?.routes[0]?.scope ?? "", /exact input order, duplicates and source parity/u);
  const discretize = rows.get("eda.pcb_MathPolygon.discretize");
  assert.equal(discretize?.status, "omitted");
  assert.equal(discretize?.omission?.code, "reviewed-native-stub");
  assert.match(discretize?.omission?.reason ?? "", /unconditionally throws Not implemented/u);
  const pins = rows.get("eda.sch_PrimitivePin.getAll");
  assert.equal(pins?.status, "implemented-native-equivalent");
  assert.equal(pins?.omission, null);
  assert.equal(pins?.completeDeclaredContractSupported, false);
  assert.equal(pins?.currentGenerationLiveValidation, "not-recorded");
  assert.deepEqual(pins?.routes[0]?.documentTypes, [2]);
  assert.match(pins?.routes[0]?.scope ?? "", /explicit public get\(id\) parity/u);
  assert.match(pins?.routes[0]?.scope ?? "", /never the broken getAll/u);
});

void test("owned editor tab lookup coverage uses only its checkpoint-bound specialized public readers", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const method of ["getSplitScreenIdByTabId", "getTabsBySplitScreenId"]) {
    const path = `eda.dmt_EditorControl.${method}`, row = rows.get(path); assert.ok(row);
    assert.equal(row.status, "implemented-public-subset"); assert.equal(row.omission, null);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.routes.length, 1); const route = row.routes[0]; assert.ok(route);
    assert.equal(route.tool, "easyeda_control_sdk_read"); assert.equal(route.selector, path);
    assert.equal(route.implementation, "public-method"); assert.deepEqual(route.documentTypes, [1, 2, 3, 4]);
    assert.deepEqual(route.source, ["editor-tab-lookups.ts"]); assert.deepEqual(route.tests, ["editor-tab-lookups.test.ts"]);
  }
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
    const result = queryOfflineApi(apiRequestSchema.parse(request)).result;
    assert.ok(isRecord(result));
    if (["project-symbol-operation", "disposable-symbol-copy", "disposable-pcb-rename", "disposable-schematic-rename", "project-schematic-operation", "pcb209-opening"].includes(String(request["action"]))) {
      assert.ok(isRecord(result["inputSchema"]));
      // The ordinary SCH and 209 opening routes expose their lifecycle union at the root;
      // Existing routes still promise a separate phase schema as well.
      if (request["action"] !== "project-schematic-operation" && request["action"] !== "pcb209-opening") { assert.ok(isRecord(result["stepSchema"])); }
      assert.equal(result["executionAuthorized"], false);
    } else {
      const entries = result["entries"];
      assert.ok(Array.isArray(entries));
      assert.ok(entries.length > 0);
      const first: unknown = entries[0];
      assert.ok(isRecord(first) && isRecord(first["inputSchema"]));
    }
  }
});

void test("all sixteen new-version calculations have scoped routes without broader runtime admission", () => {
  const entries = inventoryExtensionApiCoverage().filter((entry) => entry.namespace === "sys_Math");
  assert.equal(entries.length, 16);
  assert.equal(entries.filter((entry) => entry.status === "implemented-public-subset").length, 16);
  for (const entry of entries) {
    assert.equal(entry.reviewedRuntimeDeclaration, false);
    assert.equal(entry.currentGenerationLiveValidation, "not-recorded");
    assert.equal(entry.omission, null);
    assert.equal(entry.routes[0]?.tool, "easyeda_control_calculate");
    assert.match(entry.routes[0]?.scope ?? "", /^Separately reviewed EasyEDA 3\.2\.206\/API 0\.3\.50 or 3\.2\.209\/API 0\.3\.59 public calculation subset, not legacy\/native-tuple admission\./u);
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
