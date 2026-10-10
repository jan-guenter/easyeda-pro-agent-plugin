import assert from "node:assert/strict";
import { test } from "node:test";
import { transactionError } from "../src/transaction-error.ts";
import { boundedTransactionErrorOutput } from "../src/transaction-error-output.ts";

const JOURNAL = { operationId: "easyeda-fixture-12345678", state: "check-needs-review", orphanedCallPossible: false, nextSafeAction: "Inspect the retained journal." };
void test("only journal-issued bounded recovery coordinates reach failure output", () => {
  const failure = transactionError(new Error("not exported here"), JOURNAL);
  assert.deepEqual(boundedTransactionErrorOutput(failure), { operationId: JOURNAL.operationId, transactionState: JOURNAL.state,
    orphanedCallPossible: false, nextSafeAction: JOURNAL.nextSafeAction });
  const forged = Object.assign(new Error("native response"), { ...JOURNAL, transactionState: JOURNAL.state });
  assert.deepEqual(boundedTransactionErrorOutput(forged), {});
  Reflect.set(failure, "operationId", "caller-overwrite");
  assert.equal(boundedTransactionErrorOutput(failure).operationId, JOURNAL.operationId);
  for (const changed of [{ ...JOURNAL, operationId: "../outside" }, { ...JOURNAL, state: "x".repeat(129) },
    { ...JOURNAL, nextSafeAction: "x".repeat(4097) }, { ...JOURNAL, nextSafeAction: "bad\0text" }]) {
    const invalid = transactionError(new Error("failure"), changed);
    assert.deepEqual(boundedTransactionErrorOutput(invalid), {});
  }
});
