import assert from "node:assert/strict";
import { test } from "node:test";
import { assertConsumed, fixture, phase, setBadHead } from "./closed-symbol-coordinator-automatic-fixture.ts";
import { selectionCalls } from "./closed-symbol-coordinator-automatic-observer.ts";
import { originalClosedSymbolFullEvidenceKind } from "../../src/closed-symbol-coordinator.ts";

for (const kind of ["integer", "blob", "missing", "schema"] as const) {
  void test(`actual SQL ${kind} contradiction refuses before reference or edit`, async (context) => {
    const f = await fixture(context); const calls = selectionCalls(); setBadHead(f, kind);
    const expected = { integer: /exact integers 0 and 1/u, blob: /own integer/u, missing: /row is not unique/u, schema: /SQL schema/u };
    await assert.rejects(f.stage.recordAutomaticFullEvidence(f.plan), expected[kind]);
    assert.equal(selectionCalls() - calls, 1); const operationId = await phase(f, 10);
    assert.equal(f.stage.retained()["headEligibility"], undefined);
    assert.equal(f.events.filter((value) => value === "launch").length, 1); assert.equal(f.events.filter((value) => value === "normal-close").length, 1);
    assert.equal(f.transport.calls, 0); assert.equal(f.state.opens, 0); assert.equal(f.state.writes, 0); assert.equal(f.state.reads, 0);
    assert.throws(() => originalClosedSymbolFullEvidenceKind(f.stage.retained(), f.engine, operationId), /original successful/u);
    await assertConsumed(f);
  });
}
