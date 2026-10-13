/** Existing maintained synthetic boundaries; original stages and SQL are not replaced. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import type { TestContext } from "node:test";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";
import { HISTORY_TABLE, IDS, mutate } from "./symbol-sql-fixture.ts";
import { operationPath } from "../../src/artifacts.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";

type Fixture = Omit<Awaited<ReturnType<typeof agedCoordinatorFixture>>, "stage"> & { stage: ClosedSymbolCoordinator };
export async function fixture(context: TestContext, kind: "locked" | "aged" | "recent" = "locked"): Promise<Fixture> {
  const base = await agedCoordinatorFixture(context, kind === "recent");
  assert.equal(base.stage.constructor, ClosedSymbolCoordinator, "Fixture must use the single maintained coordinator class");
  if (kind === "locked") { mutate(base.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=1,created_at='2020-01-01 00:00:00' WHERE uuid='${IDS.oldHead}'`); }
  return { ...base, stage: base.stage };
}
export function setBadHead(f: Fixture, kind: "integer" | "blob" | "missing" | "schema"): void {
  if (kind === "integer") { mutate(f.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=2 WHERE uuid='${IDS.oldHead}'`); }
  else if (kind === "blob") { mutate(f.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=X'31' WHERE uuid='${IDS.oldHead}'`); }
  else if (kind === "missing") { mutate(f.source, `UPDATE branches SET history_uuid='${"e".repeat(32)}' WHERE uuid='${IDS.branch}'`); }
  else { mutate(f.source, "CREATE TABLE synthetic_unsupported(value TEXT)"); }
  const database = new DatabaseSync(f.source, { readOnly: true });
  try {
    if (kind === "integer" || kind === "blob") {
      const row = database.prepare(`SELECT typeof(is_lock) AS kind,hex(is_lock) AS value FROM "${HISTORY_TABLE}" WHERE uuid=?`).get(IDS.oldHead);
      assert.equal(row?.["kind"], kind); assert.equal(row?.["value"], kind === "blob" ? "31" : "32");
    } else if (kind === "missing") { assert.equal(database.prepare("SELECT history_uuid FROM branches WHERE uuid=?").get(IDS.branch)?.["history_uuid"], "e".repeat(32)); }
    else { assert.ok(database.prepare("SELECT name FROM sqlite_schema WHERE name='synthetic_unsupported'").get() !== undefined); }
  } finally { database.close(); }
}
export async function phase(f: Fixture, expected: number): Promise<string> {
  const operationId = f.stage.retained()["operationId"]; assert.equal(typeof operationId, "string");
  const loaded = await loadClosedSymbolJournal(String(operationId)); assert.equal(loaded.events.length, expected);
  return String(operationId);
}
export async function assertConsumed(f: Fixture): Promise<void> {
  const operationId = String(f.stage.retained()["operationId"]); const before = await readFile(operationPath(operationId));
  const events = [...f.events], references = f.transport.calls;
  for (const stage of [f.stage, new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity)]) {
    await assert.rejects(stage.recordAutomaticFullEvidence(f.plan), /consumed|active/u);
    await assert.rejects(stage.recordFullEvidence(f.plan), /consumed|active/u);
    await assert.rejects(stage.recordAgedFullEvidence(f.plan), /consumed|active/u);
    await assert.rejects(stage.recordBaseline(f.plan), /consumed|active/u);
  }
  assert.deepEqual(await readFile(operationPath(operationId)), before); assert.deepEqual(f.events, events); assert.equal(f.transport.calls, references);
}
