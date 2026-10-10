import assert from "node:assert/strict";
import { test } from "node:test";
import { transactionError, transactionErrorDetails } from "../src/transaction-error.ts";

void test("tracked failure preserves its error and journal recovery identity", () => {
  const source = new Error("Source did not match");
  const journal = { operationId: "easyeda-fixture-1234", state: "apply-needs-review", orphanedCallPossible: false, nextSafeAction: "Inspect" };
  assert.equal(transactionError(source, journal), source);
  assert.deepEqual(transactionErrorDetails(source), { operationId: journal.operationId, transactionState: journal.state, orphanedCallPossible: false, nextSafeAction: "Inspect" });
  assert.equal(transactionError({ privateNativeText: "withheld" }, journal).message.includes("withheld"), false);
});
