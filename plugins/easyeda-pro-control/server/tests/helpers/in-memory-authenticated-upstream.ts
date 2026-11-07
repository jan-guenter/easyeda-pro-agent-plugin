import assert from "node:assert/strict";
import { UpstreamEasyedaClient } from "../../src/upstream.ts";

/** Actual upstream scope/callTool methods with an in-memory client/gateway.
 * There is no socket, subprocess, control lease or native application. */
export function inMemoryAuthenticatedUpstream(result: unknown): { upstream: UpstreamEasyedaClient; calls: () => number } {
  let calls = 0;
  const binding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", begunAtEpochMs: 110,
    bindingReceipt: "B".repeat(43), gatewayInstanceId: "G".repeat(43), leaseId: "L".repeat(43), sessionId: "S".repeat(43), sessionSequence: 1 };
  const upstream = new UpstreamEasyedaClient();
  Object.defineProperties(upstream, {
    client: { value: { callTool: (): Promise<unknown> => { calls += 1; return Promise.resolve(result); } } },
    assertStartupAuthorityCurrent: { value: (): Promise<void> => Promise.resolve() },
    bridgeGateway: { value: {
      lifecycle: (): unknown => ({ gatewayInstanceId: binding.gatewayInstanceId, activeSession: { sessionId: binding.sessionId } }),
      beginDispatchLease: (): unknown => binding,
      assertDispatchLeaseForCall: (value: unknown): void => { assert.deepEqual(value, binding); },
      abortDispatchLease: (): void => {
        // Only the synthetic in-memory lease exists.
      },
      endDispatchLease: (): void => {
        // Only the synthetic in-memory lease exists.
      },
    } },
  });
  return { upstream, calls: (): number => calls };
}
