/** Synthetic native-schema SQLite and cipher data, with real complete readers.
 * Supplied callback observations issue no native owner, clock or SQL grant. */
/* oxlint-disable import/max-dependencies -- Exercise the exact native SQL, independent cipher, original plan issuers and complete SQLite reader relation together. */
import assert from "node:assert/strict";
import { copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { StatementResultingChanges } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { sha256Text } from "../src/core.ts";
import { compareCurrentFootprintInverseNativeDeleteClosedSqlDelta as compare } from "../src/current-footprint-inverse-native-delete-closed-sql-delta.ts";
import { currentFootprintInverseMainHistoryValueSchema } from "../src/current-footprint-inverse-main-history-baseline.ts";
import { prepareCurrentFootprintDeletePlan } from "../src/current-footprint-delete-plan.ts";
import { prepareCurrentFootprintDeleteObservedPlan } from "../src/current-footprint-delete-observed-plan.ts";
import type { CurrentProjectHistorySqlEffects, CurrentProjectHistorySqlNativeCallback, CurrentProjectHistorySqlSlot } from "../src/current-project-history-sql-effects.ts";
import { CURRENT_PROJECT_HISTORY_SQL as SQL, currentProjectSelectedHistorySql } from "../src/current-project-history-sql-data.ts";
import type { NativeSqlInventory } from "../src/sqlite-inventory-core.ts";
import { DELETE_TARGET, footprintDeleteSqlFixture } from "./helpers/current-footprint-delete-sql-fixture.ts";
import { IDS, encrypted, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

function history(before: NativeSqlInventory, projectUuid: string): ReturnType<typeof currentFootprintInverseMainHistoryValueSchema.parse> {
  const table = before.tables.find(value => value.name === `project_history_${IDS.branch}`);
  assert.ok(table !== undefined);
  const names = table.columns.map(column => String(column["name"]));
  const rows = table.rows.map(row => Object.fromEntries(names.map((name, index): readonly [string, string | number | null] => {
    const cell = row.cells[index]; assert.ok(cell !== undefined);
    if (cell.kind === "text") { return [name, Buffer.from(cell.hex, "hex").toString("utf8")]; }
    if (cell.kind === "integer") { return [name, Number(cell.decimal)]; }
    assert.equal(cell.kind, "null"); return [name, null];
  }))).toSorted((left, right) => Number(right["id"]) - Number(left["id"]));
  const parsed = currentFootprintInverseMainHistoryValueSchema.parse({
    projectUuid: "1".repeat(64), branchUuid: IDS.branch, historyUuid: IDS.newHead,
    rows: rows.map(row => ({ id: row["id"], uuid: row["uuid"], parent: row["parent"], key: row["key"],
      is_lock: row["is_lock"], num: row["num"], snapshot_num: row["snapshot_num"],
      created_at: row["created_at"], updated_at: row["updated_at"], lock_time: row["lock_time"], iv: row["uuid"] })),
  });
  // The historical Main reply parser remains 64-only. This pure data case
  // Tests the baseline's 32/64 projection, never a native Main32 issuer.
  return { ...parsed, projectUuid };
}
async function fixture(observed: boolean, context: TestContext): Promise<Readonly<{
  path: string; before: NativeSqlInventory; after: NativeSqlInventory;
  prior: ReturnType<typeof history>;
  plan: ReturnType<typeof prepareCurrentFootprintDeletePlan> | ReturnType<typeof prepareCurrentFootprintDeleteObservedPlan>;
  effects: CurrentProjectHistorySqlEffects;
}>> {
  const original = await footprintDeleteSqlFixture();
  const directory = dirname(original.path);
  assert.match(directory, /\/easyeda-test-control-[^/]+\/synthetic-symbol-sql-[^/]+$/u);
  context.after(async () => { await rm(directory, { recursive: true, force: false }); });
  const projectUuid = observed ? "1".repeat(64) : IDS.project;
  mutate(original.path, `UPDATE sqlite_sequence SET seq=37 WHERE name='history_data';
    UPDATE project_history_${IDS.branch} SET id=64,is_lock=1 WHERE uuid='${IDS.newHead}';
    UPDATE projects SET uuid='${projectUuid}';UPDATE branches SET project_uuid='${projectUuid}';
    UPDATE project_structures SET project_uuid='${projectUuid}';UPDATE project_images SET project_uuid='${projectUuid}'`);
  const before = await inventory(original.path), prior = history(before, projectUuid);
  const input = { targetUuid: DELETE_TARGET, client: "f".repeat(16), maximumTicketBeforeClock: 102,
    maximumTicketAfterClock: 102, documentClock: Date.now(), managerUserAbsent: true };
  const plan = observed
    ? prepareCurrentFootprintDeleteObservedPlan({ ...input, workerEditorVersionPresent: false, workerEditorVersionUndefined: true, workerEditorVersion: null })
    : prepareCurrentFootprintDeletePlan({ ...input, editorVersion: "3.2.209" });
  const actor = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: Date.now() };
  const head = "bbbbbbbbbbbb4bbb8bbbbbbbbbbbbbbb", key = "c".repeat(32);
  const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify(actor)}|\n${plan.workerUpload}`;
  const cipher = encrypted(plaintext, head, key);
  const callbacks: CurrentProjectHistorySqlNativeCallback[] = [];
  const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  const database = new DatabaseSync(original.path, { enableForeignKeyConstraints: false });
  const run = (slot: CurrentProjectHistorySqlSlot, call: () => StatementResultingChanges): void => {
    const beforeEpochMs = Date.now();
    const result = call();
    const afterEpochMs = Date.now();
    callbacks.push({ slot, changes: Number(result.changes), lastID: Number(result.lastInsertRowid), beforeEpochMs, afterEpochMs });
  };
  try {
    database.exec("begin immediate transaction");
    run("data", () => database.prepare(SQL.historyData).run(head, head, cipher, cipher));
    run("head", () => database.prepare(currentProjectSelectedHistorySql(IDS.branch, "append")).run(head, IDS.newHead, null, key));
    run("branch", () => database.prepare(SQL.branch).run(head, IDS.branch));
    run("commit", () => database.prepare(SQL.commit).run());
    run("project", () => database.prepare(SQL.project).run(updatedAt, actor.uuid));
  } finally { database.close(); }
  const effects: CurrentProjectHistorySqlEffects = {
    schema: "private.current-project-history-sql-effects.v1", projectUuid, branchUuid: IDS.branch,
    initialLogicalSha256: before.logicalSha256, mode: "append", historyUuid: head, parentHistoryUuid: IDS.newHead,
    keyHex: key, chunkUuid: head, dataBase64: cipher, plaintextSha256: sha256Text(plaintext), bodySha256: plan.workerUploadSha256,
    historyNum: 0, actor, projectUpdatedAt: updatedAt, projectModifierUuid: actor.uuid,
    nativeCallbacks: callbacks, originalServiceAwaitCompleted: true, selectedSqlStillFenced: true,
  };
  return { path: original.path, before, after: await inventory(original.path), prior, plan, effects };
}
for (const observed of [false, true]) {
  void test(`native DELETE closed SQL preserves two prior heads and gaps with genuine ${observed ? "observed-v2/64" : "v1/32"} body and exact schema defaults`, async context => {
    const f = await fixture(observed, context);
    const result = await compare(f.before, f.after, f.prior, f.plan, f.effects);
    assert.equal(result.dataRowid, 38); assert.equal(result.headRowid, 65); assert.equal(result.preservedHeadCount, 2);
    assert.equal(result.retainedDocuments, 3); assert.equal(result.visibleDocuments, 2);
    assert.equal(result.maximumTicket, 103); assert.equal(result.targetUuid, DELETE_TARGET);
    assert.equal(result.completeSqlVerified, true); assert.equal(result.allPeerDocumentsUnchanged, true);
    assert.equal(result.structureRequests, 0); assert.equal(result.explicitSaveAttempts, 0);
    assert.equal(result.persistenceVerified, false); assert.equal(result.reopenedVerified, false); assert.equal(result.executionAuthorized, false);
    await assert.rejects(compare(structuredClone(f.before), f.after, f.prior, f.plan, f.effects), /original inventory/u);
    await assert.rejects(compare(f.before, f.after, f.prior, structuredClone(f.plan), f.effects), /FOOTPRINT_DELETE/u);
    const callbacks = f.effects.nativeCallbacks.map(value => value.slot === "data" ? { ...value, lastID: 2 } : value);
    await assert.rejects(compare(f.before, f.after, f.prior, f.plan, { ...f.effects, nativeCallbacks: callbacks }), /NATIVE_INSERT_IDS/u);
  });
}
void test("complete native DELETE relation refuses changed old rows, inherited head values, structure writes and callback/cipher substitutions", async context => {
  const f = await fixture(true, context);
  const mutations = {
    oldHead: `UPDATE project_history_${IDS.branch} SET is_lock=0 WHERE id=64`,
    inheritedLock: `UPDATE project_history_${IDS.branch} SET is_lock=1 WHERE id=65`,
    structure: "UPDATE project_structures SET ticket=ticket+1",
    peer: "UPDATE resources SET dataStr='changed peer'",
    oldCipher: "UPDATE history_data SET dataStr='changed old body' WHERE id=7",
    sequence: "UPDATE sqlite_sequence SET seq=39 WHERE name='history_data'",
    property: "PRAGMA user_version=1",
  };
  for (const [name, sql] of Object.entries(mutations)) {
    const path = join(dirname(f.path), `native-delete-negative-${name}.eprj2`);
    await copyFile(f.path, path); mutate(path, sql);
    await assert.rejects(compare(f.before, await inventory(path), f.prior, f.plan, f.effects), /FOOTPRINT_INVERSE_NATIVE_DELETE_CLOSED_SQL/u);
  }
  let hooks = 0; const hook = (): never => { hooks += 1; throw new Error("untrusted hook"); };
  const getter = Object.defineProperty({ ...f.effects }, "dataBase64", { get: hook, enumerable: true });
  await assert.rejects(compare(f.before, f.after, f.prior, f.plan, getter));
  await assert.rejects(compare(f.before, f.after, f.prior, f.plan, new Proxy(f.effects, { getPrototypeOf: hook })));
  assert.equal(hooks, 0);
  const callbacks = f.effects.nativeCallbacks.map(value => ({ ...value, beforeEpochMs: value.beforeEpochMs + 600_000, afterEpochMs: value.afterEpochMs + 600_000 }));
  await assert.rejects(compare(f.before, f.after, f.prior, f.plan, { ...f.effects, nativeCallbacks: callbacks }), /NATIVE_UTC_DEFAULTS/u);
  await assert.rejects(compare(f.before, f.after, f.prior, f.plan, { ...f.effects, keyHex: "d".repeat(32) }));
});
