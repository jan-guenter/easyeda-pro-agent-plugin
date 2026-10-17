/** Only synthetic completed SQLite readers; no native application or profile. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { reserveCurrentSymbolCopySavedReadCapacity } from "../src/current-symbol-copy-capacity.ts";
import { assertCurrentSymbolCopyPlanInventory, currentSymbolCopyProgramSource, currentSymbolCopySourceRows,
  prepareCurrentSymbolCopyPlan, verifyCurrentSymbolCopyAppend } from "../src/current-symbol-copy-plan.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../src/saved-symbol-projection.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, symbolUuid: IDS.target };
const CLIENT = "a".repeat(16), NEW = "e".repeat(16);
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], docType: 2, source: "original:reference" };
function row(type: string, ticket: number, id: string, body?: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(ticket: number, time: number, uuid = IDS.target): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
function edit(): string {
  return `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: IDS.actor, username: "test", nickname: "Test", updateTime: 500 })}`;
}
const CANVAS = [row("PART", 3, "part", { title: "A" }), row("PIN", 4, "pin", { partId: "part", number: "1", x: 10 }),
  row("RECT", 5, "rect", { partId: "part", x: 0, y: 0 })];
function sourceRaw(canvas = CANVAS, metadata: object = META): string {
  return [edit(), header(100, 100), row("META", 100, "META", metadata), ...canvas,
    header(2, 2, IDS.peer), row("META", 2, "META", { title: "Peer", description: "Keep", tags: [], docType: 18, source: "" })].join("|\n");
}
async function baseline(raw = sourceRaw(), projectUuid = IDS.project): ReturnType<typeof inventory> {
  const result = await fixture();
  mutate(result.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  if (projectUuid !== IDS.project) {
    mutate(result.path, `UPDATE projects SET uuid='${projectUuid}'; UPDATE branches SET project_uuid='${projectUuid}';
      UPDATE project_structures SET project_uuid='${projectUuid}'; UPDATE project_images SET project_uuid='${projectUuid}'`);
  }
  return inventory(result.path);
}
function append(canvas = CANVAS, targetUuid = NEW, secondTime = 201): string {
  return [edit(), header(101, 200, targetUuid), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
    header(102, secondTime, targetUuid), ...canvas].join("|\n");
}

void test("copy plan binds original full SQL/raw history, single part, exact regenerated canvas and three tickets", async () => {
  const before = await baseline(), plan = await prepareCurrentSymbolCopyPlan(before, SOURCE);
  assert.equal(plan.maximumTicket, 100); assert.equal(plan.metadataTicket, 101); assert.equal(plan.canvasHeaderTicket, 102); assert.equal(plan.exportedHeaderTicket, 103);
  assert.equal(plan.beforeSqlSha256, before.logicalSha256); assert.equal(plan.beforeCheckpointSha256, before.checkpointSha256);
  assert.match(plan.beforeRawLinksSha256, /^[a-f0-9]{64}$/u); assert.equal(plan.partId, "part"); assert.equal(plan.canvasRecords, 3);
  assert.deepEqual(plan.sourceMetadata, META); assert.deepEqual(plan.destinationMetadata, { ...META, title: "Source_1", source: "" });
  assert.equal(plan.nameCollisions, 1); assert.equal(plan.executionAuthorized, false); assert.equal(plan.producerBindingVerified, false);
  assert.ok(Object.isFrozen(plan)); assert.ok(Object.isFrozen(plan.source)); assert.ok(Object.isFrozen(plan.destinationMetadata.tags));
  assert.deepEqual(currentSymbolCopySourceRows(plan), CANVAS); assert.ok(Object.isFrozen(currentSymbolCopySourceRows(plan)));
  assertCurrentSymbolCopyPlanInventory(plan, before);
  assert.throws(() => { assertCurrentSymbolCopyPlanInventory(plan, structuredClone(before)); }, /exact original/u);
  const otherBefore = await baseline();
  assert.throws(() => { assertCurrentSymbolCopyPlanInventory(plan, otherBefore); }, /exact original/u);
  assert.throws(() => currentSymbolCopySourceRows(structuredClone(plan)), /original/u);
  await assert.rejects(prepareCurrentSymbolCopyPlan(structuredClone(before), SOURCE), /original/u);
});

void test("exact append relation accepts equal or increasing creation clocks without granting a writer or SQL proof", async () => {
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(), SOURCE);
  for (const time of [200, 201]) {
    const result = await verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: append(CANVAS, NEW, time) });
    assert.equal(result.targetUuid, NEW); assert.equal(result.executionAuthorized, false);
    assert.equal(result.producerBindingVerified, false); assert.equal(result.sqlEffectVerified, false); assert.equal(result.completionProved, false);
    assert.ok(Object.isFrozen(result)); assert.equal(result.plan, plan);
  }
});

void test("copy reserves both future saved-content alternatives before creation, refusing oversized drawings", async () => {
  const source = { ...SOURCE, projectUuid: "1".repeat(64) };
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(sourceRaw(), source.projectUuid), source);
  const actor = { uuid: IDS.actor, username: "test", nickname: "Test" };
  const startup = { sheetUuids: ["a".repeat(32)], templates: [] };
  const capacity = reserveCurrentSymbolCopySavedReadCapacity(plan, actor, startup);
  assert.ok(Object.isFrozen(capacity));
  assert.ok(capacity.maximumContentBytes <= 65_536); assert.ok(capacity.maximumEnvelopeBytes <= 393_216);
  assert.throws(() => reserveCurrentSymbolCopySavedReadCapacity(structuredClone(plan), actor, startup), /original/u);
  for (const secondTime of [200, 201]) {
    const created = await verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: append(CANVAS, NEW, secondTime) });
    for (const projection of [created.projection.raw, created.projection.documentCache]) {
      const content = expectedSavedSymbolContent(projection, CLIENT);
      assert.ok(Buffer.byteLength(content) <= capacity.maximumContentBytes);
    }
  }
  const large = [...CANVAS, row("TEXT", 6, "large", { partId: "part", value: "x".repeat(50_000) })];
  const oversized = await prepareCurrentSymbolCopyPlan(await baseline(sourceRaw(large), source.projectUuid), source);
  assert.throws(() => reserveCurrentSymbolCopySavedReadCapacity(oversized, actor, startup), /SAVED_READ_CAPACITY/u);
});

void test("source identity, ordinary type, complete peer naming and source UTF8 are mandatory", async () => {
  const before = await baseline();
  await assert.rejects(prepareCurrentSymbolCopyPlan(before, { ...SOURCE, symbolUuid: NEW }), /source/u);
  await assert.rejects(prepareCurrentSymbolCopyPlan(before, { ...SOURCE, branchUuid: IDS.peer }));
  for (const metadata of [{ ...META, docType: 18 }, { ...META, extra: true }, { ...META, description: "\uD800" }, { ...META, tags: [42] }]) {
    const candidate = await baseline(sourceRaw(CANVAS, metadata));
    await assert.rejects(prepareCurrentSymbolCopyPlan(candidate, SOURCE));
  }
  const named = await prepareCurrentSymbolCopyPlan(await baseline(sourceRaw().replace('"Peer"', '"source_1"')), SOURCE);
  assert.equal(named.destinationMetadata.title, "Source_2");
  const unsupportedName = await baseline(sourceRaw().replace('"Peer"', '"Ω"'));
  await assert.rejects(prepareCurrentSymbolCopyPlan(unsupportedName, SOURCE), /title/u);
});

void test("dependency, unknown record, multipart, absent drawing and foreign memberships refuse", async () => {
  const cases = [CANVAS.slice(1), CANVAS.slice(0, 1), [...CANVAS, row("PART", 6, "other-part", {})],
    [...CANVAS, row("OBJ", 6, "image", { partId: "part", content: "blob:asset" })], [...CANVAS, row("FONT", 6, "font", {})],
    [...CANVAS, row("LINE", 6, "line", { partId: "part" })], [...CANVAS, row("GROUP", 6, "group", { partId: "part" })],
    [...CANVAS, row("RECT", 6, "foreign", { partId: "other-part" })], [...CANVAS, row("ATTR", 6, "attr", { partId: "part", parentId: "missing" })],
    [...CANVAS, row("TEXT", 6, "text", { partId: "part", value: "blob:asset" })], [...CANVAS, row("OBJ", 6, "deleted")]];
  for (const canvas of cases) {
    const candidate = await baseline(sourceRaw(canvas));
    await assert.rejects(prepareCurrentSymbolCopyPlan(candidate, SOURCE));
  }
});

void test("source tombstones and overwritten winners retain exact bodies but strip inherited firstTicket on copy", async () => {
  const changed = row("RECT", 6, "rect", { partId: "part", x: 20, y: 0 });
  const canvas = [...CANVAS, changed, row("PIN", 7, "gone", { partId: "part" }), row("PIN", 8, "gone")];
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(sourceRaw(canvas)), SOURCE);
  assert.deepEqual(currentSymbolCopySourceRows(plan), [CANVAS[0], CANVAS[1], changed, row("PIN", 8, "gone")]);
  await verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: append([...currentSymbolCopySourceRows(plan)]) });
});

void test("copy preserves exact document-level numbering placeholders through both saved projections", async () => {
  const placeholders = [row("ELE_PLACEHOLDER", 6, "placeholder1", { dataType: "ATTR", max: 1 }),
    row("ELE_PLACEHOLDER", 7, "placeholder2", { dataType: "PIN", max: 2 }),
    row("ELE_PLACEHOLDER", 8, "placeholder3", { dataType: "PIN", max: 3 }),
    row("ELE_PLACEHOLDER", 9, "placeholder4", { dataType: "RECT", max: 10 })];
  const canvas = [CANVAS[0] ?? "", ...placeholders, ...CANVAS.slice(1)];
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(sourceRaw(canvas)), SOURCE);
  assert.deepEqual(currentSymbolCopySourceRows(plan), canvas);
  const created = await verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: append(canvas) });
  for (const projection of [created.projection.raw, created.projection.documentCache]) {
    const content = expectedSavedSymbolContent(projection, CLIENT);
    for (const placeholder of placeholders) { assert.ok(content.split("|\n").includes(placeholder)); }
  }
  for (const changed of [append(canvas).replace('"max":10', '"max":11'),
    append(canvas.filter(value => value !== placeholders[0])), append(canvas.toReversed())]) {
    await assert.rejects(verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: changed }));
  }
});

void test("copy placeholder counters reject ownership fields, unsupported families, tombstones and unsafe numbering", async () => {
  const bodies = [undefined, {}, { dataType: "PIN" }, { max: 1 }, { dataType: "PIN", max: 0 }, { dataType: "PIN", max: -1 },
    { dataType: "PIN", max: 1.5 }, { dataType: "PIN", max: "1" }, { dataType: "PIN", max: Number.MAX_SAFE_INTEGER + 1 },
    { dataType: "PIN", max: Infinity }, { dataType: "PIN", max: Number.NaN }, { dataType: "PIN", max: 1, partId: "part" },
    { dataType: "PIN", max: 1, parentId: "part" }, { dataType: "PIN", max: 1, extra: true },
    ...["LINE", "BLOB", "FONT", "OBJ", "PART", "CANVAS", "ELE_PLACEHOLDER", "__proto__"].map(dataType => ({ dataType, max: 1 }))];
  for (const value of bodies) {
    const canvas = [...CANVAS, row("ELE_PLACEHOLDER", 6, "placeholder1", value)];
    const before = await baseline(sourceRaw(canvas));
    await assert.rejects(prepareCurrentSymbolCopyPlan(before, SOURCE), /placeholder|native object/u);
  }
  const excessive = [...CANVAS, row("ELE_PLACEHOLDER", 6, "placeholder1", { dataType: "PIN", max: Number.MAX_SAFE_INTEGER - 5 }),
    row("ELE_PLACEHOLDER", 7, "placeholder2", { dataType: "PIN", max: 1 })];
  const before = await baseline(sourceRaw(excessive));
  await assert.rejects(prepareCurrentSymbolCopyPlan(before, SOURCE), /numbering/u);
});

void test("copy append rejects changed bodies, reordering, duplicate rows, alternate metadata and wrong ticket headers", async () => {
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(), SOURCE);
  for (const chunk of [append([...CANVAS].toReversed()), append([...CANVAS, CANVAS[0] ?? ""]), append().replace('"x":10', '"x":11'),
    append().replace('"Source_1"', '"Chosen name"'), append().replace('"ticket":102', '"ticket":103'),
    append().replace('"source":""', '"source":"preserved"'), append().replace('"ticket":4', '"ticket":4,"firstTicket":1'),
    append(CANVAS, NEW, 199)]) {
    await assert.rejects(verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk }));
  }
  await assert.rejects(verifyCurrentSymbolCopyAppend(structuredClone(plan), { targetUuid: NEW, chunk: append() }), /original/u);
});

void test("destination absence includes decoded overwritten and deleted references, not only current documents", async () => {
  const oldReference = row("ATTR", 6, "old-ref", { partId: "part", parentId: "part", value: NEW });
  const raw = sourceRaw([...CANVAS, oldReference, row("ATTR", 7, "old-ref")]).replace(NEW, String.raw`\u0065`.repeat(16));
  const plan = await prepareCurrentSymbolCopyPlan(await baseline(raw), SOURCE);
  const canvas = [...currentSymbolCopySourceRows(plan)], peerPrefix = IDS.peer.slice(0, 16);
  await assert.rejects(verifyCurrentSymbolCopyAppend(plan, { targetUuid: NEW, chunk: append(canvas) }), /already occurs/u);
  await assert.rejects(verifyCurrentSymbolCopyAppend(plan, { targetUuid: peerPrefix, chunk: append(canvas, peerPrefix) }), /already occurs/u);
  const keyedRaw = sourceRaw(CANVAS, { ...META, description: "Keep" }).replace('"number":"1"', `"number":"1","${String.raw`\u0065`.repeat(16)}":true`);
  const keyedPlan = await prepareCurrentSymbolCopyPlan(await baseline(keyedRaw), SOURCE);
  const keyedChunk = append([...currentSymbolCopySourceRows(keyedPlan)]);
  await assert.rejects(verifyCurrentSymbolCopyAppend(keyedPlan, { targetUuid: NEW, chunk: keyedChunk }), /already occurs/u);
});

void test("compiler source validates exact getStr and derives only outer ticket change with complete active roster", async () => {
  const before = await baseline(), plan = await prepareCurrentSymbolCopyPlan(before, SOURCE);
  const projection = await prepareSavedSymbolProjection({ chunks: [sourceRaw()], targetUuid: IDS.target, maximumTicket: 100, currentEditVersion: "3.2.206" });
  const observation = { profile: "private.saved-symbol-content-observation.v1", targetUuid: IDS.target, maximumTicket: 100,
    workerClient: CLIENT, content: expectedSavedSymbolContent(projection, CLIENT) };
  const result = currentSymbolCopyProgramSource(plan, observation);
  assert.equal(result.sourceContent, observation.content);
  assert.equal(result.sourceContentAfterCopy, observation.content.replace('"ticket":101', '"ticket":103'));
  assert.deepEqual(result.activeSymbols.map((symbol) => [symbol.uuid, symbol.maximumAtomTicket]), [[IDS.target, 100], [IDS.peer, 2]]);
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.activeSymbols[0]?.metadata)); assert.ok(Object.isFrozen(result.occupiedStrings));
  assert.ok(result.occupiedStrings.includes("partId")); assert.ok(result.occupiedStrings.includes(IDS.peer));
  assert.throws(() => currentSymbolCopyProgramSource(structuredClone(plan), observation), /original/u);
  assert.throws(() => currentSymbolCopyProgramSource(plan, { ...observation, maximumTicket: 101 }));
  assert.throws(() => currentSymbolCopyProgramSource(plan, { ...observation, content: observation.content.replace('"x":10', '"x":11') }));
});

void test("copy plan has no source program, destination UUID, metadata patch or normalization switches", async () => {
  const before = await baseline();
  for (const extra of [{ newName: "chosen" }, { targetUuid: NEW }, { code: "anything" }, { fold: "ascii" }]) {
    await assert.rejects(prepareCurrentSymbolCopyPlan(before, { ...SOURCE, ...extra }));
  }
});
