/** Independent decoding of the exact shared native table call. No inline
 * decoder fallback, app assets or native application execution is permitted. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { currentPcbDiagnosticFixedTableNativeSource } from "../../src/current-pcb-diagnostic-fixed-table-native.ts";

/** Independently decode one exact shared-loader call with canonical base64,
 * compressed/decoded SHA-256, 64 KiB bounds and exact row/column counts. Also
 * verify the committed helper retains the shared decoder, strict UTF-8 and
 * trailing-data refusal. This reads maintained helper source, never app assets
 * or native application state.
 */
export async function decodeFixedNativeTable(source: string, expectedRows: number, expectedColumns: number): Promise<Readonly<{
  bytes: Buffer; encoded: string; rows: readonly string[];
}>> {
  const matches = [...source.matchAll(/static string\[\]\[\] Load\(\)\{return EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+)\);\}/gu)];
  assert.equal(matches.length, 1, "Require exactly one closed shared table loader.");
  const match = matches[0]; assert.ok(match !== undefined);
  const [encoded, lengthText, decodedHash, packedHash, rowText, columnText] = match.slice(1);
  assert.ok(encoded !== undefined && lengthText !== undefined && decodedHash !== undefined && packedHash !== undefined && rowText !== undefined && columnText !== undefined);
  const length = Number(lengthText);
  const rowCount = Number(rowText);
  const columns = Number(columnText);
  assert.ok(Number.isSafeInteger(length) && length > 0 && length <= 65_536);
  assert.ok(encoded.length > 0 && encoded.length <= 87_384);
  assert.equal(rowCount, expectedRows); assert.ok(rowCount > 0 && rowCount <= 256);
  assert.equal(columns, expectedColumns); assert.ok(columns > 0 && columns <= 8);
  const packed = Buffer.from(encoded, "base64"); assert.equal(packed.toString("base64"), encoded);
  assert.ok(packed.length >= 18 && packed.length <= 65_536);
  assert.equal(createHash("sha256").update(packed).digest("hex"), packedHash);
  // oxlint-disable-next-line node/no-sync -- Decode one immutable bounded generated table, without app files or user data.
  const bytes = gunzipSync(packed, { maxOutputLength: 65_536 });
  assert.equal(bytes.length, length); assert.equal(createHash("sha256").update(bytes).digest("hex"), decodedHash);
  const rows = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\0");
  assert.equal(rows.length, rowCount); for (const row of rows) { assert.equal(row.split("\t").length, columns); }

  const shared = currentPcbDiagnosticFixedTableNativeSource();
  assert.match(shared, /rows<1\|\|rows>256\|\|columns<1\|\|columns>8/u);
  assert.match(shared, /EasyedaDiagnosticOwner\.UnpackFixedProgram\(encoded,length,hash,packedHash\)\.Split\('\\0'\)/u);
  assert.match(shared, /text\.Length!=rows/u); assert.match(shared, /result\[i\]\.Length!=columns/u);
  const helper = await readFile(new URL("../../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(helper.includes(shared));
  const start = helper.indexOf("  internal static string UnpackFixedProgram("); assert.notEqual(start, -1);
  const end = helper.indexOf("  static void ExpectPackedProgramRefusal", start); assert.ok(end > start);
  const decoder = helper.slice(start, end);
  assert.match(decoder, /length>65536/u); assert.match(decoder, /compressed\.Length>65536/u);
  assert.match(decoder, /Convert\.ToBase64String\(compressed\)!=encoded/u);
  assert.match(decoder, /hash\.ComputeHash\(compressed\)/u); assert.match(decoder, /hash\.ComputeHash\(bytes\)/u);
  assert.match(decoder, /stream\.ReadByte\(\)!=-1 \|\| input\.Position!=input\.Length/u);
  assert.match(decoder, /new UTF8Encoding\(false,true\)\.GetString\(bytes\)/u);
  return Object.freeze({ bytes, encoded, rows: Object.freeze(rows) });
}
