/** Reconstruct the fixed return wire without allocating a native owner. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicRelevanceModifyReturnNativeSource, currentSchematicRelevanceModifyReturnPrograms } from "../src/current-schematic-relevance-modify-return-native.ts";
import { currentSchematicRelevanceModifyReturnCases, currentSchematicRelevanceModifyReturnTemplate } from "../src/current-schematic-relevance-modify-return-wire.ts";
import { currentSchematicRelevanceModifyReturnContinuationWire } from "../src/current-schematic-relevance-modify-return-continuation-wire.ts";
import { currentSchematicRelevanceModifyCmControlCases } from "../src/current-schematic-relevance-modify-cm-control-wire.ts";
import { currentSchematicRelevanceModifyCanvasPrograms } from "../src/current-schematic-relevance-modify-canvas-native.ts";
import { currentSchematicRelevanceModifyCanvasControlCases } from "../src/current-schematic-relevance-modify-canvas-control-wire.ts";

function table(source: string, name: string): readonly (readonly string[])[] {
 const match = new RegExp(`${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([A-Za-z0-9+/=]+)",(\\d+),@"([a-f0-9]{64})",@"([a-f0-9]{64})",(\\d+),(\\d+)\\);`, "u").exec(source); assert.ok(match?.[1] !== undefined);
 const packed = Buffer.from(match[1], "base64"); assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
 // oxlint-disable-next-line node/no-sync -- This strictly bounded immutable in-memory table has no filesystem, transport or owner effects.
 const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]);
 const rows = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(match[5])); for (const row of rows) { assert.equal(row.length, Number(match[6])); } return rows;
}

void test("return tables reconstruct every passive message while the wrapper refuses spent bodies and the Canvas timer resume", () => {
 const source = currentSchematicRelevanceModifyReturnNativeSource();
 const shared = currentSchematicRelevanceModifyCanvasPrograms();
 const programs = new Map<string, string>(shared.map((program, index) => [String(index), JSON.stringify(program)]));
 const names = [...source.matchAll(/string\[\]\[\] (OwnPrograms(?:Group\d+)?)=/gu)].map(match => { assert.ok(match[1] !== undefined); return match[1]; });
 for (const name of names) { for (const row of table(source, name)) { const [index, program] = row; assert.ok(index !== undefined && program !== undefined && !programs.has(index)); programs.set(index, program); } }
 assert.deepEqual([...programs.entries()].toSorted((a,b)=>Number(a[0])-Number(b[0])).map(([,program]) => createHash("sha256").update(program).digest("hex")), currentSchematicRelevanceModifyReturnPrograms().map(program=>createHash("sha256").update(JSON.stringify(program)).digest("hex")));
 const rows = table(source, "Rows"); const commands = currentSchematicRelevanceModifyReturnCases(); assert.equal(rows.length, commands.length);
 for (const [index, command] of commands.entries()) { const row = rows[index]; const fixed = currentSchematicRelevanceModifyReturnTemplate(command); assert.ok(row?.[3] !== undefined);
  const actual = row[3].replaceAll(/"__schematic_modifyreturn_([A-Za-z\d]+)__"/gu, (_match, name: string) => { if (name.startsWith("program")) { const program = programs.get(name.slice(7)); assert.ok(program !== undefined); return program; } assert.ok(fixed.names.includes(name)); return JSON.stringify(fixed.values[name]); }); assert.equal(actual, JSON.stringify({ method: command.method, params: command.params }));
  assert.equal(currentSchematicRelevanceModifyReturnContinuationWire(command, 83).request["action"], "schematic-relevance-modify-return");
 }
 for (const command of currentSchematicRelevanceModifyCmControlCases()) { const allowed = command.phase === "modify-cm-control-remove" || command.phase === "modify-cm-control-cancel-ticket" || command.phase === "modify-cm-control-batch-frame" || command.phase === "modify-cm-control-batch-remove" || command.phase === "modify-cm-control-frame" && command.role !== "remote" && command.role !== "batchCaller" || command.phase === "modify-cm-control-resume" && command.role !== "remote" && command.role !== "onChange" || command.phase === "modify-cm-control-batch-resume" && command.role !== "batch";
  if (allowed) { assert.equal(currentSchematicRelevanceModifyReturnContinuationWire(command, 83).request["action"], "schematic-relevance-modify-return"); } else { assert.throws(() => currentSchematicRelevanceModifyReturnContinuationWire(command, 83)); }
 }
 for (const command of currentSchematicRelevanceModifyCanvasControlCases()) { if (command.phase === "modify-canvas-control-frame" && command.role === "timer") { assert.equal(currentSchematicRelevanceModifyReturnContinuationWire(command, 83).request["action"], "schematic-relevance-modify-return"); } else { assert.throws(() => currentSchematicRelevanceModifyReturnContinuationWire(command, 83)); } }
});
