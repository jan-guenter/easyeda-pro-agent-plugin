import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { sha256Json } from "../src/core.ts";
import type { ExecutionAuthorityCaptureInput, ExecutionAuthorityEvidence, ExecutionAuthorityTerminationInput } from "../src/engine.ts";
import { createWindowsAuthoritySupervisor, startWindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import type { WindowsAuthorityPolicy, WindowsAuthoritySupervisor } from "../src/windows-authority.ts";

const JOB = "a".repeat(32);
const HELPER = "b".repeat(32);
const ROOT = { pid: 100, role: "easyeda-main", startIdentity: `win32:639247486000000000:job:${JOB}` };
const RENDERER = { pid: 101, role: "renderer", startIdentity: `win32:639247486100000000:job:${JOB}` };
const POLICY: WindowsAuthorityPolicy = {
  helperSha256: "c".repeat(64), expectedExecutable: "C:\\Reviewed\\easyeda-pro.exe",
  expectedExecutableSha256: "d".repeat(64), reviewedExecutionScopeSha256: "e".repeat(64),
};
const INPUT: ExecutionAuthorityCaptureInput = {
  bindingSha256: "1".repeat(64), challengeAttempt: 1, operationId: "operation-one", orphanPhase: "apply",
  bridgeSession: {
    sessionId: "session-one", gatewayInstanceId: "gateway-one", sequence: 1,
    authenticatedAtEpochMs: 1000, authenticationReceiptSha256: "2".repeat(64),
  },
  runtimeIdentity: { kind: "runtime-identity", generation: "renderer-generation-one", timeOrigin: 1000, processId: 101 },
};

function fixture(policy = POLICY): {
  readonly requests: Record<string, unknown>[];
  readonly behavior: { capture?: Record<string, unknown>; termination?: Record<string, unknown>; observation?: Record<string, unknown>; window?: Record<string, unknown>; close?: Record<string, unknown>; release?: Record<string, unknown>; error?: Error };
  readonly supervisor: WindowsAuthoritySupervisor;
} {
  const requests: Record<string, unknown>[] = [];
  const behavior: { capture?: Record<string, unknown>; termination?: Record<string, unknown>; observation?: Record<string, unknown>; window?: Record<string, unknown>; close?: Record<string, unknown>; release?: Record<string, unknown>; error?: Error } = {};
  const supervisor = createWindowsAuthoritySupervisor({
    request(request) {
      requests.push(request);
      if (behavior.error !== undefined) {return Promise.reject(behavior.error);}
      if (request["action"] === "launch") {return Promise.resolve({ jobId: JOB, helperInstance: HELPER, root: ROOT });}
      if (request["action"] === "observe-launch-termination") {return Promise.resolve({
        jobId: JOB, helperInstance: HELPER, terminated: false, ...behavior.observation,
      });}
      if (request["action"] === "observe-application-window") {return Promise.resolve({
        jobId: JOB, helperInstance: HELPER, outcome: "available", hwnd: "12345", ...behavior.window,
      });}
      if (request["action"] === "begin-probe") {return Promise.resolve({
        schema: "easyeda-pro-control.windows-process-probe.v1", bindingSha256: INPUT.bindingSha256,
        port: 51_234, nonce: "9".repeat(64),
      });}
      if (request["action"] === "end-probe") {return Promise.resolve({ closed: true, bindingSha256: INPUT.bindingSha256 });}
      if (request["action"] === "capture" || request["action"] === "finish-probe") {return Promise.resolve({
        bindingSha256: INPUT.bindingSha256, jobId: JOB, helperInstance: HELPER,
        capturedAt: "2026-09-11T20:00:00.0000000Z", processes: [ROOT, RENDERER], runtimePid: 101, socketOwnerPid: null,
        ...behavior.capture,
      });}
      if (request["action"] === "prove-terminated") {return Promise.resolve({
        captureBindingSha256: INPUT.bindingSha256, jobId: JOB, helperInstance: HELPER,
        checkedAt: "2026-09-11T20:01:00.0000000Z", jobEmpty: true, retainedProcessesExited: true,
        ...behavior.termination,
      });}
      if (request["action"] === "release-capture") {return Promise.resolve({
        released: true, captureBindingSha256: INPUT.bindingSha256, helperInstance: HELPER, jobId: JOB, ...behavior.release,
      });}
      return Promise.resolve({ closeDispatched: true, jobId: JOB, saveOrDiscardSelected: false, ...behavior.close });
    },
    release: () => Promise.resolve(),
  }, policy);
  return { supervisor, requests, behavior };
}

function termination(evidence: ExecutionAuthorityEvidence): ExecutionAuthorityTerminationInput {
  return {
    bindingSha256: "3".repeat(64), operationId: INPUT.operationId, orphanPhase: INPUT.orphanPhase,
    challengeAttempt: INPUT.challengeAttempt,
    priorBridgeSession: INPUT.bridgeSession, priorRuntimeIdentity: INPUT.runtimeIdentity,
    priorExecutionAuthority: evidence,
    currentBridgeSession: { ...INPUT.bridgeSession, sessionId: "session-two", sequence: 2 },
    currentRuntimeIdentity: { ...INPUT.runtimeIdentity, generation: "renderer-generation-two", timeOrigin: 2000 },
  };
}

void test("capture requires supervised launch and a real authenticated process binding", async () => {
  const { supervisor, requests } = fixture();
  await assert.rejects(supervisor.capture(INPUT), /explicitly supervised/u);
  assert.equal(requests.length, 0);
  await supervisor.launch({ confirmLaunch: true });
  await assert.rejects(supervisor.capture({ ...INPUT, runtimeIdentity: { ...INPUT.runtimeIdentity, processId: null } }), /PID is unavailable/u);
  assert.equal(requests.length, 1);
});

void test("capture and termination bind retained generation, operation and policy hashes", async () => {
  const { supervisor } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  const { authoritySha256, ...payload } = evidence;
  assert.equal(authoritySha256, sha256Json(payload));
  assert.equal(evidence.processTreeSha256, sha256Json([ROOT, RENDERER]));
  const proof = await supervisor.proveTerminated(termination(evidence));
  assert.equal(proof.terminatedAuthoritySha256, authoritySha256);
  assert.equal(proof.policySha256, evidence.policySha256);
  assert.equal(proof.noPriorExecutionAuthorityRemains, true);
});

void test("capture rejects wrong renderer, reused root generation and duplicate process IDs", async () => {
  for (const capture of [
    { runtimePid: 102 },
    { processes: [{ ...ROOT, startIdentity: `win32:639247486999999999:job:${JOB}` }, RENDERER] },
    { processes: [ROOT, { ...RENDERER, pid: ROOT.pid }] },
  ]) {
    const { supervisor, behavior } = fixture();
    await supervisor.launch({ confirmLaunch: true });
    behavior.capture = capture;
    await assert.rejects(supervisor.capture(INPUT), /bind|duplicated/u);
  }
});

void test("socket fallback requires exact session-correlated Windows tuple", async () => {
  const socket = {
    bridgeSessionSha256: sha256Json(INPUT.bridgeSession), localAddress: "127.0.0.1", localPort: 50_100,
    remoteAddress: "127.0.0.1", remotePort: 49_621,
  };
  const { supervisor, behavior, requests } = fixture({ ...POLICY, resolveAuthenticatedSocket: () => Promise.resolve(socket) });
  await supervisor.launch({ confirmLaunch: true });
  behavior.capture = { runtimePid: null, socketOwnerPid: ROOT.pid, processes: [{ ...ROOT, role: "native-socket-owner" }] };
  const evidence = await supervisor.capture({ ...INPUT, runtimeIdentity: { ...INPUT.runtimeIdentity, processId: null } });
  assert.equal(evidence.processes.length, 1);
  assert.equal(requests.length, 2);
  socket.bridgeSessionSha256 = "0".repeat(64);
  await assert.rejects(supervisor.capture({ ...INPUT, bindingSha256: "4".repeat(64) }), /exact authenticated session/u);
  assert.equal(requests.length, 2);
});

void test("all captured PIDs exiting does not replace proof that the Job is empty", async () => {
  const { supervisor, behavior } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  behavior.termination = { jobEmpty: false, retainedProcessesExited: true };
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /entire retained Job/u);
  behavior.termination = { jobEmpty: true, retainedProcessesExited: false };
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /entire retained Job/u);
});

