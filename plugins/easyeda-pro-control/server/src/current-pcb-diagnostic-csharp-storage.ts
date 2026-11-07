/** Build-only reversible storage of the one fixed combined helper C# body.
 * Runtime metadata is emitted as literals, never accepted from control input. */
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";

const BEGIN = "# BEGIN FIXED CURRENT209 CSHARP STORAGE\n";
const END = "# END FIXED CURRENT209 CSHARP STORAGE\n";
const LITERAL_BEGIN = "Add-Type @'\n";
const LITERAL_END = "\n'@\n";
const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const bad = (): never => { throw new Error("PCB_DIAGNOSTIC_CSHARP_STORAGE"); };

/** Identical fixed decoder in the production helper and the existing synthetic
 * compile reader. It checks both original byte identities before Add-Type. */
export const CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER = String.raw`function Expand-FixedCurrent209CSharp([string]$fixedEncoded,[int]$fixedLength,[string]$fixedHash,[int]$fixedPackedLength,[string]$fixedPackedHash) {
  if($fixedLength -lt 1 -or $fixedLength -gt 2097152 -or $fixedPackedLength -lt 18 -or $fixedPackedLength -gt 2097152 -or $fixedEncoded.Length -gt 2796204 -or $fixedHash -cnotmatch '\A[a-f0-9]{64}\z' -or $fixedPackedHash -cnotmatch '\A[a-f0-9]{64}\z'){throw 'fixed-csharp-storage-bounds'}
  $fixedPacked=[Convert]::FromBase64String($fixedEncoded)
  if($fixedPacked.Length -ne $fixedPackedLength -or [Convert]::ToBase64String($fixedPacked) -cne $fixedEncoded){throw 'fixed-csharp-storage-base64'}
  $fixedHasher=[Security.Cryptography.SHA256]::Create()
  try {
    if(([BitConverter]::ToString($fixedHasher.ComputeHash($fixedPacked))).Replace('-','').ToLowerInvariant() -cne $fixedPackedHash){throw 'fixed-csharp-storage-packed-hash'}
    if($fixedPacked[0] -ne 31 -or $fixedPacked[1] -ne 139 -or $fixedPacked[2] -ne 8 -or $fixedPacked[3] -ne 0 -or [BitConverter]::ToUInt32($fixedPacked,$fixedPacked.Length-4) -ne $fixedLength){throw 'fixed-csharp-storage-envelope'}
    $fixedInput=[IO.MemoryStream]::new($fixedPacked,$false)
    $fixedZip=$null
    try {
      $fixedZip=[IO.Compression.GZipStream]::new($fixedInput,[IO.Compression.CompressionMode]::Decompress,$true)
      $fixedBytes=New-Object byte[] $fixedLength
      $fixedOffset=0
      while($fixedOffset -lt $fixedLength){$fixedRead=$fixedZip.Read($fixedBytes,$fixedOffset,$fixedLength-$fixedOffset);if($fixedRead -le 0){throw 'fixed-csharp-storage-short'};$fixedOffset+=$fixedRead}
      if($fixedZip.ReadByte() -ne -1 -or $fixedInput.Position -ne $fixedPackedLength){throw 'fixed-csharp-storage-tail'}
      if(([BitConverter]::ToString($fixedHasher.ComputeHash($fixedBytes))).Replace('-','').ToLowerInvariant() -cne $fixedHash){throw 'fixed-csharp-storage-raw-hash'}
      foreach($fixedByte in $fixedBytes){if($fixedByte -gt 127){throw 'fixed-csharp-storage-ascii'}}
      return [Text.UTF8Encoding]::new($false,$true).GetString($fixedBytes)
    } finally {if($null -ne $fixedZip){$fixedZip.Dispose()};$fixedInput.Dispose()}
  } finally {$fixedHasher.Dispose()}
}
`;

