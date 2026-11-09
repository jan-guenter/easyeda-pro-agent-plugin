/** Decode immutable Canvas control bytes without executing a native owner. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicRelevanceModifyCanvasControlNativeSource } from "../src/current-schematic-relevance-modify-canvas-control-native.ts";
import { currentSchematicRelevanceModifyCanvasControlCases, currentSchematicRelevanceModifyCanvasControlTemplate } from "../src/current-schematic-relevance-modify-canvas-control-wire.ts";

import { currentSchematicRelevanceModifyCanvasNativeSource, currentSchematicRelevanceModifyCanvasPrograms } from "../src/current-schematic-relevance-modify-canvas-native.ts";
import { currentSchematicRelevanceModifyCmPrograms } from "../src/current-schematic-relevance-modify-cm-native.ts";
import { currentSchematicRelevanceModifyCanvasCases, currentSchematicRelevanceModifyCanvasTemplate } from "../src/current-schematic-relevance-modify-canvas-wire.ts";

/** Decode only bounded immutable generated tables, independently checking
 * packed/decoded hashes and shape before reconstructing the CDP messages. */
function table(source: string, name: string): readonly (readonly string[])[] {
 const match = new RegExp(`${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([A-Za-z0-9+/=]+)",(\\d+),@"([a-f0-9]{64})",@"([a-f0-9]{64})",(\\d+),(\\d+)\\);`, "u").exec(source); assert.ok(match?.[1] !== undefined);
 const packed = Buffer.from(match[1], "base64"); assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
 // oxlint-disable-next-line node/no-sync -- This strictly bounded immutable in-memory table has no filesystem, transport or owner effects.
 const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]);
 const rows = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(match[5])); for (const row of rows) { assert.equal(row.length, Number(match[6])); } return rows;
}
void test("passive Canvas tables share the original CM pool and reconstruct every helper, frame and opaque slot", () => {
 const source = currentSchematicRelevanceModifyCanvasNativeSource(); const shared = currentSchematicRelevanceModifyCmPrograms(); const programs = new Map<string, string>(shared.map((program, index) => [String(index), JSON.stringify(program)]));
 assert.ok(source.includes("JoinPrograms(EasyedaSchematicRelevanceModifyCmProtocol.Programs,OwnPrograms)"));
 const names = [...source.matchAll(/string\[\]\[\] (OwnProgramsGroup\d+)=/gu)].map(match => { assert.ok(match[1] !== undefined); return match[1]; }); assert.ok(names.length > 0);
 for (const name of names) { for (const row of table(source, name)) { const [index, program] = row; assert.ok(index !== undefined && program !== undefined && !programs.has(index)); programs.set(index, program); } }
 assert.deepEqual([...programs.values()].map(program => JSON.parse(program) as unknown), currentSchematicRelevanceModifyCanvasPrograms());
 const rows = table(source, "Rows"); const commands = currentSchematicRelevanceModifyCanvasCases(); assert.equal(rows.length, commands.length);
 for (const [index, command] of commands.entries()) { const row = rows[index], template = currentSchematicRelevanceModifyCanvasTemplate(command); assert.ok(row?.[3] !== undefined); assert.deepEqual(row.slice(0, 3), [template.phase, template.method, template.names.join(",")]);
  const actual = row[3].replaceAll(/"__schematic_modifycanvas_([A-Za-z\d]+)__"/gu, (_match, name: string) => { if (name.startsWith("program")) { const program = programs.get(name.slice(7)); assert.ok(program !== undefined); return program; } assert.ok(template.names.includes(name)); return JSON.stringify(template.values[name]); }); assert.equal(actual, JSON.stringify({ method: command.method, params: command.params }));
 }
});

void test("all forty Canvas packets reconstruct from fixed data and retain their distinct role hashes", () => {
 const source = currentSchematicRelevanceModifyCanvasControlNativeSource();
 const match = /string\[\]\[\] Rows=EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),4\);/u.exec(source); assert.ok(match?.[1] !== undefined);
 const packed = Buffer.from(match[1], "base64");
 // oxlint-disable-next-line node/no-sync -- Decode a bounded immutable table in memory; this performs no file, app or native-owner operation.
 const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]); assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
 const rows = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(rows.length, 40); assert.equal(rows.length, Number(match[5]));
 assert.ok(source.includes("Programs=EasyedaSchematicRelevanceModifyCmProtocol.Programs;"));
 const smoke = /VerifySmoke\(Rows,EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\),Encode,Need\)/u.exec(source); assert.ok(smoke?.[1] !== undefined); const hashes = Buffer.from(smoke[1], "base64");
 for (const [index, command] of currentSchematicRelevanceModifyCanvasControlCases().entries()) {
  const row = rows[index]; assert.ok(row?.[3] !== undefined); const fixed = currentSchematicRelevanceModifyCanvasControlTemplate(command); let expanded = row[3];
  for (const name of fixed.names) { const value = fixed.values[name]; assert.ok(value !== undefined); expanded = expanded.replaceAll(`__schematic_modifycanvascontrol_${name}__`, value); }
  assert.equal(expanded, JSON.stringify({ method: command.method, params: command.params }));
  const message = `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`; assert.deepEqual(createHash("sha256").update(message).digest(), hashes.subarray(index * 32, (index + 1) * 32));
 }
});

