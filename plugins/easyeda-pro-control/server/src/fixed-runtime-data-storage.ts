/** Bounded lossless storage for fixed documentation/source data, never authority. */
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";
import { z } from "zod";

const PACKED_MAXIMUM = 131_072, RAW_MAXIMUM = 1_048_576;
const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const metadataSchema = z.strictObject({
  encoding: z.literal("brotli-json.v1"),
  rawBytes: z.int().positive().max(RAW_MAXIMUM), rawSha256: digestSchema,
  packedBytes: z.int().positive().max(PACKED_MAXIMUM), packedSha256: digestSchema,
  base64: z.string().min(4).max(Math.ceil(PACKED_MAXIMUM / 3) * 4),
});
export type PackedFixedRuntimeData = z.infer<typeof metadataSchema>;

/** Decode inert JSON only. Literal types belong to each fixed artifact's reader. */
export function unpackFixedRuntimeData(input: PackedFixedRuntimeData): unknown {
  const value = metadataSchema.parse(input);
  const packed = Buffer.from(value.base64, "base64");
  if (packed.length !== value.packedBytes || packed.toString("base64") !== value.base64 || sha256(packed) !== value.packedSha256) {
    throw new Error("FIXED_RUNTIME_DATA_PACKED_IDENTITY");
  }
  // oxlint-disable-next-line node/no-sync -- At most1MiB of immutable data is decoded once at module initialization, with no owner or design IO.
  const result: unknown = brotliDecompressSync(packed, { info: true, maxOutputLength: value.rawBytes });
  if (result === null || typeof result !== "object") { throw new Error("FIXED_RUNTIME_DATA_DECODE_RESULT"); }
  const buffer: unknown = Reflect.get(result, "buffer"), engine: unknown = Reflect.get(result, "engine");
  if (!Buffer.isBuffer(buffer) || engine === null || typeof engine !== "object" || Reflect.get(engine, "bytesWritten") !== packed.length ||
      buffer.length !== value.rawBytes || sha256(buffer) !== value.rawSha256) { throw new Error("FIXED_RUNTIME_DATA_RAW_IDENTITY"); }
  const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  const decoded: unknown = JSON.parse(text);
  if (JSON.stringify(decoded) !== text) { throw new Error("FIXED_RUNTIME_DATA_CANONICAL_JSON"); }
  return decoded;
}
