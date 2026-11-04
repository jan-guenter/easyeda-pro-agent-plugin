/** Packet encoding only. These tests issue no original owner or publication. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { currentFootprintSourceReadPacketSchema } from "../src/current-footprint-source-read-runner.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES, pageCurrentFootprintQualifiedSource } from "../src/current-footprint-qualified-source-page.ts";

function packet(content: string): ReturnType<typeof currentFootprintSourceReadPacketSchema.parse> {
  return freezeDeep(currentFootprintSourceReadPacketSchema.parse({ profile: "private.current-footprint-source-read.v1",
    request: { identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab" },
      footprintUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 1 },
    content, sourceSha256: sha256Text(content), sourceSamples: 2, stateSamples: 4, route: "native-cache-equivalent", sourceGetterDispatched: false,
    cacheRead: { keys: 1, bytes: 100, atoms: 1 }, cacheWrites: 0, networkRequests: 0, exactKeyedSourceVerified: true,
    comparison: "complete-checkpoint-records-native-order", checkpointByteOrderMatched: false, nativeOrderStable: true,
    keyedRecordsSha256: "e".repeat(64), observedOrderSha256: "f".repeat(64), canvasRecords: 1, tombstones: 0,
    cacheEffectsPossible: false, cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false }));
}
void test("one-byte base64 pages reconstruct the complete canonical packet and exact multibyte source", () => {
  const source = "\uFEFF中🧪é\r\n\u0000\\\"end";
  const original = packet(source);
  const bytes = Buffer.from(canonicalJson(original)), pages: Buffer[] = [];
  const expectedSourcePacketSha256 = sha256Json(original);
  for (let offsetBytes = 0; offsetBytes < bytes.length; offsetBytes += 1) {
    const page = pageCurrentFootprintQualifiedSource(original, { expectedSourcePacketSha256, offsetBytes, lengthBytes: 1 }, bytes.length);
    const decoded = Buffer.from(page.pageBase64, "base64"); pages.push(decoded);
    assert.equal(decoded.length, 1); assert.equal(page.nextOffsetBytes, offsetBytes + 1);
    assert.equal(page.pageSha256, createHash("sha256").update(decoded).digest("hex"));
    assert.equal(page.sourceSha256, sha256Text(source)); assert.equal(page.sourceBytes, Buffer.byteLength(source));
    assert.equal(page.sourcePacketSha256, expectedSourcePacketSha256); assert.equal(page.endOfPacket, offsetBytes + 1 === bytes.length);
  }
  const complete = Buffer.concat(pages); assert.deepEqual(complete, bytes);
  assert.equal(createHash("sha256").update(complete).digest("hex"), expectedSourcePacketSha256);
  const decoded = currentFootprintSourceReadPacketSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(complete)) as unknown);
  assert.deepEqual(decoded, original); assert.equal(decoded.content, source);
  const end = pageCurrentFootprintQualifiedSource(original, { expectedSourcePacketSha256, offsetBytes: bytes.length, lengthBytes: 1 }, bytes.length);
  assert.equal(end.pageBytes, 0); assert.equal(end.pageBase64, ""); assert.equal(end.endOfPacket, true);
});
void test("packet pages reject bad hashes, unpublished byte envelopes and malformed bounds without clamping", () => {
  const original = packet("source");
  const bytes = Buffer.byteLength(canonicalJson(original));
  const request = { expectedSourcePacketSha256: sha256Json(original), offsetBytes: 0, lengthBytes: 1 };
  for (const offsetBytes of [-1, -0, bytes + 1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => pageCurrentFootprintQualifiedSource(original, { ...request, offsetBytes }, bytes));
  }
  for (const lengthBytes of [0, -1, 1.5, CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES + 1, Number.POSITIVE_INFINITY]) {
    assert.throws(() => pageCurrentFootprintQualifiedSource(original, { ...request, lengthBytes }, bytes));
  }
  assert.throws(() => pageCurrentFootprintQualifiedSource(original, { ...request, expectedSourcePacketSha256: "0".repeat(64) }, bytes), /HASH_OR_BOUNDS/u);
  assert.throws(() => pageCurrentFootprintQualifiedSource(original, request, bytes - 1), /HASH_OR_BOUNDS/u);
  assert.throws(() => pageCurrentFootprintQualifiedSource({ ...original }, request, bytes), /FROZEN_PACKET/u);
  const malformed = Object.freeze({ ...original, content: "\uD800" });
  assert.throws(() => pageCurrentFootprintQualifiedSource(malformed, request, bytes));
  let accessed = false;
  const accessor = Object.freeze(Object.defineProperty({ ...original }, "content", { get: (): never => { accessed = true; throw new Error("Must not read an accessor"); } }));
  assert.throws(() => pageCurrentFootprintQualifiedSource(accessor, request, bytes), /OWN_DATA_REQUIRED/u); assert.equal(accessed, false);
  const proxy = new Proxy(original, { get: (): never => { accessed = true; throw new Error("Must not read a proxy"); } });
  assert.throws(() => pageCurrentFootprintQualifiedSource(proxy, request, bytes), /FROZEN_PACKET/u); assert.equal(accessed, false);
});
