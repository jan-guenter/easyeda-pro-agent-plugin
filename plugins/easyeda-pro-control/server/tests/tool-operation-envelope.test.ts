import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { designActionSchema } from "../src/design-action.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { designToolOperationSchema, libraryToolOperationSchema } from "../src/tool-operation-envelope.ts";

void test("host publication omits tuple catalogs while keeping request fields", () => {
  for (const operation of [designToolOperationSchema, libraryToolOperationSchema]) {
    const published = z.toJSONSchema(z.object({ action: z.literal("execute"), operation, confirmWrite: z.literal(true) }).strict(), { target: "draft-7", io: "input" });
    assert.deepEqual(published.properties?.["operation"], {});
    assert.deepEqual(published.required, ["action", "operation", "confirmWrite"]);
    assert.equal(published.additionalProperties, false);
  }
});

void test("design envelope retains the complete strict operation parser", () => {
  const operation = { id: "shape", action: "pcb.component.model-transform", target: { primitiveId: "part" }, attributeId: "model",
    transform: { format: "affine-v2", linearColumnMajor: [1, 0, 0, 0, 1, 0, 0, 0, 1], translationMil: { x: 0, y: 0, z: 0 } } };
  assert.deepEqual(designToolOperationSchema.parse(operation), designActionSchema.parse(operation));
  for (const input of [null, "code", { ...operation, code: "caller code" }, { ...operation, transform: { ...operation.transform, linearColumnMajor: [1] } },
    JSON.parse('{"id":"shape","action":"pcb.component.model-transform","__proto__":{"injected":true}}') as unknown]) {
    assert.equal(designToolOperationSchema.safeParse(input).success, false);
    assert.equal(designActionSchema.safeParse(input).success, false);
  }
});

void test("library envelope retains ordered tuple and unknown-field rejection", () => {
  const operation = { id: "export", action: "export.schematic.document", fileName: "preview", maxBytes: 2048,
    fileType: "PDF", object: "Current Schematic Page", objectSpecificParams: { range: [1, 2], outputMethod: "Merged sheet" } };
  assert.deepEqual(libraryToolOperationSchema.parse(operation), libraryOperationSchema.parse(operation));
  for (const input of [{ ...operation, script: "caller code" }, { ...operation, objectSpecificParams: { ...operation.objectSpecificParams, range: [2, 1] } },
    { ...operation, objectSpecificParams: { ...operation.objectSpecificParams, range: [1, 2, 3] } }, undefined]) {
    assert.equal(libraryToolOperationSchema.safeParse(input).success, false);
    assert.equal(libraryOperationSchema.safeParse(input).success, false);
  }
});
