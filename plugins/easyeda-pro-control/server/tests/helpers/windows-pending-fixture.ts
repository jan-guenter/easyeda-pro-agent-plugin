/** Synthetic child framing only; no registry injection or native process. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { clockSpawnFixture } from "./windows-clock-spawn-fixture.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";
import { startWindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import type { ClosedSessionBinding, ClosedSessionCloseIntent, ClosedSessionCloseReceipt, WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import { isRecord } from "../../src/core.ts";

interface PendingState {
  code: string | undefined; wrongId: boolean; malformed: boolean; afterResponse: (() => void) | undefined;
  remaining: number | undefined; pendingReplies: number;
  onFrame: ((action: string) => void) | undefined;
}
export async function qualifiedNativeFixture(context: TestContext, reviewedExecutionScopeSha256?: string): Promise<Awaited<ReturnType<typeof clockSpawnFixture>> & {
  supervisor: WindowsAuthoritySupervisor; state: PendingState;
}> {
  const fixture = await clockSpawnFixture(context, reviewedExecutionScopeSha256);
  const supervisor = await startWindowsAuthoritySupervisor(fixture.options);
  context.after(async (): Promise<void> => { await supervisor.release(); fixture.restore(); });
  const state: PendingState = { code: undefined, wrongId: false, malformed: false, afterResponse: undefined,
    remaining: undefined, pendingReplies: 0, onFrame: undefined };
  const write = fixture.child.stdout.write.bind(fixture.child.stdout);
  context.mock.method(fixture.child.stdout, "write", (chunk: unknown): boolean => {
    assert.equal(typeof chunk, "string"); assert.ok(typeof chunk === "string");
    const value: unknown = JSON.parse(chunk); assert.ok(isRecord(value));
    const request = fixture.requests.at(-1);
    state.onFrame?.(String(request?.["action"]));
    if (request?.["action"] === "clocked-prove-terminated" && state.code !== undefined && state.remaining !== 0) {
      state.pendingReplies += 1;
      if (state.remaining !== undefined) { state.remaining -= 1; }
      const frame = { id: state.wrongId ? "0".repeat(32) : value["id"], ok: false,
        error: state.malformed ? { code: state.code } : state.code };
      const result = write(`${JSON.stringify(frame)}\n`);
      state.afterResponse?.(); return result;
    }
    return write(chunk);
  });
  return { ...fixture, supervisor, state };
}

export async function pendingFixture(context: TestContext): Promise<Awaited<ReturnType<typeof qualifiedNativeFixture>> & {
  binding: ClosedSessionBinding;
  input: ClosedSessionBinding & { intent: ClosedSessionCloseIntent; closeReceipt: ClosedSessionCloseReceipt };
}> {
  const fixture = await qualifiedNativeFixture(context), { supervisor } = fixture;
  const launch = await supervisor.launch({ confirmLaunch: true });
  const executionAuthority = await supervisor.capture(INPUT);
  const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
    bridgeSession: structuredClone(INPUT.bridgeSession), runtimeIdentity: structuredClone(INPUT.runtimeIdentity), launch, executionAuthority };
  const intent = await supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  return { ...fixture, binding, input: { ...binding, intent, closeReceipt } };
}
