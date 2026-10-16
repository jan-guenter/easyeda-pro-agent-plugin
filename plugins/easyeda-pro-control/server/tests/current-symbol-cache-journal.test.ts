import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "../src/current-symbol-cache-journal.ts";
import type { AuthenticatedBridgeDispatchBinding, ClosedSessionAuthorityCapture, ExecutionAuthorityEvidence, TrackedDispatchOperationJournal } from "../src/engine.ts";
import type { WindowsAuthorityLaunch } from "../src/windows-authority.ts";

type Journal = TrackedDispatchOperationJournal;
const PHASE = "current-cache-observation", TIME = "2026-10-15T10:00:00.000Z";
function seal(value: Journal): Journal {
  const result = structuredClone(value); delete result["journalSha256"]; result["journalSha256"] = sha256Json(result); return result;
}
function fixture(): { before: Journal; marked: Journal; cleared: Journal; expected: Parameters<typeof assertCurrentSymbolCacheMark>[2] } {
  const jobId = "a".repeat(32);
  const launch: WindowsAuthorityLaunch = { jobId, helperInstance: "b".repeat(32), root: { pid: 100, role: "easyeda-main", startIdentity: `win32:134000000000000000:job:${jobId}` } };
  const session = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 2, authenticationReceiptSha256: "c".repeat(64), authenticatedAtEpochMs: 1000 };
  const runtime = { kind: "runtime-identity" as const, generation: "synthetic-current-renderer-identity", timeOrigin: 1001, processId: 101 };
  const bridgeDispatch: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: session.gatewayInstanceId,
    sessionId: session.sessionId, sessionSequence: session.sequence, begunAtEpochMs: 1002, leaseId: "l".repeat(43), bindingReceipt: "r".repeat(43) };
  const processes = [launch.root, { pid: 101, role: "renderer", startIdentity: `win32:134000000000000001:job:${jobId}` }];
  const evidence = (bindingSha256: string): ExecutionAuthorityEvidence => {
    const core = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256, policyId: "synthetic-policy",
      policySha256: "d".repeat(64), capturedAt: TIME, processes, processTreeSha256: sha256Json(processes) };
    return { ...core, authoritySha256: sha256Json(core) };
  };
  const before = seal({ schema: "synthetic-journal", operationId: "synthetic-cache-operation", journalPath: "/synthetic-only/journal.json",
    planHash: "e".repeat(64), plan: { profile: "synthetic-cache", target: "fixed", nullable: null }, state: "cache-dispatching", mutationState: "not-inferred",
    saved: false, reopened: false, orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: true, nextSafeAction: "Await one read",
    sequence: 8, updatedAt: TIME, artifacts: [], integrityModel: "Synthetic fixture, no authority", cacheAttempted: true,
    runtimeRestartChallengeAttempt: 2, orphanedCallReturnedAt: TIME, runtimeRestartBoundary: { old: true } });
  const capture: ClosedSessionAuthorityCapture = { operationId: before.operationId, phase: "closed-edit", challengeAttempt: 1,
    bridgeSession: session, runtimeIdentity: runtime, executionAuthority: evidence("f".repeat(64)) };
  const marked = structuredClone(before);
  Object.assign(marked, { runtimeIdentityBeforeOrphan: runtime, bridgeSessionBeforeOrphan: session, bridgeDispatchBeforeOrphan: bridgeDispatch,
    executionAuthorityBeforeOrphan: evidence(sha256Json({ schema: "easyeda-pro-control.execution-authority-binding.v1", operationId: before.operationId,
      orphanPhase: PHASE, challengeAttempt: 3, bridgeSession: session, bridgeDispatch, runtimeIdentity: runtime })),
    orphanedCallPossible: true, orphanedCallPhase: PHASE, orphanedCallMarkedAt: TIME, runtimeRestartChallengeAttempt: 3,
    runtimeRestartChallenge: `EASYEDA_RESTARTED_AND_RECONNECTED:${before.operationId}:${PHASE}:3:12345678-1234-4123-8123-123456789abc`,
    runtimeRestartChallengeIssuedAt: TIME });
  delete marked.orphanedCallReturnedAt; delete marked.runtimeRestartBoundary;
  const cleared = structuredClone(marked); cleared.orphanedCallPossible = false; cleared.orphanedCallReturnedAt = TIME;
  delete cleared.runtimeRestartChallenge; delete cleared.runtimeRestartChallengeIssuedAt;
  return { before, marked: seal(marked), cleared: seal(cleared), expected: { phase: PHASE, bridgeDispatch, capture, launch } };
}

