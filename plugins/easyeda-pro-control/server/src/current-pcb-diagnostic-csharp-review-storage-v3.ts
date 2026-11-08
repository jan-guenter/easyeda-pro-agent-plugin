/** Independently versioned V3 storage. The decoder and all byte caps remain
 * identical; only the canonical reversible spacing algorithm differs. */
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER } from "./current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES as SPACING_MAXIMUM } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { compactCurrentPcbDiagnosticCSharpV3 as compactCurrentPcbDiagnosticCSharp, restoreCurrentPcbDiagnosticCSharpV3 as restoreCurrentPcbDiagnosticCSharp } from "./current-pcb-diagnostic-csharp-spacing-v3.ts";

export const CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_V3_MAX_BYTES = MAXIMUM + SPACING_MAXIMUM;
const BEGIN = "# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V3\n", END = "# END FIXED CURRENT209 CSHARP REVIEW STORAGE V3\n";
const LITERAL_BEGIN = "Add-Type @'\n", LITERAL_END = "\n'@\n";
const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const bad = (): never => { throw new Error("PCB_DIAGNOSTIC_CSHARP_REVIEW_STORAGE_V3"); };
interface Blob { readonly encoded: string; readonly length: number; readonly sha256: string; readonly packedLength: number; readonly packedSha256: string }
interface Metadata { readonly compiler: Blob; readonly spacing: Blob; readonly originalLength: number; readonly originalSha256: string; readonly tokenSha256: string }
/** Compress one bounded source blob and retain both raw and compressed lengths and SHA256 values. */
function pack(bytes: Buffer, maximum: number, kind: "COMPILER" | "SPACING"): Blob {
  if (bytes.length === 0) { return bad(); }
  if (bytes.length > maximum) { throw new Error(`PCB_DIAGNOSTIC_CSHARP_REVIEW_STORAGE_V3_CAPACITY_${kind}_BYTES_${String(bytes.length)}_GT_${String(maximum)}`); }
  // oxlint-disable-next-line node/no-sync -- Fixed immutable build data, bounded before compression.
  const packed = gzipSync(bytes, { level: 9 });
  if (packed.length > maximum) { throw new Error(`PCB_DIAGNOSTIC_CSHARP_REVIEW_STORAGE_V3_CAPACITY_${kind}_GZIP_BYTES_${String(packed.length)}_GT_${String(maximum)}`); }
  return { encoded: packed.toString("base64"), length: bytes.length, sha256: hash(bytes), packedLength: packed.length, packedSha256: hash(packed) };
}
/** Validate encoded length, compressed hash and expansion bound before checking the exact restored source hash. */
function unpack(meta: Blob, maximum: number): Buffer {
  if (!Number.isSafeInteger(meta.length) || meta.length === 0 || meta.length > maximum || !Number.isSafeInteger(meta.packedLength) || meta.packedLength < 18 || meta.packedLength > maximum || meta.encoded.length > Math.ceil(maximum / 3) * 4) { return bad(); }
  const packed = Buffer.from(meta.encoded, "base64"); if (packed.length !== meta.packedLength || packed.toString("base64") !== meta.encoded || hash(packed) !== meta.packedSha256) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Each fixed compiler/spacing payload has its own unchanged or smaller bound.
  const raw: unknown = gunzipSync(packed, { info: true, maxOutputLength: meta.length }); if (raw === null || typeof raw !== "object") { return bad(); }
  const buffer: unknown = Reflect.get(raw, "buffer"), engine: unknown = Reflect.get(raw, "engine");
  if (!Buffer.isBuffer(buffer) || engine === null || typeof engine !== "object" || Reflect.get(engine, "bytesWritten") !== packed.length || buffer.length !== meta.length || hash(buffer) !== meta.sha256) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Canonical pinned-Node24 compression rejects extra gzip members and ignored tails.
  if (!gzipSync(buffer, { level: 9 }).equals(packed)) { return bad(); } return buffer;
}
/** Encode the fixed PowerShell metadata arguments from an already validated source blob. */
function argumentsText(value: Blob): string { return `'${value.encoded}' ${String(value.length)} '${value.sha256}' ${String(value.packedLength)} '${value.packedSha256}'`; }
/** Emit the fixed version-three storage block containing the compact body and reversible review metadata. */
function block(meta: Metadata): string {
  // Spacing is build-only data in a comment, covered by the admitted whole
  // Helper identity. Runtime decodes/compiles only the compact bounded body.
  return `${BEGIN}# fixed-review-spacing ${argumentsText(meta.spacing)} ${String(meta.originalLength)} '${meta.originalSha256}' '${meta.tokenSha256}'\n${CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER}$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp ${argumentsText(meta.compiler)}\nAdd-Type -TypeDefinition $fixedCurrent209CompactCompiler\nRemove-Variable fixedCurrent209CompactCompiler\n${END}`;
}
/** Locate exactly one supported storage section and refuse missing, repeated or reordered boundaries. */
function section(source: string, begin: string, end: string): Readonly<{ start: number; stop: number }> {
  const start = source.indexOf(begin); const last = source.indexOf(end);
  if (start === -1 || last <= start || source.includes(begin, start + begin.length) || source.includes(end, last + end.length)) { return bad(); } return { start, stop: last + end.length };
}
/** Parse one complete fixed storage-blob metadata tuple from the matched version-three block. */
function readBlob(match: RegExpMatchArray, offset: number): Blob {
  const [encoded, length, sha256, packedLength, packedSha256] = match.slice(offset, offset + 5);
  if (encoded === undefined || length === undefined || sha256 === undefined || packedLength === undefined || packedSha256 === undefined) { return bad(); }
  return { encoded, length: Number(length), sha256, packedLength: Number(packedLength), packedSha256 };
}
/** Read and validate the exact version-three block, then restore its original and compact C# forms. */
function read(source: string): Readonly<{ start: number; stop: number; original: string; compact: string }> {
  if (Buffer.byteLength(source) > MAXIMUM || source.includes(LITERAL_BEGIN) || source.includes(LITERAL_END) || source.includes("# BEGIN FIXED CURRENT209 CSHARP STORAGE") || source.includes("# END FIXED CURRENT209 CSHARP STORAGE") || source.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2") || source.includes("# END FIXED CURRENT209 CSHARP REVIEW STORAGE V2")) { return bad(); }
  const { start, stop } = section(source, BEGIN, END), stored = source.slice(start, stop);
  const compilerRows = [...stored.matchAll(/^\$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/gmu)];
  const spacingRows = [...stored.matchAll(/^# fixed-review-spacing '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' '([a-f\d]{64})'$/gmu)];
  const compilerRow = compilerRows[0], spacingRow = spacingRows[0];
  if (compilerRows.length !== 1 || spacingRows.length !== 1 || compilerRow === undefined || spacingRow === undefined) { return bad(); }
  const originalLength = Number(spacingRow[6]), originalSha256 = spacingRow[7], tokenSha256 = spacingRow[8];
  if (!Number.isSafeInteger(originalLength) || originalLength < 1 || originalLength > CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_V3_MAX_BYTES || originalSha256 === undefined || tokenSha256 === undefined) { return bad(); }
  const meta: Metadata = { compiler: readBlob(compilerRow, 1), spacing: readBlob(spacingRow, 1), originalLength, originalSha256, tokenSha256 };
  if (stored !== block(meta)) { return bad(); }
  const compiler = unpack(meta.compiler, MAXIMUM); if (compiler.some(byte => byte > 127 || byte === 0)) { return bad(); }
  const compact = new TextDecoder("utf-8", { fatal: true }).decode(compiler), spacing = unpack(meta.spacing, SPACING_MAXIMUM);
  const original = restoreCurrentPcbDiagnosticCSharp(compact, spacing, tokenSha256); const bytes = Buffer.from(original);
  if (bytes.length !== originalLength || hash(bytes) !== originalSha256 || bytes.length > compiler.length + SPACING_MAXIMUM) { return bad(); }
  return { start, stop, original, compact };
}
/** Recognize the explicit version-three marker without treating it as authority to compile or execute. */
export function hasCurrentPcbDiagnosticCSharpReviewStorageV3(source: string): boolean {
  return source.includes(BEGIN.slice(0, -1)) || source.includes(END.slice(0, -1));
}
/** Restore the original review source from a validated version-three block without changing historical version decoders. */
export function expandCurrentPcbDiagnosticCSharpReviewSourceV3(source: string): string {
  const value = read(source);
  return source.slice(0, value.start) + LITERAL_BEGIN + value.original + LITERAL_END + source.slice(value.stop);
}
/** Return only the validated compact compiler body; review metadata is not part of the runtime C# input. */
export function currentPcbDiagnosticCSharpRuntimeCompilerInputV3(source: string): string { return read(source).compact; }
/** Pack the original C# source through explicit version-three token fusion with exact restoration and fixed size bounds. */
export function packCurrentPcbDiagnosticCSharpReviewStorageV3(input: string): string {
  const source = hasCurrentPcbDiagnosticCSharpReviewStorageV3(input) ? expandCurrentPcbDiagnosticCSharpReviewSourceV3(input) : input;
  const { start, stop } = section(source, LITERAL_BEGIN, LITERAL_END);
  const body = source.slice(start + LITERAL_BEGIN.length, stop - LITERAL_END.length);
  const bytes = Buffer.from(body);
  if (bytes.length === 0 || bytes.length > CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_V3_MAX_BYTES || bytes.some(byte => byte > 127 || byte === 0)) { return bad(); }
  const value = compactCurrentPcbDiagnosticCSharp(body);
  const compiler = pack(Buffer.from(value.compact), MAXIMUM, "COMPILER");
  const spacing = pack(value.spacing, SPACING_MAXIMUM, "SPACING");
  if (bytes.length > compiler.length + SPACING_MAXIMUM) { return bad(); }
  const meta: Metadata = { compiler, spacing, originalLength: bytes.length, originalSha256: hash(bytes), tokenSha256: value.tokenSha256 };
  const result = source.slice(0, start) + block(meta) + source.slice(stop);
  if (Buffer.byteLength(result) > MAXIMUM) { return bad(); }
  read(result);
  return result;
}
