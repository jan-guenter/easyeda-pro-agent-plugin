import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { extensionApiCoverageQuerySchema, extensionApiCoverageSummary, inventoryExtensionApiCoverage, queryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { queryOperationCatalog, validateCatalogOperation } from "../src/operation-catalog.ts";
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
  assert.equal(rows.get("eda.lib_Symbol.create")?.status, "implemented-native-equivalent");
  const symbolCreate = rows.get("eda.lib_Symbol.create")?.routes[0];
  assert.ok(symbolCreate); assert.equal(symbolCreate.selector, "library.symbol.create");
  assert.deepEqual(symbolCreate.documentTypes, [3]);
  assert.equal(symbolCreate.executionState, "available-with-runtime-guards");
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
  assert.equal(rows.get("eda.dmt_Schematic.createSchematicPage")?.status, "implemented-native-equivalent");
  const create = rows.get("eda.dmt_Schematic.createSchematicPage")?.routes[0];
  assert.ok(create); assert.equal(create.selector, "document.page.create"); assert.equal(create.implementation, "native-task-equivalent");
  assert.deepEqual(create.documentTypes, [1, 3]); assert.equal(create.executionState, "available-with-runtime-guards");
  assert.equal(rows.get("eda.dmt_Schematic.createSchematicPage")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.routes[0]?.selector, "document.page.rename");
  assert.equal(rows.get("eda.dmt_Schematic.modifySchematicPageName")?.currentGenerationLiveValidation, "not-recorded");
  assert.equal(rows.get("eda.dmt_Project.createProject")?.status, "omitted");
  assert.equal(rows.get("eda.sch_PrimitiveBus.create")?.status, "omitted");
  assert.equal(rows.get("eda.pcb_Document.save")?.status, "internal-lifecycle-only");
  assert.equal(rows.get("eda.pcb_Layer.getCurrentLayer")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveText.getAllPrimitiveId")?.status, "implemented-native-equivalent");
  assert.equal(rows.get("eda.sch_PrimitiveText.getAllPrimitiveId")?.routes[0]?.implementation, "native-task-equivalent");
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
  const genericSave = rows.get("eda.sch_Document.save")?.routes.find((route) => route.selector === "execute/commit");
  assert.equal(genericSave?.executionState, "partially-blocked");
  assert.deepEqual(genericSave?.blockedDocumentTypes, [1]);
  const compact = queryExtensionApiCoverage({ search: "eda.sch_PrimitiveWire.modify" })["entries"];
  assert.ok(Array.isArray(compact) && isRecord(compact[0]));
  assert.ok(JSON.stringify(compact).includes("blockedReason"));
});

void test("sealed flat display coverage admits only existing attribute/text display and its internal Save lifecycle", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const profile of ["easyeda-pro-control.flat-display-transaction.v1", "easyeda-pro-control.flat-display-transaction.v2"]) {
  const admitted = rows.flatMap((row) => row.routes.filter((route) => route.selector.includes(`sealed-profile=${profile}`)).map((route) => ({ path: row.path, row, route })));
  assert.deepEqual(admitted.map(({ path }) => path).toSorted(), ["eda.sch_Document.save", "eda.sch_PrimitiveAttribute.modify", "eda.sch_PrimitiveText.modify"]);
  for (const { path, row, route } of admitted) {
    assert.equal(route.tool, "easyeda_control_design"); assert.deepEqual(route.documentTypes, [1]);
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.blockedReason, undefined);
    assert.equal(route.blockedDocumentTypes, undefined); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
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
      assert.equal(row.routes.find((entry) => entry.selector.includes("documentType=2"))?.executionState, "available-with-runtime-guards");
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
    "implemented-public-subset": 192, "implemented-native-equivalent": 97, "internal-lifecycle-only": 2, "implemented-but-blocked": 8, omitted: 475,
  });
});

