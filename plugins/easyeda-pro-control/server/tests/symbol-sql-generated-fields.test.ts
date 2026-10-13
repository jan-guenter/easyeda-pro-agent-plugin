import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { test } from "node:test";
import { prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "../src/symbol-sql-comparator.ts";
import { HISTORY_TABLE, OPERATION, WITNESS, applyEffect, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("fresh cryptographic fields generated after preparation are admitted by relationships and plaintext", async () => {
  const input = await fixture();
  const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  const headUuid = randomUUID().replaceAll("-", "");
  const keyHex = randomBytes(16).toString("hex");
  applyEffect(input.path, expectedRaw(), headUuid, keyHex);
  const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["newHistoryUuid"], headUuid);
  assert.equal(proof["exactLogicalSqlEffect"], true);
  assert.equal(proof["producerBindingVerified"], false);
});

void test("valid-looking replacement key cannot authenticate the intended ciphertext", async () => {
  const input = await fixture();
  const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  applyEffect(input.path);
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET key='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' WHERE id=6`);
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)), /chunk-decode/u);
});

void test("an unlocked future-created head cannot qualify for the aged new-head case", async () => {
  const input = await fixture();
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:35:01' WHERE id=5`);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION,
    witness: { ...WITNESS, agedHead: { createdAtLiteral: "2026-10-12 12:35:01",
      nativeParsedLocalMs: Date.parse("2026-10-12T10:35:01Z"), nativeTimezoneOffsetMinutes: -120 } } }), /every possible/u);
});

void test("historical local parsing and current native timezone offset need not be equal", async () => {
  const input = await fixture();
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0 WHERE id=5`);
  // Synthetic winter parsing is UTC+1; the independently supplied current
  // Offset is UTC+2. Native q2 uses both values, not a single UTC reinterpretation.
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION,
    witness: { ...WITNESS, agedHead: { createdAtLiteral: "2020-01-01 00:00:00",
      nativeParsedLocalMs: Date.parse("2019-12-31T23:00:00Z"), nativeTimezoneOffsetMinutes: -120 } } });
  applyEffect(input.path);
  const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["headEligibility"], "aged-unlocked");
  assert.equal(proof["exactLogicalSqlEffect"], true);
});
