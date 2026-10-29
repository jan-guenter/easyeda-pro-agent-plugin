/** Synthetic encoding only. The separate create grammar is never admitted by
 * the installed read-only route and no native lifecycle is launched. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../src/current-footprint-copy-create-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS as LIMITS, captureCurrentFootprintCopyNativeCreateReply, currentFootprintCopyNativeCreateWire } from "../src/current-footprint-copy-native-create-wire.ts";
import { currentFootprintCopyCreateClockNativeSource, currentFootprintCopyNativeCreateNativeSource, currentFootprintCopyNativeCreateTemplate } from "../src/current-footprint-copy-native-create-native.ts";
import { currentFootprintCopyExecutionGenerationSchema } from "../src/current-footprint-copy-execution.ts";
import { currentFootprintCopyExecutionStartupWire, currentFootprintCopyPreparationWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET as BUDGET } from "../src/current-footprint-copy-create-clock-budget.ts";

function sample(): { method: string; sessionId: string; params: Record<string, unknown> & { arguments: unknown[] } } {
  return { method: "Runtime.callFunctionOn", sessionId: "worker", params: { objectId: "project",
    functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: ["bus", "manager", "consistency", "constructors", "methods"].map(objectId => ({ objectId })),
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true,
    generatePreview: false, throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
}
function complete(): ReturnType<typeof sample> {
  const command = sample(); command.params.arguments = [...command.params.arguments,
    { value: "1".repeat(64) }, { value: JSON.stringify({ uuid: "a".repeat(16), path: "1".repeat(64), isProject: true, docType: 4,
      title: "Copy", display_title: "Copy", description: "Ω ".repeat(5000), custom_tags: '["x"]', source: "", version: "" }) }];
  return command;
}
void test("separate fixed create grammar accepts exact data only and remains excluded from preparation and route owners", () => {
  const command = complete(), wire = currentFootprintCopyNativeCreateWire(JSON.stringify(command), 9);
  assert.equal(wire.request["action"], "footprint-copy-native-create"); assert.equal(wire.command.id, 9);
  assert.equal(Object.hasOwn(wire.request, "sessionId"), false); assert.equal(wire.request["arg4ObjectId"], "methods");
  assert.throws(() => currentFootprintCopyPreparationWire(command, 9));
  assert.throws(() => currentFootprintCopyExecutionStartupWire(command, 9));
  for (const changed of [{ ...command, sessionId: "worker\n" }, { ...command, extra: true },
    { ...command, params: { ...command.params, functionDeclaration: "async function(){return true;}" } },
    { ...command, params: { ...command.params, awaitPromise: false } },
    { ...command, params: { ...command.params, throwOnSideEffect: true } }]) {
    assert.throws(() => currentFootprintCopyNativeCreateWire(JSON.stringify(changed), 9));
  }
  assert.throws(() => currentFootprintCopyNativeCreateWire(`${JSON.stringify(command)}\n`, 9));
  assert.throws(() => currentFootprintCopyNativeCreateWire(command, 9));
});
void test("native create packed template matches the immutable command and retains native bounds and original-session selection", () => {
  const source = currentFootprintCopyNativeCreateNativeSource();
  const encoded = /FromBase64String\("([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1];
  assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- This bounded in-memory fixed template is synthetic encoding evidence only.
  const bytes = gunzipSync(Buffer.from(encoded, "base64"));
  assert.equal(bytes.toString(), currentFootprintCopyNativeCreateTemplate());
  assert.ok(source.includes(createHash("sha256").update(bytes).digest("hex")));
  assert.ok(source.includes("stream.ReadByte()==-1")); assert.ok(source.includes("fields.Count==8"));
  assert.ok(source.includes('Field("sessionId",originalWorkerSession)')); assert.ok(source.includes("<=81920"));
});
void test("native create smoke uses ASCII C# literals while preserving its exact Unicode argument bytes", () => {
  const source = currentFootprintCopyNativeCreateNativeSource();
  assert.equal(Buffer.byteLength(source), source.length);
  assert.equal(Buffer.from(source).some(byte => byte > 0x7F), false);
  assert.ok(source.includes(String.raw`\u03a9`));
  const literal = /fields\.Add\("createArgumentJson",("(?:\\.|[^"\\])*")\);/u.exec(source)?.[1];
  assert.ok(literal !== undefined);
  const raw: unknown = JSON.parse(literal); assert.ok(typeof raw === "string");
  const argument: unknown = JSON.parse(raw);
  assert.ok(argument !== null && typeof argument === "object" && "title" in argument && "description" in argument);
  assert.equal(argument.title, 'Copy " Ω'); assert.equal(argument.description, "line\nslash\\");
});
void test("native create refuses oversized fully escaped helper envelopes before an otherwise valid command can be sent", () => {
  const command = complete();
  command.params["objectId"] = "o".repeat(256);
  command.params.arguments = command.params.arguments.map((item, index) => index < 5 ? { objectId: String(index).repeat(256) } : item);
  const item = command.params.arguments[6];
  assert.ok(item !== null && typeof item === "object" && "value" in item && typeof item.value === "string");
  const value: unknown = JSON.parse(item.value);
  assert.ok(value !== null && typeof value === "object" && "description" in value && typeof value.description === "string");
  value.description = "a".repeat(20_000);
  item.value = JSON.stringify(value);
  const accepted = currentFootprintCopyNativeCreateWire(JSON.stringify(command), 2_147_483_647);
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...accepted.request, id: "f".repeat(32) })}\n`;
  assert.ok(Buffer.byteLength(envelope) <= LIMITS.helperEnvelopeBytes);
  assert.ok(envelope.length < LIMITS.helperEnvelopeBytes);
  // Both are valid arguments below 65KiB and commands below 80KiB.
  // Nested escaping and multibyte UTF-8 exceed the actual helper cap.
  for (const description of ['"'.repeat(9000), "Ω".repeat(17_000)]) {
    value.description = description;
    item.value = JSON.stringify(value);
    const serialized = JSON.stringify(command);
    assert.ok(Buffer.byteLength(serialized) <= LIMITS.commandBytes);
    assert.ok(Buffer.byteLength(JSON.stringify(value)) <= LIMITS.argumentsBytes);
    assert.throws(() => currentFootprintCopyNativeCreateWire(serialized, 2_147_483_647), /FOOTPRINT_COPY_NATIVE_CREATE_HELPER_ENVELOPE/u);
  }
});
void test("separate native create-clock ledger keeps create offset13 and68-ID accounting distinct from67-clock observation", () => {
  const source = currentFootprintCopyCreateClockNativeSource();
  const maximumFirst = BUDGET.maximumNormalId - BUDGET.total + 1;
  assert.ok(source.includes("ClockNormal=49,ClockCleanup=18,ArmPrefix=13,Requests=68"));
  assert.ok(source.includes("id==First+ArmPrefix&&Normal==ArmPrefix&&Cleanup==0"));
  assert.ok(source.includes("id==First+Normal+Cleanup+(CreateId==0?0:1)"));
  assert.ok(source.includes("CreateId!=0||Normal<ArmPrefix&&!cleanup"));
  assert.ok(source.includes("if(!Complete&&!originalGenerationEnded)"));
  assert.ok(source.includes(`new EasyedaFootprintCopyCreateClockLedger(${String(maximumFirst)})`));
  assert.ok(source.includes(`value.Next==${String(BUDGET.maximumNormalId + 1)}`));
  assert.ok(source.includes(`value.CreateId==${String(maximumFirst + BUDGET.createOffset)}`));
});
void test("copy execution generation rejects all final line terminators and overlong operation identifiers", () => {
  const generation = { profile: "private.current-footprint-copy-execution-generation.v1", purpose: "worker-startup-footprint-copy209",
    operationId: "footprint-copy-original", bindingSha256: "a".repeat(64) };
  assert.ok(currentFootprintCopyExecutionGenerationSchema.safeParse(generation).success);
  for (const suffix of ["\n", "\r", "\r\n", "\u2028", "\u2029", "-".repeat(100)]) {
    assert.equal(currentFootprintCopyExecutionGenerationSchema.safeParse({ ...generation, operationId: generation.operationId + suffix }).success, false);
  }
});
void test("native create result capture preserves large primitive acknowledgments and never evaluates hostile getters", () => {
  const value = JSON.stringify({ success: true, result: { owner: "Ω".repeat(20_000) } });
  assert.equal(captureCurrentFootprintCopyNativeCreateReply({ result: { type: "string", value } }), value);
  let calls = 0;
  const hostile = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { calls += 1; throw new Error("getter"); } });
  for (const input of [hostile, new Proxy({}, { ownKeys(): never { calls += 1; throw new Error("proxy"); } }),
    { result: { type: "string", value }, exceptionDetails: {} }, { result: { type: "string", value: "Ω".repeat(1_048_577) } }]) {
    assert.throws(() => captureCurrentFootprintCopyNativeCreateReply(input), /FOOTPRINT_COPY_NATIVE_CREATE_REPLY/u);
  }
  assert.equal(calls, 0);
});
