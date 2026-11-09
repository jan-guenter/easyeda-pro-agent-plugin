/** New fresh-route programs and original source under an inert Inspector. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseNativeGetTaskSenderCases as cases, currentFootprintInverseNativeGetTaskSenderNativeFrame as native, currentFootprintInverseNativeGetTaskSenderTemplate as template, validateCurrentFootprintInverseNativeGetTaskSenderCommand as validate, currentFootprintInverseNativeGetTaskSenderWire as wire } from "../src/current-footprint-inverse-native-get-task-sender-protocol.ts";
import { currentFootprintInverseNativeGetTaskSenderNativeSource } from "../src/current-footprint-inverse-native-get-task-sender-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_PROGRAMS as P } from "../src/current-footprint-inverse-native-get-task-sender-programs.ts";

const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

void test("fresh sender grammar contains one fixed invocation and no resume or public-c route", () => {
  const commands = cases(); assert.equal(commands.length, 18); assert.equal(commands.filter(c => c.phase === "inverse-native-get-task-sender-invoke").length, 1);
  for (const command of commands) { const bytes = Buffer.from(`${JSON.stringify(wire(command, 79, "original_ui"))}\0`); assert.equal(native(bytes, command, "original_ui")["action"], "footprint-inverse-native-get-task-sender"); assert.throws(() => native(bytes, command, "foreign")); assert.throws(() => validate({ ...command, publicCall: "borrowed" })); assert.notEqual(command.method, "Debugger.resume"); if (command.method === "Runtime.callFunctionOn" && command.phase !== "inverse-native-get-task-sender-invoke") { assert.equal(command.params.throwOnSideEffect, true); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } })); }
    const row = template(command); let text = row.template; if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__native_get_task_sender_program_${"role" in command ? command.role : "invokeOnce"}__`), JSON.stringify("role" in command ? P[command.role] : P.invokeOnce)); } for (const name of row.names) { text = text.replace(JSON.stringify(`__native_get_task_sender_${name}__`), JSON.stringify(({projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16)} as Readonly<Record<string,string>>)[name] ?? "original_ref")); } assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
  } const source = currentFootprintInverseNativeGetTaskSenderNativeSource(); assert.equal(source, currentFootprintInverseNativeGetTaskSenderNativeSource()); assert.ok(source.includes("VerifyFootprintInverseNativeGetTaskSenderCodec")); assert.ok(source.includes("SendFootprintInverseNativeGetTaskSender") && source.includes("nativeGetLookupBound") && source.includes("nativeGetTaskStep!=84"));
});

void test("fresh task getter programs share only pinned immutable source and never select DEL or a caller endpoint", () => {
  for (const program of Object.values(P)) { assert.ok(!program.includes("/PrjDB/footprint/delete")); }
  assert.equal(P.queue.split("/PrjDB/footprint/getData").length, 2);
  const source = currentFootprintInverseNativeGetTaskSenderNativeSource();
  assert.match(source, /nativeGetTaskStep>=61&&!nativeGetTaskPrepared/u);
  assert.match(source, /fields\["scriptId"\] as string!=\(nativeGetTaskStep==0\?nqsUi:nqsManager\)/u);
});

void test("actual fixed native rows retain every complete method/params envelope and exact CDP byte hash", () => {
  const rows: string[][] = [];
  for (const match of currentFootprintInverseNativeGetTaskSenderNativeSource().matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)) {
    const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(sha(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Immutable fixed codec data is decoded under the same original bounded chunk ceiling.
    const bytes = gunzipSync(packed, { maxOutputLength: 60_000 }); assert.equal(bytes.length, Number(match[2])); assert.equal(sha(bytes), match[3]);
    const part = bytes.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(part.length, Number(match[5])); assert.ok(part.every(row => row.length === 4)); rows.push(...part);
  }
  assert.equal(rows.length, 30); const programs = new Map(rows.filter(row => row[0] === "program").map(row => [row[1], row[3]]));
  for (const command of cases()) {
    const packet = wire(command, 79, "original_ui"); const bytes = Buffer.from(`${JSON.stringify(packet)}\0`); const fields = native(bytes, command, "original_ui"); const selected = template(command); const row = rows.find(item => item[0] === selected.key); assert.ok(row !== undefined && row[3] !== undefined);
    let text = row[3]; assert.equal(text, selected.template); for (const name of selected.names) { text = text.replaceAll(JSON.stringify(`__native_get_task_sender_${name}__`), JSON.stringify(fields[name])); }
    for (const [role, program] of programs) { assert.ok(role !== undefined && program !== undefined); text = text.replaceAll(JSON.stringify(`__native_get_task_sender_program_${role}__`), program); }
    assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
    const actual = Buffer.from(`{"id":79,${text.slice(1, -1)},"sessionId":"original_ui"}\0`), expected = Buffer.from(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`); assert.deepEqual(actual, expected); assert.equal(sha(actual), sha(expected));
  }
});
