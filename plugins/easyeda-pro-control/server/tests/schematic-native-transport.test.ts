/* oxlint-disable node/no-sync -- Small bounded gzip fixtures are constructed synchronously; production decompression is asynchronous and bounded. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { assertExactTransportValue, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";
import { SCHEMATIC_NATIVE_MAX_BYTES, SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import { SCHEMATIC_NATIVE_MAX_GZIP_BYTES, SCHEMATIC_NATIVE_TRANSPORT_SCHEMA, buildSchematicNativeTransportCode, decodeSchematicNativeEnvelope } from "../src/schematic-native-transport.ts";

function snapshot(count = 70, content = "é".repeat(32_768)): ReturnType<typeof schematicNativeSnapshotSchema.parse> {
  return {
    profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" },
    source: '{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"page"}|\n',
    components: Array.from({ length: count }, (_, index) => ({ id: `component-${index}`, kind: "part", locked: false, body: { content }, attributes: [], pins: [] })),
  };
}

function envelope(bytes: Buffer): { schema: typeof SCHEMATIC_NATIVE_TRANSPORT_SCHEMA; utf8Bytes: number; gzipBytes: number; base64: string } {
  const compressed = gzipSync(bytes);
  return { schema: SCHEMATIC_NATIVE_TRANSPORT_SCHEMA, utf8Bytes: bytes.length, gzipBytes: compressed.length, base64: compressed.toString("base64") };
}

async function generated(input: unknown, compression: unknown = CompressionStream): Promise<unknown> {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Execute only the maintained fixed transport builder with local data, never caller JavaScript or a live editor.
  const run = new Function("input", "CompressionStream", `return (async()=>{${buildSchematicNativeTransportCode("input")}})();`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Unknown output must pass the independent strict decoder.
  return await run(input, compression);
}

void test("compressed native transport preserves a complete over-4-MiB snapshot and retains the general limit", async () => {
  const input = snapshot();
  assert.ok(Buffer.byteLength(JSON.stringify(input)) > 4 * 1024 * 1024);
  assert.throws(() => encodeExactReadEnvelope(input), /byte bound/u);
  const encoded = await generated(input);
  assertExactTransportValue(encoded);
  const decoded = await decodeSchematicNativeEnvelope(encoded);
  assert.deepEqual(decoded, input);
  assert.deepEqual(schematicNativeSnapshotSchema.parse(input), input);
  assert.ok(Buffer.byteLength(JSON.stringify(encoded)) < SCHEMATIC_NATIVE_MAX_GZIP_BYTES);
});

void test("decoder refuses malformed envelopes, counts, noncanonical base64, truncated gzip and malformed JSON", async () => {
  const json = JSON.stringify(snapshot(1, "ok"));
  const good = envelope(Buffer.from(json));
  for (const malformed of [
    { ...good, extra: true }, { ...good, schema: "easyeda-pro-control.exact-json.v1" },
    { ...good, utf8Bytes: good.utf8Bytes + 1 }, { ...good, gzipBytes: good.gzipBytes + 1 },
    { ...good, base64: `${good.base64}\n` }, { ...good, base64: good.base64.slice(0, -4), gzipBytes: good.gzipBytes - 3 },
    { ...good, utf8Bytes: SCHEMATIC_NATIVE_MAX_BYTES + 1 }, { ...good, gzipBytes: SCHEMATIC_NATIVE_MAX_GZIP_BYTES + 1 },
    envelope(Buffer.from("{not-json")), envelope(Buffer.from([0xFF, 0xFE])), envelope(Buffer.from(`\uFEFF${json}`)),
  ]) { await assert.rejects(decodeSchematicNativeEnvelope(malformed)); }
});

void test("decoder retains placeholder, duplicate-identity and complete native schema refusals", async () => {
  const duplicate = snapshot(2, "ok");
  const first = duplicate.components[0], second = duplicate.components[1];
  assert.ok(first && second);
  second.id = first.id;
  for (const invalid of [snapshot(1, "[MaxDepth]"), duplicate, { ...snapshot(1, "ok"), document: { documentUuid: "page" } }]) {
    const compressed = envelope(Buffer.from(JSON.stringify(invalid)));
    await assert.rejects(decodeSchematicNativeEnvelope(compressed));
  }
});

void test("bounded decompression refuses expansion before any downstream work", async () => {
  const bytes = Buffer.alloc(SCHEMATIC_NATIVE_MAX_BYTES + 65_536, 65);
  const compressed = gzipSync(bytes);
  // Forge the trailer's declared size as well as the envelope to exercise the
  // Decompressor bound, not merely the earlier advertised-count rejection.
  compressed.writeUInt32LE(SCHEMATIC_NATIVE_MAX_BYTES, compressed.length - 4);
  const bomb = { schema: SCHEMATIC_NATIVE_TRANSPORT_SCHEMA, utf8Bytes: SCHEMATIC_NATIVE_MAX_BYTES, gzipBytes: compressed.length, base64: compressed.toString("base64") };
  let continued = false;
  await assert.rejects(async () => { await decodeSchematicNativeEnvelope(bomb); continued = true; }, { code: "ERR_BUFFER_TOO_LARGE" });
  assert.equal(continued, false);
});

void test("renderer bounds decoded and compressed bytes without fallback or truncation", async () => {
  await assert.rejects(generated(snapshot(140)), /SCH_NATIVE_SNAPSHOT_BOUND/u);
  const input = snapshot(8, "");
  for (const component of input.components) { component.body["content"] = randomBytes(180_000).toString("base64"); }
  await assert.rejects(generated(input), /SCH_NATIVE_COMPRESSED_BOUND/u);
  // Pass a non-constructor explicitly; undefined would use the helper default.
  await assert.rejects(generated(snapshot(1, "ok"), null), /SCH_NATIVE_COMPRESSION_UNAVAILABLE/u);
  assert.throws(() => schematicNativeSnapshotSchema.parse(snapshot(140)), /decoded bound/u);
  for (const code of ["SCH_NATIVE_SNAPSHOT_BOUND", "SCH_NATIVE_COMPRESSED_BOUND", "SCH_NATIVE_COMPRESSION_UNAVAILABLE"]) {
    assert.equal(nativeFailureCategory(code), `native-preflight:${code}`);
    assert.equal(nativeFailureCategory(`${code} secret`), null);
  }
});
