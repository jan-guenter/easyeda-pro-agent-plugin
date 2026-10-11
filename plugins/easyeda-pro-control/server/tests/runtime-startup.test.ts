import assert from "node:assert/strict";
import fileSystem from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import process from "node:process";
import { describe, test } from "node:test";

import { captureBackendProcessAuthority } from "../src/backend-listener-authority.ts";
import { waitForSandboxNodeIdentity } from "../src/sandboxed-stdio-client-transport.ts";
import { LocalIntegrityTimings } from "../src/upstream-trust.ts";
import {
  UpstreamEasyedaClient,
  UpstreamStartupError,
  startupFailureWithStderr,
} from "../src/upstream.ts";

void describe("passive local integrity timing diagnostics", () => {
  void test("measures completion and original rejection without retaining result or error text", async () => {
    let now = 10;
    const timings = new LocalIntegrityTimings(() => now);
    const secret = { privatePayload: "private-fixture-credential" };
    assert.equal(await timings.measure("execution-closure", () => {
      now = 17.9;
      return Promise.resolve(secret);
    }), secret);
    const failure = new Error("private-fixture-error");
    await assert.rejects(timings.measure("execution-closure", () => {
      now = 25;
      return Promise.reject(failure);
    }), (error: unknown) => error === failure);
    assert.deepEqual(timings.snapshot().stages, [{
      stage: "execution-closure", activeCount: 0, activeSpanElapsedMs: 0,
      completedCount: 1, failedCount: 1, lastElapsedMs: 7, maxElapsedMs: 7, totalElapsedMs: 14,
    }]);
    assert.doesNotMatch(JSON.stringify(timings.snapshot()), /private-fixture/u);
  });

  void test("reports slow pending work without timeout, cancellation, retry or early settlement", async () => {
    let now = 0;
    let calls = 0;
    let settled = false;
    const work = Promise.withResolvers<string>();
    const timings = new LocalIntegrityTimings(() => now);
    const measured = (async (): Promise<string> => {
      const value = await timings.measure("runtime-module-graph", () => {
        calls += 1;
        return work.promise;
      });
      settled = true;
      return value;
    })();
    now = 24 * 60 * 60 * 1000;
    const pending = timings.snapshot();
    assert.equal(pending.stages[0]?.activeCount, 1);
    assert.equal(pending.stages[0]?.activeSpanElapsedMs, now);
    assert.equal(pending.stages[0]?.completedCount, 0);
    await Promise.resolve();
    assert.equal(settled, false);
    assert.equal(calls, 1);
    work.resolve("completed-once");
    assert.equal(await measured, "completed-once");
    assert.equal(timings.snapshot().stages[0]?.lastElapsedMs, now);
    assert.equal(timings.snapshot().stages[0]?.activeCount, 0);
    assert.equal(pending.stages[0]?.activeCount, 1);
  });

  void test("tracks overlapping stages with bounded immutable detached snapshots", async () => {
    let now = 1;
    const timings = new LocalIntegrityTimings(() => now);
    const first = Promise.withResolvers<null>();
    const second = Promise.withResolvers<null>();
    const firstMeasured = timings.measure("sandbox-input-validation", () => first.promise);
    now = 4;
    const secondMeasured = timings.measure("sandbox-input-validation", () => second.promise);
    now = 8;
    const pending = timings.snapshot();
    assert.equal(pending.stages[0]?.activeCount, 2);
    assert.equal(pending.stages[0]?.activeSpanElapsedMs, 7);
    assert.ok(Object.isFrozen(pending));
    assert.ok(Object.isFrozen(pending.stages));
    assert.ok(Object.isFrozen(pending.stages[0]));
    first.resolve(null);
    await firstMeasured;
    now = 9;
    assert.equal(timings.snapshot().stages[0]?.activeCount, 1);
    assert.equal(timings.snapshot().stages[0]?.activeSpanElapsedMs, 8);
    second.resolve(null);
    await secondMeasured;
    assert.equal(timings.snapshot().stages[0]?.totalElapsedMs, 12);
    assert.equal(timings.snapshot().stages.length, 1);
    assert.equal(pending.stages[0]?.activeCount, 2);
  });

  void test("does not reflect foreign labels or grow state on repeated observations", async () => {
    const timings = new LocalIntegrityTimings();
    const token = "unchanged";
    const action = (): Promise<string> => Promise.resolve(token);
    for (let index = 0; index < 100; index += 1) {
      assert.equal(await timings.measure("launcher-admission", action), "unchanged");
    }
    const result: unknown = await Reflect.apply(timings.measure.bind(timings), undefined, ["private-untrusted-stage", action]);
    assert.equal(result, "unchanged");
    assert.equal(timings.snapshot().stages.length, 1);
    assert.equal(timings.snapshot().stages[0]?.completedCount, 100);
    assert.doesNotMatch(JSON.stringify(timings.snapshot()), /private-untrusted-stage/u);
  });

  void test("clock errors, invalid values, reversal and overflow cannot change work outcomes", async () => {
    for (const badClock of [(): number => { throw new Error("private-clock-error"); }, (): number => Number.NaN, (): number => Number.POSITIVE_INFINITY, (): number => -1]) {
      const timings = new LocalIntegrityTimings(badClock);
      assert.equal(await timings.measure("launcher-admission", () => Promise.resolve(42)), 42);
      assert.equal(timings.snapshot().stages[0]?.lastElapsedMs, 0);
      const failure = new Error("original-work-failure");
      await assert.rejects(timings.measure("launcher-admission", () => { throw failure; }), (error: unknown) => error === failure);
      assert.equal(timings.snapshot().stages[0]?.failedCount, 1);
    }
    let now = 9;
    const timings = new LocalIntegrityTimings(() => now);
    await timings.measure("launcher-admission", () => { now = 1; return Promise.resolve(); });
    assert.equal(timings.snapshot().stages[0]?.lastElapsedMs, 0);
    await timings.measure("launcher-admission", () => { now = Number.MAX_VALUE; return Promise.resolve(); });
    assert.equal(timings.snapshot().stages[0]?.lastElapsedMs, Number.MAX_SAFE_INTEGER);
    assert.equal(timings.snapshot().stages[0]?.totalElapsedMs, Number.MAX_SAFE_INTEGER);
  });
});