void test("cache journal permits only the executor's exact sealed mark and clear, including same-millisecond timestamps", () => {
  const { before, marked, cleared, expected } = fixture();
  const snapshot = structuredClone({ before, marked, cleared, expected });
  assertCurrentSymbolCacheMark(before, marked, expected); assertCurrentSymbolCacheClear(marked, cleared, PHASE);
  assert.deepEqual({ before, marked, cleared, expected }, snapshot);
});

void test("cache mark admits the exact verification capture phase but not a baseline or invented phase", () => {
  const { before, marked, expected } = fixture();
  const verify = structuredClone(expected); Reflect.set(verify.capture, "phase", "closed-verification");
  assertCurrentSymbolCacheMark(before, marked, verify);
  for (const phase of ["closed-baseline", "closed-verify", "foreign"]) {
    const wrong = structuredClone(expected); Reflect.set(wrong.capture, "phase", phase);
    assert.throws(() => { assertCurrentSymbolCacheMark(before, marked, wrong); }, /selected capture/u);
  }
});

void test("cache mark refuses resealed unrelated changes and invalid transition fields", () => {
  const { before, marked, expected } = fixture();
  const faults: readonly ((value: Journal) => void)[] = [
    (value) => { value.plan["target"] = "foreign"; }, (value) => { value.plan["nullable"] = Number.NaN; },
    (value) => { value.sequence += 1; }, (value) => { value["foreign"] = true; },
    (value) => { value.runtimeRestartChallengeAttempt = 4; }, (value) => { value.orphanedCallPhase = "foreign"; },
    (value) => { value.runtimeRestartChallenge += "x"; }, (value) => { value.runtimeRestartBoundary = {}; },
    (value) => { value.orphanedCallReturnedAt = TIME; }, (value) => { value.orphanedCallMarkedAt = "2020-01-01T00:00:00.000Z"; },
    (value) => { value.runtimeRestartChallengeIssuedAt = "2026-02-30T10:00:00.000Z"; },
  ];
  for (const fault of faults) { const changed = structuredClone(marked); fault(changed); assert.throws(() => { assertCurrentSymbolCacheMark(before, seal(changed), expected); }); }
  const corrupt = structuredClone(marked); corrupt.updatedAt = "2026-10-15T10:00:01.000Z";
  assert.throws(() => { assertCurrentSymbolCacheMark(before, corrupt, expected); }, /self-seal/u);
});

void test("cache mark binds selected scope, session, runtime, recomputed authority and exact new root", () => {
  const { before, marked, expected } = fixture();
  for (const field of ["runtimeIdentityBeforeOrphan", "bridgeSessionBeforeOrphan", "bridgeDispatchBeforeOrphan", "executionAuthorityBeforeOrphan"] as const) {
    const changed = structuredClone(marked); Reflect.set(changed, field, {});
    assert.throws(() => { assertCurrentSymbolCacheMark(before, seal(changed), expected); });
  }
  const other = structuredClone(expected); Reflect.set(other.launch.root, "pid", 999);
  assert.throws(() => { assertCurrentSymbolCacheMark(before, marked, other); }, /root or Job/u);
  const wrongBinding = structuredClone(marked);
  const authority = wrongBinding.executionAuthorityBeforeOrphan;
  assert.ok(authority !== undefined); Reflect.set(authority, "bindingSha256", "f".repeat(64));
  const core: Record<string, unknown> = { ...authority }; delete core["authoritySha256"];
  Reflect.set(authority, "authoritySha256", sha256Json(core));
  assert.throws(() => { assertCurrentSymbolCacheMark(before, seal(wrongBinding), expected); }, /authority binding/u);
});

void test("cache clear preserves every non-clear key and refuses stale time, retained challenge or broken seals", () => {
  const { marked, cleared } = fixture();
  const faults: readonly ((value: Journal) => void)[] = [
    (value) => { value.orphanedCallPossible = true; }, (value) => { value.runtimeRestartChallenge = marked.runtimeRestartChallenge ?? "missing"; },
    (value) => { value.runtimeRestartChallengeIssuedAt = TIME; }, (value) => { value.orphanedCallPhase = "foreign"; },
    (value) => { value.runtimeRestartChallengeAttempt = 4; }, (value) => { value.orphanedCallMarkedAt = "2026-10-15T10:00:00.001Z"; },
    (value) => { value.nextSafeAction = "foreign"; }, (value) => { value.orphanedCallReturnedAt = "2020-01-01T00:00:00.000Z"; },
  ];
  for (const fault of faults) { const changed = structuredClone(cleared); fault(changed); assert.throws(() => { assertCurrentSymbolCacheClear(marked, seal(changed), PHASE); }); }
  const corrupt = structuredClone(cleared); corrupt["journalSha256"] = "0".repeat(64);
  assert.throws(() => { assertCurrentSymbolCacheClear(marked, corrupt, PHASE); }, /self-seal/u);
});
