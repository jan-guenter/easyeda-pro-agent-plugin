import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { designActionSchema } from "../src/design-action.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { operationCatalogQuerySchema, queryOperationCatalog, validateCatalogOperation } from "../src/operation-catalog.ts";

void test("schematic operation discovery exposes the current type-1 topology execution restriction", () => {
  const restricted = queryOperationCatalog({ family: "design", operationAction: "sch.wire.modify" });
  const restriction = z.object({ documentType: z.literal(1), reason: z.string() });
  const descriptor = z.object({ executionRestrictions: z.array(restriction) });
  const entries = z.array(descriptor).parse(restricted["entries"]);
  assert.match(entries[0]?.executionRestrictions[0]?.reason ?? "", /invoke Save All/u);
  const pcb = queryOperationCatalog({ family: "design", operationAction: "pcb.via.modify" });
  const pcbEntries = z.array(z.record(z.string(), z.unknown())).parse(pcb["entries"]);
  assert.equal(Object.hasOwn(pcbEntries[0] ?? {}, "executionRestrictions"), false);
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
