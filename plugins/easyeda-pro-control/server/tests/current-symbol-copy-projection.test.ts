/** Pure synthetic histories. No application, profile, database or runtime. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SYMBOL_COPY_CANVAS_TYPES, currentCanvasSegmentsCopySource, expectedSavedSymbolContent,
  prepareCurrentCanvasSegmentsSavedSymbolProjection, prepareCurrentCreatedCopySavedSymbolProjection,
  verifyCurrentCanvasSegmentsCopySourceOrder, verifyCurrentCreatedCopySavedSymbolProjectionAlternatives } from "../src/saved-symbol-projection.ts";

const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), SOURCE = "1".repeat(16), TARGET = "2".repeat(16);
const ACTOR = { uuid: "4".repeat(32), username: "Synthetic", nickname: "Actor" };
const META = { title: "Copied", description: "Exact Ω", tags: ["synthetic"], docType: 2, source: "" };
const PART = '{"partId":"p"}';
function record(type: string, ticket: number, id: string, raw: string): string {
  return `${JSON.stringify({ type, ticket, id })}||${raw}`;
}
function head(ticket: number, time: number, targetUuid = TARGET): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid: targetUuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
function edit(time = 3000): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
function meta(ticket: number): string { return record("META", ticket, "META", JSON.stringify(META)); }
function source(): string[] {
  return [[edit(50), head(40, 50, SOURCE), meta(40), record("PART", 5, "p", PART), record("RECT", 11, "r", '{ "partId":"p", "x": 1 }')].join("|\n")];
}
function creation(secondTime = 2000, canvas = [record("PART", 5, "p", PART), record("RECT", 11, "r", '{ "partId":"p", "x": 1 }')]): string {
  return [edit(), head(41, 2000), meta(41), head(42, secondTime), ...canvas].join("|\n");
}
function input(chunks = [...source(), creation()]): Readonly<{
  chunks: readonly string[]; targetUuid: string; beforeMaximumTicket: number; currentEditVersion: string;
}> { return { chunks, targetUuid: TARGET, beforeMaximumTicket: 40, currentEditVersion: "3.2.206" }; }
function observation(content: string): Readonly<Record<string, unknown>> {
  return { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket: 42, workerClient: FRESH, content };
}
function prepareCreation(chunk: string): ReturnType<typeof prepareCurrentCreatedCopySavedSymbolProjection> {
  return prepareCurrentCreatedCopySavedSymbolProjection(input([...source(), chunk]));
}

for (const clock of [2000, 2001]) {
  void test(`created copy preserves ${clock === 2000 ? "equal-time first" : "strictly newer second"} header with global M+2`, async () => {
    const chunks = [...source(), creation(clock)], result = await prepareCurrentCreatedCopySavedSymbolProjection(input(chunks));
    const cached = expectedSavedSymbolContent(result.documentCache, FRESH), raw = expectedSavedSymbolContent(result.raw, FRESH);
    assert.equal(result.creationChunkIndex, 1); assert.equal(result.metadataHeaderTime, 2000); assert.equal(result.canvasHeaderTime, clock);
    assert.equal(result.raw.maximumTicket, 42); assert.equal(result.raw.canvasRecords, 2); assert.equal(result.executionAuthorized, false);
    assert.equal(result.producerBindingVerified, false); assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.documentCache));
    const rows = raw.split("|\n");
    assert.equal(rows[0]?.startsWith('{"type":"DOCHEAD","ticket":43}'), true);
    assert.equal(rows[1]?.startsWith('{"type":"META","ticket":41,"id":"META"}'), true);
    assert.equal(rows[2]?.startsWith(`{"type":"DOCHEAD","ticket":${clock === 2000 ? 41 : 42}}`), true);
    assert.ok(raw.includes(`"updateTime":${clock},"version":"${clock}"`));
    assert.ok(raw.includes(`"user":${JSON.stringify(ACTOR)}`)); assert.ok(cached.includes(`"user":{"uuid":"${TARGET}"}`));
    assert.notEqual(raw, cached);
    for (const [content, matched] of [[raw, "complete-raw-history"], [cached, "current-created-copy-cache"]]) {
      assert.ok(content !== undefined);
      const proof = verifyCurrentCreatedCopySavedSymbolProjectionAlternatives(result, observation(content));
      assert.equal(proof["matchedProjection"], matched); assert.equal(proof["exactContent"], true);
      assert.equal(proof["executionAuthorized"], false); assert.equal(proof["completionProved"], false); assert.equal(proof["cacheBranchObserved"], false);
    }
    if (clock === 2000) {
      await assert.rejects(prepareCurrentCanvasSegmentsSavedSymbolProjection({ chunks, targetUuid: TARGET, maximumTicket: 42, currentEditVersion: "3.2.206" }), /arrival order/u);
    }
  });
}

void test("created-copy verifier requires its original wrapper and exact observation", async () => {
  const result = await prepareCurrentCreatedCopySavedSymbolProjection(input());
  const content = expectedSavedSymbolContent(result.documentCache, FRESH);
  for (const clone of [structuredClone(result), { ...result }]) {
    assert.throws(() => verifyCurrentCreatedCopySavedSymbolProjectionAlternatives(clone, observation(content)), /original/u);
  }
  for (const replacement of [{ targetUuid: SOURCE }, { maximumTicket: 41 }, { workerClient: "bad" }, { profile: "other" },
    { content: content.replace('{ "partId":"p", "x": 1 }', '{"partId":"p","x":1}') }, { content: `${content}|\n` }]) {
    assert.throws(() => verifyCurrentCreatedCopySavedSymbolProjectionAlternatives(result, { ...observation(content), ...replacement }));
  }
});

void test("created-copy preparation captures all input bytes before yielding", async () => {
  const chunks = [...source(), creation()], pending = prepareCurrentCreatedCopySavedSymbolProjection(input(chunks)); chunks[1] = "changed";
  const result = await pending; assert.ok(expectedSavedSymbolContent(result.raw, FRESH).endsWith('{ "partId":"p", "x": 1 }'));
});

const invalidCreations: readonly (readonly [string, (value: string) => string])[] = [
  ["regressing clock", () => creation(1999)],
  ["wrong version", value => value.replace('"version":"2000"', '"version":"wrong"')],
  ["missing edit header", value => value.split("|\n").slice(1).join("|\n")],
  ["extra edit header", value => `${edit()}|\n${value}`],
  ["wrong first header ticket", value => value.replace('"ticket":41}', '"ticket":42}')],
  ["different client", value => value.replace(`"client":"${CLIENT}"`, `"client":"${FRESH}"`)],
  ["explicit header user", value => value.replace('"editVersion":"3.2.206"}', `"editVersion":"3.2.206","user":${JSON.stringify(ACTOR)}}`)],
  ["unknown header field", value => value.replace('"type":"DOCHEAD","ticket":41', '"type":"DOCHEAD","ticket":41,"extra":1')],
  ["firstTicket", value => value.replace('"id":"r"}', '"id":"r","firstTicket":1}')],
  ["pending", value => value.replace('"id":"r"}', '"id":"r","pend":false}')],
  ["numbering", value => value.replace('"id":"r"}', '"id":"r","num":1}')],
  ["copied client", value => value.replace('"id":"r"}', `"id":"r","client":"${CLIENT}"}`)],
  ["future copied ticket", value => value.replace('"type":"RECT","ticket":11', '"type":"RECT","ticket":41')],
  ["wrong metadata ticket", value => value.replace('"type":"META","ticket":41', '"type":"META","ticket":40')],
  ["wrong metadata source", value => value.replace('"source":""', '"source":"remote"')],
  ["duplicate copied ID", value => `${value}|\n${record("RECT", 11, "r", '{ "partId":"p", "x": 1 }')}`],
  ["foreign document", value => `${value}|\n${head(1, 1, SOURCE)}|\n${meta(1)}`],
  ["empty canvas", value => value.split("|\n").slice(0, 4).join("|\n")],
  ["wrong field order", value => value.replace('"type":"RECT","ticket":11,"id":"r"', '"id":"r","type":"RECT","ticket":11')],
  ["prefix whitespace", value => value.replace('"type":"DOCHEAD"', '"type": "DOCHEAD"')],
  ["atom header whitespace", value => value.replace('"type":"RECT"', '"type": "RECT"')],
  ["trailing delimiter", value => `${value}|\n`],
  ["discarded whitespace body", value => value.replace('||{ "partId":"p", "x": 1 }', '|| { "partId":"p", "x": 1 }')],
];
for (const [name, change] of invalidCreations) {
  void test(`created-copy refuses ${name}`, async () => {
    const changed = change(creation()); await assert.rejects(prepareCreation(changed));
  });
}

void test("created-copy refuses preexisting destination, cross-chunk headers, incomplete baseline and insufficient headroom", async () => {
  const records = creation().split("|\n");
  for (const chunks of [[...source(), creation(), [edit(), head(1, 1), meta(1)].join("|\n")],
    [...source(), records.slice(0, 3).join("|\n"), [edit(), ...records.slice(3)].join("|\n")], [creation()]]) {
    await assert.rejects(prepareCurrentCreatedCopySavedSymbolProjection(input(chunks)));
  }
  for (const replacement of [{ beforeMaximumTicket: Number.MAX_SAFE_INTEGER - 2 }, { beforeMaximumTicket: -0 }, { currentEditVersion: "3.2.207" },
    { targetUuid: "2".repeat(32) }, { chunks: ["\uD800"] }]) {
    await assert.rejects(prepareCurrentCreatedCopySavedSymbolProjection({ ...input(), ...replacement }));
  }
});

void test("copy drawing allowlist excludes assets, unsupported encoders and unknown types including tombstones", async () => {
  assert.ok(Object.isFrozen(CURRENT_SYMBOL_COPY_CANVAS_TYPES));
  assert.deepEqual(CURRENT_SYMBOL_COPY_CANVAS_TYPES, ["PART", "CANVAS", "ATTR", "ELLIPSE", "PIN", "RECT", "ARC", "CIRCLE", "POLY", "TEXT", "BEZIER", "ELE_PLACEHOLDER"]);
  for (const type of ["LINE", "BLOB", "FONT", "OBJ", "GROUP", "TABLE", "UNKNOWN", "META_PLACEHOLDER"]) {
    for (const raw of ['{"x":1}', ""]) {
      const chunk = creation(2000, [record("PART", 5, "p", PART), record(type, 11, "r", raw)]);
      await assert.rejects(prepareCreation(chunk));
    }
  }
  const chunk = creation(2000, [record("PART", 5, "p", PART), record("RECT", 11, "r", "")]);
  const dead = await prepareCreation(chunk);
  assert.ok(expectedSavedSymbolContent(dead.raw, FRESH).endsWith('{"type":"RECT","ticket":11,"id":"r"}||'));
});

void test("created-copy placeholders preserve their exact counter bytes and reject foreign ownership or unsafe counts", async () => {
  const part = record("PART", 5, "p", PART);
  const placeholder = record("ELE_PLACEHOLDER", 11, "placeholder1", '{ "dataType": "PIN", "max": 3 }');
  const result = await prepareCreation(creation(2000, [part, placeholder]));
  for (const projection of [result.raw, result.documentCache]) {
    assert.ok(expectedSavedSymbolContent(projection, FRESH).endsWith(placeholder));
  }
  for (const raw of ["", "{}", '{"dataType":"PIN","max":0}', '{"dataType":"PIN","max":1.5}',
    '{"dataType":"PIN","max":9007199254740992}', '{"dataType":"PIN","max":1,"partId":"p"}',
    '{"dataType":"PIN","max":1,"parentId":"p"}', '{"dataType":"OBJ","max":1}', '{"dataType":"PART","max":1}']) {
    const chunk = creation(2000, [part, record("ELE_PLACEHOLDER", 11, "placeholder1", raw)]);
    await assert.rejects(prepareCreation(chunk), /placeholder|native object/u);
  }
  const excessive = creation(2000, [part,
    record("ELE_PLACEHOLDER", 11, "placeholder1", '{"dataType":"PIN","max":9007199254740988}'),
    record("ELE_PLACEHOLDER", 12, "placeholder2", '{"dataType":"PIN","max":1}') ]);
  await assert.rejects(prepareCreation(excessive), /numbering/u);
});

function sourceProjection(chunks: readonly string[]): ReturnType<typeof prepareCurrentCanvasSegmentsSavedSymbolProjection> {
  return prepareCurrentCanvasSegmentsSavedSymbolProjection({ chunks, targetUuid: SOURCE, maximumTicket: 40, currentEditVersion: "3.2.206" });
}

void test("copy accessor preserves complete raw bodies but regenerates headers without source firstTicket", async () => {
  const chunks = source(); chunks.push([edit(), head(39, 49, SOURCE), meta(39), record("RECT", 12, "r", '{  "partId":"p", "x": 2 }')].join("|\n"));
  const original = await sourceProjection(chunks), rows = currentCanvasSegmentsCopySource(original);
  assert.ok(Object.isFrozen(rows)); assert.equal(rows.length, 2); assert.ok(expectedSavedSymbolContent(original, FRESH).includes('"firstTicket":11'));
  assert.deepEqual(rows, [record("PART", 5, "p", PART), record("RECT", 12, "r", '{  "partId":"p", "x": 2 }')]);
  verifyCurrentCanvasSegmentsCopySourceOrder(original, rows);
  assert.throws(() => currentCanvasSegmentsCopySource(structuredClone(original)), /original/u);
  assert.throws(() => { verifyCurrentCanvasSegmentsCopySourceOrder(original, [rows[0] ?? "", (rows[1] ?? "").replace('{  "partId"', '{"partId"')]); }, /differs/u);
});

void test("copy row ordering retains per-stream witnesses, not arbitrary native object ordering", async () => {
  const a = record("PART", 5, "p", PART), b = record("RECT", 11, "r", '{"partId":"p"}');
  const c = record("CIRCLE", 20, "c", '{"partId":"p"}'), d = record("ARC", 21, "d", '{"partId":"p"}');
  const chunks = [[edit(), head(11, 10, SOURCE), meta(11), a, b].join("|\n"), [edit(), head(21, 20, SOURCE), meta(21), c, d].join("|\n"),
    [edit(), head(40, 40, SOURCE), meta(40)].join("|\n")];
  const original = await sourceProjection(chunks);
  verifyCurrentCanvasSegmentsCopySourceOrder(original, [a, c, b, d]); verifyCurrentCanvasSegmentsCopySourceOrder(original, [c, a, d, b]);
  for (const rows of [[b, a, c, d], [a, d, c, b], [a, a, c, d], [a, b, c], [a, b, c, d, d]]) {
    assert.throws(() => { verifyCurrentCanvasSegmentsCopySourceOrder(original, rows); });
  }
});

void test("copy IDs reject prototype names and integer indices before ordinary-object copying", async () => {
  for (const id of ["__proto__", "constructor", "prototype", "toString", "valueOf", "hasOwnProperty", "__defineGetter__", "0", "1", "4294967294"]) {
    const chunks = source().map(chunk => chunk.replace('"id":"r"', `"id":"${id}"`));
    const original = await sourceProjection(chunks);
    assert.throws(() => currentCanvasSegmentsCopySource(original), /unsafe/u);
    const changed = creation().replace('"id":"r"', `"id":"${id}"`);
    await assert.rejects(prepareCreation(changed), /unsafe/u);
  }
  for (const id of ["01", "4294967295", "0000000000000001"]) {
    const original = await sourceProjection(source().map(chunk => chunk.replace('"id":"r"', `"id":"${id}"`)));
    verifyCurrentCanvasSegmentsCopySourceOrder(original, currentCanvasSegmentsCopySource(original));
  }
});

void test("copy row validation rejects sparse/getter/invalid/oversized input without invoking getters", async () => {
  const original = await sourceProjection(source()), rows = [...currentCanvasSegmentsCopySource(original)];
  let called = false;
  const accessor = [...rows]; Object.defineProperty(accessor, "0", { get() { called = true; return rows[0]; } });
  assert.throws(() => { verifyCurrentCanvasSegmentsCopySourceOrder(original, accessor); }, /own data/u); assert.equal(called, false);
  const sparse = [...rows]; Reflect.deleteProperty(sparse, "0");
  for (const malformed of [sparse, ["\uD800", rows[1] ?? ""], ["x".repeat(262_145), rows[1] ?? ""]]) {
    assert.throws(() => { verifyCurrentCanvasSegmentsCopySourceOrder(original, malformed); });
  }
});

void test("creation chunk validation rejects holes and accessors before reading their values", async () => {
  const accessor = [...source(), creation()]; let called = false;
  Object.defineProperty(accessor, "1", { get() { called = true; return creation(); } });
  await assert.rejects(prepareCurrentCreatedCopySavedSymbolProjection(input(accessor)), /own data/u); assert.equal(called, false);
  const sparse = [...source(), creation()]; Reflect.deleteProperty(sparse, "0");
  await assert.rejects(prepareCurrentCreatedCopySavedSymbolProjection(input(sparse)), /own data/u);
});

void test("copy preserves quoted Unicode and escaped body bytes without JSON normalization", async () => {
  const body = String.raw`{ "partId":"p", "value":"quoted \"Ω\"\\path\nnext" }`;
  const chunks = source().map(chunk => chunk.replace(record("RECT", 11, "r", '{ "partId":"p", "x": 1 }'), record("TEXT", 11, "r", body)));
  const original = await sourceProjection(chunks), rows = currentCanvasSegmentsCopySource(original);
  assert.equal(rows[1], record("TEXT", 11, "r", body)); verifyCurrentCanvasSegmentsCopySourceOrder(original, rows);
  const destination = creation(2000, [...rows]), result = await prepareCreation(destination);
  assert.ok(expectedSavedSymbolContent(result.raw, FRESH).endsWith(body));
});
