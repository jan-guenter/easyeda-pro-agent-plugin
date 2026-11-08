/** Actual fixed Main codebooks, expanded entirely before comparison. No native
 * compiler, inspector, owner, app or generated artifact is used here. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync, gzipSync } from "node:zlib";
import { currentPcbDiagnosticFixedTableNativeSource } from "../src/current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaMainHistoryNativeSource } from "../src/current-pcb-via-main-history-native-fragment.ts";
import { currentSelectedFileMainSqlFenceNativeSource } from "../src/current-selected-file-main-sql-fence-native.ts";
import { expandCurrentSelectedMainNativePrograms as expand, projectCurrentSelectedMainNativePrograms as project } from "../src/current-selected-main-native-program-storage.ts";

const source = (): string => [currentPcbDiagnosticFixedTableNativeSource(), currentSelectedFileMainSqlFenceNativeSource(), currentPcbViaMainHistoryNativeSource()].join("\n");
const stored = (): RegExp => /EasyedaSelectedMainProgramData\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+),(\d+),@"([a-f\d]{64})"\)/u;
const digest = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
void test("fixed Main JOIN and SCOPE storage restores every original compiler byte and remains idempotent", () => {
  const original = source(), projected = project(original);
  assert.ok(Buffer.byteLength(projected) < Buffer.byteLength(original)); assert.ok(projected.includes("// BEGIN FIXED SELECTED MAIN PROGRAM DATA V1"));
  assert.equal(expand(projected), original); assert.equal(project(projected), projected); assert.equal(expand(original), original);
  assert.ok(projected.split("EasyedaSelectedMainProgramData.Load(").length > 10);
  for (const label of ["VerifySmoke", "Runtime.callFunctionOn", "Debugger.setBreakpoint", "Need(id>0"]) {
    assert.equal(projected.split(label).length, original.split(label).length, label);
  }
});
void test("opaque storage corruption, missing/duplicate markers and changed decoder code refuse", () => {
  const projected = project(source());
  assert.throws(() => expand(projected.replace("expandedLength>65536", "expandedLength>65537")), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  assert.throws(() => expand(`${projected}\n// BEGIN FIXED SELECTED MAIN PROGRAM DATA V1`), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  assert.throws(() => expand(projected.replace("// END FIXED SELECTED MAIN PROGRAM DATA V1", "")), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  assert.throws(() => expand("EasyedaSelectedMainProgramData.Load("), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  const match = stored().exec(projected); assert.ok(match !== null && match[8] !== undefined);
  const badHash = match[0].replace(match[8], "0".repeat(64)), badLength = match[0].replace(`,${String(match[7])},@"`, ',65537,@"');
  assert.throws(() => expand(projected.replace(match[0], badHash)), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  assert.throws(() => expand(projected.replace(match[0], badLength)), /SELECTED_MAIN_PROGRAM_STORAGE/u);
});
void test("a correctly hashed reduced table cannot introduce another token, shape or expanded payload", () => {
  const projected = project(source()); const match = stored().exec(projected); assert.ok(match !== null);
  const encoded = match[1]; const rows = match[5]; const columns = match[6]; const originalLength = match[7]; const originalHash = match[8];
  assert.ok(encoded !== undefined && rows !== undefined && columns !== undefined && originalLength !== undefined && originalHash !== undefined);
  // oxlint-disable-next-line node/no-sync -- Bounded deterministic immutable test data; no files or native execution.
  const text = gunzipSync(Buffer.from(encoded, "base64"), { maxOutputLength: 65_536 }).toString("utf8");
  for (const changed of [text.replace("__selected_main_fixed_0__", "__selected_main_fixed_2__"), `${text}changed`]) {
    const bytes = Buffer.from(changed);
    // oxlint-disable-next-line node/no-sync -- The hostile payload deliberately has valid reduced hashes and must still fail old expanded invariants.
    const packed = gzipSync(bytes, { level: 9 });
    const call = `EasyedaSelectedMainProgramData.Load(@"${packed.toString("base64")}",${String(bytes.length)},@"${digest(bytes)}",@"${digest(packed)}",${rows},${columns},${originalLength},@"${originalHash}")`;
    assert.throws(() => expand(projected.replace(match[0], call)), /SELECTED_MAIN_PROGRAM_STORAGE/u);
  }
});
