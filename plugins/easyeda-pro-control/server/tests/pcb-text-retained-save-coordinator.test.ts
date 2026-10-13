import { test } from "node:test";
import { assertBlockedTextHistory } from "./pcb-text-blocked-lifecycle-fixture.ts";

// Complete pure retained-Save authority/effect leaves still have their own
// Suites. No document-only checkpoint proof can drain the structure job.
for (const legacy of [true, false]) {
  for (const scenario of ["acknowledged", "missing-return", "duplicate-intent", "cancelled-intent", "inverse", "collateral-observation"] as const) {
    void test(`${legacy ? "legacy" : "v2"} PCB text retained Save ${scenario} stays inspectable but nonterminal recovery refuses`, async () => {
      await assertBlockedTextHistory(legacy, true, scenario);
    });
  }
  void test(`${legacy ? "legacy" : "v2"} completed PCB text Save stays immutable historical evidence, without another read or Save`, async () => {
    await assertBlockedTextHistory(legacy, true, "acknowledged", true);
  });
}
