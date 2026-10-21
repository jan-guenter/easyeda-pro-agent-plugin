import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS, CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP,
  CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT, CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE } from "../src/current-pcb-string-worker-producer-commands.ts";
import type { CurrentPcbStringWorkerProducerCommand } from "../src/current-pcb-string-worker-producer-commands.ts";
import { currentPcbStringWorkerProducerFailureDetail, requireOriginalCurrentPcbStringWorkerProducerFailureReplies,
  retainCurrentPcbStringWorkerProducerReply } from "../src/current-pcb-string-worker-producer-evidence.ts";
import { CurrentPcbStringWorkerProducerRunner, requireOriginalCurrentPcbStringWorkerProducerReplies } from "../src/current-pcb-string-worker-producer-runner.ts";
import { currentPcbStringWorkerProducerFixture } from "./helpers/current-pcb-string-worker-producer-fixture.ts";

const identity = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "synthetic-window" });
let fixtureNumber = 0;
interface Options { readonly failPhase?: string; readonly releaseFailure?: boolean; readonly loseAtRelease?: boolean;
  readonly lostInitially?: boolean; readonly setup?: string; readonly wrongScript?: boolean; readonly malformed?: string; readonly retainedBatch?: boolean }
async function fixture(options: Options = {}): Promise<Readonly<{
  runner: CurrentPcbStringWorkerProducerRunner; commands: CurrentPcbStringWorkerProducerCommand[];
  close: () => void; trapCalls: () => unknown; paused: () => boolean; lose: () => void; primary: Error;
}>> {
  fixtureNumber += 1; const filename = `worker-producer-${fixtureNumber}.js`;
  const commands: CurrentPcbStringWorkerProducerCommand[] = [], context = createContext({}, { name: filename });
  const primary = new Error("SYNTHETIC_CHANNEL_FAILURE"), session = new Session(); session.connect();
  let lost = options.lostInitially === true, paused = false, scriptId = "", uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === filename) { uniqueContextId = z.object({ uniqueId: z.string() }).parse(params.context).uniqueId; }
  });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === filename) { scriptId = params.scriptId; } });
  session.on("Debugger.paused", (): void => { paused = true; });
  await session.post("Runtime.enable"); await session.post("Debugger.enable");
  runInContext(currentPcbStringWorkerProducerFixture(options.retainedBatch), context, { filename, timeout: 1000 });
  if (options.setup !== undefined) { runInContext(options.setup, context); }
  assert.ok(scriptId.length > 0 && uniqueContextId.length > 0);
  const runner = new CurrentPcbStringWorkerProducerRunner({
    assertCurrent: (): void => { if (lost) { throw new Error("SYNTHETIC_ORIGINAL_OWNER_LOST"); } },
    request: async (command): Promise<unknown> => {
      commands.push(command); assert.equal(command.sessionId, "original-worker-session");
      assert.equal(Object.isFrozen(command.params), true);
      if (command.workerProducerPhase === options.failPhase) { throw primary; }
      if (command.workerProducerPhase === options.malformed) { return { result: { type: "string", value: '{"unexpected":true}' } }; }
      switch (command.method) {
        case "Runtime.evaluate": {
          assert.equal(command.params.expression, CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS[command.workerProducerPhase]);
          return session.post(command.method, command.params);
        }
        case "Runtime.callFunctionOn": {
          assert.equal(command.params.functionDeclaration, CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS[command.workerProducerPhase]);
          const signature = CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS[command.workerProducerPhase];
          assert.equal(command.params.arguments.length, signature.count); assert.equal(command.params.returnByValue, signature.returnByValue);
          return session.post(command.method, { ...command.params, arguments: [...command.params.arguments] });
        }
        case "Runtime.getProperties": { return session.post(command.method, command.params); }
        case "Runtime.releaseObjectGroup": {
          await session.post(command.method, command.params);
          if (options.loseAtRelease === true) { lost = true; }
          if (options.releaseFailure === true) { throw new Error("SYNTHETIC_RELEASE_FAILURE"); }
          return {};
        }
        default: { throw new Error("UNEXPECTED_WORKER_COMMAND"); }
      }
    },
  }, { sessionId: "original-worker-session", scriptId: options.wrongScript === true ? "foreign-script" : scriptId, uniqueContextId }, identity);
  return { runner, commands, close: (): void => { session.disconnect(); }, trapCalls: (): unknown => runInContext("trapCalls", context) as unknown,
    paused: (): boolean => paused, lose: (): void => { lost = true; }, primary };
}

