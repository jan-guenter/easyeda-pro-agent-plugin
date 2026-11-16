import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { observeWireFixtureTask, wireFixtureCallQueue, wireFixtureCompletion } from "./helpers/current-schematic-wire-worker-lifecycle.ts";

async function tick(): Promise<void> {
  const task = Promise.withResolvers<null>();
  setImmediate(() => { task.resolve(null); });
  await task.promise;
}

void test("Wire fixture source attribution waits for the original Inspector source comparison", async context => {
  const session = new Session(); session.connect();
  context.after(() => { session.disconnect(); });
  await session.post("Debugger.enable");
  const root = await session.post("Runtime.evaluate", { expression: "({})" });
  const objectId = root.result.objectId; assert.ok(objectId !== undefined);
  const entered = Promise.withResolvers<null>(), queue = wireFixtureCallQueue(), release = Promise.withResolvers<null>();
  let active: string | null = null, scripts: string[] = [];
  const calls: string[] = [], compared: string[] = [];
  session.on("Debugger.scriptParsed", event => {
    if (active !== null && event.params.url === "" && event.params.length === active.length + 2) {
      scripts.push(event.params.scriptId);
    }
  });
  async function attribute(program: string, held: boolean): Promise<void> {
    calls.push(program); active = program; scripts = [];
    const result = await session.post("Runtime.callFunctionOn", {
      objectId, functionDeclaration: program, returnByValue: true, awaitPromise: false,
    });
    assert.equal(result.exceptionDetails, undefined);
    if (held) { entered.resolve(null); await release.promise; }
    assert.equal(scripts.length, 1);
    const scriptId = scripts[0]; assert.ok(scriptId !== undefined);
    const source = await session.post("Debugger.getScriptSource", { scriptId });
    assert.equal(source.scriptSource, `(${program})`);
    compared.push(program); active = null;
  }
  const firstProgram = "function(){return 1;}", secondProgram = "function(){return 22;}";
  const first = queue(() => attribute(firstProgram, true));
  await entered.promise;
  const second = queue(() => attribute(secondProgram, false));
  const settled = Promise.allSettled([first, second]);
  let heldCalls: string[] = [];
  try { await tick(); heldCalls = [...calls]; } finally { release.resolve(null); }
  const outcomes = await settled;
  assert.deepEqual(heldCalls, [firstProgram]);
  for (const outcome of outcomes) { if (outcome.status === "rejected") { throw outcome.reason; } }
  assert.deepEqual(compared, [firstProgram, secondProgram]);
});

void test("Wire fixture attribution releases the queue after the original failure", async () => {
  const cause = new Error("original source failure"), queue = wireFixtureCallQueue();
  await assert.rejects(queue(() => Promise.reject(cause)), error => error === cause);
  assert.equal(await queue(() => Promise.resolve("next original call")), "next original call");
});

void test("Wire fixture success waits for the one original cleanup including concurrent completion", async () => {
  const cleanup = Promise.withResolvers<null>(), messages: Readonly<Record<string, unknown>>[] = [];
  let cleanups = 0;
  const complete = wireFixtureCompletion(async () => { cleanups += 1; await cleanup.promise; }, result => { messages.push(result); });
  const result = { completed: true };
  const original = complete(result);
  assert.equal(complete({ fixtureTimeout: true }), original);
  try { await tick(); assert.equal(cleanups, 1); assert.deepEqual(messages, []); }
  finally { cleanup.resolve(null); await original; }
  assert.deepEqual(messages, [result]); assert.equal(messages[0], result);
  assert.equal(complete({ error: "late operation failure" }), original);
  assert.equal(messages.length, 1);
});

void test("Wire fixture cleanup failure retains operation failure and cannot publish success", async () => {
  for (const result of [{ completed: true }, { error: "original operation failure", firstFailure: "original raw failure" },
    { fixtureError: "original setup failure" }]) {
    const cause = new Error("original cleanup failure"), messages: Readonly<Record<string, unknown>>[] = [];
    const complete = wireFixtureCompletion(() => Promise.reject(cause), message => { messages.push(message); });
    await complete(result);
    assert.equal(messages.length, 1);
    const message = messages[0]; assert.ok(message !== undefined);
    assert.equal(message["error"], "error" in result ? result.error : undefined);
    assert.equal(message["firstFailure"], "firstFailure" in result ? result.firstFailure : undefined);
    assert.equal(message["fixtureError"], "fixtureError" in result ? result.fixtureError : "Wire fixture cleanup failed");
    assert.equal(message["fixtureCleanupError"], cause.stack);
  }
});

void test("Wire fixture observes the unchanged original run rejection before failed arm cleanup", async () => {
  const cause = new Error("original preflight failure"), pending = Promise.reject(cause);
  const observed = observeWireFixtureTask(pending);
  await tick();
  await assert.rejects(pending, error => error === cause);
  await observed;
});
