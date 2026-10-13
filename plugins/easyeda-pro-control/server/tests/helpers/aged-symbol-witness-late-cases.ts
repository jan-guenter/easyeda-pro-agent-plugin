import assert from "node:assert/strict";
import { test } from "node:test";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { agedWitnessFixture } from "./aged-symbol-witness-fixture.ts";

void test("unlocked recent original head refuses despite qualified Date parsing", async (context) => {
  const f = await agedWitnessFixture(context, true);
  await assert.rejects(f.collector.collect(f.collectInput), /not old enough/u);
  assert.equal(f.agedState.calls, 1); assert.equal(f.transport.calls, 1);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  assert.equal(loaded.events.at(-1)?.kind, "result"); assert.equal(loaded.journal.saved, false);
  await assert.rejects(f.collector.collect(f.collectInput), /already consumed/u);
});

void test("aged collector refuses concurrent next-phase append at the final runtime boundary", async (context) => {
  const f = await agedWitnessFixture(context); let advanced = false;
  f.state.afterRuntime = async (): Promise<void> => {
    if (advanced || f.agedState.calls === 0) { return; }
    const loaded = await loadClosedSymbolJournal(f.journal.operationId);
    const last = loaded.events.at(-1);
    if (last?.step !== "edit-witness" || last.kind !== "result") { return; }
    advanced = true;
    await appendClosedSymbolEvent(loaded.journal, { step: "edit-write", kind: "intent", generation: last.generation,
      requestSha256: "a".repeat(64), data: { syntheticConcurrentWriter: true } });
  };
  await assert.rejects(f.collector.collect(f.collectInput), /durable journal advanced/u);
  assert.equal(advanced, true); assert.equal(f.agedState.calls, 1); assert.equal(f.journal.sequence, 18);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.journal.sequence, 21);
  assert.equal(loaded.journal.mutationMayHaveOccurred, true); assert.equal(loaded.journal.saved, false);
});
