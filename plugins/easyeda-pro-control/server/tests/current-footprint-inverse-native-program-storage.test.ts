/** Inert build storage only. No native compiler, owner, app, transport or
 * generator runs while checking the complete canonical table restoration. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { test } from "node:test";
import { currentPcbDiagnosticFixedTableNativeSource } from "../src/current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_SCOPE_HELPERS as SCOPE } from "../src/current-selected-file-main-sql-capture-scope.ts";
import { CURRENT_NATIVE_OWN_DATA_CHECK as I11 } from "../src/current-native-own-data-intrinsics.ts";
import { expandCurrentSelectedMainNativePrograms as expandMain, projectCurrentSelectedMainNativePrograms as projectMain } from "../src/current-selected-main-native-program-storage.ts";
import { expandCurrentFootprintInverseNativePrograms as expand, projectCurrentFootprintInverseNativePrograms as project } from "../src/current-footprint-inverse-native-program-storage.ts";

const BEGIN = "// BEGIN FIXED FOOTPRINT INVERSE PROGRAM DATA V1", END = "// END FIXED FOOTPRINT INVERSE PROGRAM DATA V1";
const digest = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const original = (): RegExp => /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+)\)/gu;
const stored = (): RegExp => /EasyedaFootprintInverseProgramData\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+),(\d+),@"([a-f\d]{64})"\)/gu;
function args(text: string, rows = 1, columns = 1): string {
  const bytes = Buffer.from(text);
  // oxlint-disable-next-line node/no-sync -- Deterministic bounded synthetic table storage, never an application/native operation.
  const packed = gzipSync(bytes, { level: 9 });
  return `@"${packed.toString("base64")}",${String(bytes.length)},@"${digest(bytes)}",@"${digest(packed)}",${String(rows)},${String(columns)}`;
}
const load = (text: string): string => `EasyedaDiagnosticFixedTable.Load(${args(text)})`;
const i11 = (): string => JSON.stringify(`function(){"use strict";${I11}return true;}`);
function source(): string { return [currentPcbDiagnosticFixedTableNativeSource(), ...[JOIN, SCOPE].map(program => load(JSON.stringify(program))), load(i11()), load(i11()), load(i11()), load(i11()), load("unrelated complete bytes")].join("\n"); }
void test("combined three-prefix storage restores the complete input, repeats deterministically and preserves every original raw table hash", () => {
  const before = source(); const old = projectMain(before); const after = project(old);
  assert.equal(expand(after), before); assert.equal(project(before), after); assert.equal(project(after), after); assert.equal(expand(before), before); assert.ok(after.includes(BEGIN)); assert.ok(!after.includes("FIXED SELECTED MAIN PROGRAM DATA V1"));
  assert.equal(projectMain(before), old); assert.equal(expandMain(old), before); assert.equal(expand(old), old);
  const restored = expand(after); let count = 0;
  for (const match of restored.matchAll(original())) {
    const encoded = match[1]; assert.ok(encoded !== undefined); const packed = Buffer.from(encoded, "base64"); assert.equal(digest(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Independent original table reader verifies each full raw byte sequence and complete shape.
    const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(digest(raw), match[3]); const rows = raw.toString().split("\0"); assert.equal(rows.length, Number(match[5])); assert.ok(rows.every(row => row.split("\t").length === Number(match[6]))); count += 1;
  }
  assert.equal(count, [...before.matchAll(original())].length); assert.ok(count >= 7);
});
void test("mixed old Main and new inverse blocks expand separately before deterministic combined projection", () => {
  const recordCall = load(i11()); const before = `${currentPcbDiagnosticFixedTableNativeSource()}\n${load(JSON.stringify(JOIN))}\n${recordCall}`; const old = projectMain(before), projected = project(before);
  const from = projected.indexOf(BEGIN), through = projected.indexOf(END) + END.length; assert.ok(from !== -1 && through > from); const block = projected.slice(from, through + 1);
  const selected = [...projected.matchAll(stored())].find(match => match[8] === digest(Buffer.from(i11()))); assert.ok(selected !== undefined);
  const mixed = block + old.replace(recordCall, selected[0]); assert.equal(expand(mixed), old); assert.equal(expandMain(expand(mixed)), before); assert.equal(project(mixed), projected);
});
void test("missing or duplicated markers, altered decoder code, partial calls and expanded hash/length drift refuse", () => {
  const projected = project(source());
  for (const changed of [projected.replace("expandedLength>65536", "expandedLength>65537"), projected.replace(END, ""), `${projected}\n${BEGIN}`, "EasyedaFootprintInverseProgramData.Load("]) { assert.throws(() => expand(changed), /FOOTPRINT_INVERSE_PROGRAM_STORAGE/u); }
  const match = stored().exec(projected); assert.ok(match !== null && match[7] !== undefined && match[8] !== undefined);
  for (const changed of [match[0].replace(match[8], "0".repeat(64)), match[0].replace(`,${match[7]},@"`, ',65537,@"')]) { assert.throws(() => expand(projected.replace(match[0], changed)), /FOOTPRINT_INVERSE_PROGRAM_STORAGE/u); }
});
void test("correctly hashed reduced corruption cannot change expanded data, token catalogue or table shape", () => {
  const projected = project(source()); const match = stored().exec(projected); assert.ok(match !== null && match[1] !== undefined && match[5] !== undefined && match[6] !== undefined && match[7] !== undefined && match[8] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Corruption has valid reduced hashes and must still fail the original expanded contract.
  const text = gunzipSync(Buffer.from(match[1], "base64"), { maxOutputLength: 65_536 }).toString();
  for (const changed of [text.replace(/__footprint_inverse_fixed_\d+__/u, "__footprint_inverse_fixed_3__"), `${text}changed`, `${text}\0extra-row`, `${text}\textra-column`]) {
    const call = `EasyedaFootprintInverseProgramData.Load(${args(changed, Number(match[5]), Number(match[6]))},${match[7]},@"${match[8]}")`;
    assert.throws(() => expand(projected.replace(match[0], call)), /FOOTPRINT_INVERSE_PROGRAM_STORAGE/u);
  }
});
void test("64 KiB raw and expanded bounds remain exact with compressible oversized input", () => {
  const prefix = i11(); const full = prefix + "x".repeat(65_536 - Buffer.byteLength(prefix)); const before = `${currentPcbDiagnosticFixedTableNativeSource()}\n${load(full)}`;
  assert.equal(expand(project(before)), before); assert.throws(() => project(`${currentPcbDiagnosticFixedTableNativeSource()}\n${load(`${full}x`)}`), /FOOTPRINT_INVERSE_PROGRAM_STORAGE/u);
  assert.equal(project("unrelated source without fixed tables"), "unrelated source without fixed tables");
});
