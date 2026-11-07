/** Forged historical data must refuse before any source or native operation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareGeneratedSchematicRelevanceSavedReadbackPlan, requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "../src/generated-schematic-relevance-saved-readback-plan.ts";

void test("copied or accessor-bearing lifecycle/reader plan cannot create a new reader preparation", () => {
  for (const profile of ["private.generated-schematic-relevance-closed-lifecycle.v1", "private.generated-schematic-relevance-saved-readback-plan.v1"]) {
    let reads = 0; const value = Object.defineProperty({}, "profile", { get() { reads += 1; throw new Error("untrusted getter"); } });
    for (const input of [value, Object.freeze({ profile })]) {
      assert.throws(() => Reflect.apply(prepareGeneratedSchematicRelevanceSavedReadbackPlan, undefined, [input]));
      assert.throws(() => Reflect.apply(requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan, undefined, [input]));
    }
    assert.equal(reads, 0);
  }
});
