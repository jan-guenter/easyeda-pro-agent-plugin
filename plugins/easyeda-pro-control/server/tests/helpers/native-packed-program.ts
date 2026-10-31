import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

/** Require one declaration rather than choosing a favorable duplicate. */
function unique(native: string, pattern: string): RegExpExecArray {
  const matches = [...native.matchAll(new RegExp(pattern, "gu"))];
  assert.equal(matches.length, 1);
  const match = matches[0]; assert.ok(match !== undefined); return match;
}

/** Select one uniquely marked PCB209 program block with its own hash pin.
 * The helper also contains legitimate same-named startup fields in other C#
 * classes. They are outside this generated-program contract. Standalone packed
 * fixtures have no markers and keep whole-input uniqueness checks. */
function programScope(native: string, name: string): string {
  unique(native, `const string ${name}Sha256=`);
  const markers = [...native.matchAll(/^ *\/\/ (BEGIN|END) GENERATED PCB209 ([A-Z][A-Z ]{1,63}) PROGRAM$/gmu)];
  if (markers.length === 0) { return native; }
  const candidates: string[] = [], seen = new Set<string>();
  let opened: Readonly<{ marker: string; index: number }> | undefined;
  for (const marker of markers) {
    const kind = marker[1], label = marker[2]; assert.ok(label !== undefined);
    if (kind === "BEGIN") {
      assert.equal(opened, undefined); assert.equal(seen.has(label), false); seen.add(label);
      opened = { marker: label, index: marker.index };
    } else {
      assert.ok(opened !== undefined); assert.equal(opened.marker, label);
      const block = native.slice(opened.index, marker.index + marker[0].length);
      if (block.includes(`const string ${name}Sha256=`)) { candidates.push(block); }
      opened = undefined;
    }
  }
  assert.equal(opened, undefined); assert.equal(candidates.length, 1);
  const result = candidates[0]; assert.ok(result !== undefined); return result;
}

/** Decode exact bounded storage independently of the production C# reader. */
function decode(encoded: string, length: number, sourceSha: string, packedSha: string): string {
  assert.ok(Number.isSafeInteger(length) && length > 0 && length <= 65_536 && encoded.length <= 87_384);
  const compressed = Buffer.from(encoded, "base64");
  assert.equal(compressed.toString("base64"), encoded);
  assert.ok(compressed.length >= 18 && compressed.length <= 65_536);
  assert.equal(createHash("sha256").update(compressed).digest("hex"), packedSha);
  // oxlint-disable-next-line node/no-sync -- This independent test decoder has an exact64KiB ceiling and no runtime request use.
  const bytes = gunzipSync(compressed, { maxOutputLength: length });
  assert.equal(bytes.length, length);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), sourceSha);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Independently read a fixed table alias, including complete table integrity,
 * unique declarations, row count/index, and the original member's byte/hash pin. */
function readTable(native: string, scope: string, name: string, sourceSha: string): string {
  const alias = unique(scope, `static readonly string ${name}=StringWorkerPackedProgram\\((StringWorkerProgramTable[0-9]+),([0-9]+),([0-9]+),${name}Sha256\\);`);
  const index = Number(alias[2]), length = Number(alias[3]), table = alias[1];
  assert.ok(table !== undefined && Number.isSafeInteger(index) && index >= 0 && Number.isSafeInteger(length) && length > 0 && length <= 65_536);
  unique(native, `static readonly string\\[\\] ${table}=`);
  const declaration = unique(native, `static readonly string\\[\\] ${table}=StringWorkerPackedProgramTable\\("([A-Za-z0-9+/=]+)",([0-9]+),"([a-f0-9]{64})","([a-f0-9]{64})",([0-9]+)\\);`);
  const count = Number(declaration[5]), encoded = declaration[1], packedSha = declaration[4], tableSha = declaration[3];
  assert.ok(encoded !== undefined && tableSha !== undefined && packedSha !== undefined && Number.isSafeInteger(count) && count >= 1 && count <= 20 && index < count);
  const rows = decode(encoded, Number(declaration[2]), tableSha, packedSha).split("\0");
  assert.equal(rows.length, count); assert.ok(rows.every(row => row.length > 0));
  const value = rows[index]; assert.ok(value !== undefined);
  assert.equal(Buffer.byteLength(value), length); assert.equal(createHash("sha256").update(value).digest("hex"), sourceSha);
  return value;
}

/** Independent reader for original individual constants and fixed table aliases.
 * Neither representation supplies production execution or ownership authority. */
export function readPackedNativeProgram(native: string, name: string): string {
  assert.match(name, /^[A-Z][A-Za-z0-9]{1,63}Function$/u);
  const scope = programScope(native, name);
  unique(scope, `static readonly string ${name}=`);
  const sourceSha = unique(scope, `const string ${name}Sha256="([a-f0-9]{64})";`)[1];
  assert.ok(sourceSha !== undefined);
  if (scope.includes(`static readonly string ${name}=StringWorkerPackedProgram(`)) { return readTable(native, scope, name, sourceSha); }
  const encoded = unique(scope, `const string ${name}Gzip="([A-Za-z0-9+/=]+)";`)[1];
  const invocation = unique(scope, `static readonly string ${name}=UnpackFixedProgram\\(${name}Gzip,([0-9]+),${name}Sha256,"([a-f0-9]{64})"\\);`);
  assert.ok(encoded !== undefined && invocation[1] !== undefined && invocation[2] !== undefined);
  return decode(encoded, Number(invocation[1]), sourceSha, invocation[2]);
}
