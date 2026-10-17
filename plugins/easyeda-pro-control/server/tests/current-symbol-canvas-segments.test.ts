/** Synthetic histories only. No runtime, cache or project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedSavedSymbolContent, prepareCurrentCanvasSegmentsSavedSymbolProjection,
  prepareCurrentSingleCanvasSegmentSavedSymbolProjection, prepareSavedSymbolProjection, verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives,
  verifyCurrentSavedSymbolProjectionAlternatives } from "../src/saved-symbol-projection.ts";
import type { CurrentDocumentCacheSavedSymbolProjection } from "../src/saved-symbol-projection.ts";

const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), PEER = "3".repeat(16), TARGET = "2".repeat(16);
const ACTOR = { uuid: "4".repeat(32), username: "Actor", nickname: "Original" };
const META = { title: "Synthetic", description: "Exact Ω", tags: ["tag"], docType: 2, source: "" };
function atom(type: string, ticket: number, id: string, raw: string, firstTicket?: number): string {
  return `${JSON.stringify({ type, ticket, id, ...(firstTicket === undefined ? {} : { firstTicket }) })}||${raw}`;
}
function head(ticket: number, time: number, uuid = TARGET, additions: object = {}): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.180", ...additions })}`;
}
function edit(): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: 1 })}`; }
function meta(ticket: number): string { return atom("META", ticket, "META", JSON.stringify(META)); }
const A = atom("PART", 3, "a", '{"partId":"P"}'), B = atom("LINE", 4, "b", '{ "x":1 }');
const C = atom("RECT", 8, "c", '{"x":2}'), D = atom("LINE", 9, "d", '{"x":3}');
function history(): string[] {
  return [[edit(), head(4, 40), meta(4), A, B].join("|\n"), [edit(), head(9, 90), meta(9), C, D].join("|\n"),
    [edit(), head(21, 210), meta(21)].join("|\n")];
}
function input(chunks = history()): { chunks: string[]; targetUuid: string; maximumTicket: number; currentEditVersion: string } {
  return { chunks, targetUuid: TARGET, maximumTicket: 21, currentEditVersion: "3.2.206" };
}
function observation(content: string): Record<string, unknown> {
  return { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket: 21, workerClient: FRESH, content };
}
function reordered(representative: string, canvas: readonly string[]): string { return [...representative.split("|\n", 3), ...canvas].join("|\n"); }
async function pair(chunks = history()): Promise<{
  raw: Awaited<ReturnType<typeof prepareSavedSymbolProjection>>;
  cache: Awaited<ReturnType<typeof prepareCurrentCanvasSegmentsSavedSymbolProjection>>;
}> {
  return { raw: await prepareSavedSymbolProjection(input(chunks)), cache: await prepareCurrentCanvasSegmentsSavedSymbolProjection(input(chunks)) };
}

void test("creation and later drawing segments admit streamed interleaving, not arbitrary sorting", async () => {
  const { raw, cache } = await pair();
  assert.equal(cache.canvasSegmentCount, 2); assert.equal(cache.canvasRecords, 4); assert.equal(cache.maximumConcurrentChunks, 101);
  assert.equal(cache.maximumTargetHeaderTime, 210); assert.equal(cache.rawPrefixOrderIndependent, true); assert.equal(cache.segmentOrderIndependent, false);
  assert.equal(cache.executionAuthorized, false); assert.equal(cache.producerBindingVerified, false); assert.equal(cache.cacheBranchObserved, false);
  const representative = expectedSavedSymbolContent(cache, FRESH);
  // A,C,B,D is a legal record-level interleaving, neither whole-chunk permutation.
  const content = reordered(representative, [A, C, B, D]);
  const result = verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(content));
  assert.equal(result["matchedProjection"], "current-canvas-segments-cache"); assert.equal(result["firstArrivalOrderWitness"], true);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["completionProved"], false); assert.equal(result["cacheBranchObserved"], false);
  assert.equal(Buffer.byteLength(content), Buffer.byteLength(representative));
  assert.equal(Buffer.byteLength(JSON.stringify(content)), Buffer.byteLength(JSON.stringify(representative)));
  for (const order of [[B, A, C, D], [A, D, C, B], [D, C, B, A]]) {
    assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(reordered(representative, order))), /order/u);
  }
});

void test("the canvas-free winning metadata chunk permits the distinct raw actor prefix without imposing canvas order", async () => {
  const { raw, cache } = await pair();
  const cacheContent = expectedSavedSymbolContent(cache, FRESH), rawContent = expectedSavedSymbolContent(raw, FRESH);
  assert.notEqual(rawContent, cacheContent);
  const content = reordered(rawContent, [C, A, D, B]);
  assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(content))["matchedProjection"], "current-canvas-segments-raw-header");
  assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(rawContent))["matchedProjection"], "complete-raw-history");
});

void test("raw header atomicity is retained when the winning fragment contains canvas", async () => {
  const chunks = history().slice(0, 2); chunks[0] = [edit(), head(21, 210), meta(21), A, B].join("|\n");
  const { raw, cache } = await pair(chunks);
  assert.equal(cache.rawPrefixOrderIndependent, false);
  const cacheContent = expectedSavedSymbolContent(cache, FRESH), rawContent = expectedSavedSymbolContent(raw, FRESH);
  assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(reordered(rawContent, [A, C, B, D]))), /header/u);
  const cacheObserved = observation(reordered(cacheContent, [A, C, B, D]));
  assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, cacheObserved)["matchedProjection"], "current-canvas-segments-cache");
  assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(rawContent))["matchedProjection"], "complete-raw-history");
  chunks[0] = [edit(), head(21, 210, TARGET, { user: ACTOR }), meta(21), A, B].join("|\n");
  const explicit = await pair(chunks);
  assert.equal(explicit.cache.rawPrefixOrderIndependent, true);
  assert.equal(expectedSavedSymbolContent(explicit.raw, FRESH), expectedSavedSymbolContent(explicit.cache, FRESH));
  const explicitContent = expectedSavedSymbolContent(explicit.raw, FRESH);
  const explicitObserved = observation(reordered(explicitContent, [A, C, B, D]));
  assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(explicit.raw, explicit.cache, explicitObserved)["exactContent"], true);
});

void test("repeated identities and tombstones keep final bytes and physical firstTicket across all segments", async () => {
  const changedA = atom("PART", 10, "a", '{ "partId":"Changed" }'), deadB = atom("LINE", 11, "b", "");
  const chunks = history(); chunks[1] = [edit(), head(11, 110), meta(11), deadB, changedA, C].join("|\n");
  const { raw, cache } = await pair(chunks);
  const finalA = atom("PART", 10, "a", '{ "partId":"Changed" }', 3), finalB = atom("LINE", 11, "b", "", 4);
  const representative = expectedSavedSymbolContent(cache, FRESH);
  for (const order of [[finalA, finalB, C], [finalB, finalA, C]]) {
    const observed = observation(reordered(representative, order));
    assert.equal(verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observed)["exactContent"], true);
  }
  assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache,
    observation(reordered(representative, [C, finalB, finalA]))), /order/u);
  for (const wrong of [finalA.replace('"firstTicket":3', '"firstTicket":4'), finalA.replace('{ "partId"', '{"partId"'), A]) {
    assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache,
      observation(reordered(representative, [wrong, finalB, C]))), /line|bound/u);
  }
});

void test("line lookup rejects omissions, duplicates, extra records, prefix changes and altered bodies", async () => {
  const { raw, cache } = await pair(); const content = expectedSavedSymbolContent(cache, FRESH);
  for (const changed of [reordered(content, [A, A, C, D]), reordered(content, [A, B, C]), reordered(content, [A, B, C, D, D]),
    content.replace('{ "x":1 }', '{"x":1}'), content.replace('"ticket":22', '"ticket":23'), `${content}|\n`,
    content.replace('"uuid":"2222222222222222"}', '"uuid":"3333333333333333"}')]) {
    assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, observation(changed)));
  }
});

void test("original descriptors, complete-history binding and observation identity cannot be copied or substituted", async () => {
  const { raw, cache } = await pair(); const observed = observation(expectedSavedSymbolContent(cache, FRESH));
  const other = await pair(history().map((chunk) => chunk.replaceAll("Exact Ω", "Other Ω")));
  for (const candidate of [structuredClone(cache), other.cache]) {
    assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, candidate, observed), /complete history/u);
  }
  assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(structuredClone(raw), cache, observed), /complete history/u);
  assert.throws(() => expectedSavedSymbolContent(structuredClone(cache), FRESH), /original/u);
  for (const replacement of [{ targetUuid: PEER }, { maximumTicket: 20 }, { workerClient: "invalid" }, { profile: "other" }]) {
    assert.throws(() => verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw, cache, { ...observed, ...replacement }));
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A distinct pure profile must not enter the old META-only selector.
  const wrongProfile = cache as unknown as CurrentDocumentCacheSavedSymbolProjection;
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, wrongProfile, observed), /complete history/u);
  await assert.rejects(prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input()), /segments/u);
});

void test("the 101-chunk bound includes peer-only chunks and cannot silently enter a second loader batch", async () => {
  const chunks = history();
  while (chunks.length < 101) { chunks.push([edit(), head(1, 10, PEER), meta(1)].join("|\n")); }
  const projection = await prepareCurrentCanvasSegmentsSavedSymbolProjection(input(chunks));
  assert.equal(projection.canvasSegmentCount, 2);
  chunks.push(chunks[3] ?? "missing");
  await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection(input(chunks)), /101-chunk/u);
});

void test("same-type grouped cache headers and lone target headers are refused before actor ambiguity", async () => {
  const peerFirst = history(); peerFirst[0] = [edit(), head(1, 10, PEER), meta(1), head(4, 40), meta(4), A, B].join("|\n");
  await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection(input(peerFirst)), /peer SYMBOL/u);
  const targetFirst = history(); targetFirst[0] += `|\n${head(1, 10, PEER)}|\n${meta(1)}`;
  const projection = await prepareCurrentCanvasSegmentsSavedSymbolProjection(input(targetFirst));
  assert.equal(projection.canvasRecords, 4);
  const lone = history(); lone.push([edit(), head(1, 10)].join("|\n"));
  await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection(input(lone)), /lone/u);
});

void test("existing raw-body, clock, type and imported-record refusals remain intact", async () => {
  const variations = [
    history().map((chunk) => chunk.replace('"updateTime":210', '"updateTime":90')),
    history().map((chunk) => chunk.replace('{"type":"DOCHEAD","ticket":21}', '{"type":"DOCHEAD","ticket":8}')),
    history().map((chunk) => chunk.replace('"updateTime":210', '"updateTime":0')),
  ];
  for (const extra of [atom("META_PLACEHOLDER", 21, "a", ""), atom("LINE", 4, "b", '{"x":1}'), atom("LINE", 21, "new", ' {"x":1}'),
    atom("NET", 21, "new", '{"x":1}'), atom("LINE", 21, "new", '{"x":1}', 1), '{"type":"LINE","ticket":21,"id":"new","pend":false}||{"x":1}']) {
    const chunks = history(); chunks[2] += `|\n${extra}`; variations.push(chunks);
  }
  for (const chunks of variations) { await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection(input(chunks))); }
  await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection({ ...input(), currentEditVersion: "3.2.207" }), /version/u);
});
