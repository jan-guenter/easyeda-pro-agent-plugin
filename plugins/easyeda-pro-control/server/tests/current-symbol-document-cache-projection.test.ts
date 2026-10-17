/** Synthetic complete histories only. These exact relations grant no live authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, prepareCurrentDocumentCacheSavedSymbolProjection,
  prepareSavedSymbolProjection, verifyCurrentSavedSymbolProjectionAlternatives, verifySavedSymbolContent } from "../src/saved-symbol-projection.ts";

const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), PEER = "3".repeat(16), TARGET = "2".repeat(16);
const ACTOR = { uuid: "4".repeat(32), username: "Original", nickname: "Actor" };
const META = { title: "Synthetic", description: "Exact Ω", tags: ["tag"], docType: 2, source: "source" };
function edit(actor: object = ACTOR): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...actor, updateTime: 1 })}`; }
function header(ticket: number, uuid = TARGET, user?: object): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", uuid, client: CLIENT,
    updateTime: ticket * 10, version: String(ticket * 10), editVersion: "3.2.206", ...(user === undefined ? {} : { user }) })}`;
}
function meta(ticket: number): string { return `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify(META)}`; }
function chunks(): string[] { return [[edit(), header(1, PEER), meta(1), header(2), meta(2), header(9, PEER), meta(9)].join("|\n")]; }
function input(history = chunks(), version: string | null = "3.2.206"): {
  chunks: string[]; targetUuid: string; maximumTicket: number; currentEditVersion: string | null;
} { return { chunks: history, targetUuid: TARGET, maximumTicket: 9, currentEditVersion: version }; }
function observation(content: string): { profile: string; targetUuid: string; maximumTicket: number; workerClient: string; content: string } {
  return { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket: 9, workerClient: FRESH, content };
}
function expected(user: object, ticket = 2): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket: 10 })}||${JSON.stringify({ docType: "SYMBOL", client: FRESH, uuid: TARGET,
    updateTime: ticket * 10, version: String(ticket * 10), editVersion: "3.2.206", user })}|\n${meta(ticket)}`;
}

void test("current cache projection pins the admitted worker and preserves complete raw linkage", async () => {
  const pin = CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION;
  assert.deepEqual(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION.files.find((value) => value.relativePath === pin.relativePath),
    { relativePath: pin.relativePath, bytes: pin.bytes, sha256: pin.sha256 });
  const raw = await prepareSavedSymbolProjection(input());
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input());
  assert.equal(cache.workerSourceSha256, pin.sha256); assert.equal(cache.cacheBranchObserved, false);
  assert.equal(cache.rawHistorySha256, raw.rawHistorySha256); assert.equal(cache.rawHistoryBytes, raw.rawHistoryBytes);
  assert.equal(cache.rawHistoryBytes, Buffer.byteLength(chunks().join(""))); assert.equal(cache.maximumTicket, 9);
  assert.equal(cache.canvasRecords, 0); assert.equal(cache.executionAuthorized, false); assert.equal(cache.producerBindingVerified, false);
  assert.equal(expectedSavedSymbolContent(raw, FRESH), expected(ACTOR));
  assert.equal(expectedSavedSymbolContent(cache, FRESH), expected({ uuid: TARGET }));
  assert.throws(() => verifySavedSymbolContent(raw, observation(expected({ uuid: TARGET }))), /differs/u);
});

void test("both exact alternatives identify a matched model without observing the cache branch", async () => {
  const raw = await prepareSavedSymbolProjection(input());
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input());
  for (const [content, matchedProjection] of [[expected(ACTOR), "complete-raw-history"], [expected({ uuid: TARGET }), "current-document-cache"]]) {
    assert.ok(content !== undefined);
    const result = verifyCurrentSavedSymbolProjectionAlternatives(raw, cache, observation(content));
    assert.equal(result["matchedProjection"], matchedProjection); assert.equal(result["cacheBranchObserved"], false);
    assert.equal(result["exactContent"], true); assert.equal(result["producerBindingVerified"], false);
    assert.equal(result["executionAuthorized"], false); assert.equal(result["completionProved"], false);
  }
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, undefined, observation(expected({ uuid: TARGET }))), /differs/u);
});

void test("cache fragments ignore peer-first and later EDIT_HEAD actors but retain first-target fallback names", async () => {
  const first = { uuid: "5".repeat(32), username: "First target", nickname: "Target name", extra: "explicit only" };
  const second = { uuid: "6".repeat(32), username: "Later actor", nickname: "Not cache" };
  const history = [[edit(), header(1, PEER, { uuid: PEER, username: "Peer name" }), meta(1), header(2, TARGET, first), meta(2),
    edit(second), header(3), meta(3), header(9, PEER), meta(9)].join("|\n")];
  const raw = await prepareSavedSymbolProjection(input(history));
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input(history));
  assert.equal(expectedSavedSymbolContent(raw, FRESH), expected(second, 3));
  assert.equal(expectedSavedSymbolContent(cache, FRESH),
    expected({ uuid: TARGET, username: first.username, nickname: first.nickname }, 3));
});

void test("cache fallback resets for each raw chunk even after an explicit named target header", async () => {
  const history = [[edit(), header(2, TARGET, { uuid: "5".repeat(32), username: "Earlier", nickname: "Earlier" }), meta(2)].join("|\n"),
    [edit(), header(1, PEER, { username: "Peer" }), meta(1), header(3), meta(3), header(9, PEER), meta(9)].join("|\n")];
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input(history));
  assert.equal(expectedSavedSymbolContent(cache, FRESH), expected({ uuid: TARGET }, 3));
});

void test("without EDIT_HEAD the cache fallback is still first target, not first peer", async () => {
  const history = [[header(1, PEER), meta(1), header(2), meta(2), header(9, PEER), meta(9)].join("|\n")];
  const raw = await prepareSavedSymbolProjection(input(history));
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input(history));
  assert.equal(expectedSavedSymbolContent(raw, FRESH), expected({ uuid: PEER }));
  assert.equal(expectedSavedSymbolContent(cache, FRESH), expected({ uuid: TARGET }));
});

void test("explicit header users retain all fields, values and order; identical alternatives report raw first", async () => {
  const user = { nickname: null, uuid: "5".repeat(32), username: "", extra: { preserved: false } };
  const history = [[edit(), header(1, PEER), meta(1), header(2, TARGET, user), meta(2), header(9, PEER), meta(9)].join("|\n")];
  const raw = await prepareSavedSymbolProjection(input(history));
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input(history));
  assert.equal(expectedSavedSymbolContent(raw, FRESH), expected(user)); assert.equal(expectedSavedSymbolContent(cache, FRESH), expected(user));
  const relation = verifyCurrentSavedSymbolProjectionAlternatives(raw, cache, observation(expected(user)));
  assert.equal(relation["matchedProjection"], "complete-raw-history"); assert.equal(relation["cacheBranchObserved"], false);
});

void test("exact alternatives refuse arbitrary user, metadata, clock, encoding and identity changes", async () => {
  const raw = await prepareSavedSymbolProjection(input());
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input());
  for (const original of [expected(ACTOR), expected({ uuid: TARGET })]) {
    const mutations = [original.replace('"user":{', '"user":{"extra":true,'), original.replace('"description":"Exact Ω"', '"description":"changed"'),
      original.replace('"updateTime":20', '"updateTime":21'), original.replace('"version":"20"', '"version":"21"'),
      original.replace('"ticket":10', '"ticket":11'), original.replace('"editVersion":"3.2.206"', '"editVersion":"3.2.207"'),
      original.replace('"source":"source"', '"source": "source"'), `${original}|\n`];
    for (const content of mutations) { assert.notEqual(content, original); assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, cache, observation(content)), /differs/u); }
    for (const patch of [{ targetUuid: PEER }, { maximumTicket: 10 }, { workerClient: CLIENT }, { profile: "wrong" }]) {
      assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, cache, { ...observation(original), ...patch }), /differs/u);
    }
  }
  const unrelated = observation(expected({ uuid: "7".repeat(32) }));
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, cache, unrelated), /differs/u);
});

void test("nonempty canvas and tombstone histories never gain the cache alternative", async () => {
  for (const shape of ['{"type":"LINE","ticket":3,"id":"shape"}||{"x":1}',
    '{"type":"LINE","ticket":3,"id":"shape"}||{"x":1}|\n{"type":"LINE","ticket":4,"id":"shape"}||']) {
    const history = [[edit(), header(2), meta(2), shape, header(9, PEER), meta(9)].join("|\n")];
    const raw = await prepareSavedSymbolProjection(input(history)); assert.equal(raw.canvasRecords, 1);
    const seen = observation(expectedSavedSymbolContent(raw, FRESH));
    assert.equal(verifyCurrentSavedSymbolProjectionAlternatives(raw, undefined, seen)["exactContent"], true);
    await assert.rejects(prepareCurrentDocumentCacheSavedSymbolProjection(input(history)), /canvas/u);
  }
});

void test("cache alternate is current-only; existing raw projection remains available on older versions", async () => {
  for (const version of [null, "3.0", "3.2.205", "3.2.207"]) {
    const request = input(chunks(), version);
    await assert.rejects(prepareCurrentDocumentCacheSavedSymbolProjection(request), /version/u);
    const raw = await prepareSavedSymbolProjection(request);
    const seen = observation(expectedSavedSymbolContent(raw, FRESH));
    assert.equal(verifySavedSymbolContent(raw, seen)["exactContent"], true);
    assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, undefined, seen), /current/u);
  }
});

void test("cache alternatives retain original identity and refuse unrelated complete histories", async () => {
  const raw = await prepareSavedSymbolProjection(input());
  const cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input());
  const other = await prepareCurrentDocumentCacheSavedSymbolProjection(input(chunks().map((chunk) => chunk.replace('"nickname":"Actor"', '"nickname":"Other"'))));
  assert.equal(expectedSavedSymbolContent(other, FRESH), expectedSavedSymbolContent(cache, FRESH));
  assert.notEqual(other.rawHistorySha256, raw.rawHistorySha256);
  assert.throws(() => expectedSavedSymbolContent(structuredClone(cache), FRESH), /original/u);
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(structuredClone(raw), cache, observation(expected(ACTOR))), /original/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Intentionally submit a genuine original of the wrong kind at the JavaScript boundary.
  const wrongKind = raw as unknown as typeof cache;
  assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, wrongKind, observation(expected(ACTOR))), /complete history/u);
  for (const candidate of [other, structuredClone(cache)]) {
    assert.throws(() => verifyCurrentSavedSymbolProjectionAlternatives(raw, candidate, observation(expected({ uuid: TARGET }))), /complete history/u);
  }
});

void test("cache preparation still validates full raw history and all-peer global maximum", async () => {
  await assert.rejects(prepareCurrentDocumentCacheSavedSymbolProjection({ ...input(), maximumTicket: 2 }), /global ticket/u);
  const corruptPeer = chunks().map((chunk) => chunk.replace('"uuid":"3333333333333333"', '"uuid":null'));
  await assert.rejects(prepareCurrentDocumentCacheSavedSymbolProjection(input(corruptPeer)));
  const history = chunks(), pending = prepareCurrentDocumentCacheSavedSymbolProjection(input(history)); history[0] = "mutated caller input";
  assert.equal(expectedSavedSymbolContent(await pending, FRESH), expected({ uuid: TARGET }));
});
