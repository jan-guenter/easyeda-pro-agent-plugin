import { sha256Text } from "../src/core.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection, verifySavedSymbolContent } from "../src/saved-symbol-projection.ts";

interface SyntheticAtom { readonly id:string; readonly type:string; readonly ticket:number; readonly raw:string; readonly firstTicket:number }
const SERIALIZER_GOLDENS = ["f172df2966fe9b76244c10102649d3c5b3264e8b805b07a10ec80bcf38f28e3a","25e97bbeef851ae07bcbbb6ae9796bb48154607108b95356bb11dec08a75b0dc","80e9e3bb8c3f9a67ab948f0925a4de858e87852f9e09b48ebed18bdd859d8198","3c0bd86a45b97beaaa752999995dedcaf916f3f161fdadbd02545026bb2e4eff","1bfb34b22da7e51c63c61037d3daaead1b3a4c55b5f6a17040ee0016872c7cd9"];
const VERSIONED_SERIALIZER_GOLDENS = ["c8449516c2229a0490213ed39e7e3ca04d04d4c0cfd79ae9391194cad0d25faf","43f79e7acf11d510a544e6ac9c03a3468d8746d10dc7e3ba3f1305f6bb10b33e","3cbe3c80c50432fb0dc4e9131f1cc46bdc7354fe08c0429bb843eead91065678","34a778d1bd7ea4ba048c796d030e2246a03d7ad8508ee8a8b8d4f73937daf58f","31b026562eabb316b3491bc5231d2f8ec99af9df8f1bf47b1f892db040536e0d"];
const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), PEER = "3".repeat(32), TARGET = "2".repeat(32);
const USER = { uuid: "4".repeat(32), username: "Synthetic", nickname: "Test" };
const META = { title: "Renamed", description: "exact Ω", tags: ["synthetic"], docType: 2, source: "" };
function record(type: string, ticket: number, id: string, raw: string, client?: string): string {
  return `${JSON.stringify({ type, ticket, id, ...(client === undefined ? {} : { client }) })}||${raw}`;
}
function header(ticket: number, time: number, target = TARGET, editVersion: string | null = "3.0"): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", uuid: target, client: CLIENT,
    updateTime: time, version: String(time), ...(editVersion === null ? {} : { editVersion }) })}`;
}
function chunks(atoms: readonly string[] = [], editVersion: string | null = "3.0"): string[] {
  return [[`${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ ...USER, updateTime: 1 })}`, header(1, 1, TARGET, editVersion),
    record("META", 1, "META", JSON.stringify({ ...META, title: "Before" })), ...atoms,
    header(8, 8, PEER, editVersion), record("META", 8, "META", JSON.stringify({ ...META, title: "Peer" }))].join("|\n"),
  [`${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ ...USER, updateTime: 101 })}`, header(100, 100, TARGET, editVersion),
    record("META", 100, "META", JSON.stringify(META))].join("|\n")];
}
function projection(raw: readonly string[], editVersion: string | null = "3.0"): ReturnType<typeof prepareSavedSymbolProjection> {
  return prepareSavedSymbolProjection({ chunks: raw, targetUuid: TARGET, maximumTicket: 100, currentEditVersion: editVersion });
}
const shapes: readonly (readonly SyntheticAtom[])[] = [[],
  [{ id: "shape", type: "LINE", ticket: 12, firstTicket: 12, raw: '{ "x":1, "y": 2 }' }],
  [{ id: "shape", type: "LINE", ticket: 12, firstTicket: 10, raw: '{"x":2}' }],
  [{ id: "shape", type: "LINE", ticket: 12, firstTicket: 10, raw: "" }],
  [{ id: "z-first", type: "LINE", ticket: 12, firstTicket: 10, raw: '{"x":2}' },
    { id: "a-second", type: "ATTR", ticket: 11, firstTicket: 11, raw: '{"key":"Name","value":"exact"}' }],
];
for (const [index, atoms] of shapes.entries()) {
  for (const version of ["3.0", null]) {
    void test(`retained native serializer golden case${index} version${String(version)}`, async () => {
      const raw = atoms.flatMap((atom) => atom.firstTicket === atom.ticket
        ? [record(atom.type, atom.ticket, atom.id, atom.raw)]
        : [record(atom.type, atom.firstTicket, atom.id, '{"x":1}'), record(atom.type, atom.ticket, atom.id, atom.raw)]);
      const prepared = await projection(chunks(raw, version), version);
      const actual = expectedSavedSymbolContent(prepared, FRESH);
      assert.equal(sha256Text(actual), (version === null ? SERIALIZER_GOLDENS : VERSIONED_SERIALIZER_GOLDENS)[index]); assert.equal(prepared.executionAuthorized, false); assert.equal(prepared.producerBindingVerified, false);
      assert.equal(prepared.canvasRecords, atoms.length);
    });
  }
}
void test("first insertion order stays distinct from ticket and ID order", async () => {
  const raw = [record("LINE", 20, "z", '{"x":2}'), record("LINE", 10, "a", '{"x":1}')];
  const result = expectedSavedSymbolContent(await projection(chunks(raw)), FRESH);
  assert.ok(result.indexOf('"id":"z"') < result.indexOf('"id":"a"'));
});
void test("tombstones remain empty-body records with minimum physical firstTicket", async () => {
  const raw = [record("LINE", 20, "shape", '{"x":2}'), record("LINE", 10, "shape", '{"x":1}'), record("STRING", 30, "shape", "")];
  const result = expectedSavedSymbolContent(await projection(chunks(raw)), FRESH);
  assert.ok(result.endsWith('{"type":"STRING","ticket":30,"id":"shape","firstTicket":10}||'));
});
void test("same-ticket client ordering selects exact body while preserving key order", async () => {
  const raw = [record("LINE", 10, "shape", '{"x":1}', "0".repeat(16)), record("LINE", 10, "shape", '{"x":2}', "f".repeat(16))];
  const result = expectedSavedSymbolContent(await projection(chunks(raw)), FRESH);
  assert.ok(result.endsWith('{"type":"LINE","ticket":10,"id":"shape"}||{"x":2}'));
});
void test("identical duplicate clock bytes do not create extra records", async () => {
  const item = record("LINE", 10, "shape", '{"x":1}');
  const result = await projection(chunks([item, item])); assert.equal(result.canvasRecords, 1);
});
for (const [name, raw] of [
  ["different raw duplicate", [record("LINE", 10, "shape", '{"x":1}'), record("LINE", 10, "shape", '{ "x":1 }')]],
  ["case insensitive type", [record("NET", 10, "shape", '{"x":1}')]],
  ["pending header", ['{"type":"LINE","ticket":10,"id":"shape","pend":true}||{"x":1}']],
  ["serialized firstTicket", ['{"type":"LINE","ticket":10,"id":"shape","firstTicket":1}||{"x":1}']],
  ["deleted target", [record("DELETE_DOC", 10, "DELETE_DOC", '{"isDelete":true}')]],
] as const) {
  void test(`first projection profile refuses ${name}`, async () => { await assert.rejects(projection(chunks(raw))); });
}
void test("original projection is frozen; JSON clone cannot render", async () => {
  const value = await projection(chunks()); assert.equal(Object.isFrozen(value), true);
  assert.throws(() => expectedSavedSymbolContent(structuredClone(value), FRESH), /original/u);
  assert.throws(() => expectedSavedSymbolContent(value, "bad"), /client/u);
});
void test("raw chunk linkage commits body encoding and caller mutation cannot alter retained projection", async () => {
  const raw = chunks([record("LINE", 10, "shape", '{ "x":1 }')]);
  const pending = projection(raw); raw[0] = "caller changed";
  const value = await pending;
  const content = expectedSavedSymbolContent(value, FRESH);
  assert.ok(content.endsWith('||{ "x":1 }'));
  const other = await projection(chunks([record("LINE", 10, "shape", '{"x":1}') ]));
  assert.notEqual(value.rawHistorySha256, other.rawHistorySha256);
});
void test("generated outer ticket and fresh client do not rewrite the saved canvas head ticket", async () => {
  const raw = chunks([record("LINE", 10, "shape", '{"x":1}')]);
  const result = expectedSavedSymbolContent(await projection(raw), FRESH);
  const heads = result.split("|\n").filter((value) => value.startsWith('{"type":"DOCHEAD"'));
  assert.equal(heads.length, 2); assert.equal(heads[0]?.startsWith('{"type":"DOCHEAD","ticket":101}'), true);
  assert.equal(heads[1]?.startsWith('{"type":"DOCHEAD","ticket":100}'), true);
  for (const value of heads) { assert.ok(value.includes(`"client":"${FRESH}"`)); assert.ok(value.endsWith(`"user":${JSON.stringify(USER)}}`)); }
});
void test("metadata-only target has no spurious second header", async () => {
  const targetUuid = "a".repeat(16);
  const raw = chunks().map(chunk => chunk.replaceAll(TARGET, targetUuid));
  const prepared = await prepareSavedSymbolProjection({ chunks: raw, targetUuid, maximumTicket: 100, currentEditVersion: "3.0" });
  const result = expectedSavedSymbolContent(prepared, FRESH); assert.equal(result.split("|\n").length, 2);
});
void test("native header chooses updateTime, not largest record ticket", async () => {
  const raw = chunks(); raw[0] = raw[0]?.replace('"updateTime":1,"version":"1"', '"updateTime":200,"version":"200"') ?? "";
  const result = expectedSavedSymbolContent(await projection(raw), FRESH); assert.ok(result.includes('"updateTime":200,"version":"200"'));
});
void test("missing EDIT_HEAD uses the source-derived first DOCHEAD actor fallback", async () => {
  const raw = chunks(); const last = raw[1]; assert.ok(last !== undefined); raw[1] = last.split("|\n").slice(1).join("|\n");
  const result = expectedSavedSymbolContent(await projection(raw), FRESH); assert.ok(result.includes(`"user":{"uuid":"${TARGET}"}`));
});
void test("ignored metadata bookkeeping is not included in canvas serialization", async () => {
  const raw = [record("META_CREATE", 3, "META_CREATE", '{"actor":"synthetic"}'), record("META_MODIFY", 4, "META_MODIFY", '{"actor":"synthetic"}'),
    record("META_PLACEHOLDER", 5, "placeholder", '{"max":1}')];
  const prepared = await projection(chunks(raw)); assert.equal(prepared.canvasRecords, 0);
});
for (const change of ["wrong-maximum", "unknown-target", "zero-time", "bad-UTF8", "oversized-record"] as const) {
  void test(`projection rejects ${change} before establishing a relation`, async () => {
    const raw = chunks(); let maximumTicket = 100, targetUuid = TARGET;
    if (change === "wrong-maximum") { maximumTicket += 1; }
    if (change === "unknown-target") { targetUuid = "f".repeat(32); }
    if (change === "zero-time") { raw[0] = (raw[0] ?? "").replaceAll('"updateTime":1', '"updateTime":0'); }
    if (change === "bad-UTF8") { raw[0] += "\uD800"; }
    if (change === "oversized-record") { raw[0] += `|\n${record("STRING", 11, "large", JSON.stringify({ value: "x".repeat(262_144) }))}`; }
    await assert.rejects(prepareSavedSymbolProjection({ chunks: raw, targetUuid, maximumTicket, currentEditVersion: "3.0" }));
  });
}
void test("exact native content relation rejects any body or header rewrite without normalization", async () => {
  const prepared = await projection(chunks([record("LINE", 10, "shape", '{ "x":1 }')]));
  const original = { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket: 100, workerClient: FRESH,
    content: expectedSavedSymbolContent(prepared, FRESH) };
  const result = verifySavedSymbolContent(prepared, original); assert.equal(result["exactContent"], true); assert.equal(result["completionProved"], false);
  for (const content of [original.content.replace('{ "x":1 }', '{"x":1}'), original.content.replace('"ticket":101', '"ticket":102'), `${original.content}|\n`]) {
    assert.throws(() => verifySavedSymbolContent(prepared, { ...original, content }), /differs/u);
  }
});
