import { expandCurrentPcbDiagnosticCSharpStorage } from "../src/current-pcb-diagnostic-csharp-storage.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gunzipSync } from "node:zlib";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";
import { CURRENT_SCHEMATIC_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_DISPLAY_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_DISPLAY_START_FUNCTION as START } from "../src/current-schematic-display-write-programs.ts";

void test("combined Via and schematic native generation stays idempotent with one dispatcher for each action", async () => {
  const original = expandCurrentPcbDiagnosticCSharpStorage(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"));
  const first = schematic(via(original)), second = schematic(via(first));
  assert.equal(second, first);
  for (const action of ["pcb-via-main-step", "schematic-display-native", "schematic-display-abort"]) {
    assert.equal(first.split(`        '${action}' {`).length, 2);
  }
  assert.ok(first.indexOf("        'schematic-display-native' {") < first.indexOf("        'pcb-via-main-step' {"));
  const start = first.indexOf("        'schematic-display-native' {"), stop = first.indexOf("        'pcb-via-main-step' {");
  const schematicBlock = first.slice(start, stop);
  const interleaved = first.replace(schematicBlock, "").replace("        'pcb-via-main-observe' {", `${schematicBlock}        'pcb-via-main-observe' {`);
  assert.equal(schematic(via(interleaved)), first);
  assert.throws(() => schematic(first.replace("        'schematic-display-native' {", "        'schematic-display-native' {\n        'schematic-display-native' {")), /SCHEMATIC_DISPLAY_NATIVE_DISPATCH_CHANGED/u);
});

void test("packed schematic literals restore exact original programs under the unchanged native decoder bound", async () => {
  const original = expandCurrentPcbDiagnosticCSharpStorage(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"));
  const source = schematic(via(original)); const expected: Readonly<Record<string, string>> = { Navigation: NAVIGATION, Stage: STAGE, Start: START };
  const rows = [...source.matchAll(/static readonly string SchematicDisplay(Start|Navigation|Stage)=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\);/gu)];
  assert.equal(rows.length, 3); const seen = new Set<string>();
  for (const row of rows) {
    const [, name, encoded, size, plainHash, packedHash] = row; assert.ok(name !== undefined && encoded !== undefined && size !== undefined);
    assert.equal(seen.has(name), false); seen.add(name); const packed = Buffer.from(encoded, "base64");
    // oxlint-disable-next-line node/no-sync -- Deterministic bounded in-memory restoration of the generated immutable program, with no filesystem or native call.
    const bytes = gunzipSync(packed, { maxOutputLength: 65_536 });
    assert.equal(bytes.length, Number(size)); assert.equal(bytes.toString("utf8"), expected[name]);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), plainHash); assert.equal(createHash("sha256").update(packed).digest("hex"), packedHash);
  }
  assert.equal(source.includes('SchematicDisplayNavigation=@"'), false); assert.ok(source.includes("public static void VerifySchematicDisplayProtocolSmoke()"));
});
