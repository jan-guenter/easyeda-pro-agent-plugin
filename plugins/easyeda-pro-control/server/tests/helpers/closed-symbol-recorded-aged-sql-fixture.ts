/** Source-schema synthetic persistence at the actual mocked writer boundary. */
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import type { TestContext } from "node:test";
import { ClosedSymbolCloseStage } from "../../src/closed-symbol-close.ts";
import { ClosedSymbolCopyStage } from "../../src/closed-symbol-copy.ts";
import { appendClosedSymbolEvent } from "../../src/closed-symbol-journal.ts";
import { HISTORY_TABLE, IDS, TIMES, applyEffect, expectedRaw } from "./symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { writeFixture } from "./closed-symbol-recorded-aged-write-fixture.ts";
import { assertOriginalClosedSymbolComparison } from "../../src/closed-symbol-sql-comparison.ts";

type Base = Awaited<ReturnType<typeof writeFixture>>;
type Copy = Awaited<ReturnType<ClosedSymbolCopyStage["copy"]>>;
type Proof = Awaited<ReturnType<ClosedSymbolCloseStage["prove"]>>;
type Fixture = Base & { close: ClosedSymbolCloseStage; copyStage: ClosedSymbolCopyStage; edited: Copy; proof: Proof; sqlRuntime: Awaited<ReturnType<typeof syntheticSqlRuntime>>;
  originalWriteResult: Awaited<ReturnType<Base["writer"]["write"]>>; compareInput: Parameters<Base["sql"]["compareEdit"]>[0] };
export async function sqlStageFixture(context: TestContext): Promise<Fixture> {
  const f = await writeFixture(context);
  f.writeState.after = (): void => {
    const time = f.witness.witness.serverClockMinMs + 2000;
    const raw = expectedRaw().replaceAll(String(TIMES.document), String(time)).replaceAll(String(TIMES.edit), String(time + 1));
    // Simulate only the requested producer effect in this owned synthetic file.
    // No poststate value is fed back into the pre-dispatch plan.
    applyEffect(f.source.path, raw);
    const utc = new Date(time).toISOString().slice(0, 19).replace("T", " ");
    const local = new Date(time + f.witness.witness.serverLocalOffsetMinutes * 60_000).toISOString().slice(0, 19).replace("T", " ");
    const database = new DatabaseSync(f.source.path);
    try {
      database.prepare("UPDATE history_data SET created_at=?,updated_at=? WHERE uuid=?").run(utc, utc, IDS.newHead);
      database.prepare(`UPDATE "${HISTORY_TABLE}" SET created_at=?,updated_at=? WHERE uuid=?`).run(utc, utc, IDS.newHead);
      database.prepare("UPDATE projects SET updated_at=? WHERE uuid=?").run(local, IDS.project);
    } finally { database.close(); }
  };
  const originalWriteResult = await f.writer.write(f.writeInput);
  f.state.scope = false;
  const close = new ClosedSymbolCloseStage(f.engine, f.runtime);
  const capture = f.admission.originalCapture(f.journal.operationId, "edit-admission"); assert.ok(capture !== undefined);
  const closed = await close.close({ journal: f.journal, generation: f.witness.generation, capture, phase: "edit-close", windowHandle: "12345" });
  const proof = await close.prove(closed);
  const sqlRuntime = await syntheticSqlRuntime();
  const copyStage = new ClosedSymbolCopyStage(f.engine, sqlRuntime);
  const edited = await copyStage.copy(f.journal, "edit-copy", f.witness.generation, proof);
  return { ...f, close, copyStage, edited, proof, originalWriteResult, sqlRuntime,
    compareInput: { journal: f.journal, copy: edited.copy, inventory: edited.inventory, proof, preparation: f.preparation, originalWriteResult } };
}

export async function reopenForSqlComparison(f: Fixture): Promise<{
  originalEditComparison: Awaited<ReturnType<Base["sql"]["compareEdit"]>>; proof: Proof; copied: Copy;
  input: Parameters<Base["sql"]["compareVerification"]>[0];
}> {
  const originalEditComparison = await f.sql.compareEdit(f.compareInput);
  assertOriginalClosedSymbolComparison(originalEditComparison, f.engine, f.journal.operationId, "edit-sql-compare");
  await f.relaunch.launch({ journal: f.journal, phase: "verify-launch", proof: f.proof, copy: f.edited.copy, checkpoint: f.edited.checkpoint });
  f.state.scope = true; f.state.sequence += 1; f.state.generation = "synthetic-witness-runtime-0003";
  const admission = await f.admission.admit(f.journal, "verify-admission");
  // These stages are not under test here; do not claim browser/native reopen
  // Content qualification from these explicit synthetic historical markers.
  for (const step of ["verify-marker-read", "verify-open", "verify-content-read"] as const) {
    for (const kind of ["intent", "result"] as const) {
      await appendClosedSymbolEvent(f.journal, { step, kind, generation: admission.generation, requestSha256: "f".repeat(64), data: { syntheticOnly: true } });
    }
  }
  f.state.scope = false;
  const closed = await f.close.close({ journal: f.journal, generation: admission.generation, capture: admission.capture, phase: "verify-close", windowHandle: "12345" });
  const proof = await f.close.prove(closed);
  const copied = await f.copyStage.copy(f.journal, "verify-copy", admission.generation, proof);
  return { originalEditComparison, proof, copied, input: { journal: f.journal, proof, copy: copied.copy, inventory: copied.inventory, originalEditComparison } };
}
