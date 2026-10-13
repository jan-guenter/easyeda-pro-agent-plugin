import assert from "node:assert/strict";
import { test } from "node:test";
import { listOperationStates } from "../src/artifacts.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { noAuthorityExecutor } from "./design-structure-transaction-fixture.ts";
import { assertBlockedTextHistory } from "./pcb-text-blocked-lifecycle-fixture.ts";
import { CONTEXT, CREATED, OPERATION } from "./pcb-text-retained-save-fixture.ts";

for (const operation of [OPERATION, { id: "delete-text", action: "pcb.text.delete", target: { primitiveId: CREATED } }]) {
  void test(`${operation.action} refuses before reserving identity, preparing code or publishing a journal`, async () => {
    const before = await listOperationStates(), run = noAuthorityExecutor();
    await assert.rejects(run.executor.apply({ operation, expectedContext: CONTEXT, expectedFingerprint: {}, confirmWrite: true }),
      { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL });
    assert.deepEqual(run.accesses, []); assert.deepEqual(await listOperationStates(), before);
  });
}
for (const scenario of ["acknowledged", "missing-return", "foreign-return", "wrong-primitive", "missing-preparation", "orphaned", "collateral-observation"] as const) {
  void test(`historical PCB text ${scenario} preserves original identities and evidence without acquiring execution authority`, async () => {
    await assertBlockedTextHistory(false, false, scenario);
  });
}
