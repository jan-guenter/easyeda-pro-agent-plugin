import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { FAMILY, createClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { VALIDATION_ACTION_ID } from "../src/closed-symbol-target-claim.ts";
import { newOperationId } from "../src/core.ts";
import { historicalAbandonmentRequestSchema, runHistoricalAbandonment } from "../src/historical-abandonment.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

const OPERATION_ID = "easyeda-synthetic-historical-abandonment";
const REQUEST = { action: "abandon-before-navigation", operationId: OPERATION_ID,
  confirmation: `${OPERATION_ID}:abandoned-before-navigation` };

void test("historical abandonment exposes one strict action and exact operation confirmation", () => {
  assert.deepEqual(historicalAbandonmentRequestSchema.parse(REQUEST), REQUEST);
  for (const input of [
    { ...REQUEST, confirmation: "abandoned-before-navigation" },
    { ...REQUEST, confirmation: `${OPERATION_ID}:reconciled-no-mutation` },
    { ...REQUEST, operationId: "../foreign" },
    { ...REQUEST, operationId: "easyeda-UPPERCASE-ID" },
    { ...REQUEST, action: "reconciled-no-mutation" },
    { ...REQUEST, action: "inspect" },
  ]) { assert.equal(historicalAbandonmentRequestSchema.safeParse(input).success, false); }
});

void test("legacy recovery flags and code refuse before any historical lookup", async () => {
  for (const addition of [
    { runtimeRestartConfirmation: "invented" },
    { confirmDiscardAnyUnsavedState: false },
    { confirmRepeatAfterUnknownRecovery: false },
    { resolution: "abandoned-before-navigation" },
    { code: "arbitrary()" },
    { expectedFingerprint: {} },
  ]) {
    await assert.rejects(runHistoricalAbandonment({ ...REQUEST, ...addition }), { name: "ZodError" });
  }
  await assert.rejects(runHistoricalAbandonment({ ...REQUEST, confirmation: "wrong" }), { name: "ZodError" });
});

void test("a genuine unsupported journal reaches maintained qualification without changing its bytes", async () => {
  const digest = "a".repeat(64), projectUuid = "b".repeat(64), targetUuid = "c".repeat(16);
  const journal = await createClosedSymbolJournal(newOperationId(), {
    profile: FAMILY, projectUuid, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid,
    activeUuid: "f".repeat(16), projectPath: join(syntheticSqlRoot(), "never-created.eprj2"),
    operation: { id: VALIDATION_ACTION_ID, action: "library.symbol.modify", libraryUuid: projectUuid,
      target: { uuid: targetUuid }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) },
    nativePinsSha256: digest, facadeSha256: digest, expectedFingerprintSha256: digest,
  });
  const before = await readFile(journal.journalPath);
  await assert.rejects(runHistoricalAbandonment({ ...REQUEST, operationId: journal.operationId,
    confirmation: `${journal.operationId}:abandoned-before-navigation` }), /exact unquarantined validation prefix/u);
  assert.deepEqual(await readFile(journal.journalPath), before);
  const sidecar = join(journal.journalPath.slice(0, -5), "abandoned-before-navigation.json");
  await assert.rejects(stat(sidecar), { code: "ENOENT" });
});