void test("closed free PCB creation exposes only its checkpoint-bound native subset", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.dmt_Pcb.createPcb");
  assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
  const route = row.routes[0]; assert.ok(route);
  assert.equal(route.selector, "document.pcb.create"); assert.equal(route.implementation, "native-task-equivalent");
  assert.deepEqual(route.documentTypes, [3]); assert.equal(route.executionState, "available-with-runtime-guards");
  assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /boardName absent/u); assert.match(route.scope, /retained original UUID/u);
  assert.match(route.scope, /No board creation or attachment/u); assert.match(route.scope, /never recreates/u);
  for (const source of ["project-pcb-create.ts", "project-pcb-create-runtime.ts", "native-history.ts", "native-document-record-history.ts", "library-recovery.ts", "library-undispatched-recovery.ts"]) { assert.ok(route.source.includes(source)); }
  for (const file of ["native-history.test.ts", "native-document-record-history.test.ts", "library-undispatched-recovery.test.ts"]) { assert.ok(route.tests.includes(file)); }
  assert.match(route.scope, /per-document raw occurrence chains/u);
  const catalog = queryOperationCatalog({ family: "library", operationAction: "document.pcb.create", includeSchemas: true });
  const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
  const entry: unknown = entries[0]; assert.ok(isRecord(entry));
  assert.match(JSON.stringify(entry), /implemented-closed-empty-free-pcb-create-proof/u);
  assert.match(JSON.stringify(entry), /boardNameMustBeAbsent/u);
  assert.equal(validateCatalogOperation({ family: "library", operation: { id: "create-free", action: "document.pcb.create" } })["valid"], true);
  assert.equal(validateCatalogOperation({ family: "library", operation: { id: "create-bound", action: "document.pcb.create", boardName: "Board" } })["valid"], true);
  // Structural acceptance of the optional public argument does not make that
  // Branch execution-enabled; the runtime rejects every supplied boardName.
});

void test("closed free schematic creation reports empty-container support without public sheet parity", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.dmt_Schematic.createSchematic");
  assert.ok(row); assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null);
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.routes.length, 1); const route = row.routes[0]; assert.ok(route);
  assert.equal(route.selector, "document.schematic.create"); assert.deepEqual(route.documentTypes, [3]);
  assert.equal(route.executionState, "available-with-runtime-guards");
  const catalog = queryOperationCatalog({ family: "library", operationAction: "document.schematic.create", includeSchemas: true });
  const entries = catalog["entries"]; assert.ok(Array.isArray(entries)); assert.equal(entries.length, 1);
  const entry: unknown = entries[0]; assert.ok(isRecord(entry));
  assert.match(JSON.stringify(entry), /implemented-closed-empty-free-schematic-create-proof/u);
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
  assert.equal(route.implementation, "native-task-equivalent"); assert.equal(route.executionState, "available-with-runtime-guards");
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

void test("PCB and schematic rename coverage is an exact closed-target native task, not public wrapper or live execution proof", () => {
  const rows = new Map(inventoryExtensionApiCoverage().map((row) => [row.path, row]));
  for (const [path, action] of [["eda.dmt_Pcb.modifyPcbName", "document.pcb.rename"], ["eda.dmt_Schematic.modifySchematicName", "document.schematic.rename"]] as const) {
    const row = rows.get(path); assert.ok(row); assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.routes.length, 1);
    assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
    const route = row.routes[0]; assert.ok(route); assert.equal(route.selector, action); assert.equal(route.tool, "easyeda_control_library");
    assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
    assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
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
  assert.equal(row.runtimeAdmission, "not-granted-by-inventory"); assert.equal(row.routes.length, 1);
  const route = row.routes[0]; assert.ok(route);
  assert.equal(route.tool, "easyeda_control_sdk_read"); assert.equal(route.selector, row.path);
  assert.equal(route.implementation, "native-task-equivalent"); assert.deepEqual(route.documentTypes, [3]);
  assert.deepEqual(route.source, ["pcb-primitive-type-read.ts"]); assert.deepEqual(route.tests, ["pcb-primitive-type-read.test.ts"]);
  assert.equal(route.executionState, "available-with-runtime-guards"); assert.equal(route.validation, "offline-regression;current-live-unclaimed");
  assert.match(route.scope, /body is empty/u); assert.match(route.scope, /empty-net objects/u); assert.match(route.scope, /ambiguous membership refuse/u);
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
  assert.equal(queryPublicSdkReads({ method: path })["authority"], "native-selected-source-objects-not-public-instance-or-persistence-proof");
  const raw = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.pcb_SelectControl.getSelectedPrimitives");
  assert.equal(raw?.status, "omitted"); assert.equal(raw?.omission?.code, "lossy-selected-object-projection");
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
