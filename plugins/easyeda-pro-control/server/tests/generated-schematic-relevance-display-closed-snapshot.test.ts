/** Original termination and factory gates precede any source descriptor open. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { GeneratedSchematicRelevanceDisplayClosedCapture, requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "../src/generated-schematic-relevance-display-closed-snapshot.ts";

void test("a descriptor/report or prototype-shaped owner cannot reconstruct the original closed capture", () => {
  assert.throws(() => Reflect.construct(GeneratedSchematicRelevanceDisplayClosedCapture, [{}, {}]));
  assert.throws(() => Reflect.apply(requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot, undefined, [{ schema: "private.generated-schematic-relevance-display-closed-snapshot.v1", originalRootAndJobReobservedClosed: true }, {}]), /ORIGINAL_SNAPSHOT/u);
});
