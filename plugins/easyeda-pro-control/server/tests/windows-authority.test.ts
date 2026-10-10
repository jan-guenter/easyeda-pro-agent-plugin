import assert from "node:assert/strict";
import { test } from "node:test";

import { sha256Json } from "../src/core.ts";
import type { ExecutionAuthorityCaptureInput, ExecutionAuthorityEvidence, ExecutionAuthorityTerminationInput } from "../src/engine.ts";
import { createWindowsAuthoritySupervisor } from "../src/windows-authority.ts";
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
  readonly behavior: { capture?: Record<string, unknown>; termination?: Record<string, unknown>; release?: Record<string, unknown>; error?: Error };
  readonly supervisor: WindowsAuthoritySupervisor;
} {
  const requests: Record<string, unknown>[] = [];
  const behavior: { capture?: Record<string, unknown>; termination?: Record<string, unknown>; release?: Record<string, unknown>; error?: Error } = {};
  const supervisor = createWindowsAuthoritySupervisor({
    request(request) {
      requests.push(request);
      if (behavior.error !== undefined) {return Promise.reject(behavior.error);}
      if (request["action"] === "launch") {return Promise.resolve({ jobId: JOB, helperInstance: HELPER, root: ROOT });}
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
      return Promise.resolve({ closeDispatched: true, jobId: JOB, saveOrDiscardSelected: false });
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
  await supervisor.release();
  await assert.rejects(supervisor.proveTerminated(termination(evidence)), /released/u);
  await assert.rejects(supervisor.launch({ confirmLaunch: true }), /released/u);
  assert.equal(requests.length, 3);
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
