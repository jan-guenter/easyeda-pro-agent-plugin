/** Synthetic complete SQL readers only. No native Date, process, dispatch or
 * native owner is substituted by these historical selection regressions. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintCopyHeadReference, requireCurrentFootprintCopyHeadReference } from "../src/current-footprint-copy-head-reference.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { HISTORY_TABLE, IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
/** Build a private synthetic footprint database and complete reader. Optional
 * SQL changes exercise malformed storage without adopting live project data. */
async function source(change = ""): Promise<Readonly<{
  path: string;
  before: Awaited<ReturnType<typeof inventory>>;
  plan: Awaited<ReturnType<typeof prepareCurrentFootprintSourcePlan>>;
}>> {
  const database = await fixture();
  const raw = [{ type: "DOCHEAD", ticket: 100 }, { docType: "FOOTPRINT", client: "a".repeat(16), uuid: IDS.target,
    updateTime: 100, version: "100", editVersion: "3.2.209", user: { uuid: IDS.actor, username: "synthetic", nickname: "Synthetic" } }];
  const content = `${JSON.stringify(raw[0])}||${JSON.stringify(raw[1])}|\n` +
    `${JSON.stringify({ type: "META", ticket: 90, id: "META" })}||${JSON.stringify({ title: "Footprint", description: "", tags: [], source: "" })}`;
  mutate(database.path, `UPDATE history_data SET dataStr='${encrypted(content, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  if (change !== "") { mutate(database.path, change); }
  const before = await inventory(database.path), plan = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  return Object.freeze({ path: database.path, before, plan });
}

void test("footprint head reference derives the actual locked head and retains only its original reader", async () => {
  const data = await source(), reference = await prepareCurrentFootprintCopyHeadReference(data.before, data.plan);
  assert.equal(reference.historyUuid, IDS.oldHead); assert.equal(reference.ownerUuid, IDS.actor);
  assert.equal(reference.createdAtLiteral, "2020-01-01 00:00:00"); assert.equal(reference.lockState, "locked");
  assert.equal(reference.nativeAgeRequired, false); assert.equal(reference.ageVerified, false);
  assert.equal(reference.nativeDateProvenanceVerified, false); assert.equal(reference.executionAuthorized, false);
  assert.equal(reference.beforeSqlSha256, data.before.logicalSha256); assert.equal(Object.isFrozen(reference), true);
  assert.equal(requireCurrentFootprintCopyHeadReference(reference, data.before, data.plan), reference);
  assert.throws(() => requireCurrentFootprintCopyHeadReference(structuredClone(reference), data.before, data.plan), /ORIGINAL_REFERENCE/u);
  assert.throws(() => requireCurrentFootprintCopyHeadReference(reference, structuredClone(data.before), data.plan), /ORIGINAL_REFERENCE/u);
  assert.throws(() => requireCurrentFootprintCopyHeadReference(reference, data.before, structuredClone(data.plan)), /ORIGINAL_REFERENCE/u);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(structuredClone(data.before), data.plan), /original/u);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(data.before, structuredClone(data.plan)), /original/u);
});

void test("an unlocked footprint head requires a calendar-valid actual literal but supplies no native age", async () => {
  const data = await source(`UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56'`);
  const reference = await prepareCurrentFootprintCopyHeadReference(data.before, data.plan);
  assert.equal(reference.historyUuid, IDS.oldHead); assert.equal(reference.createdAtLiteral, "2026-01-15 12:34:56");
  assert.equal(reference.lockState, "unlocked"); assert.equal(reference.nativeAgeRequired, true);
  assert.equal(reference.ageVerified, false); assert.equal(reference.nativeDateProvenanceVerified, false);
  const invalid = await source(`UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-02-30 12:34:56'`);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(invalid.before, invalid.plan), /CLOCK_CONTROLS_REFUSED/u);
  const padded = await source(`UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56\n'`);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(padded.before, padded.plan), /EXACT_CREATED_AT_LITERAL/u);
});

void test("equal complete reader bytes and another genuine source plan cannot replace the retained footprint inputs", async () => {
  const data = await source(), reference = await prepareCurrentFootprintCopyHeadReference(data.before, data.plan);
  const equalReader = await inventory(data.path);
  const equalPlan = await prepareCurrentFootprintSourcePlan(equalReader, SOURCE);
  assert.equal(equalReader.logicalSha256, data.before.logicalSha256);
  assert.throws(() => requireCurrentFootprintCopyHeadReference(reference, equalReader, equalPlan), /ORIGINAL_REFERENCE/u);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(equalReader, data.plan), /original/u);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(data.before, equalPlan), /original/u);
});

void test("head selection rejects malformed locks and invalid owner UUIDs before returning a reference", async () => {
  const lock = await source(`UPDATE "${HISTORY_TABLE}" SET is_lock=2`);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(lock.before, lock.plan), /LOCK_STATE/u);
  const owner = await source("UPDATE projects SET owner_uuid='not-an-owner'");
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(owner.before, owner.plan), /EXACT_UUID/u);
  const padded = await source(`UPDATE projects SET owner_uuid='${IDS.actor}\n'`);
  await assert.rejects(prepareCurrentFootprintCopyHeadReference(padded.before, padded.plan), /EXACT_UUID/u);
});

void test("the original footprint source pipeline cannot select a newline-padded history UUID", async () => {
  await assert.rejects(async () => {
    const data = await source(`UPDATE branches SET history_uuid='${IDS.oldHead}\n' WHERE uuid='${IDS.branch}'`);
    return prepareCurrentFootprintCopyHeadReference(data.before, data.plan);
  }, /history|History|UUID|uuid|head|Head/u);
});
