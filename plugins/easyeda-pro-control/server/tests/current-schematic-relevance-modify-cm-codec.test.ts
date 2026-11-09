/** Decode emitted passive tables independently; no native owner is created. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicRelevanceModifyCmNativeSource as native } from "../src/current-schematic-relevance-modify-cm-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyCmCommand as validate } from "../src/current-schematic-relevance-modify-cm-protocol.ts";
import { currentSchematicRelevanceModifyCmCases as cases, currentSchematicRelevanceModifyCmTemplate as template } from "../src/current-schematic-relevance-modify-cm-wire.ts";
import { currentSchematicRelevanceModifyWorkerPrograms as worker } from "../src/current-schematic-relevance-modify-worker-native.ts";

function table(source: string, name: string): readonly (readonly string[])[] {
  const match = new RegExp(`string\\[\\]\\[\\] ${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([A-Za-z\\d+/=]+)",([1-9]\\d*),@"([a-f\\d]{64})",@"([a-f\\d]{64})",([1-9]\\d*),([1-9]\\d*)\\);`, "u").exec(source); assert.ok(match?.[1] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decode only a bounded in-memory immutable table; no file or native actor is involved.
  const raw = gunzipSync(Buffer.from(match[1], "base64"), { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]); assert.equal(createHash("sha256").update(Buffer.from(match[1], "base64")).digest("hex"), match[4]); return raw.toString().split("\0").map(row => row.split("\t"));
}
void test("grouped CM graph tables reconstruct all exact CDP bytes with distinct original handles and shared worker programs", () => {
  const source = native(); const rows = table(source, "Rows"); const programs = [...worker()]; assert.equal(rows.length, 33); assert.equal(REQUESTS.total, REQUESTS.reads + REQUESTS.helpers); assert.equal(REQUESTS.controls, 0);
  const localRows: (readonly string[])[] = []; for (let index = 0; source.includes(`string[][] OwnProgramsGroup${String(index)}=`); index += 1) { localRows.push(...table(source, `OwnProgramsGroup${String(index)}`)); } assert.equal(localRows.length, 24);
  for (const row of localRows) { const program: unknown = JSON.parse(row[1] ?? ""); assert.ok(typeof program === "string"); programs[Number(row[0])] = program; }
  const smoke = /VerifySmoke\(Rows,EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\),Encode,Need\)/u.exec(source); assert.ok(smoke?.[1] !== undefined); const hashes = Buffer.from(smoke[1], "base64");
  for (const [index, original] of cases().entries()) {
    const command = validate({ ...original, params: { ...original.params, ...(original.method === "Debugger.evaluateOnCallFrame" ? { callFrameId: "original_frame" } : { objectId: "original_receiver" }), ...(original.method === "Runtime.callFunctionOn" ? { arguments: original.params.arguments.map((_argument, argumentIndex) => ({ objectId: `original_argument${String(argumentIndex)}` })) } : {}) } });
    const row = rows[index]; assert.ok(row?.[3] !== undefined); const fixed = template(command);
    let expanded = row[3].replaceAll(/"__schematic_modifycm_program(\d+)__"/gu, (_value, raw: string) => { const program = programs[Number(raw)]; assert.ok(program !== undefined); return JSON.stringify(program); });
    for (const name of fixed.names) { const value = fixed.values[name]; assert.ok(value !== undefined); expanded = expanded.replaceAll(`__schematic_modifycm_${name}__`, value); }
    assert.equal(expanded, JSON.stringify({ method: command.method, params: command.params }));
    const message = `${JSON.stringify({ id: 83, method: original.method, params: original.params, sessionId: "original_ui" })}\0`; assert.deepEqual(createHash("sha256").update(message).digest(), hashes.subarray(index * 32, (index + 1) * 32));
    assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
  }
});