void test("leased native ownership probe binds null-PID runtimes and always closes its one-shot socket", async () => {
  const observed: unknown[] = [];
  const { supervisor, behavior, requests } = fixture({
    ...POLICY,
    performAuthenticatedProcessProbe(session, probe) {
      observed.push({ session, probe });
      return Promise.resolve();
    },
  });
  await supervisor.launch({ confirmLaunch: true });
  behavior.capture = { runtimePid: null, socketOwnerPid: ROOT.pid, processes: [{ ...ROOT, role: "native-socket-owner" }] };
  const input = { ...INPUT, runtimeIdentity: { ...INPUT.runtimeIdentity, processId: null } };
  const evidence = await supervisor.capture(input);
  assert.equal(observed.length, 1);
  assert.deepEqual(requests.map((request) => request["action"]), ["launch", "begin-probe", "finish-probe", "end-probe"]);
  assert.equal(JSON.stringify(evidence).includes("9".repeat(64)), false);

  const failure = fixture({ ...POLICY, performAuthenticatedProcessProbe: () => Promise.reject(new Error("private-renderer-message")) });
  await failure.supervisor.launch({ confirmLaunch: true });
  failure.behavior.capture = behavior.capture;
  await assert.rejects(failure.supervisor.capture(input), /did not complete and close/u);
  assert.equal(failure.requests.at(-1)?.["action"], "end-probe");
});

