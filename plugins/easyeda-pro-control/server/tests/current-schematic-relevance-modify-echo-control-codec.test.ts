/** Decode the emitted fixed table without executing C# or an owner. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { currentSchematicRelevanceModifyEchoControlCases as cases, currentSchematicRelevanceModifyEchoControlTemplate as template, currentSchematicRelevanceModifyEchoControlWire as wire } from "../src/current-schematic-relevance-modify-echo-control-wire.ts";
import { currentSchematicRelevanceModifyEchoControlNativeSource as native } from "../src/current-schematic-relevance-modify-echo-control-native.ts";
import { validateCurrentSchematicRelevanceModifyEchoControlCommand as validate } from "../src/current-schematic-relevance-modify-echo-control-protocol.ts";

function hash(value: Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
void test("every fixed worker/UI control has exact readonly flags, immutable points and a byte-identical native row", () => {
  const code = native(); assert.equal(native(), code); const match = /Rows=EasyedaDiagnosticFixedTable\.Load\(@"([^"]*)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\);/u.exec(code); assert.ok(match !== null);
  const encoded = match[1]; assert.ok(encoded !== undefined); const packed = Buffer.from(encoded, "base64"); assert.equal(hash(packed), match[4]);
  // oxlint-disable-next-line node/no-sync -- The emitted immutable table is inert compile-time data with the unchanged64KiB bound.
  const raw = gunzipSync(packed); assert.equal(raw.length, Number(match[2])); assert.ok(raw.length <= 65_536); assert.equal(hash(raw), match[3]); const rows = raw.toString().split("\0").map(value => value.split("\t")); const commands = cases(); assert.equal(rows.length, commands.length); assert.equal(rows.length, Number(match[5]));
  assert.ok(code.includes("Programs=EasyedaSchematicRelevanceNormalCommandBodyProtocol.Programs;")); assert.equal(code.includes("OwnPrograms="), false);
  for (const [index, original] of commands.entries()) {
    const params: Record<string, unknown> = { ...original.params };
    if (original.phase === "modify-echo-control-function") { params["objectId"] = "original_function"; }
    else if (original.phase === "modify-echo-control-possible") { params["start"] = { ...original.params.start, scriptId: "original_script" }; params["end"] = { ...original.params.end, scriptId: "original_script" }; }
    else if (original.phase === "modify-echo-control-point") { params["location"] = { ...original.params.location, scriptId: "original_script" }; }
    else if (original.phase === "modify-echo-control-frame") { params["callFrameId"] = "original_frame"; }
    else if (original.phase === "modify-echo-control-remove" || original.phase === "modify-echo-control-publication-remove") { params["breakpointId"] = "original_point"; }
    const command = validate({ ...original, params }); const selected = template(command); const row = rows[index]; assert.ok(row !== undefined && row.length === 4); assert.deepEqual(row.slice(0, 3), [selected.phase, selected.method, selected.names.join(",")]); const body = row[3]; assert.ok(body !== undefined);
    const restored = body.replaceAll(/"__schematic_echoctrl_([A-Za-z\d]+)__"/gu, (_match, name: string) => { assert.ok(selected.names.includes(name)); return JSON.stringify(selected.values[name]); }); assert.equal(restored, JSON.stringify({ method: command.method, params: command.params })); assert.equal(wire(command, 83).request["phase"], selected.phase);
    if (command.phase === "modify-echo-control-frame") { assert.throws(() => wire({ ...command, params: { ...command.params, throwOnSideEffect: false } }, 83)); }
    if (command.phase === "modify-echo-control-point") { assert.throws(() => wire({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }, 83)); }
  }
  assert.throws(() => wire(commands[0], 0)); assert.throws(() => wire({ phase: "modify-echo-control-resume", role: "caller-selected", method: "Debugger.resume", params: {} }, 83));
});