interface Metadata { readonly encoded: string; readonly length: number; readonly sha256: string; readonly packedLength: number; readonly packedSha256: string }
function block(meta: Metadata): string {
  return `${BEGIN}${CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER}$fixedCurrent209CSharp=Expand-FixedCurrent209CSharp '${meta.encoded}' ${String(meta.length)} '${meta.sha256}' ${String(meta.packedLength)} '${meta.packedSha256}'\nAdd-Type -TypeDefinition $fixedCurrent209CSharp\nRemove-Variable fixedCurrent209CSharp\n${END}`;
}
function section(source: string, begin: string, end: string): Readonly<{ start: number; stop: number }> {
  const start = source.indexOf(begin); const last = source.indexOf(end);
  if (start === -1 || last <= start || source.includes(begin, start + begin.length) || source.includes(end, last + end.length)) { return bad(); }
  return { start, stop: last + end.length };
}
function unpack(meta: Metadata): string {
  if (!Number.isSafeInteger(meta.length) || meta.length <= 0 || meta.length > MAXIMUM || !Number.isSafeInteger(meta.packedLength) || meta.packedLength < 18 || meta.packedLength > MAXIMUM || meta.encoded.length > Math.ceil(MAXIMUM / 3) * 4) { return bad(); }
  const packed = Buffer.from(meta.encoded, "base64");
  if (packed.length !== meta.packedLength || packed.toString("base64") !== meta.encoded || hash(packed) !== meta.packedSha256) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- One fixed build artifact, bounded before decompression; never native or application input.
  const decoded: unknown = gunzipSync(packed, { info: true, maxOutputLength: meta.length });
  if (typeof decoded !== "object" || decoded === null) { return bad(); }
  const bytes: unknown = Reflect.get(decoded, "buffer"); const engine: unknown = Reflect.get(decoded, "engine");
  if (!Buffer.isBuffer(bytes) || typeof engine !== "object" || engine === null) { return bad(); }
  const consumed: unknown = Reflect.get(engine, "bytesWritten");
  if (bytes.length !== meta.length || consumed !== packed.length || hash(bytes) !== meta.sha256 || bytes.some(byte => byte > 127)) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Pinned Node24 canonical encoding rejects extra gzip members and otherwise ignored tails.
  if (!gzipSync(bytes, { level: 9 }).equals(packed)) { return bad(); }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
/** Restore the exact literal body before every marker-based generator or
 * released forward/cold projection. Unpacked legacy input is unchanged. */
export function expandCurrentPcbDiagnosticCSharpStorage(source: string): string {
  if (!source.includes(BEGIN.slice(0, -1)) && !source.includes(END.slice(0, -1))) { return source; }
  if (Buffer.byteLength(source) > MAXIMUM) { return bad(); }
  const { start, stop } = section(source, BEGIN, END), stored = source.slice(start, stop);
  const matches = [...stored.matchAll(/^\$fixedCurrent209CSharp=Expand-FixedCurrent209CSharp '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/gmu)];
  const match = matches[0]; if (matches.length !== 1 || match === undefined) { return bad(); }
  const [, encoded, length, sha256, packedLength, packedSha256] = match;
  if (encoded === undefined || length === undefined || sha256 === undefined || packedLength === undefined || packedSha256 === undefined) { return bad(); }
  const meta: Metadata = { encoded, length: Number(length), sha256, packedLength: Number(packedLength), packedSha256 };
  if (stored !== block(meta) || source.includes(LITERAL_BEGIN) || source.includes(LITERAL_END)) { return bad(); }
  const body = unpack(meta);
  return source.slice(0, start) + LITERAL_BEGIN + body + LITERAL_END + source.slice(stop);
}
/** Only the final combined output is packed. Source fragments, all control
 * semantics and the separate released six-role artifacts stay literal. */
export function packCurrentPcbDiagnosticCSharpStorage(input: string): string {
  const source = expandCurrentPcbDiagnosticCSharpStorage(input), { start, stop } = section(source, LITERAL_BEGIN, LITERAL_END);
  const body = source.slice(start + LITERAL_BEGIN.length, stop - LITERAL_END.length), bytes = Buffer.from(body);
  if (bytes.length === 0 || bytes.length > MAXIMUM || bytes.some(byte => byte > 127) || source.includes(BEGIN) || source.includes(END)) { return bad(); }
  // oxlint-disable-next-line node/no-sync -- Pinned Node24 deterministic compression of the complete immutable C# compiler input.
  const packed = gzipSync(bytes, { level: 9 });
  if (packed.length > MAXIMUM) { return bad(); }
  const meta: Metadata = { encoded: packed.toString("base64"), length: bytes.length, sha256: hash(bytes), packedLength: packed.length, packedSha256: hash(packed) };
  const stored = source.slice(0, start) + block(meta) + source.slice(stop);
  if (Buffer.byteLength(stored) > MAXIMUM) { return bad(); }
  return stored;
}

/** Marker generators preserve the input storage form; only startup composition
 * introduces packed storage into a previously literal combined helper. */
export function retainCurrentPcbDiagnosticCSharpStorage(source: string, original: string): string {
  return original.includes(BEGIN) ? packCurrentPcbDiagnosticCSharpStorage(source) : source;
}
