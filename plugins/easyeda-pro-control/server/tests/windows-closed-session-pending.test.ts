import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { pendingFixture } from "./helpers/windows-pending-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { assertClosedSessionCopyAuthority, assertClosedSessionTerminationProof, assertCurrentClosedSessionTerminationObservation, createWindowsAuthoritySupervisor,
  windowsClockObservationForResult } from "../src/windows-authority.ts";

async function observeInjectedChange(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // The test intentionally invalidates ownership while the first call settles.
  }
}

for (const code of ["authority-prior-job-not-empty", "authority-retained-process-still-live"] as const) {
  void test(`source-issued ${code} is immutable pending data, then original ready proof`, async (context) => {
    const f = await pendingFixture(context); f.state.code = code;
    const pending = await f.supervisor.probeClosedSessionTermination(f.input);
    assert.equal(pending.status, "pending"); assert.equal(Object.isFrozen(pending), true);
    if (pending.status !== "pending") { assert.fail("Expected pending"); }
    assert.equal(pending.nativeCode, code); assert.equal(pending.executionAuthorized, false);
    assert.equal(pending.completionProved, false); assert.equal(pending.terminationProved, false);
    assert.equal(pending["jobId"], f.binding.launch.jobId);
    assert.equal(pending["closeIntentSha256"], f.input.intent.closeIntentSha256);
    assertCurrentClosedSessionTerminationObservation(pending);
    assert.throws(() => { assertCurrentClosedSessionTerminationObservation(structuredClone(pending)); }, /not issued/u);
    assert.match(pending.nativeRequestId, /^[a-f0-9]{32}$/u);
    await assert.rejects(assertClosedSessionTerminationProof(pending), /not issued/u);
    await assert.rejects(assertClosedSessionCopyAuthority(pending), /not issued/u);
    await assert.rejects(windowsClockObservationForResult(pending, "termination"), /no clock/u);
    f.state.code = undefined;
    const ready = await f.supervisor.probeClosedSessionTermination(f.input);
    assert.equal(ready.status, "terminated");
    assertCurrentClosedSessionTerminationObservation(ready);
    assert.throws(() => { assertCurrentClosedSessionTerminationObservation(pending); }, /original native refusal/u);
    if (ready.status !== "terminated") { assert.fail("Expected ready"); }
    assert.equal(await assertClosedSessionCopyAuthority(ready.proof), ready.proof);
    const clock = await windowsClockObservationForResult(ready.proof, "termination");
    assert.equal(clock.clock.status, "observed");
    assert.equal(f.requests.filter((r) => r["action"] === "normal-close").length, 1);
    assert.equal(f.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 2);
    const again = await f.supervisor.probeClosedSessionTermination(f.input);
    assert.equal(again.status, "terminated");
    assert.equal(f.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 2);
  });
}

void test("legacy proof still rejects the exact live error and never reports pending", async (context) => {
  const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
  await assert.rejects(f.supervisor.proveClosedSession(f.input), { message: "authority-prior-job-not-empty" });
  const pending = await f.supervisor.probeClosedSessionTermination(f.input); assert.equal(pending.status, "pending");
  assert.equal(f.requests.filter((r) => r["action"] === "normal-close").length, 1);
});

for (const drift of ["helper-path", "native-path", "source-hash", "capture", "release", "next-probe"] as const) {
  void test(`issued pending current check refuses later ${drift} without granting a proof`, async (context) => {
    const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
    const observation = await f.supervisor.probeClosedSessionTermination(f.input);
    assertCurrentClosedSessionTerminationObservation(observation);
    if (drift === "helper-path") { f.options.helperPath += ".changed"; }
    if (drift === "native-path") { f.options.helperWindowsPath += ".changed"; }
    if (drift === "source-hash") { f.options.reviewedExecutionScopeSha256 = "0".repeat(64); }
    if (drift === "capture") { await f.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 }); }
    if (drift === "release") { await f.supervisor.releaseCapture(f.binding.executionAuthority); }
    if (drift === "next-probe") { await f.supervisor.probeClosedSessionTermination(f.input); }
    assert.throws(() => { assertCurrentClosedSessionTerminationObservation(observation); });
    await assert.rejects(assertClosedSessionCopyAuthority(observation), /not issued/u);
  });
}

