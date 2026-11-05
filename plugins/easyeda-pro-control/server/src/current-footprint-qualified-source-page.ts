/** Lossless packet encoding only. Original private packet/publication custody
 * is checked by the enclosing lifecycle, never supplied by a caller descriptor. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS } from "./current-footprint-copy-source-read.ts";
import { currentFootprintSourceReadPacketSchema } from "./current-footprint-source-read-runner.ts";
import type { CurrentFootprintSourceReadPacket } from "./current-footprint-source-read-runner.ts";

export const CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES = 65_536;
// JSON escaping can use six bytes per source byte. The original published
// Record's smaller actual byte envelope is additionally required on every read.
export const CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PACKET_BYTES = CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 6 + 65_536;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const offset = z.number().int().min(0).max(CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PACKET_BYTES).refine(value => !Object.is(value, -0));
export const currentFootprintQualifiedSourcePageBoundsSchema = z.object({
  expectedSourcePacketSha256: digest, offsetBytes: offset,
  lengthBytes: z.number().int().min(1).max(CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES),
}).strict();
export const currentFootprintQualifiedSourcePageDataSchema = z.object({
  format: z.literal("canonical-json-utf8"), encoding: z.literal("base64"), offsetUnit: z.literal("byte"),
  sourcePacketSha256: digest, sourceSha256: digest,
  sourceBytes: z.number().int().min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes),
  packetBytes: z.number().int().min(1).max(CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PACKET_BYTES),
  offsetBytes: offset, nextOffsetBytes: offset, pageBytes: z.number().int().min(0).max(CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES),
  pageBase64: z.string().max(4 * Math.ceil(CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PAGE_BYTES / 3)), pageSha256: digest,
  endOfPacket: z.boolean(),
}).strict();
export type CurrentFootprintQualifiedSourcePageBounds = z.infer<typeof currentFootprintQualifiedSourcePageBoundsSchema>;
/** Validate the bounded frozen packet graph using own data descriptors only.
 * Proxies, accessors, repeated references and unsupported values cannot reach
 * canonical byte paging. Lifecycle checks retain original packet ownership. */
function requireFrozenData(packet: unknown): void {
  const pending: unknown[] = [packet], seen = new Set<object>();
  while (pending.length > 0) {
    const value = pending.pop();
    if (value === null || typeof value !== "object" || types.isProxy(value) || !Object.isFrozen(value) ||
        Object.getPrototypeOf(value) !== Object.prototype || seen.has(value) || seen.size >= 16) {
      throw new Error("QUALIFIED_SOURCE_ORIGINAL_FROZEN_PACKET_REQUIRED");
    }
    seen.add(value); const keys = Reflect.ownKeys(value);
    if (keys.length > 64) { throw new Error("QUALIFIED_SOURCE_PACKET_DATA_BOUND"); }
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== "string" || descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) {
        throw new Error("QUALIFIED_SOURCE_PACKET_OWN_DATA_REQUIRED");
      }
      const field: unknown = descriptor.value;
      if (field !== null && typeof field === "object") { pending.push(field); }
      else if (!["string", "number", "boolean"].includes(typeof field)) { throw new Error("QUALIFIED_SOURCE_PACKET_DATA_REQUIRED"); }
    }
  }
}
/** No native callback, path lookup or source reproof occurs here. Individual
 * base64 pages may split UTF-8 sequences; concatenate bytes before decoding. */
export function pageCurrentFootprintQualifiedSource(packet: CurrentFootprintSourceReadPacket,
  input: CurrentFootprintQualifiedSourcePageBounds, publishedRecordBytes: number): z.infer<typeof currentFootprintQualifiedSourcePageDataSchema> {
  const request = currentFootprintQualifiedSourcePageBoundsSchema.parse(input);
  requireFrozenData(packet);
  currentFootprintSourceReadPacketSchema.parse(packet);
  const bytes = Buffer.from(canonicalJson(packet), "utf8"), sourcePacketSha256 = createHash("sha256").update(bytes).digest("hex");
  if (!Number.isSafeInteger(publishedRecordBytes) || publishedRecordBytes < bytes.length ||
      publishedRecordBytes > CURRENT_FOOTPRINT_QUALIFIED_SOURCE_PACKET_BYTES || request.expectedSourcePacketSha256 !== sourcePacketSha256 ||
      request.offsetBytes > bytes.length) { throw new Error("QUALIFIED_SOURCE_PACKET_HASH_OR_BOUNDS"); }
  const nextOffsetBytes = Math.min(bytes.length, request.offsetBytes + request.lengthBytes);
  const page = bytes.subarray(request.offsetBytes, nextOffsetBytes);
  return currentFootprintQualifiedSourcePageDataSchema.parse({ format: "canonical-json-utf8", encoding: "base64", offsetUnit: "byte",
    sourcePacketSha256, sourceSha256: packet.sourceSha256, sourceBytes: Buffer.byteLength(packet.content), packetBytes: bytes.length,
    offsetBytes: request.offsetBytes, nextOffsetBytes, pageBytes: page.length, pageBase64: page.toString("base64"),
    pageSha256: createHash("sha256").update(page).digest("hex"), endOfPacket: nextOffsetBytes === bytes.length });
}
