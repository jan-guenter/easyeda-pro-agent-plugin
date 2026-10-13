import assert from "node:assert/strict";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { assertOriginalClosedSymbolWitness } from "../../src/closed-symbol-witness.ts";
import { revalidateOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { ClosedSymbolSqlComparisonStage } from "../../src/closed-symbol-sql-comparison.ts";
import { syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { agedWitnessFixture } from "./aged-symbol-witness-fixture.ts";

void test("original prelaunch reference qualifies an unlocked original baseline without another dispatch", async (context) => {
  const f = await agedWitnessFixture(context);
  assert.strictEqual(await revalidateOriginalMainReference(f.reference, f.engine, f.journal.operationId), f.reference);
  const result = await f.collector.collect(f.collectInput);
  assert.strictEqual(assertOriginalClosedSymbolWitness(result, f.engine, f.journal.operationId), result);
  assert.ok(result.witness.agedHead !== undefined); assert.equal(result.witness.agedHead.createdAtLiteral, "2026-01-15 12:34:56");
  assert.equal(result.witness.agedHead.nativeTimezoneOffsetMinutes, -120);
  assert.equal(result.witness.agedHead.nativeParsedLocalMs, Date.parse("2026-01-15T11:34:56Z"));
  assert.equal(f.agedState.calls, 1); assert.equal(f.transport.calls, 1); assert.equal(result.executionAuthorized, false);
  const prepared = await new ClosedSymbolSqlComparisonStage(f.engine, await syntheticSqlRuntime()).prepareForWrite({
    journal: f.journal, generation: result.generation, witnessResult: result, baselineCopy: f.copied.copy, baselineInventory: f.copied.inventory,
  });
  assert.equal(prepared.sqlPlan.headEligibility, "aged-unlocked"); assert.equal(prepared.executionAuthorized, false);
  const retained = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(retained.events.at(-1)?.step, "edit-witness");
  assert.equal(retained.journal.sequence, 20); assert.equal(retained.journal.saved, false);
  await assert.rejects(f.collector.collect(f.collectInput), /already consumed/u); assert.equal(f.agedState.calls, 1);
});
for (const kind of ["missing", "clone"] as const) {
  void test(`unlocked head refuses ${kind} reference before the witness call`, async (context) => {
    const f = await agedWitnessFixture(context);
    const { mainReference, ...withoutReference } = f.collectInput;
    const input = kind === "missing" ? withoutReference : { ...withoutReference, mainReference: structuredClone(mainReference) };
    await assert.rejects(f.collector.collect(input), /Unlocked|not issued/u); assert.equal(f.agedState.calls, 0);
  });
}
