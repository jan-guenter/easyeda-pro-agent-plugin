import assert from "node:assert/strict";
import { copyFile, rename, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";

void test("actual source-qualified child issues immutable launch and capture observations without lookup requests", async (context) => {
  const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
  const clock = await windowsClockObservationForResult(launch, "launch");
  assert.equal(clock.clock.status, "observed"); assert.equal(clock.executionAuthorized, false);
  assert.equal(clock.producerBindingVerified, false); assert.equal(Object.isFrozen(clock.base), true);
  assert.equal(Object.isFrozen(clock.ownerBinding), true); assert.equal(Object.isFrozen(clock.clock), true);
  assert.strictEqual(await assertIssuedWindowsClockObservation(clock), clock);
  const evidence = await f.supervisor.capture(INPUT);
  const captured = await windowsClockObservationForResult(evidence, "capture");
  assert.equal(captured.ownerBinding["operationId"], INPUT.operationId);
  assert.equal(captured.ownerBinding["bindingSha256"], INPUT.bindingSha256);
  assert.deepEqual(f.requests.map((r) => r["action"]), ["clocked-launch", "clocked-capture"]);
  assert.equal(f.spawnCalls(), 1);
});
for (const kind of ["copy", "json", "hash", "shaped"] as const) {
  void test(`issued observation refuses ${kind} reconstruction`, async (context) => {
    const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
    const clock = await windowsClockObservationForResult(launch, "launch");
    let forged: unknown;
    if (kind === "copy") { forged = structuredClone(clock); }
    else if (kind === "json") {
      // oxlint-disable-next-line unicorn/prefer-structured-clone -- This case tests deserialized historical JSON, not clone semantics.
      forged = JSON.parse(JSON.stringify(clock));
    } else if (kind === "hash") { forged = clock.baseSha256; }
    else { forged = { ...clock }; }
    await assert.rejects(assertIssuedWindowsClockObservation(forged), /not issued/u);
    await assert.rejects(windowsClockObservationForResult(structuredClone(launch), "launch"), /Original Windows result/u);
    await assert.rejects(windowsClockObservationForResult(launch, "capture"), /Original Windows result/u);
  });
}
void test("caller-supplied transport and reviewed hash cannot mint clock authority", async () => {
  const f = closedSessionFixture();
  const launch = await f.supervisor.launch({ confirmLaunch: true });
  await assert.rejects(windowsClockObservationForResult(launch, "launch"), /Original Windows result/u);
  await f.supervisor.release();
});
for (const mode of ["unavailable", "missing", "malformed"] as const) {
  void test(`${mode} clock preserves native launch acknowledgement without inventing a sample`, async (context) => {
    const f = await qualifiedClockFixture(context); f.behavior.clockMode = mode;
    const launch = await f.supervisor.launch({ confirmLaunch: true });
    const clock = await windowsClockObservationForResult(launch, "launch");
    assert.equal(launch.root.pid, 100); assert.equal(clock.clock.status, "unavailable");
    assert.equal(clock.executionAuthorized, false);
  });
}
void test("normal close acknowledgement is not termination; actual retained proof owns termination clock", async (context) => {
  const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
  const executionAuthority = await f.supervisor.capture(INPUT);
  const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
    bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, launch, executionAuthority };
  const intent = await f.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await f.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  await assert.rejects(windowsClockObservationForResult(closeReceipt, "termination"), /Original Windows result/u);
  const proof = await f.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const clock = await windowsClockObservationForResult(proof, "termination");
  assert.equal(clock.clock.status, "observed"); assert.equal(proof.jobEmpty, true);
  const again = await f.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.strictEqual(await windowsClockObservationForResult(again, "termination"), clock);
  assert.equal(f.requests.filter((r) => r["action"] === "clocked-prove-terminated").length, 1);
});
for (const change of ["helper-bytes", "helper-inode", "source-path", "native-path", "powershell", "scope", "executable", "executable-hash", "lost", "release", "new-generation", "result"] as const) {
  void test(`issued lookup refuses ${change} drift`, async (context) => {
    const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
    const clock = await windowsClockObservationForResult(launch, "launch");
    if (change === "helper-bytes") { await writeFile(f.helperPath, "synthetic changed source", { mode: 0o600 }); }
    else if (change === "helper-inode") { await copyFile(f.helperPath, `${f.helperPath}.replacement`, 1); await rename(`${f.helperPath}.replacement`, f.helperPath); }
    else if (change === "source-path") { f.options.helperPath += ".changed"; }
    else if (change === "native-path") { f.options.helperWindowsPath += ".changed"; }
    else if (change === "powershell") { f.options.powershellExecutable += ".changed"; }
    else if (change === "scope") { f.options.reviewedExecutionScopeSha256 = "0".repeat(64); }
    else if (change === "executable") { f.options.expectedExecutable = String.raw`C:\Synthetic\other.exe`; }
    else if (change === "executable-hash") { f.options.expectedExecutableSha256 = "0".repeat(64); }
    else if (change === "lost") { f.child.exitCode = 1; }
    else if (change === "release") { await f.supervisor.release(); }
    else if (change === "new-generation") { await f.supervisor.launch({ confirmLaunch: true }); }
    else { Object.assign(launch.root, { pid: 999 }); }
    await assert.rejects(assertIssuedWindowsClockObservation(clock));
  });
}
void test("native process-probe capture attaches the exact finish-probe observation", async (context) => {
  const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
  const input = { ...INPUT, runtimeIdentity: { ...INPUT.runtimeIdentity, processId: null } };
  const authority = await f.supervisor.capture(input);
  const clock = await windowsClockObservationForResult(authority, "capture");
  assert.equal(clock.base["socketOwnerPid"], 101);
  assert.deepEqual(f.requests.map((r) => r["action"]), ["clocked-launch", "begin-probe", "clocked-finish-probe", "end-probe"]);
});
