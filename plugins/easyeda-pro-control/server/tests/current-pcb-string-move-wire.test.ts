import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "../src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT } from "../src/current-pcb-string-commands.ts";
import { CURRENT_PCB_STRING_MOVE_ARGUMENT_COUNTS, CURRENT_PCB_STRING_MOVE_CALLS, CURRENT_PCB_STRING_MOVE_EFFECTS,
  CURRENT_PCB_STRING_MOVE_OBJECT_GROUP, CURRENT_PCB_STRING_MOVE_SEQUENCE } from "../src/current-pcb-string-move-runner.ts";

type Row = Record<string, unknown>;
const effects = CURRENT_PCB_STRING_MOVE_EFFECTS, group = CURRENT_PCB_STRING_MOVE_OBJECT_GROUP;
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function commands(): readonly Readonly<{ id: number; movePhase: string; method: string; params: Row; sessionId: string }>[] {
  return [{ id: 1, movePhase: "wrapper", method: "Runtime.evaluate", params: { ...effects,
    expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId: "original-context", returnByValue: false,
    objectGroup: group, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId: "original-page" },
  ...Object.entries(CURRENT_PCB_STRING_MOVE_CALLS).map(([phase, functionDeclaration]) => {
    const count = Object.entries(CURRENT_PCB_STRING_MOVE_ARGUMENT_COUNTS).find(([name]) => name === phase)?.[1]; assert.ok(count !== undefined);
    return { id: 1, movePhase: phase, method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope", functionDeclaration,
      arguments: Array.from({ length: count }, (_, index) => ({ objectId: `argument-${index}` })),
      returnByValue: phase === "sample" || phase === "startup", objectGroup: group }, sessionId: "original-page" };
  }),
  { id: 1, movePhase: "properties", method: "Runtime.getProperties",
    params: { objectId: "original-function", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }, sessionId: "original-page" },
  { id: 1, movePhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: group }, sessionId: "original-page" }];
}

void test("fixed move/startup wire reaches only String purpose and sends no program text", () => {
  for (const command of commands()) {
    const native = stringPrecreateNativeRequest(wire(command)); assert.equal(native["movePhase"], command.movePhase);
    assert.equal(native["sessionId"], "original-page"); assert.throws(() => diagnosticNativeRequest(wire(command)), /OUTBOUND/u);
    for (const field of ["expression", "functionDeclaration", "params", "arguments", "throwOnSideEffect", "objectGroup"]) {
      assert.equal(Object.hasOwn(native, field), false);
    }
    assert.equal(stringPrecreateNativeRequest(wire({ ...command, id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT }))["requestId"], CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT);
    assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT + 1 })), /OUTBOUND/u);
  }
});

void test("move wire rejects substituted programs, phases, effects, groups, arguments and extra metadata", () => {
  for (const command of commands()) {
    for (const patch of [{ movePhase: "unknown" }, { movePhase: command.movePhase.toUpperCase() }, { workerProducerPhase: "project" },
      { actorClockPhase: "ui" }, { sessionId: "s".repeat(129) }, { method: "Runtime.runIfWaitingForDebugger" }]) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, ...patch })), /OUTBOUND/u);
    }
    for (const patch of [{ objectGroup: "foreign" }, { throwOnSideEffect: false }, { awaitPromise: true }, { userGesture: true },
      { uniqueContextId: "bad/context" }, { accessorPropertiesOnly: true }]) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, params: { ...command.params, ...patch } })), /OUTBOUND/u);
    }
    if (command.method === "Runtime.callFunctionOn") {
      for (const patch of [{ functionDeclaration: "function(){return 1}" }, { arguments: [{ value: "caller-data" }] },
        { arguments: [{ objectId: "bad/handle" }] }, { returnByValue: command.params["returnByValue"] !== true }]) {
        assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, params: { ...command.params, ...patch } })), /OUTBOUND/u);
      }
    }
  }
  const first = commands()[0]; assert.ok(first !== undefined);
  assert.throws(() => stringPrecreateNativeRequest(Buffer.from(`${JSON.stringify(first)} \0`)), /OUTBOUND/u);
  assert.throws(() => stringPrecreateNativeRequest(Buffer.from(`{"id":1,${JSON.stringify(first).slice(1)}\0`)), /OUTBOUND/u);
});

void test("five native move programs, twelve-step grammar and original session/group checks match exports", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const programs = [["wrapper", CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION], ...Object.entries(CURRENT_PCB_STRING_MOVE_CALLS)];
  assert.equal(programs.length, 5);
  for (const [index, entry] of programs.entries()) {
    const [phase, program] = entry; assert.ok(phase !== undefined && program !== undefined);
    const packed = ["", "", "MoveProducerTwoFunction", "MoveProducerThreeFunction", "MoveProducerFourFunction"][index];
    if (packed !== undefined && packed !== "") {
      assert.ok(source.includes(`static readonly string MoveProducerProgram${String(index)}=${packed};`));
      assert.equal(readPackedNativeProgram(source, packed), program, phase);
    } else {
      const alias = ["ModelCallbackExpression", "ModelHandlerFunction"][index];
      assert.ok(alias !== undefined);
      assert.ok(source.includes(`static readonly string MoveProducerProgram${String(index)}=${alias};`));
      assert.equal(readPackedNativeProgram(source, index === 0 ? "ModelCallbackExpressionFunction" : "ModelHandlerFunction"), program, phase);
    }
    assert.ok(source.includes(createHash("sha256").update(program).digest("hex")));
    assert.ok(source.includes(`case "${phase}": return MoveProducerProgram${index};`));
  }
  const sequence = /static readonly string\[\] MoveProducerSequence=\{([^}]+)\};/u.exec(source)?.[1];
  assert.ok(sequence !== undefined); assert.deepEqual(JSON.parse(`[${sequence}]`) as unknown, CURRENT_PCB_STRING_MOVE_SEQUENCE);
  for (const check of ["VerifyMoveProducerProtocolSmoke();", "move-producer-purpose-smoke", "moveProducerStep>=12",
    "moveProducerReleased=true;moveProducerStep=12;", "sessionId!=moveProducerSession", "OptionalText(context)!=moveProducerContext",
    "moveProducerStep++;", "$owner.SendMoveProducer(", "'movePhase','moveArgument0','moveArgument1','moveArgument2'", "stringPrecreate?3309:103"]) {
    assert.ok(source.includes(check), check);
  }
  assert.ok(!source.includes("$request.arguments")); assert.ok(!source.includes("$request.functionDeclaration"));
});
