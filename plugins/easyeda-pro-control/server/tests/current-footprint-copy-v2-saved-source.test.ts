/** Synthetic original full-SQL relations, not a live create or fresh reopen. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintCopyV2SqlPlan, verifyCurrentFootprintCopyV2SqlEffect } from "../src/current-footprint-copy-v2-sql.ts";
import { expectedCurrentFootprintCopyV2SavedSource, prepareCurrentFootprintCopyV2SavedProjection,
  verifyCurrentFootprintCopyV2SavedSource } from "../src/current-footprint-copy-v2-saved-source.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), REOPENED_CLIENT = "f".repeat(16), TARGET = "e".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const OLD_META = { title: "Source", description: "Keep Ω", tags: ["ordinary"], source: "old-source" };
const NEW_META = { ...OLD_META, title: "Source_1", source: "" };
function row(type: string, ticket: number, id: string, value?: unknown, extras: object = {}): string {
  return `${JSON.stringify({ type, ticket, id, ...extras })}||${value === undefined ? "" : JSON.stringify(value)}`;
}
function head(uuid: string, ticket: number, time: number, client: string, user?: unknown): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.209", ...(user === undefined ? {} : { user }) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
const CANVAS = row("CANVAS", 3, "canvas", { originX: 0 });
const LAYER = row("LAYER", 4, '["LAYER",1]', { name: "top", future: { keep: true } });
const PAD_BODY = '{"number":"1", "x":10, "unknown":[1,"Ω"]}';
const PAD = `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad" })}||${PAD_BODY}`;
const TOMBSTONE = row("LINE", 92, "line");
const INDEX_TWO = row("FILL", 91, "2", { points: [0, 0, 10, 0, 10, 10] });
const INDEX_TEN = row("LINE", 93, "10", { x: 0, y: 1 });
const BEFORE = [edit(1), head(IDS.target, 20, 100, CLIENT, ACTOR), row("META", 5, "META", OLD_META),
  CANVAS, LAYER, row("PAD", 10, "pad", { number: "old" }, { firstTicket: 7 }), row("LINE", 8, "line", { x: 0 }),
  INDEX_TEN, head(IDS.target, 100, 300, CLIENT, ACTOR), PAD, TOMBSTONE, INDEX_TWO].join("|\n");
const SOURCE = [head(IDS.target, 101, 300, CLIENT, ACTOR), row("META", 93, "META", OLD_META),
  head(IDS.target, 100, 300, CLIENT, ACTOR), CANVAS, LAYER,
  `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad", firstTicket: 7 })}||${PAD_BODY}`,
  row("LINE", 92, "line", undefined, { firstTicket: 8 }), INDEX_TEN, INDEX_TWO].join("|\n");
// Independently spell the native integer-key projection. META is third in the
// Copied append; both index IDs must still survive the destination getter.
const COPIED = [INDEX_TWO, INDEX_TEN, row("META", 93, "META", OLD_META), CANVAS, LAYER, PAD, TOMBSTONE];
const SAVED_CANVAS = [INDEX_TWO, INDEX_TEN, CANVAS, LAYER, PAD, TOMBSTONE];
function observed(content: string): Record<string, unknown> {
  return { profile: "private.current-footprint-copy-v2-saved-content-observation.v1", targetUuid: TARGET,
    maximumTicket: 102, workerClient: REOPENED_CLIENT, content };
}
async function prepared(equalClocks = false, documentClock = TIMES.document): Promise<Readonly<{
  path: string; after: Awaited<ReturnType<typeof inventory>>;
  sqlPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>;
  effect: Awaited<ReturnType<typeof verifyCurrentFootprintCopyV2SqlEffect>>;
  projection: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SavedProjection>>;
}>> {
  const { path } = await fixture();
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(BEFORE, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(path);
  const source = await prepareCurrentFootprintSourcePlan(before, { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const copyPlan = await prepareCurrentFootprintCopyV2Plan(before, source, { client: CLIENT, content: SOURCE });
  assert.equal(copyPlan.indexIdsReordered, true); assert.equal(copyPlan.droppedFirstTicketFields, 2);
  const sqlPlan = await prepareCurrentFootprintCopyV2SqlPlan({ before, copyPlan, witness: {
    projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: CLIENT, preDispatchMaxTicket: 100,
    documentClockMinMs: documentClock === 0 ? 0 : WITNESS.serverClockMinMs,
    documentClockMaxMs: documentClock === 0 ? 10 : WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
    backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes,
  } });
  const second = equalClocks ? documentClock : documentClock + 1;
  const appended = [edit(TIMES.edit), head(TARGET, 101, documentClock, CLIENT), row("META", 101, "META", NEW_META),
    head(TARGET, 102, second, CLIENT), ...COPIED].join("|\n");
  applyEffect(path, appended); mutate(path, "UPDATE project_structures SET ticket=100");
  const after = await inventory(path), effect = await verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, after, { returnedUuid: TARGET });
  return { path, after, sqlPlan, effect, projection: await prepareCurrentFootprintCopyV2SavedProjection(sqlPlan, effect, after) };
}

void test("copy-v2 saved source retains numeric IDs, raw ordinary records and tombstones under both native replay actors", async () => {
  for (const equal of [false, true]) {
    const { projection } = await prepared(equal); const inner = equal ? 101 : 102, time = TIMES.document + (equal ? 0 : 1);
    assert.equal(projection.getterHeaderTicket, 103); assert.equal(projection.metadataTicket, 101);
    assert.equal(projection.selectedHeaderTicket, inner); assert.equal(projection.selectedHeaderTime, time);
    assert.equal(projection.equalCreationClocks, equal); assert.equal(projection.canvasRecords, 6); assert.equal(projection.tombstones, 1);
    for (const [replay, user] of [["complete-raw-history", ACTOR], ["current-footprint-chunk-cache", { uuid: TARGET }]] as const) {
      const expected = [head(TARGET, 103, time, REOPENED_CLIENT, user), row("META", 101, "META", NEW_META),
        head(TARGET, inner, time, REOPENED_CLIENT, user), ...SAVED_CANVAS].join("|\n");
      assert.equal(expectedCurrentFootprintCopyV2SavedSource(projection, REOPENED_CLIENT, replay), expected);
      const result = verifyCurrentFootprintCopyV2SavedSource(projection, observed(expected));
      assert.equal(result["exactContent"], true); assert.equal(result["matchedProjection"], replay);
      for (const key of ["producerBindingVerified", "cacheBranchObserved", "executionAuthorized", "completionProved",
        "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) {
        assert.equal(result[key], false);
      }
    }
  }
});

void test("copy-v2 saved source rejects missing index IDs, normalization, firstTicket restoration and same-generation state", async () => {
  const { projection } = await prepared();
  const cache = expectedCurrentFootprintCopyV2SavedSource(projection, REOPENED_CLIENT, "current-footprint-chunk-cache");
  const user = `"user":${JSON.stringify({ uuid: TARGET })}`;
  for (const content of [cache.replace(`${INDEX_TWO}|\n`, ""), cache.replace(`${INDEX_TEN}|\n`, ""),
    cache.replace(PAD_BODY, JSON.stringify(JSON.parse(PAD_BODY))), cache.replace(`|\n${TOMBSTONE}`, ""),
    cache.replace(SAVED_CANVAS.join("|\n"), SAVED_CANVAS.toReversed().join("|\n")),
    cache.replaceAll(user, '"user":{}'), cache.replace(user, `"user":${JSON.stringify(ACTOR)}`),
    cache.replace('"type":"DOCHEAD","ticket":102', '"type":"DOCHEAD"'), cache.replace('"ticket":103', '"ticket":102'),
    cache.replace('"ticket":101', '"ticket":93'), cache.replace(REOPENED_CLIENT, CLIENT),
    `${cache}|\n${row("META", 93, "META", OLD_META)}`, cache.replace('"id":"pad"', '"id":"pad","firstTicket":7'),
    cache.replace('"x":10', '"x":11'), cache.replace('"editVersion":"3.2.209"', '"editVersion":"3.2.206"')]) {
    assert.throws(() => verifyCurrentFootprintCopyV2SavedSource(projection, observed(content)), /differs/u);
  }
});

void test("copy-v2 saved source requires original completed SQL objects and strict data-only observations", async () => {
  const input = await prepared(), { projection } = input;
  const content = expectedCurrentFootprintCopyV2SavedSource(projection, REOPENED_CLIENT, "complete-raw-history");
  await assert.rejects(prepareCurrentFootprintCopyV2SavedProjection(input.sqlPlan, structuredClone(input.effect), input.after), /original/u);
  await assert.rejects(prepareCurrentFootprintCopyV2SavedProjection(structuredClone(input.sqlPlan), input.effect, input.after), /original/u);
  await assert.rejects(prepareCurrentFootprintCopyV2SavedProjection(input.sqlPlan, input.effect, structuredClone(input.after)), /original/u);
  const equivalent = await inventory(input.path); assert.equal(equivalent.logicalSha256, input.after.logicalSha256);
  await assert.rejects(prepareCurrentFootprintCopyV2SavedProjection(input.sqlPlan, input.effect, equivalent), /original/u);
  assert.throws(() => expectedCurrentFootprintCopyV2SavedSource(structuredClone(projection), REOPENED_CLIENT, "complete-raw-history"), /original/u);
  for (const value of [{ ...observed(content), extra: true }, { ...observed(content), targetUuid: IDS.target },
    { ...observed(content), maximumTicket: 101 }, { ...observed(content), workerClient: `${REOPENED_CLIENT}\n` },
    { ...observed(content), content: "x".repeat(2_097_153) }, { ...observed(content), content: "\uD800" }]) {
    assert.throws(() => verifyCurrentFootprintCopyV2SavedSource(projection, value), /fields|differs|client/u);
  }
  let invoked = false;
  const accessor = Object.defineProperty(observed(content), "content", { get(): string { invoked = true; return content; } });
  assert.throws(() => verifyCurrentFootprintCopyV2SavedSource(projection, accessor), /accessors/u); assert.equal(invoked, false);
  let calls = 0;
  const proxy = new Proxy(observed(content), {
    getPrototypeOf(): object { calls += 1; return Object.prototype; },
    ownKeys(): string[] { calls += 1; return []; },
    getOwnPropertyDescriptor(): PropertyDescriptor { calls += 1; return { value: "forged", configurable: true }; },
    get(): unknown { calls += 1; return undefined; },
  });
  assert.throws(() => verifyCurrentFootprintCopyV2SavedSource(projection, proxy), /plain supplied observation/u);
  assert.equal(calls, 0);
  assert.ok(Object.isFrozen(projection));
});

void test("copy-v2 saved source preparation rejects zero creation clocks before applying an effect", async () => {
  await assert.rejects(prepared(false, 0), /positive document clock window required before copy/u);
});