void describe("upstream startup failure boundaries", { concurrency: false }, () => {
  void test("can inspect pending pre-transport timing without starting or asserting a sandbox", async () => {
    const upstream = new UpstreamEasyedaClient();
    assert.equal(upstream.processDiagnostics(), undefined);
    const timings: unknown = Reflect.get(upstream, "localIntegrityTimings");
    assert.ok(timings instanceof LocalIntegrityTimings);
    const pending = Promise.withResolvers<null>();
    const measurement = timings.measure("launcher-admission", () => pending.promise);
    const diagnostic = upstream.processDiagnostics();
    assert.equal(diagnostic?.sandbox, null);
    assert.equal(diagnostic?.localIntegrity.stages[0]?.activeCount, 1);
    assert.equal(upstream.bridgeSessionLifecycle(), undefined);
    pending.resolve(null);
    await measurement;
    assert.equal(upstream.processDiagnostics()?.localIntegrity.stages[0]?.completedCount, 1);
    assert.equal(diagnostic?.localIntegrity.stages[0]?.activeCount, 1);
    await upstream.close();
  });

  void test("joins startup after its gateway has been published", async () => {
    const upstream = new UpstreamEasyedaClient();
    const startup = Promise.withResolvers<never>();
    const expectedFailure = new Error("shared startup failure");
    assert.equal(Reflect.set(upstream, "connectPromise", startup.promise), true);
    assert.equal(Reflect.set(upstream, "bridgeGateway", {}), true);
    const joined = upstream.connect();
    const rejection = assert.rejects(joined, expectedFailure);
    startup.reject(expectedFailure);
    await rejection;
  });

  void test("reports categorical startup evidence without reflecting private text", () => {
    const privateText = "private-credential-and-design-content";
    const diagnostics = {
      schema: "easyeda-pro-control.sandbox-startup-diagnostics.v1",
      stage: "supervisor-readiness",
      monitorExitCode: 1,
      monitorSignal: null,
      sandboxExitCode: 1,
    } as const;
    const failure = startupFailureWithStderr(
      new Error(privateText),
      229,
      "e".repeat(64),
      diagnostics,
    );
    assert.ok(failure instanceof UpstreamStartupError);
    assert.deepEqual(failure.startupDiagnostics, diagnostics);
    assert.match(failure.message, /Startup stage: supervisor-readiness/u);
    assert.match(failure.message, /229 private diagnostic bytes/u);
    assert.equal(failure.message.includes(privateText), false);
    assert.equal(JSON.stringify(failure).includes(privateText), false);
  });

  void test("retains categorical diagnostics even when stderr is empty", () => {
    const diagnostics = {
      schema: "easyeda-pro-control.sandbox-startup-diagnostics.v1",
      stage: "process-spawn",
      monitorExitCode: null,
      monitorSignal: null,
      sandboxExitCode: null,
    } as const;
    const failure = startupFailureWithStderr(new Error("spawn failed"), 0, "0".repeat(64), diagnostics);
    assert.ok(failure instanceof UpstreamStartupError);
    assert.deepEqual(failure.startupDiagnostics, diagnostics);
  });

  void test("closes an executable descriptor acquired after child exit", async (context) => {
    const nodeHandle = await fileSystem.open(process.execPath, "r");
    const authority = await captureBackendProcessAuthority(process.pid);
    const childClosed = Promise.withResolvers<null>();
    const originalOpen = fileSystem.open;
    const retained: { handle: FileHandle | undefined } = { handle: undefined };
    const intercepted = context.mock.method(
      fileSystem,
      "open",
      async (...arguments_: Parameters<typeof originalOpen>): Promise<FileHandle> => {
        const handle = await originalOpen(...arguments_);
        if (arguments_[0] === `/proc/${process.pid}/exe`) {
          retained.handle = handle;
          childClosed.resolve(null);
          await Promise.resolve();
        }
        return handle;
      },
    );
    syncBuiltinESMExports();
    try {
      await assert.rejects(
        waitForSandboxNodeIdentity(authority, nodeHandle, [], childClosed.promise),
        /closed before exact reviewed Node identity admission/u,
      );
      assert.ok(retained.handle !== undefined);
      await assert.rejects(retained.handle.stat(), { code: "EBADF" });
    } finally {
      intercepted.mock.restore();
      syncBuiltinESMExports();
      await retained.handle?.close();
      await nodeHandle.close();
    }
  });
});
