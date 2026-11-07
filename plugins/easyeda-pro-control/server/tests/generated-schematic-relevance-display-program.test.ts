/** Inert source comparison and VM setter tests, not a native writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { generatedSchematicDisplayStageResultSchema } from "../src/generated-schematic-display.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "../src/generated-schematic-relevance-display.ts";
import { compareGeneratedSchematicRelevanceDisplayEffect } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { data, textId } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

void test("seven-row fixed stages retain a non-archive root permutation and exact Relevance ATTR", async () => {
  const vm = fixture(); await vm.call("capture"); const before = await vm.call("preflight"), modified = await vm.call("modify"), observed = await vm.call("observe");
  const effect = compareGeneratedSchematicRelevanceDisplayEffect(data().args, before, modified, observed); assert.equal(effect.rootIndices.find(row => row.id === textId)?.zIndex, 1); assert.equal(effect.explicitRelevanceAttributePreserved, true); assert.equal(effect.originalNativeStageProvenanceVerified, false); assert.equal(effect.inverseAvailable, false);
  assert.equal(generatedSchematicDisplayStageResultSchema.safeParse(before).success, false); assert.deepEqual(vm.counts(), { setSource: 0, setters: 2, transactions: 1, save: 0 });
  const changed = generatedSchematicRelevanceDisplayStageResultSchema.parse(observed); const changedSource = changed.source; assert.ok(changedSource !== null); assert.throws(() => compareGeneratedSchematicRelevanceDisplayEffect(data().args, before, modified, { ...changed, source: changedSource.replace('"key":"Relevance"', '"key":"Changed"') }), /COMPLETE_PEER/u);
  assert.throws(() => compareGeneratedSchematicRelevanceDisplayEffect(data().args, before, modified, { ...changed, source: changedSource.replace('"zIndex":1', '"zIndex":null') }), /ROOT_INDEX/u);
});
void test("unsettled roots, later root drift and original-window drift refuse without navigation or Save", async () => {
  const unsettled = fixture("unsettled"); const refused = generatedSchematicRelevanceDisplayStageResultSchema.parse(await unsettled.call("capture")); assert.equal(refused.ok, false); assert.deepEqual(unsettled.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 });
  const drift = fixture(); await drift.call("capture"); drift.edit('rootModel.children[0].zIndex=2;rootModel.children[2].zIndex=0;'); const changed = generatedSchematicRelevanceDisplayStageResultSchema.parse(await drift.call("preflight")); assert.equal(changed.ok, false);
  const window = fixture("window-drift"); await window.call("capture"); const partial = generatedSchematicRelevanceDisplayStageResultSchema.parse(await window.call("modify")); assert.equal(partial.ok, false); assert.equal(partial.modifyAttempted, true); assert.equal(partial.source, null); assert.deepEqual(window.counts(), { setSource: 0, setters: 1, transactions: 1, save: 0 });
});
void test("seven-row display admits only its two original qualified endpoint markers and keeps them stable", async () => {
  for (const change of ['markers[0]._cx+=1;', 'sourceMap.set(markers[0].id,1);', 'attribute.zIndex=1;', 'markers[0].connectionPointNode.Pin.add({});']) {
    const vm = fixture(); vm.edit(change); const refused = generatedSchematicRelevanceDisplayStageResultSchema.parse(await vm.call("capture"));
    assert.equal(refused.ok, false); assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 });
  }
  const vm = fixture(); await vm.call("capture");
  vm.edit('const oldMarker=wire.children[1],replacement={...oldMarker};wire.children[1]=replacement;index.set(oldMarker.id,replacement);wire._unConnectDotModels.delete(oldMarker);wire._unConnectDotModels.add(replacement);shapes.netPointManager.unConnectDotModels.delete(oldMarker);shapes.netPointManager.unConnectDotModels.add(replacement);');
  const refused = generatedSchematicRelevanceDisplayStageResultSchema.parse(await vm.call("preflight")); assert.equal(refused.ok, false); assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 });
});
