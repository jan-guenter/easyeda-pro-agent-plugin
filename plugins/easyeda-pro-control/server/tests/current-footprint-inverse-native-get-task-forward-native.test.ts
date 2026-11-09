/** Independently expand emitted native dictionaries. This runs no C# owner,
 * process, connected target or runtime Job and never enlarges a table bound. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { currentFootprintInverseNativeGetTaskForwardNativeSource as source } from "../src/current-footprint-inverse-native-get-task-forward-native.ts";
import { currentFootprintInverseGetSendNativeSource as historical } from "../src/current-footprint-inverse-get-send-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_LEGACY as LEGACY, currentFootprintInverseNativeGetTaskForwardCases as cases, currentFootprintInverseNativeGetTaskForwardNativeFrame as frame, currentFootprintInverseNativeGetTaskForwardTemplate as template, currentFootprintInverseNativeGetTaskForwardWire as wire } from "../src/current-footprint-inverse-native-get-task-forward-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";

/** Decode each immutable C# table independently of the production projector,
 * requiring exact compressed/plain hashes, byte counts and complete rows. */
function tables(text: string, maximum: number): readonly string[][] { const rows: string[][] = []; for (const match of text.matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)) { const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
    // oxlint-disable-next-line node/no-sync -- Fixed source dictionaries are decoded below their unchanged native ceilings.
    const raw = gunzipSync(packed, { maxOutputLength: maximum }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]); const selected = raw.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(selected.length, Number(match[5])); rows.push(...selected); } return rows; }
void test("all 39 emitted forwarding rows restore exact host CDP bytes under the existing dictionary and global bounds", () => {
  const own = tables(source(), 60_000); const old = tables(historical(), 65_536); const checker = old.find(row => row[0] === "fragment")?.[3]; assert.ok(checker !== undefined); assert.equal(own.length, 22);
  for (const command of cases()) { const legacy = command.method === "Runtime.callFunctionOn" && Object.hasOwn(LEGACY, command.role); const rows = legacy ? old : own; const prefix = legacy ? "get_send" : "native_get_task_forward"; const key = template(command).key; const selected = rows.find(row => row[0] === key); assert.ok(selected?.[2] !== undefined && selected[3] !== undefined); const bytes = Buffer.from(`${JSON.stringify(wire(command, 79, "original_ui"))}\0`); const fields = frame(bytes, command, "original_ui"); let text = selected[3]; for (const name of selected[2].split(",").filter(Boolean)) { text = text.replaceAll(JSON.stringify(`__${prefix}_${name}__`), JSON.stringify(fields[name])); } for (const row of rows.filter(item => item[0] === "program")) { assert.ok(row[1] !== undefined && row[3] !== undefined); text = text.replaceAll(JSON.stringify(`__${prefix}_program_${row[1]}__`), row[3].replaceAll("/*__INVERSE_GET_SEND_I11__*/", checker)); } assert.deepEqual(Buffer.from(`{"id":79,${text.slice(1, -1)},"sessionId":"original_ui"}\0`), Buffer.from(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`)); }
  assert.equal(PROFILE.renderer.total, 27_705); assert.equal(PROFILE.controls, 182_736); assert.equal(PROFILE.main.reproofs, 103_376); assert.equal(PROFILE.executionAuthorized, false); assert.equal(PROFILE.completeInverseReserved, false);
});