void test("original worker collector executes the 58-command fixed grammar and retains seven exact samples", async () => {
  const state = await fixture();
  try {
    const observation = await state.runner.observe();
    assert.equal(state.commands.length, CURRENT_PCB_STRING_WORKER_PRODUCER_REQUEST_COUNT);
    assert.deepEqual(state.commands.map(command => command.workerProducerPhase), CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE);
    assert.equal(observation.originalRunnerIssued, true); assert.equal(observation.qualifiedCallbacks.length, 6);
    assert.equal(observation.hiddenCallbackReceiversVerified, false); assert.equal(observation.completePublishersVerified, false);
    assert.equal(observation.writeDestinationsContained, false); assert.equal(observation.queueCompletionVerified, false);
    assert.equal(observation.executionAuthorized, false); assert.equal(observation.atomicSnapshotVerified, false);
    assert.deepEqual(observation.gates.raw.isSyncing, { state: "absent", value: null });
    const replies = state.runner.requireOriginal(observation);
    assert.equal(Object.keys(replies).length, 7); assert.equal(replies.gates?.result.value.includes('"privateMode":false'), true);
    assert.equal(replies, requireOriginalCurrentPcbStringWorkerProducerReplies(observation));
    assert.throws(() => state.runner.requireOriginal(structuredClone(observation)));
    assert.throws(() => requireOriginalCurrentPcbStringWorkerProducerReplies(structuredClone(observation)));
    assert.ok(state.commands.filter(command => command.method === "Runtime.evaluate" || command.method === "Runtime.callFunctionOn")
      .every(command => command.params.throwOnSideEffect && !command.params.awaitPromise && !command.params.userGesture &&
        command.params.objectGroup === CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP));
    assert.equal(state.commands.at(-1)?.workerProducerPhase, "release");
    assert.equal(state.trapCalls(), 0); assert.equal(state.paused(), false);
    await assert.rejects(state.runner.observe()); assert.equal(state.commands.length, 58);
    state.lose(); assert.throws(() => state.runner.requireOriginal(observation), /OWNER_LOST/u);
    assert.throws(() => state.runner.requireOriginal(observation), /WORKER_PRODUCER_OBSERVATION/u);
    assert.equal(requireOriginalCurrentPcbStringWorkerProducerReplies(observation), replies);
  } finally { state.close(); }
});

void test("channel failure retains primary cause and prior raw samples separately from release failure", async () => {
  const state = await fixture({ failPhase: "structure-select", releaseFailure: true });
  try {
    await assert.rejects(state.runner.observe(), (error: unknown) => {
      assert.ok(error instanceof AggregateError); assert.equal(error.cause, state.primary); assert.equal(error.errors[0], state.primary);
      assert.equal(error.errors.length, 2);
      const detail = currentPcbStringWorkerProducerFailureDetail(error);
      assert.equal(detail?.phase, "structure-select"); assert.equal(detail.cleanup, "failed"); assert.equal(detail.requests, 21);
      assert.deepEqual(detail.retainedSamples, ["gates", "upload-structure"]);
      assert.equal(Object.keys(requireOriginalCurrentPcbStringWorkerProducerFailureReplies(error)).length, 2);
      assert.equal(currentPcbStringWorkerProducerFailureDetail(structuredClone(error)), null); return true;
    });
    assert.equal(state.commands.at(-1)?.workerProducerPhase, "release");
    const count = state.commands.length; await assert.rejects(state.runner.observe()); assert.equal(state.commands.length, count);
  } finally { state.close(); }
});

void test("a retained nonempty cooperation batch stays raw evidence, never inferred idle or completion", async () => {
  const state = await fixture({ retainedBatch: true, setup: "PROJECT.isSyncing=undefined" });
  try {
    const observation = await state.runner.observe();
    assert.equal(observation.cooperation.batchCount, 1);
    assert.deepEqual(observation.gates.raw.isSyncing, { state: "undefined", value: null });
    assert.equal(observation.queueCompletionVerified, false); assert.equal(observation.executionAuthorized, false);
    assert.equal(state.commands.length, 58); assert.equal(state.trapCalls(), 0);
  } finally { state.close(); }
});

void test("malformed sample, wrong script and foreign identity stop before later selectors with original cleanup", async () => {
  for (const options of [{ malformed: "cooperation" }, { wrongScript: true }, { setup: 'PROJECT._branchUuid="c".repeat(32)' }]) {
    const state = await fixture(options);
    try {
      await assert.rejects(state.runner.observe(), (error: unknown) => {
        const detail = currentPcbStringWorkerProducerFailureDetail(error);
        assert.equal(detail?.cleanup, "released"); assert.ok(detail.requests < 58); return true;
      });
      assert.equal(state.commands.at(-1)?.workerProducerPhase, "release"); assert.equal(state.trapCalls(), 0);
      assert.ok(!state.commands.some(command => command.workerProducerPhase === "upload-select"));
    } finally { state.close(); }
  }
});

void test("initial and release-await owner loss cannot issue an observation or retry", async () => {
  for (const options of [{ lostInitially: true }, { loseAtRelease: true }]) {
    const state = await fixture(options);
    try {
      await assert.rejects(state.runner.observe(), (error: unknown) => {
        const detail = currentPcbStringWorkerProducerFailureDetail(error);
        assert.equal(detail?.cleanup, options.lostInitially === true ? "not-started" : "released");
        assert.equal(detail.phase, options.lostInitially === true ? "project" : "owner-final"); return true;
      });
      assert.equal(state.commands.length, options.lostInitially === true ? 0 : 58);
      await assert.rejects(state.runner.observe());
    } finally { state.close(); }
  }
});

void test("raw sample retention refuses hostile envelopes without traps and copies exact text", () => {
  let calls = 0; const trap = (): never => { calls += 1; throw new Error("TRAP"); };
  for (const input of [new Proxy({}, { ownKeys: trap }), Object.defineProperty({}, "result", { get: trap }),
    { result: { type: "string", value: "x".repeat(16_385) } }]) { assert.throws(() => retainCurrentPcbStringWorkerProducerReply(input)); }
  const supplied = { result: { type: "string", value: '{ "raw": true }' } };
  const retained = retainCurrentPcbStringWorkerProducerReply(supplied);
  supplied.result.value = "changed"; assert.equal(retained.result.value, '{ "raw": true }'); assert.equal(calls, 0);
  assert.throws(() => requireOriginalCurrentPcbStringWorkerProducerFailureReplies(new Error("not original")));
});