for (const code of ["authority-synthetic-refusal", "authority-capture-not-found", "authority-helper-mismatch", "authority-"]) {
  void test(`other native error ${code} never becomes pending`, async (context) => {
    const f = await pendingFixture(context); f.state.code = code;
    await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input));
  });
}
for (const change of ["wrong-id", "malformed", "helper-exit", "release", "caller", "helper-path", "scope-hash"] as const) {
  void test(`a genuine live frame with ${change} never grants pending continuation`, async (context) => {
    const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
    let cleanup: Promise<void> | undefined;
    if (change === "wrong-id") { f.state.wrongId = true; }
    if (change === "malformed") { f.state.malformed = true; }
    f.state.afterResponse = (): void => {
      if (change === "helper-exit") { f.child.exitCode = 1; }
      if (change === "release") { cleanup = f.supervisor.release(); }
      if (change === "caller") { Object.assign(f.input.runtimeIdentity, { generation: "changed-after-native-error" }); }
      if (change === "helper-path") { f.options.helperPath += ".changed"; }
      if (change === "scope-hash") { f.options.reviewedExecutionScopeSha256 = "0".repeat(64); }
    };
    await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input)); await cleanup;
  });
}
for (const field of ["helperInstance", "jobId", "captureBindingSha256"] as const) {
  void test(`a close input with another ${field} refuses before native proof`, async (context) => {
    const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
    if (field === "captureBindingSha256") { Object.assign(f.input.executionAuthority, { bindingSha256: "0".repeat(64) }); }
    else { Object.assign(f.input.launch, { [field]: "0".repeat(32) }); }
    await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input));
    assert.equal(f.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 0);
  });
}

void test("source-issued live error followed by post-error asynchronous helper loss refuses", async (context) => {
  const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
  const lstat = fsPromises.lstat; let afterError = false, checks = 0;
  f.state.afterResponse = (): void => { afterError = true; };
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof lstat>): ReturnType<typeof lstat> => {
    const result = await lstat(...args);
    if (afterError && args[0] === f.helperPath) { checks += 1; if (checks === 2) { f.child.exitCode = 1; } }
    return result;
  }); syncBuiltinESMExports();
  try { await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input), /unavailable/u); assert.equal(checks, 2); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
});

for (const drift of ["capture", "capture-release", "new-launch"] as const) {
  void test(`native pending followed by ${drift} cannot continue its original closed generation`, async (context) => {
    const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
    let changed: Promise<unknown> | undefined;
    f.state.afterResponse = (): void => {
      if (drift === "capture") { changed = observeInjectedChange(f.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 })); }
      if (drift === "capture-release") { changed = observeInjectedChange(f.supervisor.releaseCapture(f.binding.executionAuthority)); }
      if (drift === "new-launch") { changed = observeInjectedChange(f.supervisor.launch({ confirmLaunch: true })); }
    };
    await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input)); await changed;
    assert.equal(f.requests.filter((r) => r["action"] === "normal-close").length, 1);
  });
}

void test("concurrent pending probes do not manufacture a second proof or close", async (context) => {
  const f = await pendingFixture(context); f.state.code = "authority-prior-job-not-empty";
  const entered = Promise.withResolvers<string>(), write = f.child.stdout.write.bind(f.child.stdout);
  context.mock.method(f.child.stdout, "write", (chunk: unknown): boolean => {
    assert.ok(typeof chunk === "string"); entered.resolve(chunk); return true;
  });
  const first = f.supervisor.probeClosedSessionTermination(f.input);
  const frame = await entered.promise;
  await assert.rejects(f.supervisor.probeClosedSessionTermination(f.input), /already in progress/u);
  write(frame);
  const outcome = await first; assert.equal(outcome.status, "pending");
  assert.equal(f.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 1);
  assert.equal(f.requests.filter((r) => r["action"] === "normal-close").length, 1);
});

void test("public transport factory cannot issue pending even with matching error text", async () => {
  const helper = "b".repeat(32), job = "a".repeat(32);
  const error = new Error("authority-prior-job-not-empty");
  const supervisor = createWindowsAuthoritySupervisor({
    assertClosedSessionAvailable(): void {
      // Synthetic live owner only.
    },
    request(request): Promise<unknown> {
      const root = { pid: 100, role: "easyeda-main", startIdentity: `win32:639247486000000001:job:${job}` };
      if (request["action"] === "launch") { return Promise.resolve({ jobId: job, helperInstance: helper, root }); }
      if (request["action"] === "capture") { return Promise.resolve({ bindingSha256: request["bindingSha256"], jobId: job, helperInstance: helper,
        capturedAt: "2026-10-12T12:00:00.0000000Z", processes: [root, { pid: 101, role: "renderer", startIdentity: `win32:639247486100000001:job:${job}` }], runtimePid: 101, socketOwnerPid: null }); }
      if (request["action"] === "normal-close") { return Promise.resolve({ jobId: job, closeDispatched: true, saveOrDiscardSelected: false }); }
      return Promise.reject(error);
    },
    release(): Promise<void> { return Promise.resolve(); },
  }, { helperSha256: "5a5095d463afcf8f595c3085ec7d5f377baa2e545b623bca81205137c602e608", expectedExecutable: "C:\\Synthetic\\easyeda-pro.exe",
    expectedExecutableSha256: "d".repeat(64), reviewedExecutionScopeSha256: "e".repeat(64), revalidateClosedSessionHelper(): Promise<void> { return Promise.resolve(); } });
  const launch = await supervisor.launch({ confirmLaunch: true });
  const executionAuthority = await supervisor.capture(INPUT);
  const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: 1, bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, launch, executionAuthority };
  const intent = await supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  await assert.rejects(supervisor.probeClosedSessionTermination({ ...binding, intent, closeReceipt }), (caught: unknown): boolean => caught === error);
});
