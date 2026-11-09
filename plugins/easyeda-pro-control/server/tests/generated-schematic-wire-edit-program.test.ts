/** Synthetic host graph; the constructor/geometry method bytes are pinned
 * vendor syntax. This supplies no original action, worker or persistence grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { generatedSchematicWireEditArgumentsValue, generatedSchematicWireEditStageResultSchema } from "../src/generated-schematic-wire-edit-program.ts";
import { compareGeneratedSchematicWireEditEffect } from "../src/generated-schematic-wire-edit-effect.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";
import { wireNativeFixture as fixture } from "./generated-schematic-wire-native-fixture.ts";

void test("fixed native LINE stage preserves all seven source rows and derives exactly two new endpoint dots", async () => {
  const native = fixture(), { args } = wireData(); await native.call("capture");
  const before = generatedSchematicWireEditStageResultSchema.parse(await native.call("preflight")), modified = generatedSchematicWireEditStageResultSchema.parse(await native.call("modify")), observed = generatedSchematicWireEditStageResultSchema.parse(await native.call("observe"));
  assert.equal(before.ok, true); assert.equal(modified.modifyAcknowledged, true); assert.equal(observed.ok, true);
  assert.equal(modified.persistenceVerified, false); assert.ok(before.source !== null && modified.source !== null && observed.source !== null);
  assert.equal(compareGeneratedSchematicWireEditEffect(args, before.source, modified.source, observed.source).completePeerBodyRosterPreserved, true);
  await native.call("modify"); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 0, allocation: 0 });
  await assert.rejects(native.call("save"));
});
void test("unknown implicit models refuse before action; post-setter drift consumes the only attempt", async () => {
  const foreign = fixture("foreign-marker"); const failed = generatedSchematicWireEditStageResultSchema.parse(await foreign.call("capture"));
  assert.equal(failed.ok, false); assert.equal(foreign.counts()["actions"], 0);
  for (const mode of ["window-drift", "changed-peer"] as const) {
    const native = fixture(mode); await native.call("capture"); const modified = generatedSchematicWireEditStageResultSchema.parse(await native.call("modify"));
    assert.equal(modified.ok, false); assert.equal(modified.modifyAttempted, true); assert.equal(modified.modifyAcknowledged, false);
    await assert.rejects(native.call("modify")); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 0, allocation: 0 });
  }
  let touched = false;
  assert.throws(() => Reflect.apply(generatedSchematicWireEditArgumentsValue, undefined, [{ get target(): never { touched = true; throw new Error("foreign"); } }, {}]));
  assert.equal(touched, false);
});
