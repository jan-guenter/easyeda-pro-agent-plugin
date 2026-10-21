import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT } from "../src/current-pcb-string-commands.ts";
import { CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP, CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT,
  CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE } from "../src/current-pcb-string-worker-producer-commands.ts";
import { CurrentPcbStringWorkerProducerRunner } from "../src/current-pcb-string-worker-producer-runner.ts";
import { createCurrentPcbStringWorkerProducerResponder } from "./helpers/current-pcb-string-worker-producer-responder.ts";

type Row = Record<string, unknown>;
const EFFECTS = CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, GROUP = CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP;
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function commands(): readonly Readonly<{ id: number; workerProducerPhase: string; method: string; params: Row; sessionId: string }>[] {
  return [
    ...Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS).map(([phase, expression]) => ({ id: 1, workerProducerPhase: phase,
      method: "Runtime.evaluate", params: { ...EFFECTS, expression, uniqueContextId: "original-context", objectGroup: GROUP,
        returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false }, sessionId: "original-worker" })),
    ...Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS).map(([phase, functionDeclaration]) => {
      const signature = Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS).find(([key]) => key === phase)?.[1];
      assert.ok(signature !== undefined);
      return { id: 1, workerProducerPhase: phase, method: "Runtime.callFunctionOn", params: { ...EFFECTS, objectId: "scope", functionDeclaration,
        objectGroup: GROUP, returnByValue: signature.returnByValue, arguments: Array.from({ length: signature.count }, (_, index) => ({ objectId: `argument-${index}` })) },
      sessionId: "original-worker" };
    }),
    { id: 1, workerProducerPhase: "properties", method: "Runtime.getProperties",
      params: { objectId: "original-function", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }, sessionId: "original-worker" },
    { id: 1, workerProducerPhase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP }, sessionId: "original-worker" },
  ];
}

void test("worker tagged grammar reaches only String purpose and emits phase plus bounded handles, never code", () => {
  for (const command of commands()) {
    const flat = stringPrecreateNativeRequest(wire(command));
    assert.equal(flat["workerProducerPhase"], command.workerProducerPhase); assert.equal(flat["sessionId"], "original-worker");
    assert.throws(() => diagnosticNativeRequest(wire(command)), /OUTBOUND/u);
    for (const key of ["params", "expression", "functionDeclaration", "objectGroup", "arguments", "budget", "throwOnSideEffect"]) {
      assert.equal(Object.hasOwn(flat, key), false, key);
    }
    assert.equal(stringPrecreateNativeRequest(wire({ ...command, id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT }))["requestId"], CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT);
    assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, id: CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT + 1 })), /OUTBOUND/u);
  }
});

void test("worker grammar refuses phase/function mismatch, effects, context/group, argument and extra metadata substitutions", () => {
  for (const command of commands()) {
    for (const patch of [{ workerProducerPhase: "unknown" }, { workerProducerPhase: command.workerProducerPhase.toUpperCase() },
      { modelPhase: "properties" }, { actorClockPhase: "ui" }, { sessionId: "s".repeat(129) }, { method: "Runtime.runIfWaitingForDebugger" }]) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, ...patch })), /OUTBOUND/u);
    }
    for (const patch of [{ objectGroup: "foreign" }, { throwOnSideEffect: false }, { awaitPromise: true },
      { userGesture: true }, { accessorPropertiesOnly: true }, { uniqueContextId: "foreign/context" }]) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, params: { ...command.params, ...patch } })), /OUTBOUND/u);
    }
    if (command.method === "Runtime.callFunctionOn") {
      for (const patch of [{ functionDeclaration: "function(){return true}" }, { arguments: [{ value: "not a retained handle" }] },
        { arguments: [{ objectId: "foreign/handle" }] }, { returnByValue: command.params["returnByValue"] !== true }]) {
        assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, params: { ...command.params, ...patch } })), /OUTBOUND/u);
      }
    }
    if (command.method === "Runtime.evaluate") {
      assert.throws(() => stringPrecreateNativeRequest(wire({ ...command, params: { ...command.params, expression: "PROJECT" } })), /OUTBOUND/u);
    }
  }
  const first = commands()[0]; assert.ok(first !== undefined);
  assert.throws(() => stringPrecreateNativeRequest(Buffer.from(`${JSON.stringify(first)} \0`)), /OUTBOUND/u);
  assert.throws(() => stringPrecreateNativeRequest(Buffer.from(`{"id":1,${JSON.stringify(first).slice(1)}\0`)), /OUTBOUND/u);
});

void test("all 20 native programs, sequence, effects and fixed argument grammar match the reviewed exports", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const programs = [...Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS), ...Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS)];
  assert.equal(programs.length, 20);
  for (const [index, [phase, program]] of programs.entries()) {
    const encoded = new RegExp(`const string WorkerProducerProgram${index}=@"((?:""|[^"])*)";`, "u").exec(source)?.[1];
    assert.equal(encoded?.replaceAll('""', '"'), program, phase);
    assert.ok(source.includes(createHash("sha256").update(program).digest("hex")));
    assert.ok(source.includes(`case "${phase}": return WorkerProducerProgram${index};`));
  }
  const sequence = /static readonly string\[\] WorkerProducerSequence=\{([^}]+)\};/u.exec(source)?.[1];
  assert.ok(sequence !== undefined); assert.deepEqual(JSON.parse(`[${sequence}]`) as unknown, CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE);
  assert.equal(CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE.length, CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT);
  for (const [phase, signature] of Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS)) {
    assert.ok(source.includes(`case "${phase}": return ${signature.count};`));
  }
  for (const check of ["VerifyWorkerProducerProtocolSmoke();", "worker-producer-purpose-smoke", "worker-producer-sequence-smoke",
    'workerProducerStep>=58', 'workerProducerReleased=true;workerProducerStep=58;', 'sessionId!=workerProducerSession',
    'OptionalText(context)!=workerProducerContext', 'workerProducerStep++;', '$owner.SendWorkerProducer(',
    "'workerProducerPhase','workerArgument0','workerArgument1','workerArgument2','workerArgument3','workerArgument4','workerArgument5'"]) {
    assert.ok(source.includes(check), check);
  }
  assert.ok(!source.includes("$request.arguments")); assert.ok(!source.includes("$request.functionDeclaration"));
});

void test("synthetic native responder consumes the complete flattened worker grammar with retained real scope handles", async () => {
  const identity = { projectUuid: "e".repeat(64), branchUuid: "f".repeat(32), windowTabId: "original-window" };
  const responder = createCurrentPcbStringWorkerProducerResponder(identity, "worker-script-1");
  try {
    let guards = 0, requests = 0;
    const runner = new CurrentPcbStringWorkerProducerRunner({ assertCurrent: (): void => { guards += 1; }, request: (command): Promise<unknown> => {
      requests += 1; const { sessionId, ...tagged } = command;
      const request = stringPrecreateNativeRequest(wire({ id: requests, ...tagged, sessionId }));
      return Promise.resolve(responder.reply(request));
    } }, { sessionId: "worker-session-1", scriptId: "worker-script-1", uniqueContextId: "worker-context-1" }, identity);
    const result = await runner.observe(); assert.equal(requests, 58); assert.deepEqual(result.identity, identity);
    assert.equal(guards, 115);
    assert.equal(result.executionAuthorized, false); assert.equal(Object.keys(runner.requireOriginal(result)).length, 7);
  } finally { responder.close(); }
});
