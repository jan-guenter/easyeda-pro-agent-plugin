/* oxlint-disable import/max-dependencies -- Exact native parity covers all fixed common reader programs and both bounded pipe purposes. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP } from "../src/current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineCommand } from "../src/current-pcb-common-baseline-runner.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION } from "../src/current-pcb-common-metadata.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ, CURRENT_PCB_COMMON_PACKET_RESULT,
  CURRENT_PCB_COMMON_PACKET_SEEDS } from "../src/current-pcb-common-packet-program.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT } from "../src/current-pcb-string-commands.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "../src/current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "../src/current-pcb-diagnostic-model-program.ts";
import { CurrentPcbDiagnosticPipe, CurrentPcbStringPrecreatePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "../src/current-pcb-string-empty-assets.ts";
import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";

const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
function properties(objectId: string): CurrentPcbCommonBaselineCommand {
  return { commonPhase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
function commands(): readonly CurrentPcbCommonBaselineCommand[] {
  const seeds = [
    ["presentation-seed", CURRENT_PCB_COMMON_PACKET_SEEDS.presentation], ["rules-seed", CURRENT_PCB_COMMON_PACKET_SEEDS.rules],
    ["preference-seed", CURRENT_PCB_COMMON_PACKET_SEEDS.preference],
  ] as const;
  const packets = [
    ["packet-advance", CURRENT_PCB_COMMON_PACKET_ADVANCE], ["packet-read", CURRENT_PCB_COMMON_PACKET_READ],
    ["packet-result", CURRENT_PCB_COMMON_PACKET_RESULT],
  ] as const;
  return [
    { commonPhase: "wrapper", method: "Runtime.evaluate", params: { ...effects, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
      uniqueContextId: "context", objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false,
      timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } },
    properties("wrapper"), properties("wrapper-scopes"),
    { commonPhase: "handler", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "wrapper-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false } },
    properties("handler"), properties("handler-scopes"),
    { commonPhase: "constructors", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
      functionDeclaration: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common, returnByValue: false, arguments: [{ objectId: "wrapper" }] } },
    properties("constructors"), ...["Yme", "Nfe", "Epe", "GSe"].map(name => properties(name)),
    ...seeds.map(([commonPhase, functionDeclaration]): CurrentPcbCommonBaselineCommand => ({ commonPhase, method: "Runtime.callFunctionOn",
      params: { ...effects, objectId: "scope", functionDeclaration, objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, returnByValue: false,
        arguments: [{ objectId: "wrapper" }, { objectId: "constructors" }] } })),
    ...packets.map(([commonPhase, functionDeclaration]): CurrentPcbCommonBaselineCommand => ({ commonPhase, method: "Runtime.callFunctionOn",
      params: { ...effects, objectId: "original-packet", functionDeclaration, objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP,
        returnByValue: commonPhase !== "packet-advance" } })),
    { commonPhase: "assets", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
      functionDeclaration: CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION, returnByValue: true,
      arguments: [{ objectId: "wrapper" }, { objectId: "constructors" }] } },
    { commonPhase: "metadata", method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
      functionDeclaration: CURRENT_PCB_COMMON_METADATA_FUNCTION, returnByValue: true, arguments: [{ objectId: "wrapper" }] } },
    { commonPhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP } },
  ];
}
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

void test("common packet commands use fixed String transport phases without forwarding caller programs or groups", () => {
  const sequence = commands(); assert.equal(sequence.length, 21);
  for (const [index, { commonPhase, ...command }] of sequence.entries()) {
    const encoded = wire({ id: index + 1, ...command, sessionId: "original-page" });
    const flat = stringPrecreateNativeRequest(encoded);
    assert.equal(flat[commonPhase === "properties" || commonPhase === "handler" ? "modelPhase" : "commonPhase"], commonPhase);
    for (const key of ["functionDeclaration", "expression", "objectGroup", "params", "arguments", "budget"]) { assert.equal(Object.hasOwn(flat, key), false); }
    if (commonPhase !== "properties" && commonPhase !== "handler") { assert.throws(() => diagnosticNativeRequest(encoded), /OUTBOUND/u); }
    assert.throws(() => stringPrecreateNativeRequest(wire({ id: index + 1, ...command, commonPhase, sessionId: "original-page" })), /OUTBOUND/u);
    assert.deepEqual(stringPrecreateNativeRequest(wire({ id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, ...command, sessionId: "original-page" })),
      { ...flat, requestId: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT });
    assert.throws(() => stringPrecreateNativeRequest(wire({ id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT + 1, ...command, sessionId: "original-page" })), /OUTBOUND/u);
  }
});

void test("common fixed protocol refuses source, effect, argument, group and context substitutions", () => {
  for (const { commonPhase, ...command } of commands()) {
    const changes: Record<string, unknown>[] = [{ executionContextId: 1 }, { objectGroup: "foreign-group" }];
    if (command.method === "Runtime.evaluate" || command.method === "Runtime.callFunctionOn") {
      changes.push({ throwOnSideEffect: false }, { silent: false }, { awaitPromise: true }, { generatePreview: true }, { userGesture: true },
        { returnByValue: !command.params.returnByValue }, command.method === "Runtime.evaluate" ? { expression: "globalThis" } : { functionDeclaration: "function(){}" });
    }
    if (commonPhase !== "properties" && commonPhase !== "handler") {
      changes.push({ arguments: [] }, { arguments: [{ value: "wrapper" }] }, { arguments: [{ objectId: "wrapper" }, { objectId: "constructors" }, { objectId: "extra" }] });
    }
    for (const change of changes) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ id: 1, ...command, params: { ...command.params, ...change }, sessionId: "original-page" })), /OUTBOUND/u);
    }
  }
});

void test("common native adapter embeds exact historical and packet programs and retains fixed purpose and group", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  for (const [name, source] of Object.entries({ CommonConstructorsFunction: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common,
    CommonPresentationFunction: CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CommonRulesFunction: CURRENT_PCB_COMMON_RULES_FUNCTION,
    CommonPreferenceFunction: CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CommonAssetsFunction: CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION,
    CommonMetadataFunction: CURRENT_PCB_COMMON_METADATA_FUNCTION,
    CommonPresentationSeedFunction: CURRENT_PCB_COMMON_PACKET_SEEDS.presentation, CommonRulesSeedFunction: CURRENT_PCB_COMMON_PACKET_SEEDS.rules,
    CommonPreferenceSeedFunction: CURRENT_PCB_COMMON_PACKET_SEEDS.preference, CommonPacketAdvanceFunction: CURRENT_PCB_COMMON_PACKET_ADVANCE,
    CommonPacketReadFunction: CURRENT_PCB_COMMON_PACKET_READ, CommonPacketResultFunction: CURRENT_PCB_COMMON_PACKET_RESULT })) {
    const encoded = new RegExp(`const string ${name}=@"((?:""|[^"])*)";`, "u").exec(native)?.[1];
    const actual = ["CommonConstructorsFunction", "CommonAssetsFunction", "CommonPacketAdvanceFunction", "CommonPacketResultFunction", "CommonPresentationFunction", "CommonPreferenceFunction", "CommonRulesFunction", "CommonPreferenceSeedFunction", "CommonPresentationSeedFunction", "CommonRulesSeedFunction", "CommonMetadataFunction"].includes(name)
      ? readPackedNativeProgram(native, name) : encoded?.replaceAll('""', '"');
    assert.equal(actual, source, name);
    assert.ok(native.includes(createHash("sha256").update(source).digest("hex")));
  }
  assert.ok(native.includes('if(!stringPrecreate) throw Error("common-purpose");'));
  assert.ok(native.includes("if (-not $StringPrecreate) {throw 'pcb-diagnostic-common-purpose'}"));
  assert.ok(native.includes(`const string group="${CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP}";`));
  assert.ok(native.includes("$owner.SendCommonBaseline("));
});

void test("common pipe requires original retained page and worker and always reads the page session", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The real Writable completion callback is the boundary under test.
  const output = new Writable({ autoDestroy: false, write(chunk: unknown, _encoding, callback): void {
    assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk));
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Complete this synthetic byte write, never a native process request.
    callback();
  } });
  const pipe = new CurrentPcbStringPrecreatePipe(input, output);
  context.after(async () => {
    const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners();
  });
  assert.equal("observeCommonBaseline" in CurrentPcbDiagnosticPipe.prototype, false);
  pipe.start(); const command = commands()[0]; assert.ok(command !== undefined);
  await assert.rejects(pipe.observeCommonBaseline(command), /COMMON_PIPE_PURPOSE/u); assert.equal(sent.length, 0);
  const attach = pipe.attachTarget("page", event => { assert.equal(event.sessionId, "original-page"); }); input.write(wire({ id: 1, result: { sessionId: "original-page" } })); await attach;
  await assert.rejects(pipe.observeCommonBaseline(command), /COMMON_PIPE_PURPOSE/u); assert.equal(sent.length, 1);
  const workers = pipe.enableWorkerDiscovery(event => { assert.equal(event.method, "Target.attachedToTarget"); });
  input.write(wire({ method: "Target.attachedToTarget", sessionId: "original-page", params: { sessionId: "original-worker",
    targetInfo: { targetId: "worker", type: "worker", attached: true }, waitingForDebugger: false } }));
  input.write(wire({ id: 2, sessionId: "original-page", result: {} })); await workers;
  pipe.selectWorkerSession("original-worker");
  for (const [index, selected] of commands().entries()) {
    const id = index + 3, reply = pipe.observeCommonBaseline(selected);
    const encoded = sent.at(-1); assert.ok(encoded !== undefined);
    assert.equal(stringPrecreateNativeRequest(encoded)["sessionId"], "original-page");
    // This is a byte-transport test, not semantic graph acceptance. The fixed
    // Native polling path emits at most65536 bytes per transfer.
    const result = selected.commonPhase === "packet-result" ? { result: { type: "string", value: "\\".repeat(524_288) } } : { retained: "raw" };
    const encodedReply = wire({ id, sessionId: "original-page", result });
    if (selected.commonPhase === "packet-result") { assert.ok(encodedReply.length > 1024 * 1024); }
    for (let offset = 0; offset < encodedReply.length; offset += 65_536) { input.write(encodedReply.subarray(offset, offset + 65_536)); }
    assert.deepEqual(await reply, result);
  }
  assert.equal(sent.length, 23); assert.equal(input.destroyed, false); assert.equal(output.writableEnded, false);
  const presentation = commands().find(value => value.commonPhase === "packet-result"); assert.ok(presentation !== undefined);
  const tooLarge = pipe.observeCommonBaseline(presentation);
  const rejected = assert.rejects(tooLarge, /PIPE_FRAMING/u);
  const oversized = wire({ id: 24, sessionId: "original-page", result: { result: { type: "string", value: "\\".repeat(525_000) } } });
  for (let offset = 0; offset < oversized.length; offset += 65_536) { input.write(oversized.subarray(offset, offset + 65_536)); }
  await rejected;
  assert.equal(pipe.status().failureObservation?.request?.phase, "common-packet-result");
  assert.equal(input.destroyed, false); assert.equal(output.writableEnded, false);
});
