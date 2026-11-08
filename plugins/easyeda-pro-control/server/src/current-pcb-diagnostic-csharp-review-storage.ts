/** V2 alone separates original review bytes from compact runtime compiler
 * bytes. Historical v1 parsing/decoding and its original bounds stay intact. */
import { currentPcbDiagnosticCSharpRuntimeCompilerInputV3, expandCurrentPcbDiagnosticCSharpReviewSourceV3, hasCurrentPcbDiagnosticCSharpReviewStorageV3, packCurrentPcbDiagnosticCSharpReviewStorageV3 as packV3 } from "./current-pcb-diagnostic-csharp-review-storage-v3.ts";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER, currentPcbDiagnosticCSharpCompilerInput, expandCurrentPcbDiagnosticCSharpStorage, retainCurrentPcbDiagnosticCSharpStorage } from "./current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES as SPACING_MAXIMUM, compactCurrentPcbDiagnosticCSharp, restoreCurrentPcbDiagnosticCSharp } from "./current-pcb-diagnostic-csharp-spacing.ts";

export const CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES = MAXIMUM + SPACING_MAXIMUM;
const BEGIN = "# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2\n", END = "# END FIXED CURRENT209 CSHARP REVIEW STORAGE V2\n";
const LITERAL_BEGIN = "Add-Type @'\n", LITERAL_END = "\n'@\n";
const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const bad = (): never => { throw new Error("PCB_DIAGNOSTIC_CSHARP_REVIEW_STORAGE"); };
interface Blob { readonly encoded: string; readonly length: number; readonly sha256: string; readonly packedLength: number; readonly packedSha256: string }
interface Metadata { readonly compiler: Blob; readonly spacing: Blob; readonly originalLength: number; readonly originalSha256: string; readonly tokenSha256: string }
function pack(bytes: Buffer, maximum: number): Blob {
  if (bytes.length === 0 || bytes.length > maximum) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Fixed immutable build data, bounded before compression.
  const packed = gzipSync(bytes, { level: 9 }); if (packed.length > maximum) { return bad(); }
  return { encoded: packed.toString("base64"), length: bytes.length, sha256: hash(bytes), packedLength: packed.length, packedSha256: hash(packed) };
}
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
function argumentsText(value: Blob): string { return `'${value.encoded}' ${String(value.length)} '${value.sha256}' ${String(value.packedLength)} '${value.packedSha256}'`; }
function block(meta: Metadata): string {
  // Spacing is build-only data in a comment, covered by the admitted whole
  // Helper identity. Runtime decodes/compiles only the compact bounded body.
  return `${BEGIN}# fixed-review-spacing ${argumentsText(meta.spacing)} ${String(meta.originalLength)} '${meta.originalSha256}' '${meta.tokenSha256}'\n${CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER}$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp ${argumentsText(meta.compiler)}\nAdd-Type -TypeDefinition $fixedCurrent209CompactCompiler\nRemove-Variable fixedCurrent209CompactCompiler\n${END}`;
}
function section(source: string, begin: string, end: string): Readonly<{ start: number; stop: number }> {
  const start = source.indexOf(begin); const last = source.indexOf(end);
  if (start === -1 || last <= start || source.includes(begin, start + begin.length) || source.includes(end, last + end.length)) { return bad(); } return { start, stop: last + end.length };
}
function readBlob(match: RegExpMatchArray, offset: number): Blob {
  const [encoded, length, sha256, packedLength, packedSha256] = match.slice(offset, offset + 5);
  if (encoded === undefined || length === undefined || sha256 === undefined || packedLength === undefined || packedSha256 === undefined) { return bad(); }
  return { encoded, length: Number(length), sha256, packedLength: Number(packedLength), packedSha256 };
}
function read(source: string): Readonly<{ start: number; stop: number; original: string; compact: string }> {
  if (Buffer.byteLength(source) > MAXIMUM || source.includes(LITERAL_BEGIN) || source.includes(LITERAL_END)) { return bad(); }
  const { start, stop } = section(source, BEGIN, END), stored = source.slice(start, stop);
  const compilerRows = [...stored.matchAll(/^\$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/gmu)];
  const spacingRows = [...stored.matchAll(/^# fixed-review-spacing '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' '([a-f\d]{64})'$/gmu)];
  const compilerRow = compilerRows[0], spacingRow = spacingRows[0];
  if (compilerRows.length !== 1 || spacingRows.length !== 1 || compilerRow === undefined || spacingRow === undefined) { return bad(); }
  const originalLength = Number(spacingRow[6]), originalSha256 = spacingRow[7], tokenSha256 = spacingRow[8];
  if (!Number.isSafeInteger(originalLength) || originalLength < 1 || originalLength > CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES || originalSha256 === undefined || tokenSha256 === undefined) { return bad(); }
  const meta: Metadata = { compiler: readBlob(compilerRow, 1), spacing: readBlob(spacingRow, 1), originalLength, originalSha256, tokenSha256 };
  if (stored !== block(meta)) { return bad(); }
  const compiler = unpack(meta.compiler, MAXIMUM); if (compiler.some(byte => byte > 127 || byte === 0)) { return bad(); }
  const compact = new TextDecoder("utf-8", { fatal: true }).decode(compiler), spacing = unpack(meta.spacing, SPACING_MAXIMUM);
  const original = restoreCurrentPcbDiagnosticCSharp(compact, spacing, tokenSha256); const bytes = Buffer.from(original);
  if (bytes.length !== originalLength || hash(bytes) !== originalSha256 || bytes.length > compiler.length + SPACING_MAXIMUM) { return bad(); }
  return { start, stop, original, compact };
}
/** Original bytes/markers only. This is NOT the actual runtime compiler input. */
export function expandCurrentPcbDiagnosticCSharpReviewSource(source: string): string {
  if (hasCurrentPcbDiagnosticCSharpReviewStorageV3(source)) { return expandCurrentPcbDiagnosticCSharpReviewSourceV3(source); }
  if (!source.includes(BEGIN.slice(0, -1)) && !source.includes(END.slice(0, -1))) { return expandCurrentPcbDiagnosticCSharpStorage(source); }
  const value = read(source); return source.slice(0, value.start) + LITERAL_BEGIN + value.original + LITERAL_END + source.slice(value.stop);
}
export function currentPcbDiagnosticCSharpReviewSource(input: string): string {
  const source = expandCurrentPcbDiagnosticCSharpReviewSource(input); const { start, stop } = section(source, LITERAL_BEGIN, LITERAL_END); const body = source.slice(start + LITERAL_BEGIN.length, stop - LITERAL_END.length); const bytes = Buffer.from(body);
  if (bytes.length === 0 || bytes.length > CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES || bytes.some(byte => byte > 127 || byte === 0)) { return bad(); } return body;
}
/** Only these bytes may be written to Native.cs or passed to a compiler. */
export function currentPcbDiagnosticCSharpRuntimeCompilerInput(input: string): string {
  if (hasCurrentPcbDiagnosticCSharpReviewStorageV3(input)) { return currentPcbDiagnosticCSharpRuntimeCompilerInputV3(input); }
  return input.includes(BEGIN.slice(0, -1)) || input.includes(END.slice(0, -1)) ? read(input).compact : currentPcbDiagnosticCSharpCompilerInput(input);
}
export function packCurrentPcbDiagnosticCSharpReviewStorage(input: string): string {
  const source = expandCurrentPcbDiagnosticCSharpReviewSource(input); const { start, stop } = section(source, LITERAL_BEGIN, LITERAL_END); const body = currentPcbDiagnosticCSharpReviewSource(source);
  const value = compactCurrentPcbDiagnosticCSharp(body); const compiler = pack(Buffer.from(value.compact), MAXIMUM); const spacing = pack(value.spacing, SPACING_MAXIMUM);
  if (Buffer.byteLength(body) > compiler.length + SPACING_MAXIMUM) { return bad(); }
  const meta: Metadata = { compiler, spacing, originalLength: Buffer.byteLength(body), originalSha256: hash(Buffer.from(body)), tokenSha256: value.tokenSha256 };
  const result = source.slice(0, start) + block(meta) + source.slice(stop); if (Buffer.byteLength(result) > MAXIMUM) { return bad(); } return result;
}
/** V1 marker operations retain their old format/limits. Only explicit final
 * combined composition introduces the separately versioned review format. */
export function retainCurrentPcbDiagnosticCSharpReviewStorage(source: string, original: string): string {
  if (hasCurrentPcbDiagnosticCSharpReviewStorageV3(original)) { return packV3(expandCurrentPcbDiagnosticCSharpReviewSource(source)); }
  return original.includes(BEGIN) ? packCurrentPcbDiagnosticCSharpReviewStorage(source) : retainCurrentPcbDiagnosticCSharpStorage(source, original);
}

/** Explicit opt-in for the inverse composition only. Historical pack remains V2. */
export function packCurrentPcbDiagnosticCSharpTokenFusionStorage(input: string): string {
  return packV3(expandCurrentPcbDiagnosticCSharpReviewSource(input));
}
