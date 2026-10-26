/** Synthetic encrypted SQLite inputs; these checks confer no CAD authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCurrentFootprintSourcePlan, assertCurrentFootprintSourcePlanInventory,
  prepareCurrentFootprintSourcePlan, verifyCurrentFootprintSource } from "../src/current-footprint-source-plan.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const CLIENT = "a".repeat(16), LIVE = "c".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic", nickname: "Synthetic", avatar: "local:avatar", unknown: { flags: [1, true, null] } };
const META = { title: "Footprint", description: "Preserve Ω", tags: ["tag"], source: "source:original" };
const PAD = '{"number":"1", "unknown":[1,{"future":true}]}';
function row(type: string, ticket: number, id: string, body?: unknown, extras: object = {}): string {
  return `${JSON.stringify({ type, ticket, id, ...extras })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function head(ticket: number, time: number, user?: object, client = CLIENT, editVersion = "3.2.old"): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid: IDS.target,
    updateTime: time, version: String(time), editVersion, ...(user === undefined ? {} : { user }) })}`;
}
function raw(): string {
  return [head(20, 100), row("META", 5, "META", { ...META, ignoredMetadata: "retained by SQL" }),
    row("LAYER", 1, '["LAYER",1]', { name: "top", future: { x: 2 } }), row("POLY", 2, "poly", { points: [1, 2] }),
    row("PAD", 10, "pad", { number: "old" }), row("OPAQUE_FAMILY", 3, "opaque", { any: ["data"] }),
    head(30, 200, ACTOR), row("POLY", 11, "poly"), row("ELE_PLACEHOLDER", 500, "placeholder", { dataType: "PAD", max: 5 }),
    head(100, 300, ACTOR), `${JSON.stringify({ type: "PAD", ticket: 91, id: "pad" })}||${PAD}`].join("|\n");
}
function expected(canvas?: readonly string[]): string {
  const records = canvas ?? [row("LAYER", 1, '["LAYER",1]', { name: "top", future: { x: 2 } }),
    row("POLY", 11, "poly", undefined, { firstTicket: 2 }),
    `${JSON.stringify({ type: "PAD", ticket: 91, id: "pad", firstTicket: 10 })}||${PAD}`,
    row("OPAQUE_FAMILY", 3, "opaque", { any: ["data"] }), row("ELE_PLACEHOLDER", 500, "placeholder", { dataType: "PAD", max: 5 })];
  return [head(501, 300, ACTOR, LIVE, "3.2.209"), row("META", 91, "META", META), head(100, 300, ACTOR, LIVE), ...records].join("|\n");
}
async function baseline(source = raw()): Promise<Awaited<ReturnType<typeof inventory>>> {
  const created = await fixture();
  mutate(created.path, `UPDATE history_data SET dataStr='${encrypted(source, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  return inventory(created.path);
}

void test("source-only plan folds multiple fragments, exact tombstones and opaque bodies with complete latest actor", async () => {
  const before = await baseline(), plan = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  assert.equal(plan.fragments, 3); assert.equal(plan.canvasRecords, 5); assert.equal(plan.tombstones, 1); assert.equal(plan.maximumTicket, 500);
  assert.equal(plan.beforeCheckpointSha256, before.checkpointSha256); assert.equal(plan.beforeSqlSha256, before.logicalSha256);
  assert.equal(plan.executionAuthorized, false); assertCurrentFootprintSourcePlanInventory(plan, before); assertCurrentFootprintSourcePlan(plan);
  const verified = verifyCurrentFootprintSource(plan, LIVE, expected());
  assert.equal(verified.exactKeyedSourceVerified, true); assert.equal(verified.checkpointByteOrderVerified, false);
  assert.equal(verified.sourceGetterEquivalent, false); assert.equal(verified.producerBindingVerified, false); assert.equal(verified.executionAuthorized, false);
  const lines = expected().split("|\n"), reordered = [...lines.slice(0, 3), ...lines.slice(3).toReversed()].join("|\n");
  const other = verifyCurrentFootprintSource(plan, LIVE, reordered);
  assert.equal(other.keyedRecordsSha256, verified.keyedRecordsSha256); assert.notEqual(other.observedOrderSha256, verified.observedOrderSha256);
  assert.throws(() => { assertCurrentFootprintSourcePlan(structuredClone(plan)); }, /original/u);
  assert.throws(() => { assertCurrentFootprintSourcePlanInventory(plan, structuredClone(before)); }, /original/u);
  await assert.rejects(prepareCurrentFootprintSourcePlan(structuredClone(before), SOURCE), /original/u);
});

void test("source proof refuses dropped unknown bytes, changed actor, tombstone, ticket, first ticket and duplicate ID", async () => {
  const plan = await prepareCurrentFootprintSourcePlan(await baseline(), SOURCE), source = expected();
  for (const changed of [source.replace(PAD, JSON.stringify(JSON.parse(PAD))), source.replace('"local:avatar"', '"changed"'),
    source.replace('"firstTicket":2', '"firstTicket":1'), source.replace('"ticket":91', '"ticket":90'),
    source.replace('"id":"poly","firstTicket":2}||', '"id":"poly","firstTicket":2}||{}')]) {
    assert.throws(() => verifyCurrentFootprintSource(plan, LIVE, changed));
  }
  const rows = source.split("|\n");
  const replaced = [...rows]; replaced[4] = replaced[3] ?? "";
  assert.throws(() => verifyCurrentFootprintSource(plan, LIVE, replaced.join("|\n")));
  assert.throws(() => verifyCurrentFootprintSource(plan, LIVE, `${source}|\n`));
});

void test("source preparation refuses ambiguous header provenance, metadata effects, collisions and pending state", async () => {
  const cases = [raw().replace(head(100, 300, ACTOR), head(100, 300)),
    `${raw()}|\n${head(99, 300, { ...ACTOR, avatar: "different" })}`,
    raw().replace(head(20, 100), head(101, 100)),
    `${raw()}|\n${row("META_MODIFY", 600, "modify", {})}`,
    `${raw()}|\n${row("NET", 600, "gnd", {})}|\n${row("NET", 601, "GND", {})}`,
    `${raw()}|\n${row("PAD", 600, "opaque", {})}`,
    `${raw()}|\n${row("LINE", 600, "pending", {}, { pend: true })}`,
    `${raw()}|\n${row("LINE", 600, "unique", {}, { unique: "marker" })}`,
    `${raw()}|\n${row("PAD", 91, "pad", { changed: true })}`];
  for (const candidate of cases) { await assert.rejects(prepareCurrentFootprintSourcePlan(await baseline(candidate), SOURCE)); }
});

void test("source-only plan admits metadata-only footprints with a unique explicit latest header", async () => {
  const source = [head(100, 300, ACTOR), row("META", 5, "META", META)].join("|\n");
  const plan = await prepareCurrentFootprintSourcePlan(await baseline(source), SOURCE);
  assert.equal(plan.canvasRecords, 0); assert.equal(plan.tombstones, 0);
  const result = [head(101, 300, ACTOR, LIVE, "3.2.209"), row("META", 5, "META", META), head(100, 300, ACTOR, LIVE)].join("|\n");
  assert.equal(verifyCurrentFootprintSource(plan, LIVE, result).exactKeyedSourceVerified, true);
});

void test("source fold preserves raw firstTicket while the existing pre-edit decoder still refuses it", async () => {
  const source = [head(100, 300, ACTOR), row("META", 5, "META", META),
    row("NET", 10, "gnd", { value: "older" }, { firstTicket: 2, client: "a".repeat(16) }),
    row("NET", 10, "gnd", { value: "winner" }, { client: "b".repeat(16) })].join("|\n");
  const before = await baseline(source);
  await assert.rejects(decodeCurrentSymbolPreEditHistory(before, { projectUuid: SOURCE.projectUuid, branchUuid: SOURCE.branchUuid }));
  const plan = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  const result = [head(101, 300, ACTOR, LIVE, "3.2.209"), row("META", 10, "META", META), head(100, 300, ACTOR, LIVE),
    row("NET", 10, "gnd", { value: "winner" }, { firstTicket: 2 })].join("|\n");
  assert.equal(verifyCurrentFootprintSource(plan, LIVE, result).exactKeyedSourceVerified, true);
  assert.throws(() => verifyCurrentFootprintSource(plan, LIVE, result.replace('"id":"gnd"', '"id":"GND"')));
});

void test("source preparation accounts for complete UTF-8 output size before returning a plan", async () => {
  const oversized = `${raw()}|\n${row("PAD", 600, "large", { unknown: "Ω".repeat(1_048_576) })}`;
  await assert.rejects(prepareCurrentFootprintSourcePlan(await baseline(oversized), SOURCE), /complete source byte bound/u);
  const plan = await prepareCurrentFootprintSourcePlan(await baseline(`${raw()}|\n`), SOURCE);
  assert.equal(verifyCurrentFootprintSource(plan, LIVE, expected()).exactKeyedSourceVerified, true);
});
