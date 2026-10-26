/** Synthetic completed SQLite inputs only. No EasyEDA or native writer calls. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCurrentFootprintCopyV2FreshUuid, assertCurrentFootprintCopyV2Inventory,
  currentFootprintCopyV2Rows, prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { verifyCurrentFootprintCopyV2Append } from "../src/current-footprint-copy-v2-append.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyPlan } from "../src/current-footprint-copy-plan.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), DESTINATION = "e".repeat(16);
const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: "local:avatar" };
const META = { title: "Footprint", description: "Preserve Ω", tags: ["tag"], source: "source:original" };
const PAD = '{"number":"1", "unknown":[1,{"future":true}]}';
function row(type: string, ticket: number, id: string, body?: unknown, extras: object = {}): string {
  return `${JSON.stringify({ type, ticket, id, ...extras })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function head(ticket: number, time: number, target = IDS.target, current = false, actor = true): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT,
    uuid: target, updateTime: time, version: String(time), editVersion: current ? "3.2.209" : "3.2.old", ...(actor ? { user: ACTOR } : {}) })}`;
}
const RAW = [head(20, 100), row("META", 5, "META", META), row("PAD", 10, "pad", { number: "old" }, { firstTicket: 4 }),
  row("LINE", 2, "deleted", { x: 1 }), row("LAYER", 3, '["LAYER",1]', { name: "top" }),
  head(100, 300), `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad" })}||${PAD}`,
  row("LINE", 91, "deleted"), row("POLY", 8, "10", { points: [1, 2] }), row("FILL", 9, "2", { points: [3, 4] })].join("|\n");
const OBSERVED_ROWS = [`${JSON.stringify({ type: "PAD", ticket: 90, id: "pad", firstTicket: 4 })}||${PAD}`,
  row("LINE", 91, "deleted", undefined, { firstTicket: 2 }), row("LAYER", 3, '["LAYER",1]', { name: "top" }),
  row("POLY", 8, "10", { points: [1, 2] }), row("FILL", 9, "2", { points: [3, 4] })];
function supplied(rows: readonly string[] = OBSERVED_ROWS): string {
  return [head(101, 300, IDS.target, true), row("META", 91, "META", META), head(100, 300), ...rows].join("|\n");
}
async function prepare(raw = RAW, content = supplied()): Promise<Readonly<{
  before: Awaited<ReturnType<typeof inventory>>; plan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>;
}>> {
  const created = await fixture();
  mutate(created.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(created.path), sourcePlan = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  return { before, plan: await prepareCurrentFootprintCopyV2Plan(before, sourcePlan, { client: CLIENT, content }) };
}
const COPIED = [row("FILL", 9, "2", { points: [3, 4] }), row("POLY", 8, "10", { points: [1, 2] }), row("META", 91, "META", META),
  `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad" })}||${PAD}`, row("LINE", 91, "deleted"), row("LAYER", 3, '["LAYER",1]', { name: "top" })];
function append(rows: readonly string[] = COPIED): string {
  return [`{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: 402 })}`,
    head(101, 400, DESTINATION, true, false), row("META", 101, "META", { ...META, title: "Footprint_1", source: "" }),
    head(102, 401, DESTINATION, true, false), ...rows].join("|\n");
}

void test("copy v2 models Ni object-index order, lower META, raw bodies, tombstones and firstTicket loss", async () => {
  const { before, plan } = await prepare();
  assert.deepEqual(currentFootprintCopyV2Rows(plan), COPIED);
  assert.equal(plan.indexIdsReordered, true); assert.equal(plan.droppedFirstTicketFields, 2);
  assert.equal(plan.tombstones, 1); assert.equal(plan.canvasRecords, 5);
  assert.equal(plan.metadataTicket, 101); assert.equal(plan.canvasHeaderTicket, 102);
  assert.equal(plan.nativeObservationBound, false); assert.equal(plan.sourceGetterEquivalent, false);
  assert.equal(plan.dependencyClosureVerified, false); assert.equal(plan.producerBindingVerified, false); assert.equal(plan.executionAuthorized, false);
  assertCurrentFootprintCopyV2Inventory(plan, before);
  assert.equal(verifyCurrentFootprintCopyV2Append(plan, DESTINATION, append()).rawAppendRecordsVerified, true);
  // Existing writer preparation must not inherit this new read-only profile.
  await assert.rejects(prepareCurrentFootprintCopyPlan(before, SOURCE));
});

void test("copy v2 retains supplied ordinary order without claiming native sample provenance", async () => {
  const reordered = [...OBSERVED_ROWS].toReversed(), { plan } = await prepare(RAW, supplied(reordered));
  const expected = [COPIED[0], COPIED[1], COPIED[2], COPIED[5], COPIED[4], COPIED[3]];
  assert.deepEqual(currentFootprintCopyV2Rows(plan), expected);
  assert.equal(plan.nativeObservationBound, false);
  assert.throws(() => verifyCurrentFootprintCopyV2Append(plan, DESTINATION, append()), /order differ/u);
});

void test("copy v2 rejects forged plans, old UUIDs, changed source and altered append semantics", async () => {
  const { before, plan } = await prepare();
  assert.throws(() => currentFootprintCopyV2Rows(structuredClone(plan)), /original/u);
  assert.throws(() => { assertCurrentFootprintCopyV2Inventory(plan, structuredClone(before)); }, /original/u);
  assert.throws(() => { assertCurrentFootprintCopyV2FreshUuid(plan, IDS.actor.slice(0, 16)); }, /fresh/u);
  const normalized: unknown = JSON.parse(PAD);
  const changedSource = supplied().replace(PAD, JSON.stringify(normalized));
  await assert.rejects(prepare(RAW, changedSource));
  for (const changed of [append().replace('"type":"LINE","ticket":91,"id":"deleted"}||', '"type":"LINE","ticket":91,"id":"deleted"}||{}'),
    append().replace(PAD, JSON.stringify(JSON.parse(PAD))), append().replace('"type":"PAD","ticket":90,"id":"pad"}',
      '"type":"PAD","ticket":90,"id":"pad","firstTicket":4}'), append(COPIED.toReversed()),
    append(COPIED.filter(value => !value.includes('"ticket":91,"id":"META"'))), append().replace('"Footprint_1"', '"Footprint"')]) {
    assert.throws(() => verifyCurrentFootprintCopyV2Append(plan, DESTINATION, changed));
  }
});

void test("copy v2 refuses asset branches and prototype-sensitive IDs before producing an append plan", async () => {
  for (const id of ["__proto__", "constructor", "prototype", "hasOwnProperty"]) {
    await assert.rejects(prepare(RAW.replaceAll('"id":"pad"', `"id":"${id}"`),
      supplied().replaceAll('"id":"pad"', `"id":"${id}"`)), /object key/u);
  }
  for (const family of ["BLOB", "FONT"]) {
    await assert.rejects(prepare(RAW.replaceAll('"type":"PAD"', `"type":"${family}"`),
      supplied().replaceAll('"type":"PAD"', `"type":"${family}"`)), /asset|projection/u);
  }
});