void test("changed capture, operation, helper or replacement session cannot clear authority", async () => {
  const { supervisor, behavior, requests } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  const input = termination(evidence);
  for (const changed of [
    { ...input, operationId: "another-operation" },
    { ...input, currentRuntimeIdentity: INPUT.runtimeIdentity },
    { ...input, priorExecutionAuthority: { ...evidence, processes: [ROOT] } },
    { ...input, currentBridgeSession: INPUT.bridgeSession },
  ]) {
    await assert.rejects(supervisor.proveTerminated(changed), /retained operation/u);
  }
  assert.equal(requests.length, 2);
  behavior.termination = { helperInstance: "f".repeat(32) };
  await assert.rejects(supervisor.proveTerminated(input), /entire retained Job/u);
});

void test("normal close dispatch does not claim closure or select save/discard; release loses proof", async () => {
  const { supervisor, requests } = fixture();
  const launch = await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  await supervisor.requestNormalClose({ confirmNormalClose: true, windowHandle: "12345", launch });
  assert.equal(requests[2]?.["action"], "normal-close");
  assert.equal(requests[2]?.["rootStartTicks"], "639247486000000000");
  assert.equal(requests[2]?.["helperInstance"], HELPER);
  assert.equal(requests[2]?.["rootPid"], ROOT.pid);
  assert.equal(requests[2]?.["rootStartIdentity"], ROOT.startIdentity);
  await assert.rejects(supervisor.requestNormalClose({ confirmNormalClose: true, windowHandle: "12345", launch }), /already has a normal-close attempt/u);
  await supervisor.release();
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /released/u);
  await assert.rejects(supervisor.launch({ confirmLaunch: true }), /released/u);
  assert.equal(requests.length, 3);
});

