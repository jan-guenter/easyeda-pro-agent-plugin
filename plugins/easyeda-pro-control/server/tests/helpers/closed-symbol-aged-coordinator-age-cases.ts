import assert from "node:assert/strict";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";

void test("recent unlocked head never reaches write after actual reference and aged observation", async (context) => {
  const f = await agedCoordinatorFixture(context, true);
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /aged|61|old|eligible/u);
  const retained = f.stage.retained();
  const operationId = String(retained["operationId"]);
  const reference = assertOriginalMainReference(retained["mainReference"], f.engine, operationId);
  assert.equal(reference.request.createdAtLiteral, "2026-10-13 12:00:00");
  assert.equal(f.transport.calls, 1); assert.equal(f.transport.rendererCalls, 1);
  assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 1); assert.equal(f.state.reads, 0);
  const loaded = await loadClosedSymbolJournal(operationId);
  assert.equal(loaded.events.length, 20); assert.equal(loaded.events.at(-1)?.step, "edit-witness");
  assert.equal(f.events.filter((event) => event === "launch").length, 2);
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u); await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed/u);
  assert.equal(f.transport.calls, 1); assert.equal(f.state.writes, 0);
});
