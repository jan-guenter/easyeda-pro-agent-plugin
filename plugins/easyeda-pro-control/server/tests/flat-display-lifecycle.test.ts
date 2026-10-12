import { test } from "node:test";
import { assertHistoricalFlatRefusal } from "./design-structure-transaction-fixture.ts";

void test("display legacy completed journal remains unchanged without a fabricated final observation or new read", async () => {
  await assertHistoricalFlatRefusal("display", "commit", "none", true);
});

// A checkpoint's decoded documents never establish completion of the pending
// Structure job. Even an apparently exact historical effect remains refused.
for (const action of ["commit", "rollback", "reconcile", "saved-reconcile"] as const) {
  for (const drift of ["none", "meta", "peer"] as const) {
    void test(`display historical ${action} with ${drift} drift remains inspectable but cannot acquire execution authority`, async () => {
      await assertHistoricalFlatRefusal("display", action, drift);
    });
  }
}
