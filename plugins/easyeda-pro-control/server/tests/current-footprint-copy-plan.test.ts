/** Synthetic encrypted SQLite readers only; no EasyEDA execution evidence. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertCurrentFootprintCopyPlanInventory, currentFootprintCopyNativeCreateArguments,
  prepareCurrentFootprintCopyPlan, verifyCurrentFootprintCopyRecords } from "../src/current-footprint-copy-plan.ts";
import { IDS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const CLIENT = "a".repeat(16), NEW = "e".repeat(16);
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], source: "original:reference" };
const DESTINATION = { ...META, title: "Source_1", source: "" };
function row(type: string, ticket: number, id: string, body?: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(ticket: number, uuid: string, docType = "FOOTPRINT"): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType, client: CLIENT, uuid,
    updateTime: ticket, version: String(ticket), editVersion: "3.2.209" })}`;
}
function edit(): string {
  return `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: IDS.actor, username: "test", nickname: "Test", updateTime: 500 })}`;
}
const CANVAS = [row("CANVAS", 3, "canvas", { originX: 0, originY: 0 }),
  row("PAD", 4, "pad", { number: "1", x: 10, y: 0 }), row("LINE", 5, "line", { startX: 0, startY: 0, endX: 10, endY: 10 })];
function sourceRaw(canvas = CANVAS, metadata: object = META, peerTitle = "Peer"): string {
  return [edit(), header(100, IDS.target), row("META", 100, "META", metadata), ...canvas,
    header(2, IDS.peer), row("META", 2, "META", { ...META, title: peerTitle, source: "" })].join("|\n");
}
async function baseline(raw = sourceRaw()): Promise<Readonly<{ path: string; before: Awaited<ReturnType<typeof inventory>> }>> {
  const result = await fixture();
  mutate(result.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  return { path: result.path, before: await inventory(result.path) };
}
function append(canvas = CANVAS, metadata: object = DESTINATION, uuid = NEW): string {
  return [edit(), header(101, uuid), row("META", 101, "META", metadata), header(102, uuid),
    // GET_STR can carry the old lower-ticket META. It must not replace the new name.
    row("META", 100, "META", META), ...canvas].join("|\n");
}

void test("footprint plan derives independent native create data and retains original reader identity", async () => {
  const { before } = await baseline(), plan = await prepareCurrentFootprintCopyPlan(before, SOURCE);
  assert.deepEqual(plan.sourceMetadata, META); assert.deepEqual(plan.destinationMetadata, DESTINATION);
  assert.equal(plan.canvasRecords, 3); assert.equal(plan.nameCollisions, 1);
  assert.equal(plan.executionAuthorized, false); assert.equal(plan.producerBindingVerified, false);
  assert.equal(plan.beforeSqlSha256, before.logicalSha256);
  assertCurrentFootprintCopyPlanInventory(plan, before);
  const args = currentFootprintCopyNativeCreateArguments(plan);
  assert.deepEqual(args, [{ uuid: IDS.target, path: IDS.project, isProject: true, docType: 4, title: "Source_1", display_title: "Source_1",
    description: META.description, custom_tags: '["tag"]', source: "", version: "" }, IDS.project]);
  assert.ok(Object.isFrozen(plan.destinationMetadata.tags)); assert.ok(Object.isFrozen(args)); assert.ok(Object.isFrozen(args[0]));
  assert.throws(() => currentFootprintCopyNativeCreateArguments(structuredClone(plan)), /original/u);
  assert.throws(() => { assertCurrentFootprintCopyPlanInventory(plan, structuredClone(before)); }, /original/u);
  await assert.rejects(prepareCurrentFootprintCopyPlan(structuredClone(before), SOURCE), /original/u);
});

void test("record relation accepts one exact addition without claiming complete SQL or native lifecycle", async () => {
  const { before, path } = await baseline(), plan = await prepareCurrentFootprintCopyPlan(before, SOURCE);
  applyEffect(path, append());
  const after = await inventory(path), proof = await verifyCurrentFootprintCopyRecords(plan, after, NEW);
  assert.equal(proof.recordsEffectVerified, true); assert.equal(proof.plan, plan); assert.equal(proof.targetUuid, NEW);
  assert.equal(proof.rawAppendVerified, false); assert.equal(proof.sqlEffectVerified, false); assert.equal(proof.completionProved, false);
  assert.equal(proof.executionAuthorized, false); assert.equal(proof.producerBindingVerified, false);
  assert.ok(Object.isFrozen(proof));
  await assert.rejects(verifyCurrentFootprintCopyRecords(structuredClone(plan), after, NEW), /original/u);
  await assert.rejects(verifyCurrentFootprintCopyRecords(plan, structuredClone(after), NEW), /original/u);
  await assert.rejects(verifyCurrentFootprintCopyRecords(plan, after, IDS.target), /destination/u);
});

void test("default SDK no-copy result and arbitrary changes cannot satisfy the independent copy relation", async () => {
  const { before } = await baseline(), plan = await prepareCurrentFootprintCopyPlan(before, SOURCE);
  await assert.rejects(verifyCurrentFootprintCopyRecords(plan, before, NEW), /append/u);
  const variants = [append(CANVAS, { ...DESTINATION, title: "Ignored name" }), append(CANVAS, { ...DESTINATION, source: META.source }),
    append(CANVAS.slice(1)), append([...CANVAS, row("LINE", 5, "line", { startX: 99 })]),
    append().replaceAll('"docType":"FOOTPRINT"', '"docType":"SYMBOL"'),
    `${append()}|\n${header(103, IDS.peer)}|\n${row("META", 103, "META", { ...META, title: "changed" })}`,
    `${append()}|\n${row("OBJ", 103, "asset", { path: "blob:asset" })}`];
  for (const raw of variants) {
    const candidate = await baseline(), prepared = await prepareCurrentFootprintCopyPlan(candidate.before, SOURCE);
    applyEffect(candidate.path, raw);
    await assert.rejects(verifyCurrentFootprintCopyRecords(prepared, await inventory(candidate.path), NEW));
  }
});

void test("raw original-history substitution and hidden historical destination identity refuse", async () => {
  const { before, path } = await baseline(), plan = await prepareCurrentFootprintCopyPlan(before, SOURCE);
  applyEffect(path, append());
  // Same visible records, different retained raw bytes must not be adopted.
  const raw = sourceRaw().replace('"description":"Preserve Ω"', '"description": "Preserve Ω"');
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  await assert.rejects(verifyCurrentFootprintCopyRecords(plan, await inventory(path), NEW), /original complete history/u);
  const hidden = await baseline(sourceRaw().replace('"description":"Preserve Ω"', `"description":"${NEW}"`));
  const hiddenPlan = await prepareCurrentFootprintCopyPlan(hidden.before, SOURCE);
  await assert.rejects(verifyCurrentFootprintCopyRecords(hiddenPlan, hidden.before, NEW), /destination/u);
});

void test("copy preparation refuses unsupported raw families, tombstones, malformed metadata and source type", async () => {
  const variants = [sourceRaw([]), sourceRaw([CANVAS[0] ?? ""]), sourceRaw([...CANVAS, row("OBJ", 6, "image", { path: "blob:asset" })]),
    sourceRaw([...CANVAS, row("FONT", 6, "font", {})]), sourceRaw([...CANVAS, row("STRING", 6, "text", { fontFamily: "external" })]),
    sourceRaw([...CANVAS, row("LINE", 6, "gone")]), sourceRaw([...CANVAS, row("PAD", 6, "external", { value: "blob:asset" })]),
    sourceRaw(CANVAS, { ...META, extra: true }), sourceRaw(CANVAS, { ...META, description: "\uD800" }),
    sourceRaw().replaceAll('"docType":"FOOTPRINT"', '"docType":"SYMBOL"'), sourceRaw(CANVAS, META, "Ω")];
  for (const raw of variants) { const candidate = await baseline(raw); await assert.rejects(prepareCurrentFootprintCopyPlan(candidate.before, SOURCE)); }
  const { before } = await baseline();
  await assert.rejects(prepareCurrentFootprintCopyPlan(before, { ...SOURCE, footprintUuid: NEW }), /source/u);
  const collisionBaseline = await baseline(sourceRaw(CANVAS, META, "source_1"));
  const colliding = await prepareCurrentFootprintCopyPlan(collisionBaseline.before, SOURCE);
  assert.equal(colliding.destinationMetadata.title, "Source_2");
});
