/** Synthetic histories and pinned pure producer excerpts only; no live admission. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, prepareCurrentDocumentCacheSavedSymbolProjection,
  prepareCurrentSingleCanvasSegmentSavedSymbolProjection, prepareSavedSymbolProjection, verifyCurrentSavedSymbolProjectionAlternatives,
  verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives, verifySavedSymbolContent } from "../src/saved-symbol-projection.ts";

const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), PEER = "3".repeat(16), TARGET = "2".repeat(16);
const ACTOR = { uuid: "4".repeat(32), username: "Actor", nickname: "Original" };
const CACHE_USER = { uuid: TARGET };
const META = { title: "Synthetic", description: "Exact Ω", tags: ["tag"], docType: 2, source: "" };
function line(type: string, ticket: number, id: string, raw: string, firstTicket?: number): string {
  return `${JSON.stringify({ type, ticket, id, ...(firstTicket === undefined ? {} : { firstTicket }) })}||${raw}`;
}
function head(ticket: number, time: number, uuid = TARGET, additions: object = {}): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.180", ...additions })}`;
}
function meta(ticket: number): string { return line("META", ticket, "META", JSON.stringify(META)); }
function edit(): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: 1 })}`; }
const CANVAS = [line("LINE", 3, "z", '{"x":1}'), line("PART", 9, "a", '{"partId":"P"}'), line("LINE", 10, "z", '{ "x":2 }')];
function chunks(canvas: readonly string[] = CANVAS): string[] {
  return [[edit(), head(2, 20, PEER), meta(2), head(4, 40), meta(4), ...canvas, head(20, 200, PEER), meta(20)].join("|\n"),
    [edit(), head(21, 210), meta(21)].join("|\n")];
}
function input(history = chunks()): { chunks: string[]; targetUuid: string; maximumTicket: number; currentEditVersion: string } {
  return { chunks: history, targetUuid: TARGET, maximumTicket: 21, currentEditVersion: "3.2.206" };
}
function prepareCanvas(canvas: readonly string[]): ReturnType<typeof prepareCurrentSingleCanvasSegmentSavedSymbolProjection> {
  return prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(chunks(canvas)));
}
function expected(canvas: readonly string[], user: object = CACHE_USER): string {
  const header = { docType: "SYMBOL", client: FRESH, uuid: TARGET, updateTime: 210, version: "210" };
  return [`{"type":"DOCHEAD","ticket":22}||${JSON.stringify({ ...header, editVersion: "3.2.206", user })}`, meta(21),
    `{"type":"DOCHEAD","ticket":21}||${JSON.stringify({ ...header, editVersion: "3.2.180", user })}`, ...canvas].join("|\n");
}
function observation(content: string): object {
  return { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket: 21, workerClient: FRESH, content };
}

void test("single canvas segment preserves body bytes, insertion order, physical first tickets and both distinct headers", async () => {
  const projection = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input());
  assert.equal(projection.profile, "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1");
  assert.equal(projection.canvasChunkIndex, 0); assert.equal(projection.canvasRecords, 2); assert.equal(projection.segmentOrderIndependent, true);
  assert.equal(projection.maximumTargetHeaderTime, 210);
  assert.equal(projection.workerSourceSha256, CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256);
  assert.equal(projection.cacheBranchObserved, false); assert.equal(projection.producerBindingVerified, false); assert.equal(projection.executionAuthorized, false);
  const content = expected([line("LINE", 10, "z", '{ "x":2 }', 3), CANVAS[1] ?? "missing"]);
  assert.equal(expectedSavedSymbolContent(projection, FRESH), content);
  const relation = verifySavedSymbolContent(projection, observation(content));
  assert.equal(relation["exactContent"], true); assert.equal(relation["completionProved"], false); assert.equal(relation["executionAuthorized"], false);
  for (const changed of [content.replace('{ "x":2 }', '{"x":2}'), content.replace('"firstTicket":3', '"firstTicket":4'), `${content}|\n`]) {
    assert.throws(() => verifySavedSymbolContent(projection, observation(changed)), /differs/u);
  }
});

void test("the separate canvas selector requires original matching complete histories and exact content", async () => {
  const raw = await prepareSavedSymbolProjection(input());
  const cache = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input());
  const content = expectedSavedSymbolContent(cache, FRESH);
  assert.equal(verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives(raw, cache, observation(content))["matchedProjection"], "current-single-canvas-segment-cache");
  const rawObservation = observation(expectedSavedSymbolContent(raw, FRESH));
  assert.equal(verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives(raw, cache, rawObservation)["matchedProjection"], "complete-raw-history");
  const changed = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(chunks().map((value) => value.replaceAll("Exact Ω", "Other"))));
  for (const other of [structuredClone(cache), changed]) {
    assert.throws(() => verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives(raw, other, observation(content)), /complete history/u);
  }
  assert.throws(() => verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives(raw, cache, observation(`${content}|\n`)), /differs/u);
});

void test("concurrent metadata-segment arrival cannot reorder the single canvas segment", async () => {
  const history = chunks();
  const first = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history));
  const reversed = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history.toReversed()));
  assert.equal(reversed.canvasChunkIndex, 1); assert.notEqual(reversed.rawHistorySha256, first.rawHistorySha256);
  assert.equal(expectedSavedSymbolContent(reversed, FRESH), expectedSavedSymbolContent(first, FRESH));
  // Exact pinned WORKER b849bd... getCompressKeys at291095. This route sets
  // Neither needNum nor clearDelete, so parallel segments cannot be sorted away.
  const nativeKeys = "getCompressKeys(e,t,s){let{eIds:r,uniqueId:i,needNum:n,clearDelete:a}=s;return r!=null&&r[t]?r[t]:i?Array.from(this.uniqueIds[i][t]):n||a?this.sortDocKeys(e):Array.from(e.keys())}";
  const result: unknown = vm.runInNewContext(`const owner={${nativeKeys}}; const keys=values=>owner.getCompressKeys(new Map(values.map(value=>[value,{}])),'target',{}); [keys(['META','z','a']),keys(['z','META','a']),keys(['a','z','META'])];`);
  assert.deepEqual(structuredClone(result), [["META", "z", "a"], ["z", "META", "a"], ["a", "z", "META"]]);
});

void test("same-type tombstones remain historical canvas with exact empty bodies", async () => {
  const projection = await prepareCanvas([
    line("LINE", 3, "z", '{"x":1}'), line("LINE", 10, "z", ""),
  ]);
  assert.equal(projection.canvasRecords, 1);
  assert.equal(expectedSavedSymbolContent(projection, FRESH), expected([line("LINE", 10, "z", "", 3)]));
});

void test("all historical canvas occurrences must share one segment and keep their atom type", async () => {
  for (const extra of [line("LINE", 21, "other", '{"x":3}'), line("LINE", 21, "z", ""), line("META_PLACEHOLDER", 21, "z", "")]) {
    const history = chunks(); history[1] += `|\n${extra}`;
    await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history)), /segments|type changed/u);
  }
  await assert.rejects(prepareCanvas([
    line("LINE", 3, "z", '{"x":1}'), line("STRING", 10, "z", ""),
  ]), /type changed/u);
  await assert.rejects(prepareCanvas([]), /requires historical canvas/u);
});

void test("canvas header requires explicit clocks and a unique latest header with maximal target ticket", async () => {
  for (const replacement of [head(21, 40), head(3, 210), head(21, 0)]) {
    const history = chunks(); history[1] = [edit(), replacement, meta(21)].join("|\n");
    await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history)), /header|positive/u);
  }
  const duplicate = chunks(); duplicate[1] += `|\n${head(21, 210)}|\n${meta(21)}`;
  await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(duplicate)), /header/u);
  const missing = chunks().map((chunk) => chunk.replace('"updateTime":40,', ""));
  await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(missing)), /integer/u);
});

void test("lone target DOCHEAD cache omissions are refused even when peer records produce a cached segment", async () => {
  for (const lone of [head(21, 210), head(1, 10)]) {
    const history = chunks(); history.push([edit(), lone, head(20, 200, PEER), meta(20)].join("|\n"));
    await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history)), /lone target DOCHEAD/u);
    const raw = await prepareSavedSymbolProjection(input(history));
    assert.equal(raw.canvasRecords, 2);
  }
  for (const extra of [[edit(), head(20, 200, PEER), meta(20)], [edit(), head(1, 10), head(2, 20)]]) {
    const history = chunks(); history.push(extra.join("|\n"));
    const projection = await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history));
    assert.equal(expectedSavedSymbolContent(projection, FRESH), expected([line("LINE", 10, "z", '{ "x":2 }', 3), CANVAS[1] ?? "missing"]));
  }
});

void test("native lossy body encodings, imported headers and unsupported normalized keys remain refused", async () => {
  for (const raw of [' {"x":1}', '{"x":1} ', '\t{"x":1}', '{"x":1}\r']) {
    await assert.rejects(prepareCanvas([line("LINE", 10, "z", raw)]), /discarded/u);
  }
  for (const atom of ['{"type":"LINE","ticket":10,"id":"z","firstTicket":1}||{"x":1}',
    '{"type":"LINE","ticket":10,"id":"z","pend":false}||{"x":1}', line("NET", 10, "z", '{"x":1}')]) {
    await assert.rejects(prepareCanvas([atom]));
  }
  await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection({ ...input(), maximumTicket: 20 }), /global ticket/u);
  await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection({ ...input(), currentEditVersion: "3.2.207" }), /version/u);
});

void test("explicit header users and complete input linkage survive without broadening existing META-only alternatives", async () => {
  const user = { nickname: null, uuid: "5".repeat(32), username: "", extra: { exact: true } };
  const history = chunks(); history[1] = [edit(), head(21, 210, TARGET, { user }), meta(21)].join("|\n");
  const pending = prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input(history)); history[0] = "changed caller input";
  const projection = await pending;
  assert.equal(expectedSavedSymbolContent(projection, FRESH), expected([line("LINE", 10, "z", '{ "x":2 }', 3), CANVAS[1] ?? "missing"], user));
  assert.throws(() => expectedSavedSymbolContent(structuredClone(projection), FRESH), /original/u);
  await assert.rejects(prepareCurrentDocumentCacheSavedSymbolProjection(input()), /canvas/u);
  const raw = await prepareSavedSymbolProjection(input());
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A new pure profile must not be accepted by the existing live alternative selector.
  const wrongProfile = projection as unknown as Awaited<ReturnType<typeof prepareCurrentDocumentCacheSavedSymbolProjection>>;
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, wrongProfile, observation(expectedSavedSymbolContent(projection, FRESH))), /complete history/u);
});
