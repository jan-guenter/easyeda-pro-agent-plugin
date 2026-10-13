import { test } from "node:test";
import { assertSealedApplyRefusal } from "./design-structure-transaction-fixture.ts";

// The former enabled-coordinator matrix is historical Git evidence. Its
// Post-dispatch paths are unavailable until the structure-job proof exists.
// Pure profile, encoding, persistence and native-program suites remain active.
for (const confirmWrite of [false, true]) {
  void test(`imported-display sealed preparation grants no apply or Save-preflight authority with confirmation ${String(confirmWrite)}`, async () => {
    await assertSealedApplyRefusal("imported-display", confirmWrite);
  });
}
