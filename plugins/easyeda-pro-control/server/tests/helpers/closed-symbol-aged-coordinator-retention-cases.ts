import assert from "node:assert/strict";
import { test } from "node:test";
import { ClosedSymbolCoordinator, assertOriginalAgedClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import type { OriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";

for (const changed of ["caller", "owner"] as const) {
  void test(`successful actual reference remains retained after immediate ${changed} drift, without edit launch`, async (context) => {
    const f = await agedCoordinatorFixture(context);
    // oxlint-disable-next-line typescript/unbound-method -- Capture the original prototype function for transparent delegation with its real stage receiver.
    const original = ClosedSymbolMainReferenceStage.prototype.runOnce;
    let received: OriginalMainReference | undefined;
    let calls = 0;
    context.mock.method(ClosedSymbolMainReferenceStage.prototype, "runOnce", async function delegated(this: ClosedSymbolMainReferenceStage,
      input: Parameters<typeof original>[0]): ReturnType<typeof original> {
      calls += 1; const value = await original.call(this, input); received = value;
      if (changed === "caller") { f.plan["targetUuid"] = "0".repeat(32); }
      else { const lifecycle = f.upstream.bridgeSessionLifecycle.bind(f.upstream); context.mock.method(f.upstream, "bridgeSessionLifecycle", lifecycle); }
      return value;
    });
    await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), changed === "caller" ? /full caller or exclusive owner changed/u : /retained owner methods changed/u);
    assert.equal(calls, 1); assert.ok(received !== undefined);
    const operationId = received.operationId, retained = f.stage.retained();
    assert.equal(retained["mainReference"], received); assert.equal(assertOriginalMainReference(received, f.engine, operationId), received);
    assert.ok(retained["mainReferenceRaw"] !== undefined);
    assert.equal(f.transport.calls, 1); assert.equal(f.events.filter((event) => event === "launch").length, 1);
    assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 0); assert.equal(f.transport.rendererCalls, 0);
    const loaded = await loadClosedSymbolJournal(operationId); assert.equal(loaded.events.length, 10);
    assert.throws(() => assertOriginalAgedClosedSymbolFullEvidence(retained, f.engine, operationId), /original successful coordinator/u);
    await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed/u); await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u);
    assert.equal(f.transport.calls, 1);
    if (changed === "caller") {
      const replacement = new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity);
      await assert.rejects(replacement.recordAgedFullEvidence(f.plan), /consumed/u);
    }
  });
}
