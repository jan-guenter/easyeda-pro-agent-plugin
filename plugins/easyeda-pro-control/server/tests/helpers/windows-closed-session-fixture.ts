import assert from "node:assert/strict";
import type { ExecutionAuthorityCaptureInput } from "../../src/engine.ts";
import { createWindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import type { ClosedSessionBinding, WindowsAuthorityPolicy, WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";

export const INPUT: ExecutionAuthorityCaptureInput = {
  bindingSha256: "1".repeat(64), challengeAttempt: 1, operationId: "synthetic-operation", orphanPhase: "closed-completion",
  bridgeSession: { sessionId: "synthetic-session", gatewayInstanceId: "synthetic-gateway", sequence: 1,
    authenticatedAtEpochMs: 1000, authenticationReceiptSha256: "2".repeat(64) },
  runtimeIdentity: { kind: "runtime-identity", generation: "synthetic-runtime", timeOrigin: 1000, processId: 101 },
};
type MutablePolicy = { -readonly [Key in keyof WindowsAuthorityPolicy]: WindowsAuthorityPolicy[Key] };
export interface ClosedSessionFixture {
  readonly supervisor: WindowsAuthoritySupervisor;
  readonly policy: MutablePolicy;
  readonly requests: Record<string, unknown>[];
  readonly behavior: {
    close: Record<string, unknown>; termination: Record<string, unknown>; released: Record<string, unknown>;
    helperLost: boolean; helperDrift: boolean; errorAction: string | undefined;
    afterRequest: ((action: string) => void) | undefined;
    onHelperCheck: (() => Promise<void>) | undefined;
  };
  capture: (input?: ExecutionAuthorityCaptureInput) => Promise<ClosedSessionBinding>;
}

/** Test-only injected transport. Never starts PowerShell, EasyEDA or a socket. */
export function closedSessionFixture(): ClosedSessionFixture {
  assert.match(process.env["EASYEDA_CONTROL_DATA_DIR"] ?? "", /easyeda-test-control-/u);
  const requests: Record<string, unknown>[] = [];
  const behavior: ClosedSessionFixture["behavior"] = {
    close: {}, termination: {}, released: {}, helperLost: false, helperDrift: false,
    errorAction: undefined, afterRequest: undefined, onHelperCheck: undefined,
  };
  const policy: MutablePolicy = {
    helperSha256: "c".repeat(64), expectedExecutable: "C:\\Synthetic\\easyeda-pro.exe",
    expectedExecutableSha256: "d".repeat(64), reviewedExecutionScopeSha256: "e".repeat(64),
    revalidateClosedSessionHelper() {
      if (behavior.helperDrift) { return Promise.reject(new Error("synthetic helper source drift")); }
      return behavior.onHelperCheck?.() ?? Promise.resolve();
    },
  };
  let generation = 0;
  let jobId = "";
  const helperInstance = "b".repeat(32);
  function processes(): { pid: number; role: string; startIdentity: string }[] {
    return [
      { pid: 100, role: "easyeda-main", startIdentity: `win32:63924748600000000${generation}:job:${jobId}` },
      { pid: 101, role: "renderer", startIdentity: `win32:63924748610000000${generation}:job:${jobId}` },
    ];
  }
  const supervisor = createWindowsAuthoritySupervisor({
    assertClosedSessionAvailable() {
      if (behavior.helperLost) { throw new Error("synthetic retained helper lost"); }
    },
    request(request) {
      requests.push(structuredClone(request));
      const action = String(request["action"]);
      if (behavior.helperLost || behavior.errorAction === action) { return Promise.reject(new Error("synthetic helper request refused")); }
      behavior.afterRequest?.(action);
      if (action === "launch") {
        generation += 1;
        jobId = generation.toString(16).padStart(32, "0");
        return Promise.resolve({ jobId, helperInstance, root: processes()[0] });
      }
      if (action === "capture") { return Promise.resolve({
        bindingSha256: request["bindingSha256"], jobId, helperInstance,
        capturedAt: "2026-10-12T00:00:00.0000000Z", processes: processes(), runtimePid: 101, socketOwnerPid: null,
      }); }
      if (action === "normal-close") { return Promise.resolve({
        closeDispatched: true, jobId, saveOrDiscardSelected: false, ...behavior.close,
      }); }
      if (action === "prove-terminated") { return Promise.resolve({
        captureBindingSha256: request["captureBindingSha256"], jobId: request["jobId"], helperInstance,
        checkedAt: "2026-10-12T01:00:00.0000000Z", jobEmpty: true, retainedProcessesExited: true, ...behavior.termination,
      }); }
      if (action === "release-capture") { return Promise.resolve({
        released: true, captureBindingSha256: request["captureBindingSha256"], jobId: request["jobId"], helperInstance, ...behavior.released,
      }); }
      return Promise.reject(new Error("Unexpected synthetic helper action"));
    },
    release() { behavior.helperLost = true; return Promise.resolve(); },
  }, policy);
  return { supervisor, policy, requests, behavior,
    async capture(input = INPUT) {
      const launch = await supervisor.launch({ confirmLaunch: true });
      const executionAuthority = await supervisor.capture(input);
      return { operationId: input.operationId, phase: input.orphanPhase, challengeAttempt: input.challengeAttempt,
        bridgeSession: input.bridgeSession, runtimeIdentity: input.runtimeIdentity, launch, executionAuthority };
    },
  };
}

export async function mintSyntheticClosedSessionProof(): Promise<{
  fixture: ClosedSessionFixture;
  proof: Awaited<ReturnType<WindowsAuthoritySupervisor["proveClosedSession"]>>;
}> {
  const fixture = closedSessionFixture();
  const binding = await fixture.capture();
  const intent = await fixture.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  return { fixture, proof };
}
