/** Real synthetic SQLite/crypto/full-history checks. Supplied worker encoding
 * is data only; none of these fixtures owns an inverse/native application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireCurrentFootprintCopyDeleteObservedSqlLifecycle, verifyCurrentFootprintCopyDeleteObservedSqlLifecycle } from "../src/current-footprint-copy-delete-observed-sql-lifecycle.ts";
import { captureCurrentFootprintDeleteWorkerEncoding } from "../src/current-footprint-delete-observed-plan.ts";
import { completedCurrentFootprintDeleteObservedSqlSource, completedCurrentFootprintDeleteSqlSource, prepareCurrentFootprintDeleteObservedSqlPlan,
  prepareCurrentFootprintDeleteSqlPlan, verifyCurrentFootprintDeleteObservedSqlEffect, verifyCurrentFootprintDeleteSqlEffect } from "../src/current-footprint-delete-sql.ts";
import { currentFootprintDeleteObservedSavedSource, prepareCurrentFootprintDeleteObservedSavedProjection, verifyCurrentFootprintDeleteObservedSavedAbsence } from "../src/current-footprint-delete-observed-saved-source.ts";
import { DELETE_HEAD, DELETE_KEY, footprintDeleteSqlFixture } from "./helpers/current-footprint-delete-sql-fixture.ts";
import { encrypted, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("observed worker encoding has its own exact full-SQL/tombstone/saved-absence branch without widening v1", async () => {
  for (const [present, version] of [[false, null], [true, null], [true, "3.2.185"], [true, "3.2.209"]] as const) {
    const f = await footprintDeleteSqlFixture();
    const workerEncoding = captureCurrentFootprintDeleteWorkerEncoding({ workerEditorVersionPresent: present, workerEditorVersionUndefined: version === null, workerEditorVersion: version });
    const old = await prepareCurrentFootprintDeleteSqlPlan(f.input), plan = await prepareCurrentFootprintDeleteObservedSqlPlan({ ...f.input, workerEncoding });
    assert.equal(old.profile, "private.current-footprint-delete-sql-plan.v1"); assert.equal(Object.hasOwn(old, "workerEncoding"), false);
    assert.equal(plan.profile, "private.current-footprint-delete-sql-plan.v2"); assert.deepEqual(plan.workerEncoding, workerEncoding);
    const raw = version === null ? f.raw.replace(',"editVersion":"3.2.209"', "") : f.raw.replace('"editVersion":"3.2.209"', `"editVersion":${JSON.stringify(version)}`);
    f.apply(raw); const after = await inventory(f.path), effect = await verifyCurrentFootprintDeleteObservedSqlEffect(plan, after);
    assert.equal(effect["profile"], "private.current-footprint-delete-full-sql-effect.v2"); assert.equal(effect["exactLogicalSqlEffect"], true);
    assert.deepEqual(effect["workerEncoding"], workerEncoding);
    assert.equal(completedCurrentFootprintDeleteObservedSqlSource(plan, effect, after).after, after);
    const wrongVersion: unknown = Reflect.apply(verifyCurrentFootprintDeleteSqlEffect, undefined, [plan, after]); assert.ok(wrongVersion instanceof Promise);
    await assert.rejects(wrongVersion, /version-specific/u);
    assert.throws(() => Reflect.apply(completedCurrentFootprintDeleteSqlSource, undefined, [plan, effect, after]), /version-specific/u);
    await assert.rejects(verifyCurrentFootprintDeleteObservedSqlEffect({ ...plan }, after), /version-specific/u);
    if (version === "3.2.209") { const legacyEffect = await verifyCurrentFootprintDeleteSqlEffect(old, after); assert.equal(legacyEffect["profile"], "private.current-footprint-delete-full-sql-effect.v1"); }
    else { await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(old, after), /tombstone/u); }
    const projection = await prepareCurrentFootprintDeleteObservedSavedProjection(plan, effect, after);
    assert.equal(projection.profile, "private.current-footprint-delete-saved-projection.v2"); assert.equal(currentFootprintDeleteObservedSavedSource(projection).source.after, after);
    assert.deepEqual(projection.workerEncoding, workerEncoding);
    await assert.rejects(verifyCurrentFootprintDeleteObservedSavedAbsence(projection, after), /independently/u);
    const savedInventory = await inventory(f.path);
    const saved = await verifyCurrentFootprintDeleteObservedSavedAbsence(projection, savedInventory);
    assert.equal(saved["profile"], "private.current-footprint-delete-saved-sql-absence.v2"); assert.equal(saved["exactLogicalSqlUnchanged"], true);
    for (const field of ["nativeManagerAbsenceVerified", "persistentUploadReplayExcluded", "reopened", "executionAuthorized"]) { assert.equal(saved[field], false); }
    assert.throws(() => currentFootprintDeleteObservedSavedSource({ ...projection }), /original projection/u);
    if (!present) {
      const relation = await verifyCurrentFootprintCopyDeleteObservedSqlLifecycle({ copySqlPlan: f.input.copySqlPlan, copyEffect: f.input.copyEffect,
        copyAfter: f.input.copyAfter, copySaved: f.input.before, deleteSqlPlan: plan, deleteEffect: effect, deleteAfter: after, deleteSaved: savedInventory });
      assert.equal(relation.profile, "private.current-footprint-copy-delete-sql-lifecycle.v2"); assert.equal(relation.originalReaderCount, 5);
      assert.equal(relation.originalVisibleRosterRestored, true); assert.equal(relation.createdCopyHistoryRetained, true); assert.equal(relation.executionAuthorized, false);
      assert.equal(requireCurrentFootprintCopyDeleteObservedSqlLifecycle(relation), relation);
      assert.throws(() => requireCurrentFootprintCopyDeleteObservedSqlLifecycle({ ...relation }), /ORIGINAL_RELATION/u);
    }
  }
});

void test("observed encoding is captured before asynchronous SQL work; invalid callbacks and collateral cells refuse", async () => {
  const f = await footprintDeleteSqlFixture();
  const workerEncoding = { workerEditorVersionPresent: true, workerEditorVersionUndefined: false, workerEditorVersion: "3.2.185" };
  const pending = prepareCurrentFootprintDeleteObservedSqlPlan({ ...f.input, workerEncoding }); workerEncoding.workerEditorVersion = "changed";
  const plan = await pending; assert.equal(plan.workerEncoding.workerEditorVersion, "3.2.185");
  let getterCalls = 0;
  const accessor = { workerEditorVersionPresent: true, workerEditorVersionUndefined: false, get workerEditorVersion(): string { getterCalls += 1; return "3.2.185"; } };
  await assert.rejects(prepareCurrentFootprintDeleteObservedSqlPlan({ ...f.input, workerEncoding: accessor })); assert.equal(getterCalls, 0);
  f.apply(f.raw.replace('"editVersion":"3.2.209"', '"editVersion":"changed"'));
  await assert.rejects(verifyCurrentFootprintDeleteObservedSqlEffect(plan, await inventory(f.path)), /tombstone/u);
  const correct = f.raw.replace('"editVersion":"3.2.209"', '"editVersion":"3.2.185"');
  mutate(f.path, `UPDATE history_data SET dataStr='${encrypted(correct, DELETE_HEAD, DELETE_KEY)}' WHERE uuid='${DELETE_HEAD}';UPDATE resources SET dataStr='collateral'`);
  await assert.rejects(verifyCurrentFootprintDeleteObservedSqlEffect(plan, await inventory(f.path)), /full cell effect/u);
});
