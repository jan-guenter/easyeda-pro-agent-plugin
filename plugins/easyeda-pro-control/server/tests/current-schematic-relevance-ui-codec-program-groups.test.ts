/** Program grouping changes storage only. Decode every bounded group and
 * reconstruct the exact immutable indexed rows without running a native owner. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicRelevanceUiCodecNativeSource as emit } from "../src/current-schematic-relevance-ui-codec-native-source.ts";

void test("oversized program pools split into bounded exact tables joined by the unchanged program helper", () => {
  const programs = Array.from({ length: 14 }, (_unused, index) => `function(){/*${String(index)}${"a".repeat(5000)}*/return ${String(index)};}`);
  const source = emit({ className: "EasyedaSchematicRelevanceGroupedProtocol", errorCode: "schematic-grouped-codec", tableError: "SCHEMATIC_GROUPED_FIXED_TABLE_BOUND", marker: "grouped", rows: [["frame", "Runtime.callFunctionOn", "", '{"method":"Runtime.callFunctionOn","params":{}}']], programs, programIndexes: programs.map((_program, index) => index + 76), sharedProgramClass: "EasyedaSchematicRelevanceModifyWorkerProtocol", exportPrograms: true, messages: ['{"id":83,"method":"Runtime.callFunctionOn","params":{},"sessionId":"original_ui"}\0'] });
  const pattern = /static readonly string\[\]\[\] OwnProgramsGroup(\d+)=EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),2\);/gu;
  const restored: string[][] = []; let groups = 0;
  for (const match of source.matchAll(pattern)) {
    assert.equal(Number(match[1]), groups); groups += 1; assert.ok(match[2] !== undefined);
    const packed = Buffer.from(match[2], "base64");
    // oxlint-disable-next-line node/no-sync -- Decompress bounded in-memory codebook data; no file or native actor is used.
    const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[3])); assert.ok(raw.length <= 65_536); assert.equal(createHash("sha256").update(raw).digest("hex"), match[4]); assert.equal(createHash("sha256").update(packed).digest("hex"), match[5]);
    const rows = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(match[6])); restored.push(...rows);
  }
  assert.equal(groups, 2); assert.deepEqual(restored, programs.map((program, index) => [String(index + 76), JSON.stringify(program)]));
  assert.ok(source.includes("static readonly string[][] OwnPrograms=EasyedaSchematicUiFixedCodec.JoinPrograms(OwnProgramsGroup0,OwnProgramsGroup1);"));
  assert.ok(source.includes("internal static readonly string[][] Programs=EasyedaSchematicUiFixedCodec.JoinPrograms(EasyedaSchematicRelevanceModifyWorkerProtocol.Programs,OwnPrograms);"));
  assert.throws(() => emit({ className: "EasyedaSchematicRelevanceGroupedProtocol", errorCode: "schematic-grouped-codec", tableError: "SCHEMATIC_GROUPED_FIXED_TABLE_BOUND", marker: "grouped", rows: [], messages: [], programs: ["x".repeat(65_536)] }), /SCHEMATIC_GROUPED_FIXED_TABLE_BOUND/u);
});
