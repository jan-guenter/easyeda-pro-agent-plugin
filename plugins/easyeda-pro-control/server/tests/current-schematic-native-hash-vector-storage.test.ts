/** Lossless bank/index storage checks, with the unchanged old hash emitter and
 * decoder. These tests execute no C#, native helper or application actor. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM, packCurrentPcbDiagnosticCSharpTokenFusionStorage as pack, currentPcbDiagnosticCSharpReviewSource as review } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticFixedTableNativeSource as decoder, currentPcbDiagnosticNativeHashVector as vector } from "../src/current-pcb-diagnostic-fixed-table-native.ts";
import { expandCurrentSchematicNativeHashVectors as expand, hasCurrentSchematicNativeHashVectorStorage as has, projectCurrentSchematicNativeHashVectors as project } from "../src/current-schematic-native-hash-vector-storage.ts";

const NAME = "EasyedaSchematicHashVectorsV1";
const pool = Array.from({ length: 512 }, (_value, index) => createHash("sha256").update(`schematic-vector-${String(index)}`).digest("hex"));
const values = Array.from({ length: 6 }, (_value, index) => pool.slice(index % 2 * 256, (index % 2 + 1) * 256));
const source = `using System;\n${decoder()}\nclass Probe{static void Run(){${values.map((items, index) => `var v${String(index)}=${vector(items)};`).join("")}
string text="EasyedaSchematicHashVectorsV1.Get(99)";char c='.';/*${vector([pool[0] ?? ""])}*/}}\n`;

void test("fixed banks preserve original vector bytes, counts, decoder and every unrelated peer through V3 storage", () => {
  const projected = project(source); assert.equal(has(projected), true); assert.equal(expand(projected), source); assert.equal(project(projected), projected);
  // Pin this released V1 encoding independently of the matching live decoder.
  assert.equal(createHash("sha256").update(projected).digest("hex"), "7038cf5d07cfbebc1b91da66c63c9c08b163fbf0d860f8c73d120496d5cad224");
  assert.ok(projected.length < source.length - 30_000); assert.ok(projected.includes(decoder()));
  assert.ok(projected.includes(`${NAME}.Get(5)`)); assert.ok(projected.includes('string text="EasyedaSchematicHashVectorsV1.Get(99)"'));
  const banks = [...projected.matchAll(/EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",256\)/gu)];
  assert.equal(banks.length, 2); assert.equal(banks[0]?.[1], Buffer.from(pool.slice(0, 256).join(""), "hex").toString("base64"));
  assert.equal(banks[1]?.[1], Buffer.from(pool.slice(256).join(""), "hex").toString("base64"));
  const indexes = [...projected.matchAll(/D\(@"([A-Za-z\d+/=]+)",256\)/gu)]; assert.equal(indexes.length, 6);
  const first = Buffer.from(indexes[0]?.[1] ?? "", "base64"), second = Buffer.from(indexes[1]?.[1] ?? "", "base64");
  assert.equal(first.readUInt16LE(0), 0); assert.equal(first.readUInt16LE(510), 255); assert.equal(second.readUInt16LE(0), 256); assert.equal(second.readUInt16LE(510), 511);
  const packed = pack(`Add-Type @'\n${projected}\n'@\n`); assert.equal(review(packed), projected); assert.equal(expand(review(packed)), source);
});

void test("a partial final bank and a one-entry original vector retain their exact bounds", () => {
  const items = [pool.slice(0, 256), pool.slice(0, 256), pool.slice(256, 257), pool.slice(0, 256)];
  const original = `${decoder()}\nclass Partial{${items.map((value, index) => `object V${String(index)}=${vector(value)};`).join("")}}`;
  const projected = project(original); assert.notEqual(projected, original); assert.equal(expand(projected), original);
  const lastBank = vector(pool.slice(256, 257));
  assert.ok(projected.includes(lastBank)); assert.ok(projected.includes('D(@"AAE=",1)'));
  assert.throws(() => expand(projected.replace('D(@"AAE=",1)', 'D(@"AQE=",1)')));
});

void test("canonical decode refuses changed/reordered bank data, ushort indexes, calls, metadata and helper body", () => {
  const projected = project(source);
  const indexes = /D\(@"([A-Za-z\d+/=]+)",256\)/u.exec(projected); assert.ok(indexes?.[1] !== undefined);
  const invalid = Buffer.from(indexes[1], "base64"); invalid.writeUInt16LE(65_535, 0);
  for (const changed of [
    projected.replace(`${NAME}.Get(1)`, `${NAME}.Get(0)`), projected.replace(`${NAME}.Get(0)`, `${NAME}.Get(00)`),
    projected.replace(`${NAME}.Get(0)`, `@${NAME}.Get(0)`), projected.replace(indexes[1], invalid.toString("base64")),
    projected.replace("encoded.Length>684", "encoded.Length>1368"), projected.replace("count>256", "count>512"),
    projected.replace("FIXED SCHEMATIC HASH VECTORS V1", "FIXED SCHEMATIC HASH VECTORS V9"), `${projected  }// END FIXED SCHEMATIC HASH VECTORS V1\n`,
    projected.replace('char c=\'.\'', 'char c=\'!\''),
  ]) { assert.throws(() => expand(changed)); }
  const banks = [...projected.matchAll(/EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",256\)/gu)];
  const first = banks[0]?.[1], second = banks[1]?.[1]; assert.ok(first !== undefined && second !== undefined);
  let reordered = projected.replace(first, "TEMP_BANK").replace(second, first).replace("TEMP_BANK", second);
  reordered = reordered.replaceAll(/D\(@"([A-Za-z\d+/=]+)",256\)/gu, (_match, encoded: string) => {
    const bytes = Buffer.from(encoded, "base64"); for (let index = 0; index < 256; index += 1) { const value = bytes.readUInt16LE(index * 2); bytes.writeUInt16LE(value < 256 ? value + 256 : value - 256, index * 2); }
    return `D(@"${bytes.toString("base64")}",256)`;
  });
  assert.throws(() => expand(reordered));
});

void test("unsupported original call shapes, collisions, reserved markers and existing source limits fail closed", () => {
  const call = vector(values[0] ?? []), small = `class P{object A(){return ${vector([pool[0] ?? ""])};}}`;
  assert.equal(project(small), small); assert.equal(expand(small), small);
  for (const changed of [source.replace(call, call.replace(",256)", ", 256)")), source.replace(call, call.replace(",256)", ",257)")), source.replace(call, call.replace(",256)", ",0)")),
    source.replace(call, `Other.${call}`), source.replace(call, call.replace(".Hashes", ".@Hashes")), `${source  }class @${NAME}{}`,
    `${source  }\n// END FIXED SCHEMATIC HASH VECTORS V1\n`, `${source  }\n#define NEW\n`]) { assert.throws(() => project(changed)); }
  assert.throws(() => expand(`class ${NAME}{}`)); assert.throws(() => project(" ".repeat(MAXIMUM + 1))); assert.throws(() => expand(" ".repeat(MAXIMUM + 1)));
  assert.throws(() => project(`class P{${Array.from({ length: 129 }, () => `object x=${vector([pool[0] ?? ""])};`).join("")}}`));
});
