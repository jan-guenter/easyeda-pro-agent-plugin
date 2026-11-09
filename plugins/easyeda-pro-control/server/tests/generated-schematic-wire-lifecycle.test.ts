/** Synthetic original method callbacks and complete source relations only.
 * No native controller, original worker, selected SQL or user design is used. */
/* oxlint-disable import/max-dependencies -- The regression joins independent original-issuer, v1/v2 program, cold-reader and source comparators without merging their schemas. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { generatedSchematicWireEditStageResultSchema } from "../src/generated-schematic-wire-edit-program.ts";
import { generatedSchematicWireLifecycleStageResultSchema } from "../src/generated-schematic-wire-lifecycle-program.ts";
import { compareGeneratedSchematicWireLifecycleEffect, compareGeneratedSchematicWireSaveStage, compareGeneratedSchematicWireSavedSourceData } from "../src/generated-schematic-wire-lifecycle-effect.ts";
import { generatedSchematicWireSavedReaderSceneSchema } from "../src/generated-schematic-wire-saved-reader-program.ts";
import { qualifyOriginalGeneratedSchematicWireEffect, requireOriginalGeneratedSchematicWireEffect } from "../src/generated-schematic-wire-native-effect.ts";
import { CurrentSchematicWireEditOwner } from "../src/current-schematic-wire-edit-owner.ts";
import { wireNativeFixture } from "./generated-schematic-wire-native-fixture.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";

void test("distinct Wire v2 awaits its only Save and preserves the immutable v1 result grammar", async () => {
  const native = wireNativeFixture("save-deferred", "v2"), { args } = wireData(); await native.call("capture");
  const before = await native.call("preflight"), modified = await native.call("modify"), observed = await native.call("observe");
  const effect = compareGeneratedSchematicWireLifecycleEffect(args, before, modified, observed);
  assert.equal(effect.originalNativeStagesJoined, false); assert.equal(effect.originalCallbackCompletionVerified, false);
  let settled = false;
  const pending = (async (): Promise<unknown> => { const result = await native.call("save"); settled = true; return result; })();
  await setImmediate(); assert.equal(settled, false); assert.equal(native.counts()["save"], 1); native.settleSave();
  const saved = generatedSchematicWireLifecycleStageResultSchema.parse(await pending);
  assert.equal(saved.saveAcknowledged, true); assert.equal(saved.savePromiseSettled, true); assert.equal(saved.persistenceVerified, false);
  assert.equal(generatedSchematicWireEditStageResultSchema.safeParse(saved).success, false);
  assert.equal(generatedSchematicWireEditStageResultSchema.safeParse({ ...saved, schema: "easyeda-pro-control.generated-schematic-wire-edit-stage.v1" }).success, false);
  assert.equal(compareGeneratedSchematicWireSaveStage(args, effect, saved).originalSaveInvocationVerified, false);
  const replay = generatedSchematicWireLifecycleStageResultSchema.parse(await native.call("save")); assert.equal(replay.ok, false);
  await assert.rejects(native.call("save")); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 1, allocation: 0 });
});
void test("Wire Save ambiguity or context/body drift consumes the attempt and never dispatches again", async () => {
  for (const mode of ["save-false", "save-reject", "save-window-drift", "save-peer-drift"] as const) {
    const native = wireNativeFixture(mode, "v2"); await native.call("capture"); await native.call("modify"); await native.call("observe");
    const saved = generatedSchematicWireLifecycleStageResultSchema.parse(await native.call("save"));
    assert.equal(saved.ok, false); assert.equal(saved.saveAttempted, true); assert.equal(saved.saveAcknowledged, false);
    await assert.rejects(native.call("save")); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 1, allocation: 0 });
  }
});
void test("fresh Wire reader needs no setter, action or SDK Save and keeps all seven source rows", async () => {
  const reader = wireNativeFixture("reader-no-writers", "reader"), { args } = wireData(); await reader.call("capture");
  const observed = generatedSchematicWireSavedReaderSceneSchema.parse(await reader.call("observe"));
  const saved = compareGeneratedSchematicWireSavedSourceData(args, observed.source);
  assert.equal(saved.exactLineGeometryVerified, true); assert.equal(saved.originalReaderVerified, false); assert.equal(saved.reopenedVerified, false);
  assert.deepEqual(reader.counts(), { actions: 0, points: 0, save: 0, allocation: 0 });
  await assert.rejects(reader.call("observe")); await assert.rejects(reader.call("modify")); await assert.rejects(reader.call("save"));
  assert.throws(() => compareGeneratedSchematicWireSavedSourceData(args, observed.source.replace('"key":"Relevance"', '"key":"Other"')), /PEER_CHANGED/u);
  assert.throws(() => compareGeneratedSchematicWireSavedSourceData(args, observed.source.replace('"endX":120', '"endX":121')), /EXACT_LINE_BODY/u);
});
void test("Wire stage comparison rejects mixed schemas/generations and original issuer refuses a forged owner before data access", async () => {
  const native = wireNativeFixture(), { args } = wireData(); await native.call("capture");
  const before = generatedSchematicWireEditStageResultSchema.parse(await native.call("preflight")), modified = generatedSchematicWireEditStageResultSchema.parse(await native.call("modify")), observed = generatedSchematicWireEditStageResultSchema.parse(await native.call("observe"));
  const effect = compareGeneratedSchematicWireLifecycleEffect(args, before, modified, observed);
  assert.throws(() => compareGeneratedSchematicWireLifecycleEffect(args, before, modified, { ...observed, windowTabId: "other" }), /ORIGINAL_GENERATION/u);
  assert.throws(() => compareGeneratedSchematicWireLifecycleEffect(args, before, modified, { ...observed, schema: "easyeda-pro-control.generated-schematic-wire-lifecycle-stage.v2" }), /ORIGINAL_GENERATION/u);
  assert.throws(() => compareGeneratedSchematicWireLifecycleEffect(args, before, { ...modified, originalPromiseSettled: false }, observed), /STAGE_STATE/u);
  const fake: unknown = Object.create(CurrentSchematicWireEditOwner.prototype); let touched = false;
  assert.throws(() => Reflect.apply(qualifyOriginalGeneratedSchematicWireEffect, undefined, [fake, { get target(): never { touched = true; throw new Error("caller target"); } }, before, modified, observed]));
  assert.equal(touched, false); assert.throws(() => Reflect.apply(requireOriginalGeneratedSchematicWireEffect, undefined, [{ profile: "private.generated-schematic-wire-native-effect.v1", projection: effect, originalNativeStagesJoined: true }, fake, args]), /ORIGINAL/u);
});
