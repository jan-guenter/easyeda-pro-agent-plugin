/** Actual witness/preparation stages over synthetic streams and isolated SQL. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { encodeExactReadEnvelope } from "../../src/exact-readers.ts";
import { syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { witnessFixture } from "./closed-symbol-witness-fixture.ts";
import { ClosedSymbolSqlComparisonStage } from "../../src/closed-symbol-sql-comparison.ts";
import { ClosedSymbolWriteStage } from "../../src/closed-symbol-write.ts";

type WitnessFixture = Awaited<ReturnType<typeof witnessFixture>>;
type Witness = Awaited<ReturnType<WitnessFixture["stage"]["collect"]>>;
type Preparation = Awaited<ReturnType<ClosedSymbolSqlComparisonStage["prepareForWrite"]>>;
interface WriteState {
  calls: number; raw: unknown;
  before: (() => Promise<void> | void) | undefined;
  after: ((value: unknown) => Promise<void> | void) | undefined;
  fail: boolean; malformed: boolean;
}
type WriteFixture = WitnessFixture & {
  witness: Witness; sql: ClosedSymbolSqlComparisonStage; preparation: Preparation;
  writer: ClosedSymbolWriteStage; writeState: WriteState;
  writeInput: { journal: WitnessFixture["journal"]; witnessResult: Witness; preparation: Preparation };
};

export async function writeFixture(context: TestContext): Promise<WriteFixture> {
  const fixture = await witnessFixture(context), witness = await fixture.stage.collect(fixture.input);
  const sql = new ClosedSymbolSqlComparisonStage(fixture.engine, await syntheticSqlRuntime());
  const preparation = await sql.prepareForWrite({ journal: fixture.journal, generation: witness.generation, witnessResult: witness,
    baselineCopy: fixture.copied.copy, baselineInventory: fixture.copied.inventory });
  const status = await fixture.engine.status();
  const fingerprint = status.stableFingerprint;
  const stage = new ClosedSymbolWriteStage(fixture.engine, fixture.runtime, fixture.admission, fixture.relaunch, sql, fingerprint);
  const state: WriteState = { calls: 0, raw: undefined, before: undefined, after: undefined, fail: false, malformed: false };
  const upstream = fixture.engine.upstream;
  const original = upstream.callTool;
  context.mock.method(upstream, "callTool", async (...args: Parameters<typeof original>): Promise<Awaited<ReturnType<typeof original>>> => {
    if (!String(args[1]?.["code"]).includes("WORKER_TICKET_DRIFT")) { return original.call(upstream, ...args); }
    assert.equal(args[0], "easyeda_execute"); assert.equal(args[1]?.["confirmWrite"], true); assert.ok(args[3] !== undefined);
    const before = await loadClosedSymbolJournal(fixture.journal.operationId);
    assert.equal(before.events.at(-1)?.step, "edit-write"); assert.equal(before.events.at(-1)?.kind, "intent");
    assert.equal(before.journal.mutationMayHaveOccurred, true); assert.equal(before.journal.orphanedCallPossible, true);
    state.calls += 1; await state.before?.();
    if (state.fail) { throw new Error("synthetic uncertain write reply"); }
    const value = state.malformed ? { unexpected: true } : { kind: "project-symbol-metadata", targetId: fixture.journal.plan.targetUuid, createdId: null };
    const raw = { content: [{ type: "text" as const, text: JSON.stringify(encodeExactReadEnvelope(value)) }] };
    state.raw = raw; await state.after?.(raw); return raw;
  });
  return { ...fixture, witness, sql, preparation, writer: stage, writeState: state,
    writeInput: { journal: fixture.journal, witnessResult: witness, preparation } };
}
