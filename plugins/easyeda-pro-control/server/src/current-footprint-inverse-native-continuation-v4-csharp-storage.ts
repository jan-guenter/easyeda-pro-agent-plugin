/** Explicit native-only continuation V4 compiler/review envelope. Historical
 * shared layouts/decoders, helper bytes, spacing and command limits stay fixed. */
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as HELPER_MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER as OLD_DECODER } from "./current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES as SPACING_MAXIMUM } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { compactCurrentPcbDiagnosticCSharpV3 as compactCurrentPcbDiagnosticCSharp, restoreCurrentPcbDiagnosticCSharpV3 as restoreCurrentPcbDiagnosticCSharp } from "./current-pcb-diagnostic-csharp-spacing-v3.ts";

import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_LAYOUT as LAYOUT,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_COMPILER_MAX_BYTES as MAXIMUM}from "./current-footprint-inverse-native-v4-build-profile.ts";

function decoder():string{
 const before="if($fixedLength -lt 1 -or $fixedLength -gt 2097152 -or $fixedPackedLength -lt 18 -or $fixedPackedLength -gt 2097152 -or $fixedEncoded.Length -gt 2796204";
 const after="if($fixedLength -lt 1 -or $fixedLength -gt 2490368 -or $fixedPackedLength -lt 18 -or $fixedPackedLength -gt 2490368 -or $fixedEncoded.Length -gt 3320492";
 if(MAXIMUM!==2_490_368||OLD_DECODER.split(before).length!==2||OLD_DECODER.split("Expand-FixedCurrent209CSharp").length!==2){throw new Error("INVERSE_CONTINUATION_V4_DECODER_PREIMAGE");}
 return OLD_DECODER.replace(before,after).replace("Expand-FixedCurrent209CSharp","Expand-FixedInverseNativeContinuationCSharpV4").replaceAll("fixed-csharp-storage-","fixed-inverse-continuation-v4-storage-");
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_CSHARP_DECODER=decoder();
function layout(value:typeof LAYOUT):void{if(value!==LAYOUT){throw new Error("INVERSE_CONTINUATION_V4_COMPILER_LAYOUT");}}

const BEGIN = "# BEGIN FIXED INVERSE NATIVE CONTINUATION CSHARP REVIEW STORAGE V4\n", END = "# END FIXED INVERSE NATIVE CONTINUATION CSHARP REVIEW STORAGE V4\n";
const LITERAL_BEGIN = "Add-Type @'\n", LITERAL_END = "\n'@\n";
const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const bad = (): never => { throw new Error("INVERSE_CONTINUATION_V4_CSHARP_REVIEW_STORAGE"); };
interface Blob { readonly encoded: string; readonly length: number; readonly sha256: string; readonly packedLength: number; readonly packedSha256: string }
interface Metadata { readonly compiler: Blob; readonly spacing: Blob; readonly originalLength: number; readonly originalSha256: string; readonly tokenSha256: string }
/** Compress one bounded source blob and retain both raw and compressed lengths and SHA256 values. */
function pack(bytes: Buffer, maximum: number, kind: "COMPILER" | "SPACING"): Blob {
  if (bytes.length === 0) { return bad(); }
  if (bytes.length > maximum) { throw new Error(`INVERSE_CONTINUATION_V4_CSHARP_REVIEW_STORAGE_CAPACITY_${kind}_BYTES_${String(bytes.length)}_GT_${String(maximum)}`); }
  // oxlint-disable-next-line node/no-sync -- Fixed immutable build data, bounded before compression.
  const packed = gzipSync(bytes, { level: 9 });
  if (packed.length > maximum) { throw new Error(`INVERSE_CONTINUATION_V4_CSHARP_REVIEW_STORAGE_CAPACITY_${kind}_GZIP_BYTES_${String(packed.length)}_GT_${String(maximum)}`); }
  return { encoded: packed.toString("base64"), length: bytes.length, sha256: hash(bytes), packedLength: packed.length, packedSha256: hash(packed) };
}
/** Validate encoded length, compressed hash and expansion bound before checking the exact restored source hash. */
function unpack(meta: Blob, maximum: number): Buffer {
  if (!Number.isSafeInteger(meta.length) || meta.length === 0 || meta.length > maximum || !Number.isSafeInteger(meta.packedLength) || meta.packedLength < 18 || meta.packedLength > maximum || meta.encoded.length > Math.ceil(maximum / 3) * 4) { return bad(); }
  const packed = Buffer.from(meta.encoded, "base64"); if (packed.length !== meta.packedLength || packed.toString("base64") !== meta.encoded || hash(packed) !== meta.packedSha256) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Each new compiler payload and unchanged spacing payload has its exact typed bound.
  const raw: unknown = gunzipSync(packed, { info: true, maxOutputLength: meta.length }); if (raw === null || typeof raw !== "object") { return bad(); }
  const buffer: unknown = Reflect.get(raw, "buffer"), engine: unknown = Reflect.get(raw, "engine");
  if (!Buffer.isBuffer(buffer) || engine === null || typeof engine !== "object" || Reflect.get(engine, "bytesWritten") !== packed.length || buffer.length !== meta.length || hash(buffer) !== meta.sha256) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Canonical pinned-Node24 compression rejects extra gzip members and ignored tails.
  if (!gzipSync(buffer, { level: 9 }).equals(packed)) { return bad(); } return buffer;
}
/** Encode the fixed PowerShell metadata arguments from an already validated source blob. */
function argumentsText(value: Blob): string { return `'${value.encoded}' ${String(value.length)} '${value.sha256}' ${String(value.packedLength)} '${value.packedSha256}'`; }
/** Emit the fixed native-continuation-v4 storage block containing the compact body and reversible review metadata. */
function block(meta: Metadata): string {
  // Spacing is build-only data in a comment, covered by the admitted whole
  // Helper identity. Runtime decodes/compiles only the compact bounded body.
  return `${BEGIN}# fixed-inverse-continuation-review-spacing-v4 ${argumentsText(meta.spacing)} ${String(meta.originalLength)} '${meta.originalSha256}' '${meta.tokenSha256}'\n${CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_CSHARP_DECODER}$fixedInverseNativeContinuationCompilerV4=Expand-FixedInverseNativeContinuationCSharpV4 ${argumentsText(meta.compiler)}\nAdd-Type -TypeDefinition $fixedInverseNativeContinuationCompilerV4\nRemove-Variable fixedInverseNativeContinuationCompilerV4\n${END}`;
}
/** Locate exactly one supported storage section and refuse missing, repeated or reordered boundaries. */
function section(source: string, begin: string, end: string): Readonly<{ start: number; stop: number }> {
  const start = source.indexOf(begin); const last = source.indexOf(end);
  if (start === -1 || last <= start || source.includes(begin, start + begin.length) || source.includes(end, last + end.length)) { return bad(); } return { start, stop: last + end.length };
}
/** Parse one complete fixed storage-blob metadata tuple from the matched native-continuation-v4 block. */
function readBlob(match: RegExpMatchArray, offset: number): Blob {
  const [encoded, length, sha256, packedLength, packedSha256] = match.slice(offset, offset + 5);
  if (encoded === undefined || length === undefined || sha256 === undefined || packedLength === undefined || packedSha256 === undefined) { return bad(); }
  return { encoded, length: Number(length), sha256, packedLength: Number(packedLength), packedSha256 };
}
/** Read and validate the exact native-continuation-v4 block, then restore its original and compact C# forms. */
function read(source: string): Readonly<{ start: number; stop: number; original: string; compact: string }> {
  if (Buffer.byteLength(source) > HELPER_MAXIMUM || source.includes(LITERAL_BEGIN) || source.includes(LITERAL_END) || source.includes("FIXED INVERSE NATIVE CONTINUATION CSHARP REVIEW STORAGE V2") || source.includes("FIXED INVERSE NATIVE CONTINUATION CSHARP REVIEW STORAGE V3") || source.includes("# BEGIN FIXED CURRENT209 CSHARP STORAGE") || source.includes("# END FIXED CURRENT209 CSHARP STORAGE") || source.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE") || source.includes("# END FIXED CURRENT209 CSHARP REVIEW STORAGE")) { return bad(); }
  const { start, stop } = section(source, BEGIN, END), stored = source.slice(start, stop);
  const compilerRows = [...stored.matchAll(/^\$fixedInverseNativeContinuationCompilerV4=Expand-FixedInverseNativeContinuationCSharpV4 '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/gmu)];
  const spacingRows = [...stored.matchAll(/^# fixed-inverse-continuation-review-spacing-v4 '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})' '([a-f\d]{64})'$/gmu)];
  const compilerRow = compilerRows[0], spacingRow = spacingRows[0];
  if (compilerRows.length !== 1 || spacingRows.length !== 1 || compilerRow === undefined || spacingRow === undefined) { return bad(); }
  const originalLength = Number(spacingRow[6]), originalSha256 = spacingRow[7], tokenSha256 = spacingRow[8];
  if (!Number.isSafeInteger(originalLength) || originalLength < 1 || originalLength > CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES || originalSha256 === undefined || tokenSha256 === undefined) { return bad(); }
  const meta: Metadata = { compiler: readBlob(compilerRow, 1), spacing: readBlob(spacingRow, 1), originalLength, originalSha256, tokenSha256 };
  if (stored !== block(meta)) { return bad(); }
  const compiler = unpack(meta.compiler, MAXIMUM); if (compiler.some(byte => byte > 127 || byte === 0)) { return bad(); }
  const compact = new TextDecoder("utf-8", { fatal: true }).decode(compiler), spacing = unpack(meta.spacing, SPACING_MAXIMUM);
  const original = restoreCurrentPcbDiagnosticCSharp(compact, spacing, tokenSha256); const bytes = Buffer.from(original);
  if (bytes.length !== originalLength || hash(bytes) !== originalSha256 || bytes.length > compiler.length + SPACING_MAXIMUM) { return bad(); }
  return { start, stop, original, compact };
}
/** Recognize the explicit native-continuation-v4 marker without treating it as authority to compile or execute. */
export function hasCurrentFootprintInverseNativeContinuationV4CSharpStorage(source: string): boolean {
  return source.includes(BEGIN.slice(0, -1)) || source.includes(END.slice(0, -1));
}
/** Restore the original review source from a validated native-continuation-v4 block without changing historical version decoders. */
export function expandCurrentFootprintInverseNativeContinuationV4CSharpStorage(source: string,selected:typeof LAYOUT): string {
  layout(selected);const value = read(source);
  return source.slice(0, value.start) + LITERAL_BEGIN + value.original + LITERAL_END + source.slice(value.stop);
}
/** Return only the validated compact compiler body; review metadata is not part of the runtime C# input. */
export function currentFootprintInverseNativeContinuationV4CompilerInput(source: string,selected:typeof LAYOUT): string { layout(selected);return read(source).compact; }
export function currentFootprintInverseNativeContinuationV4ReviewSource(source:string,selected:typeof LAYOUT):string{layout(selected);return read(source).original;}
/** Pack the original C# source through explicit native-continuation-v4 token fusion with exact restoration and fixed size bounds. */
export function packCurrentFootprintInverseNativeContinuationV4CSharpStorage(input: string,selected:typeof LAYOUT): string {
  layout(selected);const source = hasCurrentFootprintInverseNativeContinuationV4CSharpStorage(input) ? expandCurrentFootprintInverseNativeContinuationV4CSharpStorage(input,selected) : input;
  const { start, stop } = section(source, LITERAL_BEGIN, LITERAL_END);
  const body = source.slice(start + LITERAL_BEGIN.length, stop - LITERAL_END.length);
  const bytes = Buffer.from(body);
  if (bytes.length === 0 || bytes.length > CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES || bytes.some(byte => byte > 127 || byte === 0)) { return bad(); }
  const value = compactCurrentPcbDiagnosticCSharp(body);
  const compiler = pack(Buffer.from(value.compact), MAXIMUM, "COMPILER");
  const spacing = pack(value.spacing, SPACING_MAXIMUM, "SPACING");
  if (bytes.length > compiler.length + SPACING_MAXIMUM) { return bad(); }
  const meta: Metadata = { compiler, spacing, originalLength: bytes.length, originalSha256: hash(bytes), tokenSha256: value.tokenSha256 };
  const result = source.slice(0, start) + block(meta) + source.slice(stop);
  if (Buffer.byteLength(result) > HELPER_MAXIMUM) { return bad(); }
  read(result);
  return result;
}
