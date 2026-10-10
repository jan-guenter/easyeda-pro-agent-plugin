import { TextDecoder, promisify } from "node:util";
import { gunzip } from "node:zlib";
import { z } from "zod";
import { assertExactTransportValue } from "./exact-readers.ts";
import { SCHEMATIC_NATIVE_MAX_BYTES, schematicNativeSnapshotSchema } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

export const SCHEMATIC_NATIVE_TRANSPORT_SCHEMA = "easyeda-pro-control.schematic-native-gzip.v1";
export const SCHEMATIC_NATIVE_MAX_GZIP_BYTES = 1024 * 1024;
const decompress = promisify(gunzip);
const envelopeSchema = z.object({
  schema: z.literal(SCHEMATIC_NATIVE_TRANSPORT_SCHEMA),
  utf8Bytes: z.number().int().min(1).max(SCHEMATIC_NATIVE_MAX_BYTES),
  gzipBytes: z.number().int().min(20).max(SCHEMATIC_NATIVE_MAX_GZIP_BYTES),
  base64: z.string().min(1).max(Math.ceil(SCHEMATIC_NATIVE_MAX_GZIP_BYTES / 3) * 4),
}).strict();

/** Native-only transport. General exact JSON envelope bounds remain unchanged.
 * Decompress no more than the declared size, then prove bytes, UTF-8, complete
 * JSON structure and the original native snapshot schema before returning it.
 */
export async function decodeSchematicNativeEnvelope(input: unknown): Promise<SchematicNativeSnapshot> {
  const envelope = envelopeSchema.parse(input);
  const compressed = Buffer.from(envelope.base64, "base64");
  if (compressed.length !== envelope.gzipBytes || compressed.toString("base64") !== envelope.base64 ||
      compressed[0] !== 0x1F || compressed[1] !== 0x8B || compressed[2] !== 8 ||
      compressed.readUInt32LE(compressed.length - 4) !== envelope.utf8Bytes) {
    throw new Error("Native snapshot compressed envelope is noncanonical or contradictory.");
  }
  const bytes = await decompress(compressed, { maxOutputLength: envelope.utf8Bytes });
  if (bytes.length !== envelope.utf8Bytes) { throw new Error("Native snapshot decoded byte count differs."); }
  const json = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  const payload: unknown = JSON.parse(json);
  assertExactTransportValue(payload);
  return schematicNativeSnapshotSchema.parse(payload);
}

/** Expression is emitted only by maintained native readers. No caller code or
 * runtime cache is accepted. Streaming output is bounded before accumulation;
 * the caller retains its exact context guard and full-snapshot double sampling.
 */
export function buildSchematicNativeTransportCode(expression: string): string {
  return `
const result = await ${expression};
const json = JSON.stringify(result);
if (typeof json !== 'string' || json.length > ${SCHEMATIC_NATIVE_MAX_BYTES}) throw new Error('SCH_NATIVE_SNAPSHOT_BOUND');
const bytes = new TextEncoder().encode(json);
if (bytes.byteLength > ${SCHEMATIC_NATIVE_MAX_BYTES}) throw new Error('SCH_NATIVE_SNAPSHOT_BOUND');
if (typeof CompressionStream !== 'function') throw new Error('SCH_NATIVE_COMPRESSION_UNAVAILABLE');
const compressedReader = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')).getReader();
const compressedChunks = [];
let gzipBytes = 0;
try {
  for (;;) {
    const item = await compressedReader.read();
    if (item.done) break;
    if (!(item.value instanceof Uint8Array)) throw new Error('SCH_NATIVE_COMPRESSION_INVALID');
    gzipBytes += item.value.byteLength;
    if (gzipBytes > ${SCHEMATIC_NATIVE_MAX_GZIP_BYTES}) throw new Error('SCH_NATIVE_COMPRESSED_BOUND');
    compressedChunks.push(item.value);
  }
} catch (error) {
  try { await compressedReader.cancel(); } catch { throw new Error('SCH_NATIVE_COMPRESSION_CLEANUP'); }
  throw error;
} finally { compressedReader.releaseLock(); }
if (gzipBytes < 20) throw new Error('SCH_NATIVE_COMPRESSION_INVALID');
const compressed = new Uint8Array(gzipBytes);
let offset = 0;
for (const chunk of compressedChunks) { compressed.set(chunk, offset); offset += chunk.byteLength; }
let binary = '';
for (let start = 0; start < compressed.length; start += 32768) binary += String.fromCharCode(...compressed.subarray(start, start + 32768));
return {schema:${JSON.stringify(SCHEMATIC_NATIVE_TRANSPORT_SCHEMA)},utf8Bytes:bytes.byteLength,gzipBytes,base64:btoa(binary)};`;
}