void test("generic close consumes concurrent and uncertain requests without a second dispatch", async () => {
  for (const close of [{ closeDispatched: false }, { jobId: "f".repeat(32) }, { saveOrDiscardSelected: true }, { unexpected: true }]) {
    const { supervisor, requests, behavior } = fixture();
    const launch = await supervisor.launch({ confirmLaunch: true });
    behavior.close = close;
    const input = { confirmNormalClose: true as const, windowHandle: "12345", launch };
    const first = supervisor.requestNormalClose(input), second = supervisor.requestNormalClose(input);
    await assert.rejects(second, /already has a normal-close attempt/u);
    await assert.rejects(first, /dispatch is unproven/u);
    await assert.rejects(supervisor.requestNormalClose(input), /already has a normal-close attempt/u);
    assert.equal(requests.filter((request) => request["action"] === "normal-close").length, 1);
  }
  const { supervisor, requests, behavior } = fixture();
  const launch = await supervisor.launch({ confirmLaunch: true });
  behavior.error = new Error("synthetic lost close acknowledgment");
  const input = { confirmNormalClose: true as const, windowHandle: "12345", launch };
  await assert.rejects(supervisor.requestNormalClose(input), /lost close acknowledgment/u);
  await assert.rejects(supervisor.requestNormalClose(input), /already has a normal-close attempt/u);
  assert.equal(requests.length, 2);
});

void test("generic close refuses changed input across source validation and keeps the attempt consumed", async () => {
  let changed = false;
  const { supervisor, requests } = fixture({ ...POLICY, revalidateClosedSessionHelper() {
    changed = true;
    return Promise.resolve();
  } });
  const launch = await supervisor.launch({ confirmLaunch: true });
  const input = { confirmNormalClose: true as const, windowHandle: "12345", launch };
  const pending = supervisor.requestNormalClose(input);
  assert.equal(changed, true);
  input.windowHandle = "54321";
  await assert.rejects(pending, /unchanged exact supervised/u);
  await assert.rejects(supervisor.requestNormalClose({ ...input, windowHandle: "12345" }), /already has a normal-close attempt/u);
  assert.equal(requests.length, 1);
});

void test("application window observation binds original owner, reports all outcomes, and withholds desktop text", async () => {
  const { supervisor, requests, behavior } = fixture();
  const observe = supervisor.observeApplicationWindow;
  assert.ok(observe);
  const unissued = { jobId: JOB, helperInstance: HELPER, root: ROOT };
  await assert.rejects(observe(unissued), /original supervised generation/u);
  const launch = await supervisor.launch({ confirmLaunch: true });
  await assert.rejects(observe({ ...launch, root: { ...ROOT, pid: 999 } }), /original supervised generation/u);
  assert.equal(requests.length, 1);
  for (const outcome of ["available", "unavailable", "ambiguous"]) {
    const hwnd = outcome === "available" ? "12345" : null;
    behavior.window = { outcome, hwnd };
    assert.deepEqual(await observe(launch), { jobId: JOB, helperInstance: HELPER, outcome, hwnd });
  }
  for (const window of [{ helperInstance: "f".repeat(32) }, { jobId: "f".repeat(32) }, { title: "private" },
    { outcome: "available", hwnd: null }, { outcome: "unavailable", hwnd: "12345" }, { hwnd: "0" }, { outcome: "unknown" }]) {
    behavior.window = window;
    await assert.rejects(observe(launch), /malformed or belongs to another owner/u);
  }
  assert.ok(requests.slice(1).every((request) => request["action"] === "observe-application-window" &&
    request["rootPid"] === ROOT.pid && request["rootStartIdentity"] === ROOT.startIdentity && request["helperInstance"] === HELPER));
  const pending = observe(launch);
  await supervisor.release();
  await assert.rejects(pending, /released/u);
});

