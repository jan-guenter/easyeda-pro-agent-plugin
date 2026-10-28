/** Synthetic encoding only. The separate create grammar is never admitted by
 * the installed read-only route and no native lifecycle is launched. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../src/current-footprint-copy-create-bindings.ts";
import { captureCurrentFootprintCopyNativeCreateReply, currentFootprintCopyNativeCreateWire } from "../src/current-footprint-copy-native-create-wire.ts";
import { currentFootprintCopyNativeCreateNativeSource, currentFootprintCopyNativeCreateTemplate } from "../src/current-footprint-copy-native-create-native.ts";
import { currentFootprintCopyExecutionGenerationSchema } from "../src/current-footprint-copy-execution.ts";
import { currentFootprintCopyExecutionStartupWire, currentFootprintCopyPreparationWire } from "../src/current-pcb-worker-startup-wire.ts";

function sample(): { method: string; sessionId: string; params: Record<string, unknown> & { arguments: unknown[] } } {
  return { method: "Runtime.callFunctionOn", sessionId: "worker", params: { objectId: "project",
    functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: ["bus", "manager", "consistency", "constructors", "methods"].map(objectId => ({ objectId })),
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true,
    generatePreview: false, throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
}
function complete(): ReturnType<typeof sample> {
  const command = sample(); command.params.arguments = [...command.params.arguments,
    { value: "1".repeat(64) }, { value: { uuid: "a".repeat(16), path: "1".repeat(64), isProject: true, docType: 4,
      title: "Copy", display_title: "Copy", description: "Ω ".repeat(5000), custom_tags: '["x"]', source: "", version: "" } }];
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
  const encoded = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1];
  assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- This bounded in-memory fixed template is synthetic encoding evidence only.
  const bytes = gunzipSync(Buffer.from(encoded, "base64"));
  assert.equal(bytes.toString(), currentFootprintCopyNativeCreateTemplate());
  assert.ok(source.includes(createHash("sha256").update(bytes).digest("hex")));
  assert.ok(source.includes("stream.ReadByte()==-1")); assert.ok(source.includes("fields.Count==8"));
  assert.ok(source.includes('Field("sessionId",originalWorkerSession)')); assert.ok(source.includes("<=81920"));
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
