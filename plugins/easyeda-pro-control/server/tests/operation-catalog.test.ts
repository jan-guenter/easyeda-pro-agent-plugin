import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { designActionSchema } from "../src/design-action.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { listLibraryExecutionCapabilities } from "../src/library-execution.ts";
import { operationCatalogQuerySchema, queryOperationCatalog, validateCatalogOperation } from "../src/operation-catalog.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { listDesignActionCapabilities } from "../src/design-capabilities.ts";

const FLAT_DISPLAY_TRANSACTION_PROFILE = "easyeda-pro-control.flat-display-transaction.v1";
const FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE = "easyeda-pro-control.flat-display-transaction.v2";
const FLAT_WIRE_TRANSACTION_PROFILE = "easyeda-pro-control.flat-wire-reroute.v1";

void test("every non-footprint design schema reports the Save structure lifecycle refusal without a caller override", () => {
  let count = 0, offset = 0;
  for (;;) {
    const result = queryOperationCatalog({ family: "design", offset, limit: 100 });
    for (const entry of z.array(z.record(z.string(), z.unknown())).parse(result["entries"])) {
      count += 1;
      const action = z.string().parse(entry["action"]);
      if (action.startsWith("footprint.")) {
        assert.equal(entry["status"], "typed-operation-specific-native-preflight");
        assert.equal(entry["executionRefusal"], undefined);
      } else {
        assert.equal(entry["status"], "unavailable-native-project-structure-lifecycle");
        assert.equal(entry["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
        const restrictions = z.array(z.object({ documentType: z.number(), reason: z.string() })).parse(entry["executionRestrictions"]);
        assert.deepEqual(restrictions.map((item) => item.documentType), action.startsWith("pcb.") ? [3] : [1, 2]);
        for (const item of restrictions) { assert.equal(item.reason, DESIGN_STRUCTURE_LIFECYCLE_REFUSAL); }
      }
    }
    if (result["hasMore"] === false) { assert.equal(count, result["total"]); break; }
    offset = z.number().parse(result["nextOffset"]);
  }
  assert.equal(count, 108);
  const operation = { id: "text", action: "pcb.text.modify", target: { primitiveId: "a".repeat(16) }, patch: { x: 1 } };
  assert.equal(validateCatalogOperation({ family: "design", operation })["valid"], true);
  for (const extra of [{ lifecycleProved: true }, { projectStructureJobComplete: true }, { documentType: 4 }]) {
    assert.equal(validateCatalogOperation({ family: "design", operation: { ...operation, ...extra } })["valid"], false);
  }
  const capabilities = listDesignActionCapabilities();
  assert.deepEqual(capabilities["enabledDocumentTypes"], [4]);
  assert.deepEqual(capabilities["executionRestrictions"], [{ documentTypes: [1, 2, 3], reason: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL, exceptions: [] }]);
  assert.match(String(capabilities["sourceProfiles"]), /not execution exceptions/u);
});

void test("all eight structure-lifecycle refusals preserve strict offline argument schemas without overrides", () => {
  const operations = [
    { id: "symbol-create", action: "library.symbol.create", libraryUuid: "project", name: "Symbol", symbolType: 2 },
    { id: "symbol-modify", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "Symbol" } },
    { id: "page-create", action: "document.page.create", schematic: { uuid: "schematic" } },
    { id: "page-rename", action: "document.page.rename", target: { uuid: "page" }, name: "Page" },
    { id: "pcb-create", action: "document.pcb.create" },
    { id: "pcb-rename", action: "document.pcb.rename", target: { uuid: "pcb" }, name: "PCB" },
    { id: "schematic-create", action: "document.schematic.create" },
    { id: "schematic-rename", action: "document.schematic.rename", target: { uuid: "schematic" }, name: "Schematic" },
  ];
  for (const operation of operations) {
    const result = queryOperationCatalog({ family: "library", operationAction: operation.action, includeSchemas: true });
    const [entry] = z.array(z.record(z.string(), z.unknown())).parse(result["entries"]); assert.ok(entry);
    assert.equal(entry["status"], "unavailable-native-project-structure-lifecycle");
    assert.match(z.string().parse(entry["executionRefusal"]), /operation-owned completion.*project_structures.*complete SQLite effect/u);
    assert.match(z.string().parse(entry["executionRefusal"]), /task1.*pending timer\/task2/u);
    const capabilities = z.record(z.string(), z.unknown()).parse(entry["executionCapabilities"]);
    assert.equal(capabilities["status"], entry["status"]); assert.equal(capabilities["executionRefusal"], entry["executionRefusal"]);
    const schema = z.record(z.string(), z.unknown()).parse(entry["inputSchema"]);
    assert.equal(schema["additionalProperties"], false);
    assert.equal(result["offline"], true); assert.equal(result["executionAuthorized"], false);
    const validated = validateCatalogOperation({ family: "library", operation });
    assert.equal(validated["valid"], true); assert.equal(validated["executionAuthorized"], false);
    assert.equal(validated["nativePreflightPerformed"], false);
    for (const extra of [{ lifecycleProved: true }, { projectStructureJobComplete: true }, { executionState: "available-with-runtime-guards" }]) {
      assert.equal(validateCatalogOperation({ family: "library", operation: { ...operation, ...extra } })["valid"], false);
    }
  }
  for (const action of ["library.symbol.get", "library.footprint.get", "library.device.get", "library.model3d.get",
    "library.footprint.create", "library.footprint.modify", "library.device.create", "library.device.modify"]) {
    const result = queryOperationCatalog({ family: "library", operationAction: action });
    const [entry] = z.array(z.record(z.string(), z.unknown())).parse(result["entries"]); assert.ok(entry);
    assert.notEqual(entry["status"], "unavailable-native-project-structure-lifecycle");
    assert.equal(Object.hasOwn(entry, "executionRefusal"), false);
  }
});

void test("schematic operation discovery exposes the current type-1 topology execution restriction", () => {
  const restricted = queryOperationCatalog({ family: "design", operationAction: "sch.wire.modify" });
  const restriction = z.object({ documentType: z.union([z.literal(1), z.literal(2)]), reason: z.string() });
  const descriptor = z.object({ executionRestrictions: z.array(restriction) });
  const entries = z.array(descriptor).parse(restricted["entries"]);
  assert.equal(entries[0]?.executionRestrictions[0]?.reason, DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
  const pcb = queryOperationCatalog({ family: "design", operationAction: "pcb.via.modify" });
  const pcbEntries = z.array(z.record(z.string(), z.unknown())).parse(pcb["entries"]);
  assert.deepEqual(pcbEntries[0]?.["executionRestrictions"], [{ documentType: 3, reason: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL }]);
});

void test("layout discovery describes only the sealed display exception without admitting other schematic edits", () => {
  const restrictionSchema = z.object({
    documentType: z.literal(1), reason: z.string(), exception: z.record(z.string(), z.unknown()).optional(),
  });
  const descriptorSchema = z.object({ sourceProfileRestrictions: z.array(restrictionSchema) });
  const entriesSchema = z.array(descriptorSchema);
  for (const action of ["sch.layout.batch", "sch.wire.create", "sch.component.create", "sch.text.modify"]) {
    const result = queryOperationCatalog({ family: "design", operationAction: action });
    const [entry] = entriesSchema.parse(result["entries"]);
    assert.ok(entry);
    const [restriction] = entry.sourceProfileRestrictions;
    assert.ok(restriction);
    assert.match(restriction.reason, /invoke Save All/u);
    if (action === "sch.layout.batch") {
      assert.equal(restriction.exception?.["profile"], FLAT_DISPLAY_TRANSACTION_PROFILE);
      assert.equal(restriction.exception["executionState"], "blocked");
      assert.equal(restriction.exception["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
      assert.deepEqual(restriction.exception["profiles"], [FLAT_DISPLAY_TRANSACTION_PROFILE, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE]);
      assert.match(String(restriction.exception["profileSelection"]), /facade-only.*v1.*v2.*unchanged imported SYMBOL\/FOOTPRINT/u);
      assert.deepEqual(restriction.exception["allowedSteps"], ["sch.attribute.display", "sch.text.display"]);
      assert.equal(restriction.exception["executionAuthorized"], false);
      assert.equal(restriction.exception["electricalEdits"], false);
      assert.match(String(restriction.exception["targets"]), /stored.*literal primitiveId/u);
      const imported = z.record(z.string(), z.unknown()).parse(restriction.exception["importedLibraryPeers"]);
      assert.equal(imported["profile"], FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
      assert.deepEqual(imported["documentTypes"], ["SYMBOL", "FOOTPRINT"]);
      assert.equal(imported["libraryEdits"], false); assert.equal(imported["historyCompaction"], false);
      assert.match(String(imported["proof"]), /sealed original immutable checkpoint.*tombstones.*occurrence order/u);
      assert.equal(imported["validation"], "offline-synthetic-regression;current-generation-live-unclaimed");
      assert.ok(z.array(z.string()).parse(imported["sources"]).includes("native-atom-header-history.ts"));
      assert.ok(z.array(z.string()).parse(imported["tests"]).includes("flat-display-imported-lifecycle.test.ts"));
    } else {
      assert.equal(restriction.exception, undefined);
    }
  }
});

void test("wire discovery isolates the sealed endpoint-only exception from generic schematic writes", () => {
  const result = queryOperationCatalog({ family: "design", operationAction: "sch.wire.modify" });
  const restrictionSchema = z.object({
    documentType: z.literal(1), reason: z.string(), exception: z.record(z.string(), z.unknown()),
  });
  const descriptorSchema = z.object({ sourceProfileRestrictions: z.array(restrictionSchema) });
  const [entry] = z.array(descriptorSchema).parse(result["entries"]);
  const restriction = entry?.sourceProfileRestrictions[0]; assert.ok(restriction);
  assert.match(restriction.reason, /invoke Save All/u);
  const exception = restriction.exception;
  assert.equal(exception["profile"], FLAT_WIRE_TRANSACTION_PROFILE);
  assert.equal(exception["executionState"], "blocked");
  assert.equal(exception["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
  assert.equal(exception["executionAuthorized"], false);
  assert.equal(exception["electricalConnectivityChanges"], false);
  assert.equal(exception["liveValidation"], "offline-regression;current-generation-live-unclaimed");
  assert.match(String(exception["targets"]), /preserve every LINE ID\/count\/style and every ATTR field/u);
  assert.match(String(exception["requiredProof"]), /contact-incidence multiset/u);
  assert.match(String(exception["inverse"]), /fresh complete durable checkpoint remains the baseline/u);
  assert.match(String(exception["markerRestrictions"]), /no shared-WIRE endpoints or pin-bearing junctions/u);
});

void test("catalog pagination covers every strict design and library discriminator once", () => {
  for (const family of ["design", "library"] as const) {
    const actions: string[] = [];
    let offset = 0;
    for (;;) {
      const result = queryOperationCatalog({ family, offset, limit: 7 });
      assert.equal(result["offline"], true);
      assert.equal(result["executionAuthorized"], false);
      const page = z.array(z.object({ action: z.string() })).parse(result["entries"]);
      actions.push(...page.map((entry) => entry.action));
      if (result["hasMore"] === false) {
        assert.equal(actions.length, result["total"]);
        assert.equal(result["nextOffset"], null);
        break;
      }
      offset = z.number().int().parse(result["nextOffset"]);
    }
    assert.equal(new Set(actions).size, actions.length);
    assert.ok(actions.length > 50);
  }
});

void test("offline library discovery retains complete executor scope separately from structural schemas", () => {
  const capabilities = new Map(listLibraryExecutionCapabilities().map((entry) => [entry["action"], entry]));
  const catalog = queryOperationCatalog({ family: "library", limit: 100 });
  assert.equal(catalog["hasMore"], false);
  const actions = z.array(z.object({ action: z.string() })).parse(catalog["entries"]);
  for (const { action } of actions) {
    const capability = capabilities.get(action); assert.ok(capability);
    const result = queryOperationCatalog({ family: "library", operationAction: action, includeSchemas: true });
    const [entry] = z.array(z.record(z.string(), z.unknown())).parse(result["entries"]);
    assert.ok(entry);
    assert.deepEqual(entry["executionCapabilities"], capability);
    assert.equal(entry["status"], capability["status"]);
    assert.equal(result["executionAuthorized"], false);
    assert.equal(typeof entry["inputSchema"], "object");
  }
  const pcb = queryOperationCatalog({ family: "design", operationAction: "pcb.text.modify" });
  const [entry] = z.array(z.record(z.string(), z.unknown())).parse(pcb["entries"]);
  assert.ok(entry); assert.equal(Object.hasOwn(entry, "executionCapabilities"), false);
});

void test("exact action schemas preserve nested tuples, strict fields and parser defaults", () => {
  const result = queryOperationCatalog({ family: "design", operationAction: "pcb.component.model-transform", includeSchemas: true });
  const schemaRecord = z.record(z.string(), z.unknown());
  const schemaHash = z.string().regex(/^[a-f0-9]{64}$/u);
  const entrySchema = z.object({ action: z.string(), inputSchema: schemaRecord, inputSchemaSha256: schemaHash });
  const entries = z.array(entrySchema).parse(result["entries"]);
  assert.equal(entries.length, 1);
  const entry = entries[0]; assert.ok(entry);
  assert.equal(entry.inputSchema["additionalProperties"], false);
  assert.equal(entry.action, "pcb.component.model-transform");
  const expected = queryOperationCatalog({ family: "library", prefix: "document.", limit: 100 });
  const page = z.array(z.object({ action: z.string() })).parse(expected["entries"]);
  assert.ok(page.every((item) => item.action.startsWith("document.")));
  assert.equal(queryOperationCatalog({ family: "design", operationAction: "unknown" })["matched"], 0);
  const largePage = queryOperationCatalog({ family: "design", limit: 100, includeSchemas: true });
  assert.ok(Buffer.byteLength(JSON.stringify(largePage)) < 262_144);
});

void test("offline validation uses exact execution parsers including custom refinements", () => {
  const operation = { id: "export", action: "export.schematic.document", fileName: "review", maxBytes: 1024,
    fileType: "PDF", object: "Current Schematic Page", objectSpecificParams: { range: [1, 2], outputMethod: "Merged sheet" } };
  const valid = validateCatalogOperation({ family: "library", operation });
  assert.equal(valid["valid"], true);
  assert.deepEqual(valid["normalizedOperation"], libraryOperationSchema.parse(operation));
  assert.equal(valid["executionAuthorized"], false);
  const reversed = { ...operation, objectSpecificParams: { ...operation.objectSpecificParams, range: [2, 1] } };
  assert.equal(validateCatalogOperation({ family: "library", operation: reversed })["valid"], false);
  const pose = { id: "move", action: "pcb.component.modify", target: { primitiveId: "part" }, patch: { x: 10 } };
  assert.equal(validateCatalogOperation({ family: "design", operation: pose })["valid"], designActionSchema.safeParse(pose).success);
  assert.equal(validateCatalogOperation({ family: "design", operation: { ...pose, code: "arbitrary code" } })["valid"], false);
  assert.equal(validateCatalogOperation({ family: "design", operation: "raw code" })["valid"], false);
});

void test("offline catalog queries reject coercion, injection and unbounded selectors", () => {
  for (const input of [{ family: "design", limit: 101 }, { family: "library", offset: -1 },
    { family: "design", offset: "0" }, { family: "design", code: "call()" }, { family: "other" }]) {
    assert.equal(operationCatalogQuerySchema.safeParse(input).success, false);
    assert.throws(() => queryOperationCatalog(input));
  }
});

void test("large valid operations are acknowledged with hashes instead of echoed beyond the response bound", () => {
  const operation = { id: "source", action: "library.symbol.source.replace", libraryUuid: "library", target: { uuid: "symbol" }, documentSource: "x".repeat(1_048_576) };
  assert.equal(libraryOperationSchema.safeParse(operation).success, true);
  const result = validateCatalogOperation({ family: "library", operation });
  assert.equal(result["valid"], true);
  assert.equal(result["normalizedOperationOmitted"], true);
  assert.equal(Object.hasOwn(result, "normalizedOperation"), false);
  assert.ok(z.number().parse(result["normalizedOperationBytes"]) > 1_048_576);
  assert.match(z.string().parse(result["normalizedOperationSha256"]), /^[a-f0-9]{64}$/u);
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < 1024);
});

void test("invalid huge property names cannot expand field-path diagnostics beyond the inline bound", () => {
  const operation = { id: "metadata", action: "library.device.modify", libraryUuid: "library", target: { uuid: "device" },
    patch: { property: { otherProperty: { ["a".repeat(600_000)]: 1 } } } };
  const result = validateCatalogOperation({ family: "library", operation });
  assert.equal(result["valid"], false);
  const pathPartSchema = z.string().max(256);
  const issueSchema = z.object({ pathTruncated: z.boolean(), path: z.array(pathPartSchema) });
  const issues = z.array(issueSchema).parse(result["issues"]);
  assert.ok(issues.some((issue) => issue.pathTruncated));
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < 262_144);
});
