/** Concrete lifecycle orchestration; only synthetic transport replies/effects are injected. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { loadOperation } from "../../src/artifacts.ts";
import { isRecord } from "../../src/core.ts";

type Fixture = Awaited<ReturnType<typeof fixture>>;
async function stopped(f: Fixture, launches: number, closes: number): Promise<Record<string, unknown>> {
  assert.equal(f.events.filter((event) => event === "launch").length, launches);
  assert.equal(f.events.filter((event) => event === "normal-close").length, closes);
  assert.equal(f.events.includes("save"), false);
  const retained = f.stage.retained();
  const operationId = retained["operationId"];
  assert.equal(retained["completionProved"], false); assert.equal(retained["replayAllowed"], false);
  assert.equal(typeof operationId, "string"); assert.ok(typeof operationId === "string");
  const journal = await loadOperation(operationId);
  assert.notEqual(journal["state"], "completed"); assert.notEqual(journal["state"], "closed-session-completed");
  assert.equal(journal["saved"], false); assert.equal(journal["reopened"], false);
  const snapshot = [...f.events];
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u);
  assert.deepEqual(f.events, snapshot);
  return retained;
}

void test("full flow refuses an evicted edit marker without regeneration or automatic close", async (context) => {
  const f = await fixture(context);
  f.state.onStartup = (): void => { if (f.state.sessionSequence === 2) { f.browser.state.entries.clear(); } };
  await assert.rejects(f.stage.recordFullEvidence(f.plan));
  const retained = await stopped(f, 2, 1);
  assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 0);
  assert.equal(f.browser.state.calls.filter((call) => call.kind === "put").length, 1);
  assert.ok(isRecord(retained["originals"])); assert.ok(retained["originals"]["copy"] !== undefined);
});

void test("full flow retains uncertain edit navigation without a second open or write", async (context) => {
  const f = await fixture(context);
  f.state.onReply = (kind, value): unknown => { if (kind === "navigation") { throw new Error("synthetic lost navigation reply"); } return value; };
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /synthetic lost navigation reply/u);
  const retained = await stopped(f, 2, 1);
  assert.equal(f.state.opens, 1); assert.equal(f.state.writes, 0);
  assert.ok(isRecord(retained["edit"])); assert.ok(retained["edit"]["startup"] !== undefined);
  assert.equal(retained["edit"]["navigation"], undefined);
});

void test("full flow refuses malformed settled witness before any metadata dispatch", async (context) => {
  const f = await fixture(context);
  f.state.onReply = (kind, value): unknown => kind === "witness" ? { malformed: true } : value;
  await assert.rejects(f.stage.recordFullEvidence(f.plan));
  const retained = await stopped(f, 2, 1);
  assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 1);
  assert.ok(isRecord(retained["laterRaw"])); assert.ok(retained["laterRaw"]["witness"] !== undefined);
  assert.ok(isRecord(retained["edit"])); assert.equal(retained["edit"]["witness"], undefined);
});

void test("full flow never auto-closes or repeats a metadata call whose synthetic effect preceded lost reply", async (context) => {
  const f = await fixture(context);
  f.state.onReply = (kind, value): unknown => { if (kind === "write") { throw new Error("synthetic effect applied but reply lost"); } return value; };
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /synthetic effect applied but reply lost/u);
  const retained = await stopped(f, 2, 1);
  assert.equal(f.state.writes, 1); assert.equal(f.state.chunks.length, 2); assert.equal(f.state.reads, 0);
  assert.ok(isRecord(retained["edit"])); assert.ok(retained["edit"]["preparation"] !== undefined);
  assert.equal(retained["edit"]["write"], undefined);
  const operationId = retained["operationId"]; assert.ok(typeof operationId === "string");
  const journal = await loadOperation(operationId);
  assert.equal(journal["mutationMayHaveOccurred"], true); assert.equal(journal["orphanedCallPossible"], true);
});

void test("full flow retains invalid settled saved-read reply without closing verification or claiming completion", async (context) => {
  const f = await fixture(context);
  f.state.onReply = (kind, value): unknown => kind === "saved-read" ? { malformed: true } : value;
  await assert.rejects(f.stage.recordFullEvidence(f.plan));
  const retained = await stopped(f, 3, 2);
  assert.equal(f.state.writes, 1); assert.equal(f.state.opens, 2); assert.equal(f.state.reads, 1);
  assert.ok(isRecord(retained["laterRaw"])); assert.ok(retained["laterRaw"]["savedRead"] !== undefined);
  assert.ok(isRecord(retained["edit"])); assert.ok(retained["edit"]["comparison"] !== undefined);
  assert.ok(isRecord(retained["verification"])); assert.equal(retained["verification"]["savedRead"], undefined);
});

void test("full flow rejects verification SQL collateral while retaining successful saved-read and closed copy", async (context) => {
  const f = await fixture(context);
  f.state.onUi = (): void => {
    if (f.state.sessionSequence !== 3) { return; }
    const database = new DatabaseSync(f.source);
    try { database.exec("UPDATE resources SET dataStr='unexpected synthetic collateral'"); }
    finally { database.close(); }
  };
  await assert.rejects(f.stage.recordFullEvidence(f.plan));
  const retained = await stopped(f, 3, 3);
  assert.equal(f.state.writes, 1); assert.equal(f.state.reads, 1);
  assert.ok(isRecord(retained["verification"]));
  assert.ok(retained["verification"]["savedRead"] !== undefined);
  assert.ok(retained["verification"]["copy"] !== undefined);
  assert.equal(retained["verification"]["comparison"], undefined);
});
