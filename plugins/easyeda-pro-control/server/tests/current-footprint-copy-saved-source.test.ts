/** Fresh replay comparisons from original synthetic full-SQL effects only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintCopyAppendPlan } from "../src/current-footprint-copy-append.ts";
import { prepareCurrentFootprintCopyPlan } from "../src/current-footprint-copy-plan.ts";
import { expectedCurrentFootprintCopySavedSource, prepareCurrentFootprintCopySavedProjection,
  verifyCurrentFootprintCopySavedSource } from "../src/current-footprint-copy-saved-source.ts";
import { prepareCurrentFootprintCopySqlPlan, verifyCurrentFootprintCopySqlEffect } from "../src/current-footprint-copy-sql.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), REOPENED_CLIENT = "f".repeat(16), TARGET = "e".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const OLD_META = { title: "Source", description: "Keep", tags: [], source: "old-source" };
const NEW_META = { ...OLD_META, title: "Source_1", source: "" };
function row(type: string, ticket: number, id: string, value: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${JSON.stringify(value)}`;
}
function head(uuid: string, ticket: number, time: number, client: string, user?: unknown): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.209", ...(user === undefined ? {} : { user }) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
const CANVAS = [row("CANVAS", 3, "canvas", { originX: 0, originY: 0 }), row("PAD", 90, "pad", { x: 10, number: "1" })];
const BEFORE = [edit(1), head(IDS.target, 100, 100, CLIENT, ACTOR), row("META", 40, "META", OLD_META), ...CANVAS].join("|\n");
function observed(content: string): Record<string, unknown> {
  return { profile: "private.current-footprint-copy-saved-content-observation.v1", targetUuid: TARGET,
    maximumTicket: 102, workerClient: REOPENED_CLIENT, content };
}
async function prepared(equalClocks = false, documentClock = TIMES.document): Promise<Readonly<{
  path: string;
  after: Awaited<ReturnType<typeof inventory>>;
  sqlPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopySqlPlan>>;
  effect: Awaited<ReturnType<typeof verifyCurrentFootprintCopySqlEffect>>;
  projection: Awaited<ReturnType<typeof prepareCurrentFootprintCopySavedProjection>>;
}>> {
  const { path } = await fixture();
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(BEFORE, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(path), copyPlan = await prepareCurrentFootprintCopyPlan(before,
    { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const appendPlan = await prepareCurrentFootprintCopyAppendPlan(before, copyPlan);
  const sqlPlan = await prepareCurrentFootprintCopySqlPlan({ before, appendPlan, witness: {
    projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: CLIENT, preDispatchMaxTicket: 100,
    documentClockMinMs: documentClock === 0 ? 0 : WITNESS.serverClockMinMs,
    documentClockMaxMs: documentClock === 0 ? 10 : WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
    backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes,
  } });
  const second = equalClocks ? documentClock : documentClock + 1;
  const appended = [edit(TIMES.edit), head(TARGET, 101, documentClock, CLIENT), row("META", 101, "META", NEW_META),
    head(TARGET, 102, second, CLIENT), row("META", 90, "META", OLD_META), ...CANVAS].join("|\n");
  applyEffect(path, appended); mutate(path, "UPDATE project_structures SET ticket=100");
  const after = await inventory(path), effect = await verifyCurrentFootprintCopySqlEffect(sqlPlan, after, { returnedUuid: TARGET });
  return { path, after, sqlPlan, effect, projection: await prepareCurrentFootprintCopySavedProjection(sqlPlan, effect, after) };
}

void test("saved footprint distinguishes raw backend actor from cache actor and retains equal-clock first header", async () => {
  for (const equal of [false, true]) {
    const { projection } = await prepared(equal); const inner = equal ? 101 : 102, time = TIMES.document + (equal ? 0 : 1);
    assert.equal(projection.getterHeaderTicket, 103); assert.equal(projection.metadataTicket, 101);
    assert.equal(projection.selectedHeaderTicket, inner); assert.equal(projection.selectedHeaderTime, time);
    assert.equal(projection.equalCreationClocks, equal);
    for (const [replay, user] of [["complete-raw-history", ACTOR], ["current-footprint-chunk-cache", { uuid: TARGET }]] as const) {
      const expected = [head(TARGET, 103, time, REOPENED_CLIENT, user), row("META", 101, "META", NEW_META),
        head(TARGET, inner, time, REOPENED_CLIENT, user), ...CANVAS].join("|\n");
      assert.equal(expectedCurrentFootprintCopySavedSource(projection, REOPENED_CLIENT, replay), expected);
      const result = verifyCurrentFootprintCopySavedSource(projection, observed(expected));
      assert.equal(result["exactContent"], true); assert.equal(result["matchedProjection"], replay);
      for (const key of ["producerBindingVerified", "cacheBranchObserved", "executionAuthorized", "completionProved", "reopened"]) {
        assert.equal(result[key], false);
      }
    }
  }
});

void test("saved footprint rejects same-generation headers, mixed actors, stale tickets and losing META leakage", async () => {
  const { projection } = await prepared();
  const cache = expectedCurrentFootprintCopySavedSource(projection, REOPENED_CLIENT, "current-footprint-chunk-cache");
  const user = `"user":${JSON.stringify({ uuid: TARGET })}`;
  for (const content of [cache.replaceAll(user, '"user":{}'), cache.replace('"type":"DOCHEAD","ticket":102', '"type":"DOCHEAD"'),
    cache.replace(user, `"user":${JSON.stringify(ACTOR)}`), cache.replace('"ticket":103', '"ticket":102'),
    cache.replace('"ticket":101', '"ticket":90'), cache.replace(REOPENED_CLIENT, CLIENT),
    `${cache}|\n${row("META", 90, "META", OLD_META)}`, cache.replace('"id":"pad"', '"id":"pad","firstTicket":4'),
    cache.replace('"x":10', '"x":11'), cache.replace('"editVersion":"3.2.209"', '"editVersion":"3.2.206"')]) {
    assert.throws(() => verifyCurrentFootprintCopySavedSource(projection, observed(content)), /differs/u);
  }
});

void test("saved footprint requires original successful SQL relation and exact supplied data fields", async () => {
  const input = await prepared(), { projection } = input;
  const content = expectedCurrentFootprintCopySavedSource(projection, REOPENED_CLIENT, "complete-raw-history");
  await assert.rejects(prepareCurrentFootprintCopySavedProjection(input.sqlPlan, structuredClone(input.effect), input.after), /original/u);
  await assert.rejects(prepareCurrentFootprintCopySavedProjection(structuredClone(input.sqlPlan), input.effect, input.after), /original/u);
  await assert.rejects(prepareCurrentFootprintCopySavedProjection(input.sqlPlan, input.effect, structuredClone(input.after)), /original/u);
  const equivalent = await inventory(input.path); assert.equal(equivalent.logicalSha256, input.after.logicalSha256);
  await assert.rejects(prepareCurrentFootprintCopySavedProjection(input.sqlPlan, input.effect, equivalent), /original/u);
  assert.throws(() => expectedCurrentFootprintCopySavedSource(structuredClone(projection), REOPENED_CLIENT, "complete-raw-history"), /original/u);
  for (const value of [{ ...observed(content), extra: true }, { ...observed(content), targetUuid: IDS.target },
    { ...observed(content), maximumTicket: 101 }, { ...observed(content), workerClient: "invalid" }]) {
    assert.throws(() => verifyCurrentFootprintCopySavedSource(projection, value), /fields|differs|client/u);
  }
  let invoked = false;
  const accessor = Object.defineProperty(observed(content), "content", { get(): string { invoked = true; return content; } });
  assert.throws(() => verifyCurrentFootprintCopySavedSource(projection, accessor), /accessors/u); assert.equal(invoked, false);
  assert.ok(Object.isFrozen(projection));
});

void test("saved footprint refuses zero header clocks that trigger native actor-time fallback", async () => {
  await assert.rejects(prepared(false, 0), /nonzero generated header clock/u);
});
