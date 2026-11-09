/** Decode generated immutable tables in Node. This does not compile or run
 * C#, allocate a native owner or send any application/transport request. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { currentSchematicRelevanceModifyWorkerCases as cases, currentSchematicRelevanceModifyWorkerTemplate as template, currentSchematicRelevanceModifyWorkerWire as wire } from "../src/current-schematic-relevance-modify-worker-wire.ts";
import { currentSchematicRelevanceModifyWorkerSource as source } from "../src/current-schematic-relevance-modify-worker-native.ts";
import { currentSchematicRelevanceSdkGatePrograms as bodyPrograms, currentSchematicRelevanceNormalCommandUiNativeSource as bodySource } from "../src/current-schematic-relevance-normal-command-ui-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS as CALLS, validateCurrentSchematicRelevanceModifyWorkerCommand as validate } from "../src/current-schematic-relevance-modify-worker-protocol.ts";
import type { CurrentSchematicRelevanceModifyWorkerCommand as Command } from "../src/current-schematic-relevance-modify-worker-protocol.ts";

import { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource } from "../src/current-schematic-relevance-display-helper-source-catalogue.ts";

function hash(value: Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
/** Substitute deterministic original-handle markers in every fixed worker
 * variant, then revalidate it so the codec test cannot introduce extra fields. */
function retainedHandles(command: Command): Command {
  if (command.phase === "modify-worker-source") { return validate({ ...command, params: { ...command.params, scriptId: "original_scriptId" } }); }
  if (command.phase === "modify-worker-literal") { return validate({ ...command, params: { ...command.params, uniqueContextId: "original_uniqueContextId" } }); }
  if (command.phase === "modify-worker-properties") { return validate({ ...command, params: { ...command.params, objectId: "original_objectId" } }); }
  return validate({ ...command, params: { ...command.params, objectId: "original_objectId", arguments: command.params.arguments.map((_argument, index) => ({ objectId: `original_argument${String(index)}` })) } });
}
/** Decode one fixed generated table after checking its packed/raw hashes,
 * byte ceiling and complete row/column counts. This never executes C#. */
function table(code: string, name: string): readonly (readonly string[])[] {
  const pattern = new RegExp(`${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([^"]*)",(\\d+),@"([a-f0-9]{64})",@"([a-f0-9]{64})",(\\d+),(\\d+)\\);`, "u"); const match = pattern.exec(code);
  assert.ok(match !== null); const [packedText, size, rawHash, packedHash, count, columns] = match.slice(1); assert.ok(packedText !== undefined);
  const packed = Buffer.from(packedText, "base64"); assert.equal(hash(packed), packedHash);
  // oxlint-disable-next-line node/no-sync -- Fixed bounded source table decoding is an inert build regression, never a transport or application read.
  const raw = gunzipSync(packed); assert.equal(raw.length, Number(size)); assert.ok(raw.length <= 65_536); assert.equal(hash(raw), rawHash);
  const rows = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(count)); for (const row of rows) { assert.equal(row.length, Number(columns)); } return rows;
}
void test("passive wire exposes only four fixed variants and retained-handle fields", () => {
  const commands = cases(); assert.equal(commands.length, CALLS.length + 3); assert.deepEqual([...new Set(commands.map(row => row.phase))].toSorted(), ["modify-worker-call", "modify-worker-literal", "modify-worker-properties", "modify-worker-source"]);
  for (const command of commands) {
    if (command.phase === "modify-worker-literal") { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: command.params.expression }, "expression", command.params.expression); }
    else if (command.phase === "modify-worker-call") { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: `(${command.params.functionDeclaration})` }, "function", command.params.functionDeclaration); }
    const projected = wire(command, 83), row = template(command); assert.deepEqual(projected.command, command); assert.equal(projected.request["action"], "schematic-relevance-modify-worker"); assert.equal(projected.request["phase"], row.phase); assert.equal(projected.request["method"], command.method); assert.equal(projected.request["requestId"], 83);
    assert.ok(row.names.every(name => /^(?:scriptId|uniqueContextId|objectId|argument(?:10|[0-9]))$/u.test(name))); assert.equal(row.names.length, new Set(row.names).size); assert.deepEqual(Object.keys(projected.request).toSorted(), ["action", "requestId", "phase", "method", ...row.names].toSorted());
    for (const name of row.names) { assert.equal(row.values[name], "original_ref"); } assert.ok(Object.isFrozen(projected) && Object.isFrozen(row));
  }
  for (const id of [0, -1, -0, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648]) { assert.throws(() => wire(commands[0], id)); }
  assert.throws(() => wire({ phase: "modify-worker-call", method: "Debugger.resume", params: {} }, 1));
});
void test("generated worker class shares exact SDK programs and reconstructs every fixed CDP request byte-for-byte", () => {
  const code = source(); assert.equal(source(), code); assert.ok(code.includes("public static class EasyedaSchematicRelevanceModifyWorkerProtocol")); assert.ok(code.includes("JoinPrograms(EasyedaSchematicRelevanceSdkGateProtocol.Programs,OwnPrograms)"));
  const original = bodySource(); const begin = original.indexOf("public static class EasyedaSchematicRelevanceNormalCommandBodyProtocol{"), end = original.indexOf("public static class ", begin + 1); assert.ok(begin !== -1 && end > begin);
  const sdkBegin=original.indexOf("public static class EasyedaSchematicRelevanceSdkGateProtocol{"),sdkEnd=original.indexOf("public static class ",sdkBegin+1);assert.ok(sdkBegin!==-1&&sdkEnd>sdkBegin);
  const local = table(code, "OwnPrograms"), rows = table(code, "Rows"), shared = [...table(original.slice(begin, end), "Programs"),...table(original.slice(sdkBegin,sdkEnd),"OwnPrograms")]; assert.deepEqual(shared.map(row => JSON.parse(row[1] ?? "null") as unknown), bodyPrograms());
  const programs = new Map<string, string>(); for (const row of [...shared, ...local]) { const [index, program] = row; assert.ok(index !== undefined && program !== undefined && !programs.has(index)); programs.set(index, program); }
  assert.equal(programs.size, bodyPrograms().length + local.length); assert.ok(local.length > 0 && local.length < CALLS.length);
  for (const [index, command] of cases().entries()) {
    const supplied = retainedHandles(command); const row = rows[index], selected = template(supplied); assert.ok(row !== undefined); assert.deepEqual(row.slice(0, 3), [selected.phase, selected.method, selected.names.join(",")]);
    const raw = row[3]; assert.ok(raw !== undefined);
    const actual = raw.replaceAll(/"__schematic_modifyworker_([A-Za-z\d]+)__"/gu, (_match, name: string) => { if (name.startsWith("program")) { const program = programs.get(name.slice(7)); assert.ok(program !== undefined); return program; } assert.ok(selected.names.includes(name)); return JSON.stringify(selected.values[name]); });
    assert.equal(actual, JSON.stringify({ method: supplied.method, params: supplied.params })); assert.deepEqual(validate(supplied), supplied);
  }
});
