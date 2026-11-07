/** Readonly model data only, using the existing inert fixed application graph. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicRelevanceSavedSourceData } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "../src/generated-schematic-relevance-display.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

void test("fresh readonly source comparison needs no synthetic Modify or Save stage and preserves every peer", async () => {
  const args = data().args; const vm = fixture(); await vm.call("capture");
  const before = generatedSchematicRelevanceDisplayStageResultSchema.parse(await vm.call("preflight"));
  assert.ok(before.source !== null); assert.throws(() => compareGeneratedSchematicRelevanceSavedSourceData(args, before.source ?? ""), /EXACT_LITERAL_TEXT_BODY/u);
  await vm.call("modify"); const observed = generatedSchematicRelevanceDisplayStageResultSchema.parse(await vm.call("observe"));
  const source = observed.source; assert.ok(source !== null); const counts = vm.counts();
  const result = compareGeneratedSchematicRelevanceSavedSourceData(args, source);
  assert.equal(result.explicitRelevanceAttributePreserved, true); assert.equal(result.rootIndices.length, 3);
  assert.equal(result.originalReaderVerified, false); assert.equal(result.coldLoadVerified, false); assert.equal(result.persistenceVerified, false); assert.equal(result.reopenedVerified, false); assert.equal(result.executionAuthorized, false);
  assert.equal(result.pageUuid, args.target.pageUuid); assert.equal(result.textId, args.operation.textId);
  for (const changed of [source.replace('"key":"Relevance"', '"key":"Other"'), source.replace(args.target.pageUuid, "0".repeat(32)), source.replace('"zIndex":1', '"zIndex":null')]) {
    assert.throws(() => compareGeneratedSchematicRelevanceSavedSourceData(args, changed));
  }
  assert.deepEqual(vm.counts(), counts); assert.equal(counts.save, 0);
});
