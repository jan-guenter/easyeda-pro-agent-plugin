import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import timers from "node:timers/promises";
import { fixture } from "./closed-symbol-coordinator-pending-fixture.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";
import { isRecord } from "../../src/core.ts";

for (const code of ["authority-prior-job-not-empty", "authority-retained-process-still-live"] as const) {
  void test(`qualified baseline waits through ${code} then makes one original closed copy`, async (context) => {
    const f = await fixture(context); f.owner.state.code = code; f.owner.state.remaining = 2;
    const result = await f.stage.recordBaseline(f.plan);
    assert.equal(result.sequence, 10); assert.equal(result.completionProved, false);
    assert.equal(f.owner.requests.filter((r) => r["action"] === "clocked-launch").length, 1);
    assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
    assert.equal(f.owner.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 3);
    assert.equal(f.stage.retained()["terminationObservations"], 3);
    assert.ok(f.stage.retained()["copyReceipt"] !== undefined);
  });
}

void test("unrecognized native refusal stops without polling or another close", async (context) => {
  const f = await fixture(context); f.owner.state.code = "authority-native-handle-missing";
  await assert.rejects(f.stage.recordBaseline(f.plan), /authority-native-handle-missing/u);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 1);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
  assert.equal(f.stage.retained()["terminationObservations"], 0);
  assert.equal(f.stage.retained()["copyReceipt"], undefined);
});

void test("termination deadline preserves pending observation and close without copying", async (context) => {
  const f = await fixture(context); f.owner.state.code = "authority-prior-job-not-empty";
  const now = performance.now.bind(performance); let expired = false;
  context.mock.method(performance, "now", (): number => now() + (expired ? 70_000 : 0));
  f.owner.state.afterResponse = (): void => { expired = true; };
  await assert.rejects(f.stage.recordBaseline(f.plan), /termination deadline/u);
  assert.equal(f.stage.retained()["terminationObservations"], 1);
  assert.ok(f.stage.retained()["closeResult"] !== undefined);
  assert.equal(f.stage.retained()["copyReceipt"], undefined);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
});

void test("late genuine termination remains retained but does not cross the coordinator deadline", async (context) => {
  const f = await fixture(context), onFrame = f.owner.state.onFrame;
  const now = performance.now.bind(performance); let expired = false;
  context.mock.method(performance, "now", (): number => now() + (expired ? 70_000 : 0));
  f.owner.state.onFrame = (action): void => { onFrame?.(action); if (action === "clocked-prove-terminated") { expired = true; } };
  await assert.rejects(f.stage.recordBaseline(f.plan), /termination deadline/u);
  const retained = f.stage.retained(); assert.ok(isRecord(retained["originals"]));
  assert.ok(retained["originals"]["proof"] !== undefined);
  assert.equal(retained["copyReceipt"], undefined);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
});

for (const change of ["helper", "scope", "caller"] as const) {
  void test(`pending delay ${change} drift stops before the next native observation`, async (context) => {
    const f = await fixture(context); f.owner.state.code = "authority-prior-job-not-empty";
    const delay = timers.setTimeout;
    context.mock.method(timers, "setTimeout", (milliseconds?: number): Promise<unknown> => {
      if (milliseconds === 250) {
        if (change === "helper") { f.owner.child.exitCode = 1; }
        if (change === "scope") { f.state.scope = true; }
        if (change === "caller") { f.plan["targetUuid"] = "0".repeat(32); }
        return Promise.resolve();
      }
      return delay(milliseconds);
    }); syncBuiltinESMExports();
    try { await assert.rejects(f.stage.recordBaseline(f.plan)); }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    assert.equal(f.owner.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 1);
    assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
    assert.equal(f.stage.retained()["copyReceipt"], undefined);
  });
}

void test("fixed 241-observation bound stops without a repeated close or copy", async (context) => {
  const f = await fixture(context); f.owner.state.code = "authority-prior-job-not-empty";
  context.mock.method(performance, "now", (): number => 1000);
  context.mock.method(timers, "setTimeout", (): Promise<unknown> => Promise.resolve()); syncBuiltinESMExports();
  try { await assert.rejects(f.stage.recordBaseline(f.plan), /observation bound/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.equal(f.owner.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 241);
  assert.equal(f.stage.retained()["terminationObservations"], 241);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
  assert.equal(f.stage.retained()["copyReceipt"], undefined);
});

void test("final baseline journal read cannot return a copy after a new supervisor capture", async (context) => {
  const f = await fixture(context), open = fsPromises.open;
  let changed = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const handle = await open(...args);
    const retained = f.stage.retained();
    if (!changed && retained["lastSuccessfulStage"] === "baseline-copy" && basename(String(args[0])) === `${String(retained["operationId"])}.json`) {
      changed = true; await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 });
    }
    return handle;
  }); syncBuiltinESMExports();
  try { await assert.rejects(f.stage.recordBaseline(f.plan), /lifecycle/u); assert.equal(changed, true); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.ok(f.stage.retained()["copyReceipt"] !== undefined);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 1);
});

void test("window observation survives failed auxiliary publication without normal close", async (context) => {
  const f = await fixture(context), link = fsPromises.link;
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
    if (basename(String(args[1])) === "00-baseline-owned-window.json") { throw new Error("synthetic window publication failed"); }
    await link(...args);
  }); syncBuiltinESMExports();
  try { await assert.rejects(f.stage.recordBaseline(f.plan), /window publication/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.ok(isRecord(f.stage.retained()["windowObservation"]));
  assert.equal(f.stage.retained()["windowArtifact"], undefined);
  assert.equal(f.owner.requests.filter((r) => r["action"] === "normal-close").length, 0);
});