void test("completed captures release handles once and neither old proof nor capture binding can be reopened", async () => {
  const { supervisor, requests } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  await assert.rejects(supervisor.releaseCapture({ ...evidence, bindingSha256: "0".repeat(64) }), /exact retained authority/u);
  assert.equal(requests.length, 2);
  await supervisor.releaseCapture(evidence);
  assert.equal(requests[2]?.["action"], "release-capture");
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /retained operation/u);
  await assert.rejects(supervisor.releaseCapture(evidence), /exact retained authority/u);
  await assert.rejects(supervisor.capture(INPUT), /already used/u);
  assert.equal(requests.length, 3);
});

void test("an uncertain release retires stale proof instead of reconstructing it", async () => {
  const { supervisor, requests, behavior } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  behavior.release = { released: false };
  await assert.rejects(supervisor.releaseCapture(evidence), /not proved/u);
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /retained operation/u);
  await assert.rejects(supervisor.capture(INPUT), /already used/u);
  assert.equal(requests.length, 3);
});

void test("fresh recovery nonce attempts retain exact original authority without permitting an older attempt", async () => {
  const { supervisor } = fixture();
  await supervisor.launch({ confirmLaunch: true });
  const evidence = await supervisor.capture(INPUT);
  const proof = await supervisor.proveTerminated({ ...termination(evidence), challengeAttempt: 2 });
  assert.equal(proof.ok, true);
  await assert.rejects(supervisor.proveTerminated({ ...termination(evidence), challengeAttempt: 0 }), /retained operation/u);
});

void test("launch termination observation binds retained root and Job without capture, close or replay", async () => {
  const { supervisor, behavior, requests } = fixture();
  const launch = await supervisor.launch({ confirmLaunch: true });
  const observe = supervisor.observeLaunchTermination;
  assert.ok(observe);
  assert.deepEqual(await observe(launch), { jobId: JOB, helperInstance: HELPER, terminated: false });
  behavior.observation = { terminated: true };
  assert.deepEqual(await observe(launch), { jobId: JOB, helperInstance: HELPER, terminated: true });
  assert.deepEqual(requests.slice(1), [0, 1].map(() => ({
    action: "observe-launch-termination", jobId: JOB, helperInstance: HELPER,
    rootPid: ROOT.pid, rootStartIdentity: ROOT.startIdentity,
  })));
});

void test("launch termination observation rejects mismatched owners and malformed replies without losing ownership", async () => {
  const { supervisor, behavior, requests } = fixture();
  const observe = supervisor.observeLaunchTermination;
  assert.ok(observe);
  const unissued = { jobId: JOB, helperInstance: HELPER, root: ROOT };
  await assert.rejects(observe(unissued), /original supervised generation/u);
  assert.equal(requests.length, 0);
  const launch = await supervisor.launch({ confirmLaunch: true });
  await assert.rejects(observe({ ...launch, root: { ...ROOT, pid: 999 } }), /original supervised generation/u);
  assert.equal(requests.length, 1);
  for (const observation of [{ helperInstance: "f".repeat(32) }, { terminated: "true" }, { unexpected: true }]) {
    behavior.observation = observation;
    await assert.rejects(observe(launch), /malformed or belongs to another owner/u);
  }
  behavior.observation = { terminated: true };
  const accepted = await observe(launch);
  assert.equal(accepted.terminated, true);
  assert.equal(requests.length, 5);
});

void test("launch termination observation rejects ownership loss across an await", async () => {
  const { supervisor, requests } = fixture();
  const launch = await supervisor.launch({ confirmLaunch: true });
  const observe = supervisor.observeLaunchTermination;
  assert.ok(observe);
  const pending = observe(launch);
  await supervisor.release();
  await assert.rejects(pending, /released/u);
  assert.equal(requests.length, 1);
});

