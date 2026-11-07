/** An empty original registry cannot be replaced by owner/origin JSON. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireOriginalCurrentSchematicRelevanceSavedSceneOrigin, sendOriginalCurrentSchematicRelevanceSavedScene } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "../src/current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedSceneOrigin } from "../src/current-schematic-relevance-saved-scene-origin.ts";

void test("scene-looking objects and cleanup labels never invoke a getter or supply native authority", () => {
  let reads = 0; const origin = Object.freeze({ get profile(): string { reads += 1; return "private.current-schematic-relevance-saved-scene-origin.v1"; } });
  const owner = Object.freeze({ get status(): never { reads += 1; throw new Error("foreign owner getter"); } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate foreign objects must refuse at the original private registry before property access.
  const fakeOrigin = origin as CurrentSchematicRelevanceSavedSceneOrigin;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately copied owner labels supply no original factory or native handles.
  const fakeOwner = owner as unknown as CurrentSchematicRelevanceSavedReadbackOwner;
  assert.throws(() => requireOriginalCurrentSchematicRelevanceSavedSceneOrigin(fakeOrigin, fakeOwner), /SCHEMATIC_SAVED_SCENE_ORIGINAL/u);
  assert.throws(() => sendOriginalCurrentSchematicRelevanceSavedScene(fakeOwner, fakeOrigin, 0, "capture"), /SCHEMATIC_SAVED_SCENE_ORIGINAL/u);
  assert.throws(() => sendOriginalCurrentSchematicRelevanceSavedScene(fakeOwner, fakeOrigin, 2, "release"), /SCHEMATIC_SAVED_SCENE_ORIGINAL/u);
  assert.equal(reads, 0);
});