void test("existing-app preflight needs no launch, accepts only Boolean output, and cannot acquire launch authority", async () => {
  const requests: Record<string, unknown>[] = [];
  let response: unknown = { running: true };
  const supervisor = createWindowsAuthoritySupervisor({
    request(input) { requests.push(input); return Promise.resolve(response); },
    release: () => Promise.resolve(),
  }, POLICY);
  const observe = supervisor.observeExistingApplication;
  assert.ok(observe);
  assert.deepEqual(await observe(), { running: true });
  response = { running: false };
  assert.deepEqual(await observe(), { running: false });
  response = { running: "false" };
  await assert.rejects(observe(), /malformed/u);
  assert.deepEqual(requests, [0, 1, 2].map(() => ({ action: "observe-existing-application", executable: POLICY.expectedExecutable })));
  await assert.rejects(supervisor.capture(INPUT), /explicitly supervised/u);
  await supervisor.release();
  await assert.rejects(observe(), /released/u);
  assert.equal(requests.length, 3);
});

void test("capability helper pin refuses mismatched repository bytes before spawning any Windows helper", async () => {
  const helperPath = fileURLToPath(new URL("../../scripts/windows-authority.ps1", import.meta.url));
  await assert.rejects(startWindowsAuthoritySupervisor({
    ...POLICY, helperPath,
    helperWindowsPath: "C:\\Synthetic\\windows-authority.ps1", powershellExecutable: "/nonexistent/powershell.exe",
    expectedHelperSha256: "0".repeat(64),
  }), /differs from the reviewed capability pin/u);
});

void test("fixed launch-time process refusal is conservative, after hashing and before Job creation", async () => {
  const source = await readFile(new URL("../../scripts/windows-authority.ps1", import.meta.url), "utf8");
  const start = source.indexOf("  if ($request.action -eq 'launch') {");
  const end = source.indexOf("  if ($request.action -eq 'observe-launch-termination') {", start);
  assert.ok(start > 0 && end > start);
  const launch = source.slice(start, end);
  const guard = launch.indexOf("authority-unsupervised-instance-present");
  assert.ok(guard > launch.indexOf("authority-executable-hash-mismatch") && guard < launch.indexOf("$job=New-Object"));
  assert.ok(launch.includes("GetProcessesByName('easyeda-pro')") && launch.includes("if (-not $process.HasExited) {throw 'authority-unsupervised-instance-present'}"));
  assert.ok(launch.includes("finally {foreach ($process in $existing) {$process.Dispose()}}"));
  assert.doesNotMatch(launch, /MainModule/u);
});

void test("native close rechecks the bounded unique original-root application before fixed WM_CLOSE", async () => {
  const source = await readFile(new URL("../../scripts/windows-authority.ps1", import.meta.url), "utf8");
  const read = source.slice(source.indexOf("  string ReadApplicationTitle("), source.indexOf("  public void Dispose()"));
  for (const guard of ["pid != Root.Id", "!IsWindowVisible(window)", "!IsWindowEnabled(window)", "IsIconic(window)",
    "GetAncestor(window, 2) != window", "GetAncestor(window, 3) != window", "GetWindow(window, 4) != IntPtr.Zero",
    "GetWindowLong(window, -20) & 0x80", '"Chrome_WidgetWin_1"', "width < 320", "height < 200", "width > 16384",
    "height > 16384", "length > 1024", "++owned > 64", "candidates > 1", "ReadApplicationTitle(window) == title"]) {
    assert.ok(read.includes(guard), guard);
  }
  const close = read.slice(read.indexOf("  public void NormalClose("));
  assert.ok(close.indexOf("normalCloseAttempted = true") < close.indexOf("ObserveApplicationWindow(expectedStartTicks)"));
  assert.ok(close.indexOf("ReadApplicationTitle(window) != title") < close.indexOf("PostMessage(window, 16, IntPtr.Zero, IntPtr.Zero)"));
  assert.doesNotMatch(read, /MainWindowHandle|GetProcessById|GetForegroundWindow|SetForegroundWindow|SendKeys/u);
  assert.match(source, /outcome=\$window\.outcome;hwnd=\$window\.hwnd/u);
});
